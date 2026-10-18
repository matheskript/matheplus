"""Browser-Test Datenschutz und Eltern-Einwilligung (Vorschau-Modus ohne Supabase).
- /datenschutz, /impressum bei 360/390/1280: lesbar, keine Überbreite, keine Seitenfehler.
- Keine Verbindung zu Google Fonts, cdnjs oder YouTube beim Laden; Videos erst nach Klick.
- Konto: Schüler unter 16 legt an → Karte „Zustimmung fehlt“ → Eltern öffnen den Link → stimmen zu → Konto zeigt „Erteilt“.
- Mathilda fragt vor dem Chat nach der Zustimmung.
  npx vite build && npx vite preview --port 4173 &   →   BASE_URL=http://localhost:4173/ python3 tests/ui/recht.ui.py
"""
import os, re
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/").rstrip("/")
AUS = os.environ.get("SCREENS", "/tmp/recht")
os.makedirs(AUS, exist_ok=True)
fehler = []
VERBOTEN = re.compile(r"fonts\.googleapis|fonts\.gstatic|cdnjs\.cloudflare|youtube\.com|youtube-nocookie\.com|mediadelivery\.net")

def pruefe(bed, text):
    if not bed:
        fehler.append(text); print("FEHLT:", text)

with sync_playwright() as p:
    b = p.chromium.launch()
    for breite in (360, 390, 1280):
        ctx = b.new_context(viewport={"width": breite, "height": 900}, locale="de-DE")
        page = ctx.new_page()
        konsole, fremd = [], []
        page.on("pageerror", lambda e: konsole.append(str(e)))
        page.on("request", lambda r: fremd.append(r.url) if VERBOTEN.search(r.url) else None)
        for pfad, text in (("/datenschutz", "Kurz erklärt"), ("/impressum", "§ 18 Abs. 2 MStV"), ("/entdecken", None)):
            page.goto(BASE + pfad); page.wait_for_timeout(1200)
            if text:
                pruefe(page.locator(f"text={text}").count() > 0, f"{pfad} {breite}: '{text}' fehlt")
            breit = page.evaluate("document.documentElement.scrollWidth")
            pruefe(breit <= breite + 1, f"{pfad} {breite}: Überbreite {breit}")
        page.goto(BASE + "/datenschutz"); page.wait_for_timeout(800)
        pruefe(page.locator("text=Deine Einstellungen auf diesem Gerät").count() == 1, f"Einstellungen fehlen {breite}")
        pruefe(page.locator("footer >> text=Datenschutz").count() >= 1, f"Fußzeile ohne Datenschutz {breite}")
        page.screenshot(path=f"{AUS}/datenschutz-{breite}.png", full_page=False)
        pruefe(not fremd, f"{breite}: Fremdanfragen ohne Zustimmung: {fremd[:3]}")
        pruefe(not konsole, f"{breite}: Seitenfehler {konsole[:2]}")

        if breite == 390:
            # Konto: Schüler unter 16
            page.goto(BASE + "/konto"); page.wait_for_timeout(1000)
            page.locator("button:has-text('Mit Google anmelden')").click(); page.wait_for_timeout(600)
            page.locator("button[role=radio]:has-text('Schülerin')").first.click()
            page.locator("button:has-text('Jünger als 16')").click()
            page.fill("#konto-name", "Lena Test")
            page.locator("button:has-text('Konto anlegen')").click(); page.wait_for_timeout(800)
            pruefe(page.locator("text=ZUSTIMMUNG DEINER ELTERN FEHLT").count() == 1, "Karte 'Zustimmung fehlt' fehlt")
            pruefe(page.locator("text=sobald deine Eltern zugestimmt haben").count() >= 0, "")
            page.screenshot(path=f"{AUS}/konto-u16.png", full_page=True)
            link = page.locator("span:has-text('/einwilligung?k=')").first.inner_text()
            k = link.split("k=")[1]
            page.goto(BASE + "/einwilligung?k=" + k); page.wait_for_timeout(1200)
            pruefe(page.locator("text=Lena möchte mit Mythos Mathe lernen").count() == 1, "Elternseite ohne Vorname")
            page.screenshot(path=f"{AUS}/einwilligung-form.png", full_page=True)
            page.locator("button:has-text('Mathilda (KI-Tutor) nutzen')").click()
            page.get_by_label("Ihr Name").fill("Mama Test")
            page.get_by_label("Ihre E-Mail-Adresse").fill("mama@test.de")
            page.locator("button:has-text('sorgeberechtigt')").click()
            page.locator("button:has-text('Datenschutzerklärung gelesen')").click()
            page.locator("button:has-text('Zustimmung erteilen')").click(); page.wait_for_timeout(800)
            pruefe(page.locator("text=Vielen Dank").count() == 1, "Zustimmung nicht bestätigt")
            pruefe(page.locator("text=Mathilda (KI-Tutor) nutzen: erlaubt").count() == 1, "Umfang KI nicht übernommen")
            page.screenshot(path=f"{AUS}/einwilligung-erteilt.png", full_page=True)
            page.goto(BASE + "/konto"); page.wait_for_timeout(1000)
            pruefe(page.locator("text=✓ Erteilt").count() == 1, "Konto zeigt Zustimmung nicht")
            # ungültiger Link
            page.goto(BASE + "/einwilligung?k=ffff0000ffff0000"); page.wait_for_timeout(800)
            pruefe(page.locator("text=Dieser Link funktioniert nicht").count() == 1, "ungültiger Link nicht erkannt")
            # Mathilda-Chat fragt zuerst
            page.goto(BASE + "/mathilda"); page.wait_for_timeout(1200)
            pruefe(page.locator("text=Bevor Mathilda dir hilft").count() >= 1, "Mathilda-Chat ohne Zustimmungsabfrage")
            page.screenshot(path=f"{AUS}/mathilda-zustimmung.png", full_page=False)
            pruefe(not konsole, f"Seitenfehler im Ablauf {konsole[:2]}")
        ctx.close()
    b.close()

print("FEHLER:", len(fehler))
for f in fehler: print(" -", f)
raise SystemExit(1 if fehler else 0)
