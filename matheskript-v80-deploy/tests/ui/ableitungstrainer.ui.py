"""Browser-Test Ableitungstrainer (/ableitungstrainer, src/func13.jsx + src/funcRegelwerk.jsx):
- Modus-Schalter Auto | Üben | Lernen (Lernen = früher Trainieren, Auto = früher Rechnen), Satz zum Modus darunter.
- Üben in der Regelwerkstatt (Produktregel): drei Schritte u′ → v′ → f′, je 2–4 goldene Karten, goldenes Zielfeld;
  falsche Karte → Hinweis, Karte rot; richtige → Feld wird gefüllt (grün), nächster Schritt; am Ende Musterlösung,
  „x von 3 Schritten auf Anhieb“ und „Jetzt selbst rechnen“ → Lernen mit derselben Aufgabe (Felder leer).
- Kettenregel: vier Schritte (u′, u′(v(x)), v′, f′).
- Eigene Funktion x²: Üben mit drei Schritten f′, f″, f‴; Auto zeigt alle drei Ableitungen; Lernen tippt.
- Auto in der Werkstatt: Rechnung steht sofort da.
- 360/390/1280 px: keine Überbreite, keine Fehler in der Konsole.
  npx vite build && npx vite preview --port 4383 &   →   python3 tests/ui/ableitungstrainer.ui.py
"""
import os
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4383/")
AUS = os.environ.get("SCREENS", "/tmp/ableitungstrainer")
os.makedirs(AUS, exist_ok=True)
fehler = []
def pruefe(bed, text):
    if not bed:
        fehler.append(text); print("FEHLT:", text)

def modus(page, name):
    page.locator(".abl-seg").first.get_by_role("button", name=name, exact=True).click(); page.wait_for_timeout(300)

def regel(page, name, breite):
    if breite < 840:
        # Einstellungs-Pille öffnen, dann den Chip wählen
        pille = page.locator("[data-einstellungen-pille]").first
        if pille.count() and pille.get_attribute("aria-expanded") != "true":
            pille.click(); page.wait_for_timeout(250)
    page.locator(".abl-chip").get_by_text(name, exact=True).first.click(); page.wait_for_timeout(350)
    if breite < 840:
        pille = page.locator("[data-einstellungen-pille]").first
        if pille.count() and pille.get_attribute("aria-expanded") == "true":
            pille.click(); page.wait_for_timeout(250)

def ueben_durchlaufen(page, breite, erwartet, wo, mit_fehlklick=True):
    """Alle Schritte des Üben-Wegs klicken, beim ersten Schritt zuerst eine falsche Karte."""
    schritte = 0
    for _ in range(12):
        if page.locator("[data-ueben-fertig]").count():
            break
        wahl = page.locator("[data-ueben-wahl]")
        pruefe(wahl.count() == 1, f"{wo}: nicht genau eine Wahl ({wahl.count()})")
        if wahl.count() != 1:
            break
        n_opt = wahl.locator(".uw-option").count()
        pruefe(2 <= n_opt <= 4, f"{wo} Schritt {schritte + 1}: {n_opt} Optionen")
        pruefe(wahl.locator("[data-ueben-option='richtig']").count() == 1, f"{wo} Schritt {schritte + 1}: nicht genau eine richtige Option")
        pruefe(page.locator("[data-ueben-ziel]").count() == 1, f"{wo} Schritt {schritte + 1}: goldenes Zielfeld fehlt ({page.locator('[data-ueben-ziel]').count()})")
        if schritte == 0 and mit_fehlklick and wahl.locator("[data-ueben-option='falsch']").count():
            wahl.locator("[data-ueben-option='falsch']").first.click(); page.wait_for_timeout(250)
            pruefe(page.locator("[data-ueben-hinweis]").count() == 1, f"{wo}: kein Hinweis nach falscher Wahl")
            pruefe(page.locator('.uw-option[data-status="falsch"]').count() == 1, f"{wo}: falsche Karte nicht rot")
            pruefe(page.locator("[data-ueben-wahl]").count() == 1, f"{wo}: Wahl nach Fehlklick verschwunden")
            page.screenshot(path=f"{AUS}/{breite}-{wo}-falsch.png", full_page=True)
        if schritte == 1:
            page.screenshot(path=f"{AUS}/{breite}-{wo}-mitte.png", full_page=True)
        page.locator("[data-ueben-option='richtig']").first.click(); page.wait_for_timeout(300)
        schritte += 1
    pruefe(schritte == erwartet, f"{wo}: {schritte} statt {erwartet} Schritte")
    pruefe(page.locator("[data-ueben-fertig]").count() == 1, f"{wo}: Üben ohne Abschluss")
    return schritte

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
        page.goto(BASE + "ableitungstrainer"); page.wait_for_timeout(1500)
        breit = lambda: page.evaluate("document.documentElement.scrollWidth")

        # Modus-Schalter: drei Modi, Lernen vorgewählt, Satz darunter
        seg = page.locator(".abl-seg").first
        for name in ("Auto", "Üben", "Lernen"):
            pruefe(seg.get_by_role("button", name=name, exact=True).count() == 1, f"{breite}: Modus {name} fehlt")
        pruefe(seg.get_by_role("button", name="Lernen", exact=True).get_attribute("aria-pressed") == "true", f"{breite}: Lernen nicht vorgewählt")
        pruefe(page.locator("[data-abl-modus-text]").count() == 1 and "selbst" in page.locator("[data-abl-modus-text]").inner_text(), f"{breite}: Modus-Satz fehlt")
        pruefe(seg.get_by_role("button", name="Rechnen", exact=True).count() == 0 and seg.get_by_role("button", name="Trainieren", exact=True).count() == 0, f"{breite}: alte Modusnamen noch da")
        if breite == 1280:
            l = page.locator(".abl-spalte-l").bounding_box(); r = page.locator(".abl-spalte-r").bounding_box()
            pruefe(l and r and l["x"] + l["width"] <= r["x"] + 1, "Desktop: Einstellungen nicht links neben der Aufgabe")

        # Lernen (Standard): Felder u′, v′ sind antippbar, keine Üben-Karten
        pruefe(page.locator("[data-ueben-wahl]").count() == 0, f"{breite}: Üben-Karten in Lernen")
        pruefe(page.locator('.wk-feld[role="button"]').count() >= 2, f"{breite}: Lernen ohne antippbare Felder")

        # Üben, Produktregel: u′ → v′ → f′
        modus(page, "Üben")
        pruefe("richtige Zeile" in page.locator("[data-abl-modus-text]").inner_text(), f"{breite}: Modus-Satz Üben fehlt")
        pruefe(page.locator("[data-werkstatt-ueben-weg]").count() == 1, f"{breite}: Üben-Weg der Werkstatt fehlt")
        rand = page.locator("[data-ueben-wahl] .uw-option").first.evaluate("e => getComputedStyle(e).borderTopColor")
        pruefe("237, 187, 0" in rand, f"{breite}: Karten nicht gold ({rand})")
        pruefe(page.locator('.wk-feld[role="button"]').count() == 0, f"{breite}: in Üben noch antippbare Felder")
        page.screenshot(path=f"{AUS}/{breite}-1-ueben-start.png", full_page=True)
        ueben_durchlaufen(page, breite, 3, "produkt")
        text = page.locator("[data-ueben-fertig]").inner_text()
        pruefe("von 3 Schritten" in text or "Alle 3 Schritte" in text, f"{breite}: Bilanz fehlt ({text[:60]})")
        pruefe(page.locator('.wk-feld[data-status="richtig"]').count() >= 2, f"{breite}: u′/v′ nach dem Üben nicht grün")
        pruefe(page.locator(".wk-rechnung").count() >= 1, f"{breite}: Musterlösung nach dem Üben fehlt")
        pruefe(breit() <= breite, f"{breite}: Überbreite Üben fertig {breit()}")
        page.screenshot(path=f"{AUS}/{breite}-2-ueben-fertig.png", full_page=True)

        # „Jetzt selbst rechnen“ → Lernen mit derselben Aufgabe (u und v stehen, Felder leer)
        f_vorher = page.locator(".wk-karte .wk-feld").first.inner_text()
        page.locator("[data-ueben-fertig]").get_by_role("button", name="Jetzt selbst rechnen").click(); page.wait_for_timeout(400)
        pruefe(seg.get_by_role("button", name="Lernen", exact=True).get_attribute("aria-pressed") == "true", f"{breite}: nach „Jetzt selbst rechnen“ nicht in Lernen")
        pruefe(page.locator("[data-ueben-wahl]").count() == 0 and page.locator("[data-ueben-fertig]").count() == 0, f"{breite}: Üben-Reste in Lernen")
        pruefe(page.locator('.wk-feld[role="button"]').count() >= 2, f"{breite}: Lernen nach Üben ohne Felder")
        pruefe(page.locator(".wk-karte .wk-feld").first.inner_text() == f_vorher, f"{breite}: Aufgabe hat sich beim Wechsel geändert")

        # Kettenregel: vier Schritte
        regel(page, "Kettenregel", breite)
        modus(page, "Üben")
        pruefe(page.locator("[data-ueben-wahl]").count() == 1, f"{breite}: Kette ohne Wahl")
        ueben_durchlaufen(page, breite, 4, "kette", mit_fehlklick=False)
        page.screenshot(path=f"{AUS}/{breite}-3-kette-fertig.png", full_page=True)
        pruefe(breit() <= breite, f"{breite}: Überbreite Kette {breit()}")

        # Auto: Musterlösung sofort
        modus(page, "Auto")
        pruefe(page.locator(".wk-rechnung").count() >= 1 and page.locator("[data-ueben-wahl]").count() == 0, f"{breite}: Auto ohne Musterlösung")

        # Eigene Funktion x²: Üben mit f′, f″, f‴
        regel(page, "Eigene Funktion", breite)
        page.locator('.adv-taste[aria-label="x²"]').first.click(); page.wait_for_timeout(150)
        page.get_by_role("button", name="Übernehmen").click(); page.wait_for_timeout(400)
        modus(page, "Üben")
        pruefe(page.locator("[data-abl-ueben-weg]").count() == 1, f"{breite}: Üben-Weg der eigenen Funktion fehlt")
        ueben_durchlaufen(page, breite, 3, "eigen")
        pruefe(page.locator('[data-abl-ueben-weg] [data-abl-zeile]').count() == 3, f"{breite}: nicht drei Ableitungszeilen")
        weg = page.locator("[data-abl-ueben-weg]").inner_text().replace(" ", "")
        pruefe("2x" in weg and "f‴(x)=" in weg, f"{breite}: Ableitungen fehlen im Weg")
        page.screenshot(path=f"{AUS}/{breite}-4-eigen-fertig.png", full_page=True)
        page.locator("[data-ueben-fertig]").get_by_role("button", name="Jetzt selbst rechnen").click(); page.wait_for_timeout(300)
        pruefe(seg.get_by_role("button", name="Lernen", exact=True).get_attribute("aria-pressed") == "true", f"{breite}: eigene Funktion nicht in Lernen")
        pruefe(page.locator("[data-abl-ueben-weg]").count() == 0, f"{breite}: Üben-Weg bleibt in Lernen")
        modus(page, "Auto")
        pruefe(page.locator(".abl-auto").count() == 1 and "f‴" in page.locator(".abl-auto").inner_text(), f"{breite}: Auto eigene Funktion ohne f‴")

        pruefe(breit() <= breite, f"{breite}: Überbreite {breit()}")
        pruefe(not konsole, f"{breite}: Konsolenfehler {konsole[:3]}")
        ctx.close()
    b.close()

print("FEHLER:", len(fehler))
for f in fehler: print(" -", f)
raise SystemExit(1 if fehler else 0)
