"""Browser-Test: GFS-Themenseite „Wachstum und Differenzialgleichungen“ (/gfs-trainer/wachstum-differenzialgleichungen).
Prüft bei 360, 390 und 1280 px: Kurs-Liste (Kursstufe 1), direkter Pfad und Alias, Kopf mit Bild und drei Chips,
fünf Animationen (die erste offen und spielt, eine bis Schritt 3 gesprungen, alle bis zum Ende ohne NaN), Labor
(exponentiell: exakt gegen Euler, Δt verkleinern; beschränkt: Regler k, Warnung bei zu großem Δt; logistisch:
Zeitpunkt am Wendepunkt, Startwert per Tipp ins Bild), alle vier Übungstypen (Auswahl auf Stufe 1, dann je Typ
auf Stufe 2 erst eine typische Falle mit ihrer Rückmeldung, dann die richtige Lösung – abwechselnd gerundet und
exakt – aus window.__gwAufgabe), roter Faden und Kolloquium – ohne Überbreite und ohne Konsolenfehler.
  cd matheskript-v80-deploy && npx vite --port 4396 --strictPort &
  BASE_URL=http://localhost:4396/ python3 tests/ui/gfswachstum.ui.py
"""
import math
import os
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
AUS = os.environ.get("SCREENS", "/tmp/gfswachstum")
os.makedirs(AUS, exist_ok=True)
fehler = []
def pruefe(bed, text):
    if not bed: fehler.append(text); print("FEHLT:", text)

VORBEREITEN = """() => { localStorage.clear(); localStorage.setItem('mm-start-app','1');
  localStorage.setItem('mm-onboarding-v1', JSON.stringify({uebersprungen:true})); }"""
LEITFRAGE = "Wie kann man aus der Änderungsrate allein vorhersagen, wie sich ein Bestand entwickelt?"

def nah(a, b, e=1e-4):
    return abs(float(a) - b) <= e

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

        # Kurs: Kursstufe 1 zeigt das Thema, Klick öffnet die Seite
        page.goto(BASE + "gfs-trainer"); page.wait_for_timeout(1200)
        page.locator(".gfs-stufe-knopf").click(); page.wait_for_timeout(150)
        page.get_by_role("option", name="Kursstufe 1").click(); page.wait_for_timeout(250)
        thema = page.locator(".gfs-thema-fertig", has_text="Wachstum und DGL")   # die Liste zeigt den Kurztitel
        pruefe(thema.count() == 1, f"{breite}: Thema fehlt in Kursstufe 1")
        thema.click(); page.wait_for_timeout(1500)
        pruefe("gfs-trainer/wachstum-differenzialgleichungen" in page.url, f"{breite}: Themenseite nicht geöffnet ({page.url})")

        # Alias und direkter Pfad
        page.goto(BASE + "logistisches-wachstum"); page.wait_for_timeout(1500)
        pruefe(page.get_by_text(LEITFRAGE).count() >= 1, f"{breite}: Alias /logistisches-wachstum öffnet die Seite nicht")
        page.goto(BASE + "gfs-trainer/wachstum-differenzialgleichungen"); page.wait_for_timeout(1800)
        pruefe(page.get_by_text(LEITFRAGE).count() >= 1, f"{breite}: Leitfrage fehlt")
        pruefe(page.locator(".gtk-titel", has_text="Wachstum und Differenzial").count() == 1, f"{breite}: Titel im Kopf fehlt")
        pruefe(page.locator(".gtk-bild").count() == 1, f"{breite}: Kopfbild fehlt")
        chips = page.locator(".gtk-chips li").all_inner_texts()
        pruefe(chips == ["Kursstufe 1", "Kap. II", "5 Animationen"], f"{breite}: Chips {chips}")
        breite_ok("Seite")
        page.screenshot(path=f"{AUS}/{breite}-kopf.png")

        # Fünf Animationen: die erste ist offen und spielt; „logistisch“ aufklappen und zu Schritt 3 springen; alle ans Ende
        anims = page.locator("[data-wachstum-anim]")
        pruefe(anims.count() == 5, f"{breite}: {anims.count()} statt 5 Animationen")
        pruefe(anims.first.locator("input[type=range]").count() == 1, f"{breite}: erste Animation nicht geöffnet")
        page.wait_for_timeout(1500)
        t0 = float(anims.first.locator("input[type=range]").input_value())
        pruefe(t0 > 0.3, f"{breite}: erste Animation spielt nicht ({t0})")
        lo = page.locator("[data-wachstum-anim=logistisch]")
        lo.locator("button").first.click(); page.wait_for_timeout(300)
        lo.get_by_label("Schritt 3 abspielen").click(); page.wait_for_timeout(400)
        pruefe(lo.get_by_text("Schritt 3 von 4").count() == 1, f"{breite}: Schrittwechsel in der Animation „logistisch“ fehlt")
        for art in ("feld", "exp", "beschraenkt", "logistisch", "euler"):
            k = page.locator(f"[data-wachstum-anim={art}]")
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
        labor = page.locator("[data-wachstum-labor]")
        labor.scroll_into_view_if_needed()
        pruefe(labor.get_attribute("data-modell") == "exp", f"{breite}: Labor startet nicht exponentiell")
        pruefe(nah(labor.get_attribute("data-exakt"), math.exp(1.25)), f"{breite}: exakt f(5) = {labor.get_attribute('data-exakt')} statt e^1,25")
        pruefe(nah(labor.get_attribute("data-euler"), 1.25 ** 5), f"{breite}: Euler Δt = 1 → {labor.get_attribute('data-euler')} statt 1,25^5")
        labor.get_by_role("button", name="Δt = 0,1").click(); page.wait_for_timeout(150)
        pruefe(nah(labor.get_attribute("data-euler"), 1.025 ** 50), f"{breite}: Euler Δt = 0,1 → {labor.get_attribute('data-euler')}")
        pruefe(labor.get_by_text("Abweichung").count() == 1, f"{breite}: Vergleich exakt/Euler fehlt")
        breite_ok("Labor exponentiell")
        if breite in (390, 1280): labor.screenshot(path=f"{AUS}/{breite}-labor-exp.png")
        labor.get_by_role("button", name="beschränkt", exact=True).click(); page.wait_for_timeout(150)
        pruefe(nah(labor.get_attribute("data-exakt"), 8 - 7 * math.exp(-2)), f"{breite}: beschränkt exakt {labor.get_attribute('data-exakt')}")
        pruefe(nah(labor.get_attribute("data-euler"), 8 - 7 * 0.96 ** 50), f"{breite}: beschränkt Euler {labor.get_attribute('data-euler')}")
        labor.get_by_label("k", exact=True).fill("1"); page.wait_for_timeout(150)
        pruefe(labor.get_attribute("data-k") == "1", f"{breite}: Regler k wirkt nicht ({labor.get_attribute('data-k')})")
        pruefe(nah(labor.get_attribute("data-exakt"), 8 - 7 * math.exp(-5)), f"{breite}: k = 1 → exakt {labor.get_attribute('data-exakt')}")
        pruefe(labor.locator("[data-labor-warnung]").count() == 0, f"{breite}: Warnung zu früh")
        labor.get_by_role("button", name="Δt = 2,5").click(); page.wait_for_timeout(150)
        pruefe(labor.locator("[data-labor-warnung]").count() == 1, f"{breite}: keine Warnung bei k · Δt > 1")
        breite_ok("Labor beschränkt")
        if breite in (390, 1280): labor.screenshot(path=f"{AUS}/{breite}-labor-beschraenkt.png")
        labor.get_by_role("button", name="logistisch", exact=True).click(); page.wait_for_timeout(150)
        pruefe(nah(labor.get_attribute("data-exakt"), 10 / (1 + 19 * math.exp(-5))), f"{breite}: logistisch exakt {labor.get_attribute('data-exakt')}")
        labor.get_by_label("Zeitpunkt t", exact=True).fill("2.9"); page.wait_for_timeout(150)
        pruefe(float(labor.get_attribute("data-steigung")) > 2.49, f"{breite}: Steigung am Wendepunkt {labor.get_attribute('data-steigung')}")
        pruefe(labor.get_by_text("Wendepunkt bei t ≈ 2,94").count() == 1, f"{breite}: Wendepunkt-Angabe fehlt")
        svg = labor.locator("svg").first
        kasten = svg.bounding_box()
        svg.click(position={"x": kasten["width"] * 0.6, "y": kasten["height"] * 0.3}); page.wait_for_timeout(150)
        f0 = float(labor.get_attribute("data-f0"))
        pruefe(6 < f0 < 10, f"{breite}: Tipp ins Bild setzt f(0) nicht ({f0})")
        breite_ok("Labor logistisch")
        if breite in (390, 1280): labor.screenshot(path=f"{AUS}/{breite}-labor-logistisch.png")

        # Übungen: Auswahl auf Stufe 1, dann je Typ auf Stufe 2 erst eine Falle, dann richtig (abwechselnd gerundet und exakt)
        karte = page.locator("[data-wachstumtrainer]")
        def pruefen():
            karte.get_by_role("button", name="Prüfen").click(); page.wait_for_timeout(200)
        a = page.evaluate("window.__gwAufgabe")
        pruefe(a["art"] == "dgl" and a["stufe"] == 1 and a.get("mc"), f"{breite}: Stufe 1 ist keine Auswahlaufgabe")
        falsch = [i for i in a["reihenfolge"] if i != a["richtig"]][0]
        karte.locator(f"button[data-option='{falsch}']").click(); pruefen()
        pruefe(karte.get_by_text("Stimmt noch nicht.").count() == 1, f"{breite}: falsche Auswahl nicht erkannt")
        grund = karte.locator("p").filter(has_text="Stimmt noch nicht.").locator("xpath=following-sibling::p[1]").inner_text()
        pruefe(grund == a["fehler"][falsch], f"{breite}: Rückmeldung zur Auswahl „{grund}“")
        karte.locator(f"button[data-option='{a['richtig']}']").click(); pruefen()
        pruefe(karte.get_by_text("Stimmt!").count() == 1, f"{breite}: richtige Auswahl nicht erkannt")
        page.get_by_role("button", name="Schwierigkeit erhöhen").click(); page.wait_for_timeout(200)
        def fuellen(werte):
            for f, v in zip(karte.locator("input[data-mathe-modus]").all(), werte):
                f.fill(str(v))
        for nr, typ in enumerate(("DGL und Lösung", "Parameter bestimmen", "Bestand und Zeitpunkt", "Euler-Verfahren")):
            page.get_by_role("button", name=typ, exact=True).click(); page.wait_for_timeout(200)
            a = page.evaluate("window.__gwAufgabe")
            pruefe(a["stufe"] == 2 and not a.get("mc"), f"{breite}: {typ}: Stufe {a['stufe']}")
            schluessel = [f[0] for f in a["felder"]]
            pruefe(karte.locator("input[data-mathe-modus]").count() == len(schluessel), f"{breite}: {typ}: Felder fehlen")
            erste = schluessel[0]
            soll = a["soll"][erste]
            wert, text = next((w, t) for w, t in a["fallen"][erste] if abs(w - soll) > 0.02 * max(1, abs(soll)))
            eingabe = [a["exakt"][k] for k in schluessel]
            eingabe[0] = f"{wert:.6f}".replace(".", ",")
            fuellen(eingabe); pruefen()
            pruefe(karte.get_by_text("Stimmt noch nicht.").count() == 1, f"{breite}: {typ}: falsche Antwort {eingabe} nicht erkannt")
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
        pruefe(page.get_by_text("5 von 10 richtig").count() == 1, f"{breite}: Zähler der Übungen")

        # Roter Faden und Kolloquium
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
