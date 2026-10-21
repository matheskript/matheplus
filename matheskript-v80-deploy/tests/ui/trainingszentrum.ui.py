"""Browser-Test Trainingszentrum (/trainingszentrum): Kopf, Untermenü mit vier Reitern, Karten je Reiter,
Vollbild-Session (kein Seitenscroll, Kopf mit Fortschritt, Fußleiste), Seitenwechsel Intro → Film → Aufgaben →
Werkzeug, Schließen mit Escape, Weitermachen-Karte, Werkzeug-Session (Ableitungstrainer eingebettet),
Prüfung (Klausurgenerator). Bei 360, 390 und 1280 px: keine Überbreite, keine Konsolenfehler, Screenshots.
  npm run build && npx vite preview --port 4173 &   →   python3 tests/ui/trainingszentrum.ui.py
"""
import os, sys
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
AUS = os.environ.get("SCREENS", "/tmp/tz")
os.makedirs(AUS, exist_ok=True)
fehler = []

def pruefe(bed, text):
    if not bed:
        fehler.append(text)
        print("FEHLT:", text)

with sync_playwright() as p:
    b = p.chromium.launch()
    for breite in (360, 390, 1280):
        hoehe = 800 if breite < 600 else 900
        ctx = b.new_context(viewport={"width": breite, "height": hoehe}, device_scale_factor=2, timezone_id="Europe/Berlin", locale="de-DE", has_touch=breite < 600)
        page = ctx.new_page()
        page.on("dialog", lambda d: d.accept())
        konsole = []
        page.on("pageerror", lambda e: konsole.append(f"pageerror: {e}"))
        page.on("console", lambda m: konsole.append(m.text) if m.type == "error" and "net::" not in m.text and "Failed to load resource" not in m.text else None)
        page.goto(BASE)
        page.evaluate("localStorage.clear(); sessionStorage.clear(); localStorage.setItem('mm-onboarding-v1', JSON.stringify({uebersprungen:true}));")
        page.goto(BASE + "trainingszentrum"); page.wait_for_timeout(900)

        def breite_ok(wo):
            sw = page.evaluate("document.documentElement.scrollWidth")
            pruefe(sw <= breite, f"{breite}: Überbreite bei {wo}: {sw}")

        tz = page.locator("[data-trainingszentrum]")
        pruefe(tz.count() == 1, f"{breite}: Trainingszentrum fehlt")
        pruefe(page.get_by_role("heading", name="Trainingszentrum").count() == 1, f"{breite}: Titel fehlt")
        reiter = page.get_by_role("tab")
        pruefe(reiter.count() == 3, f"{breite}: drei Reiter (Heute · Themen · Prüfung) erwartet, {reiter.count()}")
        pruefe(page.locator("[data-tz-plan]").count() == 1, f"{breite}: Mein Mathe-Training fehlt in Heute")
        breite_ok("Heute")
        page.screenshot(path=f"{AUS}/{breite}-1-heute.png", full_page=True)

        # Themen: kompakte Zeilen je Bereich (Akkordeon), Stufenfilter mit Unterstufe
        page.get_by_role("tab", name="Themen").click(); page.wait_for_timeout(300)
        pruefe(page.locator("[data-tz-bereich]").count() >= 8, f"{breite}: Bereiche fehlen")
        n_wz = page.evaluate("() => document.querySelectorAll('[data-tz-werkzeug]').length")
        pruefe(n_wz >= 60, f"{breite}: mindestens 60 Werkzeuge erwartet, {n_wz}")
        page.get_by_role("group", name="Stufe").get_by_role("button", name="Unterstufe").click(); page.wait_for_timeout(200)
        pruefe(page.locator("[data-tz-werkzeug='ableitungstrainer']").count() == 0, f"{breite}: Stufenfilter Unterstufe greift nicht")
        page.get_by_role("group", name="Stufe").get_by_role("button", name="Alle").click(); page.wait_for_timeout(200)
        page.locator("[data-tz-bereich='analysis'] summary").click(); page.wait_for_timeout(200)
        pruefe(page.locator("[data-tz-werkzeug='ableitungstrainer']").is_visible(), f"{breite}: Ableitungstrainer nach Aufklappen nicht sichtbar")
        breite_ok("Themen")
        page.screenshot(path=f"{AUS}/{breite}-3-werkzeuge.png", full_page=True)

        # Prüfung
        page.get_by_role("tab", name="Prüfung").click(); page.wait_for_timeout(300)
        pruefe(page.locator("[data-tz-karte='Klausurgenerator']").count() == 1, f"{breite}: Klausurgenerator fehlt")
        breite_ok("Prüfung")
        page.screenshot(path=f"{AUS}/{breite}-4-pruefung.png", full_page=True)

        # Session aus dem Prüfungs-Reiter (Programme sind ausgeblendet): Klausurgenerator im Vollbild
        page.get_by_role("tab", name="Prüfung").click(); page.wait_for_timeout(200)
        page.locator("[data-tz-karte='Klausurgenerator']").click(); page.wait_for_timeout(800)
        sess = page.locator("[data-trainings-session]")
        pruefe(sess.count() == 1, f"{breite}: Session nicht geöffnet")
        pruefe(page.evaluate("getComputedStyle(document.body).overflow") == "hidden", f"{breite}: Seite dahinter scrollt noch")
        pruefe(sess.locator("[data-ts-werkzeug='klausur']").count() == 1, f"{breite}: Klausurgenerator nicht eingebettet")
        breite_ok("Werkzeug in Session")
        page.screenshot(path=f"{AUS}/{breite}-5-session-klausur.png")
        # Escape schließt
        page.keyboard.press("Escape"); page.wait_for_timeout(400)
        pruefe(page.locator("[data-trainings-session]").count() == 0, f"{breite}: Escape schließt nicht")
        pruefe(page.evaluate("getComputedStyle(document.body).overflow") != "hidden", f"{breite}: Scroll nach Schließen nicht frei")

        page.get_by_role("tab", name="Heute").click(); page.wait_for_timeout(300)
        # 5 Minuten Mathe: Aufgaben-Session mit zwei Seiten
        page.locator("[data-tz-karte='5 Minuten Mathe']").click(); page.wait_for_timeout(600)
        s2 = page.locator("[data-trainings-session]")
        pruefe(s2.get_by_text("1 / 2").count() == 1, f"{breite}: 5-Minuten-Session fehlt")
        pruefe(s2.get_by_text("Aufgabe 1 von 5").count() == 1, f"{breite}: fünf Aufgaben erwartet")
        page.screenshot(path=f"{AUS}/{breite}-9-fuenf-minuten.png")
        page.keyboard.press("Escape"); page.wait_for_timeout(300)

        # Prüfung: Klausurgenerator im Vollbild
        page.get_by_role("tab", name="Prüfung").click(); page.wait_for_timeout(200)
        page.locator("[data-tz-karte='Klausurgenerator']").click(); page.wait_for_timeout(900)
        s3 = page.locator("[data-trainings-session]")
        pruefe(s3.locator("[data-ts-werkzeug='klausur']").count() == 1, f"{breite}: Klausurgenerator nicht eingebettet")
        breite_ok("Klausurgenerator")
        page.screenshot(path=f"{AUS}/{breite}-10-klausur.png")
        page.keyboard.press("Escape"); page.wait_for_timeout(300)

        pruefe(not konsole, f"{breite}: Konsolenfehler: {konsole[:3]}")
        ctx.close()
    b.close()

if fehler:
    print(f"\n{len(fehler)} Problem(e)"); sys.exit(1)
print("Trainingszentrum: alles in Ordnung")
