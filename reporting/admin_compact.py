# -*- coding: utf-8 -*-
"""Compact ESTA Admin supervision report. No project-level rollup and no invented data."""
from xml.sax.saxutils import escape as xml_escape

from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.platypus import HRFlowable, Paragraph, Spacer, Table, TableStyle

from reporting import pdf_common as pdfc


def _style(name, font="Mont", size=6.8, leading=9.4, color=None):
    return ParagraphStyle(name, fontName=font, fontSize=size,
                          leading=leading, textColor=color or pdfc.AUB,
                          splitLongWords=1)



# Print-only status indicator. It does not edit or approve the source work record.
PHOTO_STATES = {
    "done": ("Hoàn thành", "#287A4C", "#E2F1E6", "#FFFFFF"),
    "progress": ("Đang thực hiện", "#BE751B", "#FFF0D7", "#FFFFFF"),
    "pending": ("Chưa hoàn thành", "#B04B4B", "#F9E4E4", "#FFFFFF"),
    "overdue": ("Quá hạn", "#AC3042", "#FADEE2", "#FFFFFF"),
    "urgent": ("Cần xử lý", "#AC3042", "#FADEE2", "#FFFFFF"),
    "planned": ("Chưa đến hạn", "#3B718C", "#E7F1FA", "#FFFFFF"),
    "unknown": ("Chưa cập nhật", "#7B817F", "#ECEDED", "#FFFFFF"),
}


def photo_state(code, label=""):
    """Strict status palette with no inferred completion for missing statuses."""
    code = str(code or "unknown").lower()
    if code not in PHOTO_STATES:
        code = "unknown"
    default, stroke, background, foreground = PHOTO_STATES[code]
    # Labels are known UI words; never put untrusted arbitrary text in the badge.
    return code, default, colors.HexColor(stroke), colors.HexColor(background), colors.HexColor(foreground)


class StatusImageSlot(pdfc.ImageSlot):
    """ImageSlot plus a compact status border and small corner badge."""
    BADGE_FONT_SIZE = 5.8
    BADGE_HEIGHT = 12.5
    def __init__(self, width, height, prepared=None, caption="", status_code="unknown", status_label=""):
        super().__init__(width, height, prepared=prepared, caption=caption)
        # Override only this report\'s captions; other ESTA PDFs are untouched.
        self._caption_paragraph = Paragraph(
            xml_escape(self.caption).replace("\\n", "<br/>"),
            _style("adminImageCaption", "Mont-Light", 6.0, 8.2, pdfc.STONE)
        )
        self._caption_paragraph.wrap(max(1, width - 4), 10000)
        self.CAPTION_H = max(9, self._caption_paragraph.height + 4)
        self.status_code, self.status_label, self.status_color, self.status_background, self.status_text = photo_state(
            status_code, status_label
        )

    def draw(self):
        super().draw()
        canvas = self.canv
        canvas.saveState()
        try:
            # Match status colors to the adjacent table without tinting the photo itself.
            y = self.CAPTION_H
            canvas.setStrokeColor(self.status_color)
            canvas.setLineWidth(1.3)
            canvas.rect(1, y + 1, self.width - 2, self.height - 2, stroke=1, fill=0)
            badge_h, font_size = self.BADGE_HEIGHT, self.BADGE_FONT_SIZE
            badge_w = min(self.width - 12, pdfmetrics.stringWidth(self.status_label, "Mont-Bold", font_size) + 14)
            x = self.width - badge_w - 6
            by = y + self.height - badge_h - 6
            canvas.setFillColor(self.status_color)
            canvas.roundRect(x, by, badge_w, badge_h, 4, stroke=0, fill=1)
            canvas.setFillColor(self.status_text)
            canvas.setFont("Mont-Bold", font_size)
            canvas.drawCentredString(x + badge_w / 2, by + 3.5, self.status_label)
        finally:
            canvas.restoreState()


def status_photo_grid(items, available_width, cols=2, cell_height=56*mm, gap=pdfc.IMAGE_GAP):
    """Split photos into independent printable rows for pagination."""
    photos = [item for item in items if item and item.get("prepared")]
    rows = []
    for offset in range(0, len(photos), cols):
        group = photos[offset:offset + cols]
        cell_width = (available_width - gap * (len(group) - 1)) / len(group)
        cells, widths = [], []
        for i, photo in enumerate(group):
            if i:
                cells.append("")
                widths.append(gap)
            cells.append(StatusImageSlot(
                cell_width, cell_height,
                prepared=photo["prepared"], caption=photo.get("caption") or "",
                status_code=photo.get("status_code"),
                status_label=photo.get("status_label")
            ))
            widths.append(cell_width)
        row = Table([cells], colWidths=widths, hAlign="LEFT")
        row.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0)
        ]))
        rows.append(row)
    return rows


def story(data):
    """Return report body; caller appends ESTA's existing signature block."""
    pdfc.ensure_fonts()
    width = pdfc.CW
    aub, copper, pale = pdfc.AUB, pdfc.COPPER, pdfc.PALE
    body = _style("adminBody")
    strong = _style("adminStrong", "Mont-SemiBold")
    subtle = _style("adminSubtle", "Mont", 6.4, 8.9, pdfc.STONE)
    head = _style("adminHead", "Mont-Bold", 6.1, 8.5, pale)
    label = _style("adminLabel", "Mont-Bold", 6.0, 8.1, pdfc.STONE)
    value = _style("adminValue", "Mont-Bold", 7.4, 10)
    section = _style("adminSection", "Mont-Bold", 8.5, 11.2)
    title = _style("adminTitle", "Mont-Bold", 16, 21)
    kpi_num = [
        _style("adminNumDark", "Mont-XBold", 20, 23, pale),
        _style("adminNumRed", "Mont-XBold", 20, 23, colors.HexColor("#B4434B")),
        _style("adminNumOrange", "Mont-XBold", 20, 23, colors.HexColor("#9B621B")),
        _style("adminNumBlue", "Mont-XBold", 20, 23, colors.HexColor("#2A687C")),
    ]
    kpi_label = _style("adminKpiLabel", "Mont-Bold", 6.1, 8.5, pdfc.STONE)
    kpi_label_dark = _style("adminKpiLabelDark", "Mont-Bold", 6.1, 8.5, pale)

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
        for row in status_photo_grid(photos, width, cols=2,
                                     cell_height=56 * mm, gap=pdfc.IMAGE_GAP):
            story.extend([row, Spacer(1, 4)])
    return story
