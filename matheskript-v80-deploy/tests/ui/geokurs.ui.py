"""Kurs Dreiecksgeometrie: Kachel auf der Startseite, Kursseite, Modul mit Lesefunktion (Reader-Link mit ?von=&bis=),
Werkzeug-Pop-up, Eintrag im ☰-Menü. Bei 360/390/1280 px, ohne Überbreite und ohne Konsolenfehler.
Aufruf: BASE_URL=http://localhost:4190/ python3 tests/ui/geokurs.ui.py   (Screenshots in /tmp/geokurs)
Liegt der Reader (public/buecher/dreiecksgeometrie) im Build, prüft der Test auch die Buchaufgaben im Reiter „Aufgaben“."""
import os, sys, urllib.request
from playwright.sync_api import sync_playwright

AUS = "/tmp/geokurs"
os.makedirs(AUS, exist_ok=True)
BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
if not BASE.endswith("/"): BASE += "/"
fehler = []

def reader_da():
    try:
        with urllib.request.urlopen(BASE + "buecher/dreiecksgeometrie/kurs/seiten.json", timeout=5) as r:
            return r.read(1)[:1] == b"["
    except Exception:
        return False
READER = reader_da()

def ueberbreite(seite):
    return seite.evaluate("document.documentElement.scrollWidth - window.innerWidth")

with sync_playwright() as p:
    b = p.chromium.launch()
    for breite in (360, 390, 1280):
        ctx = b.new_context(viewport={"width": breite, "height": 860}, locale="de-DE")
        seite = ctx.new_page()
        konsole = []
        seite.on("console", lambda m: konsole.append(m.text) if m.type == "error" else None)
        seite.on("pageerror", lambda e: konsole.append(str(e)))
        seite.goto(BASE)
        seite.evaluate("localStorage.clear(); localStorage.setItem('mm-start-app','1'); localStorage.setItem('mm-onboarding-v1', JSON.stringify({uebersprungen:true}));")
        seite.goto(BASE)
        seite.wait_for_timeout(900)

        # 1. Kachel auf der Startseite
        kachel = seite.get_by_role("button", name="Kurs Dreiecksgeometrie öffnen")
        if kachel.count() == 0:
            fehler.append(f"{breite}: Kachel fehlt"); ctx.close(); continue
        kachel.first.scroll_into_view_if_needed()
        seite.wait_for_timeout(300)
        kachel.first.screenshot(path=f"{AUS}/gk-kachel-{breite}.png")
        if ueberbreite(seite) > 1: fehler.append(f"{breite}: Startseite Überbreite {ueberbreite(seite)}px")

        # 2. Kursseite
        kachel.first.click()
        seite.wait_for_timeout(900)
        if "/dreiecksgeometrie" not in seite.url: fehler.append(f"{breite}: Pfad {seite.url}")
        if seite.locator("h1", has_text="Dreiecksgeometrie").count() == 0: fehler.append(f"{breite}: Kopf der Kursseite fehlt")
        zahl = seite.locator("[data-geo-modul]").count()
        if zahl != 25: fehler.append(f"{breite}: {zahl} statt 25 Module in der Übersicht")
        seite.screenshot(path=f"{AUS}/gk-kurs-{breite}.png", full_page=True)
        if ueberbreite(seite) > 1: fehler.append(f"{breite}: Kursseite Überbreite {ueberbreite(seite)}px")

        # 3. Modul öffnen („Kurs starten“ → Modul 1) und Reader-Link prüfen
        seite.locator(".ks-weiter").first.click()
        seite.wait_for_timeout(1200)
        rahmen = seite.locator("iframe[title*='lesen']")
        if rahmen.count() == 0:
            fehler.append(f"{breite}: Lesefunktion fehlt")
        else:
            src = rahmen.first.get_attribute("src") or ""
            if not src.startswith("/buecher/dreiecksgeometrie/index.html?von=3&bis=5&voll="): fehler.append(f"{breite}: Reader-Link {src}")
        if seite.locator("h2", has_text="1 Rechteck und Quadrat").count() == 0: fehler.append(f"{breite}: Modultitel fehlt")

        # 3b. Ein anderes Modul über „Nächstes Modul“: Grenzen wandern mit
        seite.get_by_role("button", name="Nächstes Modul →").first.click()
        seite.wait_for_timeout(900)
        src2 = seite.locator("iframe[title*='lesen']").first.get_attribute("src") or ""
        if "?von=6&bis=7" not in src2: fehler.append(f"{breite}: Reader-Link Modul 2 {src2}")
        if seite.evaluate("window.scrollY") > 5: fehler.append(f"{breite}: neues Modul beginnt nicht oben")

        # 4. Buchaufgaben (nur wenn der Reader im Build liegt)
        if READER:
            seite.locator("[data-dk-reiter=aufgaben]").first.click()
            seite.wait_for_timeout(1200)
            n = seite.locator("[data-buchaufgabe]").count()
            if n == 0: fehler.append(f"{breite}: keine Buchaufgaben im Reiter Aufgaben")
            if seite.get_by_text("BEGRÜNDEN", exact=True).count(): fehler.append(f"{breite}: Etikett „BEGRÜNDEN“ ohne Aufgabentypen")

        # 5. Werkzeug-Pop-up
        seite.locator("[data-dk-reiter=werkzeuge]").first.click()
        seite.wait_for_timeout(400)
        seite.get_by_role("button", name="Jetzt öffnen").first.click()
        seite.wait_for_timeout(1800)
        dialog = seite.get_by_role("dialog")
        if dialog.count() == 0:
            fehler.append(f"{breite}: Werkzeug-Fenster fehlt")
        elif "Umfang und Flächeninhalt" not in dialog.first.inner_text():
            fehler.append(f"{breite}: falsches Werkzeug im Fenster")
        seite.screenshot(path=f"{AUS}/gk-fenster-{breite}.png")
        seite.keyboard.press("Escape")
        seite.wait_for_timeout(300)
        if seite.get_by_role("dialog").count(): fehler.append(f"{breite}: Fenster geht mit Esc nicht zu")
        seite.evaluate("window.scrollTo(0, 0)")
        seite.screenshot(path=f"{AUS}/gk-modul-{breite}.png", full_page=True)
        if ueberbreite(seite) > 1: fehler.append(f"{breite}: Modul Überbreite {ueberbreite(seite)}px")

        # 6. ☰-Menü kennt den Kurs (als Besucher über das Besuchermenü zum großen Menü)
        seite.goto(BASE)
        seite.wait_for_timeout(700)
        menue = seite.locator("[data-hm-menue]")
        if menue.count():
            menue.first.click(); seite.wait_for_timeout(400)
            if seite.locator("[data-besuchermenue]").count():
                seite.locator("[data-kl-bm-alles]").first.click(); seite.wait_for_timeout(500)
            if seite.locator("[data-hm-kurs=geokurs], [data-hmd-kurs=geokurs]").count() == 0: fehler.append(f"{breite}: Kurs fehlt im ☰-Menü")
            seite.keyboard.press("Escape")
        else:
            fehler.append(f"{breite}: ☰-Knopf fehlt")

        if konsole: fehler.append(f"{breite}: Konsole {konsole[:3]}")
        ctx.close()
    b.close()

print(("Reader im Build: ja" if READER else "Reader im Build: nein (Buchaufgaben nicht geprüft)"))
print("\n".join(fehler) if fehler else "Kurs Dreiecksgeometrie: alles grün")
sys.exit(1 if fehler else 0)
