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
