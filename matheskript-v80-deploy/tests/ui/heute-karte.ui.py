"""Browser-Test Heute-Karte (Startseite, Zone „1 Heute trainierst du …“, Schüler Klasse 12, Thema Analysis).
Seit 21.10. zeigt die Karte DEN Tagesplan (tagesplan.js): Vorschlags-Themen aus der Klasse (ksExp → Ableitungstrainer,
ksInt → Integrale), Warm-up zuerst, Aufs Blatt zuletzt; mit Lernstand dazu „Fehler üben“ (wiederkehrende Kettenregel) und
die konkrete Einheit „Produktregel trainieren“ (zuletzt wackelig). Frisch: 4 Etappen, mit Stand: 5.
Start (Kachel, Goldknopf, Karte) öffnet das Werkzeug im richtigen Modus; Blatt/Warm-up lassen sich abhaken.
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
            # Speicher auf einer statischen Datei setzen (gleiche Herkunft, aber die App läuft nicht und schreibt nicht dazwischen –
            # die Heute-Karte sichert ihren Tagesplan sofort nach dem Laden in den Lernstand)
            page.goto(BASE + "buecher/vektoren/viewer.css")
            js = f"localStorage.clear(); localStorage.setItem('mm-start-app','1'); sessionStorage.clear(); localStorage.setItem('mm-onboarding-v1', {json.dumps(json.dumps(ONB))});"
            if fall == "stand":
                js += f"localStorage.setItem('matheskript-lernstand-v1', {json.dumps(json.dumps(LERNSTAND))}); localStorage.setItem('matheplus-funktionen-kapitel', 'verkettung');"
            page.evaluate(js)
            page.goto(BASE); page.wait_for_timeout(1500)

            karte = page.locator("[data-heute-karte]")
            pruefe(karte.count() == 1, f"{breite}/{fall}: Heute-Karte fehlt")
            karte.scroll_into_view_if_needed(); page.wait_for_timeout(300)
            pruefe(karte.get_attribute("data-offen") == "0", f"{breite}/{fall}: Karte startet nicht zugeklappt")
            text = karte.inner_text()
            titel = karte.locator(".hk-titel").inner_text()
            pruefe(("Runden" in titel and "Min" in titel) or "Für heute geschafft" in titel, f"{breite}/{fall}: Kopf ohne Umfang ({titel})")
            pruefe("Einheiten" not in text and "Für dich" not in text, f"{breite}/{fall}: alte Kopfzeilen noch da")
            pruefe(page.locator("[data-heute-vorschau]").count() == 1, f"{breite}/{fall}: Details-Knopf fehlt")
            etappen = page.locator("[data-heute-etappe]")
            soll_n = 4 if fall == "frisch" else 5
            pruefe(etappen.count() == soll_n, f"{breite}/{fall}: erwartet {soll_n} Etappen, gefunden {etappen.count()}")
            pruefe(page.locator("[data-heute-etappe] svg.hk-motiv").count() == soll_n, f"{breite}/{fall}: Etappen ohne Motiv")
            reihe = etappen.evaluate_all("els => els.map(e => e.getAttribute('data-typ'))")
            pruefe(reihe[0] == "warmup" and reihe[-1] == "blatt", f"{breite}/{fall}: Reihenfolge {reihe} (Warm-up zuerst, Blatt zuletzt)")
            pruefe(page.locator("[data-heute-etappe='ableitungstrainer']").count() == 1 and page.locator("[data-heute-etappe='integrale']").count() == 1, f"{breite}/{fall}: Vorschlags-Themen der Klasse 12 fehlen ({reihe})")
            pruefe(page.locator("[data-heute-etappe][data-zustand='jetzt']").count() == 1, f"{breite}/{fall}: keine Etappe als nächste markiert")
            pruefe(page.locator("[data-heute-los]").count() == 1, f"{breite}/{fall}: Goldknopf fehlt")
            # Kopf in einer Zeile: Titel und Klassen-Knopf auf gleicher Höhe, Kopf höchstens zwei Zeilen hoch
            kh = page.evaluate("document.querySelector('.hk-kopf').getBoundingClientRect().height")
            pruefe(kh <= 64, f"{breite}/{fall}: Kopf zu hoch ({kh:.0f} px)")
            if fall == "stand":
                pruefe(page.locator("[data-heute-etappe='fehler']").count() == 1, f"{breite}/stand: Fehler-Etappe fehlt")
                pruefe("5 Runden" in titel, f"{breite}/stand: Kopf sagt nicht „5 Runden“ ({titel})")
            sw = page.evaluate("document.documentElement.scrollWidth")
            pruefe(sw <= breite, f"{breite}/{fall}: Überbreite zugeklappt: {sw}")
            karte.screenshot(path=f"{AUS}/{breite}-{fall}-zu.png")

            if fall == "frisch":
                page.locator("[data-heute-etappe='ableitungstrainer']").click(); page.wait_for_timeout(1500)
                pruefe("ableitungstrainer" in page.url, f"{breite}/frisch: Etappen-Kachel startet den Ableitungstrainer nicht ({page.url})")
                page.go_back(); page.wait_for_timeout(1000)
                karte = page.locator("[data-heute-karte]")
                karte.scroll_into_view_if_needed(); page.wait_for_timeout(200)
            page.locator("[data-heute-vorschau]").click(); page.wait_for_timeout(400)
            pruefe(karte.get_attribute("data-offen") == "1", f"{breite}/{fall}: Aufklappen klappt nicht")
            text = karte.inner_text()
            einheiten = page.locator("[data-heute-einheit]")
            pruefe(einheiten.count() == soll_n, f"{breite}/{fall}: erwartet {soll_n} Einheiten, gefunden {einheiten.count()}")
            if fall == "frisch":
                for t in ("5 Minuten Mathe", "Polynome ableiten", "Aufs Blatt", "Neu für dich", "Zum Aufwärmen"):
                    pruefe(t in text, f"{breite}/frisch: „{t}“ fehlt")
            else:
                for t in ("Produktregel trainieren", "Nochmal – zuletzt wackelig", "Wiederkehrender Fehler", "3× bei dir beobachtet", "Kettenregel"):
                    pruefe(t in text, f"{breite}/stand: „{t}“ fehlt")
            # Aufs Blatt abhaken → Kopf zählt runter, Haken sichtbar; zurücknehmen
            blatt = page.locator("[data-heute-einheit='blatt']")
            blatt.locator("[data-heute-haken]").click(); page.wait_for_timeout(500)
            pruefe(page.locator("[data-heute-etappe='blatt'][data-zustand='fertig']").count() == 1, f"{breite}/{fall}: Blatt nicht als erledigt markiert")
            pruefe(f"Noch {soll_n - 1} Runden" in karte.locator(".hk-titel").inner_text(), f"{breite}/{fall}: Kopf zählt nach dem Haken nicht runter ({karte.locator('.hk-titel').inner_text()})")
            blatt.locator("[data-heute-haken]").click(); page.wait_for_timeout(400)
            pruefe(page.locator("[data-heute-etappe='blatt'][data-zustand='fertig']").count() == 0, f"{breite}/{fall}: Haken lässt sich nicht zurücknehmen")
            sw = page.evaluate("document.documentElement.scrollWidth")
            pruefe(sw <= breite, f"{breite}/{fall}: Überbreite aufgeklappt: {sw}")
            karte.screenshot(path=f"{AUS}/{breite}-{fall}-auf.png")

            # Start: Ableitungstrainer öffnet im gewählten Modus
            einheit = page.locator("[data-heute-einheit='ableitungstrainer']")
            einheit.get_by_role("button").last.click(); page.wait_for_timeout(1500)
            pruefe("ableitungstrainer" in page.url, f"{breite}/{fall}: Ableitungstrainer nicht geöffnet ({page.url})")
            soll = "Polynome" if fall == "frisch" else "Produkte"
            # Funktionsart liegt am Handy hinter der Einstellungs-Pille (21.10.): Pille zeigt die Art, Chips erst nach dem Aufklappen
            pille = page.locator("[data-einstellungen-pille]")
            if pille.count() and page.locator("[data-einstellungen-feld]").count() == 0: pille.first.click(); page.wait_for_timeout(200)
            chip = page.locator(f".abl-chip[aria-pressed='true']")
            pruefe(chip.count() >= 1 and soll in chip.first.inner_text(), f"{breite}/{fall}: Ableitungstrainer nicht in „{soll}“ ({chip.first.inner_text() if chip.count() else '–'})")
            if breite == 390:
                page.screenshot(path=f"{AUS}/{breite}-{fall}-ableitung.png")

            # zurück, Karte bleibt aufgeklappt (Zustand je Gerät)
            page.go_back(); page.wait_for_timeout(1000)
            pruefe(page.locator("[data-heute-karte]").get_attribute("data-offen") == "1", f"{breite}/{fall}: Aufklapp-Zustand nicht gemerkt")
            if fall == "stand":
                page.locator("[data-heute-einheit='integrale']").get_by_role("button").last.click(); page.wait_for_timeout(1500)
                pruefe("integrale" in page.url, f"{breite}: Integraltrainer nicht geöffnet ({page.url})")
                page.go_back(); page.wait_for_timeout(800)
                page.locator("[data-heute-einheit='fehler']").get_by_role("button").last.click(); page.wait_for_timeout(1200)
                pruefe("Sechs neue Aufgaben zum Fehlertyp „Kettenregel" in page.inner_text("body"), f"{breite}: Fehlertraining startet nicht mit Kettenregel")

            pruefe(not konsole, f"{breite}/{fall}: Konsolenfehler: {konsole[:3]}")
            ctx.close()
    b.close()

print("OK" if not fehler else f"{len(fehler)} Fehler")
raise SystemExit(1 if fehler else 0)
