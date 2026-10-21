"""Kurs Vektoren, Geraden und Ebenen: Kachel auf der Startseite, Übersicht, Modul mit Lesefunktion, Werkzeug-Fenster.
Bei 360/390/1280 px, ohne Überbreite und ohne Konsolenfehler."""
import os, sys
from playwright.sync_api import sync_playwright
os.makedirs("/tmp/vekkurs", exist_ok=True)

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
fehler = []

with sync_playwright() as p:
    b = p.chromium.launch()
    for breite in (360, 390, 1280):
        seite = b.new_page(viewport={"width": breite, "height": 860})
        konsole = []
        seite.on("console", lambda m: konsole.append(m.text) if m.type == "error" else None)
        seite.on("pageerror", lambda e: konsole.append(str(e)))
        seite.goto(BASE)
        seite.wait_for_timeout(800)
        kachel = seite.get_by_role("button", name="Kurs Vektoren, Geraden und Ebenen öffnen")
        if kachel.count() == 0:
            fehler.append(f"{breite}: Kachel fehlt")
            continue
        kachel.first.scroll_into_view_if_needed()
        seite.screenshot(path=f"/tmp/vekkurs/vk-kachel-{breite}.png", clip=None)
        kachel.first.click()
        seite.wait_for_timeout(800)
        if "vektoren-geraden-ebenen" not in seite.url: fehler.append(f"{breite}: Pfad {seite.url}")
        seite.locator(".ks-weiter").first.click()
        seite.wait_for_timeout(800)
        if seite.locator("iframe[title*='lesen']").count() == 0: fehler.append(f"{breite}: Lesefunktion (Heft) fehlt")
        # seit dem Umbau des Trainingsteils (Reiter Werkzeuge · Aufgaben · Sätze, Start auf „Aufgaben“): erst den Werkzeug-Reiter wählen
        reiter = seite.locator("[data-dk-reiter=werkzeuge]")
        if reiter.count(): reiter.first.click(); seite.wait_for_timeout(400)
        seite.get_by_role("button", name="Jetzt öffnen").first.click()
        seite.wait_for_timeout(1500)
        if seite.get_by_role("dialog").count() == 0: fehler.append(f"{breite}: Werkzeug-Fenster fehlt")
        seite.screenshot(path=f"/tmp/vekkurs/vk-fenster-{breite}.png")
        seite.keyboard.press("Escape")
        seite.wait_for_timeout(300)
        seite.screenshot(path=f"/tmp/vekkurs/vk-modul-{breite}.png", full_page=True)
        ueber = seite.evaluate("document.documentElement.scrollWidth - window.innerWidth")
        if ueber > 1: fehler.append(f"{breite}: Überbreite {ueber}px")
        if konsole: fehler.append(f"{breite}: Konsole {konsole[:2]}")
        seite.close()
    b.close()

print("\n".join(fehler) if fehler else "Kurs Vektoren: alles grün")
sys.exit(1 if fehler else 0)
