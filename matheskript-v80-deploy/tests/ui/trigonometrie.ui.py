"""Browser-Test des Mittelstufen-Werkzeugs Trigonometrie (Lernweg mit 6 Kapiteln).
Je Breite (360, 390, 1280) und Sprache (DE, EN):
  · jedes Kapitel öffnen, Erklärvideos einmal durchspulen, Regler bewegen,
  · jeden Aufgabentyp über „Lösung dieses Schritts zeigen“ bis zum Ende durchlaufen,
  · keine Seitenfehler, keine Überbreite.
Zusätzlich (DE, 390): echte Eingabe über den Trig-Rechner – eine Rechnung wird akzeptiert,
auf RAD kommt die Bogenmaß-Rückmeldung; das Tastenfeld zeigt sin⁻¹ und kein ln.
  npx vite preview --port 4317 &   →   BASE_URL=http://localhost:4317/ python3 tests/ui/trigonometrie.ui.py
"""
import os, re
from playwright.sync_api import sync_playwright

def _typen_auf(pg):
    """Aufgabentyp-Chips liegen seit 21.10. hinter der Einstellungs-Pille: bei Bedarf aufklappen."""
    if pg.locator("[data-einstellungen-feld]:visible").count() == 0:
        pil = pg.locator("[data-einstellungen-pille]:visible")
        if pil.count():
            pil.first.click(); pg.wait_for_timeout(150)

BASE = os.environ.get("BASE_URL", "http://localhost:4317/")
AUS = os.environ.get("SCREENS", "/tmp/trigonometrie")
os.makedirs(AUS, exist_ok=True)
fehler = []

def pruefe(bed, text):
    if not bed:
        fehler.append(text)
        print("FEHLT:", text)

def schritte_durch(page, wo):
    for _ in range(10):
        zeigen = page.locator("button:has-text('Lösung dieses Schritts zeigen'):visible, button:has-text('Show the solution of this step'):visible")
        if zeigen.count() == 0:
            break
        zeigen.first.click(); page.wait_for_timeout(40)
        page.locator("button:has-text('Weiter zum nächsten Schritt'):visible, button:has-text('Continue to the next step'):visible").first.click()
        page.wait_for_timeout(40)
    ok = page.locator("text=/Richtig|Correct|Solved/").count()
    pruefe(ok > 0, f"{wo}: Aufgabe nicht bis zum Ende durchlaufen")

def ueberbreite(page):
    return page.evaluate("document.documentElement.scrollWidth - window.innerWidth")

KAPITEL = ["einheitskreis", "bogenmass", "dreieck", "tangens", "saetze", "mix"]

with sync_playwright() as p:
    b = p.chromium.launch()
    for sprache in ("de", "en"):
        for breite in (360, 390, 1280):
            ctx = b.new_context(viewport={"width": breite, "height": 860}, device_scale_factor=1, locale="de-DE",
                                has_touch=breite < 800, is_mobile=breite < 800)
            page = ctx.new_page()
            konsole = []
            page.on("pageerror", lambda e: konsole.append(f"pageerror: {e}"))
            page.on("console", lambda m: konsole.append(m.text) if m.type == "error" and "net::" not in m.text and "Failed to load resource" not in m.text else None)
            page.goto(BASE)
            page.evaluate("localStorage.clear(); localStorage.setItem('mm-start-app','1'); localStorage.setItem('mm-onboarding-v1', JSON.stringify({uebersprungen:true}));" + ("localStorage.setItem('mm-sprache','en');" if sprache == "en" else ""))
            page.goto(BASE + "trigonometrie"); page.wait_for_timeout(1200)
            for k in KAPITEL:
                wo = f"{sprache}/{breite}/{k}"
                page.locator(f"[data-kapitel={k}]").click(); page.wait_for_timeout(500)
                # Filme: in den Blick holen, dann Zeitleiste ans Ende und zurück
                for film in page.locator("[data-trig-film]").all():
                    film.scroll_into_view_if_needed(); page.wait_for_timeout(500)
                    leiste = film.locator("input[type=range]")
                    pruefe(leiste.count() == 1, f"{wo}: Film ohne Zeitleiste")
                    if leiste.count():
                        for v in ("4", "9", "15", "21", "40"):
                            leiste.evaluate(f"(e) => {{ const s = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; s.call(e, '{v}'); e.dispatchEvent(new Event('input', {{bubbles:true}})); }}")
                            page.wait_for_timeout(40)
                        if breite == 390:
                            film.screenshot(path=f"{AUS}/{sprache}-{k}-film-{film.get_attribute('data-trig-film')}.png")
                # Regler (nicht die Film-Zeitleisten)
                for r in page.locator("input[type=range]:visible").all():
                    if r.evaluate("e => !!e.closest('[data-trig-film]')"):
                        continue
                    r.focus(); page.keyboard.press("End"); page.wait_for_timeout(30); page.keyboard.press("Home"); page.wait_for_timeout(30)
                # alle Aufgabentypen
                _typen_auf(page)
                typen = page.locator("[data-aufgabentyp] button")
                n = typen.count()
                pruefe(n >= 3, f"{wo}: zu wenige Aufgabentypen ({n})")
                for i in range(n):
                    _typen_auf(page)
                    typen.nth(i).click(); page.wait_for_timeout(120)
                    for wdh in range(2 if i == 0 else 1):
                        schritte_durch(page, f"{wo}/typ{i}")
                        page.locator("button:has-text('Neue Aufgabe'), button:has-text('New exercise')").first.click(); page.wait_for_timeout(80)
                ub = ueberbreite(page)
                pruefe(ub <= 0, f"{wo}: Überbreite {ub}px")
                if breite in (360, 1280):
                    page.screenshot(path=f"{AUS}/{sprache}-{breite}-{k}.png", full_page=True)
            # echte Eingabe mit dem Trig-Rechner
            if sprache == "de" and breite == 390:
                page.locator("[data-kapitel=dreieck]").click(); page.wait_for_timeout(400)
                _typen_auf(page)
                page.locator("[data-aufgabentyp] button:has-text('Seite berechnen')").click(); page.wait_for_timeout(200)
                # Schritt 1 über die Lösung, Schritt 2 selbst rechnen
                page.locator("button:has-text('Lösung dieses Schritts zeigen'):visible").first.click()
                page.locator("button:has-text('Weiter zum nächsten Schritt'):visible").first.click(); page.wait_for_timeout(100)
                frage = page.locator("text=/In den Rechner: /")
                feld = page.locator("input[data-mathe-modus=trig]:visible").last
                pruefe(feld.count() == 1, "Trig-Feld fehlt im Rechenschritt")
                # Rechnung aus dem Hinweis holen: erst falsch prüfen lassen, bis Hinweis 2 kommt
                feld.click(); page.wait_for_timeout(200)
                tast = page.locator("[data-mathe-tastatur]")
                pruefe(tast.count() == 1, "Tastenfeld öffnet sich nicht")
                pruefe(tast.locator("button:has-text('sin⁻¹')").count() == 1 and tast.locator("button:has-text('ln')").count() == 0, "Tastenfeld: sin⁻¹ fehlt oder ln vorhanden")
                page.screenshot(path=f"{AUS}/tastatur-390.png")
                page.keyboard.press("Escape"); page.wait_for_timeout(100)
                feld.fill("1"); page.keyboard.press("Escape"); page.locator("button:has-text('Schritt prüfen'):visible").first.click(); page.wait_for_timeout(100)
                feld.fill("2"); page.keyboard.press("Escape"); page.locator("button:has-text('Schritt prüfen'):visible").first.click(); page.wait_for_timeout(100)
                t = page.locator("text=/In den Rechner: /").first.inner_text()
                m = re.search(r"In den Rechner: (\S+)", t)
                pruefe(m is not None, "Hinweis mit Rechnung fehlt")
                if m:
                    rechnung = m.group(1)
                    # zuerst auf RAD: Bogenmaß-Rückmeldung erwartet
                    page.locator("button[aria-pressed]:has-text('RAD'):visible").first.click(); page.wait_for_timeout(100)
                    feld.fill(rechnung); page.keyboard.press("Escape"); page.wait_for_timeout(100)
                    page.locator("button:has-text('Schritt prüfen'):visible").first.click(); page.wait_for_timeout(150)
                    pruefe(page.locator("text=/steht auf RAD/").count() > 0 or page.locator("text=/Falsch umgestellt/").count() > 0, f"RAD-Rückmeldung fehlt für {rechnung}")
                    page.screenshot(path=f"{AUS}/rad-fehler-390.png")
                    page.locator("button[aria-pressed]:has-text('DEG'):visible").first.click(); page.wait_for_timeout(100)
                    page.locator("button:has-text('Schritt prüfen'):visible").first.click(); page.wait_for_timeout(150)
                    pruefe(page.locator("text=/Seiten benannt, Funktion gewählt/").count() > 0, f"Rechnung {rechnung} im DEG-Modus nicht akzeptiert")
                    page.screenshot(path=f"{AUS}/rechnung-ok-390.png")
            for k in konsole:
                fehler.append(f"{sprache}/{breite}: {k}")
                print("KONSOLE:", k)
            ctx.close()
    b.close()

print("\nFEHLER:" if fehler else "\nalles grün", len(fehler))
for f in fehler:
    print(" -", f)
raise SystemExit(1 if fehler else 0)
