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
Module über eine Person (z. B. Gauß) beginnen mit einer reinen Infoseite (Phase mit `info: true`, `schritte: []`): wer war er, Steckbrief, Lebensweg, passendes Bild (z. B. der Zehn-Mark-Schein). Erst danach kommen die Entdecken-Phasen. Neue Module stehen an **zwei** Stellen: `funcEntdecken.jsx` (Übersicht) und `ENTDECKEN_MENUE` in `src/startMenues.js` (Startseite und ☰-Hauptmenü lesen beide von dort; dort auch `zeichen` fürs Menü setzen).

## Kurs-Kacheln und Kursseiten: eine Gestaltung („Lack und Goldfolie“)
Die Kurse (Unterstufe, Differentialrechnung, Vektoren/Geraden/Ebenen, GFS, Mathe mit KI lernen) teilen sich eine Optik: tief lackierte Fläche in den Kursfarben, Motiv in Folienoptik, Titel über die volle Breite, persönlicher Stand.
- Farben je Kurs nur in `src/kursFarben.js` (GRANAT, PORZELLAN, TIEFBLAU, LACKSCHWARZ, NACHTBLAU) – nicht in den Kursdateien nachbauen.
- Motive (viewBox 0 0 160 120) in `src/funcKursMotive.jsx`, Startseiten-Kacheln in `src/funcKursKachel.jsx`, Kursseiten-Bausteine (`KursKopf`, `FortschrittKarte`, `KapitelKopf`, `ModulKarte`) in `src/funcKursKopf.jsx`.
- Der Stand auf den Kacheln kommt aus `src/kursStand.js` (nur localStorage + Datendateien `unterstufeDaten.js`, `diffKursDaten.js`, `vekKursDaten.js`, `gfsKurs.js`); die Regeln „wann ist ein Modul geschafft“ müssen dort und in der Kursseite gleich bleiben.
- Ein neuer Kurs: Palette in `kursFarben.js`, Motiv in `funcKursMotive.jsx`, Kachel in `funcKursKachel.jsx`, Kursseite mit den Bausteinen aus `funcKursKopf.jsx`, Stand in `kursStand.js`.

## Lernseiten → Werkzeug mit Aufgabentyp
`uebenWunschSetzen(ansicht, { modus, art })` aus `src/uebenWunsch.js` vor `gehe()` öffnet ein Werkzeug gleich im gewünschten Modus und Aufgabentyp (ZweiModi/UebenRahmen in geoUi.jsx lesen den Wunsch). Das Modul Unterstufe (`funcUnterstufe.jsx`, Daten `unterstufeDaten5/6.js`, Doku `claude/modul-unterstufe.md`) nutzt das für jeden Übungsknopf.

## Logo: nur über `MarkenLogo`
Die Wortmarke MYTHOSMATHE.DE kommt immer aus `src/markenLogo.jsx` (`<MarkenLogo groesse=… />`, auf hellem Grund `grund="hell"`, für PDF-Bilder `druck`): Schrift der Startseiten-Headline, Black, Laufweite −0,02 em, Weiß + Headline-Gold. Nie selbst nachbauen; die Wochenmail (`src/wochenmail.js`) setzt dieselben Werte als HTML.

## Dokumente: jedes neue PDF kommt in die Liste
Die Seite „Dokumente“ (Arbeitsmenü F, Pfad `/dokumente`, hinter dem gemeinsamen Passwort) zeigt eine Box je Dokument mit Art, Seitenzahl und Zweck (Amazon · Hier auf der Seite · Investoren · Intern). Die Liste steht in `src/dokumente.js` (`DOKUMENTE`), die Seite in `src/funcDokumente.jsx`.
- **Immer**, wenn in einer Sitzung ein PDF/Dokument entsteht (Schulbuch, Arbeitsheft, Businessplan, Finanzplan …): Eintrag in `DOKUMENTE` ergänzen (Titel, Art, echte Seitenzahl mit `pdfinfo`, Zweck, Stand). Test: `tests/dokumente.test.mjs`, Browser: `tests/ui/dokumente.ui.py`.
- Datei nur dann unter `public/` legen und in `datei` eintragen, wenn sie öffentlich sein darf (alles in `public/` ist per Direktlink ohne Passwort abrufbar). **Vertrauliches** (Businessplan, Finanzplan, Investorenunterlagen) bleibt `datei: null`.
- Arbeitsmenü: A Startseite, B Landingpage, C Alle Bereiche (Aufklapp-Gruppe), D Entwürfe (Aufklapp-Gruppe), E Weitere Seiten (Aufklapp-Gruppe), F Dokumente. Neue Entwürfe/Seiten in `src/seitenKonstanten.js` eintragen.

## Sonst
Regel A5 (nichts unvereinfacht), generisches Maskulinum, Farben aus `C` in `base1.jsx`, `base*.jsx` importiert nie aus `func*.jsx`. Gesamtstand: Projekt-Dokument `claude/matheplus-stand.md`.
