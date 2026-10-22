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
  - Feedback-Knopf auf einer anderen Seite (/vision): Auswahl hat den dritten Punkt zur Feedback-Seite
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
        page.evaluate("window.scrollTo(0,0)"); page.wait_for_timeout(300)  # sprung-frei: Test
        foto(page, f"ganz-{breite}", voll=True)
        pruefe(not konsole, f"{tag}: Konsole {konsole}")
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
