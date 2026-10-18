"""Browser-Test Hauptmenü oben + Arbeitsmenü in der Fußzeile.
  npx vite build && npx vite preview --port 4173 &   →   python3 tests/ui/hauptmenue.ui.py
"""
import os, json
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
BILDER = os.environ.get("BILDER")
fehler = []
def pruefe(bed, text):
    if not bed:
        fehler.append(text); print("FEHLT:", text)

DEMO = {"nutzer": {"id": "demo-1", "email": "lena@example.de"}, "profil": {"id": "demo-1", "name": "Lena", "rolle": "schueler", "geschlecht": "w", "schulform": "G9", "klasse": 10}}

with sync_playwright() as p:
    b = p.chromium.launch()
    for breite in (360, 390, 1280):
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
            leiste = page.locator("[data-hauptmenue] [data-hm]")
            pruefe(leiste.count() == 6, f"{tag}: Leiste hat {leiste.count()} Punkte")
            breit = page.evaluate("document.documentElement.scrollWidth > window.innerWidth + 1")
            pruefe(not breit, f"{tag}: Überbreite")
            pruefe(page.locator("[data-hm-menue]").count() == 1, f"{tag}: Menü-Knopf fehlt")
            if angemeldet:
                pruefe("Klasse 10 (G9)" in page.locator("[data-hm='klasse']").inner_text(), f"{tag}: Klassen-Knopf zeigt nicht Klasse 10 (G9)")
            # ☰-Menü: rechts, höchstens ⅔ breit, 5–6 einzeilige Punkte
            page.locator("[data-hm-menue]").click(); page.wait_for_timeout(250)
            fm = page.locator(".hm-fenster.hm-menue")
            pruefe(fm.count() == 1, f"{tag}: Menü geht nicht auf")
            if fm.count():
                bx = fm.bounding_box()
                pruefe(bx["width"] <= breite * 0.67 + 1 and bx["x"] + bx["width"] <= breite + 1, f"{tag}: Menü zu breit/ragt hinaus ({bx})")
                n = fm.locator(".hm-eintrag").count()
                pruefe(5 <= n <= 6, f"{tag}: Menü hat {n} Punkte")
                pruefe(("Abmelden" in fm.inner_text()) == angemeldet, f"{tag}: Abmelden im Menü falsch")
                pruefe(("Anmelden" in fm.inner_text()) != angemeldet, f"{tag}: Anmelden im Menü falsch")
            if BILDER: page.screenshot(path=f"{BILDER}/hm-{breite}-{'k' if angemeldet else 'g'}-menue.png")
            page.keyboard.press("Escape"); page.wait_for_timeout(150)
            for punkt in ("mathilda", "kurse", "klasse", "training", "mathematik", "suche"):
                k = page.locator(f"[data-hm='{punkt}']")
                k.scroll_into_view_if_needed(); k.click(); page.wait_for_timeout(250)
                fenster = page.locator(".hm-fenster")
                pruefe(fenster.count() == 1, f"{tag}: Fenster {punkt} geht nicht auf")
                if fenster.count():
                    bx = fenster.bounding_box()
                    pruefe(bx["x"] >= 0 and bx["x"] + bx["width"] <= breite + 1, f"{tag}: Fenster {punkt} ragt hinaus")
                if BILDER: page.screenshot(path=f"{BILDER}/hm-{breite}-{'k' if angemeldet else 'g'}-{punkt}.png")
                page.keyboard.press("Escape"); page.wait_for_timeout(150)
                pruefe(page.locator(".hm-fenster").count() == 0, f"{tag}: Esc schließt {punkt} nicht")
            if not angemeldet:
                # Klasse wählen ohne Konto
                page.locator("[data-hm='klasse']").click(); page.wait_for_timeout(200)
                page.locator(".hm-fenster button").filter(has_text=__import__("re").compile(r"^G8$")).click()
                page.locator(".hm-fenster button").filter(has_text=__import__("re").compile(r"^9$")).click(); page.wait_for_timeout(250)
                pruefe("Klasse 9 (G8)" in page.locator("[data-hm='klasse']").inner_text(), f"{tag}: Klassenwahl greift nicht")
                if BILDER: page.screenshot(path=f"{BILDER}/hm-{breite}-g-klasse9.png")
                page.locator(".hm-fenster .hm-eintrag").first.click(); page.wait_for_timeout(200)
                page.keyboard.press("Escape")
                # Mathilda öffnen über das Menü
                page.locator("[data-hm='training']").click(); page.locator(".hm-fenster button", has_text="5 Minuten Mathe").click(); page.wait_for_timeout(900)
                pruefe("5-minuten-mathe" in page.url, f"{tag}: Menüpunkt navigiert nicht ({page.url})")
            else:
                page.locator("[data-hm-menue]").click(); page.wait_for_timeout(200)
                pruefe(page.locator(".hm-fenster", has_text="Pro werden").count() == 1, f"{tag}: Pro werden fehlt im Menü")
                page.locator(".hm-fenster .hm-eintrag", has_text="Abmelden").click(); page.wait_for_timeout(200)
                pruefe(page.locator("[role='alertdialog']").count() == 1, f"{tag}: Abmelden fragt nicht nach")
                if BILDER: page.screenshot(path=f"{BILDER}/hm-{breite}-k-abmelden.png")
                page.get_by_role("button", name="Abbrechen").click(); page.wait_for_timeout(200)
                page.locator("[data-hm-menue]").click(); page.wait_for_timeout(200)
                pruefe(page.locator(".hm-fenster .hm-eintrag", has_text="Abmelden").count() == 1, f"{tag}: Abbrechen meldet trotzdem ab")
                page.locator(".hm-fenster .hm-eintrag", has_text="Abmelden").click(); page.locator("[data-hm-abmelden-ja]").click(); page.wait_for_timeout(600)
                page.locator("[data-hm-menue]").click(); page.wait_for_timeout(200)
                pruefe(page.locator(".hm-fenster .hm-eintrag", has_text="Anmelden").count() == 1, f"{tag}: Abmelden klappt nicht")
                page.keyboard.press("Escape")
            # Arbeitsmenü in der Fußzeile
            am = page.locator("[data-arbeitsmenue]")
            pruefe(am.count() == 1, f"{tag}: Arbeitsmenü fehlt in der Fußzeile")
            if am.count():
                am.scroll_into_view_if_needed(); am.click(); page.wait_for_timeout(250)
                dlg = page.locator("[role='dialog'][aria-label='Arbeitsmenü']")
                pruefe(dlg.count() == 1 and "Landingpage" in dlg.inner_text(), f"{tag}: Arbeitsmenü geht nicht auf")
                if BILDER: page.screenshot(path=f"{BILDER}/hm-{breite}-{'k' if angemeldet else 'g'}-arbeitsmenue.png")
                dlg.get_by_text("Landingpage").click(); page.wait_for_timeout(900)
                pruefe("landingpage" in page.url, f"{tag}: Arbeitsmenü → Landingpage geht nicht")
            pruefe(not konsole, f"{tag}: Konsolenfehler {konsole}")
            ctx.close()
    b.close()
print("FEHLER:", len(fehler)) if fehler else print("Alles grün.")
