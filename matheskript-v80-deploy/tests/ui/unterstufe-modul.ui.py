"""Browser-Test des Moduls Unterstufe (/unterstufe/<lerneinheit>), Stand 20.10.2026.
Für jede der 86 Lerneinheiten (Handybreite 390, Stichprobe auch 1280):
  · Video-Feld da (Platzhalter oder eigenes), Klick zeigt die YouTube-Einwilligung
  · mindestens eine Motion-Animation; sie startet von selbst, sobald sie im Bild ist, und läuft bis zum Ende
    (Knopf wechselt auf „noch einmal“); Spulen-Leiste vorhanden
  · Üben kompakt: genau EIN Hauptknopf, übrige Übungen nur im Untermenü „Mehr“ (Zahl stimmt), keine weiteren Pillen
  · keine Seitenfehler, keine Überbreite
  npm run build && npx vite preview --port 4173 &   →   python3 -u tests/ui/unterstufe-modul.ui.py   (FILTER=teil-der-id optional)
"""
import json, os, subprocess
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
AUS = os.environ.get("SCREENS", "/tmp/unterstufe-modul")
FILTER = os.environ.get("FILTER", "")
os.makedirs(AUS, exist_ok=True)
fehler = []
def pruefe(bed, text):
    if not bed:
        fehler.append(text); print("FEHLT:", text)

hier = os.path.dirname(os.path.abspath(__file__))
wurzel = os.path.abspath(os.path.join(hier, "..", ".."))
daten = json.loads(subprocess.check_output(["node", "-e", """
Promise.all([import('./src/unterstufeDaten.js'), import('./src/unterstufeMedien.js')]).then(([d, m]) => {
  console.log(JSON.stringify(d.UNTERSTUFE_EINHEITEN.map((e) => ({ id: e.id, ueben: e.ueben.length, anims: m.animationenFuer(e.id).length }))));
});"""], cwd=wurzel))
einheiten = [e for e in daten if FILTER in e["id"]]

with sync_playwright() as p:
    b = p.chromium.launch()
    for breite in (390, 1280):
        ctx = b.new_context(viewport={"width": breite, "height": 860}, locale="de-DE")
        page = ctx.new_page(); konsole = []
        page.on("pageerror", lambda e: konsole.append(f"pageerror: {e}"))
        page.on("console", lambda m: konsole.append(m.text) if m.type == "error" and "net::" not in m.text and "Failed to load resource" not in m.text else None)
        page.goto(BASE)
        page.evaluate("localStorage.clear(); localStorage.setItem('mm-start-app','1'); localStorage.setItem('mm-onboarding-v1', JSON.stringify({uebersprungen:true}));")
        liste = einheiten if breite == 390 else einheiten[::9]
        for e in liste:
            wo = f"{breite}/{e['id']}"
            page.goto(BASE + "unterstufe/" + e["id"]); page.wait_for_selector(f"[data-us-einheit='{e['id']}']", timeout=15000)
            page.wait_for_timeout(300)
            # Video
            pruefe(page.locator("[data-us-video]").count() == 1, f"{wo}: kein Video-Feld")
            # Animationen
            m = page.locator("[data-us-motion]")
            pruefe(m.count() == e["anims"] and e["anims"] >= 1, f"{wo}: {m.count()} Animationen statt {e['anims']}")
            if m.count():
                m.first.scroll_into_view_if_needed(); page.wait_for_timeout(700)
                lbl = m.first.locator("[data-usm-knopf]").get_attribute("aria-label")
                pruefe(lbl == "Animation anhalten", f"{wo}: Animation startet nicht von selbst ({lbl})")
                pruefe(m.first.locator("input[type=range]").count() == 1, f"{wo}: keine Spul-Leiste")
                pruefe(len(m.first.locator(".usm-text").inner_text().strip()) > 0, f"{wo}: kein Untertitel")
                if breite == 390 and e is liste[0] or FILTER:
                    page.wait_for_timeout(15000)
                    lbl = m.first.locator("[data-usm-knopf]").get_attribute("aria-label")
                    pruefe(lbl == "Animation noch einmal abspielen", f"{wo}: Animation läuft nicht zu Ende ({lbl})")
                    m.first.screenshot(path=f"{AUS}/{e['id']}-anim.png")
            # Üben kompakt
            u = page.locator("[data-us-ueben]")
            pruefe(u.locator("[data-us-haupt]").count() == 1, f"{wo}: nicht genau ein Hauptknopf")
            pruefe(u.locator(".us-knopf").count() <= 2, f"{wo}: zu viele Pillen-Knöpfe im Üben ({u.locator('.us-knopf').count()})")
            mehr = u.locator("[data-us-mehr]")
            if e["ueben"] > 1:
                pruefe(mehr.count() == 1, f"{wo}: Untermenü fehlt")
                if mehr.count():
                    mehr.click(); page.wait_for_timeout(100)
                    pruefe(u.locator(".us-zeile").count() == e["ueben"] - 1, f"{wo}: Untermenü hat {u.locator('.us-zeile').count()} statt {e['ueben'] - 1} Einträge")
            else:
                pruefe(mehr.count() == 0, f"{wo}: Untermenü ohne Inhalt")
            sw = page.evaluate("document.documentElement.scrollWidth"); pruefe(sw <= breite, f"{wo}: Überbreite {sw}")
            if breite == 390 and (e is liste[0] or FILTER):
                page.locator("[data-us-video] .us-video-kopf").click(); page.wait_for_timeout(150)
                page.locator("[data-us-play]").click(); page.wait_for_timeout(200)
                pruefe(page.locator("[data-us-video] >> text=/Video laden/").count() == 1 or page.locator("[data-us-video] iframe").count() == 1, f"{wo}: Video-Klick zeigt weder Einwilligung noch Video")
                page.screenshot(path=f"{AUS}/{e['id']}-{breite}.png", full_page=True)
            if konsole: fehler.append(f"{wo}: Konsole: {konsole[:3]}"); print("KONSOLE", wo, konsole[:3]); konsole.clear()
        ctx.close()
    b.close()

print(f"{len(einheiten)} Lerneinheiten geprüft")
if fehler:
    print(f"{len(fehler)} FEHLER"); raise SystemExit(1)
print("alles in Ordnung")
