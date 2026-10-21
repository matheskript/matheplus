"""Browser-Test Desktop-Stil, Gruppe „Zahlen, Terme, Unterstufe“ (DESKTOP-STIL.md):
Dezimal, Bruchrechnen, Bruchterme, Terme, Stellenwert, Ganze Zahlen, Primzahlen, Rechengesetze, Größen,
Zuordnungen, Prozent, Axiome, Zahlenräume, Mengen und Logik, Textaufgaben.
Je Breite (1440, 1100, 860 Desktop; 390, 360 Handy):
  · Desktop: Arbeitsfläche zweispaltig (data-arbeitsflaeche, linke Spalte ≤ 290 px, rechts breiter) wo vorhanden,
    Handy: keine Arbeitsfläche
  · eigene Grafiken am Desktop in echten Pixeln (viewBox-Breite = dargestellte Breite)
  · +/−-Knöpfe am Desktop: + liegt über −
  · Bedienen: +/−, Modus-Wechsel, „Neue Aufgabe“; keine Seitenfehler, keine Überbreite
  npm run build && npx vite preview --port 4173 &   →   python3 -u tests/ui/desktop-f.ui.py
"""
import os
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/").rstrip("/") + "/"
fehler = []
bekannt = lambda t: "net::" in t or "Failed to load resource" in t or "ERR_" in t


def pruefe(bed, text):
    if not bed:
        fehler.append(text)
        print("FEHLT:", text)


# Seite → (Desktop-Marker im Entdecken-Modus oder None, SVG in echten Pixeln prüfen)
SEITEN = {
    "dezimal": ("[data-dez=breit]", False),
    "stellenwert": ("[data-stellenwert=breit]", False),
    "ganzezahlen": ("[data-ganz=breit]", True),
    "primzahlen": ("[data-prim=breit]", False),
    "rechengesetze": ("[data-rg=breit]", False),
    "groessen": ("[data-groessen=breit]", True),
    "zuordnungen": ("[data-zuord=breit]", True),
    "prozent": ("[data-prozent=breit]", True),
    "bruchrechnen": ("[data-bruch=breit]", True),
    "bruchterme": ("[data-bruchterm=breit]", True),
    "axiome": ("[data-gesetzprobe] [data-arbeitsflaeche]", False),
    "zahlenraeume": ("[data-tester] [data-arbeitsflaeche]", False),
    "mengenlogik": ("[data-labor] [data-arbeitsflaeche]", False),
    "terme": (None, False),           # reiner Aufgaben-Trainer: bewusst eine Spalte
    "textaufgaben": (None, False),    # Trainer: eine Spalte in Karten
}


# Bekannt und schon vor dem Desktop-Umbau vorhanden (Handy-Zweig bleibt unverändert):
# /bruchrechnen, Entdecken bei 360 px – 9 px Überlauf durch eine leere Span-Zeile im Handy-Layout.
BEKANNT = {}


def ueberbreite(p, wo):
    u = p.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")
    pruefe(u <= BEKANNT.get(wo, 0), f"{wo}: horizontaler Überlauf {u}px")


with sync_playwright() as pw:
    b = pw.chromium.launch()
    for (w, h) in [(1440, 900), (1100, 760), (860, 760), (390, 844), (360, 740)]:
        desktop = w >= 840
        kw = dict(viewport={"width": w, "height": h}, locale="de-DE")
        if not desktop:
            kw.update(has_touch=True, is_mobile=True, device_scale_factor=2)
        ctx = b.new_context(**kw)
        p0 = ctx.new_page(); p0.goto(BASE)
        p0.evaluate("localStorage.clear(); localStorage.setItem('mm-onboarding-v1', JSON.stringify({uebersprungen:true}));"); p0.close()
        for pfad, (marker, echt) in SEITEN.items():
            wo = f"{w}/{pfad}"
            p = ctx.new_page(); konsole = []
            p.on("pageerror", lambda e: konsole.append(f"pageerror: {e}"))
            p.on("console", lambda m: konsole.append(m.text) if m.type == "error" and not bekannt(m.text) else None)
            p.goto(BASE + pfad); p.wait_for_timeout(1300)
            # Entdecken-Modus, falls Reiter vorhanden
            tab = p.get_by_role("tab", name="Entdecken", exact=True)
            if tab.count():
                tab.first.click(); p.wait_for_timeout(200)
            if marker:
                n = p.locator(marker).count()
                pruefe((n >= 1) == desktop, f"{wo}: Arbeitsfläche {'fehlt' if desktop else 'auf dem Handy'} ({marker})")
                if desktop and n:
                    sp = p.evaluate("""(sel) => { const a = document.querySelector(sel); const g = a.matches('[data-arbeitsflaeche]') ? a : a.querySelector('[data-arbeitsflaeche]');
                      const k = [...g.children].map((c) => Math.round(c.getBoundingClientRect().width)); return k; }""", marker)
                    pruefe(len(sp) == 2 and sp[0] <= 291 and sp[1] > sp[0], f"{wo}: Spalten {sp}")
            if desktop and echt:
                # alle SVGs der Arbeitsfläche ohne feste Geometrie: viewBox-Breite = dargestellte Breite
                d = p.evaluate("""() => [...document.querySelectorAll('[data-arbeitsflaeche] svg[viewBox]')].filter((s) => s.getBoundingClientRect().width > 150)
                  .map((s) => [s.viewBox.baseVal.width, Math.round(s.getBoundingClientRect().width)])""")
                pruefe(len(d) > 0, f"{wo}: kein Bild in der Arbeitsfläche")
                for vb, bw in d:
                    pruefe(abs(vb - bw) <= 1, f"{wo}: Grafik skaliert (viewBox {vb} statt {bw})")
            if desktop:
                # + über −: erstes Knopfpaar mit aria-label „… +“ / „… −“ derselben Größe
                paar = p.evaluate("""() => { const k = [...document.querySelectorAll('[data-arbeitsflaeche] button[aria-label$=" +"]')];
                  for (const plus of k) { const name = plus.getAttribute('aria-label').slice(0, -2);
                    const minus = [...document.querySelectorAll('[data-arbeitsflaeche] button')].find((x) => x.getAttribute('aria-label') === name + ' −');
                    if (minus) return [plus.getBoundingClientRect().top, minus.getBoundingClientRect().top]; } return null; }""")
                if paar:
                    pruefe(paar[0] < paar[1], f"{wo}: + nicht über −")
                    kn = p.locator('[data-arbeitsflaeche] button[aria-label$=" +"]:visible')
                    if kn.count():
                        kn.first.click(); p.wait_for_timeout(80)
                        p.locator('[data-arbeitsflaeche] button[aria-label$=" −"]:visible').first.click(); p.wait_for_timeout(80)
            # Chips/Auswahl in der Arbeitsfläche einmal durchklicken
            for k in p.locator("[data-arbeitsflaeche] [role=group] button[aria-pressed]:visible").all()[:6]:
                k.click(); p.wait_for_timeout(50)
            ueberbreite(p, wo)
            # Üben: Modus-Wechsel und „Neue Aufgabe“
            ub = p.get_by_role("tab", name="Üben", exact=True)
            if ub.count():
                ub.first.click(); p.wait_for_timeout(250)
                na = p.locator("button:has-text('Neue Aufgabe'):visible")
                pruefe(na.count() > 0, f"{wo}: „Neue Aufgabe“ fehlt im Üben")
                if na.count():
                    na.first.click(); p.wait_for_timeout(120)
                ueberbreite(p, f"{wo}/üben")
            if pfad == "terme":
                for t in ["Ausklammern", "Binomische Formeln", "Potenzgesetze", "Bruchterme"]:
                    p.get_by_role("tab", name=t).click(); p.wait_for_timeout(80)
                ueberbreite(p, f"{wo}/reiter")
            if pfad == "mengenlogik":
                for kap in ["operationen", "intervalle", "aussagen", "folgern", "mix"]:
                    p.locator(f"[data-kapitel={kap}]").click(); p.wait_for_timeout(250)
                    if kap != "mix":
                        pruefe((p.locator("[data-labor] [data-arbeitsflaeche]").count() >= 1) == desktop, f"{wo}/{kap}: Labor-Layout")
                    ueberbreite(p, f"{wo}/{kap}")
                p.locator("[data-kapitel=mengen]").click()
            if pfad == "zahlenraeume":
                p.get_by_role("tab", name="Entdecken", exact=True).first.click()
                tabs = p.locator("[role=tablist][aria-label='Stationen'] button")
                for i in range(1, 5):
                    tabs.nth(i).click(); p.wait_for_timeout(200)
                    ueberbreite(p, f"{wo}/station{i}")
                tabs.nth(0).click()
            if pfad == "textaufgaben":
                p.locator("[data-reiter=verstehen]").click(); p.wait_for_timeout(250)
                pruefe((p.locator("[data-verstehen=breit]").count() == 1) == desktop, f"{wo}: Verstehen-Layout")
                ueberbreite(p, f"{wo}/verstehen")
            pruefe(not konsole, f"{wo}: Fehler {konsole[:3]}")
            p.close()
        ctx.close()
        print(w, "geprüft")
    b.close()

if fehler:
    print(f"\n{len(fehler)} Fehler"); raise SystemExit(1)
print("alles in Ordnung")
