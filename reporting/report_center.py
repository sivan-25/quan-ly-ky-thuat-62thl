"""Vector PDF for the report center. Existing module PDFs keep their templates."""
import io
import os
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import urlparse
from xml.sax.saxutils import escape

from PIL import Image as PILImage, ImageOps
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import (
    BaseDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether,
    Image, PageBreak, Frame, PageTemplate, HRFlowable,
)

# ESTA corporate PDF palette — shared with the established module reports.
AUB = colors.HexColor("#411437")
AUB_D = colors.HexColor("#2B1526")
CREAM = colors.HexColor("#F3DEBF")
CREAM_L = colors.HexColor("#F5ECD0")
COPPER = colors.HexColor("#A46427")
TAUPE = colors.HexColor("#A99586")
STONE = colors.HexColor("#625045")
PALE = colors.HexColor("#FFF8EC")

NAVY = AUB
INK = AUB_D
MUTED = STONE
TEAL = COPPER
LINE = TAUPE
SOFT = CREAM_L
TONES = {
    "good": ("#411437", "#F5ECD0"),
    "watch": ("#A46427", "#FFF1D8"),
    "danger": ("#8A2635", "#F9E5E6"),
    "info": ("#625045", "#F5ECD0"),
    "muted": ("#7F7168", "#F2E8D8"),
}
WIDTH = A4[0] - 32 * mm
FOOTER = "ESTA PROPERTY MANAGEMENT  ·  A L'MAK COMPANY  ·  HO CHI MINH CITY"


class ReportCanvas(Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._page_states = []

    def showPage(self):
        self._page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        total = len(self._page_states)
        for page in self._page_states:
            self.__dict__.update(page)
            self.saveState()
            self.setStrokeColor(COPPER)
            self.setLineWidth(1.5)
            self.line(16 * mm, 16 * mm, A4[0] - 16 * mm, 16 * mm)
            self.setFont("Mont-Light", 6.2)
            self.setFillColor(STONE)
            self.drawString(16 * mm, 11 * mm, FOOTER)
            self.setFont("Mont-Light", 6.8)
            self.drawRightString(A4[0] - 16 * mm, 11 * mm, f"Trang {self._pageNumber} / {total}")
            self.restoreState()
            Canvas.showPage(self)
        Canvas.save(self)


def styles():
    def style(name, **options):
        values = dict(fontName="Mont", fontSize=8, leading=12, textColor=INK, spaceAfter=0)
        values.update(options)
        return ParagraphStyle(name, **values)
    return {
        "body": style("rc-body", textColor=AUB_D),
        "small": style("rc-small", fontName="Mont-Light", fontSize=7, leading=10, textColor=STONE),
        "eyebrow": style("rc-eyebrow", fontName="Mont-Bold", fontSize=7.5, leading=10, textColor=COPPER),
        "head": style("rc-head", fontName="Mont-Bold", fontSize=17, leading=23, textColor=AUB, spaceAfter=8),
        "section": style("rc-section", fontName="Mont-SemiBold", fontSize=10.5, leading=15, textColor=AUB, spaceBefore=14, spaceAfter=6, keepWithNext=True),
        "th": style("rc-th", fontName="Mont-SemiBold", fontSize=6.8, leading=9.5, textColor=PALE),
        "meta_label": style("rc-meta-label", fontName="Mont-Bold", fontSize=6.5, leading=9, textColor=STONE),
        "meta_value": style("rc-meta-value", fontName="Mont-Bold", fontSize=8.2, leading=11, textColor=AUB),
        "kpi": style("rc-kpi", fontName="Mont-Bold", fontSize=22, leading=29, textColor=AUB),
        "kpi_inv": style("rc-kpi-inv", fontName="Mont-Bold", fontSize=22, leading=29, textColor=PALE),
        "kpi_label": style("rc-kpi-label", fontName="Mont-Bold", fontSize=6.5, leading=9, textColor=STONE),
        "kpi_label_inv": style("rc-kpi-label-inv", fontName="Mont-Bold", fontSize=6.5, leading=9, textColor=CREAM),
    }


def para(value, style):
    return Paragraph(escape(str(value if value is not None else "—")).replace("\n", "<br/>"), style)


def data_table(columns, rows, st, widths=None):
    if not columns:
        raise ValueError("Báo cáo thiếu tiêu đề bảng")
    body = [[para(v, st["th"]) for v in columns]]
    tones = []
    for ri, row in enumerate(rows, 1):
        if not isinstance(row, list) or len(row) != len(columns):
            raise ValueError("Số cột báo cáo không khớp")
        cells = []
        for ci, cell in enumerate(row):
            if isinstance(cell, dict):
                tone = TONES.get(cell.get("tone"), TONES["muted"])
                pstyle = ParagraphStyle("rc-state", parent=st["body"], textColor=colors.HexColor(tone[0]), fontSize=7)
                cells.append(para(cell.get("text", "—"), pstyle))
                tones.append(("BACKGROUND", (ci, ri), (ci, ri), colors.HexColor(tone[1])))
            else:
                cells.append(para(cell, st["body"]))
        body.append(cells)
    if not rows:
        body.append([para("Chưa có dữ liệu trong phạm vi báo cáo.", st["small"])] + [""] * (len(columns) - 1))
    table = Table(body, colWidths=widths or [WIDTH / len(columns)] * len(columns), repeatRows=1, hAlign="LEFT", splitByRow=1, splitInRow=1)
    commands = [
        ("BACKGROUND", (0, 0), (-1, 0), AUB),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LINEBELOW", (0, 0), (-1, 0), 1.2, COPPER),
        ("LINEBELOW", (0, 1), (-1, -1), .35, TAUPE),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]
    if not rows:
        commands.append(("SPAN", (0, 1), (-1, 1)))
    else:
        for ri in range(2, len(body), 2):
            commands.append(("BACKGROUND", (0, ri), (-1, ri), CREAM_L))
        commands.append(("LINEBELOW", (0, len(body) - 1), (-1, len(body) - 1), 1.2, COPPER))
    table.setStyle(TableStyle(commands + tones))
    return table


def _prepare_photo(index_photo, data, token, temp_dir, downloader):
    index, photo = index_photo
    ref = str(photo.get("ref") or "")
    caption = str(photo.get("caption") or f"Ảnh {index + 1}")
    try:
        if ref.startswith("storage:"):
            storage_path = ref[8:]
            building_id = str(data.get("building_id") or "")
            encoded_segment = "b-" + "".join(f"{byte:02x}" for byte in building_id.encode("utf-8"))
            # Accept both the current encoded project folder and the legacy plain-id folder.
            if not (storage_path.startswith(encoded_segment + "/") or storage_path.startswith(building_id + "/")):
                raise ValueError("Ảnh không thuộc dự án báo cáo")
        elif ref.startswith("data:image/"):
            pass
        else:
            url = urlparse(ref)
            if url.scheme != "https" or url.hostname != "upcjcrycahdfroxggsdz.supabase.co" or not url.path.startswith("/storage/v1/object/"):
                raise ValueError("Nguồn ảnh chưa được hỗ trợ")
        raw, _ = downloader(ref, token)
        if not raw:
            raise ValueError("Không tải được ảnh")
        with PILImage.open(io.BytesIO(raw)) as source:
            image = ImageOps.exif_transpose(source).convert("RGB")
            image.thumbnail((1600, 1600))
            width, height = image.size
            path = os.path.join(temp_dir, f"operations-{index}.jpg")
            image.save(path, "JPEG", quality=82, optimize=True)
        return {"path": path, "width": width, "height": height, "caption": caption, "missing": False}
    except Exception:
        return {"path": None, "width": 1, "height": 1, "caption": caption, "missing": True}


def _page_functions(data):
    title = "BÁO CÁO VẬN HÀNH KỸ THUẬT"
    period = str(data.get("period_label") or "").upper()
    building = str(data.get("building") or "DỰ ÁN").upper()

    def background(canvas):
        canvas.setFillColor(CREAM)
        canvas.rect(0, 0, A4[0], A4[1], stroke=0, fill=1)

    def first(canvas, doc):
        background(canvas)
        band = 38 * mm
        canvas.setFillColor(AUB)
        canvas.rect(0, A4[1] - band, A4[0], band, stroke=0, fill=1)
        canvas.setFillColor(COPPER)
        canvas.rect(0, A4[1] - band - 1.5, A4[0], 1.5, stroke=0, fill=1)

        logo_x = 49 * mm
        canvas.setFillColor(PALE)
        canvas.setFont("Mont-Bold", 22)
        canvas.drawCentredString(logo_x, A4[1] - 15.5 * mm, "ESTA")
        canvas.setFont("Mont-Light", 6.2)
        canvas.setFillColor(CREAM)
        canvas.drawCentredString(logo_x, A4[1] - 20.5 * mm, "PROPERTY MANAGEMENT")
        canvas.setFont("Mont-SemiBold", 7.2)
        canvas.drawCentredString(logo_x, A4[1] - 28.2 * mm, building)

        canvas.setFillColor(CREAM)
        canvas.setFont("Mont-Bold", 8.5)
        canvas.drawRightString(A4[0] - 16 * mm, A4[1] - 17 * mm, title)
        canvas.setFont("Mont-Light", 6.8)
        canvas.drawRightString(A4[0] - 16 * mm, A4[1] - 23 * mm, period)

    def later(canvas, doc):
        background(canvas)
        band = 12 * mm
        canvas.setFillColor(AUB)
        canvas.rect(0, A4[1] - band, A4[0], band, stroke=0, fill=1)
        canvas.setFillColor(COPPER)
        canvas.rect(0, A4[1] - band - 1.2, A4[0], 1.2, stroke=0, fill=1)
        canvas.setFillColor(CREAM)
        canvas.setFont("Mont-SemiBold", 6.2)
        canvas.drawString(16 * mm, A4[1] - 7.3 * mm, "ESTA  ·  " + building)
        canvas.setFont("Mont-Light", 6.0)
        canvas.drawRightString(A4[0] - 16 * mm, A4[1] - 7.3 * mm, title + ("  ·  " + period if period else ""))

    return first, later


def _meta_table(data, sections, st):
    period = data.get("range") or {}
    from_date = str(period.get("from") or "—")
    to_date = str(period.get("to") or "—")
    rows = [
        [
            para("KỲ BÁO CÁO", st["meta_label"]),
            para(str(data.get("period_label") or from_date + " – " + to_date), st["meta_value"]),
            para("NGÀY LẬP", st["meta_label"]),
            para(data.get("report_date") or "—", st["meta_value"]),
        ],
        [
            para("PHẠM VI", st["meta_label"]),
            para(from_date + " – " + to_date, st["meta_value"]),
            para("HẠNG MỤC", st["meta_label"]),
            para(str(len(sections)) + " hạng mục đã chọn", st["meta_value"]),
        ],
    ]
    table = Table(rows, colWidths=[28 * mm, 59 * mm, 28 * mm, WIDTH - 115 * mm])
    table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LINEBELOW", (0, 0), (-1, -1), .4, TAUPE),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ]))
    return table


def _signature_block(data, st):
    name = str(data.get("kt_signer_name") or "").strip()
    path = str(data.get("_kt_signature_path") or data.get("kt_signature_path") or "").strip()
    if not name:
        raise ValueError("Chưa có họ và tên người ký KT")
    signature = ""
    if path and os.path.exists(path):
        with PILImage.open(path) as source:
            iw, ih = source.size
        scale = min((58 * mm) / max(iw, 1), (18 * mm) / max(ih, 1))
        signature = Image(path, width=max(1, iw * scale), height=max(1, ih * scale), hAlign="CENTER")
    signed_name = ParagraphStyle("rc-signed-name", parent=st["meta_value"], alignment=1, fontSize=8, leading=10)
    signed_head = ParagraphStyle("rc-signed-head", parent=st["meta_label"], alignment=1, fontSize=7, leading=10)
    table = Table([
        [para("KỸ THUẬT (KT)", signed_head), para("KIỂM SOÁT / GIÁM SÁT (KST)", signed_head)],
        [signature, ""],
        [para(name, signed_name), ""],
    ], colWidths=[WIDTH / 2] * 2, rowHeights=[None, 20 * mm, None])
    table.setStyle(TableStyle([
        ("LINEABOVE", (0, 0), (-1, 0), 1.5, COPPER),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, 0), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
        ("LINEBELOW", (0, 2), (-1, 2), .4, TAUPE),
    ]))
    return KeepTogether([Spacer(1, 8), table])


def _photo_flowable(photo, cell_width, max_height, st):
    scale = min((cell_width - 6) / photo["width"], max_height / photo["height"])
    img = Image(photo["path"], width=photo["width"] * scale, height=photo["height"] * scale, hAlign="CENTER")
    return [img, Spacer(1, 6), para(photo["caption"], st["small"])]


def build_operations_doc(path, data, token, temp_dir, downloader):
    sections = data.get("sections")
    if not isinstance(sections, list) or not sections:
        raise ValueError("Chọn ít nhất một hạng mục báo cáo")
    if any(not isinstance(s, dict) or not isinstance(s.get("rows"), list) or not isinstance(s.get("columns"), list) for s in sections):
        raise ValueError("Dữ liệu hạng mục không hợp lệ")
    photos = data.get("photos") or []
    if not isinstance(photos, list) or any(not isinstance(p, dict) for p in photos):
        raise ValueError("Danh sách ảnh không hợp lệ")

    st = styles()
    story = [
        para("PHẦN 1  ·  TỔNG HỢP VẬN HÀNH", st["eyebrow"]),
        Spacer(1, 3),
        para("Báo cáo vận hành kỹ thuật", st["head"]),
        HRFlowable(width="100%", thickness=1.5, color=COPPER, spaceBefore=3, spaceAfter=8),
        _meta_table(data, sections, st),
        Spacer(1, 10),
    ]

    counts = data.get("counts") or {}
    kpis = [
        [str(counts.get("records", sum(len(s["rows"]) for s in sections))), "BẢN GHI", True],
        [str(counts.get("done")) if counts.get("done") is not None else "—", "HOÀN THÀNH", False],
        [str(len(photos)), "ẢNH HIỆN TRƯỜNG", False],
    ]
    cells = []
    widths = []
    gap = 3 * mm
    card_w = (WIDTH - 2 * gap) / 3
    for idx, (number, label, dark) in enumerate(kpis):
        if idx:
            cells.append("")
            widths.append(gap)
        cells.append([
            para(number, st["kpi_inv" if dark else "kpi"]),
            para(label, st["kpi_label_inv" if dark else "kpi_label"]),
        ])
        widths.append(card_w)
    kpi_table = Table([cells], colWidths=widths)
    kpi_style = [
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
        ("LEFTPADDING", (0, 0), (-1, -1), 9),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("BACKGROUND", (0, 0), (0, 0), AUB),
    ]
    for ci in range(2, len(cells), 2):
        kpi_style += [("BACKGROUND", (ci, 0), (ci, 0), CREAM_L), ("LINEABOVE", (ci, 0), (ci, 0), 2, COPPER)]
    kpi_table.setStyle(TableStyle(kpi_style))
    story.extend([kpi_table, para("01 · Tổng quan hạng mục", st["section"])])

    summary = [[s.get("title", ""), str(s.get("count", len(s["rows"]))), s.get("scope", "Trong kỳ")] for s in sections]
    story.append(data_table(["Hạng mục", "Bản ghi", "Phạm vi dữ liệu"], summary, st, [WIDTH * .36, WIDTH * .13, WIDTH * .51]))

    health = data.get("health") or []
    if health:
        story.extend([Spacer(1, 9), data_table(
            ["Nội dung", "Trạng thái ghi nhận"],
            [[x.get("label"), {"text": x.get("text"), "tone": x.get("tone")}] for x in health],
            st,
        )])

    energy = data.get("energy_totals") or []
    if energy:
        story.append(para("Chênh lệch năng lượng đã ghi nhận", st["section"]))
        story.append(data_table(
            ["Đồng hồ / Hạng mục", "Chênh lệch hợp lệ", "Đơn vị"],
            [[x.get("label"), x.get("value"), x.get("unit")] for x in energy],
            st,
        ))
        story.extend([
            Spacer(1, 5),
            para("Tính từ chênh lệch tại các ngày ghi số trong kỳ, gồm mốc liền trước nếu có. Dấu “—” nghĩa là chưa đủ mốc để tính.", st["small"]),
        ])

    story.append(para("02 · Chi tiết theo hạng mục", st["section"]))
    for section in sections:
        story.append(para(section.get("title", "Hạng mục"), st["section"]))
        story.extend([para(section.get("scope", "Trong kỳ"), st["small"]), Spacer(1, 5)])
        n = len(section["columns"])
        weights = [1] * n
        if section.get("id") in ("work", "incident", "contractor") and n == 5:
            weights = [1.1, 2.5, 1.5, 1.1, 1.4]
        if section.get("id") == "inspection" and n == 4:
            weights = [1.6, 2, 1, 2]
        story.append(data_table(section["columns"], section["rows"], st, [WIDTH * w / sum(weights) for w in weights]))

    if data.get("schedule"):
        story.append(para("Lịch bảo trì hiện tại", st["section"]))
        story.extend([
            para("Lịch mới nhất tại ngày lập, không đại diện trạng thái thiết bị trong quá khứ.", st["small"]),
            Spacer(1, 5),
            data_table(
                ["Thiết bị", "Hạn tiếp theo", "Kế hoạch"],
                [[x.get("name"), x.get("due"), x.get("status")] for x in data["schedule"]],
                st,
                [WIDTH * .55, WIDTH * .2, WIDTH * .25],
            ),
        ])

    story.append(para("03 · Ghi chú, tồn tại & kiến nghị", st["section"]))
    notes = data.get("notes") or []
    if notes:
        for item in notes:
            story.extend([para(str(item.get("source") or "Ghi chú") + ": " + str(item.get("text") or ""), st["body"]), Spacer(1, 6)])
    else:
        story.append(para("Chưa có ghi chú, tồn tại hoặc kiến nghị được nhập cho các bản ghi đã chọn.", st["small"]))

    missing = 0
    if photos:
        with ThreadPoolExecutor(max_workers=4) as pool:
            images = list(pool.map(lambda item: _prepare_photo(item, data, token, temp_dir, downloader), enumerate(photos)))
        missing = sum(x["missing"] for x in images)
        images = [x for x in images if not x["missing"] and x["path"]]
        if images:
            story.extend([PageBreak(), para("PHẦN 2  ·  HÌNH ẢNH HIỆN TRƯỜNG", st["eyebrow"]), Spacer(1, 3), para("Hình ảnh đính kèm", st["head"]), HRFlowable(width="100%", thickness=1.5, color=COPPER, spaceBefore=3, spaceAfter=8)])
            layout = str(data.get("photo_layout") or "auto")
            index = 0
            while index < len(images):
                first = images[index]
                if layout == "1":
                    pair = False
                elif layout == "2":
                    pair = index + 1 < len(images)
                else:
                    pair = (
                        first["height"] > first["width"] * 1.1
                        and index + 1 < len(images)
                        and images[index + 1]["height"] > images[index + 1]["width"] * 1.1
                    )
                group = images[index:index + (2 if pair else 1)]
                if len(group) == 2:
                    gap = 4 * mm
                    cell_width = (WIDTH - gap) / 2
                    cells = [_photo_flowable(photo, cell_width, 96 * mm, st) for photo in group]
                    row = Table([[cells[0], "", cells[1]]], colWidths=[cell_width, gap, cell_width])
                else:
                    cell_width = WIDTH
                    photo = group[0]
                    max_height = 150 * mm if photo["height"] > photo["width"] else 105 * mm
                    row = Table([[_photo_flowable(photo, cell_width, max_height, st)]], colWidths=[WIDTH])
                row.setStyle(TableStyle([
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 3),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 3),
                    ("TOPPADDING", (0, 0), (-1, -1), 3),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
                ]))
                story.append(KeepTogether([row]))
                index += len(group)

    story.append(_signature_block(data, st))

    first_page, later_page = _page_functions(data)
    doc = BaseDocTemplate(
        path,
        pagesize=A4,
        title="ESTA - Báo cáo vận hành kỹ thuật",
        author="ESTA Property Management",
        subject="Báo cáo vận hành kỹ thuật",
        creator="ESTA Property Management",
        leftMargin=16 * mm,
        rightMargin=16 * mm,
    )
    first_frame = Frame(16 * mm, 21 * mm, WIDTH, A4[1] - 38 * mm - 8 * mm - 21 * mm, id="rc-first", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    later_frame = Frame(16 * mm, 21 * mm, WIDTH, A4[1] - 12 * mm - 8 * mm - 21 * mm, id="rc-later", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    doc.addPageTemplates([
        PageTemplate("first", [first_frame], onPage=first_page, autoNextPageTemplate="later"),
        PageTemplate("later", [later_frame], onPage=later_page),
    ])
    doc.build(story, canvasmaker=ReportCanvas)
    return missing, sum(int(s.get("count", len(s["rows"]))) for s in sections)
