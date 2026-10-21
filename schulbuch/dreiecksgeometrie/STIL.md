# Stilvorlage · Mythos-Mathe-Schulbuch „Dreiecksgeometrie“ (Band 4, Klasse 7 bis 9)

Das Buch muss in Stil, Aufbau und Qualität **exakt** wie Band 1 „Ableitungen“ und Band 2 „Vektoren, Geraden und Ebenen“
aussehen. Lies vor dem Schreiben mindestens diese Vorbildseiten vollständig:
`../ableitungen/pages/03-auftakt-grundlagen.html` (Auftakt), `../ableitungen/pages/04-geraden-1.html` + `05-geraden-2.html`
(Unterkapitel als Doppelseite), `../ableitungen/pages/10-training-grundlagen.html` (Trainingsseite),
`../vektoren/pages/12-raum-1.html` + `13-raum-2.html` (Grafik in Einstieg und Beispiel), `../ableitungen/loesungen.html` (Lösungsstil).
Alle CSS-Klassen stehen in `buch.css`. Erfinde keine neuen Klassen, nutze die vorhandenen.

**Zielgruppe:** Klasse 7 bis 9 (Gymnasium, Bildungsplan Baden-Württemberg). Sprache einfacher als in Band 1/2: kurze Sätze,
jeder Fachbegriff wird beim ersten Auftreten erklärt (Wortspeicher in der Randspalte), viele Bilder. Trotzdem gilt:
**nichts wird hingestellt, alles wird hergeleitet** – auf dem Niveau der Klasse (Zerlegen, Ergänzen, Falten, Messen, Begründen).

## Seitendateien
- Eine Datei = eine A4-Seite. **Dateinummer = Seitenzahl** (zweistellig), z. B. `30-pythagoras-1.html`.
  Ungerade Seite = rechte Seite (Randspalte rechts), gerade = linke Seite (Randspalte links) – das macht der Build automatisch.
- Erste Zeile ist die Meta-Zeile:
  - Auftakt: `<!-- kap: IV | typ: auftakt -->`
  - Beginn eines Unterkapitels: `<!-- kap: IV | uk: Der Satz des Pythagoras -->`
  - Fortsetzungsseite: `<!-- kap: IV -->`
  - Trainingsseite: `<!-- kap: IV | ukap: Alles klar? Training IV -->`
- Inhalt: Hauptspalte, dann `<!--rand-->`, dann die Randspalte (Notizen).
- Verweise **nie** als feste Zahl: `{{S:stamm}}` Seitenzahl, `{{K:stamm}}` Nummer des Unterkapitels, `{{T:stamm}}` Titel.
  `stamm` = Dateiname ohne Nummer und `.html` (z. B. `{{S:pythagoras-1}}`). Im Text heißt es „Unterkapitel {{K:…}}“, nicht „Kapitel“.
  Lösungen beginnen bei `{{S:loesungen-1}}`. Verweise in andere Kapitel sind erlaubt (Stämme siehe Gliederung).

## Aufbau eines Unterkapitels (Doppelseite = eine Unterrichtsstunde)
Seite 1: `ukap-titel` mit `{{K:…}}`-Nummer, `leitfrage`, Kasten `einstieg` (Frage/Experiment – Ausschneiden, Falten, Zeichnen,
Messen – mit a) b) c)), Herleitung im Fließtext, Kasten `merke`, `beispiel` mit `loesung`.
Rand: `notiz stunde` (Ablauf der Stunde + Hausaufgabe), `notiz` (Wortspeicher), `notiz gold` (Tipp).
Seite 2: weiteres Beispiel, ggf. `achtung` (typischer Fehler), ggf. `vertiefung` („★ Für Interessierte“: Beweis oder Sonderfall),
dann `aufgaben-kopf` und **7–9 Aufgaben** in drei Stufen (●○○ / ●●○ / ●●●, letzte als `z offen` = Vertiefung),
mit Teilaufgaben in `.teil` (Spaltenzahl `--sp`). Mindestens eine Aufgabe je Doppelseite ist eine Konstruktion oder
Begründung, mindestens eine eine Sachaufgabe. Rand: Tipps zu einzelnen Aufgaben, genau **eine** `notiz mathilda`
„In der App“ mit dem passenden Werkzeug. Namen **exakt** so schreiben (sonst entsteht kein App-Knopf), und nur zusagen,
was das Werkzeug wirklich kann:
- `Umfang und Flächeninhalt` – jede Flächenformel aus dem Rechteck hergeleitet, dazu zusammengesetzte Figuren.
- `Winkel und Winkelsummen` – Scheitel-, Stufen- und Wechselwinkel, Winkelsumme im Dreieck und im n-Eck.
- `Kongruenzsätze` – wann drei Stücke ein Dreieck festlegen; Konstruktionen und Begründen an Figuren.
- `Besondere Linien im Dreieck` – Mittelsenkrechte, Winkelhalbierende, Höhe, Seitenhalbierende und ihre Schnittpunkte.
- `Satz des Thales` – Winkel im Halbkreis, mit Beweis, Umkreis und Tangente.
- `Satz des Pythagoras` – fehlende Seiten, Umkehrung, Sachaufgaben, Raumdiagonale.
- `Kathetensatz und Höhensatz` – flächengleiche Quadrate und Rechtecke im rechtwinkligen Dreieck.
- `Strahlensätze` – V- und X-Figur, fehlende Längen über Verhältnisse, Streckfaktor k.
- `Trigonometrie` – Einheitskreis, sin, cos, tan, bis zum Kosinussatz.
- `Kreis und Kreisteile` (nur für Umfang/Fläche des Kreises, falls nötig), `Meine Fehler üben`, `Mathilda` (Foto vom Blatt).

Auftaktseite: wie `../ableitungen/pages/03-auftakt-grundlagen.html` – farbiger Kopf mit Kapitelfrage, Einstiegsbild +
„Die Frage des Kapitels“, Tabelle „Das kannst du schon – kurzer Check“ (4 Zeilen, Lösungen im Lösungsteil), Lernziele,
Liste der Unterkapitel, großes blasses Symbol oben rechts (z. B. △, ∠, ○, a², ∼, sin).
Trainingsseite: wie `10-training-grundlagen.html` – Selbsteinschätzung „Ich kann …“ mit Seitenverweisen, 7–8 Aufgaben T1…T8.

**Jede Seite muss voll, aber ohne Überlauf sein** (nach `render.py` „frei haupt“ zwischen etwa 0 und 60 px; kein `<--`-Hinweis).
Eine halbleere Seite ist ein Fehler – dann ergänzen (Beispiel, Aufgabe, Abbildung).

## Mathematik und Schreibweise
- Formeln in KaTeX: `$…$` inline, `$$…$$` abgesetzt. Dezimalkomma `{,}` (z. B. `2{,}5`). Mal: `\cdot`. Einheiten mit Leerraum: `$12\,\text{cm}^2$`.
- Dreieck $ABC$: Ecken **gegen den Uhrzeigersinn**, Seite $a$ liegt $A$ gegenüber ($a = \overline{BC}$), Winkel $\alpha$ bei $A$, $\beta$ bei $B$, $\gamma$ bei $C$.
  Im rechtwinkligen Dreieck ist $\gamma = 90^\circ$, $c$ die Hypotenuse, $a$ und $b$ die Katheten, $h_c$ die Höhe auf $c$, $p$ und $q$ die Hypotenusenabschnitte
  ($p$ unter $a$, $q$ unter $b$). Strecke $\overline{AB}$, ihre Länge $|\overline{AB}|$ oder kurz $c$. Winkel $\sphericalangle BAC$ oder $\alpha$.
- Flächeninhalt $A$ – steht im selben Bild ein Punkt $A$, schreibe $A_\triangle$ oder $A_\text{Rechteck}$. Umfang $u$.
- Kongruent $\cong$, ähnlich $\sim$, parallel $\parallel$, senkrecht $\perp$. Streckfaktor $k$.
- Trigonometrie: $\sin\alpha = \dfrac{\text{Gegenkathete}}{\text{Hypotenuse}}$ (Text in `\text{}`), Winkel in Grad mit einer Nachkommastelle, Längen gerundet auf mm.
- **Regel A5:** kein Ergebnis bleibt unvereinfacht stehen (kein $1x$, $+\,-$, $\cdot 1$, $+0$). Brüche gekürzt, Wurzeln teilweise gezogen ($\sqrt{8} = 2\sqrt{2}$),
  Wurzelzeichen immer per `\sqrt{…}` (nie „√“ als Zeichen).
- **Jede Zahl muss stimmen.** Rechne jede Aufgabe und jedes Beispiel mit Python/sympy nach, bevor du es hinschreibst.
  Wähle Zahlen so, dass Ergebnisse schön sind (pythagoreische Tripel 3-4-5, 5-12-13, 8-15-17, 7-24-25 …), außer es geht gerade um Näherungswerte.
- Sprache: Deutsch, „du“, generisches Maskulinum, keine Gendersprache. Nichts Erfundenes als echt ausgeben (keine erfundenen Messwerte „aus der Zeitung“).

## Grafiken
**Ebene Figuren** (neu in Band 4): `<figur>{JSON}</figur>` – Spezifikation über `function figur` in `build.mjs`. Gleicher Maßstab in x und y.
```
{"b":60,"h":42, "gitter":0|1,
 "flaeche":[{"pkte":[[0,0],[6,0],[2,3]],"c":"see","o":0.16}],
 "strecke":[{"p":[2,3],"q":[2,0],"c":"grana","d":"5 4","t":"h_c","seite":"innen"}],
 "punkt":[{"p":[0,0],"t":"A","pos":"ul"},{"p":[6,0],"t":"B","pos":"ur"},{"p":[2,3],"t":"C","pos":"o"}],
 "winkel":[{"s":[2,0],"a":[6,0],"b":[2,3],"recht":true},{"s":[0,0],"a":[6,0],"b":[2,3],"t":"α"}],
 "kreis":[{"m":[3,0],"r":3,"c":"grau","d":"4 4"}], "bogen":[{"m":[3,0],"r":3,"von":0,"bis":180}],
 "gerade":[{"p":[0,0],"q":[1,1],"c":"grau"}], "text":[{"p":[3,1],"t":"A = 9 cm²"}]}
```
Beschriftung: `"h_c"` setzt „c“ tiefgestellt, einzelne Buchstaben werden kursiv. Seitenlänge an eine Strecke: `"t":"a"`; Abstand mit `"ab"` (px),
nach innen mit `"seite":"innen"`. Winkel: der kleinere zwischen Strahl s→a und s→b; `"recht":true` = Quadrat mit Punkt.
Farben: `see`, `seeTief`, `grana`, `gold`, `goldDunkel`, `goldTief`, `smaragd`, `lila`, `grau`. Figuren in der Hauptspalte 45–75 mm breit,
im Einstieg oder in der Randspalte 30–40 mm. Koordinaten wählen, dass die Figur maßstäblich stimmt (Winkel, die 90° sein sollen, sind es auch).
Funktionsgraphen (nur selten, z. B. in VI) wie Band 1 mit `<graph>`. **Sieh dir jede Grafik im PNG an** und korrigiere Überlappungen.

## Bauen und prüfen (Probe-Modus, damit parallele Kapitel sich nicht stören)
```
cd /home/claude/matheplus/schulbuch/dreiecksgeometrie
DIST=dist-IV NUR="^(29|3[0-6])-" node build.mjs
DIST=dist-IV python3 render.py --png alle      # druckt "frei"-Werte, PNGs in dist-IV/png/sNN.png (NN = Reihenfolge ab 1)
```
Im Probe-Modus werden Verweise in andere Kapitel zu „??“ – das ist in Ordnung. Schau dir **jede** Seite als PNG an.

## Lösungen
`loes/<KAPITEL>.html` (z. B. `loes/IV.html`) im Format von `../ableitungen/loesungen.html`: je Unterkapitel
`<h3>{{K:stamm-1}} Titel (Seite {{S:stamm-2}})</h3><div class="lk"><p><span class="an">1</span> …</p>…</div>`,
Trainingsseite `<h3>Training IV (Seite {{S:training-…}})</h3>`. Auftakt-Check in `loes/check-<KAPITEL>.html` als
`<div class="lk"><h4>Seite {{S:auftakt-…}} · Kapitel IV</h4><p>…</p></div>`. Konstruktionen: Konstruktionsbeschreibung in Stichworten.

## Gliederung des ganzen Buchs (Stämme für Verweise)
01 cover · 02 inhalt
**Kapitel I · Flächen** (goldTief): 03 auftakt-flaechen · 04/05 rechteck-1/-2 (Rechteck und Quadrat) · 06/07 rechtwinklig-1/-2 (Das rechtwinklige Dreieck – ein halbes Rechteck) · 08/09 dreieck-flaeche-1/-2 (Jedes Dreieck: Grundseite mal Höhe durch 2) · 10/11 vierecke-1/-2 (Parallelogramm, Trapez und Drachen) · 12 training-flaechen
**Kapitel II · Winkel und Konstruktionen** (see): 13 auftakt-winkel · 14/15 winkel-geraden-1/-2 (Winkel an Geraden) · 16/17 winkelsumme-1/-2 (Die Winkelsumme im Dreieck) · 18/19 kongruenz-1/-2 (Kongruente Dreiecke) · 20/21 linien-1/-2 (Besondere Linien im Dreieck) · 22 training-winkel
**Kapitel III · Dreieck und Kreis** (grana): 23 auftakt-kreis · 24/25 umkreis-inkreis-1/-2 (Umkreis und Inkreis) · 26/27 thales-1/-2 (Der Satz des Thales) · 28 training-kreis
**Kapitel IV · Der Satz des Pythagoras** (seeTief): 29 auftakt-pythagoras · 30/31 pythagoras-1/-2 (Der Satz des Pythagoras) · 32/33 pythagoras-anwenden-1/-2 (Pythagoras anwenden und umkehren) · 34/35 kathetensatz-1/-2 (Kathetensatz und Höhensatz) · 36 training-pythagoras
**Kapitel V · Ähnlichkeit** (smaragd): 37 auftakt-aehnlichkeit · 38/39 verhaeltnisse-1/-2 (Vergrößern und Verkleinern) · 40/41 strahlensaetze-1/-2 (Die Strahlensätze) · 42/43 aehnliche-dreiecke-1/-2 (Ähnliche Dreiecke) · 44 training-aehnlichkeit
**Kapitel VI · Trigonometrie** (lila): 45 auftakt-trigo · 46/47 sinus-kosinus-1/-2 (Sinus, Kosinus und Tangens) · 48/49 seiten-winkel-1/-2 (Seiten und Winkel berechnen) · 50/51 trigo-anwenden-1/-2 (Trigonometrie anwenden) · 52 training-trigo
Anhang: 53/54 klassenarbeit-1/-2 (Klassenarbeits-Training) · 55 rueckblick · 56 ff. loesungen · 97 register · 99 rueckseite
Der **Kreis als Figur** (Radius, Sehne, Tangente, Umkreis, Inkreis, Thales) gehört hierher; **Umfang, π und Kreisfläche** kommen erst in Band 5 „Kreis und Körper“ – nicht vorwegnehmen.

## Die Herleitungskette (von Basti vorgegeben – nicht umbauen)
Rechteck: Fläche = Anzahl Einheitsquadrate = $a \cdot b$ → das rechtwinklige Dreieck ist ein **halbes Rechteck**: $A = \frac{1}{2} a \cdot b$ →
**jedes** Dreieck zerfällt an der Höhe in zwei rechtwinklige Dreiecke: $A = \frac{1}{2} g \cdot h$. Liegt der Höhenfußpunkt außerhalb
(stumpfwinkliges Dreieck), ist das Dreieck die **Differenz** zweier rechtwinkliger Dreiecke – eigener Kasten „Und wenn die Höhe außen liegt?“.
Daraus Parallelogramm, Trapez, Drachen. Pythagoras wird **über Flächen** hergeleitet (Quadrate zerlegen und umlegen), die Trigonometrie
**aus der Ähnlichkeit** (gleicher Winkel → gleiches Seitenverhältnis → sin, cos, tan sind wohldefiniert).

## Der rote Faden des Buchs (in jedem Kapitel spürbar machen)
1. **Alles beginnt beim Rechteck.** Jede Flächenformel und auch Pythagoras werden auf Rechtecke und Quadrate zurückgeführt.
2. **Zerlegen und Ergänzen.** Schwierige Figuren werden in bekannte zerlegt oder zu bekannten ergänzt – Summe oder Differenz.
3. **Das rechtwinklige Dreieck ist das Werkzeug.** Höhen erzeugen rechte Winkel; daraus folgen Flächen, Pythagoras, Thales und die Trigonometrie.
