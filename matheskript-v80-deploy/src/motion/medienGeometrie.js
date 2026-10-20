/* Animationen je Lerneinheit, Gruppe Geometrie: { [einheitId]: [{ szene, titel, p }] } – reine Daten */
export const ANIM_GEOMETRIE = {
  /* ---------- Klasse 5 · IV Größen ---------- */
  "groessen-messen-und-schaetzen": [
    { szene: "g_lineal", titel: "Schätzen und messen", p: { laenge: 12, schaetz: 10 } },
    { szene: "g_schritte", titel: "Schätzen mit Schritten", p: { schritte: 10, cm: 70 } },
  ],
  "einheiten-umrechnen": [
    { szene: "g_treppe", titel: "Die Längentreppe", p: { stufen: ["km", "m", "dm", "cm", "mm"], faktor: [1000, 10, 10, 10], wert: 3, von: 0, bis: 3 } },
    { szene: "g_treppe", titel: "Zeit: Faktor 60", p: { stufen: ["d", "h", "min", "s"], faktor: [24, 60, 60], wert: 2, von: 1, bis: 3,
      t0: "Bei der Zeit sind die Stufen anders: 24 und 60 statt 10.", schluss: "2 h = 120 min = 7.200 s – bei der Zeit nie mit 100 rechnen!" } },
    { szene: "g_treppe", titel: "Masse: aufwärts", p: { stufen: ["t", "kg", "g", "mg"], faktor: [1000, 1000, 1000], wert: 7200, von: 2, bis: 1,
      schluss: "7.200 g = 7,2 kg – also 7 kg 200 g." } },
  ],
  "groessen-mit-komma": [
    { szene: "g_kommatafel", titel: "Meter mit Komma", p: {
      kopf: ["m", "dm", "cm"], ziffern: ["5", "0", "8"], quelle: [{ t: "5 m", sp: [0] }, { t: "8 cm", sp: [2] }], nullen: [1], komma: 0,
      ergebnis: "5 m 8 cm = 5,08 m", warnung: "Nicht 5,8 m – das wären 5 m 80 cm!",
      t: { tafel: "Eine Tafel mit den Spalten m, dm und cm.", q: ["Die 5 m kommen in die Meter-Spalte.", "Die 8 cm kommen in die Zentimeter-Spalte."],
        null: "Die Dezimeter-Spalte ist leer – sie bekommt eine 0.", komma: "Das Komma steht direkt hinter den Metern.", ergebnis: "5 m 8 cm = 5,08 m: Zwei Stellen nach dem Komma, weil 1 m = 100 cm." } } },
    { szene: "g_kommatafel", titel: "Kilogramm mit Komma", p: {
      kopf: ["Z", "E", "H", "Z", "E"], gruppen: [{ e: "kg", von: 0, bis: 1 }, { e: "g", von: 2, bis: 4 }],
      ziffern: ["1", "2", "0", "4", "0"], quelle: [{ t: "12 kg", sp: [0, 1] }, { t: "40 g", sp: [3, 4] }], nullen: [2], komma: 1,
      ergebnis: "12 kg 40 g = 12,040 kg = 12,04 kg",
      t: { tafel: "1 kg = 1000 g: Hinter den Kilogramm kommen drei Gramm-Stellen.", q: ["Die 12 kg kommen vor das Komma.", "Die 40 g kommen in die Zehner und Einer der Gramm."],
        null: "Die Hunderter-Stelle der Gramm ist leer – also 0.", komma: "Das Komma trennt Kilogramm und Gramm.", ergebnis: "12 kg 40 g = 12,040 kg. Die Null am Ende darf weg: 12,04 kg." } } },
  ],
  "mit-groessen-rechnen": [
    { szene: "g_balken", titel: "Erst gleiche Einheit", p: { a: { roh: "2 kg 300 g", w: 2300 }, b: { roh: "1,85 kg", w: 1850 }, e: "g", summe: "4.150 g = 4,15 kg", diff: "450 g" } },
    { szene: "g_zeitspanne", titel: "Zeitspannen", p: { von: [9, 45], bis: [11, 20] } },
  ],
  "massstab": [
    { szene: "g_massstab", titel: "Karte und Wirklichkeit", p: { n: 25000, cm: 6 } },
  ],
  /* ---------- Klasse 5 · V Symmetrie und Figuren ---------- */
  "punkt-strecke-gerade": [
    { szene: "g_linien", titel: "Vom Punkt zur Geraden", p: {} },
  ],
  "senkrecht-und-parallel": [
    { szene: "g_lot", titel: "Senkrechte und Abstand", p: {} },
    { szene: "g_parallel", titel: "Parallele zeichnen", p: {} },
  ],
  "koordinatensystem": [
    { szene: "g_koordinaten", titel: "Erst rechts, dann hoch", p: { punkte: [["A", 1, 1], ["B", 5, 1], ["C", 5, 4]], gesucht: ["D", 1, 4], fuellen: true } },
  ],
  "achsensymmetrie": [
    { szene: "g_spiegeln", titel: "An der y-Achse spiegeln", p: { fig: [["A", 1, 1], ["B", 4, 1], ["C", 2, 3]] } },
  ],
  "punktsymmetrie": [
    { szene: "g_drehung", titel: "Halbe Drehung um Z", p: { fig: [["P", 2, 5], ["Q", 1, 3], ["R", 3, 2]], z: [4, 3], notiz: ["P(2 | 5)", "Z(4 | 3)", "P′(6 | 1)"] } },
    { szene: "g_drehung", titel: "Parallelogramm", p: { selbst: true, fig: [["A", 1, 1], ["B", 5, 1], ["C", 7, 5], ["D", 3, 5]], z: [4, 3], notiz: ["Zentrum Z(4 | 3)", "punktsymmetrisch"] } },
  ],
  "vierecke-und-dreiecke": [
    { szene: "g_vierecke", titel: "Vom Quadrat zum Drachen", p: {} },
    { szene: "g_dreiecke", titel: "Dreiecksarten", p: {} },
  ],
  "koerper-erkennen": [
    { szene: "g_koerper", titel: "Sechs Körper", p: {} },
    { szene: "g_schraegbild", titel: "Das Schrägbild", p: { a: 5, b: 3, c: 2 } },
  ],
/* ---------- Klasse 5 · VI Flächen ---------- */
  "flaechen-vergleichen-einheiten": [
    { szene: "g_zentimeterquadrat", titel: "1 cm² = 100 mm²", p: {} },
    { szene: "g_treppe", titel: "Die Flächentreppe", p: { stufen: ["km²", "ha", "a", "m²", "dm²", "cm²", "mm²"], faktor: [100, 100, 100, 100, 100, 100], wert: 3, von: 3, bis: 5,
      t0: "Flächeneinheiten: Von Stufe zu Stufe ist der Faktor 100.", schluss: "3 m² = 30.000 cm² – zwei Stufen, also zweimal · 100." } },
  ],
  "flaecheninhalt-rechteck-quadrat": [
    { szene: "g_rechteck", titel: "Reihen mal Spalten", p: { a: 5, b: 3, e: "cm" } },
    { szene: "g_rechteck", titel: "Rückwärts rechnen", p: { a: 6, A: 48, e: "cm", rueck: true } },
  ],
  "umfang": [
    { szene: "g_umfang", titel: "Einmal außen herum", p: { a: 18, b: 12, e: "m", tor: 2 } },
    { szene: "g_gleicherumfang", titel: "Gleicher Umfang", p: {} },
  ],
  "zusammengesetzte-figuren": [
    { szene: "g_lfigur", titel: "Zerlegen und ergänzen", p: { A: 8, B: 6, c: 5, d: 4 } },
  ],
  "parallelogramm-und-dreieck": [
    { szene: "g_parallelogramm", titel: "Aus Schräg wird Rechteck", p: { g: 6, h: 3, v: 2 } },
    { szene: "g_dreieckflaeche", titel: "Das halbe Parallelogramm", p: { g: 8, h: 5, v: 3 } },
  ],
/* ---------- Klasse 5 · VII Körper ---------- */
  "netze-von-quader-und-wuerfel": [
    { szene: "g_wuerfelnetz", titel: "Netz falten", p: {} },
  ],
  "oberflaeche-quader-wuerfel": [
    { szene: "g_oberflaeche", titel: "Quader aufklappen", p: { a: 5, b: 3, c: 2 } },
  ],
  "volumeneinheiten": [
    { szene: "g_kubikdezimeter", titel: "1 dm³ = 1000 cm³", p: {} },
    { szene: "g_treppe", titel: "Die Volumentreppe", p: { stufen: ["m³", "dm³", "cm³", "mm³"], faktor: [1000, 1000, 1000], wert: 4, von: 1, bis: 2,
      t0: "Volumeneinheiten: Von Stufe zu Stufe ist der Faktor 1000.", schluss: "4 dm³ = 4.000 cm³ – und 1 dm³ ist genau 1 Liter." } },
  ],
  "volumen-quader-wuerfel": [
    { szene: "g_volumen", titel: "Schicht für Schicht", p: { a: 4, b: 3, c: 2 } },
  ],
/* ---------- Klasse 6 · V Winkel und Kreis ---------- */
  "winkel-scheitel-schenkel": [
    { szene: "g_winkelteile", titel: "Scheitel und Schenkel", p: { grad: 50 } },
  ],
  "winkelarten": [
    { szene: "g_winkelarten", titel: "Von spitz bis voll", p: {} },
  ],
  "winkel-messen-und-zeichnen": [
    { szene: "g_geodreieck", titel: "Winkel messen", p: { grad: 125 } },
    { szene: "g_winkelzeichnen", titel: "Winkel zeichnen", p: { grad: 70 } },
    { szene: "g_ueberstumpf", titel: "Über 180°", p: { grad: 250 } },
  ],
  "winkel-an-geraden": [
    { szene: "g_scheitelwinkel", titel: "Scheitel- und Nebenwinkel", p: { alpha: 40 } },
  ],
  "kreis-und-kreisfiguren": [
    { szene: "g_zirkel", titel: "Mit dem Zirkel", p: { r: 3 } },
    { szene: "g_blume", titel: "Die Kreisblume", p: {} },
  ],

};
