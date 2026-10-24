"""Browser-Test „Was kann dieses Werkzeug?“ (funcWerkzeugInfo.jsx, Text aus src/seo): unter jedem Werkzeug aufklappbar,
mit Text, drei Fragen und Autor; keine Seitenüberbreite, keine Konsolenfehler bei 360 und 1280 px.
  npx vite build && npx vite preview --port 4173 &   →   python3 tests/ui/werkzeug-info.ui.py
"""
import os
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
AUS = os.environ.get("SCREENS", "/tmp/werkzeug-info")
os.makedirs(AUS, exist_ok=True)
fehler = []

def pruefe(bed, text):
    if not bed:
        fehler.append(text)
        print("FEHLT:", text)

with sync_playwright() as p:
    b = p.chromium.launch()
    for breite in (360, 1280):
        ctx = b.new_context(viewport={"width": breite, "height": 900}, locale="de-DE")
        pg = ctx.new_page()
        konsole = []
        pg.on("pageerror", lambda e: konsole.append(str(e)))
        pg.goto(BASE)
        pg.evaluate("localStorage.setItem('mm-onboarding-v1', JSON.stringify({uebersprungen:true}))")
        for pfad, wort in (("pythagoras", "Satz des Pythagoras"), ("ableitungstrainer", "Kettenregel"), ("integrale", "Hauptsatz"), ("prozent", "Grundwert")):
            pg.goto(BASE + pfad); pg.wait_for_timeout(1800)
            tag = f"{breite}/{pfad}"
            info = pg.locator("[data-werkzeug-info]")
            pruefe(info.count() == 1, f"{tag}: Info-Kasten fehlt")
            if not info.count():
                continue
            info.locator("summary").scroll_into_view_if_needed(); info.locator("summary").click(); pg.wait_for_timeout(300)
            t = info.inner_text()
            pruefe(wort in t, f"{tag}: Text ohne „{wort}“")
            pruefe(info.locator("dl:not(.wi-steck) dt").count() == 3, f"{tag}: nicht drei Fragen")
            pruefe("Mythos Mathe" in t and "Blumenröther" not in t, f"{tag}: Herausgeber-Zeile falsch (keine Person seit 24.10.)")
            pruefe(pg.evaluate("document.documentElement.scrollWidth - innerWidth") <= 0, f"{tag}: Überbreite")
            info.screenshot(path=f"{AUS}/{breite}-{pfad}.png")
        pg.goto(BASE); pg.wait_for_timeout(1200)
        pruefe(pg.locator("[data-werkzeug-info]").count() == 0, f"{breite}: Info-Kasten auf der Startseite")
        pruefe(not konsole, f"{breite}: Konsolenfehler {konsole[:2]}")
        ctx.close()
    b.close()

print("\n".join(fehler) if fehler else "OK")
raise SystemExit(1 if fehler else 0)
