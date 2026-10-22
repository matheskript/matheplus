"""Vektoren Oberstufe (seit 22.10.): Band mit vier Gruppen Rechnen · Geraden · Ebenen · Hesse-Normalenform,
Seitenmenü je Gruppe (Desktop links in der Arbeitsfläche, Handy als Leiste unter dem Titel).
Prüft bei 390 und 1280 px: Kreuzprodukt → Rechnen bleibt aktiv, Menü-Wechsel zwischen Werkzeugen und Modi,
Gerade – Ebene steht bei Ebenen, Hesse-Seite lädt; keine Konsolenfehler, keine Überbreite.
Aufruf: BASE_URL=http://localhost:4173/ python3 tests/ui/vektoren-gruppen.ui.py [bilderordner]"""
import os, sys
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
BILDER = sys.argv[1] if len(sys.argv) > 1 else None
bekannt = lambda t: "net::" in t or "Failed to load resource" in t
fehler = []
def pruefe(bed, text):
    if not bed: fehler.append(text)

def gruppe(pg):
    return pg.evaluate("() => { const e = document.querySelector('[data-wb-gruppe][aria-current=page]'); return e && e.dataset.wbGruppe; }")
def eintrag(pg):
    return pg.evaluate("() => { const e = [...document.querySelectorAll('[data-vbm][aria-current=page]')].find(x => x.offsetParent); return e && e.dataset.vbm; }")
def klick(pg, id):
    pg.locator(f'[data-vbm="{id}"]:visible').first.click()
    pg.wait_for_timeout(900)

with sync_playwright() as p:
    b = p.chromium.launch()
    for w in (390, 1280):
        ctx = b.new_context(viewport={"width": w, "height": 900})
        pg = ctx.new_page()
        kons = []
        pg.on("pageerror", lambda e: kons.append(str(e)))
        pg.on("console", lambda m: kons.append(m.text) if m.type == "error" and not bekannt(m.text) else None)
        pg.goto(BASE + "kreuzprodukt"); pg.wait_for_timeout(1800)
        n = f"@{w}"
        tabs = pg.evaluate("() => [...document.querySelectorAll('[data-wb-gruppe]')].map(e => e.dataset.wbGruppe)")
        pruefe(tabs == ["rechnen", "geraden", "ebenen", "hesse"], f"Band-Gruppen {tabs} {n}")
        pruefe(gruppe(pg) == "rechnen", f"Kreuzprodukt: Gruppe {gruppe(pg)} {n}")
        pruefe(eintrag(pg) == "kreuzprodukt", f"Kreuzprodukt: Eintrag {eintrag(pg)} {n}")
        if BILDER: pg.screenshot(path=f"{BILDER}/kreuz{w}.png")
        klick(pg, "linear")
        pruefe("vektorrechnen" in pg.url, f"Linearkombination → {pg.url} {n}")
        pruefe(gruppe(pg) == "rechnen" and eintrag(pg) == "linear", f"Linear: {gruppe(pg)}/{eintrag(pg)} {n}")
        pruefe(pg.get_by_text("Linearkombination", exact=False).count() > 0, f"Linearkombination-Rechnung fehlt {n}")
        if BILDER: pg.screenshot(path=f"{BILDER}/rechnen{w}.png")
        klick(pg, "addsub")
        pruefe(eintrag(pg) == "addsub", f"Addition im selben Werkzeug: {eintrag(pg)} {n}")
        klick(pg, "vektorwinkel")
        pruefe("winkel" in pg.url and eintrag(pg) == "vektorwinkel", f"Vektorwinkel: {pg.url} {eintrag(pg)} {n}")
        pg.locator('[data-wb-gruppe="geraden"]').click(); pg.wait_for_timeout(1200)
        pruefe("zwei-punkte" in pg.url and gruppe(pg) == "geraden", f"Gruppe Geraden → {pg.url} {gruppe(pg)} {n}")
        klick(pg, "gg")
        pruefe("geraden-im-raum" in pg.url and eintrag(pg) == "gg", f"g – h: {pg.url} {eintrag(pg)} {n}")
        if BILDER: pg.screenshot(path=f"{BILDER}/geraden{w}.png")
        pg.locator('[data-wb-gruppe="ebenen"]').click(); pg.wait_for_timeout(1200)
        pruefe(gruppe(pg) == "ebenen" and eintrag(pg) == "dreipunkte", f"Gruppe Ebenen: {gruppe(pg)}/{eintrag(pg)} {n}")
        klick(pg, "ge")
        pruefe("geraden-im-raum" in pg.url and gruppe(pg) == "ebenen" and eintrag(pg) == "ge", f"g – E bei Ebenen: {pg.url} {gruppe(pg)}/{eintrag(pg)} {n}")
        klick(pg, "abstaende")
        pruefe(gruppe(pg) == "ebenen", f"Abstände: Gruppe {gruppe(pg)} {n}")
        if BILDER: pg.screenshot(path=f"{BILDER}/ebenen{w}.png")
        pg.locator('[data-wb-gruppe="hesse"]').click(); pg.wait_for_timeout(1800)
        pruefe("hesse-normalenform" in pg.url and gruppe(pg) == "hesse", f"Hesse: {pg.url} {gruppe(pg)} {n}")
        if BILDER: pg.screenshot(path=f"{BILDER}/hesse{w}.png", full_page=True)
        ueber = pg.evaluate("() => document.documentElement.scrollWidth - window.innerWidth")
        pruefe(ueber <= 1, f"Überbreite {ueber}px {n}")
        pruefe(not kons, f"Konsole {n}: {kons[:3]}")
        ctx.close()
    b.close()
print("\n".join(fehler) if fehler else "vektoren-gruppen: alles ok")
sys.exit(1 if fehler else 0)
