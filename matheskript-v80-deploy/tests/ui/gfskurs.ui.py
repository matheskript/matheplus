"""Browser-Test Kurs GFS (Startseiten-Kachel, Klassenwahl, Leitfaden, Zeitplan).
Je Breite (360, 390, 1280): Kachel auf der Startseite öffnet /gfs-trainer; Klasse 10 zeigt das Pascal-Thema,
Klasse 8 den Hinweis; Schritt 1 aufklappen, drei Haken → 1 von 7; Termin eintragen → Zeitplan mit 8 Zeilen;
Thema öffnen → Pascal-Seite, zurück zum Kurs; keine Seitenfehler, keine Überbreite.
  npx vite preview --port 4173 &   →   BASE_URL=http://localhost:4173/ python3 tests/ui/gfskurs.ui.py
"""
import os, datetime
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
AUS = os.environ.get("SCREENS", "/tmp/gfskurs")
os.makedirs(AUS, exist_ok=True)
fehler = []
def pruefe(bed, text):
    if not bed: fehler.append(text); print("FEHLT:", text)
def breit_ok(page, breite, wo):
    sw = page.evaluate("document.documentElement.scrollWidth"); pruefe(sw <= breite, f"{wo}: Überbreite {sw}")

with sync_playwright() as p:
    b = p.chromium.launch()
    for breite in (360, 390, 1280):
        ctx = b.new_context(viewport={"width": breite, "height": 900}); page = ctx.new_page()
        seitenfehler = []; page.on("pageerror", lambda e: seitenfehler.append(str(e)))
        page.goto(BASE); page.wait_for_timeout(1500)
        kachel = page.locator("button[aria-label='Kurs GFS öffnen']")
        pruefe(kachel.count() == 1, f"{breite}: Kachel auf der Startseite")
        kachel.scroll_into_view_if_needed(); kachel.screenshot(path=f"{AUS}/kachel-{breite}.png")
        kachel.click(); page.wait_for_timeout(1500)
        pruefe("/gfs-trainer" in page.url, f"{breite}: URL {page.url}")
        pruefe(page.locator("text=So gehst du eine GFS an").count() > 0, f"{breite}: Kursseite")
        breit_ok(page, breite, f"{breite} Kurs")
        page.locator("button:has-text('Klasse 8')").click(); page.wait_for_timeout(80)
        pruefe(page.locator("text=Die Themen kommen gerade ins Buch").count() > 0, f"{breite}: Hinweis Klasse 8")
        page.locator("button:has-text('Klasse 10')").click(); page.wait_for_timeout(80)
        pruefe(page.locator("text=Pascal’sches Dreieck und Binomialkoeffizienten").count() > 0, f"{breite}: Thema Klasse 10")
        # Leitfaden
        page.locator("button[aria-expanded]:has-text('Thema und Rahmen klären')").click(); page.wait_for_timeout(120)
        for t in ["abgesprochen", "Kriterien geklärt", "Zeitplan erstellt"]:
            page.locator(f"button[aria-pressed='false']:has-text('{t}')").first.click(); page.wait_for_timeout(50)
        pruefe(page.locator("text=1 von 7 Schritten").count() > 0 or page.locator("text=/\\b1\\b.*von 7 Schritten/").count() > 0, f"{breite}: 1 von 7")
        # Zeitplan
        termin = (datetime.date.today() + datetime.timedelta(days=32)).isoformat()
        page.locator("input[aria-label='Termin der GFS']").fill(termin); page.wait_for_timeout(120)
        pruefe(page.locator("text=Deine GFS").count() > 0 and page.locator("text=Thema und Rahmen geklärt").count() > 0, f"{breite}: Zeitplan")
        breit_ok(page, breite, f"{breite} Kurs unten")
        page.screenshot(path=f"{AUS}/kurs-{breite}.png", full_page=True)
        # Thema öffnen und zurück
        page.locator(".gfs-thema").first.click(); page.wait_for_timeout(1500)
        pruefe("/gfs-trainer/pascalsches-dreieck" in page.url, f"{breite}: Themenseite {page.url}")
        page.locator("button:has-text('Zurück zum Kurs GFS')").click(); page.wait_for_timeout(800)
        pruefe(page.locator("text=Dein Thema: Pascal’sches Dreieck").count() > 0, f"{breite}: Thema gemerkt")
        pruefe(not seitenfehler, f"{breite}: Seitenfehler {seitenfehler}")
        ctx.close()
    b.close()
print("OK" if not fehler else f"{len(fehler)} Fehler"); raise SystemExit(1 if fehler else 0)
