"""Browser-Test des Bereichs „Textaufgaben übersetzen“ (/textaufgaben).
Je Breite (360, 390, 1280) und Sprache (DE, EN):
  · Training: alle acht Themen, jede erlaubte Stufe (1 Auswahl, 2 tippen, 3 ganze Aufgabe) bis zur Zusammenfassung,
    dabei je einmal ein typischer Denkfehler mit Rückmeldung
  · Verstehen: Beispiel antippen, Übersetzungskette, Wörterbuch mit Suche
  · Mathilda (Antwort der KI gemockt): Text-Eingabe mit Beispiel, Foto aus der Galerie, Abschrift bestätigen,
    eigener Versuch wird geprüft, Aufdecken, „Mathilda dazu fragen“ öffnet den Chat
  · Direktlinks /textaufgaben/verstehen, /textaufgaben/mathilda, Kachel auf der Mathilda-Seite, Bereich auf der Startseite
  · keine Seitenfehler, keine Konsolenfehler, keine Überbreite
  npx vite preview --port 4173 &   →   BASE_URL=http://localhost:4173/ python3 tests/ui/textaufgaben.ui.py
"""
import base64, json, os, struct, zlib
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
AUS = os.environ.get("SCREENS", "/tmp/textaufgaben")
os.makedirs(AUS, exist_ok=True)
fehler = []

def pruefe(bed, text):
    if not bed:
        fehler.append(text)
        print("FEHLT:", text)

def breit_ok(page, breite, wo):
    sw = page.evaluate("document.documentElement.scrollWidth")
    pruefe(sw <= breite, f"{wo}: Überbreite {sw}")

def png(pfad, b=600, h=400):
    """Kleines weißes PNG mit grauem Balken als Testfoto"""
    roh = b"".join(b"\x00" + bytes([255 if not (180 < y < 220) else 120] * (b * 3)) for y in range(h))
    def chunk(t, d): return struct.pack(">I", len(d)) + t + d + struct.pack(">I", zlib.crc32(t + d) & 0xffffffff)
    daten = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", b, h, 8, 2, 0, 0, 0)) + chunk(b"IDAT", zlib.compress(roh)) + chunk(b"IEND", b"")
    open(pfad, "wb").write(daten)

FOTO = os.path.join(AUS, "foto.png"); png(FOTO)

ANTWORT = {
    "lesbar": True, "rueckfrage": None,
    "abschrift": "Der Graph einer ganzrationalen Funktion dritten Grades hat im Punkt $H(-2|4)$ einen Hochpunkt und in W(0|2) einen Wendepunkt. Bestimme die Funktionsgleichung.",
    "unsicher": [], "weitere": [], "thema": "steckbrief", "klasse": "11–13", "gesucht": "Die Gleichung der Funktion f.",
    "ansatz": {"tex": "f(x) = ax^3 + bx^2 + cx + d", "unbekannte": ["a", "b", "c", "d"], "warum": "Dritten Grades, keine Symmetrie: vier Unbekannte."},
    "stellen": [
        {"textstelle": "im Punkt H(-2|4) einen Hochpunkt", "bedeutung": "Bei x = −2 liegt der höchste Punkt.", "bedingungen": [{"tex": "f(-2) = 4", "text": "f(-2) = 4"}, {"tex": "f'(-2) = 0", "text": "f'(-2) = 0"}], "warum": "Punkt auf dem Graphen und waagrechte Tangente.", "falle": "Nicht f(4) = −2."},
        {"textstelle": "in W(0|2) einen Wendepunkt", "bedeutung": "Bei x = 0 wechselt die Krümmung.", "bedingungen": [{"tex": "f(0) = 2", "text": "f(0) = 2"}, {"tex": "f''(0) = 0", "text": "f''(0) = 0"}], "warum": "Punkt und Krümmungswechsel.", "falle": None},
    ],
    "zaehlen": {"unbekannte": 4, "bedingungen": 4, "kommentar": "Vier Bedingungen, vier Unbekannte."},
    "kontext": ["Bestimme die Funktionsgleichung."], "naechster_schritt": "Setze die Bedingungen in den Ansatz ein.", "kontrollfrage": "Warum ist f''(−2) < 0 keine Bedingung?",
}
anfragen = []
def mock(route):
    try:
        anfragen.append(json.loads(route.request.post_data or "{}"))
    except Exception:
        anfragen.append({})
    body = {"content": [{"type": "text", "text": json.dumps(ANTWORT, ensure_ascii=False)}], "kontingent": {"anzahl": 3, "limit": 30, "plan": "free"}}
    route.fulfill(status=200, content_type="application/json", body=json.dumps(body))

def aufgabe(page):
    return page.evaluate("JSON.parse(JSON.stringify(window.__taAufgabe, (k, v) => typeof v === 'function' ? undefined : v))")

def ansatz_loesen(page, a, wo, falsch_zuerst=False):
    if not a.get("ansatz"):
        return
    o = a["ansatz"]["optionen"]
    if falsch_zuerst:
        f = [x for x in o if not x["richtig"]][0]
        page.locator(f"[data-ansatz-schritt] [data-o='{f['id']}']").click()
        page.locator("[data-ansatz-schritt] button:has-text('Prüfen'), [data-ansatz-schritt] button:has-text('Check')").first.click(); page.wait_for_timeout(80)
        pruefe(page.locator("[data-ansatz-schritt] [role=alert]").count() > 0, f"{wo}: keine Rückmeldung zum falschen Ansatz")
    r = [x for x in o if x["richtig"]][0]
    page.locator(f"[data-ansatz-schritt] [data-o='{r['id']}']").click()
    page.locator("[data-ansatz-schritt] button:has-text('Prüfen'), [data-ansatz-schritt] button:has-text('Check')").first.click(); page.wait_for_timeout(80)
    pruefe(page.locator("[data-ansatz-fertig]").count() == 1, f"{wo}: Ansatz nicht angenommen")

def stelle_loesen(page, a, stufe, wo, falsch_zuerst=False):
    box = page.locator("[data-stellen-schritt]").first
    i = int(box.get_attribute("data-stellen-schritt"))
    s = a["stellen"][i]
    tippen = stufe >= 2 and s["tippbar"]
    pruef = box.locator("button:has-text('Prüfen'), button:has-text('Check')").first
    if tippen:
        feld = box.locator("input").first
        if falsch_zuerst and s["falsch"] and s["falsch"][0].get("c"):
            feld.fill(s["falsch"][0]["c"]); pruef.click(); page.wait_for_timeout(80)
            pruefe(box.locator("[role=alert]").count() > 0, f"{wo}: keine Rückmeldung zum Denkfehler (tippen)")
        feld.fill("; ".join(z["c"] for z in s["ziel"])); pruef.click()
    else:
        ids = [b.get_attribute("data-o") for b in box.locator("[data-o]").all()]
        if falsch_zuerst:
            f = [x for x in ids if x.startswith("f")]
            if f:
                box.locator(f"[data-o='{f[0]}']").click(); pruef.click(); page.wait_for_timeout(80)
                pruefe(box.locator("[role=alert]").count() > 0, f"{wo}: keine Rückmeldung zum Denkfehler (Auswahl)")
                box.locator(f"[data-o='{f[0]}']").click()
        for x in ids:
            if x.startswith("r"):
                box.locator(f"[data-o='{x}']").click()
        pruef.click()
    page.wait_for_timeout(90)

def aufgabe_durch(page, stufe, wo, falsch_zuerst=False):
    a = aufgabe(page)
    ansatz_loesen(page, a, wo, falsch_zuerst)
    if stufe == 3 and any(s["tippbar"] for s in a["stellen"]):
        ziele = [z["c"] for s in a["stellen"] if s["tippbar"] for z in s["ziel"]]
        ganz = page.locator("[data-ganze-aufgabe]")
        pruefe(ganz.count() == 1, f"{wo}: Stufe 3 ohne Eingabe für alle Bedingungen")
        if ganz.count():
            if falsch_zuerst and len(ziele) > 1:
                ganz.locator("textarea").fill(ziele[0])
                ganz.locator("button:has-text('Prüfen'), button:has-text('Check')").first.click(); page.wait_for_timeout(80)
                pruefe(ganz.locator("[role=alert]").count() > 0, f"{wo}: Stufe 3 meldet fehlende Bedingungen nicht")
            ganz.locator("textarea").fill("\n".join(ziele))
            ganz.locator("button:has-text('Prüfen'), button:has-text('Check')").first.click(); page.wait_for_timeout(100)
    for _ in range(8):
        if page.locator("[data-stellen-schritt]").count() == 0:
            break
        stelle_loesen(page, a, stufe, wo, falsch_zuerst)
        falsch_zuerst = False
    pruefe(page.locator("[data-zusammenfassung]").count() == 1, f"{wo}: keine Zusammenfassung ({a['thema']}, Stufe {stufe})")

with sync_playwright() as p:
    b = p.chromium.launch()
    for sprache in ("de", "en"):
        for breite in (360, 390, 1280):
            ctx = b.new_context(viewport={"width": breite, "height": 900}, device_scale_factor=2 if breite == 390 else 1, locale="de-DE")
            page = ctx.new_page()
            konsole = []
            page.on("pageerror", lambda e: konsole.append(f"pageerror: {e}"))
            page.on("console", lambda m: konsole.append(m.text) if m.type == "error" and "net::" not in m.text and "Failed to load resource" not in m.text else None)
            page.route("**/api/claude", mock)
            page.goto(BASE)
            page.evaluate("localStorage.clear(); localStorage.setItem('mm-onboarding-v1', JSON.stringify({uebersprungen:true})); localStorage.setItem('matheskript-einwilligung-v1', JSON.stringify({ja:true, zeit:Date.now()}));"
                          + ("localStorage.setItem('mm-sprache','en');" if sprache == "en" else ""))
            wo0 = f"{sprache}/{breite}"
            shot = breite in (390, 1280)

            # ---------- Training ----------
            page.goto(BASE + "textaufgaben"); page.wait_for_timeout(1500)
            pruefe(page.locator("[data-reiter='training'][aria-selected='true']").count() == 1, f"{wo0}: Training nicht Standard")
            page.locator("[data-themen]").first.wait_for(timeout=8000)
            themen = [x.get_attribute("data-thema") for x in page.locator("[data-thema]").all()]
            pruefe(len(themen) == 8, f"{wo0}: {len(themen)} statt 8 Themen bei „Alle“")
            erster = True
            for th in themen:
                page.locator(f"[data-thema='{th}']").click(); page.wait_for_timeout(150)
                for stufe in (1, 2, 3):
                    knopf = page.locator(f"[data-stufe='{stufe}']")
                    if knopf.is_disabled():
                        pruefe(th == "vektoren", f"{wo0}/{th}: Stufe {stufe} gesperrt")
                        continue
                    knopf.click(); page.wait_for_timeout(120)
                    for k in range(2 if breite == 360 else 1):
                        wo = f"{wo0}/{th}/S{stufe}"
                        aufgabe_durch(page, stufe, wo, falsch_zuerst=(k == 0))
                        breit_ok(page, breite, wo)
                        if shot and sprache == "de" and k == 0 and th in ("steckbrief", "woerter", "stochastik") and stufe in (1, 2):
                            page.screenshot(path=f"{AUS}/{breite}-{th}-S{stufe}.png", full_page=True)
                        page.locator("[data-zusammenfassung] button:has-text('Nächste Aufgabe'), [data-zusammenfassung] button:has-text('Next task')").first.click(); page.wait_for_timeout(120)
                    if erster:
                        erster = False
            pruefe(page.locator("[data-bilanz]").count() == 1, f"{wo0}: Tagesbilanz fehlt")
            # Klassenfilter
            page.locator("[role=group] button:text-is('Klasse 5–6'), [role=group] button:text-is('Year 5–6')").first.click(); page.wait_for_timeout(150)
            pruefe(page.locator("[data-thema]").count() == 1, f"{wo0}: Klasse 5–6 zeigt nicht genau ein Thema")
            page.locator("[role=group] button:text-is('Alle'), [role=group] button:text-is('All')").first.click(); page.wait_for_timeout(100)

            # ---------- Verstehen ----------
            page.goto(BASE + "textaufgaben/verstehen"); page.wait_for_timeout(1200)
            pruefe(page.locator("[data-reiter='verstehen'][aria-selected='true']").count() == 1, f"{wo0}: /textaufgaben/verstehen öffnet nicht Verstehen")
            for t in ("ansatz", "0", "1"):
                page.locator(f"[data-bsp='{t}']").click(); page.wait_for_timeout(60)
            pruefe(page.locator("[data-beispiel] [role=status]").count() == 1, f"{wo0}: Beispiel nicht abgeschlossen")
            for _ in range(3):
                page.locator("[data-kette] button").last.click(); page.wait_for_timeout(40)
            wb = page.locator("[data-woerterbuch]")
            wb.locator("input").fill("mindestens" if sprache == "de" else "at least"); page.wait_for_timeout(100)
            pruefe(wb.locator("text=/P\\(X/").count() >= 1, f"{wo0}: Wörterbuchsuche findet nichts")
            breit_ok(page, breite, f"{wo0}/verstehen")
            if shot and sprache == "de":
                page.screenshot(path=f"{AUS}/{breite}-verstehen.png", full_page=True)

            # ---------- Mathilda: Text ----------
            n0 = len(anfragen)
            page.locator("[data-reiter='mathilda']").click(); page.wait_for_timeout(600)
            pruefe(page.url.rstrip("/").endswith("textaufgaben/mathilda"), f"{wo0}: Adresse folgt dem Reiter nicht ({page.url})")
            page.locator("[data-art='text']").click()
            page.locator("[data-beispiel-text]").click()
            page.locator("[data-modus='selbst']").click()
            page.locator("button:has-text('Übersetzen lassen'), button:has-text('Translate')").last.click()
            page.locator("[data-tm-ergebnis]").wait_for(timeout=8000)
            pruefe(len(anfragen) == n0 + 1, f"{wo0}: keine KI-Anfrage")
            if len(anfragen) > n0:
                q = anfragen[-1]
                pruefe("LÖST die Aufgabe NICHT" in (q.get("system") or ""), f"{wo0}: Übersetzungsregeln fehlen im Systemprompt")
            pruefe(page.locator("[data-abschrift] sup").count() == 2, f"{wo0}: Stellen nicht in der Abschrift markiert")
            pruefe(page.locator("[data-tm-loesung]").count() == 0, f"{wo0}: Lösungen im Modus „selbst“ schon sichtbar")
            k0 = page.locator("[data-tm-stelle='0']")
            k0.locator("input").fill("f(4) = -2; f'(-2) = 0"); k0.locator("button:has-text('Prüfen'), button:has-text('Check')").click(); page.wait_for_timeout(80)
            pruefe(k0.locator("[role=alert]").count() == 1, f"{wo0}: falscher Versuch ohne Rückmeldung")
            k0.locator("input").fill("4 = f(-2); f'(-2)=0"); k0.locator("button:has-text('Prüfen'), button:has-text('Check')").click(); page.wait_for_timeout(80)
            pruefe(k0.locator("[data-tm-loesung]").count() == 1, f"{wo0}: richtiger Versuch nicht erkannt")
            page.locator("[data-tm-stelle='1'] [data-aufdecken]").click(); page.wait_for_timeout(80)
            pruefe(page.locator("[data-tm-zaehlen]").count() == 1, f"{wo0}: Zählen fehlt nach allen Stellen")
            breit_ok(page, breite, f"{wo0}/mathilda")
            if shot and sprache == "de":
                page.screenshot(path=f"{AUS}/{breite}-mathilda.png", full_page=True)
            page.locator("button:has-text('Mathilda dazu fragen'), button:has-text('Ask Mathilda about it')").click(); page.wait_for_timeout(300)
            pruefe(page.locator("[role=dialog][aria-modal='true']").count() == 1, f"{wo0}: Chat öffnet nicht")
            page.keyboard.press("Escape"); page.wait_for_timeout(150)

            # ---------- Mathilda: Foto ----------
            page.locator("button:has-text('Neue Aufgabe übersetzen'), button:has-text('Translate another task')").click(); page.wait_for_timeout(200)
            page.locator("[data-art='foto']").click()
            page.locator("[data-galerie]").set_input_files(FOTO); page.wait_for_timeout(800)
            pruefe(page.locator("[data-mathilda-eingabe] img").count() == 1, f"{wo0}: Foto-Vorschau fehlt")
            page.locator("[data-modus='zeigen']").click()
            page.locator("button:has-text('Übersetzen lassen'), button:has-text('Translate')").last.click()
            page.locator("[data-tm-ergebnis]").wait_for(timeout=8000)
            q = anfragen[-1] if anfragen else {}
            hat_bild = any(c.get("type") == "image" for m in q.get("messages", []) for c in (m.get("content") if isinstance(m.get("content"), list) else []))
            pruefe(hat_bild, f"{wo0}: Foto nicht mitgeschickt")
            pruefe(page.locator("[data-abschrift-frage]").count() == 1, f"{wo0}: Abschrift-Bestätigung fehlt beim Foto")
            pruefe(page.locator("[data-tm-loesung]").count() == 2, f"{wo0}: „Alles zeigen“ zeigt nicht alle Lösungen")
            breit_ok(page, breite, f"{wo0}/mathilda-foto")

            # ---------- Mathilda-Seite → Textaufgabe ----------
            page.goto(BASE + "mathilda"); page.wait_for_timeout(1200)
            kachel = page.locator("[data-mathilda-textaufgabe]")
            pruefe(kachel.count() == 1, f"{wo0}: Kachel „Textaufgabe übersetzen“ auf der Mathilda-Seite fehlt")
            if kachel.count():
                kachel.click(); page.wait_for_timeout(1000)
                pruefe(page.locator("[data-text-mathilda]").count() == 1, f"{wo0}: Kachel öffnet den Übersetzer nicht")
            breit_ok(page, breite, f"{wo0}/mathilda-seite")

            # ---------- Startseite ----------
            page.goto(BASE); page.wait_for_timeout(1200)
            sm = page.locator("text=/Schulmathematik|School math/i")
            if sm.count():
                sm.first.click(); page.wait_for_timeout(600)
            pruefe(page.locator("text=/^(Textaufgaben|Word problems)$/").count() > 0, f"{wo0}: Bereich Textaufgaben fehlt auf der Startseite")

            for k in konsole:
                pruefe(False, f"{wo0}: Konsole: {k[:200]}")
            ctx.close()
    b.close()

print("\n" + ("ALLES OK" if not fehler else f"{len(fehler)} FEHLER"))
raise SystemExit(1 if fehler else 0)
