"""Vektoren-Band und Hubs (22.10.2026), bei 360/390/1280 px:
- Band: sieben Reiter in der Reihenfolge Rechnen · Geraden · Ebenen · Winkel · Zwei Ebenen · Abstände · Normalenform
- Kreuzprodukt-Rechner offen → Reiter „Rechnen“ aktiv; der erste Reiter bleibt im Bild, wenn man auf den zweiten geht
- Rechnen: fünf Rechenarten (Addition, Skalarmultiplikation, Linearkombination, Skalarprodukt, Kreuzprodukt)
- Hub Geraden (zwei-punkte, geraden-im-raum): Menü mit vier Übungen, Wechsel zwischen den Übungen; Hub Ebenen: zwei Übungen
- Normalenform: drei Teile, Regler verändern die Live-Rechnung, jede Übung prüft eine richtige Eingabe als richtig
- keine pageerror, keine Überbreite; Screenshots nach $SHOTS
Aufruf: BASE_URL=http://localhost:4317/ SHOTS=/tmp/x python3 tests/ui/vektoren-band.ui.py"""
import os, sys
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
SHOTS = os.environ.get("SHOTS", "")
REIHE = ["rechnen", "geraden", "ebenen", "winkel", "ebenevsebene", "abstaende", "hesse"]
SEITEN = ["vektorrechnen", "kreuzprodukt", "zwei-punkte", "geraden-im-raum", "drei-punkte", "ebenen", "vektorwinkel", "ebene-vs-ebene", "abstaende", "normalenform"]
bekannt = lambda t: "net::" in t or "Failed to load resource" in t
fehler = []


def pruefe(bed, text):
    if not bed:
        fehler.append(text)


def schuss(pg, name):
    if SHOTS:
        os.makedirs(SHOTS, exist_ok=True)
        pg.screenshot(path=os.path.join(SHOTS, name + ".png"), full_page=True)


def sichtbar(pg, sel):
    return pg.evaluate(f"""() => {{ const e = document.querySelector('{sel}'); if (!e) return false; const r = e.getBoundingClientRect(); const p = e.closest('.wb-reiter').getBoundingClientRect(); return r.left >= p.left - 1 && r.right <= p.right + 1; }}""")


with sync_playwright() as p:
    b = p.chromium.launch()
    for w in (360, 390, 1280):
        ctx = b.new_context(viewport={"width": w, "height": 860})
        for s in SEITEN:
            pg = ctx.new_page()
            kons = []
            pg.on("pageerror", lambda e: kons.append(str(e)))
            pg.on("console", lambda m: kons.append(m.text) if m.type == "error" and not bekannt(m.text) else None)
            pg.goto(BASE + s)
            pg.wait_for_timeout(1600)
            n = f"{s}@{w}"
            # Band
            reiter = pg.evaluate("() => [...document.querySelectorAll('[data-werkzeug-band] [data-wb-reiter]')].map(e => e.dataset.wbReiter)")
            pruefe(reiter == REIHE, f"{n}: Band-Reiter {reiter}")
            aktiv = pg.evaluate("() => { const e = document.querySelector('[data-werkzeug-band] [data-wb-reiter][aria-current=page]'); return e && e.dataset.wbReiter; }")
            erwartet = {"vektorrechnen": "rechnen", "kreuzprodukt": "rechnen", "zwei-punkte": "geraden", "geraden-im-raum": "geraden", "drei-punkte": "ebenen", "ebenen": "ebenen",
                        "vektorwinkel": "winkel", "ebene-vs-ebene": "ebenevsebene", "abstaende": "abstaende", "normalenform": "hesse"}[s]
            pruefe(aktiv == erwartet, f"{n}: aktiver Reiter {aktiv} statt {erwartet}")
            if s == "vektorrechnen":
                arten = pg.evaluate("() => [...document.querySelectorAll('[data-vek-reiter]')].filter(e => e.offsetParent).map(e => e.dataset.vekReiter)")
                pruefe(arten == ["addsub", "skalar", "linear", "skalarprodukt", "kreuzprodukt"], f"{n}: Rechenarten {arten}")
                pg.locator("[data-vek-reiter=kreuzprodukt]").first.click()
                pg.wait_for_timeout(300)
                pruefe("Kreuzprodukt" in pg.locator("[data-vek-tafel] h3").first.inner_text(), f"{n}: Kreuzprodukt-Rechnung fehlt")
                pg.locator("[data-vek-reiter=skalarprodukt]").first.click()
                pg.wait_for_timeout(300)
                pruefe("Skalarprodukt" in pg.locator("[data-vek-tafel] h3").first.inner_text(), f"{n}: Skalarprodukt-Rechnung fehlt")
                schuss(pg, f"rechnen-skalarprodukt-{w}")
                # Reiter 1 bleibt im Bild, wenn der zweite Reiter geöffnet wird
                pg.locator("[data-werkzeug-band] [data-wb-reiter=geraden]").click()
                pg.wait_for_timeout(1200)
                pruefe(sichtbar(pg, "[data-werkzeug-band] [data-wb-reiter=rechnen]"), f"{n}: Reiter „Rechnen“ verschwindet beim Wechsel auf „Geraden“")
                pruefe(pg.locator("[data-vek-hub=geraden]").count() == 1, f"{n}: Hub Geraden öffnet nicht")
            if s in ("zwei-punkte", "geraden-im-raum"):
                menue = pg.evaluate("() => [...document.querySelectorAll('[data-vek-hub-menue] [data-vek-reiter]')].map(e => e.dataset.vekReiter)")
                pruefe(menue == ["zweipunkte", "probe", "gg", "ge"], f"{n}: Hub-Menü Geraden {menue}")
                akt = pg.evaluate("() => { const e = document.querySelector('[data-vek-hub-menue] [aria-selected=true]'); return e && e.dataset.vekReiter; }")
                pruefe(akt == ("zweipunkte" if s == "zwei-punkte" else "probe"), f"{n}: aktive Übung {akt}")
                schuss(pg, f"{s}-{w}")
                if s == "geraden-im-raum":
                    pg.locator("[data-vek-hub-menue] [data-vek-reiter=gg]").click()
                    pg.wait_for_timeout(400)
                    pruefe(pg.locator("[data-vek-hub-uebung=gg] [data-vek-modus=gg]").count() == 1 and pg.evaluate("() => getComputedStyle(document.querySelector('[data-vek-modus=gg]')).display") == "block", f"{n}: Gerade–Gerade zeigt nicht")
                    pg.locator("[data-vek-modus=gg] [data-vek-tipp=windschief]").click()
                    pg.wait_for_timeout(200)
                    pruefe(pg.locator("[data-vek-modus=gg] [data-vek-ergebnis]").count() == 1, f"{n}: Ergebnis Gerade–Gerade fehlt")
                    schuss(pg, f"geraden-gg-{w}")
                    pg.locator("[data-vek-hub-menue] [data-vek-reiter=zweipunkte]").click()
                    pg.wait_for_timeout(1400)
                    pruefe(pg.url.endswith("/zwei-punkte"), f"{n}: Wechsel auf Zwei Punkte ändert den Pfad nicht ({pg.url})")
                    pruefe(pg.locator("[data-vek-hub-uebung=zweipunkte]").count() == 1, f"{n}: Zwei Punkte zeigt nicht")
                else:
                    pg.locator("[data-vek-hub-menue] [data-vek-reiter=ge]").click()
                    pg.wait_for_timeout(1400)
                    pruefe(pg.url.endswith("/geraden-im-raum"), f"{n}: Wechsel auf Gerade–Ebene ändert den Pfad nicht ({pg.url})")
                    akt2 = pg.evaluate("() => { const e = document.querySelector('[data-vek-hub-menue] [aria-selected=true]'); return e && e.dataset.vekReiter; }")
                    pruefe(akt2 == "ge", f"{n}: nach dem Wechsel aktiv {akt2} statt ge")
                    pruefe(pg.evaluate("() => getComputedStyle(document.querySelector('[data-vek-modus=ge]')).display") == "block", f"{n}: Gerade–Ebene zeigt nicht")
            if s in ("drei-punkte", "ebenen"):
                menue = pg.evaluate("() => [...document.querySelectorAll('[data-vek-hub-menue] [data-vek-reiter]')].map(e => e.dataset.vekReiter)")
                pruefe(menue == ["dreipunkte", "raum"], f"{n}: Hub-Menü Ebenen {menue}")
                schuss(pg, f"{s}-{w}")
            if s == "normalenform":
                teile = pg.evaluate("() => [...document.querySelectorAll('[data-hesse-menue] [data-vek-reiter]')].map(e => e.dataset.vekReiter)")
                pruefe(teile == ["normalenvektor", "normalenform", "hnf"], f"{n}: Teile {teile}")
                pruefe(pg.locator("[data-hesse-teil=normalenvektor]").count() == 1, f"{n}: Teil 1 fehlt")
                schuss(pg, f"hesse-1-{w}")
                # Übung 1: Normalenvektor ablesen – richtige Eingabe
                felder = pg.locator("[data-hesse-trainer=ablesen] input")
                pruefe(felder.count() == 3, f"{n}: drei Felder für n")
                frage = pg.locator("[data-hesse-trainer=ablesen] [data-vek-tafel] p").first.inner_text()
                # Koeffizienten aus der Anzeige lesen: „E: 2x₁ − 3x₂ + x₃ = 4“
                import re
                m = re.search(r"E: (.*?) = ", frage)
                koeff = [0, 0, 0]
                for vz, zahl, idx in re.findall(r"([−+]?)\s*(\d*)x([₁₂₃])", m.group(1)):
                    k = int(zahl) if zahl else 1
                    koeff["₁₂₃".index(idx)] = -k if vz == "−" else k
                for i in range(3):
                    felder.nth(i).fill(str(koeff[i]).replace("-", "−"))
                pg.get_by_role("button", name="Prüfen").first.click()
                pg.wait_for_timeout(200)
                pruefe("Richtig" in pg.locator("[data-hesse-trainer=ablesen] [role=status]").first.inner_text(), f"{n}: richtige n-Eingabe nicht erkannt ({koeff})")
                # Teil 2: Regler h → Skalarprodukt ≠ 0
                pg.locator("[data-hesse-menue] [data-vek-reiter=normalenform]").click()
                pg.wait_for_timeout(500)
                pruefe(pg.locator("[data-hesse-teil=normalenform]").count() == 1, f"{n}: Teil 2 fehlt")
                pg.get_by_role("button", name="h erhöhen").first.click()
                pg.wait_for_timeout(200)
                pruefe("≠ 0" in pg.locator("[data-hesse-teil=normalenform]").inner_text(), f"{n}: h-Regler ändert das Skalarprodukt nicht")
                schuss(pg, f"hesse-2-{w}")
                # Teil 3: Abstand-Übung
                pg.locator("[data-hesse-menue] [data-vek-reiter=hnf]").click()
                pg.wait_for_timeout(500)
                pruefe(pg.locator("[data-hesse-teil=hnf]").count() == 1, f"{n}: Teil 3 fehlt")
                pg.locator("[data-hesse-teil=hnf] [data-vek-fall=abstand]").click()
                pg.wait_for_timeout(200)
                frage = pg.locator("[data-hesse-trainer=abstand] [data-vek-tafel] p").first.inner_text()
                m = re.search(r"E: (.*?) = (−?\d+)\..*P\((−?\d+) \| (−?\d+) \| (−?\d+)\)", frage)
                pruefe(m is not None, f"{n}: Abstand-Aufgabe nicht lesbar: {frage}")
                if m:
                    koeff = [0, 0, 0]
                    for vz, zahl, idx in re.findall(r"([−+]?)\s*(\d*)x([₁₂₃])", m.group(1)):
                        k = int(zahl) if zahl else 1
                        koeff["₁₂₃".index(idx)] = -k if vz == "−" else k
                    d = int(m.group(2).replace("−", "-"))
                    P = [int(m.group(i).replace("−", "-")) for i in (3, 4, 5)]
                    L = round(sum(k * k for k in koeff) ** 0.5)
                    abstand = abs(sum(k * x for k, x in zip(koeff, P)) - d) / L
                    pruefe(abs(abstand - round(abstand)) < 1e-9 and L * L == sum(k * k for k in koeff), f"{n}: Abstand nicht ganzzahlig ({koeff}, {d}, {P})")
                    pg.locator("[data-hesse-trainer=abstand] input").first.fill(str(int(round(abstand))))
                    pg.locator("[data-hesse-trainer=abstand]").get_by_role("button", name="Prüfen").click()
                    pg.wait_for_timeout(200)
                    pruefe("Richtig" in pg.locator("[data-hesse-trainer=abstand] [role=status]").first.inner_text(), f"{n}: richtiger Abstand nicht erkannt")
                    # falsche Eingabe → Rechenweg offen
                    pg.locator("[data-hesse-trainer=abstand] input").first.fill("999")
                    pg.locator("[data-hesse-trainer=abstand]").get_by_role("button", name="Prüfen").click()
                    pg.wait_for_timeout(200)
                    pruefe(pg.locator("[data-hesse-trainer=abstand] [data-vek-rechenweg]").count() == 1, f"{n}: Rechenweg nach Fehler fehlt")
                schuss(pg, f"hesse-3-{w}")
            if s in ("vektorwinkel", "ebene-vs-ebene", "abstaende", "kreuzprodukt"):
                schuss(pg, f"{s}-{w}")
            breite = pg.evaluate("() => document.documentElement.scrollWidth")
            pruefe(breite <= w, f"{n}: Überbreite {breite} > {w}")
            pruefe(not kons, f"{n}: Konsole {kons[:2]}")
            pg.close()
        ctx.close()
    b.close()

if fehler:
    print("\n".join(fehler)); sys.exit(1)
print("vektoren-band.ui.py: alles ok")
