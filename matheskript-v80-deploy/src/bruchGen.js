/* ======================================================================
   bruchGen.js – reine Mathematik für den Bereich Bruchrechnen
   (Brüche rechnen, Bruchterme und Bruchgleichungen).
   Exakte Bruchrechnung über rechnen2.js, kein React. Node-testbar
   (tests/bruchGen.test.mjs). Oberflächen: funcBruchrechnen.jsx,
   funcBruchterme.jsx.
   Ergebnisse liegen immer vollständig gekürzt vor (Regel A5).
   ====================================================================== */

import { ggT, q, qAdd, qSub, qMul, qDiv, qNum } from "./rechnen2.js";

export const kgV = (a, b) => Math.abs(a * b) / ggT(a, b);
const wahlAus = (l, z) => l[Math.floor(z() * l.length)];
const ganz = (lo, hi, z) => lo + Math.floor(z() * (hi - lo + 1));

/* Bruch als $…$-Text (gestapelt), ganze Zahlen ohne Formel */
export function bruchTex(b) {
  if (b.n === 1) return String(b.z).replace("-", "−");
  return `${b.z < 0 ? "−" : ""}\\frac{${Math.abs(b.z)}}{${b.n}}`;
}
export const bS = (b) => (b.n === 1 ? String(b.z).replace("-", "−") : `$${bruchTex(b)}$`);
/* ungekürzter Bruch (Zähler und Nenner wie angegeben) */
export const roh = (z, n) => ({ z, n });
export const rohTex = (b) => `\\frac{${b.z}}{${b.n}}`;
/* gemischte Zahl, z. B. 2 1/3 → „2\frac{1}{3}“ */
export const gemischtTex = (g, b) => `${g}\\frac{${b.z}}{${b.n}}`;

/* Ist die Eingabe ein vollständig gekürzter Bruch? Ganze Zahlen und Dezimalzahlen zählen als gekürzt.
   „6/8“ → false, „3/4“ → true, „8/4“ → false (ist 2), „2“ → true */
export function istGekuerzt(eingabe) {
  const t = String(eingabe).replace(/−/g, "-").replace(/\s/g, "");
  const m = /^-?(\d+)\/(\d+)$/.exec(t);
  if (!m) return true;
  const z = Number(m[1]), n = Number(m[2]);
  if (n === 0) return false;
  return ggT(z, n) === 1 && n !== 1;
}

/* ---------- Brüche rechnen ----------
   art: kuerzen | erweitern | addieren | subtrahieren | multiplizieren | dividieren | gemischt | anteil | doppel | vergleichen */
export const BRUCH_ARTEN = ["kuerzen", "erweitern", "addieren", "subtrahieren", "multiplizieren", "dividieren", "gemischt", "anteil", "doppel", "vergleichen"];

/* Zufälliger echter, gekürzter Bruch mit Nenner aus der Liste */
function echt(nenner, z) {
  const n = wahlAus(nenner, z);
  let zz; do { zz = ganz(1, n - 1, z); } while (ggT(zz, n) !== 1);
  return q(zz, n);
}

export function bruchAufgabe(art, z = Math.random) {
  art = art || wahlAus(BRUCH_ARTEN, z);
  if (art === "kuerzen") {
    const b = echt([3, 4, 5, 6, 7, 8, 9, 10, 11, 12], z);
    const k = wahlAus([2, 3, 4, 5, 6, 7, 8, 9, 12], z);
    return { art, start: roh(b.z * k, b.n * k), ggt: k, ergebnis: b };
  }
  if (art === "erweitern") {
    const b = echt([2, 3, 4, 5, 6, 8], z);
    const k = wahlAus([2, 3, 4, 5, 6], z);
    return { art, start: b, ziel: b.n * k, faktor: k, zaehler: b.z * k };
  }
  if (art === "addieren" || art === "subtrahieren") {
    let a, b;
    do { a = echt([2, 3, 4, 5, 6, 8, 9, 10, 12], z); b = echt([2, 3, 4, 5, 6, 8, 9, 10, 12], z); }
    while (a.n === b.n || (art === "subtrahieren" && qNum(a) <= qNum(b)));
    const hn = kgV(a.n, b.n);
    const e = art === "addieren" ? qAdd(a, b) : qSub(a, b);
    /* typischer Fehler: Zähler + Zähler, Nenner + Nenner */
    const falsch = art === "addieren" ? (a.z + b.z) / (a.n + b.n) : (a.z - b.z) / (a.n - b.n);
    return { art, a, b, hn, za: a.z * (hn / a.n), zb: b.z * (hn / b.n), ergebnis: e, falsch };
  }
  if (art === "multiplizieren") {
    /* so gewählt, dass man über Kreuz kürzen kann */
    let a, b;
    do { a = echt([3, 4, 5, 6, 7, 8, 9, 10], z); b = echt([3, 4, 5, 6, 7, 8, 9, 10, 12], z); }
    while (ggT(a.z, b.n) === 1 && ggT(b.z, a.n) === 1);
    return { art, a, b, ergebnis: qMul(a, b), ungekuerzt: roh(a.z * b.z, a.n * b.n) };
  }
  if (art === "dividieren") {
    const a = echt([3, 4, 5, 6, 8, 9], z), b = echt([2, 3, 4, 5, 7], z);
    return { art, a, b, kehr: q(b.n, b.z), ergebnis: qDiv(a, b), falsch: qNum(qMul(a, b)) };
  }
  if (art === "gemischt") {
    /* g1 r1 + g2 r2 als gemischte Zahlen */
    const r1 = echt([2, 3, 4, 5, 6], z), r2 = echt([2, 3, 4, 6, 8], z);
    const g1 = ganz(1, 4, z), g2 = ganz(1, 3, z);
    const u1 = q(g1 * r1.n + r1.z, r1.n), u2 = q(g2 * r2.n + r2.z, r2.n);
    return { art, g1, r1, g2, r2, u1, u2, ergebnis: qAdd(u1, u2) };
  }
  if (art === "anteil") {
    const b = echt([3, 4, 5, 6, 8, 10, 12], z);
    const ganzes = b.n * wahlAus([3, 4, 5, 6, 7, 8, 9, 12, 15], z);
    return { art, b, ganzes, teil: ganzes / b.n, ergebnis: (ganzes / b.n) * b.z };
  }
  if (art === "doppel") {
    const a = echt([2, 3, 4, 5, 6, 8], z), b = echt([3, 4, 5, 6, 9], z);
    return { art, a, b, ergebnis: qDiv(a, b) };
  }
  /* vergleichen */
  let a, b;
  do { a = echt([3, 4, 5, 6, 7, 8, 9, 12], z); b = echt([3, 4, 5, 6, 7, 8, 9, 12], z); } while (a.n === b.n || qNum(a) === qNum(b));
  const hn = kgV(a.n, b.n);
  return { art, a, b, hn, za: a.z * (hn / a.n), zb: b.z * (hn / b.n), groesser: qNum(a) > qNum(b) ? "a" : "b" };
}

/* ---------- Bruchterme ----------
   art: definition | definition2 | kuerzen | addieren | gleichung | falle */
export const TERM_ARTEN = ["definition", "definition2", "kuerzen", "addieren", "gleichung", "falle"];

const vz = (p) => (p < 0 ? `− ${-p}` : `+ ${p}`);          // „+ 3“ / „− 3“
export const xMinus = (p) => (p === 0 ? "x" : `x ${vz(-p)}`); // (x − p) als Text

export function termAufgabe(art, z = Math.random) {
  art = art || wahlAus(TERM_ARTEN, z);
  const nz = () => wahlAus([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6], z);
  if (art === "definition") {
    const p = nz(), a = wahlAus([1, 2, 3, 5], z), b = wahlAus([-7, -2, 1, 4, 9], z);
    /* (a·x + b) / (x − p);  b so, dass Zähler nicht durch (x − p) teilbar ist */
    const bb = a * p + b === 0 ? b + 1 : b;
    return { art, p, a, b: bb, ausgeschlossen: [p] };
  }
  if (art === "definition2") {
    /* 5 / (x² − p²) = 5 / ((x − p)(x + p)) */
    const p = wahlAus([1, 2, 3, 4, 5, 6, 7], z), c = wahlAus([1, 2, 3, 5, 7], z);
    return { art, p, c, ausgeschlossen: [-p, p] };
  }
  if (art === "kuerzen") {
    const variante = wahlAus(["binom", "faktor", "ausklammern"], z);
    const p = wahlAus([1, 2, 3, 4, 5, 6], z), k = wahlAus([2, 3, 4, 5, 7], z);
    return { art, variante, p, k };
  }
  if (art === "addieren") {
    /* a/x + b/(x + p) = ((a + b)x + a·p) / (x(x + p)) */
    const a = wahlAus([1, 2, 3], z), b = wahlAus([1, 2, 4, 5], z), p = wahlAus([1, 2, 3, 4], z);
    return { art, a, b, p, zx: a + b, z0: a * p };
  }
  if (art === "gleichung") {
    /* a / (x − p) = b  →  x = p + a/b  (ganzzahlig, ≠ p) */
    const b = wahlAus([1, 2, 3, 4, 5], z), m = wahlAus([-3, -2, -1, 1, 2, 3, 4], z), p = nz();
    const a = b * m;
    return { art, a, b, p, x: p + m };
  }
  /* falle: (x + c)/(x − p) = (p + c)/(x − p) → x = p, aber p ist ausgeschlossen → L = { } */
  const p = wahlAus([1, 2, 3, 4, 5], z), c = wahlAus([1, 2, 3, 4], z);
  return { art, p, c, kandidat: p };
}

/* Wert eines Bruchterms an einer Stelle (für Probe und Tests); null = nicht definiert */
export function termWert(au, x) {
  if (au.art === "definition") return x === au.p ? null : (au.a * x + au.b) / (x - au.p);
  if (au.art === "definition2") return Math.abs(x) === au.p ? null : au.c / (x * x - au.p * au.p);
  if (au.art === "addieren") return x === 0 || x === -au.p ? null : au.a / x + au.b / (x + au.p);
  if (au.art === "gleichung") return x === au.p ? null : au.a / (x - au.p);
  return null;
}
