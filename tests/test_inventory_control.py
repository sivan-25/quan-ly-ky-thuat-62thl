"""Regression checks for the approved ESTA landscape inventory PDF."""
import os
import tempfile
import unittest
from reporting.inventory_control import build_inventory_control_doc, signers, WIDTH
from reportlab.lib.enums import TA_CENTER
from pypdf import PdfReader

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

    def page_texts(self, selected, projects):
        with tempfile.TemporaryDirectory() as td:
            path=os.path.join(td,"compact.pdf")
            build_inventory_control_doc(path,{
                "selected":selected,"projects":projects,
                "period_from":"2026-11-01","period_to":"2026-11-30",
                "period_label":"THÁNG 11/2026","report_date":"05/11/2026"
            })
            reader=PdfReader(path)
            return [page.extract_text() or "" for page in reader.pages]

    def test_a_and_c_share_page_when_short(self):
        pages=self.page_texts(["materials"],[self.project(items=3)])
        self.assertEqual(len(pages),1,"A và C không được tự động tách trang khi còn đủ chỗ")
        for section in ("A. VẬT TƯ TIÊU HAO","C. HẠNG MỤC ĐÃ XỬ LÝ",
                        "PHÊ DUYỆT","NGƯỜI KIỂM TRA","NGƯỜI LẬP"):
            self.assertIn(section,pages[0])

    def test_project_break_only_after_signature(self):
        first=self.project(name="62 Trần Huy Liệu",items=3)
        second=self.project(name="127 Hồng Hà",items=3)
        first["approved_by"]="Giám đốc dự án A"
        second["approved_by"]="Giám đốc dự án B"
        pages=self.page_texts(["materials","tools"],[first,second])
        self.assertEqual(len(pages),2,"Mỗi dự án ngắn chỉ cần một trang")
        self.assertIn("Giám đốc dự án A",pages[0])
        self.assertNotIn("Giám đốc dự án B",pages[0])
        self.assertIn("Giám đốc dự án B",pages[1])
        self.assertNotIn("Giám đốc dự án A",pages[1])
        self.assertIn("C. HẠNG MỤC",pages[0])
        self.assertIn("B. DỤNG CỤ",pages[0])
        self.assertIn("A. VẬT TƯ",pages[0])

    def test_3_materials_20_tools_and_empty_work_uses_available_space(self):
        # Reproduce the user's actual export: page one previously stopped after
        # three lines of A, page two contained B/C and page three only signatures.
        project = self.project(items=3)
        project["tools"] = [{
            "name": "Dụng cụ số " + str(i).zfill(2),
            "brand": "Asaki", "unit": "Cái", "qty": 1,
            "keeper": "Ân", "status": "Đang sử dụng", "note": "—"
        } for i in range(1, 21)]
        project["work"] = []
        pages = self.page_texts(["materials", "tools"], [project])
        self.assertLessEqual(len(pages), 2, "Không tạo thêm trang chỉ để ký tên")
        self.assertIn("A. VẬT TƯ TIÊU HAO", pages[0])
        self.assertIn("B. DỤNG CỤ KỸ THUẬT", pages[0],
                      "Mục B phải tiếp tục ngay sau A trên cùng trang nếu đủ chỗ")
        self.assertIn("Dụng cụ số 01", pages[0],
                      "Bảng B phải chia dòng qua trang, không đẩy toàn bộ bảng")
        self.assertIn("C. HẠNG MỤC ĐÃ XỬ LÝ", pages[-1])
        self.assertIn("PHÊ DUYỆT", pages[-1],
                      "Chữ ký phải theo ngay C chứ không tạo trang thứ ba")
        full = "\n".join(pages)
        self.assertNotIn("KIỂM KÊ CUỐI TỪ", full)
        self.assertNotIn("TỒN TỪ", full)
        self.assertNotIn("Tổng SL vật tư xuất ở mục C đối chiếu", full)
        self.assertIn("Không có dữ liệu trong kỳ", full)

    def test_project_new_page_still_follows_its_signatures(self):
        a = self.project(name="62 Trần Huy Liệu", items=3)
        b = self.project(name="127 Hồng Hà", items=3)
        a["tools"] = [{
            "name": "Ampe kìm " + str(i), "brand": "Asaki",
            "unit": "Cái", "qty": 1, "keeper": "Ân",
            "status": "Đang sử dụng", "note": ""
        } for i in range(20)]
        a["work"] = []
        a["approved_by"] = "NGUOI PHE DUYET 62"
        b["approved_by"] = "NGUOI PHE DUYET 127"
        pages = self.page_texts(["materials", "tools"], [a, b])
        first_sig_page = next(i for i,t in enumerate(pages) if "NGUOI PHE DUYET 62" in t)
        second_start_page = next(i for i,t in enumerate(pages) if "Dự án: 127 Hồng Hà" in t)
        self.assertEqual(second_start_page, first_sig_page + 1)
        self.assertNotIn("NGUOI PHE DUYET 127", pages[first_sig_page])

    def test_signature_cells_exactly_centered(self):
        signatures=signers(self.project()) 
        table=signatures._content[-1]
        self.assertEqual(len(table._colWidths),3)
        self.assertTrue(all(abs(width-WIDTH/3)<0.01 for width in table._colWidths))
        self.assertEqual(len(table._cellvalues),5)
        for row in (0,1,3,4):
            self.assertTrue(all(cell.style.alignment==TA_CENTER for cell in table._cellvalues[row]))
        self.assertEqual(table._cellvalues[1][0].getPlainText(),"Kỹ sư trưởng")
        self.assertEqual(table._cellvalues[1][1].getPlainText(),"Giám sát kỹ thuật")
        self.assertEqual(table._cellvalues[1][2].getPlainText(),"Kỹ thuật dự án")

if __name__=="__main__":
    unittest.main()
