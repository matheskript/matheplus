"""Browser-Test Vision-Seite (src/funcVision.jsx, Daten src/vision.js).
  npx vite build && npx vite preview --port 4173 &   →   python3 tests/ui/vision.ui.py
  BILDER=<ordner> legt Bildschirmfotos ab.

Geprüft je Breite (360, 390, 768, 1280, 1440):
  - /vision lädt ohne Seitenfehler, keine Überbreite, Menüpunkt „Vision“ (Gast) ist markiert
  - Bühne: Schlagzeile, durchgestrichenes „Talent“ wird aufgedeckt, direkter Knopf Pen & Paper
  - alle sechs Kapitel da (seit 24.10. ohne Gründerkapitel); Kapitelübersicht springt zum Abschnitt
  - Tangente: Ziehen über den Graphen setzt x₀, angezeigte Steigung = f′(x₀); bei x₀ = ±√2 „waagrecht“
  - Handy: feste Knopfleiste erscheint nach der Bühne und verschwindet bei den Angeboten
  - ab 1360 px: Kapitel-Leiste links, aktives Kapitel markiert
  - Angebote am Ende: Pen & Paper zuerst, Knöpfe führen zu /pen-and-paper, /mathilda, /head-and-numbers, /mindset-kurs, /spenden
"""
import os, re, math
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/").rstrip("/") + "/"
BILDER = os.environ.get("BILDER")
fehler = []
def pruefe(bed, text):
    if not bed:
        fehler.append(text); print("FEHLT:", text)

def foto(page, name):
    if BILDER:
        os.makedirs(BILDER, exist_ok=True)
        page.screenshot(path=os.path.join(BILDER, name + ".png"))

def zahl(t):
    t = t.replace("−", "-").replace(",", ".")
    return float(re.findall(r"-?\d+\.\d+", t)[0])

def oeffnen(b, breite):
    ctx = b.new_context(viewport={"width": breite, "height": 860}, locale="de-DE")
    page = ctx.new_page()
    konsole = []
    page.on("pageerror", lambda e: konsole.append(f"pageerror: {e}"))
    page.goto(BASE)
    page.evaluate("localStorage.clear(); localStorage.setItem('mm-start-app','1'); localStorage.setItem('mm-onboarding-v1', JSON.stringify({uebersprungen:true}));")
    page.goto(BASE + "vision"); page.wait_for_timeout(4300)
    return ctx, page, konsole

with sync_playwright() as p:
    b = p.chromium.launch()
    for breite in (360, 390, 768, 1280, 1440):
        tag = f"{breite}"
        ctx, page, konsole = oeffnen(b, breite)
        pruefe(page.locator("[data-vision]").count() == 1, f"{tag}: Vision-Seite fehlt")
        pruefe("Vision" in page.title(), f"{tag}: Titel {page.title()}")
        pruefe(page.locator("[data-besucher-menue=vision]").get_attribute("aria-current") == "page", f"{tag}: Menüpunkt Vision nicht markiert")
        pruefe(page.locator("h1#vi-titel").inner_text().replace("\n", " ").strip() == "Eine Generation, die Mathe versteht.", f"{tag}: Schlagzeile")
        # Strich über „Talent“ ist nach der Animation aufgedeckt
        clip = page.evaluate("getComputedStyle(document.querySelector('.vi-held .vi-weg svg')).clipPath")
        pruefe("100%" not in clip, f"{tag}: Strich über Talent nicht aufgedeckt ({clip})")
        pruefe(page.locator("[data-vision-direkt]").is_visible(), f"{tag}: direkter Knopf fehlt")
        foto(page, f"held-{breite}")
        pruefe(not page.evaluate("document.documentElement.scrollWidth > window.innerWidth + 1"), f"{tag}: Überbreite oben")
        for k in ("kapitel-gegner", "kapitel-plan", "kapitel-haltung", "kapitel-ort", "kapitel-wege", "kapitel-start",
                  "schritt-verstehen", "schritt-aufschreiben", "schritt-trainieren"):
            pruefe(page.locator(f"#{k}").count() == 1, f"{tag}: Abschnitt {k} fehlt")
        pruefe(page.locator("#kapitel-weg").count() == 0 and "Blumenröther" not in page.evaluate("document.body.innerText"), f"{tag}: Gründerkapitel ist zurück")

        # Kapitelübersicht springt
        page.locator(".vi-kapitel button", has_text="Die Haltung").click(); page.wait_for_timeout(1400)
        y = page.evaluate("document.getElementById('kapitel-haltung').getBoundingClientRect().top")
        pruefe(-5 < y < 140, f"{tag}: Kapitelsprung Die Haltung (top={y:.0f})")
        if breite >= 1360:
            leiste = page.locator(".vi-leiste-l")
            pruefe("sichtbar" in (leiste.get_attribute("class") or ""), f"{tag}: Kapitel-Leiste nicht sichtbar")
            akt = page.locator(".vi-leiste-l button[aria-current='true']")
            pruefe(akt.count() == 1 and "Die Haltung" in akt.inner_text(), f"{tag}: aktives Kapitel in der Leiste")
            foto(page, f"leiste-{breite}")
        else:
            pruefe(not page.locator(".vi-leiste-l").is_visible(), f"{tag}: Kapitel-Leiste darf unter 1360 px nicht erscheinen")

        # Handy-Leiste: nach der Bühne sichtbar, bei den Angeboten weg
        if breite < 900:
            pruefe("sichtbar" in (page.locator("[data-vision-leiste]").get_attribute("class") or ""), f"{tag}: Knopfleiste nach der Bühne fehlt")
            foto(page, f"leiste-unten-{breite}")
            page.evaluate("document.getElementById('kapitel-start').scrollIntoView()"); page.wait_for_timeout(700)  # sprung-frei: Test
            pruefe("sichtbar" not in (page.locator("[data-vision-leiste]").get_attribute("class") or ""), f"{tag}: Knopfleiste bleibt bei den Angeboten")
        else:
            pruefe(not page.locator("[data-vision-leiste]").is_visible(), f"{tag}: Knopfleiste am Desktop")

        # Tangente: Ziehen setzt x₀, Steigung = f′(x₀)
        svg = page.locator("[data-vision-tangente]")
        svg.scroll_into_view_if_needed(); page.wait_for_timeout(500)
        bb = svg.bounding_box()
        W, rand, xmin, xmax = 380, 14, -3.4, 3.4
        def px(x):
            return bb["x"] + (rand + (x - xmin) / (xmax - xmin) * (W - 2 * rand)) / W * bb["width"]
        for ziel in (-math.sqrt(2), 1.0, math.sqrt(2)):
            page.mouse.move(px(ziel), bb["y"] + bb["height"] / 2)
            page.mouse.down(); page.mouse.move(px(ziel) + 0.5, bb["y"] + bb["height"] / 2); page.mouse.up()
            page.wait_for_timeout(250)
            w = page.locator(".vi-plot-kopf .w").inner_text()
            x0 = zahl(w.split("·")[0]); m = zahl(w.split("·")[1].split("=")[1])
            pruefe(abs(x0 - ziel) < 0.08, f"{tag}: x₀ {x0} statt {ziel:.2f}")
            # x₀ ist auf 2 Stellen gerundet angezeigt: |f″| · 0,005 + 0,005 Rundung der Steigung
            pruefe(abs(m - (0.75 * x0 * x0 - 1.5)) <= 1.5 * abs(x0) * 0.005 + 0.0051, f"{tag}: Steigung {m} passt nicht zu x₀ = {x0}")
            status = page.locator(".vi-plot-status").inner_text()
            if abs(abs(ziel) - math.sqrt(2)) < 1e-9 and abs(m) < 0.09:
                pruefe(("Hochpunkt" if ziel < 0 else "Tiefpunkt") in status, f"{tag}: Status bei x₀ = {ziel:.2f}: {status}")
        foto(page, f"tangente-{breite}")

        # Ganz durchscrollen: alles eingeblendet, nirgends Überbreite
        h = page.evaluate("document.documentElement.scrollHeight")
        y = 0
        while y < h:
            y += 600; page.evaluate(f"window.scrollTo(0,{y})"); page.wait_for_timeout(90)  # sprung-frei: Test
        page.wait_for_timeout(1200)
        nicht_da = page.evaluate("[...document.querySelectorAll('.vi-auf')].filter(e => !e.classList.contains('da')).length")
        pruefe(nicht_da == 0, f"{tag}: {nicht_da} Abschnitte nicht eingeblendet")
        pruefe(not page.evaluate("document.documentElement.scrollWidth > window.innerWidth + 1"), f"{tag}: Überbreite")
        breit = page.evaluate("""() => [...document.querySelectorAll('[data-vision] *')].filter(e => {
            const r = e.getBoundingClientRect(); return r.width > 0 && (r.right > innerWidth + 1 || r.left < -1) && !e.closest('.vi-held-kurve, .vi-licht, .vi-leiste-u, .vi-quetsch, .vi-weg');
          }).map(e => e.className && e.className.baseVal === undefined ? e.className : e.tagName).slice(0, 5)""")
        pruefe(not breit, f"{tag}: ragt aus dem Fenster: {breit}")

        # Angebote: Pen & Paper zuerst, Ziele stimmen
        angebote = page.evaluate("[...document.querySelectorAll('[data-vision-angebot]')].map(e => e.getAttribute('data-vision-angebot'))")
        pruefe(angebote[:1] == ["penpaper"], f"{tag}: erstes Angebot {angebote[:1]}")
        if breite == 390:
            for name, pfad in (("penpaper", "/pen-and-paper"), ("mathilda", "/mathilda"), ("kopfrechnen", "/head-and-numbers"), ("mindset", "/mindset-kurs"), ("spenden", "/spenden")):
                page.goto(BASE + "vision"); page.wait_for_timeout(1500)
                page.locator(f"[data-vision-angebot={name}]").scroll_into_view_if_needed()
                page.locator(f"[data-vision-angebot={name}]").click(); page.wait_for_timeout(1500)
                pruefe(page.url.rstrip("/").endswith(pfad), f"{tag}: {name} führt zu {page.url} statt {pfad}")
            page.goto(BASE + "vision"); page.wait_for_timeout(1500)
            page.locator("[data-vision-direkt]").click(); page.wait_for_timeout(1500)
            pruefe(page.url.rstrip("/").endswith("/pen-and-paper"), f"{tag}: direkter Knopf führt zu {page.url}")

        pruefe(not konsole, f"{tag}: Seitenfehler {konsole[:3]}")
        ctx.close()

    # Bewegung reduziert: alles sofort sichtbar, Strich ohne Aufdecken
    ctx = b.new_context(viewport={"width": 390, "height": 860}, locale="de-DE", reduced_motion="reduce")
    page = ctx.new_page()
    page.goto(BASE); page.evaluate("localStorage.clear(); localStorage.setItem('mm-start-app','1'); localStorage.setItem('mm-onboarding-v1', JSON.stringify({uebersprungen:true}));")
    page.goto(BASE + "vision"); page.wait_for_timeout(1200)
    pruefe(page.evaluate("getComputedStyle(document.querySelector('.vi-held .vi-weg svg')).clipPath") == "none", "reduziert: Strich verdeckt")
    pruefe(page.evaluate("getComputedStyle(document.querySelector('#kapitel-ort .vi-auf')).opacity") == "1", "reduziert: Abschnitt unsichtbar")
    ctx.close()
    b.close()

print("OK" if not fehler else f"{len(fehler)} Fehler")
raise SystemExit(1 if fehler else 0)
