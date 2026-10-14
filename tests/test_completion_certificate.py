"""130HH completion certificate regressions - synthetic fixtures, no personal data."""
import re
import io
import base64
import tempfile
import unittest
from pathlib import Path

from reporting.completion_certificate import build_completion_doc, validate
from api.esta_report import generate_pdf
from PIL import Image as PILImage
from reporting.esta_official_logo import OFFICIAL_LOGO_PNG


class CompletionCertificateTests(unittest.TestCase):
    def fixture(self, count=1, size=0):
        return {
            "report_type": "completion",
            "building_id": "130HH", "period": "2026-09",
            "company": "BQLTN LE HOLDING", "department": "BỘ PHẬN KỸ THUẬT",
            "issued_date": "2026-10-14", "staff": "Nguyễn Văn A",
            "repair_description": "Thay đèn hành lang và kiểm tra thiết bị.",
            "participant_count": "2", "completion_statement": "Đã hoàn thành.",
            "rows": [{
                "content": "Thay đèn hành lang " + ("nội dung dài " * size),
                "material": "Đèn LED 15W " + ("vật tư " * size),
                "unit": "Cái", "qty": "8",
                "start_date": "2026-09-10", "end_date": "2026-09-11",
            } for _ in range(count)],
        }

    def test_paper_certificate_single_page(self):
        with tempfile.TemporaryDirectory() as folder:
            target = Path(folder) / "single.pdf"
            count = build_completion_doc(str(target), self.fixture())
            content = target.read_bytes()
            self.assertEqual(count, 1)
            self.assertTrue(content.startswith(b"%PDF-"))
            self.assertGreater(len(content), 5000)
            self.assertGreaterEqual(len(re.findall(rb"/Type\s*/Page\b", content)), 1)

    def test_table_breaks_across_multiple_pages(self):
        with tempfile.TemporaryDirectory() as folder:
            target = Path(folder) / "multiple.pdf"
            count = build_completion_doc(str(target), self.fixture(28, 20))
            content = target.read_bytes()
            self.assertEqual(count, 28)
            self.assertGreaterEqual(len(re.findall(rb"/Type\s*/Page\b", content)), 2)

    def test_long_single_row_splits_safely(self):
        with tempfile.TemporaryDirectory() as folder:
            target = Path(folder) / "longrow.pdf"
            build_completion_doc(str(target), self.fixture(1, 100))
            self.assertTrue(target.read_bytes().startswith(b"%PDF-"))


    def test_esta_uses_exact_approved_logo(self):
        # This logo is the approved asset currently displayed by ESTA PWA.
        self.assertEqual(OFFICIAL_LOGO_PNG, Path("icons/icon-192.png").read_bytes())
        payload=self.fixture()
        payload["certificate_style"]="esta"
        with tempfile.TemporaryDirectory() as folder:
            target=Path(folder)/"esta_logo.pdf"
            build_completion_doc(str(target),payload)
            self.assertGreaterEqual(
                len(re.findall(rb"/Subtype\s*/Image\b",target.read_bytes())),1
            )

    def test_esta_single_page_and_multipage(self):
        with tempfile.TemporaryDirectory() as folder:
            for count, length in ((1, 0), (26, 12)):
                payload = self.fixture(count, length)
                payload["certificate_style"] = "esta"
                target = Path(folder) / ("esta_%d.pdf" % count)
                self.assertEqual(build_completion_doc(str(target), payload), count)
                content = target.read_bytes()
                self.assertTrue(content.startswith(b"%PDF-"))
                self.assertGreater(len(content), 5000)
                self.assertGreaterEqual(
                    len(re.findall(rb"/Type\s*/Page\b", content)),
                    2 if count > 1 else 1
                )

    def test_esta_long_row_and_style_validation(self):
        with tempfile.TemporaryDirectory() as folder:
            payload = self.fixture(1, 100)
            payload["certificate_style"] = "esta"
            target = Path(folder) / "longrow_esta.pdf"
            build_completion_doc(str(target), payload)
            self.assertTrue(target.read_bytes().startswith(b"%PDF-"))
            payload["certificate_style"] = "unknown"
            with self.assertRaisesRegex(ValueError, "Mẫu phiếu"):
                build_completion_doc(str(target), payload)


    @staticmethod
    def photo_url(size, hue):
        output=io.BytesIO()
        PILImage.new("RGB", size, (hue, 140, 180)).save(output,"PNG")
        return "data:image/png;base64,"+base64.b64encode(output.getvalue()).decode("ascii")

    def test_esta_images_2_per_row_even_and_odd(self):
        landscape=self.photo_url((1200,650), 70)
        portrait=self.photo_url((540,980), 200)
        for count in (1, 2, 3, 7):
            data=self.fixture()
            data["certificate_style"]="esta"
            data["photos"]=[
                {"path":(landscape if index%2==0 else portrait),
                 "caption":"CV 1 - Hình %d" % (index+1)}
                for index in range(count)
            ]
            pdf, missing, task_count=generate_pdf(data,"test-image-token")
            self.assertEqual((missing,task_count),(0,1))
            self.assertTrue(pdf.startswith(b"%PDF-"))
            self.assertGreaterEqual(
                len(re.findall(rb"/Subtype\s*/Image\b",pdf)), 2 if count>=2 else 1
            )
            if count>=7:
                self.assertGreaterEqual(len(re.findall(rb"/Type\s*/Page\b",pdf)),2)

    def test_paper_image_gallery_and_missing_photo(self):
        data=self.fixture()
        data["certificate_style"]="paper"
        data["photos"]=[
            {"path":self.photo_url((850,480),100),"caption":"CV 1 - Hình 1"},
            {"path":"data:image/png;base64,invalid","caption":"CV 1 - Hình 2"},
        ]
        pdf, missing, count=generate_pdf(data,"test-image-token")
        self.assertEqual((missing,count),(1,1))
        self.assertTrue(pdf.startswith(b"%PDF-"))
        data["photos"]=[{"path":"http://169.254.169.254/latest/meta-data",
                         "caption":"Ảnh ngoài không được phép"}]
        pdf, missing, count=generate_pdf(data,"test-image-token")
        self.assertEqual((missing,count),(1,1))
        self.assertTrue(pdf.startswith(b"%PDF-"))

    def test_reject_over_60_images(self):
        data=self.fixture()
        data["certificate_style"]="esta"
        data["photos"]=[{"path":"storage:a"}]*61
        with self.assertRaisesRegex(ValueError,"60 ảnh"):
            generate_pdf(data,"test-image-token")

    def test_scope_validation_and_dates(self):
        payload=self.fixture()
        payload["building_id"] = "127HH"
        with self.assertRaisesRegex(ValueError,"130 HH"):
            validate(payload)
        payload=self.fixture()
        payload["rows"][0]["end_date"]="2026-09-01"
        with self.assertRaisesRegex(ValueError,"trước"):
            validate(payload)
        payload=self.fixture()
        payload["rows"]=[]
        with self.assertRaisesRegex(ValueError,"1 đến 120"):
            validate(payload)


if __name__=="__main__":
    unittest.main()
