"""Browser-Test: Kurse „Mathe lernen mit Claude“ (ab 18, /mathe-lernen-mit-claude) und
„Mathe lernen mit Gemini“ (ab 16, /mathe-lernen-mit-gemini).
Prüft bei 360, 390 und 1280 px: beide Startseiten-Kacheln, Übersicht mit zehn Lektionen, Schwesterkurs-Knopf,
jede Lektion mit Film (Player läuft, Schritt springen), Prompts kopieren, Beispiel-Chat je Kurs
(Claude aus dem Buch Ableitungen, Gemini eigene Aufgaben), KI-Name eingesetzt, Zugangs-Schritte je Kurs,
Auftrag abhaken, Lektion abhaken, „Nächste Lektion“, Fortschritt – ohne Überbreite und ohne Konsolenfehler.
  npm run build && npx vite preview --port 4173 &   →   python3 tests/ui/claudekurs.ui.py
"""
import os, re
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
AUS = os.environ.get("SCREENS", "/tmp/claudekurs")
os.makedirs(AUS, exist_ok=True)
fehler = []
def pruefe(bed, text):
    if not bed: fehler.append(text); print("FEHLT:", text)

with sync_playwright() as p:
    b = p.chromium.launch()
    for breite in (360, 390, 1280):
        ctx = b.new_context(viewport={"width": breite, "height": 900}, device_scale_factor=2, locale="de-DE")
        page = ctx.new_page()
        konsole = []
        page.on("pageerror", lambda e: konsole.append(f"pageerror: {e}"))
        page.on("console", lambda m: konsole.append(m.text) if m.type == "error" and "net::" not in m.text and "Failed to load resource" not in m.text else None)
        def breite_ok(wo):
            sw = page.evaluate("document.documentElement.scrollWidth"); pruefe(sw <= breite, f"{breite}: Überbreite bei {wo}: {sw}")

        # Startseite: zwei Kacheln
        page.goto(BASE); page.wait_for_timeout(1200)
        pruefe(page.locator("[data-claudekurs-kachel=claude]").count() == 1, f"{breite}: Claude-Kachel fehlt")
        pruefe(page.locator("[data-claudekurs-kachel=gemini]").count() == 1, f"{breite}: Gemini-Kachel fehlt")
        page.locator("[data-claudekurs-kachel=claude]").scroll_into_view_if_needed(); page.screenshot(path=f"{AUS}/{breite}-kacheln.png")
        page.locator("[data-claudekurs-kachel=claude]").click(); page.wait_for_timeout(1200)
        pruefe("mathe-lernen-mit-claude" in page.url, f"{breite}: Claude-Kurs nicht geöffnet ({page.url})")

        # Übersicht Claude
        pruefe(page.locator("[data-claudekurs-lektion]").count() == 10, f"{breite}: nicht zehn Lektionen")
        pruefe(page.get_by_role("heading", name="Mathe lernen mit Claude").count() == 1, f"{breite}: Titel Claude fehlt")
        pruefe(page.locator("[data-claudekurs-schwester]").count() >= 1, f"{breite}: Schwesterkurs-Knopf fehlt")
        breite_ok("Übersicht Claude")
        page.screenshot(path=f"{AUS}/{breite}-uebersicht.png", full_page=(breite == 390))

        # Lektion 2 (Claude): Buchbeispiel, Film, KI-Name
        page.locator("[data-claudekurs-lektion=regel]").click(); page.wait_for_timeout(900)
        pruefe(page.locator("[data-claudekurs-modul=regel]").count() == 1, f"{breite}: Lektion 2 nicht offen")
        pruefe(page.get_by_text("Buch Ableitungen · S. 27, Nr. 4").count() == 1, f"{breite}: Beispiel aus dem Buch fehlt")
        pruefe(page.get_by_text("{KI}").count() == 0, f"{breite}: Platzhalter {{KI}} sichtbar")
        pruefe(page.get_by_text("Gemini").count() <= 1, f"{breite}: Gemini im Claude-Kurs (außer Schwesterkurs-Knopf)")
        film = page.locator("[data-claudekurs-film=regel]")
        pruefe(film.locator("input[type=range]").count() == 1, f"{breite}: Film fehlt")
        film.get_by_label("Schritt 3 abspielen").click(); page.wait_for_timeout(500)
        pruefe(film.get_by_text("Schritt 3 von").count() == 1, f"{breite}: Schrittwechsel im Film fehlt")
        t = film.locator("input[type=range]").evaluate("e => parseFloat(e.value)")
        pruefe(t >= 16, f"{breite}: Zeitleiste springt nicht ({t})")
        pruefe(page.locator("[data-claudekurs-prompt]").count() == 3, f"{breite}: drei Prompts erwartet")
        breite_ok("Lektion 2 Claude")
        film.scroll_into_view_if_needed(); page.screenshot(path=f"{AUS}/{breite}-film.png")
        page.screenshot(path=f"{AUS}/{breite}-lektion2-claude.png", full_page=(breite == 390))

        # Prompt kopieren, Auftrag abhaken, Lektion abhaken, nächste Lektion
        page.get_by_role("button", name="Prompt kopieren").first.click(); page.wait_for_timeout(200)
        pruefe(page.get_by_text("Kopiert ✓").count() >= 1, f"{breite}: Kopieren ohne Rückmeldung")
        page.locator(".clk-check").first.check(force=True); page.wait_for_timeout(150)
        page.locator("[data-claudekurs-abhaken]").click(); page.wait_for_timeout(200)
        pruefe(page.get_by_text("Lektion abgehakt").count() == 1, f"{breite}: Abhaken fehlt")
        page.locator("[data-claudekurs-naechste]").click(); page.wait_for_timeout(900)
        pruefe(page.locator("[data-claudekurs-modul=verstehen]").count() == 1, f"{breite}: Lektion 3 nicht offen")
        pruefe(page.evaluate("window.scrollY") < 40, f"{breite}: neue Lektion beginnt nicht oben")

        # Lektion 1 Claude: Zugang ab 18, claude.ai
        page.get_by_role("button", name="Alle Lektionen").click(); page.wait_for_timeout(600)
        pruefe(page.get_by_text("1 von 10 Lektionen").count() == 1, f"{breite}: Fortschritt nicht gezählt")
        page.locator("[data-claudekurs-lektion=zugang]").click(); page.wait_for_timeout(800)
        pruefe(page.get_by_text("claude.ai öffnen").count() >= 1, f"{breite}: claude.ai-Schritt fehlt")
        pruefe(page.get_by_text("ab 18 Jahren").count() >= 1, f"{breite}: Altershinweis Claude fehlt")
        pruefe(page.locator("[data-claudekurs-extern]").get_attribute("href") == "https://claude.ai", f"{breite}: externer Link Claude")
        breite_ok("Lektion 1 Claude")

        # Über den Schwesterkurs-Knopf zu Gemini: eigener Fortschritt, eigene Beispiele, eigener Zugang
        page.locator("[data-claudekurs-schwester]").first.click(); page.wait_for_timeout(1000)
        pruefe("mathe-lernen-mit-gemini" in page.url, f"{breite}: Gemini-Kurs nicht geöffnet ({page.url})")
        pruefe(page.get_by_role("heading", name="Mathe lernen mit Gemini").count() == 1, f"{breite}: Titel Gemini fehlt")
        pruefe(page.get_by_text("0 von 10 Lektionen").count() == 1, f"{breite}: Gemini-Fortschritt nicht getrennt")
        page.locator("[data-claudekurs-lektion=zugang]").click(); page.wait_for_timeout(800)
        pruefe(page.get_by_text("gemini.google.com öffnen").count() >= 1, f"{breite}: Gemini-Zugang fehlt")
        pruefe(page.get_by_text("ab 16").count() >= 1, f"{breite}: Altershinweis Gemini fehlt")
        pruefe(page.get_by_text("Startprompt aufbewahren").count() == 1, f"{breite}: Hinweis Verlauf unter 18 fehlt")
        page.get_by_role("button", name="Alle Lektionen").click(); page.wait_for_timeout(400)
        page.locator("[data-claudekurs-lektion=regel]").click(); page.wait_for_timeout(900)
        pruefe(page.get_by_text("Strahlensätze · Klasse 9").count() == 1, f"{breite}: Gemini-Beispiel fehlt")
        pruefe(page.get_by_text("Buch Ableitungen").count() == 0, f"{breite}: Buchbeispiel im Gemini-Kurs")
        pruefe(page.locator("[data-claudekurs-beispiel]").inner_text().count("Gemini") >= 1, f"{breite}: KI-Name im Gemini-Beispiel nicht eingesetzt")
        pruefe(page.locator("[data-claudekurs-beispiel]").inner_text().count("Claude") == 0, f"{breite}: Claude im Gemini-Beispiel")
        breite_ok("Lektion 2 Gemini")
        page.locator("[data-claudekurs-beispiel]").scroll_into_view_if_needed(); page.screenshot(path=f"{AUS}/{breite}-beispiel-gemini.png")

        # Alle übrigen Filme einmal rendern (keine Konsolenfehler, keine Überbreite)
        for lid in ["verstehen", "begriffe", "schritte", "pruefen", "fehler", "text", "ueben", "system"]:
            page.get_by_role("button", name="Alle Lektionen").click(); page.wait_for_timeout(300)
            page.locator(f"[data-claudekurs-lektion={lid}]").click(); page.wait_for_timeout(600)
            pruefe(page.locator(f"[data-claudekurs-film={lid}] input[type=range]").count() == 1, f"{breite}: Film {lid} fehlt")
            breite_ok(f"Lektion {lid}")
        if breite == 390:
            page.get_by_role("button", name="Alle Lektionen").click(); page.wait_for_timeout(300)
            page.locator("[data-claudekurs-lektion=pruefen]").click(); page.wait_for_timeout(600)
            page.screenshot(path=f"{AUS}/{breite}-lektion6-gemini.png", full_page=True)

        pruefe(not konsole, f"{breite}: Konsolenfehler {konsole[:3]}")
        ctx.close()
    b.close()

print("Fehler:", len(fehler))
for f in fehler: print(" -", f)
raise SystemExit(1 if fehler else 0)
