"""Browser-Test Knopf „GFS wählen“ (oben im Kopf der Kursseite und jeder Themenseite).
Je Breite (360, 390, 1280):
  Kursseite: Knopf steht im Kopf über dem Titel; ohne gemerkte Klasse öffnet das Menü bei „Welche Klasse?“
  (fünf Stufen) → Klasse 9 → Themenliste (8 Themen, fertige zuerst mit „Öffnen“); Thema ohne Seite klappt
  „Themenseite folgt“ auf; Teil 1 der Kursseite zeigt dieselbe Klasse; „Öffnen“ beim Ziegenproblem → Themenseite.
  Themenseite: Knopf oben rechts neben „← GFS-Training“; Menü öffnet gleich bei Klasse 9, Ziegenproblem trägt „Hier“;
  „← Klassen“ → Kursstufe 2 → Satz von Bayes öffnen → Bayes-Seite. Escape schließt, Klick daneben schließt.
  Menü bleibt im Fenster, keine Überbreite, keine Seitenfehler.
  npx vite preview --port 4173 &   →   BASE_URL=http://localhost:4173/ python3 tests/ui/gfswahl.ui.py
"""
import os
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
AUS = os.environ.get("SCREENS", "/tmp/gfswahl")
os.makedirs(AUS, exist_ok=True)
fehler = []
def pruefe(bed, text):
    if not bed: fehler.append(text); print("FEHLT:", text)
def breit_ok(page, breite, wo):
    sw = page.evaluate("document.documentElement.scrollWidth"); pruefe(sw <= breite, f"{wo}: Überbreite {sw}")
def im_fenster(page, breite, wo):
    r = page.locator(".gw-menue").bounding_box()
    pruefe(r is not None and r["x"] >= 8 and r["x"] + r["width"] <= breite - 8, f"{wo}: Menü im Fenster {r}")

with sync_playwright() as p:
    b = p.chromium.launch()
    for breite in (360, 390, 1280):
        ctx = b.new_context(viewport={"width": breite, "height": 900}); page = ctx.new_page()
        seitenfehler = []; page.on("pageerror", lambda e: seitenfehler.append(str(e)))
        page.goto(BASE + "kurse"); page.wait_for_timeout(600)
        page.evaluate("localStorage.clear(); localStorage.setItem('mm-start-app','1')")
        page.goto(BASE + "gfs-trainer"); page.wait_for_timeout(1500)
        knopf = page.locator(".ks-kopf [data-gfs-wahl]")
        pruefe(knopf.count() == 1, f"{breite}: Knopf im Kopf der Kursseite")
        kb, tb = knopf.bounding_box(), page.locator(".ks-titel").bounding_box()
        pruefe(kb and tb and kb["y"] + kb["height"] <= tb["y"] + 2, f"{breite}: Knopf über dem Titel")
        page.locator(".ks-kopf").screenshot(path=f"{AUS}/kopf-{breite}.png")
        knopf.click(); page.wait_for_timeout(250)
        pruefe(page.locator("[data-gfs-wahl-menue='klasse']").count() == 1, f"{breite}: ohne Klasse zuerst die Klassenwahl")
        pruefe(page.locator("[data-gfs-wahl-stufe]").count() == 5, f"{breite}: fünf Stufen")
        im_fenster(page, breite, f"{breite} Klassen"); breit_ok(page, breite, f"{breite} Klassen")
        page.locator(".gw-menue").screenshot(path=f"{AUS}/klassen-{breite}.png")
        page.locator("[data-gfs-wahl-stufe='9']").click(); page.wait_for_timeout(250)
        themen = page.locator("[data-gfs-wahl-themen='9'] [data-gfs-wahl-thema]")
        pruefe(themen.count() == 8, f"{breite}: acht Themen Klasse 9 ({themen.count()})")
        pruefe(page.locator("[data-gfs-wahl-themen='9'] .gw-thema").first.get_attribute("class").find("gw-fertig") >= 0, f"{breite}: fertige Themen zuerst")
        page.locator("[data-gfs-wahl-thema='c14']").click(); page.wait_for_timeout(150)
        pruefe(page.locator(".gw-mehr", has_text="Themenseite folgt").count() == 1, f"{breite}: Kurzbeschreibung klappt auf")
        im_fenster(page, breite, f"{breite} Themen")
        page.locator(".gw-menue").screenshot(path=f"{AUS}/themen-9-{breite}.png")
        pruefe(page.locator(".gfs-stufe-knopf", has_text="Klasse 9").count() == 1, f"{breite}: Teil 1 zeigt Klasse 9")
        page.keyboard.press("Escape"); page.wait_for_timeout(150)
        pruefe(page.locator(".gw-menue").count() == 0, f"{breite}: Escape schließt")
        knopf.click(); page.wait_for_timeout(250)
        pruefe(page.locator("[data-gfs-wahl-menue='thema']").count() == 1, f"{breite}: mit Klasse gleich die Themen")
        page.locator("[data-gfs-wahl-thema='ziegenproblem']").click(); page.wait_for_timeout(1500)
        pruefe("ziegen" in page.url, f"{breite}: Ziegenseite {page.url}")
        # Themenseite
        k2 = page.locator(".gtk [data-gfs-wahl]")
        pruefe(k2.count() == 1, f"{breite}: Knopf im Themenkopf")
        z = page.get_by_role("button", name="Zurück zum GFS-Training").bounding_box(); kb = k2.bounding_box()
        pruefe(z and kb and abs((z["y"] + z["height"] / 2) - (kb["y"] + kb["height"] / 2)) < 4 and kb["x"] > z["x"], f"{breite}: Knopf rechts neben dem Rückweg")
        page.locator(".gtk").screenshot(path=f"{AUS}/themenkopf-{breite}.png")
        breit_ok(page, breite, f"{breite} Themenseite")
        k2.click(); page.wait_for_timeout(250)
        pruefe(page.locator("[data-gfs-wahl-themen='9']").count() == 1, f"{breite}: Themenseite öffnet bei Klasse 9")
        pruefe(page.locator("[data-gfs-wahl-thema='ziegenproblem'] .gw-hier-marke").count() == 1, f"{breite}: aktuelles Thema „Hier“")
        im_fenster(page, breite, f"{breite} Themenseite")
        page.mouse.click(5, 880); page.wait_for_timeout(150)
        pruefe(page.locator(".gw-menue").count() == 0, f"{breite}: Klick daneben schließt")
        k2.click(); page.wait_for_timeout(250)
        page.locator("[data-gfs-wahl-zurueck]").click(); page.wait_for_timeout(150)
        pruefe(page.locator("[data-gfs-wahl-menue='klasse']").count() == 1, f"{breite}: zurück zu den Klassen")
        page.locator("[data-gfs-wahl-stufe='k2']").click(); page.wait_for_timeout(200)
        page.locator("[data-gfs-wahl-thema='bayes']").click(); page.wait_for_timeout(1500)
        pruefe("bayes" in page.url, f"{breite}: Bayes-Seite {page.url}")
        pruefe(page.locator(".gtk-titel", has_text="Bayes").count() == 1, f"{breite}: Bayes-Kopf")
        pruefe(page.evaluate("JSON.parse(localStorage.getItem('mm_gfskurs')||'{}').stufe") == "k2", f"{breite}: Stufe gemerkt")
        pruefe(not seitenfehler, f"{breite}: Seitenfehler {seitenfehler}")
        ctx.close()
    b.close()
print("FEHLER:", len(fehler)) if fehler else print("alles grün")
raise SystemExit(1 if fehler else 0)
