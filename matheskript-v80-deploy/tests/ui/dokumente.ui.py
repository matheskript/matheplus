"""Browser-Test: Arbeitsmenü mit D „Entwürfe“ und E „Weitere Seiten“ als Aufklapp-Gruppen, F „Dokumente“ ganz unten,
und die Seite „Dokumente“ (eine Box je Dokument mit Art, Seitenzahl, Zweck) hinter dem gemeinsamen Passwort.
  npx vite build && npx vite preview --port 4173 &   →   python3 tests/ui/dokumente.ui.py
  BILDER=/pfad  speichert Screenshots.
"""
import os, json, subprocess
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
BILDER = os.environ.get("BILDER")
PW = "skript"
WURZEL = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")
# Erwartungen aus den Listen ableiten (src/dokumente.js, src/seitenKonstanten.js) statt fest einzutragen –
# die Seite wird oft umgebaut (z. B. 20./21.10.: Cover-Knopf statt Umschlag-Boxen).
_js = ("import {DOKUMENTE} from './src/dokumente.js'; import {ENTWUERFE} from './src/seitenKonstanten.js';"
       "console.log(JSON.stringify({dok: DOKUMENTE.map(d=>({id:d.id,seiten:d.seiten,datei:d.datei,cover:d.cover||null,zwecke:d.zwecke})), entwuerfe: ENTWUERFE.length}))")
_l = json.loads(subprocess.check_output(["node", "--input-type=module", "-e", _js], cwd=WURZEL, text=True))
DOK, N_ENTWUERFE = _l["dok"], _l["entwuerfe"]
MIT_DATEI = [d for d in DOK if d["datei"]]
MIT_COVER = [d for d in MIT_DATEI if d["cover"]]
seitentext = lambda n: f"{n} {'Seite' if n == 1 else 'Seiten'}"
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
    page.evaluate("localStorage.clear(); localStorage.setItem('mm-start-app','1'); sessionStorage.clear(); localStorage.setItem('mm-onboarding-v1', JSON.stringify({uebersprungen:true}));")
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
        pruefe(page.locator("[data-arbeitsmenue-seite^='entwurf-']").count() == N_ENTWUERFE, f"{tag}: Entwürfe zeigen nicht {N_ENTWUERFE} Seiten")
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
        pruefe(boxen.count() == len(DOK), f"{tag}: {boxen.count()} Karten statt {len(DOK)}")
        pruefe([boxen.nth(i).get_attribute("data-dokument") for i in range(boxen.count())] == [d["id"] for d in DOK], f"{tag}: Reihenfolge der Karten weicht von DOKUMENTE ab")
        for d in DOK:
            sz = page.locator(f"[data-dokument='{d['id']}'] [data-dokument-seiten]").inner_text().strip()
            pruefe(sz == (seitentext(d["seiten"]) if d["seiten"] else "Seitenzahl offen"), f"{tag}: {d['id']}: Seitenzahl „{sz}“")
            karte = page.locator(f"[data-dokument='{d['id']}']").inner_text()
            pruefe(all(z in karte for z in d["zwecke"]), f"{tag}: {d['id']}: Zweck fehlt ({d['zwecke']})")
            pruefe((page.locator(f"[data-dokument='{d['id']}'] [data-dokument-ohne-datei]").count() == 1) == (not d["datei"]), f"{tag}: {d['id']}: Hinweis „Datei noch nicht hier“ passt nicht")
        pruefe(page.locator("[data-dokument-oeffnen]").count() == len(MIT_DATEI) and page.locator("[data-dokument-laden]").count() == len(MIT_DATEI), f"{tag}: Öffnen/Download-Knöpfe")
        cov = page.locator("[data-dokument-cover]")
        pruefe(cov.count() == len(MIT_COVER), f"{tag}: {cov.count()} Cover-Knöpfe statt {len(MIT_COVER)}")
        for d in MIT_COVER:
            k = page.locator(f"[data-dokument='{d['id']}'] [data-dokument-cover]")
            pruefe(k.count() == 1 and k.get_attribute("href") == d["cover"] and k.get_attribute("download") == d["cover"].rsplit("/", 1)[-1] and k.inner_text().strip() == "Cover", f"{tag}: Cover-Knopf {d['id']}")
        pruefe(page.locator("[data-dokument*='umschlag']").count() == 0, f"{tag}: Umschlag-Box steht noch da")
        txt_alle = page.locator(".dk-gitter").inner_text()
        pruefe("Innenteil" not in txt_alle and "Amazon-Umschlag" not in txt_alle, f"{tag}: alter Begriff sichtbar")
        # alle Knöpfe liegen im Kartenrahmen (am engsten wird es in den Boxen mit Cover-Knopf)
        pruefe(page.evaluate("(() => [...document.querySelectorAll('[data-dokument]')].every(k => { const r = k.getBoundingClientRect(); return [...k.querySelectorAll('.dk-k')].every(b => { const q = b.getBoundingClientRect(); return q.left >= r.left && q.right <= r.right + 1; }); }))()"), f"{tag}: Knöpfe ragen aus der Karte")
        pruefe(page.locator("[data-dokument-info]").count() == 0, f"{tag}: Zweck-Text ist schon offen")
        erste = DOK[0]["id"]
        k = page.locator(f"[data-dokument='{erste}'] [data-dokument-mehr]"); k.click(); page.wait_for_timeout(250)
        pruefe(page.locator(f"[data-dokument='{erste}'] [data-dokument-info]").count() == 1 and k.get_attribute("aria-expanded") == "true", f"{tag}: Pfeil klappt nicht auf")
        if BILDER: page.screenshot(path=f"{BILDER}/dok-{tag}-offen.png", full_page=True)
        k.click(); page.wait_for_timeout(250)
        pruefe(page.locator("[data-dokument-info]").count() == 0, f"{tag}: Pfeil klappt nicht zu")
        if MIT_DATEI:
            d0 = MIT_DATEI[0]
            pruefe(page.locator("[data-dokument-laden]").first.get_attribute("download") == d0["datei"].rsplit("/", 1)[-1], f"{tag}: Download-Name")
            pruefe(page.locator("[data-dokument-oeffnen]").first.get_attribute("href") == d0["datei"], f"{tag}: PDF-Link")
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
