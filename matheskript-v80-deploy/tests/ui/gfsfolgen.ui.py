"""Browser-Test: GFS-Themenseite „Folgen und Grenzwerte“ (/gfs-trainer/folgen).
Prüft bei 360, 390 und 1280 px: Kurs-Liste (Kursstufe 1), Kopfbild, fünf Animationen (die erste spielt, eine zweite
springt zu Schritt 3), Labor (geometrisch mit q-Regler und ε, arithmetisch ohne Grenzwert, 1/n mit n₀ = 101,
harmonisch mit Schranke), alle vier Übungstypen (erst eine typisch falsche Antwort aus den Fallen mit eigener
Rückmeldung, dann die richtige aus window.__gfoAufgabe), Kolloquium – ohne Überbreite und ohne Konsolenfehler.
  npx vite --port 4395 --strictPort &   →   BASE_URL=http://localhost:4395/ python3 tests/ui/gfsfolgen.ui.py
"""
import os
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
AUS = os.environ.get("SCREENS", "/tmp/gfsfolgen")
os.makedirs(AUS, exist_ok=True)
fehler = []
def pruefe(bed, text):
    if not bed: fehler.append(text); print("FEHLT:", text)

def eingabe(feld, wert):
    """so, wie es ein Schüler tippt: gerundete Felder mit Komma, sonst exakt (Bruch mit /)"""
    z, n = wert["z"], wert["n"]
    if feld["typ"] == "gerundet":
        stellen = 2 if feld.get("einheit") == "€" else feld.get("stellen", 2)
        return f"{z / n:.{stellen}f}".replace(".", ",")
    return str(z) if n == 1 else f"{z}/{n}"

START = ("try{if(!sessionStorage.getItem('gfo-test')){localStorage.clear();localStorage.setItem('mm-start-app','1');"
         "localStorage.setItem('mm-onboarding-v1',JSON.stringify({uebersprungen:true}));sessionStorage.setItem('gfo-test','1')}}catch(e){}")

with sync_playwright() as p:
    b = p.chromium.launch()
    for breite in (360, 390, 1280):
        ctx = b.new_context(viewport={"width": breite, "height": 900}, device_scale_factor=2, locale="de-DE")
        ctx.add_init_script(START)
        page = ctx.new_page()
        konsole = []
        page.on("pageerror", lambda e: konsole.append(f"pageerror: {e}"))
        page.on("console", lambda m: konsole.append(m.text) if m.type == "error" and "net::" not in m.text and "Failed to load resource" not in m.text else None)
        def breite_ok(wo):
            sw = page.evaluate("document.documentElement.scrollWidth"); pruefe(sw <= breite, f"{breite}: Überbreite bei {wo}: {sw}")

        # Kurs: Kursstufe 1 zeigt das Thema
        page.goto(BASE + "gfs-trainer"); page.wait_for_timeout(1500)
        page.locator(".gfs-stufe-knopf").click(); page.wait_for_timeout(150)
        page.get_by_role("option", name="Kursstufe 1").click(); page.wait_for_timeout(250)
        thema = page.locator(".gfs-thema-fertig", has_text="Folgen und Grenzwerte")
        pruefe(thema.count() == 1, f"{breite}: Thema fehlt in Kursstufe 1")
        thema.click(); page.wait_for_timeout(1500)
        pruefe("gfs-trainer/folgen" in page.url, f"{breite}: Themenseite nicht geöffnet ({page.url})")
        # und direkt über einen Alias
        page.goto(BASE + "zahlenfolgen"); page.wait_for_timeout(1500)
        pruefe(page.get_by_text("Kann man unendlich viele Zahlen addieren").count() >= 1, f"{breite}: Leitfrage fehlt")
        pruefe(page.locator(".gtk-bild").count() == 1, f"{breite}: Kopfbild fehlt")
        pruefe(page.locator(".gtk-chips li", has_text="5 Animationen").count() == 1, f"{breite}: Chip „5 Animationen“ fehlt")
        breite_ok("Seite")
        page.screenshot(path=f"{AUS}/{breite}-kopf.png")

        # Animationen: fünf, die erste ist offen und spielt; die zweite aufklappen und zu Schritt 3 springen
        anims = page.locator("[data-folgen-anim]")
        pruefe(anims.count() == 5, f"{breite}: {anims.count()} statt 5 Animationen")
        erste = anims.first.locator("input[type=range]")
        pruefe(erste.count() == 1, f"{breite}: erste Animation nicht geöffnet")
        t0 = float(erste.input_value()); page.wait_for_timeout(900); t1 = float(erste.input_value())
        pruefe(t1 > t0, f"{breite}: erste Animation spielt nicht ({t0} → {t1})")
        zweite = anims.nth(1)
        zweite.locator("button").first.click(); page.wait_for_timeout(300)
        zweite.get_by_label("Schritt 3 abspielen").click(); page.wait_for_timeout(400)
        pruefe(zweite.get_by_text("Schritt 3 von").count() == 1, f"{breite}: Schrittwechsel in Animation 2 fehlt")
        # alle übrigen öffnen und ans Ende springen (Schlussbild)
        for i in range(2, 5):
            a = anims.nth(i)
            a.locator("button").first.click(); page.wait_for_timeout(250)
            r = a.locator("input[type=range]")
            r.fill(r.get_attribute("max")); page.wait_for_timeout(150)
            pruefe(a.get_by_text("Schritt 5 von").count() == 1, f"{breite}: Animation {i + 1} erreicht ihr Ende nicht")
        breite_ok("Animationen")
        zweite.scroll_into_view_if_needed(); page.screenshot(path=f"{AUS}/{breite}-animation.png")

        # Labor
        labor = page.locator("[data-folgen-labor]")
        pruefe(labor.get_attribute("data-art") == "geo" and labor.get_attribute("data-n0") == "12", f"{breite}: Labor-Start (q = 0,8, ε = 0,1 → n₀ = 12) falsch: {labor.get_attribute('data-n0')}")
        labor.locator("input[type=range][aria-label='Quotient q']").fill("10"); page.wait_for_timeout(150)          # q = 0,5
        pruefe(labor.get_attribute("data-n0") == "5", f"{breite}: q = 0,5, ε = 0,1 → n₀ = 5, ist {labor.get_attribute('data-n0')}")
        labor.locator("input[type=range][aria-label='Schlauch ε']").fill("6"); page.wait_for_timeout(150)        # ε = 0,01
        pruefe(labor.get_attribute("data-n0") == "8", f"{breite}: q = 0,5, ε = 0,01 → n₀ = 8, ist {labor.get_attribute('data-n0')}")
        labor.locator("input[type=range][aria-label='Quotient q']").fill("-22"); page.wait_for_timeout(150)       # q = −1,1
        pruefe(labor.get_attribute("data-n0") == "" and labor.get_by_text("|q| > 1", exact=False).count() >= 1, f"{breite}: |q| > 1 ohne Grenzwert nicht erkannt")
        labor.get_by_role("button", name="1/n", exact=True).click(); page.wait_for_timeout(150)
        pruefe(labor.get_attribute("data-n0") == "101", f"{breite}: 1/n mit ε = 0,01 → n₀ = 101, ist {labor.get_attribute('data-n0')}")
        breite_ok("Labor 1/n")
        labor.get_by_role("button", name="arithmetisch", exact=True).click(); page.wait_for_timeout(150)
        pruefe(labor.get_attribute("data-n0") == "" and labor.get_by_text("keiner").count() >= 1, f"{breite}: arithmetische Folge hat keinen Grenzwert")
        labor.get_by_role("button", name="harmonisch", exact=True).click(); page.wait_for_timeout(150)
        labor.locator("input[type=range][aria-label='Schranke S']").fill("4"); page.wait_for_timeout(150)
        pruefe(labor.get_attribute("data-ns") == "31", f"{breite}: Hₙ > 4 ab n = 31, ist {labor.get_attribute('data-ns')}")
        labor.locator("input[type=range][aria-label='Schranke S']").fill("10"); page.wait_for_timeout(200)
        pruefe(labor.get_attribute("data-ns") == "12367", f"{breite}: Hₙ > 10 ab n = 12367, ist {labor.get_attribute('data-ns')}")
        breite_ok("Labor")
        labor.get_by_role("button", name="geometrisch", exact=True).click(); page.wait_for_timeout(150)
        labor.scroll_into_view_if_needed(); page.screenshot(path=f"{AUS}/{breite}-labor.png")

        # Übungen: je Typ auf Stufe 2 und 5 erst eine typische falsche Antwort (Falle), dann die richtige
        karte = page.locator("[data-folgentrainer]")
        def fuellen(werte):
            for k, v in werte.items(): karte.locator(f"input[data-feld='{k}']").fill(str(v))
        def pruefen():
            karte.get_by_role("button", name="Prüfen").click(); page.wait_for_timeout(200)
        for typ in ("Rekursiv → explizit", "Summenformeln", "Grenzwert und ε", "Unendliche Reihe"):
            page.get_by_role("button", name=typ, exact=True).click(); page.wait_for_timeout(200)
            for klicks in (1, 3):
                for _ in range(klicks): page.get_by_role("button", name="Schwierigkeit erhöhen").click(); page.wait_for_timeout(120)
                a = page.evaluate("window.__gfoAufgabe")
                loesung = a["loesung"]
                if a["fallen"]:
                    falle = a["fallen"][0]
                    feld = next(f for f in a["felder"] if f["k"] == falle["k"])
                    fuellen({**loesung, falle["k"]: eingabe(feld, falle["wert"])}); pruefen()
                else:
                    fuellen({k: "12345" for k in loesung}); pruefen()
                pruefe(karte.get_by_text("Stimmt noch nicht.").count() == 1, f"{breite}: {typ} (Stufe {a['stufe']}): falsche Antwort nicht erkannt")
                rueck = karte.locator("[data-rueckmeldung] p").nth(1).inner_text() if karte.locator("[data-rueckmeldung] p").count() > 1 else ""
                pruefe(len(rueck) > 20, f"{breite}: {typ}: Rückmeldung fehlt ({rueck!r})")
                karte.get_by_role("button", name="Rechenweg zeigen").click(); page.wait_for_timeout(150)
                fuellen(loesung); pruefen()
                pruefe(karte.get_by_text("Stimmt!").count() == 1, f"{breite}: {typ} (Stufe {a['stufe']}) nicht als richtig erkannt: {loesung}")
                breite_ok(f"{typ} Stufe {a['stufe']}")
                if klicks == 3: karte.scroll_into_view_if_needed(); page.screenshot(path=f"{AUS}/{breite}-uebung-{a['art']}.png")
            page.get_by_role("button", name="Schwierigkeit verringern").click(); page.wait_for_timeout(80)
            for _ in range(4): page.get_by_role("button", name="Schwierigkeit verringern").click(); page.wait_for_timeout(60)

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
