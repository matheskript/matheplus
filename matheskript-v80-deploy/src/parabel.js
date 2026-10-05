/* ======================================================================
   parabel.js – reine Mathematik für die Parabeln-Seite (kein React).
   Alle Rechnungen mit exakten Brüchen (q aus rechnen2.js).
   · Scheitelpunkt, Scheitelform, Diskriminante, Nullstellen
   · Zufallsaufgaben: der Scheitel liegt IMMER in [−5, 5] × [−5, 5]
   · Brennpunkt, Tangente, Normale und Spiegelung des Strahls P→F
   ====================================================================== */
import { q, qAdd, qSub, qMul, qDiv, qNeg, qNum, qGleich, qNull, qTex } from "./rechnen2.js";

export const SCHEITEL_MAX = 5;      // Scheitel nur in [−5, 5] × [−5, 5]
export const FENSTER = 10;          // Schaubild: x und y von −10 bis 10, beide Achsen im Maßstab 1 : 1

const zwei = q(2), vier = q(4);
export const zahlQ = (v) => (typeof v === "number" ? q(v) : v);

/* ---------- Parabel ---------- */
export function parabel(a, b, c) {
  a = zahlQ(a); b = zahlQ(b); c = zahlQ(c);
  const d = qNeg(qDiv(b, qMul(zwei, a)));                       // −b / (2a)
  const e = qSub(c, qDiv(qMul(b, b), qMul(vier, a)));           // c − b² / (4a)
  const D = qSub(qMul(b, b), qMul(vier, qMul(a, c)));           // b² − 4ac
  return { a, b, c, d, e, D };
}

/* Scheitelform a(x − d)² + e  →  Normalform */
export function ausScheitel(a, d, e) {
  a = zahlQ(a); d = zahlQ(d); e = zahlQ(e);
  const b = qNeg(qMul(zwei, qMul(a, d)));
  const c = qAdd(qMul(a, qMul(d, d)), e);
  return parabel(a, b, c);
}

export const wertAn = (p, x) => qNum(p.a) * x * x + qNum(p.b) * x + qNum(p.c);
export const f = (p) => (x) => wertAn(p, x);
export const scheitelOK = (p, g = SCHEITEL_MAX) => Math.abs(qNum(p.d)) <= g + 1e-9 && Math.abs(qNum(p.e)) <= g + 1e-9;

/* ---------- Texte (TeX für die Formelanzeige) ---------- */
const betrag = (x) => (qNum(x) < 0 ? qNeg(x) : x);
const neg = (x) => qNum(x) < 0;
const koef = (x) => qTex(x);

/* Normalform ax² + bx + c als TeX */
export function normalTex(p) {
  const teile = [];
  const term = (k, pot) => {
    if (qNull(k)) return;
    const vor = neg(k) ? "−" : "+";
    const b = betrag(k);
    const eins = qGleich(b, q(1));
    const m = pot === 2 ? "x^2" : pot === 1 ? "x" : "";
    const zahl = pot === 0 ? koef(b) : eins ? "" : koef(b);
    teile.push([vor, zahl + m]);
  };
  term(p.a, 2); term(p.b, 1); term(p.c, 0);
  if (!teile.length) return "0";
  return teile.map(([v, t], i) => (i === 0 ? (v === "−" ? "−" : "") + t : ` ${v} ${t}`)).join("");
}

/* Scheitelform a(x − d)² + e als TeX */
export function scheitelTex(a, d, e) {
  a = zahlQ(a); d = zahlQ(d); e = zahlQ(e);
  const klammer = qNull(d) ? "x" : `x ${neg(d) ? "+" : "−"} ${koef(betrag(d))}`;
  const quad = qNull(d) ? "x^2" : `(${klammer})^2`;
  const vorA = qGleich(a, q(1)) ? "" : qGleich(a, q(-1)) ? "−" : koef(a);
  const rest = qNull(e) ? "" : ` ${neg(e) ? "−" : "+"} ${koef(betrag(e))}`;
  return `${vorA}${quad}${rest}`;
}

/* ---------- Zufall ---------- */
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const wahl = (l) => l[Math.floor(Math.random() * l.length)];
const istQuadratzahl = (n) => n >= 0 && Number.isInteger(n) && Number.isInteger(Math.sqrt(n));

/* Zufallsparabel mit ganzzahligen a, b, c und Scheitel in [−5, 5]².
   fall: "zwei" | "eine" | "keine" | "egal"; exakt: nur Parabeln mit rationalen Nullstellen (D Quadratzahl) */
export function zufallParabel({ aListe = [1, -1, 2, -2], fall = "egal", exakt = false, nenner = 4 } = {}) {
  for (let v = 0; v < 6000; v++) {
    const a = wahl(aListe), b = rnd(-14, 14), c = rnd(-12, 12);
    const p = parabel(a, b, c);
    if (!scheitelOK(p) || p.d.n > nenner || p.e.n > 2 * nenner) continue;
    const D = qNum(p.D);
    const art = D > 0 ? "zwei" : D === 0 ? "eine" : "keine";
    if (fall !== "egal" && art !== fall) continue;
    if (exakt && fall !== "keine" && !(D >= 0 && istQuadratzahl(D))) continue;
    if (fall === "zwei" && !exakt && istQuadratzahl(D)) continue;     // „nicht exakt“ heißt: Wurzel bleibt irrational
    if (b === 0 && c === 0) continue;                                 // zu langweilig
    return p;
  }
  return parabel(1, -2, -3);
}

/* Parabel mit Scheitelform a(x−d)²+e, ganzzahlige d, e in [−5, 5] */
export function zufallScheitelAufgabe({ aListe = [1, -1, 2, -2] } = {}) {
  for (let v = 0; v < 2000; v++) {
    const a = wahl(aListe), d = rnd(-5, 5), e = rnd(-5, 5);
    if (d === 0 && e === 0) continue;
    if (d === 0) continue;                    // d = 0 wäre schon reine Scheitelform – keine Übung
    return { p: ausScheitel(a, d, e), a, d, e };
  }
  return { p: ausScheitel(1, 2, -3), a: 1, d: 2, e: -3 };
}

/* Vieta-Aufgabe: ganzzahlige Nullstellen r1 < r2, Scheitel in [−5, 5]² */
export function zufallVieta({ aListe = [1, 1, -1, 2] } = {}) {
  for (let v = 0; v < 6000; v++) {
    const a = wahl(aListe), r1 = rnd(-8, 6), r2 = rnd(r1 + 1, 8);
    const p = parabel(a, -a * (r1 + r2), a * r1 * r2);
    if (!scheitelOK(p)) continue;
    if (r1 === 0 && r2 === 0) continue;
    return { p, r1, r2 };
  }
  return { p: parabel(1, -1, -6), r1: -2, r2: 3 };
}

/* ---------- Nullstellen ---------- */
export function nullstellen(p) {
  const D = qNum(p.D), a = qNum(p.a), b = qNum(p.b);
  if (D < 0) return { anzahl: 0, xs: [] };
  if (D === 0) return { anzahl: 1, xs: [-b / (2 * a)], exakt: [qNeg(qDiv(p.b, qMul(zwei, p.a)))] };
  const w = Math.sqrt(D);
  const xs = [(-b - w) / (2 * a), (-b + w) / (2 * a)].sort((u, v) => u - v);
  let exakt = null;
  if (istQuadratzahl(D)) {
    const wq = q(Math.round(w));
    const z = qMul(zwei, p.a);
    const e1 = qDiv(qAdd(qNeg(p.b), wq), z), e2 = qDiv(qSub(qNeg(p.b), wq), z);
    exakt = qNum(e1) < qNum(e2) ? [e1, e2] : [e2, e1];
  }
  return { anzahl: 2, xs, exakt, wurzel: w };
}

/* ---------- Brennpunkt, Tangente, Normale, Spiegelung ----------
   f(x) = a(x − d)² + e  mit a > 0 (nach oben geöffnet).
   Lichtstrahl vom Brennpunkt F zum Punkt P(u | f(u)); gespiegelt wird die Linie P→F an der Normalen in P. */
export function brennpunkt(a, d, e, u) {
  a = zahlQ(a); d = zahlQ(d); e = zahlQ(e); u = zahlQ(u);
  const pBrenn = qDiv(q(1), qMul(vier, a));                      // p = 1 / (4a)
  const F = { x: d, y: qAdd(e, pBrenn) };
  const leit = qSub(e, pBrenn);                                  // Leitlinie y = e − p
  const s = qSub(u, d);
  const P = { x: u, y: qAdd(qMul(a, qMul(s, s)), e) };
  const m = qMul(qMul(zwei, a), s);                              // f′(u) = 2a(u − d)
  const t0 = qSub(P.y, qMul(m, u));                              // Tangente y = m·x + t0
  const w = { x: qSub(F.x, P.x), y: qSub(F.y, P.y) };            // Vektor P → F
  const n = { x: qNeg(m), y: q(1) };                             // Richtungsvektor der Normalen
  const wn = qAdd(qMul(w.x, n.x), qMul(w.y, n.y));
  const nn = qAdd(qMul(n.x, n.x), qMul(n.y, n.y));
  const k = qDiv(qMul(zwei, wn), nn);                            // 2 (w·n) / (n·n)
  const r = { x: qSub(qMul(k, n.x), w.x), y: qSub(qMul(k, n.y), w.y) };   // gespiegelt: k·n − w
  const nQ = qNull(m) ? null : qNeg(qDiv(q(1), m));              // Normalen-Steigung
  const n0 = nQ ? qSub(P.y, qMul(nQ, u)) : null;
  return { a, d, e, u, s, p: pBrenn, F, leit, P, m, t0, w, n, wn, nn, k, r, nQ, n0,
    laenge: qAdd(qMul(a, qMul(s, s)), pBrenn) };                 // a s² + p = Abstand zur Leitlinie
}

/* größter erlaubter Abstand |s| = |u − d|, damit P im Schaubild bleibt (y ≤ 9, |x| ≤ 9) */
export function maxS(a, d, e) {
  let m = 0;
  for (let s = 1; s <= 12; s++) {
    const y = qNum(a) * s * s + qNum(e);
    if (y > 9 || Math.abs(qNum(d) + s) > 9 || Math.abs(qNum(d) - s) > 9) break;
    m = s;
  }
  return m;
}
