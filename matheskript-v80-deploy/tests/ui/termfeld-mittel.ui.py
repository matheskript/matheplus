"""Browser-Test: Termeingabe Mittelstufe (funcTermFeldMittel.jsx) in „Terme und Potenzgesetze“ (/terme-vereinfachen).
Bei 360, 390 und 1280 px: Feld + 24 Tasten (keine Oberstufen-Tasten), je Übung die Ziellösung über das Tastenfeld
eintippen → „Richtig“ (Terme vereinfachen, Ausklammern, Binomisch beide Richtungen, Potenzgesetze), leerer Nenner →
Hinweis und Marke im Nenner, falscher Term → „Noch nicht gleichwertig“, Computertastatur, Bruch und Hochzahl als
echte Mathe gesetzt, keine Überbreite, keine Konsolenfehler.
  npm run build && npx vite preview --port 4173 &   →   python3 -u tests/ui/termfeld-mittel.ui.py
"""
import os, re
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
AUS = os.environ.get("SCREENS", "/tmp/termfeld-mittel")
os.makedirs(AUS, exist_ok=True)
fehler = []
def pruefe(bed, text):
    if not bed: fehler.append(text); print("FEHLT:", text)

def tasten_aus_tex(tex):
    """Ziel-TeX der Aufgabe (x^{2}, \\frac{a}{b}, \\cdot, −) → Folge von Tasten des Tastenfelds"""
    tex = tex.replace("\\cdot", "·").replace("\\left", "").replace("\\right", "")
    i = 0
    def gruppe():
        nonlocal i
        assert tex[i] == "{", tex
        tiefe, start = 0, i + 1
        while True:
            if tex[i] == "{": tiefe += 1
            elif tex[i] == "}":
                tiefe -= 1
                if tiefe == 0: break
            i += 1
        inhalt = tex[start:i]; i += 1
        return inhalt
    out = []
    while i < len(tex):
        c = tex[i]
        if c == " ": i += 1; continue
        if tex.startswith("\\frac", i):
            i += 5; z = gruppe(); n = gruppe()
            out += ["bruch", *tasten_aus_tex(z), "→", *tasten_aus_tex(n), "→"]; continue
        if c == "^":
            i += 1
            if tex[i] == "{": e = gruppe()
            else: e = tex[i]; i += 1
            out += ["xⁿ", *tasten_aus_tex(e), "→"]; continue
        out.append({"-": "−", "*": "·"}.get(c, c)); i += 1
    return out

def tippe(page, tasten):
    feld = page.locator("[data-termfeld-mittel]:visible")
    for t in tasten:
        feld.locator(f"[data-tm-taste='{t}']").click()

def vorschritte(page):
    """Vorschritte (Formel/Gesetz wählen) durchprobieren, bis das Termfeld erscheint"""
    versuch = {}
    for _ in range(40):
        knopf = page.get_by_role("button", name="Schritt prüfen").filter(visible=True)
        if knopf.count() == 0: return
        gruppen = [g for g in page.locator("[role=group]:visible").all() if g.get_attribute("aria-label") not in ("Richtung", "Tastenfeld")]
        g = gruppen[-1]; name = g.get_attribute("aria-label")
        k = versuch.get(name, 0); versuch[name] = k + 1
        opt = g.locator("button")
        opt.nth(k % opt.count()).click(); knopf.first.click(); page.wait_for_timeout(120)

def loese(page, wo):
    print("…", wo, flush=True)
    vorschritte(page)
    page.get_by_role("button", name="Lösung zeigen").filter(visible=True).first.click(); page.wait_for_timeout(150)
    tex = page.locator("[data-terme-loesung]:visible").first.get_attribute("data-terme-loesung")
    tasten = tasten_aus_tex(tex)
    page.locator("[data-termfeld-mittel]:visible [data-tm-feld]").focus(); page.keyboard.press("Escape")   # Feld leeren
    tippe(page, tasten)
    page.get_by_role("button", name="Prüfen", exact=True).filter(visible=True).first.click(); page.wait_for_timeout(250)
    ok = page.get_by_text("Richtig – gleichwertig und in der verlangten Form.").filter(visible=True).count() == 1
    pruefe(ok, f"{wo}: Ziellösung {tex} ({' '.join(tasten)}) nicht als richtig erkannt")
    return tex

with sync_playwright() as p:
    b = p.chromium.launch()
    for breite in (360, 390, 1280):
        mobil = breite < 840
        ctx = b.new_context(viewport={"width": breite, "height": 860}, locale="de-DE", has_touch=mobil, is_mobile=mobil, device_scale_factor=2 if mobil else 1)
        page = ctx.new_page(); konsole = []
        page.on("pageerror", lambda e: konsole.append(f"pageerror: {e}"))
        page.on("console", lambda m: konsole.append(m.text) if m.type == "error" and "net::" not in m.text and "Failed to load resource" not in m.text else None)
        page.goto(BASE)
        page.evaluate("localStorage.clear(); localStorage.setItem('mm-start-app','1'); localStorage.setItem('mm-onboarding-v1', JSON.stringify({uebersprungen:true}));")
        page.goto(BASE + "terme-vereinfachen"); page.wait_for_selector("[data-termfeld-mittel]", state="attached", timeout=15000); page.wait_for_timeout(500)
        if page.locator("[data-termfeld-mittel]:visible").count() == 0 and page.locator("[data-modus-reiter='ueben']").count():
            page.locator("[data-modus-reiter='ueben']").first.click(); page.wait_for_timeout(300)
        wo = f"{breite}"
        f = page.locator("[data-termfeld-mittel]:visible")
        pruefe(f.count() == 1, f"{wo}: Termfeld fehlt")
        pruefe(f.locator("[data-tm-taste]").count() == 24, f"{wo}: {f.locator('[data-tm-taste]').count()} Tasten statt 24")
        for t in ("π", "e", "√", "sin"):
            pruefe(f.locator(f"[data-tm-taste='{t}']").count() == 0, f"{wo}: Oberstufen-Taste {t}")
        pruefe(page.get_by_text("Gelesen als:").count() == 0, f"{wo}: alte Zeile „Gelesen als“")

        # leerer Nenner → Hinweis und Marke im Nenner
        tippe(page, ["x", "bruch"])
        page.get_by_role("button", name="Prüfen", exact=True).filter(visible=True).first.click(); page.wait_for_timeout(250)
        pruefe(page.get_by_text("Der Nenner ist noch leer.").filter(visible=True).count() == 1, f"{wo}: Hinweis leerer Nenner fehlt")
        pruefe(f.locator(".tm-bruch .unten.tm-kasten.hier").count() == 1, f"{wo}: Marke nicht im leeren Nenner")
        tippe(page, ["2", "→", "+", "x", "xⁿ", "3", "→"])
        pruefe(f.locator(".tm-bruch").count() == 1 and f.locator(".tm-hoch").count() == 1, f"{wo}: Bruch/Hochzahl nicht als Mathe gesetzt")
        f.locator("[data-tm-feld]").screenshot(path=f"{AUS}/{breite}-feld.png")
        # falscher Term
        page.get_by_role("button", name="Prüfen", exact=True).filter(visible=True).first.click(); page.wait_for_timeout(250)
        pruefe(page.get_by_text(re.compile("Noch nicht gleichwertig")).filter(visible=True).count() == 1, f"{wo}: falscher Term nicht erkannt")
        # Computertastatur
        for _ in range(12): f.locator("[data-tm-taste='⌫']").click()
        f.locator("[data-tm-feld]").focus(); page.keyboard.type("2x+1")
        txt = f.locator("[data-tm-feld]").inner_text().replace("\n", "").replace(" ", "")
        pruefe(txt == "2x+1", f"{wo}: Computertastatur ergab {txt!r}")
        sw = page.evaluate("document.documentElement.scrollWidth"); pruefe(sw <= breite, f"{wo}: Überbreite {sw}")
        if breite != 360: page.locator("[data-termfeld-mittel]:visible").locator("xpath=..").screenshot(path=f"{AUS}/{breite}-karte.png")

        # je Übung die Ziellösung eintippen
        for modus, richtung in (("Terme vereinfachen", None), ("Ausklammern", None), ("Binomische Formeln", "Ausmultiplizieren"), ("Binomische Formeln", "Faktorisieren"), ("Potenzgesetze", None)):
            page.get_by_role("tab", name=modus, exact=True).click(); page.wait_for_timeout(250)
            if richtung:
                page.get_by_role("button", name=richtung, exact=True).filter(visible=True).first.click(); page.wait_for_timeout(250)
            for runde in range(3):
                loese(page, f"{wo}/{modus}/{richtung or ''}/{runde}")
                page.get_by_role("button", name="Neue Aufgabe").filter(visible=True).first.click(); page.wait_for_timeout(200)
            sw = page.evaluate("document.documentElement.scrollWidth"); pruefe(sw <= breite, f"{wo}/{modus}: Überbreite {sw}")
        if konsole: pruefe(False, f"{wo}: Konsole {konsole[:3]}")
        ctx.close()
    b.close()

if fehler:
    print(f"{len(fehler)} FEHLER"); raise SystemExit(1)
print("Termeingabe Mittelstufe: alles grün")
