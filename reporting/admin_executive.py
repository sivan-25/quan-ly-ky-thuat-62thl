# -*- coding: utf-8 -*-
"""ESTA Admin Báo cáo tổng hợp - executive visual option (Kiểu 2).

All figures and observations originate from supplied report items. Kiểu 1 uses
the unchanged admin_compact module and never enters this renderer.
"""
from collections import defaultdict
from datetime import datetime
from xml.sax.saxutils import escape as xml_escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate, Frame, HRFlowable, KeepTogether, PageTemplate,
    Paragraph, Spacer, Table, TableStyle,
)
from reporting import pdf_common as pdfc
from reporting.admin_compact import StatusImageSlot, PHOTO_STATES

PLUM = pdfc.AUB
DARK = pdfc.AUB_D
PAPER = pdfc.CREAM
WARM = colors.HexColor("#F5ECD0")
LINE = colors.HexColor("#BBA38E")
MUTED = colors.HexColor("#746054")
ORANGE = pdfc.COPPER
WHITE = colors.HexColor("#FFF9ED")
RED = colors.HexColor("#B04742")
GREEN = colors.HexColor("#397A4C")
BLUE = colors.HexColor("#46718A")
PAGE_W, PAGE_H = A4
MARGIN = 15 * mm
CONTENT_W = PAGE_W - 2 * MARGIN

PROJECT_LABELS = {
    "62 THL": "Trần Huy Liệu", "68 PĐL": "Phan Đăng Lưu",
    "127 HH": "Hồng Hà", "130 HH": "Hồng Hà",
    "Admin": "Cá nhân"
}
PROJECT_ORDER = ["62 THL", "68 PĐL", "127 HH", "130 HH", "Admin"]


def sty(name, font="Mont", size=6.45, leading=8.45,
        color=PLUM, align=0, **kwargs):
    return ParagraphStyle(
        name, fontName=font, fontSize=size, leading=leading,
        textColor=color, alignment=align, splitLongWords=1,
        wordWrap="LTR", **kwargs
    )


T = {
    "section": sty("execSection", "Mont-Bold", 8.6, 11.1, PLUM),
    "panel_head": sty("execPanelHead", "Mont-Bold", 7.8, 10.0),
    "body": sty("execBody", "Mont", 6.35, 8.25, DARK),
    "body_b": sty("execBodyBold", "Mont-SemiBold", 6.35, 8.25, DARK),
    "muted": sty("execMuted", "Mont", 5.8, 7.6, MUTED),
    "th": sty("execTH", "Mont-Bold", 5.45, 7.1, MUTED),
    "number": sty("execKpiNumber", "Mont-XBold", 16, 18, PLUM),
    "kpi": sty("execKpiLabel", "Mont-Bold", 5.1, 6.8, MUTED),
    "project": sty("execProjectBand", "Mont-Bold", 6.2, 8.0, WHITE),
    "project_sub": sty("execProjectCounter", "Mont-Light", 5.7, 7.2, WHITE),
    "center": sty("execCenter", "Mont-Bold", 5.9, 7.8, DARK, TA_CENTER),
    "note": sty("execNote", "Mont", 6.0, 8.1, DARK),
}


def para(value, style=None):
    value = str("—" if value is None else value)
    return Paragraph(xml_escape(value).replace("\n", "<br/>"), style or T["body"])


def short_date(raw):
    value = str(raw or "").strip()
    if not value:
        return "—"
    try:
        return datetime.strptime(value[:10], "%Y-%m-%d").strftime("%d/%m")
    except ValueError:
        return value[:10]


def _sort_key(project):
    try:
        return (PROJECT_ORDER.index(project), project)
    except ValueError:
        return (len(PROJECT_ORDER), project)


def item_stage(item):
    if not item.get("open"):
        return "done"
    stage = item.get("stage", 2)
    if stage == 0:
        return "overdue"
    if stage == 1:
        return "urgent"
    if stage == 3:
        return "planned"
    return "progress" if "đang" in str(item.get("status") or "").lower() else "pending"


def stage_label(item):
    return {
        "done": "Xong", "overdue": "Quá hạn", "urgent": "Gấp",
        "planned": "KH", "progress": "Đang", "pending": "Chờ"
    }[item_stage(item)]


def _status_bg(item):
    return {
        "done": colors.HexColor("#DBEAD8"),
        "overdue": colors.HexColor("#F2D6D6"),
        "urgent": colors.HexColor("#F2D6D6"),
        "planned": colors.HexColor("#DFEAF2"),
        "progress": colors.HexColor("#EDD3B6"),
        "pending": colors.HexColor("#F6EDCF"),
    }[item_stage(item)]


def _table_styles(row_count, header=True, compact=True):
    style = [
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 3),
        ("RIGHTPADDING", (0, 0), (-1, -1), 2),
        ("TOPPADDING", (0, 0), (-1, -1), 3 if compact else 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2.8 if compact else 4),
        ("LINEBELOW", (0, 0), (-1, -1), .26, LINE)
    ]
    for i in range(2 if header else 1, row_count, 2):
        style.append(("BACKGROUND", (0, i), (-1, i), WARM))
    return style


def _section(text):
    return [
        para(text, T["section"]),
        HRFlowable(width="100%", thickness=.85, color=ORANGE,
                   spaceBefore=2, spaceAfter=5)
    ]


def _kpis(items):
    total = len(items)
    done = sum(not r.get("open") for r in items)
    needs = sum(r.get("open") and item_stage(r) != "planned" for r in items)
    planned = sum(item_stage(r) == "planned" for r in items)
    overdue = sum(item_stage(r) == "overdue" for r in items)
    labels = [
        (total, "TỔNG BẢN GHI"), (done, "HOÀN THÀNH"),
        (needs, "CẦN XỬ LÝ"), (planned, "CHƯA ĐẾN HẠN"), (overdue, "QUÁ HẠN")
    ]
    cells = []
    for number, label in labels:
        cells.append([para(number, T["number"]), para(label, T["kpi"])])
    widths = [CONTENT_W / 5] * 5
    table = Table([cells], colWidths=widths, hAlign="LEFT")
    rules = [
        ("BACKGROUND", (0, 0), (-1, 0), WARM),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 9),
        ("RIGHTPADDING", (0, 0), (-1, -1), 2)
    ]
    for i in range(5):
        rules.append(("LINEBEFORE", (i, 0), (i, 0), 3, ORANGE))
    table.setStyle(TableStyle(rules))
    return table


def _project_overview(items):
    out = [para(text, T["th"]) for text in
           ("DỰ ÁN", "TỔNG", "XONG", "ĐANG", "CHỜ")]
    rows = [out]
    grouped = defaultdict(list)
    for item in items:
        grouped[item["project"]].append(item)
    for project in sorted(grouped, key=_sort_key):
        group = grouped[project]
        done = sum(not t["open"] for t in group)
        doing = sum(t["open"] and item_stage(t) in ("progress", "urgent", "overdue") for t in group)
        waiting = sum(t["open"] and item_stage(t) in ("pending", "planned") for t in group)
        rows.append([
            para(project, T["body_b"]), para(len(group), T["center"]),
            para(done, T["center"]), para(doing, T["center"]),
            para(waiting, T["center"])
        ])
    if len(rows) == 1:
        rows.append([para("Không có bản ghi", T["muted"])] + [""] * 4)
    widths = [38*mm, 13*mm, 12*mm, 12*mm, 12*mm]
    result = Table(rows, colWidths=widths, hAlign="LEFT")
    styles = _table_styles(len(rows))
    styles += [("LINEBELOW", (0, 0), (-1, 0), .8, PLUM)]
    if len(grouped) == 0:
        styles.append(("SPAN", (0, 1), (-1, 1)))
    result.setStyle(TableStyle(styles))
    return result


def _important(items):
    # A factual shortlist, based on real unfinished work; never synthetic prose.
    candidates = [x for x in items if x.get("open") and item_stage(x) != "planned"]
    candidates.sort(key=lambda x: (
        not x.get("starred"), x.get("stage", 2),
        x.get("due") or x.get("date") or "9999", _sort_key(x.get("project"))
    ))
    selected, seen = [], set()
    # Spread items across projects first for a more representative management brief.
    for item in candidates:
        if item["project"] in seen:
            continue
        selected.append(item)
        seen.add(item["project"])
        if len(selected) >= 3:
            break
    for item in candidates:
        if len(selected) >= 3:
            break
        if item not in selected:
            selected.append(item)
    if not selected:
        return [para("Không có công việc cần lưu ý trong dữ liệu đã chọn.", T["muted"])]
    paragraphs = []
    for item in selected:
        title = str(item.get("title") or "—")
        detail = str(item.get("detail") or "").strip()
        if len(detail) > 115:
            detail = detail[:112].rstrip() + "…"
        text = item["project"] + " · " + title
        if detail and detail not in title and detail != "—":
            text += ": " + detail
        paragraphs.append(para("▪ " + text, T["note"]))
    return paragraphs


def _overview(items):
    left_head = _section("THEO DỰ ÁN")
    right_head = _section("ĐIỂM CẦN LƯU Ý")
    left = left_head + [_project_overview(items)]
    right = right_head + _important(items)
    block = Table([[left, right]], colWidths=[93*mm, CONTENT_W - 93*mm], hAlign="LEFT")
    block.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (0, 0), 0),
        ("RIGHTPADDING", (0, 0), (0, 0), 7),
        ("LEFTPADDING", (1, 0), (1, 0), 7),
        ("RIGHTPADDING", (1, 0), (1, 0), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0)
    ]))
    return block


def _pending_table(items):
    grouped = defaultdict(list)
    for item in items:
        if item.get("open"):
            grouped[item["project"]].append(item)
    header = [para(s, T["th"]) for s in
              ("NỘI DUNG", "PHỤ TRÁCH", "NGÀY", "TT", "GHI CHÚ")]
    body = [header]
    group_indices = []
    state_cells = []
    for project in sorted(grouped, key=_sort_key):
        group = grouped[project]
        waiting = sum(item_stage(x) == "pending" for x in group)
        doing = sum(item_stage(x) in ("progress", "urgent", "overdue") for x in group)
        band = project + " · " + PROJECT_LABELS.get(project, "")
        band += f"     {len(group)} việc · {waiting} chờ · {doing} đang"
        group_indices.append(len(body))
        body.append([para(band, T["project"]), "", "", "", ""])
        for item in group:
            index = len(body)
            state_cells.append((index, item))
            detail = item.get("detail") or item.get("result") or ""
            if detail in ("Ok", "OK", "—", "Hằng ngày"):
                detail = ""
            date = short_date(item.get("date"))
            if item.get("due") and str(item["due"]) != str(item.get("date")):
                date += "–" + short_date(item["due"])
            body.append([
                para(item.get("title") or "", T["body"]),
                para(item.get("owner") or "", T["body"]),
                para(date, T["body"]),
                para(stage_label(item), T["center"]),
                para(detail, T["muted"]),
            ])
    if len(body) == 1:
        body.append([para("Không có công việc chưa hoàn thành.", T["muted"])] + [""]*4)
    cols = [64*mm, 27*mm, 23*mm, 12*mm, CONTENT_W - 126*mm]
    table = Table(body, colWidths=cols, repeatRows=1, splitByRow=1,
                  splitInRow=1, hAlign="LEFT")
    rules = _table_styles(len(body))
    rules += [("LINEBELOW", (0, 0), (-1, 0), 1, PLUM)]
    if len(body) == 2 and not grouped:
        rules.append(("SPAN", (0, 1), (-1, 1)))
    for i in group_indices:
        rules += [("BACKGROUND", (0, i), (-1, i), PLUM),
                  ("SPAN", (0, i), (-1, i)),
                  ("TOPPADDING", (0, i), (-1, i), 4)]
        if i + 1 < len(body):
            rules.append(("NOSPLIT", (0, i), (-1, i+1)))
    for i, item in state_cells:
        rules.append(("BACKGROUND", (3, i), (3, i), _status_bg(item)))
    table.setStyle(TableStyle(rules))
    return table


def _completed_table(items):
    done = [item for item in items if not item.get("open")]
    done.sort(key=lambda x: (x.get("date") or "", _sort_key(x.get("project"))))
    body = [[para(s, T["th"]) for s in
             ("NGÀY", "DỰ ÁN", "NỘI DUNG", "PHỤ TRÁCH", "KẾT QUẢ")]]
    for item in done:
        result = item.get("result") or item.get("detail") or ""
        if result in ("Ok", "OK", "—", "Hằng ngày"):
            result = ""
        body.append([
            para(short_date(item.get("date")), T["body"]),
            para(item.get("project") or "", T["body_b"]),
            para(item.get("title") or "", T["body"]),
            para(item.get("owner") or "", T["body"]),
            para(result, T["muted"])
        ])
    if len(body) == 1:
        body.append([para("Không có công việc hoàn thành.", T["muted"])] + [""]*4)
    table = Table(body, colWidths=[15*mm, 20*mm, 84*mm, 26*mm, CONTENT_W - 145*mm],
                  repeatRows=1, splitByRow=1, splitInRow=1, hAlign="LEFT")
    rules = _table_styles(len(body))
    rules.append(("LINEBELOW", (0, 0), (-1, 0), 1, PLUM))
    if not done:
        rules.append(("SPAN", (0, 1), (-1, 1)))
    table.setStyle(TableStyle(rules))
    return table


class ThumbnailSlot(StatusImageSlot):
    """Six small documentary photos per A4 row, with a thin status outline."""
    def __init__(self, width, height, prepared, caption, status_code):
        super().__init__(width, height, prepared=prepared,
                         caption=caption, status_code=status_code)
        self._caption_paragraph = para(caption, sty(
            "execPhotoCaption", "Mont-Light", 4.5, 5.8, MUTED
        ))
        self._caption_paragraph.wrap(max(1, width-2), 10000)
        self.CAPTION_H = max(7, self._caption_paragraph.height + 2)

    def draw(self):
        # Use the base drawing routine instead of StatusImageSlot's large badge.
        pdfc.ImageSlot.draw(self)
        self.canv.saveState()
        self.canv.setStrokeColor(self.status_color)
        self.canv.setLineWidth(.9)
        self.canv.rect(.5, self.CAPTION_H + .5, self.width-1, self.height-1,
                       stroke=1, fill=0)
        self.canv.restoreState()


def _gallery(photos):
    # The executive version intentionally shows a representative subset.
    gallery = [x for x in photos if x.get("prepared")][:12]
    rows = []
    for offset in range(0, len(gallery), 6):
        group = gallery[offset:offset+6]
        gap = 1.2*mm
        width = (CONTENT_W-(len(group)-1)*gap)/len(group)
        cells, widths = [], []
        for i, image in enumerate(group):
            if i:
                cells.append("")
                widths.append(gap)
            cells.append(ThumbnailSlot(
                width, 30*mm,
                image["prepared"],
                image.get("caption") or "",
                image.get("status_code") or "unknown"
            ))
            widths.append(width)
        row = Table([cells], colWidths=widths, hAlign="LEFT")
        row.setStyle(TableStyle([
            ("VALIGN", (0,0), (-1,-1), "TOP"),
            ("LEFTPADDING", (0,0), (-1,-1), 0),
            ("RIGHTPADDING", (0,0), (-1,-1), 0),
            ("TOPPADDING", (0,0), (-1,-1), 0),
            ("BOTTOMPADDING", (0,0), (-1,-1), 0)
        ]))
        rows += [row, Spacer(1, 3*mm)]
    return rows


def _header(c, doc, data):
    pdfc.draw_background(c)
    c.saveState()
    band = 22*mm
    c.setFillColor(PLUM)
    c.rect(0, PAGE_H-band, PAGE_W, band, fill=1, stroke=0)
    c.setFillColor(ORANGE)
    c.rect(0, PAGE_H-band-1.2, PAGE_W, 1.2, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont("Mont-Bold", 16)
    c.drawString(MARGIN, PAGE_H-11*mm, "* ESTA")
    c.setFont("Mont-Light", 5.6)
    c.drawString(MARGIN+2*mm, PAGE_H-16*mm, "PROPERTY MANAGEMENT")
    c.setFont("Mont-Bold", 9)
    c.drawRightString(PAGE_W-MARGIN, PAGE_H-10.6*mm, "BÁO CÁO GIÁM SÁT KỸ THUẬT")
    period = str(data.get("period_label") or "")
    report_date = str(data.get("report_date") or "")
    if period or report_date:
        c.setFont("Mont", 6.6)
        c.drawRightString(PAGE_W-MARGIN, PAGE_H-16.5*mm,
                          (period + (" · LẬP NGÀY "+report_date if report_date else ""))[:100])
    c.restoreState()


def build_executive_doc(path, data, signature_fn):
    """Vector PDF. Page count grows naturally; records are never silently dropped."""
    pdfc.ensure_fonts()
    items = list(data.get("executive_items") or [])
    photos = list(data.get("photos") or [])
    total_photos = int(data.get("executive_image_count") or len(photos))
    doc = BaseDocTemplate(
        path, pagesize=A4, title="ESTA - Báo cáo giám sát kỹ thuật (Kiểu 2)",
        author="ESTA Property Management", leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=27*mm, bottomMargin=19*mm
    )
    frame = Frame(MARGIN, 20*mm, CONTENT_W, PAGE_H-48*mm,
                  leftPadding=0, rightPadding=0,
                  topPadding=0, bottomPadding=0, id="executive")
    doc.addPageTemplates(PageTemplate(
        id="executive", frames=[frame],
        onPage=lambda canvas, d: _header(canvas, d, data)
    ))
    done = sum(not x.get("open") for x in items)
    open_count = sum(x.get("open") for x in items)
    story = [
        Spacer(1, 3),
        _kpis(items), Spacer(1, 9),
        _overview(items), Spacer(1, 9)
    ]
    story += _section(f"I. VIỆC CHƯA HOÀN THÀNH  ·  {open_count} bản ghi")
    story += [_pending_table(items), Spacer(1, 10)]
    story += _section(f"II. VIỆC ĐÃ HOÀN THÀNH  ·  {done} bản ghi")
    story += [_completed_table(items), Spacer(1, 8)]
    if photos:
        story += _section(f"III. HÌNH ẢNH TIÊU BIỂU  ·  {min(len(photos),12)} / {max(total_photos,len(photos))} ảnh")
        story += _gallery(photos)
    story.append(signature_fn(data))
    doc.build(story, canvasmaker=pdfc.NumberedCanvas)
