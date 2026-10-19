"""Browser-Test GFS-Trainer (Übersicht + Pascal’sches Dreieck).
Je Breite (360, 390, 1280):
  · /gfs-trainer zeigt die Themenkarte, Klick öffnet die Pascal-Seite
  · Dreieck: Zeilen +/−, alle fünf Muster, Ansicht (n k), Antippen einer Zahl
  · Trainer: jede Aufgabenart mit richtiger Antwort prüfen („Stimmt!“), falsche Antwort zeigt Rechenweg
  · Kolloquium: aufdecken, „Konnte ich“ zählt hoch
  · keine Seitenfehler, keine Überbreite
  npx vite preview --port 4173 &   →   BASE_URL=http://localhost:4173/ python3 tests/ui/gfs.ui.py
"""
import os, re
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
AUS = os.environ.get("SCREENS", "/tmp/gfs")
os.makedirs(AUS, exist_ok=True)
fehler = []

def pruefe(bed, text):
    if not bed:
        fehler.append(text); print("FEHLT:", text)

def breit_ok(page, breite, wo):
    sw = page.evaluate("document.documentElement.scrollWidth")
    pruefe(sw <= breite, f"{wo}: Überbreite {sw}")

def binom(n, k):
    from math import comb
    return comb(n, k)

with sync_playwright() as p:
    b = p.chromium.launch()
    for breite in (360, 390, 1280):
        ctx = b.new_context(viewport={"width": breite, "height": 900})
        page = ctx.new_page()
        seitenfehler = []
        page.on("pageerror", lambda e: seitenfehler.append(str(e)))
        page.goto(BASE + "gfs-trainer"); page.wait_for_timeout(1500)
        pruefe(page.locator("text=Deine GFS in Mathe").count() > 0, f"{breite}: Übersicht")
        breit_ok(page, breite, f"{breite} Übersicht")
        page.screenshot(path=f"{AUS}/uebersicht-{breite}.png", full_page=True)
        page.locator("button:has-text('Pascal’sches Dreieck und Binomialkoeffizienten')").first.click()
        page.wait_for_timeout(1500)
        pruefe(page.locator("text=Warum stehen im Pascal’schen Dreieck").count() > 0, f"{breite}: Pascal-Seite")
        pruefe("/gfs-trainer/pascalsches-dreieck" in page.url, f"{breite}: URL {page.url}")
        breit_ok(page, breite, f"{breite} Pascal oben")
        page.screenshot(path=f"{AUS}/pascal-{breite}.png", full_page=True)

        # Dreieck
        for _ in range(3): page.locator("button[aria-label='Zeilen erhöhen']").click()
        pruefe(page.locator("text=0 bis 9").count() > 0, f"{breite}: Zeilen +")
        for m in ["Symmetrie", "Dreieckszahlen", "Zeilensumme", "Ungerade Zahlen", "Summenregel"]:
            page.locator(f"button:has-text('{m}')").first.click(); page.wait_for_timeout(80)
            breit_ok(page, breite, f"{breite} Muster {m}")
        pruefe(page.locator("text=0 bis 15").count() > 0, f"{breite}: Ungerade setzt 15 Zeilen")
        page.locator("button[aria-label='Binomialkoeffizienten zeigen']").click(); page.wait_for_timeout(80)
        page.locator("svg[role=img] g").nth(30).click(); page.wait_for_timeout(80)
        vis = page.locator("svg[role=img]").first
        vis.screenshot(path=f"{AUS}/dreieck-{breite}.png")
        page.locator("button[aria-label='Zahlen zeigen']").click()

        # Trainer
        for art in ["Berechnen", "Rückwärts", "Binomische Formel"]:
            page.locator(f"button:has-text('{art}')").first.click(); page.wait_for_timeout(120)
            karte_text = page.locator("text=/Berechne den Binomialkoeffizienten|Schreibe die Zahl|Bestimme den Koeffizienten/").first
            karte = karte_text.locator("xpath=..")
            if art == "Rückwärts":
                txt = karte.inner_text()
                x = int(re.search(r"(\d+)\s*=", txt.replace("\n", " ").split("n − 2.")[-1]).group(1))
                gef = None
                for n in range(4, 40):
                    for k in range(2, n - 1):
                        if binom(n, k) == x: gef = (n, k); break
                    if gef: break
                page.locator("input[aria-label=n]").fill(str(gef[0])); page.locator("input[aria-label=k]").fill(str(gef[1]))
            else:
                page.locator("input[aria-label=Ergebnis]").fill("1")
                page.locator("button:has-text('Prüfen')").click(); page.wait_for_timeout(100)
                if page.locator("text=Stimmt noch nicht").count():
                    page.locator("button:has-text('Rechenweg zeigen')").click(); page.wait_for_timeout(100)
                    weg = karte.inner_text()
                    zahlen = re.findall(r"=\s*(\d+)\s*$", weg, re.M)
                    pruefe(len(zahlen) > 0, f"{breite} {art}: Rechenweg ohne Ergebnis")
                    page.locator("input[aria-label=Ergebnis]").fill(zahlen[-1] if zahlen else "0")
                else:
                    page.locator("button:has-text('Nächste Aufgabe')").click(); continue
            page.locator("button:has-text('Prüfen')").click(); page.wait_for_timeout(150)
            pruefe(page.locator("text=Stimmt!").count() > 0, f"{breite} {art}: richtige Antwort nicht erkannt")
            breit_ok(page, breite, f"{breite} Trainer {art}")
            karte.screenshot(path=f"{AUS}/trainer-{art[:4]}-{breite}.png")
            page.locator("button:has-text('Nächste Aufgabe')").click(); page.wait_for_timeout(100)

        # Kolloquium
        page.locator("button:has-text('Antwort aufdecken')").click(); page.wait_for_timeout(80)
        page.locator("button:has-text('Konnte ich')").click(); page.wait_for_timeout(80)
        pruefe(page.locator("text=1 von 11 sitzen").count() > 0, f"{breite}: Kolloquium zählt")
        page.locator("button:has-text('Alle Fragen auf einen Blick')").click(); page.wait_for_timeout(80)
        breit_ok(page, breite, f"{breite} Kolloquium")
        page.screenshot(path=f"{AUS}/pascal-unten-{breite}.png", full_page=True)
        pruefe(not seitenfehler, f"{breite}: Seitenfehler {seitenfehler}")
        ctx.close()
    b.close()

print("OK" if not fehler else f"{len(fehler)} Fehler")
raise SystemExit(1 if fehler else 0)
