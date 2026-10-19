"""Browser-Test Themenseite „Die natürliche Exponentialfunktion“ (/e-funktion):
  npx vite build && npx vite preview --port 4371 &   →   BASE_URL=http://localhost:4371 python3 tests/ui/efunktion.ui.py [Screenshot-Ordner]
"""
import os, sys
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173").rstrip("/")
AUS = sys.argv[1] if len(sys.argv) > 1 else "/tmp/efunktion-ui"
os.makedirs(AUS, exist_ok=True)
fehler = []

def pruefe(bed, text):
    if not bed:
        fehler.append(text); print("FEHLT:", text)

with sync_playwright() as pw:
    b = pw.chromium.launch()
    for breite in [360, 390, 1280]:
        ctx = b.new_context(viewport={"width": breite, "height": 860}, locale="de-DE")
        page = ctx.new_page()
        konsole = []
        page.on("pageerror", lambda e: konsole.append(f"pageerror: {e}"))
        page.goto(BASE + "/e-funktion"); page.wait_for_timeout(1500)
        def breite_ok(wo):
            sw = page.evaluate("document.documentElement.scrollWidth")
            pruefe(sw <= breite, f"{breite} {wo}: Seite zu breit ({sw})")
        pruefe(page.get_by_role("heading", name="Die natürliche Exponentialfunktion").count() >= 1, f"{breite}: Titel fehlt")
        pruefe(page.get_by_text("Welche Exponentialfunktion ist ihre eigene Ableitung?").count() == 1, f"{breite}: Leitfrage fehlt")
        breite_ok("Start")
        page.screenshot(path=f"{AUS}/{breite}-ganz.png", full_page=True)

        # Visualisierung: drei Tabs
        page.get_by_role("button", name="a = e setzen").click(); page.wait_for_timeout(150)
        pruefe(page.get_by_text("Treffer").count() == 1, f"{breite}: a = e ohne Treffer")
        page.get_by_role("button", name="a = e setzen").scroll_into_view_if_needed()
        page.screenshot(path=f"{AUS}/{breite}-vis-basis.png")
        page.get_by_role("button", name="Subtangente").click(); page.wait_for_timeout(150)
        pruefe(page.locator("text=s = 1").count() >= 1, f"{breite}: Subtangente fehlt")
        page.screenshot(path=f"{AUS}/{breite}-vis-sub.png")
        page.get_by_role("button", name="e gewinnt").first.click(); page.wait_for_timeout(150)
        page.screenshot(path=f"{AUS}/{breite}-vis-gewinnt.png")
        breite_ok("Visualisierung")

        # Trainer: Lösung zeigen lassen (falsche Eingabe), dann Asymptoten-Modus
        page.get_by_role("button", name="Lieber selbst tippen").click(); page.wait_for_timeout(150)
        feld = page.locator("input[placeholder='f′(x)'], textarea[placeholder='f′(x)'], [placeholder='f′(x)']").first
        feld.click(); page.keyboard.type("7"); page.wait_for_timeout(100)
        page.get_by_role("button", name="Prüfen").click(); page.wait_for_timeout(200)
        pruefe(page.get_by_text("Stimmt noch nicht.").count() == 1, f"{breite}: falsche Eingabe nicht erkannt")
        page.get_by_role("button", name="Rechenweg zeigen").click(); page.wait_for_timeout(200)
        page.get_by_text("Stimmt noch nicht.").scroll_into_view_if_needed()
        page.screenshot(path=f"{AUS}/{breite}-trainer.png")
        breite_ok("Trainer")
        page.get_by_role("button", name="Asymptote & Wertemenge").click(); page.wait_for_timeout(200)
        page.get_by_text("Waagrechte Asymptote: y =").scroll_into_view_if_needed()
        page.screenshot(path=f"{AUS}/{breite}-asymptote.png")
        breite_ok("Asymptote")

        # Buchaufgaben: alle aufklappen
        knoepfe = page.get_by_role("button", name="Lösungsweg zeigen")
        n = knoepfe.count()
        pruefe(n == 11, f"{breite}: {n} statt 11 Buchaufgaben")
        for i in range(n):
            page.get_by_role("button", name="Lösungsweg zeigen").first.click(); page.wait_for_timeout(60)
        breite_ok("Buchaufgaben offen")
        page.get_by_text("Die Aufgaben von Seite 22 und 23").scroll_into_view_if_needed()
        page.screenshot(path=f"{AUS}/{breite}-buch.png", full_page=(breite != 1280))
        pruefe(not konsole, f"{breite}: Konsole {konsole[:3]}")
        ctx.close()
    b.close()

print("OK" if not fehler else f"{len(fehler)} Fehler")
sys.exit(1 if fehler else 0)
