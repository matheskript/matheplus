"""Browser-Tests Geradentrainer (Grundlagen, Zwei Punkte, Punkt und Steigung; Auto | Üben | Lernen): alles auf einer Seite, Eingabe, Lösung, Musterlösung.
- Modus-Schalter mit drei Knöpfen aus UEBEN_MODI und Satz darunter; Lernen (früher Trainieren) ist vorgewählt, Auto = früher Rechnen.
- Üben (Zwei Punkte, Standardpunkte P(1|3), Q(3|7) → m = 2, c = 1): goldenes Zielfeld, 2–4 goldene Karten je Schritt, falsche Karte → rot + Hinweis,
  richtige → Schritt zeigt den Rechenweg, nächster Schritt; Abschluss „1 von 2 Schritten auf Anhieb“, Ergebnis y = 2x + 1,
  „Jetzt selbst rechnen“ → Lernen mit denselben Punkten. Üben auch in Punkt und Steigung (ein Schritt).
- 360/390/1280 px ohne Überbreite und ohne Konsolenfehler. Siehe README.md.
  npx vite build && npx vite preview --port 4382 &   →   BASE_URL=http://localhost:4382/ SCREENS=/tmp/geraden python3 -u tests/ui/geraden.ui.py
"""
import os, sys
from playwright.sync_api import sync_playwright

URL = os.environ.get("BASE_URL", "http://localhost:4173/")
AUS = os.environ.get("SCREENS", "/tmp/geraden")
os.makedirs(AUS, exist_ok=True)
fehler = []
bekannt = lambda t: "ERR_TUNNEL" in t or "net::ERR" in t or "Failed to load resource" in t


def seite(b, w, h, mobil=True):
    kw = dict(viewport={"width": w, "height": h}, timezone_id="Europe/Madrid")
    if mobil:
        kw.update(has_touch=True, is_mobile=True, device_scale_factor=2)
    ctx = b.new_context(**kw)
    p = ctx.new_page()
    p.on("pageerror", lambda e: fehler.append(f"pageerror: {e}"))
    p.on("console", lambda m: fehler.append(f"console: {m.text}") if m.type == "error" and not bekannt(m.text) else None)
    p.add_init_script("sessionStorage.setItem('mm-nach-sprachwechsel', JSON.stringify({ansicht:'geradengleichung'}))")
    p.goto(URL)
    p.evaluate("localStorage.clear(); localStorage.setItem('mm-start-app','1'); localStorage.setItem('mm-onboarding-v1', JSON.stringify({uebersprungen:true}));")
    p.goto(URL + "geradengleichung")
    p.wait_for_timeout(1800)
    for t in ["Verstanden", "Schließen", "OK", "Später"]:
        try:
            k = p.get_by_role("button", name=t, exact=True)
            if k.count():
                k.first.click(timeout=500)
        except Exception:
            pass
    return p


def pruefe(bed, text):
    if not bed:
        fehler.append(text)


def arbeits_bottom(p):
    """Unterkante des Arbeitsbereichs (Aufgabe, Bild, Schritte) – die Animationskarte darunter darf scrollen."""
    return p.evaluate("Math.round(document.querySelector('.ger-schritte').getBoundingClientRect().bottom)")


def keine_ueberbreite(p, name):
    ueber = p.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")
    pruefe(ueber <= 1, f"{name}: horizontaler Überlauf {ueber}px")


def ueben_lauf(p, n, tab, schritte, ergebnis, bild):
    """Üben komplett: im ersten Schritt erst eine falsche Karte (Hinweis, rot), dann richtig; alle weiteren richtig."""
    p.locator("[data-ger-modus=ueben]").click(); p.wait_for_timeout(350)
    pruefe(p.locator("[data-ger-modus=ueben]").get_attribute("aria-pressed") == "true", f"{n} {tab}: Üben nicht gewählt")
    pruefe("richtige Zeile" in p.locator("[data-ger-modus-text]").inner_text(), f"{n} {tab}: Modus-Satz Üben fehlt")
    pruefe(p.locator("[data-ger-ueben-weg]").count() == 1, f"{n} {tab}: Üben-Container fehlt")
    pruefe(p.locator("[data-ueben-ziel]").count() == 1, f"{n} {tab}: goldenes Zielfeld fehlt")
    rand = p.locator("[data-ueben-ziel]").evaluate("e => getComputedStyle(e).borderTopColor").replace(" ", "")
    pruefe(rand == "rgb(237,187,0)", f"{n} {tab}: Zielfeld nicht gold ({rand})")
    pruefe(p.locator("[data-ger-pad][role=dialog]").count() == 0, f"{n} {tab}: Zahlenfeld im Üben offen")
    for s in range(schritte):
        wahl = p.locator("[data-ueben-wahl]")
        pruefe(wahl.count() == 1, f"{n} {tab}: Schritt {s + 1} ohne Karten")
        k = wahl.locator(".uw-option").count()
        pruefe(2 <= k <= 4, f"{n} {tab}: Schritt {s + 1} mit {k} Karten")
        pruefe(wahl.locator("[data-ueben-option=richtig]").count() == 1, f"{n} {tab}: Schritt {s + 1} nicht genau eine richtige Karte")
        pruefe(f"schritt {s + 1} von {schritte}" in wahl.locator(".uw-frage").inner_text().lower(), f"{n} {tab}: Schrittzähler {s + 1} fehlt")
        rand = wahl.locator(".uw-option").first.evaluate("e => getComputedStyle(e).borderTopColor").replace(" ", "")
        pruefe(rand == "rgb(237,187,0)", f"{n} {tab}: Karte ohne goldenen Rand ({rand})")
        if s == 0:
            p.locator("[data-ueben-option=falsch]").first.click(); p.wait_for_timeout(250)
            pruefe(p.locator("[data-ueben-hinweis]").count() == 1, f"{n} {tab}: kein Hinweis nach falscher Karte")
            pruefe(len(p.locator("[data-ueben-hinweis]").inner_text()) > 20, f"{n} {tab}: Hinweis leer")
            pruefe(p.locator(".uw-option[data-status=falsch]").count() == 1, f"{n} {tab}: falsche Karte nicht rot")
            pruefe(p.locator("[data-ger-ueben-fertig]").count() == 0, f"{n} {tab}: falsche Karte wurde eingesetzt")
            p.screenshot(path=f"{AUS}/{tab}-ueben-falsch-{bild}.png", full_page=True)
        p.locator("[data-ueben-option=richtig]").click(); p.wait_for_timeout(300)
        pruefe(p.locator("[data-ger-ueben-fertig]").count() == s + 1, f"{n} {tab}: Schritt {s + 1} nach richtiger Karte nicht erledigt")
        pruefe(p.locator("[data-ger-ueben-fertig] [data-ger-weg]").count() == s + 1, f"{n} {tab}: erledigter Schritt {s + 1} ohne Rechenweg")
    pruefe(p.locator("[data-ueben-wahl]").count() == 0, f"{n} {tab}: nach dem letzten Schritt noch Karten")
    pruefe(p.locator("[data-ueben-fertig]").count() == 1, f"{n} {tab}: Üben ohne Abschluss")
    fertig = p.locator("[data-ueben-fertig]").inner_text()
    pruefe(f"{schritte - 1} von {schritte}" in fertig, f"{n} {tab}: Bilanz falsch ({fertig[:70]!r})")
    erg = p.locator("[data-ger-ergebnis]").inner_text().replace(" ", "").replace("\n", "")
    pruefe(ergebnis in erg, f"{n} {tab}: Ergebnis {erg!r} statt {ergebnis}")
    keine_ueberbreite(p, f"{n} {tab} ueben")
    p.screenshot(path=f"{AUS}/{tab}-ueben-fertig-{bild}.png", full_page=True)


with sync_playwright() as pw:
    b = pw.chromium.launch()
    for (w, h) in [(390, 844), (360, 740), (1280, 800)]:
        p = seite(b, w, h, mobil=w < 600)
        n = f"{w}x{h}"
        pruefe(p.locator("[data-ger-tab]").count() == 3, f"{n}: Tabs fehlen")
        # Basics
        pruefe(p.locator("[data-ger-basics]").count() == 1, f"{n}: Basics fehlt")
        pruefe(p.locator("[data-ger-modus]").count() == 0, f"{n}: Grundlagen haben keinen Modus")
        keine_ueberbreite(p, n + " basics")
        p.locator(".ger-seg-klein button").nth(1).click()
        p.locator(".ger-seg-klein button").nth(2).click()
        p.locator(".ger-seg-klein button").nth(3).click()
        # P & Q
        p.locator("[data-ger-tab=pq]").click()
        p.wait_for_timeout(300)
        # Modus-Schalter: Auto | Üben | Lernen aus UEBEN_MODI, Lernen vorgewählt, Satz darunter
        for mid, name in [("auto", "Auto"), ("ueben", "Üben"), ("lernen", "Lernen")]:
            k = p.locator(f"[data-ger-modus={mid}]")
            pruefe(k.count() == 1 and k.inner_text().strip() == name, f"{n}: Modus-Knopf {name} fehlt")
        pruefe(p.locator("[data-ger-modus=lernen]").get_attribute("aria-pressed") == "true", f"{n}: Standard ist nicht Lernen")
        pruefe("selbst" in p.locator("[data-ger-modus-text]").inner_text(), f"{n}: Modus-Satz Lernen fehlt")
        keine_ueberbreite(p, n + " pq")
        # Üben mit den Standardpunkten P(1|3), Q(3|7): m = 2, c = 1 → y = 2x + 1
        ueben_lauf(p, n, "pq", 2, "y=2x+1", w)
        p.get_by_role("button", name="Jetzt selbst rechnen").click(); p.wait_for_timeout(300)
        pruefe(p.locator("[data-ger-modus=lernen]").get_attribute("aria-pressed") == "true", f"{n}: nach Üben nicht in Lernen")
        koord = "".join(t.strip() for t in p.locator("[data-ger-pq] .ger-pt .ger-feld").all_inner_texts())
        pruefe(koord == "1337", f"{n}: Lernen nicht mit denselben Punkten ({koord!r})")
        pruefe(p.locator("[data-ueben-wahl]").count() == 0 and p.get_by_role("button", name="Lösung zeigen").count() == 1, f"{n}: Lernen nach Üben startet nicht frisch")
        # alles auf einen Bildschirm (mobil)
        sh = arbeits_bottom(p)
        if w < 600:
            pruefe(sh <= h + 4, f"{n}: PQ scrollt ({sh} > {h})")
        # Lösung zeigen für m
        p.get_by_role("button", name="Lösung zeigen").first.click()
        pruefe(p.locator("[data-ger-weg]").count() == 1, f"{n}: Rechenweg m fehlt")
        p.get_by_role("button", name="Weiter").click()
        p.get_by_role("button", name="Lösung zeigen").first.click()
        p.get_by_role("button", name="Weiter").click()
        pruefe(p.locator("[data-ger-ergebnis]").count() == 1, f"{n}: Ergebnis fehlt")
        # Würfel
        p.get_by_role("button", name="Zufällige Punkte würfeln").click()
        pruefe(p.locator("[data-ger-ergebnis]").count() == 0, f"{n}: Würfel setzt nicht zurück")
        # Eingabe m per Zahlenfeld: richtigen Wert aus gezeigter Lösung lesen ist aufwendig → falsche Eingabe prüfen
        p.locator("[data-ger-antwort=m]").click()
        pruefe(p.locator("div[role=dialog][data-ger-pad]").count() == 1, f"{n}: Zahlenfeld öffnet nicht")
        p.locator("button[data-ger-pad]", has_text="OK").click()
        p.wait_for_timeout(200)
        keine_ueberbreite(p, n + " pq2")
        # Koordinate editieren
        p.locator("[data-ger-pq] .ger-pt .ger-feld").first.click()
        p.locator("button[data-ger-pad]", has_text="7").first.click()
        p.locator("button[data-ger-pad]", has_text="OK").click()
        # P & m
        p.locator("[data-ger-tab=pm]").click()
        p.wait_for_timeout(300)
        pruefe(p.locator("[data-ger-pm]").count() == 1, f"{n}: P&m fehlt")
        keine_ueberbreite(p, n + " pm")
        sh = arbeits_bottom(p)
        if w < 600:
            pruefe(sh <= h + 4, f"{n}: P&m scrollt ({sh} > {h})")
        pruefe(p.locator("[data-ger-modus=lernen]").get_attribute("aria-pressed") == "true", f"{n}: P&m nicht in Lernen")
        # Üben in P & m mit der Standardaufgabe P(2|3), m = 2: c = −1 → y = 2x − 1 (ein Schritt)
        ueben_lauf(p, n, "pm", 1, "y=2x−1", w)
        p.get_by_role("button", name="Jetzt selbst rechnen").click(); p.wait_for_timeout(300)
        pruefe(p.locator("[data-ger-modus=lernen]").get_attribute("aria-pressed") == "true", f"{n}: P&m nach Üben nicht in Lernen")
        pruefe(p.locator("[data-ger-pm] .ger-pt").first.inner_text().replace(" ", "").replace("\n", "") == "P(2|3)", f"{n}: P&m Lernen nicht mit demselben Punkt")
        p.get_by_role("button", name="Lösung zeigen").first.click()
        p.get_by_role("button", name="Weiter").click()
        pruefe(p.locator("[data-ger-ergebnis]").count() == 1, f"{n}: P&m Ergebnis fehlt")
        # Auto (früher Rechnen): Musterlösung sofort da, läuft beim Würfeln mit
        p.locator("[data-ger-modus=auto]").click()
        p.wait_for_timeout(200)
        pruefe("rechnet dir" in p.locator("[data-ger-modus-text]").inner_text(), f"{n}: Modus-Satz Auto fehlt")
        pruefe(p.locator("[data-ger-auto]").count() == 1 and p.locator("[data-ger-ergebnis]").count() == 1, f"{n}: Rechnen P&m ohne Musterlösung")
        pruefe(p.get_by_role("button", name="Lösung zeigen").count() == 0, f"{n}: Rechnen zeigt Eingabe")
        alt = p.locator("[data-ger-ergebnis]").inner_text()
        for _ in range(4):
            p.get_by_role("button", name="Zufälligen Punkt und Steigung würfeln").click()
            if p.locator("[data-ger-ergebnis]").inner_text() != alt: break
        pruefe(p.locator("[data-ger-ergebnis]").count() == 1, f"{n}: Rechnen nach Würfeln ohne Ergebnis")
        p.locator("[data-ger-tab=pq]").click()
        p.wait_for_timeout(200)
        pruefe(p.locator("[data-ger-modus=auto]").get_attribute("aria-pressed") == "true", f"{n}: Modus geht beim Reiterwechsel verloren")
        pruefe(p.locator("[data-ger-auto]").count() == 2 and p.locator("[data-ger-ergebnis]").count() == 1, f"{n}: Rechnen P&Q ohne Musterlösung")
        keine_ueberbreite(p, n + " rechnen")
        if w < 600:
            sh = arbeits_bottom(p)
            pruefe(sh <= h + 4, f"{n}: Rechnen P&Q scrollt ({sh} > {h})")
        if w in (390, 1280):
            p.screenshot(path=f"{AUS}/rechnen-{w}.png")
        p.locator("[data-ger-modus=lernen]").click()
        p.wait_for_timeout(200)
        pruefe(p.locator("[data-ger-ergebnis]").count() == 0 and p.get_by_role("button", name="Lösung zeigen").count() == 1, f"{n}: Lernen startet nicht neu")
        # Üben nach dem Würfeln: neue Runde, Zielfeld wieder im ersten Schritt; Punkte ändern setzt zurück
        p.locator("[data-ger-modus=ueben]").click(); p.wait_for_timeout(300)
        if p.locator("[data-ueben-wahl]").count() == 1:   # (senkrechte Zufallsgerade: Sonderfall ohne Karten)
            p.locator("[data-ueben-option=richtig]").click(); p.wait_for_timeout(200)
            pruefe(p.locator("[data-ger-ueben-fertig]").count() == 1, f"{n}: Üben nach Würfeln: Schritt 1 nicht erledigt")
            p.get_by_role("button", name="Zufällige Punkte würfeln").click(); p.wait_for_timeout(250)
            pruefe(p.locator("[data-ger-ueben-fertig]").count() == 0, f"{n}: Würfeln setzt Üben nicht zurück")
        else:
            pruefe(p.locator("[data-ger-senkrecht]").count() == 1, f"{n}: Üben ohne Karten und ohne Sonderfall")
        p.locator("[data-ger-tab=pm]").click()
        if w == 390:
            p.screenshot(path=f"{AUS}/pm-390.png")
            p.locator("[data-ger-tab=pq]").click()
            p.screenshot(path=f"{AUS}/pq-390.png")
            p.locator("[data-ger-tab=basics]").click()
            p.screenshot(path=f"{AUS}/basics-390.png")
        p.context.close()
    b.close()

if fehler:
    print("FEHLER:")
    for f in fehler:
        print(" -", f)
    sys.exit(1)
print("Geraden-UI in Ordnung")
