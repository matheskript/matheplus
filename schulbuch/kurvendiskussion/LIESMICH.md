# Schulbuch „Kurvendiskussion“ (Band 3) – Quelltext

Probekapitel (Kapitel I „Extrempunkte“). Gleiche Bauweise wie Band 1 (`../ableitungen`) und Band 2 (`../vektoren`).
Eine Datei pro Buchseite in `pages/` (HTML, Formeln als `$…$`, Grafiken als `<graph>{JSON}</graph>`).
Stil- und Inhaltsregeln: `STIL.md`.

Bauen:

    npm install                    # katex, Montserrat
    python3 loesungen-sammeln.py   # loes/*.html → loesungen.html
    python3 loesungen-verteilen.py # → Seiten 10 ff. (baut dabei mehrfach)
    node build.mjs                 # → dist/buch.html
    python3 render.py              # → dist/Kurvendiskussion.pdf, meldet Überlauf je Seite
    node viewer.mjs ../../matheskript-v80-deploy
    rm -rf ../../matheskript-v80-deploy/public/buecher/kurvendiskussion
    cp -r dist/viewer ../../matheskript-v80-deploy/public/buecher/kurvendiskussion

Einzelne Seiten testen (Probe-Modus, Dateinummer = Seitenzahl):

    DIST=dist-I NUR="^0[3-8]-" node build.mjs && DIST=dist-I python3 render.py --png alle

Querverweise nie als feste Zahl, sondern als Token: `{{S:stamm}}` Seitenzahl, `{{K:stamm}}` Nummer des
Unterkapitels, `{{T:stamm}}` Titel (stamm = Dateiname ohne Nummer).

Weitere Kapitel: neue Kapitelnummer in `KAPFARBE`/`KAPNAME` (`build.mjs`) und in `loesungen-sammeln.py` ergänzen,
`START` in `loesungen-verteilen.py` anpassen.

QR-Codes (seit 21.10.2026, wie Band 1 und 2): `node build.mjs` misst den Platz je Seite und setzt die Codes
(`../qr.mjs`). Aufgabentypen und Generatoren: `../../matheskript-v80-deploy/src/kurvAufgaben.js` (`BUCH_TYPEN`,
Test `tests/kurvAufgaben.test.mjs`). Kurzlinks `/b3/<Seite>-<Nr>` und `/b3/s<Seite>`; `/b3` öffnet, solange es
keinen Kurs gibt, das Werkzeug Kurvendiskussion (`BUECHER[3]` in `src/pfade.js`).
Neue Buchaufgabe mit Typ: in `BUCH_TYPEN` eintragen, `node build.mjs`, Viewer neu kopieren.
Gedruckte Seiten- und Aufgabennummern nie ändern – die Codes zeigen darauf.
`QR=0 node build.mjs` baut ohne Codes. Druckausgabe (KDP) braucht noch eine `kdp.json` (Vorlage: `../vektoren/kdp.json`).
