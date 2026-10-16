"""Renderer regression checks using synthetic data only. Run python -m unittest discover -s tests."""
import base64
import io
import re
import time
from pathlib import Path
import sys
import unittest
import tempfile
import threading
from unittest.mock import patch
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from api.esta_report import generate_pdf, _prepare_generic_data, story_generic
from reportlab.platypus import KeepTogether, Table
from reporting.report_center import _prepare_photo
from reporting.pdf_common import ImageSlot
from reporting import pdf_common as pdfc


def photo(size):
    output = io.BytesIO()
    Image.new('RGB', size, '#edf4f8').save(output, 'PNG')
    return 'data:image/png;base64,' + base64.b64encode(output.getvalue()).decode()


def benchmark_photo(index, size=(1200, 1600)):
    """Deterministic phone-like JPEG with enough detail to exercise compression."""
    image = Image.new('RGB', size, (235, 229, 216))
    px = image.load()
    w, h = size
    for y in range(0, h, 24):
        tone = 45 + ((y // 24 + index * 7) % 160)
        for x in range(w):
            if y < h:
                px[x, y] = (tone, (tone * 3) % 255, (tone * 5) % 255)
    # Add high-contrast annotation-like marks.
    for d in range(20, min(w, h) - 20, 37):
        for off in range(5):
            x = min(w - 1, d + off)
            y = min(h - 1, d)
            px[x, y] = (210, 20, 30)
    out = io.BytesIO()
    image.save(out, 'JPEG', quality=92, optimize=True)
    return 'data:image/jpeg;base64,' + base64.b64encode(out.getvalue()).decode()


def operations():
    return {'report_type':'operations', 'building_id':'TEST', 'building':'DỰ ÁN KIỂM THỬ', 'prepared_by':'NGƯỜI KIỂM THỬ', 'kt_signer_name':'Kỹ thuật kiểm thử', 'kt_signature_data_url':photo((420,120)), 'range':{'from':'2026-09-01','to':'2026-09-30'}, 'sections':[{'id':'work','title':'Công việc','count':1,'columns':['Ngày','Nội dung','Loại','Trạng thái','Người thực hiện'],'rows':[['01/09/2026','Dữ liệu thử nghiệm','Hằng ngày',{'text':'Đã hoàn thành','tone':'good'},'Kiểm thử']]}]}


class ReportTests(unittest.TestCase):
    def test_image_cache_tracks_content_and_output_settings(self):
        def encoded(color):
            out = io.BytesIO()
            Image.new('RGB', (1200, 900), color).save(out, 'PNG')
            return out.getvalue()
        red, blue = encoded('red'), encoded('blue')
        a = pdfc.process_image_bytes(red, 'same-path-or-signer')
        b = pdfc.process_image_bytes(blue, 'same-path-or-signer')
        self.assertNotEqual(a.data, b.data)
        self.assertEqual(pdfc.process_image_bytes(red, 'different-url').data, a.data)
        small = pdfc.process_image_bytes(red, 'same-path-or-signer', max_px=450)
        self.assertEqual(max(a.width, a.height), 900)
        self.assertEqual(max(small.width, small.height), 450)
        self.assertNotEqual(pdfc.process_image_bytes(red, 'same-path-or-signer', quality=90).data, a.data)

    def test_fast_image_processing_preserves_orientation_and_transparency(self):
        image = Image.new('RGB', (4032, 3024), 'white')
        image.paste('red', (0, 0, 2016, 3024))
        exif = Image.Exif(); exif[274] = 6
        raw = io.BytesIO(); image.save(raw, 'JPEG', quality=90, exif=exif)
        prepared = pdfc.process_image_bytes(raw.getvalue(), 'phone-orientation')
        self.assertEqual((prepared.width, prepared.height), (675, 900))
        with Image.open(prepared.buffer()) as result:
            r, g, b = result.getpixel((300, 100))
            self.assertGreater(r, 240); self.assertLess(g, 15)
            self.assertTrue(all(v > 240 for v in result.getpixel((300, 800))))
        rgba = Image.new('RGBA', (600, 400), (0, 0, 0, 0))
        rgba.paste((240, 20, 20, 255), (200, 100, 400, 300))
        raw = io.BytesIO(); rgba.save(raw, 'PNG')
        prepared = pdfc.process_image_bytes(raw.getvalue(), 'annotation-transparency')
        with Image.open(prepared.buffer()) as result:
            self.assertEqual(result.mode, 'RGB')
            self.assertTrue(all(v > 245 for v in result.getpixel((10, 10))))
            self.assertGreater(result.getpixel((300, 200))[0], 220)

    def test_parallel_downloads_are_bounded_ordered_and_recheck_access(self):
        raw = base64.b64decode(photo((300, 500)).split(',', 1)[1])
        lock, barrier = threading.Lock(), threading.Barrier(8)
        active, peak, calls = 0, 0, []
        def download(source, token):
            nonlocal active, peak
            with lock:
                active += 1; peak = max(peak, active); calls.append(source)
            try:
                barrier.wait(timeout=5)
                return raw, '.png'
            finally:
                with lock: active -= 1
        items = [{'source': f'photo-{i}', 'caption': f'Hình {i}'} for i in range(16)]
        items.append(dict(items[0], caption='Ảnh dùng lại'))
        prepared, missing = pdfc.prepare_remote_images(items, 'authorized', download, workers=99)
        self.assertEqual((peak, len(calls), missing), (8, 16, 0))
        self.assertEqual([x['caption'] for x in prepared], [x['caption'] for x in items])
        self.assertTrue(all(x['prepared'] for x in prepared))
        # A warm processed-image cache must never skip the next download's
        # authorization or conceal a missing/inaccessible source.
        with patch.object(pdfc, 'prepare_downloaded_image', wraps=pdfc.prepare_downloaded_image):
            def denied(source, token):
                raise PermissionError('Access denied')
            prepared, missing = pdfc.prepare_remote_images(items, 'denied', denied)
        self.assertEqual(missing, len(items))
        self.assertTrue(all(x['prepared'] is None for x in prepared))

    def test_photo_captions_wrap_without_clipping_or_overlap(self):
        # Images in a 3-column row must wrap Vietnamese captions inside their
        # own allocated cell instead of painting over the next photo.
        source = '68 PĐL · Điện lưới EVN bị mất đột ngột vào lúc 22h45. '
        caption = source * 8
        slot = ImageSlot(width=145, height=90, caption=caption)
        self.assertEqual(slot.caption, caption)
        self.assertGreater(slot.CAPTION_H, 40)
        self.assertEqual(slot.wrap(145, 800), (145, 90 + slot.CAPTION_H))
        self.assertLessEqual(slot._caption_paragraph.width, 141)
        self.assertGreaterEqual(slot.CAPTION_H - slot._caption_paragraph.height, 5)
        long_word = 'X' * 350
        unbroken = ImageSlot(width=145, height=90, caption=long_word)
        self.assertEqual(unbroken.caption, long_word)
        self.assertGreater(unbroken.CAPTION_H, 15)
        # The row uses the highest caption without moving images out of cells.
        valid = [{'prepared': pdfc.ProcessedImage(b'a', 50, 50), 'caption': text}
                 for text in (caption, 'Hình 2', long_word)]
        row = pdfc.image_grid(valid, cols=3)[0]
        self.assertEqual(len(row._cellvalues[0]), 5)
        self.assertLessEqual(sum(row._colWidths), pdfc.CW + 0.01)

    def test_work_many_photos_paginate_without_losing_or_cropping_images(self):
        # Production failure: 18 photos in one work item formed a 934pt cell
        # that could not fit the 725pt A4 frame. Cover every project and a
        # partial final row as well as several full pages of photos.
        portrait, landscape = photo((300, 500)), photo((600, 300))
        original_draw = ImageSlot.draw
        for building in ('62 Trần Huy Liệu', '68 Phan Đăng Lưu', '127 Hồng Hà', '130 Hồng Hà'):
            for image_count in (3, 4, 18, 40):
                with self.subTest(building=building, images=image_count):
                    drawn = []
                    def record_draw(slot):
                        x, y = slot.canv.absolutePosition(0, 0)
                        drawn.append((slot.caption, slot.canv.getPageNumber(), x, y, slot.width, slot.height + slot.CAPTION_H))
                        original_draw(slot)
                    captions = [f'Hình kiểm thử {i + 1:02d}' for i in range(image_count)]
                    payload = {
                        'report_type': 'work', 'building': building,
                        'report_date': '11/10/2026', 'kt_signer_name': 'Kỹ thuật kiểm thử',
                        'tasks': [{'title': 'Kiểm tra hệ thống kỹ thuật', 'status': 'Hoàn thành',
                                   'images': [{'path': portrait if i % 2 else landscape, 'caption': caption}
                                              for i, caption in enumerate(captions)]}],
                    }
                    with patch.object(ImageSlot, 'draw', record_draw):
                        raw, missing, count = generate_pdf(payload, '')
                    self.assertTrue(raw.startswith(b'%PDF'))
                    self.assertEqual((missing, count), (0, 1))
                    self.assertEqual([r[0] for r in drawn], captions)
                    rows = {}
                    for caption, page, x, y, width, height in drawn:
                        self.assertGreaterEqual(x, 50)
                        self.assertLessEqual(x + width, 545)
                        self.assertGreaterEqual(y, 59)
                        self.assertLessEqual(y + height, 786)
                        rows[(page, round(y, 1))] = rows.get((page, round(y, 1)), 0) + 1
                    self.assertLessEqual(max(rows.values()), 3)

    def test_long_cells_in_work_energy_tools_and_admin_reports(self):
        long_text = 'Nội dung và kết quả kiểm tra kỹ thuật có dấu tiếng Việt. ' * 180
        samples = [
            {'report_type': 'work', 'tasks': [{'title': long_text, 'note': long_text, 'status': 'Hoàn thành'}]},
            {'report_type': 'energy', 'rows': [{'date': '2026-10-11', 'value': 100, 'note': long_text}]},
            {'report_type': 'tools', 'tools': [{'name': 'Đồng hồ đo', 'note': long_text}]},
            {'report_type': 'generic', 'title': 'BÁO CÁO CÔNG VIỆC ADMIN GIAO',
             'columns': [{'label': 'STT'}, {'label': 'Nội dung'}, {'label': 'KQ / Ghi chú'}],
             'rows': [['1', long_text, long_text]]},
        ]
        for payload in samples:
            with self.subTest(report_type=payload['report_type']):
                payload.update(building='DỰ ÁN KIỂM THỬ', report_date='11/10/2026', kt_signer_name='Kỹ thuật kiểm thử')
                raw, missing, count = generate_pdf(payload, '')
                self.assertTrue(raw.startswith(b'%PDF'))
                self.assertEqual((missing, count), (0, 1))

    def test_operations_vector_pdf(self):
        raw, missing, count = generate_pdf(operations(), '')
        self.assertTrue(raw.startswith(b'%PDF'))
        self.assertGreater(len(raw), 10000)
        self.assertEqual((missing, count), (0, 1))

    def test_portrait_landscape_and_missing_image(self):
        for layout in ('auto','1','2'):
            payload = operations()
            payload['photo_layout'] = layout
            payload['photos'] = [{'ref':photo((300,500)),'caption':'Ảnh đứng kiểm thử'},{'ref':photo((300,500)),'caption':'Ảnh đứng kiểm thử 2'},{'ref':photo((900,400)),'caption':'Ảnh ngang kiểm thử'},{'ref':'storage:OTHER/not-allowed.jpg','caption':'Ảnh không thuộc dự án'}]
            raw, missing, count = generate_pdf(payload, '')
            self.assertTrue(raw.startswith(b'%PDF')); self.assertEqual(missing, 1)

    def test_current_encoded_storage_project_path_is_accepted(self):
        building_id = '68PĐL'
        encoded = 'b-' + ''.join(f'{b:02x}' for b in building_id.encode('utf-8'))
        image_bytes = base64.b64decode(photo((300,500)).split(',',1)[1])
        def downloader(source, token):
            return image_bytes, '.png'
        with tempfile.TemporaryDirectory() as td:
            item = _prepare_photo(
                (0, {'ref':'storage:' + encoded + '/work/1/a.jpg', 'caption':'Ảnh hợp lệ'}),
                {'building_id':building_id}, '', td, downloader
            )
        self.assertFalse(item['missing'])

    def test_empty_selected_period_exports_without_invented_records(self):
        payload = operations()
        payload['sections'][0].update(rows=[], count=0)
        payload['counts'] = {'records':0, 'tasks':0, 'done':0}
        payload['health'] = [{'label':'Công việc','text':'Chưa có dữ liệu','tone':'muted'}]
        raw, missing, count = generate_pdf(payload, '')
        self.assertTrue(raw.startswith(b'%PDF'))
        self.assertEqual((missing, count), (0, 0))

    def test_long_vietnamese_cells_and_notes(self):
        payload = operations()
        payload['sections'][0]['rows'][0][1] = 'Nội dung thử nghiệm có dấu tiếng Việt. ' * 300
        payload['notes'] = [{'source':'KIỂM THỬ','text':'Ghi chú thử nghiệm. ' * 500}]
        raw, _, _ = generate_pdf(payload, '')
        self.assertTrue(raw.startswith(b'%PDF'))

    def test_signature_image_is_optional(self):
        payload = operations()
        payload.pop('kt_signature_data_url')
        raw, _, _ = generate_pdf(payload, '')
        self.assertTrue(raw.startswith(b'%PDF'))

    def test_signer_full_name_is_required(self):
        payload = operations()
        payload['kt_signer_name'] = ''
        payload.pop('kt_signature_data_url', None)
        with self.assertRaisesRegex(ValueError, 'họ và tên'):
            generate_pdf(payload, '')

    def test_invalid_column_count_is_rejected(self):
        payload = operations(); payload['sections'][0]['rows'][0] = ['Thiếu cột']
        with self.assertRaises(ValueError): generate_pdf(payload, '')

    def test_compact_16_tasks_21_images_benchmark(self):
        images = [benchmark_photo(i, (1200, 1600) if i % 3 else (1600, 1000)) for i in range(21)]
        tasks = []
        cursor = 0
        # 5 tasks x2 images + 11 tasks x1 image = 21 images / 16 tasks.
        for i in range(16):
            take = 2 if i < 5 else 1
            refs = images[cursor:cursor + take]
            cursor += take
            tasks.append({
                'title': f'Công việc kiểm thử số {i + 1}',
                'type': 'Sự cố' if i % 5 == 0 else 'Hằng ngày',
                'status': ('Hoàn thành', 'Đang thực hiện', 'Chờ xử lý')[i % 3],
                'date': f'{(i % 28) + 1:02d}/09/2026',
                'assignee': 'Kỹ thuật kiểm thử',
                'note': 'Kiểm tra hiện trường và xác nhận tình trạng.',
                'images': [{'path': ref, 'caption': f'Hình {j + 1}'} for j, ref in enumerate(refs)],
            })
        payload = {
            'report_type': 'work',
            'building': 'DỰ ÁN KIỂM THỬ',
            'report_date': '30/09/2026',
            'kt_signer_name': 'Kỹ thuật kiểm thử',
            'tasks': tasks,
        }
        started = time.perf_counter()
        raw, missing, count = generate_pdf(payload, '')
        elapsed = time.perf_counter() - started
        pages = len(re.findall(rb'/Type\s*/Page\b', raw))
        size_mb = len(raw) / (1024 * 1024)
        print(f'PDF_BENCHMARK tasks={count} images=21 pages={pages} size_mb={size_mb:.2f} seconds={elapsed:.2f}')
        self.assertEqual(missing, 0)
        self.assertEqual(count, 16)
        self.assertLessEqual(pages, 8)
        self.assertLess(size_mb, 2.0)
        self.assertLess(elapsed, 20.0)

    def test_generic_and_energy_images_use_shared_pipeline(self):
        img = photo((1200, 1600))
        generic = {
            'report_type':'generic',
            'building':'DỰ ÁN KIỂM THỬ',
            'report_date':'01/09/2026',
            'period_label':'THÁNG 09/2026',
            'title':'BÁO CÁO SỰ CỐ & DEFECT',
            'section_label':'SỰ CỐ / DEFECT',
            'table_label':'DANH SÁCH SỰ CỐ',
            'columns':[{'label':'Mã','weight':1},{'label':'Trạng thái','weight':1.2}],
            'rows':[['SC-01','Đang xử lý']],
            'photos':[{'ref':img,'caption':'Hình 1'},{'ref':img,'caption':'Hình 2'}],
            'kt_signer_name':'Kỹ thuật kiểm thử',
        }
        raw, missing, count = generate_pdf(generic, '')
        self.assertTrue(raw.startswith(b'%PDF'))
        self.assertEqual((missing, count), (0, 1))

        energy = {
            'report_type':'energy',
            'building':'DỰ ÁN KIỂM THỬ',
            'report_date':'01/09/2026',
            'energy_name':'Điện',
            'unit':'kWh',
            'rows':[{
                'date':'2026-09-01','date_display':'01/09/2026','value':100,
                'diff':10,'performer':'Kiểm thử','note':'Có ảnh','image':img,
            }],
            'kt_signer_name':'Kỹ thuật kiểm thử',
        }
        raw, missing, count = generate_pdf(energy, '')
        self.assertTrue(raw.startswith(b'%PDF'))
        self.assertEqual((missing, count), (0, 1))

    def test_admin_assigned_work_uses_esta_template(self):
        # Same seven-column payload produced by the Admin task selection UI.
        payload = {
            'report_type': 'generic',
            'building': '',
            'hide_building': True,
            'title': 'BÁO CÁO CÔNG VIỆC',
            'section_label': 'THEO DÕI CÔNG VIỆC GIÁM SÁT KỸ THUẬT',
            'table_label': 'DANH SÁCH CÔNG VIỆC ĐÃ CHỌN',
            'report_date': '10/10/2026',
            'period_label': 'TỪ 05/10/2026 ĐẾN 10/10/2026',
            'subtitle': 'Phạm vi: 62 THL · Cá nhân · Văn · 2 công việc',
            'kt_signer_name': 'Sĩ Văn',
            'signature_position': 'supervision',
            'columns': [
                {'label': 'STT', 'weight': .35},
                {'label': 'Dự án / Nguồn', 'weight': .95},
                {'label': 'Nội dung công việc', 'weight': 2.8},
                {'label': 'Ngày / Hạn', 'weight': 1.05},
                {'label': 'Trạng thái / Mức độ', 'weight': 1.18},
                {'label': 'Người thực hiện', 'weight': 1.15},
                {'label': 'KQ / Ghi chú', 'weight': 2.1},
            ],
            'rows': [
                ['1', '62 THL', 'Kiểm tra, bảo trì máy lạnh tầng 4',
                 '05/10/2026 · Hạn 10/10/2026', 'Hoàn thành · Cao',
                 'Kỹ thuật dự án', 'KQ: Đã xử lý, kiểm tra ổn định. ' * 12],
                ['2', 'Cá nhân · Văn', 'Tổng hợp nhật ký công việc hằng ngày',
                 '10/10/2026 · Hạn 10/10/2026', 'Hoàn thành · Trung bình',
                 'Văn', 'Ghi chú: Đã báo cáo quản lý'],
            ],
            'summaries': [
                {'label': 'TỔNG CÔNG VIỆC', 'value': '2', 'dark': True},
                {'label': 'HOÀN THÀNH', 'value': '2'},
                {'label': 'ĐANG THỰC HIỆN', 'value': '0'},
                {'label': 'CHỜ XỬ LÝ', 'value': '0'},
            ],
            'photos': [{'ref': photo((640, 480)), 'caption': '62 THL · Ảnh xác nhận'}],
        }
        with tempfile.TemporaryDirectory() as tmp:
            prepared = _prepare_generic_data({**payload, 'photos': []}, '', tmp)
            self.assertEqual(prepared['building'], '')
            self.assertTrue(prepared['hide_building'])
            self.assertEqual(prepared['signature_position'], 'supervision')
            signature = next(x for x in story_generic(prepared)
                             if isinstance(x, KeepTogether))
            signature_table = next(x for x in signature._content if isinstance(x, Table))
            self.assertEqual(signature_table._cellvalues[0][1].text, 'GIÁM SÁT KỸ THUẬT')
            self.assertEqual(signature_table._cellvalues[2][1].text, 'Sĩ Văn')
            self.assertEqual(signature_table._cellvalues[2][0], '')
            metadata = next(x for x in story_generic(prepared) if isinstance(x, Table) and len(x._cellvalues) == 2)
            self.assertEqual(metadata._cellvalues[0][0].text, 'HẠNG MỤC')
            self.assertEqual(metadata._cellvalues[0][1].text, 'THEO DÕI CÔNG VIỆC GIÁM SÁT KỸ THUẬT')
            self.assertEqual(metadata._cellvalues[1][0].text, 'NGÀY BÁO CÁO')
            self.assertEqual(metadata._cellvalues[1][2].text, 'KỲ BÁO CÁO')
            old_layout = {**prepared, 'hide_building': False, 'building': '62 THL'}
            old_meta = next(x for x in story_generic(old_layout) if isinstance(x, Table) and len(x._cellvalues) == 2)
            self.assertEqual(old_meta._cellvalues[0][0].text, 'TÒA NHÀ')
        raw, missing, count = generate_pdf(payload, '')
        self.assertTrue(raw.startswith(b'%PDF'))
        self.assertEqual((missing, count), (0, 2))
        self.assertGreater(len(raw), 8000)

    def test_admin_compact_supervision_report_keeps_source_and_signature(self):
        """Admin PDF is compact without inventing project summary or deleting work."""
        payload = {
            'report_type': 'generic',
            'hide_building': True,
            'building': '',
            'title': 'BÁO CÁO GIÁM SÁT KỸ THUẬT',
            'table_label': 'DANH SÁCH CÔNG VIỆC',
            'report_date': '16/10/2026',
            'period_label': 'Từ 12/10/2026 đến 18/10/2026',
            'signature_position': 'supervision',
            'kt_signer_name': 'Sĩ Văn',
            'columns': [
                {'label': 'STT', 'weight': .45},
                {'label': 'Dự án', 'weight': .90},
                {'label': 'Nội dung công việc', 'weight': 3.45},
                {'label': 'Ngày / Hạn', 'weight': 1.30},
                {'label': 'Tình trạng', 'weight': 1.42},
                {'label': 'Phụ trách / Ghi chú', 'weight': 2.25},
            ],
            'rows': [
                ['1', '62 THL', 'Chống thấm sàn mái', '12/10/2026',
                 'Đang thực hiện', 'Nhà thầu Thành Đạt · Khảo sát tình trạng'],
                ['2', '68 PĐL', 'Kiểm tra FCU chảy nước tầng 17',
                 '15/10/2026', 'Hoàn thành', 'Tiền, Vũ'],
            ],
            'priority_items': [
                {'project': '62 THL', 'title': 'Chống thấm sàn mái',
                 'status': 'Đang thực hiện', 'owner': 'Nhà thầu Thành Đạt',
                 'due': '—'}
            ],
            'summaries': [
                {'label': 'TỔNG BẢN GHI', 'value': '2'},
                {'label': 'QUÁ HẠN', 'value': '0'},
                {'label': 'CẦN XỬ LÝ', 'value': '1'},
                {'label': 'KẾ HOẠCH CHƯA ĐẾN HẠN', 'value': '0'},
            ],
            'photos': [
                {'ref': photo((640, 960)), 'caption': '62 THL · Chống thấm sàn mái'},
                {'ref': photo((960, 640)), 'caption': '68 PĐL · Kiểm tra FCU'},
            ],
        }
        with tempfile.TemporaryDirectory() as tmp:
            prepared = _prepare_generic_data({**payload, 'photos': []}, '', tmp)
            flowables = story_generic(prepared)
            table = next(x for x in flowables if isinstance(x, Table)
                         and len(x._cellvalues) == 3
                         and len(x._cellvalues[0]) == 6)
            self.assertEqual(table._cellvalues[1][1].text, '62 THL')
            self.assertEqual(table._cellvalues[2][1].text, '68 PĐL')
            self.assertFalse(any(getattr(x, 'text', '') == 'TỔNG HỢP THEO DỰ ÁN'
                                 for x in flowables))
            signature = next(x for x in flowables if isinstance(x, KeepTogether))
            sig_table = next(x for x in signature._content if isinstance(x, Table))
            self.assertEqual(sig_table._cellvalues[2][1].text, 'Sĩ Văn')
        raw, missing, count = generate_pdf(payload, '')
        self.assertTrue(raw.startswith(b'%PDF'))
        self.assertEqual((missing, count), (0, 2))

    def test_admin_status_images_show_actual_work_state(self):
        from reporting.admin_compact import StatusImageSlot, photo_state, status_photo_grid
        finished = photo_state("done")
        in_progress = photo_state("progress")
        unknown = photo_state("invalid-or-missing")
        self.assertEqual(finished[1], "Hoàn thành")
        self.assertEqual(in_progress[1], "Đang thực hiện")
        self.assertEqual(unknown[0:2], ("unknown", "Chưa cập nhật"))
        self.assertNotEqual(finished[2], in_progress[2])
        base = {
            "report_type": "generic", "hide_building": True,
            "title": "BÁO CÁO GIÁM SÁT KỸ THUẬT",
            "kt_signer_name": "Sĩ Văn", "signature_position": "supervision",
            "columns": [
                {"label": "STT"}, {"label": "Dự án"}, {"label": "Nội dung công việc"},
                {"label": "Ngày"}, {"label": "Trạng thái"}, {"label": "Phụ trách / Ghi chú"}
            ],
            "rows": [
                ["1", "68 PĐL", "Xử lý bồn rửa", "16/10/2026", "Hoàn thành", "Vũ"],
                ["2", "62 THL", "Đóng trần thạch cao", "16/10/2026", "Đang thực hiện", "Thành Đạt"]
            ],
            "photos": [
                {"ref": photo((640, 480)), "caption": "68 PĐL · Xử lý bồn rửa",
                 "status_code": "done", "status_label": "Hoàn thành"},
                {"ref": photo((480, 640)), "caption": "62 THL · Đóng trần",
                 "status_code": "progress", "status_label": "Đang thực hiện"}
            ]
        }
        with tempfile.TemporaryDirectory() as tmp:
            prepared = _prepare_generic_data(base, "", tmp)
            self.assertEqual([p["status_code"] for p in prepared["photos"]],
                             ["done", "progress"])
            photo_rows = status_photo_grid(prepared["photos"], pdfc.CW)
            self.assertEqual(len(photo_rows), 1)
            slots = [x for x in photo_rows[0]._cellvalues[0] if isinstance(x, StatusImageSlot)]
            self.assertEqual([x.status_label for x in slots],
                             ["Hoàn thành", "Đang thực hiện"])
            self.assertNotEqual(slots[0].status_color, slots[1].status_color)
        raw, missing, count = generate_pdf(base, "")
        self.assertTrue(raw.startswith(b"%PDF"))
        self.assertEqual((missing, count), (0, 2))

    def test_admin_pdf_typography_is_compact(self):
        """Only Admin summary PDF uses these smaller A4 text sizes."""
        from reporting.admin_compact import StatusImageSlot, story as compact_story
        from reporting.pdf_common import ProcessedImage
        slot = StatusImageSlot(220, 140, caption="68 PĐL · Kiểm tra bơm PCCC",
                               status_code="done")
        self.assertLess(slot.BADGE_FONT_SIZE, 7)
        self.assertLess(slot._caption_paragraph.style.fontSize, 6.6)
        self.assertLess(slot.BADGE_HEIGHT, 15)
        payload = {
            "title": "BÁO CÁO GIÁM SÁT KỸ THUẬT",
            "report_date": "16/10/2026", "period_label": "Tuần 42",
            "summaries": [{"value": "2", "label": "TỔNG BẢN GHI"}],
            "columns": [{"label": x} for x in
                ("STT", "Dự án", "Nội dung", "Ngày", "Trạng thái", "Ghi chú")],
            "rows": [["1", "68 PĐL", "Kiểm tra", "16/10", "Hoàn thành", "Vũ"]],
        }
        out = compact_story(payload)
        self.assertLess(out[0].style.fontSize, 18)
        tables = [x for x in out if isinstance(x, Table)]
        self.assertTrue(any(row[0].style.fontSize < 7.2
                            for t in tables for row in t._cellvalues[1:]
                            if isinstance(row[0], type(out[0]))))

    def test_original_work_energy_tools_renderers(self):
        samples = [
            {'report_type':'work','tasks':[{'title':'Dữ liệu thử','status':'Hoàn thành','date':'01/09/2026','assignee':'Kiểm thử'}]},
            {'report_type':'energy','energy_name':'Điện','unit':'kWh','dual_meter':True,'rows':[{'date':'2026-09-01','value':100,'value2':200,'diff':10,'diff2':20,'total_diff':30}]},
            {'report_type':'tools','tools':[{'name':'Dụng cụ thử','qty':1,'unit':'Bộ','condition_status':'Tốt'}]},
        ]
        for payload in samples:
            payload.update(building='DỰ ÁN KIỂM THỬ', report_date='01/09/2026', kt_signer_name='Kỹ thuật kiểm thử', kt_signature_data_url=photo((420,120)))
            raw, _, count = generate_pdf(payload, '')
            self.assertTrue(raw.startswith(b'%PDF')); self.assertEqual(count, 1)


if __name__ == '__main__':
    unittest.main()
