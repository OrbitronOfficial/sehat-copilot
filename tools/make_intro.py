"""Renders docs/intro.mp4: a silent 40-second introduction built from the project's own sample
document and demo values. Needs Pillow and ffmpeg on PATH.  Run: python tools/make_intro.py"""
import os
import subprocess
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W, H, FPS = 1280, 720, 24
DARK, TEAL, MINT, PAPER, INK, MUTED, AMBER = "#0B3B37", "#0F766E", "#9FD0C8", "#F6F8F5", "#12302D", "#5B716D", "#B45309"
FONTS = "C:/Windows/Fonts/"


def font(size, bold=False, mono=False):
    name = "consola.ttf" if mono else ("segoeuib.ttf" if bold else "segoeui.ttf")
    try:
        return ImageFont.truetype(FONTS + name, size)
    except OSError:
        return ImageFont.load_default()


def ease(x):
    x = max(0.0, min(1.0, x))
    return 1 - (1 - x) ** 3


def mix(a, b, k):
    a, b = [int(a[i:i + 2], 16) for i in (1, 3, 5)], [int(b[i:i + 2], 16) for i in (1, 3, 5)]
    return tuple(round(a[i] + (b[i] - a[i]) * k) for i in range(3))


def text(d, xy, s, size, fill, bg, t, delay=0.0, bold=False, mono=False, anchor="la"):
    """Text that fades in from the background colour and rises 14 px."""
    k = ease((t - delay) / 0.6)
    if k <= 0:
        return
    d.text((xy[0], xy[1] + (1 - k) * 14), s, font=font(size, bold, mono), fill=mix(bg, fill, k), anchor=anchor)


def pill(d, xy, s, fill, fg, t, delay, bg):
    k = ease((t - delay) / 0.5)
    if k <= 0:
        return 0
    f = font(24, True)
    w = d.textlength(s, font=f) + 36
    d.rounded_rectangle((xy[0], xy[1], xy[0] + w, xy[1] + 44), 22, fill=mix(bg, fill, k))
    d.text((xy[0] + 18, xy[1] + 7), s, font=f, fill=mix(bg, fg, k))
    return w


def step(d, n, title, t, bg=PAPER):
    text(d, (96, 70), f"STEP {n}", 22, TEAL, bg, t, 0, mono=True)
    text(d, (96, 104), title, 54, INK, bg, t, 0.1, bold=True)


SAMPLE = Image.open(os.path.join(ROOT, "public", "samples", "lab-2026-06.png")).convert("RGB")
SAMPLE = SAMPLE.resize((440, round(440 * SAMPLE.height / SAMPLE.width)))


def s_title(im, d, t):
    cx = W // 2
    k = ease(t / 0.8)
    r = 46
    d.rounded_rectangle((cx - r, 190 - r, cx + r, 190 + r), 22, fill=mix(DARK, TEAL, k))
    d.rectangle((cx - 8, 190 - 26, cx + 8, 190 + 26), fill=mix(DARK, "#FFFFFF", k))
    d.rectangle((cx - 26, 190 - 8, cx + 26, 190 + 8), fill=mix(DARK, "#FFFFFF", k))
    text(d, (cx, 290), "Sehat Copilot", 92, "#FFFFFF", DARK, t, 0.3, bold=True, anchor="ma")
    text(d, (cx, 420), "Understand your own health records.", 38, MINT, DARK, t, 0.9, anchor="ma")
    text(d, (cx, 600), "HacXLerate 2026  ·  Team ANTIJAREX", 22, MINT, DARK, t, 1.5, mono=True, anchor="ma")


def s_problem(im, d, t):
    text(d, (96, 150), "A prescription you cannot read.", 50, INK, PAPER, t, 0.0, bold=True)
    text(d, (96, 230), "A lab report full of numbers.", 50, INK, PAPER, t, 0.9, bold=True)
    text(d, (96, 310), "Papers from five visits, in five folders.", 50, INK, PAPER, t, 1.8, bold=True)
    text(d, (96, 440), "Most people leave the clinic without knowing", 30, MUTED, PAPER, t, 2.8)
    text(d, (96, 482), "what their own records say.", 30, MUTED, PAPER, t, 2.8)


def paste_doc(im, t, x=96, y=200):
    k = ease(t / 0.8)
    h, top = min(SAMPLE.height, 470), round(y + (1 - k) * 40)
    im.paste(SAMPLE.crop((0, 0, 440, h)), (x, top))
    ImageDraw.Draw(im).rectangle((x, top, x + 440, top + h), outline="#DDE5E0", width=2)


def s_read(im, d, t):
    step(d, 1, "Read the document", t)
    paste_doc(im, t)
    rows = [("HbA1c", "7.6 %", "High", AMBER), ("Fasting Blood Sugar", "142 mg/dL", "High", AMBER), ("HDL Cholesterol", "41 mg/dL", "Normal", TEAL)]
    for i, (n, v, f, c) in enumerate(rows):
        y, dl = 220 + i * 96, 0.8 + i * 0.6
        k = ease((t - dl) / 0.5)
        if k > 0:
            d.rounded_rectangle((600, y, 1184, y + 80), 16, fill=mix(PAPER, "#FFFFFF", k), outline=mix(PAPER, "#DDE5E0", k), width=2)
        text(d, (624, y + 12), n, 24, INK, "#FFFFFF", t, dl, bold=True)
        text(d, (624, y + 46), "read from a line on the report", 18, MUTED, "#FFFFFF", t, dl, mono=True)
        text(d, (1040, y + 26), v, 24, INK, "#FFFFFF", t, dl, mono=True, anchor="ra")
        pill(d, (1060, y + 18), f, c, "#FFFFFF", t, dl + 0.2, "#FFFFFF")
    text(d, (600, 540), "Photo, PDF or text. Printed or handwritten.", 28, MUTED, PAPER, t, 2.8)
    text(d, (600, 580), "Sample document shown.", 20, MUTED, PAPER, t, 2.8, mono=True)


def s_check(im, d, t):
    step(d, 2, "Check it with code, not AI", t)
    items = ["High, low and critical come from the range printed on the report.",
             "Lines that cannot be read are listed, never guessed.",
             "Handwriting is marked for you to check against the original.",
             "You correct anything before it is saved."]
    for i, s in enumerate(items):
        dl = 0.6 + i * 0.8
        k = ease((t - dl) / 0.5)
        if k > 0:
            d.ellipse((100, 248 + i * 86, 124, 272 + i * 86), fill=mix(PAPER, TEAL, k))
        text(d, (150, 240 + i * 86), s, 32, INK, PAPER, t, dl)
    text(d, (96, 620), "The model reads and writes. Code decides.", 26, TEAL, PAPER, t, 4.0, bold=True)


def s_explain(im, d, t):
    step(d, 3, "Explain it in plain words", t)
    k = ease((t - 0.5) / 0.6)
    if k > 0:
        d.rounded_rectangle((96, 220, 1184, 400), 20, fill=mix(PAPER, "#FFFFFF", k), outline=mix(PAPER, "#DDE5E0", k), width=2)
    text(d, (130, 244), "HbA1c  7.6 %", 28, INK, "#FFFFFF", t, 0.6, mono=True)
    text(d, (130, 292), "Your average sugar over about three months is above", 30, INK, "#FFFFFF", t, 1.0)
    text(d, (130, 334), "the usual range. It has come down from 8.4.", 30, INK, "#FFFFFF", t, 1.0)
    x = 96
    for i, n in enumerate(["English", "Hindi", "Bengali", "Telugu", "Marathi", "Tamil", "Gujarati", "Kannada"]):
        x += pill(d, (x, 450), n, "#E6F2F0", DARK, t, 2.0 + i * 0.15, PAPER) + 12
    text(d, (96, 530), "43 languages. Summaries, answers and read-aloud.", 30, MUTED, PAPER, t, 3.4)
    text(d, (96, 580), "It explains your records. It never diagnoses and never tells you to change a medicine.", 24, AMBER, PAPER, t, 4.0)


def s_profile(im, d, t):
    step(d, 4, "One profile, one timeline", t)
    pts = [(220, 300, "8.4", "12 Mar"), (480, 370, "7.6", "18 Jun"), (740, 432, "6.9", "22 Sep")]
    d.line((160, 500, 800, 500), fill="#DDE5E0", width=2)
    prog = ease((t - 0.6) / 2.2) * 2
    for i in range(2):
        k = max(0.0, min(1.0, prog - i))
        if k > 0:
            a, b = pts[i], pts[i + 1]
            d.line((a[0], a[1], a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k), fill=TEAL, width=5)
    for i, (x, y, v, dt_) in enumerate(pts):
        dl = 0.6 + i * 1.1
        k = ease((t - dl) / 0.4)
        if k > 0:
            d.ellipse((x - 10, y - 10, x + 10, y + 10), fill=mix(PAPER, TEAL, k))
        text(d, (x, y - 54), v, 30, INK, PAPER, t, dl, bold=True, anchor="ma")
        text(d, (x, 514), dt_, 20, MUTED, PAPER, t, dl, mono=True, anchor="ma")
    text(d, (160, 200), "HbA1c, three sample reports", 22, MUTED, PAPER, t, 0.3, mono=True)
    for i, s in enumerate(["Conditions merged", "Dated trends", "Home readings", "Questions for your doctor", "Things to discuss"]):
        text(d, (880, 250 + i * 58), s, 30, INK, PAPER, t, 1.4 + i * 0.4)
    text(d, (96, 610), "Built by code from the saved records. Stored on your device.", 26, MUTED, PAPER, t, 3.6)


def s_abdm(im, d, t):
    text(d, (96, 90), "Ready for India's health network", 54, "#FFFFFF", DARK, t, 0.0, bold=True)
    rows = [("FHIR R4 export", "Records leave as a standard bundle, shaped for ABDM."),
            ("Mock ABHA link", "Number, OTP, consent, choose records. Every step labelled mock."),
            ("Ask about your records", "Answers cite the report they came from, or say to ask your doctor.")]
    for i, (a, b) in enumerate(rows):
        dl = 0.7 + i * 0.9
        k = ease((t - dl) / 0.5)
        if k > 0:
            d.rounded_rectangle((96, 210 + i * 130, 1184, 318 + i * 130), 18, fill=mix(DARK, "#124A45", k))
        text(d, (128, 226 + i * 130), a, 32, "#FFFFFF", "#124A45", t, dl, bold=True)
        text(d, (128, 272 + i * 130), b, 24, MINT, "#124A45", t, dl)


def s_end(im, d, t):
    cx = W // 2
    text(d, (cx, 210), "Sehat Copilot", 80, "#FFFFFF", DARK, t, 0.0, bold=True, anchor="ma")
    text(d, (cx, 330), "A guide to your records. Not a doctor.", 34, MINT, DARK, t, 0.5, anchor="ma")
    text(d, (cx, 440), "sehat-copilot.vercel.app", 40, "#FFFFFF", DARK, t, 1.0, mono=True, anchor="ma")
    text(d, (cx, 520), "Open it and press  Load full demo profile", 26, MINT, DARK, t, 1.5, anchor="ma")
    text(d, (cx, 630), "Prototype. Sample data is synthetic. ABHA link is a mock.", 20, MINT, DARK, t, 2.0, mono=True, anchor="ma")


SCENES = [(s_title, 4.5, DARK), (s_problem, 5.5, PAPER), (s_read, 5.5, PAPER), (s_check, 6.0, PAPER),
          (s_explain, 6.0, PAPER), (s_profile, 5.5, PAPER), (s_abdm, 5.0, DARK), (s_end, 4.5, DARK)]


def main():
    out = os.path.join(ROOT, "docs", "intro.mp4")
    ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                           "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20",
                           "-movflags", "+faststart", out], stdin=subprocess.PIPE)
    for fn, secs, bg in SCENES:
        n = round(secs * FPS)
        for i in range(n):
            t = i / FPS
            im = Image.new("RGB", (W, H), bg)
            fn(im, ImageDraw.Draw(im), t)
            left = secs - t
            if left < 0.35:  # quick fade to the scene colour between scenes
                im = Image.blend(im, Image.new("RGB", (W, H), bg), 1 - left / 0.35)
            ff.stdin.write(im.tobytes())
    ff.stdin.close()
    ff.wait()
    print(out, round(sum(s for _, s, _ in SCENES), 1), "seconds")


if __name__ == "__main__":
    main()
