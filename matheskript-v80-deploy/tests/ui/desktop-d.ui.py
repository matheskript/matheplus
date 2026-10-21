"""Browser-Test Desktop-Stil, Gruppe Stochastik: Bernoulli-Kette, Vier-Felder-Tafel, Erwartungswert, Kombinatorik,
Hypothesentests, Normalverteilung, Zufall, Daten und Diagramme.
Je Breite (1440, 1100, 860 = Desktop; 390, 360 = Handy):
  · Desktop-Zweig nur ab 840 px (data-…="breit"), am Desktop Einstellungen links und Bild rechts nebeneinander
  · Grafiken in echten Pixeln (viewBox-Breite = dargestellte Breite)
  · Bedienung: Regler/Knöpfe, Modus-Wechsel, „Neue Aufgabe“, Prüfen
  · keine Seitenfehler, keine Konsolenfehler, keine Überbreite
  npx vite preview --port 4173 &   →   BASE_URL=http://localhost:4173/ python3 tests/ui/desktop-d.ui.py
  optional: SCREENSHOTS=/ordner für Bildschirmfotos
"""
import os
from playwright.sync_api import sync_playwright

def _typen_auf(pg):
    """Aufgabentyp-Chips liegen seit 21.10. hinter der Einstellungs-Pille: bei Bedarf aufklappen."""
    if pg.locator("[data-einstellungen-feld]:visible").count() == 0:
        pil = pg.locator("[data-einstellungen-pille]:visible")
        if pil.count():
            pil.first.click(); pg.wait_for_timeout(150)

BASE = os.environ.get("BASE_URL", "http://localhost:4173/").rstrip("/")
AUS = os.environ.get("SCREENSHOTS")
fehler = []
bekannt = lambda t: "ERR_TUNNEL" in t or "net::ERR" in t or "Failed to load resource" in t


def pruefe(bed, text):
    if not bed:
        fehler.append(text)
        print("FEHLT:", text)


def seite(b, w, h, pfad):
    kw = dict(viewport={"width": w, "height": h})
    if w < 600:
        kw.update(has_touch=True, is_mobile=True, device_scale_factor=2)
    ctx = b.new_context(**kw)
    p = ctx.new_page()
    p.on("pageerror", lambda e: fehler.append(f"{w}{pfad}: pageerror: {e}"))
    p.on("console", lambda m: fehler.append(f"{w}{pfad}: console: {m.text[:200]}") if m.type == "error" and not bekannt(m.text) else None)
    p.goto(BASE + pfad)
    p.wait_for_timeout(1800)
    for t in ["Verstanden", "Schließen", "OK", "Später"]:
        try:
            k = p.get_by_role("button", name=t, exact=True)
            if k.count():
                k.first.click(timeout=500)
        except Exception:
            pass
    return ctx, p


# Bekannte Überläufe am Handy, schon vor dem Desktop-Umbau vorhanden (Handy-Zweig bleibt unverändert):
#   360/diagramme – Animations-Chips der MotionAuswahl (geoUi.jsx), 390/bernoulli nach „n = 50“ – Handy-Layout
BEKANNT_HANDY = set()


def ueberbreite(p, n):
    u = p.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")
    if n in BEKANNT_HANDY:
        if u > 1:
            print(f"bekannt (vorher schon): {n} Überlauf {u}px")
        return
    pruefe(u <= 1, f"{n}: horizontaler Überlauf {u}px")


def nebeneinander(p, n):
    """Arbeitsfläche: zweite Spalte rechts neben der ersten, oben bündig"""
    r = p.evaluate("""() => [...document.querySelectorAll('[data-arbeitsflaeche]')].filter((a) => a.offsetParent).map((a) => {
      const [l, r] = a.children; const bl = l.getBoundingClientRect(), br = r.getBoundingClientRect();
      return [br.left >= bl.right - 1, Math.abs(br.top - bl.top) < 4]; })""")
    pruefe(len(r) > 0, f"{n}: keine Arbeitsfläche")
    for i, (rechts, oben) in enumerate(r):
        pruefe(rechts and oben, f"{n}: Arbeitsfläche {i + 1} nicht zweispaltig")


def echte_pixel(p, n, sel):
    """viewBox-Breite des ersten sichtbaren SVG in sel = dargestellte Breite"""
    r = p.evaluate("""(sel) => { const s = [...document.querySelectorAll(sel + ' svg')].find((x) => x.getBoundingClientRect().width > 150 && x.viewBox.baseVal.width);
      return s ? [s.viewBox.baseVal.width, Math.round(s.getBoundingClientRect().width)] : null; }""", sel)
    pruefe(r is not None, f"{n}: keine Grafik in {sel}")
    if r:
        pruefe(abs(r[0] - r[1]) <= 2, f"{n}: Grafik skaliert ({r[0]} statt {r[1]})")


def klick(p, name, exact=True):
    k = p.get_by_role("button", name=name, exact=exact).locator("visible=true").first
    try:
        k.click(timeout=3000)
    except Exception:
        k.dispatch_event("click")   # am Handy liegt manchmal eine schwebende Leiste über dem Knopf
    p.wait_for_timeout(120)


def tab(p, name):
    p.get_by_role("tab", name=name).first.click()
    p.wait_for_timeout(250)


def foto(p, w, name):
    if AUS:
        os.makedirs(AUS, exist_ok=True)
        p.screenshot(path=f"{AUS}/{name}-{w}.png", full_page=True)


def schritt_loesen(p):
    """Einen Schritt über „Lösung dieses Schritts zeigen“ weiterschalten"""
    z = p.locator("button:has-text('Lösung dieses Schritts zeigen'):visible")
    if z.count():
        z.first.click(); p.wait_for_timeout(80)
        w = p.locator("button:has-text('Weiter zum nächsten Schritt'):visible")
        if w.count():
            w.first.click(); p.wait_for_timeout(80)


with sync_playwright() as pw:
    b = pw.chromium.launch()
    for (w, h) in [(1440, 900), (1100, 760), (860, 760), (390, 844), (360, 740)]:
        d = w >= 840

        # ---------- Bernoulli-Kette ----------
        n = f"{w}/bernoulli"
        ctx, p = seite(b, w, h, "/bernoulli")
        pruefe(p.locator("[data-bk=breit]").count() == (1 if d else 0), f"{n}: falsches Layout")
        ueberbreite(p, n)
        if d:
            nebeneinander(p, n)
            echte_pixel(p, n, "[data-arbeitsflaeche]")
        klick(p, "n erhöhen")
        pruefe(p.get_by_text("11 Versuche").count() >= 1, f"{n}: n + ändert nichts")
        klick(p, "k verringern")
        klick(p, "p erhöhen")
        klick(p, "X ≥ k")
        klick(p, "a ≤ X ≤ k")
        klick(p, "a erhöhen")
        klick(p, "n = 50")
        klick(p, "100× simulieren")
        pruefe(p.get_by_text("Durchgänge:").count() == 1, f"{n}: Simulation ohne Stand")
        klick(p, "Aufgabe stellen")
        klick(p, "Lösung einstellen")
        pruefe(p.get_by_role("button", name="Nächste Aufgabe").count() == 1, f"{n}: Übung nicht lösbar")
        ueberbreite(p, n + " bedient")
        foto(p, w, "bernoulli")
        ctx.close()

        # ---------- Vier-Felder-Tafel ----------
        n = f"{w}/vierfelder"
        ctx, p = seite(b, w, h, "/vierfeldertafel")
        pruefe(p.locator("[data-vf=breit]").count() == (1 if d else 0), f"{n}: falsches Layout")
        ueberbreite(p, n)
        if d:
            nebeneinander(p, n)
            echte_pixel(p, n, "[data-vf-quadrat]")
            echte_pixel(p, n, "[data-vf-baum]")
        p.get_by_role("button", name="erhöhen").first.click(); p.wait_for_timeout(100)
        pruefe(p.get_by_text("1001", exact=True).count() >= 1, f"{n}: Feld + ändert die Summe nicht")
        klick(p, "Relativ (in %)")
        pruefe(p.get_by_text("ergibt sich", exact=True).count() >= 1, f"{n}: Relativ-Modus fehlt")
        klick(p, "Münze & Würfel")
        pruefe(p.get_by_text("stochastisch unabhängig", exact=False).count() >= 1, f"{n}: Unabhängigkeit nicht erkannt")
        klick(p, "umgekehrt: erst B")
        klick(p, "Ā")
        ueberbreite(p, n + " bedient")
        foto(p, w, "vierfelder")
        ctx.close()

        # ---------- Erwartungswert ----------
        n = f"{w}/erwartungswert"
        ctx, p = seite(b, w, h, "/erwartungswert")
        pruefe((p.locator("[data-erw=breit]:visible").count() == 1) == d, f"{n}: falsches Layout")
        ueberbreite(p, n)
        for _ in range(6):
            schritt_loesen(p)
        pruefe(p.get_by_text("Vollständig:", exact=False).count() >= 1, f"{n}: Gewinnverteilung nicht bis zum Ende")
        if d:
            echte_pixel(p, n, "[data-erw=breit]")
        klick(p, "Neue Aufgabe")
        tab(p, "Fairer Einsatz")
        p.locator("input[type=range]:visible").first.fill("2")
        ueberbreite(p, n + " fair")
        tab(p, "Langfristig spielen")
        p.locator("[data-erw]:visible button, div:visible > button").filter(has_text="nähert sich").first.click()
        klick(p, "+100")
        pruefe(p.get_by_text("Gespielt", exact=True).locator("visible=true").count() >= 1, f"{n}: Simulation fehlt")
        ueberbreite(p, n + " lang")
        foto(p, w, "erwartungswert")
        ctx.close()

        # ---------- Kombinatorik ----------
        n = f"{w}/kombinatorik"
        ctx, p = seite(b, w, h, "/kombinatorik")
        pruefe((p.locator("[data-komb=breit]:visible").count() == 1) == d, f"{n}: falsches Layout")
        ueberbreite(p, n)
        klick(p, "Kugel ziehen")
        klick(p, "mit Zurücklegen")
        for _ in range(5):
            schritt_loesen(p)
        klick(p, "Neue Urne")
        tab(p, "Zählmethode wählen")
        klick(p, "Neue Aufgabe")
        ueberbreite(p, n + " zählen")
        tab(p, "Baumdiagramm aufbauen")
        if d:
            echte_pixel(p, n, "[data-komb=breit]:not([style*='display: none'])")
        p.locator("summary:visible").filter(has_text="Lösung der Zweige").first.click()
        klick(p, "Lösung eintragen")
        pruefe(p.get_by_text("Weiter mit diesem Baum", exact=False).locator("visible=true").count() >= 1, f"{n}: Baum nicht lösbar")
        ueberbreite(p, n + " baum")
        foto(p, w, "kombinatorik")
        ctx.close()

        # ---------- Hypothesentests ----------
        n = f"{w}/hypothesentest"
        ctx, p = seite(b, w, h, "/hypothesentest")
        pruefe((p.locator("[data-ht=breit]:visible").count() == 1) == d, f"{n}: falsches Layout")
        for _ in range(7):
            schritt_loesen(p)
        pruefe(p.get_by_text("Test vollständig", exact=False).count() >= 1, f"{n}: Test nicht bis zum Ende")
        ueberbreite(p, n)
        klick(p, "Neuer Test")
        tab(p, "Ablehnungs­bereich")
        if d:
            nebeneinander(p, n + " bereich")
        p.locator("button[aria-label$='+1']:visible").first.click()
        klick(p, "Ablehnungsbereich prüfen")
        ueberbreite(p, n + " bereich")
        tab(p, "Fehler verstehen")
        klick(p, "1000 Tests simulieren")
        pruefe(p.get_by_text("von 1000 Tests verworfen", exact=False).count() >= 1, f"{n}: Simulation fehlt")
        ueberbreite(p, n + " fehler")
        foto(p, w, "hypothesentest")
        ctx.close()

        # ---------- Normalverteilung ----------
        n = f"{w}/normalverteilung"
        ctx, p = seite(b, w, h, "/normalverteilung")
        stationen = p.get_by_role("tablist", name="Stationen").get_by_role("tab")
        for st in range(stationen.count()):
            stationen.nth(st).click(); p.wait_for_timeout(250)
            for lab in p.locator("[data-labor]:visible").all():
                if d:
                    pruefe(lab.locator("[data-arbeitsflaeche]").count() == 1, f"{n}/station{st + 1}: Labor nicht zweispaltig")
                    echte_pixel(p, f"{n}/station{st + 1}", "[data-labor]")
                knopf = lab.locator("button[aria-label$='+']:not([disabled])")
                if knopf.count():
                    knopf.first.click(); p.wait_for_timeout(80)
            ueberbreite(p, f"{n}/station{st + 1}")
            if st == 2:
                foto(p, w, "normalverteilung-flaeche")
        tab(p, "Trainieren")
        for _ in range(3):
            schritt_loesen(p)
        klick(p, "Neue Aufgabe")
        ueberbreite(p, n + " üben")
        ctx.close()

        # ---------- Zufall ----------
        n = f"{w}/zufall"
        ctx, p = seite(b, w, h, "/zufall")
        pruefe(p.locator("[data-zufall=breit]").count() == (1 if d else 0), f"{n}: falsches Layout")
        if d:
            nebeneinander(p, n)
            echte_pixel(p, n, "[data-zufall=breit]")
        klick(p, "+1000")
        pruefe(p.get_by_text("1000", exact=True).count() >= 1, f"{n}: Würfe zählen nicht")
        ueberbreite(p, n)
        foto(p, w, "zufall")
        tab(p, "Trainieren")
        for _ in range(3):
            schritt_loesen(p)
        klick(p, "Neue Aufgabe")
        ueberbreite(p, n + " üben")
        ctx.close()

        # ---------- Daten und Diagramme ----------
        n = f"{w}/diagramme"
        ctx, p = seite(b, w, h, "/diagramme")
        pruefe(p.locator("[data-diagramme=breit]").count() == (1 if d else 0), f"{n}: falsches Layout")
        if d:
            nebeneinander(p, n)
            echte_pixel(p, n, "[data-diagramme=breit]")
        klick(p, "A Fußball +")
        pruefe(p.get_by_text("25", exact=True).count() >= 1, f"{n}: Regler ändert die Gesamtzahl nicht")
        klick(p, "E Lesen −")
        ueberbreite(p, n)
        foto(p, w, "diagramme")
        tab(p, "Trainieren")
        _typen_auf(p)
        p.locator("[data-aufgabentyp]:visible button").filter(has_text="Diagramm ablesen").first.click(); p.wait_for_timeout(150)
        schritt_loesen(p)
        ueberbreite(p, n + " üben")
        ctx.close()
    b.close()

print("\n".join(fehler) if fehler else "Alles grün.")
raise SystemExit(1 if fehler else 0)
