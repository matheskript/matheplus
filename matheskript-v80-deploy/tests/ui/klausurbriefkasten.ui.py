"""Browser-Test „MathildaAI · Klausurbriefkasten“ (/klausurbriefkasten), Antwort der KI gemockt.
Je Breite (360, 390, 1280) und Sprache (DE, EN):
  · Box auf der Mathilda-Seite führt zum Briefkasten
  · Infofeld „So bleibt alles sauber“ sichtbar, „Warum machen wir das so?“ klappt auf
  · Analyse erst nach Angaben + drei Häkchen + Foto möglich
  · zwei Seiten aus der Galerie → Mathilda: Anfrage enthält beide Fotos und die Regeln, aber keinen Lernstand
  · Vorschau „Das merkt sich Mathilda“: Namen und Zahlen aus der Antwort sind entfernt, Hinweis auf Personenbezug,
    Fotos sind verworfen
  · Einwerfen (Vorschau-Modus ohne Supabase) → Danke → „Deine eingeworfenen Arbeiten“ → Löschen
  · Verwerfen speichert nichts; nirgends liegt ein Foto im lokalen Speicher
  · keine Seitenfehler, keine Konsolenfehler, keine Überbreite
  npx vite preview --port 4173 &   →   BASE_URL=http://localhost:4173/ python3 tests/ui/klausurbriefkasten.ui.py
"""
import json, os, struct, zlib
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
AUS = os.environ.get("SCREENS", "/tmp/klausurbriefkasten")
os.makedirs(AUS, exist_ok=True)
fehler = []

def pruefe(bed, text):
    if not bed:
        fehler.append(text)
        print("FEHLT:", text)

def breit_ok(page, breite, wo):
    sw = page.evaluate("document.documentElement.scrollWidth")
    pruefe(sw <= breite, f"{wo}: Überbreite {sw}")

def png(pfad, b=600, h=800):
    roh = b"".join(b"\x00" + bytes([255 if not (180 < y < 220 or 400 < y < 420) else 120] * (b * 3)) for y in range(h))
    def chunk(t, d): return struct.pack(">I", len(d)) + t + d + struct.pack(">I", zlib.crc32(t + d) & 0xffffffff)
    open(pfad, "wb").write(b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", b, h, 8, 2, 0, 0, 0)) + chunk(b"IDAT", zlib.compress(roh)) + chunk(b"IEND", b""))

FOTO = os.path.join(AUS, "seite.png"); png(FOTO)

ANTWORT = {
    "lesbar": True, "rueckfrage": None, "art": "klassenarbeit", "kapitel": "quad", "thema": "Parabeln bei Frau Müller",
    "schwerpunkte": ["Scheitelform", "Nullstellen"], "dauer_min": 45, "gesamtpunkte": 40, "hilfsmittel": ["wtr"],
    "aufgaben": [
        {"nr": "1a", "typ": "Scheitelpunkt bestimmen", "operator": "Bestimme", "inhalt": "Scheitel von f(x) = x^2 - 6x + 5 per quadratischer Ergänzung", "kontext": "innermathematisch", "punkte": 4, "anforderung": "I", "darstellung": ["term"], "ohne_hilfsmittel": True},
        {"nr": "1b", "typ": "Nullstellen mit Formel", "operator": "Berechne", "inhalt": "Nullstellen einer Parabel mit der abc-Formel", "kontext": "innermathematisch", "punkte": 5, "anforderung": "I", "darstellung": ["term"]},
        {"nr": "2", "typ": "Wurfparabel deuten", "operator": "Interpretiere", "inhalt": "Maximale Höhe und Wurfweite bei x = 3,5 deuten", "kontext": "Wurf", "punkte": 8, "anforderung": "II", "darstellung": ["graph", "text"]},
        {"nr": "3", "typ": "Parabelschar untersuchen", "operator": "Zeige", "inhalt": "Für welchen Parameter berührt die Parabel die x-Achse", "kontext": "innermathematisch", "punkte": 6, "anforderung": "III", "darstellung": ["term"]},
    ],
    "niveau": 3, "besonderheiten": ["Teil ohne Taschenrechner"], "personenbezug": ["name", "note"],
}
anfragen = []
def mock(route):
    try: anfragen.append(json.loads(route.request.post_data or "{}"))
    except Exception: anfragen.append({})
    body = {"content": [{"type": "text", "text": json.dumps(ANTWORT, ensure_ascii=False)}]}
    route.fulfill(status=200, content_type="application/json", body=json.dumps(body))

def ausfuellen(page):
    page.select_option("[data-feld=bundesland]", "bw")
    page.select_option("[data-feld=schulart]", "g9")
    page.click("[data-klasse='9']")
    page.select_option("[data-feld=kapitel]", "quad")
    page.fill("[data-feld=schule]", "Gymnasium in Konstanz")

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
            wo = f"{sprache}/{breite}"
            shot = breite in (390, 1280)
            anfragen.clear()

            # Box auf der Mathilda-Seite
            page.goto(BASE + "mathilda"); page.wait_for_timeout(1200)
            box = page.locator("[data-mathilda-briefkasten]")
            pruefe(box.count() == 1, f"{wo}: Box Klausurbriefkasten fehlt auf der Mathilda-Seite")
            if shot: box.scroll_into_view_if_needed(); page.screenshot(path=f"{AUS}/{sprache}-{breite}-0-mathilda-box.png")
            breit_ok(page, breite, f"{wo} Mathilda-Seite")
            box.click(); page.wait_for_timeout(1200)
            pruefe(page.url.rstrip("/").endswith("/klausurbriefkasten"), f"{wo}: Adresse nach Box ist {page.url}")
            pruefe(page.locator("[data-klausurbriefkasten]").count() == 1, f"{wo}: Briefkasten-Seite fehlt")

            # Infofeld
            pruefe(page.locator("[data-briefkasten-info]").count() == 1, f"{wo}: Infofeld fehlt")
            pruefe(page.locator("[data-warum-text]").count() == 0, f"{wo}: Warum-Text sollte zu sein")
            page.click("[data-warum]"); page.wait_for_timeout(200)
            pruefe(page.locator("[data-warum-text]").count() == 1, f"{wo}: Warum-Text klappt nicht auf")
            pruefe("44b" in page.locator("[data-warum-text]").inner_text(), f"{wo}: § 44b fehlt im Warum-Text")
            if shot: page.screenshot(path=f"{AUS}/{sprache}-{breite}-1-start.png", full_page=True)
            breit_ok(page, breite, f"{wo} Start")

            # Analyse gesperrt, bis alles da ist
            knopf = page.locator("[data-bk-fotos] button:has-text('Mathilda')").last
            pruefe(knopf.is_disabled(), f"{wo}: Analyse ohne Angaben möglich")
            ausfuellen(page)
            pruefe(page.locator("[data-freigabe=zurueck]").is_enabled(), f"{wo}: Häkchen nach Angaben gesperrt")
            pruefe(page.locator("[data-scan]").is_disabled(), f"{wo}: Foto ohne Häkchen möglich")
            for f in ("zurueck", "alle", "nurAufgaben"): page.click(f"[data-freigabe={f}]")
            pruefe(page.locator("[data-scan]").is_enabled(), f"{wo}: Foto nach Häkchen gesperrt")
            page.set_input_files("[data-galerie]", FOTO); page.wait_for_timeout(600)
            page.set_input_files("[data-galerie]", FOTO); page.wait_for_timeout(600)
            pruefe(page.locator("[data-bk-fotos] img").count() == 2, f"{wo}: zwei Seiten erwartet")
            if shot: page.screenshot(path=f"{AUS}/{sprache}-{breite}-2-bereit.png", full_page=True)
            breit_ok(page, breite, f"{wo} bereit")
            knopf = page.locator("[data-bk-fotos] button:has-text('Mathilda')").last
            pruefe(knopf.is_enabled(), f"{wo}: Analyse trotz allem gesperrt")
            knopf.click(); page.wait_for_selector("[data-bk-vorschau]", timeout=8000); page.wait_for_timeout(300)

            # Anfrage
            pruefe(len(anfragen) == 1, f"{wo}: {len(anfragen)} KI-Anfragen statt 1")
            if anfragen:
                q = anfragen[0]
                inhalt = q["messages"][0]["content"]
                pruefe(sum(1 for c in inhalt if c.get("type") == "image") == 2, f"{wo}: nicht beide Fotos in der Anfrage")
                pruefe("KLAUSURBRIEFKASTEN" in q.get("system", ""), f"{wo}: Regeln fehlen im Systemprompt")
                pruefe("Lernstand" not in q.get("system", "") and "Vorname" not in q.get("system", ""), f"{wo}: Systemprompt enthält Lernstand/Name")
                pruefe("Baden-Württemberg" in inhalt[-1]["text"] and "quad" in inhalt[-1]["text"], f"{wo}: Angaben fehlen im Prompt")

            # Vorschau
            v = page.locator("[data-bk-vorschau]").inner_text()
            pruefe("Müller" not in v, f"{wo}: Lehrkraft-Name in der Vorschau")
            pruefe("6x" not in v and "3,5" not in v, f"{wo}: Zahlen aus den Aufgaben in der Vorschau")
            pruefe(page.locator("[data-struktur] [style*='grid-template-columns']").count() >= 4, f"{wo}: Aufgabenliste unvollständig")
            pruefe(("Name" in v) if sprache == "de" else ("name" in v), f"{wo}: Hinweis auf Personenbezug fehlt")
            pruefe(page.locator("[data-bk-fotos]").count() == 0 and page.locator("img[src^='data:image']").count() == 0, f"{wo}: Fotos nicht verworfen")
            if shot: page.screenshot(path=f"{AUS}/{sprache}-{breite}-3-vorschau.png", full_page=True)
            breit_ok(page, breite, f"{wo} Vorschau")

            # Einwerfen
            page.locator("[data-bk-vorschau] button").filter(has_text="Briefkasten" if sprache == "de" else "mailbox").click()
            page.wait_for_selector("[data-bk-danke]", timeout=5000)
            pruefe(page.locator("[data-bk-meine]").count() == 1, f"{wo}: Liste der eigenen Meldungen fehlt")
            gespeichert = page.evaluate("JSON.stringify(Object.fromEntries(Object.keys(localStorage).map(k => [k, localStorage.getItem(k)])))")
            pruefe("/9j/" not in gespeichert and "data:image" not in gespeichert and "base64" not in gespeichert, f"{wo}: Foto im lokalen Speicher")
            eigene = json.loads(page.evaluate("localStorage.getItem('matheplus-klausurbriefkasten-eingeworfen') || '[]'"))
            pruefe(len(eigene) == 1 and eigene[0]["klasse"] == 9 and eigene[0]["bundesland"] == "bw" and eigene[0]["kapitel"] == "quad", f"{wo}: Meldung falsch gespeichert")
            pruefe("Müller" not in json.dumps(eigene, ensure_ascii=False), f"{wo}: Name in der Meldung")
            if shot: page.screenshot(path=f"{AUS}/{sprache}-{breite}-4-danke.png", full_page=True)
            breit_ok(page, breite, f"{wo} Danke")

            # Aufklappen und löschen
            page.locator("[data-bk-meine] button[aria-expanded]").first.click(); page.wait_for_timeout(200)
            pruefe(page.locator("[data-bk-meine] [data-struktur]").count() == 1, f"{wo}: Meldung klappt nicht auf")
            page.once("dialog", lambda d: d.accept())
            page.locator("[data-bk-meine] button[aria-label]").first.click(); page.wait_for_timeout(300)
            pruefe(page.locator("[data-bk-meine]").count() == 0, f"{wo}: Meldung nicht gelöscht")

            # Noch einmal, diesmal verwerfen
            page.locator("[data-bk-danke] button").last.click(); page.wait_for_timeout(300)
            pruefe(page.locator("[data-feld=bundesland]").input_value() == "bw", f"{wo}: Angaben nicht übernommen")
            for f in ("zurueck", "alle", "nurAufgaben"): page.click(f"[data-freigabe={f}]")
            page.set_input_files("[data-galerie]", FOTO); page.wait_for_timeout(600)
            page.locator("[data-bk-fotos] button:has-text('Mathilda')").last.click()
            page.wait_for_selector("[data-bk-vorschau]", timeout=8000)
            page.locator("[data-bk-vorschau] button").last.click(); page.wait_for_timeout(300)
            pruefe(page.locator("[data-bk-angaben]").count() == 1 and page.locator("[data-bk-meine]").count() == 0, f"{wo}: Verwerfen hat gespeichert")

            # Direktlink
            page.goto(BASE + "briefkasten"); page.wait_for_timeout(1200)
            pruefe(page.locator("[data-klausurbriefkasten]").count() == 1, f"{wo}: Alias /briefkasten geht nicht")

            pruefe(not konsole, f"{wo}: Konsolenfehler {konsole[:3]}")
            ctx.close()
    b.close()

print("FEHLER:", len(fehler))
for f in fehler: print(" -", f)
raise SystemExit(1 if fehler else 0)
