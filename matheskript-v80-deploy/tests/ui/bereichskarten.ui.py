"""Browser-Test der Bereichskarten im Navigator „Der Weg zum Abi“ (Startseite → Unter-/Mittel-/Oberstufe), Handy mit Touch,
320/360/375/390 px, mix und dunkel:
  · Titel brechen nur an Leerzeichen, Bindestrich oder weicher Trennstelle (nie „Wahrsch-einlich…“, nie „, Geraden“)
  · kein Titel läuft über oder in den Plus-Knopf; das Label (ANALYSIS, GEOMETRIE …) steht als eigene Zeile darüber
  · jede Kachel hat ein Bild (keine leere blaue Fläche)
  · Stochastik auf- und zugetippt → alle Karten im Ruhezustand gleich (kein hängendes :hover auf Touch)
  · Etikett-Chips: der gewählte ist gefüllt, die anderen nicht
  npx vite preview --port 4173 &   →   BASE_URL=http://localhost:4173/ python3 tests/ui/bereichskarten.ui.py
"""
import os, sys, json
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
AUS = os.environ.get("SCREENS", "/tmp/bereichskarten")
os.makedirs(AUS, exist_ok=True)
PRE = os.path.join(AUS, "bk")
fehler = []
def pruefe(bed, txt):
    if not bed:
        fehler.append(txt); print("FEHLT:", txt)

# Zeilenbrüche im Titel: nur nach Leerzeichen oder weicher Trennstelle erlaubt
JS_BRUECHE = r"""(el) => {
  const res = []; const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const zeichen = [];
  while (w.nextNode()) { const n = w.currentNode; for (let i = 0; i < n.data.length; i++) zeichen.push([n, i]); }
  let vorTop = null, vor = null;
  for (const [n, i] of zeichen) {
    const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + 1);
    const rs = [...r.getClientRects()].filter((x) => x.width > 0);
    if (!rs.length) { vor = n.data[i]; continue; }
    const top = Math.round(rs[rs.length - 1].top);
    if (vorTop !== null && top > vorTop + 4) res.push([vor, n.data[i]]);
    vorTop = top; vor = n.data[i];
  }
  return { brueche: res, text: el.textContent, ueber: el.scrollWidth > el.clientWidth + 1 };
}"""

with sync_playwright() as p:
    b = p.chromium.launch()
    for breite in (320, 360, 375, 390):
        for modus in (["mix", "dunkel"] if breite == 390 else ["mix"]):
            ctx = b.new_context(viewport={"width": breite, "height": 820}, device_scale_factor=3, is_mobile=True, has_touch=True,
                                user_agent=p.devices["iPhone 13"]["user_agent"])
            pg = ctx.new_page(); perr = []
            pg.on("pageerror", lambda e: perr.append(str(e)))
            pg.goto(BASE)
            pg.evaluate(f"() => {{ localStorage.clear(); localStorage.setItem('mm-start-app','1'); localStorage.setItem('matheplus-start-modus', {json.dumps(modus)}); }}")
            pg.goto(BASE); pg.wait_for_timeout(1400)
            hover = pg.evaluate("matchMedia('(hover: hover)').matches")
            for stufe in ("Unterstufe", "Mittelstufe", "Oberstufe"):
                pg.get_by_role("button", name=f"{stufe} aufklappen").first.tap(); pg.wait_for_timeout(700)
                karten = pg.locator("[data-sprung='start-schulmathe'] .sbb-bereich")
                for i in range(karten.count()):
                    k = karten.nth(i)
                    t = k.locator(".t b").first
                    r = t.evaluate(JS_BRUECHE)
                    schlecht = [x for x in r["brueche"] if x[0] not in (" ", "­", "-") and x[1] != " "]
                    pruefe(not schlecht, f"{breite}/{stufe}: „{r['text']}“ bricht willkürlich {schlecht}")
                    pruefe(not r["ueber"], f"{breite}/{stufe}: „{r['text']}“ läuft über")
                    vor = k.locator(".t .vor")
                    if vor.count():
                        vb, tb = vor.bounding_box(), t.bounding_box()
                        pruefe(vb["y"] + vb["height"] <= tb["y"] + 1, f"{breite}/{stufe}: Label nicht über dem Titel")
                    # Text darf nicht in den Plus-Knopf ragen
                    tb, pf = t.bounding_box(), k.locator(".pf").bounding_box()
                    pruefe(tb["x"] + tb["width"] <= pf["x"] + 0.5, f"{breite}/{stufe}: „{r['text']}“ ragt in den Knopf")
                    # Logo nicht leer
                    lg = k.locator(".logo").first
                    pruefe(lg.evaluate("e => e.querySelector('svg, span') && (e.querySelector('svg') ? e.querySelector('svg').childElementCount > 0 : e.textContent.trim().length > 0)"),
                           f"{breite}/{stufe}: Logo leer bei „{r['text']}“")
                if stufe == "Oberstufe":
                    panel = pg.locator("[data-sprung='start-schulmathe']").first
                    panel.scroll_into_view_if_needed(); pg.wait_for_timeout(300)
                    panel.screenshot(path=f"{PRE}-{breite}-{modus}-panel.png")
                    # Komma bleibt bei „Vektoren“
                    geo = pg.locator(".sbb-bereich .t b", has_text="Vektoren").first
                    kom = geo.evaluate(r"""(el) => { const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); const out = [];
                      while (w.nextNode()) { const n = w.currentNode; const i = n.data.indexOf(","); if (i > 0 || (i === 0 && out.length)) out.push([n, i]); }
                      const full = el.textContent; const j = full.indexOf(",");
                      // Position des Kommas und des „n“ davor über Ranges im ganzen Element
                      const pos = (k) => { const w2 = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let c = 0;
                        while (w2.nextNode()) { const n = w2.currentNode; if (k < c + n.data.length) { const r = document.createRange(); r.setStart(n, k - c); r.setEnd(n, k - c + 1); return r.getBoundingClientRect().top; } c += n.data.length; } };
                      return [pos(j - 1), pos(j)]; }""")
                    pruefe(abs(kom[0] - kom[1]) < 3, f"{breite}: Komma nicht bei „Vektoren“ ({kom})")
                    # Touch: Stochastik auf- und wieder zuklappen → keine Karte darf einen Hintergrund behalten
                    sto = pg.locator(".sbb-bereich", has_text="Stochastik").first
                    sto.tap(); pg.wait_for_timeout(400); sto.tap(); pg.wait_for_timeout(500)
                    hg = pg.evaluate("[...document.querySelectorAll('[data-sprung=start-schulmathe] .sbb-bereich')].map(e => getComputedStyle(e).backgroundColor)")
                    pruefe(len(set(hg)) == 1, f"{breite}: Karten im Ruhezustand verschieden {hg}")
                    panel.screenshot(path=f"{PRE}-{breite}-{modus}-nachtap.png")
                    # Chips
                    chips = pg.locator("[aria-label='Werkzeuge nach Art filtern'] button")
                    pg.locator("[aria-label='Werkzeuge nach Art filtern']").first.screenshot(path=f"{PRE}-{breite}-{modus}-chips-aus.png")
                    chips.nth(1).tap(); pg.wait_for_timeout(400)
                    pg.locator("[aria-label='Werkzeuge nach Art filtern']").first.screenshot(path=f"{PRE}-{breite}-{modus}-chips-an.png")
                    st = chips.evaluate_all("bs => bs.map(b => [b.getAttribute('aria-pressed'), getComputedStyle(b).backgroundColor])")
                    pruefe(st[1][0] == "true" and st[0][0] == "false" and st[1][1] != st[0][1], f"{breite}: Chip-Zustand {st}")
                    # Gefilterte Liste: Titel nicht abgeschnitten/übergelaufen
                    panel.screenshot(path=f"{PRE}-{breite}-{modus}-gefiltert.png")
                    chips.nth(1).tap(); pg.wait_for_timeout(300)
                pg.get_by_role("button", name=f"{stufe} zuklappen").first.tap(); pg.wait_for_timeout(400)
            sw = pg.evaluate("document.documentElement.scrollWidth")
            pruefe(sw <= breite, f"{breite}/{modus}: Überbreite {sw}")
            pruefe(not perr, f"{breite}/{modus}: pageerror {perr}")
            print(breite, modus, "hover:hover =", hover, "ok" if not fehler else "")
            ctx.close()
    # Thumbnails groß ansehen
    ctx = b.new_context(viewport={"width": 390, "height": 820}, device_scale_factor=2)
    pg = ctx.new_page(); pg.goto(BASE)
    pg.evaluate("() => { localStorage.clear(); localStorage.setItem('mm-start-app','1'); }")
    pg.goto(BASE); pg.wait_for_timeout(1400)
    pg.get_by_role("button", name="Oberstufe aufklappen").first.click(); pg.wait_for_timeout(700)
    pg.evaluate("() => document.querySelectorAll('[data-sprung=start-schulmathe] .sbb-bereich .logo').forEach(e => { e.style.width = '256px'; e.style.height = '200px'; })")
    pg.wait_for_timeout(300)
    logos = pg.locator("[data-sprung='start-schulmathe'] .sbb-bereich .logo")
    for i in range(min(5, logos.count())):
        logos.nth(i).screenshot(path=f"{PRE}-logo{i}.png")
    ctx.close(); b.close()

print("FEHLER:", len(fehler))
sys.exit(1 if fehler else 0)
