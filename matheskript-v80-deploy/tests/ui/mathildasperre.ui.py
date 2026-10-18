"""Browser-Test Mathilda-Sperre: Klick auf Mathilda fragt das Passwort „skript“, falsches Passwort bleibt gesperrt,
richtiges öffnet das Ziel, Direktlink /mathilda bleibt offen, Abbrechen bleibt auf der Seite.
  npx vite build && npx vite preview --port 4173 &   →   python3 tests/ui/mathildasperre.ui.py
"""
import os
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
fehler = []
def pruefe(bed, text):
    if not bed: fehler.append(text); print("FEHLT:", text)

with sync_playwright() as p:
    b = p.chromium.launch()
    for breite, hoehe in ((390, 844), (1280, 800)):
        ctx = b.new_context(viewport={"width": breite, "height": hoehe}, locale="de-DE")
        page = ctx.new_page()
        konsole = []
        page.on("pageerror", lambda e: konsole.append(f"pageerror: {e}"))
        page.goto(BASE); page.evaluate("localStorage.clear(); sessionStorage.clear()"); page.reload(); page.wait_for_timeout(800)

        # Klick (über die Navigation) → Passwortfenster
        page.evaluate("window.__mmGehe({ ansicht: 'analyse', foto: 'blatt' })"); page.wait_for_timeout(300)
        dlg = page.locator("[data-sperre-dialog]")
        pruefe(dlg.count() == 1, f"{breite}: Passwortfenster fehlt")
        pruefe(page.evaluate("location.pathname") != "/mathilda", f"{breite}: Seite ohne Passwort gewechselt")

        # falsches Passwort
        page.locator("[data-sperre-dialog] input").fill("falsch"); page.get_by_role("button", name="Entsperren").click(); page.wait_for_timeout(300)
        pruefe(page.get_by_text("Das Passwort stimmt nicht.").count() == 1, f"{breite}: Fehlermeldung fehlt")
        pruefe(dlg.count() == 1, f"{breite}: Fenster nach falschem Passwort weg")

        # Abbrechen
        page.get_by_role("button", name="Abbrechen").click(); page.wait_for_timeout(200)
        pruefe(dlg.count() == 0, f"{breite}: Abbrechen schließt nicht")

        # richtiges Passwort (Groß-/Kleinschreibung egal) → Ziel öffnet sich
        page.evaluate("window.__mmGehe({ ansicht: 'analyse', foto: 'blatt' })"); page.wait_for_timeout(300)
        page.locator("[data-sperre-dialog] input").fill("Skript"); page.get_by_role("button", name="Entsperren").click(); page.wait_for_timeout(700)
        pruefe(dlg.count() == 0, f"{breite}: Fenster nach richtigem Passwort noch da")
        pruefe(page.evaluate("location.pathname") == "/mathilda", f"{breite}: Mathilda öffnet nicht ({page.evaluate('location.pathname')})")

        # danach frei für die Sitzung
        page.evaluate("window.__mmGehe({ ansicht: 'start' })"); page.wait_for_timeout(300)
        page.evaluate("window.__mmGehe({ ansicht: 'klausurbriefkasten' })"); page.wait_for_timeout(500)
        pruefe(dlg.count() == 0, f"{breite}: zweiter Mathilda-Klick fragt erneut")

        # Direktlink in frischer Sitzung bleibt offen
        ctx2 = b.new_context(viewport={"width": breite, "height": hoehe}, locale="de-DE")
        seite2 = ctx2.new_page()
        seite2.goto(BASE + "mathilda"); seite2.wait_for_timeout(1200)
        pruefe(seite2.locator("[data-sperre-dialog]").count() == 0, f"{breite}: Direktlink zeigt Passwortfenster")
        pruefe(seite2.evaluate("location.pathname") == "/mathilda", f"{breite}: Direktlink bleibt nicht stehen")

        pruefe(not konsole, f"{breite}: Konsolenfehler {konsole}")
        ctx.close(); ctx2.close()
    b.close()

print("FEHLER:" if fehler else "OK – Mathilda-Sperre geprüft", fehler or "")
raise SystemExit(1 if fehler else 0)
