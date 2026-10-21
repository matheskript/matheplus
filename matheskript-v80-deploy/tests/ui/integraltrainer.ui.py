"""Browser-Test Integraltrainer (/integrale, src/funcIntegralTrainer.jsx):
- Menü: alle sechs Aufgabentypen wählbar, Automatik zeigt den ganzen Rechenweg und das Ergebnis.
- Training: Schritt für Schritt – falsche Eingabe → Hinweis → „Lösung zeigen“ → nächster Schritt; am Ende „Neue Aufgabe“.
- Bild: Fläche erscheint erst, wenn der Integral-Schritt gelöst ist; „Fläche wachsen lassen“, Streifen, Regler.
- Desktop: Rechenweg links, Bild rechts. Keine Überbreite, keine Fehler in der Konsole.
  npx vite build && npx vite preview --port 4173 &   →   python3 tests/ui/integraltrainer.ui.py
"""
import os
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
AUS = os.environ.get("SCREENS", "/tmp/integraltrainer")
os.makedirs(AUS, exist_ok=True)
NAMEN = {"stamm": "Stammfunktion bilden", "anfang": "Stammfunktion durch einen Punkt", "bestimmt": "Bestimmtes Integral",
         "flaeche": "Fläche mit der x-Achse", "zwei": "Fläche zwischen zwei Graphen", "bestand": "Bestand und Änderungsrate"}
fehler = []
def pruefe(bed, text):
    if not bed:
        fehler.append(text); print("FEHLT:", text)

def waehle(page, typ):
    page.get_by_role("button", name="Welche Aufgabe möchtest du üben?").click(); page.wait_for_timeout(250)
    page.get_by_role("option", name=NAMEN[typ]).click(); page.wait_for_timeout(500)

def schritt_durch(page, a):
    feld = a.locator(".wk-feld")
    if feld.count():
        feld.first.click(); page.wait_for_timeout(200)
        a.get_by_role("button", name="Lieber selbst tippen").click(); page.wait_for_timeout(150)
        a.locator("input").first.fill("x+7"); a.get_by_role("button", name="OK", exact=True).click()
    else:
        for inp in a.locator("input").all(): inp.fill("99")
        a.locator(".it-ok").click()
    page.wait_for_timeout(250)
    pruefe(a.locator(".it-hinweis").count() == 1, "kein Hinweis nach falscher Eingabe")
    a.get_by_role("button", name="Lösung zeigen").click(); page.wait_for_timeout(300)

with sync_playwright() as p:
    b = p.chromium.launch()
    for breite in (360, 390, 1280):
        ctx = b.new_context(viewport={"width": breite, "height": 860}, locale="de-DE")
        page = ctx.new_page()
        konsole = []
        page.on("pageerror", lambda e: konsole.append(f"pageerror: {e}"))
        page.on("console", lambda m: konsole.append(m.text) if m.type == "error" else None)
        page.goto(BASE)
        page.evaluate("localStorage.clear(); localStorage.setItem('mm-onboarding-v1', JSON.stringify({uebersprungen:true}));")
        page.goto(BASE + "integrale"); page.wait_for_timeout(1500)
        breit = lambda: page.evaluate("document.documentElement.scrollWidth")

        # Start: bestimmtes Integral im Training, Fläche noch offen (schraffiert, „?“)
        pruefe(page.locator(".it-aufgabe").count() == 1, f"{breite}: Aufgabe fehlt")
        pruefe(page.locator(".ib-buehne svg").count() == 1, f"{breite}: Schaubild fehlt")
        pruefe(page.get_by_role("button", name="Fläche wachsen lassen").count() == 0, f"{breite}: Fläche schon vor dem Rechnen sichtbar")

        # Handy: Bild zeigt sich kurz und klappt zu; Eingabe direkt unter der Aufgabe; Erklärung hinter ⓘ
        if breite < 840:
            page.wait_for_timeout(1800)
            pruefe(page.locator('.it-bild[data-zu="ja"]').count() == 1, f"{breite}: Bild klappt nicht von selbst zu")
            auf_y = page.locator(".it-aufgabe").bounding_box(); s1 = page.locator(".it-schritt").first.bounding_box()
            pruefe(s1["y"] - (auf_y["y"] + auf_y["height"]) < 40, f"{breite}: Schritt 1 steht nicht direkt unter der Aufgabe")
            frage = page.locator(".it-schritt").first.locator(".it-frage")
            pruefe(not frage.is_visible(), f"{breite}: Erklärung sichtbar ohne ⓘ")
            page.locator(".it-schritt").first.locator(".it-info").click(); page.wait_for_timeout(150)
            pruefe(frage.is_visible(), f"{breite}: ⓘ zeigt die Erklärung nicht")
            page.locator(".it-graphknopf").click(); page.wait_for_timeout(600)
            pruefe(page.locator(".ib-buehne svg").is_visible() and page.locator('.it-bild[data-zu="ja"]').count() == 0, f"{breite}: „Graph“ klappt das Bild nicht auf")
            page.screenshot(path=f"{AUS}/handy-graph-auf-{breite}.png")
            page.locator(".it-graphknopf").click(); page.wait_for_timeout(600)
            pruefe(page.locator('.it-bild[data-zu="ja"]').count() == 1, f"{breite}: „Graph“ klappt das Bild nicht zu")
            page.screenshot(path=f"{AUS}/handy-kompakt-{breite}.png")
        else:
            pruefe(page.locator(".it-graphknopf").is_hidden(), f"{breite}: Graph-Knopf am Desktop sichtbar")

        # Training komplett durchgehen
        for _ in range(8):
            aktiv = page.locator('.it-schritt[data-zustand="aktiv"]')
            if not aktiv.count(): break
            schritt_durch(page, aktiv.first)
        pruefe(page.locator(".it-ergebnis").count() == 1, f"{breite}: Ergebnis nach dem Training fehlt")
        pruefe(page.locator("button", has_text="Fläche wachsen lassen").count() == 1, f"{breite}: „Fläche wachsen lassen“ fehlt nach dem Integral")
        page.wait_for_timeout(2900)
        page.screenshot(path=f"{AUS}/training-{breite}.png", full_page=True)
        if breite >= 840:
            l = page.locator(".it-weg").bounding_box(); r = page.locator(".it-bild").bounding_box()
            pruefe(l["x"] + l["width"] <= r["x"] + 1, f"{breite}: Rechenweg nicht links vom Bild")
        page.get_by_role("button", name="Neue Aufgabe", exact=True).last.click(); page.wait_for_timeout(500)
        pruefe(page.locator('.it-schritt[data-zustand="aktiv"]').count() == 1, f"{breite}: neue Aufgabe beginnt nicht bei Schritt 1")

        # Automatik: alle Typen
        page.get_by_role("button", name="Rechnen", exact=True).click(); page.wait_for_timeout(300)
        if breite < 840:
            page.locator(".it-graphknopf").click(); page.wait_for_timeout(600)
        for typ in NAMEN:
            waehle(page, typ)
            if typ != "bestand":
                pruefe(page.locator(".it-ergebnis").count() == 1, f"{breite}/{typ}: Automatik zeigt kein Ergebnis")
                pruefe(page.locator('.it-schritt[data-zustand="fertig"]').count() >= 2, f"{breite}/{typ}: Rechenweg fehlt")
                pruefe(page.locator(".it-rechnung").count() >= 2, f"{breite}/{typ}: Rechenzeilen fehlen")
            for stufe_nr in range(1, 4):
                if typ == "bestand": break
                page.get_by_role("button", name="Stufe wählen").click(); page.wait_for_timeout(200)
                page.get_by_role("option", name=f"Stufe {stufe_nr} ·", exact=False).first.click(); page.wait_for_timeout(400)
                pruefe(page.locator(".it-ergebnis").count() == 1, f"{breite}/{typ}/Stufe {stufe_nr}: kein Ergebnis")
            if typ in ("bestimmt", "flaeche", "zwei"):
                page.get_by_role("button", name="8", exact=True).click(); page.wait_for_timeout(250)
                pruefe(page.locator(".ib-info").count() >= 1, f"{breite}/{typ}: Streifensumme fehlt")
            if typ == "zwei":
                page.get_by_label("g auf die x-Achse ziehen").fill("1"); page.wait_for_timeout(250)
            page.screenshot(path=f"{AUS}/auto-{typ}-{breite}.png", full_page=True)
            pruefe(breit() <= breite, f"{breite}/{typ}: Überbreite {breit()}")

        # Würfel: neue Aufgabe ohne Springen
        waehle(page, "bestimmt")
        page.evaluate("window.scrollTo(0, 120)"); page.wait_for_timeout(150)
        vor = page.evaluate("window.scrollY")
        page.get_by_role("button", name="Neue Aufgabe würfeln").click(); page.wait_for_timeout(400)
        pruefe(abs(page.evaluate("window.scrollY") - vor) < 4, f"{breite}: Würfel springt")

        # Eigene Funktion
        page.get_by_role("button", name="Stufe wählen").click(); page.wait_for_timeout(200)
        page.get_by_role("option", name="Eigene Funktion").click(); page.wait_for_timeout(300)
        page.get_by_role("button", name="Lieber selbst tippen").first.click(); page.wait_for_timeout(150)
        page.locator(".it-karte input").first.fill("x^2-4")
        page.get_by_label("Grenze a").fill("-1"); page.get_by_label("Grenze b").fill("2")
        page.get_by_role("button", name="Übernehmen").click(); page.wait_for_timeout(500)
        pruefe("−9" in page.locator(".it-ergebnis").inner_text().replace("-", "−"), f"{breite}: eigene Funktion ∫₋₁² (x² − 4) dx ≠ −9")

        pruefe(not konsole, f"{breite}: Konsolenfehler {konsole[:3]}")
        ctx.close()
    b.close()

print("OK" if not fehler else f"{len(fehler)} Fehler")
raise SystemExit(1 if fehler else 0)
