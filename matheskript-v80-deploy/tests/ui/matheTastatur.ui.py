"""Browser-Tests der Mathe-Tastatur (Handy-Emulation). Siehe README.md in diesem Ordner."""
import os, sys
from playwright.sync_api import sync_playwright

URL = os.environ.get("BASE_URL", "http://localhost:4173/")
fehler = []
bekannt = lambda t: "ERR_TUNNEL" in t or "net::ERR" in t or "Failed to load resource" in t


def seite(b, mobil=True):
    kw = dict(viewport={"width": 390, "height": 844}, timezone_id="Europe/Madrid")
    if mobil:
        kw.update(has_touch=True, is_mobile=True, device_scale_factor=2)
    ctx = b.new_context(**kw)
    p = ctx.new_page()
    p.on("pageerror", lambda e: fehler.append(f"pageerror: {e}"))
    p.on("console", lambda m: fehler.append(f"console: {m.text}") if m.type == "error" and not bekannt(m.text) else None)
    p.add_init_script("sessionStorage.setItem('mm-nach-sprachwechsel', JSON.stringify({ansicht:'advplotter'}))")
    p.goto(URL)
    p.wait_for_timeout(1500)
    for t in ["Verstanden", "Schließen", "OK", "Später"]:
        try:
            k = p.get_by_role("button", name=t, exact=True)
            if k.count():
                k.first.click(timeout=500)
        except Exception:
            pass
    return p


def feld_oeffnen(p):
    k = p.get_by_role("button", name="Funktion eingeben")
    if k.count():
        k.click()
    k = p.get_by_role("button", name="Selbst tippen")
    if k.count():
        k.click()
    f = p.locator('input[data-mathe-modus="formel"]').first
    f.wait_for(timeout=5000)
    return f


def taste(p, name):
    p.locator("[data-mathe-tastatur]").get_by_role("button", name=name, exact=True).first.click()


def pruefe(b):
    p = seite(b)
    f = feld_oeffnen(p)
    assert f.get_attribute("inputmode") == "none", "Feld muss die System-Tastatur unterdrücken"
    assert p.locator("[data-mathe-tastatur]").count() == 0, "Tastatur nur bei Fokus"
    f.tap()
    p.wait_for_selector("[data-mathe-tastatur]", timeout=3000)
    f.fill(""); f.tap()
    taste(p, "2"); taste(p, "x"); taste(p, "hoch 2")
    assert f.input_value() == "2x^2", f.input_value()
    taste(p, "Plus"); p.locator("[data-mathe-tastatur]").get_by_text("f(x)", exact=True).first.click()
    taste(p, "Sinus"); taste(p, "Kosinus")
    v = f.input_value()
    assert v == "2x^2+sin(cos())", v
    taste(p, "Löschen"); taste(p, "Löschen")
    assert f.input_value() == "2x^2+", f.input_value()
    # Feld bleibt fokussiert, Tastatur schließt mit ⌄
    assert p.evaluate("document.activeElement.hasAttribute('data-mathe-modus')")
    p.get_by_role("button", name="Tastatur schließen").click()
    p.wait_for_selector("[data-mathe-tastatur]", state="detached", timeout=3000)
    # Zahlenfeld (ZahlFeld bruch) – andere Seite: Geraden-Trainer nicht nötig, Modus-Attribute reichen
    p.close()

    # Desktop (Maus): Zahlenfelder öffnen nichts, Formelfelder schon
    d = seite(b, mobil=False)
    f = feld_oeffnen(d)
    f.click()
    d.wait_for_selector("[data-mathe-tastatur]", timeout=3000)
    d.keyboard.press("Escape")
    d.wait_for_selector("[data-mathe-tastatur]", state="detached", timeout=3000)
    d.close()


with sync_playwright() as pw:
    b = pw.chromium.launch()
    try:
        pruefe(b)
    finally:
        b.close()
real = [x for x in fehler if "Failed" not in x]
if real:
    print("FEHLER:", *real, sep="\n"); sys.exit(1)
print("Mathe-Tastatur: alle Tests bestanden")
