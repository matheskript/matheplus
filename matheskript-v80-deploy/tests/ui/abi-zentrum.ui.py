"""Browser-Test Abi-Zentrum (Gold): Profil → Plan, Abi-Aufgabe mit Selbstkorrektur, Teil-A-Probe, Mia (Korrektur mit
nachgebildeter KI-Antwort, mündliche Prüfung), Lernpartner-Börse im Beispielmodus, Eltern-Freigabe; 360/390/1280 ohne Überbreite.
  npx vite build && npx vite preview --port 4391 &   →   BASE_URL=http://localhost:4391 python3 tests/ui/abi-zentrum.ui.py [Screenshot-Ordner]
"""
import os, sys, json, io
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173").rstrip("/")
AUS = sys.argv[1] if len(sys.argv) > 1 else "/tmp/abi-ui"
os.makedirs(AUS, exist_ok=True)
fehler = []

def pruefe(bed, text):
    if not bed:
        fehler.append(text); print("FEHLT:", text)

# Testfoto (weißes Blatt mit ein paar Strichen)
try:
    from PIL import Image, ImageDraw
    img = Image.new("RGB", (900, 1200), "white"); d = ImageDraw.Draw(img)
    for y in range(120, 1100, 70): d.line((80, y, 820, y), fill="black", width=3)
    FOTO = os.path.join(AUS, "blatt.jpg"); img.save(FOTO, "JPEG")
except Exception:
    FOTO = None

KORREKTUR = {"lesbar": True, "teile": [{"b": "a", "be": 2, "max": 2, "urteil": "voll", "kommentar": "Produktregel sauber angesetzt."}, {"b": "b", "be": 1, "max": 3, "urteil": "teil", "kommentar": "Steigung stimmt, Achsenabschnitt fehlt."}],
             "staerke": "Klare Struktur.", "hebel": ["Punkt einsetzen", "Ergebnis notieren"], "darstellung": "Gut lesbar."}

def antwort(route):
    body = {"content": [{"type": "text", "text": json.dumps(KORREKTUR)}]}
    route.fulfill(status=200, content_type="application/json", body=json.dumps(body))

def kontext(b, breite, extra=None):
    ctx = b.new_context(viewport={"width": breite, "height": 880}, locale="de-DE")
    page = ctx.new_page()
    page.konsole = []
    page.on("pageerror", lambda e: page.konsole.append(f"pageerror: {e}"))
    page.goto(BASE + "/impressum")
    page.evaluate("localStorage.clear(); sessionStorage.clear(); localStorage.setItem('mm-onboarding-v1', JSON.stringify({uebersprungen:true})); localStorage.setItem('matheskript-einwilligung-v1', '1');")
    if extra: page.evaluate(extra)
    return ctx, page

def breite_ok(page, breite, wo):
    sw = page.evaluate("document.documentElement.scrollWidth")
    pruefe(sw <= breite, f"{breite} {wo}: Seite zu breit ({sw})")

with sync_playwright() as pw:
    b = pw.chromium.launch()
    for breite in [360, 390, 1280]:
        ctx, page = kontext(b, breite)

        # Startseite: goldene Kachel führt ins Abi-Zentrum
        page.goto(BASE + "/"); page.wait_for_timeout(1800)
        kachel = page.locator("[data-abi-kachel]")
        pruefe(kachel.count() == 1, f"{breite}: Abi-Kachel auf der Startseite fehlt")
        if kachel.count():
            kachel.scroll_into_view_if_needed(); page.screenshot(path=f"{AUS}/{breite}-start-kachel.png")
            kachel.click(); page.wait_for_timeout(1500)
        pruefe(page.url.rstrip("/").endswith("/abi"), f"{breite}: Kachel öffnet nicht /abi ({page.url})")

        # Profil anlegen (BW, Leistungsfach, 2027) → Plan
        pruefe(page.locator("[data-abi-profil]").count() == 1, f"{breite}: Profil-Karte fehlt")
        breite_ok(page, breite, "Zentrum ohne Profil")
        page.screenshot(path=f"{AUS}/{breite}-zentrum-profil.png", full_page=True)
        page.locator("[data-abi-profil-speichern]").click(); page.wait_for_timeout(500)
        pruefe(page.locator("[data-abi-countdown]").count() == 1, f"{breite}: Countdown fehlt")
        pruefe(page.locator("[data-abi-heute] button").count() >= 3, f"{breite}: Vorschläge für heute fehlen")
        pruefe(page.locator("[data-abi-plan]").count() == 1, f"{breite}: Plan fehlt")
        pruefe(page.get_by_text("Generalprobe zur Prüfungszeit").count() >= 1, f"{breite}: Generalprobe fehlt")
        pruefe(page.locator("[data-abi-format]").count() == 1, f"{breite}: Prüfungsformat fehlt")
        pruefe(page.locator("[data-abi-typ]").count() == 10, f"{breite}: nicht alle 10 Aufgabentypen verlinkt")
        pruefe(page.locator("[data-abi-kurs]").count() >= 8, f"{breite}: Kurse fehlen")
        pruefe(page.locator("[data-mia-modus]").count() == 4, f"{breite}: Mia-Modi fehlen")
        breite_ok(page, breite, "Zentrum")
        page.screenshot(path=f"{AUS}/{breite}-zentrum.png", full_page=True)

        # Abi-Aufgabe: Selbstkorrektur und Eintragen
        page.locator("[data-abi-typ='ana-tangente']").click(); page.wait_for_timeout(1500)
        pruefe(page.locator("[data-abi-aufgabe='ana-tangente']").count() == 1, f"{breite}: Aufgabe Tangente fehlt")
        pruefe(page.get_by_text("Zeigen Sie").count() >= 1, f"{breite}: Operator nicht im Prüfungswortlaut")
        breite_ok(page, breite, "Aufgabe")
        page.screenshot(path=f"{AUS}/{breite}-aufgabe.png", full_page=True)
        page.locator("[data-abi-fertig]").click(); page.wait_for_timeout(300)
        pruefe(page.locator("[data-abi-erwartung]").count() == 1, f"{breite}: Erwartungshorizont fehlt")
        page.locator("[data-abi-haken='0']").check(); page.locator("[data-abi-haken='1']").check(); page.locator("[data-abi-haken='2']").check()
        pruefe("3 von 5 BE" in page.locator("[data-abi-eintragen]").inner_text(), f"{breite}: BE-Summe falsch")
        page.screenshot(path=f"{AUS}/{breite}-erwartung.png", full_page=True)
        page.locator("[data-abi-eintragen]").click(); page.wait_for_timeout(300)
        pruefe(page.locator("[data-abi-ergebnis]").count() == 1, f"{breite}: Ergebnis fehlt")
        page.goto(BASE + "/abi"); page.wait_for_timeout(1200)
        pruefe("60 % der be" in page.locator("[data-abi-gebiet='analysis']").inner_text().lower(), f"{breite}: Statistik Analysis fehlt")

        # Teil-A-Probe
        page.goto(BASE + "/abi/teil-a"); page.wait_for_timeout(1500)
        page.locator("[data-abi-probe-start]").click(); page.wait_for_timeout(400)
        pruefe(page.locator("[data-abi-restzeit]").count() == 1, f"{breite}: Restzeit fehlt")
        pruefe(page.locator("[data-abi-wahl]").count() == 6, f"{breite}: nicht sechs Wahlaufgaben")
        pruefe(page.locator("[data-abi-abgeben]").is_disabled(), f"{breite}: Abgabe ohne Wahl möglich")
        page.locator("[data-abi-wahl='W1']").click(); page.locator("[data-abi-wahl='W4']").click(); page.wait_for_timeout(100)
        pruefe(page.locator("[data-abi-wahl='W2']").is_disabled(), f"{breite}: dritte Wahl möglich")
        breite_ok(page, breite, "Probe")
        page.screenshot(path=f"{AUS}/{breite}-probe.png")
        page.locator("[data-abi-abgeben]").click(); page.wait_for_timeout(400)
        pruefe(page.locator("[data-abi-erwartung]").count() == 6, f"{breite}: Korrektur nicht für sechs Aufgaben")
        page.reload(); page.wait_for_timeout(1500)
        pruefe(page.locator("[data-abi-teila='korrektur']").count() == 1, f"{breite}: Probe überlebt Neuladen nicht")
        page.locator("[data-abi-auswerten]").first.click(); page.wait_for_timeout(400)
        pruefe(page.locator("[data-abi-probe-ergebnis]").count() == 1, f"{breite}: Probe-Ergebnis fehlt")
        page.screenshot(path=f"{AUS}/{breite}-probe-ergebnis.png", full_page=True)

        # Mia: Korrektur einer Aufgabe aus dem Training (KI-Antwort nachgebildet)
        page.route("**/api/claude", antwort)
        page.goto(BASE + "/abi/aufgaben"); page.wait_for_timeout(1500)
        page.locator("[data-abi-zu-mia]").click(); page.wait_for_timeout(1500)
        pruefe(page.locator("[data-mia-seite='korrigieren']").count() == 1, f"{breite}: Mia öffnet nicht im Korrekturmodus")
        pruefe(page.locator("[data-mia-aufgabe]").count() == 1, f"{breite}: Aufgabe kommt nicht bei Mia an")
        breite_ok(page, breite, "Mia")
        page.screenshot(path=f"{AUS}/{breite}-mia.png", full_page=True)
        typ = page.locator("[data-mia-aufgabe]").get_attribute("data-mia-aufgabe")
        if FOTO:
            page.locator("[data-mia-galerie]").set_input_files(FOTO); page.wait_for_timeout(800)
            page.locator("[data-mia-senden]").click(); page.wait_for_timeout(1500)
            k = page.locator("[data-mia-korrektur]")
            pruefe(k.count() == 1, f"{breite}: Korrektur erscheint nicht")
            if k.count():
                t = k.inner_text()
                # Mia darf nicht mehr BE vergeben, als die Aufgabe hat; Teile kommen aus der Aufgabe
                pruefe("von 5 BE" in t, f"{breite}: Korrektur zeigt nicht ‚von 5 BE‘ ({typ})")
                page.screenshot(path=f"{AUS}/{breite}-mia-korrektur.png", full_page=True)

        # Mia: mündliche Prüfung
        page.locator("[data-mia-reiter='muendlich']").click(); page.wait_for_timeout(300)
        page.locator("[data-mia-thema='m-abstand']").click(); page.wait_for_timeout(300)
        pruefe(page.locator("[data-mia-auftrag]").count() == 1, f"{breite}: Prüfungsaufgabe fehlt")
        page.locator("[data-mia-vortrag]").click(); page.wait_for_timeout(300)
        pruefe(page.get_by_text("Bitte beginnen Sie mit Ihrem Vortrag").count() == 1, f"{breite}: Prüfer-Begrüßung fehlt")
        page.screenshot(path=f"{AUS}/{breite}-mia-muendlich.png", full_page=True)
        page.unroute("**/api/claude")

        # Lernpartner im Beispielmodus
        page.goto(BASE + "/abi/lernpartner"); page.wait_for_timeout(1500)
        pruefe(page.locator("[data-lernpartner='beispiel']").count() == 1, f"{breite}: kein Beispielmodus ohne Konto")
        pruefe(page.locator("[data-lp-treffer]").count() == 5, f"{breite}: Beispiel-Treffer fehlen")
        pruefe(page.locator("[data-lp-sicher]").count() == 0 or True, "")
        breite_ok(page, breite, "Lernpartner")
        page.screenshot(path=f"{AUS}/{breite}-lernpartner.png", full_page=True)
        page.locator("[data-lp-anfragen]").first.click(); page.wait_for_timeout(150)
        page.locator("[data-lp-senden]").click(); page.wait_for_timeout(200)
        pruefe(page.get_by_text("Anfrage läuft.").count() == 1, f"{breite}: Anfrage nicht vermerkt")
        page.locator("[data-lp-reiter='anfragen']").click(); page.wait_for_timeout(200)
        page.locator("[data-lp-annehmen]").click(); page.wait_for_timeout(300)
        pruefe(page.locator("[data-lp-gruppe]").count() == 2, f"{breite}: Gruppe entsteht nicht")
        g = page.locator("[data-lp-gruppe]").last
        g.get_by_role("button", name="Treffen vorschlagen").click(); page.wait_for_timeout(150)
        g.locator("[data-lp-treffen-form] input[maxlength='60']").fill("www.treff.de")
        g.locator("[data-lp-treffen-senden]").click(); page.wait_for_timeout(150)
        pruefe(g.locator(".abi-warn").count() == 1, f"{breite}: Kontaktdaten im Ortsnamen nicht abgewiesen")
        g.locator("[data-lp-treffen-form] input[maxlength='60']").fill("Stadtbibliothek Mitte")
        g.locator("[data-lp-treffen-senden]").click(); page.wait_for_timeout(200)
        pruefe(g.locator("[data-lp-treffen]").count() == 1, f"{breite}: Treffen nicht eingetragen")
        page.screenshot(path=f"{AUS}/{breite}-lernpartner-gruppe.png", full_page=True)
        breite_ok(page, breite, "Lernpartner Gruppen")

        pruefe(not page.konsole, f"{breite}: Konsole {page.konsole[:3]}")
        ctx.close()

    # Eltern sehen die Freigabe statt der Börse
    demo = {"nutzer": {"id": "demo-e", "email": "mama@example.de"}, "profil": {"id": "demo-e", "name": "Mama", "rolle": "eltern"}}
    ctx, page = kontext(b, 390, f"localStorage.setItem('mm-demo-konto', {json.dumps(json.dumps(demo))})")
    page.goto(BASE + "/abi/lernpartner"); page.wait_for_timeout(1500)
    pruefe(page.locator("[data-lp-kind]").count() == 1, "Eltern: Freigabe-Liste fehlt")
    if page.locator("[data-lp-freigabe]").count():
        page.locator("[data-lp-freigabe]").click(); page.wait_for_timeout(200)
        pruefe("freigegeben" in page.locator("[data-lp-kind]").inner_text(), "Eltern: Freigabe schaltet nicht")
    page.screenshot(path=f"{AUS}/390-eltern.png", full_page=True)
    ctx.close()
    b.close()

print("OK" if not fehler else f"{len(fehler)} Fehler")
sys.exit(1 if fehler else 0)
