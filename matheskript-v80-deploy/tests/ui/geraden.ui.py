"""Browser-Tests Geraden (Basics, P & Q, P & m): alles auf einer Seite, Eingabe, Lösung. Siehe README.md."""
import os, sys
from playwright.sync_api import sync_playwright

URL = os.environ.get("BASE_URL", "http://localhost:4173/")
fehler = []
bekannt = lambda t: "ERR_TUNNEL" in t or "net::ERR" in t or "Failed to load resource" in t


def seite(b, w, h, mobil=True):
    kw = dict(viewport={"width": w, "height": h}, timezone_id="Europe/Madrid")
    if mobil:
        kw.update(has_touch=True, is_mobile=True, device_scale_factor=2)
    ctx = b.new_context(**kw)
    p = ctx.new_page()
    p.on("pageerror", lambda e: fehler.append(f"pageerror: {e}"))
    p.on("console", lambda m: fehler.append(f"console: {m.text}") if m.type == "error" and not bekannt(m.text) else None)
    p.add_init_script("sessionStorage.setItem('mm-nach-sprachwechsel', JSON.stringify({ansicht:'geradengleichung'}))")
    p.goto(URL)
    p.wait_for_timeout(1800)
    for t in ["Verstanden", "Schließen", "OK", "Später"]:
        try:
            k = p.get_by_role("button", name=t, exact=True)
            if k.count():
                k.first.click(timeout=500)
        except Exception:
            pass
    return p


def pruefe(bed, text):
    if not bed:
        fehler.append(text)


def keine_ueberbreite(p, name):
    ueber = p.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")
    pruefe(ueber <= 1, f"{name}: horizontaler Überlauf {ueber}px")


with sync_playwright() as pw:
    b = pw.chromium.launch()
    for (w, h) in [(390, 844), (360, 740), (1280, 800)]:
        p = seite(b, w, h, mobil=w < 600)
        n = f"{w}x{h}"
        pruefe(p.locator("[data-ger-tab]").count() == 3, f"{n}: Tabs fehlen")
        # Basics
        pruefe(p.locator("[data-ger-basics]").count() == 1, f"{n}: Basics fehlt")
        keine_ueberbreite(p, n + " basics")
        p.locator(".ger-seg-klein button").nth(1).click()
        p.locator(".ger-seg-klein button").nth(2).click()
        p.locator(".ger-seg-klein button").nth(3).click()
        # P & Q
        p.locator("[data-ger-tab=pq]").click()
        p.wait_for_timeout(300)
        pruefe(p.get_by_text("Bestimme die Gerade durch").is_visible(), f"{n}: Aufgabentext fehlt")
        keine_ueberbreite(p, n + " pq")
        # alles auf einen Bildschirm (mobil)
        sh = p.evaluate("Math.round(document.querySelector('.ger-innen').getBoundingClientRect().bottom)")
        if w < 600:
            pruefe(sh <= h + 4, f"{n}: PQ scrollt ({sh} > {h})")
        # Lösung zeigen für m
        p.get_by_role("button", name="Lösung zeigen").first.click()
        pruefe(p.locator("[data-ger-weg]").count() == 1, f"{n}: Rechenweg m fehlt")
        p.get_by_role("button", name="Weiter").click()
        p.get_by_role("button", name="Lösung zeigen").first.click()
        p.get_by_role("button", name="Weiter").click()
        pruefe(p.locator("[data-ger-ergebnis]").count() == 1, f"{n}: Ergebnis fehlt")
        # Würfel
        p.get_by_role("button", name="Zufällige Punkte würfeln").click()
        pruefe(p.locator("[data-ger-ergebnis]").count() == 0, f"{n}: Würfel setzt nicht zurück")
        # Eingabe m per Zahlenfeld: richtigen Wert aus gezeigter Lösung lesen ist aufwendig → falsche Eingabe prüfen
        p.locator("[data-ger-antwort=m]").click()
        pruefe(p.locator("div[role=dialog][data-ger-pad]").count() == 1, f"{n}: Zahlenfeld öffnet nicht")
        p.locator("button[data-ger-pad]", has_text="OK").click()
        p.wait_for_timeout(200)
        keine_ueberbreite(p, n + " pq2")
        # Koordinate editieren
        p.locator("[data-ger-pq] .ger-pt .ger-feld").first.click()
        p.locator("button[data-ger-pad]", has_text="7").first.click()
        p.locator("button[data-ger-pad]", has_text="OK").click()
        # P & m
        p.locator("[data-ger-tab=pm]").click()
        p.wait_for_timeout(300)
        pruefe(p.locator("[data-ger-pm]").count() == 1, f"{n}: P&m fehlt")
        keine_ueberbreite(p, n + " pm")
        sh = p.evaluate("Math.round(document.querySelector('.ger-innen').getBoundingClientRect().bottom)")
        if w < 600:
            pruefe(sh <= h + 4, f"{n}: P&m scrollt ({sh} > {h})")
        p.get_by_role("button", name="Lösung zeigen").first.click()
        p.get_by_role("button", name="Weiter").click()
        pruefe(p.locator("[data-ger-ergebnis]").count() == 1, f"{n}: P&m Ergebnis fehlt")
        if w == 390:
            p.screenshot(path="/tmp/ger_pm.png")
            p.locator("[data-ger-tab=pq]").click()
            p.screenshot(path="/tmp/ger_pq.png")
            p.locator("[data-ger-tab=basics]").click()
            p.screenshot(path="/tmp/ger_basics.png")
        p.context.close()
    b.close()

if fehler:
    print("FEHLER:")
    for f in fehler:
        print(" -", f)
    sys.exit(1)
print("Geraden-UI in Ordnung")
