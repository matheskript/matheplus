"""Browser-Test Kopfleiste (src/funcKopfleiste.jsx) und Blog (src/funcBlog.jsx).
  npx vite build && npx vite preview --port 4173 &   →   python3 tests/ui/kopfleiste.ui.py
  BILDER=<ordner> legt Bildschirmfotos ab.

Geprüft je Modus (dunkel/hell/mix) × Gast/angemeldet × 390/1280 px:
  - Kopfleiste trägt den Modus der Startseite, keine Überbreite, keine Seitenfehler
  - Gast: Wortmarke ein Drittel kleiner, festes Menü Vision · Mathe lernen · Mathilda AI · Blog
    (weiß auf dunkel/mix, nicht zum Ausklappen), AI in Gold; angemeldet: kein Besuchermenü, Slogan, Chip
  - Modus-Knopf schaltet reihum, Leiste klebt und zieht sich beim Scrollen zusammen
  - Menüpunkte führen zu #vision, #lernen, Mathilda, /blog; Blog-Liste → Beitrag → nächster Beitrag → zurück
"""
import os, json
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/").rstrip("/") + "/"
BILDER = os.environ.get("BILDER")
fehler = []
def pruefe(bed, text):
    if not bed:
        fehler.append(text); print("FEHLT:", text)

DEMO = {"nutzer": {"id": "demo-1", "email": "lena@example.de"}, "profil": {"id": "demo-1", "name": "Lena", "rolle": "schueler", "geschlecht": "w", "schulform": "G9", "klasse": 10}}
FARBE_WEISS = "rgb(255, 255, 255)"

def foto(page, name, ganz=False):
    if BILDER:
        os.makedirs(BILDER, exist_ok=True)
        if ganz:
            page.screenshot(path=os.path.join(BILDER, name + ".png"), full_page=False)
        else:
            page.locator("[data-kopfleiste]").screenshot(path=os.path.join(BILDER, name + ".png"))

with sync_playwright() as p:
    b = p.chromium.launch()
    for breite in (360, 390, 768, 1024, 1060, 1100, 1280, 1512, 1920):
        for angemeldet in (False, True):
            for modus in ("dunkel", "hell", "mix"):
                ctx = b.new_context(viewport={"width": breite, "height": 860}, locale="de-DE")
                page = ctx.new_page()
                konsole = []
                page.on("pageerror", lambda e: konsole.append(f"pageerror: {e}"))
                page.goto(BASE)
                page.evaluate("localStorage.clear(); localStorage.setItem('mm-onboarding-v1', JSON.stringify({uebersprungen:true}));")
                page.evaluate(f"localStorage.setItem('matheplus-start-modus', '{modus}')")
                if angemeldet:
                    page.evaluate(f"localStorage.setItem('mm-demo-konto', {json.dumps(json.dumps(DEMO))})")
                page.goto(BASE); page.wait_for_timeout(2900)
                tag = f"{breite}/{'konto' if angemeldet else 'gast'}/{modus}"
                kl = page.locator("[data-kopfleiste]")
                pruefe(kl.count() == 1, f"{tag}: Kopfleiste fehlt")
                pruefe(kl.get_attribute("data-modus") == modus, f"{tag}: Kopfleiste folgt dem Modus nicht")
                pruefe(not page.evaluate("document.documentElement.scrollWidth > window.innerWidth + 1"), f"{tag}: Überbreite")
                # Nichts in der Leiste überlappt, nichts ragt aus dem Fenster (Wortmarke, Menüpunkte, Knöpfe rechts)
                kaesten = page.evaluate("""() => [...document.querySelectorAll('.kl-marke > span, .kl-nav button, .kl-rechts > *')]
                  .filter(e => e.offsetParent !== null && getComputedStyle(e).visibility !== 'hidden')
                  .map(e => { const r = e.getBoundingClientRect(); return [e.className || e.textContent.trim(), r.left, r.right, r.top, r.bottom]; })""")
                for i, (n1, l1, r1, o1, u1) in enumerate(kaesten):
                    pruefe(l1 >= -0.5 and r1 <= breite + 0.5, f"{tag}: {n1} ragt aus dem Fenster ({l1:.0f}–{r1:.0f})")
                    for (n2, l2, r2, o2, u2) in kaesten[i + 1:]:
                        pruefe(not (l1 < r2 - 1 and l2 < r1 - 1 and o1 < u2 - 1 and o2 < u1 - 1), f"{tag}: {n1} überlappt {n2}")
                foto(page, f"kopf-{breite}-{'konto' if angemeldet else 'gast'}-{modus}")
                foto(page, f"seite-{breite}-{'konto' if angemeldet else 'gast'}-{modus}", ganz=True)

                nav = page.locator(".kl-nav [data-besucher-menue]")
                logo = page.evaluate("parseFloat(getComputedStyle(document.querySelector('.kl-marke > span')).fontSize)")
                if angemeldet:
                    pruefe(nav.count() == 0, f"{tag}: Besuchermenü trotz Anmeldung")
                    pruefe(page.locator(".kl-slogan").count() == 1, f"{tag}: Slogan fehlt")
                    pruefe(page.locator("[data-hm-chip]").count() == 1, f"{tag}: Konto-Chip fehlt")
                else:
                    pruefe(nav.count() == 4, f"{tag}: Besuchermenü hat nicht vier Punkte")
                    texte = [t.replace(" ", " ").strip() for t in nav.all_inner_texts()]
                    pruefe(texte[:2] == ["Vision", "Mathe lernen"] and texte[3] == "Blog" and texte[2].replace(" ", "") == "MathildaAI", f"{tag}: Menütexte {texte}")
                    pruefe(page.locator(".kl-nav [aria-expanded]").count() == 0, f"{tag}: Menü klappt aus")
                    pruefe(page.locator(".kl-slogan").count() == 0, f"{tag}: Slogan bei Gast")
                    for e in nav.all():
                        bb = e.bounding_box()
                        pruefe(bb and bb["x"] >= 0 and bb["x"] + bb["width"] <= breite + 1, f"{tag}: Menüpunkt ragt heraus")
                    farbe = page.evaluate("getComputedStyle(document.querySelector('[data-besucher-menue=vision]')).color")
                    if modus != "hell":
                        pruefe(farbe == FARBE_WEISS, f"{tag}: Menüschrift nicht weiß ({farbe})")
                    ai = page.evaluate("getComputedStyle(document.querySelector('[data-besucher-menue=mathilda] > span > span + span')).color")
                    pruefe(ai in ("rgb(237, 187, 0)", "rgb(185, 138, 0)"), f"{tag}: AI nicht gold ({ai})")
                    # Wortmarke: ab 1000 px voll (40 px); die Zeile ist symmetrisch – das ☰ endet so weit vom rechten Rand
                    # wie die Wortmarke vom linken beginnt (seit 21.10., statt T über der Schlagzeile); darunter ein Drittel kleiner
                    if breite >= 1000:
                        pruefe(abs(logo - 40) < 0.6, f"{tag}: Wortmarke {logo}px statt 40px")
                        li, re = page.evaluate("""() => [document.querySelector('.kl-marke').getBoundingClientRect().left,
                          window.innerWidth - document.querySelector('.kl-rechts').getBoundingClientRect().right]""")
                        pruefe(abs(li - re) < 1.5, f"{tag}: Kopfzeile nicht symmetrisch (links {li:.1f}, rechts {re:.1f})")
                    else:
                        pruefe(logo <= 26.8, f"{tag}: Wortmarke {logo}px statt höchstens 26,7px")
                    pruefe(page.locator("[data-kl-anmelden]").is_visible() == (breite >= 700), f"{tag}: Anmelden ab 700 px")
                    # ab 1000 px eine Zeile, darunter zwei
                    mitte = lambda bb: bb["y"] + bb["height"] / 2
                    m0 = mitte(page.locator(".kl-marke").bounding_box())
                    zeilen = 1 + int(any(abs(mitte(e.bounding_box()) - m0) > 12 for e in nav.all()))
                    pruefe((zeilen == 1) == (breite >= 1000), f"{tag}: Menü sollte {'neben' if breite >= 1000 else 'unter'} der Wortmarke stehen")
                if angemeldet and breite >= 1280:
                    pruefe(abs(logo - 40) < 0.6, f"{tag}: Wortmarke {logo}px statt 40px")

                # Kein Modus-Knopf in der Leiste, keine Karos in Leiste und Startseite
                pruefe(page.locator("[data-kl-modus], .kl-modus").count() == 0, f"{tag}: Modus-Knopf steht noch in der Kopfleiste")
                karos = page.evaluate("""() => [...document.querySelectorAll('.kl, .kl *, .sbb, .sbb *')].some(e =>
                  /\\d+px \\d+px/.test(getComputedStyle(e).backgroundSize) || /\\d+px \\d+px/.test(getComputedStyle(e, '::before').backgroundSize))""")
                pruefe(not karos, f"{tag}: Karo-Raster in Kopfleiste oder Startseite")
                rechts = page.evaluate("[...document.querySelectorAll('.kl-rechts > *')].filter(e => e.offsetParent !== null).map(e => e.className)")
                pruefe(not any("modus" in (c or "") for c in rechts), f"{tag}: rechts {rechts}")

                # Darstellung ganz unten im ☰-Menü: dunkel | hell | mix, Leiste und Startseite ziehen mit
                if breite in (390, 1280) and (not angemeldet or modus == "mix"):
                    reihe = {"dunkel": "hell", "hell": "mix", "mix": "dunkel"}
                    page.locator("[data-hm-menue]").click(); page.wait_for_timeout(500)
                    # ab 900 px: Desktop-Menü, Darstellung steht dort in der Fußzeile
                    hm = "hmd" if breite >= 900 else "hm"
                    d = page.locator(f"[data-{hm}-darstellung]")
                    pruefe(d.count() == 1, f"{tag}: Darstellung fehlt im Menü")
                    if hm == "hm":
                        letzte = page.evaluate("(() => { const k = [...document.querySelector('[data-hauptmenue]').children].filter(e => e.tagName !== 'P'); return k[k.length - 1].hasAttribute('data-hm-darstellung'); })()")
                        pruefe(letzte, f"{tag}: Darstellung ist nicht der letzte Punkt im Menü")
                    else:
                        pruefe(page.locator(".hmd-fuss [data-hmd-darstellung]").count() == 1, f"{tag}: Darstellung steht nicht in der Fußzeile des Desktop-Menüs")
                    pruefe(page.locator(f"[data-{hm}-modus={modus}]").get_attribute("aria-pressed") == "true", f"{tag}: aktueller Modus nicht markiert")
                    d.scroll_into_view_if_needed()
                    page.locator(f"[data-{hm}-modus={reihe[modus]}]").click(); page.wait_for_timeout(300)
                    pruefe(kl.get_attribute("data-modus") == reihe[modus], f"{tag}: Menü schaltet die Leiste nicht um")
                    pruefe(page.evaluate("document.documentElement.getAttribute('data-start-modus')") == reihe[modus], f"{tag}: Startseite zieht nicht mit")
                    pruefe(page.locator(f"[data-{hm}-modus={reihe[modus]}]").get_attribute("aria-pressed") == "true", f"{tag}: neue Wahl nicht markiert")
                    pruefe(page.locator("[data-hauptmenue]").count() == 1, f"{tag}: Menü schließt beim Umschalten")
                    clip = page.evaluate("getComputedStyle(document.querySelector('.kl-marke > span > span:nth-child(2)')).backgroundClip")
                    pruefe(clip == "text", f"{tag}: Wortmarke nach Moduswechsel ohne Text-Clip ({clip}) – „mathe“ wird ein goldener Block")
                    page.locator(f"[data-{hm}-modus={modus}]").click(); page.wait_for_timeout(300)
                    pruefe(kl.get_attribute("data-modus") == modus, f"{tag}: zurückschalten geht nicht")
                    foto(page, f"menue-{breite}-{'konto' if angemeldet else 'gast'}-{modus}", ganz=True)
                    page.keyboard.press("Escape"); page.wait_for_timeout(400)

                # Kleben + Zusammenziehen beim Scrollen
                page.mouse.wheel(0, 900); page.wait_for_timeout(700)
                pruefe(kl.get_attribute("data-kompakt") == "1", f"{tag}: zieht sich nicht zusammen")
                top = kl.bounding_box()["y"]
                pruefe(abs(top) < 2, f"{tag}: Leiste klebt nicht oben (y={top})")
                foto(page, f"kompakt-{breite}-{'konto' if angemeldet else 'gast'}-{modus}")
                page.mouse.wheel(0, -2000); page.wait_for_timeout(500)

                # Menüpunkte (nur Gast, einmal je Breite im dunklen Modus reicht)
                if not angemeldet and modus == "dunkel" and breite in (390, 1280):
                    for punkt, anker in (("vision", "vision"), ("lernen", "lernen")):
                        page.locator(f"[data-besucher-menue={punkt}]").click(); page.wait_for_timeout(1600)
                        y = page.evaluate(f"document.getElementById('{anker}').getBoundingClientRect().top")
                        pruefe(-5 < y < 140, f"{tag}: {punkt} springt nicht zum Abschnitt (top={y})")
                    page.locator("[data-besucher-menue=mathilda]").click(); page.wait_for_timeout(1500)
                    pruefe(page.locator("[data-besucher-menue=mathilda]").get_attribute("aria-current") == "page", f"{tag}: Mathilda nicht markiert")
                    page.locator("[data-besucher-menue=blog]").click(); page.wait_for_timeout(1500)
                    pruefe(page.url.rstrip("/").endswith("/blog"), f"{tag}: Blog-Adresse {page.url}")
                    pruefe(page.locator("[data-blog-liste] .bl-eintrag").count() == 6, f"{tag}: Blog zeigt nicht sechs Beiträge")
                    pruefe(page.locator("[data-besucher-menue=blog]").get_attribute("aria-current") == "page", f"{tag}: Blog nicht markiert")
                    pruefe(not page.evaluate("document.documentElement.scrollWidth > window.innerWidth + 1"), f"{tag}: Blog Überbreite")
                    foto(page, f"blog-{breite}", ganz=True)
                    page.locator(".bl-box").nth(1).click(); page.wait_for_timeout(1200)
                    pruefe("/blog/vektoren-sind-pfeile" in page.url, f"{tag}: Beitragsadresse {page.url}")
                    pruefe(page.locator("[data-blog-beitrag] .bl-text p").count() >= 3, f"{tag}: Beitragstext fehlt")
                    foto(page, f"beitrag-{breite}", ganz=True)
                    page.locator(".bl-ende h2 button").click(); page.wait_for_timeout(1000)
                    pruefe("/blog/erwartungswert" in page.url, f"{tag}: Nächster Beitrag falsch {page.url}")
                    page.go_back(); page.wait_for_timeout(1000)
                    pruefe("/blog/vektoren-sind-pfeile" in page.url, f"{tag}: Zurück-Taste im Blog {page.url}")
                    page.locator(".bl-ende .bl-zurueck").click(); page.wait_for_timeout(900)
                    pruefe(page.url.rstrip("/").endswith("/blog"), f"{tag}: Alle Beiträge {page.url}")
                    # Direktaufruf eines Beitrags
                    page.goto(BASE + "blog/rechenpapier"); page.wait_for_timeout(1800)
                    pruefe(page.locator("[data-blog-beitrag=rechenpapier]").count() == 1, f"{tag}: Direktlink auf Beitrag")

                pruefe(not konsole, f"{tag}: {konsole}")
                ctx.close()
    b.close()

print("OK" if not fehler else f"{len(fehler)} Fehler")
raise SystemExit(1 if fehler else 0)
