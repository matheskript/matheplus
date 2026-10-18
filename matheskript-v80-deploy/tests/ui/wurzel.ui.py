"""Browser-Test: Jede Wurzel in der App ist EIN Linienzug (WurzelZeichen).
Besucht Seiten mit vielen Wurzeln (360 / 390 / 1280 px, DE und EN) und prüft für jede .m-wurzel:
  · genau ein SVG-Pfad mit 5 Punkten, Spitze und Überstrich auf derselben Höhe,
  · Überstrich liegt über dem ganzen Radikanden (auch über Hochzahlen) und reicht über ihn hinaus,
  · kein „√“-Zeichen innerhalb einer Wurzel, keine Konsolenfehler, keine Überbreite.
Zusätzlich: Galerie-Fotos aller Wurzeln (SCREENS/…), Liste der übrigen „√“-Textstellen (nur Info).
  npx vite preview --port 4173 &   →   BASE_URL=http://localhost:4173/ python3 tests/ui/wurzel.ui.py
"""
import os
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
AUS = os.environ.get("SCREENS", "/tmp/wurzel")
os.makedirs(AUS, exist_ok=True)
fehler = []

def pruefe(bed, text):
    if not bed:
        fehler.append(text)
        print("FEHLT:", text)

PRUEF_JS = """() => {
  const aus = [];
  document.querySelectorAll('.m-wurzel').forEach((w, k) => {
    const r = w.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    const pfade = [...w.children].filter((c) => c.tagName === 'svg').flatMap((s) => [...s.querySelectorAll('path')]);
    const rad = w.querySelector(':scope > .m-radikand');
    const eintrag = { k, pfade: pfade.length, text: (rad && rad.textContent || '').slice(0, 30) };
    if (pfade.length === 1 && rad) {
      const d = pfade[0].getAttribute('d');
      const zahlen = d.match(/-?[\\d.]+/g).map(Number);
      const pts = []; for (let i = 0; i < zahlen.length; i += 2) pts.push([zahlen[i], zahlen[i + 1]]);
      const sw = parseFloat(pfade[0].getAttribute('stroke-width'));
      const rr = rad.getBoundingClientRect();
      let oben = rr.top;
      rad.querySelectorAll('*').forEach((c) => {
        if (c.closest('.m-wurzel') !== w) return;
        const cr = c.getBoundingClientRect(); if (cr.height > 0) oben = Math.min(oben, cr.top);
      });
      const ueber = r.top + pts[4][1];
      eintrag.punkte = pts.length;
      eintrag.gleichHoch = Math.abs(pts[3][1] - pts[4][1]) < 0.01;
      eintrag.ueberRadikand = ueber + sw / 2 <= oben + 0.5;
      eintrag.deckt = r.left + pts[4][0] >= rr.right - 0.5;
      eintrag.spitzeVorRadikand = r.left + pts[3][0] <= rr.left + 0.5;
      eintrag.glyph = rad.textContent.includes('√') && !rad.querySelector('.m-wurzel');
    }
    aus.push(eintrag);
  });
  return aus;
}"""

REST_JS = """() => {
  const funde = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const n = walker.currentNode;
    if (!n.nodeValue.includes('√')) continue;
    const el = n.parentElement;
    if (!el || el.closest('.m-wurzel, button, input, textarea, svg, [aria-hidden=true]')) continue;
    const r = el.getBoundingClientRect(); if (r.width === 0) continue;
    funde.push(n.nodeValue.trim().slice(0, 60));
  }
  return funde;
}"""

SEITEN = [
    ("zahlenraeume", [("button:has-text('ℝ')", None), ("button:has-text('⊂')", None)]),
    ("gleichungen", []),
    ("pythagoras", []),
    ("formelsammlung", []),
    ("kreuzprodukt", []),
    ("scharen", []),
    ("kathetensatz", []),
    ("funktionen", [("[data-kapitel=wurzel]", None), ("[data-kapitel=dw]", None)]),
]

with sync_playwright() as p:
    browser = p.chromium.launch()
    gesamt = 0
    rest = {}
    for breite, hoehe in [(360, 740), (390, 844), (1280, 900)]:
        for sprache in ["de", "en"]:
            ctx = browser.new_context(viewport={"width": breite, "height": hoehe}, device_scale_factor=2)
            page = ctx.new_page()
            konsole = []
            page.on("console", lambda m: konsole.append(m.text) if m.type == "error" else None)
            page.on("pageerror", lambda e: konsole.append(str(e)))
            page.goto(BASE); page.wait_for_timeout(600)
            page.evaluate("(s) => { try { localStorage.setItem('matheskript-sprache', s); localStorage.setItem('sprache', s); } catch (e) {} }", sprache)
            for pfad, klicks in SEITEN:
                page.goto(BASE + pfad); page.wait_for_timeout(1300)
                stufen = [None] + [k for k, _ in klicks]
                for st in stufen:
                    if st:
                        loc = page.locator(st)
                        if loc.count() == 0:
                            continue
                        loc.first.click(); page.wait_for_timeout(500)
                    # alle Aufklapper öffnen, damit versteckte Wurzeln mitgeprüft werden
                    page.evaluate("() => document.querySelectorAll('details:not([open])').forEach((d) => d.open = true)")
                    page.wait_for_timeout(200)
                    wo = f"{pfad}{' ' + st if st else ''} @{breite} {sprache}"
                    ergebnis = page.evaluate(PRUEF_JS)
                    for e in ergebnis:
                        gesamt += 1
                        pruefe(e["pfade"] == 1, f"{wo}: Wurzel ohne genau einen Pfad ({e['text']})")
                        if e["pfade"] == 1:
                            pruefe(e.get("punkte") == 5, f"{wo}: Pfad hat nicht 5 Punkte ({e['text']})")
                            pruefe(e.get("gleichHoch"), f"{wo}: Spitze und Überstrich nicht auf gleicher Höhe ({e['text']})")
                            pruefe(e.get("ueberRadikand"), f"{wo}: Überstrich schneidet den Radikanden ({e['text']})")
                            pruefe(e.get("deckt"), f"{wo}: Überstrich zu kurz ({e['text']})")
                            pruefe(e.get("spitzeVorRadikand"), f"{wo}: Radikand ragt in den Haken ({e['text']})")
                            pruefe(not e.get("glyph"), f"{wo}: √-Zeichen in der Wurzel ({e['text']})")
                    sw = page.evaluate("document.documentElement.scrollWidth")
                    pruefe(sw <= breite, f"{wo}: Überbreite {sw}")
                    for t in page.evaluate(REST_JS):
                        rest.setdefault(pfad, set()).add(t)
                    if breite == 390 and sprache == "de":
                        # Galerie: jede Wurzel einzeln vergrößert
                        ws = page.locator(".m-wurzel")
                        for i in range(min(ws.count(), 14)):
                            w = ws.nth(i)
                            if not w.is_visible():
                                continue
                            try:
                                w.scroll_into_view_if_needed(timeout=1500)
                                w.screenshot(path=f"{AUS}/{pfad}-{(st or 'start').replace(' ', '')[:12]}-{i}.png".replace("'", "").replace(":", "").replace("(", "").replace(")", ""))
                            except Exception:
                                pass
            pruefe(not konsole, f"@{breite} {sprache}: Konsolenfehler {konsole[:3]}")
            ctx.close()
    browser.close()

print(f"Geprüfte Wurzeln: {gesamt}")
if rest:
    print("Info – übrige „√“-Textstellen (Fließtext ohne MS, keine Fehler):")
    for k, v in rest.items():
        print(" ", k, ":", sorted(v)[:6])
if fehler:
    print(f"\n{len(fehler)} Fehler")
    raise SystemExit(1)
print("Alles in Ordnung.")
