"""Browser-Test: GFS-Themenseite „Platonische Körper“ (/gfs-trainer/platonische-koerper).
Prüft bei 360, 390 und 1280 px: Kurs-Liste (Klasse 9 → Platonische Körper), Kopfbild, fünf Animationen
(eine wird bedient), Körper-Labor (Körper wählen, Drahtmodell, Dualkörper, Ziehen dreht, Euler-Tabelle,
Würfelnetz falten), Übungen (Winkel erst falsch mit gezielter Rückmeldung, dann richtig; Euler; Würfelnetz
mit den Werten aus window.__gpAufgabe), Lückenbeweis „Mit Winkeln“, Kolloquium – ohne Überbreite
und ohne Konsolenfehler.
  npm run build && npx vite preview --port 4173 &   →   python3 tests/ui/gfsplatonisch.ui.py
  DIREKT=1 öffnet BASE_URL + PFAD direkt (ohne den Weg über die Kursliste).
"""
import os, re
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
PFAD = os.environ.get("PFAD", "gfs-trainer/platonische-koerper")
DIREKT = os.environ.get("DIREKT")
AUS = os.environ.get("SCREENS", "/tmp/gfsplatonisch")
os.makedirs(AUS, exist_ok=True)
fehler = []
def pruefe(bed, text):
    if not bed: fehler.append(text); print("FEHLT:", text)
def dk(x, n=2):
    s = f"{round(x, n):.{n}f}".rstrip("0").rstrip(".")
    return s.replace(".", ",")

with sync_playwright() as p:
    b = p.chromium.launch()
    for breite in (360, 390, 1280):
        ctx = b.new_context(viewport={"width": breite, "height": 900}, device_scale_factor=2, locale="de-DE")
        page = ctx.new_page()
        konsole = []
        page.on("pageerror", lambda e: konsole.append(f"pageerror: {e}"))
        page.on("console", lambda m: konsole.append(m.text) if m.type == "error" and "net::" not in m.text and "Failed to load resource" not in m.text else None)
        def breite_ok(wo):
            sw = page.evaluate("document.documentElement.scrollWidth"); pruefe(sw <= breite, f"{breite}: Überbreite bei {wo}: {sw}")

        if DIREKT:
            page.goto(BASE + PFAD); page.wait_for_timeout(1500)
        else:
            # Kurs: Klasse 9 zeigt das Thema, Klick öffnet die Seite
            page.goto(BASE + "gfs-trainer"); page.wait_for_timeout(1000)
            page.locator(".gfs-stufe-knopf").click(); page.wait_for_timeout(150)
            page.get_by_role("option", name="Klasse 9").click(); page.wait_for_timeout(250)
            thema = page.locator(".gfs-thema-fertig", has_text="Platonische Körper")
            pruefe(thema.count() == 1, f"{breite}: Thema fehlt in Klasse 9")
            thema.click(); page.wait_for_timeout(1200)
            pruefe("platonische-koerper" in page.url, f"{breite}: Themenseite nicht geöffnet ({page.url})")
        pruefe(page.get_by_text("Warum gibt es genau fünf regelmäßige Körper").count() >= 1, f"{breite}: Leitfrage fehlt")
        pruefe(page.locator(".gtk-bild").count() == 1, f"{breite}: Kopfbild fehlt")
        breite_ok("Seite")
        page.screenshot(path=f"{AUS}/{breite}-kopf.png")

        # Fünf Animationen, die erste ist offen; die zweite (Ecke) aufklappen und zu Schritt 3 springen
        anims = page.locator("[data-platon-anim]")
        pruefe(anims.count() == 5, f"{breite}: {anims.count()} statt 5 Animationen")
        pruefe(anims.first.locator("input[type=range]").count() == 1, f"{breite}: erste Animation nicht geöffnet")
        ecke = page.locator("[data-platon-anim=ecke]")
        ecke.locator("button").first.click(); page.wait_for_timeout(300)
        ecke.get_by_label("Schritt 3 abspielen").click(); page.wait_for_timeout(400)
        pruefe(ecke.get_by_text("Schritt 3 von").count() == 1, f"{breite}: Schrittwechsel in der Ecken-Animation fehlt")
        leiste = ecke.locator("input[type=range]"); leiste.fill(leiste.get_attribute("max")); page.wait_for_timeout(200)   # ans Ende (Dauer hängt von der Lesezeit ab)
        pruefe(ecke.get_by_text("Nur diese fünf Ecken gehen").count() == 1, f"{breite}: Schlussbild der Ecken-Animation fehlt")
        breite_ok("Animationen")
        ecke.scroll_into_view_if_needed(); page.screenshot(path=f"{AUS}/{breite}-animation.png")

        # Körper-Labor
        lab = page.locator("[data-platon-labor]")
        lab.get_by_role("button", name="Ikosaeder", exact=True).click(); page.wait_for_timeout(100)
        lab.get_by_role("button", name="Drahtmodell").click(); page.wait_for_timeout(100)
        lab.get_by_role("button", name="Dualkörper").click(); page.wait_for_timeout(100)
        svg = lab.locator("svg[data-labor-koerper]")
        pruefe(svg.get_attribute("data-labor-koerper") == "ikosaeder" and svg.get_attribute("data-modus") == "draht", f"{breite}: Labor zeigt nicht Ikosaeder/Drahtmodell")
        pruefe(lab.get_by_text("ein Dodekaeder").count() >= 1, f"{breite}: Dualkörper-Hinweis fehlt")
        anhalten = lab.get_by_role("button", name="Drehen anhalten")
        if anhalten.count(): anhalten.click(); page.wait_for_timeout(100)
        svg.scroll_into_view_if_needed()
        vor = svg.get_attribute("data-drehung")
        bx = svg.bounding_box()
        page.mouse.move(bx["x"] + bx["width"] * 0.3, bx["y"] + bx["height"] * 0.4); page.mouse.down()
        page.mouse.move(bx["x"] + bx["width"] * 0.6, bx["y"] + bx["height"] * 0.55, steps=8); page.mouse.up(); page.wait_for_timeout(150)
        pruefe(svg.get_attribute("data-drehung") != vor, f"{breite}: Ziehen dreht den Körper nicht")
        zeilen = lab.locator("[data-euler-tabelle] tbody tr")
        pruefe(zeilen.count() == 5, f"{breite}: Tabelle hat {zeilen.count()} statt 5 Zeilen")
        pruefe(all(zeilen.nth(i).locator("td").last.inner_text().strip() == "2" for i in range(zeilen.count())), f"{breite}: e − k + f ist nicht überall 2")
        lab.get_by_role("button", name="Würfel", exact=True).click(); page.wait_for_timeout(100)
        lab.get_by_role("button", name="Netz ausklappen").click(); page.wait_for_timeout(200)
        lab.get_by_role("button", name="Treppe").click(); page.wait_for_timeout(150)
        lab.get_by_label("Faltung").fill("1"); page.wait_for_timeout(200)
        pruefe(lab.locator("svg[data-netz]").get_attribute("data-netz") == "1.00", f"{breite}: Netz lässt sich nicht falten")
        pruefe(lab.get_by_text("gefaltet", exact=True).count() == 1, f"{breite}: Faltstand fehlt")
        breite_ok("Labor")
        lab.scroll_into_view_if_needed(); page.screenshot(path=f"{AUS}/{breite}-labor.png")
        lab.get_by_role("button", name="Zurück zum Körper").click(); page.wait_for_timeout(100)

        # Übungen: Winkel erst falsch (Winkelsumme des ganzen Vielecks), dann richtig
        karte = page.locator("[data-platontrainer]")
        a = page.evaluate("window.__gpAufgabe")
        pruefe(a["art"] == "winkel", f"{breite}: Übung startet nicht mit dem Winkeltyp")
        karte.get_by_label("α", exact=True).fill(str((a["p"] - 2) * 180)); karte.get_by_label("Summe", exact=True).fill("999")
        karte.get_by_role("button", name="Ecke möglich").click(); karte.get_by_role("button", name="Prüfen").click(); page.wait_for_timeout(200)
        pruefe(karte.get_by_text("Stimmt noch nicht.").count() == 1, f"{breite}: falscher Innenwinkel nicht erkannt")
        pruefe(karte.get_by_text(re.compile("Winkelsumme im ganzen")).count() == 1, f"{breite}: gezielte Rückmeldung fehlt")
        namen = {"ecke": "Ecke möglich", "flach": "liegt flach (360°)", "ueber": "geht nicht (über 360°)"}
        karte.get_by_label("α", exact=True).fill(dk(a["alpha"])); karte.get_by_label("Summe", exact=True).fill(dk(a["S"]))
        karte.get_by_role("button", name=namen[a["ergebnis"]]).click(); karte.get_by_role("button", name="Prüfen").click(); page.wait_for_timeout(200)
        pruefe(karte.get_by_text("Stimmt!").count() == 1, f"{breite}: richtige Winkelantwort nicht erkannt ({a})")
        # Euler
        page.get_by_role("button", name="Euler: die fehlende Zahl").click(); page.wait_for_timeout(200)
        a = page.evaluate("window.__gpAufgabe")
        karte.get_by_label(a["gesucht"], exact=True).fill(str(a[a["gesucht"]])); karte.get_by_role("button", name="Prüfen").click(); page.wait_for_timeout(200)
        pruefe(karte.get_by_text("Stimmt!").count() == 1, f"{breite}: Euler-Antwort nicht erkannt")
        # Ecken und Kanten zählen
        page.get_by_role("button", name="Ecken und Kanten zählen").click(); page.wait_for_timeout(200)
        a = page.evaluate("window.__gpAufgabe")
        karte.get_by_label("k", exact=True).fill(str(a["summe"])); karte.get_by_label("e", exact=True).fill(str(a["e"]))
        karte.get_by_role("button", name="Prüfen").click(); page.wait_for_timeout(200)
        pruefe(karte.get_by_text(re.compile("teile durch 2")).count() == 1, f"{breite}: Rückmeldung Doppelzählung fehlt")
        karte.get_by_label("k", exact=True).fill(str(a["k"])); karte.get_by_role("button", name="Prüfen").click(); page.wait_for_timeout(200)
        pruefe(karte.get_by_text("Stimmt!").count() == 1, f"{breite}: Zählantwort nicht erkannt")
        # Würfelnetz
        page.get_by_role("button", name="Würfelnetz oder nicht?").click(); page.wait_for_timeout(200)
        a = page.evaluate("window.__gpAufgabe")
        karte.get_by_role("button", name="Ja, ein Würfelnetz" if a["istNetz"] else "Nein, kein Würfelnetz").click()
        karte.get_by_role("button", name="Prüfen").click(); page.wait_for_timeout(250)
        pruefe(karte.get_by_text("Stimmt!").count() == 1, f"{breite}: Netzantwort nicht erkannt")
        karte.get_by_label("Netz falten").fill("1"); page.wait_for_timeout(150)
        pruefe(karte.locator("svg[data-netz]").get_attribute("data-netz") == "1.00", f"{breite}: Netz in der Übung lässt sich nicht falten")
        breite_ok("Übungen")
        karte.scroll_into_view_if_needed(); page.screenshot(path=f"{AUS}/{breite}-uebung.png")

        # Lückenbeweis „Mit Winkeln“: in jedem Schritt die richtige Antwort suchen
        bew = page.locator("[data-begruenden]")
        for i in range(7):
            block = bew.locator(".auftauchen").nth(i)
            kn = block.locator("button")
            for j in range(kn.count()):
                kn.nth(j).click(); page.wait_for_timeout(100)
                if not block.get_by_text("Noch nicht").count(): break
        pruefe(page.get_by_text("Beweis vollständig.").count() == 1, f"{breite}: Lückenbeweis nicht abgeschlossen")

        # Kolloquium
        page.get_by_role("button", name="Antwort aufdecken").click(); page.wait_for_timeout(150)
        page.get_by_role("button", name="Konnte ich").click(); page.wait_for_timeout(150)
        pruefe(page.get_by_text(re.compile(r"^1 von \d+ sitzen$")).count() == 1, f"{breite}: Kolloquium zählt nicht")
        breite_ok("Ende")
        page.screenshot(path=f"{AUS}/{breite}-ende.png")
        pruefe(not konsole, f"{breite}: Konsolenfehler {konsole[:3]}")
        ctx.close()
    b.close()

print("OK" if not fehler else f"{len(fehler)} Fehler")
raise SystemExit(1 if fehler else 0)
