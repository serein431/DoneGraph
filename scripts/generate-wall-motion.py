from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "submission"
SITE_OUT = ROOT / "donegraph-vercel-site" / "assets" / "submission"
W, H = 1280, 720
FRAMES = 42
FRAME_MS = 82


def font(size: int, weight: str = "regular") -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    names = {
        "regular": [
            "/System/Library/Fonts/Supplemental/Arial.ttf",
            "/System/Library/Fonts/SFNS.ttf",
        ],
        "bold": [
            "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
            "/System/Library/Fonts/SFNS.ttf",
        ],
        "mono": [
            "/System/Library/Fonts/SFNSMono.ttf",
            "/System/Library/Fonts/Menlo.ttc",
        ],
    }
    for candidate in names.get(weight, names["regular"]):
        path = Path(candidate)
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


FONT_DISPLAY = font(88, "bold")
FONT_HERO = font(76, "bold")
FONT_H2 = font(38, "bold")
FONT_PANEL = font(32, "bold")
FONT_BODY = font(25)
FONT_SMALL = font(18)
FONT_TINY = font(16)
FONT_MICRO = font(15, "mono")
FONT_MONO = font(22, "mono")


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def pulse(t: float, offset: float = 0.0) -> float:
    return 0.5 + 0.5 * math.sin((t + offset) * math.tau)


def draw_gradient(draw: ImageDraw.ImageDraw) -> None:
    for y in range(H):
        ratio = y / H
        r = int(2 + ratio * 3)
        g = int(9 + ratio * 13)
        b = int(22 + ratio * 20)
        draw.line([(0, y), (W, y)], fill=(r, g, b))


def glow_layer() -> Image.Image:
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.ellipse((650, -160, 1210, 420), fill=(70, 250, 255, 34))
    d.ellipse((-190, 260, 420, 900), fill=(45, 140, 255, 28))
    d.ellipse((850, 420, 1410, 900), fill=(255, 191, 91, 20))
    return layer.filter(ImageFilter.GaussianBlur(54))


def text(draw: ImageDraw.ImageDraw, xy: tuple[int, int], value: str, fnt, fill, anchor=None) -> None:
    draw.text(xy, value, font=fnt, fill=fill, anchor=anchor)


def rounded(draw: ImageDraw.ImageDraw, box, radius: int, fill, outline=None, width: int = 1) -> None:
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def draw_eye(draw: ImageDraw.ImageDraw, cx: int, cy: int, r: int, t: float) -> None:
    scan = pulse(t, 0.2)
    draw.ellipse((cx - r, cy - r, cx + r, cy + r), outline=(111, 250, 255, 150), width=2)
    draw.ellipse((cx - r + 10, cy - r + 10, cx + r - 10, cy + r - 10), outline=(255, 191, 91, 95), width=2)
    angle = t * math.tau
    ix = cx + int(math.cos(angle) * 8)
    iy = cy + int(math.sin(angle * 0.7) * 6)
    draw.ellipse((ix - 20, iy - 20, ix + 20, iy + 20), fill=(112, 249, 255, 230))
    draw.ellipse((ix - 8, iy - 8, ix + 8, iy + 8), fill=(2, 6, 17, 245))
    draw.ellipse((ix - 13, iy - 15, ix - 6, iy - 8), fill=(255, 255, 255, 230))
    lid_h = int(lerp(0, r * 0.72, max(0, 1 - abs(scan - 0.5) * 8)))
    if lid_h > 0:
        draw.rectangle((cx - r, cy - r, cx + r, cy - r + lid_h), fill=(2, 6, 17, 238))
        draw.rectangle((cx - r, cy + r - lid_h, cx + r, cy + r), fill=(2, 6, 17, 238))


def draw_orbits(draw: ImageDraw.ImageDraw, cx: int, cy: int, t: float) -> None:
    for i, radius in enumerate([116, 154, 196, 238]):
        alpha = 60 - i * 7
        box = (cx - radius, cy - radius, cx + radius, cy + radius)
        draw.arc(box, int(t * 360 + i * 47), int(t * 360 + i * 47 + 92), fill=(111, 250, 255, alpha), width=2)
        draw.arc(box, int(-t * 360 + i * 71), int(-t * 360 + i * 71 + 28), fill=(255, 191, 91, alpha), width=2)


def draw_panel(
    draw: ImageDraw.ImageDraw,
    box: tuple[int, int, int, int],
    title: str,
    kicker: str,
    body: list[str],
    accent: tuple[int, int, int],
    active: float,
) -> None:
    x1, y1, x2, y2 = box
    border = tuple(int(lerp(80, c, active)) for c in accent) + (210,)
    rounded(draw, box, 18, fill=(3, 18, 37, 190), outline=border, width=2)
    draw.rectangle((x1 + 16, y1 + 16, x1 + 92 + active * 30, y1 + 20), fill=accent + (180,))
    text(draw, (x1 + 18, y1 + 34), kicker.upper(), FONT_MICRO, accent + (220,))
    text(draw, (x1 + 18, y1 + 66), title, FONT_PANEL, (239, 252, 255, 245))
    for i, line in enumerate(body):
        yy = y1 + 126 + i * 28
        draw.ellipse((x1 + 22, yy + 7, x1 + 29, yy + 14), fill=accent + (210,))
        text(draw, (x1 + 40, yy), line, FONT_TINY, (214, 234, 238, 210))


def draw_ledger(draw: ImageDraw.ImageDraw, x: int, y: int, t: float) -> None:
    active = pulse(t, 0.05)
    for i, label in enumerate(["FILES", "COMMANDS", "NEXT STEP"]):
        yy = y + i * 52
        rounded(draw, (x, yy, x + 150, yy + 32), 10, (6, 26, 48, 210), (111, 250, 255, 92), 1)
        draw.rectangle((x + 10, yy + 13, x + 48 + int(active * 20), yy + 17), fill=(111, 250, 255, 170))
        text(draw, (x + 58, yy + 8), label, FONT_MICRO, (239, 252, 255, 210))


def draw_envelope(draw: ImageDraw.ImageDraw, x: int, y: int, t: float) -> None:
    open_amt = pulse(t, 0.32)
    rounded(draw, (x, y, x + 190, y + 118), 16, (255, 241, 204, 238), (255, 191, 91, 220), 2)
    flap_y = y + int(lerp(58, 22, open_amt))
    draw.polygon([(x + 10, y + 10), (x + 95, flap_y), (x + 180, y + 10)], fill=(255, 213, 128, 218))
    draw.line((x + 12, y + 106, x + 80, y + 66, x + 95, flap_y, x + 110, y + 66, x + 178, y + 106), fill=(130, 85, 49, 130), width=2)
    for i in range(3):
        draw.line((x + 38, y + 36 + i * 18, x + 158 - i * 14, y + 36 + i * 18), fill=(5, 18, 27, 105), width=3)


def draw_hero_envelope(draw: ImageDraw.ImageDraw, x: int, y: int, t: float) -> None:
    open_amt = pulse(t, 0.32)
    rounded(draw, (x, y, x + 380, y + 230), 24, (255, 242, 210, 245), (255, 191, 91, 235), 3)
    flap_y = y + int(lerp(112, 38, open_amt))
    draw.polygon([(x + 18, y + 20), (x + 190, flap_y), (x + 362, y + 20)], fill=(255, 214, 128, 232))
    draw.line((x + 22, y + 206, x + 162, y + 126, x + 190, flap_y, x + 218, y + 126, x + 358, y + 206), fill=(128, 81, 45, 140), width=3)
    for i in range(4):
        draw.line((x + 78, y + 76 + i * 28, x + 304 - i * 18, y + 76 + i * 28), fill=(5, 18, 27, 135), width=4)
    draw.ellipse((x + 170, y + 94, x + 210, y + 134), fill=(111, 250, 255, 220))
    draw.ellipse((x + 183, y + 107, x + 197, y + 121), fill=(2, 6, 17, 235))


def draw_radio(draw: ImageDraw.ImageDraw, x: int, y: int, t: float) -> None:
    rounded(draw, (x, y, x + 226, y + 130), 20, (5, 20, 33, 230), (111, 250, 255, 120), 2)
    draw.ellipse((x + 20, y + 26, x + 96, y + 102), outline=(111, 250, 255, 170), width=3)
    draw.ellipse((x + 46, y + 52, x + 70, y + 76), fill=(111, 250, 255, 190))
    for i in range(8):
        h = int(16 + 40 * pulse(t, i * 0.11))
        xx = x + 122 + i * 11
        draw.rounded_rectangle((xx, y + 84 - h, xx + 7, y + 84), radius=4, fill=(255, 191, 91, 190))
    text(draw, (x + 122, y + 96), "88.4 FM", FONT_MONO, (239, 252, 255, 220))


def frame(idx: int) -> Image.Image:
    t = idx / FRAMES
    img = Image.new("RGBA", (W, H), (0, 0, 0, 255))
    d = ImageDraw.Draw(img)
    draw_gradient(d)
    img.alpha_composite(glow_layer())

    for x in range(0, W, 42):
        d.line((x, 0, x, H), fill=(111, 250, 255, 18))
    for y in range(0, H, 42):
        d.line((0, y, W, y), fill=(111, 250, 255, 14))

    draw_orbits(d, 960, 330, t)
    draw_eye(d, 960, 330, 64, t)

    scan_x = int((t * (W + 260)) - 130)
    d.rectangle((scan_x, 0, scan_x + 2, H), fill=(111, 250, 255, 70))

    rounded(d, (48, 44, 262, 88), 22, (3, 18, 37), (111, 250, 255), 1)
    text(d, (74, 57), "DONEGRAPH.SPACE", FONT_MICRO, (158, 255, 255, 230))

    text(d, (56, 126), "DoneGraph", FONT_H2, (111, 250, 255, 245))
    text(d, (54, 200), "Your AI", FONT_DISPLAY, (239, 252, 255, 255))
    text(d, (56, 284), "remembers.", FONT_HERO, (239, 252, 255, 255))
    text(
        d,
        (60, 360),
        "It writes back after every run.",
        FONT_BODY,
        (214, 234, 238, 230),
    )

    for i, (label, x, color) in enumerate([
        ("TRAIL", 60, (111, 250, 255)),
        ("LETTER", 210, (255, 191, 91)),
        ("RADIO", 360, (92, 255, 190)),
    ]):
        alpha = int(120 + 90 * pulse(t, i * 0.12))
        rounded(d, (x, 406, x + 126, 448), 20, (3, 18, 37), color + (alpha,), 1)
        text(d, (x + 63, 419), label, FONT_MICRO, (239, 252, 255, 232), anchor="ma")

    rounded(d, (54, 488, 338, 630), 20, (3, 18, 37, 210), (111, 250, 255, 110), 2)
    text(d, (82, 514), "AI WORK LEDGER", FONT_MICRO, (111, 250, 255, 230))
    draw_ledger(d, 116, 548, t)

    draw_hero_envelope(d, 560, 360, t)
    text(d, (628, 624), "The agent writes back.", FONT_SMALL, (255, 191, 91, 245))

    rounded(d, (920, 426, 1210, 626), 24, (3, 18, 37, 220), (92, 255, 190, 130), 2)
    text(d, (952, 454), "RADIO ROAM", FONT_MICRO, (92, 255, 190, 230))
    draw_radio(d, 952, 486, t)

    labels = [("USE", 705), ("LETTER", 780), ("RADIO", 875), ("PROOF", 960)]
    for i, (label, x) in enumerate(labels):
        alpha = int(110 + 120 * pulse(t, i * 0.09))
        rounded(d, (x, 104, x + 72, 138), 16, (3, 18, 37, 180), (111, 250, 255, alpha), 1)
        text(d, (x + 36, 114), label, FONT_MICRO, (239, 252, 255, 220), anchor="ma")

    d.rectangle((0, H - 42, W, H), fill=(2, 6, 17, 190))
    text(d, (60, H - 30), "Open. Replay. Continue.", FONT_SMALL, (255, 191, 91, 240))
    text(d, (W - 60, H - 30), "UCWS Singapore Hackathon 2026", FONT_MICRO, (158, 255, 255, 205), anchor="ra")

    return img.convert("RGB")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    SITE_OUT.mkdir(parents=True, exist_ok=True)
    frames = [frame(i) for i in range(FRAMES)]
    poster = OUT / "donegraph-project-wall-motion-poster.png"
    webp = OUT / "donegraph-project-wall-motion.webp"
    gif = OUT / "donegraph-project-wall-motion.gif"

    frames[0].save(poster, optimize=True)
    frames[0].save(
        webp,
        save_all=True,
        append_images=frames[1:],
        duration=FRAME_MS,
        loop=0,
        quality=72,
        method=6,
    )
    frames[0].save(
        gif,
        save_all=True,
        append_images=frames[1:],
        duration=FRAME_MS,
        loop=0,
        optimize=True,
        disposal=2,
    )

    for source in [poster, webp, gif]:
        target = SITE_OUT / source.name
        target.write_bytes(source.read_bytes())
        print(f"{source.relative_to(ROOT)} {source.stat().st_size / 1024:.1f}KB")


if __name__ == "__main__":
    main()
