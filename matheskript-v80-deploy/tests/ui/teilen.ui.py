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
    pruefe("hier kannst du super Ableitungen trainieren" in text and text.endswith(BASE + "/ableitungstrainer"), f"WhatsApp-Text: {text!r}")
    pruefe(page.get_attribute("a.tl-wa", "target") == "_blank" and "noopener" in page.get_attribute("a.tl-wa", "rel"), "WhatsApp-Link öffnet nicht sicher im neuen Tab")
    w = page.evaluate("document.documentElement.scrollWidth - innerWidth")
    pruefe(w <= 1, f"Seitenüberbreite {w}px")
    page.screenshot(path="/tmp/claude-0/teilen360.png")

    # 4. Panel schließt beim Seitenwechsel, Link folgt dem Werkzeug (Umschalter)
    page.evaluate("window.__mmGehe({ansicht:'advplotter'})"); page.wait_for_timeout(500)
    pruefe(page.locator(".tl-panel").count() == 0, "Panel bleibt nach Seitenwechsel offen")
    page.click(".tl-knopf"); page.wait_for_timeout(200)
    href = page.get_attribute("a.tl-wa", "href")
    pruefe(urllib.parse.unquote(href).endswith("/kurvendiskussion/beliebig"), "Link folgt dem Umschalter nicht")

    pruefe(not konsole, f"Konsolenfehler: {konsole[:3]}")
    b.close()

print("FEHLER:" if fehler else "ALLES OK", *fehler, sep="\n" if fehler else " ")
sys.exit(1 if fehler else 0)
