"""Browser-Test des Parabel-Trainers (/parabeln).
Je Breite (360, 390, 1280) und Sprache (DE, EN):
  · Seite ohne Überbreite und Konsolenfehler, im Training ohne Scrollen (Handy: alles bis „Ich hänge fest“ sichtbar)
  · jedes Kernthema, jeder Aufgabentyp: Aufgabe mit falscher Eingabe → Rückmeldung → „Lösung zeigen“ bis zum Ende
  · eine ganze Runde (10 Aufgaben) bis zur Auswertung
  · Entdecken-Modus und die Extra-Themen Brennpunkt und Schnittpunkte öffnen
  · Parabeln ist eine eigene Station (nicht bei Sinus, Wachstum) und im Band des Kurses Mittelstufe
  npm run build && npx vite preview --port 4173 &   →   python3 -u tests/ui/parabeltrainer.ui.py
"""
import os
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
AUS = os.environ.get("SCREENS", "/tmp/parabeltrainer")
os.makedirs(AUS, exist_ok=True)
fehler = []
def pruefe(bed, text):
    if not bed:
        fehler.append(text); print("FEHLT:", text)

THEMEN = {"normal": 5, "scheitel": 6, "null": 7}     # Chips inkl. „Gemischt“
NAMEN_DE = {"normal": "Normalform", "scheitel": "Scheitelform", "null": "Nullstellen", "brenn": "Brennpunkt", "schnitt": "Schnittpunkte"}
NAMEN_EN = {"normal": "Standard form", "scheitel": "Vertex form", "null": "Roots", "brenn": "Focus", "schnitt": "Intersections"}

def thema_waehlen(page, sprache, t):
    page.locator(".pt-themaknopf").click(); page.wait_for_timeout(80)
    name = (NAMEN_DE if sprache == "de" else NAMEN_EN)[t]
    page.locator(".wk-pop-liste button", has_text=name).first.click(); page.wait_for_timeout(150)

def aufgabe_loesen(page, wo, ehrlich_falsch=True):
    """Arbeitet die aktuelle Aufgabe ab: falsch eingeben, Rückmeldung prüfen, Lösung zeigen."""
    for _ in range(6):
        if page.locator(".pt-geschafft").count(): return True
        felder = page.locator(".pt-teil input")
        kacheln = page.locator(".pt-kacheln button:not([disabled])")
        wahl = page.locator(".pt-wahl button:not([disabled])")
        regler = page.locator(".pt-step button")
        if felder.count():
            for i in range(felder.count()):
                felder.nth(i).click(); felder.nth(i).fill("97")
            page.locator(".pt-pruefen").click(); page.wait_for_timeout(60)
            pruefe(page.locator(".pt-rueck").count() == 1, f"{wo}: keine Rückmeldung bei falscher Zahl")
        elif kacheln.count():
            kacheln.first.click(); page.wait_for_timeout(60)
        elif wahl.count():
            wahl.first.click(); page.wait_for_timeout(60)
        elif regler.count():
            for _ in range(8): regler.nth(1).click()
            page.wait_for_timeout(60)
        if page.locator(".pt-geschafft").count(): return True
        z = page.locator(".pt-zeigen")
        if z.count(): z.first.click(); page.wait_for_timeout(80)
    return page.locator(".pt-geschafft").count() > 0

with sync_playwright() as p:
    b = p.chromium.launch()
    for sprache in ("de", "en"):
        for (breite, hoehe) in ((360, 740), (390, 844), (1280, 800)):
            ctx = b.new_context(viewport={"width": breite, "height": hoehe}, locale="de-DE", has_touch=breite < 500)
            page = ctx.new_page(); konsole = []
            page.on("pageerror", lambda e: konsole.append(f"pageerror: {e}"))
            page.on("console", lambda m: konsole.append(m.text) if m.type == "error" and "net::" not in m.text and "Failed to load resource" not in m.text else None)
            page.goto(BASE)
            page.evaluate("localStorage.clear(); localStorage.setItem('mm-onboarding-v1', JSON.stringify({uebersprungen:true}));" + ("localStorage.setItem('mm-sprache','en');" if sprache == "en" else ""))
            page.goto(BASE + "parabeln"); page.wait_for_timeout(1200)
            wo0 = f"{sprache}/{breite}"
            pruefe(page.locator("[data-werkzeug-band]").count() == 1, f"{wo0}: kein Werkzeug-Band")
            pruefe(page.locator(".pt-kopf").count() == 1, f"{wo0}: Trainer nicht geladen")

            # Kurs Mittelstufe (trainingsKurse.js): Geraden · Parabeln · Pythagoras · Gleichungen · Brüche und Wurzeln
            opts = page.locator("[data-werkzeug-band] .wb-tab")
            pruefe(opts.count() == 5, f"{wo0}: Kurs Mittelstufe hat {opts.count()} Reiter statt 5")

            for t, nchips in THEMEN.items():
                thema_waehlen(page, sprache, t)
                chips = page.locator(".pt-chip")
                pruefe(chips.count() == nchips, f"{wo0}/{t}: {chips.count()} Chips statt {nchips}")
                for i in range(chips.count()):
                    wo = f"{wo0}/{t}/{i}"
                    chips.nth(i).click(); page.wait_for_timeout(150)
                    page.evaluate("window.scrollTo(0,0)")
                    if breite < 500:
                        # ohne Scrollen: Unterkante des Fußes im Bild
                        unten = page.evaluate("(()=>{const f=document.querySelector('.pt-rechts');return f?f.getBoundingClientRect().bottom:0})()")
                        pruefe(0 < unten <= hoehe, f"{wo}: Aufgabe passt nicht auf den Bildschirm (Fuß bei {unten:.0f} von {hoehe})")
                    if breite == 390 and sprache == "de": page.screenshot(path=f"{AUS}/{t}-{i}-start.png")
                    for k in range(2 if i else 3):
                        pruefe(aufgabe_loesen(page, f"{wo}/{k}"), f"{wo}/{k}: Aufgabe nicht bis zum Ende")
                        if breite == 390 and sprache == "de" and k == 0: page.screenshot(path=f"{AUS}/{t}-{i}-fertig.png")
                        page.locator(".pt-weiter").first.click(); page.wait_for_timeout(120)
                    sw = page.evaluate("document.documentElement.scrollWidth"); pruefe(sw <= breite, f"{wo}: Überbreite {sw}")

            # ganze Runde bis zur Auswertung
            thema_waehlen(page, sprache, "normal")
            page.locator(".pt-chip").first.click(); page.wait_for_timeout(120)
            for k in range(10):
                pruefe(aufgabe_loesen(page, f"{wo0}/runde/{k}"), f"{wo0}/runde/{k}: nicht gelöst")
                page.locator(".pt-weiter").first.click(); page.wait_for_timeout(100)
            pruefe(page.locator(".pt-ende").count() == 1, f"{wo0}: keine Auswertung nach 10 Aufgaben")
            if breite == 390 and sprache == "de": page.screenshot(path=f"{AUS}/runde-ende.png")
            page.locator(".pt-ende .pt-weiter").click(); page.wait_for_timeout(100)
            pruefe(page.locator(".pt-ende").count() == 0, f"{wo0}: neue Runde startet nicht")

            # Entdecken und Extras
            page.locator(".pt-seg button").first.click(); page.wait_for_timeout(300)
            pruefe(page.locator(".pt-entdecken svg").count() > 0, f"{wo0}: Entdecken ohne Schaubild")
            if breite == 390 and sprache == "de": page.screenshot(path=f"{AUS}/entdecken.png")
            for t in ("brenn", "schnitt"):
                thema_waehlen(page, sprache, t); page.wait_for_timeout(200)
                pruefe(page.locator(".pt-entdecken").count() == 1, f"{wo0}/{t}: Extra-Thema fehlt")
                sw = page.evaluate("document.documentElement.scrollWidth"); pruefe(sw <= breite, f"{wo0}/{t}: Überbreite {sw}")
                if breite == 390 and sprache == "de": page.screenshot(path=f"{AUS}/{t}.png")
            pruefe(not konsole, f"{wo0}: Konsole: {konsole[:3]}")
            ctx.close()

    # Kennen-Station enthält keine Parabeln mehr
    ctx = b.new_context(viewport={"width": 1280, "height": 900}); page = ctx.new_page()
    page.goto(BASE); page.evaluate("localStorage.setItem('mm-onboarding-v1', JSON.stringify({uebersprungen:true}))")
    page.goto(BASE + "sinus"); page.wait_for_timeout(1000)
    page.locator("[data-werkzeug-leiste] button[aria-haspopup=listbox]").click(); page.wait_for_timeout(100)
    chips = [c.inner_text() for c in page.locator("[data-werkzeug-leiste] [role=option]").all()]
    pruefe(not any("Parabel" in c for c in chips) and len(chips) >= 2, f"Station Kennen zeigt noch Parabeln: {chips!r}")
    # Geraden → Parabeln: Reiter im Kurs Mittelstufe (früher „Weiter: Parabeln“ im Tools-Feld)
    page.goto(BASE + "geradengleichung"); page.wait_for_timeout(1000)
    pruefe(page.locator("[data-werkzeug-band] .wb-tab", has_text="Parabeln").count() == 1, "Geraden: kein Reiter Parabeln")
    b.close()

print("\n".join(fehler) if fehler else "Alles in Ordnung.")
raise SystemExit(1 if fehler else 0)
