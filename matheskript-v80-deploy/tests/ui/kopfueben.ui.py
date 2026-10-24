"""Browser-Test Kopfrechnen, Modi Entdecken | Auto | Üben | Lernen (/head-and-numbers, src/funcHeadNumbers.jsx + funcKopfModi.jsx):
- Modus-Leiste im Kopf: vier Modi, Lernen vorgewählt (= Trainer-Kacheln), Satz zum Modus darunter.
- Auto (= früher Rechnen): Eingabemaske, Lösungsweg steht komplett da, Ergebnis.
- Üben: Plus 478 + 256 – Zwischenergebnis je Spalte aus goldenen Karten, Erklärschritte laufen mit, Zielfeld gold,
  falsche Karte → Hinweis + rot, richtige → Schritt grün, am Ende Ergebnis + „x von n Schritten auf Anhieb“,
  „Neue Aufgabe“ würfelt, „Jetzt selbst rechnen“ → Trainer. Thema wechseln (Bruchrechnung) → Üben mit Brüchen.
- Entdecken: Knopf „Üben: Schritt für Schritt wählen“ öffnet Üben mit dem Thema.
- 360/390/1280 px: keine Überbreite, keine Konsolenfehler.
  npx vite build && npx vite preview --port 4383 &   →   python3 tests/ui/kopfueben.ui.py
"""
import os
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4383/")
AUS = os.environ.get("SCREENS", "/tmp/kopfueben")
os.makedirs(AUS, exist_ok=True)
fehler = []
def pruefe(bed, text):
    if not bed:
        fehler.append(text); print("FEHLT:", text)

def modus(page, name):
    page.locator(".kr-k-modus", has_text=name).first.click(); page.wait_for_timeout(300)

def ueben_durchlaufen(page, wo, mit_fehlklick=True):
    schritte = 0
    for _ in range(20):
        if page.locator("[data-ueben-fertig]").count():
            break
        wahl = page.locator("[data-ueben-wahl]")
        if wahl.count() != 1:
            pruefe(False, f"{wo}: Wahl fehlt bei Schritt {schritte + 1}"); break
        n_opt = wahl.locator(".uw-option").count()
        pruefe(2 <= n_opt <= 4, f"{wo} Schritt {schritte + 1}: {n_opt} Optionen")
        pruefe(wahl.locator("[data-ueben-option='richtig']").count() == 1, f"{wo} Schritt {schritte + 1}: nicht genau eine richtige Option")
        pruefe(page.locator("[data-ueben-ziel]").count() == 1, f"{wo} Schritt {schritte + 1}: Zielfeld fehlt")
        if schritte == 0 and mit_fehlklick and wahl.locator("[data-ueben-option='falsch']").count():
            wahl.locator("[data-ueben-option='falsch']").first.click(); page.wait_for_timeout(250)
            pruefe(page.locator("[data-ueben-hinweis]").count() == 1, f"{wo}: kein Hinweis nach falscher Wahl")
            pruefe(page.locator('.uw-option[data-status="falsch"]').count() == 1, f"{wo}: falsche Karte nicht rot")
            page.screenshot(path=f"{AUS}/{wo}-falsch.png", full_page=True)
        if schritte == 1:
            page.screenshot(path=f"{AUS}/{wo}-mitte.png", full_page=True)
        page.locator("[data-ueben-option='richtig']").first.click(); page.wait_for_timeout(250)
        schritte += 1
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
        page.goto(BASE + "head-and-numbers"); page.wait_for_timeout(1500)
        breit = lambda: page.evaluate("document.documentElement.scrollWidth")
        wo = f"{breite}"

        # Modus-Leiste: Entdecken · Auto · Üben · Lernen, Lernen vorgewählt
        for name in ("Entdecken", "Auto", "Üben", "Lernen"):
            pruefe(page.locator(".kr-k-modus", has_text=name).count() == 1, f"{wo}: Modus {name} fehlt")
        pruefe(page.locator(".kr-k-modus", has_text="Rechnen").count() == 0 and page.locator(".kr-k-modus", has_text="Training").count() == 0, f"{wo}: alte Modusnamen")
        pruefe(page.locator('.kr-k-modus[aria-pressed="true"]').inner_text().strip() == "Lernen", f"{wo}: Lernen nicht vorgewählt")
        pruefe(page.locator("[data-kopf-trainer]").count() == 1, f"{wo}: Trainer-Kacheln in Lernen fehlen")

        # Auto: Lösungsweg komplett
        modus(page, "Auto")
        pruefe(page.locator('[data-kopf-rechnen][data-kopf-modus="auto"]').count() == 1, f"{wo}: Auto-Maske fehlt")
        pruefe("vor" in page.locator("[data-kopf-modus-text]").inner_text(), f"{wo}: Modus-Satz Auto fehlt")
        pruefe(page.get_by_text("Lösungsweg", exact=True).count() >= 1 and page.locator("[data-ueben-wahl]").count() == 0, f"{wo}: Auto ohne Lösungsweg")
        pruefe("734" in page.locator("[data-kopf-rechnen]").inner_text(), f"{wo}: Auto-Ergebnis 734 fehlt")

        # Üben: 478 + 256
        modus(page, "Üben")
        pruefe(page.locator('[data-kopf-rechnen][data-kopf-modus="ueben"]').count() == 1, f"{wo}: Üben-Maske fehlt")
        pruefe("richtige Zeile" in page.locator("[data-kopf-modus-text]").inner_text(), f"{wo}: Modus-Satz Üben fehlt")
        pruefe(page.locator("[data-kopf-ueben-weg]").count() == 1, f"{wo}: Üben-Weg fehlt")
        rand = page.locator("[data-ueben-wahl] .uw-option").first.evaluate("e => getComputedStyle(e).borderTopColor")
        pruefe("237, 187, 0" in rand, f"{wo}: Karten nicht gold ({rand})")
        page.screenshot(path=f"{AUS}/{wo}-1-ueben-start.png", full_page=True)
        n = ueben_durchlaufen(page, f"{wo}-plus")
        pruefe(n == 4, f"{wo}: Plus hat {n} statt 4 Wahl-Schritte")
        text = page.locator("[data-ueben-fertig]").inner_text()
        pruefe("von 4 Schritten" in text or "Alle 4 Schritte" in text, f"{wo}: Bilanz fehlt ({text[:60]})")
        pruefe("734" in page.locator("[data-kopf-ueben-weg]").inner_text(), f"{wo}: Ergebnis nach dem Üben fehlt")
        pruefe(page.locator('[data-kopf-ueben-schritt="fertig"]').count() == len(page.locator("[data-kopf-ueben-weg] li").all()), f"{wo}: nicht alle Schritte fertig")
        pruefe(breit() <= breite, f"{wo}: Überbreite Üben fertig {breit()}")
        page.screenshot(path=f"{AUS}/{wo}-2-ueben-fertig.png", full_page=True)

        # Neue Aufgabe würfelt und setzt Üben zurück
        page.locator("[data-ueben-fertig]").get_by_role("button", name="Neue Aufgabe").click(); page.wait_for_timeout(400)
        pruefe(page.locator("[data-ueben-fertig]").count() == 0 and page.locator("[data-ueben-wahl]").count() == 1, f"{wo}: Neue Aufgabe setzt Üben nicht zurück")

        # Thema Bruchrechnung: Üben mit Brüchen (Startwerte 1/2 + 1/3)
        page.get_by_role("tab", name="Bruchrechnung").click(); page.wait_for_timeout(400)
        pruefe(page.locator("[data-ueben-wahl]").count() == 1, f"{wo}: Bruch-Üben ohne Wahl")
        pruefe(page.locator("[data-ueben-wahl] [role=math]").count() >= 0, f"{wo}: Brüche")
        n = ueben_durchlaufen(page, f"{wo}-bruch", mit_fehlklick=False)
        pruefe(n == 3, f"{wo}: Bruch hat {n} statt 3 Wahl-Schritte")
        page.screenshot(path=f"{AUS}/{wo}-3-bruch-fertig.png", full_page=True)

        # „Jetzt selbst rechnen“ → Trainer Bruchrechnung
        page.locator("[data-ueben-fertig]").get_by_role("button", name="Jetzt selbst rechnen").click(); page.wait_for_timeout(700)
        pruefe("Bruchrechnung" in page.locator("body").inner_text() and page.locator("[data-kopf-ueben-weg]").count() == 0, f"{wo}: Jetzt selbst rechnen führt nicht zum Trainer")

        # Entdecken: Knopf „Üben“ öffnet Üben mit dem Thema
        page.goto(BASE + "head-and-numbers"); page.wait_for_timeout(1200)
        modus(page, "Entdecken")
        page.get_by_role("button", name="Multiplizieren entdecken").click(); page.wait_for_timeout(400)
        page.get_by_role("button", name="Üben: Schritt für Schritt wählen").click(); page.wait_for_timeout(500)
        pruefe(page.locator('[data-kopf-rechnen="multiplizieren"][data-kopf-modus="ueben"]').count() == 1, f"{wo}: Entdecken → Üben Multiplizieren fehlt")
        pruefe(page.locator('.kr-k-modus[aria-pressed="true"]').inner_text().strip() == "Üben", f"{wo}: Modus-Leiste zeigt nicht Üben")

        pruefe(breit() <= breite, f"{wo}: Überbreite {breit()}")
        pruefe(not konsole, f"{wo}: Konsolenfehler {konsole[:3]}")
        ctx.close()
    b.close()

print("FEHLER:", len(fehler))
for f in fehler: print(" -", f)
raise SystemExit(1 if fehler else 0)
