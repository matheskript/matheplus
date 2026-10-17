"""Browser-Test „Dein Training startet hier.“: zwei Modus-Knöpfe, aufklappbare Unterthemen,
Eine Sache trainieren (Aufgabenlauf) und Trainingsplan erstellen (Vorschau, Speichern, Planseite, Einheit starten).
Prüft bei 360, 390 und 1280 px: keine Seitenüberbreite, keine Konsolenfehler, Screenshots.
  npm run build && npx vite preview --port 4173 &   →   python3 tests/ui/kapiteltraining.ui.py
"""
import os, sys
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
AUS = os.environ.get("SCREENS", "/tmp/kt")
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

        sache = page.get_by_role("button", name="Eine Sache üben", exact=True)
        plan = page.get_by_role("button", name="Trainingsplan", exact=True)
        pruefe(sache.count() == 1 and plan.count() == 1, f"{breite}: Modus-Knöpfe fehlen")
        pruefe(sache.get_attribute("aria-pressed") == "true", f"{breite}: „Eine Sache üben“ nicht vorgewählt")
        pruefe(page.get_by_role("button", name="Mein Training öffnen").count() == 0, f"{breite}: alter Knopf noch da")
        sache.scroll_into_view_if_needed()
        page.get_by_role("button", name="G9").first.click(); page.wait_for_timeout(150)
        page.get_by_role("button", name="Klasse 10", exact=True).click(); page.wait_for_timeout(300)
        breite_ok("Kapitelliste")
        page.screenshot(path=f"{AUS}/{breite}-1-modi.png")

        # Pfeil bei Trigonometrie: Unterthemen klappen auf, die anderen Kapitel bleiben sichtbar
        pfeil = page.get_by_role("button", name="Unterthemen zeigen: Trigonometrie im Dreieck")
        pruefe(pfeil.count() == 1, f"{breite}: Pfeil bei Trigonometrie fehlt")
        pfeil.click(); page.wait_for_timeout(250)
        pruefe(page.get_by_role("button", name="Seiten berechnen").count() == 1, f"{breite}: Unterthema fehlt")
        pruefe(page.get_by_role("button", name="Exponentialfunktionen und Logarithmus", exact=False).count() >= 1, f"{breite}: restliche Kapitel verschwunden")
        breite_ok("Unterthemen")
        page.get_by_role("button", name="Seiten berechnen").scroll_into_view_if_needed()
        page.screenshot(path=f"{AUS}/{breite}-2-unterthemen.png")
        page.get_by_role("button", name="Seiten berechnen").click(); page.wait_for_timeout(300)
        pruefe(page.get_by_text("› Seiten berechnen").count() >= 1, f"{breite}: Auswahl nicht im Feld")
        jetzt = page.get_by_role("button", name="Jetzt trainieren ›")
        pruefe(jetzt.count() == 1, f"{breite}: „Jetzt trainieren“ fehlt")
        pruefe(page.get_by_text("Dafür hilft dir in der App").count() == 1, f"{breite}: Hilfen fehlen")
        jetzt.scroll_into_view_if_needed()
        page.screenshot(path=f"{AUS}/{breite}-3-sache.png")
        jetzt.click(); page.wait_for_timeout(700)
        pruefe("/trainieren" in page.url, f"{breite}: Adresse {page.url}")
        pruefe(page.get_by_role("heading", name="Seiten berechnen").count() >= 1, f"{breite}: Trainingsseite ohne Titel")
        pruefe(page.get_by_role("button", name="Prüfen").count() >= 1, f"{breite}: kein Aufgabenlauf")
        breite_ok("Eine Sache trainieren")
        page.screenshot(path=f"{AUS}/{breite}-4-lauf.png")

        # zurück, Plan-Modus
        page.go_back(); page.wait_for_timeout(700)
        page.get_by_role("button", name="Trainingsplan", exact=True).click(); page.wait_for_timeout(300)
        pruefe(page.get_by_role("button", name="Trainingsplan", exact=True).get_attribute("aria-pressed") == "true", f"{breite}: Plan-Modus nicht aktiv")
        speichern = page.get_by_role("button", name="Plan speichern und starten ›")
        pruefe(speichern.count() == 1, f"{breite}: Planvorschau fehlt")
        for wort in ("Warm-up", "Basis-Check", "Kerntraining", "Wiederholen"):
            pruefe(page.get_by_text(wort, exact=True).count() >= 1, f"{breite}: Phase {wort} fehlt in der Vorschau")
        breite_ok("Planvorschau")
        page.get_by_text("Dein Trainingsplan", exact=True).first.scroll_into_view_if_needed()
        page.screenshot(path=f"{AUS}/{breite}-5-vorschau.png")
        # Klassenarbeit in 5 Tagen
        page.evaluate("""() => { const i = document.querySelector('input[type=date]'); const d = new Date(); d.setDate(d.getDate() + 5);
          const s = d.toISOString().slice(0, 10); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(i, s); i.dispatchEvent(new Event('input', { bubbles: true })); }""")
        page.wait_for_timeout(250)
        pruefe(page.get_by_text("Generalprobe", exact=True).count() >= 1, f"{breite}: Generalprobe fehlt mit Termin")
        speichern.click(); page.wait_for_timeout(700)
        pruefe("/trainingsplan" in page.url, f"{breite}: Adresse {page.url}")
        pruefe(page.get_by_text("Einheiten erledigt").count() == 1, f"{breite}: Planseite ohne Stand")
        breite_ok("Planseite")
        page.screenshot(path=f"{AUS}/{breite}-6-plan.png", full_page=True)
        page.get_by_role("button", name="Jetzt: Warm-up").click(); page.wait_for_timeout(600)
        pruefe(page.get_by_role("button", name="Prüfen").count() >= 1, f"{breite}: Warm-up startet nicht")
        breite_ok("Einheit")

        # Startseite im Plan-Modus zeigt den aktiven Plan
        page.goto(BASE); page.wait_for_timeout(800)
        pruefe(page.get_by_text("Dein Trainingsplan · 0/").count() == 1, f"{breite}: aktiver Plan fehlt auf der Startseite")
        breite_ok("Startseite mit Plan")

        # Direktlinks
        for pfad in ("trainingsplan", "trainieren"):
            page.goto(BASE + pfad); page.wait_for_timeout(700); breite_ok(pfad)
        pruefe(not konsole, f"{breite}: Konsole: {konsole[:3]}")
        ctx.close()
    b.close()

print("OK" if not fehler else f"{len(fehler)} Fehler")
sys.exit(1 if fehler else 0)
