# Schulbuch „Ableitungen“ – Quelltext

Eine Datei pro Buchseite in `pages/` (HTML, Formeln als `$…$`, Grafiken als `<graph>{JSON}</graph>`).

Bauen:

    npm install                 # katex, Montserrat
    node build.mjs              # → dist/buch.html
    python3 render.py           # → dist/Ableitungen.pdf, meldet Überlauf je Seite
    node viewer.mjs ../../matheskript-v80-deploy
    rm -rf ../../matheskript-v80-deploy/public/buecher/ableitungen
    cp -r dist/viewer ../../matheskript-v80-deploy/public/buecher/ableitungen

Querverweise nie als feste Zahl schreiben, sondern als Token:
`{{S:stamm}}` Seitenzahl, `{{K:stamm}}` Nummer des Unterkapitels, `{{T:stamm}}` Titel (stamm = Dateiname ohne Nummer).
Neues Unterkapitel: Seite mit `uk: Titel` in der Meta-Zeile beginnen – die Nummerierung zählt automatisch.

Lösungen stehen in `loesungen.html`; `python3 loesungen-verteilen.py` verteilt sie auf die Seiten 44 ff.
Seitenzahlen der Kursmodule (src/funcDiffKurs.jsx) und der Schulbuchseite (src/funcSchulbuch.jsx)
bei Änderungen an der Seitenaufteilung aus `dist/verzeichnis.json` nachziehen.
App-Seite: `src/funcSchulbuch.jsx`, Pfad `/schulbuch/ableitungen`.

`node build.mjs` schreibt außerdem `dist/kurs/<seite>.json` (alle Aufgaben, Merke-/Achtung-/Vertiefungskästen
und die Lösungen je Seite). `viewer.mjs` kopiert den Ordner mit; der Kurs in der App (`src/funcDiffKursUeben.jsx`)
lädt daraus „Aufgaben“ und „Sätze und Definitionen“. Neue Aufgabe im Buch → in `src/diffAufgaben.js`
(`BUCH_TYPEN`) einem Aufgabentyp zuordnen, damit es „Neue Aufgabe vom selben Typ“ gibt.

QR-Codes und Druckausgabe (seit 20.10.2026): wie in `../vektoren/LIESMICH.md` beschrieben – `node build.mjs` misst
den Platz und setzt die Codes (`../qr.mjs`, Typen aus `src/diffAufgaben.js`); Druckausgabe: `../kdp/LIESMICH.md`.
