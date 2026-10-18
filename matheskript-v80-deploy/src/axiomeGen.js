/* ======================================================================
   axiomeGen.js – Übungsaufgaben zu „Axiome und Rechenregeln“.
   Kein React, Node-testbar (tests/axiomeGen.test.mjs).

   Die neun Gesetze (Kennzeichen wie im Lernmodul, axiome.js):
     A1 Assoziativ (+)  A2 Kommutativ (+)  A3 Neutrales Element 0  A4 Inverses −a
     M1 Assoziativ (·)  M2 Kommutativ (·)  M3 Neutrales Element 1  M4 Inverses 1/a (a ≠ 0)
     D  Distributivgesetz
   Jede Gleichung, die eine Aufgabe als Beispiel eines Gesetzes zeigt, trägt
   Prüffunktionen (links/rechts als Zahl), damit der Test nachrechnen kann,
   dass beide Seiten wirklich gleich sind.
   ====================================================================== */
import { ggT, q, qNeg, qDiv, qNum, qTex } from "./rechnen2.js";

export const KZ = ["A1", "A2", "A3", "A4", "M1", "M2", "M3", "M4", "D"];
export const KZ_NAME = {
  A1: ["Assoziativgesetz der Addition", "associative law of addition"],
  A2: ["Kommutativgesetz der Addition", "commutative law of addition"],
  A3: ["Neutrales Element der Addition (0)", "identity of addition (0)"],
  A4: ["Inverses Element der Addition (−a)", "additive inverse (−a)"],
  M1: ["Assoziativgesetz der Multiplikation", "associative law of multiplication"],
  M2: ["Kommutativgesetz der Multiplikation", "commutative law of multiplication"],
  M3: ["Neutrales Element der Multiplikation (1)", "identity of multiplication (1)"],
  M4: ["Inverses Element der Multiplikation (1/a)", "multiplicative inverse (1/a)"],
  D: ["Distributivgesetz", "distributive law"],
};
export const KZ_FORMEL = {
  A1: "(a + b) + c = a + (b + c)", A2: "a + b = b + a", A3: "a + 0 = a", A4: "a + (−a) = 0",
  M1: "(a \\cdot b) \\cdot c = a \\cdot (b \\cdot c)", M2: "a \\cdot b = b \\cdot a", M3: "a \\cdot 1 = a", M4: "a \\cdot \\frac{1}{a} = 1",
  D: "a \\cdot (b + c) = a \\cdot b + a \\cdot c",
};
/* Nächste Verwandte – gute Ablenker, weil man sie leicht verwechselt */
const VERWANDT = {
  A1: ["A2", "M1", "D"], A2: ["A1", "M2", "A3"], A3: ["M3", "A4", "A2"], A4: ["A3", "M4", "A2"],
  M1: ["M2", "A1", "D"], M2: ["M1", "A2", "D"], M3: ["A3", "M4", "M2"], M4: ["M3", "A4", "M2"], D: ["M1", "A1", "M2"],
};
export const ablenker = (kz) => VERWANDT[kz];

const wahlAus = (l, z) => l[Math.floor(z() * l.length)];
const ganz = (lo, hi, z) => lo + Math.floor(z() * (hi - lo + 1));
const neg = (v) => (v < 0 ? `(−${-v})` : String(v));

/* ---------- Beispiele mit Zahlen ----------
   je Gesetz: (z) → { tex, links(), rechts() } */
const ZAHL = {
  A1: (z) => { const a = ganz(2, 40, z), b = ganz(2, 40, z), c = ganz(2, 40, z); return { tex: `(${a} + ${b}) + ${c} = ${a} + (${b} + ${c})`, l: (a + b) + c, r: a + (b + c) }; },
  A2: (z) => { const a = ganz(2, 99, z), b = ganz(2, 99, z); return { tex: `${a} + ${b} = ${b} + ${a}`, l: a + b, r: b + a }; },
  A3: (z) => { const a = ganz(2, 99, z) * (z() < 0.3 ? -1 : 1); return { tex: `${neg(a)} + 0 = ${a < 0 ? "−" + -a : a}`, l: a + 0, r: a }; },
  A4: (z) => { const a = ganz(2, 99, z); return { tex: `${a} + (−${a}) = 0`, l: a + -a, r: 0 }; },
  M1: (z) => { const a = ganz(2, 12, z), b = ganz(2, 12, z), c = ganz(2, 12, z); return { tex: `(${a} \\cdot ${b}) \\cdot ${c} = ${a} \\cdot (${b} \\cdot ${c})`, l: (a * b) * c, r: a * (b * c) }; },
  M2: (z) => { const a = ganz(2, 30, z), b = ganz(2, 30, z); return { tex: `${a} \\cdot ${b} = ${b} \\cdot ${a}`, l: a * b, r: b * a }; },
  M3: (z) => { const a = ganz(2, 99, z); return { tex: `${a} \\cdot 1 = ${a}`, l: a * 1, r: a }; },
  M4: (z) => { const a = ganz(2, 15, z); return { tex: `${a} \\cdot \\frac{1}{${a}} = 1`, l: a * (1 / a), r: 1 }; },
  D: (z) => { const a = ganz(2, 9, z), b = ganz(2, 30, z), c = ganz(2, 30, z); return { tex: `${a} \\cdot (${b} + ${c}) = ${a} \\cdot ${b} + ${a} \\cdot ${c}`, l: a * (b + c), r: a * b + a * c }; },
};

/* ---------- Beispiele mit Variablen (Termumformungen) ----------
   f(x, y) liefert linke und rechte Seite als Zahl für den Test */
const BUCHST = ["x", "y", "a", "b", "t"];
const TERM = {
  A1: (z) => { const v = wahlAus(BUCHST, z), m = ganz(2, 9, z), n = ganz(2, 9, z); return { tex: `(${v} + ${m}) + ${n} = ${v} + (${m} + ${n})`, f: (x) => [(x + m) + n, x + (m + n)] }; },
  A2: (z) => { const k = ganz(2, 9, z); return { tex: `${k}x + y^2 = y^2 + ${k}x`, f: (x, y) => [k * x + y * y, y * y + k * x] }; },
  A3: (z) => { const k = ganz(2, 9, z); return { tex: `${k}x^2 + 0 = ${k}x^2`, f: (x) => [k * x * x + 0, k * x * x] }; },
  A4: (z) => { const k = ganz(2, 9, z); return { tex: `(x + ${k}) + (−(x + ${k})) = 0`, f: (x) => [(x + k) + -(x + k), 0] }; },
  M1: (z) => { const m = ganz(2, 9, z), n = ganz(2, 9, z); return { tex: `(${m} \\cdot x) \\cdot ${n} = ${m} \\cdot (x \\cdot ${n})`, f: (x) => [(m * x) * n, m * (x * n)] }; },
  M2: (z) => { const k = ganz(2, 9, z); return { tex: `(x + ${k}) \\cdot y = y \\cdot (x + ${k})`, f: (x, y) => [(x + k) * y, y * (x + k)] }; },
  M3: (z) => { const k = ganz(2, 9, z); return { tex: `(x − ${k}) \\cdot 1 = x − ${k}`, f: (x) => [(x - k) * 1, x - k] }; },
  M4: (z) => { const k = ganz(2, 9, z); return { tex: `(x + ${k}) \\cdot \\frac{1}{x + ${k}} = 1 \\quad (x \\neq −${k})`, f: (x) => [(x + k) * (1 / (x + k)), 1] }; },
  D: (z) => {
    const k = ganz(2, 9, z);
    return z() < 0.5
      ? { tex: `${k} \\cdot (x + y) = ${k}x + ${k}y`, f: (x, y) => [k * (x + y), k * x + k * y] }
      : { tex: `${k}x + ${k}y = ${k} \\cdot (x + y)`, f: (x, y) => [k * x + k * y, k * (x + y)], rueck: true };
  },
};

/* ---------- Kurze Beweise und Rechnungen, jeder Schritt mit genau einem Gesetz ----------
   zeilen[0] ist der Start; zeilen[i].kz begründet den Schritt von zeilen[i−1] zu zeilen[i] */
export const KETTEN = [
  { id: "gl1", titel: ["Eine Gleichung lösen: x + 3 = 7", "Solving an equation: x + 3 = 7"], zeilen: [
    { tex: "x + 3 = 7" },
    { tex: "(x + 3) + (−3) = 7 + (−3)", schritt: ["Auf beiden Seiten dasselbe addieren", "add the same on both sides"] },
    { tex: "x + (3 + (−3)) = 4", kz: "A1" },
    { tex: "x + 0 = 4", kz: "A4" },
    { tex: "x = 4", kz: "A3" },
  ] },
  { id: "gl2", titel: ["Eine Gleichung lösen: 3 · x = 12", "Solving an equation: 3 · x = 12"], zeilen: [
    { tex: "3 \\cdot x = 12" },
    { tex: "\\frac{1}{3} \\cdot (3 \\cdot x) = \\frac{1}{3} \\cdot 12", schritt: ["Beide Seiten mit demselben malnehmen", "multiply both sides by the same"] },
    { tex: "(\\frac{1}{3} \\cdot 3) \\cdot x = 4", kz: "M1" },
    { tex: "(3 \\cdot \\frac{1}{3}) \\cdot x = 4", kz: "M2" },
    { tex: "1 \\cdot x = 4", kz: "M4" },
    { tex: "x \\cdot 1 = 4", kz: "M2" },
    { tex: "x = 4", kz: "M3" },
  ] },
  { id: "dr", titel: ["Distributivgesetz von rechts: (a + b) · c", "Distributive law from the right: (a + b) · c"], zeilen: [
    { tex: "(a + b) \\cdot c" },
    { tex: "= c \\cdot (a + b)", kz: "M2" },
    { tex: "= c \\cdot a + c \\cdot b", kz: "D" },
    { tex: "= a \\cdot c + c \\cdot b", kz: "M2" },
    { tex: "= a \\cdot c + b \\cdot c", kz: "M2" },
  ] },
  { id: "geschickt", titel: ["Geschickt rechnen: 17 + 58 + 3", "Clever calculation: 17 + 58 + 3"], zeilen: [
    { tex: "(17 + 58) + 3" },
    { tex: "= (58 + 17) + 3", kz: "A2" },
    { tex: "= 58 + (17 + 3)", kz: "A1" },
    { tex: "= 58 + 20" },
    { tex: "= 78" },
  ] },
  { id: "geschickt2", titel: ["Geschickt rechnen: 25 · 13 · 4", "Clever calculation: 25 · 13 · 4"], zeilen: [
    { tex: "(25 \\cdot 13) \\cdot 4" },
    { tex: "= (13 \\cdot 25) \\cdot 4", kz: "M2" },
    { tex: "= 13 \\cdot (25 \\cdot 4)", kz: "M1" },
    { tex: "= 13 \\cdot 100" },
    { tex: "= 1300" },
  ] },
  { id: "binom", titel: ["Erste binomische Formel", "First binomial formula"], zeilen: [
    { tex: "(a + b)^2 = (a + b) \\cdot (a + b)" },
    { tex: "= (a + b) \\cdot a + (a + b) \\cdot b", kz: "D" },
    { tex: "= a \\cdot (a + b) + b \\cdot (a + b)", kz: "M2" },
    { tex: "= (a^2 + a \\cdot b) + (b \\cdot a + b^2)", kz: "D" },
    { tex: "= (a^2 + a \\cdot b) + (a \\cdot b + b^2)", kz: "M2" },
    { tex: "= a^2 + 2ab + b^2", schritt: ["Assoziativgesetz und ab + ab = 2ab (Distributivgesetz rückwärts)", "associative law and ab + ab = 2ab (distributive law backwards)"] },
  ] },
  { id: "doppelminus", titel: ["Warum −(−a) = a gilt", "Why −(−a) = a"], zeilen: [
    { tex: "−(−a) = −(−a) + 0", kz: "A3" },
    { tex: "= −(−a) + (a + (−a))", kz: "A4" },
    { tex: "= −(−a) + ((−a) + a)", kz: "A2" },
    { tex: "= (−(−a) + (−a)) + a", kz: "A1" },
    { tex: "= ((−a) + (−(−a))) + a", kz: "A2" },
    { tex: "= 0 + a", kz: "A4" },
    { tex: "= a + 0", kz: "A2" },
    { tex: "= a", kz: "A3" },
  ] },
];
/* Alle Schritte, die genau ein Gesetz tragen */
export const KETTEN_SCHRITTE = KETTEN.flatMap((k) => k.zeilen.map((zl, i) => (zl.kz && i > 0 ? { kette: k.id, i } : null)).filter(Boolean));

/* ---------- Verkleidete 1 und 0 ----------
   v(x): Wert für x (Test); eins/null markiert, was der Ausdruck ist */
export const VERKLEIDET = [
  { tex: "\\frac{7}{7}", v: () => 7 / 7 },
  { tex: "\\frac{x + 1}{x + 1}", v: (x) => (x + 1) / (x + 1), bed: "x ≠ −1" },
  { tex: "(−1) \\cdot (−1)", v: () => -1 * -1 },
  { tex: "\\frac{\\sqrt{2}}{\\sqrt{2}}", v: () => Math.SQRT2 / Math.SQRT2 },
  { tex: "4 \\cdot \\frac{1}{4}", v: () => 4 * (1 / 4) },
  { tex: "5 − 5", v: () => 0 },
  { tex: "x − x", v: (x) => x - x },
  { tex: "\\frac{9}{3} − 3", v: () => 9 / 3 - 3 },
  { tex: "a + (−a)", v: (x) => x + -x },
  { tex: "2x − 2x", v: (x) => 2 * x - 2 * x },
  /* weder 0 noch 1 */
  { tex: "\\frac{5}{1}", v: () => 5 },
  { tex: "x + 1 − 1", v: (x) => x },
  { tex: "\\frac{x}{x + 1}", v: (x) => x / (x + 1) },
  { tex: "1 + 1", v: () => 2 },
  { tex: "\\frac{0}{0}", v: () => NaN, undef: true },
].map((e) => {
  const w = e.v(3.7);
  return { ...e, art: e.undef ? "undef" : Math.abs(w - 1) < 1e-12 ? "eins" : Math.abs(w) < 1e-12 ? "null" : "anders" };
});

/* ---------- Aufgaben ---------- */
export const AX_ARTEN = ["gesetz", "term", "kette", "invers", "umschreiben", "verkleidet", "distributiv", "ausklammern"];

export function axAufgabe(art, z = Math.random) {
  art = art || wahlAus(AX_ARTEN, z);

  if (art === "gesetz" || art === "term") {
    const kz = wahlAus(KZ, z);
    const b = (art === "gesetz" ? ZAHL : TERM)[kz](z);
    return { art, kz, ...b, wahl: [kz, ...VERWANDT[kz]] };
  }

  if (art === "kette") {
    const s = wahlAus(KETTEN_SCHRITTE, z);
    const k = KETTEN.find((x) => x.id === s.kette);
    return { art, kette: k.id, i: s.i, kz: k.zeilen[s.i].kz, wahl: [k.zeilen[s.i].kz, ...VERWANDT[k.zeilen[s.i].kz]] };
  }

  if (art === "invers") {
    const plus = z() < 0.5;
    const bruch = z() < 0.5;
    const n = ganz(2, 9, z);
    let zz = ganz(1, 12, z) * (z() < 0.4 ? -1 : 1);
    if (bruch && zz % n === 0) zz += 1;
    const x = bruch ? q(zz, n) : q(zz);
    const inv = plus ? qNeg(x) : qDiv(q(1), x);
    return { art, plus, x, inv, xTex: qTex(x), invTex: qTex(inv), neutral: plus ? 0 : 1, falsch: plus ? qDiv(q(1), x) : qNeg(x) };
  }

  if (art === "umschreiben") {
    const minus = z() < 0.5;
    const a = ganz(3, 30, z);
    const b = minus ? ganz(2, 40, z) : wahlAus([2, 3, 4, 5, 6, 8, 10], z);
    const wert = minus ? q(a - b) : q(a, b);
    return { art, minus, a, b, wert, wertTex: qTex(wert) };
  }

  if (art === "verkleidet") {
    const ziel = z() < 0.5 ? "eins" : "null";
    const richtig = wahlAus(VERKLEIDET.filter((e) => e.art === ziel), z);
    const andere = VERKLEIDET.filter((e) => e.art !== ziel);
    const pool = [];
    while (pool.length < 2) { const e = wahlAus(andere, z); if (!pool.includes(e)) pool.push(e); }
    return { art, ziel, richtig: richtig.tex, optionen: [richtig, ...pool].map((e) => e.tex) };
  }

  if (art === "distributiv") {
    const a = wahlAus([3, 4, 6, 7, 8, 9, 12, 15], z), d = ganz(1, 3, z), rund = wahlAus([20, 50, 100, 200, 1000], z);
    const plus = z() < 0.4;
    const n = plus ? rund + d : rund - d;
    return { art, a, d, rund, plus, n, teil1: a * rund, teil2: a * d, wert: a * n };
  }

  /* ausklammern: k·x + k·m = k · (x + m), größter gemeinsamer Faktor */
  const k = ganz(2, 9, z), c = ganz(2, 6, z);
  let m; do m = ganz(1, 9, z); while (ggT(c, m) !== 1 || m === c);
  return { art: "ausklammern", k, m, c, wert: (x) => k * c * x + k * m };
}

/* Wert eines Bruchs/einer ganzen Zahl als Zahl (für die Eingabeprüfung) */
export const qWert = (x) => qNum(x);

/* Ein Zahlenbeispiel zu einem Gesetz (Gesetz-Probe im Entdecken-Modus) */
export const axBeispiel = (kz, z = Math.random) => ZAHL[kz](z);
