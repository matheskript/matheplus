"""Browser-Test Kachel „Dein Training startet hier.“ (Startseite): Schulsystem → Klasse → Chip „Kl. 9 (G9)“ mit Menü
Thema · Plan · Tools · Videos → Kapitel-Menü → Werkzeuge → Sprung.
Prüft bei 360, 390 und 1280 px: Balken auf Höhe der Überschrift (ab 600 px), 2 × 4 Klassen, keine Abi-Box,
keine Modus-Knöpfe, Chip und Menü in einer Zeile, jeder Bereich zeigt seinen Inhalt, keine Seitenüberbreite,
keine Konsolenfehler, Auswahl bleibt nach Reload, Screenshots.
  npm run build && npx vite preview --port 4173 &   →   python3 tests/ui/quickfinder.ui.py
"""
import os
from playwright.sync_api import sync_playwright
from startkarte_hilfe import schublade_auf

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

        schublade_auf(page)
        pruefe(page.get_by_role("button", name="Eine Sache üben").count() == 0, f"{breite}: Modus-Knopf noch da")
        pruefe(page.get_by_role("button", name="Abi-Training").count() == 0, f"{breite}: Abi-Box noch da")
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
        # Auswahl schrumpft auf den Chip „Kl. 9 (G9)“ ganz vorn, daneben das Menü; Klassen-Raster und Text verschwinden
        chip = page.get_by_role("button", name="Klasse 9 (G9) – ändern")
        pruefe(chip.count() == 1, f"{breite}: Chip fehlt")
        # seit dbb6dfc (20.10.): Klassen-Chip rechts und zweizeilig („Kl. 9“ / „G9“)
        pruefe([z.strip() for z in chip.inner_text().split("\n") if z.strip()] == ["Kl. 9", "G9"], f"{breite}: Chip-Text {chip.inner_text()!r}")
        pruefe(page.get_by_role("button", name="Schulsystem G9 – ändern").count() == 0, f"{breite}: alte Schulsystem-Box noch da")
        pruefe(page.get_by_role("button", name="Klasse 5/6").count() == 0, f"{breite}: Klassen-Raster noch sichtbar")
        pruefe(page.get_by_text("Wähle dein Schulsystem und deine Klasse").count() == 0, f"{breite}: Text noch sichtbar")
        tabs = page.get_by_role("tab")
        pruefe(tabs.count() == 4 and [t.inner_text() for t in tabs.all()] == ["Thema", "Plan", "Tools", "Videos"], f"{breite}: Menü falsch: {[t.inner_text() for t in tabs.all()]}")
        pruefe(page.get_by_role("tab", name="Thema").get_attribute("aria-selected") == "true", f"{breite}: Thema nicht gewählt")
        c = chip.bounding_box(); m = page.locator("[role=tablist]").bounding_box()
        pruefe(m["x"] + m["width"] <= c["x"] + 1 and abs(c["y"] - m["y"]) < 6 and c["height"] <= 40, f"{breite}: Chip und Menü nicht in einer Zeile ({c} / {m})")
        pruefe(c["x"] > m["x"], f"{breite}: Chip nicht rechts vom Menü")
        pruefe(page.get_by_text("Themen der Klasse").count() == 1, f"{breite}: Überschrift „Themen der Klasse“ fehlt")
        linie = page.evaluate("document.querySelector('.qf-kopf h2').nextElementSibling.getBoundingClientRect().bottom")
        leiste = page.evaluate("document.querySelector('.qf-leiste').getBoundingClientRect()")
        menue = page.evaluate("document.querySelector('.qf-menue').getBoundingClientRect().top")
        pruefe(leiste["top"] - linie < 30, f"{breite}: Leiste rutscht nicht unter die Goldlinie ({linie} / {leiste['top']})")
        pruefe(menue - leiste["bottom"] < 20, f"{breite}: Menü-Inhalt rutscht nicht unter die Leiste ({leiste['bottom']} / {menue})")
        page.screenshot(path=f"{AUS}/{breite}-2a-leiste.png")
        # Die vier Bereiche: Tools (Werkzeuge nach Kapitel), Videos (Videokurse zur Klasse), Plan (Hinweis), Thema (Kapitel)
        page.get_by_role("tab", name="Werkzeuge").click(); page.wait_for_timeout(250)
        pruefe(page.get_by_text("Werkzeuge nach Kapitel").count() == 1, f"{breite}: Tools-Bereich fehlt")
        pruefe(page.get_by_text("Themen der Klasse").count() == 0, f"{breite}: Kapitelliste im Tools-Bereich")
        page.get_by_role("button", name="Satz des Pythagoras").first.click(); page.wait_for_timeout(300)
        pruefe(page.get_by_text("Trainings-Werkzeuge zu diesem Kapitel").count() == 1, f"{breite}: Werkzeuge im Tools-Bereich fehlen")
        pruefe(page.get_by_text("Unterthemen – antippen und üben").count() == 0, f"{breite}: Unterthemen im Tools-Bereich")
        pruefe(page.get_by_role("button", name="Trainingsplan zu diesem Kapitel").count() == 0, f"{breite}: Plan-Eintrag im Tools-Bereich")
        pruefe(page.get_by_text("Als mein Hauptthema wählen").count() == 0, f"{breite}: Hauptthema-Wahl im Tools-Bereich")
        breite_ok("Tools")
        page.screenshot(path=f"{AUS}/{breite}-2b-tools.png")
        page.get_by_role("tab", name="Videos").click(); page.wait_for_timeout(250)
        pruefe(page.get_by_text("Videokurse für Klasse").count() == 1, f"{breite}: Videos-Bereich fehlt")
        vk = page.locator("[data-videokurs]")
        pruefe(vk.count() == 3 and page.locator("[data-videokurs='analysis1']").count() == 1 and page.locator("[data-videokurs='analysis4']").count() == 0, f"{breite}: Videokurse zu Klasse 9 falsch ({vk.count()})")
        pruefe(page.get_by_role("button", name="Alle Videokurse ansehen ›").count() == 1, f"{breite}: Link zu allen Videokursen fehlt")
        breite_ok("Videos")
        page.screenshot(path=f"{AUS}/{breite}-2c-videos.png")
        page.get_by_role("tab", name="Plan").click(); page.wait_for_timeout(250)
        pruefe(page.get_by_text("Noch kein Plan.").count() == 1, f"{breite}: Plan-Hinweis fehlt")
        pruefe(page.get_by_role("button", name="Themen selbst anhaken").count() == (1 if breite >= 840 else 0), f"{breite}: Anhaken-Knopf falsch")
        breite_ok("Plan")
        page.screenshot(path=f"{AUS}/{breite}-2d-plan.png")
        page.get_by_role("button", name="Kapitel wählen ›").click(); page.wait_for_timeout(250)
        pruefe(page.get_by_role("tab", name="Thema").get_attribute("aria-selected") == "true", f"{breite}: „Kapitel wählen“ führt nicht zu Thema")
        pruefe(page.get_by_text("Themen der Klasse").count() == 1, f"{breite}: Kapitelliste nach Zurück fehlt")
        pruefe(page.evaluate("localStorage.getItem('matheplus-start-stufe')") == "mittel", f"{breite}: Stufe nicht auf mittel")
        breite_ok("Kapitel")
        page.screenshot(path=f"{AUS}/{breite}-2-kapitel.png")
        page.get_by_role("button", name="Satz des Pythagoras").first.click(); page.wait_for_timeout(300)
        pruefe(page.get_by_text("Trainings-Werkzeuge zu diesem Kapitel").count() == 1, f"{breite}: Werkzeuge fehlen")
        pruefe(page.get_by_role("button", name="Satz des Pythagoras entdecken").count() == 1, f"{breite}: Pythagoras-Hilfe fehlt")
        pruefe(page.get_by_role("button", name="Trainingsplan zu diesem Kapitel").count() == (1 if breite >= 840 else 0), f"{breite}: Trainingsplan-Eintrag falsch")
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
        schublade_auf(page, auswahl=False)
        # gespeicherte Auswahl ist kompakt: antippen öffnet die Auswahl wieder
        page.get_by_role("button", name="Klasse 9 (G9) – ändern").click(); page.wait_for_timeout(250)
        pruefe(page.get_by_role("button", name="Klasse 5/6").count() == 1, f"{breite}: Auswahl öffnet nicht wieder")
        pruefe(page.get_by_role("tab").count() == 0, f"{breite}: Menü während der Auswahl sichtbar")
        page.get_by_role("button", name="Klasse 13", exact=True).click(); page.wait_for_timeout(300)
        pruefe(page.get_by_role("button", name="Klasse 13 (G9) – ändern").count() == 1, f"{breite}: Klasse 13 nicht übernommen")
        pruefe(page.get_by_role("tab").count() == 4, f"{breite}: Menü nach der Auswahl weg")
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
