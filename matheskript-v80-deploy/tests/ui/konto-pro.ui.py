"""Browser-Test Pro buchen (Vorschau-Modus ohne Supabase): Eltern sehen Angebote und Kinder,
Schüler sieht Angebote erst nach der Volljährigkeitserklärung; Buchen meldet im Vorschau-Modus einen Hinweis.
  npm run build && npx vite preview --port 4173 &   →   python3 tests/ui/konto-pro.ui.py
"""
import os, sys, re, json
from playwright.sync_api import sync_playwright
BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
fehler = []
# Pro ist über den Angebots-Schalter (src/angebot.js, ANGEBOT.pro) abgeschaltet → Plan-Karte und Buchung gibt es gewollt nicht
_a = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "src", "angebot.js"), encoding="utf-8").read().split("export const ANGEBOT")[1].split("};")[0]
if not dict(re.findall(r"^\s+(\w+): (true|false),", _a, re.M)).get("pro") == "true":
    print("übersprungen: ANGEBOT.pro ist aus (src/angebot.js)"); sys.exit(0)
def pruefe(bed, text):
    if not bed: fehler.append(text); print("FEHLT:", text)

with sync_playwright() as p:
    b = p.chromium.launch()
    page = b.new_context(viewport={"width": 390, "height": 844}, locale="de-DE").new_page()
    konsole = []
    page.on("pageerror", lambda e: konsole.append(f"pageerror: {e}"))
    page.goto(BASE); page.evaluate("localStorage.clear(); sessionStorage.clear()"); page.reload(); page.wait_for_timeout(600)
    # Demo-Anmeldung als Elternteil
    page.evaluate("window.__mmGehe({ ansicht: 'konto' })"); page.wait_for_timeout(400)
    page.get_by_role("button", name="Mit Google anmelden").click(); page.wait_for_timeout(500)
    page.get_by_role("radio", name=re.compile("^Elternteil")).first.click(); page.wait_for_timeout(200)
    page.locator("#konto-name").fill("Test Eltern")
    page.get_by_role("button", name="Konto anlegen").click(); page.wait_for_timeout(1000)
    pruefe(page.get_by_text("MEIN PLAN").count() == 1, "Plan-Karte fehlt (Eltern)")
    pruefe(page.get_by_role("button", name=re.compile("Pro Jahr")).count() >= 1, "Angebot Pro Jahr fehlt")
    pruefe(page.get_by_text("Für welches Kind?").count() + page.get_by_text("Für welche Kinder?").count() >= 1, "Kinderauswahl fehlt")
    sw = page.evaluate("document.documentElement.scrollWidth"); pruefe(sw <= 390, f"Überbreite Konto {sw}")
    page.get_by_role("button", name=re.compile("^Familie")).first.click(); page.wait_for_timeout(150)
    kind = page.get_by_role("button", name=re.compile("Lena"))
    if kind.count(): kind.first.click(); page.wait_for_timeout(150)
    buchen = page.get_by_role("button", name=re.compile("buchen –"))
    pruefe(buchen.count() == 1, "Buchen-Knopf fehlt")
    if buchen.count(): buchen.first.click(); page.wait_for_timeout(300)
    pruefe(page.get_by_role("alert").filter(has_text="Vorschau").count() == 1, "Vorschau-Hinweis beim Buchen fehlt")
    pruefe(not konsole, f"Konsolenfehler: {konsole[:3]}")
    b.close()
print("FEHLER" if fehler else "OK", len(fehler)); sys.exit(1 if fehler else 0)
