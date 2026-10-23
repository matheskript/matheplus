"""Browser-Test: GFS-Themenseite „Die Keplersche Fassregel“ (/gfs-trainer/keplersche-fassregel).
Prüft bei 360, 390 und 1280 px: Kurs-Liste (Kursstufe 1 → Keplersche Fassregel), Seite lädt auch direkt über den Pfad,
Kopf mit Bild und Chips, fünf Animationen (die erste spielt von selbst, eine wird bedient und ans Ende gezogen),
Flächen-Labor (Funktion wählen, Grenzen per Plus/Minus, Fässer, Fehler live: Grad 3 exakt, eˣ nicht),
Fass-Labor (Vorlage Zylinder, Radius ändern), alle vier Übungsarten (erst falsch mit gezielter Rückmeldung,
dann richtig mit den Werten aus window.__fassAufgabe), Kolloquium – ohne Überbreite und ohne Konsolenfehler.
  Dev-Server:  cd matheskript-v80-deploy && npx vite --port 4392 --strictPort &
               BASE_URL=http://localhost:4392/ python3 tests/ui/gfsfassregel.ui.py
"""
import os, re
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
PFAD = "gfs-trainer/keplersche-fassregel"
AUS = os.environ.get("SCREENS", "/tmp/gfsfassregel")
os.makedirs(AUS, exist_ok=True)
INIT = "localStorage.clear(); localStorage.setItem('mm-start-app','1'); localStorage.setItem('mm-onboarding-v1', JSON.stringify({uebersprungen:true}))"
fehler = []
def pruefe(bed, text):
    if not bed: fehler.append(text); print("FEHLT:", text)
def dk(x, n=4):
    s = f"{round(x, n):.{n}f}".rstrip("0").rstrip(".")
    return s.replace(".", ",")

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
        page.goto(BASE + "buecher/vektoren/viewer.css"); page.evaluate(INIT)

        # direkt über den Pfad (und einen Alias)
        page.goto(BASE + "fassregel"); page.wait_for_timeout(2500)
        pruefe(page.get_by_text("Wie schätzt man ein Integral mit nur drei Funktionswerten").count() >= 1, f"{breite}: Alias /fassregel öffnet die Seite nicht")

        # Kurs: Kursstufe 1 zeigt das Thema, Klick öffnet die Seite
        page.goto(BASE + "gfs-trainer"); page.wait_for_timeout(1500)
        page.locator(".gfs-stufe-knopf").click(); page.wait_for_timeout(200)
        page.get_by_role("option", name="Kursstufe 1").click(); page.wait_for_timeout(300)
        thema = page.locator(".gfs-thema-fertig", has_text="Keplersche Fassregel")
        pruefe(thema.count() == 1, f"{breite}: Thema fehlt in Kursstufe 1")
        thema.click(); page.wait_for_timeout(2500)
        pruefe("keplersche-fassregel" in page.url, f"{breite}: Themenseite nicht geöffnet ({page.url})")
        pruefe(page.get_by_text("Wie schätzt man ein Integral mit nur drei Funktionswerten – und warum ist das oft exakt?").count() >= 1, f"{breite}: Leitfrage fehlt")
        pruefe(page.locator(".gtk-bild").count() == 1, f"{breite}: Kopfbild fehlt")
        for chip in ("Kursstufe 1", "Kap. III", "5 Animationen"):
            pruefe(page.locator(".gtk-chips li", has_text=chip).count() == 1, f"{breite}: Chip {chip} fehlt")
        breite_ok("Kopf")
        page.screenshot(path=f"{AUS}/{breite}-kopf.png")

        # Animationen: fünf, die erste ist offen und spielt
        anims = page.locator("[data-fass-anim]")
        pruefe(anims.count() == 5, f"{breite}: {anims.count()} statt 5 Animationen")
        erste = anims.first.locator("input[type=range]")
        pruefe(erste.count() == 1, f"{breite}: erste Animation nicht geöffnet")
        page.wait_for_timeout(1200)
        pruefe(float(erste.input_value()) > 0.3, f"{breite}: erste Animation spielt nicht")
        g3 = page.locator("[data-fass-anim=grad3]")
        g3.locator("button").first.click(); page.wait_for_timeout(300)
        g3.get_by_label("Schritt 3 abspielen").click(); page.wait_for_timeout(400)
        pruefe(g3.get_by_text("Schritt 3 von 5").count() == 1, f"{breite}: Schrittwechsel in der Grad-3-Animation fehlt")
        leiste = g3.locator("input[type=range]"); leiste.fill(leiste.get_attribute("max")); page.wait_for_timeout(250)
        pruefe(g3.get_by_text("Also: exakt bis Grad 3, ab Grad 4 nicht mehr.").count() == 1, f"{breite}: Schluss der Grad-3-Animation fehlt")
        breite_ok("Animationen")
        g3.scroll_into_view_if_needed(); page.screenshot(path=f"{AUS}/{breite}-animation.png")

        # Flächen-Labor
        lab = page.locator("[data-flaechen-labor]")
        lab.scroll_into_view_if_needed()
        pruefe(lab.get_attribute("data-funktion") == "kubisch" and float(lab.get_attribute("data-fehler")) == 0, f"{breite}: Grad 3 ist im Labor nicht exakt")
        lab.get_by_label("Obere Grenze b erhöhen").click(); page.wait_for_timeout(100)
        pruefe(lab.locator("[data-grenze=b]").inner_text().strip().endswith("3,5"), f"{breite}: Grenze b lässt sich nicht verschieben ({lab.locator('[data-grenze=b]').inner_text()})")
        pruefe(float(lab.get_attribute("data-fehler")) == 0, f"{breite}: Grad 3 nach Verschieben nicht mehr exakt")
        lab.get_by_label("Untere Grenze a verringern").click(); page.wait_for_timeout(100)
        pruefe(lab.locator("[data-grenze=a]").inner_text().strip().endswith("−0,5"), f"{breite}: Grenze a lässt sich nicht verschieben")
        lab.get_by_role("button", name="eˣ", exact=True).click(); page.wait_for_timeout(150)
        f1 = float(lab.get_attribute("data-fehler"))
        pruefe(lab.get_attribute("data-funktion") == "exp" and abs(f1 - 0.03167) < 1e-4, f"{breite}: e-Funktion im Labor falsch ({f1})")
        pruefe(lab.get_by_text("Kein Polynom").count() == 1, f"{breite}: Hinweis „kein Polynom“ fehlt")
        lab.get_by_role("button", name="2 Fässer").click(); page.wait_for_timeout(150)
        f2 = float(lab.get_attribute("data-fehler"))
        pruefe(0 < f2 < f1 / 10, f"{breite}: zwei Fässer verkleinern den Fehler nicht ({f2})")
        pruefe(lab.locator("[data-flaechen-bild] circle").count() == 5, f"{breite}: bei zwei Fässern fehlen Messpunkte")
        lab.get_by_role("button", name="Parabel zeigen").click(); page.wait_for_timeout(100)
        breite_ok("Flächen-Labor")
        lab.scroll_into_view_if_needed(); page.screenshot(path=f"{AUS}/{breite}-labor.png")

        # Fass-Labor
        fl = page.locator("[data-fass-labor]")
        fl.get_by_role("button", name="Zylinder", exact=True).click(); page.wait_for_timeout(100)
        pruefe(fl.locator("[data-fass-liter]").inner_text().strip() == "157,1 l", f"{breite}: Zylinder-Volumen falsch ({fl.locator('[data-fass-liter]').inner_text()})")
        pruefe(fl.get_by_text("die Fassregel ist exakt").count() == 1, f"{breite}: Hinweis „exakt“ beim Zylinder fehlt")
        fl.get_by_label("Radius Mitte erhöhen").click(); page.wait_for_timeout(100)
        pruefe(float(fl.get_attribute("data-volumen")) > 157.1, f"{breite}: Radius Mitte ändert das Volumen nicht")
        pruefe(fl.get_by_text("Die Fassregel liegt").count() == 1, f"{breite}: Abweichung beim gebogenen Fass fehlt")
        breite_ok("Fass-Labor")
        fl.scroll_into_view_if_needed(); page.screenshot(path=f"{AUS}/{breite}-fasslabor.png")

        # Übungen: je Art eine Aufgabe falsch, dann richtig
        karte = page.locator("[data-fasstrainer]")
        def stufe_auf(ziel):
            for _ in range(5): page.get_by_role("button", name="Schwierigkeit verringern").click(); page.wait_for_timeout(60)
            for _ in range(ziel - 1): page.get_by_role("button", name="Schwierigkeit erhöhen").click(); page.wait_for_timeout(60)
        def fuellen(werte):
            for k, v in werte.items():
                if k == "ex": karte.locator(f"[data-wahl={v}]").click()
                else: karte.locator(f"[data-feld={k}]").fill(str(v))
        def pruefen():
            karte.get_by_role("button", name="Prüfen").click(); page.wait_for_timeout(200)
        for typ, stufe in (("Fassregel anwenden", 3), ("Exakt oder nicht?", 4), ("Fassvolumen", 3), ("Parabel und Gewichte", 5)):
            page.get_by_role("button", name=typ, exact=True).click(); page.wait_for_timeout(150)
            stufe_auf(stufe)
            a = page.evaluate("window.__fassAufgabe")
            pruefe(a["stufe"] == stufe, f"{breite}: {typ}: Stufe {a['stufe']} statt {stufe}")
            l = dict(a["loesung"])
            falsch = dict(l)
            if a["art"] == "anwenden": falsch["N"] = "999"
            elif a["art"] == "exakt": falsch["ex"] = "ja" if l["ex"] == "nein" else "nein"
            elif a["art"] == "fass": falsch["V"] = "1"
            else: falsch = {"g0": "0", "g1": "0", "g2": "0"}
            fuellen(falsch); pruefen()
            pruefe(karte.get_by_text("Stimmt noch nicht.").count() == 1, f"{breite}: {typ}: falsche Antwort nicht erkannt")
            grund = karte.locator("[data-ergebnis=falsch] p").nth(1).inner_text()
            pruefe(len(grund) > 20, f"{breite}: {typ}: Rückmeldung fehlt")
            karte.get_by_role("button", name="Rechenweg zeigen").click(); page.wait_for_timeout(100)
            fuellen(l); pruefen()
            pruefe(karte.get_by_text("Stimmt!").count() == 1, f"{breite}: {typ} (Stufe {a['stufe']}) nicht als richtig erkannt: {l}")
            breite_ok(typ)
            karte.scroll_into_view_if_needed(); page.screenshot(path=f"{AUS}/{breite}-uebung-{a['art']}.png")
            page.get_by_role("button", name="Nächste Aufgabe").click(); page.wait_for_timeout(100)

        # Kolloquium
        page.get_by_role("button", name="Antwort aufdecken").click(); page.wait_for_timeout(150)
        page.get_by_role("button", name="Konnte ich").click(); page.wait_for_timeout(150)
        pruefe(page.get_by_text(re.compile(r"^1 von 12 sitzen$")).count() == 1, f"{breite}: Kolloquium zählt nicht")
        breite_ok("Ende")
        page.screenshot(path=f"{AUS}/{breite}-ende.png")
        pruefe(not konsole, f"{breite}: Konsolenfehler {konsole[:3]}")
        ctx.close()
    b.close()

print("OK" if not fehler else f"{len(fehler)} Fehler")
raise SystemExit(1 if fehler else 0)
