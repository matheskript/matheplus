"""Spracheingabe (funcSprache.jsx), bei 360 und 1280 px – mit nachgebauter SpeechRecognition (Playwright hat kein Mikrofon):
- Knopf nur, wenn der Browser die API hat (ohne Fake: kein Knopf)
- erster Klick: Freigabe-Dialog; „Erlauben“ + merken → kein zweiter Dialog
- „drei zwei minus eins“ füllt die drei Felder eines Punktes/Vektors in Reihenfolge; Einzelfeld bekommt eine Zahl
- Zwei Punkte (A), Abstände (Lotfußpunkt), Normalenform (n und Abstand), Kreuzprodukt (a), Winkel (Skalarprodukt)
- Tastatur-Mikrofon (Handy): aktives Feld + folgende Felder der Gruppe
- automatisch prüfen: Winkel (nach der Vermutung) und Hesse-Trainer (nach dem letzten Feld) zeigen das Ergebnis ohne „Prüfen“
Aufruf: BASE_URL=http://localhost:4317/ python3 tests/ui/sprache.ui.py"""
import os, sys
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
fehler = []
bekannt = lambda t: "net::" in t or "Failed to load resource" in t

FAKE = """
window.__sprachText = "";
window.SpeechRecognition = class {
  constructor() { this.lang = ""; this.interimResults = false; this.continuous = false; }
  start() {
    const t = window.__sprachText;
    setTimeout(() => {
      if (this.onresult) this.onresult({ results: [[{ transcript: t }]].map((r) => { r.isFinal = true; return r; }) });
      if (this.onend) this.onend();
    }, 30);
  }
  stop() { if (this.onend) this.onend(); }
  abort() {}
};
"""


def pruefe(bed, text):
    if not bed:
        fehler.append(text)


def sprich(pg, knopf, text):
    pg.evaluate(f"window.__sprachText = {text!r}")
    knopf.click()
    pg.wait_for_timeout(200)


def werte(pg, gruppe):
    return pg.evaluate(f"() => [...document.querySelectorAll('{gruppe} input[data-mathe-modus]')].map((e) => e.value)")


with sync_playwright() as p:
    b = p.chromium.launch()
    # ohne Erkennung: kein Knopf
    ctx0 = b.new_context(viewport={"width": 1280, "height": 860})
    pg = ctx0.new_page()
    pg.add_init_script("delete window.SpeechRecognition; delete window.webkitSpeechRecognition;")
    pg.goto(BASE + "zwei-punkte"); pg.wait_for_timeout(1500)
    pruefe(pg.locator("[data-sprach-knopf]").count() == 0, "ohne API: Knopf sichtbar")
    ctx0.close()

    for w in (360, 1280):
        ctx = b.new_context(viewport={"width": w, "height": 860}, has_touch=(w < 600), is_mobile=(w < 600))
        ctx.add_init_script(FAKE)
        pg = ctx.new_page()
        kons = []
        pg.on("pageerror", lambda e: kons.append(str(e)))
        pg.on("console", lambda m: kons.append(m.text) if m.type == "error" and not bekannt(m.text) else None)

        # Zwei Punkte: Punkt A sprechen, erst Freigabe
        pg.goto(BASE + "zwei-punkte"); pg.wait_for_timeout(1500)
        gruppen = pg.locator("[data-sprach-gruppe]")
        pruefe(gruppen.count() >= 2, f"{w} zwei-punkte: Gruppen A und B fehlen ({gruppen.count()})")
        knopf = gruppen.nth(0).locator("[data-sprach-knopf] button").first
        knopf.click(); pg.wait_for_timeout(100)
        pruefe(pg.locator("[data-sprach-freigabe]").count() == 1, f"{w}: Freigabe-Dialog fehlt")
        pg.evaluate("window.__sprachText = 'drei zwei minus eins'")
        pg.get_by_role("button", name="Erlauben").click(); pg.wait_for_timeout(300)
        pruefe(pg.locator("[data-sprach-freigabe]").count() == 0, f"{w}: Freigabe bleibt offen")
        a = pg.evaluate("() => [...document.querySelectorAll('[data-sprach-gruppe]')[0].querySelectorAll('input')].map((e) => e.value)")
        pruefe(a == ["3", "2", "-1"], f"{w} zwei-punkte: A = {a}")
        pruefe(pg.locator("[data-sprach-meldung=text]").count() == 1, f"{w}: Rückmeldung fehlt")
        # zweiter Punkt, ohne Dialog
        sprich(pg, gruppen.nth(1).locator("[data-sprach-knopf] button").first, "0, 4, 7")
        pruefe(pg.locator("[data-sprach-freigabe]").count() == 0, f"{w}: zweite Freigabe")
        bw = pg.evaluate("() => [...document.querySelectorAll('[data-sprach-gruppe]')[1].querySelectorAll('input')].map((e) => e.value)")
        pruefe(bw == ["0", "4", "7"], f"{w} zwei-punkte: B = {bw}")
        pruefe(pg.evaluate("() => document.documentElement.scrollWidth") <= w, f"{w} zwei-punkte: Überbreite")

        # Tastatur-Mikrofon am Handy: Feld 2 von B fokussieren, „5 6“ → B = 0 5 6
        if w < 600:
            felder = gruppen.nth(1).locator("input")
            felder.nth(1).click(); pg.wait_for_timeout(400)
            tast = pg.locator("[data-mathe-tastatur] [data-sprach-knopf] button")
            pruefe(tast.count() == 1, f"{w}: Mikrofon in der Tastatur fehlt ({tast.count()})")
            if tast.count():
                sprich(pg, tast.first, "5 6")
                bw = pg.evaluate("() => [...document.querySelectorAll('[data-sprach-gruppe]')[1].querySelectorAll('input')].map((e) => e.value)")
                pruefe(bw == ["0", "5", "6"], f"{w} Tastatur-Mikro: B = {bw}")

        # Hesse-Normalenform → Trainieren: jede Eingabezeile hat ein Mikrofon, ein Satz füllt ihr Feld
        pg.goto(BASE + "hesse-normalenform"); pg.wait_for_timeout(1500)
        pg.locator("[data-vek-reiter=trainieren]").first.click(); pg.wait_for_timeout(500)
        zeilen = pg.locator("[data-hesse-eingaben] [data-sprach-gruppe]")
        pruefe(zeilen.count() >= 3, f"{w} hesse: Mikrofone in den Eingabezeilen fehlen ({zeilen.count()})")
        letzte = zeilen.nth(zeilen.count() - 1)
        sprich(pg, letzte.locator("[data-sprach-knopf] button").first, "minus zwei Drittel")
        d = letzte.locator("input").first.input_value()
        pruefe(d == "-2/3", f"{w} hesse: δ = {d}")
        pg.wait_for_timeout(200)
        pruefe("✓" not in pg.locator("[data-hesse-eingaben]").inner_text() and "✗" not in pg.locator("[data-hesse-eingaben]").inner_text(), f"{w} hesse: geprüft, obwohl Felder fehlen")
        for i in range(zeilen.count() - 1):
            sprich(pg, zeilen.nth(i).locator("[data-sprach-knopf] button").first, "7")
        pg.wait_for_timeout(300)
        t = pg.locator("[data-hesse-eingaben]").inner_text()
        pruefe("✓" in t or "✗" in t, f"{w} hesse: nach dem letzten Feld nicht automatisch geprüft")

        # Abstände: Lotfußpunkt mit Bruch
        pg.goto(BASE + "abstaende"); pg.wait_for_timeout(1500)
        pg.locator("[data-vek-reiter=lot]").first.click(); pg.wait_for_timeout(300)
        g = pg.locator("[data-sprach-gruppe]").filter(has_text="F(").first
        sprich(pg, g.locator("[data-sprach-knopf] button").first, "ein halb, 2 Komma 5, minus 4")
        f = g.evaluate("(e) => [...e.querySelectorAll('input')].map((x) => x.value)")
        pruefe(f == ["1/2", "2,5", "-4"], f"{w} abstaende: F = {f}")

        # Kreuzprodukt: Vektor a
        pg.goto(BASE + "kreuzprodukt"); pg.wait_for_timeout(1500)
        g = pg.locator("[data-sprach-gruppe]").first
        sprich(pg, g.locator("[data-sprach-knopf] button").first, "1 4 8")
        a = g.evaluate("(e) => [...e.querySelectorAll('input')].map((x) => x.value)")
        pruefe(a == ["1", "4", "8"], f"{w} kreuzprodukt: a = {a}")

        # Winkel: Skalarprodukt (ZahlFeld) – nach der Vermutung prüft die Spracheingabe von selbst
        pg.goto(BASE + "vektorwinkel"); pg.wait_for_timeout(1500)
        g = pg.locator("[data-sprach-gruppe]").first
        sprich(pg, g.locator("[data-sprach-knopf] button").first, "minus 12")
        s = g.locator("input").first.input_value()
        pruefe(s == "-12", f"{w} winkel: Skalarprodukt = {s}")
        pruefe(pg.locator("[data-vek-ergebnis]").count() == 0, f"{w} winkel: geprüft ohne Vermutung")
        pg.locator("[data-vek-tipp]").first.click(); pg.wait_for_timeout(200)
        sprich(pg, g.locator("[data-sprach-knopf] button").first, "0")
        pg.wait_for_timeout(300)
        pruefe(pg.locator("[data-vek-ergebnis]").count() == 1, f"{w} winkel: nach der Spracheingabe nicht automatisch geprüft")

        pruefe(not kons, f"{w}: Konsole {kons[:2]}")
        ctx.close()
    b.close()

if fehler:
    print("\n".join(fehler)); sys.exit(1)
print("sprache.ui.py: alles ok")
