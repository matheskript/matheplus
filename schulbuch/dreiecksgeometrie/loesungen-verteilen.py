"""Verteilt loesungen.html abschnittsweise auf Seiten NN-loesungen-k.html (zweispaltig, ohne Überlauf).
Aufruf: python3 loesungen-verteilen.py  (danach node build.mjs)"""
import re, os, subprocess, glob, pathlib
from playwright.sync_api import sync_playwright
ROOT = pathlib.Path(__file__).parent
P = ROOT / "pages"
START = 56
for f in glob.glob(str(P / "*-loesungen-*.html")): os.remove(f)
secs = [s for s in re.split(r'(?=<h3>)', (ROOT / "loesungen.html").read_text()) if s.strip()]
def seite(k, body):
    kopf = '<div class="ukap-titel"><h2>Lösungen</h2></div>\n<div class="loes" style="height:240mm">' if k == 1 else '<div class="loes">'
    return f'<!-- kap: L | ukap: Lösungen -->\n{kopf}\n{body}</div>\n'
def passt(k, body):
    name = P / f"{START + k - 1:02d}-loesungen-{k}.html"
    name.write_text(seite(k, body))
    subprocess.run(["node", "build.mjs"], cwd=ROOT, capture_output=True, check=True)
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(); pg.goto((ROOT / "dist/buch.html").as_uri()); pg.evaluate("document.fonts.ready")
        ok = pg.evaluate(f"""() => {{ const s = document.querySelector('[data-datei="{name.name}"] .loes'); return s.scrollWidth <= s.clientWidth + 2; }}""")
        b.close()
    return ok
k, i = 1, 0
# Platzhalter, damit Verweise auf loesungen-1 beim Messen existieren
(P / f"{START:02d}-loesungen-1.html").write_text(seite(1, ""))
while i < len(secs):
    body = ""
    while i < len(secs) and passt(k, body + secs[i]):
        body += secs[i]; i += 1
    if not body:
        # Abschnitt zu lang für eine Seite: an Absätzen teilen
        teile = re.split(r'(?=<p><span class="an">)', secs[i]); kopf = teile[0]; rest = teile[1:]
        while rest and passt(k, body + kopf + rest[0] + "</div>\n" if not body else body + rest[0]):
            body = (body or kopf) + rest.pop(0)
        if not body: raise SystemExit("Abschnitt passt nicht: " + secs[i][:60])
        body += "</div>\n"; secs[i] = re.sub(r"<h3>(.*?)</h3>", r"<h3>\1 (Fortsetzung)</h3>", kopf) + "".join(rest)
    (P / f"{START + k - 1:02d}-loesungen-{k}.html").write_text(seite(k, body))
    print("Seite", k, body.count("<h3>"), "Abschnitte"); k += 1
subprocess.run(["node", "build.mjs"], cwd=ROOT, check=True)
