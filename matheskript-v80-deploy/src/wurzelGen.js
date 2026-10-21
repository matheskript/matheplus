/* ======================================================================
   wurzelGen.js – reine Mathematik für „Brüche und Wurzeln“, Teil Wurzeln
   (Mittelstufe, Klasse 8/9: Quadratwurzeln). Kein React, Node-testbar
   (tests/wurzelGen.test.mjs). Oberfläche: funcBruchWurzeln.jsx.

   Jede Aufgabe liefert ihre Zahlen so, dass das Ergebnis ganz und
   vollständig vereinfacht ist (Regel A5): k·√m mit quadratfreiem m,
   gekürzte Brüche p/q.

   Arten:
     ziehen     √(k²) = k
     teilweise  √(k²·m) = k·√m              (gesucht: k)
     produkt    √a · √b = √(a·b) = n         (a·b Quadratzahl)
     summe      √(a² + b²) = c – Falle: nicht a + b
     nenner     a / √m = k·√m                (Nenner rational machen, a = k·m)
     bruch      √(p²/q²) = p/q
   ====================================================================== */

export const WURZEL_ARTEN = ["ziehen", "teilweise", "produkt", "summe", "nenner", "bruch"];

const wahlAus = (l, z) => l[Math.floor(z() * l.length)];
const ganz = (lo, hi, z) => lo + Math.floor(z() * (hi - lo + 1));
const ggT = (a, b) => (b === 0 ? Math.abs(a) : ggT(b, a % b));

/* quadratfreie Radikanden, die in der Mittelstufe üblich sind */
export const QUADRATFREI = [2, 3, 5, 6, 7, 10];
export const istQuadratfrei = (m) => { for (let d = 2; d * d <= m; d++) if (m % (d * d) === 0) return false; return m > 1; };
export const istQuadrat = (n) => Number.isInteger(Math.sqrt(n));

/* Pythagoreische Tripel für die Summen-Falle */
const TRIPEL = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [12, 16, 20], [7, 24, 25]];

export function wurzelAufgabe(art, z = Math.random) {
  art = art || wahlAus(WURZEL_ARTEN, z);
  if (art === "ziehen") {
    const k = ganz(4, 19, z);
    return { art, k, r: k * k };
  }
  if (art === "teilweise") {
    const k = ganz(2, 7, z);
    const m = wahlAus([2, 3, 5, 6, 7], z);
    return { art, k, m, r: k * k * m };
  }
  if (art === "produkt") {
    const m = wahlAus([2, 3, 5], z);
    let s1 = ganz(1, 3, z), s2 = ganz(1, 4, z);
    if (s1 === s2) s2 = s1 === 4 ? 3 : s1 + 1;   // zwei verschiedene Radikanden
    const a = m * s1 * s1, b = m * s2 * s2;
    return { art, a, b, n: m * s1 * s2 };
  }
  if (art === "summe") {
    const [a, b, c] = wahlAus(TRIPEL, z);
    return { art, a, b, c };
  }
  if (art === "nenner") {
    const m = wahlAus([2, 3, 5, 6, 7], z);
    const k = ganz(2, 5, z);
    return { art, m, k, a: k * m };
  }
  /* bruch */
  let p, q;
  do { p = ganz(1, 7, z); q = ganz(2, 9, z); } while (p >= q || ggT(p, q) !== 1);
  return { art: "bruch", p, q };
}

/* Wert der Aufgabe als Zahl (für Tests und Probe) */
export function wurzelWert(au) {
  if (au.art === "ziehen") return Math.sqrt(au.r);
  if (au.art === "teilweise") return Math.sqrt(au.r);
  if (au.art === "produkt") return Math.sqrt(au.a) * Math.sqrt(au.b);
  if (au.art === "summe") return Math.sqrt(au.a * au.a + au.b * au.b);
  if (au.art === "nenner") return au.a / Math.sqrt(au.m);
  return Math.sqrt((au.p * au.p) / (au.q * au.q));
}

/* Erwartetes Ergebnis in der vereinfachten Form */
export function wurzelErgebnis(au) {
  if (au.art === "ziehen") return { zahl: au.k };
  if (au.art === "teilweise") return { faktor: au.k, radikand: au.m };
  if (au.art === "produkt") return { zahl: au.n };
  if (au.art === "summe") return { zahl: au.c };
  if (au.art === "nenner") return { faktor: au.k, radikand: au.m };
  return { zaehler: au.p, nenner: au.q };
}
