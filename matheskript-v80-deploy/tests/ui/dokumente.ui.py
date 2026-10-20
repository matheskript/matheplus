"""Browser-Test: Arbeitsmenü mit D „Entwürfe“ und E „Weitere Seiten“ als Aufklapp-Gruppen, F „Dokumente“ ganz unten,
und die Seite „Dokumente“ (eine Box je Dokument mit Art, Seitenzahl, Zweck) hinter dem gemeinsamen Passwort.
  npx vite build && npx vite preview --port 4173 &   →   python3 tests/ui/dokumente.ui.py
  BILDER=/pfad  speichert Screenshots.
"""
import os
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
BILDER = os.environ.get("BILDER")
PW = "skript"
fehler = []
def pruefe(bed, text):
    if not bed:
        fehler.append(text); print("FEHLT:", text)

def neu(b, breite):
    ctx = b.new_context(viewport={"width": breite, "height": 820}, locale="de-DE")
    page = ctx.new_page()
    konsole = []
    page.on("pageerror", lambda e: konsole.append(f"pageerror: {e}"))
    page.goto(BASE)
    page.evaluate("localStorage.clear(); sessionStorage.clear(); localStorage.setItem('mm-onboarding-v1', JSON.stringify({uebersprungen:true}));")
    page.goto(BASE); page.wait_for_timeout(1200)
    return ctx, page, konsole

def menue_auf(page):
    am = page.locator("[data-arbeitsmenue]"); am.scroll_into_view_if_needed(); am.click(); page.wait_for_timeout(300)
    return page.locator("[role='dialog'][aria-label='Arbeitsmenü']")

with sync_playwright() as p:
    b = p.chromium.launch()
    for breite in (390, 1280):
        tag = str(breite)
        ctx, page, konsole = neu(b, breite)
        dlg = menue_auf(page)
        pruefe(dlg.count() == 1, f"{tag}: Arbeitsmenü geht nicht auf")
        # Reihenfolge der Buchstaben
        kreise = page.evaluate("""() => [...document.querySelectorAll("[role='dialog'][aria-label='Arbeitsmenü'] button > span:first-child, [role='dialog'][aria-label='Arbeitsmenü'] button > span > span:first-child")].map(e => e.textContent.trim()).filter(t => /^[A-F]$/.test(t))""")
        pruefe(kreise == ["A", "B", "C", "D", "E", "F"], f"{tag}: Buchstaben {kreise} statt A–F")
        txt = dlg.inner_text()
        pruefe("Entwürfe" in txt and "Weitere Seiten" in txt and "Dokumente" in txt, f"{tag}: Einträge fehlen")
        pruefe("ENTWÜRFE" not in txt and "WEITERE SEITEN" not in txt, f"{tag}: alte Zwischenüberschriften stehen noch da")
        # D und E sind eingeklappt
        d = page.locator("[data-arbeitsmenue-entwuerfe]"); e = page.locator("[data-arbeitsmenue-weitere]")
        pruefe(d.count() == 1 and e.count() == 1, f"{tag}: Gruppenknöpfe fehlen")
        pruefe(page.locator("[data-arbeitsmenue-seite^='entwurf-']").count() == 0, f"{tag}: Entwürfe sind schon aufgeklappt")
        pruefe(page.locator("[data-arbeitsmenue-seite='nachhilfekurs']").count() == 0, f"{tag}: Weitere Seiten sind schon aufgeklappt")
        pruefe(d.get_attribute("aria-expanded") == "false" and e.get_attribute("aria-expanded") == "false", f"{tag}: aria-expanded")
        # D aufklappen
        d.click(); page.wait_for_timeout(250)
        pruefe(page.locator("[data-arbeitsmenue-seite^='entwurf-']").count() == 6, f"{tag}: Entwürfe zeigen nicht 6 Seiten")
        pruefe(d.get_attribute("aria-expanded") == "true", f"{tag}: D aria-expanded nach Klick")
        # E aufklappen (D bleibt offen)
        e.click(); page.wait_for_timeout(250)
        pruefe(page.locator("[data-arbeitsmenue-seite='nachhilfekurs']").count() == 1 and page.locator("[data-arbeitsmenue-seite='elternabend']").count() == 1, f"{tag}: Weitere Seiten zeigen nicht alle")
        if BILDER: page.screenshot(path=f"{BILDER}/dok-{tag}-menue-offen.png")
        # D zuklappen
        d.click(); page.wait_for_timeout(250)
        pruefe(page.locator("[data-arbeitsmenue-seite^='entwurf-']").count() == 0, f"{tag}: Entwürfe klappen nicht zu")
        # F Dokumente: Passwortfeld, falsch, richtig
        page.locator("[data-arbeitsmenue-seite='dokumente']").click(); page.wait_for_timeout(250)
        form = page.locator("[data-arbeitsmenue-passwort]")
        pruefe(form.count() == 1, f"{tag}: Passwortfeld erscheint nicht")
        if form.count():
            pruefe(page.evaluate("(() => { const r = document.querySelector('[data-arbeitsmenue-passwort]').getBoundingClientRect(); return r.top >= 0 && r.bottom <= window.innerHeight + 1; })()"), f"{tag}: Passwortfeld liegt nicht im sichtbaren Bereich")
            form.locator("input").fill("falsch"); form.locator("button[type=submit]").click(); page.wait_for_timeout(300)
            pruefe(page.locator("[data-arbeitsmenue-passwort] [role=alert]").count() == 1, f"{tag}: kein Hinweis bei falschem Passwort")
            pruefe("dokumente" not in page.url, f"{tag}: Seite öffnet trotz falschem Passwort")
            form.locator("input").fill(PW); form.locator("button[type=submit]").click(); page.wait_for_timeout(1500)
        pruefe(page.url.rstrip("/").endswith("/dokumente"), f"{tag}: URL ist {page.url}")
        boxen = page.locator("[data-dokument]")
        pruefe(boxen.count() == 6, f"{tag}: {boxen.count()} Boxen statt 6")
        seiten = page.locator("[data-dokument-seiten]").all_inner_texts()
        pruefe("50 Seiten" in seiten and "70 Seiten" in seiten and "8 Seiten" in seiten, f"{tag}: Seitenzahlen {seiten}")
        pruefe(page.locator("[data-dokument='schulbuch-ableitungen']").inner_text().count("Amazon") >= 1, f"{tag}: Zweck Amazon fehlt")
        pruefe(page.locator("[data-dokument-oeffnen]").count() == 2, f"{tag}: PDF-Knöpfe")
        pruefe(page.locator("[data-dokument-oeffnen]").first.get_attribute("href") == "/buecher/ableitungen/Ableitungen.pdf", f"{tag}: PDF-Link")
        pruefe(page.evaluate("document.documentElement.scrollWidth <= window.innerWidth + 1"), f"{tag}: Seite scrollt seitlich")
        if BILDER: page.screenshot(path=f"{BILDER}/dok-{tag}-seite.png", full_page=True)
        # Menü auf der Dokumente-Seite weiter da (Fußzeile sichtbar)
        pruefe(page.locator("[data-arbeitsmenue]").count() == 1, f"{tag}: Arbeitsmenü fehlt auf der Dokumente-Seite")
        # Direktlink ohne Sitzung: Passwort-Tor
        ctx2, page2, konsole2 = neu(b, breite)
        page2.goto(BASE + "dokumente"); page2.wait_for_timeout(1500)
        pruefe(page2.locator("input[type=password]").count() == 1 and page2.locator("[data-dokument]").count() == 0, f"{tag}: Direktlink ohne Passwort zeigt Inhalt")
        pruefe(not konsole2, f"{tag}: Konsolenfehler (Tor) {konsole2}")
        ctx2.close()
        pruefe(not konsole, f"{tag}: Konsolenfehler {konsole}")
        ctx.close()
    b.close()
print(f"FEHLER: {len(fehler)}") if fehler else print("Alles grün.")
raise SystemExit(1 if fehler else 0)
