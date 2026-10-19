"""Browser-Test: Übungen zu den Aufgaben der GFS-Seite Pascal’sches Dreieck
(Zeile bauen, Zwei Darstellungen, Ganz ausmultiplizieren, Dreieckszahlen, Begründen).
Löst jede Übung richtig über die angezeigten Daten und prüft die Rückmeldung; 360, 390 und 1280 px.
  npm run build && npx vite preview --port 4173 &   →   python3 tests/ui/gfsbuch.ui.py
"""
import os, re
from math import comb
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
AUS = os.environ.get("SCREENS", "/tmp/gfsbuch")
os.makedirs(AUS, exist_ok=True)
fehler = []
def pruefe(bed, text):
    if not bed: fehler.append(text); print("FEHLT:", text)

with sync_playwright() as p:
    b = p.chromium.launch()
    for breite in (360, 390, 1280):
        ctx = b.new_context(viewport={"width": breite, "height": 900}, device_scale_factor=2, locale="de-DE")
        page = ctx.new_page()
        konsole = []
        page.on("pageerror", lambda e: konsole.append(f"pageerror: {e}"))
        page.on("console", lambda m: konsole.append(m.text) if m.type == "error" and "net::" not in m.text and "Failed to load resource" not in m.text and "youtube" not in m.text.lower() else None)
        page.goto(BASE + "gfs-trainer/pascalsches-dreieck"); page.wait_for_timeout(1200)
        def breite_ok(wo):
            sw = page.evaluate("document.documentElement.scrollWidth"); pruefe(sw <= breite, f"{breite}: Überbreite bei {wo}: {sw}")
        karte = page.locator("[data-buchuebung]")
        pruefe(karte.count() == 1, f"{breite}: Übungskarte fehlt")
        def loesen_und_pruefen(name):
            page.get_by_role("button", name="Prüfen").last.click(); page.wait_for_timeout(250)
            pruefe(karte.get_by_text("Stimmt!").count() == 1, f"{breite}: {name} nicht als richtig erkannt")
            breite_ok(name); karte.scroll_into_view_if_needed()
            page.screenshot(path=f"{AUS}/{breite}-{name}.png")

        # Zeile bauen
        txt = karte.inner_text()
        n = int(re.search(r"Hier ist Zeile (\d+)", txt).group(1))
        for i, f in enumerate(karte.locator("input").all()): f.fill(str(comb(n + 1, i + 1)))
        loesen_und_pruefen("zeile")

        # Zwei Darstellungen (erst falsch, dann richtig)
        page.get_by_role("button", name="Zwei Darstellungen").click(); page.wait_for_timeout(200)
        m = re.search(r"In Zeile (\d+) kommt die Zahl (\d+) zweimal", karte.inner_text()); n, x = int(m.group(1)), int(m.group(2))
        ks = [k for k in range(n + 1) if comb(n, k) == x]
        karte.get_by_label("erste Stelle").fill(str(ks[0])); karte.get_by_label("zweite Stelle").fill(str(ks[0]))
        page.get_by_role("button", name="Prüfen").last.click(); page.wait_for_timeout(200)
        pruefe(karte.get_by_text("Zweimal dieselbe Stelle").count() == 1, f"{breite}: Hinweis gleiche Stelle fehlt")
        karte.get_by_label("zweite Stelle").fill(str(ks[1]))
        loesen_und_pruefen("doppelt")

        # Ganz ausmultiplizieren auf Stufe 3: (a − b)^n
        page.get_by_role("button", name="Ganz ausmultiplizieren").click(); page.wait_for_timeout(200)
        page.get_by_role("button", name="Schwierigkeit erhöhen").last.click(); page.wait_for_timeout(200)
        felder = karte.locator("input").all(); n = len(felder) - 1
        minus = "Vorzeichen" in karte.inner_text()
        for k, f in enumerate(felder): f.fill(str(comb(n, k) * ((-1) ** k if minus else 1)))
        loesen_und_pruefen("ausmulti")

        # Dreieckszahlen
        page.get_by_role("button", name="Dreieckszahlen", exact=True).last.click(); page.wait_for_timeout(200)
        mm = int(re.search(r"Berechne die (\d+)\. Dreieckszahl", karte.inner_text()).group(1))
        karte.get_by_label("Summe").fill(str(mm * (mm + 1) // 2)); karte.get_by_label("n", exact=True).fill(str(mm + 1)); karte.get_by_label("k", exact=True).fill("2")
        loesen_und_pruefen("dreieckszahl")

        # Begründen: Symmetrie mit einer falschen Antwort, dann alles richtig
        page.get_by_role("button", name="Begründen").click(); page.wait_for_timeout(300)
        def waehle(text): page.get_by_role("button", name=text, exact=True).first.click(); page.wait_for_timeout(150)
        waehle("n")   # falsch
        pruefe(page.get_by_text("Noch nicht – lies den Satz").count() == 1, f"{breite}: Rückmeldung falsche Lücke fehlt")
        waehle("k"); waehle("Kommutativgesetz")
        # dritte Lücke: die Option mit (n über k) steht als Formel – über aria-pressed-freie Knöpfe der letzten Lücke
        letzte = page.locator(".auftauchen").filter(has_text="also genau").locator("button")
        for i in range(letzte.count()):
            letzte.nth(i).click(); page.wait_for_timeout(120)
            if page.locator(".auftauchen").filter(has_text="Zum Abzählen").count(): break
        page.locator("button", has_text="Plätze der Nieten").click()
        page.wait_for_timeout(200)
        pruefe(page.get_by_text("Beweis vollständig.").count() == 1, f"{breite}: Symmetrie-Beweis nicht abgeschlossen")
        breite_ok("begruenden")
        page.get_by_text("Beweis vollständig.").scroll_into_view_if_needed()
        page.screenshot(path=f"{AUS}/{breite}-begruenden.png")
        pruefe(not konsole, f"{breite}: Konsole: {konsole[:3]}")
        ctx.close()
    b.close()
print("OK" if not fehler else f"{len(fehler)} Fehler")
raise SystemExit(1 if fehler else 0)
