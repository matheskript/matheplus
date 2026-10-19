# matheplus – Regeln für jede Sitzung

App-Ordner: `matheskript-v80-deploy/` (Vite + React). Vor dem Push: `node --test tests/*.test.mjs` und `npx vite build`.

## Wurzeln: immer EIN Linienzug
Wurzelhaken und Überstrich sind ein einziger Linienzug auf exakt derselben Höhe. Nie das Zeichen „√“ mit einer eigenen Linie (border-top, overline, CSS-Klasse …) kombinieren – genau daraus entstehen abgesetzte Überstriche.

- Formeln: `\\sqrt{…}` / `\\sqrt[n]{…}` in `M`, `MS`, `Text` (zeichnet automatisch `WurzelZeichen`).
- JSX: `<WurzelZeichen>…</WurzelZeichen>` bzw. `<Wurzel>` aus `func19.jsx`; Klartext mit „√(…)“: `<MitWurzeln text={…} />` (alles in `src/wurzelZeichen.jsx`). `MS` setzt Klartext-Wurzeln bereits selbst.
- PDF (`func11.jsx`): Text mit Wurzeln läuft über `wurzelnImPdf` (`src/wurzelPdf.js`), Haken + Überstrich per `doc.lines`.
- Geometrie zentral in `src/wurzelGeometrie.js`. Nichts davon nachbauen.
- Wächter: `tests/wurzel.test.mjs` (schlägt bei „√“ + Linie an), Browser: `tests/ui/wurzel.ui.py`.
- Ausnahmen: Tastenbeschriftungen (√x) und SVG-Beschriftungen in Grafiken bleiben Text.

## TeX in JSX-Attributen
Nie `menge="\\mathbb{N}"` – in JSX-Attributen wird nichts entwertet, es erscheint „\mathbbN“. Immer `menge={"\\mathbb{N}"}` (der Test prüft das).

## Sprünge: nur über den Sprung-Schalter
Die Seite scrollt nie „von selbst“, außer über `springe("schlüssel", () => …)` aus `src/sprung.js`. Jeder Schlüssel steht dort mit an/aus und Beschreibung; Aufklapp-Menüs laufen über `data-sprung` bzw. `aufklappen@<ansicht>`. Stand 18.10.: Auswahl-Sprünge nur in Startseite → Schulmathematik an. Wächter: `tests/sprung.test.mjs`, Browser: `tests/ui/sprung.ui.py`.

## Personen-Module in Mathe entdecken
Module über eine Person (z. B. Gauß) beginnen mit einer reinen Infoseite (Phase mit `info: true`, `schritte: []`): wer war er, Steckbrief, Lebensweg, passendes Bild (z. B. der Zehn-Mark-Schein). Erst danach kommen die Entdecken-Phasen. Neue Module stehen an **zwei** Stellen: `funcEntdecken.jsx` (Übersicht) und `ENTDECKEN_MENUE` in `func2.jsx` (Startseite/Menü).

## Sonst
Regel A5 (nichts unvereinfacht), generisches Maskulinum, Farben aus `C` in `base1.jsx`, `base*.jsx` importiert nie aus `func*.jsx`. Gesamtstand: Projekt-Dokument `claude/matheplus-stand.md`.
