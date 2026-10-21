"""Browser-Test des Bereichs „Gleichungen“ (/gleichungen-lernen): Verstehen (Film, Rechenkette), Rechnen (alle 7 Stufen
Schritt für Schritt bis zur Probe, auch mit Fehlgriffen), Training (Runde mit falscher und richtigen Antworten, Auswertung).
Breiten 360/390/1280, DE und EN; keine Seitenfehler, keine Überbreite.
  npm run build && npx vite preview --port 4173 &   →   python3 -u tests/ui/gleichkurs.ui.py
"""
import os
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
AUS = os.environ.get("SCREENS", "/tmp/gleichkurs")
os.makedirs(AUS, exist_ok=True)
fehler = []
def pruefe(bed, text):
    if not bed:
        fehler.append(text); print("FEHLT:", text)

def breite_ok(page, breite, wo):
    sw = page.evaluate("document.documentElement.scrollWidth"); pruefe(sw <= breite, f"{wo}: Überbreite {sw}")

def loese_schritte(page, wo):
    for _ in range(30):
        if page.locator("[data-gk-fertig]").count(): break
        auto = page.locator("[data-gk-auto] button:visible")
        if auto.count(): auto.first.click(); page.wait_for_timeout(80); continue
        opt = page.locator("button[data-gk-option]:enabled:visible")
        if not opt.count(): break
        opt.first.click(); page.wait_for_timeout(80)
    pruefe(page.locator("[data-gk-fertig]").count() == 1, f"{wo}: nicht bis zur Probe")

def antwort(page, werte):
    for i, w in enumerate(werte):
        for z in str(w).replace("-", "−"):
            page.keyboard.press("-" if z == "−" else z)
        page.keyboard.press("Enter")
        page.wait_for_timeout(60)

with sync_playwright() as p:
    b = p.chromium.launch()
    for sprache in ("de", "en"):
        for breite in (360, 390, 1280):
            wo0 = f"{sprache}/{breite}"
            ctx = b.new_context(viewport={"width": breite, "height": 900}, locale="de-DE", reduced_motion="no-preference")
            page = ctx.new_page(); konsole = []
            page.on("pageerror", lambda e: konsole.append(f"pageerror: {e}"))
            page.on("console", lambda m: konsole.append(m.text) if m.type == "error" and "net::" not in m.text and "Failed to load resource" not in m.text else None)
            page.goto(BASE)
            page.evaluate("localStorage.clear(); localStorage.setItem('mm-start-app','1'); localStorage.setItem('mm-onboarding-v1', JSON.stringify({uebersprungen:true}));" + ("localStorage.setItem('mm-sprache','en');" if sprache == "en" else ""))

            # Startseite: Kachel vorhanden
            page.goto(BASE); page.wait_for_timeout(900)
            pruefe(page.locator("[aria-label='Gleichungen öffnen']").count() >= 1 or page.locator("[aria-label='Open equations']").count() >= 1, f"{wo0}: Kachel fehlt")

            # Verstehen
            page.goto(BASE + "gleichungen-lernen"); page.wait_for_timeout(1200)
            pruefe(page.get_by_role("tab").count() == 3, f"{wo0}: drei Reiter fehlen")
            film = page.locator("[role=region]")
            pruefe(film.count() == 1, f"{wo0}: Film fehlt")
            page.wait_for_timeout(3500)
            if breite == 390 and sprache == "de": film.screenshot(path=f"{AUS}/film-szene1.png")
            dots = film.locator("button[aria-label^='Szene'], button[aria-label^='Scene']")
            pruefe(dots.count() == 7, f"{wo0}: {dots.count()} Szenen")
            for i in range(dots.count()):
                dots.nth(i).click(); page.wait_for_timeout(2600 if i in (1, 6) else 400)
                if breite == 390 and sprache == "de": film.screenshot(path=f"{AUS}/film-szene{i+1}.png")
                breite_ok(page, breite, f"{wo0}/film{i}")
            film.locator("button").first.click()   # Pause
            for _ in range(4):
                k = page.locator("button:has-text('Rückwärts:'), button:has-text('Backwards:')")
                if not k.count(): break
                k.first.click(); page.wait_for_timeout(250)
            pruefe(page.locator("text=/Gefunden: x|Found: x/").count() >= 1, f"{wo0}: Rechenkette nicht bis x")
            breite_ok(page, breite, f"{wo0}/verstehen")
            if breite == 390 and sprache == "de": page.screenshot(path=f"{AUS}/verstehen.png", full_page=True)

            # Rechnen: alle Stufen
            page.get_by_role("tab").nth(1).click(); page.wait_for_timeout(400)
            chips = page.locator("button[aria-pressed][aria-label^='Stufe'], button[aria-pressed][aria-label^='Level']")
            pruefe(chips.count() == 7, f"{wo0}: {chips.count()} Stufen-Chips")
            for i in range(chips.count()):
                chips.nth(i).click(); page.wait_for_timeout(250)
                ketten = page.locator("button:has-text('Als Rechenkette ansehen'), button:has-text('Show as a chain')")
                if ketten.count(): ketten.first.click(); page.wait_for_timeout(100)
                loese_schritte(page, f"{wo0}/rechnen/s{i+1}")
                breite_ok(page, breite, f"{wo0}/rechnen/s{i+1}")
                if breite == 390 and sprache == "de": page.screenshot(path=f"{AUS}/rechnen-s{i+1}.png", full_page=True)

            # Training: Runde Stufe 1, erste Antwort absichtlich falsch
            page.get_by_role("tab").nth(2).click(); page.wait_for_timeout(400)
            if breite == 390 and sprache == "de": page.screenshot(path=f"{AUS}/training.png", full_page=True)
            page.locator("button[aria-label^='Stufe 1:'], button[aria-label^='Level 1:']").first.click(); page.wait_for_timeout(400)
            for n in range(12):
                if page.locator("text=/Noch eine Runde|Another round/").count(): break
                a = page.evaluate("window.__gkAufgabe && { l: window.__gkAufgabe.loesungen, id: window.__gkAufgabe.id }")
                if not a: break
                if n == 0:
                    antwort(page, [a["l"][0] + 1]); page.wait_for_timeout(200)
                    pruefe(page.locator("text=/Weiter|Next/").count() >= 1, f"{wo0}: falsche Antwort ohne Rückmeldung")
                    if breite == 390 and sprache == "de": page.screenshot(path=f"{AUS}/runde-falsch.png", full_page=True)
                    page.keyboard.press("Enter"); page.wait_for_timeout(200)
                else:
                    antwort(page, a["l"]); page.wait_for_timeout(1500)
            pruefe(page.locator("text=/Noch eine Runde|Another round/").count() >= 1, f"{wo0}: Runde nicht abgeschlossen")
            breite_ok(page, breite, f"{wo0}/auswertung")
            if breite == 390 and sprache == "de": page.screenshot(path=f"{AUS}/auswertung.png", full_page=True)

            # gemischte Runde mit Stufe 6 (zwei Lösungen) direkt anstoßen
            page.locator("button:has-text('Zur Übersicht'), button:has-text('To the overview')").first.click(); page.wait_for_timeout(300)
            page.locator("button[aria-label^='Stufe 6:'], button[aria-label^='Level 6:']").first.click(); page.wait_for_timeout(400)
            a = page.evaluate("window.__gkAufgabe.loesungen")
            antwort(page, a); page.wait_for_timeout(300)
            pruefe(page.locator("text=/✓/").count() >= 1, f"{wo0}: zwei Lösungen nicht erkannt")

            for k in konsole: pruefe(False, f"{wo0}: Konsole {k}")
            ctx.close()
    b.close()
print("FEHLER:", len(fehler))
for f in fehler: print(" -", f)
