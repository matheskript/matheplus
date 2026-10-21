"""Browser-Test Desktop-Stil, Gruppe Vektoren (Bausteine aus vekUi.jsx): Ebenen-Visualizer, Rechnen mit Vektoren,
Zwei/Drei Punkte, Abstände, Geraden im Raum, Winkel und Skalarprodukt, Kreuzprodukt.
Prüft je Breite: Desktop-Zweig nur ab 840 px, zwei Spalten (Bild rechts neben den Einstellungen, oben bündig),
Grafiken in echten Pixeln (viewBox-Breite = dargestellte Breite), keine Überbreite, keine Fehler.
Am Desktop zusätzlich Bedienung: Regler, Modus-Wechsel, „Neue Aufgabe“, Prüfen. Siehe README.md."""
import os, sys
from playwright.sync_api import sync_playwright

BASIS = os.environ.get("BASE_URL", "http://localhost:4173/").rstrip("/")
fehler = []
bekannt = lambda t: "ERR_TUNNEL" in t or "net::ERR" in t or "Failed to load resource" in t

# Pfad, Desktop-Kennung, Selektor der linken Spalte (erste Karte)
SEITEN = [
    ("/ebenen", "[data-ebenen=breit]", "[data-ebenen=breit] [data-vek-box]"),
    ("/vektorrechnen", "[data-vg=breit]", "[data-vg-arten]"),
    ("/zwei-punkte", "[data-zp=breit]", "[data-zp-punkte]"),
    ("/drei-punkte", "[data-dp=breit]", "[data-dp-punkte]"),
    ("/abstaende", "[data-abst=breit]", "[data-abst-objekt=von]"),
    ("/geraden-im-raum", "[data-ger-breit=probe]", "[data-ger-breit=probe] [data-vek-box]"),
    ("/winkel", "[data-ger-breit=skalar]", "[data-ger-breit=skalar] [data-vek-box]"),
    ("/kreuzprodukt", "[data-kp=breit]", "[data-kp-vektoren]"),
    ("/ebene-vs-ebene", "[data-eve=breit]", "[data-eve-karte='₁']"),
]


def pruefe(bed, text):
    if not bed:
        fehler.append(text)


def ueberbreite(p, n):
    u = p.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")
    pruefe(u <= 1, f"{n}: horizontaler Überlauf {u}px")


def oeffne(ctx, pfad, w):
    p = ctx.new_page()
    p.on("pageerror", lambda e: fehler.append(f"{w} {pfad}: pageerror: {e}"))
    p.on("console", lambda m: fehler.append(f"{w} {pfad}: console: {m.text}") if m.type == "error" and not bekannt(m.text) else None)
    p.goto(BASIS + pfad)
    p.wait_for_timeout(2000)
    for t in ["Verstanden", "Schließen", "OK", "Später"]:
        try:
            k = p.get_by_role("button", name=t, exact=True)
            if k.count():
                k.first.click(timeout=400)
        except Exception:
            pass
    return p


def echte_pixel(p, n):
    """Jede sichtbare Grafik im Arbeitsbereich: viewBox-Breite = dargestellte Breite (± 1 px)."""
    werte = p.evaluate("""() => [...document.querySelectorAll('[data-arbeitsflaeche] [data-vek-bild] svg[viewBox], [data-arbeitsflaeche] [data-vek-raum] svg[viewBox]')]
      .filter((s) => s.getBoundingClientRect().width > 150)
      .map((s) => [s.viewBox.baseVal.width, Math.round(s.getBoundingClientRect().width)])""")
    pruefe(len(werte) > 0 or "/vektorrechnen" in n or "/kreuzprodukt" in n or "/ebene-vs-ebene" in n, f"{n}: keine Grafik im Arbeitsbereich")
    for vb, bw in werte:
        pruefe(abs(vb - bw) <= 1, f"{n}: Grafik skaliert ({vb} statt {bw})")


def zwei_spalten(p, n, links):
    flaeche = p.locator("[data-arbeitsflaeche]:visible").first
    spalten = flaeche.locator(":scope > div")
    l, r = spalten.nth(0).bounding_box(), spalten.nth(1).bounding_box()
    pruefe(r["x"] >= l["x"] + l["width"] + 10, f"{n}: rechte Spalte steht nicht rechts")
    pruefe(abs(r["y"] - l["y"]) < 2, f"{n}: Spalten oben nicht bündig")
    pruefe(p.locator(links).first.is_visible(), f"{n}: linke Karte fehlt")


with sync_playwright() as pw:
    b = pw.chromium.launch()
    for (w, h) in [(1440, 900), (1100, 760), (860, 760), (390, 844), (360, 740)]:
        kw = dict(viewport={"width": w, "height": h})
        if w < 600:
            kw.update(has_touch=True, is_mobile=True, device_scale_factor=2)
        ctx = b.new_context(**kw)
        desktop = w >= 840
        for pfad, kennung, links in SEITEN:
            n = f"{w} {pfad}"
            p = oeffne(ctx, pfad, w)
            pruefe(p.locator(kennung).count() == (1 if desktop else 0), f"{n}: falsches Layout (Desktop erwartet: {desktop})")
            if not desktop:
                pruefe(p.locator("[data-arbeitsflaeche]").count() == 0, f"{n}: Arbeitsfläche am Handy")
            ueberbreite(p, n)
            if desktop:
                zwei_spalten(p, n, links)
                echte_pixel(p, n)
            p.close()

        if desktop:
            # Bedienung am Desktop
            p = oeffne(ctx, "/ebenen", w)
            p.get_by_role("button", name="a erhöhen", exact=True).click()
            pruefe(p.get_by_text("4x₁ + 2x₂ + x₃ = 6").count() >= 1, f"{w} ebenen: Regler a wirkt nicht")
            p.get_by_role("button", name="Würfel").click()
            p.locator("[data-vek-fall='∥ x₃-Achse']").click()
            pruefe(p.get_by_text("x₁ + x₂ = 4").count() >= 1, f"{w} ebenen: Beispiel wirkt nicht")
            ueberbreite(p, f"{w} ebenen Beispiel")
            p.close()

            p = oeffne(ctx, "/vektorrechnen", w)
            p.locator("[data-vek-reiter=linear]").click()
            pruefe(p.get_by_text("Skalare hineinmultiplizieren").count() == 1, f"{w} vektorrechnen: Rechenart wechselt nicht")
            p.locator("[data-vek-neu]").click()
            pruefe(p.get_by_text("Beispiel 2").count() == 1, f"{w} vektorrechnen: Neues Beispiel zählt nicht")
            p.close()

            p = oeffne(ctx, "/drei-punkte", w)
            p.locator("[data-vek-fall=C]").click()
            pruefe(p.get_by_text("Rechenweg mit Stützpunkt C").count() == 1, f"{w} drei-punkte: Weg wechselt nicht")
            pruefe(p.locator("[data-dp-weg=C]").count() == 1, f"{w} drei-punkte: Rechenweg C fehlt")
            p.close()

            p = oeffne(ctx, "/abstaende", w)
            pruefe(p.locator("[data-abst-ergebnis] [data-vek-ergebnis]").count() == 1, f"{w} abstände: Ergebnis links fehlt")
            p.get_by_role("radiogroup", name="Erstes Objekt").get_by_role("radio", name="Gerade").click()
            p.get_by_role("radiogroup", name="Zweites Objekt").get_by_role("radio", name="Gerade").click()
            pruefe(p.get_by_text("Gemeinsame Senkrechte: beide Lotfußpunkte").count() == 1, f"{w} abstände: Gerade–Gerade fehlt")
            p.get_by_role("radiogroup", name="Erstes Objekt").get_by_role("radio", name="Punkt").click()
            p.locator("[data-vek-reiter=lot]").click()
            p.get_by_role("button", name="Prüfen").click()
            pruefe(p.get_by_text("Bitte alle drei Koordinaten eintragen").count() == 1, f"{w} abstände: Lotpunkt-Prüfung fehlt")
            ueberbreite(p, f"{w} abstände Lot")
            p.close()

            p = oeffne(ctx, "/geraden-im-raum", w)
            for tab in ["gg", "ge", "probe"]:
                p.locator(f"[data-vek-reiter={tab}]").click()
                box = p.locator(f"[data-ger-breit={tab}]")
                pruefe(box.is_visible(), f"{w} geraden: Modus {tab} nicht sichtbar")
                if tab == "gg":
                    pruefe(box.locator("[data-raum3=breit] [data-vek-fall=windschief]").count() == 1, f"{w} geraden gg: Übungsfall nicht in der Werkzeugleiste")
                box.locator("[data-vek-tipp]").first.click()
                pruefe(box.locator("[data-ger-rechnung] [data-vek-ergebnis]").count() == 1, f"{w} geraden {tab}: Rechnung fehlt nach Vermutung")
                box.locator("[data-vek-neu]").click()
                pruefe(box.locator("[data-ger-rechnung]").count() == 0, f"{w} geraden {tab}: Neue Aufgabe setzt nicht zurück")
                ueberbreite(p, f"{w} geraden {tab}")
            p.close()

            p = oeffne(ctx, "/winkel", w)
            box = p.locator("[data-ger-breit=skalar]")
            box.locator("[data-vek-tipp=spitz]").click()
            box.get_by_role("textbox", name="Skalarprodukt").fill("0")
            box.get_by_role("button", name="Prüfen").click()
            pruefe(box.locator("[data-ger-rechnung] [data-vek-ergebnis]").count() == 1, f"{w} winkel: Rechnung nach Prüfen fehlt")
            p.locator("[data-vek-reiter=winkel]").click()
            pruefe(p.locator("[data-ger-breit=winkel]").is_visible(), f"{w} winkel: Vektorwinkel fehlt")
            p.locator("[data-vek-reiter=ge]").click()
            pruefe(p.locator("[data-ger-breit=ge-winkel]").is_visible(), f"{w} winkel: Modus-Wechsel fehlt")
            pruefe(p.locator("[data-ger-breit=ge-winkel] [data-ger-warum]").count() == 1, f"{w} winkel: Erklärung Sinus/Kosinus fehlt")
            ueberbreite(p, f"{w} winkel")
            p.close()

            p = oeffne(ctx, "/kreuzprodukt", w)
            p.get_by_role("button", name="a1 +").click()
            pruefe(p.get_by_role("textbox", name="a1", exact=True).input_value() == "3", f"{w} kreuzprodukt: + wirkt nicht")
            p.locator("[data-vek-fall=Parallel]").click()
            pruefe(p.get_by_text("Was der Nullvektor bedeutet").count() == 1, f"{w} kreuzprodukt: Parallel nicht erkannt")
            p.close()

            p = oeffne(ctx, "/zwei-punkte", w)
            pruefe(p.locator("[data-zp-weg]").count() == 2, f"{w} zwei-punkte: beide Wege fehlen")
            p.locator("[data-vek-neu]").first.click()
            ueberbreite(p, f"{w} zwei-punkte neu")
            p.close()

            p = oeffne(ctx, "/ebene-vs-ebene", w)
            pruefe(p.locator("[data-eve-karte] [data-vek-box]").count() == 2, f"{w} ebene-vs-ebene: E₁/E₂ nicht als Boxen")
            p.close()
        ctx.close()
    b.close()

if fehler:
    print("FEHLER:")
    for f in fehler:
        print(" -", f)
    sys.exit(1)
print("desktop-a.ui.py: alles grün")
