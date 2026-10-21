"""Browser-Test Heute-Karte (Startseite, Zone „1 Heute“, Schüler Klasse 12, Thema Analysis).
Frischer Schüler und Schüler mit Lernstand (Protokoll + wiederkehrender Fehler): zugeklappt Vorschau mit
Medaillons, aufgeklappt konkrete Einheiten; Start öffnet das Werkzeug im richtigen Modus.
Prüft bei 360, 390 und 1280 px: keine Seitenüberbreite, keine Konsolenfehler, Screenshots.
  npm run build && npx vite preview --port 4173 &   →   python3 tests/ui/heute-karte.ui.py
"""
import json, os, time
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
AUS = os.environ.get("SCREENS", "/tmp/heute")
os.makedirs(AUS, exist_ok=True)
fehler = []

def pruefe(bed, text):
    if not bed:
        fehler.append(text)
        print("FEHLT:", text)

ONB = {"rolle": "schueler", "klasse": 12, "ziel": "luecken", "thema": "analysis"}
JETZT = int(time.time() * 1000)
TAG = 86400000
def e(tage, ok, **x):
    return {"zeit": JETZT - int(tage * TAG), "richtig": ok, **x}
LERNSTAND = {
    "protokoll": [
        e(5, True, bereich="ableitungstrainer", art="polynom"), e(5, True, bereich="ableitungstrainer", art="polynom"),
        e(3, True, bereich="ableitungstrainer", art="wurzel"),
        e(2, False, bereich="ableitungstrainer", art="produkt"), e(2, False, bereich="ableitungstrainer", art="produkt"), e(2, True, bereich="ableitungstrainer", art="produkt"),
        e(0.01, True, bereich="steckbrief", gruppe="poly-p2"), e(0.005, True, bereich="steckbrief", gruppe="poly-p2"),
        e(0.004, True, bereich="fehlertraining"), e(0.003, False, bereich="fehlertraining"),
    ],
    "training": {"beobachtungen": [{"typ": "kettenregel", "zeit": JETZT - 3 * TAG}, {"typ": "kettenregel", "zeit": JETZT - 1 * TAG}, {"typ": "kettenregel", "zeit": JETZT - 1 * TAG}, {"typ": "vorzeichen", "zeit": JETZT - 2 * TAG}]},
    "_zeit": JETZT,
}

with sync_playwright() as p:
    b = p.chromium.launch()
    for breite in (360, 390, 1280):
        for fall in ("frisch", "stand"):
            ctx = b.new_context(viewport={"width": breite, "height": 900}, device_scale_factor=2, timezone_id="Europe/Berlin", locale="de-DE")
            page = ctx.new_page()
            konsole = []
            page.on("pageerror", lambda er: konsole.append(f"pageerror: {er}"))
            page.on("console", lambda m: konsole.append(m.text) if m.type == "error" and "net::" not in m.text and "Failed to load resource" not in m.text else None)
            page.goto(BASE)
            js = f"localStorage.clear(); sessionStorage.clear(); localStorage.setItem('mm-onboarding-v1', {json.dumps(json.dumps(ONB))});"
            if fall == "stand":
                js += f"localStorage.setItem('matheskript-lernstand-v1', {json.dumps(json.dumps(LERNSTAND))}); localStorage.setItem('matheplus-funktionen-kapitel', 'verkettung');"
            page.evaluate(js)
            page.reload(); page.wait_for_timeout(1200)

            karte = page.locator("[data-heute-karte]")
            pruefe(karte.count() == 1, f"{breite}/{fall}: Heute-Karte fehlt")
            karte.scroll_into_view_if_needed(); page.wait_for_timeout(300)
            pruefe(karte.get_attribute("data-offen") == "0", f"{breite}/{fall}: Karte startet nicht zugeklappt")
            text = karte.inner_text()
            pruefe("Einheiten für heute" in text or "Für heute geschafft" in text, f"{breite}/{fall}: Kopf ohne Umfang")
            pruefe("Aufgaben im Detail" in text, f"{breite}/{fall}: Aufklapp-Knopf fehlt")
            sw = page.evaluate("document.documentElement.scrollWidth")
            pruefe(sw <= breite, f"{breite}/{fall}: Überbreite zugeklappt: {sw}")
            karte.screenshot(path=f"{AUS}/{breite}-{fall}-zu.png")

            page.locator("[data-heute-vorschau]").click(); page.wait_for_timeout(400)
            pruefe(karte.get_attribute("data-offen") == "1", f"{breite}/{fall}: Aufklappen klappt nicht")
            text = karte.inner_text()
            einheiten = page.locator("[data-heute-einheit]")
            pruefe(einheiten.count() == 4, f"{breite}/{fall}: erwartet 4 Einheiten, gefunden {einheiten.count()}")
            if fall == "frisch":
                for t in ("Funktionsbegriff klären", "Polynome ableiten", "Parabel aus Eigenschaften", "Kettenregel"):
                    pruefe(t in text, f"{breite}/frisch: „{t}“ fehlt")
                pruefe("Vorbeugend" in text, f"{breite}/frisch: Fehler-Einheit nicht als vorbeugend markiert")
            else:
                for t in ("Verkettungen bilden", "Produktregel trainieren", "Kapitel 5 von 7", "Wiederkehrender Fehler", "3× bei dir beobachtet"):
                    pruefe(t in text, f"{breite}/stand: „{t}“ fehlt")
                pruefe("Heute geschafft" in text or "heute 2 von 2" in text.lower() or "Nochmal" in text, f"{breite}/stand: Steckbrief Grad 2 nicht als geschafft")
            sw = page.evaluate("document.documentElement.scrollWidth")
            pruefe(sw <= breite, f"{breite}/{fall}: Überbreite aufgeklappt: {sw}")
            karte.screenshot(path=f"{AUS}/{breite}-{fall}-auf.png")

            # Start: Ableitungstrainer öffnet im gewählten Modus
            einheit = page.locator("[data-heute-einheit='ableitungstrainer']")
            einheit.get_by_role("button").last.click(); page.wait_for_timeout(1500)
            pruefe("ableitungstrainer" in page.url, f"{breite}/{fall}: Ableitungstrainer nicht geöffnet ({page.url})")
            soll = "Polynome" if fall == "frisch" else "Produkte"
            chip = page.locator(f".abl-chip[aria-pressed='true']")
            pruefe(chip.count() >= 1 and soll in chip.first.inner_text(), f"{breite}/{fall}: Ableitungstrainer nicht in „{soll}“ ({chip.first.inner_text() if chip.count() else '–'})")
            if breite == 390:
                page.screenshot(path=f"{AUS}/{breite}-{fall}-ableitung.png")

            # zurück, Karte bleibt aufgeklappt (Zustand je Gerät)
            page.go_back(); page.wait_for_timeout(1000)
            pruefe(page.locator("[data-heute-karte]").get_attribute("data-offen") == "1", f"{breite}/{fall}: Aufklapp-Zustand nicht gemerkt")
            if fall == "stand":
                page.locator("[data-heute-einheit='steckbrief']").get_by_role("button").last.click(); page.wait_for_timeout(1500)
                pruefe("steckbrief" in page.url, f"{breite}: Steckbrief nicht geöffnet")
                page.go_back(); page.wait_for_timeout(800)
                page.locator("[data-heute-einheit='fehler']").get_by_role("button").last.click(); page.wait_for_timeout(1200)
                pruefe("Sechs neue Aufgaben zum Fehlertyp „Kettenregel" in page.inner_text("body"), f"{breite}: Fehlertraining startet nicht mit Kettenregel")

            pruefe(not konsole, f"{breite}/{fall}: Konsolenfehler: {konsole[:3]}")
            ctx.close()
    b.close()

print("OK" if not fehler else f"{len(fehler)} Fehler")
raise SystemExit(1 if fehler else 0)
