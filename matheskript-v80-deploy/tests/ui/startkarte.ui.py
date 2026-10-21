"""Browser-Test Start-Karte (Startseite, 21.10.): EIN Einstieg statt „Mein Mathe-Training“ + „Dein Training startet hier.“ + Onboarding.
· Neu: Karte „In welcher Klasse bist du?“ (G9 vorbelegt), keine Schublade, keine alten Boxen.
  Schulsystem G8 → 7 Klassen-Knöpfe. Klasse 11 wählen → Heute-Karte, Quickfinder UND Onboarding gespeichert.
· Klassen-Chip der Heute-Karte → Klassenwahl mit „Abbrechen“.
· Elternteil → Eltern-Zeilen, „Ändern“ → zurück zur Klassenwahl.
· Wiederkehrer am Handy: kompakte Bühne (kein Goldknopf); ab 1100 px: Karte rechts in der Bühne. Neue Besucher: Goldknopf „Pen & Paper starten“.
· Kopfleiste, Pille, keine Seitenüberbreite, keine Konsolenfehler bei 360, 390 und 1280 px.
  npx vite build && npx vite preview --port 4173 &   →   python3 tests/ui/startkarte.ui.py
"""
import json, os
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
AUS = os.environ.get("SCREENS", "/tmp/startkarte")
os.makedirs(AUS, exist_ok=True)
fehler = []

def pruefe(bed, text):
    if not bed:
        fehler.append(text)
        print("FEHLT:", text)

def speicher(pg, k):
    return pg.evaluate(f"JSON.parse(localStorage.getItem({json.dumps(k)}) || 'null')")

with sync_playwright() as p:
    b = p.chromium.launch()
    for breite in (360, 390, 1280):
        hoehe = 900 if breite >= 1000 else 800
        ctx = b.new_context(viewport={"width": breite, "height": hoehe}, locale="de-DE", timezone_id="Europe/Berlin")
        pg = ctx.new_page()
        konsole = []
        pg.on("pageerror", lambda e: konsole.append(str(e)))
        pg.on("console", lambda m: konsole.append(m.text) if m.type == "error" and "Failed to load resource" not in m.text else None)
        pg.goto(BASE)
        pg.evaluate("localStorage.clear(); sessionStorage.clear(); localStorage.setItem('matheplus-start-modus','mix')")
        pg.reload(); pg.wait_for_timeout(1800)
        tag = f"{breite}"
        breit = breite >= 1100

        # ---------- neu ----------
        wahl = pg.locator("[data-startkarte='wahl']")
        pruefe(wahl.count() == 1, f"{tag}: Klassenwahl fehlt")
        pruefe(pg.locator("text=In welcher Klasse bist du?").count() == 1, f"{tag}: Frage fehlt")
        pruefe(pg.locator("[data-start-meintraining]").count() == 0, f"{tag}: alte Kachel „Mein Mathe-Training“ steht noch da")
        pruefe(pg.locator("[aria-label='Deine Klasse aufklappen']").count() == 0, f"{tag}: Schublade vor der Klassenwahl")
        pruefe(pg.locator("text=Wer bist du?").count() == 0, f"{tag}: altes Onboarding fragt noch")
        pruefe(pg.locator("[data-sk-schulart='g9'][aria-pressed='true']").count() == 1, f"{tag}: G9 nicht vorbelegt")
        pruefe(pg.locator("[data-sk-klasse]").count() == 8, f"{tag}: G9 hat nicht 8 Klassen-Knöpfe")
        if breit:
            pruefe(pg.locator(".sbb-held-karte [data-startkarte='wahl']").count() == 1, f"{tag}: Karte nicht in der Bühne")
            pruefe(wahl.bounding_box()["y"] + wahl.bounding_box()["height"] <= hoehe, f"{tag}: Klassenwahl nicht ohne Scrollen sichtbar")
        pruefe(pg.locator("[data-start-los]").count() == 1, f"{tag}: Goldknopf „Pen & Paper starten“ fehlt für neue Besucher")
        pg.screenshot(path=f"{AUS}/neu-{tag}.png")
        pg.locator("[data-sk-schulart='g8']").click(); pg.wait_for_timeout(150)
        pruefe(pg.locator("[data-sk-klasse]").count() == 7, f"{tag}: G8 hat nicht 7 Klassen-Knöpfe")
        pg.locator("[data-sk-schulart='g9']").click(); pg.wait_for_timeout(150)
        pg.locator("[data-sk-klasse='11']").click(); pg.wait_for_timeout(900)

        # ---------- Klasse gewählt ----------
        pruefe(pg.locator("[data-heute-karte]").count() == 1, f"{tag}: Heute-Karte fehlt nach der Klassenwahl")
        q = speicher(pg, "matheplus-quickfinder") or {}
        o = speicher(pg, "mm-onboarding-v1") or {}
        pruefe(q.get("schulart") == "g9" and q.get("klasse") == "11", f"{tag}: Quickfinder nicht gespeichert ({q})")
        pruefe(o.get("rolle") == "schueler" and o.get("klasse") == 11 and o.get("thema") == "analysis", f"{tag}: Onboarding nicht gespeichert ({o})")
        pruefe(pg.locator("[data-startkarte='gast']").count() == 1, f"{tag}: Konto-Zeile (Gast) fehlt")
        pruefe(pg.locator("[aria-label='Deine Klasse aufklappen']").count() == 1, f"{tag}: Schublade „Deine Klasse“ fehlt")
        # Schublade auf: der Quickfinder fragt die Klasse NICHT noch einmal (Chip statt Auswahl)
        pg.locator("[aria-label='Deine Klasse aufklappen']").click(); pg.wait_for_timeout(500)
        pruefe(pg.locator("text=Wähle dein Schulsystem und deine Klasse").count() == 0, f"{tag}: Schublade fragt die Klasse noch einmal")
        pg.locator("[aria-label='Deine Klasse zuklappen']").click(); pg.wait_for_timeout(300)
        pg.reload(); pg.wait_for_timeout(1500)
        # Wiederkehrer: kompakte Bühne, kein Goldknopf „Pen & Paper starten“ mehr (die Heute-Karte hat den Goldknopf); Masterclass-Kachel für Klasse 11
        pruefe(pg.locator("[data-start-los]").count() == 0, f"{tag}: Goldknopf der Bühne trotz bekannter Klasse")
        pruefe(pg.locator(".kk[data-abi-kachel]").count() == 1, f"{tag}: Masterclass-Kachel fehlt für die Oberstufe")
        if breit:
            pruefe(pg.locator(".sbb-held-karte [data-heute-karte]").count() == 1, f"{tag}: Heute-Karte nicht in der Bühne")
        else:
            pruefe("kompakt" in (pg.locator(".sbb-held").get_attribute("class") or ""), f"{tag}: Bühne für Wiederkehrer nicht kompakt")
        pg.screenshot(path=f"{AUS}/heute-{tag}.png")
        # Klassen-Chip → Klassenwahl mit Abbrechen
        pg.locator("[data-heute-karte] .hk-klasse").click(); pg.wait_for_timeout(300)
        pruefe(pg.locator("[data-startkarte='wahl']").count() == 1, f"{tag}: Chip öffnet die Klassenwahl nicht")
        pruefe(pg.locator("[data-sk-klasse='11'][aria-pressed='true']").count() == 1, f"{tag}: aktuelle Klasse nicht markiert")
        pg.locator(".sk-links .weg").click(); pg.wait_for_timeout(300)
        pruefe(pg.locator("[data-heute-karte]").count() == 1, f"{tag}: Abbrechen führt nicht zurück")
        # Elternteil
        pg.locator("[data-heute-karte] .hk-klasse").click(); pg.wait_for_timeout(300)
        pg.locator("[data-sk-rolle='eltern']").click(); pg.wait_for_timeout(400)
        pruefe(pg.locator("text=Mathe-Mindset-Kurs").count() >= 1 and pg.locator("[data-startkarte='rolle']").count() == 1, f"{tag}: Eltern-Zeilen fehlen")
        pg.locator("[data-startkarte='rolle'] button:has-text('Ändern')").click(); pg.wait_for_timeout(300)
        pruefe(pg.locator("[data-startkarte='wahl']").count() == 1, f"{tag}: „Ändern“ führt nicht zur Klassenwahl")

        pruefe(pg.evaluate("document.documentElement.scrollWidth - innerWidth") <= 0, f"{tag}: Seite breiter als der Bildschirm")
        pruefe(pg.locator(".sbb-schalter").count() == 0, f"{tag}: Modus-Pille steht wieder auf der Startseite")
        pruefe(not konsole, f"{tag}: Konsolenfehler {konsole[:2]}")
        ctx.close()
    b.close()

print("\n".join(fehler) if fehler else "OK")
raise SystemExit(1 if fehler else 0)
