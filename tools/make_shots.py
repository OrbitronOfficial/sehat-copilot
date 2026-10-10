"""Takes the app screenshots used by tools/make_intro.py into docs/shots.
Needs the local server running on :8820 and the playwright package with Chrome installed.
Run: python tools/make_shots.py"""
import os
from playwright.sync_api import sync_playwright

BASE = "http://localhost:8820"
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "docs", "shots")


def main():
    os.makedirs(OUT, exist_ok=True)
    shot = lambda page, name: page.screenshot(path=os.path.join(OUT, name + ".png"))
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True)
        page = browser.new_context(viewport={"width": 1440, "height": 900}, color_scheme="dark").new_page()
        page.goto(BASE + "/", wait_until="networkidle")
        page.wait_for_timeout(1500)
        shot(page, "landing")
        page.goto(BASE + "/app?demo=1", wait_until="networkidle")  # loads the synthetic demo profile
        page.wait_for_timeout(6000)
        page.evaluate("PET.tipOff = true; S.view = 'health'; render(); window.scrollTo(0, 0)")
        page.wait_for_timeout(2500)
        shot(page, "health")
        page.evaluate("S.view = 'timeline'; render(); window.scrollTo(0, 0)")
        page.wait_for_timeout(800)
        shot(page, "timeline")
        rid = page.evaluate("(S.records.find(r => /lab/.test(r.doc_type) && r.date > '2026-09') || S.records[0]).id")
        page.evaluate("S.view = 'detail'; S.detailId = %r; render(); window.scrollTo(0, 0)" % rid)
        page.wait_for_timeout(1200)
        shot(page, "detail")
        page.evaluate("S.view = 'health'; render()")
        page.wait_for_timeout(1500)
        page.evaluate("(() => { const h = [...document.querySelectorAll('h2')].find(x => /trend/i.test(x.innerText)); "
                      "if (h) h.scrollIntoView({ block: 'start' }); window.scrollBy(0, -90); })()")
        page.wait_for_timeout(600)
        shot(page, "trends")
        browser.close()


if __name__ == "__main__":
    main()
