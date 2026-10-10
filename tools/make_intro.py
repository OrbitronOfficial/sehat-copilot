"""Renders docs/intro.mp4: a short narrated product introduction.

Pictures: real screenshots of the app (docs/shots, taken by tools/make_shots.py), the project's
own sample document, and three stock clips (docs/footage, see CREDITS.md there).
Voice: docs/voice/1.mp3 ... 8.mp3 if you record your own, else a neural voice through the
edge-tts package, else the offline Windows voice.
Needs Pillow and ffmpeg on PATH.  Run: python tools/make_intro.py"""
import os
import subprocess
import math
import random
from PIL import Image, ImageDraw, ImageFilter, ImageFont

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


# ---------------- depth: drifting backdrop, floating particles, a turning helix, a camera ----------------

def _backdrop(base, blobs):
    im = Image.new("RGB", (W + 240, H + 240), base)
    d = ImageDraw.Draw(im)
    for x, y, r, c in blobs:
        d.ellipse((x - r, y - r, x + r, y + r), fill=c)
    return im.filter(ImageFilter.GaussianBlur(150))


BACK = {PAPER: _backdrop(PAPER, [(250, 200, 330, "#D9EEEA"), (1250, 760, 380, "#E3F1E4"), (1100, 120, 240, "#FFFFFF")]),
        DARK: _backdrop(DARK, [(300, 250, 360, "#11524C"), (1250, 700, 400, "#0E4A45"), (900, 100, 220, "#072B28")])}
random.seed(7)
DOTS = [(random.random(), random.random(), random.random()) for _ in range(46)]  # x, y, depth


def backdrop(bg, T):
    x, y = 120 + 90 * math.sin(T * 0.21), 120 + 70 * math.cos(T * 0.17)
    return BACK[bg].crop((round(x), round(y), round(x) + W, round(y) + H))


def particles(d, bg, T):
    """Small dots drifting upward; nearer ones are larger, brighter and faster."""
    tint = MINT if bg == DARK else TEAL
    for x, y, z in DOTS:
        px = (x * W + 40 * z * math.sin(T * 0.5 + x * 9)) % W
        py = (y * H - T * (10 + 34 * z)) % H
        r = 1.5 + 4.5 * z
        d.ellipse((px - r, py - r, px + r, py + r), fill=mix(bg, tint, 0.10 + 0.22 * z))


def helix(d, cx, top, height, radius, T, bg, k=1.0):
    """A double helix turning about its vertical axis, drawn back to front."""
    if k <= 0:
        return
    a, b = (MINT, "#FFFFFF") if bg == DARK else (TEAL, "#7FB8B0")
    n, balls = 26, []
    for i in range(n):
        y = top + height * i / (n - 1)
        ang = i * 0.52 + T * 1.3
        x, z = math.cos(ang) * radius, math.sin(ang)
        if i % 2 == 0:
            d.line((cx + x, y, cx - x, y), fill=mix(bg, a, 0.22 * k), width=2)
        balls += [(z, cx + x, y, a), (-z, cx - x, y, b)]
    for z, x, y, c in sorted(balls):
        r = 5 + 4.5 * (z + 1) / 2
        d.ellipse((x - r, y - r, x + r, y + r), fill=mix(bg, c, k * (0.35 + 0.65 * (z + 1) / 2)))


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


TINT = Image.new("RGB", (W, H), "#062522")


def camera(im, t, secs, bg):
    """A slow push-in through the scene, and a fly-through into the next one at the end."""
    z, left = 1 + 0.045 * t / secs, secs - t
    out = 0.0
    if left < 0.4:
        out = (1 - left / 0.4) ** 2
        z += 0.22 * out
    w, h = round(W * z), round(H * z)
    im = im.resize((w, h), Image.BICUBIC).crop(((w - W) // 2, (h - H) // 2, (w - W) // 2 + W, (h - H) // 2 + H))
    return Image.blend(im, Image.new("RGB", (W, H), bg), out) if out else im


def _coeffs(dst, src):
    """Perspective coefficients mapping output points dst back to source points src."""
    m = []
    for (x, y), (u, v) in zip(dst, src):
        m.append([x, y, 1, 0, 0, 0, -u * x, -u * y, u])
        m.append([0, 0, 0, x, y, 1, -v * x, -v * y, v])
    n = 8
    for c in range(n):  # Gauss-Jordan
        piv = max(range(c, n), key=lambda r: abs(m[r][c]))
        m[c], m[piv] = m[piv], m[c]
        m[c] = [v / m[c][c] for v in m[c]]
        for r in range(n):
            if r != c:
                f = m[r][c]
                m[r] = [a - f * b for a, b in zip(m[r], m[c])]
    return [m[i][8] for i in range(n)]


def card3d(im, src, x, y, yaw, lift=0.0):
    """Paste an image turned about its left edge by yaw (0 = flat), with a soft shadow under it."""
    w, h = src.size
    wd = w * math.cos(yaw)
    inset = h * 0.5 * math.sin(yaw) * 0.42
    quad = [(0, 0), (wd, inset), (wd, h - inset), (0, h)]
    shadow = Image.new("L", (W, H), 0)
    ImageDraw.Draw(shadow).polygon([(x + px + 18, y + py + 26 + lift) for px, py in quad], fill=90)
    shadow = shadow.filter(ImageFilter.GaussianBlur(22))
    im.paste(Image.new("RGB", (W, H), "#0B3B37"), (0, 0), shadow)
    warped = src.convert("RGBA").transform((w, h), Image.PERSPECTIVE, _coeffs(quad, [(0, 0), (w, 0), (w, h), (0, h)]), Image.BICUBIC)
    im.paste(warped, (round(x), round(y - lift)), warped)
    ImageDraw.Draw(im).line([(x + px, y + py - lift) for px, py in quad] + [(x, y - lift)], fill="#C9D6D0", width=2)


SAMPLE = Image.open(os.path.join(ROOT, "public", "samples", "lab-2026-06.png")).convert("RGB")
SAMPLE = SAMPLE.resize((440, round(440 * SAMPLE.height / SAMPLE.width)))


def s_title(im, d, t):
    cx = W // 2
    k = ease(t / 0.8)
    helix(d, 170, 60, 600, 62, t, DARK, k)
    helix(d, W - 170, 60, 600, 62, t + 2, DARK, k)
    r = 46
    d.rounded_rectangle((cx - r, 190 - r, cx + r, 190 + r), 22, fill=mix(DARK, TEAL, k))
    d.rectangle((cx - 8, 190 - 26, cx + 8, 190 + 26), fill=mix(DARK, "#FFFFFF", k))
    d.rectangle((cx - 26, 190 - 8, cx + 26, 190 + 8), fill=mix(DARK, "#FFFFFF", k))
    text(d, (cx, 290), "Sehat Copilot", 92, "#FFFFFF", DARK, t, 0.3, bold=True, anchor="ma")
    text(d, (cx, 420), "Understand your own health records.", 38, MINT, DARK, t, 0.9, anchor="ma")
    text(d, (cx, 600), "HacXLerate 2026  ·  Team ANTIJAREX", 22, MINT, DARK, t, 1.5, mono=True, anchor="ma")


def paste_doc(im, t, x=96, y=210):
    k = ease(t / 1.4)
    doc = SAMPLE.crop((0, 0, 440, min(SAMPLE.height, 470)))
    yaw = math.radians(62 - 50 * k + 3 * math.sin(t * 0.9))
    card3d(im, doc, x + (1 - k) * 120, y + 6 * math.sin(t * 1.1), yaw, lift=10 * k)


def s_read(im, d, t):
    step(d, 1, "Read the document", t)
    paste_doc(im, t)
    rows = [("HbA1c", "7.6 %", "High", AMBER), ("Fasting Blood Sugar", "142 mg/dL", "High", AMBER), ("HDL Cholesterol", "41 mg/dL", "Normal", TEAL)]
    for i, (n, v, f, c) in enumerate(rows):
        y, dl = 220 + i * 96, 0.8 + i * 0.6
        k = ease((t - dl) / 0.5)
        if k > 0:
            sx = (1 - k) * 80  # each row flies in from the right
            d.rounded_rectangle((606 + sx, y + 8, 1190 + sx, y + 88), 16, fill=mix(PAPER, "#C9DAD5", k))
            d.rounded_rectangle((600 + sx, y, 1184 + sx, y + 80), 16, fill=mix(PAPER, "#FFFFFF", k), outline=mix(PAPER, "#DDE5E0", k), width=2)
        text(d, (624, y + 12), n, 24, INK, "#FFFFFF", t, dl, bold=True)
        text(d, (624, y + 46), "read from a line on the report", 18, MUTED, "#FFFFFF", t, dl, mono=True)
        text(d, (1040, y + 26), v, 24, INK, "#FFFFFF", t, dl, mono=True, anchor="ra")
        pill(d, (1060, y + 18), f, c, "#FFFFFF", t, dl + 0.2, "#FFFFFF")
    text(d, (600, 540), "Photo, PDF or text. Printed or handwritten.", 28, MUTED, PAPER, t, 2.8)
    text(d, (600, 580), "Sample document shown.", 20, MUTED, PAPER, t, 2.8, mono=True)


def s_explain(im, d, t):
    step(d, 2, "In the language you think in", t)
    k = ease((t - 0.5) / 0.6)
    if k > 0:
        d.rounded_rectangle((104, 232, 1192, 412), 20, fill=mix(PAPER, "#C9DAD5", k))
        d.rounded_rectangle((96, 220, 1184, 400), 20, fill=mix(PAPER, "#FFFFFF", k), outline=mix(PAPER, "#DDE5E0", k), width=2)
    text(d, (130, 244), "HbA1c  7.6 %", 28, INK, "#FFFFFF", t, 0.6, mono=True)
    text(d, (130, 292), "Your average sugar over about three months is above", 30, INK, "#FFFFFF", t, 1.0)
    text(d, (130, 334), "the usual range. It has come down from 8.4.", 30, INK, "#FFFFFF", t, 1.0)
    x = 96
    for i, n in enumerate(["English", "Hindi", "Bengali", "Telugu", "Marathi", "Tamil", "Gujarati", "Kannada"]):
        x += pill(d, (x, 450), n, "#E6F2F0", DARK, t, 2.0 + i * 0.15, PAPER) + 12
    text(d, (96, 530), "43 languages. Summaries, answers and read-aloud.", 30, MUTED, PAPER, t, 3.4)
    text(d, (96, 580), "It explains your records. It never diagnoses and never tells you to change a medicine.", 24, AMBER, PAPER, t, 4.0)


# ---------------- real app screens, framed like a browser window and floated in 3D ----------------

def _framed(name, width):
    """A screenshot inside a dark browser frame, scaled to `width`."""
    path = os.path.join(ROOT, "docs", "shots", name + ".png")
    shot = Image.open(path).convert("RGB") if os.path.exists(path) else Image.new("RGB", (1440, 900), "#0E2B28")
    h = round(width * shot.height / shot.width)
    shot = shot.resize((width, h), Image.LANCZOS)
    bar = max(18, width // 34)
    im = Image.new("RGB", (width, h + bar), "#0A2320")
    d = ImageDraw.Draw(im)
    for i, c in enumerate(("#E0605A", "#E6B44C", "#5FBF77")):
        r = bar // 5
        d.ellipse((bar // 2 + i * (r * 3) - r, bar // 2 - r, bar // 2 + i * (r * 3) + r, bar // 2 + r), fill=c)
    im.paste(shot, (0, bar))
    return im


SHOT = {n: _framed(n, w) for n, w in (("detail", 820), ("health", 760), ("timeline", 500), ("trends", 500))}


def screen(im, name, x, y, t, delay=0.0, yaw0=58, yaw1=13, drift=0.0):
    """A screen swings in about its left edge, settles at a slight angle and keeps drifting."""
    k = ease((t - delay) / 1.3)
    if k <= 0:
        return
    yaw = math.radians(yaw0 - (yaw0 - yaw1) * k + 2.5 * math.sin((t + drift) * 0.8))
    card3d(im, SHOT[name], x + (1 - k) * 160, y + 7 * math.sin((t + drift) * 1.0), yaw, lift=14 * k)


def label(d, n, title, t, sub=None):
    text(d, (84, 54), f"STEP {n}" if n else "SEHAT COPILOT", 22, MINT, DARK, t, 0, mono=True)
    text(d, (84, 86), title, 50, "#FFFFFF", DARK, t, 0.1, bold=True)
    if sub:
        text(d, (84, 154), sub, 26, MINT, DARK, t, 0.5)


def s_problem(im, d, t):
    """Over stock footage: the lines land one by one."""
    for i, line in enumerate(["A prescription you cannot read.", "A lab report full of numbers.", "Papers from five visits."]):
        text(d, (96, 210 + i * 92), line, 62, "#FFFFFF", "#0A2A27", t, 0.2 + i * 1.5, bold=True)
    text(d, (96, 540), "Most people never learn what their own records say.", 30, MINT, "#0A2A27", t, 4.6)


s_problem.clips = ["prescription", "writing"]


def s_explained(im, d, t):
    label(d, 2, "Checked by code, explained in plain words", t)
    screen(im, "detail", 400, 196, t, 0.3)
    for i, line in enumerate(["High and low come from", "the printed range.", "", "Unreadable lines are", "listed, never guessed."]):
        text(d, (40, 300 + i * 38), line, 24, MINT if i < 2 else "#FFFFFF", DARK, t, 1.6 + (0.8 if i > 2 else 0))


def s_screens(im, d, t):
    label(d, 3, "One profile, one timeline", t)
    screen(im, "timeline", 730, 150, t, 0.9, yaw0=64, yaw1=20, drift=1.3)
    screen(im, "trends", 750, 420, t, 1.5, yaw0=64, yaw1=20, drift=2.6)
    screen(im, "health", 70, 200, t, 0.2, yaw0=56, yaw1=12)


def s_abdm(im, d, t):
    text(d, (96, 90), "Ready for India's health network", 54, "#FFFFFF", DARK, t, 0.0, bold=True)
    rows = [("FHIR R4 export", "Records leave as a standard bundle, shaped for ABDM."),
            ("Mock ABHA link", "Number, OTP, consent, choose records. Every step labelled mock."),
            ("Ask about your records", "Answers cite the report they came from, or say to ask your doctor.")]
    for i, (a, b) in enumerate(rows):
        dl = 0.7 + i * 0.9
        k = ease((t - dl) / 0.5)
        if k > 0:
            sx = (1 - k) * (90 if i % 2 else -90)
            d.rounded_rectangle((104 + sx, 220 + i * 130, 1192 + sx, 328 + i * 130), 18, fill=mix(DARK, "#062522", k))
            d.rounded_rectangle((96 + sx, 210 + i * 130, 1184 + sx, 318 + i * 130), 18, fill=mix(DARK, "#124A45", k))
        text(d, (128, 226 + i * 130), a, 32, "#FFFFFF", "#124A45", t, dl, bold=True)
        text(d, (128, 272 + i * 130), b, 24, MINT, "#124A45", t, dl)


def s_end(im, d, t):
    cx = W // 2
    helix(d, 170, 60, 600, 62, t + 1, DARK, ease(t / 0.8))
    helix(d, W - 170, 60, 600, 62, t + 3, DARK, ease(t / 0.8))
    text(d, (cx, 210), "Sehat Copilot", 80, "#FFFFFF", DARK, t, 0.0, bold=True, anchor="ma")
    text(d, (cx, 330), "A guide to your records. Not a doctor.", 34, MINT, DARK, t, 0.5, anchor="ma")
    text(d, (cx, 440), "sehat-copilot.vercel.app", 40, "#FFFFFF", DARK, t, 1.0, mono=True, anchor="ma")
    text(d, (cx, 520), "Open it and press  Load full demo profile", 26, MINT, DARK, t, 1.5, anchor="ma")
    text(d, (cx, 630), "Prototype. Sample data is synthetic. ABHA link is a mock.", 20, MINT, DARK, t, 2.0, mono=True, anchor="ma")


s_abdm.clips = ["pills"]

SCENES = [(s_title, 4.5, DARK), (s_problem, 6.5, DARK), (s_read, 5.5, PAPER), (s_explained, 6.0, DARK),
          (s_explain, 6.0, PAPER), (s_screens, 6.0, DARK), (s_abdm, 5.0, DARK), (s_end, 4.5, DARK)]


# One line of voice-over per scene, spoken by a Windows system voice (offline, System.Speech).
NARRATION = [
    "Sehat Copilot. Understand your own health records.",
    "A prescription you cannot read. A lab report full of numbers. Most people never learn what their own records say.",
    "Step one. Upload a photo or PDF. Every value is read with the line it came from.",
    "Step two. Code, not the A.I., decides what is high or low. Then each result is explained in plain words, beside the original.",
    "In forty-three languages. It never diagnoses, and it never tells you to change a medicine.",
    "Step three. Every record joins one profile and one timeline, so you can see what changed.",
    "Records export in the fire format, with a mock Aabha link that follows the national consent steps.",
    "Sehat Copilot. A guide to your records. Not a doctor.",
]
VOICE = "en-IN-NeerjaNeural"  # any edge-tts voice name
RATE = 22050
LEAD = 0.35  # silence before each line


def _lengths(tmp):
    import wave
    out = []
    for i in range(len(NARRATION)):
        with wave.open(os.path.join(tmp, f"line{i}.wav")) as w:
            out.append(w.getnframes() / w.getframerate())
    return out


def _to_wav(src, dst):
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-ac", "1", "-ar", str(RATE), "-sample_fmt", "s16", dst], check=True)


def _own_voice(tmp):
    """docs/voice/1.mp3 ... N.mp3 (or .wav), one per narration line: your own recording wins."""
    folder = os.path.join(ROOT, "docs", "voice")
    files = [next((os.path.join(folder, f"{i + 1}{e}") for e in (".mp3", ".wav", ".m4a")
                   if os.path.exists(os.path.join(folder, f"{i + 1}{e}"))), None) for i in range(len(NARRATION))]
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
            for i, line in enumerate(NARRATION):
                await edge_tts.Communicate(line, VOICE, rate="+14%").save(os.path.join(tmp, f"line{i}.mp3"))
        asyncio.run(run())
        for i in range(len(NARRATION)):
            _to_wav(os.path.join(tmp, f"line{i}.mp3"), os.path.join(tmp, f"line{i}.wav"))
    except Exception as e:  # package missing or no network: fall back to the offline voice
        print("neural voice unavailable:", str(e)[:120])
        return []
    print("voice:", VOICE, [round(x, 1) for x in _lengths(tmp)])
    return _lengths(tmp)


def speak(tmp):
    """Writes one WAV per narration line and returns their lengths in seconds. Empty list if
    no system voice is available (the video is then rendered silent)."""
    import json
    os.makedirs(tmp, exist_ok=True)
    got = _own_voice(tmp) or _neural_voice(tmp)
    if got:
        return got
    with open(os.path.join(tmp, "lines.json"), "w", encoding="utf-8") as f:
        json.dump(NARRATION, f)
    ps = os.path.join(tmp, "speak.ps1")
    with open(ps, "w", encoding="utf-8") as f:
        f.write("""param($dir)
Add-Type -AssemblyName System.Speech
$s = New-Object System.Speech.Synthesis.SpeechSynthesizer
$want = $s.GetInstalledVoices() | Where-Object { $_.Enabled -and $_.VoiceInfo.Culture.Name -like 'en-*' } | Sort-Object { $_.VoiceInfo.Name -notmatch 'Zira|Heera|Hazel' } | Select-Object -First 1
if ($want) { $s.SelectVoice($want.VoiceInfo.Name) }
$s.Rate = 2
$fmt = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(22050, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono)
$lines = Get-Content -Raw -Encoding UTF8 (Join-Path $dir 'lines.json') | ConvertFrom-Json
for ($i = 0; $i -lt $lines.Count; $i++) {
  $s.SetOutputToWaveFile((Join-Path $dir ("line$i.wav")), $fmt)
  $s.Speak($lines[$i])
}
$s.SetOutputToNull()
Write-Output $s.Voice.Name
""")
    try:
        r = subprocess.run(["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", ps, tmp],
                           capture_output=True, text=True, timeout=120)
    except (OSError, subprocess.SubprocessError):
        return []
    import wave
    out = []
    for i in range(len(NARRATION)):
        try:
            with wave.open(os.path.join(tmp, f"line{i}.wav")) as w:
                out.append(w.getnframes() / w.getframerate())
        except (OSError, wave.Error):
            return []
    print("voice:", r.stdout.strip(), [round(x, 1) for x in out])
    return out


def soundtrack(tmp, lengths):
    """One WAV as long as the video: each line starts just after its scene does."""
    import wave
    path = os.path.join(tmp, "voice.wav")
    with wave.open(path, "wb") as o:
        o.setnchannels(1)
        o.setsampwidth(2)
        o.setframerate(RATE)
        for i, secs in enumerate(lengths):
            with wave.open(os.path.join(tmp, f"line{i}.wav")) as w:
                data = w.readframes(w.getnframes())
            total = round(secs * FPS) * RATE // FPS
            lead = int(LEAD * RATE)
            o.writeframes(bytes(2) * lead + data + bytes(2) * max(0, total - lead - len(data) // 2))
    return path


def main():
    global SCENES
    out = os.path.join(ROOT, "docs", "intro.mp4")
    tmp = os.path.join(os.environ.get("TEMP", "."), "sehat_intro")
    spoken = speak(tmp)
    if spoken:  # a scene lasts at least as long as its line
        SCENES = [(fn, max(secs, round((LEAD + d + 0.7) * FPS) / FPS), bg) for (fn, secs, bg), d in zip(SCENES, spoken)]
    video = os.path.join(tmp, "silent.mp4") if spoken else out
    ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                           "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20",
                           "-movflags", "+faststart", video], stdin=subprocess.PIPE)
    T = 0.0
    for fn, secs, bg in SCENES:
        n = round(secs * FPS)
        clips = getattr(fn, "clips", [])
        part = -(-n // len(clips)) if clips else 0  # frames per clip
        reels = [footage(c, part) for c in clips]
        for i in range(n):
            t = i / FPS
            frame = next(reels[i // part], None) if clips else None
            # stock footage sits under a dark tint so the words stay readable
            im = Image.blend(frame, TINT, 0.62) if frame else backdrop(bg, T)
            d = ImageDraw.Draw(im)
            particles(d, bg, T)
            fn(im, d, t)
            im = camera(im, t, secs, bg)
            T += 1 / FPS
            ff.stdin.write(im.tobytes())
    ff.stdin.close()
    ff.wait()
    if spoken:
        voice = soundtrack(tmp, [secs for _, secs, _ in SCENES])
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", video, "-i", voice, "-c:v", "copy", "-c:a", "aac",
                        "-b:a", "128k", "-shortest", "-movflags", "+faststart", out], check=True)
    print(out, round(sum(s for _, s, _ in SCENES), 1), "seconds")


if __name__ == "__main__":
    main()
