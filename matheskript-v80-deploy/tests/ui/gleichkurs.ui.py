"""Browser-Test des Bereichs „Gleichungen“ (/gleichungen-lernen, src/funcGleichKurs.jsx):
- vier Reiter Verstehen · Auto · Üben · Lernen (Modus-Satz darunter), Verstehen (Film, Rechenkette),
  „Jetzt Schritt für Schritt rechnen“ führt nach Üben;
- Auto: alle 7 Stufen – die ganze Rechnung mit Umformungen, Schrittliste, Probe, „Noch eine“;
- Üben: alle 7 Stufen Schritt für Schritt mit goldenen Karten (UebenWahl), Zielfeld gold, Fehlklick → Karte rot + Hinweis,
  Schrittzähler, Abschluss (Probe + „x von n Schritten auf Anhieb“), „Jetzt selbst rechnen“ → Lernen mit Runde der Stufe;
- Lernen: Runde mit falscher und richtigen Antworten, Auswertung, Stufe 6 mit zwei Lösungen;
- alte Pfade /rechnen und /training landen auf Üben bzw. Lernen.
Breiten 360/390/1280, DE und EN; keine Seitenfehler, keine Überbreite.
  npx vite build && npx vite preview --port 4384 &   →   BASE_URL=http://localhost:4384/ python3 -u tests/ui/gleichkurs.ui.py
"""
import os
import re
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4384/")
AUS = os.environ.get("SCREENS", "/tmp/gleichkurs")
os.makedirs(AUS, exist_ok=True)
fehler = []
def pruefe(bed, text):
    if not bed:
        fehler.append(text); print("FEHLT:", text)

def breite_ok(page, breite, wo):
    sw = page.evaluate("document.documentElement.scrollWidth"); pruefe(sw <= breite, f"{wo}: Überbreite {sw}")

def reiter(page, i):
    page.get_by_role("tab").nth(i).click(); page.wait_for_timeout(400)

def gewaehlt(page):
    """Index des gewählten Reiters"""
    tabs = page.get_by_role("tab")
    for i in range(tabs.count()):
        if tabs.nth(i).get_attribute("aria-selected") == "true": return i
    return -1

def ueben_loesen(page, wo, fehlklick=False, shot=None):
    """Üben: bis zum Abschluss klicken; mit fehlklick=True im ersten Wahl-Schritt zuerst eine falsche Karte.
    Liefert (Zahl der Wahl-Schritte, Zahl der Schritte mit Fehlklick)."""
    schritte = 0; fehl = 0; erster = True
    for _ in range(30):
        if page.locator("[data-ueben-fertig]").count(): break
        auto = page.locator("[data-gk-auto] button:visible")
        if auto.count():
            pruefe(page.locator("[data-ueben-ziel]").count() == 1, f"{wo}: Zielfeld beim Ablese-Schritt fehlt")
            auto.first.click(); page.wait_for_timeout(120); continue
        wahl = page.locator("[data-ueben-wahl]")
        if not wahl.count(): break
        schritte += 1
        n_opt = wahl.locator(".uw-option").count()
        pruefe(2 <= n_opt <= 4, f"{wo}: {n_opt} Karten")
        pruefe(wahl.locator("[data-ueben-option='richtig']").count() == 1, f"{wo}: nicht genau eine richtige Karte")
        pruefe(wahl.locator("button[data-gk-option]").count() == n_opt, f"{wo}: data-gk-option fehlt an den Karten")
        pruefe(page.locator("[data-ueben-ziel]").count() == 1, f"{wo}: Zielfeld fehlt")
        if erster:
            erster = False
            frage = wahl.locator(".uw-frage").inner_text().lower()
            pruefe("schritt 1 von" in frage or re.search(r"step 1 (of|from)", frage), f"{wo}: Schrittzähler fehlt ({frage!r})")
            rand = wahl.locator(".uw-option").first.evaluate("e => getComputedStyle(e).borderTopColor").replace(" ", "")
            pruefe(rand == "rgb(237,187,0)", f"{wo}: Karte ohne goldenen Rand ({rand})")
            ziel = page.locator("[data-ueben-ziel]").first.evaluate("e => getComputedStyle(e).borderTopColor").replace(" ", "")
            pruefe(ziel == "rgb(237,187,0)", f"{wo}: Zielfeld nicht gold ({ziel})")
            # Karten nicht abgeschnitten: der Text passt in die Karte
            voll = wahl.locator(".uw-option").evaluate_all("els => els.every(e => e.scrollWidth <= e.clientWidth + 1)")
            pruefe(voll, f"{wo}: Kartentext abgeschnitten")
            if fehlklick:
                f = wahl.locator("[data-ueben-option='falsch']").first
                f.click(); page.wait_for_timeout(250); fehl += 1
                pruefe(page.locator("[data-ueben-hinweis]").count() == 1, f"{wo}: kein Hinweis nach falscher Karte")
                pruefe(wahl.locator(".uw-option[data-status='falsch']").count() == 1, f"{wo}: falsche Karte nicht rot markiert")
                hinweis = page.locator("[data-ueben-hinweis]").inner_text()
                pruefe(len(hinweis) > 20 and ". " in hinweis, f"{wo}: Hinweis ohne Fehlername/Grund ({hinweis[:60]!r})")
                pruefe(page.locator("[data-ueben-ziel]").count() == 1, f"{wo}: Zielfeld nach Fehlklick verschwunden")
                pruefe(page.locator("[data-gk-fertig]").count() == 0, f"{wo}: falsche Karte wurde übernommen")
                if shot: page.screenshot(path=f"{AUS}/{shot}-falsch.png", full_page=True)
        wahl.locator("[data-ueben-option='richtig']").first.click(); page.wait_for_timeout(150)
    pruefe(page.locator("[data-ueben-fertig]").count() == 1, f"{wo}: Üben ohne Abschluss")
    pruefe(page.locator("[data-gk-fertig]").count() == 1, f"{wo}: nicht bis zur Probe")
    pruefe(page.locator("[data-ueben-ziel]").count() == 0, f"{wo}: Zielfeld bleibt nach dem Ende")
    txt = page.locator("[data-ueben-fertig]").inner_text()
    erwartet = f"{schritte - fehl} von {schritte}" if fehl else f"Alle {schritte} Schritte"
    pruefe(erwartet in txt, f"{wo}: Bilanz falsch – erwartet „{erwartet}“ in {txt[:80]!r}")
    return schritte, fehl

def antwort(page, werte):
    for i, w in enumerate(werte):
        for z in str(w).replace("-", "−"):
            page.keyboard.press("-" if z == "−" else z)
        page.keyboard.press("Enter")
        page.wait_for_timeout(60)

with sync_playwright() as p:
    b = p.chromium.launch()
    for sprache in ("de", "en"):
        for breite in (360, 390, 1280):
            wo0 = f"{sprache}/{breite}"
            shot = breite == 390 and sprache == "de"
            ctx = b.new_context(viewport={"width": breite, "height": 900}, locale="de-DE", reduced_motion="no-preference")
            page = ctx.new_page(); konsole = []
            page.on("pageerror", lambda e: konsole.append(f"pageerror: {e}"))
            page.on("console", lambda m: konsole.append(m.text) if m.type == "error" and "net::" not in m.text and "Failed to load resource" not in m.text else None)
            page.goto(BASE)
            page.evaluate("localStorage.clear(); localStorage.setItem('mm-start-app','1'); localStorage.setItem('mm-onboarding-v1', JSON.stringify({uebersprungen:true}));" + ("localStorage.setItem('mm-sprache','en');" if sprache == "en" else ""))

            # Verstehen: vier Reiter, Modus-Satz
            page.goto(BASE + "gleichungen-lernen"); page.wait_for_timeout(1200)
            tabs = page.get_by_role("tab")
            pruefe(tabs.count() == 4, f"{wo0}: {tabs.count()} statt vier Reiter")
            namen = [tabs.nth(i).inner_text().strip() for i in range(tabs.count())]
            soll = ["Verstehen", "Auto", "Üben", "Lernen"] if sprache == "de" else ["Understand", "Auto", "Practise", "Learn"]
            pruefe(all(namen[i].endswith(soll[i]) for i in range(min(4, len(namen)))), f"{wo0}: Reiter heißen {namen}")
            pruefe(gewaehlt(page) == 0, f"{wo0}: Verstehen nicht vorgewählt")
            pruefe(page.locator("[data-gk-modus-text]").count() == 1 and len(page.locator("[data-gk-modus-text]").inner_text()) > 20, f"{wo0}: Modus-Satz fehlt")
            # Reiter passen in eine Zeile (Text nicht abgeschnitten, keine zwei Zeilen)
            eng = page.evaluate("[...document.querySelectorAll('[role=tab]')].some(b => b.scrollWidth > b.clientWidth + 1 || b.getBoundingClientRect().height > 60)")
            pruefe(not eng, f"{wo0}: Reiter-Beschriftung abgeschnitten oder umgebrochen")
            film = page.locator("[role=region]")
            pruefe(film.count() == 1, f"{wo0}: Film fehlt")
            page.wait_for_timeout(3500)
            if shot: film.screenshot(path=f"{AUS}/film-szene1.png")
            dots = film.locator("button[aria-label^='Szene'], button[aria-label^='Scene']")
            pruefe(dots.count() == 7, f"{wo0}: {dots.count()} Szenen")
            for i in range(dots.count()):
                dots.nth(i).click(); page.wait_for_timeout(2600 if i in (1, 6) else 400)
                if shot: film.screenshot(path=f"{AUS}/film-szene{i+1}.png")
                breite_ok(page, breite, f"{wo0}/film{i}")
            film.locator("button").first.click()   # Pause
            for _ in range(4):
                k = page.locator("button:has-text('Rückwärts:'), button:has-text('Backwards:')")
                if not k.count(): break
                k.first.click(); page.wait_for_timeout(250)
            pruefe(page.locator("text=/Gefunden: x|Found: x/").count() >= 1, f"{wo0}: Rechenkette nicht bis x")
            breite_ok(page, breite, f"{wo0}/verstehen")
            if shot: page.screenshot(path=f"{AUS}/verstehen.png", full_page=True)
            # „Jetzt Schritt für Schritt rechnen“ → Üben
            page.locator("button:has-text('Jetzt Schritt für Schritt rechnen'), button:has-text('Now solve step by step')").first.click(); page.wait_for_timeout(500)
            pruefe(gewaehlt(page) == 2 and page.locator("[data-gk-ueben-weg]").count() == 1, f"{wo0}: Verstehen-Knopf führt nicht nach Üben")

            # Auto: alle Stufen – ganze Rechnung, Schrittliste, Probe, keine Auswahl
            reiter(page, 1)
            pruefe(page.locator("[data-gk-auto-weg]").count() == 1, f"{wo0}: Auto fehlt")
            mt = page.locator("[data-gk-modus-text]").inner_text()
            pruefe(("rechnet dir den Weg vor" in mt) or ("works out" in mt), f"{wo0}: Modus-Satz Auto ({mt!r})")
            chips = page.locator("button[aria-pressed][aria-label^='Stufe'], button[aria-pressed][aria-label^='Level']")
            pruefe(chips.count() == 7, f"{wo0}: {chips.count()} Stufen-Chips in Auto")
            for i in range(chips.count()):
                chips.nth(i).click(); page.wait_for_timeout(250)
                wo = f"{wo0}/auto/s{i+1}"
                pruefe(page.locator("[data-gk-fertig]").count() == 1, f"{wo}: Probe fehlt")
                pruefe(page.locator("[data-ueben-wahl], [data-gk-option], [data-ueben-ziel]").count() == 0, f"{wo}: Auto zeigt Auswahl oder Zielfeld")
                zeilen = page.locator("[data-gk-auto-weg] [role=list] [role=listitem]").count()
                schritte = page.locator("[data-gk-auto-weg] ol li").count()
                pruefe(zeilen >= 2 and schritte >= 1 and zeilen - schritte in (1, 2), f"{wo}: Rechnung {zeilen} Zeilen zu {schritte} Schritten")   # + eine oder zwei Lösungszeilen
                pruefe(page.locator("[data-gk-fertig]").inner_text().count("✓") >= 2, f"{wo}: Probe ohne Häkchen")
                ketten = page.locator("button:has-text('Als Rechenkette ansehen'), button:has-text('Show as a chain')")
                if ketten.count(): ketten.first.click(); page.wait_for_timeout(100)
                breite_ok(page, breite, wo)
                if shot and i in (0, 3, 6): page.screenshot(path=f"{AUS}/auto-s{i+1}.png", full_page=True)
            page.locator("button:has-text('Noch eine'), button:has-text('Another one')").first.click(); page.wait_for_timeout(250)
            pruefe(page.locator("[data-gk-fertig]").count() == 1, f"{wo0}/auto: nach „Noch eine“ keine Rechnung")

            # Üben: alle Stufen, in Stufe 1 mit einem Fehlklick
            reiter(page, 2)
            pruefe(page.locator("[data-gk-ueben-weg]").count() == 1, f"{wo0}: Üben fehlt")
            mt = page.locator("[data-gk-modus-text]").inner_text()
            pruefe(("richtige Zeile" in mt) or ("right line" in mt), f"{wo0}: Modus-Satz Üben ({mt!r})")
            chips = page.locator("button[aria-pressed][aria-label^='Stufe'], button[aria-pressed][aria-label^='Level']")
            pruefe(chips.count() == 7, f"{wo0}: {chips.count()} Stufen-Chips in Üben")
            for i in range(chips.count()):
                chips.nth(i).click(); page.wait_for_timeout(250)
                wo = f"{wo0}/ueben/s{i+1}"
                ketten = page.locator("button:has-text('Als Rechenkette ansehen'), button:has-text('Show as a chain')")
                if ketten.count(): ketten.first.click(); page.wait_for_timeout(100)
                if shot and i == 0: page.screenshot(path=f"{AUS}/ueben-start.png", full_page=True)
                n, fehl = ueben_loesen(page, wo, fehlklick=(i == 0), shot=f"ueben-s{i+1}" if shot and i == 0 else None)
                breite_ok(page, breite, wo)
                if shot: page.screenshot(path=f"{AUS}/ueben-s{i+1}.png", full_page=True)
                if i == 0:
                    pruefe(fehl == 1 and n >= 1, f"{wo}: Fehlklick nicht gezählt")
                if i < 6:
                    # Abschluss hat „Noch eine“ und „Jetzt selbst rechnen“
                    pruefe(page.locator("[data-ueben-fertig] button:has-text('Noch eine'), [data-ueben-fertig] button:has-text('Another one')").count() == 1, f"{wo}: „Noch eine“ fehlt")
                    pruefe(page.locator("[data-ueben-fertig] button:has-text('Jetzt selbst rechnen'), [data-ueben-fertig] button:has-text('Now solve it yourself')").count() == 1, f"{wo}: „Jetzt selbst rechnen“ fehlt")
            # „Noch eine“ → neue Aufgabe derselben Stufe (Stufe 7)
            page.locator("[data-ueben-fertig] button:has-text('Noch eine'), [data-ueben-fertig] button:has-text('Another one')").first.click(); page.wait_for_timeout(300)
            pruefe(page.locator("[data-ueben-fertig]").count() == 0 and page.locator("[data-ueben-wahl], [data-gk-auto]").count() >= 1, f"{wo0}: „Noch eine“ startet keine neue Aufgabe")
            # „Jetzt selbst rechnen“ → Lernen, Runde der Stufe 7
            ueben_loesen(page, f"{wo0}/ueben/s7b")
            page.locator("[data-ueben-fertig] button:has-text('Jetzt selbst rechnen'), [data-ueben-fertig] button:has-text('Now solve it yourself')").first.click(); page.wait_for_timeout(500)
            pruefe(page.locator("text=/Lernen · Stufe 7|Learn · Level 7/").count() == 1, f"{wo0}: „Jetzt selbst rechnen“ startet keine Runde der Stufe 7")
            a = page.evaluate("window.__gkAufgabe && window.__gkAufgabe.stufe")
            pruefe(a == "s7", f"{wo0}: Runde nach Üben nicht Stufe 7 ({a})")
            if shot: page.screenshot(path=f"{AUS}/nach-ueben-lernen.png", full_page=True)
            page.locator("button:has-text('Lernen · Stufe 7'), button:has-text('Learn · Level 7')").first.click(); page.wait_for_timeout(400)
            pruefe(gewaehlt(page) == 3, f"{wo0}: nach der Runde nicht in Lernen")
            ue = page.locator("text=/In „Üben“ geführt gelöste|in “Practise” count/")
            pruefe(ue.count() >= 1, f"{wo0}: Hinweis „mit Hilfe“ nennt nicht Üben")

            # Lernen: Runde Stufe 1, erste Antwort absichtlich falsch
            if shot: page.screenshot(path=f"{AUS}/lernen.png", full_page=True)
            page.locator("button[aria-label^='Stufe 1:'], button[aria-label^='Level 1:']").first.click(); page.wait_for_timeout(400)
            for n in range(12):
                if page.locator("text=/Noch eine Runde|Another round/").count(): break
                a = page.evaluate("window.__gkAufgabe && { l: window.__gkAufgabe.loesungen, id: window.__gkAufgabe.id }")
                if not a: break
                if n == 0:
                    antwort(page, [a["l"][0] + 1]); page.wait_for_timeout(200)
                    pruefe(page.locator("text=/Weiter|Next/").count() >= 1, f"{wo0}: falsche Antwort ohne Rückmeldung")
                    if shot: page.screenshot(path=f"{AUS}/runde-falsch.png", full_page=True)
                    page.keyboard.press("Enter"); page.wait_for_timeout(200)
                else:
                    antwort(page, a["l"]); page.wait_for_timeout(1500)
            pruefe(page.locator("text=/Noch eine Runde|Another round/").count() >= 1, f"{wo0}: Runde nicht abgeschlossen")
            breite_ok(page, breite, f"{wo0}/auswertung")
            if shot: page.screenshot(path=f"{AUS}/auswertung.png", full_page=True)

            # Runde mit Stufe 6 (zwei Lösungen) direkt anstoßen
            page.locator("button:has-text('Zur Übersicht'), button:has-text('To the overview')").first.click(); page.wait_for_timeout(300)
            page.locator("button[aria-label^='Stufe 6:'], button[aria-label^='Level 6:']").first.click(); page.wait_for_timeout(400)
            a = page.evaluate("window.__gkAufgabe.loesungen")
            antwort(page, a); page.wait_for_timeout(300)
            pruefe(page.locator("text=/✓/").count() >= 1, f"{wo0}: zwei Lösungen nicht erkannt")

            # Alte Pfade: /rechnen → Üben, /training → Lernen (Adresse wird umgeschrieben)
            page.goto(BASE + "gleichungen-lernen/rechnen"); page.wait_for_timeout(1200)
            pruefe(gewaehlt(page) == 2 and page.locator("[data-gk-ueben-weg]").count() == 1, f"{wo0}: /rechnen landet nicht auf Üben")
            pruefe(page.url.rstrip("/").endswith("/gleichungen-lernen/ueben"), f"{wo0}: /rechnen nicht umgeschrieben ({page.url})")
            page.goto(BASE + "gleichungen-lernen/training"); page.wait_for_timeout(1200)
            pruefe(gewaehlt(page) == 3, f"{wo0}: /training landet nicht auf Lernen")
            pruefe(page.url.rstrip("/").endswith("/gleichungen-lernen/lernen"), f"{wo0}: /training nicht umgeschrieben ({page.url})")
            page.goto(BASE + "gleichungen-lernen/auto"); page.wait_for_timeout(1200)
            pruefe(gewaehlt(page) == 1 and page.locator("[data-gk-auto-weg]").count() == 1, f"{wo0}: /auto öffnet nicht Auto")

            for k in konsole: pruefe(False, f"{wo0}: Konsole {k}")
            ctx.close()
    b.close()
print("FEHLER:" if fehler else "OK –", len(fehler), "Befunde")
for f in fehler: print(" -", f)
raise SystemExit(1 if fehler else 0)
