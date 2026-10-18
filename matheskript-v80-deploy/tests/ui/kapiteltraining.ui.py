"""Browser-Test „Dein Training startet hier.“: Kapitel-Menü, „5 Aufgaben zum Kapitel“, „Trainingsplan zu diesem Kapitel“ mit Häkchen,
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

        page.get_by_role("heading", name="Dein Training startet hier.").scroll_into_view_if_needed()
        pruefe(page.get_by_role("button", name="Eine Sache üben", exact=True).count() == 0, f"{breite}: Modus-Knopf noch da")
        page.get_by_role("button", name="G9").first.click(); page.wait_for_timeout(150)
        page.get_by_role("button", name="Klasse 10", exact=True).click(); page.wait_for_timeout(300)
        breite_ok("Kapitelliste")
        page.screenshot(path=f"{AUS}/{breite}-1-kapitel.png")

        # Kapitel antippen: Werkzeuge klappen auf, die anderen Kapitel bleiben sichtbar
        page.get_by_role("button", name="Trigonometrie im Dreieck").first.click(); page.wait_for_timeout(300)
        jetzt = page.get_by_role("button", name="5 Aufgaben zum Kapitel")
        pruefe(jetzt.count() == 1, f"{breite}: „5 Aufgaben zum Kapitel“ fehlt")
        pruefe(page.get_by_role("button", name="Exponentialfunktionen und Logarithmus", exact=False).count() >= 1, f"{breite}: restliche Kapitel verschwunden")
        breite_ok("Werkzeuge")
        jetzt.scroll_into_view_if_needed()
        page.screenshot(path=f"{AUS}/{breite}-2-werkzeuge.png")
        jetzt.click(); page.wait_for_timeout(700)
        pruefe("/trainieren" in page.url, f"{breite}: Adresse {page.url}")
        pruefe(page.get_by_role("heading", name="Trigonometrie im Dreieck").count() >= 1, f"{breite}: Trainingsseite ohne Titel")
        pruefe(page.get_by_role("button", name="Prüfen").count() >= 1, f"{breite}: kein Aufgabenlauf")
        breite_ok("Eine Sache trainieren")
        page.screenshot(path=f"{AUS}/{breite}-4-lauf.png")

        # zurück, „Trainingsplan zu diesem Kapitel“: das ganze Kapitel ist vorab angehakt
        page.go_back(); page.wait_for_timeout(800)
        page.get_by_role("button", name="Trainingsplan zu diesem Kapitel").click(); page.wait_for_timeout(400)
        pruefe(page.get_by_text("5 Unterthemen aus 1 Kapitel").count() == 1, f"{breite}: Kapitel nicht übernommen")
        trig = page.get_by_role("checkbox", name="Ganzes Kapitel abwählen: Trigonometrie im Dreieck")
        pruefe(trig.count() == 1 and trig.get_attribute("aria-checked") == "true", f"{breite}: Trigonometrie nicht ganz angehakt")
        page.get_by_role("checkbox", name="Sinussatz", exact=True).click(); page.wait_for_timeout(150)
        pruefe(page.get_by_text("4 Unterthemen aus 1 Kapitel").count() == 1, f"{breite}: Abwählen eines Unterthemas klappt nicht")
        # Exponentialfunktionen antippen → Unterthemen klappen auf
        page.get_by_role("button", name="Exponentialfunktionen und Logarithmus", exact=False).first.click(); page.wait_for_timeout(250)
        pruefe(page.get_by_role("checkbox", name="Logarithmus (mit Übungsaufgaben)", exact=True).count() == 1, f"{breite}: Unterthemen von Exponential klappen nicht auf")
        # ganzes Kapitel per Kästchen
        page.get_by_role("checkbox", name="Ganzes Kapitel anhaken: Exponentialfunktionen und Logarithmus").click(); page.wait_for_timeout(200)
        pruefe(page.get_by_text("9 Unterthemen aus 2 Kapiteln").count() == 1, f"{breite}: ganzes Kapitel nicht angehakt")
        page.get_by_role("checkbox", name="Halbwertszeit und Verdopplungszeit (mit Übungsaufgaben)", exact=True).click(); page.wait_for_timeout(150)
        pruefe(page.get_by_text("8 Unterthemen aus 2 Kapiteln").count() == 1, f"{breite}: Abwählen klappt nicht")
        breite_ok("Häkchen-Liste")
        page.get_by_role("checkbox", name="Logarithmus (mit Übungsaufgaben)", exact=True).scroll_into_view_if_needed()
        page.screenshot(path=f"{AUS}/{breite}-5a-haekchen.png")
        # „Zurück zu den Kapiteln“ und wieder hin: Auswahl bleibt
        page.get_by_role("button", name="Zurück zu den Kapiteln").click(); page.wait_for_timeout(300)
        pruefe(page.get_by_role("button", name="5 Aufgaben zum Kapitel").count() == 1, f"{breite}: Zurück zu den Kapiteln klappt nicht")
        page.get_by_role("button", name="Trainingsplan zu diesem Kapitel").click(); page.wait_for_timeout(300)
        pruefe(page.get_by_text("9 Unterthemen aus 2 Kapiteln").count() == 1, f"{breite}: Auswahl nach Zurück nicht erhalten")
        page.get_by_role("button", name="Exponentialfunktionen und Logarithmus", exact=False).first.click(); page.wait_for_timeout(250)
        page.get_by_role("checkbox", name="Halbwertszeit und Verdopplungszeit (mit Übungsaufgaben)", exact=True).click(); page.wait_for_timeout(150)

        speichern = page.get_by_role("button", name="Plan speichern und starten ›")
        pruefe(speichern.count() == 1, f"{breite}: Planvorschau fehlt")
        pruefe(page.get_by_text("2 Themen in einem Plan").count() == 1, f"{breite}: Plan nicht für 2 Themen")
        for wort in ("Warm-up", "Basis-Check", "Kerntraining", "Wiederholen"):
            pruefe(page.get_by_text(wort, exact=True).count() >= 1, f"{breite}: Phase {wort} fehlt in der Vorschau")
        # Vorbereitung abwählen: Warm-up raus
        wu = page.get_by_role("checkbox", name="Warm-up", exact=False).first
        pruefe(wu.get_attribute("aria-checked") == "true", f"{breite}: Warm-up nicht vorgeschlagen")
        wu.click(); page.wait_for_timeout(200)
        pruefe(wu.get_attribute("aria-checked") == "false", f"{breite}: Warm-up nicht abwählbar")
        breite_ok("Planvorschau")
        page.get_by_text("Dein Trainingsplan", exact=True).first.scroll_into_view_if_needed()
        page.screenshot(path=f"{AUS}/{breite}-5-vorschau.png")
        page.get_by_text("Vorbereitung – schlage ich dir vor").scroll_into_view_if_needed()
        page.screenshot(path=f"{AUS}/{breite}-5b-vorbereitung.png")
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
        pruefe(page.get_by_text("Warm-up", exact=True).count() == 0, f"{breite}: abgewähltes Warm-up steht im Plan")
        pruefe(page.get_by_text("Trigonometrie im Dreieck", exact=True).count() >= 1 and page.get_by_text("Exponentialfunktionen und Logarithmus", exact=True).count() >= 1, f"{breite}: Kerntrainings fehlen")
        page.get_by_role("button", name="Jetzt:", exact=False).first.click(); page.wait_for_timeout(600)
        pruefe(page.get_by_role("button", name="Prüfen").count() >= 1 or page.get_by_text("Erledigt ✓").count() >= 1, f"{breite}: erste Einheit startet nicht")
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
