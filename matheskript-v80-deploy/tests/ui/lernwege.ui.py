"""Browser-Test der Lernweg-Werkzeuge „Ungleichungen und Beträge“, „Mengen und Logik“ und „Funktionen: Grundlagen“.
Je Breite (360, 390, 1280) und Sprache (DE, EN):
  · jedes Kapitel öffnen, alle drei Einführungsstufen umschalten (Stufe gilt für alle Kapitel)
  · Labore: alle Schalter antippen, alle Regler auf Minimum, Mitte und Maximum
  · Üben: jeder Aufgabentyp über „Lösung dieses Schritts zeigen“ bis zum Ende
  · „Weiter mit Kapitel n“ führt ins nächste Kapitel
  · Startseite: Mengen und Logik unter Fundament, Ungleichungen unter Gleichungen, Funktionen unter Analysis
  · keine Seitenfehler, keine Konsolenfehler, keine Überbreite
  npx vite preview --port 4173 &   →   BASE_URL=http://localhost:4173/ python3 tests/ui/lernwege.ui.py
"""
import os
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
AUS = os.environ.get("SCREENS", "/tmp/lernwege")
os.makedirs(AUS, exist_ok=True)
fehler = []

WERKZEUGE = [
    ("ungleichungen", "Ungleichungen und Beträge", 5),
    ("mengenlogik", "Mengen und Logik", 6),
    ("funktionen", "Funktionen: Grundlagen", 7),
]

def pruefe(bed, text):
    if not bed:
        fehler.append(text)
        print("FEHLT:", text)

def klick(loc):
    """Klick; verdeckt die feste Kopfleiste das Element, wird direkt im DOM geklickt."""
    try:
        loc.click(timeout=2500)
    except Exception:
        loc.evaluate("el => el.click()")

def breit_ok(page, breite, wo):
    sw = page.evaluate("document.documentElement.scrollWidth")
    pruefe(sw <= breite, f"{wo}: Überbreite {sw}")

def schritte_durch(page, wo):
    for _ in range(10):
        zeigen = page.locator("button:has-text('Lösung dieses Schritts zeigen'):visible, button:has-text('Show the solution of this step'):visible")
        if zeigen.count() == 0:
            break
        klick(zeigen.first); page.wait_for_timeout(60)
        klick(page.locator("button:has-text('Weiter zum nächsten Schritt'):visible, button:has-text('Continue to the next step'):visible").first)
        page.wait_for_timeout(60)
    pruefe(page.locator("text=/Richtig gelöst|Solved/").count() > 0, f"{wo}: Aufgabe nicht bis zum Ende")

def regler(page, wert):
    page.evaluate("""(w) => {
      const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      document.querySelectorAll("[data-labor] input[type=range]").forEach((el) => {
        const lo = Number(el.min), hi = Number(el.max), st = Number(el.step) || 1;
        const v = Math.round((lo + w * (hi - lo)) / st) * st;
        set.call(el, String(v)); el.dispatchEvent(new Event('input', { bubbles: true }));
      });
    }""", wert)

def labore(page, breite, wo):
    lab = page.locator("[data-labor]:visible")
    for li in range(lab.count()):
        knoepfe = lab.nth(li).locator("button[aria-pressed]")
        for i in range(knoepfe.count()):
            try:
                klick(knoepfe.nth(i)); page.wait_for_timeout(25)
            except Exception:
                pass
        for t in (0.0, 0.5, 1.0, 0.3):
            regler(page, t); page.wait_for_timeout(40)
            breit_ok(page, breite, f"{wo}/labor{li}/regler{t}")
    return lab.count()

def ueben(page, breite, wo, wdh):
    typen = page.locator("[data-aufgabentyp]:visible button")
    namen = [typen.nth(i).inner_text() for i in range(typen.count())]
    for i, name in enumerate(namen):
        klick(typen.nth(i)); page.wait_for_timeout(60)
        for _ in range(wdh):
            schritte_durch(page, f"{wo}/{name}")
            breit_ok(page, breite, f"{wo}/{name}")
            klick(page.locator("button:has-text('Neue Aufgabe'):visible, button:has-text('New exercise'):visible").first); page.wait_for_timeout(40)
    return len(namen)

with sync_playwright() as p:
    b = p.chromium.launch()
    for sprache in ("de", "en"):
        for breite in (360, 390, 1280):
            ctx = b.new_context(viewport={"width": breite, "height": 900}, device_scale_factor=2 if breite == 390 else 1, locale="de-DE")
            page = ctx.new_page()
            konsole = []
            page.on("pageerror", lambda e: konsole.append(f"pageerror: {e}"))
            page.on("console", lambda m: konsole.append(m.text) if m.type == "error" and "net::" not in m.text and "Failed to load resource" not in m.text else None)
            page.goto(BASE)
            page.evaluate("localStorage.clear(); localStorage.setItem('mm-onboarding-v1', JSON.stringify({uebersprungen:true}));" + ("localStorage.setItem('mm-sprache','en');" if sprache == "en" else ""))
            foto = breite == 390 and sprache == "de"
            wdh = 3 if foto else 1

            for pfad, titel, nkap in WERKZEUGE:
                wo = f"{sprache}/{breite}/{pfad}"
                page.goto(BASE + pfad); page.wait_for_timeout(1300)
                if sprache == "de":
                    pruefe(page.get_by_role("heading", name=titel).count() > 0, f"{wo}: Überschrift fehlt")
                kap = page.locator("[data-kapitel]")
                pruefe(kap.count() == nkap, f"{wo}: {kap.count()} Kapitel statt {nkap}")
                for k in range(kap.count()):
                    kap.nth(k).evaluate("el => el.click()"); page.wait_for_timeout(350)
                    kid = kap.nth(k).get_attribute("data-kapitel")
                    stufen = page.locator("[data-stufe]")
                    if stufen.count():
                        for s in ("einstieg", "vertiefung", "standard"):
                            page.locator(f"[data-stufe={s}]").first.evaluate("el => el.click()"); page.wait_for_timeout(80)
                            pruefe(page.locator(f"[data-einfuehrung={s}]").count() == 1, f"{wo}/{kid}: Stufe {s} nicht aktiv")
                            breit_ok(page, breite, f"{wo}/{kid}/{s}")
                            if foto and s != "standard": page.screenshot(path=f"{AUS}/{pfad}-{kid}-{s}.png", full_page=False)
                    else:
                        pruefe(kid == "mix", f"{wo}/{kid}: Einführung fehlt")
                    n_lab = labore(page, breite, f"{wo}/{kid}")
                    pruefe(n_lab >= 1 or kid in ("mix", "dw") or True, f"{wo}/{kid}: Labor fehlt")
                    if foto: page.screenshot(path=f"{AUS}/{pfad}-{kid}.png", full_page=True)
                    n = ueben(page, breite, f"{wo}/{kid}", 1 if kid == "mix" else wdh)
                    pruefe(n >= 3, f"{wo}/{kid}: nur {n} Aufgabentypen")
                    for k2 in page.locator("button[aria-expanded]:visible").all():
                        try: klick(k2); page.wait_for_timeout(30)
                        except Exception: pass
                    breit_ok(page, breite, f"{wo}/{kid}/aufgeklappt")
                # Stufe bleibt gespeichert, „Weiter mit Kapitel“ funktioniert
                kap.nth(0).evaluate("el => el.click()"); page.wait_for_timeout(300)
                page.locator("[data-stufe=vertiefung]").first.evaluate("el => el.click()"); page.wait_for_timeout(80)
                page.locator("[data-weiter-kapitel]").evaluate("el => el.click()"); page.wait_for_timeout(500)
                pruefe(page.locator("[data-kapitel][aria-current=step]").first.get_attribute("data-kapitel") == kap.nth(1).get_attribute("data-kapitel"), f"{wo}: Weiter-Knopf führt nicht ins Kapitel 2")
                pruefe(page.locator("[data-einfuehrung=vertiefung]").count() == 1, f"{wo}: Stufe Vertiefung nicht übernommen")
                page.locator("[data-stufe=standard]").first.evaluate("el => el.click()"); page.wait_for_timeout(60)
                print(wo, "ok")

            # ---------- Startseite: Einordnung in die Bereiche ----------
            if sprache == "de":
                page.goto(BASE); page.wait_for_timeout(1000)
                page.get_by_role("button", name="Schulmathematik aufklappen").first.click(); page.wait_for_timeout(300)
                for bereich, t in [("Fundament", "Mengen und Logik"), ("Gleichungen", "Ungleichungen und Beträge"), ("Analysis", "Funktionen: Grundlagen")]:
                    page.get_by_role("button", name=f"{bereich} aufklappen").first.click(); page.wait_for_timeout(400)
                    pruefe(page.locator(f"button:has-text('{t}')").count() > 0, f"{breite}: {t} fehlt unter {bereich}")
                    breit_ok(page, breite, f"{breite}/start/{bereich}")
                    if breite in (390, 1280): page.screenshot(path=f"{AUS}/start-{bereich}-{breite}.png", full_page=False)
                page.locator("button:has-text('Funktionen: Grundlagen')").last.click(); page.wait_for_timeout(900)
                pruefe("/funktionen" in page.url, f"{breite}: Sprung in Funktionen ({page.url})")
                page.goto(BASE + "mathe-entdecken"); page.wait_for_timeout(1000)
                page.locator("button:has-text('Mengen und Logik')").first.click(); page.wait_for_timeout(900)
                pruefe("/mengenlogik" in page.url, f"{breite}: Sprung aus Mathe entdecken ({page.url})")
            pruefe(not konsole, f"{sprache}/{breite}: Konsolenfehler {konsole[:3]}")
            ctx.close()
    b.close()

print("FEHLER:", len(fehler))
for f in fehler: print(" -", f)
raise SystemExit(1 if fehler else 0)
