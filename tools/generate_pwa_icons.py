#!/usr/bin/env python3
"""Rebuild all ESTA home-screen PNG assets from the approved artwork.

This operation only updates public PWA icons, not project data, login or PDFs.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "icons" / "esta-approved-source.jpg"
ICONS = ROOT / "icons"
TEAL = (1, 43, 52)

def write_icon(image, filename, size):
    image.resize((size, size), Image.Resampling.LANCZOS).save(
        ICONS / filename, "PNG", optimize=True, compress_level=9
    )

if __name__ == "__main__":
    approved = Image.open(SOURCE).convert("RGB")
    if approved.width != approved.height:
        raise ValueError("Approved ESTA artwork must be square")
    for filename, size in (
        ("apple-touch-icon.png", 180),
        ("icon-192.png", 192),
        ("icon-512.png", 512),
    ):
        write_icon(approved, filename, size)

    # Android adaptive icon safe zone: original rounded-square design entirely
    # within a centered 76% layer, on an opaque brand-colour canvas.
    maskable = Image.new("RGB", (512, 512), TEAL)
    safe_size = 388
    inset = (512 - safe_size) // 2
    maskable.paste(
        approved.resize((safe_size, safe_size), Image.Resampling.LANCZOS),
        (inset, inset),
    )
    maskable.save(ICONS / "icon-maskable-512.png", "PNG", optimize=True, compress_level=9)

    for name, size in (
        ("apple-touch-icon.png", 180),
        ("icon-192.png", 192),
        ("icon-512.png", 512),
        ("icon-maskable-512.png", 512),
    ):
        with Image.open(ICONS / name) as img:
            assert img.size == (size, size), f"Invalid dimensions: {name}"
            assert img.format == "PNG", f"Invalid PNG encoding: {name}"
            img.verify()
    print("ESTA icons generated and verified for iOS and Android")
