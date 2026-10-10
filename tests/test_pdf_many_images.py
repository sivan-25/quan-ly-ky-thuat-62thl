"""Actual ESTA PDF render + local HTTP POST regression. Never contacts Supabase."""
import base64
import io
import json
import os
import sys
import tempfile
import threading
import unittest
from http.server import ThreadingHTTPServer
from pathlib import Path
from unittest.mock import patch
from urllib import request, error

from PIL import Image as PILImage

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from api.esta_report import generate_pdf, handler
from reporting import pdf_common as pdfc

ARTIFACT_DIR = os.environ.get("ESTA_PDF_EVIDENCE_DIR", "").strip()
PREVIEW = os.environ.get("ESTA_PDF_EVIDENCE", "") == "1"

def image_data_url(i, landscape=False):
    size = (390 + i * 3, 230 + i * 2) if landscape else (230 + i * 2, 390 + i * 3)
    im = PILImage.new("RGB", size, (230 - (i*9)%120, 218 - (i*7)%110, 190 + (i*3)%50))
    output = io.BytesIO()
    im.save(output, format="JPEG", quality=83)
    return "data:image/jpeg;base64," + base64.b64encode(output.getvalue()).decode("ascii")

def work_payload(photo_count):
    return {
        "report_type": "work",
        "building": "127 Hồng Hà — DỮ LIỆU GIẢ LẬP",
        "report_date": "10/10/2026",
        "kt_signer_name": "Kỹ thuật kiểm thử",
        "tasks": [{
            "title": "Kiểm tra hệ thống và ảnh hiện trường (" + str(photo_count) + " ảnh)",
            "type": "Hằng ngày", "status": "Hoàn thành",
            "date": "10/10/2026", "assignee": "Kỹ thuật kiểm thử",
            "note": "KQ: đã kiểm tra, hoạt động bình thường.",
            "images": [{"path": image_data_url(i, i%4 == 0), "caption": f"Hình {i+1:02d}"}
                       for i in range(photo_count)]
        }]
    }

def sample_generic():
    return {
        "report_type": "generic", "building": "TỔNG QUAN ADMIN",
        "report_date": "10/10/2026", "kt_signer_name": "Kỹ thuật kiểm thử",
        "title": "BÁO CÁO CÔNG VIỆC ADMIN GIAO",
        "columns": [{"label": "STT", "weight": .5}, {"label": "Nội dung", "weight": 3}],
        "rows": [["1", "Kiểm tra kỹ thuật"], ["2", "Công việc thực hiện"]],
        "photos": [{"ref": image_data_url(i), "caption": f"Admin - ảnh {i+1}"}
                   for i in range(12)]
    }

def sample_operations():
    return {
        "report_type": "operations", "building": "62 THL",
        "building_id": "TEST", "kt_signer_name": "Kỹ thuật kiểm thử",
        "report_date": "10/10/2026", "photo_layout": "auto",
        "sections": [{
            "id": "work", "title": "Công việc", "count": 1,
            "columns": ["Ngày", "Nội dung", "Loại", "Trạng thái", "Người"],
            "rows": [["10/10", "Kiểm tra máy bơm", "Hằng ngày", "Hoàn thành", "Kỹ thuật"]]
        }],
        "photos": [{"ref": image_data_url(i), "caption": f"Vận hành {i+1}"} for i in range(12)]
    }

def assert_pdf(test_case, pdf, label, images_min=0):
    test_case.assertTrue(pdf.startswith(b"%PDF-"), label)
    test_case.assertGreater(len(pdf), 5000, label)
    from pypdf import PdfReader
    r = PdfReader(io.BytesIO(pdf), strict=True)
    test_case.assertGreaterEqual(len(r.pages), 1, label)
    page_counts = []
    for page in r.pages:
        test_case.assertAlmostEqual(float(page.mediabox.width), 595.28, delta=1)
        test_case.assertAlmostEqual(float(page.mediabox.height), 841.89, delta=1)
        page_counts.append(len(page.images))
    test_case.assertGreaterEqual(sum(page_counts), images_min, label)
    return len(r.pages), page_counts

def save_evidence(label, pdf, meta):
    if not PREVIEW:
        return
    base = Path(ARTIFACT_DIR or "pdf-evidence")
    base.mkdir(parents=True, exist_ok=True)
    (base / f"{label}.pdf").write_bytes(pdf)
    (base / f"{label}.json").write_text(json.dumps(meta, indent=2, ensure_ascii=False), encoding="utf-8")


class PdfManyImagesTests(unittest.TestCase):
    def test_work_1_3_4_7_12_24_images_real_pdf(self):
        for count in [1, 3, 4, 7, 12, 24]:
            with self.subTest(images=count):
                raw, missing, tasks = generate_pdf(work_payload(count), "")
                self.assertEqual((missing, tasks), (0, 1))
                pages, per_page = assert_pdf(self, raw, f"work-{count}", images_min=count)
                if count > 7:
                    self.assertGreater(pages, 1, "long photo collection must paginate")
                save_evidence(f"esta-work-{count}-photos", raw,
                              {"images": count, "pages": pages, "image_counts": per_page})
                print(f"REAL_PDF_WORK images={count} pages={pages} bytes={len(raw)} visible_image_objects={sum(per_page)}")

    def test_three_images_per_row_and_page_flowables(self):
        from api.esta_report import task_card
        prepared = []
        for i in range(24):
            raw=base64.b64decode(image_data_url(i).split(",", 1)[1])
            prepared.append({"prepared": pdfc.process_image_bytes(raw, f"fixture-{i}", 0),
                             "caption": f"Ảnh {i+1}"})
        rows = pdfc.image_grid(prepared, cols=3)
        self.assertEqual(len(rows), 8, "24 images must become eight independent rows")
        self.assertTrue(all(len(r._cellvalues[0]) <= 5 for r in rows),
                        "max three image cells with up to two gaps")
        task = {"title": "Ảnh nhiều", "type": "Hằng ngày", "status": "Hoàn thành",
                "date": "10/10/2026", "assignee": "Kiểm thử", "images": prepared}
        flowables = task_card(1, task)
        self.assertGreaterEqual(len(flowables), 15, "photo rows must be independent page-breakable flowables")

    def test_other_report_types_and_missing_image(self):
        samples = [
            ("generic-admin", sample_generic(), 12),
            ("operations", sample_operations(), 12),
            ("energy", {"report_type":"energy", "building":"68 PĐL", "report_date":"10/10/2026",
                        "kt_signer_name":"Kỹ thuật kiểm thử", "energy_name":"Điện / nước",
                        "unit":"kWh","rows":[{"date":"2026-10-10","value":120,
                        "diff":5,"image":image_data_url(1)}]}, 1),
            ("tools", {"report_type":"tools","building":"130 HH",
                       "report_date":"10/10/2026","kt_signer_name":"Kỹ thuật kiểm thử",
                       "tools":[{"name":"Đồng hồ thử nghiệm","qty":2,"unit":"Bộ"}]}, 0)
        ]
        for label,payload,photos in samples:
            with self.subTest(type=label):
                raw,missing,count=generate_pdf(payload,"")
                self.assertEqual(missing,0)
                pages,page_counts=assert_pdf(self,raw,label,images_min=photos)
                save_evidence(f"esta-{label}",raw,
                              {"pages":pages,"images":photos,"image_counts":page_counts})
                print(f"REAL_PDF_OTHER name={label} pages={pages} bytes={len(raw)}")

    def test_authenticated_http_pipeline_and_errors(self):
        with patch("api.esta_report._validate_token", side_effect=lambda t: (
                {"id":"FAKE"} if t=="mock-access" else
                (_ for _ in ()).throw(PermissionError("Phiên đăng nhập không hợp lệ")))):
            httpd=ThreadingHTTPServer(("127.0.0.1",0),handler)
            thread=threading.Thread(target=httpd.serve_forever,daemon=True)
            thread.start()
            url=f"http://127.0.0.1:{httpd.server_address[1]}/api/esta_report"
            def post(payload,auth="mock-access"):
                b=json.dumps(payload,ensure_ascii=False).encode("utf-8")
                req=request.Request(url,data=b,headers={"Content-Type":"application/json",
                  "Authorization":f"Bearer {auth}"},method="POST")
                with request.urlopen(req,timeout=60) as resp:
                    return resp.status,resp.headers,resp.read()
            try:
                status,headers,raw=post(work_payload(7))
                self.assertEqual(status,200)
                self.assertEqual(headers.get("Content-Type"),"application/pdf")
                self.assertEqual(headers.get("X-ESTA-Task-Count"),"1")
                pages,_=assert_pdf(self,raw,"HTTP-work-7",images_min=7)
                save_evidence("esta-http-verified-7-photos",raw,{"http_status":status,"pages":pages})
                with self.assertRaises(error.HTTPError) as denied:
                    post(work_payload(1),auth="bad-token")
                self.assertEqual(denied.exception.code,401)
                with self.assertRaises(error.HTTPError) as invalid:
                    payload=work_payload(1)
                    payload["kt_signer_name"]=""
                    post(payload)
                self.assertEqual(invalid.exception.code,400)
                with self.assertRaises(error.HTTPError) as huge:
                    payload=work_payload(1)
                    payload["tasks"][0]["note"]="X"*2_600_000
                    post(payload)
                self.assertEqual(huge.exception.code,413)
                print("REAL_PDF_HTTP status=200 + HTTP 401/400/413 verified")
            finally:
                httpd.shutdown()
                thread.join(timeout=3)
                httpd.server_close()

if __name__ == "__main__":
    unittest.main()
