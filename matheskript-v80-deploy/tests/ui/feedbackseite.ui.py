"""Browser-Test Feedback-Seite (src/funcFeedbackSeite.jsx, Daten src/feedback.js).
  npx vite build && npx vite preview --port 4173 &   →   python3 tests/ui/feedbackseite.ui.py
  BILDER=<ordner> legt Bildschirmfotos ab.

Geprüft je Breite (360, 390, 768, 1280):
  - /feedback lädt ohne Seitenfehler, keine Überbreite, Titel „Feedback“
  - Bühne: Schlagzeile „Diese Seite ist eine Baustelle.“, Schleife, direkter Knopf; Feedback-Knopf unten ausgeblendet
  - alle sechs Kapitel da; Kapitelübersicht springt zum Abschnitt
  - Frage-Karte „Das verstehe ich nicht“ öffnet das Formular mit vorgewählter Art
  - „Als Elternteil“ wählt die Rolle Eltern (Formular gesiezt)
  - Formular: Prüfung in der Reihenfolge Rolle → Art → Text → Einwilligung; Voice-Umschalter zeigt das Mikrofon;
    Senden ohne Supabase meldet den Demo-Modus (nichts wird gesendet)
  - Handy: feste Knopfleiste nach der Bühne, weg beim Formular
  - Ganz unten „Diese Seite teilen“: Direct Link https://mythosmathe.de/feedback, WhatsApp mit Link, „Link kopieren“ meldet sich
  - Feedback-Knopf auf einer anderen Seite (/vision): Auswahl hat den dritten Punkt zur Feedback-Seite
  - Unten auf jeder Seite (320/360/390/1280): Link „Feedback-Seite“ rechts neben „Feedback geben“, als Paar mittig
    (unter 350 px darunter); Tool-Seiten: eigene Zeile unter Teilen | Feedback, offenes Teilen-Panel dazwischen;
    Text einzeilig und im Knopf; Klick öffnet /feedback in der App; dunkle Vision-Seite: helle Schrift
  - Gast ohne Passwort (Cookie mm_gast=1, leerer Speicher): /feedback ohne Fenster darüber, Formular geht;
    Link vom Impressum bleibt in der App; „Weiter üben“ führt über eine echte Seitenanfrage zur Startadresse
"""
import os
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/").rstrip("/") + "/"
BILDER = os.environ.get("BILDER")
fehler = []
def pruefe(bed, text):
    if not bed:
        fehler.append(text); print("FEHLT:", text)

def foto(page, name, voll=False):
    if BILDER:
        os.makedirs(BILDER, exist_ok=True)
        page.screenshot(path=os.path.join(BILDER, name + ".png"), full_page=voll)

def oeffnen(b, breite, pfad="feedback"):
    ctx = b.new_context(viewport={"width": breite, "height": 860}, locale="de-DE")
    page = ctx.new_page()
    konsole = []
    page.on("pageerror", lambda e: konsole.append(f"pageerror: {e}"))
    page.goto(BASE)
    page.evaluate("localStorage.clear(); localStorage.setItem('mm-start-app','1'); localStorage.setItem('mm-onboarding-v1', JSON.stringify({uebersprungen:true}));")
    page.goto(BASE + pfad); page.wait_for_timeout(2500)
    return ctx, page, konsole

with sync_playwright() as p:
    b = p.chromium.launch()
    for breite in (360, 390, 768, 1280):
        tag = f"{breite}"
        ctx, page, konsole = oeffnen(b, breite)
        pruefe(page.locator("[data-feedback-seite-wurzel]").count() == 1, f"{tag}: Feedback-Seite fehlt")
        pruefe("Feedback" in page.title(), f"{tag}: Titel {page.title()}")
        pruefe(page.locator("h1#fs-titel").inner_text().replace("\n", " ").strip() == "Diese Seite ist eine Baustelle.", f"{tag}: Schlagzeile")
        pruefe(page.locator(".fs-schleife").count() == 1, f"{tag}: Schleife fehlt")
        pruefe(page.locator("[data-feedback-direkt]").is_visible(), f"{tag}: direkter Knopf fehlt")
        pruefe(not page.locator(".fb-fuss").is_visible(), f"{tag}: Feedback-Knopf unten müsste auf dieser Seite ausgeblendet sein")
        foto(page, f"held-{breite}")
        pruefe(not page.evaluate("document.documentElement.scrollWidth > window.innerWidth + 1"), f"{tag}: Überbreite oben")
        for k in ("fb-baustelle", "fb-fragen", "fb-eltern", "fb-genau", "fb-senden", "fb-danach"):
            pruefe(page.locator(f"#{k}").count() == 1, f"{tag}: Abschnitt {k} fehlt")

        # Kapitelübersicht springt
        page.locator(".fs-kapitel button", has_text="Für Eltern").click(); page.wait_for_timeout(1400)
        y = page.evaluate("document.getElementById('fb-eltern').getBoundingClientRect().top")
        pruefe(-5 < y < 140, f"{tag}: Kapitelsprung Für Eltern (top={y:.0f})")

        # Handy-Leiste: nach der Bühne sichtbar, beim Formular weg
        if breite < 900:
            pruefe("sichtbar" in (page.locator(".fs-leiste-u").get_attribute("class") or ""), f"{tag}: Knopfleiste nach der Bühne fehlt")
            foto(page, f"leiste-unten-{breite}")
        else:
            pruefe(not page.locator(".fs-leiste-u").is_visible(), f"{tag}: Knopfleiste am Desktop")

        # Frage-Karte wählt die Art vor und springt zum Formular
        page.locator("[data-fs-frage='unklar']").click(); page.wait_for_timeout(1400)
        y = page.evaluate("document.getElementById('fb-senden').getBoundingClientRect().top")
        pruefe(-5 < y < 140, f"{tag}: Frage-Karte springt nicht zum Formular (top={y:.0f})")
        pruefe(page.locator("[data-fs-art='unklar']").get_attribute("aria-pressed") == "true", f"{tag}: Art nicht vorgewählt")
        if breite < 900:
            pruefe("sichtbar" not in (page.locator(".fs-leiste-u").get_attribute("class") or ""), f"{tag}: Knopfleiste bleibt beim Formular")

        # Prüfreihenfolge: erst Rolle
        page.locator("[data-fs-senden]").click(); page.wait_for_timeout(300)
        m = page.locator("[data-fs-meldung]").inner_text()
        pruefe("wer du bist" in m, f"{tag}: erste Meldung sollte nach der Rolle fragen: {m}")
        page.locator("[data-fs-rolle='schueler']").click()
        pruefe(page.locator("[data-fs-klasse='10']").count() == 1, f"{tag}: Klassen-Chips für Schüler fehlen")
        page.locator("[data-fs-klasse='10']").click()
        page.locator("[data-fs-senden]").click(); page.wait_for_timeout(300)
        m = page.locator("[data-fs-meldung]").inner_text()
        pruefe("paar Worte" in m, f"{tag}: ohne Text sollte nach Worten gefragt werden: {m}")
        page.locator("[data-fs-ort]").fill("Integrale, Stufe 2")
        page.locator("[data-fs-text]").fill("Ich verstehe den zweiten Schritt nicht.")
        page.locator("[data-fs-senden]").click(); page.wait_for_timeout(300)
        m = page.locator("[data-fs-meldung]").inner_text()
        pruefe("Einwilligung" in m, f"{tag}: ohne Haken sollte die Einwilligung fehlen: {m}")
        foto(page, f"formular-{breite}")
        page.locator("[data-fs-einw]").check()
        page.locator("[data-fs-senden]").click(); page.wait_for_timeout(600)
        m = page.locator("[data-fs-meldung]").inner_text()
        pruefe("Demo-Modus" in m or page.locator("[data-fs-danke]").count() == 1, f"{tag}: Senden ohne Supabase: {m}")

        # Voice-Umschalter
        page.locator("[data-fs-weg='voice']").click(); page.wait_for_timeout(200)
        pruefe(page.locator("[data-fs-mikro]").is_visible(), f"{tag}: Mikrofon fehlt im Voice-Modus")
        foto(page, f"voice-{breite}")

        # Eltern-Knopf wählt die Rolle
        page.locator("[data-fs-eltern]").click(); page.wait_for_timeout(1200)
        pruefe(page.locator("[data-fs-rolle='eltern']").get_attribute("aria-pressed") == "true", f"{tag}: Rolle Eltern nicht gewählt")
        pruefe("Ihre Nachricht" in page.locator("[data-fs-form]").inner_text(), f"{tag}: Eltern-Formular nicht gesiezt")

        # Ganz durchscrollen: alles eingeblendet, nirgends Überbreite
        h = page.evaluate("document.documentElement.scrollHeight")
        y = 0
        while y < h:
            y += 600; page.evaluate(f"window.scrollTo(0,{y})"); page.wait_for_timeout(90)  # sprung-frei: Test
        page.wait_for_timeout(1200)
        pruefe(page.evaluate("[...document.querySelectorAll('.fs-auf')].every(e => e.classList.contains('da'))"), f"{tag}: nicht alles eingeblendet")
        pruefe(not page.evaluate("document.documentElement.scrollWidth > window.innerWidth + 1"), f"{tag}: Überbreite unten")
        # Ganz unten: „Diese Seite teilen“ mit Direct Link
        t = page.locator("[data-feedback-teilen]")
        pruefe(t.count() == 1, f"{tag}: Block „Diese Seite teilen“ fehlt")
        pruefe(page.locator("[data-feedback-teilen-link]").get_attribute("href") == "https://mythosmathe.de/feedback", f"{tag}: Direct Link falsch")
        wa = page.locator("[data-feedback-teilen-wa]").get_attribute("href") or ""
        pruefe(wa.startswith("https://wa.me/?text=") and "mythosmathe.de%2Ffeedback" in wa, f"{tag}: WhatsApp-Link ohne Direct Link")
        ctx.grant_permissions(["clipboard-read", "clipboard-write"])
        page.locator("[data-feedback-teilen-kopieren]").click(); page.wait_for_timeout(300)
        pruefe("kopiert" in (t.inner_text() or ""), f"{tag}: Link kopieren meldet nichts")
        kb = page.evaluate("""() => { const r = document.querySelector('[data-feedback-teilen]').getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth + 1; }""")
        pruefe(kb, f"{tag}: Teilen-Block ragt über den Rand")
        t.scroll_into_view_if_needed(); foto(page, f"teilen-{breite}")
        page.evaluate("window.scrollTo(0,0)"); page.wait_for_timeout(300)  # sprung-frei: Test
        foto(page, f"ganz-{breite}", voll=True)
        pruefe(not konsole, f"{tag}: Konsole {konsole}")
        ctx.close()

    # Unten auf jeder Seite: Link zur Feedback-Seite neben dem Feedback-Knopf
    for breite in (320, 360, 390, 1280):
        for pfad in ("impressum", "ableitungstrainer"):
            ctx, page, konsole = oeffnen(b, breite, pfad)
            page.locator(".fb-knopf").scroll_into_view_if_needed(); page.wait_for_timeout(300)
            f = page.locator(".fb-knopf").bounding_box(); s = page.locator("[data-feedback-seite-fuss]").bounding_box()
            tag = f"{pfad}@{breite}"
            pruefe(page.locator("[data-feedback-seite-fuss]").get_attribute("href") == "/feedback", f"{tag}: Link zeigt nicht auf /feedback")
            pruefe(f["x"] >= 0 and s["x"] >= 0 and f["x"] + f["width"] <= breite and s["x"] + s["width"] <= breite, f"{tag}: ragt aus dem Bildschirm")
            pruefe(abs(f["height"] - s["height"]) <= 1, f"{tag}: Knopf und Link verschieden hoch")
            # Text bleibt einzeilig und im Knopf
            for sel in (".fb-knopf", "[data-feedback-seite-fuss]"):
                luft = page.evaluate("""(sel) => { const e = document.querySelector(sel), b = e.getBoundingClientRect(), r = document.createRange(); r.selectNodeContents(e);
                  const c = r.getBoundingClientRect(); return [Math.min(c.left - b.left, b.right - c.right), c.height]; }""", sel)
                pruefe(luft[0] >= 6 and luft[1] <= 24, f"{tag}: {sel} Text zu eng oder umgebrochen ({luft})")
            if pfad == "ableitungstrainer":
                t = page.locator(".tl-knopf").bounding_box()
                pruefe(s["y"] >= f["y"] + f["height"] - 1, f"{tag}: Feedback-Seite gehört unter Teilen | Feedback")
                pruefe(abs(s["x"] - t["x"]) <= 1 and abs((s["x"] + s["width"]) - (f["x"] + f["width"])) <= 1, f"{tag}: Feedback-Seite nicht so breit wie das Paar")
                page.click(".tl-knopf"); page.wait_for_timeout(250)
                pn = page.locator(".tl-panel").bounding_box(); s2 = page.locator("[data-feedback-seite-fuss]").bounding_box()
                pruefe(pn["y"] >= f["y"] + f["height"] - 1 and s2["y"] >= pn["y"] + pn["height"] - 1, f"{tag}: Teilen-Panel nicht zwischen Paar und Feedback-Seite")
            elif breite >= 350:
                pruefe(abs(f["y"] - s["y"]) <= 1 and f["x"] + f["width"] <= s["x"] + 1, f"{tag}: Link steht nicht rechts neben dem Knopf")
                pruefe(abs((f["x"] + s["x"] + s["width"]) / 2 - breite / 2) <= 2, f"{tag}: Paar nicht mittig")
            else:
                pruefe(s["y"] >= f["y"] + f["height"] - 1, f"{tag}: unter 350 px gehört der Link unter den Knopf")
            foto(page, f"fuss-{pfad}-{breite}")
            if breite == 390 and pfad == "impressum":
                page.locator("[data-feedback-seite-fuss]").click(); page.wait_for_timeout(2000)
                pruefe(page.url.endswith("/feedback") and page.locator("[data-feedback-seite-wurzel]").count() == 1, f"{tag}: Link öffnet die Feedback-Seite nicht ({page.url})")
                pruefe(page.locator("[data-feedback-seite-fuss]").count() == 0, f"{tag}: auf der Feedback-Seite selbst kein Link")
            pruefe(not konsole, f"{tag}: Konsole {konsole}")
            ctx.close()

    # Dunkle Seite (Vision): Link in derselben hellen Schrift wie der Knopf
    ctx, page, konsole = oeffnen(b, 390, "vision")
    farben = page.evaluate("[getComputedStyle(document.querySelector('.fb-knopf')).color, getComputedStyle(document.querySelector('.fb-seite')).color]")
    pruefe(farben[0] == farben[1] == "rgb(238, 242, 255)", f"Vision: Link nicht in der dunklen Optik ({farben})")
    ctx.close()

    # Gast ohne Passwort (middleware.js setzt mm_gast=1 auf /feedback und den Rechtsseiten): neue Besucherin, leerer Speicher
    ctx = b.new_context(viewport={"width": 390, "height": 860}, locale="de-DE")
    ctx.add_cookies([{"name": "mm_gast", "value": "1", "url": BASE}])
    page = ctx.new_page(); konsole = []
    page.on("pageerror", lambda e: konsole.append(f"pageerror: {e}"))
    page.goto(BASE + "feedback"); page.wait_for_timeout(3500)
    pruefe(page.url.endswith("/feedback") and page.locator("[data-feedback-seite-wurzel]").count() == 1, f"Gast: Feedback-Seite nicht geöffnet ({page.url})")
    pruefe(page.locator("[role=dialog]:visible, [aria-modal=true]:visible").count() == 0, "Gast: ein Fenster liegt über der Feedback-Seite")
    page.locator("[data-fs-frage='wunsch']").click(); page.wait_for_timeout(1200)
    page.locator("[data-fs-rolle='eltern']").click(); page.locator("[data-fs-text]").fill("Bitte mehr Übungen zu Textaufgaben, Klasse 9.")
    page.locator("[data-fs-einw]").check(); page.locator("[data-fs-senden]").click(); page.wait_for_timeout(800)
    pruefe(page.locator("[data-fs-danke]").count() == 1 or "Demo-Modus" in page.locator("[data-fs-meldung]").inner_text(), "Gast: Formular lässt sich nicht absenden")
    foto(page, "gast-formular")
    # Von einer Rechtsseite aus führt der Link in der App zur Feedback-Seite (nicht zur Passwortseite)
    page.goto(BASE + "impressum"); page.wait_for_timeout(2000)
    page.locator("[data-feedback-seite-fuss]").scroll_into_view_if_needed(); page.locator("[data-feedback-seite-fuss]").click(); page.wait_for_timeout(1500)
    pruefe(page.url.endswith("/feedback") and page.locator("[data-feedback-seite-wurzel]").count() == 1, f"Gast: Link vom Impressum führt nicht zur Feedback-Seite ({page.url})")
    # Alles andere schickt Gäste über eine echte Seitenanfrage zur Startadresse (dort fragt die Middleware das Passwort ab)
    page.locator("#fb-danach").get_by_role("button", name="Weiter üben").click(); page.wait_for_timeout(1500)
    pruefe(page.url.rstrip("/") == BASE.rstrip("/"), f"Gast: „Weiter üben“ sollte zur Startadresse führen ({page.url})")
    pruefe(not konsole, f"Gast: Konsole {konsole}")
    ctx.close()

    # Feedback-Knopf auf einer anderen Seite: dritter Punkt führt hierher
    ctx, page, konsole = oeffnen(b, 390, "vision")
    page.locator(".fb-knopf").scroll_into_view_if_needed(); page.locator(".fb-knopf").click(); page.wait_for_timeout(400)
    link = page.locator("[data-feedback-seite-link]")
    pruefe(link.count() == 1, "Knopf-Auswahl: Punkt zur Feedback-Seite fehlt")
    foto(page, "knopf-auswahl")
    link.click(); page.wait_for_timeout(2500)
    pruefe(page.locator("[data-feedback-seite-wurzel]").count() == 1 and page.url.endswith("/feedback"), f"Knopf-Auswahl führt nicht zu /feedback ({page.url})")
    pruefe(not konsole, f"Vision → Feedback: Konsole {konsole}")
    ctx.close()
    b.close()

print("FEHLER:", len(fehler)) if fehler else print("OK – Feedback-Seite")
raise SystemExit(1 if fehler else 0)
