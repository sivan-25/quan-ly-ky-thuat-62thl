"""Regression checks for the approved ESTA landscape inventory PDF."""
import os
import tempfile
import unittest
from reporting.inventory_control import build_inventory_control_doc

class InventoryControlReportTests(unittest.TestCase):
    def project(self,name="62 Trần Huy Liệu",items=3):
        return {
            "id":"62THL","name":name,
            "prepared_by":"Kỹ thuật dự án","checked_by":"Giám sát kỹ thuật",
            "approved_by":"Kỹ sư trưởng",
            "materials":[{"name":"Keo","unit":"Cái","opening":10,"inbound":5,
                          "outbound":2,"closing":13,"note":"10/11: nhập 5; 15/11: xuất 2"}]*items,
            "tools":[{"name":"Ampe kìm","brand":"Asaki","unit":"Cái","qty":1,
                      "keeper":"Ân","status":"Tốt","note":""}]*items,
            "work":[{"task":"T01 - Sửa đèn","completed":"2026-11-15","date":"2026-11-15",
                     "material":"Keo","qty":2,"unit":"Cái","performer":"Ân","linked":True}]
        }
    def pdf(self,selected,projects):
        with tempfile.TemporaryDirectory() as td:
            filename=os.path.join(td,"report.pdf")
            n=build_inventory_control_doc(filename,{
                "selected":selected,"projects":projects,
                "period_from":"2026-11-01","period_to":"2026-11-30",
                "period_label":"THÁNG 11/2026","report_date":"05/11/2026"
            })
            with open(filename,"rb") as file:
                pdf=file.read()
        self.assertTrue(pdf.startswith(b"%PDF-"))
        self.assertGreater(len(pdf),2500)
        return n,len(pdf)
    def test_consumables_a_c(self):
        n,_=self.pdf(["materials"],[self.project()])
        self.assertEqual(n,4)
    def test_equipment_b_with_multiple_pages(self):
        n,size=self.pdf(["tools"],[self.project(items=40)])
        self.assertEqual(n,40)
        self.assertGreater(size,5000)
    def test_admin_multiple_projects_one_pdf(self):
        n,_=self.pdf(["materials","tools"],[
            self.project(),self.project("127 Hồng Hà")])
        self.assertEqual(n,14)
    def test_invalid_section_rejected(self):
        with self.assertRaises(ValueError):
            self.pdf(["work"],[self.project()])

if __name__=="__main__":
    unittest.main()
