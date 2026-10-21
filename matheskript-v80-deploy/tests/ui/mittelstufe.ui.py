"""Browser-Test der Mittelstufen-Werkzeuge (Kongruenzsätze, Satz des Thales, Satz des Pythagoras,
Brüche rechnen, Bruchterme) und der Startseite (Geometrie mit vier Stationen, Bereich Bruchrechnen,
flachere Bereichs-Boxen am Desktop).
Je Werkzeug und Breite (390, 1280; DE und EN): Seite öffnet, Entdecken-Regler bewegen, jeden Aufgabentyp
im Üben-Modus über „Lösung dieses Schritts zeigen“ bis zum Ende durchlaufen; keine Seitenfehler, keine Überbreite.
  npx vite --port 5173 &   →   BASE_URL=http://localhost:5173/ python3 tests/ui/mittelstufe.ui.py
"""
import os
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
AUS = os.environ.get("SCREENS", "/tmp/mittelstufe")
os.makedirs(AUS, exist_ok=True)
fehler = []

def pruefe(bed, text):
    if not bed:
        fehler.append(text)
        print("FEHLT:", text)

WERKZEUGE = [("kongruenz", "Kongruenzsätze"), ("thales", "Satz des Thales"), ("pythagoras", "Satz des Pythagoras"),
             ("bruchrechnen", "Brüche rechnen"), ("bruchterme", "Bruchterme und Bruchgleichungen"),
             ("winkelsaetze", "Winkel an Geraden und Winkelsummen"), ("konstruktion", "Besondere Linien im Dreieck"),
             ("kathetensatz", "Kathetensatz und Höhensatz"), ("kreis", "Kreis und Kreisteile"), ("koerper", "Körper: Volumen und Oberfläche")]

def schritte_durch(page, wo):
    """Alle Schritte einer Aufgabe über die Lösungsanzeige abschließen."""
    for _ in range(8):
        zeigen = page.locator("button:has-text('Lösung dieses Schritts zeigen'):visible, button:has-text('Show the solution of this step'):visible")
        if zeigen.count() == 0:
            break
        zeigen.first.click(); page.wait_for_timeout(60)
        page.locator("button:has-text('Weiter zum nächsten Schritt'):visible, button:has-text('Continue to the next step'):visible").first.click()
        page.wait_for_timeout(60)
    fertig = page.locator("text=/Richtig|Solved|Correct/").count()
    pruefe(fertig > 0, f"{wo}: Aufgabe nicht bis zum Ende durchlaufen")

with sync_playwright() as p:
    b = p.chromium.launch()
    for sprache in ("de", "en"):
        for breite in (390, 1280):
            ctx = b.new_context(viewport={"width": breite, "height": 900}, device_scale_factor=1, locale="de-DE")
            page = ctx.new_page()
            konsole = []
            page.on("pageerror", lambda e: konsole.append(f"pageerror: {e}"))
            page.on("console", lambda m: konsole.append(m.text) if m.type == "error" and "net::" not in m.text and "Failed to load resource" not in m.text else None)
            page.goto(BASE)
            page.evaluate("localStorage.clear(); localStorage.setItem('mm-onboarding-v1', JSON.stringify({uebersprungen:true}));" + ("localStorage.setItem('mm-sprache','en');" if sprache == "en" else ""))
            for pfad, titel in WERKZEUGE:
                wo = f"{sprache}/{breite}/{pfad}"
                page.goto(BASE + pfad); page.wait_for_timeout(900)
                if sprache == "de":
                    pruefe(page.get_by_role("heading", name=titel).count() > 0, f"{wo}: Überschrift „{titel}“ fehlt")
                # Entdecken: alle Regler einmal hoch und runter
                for r in page.locator("input[type=range]:visible").all()[:6]:
                    r.focus(); page.keyboard.press("End"); page.wait_for_timeout(30); page.keyboard.press("Home"); page.wait_for_timeout(30)
                # Kongruenz: alle Fälle anklicken
                if pfad == "kongruenz":
                    for f in ["SSS", "SWS", "WSW", "SsW / SSW", "WWW", "SsA / SSA"]:
                        k = page.get_by_role("button", name=f, exact=True)
                        if k.count():
                            k.first.click(); page.wait_for_timeout(80)
                            for r in page.locator("input[type=range]:visible").all()[:3]:
                                r.focus(); page.keyboard.press("End"); page.keyboard.press("Home")
                if pfad == "bruchrechnen":
                    page.get_by_role("tab").first.click(); page.wait_for_timeout(100)
                    for t in ["Gleichnamig machen", "Common denominator"]:
                        if page.get_by_role("button", name=t).count():
                            page.get_by_role("button", name=t).first.click(); page.wait_for_timeout(80)
                    for r in page.locator("input[type=range]:visible").all()[:4]:
                        r.focus(); page.keyboard.press("End"); page.keyboard.press("Home")
                if pfad in ("winkelsaetze", "konstruktion", "kathetensatz", "koerper"):
                    for i in range(8):
                        wahl = page.locator("[role=group] button[aria-pressed]:visible")
                        if i >= wahl.count():
                            break
                        wahl.nth(i).click(); page.wait_for_timeout(80)
                        for r in page.locator("input[type=range]:visible").all()[:3]:
                            r.focus(); page.keyboard.press("End"); page.keyboard.press("Home")
                        sw = page.evaluate("document.documentElement.scrollWidth")
                        pruefe(sw <= breite, f"{wo}: Überbreite Entdecken-Auswahl {i}: {sw}")
                if pfad == "thales":
                    k = page.get_by_role("button", name="Beweisidee zeigen")
                    if k.count(): k.first.click(); page.wait_for_timeout(80)
                sw = page.evaluate("document.documentElement.scrollWidth")
                pruefe(sw <= breite, f"{wo}: Überbreite Entdecken {sw}")
                if breite == 390 and sprache == "de":
                    page.screenshot(path=f"{AUS}/{pfad}-entdecken.png", full_page=True)
                # Üben
                page.get_by_role("tab", name="Trainieren" if sprache == "de" else "Train").first.click(); page.wait_for_timeout(200)
                typen = page.locator("[data-aufgabentyp]:visible button")
                n = typen.count()
                kn = [typen.nth(i).inner_text() for i in range(n)]
                for i, name in enumerate(kn):
                    typen.nth(i).click(); page.wait_for_timeout(120)
                    for _ in range(3 if i else 8):
                        schritte_durch(page, f"{wo}/{name}")
                        sw = page.evaluate("document.documentElement.scrollWidth")
                        pruefe(sw <= breite, f"{wo}/{name}: Überbreite {sw}")
                        page.locator("button:has-text('Neue Aufgabe'):visible, button:has-text('New exercise'):visible").first.click(); page.wait_for_timeout(80)
                if breite == 390 and sprache == "de":
                    page.screenshot(path=f"{AUS}/{pfad}-ueben.png", full_page=True)
                print(wo, "ok,", len(kn), "Aufgabentypen")
            # Startseite: Mittelstufe → Geometrie und Werkzeugkasten (Bruchterme); Brüche und Dezimalzahlen gehören in die Unterstufe
            if sprache == "de":
                page.goto(BASE); page.wait_for_timeout(900)
                page.get_by_role("button", name="Mittelstufe aufklappen").first.click(); page.wait_for_timeout(300)
                hoehen = [k.bounding_box()["height"] for k in page.locator("button[data-aufklapp-haupt]").all() if k.is_visible()]
                print(breite, "Box-Höhen", hoehen)
                pruefe(page.get_by_role("button", name="Brüche und Dezimalzahlen aufklappen").count() == 0, f"{breite}: Brüche und Dezimalzahlen stehen in der Mittelstufe")
                page.get_by_role("button", name="Geometrie aufklappen").first.click(); page.wait_for_timeout(400)
                for t in ["Winkel und Winkelsummen", "Kongruenzsätze", "Besondere Linien im Dreieck", "Satz des Thales", "Satz des Pythagoras", "Kathetensatz und Höhensatz", "Strahlensätze", "Trigonometrie", "Kreis und Kreisteile", "Körper: Volumen und Oberfläche"]:
                    pruefe(page.locator(f"button:has-text('{t}')").count() > 0, f"{breite}: {t} fehlt unter Geometrie")
                page.screenshot(path=f"{AUS}/start-geometrie-{breite}.png", full_page=False)
                page.get_by_role("button", name="Geometrie zuklappen").first.click(); page.wait_for_timeout(300)
                page.get_by_role("button", name="Formelsammlung und Werkzeuge aufklappen").first.click(); page.wait_for_timeout(400)
                pruefe(page.locator("button:has-text('Bruchterme und -gleichungen')").count() > 0, f"{breite}: Bruchterme fehlen im Werkzeugkasten")
                page.locator("button:has-text('Bruchterme und -gleichungen')").last.click(); page.wait_for_timeout(800)
                pruefe("/bruchterme" in page.url, f"{breite}: Sprung ins Werkzeug Bruchterme ({page.url})")
            pruefe(not konsole, f"{sprache}/{breite}: Konsolenfehler {konsole[:3]}")
            ctx.close()
    b.close()

print("FEHLER:", len(fehler))
for f in fehler: print(" -", f)
raise SystemExit(1 if fehler else 0)
