"""Browser-Test: GFS-Themenseite „Die optimale Dose“ (/gfs-trainer/optimale-dose).
Prüft bei 360, 390 und 1280 px: Kurs-Liste (G8 Klasse 11 / G9 Klasse 12), sechs Animationen (eine wird abgespielt),
Dosen-Labor (Zum Optimum), Grundtypen (Zielfunktion falsch → richtig, Optimale Maße), alle sechs Buchübungen
mit richtigen Werten aus window.__gdBuch, Begründen (h = 2r), Gegenüberstellung, Kolloquium – ohne Überbreite
und ohne Konsolenfehler.
  npm run build && npx vite preview --port 4173 &   →   python3 tests/ui/gfsdose.ui.py
"""
import os, re
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
AUS = os.environ.get("SCREENS", "/tmp/gfsdose")
os.makedirs(AUS, exist_ok=True)
fehler = []
def pruefe(bed, text):
    if not bed: fehler.append(text); print("FEHLT:", text)
def dk(x, n=2):
    return f"{round(x, n):.{n}f}".replace(".", ",")

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

        # Kurs: Kursstufe 1 (G8 Klasse 11 · G9 Klasse 12) zeigt das Thema
        page.goto(BASE + "gfs-trainer"); page.wait_for_timeout(1000)
        page.locator(".gfs-stufe-knopf").click(); page.wait_for_timeout(150)
        pruefe(page.get_by_text("G8 Klasse 11 · G9 Klasse 12").count() >= 1, f"{breite}: Schulart-Zeile fehlt")
        page.get_by_role("option", name="Kursstufe 1").click(); page.wait_for_timeout(250)
        dose = page.locator(".gfs-thema-fertig", has_text="Die optimale Dose")
        pruefe(dose.count() == 1, f"{breite}: Thema fehlt in Kursstufe 1")
        dose.click(); page.wait_for_timeout(1200)
        pruefe("optimale-dose" in page.url, f"{breite}: Themenseite nicht geöffnet ({page.url})")
        pruefe(page.get_by_text("Welche Dose braucht am wenigsten Blech").count() >= 1, f"{breite}: Leitfrage fehlt")
        pruefe(page.locator(".gtk-bild").count() == 1, f"{breite}: Dosenbild im Kopf fehlt")
        breite_ok("Seite")
        page.screenshot(path=f"{AUS}/{breite}-kopf.png")

        # Sechs Animationen, die erste ist offen und spielt; eine zweite aufklappen und bis Schritt 3 springen
        anims = page.locator("[data-dose-anim]")
        pruefe(anims.count() == 6, f"{breite}: {anims.count()} statt 6 Animationen")
        pruefe(anims.first.locator("input[type=range]").count() == 1, f"{breite}: erste Animation nicht geöffnet")
        zweite = anims.nth(1)
        zweite.locator("button").first.click(); page.wait_for_timeout(300)
        zweite.get_by_label("Schritt 3 abspielen").click(); page.wait_for_timeout(400)
        pruefe(zweite.get_by_text("Schritt 3 von").count() == 1, f"{breite}: Schrittwechsel in Animation 2 fehlt")
        breite_ok("Animationen")
        zweite.scroll_into_view_if_needed(); page.screenshot(path=f"{AUS}/{breite}-animation.png")

        # Dosen-Labor
        page.get_by_role("button", name="500 ml").click(); page.wait_for_timeout(100)
        page.get_by_role("button", name="Zum Optimum springen").click(); page.wait_for_timeout(200)
        pruefe(page.get_by_text("Optimum: h = 2r").count() == 1, f"{breite}: Labor erkennt Optimum nicht")
        page.locator("input[type=range][aria-label=Radius]").fill("2"); page.wait_for_timeout(150)
        pruefe(page.get_by_text("gegenüber dem Optimum").count() == 1, f"{breite}: Mehrverbrauch fehlt")
        breite_ok("Labor")

        # Grundtypen: Zielfunktion erst falsch, dann richtig
        karte = page.locator("[data-dosetrainer]")
        auf = page.evaluate("window.__gdAufgabe")
        falsch = [i for i in auf["reihenfolge"] if i != auf["richtig"]][0]
        knoepfe = karte.locator("button[aria-pressed]")
        knoepfe.nth(auf["reihenfolge"].index(falsch)).click(); karte.get_by_role("button", name="Prüfen").click(); page.wait_for_timeout(200)
        pruefe(karte.get_by_text("Stimmt noch nicht.").count() == 1, f"{breite}: falsche Zielfunktion nicht erkannt")
        knoepfe.nth(auf["reihenfolge"].index(auf["richtig"])).click(); karte.get_by_role("button", name="Prüfen").click(); page.wait_for_timeout(200)
        pruefe(karte.get_by_text("Stimmt!").count() == 1, f"{breite}: richtige Zielfunktion nicht erkannt")
        # Optimale Maße
        page.get_by_role("button", name="Optimale Maße").click(); page.wait_for_timeout(200)
        auf = page.evaluate("window.__gdAufgabe")
        karte.get_by_label("r", exact=True).fill(dk(auf["r"])); karte.get_by_label("h", exact=True).fill(dk(auf["h"])); karte.get_by_label("O", exact=True).fill(dk(auf["O"]))
        karte.get_by_role("button", name="Prüfen").click(); page.wait_for_timeout(200)
        pruefe(karte.get_by_text("Stimmt!").count() == 1, f"{breite}: Optimale Maße nicht als richtig erkannt")
        breite_ok("Grundtypen")
        karte.scroll_into_view_if_needed(); page.screenshot(path=f"{AUS}/{breite}-trainer.png")

        # Buchübungen: alle sechs Rechenübungen auf Stufe 3 (Varianten) mit den richtigen Werten
        buch = page.locator("[data-buchuebung]")
        for name in ("Kleine Dose", "Zaun mit festem Umfang", "Fläche fest, Umfang minimal", "Quader-Karton", "Zelt und Kegel", "Dreieck im Dreieck"):
            page.get_by_role("button", name=name, exact=True).click(); page.wait_for_timeout(200)
            page.get_by_role("button", name="Schwierigkeit erhöhen").last.click(); page.wait_for_timeout(200)
            a = page.evaluate("window.__gdBuch")
            for f in buch.locator("input").all():
                k = f.get_attribute("aria-label")
                f.fill(dk(a[k]))
            buch.get_by_role("button", name="Prüfen").click(); page.wait_for_timeout(250)
            pruefe(buch.get_by_text("Stimmt!").count() == 1, f"{breite}: {name} ({a['variante']}) nicht als richtig erkannt")
            breite_ok(name)
        buch.scroll_into_view_if_needed(); page.screenshot(path=f"{AUS}/{breite}-buch.png")

        # Begründen: h = 2r mit einer falschen Antwort, dann alles richtig
        page.get_by_role("button", name="Begründen").click(); page.wait_for_timeout(300)
        def lueckenwahl(stichwort, text):
            block = page.locator(".auftauchen").filter(has_text=stichwort).last
            block.locator("button", has_text=text).first.click(); page.wait_for_timeout(150)
        block = page.locator(".auftauchen").filter(has_text="wird der Mantel zu").last
        kn = block.locator("button")
        for i in range(kn.count()):                       # eine falsche Antwort finden
            kn.nth(i).click(); page.wait_for_timeout(120)
            if page.get_by_text("Noch nicht – lies den Satz").count(): break
        pruefe(page.get_by_text("Noch nicht – lies den Satz").count() == 1, f"{breite}: Rückmeldung falsche Lücke fehlt")
        for stich in ("wird der Mantel zu", "Ihre Ableitung ist", "aufgelöst ergibt das", "wird daraus"):
            block = page.locator(".auftauchen").filter(has_text=stich).last
            kn = block.locator("button")
            for i in range(kn.count()):
                kn.nth(i).click(); page.wait_for_timeout(120)
                if not page.locator(".auftauchen").filter(has_text=stich).last.get_by_text("Noch nicht").count(): break
        lueckenwahl("so hoch wie", "ihr Durchmesser")
        pruefe(page.get_by_text("Begründung vollständig.").count() == 1, f"{breite}: Beweis h = 2r nicht abgeschlossen")

        # Gegenüberstellung und Kolloquium
        page.get_by_text("Wie wir die Buchaufgaben adaptiert haben").click(); page.wait_for_timeout(200)
        pruefe(page.get_by_text("Idee: Pyramidenzelt aus vier Stäben").count() == 1, f"{breite}: Gegenüberstellung fehlt")
        page.get_by_role("button", name="Antwort aufdecken").click(); page.wait_for_timeout(150)
        page.get_by_role("button", name="Konnte ich").click(); page.wait_for_timeout(150)
        pruefe(page.get_by_text("1 von 11 sitzen").count() == 1, f"{breite}: Kolloquium zählt nicht")
        breite_ok("Ende")
        page.screenshot(path=f"{AUS}/{breite}-ende.png")
        pruefe(not konsole, f"{breite}: Konsolenfehler {konsole[:3]}")
        ctx.close()
    b.close()

print("OK" if not fehler else f"{len(fehler)} Fehler")
raise SystemExit(1 if fehler else 0)
