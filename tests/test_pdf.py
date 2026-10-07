"""Renderer regression checks using synthetic data only. Run python -m unittest discover -s tests."""
import base64
import io
import re
import time
from pathlib import Path
import sys
import unittest
import tempfile
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from api.esta_report import generate_pdf
from reporting.report_center import _prepare_photo


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
