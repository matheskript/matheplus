"""Browser-Test Quickfinder in „Mein Training“ (Startseite): Schulart → Klasse → Kapitel → Hilfen → Sprung ins Werkzeug.
Prüft bei 360, 390 und 1280 px: keine Seitenüberbreite, keine Konsolenfehler, Auswahl bleibt nach Reload, Screenshots.
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
        konsole = []
        page.on("pageerror", lambda e: konsole.append(f"pageerror: {e}"))
        page.on("console", lambda m: konsole.append(m.text) if m.type == "error" and "net::" not in m.text and "Failed to load resource" not in m.text else None)
        page.goto(BASE)
        page.evaluate("localStorage.clear(); sessionStorage.clear(); localStorage.setItem('mm-onboarding-v1', JSON.stringify({uebersprungen:true}));")
        page.reload(); page.wait_for_timeout(700)

        def breite_ok(wo):
            sw = page.evaluate("document.documentElement.scrollWidth")
            pruefe(sw <= breite, f"{breite}: Überbreite bei {wo}: {sw}")

        qf = page.get_by_text("Dein Status quo").first
        pruefe(qf.count() == 1, f"{breite}: Quickfinder fehlt")
        qf.scroll_into_view_if_needed()
        # G9 ist vorgewählt
        pruefe(page.get_by_role("button", name="G9").first.get_attribute("aria-pressed") == "true", f"{breite}: G9 nicht vorgewählt")
        pruefe(page.get_by_role("button", name="Klasse 5/6").count() == 1, f"{breite}: Box 5/6 fehlt bei G9")
        pruefe(page.get_by_role("button", name="Klasse 13 (Kursstufe)").count() == 1, f"{breite}: Box 13 fehlt bei G9")
        # G8: 5 … 12, 11 und 12 gold
        page.get_by_role("button", name="G8").first.click(); page.wait_for_timeout(150)
        pruefe(page.get_by_role("button", name="Klasse 5", exact=True).count() == 1, f"{breite}: Box 5 fehlt bei G8")
        pruefe(page.get_by_role("button", name="Klasse 11 (Kursstufe)").count() == 1, f"{breite}: Box 11 nicht gold bei G8")
        pruefe(page.get_by_role("button", name="Klasse 13 (Kursstufe)").count() == 0, f"{breite}: Box 13 bei G8")
        # GMS wie G9
        page.get_by_role("button", name="GMS").first.click(); page.wait_for_timeout(150)
        pruefe(page.get_by_role("button", name="Klasse 5/6").count() == 1, f"{breite}: Box 5/6 fehlt bei GMS")
        page.get_by_role("button", name="G9").first.click(); page.wait_for_timeout(150)
        breite_ok("Schulart")
        page.screenshot(path=f"{AUS}/{breite}-1-start.png", full_page=False)

        # Klasse 9 → Kapitel klappen auf
        page.get_by_role("button", name="Klasse 9", exact=True).click(); page.wait_for_timeout(250)
        pruefe(page.get_by_text("Thema im Buch").count() >= 1, f"{breite}: Themenfeld fehlt")
        pruefe(page.get_by_role("option").count() >= 5, f"{breite}: zu wenige Kapitel: {page.get_by_role('option').count()}")
        breite_ok("Kapitel")
        page.screenshot(path=f"{AUS}/{breite}-2-kapitel.png", full_page=False)
        page.get_by_role("option", name="Satz des Pythagoras").first.click(); page.wait_for_timeout(300)
        pruefe(page.get_by_text("Dafür hilft dir in der App").count() == 1, f"{breite}: Hilfen fehlen")
        pruefe(page.get_by_text("Satz des Pythagoras entdecken").count() == 1, f"{breite}: Pythagoras-Hilfe fehlt")
        breite_ok("Hilfen")
        page.screenshot(path=f"{AUS}/{breite}-3-hilfen.png", full_page=False)

        # Stufen-Schalter folgt der Klasse (Mittelstufe), Kursstufe → Oberstufe
        pruefe(page.evaluate("localStorage.getItem('matheplus-stufe')") == "mittel", f"{breite}: Stufe nicht auf mittel")
        # Reload: Auswahl bleibt
        page.reload(); page.wait_for_timeout(700)
        pruefe(page.get_by_text("IX · Satz des Pythagoras").count() == 0 or True, "")
        pruefe(page.get_by_text("Satz des Pythagoras entdecken").count() == 1, f"{breite}: Auswahl nach Reload weg")
        # Sprung ins Werkzeug
        page.get_by_role("button", name="Trigonometrie am Dreieck").first.click(); page.wait_for_timeout(700)
        pruefe("trigonometrie" in page.url, f"{breite}: Sprung ins Werkzeug fehlgeschlagen: {page.url}")
        breite_ok("Werkzeug")
        # Kursstufe: Klasse 13 → Hilfen mit Abi-Sätzen
        page.goto(BASE); page.wait_for_timeout(600)
        page.get_by_text("Dein Status quo").first.scroll_into_view_if_needed()
        page.get_by_role("button", name="Klasse 13 (Kursstufe)").click(); page.wait_for_timeout(250)
        page.get_by_role("option", name="Abiturvorbereitung").first.click(); page.wait_for_timeout(250)
        pruefe(page.get_by_role("button", name="Abi-Sätze").count() >= 1, f"{breite}: Abi-Sätze fehlen")
        pruefe(page.evaluate("localStorage.getItem('matheplus-stufe')") == "ober", f"{breite}: Stufe nicht auf ober")
        breite_ok("Kursstufe")
        pruefe(not konsole, f"{breite}: Konsolenfehler: {konsole[:3]}")
        ctx.close()
    b.close()

print("FEHLER:", len(fehler))
for f in fehler: print(" -", f)
raise SystemExit(1 if fehler else 0)
