"""Browser-Test „Stammfunktion & Integral“ (Hauptsatz-Trainer): falsche Antworten bekommen nie „Richtig“.
Die Bewertung selbst prüft tests/stammIntegral.test.mjs; hier geht es um die Anzeige im Trainingsmodus.
Siehe README.md."""
import os, sys
from playwright.sync_api import sync_playwright

URL = os.environ.get("BASE_URL", "http://localhost:4173/").rstrip("/") + "/stammfunktion"
AUS = os.environ.get("SCREENSHOTS")
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
    p.wait_for_timeout(2000)
    for t in ["Verstanden", "Schließen", "OK", "Später"]:
        try:
            k = p.get_by_role("button", name=t, exact=True)
            if k.count():
                k.first.click(timeout=500)
        except Exception:
            pass
    return ctx, p


def sichtbar_text(p):
    return p.evaluate("document.body.innerText")


with sync_playwright() as pw:
    b = pw.chromium.launch()
    for (w, h) in [(1280, 900), (390, 844)]:
        ctx, p = seite(b, w, h)
        p.get_by_role("button", name="Training", exact=True).first.click()
        p.wait_for_timeout(300)

        # Teil 1: Stammfunktion bilden – √(−x) passt zu keiner Aufgabe
        p.get_by_text("F(x) =", exact=True).locator("visible=true").first.click()
        p.get_by_role("button", name="Lieber selbst tippen", exact=True).locator("visible=true").first.click()
        feld = p.get_by_placeholder("z. B. x^3/3 oder -cos(2x)/2").locator("visible=true").first
        feld.fill("sqrt(-x)")
        feld.press("Enter")
        p.wait_for_timeout(300)
        t = sichtbar_text(p)
        pruefe("Richtig! 🎉" not in t, f"{w}: √(−x) wurde als richtig gefeiert")
        pruefe("\nRichtig!\n" not in t and not t.strip().endswith("Richtig!"), f"{w}: Hinweis „Richtig!“ bei falscher Stammfunktion")
        pruefe("Noch nicht richtig" in t, f"{w}: kein Fehlerhinweis bei falscher Stammfunktion")
        if AUS:
            p.screenshot(path=os.path.join(AUS, f"stammintegral-stamm-{w}.png"), full_page=True)

        # Teil 2: Integral – falsche Stammfunktion, dann Lösung zeigen, dann falscher Wert
        p.keyboard.press("Escape")
        p.get_by_role("tab", name="Integral ∫ₐᵇ mit dem Hauptsatz").click()
        p.wait_for_timeout(400)
        p.get_by_text("F(x) =", exact=True).locator("visible=true").first.click()
        p.get_by_role("button", name="Lieber selbst tippen", exact=True).locator("visible=true").first.click()
        feld = p.get_by_placeholder("z. B. x^3 oder -cos(x)").locator("visible=true").first
        feld.fill("sqrt(-x)")
        feld.press("Enter")
        p.wait_for_timeout(300)
        pruefe("Noch nicht richtig" in sichtbar_text(p), f"{w}: Integral – kein Fehlerhinweis bei falscher Stammfunktion")
        p.get_by_role("button", name="Lösung zeigen", exact=True).first.click()
        p.wait_for_timeout(300)
        wert = p.get_by_label("Wert des Integrals")
        wert.fill("12345")
        p.get_by_role("button", name="OK", exact=True).click()
        p.wait_for_timeout(300)
        t = sichtbar_text(p)
        pruefe("Alles richtig" not in t and "Geschafft" not in t, f"{w}: falscher Integralwert wurde angenommen")
        pruefe("Noch nicht richtig" in t, f"{w}: kein Hinweis bei falschem Integralwert")
        u = p.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")
        pruefe(u <= 1, f"{w}: horizontaler Überlauf {u}px")
        if AUS:
            p.screenshot(path=os.path.join(AUS, f"stammintegral-integral-{w}.png"), full_page=True)
        ctx.close()
    b.close()

if fehler:
    print("FEHLER:\n  " + "\n  ".join(fehler))
    sys.exit(1)
print("stammintegral.ui.py: alles in Ordnung")
