"""Browser-Test: GFS-Themenseite „Das Ziegenproblem“ (/gfs-trainer/ziegenproblem).
Prüft bei 360, 390 und 1280 px: Kurs-Liste (Klasse 9), Kopfbild, fünf Animationen (eine wird abgespielt),
Labor mit drei Türen (wechseln und bleiben, Strichliste zählt), Schnellsimulation (1000 Runden, 10 Türen),
alle vier Übungstypen (erst eine typisch falsche Antwort mit Rückmeldung, dann die richtige aus window.__gzAufgabe),
Kolloquium – ohne Überbreite und ohne Konsolenfehler.
  npm run build && npx vite preview --port 4173 &   →   python3 tests/ui/gfsziegen.ui.py
Ohne Einbindung (Wegwerf-Seite, die nur die Themenseite zeigt): DIREKT=http://localhost:5199/ python3 tests/ui/gfsziegen.ui.py
"""
import os
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
DIREKT = os.environ.get("DIREKT")
AUS = os.environ.get("SCREENS", "/tmp/gfsziegen")
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
        page.on("console", lambda m: konsole.append(m.text) if m.type == "error" and "net::" not in m.text and "Failed to load resource" not in m.text else None)
        def breite_ok(wo):
            sw = page.evaluate("document.documentElement.scrollWidth"); pruefe(sw <= breite, f"{breite}: Überbreite bei {wo}: {sw}")

        if DIREKT:
            page.goto(DIREKT); page.wait_for_timeout(1500)
        else:
            # Kurs: Klasse 9 zeigt das Thema
            page.goto(BASE + "gfs-trainer"); page.wait_for_timeout(1000)
            page.locator(".gfs-stufe-knopf").click(); page.wait_for_timeout(150)
            page.get_by_role("option", name="Klasse 9").click(); page.wait_for_timeout(250)
            thema = page.locator(".gfs-thema-fertig", has_text="Das Ziegenproblem")
            pruefe(thema.count() == 1, f"{breite}: Thema fehlt in Klasse 9")
            thema.click(); page.wait_for_timeout(1200)
            pruefe("ziegenproblem" in page.url, f"{breite}: Themenseite nicht geöffnet ({page.url})")
        pruefe(page.get_by_text("Bleiben oder wechseln – wo steht das Auto?").count() >= 1, f"{breite}: Leitfrage fehlt")
        pruefe(page.locator(".gtk-bild").count() == 1, f"{breite}: Kopfbild fehlt")
        breite_ok("Seite")
        page.screenshot(path=f"{AUS}/{breite}-kopf.png")

        # Fünf Animationen, die erste ist offen; die zweite aufklappen und zu Schritt 3 springen
        anims = page.locator("[data-ziegen-anim]")
        pruefe(anims.count() == 5, f"{breite}: {anims.count()} statt 5 Animationen")
        pruefe(anims.first.locator("input[type=range]").count() == 1, f"{breite}: erste Animation nicht geöffnet")
        zweite = anims.nth(1)
        zweite.locator("button").first.click(); page.wait_for_timeout(300)
        zweite.get_by_label("Schritt 3 abspielen").click(); page.wait_for_timeout(400)
        pruefe(zweite.get_by_text("Schritt 3 von").count() == 1, f"{breite}: Schrittwechsel in Animation 2 fehlt")
        breite_ok("Animationen")
        zweite.scroll_into_view_if_needed(); page.screenshot(path=f"{AUS}/{breite}-animation.png")

        # Labor: Tür 1 wählen, Moderator öffnet, wechseln; dann Tür 2 wählen und bleiben
        labor = page.locator("[data-ziegen-labor]")
        liste = labor.locator("[data-strichliste]")
        labor.get_by_role("button", name="Tür 1", exact=True).click(); page.wait_for_timeout(900)
        pruefe(labor.get_by_text("steht eine Ziege").count() == 1, f"{breite}: Moderator hat keine Tür geöffnet")
        labor.get_by_role("button", name="wechseln").click(); page.wait_for_timeout(700)
        pruefe(liste.get_attribute("data-runden") == "1", f"{breite}: Strichliste zählt die erste Runde nicht")
        pruefe(labor.get_by_text("Das Auto stand hinter Tür").count() == 1, f"{breite}: Auflösung fehlt")
        labor.get_by_role("button", name="Nächste Runde").click(); page.wait_for_timeout(200)
        labor.get_by_role("button", name="Tür 2", exact=True).click(); page.wait_for_timeout(900)
        labor.get_by_role("button", name="bleiben").click(); page.wait_for_timeout(700)
        pruefe(liste.get_attribute("data-runden") == "2", f"{breite}: Strichliste zählt die zweite Runde nicht")
        breite_ok("Labor")
        labor.scroll_into_view_if_needed(); page.screenshot(path=f"{AUS}/{breite}-labor.png")

        # Schnellsimulation: 1000 Runden mit drei Türen, dann 10 Türen
        sim = page.locator("[data-ziegen-sim]")
        sim.get_by_role("button", name="+1000 Runden").click(); page.wait_for_timeout(400)
        pruefe(sim.get_attribute("data-runden") == "1000", f"{breite}: Simulation zählt nicht")
        pruefe(sim.get_by_text("von 1000 gewonnen").count() == 2, f"{breite}: Ergebnis der Simulation fehlt")
        sim.get_by_role("button", name="10", exact=True).click(); page.wait_for_timeout(150)
        pruefe(sim.get_attribute("data-runden") == "0", f"{breite}: Türwechsel setzt nicht zurück")
        sim.get_by_role("button", name="+100 Runden").click(); page.wait_for_timeout(150)
        sim.get_by_role("button", name="+100 Runden").click(); page.wait_for_timeout(400)
        pruefe(sim.get_attribute("data-runden") == "200", f"{breite}: zweite Simulation zählt nicht")
        breite_ok("Simulation")
        sim.scroll_into_view_if_needed(); page.screenshot(path=f"{AUS}/{breite}-simulation.png")

        # Übungen: je Typ erst typisch falsch, dann richtig
        karte = page.locator("[data-ziegentrainer]")
        def fuellen(werte):
            for f, v in zip(karte.locator("input").all(), werte): f.fill(str(v))
        def pruefen():
            karte.get_by_role("button", name="Prüfen").click(); page.wait_for_timeout(200)
        for typ in ("Bleiben oder wechseln", "Baumdiagramm", "Häufigkeiten", "Was weiß der Moderator?"):
            page.get_by_role("button", name=typ, exact=True).click(); page.wait_for_timeout(200)
            page.get_by_role("button", name="Schwierigkeit erhöhen").click(); page.wait_for_timeout(200)
            a = page.evaluate("window.__gzAufgabe")
            if a["art"] == "moderator":
                falsch = [i for i in a["reihenfolge"] if i != a["richtig"]][0]
                karte.locator(f"button[data-option='{falsch}']").click(); pruefen()
                pruefe(karte.get_by_text("Stimmt noch nicht.").count() == 1, f"{breite}: {typ}: falsche Antwort nicht erkannt")
                karte.locator(f"button[data-option='{a['richtig']}']").click(); pruefen()
            else:
                loesung = list(a["loesung"].values())
                fuellen(["1/2"] * len(loesung) if a["art"] != "haeufigkeit" else [a["G"]] + loesung[1:]); pruefen()
                pruefe(karte.get_by_text("Stimmt noch nicht.").count() == 1, f"{breite}: {typ}: falsche Antwort nicht erkannt")
                pruefe(len(karte.locator("p").filter(has_text="Stimmt noch nicht.").locator("xpath=following-sibling::p[1]").inner_text()) > 20, f"{breite}: {typ}: Rückmeldung fehlt")
                fuellen(loesung); pruefen()
            pruefe(karte.get_by_text("Stimmt!").count() == 1, f"{breite}: {typ} (Stufe {a['stufe']}) nicht als richtig erkannt")
            breite_ok(typ)
        karte.scroll_into_view_if_needed(); page.screenshot(path=f"{AUS}/{breite}-uebung.png")

        # Kolloquium
        page.get_by_role("button", name="Antwort aufdecken").click(); page.wait_for_timeout(150)
        page.get_by_role("button", name="Konnte ich").click(); page.wait_for_timeout(150)
        pruefe(page.get_by_text("1 von 10 sitzen").count() == 1, f"{breite}: Kolloquium zählt nicht")
        breite_ok("Ende")
        page.screenshot(path=f"{AUS}/{breite}-ende.png")
        pruefe(not konsole, f"{breite}: Konsolenfehler {konsole[:3]}")
        ctx.close()
    b.close()

print("OK" if not fehler else f"{len(fehler)} Fehler")
raise SystemExit(1 if fehler else 0)
