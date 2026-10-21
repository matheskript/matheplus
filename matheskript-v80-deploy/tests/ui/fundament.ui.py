"""Browser-Test des Bereichs „Fundament“: Axiome und Rechenregeln, Zahlenräume (ℕ → ℤ → ℚ → ℝ).
Je Breite (360, 390, 1280) und Sprache (DE, EN):
  · Werkzeug öffnet, Entdecken vollständig durchklicken (Gesetz-Probe, Rechenwege, alle fünf Stationen,
    Tester mit allen Rechenarten, Widerspruchsbeweis, Näherungsbrüche, Mengenbild)
  · Erkläranimationen: Zeitleiste an mehreren Stellen, keine Überbreite
  · Üben: jeder Aufgabentyp mehrfach über „Lösung dieses Schritts zeigen“ bis zum Ende
  · Startseite: Bereich „Fundament“ als erster Bereich mit beiden Werkzeugen; Mathe entdecken: Fundament-Block
  · keine Seitenfehler, keine Konsolenfehler, keine Überbreite
  npx vite preview --port 4173 &   →   BASE_URL=http://localhost:4173/ python3 tests/ui/fundament.ui.py
"""
import os
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
AUS = os.environ.get("SCREENS", "/tmp/fundament")
os.makedirs(AUS, exist_ok=True)
fehler = []

def pruefe(bed, text):
    if not bed:
        fehler.append(text)
        print("FEHLT:", text)

def breit_ok(page, breite, wo):
    sw = page.evaluate("document.documentElement.scrollWidth")
    pruefe(sw <= breite, f"{wo}: Überbreite {sw}")

def schritte_durch(page, wo):
    for _ in range(10):
        zeigen = page.locator("button:has-text('Lösung dieses Schritts zeigen'):visible, button:has-text('Show the solution of this step'):visible")
        if zeigen.count() == 0:
            break
        zeigen.first.click(); page.wait_for_timeout(90)
        page.locator("button:has-text('Weiter zum nächsten Schritt'):visible, button:has-text('Continue to the next step'):visible").first.click()
        page.wait_for_timeout(90)
    pruefe(page.locator("text=/Richtig gelöst|Solved/").count() > 0, f"{wo}: Aufgabe nicht bis zum Ende")

def zeitleiste(page, wert):
    """Alle sichtbaren Animations-Zeitleisten auf einen Zeitpunkt setzen (pausiert die Animation)."""
    page.evaluate("""(w) => {
      const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      document.querySelectorAll("input[aria-label='Zeitleiste der Animation'], input[aria-label='Zeitleiste der Animation']").forEach((el) => {
        const max = Number(el.max); set.call(el, String(Math.min(max, w * max))); el.dispatchEvent(new Event('input', { bubbles: true }));
      });
    }""", wert)

def ueben(page, breite, wo, sprache, shot=None):
    page.get_by_role("tab", name="Üben" if sprache == "de" else "Practise").first.click(); page.wait_for_timeout(200)
    typen = page.locator("[data-aufgabentyp]:visible button")
    namen = [typen.nth(i).inner_text() for i in range(typen.count())]
    for i, name in enumerate(namen):
        typen.nth(i).click(); page.wait_for_timeout(100)
        for _ in range(6 if i else 12):
            schritte_durch(page, f"{wo}/{name}")
            breit_ok(page, breite, f"{wo}/{name}")
            page.locator("button:has-text('Neue Aufgabe'):visible, button:has-text('New exercise'):visible").first.click(); page.wait_for_timeout(60)
    if shot:
        page.screenshot(path=shot, full_page=True)
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

            # ---------- Axiome und Rechenregeln ----------
            wo = f"{sprache}/{breite}/axiome"
            page.goto(BASE + "axiome"); page.wait_for_timeout(1200)
            if sprache == "de":
                pruefe(page.get_by_role("heading", name="Axiome und Rechenregeln").count() > 0, f"{wo}: Überschrift fehlt")
            probe = page.locator("[data-gesetzprobe]")
            pruefe(probe.count() == 1, f"{wo}: Gesetz-Probe fehlt")
            for kz in ["A1", "A2", "A3", "A4", "M1", "M2", "M3", "M4", "D"]:
                probe.get_by_role("button", name=kz, exact=True).click(); page.wait_for_timeout(40)
                pruefe(probe.locator("text=✓").count() > 0, f"{wo}: Probe {kz} ohne Haken")
            breit_ok(page, breite, wo + "/probe")
            rw = page.locator("[data-rechenwege]")
            sel = rw.locator("select")
            if sel.count():
                for v in sel.locator("option").all():
                    sel.select_option(v.get_attribute("value")); page.wait_for_timeout(60)
                    rw.get_by_role("button", name="Alles zeigen" if sprache == "de" else "Show all").click(); page.wait_for_timeout(60)
                    breit_ok(page, breite, wo + "/rechenweg " + v.get_attribute("value"))
            else:
                knoepfe = rw.locator("button[aria-pressed]")
                for i in range(knoepfe.count()):
                    knoepfe.nth(i).click(); page.wait_for_timeout(60)
                    rw.get_by_role("button", name="Alles zeigen" if sprache == "de" else "Show all").click(); page.wait_for_timeout(60)
                    breit_ok(page, breite, f"{wo}/rechenweg {i}")
            pruefe(page.locator("[data-axiom-modul]").count() == 1, f"{wo}: Lernmodul-Karte fehlt")
            if foto: page.screenshot(path=f"{AUS}/axiome-entdecken.png", full_page=True)
            n = ueben(page, breite, wo, sprache, f"{AUS}/axiome-ueben.png" if foto else None)
            pruefe(n == 9, f"{wo}: {n} Aufgabentypen statt 9 (Gemischt + 8)")
            print(wo, "ok,", n, "Aufgabentypen")

            # ---------- Zahlenräume ----------
            wo = f"{sprache}/{breite}/zahlenraeume"
            page.goto(BASE + "zahlenraeume"); page.wait_for_timeout(1200)
            if sprache == "de":
                pruefe(page.get_by_role("heading", name="Zahlenräume: von ℕ bis ℝ").count() > 0, f"{wo}: Überschrift fehlt")
            for st in range(5):
                page.locator("[role=tablist][aria-label='Stationen'] button, [role=tablist][aria-label='Stations'] button").nth(st).click(); page.wait_for_timeout(250)
                anim = page.locator("[data-zr-anim]:visible")
                if st < 4:
                    pruefe(anim.count() == 1, f"{wo}: Station {st + 1} ohne Animation")
                    for t in (0.08, 0.3, 0.55, 0.8, 1.0):
                        zeitleiste(page, t); page.wait_for_timeout(80)
                        breit_ok(page, breite, f"{wo}/station{st + 1}/t{t}")
                        if foto: anim.first.screenshot(path=f"{AUS}/anim-{st + 1}-{int(t * 100)}.png")
                tester = page.locator("[data-tester]:visible")
                if tester.count():
                    for op in ["+", "−", "·", ":"]:
                        tester.get_by_role("button", name=op, exact=True).click(); page.wait_for_timeout(40)
                        for _ in range(3):
                            tester.locator("button:has-text('Neue Zahlen'), button:has-text('New numbers')").first.click(); page.wait_for_timeout(30)
                    breit_ok(page, breite, f"{wo}/tester{st + 1}")
                if st == 3:
                    bw = page.locator("[data-beweis]")
                    pruefe(bw.count() == 1, f"{wo}: Beweis fehlt")
                    bw.get_by_role("button", name="Alles zeigen" if sprache == "de" else "Show all").click(); page.wait_for_timeout(80)
                    pruefe(bw.locator("li").count() == 6, f"{wo}: Beweis hat nicht 6 Zeilen")
                    for k in bw.locator("button[aria-expanded]").all(): k.click(); page.wait_for_timeout(40)
                    breit_ok(page, breite, f"{wo}/beweis")
                if st == 4:
                    mb = page.locator("[data-mengenbild]")
                    for k in mb.locator("button[aria-pressed]").all():
                        k.click(); page.wait_for_timeout(40)
                    breit_ok(page, breite, f"{wo}/mengenbild")
                if foto: page.screenshot(path=f"{AUS}/zahlenraeume-station{st + 1}.png", full_page=True)
            n = ueben(page, breite, wo, sprache, f"{AUS}/zahlenraeume-ueben.png" if foto else None)
            pruefe(n == 10, f"{wo}: {n} Aufgabentypen statt 10 (Gemischt + 9)")
            print(wo, "ok,", n, "Aufgabentypen")

            # ---------- Startseite: Bereich Fundament ----------
            if sprache == "de":
                page.goto(BASE); page.wait_for_timeout(1000)
                page.get_by_role("button", name="Oberstufe aufklappen").first.click(); page.wait_for_timeout(300)
                # Seit der neuen Startseite (6518764) und 7ca9e1f steht „Mathematisches Fundament“ in der Oberstufen-Liste
                # nach Analysis, Vektoren und Stochastik, direkt vor „Formelsammlung und Werkzeuge“ – nicht mehr als erster Bereich
                haupt = [k.get_attribute("aria-label") for k in page.locator("[aria-label$=' aufklappen']").all() if k.is_visible()]
                fu, fo = "Mathematisches Fundament aufklappen", "Formelsammlung und Werkzeuge aufklappen"
                pruefe(fu in haupt and (fo not in haupt or haupt.index(fu) < haupt.index(fo)), f"{breite}: Fundament fehlt oder steht nicht vor der Formelsammlung ({haupt})")
                page.get_by_role("button", name="Fundament aufklappen").first.click(); page.wait_for_timeout(400)
                for t in ["Axiome und Rechenregeln", "Zahlenräume: von ℕ bis ℝ"]:
                    pruefe(page.locator(f"button:has-text('{t}')").count() > 0, f"{breite}: {t} fehlt unter Fundament")
                if breite in (390, 1280): page.screenshot(path=f"{AUS}/start-fundament-{breite}.png", full_page=False)
                page.locator("button:has-text('Zahlenräume: von ℕ bis ℝ')").last.click(); page.wait_for_timeout(900)
                pruefe("/zahlenraeume" in page.url, f"{breite}: Sprung in Zahlenräume ({page.url})")
                page.goto(BASE + "mathe-entdecken"); page.wait_for_timeout(1000)
                pruefe(page.locator("[data-fundament]").count() == 1, f"{breite}: Fundament-Block in Mathe entdecken fehlt")
                breit_ok(page, breite, f"{breite}/entdecken")
                if breite == 390: page.screenshot(path=f"{AUS}/entdecken-fundament.png", full_page=False)
                page.locator("button:has-text('Axiome üben')").first.click(); page.wait_for_timeout(900)
                pruefe("/axiome" in page.url, f"{breite}: Sprung in Axiome üben ({page.url})")
            pruefe(not konsole, f"{sprache}/{breite}: Konsolenfehler {konsole[:3]}")
            ctx.close()
    b.close()

print("FEHLER:", len(fehler))
for f in fehler: print(" -", f)
raise SystemExit(1 if fehler else 0)
