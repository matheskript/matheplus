# Stilvorlage · Mythos-Mathe-Schulbuch „Kurvendiskussion“ (Band 3)

Das Buch muss in Stil, Aufbau und Qualität **exakt** wie Band 1 „Ableitungen“ aussehen
(`../ableitungen/pages/`). Band 3 setzt direkt auf Band 1 auf: Alle Ableitungsregeln sind bekannt und werden
**nicht** neu erklärt, sondern mit Verweis auf Band 1 benutzt („→ Band 1, Potenzregel“).

Lies vor dem Schreiben mindestens diese Vorbildseiten vollständig:
`../ableitungen/pages/11-auftakt-ableitung.html` (Auftakt), `14-diffquot-1.html` + `15-diffquot-2.html`,
`28-produktregel-1.html` + `29-produktregel-2.html`, `40-tangente-normale-1.html` + `41-tangente-normale-2.html`
(Unterkapitel als Doppelseite), `22-training-ableitung.html` (Trainingsseite), `../ableitungen/loesungen.html` (Lösungsstil).
Alle CSS-Klassen stehen in `buch.css`. Erfinde keine neuen Klassen, nutze die vorhandenen.

## Seitendateien
- Eine Datei = eine A4-Seite. **Dateinummer = Seitenzahl** (zweistellig), z. B. `04-waagrecht-1.html`.
  Ungerade Seite = rechte Seite (Randspalte rechts), gerade = linke Seite (Randspalte links) – das macht der Build automatisch.
- Erste Zeile ist die Meta-Zeile:
  - Auftakt: `<!-- kap: I | typ: auftakt -->`
  - Beginn eines Unterkapitels: `<!-- kap: I | uk: Die waagrechte Tangente -->`
  - Fortsetzungsseite: `<!-- kap: I -->`
  - Trainingsseite: `<!-- kap: I | ukap: Alles klar? Training I -->`
- Inhalt: Hauptspalte, dann `<!--rand-->`, dann die Randspalte (Notizen).
- Verweise **nie** als feste Zahl: `{{S:stamm}}` Seitenzahl, `{{K:stamm}}` Nummer des Unterkapitels,
  `{{T:stamm}}` Titel. `stamm` = Dateiname ohne Nummer und `.html`. Lösungen beginnen bei `{{S:loesungen-1}}`.
  Verweise auf Band 1 als Text: „Band 1, Kapitel III (Potenzregel)“ – keine Seitenzahlen aus Band 1.

## Aufbau eines Unterkapitels (Doppelseite = eine Unterrichtsstunde)
Seite 1: `ukap-titel` mit `{{K:…}}`-Nummer, `leitfrage`, Kasten `einstieg` (Frage/Experiment mit a) b) c)),
Herleitung im Fließtext (selbst hergeleitet, nicht hingestellt!), Kasten `merke`, `beispiel` mit `loesung`.
Rand: `notiz stunde` (Ablauf der Stunde + Hausaufgabe), `notiz` (Wortspeicher / Erinnerung), `notiz gold` (Tipp).
Seite 2: weiteres Beispiel, ggf. `achtung`, `vertiefung` („★ Für Interessierte“: exakte Begründung/Beweis),
dann `aufgaben-kopf` und **7–9 Aufgaben** in drei Stufen (●○○ / ●●○ / ●●●, letzte als `z offen` = Vertiefung),
mit Teilaufgaben in `.teil` (Spaltenzahl `--sp`). Rand: Tipps zu einzelnen Aufgaben, genau **eine** `notiz mathilda`
„In der App“ mit dem passenden Werkzeug. Namen exakt so schreiben, sonst entsteht kein App-Knopf – und nur versprechen,
was das Werkzeug kann:
- `Kurvendiskussion` – zeichnet den Graphen einer Funktion (Polynome und beliebige Funktionen), zeigt Ableitungen und die komplette Kurvendiskussion, PDF-Export.
- `Ableitungstrainer` – f′, f″ und f‴ eingeben und sofort prüfen lassen.
- `Steckbriefaufgaben` – aus Hochpunkt, Wendepunkt & Co. die Funktion bauen (erst ab späteren Kapiteln sinnvoll).
- `Meine Fehler üben`, `Formelsammlung`, `Mathilda` (Foto vom eigenen Blatt analysieren lassen).

Auftaktseite: wie `11-auftakt-ableitung.html` – farbiger Kopf mit Kapitelfrage, Einstiegsbild + „Die Frage des Kapitels“,
Tabelle „Das kannst du schon – kurzer Check“ (4 Zeilen, Lösungen im Lösungsteil), Lernziele, Liste der Unterkapitel,
großes blasses Symbol oben rechts (wie das Symbol in Band 1).
Trainingsseite: wie `22-training-ableitung.html` – Selbsteinschätzung „Ich kann …“ mit Seitenverweisen, 7–8 Aufgaben T1…T8.

**Jede Seite muss voll, aber ohne Überlauf sein** (nach `render.py` „frei haupt“ zwischen etwa 0 und 60 px; kein `<--`-Hinweis).
Eine halbleere Seite ist ein Fehler – dann ergänzen (Beispiel, Aufgabe, Abbildung).

## Mathematik und Schreibweise
- Formeln in KaTeX: `$…$` inline, `$$…$$` abgesetzt. Dezimalkomma `{,}` (z. B. `2{,}5`). Mal: `\cdot`.
- Punkte: `$H(1 \mid 4)$` (Hochpunkt), `$T(3 \mid 2)$` (Tiefpunkt), `$S(0 \mid 0)$` (Sattelpunkt). Stellen: $x_0$, $x_E$.
- Ableitungen: $f'(x)$, $f''(x)$, $f'''(x)$. Bedingungen: „notwendige Bedingung $f'(x_0) = 0$“,
  „hinreichende Bedingung: $f'(x_0) = 0$ und Vorzeichenwechsel von $f'$ bei $x_0$“ bzw. „$f'(x_0) = 0$ und $f''(x_0) \neq 0$“.
- Vorzeichenwechsel: „VZW von $+$ nach $-$“ → Hochpunkt, „von $-$ nach $+$“ → Tiefpunkt. Vorzeichentabellen als HTML-Tabelle
  `<table class="wt">` mit Zeilen $x$, Vorzeichen von $f'(x)$, Verhalten von $f$ (↗ / ↘).
- Begriffe: lokales Maximum/Minimum, Hochpunkt/Tiefpunkt, Extremstelle (x-Wert) vs. Extrempunkt (Punkt), Sattelpunkt,
  streng monoton steigend/fallend. Globale Extrema nur am Rand erwähnen.
- **Regel A5:** kein Ergebnis bleibt unvereinfacht stehen (kein $1x$, $+\,-$, $x^1$, $\cdot 1$, $+0$). Brüche gekürzt, Wurzeln teilweise gezogen.
  In Rechenwegen direkt mit „=“ weiterrechnen.
- Gleichungen $f'(x) = 0$ sauber lösen: Ausklammern, Satz vom Nullprodukt, p-q- bzw. abc-Formel, Substitution bei $ax^4 + bx^2 + c$.
- **Jede Zahl muss stimmen.** Rechne jede Aufgabe und jedes Beispiel mit Python/sympy nach, bevor du es hinschreibst.
  Wähle Funktionen so, dass Extremstellen und Funktionswerte schön sind (ganzzahlig oder einfache Brüche).
- Sprache: Deutsch, „du“, generisches Maskulinum, keine Gendersprache. Kurze, klare Sätze. Nichts Erfundenes als echt ausgeben.

## Grafiken
`<graph>{JSON}</graph>` (Spezifikation oben in `build.mjs` über `function graph`, Beispiele in Band 1).
Waagrechte Tangente: `"gerade":[{"f":"…","tan":1,"c":"gold"}]`. Graph von $f'$ unter dem Graphen von $f$
(gleiche x-Achse, gleiche Breite) ist das Standardbild für den Zusammenhang f ↔ f′.
Farben: `see`, `seeTief`, `grana`, `gold`, `goldDunkel`, `goldTief`, `smaragd`, `lila`, `grau`.
**Sieh dir jede Grafik im PNG an** und korrigiere Überlappungen.

## Bauen und prüfen (Probe-Modus)
```
cd /home/claude/matheplus/schulbuch/kurvendiskussion
DIST=dist-I NUR="^0[3-8]-" node build.mjs
DIST=dist-I python3 render.py --png alle
```
Im Probe-Modus werden Verweise auf nicht gebaute Seiten zu „??“ – das ist in Ordnung.

## Lösungen
`loes/I.html` im Format von `../ableitungen/loesungen.html`: je Unterkapitel
`<h3>{{K:stamm-1}} Titel (Seite {{S:stamm-2}})</h3><div class="lk"><p><span class="an">1</span> …</p>…</div>`,
für die Trainingsseite `<h3>Training I (Seite {{S:training-extrempunkte}})</h3>`.
Auftakt-Check in `loes/check-I.html` als `<div class="lk"><h4>Seite {{S:auftakt-extrempunkte}} · Kapitel I</h4><p>…</p></div>`.

## Gliederung (Probekapitel)
01 cover · 02 inhalt
**Kapitel I · Extrempunkte** (Farbe smaragd): 03 auftakt-extrempunkte · 04/05 waagrecht-1/-2 · 06/07 vzw-1/-2 · 08 training-extrempunkte
Anhang: 09 rueckblick · 10 ff. loesungen · 97 register · 99 rueckseite

### Herleitungskette (verbindlich, von Basti vorgegeben)
1. **Die waagrechte Tangente (04/05):** An einem Hoch- oder Tiefpunkt ist die Tangente waagrecht → **notwendige Bedingung $f'(x_0) = 0$**.
   Gegenbeispiel $f(x) = x^3$ im Haupttext: $f'(0) = 0$, aber kein Extrempunkt → Sattelpunkt.
   ★ Für Interessierte: Sattelpunkt vertieft – warum $f'(x_0) = 0$ nicht reicht (Begründung über das Vorzeichen von $f'$ links und rechts; ggf. Fermat-Argument: Differenzenquotienten links ≥ 0, rechts ≤ 0 ⇒ $f'(x_0) = 0$).
2. **Vorzeichenwechsel und zweite Ableitung (06/07):** Vorzeichenwechsel von $f'$ als **hinreichende** Bedingung
   (aus der Tangentensteigung: $f' > 0$ heißt steigend, $f' < 0$ fallend), dann $f''(x_0) < 0$ bzw. $> 0$ als Abkürzung
   (f'' ist die Steigung von f' → f' fällt bei $x_0$ durch null → VZW von + nach −). Grenzen: bei $f''(x_0) = 0$ entscheidet der VZW
   (Beispiele $x^4$: Tiefpunkt, $x^3$: Sattelpunkt). Aufgaben mischen beide Kriterien.
   ★ Für Interessierte: Mittelwertsatz – warum $f' > 0$ auf einem Intervall wirklich „streng monoton steigend“ heißt.

## Der rote Faden des Bandes
1. **Die Tangente verrät die Kurve.** Was in Band 1 die Steigung in einem Punkt war, wird jetzt zum Werkzeug, um die ganze Kurve zu verstehen.
2. **Notwendig ist nicht hinreichend.** $f'(x_0) = 0$ findet Kandidaten; erst der Vorzeichenwechsel (oder $f''$) entscheidet.
3. **f, f′, f″ gehören zusammen.** Jede Aussage über $f$ wird an den Graphen von $f'$ (und $f''$) zurückgebunden.
