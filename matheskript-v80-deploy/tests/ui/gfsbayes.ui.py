"""Browser-Test: GFS-Themenseite „Der Satz von Bayes“ (/gfs-trainer/satz-von-bayes).
Prüft bei 360, 390 und 1280 px: Kurs-Liste (Kursstufe 2, G8 Klasse 12 / G9 Klasse 13), Kopfbild, vier Animationen
(eine wird abgespielt, eine bis Schritt 3 gesprungen), Bayes-Labor (Startwert 26,9 %, Voreinstellung „Sehr selten“ → 9,0 %,
Spezifität-Regler → 8,4 %, Punktebild, Tafel/Bäume/Kurve), alle fünf Übungstypen mit den richtigen Werten aus
window.__gbAufgabe (Typ „Positiv“ erst falsch mit gezielter Rückmeldung), Begründen (Herleitung), Kolloquium und der
Sprung zur Vier-Felder-Tafel – ohne Überbreite und ohne Konsolenfehler.
  npm run build && npx vite preview --port 4173 &   →   python3 tests/ui/gfsbayes.ui.py
"""
import os
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
AUS = os.environ.get("SCREENS", "/tmp/gfsbayes")
os.makedirs(AUS, exist_ok=True)
fehler = []
def pruefe(bed, text):
    if not bed: fehler.append(text); print("FEHLT:", text)
def dk(x, n=1):
    return f"{round(x + 1e-12, n):.{n}f}".replace(".", ",")

with sync_playwright() as p:
    b = p.chromium.launch()
    for breite in (360, 390, 1280):
        ctx = b.new_context(viewport={"width": breite, "height": 900}, device_scale_factor=2, locale="de-DE")
        page = ctx.new_page()
        konsole = []
        page.on("pageerror", lambda e: konsole.append(f"pageerror: {e}"))
        page.on("console", lambda m: konsole.append(m.text) if m.type == "error" and "net::" not in m.text and "Failed to load resource" not in m.text else None)
        def breite_ok(wo):
            sw = page.evaluate("document.documentElement.scrollWidth"); pruefe(sw <= breite, f"{breite}: Überbreite bei {wo}: {sw}")

        # Kurs: Kursstufe 2 (G8 Klasse 12 · G9 Klasse 13) zeigt das Thema
        page.goto(BASE + "gfs-trainer"); page.wait_for_timeout(1000)
        page.locator(".gfs-stufe-knopf").click(); page.wait_for_timeout(150)
        pruefe(page.get_by_text("G8 Klasse 12 · G9 Klasse 13").count() >= 1, f"{breite}: Schulart-Zeile fehlt")
        page.get_by_role("option", name="Kursstufe 2").click(); page.wait_for_timeout(250)
        thema = page.locator(".gfs-thema-fertig", has_text="Der Satz von Bayes")
        pruefe(thema.count() == 1, f"{breite}: Thema fehlt in Kursstufe 2")
        thema.click(); page.wait_for_timeout(1200)
        pruefe("satz-von-bayes" in page.url, f"{breite}: Themenseite nicht geöffnet ({page.url})")
        pruefe(page.get_by_text("wie wahrscheinlich bist du wirklich krank").count() >= 1, f"{breite}: Leitfrage fehlt")
        pruefe(page.locator(".gtk-bild").count() == 1, f"{breite}: Kopfbild fehlt")
        breite_ok("Seite")
        page.screenshot(path=f"{AUS}/{breite}-kopf.png")

        # Vier Animationen: die erste ist offen und spielt; die zweite aufklappen und zu Schritt 3 springen
        anims = page.locator("[data-bayes-anim]")
        pruefe(anims.count() == 4, f"{breite}: {anims.count()} statt 4 Animationen")
        pruefe(anims.first.locator("input[type=range]").count() == 1, f"{breite}: erste Animation nicht geöffnet")
        zweite = anims.nth(1)
        zweite.locator("button").first.click(); page.wait_for_timeout(300)
        zweite.get_by_label("Schritt 3 abspielen").click(); page.wait_for_timeout(400)
        pruefe(zweite.get_by_text("Schritt 3 von").count() == 1, f"{breite}: Schrittwechsel in Animation 2 fehlt")
        for i in (2, 3):                                  # die übrigen öffnen sich ohne Fehler
            anims.nth(i).locator("button").first.click(); page.wait_for_timeout(250)
        breite_ok("Animationen")
        zweite.scroll_into_view_if_needed(); page.screenshot(path=f"{AUS}/{breite}-animation.png")

        # Bayes-Labor
        labor = page.locator("[data-bayes-labor]")
        ppv = labor.locator("[data-ppv]")
        pruefe(ppv.inner_text().strip() == "26,9 %", f"{breite}: Labor-Startwert {ppv.inner_text()!r} statt 26,9 %")
        pruefe(labor.get_by_text("Von 67 positiv Getesteten sind 18 wirklich krank").count() == 1, f"{breite}: Satz zu 18 von 67 fehlt")
        pruefe(labor.locator("[data-punktebild] circle").count() == 1000, f"{breite}: Punktebild hat nicht 1000 Personen")
        labor.get_by_role("button", name="Sehr selten").click(); page.wait_for_timeout(150)
        pruefe(ppv.inner_text().strip() == "9,0 %", f"{breite}: Voreinstellung „Sehr selten“ liefert {ppv.inner_text()!r}")
        labor.get_by_role("button", name="Start: 2 % · 90 % · 95 %").click(); page.wait_for_timeout(150)
        labor.locator("input[type=range][aria-label=Spezifität]").fill("80"); page.wait_for_timeout(150)
        pruefe(ppv.inner_text().strip() == "8,4 %", f"{breite}: Spezifität 80 % liefert {ppv.inner_text()!r} statt 8,4 %")
        labor.get_by_role("button", name="Nur die Positiven zeigen").click(); page.wait_for_timeout(100)
        labor.get_by_role("button", name="Gemischt zeigen (wie in echt)").click(); page.wait_for_timeout(100)
        pruefe(labor.locator("[data-labor-tafel]").count() == 1, f"{breite}: Vierfeldertafel fehlt")
        labor.get_by_role("button", name="Zwei Bäume").click(); page.wait_for_timeout(150)
        pruefe(labor.locator("[data-labor-baeume]").count() == 1, f"{breite}: Bäume fehlen")
        labor.get_by_role("button", name="Kurve").click(); page.wait_for_timeout(150)
        pruefe(labor.locator("[data-labor-kurve]").count() == 1, f"{breite}: Kurve fehlt")
        breite_ok("Labor")
        labor.scroll_into_view_if_needed(); page.screenshot(path=f"{AUS}/{breite}-labor.png")

        # Übung: „Positiv – wirklich?“ erst mit der Trefferquote (typischer Fehler), dann richtig
        karte = page.locator("[data-bayestrainer]")
        def ausfuellen(a):
            for f in karte.locator("input[data-feld]").all():
                k = f.get_attribute("data-feld")
                wert = a[k] if k in a else a["h"][k]
                f.fill(str(wert) if k in ("kp", "gp") else dk(wert, a.get("stellen", 2) if k == "rest" else 1))
        a = page.evaluate("window.__gbAufgabe")
        karte.locator("input[data-feld=ppv]").fill(dk(a["se"], 1))
        karte.get_by_role("button", name="Prüfen").click(); page.wait_for_timeout(200)
        pruefe(karte.get_by_text("Stimmt noch nicht.").count() == 1, f"{breite}: Verwechslung nicht erkannt")
        pruefe(karte.get_by_text("Trefferquote", exact=False).count() >= 1, f"{breite}: gezielte Rückmeldung fehlt")
        ausfuellen(a); karte.get_by_role("button", name="Prüfen").click(); page.wait_for_timeout(200)
        pruefe(karte.get_by_text("Stimmt!").count() == 1, f"{breite}: richtige Lösung nicht erkannt")
        for name in ("Natürliche Häufigkeiten", "Tafel umdrehen", "Zweiter Test", "Negativ – Entwarnung?"):
            page.get_by_role("button", name=name, exact=True).click(); page.wait_for_timeout(200)
            page.get_by_role("button", name="Schwierigkeit erhöhen").click(); page.wait_for_timeout(200)
            a = page.evaluate("window.__gbAufgabe")
            ausfuellen(a)
            karte.get_by_role("button", name="Prüfen").click(); page.wait_for_timeout(250)
            pruefe(karte.get_by_text("Stimmt!").count() == 1, f"{breite}: {name} (Stufe {a['stufe']}) nicht als richtig erkannt")
            breite_ok(name)
        karte.scroll_into_view_if_needed(); page.screenshot(path=f"{AUS}/{breite}-uebung.png")

        # Begründen: Herleitung, eine falsche Antwort, dann alles richtig
        begr = page.locator("[data-begruenden]")
        erster = begr.locator(".auftauchen").first
        kn = erster.locator("button")
        for i in range(kn.count()):
            kn.nth(i).click(); page.wait_for_timeout(120)
            if begr.get_by_text("Noch nicht – lies den Satz").count(): break
        pruefe(begr.get_by_text("Noch nicht – lies den Satz").count() == 1, f"{breite}: Rückmeldung falsche Lücke fehlt")
        for schritt in range(4):
            block = begr.locator(".auftauchen").nth(schritt)
            kn = block.locator("button")
            for i in range(kn.count()):
                kn.nth(i).click(); page.wait_for_timeout(120)
                if not block.get_by_text("Noch nicht").count(): break
        pruefe(begr.get_by_text("Begründung vollständig.").count() == 1, f"{breite}: Herleitung nicht abgeschlossen")
        breite_ok("Begründen")

        # Kolloquium
        page.get_by_role("button", name="Antwort aufdecken").click(); page.wait_for_timeout(150)
        page.get_by_role("button", name="Konnte ich").click(); page.wait_for_timeout(150)
        pruefe(page.get_by_text("1 von 11 sitzen").count() == 1, f"{breite}: Kolloquium zählt nicht")
        breite_ok("Ende")
        page.screenshot(path=f"{AUS}/{breite}-ende.png")

        # Verweis auf das vorhandene Werkzeug
        page.get_by_role("button", name="Zur Vier-Felder-Tafel").click(); page.wait_for_timeout(1200)
        pruefe("vierfeldertafel" in page.url, f"{breite}: Sprung zur Vier-Felder-Tafel fehlt ({page.url})")
        pruefe(not konsole, f"{breite}: Konsolenfehler {konsole[:3]}")
        ctx.close()
    b.close()

print("OK" if not fehler else f"{len(fehler)} Fehler")
raise SystemExit(1 if fehler else 0)
