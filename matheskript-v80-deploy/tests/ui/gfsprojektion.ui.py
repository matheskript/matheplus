"""Browser-Test: GFS-Themenseite „Projektionen mit Matrizen“ (/gfs-trainer/projektion-matrizen).
Prüft bei 360, 390 und 1280 px: Seite lädt direkt über einen Alias, Kurs-Liste (Kursstufe 2 → Projektionen mit Matrizen),
Kopf mit Bild und Chips, vier Animationen (die erste spielt von selbst, „lot“ wird bedient und ans Ende gezogen),
Labor (Schattenmatrix ändert nur die dritte Spalte, Probe A · A = A, Ebene mit Normalenvektor per Plus/Minus),
alle vier Übungsarten (erst falsch mit gezielter Rückmeldung, dann richtig mit den Werten aus window.__projAufgabe),
Kolloquium – ohne Überbreite und ohne Konsolenfehler.
  Dev-Server:  cd matheskript-v80-deploy && npx vite --port 4398 --strictPort &
               BASE_URL=http://localhost:4398/ python3 tests/ui/gfsprojektion.ui.py
"""
import os, re, json
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
AUS = os.environ.get("SCREENS", "/tmp/gfsprojektion")
os.makedirs(AUS, exist_ok=True)
INIT = "localStorage.clear(); localStorage.setItem('mm-start-app','1'); localStorage.setItem('mm-onboarding-v1', JSON.stringify({uebersprungen:true}))"
LEITFRAGE = "Wie macht man aus einem Körper im Raum ein flaches Bild – und warum genügt dafür eine Matrix?"
fehler = []
def pruefe(bed, text):
    if not bed: fehler.append(text); print("FEHLT:", text)
def matrix(lab):
    return json.loads(lab.get_attribute("data-matrix"))

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

        # direkt über einen Alias
        page.goto(BASE + "projektionsmatrix"); page.wait_for_timeout(2500)
        pruefe(page.get_by_text(LEITFRAGE).count() >= 1, f"{breite}: Alias /projektionsmatrix öffnet die Seite nicht")

        # Kurs: Kursstufe 2 zeigt das Thema, Klick öffnet die Seite
        page.goto(BASE + "gfs-trainer"); page.wait_for_timeout(1500)
        page.locator(".gfs-stufe-knopf").click(); page.wait_for_timeout(200)
        page.get_by_role("option", name="Kursstufe 2").click(); page.wait_for_timeout(300)
        thema = page.locator(".gfs-thema-fertig", has_text="mit Matrizen")
        pruefe(thema.count() == 1, f"{breite}: Thema fehlt in Kursstufe 2")
        thema.click(); page.wait_for_timeout(2500)
        pruefe("projektion-matrizen" in page.url, f"{breite}: Themenseite nicht geöffnet ({page.url})")
        pruefe(page.get_by_text(LEITFRAGE).count() >= 1, f"{breite}: Leitfrage fehlt")
        pruefe(page.locator(".gtk-bild").count() == 1, f"{breite}: Kopfbild fehlt")
        for chip in ("Kursstufe 2", "Kap. VII", "4 Animationen"):
            pruefe(page.locator(".gtk-chips li", has_text=chip).count() == 1, f"{breite}: Chip {chip} fehlt")
        breite_ok("Kopf")
        page.screenshot(path=f"{AUS}/{breite}-kopf.png")

        # Animationen: vier, die erste ist offen und spielt
        anims = page.locator("[data-proj-anim]")
        pruefe(anims.count() == 4, f"{breite}: {anims.count()} statt 4 Animationen")
        erste = anims.first.locator("input[type=range]")
        pruefe(erste.count() == 1, f"{breite}: erste Animation nicht geöffnet")
        page.wait_for_timeout(1200)
        pruefe(float(erste.input_value()) > 0.3, f"{breite}: erste Animation spielt nicht")
        lot = page.locator("[data-proj-anim=lot]")
        lot.locator("button").first.click(); page.wait_for_timeout(300)
        lot.get_by_label("Schritt 3 abspielen").click(); page.wait_for_timeout(400)
        pruefe(lot.get_by_text("Schritt 3 von 5").count() == 1, f"{breite}: Schrittwechsel in der Lot-Animation fehlt")
        leiste = lot.locator("input[type=range]"); leiste.fill(leiste.get_attribute("max")); page.wait_for_timeout(250)
        pruefe(lot.get_by_text("Deshalb gilt A · A = A.").count() == 1, f"{breite}: Schluss der Lot-Animation fehlt")
        breite_ok("Animationen")
        lot.scroll_into_view_if_needed(); page.screenshot(path=f"{AUS}/{breite}-animation.png")

        # Labor: Schatten
        lab = page.locator("[data-proj-labor]")
        lab.scroll_into_view_if_needed()
        pruefe(lab.get_attribute("data-modus") == "schatten", f"{breite}: Labor startet nicht im Schatten-Modus")
        pruefe(matrix(lab) == [["1", "0", "1/2"], ["0", "1", "1"], ["0", "0", "0"]], f"{breite}: Schattenmatrix falsch {matrix(lab)}")
        lab.get_by_label("Komponente v1 erhöhen").click(); page.wait_for_timeout(100)
        lab.get_by_label("Komponente v2 verringern").click(); page.wait_for_timeout(100)
        m = matrix(lab)
        pruefe(m == [["1", "0", "1"], ["0", "1", "1/2"], ["0", "0", "0"]], f"{breite}: Licht (2 | 1 | −2) liefert {m}")
        lab.get_by_role("button", name="Probe A · A = A").click(); page.wait_for_timeout(150)
        pruefe(lab.locator("[data-probe=ja]").count() == 1, f"{breite}: Probe A · A = A beim Schatten fehlt")
        breite_ok("Labor Schatten")
        lab.scroll_into_view_if_needed(); page.screenshot(path=f"{AUS}/{breite}-labor.png")
        # Labor: Ebene
        lab.get_by_role("button", name="Senkrecht auf eine Ebene").click(); page.wait_for_timeout(150)
        pruefe(lab.get_attribute("data-modus") == "ortho", f"{breite}: Wechsel auf die Ebene fehlt")
        pruefe(matrix(lab) == [["8/9", "2/9", "2/9"], ["2/9", "5/9", "−4/9"], ["2/9", "−4/9", "5/9"]], f"{breite}: Ebenenmatrix falsch {matrix(lab)}")
        lab.get_by_label("Komponente n1 erhöhen").click(); page.wait_for_timeout(100)    # n = (0 | 2 | 2)
        pruefe(matrix(lab) == [["1", "0", "0"], ["0", "1/2", "−1/2"], ["0", "−1/2", "1/2"]], f"{breite}: n = (0 | 2 | 2) liefert {matrix(lab)}")
        lab.get_by_role("button", name="Probe A · A = A").click(); page.wait_for_timeout(150)
        pruefe(lab.locator("[data-probe=ja]").count() == 1, f"{breite}: Probe A · A = A bei der Ebene fehlt")
        lab.get_by_role("button", name="Lote ausblenden").click(); page.wait_for_timeout(100)
        pruefe(lab.get_by_role("button", name="Lote zeigen").count() == 1, f"{breite}: Lote lassen sich nicht ausblenden")
        breite_ok("Labor Ebene")
        lab.scroll_into_view_if_needed(); page.screenshot(path=f"{AUS}/{breite}-labor-ebene.png")

        # Übungen: je Art eine Aufgabe falsch, dann richtig
        karte = page.locator("[data-projtrainer]")
        def stufe_auf(ziel):
            for _ in range(5): page.get_by_role("button", name="Schwierigkeit verringern").click(); page.wait_for_timeout(60)
            for _ in range(ziel - 1): page.get_by_role("button", name="Schwierigkeit erhöhen").click(); page.wait_for_timeout(60)
        def fuellen(werte):
            for k, v in werte.items(): karte.locator(f"[data-feld={k}]").fill(str(v).replace("−", "-"))
        def pruefen():
            karte.get_by_role("button", name="Prüfen").click(); page.wait_for_timeout(200)
        for typ, stufe in (("Matrix mal Vektor", 5), ("Matrix aufstellen", 3), ("Schattenpunkt", 3), ("Lot auf eine Ebene", 4)):
            page.get_by_role("button", name=typ, exact=True).click(); page.wait_for_timeout(150)
            stufe_auf(stufe)
            a = page.evaluate("window.__projAufgabe")
            pruefe(a["stufe"] == stufe, f"{breite}: {typ}: Stufe {a['stufe']} statt {stufe}")
            l = dict(a["loesung"])
            falsch = dict(l)
            erster = sorted(l.keys())[0]
            falsch[erster] = "999"
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
        pruefe(page.get_by_text(re.compile(r"^1 von 11 sitzen$")).count() == 1, f"{breite}: Kolloquium zählt nicht")
        breite_ok("Ende")
        page.screenshot(path=f"{AUS}/{breite}-ende.png")
        pruefe(not konsole, f"{breite}: Konsolenfehler {konsole[:3]}")
        ctx.close()
    b.close()

print("OK" if not fehler else f"{len(fehler)} Fehler")
raise SystemExit(1 if fehler else 0)
