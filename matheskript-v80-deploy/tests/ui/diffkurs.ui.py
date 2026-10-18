"""Browser-Test Kurs Differentialrechnung (/differentialrechnung): Trainieren mit drei Reitern.
Bei 390 px jedes Modul, bei 360 und 1280 px eine Auswahl:
  · Reiter Aufgaben: alle Buchaufgaben da, eine aufklappen, „Lösung aus dem Buch“, „Neue Aufgaben dieses Typs üben“
  · Aufgabentool: jeder Aufgabentyp des Kapitels einmal komplett gelöst – Terme werden so eingetippt,
    wie sie angezeigt werden (aus dem TeX in Eingabeschreibweise übersetzt), dazu einmal eine falsche Eingabe
  · „Nächste Aufgabe vom selben Typ“ liefert eine neue Aufgabe desselben Typs
  · Reiter Sätze und Definitionen und Werkzeuge
  · keine Seitenfehler, keine Konsolenfehler, keine Überbreite
  npx vite preview --port 4173 &   →   BASE_URL=http://localhost:4173/ python3 tests/ui/diffkurs.ui.py
"""
import json, os, re
from fractions import Fraction
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
AUS = os.environ.get("SCREENS", "/tmp/diffkurs")
os.makedirs(AUS, exist_ok=True)
fehler = []
def pruefe(bed, text):
    if not bed:
        fehler.append(text); print("FEHLT:", text)

def tex_eingabe(t):
    """Angezeigtes TeX so eintippen, wie ein Schüler es schreiben würde."""
    s = t.replace("−", "-").replace("\\cdot", "*").replace("\\,", "").replace("{,}", ".").replace("\\pi", "pi").replace("\\left", "").replace("\\right", "")
    for _ in range(6):
        s = re.sub(r"\\frac\{([^{}]*)\}\{([^{}]*)\}", r"(\1)/(\2)", s)
        s = re.sub(r"\\sqrt\{([^{}]*)\}", r"sqrt(\1)", s)
        s = re.sub(r"\^\{([^{}]*)\}", r"^(\1)", s)
        s = re.sub(r"\(([^()]*)\)\^\(([^()]*)\)", r"(\1)^(\2)", s)
    s = re.sub(r"\\(sin|cos|tan|ln)\s*x", r"\1(x)", s).replace("\\sin", "sin").replace("\\cos", "cos").replace("\\ln", "ln").replace("\\tan", "tan")
    return s.replace(" ", "")

def aufgabe(page):
    return page.evaluate("""() => JSON.parse(JSON.stringify(window.__dkAufgabe, (k, v) => typeof v === 'function' ? undefined : v))""")

def zahl_text(v):
    """ganze Zahl, sonst Bruch mit kleinem Nenner (so tippt man es), sonst Dezimalzahl mit Komma"""
    if abs(v - round(v)) < 1e-9: return str(int(round(v)))
    f = Fraction(v).limit_denominator(1000)
    if abs(f.numerator / f.denominator - v) < 1e-10: return f"{f.numerator}/{f.denominator}"
    return repr(round(v, 6)).replace(".", ",")

def loese(page, tool, wo, falsch_testen=False):
    au = aufgabe(page)
    for i, s in enumerate(au["schritte"]):
        knopf = tool.get_by_role("button", name="Schritt prüfen")
        if s["art"] == "wahl":
            nr = [o[0] for o in s["optionen"]].index(s["richtig"])
            tool.get_by_role("group", name=s["titel"]).get_by_role("button").nth(nr).click()
        else:
            feld = tool.locator("input[data-mathe-modus]:not([disabled])").last
            if s["art"] == "zahl": wert = zahl_text(s["wert"])
            elif s["art"] == "liste": wert = "; ".join(zahl_text(v) for v in s["werte"])
            elif s["art"] == "stamm": wert = tex_eingabe(re.sub(r"^\$|\$$", "", s["wertText"]))
            else: wert = tex_eingabe(s["soll"]["tex"])
            if falsch_testen and i == 0:
                feld.fill("12345"); knopf.click(); page.wait_for_timeout(80)
                pruefe(tool.get_by_text(re.compile("Noch nicht|Denkfehler|Bitte|Es gibt genau|Gesucht ist")).count() > 0, f"{wo}: keine Rückmeldung auf falsche Eingabe")
            feld.fill(wert)
        knopf.click()
        page.wait_for_timeout(60)
        if s["art"] == "wahl": continue
        # Nach richtiger Eingabe ist das Feld weg (Schritt erledigt)
        if tool.get_by_role("button", name="Schritt prüfen").count() and i == len(au["schritte"]) - 1:
            pruefe(False, f"{wo}: {au['typ']} Schritt {s['id']} nicht als richtig erkannt (Eingabe {wert!r}, TeX {s.get('soll', {}).get('tex', '')})")
            return False
    ok = tool.get_by_text("Richtig gelöst.").count() > 0
    pruefe(ok, f"{wo}: {au['typ']} nicht fertig")
    return ok

def module(page):
    return page.evaluate("""async () => (await import('/src/diffKursDaten.js')).KURS_MODULE""") if False else None

TITEL = ["Geraden und Steigung", "Geradengleichungen ermitteln", "Mittlere Änderungsrate", "Training I", "Das Tangentenproblem", "Der Differenzenquotient",
  "Von der Sekante zur Tangente", "Die Ableitung an einer Stelle", "Die Ableitungsfunktion", "Training II", "Faktorregel", "Summenregel", "Produktregel",
  "Potenzregel", "Quotientenregel", "Kettenregel", "Sinus, Kosinus, eˣ und ln x", "Training III", "Tangente und Normale", "Vermischte Übungen und Rückblick"]

with sync_playwright() as p:
    b = p.chromium.launch()
    for breite, auswahl in [(390, TITEL), (360, ["Faktorregel", "Training I"]), (1280, ["Kettenregel", "Die Ableitung an einer Stelle"])]:
        ctx = b.new_context(viewport={"width": breite, "height": 860})
        page = ctx.new_page()
        konsole = []
        page.on("console", lambda m: konsole.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: konsole.append(str(e)))
        for titel in auswahl:
            wo = f"{breite}px {titel}"
            page.goto(BASE + "differentialrechnung")
            page.locator(".dk-modul", has_text=titel).first.click()
            page.wait_for_selector(".dk-reiter")
            page.locator("[data-dk-reiter=aufgaben]").click()
            page.wait_for_selector("[data-buchaufgabe]", timeout=8000)
            karten = page.locator("[data-buchaufgabe]")
            pruefe(karten.count() >= 6, f"{wo}: nur {karten.count()} Buchaufgaben")
            karten.first.locator("button.dk-karte-kopf").click()
            pruefe(karten.first.locator(".dk-buch .katex").count() > 0 or "Aufgabe" in karten.first.inner_text(), f"{wo}: Aufgabe ohne Formeln")
            lk = karten.first.get_by_role("button", name=re.compile("Lösung aus dem Buch"))
            if lk.count():
                lk.click(); pruefe(karten.first.get_by_text("LÖSUNG AUS DEM BUCH").count() == 1, f"{wo}: Lösung nicht sichtbar")
            ueb = page.locator("[data-ueben]").first
            if ueb.count() == 0:
                # erste Karte ist eine Begründungsaufgabe: eine mit Typ suchen
                for i in range(karten.count()):
                    k = karten.nth(i)
                    if k.get_by_text("NEUE AUFGABEN").count():
                        k.locator("button.dk-karte-kopf").click(); ueb = k.locator("[data-ueben]"); break
            tool = page.locator("section[aria-label=Aufgabentool]")
            pruefe(tool.count() == 1, f"{wo}: kein Aufgabentool")
            if ueb.count():
                ueb.click(); page.wait_for_timeout(250)
            typen = [t.get_attribute("data-typ") for t in tool.locator("[data-typ]").all()]
            pruefe(len(typen) >= 1, f"{wo}: keine Aufgabentypen")
            for j, t in enumerate(typen):
                tool.locator(f"[data-typ='{t}']").click()
                page.wait_for_timeout(80)
                pruefe(aufgabe(page)["typ"] == t, f"{wo}: Typwahl {t}")
                if loese(page, tool, wo, falsch_testen=(j == 0)):
                    alt = aufgabe(page)["id"]
                    tool.get_by_role("button", name="Nächste Aufgabe vom selben Typ").click(); page.wait_for_timeout(80)
                    neu = aufgabe(page)
                    pruefe(neu["id"] != alt and neu["typ"] == t, f"{wo}: Nächste Aufgabe {t}")
                    if breite != 390: loese(page, tool, wo + " (2.)")
            sw = page.evaluate("document.documentElement.scrollWidth")
            pruefe(sw <= breite, f"{wo}: Überbreite {sw}")
            page.screenshot(path=f"{AUS}/{breite}-{TITEL.index(titel):02d}-aufgaben.png", full_page=False)
            tool.screenshot(path=f"{AUS}/{breite}-{TITEL.index(titel):02d}-tool.png")
            page.locator("[data-dk-reiter=saetze]").click()
            page.wait_for_timeout(100)
            n = page.locator("[data-kasten]").count()
            pruefe(n > 0 or titel.startswith("Training") or titel in ("Mittlere Änderungsrate",), f"{wo}: keine Sätze/Definitionen")
            if n: page.locator("[data-kasten]").first.screenshot(path=f"{AUS}/{breite}-{TITEL.index(titel):02d}-satz.png")
            page.locator("[data-dk-reiter=werkzeuge]").click()
            pruefe(page.get_by_text("Tippe auf ein Werkzeug").count() == 1, f"{wo}: Werkzeuge fehlen")
            sw = page.evaluate("document.documentElement.scrollWidth")
            pruefe(sw <= breite, f"{wo}: Überbreite {sw} (Werkzeuge/Sätze)")
            page.locator("[data-dk-reiter=aufgaben]").click()
        pruefe(not konsole, f"{breite}px Konsole: {konsole[:3]}")
        ctx.close()
    b.close()

print("\n".join(fehler) if fehler else "Alles in Ordnung.")
raise SystemExit(1 if fehler else 0)
