"""Browser-Test der Unterstufen-Werkzeuge (Prozent, Zuordnungen, Flächen, Größen, Dezimalzahlen, Quader,
Ganze Zahlen, Diagramme, Primzahlen, Rechengesetze, Koordinaten, Zufall, Stellenwert) und der Startseite
(Unterstufe: Bereiche Zahlen und Größen, Zuordnungen und Prozent, Daten und Zufall).
Je Werkzeug und Breite (390, 1280; DE und EN): Entdecken bedienen (alle Auswahl-Knöpfe, Regler, Aktionsknöpfe),
jeden Aufgabentyp im Üben-Modus über „Lösung dieses Schritts zeigen“ bis zum Ende; keine Seitenfehler, keine Überbreite.
  npm run build && npx vite preview --port 4173 &   →   python3 -u tests/ui/unterstufe.ui.py
"""
import os
from playwright.sync_api import sync_playwright

def _typen_auf(pg):
    """Aufgabentyp-Chips liegen seit 21.10. hinter der Einstellungs-Pille: bei Bedarf aufklappen."""
    if pg.locator("[data-einstellungen-feld]:visible").count() == 0:
        pil = pg.locator("[data-einstellungen-pille]:visible")
        if pil.count():
            pil.first.click(); pg.wait_for_timeout(150)

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
AUS = os.environ.get("SCREENS", "/tmp/unterstufe")
os.makedirs(AUS, exist_ok=True)
fehler = []
def pruefe(bed, text):
    if not bed:
        fehler.append(text); print("FEHLT:", text)

WERKZEUGE = ["prozent", "zuordnungen", "flaechen", "groessen", "dezimal", "quader", "ganzezahlen", "diagramme", "primzahlen", "rechengesetze", "koordinaten", "zufall", "stellenwert"]

def schritte_durch(page, wo):
    for _ in range(8):
        zeigen = page.locator("button:has-text('Lösung dieses Schritts zeigen'):visible, button:has-text('Show the solution of this step'):visible")
        if zeigen.count() == 0: break
        zeigen.first.click(); page.wait_for_timeout(50)
        page.locator("button:has-text('Weiter zum nächsten Schritt'):visible, button:has-text('Continue to the next step'):visible").first.click(); page.wait_for_timeout(50)
    pruefe(page.locator("text=/Richtig|Solved|Correct/").count() > 0, f"{wo}: Aufgabe nicht bis zum Ende")

with sync_playwright() as p:
    b = p.chromium.launch()
    for sprache in ("de", "en"):
        for breite in (390, 1280):
            ctx = b.new_context(viewport={"width": breite, "height": 900}, locale="de-DE")
            page = ctx.new_page(); konsole = []
            page.on("pageerror", lambda e: konsole.append(f"pageerror: {e}"))
            page.on("console", lambda m: konsole.append(m.text) if m.type == "error" and "net::" not in m.text and "Failed to load resource" not in m.text else None)
            page.goto(BASE)
            page.evaluate("localStorage.clear(); localStorage.setItem('mm-onboarding-v1', JSON.stringify({uebersprungen:true}));" + ("localStorage.setItem('mm-sprache','en');" if sprache == "en" else ""))
            for pfad in WERKZEUGE:
                wo = f"{sprache}/{breite}/{pfad}"
                page.goto(BASE + pfad); page.wait_for_timeout(900)
                pruefe(page.get_by_role("tab").count() >= 2, f"{wo}: Seite ohne Modusleiste")
                for i in range(14):
                    wahl = page.locator("[role=group] button[aria-pressed]:visible")
                    if i >= wahl.count(): break
                    wahl.nth(i).click(); page.wait_for_timeout(60)
                    for r in page.locator("input[type=range]:visible").all()[:5]:
                        r.focus(); page.keyboard.press("End"); page.keyboard.press("Home")
                for t in ["+1000", "+100", "Vielfache von 2 streichen", "Cross out multiples of 2", "Nächster Schritt", "Next step", "· 10"]:
                    k = page.locator(f"button:has-text('{t}'):visible")
                    if k.count(): k.first.click(); page.wait_for_timeout(60)
                sw = page.evaluate("document.documentElement.scrollWidth"); pruefe(sw <= breite, f"{wo}: Überbreite Entdecken {sw}")
                if breite == 390 and sprache == "de": page.screenshot(path=f"{AUS}/{pfad}-entdecken.png", full_page=True)
                page.get_by_role("tab", name="Trainieren" if sprache == "de" else "Train").first.click(); page.wait_for_timeout(200)
                _typen_auf(page)
                typen = page.locator("[data-aufgabentyp]:visible button"); n = typen.count()
                pruefe(n >= 5, f"{wo}: nur {n} Aufgabentypen")
                for i in range(n):
                    _typen_auf(page)
                    typen.nth(i).click(); page.wait_for_timeout(100)
                    for _ in range(3 if i else 6):
                        schritte_durch(page, f"{wo}/{i}")
                        sw = page.evaluate("document.documentElement.scrollWidth"); pruefe(sw <= breite, f"{wo}/{i}: Überbreite {sw}")
                        page.locator("button:has-text('Neue Aufgabe'):visible, button:has-text('New exercise'):visible").first.click(); page.wait_for_timeout(60)
                if breite == 390 and sprache == "de": page.screenshot(path=f"{AUS}/{pfad}-ueben.png", full_page=True)
                print(wo, "ok,", n, "Aufgabentypen")
            if sprache == "de":
                page.goto(BASE); page.wait_for_timeout(900)
                page.get_by_role("button", name="Unterstufe aufklappen").first.click(); page.wait_for_timeout(300)
                for bname in ["Zahlen und Größen", "Zuordnungen und Prozent", "Daten und Zufall", "Brüche und Dezimalzahlen", "Geometrie"]:
                    pruefe(page.get_by_role("button", name=f"{bname} aufklappen").count() == 1, f"{breite}: Bereich {bname} fehlt in der Unterstufe")
                page.get_by_role("button", name="Zahlen und Größen aufklappen").first.click(); page.wait_for_timeout(400)
                page.screenshot(path=f"{AUS}/start-unterstufe-{breite}.png")
                page.locator("button:has-text('Größen umrechnen')").last.click(); page.wait_for_timeout(800)
                pruefe("/groessen" in page.url, f"{breite}: Sprung zu Größen ({page.url})")
                page.goto(BASE); page.wait_for_timeout(800)
                page.get_by_role("button", name="Mittelstufe aufklappen").first.click(); page.wait_for_timeout(300)
                pruefe(page.get_by_role("button", name="Zahlen und Größen aufklappen").count() == 0, f"{breite}: Zahlen und Größen in der Mittelstufe sichtbar")
                pruefe(page.get_by_role("button", name="Zuordnungen und Prozent aufklappen").count() == 0, f"{breite}: Zuordnungen und Prozent stehen in der Mittelstufe")
            pruefe(not konsole, f"{sprache}/{breite}: Konsolenfehler {konsole[:3]}")
            ctx.close()
    b.close()
print("FEHLER:", len(fehler))
for f in fehler: print(" -", f)
raise SystemExit(1 if fehler else 0)
