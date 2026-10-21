"""Browser-Test Desktop-Stil, Gruppe Analysis-Graphen: Kurvendiskussion (Polynome und beliebige Funktionen),
Sinusfunktion, Funktionsscharen, Steckbriefaufgaben, Funktionen: Grundlagen.
Prüft bei 1440, 1100, 860 (Desktop) und 390, 360 (Handy): richtiges Layout (Desktop zweispaltig), keine Überbreite,
keine Fehler, Schaubilder in echten Pixeln (viewBox = dargestellte Breite) und die wichtigsten Bedienungen.
Siehe README.md."""
import os, sys
from playwright.sync_api import sync_playwright

BASIS = os.environ.get("BASE_URL", "http://localhost:4173/").rstrip("/")
AUS = os.environ.get("SCREENSHOTS")   # optional: Ordner für Bildschirmfotos
fehler = []
bekannt = lambda t: "ERR_TUNNEL" in t or "net::ERR" in t or "Failed to load resource" in t


def pruefe(bed, text):
    if not bed:
        fehler.append(text)


def seite(ctx, pfad, w):
    p = ctx.new_page()
    p.on("pageerror", lambda e: fehler.append(f"{w} {pfad}: pageerror: {e}"))
    p.on("console", lambda m: fehler.append(f"{w} {pfad}: console: {m.text}") if m.type == "error" and not bekannt(m.text) else None)
    p.goto(BASIS + pfad)
    p.wait_for_timeout(1800)
    for t in ["Verstanden", "Schließen", "OK", "Später"]:
        try:
            k = p.get_by_role("button", name=t, exact=True)
            if k.count():
                k.first.click(timeout=500)
        except Exception:
            pass
    return p


def ueberbreite(p, n):
    u = p.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")
    pruefe(u <= 1, f"{n}: horizontaler Überlauf {u}px")


def echte_pixel(p, sel, n):
    """Größtes SVG im Bereich sel: viewBox-Breite = dargestellte Breite (Beschriftungen wachsen nicht mit)."""
    r = p.evaluate("""(sel) => { const c = document.querySelector(sel); if (!c) return null;
      const s = [...c.querySelectorAll('svg')].sort((a, b) => b.getBoundingClientRect().width - a.getBoundingClientRect().width)[0];
      return s ? [s.viewBox.baseVal.width, Math.round(s.getBoundingClientRect().width)] : null; }""", sel)
    pruefe(r is not None and abs(r[0] - r[1]) <= 2, f"{n}: Schaubild nicht in echten Pixeln ({r})")


def zweispaltig(p, n):
    """Arbeitsfläche: zwei Spalten nebeneinander, oben bündig."""
    r = p.evaluate("""() => { const a = document.querySelector('[data-arbeitsflaeche]'); if (!a) return null;
      const [l, r] = [...a.children].map((c) => c.getBoundingClientRect()); return [l.x + l.width, r.x, Math.abs(l.y - r.y)]; }""")
    pruefe(r is not None and r[1] > r[0] and r[2] < 3, f"{n}: Arbeitsfläche nicht zweispaltig ({r})")


def hoehen(p, n, tol=40):
    """Linke und rechte Spalte der Arbeitsfläche enden etwa auf gleicher Höhe."""
    r = p.evaluate("""() => { const a = document.querySelector('[data-arbeitsflaeche]');
      const [l, r] = [...a.children].map((c) => c.getBoundingClientRect().bottom); return Math.round(Math.abs(l - r)); }""")
    pruefe(r <= tol, f"{n}: Spalten ungleich hoch ({r}px)")


def foto(p, name):
    if AUS:
        p.screenshot(path=f"{AUS}/{name}.png", full_page=True)


with sync_playwright() as pw:
    b = pw.chromium.launch()
    for (w, h) in [(1440, 900), (1100, 760), (860, 760), (390, 844), (360, 740)]:
        desktop = w >= 840
        kw = dict(viewport={"width": w, "height": h})
        if not desktop:
            kw.update(has_touch=True, is_mobile=True, device_scale_factor=2)
        ctx = b.new_context(**kw)

        # ---------- Sinusfunktion ----------
        n = f"{w} sinus"
        p = seite(ctx, "/sinus", w)
        pruefe(p.locator("[data-sinus=breit]").count() == (1 if desktop else 0), f"{n}: falsches Layout")
        ueberbreite(p, n)
        if desktop:
            zweispaltig(p, n)
            hoehen(p, n)
            echte_pixel(p, "[data-sinus=breit] [data-arbeitsflaeche]", n)
        p.get_by_role("button", name="a erhöhen", exact=True).click()
        pruefe(p.get_by_text("f(x) = 1,5 · sin(x)").count() >= 1, f"{n}: Regler a wirkt nicht")
        p.get_by_role("button", name="c als Vielfaches von π", exact=True).click()
        p.get_by_role("button", name="c erhöhen", exact=True).click()
        p.get_by_role("button", name="Lösung zeigen", exact=True).click()
        pruefe(p.get_by_text("Eine mögliche Lösung").count() == 1, f"{n}: Lösung zeigen wirkt nicht")
        p.get_by_role("button", name="🎲 Neue Aufgabe", exact=True).click()
        p.get_by_role("button", name="Frei erkunden", exact=True).click()
        pruefe(p.get_by_role("button", name="🎲 Neue Aufgabe", exact=True).count() == 0, f"{n}: Modus-Wechsel wirkt nicht")
        ueberbreite(p, n + " frei")
        foto(p, f"sinus-{w}")
        p.close()

        # ---------- Kurvendiskussion (Polynome und beliebige Funktionen) ----------
        # Desktop-Layout stammt aus der Kurvendiskussions-Überarbeitung (func3/func12, „links/rechts“) –
        # hier nur Fehlerfreiheit und Überbreite prüfen.
        for pfad in ["/kurvendiskussion", "/kurvendiskussion/beliebig"]:
            n = f"{w} {pfad}"
            p = seite(ctx, pfad, w)
            ueberbreite(p, n)
            foto(p, f"{pfad.strip('/').replace('/', '-')}-{w}")
            p.close()

        # ---------- Funktionsscharen ----------
        n = f"{w} scharen"
        p = seite(ctx, "/scharen", w)
        pruefe(p.locator("[data-scharen=breit]").count() == (1 if desktop else 0), f"{n}: falsches Layout")
        ueberbreite(p, n)
        if desktop:
            zweispaltig(p, n)
            hoehen(p, n)
            echte_pixel(p, "[data-scharen=breit] [data-arbeitsflaeche]", n)
        p.locator("input[type=range][aria-label='Parameter a']").first.fill("-2")
        pruefe(p.get_by_text("Für a = −2").count() >= 1, f"{n}: Regler a wirkt nicht")
        p.get_by_role("button", name="ax² − 4x", exact=True).first.click()
        pruefe(p.get_by_text("fₐ(x) = ").count() >= 1, f"{n}: Scharwahl wirkt nicht")
        p.get_by_role("tab", name="Besondere Punkte").click()
        ueberbreite(p, n + " Punkte")
        p.get_by_role("tab", name="Parameter­fälle").click()
        p.get_by_role("button", name="Neue Aufgabe", exact=True).last.click()
        ueberbreite(p, n + " Fälle")
        foto(p, f"scharen-{w}")
        p.close()

        # ---------- Steckbriefaufgaben ----------
        n = f"{w} steckbrief"
        p = seite(ctx, "/steckbrief", w)
        pruefe(p.locator("[data-steckbrief=breit]").count() == (1 if desktop else 0), f"{n}: falsches Layout")
        ueberbreite(p, n)
        if desktop:
            r = p.evaluate("""() => { const a = document.querySelector('[data-ueben-zweispaltig]'); const [l, r] = [...a.children].map((c) => c.getBoundingClientRect());
              return [l.x + l.width, r.x]; }""")
            pruefe(r[1] > r[0], f"{n}: Steckbrief steht nicht rechts")
        for t in p.locator("button.sb-taste").all()[:5]:
            t.click()
            p.wait_for_timeout(120)
            if p.get_by_text("Bedingungen aufdecken").count():
                break
        pruefe(p.get_by_text("Bedingungen aufdecken").count() == 1, f"{n}: Ansatz nicht wählbar")
        p.get_by_text("Bedingungen aufdecken").click()
        p.get_by_role("button", name="Bedingungen prüfen").click()
        p.wait_for_timeout(300)
        pruefe(p.get_by_role("button", name="Ausmultiplizieren").count() == 1, f"{n}: Bedingungen nicht angenommen")
        ueberbreite(p, n + " Schritte")
        p.get_by_role("button", name="Advanced", exact=True).click()
        p.get_by_role("button", name="Neue Aufgabe").click()
        ueberbreite(p, n + " Advanced")
        foto(p, f"steckbrief-{w}")
        p.close()

        # ---------- Funktionen: Grundlagen (Labore in allen Kapiteln) ----------
        n = f"{w} funktionen"
        p = seite(ctx, "/funktionen", w)
        for kid in ["begriff", "potenz", "wurzel", "umkehr", "verkettung", "dw"]:
            p.locator(f"[data-kapitel={kid}]").click()
            p.wait_for_timeout(400)
            lab = p.locator("[data-labor]").first
            pruefe(p.locator("[data-labor-breit]").count() == (1 if desktop else 0), f"{n}/{kid}: falsches Layout")
            ueberbreite(p, f"{n}/{kid}")
            r = lab.locator("input[type=range]").first
            if r.count():
                r.fill("1")
            ueberbreite(p, f"{n}/{kid} Regler")
        foto(p, f"funktionen-{w}")
        p.close()
        ctx.close()
    b.close()

if fehler:
    print("FEHLER:")
    for f in fehler:
        print(" -", f)
    sys.exit(1)
print("desktop-b.ui.py: alles grün")
