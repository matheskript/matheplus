/* ======================================================================
   zahlraum.js – reine Mathematik für das Werkzeug „Zahlenräume“
   (ℕ → ℤ → ℚ → ℝ). Kein React, Node-testbar (tests/zahlraum.test.mjs).

   Vereinbarung in der ganzen App: ℕ = {1, 2, 3, …}, ℕ₀ = {0, 1, 2, …}.
   Die Übungen vermeiden die 0 als Ergebnis, damit beide Schreibweisen
   (mit oder ohne 0 in ℕ) zu denselben Antworten führen.

   Zahlen werden exakt dargestellt:
     { art: "q", q }            – rationale Zahl (q = { z, n } aus rechnen2.js)
     { art: "wurzel", k, r }    – k · √r  (r quadratfrei, r ≥ 2) – irrational
     { art: "pi" }              – π
   ====================================================================== */
import { q, qAdd, qSub, qMul, qDiv, qNum } from "./rechnen2.js";

export const RAEUME = ["N", "Z", "Q", "R"];
export const ZEICHEN = { N: "ℕ", Z: "ℤ", Q: "ℚ", R: "ℝ" };
export const NAMEN = {
  N: ["natürliche Zahlen", "natural numbers"],
  Z: ["ganze Zahlen", "integers"],
  Q: ["rationale Zahlen", "rational numbers"],
  R: ["reelle Zahlen", "real numbers"],
};
export const stufe = (raum) => RAEUME.indexOf(raum);

/* Kleinster der vier Zahlenräume, in dem eine exakt dargestellte Zahl liegt */
export function kleinsterRaum(x) {
  if (x.art === "q") {
    if (x.q.n !== 1) return "Q";
    return x.q.z >= 1 ? "N" : "Z";
  }
  return "R";
}
/* x ∈ raum? (ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ) */
export const liegtIn = (x, raum) => stufe(kleinsterRaum(x)) <= stufe(raum);

/* Quadratfreier Teil: n = a² · r  →  [a, r] */
export function wurzelZerlegen(n) {
  let a = 1, r = n;
  for (let d = 2; d * d <= r; d++) while (r % (d * d) === 0) { r /= d * d; a *= d; }
  return [a, r];
}
export const istQuadrat = (n) => n >= 0 && Number.isInteger(Math.sqrt(n)) && Math.round(Math.sqrt(n)) ** 2 === n;

/* √n exakt: Quadratzahl → rational, sonst k · √r */
export function wurzelVon(n) {
  if (istQuadrat(n)) return { art: "q", q: q(Math.round(Math.sqrt(n))) };
  const [k, r] = wurzelZerlegen(n);
  return { art: "wurzel", k, r };
}
export const zahlWert = (x) => (x.art === "q" ? qNum(x.q) : x.art === "wurzel" ? x.k * Math.sqrt(x.r) : Math.PI);

/* ---------- Abgeschlossenheit: a ∘ b in raum? ---------- */
export const OPS = { plus: "+", minus: "−", mal: "·", geteilt: ":" };
export function rechne(a, op, b) {
  if (op === "plus") return qAdd(a, b);
  if (op === "minus") return qSub(a, b);
  if (op === "mal") return qMul(a, b);
  return qDiv(a, b);
}
export const ergebnisRaum = (r) => kleinsterRaum({ art: "q", q: r });

/* Welche der vier Grundrechenarten sind in raum abgeschlossen? (Division nur durch Zahlen ≠ 0) */
export const ABGESCHLOSSEN = {
  N: { plus: true, minus: false, mal: true, geteilt: false },
  Z: { plus: true, minus: true, mal: true, geteilt: false },
  Q: { plus: true, minus: true, mal: true, geteilt: true },
  R: { plus: true, minus: true, mal: true, geteilt: true },
};

/* ---------- Zufall ---------- */
const wahlAus = (l, z) => l[Math.floor(z() * l.length)];
const ganz = (lo, hi, z) => lo + Math.floor(z() * (hi - lo + 1));
const vz = (z) => (z() < 0.5 ? -1 : 1);

/* Zufällige Zahl aus raum (für den Abgeschlossenheits-Tester und die Übungen); nie 0 */
export function zufallAus(raum, z = Math.random) {
  if (raum === "N") return q(ganz(1, 12, z));
  if (raum === "Z") return q(vz(z) * ganz(1, 12, z));
  const n = wahlAus([2, 3, 4, 5, 6, 8], z);
  let zz = vz(z) * ganz(1, 9, z);
  if (zz % n === 0) zz += zz > 0 ? 1 : -1;
  return q(zz, n);
}

/* ---------- Zahlen zum Einordnen ----------
   tex: Darstellung, x: exakte Zahl, falle: Darstellung täuscht (z. B. √16, 12/4) */
const NAT = [
  (z) => { const a = ganz(2, 40, z); return { tex: String(a), x: { art: "q", q: q(a) } }; },
  (z) => { const k = ganz(2, 9, z); return { tex: `\\sqrt{${k * k}}`, x: { art: "q", q: q(k) }, falle: "wurzel" }; },
  (z) => { const n = ganz(2, 6, z), k = ganz(2, 6, z); return { tex: `\\frac{${n * k}}{${n}}`, x: { art: "q", q: q(k) }, falle: "bruch" }; },
  (z) => { const a = wahlAus([2, 3, 5], z), e = ganz(2, 3, z); return { tex: `${a}^${e}`, x: { art: "q", q: q(a ** e) } }; },
  (z) => { const r = wahlAus([2, 3, 5, 7], z); return { tex: `\\sqrt{${r}} \\cdot \\sqrt{${r}}`, x: { art: "q", q: q(r) }, falle: "wurzel" }; },
];
const GANZ = [
  (z) => { const a = ganz(1, 30, z); return { tex: `−${a}`, x: { art: "q", q: q(-a) } }; },
  (z) => { const n = ganz(2, 5, z), k = ganz(2, 8, z); return { tex: `−\\frac{${n * k}}{${n}}`, x: { art: "q", q: q(-k) }, falle: "bruch" }; },
  (z) => { const k = ganz(2, 9, z); return { tex: `−\\sqrt{${k * k}}`, x: { art: "q", q: q(-k) }, falle: "wurzel" }; },
  (z) => { const a = ganz(2, 6, z), b = a + ganz(2, 9, z); return { tex: `${a} − ${b}`, x: { art: "q", q: q(a - b) } }; },
];
const RAT = [
  (z) => { const x = zufallAus("Q", z); return { tex: `${x.z < 0 ? "−" : ""}\\frac{${Math.abs(x.z)}}{${x.n}}`, x: { art: "q", q: x } }; },
  (z) => { const [t, w] = wahlAus([["0{,}75", q(3, 4)], ["2{,}5", q(5, 2)], ["−1{,}2", q(-6, 5)], ["0{,}125", q(1, 8)], ["−3{,}5", q(-7, 2)], ["0{,}04", q(1, 25)]], z); return { tex: t, x: { art: "q", q: w } }; },
  (z) => { const a = ganz(1, 8, z); return { tex: `0{,}\\overline{${a}}`, x: { art: "q", q: q(a, 9) }, falle: "periode" }; },
  (z) => { const [k, n] = wahlAus([[1, 2], [1, 3], [2, 3], [3, 4], [2, 5], [3, 5], [4, 5], [5, 2], [5, 3], [7, 4]], z); return { tex: `\\sqrt{\\frac{${k * k}}{${n * n}}}`, x: { art: "q", q: q(k, n) }, falle: "wurzel" }; },
];
const IRR = [
  (z) => { const n = wahlAus([2, 3, 5, 6, 7, 10, 11, 13, 15], z); return { tex: `\\sqrt{${n}}`, x: wurzelVon(n) }; },
  (z) => { const n = wahlAus([2, 3, 5], z); return { tex: `−\\sqrt{${n}}`, x: { art: "wurzel", k: -1, r: n } }; },
  () => ({ tex: "\\pi", x: { art: "pi" } }),
  (z) => { const n = wahlAus([8, 12, 18, 20, 50], z); return { tex: `\\sqrt{${n}}`, x: wurzelVon(n), falle: "wurzelGross" }; },
  (z) => { const n = wahlAus([2, 3, 5], z), a = ganz(1, 4, z); return { tex: `${a} + \\sqrt{${n}}`, x: { art: "wurzel", k: 1, r: n, plus: a } }; },
];
const TOEPFE = { N: NAT, Z: GANZ, Q: RAT, R: IRR };

/* Eine Zahl zum Einordnen; raum = gewünschter kleinster Zahlenraum (sonst zufällig) */
export function zahlZumEinordnen(raum, z = Math.random) {
  raum = raum || wahlAus(RAEUME, z);
  const e = wahlAus(TOEPFE[raum], z)(z);
  return { ...e, raum: kleinsterRaum(e.x), wert: zahlWert(e.x) + (e.x.plus || 0) };
}

/* ---------- Aussagen: wahr oder falsch? ---------- */
export const AUSSAGEN = [
  { id: "a1", wahr: true, de: "Jede natürliche Zahl ist auch eine ganze Zahl.", en: "Every natural number is also an integer.",
    gde: "ℕ ⊂ ℤ: 1, 2, 3, … stehen auch in ℤ.", gen: "ℕ ⊂ ℤ: 1, 2, 3, … are also in ℤ." },
  { id: "a2", wahr: true, de: "Jede ganze Zahl ist eine rationale Zahl.", en: "Every integer is a rational number.",
    gde: "Jede ganze Zahl lässt sich als Bruch schreiben: $−4 = \\frac{−4}{1}$.", gen: "Every integer can be written as a fraction: $−4 = \\frac{−4}{1}$." },
  { id: "a3", wahr: false, de: "Jede rationale Zahl ist eine ganze Zahl.", en: "Every rational number is an integer.",
    gde: "Gegenbeispiel: $\\frac{1}{2}$ liegt in ℚ, aber nicht in ℤ.", gen: "Counterexample: $\\frac{1}{2}$ is in ℚ but not in ℤ." },
  { id: "a4", wahr: false, de: "Die Differenz zweier natürlicher Zahlen ist immer eine natürliche Zahl.", en: "The difference of two natural numbers is always a natural number.",
    gde: "Gegenbeispiel: $2 − 7 = −5$ liegt nicht in ℕ.", gen: "Counterexample: $2 − 7 = −5$ is not in ℕ." },
  { id: "a5", wahr: true, de: "Das Produkt zweier ganzer Zahlen ist immer eine ganze Zahl.", en: "The product of two integers is always an integer.",
    gde: "ℤ ist bezüglich der Multiplikation abgeschlossen.", gen: "ℤ is closed under multiplication." },
  { id: "a6", wahr: false, de: "Der Quotient zweier ganzer Zahlen (Divisor ≠ 0) ist immer eine ganze Zahl.", en: "The quotient of two integers (divisor ≠ 0) is always an integer.",
    gde: "Gegenbeispiel: $2 : 5 = \\frac{2}{5}$ liegt nicht in ℤ.", gen: "Counterexample: $2 : 5 = \\frac{2}{5}$ is not in ℤ." },
  { id: "a7", wahr: true, de: "In ℚ kann man durch jede Zahl außer 0 teilen und bleibt in ℚ.", en: "In ℚ you can divide by any number except 0 and stay in ℚ.",
    gde: "$\\frac{a}{b} : \\frac{c}{d} = \\frac{a \\cdot d}{b \\cdot c}$ – wieder ein Bruch aus ganzen Zahlen.", gen: "$\\frac{a}{b} : \\frac{c}{d} = \\frac{a \\cdot d}{b \\cdot c}$ – again a fraction of integers." },
  { id: "a8", wahr: false, de: "Die Summe zweier irrationaler Zahlen ist immer irrational.", en: "The sum of two irrational numbers is always irrational.",
    gde: "Gegenbeispiel: $\\sqrt{2} + (−\\sqrt{2}) = 0$.", gen: "Counterexample: $\\sqrt{2} + (−\\sqrt{2}) = 0$." },
  { id: "a9", wahr: false, de: "Das Produkt zweier irrationaler Zahlen ist immer irrational.", en: "The product of two irrational numbers is always irrational.",
    gde: "Gegenbeispiel: $\\sqrt{2} \\cdot \\sqrt{2} = 2$.", gen: "Counterexample: $\\sqrt{2} \\cdot \\sqrt{2} = 2$." },
  { id: "a10", wahr: true, de: "Jede Zahl mit abbrechender oder periodischer Dezimaldarstellung ist rational.", en: "Every number with a terminating or repeating decimal expansion is rational.",
    gde: "Beispiele: $0{,}75 = \\frac{3}{4}$, $0{,}\\overline{3} = \\frac{1}{3}$.", gen: "Examples: $0.75 = \\frac{3}{4}$, $0.\\overline{3} = \\frac{1}{3}$." },
  { id: "a11", wahr: true, de: "$\\sqrt{2}$ hat eine unendliche, nicht periodische Dezimaldarstellung.", en: "$\\sqrt{2}$ has an infinite, non-repeating decimal expansion.",
    gde: "Wäre sie abbrechend oder periodisch, wäre $\\sqrt{2}$ ein Bruch – das ist ausgeschlossen.", gen: "If it terminated or repeated, $\\sqrt{2}$ would be a fraction – which is impossible." },
  { id: "a12", wahr: true, de: "Zwischen zwei verschiedenen rationalen Zahlen liegt immer noch eine rationale Zahl.", en: "Between two different rational numbers there is always another rational number.",
    gde: "Der Mittelwert $\\frac{a + b}{2}$ ist wieder rational.", gen: "The mean $\\frac{a + b}{2}$ is rational again." },
  { id: "a13", wahr: false, de: "Auf der Zahlengeraden gehört zu jedem Punkt eine rationale Zahl.", en: "Every point on the number line belongs to a rational number.",
    gde: "Der Punkt $\\sqrt{2}$ (Diagonale des Einheitsquadrats) ist eine Lücke in ℚ. Erst ℝ füllt die Zahlengerade lückenlos.", gen: "The point $\\sqrt{2}$ (diagonal of the unit square) is a gap in ℚ. Only ℝ fills the number line completely." },
  { id: "a14", wahr: true, de: "Die Gleichung $x^2 = 2$ hat in ℚ keine Lösung.", en: "The equation $x^2 = 2$ has no solution in ℚ.",
    gde: "Die Lösungen $\\pm\\sqrt{2}$ sind irrational – Widerspruchsbeweis.", gen: "The solutions $\\pm\\sqrt{2}$ are irrational – proof by contradiction." },
  { id: "a15", wahr: false, de: "Die Gleichung $x + 5 = 2$ hat in ℕ eine Lösung.", en: "The equation $x + 5 = 2$ has a solution in ℕ.",
    gde: "$x = −3$ – das gibt es erst in ℤ.", gen: "$x = −3$ – that only exists in ℤ." },
  { id: "a16", wahr: true, de: "Die Gleichung $5 \\cdot x = 2$ hat in ℚ eine Lösung, in ℤ aber nicht.", en: "The equation $5 \\cdot x = 2$ has a solution in ℚ but not in ℤ.",
    gde: "$x = \\frac{2}{5}$.", gen: "$x = \\frac{2}{5}$." },
];

/* ---------- Übungsaufgaben ---------- */
export const ZR_ARTEN = ["einordnen", "element", "abgeschlossen", "rauswerfer", "gleichung", "wahrfalsch", "dezimal", "wurzel", "beweis"];

export function zrAufgabe(art, z = Math.random) {
  art = art || wahlAus(ZR_ARTEN, z);

  if (art === "einordnen") return { art, ...zahlZumEinordnen(null, z) };

  if (art === "element") {
    const zahl = zahlZumEinordnen(null, z);
    const raum = wahlAus(RAEUME, z);
    return { art, ...zahl, frageRaum: raum, drin: liegtIn(zahl.x, raum) };
  }

  if (art === "abgeschlossen") {
    const raum = wahlAus(["N", "Z", "Q"], z);
    const op = wahlAus(Object.keys(OPS), z);
    let a, b, r;
    for (let i = 0; i < 50; i++) {
      a = zufallAus(raum, z); b = zufallAus(raum, z);
      if (op === "minus" && raum === "N" && i < 25 && z() < 0.5) { const t = a; a = b; b = t; }
      r = rechne(a, op, b);
      if (r.z !== 0 && Math.abs(qNum(r)) <= 200) break;
    }
    return { art, raum, op, a, b, r, drin: stufe(ergebnisRaum(r)) <= stufe(raum), ergRaum: ergebnisRaum(r) };
  }

  if (art === "rauswerfer") {
    /* Vier Rechnungen in raum, genau eine führt hinaus */
    const raum = wahlAus(["N", "Z", "Q"], z);
    const a = ganz(2, 9, z), b = a + ganz(2, 8, z);
    const opt = [];
    if (raum === "N") {
      opt.push({ tex: `${a} + ${b}`, raus: false }, { tex: `${a} \\cdot ${b}`, raus: false }, { tex: `${b} − ${a}`, raus: false }, { tex: `${a} − ${b}`, raus: true });
    } else if (raum === "Z") {
      const c = ganz(2, 5, z), d = c * ganz(2, 4, z) + 1;
      opt.push({ tex: `${a} − ${b}`, raus: false }, { tex: `(−${a}) \\cdot ${b}`, raus: false }, { tex: `(−${c * a}) : ${c}`, raus: false }, { tex: `${d} : ${c}`, raus: true });
    } else {
      const n = wahlAus([2, 3, 5, 7], z);
      opt.push({ tex: `\\frac{1}{${a}} − \\frac{1}{${b}}`, raus: false }, { tex: `\\frac{${a}}{3} : \\frac{2}{${b}}`, raus: false }, { tex: `\\sqrt{${a * a}}`, raus: false }, { tex: `\\sqrt{${n}}`, raus: true });
    }
    return { art, raum, a, b, optionen: opt };
  }

  if (art === "gleichung") {
    /* Welchen Zahlenraum braucht die Lösung? x + a = b, a · x = b, x² = n */
    const typ = wahlAus(["plus", "mal", "quadrat"], z);
    if (typ === "plus") { const a = ganz(3, 12, z), b = ganz(1, a - 1, z); return { art, typ, a, b, x: { art: "q", q: q(b - a) }, raum: "Z" }; }
    if (typ === "mal") {
      const a = ganz(2, 9, z); let b = ganz(1, 20, z);
      if (z() < 0.3) b = a * ganz(1, 5, z);
      const x = { art: "q", q: q(b, a) };
      return { art, typ, a, b, x, raum: kleinsterRaum(x) };
    }
    const n = z() < 0.35 ? ganz(2, 9, z) ** 2 : wahlAus([2, 3, 5, 6, 7, 8, 10, 12], z);
    const x = wurzelVon(n);
    return { art, typ, n, x, raum: kleinsterRaum(x) };
  }

  /* Das Feld id der Aussage wird zu aid – „id“ gehört der laufenden Aufgabe (Schlüssel der Übungskarte) */
  if (art === "wahrfalsch") { const { id, ...s } = wahlAus(AUSSAGEN, z); return { art, ...s, aid: id }; }

  if (art === "dezimal") {
    /* Dezimalzahl als Bruch: abbrechend (Nenner 10, 100, …) oder rein periodisch (Nenner 9, 99) */
    const typ = wahlAus(["abbrechend", "periode1", "periode2"], z);
    if (typ === "abbrechend") {
      const [tex, zz, n] = wahlAus([["0{,}75", 3, 4], ["0{,}4", 2, 5], ["0{,}35", 7, 20], ["1{,}25", 5, 4], ["0{,}125", 1, 8], ["2{,}6", 13, 5], ["0{,}06", 3, 50]], z);
      return { art, typ, tex, zaehler: zz, nenner: n };
    }
    if (typ === "periode1") { const a = ganz(1, 8, z); return { art, typ, tex: `0{,}\\overline{${a}}`, zaehler: a, nenner: 9, roh: [a, 9] }; }
    const ab = wahlAus([12, 15, 18, 27, 36, 45, 54, 81, 13, 23, 47], z);
    return { art, typ, tex: `0{,}\\overline{${String(ab).padStart(2, "0")}}`, zaehler: ab, nenner: 99, roh: [ab, 99] };
  }

  if (art === "wurzel") {
    const quadrat = z() < 0.3;
    const n = quadrat ? ganz(2, 12, z) ** 2 : (() => { let m; do m = ganz(2, 99, z); while (istQuadrat(m)); return m; })();
    const k = Math.floor(Math.sqrt(n));
    return { art, n, rational: istQuadrat(n), k };
  }

  /* beweis: √p ist irrational, p Primzahl */
  const p = wahlAus([2, 3, 5], z);
  return { art: "beweis", p };
}

/* Gemeinsame Prüfung der Bruchschreibweise einer periodischen Zahl: 0,\overline{a} = a/9, 0,\overline{ab} = ab/99 */
export const periodeAlsBruch = (ziffern) => q(Number(ziffern), 10 ** String(ziffern).length - 1);

/* Näherungsbrüche für √2 (Kettenbruch): 1/1, 3/2, 7/5, 17/12, 41/29, 99/70, … – keiner trifft genau */
export function naeherungenWurzel2(anzahl = 6) {
  const l = [];
  let p = 1, qq = 1;
  for (let i = 0; i < anzahl; i++) { l.push([p, qq]); [p, qq] = [p + 2 * qq, p + qq]; }
  return l;
}
