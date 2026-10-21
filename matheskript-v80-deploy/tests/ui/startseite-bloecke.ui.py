"""Browser-Test Startseite in sieben Blöcken (21.10. abends) – Band, Bühne, Heute, Lernen, Mathilda, Kurse, Entdecken, Vision-Anriss.
· Band unter der Kopfleiste: fünf Chips, klebt beim Scrollen mit, „Kurse“ springt 12 px unter das Band, aktiver Chip wandert mit.
· Neuer Besucher: Goldknopf „Pen & Paper starten“, keine Haken-Liste, kein Laufband, keine Modus-Pille, keine Schlösser,
  keine Masterclass-Kachel; Mathilda genau einmal als Block mit „Blatt scannen“ + 4 Chips; sechs Kurs-Karten + „Alle 12 Kurse“;
  Blog-Anriss zeigt den neuesten Beitrag (7 Mathe-Mythen); „Die Vision lesen“ → /vision.
· „Alle Kurse“ → /kurse mit sieben Lack-Kacheln, allen Kursen und den weiteren Lernangeboten als Karten; Zurück zur Startseite über das Logo.
· Keine Seitenüberbreite, keine Konsolenfehler bei 360, 390 und 1280 px.
  npx vite build && npx vite preview --port 4173 &   →   python3 tests/ui/startseite-bloecke.ui.py
"""
import os
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
AUS = os.environ.get("SCREENS", "/tmp/startseite-bloecke")
os.makedirs(AUS, exist_ok=True)
fehler = []

def pruefe(bed, text):
    if not bed:
        fehler.append(text)
        print("FEHLT:", text)

with sync_playwright() as p:
    b = p.chromium.launch()
    for breite in (360, 390, 1280):
        hoehe = 900 if breite >= 1000 else 800
        ctx = b.new_context(viewport={"width": breite, "height": hoehe}, locale="de-DE", timezone_id="Europe/Berlin")
        pg = ctx.new_page()
        konsole = []
        pg.on("pageerror", lambda e: konsole.append(str(e)))
        pg.on("console", lambda m: konsole.append(m.text) if m.type == "error" and "Failed to load resource" not in m.text else None)
        pg.goto(BASE)
        pg.evaluate("localStorage.clear(); localStorage.setItem('mm-start-app','1'); sessionStorage.clear(); localStorage.setItem('matheplus-start-modus','mix')")
        pg.reload(); pg.wait_for_timeout(1800)
        tag = f"{breite}"

        # ---------- Blöcke und Anker ----------
        for a in ["heute", "lernen", "mathilda", "kurse", "entdecken"]:
            pruefe(pg.locator(f"#{a}").count() == 1, f"{tag}: Anker {a} fehlt")
        chips = pg.locator("[data-start-band] button")
        pruefe(chips.count() == 5, f"{tag}: Band hat nicht fünf Chips ({chips.count()})")
        pruefe(pg.locator("[data-start-chip='heute'][aria-current]").count() == 1, f"{tag}: „Heute“ nicht als aktiv markiert")
        pruefe(pg.locator("[data-start-los]").count() == 1, f"{tag}: Goldknopf „Pen & Paper starten“ fehlt")
        pruefe(pg.locator(".sbb-held ul, .sbb-haken, .sbb-band-spur, .sbb-schalter").count() == 0, f"{tag}: Haken, Laufband oder Pille sind zurück")
        pruefe(pg.locator(".sbb .sbb-schloss, .sbb-kachel.zu").count() == 0, f"{tag}: Gesperrtes auf der Startseite")
        pruefe(pg.locator(".kk[data-abi-kachel]").count() == 0, f"{tag}: Masterclass-Kachel ohne bekannte Klasse")
        pruefe(pg.locator("[data-startkarte='wahl']").count() == 1, f"{tag}: Start-Karte fehlt")
        pruefe(pg.locator(".sbb-schul .sbb-stufe").count() == 4, f"{tag}: Navigator ohne vier Stufen")
        pruefe(pg.locator("[data-start-mathilda]").count() == 1 and pg.locator("[data-start-mathilda-los]").count() == 1, f"{tag}: Mathilda-Block fehlt")
        pruefe(pg.locator("[data-start-mathilda] .sbb-ma-chips button").count() == 4, f"{tag}: Mathilda ohne vier Chips")
        pruefe(pg.locator("[data-start-mathilda] .sbb-zwei-schritt").count() == 2, f"{tag}: Zweischritt fehlt")
        pruefe(pg.locator("[data-start-kurs]").count() == 6, f"{tag}: nicht sechs Kurs-Karten ({pg.locator('[data-start-kurs]').count()})")
        pruefe(pg.locator("[data-start-kurs='penpaper']").count() == 1, f"{tag}: Pen & Paper nicht unter den ersten sechs Kursen")
        pruefe(pg.locator("[data-start-alle-kurse]").count() == 1, f"{tag}: „Alle Kurse“ fehlt")
        pruefe(pg.locator("[data-start-blog]").count() == 1 and "Mythen" in pg.locator("[data-start-blog] b").inner_text(), f"{tag}: Blog-Anriss zeigt nicht den neuesten Beitrag")
        pruefe(pg.locator("[data-start-vision]").count() == 1 and pg.locator("[data-start-mythen]").count() == 1, f"{tag}: Vision-Anriss unvollständig")
        hoehe_seite = pg.evaluate("document.documentElement.scrollHeight")
        pruefe(hoehe_seite < (4200 if breite >= 1000 else 5200), f"{tag}: Startseite zu lang ({hoehe_seite} px)")
        pg.screenshot(path=f"{AUS}/start-{tag}.png", full_page=True)

        # ---------- Band: springen und mitlaufen ----------
        pg.locator("[data-start-chip='kurse']").click(); pg.wait_for_timeout(1500)
        oben = pg.evaluate("document.getElementById('kurse').getBoundingClientRect().top")
        band = pg.evaluate("document.querySelector('[data-start-band]').getBoundingClientRect()")
        pruefe(band["top"] <= 60 and band["top"] >= 0, f"{tag}: Band klebt nicht unter der Kopfleiste (top {band['top']})")
        pruefe(band["top"] + band["height"] <= oben <= band["top"] + band["height"] + 40, f"{tag}: „Kurse“ landet nicht unter dem Band (Anker {oben:.0f}, Band bis {band['top'] + band['height']:.0f})")
        pruefe(pg.locator("[data-start-chip='kurse'][aria-current]").count() == 1, f"{tag}: aktiver Chip wandert nicht mit")
        pg.screenshot(path=f"{AUS}/band-kurse-{tag}.png")
        pruefe(pg.evaluate("document.documentElement.scrollWidth - innerWidth") <= 0, f"{tag}: Seite breiter als der Bildschirm")

        # ---------- Alle Kurse → /kurse ----------
        pg.locator("[data-start-alle-kurse]").click(); pg.wait_for_timeout(1500)
        pruefe(pg.url.rstrip("/").endswith("/kurse"), f"{tag}: „Alle Kurse“ führt nicht zu /kurse ({pg.url})")
        pruefe(pg.locator("[data-kurse-seite] .kk").count() == 7, f"{tag}: /kurse ohne sieben Lack-Kacheln")
        pruefe(pg.locator("[data-kurse-seite] [data-start-kurs]").count() >= 12, f"{tag}: /kurse zeigt nicht alle Kurse")
        pg.screenshot(path=f"{AUS}/kurse-{tag}.png", full_page=True)
        pruefe(pg.evaluate("document.documentElement.scrollWidth - innerWidth") <= 0, f"{tag}: /kurse breiter als der Bildschirm")

        # ---------- Blog-Anriss → Beitrag, Vision ----------
        pg.goto(BASE); pg.wait_for_timeout(1500)
        pg.locator("[data-start-blog]").click(); pg.wait_for_timeout(1500)
        pruefe("sieben-mathe-mythen" in pg.url, f"{tag}: Blog-Anriss öffnet nicht den Beitrag ({pg.url})")
        pruefe(pg.locator("text=Mathe ist Talent").count() >= 1, f"{tag}: Beitrag ohne die Mythen")
        pg.goto(BASE); pg.wait_for_timeout(1500)
        pg.locator("[data-start-vision]").click(); pg.wait_for_timeout(1500)
        pruefe(pg.url.rstrip("/").endswith("/vision"), f"{tag}: „Die Vision lesen“ führt nicht zu /vision")

        # ---------- ☰: Namen wie die Blöcke ----------
        pg.goto(BASE); pg.wait_for_timeout(1500)
        menue = pg.locator("button[aria-label='Menü']")
        if menue.count():
            menue.first.click(); pg.wait_for_timeout(600)
            gross = pg.locator("text=Alle Bereiche und Werkzeuge")
            if gross.count():
                gross.first.click(); pg.wait_for_timeout(900)
            text = pg.evaluate("document.body.innerText").lower()   # Desktop-Kicker sind Versalien
            pruefe("der weg zum abi" in text and "mein training" in text, f"{tag}: ☰ ohne „Der Weg zum Abi“/„Mein Training“")
            pruefe("meine kurse" not in text, f"{tag}: ☰ sagt noch „Meine Kurse“")
        pruefe(not konsole, f"{tag}: Konsolenfehler {konsole[:2]}")
        ctx.close()
    b.close()

print("\n".join(fehler) if fehler else "OK")
raise SystemExit(1 if fehler else 0)
