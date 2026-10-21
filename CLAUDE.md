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

## Vektor-Werkzeuge: eine Gestaltung (`src/vekUi.jsx`)
Die neun Werkzeuge der Vektor-Stationen (Rechnen mit Vektoren, Kreuzprodukt, Winkel, Zwei/Drei Punkte, Visualizer, Geraden im Raum, Ebene vs. Ebene, Abstände) bauen auf denselben Bausteinen auf – nichts davon in den Werkzeugdateien nachbauen.
- **Jedes Objekt hat eine Farbe und eine eigene Box** (`ObjektBox` in `ObjektReihe`): erstes Objekt (g, a⃗, E₁, A, „von“) Blau, zweites (h, b⃗, E, E₂, B, „bis“) Gold (`VF.zwei`, Text in `VF.zweiText`), Ergebnis/Lot/Schnittpunkt Smaragd. Dieselbe Farbe gilt in Gleichung, 3D-Bild (`Raum3` nimmt `farbe` je Gerade/Ebene und eine `legende`) und Rechnung – in den Abständen auch dann, wenn die Rechnung die Reihenfolge tauscht (`fx`/`fy`).
- `ObjektReihe min={…}`: Boxen nebeneinander, sobald jede mindestens `min` px hat, sonst untereinander (Geraden 150, Ebenen mit Reglern 260).
- Ablauf: `ModusReiter` (Reiter mit Bildzeichen) → `FallWahl` (Übungsfall/Beispiele) → Boxen → 3D-Bild (`BUEHNE`, Bild höchstens 560 px breit) → `Tafel nr=1` Vermutung als `TippKacheln` → `Tafel nr=2` Rechnung als `Rechenweg`/`RSchritt` → `Ergebnis` → `Fusszeile` („Neue Aufgabe“ + Hilfe). `Schritt` aus func20 mit Nummer ist dieselbe Zeitleiste.
- Karten setzen `backgroundColor` (nicht `background`), sonst zieht `index.css` (`html[data-wz-voll]`) sie randlos über die ganze Breite.
- Bildzeichen (Lagebeziehungen, Winkelarten, Punkt/Gerade/Ebene, Abstand, Lot) in `Bild` – neue dort ergänzen.
- Browser: `tests/ui/vektoren-design.ui.py` (360/390/1280, g links neben h, Vermutung → Ergebnis, keine Überbreite).
- **Desktop ab 840 px** (DESKTOP-STIL.md): `VekArbeit` (Boxen + Vermutung links, 340 px), Bild rechts in `VekBild` bzw. `Raum3 arbeitsflaeche` (echte Pixel, Werkzeugleiste mit Grundebenen/Übungsfall darunter), Rechnung darunter über die volle Breite; Regler am Desktop als `ReglerSpalten` (+ oben, − unten). Handy-Zweige bleiben unverändert. Browser: `tests/ui/desktop-a.ui.py`.

## Lernseiten → Werkzeug mit Aufgabentyp
`uebenWunschSetzen(ansicht, { modus, art })` aus `src/uebenWunsch.js` vor `gehe()` öffnet ein Werkzeug gleich im gewünschten Modus und Aufgabentyp (ZweiModi/UebenRahmen in geoUi.jsx lesen den Wunsch). Das Modul Unterstufe (`funcUnterstufe.jsx`, Daten `unterstufeDaten5/6.js`, Doku `claude/modul-unterstufe.md`) nutzt das für jeden Übungsknopf.

## Unterstufe: Motion-Animationen und Videos
Jede Lerneinheit hat mindestens eine Animation und ein Video (`src/unterstufeMedien.js`; Test `tests/unterstufeMedien.test.mjs`).
- Szenen sind reine Funktionen des Fortschritts (Vertrag im Kopf von `src/motion/kern.jsx`), je Gruppe `src/motion/szenen*.jsx`, Zuordnung je Lerneinheit `src/motion/medien*.js`; Abspieler `src/funcUnterstufeMotion.jsx`. Das Schlussbild ist zugleich das Standbild.
- Kontaktbogen zum Ansehen ohne Browser-Klickerei: `node scripts/motion-blatt.mjs [filter] /tmp/mb` → PNGs.
- Videos: Platzhalter ist ein Michael-Penn-Video; eigenes Video = Eintrag in `VIDEO_EIGEN` (YouTube-ID), dann verschwindet der Hinweis.
- Üben in der Lerneinheit bleibt kompakt: ein Hauptknopf + Untermenü „Mehr“, keine Knopf-Reihen. Browser: `tests/ui/unterstufe-modul.ui.py`.
- Die 13 Unterstufen-Werkzeuge zeigen oben in „Entdecken“ eine Animations-Auswahl (`ZweiModi` Prop `animationen`, Daten `src/motion/medienWerkzeuge.js`, Verweise `{ aus, nr }` auf Lerneinheiten; nur Deutsch). Browser: `tests/ui/unterstufe-werkzeug-motion.ui.py`.

## Logo: nur über `MarkenLogo`
Die Wortmarke MYTHOSMATHE.DE kommt immer aus `src/markenLogo.jsx` (`<MarkenLogo groesse=… />`, auf hellem Grund `grund="hell"`, für PDF-Bilder `druck`): Schrift der Startseiten-Headline, Black, Laufweite −0,02 em, Weiß + Headline-Gold. Nie selbst nachbauen; die Wochenmail (`src/wochenmail.js`) setzt dieselben Werte als HTML.

## Kopfleiste und Blog
Die Zeile oben ist `src/funcKopfleiste.jsx` (Daten des Besuchermenüs in `src/kopfleiste.js`). Sie folgt dem Modus der Startseite (dunkel/hell/mix, `startModus.js`) über CSS-Variablen an `data-modus`. Besucher ohne Konto: festes Menü Vision · Mathe lernen · Mathilda AI · Blog (nie zum Ausklappen). Ab 1000 px eine breite Zeile, Wortmarke voll (40 px), links und rechts derselbe Rand (`--kl-rand`, symmetrisch; höchstens bis zur Schlagzeilenkante `HELD_KANTE`); darunter Menü in Zeile zwei und Wortmarke ein Drittel kleiner. Kein Modus-Knopf in der Leiste: dunkel/hell/mix steht ganz unten im ☰-Menü („Darstellung“, `funcHauptmenue.jsx`) und als Pille auf der Startseite. Wortmarke darf nie schrumpfen (`flex-shrink: 0`), Kurve wird per `clip-path` aufgedeckt (nicht per Strichlänge), danach leiser (`--kl-kurve-ruhe`), links weich ausgeblendet. Keine Karos – weder im Header noch auf der Startseite (passt nicht zur Marke).
Blog: Beiträge in `src/blogDaten.js` (neuester oben, `motiv` oder `bild`), Seite `src/funcBlog.jsx`, Pfade `/blog` und `/blog/<slug>`. Liste: Logo rechts neben „Mathe-Blog“, jeder Beitrag als ganze klickbare Box (kein „Weiterlesen“), Datum kurz ohne Jahr links („11. Okt“, `datumKurz`), Titel oben in der Box, keine Lesezeit; neuester Beitrag hervorgehoben; darunter „Alle Beiträge“ untereinander. Keine Kommentare oder Zähler. **Ganz unten auf der Übersicht (nicht im einzelnen Beitrag) stehen alle Dokumente** der Seite „Dokumente“ (`DokumenteKarten eins` aus `funcDokumente.jsx`, einspaltig, Öffnen · Download · Cover); da der Blog öffentlich ist, die Dokumente nicht, erscheinen die Karten erst nach dem gemeinsamen Passwort (`BlogDokumente`, Karten lazy geladen), davor nur ein kleines Passwortfeld. Browser: `tests/ui/blog-dokumente.ui.py`. Motive mathematisch exakt zeichnen (Tangente berührt, Quadrate stimmen). Tests: `tests/kopfleiste.test.mjs`, `tests/blog.test.mjs`, Browser `tests/ui/kopfleiste.ui.py`.

## Hauptmenü (☰): Handy-Fenster und Desktop-Menü
Unter 900 px öffnet ☰ das schmale Fenster (`src/funcHauptmenue.jsx`), ab 900 px das Desktop-Menü über den ganzen Bildschirm (`src/funcHauptmenueDesktop.jsx`, Grenze `DESKTOP_MENUE_AB`): Kopfzeile mit Suche („/“ oder ⌘K), drei Spalten (ab 1280 px; darunter zwei), Fußzeile mit Konto, Darstellung und Abmelden. Daten für beide aus `src/hauptmenue.js`, gemeinsame Bausteine (Ikonen, Bereichsbilder, Kurs-Farben, Klassenwahl, Abmelde-Frage) in `src/hauptmenueTeile.jsx` – nicht doppelt bauen. Desktop folgt dem Modus der Startseite (dunkel/hell/mix), Mathilda-Karte und Mathe-Training bleiben dunkel. Nur echte Daten (Kursstand aus `kursStand.js`, zuletzt benutztes Werkzeug) – keine Platzhalterzahlen. Neuer Menüpunkt: in `hauptmenue.js` eintragen, dann erscheint er in beiden. Browser: `tests/ui/hauptmenue.ui.py` (Fenster bis 899 px), `tests/ui/hauptmenue-desktop.ui.py` (Desktop).

## Dokumente: jedes neue PDF kommt in die Liste
Die Seite „Dokumente“ (Arbeitsmenü F, Pfad `/dokumente`, hinter dem gemeinsamen Passwort) zeigt eine Box je Dokument mit Art, Seitenzahl und Zweck (Amazon · Hier auf der Seite · Investoren · Intern). Die Liste steht in `src/dokumente.js` (`DOKUMENTE`), die Seite in `src/funcDokumente.jsx`.
- **Immer**, wenn in einer Sitzung ein PDF/Dokument entsteht (Schulbuch, Arbeitsheft, Businessplan, Finanzplan …): Eintrag in `DOKUMENTE` ergänzen (Titel, Art, echte Seitenzahl mit `pdfinfo`, Zweck, Stand). Test: `tests/dokumente.test.mjs`, Browser: `tests/ui/dokumente.ui.py`.
- Datei nur dann unter `public/` legen und in `datei` eintragen, wenn sie öffentlich sein darf (alles in `public/` ist per Direktlink ohne Passwort abrufbar). **Vertrauliches** (Businessplan, Finanzplan, Investorenunterlagen) bleibt `datei: null`.
- Umschläge/Cover bekommen **keine eigene Box**: Feld `cover` (Pfad unter `public/`) in der Box der Druckausgabe, die Karte zeigt dann den Knopf „Cover“ (Download). Die Begriffe „Innenteil“ und „Amazon-Umschlag“ nicht mehr verwenden.
- Arbeitsmenü: A Startseite, B Landingpage, C Alle Bereiche (Aufklapp-Gruppe), D Entwürfe (Aufklapp-Gruppe), E Weitere Seiten (Aufklapp-Gruppe), F Dokumente. Neue Entwürfe/Seiten in `src/seitenKonstanten.js` eintragen.

## Sonst
Regel A5 (nichts unvereinfacht), generisches Maskulinum, Farben aus `C` in `base1.jsx`, `base*.jsx` importiert nie aus `func*.jsx`. Gesamtstand: Projekt-Dokument `claude/matheplus-stand.md`.

## Trainings-Kurse im Werkzeug-Band
Das dünne Band unter der Kopfleiste (`WerkzeugBand`, `funcWerkzeuge.jsx`) zeigt bei Werkzeugen eines Kurses links die Trainer des Kurses (aktiver mit Goldstrich), rechts „Test“ und den Kurs-Umschalter (Kursname statt „Tools“; Aufklappfeld: Deine Kurse + „Alle Werkzeuge“). Kurse in `src/trainingsKurse.js` (`KURSE`: Analysis/Vektoren/Stochastik Oberstufe, je 5–6 Trainer, `namen` = kürzere Reiter am Desktop); Werkzeuge außerhalb aller Kurse behalten Station + „Tools“. Kurs-Werkzeuge bekommen das Band statt des großen Seitenkopfs und am Desktop die Breite der Kopfleiste (`--tr-breite` in `index.css`, `data-training-breit` aus func10: höchstens 940 px, symmetrisch). Ableitungstrainer am Desktop: Einstellungen links (mitlaufend), Aufgabe rechts. „Gewählte Kurse“ liegen vorerst nur im Browser (`matheplus-trainingskurse`). Test: `tests/trainingsKurse.test.mjs`.
