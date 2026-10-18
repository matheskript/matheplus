"""Browser-Test Mathilda-Modus: goldener Knopf unter den Trainingsaufgaben (Aufgabenlauf, z. B. 5 Minuten Mathe),
Fenster poppt auf, Aufgabe, Schema, Musterlösung einer ähnlichen Aufgabe, Motion-Video, Foto an Mathilda (KI gemockt),
Ergebnis ins Antwortfeld übernehmen. Bei 360, 390 und 1280 px, DE und EN: keine Überbreite, keine Konsolenfehler.
  npm run build && npx vite preview --port 4173 &   →   python3 tests/ui/mathildamodus.ui.py
"""
import json, os, base64
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
AUS = os.environ.get("SCREENS", "/tmp/mm")
os.makedirs(AUS, exist_ok=True)
fehler = []

def pruefe(bed, text):
    if not bed:
        fehler.append(text)
        print("FEHLT:", text)

# kleines weißes JPEG als „Foto“
FOTO = "/tmp/mm-blatt.png"
from PIL import Image, ImageDraw
img = Image.new("RGB", (600, 400), "white"); d = ImageDraw.Draw(img); d.text((40, 60), "3(x - 4) + 5 = -4", fill="black"); img.save(FOTO)

ANTWORT = {"neuesFoto": False, "zeilen": [{"t": "3x − 12 + 5 = −4", "s": "ok"}, {"t": "3x − 7 = −4   | + 7", "s": "ok"}, {"t": "3x = 3   | : 3", "s": "ok"}, {"t": "x = 1", "s": "ok"}],
           "ergebnis": "x = 1", "stimmt": True, "fehler": None, "frage": "", "papier": "blanko", "gelungen": "Ein Schritt pro Zeile, Gleichheitszeichen untereinander.",
           "hebel": [{"titel": "Ergebnis abschließen", "text": "Setz x = 1 in einen Kasten."}], "aufgabe": "Schreib die letzte Zeile mit Kasten neu."}

with sync_playwright() as p:
    b = p.chromium.launch()
    for breite in (360, 390, 1280):
        for sprache in ("de", "en"):
            ctx = b.new_context(viewport={"width": breite, "height": 844}, device_scale_factor=2, locale="de-DE")
            page = ctx.new_page()
            konsole = []
            page.on("pageerror", lambda e: konsole.append(f"pageerror: {e}"))
            page.on("console", lambda m: konsole.append(m.text) if m.type == "error" and "net::" not in m.text and "Failed to load resource" not in m.text else None)
            page.route("**/api/claude", lambda r: r.fulfill(status=200, content_type="application/json",
                       body=json.dumps({"content": [{"type": "text", "text": json.dumps(ANTWORT, ensure_ascii=False)}]})))
            page.goto(BASE)
            page.evaluate(f"""localStorage.clear(); localStorage.setItem('mm-onboarding-v1', JSON.stringify({{uebersprungen:true}}));
              localStorage.setItem('mm-sprache', '{sprache}'); localStorage.setItem('matheskript-einwilligung-v1', '1');""")
            page.goto(BASE + "5-minuten-mathe"); page.wait_for_timeout(900)
            import re
            start = page.get_by_role("button", name=re.compile(r"^(Los geht|Let's go|Let’s go|Start)"))
            if start.count(): start.first.click(); page.wait_for_timeout(500)
            # bis zu einer Rechenaufgabe weiterblättern (Auswahlaufgaben haben keinen Mathilda-Modus)
            knopf = page.locator("[data-mathilda-modus]")
            for _ in range(8):
                if knopf.count(): break
                w = page.get_by_role("radio").first
                if w.count(): w.click(); page.get_by_role("button", name="Prüfen").or_(page.get_by_role("button", name="Check")).first.click(); page.wait_for_timeout(200)
                page.get_by_role("button", name="Weiter").or_(page.get_by_role("button", name="Next")).first.click(); page.wait_for_timeout(400)
            pruefe(knopf.count() == 1, f"{breite}/{sprache}: goldener Knopf fehlt")
            if not knopf.count():
                page.screenshot(path=f"{AUS}/{breite}-{sprache}-ohne.png"); ctx.close(); continue
            knopf.scroll_into_view_if_needed()
            page.screenshot(path=f"{AUS}/{breite}-{sprache}-1-knopf.png")
            knopf.click(); page.wait_for_timeout(600)
            fen = page.locator("[data-mathilda-modus-fenster]")
            pruefe(fen.count() == 1, f"{breite}/{sprache}: Fenster geht nicht auf")
            pruefe(page.locator("[data-mm-abschnitt]").count() == 3, f"{breite}/{sprache}: drei Abschnitte erwartet")
            sw = page.evaluate("document.documentElement.scrollWidth"); pruefe(sw <= breite, f"{breite}/{sprache}: Überbreite {sw}")
            page.screenshot(path=f"{AUS}/{breite}-{sprache}-2-fenster.png")
            page.locator("[data-mm-muster]").click(); page.wait_for_timeout(300)
            pruefe(page.locator("[data-mm-muster-offen]").count() == 1, f"{breite}/{sprache}: Musterlösung fehlt")
            page.locator("[data-mm-muster-offen]").scroll_into_view_if_needed()
            page.screenshot(path=f"{AUS}/{breite}-{sprache}-3-muster.png")
            page.locator("[data-mm-film]").click(); page.wait_for_timeout(9500)
            page.locator("[data-mm-film]").scroll_into_view_if_needed()
            page.screenshot(path=f"{AUS}/{breite}-{sprache}-4-film.png")
            # Foto über die Galerie
            page.locator("[data-mm-galerie]").set_input_files(FOTO); page.wait_for_timeout(800)
            pruefe(page.locator("[data-mm-senden]").count() == 1, f"{breite}/{sprache}: Abschicken fehlt")
            page.locator("[data-mm-senden]").click(); page.wait_for_timeout(1200)
            pruefe(page.locator("[data-mm-rueckmeldung=richtig]").count() == 1, f"{breite}/{sprache}: Rückmeldung fehlt")
            page.locator("[data-mm-rueckmeldung]").scroll_into_view_if_needed()
            page.screenshot(path=f"{AUS}/{breite}-{sprache}-5-rueckmeldung.png")
            sw = page.evaluate("document.documentElement.scrollWidth"); pruefe(sw <= breite, f"{breite}/{sprache}: Überbreite {sw}")
            page.locator("[data-mm-uebernehmen]").click(); page.wait_for_timeout(400)
            pruefe(fen.count() == 0, f"{breite}/{sprache}: Fenster bleibt offen")
            wert = page.evaluate("Array.from(document.querySelectorAll('input')).map(i => i.value).join('|')")
            pruefe("1" in wert, f"{breite}/{sprache}: Ergebnis nicht übernommen ({wert})")
            pruefe(not konsole, f"{breite}/{sprache}: Konsole {konsole[:3]}")
            ctx.close()
    b.close()

print("OK" if not fehler else f"{len(fehler)} Fehler")
raise SystemExit(1 if fehler else 0)
