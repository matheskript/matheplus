"""Browser-Test: Animationen in den 13 Unterstufen-Werkzeugen (Entdecken, oben „So geht’s“ mit Chip-Wahl).
Je Werkzeug bei 390 und 1280 px: Auswahl da (Zahl der Chips = Zahl der Animationen), erste Animation startet von selbst,
jeder Chip zeigt seine Animation, keine Seitenfehler, keine Überbreite. Auf Englisch: keine Animationen.
  npm run build && npx vite preview --port 4173 &   →   python3 -u tests/ui/unterstufe-werkzeug-motion.ui.py
"""
import json, os, subprocess
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
AUS = os.environ.get("SCREENS", "/tmp/unterstufe-werkzeug-motion")
os.makedirs(AUS, exist_ok=True)
fehler = []
def pruefe(bed, text):
    if not bed:
        fehler.append(text); print("FEHLT:", text)

wurzel = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
anzahl = json.loads(subprocess.check_output(["node", "-e", """
import('./src/unterstufeMedien.js').then((m) => console.log(JSON.stringify(Object.fromEntries(m.WERKZEUGE_MIT_ANIMATION.map((w) => [w, m.werkzeugAnimationen(w).length])))));"""], cwd=wurzel))

with sync_playwright() as p:
    b = p.chromium.launch()
    for breite in (390, 1280):
        ctx = b.new_context(viewport={"width": breite, "height": 860}, locale="de-DE")
        page = ctx.new_page(); konsole = []
        page.on("pageerror", lambda e: konsole.append(f"pageerror: {e}"))
        page.on("console", lambda m: konsole.append(m.text) if m.type == "error" and "net::" not in m.text and "Failed to load resource" not in m.text else None)
        page.goto(BASE)
        page.evaluate("localStorage.clear(); localStorage.setItem('mm-onboarding-v1', JSON.stringify({uebersprungen:true}));")
        for w, n in anzahl.items():
            wo = f"{breite}/{w}"
            page.goto(BASE + w); page.wait_for_selector("[data-usm-auswahl]", timeout=15000); page.wait_for_timeout(300)
            a = page.locator("[data-usm-auswahl]")
            pruefe(a.get_attribute("data-usm-auswahl") == str(n), f"{wo}: {a.get_attribute('data-usm-auswahl')} statt {n} Animationen")
            pruefe(page.locator("[data-usm-chip]").count() == n, f"{wo}: {page.locator('[data-usm-chip]').count()} Chips statt {n}")
            a.scroll_into_view_if_needed(); page.wait_for_timeout(700)
            lbl = page.locator("[data-usm-auswahl] [data-usm-knopf]").get_attribute("aria-label")
            pruefe(lbl == "Animation anhalten", f"{wo}: startet nicht von selbst ({lbl})")
            for k in range(n):
                page.locator(f"[data-usm-chip='{k}']").click(); page.wait_for_timeout(150)
                pruefe(page.locator("[data-usm-auswahl] svg[role=img] *").count() > 3, f"{wo}: Animation {k} leer")
            sw = page.evaluate("document.documentElement.scrollWidth"); pruefe(sw <= breite, f"{wo}: Überbreite {sw}")
            if breite == 390:
                page.locator("[data-usm-chip='0']").click(); page.wait_for_timeout(9000)
                a.screenshot(path=f"{AUS}/{w}.png")
            if konsole: fehler.append(f"{wo}: Konsole: {konsole[:3]}"); print("KONSOLE", wo, konsole[:3]); konsole.clear()
        ctx.close()
    # Englisch: keine Animationen
    ctx = b.new_context(viewport={"width": 390, "height": 860}); page = ctx.new_page()
    page.goto(BASE); page.evaluate("localStorage.setItem('mm-onboarding-v1', JSON.stringify({uebersprungen:true})); localStorage.setItem('mm-sprache','en');")
    page.goto(BASE + "stellenwert"); page.wait_for_timeout(1500)
    pruefe(page.locator("[data-usm-auswahl]").count() == 0, "EN: Animationen sichtbar")
    b.close()

print(f"{len(anzahl)} Werkzeuge geprüft")
if fehler:
    print(f"{len(fehler)} FEHLER"); raise SystemExit(1)
print("alles in Ordnung")
