# Desktop-Stil der Werkzeugseiten (Vorbild „Ebene vs. Ebene“)

Gilt für **alle Werkzeuge** (Einträge in `src/werkzeuge.js`). Vorbild ist `EbeneVsEbene` in `src/func19.jsx` – im Zweifel genau so bauen.
Bausteine: `src/arbeitsflaeche.jsx`. Globale Regeln: `src/index.css` (Block „Desktop-Stil aller Werkzeugseiten“).

## Grundsatz
- **Desktop = ab 840 px** (`useDesktop()` bzw. `DESKTOP`). Ab dort ist die Inhaltsspalte 783 px breit (Regel in `func10.jsx`), Inhalt mit 24 px Rand wie der Seitentitel.
- **Handy bleibt unverändert.** Desktop ist ein eigener Zweig: `const desktop = useDesktop(); if (desktop) return (…);` – die Handy-JSX bleibt Zeichen für Zeichen, wie sie ist. Gemeinsame Teile (Schaubild, Ergebnis, Rechenweg) als Variablen bauen und in beiden Zweigen verwenden – keine Logik doppeln.
- Mathematik, Texte, Generatoren, Prüfungen, `aria-label`s und Speicher bleiben unverändert. Nur Anordnung und Darstellung ändern sich.

## Anordnung
1. **Arbeitsfläche** (`<Arbeitsflaeche links={…} rechts={…} />`): links (290 px) alle Einstellungen – Eingaben, Regler, Gleichungen als Karten, darunter das knappe Ergebnis (Lage, Kennzahl, Lösung). Rechts das Bild (Schaubild, Graph, Figur, Diagramm) in einer `<BildKarte>`, darunter die `<Werkzeugleiste gruppen={[{ titel, inhalt }]} />` mit Schaltern und Beispielen (Kicker in Versalien + Chips, `chipStil()`).
2. **Darunter über die volle Breite**: Rechenweg, Formeln, Tabellen, Erklärung – in `FeinKarte`n. Zwei Ergebnisse nebeneinander mit `<ErgebnisReihe>`; lange Formel + kurze Erklärung als Raster `minmax(0,1fr) minmax(0,240px)`, Erklärung rechts mit `borderLeft: 2px solid C.linie`.
3. **Trainer ohne Bild** (Aufgabe → Eingabe → Prüfen): Aufgabe/Eingabe links breit, Hilfen/Skizze/Formelkasten rechts (Raster `minmax(0,1fr) minmax(0,300px)`), oder – wenn es rechts nichts Sinnvolles gibt – eine Spalte in Karten. **Keine leere Spalte erzwingen.**
4. Modus-Umschalter (Entdecken | Üben, Reiter) bleiben oben über die volle Breite.

## Karten und Typografie
- `FeinKarte` / `feinKarte`: weiß, `1px solid C.linie`, Rundung 16, Innenabstand 18/20, **kein Schatten**. Getönte Eingabegruppen: `toenKarte(farbe)`.
- Überschriften in Karten: `titelStil` (13 px, 600, `C.see`). Gruppenbeschriftungen: `Kicker` (11 px, Versalien, Laufweite 0,08 em, `C.grau`).
- Hinweise: `hinweisStil` (12,5 px, `C.grau`) – **nie `C.hellgrau` für Fließtext** (zu wenig Kontrast).
- Plus/Minus-Knöpfe am Desktop: **+ oben, Wert in der Mitte, − unten** (wie `EbenenKarte` in func19), Höhe 30, Rundung 9, Farbe der Größe, Klasse `eve-knopf` (Hover/Druck).
- Abstände: zwischen Karten 12 (Spalte) bzw. 16–20 (Zeilen), Spaltenabstand 20.

## Grafiken
- **Echte Pixel**: Ein SVG mit `viewBox` 0 0 360 320 und `width: 100%` wird am Desktop auf das Doppelte aufgeblasen – Beschriftungen, Legenden und Linien werden riesig. Deshalb: Breite messen (`const [ref, breite] = useBreite()`), `W = breite || Standard`, Höhe passend (Desktop meist quadratisch oder 0,75 · W) und `viewBox` = W × H. Schrift- und Strichgrößen bleiben in Pixeln.
- Wenn ein Bild das nicht kann (feste Geometrie), am Desktop **auf seine natürliche Größe begrenzen** (`maxWidth` ≈ 1,2 × Entwurfsbreite) und zentrieren – nie über die volle Breite strecken.
- Legende, Dreh-/Zoomknöpfe bleiben im Bild; Legende in normaler Schriftgröße (12–12,5 px).

## Prüfen (jede Seite)
- `npx vite build`, dann Playwright bei 1440, 1100, 860 (Desktop) und 390, 360 (Handy): keine `pageerror`, `scrollWidth` = Viewport-Breite, Screenshots ansehen.
- Handy-Screenshot vorher/nachher vergleichen: muss gleich aussehen.
- Bedienen: mindestens einen Regler/Knopf, einen Modus-Wechsel und (falls vorhanden) „Neue Aufgabe“ am Desktop durchklicken.
