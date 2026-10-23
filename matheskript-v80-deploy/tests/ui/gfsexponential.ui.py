"""Browser-Test: GFS-Themenseite „Die Exponentialverteilung“ (/gfs-trainer/exponentialverteilung).
Prüft bei 360, 390 und 1280 px: Kurs-Liste (Kursstufe 2), direkter Pfad und Alias, Kopf mit Bild und drei Chips,
fünf Animationen (die erste offen, eine bis Schritt 3 gesprungen, alle bis zum Ende ohne Fehler), Labor
(λ-Regler ändert die Fläche, Grenzen a und b, Verteilungsfunktion, Simulation mit 1000 Wartezeiten, Gedächtnis-Demo),
alle vier Übungstypen (erst eine typisch falsche Antwort mit Rückmeldung, dann die richtige – einmal gerundet,
einmal exakt – aus window.__geAufgabe), Kolloquium – ohne Überbreite und ohne Konsolenfehler.
  cd matheskript-v80-deploy && npx vite --port 4393 --strictPort &
  BASE_URL=http://localhost:4393/ python3 tests/ui/gfsexponential.ui.py
"""
import os
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
AUS = os.environ.get("SCREENS", "/tmp/gfsexponential")
os.makedirs(AUS, exist_ok=True)
fehler = []
def pruefe(bed, text):
    if not bed: fehler.append(text); print("FEHLT:", text)

VORBEREITEN = """() => { localStorage.clear(); localStorage.setItem('mm-start-app','1');
  localStorage.setItem('mm-onboarding-v1', JSON.stringify({uebersprungen:true})); }"""

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

        page.goto(BASE); page.evaluate(VORBEREITEN)

        # Kurs: Kursstufe 2 zeigt das Thema, Klick öffnet die Seite
        page.goto(BASE + "gfs-trainer"); page.wait_for_timeout(1200)
        page.locator(".gfs-stufe-knopf").click(); page.wait_for_timeout(150)
        page.get_by_role("option", name="Kursstufe 2").click(); page.wait_for_timeout(250)
        thema = page.locator(".gfs-thema-fertig", has_text="Exponentialverteilung")   # die Liste zeigt den Kurztitel
        pruefe(thema.count() == 1, f"{breite}: Thema fehlt in Kursstufe 2")
        thema.click(); page.wait_for_timeout(1500)
        pruefe("gfs-trainer/exponentialverteilung" in page.url, f"{breite}: Themenseite nicht geöffnet ({page.url})")

        # direkter Pfad und Alias
        page.goto(BASE + "wartezeiten"); page.wait_for_timeout(1500)
        pruefe(page.get_by_text("wieder so gut wie neu?").count() >= 1, f"{breite}: Alias /wartezeiten öffnet die Seite nicht")
        page.goto(BASE + "gfs-trainer/exponentialverteilung"); page.wait_for_timeout(1800)
        pruefe(page.get_by_text("Warum ist ein Bauteil, das schon 1000 Stunden hält, wieder so gut wie neu?").count() >= 1, f"{breite}: Leitfrage fehlt")
        pruefe(page.locator(".gtk-titel", has_text="Die Exponentialverteilung").count() == 1, f"{breite}: Titel im Kopf fehlt")
        pruefe(page.locator(".gtk-bild").count() == 1, f"{breite}: Kopfbild fehlt")
        chips = page.locator(".gtk-chips li").all_inner_texts()
        pruefe(chips == ["Kursstufe 2", "Kap. X", "5 Animationen"], f"{breite}: Chips {chips}")
        breite_ok("Seite")
        page.screenshot(path=f"{AUS}/{breite}-kopf.png")

        # Fünf Animationen: die erste ist offen und spielt; „lage“ aufklappen und zu Schritt 3 springen; alle ans Ende
        anims = page.locator("[data-exp-anim]")
        pruefe(anims.count() == 5, f"{breite}: {anims.count()} statt 5 Animationen")
        pruefe(anims.first.locator("input[type=range]").count() == 1, f"{breite}: erste Animation nicht geöffnet")
        page.wait_for_timeout(1500)
        t0 = float(anims.first.locator("input[type=range]").input_value())
        pruefe(t0 > 0.3, f"{breite}: erste Animation spielt nicht ({t0})")
        lage = page.locator("[data-exp-anim=lage]")
        lage.locator("button").first.click(); page.wait_for_timeout(300)
        lage.get_by_label("Schritt 3 abspielen").click(); page.wait_for_timeout(400)
        pruefe(lage.get_by_text("Schritt 3 von 4").count() == 1, f"{breite}: Schrittwechsel in der Animation „lage“ fehlt")
        for art in ("treppe", "flaeche", "lage", "gedaechtnis", "zerfall"):
            k = page.locator(f"[data-exp-anim={art}]")
            if k.locator("input[type=range]").count() == 0:
                k.locator("button").first.click(); page.wait_for_timeout(250)
            leiste = k.locator("input[type=range]")
            for anteil in (0.35, 0.7, 1.0):
                # Zeitleiste über den nativen Setter (React hört auf „input“); Dauer aus max, weil die Lesezeit sie bestimmt
                leiste.evaluate("""(e, a) => { const v = (parseFloat(e.max) * a).toFixed(2);
                  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(e, a === 1 ? e.max : v);
                  e.dispatchEvent(new Event('input', { bubbles: true })); }""", anteil)
                page.wait_for_timeout(120)
                if breite == 390:
                    k.scroll_into_view_if_needed(); k.screenshot(path=f"{AUS}/{breite}-anim-{art}-{int(anteil * 100)}.png")
            pruefe(k.locator("svg").first.evaluate("e => !e.innerHTML.includes('NaN')"), f"{breite}: NaN in Animation {art}")
        breite_ok("Animationen")

        # Labor
        labor = page.locator("[data-exp-labor]")
        labor.scroll_into_view_if_needed()
        p0 = float(labor.get_attribute("data-p"))
        pruefe(abs(p0 - 0.38340) < 1e-4, f"{breite}: Startfläche {p0}")
        pruefe(labor.get_by_text("≈ 0,383").count() >= 1, f"{breite}: Ergebnis 0,383 fehlt")
        labor.get_by_label("λ", exact=True).fill("1"); page.wait_for_timeout(150)
        p1 = float(labor.get_attribute("data-p"))
        pruefe(abs(p1 - 0.31809) < 1e-4, f"{breite}: λ = 1 → {p1} statt 0,318")
        labor.get_by_label("b", exact=True).fill("2"); page.wait_for_timeout(150)
        pruefe(abs(float(labor.get_attribute("data-p")) - 0.23254) < 1e-4, f"{breite}: b = 2 → falsche Fläche")
        labor.get_by_role("button", name="Verteilungsfunktion F").click(); page.wait_for_timeout(150)
        pruefe(labor.get_by_text("F(b) − F(a)").count() >= 1, f"{breite}: Höhenunterschied an F fehlt")
        breite_ok("Labor Fläche")
        if breite in (390, 1280): labor.screenshot(path=f"{AUS}/{breite}-labor-flaeche.png")
        labor.get_by_role("button", name="Simulation", exact=True).click(); page.wait_for_timeout(150)
        labor.get_by_role("button", name="+1000 Wartezeiten").click(); page.wait_for_timeout(300)
        pruefe(labor.get_attribute("data-n") == "1000", f"{breite}: Simulation zählt nicht")
        pruefe(labor.get_by_text("1000 Wartezeiten").count() >= 1, f"{breite}: Ergebnis der Simulation fehlt")
        labor.get_by_role("button", name="+100 Wartezeiten").click(); page.wait_for_timeout(200)
        pruefe(labor.get_attribute("data-n") == "1100", f"{breite}: zweite Simulation zählt nicht")
        breite_ok("Labor Simulation")
        if breite in (390, 1280): labor.screenshot(path=f"{AUS}/{breite}-labor-simulation.png")
        labor.get_by_role("button", name="Gedächtnis", exact=True).click(); page.wait_for_timeout(150)
        u = int(labor.get_attribute("data-ueberlebende"))
        pruefe(abs(u - 4000 * 0.1353) < 120, f"{breite}: Überlebende nach s = 2 bei λ = 1: {u} statt ≈ 541")
        labor.get_by_role("button", name="Überlebende ab 0 neu ausrichten").click(); page.wait_for_timeout(200)
        pruefe(labor.get_attribute("data-neu") == "ja", f"{breite}: Gedächtnis-Demo richtet nicht neu aus")
        pruefe(labor.get_by_text("Restzeiten der").count() == 1, f"{breite}: Restzeiten-Text fehlt")
        breite_ok("Labor Gedächtnis")
        if breite in (390, 1280): labor.screenshot(path=f"{AUS}/{breite}-labor-gedaechtnis.png")

        # Übungen: je Typ (Stufe 2) erst typisch falsch, dann richtig (abwechselnd gerundet und exakt)
        karte = page.locator("[data-exptrainer]")
        def fuellen(werte):
            for f, v in zip(karte.locator("input[data-mathe-modus]").all(), werte):
                f.fill(str(v))
        def pruefen():
            karte.get_by_role("button", name="Prüfen").click(); page.wait_for_timeout(200)
        for nr, typ in enumerate(("Wahrscheinlichkeiten", "Erwartungswert und Median", "λ bestimmen", "Ohne Gedächtnis")):
            page.get_by_role("button", name=typ, exact=True).click(); page.wait_for_timeout(200)
            page.get_by_role("button", name="Schwierigkeit erhöhen").click(); page.wait_for_timeout(200)
            a = page.evaluate("window.__geAufgabe")
            schluessel = [f[0] for f in a["felder"]]
            pruefe(karte.locator("input[data-mathe-modus=formel]").count() == len(schluessel), f"{breite}: {typ}: Felder fehlen")
            falsch = [a["loesung"][k] for k in schluessel]
            soll = a["soll"][schluessel[0]]
            # erste Falle, die nicht zufällig mit der Lösung zusammenfällt (z. B. 50 % halten = 50 % fallen aus)
            wert, text = next((w, t) for w, t in a["fallen"][schluessel[0]] if w > 0 and abs(w - soll) > 0.02 * soll)
            falsch[0] = f"{wert:.6f}".replace(".", ",")
            fuellen(falsch); pruefen()
            pruefe(karte.get_by_text("Stimmt noch nicht.").count() == 1, f"{breite}: {typ}: falsche Antwort {falsch} nicht erkannt")
            grund = karte.locator("p").filter(has_text="Stimmt noch nicht.").locator("xpath=following-sibling::p[1]").inner_text()
            pruefe(grund == text, f"{breite}: {typ}: Rückmeldung „{grund}“ statt „{text}“")
            karte.get_by_role("button", name="Rechenweg zeigen").click(); page.wait_for_timeout(150)
            breite_ok(f"{typ} Rechenweg")
            richtig = [a["loesung"][k] if nr % 2 == 0 else a["exakt"][k] for k in schluessel]
            fuellen(richtig); pruefen()
            pruefe(karte.get_by_text("Stimmt!").count() == 1, f"{breite}: {typ} (Stufe {a['stufe']}, {richtig}) nicht als richtig erkannt")
            breite_ok(typ)
            if breite in (390, 1280):
                karte.scroll_into_view_if_needed(); karte.screenshot(path=f"{AUS}/{breite}-uebung-{nr}.png")
        pruefe(page.get_by_text("4 von 8 richtig").count() == 1, f"{breite}: Zähler der Übungen")

        # Kolloquium und roter Faden
        pruefe(page.get_by_text("Rund 17 Minuten Vortrag").count() == 1, f"{breite}: roter Faden fehlt")
        page.get_by_role("button", name="Antwort aufdecken").click(); page.wait_for_timeout(150)
        page.get_by_role("button", name="Konnte ich").click(); page.wait_for_timeout(150)
        pruefe(page.get_by_text("1 von 12 sitzen").count() == 1, f"{breite}: Kolloquium zählt nicht")
        page.get_by_role("button", name="Alle Fragen auf einen Blick").click(); page.wait_for_timeout(150)
        breite_ok("Ende")
        page.screenshot(path=f"{AUS}/{breite}-ende.png", full_page=breite == 390)
        pruefe(not konsole, f"{breite}: Konsolenfehler {konsole[:3]}")
        ctx.close()
    b.close()

print("OK" if not fehler else f"{len(fehler)} Fehler")
raise SystemExit(1 if fehler else 0)
