"""Browser-Test Mathilda-Chat (API nachgebildet): Seite „Mathilda fragen“, Modal aus „Ich hänge fest“,
Werkzeug-Hinweis, Kontingent-Anzeige, 429-Meldung, Breite 390 px, keine Konsolenfehler.
  npm run build && npx vite preview --port 4173 &   →   python3 tests/ui/mathilda.ui.py
"""
import os, sys, json, re
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "http://localhost:4173/")
fehler = []
def pruefe(bed, text):
    if not bed: fehler.append(text); print("FEHLT:", text)

anfragen = []
def api(route, request):
    body = json.loads(request.post_data or "{}")
    anfragen.append({"headers": dict(request.headers), "body": body})
    n = len(anfragen)
    if n >= 4:
        route.fulfill(status=429, content_type="application/json", body=json.dumps({"error": {"type": "proxy_error", "message": "Dein Tageskontingent ist aufgebraucht (30 Anfragen).", "kontingent": {"anzahl": 30, "limit": 30, "plan": "free"}}}))
        return
    antwort = {"content": [{"type": "text", "text": "Was weißt du schon über die Potenzregel? Die Ableitung ist laut Engine $3x^2 - 3$."}], "stop_reason": "end_turn",
               "werkzeuge": [{"name": "ableiten", "eingabe": {"term": "x^3-3x"}, "ergebnis": "f'(x) = 3x² − 3"}], "kontingent": {"anzahl": n, "limit": 30, "plan": "free"}}
    route.fulfill(status=200, content_type="application/json", body=json.dumps(antwort))

with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": 390, "height": 844}, locale="de-DE")
    page = ctx.new_page()
    konsole = []
    page.on("pageerror", lambda e: konsole.append(f"pageerror: {e}"))
    page.on("console", lambda m: konsole.append(m.text) if m.type == "error" and "net::" not in m.text and "Failed to load resource" not in m.text else None)
    page.route("**/api/claude", api)
    page.goto(BASE); page.evaluate("localStorage.clear(); sessionStorage.setItem('mm-entwurf-frei', '744ac4c7a298e917d88972fbbf5a9440cc04c24e24b63c62d292b1771ab69d7b')"); page.reload(); page.wait_for_timeout(600)   # Mathilda-Sperre (skript) offen

    # Seite „Mathilda fragen“
    page.evaluate("window.__mmGehe({ ansicht: 'analyse', foto: 'chat' })"); page.wait_for_timeout(400)
    pruefe(page.get_by_text("Mathilda kennt deinen Lernstand").count() == 1, "Chat-Seite fehlt")
    sw = page.evaluate("document.documentElement.scrollWidth"); pruefe(sw <= 390, f"Überbreite Chat-Seite {sw}")
    page.get_by_label("Nachricht an Mathilda").fill("Wie leite ich x^3-3x ab?")
    page.get_by_role("button", name="Senden").click(); page.wait_for_timeout(500)
    pruefe(page.get_by_text("Mit der App nachgerechnet: abgeleitet").count() == 1, "Werkzeug-Hinweis fehlt")
    pruefe(page.get_by_text("Heute 1 von 30 Anfragen").count() == 1, "Kontingent-Anzeige fehlt")
    a = anfragen[-1]
    pruefe(a["body"].get("werkzeuge") is True, "werkzeuge: true fehlt in der Anfrage")
    pruefe("Sokratisch" in a["body"].get("system", "") and "Noch kein Lernpfad" in a["body"]["system"], "Systemprompt ohne Regeln/Gedächtnis")
    pruefe(a["body"]["messages"][0]["role"] == "user" and a["body"]["messages"][0]["content"].startswith("Wie leite"), "Nachrichtenfolge falsch")
    pruefe("x-geraet" in a["headers"], "X-Geraet fehlt")

    # Modal aus „Ich hänge fest“ (5 Minuten Mathe)
    page.evaluate("window.__mmGehe({ ansicht: 'warmup' })"); page.wait_for_timeout(400)
    page.get_by_role("button", name="Los geht’s").click(); page.wait_for_timeout(400)
    page.get_by_role("button", name="Ich hänge fest").first.click(); page.wait_for_timeout(300)
    page.get_by_role("button", name="Mathilda fragen").click(); page.wait_for_timeout(300)
    pruefe(page.get_by_role("dialog", name="Mathilda fragen").count() == 1, "Modal fehlt")
    page.get_by_label("Nachricht an Mathilda").fill("Ich komme nicht weiter")
    page.get_by_role("button", name="Senden").click(); page.wait_for_timeout(500)
    a = anfragen[-1]
    pruefe("Aktuelle Aufgabe:" in a["body"]["system"], "Aufgabe fehlt im Systemprompt des Modals")
    pruefe(page.get_by_text("Mit der App nachgerechnet").count() == 1, "Antwort im Modal fehlt")
    sw = page.evaluate("document.documentElement.scrollWidth"); pruefe(sw <= 390, f"Überbreite Modal {sw}")
    page.get_by_role("button", name="Zurück zur Aufgabe").click(); page.wait_for_timeout(300)
    pruefe(page.get_by_text("Aufgabe 1 von 5").count() == 1, "Rückkehr zur Aufgabe fehlt")
    # Hilfe wurde gezählt: Aufgabe gilt nach Mathilda als geführt (Hinweisstufe 2)
    # Kontingent aufgebraucht (vierte Anfrage): Meldung sichtbar
    page.evaluate("window.__mmGehe({ ansicht: 'analyse', foto: 'chat' })"); page.wait_for_timeout(400)
    page.get_by_label("Nachricht an Mathilda").fill("Noch eine Frage"); page.get_by_role("button", name="Senden").click(); page.wait_for_timeout(400)
    page.get_by_label("Nachricht an Mathilda").fill("Und noch eine"); page.get_by_role("button", name="Senden").click(); page.wait_for_timeout(400)
    pruefe(page.get_by_role("alert").filter(has_text="Tageskontingent").count() == 1, "429-Meldung fehlt")
    pruefe(page.get_by_text("Heute 30 von 30 Anfragen").count() == 1, "Kontingent nach 429 fehlt")

    # Englisch: neue Texte übersetzt
    page.evaluate("localStorage.setItem('mm-sprache','en')"); page.reload(); page.wait_for_timeout(900)
    page.evaluate("window.__i18nFehlt.clear(); window.__mmGehe({ ansicht: 'analyse', foto: 'chat' })"); page.wait_for_timeout(500)
    en = json.load(open("src/i18n/en.json"))["exakt"]
    fehlt = [f for f in page.evaluate("Array.from(window.__i18nFehlt)") if len(f.strip()) > 5 and f not in ("DEMO", "Mathilda") and f not in en.values() and not re.search(r"[=^]|\d", f)]
    pruefe(not fehlt, f"Englisch, fehlende Texte: {fehlt[:20]}")
    page.evaluate("localStorage.setItem('mm-sprache','de')")
    pruefe(not konsole, f"Konsolenfehler: {konsole[:5]}")
    b.close()
print("FEHLER" if fehler else "OK", len(fehler)); sys.exit(1 if fehler else 0)
