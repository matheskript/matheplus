"""Browser-Test Lernpfad: Einrichtung → Standortcheck → Plan → Einheit (Entdecken, Rechnen, Trainieren, Rückmeldung).
Prüft bei 390 px: keine Seitenüberbreite, keine Konsolenfehler, Speicherung über Reload, Rückweg aus dem Werkzeug.
  npm run build && npx vite preview --port 4173 &   →   python3 tests/ui/lernpfad.ui.py
"""
import os, sys, json
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
fehler = []

def pruefe(bed, text):
    if not bed:
        fehler.append(text)
        print("FEHLT:", text)

with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, timezone_id="Europe/Berlin", locale="de-DE")
    page = ctx.new_page()
    konsole = []
    page.on("pageerror", lambda e: konsole.append(f"pageerror: {e}"))
    page.on("console", lambda m: konsole.append(m.text) if m.type == "error" and "net::" not in m.text and "Failed to load resource" not in m.text else None)
    page.goto(BASE)
    page.evaluate("localStorage.clear(); sessionStorage.clear();")
    page.reload()
    page.wait_for_timeout(600)

    def breite_ok(wo):
        sw = page.evaluate("document.documentElement.scrollWidth")
        pruefe(sw <= 390, f"Überbreite bei {wo}: {sw}")

    # Startseite: Block „Dein Plan“ mit Standortcheck-Knopf
    pruefe(page.get_by_text("Wo stehst du wirklich?").count() == 1, "Startseiten-Block „Dein Plan“ fehlt")
    page.get_by_role("button", name="Standortcheck starten").first.click()
    page.wait_for_timeout(400)
    pruefe(page.get_by_text("1 · Welcher Bereich?").count() == 1, "Einrichtung fehlt")
    breite_ok("Einrichtung")
    # Ziel Klausur mit Termin in 20 Tagen, 2 pro Woche
    page.get_by_role("button", name="Klausur oder Klassenarbeit").click()
    import datetime
    d = (datetime.date.today() + datetime.timedelta(days=20)).isoformat()
    page.locator("input[type=date]").fill(d)
    page.get_by_role("button", name="2 pro Woche").click()
    page.wait_for_timeout(200)
    pruefe("Einheiten" in page.locator("[role=status]").first.inner_text(), "Terminhinweis fehlt")
    page.get_by_role("button", name="Standortcheck starten (ca. 15 Minuten)").click()
    page.wait_for_timeout(400)
    pruefe(page.get_by_text("Aufgabe 1 von").count() == 1, "Standortcheck startet nicht")
    breite_ok("Standortcheck")
    # Aufgaben: erste richtig lösen (Lösung steht im DOM nicht – wir tippen Unsinn und gehen weiter), zählt als offen
    n = 0
    while n < 20:
        n += 1
        eingabe = page.locator("input[type=text], input[type=number], input:not([type])").first
        if page.get_by_role("button", name="Prüfen").count():
            if eingabe.count():
                eingabe.fill("0")
            else:
                page.get_by_role("radio").first.check()
            page.get_by_role("button", name="Prüfen").click()
            page.wait_for_timeout(150)
        knopf = page.get_by_role("button", name="Weiter").first if page.get_by_role("button", name="Weiter").count() else page.get_by_role("button", name="Auswertung").first
        knopf.click()
        page.wait_for_timeout(150)
        if page.get_by_role("button", name="Weiter zum Ergebnis").count():
            break
    pruefe(page.get_by_role("button", name="Weiter zum Ergebnis").count() == 1, "Check-Auswertung fehlt")
    breite_ok("Check-Auswertung")
    page.get_by_role("button", name="Weiter zum Ergebnis").click()
    page.wait_for_timeout(300)
    pruefe(page.get_by_text("Dein Standort").count() == 1, "Standort-Ergebnis fehlt")
    pruefe(page.get_by_text("Station 1 · Kennen").count() == 1, "Stationsliste fehlt")
    page.get_by_role("button", name="Plan anlegen").click()
    page.wait_for_timeout(400)
    pruefe(page.get_by_text("Diese Woche", exact=True).count() == 1, "Wochenplan fehlt")
    pruefe(page.get_by_text("Analysis · Woche 1 von").count() == 1, "Wochenzähler fehlt")
    breite_ok("Wochenplan")
    # Speicherung: Reload, Plan bleibt
    page.reload(); page.wait_for_timeout(700)
    page.evaluate("window.__mmGehe({ ansicht: 'lernpfad' })"); page.wait_for_timeout(400)
    pruefe(page.get_by_text("Diese Woche", exact=True).count() == 1, "Plan nach Reload weg")
    gespeichert = page.evaluate("JSON.parse(localStorage.getItem('matheskript-lernstand-v1')).pfad")
    pruefe(gespeichert and gespeichert["pfad"] == "analysis" and gespeichert["proWoche"] >= 2, f"Lernstand ohne Pfad: {gespeichert}")
    # Einheit öffnen
    page.get_by_role("button", name="Geradengleichung öffnen").click(); page.wait_for_timeout(300)
    pruefe(page.get_by_text("Worum es geht").count() == 1, "Schritt Entdecken fehlt")
    breite_ok("Einheit Entdecken")
    # Rückweg: Werkzeug öffnen → „zurück“ in der Werkzeugleiste
    page.get_by_role("button", name="Parabeln öffnen").click(); page.wait_for_timeout(500)
    pruefe(page.locator("[data-uebergabe-hinweis]").count() == 1, "Hinweis „Übernommen aus Lernpfad“ fehlt")
    page.get_by_role("button", name="zurück").first.click(); page.wait_for_timeout(400)
    pruefe(page.get_by_text("Worum es geht").count() == 1, "Rückweg aus dem Werkzeug landet nicht in der Einheit")
    page.get_by_role("button", name="Verstanden – weiter zum Rechnen").click(); page.wait_for_timeout(200)
    pruefe(page.get_by_text("Deine Aufgabe im Werkzeug").count() == 1, "Schritt Rechnen fehlt")
    page.get_by_role("button", name="Erledigt – weiter zum Trainieren").click(); page.wait_for_timeout(200)
    pruefe(page.get_by_text("Trainieren im Werkzeug").count() == 1, "Schritt Trainieren (ohne Generator) fehlt")
    page.get_by_role("button", name="Drei Aufgaben geschafft").click(); page.wait_for_timeout(300)
    pruefe(page.get_by_text("Einheit abgeschlossen").count() == 1, "Rückmeldung fehlt")
    pruefe(page.get_by_text("Als Nächstes").count() == 1, "Nächste Einheit fehlt")
    breite_ok("Rückmeldung")
    page.get_by_role("button", name="Nächste Einheit starten").click(); page.wait_for_timeout(400)
    pruefe(page.get_by_text("Parabeln").first.count() >= 1 and page.get_by_text("Worum es geht").count() == 1, "Sprung in die nächste Einheit fehlt")
    page.get_by_role("button", name="Verstanden – weiter zum Rechnen").click(); page.wait_for_timeout(150)
    page.get_by_role("button", name="Erledigt – weiter zum Trainieren").click(); page.wait_for_timeout(150)
    pruefe(page.get_by_text("Fünf Aufgaben").count() == 1, "Trainieren mit Generator fehlt")
    page.get_by_role("button", name="Los geht’s").click(); page.wait_for_timeout(300)
    pruefe(page.get_by_text("Aufgabe 1 von 5").count() == 1, "Fünf Aufgaben starten nicht")
    breite_ok("Trainieren")
    # Startseite zeigt Ring und nächste Einheit
    page.evaluate("window.__mmGehe({ ansicht: 'start' })"); page.wait_for_timeout(500)
    pruefe(page.get_by_text("Dein Plan · Analysis").count() == 1, "Startseiten-Block mit Plan fehlt")
    pruefe(page.get_by_role("button", name="Einheit starten").count() == 1, "Knopf „Einheit starten“ fehlt")
    breite_ok("Startseite mit Plan")
    # Englisch: keine fehlenden Texte in den neuen Seiten
    page.evaluate("localStorage.setItem('mm-sprache','en')"); page.reload(); page.wait_for_timeout(900)
    page.evaluate("window.__i18nFehlt.clear(); window.__mmGehe({ ansicht: 'lernpfad' })"); page.wait_for_timeout(600)
    page.get_by_role("button", name="Adjust plan").click(); page.wait_for_timeout(200)
    page.locator("button[aria-label$='öffnen'], button[aria-label^='Open ']").last.click(); page.wait_for_timeout(400)
    page.evaluate("window.__mmGehe({ ansicht: 'start' })"); page.wait_for_timeout(400)
    fehlt = page.evaluate("Array.from(window.__i18nFehlt || [])")
    import re
    fehlt = [f for f in fehlt if len(f.strip()) > 3 and not re.search(r"[=^]|\d", f) and not f.startswith(".")]   # Aufgabentexte der Generatoren sind nur deutsch
    pruefe(not fehlt, f"Englisch, fehlende Texte: {fehlt[:30]}")
    page.evaluate("localStorage.setItem('mm-sprache','de')")

    pruefe(not konsole, f"Konsolenfehler: {konsole[:5]}")
    b.close()

print("FEHLER" if fehler else "OK", len(fehler))
sys.exit(1 if fehler else 0)
