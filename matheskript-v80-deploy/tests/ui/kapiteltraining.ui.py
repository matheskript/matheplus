"""Browser-Test „Dein Training startet hier.“: Kapitel-Menü, „5 Aufgaben zum Kapitel“, „Trainingsplan zu diesem Kapitel“ mit Häkchen,
Eine Sache trainieren (Aufgabenlauf) und die Übernahme ins Mathe-Training (Themen, Basis-Checks, Klassenarbeit, Seite).
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
        if page.get_by_role("button", name="Dein Training aufklappen").count(): page.get_by_role("button", name="Dein Training aufklappen").click(); page.wait_for_timeout(200)
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

        # zurück, „Trainingsplan zu diesem Kapitel“: das ganze Kapitel ist vorab angehakt (nur am Desktop – am Handy gibt es den Anhak-Plan nicht)
        page.go_back(); page.wait_for_timeout(800)
        if breite < 840:
            pruefe(page.get_by_role("button", name="Trainingsplan zu diesem Kapitel").count() == 0, f"{breite}: Plan-Eintrag am Handy")
            pruefe(page.get_by_role("button", name="5 Aufgaben zum Kapitel").count() == 1, f"{breite}: Kapitel nach Zurück nicht mehr offen")
            page.get_by_role("tab", name="Plan").click(); page.wait_for_timeout(250)
            pruefe(page.get_by_text("Noch kein Plan.").count() == 1, f"{breite}: Plan-Hinweis am Handy fehlt")
            breite_ok("Plan am Handy")
            pruefe(not konsole, f"{breite}: Konsole: {konsole[:3]}")
            ctx.close()
            continue
        page.get_by_role("button", name="Trainingsplan zu diesem Kapitel").click(); page.wait_for_timeout(400)
        pruefe(page.get_by_role("tab", name="Plan").get_attribute("aria-selected") == "true", f"{breite}: Anhak-Plan nicht im Bereich Plan")
        pruefe(page.get_by_text("6 Unterthemen aus 1 Kapitel").count() == 1, f"{breite}: Kapitel nicht übernommen")
        trig = page.get_by_role("checkbox", name="Ganzes Kapitel abwählen: Trigonometrie im Dreieck")
        pruefe(trig.count() == 1 and trig.get_attribute("aria-checked") == "true", f"{breite}: Trigonometrie nicht ganz angehakt")
        page.get_by_role("checkbox", name="Sinussatz", exact=True).click(); page.wait_for_timeout(150)
        pruefe(page.get_by_text("5 Unterthemen aus 1 Kapitel").count() == 1, f"{breite}: Abwählen eines Unterthemas klappt nicht")
        # Exponentialfunktionen antippen → Unterthemen klappen auf
        page.get_by_role("button", name="Exponentialfunktionen und Logarithmus", exact=False).first.click(); page.wait_for_timeout(250)
        pruefe(page.get_by_role("checkbox", name="Logarithmus (mit Übungsaufgaben)", exact=True).count() == 1, f"{breite}: Unterthemen von Exponential klappen nicht auf")
        # ganzes Kapitel per Kästchen
        page.get_by_role("checkbox", name="Ganzes Kapitel anhaken: Exponentialfunktionen und Logarithmus").click(); page.wait_for_timeout(200)
        pruefe(page.get_by_text("10 Unterthemen aus 2 Kapiteln").count() == 1, f"{breite}: ganzes Kapitel nicht angehakt")
        page.get_by_role("checkbox", name="Halbwertszeit und Verdopplungszeit (mit Übungsaufgaben)", exact=True).click(); page.wait_for_timeout(150)
        pruefe(page.get_by_text("9 Unterthemen aus 2 Kapiteln").count() == 1, f"{breite}: Abwählen klappt nicht")
        breite_ok("Häkchen-Liste")
        page.get_by_role("checkbox", name="Logarithmus (mit Übungsaufgaben)", exact=True).scroll_into_view_if_needed()
        page.screenshot(path=f"{AUS}/{breite}-5a-haekchen.png")
        # „Zurück zu den Kapiteln“ und wieder hin: Auswahl bleibt
        page.get_by_role("button", name="Zurück zu den Kapiteln").click(); page.wait_for_timeout(300)
        pruefe(page.get_by_role("tab", name="Thema").get_attribute("aria-selected") == "true", f"{breite}: Zurück führt nicht in den Bereich Thema")
        pruefe(page.get_by_role("button", name="5 Aufgaben zum Kapitel").count() == 1, f"{breite}: Zurück zu den Kapiteln klappt nicht")
        page.get_by_role("button", name="Trainingsplan zu diesem Kapitel").click(); page.wait_for_timeout(300)
        pruefe(page.get_by_text("10 Unterthemen aus 2 Kapiteln").count() == 1, f"{breite}: Auswahl nach Zurück nicht erhalten")
        page.get_by_role("button", name="Exponentialfunktionen und Logarithmus", exact=False).first.click(); page.wait_for_timeout(250)
        page.get_by_role("checkbox", name="Halbwertszeit und Verdopplungszeit (mit Übungsaufgaben)", exact=True).click(); page.wait_for_timeout(150)

        uebernehmen = page.get_by_role("button", name="Ins Mathe-Training übernehmen ›")
        pruefe(uebernehmen.count() == 1, f"{breite}: Übernahme-Karte fehlt")
        pruefe(page.get_by_text("2 Themen ins Training").count() == 1, f"{breite}: Karte nicht für 2 Themen")
        pruefe(page.get_by_text("Basis-Checks davor – schlage ich dir vor").count() == 1, f"{breite}: Basis-Checks fehlen")
        bc = page.locator("[role=checkbox][aria-label^='Basis-Check:']").first
        pruefe(bc.count() == 1 and bc.get_attribute("aria-checked") == "true", f"{breite}: Basis-Check nicht vorgeschlagen")
        bc.click(); page.wait_for_timeout(200)
        pruefe(bc.get_attribute("aria-checked") == "false", f"{breite}: Basis-Check nicht abwählbar")
        breite_ok("Übernahme-Karte")
        page.get_by_text("Deine Themen", exact=True).first.scroll_into_view_if_needed()
        page.screenshot(path=f"{AUS}/{breite}-5-vorschau.png")
        # Klassenarbeit in 5 Tagen
        page.evaluate("""() => { const i = document.querySelector('input[type=date]'); const d = new Date(); d.setDate(d.getDate() + 5);
          const s = d.toISOString().slice(0, 10); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(i, s); i.dispatchEvent(new Event('input', { bubbles: true })); }""")
        page.wait_for_timeout(250)
        uebernehmen.click(); page.wait_for_timeout(900)
        pruefe("/mein-mathe-training" in page.url, f"{breite}: Adresse {page.url}")
        lern = page.evaluate("JSON.parse(localStorage.getItem('matheskript-lernstand-v1') || 'null')")
        mt = lern and lern.get("training") and lern["training"].get("meinTraining")
        ids = sorted(t["id"] for t in (mt["aktiv"] if mt else []))
        pruefe(ids == ["explog", "trig"], f"{breite}: Themen nicht übernommen ({ids})")
        trigT = next((t for t in mt["aktiv"] if t["id"] == "trig"), None) if mt else None
        pruefe(bool(trigT) and len(trigT["teile"]) == 6, f"{breite}: Trigonometrie nicht als ganzes Kapitel übernommen")
        arbeiten = (lern["training"].get("ebbinghaus") or {}).get("arbeiten", [])
        pruefe(len(arbeiten) == 1, f"{breite}: Klassenarbeit nicht eingetragen")
        breite_ok("Trainingsseite")
        page.screenshot(path=f"{AUS}/{breite}-6-training.png", full_page=True)

        # Startseite: Bereich Plan zeigt den Link zum Training mit beiden Themen
        page.goto(BASE); page.wait_for_timeout(800)
        if page.get_by_role("button", name="Dein Training aufklappen").count(): page.get_by_role("button", name="Dein Training aufklappen").click(); page.wait_for_timeout(200)
        page.get_by_role("tab", name="Plan").click(); page.wait_for_timeout(250)
        pruefe(page.get_by_text("Mein Mathe-Training · 2 von 3 Themen").count() == 1, f"{breite}: Trainings-Link fehlt auf der Startseite")
        breite_ok("Startseite mit Training")

        # Direktlinks
        for pfad in ("mein-mathe-training", "trainieren"):
            page.goto(BASE + pfad); page.wait_for_timeout(700); breite_ok(pfad)
        pruefe(not konsole, f"{breite}: Konsole: {konsole[:3]}")
        ctx.close()
    b.close()

print("OK" if not fehler else f"{len(fehler)} Fehler")
sys.exit(1 if fehler else 0)
