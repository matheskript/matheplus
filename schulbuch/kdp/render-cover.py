"""Rendert dist-kdp/umschlag.html zu dist-kdp/Umschlag.pdf (und ein Vorschaubild). Aufruf im Buchordner."""
import json, os, pathlib
from playwright.sync_api import sync_playwright

DIST = pathlib.Path.cwd() / os.environ.get("DIST", "dist-kdp")
m = json.load(open(DIST / "umschlag.json"))
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1700, "height": 1200}, device_scale_factor=1.2)
    pg.goto((DIST / "umschlag.html").as_uri())
    pg.wait_for_load_state("networkidle")
    pg.evaluate("document.fonts.ready")
    pg.pdf(path=str(DIST / "Umschlag.pdf"), width=f"{m['breite_mm']}mm", height=f"{m['hoehe_mm']}mm", print_background=True, prefer_css_page_size=True)
    pg.query_selector(".umschlag").screenshot(path=str(DIST / "umschlag.png"))
    b.close()
print(f"Umschlag.pdf: {m['breite_mm']} × {m['hoehe_mm']} mm, Rücken {m['ruecken_mm']} mm")
