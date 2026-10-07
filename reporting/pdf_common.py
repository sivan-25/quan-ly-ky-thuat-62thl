# -*- coding: utf-8 -*-
"""Shared ESTA PDF primitives.

All server-side PDF renderers use this module for:
- corporate fonts / palette
- background, header and numbered footer
- image decode/resize/compress/cache
- compact image grids (1-3 images per row)

No third-party dependencies beyond ReportLab and Pillow.
"""
from __future__ import annotations

import io
import os
import threading
from collections import OrderedDict
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
from typing import Any, Callable, Iterable, Optional

from PIL import Image as PILImage, ImageOps
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas as rl_canvas
from reportlab.platypus import Flowable, Table, TableStyle

# ESTA corporate palette
AUB = colors.HexColor("#411437")
AUB_D = colors.HexColor("#2B1526")
CREAM = colors.HexColor("#F3DEBF")
CREAM_L = colors.HexColor("#F5ECD0")
COPPER = colors.HexColor("#A46427")
TAUPE = colors.HexColor("#A99586")
STONE = colors.HexColor("#625045")
PALE = colors.HexColor("#FFF8EC")

PW, PH = A4
MX = 18 * mm
CW = PW - 2 * MX
FOOTER = "ESTA PROPERTY MANAGEMENT  ·  A L'MAK COMPANY  ·  HO CHI MINH CITY"

# Image tuning: change these constants once and all PDF types follow.
IMAGE_COLS = 3
IMAGE_CELL_HEIGHT = 52 * mm
IMAGE_GAP = 3 * mm
IMAGE_MAX_PX = 900
IMAGE_DECODE_HINT_PX = 1800
IMAGE_JPEG_QUALITY = 72
IMAGE_CACHE_LIMIT = 192
IMAGE_WORKERS = 4

_FONTS_READY = False
_CACHE_LOCK = threading.Lock()
_IMAGE_CACHE: "OrderedDict[tuple[str, float], tuple[bytes, int, int]]" = OrderedDict()


def _font_dir() -> str:
    return os.path.join(os.path.dirname(__file__), "fonts")


def ensure_fonts() -> None:
    """Register the existing Montserrat TTF family exactly once."""
    global _FONTS_READY
    if _FONTS_READY:
        return
    font_dir = _font_dir()
    for name, fn in [
        ("Mont", "Regular"),
        ("Mont-Light", "Light"),
        ("Mont-Medium", "Medium"),
        ("Mont-SemiBold", "SemiBold"),
        ("Mont-Bold", "Bold"),
        ("Mont-XBold", "ExtraBold"),
        ("Mont-Italic", "Italic"),
    ]:
        pdfmetrics.registerFont(TTFont(name, os.path.join(font_dir, f"Montserrat-{fn}.ttf")))
    pdfmetrics.registerFontFamily(
        "Mont", normal="Mont", bold="Mont-Bold", italic="Mont-Italic", boldItalic="Mont-Bold"
    )
    _FONTS_READY = True


def tracked(c, x, y, text, font, size, space, color, align="l"):
    w = pdfmetrics.stringWidth(text, font, size) + space * max(0, len(text) - 1)
    if align == "r":
        x -= w
    c.saveState()
    t = c.beginText(x, y)
    t.setFont(font, size)
    t.setCharSpace(space)
    t.setFillColor(color)
    t.textOut(text)
    c.drawText(t)
    c.restoreState()


def draw_background(c) -> None:
    """Must run in onPage, before Platypus draws page content."""
    c.setFillColor(CREAM)
    c.rect(0, 0, PW, PH, stroke=0, fill=1)


def make_page_fns(report_title: str, period_label: str = "", building: str = ""):
    """Common ESTA first/later page chrome for every PDF renderer."""
    short = str(report_title or "BÁO CÁO KỸ THUẬT").upper()
    period = str(period_label or "").upper()
    building_text = str(building or "").upper()

    def first(c, doc):
        draw_background(c)
        band = 38 * mm
        c.setFillColor(AUB)
        c.rect(0, PH - band, PW, band, stroke=0, fill=1)
        c.setFillColor(COPPER)
        c.rect(0, PH - band - 1.5, PW, 1.5, stroke=0, fill=1)

        c.setFillColor(PALE)
        c.setFont("Mont-Bold", 22)
        c.drawString(MX, PH - 15.5 * mm, "ESTA")
        c.setFont("Mont-Light", 6.2)
        c.setFillColor(CREAM)
        c.drawString(MX, PH - 20.5 * mm, "PROPERTY MANAGEMENT")
        if building_text:
            c.setFont("Mont-SemiBold", 6.8)
            c.drawString(MX, PH - 28.0 * mm, building_text)

        tracked(c, PW - MX, PH - 17 * mm, short, "Mont-Bold", 8.5, 1.25, CREAM, "r")
        if period:
            tracked(c, PW - MX, PH - 23 * mm, period, "Mont-Light", 6.8, 1.3, CREAM, "r")

    def later(c, doc):
        draw_background(c)
        band = 12 * mm
        c.setFillColor(AUB)
        c.rect(0, PH - band, PW, band, stroke=0, fill=1)
        c.setFillColor(COPPER)
        c.rect(0, PH - band - 1.2, PW, 1.2, stroke=0, fill=1)
        c.setFillColor(CREAM)
        c.setFont("Mont-SemiBold", 6.2)
        c.drawString(MX, PH - 7.3 * mm, "ESTA" + (("  ·  " + building_text) if building_text else ""))
        right = short + (("  ·  " + period) if period else "")
        tracked(c, PW - MX, PH - 7.2 * mm, right, "Mont-Light", 6.2, 1.0, CREAM, "r")

    return first, later


class NumberedCanvas(rl_canvas.Canvas):
    """Two-pass canvas: footer/page count is drawn after total pages are known."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        total = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self._draw_footer(total)
            rl_canvas.Canvas.showPage(self)
        rl_canvas.Canvas.save(self)

    def _draw_footer(self, total: int):
        self.saveState()
        self.setStrokeColor(COPPER)
        self.setLineWidth(1.5)
        self.line(MX, 16 * mm, PW - MX, 16 * mm)
        tracked(self, MX, 11 * mm, FOOTER, "Mont-Light", 6.2, 0.9, STONE)
        self.setFont("Mont-Light", 6.8)
        self.setFillColor(STONE)
        self.drawRightString(PW - MX, 11 * mm, f"Trang {self._pageNumber} / {total}")
        self.restoreState()


@dataclass(frozen=True)
class ProcessedImage:
    data: bytes
    width: int
    height: int
    cache_id: str = ""

    def buffer(self) -> io.BytesIO:
        bio = io.BytesIO(self.data)
        bio.seek(0)
        return bio


def _cache_get(key: tuple[str, float]) -> Optional[ProcessedImage]:
    with _CACHE_LOCK:
        value = _IMAGE_CACHE.get(key)
        if not value:
            return None
        _IMAGE_CACHE.move_to_end(key)
    raw, width, height = value
    return ProcessedImage(raw, width, height, key[0])


def _cache_put(key: tuple[str, float], image: ProcessedImage) -> None:
    with _CACHE_LOCK:
        _IMAGE_CACHE[key] = (image.data, image.width, image.height)
        _IMAGE_CACHE.move_to_end(key)
        while len(_IMAGE_CACHE) > IMAGE_CACHE_LIMIT:
            _IMAGE_CACHE.popitem(last=False)


def process_image_bytes(
    raw: bytes,
    cache_id: str,
    mtime: float = 0.0,
    max_px: int = IMAGE_MAX_PX,
    quality: int = IMAGE_JPEG_QUALITY,
) -> ProcessedImage:
    """Single image pipeline used by every PDF.

    Decode hint -> EXIF transpose -> RGB -> <=900 px long side -> JPEG q72.
    Returns compressed BytesIO-compatible bytes plus final pixel dimensions.
    """
    if not raw:
        raise ValueError("Ảnh trống")
    key = (str(cache_id or "bytes"), float(mtime or 0.0))
    cached = _cache_get(key)
    if cached:
        return cached

    with PILImage.open(io.BytesIO(raw)) as source:
        try:
            source.draft("RGB", (IMAGE_DECODE_HINT_PX, IMAGE_DECODE_HINT_PX))
        except Exception:
            pass
        image = ImageOps.exif_transpose(source)
        if image.mode != "RGB":
            # White matte keeps annotations readable if the source contains alpha.
            if "A" in image.getbands():
                rgba = image.convert("RGBA")
                matte = PILImage.new("RGB", rgba.size, "white")
                matte.paste(rgba, mask=rgba.getchannel("A"))
                image = matte
            else:
                image = image.convert("RGB")
        else:
            image = image.copy()

    width, height = image.size
    longest = max(width, height, 1)
    if longest > max_px:
        scale = max_px / float(longest)
        target = (max(1, round(width * scale)), max(1, round(height * scale)))
        image = image.resize(target, PILImage.Resampling.LANCZOS)

    out = io.BytesIO()
    image.save(out, "JPEG", quality=quality, optimize=True)
    data = out.getvalue()
    width, height = image.size
    prepared = ProcessedImage(data, width, height, key[0])
    _cache_put(key, prepared)
    return prepared


def process_image_file(path: str, cache_id: str = "") -> ProcessedImage:
    if not path or not os.path.exists(path):
        raise FileNotFoundError(path or "")
    mtime = os.path.getmtime(path)
    ident = cache_id or os.path.abspath(path)
    with open(path, "rb") as fh:
        return process_image_bytes(fh.read(), ident, mtime)


def prepare_downloaded_image(
    source: str,
    token: str,
    downloader: Callable[[str, str], tuple[Optional[bytes], str]],
    cache_id: str = "",
) -> ProcessedImage:
    raw, _ext = downloader(source, token)
    if not raw:
        raise ValueError("Không tải được ảnh")
    return process_image_bytes(raw, cache_id or source or "remote", 0.0)


def prepare_remote_images(
    items: Iterable[dict[str, Any]],
    token: str,
    downloader: Callable[[str, str], tuple[Optional[bytes], str]],
    source_key: str = "source",
    workers: int = IMAGE_WORKERS,
) -> tuple[list[dict[str, Any]], int]:
    """Download/decode/compress images in parallel while preserving input order."""
    source_items = list(items)

    def one(index_item):
        index, item = index_item
        out = dict(item)
        source = str(out.get(source_key) or out.get("ref") or out.get("path") or "")
        if not source:
            out["prepared"] = None
            out["missing"] = True
            return index, out
        try:
            out["prepared"] = prepare_downloaded_image(
                source, token, downloader, cache_id=str(out.get("id") or source)
            )
            out["missing"] = False
        except Exception:
            out["prepared"] = None
            out["missing"] = True
        return index, out

    if not source_items:
        return [], 0
    max_workers = max(1, min(int(workers or 1), len(source_items), 8))
    with ThreadPoolExecutor(max_workers=max_workers) as pool:
        prepared = list(pool.map(one, enumerate(source_items)))
    prepared.sort(key=lambda x: x[0])
    results = [item for _, item in prepared]
    missing = sum(1 for item in results if item.get("missing"))
    return results, missing


class ImageSlot(Flowable):
    CAPTION_H = 12

    def __init__(
        self,
        width: float,
        height: float,
        prepared: Optional[ProcessedImage] = None,
        caption: str = "",
    ):
        super().__init__()
        self.width = width
        self.height = height
        self.prepared = prepared
        self.caption = str(caption or "")

    def wrap(self, availWidth, availHeight):
        return self.width, self.height + self.CAPTION_H

    def draw(self):
        c = self.canv
        w, h = self.width, self.height
        y = self.CAPTION_H

        c.setFillColor(CREAM_L)
        c.rect(0, y, w, h, stroke=0, fill=1)
        c.setStrokeColor(TAUPE)
        c.setLineWidth(0.45)
        c.rect(0, y, w, h, stroke=1, fill=0)

        if self.prepared:
            from reportlab.lib.utils import ImageReader

            reader = ImageReader(self.prepared.buffer())
            iw, ih = max(1, self.prepared.width), max(1, self.prepared.height)
            scale = min((w - 4) / iw, (h - 4) / ih)
            dw, dh = iw * scale, ih * scale
            c.drawImage(
                reader,
                (w - dw) / 2,
                y + (h - dh) / 2,
                dw,
                dh,
                preserveAspectRatio=True,
                mask="auto",
            )

        c.setFillColor(STONE)
        c.setFont("Mont-Light", 6.6)
        c.drawString(1, 2.5, self.caption[:120])


def image_grid(
    images: Iterable[dict[str, Any]],
    available_width: float = CW,
    cols: int = IMAGE_COLS,
    cell_height: float = IMAGE_CELL_HEIGHT,
    gap: float = IMAGE_GAP,
) -> list[Table]:
    """Return compact rows. Row width adapts to 1, 2 or 3 actual images."""
    valid = [x for x in images if x and x.get("prepared")]
    if not valid:
        return []
    cols = max(1, min(int(cols or IMAGE_COLS), 3))
    result: list[Table] = []

    for offset in range(0, len(valid), cols):
        group = valid[offset : offset + cols]
        n = len(group)
        cell_width = (available_width - gap * (n - 1)) / n
        cells: list[Any] = []
        widths: list[float] = []
        for i, item in enumerate(group):
            if i:
                cells.append("")
                widths.append(gap)
            cells.append(
                ImageSlot(
                    cell_width,
                    cell_height,
                    prepared=item.get("prepared"),
                    caption=str(item.get("caption") or f"Hình {offset + i + 1}"),
                )
            )
            widths.append(cell_width)
        row = Table([cells], colWidths=widths, hAlign="LEFT")
        row.setStyle(
            TableStyle(
                [
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 0),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                    ("TOPPADDING", (0, 0), (-1, -1), 0),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
                ]
            )
        )
        result.append(row)
    return result
