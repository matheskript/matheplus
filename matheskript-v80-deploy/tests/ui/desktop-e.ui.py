"""Browser-Test Desktop-Stil der Geometrie-Werkzeuge (Gruppe E):
Koordinaten, Flächen, Quader, Winkelsätze, Konstruktion, Kongruenz, Thales, Pythagoras, Kathetensatz,
Kreis, Körper, Strahlensätze, Trigonometrie.
Prüft am Desktop (1440, 1100, 860): Arbeitsfläche zweispaltig (Bild rechts, oben bündig), Regler (+ oben, − unten),
alle Auswahl-Chips, Üben mit allen Aufgabentypen und „Neue Aufgabe“, keine Überbreite, keine Fehler,
keine übergroßen SVG-Beschriftungen. Am Handy (390, 360): einspaltig, kein Desktop-Baustein, keine Überbreite.
Aufruf: BASE_URL=http://localhost:4173/ python3 tests/ui/desktop-e.ui.py   (siehe README.md)"""
import os, sys
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/").rstrip("/")
SEITEN = ["koordinaten", "flaechen", "quader", "winkelsaetze", "konstruktion", "kongruenz", "thales",
          "pythagoras", "kathetensatz", "kreis", "koerper", "strahlensaetze", "trigonometrie"]
fehler = []
bekannt = lambda t: "net::" in t or "Failed to load resource" in t


def pruefe(bed, text):
    if not bed:
        fehler.append(text)


def oeffnen(b, w, h, pfad):
    kw = dict(viewport={"width": w, "height": h})
    if w < 600:
        kw.update(has_touch=True, is_mobile=True, device_scale_factor=2)
    ctx = b.new_context(**kw)
    p = ctx.new_page()
    p.on("pageerror", lambda e: fehler.append(f"{w}/{pfad}: pageerror: {e}"))
    p.on("console", lambda m: fehler.append(f"{w}/{pfad}: console: {m.text}") if m.type == "error" and not bekannt(m.text) else None)
    p.goto(f"{BASE}/{pfad}")
    p.wait_for_timeout(1500)
    for t in ["Verstanden", "Schließen", "OK", "Später"]:
        try:
            k = p.get_by_role("button", name=t, exact=True)
            if k.count():
                k.first.click(timeout=500)
        except Exception:
            pass
    return ctx, p


# Bekannt, schon vor dem Desktop-Umbau (Handy-Zweig bleibt unverändert): Quader bei 360 px, Regler-Zeile 3 px zu breit.
BEKANNT = {}


def ueberbreite(p, n):
    u = p.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")
    erlaubt = max(1, BEKANNT.get("/".join(n.split(" ")[0].split("/")[:2]), 0))
    pruefe(u <= erlaubt, f"{n}: horizontaler Überlauf {u}px")


def ueben(p, pfad, n):
    if pfad == "trigonometrie":
        p.locator("[data-kapitel=dreieck]").click()
    else:
        p.get_by_role("tab", name="Trainieren").first.click()
    p.wait_for_timeout(250)
    typen = p.locator("[data-aufgabentyp]:visible button")
    pruefe(typen.count() >= 2 or pfad == "strahlensaetze", f"{n}: Aufgabentypen fehlen")   # Strahlensätze: ohne Typwahl
    for i in range(max(1, typen.count())):
        if typen.count():
            typen.nth(i).click()
            p.wait_for_timeout(80)
        for _ in range(2):
            p.locator("button:has-text('Neue Aufgabe'):visible").first.click()
            p.wait_for_timeout(80)
            ueberbreite(p, f"{n} Üben Typ {i}")
    z = p.locator("button:has-text('Lösung dieses Schritts zeigen'):visible")
    if z.count():
        z.first.click()
        p.wait_for_timeout(100)
    ueberbreite(p, f"{n} Üben Lösung")


with sync_playwright() as pw:
    b = pw.chromium.launch()
    for (w, h) in [(1440, 900), (1100, 760), (860, 760)]:
        for pfad in SEITEN:
            n = f"{w}/{pfad}"
            ctx, p = oeffnen(b, w, h, pfad)
            pruefe(p.locator("[data-geo-desktop]").count() >= 1, f"{n}: Desktop-Arbeitsfläche fehlt")
            af = p.locator("[data-arbeitsflaeche]:visible").first
            pruefe(af.count() == 1, f"{n}: keine sichtbare Arbeitsfläche")
            if af.count():
                k = af.evaluate("e => [...e.children].map(c => { const r = c.getBoundingClientRect(); return [r.x, r.y, r.width]; })")
                pruefe(k[1][0] > k[0][0] + k[0][2], f"{n}: Bild steht nicht rechts")
                pruefe(abs(k[1][1] - k[0][1]) < 2, f"{n}: Spalten oben nicht bündig")
            # Regler: + oben, − unten
            r = p.locator("[data-regler-d]").first
            if r.count():
                plus, minus = r.locator("button").nth(0), r.locator("button").nth(1)
                pruefe(plus.inner_text().strip() == "+" and plus.bounding_box()["y"] < minus.bounding_box()["y"], f"{n}: + steht nicht über −")
                wert = r.inner_text()
                if plus.is_enabled():
                    plus.click()
                else:
                    minus.click()
                p.wait_for_timeout(80)
                pruefe(r.inner_text() != wert, f"{n}: Regler-Knopf ändert nichts")
            for s in p.locator("input[type=range]:visible").all()[:6]:
                s.focus()
                p.keyboard.press("End")
                p.keyboard.press("Home")
            ueberbreite(p, n + " Regler")
            for i in range(16):
                g = p.locator("[role=group] button[aria-pressed]:visible")
                if i >= g.count():
                    break
                g.nth(i).click()
                p.wait_for_timeout(60)
                ueberbreite(p, f"{n} Auswahl {i}")
            gross = p.evaluate("() => [...document.querySelectorAll('[data-arbeitsflaeche] svg text')].filter(t => t.getBoundingClientRect().height > 24).length")
            pruefe(gross == 0, f"{n}: {gross} übergroße Beschriftungen im Bild")
            ueben(p, pfad, n)
            ctx.close()
    for (w, h) in [(390, 844), (360, 740)]:
        for pfad in SEITEN:
            n = f"{w}/{pfad}"
            ctx, p = oeffnen(b, w, h, pfad)
            pruefe(p.locator("[data-geo-desktop]").count() == 0, f"{n}: Desktop-Aufbau am Handy")
            pruefe(p.locator("[data-regler-d]").count() == 0, f"{n}: Desktop-Regler am Handy")
            ueberbreite(p, n)
            ueben(p, pfad, n)
            pruefe(p.locator("[data-ueben-zweispaltig]").count() == 0, f"{n}: Üben zweispaltig am Handy")
            ctx.close()
    b.close()

if fehler:
    print("FEHLER:")
    for f in fehler:
        print(" -", f)
    sys.exit(1)
print("desktop-e.ui.py: alles grün")
