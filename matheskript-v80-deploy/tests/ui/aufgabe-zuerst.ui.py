"""Browser-Wächter „Aufgabe zuerst“ (21.10.2026): Jedes Werkzeug mit dem Etikett Trainieren öffnet bei 390 × 844 px so,
dass die erste Aufgabe (Eingabefeld, Antwort-Knopf oder Aufgabenkarte) mit ihrer Oberkante unter 600 px beginnt,
ohne Überbreite und ohne Seitenfehler. Dazu: kein Werkzeug hat mehr die alte Stations-Pille, jedes das Band.
  npm run build && npx vite preview --port 4173 &   →   BASE_URL=http://localhost:4173/ python3 tests/ui/aufgabe-zuerst.ui.py
"""
import os, json, subprocess
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
GRENZE = 600
fehler = []

def pruefe(bed, text):
    if not bed:
        fehler.append(text); print("FEHLT:", text)

hier = os.path.dirname(os.path.abspath(__file__))
wurzel = os.path.abspath(os.path.join(hier, "..", ".."))
daten = json.loads(subprocess.check_output(["node", "--input-type=module", "-e",
    "import { WERKZEUGE } from './src/werkzeuge.js'; import { pfadFuer } from './src/pfade.js';"
    "console.log(JSON.stringify(Object.entries(WERKZEUGE).map(([id, w]) => ({ id, pfad: pfadFuer(w.ziel), etikett: w.etikett, name: w.name }))))"],
    cwd=wurzel).decode())

JS = """() => {
  const sicht = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const aus = (el) => el.closest('[data-werkzeug-band], [data-einstellungen], [role=tablist], [role=group][aria-label=Modus], .pt-seg, .abl-seg, .ger-seg, [data-aufklapp-inhalt]');
  /* Die Aufgabe beginnt mit ihrer Karte: Aufgabenkarten tragen key=au.id und stehen direkt nach der Einstellungs-Pille –
     wir nehmen das erste Element nach der Pille, das eine Eingabe oder Antwort-Knöpfe enthält, sonst das erste sichtbare Eingabe-Element. */
  const inhalt = (el) => el.querySelector('input, textarea, [contenteditable=true], [data-mathe-feld], [role=radio], button[aria-pressed], [data-tipp]');
  const pille = document.querySelector('[data-einstellungen]');
  let kand = [];
  /* Aufgabenkarten beginnen mit einem Kicker (Großbuchstaben, gesperrt): „STECKBRIEF“, „X-FIGUR“, „TERME VEREINFACHEN“, „AUSGANGSSYSTEM“ … –
     das erste solche Element unterhalb der Modus-Zeile ist die Oberkante der Aufgabe */
  const kickers = [...document.querySelectorAll('p, span, div')].filter(sicht).filter((el) => !aus(el)).filter((el) => { const st = getComputedStyle(el); const t = el.textContent.trim(); const grossText = t.length > 3 && t === t.toUpperCase() && /[A-ZÄÖÜ]{3}/.test(t); return (st.textTransform === 'uppercase' || grossText) && parseFloat(st.letterSpacing) > 0.5 && t.length > 2 && el.children.length === 0 && !/^(GRUNDEBENEN|LEGENDE)$/i.test(el.textContent.trim()); });
  const boxen = [...document.querySelectorAll('[data-vek-seite] [data-vek-box], [data-pt-aufgabe], .pt-karte, [data-aufgabe]')].filter(sicht);
  kand = [...(kickers.length ? [kickers[0]] : []), ...(boxen.length ? [boxen[0]] : [])];
  if (pille) { let e = pille.nextElementSibling; while (e && kand.length < 3) { if (sicht(e) && inhalt(e)) kand.push(e); e = e.nextElementSibling; } }
  if (!kand.length) kand = [...document.querySelectorAll('[data-aufgabe], [data-pt-aufgabe], .it-aufgabe, .abl-karte, [data-gl-karte], [data-gl-karte] *')].filter(sicht).filter((el) => !aus(el));
  if (!kand.length) kand = [...document.querySelectorAll('input, textarea, [contenteditable=true], [data-mathe-feld], [role=radio], button[aria-pressed]')].filter(sicht).filter((el) => !aus(el));
  const y = kand.length ? Math.min(...kand.map((el) => Math.round(el.getBoundingClientRect().top + window.scrollY))) : null;
  return { y, band: !!document.querySelector('[data-werkzeug-band]'), leiste: !!document.querySelector('[data-werkzeug-leiste]'), breite: document.documentElement.scrollWidth };
}"""

with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": 390, "height": 844}, locale="de-DE", timezone_id="Europe/Berlin", has_touch=True)
    page = ctx.new_page()
    seitenfehler = []
    page.on("pageerror", lambda e: seitenfehler.append(str(e)))
    page.goto(BASE)
    page.evaluate("localStorage.clear(); localStorage.setItem('mm-start-app','1'); sessionStorage.clear(); localStorage.setItem('mm-onboarding-v1', JSON.stringify({uebersprungen:true}));")
    for w in daten:
        if not w["pfad"]:
            continue
        seitenfehler.clear()
        page.goto(BASE + w["pfad"].lstrip("/")); page.wait_for_timeout(1100)
        d = page.evaluate(JS)
        pruefe(d["band"] and not d["leiste"], f"{w['id']}: Band fehlt oder alte Stations-Pille vorhanden")
        pruefe(d["breite"] <= 390, f"{w['id']}: Überbreite {d['breite']}")
        pruefe(not seitenfehler, f"{w['id']}: Seitenfehler {seitenfehler[:1]}")
        if w["etikett"] == "trainieren":
            pruefe(d["y"] is not None and d["y"] < GRENZE, f"{w['id']} (Trainieren): erste Aufgabe bei {d['y']} px, erlaubt < {GRENZE}")
        print(f"{w['id']:20} {w['etikett']:10} aufgabe={d['y']}")
    b.close()

print("\n".join(fehler) if fehler else "Alles in Ordnung.")
raise SystemExit(1 if fehler else 0)
