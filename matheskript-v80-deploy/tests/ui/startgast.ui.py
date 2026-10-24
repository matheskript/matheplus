"""Browser-Test Story-Startseite für Besucher ohne Konto (22.10., funcStartGast.jsx).
· Ohne Konto: Bühne mit Goldknopf „Kostenlos starten“ + „Wie das geht“, vier Produkt-Fakten, Problem in drei Karten (der Gegner
  durchgestrichen, „Die 7 Mathe-Mythen“), drei Schritte, Start-Karte als Demo (id heute, Klassenwahl), Mathilda-Block,
  Suche + Navigator unter id lernen, sechs Kurs-Karten, Abschluss (id reise) mit Pen-&-Paper-Knopf. Kein Band, keine Zone „Heute trainierst du“.
· Seit 24.10. keine Person auf der Seite: kein Mentor-Streifen, kein Name, keine Notengeschichte, keine „Zwei Wege“, kein Blog-Anriss.
· „Kostenlos starten“ springt zur Start-Karte; Klasse wählen → Heute-Karte erscheint, die Seite bleibt die Geschichte.
· Testzugang (Start-Karte „Testen“) → Dashboard (Band mit fünf Chips). Abmelden → wieder die Geschichte ohne gemerkte Klasse.
· localStorage mm-start-app = 1 → Dashboard auch ohne Konto (für die anderen Browser-Tests).
· Keine Seitenüberbreite, keine Konsolenfehler bei 360, 390 und 1280 px; Handy-Leiste nur unter 840 px.
  npx vite build && npx vite preview --port 4173 &   →   python3 tests/ui/startgast.ui.py
"""
import os
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
AUS = os.environ.get("SCREENS", "/tmp/startgast")
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
        pg.evaluate("localStorage.clear(); sessionStorage.clear(); localStorage.setItem('matheplus-start-modus','mix')")
        pg.reload(); pg.wait_for_timeout(1800)
        tag = f"{breite}"

        pruefe(pg.locator("[data-start-gast]").count() == 1, f"{tag}: Story-Startseite fehlt")
        pruefe(pg.locator("[data-start-band]").count() == 0, f"{tag}: Band des Dashboards auf der Geschichte")
        pruefe(pg.locator("[data-start-gast-los]").count() == 1 and pg.locator("[data-start-gast-wie]").count() == 1, f"{tag}: Knöpfe der Bühne fehlen")
        mitte = pg.evaluate("""() => { const k = document.querySelector('[data-start-gast-los]'); const cs = getComputedStyle(k);
            const r = document.createRange(); r.selectNodeContents(k); const t = r.getBoundingClientRect(), o = k.getBoundingClientRect();
            return { oben: t.top - o.top, unten: o.bottom - t.bottom, pt: cs.paddingTop, pb: cs.paddingBottom }; }""")
        pruefe(mitte["pt"] == mitte["pb"] and abs(mitte["oben"] - mitte["unten"]) <= 3, f"{tag}: Text im Goldknopf nicht mittig {mitte}")
        pruefe(pg.locator(".sg-fakt").count() == 4, f"{tag}: nicht vier Fakten")
        pruefe(pg.locator("[data-start-gast-problem] .sg-karte").count() == 3 and pg.locator("[data-start-gast-problem] .sg-karte.gegner").count() == 1, f"{tag}: Problem nicht in drei Karten")
        pruefe(pg.locator("[data-start-gast-mythen]").count() == 1, f"{tag}: Link zu den 7 Mythen fehlt")
        koerper = pg.evaluate("document.body.innerText")
        pruefe(pg.locator("#mentor").count() == 0 and "Ich war die 2" not in koerper, f"{tag}: Mentor-Streifen ist zurück")
        pruefe(not any(w in koerper for w in ["Blumenröther", "Basti", "Preisträger", "Uni Konstanz", "Universität Konstanz"]), f"{tag}: Person auf der Gast-Startseite")
        pruefe(pg.locator("[data-start-gast-wege], [data-start-blog]").count() == 0, f"{tag}: Zwei Wege oder Blog-Anriss sind zurück")
        pruefe(pg.locator("[data-start-gast-plan] .sg-schritt").count() == 3, f"{tag}: nicht drei Schritte")
        for a in ["heute", "mathilda", "lernen", "kurse", "reise"]:
            pruefe(pg.locator(f"#{a}").count() == 1, f"{tag}: Anker {a} fehlt")
        pruefe(pg.locator("[data-startkarte='wahl']").count() == 1, f"{tag}: Start-Karte (Klassenwahl) fehlt")
        pruefe(pg.locator("[data-start-mathilda]").count() == 1, f"{tag}: Mathilda-Block fehlt")
        pruefe(pg.locator("#lernen .such-buehne-feld, #lernen input").count() >= 1, f"{tag}: Suche unter den Werkzeugen fehlt")
        pruefe(pg.locator(".sbb-schul .sbb-stufe").count() == 4, f"{tag}: Navigator ohne vier Stufen")
        pruefe(pg.locator("[data-start-kurs]").count() == 6, f"{tag}: nicht sechs Kurs-Karten")
        pruefe(pg.locator("[data-start-gast-schluss]").count() == 1, f"{tag}: Abschluss-Knopf fehlt")
        pruefe(pg.locator("text=Heute trainierst du").count() == 0, f"{tag}: Zone „Heute trainierst du“ auf der Geschichte")
        hoehe_seite = pg.evaluate("document.documentElement.scrollHeight")
        print(tag, "Höhe", hoehe_seite)
        pruefe(hoehe_seite < (4700 if breite >= 1000 else 6100), f"{tag}: Geschichte zu lang ({hoehe_seite} px)")
        pg.screenshot(path=f"{AUS}/gast-{tag}.png", full_page=True)

        # Goldknopf springt zur Start-Karte; Handy-Leiste erscheint erst dazwischen
        pg.locator("[data-start-gast-los]").click(); pg.wait_for_timeout(1200)
        top = pg.evaluate("document.getElementById('heute').getBoundingClientRect().top")
        pruefe(-40 <= top <= 140, f"{tag}: „Kostenlos starten“ springt nicht zur Start-Karte (top {top:.0f})")
        leiste = pg.locator("[data-start-gast-leiste]")
        if breite < 840:
            pruefe(leiste.count() == 1 and "da" not in (leiste.get_attribute("class") or ""), f"{tag}: Handy-Leiste sichtbar, obwohl die Start-Karte im Bild ist")
            pg.evaluate("window.scrollTo(0, document.getElementById('problem').offsetTop)"); pg.wait_for_timeout(500)
            pruefe("da" in (leiste.get_attribute("class") or ""), f"{tag}: Handy-Leiste fehlt zwischen Bühne und Start-Karte")
            pg.screenshot(path=f"{AUS}/gast-{tag}-leiste.png")
        else:
            pruefe(leiste.evaluate("e => getComputedStyle(e).display") == "none", f"{tag}: Handy-Leiste am Desktop sichtbar")

        # Klasse wählen → Heute-Karte in der Geschichte, kein Dashboard
        pg.locator("[data-sk-klasse='11']").first.click(); pg.wait_for_timeout(1500)
        pruefe(pg.locator("[data-startkarte='heute']").count() == 1 and pg.locator("[data-heute-karte]").count() == 1, f"{tag}: Heute-Karte nach Klassenwahl fehlt")
        pruefe(pg.locator("[data-start-gast]").count() == 1 and pg.locator("[data-start-band]").count() == 0, f"{tag}: Klassenwahl verlässt die Geschichte")
        pg.screenshot(path=f"{AUS}/gast-{tag}-klasse.png", full_page=True)

        # Testzugang → Dashboard; Abmelden → Geschichte ohne gemerkte Klasse
        pg.locator("[data-testkonto]").first.click(); pg.wait_for_timeout(1500)
        pg.goto(BASE); pg.wait_for_timeout(1800)
        pruefe(pg.locator("[data-start-band]").count() == 1 and pg.locator("[data-start-gast]").count() == 0, f"{tag}: Testzugang zeigt kein Dashboard")
        # Echtes Abmelden über ☰ (Handy-Fenster bzw. Desktop-Menü): abmelden() vergisst Klasse, Thema, Stufe, zuletzt benutztes Werkzeug
        pg.locator("[data-hm-menue]").click(); pg.wait_for_timeout(300)
        if breite >= 900:
            pg.locator("[data-hm-zugang]").click()
        else:
            pg.locator(".hm-fenster .hm-eintrag", has_text="Abmelden").click()
        pg.locator("[data-hm-abmelden-ja]").click(); pg.wait_for_timeout(900)
        pg.goto(BASE); pg.wait_for_timeout(1800)
        pruefe(pg.locator("[data-start-gast]").count() == 1, f"{tag}: nach dem Abmelden keine Geschichte")
        pruefe(pg.locator("[data-startkarte='wahl']").count() == 1 and pg.evaluate("localStorage.getItem('matheplus-quickfinder')") is None, f"{tag}: Abmelden vergisst die Klasse nicht")

        # Erzwungenes Dashboard für die anderen Browser-Tests
        pg.evaluate("localStorage.setItem('mm-start-app','1')"); pg.reload(); pg.wait_for_timeout(1500)
        pruefe(pg.locator("[data-start-band]").count() == 1, f"{tag}: mm-start-app zeigt kein Dashboard")

        breit = pg.evaluate("document.documentElement.scrollWidth")
        pruefe(breit == breite, f"{tag}: Seitenüberbreite ({breit} px)")
        pruefe(not konsole, f"{tag}: Konsolenfehler: {konsole[:3]}")
        ctx.close()
    b.close()

print("Fehler:", len(fehler))
raise SystemExit(1 if fehler else 0)
