"""Browser-Test Formelauswahl zum Buchkapitel + Testklausur (funcKapitelFormeln.jsx).
Quickfinder → G9 · Klasse 12 · Funktionen und ihre Graphen → Formelsammlung zum Kapitel → PDF → Testklausur (KI gemockt) → PDF.
Prüft bei 360, 390 und 1280 px: keine Seitenüberbreite, keine Konsolenfehler, PDF-Downloads, Screenshots.
  npm run build && npx vite preview --port 4173 &   →   python3 tests/ui/kapitelformeln.ui.py
"""
import json, os
from playwright.sync_api import sync_playwright
from startkarte_hilfe import schublade_auf

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
AUS = os.environ.get("SCREENS", "/tmp/kf")
os.makedirs(AUS, exist_ok=True)
fehler = []
FONT_DIR = os.environ.get("FONT_DIR")

def pruefe(bed, text):
    if not bed:
        fehler.append(text)
        print("FEHLT:", text)

KLAUSUR = {
    "titel": "Funktionen und ihre Graphen",
    "hilfsmittel": "Teil A: keine · Teil B: WTR, Merkhilfe",
    "teile": [
        {"name": "Teil A · ohne Hilfsmittel", "aufgaben": [
            {"titel": "Verschieben und Strecken", "text": "Gegeben ist die Funktion $f$ mit $f(x) = x^2$.", "graph": None, "teilaufgaben": [
                {"text": "Der Graph von $f$ wird um 3 nach rechts und um 2 nach unten verschoben. Gib den Term der neuen Funktion $g$ an.", "be": 2, "loesung": "$g(x) = (x - 3)^2 - 2$"},
                {"text": "Beschreibe, wie der Graph von $h$ mit $h(x) = -2(x + 1)^2 + 4$ aus dem Graphen von $f$ entsteht.", "be": 3, "loesung": "Streckung in y-Richtung mit Faktor 2, Spiegelung an der x-Achse, Verschiebung um 1 nach links und um 4 nach oben."}]},
            {"titel": "Sinusfunktion", "text": "Gegeben ist $f(x) = 2 \\sin\\left(\\frac{\\pi}{2}(x - 1)\\right) + 3$.", "graph": None, "teilaufgaben": [
                {"text": "Gib Amplitude, Periode und Mittellinie an.", "be": 3, "loesung": "Amplitude 2; Periode $p = \\frac{2\\pi}{\\pi / 2} = 4$; Mittellinie $y = 3$."},
                {"text": "Bestimme den größten Funktionswert und eine Stelle, an der er angenommen wird.", "be": 2, "loesung": "Maximum $3 + 2 = 5$ für $\\frac{\\pi}{2}(x - 1) = \\frac{\\pi}{2}$, also $x = 2$."}]},
            {"titel": "Asymptoten", "text": "Gegeben ist $f(x) = \\frac{2x^2 - 1}{x^2 + 1}$.", "graph": None, "teilaufgaben": [
                {"text": "Bestimme die waagerechte Asymptote des Graphen.", "be": 2, "loesung": "$\\lim_{x \\to \\pm\\infty} f(x) = 2$, also $y = 2$."},
                {"text": "Begründe, dass der Graph keine senkrechte Asymptote hat.", "be": 2, "loesung": "$x^2 + 1 \\ge 1 > 0$: Der Nenner wird nie null, es gibt keine Polstelle."}]}]},
        {"name": "Teil B · mit Hilfsmitteln", "aufgaben": [
            {"titel": "Funktionenschar", "text": "Gegeben ist die Schar $f_k(x) = x^3 - kx$ mit $k > 0$. Die Abbildung zeigt den Graphen von $f_3$.", "graph": {"terme": ["x^3-3*x"], "x": [-3, 3], "y": [-4, 4]}, "teilaufgaben": [
                {"text": "Zeige, dass jeder Graph der Schar punktsymmetrisch zum Ursprung ist.", "be": 2, "loesung": "$f_k(-x) = -x^3 + kx = -f_k(x)$"},
                {"text": "Bestimme die Extrempunkte von $f_k$ in Abhängigkeit von $k$.", "be": 5, "loesung": "$f_k'(x) = 3x^2 - k = 0 \\Rightarrow x = \\pm\\sqrt{\\frac{k}{3}}$; $f_k''(x) = 6x$. $T\\left(\\sqrt{\\frac{k}{3}} \\,|\\, -\\frac{2k}{3}\\sqrt{\\frac{k}{3}}\\right)$, $H\\left(-\\sqrt{\\frac{k}{3}} \\,|\\, \\frac{2k}{3}\\sqrt{\\frac{k}{3}}\\right)$"},
                {"text": "Bestimme die Gleichung der Ortskurve der Tiefpunkte.", "be": 4, "loesung": "$x = \\sqrt{\\frac{k}{3}} \\Rightarrow k = 3x^2$; eingesetzt: $y = -2x^3$ für $x > 0$."},
                {"text": "Für welchen Wert von $k$ liegt der Tiefpunkt auf der Geraden $y = -2$?", "be": 2, "loesung": "$-2x^3 = -2 \\Rightarrow x = 1 \\Rightarrow k = 3$"}]},
            {"titel": "Riesenrad", "text": "Die Höhe einer Gondel über dem Boden wird beschrieben durch $h(t) = 22 - 20\\cos\\left(\\frac{\\pi}{10} t\\right)$ ($t$ in Minuten, $h$ in Metern).", "graph": None, "teilaufgaben": [
                {"text": "Gib die größte und die kleinste Höhe der Gondel an.", "be": 2, "loesung": "Größte Höhe $42$ m, kleinste Höhe $2$ m."},
                {"text": "Berechne die Dauer einer Umdrehung.", "be": 2, "loesung": "$p = \\frac{2\\pi}{\\pi / 10} = 20$ Minuten"},
                {"text": "Bestimme, wann die Gondel während der ersten Umdrehung in 32 m Höhe ist.", "be": 4, "loesung": "$\\cos\\left(\\frac{\\pi}{10} t\\right) = -\\frac{1}{2} \\Rightarrow \\frac{\\pi}{10} t = \\frac{2\\pi}{3}$ oder $\\frac{4\\pi}{3}$; $t = \\frac{20}{3} \\approx 6,67$ min und $t = \\frac{40}{3} \\approx 13,33$ min"},
                {"text": "Berechne die momentane Steiggeschwindigkeit der Gondel nach 5 Minuten.", "be": 3, "loesung": "$h'(t) = 2\\pi \\sin\\left(\\frac{\\pi}{10} t\\right)$; $h'(5) = 2\\pi \\approx 6,28$ m pro Minute"}]},
            {"titel": "Graph ablesen", "text": "Die Abbildung zeigt den Graphen von $g$ mit $g(x) = a \\sin(bx) + d$.", "graph": {"terme": ["1.5*sin(pi/2*x)+1"], "x": [-4, 4], "y": [-2, 3]}, "teilaufgaben": [
                {"text": "Bestimme $a$, $b$ und $d$ aus der Abbildung.", "be": 4, "loesung": "Mittellinie $d = 1$, Amplitude $a = 1,5$, Periode 4, also $b = \\frac{2\\pi}{4} = \\frac{\\pi}{2}$."},
                {"text": "Gib die Wertemenge von $g$ an.", "be": 1, "loesung": "$W = [-0,5 ; 2,5]$"},
                {"text": "Der Graph von $g$ wird an der x-Achse gespiegelt. Gib den neuen Funktionsterm an.", "be": 2, "loesung": "$-g(x) = -1,5 \\sin\\left(\\frac{\\pi}{2} x\\right) - 1$"}]}]}]}

anfragen = []
def api(route, request):
    body = request.post_data_json
    anfragen.append(body)
    antwort = {"content": [{"type": "text", "text": json.dumps(KLAUSUR, ensure_ascii=False)}], "stop_reason": "end_turn"}
    route.fulfill(status=200, content_type="application/json", body=json.dumps(antwort))

with sync_playwright() as p:
    b = p.chromium.launch()
    for breite in (360, 390, 1280):
        ctx = b.new_context(viewport={"width": breite, "height": 900}, device_scale_factor=2, timezone_id="Europe/Berlin", locale="de-DE", accept_downloads=True)
        page = ctx.new_page()
        konsole = []
        page.on("pageerror", lambda e: konsole.append(f"pageerror: {e}"))
        page.on("console", lambda m: konsole.append(m.text) if m.type == "error" and "net::" not in m.text and "Failed to load resource" not in m.text else None)
        page.route("**/api/claude", api)
        if FONT_DIR:   # Montserrat lokal statt Google Fonts (die Sandbox hat kein Netz) – wie auf einem echten Gerät
            page.route("**/fonts.googleapis.com/**", lambda r, q: r.fulfill(status=200, content_type="text/css", body="".join(
                f"@font-face{{font-family:'Montserrat';font-weight:{w};font-style:normal;src:url(https://fonts.gstatic.com/local/m{w}.woff2) format('woff2')}}" for w in (300, 400, 500, 600, 700, 800))))
            page.route("**/fonts.gstatic.com/local/*", lambda r, q: r.fulfill(status=200, content_type="font/woff2",
                body=open(os.path.join(FONT_DIR, f"montserrat-latin-{q.url.rsplit('/m', 1)[1].split('.')[0]}-normal.woff2"), "rb").read()))
        page.goto(BASE)
        page.evaluate("localStorage.clear(); localStorage.setItem('mm-start-app','1'); sessionStorage.clear(); localStorage.setItem('mm-onboarding-v1', JSON.stringify({uebersprungen:true})); localStorage.setItem('matheskript-einwilligung-v1', JSON.stringify({am: Date.now()}));")
        page.reload(); page.wait_for_timeout(700)

        def breite_ok(wo):
            sw = page.evaluate("document.documentElement.scrollWidth")
            pruefe(sw <= breite, f"{breite}: Überbreite bei {wo}: {sw}")

        # Der Quickfinder steckt seit 21.10. in der Schublade der Start-Karte
        if page.get_by_role("group", name="Schulsystem wählen").count() == 0:
            schublade_auf(page)
        g9 = page.get_by_role("group", name="Schulsystem wählen").get_by_role("button", name="G9")
        g9.scroll_into_view_if_needed(); g9.click(); page.wait_for_timeout(200)
        page.get_by_role("button", name="Klasse 12", exact=True).click(); page.wait_for_timeout(250)
        kap = page.get_by_role("option", name="Funktionen und ihre Graphen")
        (kap if kap.count() else page.get_by_role("button", name="Funktionen und ihre Graphen")).first.click(); page.wait_for_timeout(300)
        zeile = page.get_by_role("button", name="Formelsammlung zum Kapitel")
        pruefe(zeile.count() == 1, f"{breite}: Zeile Formelsammlung zum Kapitel fehlt")
        pruefe(page.get_by_text("Formelsammlung · Funktionen").count() == 0, f"{breite}: alte Formelsammlung-Zeile noch da")
        zeile.scroll_into_view_if_needed()
        page.screenshot(path=f"{AUS}/{breite}-1-quickfinder.png", full_page=False)
        zeile.click(); page.wait_for_timeout(1200)

        pruefe(page.get_by_role("heading", name="Funktionen und ihre Graphen").count() >= 1, f"{breite}: Titel fehlt")
        pruefe(page.get_by_text("Der Weg zum Kapitel").count() == 1, f"{breite}: Vorwissen fehlt")
        pruefe(page.get_by_text("Klasse 9", exact=True).count() >= 1, f"{breite}: Herkunft Klasse 9 fehlt")
        pruefe(page.get_by_text("Verschieben, Strecken, Spiegeln").count() >= 1, f"{breite}: Kernabschnitt fehlt")
        pruefe("formeln-zum-kapitel" in page.url, f"{breite}: Adresse {page.url}")
        breite_ok("Formelauswahl")
        page.screenshot(path=f"{AUS}/{breite}-2-formeln.png", full_page=True)

        if breite == 390:
            with page.expect_download(timeout=60000) as d:
                page.get_by_role("button", name="Formelauswahl als PDF herunterladen").click()
            d.value.save_as(f"{AUS}/formeln.pdf")
            pruefe(os.path.getsize(f"{AUS}/formeln.pdf") > 20000, "PDF Formelauswahl zu klein")

        # Formel antippen → Formelsammlung mit Detail
        page.get_by_role("button", name="Verschieben und Strecken").first.click(); page.wait_for_timeout(900)
        pruefe("formelsammlung" in page.url or page.get_by_text("Herleitung").count() >= 1, f"{breite}: Sprung zur Formel fehlgeschlagen {page.url}")
        page.go_back(); page.wait_for_timeout(900)
        pruefe(page.get_by_text("Der Weg zum Kapitel").count() == 1, f"{breite}: Zurück zur Formelauswahl fehlgeschlagen")

        # Testklausur
        page.get_by_role("button", name="Testklausur kreieren").first.click(); page.wait_for_timeout(500)
        pruefe(page.get_by_text("Deine Klausur").count() == 1, f"{breite}: Klausur-Einstellungen fehlen")
        page.screenshot(path=f"{AUS}/{breite}-3-klausur-start.png", full_page=False)
        page.get_by_role("button", name="Testklausur kreieren").first.click(); page.wait_for_timeout(1500)
        pruefe(len(anfragen) > 0 and "Funktionen und ihre Graphen" in anfragen[-1]["system"], f"{breite}: KI-Anfrage fehlt")
        # Sofort die Wahl: online bearbeiten oder PDF – noch kein Klausurblatt
        pruefe(page.get_by_text("Möchtest du die Klausur jetzt online bearbeiten oder als PDF herunterladen?").count() == 1, f"{breite}: Auswahl online/PDF fehlt")
        pruefe(page.get_by_text("Aufgabe 4").count() == 0, f"{breite}: Klausurblatt erscheint vor der Auswahl")
        breite_ok("Auswahl")
        page.screenshot(path=f"{AUS}/{breite}-3b-auswahl.png", full_page=False)

        # Weg 1: online bearbeiten (Uhr, Eingabe ohne Fokusverlust, Abgabe, Selbstbewertung)
        page.get_by_role("button", name="Online bearbeiten").click(); page.wait_for_timeout(300)
        page.get_by_role("button", name="Klausur starten").click(); page.wait_for_timeout(600)
        pruefe(page.get_by_role("timer").count() == 1, f"{breite}: Uhr fehlt")
        pruefe(page.locator("select").count() == 0, f"{breite}: Lösung/Bewertung schon vor Abgabe sichtbar")
        feld = page.locator("textarea").first
        feld.click(); page.keyboard.type("x = 3 und y = 4", delay=15)
        pruefe(feld.input_value() == "x = 3 und y = 4", f"{breite}: Eingabe verliert Fokus/Text")
        breite_ok("Online")
        page.screenshot(path=f"{AUS}/{breite}-3c-online.png", full_page=True)
        page.get_by_role("button", name="Klausur abgeben", exact=True).click(); page.wait_for_timeout(400)
        pruefe(page.get_by_text("Abgegeben").count() >= 1, f"{breite}: Abgabe fehlt")
        pruefe(page.locator("select").count() >= 1, f"{breite}: Erwartungshorizont/Bewertung fehlt")
        pruefe(page.locator("textarea").first.input_value() == "x = 3 und y = 4", f"{breite}: Antwort nach Abgabe weg")
        page.locator("select").first.select_option(index=1); page.wait_for_timeout(200)
        pruefe(page.get_by_text("Du hast dir").count() >= 1, f"{breite}: Selbstbewertung wird nicht gezählt")
        breite_ok("Online-Abgabe")
        page.screenshot(path=f"{AUS}/{breite}-3d-abgabe.png", full_page=True)

        # Weg 2: zurück zur Wahl → PDF (Download startet direkt)
        page.get_by_role("button", name="Andere Variante wählen").click(); page.wait_for_timeout(300)
        pruefe(page.get_by_text("Möchtest du die Klausur jetzt online bearbeiten oder als PDF herunterladen?").count() == 1, f"{breite}: Wahl nach Rückweg fehlt")
        with page.expect_download(timeout=60000) as d0:
            page.get_by_role("button", name="Als PDF zum Download").click()
        d0.value.save_as(f"{AUS}/klausur-direkt-{breite}.pdf")
        pruefe(os.path.getsize(f"{AUS}/klausur-direkt-{breite}.pdf") > 20000, f"{breite}: PDF direkt aus der Wahl zu klein")
        page.wait_for_timeout(800)
        pruefe(page.get_by_text("Aufgabe 4").count() >= 1, f"{breite}: Aufgaben fehlen")
        pruefe(page.locator("svg[aria-label='Abbildung zur Aufgabe']").count() == 2, f"{breite}: Abbildungen fehlen")
        pruefe(page.get_by_text("45 BE").count() >= 1, f"{breite}: Gesamtpunkte falsch")
        breite_ok("Klausur")
        page.screenshot(path=f"{AUS}/{breite}-4-klausur.png", full_page=True)
        page.get_by_role("button", name="Lösungen und Notenschlüssel zeigen").click(); page.wait_for_timeout(300)
        pruefe(page.get_by_text("Beispiel-Notenschlüssel (Notenpunkte)").count() == 1, f"{breite}: Notenschlüssel fehlt")
        breite_ok("Lösungen")
        page.screenshot(path=f"{AUS}/{breite}-5-loesungen.png", full_page=True)
        if breite == 390:
            with page.expect_download(timeout=60000) as d:
                page.get_by_role("button", name="PDF mit Lösungen").click()
            d.value.save_as(f"{AUS}/klausur.pdf")
            pruefe(os.path.getsize(f"{AUS}/klausur.pdf") > 20000, "PDF Klausur zu klein")
        # Reload: Klausur bleibt gespeichert
        page.reload(); page.wait_for_timeout(1200)
        pruefe(page.get_by_text("Der Weg zum Kapitel").count() == 1, f"{breite}: nach Reload keine Formelauswahl")

        pruefe(not konsole, f"{breite}: Konsole: {konsole[:3]}")
        ctx.close()
    b.close()

print("OK" if not fehler else f"{len(fehler)} Fehler")
