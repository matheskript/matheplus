"""Browser-Test Direct Links: jeder Pfad aus src/pfade.js öffnet seine Seite, die Adresse bleibt stehen,
Navigation schreibt die Adresse, Zurück-Taste funktioniert, Aliasse/#-Links/Ref-Zahlen werden sauber umgeleitet.
  npx vite build && npx vite preview --port 4173 &   →   python3 tests/ui/pfade.ui.py
"""
import os, json, subprocess, sys
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173").rstrip("/")
WURZEL = os.path.join(os.path.dirname(__file__), "..", "..")
fehler = []

def pruefe(bed, text):
    if not bed:
        fehler.append(text)
        print("FEHLT:", text)

# zu = Ansicht ist über einen Angebots-Schalter (src/angebot.js, ANGEBOT) abgeschaltet → Direktlink leitet gewollt auf / um
js = "import {PFADE} from './src/pfade.js'; import {ansichtGesperrt} from './src/angebot.js'; console.log(JSON.stringify(PFADE.map(e=>({p:'/'+e.pfad,a:e.alias.map(x=>'/'+x),zu:ansichtGesperrt(e.ansicht)}))));"
liste = json.loads(subprocess.check_output(["node", "--input-type=module", "-e", js], cwd=WURZEL, text=True))
ZU = {e["p"] for e in liste if e.get("zu")}
print("abgeschaltet (→ /):", ", ".join(sorted(ZU)) or "–")
liste += [{"p": f"/klasse-{k}", "a": []} for k in (8, 10, 13)] + [{"p": "/landeswettbewerb/by", "a": []}]

with sync_playwright() as pw:
    b = pw.chromium.launch()
    ctx = b.new_context(viewport={"width": 390, "height": 844}, timezone_id="Europe/Berlin", locale="de-DE")
    page = ctx.new_page()
    konsole = []
    page.on("pageerror", lambda e: konsole.append(f"pageerror: {e}"))
    page.on("console", lambda m: konsole.append(m.text) if m.type == "error" and "net::" not in m.text and "Failed to load resource" not in m.text else None)

    def pfad():
        return page.evaluate("location.pathname")

    def offen(url, warten=700):
        page.goto("about:blank")   # echtes Neuladen, auch wenn nur der #-Anker wechselt
        page.goto(BASE + url)
        page.wait_for_timeout(warten)

    # 1. Jeder Pfad lädt ohne Fehler und behält seine Adresse
    for e in liste:
        konsole.clear()
        offen(e["p"], 450)
        soll = "/" if e.get("zu") else e["p"]
        pruefe(pfad() == soll, f"{e['p']}: Adresse wurde zu {pfad()}")
        pruefe(not konsole, f"{e['p']}: Konsolenfehler {konsole[:2]}")
        w = page.evaluate("document.documentElement.scrollWidth - window.innerWidth")
        pruefe(w <= 1, f"{e['p']}: Seitenüberbreite {w}px")
        pruefe(len(page.inner_text("body").strip()) > 40, f"{e['p']}: Seite leer")
    print(f"{len(liste)} Pfade geprüft")

    # 2. Inhalte stichprobenartig
    for url, text in [("/elternabend", "Elternabend"), ("/ableitungstrainer", "Produktregel"), ("/klasse-10", "Klasse 10"),
                      ("/kurvendiskussion", "Kurvendiskussion"), ("/kurvendiskussion/beliebig", "Kurvendiskussion"), ("/landingpage", "Mythos"),
                      ("/gleichungen/verstehen", "Gleichungen")]:
        if url in ZU:
            continue   # abgeschaltet: Umleitung auf / prüft Schritt 1
        offen(url)
        pruefe(text.lower() in page.inner_text("body").lower(), f"{url}: Text '{text}' fehlt")

    # 3. Aliasse, Schreibweisen, alte Links
    ea = "/" if "/elternabend" in ZU else "/elternabend"
    offen("/infoabend"); pruefe(pfad() == ea, f"Alias /infoabend → {pfad()}")
    offen("/Elternabend/"); pruefe(pfad() == ea, f"/Elternabend/ → {pfad()}")
    offen("/123456"); pruefe(pfad() == "/", f"Ref-Zahl → {pfad()}")
    offen("/gibtsnicht"); pruefe(pfad() == "/", f"Unbekannt → {pfad()}")
    lp = "/" if "/landingpage" in ZU else "/landingpage"
    offen("/#landingpage"); pruefe(pfad() == lp and page.evaluate("location.hash") == "", f"#landingpage → {pfad()}{page.evaluate('location.hash')}")
    offen("/#entwurf-pakete"); pruefe(pfad() == "/entwurf/pakete", f"#entwurf-pakete → {pfad()}")
    offen("/?ansicht=ableitungstrainer"); pruefe(pfad() == "/ableitungstrainer", f"?ansicht= → {pfad()}")

    # 4. Navigation schreibt die Adresse, Zurück/Vor funktionieren
    offen("/")
    page.evaluate("window.__mmGehe({ansicht:'ableitungstrainer'})"); page.wait_for_timeout(500)
    pruefe(pfad() == "/ableitungstrainer", f"gehe → {pfad()}")
    page.evaluate("window.__mmGehe({ansicht:'klasse', klasse: 11})"); page.wait_for_timeout(500)
    pruefe(pfad() == "/klasse-11", f"Klasse → {pfad()}")
    page.evaluate("window.__mmGehe({ansicht:'training', ziel:'kd'})"); page.wait_for_timeout(500)
    pruefe(pfad() == "/kurvendiskussion-protokoll", f"Training-Ziel → {pfad()}")
    page.go_back(); page.wait_for_timeout(600)
    pruefe(pfad() == "/klasse-11" and "klasse 11" in page.inner_text("body").lower(), f"Zurück → {pfad()}")
    page.go_back(); page.wait_for_timeout(600)
    pruefe(pfad() == "/ableitungstrainer" and "produktregel" in page.inner_text("body").lower(), f"Zurück 2 → {pfad()}")   # seit 22.10. Regelwerkstatt
    page.go_back(); page.wait_for_timeout(600)
    pruefe(pfad() == "/", f"Zurück zum Start → {pfad()}")
    page.go_forward(); page.wait_for_timeout(600)
    pruefe(pfad() == "/ableitungstrainer", f"Vor → {pfad()}")
    n = page.evaluate("history.length")
    page.evaluate("window.__mmGehe({ansicht:'ableitungstrainer'})"); page.wait_for_timeout(300)
    pruefe(page.evaluate("history.length") == n, "Gleiche Seite erneut öffnen legt keinen Verlaufseintrag an")

    pruefe(not konsole, f"Konsolenfehler am Ende: {konsole[:3]}")
    b.close()

print("FEHLER:" if fehler else "ALLES OK", *fehler, sep="\n" if fehler else " ")
sys.exit(1 if fehler else 0)
