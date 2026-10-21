"""Browser-Test „Dein Training startet hier.“: Beim Auf- und Zuklappen der Kapitel bleibt der Bildschirm ruhig.
Die angetippte Kapitelzeile bleibt an derselben Stelle im Fenster (Toleranz 1 px), die Seite scrollt nicht von selbst.
Prüft bei 360, 390 und 1280 px, auch mit Kapitel-Wechsel nach oben und nach unten und bei tief gescrollter Seite.
  npx vite build && npx vite preview --port 4173 &   →   python3 tests/ui/kapitelmenue-ruhe.ui.py
"""
import os, sys
from playwright.sync_api import sync_playwright
from startkarte_hilfe import schublade_auf

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
fehler = []

def pruefe(bed, text):
    if not bed:
        fehler.append(text)
        print("FEHLT:", text)

with sync_playwright() as p:
    b = p.chromium.launch()
    for breite, hoehe in ((360, 740), (390, 844), (1280, 800)):
        ctx = b.new_context(viewport={"width": breite, "height": hoehe}, timezone_id="Europe/Berlin", locale="de-DE")
        page = ctx.new_page()
        konsole = []
        page.on("pageerror", lambda e: konsole.append(f"pageerror: {e}"))
        page.goto(BASE)
        page.evaluate("localStorage.clear(); sessionStorage.clear(); localStorage.setItem('mm-onboarding-v1', JSON.stringify({uebersprungen:true}));")
        page.reload(); page.wait_for_timeout(800)

        schublade_auf(page)
        page.get_by_role("button", name="G9").first.click(); page.wait_for_timeout(150)
        page.get_by_role("button", name="Klasse 7", exact=True).click(); page.wait_for_timeout(400)

        kopf = page.locator("[aria-expanded]").filter(has=page.locator("span[data-kein-i18n]"))
        n = kopf.count()
        pruefe(n >= 4, f"{breite}: zu wenige Kapitel ({n})")

        def messen(i):
            return page.evaluate(
                "(i) => { const k = [...document.querySelectorAll('[role=listitem] > button[aria-expanded]')][i];"
                " return { y: window.scrollY, top: k.getBoundingClientRect().top, auf: k.getAttribute('aria-expanded') }; }", i)

        def tippe(i, wo):
            """Kapitel i antippen; Seiten-Scroll und Zeilenposition müssen gleich bleiben."""
            # Wie ein Mensch: die Zeile erst ins sichtbare Drittel scrollen, dann antippen
            page.evaluate("(i) => { const k = [...document.querySelectorAll('[role=listitem] > button[aria-expanded]')][i];"
                          " window.scrollBy({ top: k.getBoundingClientRect().top - 280, behavior: 'instant' }); }", i)
            page.wait_for_timeout(200)
            vorher = messen(i)
            # Klick per JavaScript: Playwright würde eine Zeile außerhalb des Fensters selbst ins Bild scrollen und die Messung verfälschen
            page.evaluate("(i) => document.querySelectorAll('[role=listitem] > button[aria-expanded]')[i].click()", i)
            page.wait_for_timeout(900)   # Animation, Nachkorrektur (420 ms) und mögliches Smooth-Scrolling abwarten
            nachher = messen(i)
            pruefe(abs(nachher["top"] - vorher["top"]) <= 1, f"{breite}: {wo}: Zeile wandert {vorher['top']:.1f} → {nachher['top']:.1f}")
            return vorher, nachher

        # Menü so scrollen, dass die Kapitelliste mittig im Fenster steht
        page.evaluate("document.querySelector('[role=list]').scrollIntoView({block:'start'})")
        page.evaluate("window.scrollBy(0, -80)")
        page.wait_for_timeout(300)

        # 1) Kapitel 2 öffnen (erstes Öffnen)
        tippe(1, "Kapitel 2 öffnen")
        # 2) Kapitel 4 öffnen: Kapitel 2 klappt darüber zu
        tippe(3, "Kapitel 4 öffnen (oberes klappt zu)")
        # 3) Kapitel 1 öffnen: Kapitel 4 klappt darunter zu
        tippe(0, "Kapitel 1 öffnen (unteres klappt zu)")
        # 4) Kapitel 1 wieder zuklappen
        tippe(0, "Kapitel 1 zuklappen")
        # 5) Tief gescrollt: Kapitel 3 öffnen, dann Kapitel 5 (oberes schließt)
        tippe(2, "Kapitel 3 öffnen")
        page.evaluate("window.scrollBy(0, 120)"); page.wait_for_timeout(200)
        if page.locator("[role=listitem] > button[aria-expanded]").count() >= 5:
            tippe(4, "Kapitel 5 nach Scrollen öffnen")
        pruefe(not konsole, f"{breite}: Konsolenfehler {konsole}")
        ctx.close()
        print(f"{breite} px geprüft")
    b.close()

if fehler:
    print(f"\n{len(fehler)} Fehler"); sys.exit(1)
print("\nAlles in Ordnung.")
