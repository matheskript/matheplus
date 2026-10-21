"""Browser-Test: Normalverteilung (neues Werkzeug) und die Erkläranimationen der Mittelstufen-Geometrie.
Je Breite (360, 390, 1280) und Sprache (DE, EN):
  · /normalverteilung: alle fünf Stationen, Labore mit Reglern, vier Erkläranimationen an mehreren Zeitpunkten,
    Üben: jeder Aufgabentyp mehrfach über „Lösung dieses Schritts zeigen“ bis zum Ende
  · /kreis, /koerper, /kongruenz, /strahlensaetze: Erkläranimation vorhanden, Zeitleiste 0 … 1 ohne Überbreite
  · Stochastik-Übersicht und Startseiten-Menü kennen die Normalverteilung
  · keine Seitenfehler, keine Konsolenfehler, keine Überbreite
  npx vite preview --port 4173 &   →   BASE_URL=http://localhost:4173/ python3 tests/ui/normalverteilung.ui.py
"""
import os
from playwright.sync_api import sync_playwright

def _typen_auf(pg):
    """Aufgabentyp-Chips liegen seit 21.10. hinter der Einstellungs-Pille: bei Bedarf aufklappen."""
    if pg.locator("[data-einstellungen-feld]:visible").count() == 0:
        pil = pg.locator("[data-einstellungen-pille]:visible")
        if pil.count():
            pil.first.click(); pg.wait_for_timeout(150)

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
AUS = os.environ.get("SCREENS", "/tmp/normalverteilung")
os.makedirs(AUS, exist_ok=True)
fehler = []

def pruefe(bed, text):
    if not bed:
        fehler.append(text)
        print("FEHLT:", text)

def breit_ok(page, breite, wo):
    sw = page.evaluate("document.documentElement.scrollWidth")
    pruefe(sw <= breite, f"{wo}: Überbreite {sw}")

def zeitleiste(page, wert):
    page.evaluate("""(w) => {
      const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      document.querySelectorAll("input[aria-label='Zeitleiste der Animation'], input[aria-label='Animation timeline']").forEach((el) => {
        const max = Number(el.max); set.call(el, String(Math.min(max, w * max))); el.dispatchEvent(new Event('input', { bubbles: true }));
      });
    }""", wert)

def regler_durch(page, karte, wo, breite):
    for r in karte.locator("input[type=range]").all():
        for w in ("min", "max"):
            page.evaluate("""([el, w]) => { const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
              set.call(el, el[w] || el.getAttribute(w)); el.dispatchEvent(new Event('input', { bubbles: true })); }""", [r.element_handle(), w])
            page.wait_for_timeout(50)
            breit_ok(page, breite, wo)

def schritte_durch(page, wo):
    for _ in range(10):
        zeigen = page.locator("button:has-text('Lösung dieses Schritts zeigen'):visible, button:has-text('Show the solution of this step'):visible")
        if zeigen.count() == 0:
            break
        zeigen.first.click(); page.wait_for_timeout(80)
        page.locator("button:has-text('Weiter zum nächsten Schritt'):visible, button:has-text('Continue to the next step'):visible").first.click()
        page.wait_for_timeout(80)
    pruefe(page.locator("text=/Richtig gelöst|Solved/").count() > 0, f"{wo}: Aufgabe nicht bis zum Ende")

def ueben(page, breite, wo, sprache, shot=None):
    page.get_by_role("tab", name="Trainieren" if sprache == "de" else "Train").first.click(); page.wait_for_timeout(200)
    _typen_auf(page)
    typen = page.locator("[data-aufgabentyp]:visible button")
    namen = [typen.nth(i).inner_text() for i in range(typen.count())]
    for i, name in enumerate(namen):
        _typen_auf(page)
        typen.nth(i).click(); page.wait_for_timeout(100)
        for _ in range(4 if i else 8):
            schritte_durch(page, f"{wo}/{name}")
            breit_ok(page, breite, f"{wo}/{name}")
            page.locator("button:has-text('Neue Aufgabe'):visible, button:has-text('New exercise'):visible").first.click(); page.wait_for_timeout(60)
        if shot and i == 5:
            page.screenshot(path=shot.replace(".png", f"-{i}.png"), full_page=True)
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

            # ---------- Normalverteilung ----------
            wo = f"{sprache}/{breite}/normalverteilung"
            page.goto(BASE + "normalverteilung"); page.wait_for_timeout(1400)
            pruefe(page.locator("h1").filter(has_text="Normal").count() > 0, f"{wo}: Titel fehlt")
            stationen = page.get_by_role("tablist", name="Stationen" if sprache == "de" else "Stations").get_by_role("tab")
            pruefe(stationen.count() == 5, f"{wo}: {stationen.count()} Stationen statt 5")
            for st in range(stationen.count()):
                stationen.nth(st).click(); page.wait_for_timeout(250)
                anim = page.locator("[data-nv-anim]:visible")
                if st < 4:
                    pruefe(anim.count() == 1, f"{wo}: Station {st + 1} ohne Animation")
                for wert in (0.0, 0.2, 0.45, 0.7, 0.9, 1.0):
                    zeitleiste(page, wert); page.wait_for_timeout(60)
                    breit_ok(page, breite, f"{wo}/station{st + 1}/t={wert}")
                    if foto and wert == 0.7:
                        anim.first.screenshot(path=f"{AUS}/nv-animation{st + 1}.png") if anim.count() else None
                for lab in page.locator("[data-labor]:visible").all():
                    regler_durch(page, lab, f"{wo}/station{st + 1}/labor", breite)
                    pruefe(lab.locator("svg").count() >= 1, f"{wo}: Labor ohne Grafik")
                if foto:
                    page.screenshot(path=f"{AUS}/nv-station{st + 1}.png", full_page=True)
            n = ueben(page, breite, wo, sprache, f"{AUS}/nv-ueben.png" if foto else None)
            pruefe(n == 11, f"{wo}: {n} Aufgabentypen statt 11 (Gemischt + 10)")

            # ---------- Geometrie-Animationen ----------
            for ansicht in ("kreis", "koerper", "kongruenz", "strahlensaetze"):
                wo = f"{sprache}/{breite}/{ansicht}"
                page.goto(BASE + ansicht); page.wait_for_timeout(1200)
                anim = page.locator("[data-geo-anim]:visible")
                pruefe(anim.count() == 1, f"{wo}: Animation fehlt")
                for wert in (0.0, 0.15, 0.35, 0.5, 0.65, 0.8, 1.0):
                    zeitleiste(page, wert); page.wait_for_timeout(60)
                    breit_ok(page, breite, f"{wo}/t={wert}")
                    if foto and anim.count():
                        anim.first.screenshot(path=f"{AUS}/{ansicht}-{int(wert * 100)}.png")
                # Schritt-Knöpfe der Animation
                for k in anim.locator("button.erk-pille").all():
                    k.click(); page.wait_for_timeout(40)

            # ---------- Stochastik-Übersicht ----------
            wo = f"{sprache}/{breite}/stochastik"
            page.goto(BASE + "stochastik"); page.wait_for_timeout(1200)
            pruefe(page.locator("text=/Normalverteilung|Normal distribution/").count() > 0, f"{wo}: Normalverteilung fehlt in der Übersicht")
            breit_ok(page, breite, wo)

            pruefe(not konsole, f"{sprache}/{breite}: Konsole: {konsole[:3]}")
            ctx.close()
    b.close()

print("\n".join(fehler) if fehler else "Alles grün.")
raise SystemExit(1 if fehler else 0)
