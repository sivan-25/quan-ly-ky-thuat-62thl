# -*- coding: utf-8 -*-
"""130 Hồng Hà completion certificate, faithful to the signed paper form."""
import re
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, LongTable, Table, TableStyle, KeepTogether

from reporting.pdf_common import ensure_fonts

BLACK = colors.HexColor("#1e2933")
BORDER = colors.HexColor("#66747d")
LIGHT = colors.HexColor("#f3f5f7")


def clean(value, maximum=1000):
    return str(value if value is not None else "").strip()[:maximum]


def para(value, style):
    return Paragraph(escape(clean(value, 1600)).replace("\n", "<br/>") or " ", style)


def validate(data):
    if str(data.get("building_id") or "").upper() != "130HH":
        raise ValueError("Mẫu phiếu này hiện chỉ thử nghiệm tại dự án 130 HH")
    period = clean(data.get("period"), 7)
    if not re.fullmatch(r"20\d{2}-(0[1-9]|1[0-2])", period):
        raise ValueError("Tháng xác nhận không hợp lệ")
    rows = data.get("rows")
    if not isinstance(rows, list) or not 1 <= len(rows) <= 120:
        raise ValueError("Chọn từ 1 đến 120 công việc để xuất phiếu")
    cleaned = []
    for row in rows:
        if not isinstance(row, dict):
            raise ValueError("Dòng công việc không hợp lệ")
        title = clean(row.get("content"), 1400)
        if not title:
            raise ValueError("Mỗi dòng phải có nội dung công việc")
        start, end = clean(row.get("start_date"), 10), clean(row.get("end_date"), 10)
        for date in (start, end):
            if date and not re.fullmatch(r"\d{4}-\d{2}-\d{2}", date):
                raise ValueError("Ngày công việc không hợp lệ")
        if start and end and end < start:
            raise ValueError("Ngày kết thúc không thể trước ngày bắt đầu")
        cleaned.append({
            "content": title,
            "material": clean(row.get("material"), 1400),
            "unit": clean(row.get("unit"), 30),
            "qty": clean(row.get("qty"), 30),
            "start": start,
            "end": end,
        })
    return period, cleaned


def build_completion_doc(path, payload):
    period, rows = validate(payload)
    ensure_fonts()
    styles = {
        "small": ParagraphStyle("cc_small", fontName="Mont", fontSize=8.0, leading=11, textColor=BLACK),
        "text": ParagraphStyle("cc_text", fontName="Mont", fontSize=9, leading=13, textColor=BLACK),
        "bold": ParagraphStyle("cc_bold", fontName="Mont-Bold", fontSize=8.3, leading=12, textColor=BLACK),
        "center": ParagraphStyle("cc_center", fontName="Mont-Bold", fontSize=8.4, leading=12, alignment=TA_CENTER, textColor=BLACK),
        "right": ParagraphStyle("cc_right", fontName="Mont", fontSize=8.5, leading=12, alignment=TA_RIGHT, textColor=BLACK),
        "title": ParagraphStyle("cc_title", fontName="Mont-Bold", fontSize=12.4, leading=17, alignment=TA_CENTER, textColor=BLACK),
        "cell": ParagraphStyle("cc_cell", fontName="Mont", fontSize=7.5, leading=10.4, textColor=BLACK),
        "th": ParagraphStyle("cc_th", fontName="Mont-Bold", fontSize=7.0, leading=9.5, alignment=TA_CENTER, textColor=BLACK),
    }
    doc = SimpleDocTemplate(path, pagesize=A4, leftMargin=15*mm, rightMargin=15*mm,
                            topMargin=14*mm, bottomMargin=16*mm,
                            title="Phiếu xác nhận hoàn thành công việc - 130 HH",
                            author="Bộ phận Kỹ thuật")
    full = doc.width
    story = []
    company = clean(payload.get("company"), 120) or "BQLTN LE HOLDING"
    department = clean(payload.get("department"), 120) or "BỘ PHẬN KỸ THUẬT"
    header = Table([[
        para(company.upper(), styles["center"]),
        para("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", styles["center"]),
    ], [
        para(department.upper(), styles["center"]),
        para("Độc lập - Tự do - Hạnh phúc", styles["center"]),
    ]], colWidths=[full*0.45, full*0.55])
    header.setStyle(TableStyle([("VALIGN",(0,0),(-1,-1),"TOP"),
                                ("TOPPADDING",(0,0),(-1,-1),1),
                                ("BOTTOMPADDING",(0,0),(-1,-1),2)]))
    story.extend([header, Spacer(1,9)])
    date = clean(payload.get("issued_date"),10)
    match = re.fullmatch(r"(\d{4})-(\d{2})-(\d{2})", date)
    printed = "ngày %s tháng %s năm %s" % (match[3],match[2],match[1]) if match else "ngày ...... tháng ...... năm ......"
    story.extend([para("TP.HCM, " + printed, styles["right"]), Spacer(1,12)])
    mm_y,mm_m=period.split("-")
    story.extend([para("PHIẾU XÁC NHẬN HOÀN THÀNH CÔNG VIỆC THÁNG %s/%s"%(mm_m,mm_y),styles["title"]), Spacer(1,8)])
    story.extend([para("Dự án: 130 Hồng Hà", styles["bold"]), Spacer(1,5)])
    story.extend([para("Nhân viên thực hiện: "+(clean(payload.get("staff"),280) or "................................"), styles["text"]),Spacer(1,12)])
    story.extend([para("Nội dung công việc cần sửa chữa:", styles["bold"]), Spacer(1,2)])
    desc=clean(payload.get("repair_description"),1000) or ".................................................................................................."
    story.extend([para(desc,styles["text"]),Spacer(1,12)])
    story.extend([para("Mô tả công việc đã thực hiện. Số lượng vật tư, thiết bị đã thay thế:",styles["bold"]),Spacer(1,4)])

    headings=["Nội dung công việc","Vật tư, thiết bị thay thế","ĐVT","SL","Ngày bắt đầu","Ngày kết thúc"]
    values=[[para(h,styles["th"]) for h in headings]]
    date_fmt=lambda s: (s[8:10]+"/"+s[5:7]+"/"+s[:4]) if s else ""
    for row in rows:
        values.append([
            para(row["content"],styles["cell"]),
            para(row["material"],styles["cell"]),
            para(row["unit"],styles["cell"]),
            para(row["qty"],styles["cell"]),
            para(date_fmt(row["start"]),styles["cell"]),
            para(date_fmt(row["end"]),styles["cell"]),
        ])
    widths=[51*mm,48*mm,13*mm,12*mm,28*mm,28*mm]
    work_table=LongTable(values,colWidths=widths,repeatRows=1,hAlign="LEFT",splitByRow=1,splitInRow=1)
    work_table.setStyle(TableStyle([
        ("GRID",(0,0),(-1,-1),0.6,BORDER),
        ("BACKGROUND",(0,0),(-1,0),LIGHT),
        ("VALIGN",(0,0),(-1,-1),"TOP"),
        ("LEFTPADDING",(0,0),(-1,-1),4),("RIGHTPADDING",(0,0),(-1,-1),4),
        ("TOPPADDING",(0,0),(-1,-1),6),("BOTTOMPADDING",(0,0),(-1,-1),6),
    ]))
    story.extend([work_table,Spacer(1,13)])
    number=clean(payload.get("participant_count"),12)
    result=clean(payload.get("completion_statement"),700) or "Đã hoàn thành các công việc nêu trên."
    statement=Table([[
        para("Báo cáo kiểm tra & Công việc thực hiện:",styles["bold"])
    ],[
        para("Số người tham gia: "+(number or "............"),styles["text"])
    ],[
        para("Xác nhận công việc đã hoàn tất:",styles["bold"])
    ],[
        para(result,styles["text"])
    ],[
        para("Đại diện công ty đã kiểm tra tất cả tài sản trong khu vực thuê và cam kết không thiệt hại do nhân viên kỹ thuật gây ra.",styles["small"])
    ]],colWidths=[full])
    statement.setStyle(TableStyle([
        ("BOX",(0,0),(-1,-1),0.6,BORDER),
        ("LINEBELOW",(0,1),(-1,1),0.4,BORDER),
        ("LINEBELOW",(0,3),(-1,3),0.4,BORDER),
        ("VALIGN",(0,0),(-1,-1),"TOP"),
        ("LEFTPADDING",(0,0),(-1,-1),6),("RIGHTPADDING",(0,0),(-1,-1),6),
        ("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5),
    ]))
    story.extend([statement,Spacer(1,10)])
    signatures=Table([[
        para("Đại diện BQLTN",styles["center"]),
        para("Giám sát kỹ thuật",styles["center"]),
        para("Đại diện Kỹ thuật",styles["center"]),
    ],[Spacer(1,23*mm),Spacer(1,23*mm),Spacer(1,23*mm)]],colWidths=[full/3]*3)
    signatures.setStyle(TableStyle([("VALIGN",(0,0),(-1,-1),"TOP"),("ALIGN",(0,0),(-1,-1),"CENTER")]))
    story.append(KeepTogether([signatures]))
    def footer(canvas, document):
        canvas.setFont("Mont",7.2)
        canvas.setFillColor(BORDER)
        canvas.drawRightString(A4[0]-15*mm, 10*mm, "Trang %s"%document.page)
    doc.build(story,onFirstPage=footer,onLaterPages=footer)
    return len(rows)
