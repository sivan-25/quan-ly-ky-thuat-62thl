"""130HH completion certificate regressions - synthetic fixtures, no personal data."""
import re
import tempfile
import unittest
from pathlib import Path

from reporting.completion_certificate import build_completion_doc, validate


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
