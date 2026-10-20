"""Browser-Test Hauptthema in „Dein Training startet hier.“:
Kapitel aufklappen → „Als mein Hauptthema wählen“ mit Klassenarbeits-Datum → Hauptthema-Ansicht im Bereich Thema (Countdown,
Unterthemen mit Stand, Vorwissen), Bereich Plan („Heute dran“ startet die Einheit direkt), Bereich Tools (Werkzeuge) → zurück → Datum ändern →
Thema wechseln (Kapitelliste, anderes Kapitel wählen) → Arbeit vorbei (Note, nächstes Kapitel) → beenden.
Prüft bei 360, 390 und 1280 px: keine Seitenüberbreite, keine Konsolenfehler, Screenshots.
  npm run build && npx vite preview --port 4173 &   →   python3 tests/ui/hauptthema.ui.py
"""
import os, json, datetime
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
AUS = os.environ.get("SCREENS", "/tmp/ht")
os.makedirs(AUS, exist_ok=True)
fehler = []
heute = datetime.date.today()
termin = (heute + datetime.timedelta(days=17)).isoformat()
termin2 = (heute + datetime.timedelta(days=24)).isoformat()

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
        page.get_by_role("button", name="G9").first.click(); page.wait_for_timeout(150)
        page.get_by_role("button", name="Klasse 9", exact=True).click(); page.wait_for_timeout(300)

        # 1 · Kapitel aufklappen: Wahl-Box steht oben
        page.get_by_role("button", name="Quadratische Funktionen und Gleichungen").first.click(); page.wait_for_timeout(300)
        wahl = page.get_by_role("button", name="Als mein Hauptthema wählen ›")
        pruefe(wahl.count() == 1, f"{breite}: Knopf „Als mein Hauptthema wählen“ fehlt")
        pruefe(page.get_by_text("Oder direkt loslegen").count() == 1, f"{breite}: „Oder direkt loslegen“ fehlt")
        page.get_by_label("Datum der Klassenarbeit (optional)").fill(termin)
        page.get_by_text("Dein aktuelles Thema?").scroll_into_view_if_needed()
        breite_ok("Wahl-Box")
        page.screenshot(path=f"{AUS}/{breite}-1-wahl.png")
        wahl.click(); page.wait_for_timeout(500)

        # 2 · Hauptthema-Ansicht
        ansicht = page.locator("[data-hauptthema='quad']")
        pruefe(ansicht.count() == 1, f"{breite}: Hauptthema-Ansicht fehlt")
        pruefe(page.get_by_text("Dein Hauptthema").count() >= 1, f"{breite}: Kicker fehlt")
        pruefe(page.get_by_text("17").first.count() >= 1 and page.get_by_text("Tage", exact=True).count() >= 1, f"{breite}: Countdown fehlt")
        pruefe(page.get_by_role("tab", name="Thema").get_attribute("aria-selected") == "true", f"{breite}: nach der Wahl nicht im Bereich Thema")
        pruefe(page.get_by_text("Heute dran").count() == 0, f"{breite}: „Heute dran“ schon im Bereich Thema")
        pruefe(page.get_by_text("Unterthemen · Dein Stand").count() == 1, f"{breite}: Unterthemen fehlen")
        pruefe(page.get_by_role("button", name="Scheitelpunktform").count() >= 1, f"{breite}: Unterthema Scheitelpunktform fehlt")
        pruefe(page.get_by_text("Alles zu diesem Kapitel").count() == 0, f"{breite}: Werkzeuge schon im Bereich Thema")
        pruefe(page.get_by_text("Dafür brauchst du sicher").count() == 1, f"{breite}: Vorwissen fehlt")
        pruefe(page.get_by_role("button", name="Bruchterme und Bruchgleichungen").count() == 0, f"{breite}: Kapitelliste trotz Hauptthema sichtbar")
        pruefe(page.get_by_text("Dein Trainingsplan ·").count() == 0, f"{breite}: Plan-Karte doppelt")
        plan = page.evaluate("JSON.parse(localStorage.getItem('matheplus-trainingsplan'))")
        qf = page.evaluate("JSON.parse(localStorage.getItem('matheplus-quickfinder'))")
        pruefe(plan and plan["plan"]["termin"] == termin, f"{breite}: Plan ohne Termin")
        pruefe(qf and qf["haupt"]["kapitel"] == "quad" and qf["haupt"]["planId"] == plan["plan"]["id"], f"{breite}: Hauptthema nicht gespeichert")
        breite_ok("Hauptthema")
        ansicht.scroll_into_view_if_needed()
        page.screenshot(path=f"{AUS}/{breite}-2-hauptthema.png", full_page=True)
        # Bereich Tools: alle Werkzeuge zum Kapitel, darunter die anderen Kapitel nur mit Werkzeugen
        page.get_by_role("tab", name="Tools").click(); page.wait_for_timeout(250)
        pruefe(page.get_by_text("Alles zu diesem Kapitel").count() == 1, f"{breite}: Werkzeuge fehlen im Bereich Tools")
        pruefe(page.get_by_text("Werkzeuge anderer Kapitel").count() == 1, f"{breite}: andere Kapitel fehlen im Bereich Tools")
        pruefe(page.get_by_role("button", name="Quadratische Funktionen und Gleichungen").count() == 0, f"{breite}: Hauptthema doppelt im Bereich Tools")
        breite_ok("Tools")
        page.screenshot(path=f"{AUS}/{breite}-2b-tools.png", full_page=True)
        # Bereich Plan: „Heute dran“
        page.get_by_role("tab", name="Plan").click(); page.wait_for_timeout(250)
        pruefe(page.get_by_text("Heute dran").count() >= 1, f"{breite}: „Heute dran“ fehlt im Bereich Plan")
        pruefe(page.get_by_text("Unterthemen · Dein Stand").count() == 0, f"{breite}: Unterthemen im Bereich Plan")
        breite_ok("Plan")
        page.screenshot(path=f"{AUS}/{breite}-2c-plan.png")

        # 3 · Heute dran → Einheit läuft sofort
        page.locator("[data-hauptthema] button.ht-gold").first.click(); page.wait_for_timeout(900)
        pruefe("/trainingsplan" in page.url, f"{breite}: Heute dran → Adresse {page.url}")
        pruefe(page.get_by_role("button", name="‹ Zurück zum Plan").count() == 1, f"{breite}: Einheit startet nicht direkt")
        page.screenshot(path=f"{AUS}/{breite}-3-einheit.png")
        page.go_back(); page.wait_for_timeout(900)
        pruefe(page.locator("[data-hauptthema='quad']").count() == 1, f"{breite}: nach Zurück kein Hauptthema")
        pruefe(page.get_by_role("tab", name="Plan").get_attribute("aria-selected") == "true", f"{breite}: Bereich Plan nach Zurück nicht gemerkt")
        page.get_by_role("tab", name="Thema").click(); page.wait_for_timeout(250)

        # 4 · Datum ändern: Plan neu, Hauptthema bleibt
        if breite >= 840: page.get_by_role("button", name="Datum ändern").click()
        else: page.get_by_role("button", name="Datum der Klassenarbeit ändern").click()
        page.wait_for_timeout(200)
        page.locator("[data-hauptthema] input[type=date]").fill(termin2)
        page.get_by_role("button", name="Übernehmen").click(); page.wait_for_timeout(300)
        plan2 = page.evaluate("JSON.parse(localStorage.getItem('matheplus-trainingsplan'))")
        qf2 = page.evaluate("JSON.parse(localStorage.getItem('matheplus-quickfinder'))")
        pruefe(plan2["plan"]["termin"] == termin2 and qf2["haupt"]["planId"] == plan2["plan"]["id"], f"{breite}: Datum ändern klappt nicht")
        pruefe(page.get_by_text("24").first.count() >= 1, f"{breite}: Countdown nicht aktualisiert")

        # 5 · Thema wechseln: kompakte Leiste + Kapitelliste, anderes Kapitel wählen
        page.get_by_role("button", name="Thema wechseln").first.click(); page.wait_for_timeout(300)
        pruefe(page.get_by_role("button", name="Zurück dazu").count() == 1, f"{breite}: Leiste fehlt")
        page.get_by_role("button", name="Quadratische Funktionen und Gleichungen").first.scroll_into_view_if_needed()
        pruefe(page.get_by_text("Das ist dein Hauptthema").count() == 1, f"{breite}: aktuelles Kapitel nicht markiert")
        page.get_by_role("button", name="Satz des Pythagoras").first.click(); page.wait_for_timeout(300)
        pruefe(page.get_by_text("Es ersetzt").count() == 1, f"{breite}: Ersetzen-Hinweis fehlt")
        breite_ok("Thema wechseln")
        page.get_by_text("Dein aktuelles Thema?").scroll_into_view_if_needed()
        page.screenshot(path=f"{AUS}/{breite}-4-wechseln.png")
        page.get_by_role("button", name="Als mein Hauptthema wählen ›").click(); page.wait_for_timeout(400)
        pruefe(page.locator("[data-hauptthema='pythagoras']").count() == 1, f"{breite}: Wechsel auf Pythagoras klappt nicht")
        pruefe(page.get_by_text("Noch kein Datum").count() == 1, f"{breite}: ohne Datum falsch beschriftet")

        # 6 · Arbeit vorbei: Note, nächstes Kapitel
        page.evaluate("""() => { const v = JSON.parse(localStorage.getItem('matheplus-quickfinder'));
          v.haupt.termin = '2026-01-10'; v.haupt.seit = '2026-01-01'; localStorage.setItem('matheplus-quickfinder', JSON.stringify(v)); }""")
        page.reload(); page.wait_for_timeout(900)
        pruefe(page.get_by_text("Die Arbeit ist geschrieben").count() == 1, f"{breite}: Nach-der-Arbeit-Box fehlt")
        page.get_by_role("group", name="Note der Klassenarbeit").get_by_role("button", name="2").click(); page.wait_for_timeout(200)
        pruefe(page.get_by_text("Notiert: Note 2.").count() == 1, f"{breite}: Note nicht gespeichert")
        page.get_by_text("Die Arbeit ist geschrieben").scroll_into_view_if_needed()
        breite_ok("Nach der Arbeit")
        page.screenshot(path=f"{AUS}/{breite}-5-vorbei.png")
        naechstes = page.get_by_text("Nächstes Kapitel als Hauptthema")
        pruefe(naechstes.count() == 1, f"{breite}: nächstes Kapitel fehlt")
        naechstes.click(); page.wait_for_timeout(400)
        pruefe(page.locator("[data-hauptthema='wkt2']").count() == 1, f"{breite}: nächstes Kapitel nicht übernommen")

        # 7 · Beenden: zurück zur Kapitelliste
        page.get_by_role("button", name="Thema wechseln").first.click(); page.wait_for_timeout(200)
        page.get_by_role("button", name="Beenden").click(); page.wait_for_timeout(300)
        pruefe(page.locator("[data-hauptthema]").count() == 0, f"{breite}: Beenden klappt nicht")
        pruefe(page.get_by_role("button", name="Bruchterme und Bruchgleichungen").count() >= 1, f"{breite}: Kapitelliste fehlt nach Beenden")

        pruefe(not konsole, f"{breite}: Konsole: {konsole[:3]}")
        ctx.close()
    b.close()

print("OK" if not fehler else f"{len(fehler)} Fehler")
raise SystemExit(1 if fehler else 0)
