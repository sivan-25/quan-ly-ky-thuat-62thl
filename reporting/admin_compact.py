# -*- coding: utf-8 -*-
"""Compact ESTA Admin supervision report. No project-level rollup and no invented data."""
from xml.sax.saxutils import escape as xml_escape

from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import HRFlowable, Paragraph, Spacer, Table, TableStyle

from reporting import pdf_common as pdfc


def _style(name, font="Mont", size=7.2, leading=10, color=None):
    return ParagraphStyle(name, fontName=font, fontSize=size,
                          leading=leading, textColor=color or pdfc.AUB,
                          splitLongWords=1)


def story(data):
    """Return report body; caller appends ESTA's existing signature block."""
    pdfc.ensure_fonts()
    width = pdfc.CW
    aub, copper, pale = pdfc.AUB, pdfc.COPPER, pdfc.PALE
    body = _style("adminBody")
    strong = _style("adminStrong", "Mont-SemiBold")
    subtle = _style("adminSubtle", "Mont", 6.9, 9.4, pdfc.STONE)
    head = _style("adminHead", "Mont-Bold", 6.6, 9.0, pale)
    label = _style("adminLabel", "Mont-Bold", 6.3, 8.5, pdfc.STONE)
    value = _style("adminValue", "Mont-Bold", 8, 11)
    section = _style("adminSection", "Mont-Bold", 9.2, 12)
    title = _style("adminTitle", "Mont-Bold", 18, 23)
    kpi_num = [
        _style("adminNumDark", "Mont-XBold", 23, 26, pale),
        _style("adminNumRed", "Mont-XBold", 23, 26, colors.HexColor("#B4434B")),
        _style("adminNumOrange", "Mont-XBold", 23, 26, colors.HexColor("#9B621B")),
        _style("adminNumBlue", "Mont-XBold", 23, 26, colors.HexColor("#2A687C")),
    ]
    kpi_label = _style("adminKpiLabel", "Mont-Bold", 6.5, 9, pdfc.STONE)
    kpi_label_dark = _style("adminKpiLabelDark", "Mont-Bold", 6.5, 9, pale)

    def p(text, style=body):
        content = xml_escape(str(text if text is not None else "—"))
        return Paragraph(content.replace("\n", "<br/>"), style)

    story = [
        p(data.get("title") or "BÁO CÁO GIÁM SÁT KỸ THUẬT", title),
        HRFlowable(width="100%", thickness=1.3, color=copper, spaceBefore=4, spaceAfter=8),
    ]
    meta = Table([[
        p("NGÀY BÁO CÁO", label), p(data.get("report_date") or "—", value),
        p("KỲ BÁO CÁO", label), p(data.get("period_label") or "—", value)
    ]], colWidths=[29 * mm, 55 * mm, 25 * mm, width - 109 * mm])
    meta.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), pale),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 2),
    ]))
    story.extend([meta, Spacer(1, 8)])

    summaries = (data.get("summaries") or [])[:4]
    if summaries:
        gap = 2.5 * mm
        card_width = (width - gap * (len(summaries) - 1)) / len(summaries)
        fills = [aub, colors.HexColor("#F8EAEA"),
                 colors.HexColor("#FFF1DE"), colors.HexColor("#E9F1F6")]
        cells, widths = [], []
        for i, item in enumerate(summaries):
            if i:
                cells.append("")
                widths.append(gap)
            cells.append([
                p(item.get("value") if item.get("value") is not None else "—", kpi_num[min(i, 3)]),
                p(item.get("label") or "", kpi_label_dark if i == 0 else kpi_label),
            ])
            widths.append(card_width)
        cards = Table([cells], colWidths=widths)
        rules = [
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING", (0, 0), (-1, -1), 7),
            ("RIGHTPADDING", (0, 0), (-1, -1), 2),
        ]
        for i in range(len(summaries)):
            rules.append(("BACKGROUND", (i * 2, 0), (i * 2, 0), fills[min(i, 3)]))
        cards.setStyle(TableStyle(rules))
        story.extend([cards, Spacer(1, 11)])

    priority_items = (data.get("priority_items") or [])[:6]
    if priority_items:
        story.extend([p("01  CÔNG VIỆC CẦN ƯU TIÊN XỬ LÝ", section), Spacer(1, 5)])
        pr_rows = [[p(s, head) for s in (
            "STT", "DỰ ÁN", "NỘI DUNG CÔNG VIỆC", "PHỤ TRÁCH", "HẠN", "TÌNH TRẠNG"
        )]]
        for i, item in enumerate(priority_items, 1):
            pr_rows.append([
                p(f"{i:02d}", strong), p(item.get("project") or "—", strong),
                p(item.get("title") or "—"),
                p(item.get("owner") or "—", subtle),
                p(item.get("due") or "—", subtle),
                p(item.get("status") or "Chờ xử lý", strong),
            ])
        pr_table = Table(pr_rows, colWidths=[
            9 * mm, 19 * mm, 59 * mm, 29 * mm, 24 * mm, width - 140 * mm
        ], repeatRows=1, splitByRow=1, splitInRow=1)
        rules = [
            ("BACKGROUND", (0, 0), (-1, 0), aub),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LINEBELOW", (0, 1), (-1, -1), .35, pdfc.TAUPE),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 4),
            ("RIGHTPADDING", (0, 0), (-1, -1), 3),
        ]
        for ri in range(2, len(pr_rows), 2):
            rules.append(("BACKGROUND", (0, ri), (-1, ri), pale))
        pr_table.setStyle(TableStyle(rules))
        story.extend([pr_table, Spacer(1, 11)])

    columns = data.get("columns") or []
    rows = data.get("rows") or []
    if len(columns) != 6:
        raise ValueError("Báo cáo giám sát kỹ thuật cần đúng 6 cột")
    story.extend([p(f"02  DANH SÁCH CÔNG VIỆC  ({len(rows)} bản ghi)", section), Spacer(1, 5)])
    table_rows = [[p(c.get("label") or "", head) for c in columns]]
    for row in rows:
        cells = (list(row) + [""] * 6)[:6]
        table_rows.append([
            p(v, strong if i in (0, 1, 2) else body) for i, v in enumerate(cells)
        ])
    if not rows:
        table_rows.append([p("Không có dữ liệu trong kỳ", subtle)] + [""] * 5)
    weights = [max(.2, float(c.get("weight") or 1)) for c in columns]
    table_widths = [width * x / sum(weights) for x in weights]
    main = Table(table_rows, colWidths=table_widths, repeatRows=1,
                 splitByRow=1, splitInRow=1)
    rules = [
        ("BACKGROUND", (0, 0), (-1, 0), aub),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 3),
        ("LINEBELOW", (0, 1), (-1, -1), .35, pdfc.TAUPE),
    ]
    if not rows:
        rules.append(("SPAN", (0, 1), (-1, 1)))
    for ri in range(1, len(table_rows)):
        if ri % 2 == 0:
            rules.append(("BACKGROUND", (0, ri), (-1, ri), pale))
        if rows:
            status = str(rows[ri - 1][4] if len(rows[ri - 1]) > 4 else "").lower()
            if "quá hạn" in status:
                bg = colors.HexColor("#F8E0E1")
            elif "hoàn thành" in status or "đã xử lý" in status:
                bg = colors.HexColor("#E2F1E6")
            elif "chờ" in status or "đang" in status or "ưu tiên" in status:
                bg = colors.HexColor("#FBEBCF")
            elif "chưa đến hạn" in status:
                bg = colors.HexColor("#E6F0F8")
            else:
                bg = None
            if bg is not None:
                rules.append(("BACKGROUND", (4, ri), (4, ri), bg))
    main.setStyle(TableStyle(rules))
    story.append(main)

    photos = data.get("photos") or []
    if photos:
        story.extend([Spacer(1, 10), p("03  HÌNH ẢNH CÔNG VIỆC", section), Spacer(1, 5)])
        # Each photo is kept intact. Captions are short; no "Ảnh trích".
        for row in pdfc.image_grid(photos, width, cols=2,
                                   cell_height=56 * mm, gap=pdfc.IMAGE_GAP):
            story.extend([row, Spacer(1, 4)])
    return story
