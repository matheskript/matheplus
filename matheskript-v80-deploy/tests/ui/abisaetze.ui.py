"""Browser-Test Abi-Sätze: Übersicht, Teil A/B, Zahl-, Term-, Ebenen- und Begründungsaufgaben, Ergebnis, Breite 390 px."""
import os, sys, re, json
from playwright.sync_api import sync_playwright
sys.path.insert(0, os.path.dirname(__file__))
BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
fehler = []
def pruefe(bed, text):
    if not bed: fehler.append(text); print("FEHLT:", text)

with sync_playwright() as p:
    b = p.chromium.launch()
    page = b.new_context(viewport={"width": 390, "height": 844}, locale="de-DE").new_page()
    konsole = []
    page.on("pageerror", lambda e: konsole.append(f"pageerror: {e}"))
    page.goto(BASE); page.evaluate("localStorage.clear(); localStorage.setItem('mm-start-app','1')"); page.reload(); page.wait_for_timeout(600)
    page.evaluate("window.__mmGehe({ ansicht: 'abisaetze' })"); page.wait_for_timeout(400)
    pruefe(page.get_by_role("button", name="Abi-Satz 3 öffnen").count() == 1, "Übersicht fehlt")
    page.get_by_role("button", name="Abi-Satz 3 öffnen").click(); page.wait_for_timeout(400)
    pruefe(page.get_by_text("A1 · Analysis · 15 VP").count() == 1, "Block A1 fehlt")
    sw = page.evaluate("document.documentElement.scrollWidth"); pruefe(sw <= 390, f"Überbreite Teil A {sw}")
    # Lösungen aus der Engine holen (gleicher Satz, gleicher Start)
    import subprocess
    loes = json.loads(subprocess.check_output(["node", "-e", "import('./src/abiSaetze.js').then(S=>{const s=S.abiSatz(3);const t=S.alleTeile(s);console.log(JSON.stringify(t.map(x=>({k:x.block+x.id,art:x.art||'num',felder:x.felder.map((f,i)=>x.art==='term'?S.feldLoesung(x,i):String(f.wert)),n:(x.kriterien||[]).length}))))})"]))
    # Teil A: jede Teilaufgabe mit der Musterlösung lösen (Term als Klartext mit ², ·)
    for t in [x for x in loes if x["k"].startswith("A")]:
        sek = page.locator(f"section[data-teil='{t['k']}']")
        if t["art"] == "begruenden":
            sek.get_by_role("button", name=re.compile("Lösung vergleichen")).click(); page.wait_for_timeout(100)
            for cb in sek.get_by_role("checkbox").all(): cb.check()
            sek.get_by_role("button", name="Punkte eintragen").click(); page.wait_for_timeout(100)
        else:
            for i, v in enumerate(t["felder"]): sek.locator("input").nth(i).fill(v)
            sek.get_by_role("button", name="Prüfen").click(); page.wait_for_timeout(100)
    pruefe(page.get_by_role("button", name="Weiter zu Teil B").count() == 1, "Teil A nicht komplett gelöst")
    pruefe("30 / 30 VP" in page.inner_text("body"), "Teil A nicht 30 VP")
    page.get_by_role("button", name="Weiter zu Teil B").click(); page.wait_for_timeout(300)
    pruefe(page.get_by_text("B1 · Analysis").count() == 1, "Teil B fehlt")
    sw = page.evaluate("document.documentElement.scrollWidth"); pruefe(sw <= 390, f"Überbreite Teil B {sw}")
    # Teil B: eine Aufgabe falsch, eine Lösung zeigen, Rest richtig
    for j, t in enumerate([x for x in loes if x["k"].startswith("B")]):
        sek = page.locator(f"section[data-teil='{t['k']}']")
        if t["art"] == "begruenden":
            sek.get_by_role("button", name=re.compile("Lösung vergleichen")).click(); page.wait_for_timeout(100)
            for cb in sek.get_by_role("checkbox").all(): cb.check()
            sek.get_by_role("button", name="Punkte eintragen").click(); page.wait_for_timeout(100)
        elif j == 0:
            sek.get_by_role("button", name=re.compile("Lösung zeigen")).click(); page.wait_for_timeout(100)
        else:
            for i, v in enumerate(t["felder"]): sek.locator("input").nth(i).fill("999" if j == 1 else v)
            sek.get_by_role("button", name="Prüfen").click(); page.wait_for_timeout(100)
    body = page.inner_text("body")
    pruefe("/ 60 VP" in body and "Keine Note" in body, "Gesamtergebnis fehlt")
    pruefe(page.get_by_text("Erwartet:").count() >= 1, "Erwartete Lösung bei Fehler fehlt")
    # Übersicht merkt sich den Stand
    page.get_by_role("button", name="‹ Alle Abi-Sätze").click(); page.wait_for_timeout(300)
    pruefe(re.search(r"Abi-Satz 3\n\d+ / 60 VP", page.inner_text("body")) is not None, "Stand in der Übersicht fehlt")
    pruefe(not konsole, f"Konsolenfehler: {konsole[:3]}")
    b.close()
print("FEHLER" if fehler else "OK", len(fehler)); sys.exit(1 if fehler else 0)
