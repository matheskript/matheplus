# Schulbuch „Dreiecksgeometrie“ (Band 4, Klasse 7–9) – Quelltext

Gleiche Bauweise wie Band 2 (`../vektoren`). Eine Datei pro Buchseite in `pages/`
(HTML, Formeln als `$…$`, ebene Figuren als `<figur>{JSON}</figur>`, Schrägbilder als `<raum>{JSON}</raum>`).
Stil- und Inhaltsregeln, Gliederung mit allen Stämmen: `STIL.md`.

Bauen:

    npm install                    # katex, Montserrat
    python3 loesungen-sammeln.py   # loes/*.html → loesungen.html
    python3 loesungen-verteilen.py # → Seiten 56 ff. (baut dabei mehrfach)
    node build.mjs                 # → dist/buch.html
    python3 render.py              # → dist/Dreiecksgeometrie.pdf, meldet Überlauf je Seite
    node viewer.mjs ../../matheskript-v80-deploy
    rm -rf ../../matheskript-v80-deploy/public/buecher/dreiecksgeometrie
    cp -r dist/viewer ../../matheskript-v80-deploy/public/buecher/dreiecksgeometrie

Einzelne Kapitel testen (Probe-Modus, Dateinummer = Seitenzahl; ohne loesungen.html läuft der Probe-Modus ohne Lösungen weiter):

    DIST=dist-III NUR="^(2[3-8])-" node build.mjs && DIST=dist-III python3 render.py --png alle

Querverweise nie als feste Zahl, sondern als Token: `{{S:stamm}}` Seitenzahl, `{{K:stamm}}` Nummer des
Unterkapitels, `{{T:stamm}}` Titel (stamm = Dateiname ohne Nummer).

Ebene Figur (`<figur>`, Renderer `function figur` in `build.mjs`): flaeche, strecke (t, ab, seite), punkt, kreis,
bogen, winkel (recht), text, gerade, gitter; „_“ setzt einen Index.
Bekannte Grenzen (Schreiber haben sich beholfen):
- `bogen` und `kreis` rechnen den ganzen Kreis in den Bildausschnitt – Teilbögen daher oft aus Strecken gebaut.
- `gerade` wird nicht am Bildrand abgeschnitten – stattdessen lange `strecke`.
- Keine Maßlinie mit Endstrichen, kein Text ohne Linie (Behelf: Strecke mit Breite 0.01).
- `<raum>`-Quader: der Ausschnitt rechnet nur `von`/`bis` ein.

QR-Codes: für Band 4 **aus** (`QR` nicht gesetzt). Offen: Bandschlüssel `b4` in `src/pfade.js` und `BUCH_TYPEN`
(welche Buchaufgabe welchen App-Aufgabentyp hat) – erst dann mit `QR=1` bauen.
Druckausgabe für Amazon: noch nicht gebaut, siehe `../kdp/LIESMICH.md` (`kdp.json` liegt bereit).
