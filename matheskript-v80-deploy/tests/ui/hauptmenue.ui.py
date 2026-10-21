"""Browser-Test ☰-Menü oben (Chip + ☰, Mathilda-Karte, Abschnitte, Mathe-Training mit allen Werkzeugen, Kurs-Leiste, Konto, Anmelden/Abmelden unten) + Arbeitsmenü in der Fußzeile.
  npx vite build && npx vite preview --port 4173 &   →   python3 tests/ui/hauptmenue.ui.py
"""
import os, re, json
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
BILDER = os.environ.get("BILDER")
fehler = []

# Angebots-Schalter (src/angebot.js): „Pro werden“, Kurse, Landingpage sind im Moment ggf. abgeschaltet
_a = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "src", "angebot.js"), encoding="utf-8").read().split("export const ANGEBOT")[1].split("};")[0]
ANG = {k: v == "true" for k, v in re.findall(r"^\s+(\w+): (true|false),", _a, re.M)}
def pruefe(bed, text):
    if not bed:
        fehler.append(text); print("FEHLT:", text)

# ☰ öffnen. Besucher unter 1000 px sehen zuerst das Besuchermenü (Vision · Mathe lernen · Mathilda AI · Blog,
# seit 21.10.) – von dort führt „Alle Bereiche und Werkzeuge“ in dieses Fenster.
def menue_auf(page):
    page.locator("[data-hm-menue]").click(); page.wait_for_timeout(250)
    if page.locator("[data-besuchermenue]").count():
        page.locator("[data-kl-bm-alles]").click(); page.wait_for_timeout(250)

DEMO = {"nutzer": {"id": "demo-1", "email": "lena@example.de"}, "profil": {"id": "demo-1", "name": "Lena", "rolle": "schueler", "geschlecht": "w", "schulform": "G9", "klasse": 10}}

with sync_playwright() as p:
    b = p.chromium.launch()
    # ab 900 px öffnet ☰ das Desktop-Menü (eigener Test: hauptmenue-desktop.ui.py) – hier das ☰-Fenster bis 899 px
    for breite in (360, 390, 860):
        for angemeldet in (False, True):
            ctx = b.new_context(viewport={"width": breite, "height": 820}, locale="de-DE")
            page = ctx.new_page()
            konsole = []
            page.on("pageerror", lambda e: konsole.append(f"pageerror: {e}"))
            page.goto(BASE)
            page.evaluate("localStorage.clear(); localStorage.setItem('mm-onboarding-v1', JSON.stringify({uebersprungen:true}));")
            if angemeldet:
                page.evaluate(f"localStorage.setItem('mm-demo-konto', {json.dumps(json.dumps(DEMO))})")
            page.goto(BASE); page.wait_for_timeout(1500)
            tag = f"{breite}/{'konto' if angemeldet else 'gast'}"
            breit = page.evaluate("document.documentElement.scrollWidth > window.innerWidth + 1")
            pruefe(not breit, f"{tag}: Überbreite")
            pruefe(page.locator("[data-hm-menue]").count() == 1, f"{tag}: Menü-Knopf fehlt")
            pruefe(page.locator("[data-hauptmenue] [data-hm]").count() == 0, f"{tag}: Menü ist ohne Klick schon offen")
            pruefe(page.locator("[data-hm='mathilda']").count() == 0, f"{tag}: Leiste unter dem Kopf existiert noch")
            # Konto-Chip nur angemeldet und erst ab 840 px (Handy: Konto über ☰, seit 21.10.), ☰ steht rechts daneben
            pruefe(page.locator("[data-hm-chip]").count() == (1 if angemeldet else 0), f"{tag}: Konto-Chip falsch")
            if angemeldet and breite < 840:
                pruefe(not page.locator("[data-hm-chip]").is_visible(), f"{tag}: Konto-Chip auf dem Handy sichtbar")
                pruefe(page.locator("[data-hm-menue]").bounding_box()["width"] >= 47, f"{tag}: ☰ auf dem Handy nicht vergrößert")
            if angemeldet and breite >= 840:
                chip = page.locator("[data-hm-chip]").bounding_box(); knopf = page.locator("[data-hm-menue]").bounding_box()
                pruefe(page.locator("[data-hm-chip]").inner_text().strip() == "L", f"{tag}: Chip zeigt nicht den Anfangsbuchstaben")
                pruefe(knopf["x"] > chip["x"] + chip["width"] - 1 and abs(knopf["y"] - chip["y"]) < 3, f"{tag}: ☰ steht nicht rechts neben dem Chip")
            # ☰-Menü öffnen: eine Liste mit Suche, fünf Abschnitten, Konto-Punkten und Zugang ganz unten
            menue_auf(page)
            fm = page.locator(".hm-fenster.hm-menue")
            pruefe(fm.count() == 1, f"{tag}: Menü geht nicht auf")
            if fm.count():
                bx = fm.bounding_box()
                pruefe(bx["x"] >= 0 and bx["x"] + bx["width"] <= breite + 1, f"{tag}: Menü ragt hinaus ({bx})")
                pruefe(fm.locator("[data-hm]").count() == 6, f"{tag}: Menü hat {fm.locator('[data-hm]').count()} Abschnitte")
                if angemeldet:
                    pruefe("Klasse 10 (G9)" in fm.locator("[data-hm='klasse']").inner_text(), f"{tag}: Klassen-Zeile zeigt nicht Klasse 10 (G9)")
                pruefe(("Abmelden" in fm.inner_text()) == angemeldet, f"{tag}: Abmelden im Menü falsch")
                pruefe(("Anmelden" in fm.inner_text()) != angemeldet, f"{tag}: Anmelden im Menü falsch")
                letzter = fm.locator(".hm-eintrag").last.inner_text()
                pruefe((("Abmelden" if angemeldet else "Anmelden") in letzter), f"{tag}: Zugang steht nicht ganz unten ({letzter!r})")
                pruefe(("Pro werden" in fm.inner_text()) == ANG.get("pro", False), f"{tag}: „Pro werden“ passt nicht zum Schalter ANGEBOT.pro")
                # Mathilda-Karte (immer offen), Kurs-Leiste, kein Fenster ragt aus dem Bild
                pruefe(fm.locator("[data-hm-mathilda]").count() == 1 and "Blatt scannen" in fm.locator("[data-hm-mathilda]").inner_text(), f"{tag}: Mathilda-Karte fehlt")
                pruefe(fm.locator("[data-hm-mathilda] .hm-ki").count() == 4, f"{tag}: Mathilda hat nicht vier Kacheln")
                pruefe(fm.locator("[data-hm-kurse] .hm-kurs").count() >= 9, f"{tag}: Kurs-Leiste unvollständig")
            if BILDER: page.screenshot(path=f"{BILDER}/hm-{breite}-{'k' if angemeldet else 'g'}-menue.png")
            for punkt in ("klasse", "schultraining", "training", "entdecken", "mathematik", "suche"):
                k = page.locator(f"[data-hm='{punkt}']")
                k.scroll_into_view_if_needed(); k.click(); page.wait_for_timeout(250)
                pruefe(page.locator(".hm-ak-inhalt").count() == 1, f"{tag}: Abschnitt {punkt} klappt nicht auf")
                pruefe(page.locator(".hm-fenster").count() == 1, f"{tag}: Menü {punkt} ist zu")
                bx = page.locator(".hm-fenster").bounding_box()
                pruefe(bx["x"] >= 0 and bx["x"] + bx["width"] <= breite + 1, f"{tag}: Fenster {punkt} ragt hinaus")
                if BILDER: page.screenshot(path=f"{BILDER}/hm-{breite}-{'k' if angemeldet else 'g'}-{punkt}.png")
            page.keyboard.press("Escape"); page.wait_for_timeout(150)
            pruefe(page.locator(".hm-fenster").count() == 0, f"{tag}: Esc schließt das Menü nicht")
            if not angemeldet:
                import re
                # Klasse wählen ohne Konto
                menue_auf(page)
                page.locator("[data-hm='klasse']").click(); page.wait_for_timeout(200)
                page.locator(".hm-fenster button").filter(has_text=re.compile(r"^G8$")).click()
                page.locator(".hm-fenster button").filter(has_text=re.compile(r"^9$")).click(); page.wait_for_timeout(250)
                pruefe("Klasse 9 (G8)" in page.locator("[data-hm='klasse']").inner_text(), f"{tag}: Klassenwahl greift nicht")
                if BILDER: page.screenshot(path=f"{BILDER}/hm-{breite}-g-klasse9.png")
                # Menüpunkt navigiert
                # Mathe-Training: Stufe wählen, Bereich aufklappen, Werkzeug öffnen
                page.locator("[data-hm='schultraining']").click(); page.wait_for_timeout(200)
                page.locator(".hm-stufen button", has_text="Ober").click(); page.wait_for_timeout(150)
                pruefe(page.locator("[data-hm-bereich='abitur']").count() == 1, f"{tag}: Abi-Vorbereitung fehlt in der Oberstufe")
                page.locator(".hm-stufen button", has_text="Mittel").click(); page.wait_for_timeout(150)
                pruefe(page.locator("[data-hm-bereich='abitur']").count() == 0 and page.locator("[data-hm-bereich='vektoren']").count() == 0, f"{tag}: Mittelstufe zeigt Abi/Vektoren")
                page.locator(".hm-stufen button", has_text="Alle").click(); page.wait_for_timeout(150)
                page.locator("[data-hm-bereich='vektoren'] > button").click(); page.wait_for_timeout(200)
                pruefe(page.locator("[data-hm-bereich='vektoren'] .hm-wz").count() >= 9, f"{tag}: Vektoren zeigt zu wenige Werkzeuge")
                page.locator("[data-hm-bereich='vektoren'] .hm-wz", has_text="Kreuzprodukt").click(); page.wait_for_timeout(900)
                pruefe(page.locator(".hm-fenster").count() == 0 and "kreuz" in page.url, f"{tag}: Werkzeug aus dem Menü öffnet nicht ({page.url})")
                # Mein Training → 5 Minuten Mathe
                menue_auf(page)
                page.locator("[data-hm='training']").click(); page.locator(".hm-fenster button", has_text="5 Minuten Mathe").click(); page.wait_for_timeout(900)
                pruefe("5-minuten-mathe" in page.url, f"{tag}: Menüpunkt navigiert nicht ({page.url})")
                pruefe(page.locator(".hm-fenster").count() == 0, f"{tag}: Menü bleibt nach dem Navigieren offen")
            else:
                menue_auf(page)
                page.locator(".hm-fenster .hm-eintrag", has_text="Abmelden").click(); page.wait_for_timeout(200)
                pruefe(page.locator("[role='alertdialog']").count() == 1, f"{tag}: Abmelden fragt nicht nach")
                if BILDER: page.screenshot(path=f"{BILDER}/hm-{breite}-k-abmelden.png")
                page.get_by_role("button", name="Abbrechen").click(); page.wait_for_timeout(200)
                menue_auf(page)
                pruefe(page.locator(".hm-fenster .hm-eintrag", has_text="Abmelden").count() == 1, f"{tag}: Abbrechen meldet trotzdem ab")
                page.locator(".hm-fenster .hm-eintrag", has_text="Abmelden").click(); page.locator("[data-hm-abmelden-ja]").click(); page.wait_for_timeout(600)
                menue_auf(page)
                pruefe(page.locator(".hm-fenster .hm-eintrag", has_text="Anmelden").count() == 1, f"{tag}: Abmelden klappt nicht")
                page.keyboard.press("Escape")
            # Arbeitsmenü in der Fußzeile
            am = page.locator("[data-arbeitsmenue]")
            pruefe(am.count() == 1, f"{tag}: Arbeitsmenü fehlt in der Fußzeile")
            if am.count():
                am.scroll_into_view_if_needed(); am.click(); page.wait_for_timeout(250)
                dlg = page.locator("[role='dialog'][aria-label='Arbeitsmenü']")
                pruefe(dlg.count() == 1 and "Startseite" in dlg.inner_text() and "Alle Bereiche" in dlg.inner_text(), f"{tag}: Arbeitsmenü geht nicht auf")
                if BILDER: page.screenshot(path=f"{BILDER}/hm-{breite}-{'k' if angemeldet else 'g'}-arbeitsmenue.png")
                if ANG.get("landingpage", False):
                    dlg.get_by_text("Landingpage").click(); page.wait_for_timeout(900)
                    pruefe("landingpage" in page.url, f"{tag}: Arbeitsmenü → Landingpage geht nicht")
                else:
                    # seit 344696a gewollt: abgeschaltete Landingpage bleibt im Arbeitsmenü – mit Schloss, Klick zeigt das Passwortfeld
                    lp = dlg.locator("[data-arbeitsmenue-seite='landingpage']")
                    pruefe(lp.count() == 1 and "Landingpage" in lp.inner_text(), f"{tag}: Landingpage fehlt im Arbeitsmenü")
                    if lp.count():
                        pruefe(lp.locator("svg[aria-label='Passwortgeschützt']").count() == 1, f"{tag}: Landingpage ohne Schloss, obwohl abgeschaltet")
                        lp.click(); page.wait_for_timeout(300)
                        pruefe(page.locator("[data-arbeitsmenue-passwort]").count() == 1 and "landingpage" not in page.url, f"{tag}: Landingpage öffnet ohne Passwort")
            pruefe(not konsole, f"{tag}: Konsolenfehler {konsole}")
            ctx.close()
    b.close()
print("FEHLER:", len(fehler)) if fehler else print("Alles grün.")
