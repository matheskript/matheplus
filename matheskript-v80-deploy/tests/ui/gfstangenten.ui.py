"""Browser-Test: GFS-Themenseite „Tangentenprobleme“ (/gfs-trainer/tangentenprobleme).
Prüft bei 360, 390 und 1280 px: Kurs-Liste (Kursstufe 1 → Tangentenprobleme), Pfad direkt, Kopfbild, fünf Animationen
(die erste spielt, eine zweite wird bis Schritt 3 gesprungen und ans Ende gezogen), Labor (Plus/Minus für a und b:
2 → 1 → 0 Tangenten an der Normalparabel; kubische Kurve mit 3 Tangenten, Ziehen am Desktop), alle vier Übungsarten
(je eine typisch falsche Antwort mit Rückmeldung, dann die richtige aus window.__gtanAufgabe), Kolloquium –
ohne Überbreite und ohne Konsolenfehler.
  cd matheskript-v80-deploy && npx vite --port 4391 --strictPort &   →   BASE_URL=http://localhost:4391/ python3 tests/ui/gfstangenten.ui.py
"""
import os
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
AUS = os.environ.get("SCREENS", "/tmp/gfstangenten")
os.makedirs(AUS, exist_ok=True)
fehler = []
def pruefe(bed, text):
    if not bed: fehler.append(text); print("FEHLT:", text)

def falsch_fuer(a):
    """Eine typisch falsche Eingabe je Art (wie im Node-Test)."""
    L = dict(a["loesung"])
    if a["art"] == "tangente": L["c"] = "999"
    elif a["art"] == "normale" and a.get("dreieck"): L["A"] = "999"
    elif a["art"] == "normale": L["m"] = "999"
    elif a["art"] == "aussen": L["u1"] = "99"
    else: L["c1"] = "999"
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
        thema = page.locator(".gfs-thema-fertig", has_text="Tangentenprobleme")
        pruefe(thema.count() == 1, f"{breite}: Thema fehlt in Kursstufe 1")
        thema.click(); page.wait_for_timeout(1500)
        pruefe("tangentenprobleme" in page.url, f"{breite}: Themenseite nicht geöffnet ({page.url})")
        # Pfad direkt (Alias)
        page.goto(BASE + "tangentenprobleme"); page.wait_for_timeout(1800)
        pruefe(page.get_by_text("Wie viele Tangenten gehen von einem Punkt an eine Kurve").count() >= 1, f"{breite}: Leitfrage fehlt")
        pruefe(page.locator(".gtk-bild").count() == 1, f"{breite}: Kopfbild fehlt")
        pruefe(page.locator(".gtk-chips li", has_text="5 Animationen").count() == 1, f"{breite}: Chips fehlen")
        breite_ok("Seite")
        page.screenshot(path=f"{AUS}/{breite}-kopf.png")

        # Fünf Animationen: die erste ist offen und spielt; die dritte (Anzahl) aufklappen, Schritt 3, ans Ende
        anims = page.locator("[data-tangenten-anim]")
        pruefe(anims.count() == 5, f"{breite}: {anims.count()} statt 5 Animationen")
        erste = anims.first
        pruefe(erste.locator("input[type=range]").count() == 1, f"{breite}: erste Animation nicht geöffnet")
        t0 = float(erste.locator("input[type=range]").input_value()); page.wait_for_timeout(700)
        pruefe(float(erste.locator("input[type=range]").input_value()) > t0, f"{breite}: erste Animation spielt nicht")
        anz = page.locator("[data-tangenten-anim=anzahl]")
        anz.locator("button").first.click(); page.wait_for_timeout(300)
        anz.get_by_label("Schritt 3 abspielen").click(); page.wait_for_timeout(400)
        pruefe(anz.get_by_text("Schritt 3 von").count() == 1, f"{breite}: Schrittwechsel in der Anzahl-Animation fehlt")
        leiste = anz.locator("input[type=range]"); leiste.fill(leiste.get_attribute("max")); page.wait_for_timeout(250)
        pruefe(anz.get_by_text("0 Tangenten").count() >= 1, f"{breite}: Schlussbild der Anzahl-Animation falsch")
        for art in ("beruehren", "kubisch", "huegel"):
            k = page.locator(f"[data-tangenten-anim={art}]")
            k.locator("button").first.click(); page.wait_for_timeout(250)
            l = k.locator("input[type=range]"); l.fill(l.get_attribute("max")); page.wait_for_timeout(150)
        pruefe(page.locator("[data-tangenten-anim=huegel]").get_by_text("freie Sicht", exact=True).count() == 1, f"{breite}: Hügel-Schlussbild falsch")
        breite_ok("Animationen")
        anz.scroll_into_view_if_needed(); page.screenshot(path=f"{AUS}/{breite}-animation.png")

        # Labor: Normalparabel, P(0,5 | −2) → b hoch bis 0,25 (auf der Kurve) → darüber
        labor = page.locator("[data-tangenten-labor]")
        labor.scroll_into_view_if_needed()
        pruefe(labor.get_attribute("data-anzahl") == "2", f"{breite}: Labor startet nicht mit 2 Tangenten")
        pruefe(labor.locator("[data-tangenten-liste] li").count() == 2, f"{breite}: Labor zeigt keine zwei Gleichungen")
        plus_b = labor.get_by_role("button", name="y-Koordinate von P erhöhen")
        plus_a = labor.get_by_role("button", name="x-Koordinate von P erhöhen")
        minus_a = labor.get_by_role("button", name="x-Koordinate von P verringern")
        for _ in range(4): plus_b.click()          # b = 0
        minus_a.click()                             # a = 0  → P(0 | 0) liegt auf der Parabel
        page.wait_for_timeout(150)
        pruefe(labor.get_attribute("data-anzahl") == "1", f"{breite}: P(0 | 0) auf der Parabel ergibt nicht 1 ({labor.get_attribute('data-a')}|{labor.get_attribute('data-b')})")
        plus_b.click(); page.wait_for_timeout(150)  # P(0 | 0,5) oberhalb
        pruefe(labor.get_attribute("data-anzahl") == "0", f"{breite}: oberhalb nicht 0 Tangenten")
        pruefe(labor.get_by_text("keine Lösung").count() == 1, f"{breite}: Hinweis „keine Lösung“ fehlt")
        pruefe(labor.locator("[data-zahl]").inner_text().strip() == "0", f"{breite}: große Zahl zeigt nicht 0")
        page.screenshot(path=f"{AUS}/{breite}-labor-0.png")
        labor.get_by_role("button", name="x³ − 3x", exact=True).click(); page.wait_for_timeout(200)
        pruefe(labor.get_attribute("data-kurve") == "kubisch" and labor.get_attribute("data-anzahl") == "3", f"{breite}: kubische Kurve startet nicht mit 3 Tangenten")
        pruefe(labor.locator("[data-tangenten-liste] li").count() == 3, f"{breite}: drei Gleichungen fehlen")
        for _ in range(2): page.get_by_role("button", name="y-Koordinate von P verringern").click()   # P(1 | −3,5): außerhalb → 1
        page.wait_for_timeout(150)
        pruefe(labor.get_attribute("data-anzahl") == "1", f"{breite}: P(1 | −3,5) ergibt nicht 1 Tangente")
        plus_b.click(); page.wait_for_timeout(150)   # P(1 | −3) auf der Wendetangente → 2
        pruefe(labor.get_attribute("data-anzahl") == "2", f"{breite}: P auf der Wendetangente ergibt nicht 2")
        if breite >= 1000:
            # Ziehen am Desktop: P an die Stelle (2 | 0) ziehen → zwischen Kurve und Wendetangente? f(2) = 2, w(2) = −6 → 3
            svg = labor.locator("svg").first
            box = svg.bounding_box()
            def bild(x, y):   # LAB.kubisch: x ∈ [−3,2; 3,2] auf 14 … 346, y ∈ [−6,5; 6,5] auf 290 … 10 (viewBox 360 × 300)
                vx = 14 + (x + 3.2) * (332 / 6.4); vy = 290 - (y + 6.5) * (280 / 13)
                return box["x"] + vx * box["width"] / 360, box["y"] + vy * box["height"] / 300
            page.mouse.move(*bild(1, -3)); page.mouse.down(); page.mouse.move(*bild(1.5, -1.5), steps=4); page.mouse.move(*bild(2, 0), steps=4); page.mouse.up()
            page.wait_for_timeout(200)
            pruefe(labor.get_attribute("data-a") == "2" and labor.get_attribute("data-b") == "0", f"{breite}: Ziehen setzt P nicht ({labor.get_attribute('data-a')}|{labor.get_attribute('data-b')})")
            pruefe(labor.get_attribute("data-anzahl") == "3", f"{breite}: gezogener Punkt (2 | 0) ergibt nicht 3")
        breite_ok("Labor")
        labor.scroll_into_view_if_needed(); page.screenshot(path=f"{AUS}/{breite}-labor.png")

        # Übungen: je Art erst typisch falsch, dann richtig (Stufe 2)
        karte = page.locator("[data-tangententrainer]")
        def pruefen():
            karte.get_by_role("button", name="Prüfen").click(); page.wait_for_timeout(250)
        def fuellen(werte):
            for k, v in werte.items():
                if k == "wahl": continue
                karte.locator(f"input[data-feld='{k}']").fill(str(v))
        for typ in ("Tangente in einem Punkt", "Normale in einem Punkt", "Tangenten von außen", "Anzahl · gemeinsame Tangente"):
            page.get_by_role("button", name=typ, exact=True).click(); page.wait_for_timeout(200)
            if typ == "Tangente in einem Punkt":
                page.get_by_role("button", name="Schwierigkeit erhöhen").click(); page.wait_for_timeout(200)
            a = page.evaluate("window.__gtanAufgabe")
            pruefe(a["stufe"] == 2, f"{breite}: {typ}: Stufe {a['stufe']} statt 2")
            if a.get("optionen"):
                falsch = [i for i in range(len(a["optionen"])) if i != a["richtig"]][0]
                karte.locator(f"button[data-option='{falsch}']").click(); pruefen()
                pruefe(karte.get_by_text("Stimmt noch nicht.").count() == 1, f"{breite}: {typ}: falsche Wahl nicht erkannt")
                pruefe(len(karte.locator("[data-grund]").inner_text()) > 30, f"{breite}: {typ}: Rückmeldung fehlt")
                karte.locator(f"button[data-option='{a['richtig']}']").click(); pruefen()
            else:
                fuellen(falsch_fuer(a)); pruefen()
                pruefe(karte.get_by_text("Stimmt noch nicht.").count() == 1, f"{breite}: {typ}: falsche Antwort nicht erkannt")
                pruefe(len(karte.locator("[data-grund]").inner_text()) > 30, f"{breite}: {typ}: Rückmeldung fehlt")
                karte.get_by_role("button", name="Rechenweg zeigen").click(); page.wait_for_timeout(150)
                fuellen(a["loesung"]); pruefen()
            pruefe(karte.get_by_text("Stimmt!").count() == 1, f"{breite}: {typ} (Stufe {a['stufe']}) nicht als richtig erkannt")
            breite_ok(typ)
            karte.scroll_into_view_if_needed(); page.screenshot(path=f"{AUS}/{breite}-uebung-{a['art']}.png")
        # Stufe 5 der vierten Art: gemeinsame Tangenten
        for _ in range(3): page.get_by_role("button", name="Schwierigkeit erhöhen").click(); page.wait_for_timeout(120)
        a = page.evaluate("window.__gtanAufgabe")
        pruefe(a["kurve"] == "gemeinsam" and a["stufe"] == 5, f"{breite}: Stufe 5 ist keine gemeinsame Tangente")
        fuellen(a["loesung"]); pruefen()
        pruefe(karte.get_by_text("Stimmt!").count() == 1, f"{breite}: gemeinsame Tangente nicht als richtig erkannt")
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
