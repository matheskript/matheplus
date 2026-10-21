"""Browser-Test Desktop-Menü (ab 900 px öffnet ☰ das Menü über den ganzen Bildschirm, funcHauptmenueDesktop.jsx).
  npx vite build && npx vite preview --port 4173 &   →   python3 tests/ui/hauptmenue-desktop.ui.py
  Optional BILDER=/pfad für Screenshots.
Prüft: 1440/1100/920 Desktop-Menü (Gast + Konto, dunkel/hell/mix), 390/860 weiter das ☰-Fenster,
keine Überbreite, Mathilda-Karte, alle Kurse, Bereiche → Stationen → Werkzeug öffnen, Stufen-Schalter,
Suche („/“, Enter, Esc schließt erst die Suche, dann das Menü), Fokus zurück auf ☰, Seite wieder scrollbar,
Darstellung umschalten, Klassenwahl ohne Konto, Abmelden mit Bestätigung.
"""
import os, json
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
BILDER = os.environ.get("BILDER")
fehler = []
def pruefe(bed, text):
    if not bed:
        fehler.append(text); print("FEHLT:", text)

DEMO = {"nutzer": {"id": "demo-1", "email": "lena@example.de"}, "profil": {"id": "demo-1", "name": "Lena", "rolle": "schueler", "geschlecht": "w", "schulform": "G9", "klasse": 12}}

# ☰ öffnen. Besucher unter 1000 px sehen zuerst das Besuchermenü (seit 21.10.) – „Alle Bereiche und Werkzeuge“ führt weiter.
def menue_auf(page, warten):
    page.locator("[data-hm-menue]").click(); page.wait_for_timeout(warten)
    if page.locator("[data-besuchermenue]").count():
        page.locator("[data-kl-bm-alles]").click(); page.wait_for_timeout(warten)

def oeffne(b, breite, hoehe, angemeldet, modus="dunkel"):
    ctx = b.new_context(viewport={"width": breite, "height": hoehe}, locale="de-DE")
    page = ctx.new_page()
    page.konsole = []
    page.on("pageerror", lambda e: page.konsole.append(f"pageerror: {e}"))
    page.goto(BASE)
    page.evaluate("localStorage.clear(); localStorage.setItem('mm-onboarding-v1', JSON.stringify({uebersprungen:true}));")
    page.evaluate(f"localStorage.setItem('matheplus-start-modus', {json.dumps(modus)})")
    if angemeldet:
        page.evaluate(f"localStorage.setItem('mm-demo-konto', {json.dumps(json.dumps(DEMO))})")
        page.evaluate("localStorage.setItem('matheplus-zuletzt-werkzeug', JSON.stringify({ansicht:'kreuzprodukt', zeit: Date.now()}))")
    page.goto(BASE); page.wait_for_timeout(1400)
    return ctx, page

with sync_playwright() as p:
    b = p.chromium.launch()

    # Handy und schmale Fenster: weiter das ☰-Fenster
    for breite in (390, 860):
        ctx, page = oeffne(b, breite, 820, False)
        menue_auf(page, 300)
        pruefe(page.locator("[data-hm-desktop]").count() == 0 and page.locator(".hm-fenster.hm-menue").count() == 1, f"{breite}: hier soll das ☰-Fenster aufgehen")
        ctx.close()

    for breite, hoehe in ((1440, 900), (1100, 900), (920, 800)):
        for angemeldet in (False, True):
            for modus in (("dunkel", "hell", "mix") if breite == 1440 else ("dunkel",)):
                tag = f"{breite}/{'konto' if angemeldet else 'gast'}/{modus}"
                ctx, page = oeffne(b, breite, hoehe, angemeldet, modus)
                menue_auf(page, 600)
                m = page.locator("[data-hm-desktop]")
                pruefe(m.count() == 1, f"{tag}: Desktop-Menü geht nicht auf")
                pruefe(page.locator(".hm-fenster").count() == 0, f"{tag}: schmales ☰-Fenster ist zusätzlich offen")
                if not m.count():
                    ctx.close(); continue
                bx = m.bounding_box()
                pruefe(bx["x"] == 0 and bx["y"] == 0 and abs(bx["width"] - breite) < 1 and abs(bx["height"] - hoehe) < 1, f"{tag}: Menü deckt nicht den Bildschirm ({bx})")
                pruefe(m.get_attribute("data-modus") == modus, f"{tag}: Modus {m.get_attribute('data-modus')} statt {modus}")
                pruefe(page.evaluate("(() => { const e = document.querySelector('[data-hm-desktop]'); return e.scrollWidth <= e.clientWidth + 1; })()"), f"{tag}: Überbreite im Menü")
                pruefe(page.evaluate("getComputedStyle(document.documentElement).overflow") == "hidden", f"{tag}: Seite dahinter scrollt mit")
                pruefe("Blatt scannen" in m.locator("[data-hm-mathilda]").inner_text() and m.locator("[data-hm-mathilda] .hmd-ki").count() == 4, f"{tag}: Mathilda-Karte unvollständig")
                pruefe(m.locator("[data-hmd-kurs]").count() >= 11, f"{tag}: nur {m.locator('[data-hmd-kurs]').count()} Kurse")
                pruefe(m.locator("[data-hmd-training]").count() == 4, f"{tag}: Mein Mathe-Training hat nicht 4 Kacheln (Heute · Themen · Prüfung · Standortcheck)")
                pruefe(m.locator("[data-hmd-darstellung] button").count() == 5, f"{tag}: Darstellung fehlt (Dunkel, Hell, Mix, FCB, GER)")
                pruefe((m.locator("[data-hm-weiter]").count() == 1) == angemeldet, f"{tag}: Weitermachen falsch")
                fuss = m.locator("[data-hm-zugang]").inner_text()
                pruefe(("Abmelden" if angemeldet else "Anmelden") in fuss, f"{tag}: Zugang unten zeigt {fuss!r}")
                pruefe((m.locator("[data-hm-testkonto]").count() == 1) != angemeldet, f"{tag}: Test-Account falsch")
                if angemeldet:
                    pruefe("Klasse 12 (G9)" in m.locator("[data-hmd-abschnitt='klasse']").inner_text(), f"{tag}: Schulbuch zeigt nicht Klasse 12 (G9)")
                    # Weitermachen: der Bereich des zuletzt benutzten Werkzeugs ist offen, das Werkzeug steht darin
                    pruefe(m.locator("[data-hmd-stationen] [data-hmd-werkzeug='kreuzprodukt']").count() == 1, f"{tag}: Bereich des letzten Werkzeugs ist nicht offen")
                # Spalten nebeneinander bzw. zwei Spalten unter 1280 px
                sp = [m.locator(f".hmd-sp.{x}").bounding_box() for x in "abc"]
                if breite >= 1280:
                    pruefe(sp[0]["x"] < sp[1]["x"] < sp[2]["x"] and abs(sp[0]["y"] - sp[2]["y"]) < 2, f"{tag}: drei Spalten stehen nicht nebeneinander")
                else:
                    pruefe(sp[0]["x"] < sp[1]["x"] and abs(sp[1]["x"] - sp[2]["x"]) < 2 and sp[2]["y"] > sp[1]["y"], f"{tag}: zwei Spalten falsch angeordnet")
                if BILDER: page.screenshot(path=f"{BILDER}/hmd-{breite}-{'k' if angemeldet else 'g'}-{modus}.png")

                if modus == "dunkel":
                    # Stufen-Schalter: Unterstufe hat Brüche, keine Vektoren
                    m.locator("[data-hmd-stufe='unter']").click(); page.wait_for_timeout(200)
                    ids = m.locator("[data-hmd-bereich]").evaluate_all("l => l.map(e => e.dataset.hmdBereich)")
                    pruefe("bruchrechnen" in ids and "vektoren" not in ids, f"{tag}: Stufe Unter zeigt {ids}")
                    m.locator("[data-hmd-stufe='ober']").click(); page.wait_for_timeout(200)
                    ids = m.locator("[data-hmd-bereich]").evaluate_all("l => l.map(e => e.dataset.hmdBereich)")
                    pruefe("vektoren" in ids and "abitur" in ids, f"{tag}: Stufe Ober zeigt {ids}")
                    # Bereich aufklappen: Stationen mit Werkzeugen, ein zweiter Klick klappt zu
                    m.locator("[data-hmd-bereich='analysis']").click(); page.wait_for_timeout(250)
                    pruefe(m.locator("[data-hmd-stationen='analysis'] .hmd-wz").count() >= 5, f"{tag}: Analysis zeigt keine Werkzeuge")
                    if BILDER: page.screenshot(path=f"{BILDER}/hmd-{breite}-{'k' if angemeldet else 'g'}-analysis.png")
                    m.locator("[data-hmd-bereich='analysis']").click(); page.wait_for_timeout(150)
                    pruefe(m.locator("[data-hmd-stationen]").count() == 0, f"{tag}: Bereich klappt nicht zu")

                    # Suche: „/“ öffnet, Enter sucht, Esc schließt erst die Suche
                    m.focus(); page.keyboard.press("/"); page.wait_for_timeout(250)
                    pruefe(m.locator("[data-hmd-suchfeld]").count() == 1, f"{tag}: „/“ öffnet die Suche nicht")
                    pruefe(page.evaluate("document.activeElement && document.activeElement.type === 'search'"), f"{tag}: Suchfeld hat keinen Fokus")
                    page.keyboard.type("Kettenregel"); page.keyboard.press("Enter"); page.wait_for_timeout(400)
                    pruefe(m.locator("[data-hmd-suchfeld]").inner_text().count("Kettenregel") >= 1, f"{tag}: Suche liefert nichts")
                    if BILDER and breite == 1440: page.screenshot(path=f"{BILDER}/hmd-{breite}-{'k' if angemeldet else 'g'}-suche.png")
                    page.keyboard.press("Escape"); page.wait_for_timeout(200)
                    pruefe(m.locator("[data-hmd-suchfeld]").count() == 0 and page.locator("[data-hm-desktop]").count() == 1, f"{tag}: Esc schließt nicht nur die Suche")
                    page.keyboard.press("Escape"); page.wait_for_timeout(250)
                    pruefe(page.locator("[data-hm-desktop]").count() == 0, f"{tag}: Esc schließt das Menü nicht")
                    pruefe(page.evaluate("getComputedStyle(document.documentElement).overflow") != "hidden", f"{tag}: Seite bleibt nach dem Schließen gesperrt")
                    pruefe(page.evaluate("document.activeElement && document.activeElement.hasAttribute('data-hm-menue')"), f"{tag}: Fokus nicht zurück auf ☰")

                    # Werkzeug aus dem Menü öffnen
                    menue_auf(page, 500)
                    m = page.locator("[data-hm-desktop]")
                    if not m.locator("[data-hmd-stationen='vektoren']").count():
                        m.locator("[data-hmd-bereich='vektoren']").click(); page.wait_for_timeout(200)
                    m.locator("[data-hmd-werkzeug='kreuzprodukt']").first.click(); page.wait_for_timeout(900)
                    pruefe(page.locator("[data-hm-desktop]").count() == 0 and "kreuzprodukt" in page.url, f"{tag}: Kreuzprodukt öffnet nicht ({page.url})")

                    # Darstellung umschalten
                    menue_auf(page, 500)
                    m = page.locator("[data-hm-desktop]")
                    m.locator("[data-hmd-modus='hell']").click(); page.wait_for_timeout(250)
                    pruefe(m.get_attribute("data-modus") == "hell" and page.evaluate("localStorage.getItem('matheplus-start-modus')") == "hell", f"{tag}: Darstellung hell greift nicht")
                    m.locator("[data-hmd-modus='dunkel']").click(); page.wait_for_timeout(150)

                    if not angemeldet:
                        # Klasse ohne Konto wählen → Schulbuch zeigt die Kapitel
                        k = m.locator("[data-hmd-abschnitt='klasse']")
                        k.locator("button", has_text="G8").first.click(); page.wait_for_timeout(100)
                        k.locator("button", has_text="7").first.click(); page.wait_for_timeout(250)
                        pruefe("Klasse 7 (G8)" in k.inner_text() and k.locator("[data-hmd-kapitel]").count() >= 3, f"{tag}: Klassenwahl ohne Konto klappt nicht")
                        k.locator("[data-hmd-kapitel]").first.click(); page.wait_for_timeout(200)
                        pruefe(k.locator("[data-hm-kapitelseite]").count() == 1 and k.locator("[data-hm-trainieren]").count() == 1, f"{tag}: Kapitel klappt nicht auf (Kapitelseite + Trainieren)")
                    else:
                        m.locator("[data-hm-zugang]").click(); page.wait_for_timeout(300)
                        pruefe(page.locator("[data-hm-desktop]").count() == 0 and page.locator("[role='alertdialog']").count() == 1, f"{tag}: Abmelden fragt nicht nach")
                        page.keyboard.press("Escape"); page.wait_for_timeout(150)
                pruefe(not page.konsole, f"{tag}: {page.konsole}")
                ctx.close()

    # Größe ändern, während das Menü offen ist: unter 900 px wird es zum ☰-Fenster
    ctx, page = oeffne(b, 1280, 860, True)
    menue_auf(page, 400)
    page.set_viewport_size({"width": 800, "height": 860}); page.wait_for_timeout(400)
    pruefe(page.locator("[data-hm-desktop]").count() == 0 and page.locator(".hm-fenster.hm-menue").count() == 1, "Resize: Menü wechselt nicht aufs ☰-Fenster")
    pruefe(page.evaluate("getComputedStyle(document.documentElement).overflow") != "hidden", "Resize: Seite bleibt gesperrt")
    ctx.close()
    b.close()

print("FEHLER:", len(fehler))
for f in fehler: print(" -", f)
raise SystemExit(1 if fehler else 0)
