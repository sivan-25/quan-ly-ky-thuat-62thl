# -*- coding: utf-8 -*-
"""Landscape ESTA inventory-control template (A+C consumables, B equipment).
Read-only PDF rendering; one clearly separated project per report segment.
"""
from xml.sax.saxutils import escape
from reportlab.lib import colors
from reportlab.lib.pagesizes import landscape, A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.units import mm
from reportlab.platypus import (BaseDocTemplate, Frame, PageTemplate, Paragraph,
                                Table, TableStyle, Spacer, PageBreak,
                                NextPageTemplate, KeepTogether)
from reporting.pdf_common import ensure_fonts

PAGE_W, PAGE_H = landscape(A4)
MARGIN = 34
WIDTH = PAGE_W - 2*MARGIN
PURPLE = colors.HexColor("#411437")
CREAM = colors.HexColor("#F3DEBF")
PALE = colors.HexColor("#F5ECD0")
LIGHT = colors.HexColor("#FFF8EC")
COPPER = colors.HexColor("#A46427")
INK = colors.HexColor("#2B1526")
MUTED = colors.HexColor("#625045")
GRID = colors.HexColor("#A99586")
ALERT = colors.HexColor("#EDCCA6")


def style(name, **values):
    options = {"fontName": "Mont", "fontSize": 7.2, "leading": 10,
               "textColor": INK, "spaceAfter": 0}
    options.update(values)
    return ParagraphStyle(name, **options)


ST = {
    "meta": style("inv-meta", fontSize=7, leading=11, textColor=MUTED),
    "section": style("inv-section", fontName="Mont-Bold", fontSize=10, leading=14,
                     textColor=PURPLE, spaceBefore=10, spaceAfter=6, keepWithNext=True),
    "head": style("inv-head", fontName="Mont-Bold", fontSize=6.6,
                  leading=8.8, textColor=LIGHT),
    "cell": style("inv-cell", fontSize=7, leading=10),
    "name": style("inv-name", fontName="Mont-Bold", fontSize=7, leading=10),
    "num": style("inv-num", fontName="Mont-SemiBold", fontSize=7, leading=10, alignment=TA_RIGHT),
    "note": style("inv-note", fontName="Mont-Light", fontSize=6.3, leading=9, textColor=MUTED),
    "kpi_number": style("inv-kpi-number", fontName="Mont-XBold", fontSize=22,
                        leading=27, textColor=PURPLE),
    "kpi_label": style("inv-kpi-label", fontName="Mont-Bold", fontSize=6.4,
                       leading=9, textColor=MUTED),
    "sig_head": style("inv-sig-head", fontName="Mont-Bold", fontSize=8,
                      leading=11, textColor=PURPLE, alignment=TA_CENTER),
    "sig_role": style("inv-sig-role", fontSize=7, leading=10,
                      textColor=MUTED, alignment=TA_CENTER),
    "sig_name": style("inv-sig-name", fontName="Mont-SemiBold", fontSize=7.2,
                      leading=10, textColor=PURPLE, alignment=TA_CENTER),
}


def para(value, kind="cell"):
    val = "—" if value is None or str(value).strip() == "" else str(value)
    return Paragraph(escape(val).replace("\n", "<br/>"), ST[kind])


def number(value):
    try:
        n = float(value or 0)
        return ("{:,.2f}".format(n).rstrip("0").rstrip(".")).replace(",", " ")
    except (ValueError, TypeError):
        return "0"


def safe_text(value, maximum=240):
    return str(value or "—")[:maximum]


def draw_page(canv, doc, project, first):
    canv.saveState()
    canv.setFillColor(CREAM)
    canv.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    top_height = 99 if first else 34
    canv.setFillColor(PURPLE)
    canv.rect(0, PAGE_H-top_height, PAGE_W, top_height, fill=1, stroke=0)
    canv.setFillColor(COPPER)
    canv.rect(0, PAGE_H-top_height-3, PAGE_W, 3, fill=1, stroke=0)
    canv.setFillColor(LIGHT)
    if first:
        canv.setFont("Mont-XBold", 24)
        canv.drawString(MARGIN, PAGE_H-41, "ESTA ✱")
        canv.setFont("Mont-Light", 7)
        canv.drawString(MARGIN+2, PAGE_H-57, "P R O P E R T Y   M A N A G E M E N T")
        canv.setFont("Mont-Bold", 10)
        canv.drawRightString(PAGE_W-MARGIN, PAGE_H-36,
                             "BÁO CÁO KIỂM SOÁT VẬT TƯ VÀ DỤNG CỤ KỸ THUẬT")
        canv.setFont("Mont-SemiBold", 8.3)
        canv.drawRightString(PAGE_W-MARGIN, PAGE_H-55,
                             safe_text(project.get("period_label", ""),100)+" · DỰ ÁN "+safe_text(project.get("name"),55))
        canv.setFont("Mont-Light", 6.4)
        canv.drawRightString(PAGE_W-MARGIN, PAGE_H-73,
                             "Kỳ kiểm soát: "+safe_text(project.get("range_text"),85))
    else:
        canv.setFont("Mont-XBold", 12.4)
        canv.drawString(MARGIN, PAGE_H-23, "ESTA ✱")
        canv.setFont("Mont-Medium", 7)
        canv.drawRightString(PAGE_W-MARGIN, PAGE_H-22,
                             "BÁO CÁO KIỂM SOÁT VẬT TƯ VÀ DỤNG CỤ KỸ THUẬT · "+safe_text(project.get("name"),60))
    canv.setStrokeColor(COPPER)
    canv.setLineWidth(.65)
    canv.line(MARGIN, 29, PAGE_W-MARGIN, 29)
    canv.setFillColor(MUTED)
    canv.setFont("Mont-Light", 6.5)
    canv.drawString(MARGIN, 18,
                    "ESTA PROPERTY MANAGEMENT · A L'MAK COMPANY · HO CHI MINH CITY")
    canv.drawRightString(PAGE_W-MARGIN, 18, "Trang "+str(doc.page))
    canv.restoreState()


def heading(title):
    return para(title, "section")


def kpis(project):
    total_work = len({str(row.get("task")) for row in project["work"] if row.get("linked")})
    cells = [
        (len(project["materials"]), "TỔNG SỐ VẬT TƯ TIÊU HAO"),
        (len(project["tools"]), "TỔNG DỤNG CỤ KỸ THUẬT"),
        (total_work, "TỔNG HẠNG MỤC CÔNG VIỆC ĐÃ XỬ LÝ"),
    ]
    items = []
    for value, title in cells:
        inner = Table([[para(str(value).zfill(2), "kpi_number")],
                       [para(title, "kpi_label")]], colWidths=[(WIDTH-12)/3-20])
        inner.setStyle(TableStyle([
            ("LEFTPADDING", (0,0), (-1,-1), 0),
            ("RIGHTPADDING", (0,0), (-1,-1), 0),
            ("TOPPADDING", (0,0), (-1,-1), 0),
            ("BOTTOMPADDING", (0,0), (-1,-1), 2),
        ]))
        items.append(inner)
    k = Table([items], colWidths=[WIDTH/3]*3, hAlign="LEFT")
    k.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,-1),PALE),
        ("LINEABOVE",(0,0),(1,0),1.6,PURPLE),
        ("LINEABOVE",(2,0),(2,0),1.6,COPPER),
        ("LINEBEFORE",(1,0),(-1,0),5,CREAM),
        ("LEFTPADDING",(0,0),(-1,-1),10),
        ("RIGHTPADDING",(0,0),(-1,-1),5),
        ("TOPPADDING",(0,0),(-1,-1),5),
        ("BOTTOMPADDING",(0,0),(-1,-1),7),
    ]))
    return k


def data_table(headers, raw_rows, widths, alert_rows=None):
    alert_rows = set(alert_rows or [])
    if abs(sum(widths)-WIDTH) > .05:
        raise ValueError("Chiều rộng bảng báo cáo không hợp lệ")
    body = [[para(x,"head") for x in headers]]
    if not raw_rows:
        body.append([para("Không có dữ liệu trong kỳ","note")] + [""]*(len(headers)-1))
    else:
        for row in raw_rows:
            if len(row)!=len(headers):
                raise ValueError("Dữ liệu hàng không khớp số cột báo cáo")
            body.append([para(x, "name" if col==1 else
                             "num" if col>=2 and isinstance(x,(int,float)) else "cell")
                         for col,x in enumerate(row)])
    t=Table(body,colWidths=widths,repeatRows=1,splitByRow=1,splitInRow=1,hAlign="LEFT")
    commands=[
        ("BACKGROUND",(0,0),(-1,0),PURPLE),
        ("LINEBELOW",(0,0),(-1,0),1,COPPER),
        ("LINEBELOW",(0,1),(-1,-1),.4,GRID),
        ("LINEBEFORE",(0,0),(0,-1),.55,GRID),
        ("LINEAFTER",(-1,0),(-1,-1),.55,GRID),
        ("VALIGN",(0,0),(-1,-1),"TOP"),
        ("LEFTPADDING",(0,0),(-1,-1),4),
        ("RIGHTPADDING",(0,0),(-1,-1),4),
        ("TOPPADDING",(0,0),(-1,-1),5),
        ("BOTTOMPADDING",(0,0),(-1,-1),5),
    ]
    for i in range(1,len(body)):
        commands.append(("BACKGROUND",(0,i),(-1,i),
                         ALERT if i-1 in alert_rows else (CREAM if i%2 else PALE)))
    t.setStyle(TableStyle(commands))
    return t


def signers(project):
    headers=["PHÊ DUYỆT","NGƯỜI KIỂM TRA","NGƯỜI LẬP"]
    roles=["Kỹ sư trưởng","Giám sát kỹ thuật","Kỹ thuật dự án"]
    names=[project.get("approved_by"),project.get("checked_by"),project.get("prepared_by")]
    content=[
        [para(x,"sig_head") for x in headers],
        [para(x,"sig_role") for x in roles],
        [para("(Ký, ghi rõ họ tên)","note") for _ in roles],
        [para(x or "—","sig_name") for x in names],
    ]
    t=Table(content,colWidths=[WIDTH/3]*3,rowHeights=[22,18,30,None])
    t.setStyle(TableStyle([
        ("LINEABOVE",(0,0),(-1,0),1,COPPER),
        ("ALIGN",(0,0),(-1,-1),"CENTER"),
        ("VALIGN",(0,0),(-1,-1),"MIDDLE"),
        ("TOPPADDING",(0,0),(-1,-1),3),
        ("BOTTOMPADDING",(0,0),(-1,-1),3),
    ]))
    return KeepTogether([Spacer(1,14),t])


def project_story(project,selected,from_date,to_date):
    story=[
        para("Dự án: "+safe_text(project.get("name"))+" · Người lập: "+
             safe_text(project.get("prepared_by"))+" · Ngày chốt số liệu: "+
             project.get("report_date","")+" · Căn cứ: sổ kho, phiếu nhập – xuất và kiểm đếm thực tế","meta"),
        Spacer(1,7), kpis(project), Spacer(1,5)
    ]
    if "materials" in selected:
        story += [
            heading("A. VẬT TƯ TIÊU HAO — NHẬP · XUẤT · TỒN "+project["period_label"]),
            data_table(
                ["STT","TÊN VẬT TƯ","ĐVT","TỒN ĐẦU THÁNG","NHẬP","XUẤT","TỒN CUỐI THÁNG",
                 "GHI CHÚ (NGÀY NHẬP – XUẤT, NỘI DUNG)"],
                [[str(i),m["name"],m["unit"],number(m["opening"]),number(m["inbound"]),
                  number(m["outbound"]),number(m["closing"]),safe_text(m.get("note"),1000)]
                 for i,m in enumerate(project["materials"],1)],
                [30,226,38,83,48,48,80,WIDTH-553]),
            Spacer(1,5),
            para("Tồn cuối = Tồn đầu + Nhập − Xuất. Ghi rõ ngày và nội dung phát sinh tại cột Ghi chú.","note"),
        ]
    if "tools" in selected:
        rows=project["tools"]
        alerts=[i for i,t in enumerate(rows) if
                str(t.get("status","")).lower() not in ("tốt","đang sử dụng","bình thường")]
        story += [
            heading("B. DỤNG CỤ KỸ THUẬT — KIỂM KÊ CUỐI "+project["period_label"]),
            data_table(
                ["STT","TÊN DỤNG CỤ","HÃNG","ĐVT","SL","NGƯỜI GIỮ","TÌNH TRẠNG","GHI CHÚ"],
                [[str(i),t["name"],t["brand"],t["unit"],number(t["qty"]),t["keeper"],
                  t["status"],safe_text(t.get("note"),500)] for i,t in enumerate(rows,1)],
                [30,220,71,43,39,94,109,WIDTH-606],alert_rows=alerts),
            Spacer(1,5),para("Dòng nền đậm = hạng mục cần xử lý.","note")
        ]
    if "materials" in selected:
        links = project["work"]
        exceptions = [i for i,t in enumerate(links) if not t.get("linked")]
        story += [
            heading("C. HẠNG MỤC ĐÃ XỬ LÝ — LIÊN KẾT CÔNG VIỆC & VẬT TƯ ĐÃ XUẤT"),
            data_table(
                ["STT","CÔNG VIỆC ĐÃ LIÊN KẾT","NGÀY HOÀN THÀNH","VẬT TƯ ĐÃ XUẤT",
                 "SL XUẤT","ĐVT","NGƯỜI THỰC HIỆN"],
                [[str(i),safe_text(t.get("task"),500),safe_text(t.get("completed")),t["material"],
                  number(t["qty"]),t["unit"],safe_text(t.get("performer"),200)]
                 for i,t in enumerate(links,1)],
                [30,217,76,167,57,42,WIDTH-589],alert_rows=exceptions),
            Spacer(1,5),
            para("Tổng SL vật tư xuất ở mục C đối chiếu cột XUẤT của mục A. "
                 "Các giao dịch chưa liên kết công việc hoàn thành được hiển thị riêng để không bỏ sót số xuất.","note"),
        ]
    story.append(signers(project))
    return story


def build_inventory_control_doc(path, payload):
    ensure_fonts()
    selected=payload.get("selected") or []
    if not isinstance(selected,list) or not selected or any(x not in ("materials","tools") for x in selected):
        raise ValueError("Chỉ hỗ trợ báo cáo Vật tư tiêu hao và Dụng cụ kỹ thuật")
    projects=payload.get("projects") or []
    if not isinstance(projects,list) or not 1<=len(projects)<=8:
        raise ValueError("Số dự án trong báo cáo không hợp lệ")
    if any(not isinstance(p,dict) for p in projects):
        raise ValueError("Dữ liệu dự án không hợp lệ")
    for p in projects:
        for key in ("materials","tools","work"):
            if not isinstance(p.get(key),list) or len(p[key])>2500:
                raise ValueError("Số hàng vật tư/dụng cụ không hợp lệ")
    doc=BaseDocTemplate(path,pagesize=(PAGE_W,PAGE_H),leftMargin=MARGIN,rightMargin=MARGIN,
                        title="ESTA - Báo cáo kiểm soát vật tư và dụng cụ kỹ thuật",
                        author="ESTA Property Management")
    templates=[]
    for i,project in enumerate(projects):
        project["period_label"]=str(payload.get("period_label") or "")[:80]
        project["range_text"]=str(payload.get("period_from",""))+" – "+str(payload.get("period_to",""))
        project["report_date"]=str(payload.get("report_date") or "")[:30]
        for first in (True,False):
            name=("first-" if first else "later-")+str(i)
            top=111 if first else 46
            frame=Frame(MARGIN,37,WIDTH,PAGE_H-top-37,id=name,
                        leftPadding=0,rightPadding=0,topPadding=0,bottomPadding=0)
            def onpage(canv,doc,p=project,f=first):
                draw_page(canv,doc,p,f)
            templates.append(PageTemplate(id=name,frames=[frame],onPage=onpage,
                        autoNextPageTemplate="later-"+str(i) if first else None))
    doc.addPageTemplates(templates)
    story=[]
    for i,project in enumerate(projects):
        if i:
            story.extend([NextPageTemplate("first-"+str(i)),PageBreak()])
        story.extend(project_story(project,selected,payload.get("period_from"),
                                   payload.get("period_to")))
    doc.build(story)
    return sum((len(p["materials"])+len(p["work"]) if "materials" in selected else 0) +
               (len(p["tools"]) if "tools" in selected else 0) for p in projects)
