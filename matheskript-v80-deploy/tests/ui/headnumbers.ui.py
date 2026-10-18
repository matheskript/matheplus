"""Browser-Tests für Head & Numbers. Siehe README.md in diesem Ordner."""
import json, os, re, sys, time
from playwright.sync_api import sync_playwright

URL = os.environ.get("BASE_URL", "http://localhost:4173/")
KEY = "matheskript-lernstand-v1"
fehler = []
bekannt = lambda t: "ERR_TUNNEL" in t or "net::ERR" in t or "Failed to load resource" in t   # Netzwerk der Sandbox, kein App-Fehler


def kopf(page):
    raw = page.evaluate(f"() => localStorage.getItem('{KEY}')")
    return ((json.loads(raw).get("training") or {}).get("kopf")) if raw else None


def neue_seite(b, breite=390, hoehe=844, **kw):
    ctx = b.new_context(viewport={"width": breite, "height": hoehe}, timezone_id="Europe/Madrid", **kw)
    page = ctx.new_page()
    page.on("pageerror", lambda e: fehler.append(f"pageerror: {e}"))
    page.on("console", lambda m: fehler.append(f"console: {m.text}") if m.type == "error" and not bekannt(m.text) else None)
    return page


def start(page, lang=None):
    page.goto(URL + (f"?lang={lang}" if lang else ""))
    page.wait_for_timeout(1200)
    for t in ["Verstanden", "Schließen", "OK", "Los geht", "Später"]:
        try:
            b = page.get_by_role("button", name=t, exact=True)
            if b.count():
                b.first.click(timeout=500)
        except Exception:
            pass


def zu_headnumbers(page, label="Kopfrechnen öffnen"):
    t = page.get_by_label(label).first
    t.scroll_into_view_if_needed()
    t.click()
    page.wait_for_selector("text=/Wähle deinen Bereich|Choose your area/", timeout=15000)   # Lazy-Chunk wird nachgeladen


def aufgabe_loesen(page, falsch=None):
    """Liest die Aufgabe, tippt die Lösung (optional eine Fehlantwort 'nachbar'); gibt Text und ob falsch zurück."""
    txt = page.locator(".kr-aufgabe").first.inner_text()
    m = re.search(r"(\d+)\s*[·:]\s*(\d+)", txt)
    if "?" in txt and "=" in txt:
        mm = re.search(r"(\d+)\s*·\s*\?\s*=\s*(\d+)", txt) or re.search(r"\?\s*·\s*(\d+)\s*=\s*(\d+)", txt)
        antwort, nachbar = int(mm.group(2)) // int(mm.group(1)), None
    elif m and ":" in txt:
        antwort, nachbar = int(m.group(1)) // int(m.group(2)), None
    else:
        a, b = int(m.group(1)), int(m.group(2))
        antwort, nachbar = a * b, (a * (b + 1) if b < 10 else a * (b - 1))
    eingabe = antwort
    if falsch == "nachbar" and nachbar is not None:
        eingabe = nachbar
    elif falsch == "egal":
        eingabe = antwort + 1
    for ch in str(eingabe):
        page.keyboard.press(ch)
    page.keyboard.press("Enter")
    page.wait_for_timeout(150)
    return txt, eingabe != antwort


def runde(page, falsch_plan=(), grenze=60):
    """Spielt eine Runde bis 'Runde geschafft'. falsch_plan: Indizes der Aufgaben mit absichtlich falscher Antwort."""
    falsch_gezaehlt = 0
    for i in range(grenze):
        if page.get_by_text("Runde geschafft").count():
            return falsch_gezaehlt
        modus = ("nachbar" if i in falsch_plan else None)
        if page.locator(".kr-aufgabe").count() == 0:
            raise AssertionError("Keine Zahlenaufgabe gefunden – Runde enthält Auswahlaufgaben?")
        _, war_falsch = aufgabe_loesen(page, modus)
        if war_falsch:
            falsch_gezaehlt += 1
            page.keyboard.press("Enter")
            page.wait_for_timeout(120)
        else:
            page.wait_for_timeout(800)
    raise AssertionError("Runde endet nicht")


def zurueck_zur_uebersicht(page):
    page.get_by_role("button", name=re.compile(r"Zurück zur Übersicht")).first.click()
    page.wait_for_timeout(400)


def test_lazy_und_navigation(b):
    page = neue_seite(b)
    anfragen = []
    page.on("request", lambda r: anfragen.append(r.url))
    start(page)
    assert not any("funcHeadNumbers" in u for u in anfragen), "Head-&-Numbers-Chunk darf nicht schon beim Start laden"
    zu_headnumbers(page)
    assert any("funcHeadNumbers" in u for u in anfragen), "Chunk wurde nicht nachgeladen"
    assert page.get_by_role("heading", name="Kopfrechnen").count() >= 1
    body = page.locator("body").inner_text()
    assert "Koch" in body and "Küche" in body, "Einleitung mit Küchen-Vergleich fehlt"
    page.context.close()


def test_runde_status_und_fehlerarten(b):
    page = neue_seite(b)
    start(page); zu_headnumbers(page)
    page.get_by_role("button", name="Das Einmaleins bis 100").first.click(); page.wait_for_timeout(400)
    uebersicht = page.locator("body").inner_text()
    for n in ["1er, 2er, 5er, 10er", "3er und 4er", "9er", "6er", "7er", "8er"]:
        assert n in uebersicht, f"Paket fehlt: {n}"
    # Runde 1 mit einem Fehler: danach ist alles höchstens 'gesehen'
    page.get_by_role("button", name=re.compile(r"3\. Selbstständig")).first.click(); page.wait_for_timeout(400)
    runde(page, falsch_plan=(2,))
    ende = page.locator("body").inner_text()
    assert "erst gesehen" in ende, "Hinweis zu 'gesehen' fehlt"
    k = kopf(page)
    assert k and k["runden"] == 1 and k["punkte"] > 0 and k["stand"]["angefangen"] >= 5, "Runde/Kurzstand nicht gespeichert"
    assert all(s["folge"] < 2 for s in k["items"].values()), "Nach einer Runde darf nichts 'im Aufbau' sein"
    # Weitere Runden mit Nachbar-Fehlern → wiederkehrendes Muster
    for _ in range(4):
        if not page.get_by_role("button", name="Noch eine Runde").count():
            break
        page.get_by_role("button", name="Noch eine Runde").first.click(); page.wait_for_timeout(400)
        runde(page, falsch_plan=(0, 1, 3))
        k = kopf(page)
        if k.get("fehler", {}).get("nachbar", {}).get("n", 0) >= 3:
            break
    k = kopf(page)
    assert k["fehler"].get("nachbar", {}).get("n", 0) >= 3, f"Fehlerart nicht gespeichert: {k.get('fehler')}"
    zurueck_zur_uebersicht(page)
    page.locator("button", has_text="← Kopfrechnen").first.click(); page.wait_for_timeout(400)
    start_text = page.locator("body").inner_text()
    assert "Wiederkehrende Muster" in start_text and "Nachbaraufgabe erwischt" in start_text, "Karte zu wiederkehrenden Fehlerarten fehlt"
    assert "keine Diagnose" in start_text, "Hinweis 'keine Diagnose' fehlt"
    # Persistenz
    vorher = kopf(page)["runden"]
    page.reload(); page.wait_for_timeout(1500)
    assert kopf(page)["runden"] == vorher
    # Lernlandkarte zeigt Kurzstand
    page.goto(URL + "#karte"); page.wait_for_timeout(1000)
    page.context.close()


def test_fehlerhinweis_in_runde(b):
    page = neue_seite(b)
    start(page); zu_headnumbers(page)
    page.get_by_role("button", name="Das Einmaleins bis 100").first.click(); page.wait_for_timeout(300)
    page.get_by_role("button", name=re.compile(r"3\. Selbstständig")).first.click(); page.wait_for_timeout(400)
    gefunden = False
    for _ in range(25):
        if page.get_by_text("Runde geschafft").count():
            break
        txt = page.locator(".kr-aufgabe").first.inner_text()
        if "?" not in txt and ":" not in txt:
            _, falsch = aufgabe_loesen(page, "nachbar")
            if falsch:
                gefunden = page.get_by_text("Nachbaraufgabe erwischt").count() == 1 and page.locator("[role=alert]").count() == 1
                break
        else:
            aufgabe_loesen(page); page.wait_for_timeout(800)
    assert gefunden, "Fehlerart-Hinweis erscheint nicht nach falscher Antwort"
    page.context.close()


def test_barrierefreiheit(b):
    page = neue_seite(b)
    start(page); zu_headnumbers(page)
    page.get_by_role("button", name="Das Einmaleins bis 100").first.click(); page.wait_for_timeout(300)
    page.get_by_role("button", name=re.compile(r"3\. Selbstständig")).first.click(); page.wait_for_timeout(500)
    assert page.get_by_label("Letzte Ziffer löschen").count() == 1
    assert page.get_by_label("Antwort prüfen").count() == 1
    live = page.locator("p[role=status][aria-live=polite]").first.inner_text()
    assert re.search(r"Aufgabe 1 von \d+", live), f"Aufgabe wird nicht angesagt: {live!r}"
    assert " mal " in live or "geteilt" in live or "gesucht" in live, f"Aufgabe nicht vorlesbar formuliert: {live!r}"
    page.context.close()


def test_tab_pause(b):
    page = neue_seite(b)
    start(page); zu_headnumbers(page)
    page.get_by_role("button", name="Das Einmaleins bis 100").first.click(); page.wait_for_timeout(300)
    page.get_by_role("button", name=re.compile(r"3\. Selbstständig")).first.click(); page.wait_for_timeout(400)
    t0 = time.time()
    # Tab 6 Sekunden 'verstecken'
    page.evaluate("() => { Object.defineProperty(document, 'hidden', { get: () => true, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); }")
    page.wait_for_timeout(6000)
    page.evaluate("() => { Object.defineProperty(document, 'hidden', { get: () => false, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); }")
    runde(page)
    wall = time.time() - t0
    k = kopf(page)
    # unterbrochene Aufgabe: kein Tempo-Beleg → sFolge/sTage der ersten Aufgabe bleiben leer
    ersten = [s for s in k["items"].values() if s["r"] >= 1]
    assert ersten and all(s["sFolge"] <= 1 for s in ersten)
    assert wall > 6
    page.context.close()


def test_lernlandkarte_kurzstand(b):
    page = neue_seite(b)
    start(page); zu_headnumbers(page)
    page.get_by_role("button", name="Das Einmaleins bis 100").first.click(); page.wait_for_timeout(300)
    page.get_by_role("button", name=re.compile(r"3\. Selbstständig")).first.click(); page.wait_for_timeout(400)
    runde(page)
    # Die Lernlandkarte hat keinen Direktlink; die App öffnet beim Laden die Seite aus dem Sprachwechsel-Übergabespeicher
    page.evaluate("() => sessionStorage.setItem('mm-nach-sprachwechsel', JSON.stringify({ ansicht: 'karte' }))")
    page.reload(); page.wait_for_timeout(2000)
    text = page.locator("body").inner_text()
    assert "Kopfrechnen:" in text and "begonnen" in text, "Kurzstand auf der Lernlandkarte fehlt"
    page.get_by_label("Kopfrechnen öffnen").first.click()
    page.wait_for_selector("text=/Wähle deinen Bereich|Choose your area/", timeout=15000)
    page.context.close()


def test_englisch_und_layout(b):
    page = neue_seite(b)
    start(page, lang="en"); zu_headnumbers(page, "Open Mental Math") if page.get_by_label("Open Mental Math").count() else zu_headnumbers(page)
    body = page.locator("body").inner_text()
    assert "Mental Math" in body and "Head und Numbers" not in body
    assert "kitchen" in body.lower(), "Englischer Einleitungstext mit Küchen-Vergleich fehlt"
    ueberlauf = page.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth")
    assert not ueberlauf, "horizontaler Überlauf (mobil)"
    page.context.close()
    desk = neue_seite(b, 1280, 900)
    start(desk); zu_headnumbers(desk)
    assert not desk.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth"), "horizontaler Überlauf (Desktop)"
    desk.context.close()


TESTS = [test_lazy_und_navigation, test_runde_status_und_fehlerarten, test_fehlerhinweis_in_runde, test_barrierefreiheit, test_tab_pause, test_lernlandkarte_kurzstand, test_englisch_und_layout]

if __name__ == "__main__":
    nur = sys.argv[1:]
    fehlgeschlagen = 0
    with sync_playwright() as p:
        b = p.chromium.launch()
        for t in TESTS:
            if nur and t.__name__ not in nur:
                continue
            vorher = len(fehler)
            try:
                t(b)
                neu = fehler[vorher:]
                if neu:
                    raise AssertionError("Konsolen-/Seitenfehler: " + "; ".join(neu[:3]))
                print("ok    ", t.__name__)
            except Exception as e:
                fehlgeschlagen += 1
                print("FEHLER", t.__name__, "-", e)
        b.close()
    sys.exit(1 if fehlgeschlagen else 0)
