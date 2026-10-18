"""Mathe Abi Masterclass – Kursbereich und persönlicher Zugangslink (Vorschau-Modus ohne Supabase).
Ablauf: /masterclass/kurs ohne Zugang → Schaufenster mit Code-Feld; falscher Code → Fehlermeldung;
/masterclass/zugang?z=<Code> → Begrüßung, Freischaltungen, Code aus der Adresse entfernt;
Kursbereich → Übersicht mit 10 Lektionen → Lektion: Platzhalter-Video abspielen, Auftrag abhaken,
Werkzeug-Fenster öffnen und schließen, Mathilda-Fenster öffnen.
Bei 360/390/1280 px, ohne Überbreite und ohne Konsolenfehler.
Code: MC_TOKEN (Umgebung) oder per Node erzeugt."""
import os, subprocess, sys
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173").rstrip("/")
BILDER = os.environ.get("BILDER", "/tmp")
HIER = os.path.dirname(os.path.abspath(__file__))
TOKEN = os.environ.get("MC_TOKEN") or subprocess.check_output(
    ["node", "-e", 'import("./src/masterclassToken.js").then(async m => console.log(await m.tokenErzeugen()))'],
    cwd=os.path.join(HIER, "..", ".."), text=True).strip()
fehler = []

with sync_playwright() as p:
    b = p.chromium.launch()
    for breite in (360, 390, 1280):
        ctx = b.new_context(viewport={"width": breite, "height": 860})
        seite = ctx.new_page()
        konsole = []
        seite.on("console", lambda m: konsole.append(m.text) if m.type == "error" else None)
        seite.on("pageerror", lambda e: konsole.append(str(e)))

        # 1. Ohne Zugang: Schaufenster
        seite.goto(f"{BASE}/masterclass/kurs")
        seite.wait_for_timeout(1200)
        if seite.get_by_text("Dein persönlicher Zugang").count() == 0: fehler.append(f"{breite}: Schaufenster fehlt")
        seite.fill("#mck-code", "MC12-3456-7890")
        seite.get_by_role("button", name="Freischalten").click()
        seite.wait_for_timeout(400)
        if seite.get_by_role("alert").count() == 0: fehler.append(f"{breite}: falscher Code ohne Meldung")
        seite.screenshot(path=f"{BILDER}/mc-schaufenster-{breite}.png", full_page=True)

        # 2. Persönlicher Link
        seite.goto(f"{BASE}/masterclass/zugang?z={TOKEN}")
        seite.wait_for_timeout(1500)
        if "z=" in seite.url: fehler.append(f"{breite}: Code bleibt in der Adresse")
        if seite.get_by_text("Willkommen in der Masterclass!").count() == 0: fehler.append(f"{breite}: Begrüßung fehlt")
        if seite.get_by_text("MathildaAI ohne Tageslimit").count() == 0: fehler.append(f"{breite}: Freischaltungen fehlen")
        seite.screenshot(path=f"{BILDER}/mc-zugang-{breite}.png", full_page=True)
        seite.get_by_role("button", name="Zum Kursbereich →").click()
        seite.wait_for_timeout(1200)

        # 3. Übersicht
        if "/masterclass/kurs" not in seite.url: fehler.append(f"{breite}: Pfad {seite.url}")
        if seite.get_by_text("DEIN FORTSCHRITT").count() == 0: fehler.append(f"{breite}: Übersicht fehlt")
        if seite.locator(".mck-modul").count() != 10: fehler.append(f"{breite}: {seite.locator('.mck-modul').count()} statt 10 Lektionen")
        seite.screenshot(path=f"{BILDER}/mc-uebersicht-{breite}.png", full_page=True)
        ueber = seite.evaluate("document.documentElement.scrollWidth - window.innerWidth")
        if ueber > 1: fehler.append(f"{breite}: Überbreite Übersicht {ueber}px")

        # 4. Lektion 3 (Ableitung)
        seite.locator(".mck-modul").nth(2).click()
        seite.wait_for_timeout(800)
        if seite.get_by_text("LEKTION 3 VON 10").count() == 0: fehler.append(f"{breite}: Lektion 3 nicht offen")
        seite.get_by_role("button", name="Abspielen").click()
        seite.wait_for_timeout(2500)
        if seite.get_by_text("Platzhalter-Vorschau").count() == 0: fehler.append(f"{breite}: Player läuft nicht")
        seite.screenshot(path=f"{BILDER}/mc-video-{breite}.png")
        seite.get_by_role("button", name="Als gesehen markieren").click()
        seite.locator("label:has(.mck-check)").first.click()
        seite.wait_for_timeout(200)
        if not seite.locator(".mck-check").first.is_checked(): fehler.append(f"{breite}: Auftrag nicht abgehakt")
        seite.screenshot(path=f"{BILDER}/mc-lektion-{breite}.png", full_page=True)
        ueber = seite.evaluate("document.documentElement.scrollWidth - window.innerWidth")
        if ueber > 1: fehler.append(f"{breite}: Überbreite Lektion {ueber}px")

        seite.locator(".mck-wz").first.click()
        seite.wait_for_timeout(2500)
        if seite.get_by_role("dialog").count() == 0: fehler.append(f"{breite}: Werkzeug-Fenster fehlt")
        seite.screenshot(path=f"{BILDER}/mc-fenster-{breite}.png")
        seite.keyboard.press("Escape")
        seite.wait_for_timeout(300)
        seite.get_by_role("button", name="Mathilda fragen").click()
        seite.wait_for_timeout(600)
        if seite.get_by_role("dialog", name="Mathilda fragen").count() == 0: fehler.append(f"{breite}: Mathilda-Fenster fehlt")
        seite.screenshot(path=f"{BILDER}/mc-mathilda-{breite}.png")

        # Fortschritt bleibt nach dem Neuladen
        seite.goto(f"{BASE}/masterclass/kurs")
        seite.wait_for_timeout(1200)
        if seite.locator(".mck-modul").count() != 10: fehler.append(f"{breite}: Zugang nach Neuladen weg")

        rest = [k for k in konsole if "favicon" not in k and "Failed to load resource" not in k]
        if rest: fehler.append(f"{breite}: Konsole {rest[:3]}")
        ctx.close()
    b.close()

print("\n".join(fehler) if fehler else "alles gut")
sys.exit(1 if fehler else 0)
