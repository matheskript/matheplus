# Stilvorlage · Mythos-Mathe-Schulbuch „Vektoren, Geraden und Ebenen“ (Band 2)

Das Buch muss in Stil, Aufbau und Qualität **exakt** wie Band 1 „Ableitungen“ aussehen
(`../ableitungen/pages/`). Lies vor dem Schreiben mindestens diese Vorbildseiten vollständig:
`03-auftakt-grundlagen.html` (Auftakt), `04-geraden-1.html` + `05-geraden-2.html` (Unterkapitel als Doppelseite),
`14-diffquot-1.html` + `15-diffquot-2.html`, `28-produktregel-1.html` + `29-produktregel-2.html`,
`10-training-grundlagen.html` (Trainingsseite), `../ableitungen/loesungen.html` (Lösungsstil).
Alle CSS-Klassen stehen in `buch.css`. Erfinde keine neuen Klassen, nutze die vorhandenen.

## Seitendateien
- Eine Datei = eine A4-Seite. **Dateinummer = Seitenzahl** (zweistellig), z. B. `22-parameter-1.html`.
  Ungerade Seite = rechte Seite (Randspalte rechts), gerade = linke Seite (Randspalte links) – das macht der Build automatisch.
- Erste Zeile ist die Meta-Zeile:
  - Auftakt: `<!-- kap: III | typ: auftakt -->`
  - Beginn eines Unterkapitels: `<!-- kap: III | uk: Geraden in Parameterform -->`
  - Fortsetzungsseite: `<!-- kap: III -->`
  - Trainingsseite: `<!-- kap: III | ukap: Alles klar? Training III -->`
- Inhalt: Hauptspalte, dann `<!--rand-->`, dann die Randspalte (Notizen).
- Verweise **nie** als feste Zahl: `{{S:stamm}}` Seitenzahl, `{{K:stamm}}` Nummer des Unterkapitels,
  `{{T:stamm}}` Titel. `stamm` = Dateiname ohne Nummer und `.html` (z. B. `{{S:parameter-1}}`).
  Lösungen beginnen bei `{{S:loesungen-1}}`. Verweise in andere Kapitel sind erlaubt (Stämme siehe Gliederung unten).

## Aufbau eines Unterkapitels (Doppelseite = eine Unterrichtsstunde)
Seite 1: `ukap-titel` mit `{{K:…}}`-Nummer, `leitfrage`, Kasten `einstieg` (Frage/Experiment mit a) b) c)),
Herleitung im Fließtext (selbst hergeleitet, nicht hingestellt!), Kasten `merke`, `beispiel` mit `loesung`.
Rand: `notiz stunde` (Ablauf der Stunde + Hausaufgabe), `notiz` (Wortspeicher / Erinnerung), `notiz gold` (Tipp).
Seite 2: weiteres Beispiel, ggf. `achtung`, ggf. `vertiefung` („★ Für Interessierte“: exakte Begründung/Beweis),
dann `aufgaben-kopf` und **7–9 Aufgaben** in drei Stufen (●○○ / ●●○ / ●●●, letzte als `z offen` = Vertiefung),
mit Teilaufgaben in `.teil` (Spaltenzahl `--sp`). Rand: Tipps zu einzelnen Aufgaben, genau **eine** `notiz mathilda`
„In der App“ mit dem passenden Werkzeug (Namen exakt so schreiben, sonst entsteht kein App-Knopf):
`Rechnen mit Vektoren`, `Zwei Punkte – eine Gerade`, `Drei Punkte – eine Ebene`, `Ebenen-Visualizer`,
`Geraden im Raum`, `Ebene vs. Ebene`, `Abstände`, `Kreuzprodukt`, `Winkel und Skalarprodukt`,
`Gleichungssysteme`, `Werkzeug Geraden` (2D-Geraden y = mx + c), `Meine Fehler üben`, `Abi-Ketten`, `Mathilda`.

Auftaktseite: wie `03-auftakt-grundlagen.html` – farbiger Kopf mit Kapitelfrage, Einstiegsbild + „Die Frage des Kapitels“,
Tabelle „Das kannst du schon – kurzer Check“ (4 Zeilen, Lösungen im Lösungsteil), Lernziele, Liste der Unterkapitel,
großes blasses Symbol oben rechts (wie das „m“ in Band 1).
Trainingsseite: wie `10-training-grundlagen.html` – Selbsteinschätzung „Ich kann …“ mit Seitenverweisen, 7–8 Aufgaben T1…T8.

**Jede Seite muss voll, aber ohne Überlauf sein** (nach `render.py` „frei haupt“ zwischen etwa 0 und 60 px; kein `<--`-Hinweis).
Eine halbleere Seite ist ein Fehler – dann ergänzen (Beispiel, Aufgabe, Abbildung).

## Mathematik und Schreibweise
- Formeln in KaTeX: `$…$` inline, `$$…$$` abgesetzt. Dezimalkomma `{,}` (z. B. `2{,}5`). Mal: `\cdot`.
- Punkte im Raum: `$P(1 \mid -2 \mid 3)$`. Vektoren: `$\vec{u}$`, Spaltenvektoren `$\begin{pmatrix} 1 \\ -2 \\ 3 \end{pmatrix}$`
  (in Datei-HTML einfache Backslashes, es ist kein JS-String). Verbindungsvektor `$\overrightarrow{AB}$`. Betrag `$|\vec{u}|$`.
  Ortsvektor `$\vec{p} = \overrightarrow{OP}$`. Skalarprodukt `$\vec{a} \cdot \vec{b}$`, Kreuzprodukt `$\vec{a} \times \vec{b}$`.
  Geraden: `$g\colon \vec{x} = \vec{p} + t \cdot \vec{u}$`, Ebenen `$E\colon \vec{x} = \vec{p} + r \cdot \vec{u} + s \cdot \vec{v}$`,
  `$E\colon (\vec{x} - \vec{p}) \cdot \vec{n} = 0$`, `$E\colon 2x_1 - x_2 + 3x_3 = 6$`. Koordinaten heißen $x_1, x_2, x_3$.
- **Regel A5:** kein Ergebnis bleibt unvereinfacht stehen (kein $1x$, $+\,-$, $x^1$, $\cdot 1$, $+0$). Brüche gekürzt, Wurzeln teilweise gezogen ($\sqrt{8} = 2\sqrt{2}$).
- LGS: Gleichungen untereinander mit `\begin{aligned} … &= … \\ … \end{aligned}` bzw. `\begin{array}{rcl}`; Zeilen mit (I), (II), (III) beschriften (`\text{(I)}`).
- **Jede Zahl muss stimmen.** Rechne jede Aufgabe und jedes Beispiel mit Python/sympy nach, bevor du es hinschreibst.
  Wähle Zahlen so, dass Ergebnisse schön sind (ganzzahlig oder einfache Brüche/Wurzeln), außer es geht gerade um Näherungswerte (Winkel in Grad, eine Nachkommastelle).
- Sprache: Deutsch, „du“, generisches Maskulinum, keine Gendersprache. Kurze, klare Sätze. Nichts Erfundenes als echt ausgeben.

## Grafiken
2D wie Band 1: `<graph>{JSON}</graph>` (Spezifikation oben in `build.mjs`, Beispiele in Band 1).
3D-Schrägbild: `<raum>{JSON}</raum>` (Spezifikation in `build.mjs` über `function raum`). Kurzfassung:
```
{"b":60,"h":48, "achsen":[4,4,4], "neg":[0.6,0.6,0.6], "zahlen":true|false, "alleZahlen":true,
 "punkt":[{"p":[3,4,2],"t":"P","pos":"or","c":"seeTief","lot":true}],
 "vektor":[{"p":[0,0,0],"v":[3,4,2],"t":"p","c":"grana","pos":"ul"}],      // t wird mit Pfeil darüber gesetzt
 "strecke":[{"p":[..],"q":[..],"c":"see","d":"3 2","pfeil":true,"t":"..."}],
 "gerade":[{"p":[1,1,1],"u":[1,-1,2],"von":-1,"bis":1.5,"c":"grana","t":"g"}],
 "flaeche":[{"pkte":[[4,0,0],[0,4,0],[0,0,4]],"c":"see","o":0.16,"t":"E","tp":[1.3,1.3,1.3]}],
 "quader":[{"von":[0,0,0],"bis":[3,4,2]}], "winkel":[{"s":[..],"a":[..],"b":[..],"t":"α"}],
 "text":[{"p":[..],"t":"...","pos":"m"}], "keineAchsen":true}
```
Farben: `see`, `seeTief`, `grana`, `gold`, `goldDunkel`, `goldTief`, `smaragd`, `lila`, `grau`. Ebenen als Spurdreieck oder als
Parallelogrammstück (`flaeche`) zeichnen. Raumbilder in der Hauptspalte meist 50–70 mm breit, im Einstieg ~40–48 mm.
Pos-Werte: o, u, l, r, ol, or, ul, ur, m. **Sieh dir jede Grafik im PNG an** und korrigiere Überlappungen.

## Bauen und prüfen (Probe-Modus, damit parallele Kapitel sich nicht stören)
```
cd /home/claude/matheplus/schulbuch/vektoren
DIST=dist-III NUR="^(2[1-6])-" node build.mjs
DIST=dist-III python3 render.py --png alle      # druckt "frei"-Werte, PNGs in dist-III/png/sNN.png (NN = Dateinummer-Reihenfolge ab 1)
```
Im Probe-Modus werden Verweise in andere Kapitel zu „??“ – das ist in Ordnung. Schau dir **jede** Seite als PNG an
(Read-Tool) und bessere nach, bis alles sauber aussieht (keine Überlappungen in Grafiken, keine halbleeren Seiten).

## Lösungen
Schreibe die Lösungen deines Kapitels nach `loes/<KAPITEL>.html` (z. B. `loes/III.html`) im Format von
`../ableitungen/loesungen.html`: je Unterkapitel ein Abschnitt
`<h3>{{K:stamm-1}} Titel (Seite {{S:stamm-2}})</h3><div class="lk"><p><span class="an">1</span> …</p>…</div>`,
für die Trainingsseite `<h3>Training III (Seite {{S:training-…}})</h3>`.
Die Lösung des Auftakt-Checks in `loes/check-<KAPITEL>.html` als
`<div class="lk"><h4>Seite {{S:auftakt-…}} · Kapitel III</h4><p>…</p></div>`.
Lösungen knapp, aber mit Zwischenergebnissen (wie Band 1). Alles mit sympy geprüft.

## Gliederung des ganzen Buchs (Stämme für Verweise)
01 cover · 02 inhalt
**Kapitel I · Geraden und Gleichungssysteme** (Farbe goldTief): 03 auftakt-lgs · 04/05 zwei-geraden-1/-2 · 06/07 gauss-1/-2 · 08/09 loesungsmengen-1/-2 · 10 training-lgs
**Kapitel II · Vektoren im Raum** (see): 11 auftakt-vektoren · 12/13 raum-1/-2 · 14/15 vektoren-1/-2 · 16/17 rechnen-1/-2 · 18/19 linear-1/-2 · 20 training-vektoren
**Kapitel III · Geraden im Raum** (grana): 21 auftakt-geraden · 22/23 parameter-1/-2 · 24/25 lage-geraden-1/-2 · 26 training-geraden
**Kapitel IV · Skalarprodukt und Kreuzprodukt** (seeTief): 27 auftakt-produkte · 28/29 skalar-1/-2 · 30/31 winkel-1/-2 · 32/33 kreuz-1/-2 · 34 training-produkte
**Kapitel V · Ebenen** (smaragd): 35 auftakt-ebenen · 36/37 ebene-param-1/-2 · 38/39 normalenform-1/-2 · 40/41 spurpunkte-1/-2 · 42/43 gerade-ebene-1/-2 · 44/45 ebene-ebene-1/-2 · 46 training-ebenen
**Kapitel VI · Abstände, Winkel, Spiegelungen** (lila): 47 auftakt-abstaende · 48/49 hnf-1/-2 · 50/51 punkt-gerade-1/-2 · 52/53 gerade-gerade-1/-2 · 54/55 schnittwinkel-1/-2 · 56/57 spiegeln-1/-2 · 58 training-abstaende
Anhang: 59 abitur · 60 rueckblick · 61 ff. loesungen · register · rueckseite

## Der rote Faden des Buchs (bitte in jedem Kapitel spürbar machen)
1. **Gleiche Struktur überall:** $y = m \cdot x + c$ ist schon eine „Parameterform“: $\begin{pmatrix} x \\ y \end{pmatrix} = \begin{pmatrix} 0 \\ c \end{pmatrix} + x \cdot \begin{pmatrix} 1 \\ m \end{pmatrix}$ –
   Stützvektor + Parameter · Richtungsvektor. Im Raum wird daraus $\vec{x} = \vec{p} + t \cdot \vec{u}$, bei Ebenen kommt ein zweiter Richtungsvektor dazu.
2. **Lage = Gleichungssystem:** Schnitt zweier Geraden in der Ebene = LGS mit 2 Gleichungen; Lage zweier Raumgeraden, Gerade–Ebene,
   Schnitt dreier Ebenen = LGS mit 3 Unbekannten. Keine / eine / unendlich viele Lösungen ↔ parallel / Schnittpunkt / identisch.
3. **Normalenvektor:** In 2D ist $ax + by = c$ eine Gerade mit Normalenvektor $\binom{a}{b}$; im Raum ist $ax_1 + bx_2 + cx_3 = d$ eine Ebene mit $\vec{n}$.
   Skalarprodukt = 0 heißt senkrecht; daraus folgen Normalenform, Abstände (HNF) und Schnittwinkel.
