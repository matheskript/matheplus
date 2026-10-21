"""Browser-Test des Kurses Mittelstufe im Werkzeug-Band (trainingsKurse.js, id „mittel“).
Je Breite (360, 390, 1280):
  · Geraden, Parabeln, Pythagoras, Gleichungen, Brüche und Wurzeln zeigen dasselbe Band mit fünf Reitern
    und dem Kurs-Umschalter „Mittelstufe“; Reiter „Brüche und √Wurzeln“ zeichnet die Wurzel als Linienzug (SVG)
  · Reiter wechseln das Werkzeug; keine Überbreite, keine Konsolenfehler
  · Geraden am Desktop (ab 840 px): Eingaben/Schritte links, Schaubild rechts (mind. 300 px) – in Grundlagen, Zwei Punkte, Punkt und Steigung
  · Brüche und Wurzeln: jeder Wurzel-Aufgabentyp erst falsch (gezielte Rückmeldung), dann richtig bis „Richtig gelöst.“;
    Modus Brüche zeigt die Bruchterm-Übungen
  npm run build && npx vite preview --port 4173 &   →   python3 -u tests/ui/mittelstufe-kurs.ui.py
"""
import os
from playwright.sync_api import sync_playwright

def _typen_auf(pg):
    """Aufgabentyp-Chips liegen seit 21.10. hinter der Einstellungs-Pille: bei Bedarf aufklappen."""
    if pg.locator("[data-einstellungen-feld]:visible").count() == 0:
        pil = pg.locator("[data-einstellungen-pille]:visible")
        if pil.count():
            pil.first.click(); pg.wait_for_timeout(150)

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
AUS = os.environ.get("SCREENS", "/tmp/mittelstufe-kurs")
os.makedirs(AUS, exist_ok=True)
fehler = []
def pruefe(bed, text):
    if not bed:
        fehler.append(text); print("FEHLT:", text)

WERKZEUGE = ["geradengleichung", "parabeln", "pythagoras", "gleichungen", "bruchwurzel"]
ARTEN = ["ziehen", "teilweise", "produkt", "summe", "nenner", "bruch"]
NAMEN = {"ziehen": "Wurzel ziehen", "teilweise": "Teilweise Wurzel ziehen", "produkt": "Wurzeln multiplizieren",
         "summe": "Falle: Wurzel einer Summe", "nenner": "Nenner wurzelfrei", "bruch": "Wurzel aus einem Bruch"}

def wurzel_loesen(page, art):
    karte = page.locator(f"[data-wurzel-aufgabe='{art}']")
    pruefe(karte.count() == 1, f"Aufgabe {art} erscheint")
    au = page.evaluate("window.__wzAufgabe")
    for i, a in enumerate(au["antworten"]):
        if "zahl" in a:
            feld = karte.locator("input").first
            feld.fill("9999"); karte.get_by_role("button", name="Schritt prüfen").click(); page.wait_for_timeout(80)
            pruefe(karte.locator("[role=alert]").count() >= 1, f"{art} Schritt {i + 1}: Rückmeldung bei falscher Zahl")
            feld.fill(a["zahl"].replace("−", "-"))
        else:
            gruppe = karte.locator("[role=group]").last
            n = gruppe.locator("button").count()
            gruppe.locator("button").nth((a["wahl"] + 1) % n).click()
            karte.get_by_role("button", name="Schritt prüfen").click(); page.wait_for_timeout(80)
            pruefe(karte.locator("[role=alert]").count() >= 1, f"{art} Schritt {i + 1}: Rückmeldung bei falscher Wahl")
            gruppe.locator("button").nth(a["wahl"]).click()
        karte.get_by_role("button", name="Schritt prüfen").click(); page.wait_for_timeout(120)
    pruefe(karte.get_by_text("Richtig gelöst.").count() == 1, f"{art}: bis zum Ende gelöst")

with sync_playwright() as p:
    b = p.chromium.launch()
    for breite, hoehe in [(360, 740), (390, 844), (1280, 860)]:
        page = b.new_page(viewport={"width": breite, "height": hoehe})
        page.on("pageerror", lambda e: fehler.append(f"Seitenfehler: {e}"))
        page.on("console", lambda m: fehler.append(f"Konsole: {m.text}") if m.type == "error" else None)
        page.goto(BASE)
        page.evaluate("localStorage.setItem('mm-onboarding-v1', JSON.stringify({uebersprungen:true}))")
        for wz in WERKZEUGE:
            page.goto(BASE + wz); page.wait_for_timeout(1100)
            band = page.locator("nav[data-werkzeug-band]")
            pruefe(band.get_attribute("data-kurs") == "mittel", f"{breite} {wz}: Band zeigt Kurs Mittelstufe")
            pruefe(band.locator(".wb-tab").count() == 5, f"{breite} {wz}: fünf Reiter")
            pruefe(band.locator(".wb-tab[aria-current=page]").count() == 1, f"{breite} {wz}: aktiver Reiter")
            pruefe(breite < 375 or "Mittelstufe" in band.locator("[data-wb-tools]").inner_text(), f"{breite} {wz}: Umschalter heißt Mittelstufe")  # unter 375 px nur das Zeichen
            letzter = band.locator(".wb-tab").nth(4)
            pruefe(letzter.locator("svg").count() >= 1, f"{breite} {wz}: Wurzel im Reiter als Linienzug")
            pruefe(page.evaluate("document.documentElement.scrollWidth - window.innerWidth") <= 1, f"{breite} {wz}: keine Überbreite")
            page.screenshot(path=f"{AUS}/{wz}-{breite}.png")
        # Reiter wechseln
        page.goto(BASE + "parabeln"); page.wait_for_timeout(900)
        page.locator("nav[data-werkzeug-band] .wb-tab").nth(0).click(); page.wait_for_timeout(900)
        pruefe(page.locator("[data-ger-tab]").count() == 3, f"{breite}: Reiter Geraden öffnet das Geraden-Menü")
        # Geraden: Bild rechts der Eingaben am Desktop
        for tab in ["basics", "pq", "pm"]:
            page.locator(f"[data-ger-tab={tab}]").click(); page.wait_for_timeout(300)
            bild = page.locator(".ger-inhalt .ger-bild").bounding_box()
            links = page.locator(".ger-inhalt [data-arbeitsflaeche] > div" if breite >= 840 else ".ger-inhalt > *:not(.ger-bild)").first.bounding_box()
            if breite >= 840:
                pruefe(bild["x"] > links["x"] + links["width"] - 1, f"{breite} Geraden {tab}: Schaubild rechts")
                pruefe(bild["width"] >= 300, f"{breite} Geraden {tab}: Schaubild zu schmal ({round(bild['width'])} px)")
            else:
                pruefe(abs(bild["x"] - links["x"]) < 40 or bild["y"] > links["y"], f"{breite} Geraden {tab}: Handy untereinander")
            page.screenshot(path=f"{AUS}/geraden-{tab}-{breite}.png")
        # Brüche und Wurzeln
        page.goto(BASE + "bruchwurzel"); page.wait_for_timeout(1100)
        pruefe(page.get_by_text("Kürzen").count() >= 1, f"{breite}: Modus Brüche zeigt Bruchterm-Übungen")
        page.get_by_role("tab", name="Wurzeln").click(); page.wait_for_timeout(200)
        for art in ARTEN:
            _typen_auf(page)
            page.locator("[data-aufgabentyp]").get_by_role("button", name=NAMEN[art], exact=True).click(); page.wait_for_timeout(150)
            wurzel_loesen(page, art)
        page.screenshot(path=f"{AUS}/wurzeln-{breite}.png", full_page=True)
        page.close()
    b.close()

print("\n".join(fehler) if fehler else "Alles in Ordnung.")
raise SystemExit(1 if fehler else 0)
