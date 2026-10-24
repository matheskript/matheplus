"""Browser-Test Integraltrainer (/integrale, src/funcIntegralTrainer.jsx):
- Menü: alle sechs Aufgabentypen wählbar, Modus-Schalter Auto | Üben | Lernen (Lernen vorgewählt, Satz darunter),
  Auto zeigt den ganzen Rechenweg und das Ergebnis.
- Üben (bestimmtes Integral, Stufe 1): je Schritt goldenes Zielfeld + 2–4 goldene Karten; falsche Karte → rot + Hinweis,
  richtige → Rechnung erscheint, nächster Schritt; Bild zeigt die Fläche erst nach dem Integral-Schritt;
  Abschluss „3 von 4 Schritten auf Anhieb“, „Jetzt selbst rechnen“ → Lernen mit derselben Aufgabe.
- Lernen: Schritt für Schritt – falsche Eingabe → Hinweis → „Lösung zeigen“ → nächster Schritt; am Ende „Neue Aufgabe“.
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
        page.evaluate("localStorage.clear(); localStorage.setItem('mm-start-app','1'); localStorage.setItem('mm-onboarding-v1', JSON.stringify({uebersprungen:true}));")
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

        # Modus-Schalter: drei Modi, Lernen vorgewählt, Satz darunter
        seg = page.locator(".abl-seg").first
        for name in ("Auto", "Üben", "Lernen"):
            pruefe(seg.get_by_role("button", name=name, exact=True).count() == 1, f"{breite}: Modus {name} fehlt")
        pruefe(seg.get_by_role("button", name="Lernen", exact=True).get_attribute("aria-pressed") == "true", f"{breite}: Lernen nicht vorgewählt")
        pruefe("selbst" in page.locator("[data-integral-modus-text]").inner_text(), f"{breite}: Modus-Satz fehlt")
        pruefe(page.locator("[data-integral-modus-text]").is_visible(), f"{breite}: Modus-Satz unsichtbar")
        pruefe(breit() <= breite, f"{breite}: Überbreite mit drei Modi {breit()}")

        # Üben: bestimmtes Integral, Stufe 1 – vier Wahl-Schritte (F, F(b), F(a), Integral), im ersten ein Fehlklick
        aufgabe_vorher = page.locator(".it-formel").inner_text()
        seg.get_by_role("button", name="Üben", exact=True).click(); page.wait_for_timeout(400)
        pruefe("richtige Zeile" in page.locator("[data-integral-modus-text]").inner_text(), f"{breite}: Modus-Satz Üben fehlt")
        pruefe(page.locator(".it-formel").inner_text() == aufgabe_vorher, f"{breite}: Üben wechselt die Aufgabe")
        pruefe(page.locator("[data-integral-ueben-weg]").count() == 1, f"{breite}: Üben-Weg fehlt")
        n_opt = page.locator("[data-ueben-wahl] .uw-option").count()
        pruefe(2 <= n_opt <= 4, f"{breite}: Üben mit {n_opt} Karten")
        pruefe(page.locator("[data-ueben-wahl] [data-ueben-option='richtig']").count() == 1, f"{breite}: nicht genau eine richtige Karte")
        pruefe(page.locator("[data-ueben-ziel]").count() == 1, f"{breite}: goldenes Zielfeld fehlt")
        ziel_rand = page.locator("[data-ueben-ziel]").evaluate("e => getComputedStyle(e).borderTopColor")
        pruefe(ziel_rand.replace(" ", "") == "rgb(237,187,0)", f"{breite}: Zielfeld nicht gold ({ziel_rand})")
        rand = page.locator("[data-ueben-wahl] .uw-option").first.evaluate("e => getComputedStyle(e).borderTopColor")
        pruefe(rand.replace(" ", "") == "rgb(237,187,0)", f"{breite}: Karte ohne goldenen Rand ({rand})")
        pruefe("schritt 1 von 4" in page.locator(".uw-frage").inner_text().lower(), f"{breite}: Schrittzähler fehlt ({page.locator('.uw-frage').inner_text()!r})")
        pruefe(page.locator('.it-schritt[data-zustand="aktiv"]').count() == 1 and page.locator('.it-schritt[data-zustand="fertig"]').count() == 0, f"{breite}: Üben beginnt nicht bei Schritt 1")
        pruefe(page.locator(".it-schritt input").count() == 0 and page.locator(".it-schritt .wk-feld").count() == 0, f"{breite}: Eingabefeld im Üben sichtbar")
        page.locator('[data-ueben-option="falsch"]').first.click(); page.wait_for_timeout(300)
        pruefe(page.locator("[data-ueben-hinweis]").count() == 1, f"{breite}: kein Hinweis nach falscher Karte")
        pruefe(page.locator('.uw-option[data-status="falsch"]').count() == 1, f"{breite}: falsche Karte nicht rot markiert")
        pruefe(page.locator('.it-schritt[data-zustand="fertig"]').count() == 0, f"{breite}: falsche Karte wurde eingesetzt")
        page.screenshot(path=f"{AUS}/ueben-falsch-{breite}.png", full_page=True)
        for schritt in range(4):
            if schritt == 2:
                page.screenshot(path=f"{AUS}/ueben-mitte-{breite}.png", full_page=True)
                pruefe(page.locator(".it-rechnung").count() >= 2, f"{breite}: erledigte Üben-Schritte zeigen ihre Rechnung nicht")
                pruefe(page.get_by_role("button", name="Fläche wachsen lassen").count() == 0, f"{breite}: Fläche im Bild vor dem Integral-Schritt")
            pruefe(page.locator('[data-ueben-option="richtig"]').count() == 1, f"{breite}: Schritt {schritt + 1} ohne richtige Karte")
            page.locator('[data-ueben-option="richtig"]').click(); page.wait_for_timeout(300)
        pruefe(page.locator("[data-ueben-fertig]").count() == 1, f"{breite}: Üben ohne Abschluss")
        fertig_text = page.locator("[data-ueben-fertig]").inner_text()
        pruefe("3 von 4" in fertig_text, f"{breite}: Bilanz falsch ({fertig_text[:80]!r})")
        pruefe(page.locator(".it-ergebnis .it-ergebnis-wert").count() == 1, f"{breite}: Ergebnis im Üben-Abschluss fehlt")
        pruefe(page.locator('.it-schritt[data-zustand="fertig"]').count() == 4, f"{breite}: nicht alle Üben-Schritte erledigt")
        pruefe(page.locator("button", has_text="Fläche wachsen lassen").count() == 1, f"{breite}: Fläche nach dem Üben nicht im Bild")
        page.wait_for_timeout(600)
        page.screenshot(path=f"{AUS}/ueben-fertig-{breite}.png", full_page=True)
        pruefe(breit() <= breite, f"{breite}: Überbreite im Üben {breit()}")
        page.get_by_role("button", name="Jetzt selbst rechnen").click(); page.wait_for_timeout(400)
        pruefe(seg.get_by_role("button", name="Lernen", exact=True).get_attribute("aria-pressed") == "true", f"{breite}: nach Üben nicht in Lernen")
        pruefe(page.locator(".it-formel").inner_text() == aufgabe_vorher, f"{breite}: „Jetzt selbst rechnen“ wechselt die Aufgabe")
        pruefe(page.locator('.it-schritt[data-zustand="aktiv"]').count() == 1 and page.locator('.it-schritt[data-zustand="fertig"]').count() == 0, f"{breite}: Lernen beginnt nach Üben nicht bei Schritt 1")
        pruefe(page.locator("[data-ueben-wahl]").count() == 0, f"{breite}: Karten im Lernen sichtbar")
        pruefe(page.get_by_role("button", name="Fläche wachsen lassen").count() == 0, f"{breite}: Bild zeigt im Lernen schon die Fläche")

        # Lernen (dieselbe Aufgabe) komplett durchgehen
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

        # Auto: alle Typen
        page.get_by_role("button", name="Auto", exact=True).click(); page.wait_for_timeout(300)
        pruefe("rechnet dir" in page.locator("[data-integral-modus-text]").inner_text(), f"{breite}: Modus-Satz Auto fehlt")
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
