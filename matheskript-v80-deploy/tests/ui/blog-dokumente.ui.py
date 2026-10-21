"""Browser-Test: Ganz unten auf der Blog-Übersicht stehen alle Dokumente der Seite „Dokumente“ mit ihren Knöpfen
(Öffnen · Download · Cover). Der Blog ist öffentlich, die Dokumente nicht: ohne Passwort nur ein kleines Feld.
  npx vite build && npx vite preview --port 4173 &   →   python3 tests/ui/blog-dokumente.ui.py
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
    page.goto(BASE + "blog"); page.wait_for_timeout(1500)
    return ctx, page, konsole

with sync_playwright() as p:
    b = p.chromium.launch()
    for breite in (390, 1280):
        tag = str(breite)
        ctx, page, konsole = neu(b, breite)
        pruefe(page.locator("[data-blog-liste]").count() == 1, f"{tag}: Blog-Übersicht fehlt")
        # ohne Passwort: nur das kleine Feld, keine Karte, keine Datei-Links
        pruefe(page.locator("[data-blog-dokumente]").count() == 1, f"{tag}: Dokumente-Abschnitt fehlt")
        pruefe(page.locator("[data-blog-dokumente-tor]").count() == 1, f"{tag}: Passwortfeld fehlt")
        # Ohne Passwort (seit 21.10.): nur die zwei Leseproben mit „Bald auf Amazon“ – nie die ganzen Bücher
        pruefe(page.locator("[data-dokument]").count() == 2, f"{tag}: ohne Passwort {page.locator('[data-dokument]').count()} Karten statt 2 Leseproben")
        pruefe(page.locator("[data-dokument-amazon]").count() == 2, f"{tag}: „Bald auf Amazon“ fehlt")
        pruefe(page.locator("a[href*='/druck/'], a[href*='/buecher/']").count() == 0, f"{tag}: Buch-PDF-Links ohne Passwort im DOM")
        pruefe(all(h.startswith("/leseprobe/") for h in page.locator("a[href*='.pdf']").evaluate_all("as => as.map(a => a.getAttribute('href'))")), f"{tag}: öffentliche PDF-Links außerhalb /leseprobe/")
        # steht unter „Alle Beiträge“
        pruefe(page.evaluate("document.querySelector('[data-blog-dokumente]').getBoundingClientRect().top > document.querySelector('.bl-alle').getBoundingClientRect().bottom - 1"), f"{tag}: Dokumente nicht unter „Alle Beiträge“")
        # falsches Passwort
        tor = page.locator("[data-blog-dokumente-tor]")
        tor.locator("input").fill("falsch"); tor.locator("button[type=submit]").click(); page.wait_for_timeout(300)
        pruefe(page.locator("[data-blog-dokumente-tor] [role=alert]").count() == 1, f"{tag}: kein Hinweis bei falschem Passwort")
        pruefe(page.locator("[data-dokument]").count() == 2, f"{tag}: Karten trotz falschem Passwort")
        # richtiges Passwort
        tor.locator("input").fill(PW); tor.locator("button[type=submit]").click(); page.wait_for_timeout(1500)
        pruefe(page.locator("[data-blog-dokumente-tor]").count() == 0, f"{tag}: Passwortfeld bleibt stehen")
        pruefe(page.locator("[data-blog-dokumente] [data-dokument]").count() == 12, f"{tag}: {page.locator('[data-dokument]').count()} Karten statt 2 + 10")
        pruefe(page.locator("[data-dokument-oeffnen]").count() == 8 and page.locator("[data-dokument-laden]").count() == 8, f"{tag}: Öffnen/Download-Knöpfe")
        cov = page.locator("[data-dokument-cover]")
        pruefe(cov.count() == 2, f"{tag}: {cov.count()} Cover-Knöpfe statt 2")
        pruefe(page.locator("[data-dokument='schulbuch-ableitungen'] [data-dokument-laden]").get_attribute("download") == "Ableitungen.pdf", f"{tag}: Download-Name")
        pruefe(page.locator("[data-dokument='schulbuch-ableitungen'] [data-dokument-oeffnen]").get_attribute("href") == "/buecher/ableitungen/Ableitungen.pdf", f"{tag}: PDF-Link")
        # alle Knöpfe aller Karten liegen im Kartenrahmen
        pruefe(page.evaluate("[...document.querySelectorAll('[data-dokument]')].every(k => { const r = k.getBoundingClientRect(); return [...k.querySelectorAll('.dk-k')].every(x => { const q = x.getBoundingClientRect(); return q.left >= r.left - 1 && q.right <= r.right + 1; }); })"), f"{tag}: Knöpfe ragen aus der Karte")
        # Karten liegen innerhalb des Blog-Streifens, eine Spalte
        pruefe(page.evaluate("(() => { const bl = document.querySelector('.bl').getBoundingClientRect(); const ks = [...document.querySelectorAll('[data-dokument]')].map(k => k.getBoundingClientRect()); return ks.every(r => r.left >= bl.left - 1 && r.right <= bl.right + 1) && new Set(ks.map(r => Math.round(r.left))).size === 1; })()"), f"{tag}: Karten nicht einspaltig im Streifen")
        # Pfeil klappt Zweck auf und zu
        k = page.locator("[data-dokument='schulbuch-ableitungen'] [data-dokument-mehr]"); k.click(); page.wait_for_timeout(250)
        pruefe(page.locator("[data-dokument-info]").count() == 1, f"{tag}: Pfeil klappt nicht auf")
        k.click(); page.wait_for_timeout(250)
        pruefe(page.locator("[data-dokument-info]").count() == 0, f"{tag}: Pfeil klappt nicht zu")
        pruefe(page.evaluate("document.documentElement.scrollWidth <= window.innerWidth + 1"), f"{tag}: Seite scrollt seitlich")
        if BILDER:
            page.locator("[data-blog-dokumente]").scroll_into_view_if_needed()
            page.screenshot(path=f"{BILDER}/blog-dok-{tag}.png", full_page=True)
        # Beitrag: kein Dokumente-Abschnitt
        page.locator("[data-blog-box]").first.click(); page.wait_for_timeout(500)
        pruefe(page.locator("[data-blog-beitrag]").count() == 1 and page.locator("[data-blog-dokumente]").count() == 0, f"{tag}: Dokumente stehen im Beitrag")
        pruefe(not konsole, f"{tag}: Konsolenfehler {konsole}")
        ctx.close()
    b.close()
print(f"FEHLER: {len(fehler)}") if fehler else print("Alles grün.")
raise SystemExit(1 if fehler else 0)
