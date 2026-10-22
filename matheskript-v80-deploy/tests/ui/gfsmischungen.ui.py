"""Browser-Test: GFS-Themenseite „Mischungen“ (/gfs-trainer/mischungen).
Prüft bei 360, 390 und 1280 px: Kurs-Liste (Klasse 8) öffnet die Seite, Kopfbild, fünf Animationen (eine wird
abgespielt, Schrittwechsel), Labor (Plus/Minus ändert Menge und Mischwert, Vorlage „Ziel 12 %“, Drehpunkt selbst suchen
bis zum Gleichgewicht), alle vier Übungstypen (erst falsch mit Rückmeldung, dann richtig aus window.__mischAufgabe),
Kolloquium, Alias /mischungskreuz – ohne Überbreite und ohne Konsolenfehler.
  cd matheskript-v80-deploy && npx vite --port 4394 --strictPort &
  BASE_URL=http://localhost:4394/ python3 tests/ui/gfsmischungen.ui.py
"""
import os
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
AUS = os.environ.get("SCREENS", "/tmp/gfsmischungen")
os.makedirs(AUS, exist_ok=True)
fehler = []
def pruefe(bed, text):
    if not bed: fehler.append(text); print("FEHLT:", text)

START = "localStorage.clear(); localStorage.setItem('mm-start-app','1'); localStorage.setItem('mm-onboarding-v1', JSON.stringify({uebersprungen:true}))"

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

        page.goto(BASE); page.evaluate(START)
        # Kurs: Klasse 8 zeigt das Thema als fertige Seite
        page.goto(BASE + "gfs-trainer"); page.wait_for_timeout(1200)
        page.locator(".gfs-stufe-knopf").click(); page.wait_for_timeout(150)
        page.get_by_role("option", name="Klasse 8").click(); page.wait_for_timeout(250)
        thema = page.locator(".gfs-thema-fertig", has_text="Mischungen")
        pruefe(thema.count() == 1, f"{breite}: Thema fehlt in Klasse 8")
        thema.click(); page.wait_for_timeout(1500)
        pruefe("gfs-trainer/mischungen" in page.url, f"{breite}: Themenseite nicht geöffnet ({page.url})")
        pruefe(page.get_by_text("Wie viel nimmt man von jeder Sorte – und warum funktioniert das Mischungskreuz?").count() >= 1, f"{breite}: Leitfrage fehlt")
        pruefe(page.locator(".gtk-titel", has_text="Mischungen").count() == 1, f"{breite}: Titel im Kopf fehlt")
        pruefe(page.locator(".gtk-bild").count() == 1, f"{breite}: Kopfbild fehlt")
        for chip in ("Klasse 8", "Kap. VII", "5 Animationen"):
            pruefe(page.locator(".gtk-chips li", has_text=chip).count() == 1, f"{breite}: Chip {chip} fehlt")
        breite_ok("Seite")
        page.screenshot(path=f"{AUS}/{breite}-kopf.png")

        # Fünf Animationen: die erste ist offen; die zweite aufklappen, sie spielt; zu Schritt 3 springen
        anims = page.locator("[data-misch-anim]")
        pruefe(anims.count() == 5, f"{breite}: {anims.count()} statt 5 Animationen")
        pruefe(anims.first.locator("input[type=range]").count() == 1, f"{breite}: erste Animation nicht geöffnet")
        zweite = anims.nth(1)
        zweite.locator("button").first.click(); page.wait_for_timeout(1600)
        t = float(zweite.locator("input[type=range]").input_value())
        pruefe(t > 0.4, f"{breite}: Animation 2 spielt nicht (t = {t})")
        zweite.get_by_label("Schritt 3 abspielen").click(); page.wait_for_timeout(400)
        pruefe(zweite.get_by_text("Schritt 3 von").count() == 1, f"{breite}: Schrittwechsel in Animation 2 fehlt")
        for i in (2, 3, 4):
            a = anims.nth(i); a.locator("button").first.click(); page.wait_for_timeout(200)
            pruefe(a.locator("svg[role=img]").count() == 1, f"{breite}: Animation {i + 1} zeigt kein Bild")
        breite_ok("Animationen")
        zweite.scroll_into_view_if_needed(); page.screenshot(path=f"{AUS}/{breite}-animation.png")

        # Labor: Plus/Minus, Vorlage, Drehpunkt suchen
        lab = page.locator("[data-misch-labor]")
        lab.scroll_into_view_if_needed()
        pruefe(lab.locator("[data-labor-c]").get_attribute("data-labor-c") == "10", f"{breite}: Start-Mischung nicht 10 %")
        lab.locator("[data-stepper='m2+']").click(); page.wait_for_timeout(150)
        pruefe(lab.locator("[data-wert=m2]").inner_text().strip() == "120 g", f"{breite}: Plus bei m₂ wirkt nicht")
        # 200 g · 5 % + 120 g · 20 % = 10 g + 24 g = 34 g in 320 g → 10,625 % ≈ 10,63 %
        pruefe(lab.locator("[data-labor-c]").get_attribute("data-labor-c") == "10,63", f"{breite}: Mischwert nach Plus nicht ≈ 10,63 % ({lab.locator('[data-labor-c]').get_attribute('data-labor-c')})")
        pruefe(lab.locator("[data-labor-c]").text_content().strip() == "320 g · ≈ 10,63 %", f"{breite}: gerundeter Mischwert ohne ≈")
        lab.locator("[data-stepper='c1-']").click(); page.wait_for_timeout(150)
        pruefe(lab.locator("[data-wert=c1]").inner_text().strip() == "4 %", f"{breite}: Minus bei c₁ wirkt nicht")
        lab.get_by_role("button", name="Ziel 12 %").click(); page.wait_for_timeout(150)
        pruefe(lab.locator("[data-labor-c]").get_attribute("data-labor-c") == "12", f"{breite}: Vorlage „Ziel 12 %“ ergibt nicht 12 %")
        lab.get_by_role("button", name="Drehpunkt selbst suchen").click(); page.wait_for_timeout(150)
        pruefe(lab.get_attribute("data-labor-gleich") == "0", f"{breite}: Wippe sofort im Gleichgewicht")
        pruefe(lab.get_by_text("kippt nach links").count() == 1, f"{breite}: Hinweis „kippt“ fehlt")
        lab.locator("input[type=range][aria-label=Drehpunkt]").fill("12"); page.wait_for_timeout(200)
        pruefe(lab.get_attribute("data-labor-gleich") == "1", f"{breite}: bei 12 % kein Gleichgewicht")
        pruefe(lab.get_by_text("Gleichgewicht!").count() == 1, f"{breite}: Meldung Gleichgewicht fehlt")
        breite_ok("Labor")
        page.screenshot(path=f"{AUS}/{breite}-labor.png")

        # Übungen: je Typ erst falsch, dann richtig
        karte = page.locator("[data-mischtrainer]")
        def fuellen(werte):
            for k, v in werte.items(): karte.locator(f"input[data-feld='{k}']").fill(str(v))
        def pruefen():
            karte.get_by_role("button", name="Prüfen").click(); page.wait_for_timeout(200)
        for typ in ("Mischung berechnen", "Mengen für ein Ziel", "Verdünnen", "Gleichungssystem"):
            page.get_by_role("button", name=typ, exact=True).click(); page.wait_for_timeout(200)
            page.get_by_role("button", name="Schwierigkeit erhöhen").click(); page.wait_for_timeout(200)
            a = page.evaluate("window.__mischAufgabe")
            loesung = a["loesung"]
            pruefe(karte.locator("input[data-mathe-modus]").count() == len(loesung), f"{breite}: {typ}: Felder fehlen")
            fuellen({k: v + "1" for k, v in loesung.items()}); pruefen()
            pruefe(karte.get_by_text("Stimmt noch nicht.").count() == 1, f"{breite}: {typ}: falsche Antwort nicht erkannt")
            grund = karte.locator("[data-misch-grund]")
            pruefe(grund.count() == 1 and len(grund.inner_text()) > 20, f"{breite}: {typ}: Rückmeldung fehlt")
            karte.get_by_role("button", name="Rechenweg zeigen").click(); page.wait_for_timeout(150)
            breite_ok(f"{typ} Rechenweg")
            fuellen(loesung); pruefen()
            pruefe(karte.get_by_text("Stimmt!").count() == 1, f"{breite}: {typ} (Stufe {a['stufe']}) nicht als richtig erkannt: {loesung}")
            breite_ok(typ)
            karte.scroll_into_view_if_needed(); page.screenshot(path=f"{AUS}/{breite}-uebung-{a['art']}.png")

        # Kolloquium
        page.get_by_role("button", name="Antwort aufdecken").click(); page.wait_for_timeout(150)
        pruefe(page.get_by_text("SO KANNST DU ANTWORTEN").count() == 1, f"{breite}: Antwort im Kolloquium fehlt")
        page.get_by_role("button", name="Konnte ich").click(); page.wait_for_timeout(150)
        pruefe(page.get_by_text("1 von 12 sitzen").count() == 1, f"{breite}: Kolloquium zählt nicht")
        breite_ok("Ende")
        page.screenshot(path=f"{AUS}/{breite}-ende.png")

        # Alias
        if breite == 360:
            page.goto(BASE + "mischungskreuz"); page.wait_for_timeout(1500)
            pruefe(page.locator("[data-misch-labor]").count() == 1, f"{breite}: Alias /mischungskreuz öffnet die Seite nicht")
        pruefe(not konsole, f"{breite}: Konsolenfehler {konsole[:3]}")
        ctx.close()
    b.close()

print("OK" if not fehler else f"{len(fehler)} Fehler")
raise SystemExit(1 if fehler else 0)
