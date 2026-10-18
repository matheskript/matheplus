"""Browser-Test Kachel „Dein Training startet hier.“ (Startseite): Schulsystem → Klasse → Kapitel-Menü → Werkzeuge → Sprung.
Prüft bei 360, 390 und 1280 px: Balken auf Höhe der Überschrift (ab 600 px), 2 × 4 Klassen, keine Abi-Box,
keine Modus-Knöpfe, keine Seitenüberbreite, keine Konsolenfehler, Auswahl bleibt nach Reload, Screenshots.
  npm run build && npx vite preview --port 4173 &   →   python3 tests/ui/quickfinder.ui.py
"""
import os
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
AUS = os.environ.get("SCREENS", "/tmp/qf")
os.makedirs(AUS, exist_ok=True)
fehler = []

def pruefe(bed, text):
    if not bed:
        fehler.append(text)
        print("FEHLT:", text)

with sync_playwright() as p:
    b = p.chromium.launch()
    for breite in (360, 390, 1280):
        ctx = b.new_context(viewport={"width": breite, "height": 900}, device_scale_factor=2, timezone_id="Europe/Berlin", locale="de-DE")
        page = ctx.new_page()
        page.on("dialog", lambda d: d.accept())
        konsole = []
        page.on("pageerror", lambda e: konsole.append(f"pageerror: {e}"))
        page.on("console", lambda m: konsole.append(m.text) if m.type == "error" and "net::" not in m.text and "Failed to load resource" not in m.text else None)
        page.goto(BASE)
        page.evaluate("localStorage.clear(); sessionStorage.clear(); localStorage.setItem('mm-onboarding-v1', JSON.stringify({uebersprungen:true}));")
        page.reload(); page.wait_for_timeout(800)

        def breite_ok(wo):
            sw = page.evaluate("document.documentElement.scrollWidth")
            pruefe(sw <= breite, f"{breite}: Überbreite bei {wo}: {sw}")

        page.get_by_role("heading", name="Dein Training startet hier.").scroll_into_view_if_needed()
        pruefe(page.get_by_role("button", name="Eine Sache üben").count() == 0, f"{breite}: Modus-Knopf noch da")
        pruefe(page.get_by_role("button", name="Abi-Training").count() == 0, f"{breite}: Abi-Box noch da")
        pruefe(page.get_by_role("button", name="Klasse 5/6").is_disabled(), f"{breite}: Klassen vor Schulsystem nicht gesperrt")
        if breite >= 600:
            h = page.evaluate("document.querySelector('.qf-kopf h2').getBoundingClientRect().top")
            bar = page.evaluate("document.querySelector('.qf-a-schul').getBoundingClientRect().top")
            pruefe(abs(h - bar) < 2, f"{breite}: Balken nicht auf Höhe der Überschrift ({h} / {bar})")

        # G8: 5/6 … 12, 11 und 12 gold, ein Feld frei
        page.get_by_role("button", name="G8").first.click(); page.wait_for_timeout(150)
        pruefe(page.get_by_role("button", name="Klasse 5/6").count() == 1, f"{breite}: Box 5/6 fehlt bei G8")
        pruefe(page.get_by_role("button", name="Klasse 13").count() == 0, f"{breite}: Box 13 bei G8")
        # G9: 5/6 … 13
        page.get_by_role("button", name="G9").first.click(); page.wait_for_timeout(150)
        pruefe(page.get_by_role("button", name="G9").first.get_attribute("aria-pressed") == "true", f"{breite}: G9 nicht gewählt")
        pruefe(page.get_by_role("button", name="Klasse 13").count() == 1, f"{breite}: Box 13 fehlt bei G9")
        breite_ok("Schulsystem")
        page.screenshot(path=f"{AUS}/{breite}-1-start.png")

        # Klasse 9 → Kapitel-Menü öffnet sich
        page.get_by_role("button", name="Klasse 9", exact=True).click(); page.wait_for_timeout(300)
        pruefe(page.get_by_role("listitem").filter(has_text="Satz des Pythagoras").count() >= 1, f"{breite}: Kapitel-Menü fehlt")
        pruefe(page.evaluate("localStorage.getItem('matheplus-start-stufe')") == "mittel", f"{breite}: Stufe nicht auf mittel")
        breite_ok("Kapitel")
        page.screenshot(path=f"{AUS}/{breite}-2-kapitel.png")
        page.get_by_role("button", name="Satz des Pythagoras").first.click(); page.wait_for_timeout(300)
        pruefe(page.get_by_text("Trainings-Werkzeuge zu diesem Kapitel").count() == 1, f"{breite}: Werkzeuge fehlen")
        pruefe(page.get_by_role("button", name="Satz des Pythagoras entdecken").count() == 1, f"{breite}: Pythagoras-Hilfe fehlt")
        pruefe(page.get_by_role("button", name="Trainingsplan zu diesem Kapitel").count() == 1, f"{breite}: Trainingsplan fehlt")
        breite_ok("Werkzeuge")
        page.get_by_text("Trainings-Werkzeuge zu diesem Kapitel").scroll_into_view_if_needed()
        page.screenshot(path=f"{AUS}/{breite}-3-werkzeuge.png")

        # Reload: Auswahl und offenes Kapitel bleiben
        page.reload(); page.wait_for_timeout(800)
        pruefe(page.get_by_role("button", name="Satz des Pythagoras entdecken").count() == 1, f"{breite}: Auswahl nach Reload weg")
        page.get_by_role("button", name="Satz des Pythagoras entdecken").click(); page.wait_for_timeout(700)
        pruefe("pythagoras" in page.url, f"{breite}: Sprung fehlgeschlagen: {page.url}")
        breite_ok("Werkzeug")

        # Kursstufe: Klasse 13 → Abiturvorbereitung mit Abi-Sätzen
        page.goto(BASE); page.wait_for_timeout(700)
        page.get_by_role("heading", name="Dein Training startet hier.").scroll_into_view_if_needed()
        page.get_by_role("button", name="Klasse 13").click(); page.wait_for_timeout(300)
        page.get_by_role("button", name="Abiturvorbereitung").first.click(); page.wait_for_timeout(300)
        pruefe(page.get_by_role("button", name="Abi-Sätze").count() >= 1, f"{breite}: Abi-Sätze fehlen")
        pruefe(page.evaluate("localStorage.getItem('matheplus-start-stufe')") == "ober", f"{breite}: Stufe nicht auf ober")
        breite_ok("Kursstufe")
        pruefe(not konsole, f"{breite}: Konsolenfehler: {konsole[:3]}")
        ctx.close()
    b.close()

print("FEHLER:", len(fehler))
for f in fehler: print(" -", f)
raise SystemExit(1 if fehler else 0)
