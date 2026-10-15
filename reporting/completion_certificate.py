# -*- coding: utf-8 -*-
"""Shared ESTA completion certificate renderer for authorized building projects."""
import re
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, LongTable, Table, TableStyle, KeepTogether, BaseDocTemplate, Frame, PageTemplate

from reporting.pdf_common import ensure_fonts
from reporting import pdf_common as pdfc

BLACK = colors.HexColor("#1e2933")
BORDER = colors.HexColor("#66747d")
LIGHT = colors.HexColor("#f3f5f7")
PROJECT_NAMES = {"62THL":"62 Trần Huy Liệu","68PĐL":"68 Phan Đăng Lưu","127HH":"127 Hồng Hà","130HH":"130 Hồng Hà"}


def clean(value, maximum=1000):
    return str(value if value is not None else "").strip()[:maximum]


def para(value, style):
    return Paragraph(escape(clean(value, 1600)).replace("\n", "<br/>") or " ", style)


def validate(data):
    if str(data.get("building_id") or "").upper() not in PROJECT_NAMES:
        raise ValueError("Dự án không hỗ trợ phiếu xác nhận")
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


def build_completion_doc(path, payload, photos=None):
    style = clean(payload.get("certificate_style") or "esta", 12).lower()
    if style not in ("paper", "esta"):
        raise ValueError("Mẫu phiếu PDF không hợp lệ")
    if style == "esta":
        return build_esta_completion_doc(path, payload, photos=photos)
    period, rows = validate(payload)
    project_name=PROJECT_NAMES[str(payload.get("building_id") or "").upper()]
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
                            title="Phiếu xác nhận hoàn thành công việc - "+project_name,
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
    story.extend([para("Dự án: "+project_name, styles["bold"]), Spacer(1,5)])
    story.extend([para("Nhân viên thực hiện: ........................................................", styles["text"]),Spacer(1,12)])
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
    # Visual evidence follows the signature block on the final pages.
    story.append(Spacer(1,6*mm))
    append_completion_photos(story, photos, width=full, esta=False,
                             section_style=styles["bold"])
    def footer(canvas, document):
        canvas.setFont("Mont",7.2)
        canvas.setFillColor(BORDER)
        canvas.drawRightString(A4[0]-15*mm, 10*mm, "Trang %s"%document.page)
    doc.build(story,onFirstPage=footer,onLaterPages=footer)
    return len(rows)


def build_esta_completion_doc(path, payload, photos=None):
    """ESTA PDF alternative; the original paper-form renderer remains available."""
    period, rows = validate(payload)
    project_name=PROJECT_NAMES[str(payload.get("building_id") or "").upper()]
    ensure_fonts()
    year, month = period.split("-")
    period_printed = "%s/%s" % (month, year)
    company = clean(payload.get("company"), 120) or "BQLTN LE HOLDING"
    department = clean(payload.get("department"), 120) or "BỘ PHẬN KỸ THUẬT"
    issued = clean(payload.get("issued_date"), 10)
    issued_printed = ("%s/%s/%s" % (issued[8:10], issued[5:7], issued[:4])
                      if re.fullmatch(r"\d{4}-\d{2}-\d{2}", issued) else "—")
    staff = "................................................"  # Luôn dành chỗ ghi tên kỹ thuật bằng tay
    desc = clean(payload.get("repair_description"), 1000) or "—"
    participant = clean(payload.get("participant_count"), 12) or "—"
    statement = clean(payload.get("completion_statement"), 700) or "Đã hoàn thành các công việc nêu trên."

    styles = {
        "eyebrow": ParagraphStyle("esta_cc_eyebrow", fontName="Mont-Bold",
            fontSize=7.1, leading=10, textColor=pdfc.COPPER, spaceAfter=0),
        "title": ParagraphStyle("esta_cc_title", fontName="Mont-Bold",
            fontSize=14.6, leading=20, alignment=TA_CENTER, textColor=pdfc.AUB),
        "month": ParagraphStyle("esta_cc_month", fontName="Mont-SemiBold",
            fontSize=9.4, leading=13, alignment=TA_CENTER, textColor=pdfc.STONE),
        "body": ParagraphStyle("esta_cc_body", fontName="Mont",
            fontSize=8.5, leading=12.8, textColor=pdfc.AUB_D),
        "meta_label": ParagraphStyle("esta_cc_meta_label", fontName="Mont-Bold",
            fontSize=6.6, leading=9, textColor=pdfc.STONE),
        "meta_value": ParagraphStyle("esta_cc_meta_value", fontName="Mont-SemiBold",
            fontSize=8, leading=11, textColor=pdfc.AUB),
        "section": ParagraphStyle("esta_cc_section", fontName="Mont-Bold",
            fontSize=9, leading=13, textColor=pdfc.AUB),
        "note": ParagraphStyle("esta_cc_note", fontName="Mont",
            fontSize=7.4, leading=11.3, textColor=pdfc.STONE),
        "tablehead": ParagraphStyle("esta_cc_th", fontName="Mont-Bold",
            fontSize=6.55, leading=9.0, alignment=TA_CENTER, textColor=pdfc.PALE),
        "tabletext": ParagraphStyle("esta_cc_td", fontName="Mont",
            fontSize=7.15, leading=10.2, textColor=pdfc.AUB_D),
        "tablebold": ParagraphStyle("esta_cc_tb", fontName="Mont-SemiBold",
            fontSize=7.15, leading=10.2, textColor=pdfc.AUB),
        "sig": ParagraphStyle("esta_cc_sig", fontName="Mont-Bold",
            fontSize=7.3, leading=11, alignment=TA_CENTER, textColor=pdfc.AUB),
        "official": ParagraphStyle("esta_cc_official", fontName="Mont-Bold",
            fontSize=7.8, leading=11.3, alignment=TA_CENTER, textColor=pdfc.AUB_D),
        "official_sub": ParagraphStyle("esta_cc_official_sub", fontName="Mont-SemiBold",
            fontSize=7.6, leading=11, alignment=TA_CENTER, textColor=pdfc.AUB_D),
        "official_date": ParagraphStyle("esta_cc_official_date", fontName="Mont-Italic",
            fontSize=8.0, leading=12, alignment=TA_RIGHT, textColor=pdfc.AUB_D),
    }


    # Logo-free official header: the same ESTA palette with administrative typography.
    _, later = pdfc.make_page_fns(
        "PHIẾU XÁC NHẬN HOÀN THÀNH", "THÁNG " + period_printed, project_name.upper()
    )
    def first_page(canvas, document):
        canvas.saveState()
        canvas.setFillColor(pdfc.PALE)
        canvas.rect(0, 0, pdfc.PW, pdfc.PH, stroke=0, fill=1)
        canvas.setFillColor(pdfc.AUB)
        canvas.rect(0, pdfc.PH-3*mm, pdfc.PW, 3*mm, stroke=0, fill=1)
        canvas.setFillColor(pdfc.COPPER)
        canvas.rect(0, pdfc.PH-4*mm, pdfc.PW, 1*mm, stroke=0, fill=1)
        canvas.restoreState()

    doc = BaseDocTemplate(
        path, pagesize=A4,
        title="ESTA - Phiếu xác nhận hoàn thành công việc - "+project_name,
        author="ESTA Property Management",
        subject="Xác nhận hoàn thành công việc",
        leftMargin=pdfc.MX, rightMargin=pdfc.MX,
        topMargin=17*mm, bottomMargin=22*mm,
    )
    first_frame = Frame(pdfc.MX, 22*mm, pdfc.CW, pdfc.PH-17*mm-22*mm,
                        id="esta_cc_first", leftPadding=0, rightPadding=0,
                        topPadding=0, bottomPadding=0)
    later_frame = Frame(pdfc.MX, 22*mm, pdfc.CW, pdfc.PH-18*mm-22*mm,
                        id="esta_cc_later", leftPadding=0, rightPadding=0,
                        topPadding=0, bottomPadding=0)
    doc.addPageTemplates([
        PageTemplate(id="esta_cc_cover", frames=[first_frame], onPage=first_page,
                     autoNextPageTemplate="esta_cc_next"),
        PageTemplate(id="esta_cc_next", frames=[later_frame], onPage=later),
    ])

    P = para
    company_width = pdfc.CW*0.47
    lefthead = Table([
        [P(company.upper(), styles["official"])],
        [P(department.upper(), styles["official_sub"])],
    ], colWidths=[company_width], hAlign="LEFT")
    lefthead.setStyle(TableStyle([
        ("VALIGN", (0,0),(-1,-1), "MIDDLE"),
        ("LEFTPADDING", (0,0),(-1,-1), 0),
        ("RIGHTPADDING", (0,0),(-1,-1), 2),
        ("TOPPADDING", (0,0),(-1,-1), 2),
        ("BOTTOMPADDING", (0,0),(-1,-1), 2),
    ]))
    national = Table([
        [P("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", styles["official"])],
        [P("Độc lập - Tự do - Hạnh phúc", styles["official_sub"])],
    ], colWidths=[pdfc.CW-company_width])
    national.setStyle(TableStyle([
        ("VALIGN", (0,0),(-1,-1), "MIDDLE"),
        ("LEFTPADDING", (0,0),(-1,-1), 0),
        ("RIGHTPADDING", (0,0),(-1,-1), 0),
        ("TOPPADDING", (0,0),(-1,-1), 2),
        ("BOTTOMPADDING", (0,0),(-1,-1), 2),
        ("LINEBELOW", (0,1),(0,1),0.8,pdfc.COPPER),
    ]))
    official = Table([[lefthead, national]],
                     colWidths=[company_width, pdfc.CW-company_width], hAlign="LEFT")
    official.setStyle(TableStyle([
        ("VALIGN", (0,0),(-1,-1), "MIDDLE"),
        ("LEFTPADDING", (0,0),(-1,-1), 0),
        ("RIGHTPADDING", (0,0),(-1,-1), 0),
        ("TOPPADDING", (0,0),(-1,-1), 0),
        ("BOTTOMPADDING", (0,0),(-1,-1), 0),
    ]))
    day = issued[8:10] if issued_printed != "—" else "......"
    mo = issued[5:7] if issued_printed != "—" else "......"
    yr = issued[:4] if issued_printed != "—" else "......"
    story = [
        official,
        Spacer(1, 2*mm),
        P("TP.HCM, ngày %s tháng %s năm %s" % (day,mo,yr), styles["official_date"]),
        Spacer(1, 7*mm),
        P("PHIẾU XÁC NHẬN HOÀN THÀNH CÔNG VIỆC", styles["title"]),
        Spacer(1, 1*mm),
        P("THÁNG " + period_printed, styles["month"]),
        Spacer(1, 2*mm),
    ]
    divider = pdfc.COPPER
    from reportlab.platypus import HRFlowable
    story.extend([
        HRFlowable(width="100%", thickness=1.5, color=divider,
                   spaceBefore=2, spaceAfter=10),
    ])
    details = [
        [
            P("DỰ ÁN", styles["meta_label"]),
            P(project_name, styles["meta_value"]),
            P("NGÀY LẬP", styles["meta_label"]),
            P(issued_printed, styles["meta_value"]),
        ],
        [
            P("NHÂN VIÊN THỰC HIỆN", styles["meta_label"]),
            P(staff, styles["meta_value"]),
            P("SỐ NGƯỜI", styles["meta_label"]),
            P(participant, styles["meta_value"]),
        ],
    ]
    meta = Table(details, colWidths=[35*mm, 58*mm, 28*mm, pdfc.CW-121*mm],
                 hAlign="LEFT")
    meta.setStyle(TableStyle([
        ("BACKGROUND", (0,0),(-1,-1), pdfc.CREAM_L),
        ("BOX",(0,0),(-1,-1),0.65,pdfc.TAUPE),
        ("LINEBELOW",(0,0),(-1,-2),0.25,pdfc.TAUPE),
        ("VALIGN",(0,0),(-1,-1),"MIDDLE"),
        ("TOPPADDING",(0,0),(-1,-1),6),
        ("BOTTOMPADDING",(0,0),(-1,-1),6),
        ("LEFTPADDING",(0,0),(-1,-1),7),
    ]))
    story.extend([meta, Spacer(1, 5*mm)])
    story.extend([
        P("01  ·  NỘI DUNG XÁC NHẬN", styles["section"]),
        Spacer(1, 2.5*mm),
    ])
    about = Table([
        [P("NỘI DUNG CÔNG VIỆC CẦN SỬA CHỮA", styles["meta_label"])],
        [P(desc, styles["body"])],
    ], colWidths=[pdfc.CW])
    about.setStyle(TableStyle([
        ("BACKGROUND", (0,0),(-1,-1), pdfc.PALE),
        ("BOX",(0,0),(-1,-1),0.65,pdfc.TAUPE),
        ("LINEBELOW",(0,1),(-1,1),0.35,pdfc.TAUPE),
        ("TOPPADDING",(0,0),(-1,-1),4.3),
        ("BOTTOMPADDING",(0,0),(-1,-1),4.3),
        ("LEFTPADDING",(0,0),(-1,-1),8),
    ]))
    story.extend([about, Spacer(1, 6*mm)])
    story.extend([
        P("02  ·  DANH SÁCH CÔNG VIỆC VÀ VẬT TƯ THAY THẾ", styles["section"]),
        Spacer(1, 2.2*mm),
    ])
    table_header=["STT", "NỘI DUNG CÔNG VIỆC", "VẬT TƯ / THIẾT BỊ", "ĐVT",
                  "SL", "BẮT ĐẦU", "KẾT THÚC"]
    data=[[P(h,styles["tablehead"]) for h in table_header]]
    def date_fmt(iso):
        return iso[8:10] + "/" + iso[5:7] + "/" + iso[:4] if iso else "—"
    for i, row in enumerate(rows, 1):
        data.append([
            P(str(i),styles["tabletext"]),
            P(row["content"],styles["tablebold"]),
            P(row["material"] or "—",styles["tabletext"]),
            P(row["unit"] or "—",styles["tabletext"]),
            P(row["qty"] or "—",styles["tabletext"]),
            P(date_fmt(row["start"]),styles["tabletext"]),
            P(date_fmt(row["end"]),styles["tabletext"]),
        ])
    cols=[10*mm,41*mm,43*mm,11*mm,11*mm,29*mm,29*mm]
    table=LongTable(data,colWidths=cols,repeatRows=1,
                    hAlign="LEFT",splitByRow=1,splitInRow=1)
    tstyles=[
        ("BACKGROUND",(0,0),(-1,0),pdfc.AUB),
        ("VALIGN",(0,0),(-1,-1),"TOP"),
        ("BOX",(0,0),(-1,-1),0.7,pdfc.TAUPE),
        ("LINEBELOW",(0,1),(-1,-1),0.35,pdfc.TAUPE),
        ("LINEAFTER",(0,0),(-2,-1),0.3,pdfc.TAUPE),
        ("TOPPADDING",(0,0),(-1,0),8),
        ("BOTTOMPADDING",(0,0),(-1,0),8),
        ("TOPPADDING",(0,1),(-1,-1),6.5),
        ("BOTTOMPADDING",(0,1),(-1,-1),6.5),
        ("LEFTPADDING",(0,0),(-1,-1),4),
        ("RIGHTPADDING",(0,0),(-1,-1),4),
    ]
    for r in range(1,len(data)):
        tstyles.append(("BACKGROUND",(0,r),(-1,r),pdfc.PALE if r%2 else pdfc.CREAM_L))
    table.setStyle(TableStyle(tstyles))
    story.extend([table, Spacer(1, 6*mm)])
    story.extend([
        P("03  ·  BÁO CÁO KIỂM TRA & CÔNG VIỆC THỰC HIỆN", styles["section"]),
        Spacer(1, 2.3*mm),
    ])
    verdict = Table([
        [P("SỐ NGƯỜI THAM GIA", styles["meta_label"]),
         P("KẾT QUẢ XÁC NHẬN", styles["meta_label"])],
        [P(participant, styles["meta_value"]), P(statement,styles["body"])],
    ], colWidths=[pdfc.CW*0.24,pdfc.CW*0.76])
    verdict.setStyle(TableStyle([
        ("BOX",(0,0),(-1,-1),0.65,pdfc.TAUPE),
        ("BACKGROUND",(0,0),(-1,-1),pdfc.PALE),
        ("VALIGN",(0,0),(-1,-1),"TOP"),
        ("LINEAFTER",(0,0),(0,-1),0.5,pdfc.TAUPE),
        ("TOPPADDING",(0,0),(-1,-1),6),
        ("BOTTOMPADDING",(0,0),(-1,-1),6),
        ("LEFTPADDING",(0,0),(-1,-1),7),
    ]))
    story.extend([verdict,Spacer(1,2.5*mm)])
    disclaimer = ("Đại diện công ty đã kiểm tra tất cả tài sản trong khu vực thuê "
                  "và cam kết không thiệt hại do nhân viên kỹ thuật gây ra.")
    story.extend([
        P("04  ·  CAM KẾT", styles["section"]),
        Spacer(1, 2*mm),
        P(disclaimer,styles["note"]),
        Spacer(1,6*mm)
    ])
    signatures=Table([
        [
            P("ĐẠI DIỆN BQLTN", styles["sig"]),
            P("GIÁM SÁT KỸ THUẬT", styles["sig"]),
            P("ĐẠI DIỆN KỸ THUẬT", styles["sig"]),
        ],
        [Spacer(1,24*mm), Spacer(1,24*mm), Spacer(1,24*mm)],
    ], colWidths=[pdfc.CW/3]*3)
    signatures.setStyle(TableStyle([
        ("LINEABOVE",(0,0),(-1,0),0.9,pdfc.COPPER),
        ("VALIGN",(0,0),(-1,-1),"TOP"),
        ("ALIGN",(0,0),(-1,-1),"CENTER"),
        ("TOPPADDING",(0,0),(-1,-1),6),
    ]))
    story.append(KeepTogether([signatures]))
    # Evidence images must come after the signature section, not before it.
    story.append(Spacer(1,6*mm))
    append_completion_photos(story, photos, width=pdfc.CW, esta=True,
                             section_style=styles["section"])
    doc.build(story,canvasmaker=pdfc.NumberedCanvas)
    return len(rows)


def append_completion_photos(story, photos, width, esta, section_style):
    """Two uncropped large images on each A4 row, one row remains indivisible."""
    pictures = [image for image in (photos or []) if image.get("prepared")]
    if not pictures:
        return
    heading = ("05  ·  HÌNH ẢNH CÔNG VIỆC THỰC HIỆN"
               if esta else "Hình ảnh công việc thực hiện:")
    gap = 4*mm
    cell_width = (width-gap)/2
    cells = []
    for index in range(0, len(pictures), 2):
        group = pictures[index:index+2]
        # Maximum visual area without cropping; a row is never cut between pages.
        required = []
        for item in group:
            prepared = item["prepared"]
            natural_h = (cell_width-4) * max(1, prepared.height) / max(1, prepared.width)
            required.append(min(89*mm, max(59*mm, natural_h)))
        height = max(required)
        slot_row = []
        for i, item in enumerate(group):
            label = str(item.get("caption") or ("Hình %d" % (index+i+1)))[:31]
            slot_row.append(pdfc.ImageSlot(
                width=cell_width, height=height,
                prepared=item["prepared"], caption=label
            ))
            if i == 0:
                slot_row.append("")
        if len(group) == 1:
            slot_row.append("")
        row = Table([slot_row], colWidths=[cell_width,gap,cell_width], hAlign="LEFT")
        row.setStyle(TableStyle([
            ("VALIGN",(0,0),(-1,-1),"TOP"),
            ("LEFTPADDING",(0,0),(-1,-1),0),
            ("RIGHTPADDING",(0,0),(-1,-1),0),
            ("TOPPADDING",(0,0),(-1,-1),0),
            ("BOTTOMPADDING",(0,0),(-1,-1),0)
        ]))
        cells.append(row)
    # Keep the section label with at least one actual image.
    story.append(KeepTogether([
        para(heading, section_style), Spacer(1, 3*mm), cells[0]
    ]))
    story.append(Spacer(1, 4*mm))
    for row in cells[1:]:
        story.append(row)
        story.append(Spacer(1, 4*mm))
    story.append(Spacer(1, 4*mm))
