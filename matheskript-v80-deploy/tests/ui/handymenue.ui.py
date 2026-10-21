"""Browser-Test „Dein Training startet hier.“ am Handy: einfaches Kapitel-Menü statt Anhak-Plan.
Prüft bei 360/390: auch bei gespeichertem Plan-Modus kein „Themen für deinen Plan“, kein Plan-Eintrag im Kapitel,
Unterthemen zum Antippen, „Empfohlene Kurse für dich“ unten, Sprung ins Training und in den Kurs, keine Überbreite.
Bei 1280 bleibt der Plan-Modus wie bisher.
  npx vite preview --port 4173 &   →   python3 tests/ui/handymenue.ui.py
"""
import os, json
from playwright.sync_api import sync_playwright
from startkarte_hilfe import schublade_auf

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
AUS = os.environ.get("SCREENS", "/tmp/hm")
os.makedirs(AUS, exist_ok=True)
fehler = []

def pruefe(bed, text):
    if not bed:
        fehler.append(text); print("FEHLT:", text)

SPEICHER = json.dumps({"schulart": "g9", "klasse": "12", "kapitel": None, "teil": None, "modus": "plan", "auswahl": ["ksExp.1", "ksExp.2"]})

with sync_playwright() as p:
    b = p.chromium.launch()
    for breite in (360, 390, 1280):
        handy = breite < 840
        ctx = b.new_context(viewport={"width": breite, "height": 900}, device_scale_factor=2, timezone_id="Europe/Berlin", locale="de-DE")
        page = ctx.new_page()
        konsole = []
        page.on("pageerror", lambda e: konsole.append(f"pageerror: {e}"))
        page.goto(BASE)
        page.evaluate("(s) => { localStorage.clear(); sessionStorage.clear(); localStorage.setItem('mm-onboarding-v1', JSON.stringify({uebersprungen:true})); localStorage.setItem('matheplus-quickfinder', s); sessionStorage.setItem('matheplus-training-auf','1'); }", SPEICHER)
        page.reload(); page.wait_for_timeout(900)
        schublade_auf(page)

        if handy:
            pruefe(page.get_by_text("Themen für deinen Plan").count() == 0, f"{breite}: Plan-Auswahl noch da")
            pruefe(page.get_by_text("Zurück zu den Kapiteln").count() == 0, f"{breite}: Zurück-Knopf noch da")
            pruefe(page.get_by_role("checkbox").count() == 0, f"{breite}: Häkchen-Kästchen noch da")
            pruefe(page.get_by_text("Plan speichern und starten").count() == 0, f"{breite}: Plankarte noch da")
            pruefe(page.get_by_text("Empfohlene Kurse für dich").count() == 1, f"{breite}: Empfehlungen fehlen")
            pruefe(page.locator("[data-kurs-empfehlung]").count() >= 1, f"{breite}: keine Kurs-Karte")
            page.locator("button[aria-expanded]", has_text="e-Funktion, ln, Umkehrfunktion").first.click(); page.wait_for_timeout(300)
            pruefe(page.get_by_text("Unterthemen – antippen und üben").count() == 1, f"{breite}: Unterthemen fehlen")
            pruefe(page.get_by_role("button", name="Trainingsplan zu diesem Kapitel").count() == 0, f"{breite}: Plan-Eintrag im Kapitel")
            pruefe(page.get_by_role("button", name="e-Funktion ableiten").count() == 1, f"{breite}: Unterthema fehlt")
            sw = page.evaluate("document.documentElement.scrollWidth"); pruefe(sw <= breite, f"{breite}: Überbreite {sw}")
            page.screenshot(path=f"{AUS}/menue-{breite}.png", full_page=False)
            page.get_by_role("button", name="e-Funktion ableiten").click(); page.wait_for_timeout(900)
            pruefe("trainieren" in page.url, f"{breite}: Unterthema führt nicht ins Training ({page.url})")
            page.go_back(); page.wait_for_timeout(700)
            if page.locator("[data-kurs-empfehlung]").count():
                page.locator("[data-kurs-empfehlung]").first.scroll_into_view_if_needed()
                page.screenshot(path=f"{AUS}/kurse-{breite}.png")
                page.locator("[data-kurs-empfehlung]").first.click(); page.wait_for_timeout(900)
                pruefe(("differentialrechnung" in page.url) or ("vektoren" in page.url), f"{breite}: Kurs-Karte führt nirgends hin ({page.url})")
        else:
            pruefe(page.get_by_text("Themen für deinen Plan").count() >= 1, f"{breite}: Desktop-Plan weg")
            pruefe(page.get_by_role("checkbox").count() >= 1, f"{breite}: Desktop-Häkchen weg")
        pruefe(not konsole, f"{breite}: Konsolenfehler {konsole[:2]}")
        ctx.close()
    b.close()

print("FEHLER:" if fehler else "ALLES OK", fehler)
raise SystemExit(1 if fehler else 0)
