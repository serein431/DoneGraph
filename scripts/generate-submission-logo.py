from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "submission"
SITE_OUT = ROOT / "donegraph-vercel-site" / "assets" / "submission"
SIZE = 512
SCALE = 4
W = SIZE * SCALE


def font(size: int, weight: str = "bold") -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = {
        "bold": [
            "/System/Library/Fonts/Avenir Next.ttc",
            "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        ],
        "regular": [
            "/System/Library/Fonts/Avenir.ttc",
            "/System/Library/Fonts/Supplemental/Arial.ttf",
        ],
    }
    for candidate in candidates.get(weight, candidates["bold"]):
        path = Path(candidate)
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


def draw_centered_text(draw: ImageDraw.ImageDraw, text: str, fnt, fill, xy: tuple[int, int]) -> None:
    box = draw.textbbox((0, 0), text, font=fnt)
    w = box[2] - box[0]
    h = box[3] - box[1]
    draw.text((xy[0] - w / 2 - box[0], xy[1] - h / 2 - box[1]), text, font=fnt, fill=fill)


def glow_circle(layer: Image.Image, center: tuple[int, int], radius: int, color: tuple[int, int, int, int], blur: int) -> None:
    d = ImageDraw.Draw(layer)
    x, y = center
    d.ellipse((x - radius, y - radius, x + radius, y + radius), fill=color)
    layer.alpha_composite(layer.filter(ImageFilter.GaussianBlur(blur)))


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    SITE_OUT.mkdir(parents=True, exist_ok=True)

    img = Image.new("RGBA", (W, W), (7, 16, 15, 255))
    d = ImageDraw.Draw(img)

    for y in range(W):
        t = y / W
        base = (
            int(5 + 3 * t),
            int(17 + 14 * t),
            int(18 + 24 * t),
            255,
        )
        d.line((0, y, W, y), fill=base)

    glow = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse((250, -260, W + 220, 650), fill=(111, 250, 255, 58))
    gd.ellipse((-260, 420, 740, W + 260), fill=(213, 162, 95, 36))
    gd.ellipse((470, 420, 1580, 1620), fill=(92, 255, 190, 36))
    img.alpha_composite(glow.filter(ImageFilter.GaussianBlur(120)))

    # Holographic orbit, kept as geometry so the mark remains legible at 512px.
    ring_box = (318, 300, W - 318, W - 300)
    for width, alpha, offset in [(18, 210, 0), (8, 120, 46), (4, 80, 90)]:
        d.arc(
            (ring_box[0] - offset, ring_box[1] - offset, ring_box[2] + offset, ring_box[3] + offset),
            204,
            508,
            fill=(111, 250, 255, alpha),
            width=width,
        )
    d.arc((410, 384, W - 410, W - 384), -32, 206, fill=(255, 191, 91, 190), width=10)

    # Proof trail nodes.
    points = [(570, 1260), (810, 1030), (1052, 1140), (1290, 760), (1516, 652)]
    for a, b in zip(points, points[1:]):
        d.line((a, b), fill=(111, 250, 255, 180), width=14)
        d.line((a, b), fill=(255, 191, 91, 150), width=5)
    for i, (x, y) in enumerate(points):
        color = (111, 250, 255, 255) if i % 2 == 0 else (255, 191, 91, 255)
        d.ellipse((x - 34, y - 34, x + 34, y + 34), fill=(7, 16, 15, 255), outline=color, width=10)
        d.ellipse((x - 12, y - 12, x + 12, y + 12), fill=color)

    # Agent eye behind the DoneGraph mark.
    eye_center = (W // 2, 790)
    d.ellipse((eye_center[0] - 286, eye_center[1] - 286, eye_center[0] + 286, eye_center[1] + 286), fill=(8, 30, 34, 215), outline=(111, 250, 255, 145), width=12)
    d.ellipse((eye_center[0] - 150, eye_center[1] - 150, eye_center[0] + 150, eye_center[1] + 150), fill=(92, 255, 190, 230))
    d.ellipse((eye_center[0] - 70, eye_center[1] - 70, eye_center[0] + 70, eye_center[1] + 70), fill=(5, 16, 18, 255))
    d.ellipse((eye_center[0] - 120, eye_center[1] - 132, eye_center[0] - 52, eye_center[1] - 64), fill=(239, 252, 255, 245))

    text_layer = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    td = ImageDraw.Draw(text_layer)
    mark_font = font(920, "bold")
    draw_centered_text(td, "D", mark_font, (242, 251, 244, 255), (W // 2 - 4, W // 2 - 4))
    shadow = text_layer.filter(ImageFilter.GaussianBlur(22))
    tint = Image.new("RGBA", (W, W), (111, 250, 255, 90))
    img.alpha_composite(Image.composite(tint, Image.new("RGBA", (W, W), (0, 0, 0, 0)), shadow))
    img.alpha_composite(text_layer)

    word_layer = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    wd = ImageDraw.Draw(word_layer)
    word_font = font(116, "bold")
    draw_centered_text(wd, "DONEGRAPH", word_font, (189, 247, 231, 232), (W // 2, 1696))
    img.alpha_composite(word_layer)

    # Small square-safe outer stroke.
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((70, 70, W - 70, W - 70), radius=210, outline=(111, 250, 255, 90), width=8)
    d.rounded_rectangle((96, 96, W - 96, W - 96), radius=190, outline=(255, 191, 91, 52), width=4)

    output = img.resize((SIZE, SIZE), Image.Resampling.LANCZOS).convert("RGB")
    target = OUT / "donegraph-logo-512.png"
    site_target = SITE_OUT / "donegraph-logo-512.png"
    output.save(target, optimize=True, quality=95)
    output.save(site_target, optimize=True, quality=95)
    print(f"{target.relative_to(ROOT)} {target.stat().st_size / 1024:.1f}KB")
    print(f"{site_target.relative_to(ROOT)} {site_target.stat().st_size / 1024:.1f}KB")


if __name__ == "__main__":
    main()
