"""Browser-Test Differenzenquotient (/differenzenquotient, src/funcDiffqTrainer.jsx):
- Band statt Seitenkopf, Vorbereitung „f(x+h) = …“, Vorlage-Zeile, interaktiver Bruch mit zwei Feldern (f(x+h), f(x)) über h.
- Modus-Schalter Auto | Üben | Lernen (Lernen = früher Trainieren, Auto = früher Rechnen).
- Üben (x²): je Schritt zwei Zeilen zur Wahl; falsche Karte → Hinweis, Karte rot; richtige → Zeile wird eingesetzt,
  nächster Schritt; am Ende „x von 7 Schritten auf Anhieb“ und „Jetzt selbst rechnen“ → Lernen mit derselben Funktion.
- Lernen: Vorbereitung (f(x+h) ausrechnen, falsch → Hinweis, richtig → Bruch öffnet sich mit vorbelegtem erstem Feld),
  Einsetzen (beide Felder, OK prüft), dann „Zähler umformen“,
  „h kürzen“, „Grenzwert h → 0“ – jede neue Zeile übernimmt die Zeile darüber; am Ende „Neue Funktion“.
- „An einer Stelle“: x₀ sichtbar, Terme nur mit h, Ergebnis eine Zahl. „Lösung zeigen“ füllt die Zeile.
- Auto: Musterweg vom Einsetzen bis zum Grenzwert mit Schrittnamen.
- 360/390/1280 px: keine Überbreite, keine Fehler in der Konsole; Desktop: Einstellungen links, Rechnung rechts.
  npx vite build && npx vite preview --port 4371 &   →   python3 tests/ui/diffq.ui.py
"""
import os
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4371/")
AUS = os.environ.get("SCREENS", "/tmp/diffq")
os.makedirs(AUS, exist_ok=True)
fehler = []
def pruefe(bed, text):
    if not bed:
        fehler.append(text); print("FEHLT:", text)

def tippen(page, text):
    """Ins aktive Feld schreiben: Tastenfeld → „Lieber selbst tippen“ → Textfeld füllen → OK (= Prüfen)."""
    pop = page.locator(".wk-popup").last
    if pop.get_by_role("button", name="Lieber selbst tippen").count():
        pop.get_by_role("button", name="Lieber selbst tippen").click(); page.wait_for_timeout(150)
    inp = pop.locator("input").first
    inp.fill(""); inp.fill(text); page.wait_for_timeout(100)
    pop.get_by_role("button", name="OK", exact=True).click(); page.wait_for_timeout(350)

def feld_oeffnen(page, nr):
    page.locator('.dq-zeile[data-aktiv="true"] .dq-feld').nth(nr).click(); page.wait_for_timeout(250)

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
        page.goto(BASE + "differenzenquotient"); page.wait_for_timeout(1500)
        breit = lambda: page.evaluate("document.documentElement.scrollWidth")

        pruefe(page.locator(".dq-karte").count() == 1, f"{breite}: Aufgabenkarte fehlt")
        pruefe(page.locator('.dq-zeile[data-vorlage="true"]').count() == 1, f"{breite}: Vorlage-Zeile fehlt")
        pruefe(page.locator('.dq-zeile[data-aktiv="true"][data-art="fxh"] .dq-feld').count() == 1, f"{breite}: Vorbereitung f(x+h) fehlt")
        vb = page.locator('.dq-zeile[data-art="fxh"]').bounding_box(); vl = page.locator('.dq-zeile[data-vorlage="true"]').bounding_box()
        pruefe(vb and vl and vb["y"] < vl["y"], f"{breite}: Vorbereitung steht nicht über der Vorlage")
        pruefe(page.get_by_role("tab", name="Differenzenquotient").count() + page.get_by_text("h-Methode").count() >= 1, f"{breite}: Band ohne Reiter")
        if breite == 1280:
            l = page.locator(".dq-spalte-l").bounding_box(); r = page.locator(".dq-spalte-r").bounding_box()
            pruefe(l and r and l["x"] + l["width"] <= r["x"] + 1, "Desktop: Einstellungen nicht links neben der Rechnung")

        # Modus-Schalter: drei Modi, Lernen ist vorgewählt
        for name in ("Auto", "Üben", "Lernen"):
            pruefe(page.locator(".dq-seg").first.get_by_role("button", name=name, exact=True).count() == 1, f"{breite}: Modus {name} fehlt")
        pruefe(page.locator('.dq-seg').first.get_by_role("button", name="Lernen", exact=True).get_attribute("aria-pressed") == "true", f"{breite}: Lernen nicht vorgewählt")

        # Eigene Funktion x^2 – damit der Weg feststeht
        page.get_by_role("button", name="Eigene Funktion").click(); page.wait_for_timeout(300)
        # Tastenfeld der eigenen Funktion: Taste x²
        page.locator('.adv-taste[aria-label="x²"]').first.click(); page.wait_for_timeout(150)
        page.get_by_role("button", name="Übernehmen").click(); page.wait_for_timeout(400)
        pruefe(page.locator('[data-diffq-aufgabe="x^2"]').count() == 1, f"{breite}: eigene Funktion x^2 nicht übernommen")
        page.screenshot(path=f"{AUS}/{breite}-1-start.png", full_page=True)

        # Üben: sieben Schritte, je zwei Zeilen; im ersten Schritt erst die falsche, dann die richtige
        page.locator(".dq-seg").first.get_by_role("button", name="Üben", exact=True).click(); page.wait_for_timeout(300)
        pruefe("zwei Zeilen" in page.locator("[data-diffq-modus-text]").inner_text(), f"{breite}: Modus-Text Üben fehlt")
        pruefe(page.locator("[data-diffq-ueben] .dq-option").count() == 2, f"{breite}: Üben ohne zwei Optionen")
        pruefe("schritt 1 von 7" in page.locator(".dq-frage").inner_text().lower(), f"{breite}: Schrittzähler fehlt ({page.locator('.dq-frage').inner_text()!r})")
        page.locator('[data-diffq-option="falsch"]').click(); page.wait_for_timeout(250)
        pruefe(page.locator("[data-diffq-ueben-hinweis]").count() == 1, f"{breite}: kein Hinweis nach falscher Wahl")
        pruefe(page.locator('.dq-option[data-status="falsch"]').count() == 1, f"{breite}: falsche Karte nicht markiert")
        pruefe(page.locator('.dq-zeile[data-art="fxh"][data-fertig="true"]').count() == 0, f"{breite}: falsche Wahl wurde eingesetzt")
        page.screenshot(path=f"{AUS}/{breite}-0-ueben-falsch.png", full_page=True)
        for schritt in range(7):
            if schritt == 3:
                page.screenshot(path=f"{AUS}/{breite}-0-ueben-mitte.png", full_page=True)
            page.locator('[data-diffq-option="richtig"]').click(); page.wait_for_timeout(200)
        pruefe(page.locator("[data-diffq-ueben-fertig]").count() == 1, f"{breite}: Üben ohne Abschluss")
        fertig_text = page.locator("[data-diffq-ueben-fertig]").inner_text()
        pruefe("6 von 7" in fertig_text, f"{breite}: Bilanz falsch ({fertig_text[:80]!r})")
        pruefe(page.locator('[data-diffq-ueben-weg] .dq-zeile[data-fertig="true"]').count() == 7, f"{breite}: nicht alle Üben-Zeilen eingesetzt")
        weg = page.locator("[data-diffq-ueben-weg]").inner_text().replace(" ", "").replace("\n", "")
        pruefe("h(2x+h)" in weg and "2x+h" in weg, f"{breite}: Üben-Weg unvollständig")
        vb = page.locator('[data-diffq-ueben-weg] .dq-zeile[data-art="fxh"]').last.bounding_box(); vl = page.locator('[data-diffq-ueben-weg] .dq-zeile[data-vorlage="true"]').bounding_box()
        pruefe(vb and vl and vb["y"] < vl["y"], f"{breite}: Üben: Vorlage nicht unter der Vorbereitung")
        page.screenshot(path=f"{AUS}/{breite}-0-ueben-fertig.png", full_page=True)
        pruefe(breit() == breite, f"{breite}: Überbreite im Üben {breit()}")
        page.get_by_role("button", name="Jetzt selbst rechnen").click(); page.wait_for_timeout(300)
        pruefe(page.locator('.dq-seg').first.get_by_role("button", name="Lernen", exact=True).get_attribute("aria-pressed") == "true", f"{breite}: nach Üben nicht in Lernen")
        pruefe(page.locator('[data-diffq-aufgabe="x^2"]').count() == 1, f"{breite}: Lernen nicht mit derselben Funktion")

        # Vorbereitung: erst falsch (x^2+h^2), dann richtig → Bruch öffnet sich, erstes Feld vorbelegt
        feld_oeffnen(page, 0); tippen(page, "x^2+h^2")
        pruefe(page.locator(".dq-hinweis").count() >= 1, f"{breite}: kein Hinweis nach falscher Vorbereitung")
        pruefe("gemischte" in page.locator(".dq-hinweis").first.inner_text(), f"{breite}: Binomi-Hinweis fehlt")
        tippen(page, "x^2+2xh+h^2")
        pruefe(page.locator('.dq-zeile[data-art="fxh"][data-fertig="true"]').count() == 1, f"{breite}: Vorbereitung nicht als richtig erkannt")
        pruefe(page.locator('.dq-zeile[data-aktiv="true"][data-art="einsetzen"] .dq-feld').count() == 2, f"{breite}: Bruch nach Vorbereitung fehlt")
        vorbelegt = page.locator('.dq-zeile[data-aktiv="true"] .dq-feld').first.inner_text().replace(" ", "").replace("\n", "")
        pruefe("2xh" in vorbelegt, f"{breite}: erstes Feld nicht vorbelegt ({vorbelegt!r})")
        # Einsetzen: zweites Feld (Pop-up ist schon offen)
        tippen(page, "x^2")
        pruefe(page.locator("[data-diffq-weiter]").count() == 1, f"{breite}: nach richtigem Einsetzen keine Weiter-Knöpfe")
        page.screenshot(path=f"{AUS}/{breite}-2-eingesetzt.png", full_page=True)

        # Zähler umformen: neue Zeile übernimmt A − (B)
        page.get_by_role("button", name="Zähler umformen").click(); page.wait_for_timeout(300)
        pruefe(page.locator('.dq-zeile[data-aktiv="true"][data-art="bruch"]').count() == 1, f"{breite}: Bruch-Zeile fehlt")
        wert = page.locator(".wk-popup").last
        wert.get_by_role("button", name="Lieber selbst tippen").click(); page.wait_for_timeout(150)
        pruefe(wert.locator("input").first.input_value() == "x^2+2xh+h^2-x^2", f"{breite}: neue Zeile übernimmt nicht die Zeile darüber ({wert.locator('input').first.input_value()})")
        tippen(page, "2xh+h^2")
        pruefe(page.locator('.dq-zeile[data-art="bruch"][data-fertig="true"]').count() == 1, f"{breite}: Zusammenfassen nicht als richtig erkannt")
        page.get_by_role("button", name="h kürzen").click(); page.wait_for_timeout(300)
        tippen(page, "2xh+h^2")
        pruefe("Nenner h vergessen" in page.locator(".dq-hinweis").last.inner_text(), f"{breite}: Hinweis „Nenner vergessen“ fehlt")
        tippen(page, "2x+h")
        page.get_by_role("button", name="Grenzwert h → 0").click(); page.wait_for_timeout(300)
        tippen(page, "2x+h")
        pruefe("kein h" in page.locator(".dq-hinweis").last.inner_text(), f"{breite}: Hinweis „kein h mehr“ fehlt")
        page.get_by_role("button", name="Lösung zeigen").click(); page.wait_for_timeout(300)
        pruefe(page.locator("[data-diffq-fertig]").count() == 1, f"{breite}: Abschluss fehlt")
        page.get_by_role("button", name="Musterweg ansehen").click(); page.wait_for_timeout(300)
        pruefe(page.locator(".dq-schritt.rechts").count() >= 7, f"{breite}: Musterweg ohne Vorbereitung/Schrittnamen ({page.locator('.dq-schritt.rechts').count()})")
        page.screenshot(path=f"{AUS}/{breite}-3-fertig.png", full_page=True)
        pruefe(breit() == breite, f"{breite}: Überbreite {breit()}")

        # An einer Stelle: Felder tragen x₀, Terme nur mit h
        page.get_by_role("button", name="An einer Stelle").click(); page.wait_for_timeout(300)
        pruefe(page.locator(".dq-x0").count() == 1, f"{breite}: x₀-Stepper fehlt")
        x0 = page.locator(".dq-x0 b").inner_text().replace("−", "-")
        feld_oeffnen(page, 0); tippen(page, "(x+h)^2")
        pruefe("kein x" in page.locator(".dq-hinweis").first.inner_text(), f"{breite}: Hinweis „kein x“ fehlt")
        tippen(page, f"({x0}+h)^2")
        tippen(page, str(int(x0) ** 2))
        pruefe(page.locator("[data-diffq-weiter]").count() == 1, f"{breite}: Stelle: Einsetzen nicht erkannt")
        page.get_by_role("button", name="h kürzen").click(); page.wait_for_timeout(300)
        tippen(page, f"{2 * int(x0)}+h")
        page.get_by_role("button", name="Grenzwert h → 0").click(); page.wait_for_timeout(300)
        tippen(page, str(2 * int(x0)))
        pruefe(page.locator("[data-diffq-fertig]").count() == 1, f"{breite}: Stelle: Abschluss fehlt")
        page.screenshot(path=f"{AUS}/{breite}-4-stelle.png", full_page=True)

        # Auto: Musterweg mit Schritten
        page.get_by_role("button", name="Auto", exact=True).click(); page.wait_for_timeout(300)
        pruefe(page.locator('[data-diffq-muster] .dq-zeile[data-art="fxh"]').count() >= 1, f"{breite}: Auto ohne Vorbereitung")
        pruefe(page.locator("[data-diffq-muster] .dq-schritt.rechts").count() >= 5, f"{breite}: Auto ohne Musterweg")
        page.screenshot(path=f"{AUS}/{breite}-5-rechnen.png", full_page=True)
        pruefe(breit() == breite, f"{breite}: Überbreite {breit()}")
        pruefe(not konsole, f"{breite}: Konsole {konsole[:3]}")
        ctx.close()
    b.close()

print("FEHLER:" if fehler else "OK –", len(fehler), "Befunde")
for f in fehler: print(" -", f)
raise SystemExit(1 if fehler else 0)
