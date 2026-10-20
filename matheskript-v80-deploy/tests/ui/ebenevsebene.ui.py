"""Browser-Test „Ebene vs. Ebene“: Desktop-Arbeitsfläche (zwei Spalten) und Handy-Ansicht.
Prüft Regler, Beispiele, Sonderfälle (parallel, keine Ebene, große Beträge), Überbreite und Schriftgröße im Schaubild.
Siehe README.md."""
import os, sys
from playwright.sync_api import sync_playwright

URL = os.environ.get("BASE_URL", "http://localhost:4173/").rstrip("/") + "/ebene-vs-ebene"
AUS = os.environ.get("SCREENSHOTS")   # optional: Ordner für Bildschirmfotos
fehler = []
bekannt = lambda t: "ERR_TUNNEL" in t or "net::ERR" in t or "Failed to load resource" in t


def pruefe(bed, text):
    if not bed:
        fehler.append(text)


def seite(b, w, h):
    kw = dict(viewport={"width": w, "height": h})
    if w < 600:
        kw.update(has_touch=True, is_mobile=True, device_scale_factor=2)
    ctx = b.new_context(**kw)
    p = ctx.new_page()
    p.on("pageerror", lambda e: fehler.append(f"{w}: pageerror: {e}"))
    p.on("console", lambda m: fehler.append(f"{w}: console: {m.text}") if m.type == "error" and not bekannt(m.text) else None)
    p.goto(URL)
    p.wait_for_timeout(2200)
    for t in ["Verstanden", "Schließen", "OK", "Später"]:
        try:
            k = p.get_by_role("button", name=t, exact=True)
            if k.count():
                k.first.click(timeout=500)
        except Exception:
            pass
    return ctx, p


def ueberbreite(p, n):
    u = p.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")
    pruefe(u <= 1, f"{n}: horizontaler Überlauf {u}px")


def klick(p, name, mal=1):
    for _ in range(mal):
        p.get_by_role("button", name=name, exact=True).click()


with sync_playwright() as pw:
    b = pw.chromium.launch()
    for (w, h) in [(1440, 900), (1100, 760), (860, 760), (390, 844), (360, 740)]:
        n = f"{w}"
        ctx, p = seite(b, w, h)
        desktop = w >= 840
        pruefe(p.locator("[data-eve=breit]").count() == (1 if desktop else 0), f"{n}: falsches Layout (Desktop erwartet: {desktop})")
        ueberbreite(p, n)

        # Schaubild in echten Pixeln: viewBox-Breite = dargestellte Breite
        vb, bw = p.evaluate("""() => { const s = [...document.querySelectorAll('svg')].find((x) => x.style.touchAction === 'none');
          return [s.viewBox.baseVal.width, Math.round(s.getBoundingClientRect().width)]; }""")
        pruefe(abs(vb - bw) <= 1, f"{n}: Schaubild skaliert ({vb} statt {bw})")

        if desktop:
            # Spalten nebeneinander: Schaubild rechts neben der E₁-Karte
            l = p.locator("[data-eve-karte='₁']").bounding_box()
            r = p.locator("svg[style*='touch-action']").bounding_box()
            pruefe(r["x"] > l["x"] + l["width"], f"{n}: Schaubild steht nicht rechts")
            pruefe(abs(r["y"] - l["y"]) < 4, f"{n}: Schaubild und E₁-Karte oben nicht bündig")

        # Regler
        klick(p, "a von E₁ erhöhen")
        pruefe(p.get_by_text("4x₁ + 2x₂ + x₃ = 6").count() >= 1, f"{n}: Regler a ändert E₁ nicht")
        klick(p, "a von E₁ verringern")

        # Beispiele: parallel → keine Schnittgerade
        p.get_by_role("button", name="Parallel", exact=True).click()
        p.wait_for_timeout(150)
        pruefe(p.get_by_text("echt parallel").count() == 1, f"{n}: Parallel nicht erkannt")
        pruefe(p.get_by_text("Schnittgerade", exact=True).count() == 0, f"{n}: Schnittgerade trotz Parallelität")
        ueberbreite(p, n + " parallel")

        # Große Beträge: E₂ = −10x₁ − 10x₂ − 10x₃ = −10
        p.get_by_role("button", name="Schneiden sich", exact=True).click()
        for bu, start in [("a", 1), ("b", -1), ("c", 2), ("d", 2)]:
            klick(p, f"{bu} von E₂ verringern", start + 10)
        p.wait_for_timeout(150)
        ueberbreite(p, n + " große Beträge")
        pruefe(p.get_by_text("Die Ebenen schneiden sich in einer Geraden g.").count() == 1, f"{n}: Schnitt bei großen Beträgen fehlt")
        if AUS:
            p.screenshot(path=f"{AUS}/eve-{w}-gross.png", full_page=True)

        # Keine Ebene (a = b = c = 0 bei E₁) → Schnittwinkel verschwindet
        p.get_by_role("button", name="Schneiden sich", exact=True).click()
        klick(p, "a von E₁ verringern", 3)
        klick(p, "b von E₁ verringern", 2)
        klick(p, "c von E₁ verringern", 1)
        p.wait_for_timeout(150)
        pruefe(p.get_by_text("keine Ebene").count() == 1, f"{n}: Hinweis „keine Ebene“ fehlt")
        pruefe(p.get_by_text("Schnittwinkel", exact=True).count() == 0, f"{n}: Schnittwinkel trotz fehlender Ebene")
        ueberbreite(p, n + " keine Ebene")

        # Grundebene einblenden
        p.get_by_role("button", name="x₁-x₂-Ebene", exact=True).click()
        pruefe(p.get_by_role("button", name="x₁-x₂-Ebene", exact=True).get_attribute("aria-pressed") == "true", f"{n}: Grundebene schaltet nicht")
        ctx.close()
    b.close()

if fehler:
    print("FEHLER:")
    for f in fehler:
        print(" -", f)
    sys.exit(1)
print("ebenevsebene.ui.py: alles grün")
