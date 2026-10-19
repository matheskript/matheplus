"""Browser-Test des Entdecken-Moduls „Carl Friedrich Gauß“ und des Scheins in der Formelsammlung.
Je Breite (360, 390, 1280):
  · Übersicht Mathe entdecken: Karte „Carl Friedrich Gauß“, Direktlink /mathe-entdecken/gauss öffnet das Modul
  · Alle vier Phasen: Regler bewegen, jeder Schritt über „Lösung dieses Schritts zeigen“ bis zum Ende
  · Phase 3: Bild des Scheins geladen (naturalWidth > 0)
  · Abschluss: drei Knöpfe zu den Werkzeugen
  · Formelsammlung: Normalverteilung zeigt den Schein mit Bildunterschrift
  · keine Seitenfehler, keine Konsolenfehler, keine Überbreite
  npx vite preview --port 4173 &   →   BASE_URL=http://localhost:4173/ python3 tests/ui/gauss.ui.py
"""
import os
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
AUS = os.environ.get("SCREENS", "/tmp/gauss")
os.makedirs(AUS, exist_ok=True)
fehler = []

def pruefe(bed, text):
    if not bed:
        fehler.append(text)
        print("FEHLT:", text)

def breit_ok(page, breite, wo):
    sw = page.evaluate("document.documentElement.scrollWidth")
    pruefe(sw <= breite, f"{wo}: Überbreite {sw}")

def schritte_durch(page, wo):
    for _ in range(10):
        zeigen = page.locator("button:has-text('Lösung dieses Schritts zeigen'):visible")
        if zeigen.count() == 0:
            break
        zeigen.first.click(); page.wait_for_timeout(90)
        page.locator("button:has-text('Weiter zum nächsten Schritt'):visible").first.click()
        page.wait_for_timeout(90)
    pruefe(page.locator("text=/Richtig gelöst|Geschafft/").count() > 0, f"{wo}: Phase nicht bis zum Ende")

def regler_bewegen(page):
    for knopf in page.locator("button[aria-label$=' +']:visible").all()[:3]:
        knopf.click(); page.wait_for_timeout(40)

with sync_playwright() as p:
    browser = p.chromium.launch()
    for breite in (360, 390, 1280):
        ctx = browser.new_context(viewport={"width": breite, "height": 844 if breite < 800 else 900})
        page = ctx.new_page()
        konsole = []
        page.on("pageerror", lambda e: konsole.append(str(e)))
        page.on("console", lambda m: konsole.append(m.text) if m.type == "error" else None)
        wo = f"{breite}px"

        page.goto(BASE + "mathe-entdecken"); page.wait_for_timeout(700)
        pruefe(page.locator("text=Carl Friedrich Gauß").count() > 0, f"{wo}: Karte fehlt in der Übersicht")
        breit_ok(page, breite, wo + " Übersicht")

        page.goto(BASE + "mathe-entdecken/gauss"); page.wait_for_timeout(900)
        pruefe(page.locator("text=Entdecke Carl Friedrich Gauß").count() > 0, f"{wo}: Direktlink öffnet das Modul nicht")
        for phase in range(1, 5):
            regler_bewegen(page)
            breit_ok(page, breite, f"{wo} Phase {phase}")
            if phase == 3:
                ok = page.evaluate("""() => { const i = document.querySelector('img[src*="zehn-mark-schein"]'); return !!i && i.complete && i.naturalWidth > 0; }""")
                pruefe(ok, f"{wo}: Bild des Scheins nicht geladen")
                page.screenshot(path=f"{AUS}/phase3-{breite}.png", full_page=True)
            schritte_durch(page, f"{wo} Phase {phase}")
            if phase < 4:
                page.locator("button:has-text('Weiter zu Phase')").first.click(); page.wait_for_timeout(200)
        pruefe(page.locator("text=Modul abgeschlossen").count() > 0, f"{wo}: Abschlusskarte fehlt")
        pruefe(page.locator("button:has-text('Gleichungssysteme üben')").count() > 0, f"{wo}: Abschluss-Knopf LGS fehlt")
        pruefe(page.locator("button:has-text('Normalverteilung erkunden')").count() > 0, f"{wo}: Abschluss-Knopf Normalverteilung fehlt")
        page.screenshot(path=f"{AUS}/abschluss-{breite}.png", full_page=True)

        page.goto(BASE + "formelsammlung"); page.wait_for_timeout(700)
        page.evaluate("() => window.__mmGehe && window.__mmGehe({ ansicht: 'formeln', bereich: 'stochastik', formel: 'normalverteilung' })")
        page.wait_for_timeout(900)
        pruefe(page.locator("text=Die Glocke auf dem Zehn-Mark-Schein").count() > 0, f"{wo}: Schein fehlt in der Formelsammlung")
        ok = page.evaluate("""() => { const i = document.querySelector('img[src*="zehn-mark-schein"]'); return !!i && i.complete && i.naturalWidth > 0; }""")
        pruefe(ok, f"{wo}: Formelsammlung: Bild nicht geladen")
        breit_ok(page, breite, wo + " Formelsammlung")
        page.screenshot(path=f"{AUS}/formelsammlung-{breite}.png", full_page=False)

        pruefe(not konsole, f"{wo}: Konsolenfehler {konsole[:3]}")
        ctx.close()
    browser.close()

print("FEHLER:", fehler if fehler else "keine")
raise SystemExit(1 if fehler else 0)
