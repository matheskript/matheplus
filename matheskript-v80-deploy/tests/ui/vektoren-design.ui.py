"""Vektor-Werkzeuge im gemeinsamen Design (src/vekUi.jsx), bei 360/390/1280 px:
- alle neun Werkzeuge laden ohne Konsolenfehler und ohne Überbreite
- Geraden im Raum: g und h stehen in eigenen Boxen nebeneinander (g links, h rechts),
  Vermutung per Kachel → Rechnung mit Ergebnis-Band
- Ebene vs. Ebene: am Handy E₁ und E₂ als Boxen (Desktop ab 840 px ist die Arbeitsfläche aus DESKTOP-STIL.md – nicht hier geprüft)
- Abstände: Typwahl je Box, Rechnung mit Ergebnis-Band
Aufruf: BASE_URL=http://localhost:4173/ python3 tests/ui/vektoren-design.ui.py"""
import os, sys
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
SEITEN = ["vektorrechnen", "kreuzprodukt", "winkel", "zwei-punkte", "drei-punkte", "ebenen", "geraden-im-raum", "ebene-vs-ebene", "abstaende"]
bekannt = lambda t: "net::" in t or "Failed to load resource" in t
fehler = []


def pruefe(bed, text):
    if not bed:
        fehler.append(text)


def neben(pg, sel, n):
    """Boxen sel: liegt die erste links neben der zweiten (gleiche Höhe)?"""
    r = pg.evaluate(f"""() => [...document.querySelectorAll('{sel}')].filter(e => e.offsetParent).slice(0, 2).map(e => {{ const b = e.getBoundingClientRect(); return [b.left, b.top, b.width]; }})""")
    return len(r) == 2 and abs(r[0][1] - r[1][1]) < 2 and r[0][0] < r[1][0]



GRUPPE_VON = {"gg": "geraden", "punktprobe": "geraden", "ge": "ebenen", "gewinkel": "ebenen", "skalarprodukt": "rechnen", "vektorwinkel": "rechnen", "linear": "rechnen"}
def menue(p, eintrag):
    """Eintrag des Vektor-Seitenmenüs öffnen; liegt er in einer anderen Gruppe, erst die Gruppe im Band wählen (seit 22.10.)"""
    if p.locator(f"[data-vbm={eintrag}]:visible").count() == 0:
        p.locator(f"[data-wb-gruppe={GRUPPE_VON[eintrag]}]").click()
        p.wait_for_timeout(900)
    p.locator(f"[data-vbm={eintrag}]:visible").first.click()
    p.wait_for_timeout(500)


with sync_playwright() as p:
    b = p.chromium.launch()
    for w in (360, 390, 1280):
        ctx = b.new_context(viewport={"width": w, "height": 860})
        for s in SEITEN:
            pg = ctx.new_page()
            kons = []
            pg.on("pageerror", lambda e: kons.append(str(e)))
            pg.on("console", lambda m: kons.append(m.text) if m.type == "error" and not bekannt(m.text) else None)
            pg.goto(BASE + s)
            pg.wait_for_timeout(1500)
            n = f"{s}@{w}"
            arbeitsflaeche = pg.locator("[data-arbeitsflaeche]").count() > 0   # Desktop-Zweig nach DESKTOP-STIL.md
            pruefe(arbeitsflaeche or pg.locator("[data-vek-seite]").count() == 1, f"{n}: Seitenrahmen fehlt")
            if s == "geraden-im-raum":
                menue(pg, 'gg')
                pg.wait_for_timeout(300)
                pruefe(neben(pg, "[data-vek-modus=gg] [data-vek-box]", 2), f"{n}: g und h nicht nebeneinander")
                pg.locator("[data-vek-modus=gg] [data-vek-tipp=windschief]").click()
                pg.wait_for_timeout(200)
                pruefe(pg.locator("[data-vek-modus=gg] [data-vek-ergebnis]").count() == 1, f"{n}: Ergebnis Gerade–Gerade fehlt")
                pg.locator("[data-vek-modus=gg] [data-vek-fall=schneidend]").click()
                pruefe(pg.locator("[data-vek-modus=gg] [data-vek-ergebnis]").count() == 0, f"{n}: Fallwahl setzt die Vermutung nicht zurück")
                menue(pg, 'ge')
                pg.locator("[data-vek-modus=ge] [data-vek-tipp=enthalten]").click()
                pruefe(pg.locator("[data-vek-modus=ge] [data-vek-ergebnis]").count() == 1, f"{n}: Ergebnis Gerade–Ebene fehlt")
                menue(pg, 'punktprobe')
                pg.locator("[data-vek-modus=probe] [data-vek-tipp=auf]").click()
                pruefe(pg.locator("[data-vek-modus=probe] [data-vek-ergebnis]").count() == 1, f"{n}: Ergebnis Punktprobe fehlt")
            if s == "ebene-vs-ebene" and not arbeitsflaeche:
                pruefe(pg.locator("[data-vek-box]").count() >= 2, f"{n}: Boxen E₁/E₂ fehlen")
            if s == "kreuzprodukt":
                pruefe(neben(pg, "[data-vek-box]", 2), f"{n}: a und b nicht nebeneinander")
                pruefe(pg.locator("[data-vek-ergebnis]").count() == 1, f"{n}: Ergebnis Kreuzprodukt fehlt")
            if s == "abstaende":
                pruefe(pg.locator("[data-vek-typ]").count() == 6, f"{n}: Typwahl fehlt")
                pruefe(pg.locator("[data-vek-ergebnis]").count() == 1, f"{n}: Ergebnis Abstand fehlt")
                pg.locator("[data-vek-box]").nth(1).locator("[data-vek-typ=gerade]").click()
                pg.wait_for_timeout(200)
                pruefe(pg.locator("[data-vek-ergebnis]").count() == 1, f"{n}: Ergebnis Punkt–Gerade fehlt")
            if s == "winkel":
                for m in ("skalarprodukt", "vektorwinkel", "gewinkel"):   # Seitenmenü (vekNav)
                    menue(pg, m)
                    pg.wait_for_timeout(150)
            ueber = pg.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")
            pruefe(ueber <= 1, f"{n}: Überbreite {ueber}px")
            pruefe(not kons, f"{n}: Konsole {kons[:2]}")
            pg.close()
        ctx.close()
    b.close()

print("\n".join(fehler) if fehler else "Vektor-Werkzeuge: alles grün")
sys.exit(1 if fehler else 0)
