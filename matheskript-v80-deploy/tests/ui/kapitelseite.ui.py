"""Browser-Test Kapitelseite (/kapitel/<slug>) und die zwei Knöpfe im ☰-Menü (Klasse → Kapitel: „Kapitelseite öffnen“ | „Kapitel trainieren“).
  npx vite build && npx vite preview --port 4173 &   →   python3 tests/ui/kapitelseite.ui.py   (BILDER=/pfad für Screenshots)
"""
import os, json
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/").rstrip("/")
BILDER = os.environ.get("BILDER")
fehler = []
def pruefe(bed, text):
    if not bed:
        fehler.append(text); print("FEHLT:", text)

DEMO = {"nutzer": {"id": "demo-1", "email": "lena@example.de"}, "profil": {"id": "demo-1", "name": "Lena", "rolle": "schueler", "geschlecht": "w", "schulform": "G9", "klasse": 11}}

with sync_playwright() as p:
    b = p.chromium.launch()
    for breite in (360, 390, 1280):
        ctx = b.new_context(viewport={"width": breite, "height": 820}, locale="de-DE")
        page = ctx.new_page()
        konsole = []
        page.on("pageerror", lambda e: konsole.append(f"pageerror: {e}"))
        page.on("console", lambda m: konsole.append(m.text) if m.type == "error" and "supabase" not in m.text.lower() and "Failed to load resource" not in m.text else None)
        page.goto(BASE + "/")
        page.evaluate(f"localStorage.clear(); localStorage.setItem('mm-start-app','1'); localStorage.setItem('mm-onboarding-v1', JSON.stringify({{uebersprungen:true}})); localStorage.setItem('mm-demo-konto', {json.dumps(json.dumps(DEMO))})")
        page.goto(BASE + "/"); page.wait_for_timeout(1500)

        # ☰ → Klasse 11 (G9) → Kapitel I aufklappen → zwei Knöpfe nebeneinander
        page.locator("[data-hm-menue]").first.click(); page.wait_for_timeout(300)
        page.locator("[data-hm='klasse']").click(); page.wait_for_timeout(300)
        page.get_by_role("button", name="Ganzrationale Funktionen").first.click(); page.wait_for_timeout(300)
        seite = page.locator(".hm-kapitel-seite").first
        trai = page.locator(".hm-kapitel-knoepfe .hm-gold-knopf").first
        pruefe(seite.count() == 1 and trai.count() == 1, f"{breite}: zwei Knöpfe fehlen")
        a, c = seite.bounding_box(), trai.bounding_box()
        pruefe(a and c and a["x"] < c["x"] and abs(a["y"] - c["y"]) < 2, f"{breite}: Knöpfe nicht nebeneinander (links Kapitelseite)")
        pruefe(a and c and abs(a["width"] - c["width"]) < 2, f"{breite}: Knöpfe nicht je halb so breit")
        pruefe("Kapitelseite" in seite.inner_text() and "rainieren" in trai.inner_text(), f"{breite}: Beschriftung")
        pruefe(seite.evaluate("e => e.scrollWidth <= e.clientWidth + 1"), f"{breite}: Text im Knopf läuft über")
        if BILDER: page.screenshot(path=f"{BILDER}/menue-{breite}.png")
        seite.click(); page.wait_for_timeout(1500)
        pruefe(page.url.endswith("/kapitel/ganzrationale-funktionen"), f"{breite}: Adresse {page.url}")
        h1 = page.locator("h1").first.inner_text()
        pruefe("Ganzrationale Funktionen" in h1, f"{breite}: Titel {h1}")
        text = page.inner_text("body")
        for t in ("Klasse 11", "Kapitel I", "Am Ende des Kapitels kannst du", "Der Weg durchs Kapitel", "Das Wichtigste auf einen Blick",
                  "Dafür brauchst du sicher", "Werkzeuge und Hilfen", "Unser Kurs dazu", "Vor der Klassenarbeit", "Nächstes Kapitel"):
            pruefe(t.lower() in text.lower(), f"{breite}: „{t}“ fehlt")
        pruefe(page.evaluate("document.documentElement.scrollWidth <= window.innerWidth + 1"), f"{breite}: Überbreite")
        if BILDER: page.screenshot(path=f"{BILDER}/kapitel-{breite}.png", full_page=True)
        # Desktop ab 900 px: Weg links, Werkzeuge rechts nebeneinander
        links = page.get_by_role("heading", name="Der Weg durchs Kapitel").bounding_box()
        rechts = page.get_by_role("heading", name="Werkzeuge und Hilfen").bounding_box()
        if breite >= 900: pruefe(rechts["x"] > links["x"] + 200, f"{breite}: keine zwei Spalten")
        else: pruefe(abs(rechts["x"] - links["x"]) < 2, f"{breite}: am Handy nicht einspaltig")
        # Ins Mathe-Training aufnehmen: bleibt auf der Seite, Knopf bestätigt
        page.get_by_role("button", name="Ins Mathe-Training aufnehmen").click(); page.wait_for_timeout(400)
        pruefe("/kapitel/" in page.url and "Im Mathe-Training" in page.inner_text("body"), f"{breite}: Aufnehmen ohne Bestätigung")

        # Kapitel-Leiste: Kapitel II öffnen
        page.locator("nav[aria-label='Kapitel dieser Klasse'] button").nth(1).click(); page.wait_for_timeout(800)
        pruefe("Einführung in die Differenzialrechnung" in page.locator("h1").first.inner_text(), f"{breite}: Wechsel über die Kapitel-Leiste")
        pruefe(page.url.endswith("/kapitel/einfuehrung-in-die-differenzialrechnung"), f"{breite}: Adresse nach Wechsel")
        # Üben eines Unterthemas → Training
        page.get_by_role("button", name="Mittlere Änderungsrate üben").click(); page.wait_for_timeout(1000)
        pruefe("/trainieren" in page.url, f"{breite}: Üben öffnet kein Training ({page.url})")
        page.go_back(); page.wait_for_timeout(1000)
        pruefe("/kapitel/" in page.url, f"{breite}: Zurück führt nicht zur Kapitelseite ({page.url})")

        # Direktlink ohne Kontext, Kursstufe
        page.goto(BASE + "/kapitel/normalverteilung"); page.wait_for_timeout(1500)
        pruefe("Normalverteilung" in page.locator("h1").first.inner_text(), f"{breite}: Direktlink")
        pruefe("klasse 13" in page.inner_text("body").lower(), f"{breite}: Direktlink ohne Klasse")
        page.goto(BASE + "/kapitel/ksdiff"); page.wait_for_timeout(1500)   # alter Link (Kapitel-Id) → lesbarer Pfad
        pruefe(page.url.endswith("/kapitel/grundlagen-der-differenzialrechnung"), f"{breite}: alter Link nicht umgeschrieben ({page.url})")
        page.goto(BASE + "/kapitel"); page.wait_for_timeout(1500)
        pruefe("Kapitelseiten" in page.locator("h1").first.inner_text(), f"{breite}: Übersicht /kapitel")
        pruefe(not konsole, f"{breite}: Konsolenfehler {konsole[:3]}")
        ctx.close()
    b.close()

print("OK" if not fehler else f"{len(fehler)} Fehler")
raise SystemExit(1 if fehler else 0)
