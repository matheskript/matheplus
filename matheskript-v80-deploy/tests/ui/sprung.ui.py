"""Browser-Test Sprung-Schalter (src/sprung.js):
- Ungleichungen und Beträge: Kapitel-Leiste antippen → Seite bleibt stehen (Video 18.10.).
- „Weiter mit Kapitel n“ unten → neues Kapitel beginnt oben.
- Startseite → Schulmathematik → Analysis: Menü wird nach oben geholt (einzige Ausnahme).
- Ein anderes Aufklapp-Menü in einem Werkzeug springt nicht.
  npx vite build && npx vite preview --port 4173 &   →   python3 tests/ui/sprung.ui.py
"""
import os, sys
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
fehler = []
def pruefe(bed, text):
    if not bed:
        fehler.append(text); print("FEHLT:", text)

with sync_playwright() as p:
    b = p.chromium.launch()
    for breite in (390, 1280):
        ctx = b.new_context(viewport={"width": breite, "height": 800}, locale="de-DE")
        page = ctx.new_page()
        konsole = []
        page.on("pageerror", lambda e: konsole.append(f"pageerror: {e}"))
        page.goto(BASE)
        page.evaluate("localStorage.clear(); localStorage.setItem('mm-onboarding-v1', JSON.stringify({uebersprungen:true}));")
        y = lambda: page.evaluate("window.scrollY")

        # 1) Kapitel-Leiste im Lernweg
        page.goto(BASE + "ungleichungen"); page.wait_for_timeout(1200)
        nav = page.locator("nav[aria-label='Kapitel'] button")
        pruefe(nav.count() >= 3, f"{breite}: Kapitel-Leiste fehlt")
        page.evaluate("window.scrollTo(0, 0)"); page.wait_for_timeout(200)
        nav.nth(0).scroll_into_view_if_needed()
        page.evaluate("window.scrollBy(0, 120)"); page.wait_for_timeout(200)
        vor = y()
        nav.nth(1).click(); page.wait_for_timeout(900)
        pruefe(abs(y() - vor) < 4, f"{breite}: Kapitel-Leiste springt ({vor} → {y()})")
        nav.nth(2).click(); page.wait_for_timeout(900)
        pruefe(abs(y() - vor) < 4, f"{breite}: Kapitel-Leiste springt beim 2. Klick ({vor} → {y()})")

        # 2) „Weiter mit Kapitel n“ führt nach oben
        weiter = page.locator("[data-weiter-kapitel]")
        if weiter.count():
            weiter.scroll_into_view_if_needed(); page.wait_for_timeout(200)
            unten = y()
            weiter.click(); page.wait_for_timeout(1200)
            pruefe(y() < unten - 100, f"{breite}: „Weiter mit Kapitel“ bleibt unten ({unten} → {y()})")

        # 3) Startseite: Schulmathematik → Analysis springt (gewollt)
        page.goto(BASE); page.wait_for_timeout(1200)
        page.get_by_role("button", name="Schulmathematik aufklappen").click(); page.wait_for_timeout(900)
        knopf = page.get_by_role("button", name="Analysis aufklappen")
        knopf.scroll_into_view_if_needed(); page.evaluate("window.scrollBy(0, -250)"); page.wait_for_timeout(300)
        knopf.click(force=True); page.wait_for_timeout(1200)
        kopf = 0   # Header ist nicht mehr fixiert: Menü landet oben am Bildrand (plus kleiner Puffer)
        oben = page.get_by_role("button", name="Analysis zuklappen").first.evaluate("e => e.getBoundingClientRect().top")
        pruefe(abs(oben - kopf) < 40, f"{breite}: Startseite Analysis nicht nach oben geholt (top {oben}, Kopf {kopf})")

        # 4) Aufklapp-Menü in einem Werkzeug springt nicht (beliebiges aria-expanded auf der Ungleichungen-Seite oder Polynomplotter)
        for pfad in ("kurvendiskussion", "ungleichungen", "formelsammlung"):
            page.goto(BASE + pfad); page.wait_for_timeout(1300)
            kn = page.locator("main [aria-expanded='false'], #root [aria-expanded='false']:not([data-kein-scroll]):not(.kopf-hamburger)")
            gefunden = False
            for i in range(min(kn.count(), 8)):
                k = kn.nth(i)
                if not k.is_visible(): continue
                k.scroll_into_view_if_needed(); page.evaluate("window.scrollBy(0, 200)"); page.wait_for_timeout(200)
                if not k.is_visible() or k.evaluate("e => e.getBoundingClientRect().top") < 150: continue
                vor = y(); k.click(); page.wait_for_timeout(900)
                pruefe(abs(y() - vor) < 4, f"{breite}: Aufklappen in /{pfad} springt ({vor} → {y()})")
                gefunden = True; break
            print(breite, pfad, "Aufklapper geprüft" if gefunden else "kein Aufklapper gefunden")

        pruefe(not konsole, f"{breite}: Konsolenfehler {konsole[:3]}")
        ctx.close()
    b.close()
print("FEHLER:", len(fehler)); sys.exit(1 if fehler else 0)
