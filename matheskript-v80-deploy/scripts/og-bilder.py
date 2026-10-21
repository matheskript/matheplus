"""Vorschaubilder (Open Graph, 1200 × 630) für jede Werkzeug- und Hub-Seite → public/og/<pfad>.png (21.10.2026).
Werden beim Teilen (WhatsApp, Instagram, LinkedIn, Google) angezeigt. Einmal erzeugen und einchecken –
der Vercel-Build hat keinen Browser.  Ausführen (aus matheskript-v80-deploy/):  python3 scripts/og-bilder.py
Voraussetzung: Playwright mit Chromium (python3 -m playwright install chromium) und die Schrift Montserrat
aus node_modules/@fontsource/montserrat."""
import json, os, subprocess, base64
from playwright.sync_api import sync_playwright

HIER = os.path.dirname(os.path.abspath(__file__))
WURZEL = os.path.abspath(os.path.join(HIER, ".."))
AUS = os.path.join(WURZEL, "public", "og")
os.makedirs(AUS, exist_ok=True)

daten = json.loads(subprocess.check_output(["node", "--input-type=module", "-e", """
import { SEO_SEITEN, HUB_SEITEN, HUBS, seoText } from './src/seo/index.js'; import { WERKZEUGE } from './src/werkzeuge.js';
const w = SEO_SEITEN().map((s) => ({ pfad: s.pfad, zeichen: WERKZEUGE[s.id].zeichen, name: WERKZEUGE[s.id].name, zeile: WERKZEUGE[s.id].zeile, titel: seoText(s.id).titel }));
const h = HUB_SEITEN().map((x) => ({ pfad: x.pfad || 'start', zeichen: x.id === 'start' ? '∫' : x.id === 'vision' ? '1,0' : x.id === 'analysis' ? 'f′' : x.id === 'vektoren' ? 'a⃗' : x.id === 'stochastik' ? 'B' : '✎', name: HUBS[x.id].h1, zeile: HUBS[x.id].beschreibung.split(':')[0], titel: HUBS[x.id].titel }));
console.log(JSON.stringify([...w, ...h]));
"""], cwd=WURZEL).decode())

schrift = ""
for gewicht, datei in (("800", "montserrat-latin-800-normal.woff2"), ("500", "montserrat-latin-500-normal.woff2")):
    p = os.path.join(WURZEL, "node_modules", "@fontsource", "montserrat", "files", datei)
    if os.path.exists(p):
        b64 = base64.b64encode(open(p, "rb").read()).decode()
        schrift += f"@font-face{{font-family:'Montserrat';font-weight:{gewicht};src:url(data:font/woff2;base64,{b64}) format('woff2')}}"

def html(d):
    gross = len(str(d["zeichen"])) <= 3
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{schrift}
    html,body{{margin:0;width:1200px;height:630px;overflow:hidden;font-family:Montserrat,system-ui,sans-serif;background:linear-gradient(160deg,#0E1E4A 0%,#004D98 100%);color:#fff}}
    .k{{position:absolute;left:72px;top:64px;font-size:30px;font-weight:800;letter-spacing:-.02em}} .k b{{color:#EDBB00}}
    .z{{position:absolute;right:72px;top:150px;width:300px;height:300px;border-radius:64px;background:rgba(255,255,255,.08);border:2px solid rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;font-size:{128 if gross else 72}px;font-weight:800;font-style:italic;color:#EDBB00}}
    .t{{position:absolute;left:72px;top:200px;width:720px;font-size:{64 if len(d['name']) < 26 else 50}px;font-weight:800;line-height:1.05;letter-spacing:-.03em}}
    .u{{position:absolute;left:72px;top:{420 if len(d['name']) < 26 else 440}px;width:720px;font-size:28px;font-weight:500;line-height:1.35;color:#C9D6EE}}
    .f{{position:absolute;left:72px;bottom:56px;font-size:22px;font-weight:500;color:#C9D6EE}} .f b{{color:#EDBB00;font-weight:800}}
    .line{{position:absolute;left:72px;top:{400 if len(d['name']) < 26 else 420}px;width:72px;height:6px;border-radius:3px;background:linear-gradient(90deg,#FFE58A,#EDBB00)}}
    </style></head><body>
    <div class="k">MYTHOS<b>MATHE</b>.DE</div>
    <div class="z">{d['zeichen']}</div>
    <div class="t">{d['name']}</div><div class="line"></div>
    <div class="u">{d['zeile']}</div>
    <div class="f">Kostenlos üben mit Rechenweg · System <b>+</b> Freude <b>=</b> Erfolg</div>
    </body></html>"""

with sync_playwright() as p:
    b = p.chromium.launch()
    page = b.new_page(viewport={"width": 1200, "height": 630}, device_scale_factor=1)
    for d in daten:
        page.set_content(html(d)); page.wait_for_timeout(80)
        page.screenshot(path=os.path.join(AUS, f"{d['pfad']}.png"), type="png")
    b.close()

# Verkleinern: 128 Farben reichen für Verlauf und Schrift (≈ 70 KB statt 300 KB je Bild)
from PIL import Image
for d in daten:
    f = os.path.join(AUS, f"{d['pfad']}.png")
    Image.open(f).convert("RGB").quantize(colors=128, dither=Image.Dither.FLOYDSTEINBERG).save(f, optimize=True)
print(f"{len(daten)} Bilder → public/og/")
