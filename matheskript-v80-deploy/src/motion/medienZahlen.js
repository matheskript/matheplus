/* Animationen je Lerneinheit, Gruppe Zahlen und Rechnen (Klasse 5): { [einheitId]: [{ szene, titel, p }] } – reine Daten */
export const ANIM_ZAHLEN = {
  "negative-zahlen": [{ szene: "thermometer", titel: "Unter null", p: { start: 3, ende: -8 } }],
  "anordnung-und-betrag": [{ szene: "ordnenBetrag", titel: "Ordnen und Betrag", p: { zahlen: [4, -9, 0, -3, 7, -1], betrag: -9 } }],
  "addieren-subtrahieren-ganze-zahlen": [
    { szene: "ganzSprung", titel: "Plus: nach rechts", p: { a: -8, op: "+", b: 3 } },
    { szene: "ganzSprung", titel: "Minus: nach links", p: { a: 5, op: "-", b: 9 } },
    { szene: "ganzSprung", titel: "Minus minus", p: { a: -4, op: "-", b: -7 } },
  ],
  "multiplizieren-dividieren-ganze-zahlen": [{ szene: "vorzeichen", titel: "Vorzeichenregeln", p: { a: 6, b: -7 } }],
  "schriftlich-addieren-subtrahieren": [
    { szene: "schriftlich", titel: "Schriftlich addieren", p: { art: "plus", a: 4758, b: 2697 } },
    { szene: "schriftlich", titel: "Schriftlich subtrahieren", p: { art: "minus", a: 7203, b: 4586 } },
  ],
  "schriftlich-multiplizieren": [{ szene: "schriftlichMal", titel: "Schriftlich multiplizieren", p: { a: 528, b: 34 } }],
  "schriftlich-dividieren": [{ szene: "schriftlichGeteilt", titel: "Schriftlich dividieren", p: { a: 9435, b: 15 } }],
  "teiler-und-vielfache": [
    { szene: "teilerbogen", titel: "Teilerpaare", p: { n: 60 } },
    { szene: "punktrechtecke", titel: "Teiler als Rechtecke", p: { n: 12 } },
  ],
  "teilbarkeitsregeln": [{ szene: "quersumme", titel: "Die Teilbarkeitsregeln", p: { zahl: 7236 } }],
  "primzahlen-und-primfaktorzerlegung": [{ szene: "faktorbaum", titel: "Primfaktoren", p: { zahl: 360 } }],
  "ggt-und-kgv": [
    { szene: "kgv", titel: "Zwei Buslinien", p: { a: 12, b: 20, einheit: "Minuten", text: "Nach 60 Minuten, um 9:00 Uhr, fahren beide wieder gemeinsam." } },
    { szene: "ggt", titel: "Der ggT", p: { a: 12, b: 20 } },
  ],
  "zaehlen-und-darstellen": [{ szene: "strichliste", titel: "Von Strichen zu Säulen", p: { daten: [["Hund", 7], ["Katze", 9], ["Hase", 3], ["keins", 8]] } }],
  "zahlenstrahl-und-anordnung": [{ szene: "zahlenlupe", titel: "Ordnen mit der Lupe", p: { von: 0, bis: 5000, schritt: 500, jede: 2, zahlen: [4071, 4107, 982, 4017], lupe: [4000, 4120, 10], lupeJede: 2 } }],
  "runden-und-ueberschlagen": [
    { szene: "runden", titel: "Auf Tausender runden", p: { zahl: 84739, stelle: 1000 } },
    { szene: "runden", titel: "Auf Hunderter runden", p: { zahl: 84739, stelle: 100 } },
  ],
  "addieren-und-subtrahieren": [{ szene: "rechenstrich", titel: "Geschickt im Kopf", p: { aufgabe: "296 + 457", start: 457, spruenge: [300, -4], starttext: "296 + 457: Start bei 457, statt 296 erst 300 dazu." } }],
  "multiplizieren-und-dividieren": [
    { szene: "malfeld", titel: "Mal und geteilt", p: { a: 3, b: 8 } },
    { szene: "umformung4", titel: "Teilen in Schritten", p: { zeilen: [
      { t: "168 : 7", n: "zerlegen" },
      { t: "140 : 7 + 28 : 7", m: "140 : 7", n: "7 · 20 = 140" },
      { t: "20 + 4", m: "20 + 4", n: "28 : 7 = 4" },
      { t: "24" },
    ] } },
  ],
  "rechengesetze-und-rechenvorteile": [
    { szene: "distributiv", titel: "Verteilen (D)", p: { a: 12, gross: 100, klein: 2 } },
    { szene: "umformung3", titel: "Vertauschen und klammern", p: { zeilen: [
      { t: "8 · 125 · 7", m: "8 · 125", n: "Klammern verschieben (A)" },
      { t: "1000 · 7", m: "1000", n: "glatte Zahl" },
      { t: "7000" },
    ] } },
  ],
  "potenzen-quadratzahlen": [
    { szene: "quadrat", titel: "Quadratzahlen", p: { n: 5 } },
    { szene: "umformung3", titel: "Potenzen ausrechnen", p: { zeilen: [
      { t: "2⁵ - 5²", m: "2⁵", n: "2 · 2 · 2 · 2 · 2" },
      { t: "32 - 25", m: "25", n: "5 · 5" },
      { t: "7" },
    ] } },
  ],
  "grosse-zahlen-stellenwerttafel": [{ szene: "stellentafel", titel: "Die Stellenwerttafel", p: { zahl: 3407250 } }],
  "roemische-zahlen-zweiersystem": [
    { szene: "roemisch", titel: "Römische Zahlen", p: { zahl: 2026 } },
    { szene: "roemisch", titel: "Mit Abziehen", p: { zahl: 1994 } },
    { szene: "zweier", titel: "Das Zweiersystem", p: { zahl: 19 } },
  ],
  "rechenausdruecke-klammern": [{ szene: "umformung4", titel: "Klammer, Punkt, Strich", p: { zeilen: [
    { t: "3 + 4 · (6 - 1)", m: "(6 - 1)", n: "Klammer zuerst" },
    { t: "3 + 4 · 5", m: "4 · 5", n: "Punkt vor Strich" },
    { t: "3 + 20", m: "3 + 20", n: "Strich" },
    { t: "23" },
  ] } }],
};
