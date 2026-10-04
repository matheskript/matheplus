"""Erzeugt die Bilder für „So nutzt du die App“ (src/anleitung/*.webp + daten.js).

Aufruf (im Ordner matheskript-v80-deploy):
    npx vite build && npx vite preview --port 4377 &
    python3 scripts/anleitung-screenshots.py
Danach erneut bauen. Jede Folie: echte App, Handy-Ansicht 390 × 640,
die wichtige Stelle als Rechteck in Prozent der Bildgröße.
"""
import io, json, os, re, sys
from PIL import Image
from playwright.sync_api import sync_playwright

URL = os.environ.get("ANLEITUNG_URL", "http://localhost:4377/")
W, H = 390, 640
ZIEL = os.path.join(os.path.dirname(__file__), "..", "src", "anleitung")
BREITE_PX = 600
daten = {}


def box_von(pg, locs, pad=6):
    boxen = [l.bounding_box() for l in locs]
    boxen = [b for b in boxen if b]
    x0 = min(b["x"] for b in boxen) - pad; y0 = min(b["y"] for b in boxen) - pad
    x1 = max(b["x"] + b["width"] for b in boxen) + pad; y1 = max(b["y"] + b["height"] for b in boxen) + pad
    x0, y0 = max(2, x0), max(58, y0); x1, y1 = min(W - 2, x1), min(H - 2, y1)
    return [round(100 * x0 / W, 2), round(100 * y0 / H, 2), round(100 * (x1 - x0) / W, 2), round(100 * (y1 - y0) / H, 2)]


def zeige(pg, loc, oben=None):
    """Element in den sichtbaren Bereich holen (mittig oder mit festem Abstand von oben)."""
    if oben is None:
        loc.evaluate("e => e.scrollIntoView({block: 'center'})")
    else:
        loc.evaluate(f"e => window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY - {oben})")
    pg.wait_for_timeout(450)


def foto(pg, fid, markiert):
    png = pg.screenshot()
    im = Image.open(io.BytesIO(png)).convert("RGB")
    im = im.resize((BREITE_PX, round(BREITE_PX * im.height / im.width)), Image.LANCZOS)
    pfad = os.path.join(ZIEL, f"{fid}.webp")
    im.save(pfad, "WEBP", quality=80, method=6)
    daten[fid] = {"box": box_von(pg, markiert) if markiert else None}
    print(fid, os.path.getsize(pfad) // 1024, "kB", daten[fid]["box"])


def start(pg):
    pg.goto(URL); pg.wait_for_timeout(1300)
    pg.add_style_tag(content="*{animation-duration:0s !important;animation-delay:0s !important;transition:none !important} .pulsieren{opacity:1 !important}")


def knopf(pg, muster):
    return pg.locator("button").filter(has_text=re.compile(muster)).first


with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": W, "height": H}, device_scale_factor=2)

    # --- Überblick ---
    start(pg)
    blau = [pg.locator(f'button[aria-label="{t} aufklappen"]') for t in ["Mathe-Training", "Mathematik", "Mathe-Wettbewerbe", "Kopfrechnen"]]
    zeige(pg, blau[0], oben=70)
    foto(pg, "ueberblick-1", blau)
    kurse = [pg.locator(".mc-silber").first, pg.locator(".mc-kachel:not(.mc-silber)").first]
    zeige(pg, kurse[0], oben=72)
    foto(pg, "ueberblick-2", kurse)

    # --- Kopfrechnen ---
    start(pg)
    kopf = pg.locator('button[aria-label="Kopfrechnen aufklappen"]')
    zeige(pg, kopf)
    foto(pg, "kopf-1", [kopf])
    kopf.click(); pg.wait_for_timeout(500)
    mult = pg.locator(".kopf-kachel", has_text="Multiplizieren")
    zeige(pg, mult)
    foto(pg, "kopf-2", [mult])
    mult.click(); pg.wait_for_timeout(700)
    zwei = pg.locator("button", has_text=re.compile("^2-stellig$"))
    zwei.nth(0).click(); pg.wait_for_timeout(250); zwei.nth(1).click(); pg.wait_for_timeout(500)
    zeige(pg, zwei.nth(0), oben=150)
    foto(pg, "kopf-3", [zwei.nth(0), zwei.nth(1)])
    text = pg.locator("body").inner_text()
    m = re.search(r"(\d+)\s*·\s*(\d+)\s*=", text)
    if not m: sys.exit("Aufgabe nicht gefunden")
    erg = str(int(m.group(1)) * int(m.group(2)))
    for z in erg:
        pg.locator("button", has_text=re.compile(f"^{z}$")).last.click(); pg.wait_for_timeout(80)
    ok = pg.locator("button", has_text=re.compile("^OK$"))
    aufg = pg.get_by_text(re.compile(r"^\d+ / 10$")).first
    zeige(pg, aufg, oben=95)
    foto(pg, "kopf-4", [ok])
    ok.click(); pg.wait_for_timeout(90)
    haken = pg.get_by_text("✓", exact=True).first
    foto(pg, "kopf-5", [haken.locator("..")])

    # --- Kurvendiskussion ---
    start(pg)
    pg.locator('button[aria-label="Mathe-Training aufklappen"]').click(); pg.wait_for_timeout(400)
    ana = pg.locator('button[aria-label="Analysis aufklappen"]')
    zeige(pg, ana)
    foto(pg, "kurve-1", [ana])
    ana.click(); pg.wait_for_timeout(500)
    kd = pg.locator(".unter-knopf", has_text="Kurvendiskussion").first
    kd.click(); pg.wait_for_timeout(500)
    poly = pg.locator(".unter-knopf", has_text="Polynome").first
    zeige(pg, kd, oben=150)
    foto(pg, "kurve-2", [poly])
    poly.click(); pg.wait_for_timeout(1000)
    pm = pg.locator("button").filter(has_text=re.compile("^[+−]$"))
    zeige(pg, pm.first, oben=120)
    unten = [pm.nth(i) for i in range(pm.count()) if (pm.nth(i).bounding_box() or {"y": 0})["y"] > 120][:8]
    foto(pg, "kurve-3", unten)
    kopf_kd = pg.get_by_text("Kurvendiskussion", exact=True).last
    zeige(pg, kopf_kd, oben=80)
    foto(pg, "kurve-4", [kopf_kd, pg.get_by_text("2. Symmetrie").first])
    pdf = pg.locator("button", has_text="als PDF")
    zeige(pg, pdf)
    foto(pg, "kurve-5", [pdf])
    b.close()

# daten.js schreiben
zeilen = ["/* Automatisch erzeugt von scripts/anleitung-screenshots.py — nicht von Hand ändern. */"]
for fid in daten:
    zeilen.append(f'import b_{fid.replace("-", "_")} from "./{fid}.webp";')
zeilen.append("")
zeilen.append("export const ANLEITUNG_BILDER = {")
for fid, d in daten.items():
    zeilen.append(f'  "{fid}": {{ src: b_{fid.replace("-", "_")}, w: {W}, h: {H}, box: {json.dumps(d["box"])} }},')
zeilen.append("};")
open(os.path.join(ZIEL, "daten.js"), "w").write("\n".join(zeilen) + "\n")
print("daten.js geschrieben:", len(daten), "Folien")
