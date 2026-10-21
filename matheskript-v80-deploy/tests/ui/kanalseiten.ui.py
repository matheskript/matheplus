"""Browser-Test Kanal-Landingpages (src/funcKanalSeite.jsx, Daten src/kanalSeiten.js).
  npx vite build && npx vite preview --port 4173 &   →   python3 tests/ui/kanalseiten.ui.py
  BILDER=<ordner> legt Bildschirmfotos ab (ganze Seite, in Streifen).

Geprüft je Seite (/poster /thema /insta /eltern /abi-eltern) und Breite (390, 1280):
  - Seite lädt ohne Seitenfehler, keine Überbreite, Titel gesetzt, Adresse bleibt der Direktlink
  - Kopf mit Schlagzeile, Einstiegskarte, Vertrauensleiste; alle fünf StorySkript-Abschnitte da
  - Handy: feste Knopfleiste erscheint nach dem Kopf
  - /poster: Datum + Thema → Klausur-Planer (/klausur-vorbereiten) mit vorbelegtem Thema
  - /insta: „Tag 1 starten“ schaltet Tag 1 frei, Tag 2 bleibt gesperrt
  - /eltern und /abi-eltern: Formular mit Name, Telefon, E-Mail, Klasse; ohne Angaben Fehlermeldung
  - Schüler-Seiten: Eltern-Weiche mit WhatsApp-Link auf /eltern?via=…
"""
import os
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/").rstrip("/") + "/"
BILDER = os.environ.get("BILDER")
PW_HASH = "744ac4c7a298e917d88972fbbf5a9440cc04c24e24b63c62d292b1771ab69d7b"   # Entwurfs-Freigabe (seitenKonstanten.js)
SEITEN = ["poster", "thema", "insta", "eltern", "abi-eltern"]
fehler = []
def pruefe(bed, text):
    if not bed:
        fehler.append(text); print("FEHLT:", text)

def foto(page, name):
    if not BILDER: return
    os.makedirs(BILDER, exist_ok=True)
    page.screenshot(path=os.path.join(BILDER, name + ".png"), full_page=True)

def oeffnen(b, breite, pfad):
    ctx = b.new_context(viewport={"width": breite, "height": 860}, locale="de-DE")
    page = ctx.new_page()
    konsole = []
    page.on("pageerror", lambda e: konsole.append(f"pageerror: {e}"))
    page.goto(BASE)
    page.evaluate(f"localStorage.clear(); sessionStorage.clear(); sessionStorage.setItem('mm-entwurf-frei', '{PW_HASH}'); localStorage.setItem('mm-onboarding-v1', JSON.stringify({{uebersprungen:true}}));")
    page.goto(BASE + pfad); page.wait_for_timeout(2500)
    return ctx, page, konsole

with sync_playwright() as p:
    b = p.chromium.launch()
    for pfad in SEITEN:
        for breite in (390, 1280):
            ctx, page, konsole = oeffnen(b, breite, pfad)
            k = f"{pfad}@{breite}"
            pruefe(not konsole, f"{k}: {konsole}")
            pruefe(page.evaluate("document.documentElement.scrollWidth") <= breite, f"{k}: Überbreite")
            pruefe(page.evaluate("location.pathname") == "/" + pfad, f"{k}: Adresse {page.evaluate('location.pathname')}")
            pruefe("Mythos Mathe" in page.title(), f"{k}: Titel {page.title()}")
            pruefe(page.locator(".lp-kopf h1").count() == 1, f"{k}: Schlagzeile")
            pruefe(page.locator("#ks-einstieg").count() == 1, f"{k}: Einstiegskarte")
            pruefe(page.locator(".lp-vertrauen b").count() == 4, f"{k}: Vertrauensleiste")
            pruefe(page.locator(".lp-ebene").count() == 3 and page.locator(".lp-ebene-gegner").count() == 1, f"{k}: drei Ebenen")
            pruefe(page.locator(".lp-beleg").count() == 3 and page.locator(".lp-plan li").count() == 3, f"{k}: Mentor und Plan")
            pruefe(page.locator(".lp-angebot").count() >= 1 and page.locator(".lp-weg").count() == 2, f"{k}: Angebote und zwei Wege")
            pruefe(page.locator("#ks-abschluss").count() == 1, f"{k}: Abschluss")
            foto(page, f"kanal-{pfad}-{breite}")
            if breite == 390:
                page.locator("#ks-abschluss").scroll_into_view_if_needed(); page.wait_for_timeout(400)
                page.evaluate("window.scrollBy(0, -1200)"); page.wait_for_timeout(600)
                pruefe(page.locator(".lp-leiste.lp-leiste-an").count() == 1, f"{k}: feste Leiste")
            if pfad in ("poster", "thema", "insta"):
                pruefe(page.locator(".ks-weiche").count() == 1, f"{k}: Eltern-Weiche")
                wa = page.locator(".ks-weiche a.lp-gold").get_attribute("href") or ""
                pruefe(wa.startswith("https://wa.me/?text=") and "%2Feltern%3Fvia%3D" in wa, f"{k}: WhatsApp-Link {wa[:80]}")
            if pfad == "poster" and breite == 390:
                page.fill("#ks-thema", "Ableitungen")
                page.click("#ks-einstieg button[type=submit]"); page.wait_for_timeout(300)
                pruefe(page.locator(".ks-fehler").count() == 1, f"{k}: ohne Klasse Hinweis")
                page.select_option("#ks-klasse-p", "10")
                page.click("#ks-einstieg button[type=submit]"); page.wait_for_timeout(1500)
                pruefe(page.evaluate("location.pathname") == "/klausur-vorbereiten", f"{k}: Klausur-Planer öffnet sich ({page.evaluate('location.pathname')})")
                pruefe(page.locator("input[type=date]").count() == 1 and page.locator("input[type=date]").input_value() >= "2026", f"{k}: Terminformular offen (kein Profil-Zwischenschritt)")
                pruefe(page.locator("input[placeholder]").filter(has_text="").count() >= 1, f"{k}: Formular da")
                foto(page, "kanal-poster-planer-390")
            if pfad == "insta" and breite == 1280:
                page.click("#ks-einstieg button"); page.wait_for_timeout(600)
                pruefe(page.locator(".ks-tag.offen").count() == 1 and page.locator(".ks-tag.zu").count() == 6, f"{k}: Tag 1 frei, Rest gesperrt")
                pruefe("Tag 1 von 7" in page.locator("#ks-einstieg h2").inner_text(), f"{k}: Karte zeigt Stand")
                foto(page, "kanal-insta-serie-1280")
            if pfad in ("eltern", "abi-eltern") and breite == 1280:
                for feld in ("#ks-name", "#ks-telefon", "#ks-mail", "#ks-klasse", "#ks-termine"):
                    pruefe(page.locator(feld).count() == 1, f"{k}: Feld {feld}")
                page.click("#ks-einstieg button[type=submit]"); page.wait_for_timeout(300)
                pruefe(page.locator(".ks-fehler").count() == 1, f"{k}: Fehlermeldung ohne Angaben")
                pruefe("Sie" in page.locator(".lp-kopf").inner_text() and " du " not in page.locator(".lp-kopf").inner_text().lower(), f"{k}: siezt im Kopf")
            ctx.close()
    b.close()

print("OK" if not fehler else f"{len(fehler)} Fehler")
raise SystemExit(1 if fehler else 0)
