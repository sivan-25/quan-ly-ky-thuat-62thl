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
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether,
    Image, PageBreak,
)

NAVY = colors.HexColor("#173f70")
INK = colors.HexColor("#203449")
MUTED = colors.HexColor("#64768b")
TEAL = colors.HexColor("#0088a6")
LINE = colors.HexColor("#dce5ec")
SOFT = colors.HexColor("#f4f8fb")
TONES = {
    "good": ("#22694d", "#eaf5ee"),
    "watch": ("#916218", "#fff4da"),
    "danger": ("#a63844", "#fdebed"),
    "info": ("#286893", "#eaf3fa"),
    "muted": ("#64768b", "#f1f4f7"),
}
WIDTH = A4[0] - 32 * mm


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
            self.setStrokeColor(LINE)
            self.line(16 * mm, 13 * mm, A4[0] - 16 * mm, 13 * mm)
            self.setFont("Mont", 6.5)
            self.setFillColor(MUTED)
            self.drawString(16 * mm, 9 * mm, "ESTA PROPERTY MANAGEMENT")
            self.drawRightString(A4[0] - 16 * mm, 9 * mm, f"Trang {self._pageNumber} / {total}")
            self.restoreState()
            Canvas.showPage(self)
        Canvas.save(self)


def styles():
    def style(name, **options):
        values = dict(fontName="Mont", fontSize=8, leading=12, textColor=INK, spaceAfter=0)
        values.update(options)
        return ParagraphStyle(name, **values)
    return {
        "body": style("rc-body"),
        "small": style("rc-small", fontSize=7, leading=10, textColor=MUTED),
        "head": style("rc-head", fontName="Mont-Bold", fontSize=17, leading=23, textColor=NAVY, spaceAfter=8),
        "section": style("rc-section", fontName="Mont-SemiBold", fontSize=11, leading=16, textColor=NAVY, spaceBefore=16, spaceAfter=7, keepWithNext=True),
        "th": style("rc-th", fontName="Mont-SemiBold", fontSize=7, leading=10, textColor=NAVY),
        "kpi": style("rc-kpi", fontName="Mont-Bold", fontSize=22, leading=29, textColor=NAVY),
        "brand": style("rc-brand", fontName="Mont-Bold", fontSize=23, leading=28, textColor=NAVY),
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
        ("BACKGROUND", (0, 0), (-1, 0), SOFT),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LINEBELOW", (0, 0), (-1, 0), .7, LINE),
        ("LINEBELOW", (0, 1), (-1, -1), .35, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]
    if not rows:
        commands.append(("SPAN", (0, 1), (-1, 1)))
    table.setStyle(TableStyle(commands + tones))
    return table


def _prepare_photo(index_photo, data, token, temp_dir, downloader):
    index, photo = index_photo
    ref = str(photo.get("ref") or "")
    caption = str(photo.get("caption") or f"Ảnh {index + 1}")
    try:
        if ref.startswith("storage:"):
            if not ref[8:].startswith(str(data.get("building_id")) + "/"):
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
    story = []
    brand = Table([[para("ESTA", st["brand"]), para("BÁO CÁO VẬN HÀNH KỸ THUẬT\n" + str(data.get("period_label") or ""), st["th"])], [para("PROPERTY MANAGEMENT", st["small"]), ""]], colWidths=[WIDTH * .4, WIDTH * .6])
    brand.setStyle(TableStyle([("LINEBELOW", (0, -1), (-1, -1), 1.5, NAVY), ("VALIGN", (0, 0), (-1, -1), "MIDDLE"), ("BOTTOMPADDING", (0, -1), (-1, -1), 12)]))
    story.extend([brand, Spacer(1, 15), para(str(data.get("building") or "Chưa cập nhật dự án"), st["head"])])
    period = data.get("range") or {}
    dates = str(period.get("from") or "") + " – " + str(period.get("to") or "")
    info = data_table(["Kỳ báo cáo", "Ngày lập", "Người lập"], [[dates, data.get("report_date") or "—", data.get("prepared_by") or "Chưa cập nhật"]], st)
    story.extend([info, Spacer(1, 13)])
    counts = data.get("counts") or {}
    kpis = [
        [str(counts.get("records", sum(len(s["rows"]) for s in sections))), "BẢN GHI", f"{len(sections)} hạng mục đã chọn"],
        [str(counts.get("done")) if counts.get("done") is not None else "—", "HOÀN THÀNH", "Trong công việc của kỳ" if counts.get("tasks") is not None else "Chưa chọn Công việc"],
        [str(len(photos)), "ẢNH HIỆN TRƯỜNG", "Đính kèm cuối báo cáo"],
    ]
    kt = Table([[[para(n, st["kpi"]), para(label, st["th"]), Spacer(1, 4), para(desc, st["small"])] for n, label, desc in kpis]], colWidths=[WIDTH / 3] * 3)
    kt.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), SOFT), ("BOX", (0, 0), (-1, -1), .5, LINE), ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 12), ("TOPPADDING", (0, 0), (-1, -1), 10), ("BOTTOMPADDING", (0, 0), (-1, -1), 10)]))
    story.extend([kt, para("01 · Tổng quan hạng mục", st["section"])])
    summary = [[s.get("title", ""), str(s.get("count", len(s["rows"]))), s.get("scope", "Trong kỳ")] for s in sections]
    story.append(data_table(["Hạng mục", "Bản ghi", "Phạm vi dữ liệu"], summary, st, [WIDTH * .36, WIDTH * .13, WIDTH * .51]))
    health = data.get("health") or []
    if health:
        story.append(Spacer(1, 10))
        story.append(data_table(["Nội dung", "Trạng thái ghi nhận"], [[x.get("label"), {"text": x.get("text"), "tone": x.get("tone")}] for x in health], st))
    energy = data.get("energy_totals") or []
    if energy:
        story.append(para("Chênh lệch năng lượng đã ghi nhận", st["section"]))
        story.append(data_table(["Đồng hồ / Hạng mục", "Chênh lệch hợp lệ", "Đơn vị"], [[x.get("label"), x.get("value"), x.get("unit")] for x in energy], st))
        story.extend([Spacer(1, 5), para("Tính từ chênh lệch tại các ngày ghi số trong kỳ, gồm mốc liền trước nếu có. Chênh lệch âm được giữ ở bảng chi tiết và không cộng vào tiêu thụ. Dấu —: chưa đủ mốc để tính.", st["small"])])
    story.append(para("02 · Chi tiết theo hạng mục", st["section"]))
    for section in sections:
        story.append(para(section.get("title", "Hạng mục"), st["section"]))
        story.extend([para(section.get("scope", "Trong kỳ"), st["small"]), Spacer(1, 6)])
        n = len(section["columns"])
        weights = [1] * n
        if section.get("id") in ("work", "incident", "contractor") and n == 5:
            weights = [1.1, 2.5, 1.5, 1.1, 1.4]
        if section.get("id") == "inspection" and n == 4:
            weights = [1.6, 2, 1, 2]
        story.append(data_table(section["columns"], section["rows"], st, [WIDTH * w / sum(weights) for w in weights]))
    if data.get("schedule"):
        story.append(para("Lịch bảo trì hiện tại", st["section"]))
        story.append(para("Lịch mới nhất tại ngày lập, không đại diện trạng thái thiết bị trong quá khứ.", st["small"]))
        story.append(Spacer(1, 6))
        story.append(data_table(["Thiết bị", "Hạn tiếp theo", "Kế hoạch"], [[x.get("name"), x.get("due"), x.get("status")] for x in data["schedule"]], st, [WIDTH * .55, WIDTH * .2, WIDTH * .25]))
    story.append(para("03 · Ghi chú, tồn tại & kiến nghị", st["section"]))
    notes = data.get("notes") or []
    if notes:
        for item in notes:
            story.extend([para(str(item.get("source") or "Ghi chú") + ": " + str(item.get("text") or ""), st["body"]), Spacer(1, 7)])
    else:
        story.append(para("Chưa có ghi chú, tồn tại hoặc kiến nghị được nhập cho các bản ghi đã chọn.", st["small"]))
    story.append(Spacer(1, 12))
    signatures = Table([[para("KỸ THUẬT (KT)", st["th"]), para("KIỂM SOÁT (KST)", st["th"])], [para("Ký, ghi rõ họ tên", st["small"]), para("Ký, ghi rõ họ tên", st["small"])], [Spacer(1, 35), Spacer(1, 35)]], colWidths=[WIDTH / 2] * 2)
    signatures.setStyle(TableStyle([("ALIGN", (0, 0), (-1, -1), "CENTER"), ("VALIGN", (0, 0), (-1, -1), "TOP")]))
    story.append(KeepTogether([signatures]))
    missing = 0
    if photos:
        story.extend([PageBreak(), para("04 · Hình ảnh hiện trường", st["section"])])
        with ThreadPoolExecutor(max_workers=4) as pool:
            images = list(pool.map(lambda item: _prepare_photo(item, data, token, temp_dir, downloader), enumerate(photos)))
        missing = sum(x["missing"] for x in images)
        layout = str(data.get("photo_layout") or "auto")
        index = 0
        while index < len(images):
            first = images[index]
            pair = layout == "2" or (layout == "auto" and first["height"] > first["width"] * 1.1 and index + 1 < len(images) and images[index + 1]["height"] > images[index + 1]["width"] * 1.1)
            group = images[index:index + (2 if pair else 1)]
            cell_width = (WIDTH - (10 if pair else 0)) / (2 if pair else 1)
            cells = []
            for photo in group:
                content = []
                if photo["path"]:
                    max_height = 140 * mm if photo["height"] > photo["width"] else 115 * mm
                    scale = min((cell_width - 6) / photo["width"], max_height / photo["height"])
                    content.append(Image(photo["path"], width=photo["width"] * scale, height=photo["height"] * scale, hAlign="CENTER"))
                else:
                    content.append(para("Ảnh chưa tải được. Vui lòng xuất lại khi kết nối ổn định.", st["small"]))
                content.extend([Spacer(1, 7), para(photo["caption"], st["small"])])
                cells.append(content)
            if pair and len(cells) == 1:
                cells.append("")
            row = Table([cells], colWidths=[WIDTH / len(cells)] * len(cells))
            row.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 3), ("RIGHTPADDING", (0, 0), (-1, -1), 3), ("BOTTOMPADDING", (0, 0), (-1, -1), 12)]))
            story.append(KeepTogether([row]))
            index += len(group)
    doc = SimpleDocTemplate(path, pagesize=A4, leftMargin=16 * mm, rightMargin=16 * mm, topMargin=15 * mm, bottomMargin=19 * mm, title="ESTA - Báo cáo vận hành kỹ thuật", author=str(data.get("prepared_by") or "ESTA"), pageCompression=1)
    doc.build(story, canvasmaker=ReportCanvas)
    return missing, sum(int(s.get("count", len(s["rows"]))) for s in sections)
