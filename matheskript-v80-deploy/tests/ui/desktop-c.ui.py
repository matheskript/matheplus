"""Browser-Test Desktop-Stil Gruppe C (Analysis-Trainer und Gleichungen), Muster: ebenevsebene.ui.py.
Je Breite (1440, 1100, 860 Desktop; 390, 360 Handy) und je Seite/Modus:
  · keine pageerror/Konsolenfehler, keine Überbreite (scrollWidth = Viewport)
  · Desktop: Arbeitsfläche bzw. Trainer-Raster zweispaltig (rechte Spalte rechts neben der linken), Handy: nicht
  · Schaubilder in echten Pixeln (Geraden, Hauptsatz, Parabeln, LGS): viewBox-Breite = dargestellte Breite
  · Bedienung: Regler (+/−), Modus-/Reiterwechsel, „Neue Aufgabe“, Prüfen
  npx vite build && npx vite preview --port 4173 &   →   BASE_URL=http://localhost:4173/ python3 tests/ui/desktop-c.ui.py
"""
import os, sys
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/").rstrip("/")
AUS = os.environ.get("SCREENSHOTS")
fehler = []
bekannt = lambda t: "ERR_TUNNEL" in t or "net::ERR" in t or "Failed to load resource" in t


def pruefe(bed, text):
    if not bed:
        fehler.append(text)
        print("FEHLT:", text)


THEMA = "document.querySelector('.pt-themaknopf').click()"
WAHL = lambda t: f"[...document.querySelectorAll('.wk-pop-liste button')].find(b => b.textContent.includes('{t}')).click()"
MENUE = "document.querySelector('[aria-haspopup=listbox]').click()"
OPTION = lambda t: f"[...document.querySelectorAll('[role=option]')].find(b => b.textContent.includes('{t}')).click()"
REITER = lambda t: f"[...document.querySelectorAll('[role=tab]')].find(b => b.textContent.includes('{t}')).click()"

# (Name, Pfad, Aktionen, zweispaltig am Desktop: Selektor links, Selektor rechts | None, SVG in echten Pixeln: Selektor | None)
AF = ("[data-arbeitsflaeche]:visible > div:first-child", "[data-arbeitsflaeche]:visible > div:last-child")
TR = ("[data-trainer-raster]:visible > div:first-child", "[data-trainer-raster]:visible > div:last-child")
IT = (".it-weg", ".it-bild")
INT_MENUE = "document.querySelector('[aria-label=\"Welche Aufgabe möchtest du üben?\"]').click()"
FAELLE = [
    ("ableiten", "/ableitungstrainer", [], (".abl-spalte-l", ".abl-spalte-r"), None),
    ("ableiten-eigen", "/ableitungstrainer", ["[...document.querySelectorAll('.abl-chip')].find((b) => b.textContent === 'Eigene Funktion').click()"], (".abl-spalte-l", ".abl-spalte-r"), None),
    ("hauptsatz-stamm", "/stammfunktion", [], AF, None),
    ("hauptsatz-integral", "/stammfunktion", ["document.querySelectorAll('.si-bereich button')[1].click()"], AF, "[data-si-integral] svg[role=img]"),
    # Integraltrainer (funcIntegralTrainer.jsx): Rechenweg links, Schaubild rechts – eigene Klassen statt data-trainer-raster
    ("integrale-bestimmt", "/integrale", [], IT, ".ib-buehne svg"),
    ("integrale-stamm", "/integrale", [INT_MENUE, OPTION("Stammfunktion bilden")], IT, ".ib-buehne svg"),
    ("integrale-flaeche", "/integrale", [INT_MENUE, OPTION("Fläche mit der x-Achse")], IT, ".ib-buehne svg"),
    ("integrale-zwei", "/integrale", [INT_MENUE, OPTION("zwischen zwei Graphen")], IT, ".ib-buehne svg"),
    ("integrale-bestand", "/integrale", [INT_MENUE, OPTION("Bestand")], None, None),
    ("optimierung", "/optimierung", [], TR, None),
    ("optimierung-eigen", "/optimierung", [REITER("Eigener")], TR, None),
    ("wachstum", "/wachstum", [], TR, None),
    ("wachstum-ziel", "/wachstum", [REITER("Zielwert")], TR, None),
    ("geraden", "/geradengleichung", [], AF, ".ger-bild svg"),
    ("geraden-pq", "/geradengleichung", ["document.querySelector('[data-ger-tab=pq]').click()"], AF, ".ger-bild svg"),
    ("geraden-pm", "/geradengleichung", ["document.querySelector('[data-ger-tab=pm]').click()"], AF, ".ger-bild svg"),
    ("parabeln-training", "/parabeln", [], AF, None),
    ("parabeln-scheitel", "/parabeln", ["[...document.querySelectorAll('.pt-seg button')][0].click()"], AF, ".pt-entdecken svg[role=img]"),
    ("parabeln-null", "/parabeln", [THEMA, WAHL("Nullst"), "[...document.querySelectorAll('.pt-seg button')][0].click()"], AF, ".pt-entdecken svg[role=img]"),
    ("parabeln-brenn", "/parabeln", [THEMA, WAHL("Brenn")], AF, ".pt-entdecken svg[role=img]"),
    ("parabeln-schnitt", "/parabeln", [THEMA, WAHL("Schnitt")], AF, None),
    ("gleichungen", "/gleichungen", [], TR, None),
    ("verstehen", "/gleichungen/verstehen", [], None, None),
    ("verstehen-geo", "/gleichungen/verstehen", [REITER("Geometrisch")], TR, None),
    ("lgs", "/lgs", [], TR, "[data-lgs-ebenen] svg"),
    ("ungleichungen", "/ungleichungen", [], AF, None),
    ("ungleichungen-quad", "/ungleichungen", ["document.querySelector('[data-kapitel=quadratisch]').click()"], AF, None),
]


def seite(b, w, h, pfad):
    kw = dict(viewport={"width": w, "height": h})
    if w < 600:
        kw.update(has_touch=True, is_mobile=True, device_scale_factor=2)
    ctx = b.new_context(**kw)
    p = ctx.new_page()
    p.on("pageerror", lambda e: fehler.append(f"{w}{pfad}: pageerror: {e}"))
    p.on("console", lambda m: fehler.append(f"{w}{pfad}: console: {m.text}") if m.type == "error" and not bekannt(m.text) else None)
    p.goto(BASE + pfad)
    p.wait_for_timeout(1600)
    for t in ["Verstanden", "Schließen", "OK", "Später"]:
        try:
            k = p.get_by_role("button", name=t, exact=True)
            if k.count():
                k.first.click(timeout=500)
        except Exception:
            pass
    return ctx, p


def ueberbreite(p, n):
    u = p.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")
    pruefe(u <= 1, f"{n}: horizontaler Überlauf {u}px")


def klick_text(p, name):
    k = p.locator(f"button:has-text('{name}'):visible")
    if k.count():
        k.first.click()
        p.wait_for_timeout(150)
        return True
    return False


with sync_playwright() as pw:
    b = pw.chromium.launch()
    for (w, h) in [(1440, 900), (1100, 760), (860, 760), (390, 844), (360, 740)]:
        desktop = w >= 840
        for name, pfad, aktionen, spalten, svg in FAELLE:
            n = f"{w}/{name}"
            ctx, p = seite(b, w, h, pfad)
            for a in aktionen:
                try:
                    p.evaluate(f"(() => {{ {a}; }})()")
                except Exception as e:
                    fehler.append(f"{n}: Aktion fehlgeschlagen {a[:50]}: {str(e)[:80]}")
                p.wait_for_timeout(350)
            ueberbreite(p, n)
            if spalten:
                l, r = p.locator(spalten[0]).first, p.locator(spalten[1]).first
                if desktop:
                    pruefe(l.count() == 1 and r.count() == 1, f"{n}: zweispaltige Anordnung fehlt")
                    bl, br = (l.bounding_box(), r.bounding_box()) if l.count() and r.count() else (None, None)
                    if bl and br:
                        pruefe(br["x"] >= bl["x"] + bl["width"] - 1, f"{n}: rechte Spalte steht nicht rechts")
                        pruefe(abs(br["y"] - bl["y"]) < 4, f"{n}: Spalten oben nicht bündig")
                else:
                    pruefe(p.locator("[data-arbeitsflaeche]:visible, [data-trainer-raster]:visible").count() == 0, f"{n}: Handy zeigt Desktop-Anordnung")
            if svg and desktop:
                s = p.locator(svg).first
                if s.count():
                    vb, bw = s.evaluate("e => [e.viewBox.baseVal.width, Math.round(e.getBoundingClientRect().width)]")
                    pruefe(abs(vb - bw) <= 3, f"{n}: Schaubild skaliert ({vb} statt {bw})")
                else:
                    fehler.append(f"{n}: Schaubild {svg} fehlt")
            # Desktop-Inhaltsspalte: Trainings-Werkzeuge laufen bis 940 px breit (index.css, data-training-breit) – nur Rand prüfen
            if desktop:
                af = p.locator("[data-arbeitsflaeche]:visible, [data-trainer-raster]:visible").first
                if af.count():
                    bx = af.bounding_box()
                    pruefe(bx is not None and bx["x"] >= 20 and bx["x"] + bx["width"] <= w - 20, f"{n}: Arbeitsfläche ohne Rand ({bx})")
            # Bedienung
            if name == "ableiten" and desktop:
                # seit 22.10.: Regelwerkstatt (wk-karte) mit Auto | Üben | Lernen
                pruefe(p.locator(".wk-karte").count() == 1, f"{n}: Werkstatt-Karte fehlt")
                p.locator(".abl-seg button", has_text="Auto").first.click(); p.wait_for_timeout(200)
                pruefe(p.locator(".wk-rechnung").count() >= 1, f"{n}: Auto zeigt keine Rechnung")
                p.locator(".abl-seg button", has_text="Üben").first.click(); p.wait_for_timeout(200)
                pruefe(p.locator("[data-ueben-wahl]").count() == 1, f"{n}: Üben zeigt keine Karten")
            if name == "geraden":
                pruefe(p.get_by_role("button", name="m +", exact=True).count() == 1, f"{n}: Regler m fehlt")
                p.get_by_role("button", name="m +", exact=True).click(); p.wait_for_timeout(120)
                pruefe(p.locator("text=m = 2,5").count() >= 1 or p.locator("text=2,5").count() >= 1, f"{n}: Regler m wirkt nicht")
            if name == "geraden-pq":
                p.get_by_role("button", name="Lösung zeigen").first.click(); p.wait_for_timeout(100)
                p.get_by_role("button", name="Weiter").click(); p.wait_for_timeout(100)
                p.get_by_role("button", name="Lösung zeigen").first.click(); p.wait_for_timeout(100)
                p.get_by_role("button", name="Weiter").click(); p.wait_for_timeout(100)
                pruefe(p.locator("[data-ger-ergebnis]").count() == 1, f"{n}: Ergebnis fehlt")
                p.get_by_role("button", name="Zufällige Punkte würfeln").click(); p.wait_for_timeout(100)
                pruefe(p.locator("[data-ger-ergebnis]").count() == 0, f"{n}: Würfel setzt nicht zurück")
            if name == "parabeln-scheitel":
                p.get_by_role("button", name="b +", exact=True).first.click(); p.wait_for_timeout(120)
                pruefe(p.locator("input[aria-label='b Wert eingeben']").first.input_value() == "−3", f"{n}: Regler b wirkt nicht")
            if name == "parabeln-brenn":
                p.get_by_role("button", name="d +1", exact=True).first.click(); p.wait_for_timeout(120)
                pruefe(p.locator("text=d = 0").count() >= 1 or not desktop, f"{n}: Regler d wirkt nicht")
            if name == "integrale-bestimmt":
                p.locator(".abl-seg button", has_text="Auto").first.click(); p.wait_for_timeout(300)
                pruefe(p.locator(".it-ergebnis").count() == 1, f"{n}: Auto zeigt kein Ergebnis")
                p.get_by_role("button", name="16", exact=True).click(); p.wait_for_timeout(150)
                ueberbreite(p, n + " streifen")
            if name in ("optimierung", "wachstum", "verstehen"):
                klick_text(p, "Lösung dieses Schritts zeigen"); klick_text(p, "Weiter zum nächsten Schritt")
                pruefe(p.locator("text=/✓/").count() >= 1, f"{n}: Schritt nicht abgeschlossen")
                klick_text(p, "Neue Aufgabe") or klick_text(p, "Neue Messreihe")
                ueberbreite(p, n + " neu")
            if name == "gleichungen":
                p.get_by_role("button", name="Ausführen").click(); p.wait_for_timeout(100)
                klick_text(p, "Neue Gleichung")
                ueberbreite(p, n + " neu")
            if name == "lgs":
                klick_text(p, "Gauß-Verfahren")
                pruefe(p.locator("text=GAUSS-VERFAHREN").count() == 1, f"{n}: Gauß-Musterlösung fehlt")
                klick_text(p, "Schnittpunkt zeigen")
                ueberbreite(p, n + " muster")
            if name == "ungleichungen":
                p.get_by_role("button", name="a +", exact=True).first.click(); p.wait_for_timeout(100)
                ueberbreite(p, n + " regler")
            if name == "parabeln-training":
                p.locator(".pt-chip", has_text="Einsetzen").first.click(); p.wait_for_timeout(150)
                p.locator(".pt-teil input").first.fill("97"); p.locator(".pt-pruefen").click(); p.wait_for_timeout(100)
                pruefe(p.locator(".pt-rueck").count() == 1, f"{n}: keine Rückmeldung")
            if AUS and w == 1280:
                p.screenshot(path=f"{AUS}/{name}.png", full_page=True)
            ctx.close()
    b.close()

if fehler:
    print("FEHLER:")
    for f in fehler:
        print(" -", f)
    sys.exit(1)
print("Desktop-Stil Gruppe C in Ordnung")
