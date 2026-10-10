"""Renders docs/intro.mp4: a narrated walkthrough of the product, one step of the user's journey
per scene (sign in, add a record, check it, read the explanation, timeline, dashboard, ask, export).

Pictures: real screenshots of the app in its light theme (docs/shots, taken by tools/make_shots.py)
and two stock clips washed to white behind the opening and closing cards (docs/footage, see
CREDITS.md there).
Voice: docs/voice/1.mp3 ... N.mp3 if you record your own, else a neural voice through the edge-tts
package, else the offline Windows voice. Every scene lasts exactly as long as its line, and what
appears on screen is timed as a fraction of that length, so picture and voice stay together.
Needs Pillow and ffmpeg on PATH.  Run: python tools/make_intro.py"""
import math
import os
import random
import subprocess
import wave
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W, H, FPS, RATE = 1280, 720, 24, 22050
WHITE, TEAL, INK, MUTED, LINE = "#FFFFFF", "#0F766E", "#0F172A", "#5B6B68", "#E2E8E4"
FONTS = "C:/Windows/Fonts/"
VOICE = "en-IN-NeerjaNeural"  # any edge-tts voice name
LEAD, TAIL = 0.3, 0.55        # silence before and after each line


# (kind, spoken line, on-screen title, sub line, screenshot, where the pointer lands on it)
STEPS = [
    ("title", "Sehat Copilot. Understand your own health records.", None, None, None, None),
    ("step", "First, sign in. Your account stays on your own device.",
     "Sign in", "Your account stays on your device.", "login", (0.50, 0.772, 0.255, 0.052)),
    ("step", "Add a photo or PDF of any prescription or lab report.",
     "Add a record", "Photo, PDF or text. Printed or handwritten.", "add", (0.535, 0.435, 0.078, 0.052)),
    ("step", "Check what was read, side by side with the original, and fix anything before it is saved.",
     "Check it against\nthe original", "Unreadable lines are listed, never guessed.", "review", (0.84, 0.76, 0.118, 0.048)),
    ("step", "Then read it in plain words. Code, not the A.I., decides what is high or low.",
     "Read it in\nplain words", "High and low come from the printed range.", "detail", (0.43, 0.555, 0.39, 0.125)),
    ("step", "Every record you save joins one timeline.",
     "One timeline", "Every visit and report, in order.", "timeline", (0.59, 0.395, 0.68, 0.205)),
    ("step", "Your dashboard shows what needs attention, how your values changed, and questions for your doctor.",
     "Your health\nat a glance", "Trends, home readings, doctor questions.", "health", (0.445, 0.395, 0.425, 0.36)),
    ("step", "Ask a question, and the answer names the report it came from.",
     "Ask about\nyour records", "Answers cite their source, or say to ask your doctor.", "ask", (0.50, 0.48, 0.54, 0.225)),
    ("step", "Export everything in the fire format, with a mock Aabha link. All of it in forty-three languages.",
     "Take it with you", "FHIR export and a mock ABHA link. 43 languages.", "abha", (0.31, 0.67, 0.13, 0.052)),
    ("end", "Sehat Copilot. A guide to your records. Not a doctor.", None, None, None, None),
]


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


def text(d, xy, s, size, fill, t, delay=0.0, bold=False, mono=False, anchor="la", bg=WHITE):
    """Text that fades in from the background and rises 14 px."""
    k = ease((t - delay) / 0.55)
    if k > 0:
        d.text((xy[0], xy[1] + (1 - k) * 14), s, font=font(size, bold, mono), fill=mix(bg, fill, k), anchor=anchor)


# ---------------- depth: drifting backdrop, particles, helix, floating screens, camera ----------------

def _backdrop():
    im = Image.new("RGB", (W + 240, H + 240), WHITE)
    d = ImageDraw.Draw(im)
    for x, y, r, c in [(240, 190, 330, "#E4F3F0"), (1300, 780, 400, "#EAF4EC"), (1150, 100, 260, "#EEF3FB")]:
        d.ellipse((x - r, y - r, x + r, y + r), fill=c)
    return im.filter(ImageFilter.GaussianBlur(150))


BACK = _backdrop()
random.seed(7)
DOTS = [(random.random(), random.random(), random.random()) for _ in range(40)]


def backdrop(T):
    x, y = 120 + 90 * math.sin(T * 0.21), 120 + 70 * math.cos(T * 0.17)
    return BACK.crop((round(x), round(y), round(x) + W, round(y) + H))


def particles(d, T):
    for x, y, z in DOTS:
        px = (x * W + 40 * z * math.sin(T * 0.5 + x * 9)) % W
        py = (y * H - T * (10 + 34 * z)) % H
        r = 1.5 + 4 * z
        d.ellipse((px - r, py - r, px + r, py + r), fill=mix(WHITE, TEAL, 0.06 + 0.12 * z))


def helix(d, cx, top, height, radius, T, k=1.0):
    """A double helix turning about its vertical axis, drawn back to front."""
    if k <= 0:
        return
    n, balls = 26, []
    for i in range(n):
        y = top + height * i / (n - 1)
        ang = i * 0.52 + T * 1.3
        x, z = math.cos(ang) * radius, math.sin(ang)
        if i % 2 == 0:
            d.line((cx + x, y, cx - x, y), fill=mix(WHITE, TEAL, 0.18 * k), width=2)
        balls += [(z, cx + x, y, TEAL), (-z, cx - x, y, "#7FB8B0")]
    for z, x, y, c in sorted(balls):
        r = 5 + 4.5 * (z + 1) / 2
        d.ellipse((x - r, y - r, x + r, y + r), fill=mix(WHITE, c, k * (0.3 + 0.7 * (z + 1) / 2)))


def _coeffs(dst, src):
    """Perspective coefficients mapping output points dst back to source points src."""
    m = []
    for (x, y), (u, v) in zip(dst, src):
        m.append([x, y, 1, 0, 0, 0, -u * x, -u * y, u])
        m.append([0, 0, 0, x, y, 1, -v * x, -v * y, v])
    for c in range(8):  # Gauss-Jordan
        piv = max(range(c, 8), key=lambda r: abs(m[r][c]))
        m[c], m[piv] = m[piv], m[c]
        m[c] = [v / m[c][c] for v in m[c]]
        for r in range(8):
            if r != c:
                f = m[r][c]
                m[r] = [a - f * b for a, b in zip(m[r], m[c])]
    return [m[i][8] for i in range(8)]


def card3d(im, src, x, y, yaw):
    """Paste an image turned about its left edge by yaw (0 = flat) on a soft shadow.
    Returns a function mapping a point on the flat image to where it lands on the frame."""
    w, h = src.size
    wd, inset = w * math.cos(yaw), h * 0.5 * math.sin(yaw) * 0.42
    quad = [(0, 0), (wd, inset), (wd, h - inset), (0, h)]
    shadow = Image.new("L", (W, H), 0)
    ImageDraw.Draw(shadow).polygon([(x + px + 10, y + py + 26) for px, py in quad], fill=70)
    im.paste(Image.new("RGB", (W, H), "#5B7B75"), (0, 0), shadow.filter(ImageFilter.GaussianBlur(24)))
    warped = src.convert("RGBA").transform((w, h), Image.PERSPECTIVE, _coeffs(quad, [(0, 0), (w, 0), (w, h), (0, h)]), Image.BICUBIC)
    im.paste(warped, (round(x), round(y)), warped)
    ImageDraw.Draw(im).line([(x + px, y + py) for px, py in quad] + [(x, y)], fill="#CBD5D1", width=2)
    return lambda fx, fy: (x + fx * wd, y + inset * fx + fy * (h - 2 * inset * fx))


def _framed(name, width):
    """A screenshot inside a light browser frame, scaled to `width`. Returns (image, share taken by the bar)."""
    path = os.path.join(ROOT, "docs", "shots", name + ".png")
    shot = Image.open(path).convert("RGB") if os.path.exists(path) else Image.new("RGB", (1440, 900), "#F4F7F5")
    h = round(width * shot.height / shot.width)
    bar = 26
    im = Image.new("RGB", (width, h + bar), "#EEF2F0")
    d = ImageDraw.Draw(im)
    for i, c in enumerate(("#E0605A", "#E6B44C", "#5FBF77")):
        d.ellipse((14 + i * 18, 8, 24 + i * 18, 18), fill=c)
    d.rounded_rectangle((90, 6, width - 90, 20), 7, fill=WHITE)
    im.paste(shot.resize((width, h), Image.LANCZOS), (0, bar))
    return im, bar / (h + bar)


SHOTS = {s[4]: _framed(s[4], 770) for s in STEPS if s[4]}
SHOTS["trends"] = _framed("trends", 420)


def _smooth(size, paint, scale=3):
    """Draw at 3x and scale down, so edges come out smooth."""
    im = Image.new("RGBA", (size[0] * scale, size[1] * scale), (0, 0, 0, 0))
    paint(ImageDraw.Draw(im), scale)
    return im.resize(size, Image.LANCZOS)


def _cursor():
    pts = [(4, 3), (4, 33), (11, 26), (16, 38), (21, 36), (16, 24), (26, 24)]

    def paint(d, k):
        d.polygon([((x + 2) * k, (y + 3) * k) for x, y in pts], fill=(15, 23, 42, 70))  # shadow
        d.polygon([(x * k, y * k) for x, y in pts], fill=(255, 255, 255, 255))
        d.line([(x * k, y * k) for x, y in pts + pts[:1]], fill=(15, 23, 42, 255), width=2 * k, joint="curve")
    return _smooth((34, 46), paint, 4)


CURSOR = _cursor()
RGB_TEAL = (15, 118, 110)


def outline(im, box, k):
    """The thing being clicked: a soft tinted box that stays once the click lands."""
    if k <= 0:
        return
    x0, y0, x1, y1 = [round(v) for v in box]
    pad = 8
    w, h = x1 - x0 + 2 * pad, y1 - y0 + 2 * pad

    def paint(d, s):
        d.rounded_rectangle((2 * s, 2 * s, (w - 2) * s, (h - 2) * s), 10 * s, fill=RGB_TEAL + (round(26 * k),),
                            outline=RGB_TEAL + (round(235 * k),), width=3 * s)
    patch = _smooth((w, h), paint)
    im.paste(patch, (x0 - pad, y0 - pad), patch)


def ripple(im, cx, cy, p):
    """One soft ring spreading from the click point."""
    if not 0 < p < 1:
        return
    r, size = 10 + 46 * ease(p), 130

    def paint(d, s):
        c = size * s / 2
        d.ellipse((c - r * s, c - r * s, c + r * s, c + r * s), fill=RGB_TEAL + (round(70 * (1 - p)),),
                  outline=RGB_TEAL + (round(200 * (1 - p)),), width=2 * s)
    patch = _smooth((size, size), paint)
    im.paste(patch, (round(cx - size / 2), round(cy - size / 2)), patch)


def click(im, box, t, at):
    """The cursor glides to the target, presses once, and the target stays outlined."""
    move = 0.9
    if t < at:
        return
    cx, cy = (box[0] + box[2]) / 2, (box[1] + box[3]) / 2
    m = min(1.0, (t - at) / move)
    k = m * m * (3 - 2 * m)  # ease in and out
    outline(im, box, ease((t - at - move) / 0.35))
    ripple(im, cx, cy, (t - at - move) / 0.7)
    press = 3 if 0 <= t - at - move < 0.14 else 0  # a small dip as it clicks
    px, py = cx + (1 - k) * 230, cy + (1 - k) * 150
    im.paste(CURSOR, (round(px - 4 + press), round(py - 3 + press)), CURSOR)


def progress(d, n, total, k):
    """Where this step sits in the journey."""
    for i in range(total):
        fill = TEAL if i < n - 1 else (mix(LINE, TEAL, k) if i == n - 1 else LINE)
        d.rounded_rectangle((64 + i * 52, 662, 108 + i * 52, 668), 3, fill=fill)


# ---------------- scenes: everything is placed as a fraction of the line's length ----------------

def s_step(im, d, t, secs, n, total, title, sub, shot, at):
    src, bar = SHOTS[shot]
    k = ease(t / 1.0)
    place = card3d(im, src, 470 + round((1 - k) * 140), 112, math.radians(38 * (1 - k)))
    text(d, (64, 150), f"STEP {n} OF {total}", 22, TEAL, t, 0.0, mono=True)
    lines = title.split("\n")
    for i, line in enumerate(lines):
        text(d, (64, 186 + i * 58), line, 48, INK, t, 0.1 + i * 0.12, bold=True)
    y, row, rows = 186 + 58 * len(lines) + 22, "", []
    for wd in sub.split():  # wrap the sub line into the left column
        if row and d.textlength(row + " " + wd, font=font(24)) > 380:
            rows.append(row)
            row = wd
        else:
            row = (row + " " + wd).strip()
    rows.append(row)
    for i, r in enumerate(rows):
        text(d, (64, y + i * 34), r, 24, MUTED, t, secs * 0.30)
    progress(d, n, total, ease(t / 0.6))
    if k >= 1:  # the screen is flat now, so the box maps straight onto it
        cx, cy, bw, bh = at
        x0, y0 = place(cx - bw / 2, bar + (cy - bh / 2) * (1 - bar))
        x1, y1 = place(cx + bw / 2, bar + (cy + bh / 2) * (1 - bar))
        click(im, (x0, y0, x1, y1), t, max(1.1, secs * 0.36))


def s_title(im, d, t, secs):
    cx, k = W // 2, ease(t / 0.8)
    helix(d, 170, 60, 600, 62, t, k)
    helix(d, W - 170, 60, 600, 62, t + 2, k)
    d.rounded_rectangle((cx - 46, 150, cx + 46, 242), 22, fill=mix(WHITE, TEAL, k))
    d.rectangle((cx - 8, 170, cx + 8, 222), fill=WHITE)
    d.rectangle((cx - 26, 188, cx + 26, 204), fill=WHITE)
    text(d, (cx, 280), "Sehat Copilot", 92, INK, t, 0.2, bold=True, anchor="ma")
    text(d, (cx, 410), "Understand your own health records.", 38, TEAL, t, secs * 0.35, anchor="ma")
    text(d, (cx, 600), "HacXLerate 2026  ·  Team ANTIJAREX", 22, MUTED, t, secs * 0.6, mono=True, anchor="ma")


def s_end(im, d, t, secs):
    cx, k = W // 2, ease(t / 0.8)
    helix(d, 170, 60, 600, 62, t + 1, k)
    helix(d, W - 170, 60, 600, 62, t + 3, k)
    text(d, (cx, 190), "Sehat Copilot", 84, INK, t, 0.0, bold=True, anchor="ma")
    text(d, (cx, 310), "A guide to your records. Not a doctor.", 34, TEAL, t, secs * 0.28, anchor="ma")
    text(d, (cx, 420), "sehat-copilot.vercel.app", 40, INK, t, secs * 0.5, mono=True, anchor="ma")
    text(d, (cx, 500), "Open it and try one of the sample reports", 26, MUTED, t, secs * 0.6, anchor="ma")
    text(d, (cx, 630), "Prototype. Sample data is synthetic. ABHA link is a mock.", 20, MUTED, t, secs * 0.7, mono=True, anchor="ma")


def footage(name, n, start=1.0):
    """Yields n frames of a stock clip, cropped to fill the frame. Nothing if the clip is missing."""
    path = os.path.join(ROOT, "docs", "footage", name + ".mp4")
    if not os.path.exists(path):
        return
    ff = subprocess.Popen(["ffmpeg", "-loglevel", "error", "-ss", str(start), "-i", path, "-frames:v", str(n), "-vf",
                           f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps={FPS}",
                           "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    size = W * H * 3
    while True:
        buf = ff.stdout.read(size)
        if len(buf) < size:
            break
        yield Image.frombytes("RGB", (W, H), buf)
    ff.stdout.close()
    ff.wait()


BLANK = Image.new("RGB", (W, H), WHITE)


def camera(im, t, secs):
    """A quick fade to white into the next step. The picture itself never moves."""
    left = secs - t
    if left >= 0.3:
        return im
    return Image.blend(im, BLANK, (1 - left / 0.3) ** 2)


# ---------------- voice ----------------

def _lengths(tmp):
    out = []
    for i in range(len(STEPS)):
        with wave.open(os.path.join(tmp, f"line{i}.wav")) as w:
            out.append(w.getnframes() / w.getframerate())
    return out


def _to_wav(src, dst):
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-ac", "1", "-ar", str(RATE), "-sample_fmt", "s16", dst], check=True)


def _own_voice(tmp):
    """docs/voice/1.mp3 ... N.mp3 (or .wav / .m4a), one per line: your own recording wins."""
    folder = os.path.join(ROOT, "docs", "voice")
    files = [next((os.path.join(folder, f"{i + 1}{e}") for e in (".mp3", ".wav", ".m4a")
                   if os.path.exists(os.path.join(folder, f"{i + 1}{e}"))), None) for i in range(len(STEPS))]
    if not all(files):
        return []
    for i, f in enumerate(files):
        _to_wav(f, os.path.join(tmp, f"line{i}.wav"))
    print("voice: docs/voice")
    return _lengths(tmp)


def _neural_voice(tmp):
    try:
        import asyncio
        import edge_tts

        async def run():
            for i, s in enumerate(STEPS):
                await edge_tts.Communicate(s[1], VOICE, rate="+8%").save(os.path.join(tmp, f"line{i}.mp3"))
        asyncio.run(run())
        for i in range(len(STEPS)):
            _to_wav(os.path.join(tmp, f"line{i}.mp3"), os.path.join(tmp, f"line{i}.wav"))
    except Exception as e:  # package missing or no network: fall back to the offline voice
        print("neural voice unavailable:", str(e)[:120])
        return []
    print("voice:", VOICE)
    return _lengths(tmp)


def _system_voice(tmp):
    import json
    with open(os.path.join(tmp, "lines.json"), "w", encoding="utf-8") as f:
        json.dump([s[1] for s in STEPS], f)
    ps = os.path.join(tmp, "speak.ps1")
    with open(ps, "w", encoding="utf-8") as f:
        f.write("""param($dir)
Add-Type -AssemblyName System.Speech
$s = New-Object System.Speech.Synthesis.SpeechSynthesizer
$s.Rate = 2
$fmt = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(22050, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono)
$lines = Get-Content -Raw -Encoding UTF8 (Join-Path $dir 'lines.json') | ConvertFrom-Json
for ($i = 0; $i -lt $lines.Count; $i++) {
  $s.SetOutputToWaveFile((Join-Path $dir ("line$i.wav")), $fmt)
  $s.Speak($lines[$i])
}
$s.SetOutputToNull()
""")
    try:
        subprocess.run(["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", ps, tmp], capture_output=True, timeout=180)
        print("voice: Windows system voice")
        return _lengths(tmp)
    except (OSError, subprocess.SubprocessError, wave.Error):
        return []


def soundtrack(tmp, lengths):
    """One WAV as long as the video: each line starts just after its scene does."""
    path = os.path.join(tmp, "voice.wav")
    with wave.open(path, "wb") as o:
        o.setnchannels(1)
        o.setsampwidth(2)
        o.setframerate(RATE)
        for i, secs in enumerate(lengths):
            with wave.open(os.path.join(tmp, f"line{i}.wav")) as w:
                data = w.readframes(w.getnframes())
            total, lead = round(secs * FPS) * RATE // FPS, int(LEAD * RATE)
            o.writeframes(bytes(2) * lead + data + bytes(2) * max(0, total - lead - len(data) // 2))
    return path


def main():
    out = os.path.join(ROOT, "docs", "intro.mp4")
    tmp = os.path.join(os.environ.get("TEMP", "."), "sehat_intro")
    os.makedirs(tmp, exist_ok=True)
    spoken = _own_voice(tmp) or _neural_voice(tmp) or _system_voice(tmp)
    # a scene lasts exactly as long as its line (5 s each if there is no voice at all)
    lengths = [round((LEAD + x + TAIL) * FPS) / FPS for x in spoken] if spoken else [5.0] * len(STEPS)
    video = os.path.join(tmp, "silent.mp4") if spoken else out
    ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                           "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20",
                           "-movflags", "+faststart", video], stdin=subprocess.PIPE)
    total, T, n_step = sum(1 for s in STEPS if s[0] == "step"), 0.0, 0
    for (kind, _, title, sub, shot, at), secs in zip(STEPS, lengths):
        n = round(secs * FPS)
        n_step += kind == "step"
        reel = footage("prescription" if kind == "title" else "pills", n) if kind != "step" else None
        for i in range(n):
            t = i / FPS
            frame = next(reel, None) if reel else None
            # stock footage is washed almost to white so it reads as texture, not as a picture
            im = Image.blend(frame, BLANK, 0.84) if frame else backdrop(T)
            d = ImageDraw.Draw(im)
            particles(d, T)
            if kind == "title":
                s_title(im, d, t, secs)
            elif kind == "end":
                s_end(im, d, t, secs)
            else:
                s_step(im, d, t, secs, n_step, total, title, sub, shot, at)
            ff.stdin.write(camera(im, t, secs).tobytes())
            T += 1 / FPS
    ff.stdin.close()
    ff.wait()
    if spoken:
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", video, "-i", soundtrack(tmp, lengths), "-c:v", "copy",
                        "-c:a", "aac", "-b:a", "128k", "-shortest", "-movflags", "+faststart", out], check=True)
    print(out, round(sum(lengths), 1), "seconds", [round(x, 1) for x in lengths])


if __name__ == "__main__":
    main()
