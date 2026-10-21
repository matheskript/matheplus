/* Animationen je Lerneinheit, Gruppe Brüche und Dezimalzahlen (Klasse 6): { [einheitId]: [{ szene, titel, p }] } – reine Daten.
   Szenen in szenenBrueche.jsx. Brüche in Termen: { b: [zähler, nenner] }, gemischte Zahlen: { gm: [ganze, zähler, nenner] }. */
export const ANIM_BRUECHE = {
  /* ---------- I Brüche ---------- */
  "brueche-und-anteile": [
    { szene: "b_anteil", titel: "Zähler und Nenner", p: { z: 3, n: 8, form: "kreis" } },
    { szene: "b_anteil", titel: "Anteil am Rechteck", p: { z: 5, n: 12, form: "rechteck", raster: [4, 3] } },
    { szene: "b_vonGroesse", titel: "Bruchteil einer Größe", p: { z: 5, n: 6, ganz: 42, einheit: "min", wort: "Minuten" } },
  ],
  "brueche-am-zahlenstrahl": [
    { szene: "b_strahl", titel: "Sechstel am Strahl", p: { n: 6, bis: 2, ziele: [
      { z: 5, text: "Fünf Sechstel: 5 Schritte von der 0 aus." },
      { z: 3, gleich: [1, 2], y: 36, text: "Drei Sechstel: genau in der Mitte – das ist ein Halb." },
      { z: 8, gemischt: true, text: "Acht Sechstel: über die 1 hinaus – ein Ganzes und zwei Sechstel." },
    ] } },
    { szene: "b2_strahlDoppel", titel: "Drittel und Sechstel", p: { bis: 2, n: 3, k: 2, ziele: [2, 5] } },
  ],
  "kuerzen-und-erweitern": [
    { szene: "b_verfeinern", titel: "Erweitern", p: { z: 2, n: 3, k: 4 } },
    { szene: "b_verfeinern", titel: "Kürzen", p: { z: 3, n: 4, k: 6, kuerzen: true } },
  ],
  "brueche-vergleichen-und-ordnen": [
    { szene: "b_vergleich", titel: "Gleichnamig vergleichen", p: { a: [2, 3], b: [3, 5] } },
    { szene: "b_vergleich", titel: "Gleicher Zähler", p: { a: [1, 3], b: [1, 5], fein: false } },
  ],
  "gemischte-zahlen": [
    { szene: "b_gemischt", titel: "Ganze und Rest", p: { z: 23, n: 6 } },
    { szene: "b2_pizzaBuendeln", titel: "Pizzen bündeln und zerschneiden", p: { z: 11, n: 4, zurueck: [2, 1, 3] } },
  ],
  "brueche-und-prozente": [
    { szene: "b_prozent", titel: "Bruch wird Prozent", p: { z: 7, n: 25, raster: [5, 5] } },
    { szene: "b_prozent", titel: "Drei Viertel", p: { z: 3, n: 4, raster: [2, 2] } },
  ],

  /* ---------- II Dezimalzahlen ---------- */
  "dezimalschreibweise": [
    { szene: "b_stellen", titel: "Stellen nach dem Komma", p: { zahl: "2,375" } },
    { szene: "b_stellen", titel: "Nullen hinter dem Komma", p: { zahl: "0,083" } },
  ],
  "dezimalzahlen-bei-groessen": [
    { szene: "b_groessen", titel: "Meter in Zentimeter", p: { wert: "4,08", spalten: ["m", "dm", "cm"], grund: "m", ziel: "cm" } },
    { szene: "b_uhr", titel: "Stunden sind anders", p: { wert: "0,75", z: 3, n: 4 } },
  ],
  "brueche-und-dezimalzahlen-umwandeln": [
    { szene: "b_zuDezimal", titel: "Auf Hundertstel erweitern", p: { z: 9, n: 25 } },
    { szene: "b_teilen", titel: "Zähler durch Nenner", p: { a: 3, b: 8 } },
  ],
  "dezimalzahlen-vergleichen-runden": [
    { szene: "b_lupe", titel: "Vergleichen mit Lupe", p: { art: "vergleich", oben: [0, 1], lupe: [0.4, 0.5], werte: ["0,405", "0,45"] } },
    { szene: "b_lupe", titel: "Runden mit Lupe", p: { art: "runden", oben: [4, 5], lupe: [4.3, 4.4], wert: "4,378", ergebnis: "4,4" } },
  ],
  "periodische-dezimalzahlen": [
    { szene: "b_teilen", titel: "Der Rest kehrt wieder", p: { a: 2, b: 11 } },
    { szene: "b_teilen", titel: "Gemischt-periodisch", p: { a: 7, b: 12 } },
  ],

  /* ---------- III Addieren und Subtrahieren ---------- */
  "gleichnamige-brueche-addieren": [
    { szene: "b_addStreifen", titel: "Achtel plus Achtel", p: { a: [3, 8], b: [2, 8] } },
    { szene: "b2_sprungAdd", titel: "Fünftel springen", p: { a: [1, 5], b: [3, 5] } },
  ],
  "ungleichnamige-brueche-hauptnenner": [
    { szene: "b_addStreifen", titel: "Halbe plus Drittel", p: { a: [1, 2], b: [1, 3] } },
    { szene: "b_umformung3", titel: "Rechenweg", p: {
      zeilen: [
        { t: [{ b: [2, 3] }, "+", { b: [3, 5] }], m: [0, 2], n: "Hauptnenner 15" },
        { t: [{ b: [10, 15] }, "+", { b: [9, 15] }], m: [0, 2], n: "Zähler addieren" },
        { t: [{ b: [19, 15] }, "=", { gm: [1, 4, 15] }] },
      ],
      text: ["Zwei Drittel plus drei Fünftel: Der Hauptnenner von 3 und 5 ist 15.", "Erweitert: zehn Fünfzehntel plus neun Fünfzehntel.", "Neunzehn Fünfzehntel – ein Ganzes und vier Fünfzehntel."],
    } },
  ],
  "gemischte-zahlen-addieren": [
    { szene: "b_gemischtAdd", titel: "Ganze und Brüche getrennt", p: { a: [1, 3, 4], b: [2, 1, 2] } },
    { szene: "b2_uebertrag", titel: "Übertrag: neues Ganzes", p: { a: [1, 3, 5], b: [2, 4, 5] } },
  ],
  "dezimalzahlen-addieren-subtrahieren": [
    { szene: "b_kommaUnterKomma", titel: "Komma unter Komma", p: { a: "45,08", b: "7,935", op: "+" } },
    { szene: "b_kommaUnterKomma", titel: "Subtrahieren", p: { a: "20", b: "13,47", op: "−" } },
  ],
  "geschickt-rechnen-ueberschlagen": [
    { szene: "b_partner", titel: "Partner bei Brüchen", p: {
      terme: [{ b: [5, 12] }, { b: [2, 3] }, { b: [7, 12] }], partner: [0, 2], zwischen: "1", ergebnis: { gm: [1, 2, 3] },
      texte: ["Fünf Zwölftel plus zwei Drittel plus sieben Zwölftel.", "Zwei Partner haben denselben Nenner: die Zwölftel.", "Vertauschen ist erlaubt – die Partner rücken zusammen.", "Fünf Zwölftel plus sieben Zwölftel sind zwölf Zwölftel, also genau 1.", "Dann nur noch 1 plus zwei Drittel: ein Ganzes und zwei Drittel."],
    } },
    { szene: "b_partner", titel: "Partner bei Dezimalzahlen", p: {
      terme: ["2,35", "4,8", "1,65"], partner: [0, 2], zwischen: "4", ergebnis: "8,8",
      texte: ["2,35 + 4,8 + 1,65 – gibt es Partner, die eine glatte Zahl ergeben?", "2,35 und 1,65: Die Hundertstel ergänzen sich zu einem Ganzen.", "Vertauschen: Die Partner rücken zusammen.", "2,35 + 1,65 = 4", "Dann bleibt 4 + 4,8 = 8,8."],
    } },
  ],

  /* ---------- IV Multiplizieren und Dividieren ---------- */
  "bruch-mal-zahl": [
    { szene: "b_malZahl", titel: "Dreimal zwei Siebtel", p: { k: 3, z: 2, n: 7 } },
    { szene: "b_durchZahl", titel: "Durch 2 teilen", p: { z: 3, n: 5, k: 2 } },
  ],
  "bruch-mal-bruch": [
    { szene: "b_rechteckMal", titel: "Das Rechteckmodell", p: { a: [2, 3], b: [4, 5] } },
    { szene: "b_rechteckMal", titel: "Hälfte eines Drittels", p: { a: [1, 2], b: [1, 3] } },
  ],
  "durch-bruch-dividieren": [
    { szene: "b_passtRein", titel: "Wie oft passt es?", p: { a: 3, z: 1, n: 4 } },
    { szene: "b_passtRein", titel: "Mal Kehrbruch", p: { a: 6, z: 3, n: 4 } },
  ],
  "komma-verschieben-zehnerpotenzen": [
    { szene: "b_kommaWandern", titel: "Mal 100", p: { zahl: "3,47", op: "·", s: 2 } },
    { szene: "b_kommaWandern", titel: "Durch 100", p: { zahl: "8,3", op: ":", s: 2 } },
  ],
  "dezimalzahlen-multiplizieren": [
    { szene: "b_dezMal", titel: "Stellen zählen", p: { a: "4,8", b: "3,5", ueberschlag: "5 · 3 = 15" } },
    { szene: "b_dezMal", titel: "Nullen davor", p: { a: "0,6", b: "0,07" } },
  ],
  "dezimalzahlen-dividieren": [
    { szene: "b_dezTeilen", titel: "Komma wegschieben", p: { a: "1,56", b: "0,12" } },
    { szene: "b_dezTeilen", titel: "Null anhängen", p: { a: "3,6", b: "0,25" } },
  ],
  "rechenreihenfolge-brueche-dezimal": [
    { szene: "b_umformung4", titel: "Klammer, Punkt, Strich", p: {
      zeilen: [
        { t: ["(", { b: [3, 4] }, "−", { b: [1, 2] }, ")", "·", { b: [8, 3] }, "+", { gm: [1, 1, 3] }], m: [0, 4], n: "Klammer zuerst" },
        { t: [{ b: [1, 4] }, "·", { b: [8, 3] }, "+", { gm: [1, 1, 3] }], m: [0, 2], n: "Punkt vor Strich" },
        { t: [{ b: [2, 3] }, "+", { gm: [1, 1, 3] }], m: [0, 2], n: "Strich" },
        { t: ["2"] },
      ],
      text: ["Klammer zuerst: drei Viertel minus zwei Viertel ist ein Viertel.", "Punkt vor Strich: ein Viertel mal acht Drittel sind zwei Drittel.", "Zum Schluss addieren: zwei Drittel plus ein Ganzes und ein Drittel.", "Ergebnis: 2"],
    } },
    { szene: "b_umformung4", titel: "Mit Dezimalzahlen", p: {
      zeilen: [
        { t: ["2,5", "·", "(4,2 − 1,8)", ":", "0,4"], m: [2, 2], n: "Klammer zuerst" },
        { t: ["2,5", "·", "2,4", ":", "0,4"], m: [0, 2], n: "von links nach rechts" },
        { t: ["6", ":", "0,4"], m: [0, 2], n: "60 : 4" },
        { t: ["15"] },
      ],
      text: ["Klammer zuerst: 4,2 − 1,8 = 2,4.", "Punktrechnungen von links nach rechts: 2,5 · 2,4 = 6.", "6 : 0,4 – Komma bei beiden verschieben: 60 : 4.", "Ergebnis: 15"],
    } },
  ],
};
