import os
import tempfile
import unittest
from reporting.completion_certificate import validate, build_esta_completion_doc, PROJECT_NAMES

class CompletionProjectsTests(unittest.TestCase):
    def test_four_projects_have_identical_supported_pdf_format(self):
        for project, label in PROJECT_NAMES.items():
            with self.subTest(project=project), tempfile.TemporaryDirectory() as td:
                payload={"building_id":project,"building":label,"period":"2026-10",
                         "certificate_style":"esta","company":"BQLTN",
                         "department":"KỸ THUẬT",
                         "rows":[{"content":"Kiểm tra thiết bị PCCC","start_date":"2026-10-10",
                                  "end_date":"2026-10-10"}]}
                period, rows=validate(payload)
                self.assertEqual(period,"2026-10")
                self.assertEqual(len(rows),1)
                path=os.path.join(td,"completion.pdf")
                build_esta_completion_doc(path,payload,photos=[])
                with open(path,"rb") as f:self.assertEqual(f.read(4),b"%PDF")
    def test_unknown_project_rejected(self):
        with self.assertRaises(ValueError):
            validate({"building_id":"DEMO","period":"2026-10","rows":[{"content":"test"}]})
