"""Records one real session of the app being used, for tools/make_intro.py to cut into steps.

A scripted browser signs up, opens a sample report, checks and saves it, reads the explanation,
visits the timeline and dashboard, types a question, and walks the mock ABHA flow. The cursor
and clicks are drawn into the page so they show in the recording. Output: docs/clips/session.webm
and docs/clips/marks.json (when each step starts, and which waiting stretches to cut).

Needs the local server on :8820 and the playwright package with Chrome installed.
Run: python tools/make_clips.py"""
import json
import os
import shutil
import tempfile
import time
from playwright.sync_api import sync_playwright

BASE = "http://localhost:8820"
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "docs", "clips")
SIZE = {"width": 1200, "height": 750}

CURSOR = r"""
(() => {
  try { localStorage.setItem('sehat_theme', 'light'); } catch (e) {}
  const start = () => {
    if (document.getElementById('__cur')) return;
    const st = document.createElement('style');
    st.textContent = '@keyframes __rip{from{transform:translate(-50%,-50%) scale(.3);opacity:.55}to{transform:translate(-50%,-50%) scale(1);opacity:0}}' +
      '.__rip{position:fixed;width:70px;height:70px;border-radius:50%;background:rgba(15,118,110,.28);border:2px solid rgba(15,118,110,.8);pointer-events:none;z-index:2147483646;animation:__rip .55s ease-out forwards}';
    document.documentElement.appendChild(st);
    const c = document.createElement('div');
    c.id = '__cur';
    let pos = [600, 420];
    try { pos = JSON.parse(sessionStorage.getItem('__cur') || '[600,420]'); } catch (e) {}
    c.style.cssText = 'position:fixed;left:0;top:0;width:24px;height:32px;z-index:2147483647;pointer-events:none;transform:translate(' + pos[0] + 'px,' + pos[1] + 'px)';
    c.innerHTML = '<svg viewBox="0 0 24 32" width="24" height="32"><path d="M2 1v24l6.5-6 4.5 11 4-1.7-4.5-10.6H22z" fill="#fff" stroke="#0F172A" stroke-width="1.8" stroke-linejoin="round"/></svg>';
    document.documentElement.appendChild(c);
    document.addEventListener('mousemove', e => {
      c.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
      try { sessionStorage.setItem('__cur', JSON.stringify([e.clientX, e.clientY])); } catch (err) {}
    }, true);
    document.addEventListener('mousedown', e => {
      const r = document.createElement('div');
      r.className = '__rip';
      r.style.left = e.clientX + 'px';
      r.style.top = e.clientY + 'px';
      document.documentElement.appendChild(r);
      setTimeout(() => r.remove(), 600);
    }, true);
  };
  if (document.documentElement) start();
  document.addEventListener('DOMContentLoaded', start);
})();
"""


def main():
    os.makedirs(OUT, exist_ok=True)
    tmp = tempfile.mkdtemp(prefix="sehat_clips_")
    marks, cuts = [], []
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True)
        ctx = browser.new_context(viewport=SIZE, record_video_dir=tmp, record_video_size=SIZE, color_scheme="light")
        ctx.add_init_script(CURSOR)
        page = ctx.new_page()
        t0 = time.monotonic()
        now = lambda: round(time.monotonic() - t0, 2)
        mark = lambda name: marks.append((name, now()))
        pause = page.wait_for_timeout

        def go(sel, after=450, nth=0):
            """Glide to an element and click it."""
            el = page.locator(sel).nth(nth)
            el.scroll_into_view_if_needed()
            box = el.bounding_box()
            x, y = box["x"] + box["width"] / 2, box["y"] + box["height"] / 2
            page.mouse.move(x, y, steps=26)
            pause(160)
            page.mouse.down()
            pause(70)
            page.mouse.up()
            pause(after)

        def typed(sel, text, delay=62):
            go(sel, 200)
            page.keyboard.type(text, delay=delay)
            pause(300)

        def waiting(fn):
            """Run a wait that should not be watched: keep its first 1.4 s and last 0.4 s only."""
            a = now()
            fn()
            b = now()
            if b - a > 2.4:
                cuts.append((round(a + 1.4, 2), round(b - 0.4, 2)))

        def scroll(total, step=60, gap=45):
            for _ in range(abs(total) // step):
                page.mouse.wheel(0, step if total > 0 else -step)
                pause(gap)
            pause(350)

        page.goto(BASE + "/login", wait_until="load")
        pause(1200)

        mark("login")  # create an account on this device
        go("#t-up")
        typed("#name", "Rahul Sharma")
        typed("#email", "rahul@example.com")
        typed("#pw", "walkthrough-only-1")
        go("#submit", 300)
        page.wait_for_url("**/app*", timeout=20000)
        page.wait_for_function("typeof S !== 'undefined' && S.ready", timeout=20000)
        page.evaluate("PET.tipOff = true; renderPet()")
        pause(900)

        mark("add")  # open a sample report: it is read live
        go('[data-act="sample"]:has-text("September")', 300)
        waiting(lambda: page.wait_for_function("S.stage === 'review'", timeout=90000))
        pause(900)

        mark("review")  # what was read, beside the original
        scroll(420)
        box = page.locator('[data-path="tests.0.value"]').bounding_box()
        if box:
            page.mouse.move(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2, steps=24)
            pause(900)
        go('[data-act="save"]', 300)
        page.wait_for_function("S.view === 'detail'", timeout=30000)

        mark("detail")  # the explanation in plain words
        waiting(lambda: page.wait_for_function(
            "(() => { const r = getRec(S.detailId); return r && r.explanation && r.explanation.summary; })()", timeout=90000))
        pause(900)
        page.mouse.move(520, 420, steps=18)
        scroll(360)
        pause(600)

        a = now()  # off camera: the rest of the sample patient's history
        page.evaluate("loadDemo()")
        page.wait_for_function("S.records.length >= 5", timeout=30000)
        pause(600)
        page.evaluate("PET.tipOff = true; PET.open = false; S.view = 'detail'; render(); window.scrollTo(0, 0)")
        pause(300)
        cuts.append((a, now()))

        mark("timeline")
        go('[data-act="nav"][data-view="timeline"]', 900)
        page.mouse.move(640, 420, steps=18)
        scroll(520)

        mark("health")
        go('[data-act="nav"][data-view="health"]', 1800)
        page.mouse.move(640, 430, steps=18)
        scroll(1500, gap=38)

        mark("ask")
        go('[data-act="nav"][data-view="ask"]', 900)
        typed("#askInput", "What is my latest HbA1c?", delay=58)
        go('#askForm button[type="submit"]', 1400)
        chip = page.locator(".srcs .chip").first
        if chip.count():
            box = chip.bounding_box()
            page.mouse.move(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2, steps=24)
        pause(1500)

        mark("abha")
        go('[data-act="nav"][data-view="abha"]', 900)
        typed("#abhaInput", "12345678901234", delay=55)
        go('#abhaForm button[type="submit"]', 300)
        page.wait_for_selector("#abhaOtp", timeout=20000)
        typed("#abhaOtp", "482913", delay=90)
        go('#abhaOtpForm button[type="submit"]', 900)
        go('#abhaConsentForm button[type="submit"]', 900)
        go('#abhaPickForm button[type="submit"]', 1600)
        mark("end")
        pause(500)
        video = page.video
        ctx.close()
        browser.close()
        shutil.copyfile(video.path(), os.path.join(OUT, "session.webm"))
    with open(os.path.join(OUT, "marks.json"), "w", encoding="utf-8") as f:
        json.dump({"size": [SIZE["width"], SIZE["height"]], "marks": marks, "cuts": cuts}, f, indent=1)
    shutil.rmtree(tmp, ignore_errors=True)
    print("recorded", marks[-1][1], "s;", "steps:", [(n, t) for n, t in marks], "cuts:", cuts)


if __name__ == "__main__":
    main()
