"""Hesse-Normalenform (/hesse-normalenform), seit 22.10. mit Motion-Animationen – bei 360/390/860/1280 px:
- drei Schritte (Die Idee · Hesse-Normalenform · Trainieren), keine Konsolenfehler, keine Überbreite
- Die Idee: Vermutung → Animation v_normalenform (blauer Abspieler, Kapitelmarken) → Kernsatz → X mit s, t, h,
  Skalarprodukt bleibt 0 in der Ebene und wird ≠ 0 bei h ≠ 0 → Koordinatenform
- Hesse-Normalenform: drei Schreibweisen, Animation v_hnf, Q durch die Ebene → Vorzeichen wechselt
- Trainieren: Vermutung → Bild → Lösung zeigen → Rechenweg → Neue Aufgabe setzt zurück
- Desktop ab 840 px: Arbeitsfläche; Handy: keine
Aufruf: BASE_URL=http://localhost:4173/ python3 tests/ui/hesse.ui.py [bilderordner]"""
import os, sys
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
BILDER = sys.argv[1] if len(sys.argv) > 1 else None
bekannt = lambda t: "net::" in t or "Failed to load resource" in t
fehler = []
def pruefe(bed, text):
    if not bed: fehler.append(text)

with sync_playwright() as p:
    br = p.chromium.launch()
    for w in (360, 390, 860, 1280):
        ctx = br.new_context(viewport={"width": w, "height": 900})
        pg = ctx.new_page()
        kons = []
        pg.on("pageerror", lambda e: kons.append(str(e)))
        pg.on("console", lambda m: kons.append(m.text) if m.type == "error" and not bekannt(m.text) else None)
        pg.goto(BASE)
        pg.evaluate("() => { localStorage.clear(); localStorage.setItem('mm-start-app', '1'); }")
        pg.goto(BASE + "hesse-normalenform"); pg.wait_for_timeout(1800)
        n = f"@{w}"
        breit = lambda: pg.evaluate("() => document.documentElement.scrollWidth")
        pruefe(pg.locator("[data-vek-reiter]").count() == 3, n + ": drei Schritte")
        # Die Idee
        motion = pg.locator('[data-us-motion="v_normalenform"]')
        pruefe(motion.count() == 1, n + ": Animation v_normalenform fehlt")
        pruefe("usm-vektoren" in (motion.get_attribute("class") or ""), n + ": Abspieler nicht im Vektoren-Thema")
        pruefe(pg.locator("[data-usm-kap]").count() == 7, n + ": sieben Kapitelmarken")
        pruefe(pg.locator("[data-hesse-kernsatz]").count() == 1, n + ": Kernsatz fehlt")
        pg.locator("[data-vek-tipp=null]").click(); pg.wait_for_timeout(200)
        pruefe(pg.locator("[data-vek-tipp=null][aria-pressed=true]").count() == 1, n + ": Vermutung nicht markiert")
        pg.locator('[data-usm-kap="wandern"]').click(); pg.wait_for_timeout(600)
        pruefe("wandert" in pg.locator(".usm-text").first.inner_text(), n + ": Kapitelmarke springt nicht (Untertitel)")
        live = pg.locator("[data-hesse-live=idee]")
        pruefe(live.get_attribute("data-hesse-in-e") == "ja", n + ": X nicht in E zu Beginn")
        for _ in range(2): pg.get_by_label("s erhöhen").click()
        pg.get_by_label("t verringern").click()
        pruefe(live.get_attribute("data-hesse-in-e") == "ja", n + ": Skalarprodukt ≠ 0 trotz h = 0")
        pg.get_by_label("Höhe h erhöhen").click(); pg.wait_for_timeout(150)
        pruefe(live.get_attribute("data-hesse-in-e") == "nein", n + ": Skalarprodukt 0 trotz h = 1")
        pruefe(pg.locator("[data-hesse-koordform]").count() == 1, n + ": Koordinatenform fehlt")
        pruefe(pg.locator("[data-hesse-video] summary").count() == 1, n + ": Video-Aufklapper fehlt")
        pruefe(breit() <= w, n + f": Überbreite Idee {breit()}")
        if BILDER: pg.screenshot(path=f"{BILDER}/idee{w}.png", full_page=True)
        # Hesse-Normalenform
        pg.locator("[data-vek-reiter=hesse]").click(); pg.wait_for_timeout(500)
        pruefe(pg.locator('[data-us-motion="v_hnf"]').count() == 1, n + ": Animation v_hnf fehlt")
        pruefe(pg.locator("[data-hesse-dreiformen] [data-hesse-form]").count() == 3, n + ": drei Schreibweisen fehlen")
        seiten = [pg.locator("[data-hesse-live=hesse]").get_attribute("data-hesse-seite")]
        for _ in range(8):
            pg.get_by_label("Koordinate q3 verringern").click()
            seiten.append(pg.locator("[data-hesse-live=hesse]").get_attribute("data-hesse-seite"))
        pruefe("ueber" in seiten and "unter" in seiten, n + f": Vorzeichen wechselt nicht: {seiten}")
        pruefe(pg.locator("[data-weiter-ziel=abstaende]").count() == 1, n + ": Weiter zu Abstände fehlt")
        pruefe(breit() <= w, n + f": Überbreite HNF {breit()}")
        if BILDER: pg.screenshot(path=f"{BILDER}/hnf{w}.png", full_page=True)
        # Trainieren
        pg.locator("[data-vek-reiter=trainieren]").click(); pg.wait_for_timeout(400)
        pg.locator("[data-vek-tipp=in]").click(); pg.wait_for_timeout(300)
        pruefe(pg.locator("[data-hesse-bild]").count() >= 1, n + ": Bild nach Vermutung fehlt")
        pg.locator("[data-hesse-loesung]").click(); pg.wait_for_timeout(300)
        pruefe(pg.locator("[data-hesse-rechenweg]").count() == 1, n + ": Rechenweg fehlt")
        pruefe(pg.locator("[data-vek-ergebnis]").count() >= 1, n + ": Ergebnis fehlt")
        pg.locator("[data-vek-neu]").first.click(); pg.wait_for_timeout(300)
        pruefe(pg.locator("[data-hesse-rechenweg]").count() == 0, n + ": Neue Aufgabe setzt nicht zurück")
        pruefe(breit() <= w, n + f": Überbreite Trainieren {breit()}")
        if w >= 840: pruefe(pg.locator("[data-arbeitsflaeche]").count() >= 1, n + ": keine Arbeitsfläche am Desktop")
        else: pruefe(pg.locator("[data-arbeitsflaeche]").count() == 0, n + ": Arbeitsfläche am Handy")
        if BILDER: pg.screenshot(path=f"{BILDER}/trainieren{w}.png", full_page=True)
        pruefe(not kons, n + f": Konsole {kons[:3]}")
        ctx.close()
    br.close()
print("\n".join(fehler) if fehler else "hesse: alles ok")
sys.exit(1 if fehler else 0)
