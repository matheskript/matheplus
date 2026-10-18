/* ======================================================================
   unterGen.js – reine Mathematik für die Unterstufen-Werkzeuge (Kl. 5–7)
   Prozent, Zuordnungen, Umfang/Fläche, Größen, Dezimalzahlen, Quader und
   Würfel (mit Würfelnetz-Faltprüfung), Ganze Zahlen, Daten und Diagramme,
   Primzahlen/ggT/kgV, Rechengesetze, Koordinatensystem und Symmetrie,
   Zufall, Natürliche Zahlen und Stellenwert.
   Kein React. Node-testbar (tests/unterGen.test.mjs).
   ====================================================================== */

import { ggT, q, qAdd, qSub, qMul, qNum } from "./rechnen2.js";

const wahlAus = (l, z) => l[Math.floor(z() * l.length)];
const ganz = (lo, hi, z) => lo + Math.floor(z() * (hi - lo + 1));
export const r6 = (v) => Math.round(v * 1e6) / 1e6;
export const r9 = (v) => Number(v.toPrecision(12));
export const kgV = (a, b) => (a * b) / ggT(a, b);

/* ---------- 1 · Prozent- und Zinsrechnung ---------- */
export const PROZENT_ARTEN = ["prozentwert", "grundwert", "prozentsatz", "rabatt", "mwst", "netto", "zinsen", "zinseszins"];
export function prozentAufgabe(art, z = Math.random) {
  art = art || wahlAus(PROZENT_ARTEN, z);
  const G = wahlAus([40, 60, 80, 120, 150, 200, 250, 320, 400, 480, 600, 750, 1200], z);
  const p = wahlAus([5, 10, 12, 15, 20, 25, 30, 40, 60, 75], z);
  const W = r6((G * p) / 100);
  if (art === "prozentwert") return { art, G, p, W };
  if (art === "grundwert") return { art, G, p, W };
  if (art === "prozentsatz") return { art, G, p, W };
  if (art === "rabatt") { const preis = wahlAus([40, 60, 80, 120, 160, 250, 400], z), r = wahlAus([10, 15, 20, 25, 30, 40], z); return { art, preis, r, abzug: r6(preis * r / 100), neu: r6(preis * (100 - r) / 100) }; }
  if (art === "mwst") { const netto = wahlAus([100, 200, 50, 300, 80, 150, 1000], z); return { art, netto, brutto: r6(netto * 1.19), steuer: r6(netto * 0.19) }; }
  if (art === "netto") { const netto = wahlAus([100, 200, 50, 300, 80, 150, 1000], z); return { art, netto, brutto: r6(netto * 1.19) }; }
  if (art === "zinsen") { const K = wahlAus([500, 800, 1200, 2000, 2500, 5000], z), zs = wahlAus([1.5, 2, 2.5, 3, 4], z); return { art, K, zs, Z: r6(K * zs / 100) }; }
  const K = wahlAus([1000, 2000, 5000, 500], z), zs = wahlAus([2, 3, 4, 5], z), n = wahlAus([2, 3], z);
  return { art: "zinseszins", K, zs, n, Kn: r6(K * (1 + zs / 100) ** n), q: 1 + zs / 100 };
}

/* ---------- 2 · Zuordnungen und Dreisatz ---------- */
export const ZUORD_ARTEN = ["erkennen", "prop", "anti", "faktor", "luecke", "graph"];
export function zuordAufgabe(art, z = Math.random) {
  art = art || wahlAus(ZUORD_ARTEN, z);
  if (art === "erkennen" || art === "graph") {
    const typ = wahlAus(["prop", "anti", "keine"], z);
    const xs = [1, 2, 3, 4, 6].slice(0, 4);
    const k = wahlAus([2, 3, 4, 5, 12, 24], z);
    const ys = typ === "prop" ? xs.map((x) => (k % 12 === 0 ? k / 12 : k) * x) : typ === "anti" ? xs.map((x) => (k === 24 || k === 12 ? k : 12) / x) : xs.map((x) => x + wahlAus([2, 3, 5], z));
    return { art, typ, xs, ys };
  }
  if (art === "prop") {
    const [ding, einheit] = wahlAus([["Hefte", "€"], ["Liter Benzin", "€"], ["kg Äpfel", "€"], ["Brötchen", "€"]], z);
    const preis = wahlAus([0.4, 0.5, 0.6, 0.8, 1.2, 1.5, 1.8, 2.5], z), a = wahlAus([3, 4, 5, 6, 8], z);
    let b; do { b = wahlAus([2, 7, 9, 10, 12, 15], z); } while (b === a);
    return { art, ding, einheit, a, b, preisA: r6(a * preis), eins: preis, ergebnis: r6(b * preis) };
  }
  if (art === "anti") {
    const gesamt = wahlAus([12, 24, 36, 48, 60, 72], z);
    const teiler = []; for (let d = 2; d <= 12; d++) if (gesamt % d === 0) teiler.push(d);
    const a = wahlAus(teiler, z); let b; do { b = wahlAus(teiler, z); } while (b === a);
    return { art, a, tA: gesamt / a, b, tB: gesamt / b, gesamt };
  }
  if (art === "faktor") { const k = wahlAus([1.5, 2, 2.5, 3, 4, 0.5], z); const xs = [2, 4, 5, 8]; return { art, k, xs, ys: xs.map((x) => r6(k * x)) }; }
  /* luecke: proportional oder antiproportional, ein Wert fehlt */
  const anti = z() < 0.5;
  const xs = [2, 3, 4, 6], c = anti ? 24 : wahlAus([3, 5, 7], z);
  const ys = xs.map((x) => (anti ? c / x : c * x));
  const fehlt = ganz(1, 3, z);
  return { art: "luecke", anti, xs, ys, fehlt, wert: ys[fehlt] };
}

/* ---------- 3 · Umfang und Flächeninhalt ---------- */
export const FLAECHE_ARTEN = ["rechteckU", "rechteckA", "rueck", "dreieck", "parallelogramm", "trapez", "drachen", "zusammen"];
export function flaecheAufgabe(art, z = Math.random) {
  art = art || wahlAus(FLAECHE_ARTEN, z);
  const s = () => wahlAus([3, 4, 5, 6, 7, 8, 9, 12], z);
  if (art === "rechteckU" || art === "rechteckA") { const a = s(), b = s(); return { art, a, b, U: 2 * (a + b), A: a * b }; }
  if (art === "rueck") { const a = s(), b = s(); return { art, a, b, A: a * b }; }
  if (art === "dreieck") { const g = s(), h = wahlAus([4, 6, 8, 10], z); return { art, g, h, A: (g * h) / 2 }; }
  if (art === "parallelogramm") { const g = s(), h = wahlAus([3, 4, 5, 6], z), sl = h + wahlAus([1, 2], z); return { art, g, h, s: sl, A: g * h }; }
  if (art === "trapez") { const a = wahlAus([8, 9, 10, 12], z), c = wahlAus([4, 5, 6], z), h = wahlAus([3, 4, 5, 6], z); return { art, a, c, h, A: ((a + c) * h) / 2 }; }
  if (art === "drachen") { const e = wahlAus([6, 8, 10, 12], z), f = wahlAus([4, 5, 7, 9], z); return { art, e, f, A: (e * f) / 2 }; }
  /* zusammen: L-Form = großes Rechteck minus Ecke */
  const B = wahlAus([8, 10, 12], z), H = wahlAus([6, 8, 9], z), b = wahlAus([3, 4, 5], z), h = wahlAus([2, 3, 4], z);
  return { art: "zusammen", B, H, b, h, A: B * H - b * h, U: 2 * (B + H) };
}

/* ---------- 4 · Größen umrechnen ---------- */
export const EINHEITEN = {
  laenge: { namen: ["mm", "cm", "dm", "m", "km"], faktor: [1, 10, 100, 1000, 1000000] },
  masse: { namen: ["mg", "g", "kg", "t"], faktor: [1, 1000, 1000000, 1000000000] },
  zeit: { namen: ["s", "min", "h", "d"], faktor: [1, 60, 3600, 86400] },
  flaeche: { namen: ["mm²", "cm²", "dm²", "m²", "a", "ha", "km²"], faktor: [1, 100, 10000, 1000000, 100000000, 10000000000, 1000000000000] },
  volumen: { namen: ["mm³", "cm³", "dm³", "m³"], faktor: [1, 1000, 1000000, 1000000000] },
  hohlmass: { namen: ["ml", "cl", "l", "hl"], faktor: [1, 10, 1000, 100000] },
};
export const umrechnen = (wert, art, von, nach) => r9((wert * EINHEITEN[art].faktor[EINHEITEN[art].namen.indexOf(von)]) / EINHEITEN[art].faktor[EINHEITEN[art].namen.indexOf(nach)]);
export const GROESSEN_ARTEN = ["laenge", "masse", "zeit", "flaeche", "volumen", "hohlmass", "massstab"];
export function groessenAufgabe(art, z = Math.random) {
  art = art || wahlAus(GROESSEN_ARTEN, z);
  if (art === "massstab") {
    const m = wahlAus([100, 1000, 25000, 50000, 100000], z), karte = wahlAus([2, 3, 4.5, 6, 8], z);
    const cm = karte * m;
    return { art, m, karte, cm, wirklich: m >= 25000 ? r6(cm / 100000) : r6(cm / 100), einheit: m >= 25000 ? "km" : "m" };
  }
  const E = EINHEITEN[art];
  const weit = art === "laenge" || art === "flaeche" ? 2 : 1;
  let i, j, wert, ergebnis;
  do {
    do { i = ganz(0, E.namen.length - 1, z); j = ganz(0, E.namen.length - 1, z); } while (i === j || Math.abs(i - j) > weit);
    const basis = art === "zeit" ? wahlAus([2, 3, 5, 1.5, 4, 0.5, 2.5], z) : wahlAus([3, 4.5, 7, 12, 0.6, 2.25, 35, 0.08, 250, 1500], z);
    wert = art === "zeit" && i < j ? r6(basis * E.faktor[j] / E.faktor[i]) : basis;
    ergebnis = umrechnen(wert, art, E.namen[i], E.namen[j]);
  } while (ergebnis < 0.001 || ergebnis > 10000000);
  const nachbar = Math.abs(i - j) === 1 ? E.faktor[Math.max(i, j)] / E.faktor[Math.min(i, j)] : null;
  return { art, wert, von: E.namen[i], nach: E.namen[j], ergebnis, schritt: nachbar, groesser: i > j };
}

/* ---------- 5 · Dezimalzahlen ---------- */
export const DEZ_ARTEN = ["bruchZuDez", "dezZuBruch", "runden", "zehner", "mal", "geteilt", "periodisch"];
export const abbrechend = (n) => { let m = n; while (m % 2 === 0) m /= 2; while (m % 5 === 0) m /= 5; return m === 1; };
export function dezAufgabe(art, z = Math.random) {
  art = art || wahlAus(DEZ_ARTEN, z);
  if (art === "bruchZuDez") { const [zz, n] = wahlAus([[3, 8], [7, 20], [3, 4], [2, 5], [9, 25], [11, 50], [5, 16], [7, 40]], z); return { art, b: q(zz, n), wert: r6(zz / n), erweitert: [10, 100, 1000, 10000].find((p) => p % n === 0) }; }
  if (art === "dezZuBruch") { const [dez, nenner] = wahlAus([[0.45, 100], [0.375, 1000], [0.6, 10], [0.125, 1000], [0.84, 100], [0.05, 100], [1.25, 100], [0.72, 100]], z); return { art, dez, roh: { z: Math.round(dez * nenner), n: nenner }, b: q(Math.round(dez * nenner), nenner) }; }
  if (art === "runden") { const x = wahlAus([3.14159, 12.4562, 0.08349, 7.9951, 25.0749, 1.2345, 6.6666], z), st = wahlAus([1, 2, 3], z); return { art, x, st, wert: Math.round(x * 10 ** st + 1e-9) / 10 ** st, naechste: Math.floor(Math.round(x * 10 ** (st + 1) * 1e6) / 1e6) % 10 }; }
  if (art === "zehner") { const x = wahlAus([3.75, 0.042, 12.5, 0.6, 205.3], z), op = wahlAus(["·10", "·100", "·1000", ":10", ":100", ":1000"], z); const f = Number(op.slice(1)); return { art, x, op, wert: op[0] === "·" ? r6(x * f) : r6(x / f), stellen: String(f).length - 1, rechts: op[0] === "·" }; }
  if (art === "mal") { const [a, b] = wahlAus([[1.2, 0.3], [2.5, 0.4], [0.6, 0.07], [3.2, 1.5], [0.25, 0.8], [4.5, 0.02]], z); const st = (String(a).split(".")[1] || "").length + (String(b).split(".")[1] || "").length; return { art, a, b, wert: r6(a * b), stellen: st, ohne: Math.round(a * 10 ** ((String(a).split(".")[1] || "").length)) * Math.round(b * 10 ** ((String(b).split(".")[1] || "").length)) }; }
  if (art === "geteilt") { const [a, b] = wahlAus([[4.8, 0.6], [1.5, 0.3], [7.2, 0.08], [0.36, 0.4], [2.4, 0.12], [9, 0.25]], z); const st = (String(b).split(".")[1] || "").length; return { art, a, b, st, a2: r6(a * 10 ** st), b2: r6(b * 10 ** st), wert: r6(a / b) }; }
  const n = wahlAus([3, 6, 7, 8, 9, 11, 12, 16, 20, 25, 15, 40], z);
  return { art: "periodisch", n, zaehler: 1, abbrechend: abbrechend(n) };
}

/* ---------- 6 · Quader und Würfel ---------- */
export const QUADER_ARTEN = ["volumen", "oberflaeche", "kanten", "hoehe", "wuerfel", "netz"];
/* Würfelnetz falten: Zellen [x, y]; der Würfel rollt über das Netz und notiert, welche seiner sechs Flächen
   jeweils unten liegt. Ein Netz ist gültig, wenn die 6 Zellen zusammenhängen und jede Fläche genau einmal unten liegt. */
function roll(pos, d) {
  const k = d.join(",");
  if (k === "1,0") return { rechts: "unten", unten: "links", links: "oben", oben: "rechts" }[pos] || pos;
  if (k === "-1,0") return { links: "unten", unten: "rechts", rechts: "oben", oben: "links" }[pos] || pos;
  if (k === "0,1") return { hinten: "unten", unten: "vorn", vorn: "oben", oben: "hinten" }[pos] || pos;
  return { vorn: "unten", unten: "hinten", hinten: "oben", oben: "vorn" }[pos] || pos;
}
export function netzFalten(zellen) {
  const key = (c) => c.join(",");
  const menge = new Set(zellen.map(key));
  if (zellen.length !== 6 || menge.size !== 6) return { gueltig: false, flaechen: {} };
  const flaechen = {}, besucht = new Set();
  const stapel = [[zellen[0], { A: "unten", B: "oben", C: "rechts", D: "links", E: "vorn", F: "hinten" }]];
  while (stapel.length) {
    const [c, lage] = stapel.pop();
    if (besucht.has(key(c))) continue;
    besucht.add(key(c));
    flaechen[key(c)] = Object.keys(lage).find((f) => lage[f] === "unten");
    for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const n = [c[0] + d[0], c[1] + d[1]];
      if (!menge.has(key(n)) || besucht.has(key(n))) continue;
      const neu = {};
      for (const [f, pos] of Object.entries(lage)) neu[f] = roll(pos, d);
      stapel.push([n, neu]);
    }
  }
  return { gueltig: besucht.size === 6 && new Set(Object.values(flaechen)).size === 6, flaechen };
}
/* Netze (x nach rechts, y nach unten in der Zeichnung) */
export const NETZE = [
  { id: "kreuz", zellen: [[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]] },
  { id: "t", zellen: [[0, 0], [1, 0], [2, 0], [1, 1], [1, 2], [1, 3]] },
  { id: "treppe", zellen: [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2], [3, 2]] },
  { id: "zwei-drei-eins", zellen: [[0, 0], [1, 0], [1, 1], [2, 1], [3, 1], [3, 2]] },
  { id: "eins-vier-eins", zellen: [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [3, 2]] },
  { id: "drei-drei", zellen: [[0, 0], [1, 0], [2, 0], [2, 1], [3, 1], [4, 1]] },
  { id: "reihe", zellen: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0]] },
  { id: "block", zellen: [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]] },
  { id: "kreuz-falsch", zellen: [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2], [2, 2]] },
  { id: "l-lang", zellen: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [1, 4]] },
  { id: "doppel-oben", zellen: [[0, 0], [1, 0], [0, 1], [1, 1], [2, 1], [3, 1]] },
  { id: "s", zellen: [[0, 0], [0, 1], [1, 1], [2, 1], [2, 2], [3, 2]] },
];
export function quaderAufgabe(art, z = Math.random) {
  art = art || wahlAus(QUADER_ARTEN, z);
  if (art === "netz") {
    const gute = NETZE.filter((n) => netzFalten(n.zellen).gueltig), schlechte = NETZE.filter((n) => !netzFalten(n.zellen).gueltig);
    const richtig = wahlAus(gute, z);
    const falsch = [...schlechte].sort(() => z() - 0.5).slice(0, 2);
    const reihe = [richtig, ...falsch].sort(() => z() - 0.5);
    return { art, netze: reihe.map((n) => n.id), richtig: richtig.id };
  }
  if (art === "wuerfel") { const a = wahlAus([2, 3, 4, 5, 6, 10], z); return { art, a, V: a ** 3, O: 6 * a * a }; }
  const a = wahlAus([2, 3, 4, 5, 6, 8], z), b = wahlAus([2, 3, 4, 5, 7], z), c = wahlAus([2, 3, 5, 6, 10], z);
  return { art, a, b, c, V: a * b * c, O: 2 * (a * b + a * c + b * c), K: 4 * (a + b + c) };
}

/* ---------- 7 · Ganze und rationale Zahlen ---------- */
export const GANZ_ARTEN = ["plus", "minus", "mal", "geteilt", "vergleich", "temperatur", "klammer", "rational"];
export function ganzAufgabe(art, z = Math.random) {
  art = art || wahlAus(GANZ_ARTEN, z);
  const n = () => wahlAus([-12, -9, -8, -7, -5, -4, -3, -2, 2, 3, 4, 6, 7, 9, 11], z);
  if (art === "plus") { const a = n(), b = n(); return { art, a, b, wert: a + b }; }
  if (art === "minus") { const a = n(), b = n(); return { art, a, b, wert: a - b }; }
  if (art === "mal") { const a = n(), b = n(); return { art, a, b, wert: a * b }; }
  if (art === "geteilt") { const b = n(), e = n(); return { art, a: b * e, b, wert: e }; }
  if (art === "vergleich") { let a, b; do { a = n(); b = n(); } while (a === b || Math.sign(a) === Math.sign(b) && z() < 0.3); return { art, a, b, groesser: a > b ? "a" : "b" }; }
  if (art === "temperatur") { const start = wahlAus([-6, -3, 2, 4, -1], z), d = wahlAus([-9, -7, 5, 8, -4], z); return { art, start, d, wert: start + d }; }
  if (art === "klammer") { const a = n(), b = n(), c = n(); return { art, a, b, c, wert: a - b * c }; }
  const a = q(wahlAus([-3, -1, 1, 3, -5], z), wahlAus([2, 4, 4, 8], z)), b = q(wahlAus([-1, 1, -3, 3], z), wahlAus([2, 3, 4, 6], z));
  const op = wahlAus(["+", "−", "·"], z);
  return { art: "rational", a, b, op, e: op === "+" ? qAdd(a, b) : op === "−" ? qSub(a, b) : qMul(a, b) };
}

/* ---------- 8 · Daten und Diagramme ---------- */
export const DATEN_ARTEN = ["mittelwert", "median", "spannweite", "relativ", "kreis", "ablesen"];
export const mittelwert = (l) => l.reduce((s, x) => s + x, 0) / l.length;
export const median = (l) => { const s = [...l].sort((a, b) => a - b), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
export function datenAufgabe(art, z = Math.random) {
  art = art || wahlAus(DATEN_ARTEN, z);
  if (art === "mittelwert") { let l; do { l = Array.from({ length: wahlAus([4, 5, 6], z) }, () => ganz(1, 12, z)); } while (!Number.isInteger(mittelwert(l) * 2)); return { art, l, wert: mittelwert(l) }; }
  if (art === "median") { const l = Array.from({ length: wahlAus([5, 6, 7], z) }, () => ganz(1, 20, z)); return { art, l, sortiert: [...l].sort((a, b) => a - b), wert: median(l) }; }
  if (art === "spannweite") { const l = Array.from({ length: 6 }, () => ganz(-3, 25, z)); return { art, l, wert: Math.max(...l) - Math.min(...l) }; }
  if (art === "relativ") { const gesamt = wahlAus([20, 25, 40, 50, 200], z), teil = Math.round(gesamt * wahlAus([0.1, 0.2, 0.25, 0.3, 0.4, 0.15], z)); return { art, gesamt, teil, prozent: r6(teil / gesamt * 100) }; }
  if (art === "kreis") { const anteil = wahlAus([[1, 4], [1, 3], [1, 6], [3, 8], [5, 12], [2, 5], [1, 10]], z); return { art, z: anteil[0], n: anteil[1], winkel: r6(anteil[0] / anteil[1] * 360) }; }
  const kat = ["Mo", "Di", "Mi", "Do", "Fr"], werte = kat.map(() => ganz(1, 9, z)), i = ganz(0, 4, z);
  return { art: "ablesen", kat, werte, i, wert: werte[i] };
}

/* ---------- 9 · Primzahlen, ggT und kgV ---------- */
export const PRIM_ARTEN = ["istPrim", "zerlegung", "ggt", "kgv", "ggtSach", "kgvSach"];
export const istPrim = (n) => { if (n < 2) return false; for (let d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; };
export const primfaktoren = (n) => { const f = []; let m = n; for (let d = 2; m > 1; d++) while (m % d === 0) { f.push(d); m /= d; } return f; };
export function primAufgabe(art, z = Math.random) {
  art = art || wahlAus(PRIM_ARTEN, z);
  if (art === "istPrim") { const n = wahlAus([29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 39, 51, 57, 87, 91, 49, 77, 93, 63, 81], z); return { art, n, prim: istPrim(n), teiler: primfaktoren(n)[0] }; }
  if (art === "zerlegung") { const n = wahlAus([36, 48, 60, 72, 84, 90, 96, 100, 120, 126, 150, 180], z); const f = primfaktoren(n); return { art, n, f, kleinster: f[0], anzahl: f.length, groesster: f[f.length - 1] }; }
  const paare = [[12, 18], [24, 36], [15, 20], [8, 12], [14, 21], [30, 45], [16, 24], [9, 15], [20, 50], [18, 27]];
  const [a, b] = wahlAus(paare, z);
  if (art === "ggt") return { art, a, b, wert: ggT(a, b) };
  if (art === "kgv") return { art, a, b, wert: kgV(a, b) };
  if (art === "ggtSach") { const [x, y] = wahlAus([[120, 80], [90, 60], [72, 48], [150, 100]], z); return { art, a: x, b: y, wert: ggT(x, y) }; }
  const [x, y] = wahlAus([[12, 18], [15, 20], [8, 12], [10, 15], [6, 9]], z);
  return { art: "kgvSach", a: x, b: y, wert: kgV(x, y) };
}

/* ---------- 10 · Rechengesetze ---------- */
export const RG_ARTEN = ["punkt", "klammer", "potenz", "distributiv", "vorteil", "gesetz", "text"];
export function rgAufgabe(art, z = Math.random) {
  art = art || wahlAus(RG_ARTEN, z);
  const s = () => ganz(2, 9, z);
  if (art === "punkt") { const a = s(), b = s(), c = s(); return { art, a, b, c, wert: a + b * c, falsch: (a + b) * c }; }
  if (art === "klammer") { const a = s(), b = s(), c = s(); return { art, a, b, c, wert: (a + b) * c, falsch: a + b * c }; }
  if (art === "potenz") { const a = s(), b = wahlAus([2, 3, 4, 5], z); return { art, a, b, wert: a + b * b, falsch: (a + b) ** 2 }; }
  if (art === "distributiv") { const a = wahlAus([6, 7, 8, 9, 12], z), d = wahlAus([1, 2, 3], z), n = wahlAus([100, 50, 1000], z) - d; return { art, a, n, d, rund: n + d, wert: a * n }; }
  if (art === "vorteil") { const [x, y] = wahlAus([[25, 4], [50, 2], [125, 8], [20, 5]], z), m = wahlAus([13, 17, 23, 37], z); return { art, x, y, m, wert: x * y * m }; }
  if (art === "gesetz") { const g = wahlAus(["kommutativ", "assoziativ", "distributiv"], z); return { art, g }; }
  const a = s(), b = s(), c = s();
  const v = wahlAus(["summeProdukt", "differenzQuotient", "produktSumme"], z);
  const wert = v === "summeProdukt" ? a + b * c : v === "produktSumme" ? a * (b + c) : (a * b * c - b) / b;
  return { art: "text", v, a, b, c, d: a * b * c, wert };
}

/* ---------- 11 · Koordinatensystem und Symmetrie ---------- */
export const KOORD_ARTEN = ["ablesen", "xachse", "yachse", "ursprung", "punktZ", "viereck", "achsen"];
export const SYM_FIGUREN = [["Quadrat", 4], ["Rechteck", 2], ["Raute", 2], ["gleichseitiges Dreieck", 3], ["gleichschenkliges Trapez", 1], ["Parallelogramm", 0], ["Drachenviereck", 1], ["regelmäßiges Sechseck", 6]];
export function koordAufgabe(art, z = Math.random) {
  art = art || wahlAus(KOORD_ARTEN, z);
  const k = () => wahlAus([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5], z);
  const P = [k(), k()];
  if (art === "ablesen") return { art, P };
  if (art === "xachse") return { art, P, B: [P[0], -P[1]] };
  if (art === "yachse") return { art, P, B: [-P[0], P[1]] };
  if (art === "ursprung") return { art, P, B: [-P[0], -P[1]] };
  if (art === "punktZ") { const Z = [wahlAus([-1, 0, 1, 2], z), wahlAus([-1, 1, 2], z)]; return { art, P, Z, B: [2 * Z[0] - P[0], 2 * Z[1] - P[1]] }; }
  if (art === "viereck") {
    const A = [wahlAus([-4, -3, -2], z), wahlAus([-3, -2, -1], z)], u = [wahlAus([3, 4, 5], z), wahlAus([0, 1], z)], v = [wahlAus([-1, 0, 1], z), wahlAus([3, 4], z)];
    const B = [A[0] + u[0], A[1] + u[1]], D = [A[0] + v[0], A[1] + v[1]], Cc = [B[0] + v[0], B[1] + v[1]];
    return { art, A, B, C: Cc, D };
  }
  const [name, anzahl] = wahlAus(SYM_FIGUREN, z);
  return { art: "achsen", name, anzahl };
}

/* ---------- 12 · Zufall und Wahrscheinlichkeit (Einstieg) ---------- */
export const ZUFALL_ARTEN = ["wuerfel", "urne", "gegen", "zweistufig", "relativ", "erwartet"];
export function zufallAufgabe(art, z = Math.random) {
  art = art || wahlAus(ZUFALL_ARTEN, z);
  if (art === "wuerfel") {
    const e = wahlAus([["eine gerade Zahl", [2, 4, 6]], ["eine Zahl größer als 4", [5, 6]], ["eine Primzahl", [2, 3, 5]], ["eine Sechs", [6]], ["höchstens eine Zwei", [1, 2]], ["eine durch 3 teilbare Zahl", [3, 6]]], z);
    return { art, text: e[0], guenstig: e[1], p: q(e[1].length, 6) };
  }
  if (art === "urne") { const r = ganz(2, 7, z), b = ganz(1, 6, z), g = ganz(0, 3, z); return { art, r, b, g, p: q(r, r + b + g) }; }
  if (art === "gegen") { const [zz, n] = wahlAus([[1, 6], [3, 8], [2, 5], [7, 10], [1, 4]], z); return { art, p: q(zz, n), gegen: q(n - zz, n) }; }
  if (art === "zweistufig") {
    const v = wahlAus(["muenze", "wuerfel6", "urne"], z);
    if (v === "muenze") return { art, v, p1: q(1, 2), p2: q(1, 2), p: q(1, 4) };
    if (v === "wuerfel6") return { art, v, p1: q(1, 6), p2: q(1, 6), p: q(1, 36) };
    const r = ganz(2, 4, z), b = ganz(2, 4, z);
    return { art, v, r, b, p1: q(r, r + b), p2: q(r, r + b), p: qMul(q(r, r + b), q(r, r + b)) };
  }
  if (art === "relativ") { const n = wahlAus([50, 100, 200, 40], z), k = Math.round(n * wahlAus([0.15, 0.2, 0.18, 0.3, 0.25], z)); return { art, n, k, wert: r6(k / n) }; }
  const [zz, nn] = wahlAus([[1, 6], [1, 2], [1, 4], [1, 3]], z), n = wahlAus([60, 120, 300, 600], z);
  return { art: "erwartet", p: q(zz, nn), n, wert: n * zz / nn };
}
export const pNum = (b) => qNum(b);

/* ---------- 13 · Natürliche Zahlen und Stellenwert ---------- */
export const STELLEN = ["Einer", "Zehner", "Hunderter", "Tausender", "Zehntausender", "Hunderttausender", "Millionen", "Zehnmillionen"];
export const ZAHL_ARTEN = ["stelle", "runden", "zerlegung", "strahl", "nachfolger", "roemisch", "zehnerpotenz"];
export function roemisch(n) {
  const t = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let s = ""; for (const [w, b] of t) while (n >= w) { s += b; n -= w; } return s;
}
export function zahlAufgabe(art, z = Math.random) {
  art = art || wahlAus(ZAHL_ARTEN, z);
  const gross = () => { let n = 0; for (let i = 0; i < 7; i++) n = n * 10 + ganz(i ? 0 : 1, 9, z); return n; };
  if (art === "stelle") { const n = gross(), i = ganz(1, 6, z); return { art, n, i, ziffer: Math.floor(n / 10 ** i) % 10 }; }
  if (art === "runden") { const n = gross(), i = ganz(1, 5, z); return { art, n, i, wert: Math.round(n / 10 ** i) * 10 ** i }; }
  if (art === "zerlegung") { const n = gross() % 1000000; return { art, n: n < 100000 ? n + 100000 : n }; }
  if (art === "strahl") { const schritt = wahlAus([10, 20, 50, 100, 250, 1000], z), start = schritt * ganz(0, 8, z), k = ganz(1, 9, z); return { art, start, schritt, k, wert: start + k * schritt }; }
  if (art === "nachfolger") { const n = wahlAus([9999, 19999, 99999, 100000, 1000000, 40999, 300000], z), vor = z() < 0.5; return { art, n, vor, wert: vor ? n - 1 : n + 1 }; }
  if (art === "roemisch") { const n = wahlAus([14, 19, 24, 39, 44, 49, 90, 99, 144, 409, 1984, 2026, 1666, 3999, 2444], z); return { art, n, r: roemisch(n) }; }
  const ziffern = [ganz(1, 9, z), ganz(0, 9, z), ganz(0, 9, z)], e = [6, 4, 1];
  return { art: "zehnerpotenz", ziffern, e, wert: ziffern.reduce((s, d, i) => s + d * 10 ** e[i], 0) };
}
