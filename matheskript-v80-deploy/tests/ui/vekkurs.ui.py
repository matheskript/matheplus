"""Kurs Vektoren, Geraden und Ebenen: Kachel auf der Startseite, Übersicht, Modul mit Platzhalter, Werkzeug-Fenster.
Bei 360/390/1280 px, ohne Überbreite und ohne Konsolenfehler."""
import os, sys
from playwright.sync_api import sync_playwright

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
        seite.screenshot(path=f"/tmp/claude-0/-home-claude/2301709f-8eb2-5551-b0bc-6db8a05cba0d/scratchpad/vk-kachel-{breite}.png", clip=None)
        kachel.first.click()
        seite.wait_for_timeout(800)
        if "vektoren-geraden-ebenen" not in seite.url: fehler.append(f"{breite}: Pfad {seite.url}")
        seite.get_by_text("Kurs starten:").first.click()
        seite.wait_for_timeout(600)
        if seite.get_by_text("Dieses Kapitel wird gerade geschrieben.").count() == 0: fehler.append(f"{breite}: Platzhalter fehlt")
        seite.get_by_role("button", name="Jetzt öffnen").first.click()
        seite.wait_for_timeout(1500)
        if seite.get_by_role("dialog").count() == 0: fehler.append(f"{breite}: Werkzeug-Fenster fehlt")
        seite.screenshot(path=f"/tmp/claude-0/-home-claude/2301709f-8eb2-5551-b0bc-6db8a05cba0d/scratchpad/vk-fenster-{breite}.png")
        seite.keyboard.press("Escape")
        seite.wait_for_timeout(300)
        seite.screenshot(path=f"/tmp/claude-0/-home-claude/2301709f-8eb2-5551-b0bc-6db8a05cba0d/scratchpad/vk-modul-{breite}.png", full_page=True)
        ueber = seite.evaluate("document.documentElement.scrollWidth - window.innerWidth")
        if ueber > 1: fehler.append(f"{breite}: Überbreite {ueber}px")
        if konsole: fehler.append(f"{breite}: Konsole {konsole[:2]}")
        seite.close()
    b.close()

print("\n".join(fehler) if fehler else "Kurs Vektoren: alles grün")
sys.exit(1 if fehler else 0)
