# Schulbuch „Ableitungen“ – Quelltext

Eine Datei pro Buchseite in `pages/` (HTML, Formeln als `$…$`, Grafiken als `<graph>{JSON}</graph>`).

Bauen:

    npm install                 # katex, Montserrat
    node build.mjs              # → dist/buch.html
    python3 render.py           # → dist/Ableitungen.pdf, meldet Überlauf je Seite
    node viewer.mjs ../../matheskript-v80-deploy
    rm -rf ../../matheskript-v80-deploy/public/buecher/ableitungen
    cp -r dist/viewer ../../matheskript-v80-deploy/public/buecher/ableitungen

`loes-rest.html` ist bereits auf die Lösungsseiten 33/34 verteilt (nur Archiv).
App-Seite: `src/funcSchulbuch.jsx`, Pfad `/schulbuch/ableitungen`.
