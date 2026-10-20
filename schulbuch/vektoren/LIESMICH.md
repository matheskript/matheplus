# Schulbuch „Vektoren, Geraden und Ebenen“ (Band 2) – Quelltext

Gleiche Bauweise wie Band 1 (`../ableitungen`). Eine Datei pro Buchseite in `pages/`
(HTML, Formeln als `$…$`, 2D-Grafiken als `<graph>{JSON}</graph>`, Raumbilder als `<raum>{JSON}</raum>`).
Stil- und Inhaltsregeln: `STIL.md`.

Bauen:

    npm install                    # katex, Montserrat
    python3 loesungen-sammeln.py   # loes/*.html → loesungen.html
    python3 loesungen-verteilen.py # → Seiten 61 ff. (baut dabei mehrfach)
    node build.mjs                 # → dist/buch.html
    python3 render.py              # → dist/Vektoren.pdf, meldet Überlauf je Seite
    node viewer.mjs ../../matheskript-v80-deploy
    rm -rf ../../matheskript-v80-deploy/public/buecher/vektoren
    cp -r dist/viewer ../../matheskript-v80-deploy/public/buecher/vektoren

Einzelne Kapitel testen, ohne andere zu stören (Probe-Modus, Dateinummer = Seitenzahl):

    DIST=dist-III NUR="^(2[1-6])-" node build.mjs && DIST=dist-III python3 render.py --png alle

Querverweise nie als feste Zahl, sondern als Token: `{{S:stamm}}` Seitenzahl, `{{K:stamm}}` Nummer des
Unterkapitels, `{{T:stamm}}` Titel (stamm = Dateiname ohne Nummer).

Raumbild (`<raum>`): Schrägbild wie im Heft (x₂ rechts, x₃ oben, x₁ schräg mit Verkürzung ½·√2).
Elemente: punkt (mit `lot` für den Koordinatenweg), vektor, strecke, gerade, flaeche (Ebenenstück/Spurdreieck),
quader, winkel, text. Spezifikation in `build.mjs` über `function raum`.

QR-Codes und Druckausgabe (seit 20.10.2026):
- `node build.mjs` baut in zwei Durchgängen: misst den freien Platz je Seite (`render.py --messen`) und setzt dann
  die QR-Codes zu jeder Aufgabe mit Typ (`../../matheskript-v80-deploy/src/vekAufgaben*.js`, BUCH_TYPEN) in die Form,
  die passt (`../qr.mjs`). `QR=0 node build.mjs` baut ohne Codes. Der „In der App“-Kasten bekommt immer einen Code.
- Neue Buchaufgabe mit Typ: in `BUCH_4` o. Ä. eintragen, `node build.mjs`, Viewer neu kopieren – der Code erscheint von selbst.
- Druckausgabe für Amazon: siehe `../kdp/LIESMICH.md`.
