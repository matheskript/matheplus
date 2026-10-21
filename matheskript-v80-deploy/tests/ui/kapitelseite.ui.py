"""Browser-Test: Kapitelseite (/kapitel/<id>) und die zwei Knöpfe im ☰-Menü (Dein Schulbuch → Kapitel aufklappen:
links „Kapitelseite öffnen“, rechts „Kapitel trainieren“, beide in einer Zeile ohne Überlauf).
  npx vite build && npx vite preview --port 4173 &   →   python3 tests/ui/kapitelseite.ui.py
  BILDER=/pfad  speichert Screenshots.
"""
import os
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/").rstrip("/")
BILDER = os.environ.get("BILDER")
fehler = []
def pruefe(bed, text):
    if not bed:
        fehler.append(text); print("FEHLT:", text)

KAPITEL = ["ganzrat", "ksdiff", "natzahlen", "quad", "kstest"]

with sync_playwright() as p:
    b = p.chromium.launch()
    for breite in (360, 390, 1280):
        ctx = b.new_context(viewport={"width": breite, "height": 860}, locale="de-DE")
        pg = ctx.new_page()
        konsole = []
        pg.on("pageerror", lambda e: konsole.append(str(e)))
        pg.goto(BASE + "/"); pg.evaluate("localStorage.clear(); localStorage.setItem('mm-onboarding-v1', JSON.stringify({uebersprungen:true}));")
        for k in KAPITEL:
            pg.goto(f"{BASE}/kapitel/{k}"); pg.wait_for_timeout(900)
            pruefe(pg.locator("[data-ks-trainieren]").count() == 1, f"{breite} {k}: Knopf Trainieren")
            pruefe(pg.locator("[data-ks-teil]").count() >= 3, f"{breite} {k}: Unterthemen")
            ueber = pg.evaluate("document.documentElement.scrollWidth - window.innerWidth")
            pruefe(ueber <= 0, f"{breite} {k}: Überbreite {ueber}")
            if BILDER: pg.screenshot(path=f"{BILDER}/kapitel_{k}_{breite}.png", full_page=True)
        # Trainieren führt ins Kapitel-Training
        pg.goto(f"{BASE}/kapitel/ganzrat"); pg.wait_for_timeout(800)
        pg.locator("[data-ks-trainieren]").click(); pg.wait_for_timeout(800)
        pruefe("/trainieren" in pg.url, f"{breite}: Trainieren öffnet /trainieren ({pg.url})")
        # Menü: Klasse 11 (G9) → Kapitel I → zwei Knöpfe
        pg.goto(BASE + "/"); pg.wait_for_timeout(1200)
        pg.locator("button[aria-label*='Menü']").first.click(); pg.wait_for_timeout(600)
        pg.get_by_text("Meine Klasse", exact=False).first.click(); pg.wait_for_timeout(300)
        pg.locator("button[aria-pressed]:has-text('G9')").first.click()
        pg.locator("button:text-is('11')").first.click(); pg.wait_for_timeout(300)
        pg.get_by_text("Ganzrationale Funktionen").first.click(); pg.wait_for_timeout(400)
        reihe = pg.locator("[data-hm-kapitel='ganzrat']")
        pruefe(reihe.count() == 1, f"{breite}: Knopfreihe im Menü")
        if reihe.count():
            links = pg.locator("[data-hm-kapitelseite]").first.bounding_box()
            rechts = pg.locator("[data-hm-trainieren]").first.bounding_box()
            pruefe(abs(links["y"] - rechts["y"]) < 1 and links["x"] < rechts["x"], f"{breite}: Kapitelseite links, Trainieren rechts")
            for sel in ("[data-hm-kapitelseite]", "[data-hm-trainieren]"):
                eng = pg.locator(sel).first.evaluate("e => e.scrollWidth > e.clientWidth + 1")
                pruefe(not eng, f"{breite}: Text passt in {sel}")
            pg.locator("[data-hm-kapitelseite]").first.click(); pg.wait_for_timeout(800)
            pruefe(pg.url.endswith("/kapitel/ganzrat"), f"{breite}: Menü öffnet Kapitelseite ({pg.url})")
        pruefe(not konsole, f"{breite}: Konsolenfehler {konsole}")
        ctx.close()
    b.close()

print("OK" if not fehler else f"{len(fehler)} Fehler")
raise SystemExit(1 if fehler else 0)
