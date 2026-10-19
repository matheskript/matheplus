"""Browser-Test: Mathilda-Modus überall.
Geht alle Werkzeuge durch, schaltet in den Übungs-/Trainingsmodus und prüft, dass neben „Ich hänge fest“
die goldene Pille „Mathilda-Modus“ steht. In einigen Werkzeugen wird das Fenster geöffnet: Die Aufgabe muss
aus der sichtbaren Karte übernommen sein, die Musterlösung kommt von Mathilda (gemockt), das Foto ebenso.
Bei 390 px (DE) und 1280 px (EN) für die Detailprüfung; keine Überbreite, keine Konsolenfehler.
  npm run build && npx vite preview --port 4173 &   →   python3 tests/ui/mathildamodus-ueberall.ui.py
"""
import json, os, re
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
AUS = os.environ.get("SCREENS", "/tmp/mmu")
os.makedirs(AUS, exist_ok=True)
fehler = []

def pruefe(bed, text):
    if not bed:
        fehler.append(text)
        print("FEHLT:", text)

WERKZEUGE = ("axiome zahlenraeume mengenlogik funktionen geradengleichung parabeln sinus wachstum ableitungstrainer scharen steckbrief optimierung "
             "stammfunktion integrale kombinatorik vierfeldertafel erwartungswert bernoulli hypothesentest normalverteilung koordinaten flaechen quader "
             "winkelsaetze konstruktion kongruenz thales pythagoras kathetensatz kreis koerper strahlensaetze trigonometrie dezimal bruchrechnen bruchterme "
             "terme gleichungen ungleichungen lgs stellenwert ganzezahlen primzahlen rechengesetze groessen zuordnungen prozent diagramme zufall "
             "gleichungen-lernen/training abi-ketten abi-saetze").split()
# Werkzeuge, in denen das Fenster komplett durchgespielt wird
DETAIL = ["kreis", "prozent", "bruchrechnen", "erwartungswert"]

MUSTER = {"aufgabe": "Ein Kreis hat den Radius $r = 4$ cm. Berechne den Umfang.", "zeilen": ["$U = 2 \\cdot \\pi \\cdot r$", "$U = 2 \\cdot \\pi \\cdot 4$", "$U = 8\\pi$"], "ergebnis": "$U \\approx 25,13$ cm"}
FOTO_ANTWORT = {"neuesFoto": False, "zeilen": [{"t": "Zeile 1", "s": "ok"}, {"t": "x = 7", "s": "ok"}], "ergebnis": "x = 7", "stimmt": True, "fehler": None,
                "frage": "", "papier": "blanko", "gelungen": "Sauber untereinander.", "hebel": [{"titel": "Kasten", "text": "Ergebnis einrahmen."}], "aufgabe": "Kasten ergänzen."}

def ki(route):
    body = route.request.post_data or ""
    antwort = MUSTER if "Musterlösung" in body else FOTO_ANTWORT
    route.fulfill(status=200, content_type="application/json", body=json.dumps({"content": [{"type": "text", "text": json.dumps(antwort, ensure_ascii=False)}]}))

from PIL import Image
FOTO = "/tmp/mmu-blatt.png"
Image.new("RGB", (500, 360), "white").save(FOTO)

UEBEN = re.compile(r"^(Üben|Training|Trainieren|Practice|Practise|Train|Aufgaben|Tasks|Üben und Prüfen)$")

def in_uebung(page):
    for rolle in ("tab", "button", "radio"):
        k = page.get_by_role(rolle, name=UEBEN)
        if k.count():
            try:
                k.first.click(timeout=2000); page.wait_for_timeout(500); return True
            except Exception:
                pass
    return False

ergebnis = {}
with sync_playwright() as p:
    b = p.chromium.launch()
    for breite, sprache in ((390, "de"), (1280, "en")):
        ctx = b.new_context(viewport={"width": breite, "height": 860}, device_scale_factor=2, locale="de-DE")
        page = ctx.new_page()
        konsole = []
        page.on("pageerror", lambda e: konsole.append(f"pageerror: {e}"))
        page.on("console", lambda m: konsole.append(m.text) if m.type == "error" and "net::" not in m.text and "Failed to load resource" not in m.text else None)
        page.route("**/api/claude", ki)
        page.goto(BASE)
        page.evaluate(f"""localStorage.clear(); localStorage.setItem('mm-onboarding-v1', JSON.stringify({{uebersprungen:true}}));
          localStorage.setItem('mm-sprache', '{sprache}'); localStorage.setItem('matheskript-einwilligung-v1', '1');""")
        for wz in WERKZEUGE:
            konsole.clear()
            page.goto(BASE + wz); page.wait_for_timeout(900)
            pille = page.locator("[data-mathilda-modus]")
            if not pille.count():
                in_uebung(page)
                # Abi-Ketten/-Sätze: erste Kette bzw. ersten Satz öffnen
                if not pille.count() and wz.startswith("abi"):
                    for name in (re.compile(r"^(Starten|Kette starten|Satz starten|Start|Los)"), re.compile(r"Analysis|Satz 1|Kette 1")):
                        k = page.get_by_role("button", name=name)
                        if k.count():
                            k.first.click(); page.wait_for_timeout(700)
                            if pille.count(): break
                if not pille.count() and wz.startswith("gleichungen-lernen"):
                    k = page.get_by_role("button", name=re.compile(r"(Runde|round)", re.I))
                    if k.count(): k.first.click(); page.wait_for_timeout(700)
            n = pille.count()
            ergebnis.setdefault(wz, {})[breite] = n
            pruefe(n >= 1, f"{breite}: {wz} ohne Mathilda-Knopf")
            if n:
                pille.first.scroll_into_view_if_needed()
                sw = page.evaluate("document.documentElement.scrollWidth"); pruefe(sw <= breite, f"{breite}: {wz} Überbreite {sw}")
            pruefe(not konsole, f"{breite}: {wz} Konsole {konsole[:2]}")

            if n and wz in DETAIL:
                page.screenshot(path=f"{AUS}/{breite}-{wz}-1-pille.png")
                pille.first.click(); page.wait_for_timeout(900)
                fen = page.locator("[data-mathilda-modus-fenster]")
                pruefe(fen.count() == 1, f"{breite}: {wz} Fenster fehlt")
                kopie = page.locator("[data-mm-kopie]")
                txt = kopie.inner_text() if kopie.count() else ""
                pruefe(len(txt.strip()) > 12, f"{breite}: {wz} Aufgabe nicht übernommen ({txt[:40]!r})")
                pruefe(kopie.locator("button, input").count() == 0 if kopie.count() else False, f"{breite}: {wz} Kopie enthält Knöpfe/Felder")
                page.screenshot(path=f"{AUS}/{breite}-{wz}-2-fenster.png")
                page.locator("[data-mm-muster]").click(); page.wait_for_timeout(1200)
                pruefe(page.locator("[data-mm-muster-offen]").count() == 1, f"{breite}: {wz} Musterlösung von Mathilda fehlt")
                page.locator("[data-mm-muster-offen]").scroll_into_view_if_needed()
                page.screenshot(path=f"{AUS}/{breite}-{wz}-3-muster.png")
                page.locator("[data-mm-galerie]").set_input_files(FOTO); page.wait_for_timeout(700)
                page.locator("[data-mm-senden]").click(); page.wait_for_timeout(1200)
                pruefe(page.locator("[data-mm-rueckmeldung=richtig]").count() == 1, f"{breite}: {wz} Rückmeldung fehlt")
                uebernimm = page.locator("[data-mm-uebernehmen]")
                if uebernimm.count():
                    uebernimm.click(); page.wait_for_timeout(400)
                    pruefe(fen.count() == 0, f"{breite}: {wz} Fenster bleibt nach Übernehmen offen")
                    werte = page.evaluate("Array.from(document.querySelectorAll('input')).map(i => i.value)")
                    pruefe("7" in werte, f"{breite}: {wz} Wert nicht im Feld ({werte})")
                else:
                    page.keyboard.press("Escape"); page.wait_for_timeout(300)
                    pruefe(fen.count() == 0, f"{breite}: {wz} Escape schließt nicht")
                pruefe(not konsole, f"{breite}: {wz} Konsole im Fenster {konsole[:2]}")
        ctx.close()
    b.close()

ohne = [w for w, v in ergebnis.items() if not any(v.values())]
print(f"{len(ergebnis) - len(ohne)} von {len(ergebnis)} Werkzeugen mit Mathilda-Knopf" + (f" · ohne: {', '.join(ohne)}" if ohne else ""))
print("OK" if not fehler else f"{len(fehler)} Fehler")
raise SystemExit(1 if fehler else 0)
