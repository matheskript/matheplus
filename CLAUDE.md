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

## Sonst
Regel A5 (nichts unvereinfacht), generisches Maskulinum, Farben aus `C` in `base1.jsx`, `base*.jsx` importiert nie aus `func*.jsx`. Gesamtstand: Projekt-Dokument `claude/matheplus-stand.md`.
