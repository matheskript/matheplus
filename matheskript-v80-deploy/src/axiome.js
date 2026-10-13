/* ======================================================================
   axiome.js – reine Mathematik und Inhalte des Moduls „Axiome“ (Mathe entdecken, Lernangebot 1).
   Kein React, keine Imports. Alles, was sich rechnerisch prüfen lässt, steht hier und wird
   in tests/axiome.test.mjs mit einem kleinen TeX-Auswerter nachgerechnet:
   · jede Zeile jeder Umformung (Kürzen, Erweitern, quadratische Ergänzung, binomische Formeln)
   · Proben der Gesetze, Verkleidungen von 1 und 0, Ergänzungszahlen, Inverse

   Zeilenformat der Rechenwege: { seg: [ "TeX" | { t: "TeX", k: "eins" | "null" | "dist" } ], grund: "Begründung" }
   k = Hervorhebung: „eins“ = verkleidete 1 (Multiplikation), „null“ = verkleidete 0 (Addition),
   „dist“ = Distributivgesetz.
   ====================================================================== */

/* Minuszeichen typografisch (wie minusZ in ui3.jsx) */
export const mz = (s) => String(s).replace(/-/g, "−");

/* Luft um Rechenzeichen: „a^2+2ab-b\\cdot b“ → „a^2 + 2ab - b \\cdot b“. Das einzeilige Minus am Anfang oder nach „(“ bleibt eng.
   Nicht für Zeilen mit \\text{…} verwenden (dort steht „:=“ und Fließtext). Ändert nie den Wert. */
export const schoen = (t) => String(t)
  .replace(/\s*\\cdot\s*/g, " \\cdot ")
  .replace(/\s*([+=])\s*/g, " $1 ")
  .replace(/([A-Za-z0-9)}])\s*-\s*(?=[A-Za-z0-9({\\])/g, "$1 - ")
  .replace(/\s+/g, " ")
  .trim();

/* ---------------------------------------------------------------------
   Die Axiome (Spickzettel)
   --------------------------------------------------------------------- */
export const AXIOME = [
  { kz: "A1", art: "plus", name: "Assoziativgesetz (+)", tex: "(a+b)+c = a+(b+c)" },
  { kz: "A2", art: "plus", name: "Kommutativgesetz (+)", tex: "a+b = b+a" },
  { kz: "A3", art: "plus", name: "Neutrales Element (+)", tex: "a+0 = a" },
  { kz: "A4", art: "plus", name: "Inverses Element (+)", tex: "a+(-a) = 0" },
  { kz: "M1", art: "mal", name: "Assoziativgesetz (·)", tex: "(a\\cdot b)\\cdot c = a\\cdot(b\\cdot c)" },
  { kz: "M2", art: "mal", name: "Kommutativgesetz (·)", tex: "a\\cdot b = b\\cdot a" },
  { kz: "M3", art: "mal", name: "Neutrales Element (·)", tex: "a\\cdot 1 = a" },
  { kz: "M4", art: "mal", name: "Inverses Element (·), nur für a ≠ 0", tex: "a\\cdot\\frac{1}{a} = 1" },
  { kz: "D", art: "dist", name: "Distributivgesetz", tex: "a\\cdot(b+c) = a\\cdot b + a\\cdot c" },
  { kz: "N", art: "dist", name: "Nichttrivialität", tex: "0 \\neq 1" },
];

/* ---------------------------------------------------------------------
   Gesetze zum Ausprobieren: zeige(a,b,c) → [links, rechts] als TeX, pruefe(a,b,c) → [links, rechts] als Zahlen
   --------------------------------------------------------------------- */
const ft = (n) => String(n);
export const PLUS_GESETZE = [
  { kz: "A1", name: "Assoziativgesetz", tex: "(a+b)+c = a+(b+c)",
    text: "Die Klammern dürfen wandern. Darum darf man a + b + c ohne Klammern schreiben.",
    zeige: (a, b, c) => [`(${ft(a)}+${ft(b)})+${ft(c)}`, `${ft(a)}+(${ft(b)}+${ft(c)})`],
    pruefe: (a, b, c) => [(a + b) + c, a + (b + c)] },
  { kz: "A2", name: "Kommutativgesetz", tex: "a+b = b+a",
    text: "Die Reihenfolge der Summanden ist egal.",
    zeige: (a, b) => [`${ft(a)}+${ft(b)}`, `${ft(b)}+${ft(a)}`],
    pruefe: (a, b) => [a + b, b + a] },
  { kz: "A3", name: "Neutrales Element: 0", tex: "a+0 = a", neutral: true,
    text: "Die 0 verändert bei der Addition nichts – sie ist das neutrale Element.",
    zeige: (a) => [`${ft(a)}+0`, `${ft(a)}`],
    pruefe: (a) => [a + 0, a] },
  { kz: "A4", name: "Inverses Element: −a", tex: "a+(-a) = 0",
    text: "Zu jeder Zahl a gibt es eine Zahl −a, die mit a addiert das neutrale Element 0 ergibt.",
    zeige: (a) => [`${ft(a)}+(-${ft(a)})`, "0"],
    pruefe: (a) => [a + (-a), 0] },
];

export const MAL_GESETZE = [
  { kz: "M1", name: "Assoziativgesetz", tex: "(a\\cdot b)\\cdot c = a\\cdot(b\\cdot c)",
    text: "Die Klammern dürfen wandern. Darum darf man a · b · c ohne Klammern schreiben.",
    zeige: (a, b, c) => [`(${ft(a)}\\cdot ${ft(b)})\\cdot ${ft(c)}`, `${ft(a)}\\cdot(${ft(b)}\\cdot ${ft(c)})`],
    pruefe: (a, b, c) => [(a * b) * c, a * (b * c)] },
  { kz: "M2", name: "Kommutativgesetz", tex: "a\\cdot b = b\\cdot a",
    text: "Die Reihenfolge der Faktoren ist egal.",
    zeige: (a, b) => [`${ft(a)}\\cdot ${ft(b)}`, `${ft(b)}\\cdot ${ft(a)}`],
    pruefe: (a, b) => [a * b, b * a] },
  { kz: "M3", name: "Neutrales Element: 1", tex: "a\\cdot 1 = a", neutral: true,
    text: "Die 1 verändert bei der Multiplikation nichts – sie ist das neutrale Element.",
    zeige: (a) => [`${ft(a)}\\cdot 1`, `${ft(a)}`],
    pruefe: (a) => [a * 1, a] },
  { kz: "M4", name: "Inverses Element: 1/a", tex: "a\\cdot\\frac{1}{a} = 1",
    text: "Zu jeder Zahl a ≠ 0 gibt es eine Zahl 1/a, die mit a multipliziert das neutrale Element 1 ergibt.",
    zeige: (a) => [`${ft(a)}\\cdot\\frac{1}{${ft(a)}}`, "1"],
    pruefe: (a) => [a * (1 / a), 1] },
];

/* Distributivgesetz als Rechteck: Höhe a, Breite b + c */
export const distribut = (a, b, c) => ({ gesamt: a * (b + c), teil1: a * b, teil2: a * c, summe: a * b + a * c });

/* ---------------------------------------------------------------------
   Verkleidungen von 1 und 0
   --------------------------------------------------------------------- */
export function verkleideteEins(n) {
  return {
    richtig: { id: "r", tex: `\\frac{${n}}{${n}}`, wert: 1 },
    falsch: [
      { id: "f0", tex: `${n}-${n}`, wert: 0, art: "null" },
      { id: "f1", tex: `\\frac{${n}}{${n + 1}}`, wert: n / (n + 1), art: "bruch" },
      { id: "f2", tex: `\\frac{${n + 1}}{${n}}`, wert: (n + 1) / n, art: "bruch" },
    ],
  };
}
export function verkleideteNull(n) {
  return {
    richtig: { id: "r", tex: `${n}-${n}`, wert: 0 },
    falsch: [
      { id: "f1", tex: `\\frac{${n}}{${n}}`, wert: 1, art: "eins" },
      { id: "f2", tex: `${n}-1`, wert: n - 1, art: "zahl" },
      { id: "f3", tex: `${n}+${n}`, wert: 2 * n, art: "zahl" },
    ],
  };
}

/* Verkleidungs-Labor: n wählen, 1 und 0 in mehreren Verkleidungen zeigen */
export function verkleidungen(n) {
  return {
    eins: [`\\frac{${n}}{${n}}`, `\\frac{1}{${n}}\\cdot ${n}`, `\\frac{${n + 1}}{${n + 1}}`],
    null: [`${n}-${n}`, `${n}+(-${n})`, `(${n + 1})-(${n + 1})`],
  };
}

/* ---------------------------------------------------------------------
   Quadratische Ergänzung von x² + b·x (b gerade, ≠ 0)
   --------------------------------------------------------------------- */
export function ergaenzung(b) {
  const h = Math.abs(b) / 2, q = h * h;
  const vz = b > 0 ? "+" : "-";
  return {
    b, h, q,
    zeilen: [
      { seg: [`x^2${vz}${Math.abs(b)}x`], grund: "Ausgangsterm – noch kein vollständiges Quadrat" },
      { seg: [`=x^2${vz}${Math.abs(b)}x`, { t: `+${q}-${q}`, k: "null" }], grund: `0 addieren: ${q} − ${q} = 0 (neutrales Element der Addition)` },
      { seg: [`=(x^2${vz}${Math.abs(b)}x+${q})`, { t: `-${q}`, k: "null" }], grund: "Assoziativgesetz: die ersten drei Summanden zusammenfassen" },
      { seg: [`=(x${vz}${h})^2-${q}`], grund: b > 0 ? `Erste binomische Formel rückwärts: x² + ${b}x + ${q} = (x + ${h})²` : `Zweite binomische Formel rückwärts: x² − ${Math.abs(b)}x + ${q} = (x − ${h})²` },
    ],
  };
}

/* ---------------------------------------------------------------------
   Beispiele: Kürzen, Erweitern, quadratische Ergänzung (mit Gleichung)
   proben: Belegungen der Variablen, an denen jede Zeile denselben Wert haben muss
   --------------------------------------------------------------------- */
export const BEISPIELE_KUERZEN = [
  { id: "k1", titel: "2a/2b", vars: ["a", "b"], proben: [[2, 3], [5, 7], [-4, 9], [0.5, 2]],
    zeilen: [
      { seg: ["\\frac{2a}{2b}"], grund: "Ausgangsbruch: Zähler 2a = 2 · a, Nenner 2b = 2 · b" },
      { seg: ["=", { t: "\\frac{2}{2}", k: "eins" }, "\\cdot\\frac{a}{b}"], grund: "Der Bruch zerfällt in zwei Faktoren: 2/2 und a/b" },
      { seg: ["=", { t: "1", k: "eins" }, "\\cdot\\frac{a}{b}"], grund: "2/2 = 1, denn 2 · (1/2) = 1 (inverses Element der Multiplikation)" },
      { seg: ["=\\frac{a}{b}"], grund: "Neutrales Element: 1 · x = x. Die 1 verschwindet – mehr ist „Kürzen“ nicht." },
    ] },
  { id: "k2", titel: "6x/9", vars: ["x"], proben: [[2], [3], [-5], [0.5]],
    zeilen: [
      { seg: ["\\frac{6x}{9}"], grund: "Ausgangsbruch: 6x = 3 · 2x und 9 = 3 · 3" },
      { seg: ["=", { t: "\\frac{3}{3}", k: "eins" }, "\\cdot\\frac{2x}{3}"], grund: "Zerlegen in 3/3 und 2x/3" },
      { seg: ["=", { t: "1", k: "eins" }, "\\cdot\\frac{2x}{3}"], grund: "3/3 = 1" },
      { seg: ["=\\frac{2x}{3}"], grund: "Neutrales Element: 1 · x = x" },
    ] },
  { id: "k3", titel: "(x²−x)/x", vars: ["x"], proben: [[2], [3], [-5], [0.5]], ausnahme: "x ≠ 0",
    zeilen: [
      { seg: ["\\frac{x^2-x}{x}"], grund: "Ausgangsbruch (nur für x ≠ 0 erklärt)" },
      { seg: ["=\\frac{x\\cdot(x-1)}{x}"], grund: "Ausklammern – das Distributivgesetz rückwärts" },
      { seg: ["=", { t: "\\frac{x}{x}", k: "eins" }, "\\cdot(x-1)"], grund: "Zerlegen in x/x und x − 1" },
      { seg: ["=", { t: "1", k: "eins" }, "\\cdot(x-1)"], grund: "x/x = 1 – das geht nur, weil x ≠ 0 ein Inverses hat" },
      { seg: ["=x-1"], grund: "Neutrales Element: 1 · y = y" },
    ] },
];

/* Genauer hingeschaut: warum 2a/2b in 2/2 und a/b zerfällt (a, b ≠ 0) */
export const BEWEIS_KUERZEN = {
  vars: ["a", "b"], proben: [[2, 3], [5, 7], [-4, 9], [0.5, 2]],
  zeilen: [
    { seg: ["\\frac{2a}{2b}"], grund: "Ein Bruch ist Zähler mal Inverses des Nenners: z/n := z · (1/n)" },
    { seg: ["=(2a)\\cdot\\frac{1}{2b}"], grund: "Definition des Bruchs" },
    { seg: ["=(2a)\\cdot(\\frac{1}{2}\\cdot\\frac{1}{b})"], grund: "Es gilt 1/(2b) = 1/2 · 1/b, denn (2b) · (1/2 · 1/b) = (2 · 1/2) · (b · 1/b) = 1 · 1 = 1 – und das Inverse ist eindeutig" },
    { seg: ["=(2\\cdot\\frac{1}{2})\\cdot(a\\cdot\\frac{1}{b})"], grund: "Assoziativ- und Kommutativgesetz: umsortieren" },
    { seg: ["=", { t: "1", k: "eins" }, "\\cdot\\frac{a}{b}"], grund: "Inverses Element (M4): 2 · 1/2 = 1, und a · 1/b = a/b" },
    { seg: ["=\\frac{a}{b}"], grund: "Neutrales Element (M3)" },
  ],
};

export const BEISPIELE_ERWEITERN = [
  { id: "e1", titel: "1/3 + 1/4", vars: [], proben: [[]],
    zeilen: [
      { seg: ["\\frac{1}{3}+\\frac{1}{4}"], grund: "Zwei Brüche mit verschiedenen Nennern lassen sich nicht direkt addieren" },
      { seg: ["=\\frac{1}{3}\\cdot", { t: "\\frac{4}{4}", k: "eins" }, "+\\frac{1}{4}\\cdot", { t: "\\frac{3}{3}", k: "eins" }], grund: "Mit zwei verschiedenen Einsen multiplizieren: 4/4 und 3/3 – der Wert bleibt, das Aussehen ändert sich" },
      { seg: ["=\\frac{4}{12}+\\frac{3}{12}"], grund: "Brüche multiplizieren – jetzt haben beide denselben Nenner" },
      { seg: ["=\\frac{7}{12}"], grund: "Addieren" },
    ] },
  { id: "e2", titel: "1/√2", vars: [], proben: [[]],
    zeilen: [
      { seg: ["\\frac{1}{\\sqrt{2}}"], grund: "Ausgangsterm: Wurzel im Nenner" },
      { seg: ["=\\frac{1}{\\sqrt{2}}\\cdot", { t: "\\frac{\\sqrt{2}}{\\sqrt{2}}", k: "eins" }], grund: "Mit der Eins √2/√2 multiplizieren" },
      { seg: ["=\\frac{\\sqrt{2}}{2}"], grund: "Im Nenner: √2 · √2 = 2" },
    ] },
];

/* Gleichung: Ergänzung mit 9 − 9. Beide Lösungen (1 und −7) müssen jede Zeile erfüllen. */
export const BEISPIEL_GLEICHUNG = {
  id: "g1", titel: "x² + 6x = 7", loesungen: [1, -7], variable: "x",
  zeilen: [
    { seg: ["x^2+6x=7"], grund: "Links steht noch kein vollständiges Quadrat" },
    { seg: ["x^2+6x", { t: "+9-9", k: "null" }, "=7"], grund: "Links 0 addieren: 9 − 9 = 0" },
    { seg: ["(x^2+6x+9)", { t: "-9", k: "null" }, "=7"], grund: "Assoziativgesetz: die ersten drei Summanden zusammenfassen" },
    { seg: ["(x+3)^2-9=7"], grund: "Erste binomische Formel rückwärts: x² + 6x + 9 = (x + 3)²" },
    { seg: ["(x+3)^2=16"], grund: "Auf beiden Seiten 9 addieren: die zweite 9 wandert auf die rechte Seite (7 + 9 = 16)" },
  ],
};

/* ---------------------------------------------------------------------
   Inverse Elemente
   --------------------------------------------------------------------- */
export function inversen(a) {
  const neg = -a;
  const ok = a !== 0;
  return {
    a, neg, kehr: ok ? 1 / a : null, kehrExistiert: ok,
    add: [a, neg, a + neg],
    mal: ok ? [a, 1 / a, a * (1 / a)] : null,
  };
}

/* Subtraktion und Division sind nur Kurzschreibweisen */
export const UMSCHREIBUNGEN = [
  { kurz: "8-3", lang: "8+(-3)", art: "plus" },
  { kurz: "x-y", lang: "x+(-y)", art: "plus" },
  { kurz: "12:4", lang: "12\\cdot\\frac{1}{4}", art: "mal" },
  { kurz: "\\frac{a}{b}", lang: "a\\cdot\\frac{1}{b}", art: "mal" },
];

/* (8−3)−2 gegen 8−(3−2) und (24:4):2 gegen 24:(4:2) */
export const NICHT_ASSOZIATIV = {
  minus: { links: (8 - 3) - 2, rechts: 8 - (3 - 2) },
  geteilt: { links: (24 / 4) / 2, rechts: 24 / (4 / 2) },
  plusMitInversen: [8 + (-3) + (-2), 8 + ((-3) + (-2)), (8 + (-3)) + (-2)],
};

/* ---------------------------------------------------------------------
   Beweise
   --------------------------------------------------------------------- */
/* Beweis 1: a · 0 = 0 (kein numerischer Zeilenvergleich: x steht für a · 0) */
export const BEWEIS_MAL_NULL = [
  { seg: ["a\\cdot 0 = a\\cdot(0+0)"], grund: "0 + 0 = 0 (neutrales Element der Addition, A3)" },
  { seg: ["= a\\cdot 0 + a\\cdot 0"], grund: "Distributivgesetz (D)" },
  { seg: ["\\text{Setze } x := a\\cdot 0.\\quad \\text{Dann gilt } x = x+x."], grund: "Zusammenfassung der beiden Zeilen" },
  { seg: ["x+(-x) = (x+x)+(-x)"], grund: "Auf beiden Seiten das Inverse −x addieren" },
  { seg: ["0 = x+(x+(-x))"], grund: "Links: inverses Element (A4). Rechts: Assoziativgesetz (A1)" },
  { seg: ["0 = x+0"], grund: "Inverses Element (A4)" },
  { seg: ["0 = x"], grund: "Neutrales Element (A3)" },
  { seg: ["\\text{Also } a\\cdot 0 = 0 \\text{ für jede Zahl } a."], grund: "Wegen M2 gilt auch 0 · a = 0" },
];

/* Beweis 2: 1/0 gibt es nicht */
export const BEWEIS_KEIN_INVERSES = [
  { seg: ["\\text{Annahme: Es gibt } b \\text{ mit } 0\\cdot b = 1."], grund: "Indirekter Beweis: Wir nehmen das Gegenteil an" },
  { seg: ["0\\cdot b = b\\cdot 0 = 0"], grund: "Kommutativgesetz (M2) und Beweis 1" },
  { seg: ["1 = 0\\cdot b = 0"], grund: "Aus der Annahme und der Zeile darüber folgt 1 = 0" },
  { seg: ["a = a\\cdot 1 = a\\cdot 0 = 0"], grund: "Für jede Zahl a: neutrales Element (M3), dann 1 = 0, dann Beweis 1" },
  { seg: ["\\text{Alle Zahlen wären gleich } 0."], grund: "Widerspruch zu 0 ≠ 1 (N) – die Annahme war falsch" },
];

/* Beweis 3: erste binomische Formel – jede Zeile hat für alle a, b denselben Wert */
export const BEWEIS_BINOM1 = {
  vars: ["a", "b"], proben: [[3, 4], [-2, 5], [0.5, -7], [0, 3]],
  zeilen: [
    { seg: ["(a+b)^2"], grund: "Quadrat bedeutet: mit sich selbst multiplizieren" },
    { seg: ["=(a+b)\\cdot(a+b)"], grund: "Definition von x² := x · x" },
    { seg: ["=(a+b)\\cdot a+(a+b)\\cdot b"], grund: "Distributivgesetz (D) mit x = a + b" },
    { seg: ["=a\\cdot a+b\\cdot a+a\\cdot b+b\\cdot b"], grund: "Distributivgesetz noch zweimal (mit M2 für die Reihenfolge)" },
    { seg: ["=a^2+a\\cdot b+a\\cdot b+b^2"], grund: "Kommutativgesetz (M2): b · a = a · b" },
    { seg: ["=a^2+", { t: "1\\cdot a\\cdot b+1\\cdot a\\cdot b", k: "eins" }, "+b^2"], grund: "Neutrales Element (M3): ab = 1 · ab" },
    { seg: ["=a^2+", { t: "(1+1)", k: "dist" }, "\\cdot a\\cdot b+b^2"], grund: "Distributivgesetz rückwärts: 1 · ab + 1 · ab = (1 + 1) · ab" },
    { seg: ["=a^2+2ab+b^2"], grund: "Definition: 2 := 1 + 1" },
  ],
};

/* Beweis 4a/4b: zweite und dritte binomische Formel (setzen a − b = a + (−b) und die Hilfsergebnisse voraus) */
export const BEWEIS_BINOM2 = {
  vars: ["a", "b"], proben: [[3, 4], [-2, 5], [0.5, -7], [0, 3]],
  zeilen: [
    { seg: ["(a-b)^2"], grund: "a − b ist die Kurzschreibweise für a + (−b)" },
    { seg: ["=(a+(-b))\\cdot(a+(-b))"], grund: "Quadrat bedeutet: mit sich selbst multiplizieren" },
    { seg: ["=a\\cdot a+a\\cdot(-b)+(-b)\\cdot a+(-b)\\cdot(-b)"], grund: "Distributivgesetz wie in Beweis 3" },
    { seg: ["=a^2-a\\cdot b-a\\cdot b+b\\cdot b"], grund: "Hilfsergebnisse: a · (−b) = −(ab), (−b) · a = −(ab), (−b) · (−b) = b · b" },
    { seg: ["=a^2-2ab+b^2"], grund: "Wie in Beweis 3: ab + ab = 2ab, also −ab − ab = −2ab" },
  ],
};

export const BEWEIS_BINOM3 = {
  vars: ["a", "b"], proben: [[3, 4], [-2, 5], [0.5, -7], [0, 3]],
  zeilen: [
    { seg: ["(a+b)\\cdot(a-b)"], grund: "a − b ist die Kurzschreibweise für a + (−b)" },
    { seg: ["=(a+b)\\cdot(a+(-b))"], grund: "Umschreiben" },
    { seg: ["=a\\cdot a+a\\cdot(-b)+b\\cdot a+b\\cdot(-b)"], grund: "Distributivgesetz (D)" },
    { seg: ["=a^2-a\\cdot b+a\\cdot b-b\\cdot b"], grund: "Hilfsergebnis: a · (−b) = −(ab) und b · (−b) = −(b · b)" },
    { seg: ["=a^2+", { t: "(-a\\cdot b+a\\cdot b)", k: "null" }, "-b\\cdot b"], grund: "Kommutativ- und Assoziativgesetz: −ab und +ab nebeneinander stellen" },
    { seg: ["=a^2+", { t: "0", k: "null" }, "-b\\cdot b"], grund: "Inverses Element (A4): −ab + ab = 0" },
    { seg: ["=a^2-b^2"], grund: "Neutrales Element (A3): x + 0 = x" },
  ],
};

/* Hilfsergebnis: Plus mal Minus */
export const BEWEIS_PLUS_MAL_MINUS = [
  { seg: ["a\\cdot b + a\\cdot(-b)"], grund: "Wir zeigen: Das ist 0" },
  { seg: ["= a\\cdot(b+(-b))"], grund: "Distributivgesetz rückwärts (D)" },
  { seg: ["= a\\cdot 0"], grund: "Inverses Element (A4)" },
  { seg: ["= 0"], grund: "Beweis 1" },
  { seg: ["\\text{Also ist } a\\cdot(-b) \\text{ das Inverse von } a\\cdot b:\\quad a\\cdot(-b) = -(a\\cdot b)."], grund: "Zu jeder Zahl gibt es nur ein additives Inverses (Eindeutigkeit, siehe Kasten)" },
];

/* Eindeutigkeit des Inversen: p + q = 0 und p + q' = 0 ⇒ q = q' */
export const BEWEIS_EINDEUTIG = [
  { seg: ["q = q+0"], grund: "Neutrales Element (A3)" },
  { seg: ["= q+(p+q')"], grund: "Annahme: p + q' = 0" },
  { seg: ["= (q+p)+q'"], grund: "Assoziativgesetz (A1)" },
  { seg: ["= 0+q'"], grund: "Annahme: q + p = p + q = 0 (A2)" },
  { seg: ["= q'"], grund: "Neutrales Element (A3, mit A2)" },
];
