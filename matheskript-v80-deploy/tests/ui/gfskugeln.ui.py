"""Browser-Test: GFS-Themenseite „Kugeln“ (/gfs-trainer/kugeln).
Prüft bei 360, 390 und 1280 px: Kurs-Liste (Kursstufe 1 → Kugeln), Pfad direkt (Alias /kugelgleichung), Kopfbild, vier
Animationen (die erste spielt; „Gerade“ springt zu Schritt 4 und ans Ende → Passante; die übrigen ans Ende), Labor
(Gerade: Sekante → Tangente → Passante per Regler; Ebene: kein Punkt → Schnittkreis → Berührpunkt nach r + 1; Mittelpunkt
per Plus/Minus), alle vier Übungsarten (je eine falsche Antwort mit Rückmeldung, dann die richtige aus
window.__kugelAufgabe), Sehne auf Stufe 5 gerundet eingegeben, Kolloquium – ohne Überbreite und ohne Konsolenfehler.
  cd matheskript-v80-deploy && npx vite --port 4397 --strictPort &   →   BASE_URL=http://localhost:4397/ python3 tests/ui/gfskugeln.ui.py
"""
import math, os
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
AUS = os.environ.get("SCREENS", "/tmp/gfskugeln")
os.makedirs(AUS, exist_ok=True)
fehler = []
def pruefe(bed, text):
    if not bed: fehler.append(text); print("FEHLT:", text)

def wert(w):
    """wzahl-Array [{w, c: {z, n}}] → Zahl"""
    return sum(t["c"]["z"] / t["c"]["n"] * math.sqrt(t["w"]) for t in w)

def falsch_fuer(a):
    """Erstes Zahlenfeld auf 999 – passt zu keiner Aufgabe (auch nicht vervielfacht oder vertauscht)."""
    L = dict(a["loesung"])
    k = next(k for k in a["keys"] if a["typen"][k] != "wahl")
    L[k] = "999"
    return L

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

        page.goto(BASE)
        page.evaluate("localStorage.clear(); localStorage.setItem('mm-start-app','1'); localStorage.setItem('mm-onboarding-v1', JSON.stringify({uebersprungen:true}))")
        # Kurs: Kursstufe 1 zeigt das Thema, Klick öffnet die Seite
        page.goto(BASE + "gfs-trainer"); page.wait_for_timeout(1200)
        page.locator(".gfs-stufe-knopf").click(); page.wait_for_timeout(200)
        page.get_by_role("option", name="Kursstufe 1").click(); page.wait_for_timeout(300)
        thema = page.locator(".gfs-thema-fertig", has_text="Kugeln")
        pruefe(thema.count() == 1, f"{breite}: Thema fehlt in Kursstufe 1")
        thema.click(); page.wait_for_timeout(1500)
        pruefe("kugeln" in page.url, f"{breite}: Themenseite nicht geöffnet ({page.url})")
        # Pfad direkt (Alias)
        page.goto(BASE + "kugelgleichung"); page.wait_for_timeout(1800)
        pruefe(page.get_by_text("Wie beschreibt man eine Kugel mit einer Gleichung").count() >= 1, f"{breite}: Leitfrage fehlt")
        pruefe(page.locator(".gtk-bild").count() == 1, f"{breite}: Kopfbild fehlt")
        pruefe(page.locator(".gtk-chips li", has_text="4 Animationen").count() == 1, f"{breite}: Chips fehlen")
        breite_ok("Seite")
        page.screenshot(path=f"{AUS}/{breite}-kopf.png")

        # Vier Animationen: die erste ist offen und spielt; „Gerade“: Schritt 4, dann ans Ende
        anims = page.locator("[data-kugel-anim]")
        pruefe(anims.count() == 4, f"{breite}: {anims.count()} statt 4 Animationen")
        erste = anims.first
        pruefe(erste.locator("input[type=range]").count() == 1, f"{breite}: erste Animation nicht geöffnet")
        t0 = float(erste.locator("input[type=range]").input_value()); page.wait_for_timeout(700)
        pruefe(float(erste.locator("input[type=range]").input_value()) > t0, f"{breite}: erste Animation spielt nicht")
        ger = page.locator("[data-kugel-anim=gerade]")
        ger.locator("button").first.click(); page.wait_for_timeout(300)
        ger.get_by_label("Schritt 4 abspielen").click(); page.wait_for_timeout(400)
        pruefe(ger.get_by_text("Schritt 4 von").count() == 1, f"{breite}: Schrittwechsel in der Geraden-Animation fehlt")
        leiste = ger.locator("input[type=range]"); leiste.fill(leiste.get_attribute("max")); page.wait_for_timeout(250)
        pruefe(ger.get_by_text("Passante: kein gemeinsamer Punkt").count() == 1, f"{breite}: Schlussbild der Geraden-Animation falsch")
        for art in ("ebene", "tangential"):
            k = page.locator(f"[data-kugel-anim={art}]")
            k.locator("button").first.click(); page.wait_for_timeout(250)
            l = k.locator("input[type=range]"); l.fill(l.get_attribute("max")); page.wait_for_timeout(150)
        pruefe(page.locator("[data-kugel-anim=ebene]").get_by_text("ρ = 5", exact=True).count() == 1, f"{breite}: Großkreis im Schlussbild fehlt")
        pruefe(page.locator("[data-kugel-anim=tangential]").get_by_text("Kreisradius 2,5").count() == 1, f"{breite}: gekippte Ebene im Schlussbild fehlt")
        breite_ok("Animationen")
        ger.scroll_into_view_if_needed(); page.screenshot(path=f"{AUS}/{breite}-animation.png")

        # Labor: Gerade d = 3 → 5 → 6, Ebene d = 6 → 3, r + 1 und d = 6 → Berührpunkt
        lab = page.locator("[data-kugel-labor]")
        lab.scroll_into_view_if_needed()
        regler = lab.locator("input[type=range]")
        pruefe(lab.get_attribute("data-lage") == "sekante", f"{breite}: Labor startet nicht als Sekante")
        pruefe(lab.get_by_text("Sehne").count() >= 1, f"{breite}: Sehne fehlt im Labor")
        regler.fill("5"); page.wait_for_timeout(150)
        pruefe(lab.get_attribute("data-lage") == "tangente", f"{breite}: d = 5 ergibt keine Tangente")
        pruefe(lab.locator("[data-lage-box]").inner_text().startswith("Tangente"), f"{breite}: Lage-Kasten zeigt keine Tangente")
        page.screenshot(path=f"{AUS}/{breite}-labor-tangente.png")
        regler.fill("-6"); page.wait_for_timeout(150)
        pruefe(lab.get_attribute("data-lage") == "passante", f"{breite}: d = 6 ergibt keine Passante")
        lab.get_by_role("button", name="m1 erhöhen").click(); page.wait_for_timeout(100)
        pruefe(lab.get_by_text("Passante", exact=True).count() == 1, f"{breite}: Mittelpunkt verschieben ändert die Lage")
        lab.get_by_role("button", name="Ebene", exact=True).click(); page.wait_for_timeout(200)
        pruefe(lab.get_attribute("data-modus") == "ebene" and lab.get_attribute("data-lage") == "keine", f"{breite}: Ebene mit d = 6 nicht „keine“")
        regler.fill("3"); page.wait_for_timeout(150)
        pruefe(lab.get_attribute("data-lage") == "kreis", f"{breite}: Ebene mit d = 3 kein Schnittkreis")
        pruefe(lab.get_by_text("Schnittkreis", exact=True).count() == 1, f"{breite}: Schnittkreis-Text fehlt")
        lab.get_by_role("button", name="Radius erhöhen").click(); regler.fill("6"); page.wait_for_timeout(150)
        pruefe(lab.get_attribute("data-r") == "6" and lab.get_attribute("data-lage") == "beruehrt", f"{breite}: r = 6, d = 6 berührt nicht")
        breite_ok("Labor")
        lab.scroll_into_view_if_needed(); page.screenshot(path=f"{AUS}/{breite}-labor.png")

        # Übungen: je Art auf Stufe 2 erst falsch, dann richtig
        karte = page.locator("[data-kugeltrainer]")
        def pruefen():
            karte.get_by_role("button", name="Prüfen").click(); page.wait_for_timeout(250)
        def fuellen(a, werte):
            for k, v in werte.items():
                if a["typen"][k] == "wahl": karte.locator(f"button[data-wahl='{v}']").click()
                else: karte.locator(f"input[data-feld='{k}']").fill(str(v))
        for typ in ("Kugelgleichung", "Punkt und Gerade", "Ebene und Kugel", "Tangentialebene"):
            page.get_by_role("button", name=typ, exact=True).click(); page.wait_for_timeout(200)
            if page.evaluate("window.__kugelAufgabe.stufe") < 2:
                page.get_by_role("button", name="Schwierigkeit erhöhen").click(); page.wait_for_timeout(200)
            a = page.evaluate("window.__kugelAufgabe")
            pruefe(a["stufe"] == 2, f"{breite}: {typ}: Stufe {a['stufe']} statt 2")
            fuellen(a, falsch_fuer(a)); pruefen()
            pruefe(karte.get_by_text("Stimmt noch nicht.").count() == 1, f"{breite}: {typ}: falsche Antwort nicht erkannt")
            pruefe(len(karte.locator("[data-grund]").inner_text()) > 30, f"{breite}: {typ}: Rückmeldung fehlt")
            karte.get_by_role("button", name="Rechenweg zeigen").click(); page.wait_for_timeout(150)
            fuellen(a, a["loesung"]); pruefen()
            pruefe(karte.get_by_text("Stimmt!").count() == 1, f"{breite}: {typ} (Stufe 2) nicht als richtig erkannt")
            breite_ok(typ)
            karte.scroll_into_view_if_needed(); page.screenshot(path=f"{AUS}/{breite}-uebung-{a['art']}.png")
        # Stufe 5 von „Punkt und Gerade“: Sehnenlänge gerundet
        page.get_by_role("button", name="Punkt und Gerade", exact=True).click(); page.wait_for_timeout(200)
        for _ in range(3): page.get_by_role("button", name="Schwierigkeit erhöhen").click(); page.wait_for_timeout(120)
        a = page.evaluate("window.__kugelAufgabe")
        pruefe(a["art"] == "gerade" and a["stufe"] == 5, f"{breite}: Stufe 5 ist keine Sehnenaufgabe")
        karte.locator("input[data-feld='s']").fill(f"{wert(a['soll']['s']):.2f}".replace(".", ",")); pruefen()
        pruefe(karte.get_by_text("Stimmt!").count() == 1, f"{breite}: gerundete Sehne nicht als richtig erkannt")
        breite_ok("Übungen")
        karte.scroll_into_view_if_needed(); page.screenshot(path=f"{AUS}/{breite}-uebung.png")

        # Kolloquium
        page.get_by_role("button", name="Antwort aufdecken").click(); page.wait_for_timeout(150)
        page.get_by_role("button", name="Konnte ich").click(); page.wait_for_timeout(150)
        pruefe(page.get_by_text("1 von 12 sitzen").count() == 1, f"{breite}: Kolloquium zählt nicht")
        breite_ok("Ende")
        page.screenshot(path=f"{AUS}/{breite}-ende.png")
        pruefe(not konsole, f"{breite}: Konsolenfehler {konsole[:3]}")
        ctx.close()
    b.close()

print("OK" if not fehler else f"{len(fehler)} Fehler")
raise SystemExit(1 if fehler else 0)
