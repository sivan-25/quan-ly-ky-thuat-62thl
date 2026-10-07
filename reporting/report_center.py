"""Vector PDF for the ESTA report center, using the shared PDF primitives."""
import os
from urllib.parse import urlparse
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.platypus import (
    BaseDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether,
    Image, Frame, PageTemplate, HRFlowable,
)

from reporting import pdf_common as pdfc

AUB=pdfc.AUB
AUB_D=pdfc.AUB_D
CREAM=pdfc.CREAM
CREAM_L=pdfc.CREAM_L
COPPER=pdfc.COPPER
TAUPE=pdfc.TAUPE
STONE=pdfc.STONE
PALE=pdfc.PALE

NAVY=AUB
INK=AUB_D
MUTED=STONE
TEAL=COPPER
LINE=TAUPE
SOFT=CREAM_L
TONES={
    "good":("#411437","#F5ECD0"),
    "watch":("#A46427","#FFF1D8"),
    "danger":("#8A2635","#F9E5E6"),
    "info":("#625045","#F5ECD0"),
    "muted":("#7F7168","#F2E8D8"),
}
WIDTH=pdfc.CW
FOOTER=pdfc.FOOTER
ReportCanvas=pdfc.NumberedCanvas


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


def _validated_photo(index, photo, data):
    ref=str(photo.get("ref") or "")
    caption=str(photo.get("caption") or f"Hình {index+1}")
    if ref.startswith("storage:"):
        storage_path=ref[8:]
        building_id=str(data.get("building_id") or "")
        encoded_segment="b-"+"".join(f"{byte:02x}" for byte in building_id.encode("utf-8"))
        if not (storage_path.startswith(encoded_segment+"/") or storage_path.startswith(building_id+"/")):
            raise ValueError("Ảnh không thuộc dự án báo cáo")
    elif ref.startswith("data:image/"):
        pass
    else:
        url=urlparse(ref)
        if url.scheme!="https" or url.hostname!="upcjcrycahdfroxggsdz.supabase.co" or not url.path.startswith("/storage/v1/object/"):
            raise ValueError("Nguồn ảnh chưa được hỗ trợ")
    return {"source":ref,"ref":ref,"caption":caption,"id":ref}


def _prepare_photo(index_photo, data, token, temp_dir, downloader):
    # Compatibility helper retained for tests; actual image decode/compress is shared.
    index,photo=index_photo
    try:
        item=_validated_photo(index,photo,data)
        prepared=pdfc.prepare_downloaded_image(item["source"],token,downloader,cache_id=item["id"])
        return {
            "prepared":prepared,"width":prepared.width,"height":prepared.height,
            "caption":item["caption"],"missing":False
        }
    except Exception:
        return {"prepared":None,"width":1,"height":1,"caption":str(photo.get("caption") or f"Hình {index+1}"),"missing":True}


def _page_functions(data):
    return pdfc.make_page_fns(
        "BÁO CÁO VẬN HÀNH KỸ THUẬT",
        str(data.get("period_label") or ""),
        str(data.get("building") or "DỰ ÁN")
    )


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

    missing=0
    if photos:
        validated=[]
        invalid=0
        for i,photo in enumerate(photos):
            try:
                validated.append(_validated_photo(i,photo,data))
            except Exception:
                invalid+=1
        prepared,failed=pdfc.prepare_remote_images(validated,token,downloader,source_key="source")
        missing=invalid+failed
        images=[x for x in prepared if x.get("prepared")]
        if images:
            story += [Spacer(1,10),para("04 · Hình ảnh hiện trường",st["section"]),Spacer(1,4)]
            layout=str(data.get("photo_layout") or "3")
            cols=1 if layout=="1" else 2 if layout=="2" else 3
            normalized=[
                {"prepared":x["prepared"],"caption":str(x.get("caption") or f"Hình {i+1}")}
                for i,x in enumerate(images)
            ]
            for row in pdfc.image_grid(normalized,WIDTH,cols=cols,cell_height=pdfc.IMAGE_CELL_HEIGHT,gap=pdfc.IMAGE_GAP):
                story += [row,Spacer(1,5)]

    story.append(_signature_block(data, st))

    first_page, later_page = _page_functions(data)
    doc = BaseDocTemplate(
        path,
        pagesize=A4,
        title="ESTA - Báo cáo vận hành kỹ thuật",
        author="ESTA Property Management",
        subject="Báo cáo vận hành kỹ thuật",
        creator="ESTA Property Management",
        leftMargin=pdfc.MX,
        rightMargin=pdfc.MX,
    )
    first_frame = Frame(pdfc.MX, 21 * mm, WIDTH, A4[1] - 38 * mm - 8 * mm - 21 * mm, id="rc-first", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    later_frame = Frame(pdfc.MX, 21 * mm, WIDTH, A4[1] - 12 * mm - 8 * mm - 21 * mm, id="rc-later", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    doc.addPageTemplates([
        PageTemplate("first", [first_frame], onPage=first_page, autoNextPageTemplate="later"),
        PageTemplate("later", [later_frame], onPage=later_page),
    ])
    doc.build(story, canvasmaker=ReportCanvas)
    return missing, sum(int(s.get("count", len(s["rows"]))) for s in sections)
