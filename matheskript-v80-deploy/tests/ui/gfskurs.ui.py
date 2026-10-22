"""Browser-Test GFS-Training (Startseiten-Kachel, Knopf „Klasse wählen“ mit Themenfenster, Leitfaden, Zeitplan).
Je Breite (360, 390, 1280): Kachel auf der Startseite öffnet /gfs-trainer; „Klasse wählen“ → Klasse 8 zeigt
sieben Themen im Fenster (Thema ohne Seite klappt seine Kurzbeschreibung auf), Klasse 10 das Pascal-Thema mit
„Öffnen“; Schritt 1 aufklappen, drei Haken → 1 von 7; Termin eintragen → Zeitplan; Thema öffnen → Pascal-Seite,
über den Rückweg-Chip im Kopf zurück zum Kurs; keine Seitenfehler, keine Überbreite.
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
        page.goto(BASE + "kurse"); page.wait_for_timeout(1500)   # große Kurs-Kacheln stehen seit 21.10. auf /kurse
        kachel = page.locator("button[aria-label='GFS-Training öffnen']")
        pruefe(kachel.count() == 1, f"{breite}: Kachel auf der Startseite")
        kachel.scroll_into_view_if_needed(); kachel.screenshot(path=f"{AUS}/kachel-{breite}.png")
        kachel.click(); page.wait_for_timeout(1500)
        pruefe("/gfs-trainer" in page.url, f"{breite}: URL {page.url}")
        pruefe(page.locator("text=So gehst du eine GFS an").count() > 0, f"{breite}: Kursseite")
        breit_ok(page, breite, f"{breite} Kurs")
        def stufe(name):
            page.locator(".gfs-stufe-knopf").click(); page.wait_for_timeout(120)
            page.get_by_role("option", name=name).click(); page.wait_for_timeout(250)
        stufe("Klasse 8")
        pruefe(page.locator("[data-gfs-fenster='8'] .gfs-thema").count() == 7, f"{breite}: sieben Themen in Klasse 8")
        breit_ok(page, breite, f"{breite} Fenster Klasse 8")
        page.locator(".gfs-thema", has_text="Efron-Würfel").click(); page.wait_for_timeout(120)
        pruefe(page.locator("text=Themenseite folgt").count() == 1, f"{breite}: Kurzbeschreibung klappt auf")
        page.locator(".gfs-fenster").screenshot(path=f"{AUS}/fenster-8-{breite}.png")
        stufe("Klasse 10")
        pruefe(page.locator(".gfs-thema-fertig", has_text="Pascal’sches Dreieck").count() == 1, f"{breite}: Thema Klasse 10")
        pruefe(page.locator(".gfs-stufe-knopf", has_text="Klasse 10").count() == 1, f"{breite}: Knopf zeigt Klasse 10")
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
        page.locator(".gfs-thema-fertig").first.click(); page.wait_for_timeout(1500)
        pruefe("/gfs-trainer/pascalsches-dreieck" in page.url, f"{breite}: Themenseite {page.url}")
        page.get_by_role("button", name="Zurück zum GFS-Training").click(); page.wait_for_timeout(800)
        pruefe(page.locator("text=Dein Thema: Pascal’sches Dreieck").count() > 0, f"{breite}: Thema gemerkt")
        pruefe(not seitenfehler, f"{breite}: Seitenfehler {seitenfehler}")
        ctx.close()
    b.close()
print("OK" if not fehler else f"{len(fehler)} Fehler"); raise SystemExit(1 if fehler else 0)
