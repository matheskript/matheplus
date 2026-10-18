"""Rendert dist/buch.html zu dist/Ableitungen.pdf, prüft Überlauf und erzeugt Vorschaubilder.
Aufruf: python3 render.py [--png 1,2,3]"""
import sys, pathlib
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).parent
DIST = ROOT / "dist"
png = []
if "--png" in sys.argv:
    arg = sys.argv[sys.argv.index("--png") + 1]
    png = list(range(1, 200)) if arg == "alle" else [int(x) for x in arg.split(",")]

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 900, "height": 1200}, device_scale_factor=1.6)
    pg.goto((DIST / "buch.html").as_uri())
    pg.wait_for_load_state("networkidle")
    pg.evaluate("document.fonts.ready")
    res = pg.evaluate("""() => [...document.querySelectorAll('.page')].map(s => {
      const out = {nr: +s.dataset.nr, datei: s.dataset.datei, probleme: []};
      for (const el of s.querySelectorAll('.haupt, .rand')) {
        const d = el.scrollHeight - el.clientHeight;
        if (d > 3) out.probleme.push(el.className + ' +' + d + 'px');
        for (const l of el.querySelectorAll('.loes')) if (l.scrollWidth > l.clientWidth + 2) out.probleme.push('loes: dritte Spalte +' + (l.scrollWidth - l.clientWidth));
        // Breitenüberlauf
        for (const k of el.querySelectorAll('.katex-display, .katex, .teil > div, svg, table')) {
          if (k.scrollWidth > el.clientWidth + 2 || k.getBoundingClientRect().right > el.getBoundingClientRect().right + 2)
            out.probleme.push('breit: ' + (k.className.baseVal ?? k.className) + ' ' + (k.textContent||'').slice(0,40));
        }
        const frei = el.clientHeight - [...el.children].reduce((m,c)=>Math.max(m, c.getBoundingClientRect().bottom - el.getBoundingClientRect().top), 0);
        out['frei_' + el.className.split(' ')[0]] = Math.round(frei);
      }
      return out;
    })""")
    for r in res:
        flag = "  <-- " + "; ".join(r["probleme"]) if r["probleme"] else ""
        print(f"S.{r['nr']:>2} {r['datei']:<34} frei haupt {r.get('frei_haupt','-'):>5}px  rand {r.get('frei_rand','-'):>5}px{flag}")
    pg.pdf(path=str(DIST / "Ableitungen.pdf"), width="210mm", height="297mm", print_background=True, prefer_css_page_size=True)
    if png:
        (DIST / "png").mkdir(exist_ok=True)
        els = pg.query_selector_all(".page")
        for i, el in enumerate(els, 1):
            if i in png:
                el.screenshot(path=str(DIST / "png" / f"s{i:02d}.png"))
    b.close()
print("PDF fertig.")
