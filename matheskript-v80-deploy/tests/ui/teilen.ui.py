"""Browser-Test „Dieses Tool teilen“: Knopf auf jeder Tool-/Trainingsseite, Link kopieren, WhatsApp-Link mit Text, kein Knopf auf Start/Konto.
  npx vite build && npx vite preview --port 4173 &   →   python3 tests/ui/teilen.ui.py
"""
import os, json, subprocess, sys, urllib.parse
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173").rstrip("/")
WURZEL = os.path.join(os.path.dirname(__file__), "..", "..")
fehler = []

def pruefe(bed, text):
    if not bed:
        fehler.append(text); print("FEHLT:", text)

js = "import {PFADE} from './src/pfade.js'; import {teilenInfo} from './src/teilen.js'; console.log(JSON.stringify(PFADE.filter(e=>teilenInfo(e.ansicht)).map(e=>'/'+e.pfad)));"
pfade = json.loads(subprocess.check_output(["node", "--input-type=module", "-e", js], cwd=WURZEL, text=True))

with sync_playwright() as pw:
    b = pw.chromium.launch()
    ctx = b.new_context(viewport={"width": 360, "height": 800}, timezone_id="Europe/Berlin", locale="de-DE", permissions=["clipboard-read", "clipboard-write"])
    page = ctx.new_page()
    konsole = []
    page.on("pageerror", lambda e: konsole.append(f"pageerror: {e}"))
    page.on("console", lambda m: konsole.append(m.text) if m.type == "error" and "net::" not in m.text and "Failed to load resource" not in m.text else None)

    # 1. Knopf auf jeder Tool-/Trainingsseite
    for p in pfade:
        page.goto("about:blank"); page.goto(BASE + p); page.wait_for_timeout(450)
        pruefe(page.locator(".tl-knopf").count() == 1, f"{p}: kein Teilen-Knopf")
    print(f"{len(pfade)} Seiten mit Teilen-Knopf geprüft")

    # 2. Keine Knöpfe auf Start, Konto, Elternabend, Landingpage
    for p in ["/", "/konto", "/elternabend", "/landingpage", "/impressum"]:
        page.goto("about:blank"); page.goto(BASE + p); page.wait_for_timeout(450)
        pruefe(page.locator(".tl-knopf").count() == 0, f"{p}: Teilen-Knopf sollte fehlen")

    # 3. Ablauf am Ableitungstrainer
    page.goto("about:blank"); page.goto(BASE + "/ableitungstrainer"); page.wait_for_timeout(700)
    pruefe(page.locator(".tl-panel").count() == 0, "Panel schon offen")
    page.click(".tl-knopf"); page.wait_for_timeout(200)
    pruefe(page.locator(".tl-panel").count() == 1, "Panel öffnet nicht")
    pruefe("Link kopieren" in page.inner_text(".tl-panel") and "WhatsApp" in page.inner_text(".tl-panel"), "Optionen fehlen")
    page.click("text=Link kopieren"); page.wait_for_timeout(300)
    clip = page.evaluate("navigator.clipboard.readText()")
    pruefe(clip == BASE + "/ableitungstrainer", f"Zwischenablage: {clip!r}")
    pruefe("Link kopiert" in page.inner_text(".tl-panel"), "Bestätigung fehlt")
    href = page.get_attribute("a.tl-wa", "href")
    pruefe(href.startswith("https://wa.me/?text="), f"WhatsApp-Link: {href}")
    text = urllib.parse.unquote(href.split("text=", 1)[1])
    pruefe(text == f"Hey, schau dir mal dieses Tool auf mythosmathe.de an. Hier kannst du super Ableitungen trainieren:\n{BASE}/ableitungstrainer\n\n(aktuell Passwort: mathe)", f"WhatsApp-Text: {text!r}")
    pruefe(page.locator(".tl-vorschau").count() == 0 and "Hey, schau dir" not in page.inner_text(".tl-panel"), "Der Nachrichtentext soll nicht unter den Knöpfen stehen")
    pruefe(page.get_attribute("a.tl-wa", "target") == "_blank" and "noopener" in page.get_attribute("a.tl-wa", "rel"), "WhatsApp-Link öffnet nicht sicher im neuen Tab")
    w = page.evaluate("document.documentElement.scrollWidth - innerWidth")
    pruefe(w <= 1, f"Seitenüberbreite {w}px")
    page.screenshot(path="/tmp/claude-0/teilen360.png")

    # 4. Panel schließt beim Seitenwechsel, Link folgt dem Werkzeug (Umschalter)
    page.evaluate("window.__mmGehe({ansicht:'advplotter'})"); page.wait_for_timeout(500)
    pruefe(page.locator(".tl-panel").count() == 0, "Panel bleibt nach Seitenwechsel offen")
    page.click(".tl-knopf"); page.wait_for_timeout(200)
    href = page.get_attribute("a.tl-wa", "href")
    pruefe("/kurvendiskussion/beliebig\n\n(aktuell Passwort: mathe)" in urllib.parse.unquote(href), "Link folgt dem Umschalter nicht")

    # 5. Teilen- und Feedback-Knopf stehen nebeneinander, gleich breit und gleich hoch (Handy und Desktop, auch mit offenem Panel)
    for breite in (360, 390, 1280):
        page.set_viewport_size({"width": breite, "height": 800})
        for p in ["/ableitungstrainer", "/warmup" if False else "/5-minuten-mathe", "/abstaende"]:
            page.goto("about:blank"); page.goto(BASE + p); page.wait_for_timeout(450)
            for offen in (False, True):
                if offen: page.click(".tl-knopf"); page.wait_for_timeout(150)
                page.wait_for_timeout(250)
                g = page.evaluate("""() => { const r = (q) => { const e = document.querySelector(q); if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.x, y: b.y, width: b.width, height: b.height }; };
                  return { t: r('.tl-knopf'), f: r('.fb-knopf'), p: r('.tl-panel') }; }""")
                t, f = g["t"], g["f"]
                pruefe(abs(t["width"] - f["width"]) <= 1, f"{p}@{breite}: Breiten {t['width']:.0f} vs {f['width']:.0f}")
                pruefe(abs(t["height"] - f["height"]) <= 1 and abs(t["y"] - f["y"]) <= 1, f"{p}@{breite}: nicht auf einer Linie ({t['y']:.0f}/{t['height']:.0f} vs {f['y']:.0f}/{f['height']:.0f})")
                pruefe(t["x"] + t["width"] <= f["x"] + 1, f"{p}@{breite}: Teilen steht nicht links vom Feedback")
                pruefe(t["x"] >= 0 and f["x"] + f["width"] <= breite, f"{p}@{breite}: Knopf ragt aus dem Bildschirm")
                if offen:
                    pruefe(g["p"]["y"] >= t["y"] + t["height"] - 1, f"{p}@{breite}: Panel nicht unter den Knöpfen ({g['p']['y']:.0f} vs {t['y'] + t['height']:.0f})")
                    pruefe(page.evaluate("document.documentElement.scrollWidth - innerWidth") <= 1, f"{p}@{breite}: Seitenüberbreite")
        if breite == 360: page.screenshot(path="/tmp/claude-0/paar360.png")
    # Ohne Teilen-Knopf bleibt der Feedback-Knopf wie vorher mittig
    page.set_viewport_size({"width": 390, "height": 800})
    page.goto("about:blank"); page.goto(BASE + "/"); page.wait_for_timeout(500)
    f = page.locator(".fb-knopf").bounding_box()
    pruefe(abs((f["x"] + f["width"] / 2) - 195) <= 2, "Feedback-Knopf auf der Startseite nicht mittig")

    pruefe(not konsole, f"Konsolenfehler: {konsole[:3]}")
    b.close()

print("FEHLER:" if fehler else "ALLES OK", *fehler, sep="\n" if fehler else " ")
sys.exit(1 if fehler else 0)
