"""Browser-Test „Mein Mathe-Training“ (/mein-mathe-training): Konto-Pflicht, Test-Account, Tagesplan mit Einträgen,
Fehler-Karte, Eintrag starten (Aufgabenlauf), Budget umschalten, Themen (3 aktiv, Warteschlange), Thema hinzufügen,
Woche, Stand. Prüft bei 360, 390 und 1280 px: keine Seitenüberbreite, keine Konsolenfehler, Screenshots.
  npm run build && npx vite preview --port 4173 &   →   python3 tests/ui/meintraining.ui.py
"""
import os, sys
from playwright.sync_api import sync_playwright
from startkarte_hilfe import schublade_auf

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
AUS = os.environ.get("SCREENS", "/tmp/mt")
os.makedirs(AUS, exist_ok=True)
fehler = []

def pruefe(bed, text):
    if not bed:
        fehler.append(text)
        print("FEHLT:", text)

with sync_playwright() as p:
    b = p.chromium.launch()
    for breite in (360, 390, 1280):
        ctx = b.new_context(viewport={"width": breite, "height": 900}, device_scale_factor=2, timezone_id="Europe/Berlin", locale="de-DE")
        page = ctx.new_page()
        page.on("dialog", lambda d: d.accept())
        konsole = []
        page.on("pageerror", lambda e: konsole.append(f"pageerror: {e}"))
        page.on("console", lambda m: konsole.append(m.text) if m.type == "error" and "net::" not in m.text and "Failed to load resource" not in m.text else None)
        page.goto(BASE)
        page.evaluate("localStorage.clear(); localStorage.setItem('mm-start-app','1'); sessionStorage.clear(); localStorage.setItem('mm-onboarding-v1', JSON.stringify({uebersprungen:true}));")
        page.reload(); page.wait_for_timeout(800)

        def breite_ok(wo):
            sw = page.evaluate("document.documentElement.scrollWidth")
            pruefe(sw <= breite, f"{breite}: Überbreite bei {wo}: {sw}")

        # Startseite (seit 21.10. Start-Karte): nach der Klassenwahl ohne Konto die Zeile mit Anmelden und Test-Account
        schublade_auf(page, auswahl=False)
        kachel = page.locator("[data-startkarte='gast']")
        pruefe(kachel.count() == 1, f"{breite}: Konto-Zeile der Start-Karte fehlt")
        pruefe(kachel.locator("[data-testkonto]").count() == 1, f"{breite}: Test-Account-Knopf fehlt")
        breite_ok("Startseite")
        page.screenshot(path=f"{AUS}/{breite}-1-start.png")

        # Seite ohne Konto: Konto-Pflicht
        page.goto(BASE + "mein-mathe-training"); page.wait_for_timeout(900)
        pruefe(page.get_by_role("heading", name="Mein Mathe-Training").count() >= 1, f"{breite}: Seitentitel fehlt")
        pruefe(page.get_by_text("Dein Training braucht ein Konto").count() == 1, f"{breite}: Konto-Hinweis fehlt")
        page.get_by_role("button", name="Test-Account starten").click(); page.wait_for_timeout(1200)

        # Tagesplan mit Beispieldaten
        pruefe(page.get_by_text("Test-Account:", exact=False).count() >= 1, f"{breite}: Test-Account-Hinweis fehlt")
        pruefe(page.get_by_text("Dein Tagesplan ·", exact=False).count() >= 1, f"{breite}: Tagesplan fehlt")
        starten = page.get_by_role("button", name="Starten", exact=True)
        pruefe(starten.count() >= 2, f"{breite}: zu wenige startbare Einträge ({starten.count()})")
        pruefe(page.get_by_text("Wiederkehrender Fehler", exact=False).count() >= 1, f"{breite}: Fehler-Karte fehlt")
        pruefe(page.get_by_text("Platzhalter · eigenes Video folgt").count() >= 1, f"{breite}: Platzhalter-Video fehlt")
        pruefe(page.get_by_text("Nachholen · von", exact=False).count() >= 1, f"{breite}: Nachhol-Eintrag fehlt")
        pruefe(page.get_by_text("Aufs Blatt: eine Aufgabe von Hand").count() >= 1, f"{breite}: Blatt-Eintrag fehlt")
        breite_ok("Tagesplan")
        page.screenshot(path=f"{AUS}/{breite}-2-tagesplan.png", full_page=True)

        # Eintrag starten → Aufgabenlauf → zurück
        starten.first.click(); page.wait_for_timeout(700)
        pruefe(page.get_by_role("button", name="Prüfen").count() >= 1, f"{breite}: kein Aufgabenlauf")
        breite_ok("Aufgabenlauf")
        page.screenshot(path=f"{AUS}/{breite}-3-lauf.png")
        page.get_by_role("button", name="‹ Zurück zum Tagesplan").click(); page.wait_for_timeout(400)

        # Budget: 10 Minuten → weniger Einträge
        n8 = page.locator("[aria-label$='abhaken'], [aria-label$='als offen markieren']").count()
        page.get_by_role("button", name="10 Min.").click(); page.wait_for_timeout(500)
        n10 = page.locator("[aria-label$='abhaken'], [aria-label$='als offen markieren']").count()
        pruefe(0 < n10 < n8, f"{breite}: Budget 10 Minuten greift nicht ({n8} → {n10})")
        page.get_by_role("button", name="8 Einträge").click(); page.wait_for_timeout(500)

        # Abhaken ohne Aufgaben (Blatt): Erledigt ✓
        erledigt = page.get_by_role("button", name="Erledigt ✓")
        if erledigt.count():
            vorher = page.get_by_text("heute erledigt").locator("xpath=preceding-sibling::p").inner_text()
            erledigt.first.click(); page.wait_for_timeout(400)
            nachher = page.get_by_text("heute erledigt").locator("xpath=preceding-sibling::p").inner_text()
            pruefe(vorher != nachher, f"{breite}: Abhaken zählt nicht ({vorher} → {nachher})")

        # Themen: 3 in Arbeit, einer wartet; Thema hinzufügen
        pruefe(page.get_by_role("heading", name="In Arbeit · 3 von 3").count() == 1, f"{breite}: drei aktive Themen fehlen")
        pruefe(page.get_by_text("Danach · 1 von 3").count() == 1, f"{breite}: Warteschlange fehlt")
        pruefe(page.get_by_text("Quadratische Funktionen und Gleichungen").count() >= 1, f"{breite}: Thema quad fehlt")
        page.get_by_role("button", name="Kl. 8", exact=True).scroll_into_view_if_needed()
        page.get_by_role("button", name="Kl. 8", exact=True).click(); page.wait_for_timeout(300)
        page.get_by_role("button", name="Lineare Funktionen", exact=False).first.click(); page.wait_for_timeout(300)
        breite_ok("Thema hinzufügen")
        page.screenshot(path=f"{AUS}/{breite}-4-thema.png", full_page=True)
        page.get_by_role("button", name="Ganzes Kapitel ins Training").click(); page.wait_for_timeout(600)
        pruefe(page.get_by_text("Danach · 2 von 3").count() == 1, f"{breite}: neues Thema nicht in der Warteschlange")
        page.get_by_role("button", name="Kl. 8", exact=True).click()
        page.get_by_role("button", name="Lineare Funktionen", exact=False).first.click(); page.wait_for_timeout(300)
        pruefe(page.get_by_text("schon dabei").count() >= 1, f"{breite}: Doppeltes Kapitel wird nicht erkannt")

        # Vorschläge, Woche, Stand
        pruefe(page.get_by_role("heading", name="Vorschläge für dein Training").count() == 1, f"{breite}: Vorschläge fehlen")
        pruefe(page.get_by_role("heading", name="Was war, was kommt").count() == 1, f"{breite}: Woche fehlt")
        pruefe(page.get_by_text("Tagesplan:", exact=False).count() >= 1, f"{breite}: Tagesplan im Kalender fehlt")
        pruefe(page.get_by_role("heading", name="Wo du stehst").count() == 1, f"{breite}: Stand fehlt")
        pruefe(page.get_by_text("Meine Lehrkraft darf Einträge in meinen Tagesplan legen.").count() == 1, f"{breite}: Freigabe-Schalter fehlt")
        breite_ok("ganze Seite")
        page.screenshot(path=f"{AUS}/{breite}-5-unten.png", full_page=True)

        # Startseite angemeldet: Kachel zeigt Stand; Hauptmenü hat „Mein Mathe-Training“
        page.goto(BASE); page.wait_for_timeout(900)
        konto = page.locator("[data-startkarte='konto']")
        pruefe(konto.get_by_text("Mein Mathe-Training").count() == 1, f"{breite}: Start-Karte zeigt keinen Stand")
        pruefe(konto.get_by_role("button", name="Tagesplan ›").count() == 1, f"{breite}: Knopf zum Tagesplan fehlt")
        breite_ok("Startseite angemeldet")
        page.screenshot(path=f"{AUS}/{breite}-6-start-angemeldet.png")

        # Alte Adresse /trainingsplan landet auf der neuen Seite
        page.goto(BASE + "trainingsplan"); page.wait_for_timeout(900)
        pruefe(page.get_by_text("Dein Tagesplan ·", exact=False).count() >= 1, f"{breite}: /trainingsplan zeigt nicht den Tagesplan")

        pruefe(not konsole, f"{breite}: Konsolenfehler: {konsole[:3]}")
        ctx.close()
    b.close()

print("Fehler:", len(fehler))
for f in fehler: print(" -", f)
sys.exit(1 if fehler else 0)
