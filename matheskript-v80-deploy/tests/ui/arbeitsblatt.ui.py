"""Browser-Test „Lehrer-Arbeitsblatt-Generator“ (/lehrkraefte, /lehrkraefte/arbeitsblatt).
Je Breite (360, 390, 1280):
  · Lehrkräfte-Seite: Überschrift, Knopf „Arbeitsblatt erstellen“ öffnet den Generator
  · Generator: G9 → Klasse 7 → Kapitel Prozent ganz anhaken → Gruppe A und B → Blatt erstellen
  · Vorschau: 10 Aufgaben je Gruppe, Gruppe B hat andere Zahlen, Lösungen-Reiter, „↻ Neu“ tauscht eine Aufgabe
  · „Nur Ergebnisse“ + „Kompakt“ wirken; nirgends ein Karo-Raster
  · PDF-Download: Datei kommt, ist ein PDF (bei 1280 px als Bild gespeichert zum Ansehen)
  · QR-Link /trainieren?kapitel=…&teil=… öffnet das passende Training
  · keine Seitenfehler, keine Konsolenfehler, keine Überbreite
  npx vite preview --port 4173 &   →   BASE_URL=http://localhost:4173/ python3 tests/ui/arbeitsblatt.ui.py
"""
import os
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/").rstrip("/")
AUS = os.environ.get("SCREENS", "/tmp/arbeitsblatt")
os.makedirs(AUS, exist_ok=True)
fehler = []

def pruefe(bed, text):
    if not bed:
        fehler.append(text)
        print("FEHLT:", text)

def breit_ok(page, breite, wo):
    sw = page.evaluate("document.documentElement.scrollWidth")
    pruefe(sw <= breite, f"{wo}: Überbreite {sw} bei {breite}")

with sync_playwright() as p:
    browser = p.chromium.launch()
    for breite in (360, 390, 1280):
        ctx = browser.new_context(viewport={"width": breite, "height": 860}, accept_downloads=True, locale="de-DE")
        page = ctx.new_page()
        konsole = []
        page.on("console", lambda m: konsole.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: konsole.append(str(e)))
        wo = f"{breite}px"

        # Lehrkräfte-Seite
        page.goto(f"{BASE}/lehrkraefte")
        page.wait_for_selector("[data-seite=lehrkraefte]", timeout=15000)
        pruefe(page.get_by_text("Übungsblätter für Ihre Klasse").count() > 0, f"{wo}: Überschrift fehlt")
        breit_ok(page, breite, f"{wo} Lehrkräfte")
        page.screenshot(path=f"{AUS}/lehrkraefte-{breite}.png", full_page=True)
        page.click("[data-testid=lk-start]")
        page.wait_for_selector("[data-seite=arbeitsblatt]", timeout=15000)
        pruefe("/lehrkraefte/arbeitsblatt" in page.url, f"{wo}: Adresse {page.url}")

        # Generator
        page.click("[data-testid=ab-schulart-g9]")
        page.click("[data-testid=ab-klasse-7]")
        kap = page.locator("[data-testid=ab-kapitel]")
        pruefe(kap.count() >= 4, f"{wo}: nur {kap.count()} Kapitel in Klasse 7")
        texte = kap.all_inner_texts()
        i = next((k for k, t in enumerate(texte) if "Prozent" in t), 0)
        page.locator("[data-testid=ab-kapitel-alle]").nth(i).click()
        kap.nth(i).click()
        pruefe(page.locator("[data-testid=ab-unterthema][aria-pressed=true]").count() >= 4, f"{wo}: Unterthemen nicht angehakt")
        page.click("[data-testid=ab-gruppen-2]")
        breit_ok(page, breite, f"{wo} Einstellungen")
        page.click("[data-testid=ab-erstellen]")
        page.wait_for_selector("[data-testid=ab-vorschau]")
        auf = page.locator("[data-testid=ab-vorschau] [data-pdf-block] >> text=/./")
        n = page.locator("[data-testid=ab-tauschen]").count()
        pruefe(n == 10, f"{wo}: {n} Aufgaben in Gruppe A statt 10")
        a_text = page.locator("[data-testid=ab-vorschau]").inner_text()
        page.click("[data-testid=ab-tab-aufgaben-1]")
        b_text = page.locator("[data-testid=ab-vorschau]").inner_text()
        pruefe("Gruppe B" in b_text and a_text != b_text, f"{wo}: Gruppe B fehlt oder gleich")
        page.click("[data-testid=ab-tab-aufgaben-0]")
        erste = page.locator("[data-testid=ab-vorschau] [data-pdf-block]").nth(2).inner_text()
        page.locator("[data-testid=ab-tauschen]").first.click()
        pruefe(page.locator("[data-testid=ab-vorschau] [data-pdf-block]").nth(2).inner_text() != erste, f"{wo}: Tauschen ändert nichts")
        page.click("[data-testid=ab-tab-loesungen]")
        l = page.locator("[data-testid=ab-vorschau]").inner_text()
        pruefe(l.lower().count("ergebnis") >= 20, f"{wo}: Lösungen unvollständig ({l.lower().count('ergebnis')})")
        breit_ok(page, breite, f"{wo} Vorschau")
        page.screenshot(path=f"{AUS}/generator-{breite}.png", full_page=True)
        # kein Karo-Raster irgendwo (Hintergrundbilder mit Gitter)
        gitter = page.evaluate("""[...document.querySelectorAll('*')].filter(e => /linear-gradient\\([^)]*(90deg|0deg)[^)]*\\)\\s*,\\s*linear-gradient/.test(getComputedStyle(e).backgroundImage)).length""")
        pruefe(gitter == 0, f"{wo}: Karo-Raster gefunden ({gitter})")

        if breite == 1280:
            with page.expect_download(timeout=60000) as dl:
                page.click("[data-testid=ab-pdf]")
            d = dl.value
            ziel = f"{AUS}/blatt.pdf"
            d.save_as(ziel)
            kopf = open(ziel, "rb").read(5)
            pruefe(kopf == b"%PDF-", f"{wo}: Download ist kein PDF")
            pruefe(os.path.getsize(ziel) > 30000, f"{wo}: PDF zu klein")
            # Nur Ergebnisse + kompakt
            page.click("[data-testid=ab-nur-ergebnisse]")
            page.click("[data-testid=ab-kompakt]")
            page.click("[data-testid=ab-tab-loesungen]")
            pruefe("Platz zum Rechnen" not in page.locator("[data-testid=ab-vorschau]").inner_text(), f"{wo}: Kompakt zeigt Rechenraum")
            with page.expect_download(timeout=60000) as dl2:
                page.click("[data-testid=ab-pdf]")
            dl2.value.save_as(f"{AUS}/blatt-kompakt.pdf")

        # QR-Ziel
        page.goto(f"{BASE}/trainieren?kapitel=quad&teil=quad.4&schulart=g9&box=9&ref=482913")
        page.wait_for_timeout(1500)
        pruefe(page.get_by_text("pq- und abc-Formel").count() > 0, f"{wo}: QR-Ziel zeigt nicht das Unterthema")
        pruefe("kapitel=" not in page.url and "/trainieren" in page.url, f"{wo}: Adresse nach QR {page.url}")
        pruefe(page.evaluate("localStorage.getItem('mm-werber')") is not None, f"{wo}: Ref-Code aus dem QR nicht gemerkt")

        pruefe(not konsole, f"{wo}: Konsole: {konsole[:3]}")
        ctx.close()
    browser.close()

print("OK" if not fehler else f"{len(fehler)} Fehler")
raise SystemExit(1 if fehler else 0)
