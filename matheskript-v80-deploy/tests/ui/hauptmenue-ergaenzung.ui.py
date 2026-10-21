"""Browser-Test Ergänzungen zum ☰-Menü:
- schlanke Kopfleiste (Ableitungstrainer): ☰ öffnet dasselbe Hauptmenü
- Werkzeugseiten haben nur noch EIN ☰ (das alte „Menü mit allen Bereichen“ ist weg)
- Arbeitsmenü (Fußzeile) enthält „Alle Bereiche“ mit dem alten Bereichsbaum
- Konto: „Meine Kinder“ / „Meine Klassen“ / „Mein Plan“ springen zum Abschnitt der Kontoseite
- Englisch: Menütexte sind übersetzt
  npx vite build && npx vite preview --port 4173 &   →   python3 tests/ui/hauptmenue-ergaenzung.ui.py
"""
import os, re, json
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
fehler = []

# Angebots-Schalter (src/angebot.js): „Pro werden“, Kurse, Landingpage sind im Moment ggf. abgeschaltet
_a = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "src", "angebot.js"), encoding="utf-8").read().split("export const ANGEBOT")[1].split("};")[0]
ANG = {k: v == "true" for k, v in re.findall(r"^\s+(\w+): (true|false),", _a, re.M)}
def pruefe(bed, text):
    if not bed:
        fehler.append(text); print("FEHLT:", text)

def demo(rolle):
    return {"nutzer": {"id": "demo-1", "email": "lena@example.de"},
            "profil": {"id": "demo-1", "name": "Lena", "rolle": rolle, "geschlecht": "w", "schulform": "G9", "klasse": 10}}

def neu(b, breite, rolle=None, en=False):
    ctx = b.new_context(viewport={"width": breite, "height": 820}, locale="en-US" if en else "de-DE")
    page = ctx.new_page()
    konsole = []
    page.on("pageerror", lambda e: konsole.append(f"pageerror: {e}"))
    page.goto(BASE)
    page.evaluate("localStorage.clear(); localStorage.setItem('mm-onboarding-v1', JSON.stringify({uebersprungen:true}));" + ("localStorage.setItem('mm-sprache','en');" if en else ""))
    if rolle:
        page.evaluate(f"localStorage.setItem('mm-demo-konto', {json.dumps(json.dumps(demo(rolle)))})")
    return ctx, page, konsole

with sync_playwright() as p:
    b = p.chromium.launch()
    for breite in (390, 1280):
        # 1) Trainingswerkzeuge: Kopfleiste (☰) + dünnes Werkzeug-Band
        ctx, page, konsole = neu(b, breite, "schueler")
        for pfad in ("ableitungstrainer", "geradengleichung", "parabeln", "stammintegral"):
            page.goto(BASE + pfad); page.wait_for_timeout(1500)
            tag = f"{breite}/{pfad}"
            pruefe(page.locator("[data-werkzeug-band]").count() == 1, f"{tag}: Werkzeug-Band fehlt")
            k = page.locator("[data-kopfleiste] [data-hm-menue]")
            pruefe(k.count() == 1, f"{tag}: ☰ in der Kopfleiste fehlt")
            if k.count():
                k.click(); page.wait_for_timeout(300)
                if breite >= 900:
                    # Desktop: das Menü über den ganzen Bildschirm (funcHauptmenueDesktop.jsx)
                    dm = page.locator("[data-hm-desktop]")
                    pruefe(dm.count() == 1, f"{tag}: Desktop-Menü geht nicht auf")
                    if dm.count():
                        dm.locator("[data-hmd-training='warmup']").click(); page.wait_for_timeout(900)
                        pruefe("5-minuten-mathe" in page.url, f"{tag}: Menüpunkt navigiert nicht ({page.url})")
                    continue
                fm = page.locator(".hm-fenster.hm-menue")
                pruefe(fm.count() == 1, f"{tag}: Hauptmenü geht nicht auf")
                if fm.count():
                    bx = fm.bounding_box()
                    pruefe(bx["x"] >= 0 and bx["x"] + bx["width"] <= breite + 1 and bx["y"] >= 0, f"{tag}: Menü ragt hinaus ({bx})")
                    pruefe(fm.locator("[data-hm]").count() == 6, f"{tag}: {fm.locator('[data-hm]').count()} Abschnitte statt 6")
                    fm.locator("[data-hm='training']").click(); page.wait_for_timeout(200)
                    page.locator(".hm-fenster button", has_text="5 Minuten Mathe").click(); page.wait_for_timeout(900)
                    pruefe("5-minuten-mathe" in page.url, f"{tag}: Menüpunkt navigiert nicht ({page.url})")
        # 2) Werkzeugseite mit großem Kopf: nur ein ☰
        for pfad in ("formelsammlung", "kopfrechnen", "gleichungen-lernen"):
            page.goto(BASE + pfad); page.wait_for_timeout(1500)
            pruefe(page.locator("[data-hm-menue]").count() == 1, f"{breite}/{pfad}: mehr oder weniger als ein ☰")
            pruefe(page.locator(".tool-menue-knopf").count() == 0, f"{breite}/{pfad}: altes ☰ ist noch da")
        # 3) Arbeitsmenü: Alle Bereiche
        page.goto(BASE); page.wait_for_timeout(1200)
        am = page.locator("[data-arbeitsmenue]"); am.scroll_into_view_if_needed(); am.click(); page.wait_for_timeout(250)
        bereiche = page.locator("[data-arbeitsmenue-bereiche]")
        pruefe(bereiche.count() == 1, f"{breite}: „Alle Bereiche“ fehlt im Arbeitsmenü")
        if bereiche.count():
            pruefe(page.locator("[data-arbeitsmenue-bereiche] + div").count() == 0, f"{breite}: Alle Bereiche ist schon aufgeklappt")
            bereiche.click(); page.wait_for_timeout(300)
            baum = page.locator("[data-sprung='menue-alle-bereiche'] button[aria-expanded]")
            pruefe(baum.count() >= 3, f"{breite}: Bereichsbaum zeigt nur {baum.count()} Bereiche")
            if baum.count():
                baum.first.click(); page.wait_for_timeout(250)
                pruefe(page.locator("[data-sprung='menue-alle-bereiche'] [data-aufklapp-inhalt] button").count() >= 1, f"{breite}: Bereich klappt nicht auf")
                page.locator("[data-sprung='menue-alle-bereiche'] [data-aufklapp-inhalt] button").first.click(); page.wait_for_timeout(900)
                pruefe(page.locator("[role='dialog'][aria-label='Arbeitsmenü']").count() == 0, f"{breite}: Arbeitsmenü schließt nach der Wahl nicht")
        pruefe(not konsole, f"{breite}: Konsolenfehler {konsole}")
        ctx.close()

        # 4) Konto-Sprünge je Rolle
        for rolle, eintrag, anker in (("eltern", "Meine Kinder", "konto-kinder"), ("lehrkraft", "Meine Klassen", "konto-lehr"),
                                      ("nachhilfe", "Meine Schüler", "konto-lehr")) + ((("schueler", "Pro werden", "konto-plan"),) if ANG.get("pro") else ()):
            ctx, page, konsole = neu(b, breite, rolle)
            page.goto(BASE); page.wait_for_timeout(1500)
            page.locator("[data-hm-menue]").click(); page.wait_for_timeout(250)
            page.locator("[data-hm-konto] .hm-pille, [data-hm-konto] .hmd-chip", has_text=eintrag).first.click(); page.wait_for_timeout(2200)
            tag = f"{breite}/{rolle}"
            pruefe("/konto" in page.url, f"{tag}: {eintrag} führt nicht zur Kontoseite ({page.url})")
            oben = page.evaluate(f"(() => {{ const e = document.getElementById('{anker}'); return e ? Math.round(e.getBoundingClientRect().top) : null; }})()")
            pruefe(oben is not None, f"{tag}: Anker {anker} fehlt auf der Kontoseite")
            if oben is not None:
                pruefe(-5 <= oben <= 260, f"{tag}: {anker} liegt bei y={oben}, Seite ist nicht dorthin gesprungen")
            pruefe(not konsole, f"{tag}: Konsolenfehler {konsole}")
            ctx.close()

    # 5) Englisch
    ctx, page, konsole = neu(b, 390, "schueler", en=True)
    page.goto(BASE); page.wait_for_timeout(1800)
    page.locator("[data-hm-menue]").click(); page.wait_for_timeout(300)
    text = page.locator(".hm-fenster.hm-menue").inner_text()
    low = text.lower()   # Überschriften sind per CSS in Großbuchstaben
    # Menütexte wie in src/i18n/en.json (Punkt 6, 21.10.): „Mein Mathe-Training“ → „My math training“, Darstellung → Appearance
    for wort in ("My courses", "Math training", "My math training", "Daily plan, topics, reviews", "Discover math", "Formula collection", "My account", "Sign out", "Scan sheet",
                 "Appearance", "Dark", "Light", "Grade 10"):
        pruefe(wort.lower() in low, f"en: „{wort}“ fehlt im Menü")
    for de in ("Meine Kurse", "Mathe-Training", "Mein Mathe-Training", "Konto", "Abmelden", "Blatt scannen", "Darstellung", "Dunkel", "Hell", "Klasse 10", "Meine Klasse"):
        pruefe(de.lower() not in low, f"en: „{de}“ ist noch deutsch")
    page.locator("[data-hm='klasse']").click(); page.wait_for_timeout(300)
    t2 = page.locator(".hm-fenster.hm-menue").inner_text().lower()
    pruefe("your textbook" in t2 and "our course for it" in t2, "en: Klassen-Abschnitt nicht übersetzt")
    page.locator("[data-hm-kurse-alle]").click(); page.wait_for_timeout(300)
    t3 = page.locator(".hm-fenster.hm-menue").inner_text().lower()
    pruefe("bald" not in t3 and ("soon" in t3 or not ANG.get("kurse")), "en: „Bald“ nicht übersetzt")
    page.locator("[data-hm-zugang]").click(); page.wait_for_timeout(400)
    pruefe("Really sign out?" in page.locator("[role='alertdialog']").inner_text(), "en: Abmelde-Frage nicht übersetzt")
    pruefe(not konsole, f"en: Konsolenfehler {konsole}")
    ctx.close()
    b.close()
print(f"FEHLER: {len(fehler)}") if fehler else print("Alles grün.")
