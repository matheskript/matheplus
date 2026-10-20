/* Animationen je Lerneinheit, Gruppe Daten (Klasse 6: Mittelwert, Zahlenbereiche, Terme und Gleichungen,
   Daten und Zufall, Zuordnungen): { [einheitId]: [{ szene, titel, p }] } – reine Daten.
   Szenen: src/motion/szenenDaten.jsx (Präfix d_); umformung3/4/5 aus szenenZahlen.jsx. */
export const ANIM_DATEN = {
  /* ---------- IV ---------- */
  "mittelwert": [
    { szene: "d_ausgleich", titel: "Ausgleichen", p: { werte: [2, 3, 2, 4, 1], name: "Fünf Noten" } },
    { szene: "d_ausgleich", titel: "Lenas Noten", p: { werte: [3, 2, 4, 2], name: "Lenas Noten", schluss: "Summe 11 geteilt durch 4 Noten ergibt 2,75 – kein Wert aus der Liste, aber der Ausgleich." } },
  ],
  "zahlenbereiche": [{ szene: "d_zahlenbereiche", titel: "ℕ, ℤ und ℚ", p: {} }],

  /* ---------- VI Terme und Gleichungen ---------- */
  "terme-mit-variablen": [
    { szene: "d_einsetzen", titel: "Zahlen einsetzen", p: { a: 3, b: 2, v: "x", werte: [0, 1, 2, 3], muster: true } },
    { szene: "d_einsetzen", titel: "Der Term 2a − 5", p: { a: 2, b: -5, v: "a", werte: [7, 2.5, 1] } },
  ],
  "terme-aufstellen": [
    { szene: "d_streichhoelzer", titel: "Streichholzmuster", p: { n: 4 } },
    { szene: "umformung4", titel: "Schwimmbad-Term", p: {
      zeilen: [
        { t: "Kosten = 3 + 1,5 · h", n: "Term" },
        { t: "3 + 1,5 · 4", m: "1,5 · 4", n: "h = 4 einsetzen" },
        { t: "3 + 6", m: "3 + 6", n: "Punkt vor Strich" },
        { t: "9 €", n: "Kosten für 4 Stunden" },
      ],
      text: ["Grundgebühr 3 € plus 1,50 € pro Stunde: der Term 3 + 1,5 · h.", "Für 4 Stunden setzt man h = 4 ein.", "Erst das Produkt: 1,5 · 4 = 6.", "4 Stunden kosten 9 €. Probe mit h = 0: nur 3 € Eintritt ✓"],
    } },
  ],
  "terme-vereinfachen": [
    { szene: "d_sortieren", titel: "Glieder sortieren", p: { glieder: [[5, 1], [3, 0], [2, 1], [-1, 0]], v: "a" } },
    { szene: "umformung3", titel: "Klammer auflösen", p: {
      zeilen: [
        { t: "2 · (3x + 4) + x", m: "2 · (3x + 4)", n: "mit jedem Glied mal 2" },
        { t: "6x + 8 + x", m: "6x + 8 + x", n: "x-Glieder zusammen" },
        { t: "7x + 8", n: "vereinfacht" },
      ],
      text: ["Die 2 vor der Klammer wird mit jedem Glied malgenommen: 2 · 3x und 2 · 4.", "6x und x sind gleichartig: zusammen 7x.", "Ergebnis 7x + 8. Probe mit x = 1: 2 · 7 + 1 = 15 und 7 + 8 = 15 ✓"],
    } },
  ],
  "gleichungen-loesen": [
    { szene: "d_waage", titel: "Die Balkenwaage", p: { a: 3, b: 2, c: 17 } },
    { szene: "d_pfeilkette", titel: "Rückwärts rechnen", p: { v: "x", gleichung: "4x − 7 = 25", ops: [{ hin: "· 4", rueck: ": 4" }, { hin: "− 7", rueck: "+ 7" }], werte: [8, 32, 25], probe: "4 · 8 − 7 = 25 ✓" } },
  ],
  "formeln": [
    { szene: "d_formel", titel: "Werte einsetzen", p: { a: 4, b: 7, einheit: "cm" } },
    { szene: "umformung4", titel: "Quaderformel rückwärts", p: {
      zeilen: [
        { t: "V = a · b · c", n: "Formel" },
        { t: "480 = 8 · 6 · c", m: "8 · 6 · c", n: "einsetzen" },
        { t: "480 = 48c", n: "| : 48" },
        { t: "c = 10 cm", n: "Probe: 8 · 6 · 10 = 480 ✓" },
      ],
      text: ["Die Quaderformel V = a · b · c.", "V = 480 cm³, a = 8 cm und b = 6 cm einsetzen.", "8 · 6 = 48, also 480 = 48c. Beide Seiten durch 48 teilen.", "c = 10 cm. Probe: 8 · 6 · 10 = 480 ✓"],
    } },
  ],

  /* ---------- VII Daten und Zufall ---------- */
  "daten-erheben-diagramme": [
    { szene: "d_urliste", titel: "Von der Urliste zum Diagramm", p: { daten: [["zu Fuß", "F", 8], ["Rad", "R", 7], ["Bus", "B", 9], ["Auto", "A", 4]], seed: 7 } },
    { szene: "d_achse", titel: "Täuschende Achse", p: { a: ["Rad", 7], b: ["Bus", 9], ab: 6, max: 10 } },
  ],
  "kreisdiagramm": [{ szene: "d_kreis", titel: "Winkel für Winkel", p: { gesamt: 40, teile: [["Fußball", 16], ["Basketball", 12], ["Schwimmen", 8], ["Leichtathletik", 4]] } }],
  "median-und-spannweite": [
    { szene: "d_median", titel: "Sortieren und Mitte", p: { werte: [3, 7, 2, 9, 5] } },
    { szene: "d_median", titel: "Gerade Anzahl", p: { werte: [1, 0, 2, 1, 3, 1, 0, 5, 1, 2] } },
  ],
  "relative-haeufigkeit": [
    { szene: "d_klassen", titel: "Gruppen vergleichen", p: { a: ["6a", 28, 9], b: ["6b", 32, 10], was: "Bus" } },
    { szene: "d_zwecke", titel: "50 Würfe", p: { n: 50, k: 32, seed: 15, ja: "Kopf" } },
  ],
  "zufall-und-wahrscheinlichkeit": [
    { szene: "d_urne", titel: "Günstige durch mögliche", p: {} },
    { szene: "d_gesetz", titel: "Viele Würfe", p: { n: 300, seed: 162 } },
  ],

  /* ---------- VIII Zuordnungen ---------- */
  "zuordnungen-tabelle-graph": [
    { szene: "d_wertegraph", titel: "Tabelle wird Graph", p: { xs: [0, 2, 4, 6], ys: [0, 30, 60, 90], weiter: [10, 150], xName: "Zeit", yName: "Wasser", ex: "min", ey: "l", xmax: 10, ymax: 150, xt: [0, 2, 4, 6, 8, 10], yt: [0, 50, 100, 150] } },
    { szene: "d_temperatur", titel: "Graph lesen", p: { punkte: [[6, 12], [8, 14], [10, 17], [12, 20], [14, 22], [16, 21], [18, 18], [20, 14]], ablesen: 10 } },
  ],
  "proportionale-zuordnungen": [{ szene: "d_proportional", titel: "Doppelt so viel", p: { k: 0.45, n: 6, ding: "Brötchen" } }],
  "dreisatz": [
    { szene: "d_dreisatz", titel: "Über die Eins", p: {
      kopf: ["Hefte", "Preis"], bild: "heft",
      zeilen: [{ l: 4, r: 3.2, rt: "3,20 €" }, { l: 1, r: 0.8, rt: "0,80 €" }, { l: 7, r: 5.6, rt: "5,60 €" }],
      ops: [[": 4", ": 4"], ["· 7", "· 7"]],
      texte: ["4 Hefte kosten 3,20 €. Was kosten 7 Hefte?", "Auf eins herunter: beide Seiten durch 4 – ein Heft kostet 0,80 €.", "Auf sieben hoch: beide Seiten mal 7.", "7 Hefte kosten 5,60 €. Beide Spalten wurden gleich behandelt."],
    } },
  ],
  "antiproportionale-zuordnungen": [
    { szene: "d_antiprop", titel: "Gleiche Arbeit", p: { produkt: 24, schritte: [2, 3, 4, 6, 8, 12], x: "Maler", y: "Stunden" } },
    { szene: "d_dreisatz", titel: "Gegensätzlich rechnen", p: {
      kopf: ["Maler", "Stunden"], bild: "maler",
      zeilen: [{ l: 4, r: 6, rt: "6 h" }, { l: 1, r: 24, rt: "24 h" }, { l: 6, r: 4, rt: "4 h" }],
      ops: [[": 4", "· 4"], ["· 6", ": 6"]],
      texte: ["4 Maler brauchen 6 Stunden. Wie lange brauchen 6 Maler?", "Ein Maler allein braucht 4-mal so lange: links durch 4, rechts mal 4.", "6 Maler sind 6-mal so schnell: links mal 6, rechts durch 6.", "6 Maler brauchen 4 Stunden. In der Mitte wird gegensätzlich gerechnet."],
    } },
  ],
};
