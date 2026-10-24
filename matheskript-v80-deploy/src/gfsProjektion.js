/* ============================================================
   GFS-Trainer · Projektionen mit Matrizen (Kursstufe 2, Kap. VII Abstände und Winkel)
   Reine Logik ohne React: exakte Brüche, Vektoren und Matrizen,
   Schatten (Parallelprojektion in eine Koordinatenebene), orthogonale
   Projektion auf eine Ebene durch den Ursprung, Schrägbild aus dem Heft,
   Zentralprojektion (Ausblick, nicht linear), das Haus für Labor und Bilder,
   vier Übungsgeneratoren mit Prüfung, gezielter Rückmeldung, Tipp und
   Rechenweg, Gliederung, Tipps und Kolloquium.
   Getestet in tests/gfsProjektion.test.mjs.
   Aufgaben, Zahlen und Formulierungen sind eigene.
   Konventionen: Vektoren sind Listen von Brüchen { z, n }, Matrizen Listen
   von Zeilen; Index 0, 1, 2 steht für x₁, x₂, x₃.
   ============================================================ */

/* ---------- Zufall ---------- */
/* mulberry32: kleiner Generator mit Startwert – für wiederholbare Tests */
export function zufallszahlen(startwert = 1) {
  let s = startwert >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/* Ganzzahl-Würfel zufall(a, b) wie in den übrigen GFS-Generatoren */
export const wuerfelAus = (rnd = Math.random) => (a, b) => a + Math.floor(rnd() * (b - a + 1));
const zz = wuerfelAus();
const wahl = (liste, zufall) => liste[zufall(0, liste.length - 1)];
const stufeIn = (s) => Math.max(1, Math.min(5, Math.round(s || 1)));

/* ---------- Brüche (exakt) ---------- */
export const ggT = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
export const kgV = (a, b) => Math.abs(a * b) / ggT(a, b);
export function Q(z, n = 1) {
  if (z && typeof z === "object") return z;
  if (n === 0) throw new Error("Nenner 0");
  if (n < 0) { z = -z; n = -n; }
  if (z === 0) return { z: 0, n: 1 };
  const g = ggT(z, n);
  return { z: z / g, n: n / g };
}
export const qAdd = (a, b) => { a = Q(a); b = Q(b); return Q(a.z * b.n + b.z * a.n, a.n * b.n); };
export const qNeg = (a) => { a = Q(a); return Q(-a.z, a.n); };
export const qSub = (a, b) => qAdd(a, qNeg(b));
export const qMul = (a, b) => { a = Q(a); b = Q(b); return Q(a.z * b.z, a.n * b.n); };
export const qDiv = (a, b) => { a = Q(a); b = Q(b); return Q(a.z * b.n, a.n * b.z); };
export const qWert = (a) => { a = Q(a); return a.z / a.n; };
export const qGleich = (a, b) => { a = Q(a); b = Q(b); return a.z * b.n === b.z * a.n; };
export const qNull = (a) => Q(a).z === 0;
export const qGanz = (a) => Q(a).n === 1;
/* TeX: −\frac{3}{4}, 5, 0 */
export const qTex = (a) => { const q = Q(a); const s = q.z < 0 ? "−" : ""; const b = Math.abs(q.z); return q.n === 1 ? `${s}${b}` : `${s}\\frac{${b}}{${q.n}}`; };
/* Klartext: −3/4 */
export const qText = (a) => { const q = Q(a); return (q.z < 0 ? "−" : "") + (q.n === 1 ? String(Math.abs(q.z)) : `${Math.abs(q.z)}/${q.n}`); };
/* in Klammern, wenn negativ (für Produkte wie 3 · (−2)) */
const qTexK = (a) => (Q(a).z < 0 ? `(${qTex(a)})` : qTex(a));

/* Eingabe lesen: „3“, „−3/4“, „-3/4“, „1,5“, „-0,25“, „1,5/2“ → Bruch (Dezimalzahlen exakt); sonst null */
export function liesQ(s) {
  const t = String(s ?? "").trim().replace(/\s/g, "").replace(/[−–]/g, "-").replace(/\./g, ",");
  if (!t) return null;
  const zahl = (u) => {
    const m = /^([+-]?)(\d*)(?:,(\d+))?$/.exec(u);
    if (!m || (!m[2] && !m[3])) return null;
    const nach = m[3] || "";
    const q = Q(Number((m[2] || "0") + nach), 10 ** nach.length);
    return m[1] === "-" ? qNeg(q) : q;
  };
  const teile = t.split("/");
  if (teile.length === 1) return zahl(teile[0]);
  if (teile.length !== 2) return null;
  const a = zahl(teile[0]), b = zahl(teile[1]);
  return a && b && !qNull(b) ? qDiv(a, b) : null;
}

/* ---------- Vektoren ---------- */
export const V = (...w) => w.map((x) => Q(x));
export const vAdd = (a, b) => a.map((x, i) => qAdd(x, b[i]));
export const vSub = (a, b) => a.map((x, i) => qSub(x, b[i]));
export const vMal = (k, a) => a.map((x) => qMul(k, x));
export const skalar = (a, b) => a.reduce((s, x, i) => qAdd(s, qMul(x, b[i])), Q(0));
export const vGleich = (a, b) => !!a && !!b && a.length === b.length && a.every((x, i) => x !== null && qGleich(x, b[i]));
export const vZahl = (a) => a.map(qWert);
export const vNull = (a) => a.every(qNull);
export const vTex = (a) => (a.length === 2 ? `\\binom{${qTex(a[0])}}{${qTex(a[1])}}` : `\\spalte{${qTex(a[0])}}{${qTex(a[1])}}{${qTex(a[2])}}`);
export const punktTex = (name, a) => `${name}(${a.map(qTex).join(" \\mid ")})`;
export const einheitsvektor = (j) => V(...[0, 1, 2].map((i) => (i === j ? 1 : 0)));

/* ---------- Matrizen ---------- */
export const MAT = (zeilen) => zeilen.map((z) => z.map((x) => Q(x)));
export const spalte = (A, j) => A.map((z) => z[j]);
export const ausSpalten = (sp) => sp[0].map((_, i) => sp.map((s) => s[i]));
export const transponiert = (A) => A[0].map((_, j) => spalte(A, j));
/* Matrix mal Vektor: Zeile i · Vektor = Komponente i – dasselbe wie die Spalten mit x₁, x₂, x₃ gewichtet addieren */
export const matVek = (A, x) => A.map((z) => skalar(z, x));
export const spaltenSumme = (A, x) => x.reduce((s, xj, j) => vAdd(s, vMal(xj, spalte(A, j))), A.map(() => Q(0)));
/* Verkettung: Spalte j von A · B = A · (Spalte j von B) – „erst B, dann A“ */
export const matMal = (A, B) => ausSpalten(B[0].map((_, j) => matVek(A, spalte(B, j))));
export const mGleich = (A, B) => A.length === B.length && A.every((z, i) => vGleich(z, B[i]));
export const EINHEIT = MAT([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
/* Matrix einer linearen Abbildung f: die Bilder der Einheitsvektoren als Spalten */
export const matrixAus = (f) => ausSpalten([0, 1, 2].map((j) => f(einheitsvektor(j))));
/* ganzzahlige Darstellung A = 1/d · M (d = kleinster gemeinsamer Nenner) */
export function matrixGanz(A) {
  const d = A.flat().reduce((s, x) => kgV(s, Q(x).n), 1);
  return { d, M: A.map((z) => z.map((x) => qMul(x, d).z)) };
}

/* ---------- Die Projektionen ---------- */
/* Schatten: Parallelprojektion in die Koordinatenebene x_k = 0 (k = 0, 1, 2) in Richtung v (v_k ≠ 0).
   Gerade X = P + t · v trifft die Ebene, wenn p_k + t · v_k = 0, also t = −p_k / v_k. */
export const schattenT = (p, v, k = 2) => qDiv(qNeg(p[k]), v[k]);
export const schatten = (p, v, k = 2) => vAdd(p, vMal(schattenT(p, v, k), v));
export const schattenMatrix = (v, k = 2) => matrixAus((e) => schatten(e, v, k));
/* orthogonale Projektion auf die Ebene n · x = 0: Lotgerade X = P + t · n, t = −(P · n)/(n · n) */
export const orthoLambda = (p, n) => qDiv(skalar(p, n), skalar(n, n));
export const ortho = (p, n) => vSub(p, vMal(orthoLambda(p, n), n));
export const orthoMatrix = (n) => matrixAus((e) => ortho(e, n));

/* Schrägbild im Heft: x₂ nach rechts, x₃ nach oben, x₁ unter 45° nach links unten, eine Einheit auf der
   x₁-Achse = eine Kästchendiagonale (1 LE = 1 cm = 2 Kästchen). Dann ist e₁ ↦ (−½ | −½). */
export const SCHRAEG = MAT([[Q(-1, 2), 1, 0], [Q(-1, 2), 0, 1]]);
export const schraeg = (p) => matVek(SCHRAEG, p);
export const schraegZahl = ([x1, x2, x3]) => [x2 - x1 / 2, x3 - x1 / 2];
/* Das Schrägbild ist selbst ein Schatten: auf die Rückwand x₁ = 0 bei Licht in Richtung (−2 | −1 | −1) */
export const SCHRAEG_LICHT = V(-2, -1, -1);
/* Zentralprojektion (Ausblick): Auge in O, Bildschirm = Ebene x₁ = 1 → Bildpunkt (p₂/p₁ | p₃/p₁).
   Geteilt wird durch die Tiefe p₁ – das ist keine lineare Abbildung. */
export const zentral = (p) => [qDiv(p[1], p[0]), qDiv(p[2], p[0])];

/* ---------- Beispiele der Herleitung ---------- */
export const LICHT = V(1, 2, -2);                         // Sonne in Richtung (1 | 2 | −2)
export const BEISPIEL_F = V(2, 2, 2);                     // Hausecke F, Schatten (3 | 4 | 0) mit t = 1
export const BEISPIEL_P = V(1, 2, 2);                     // Punkt der Animation „Spalten“: Schatten (2 | 4 | 0)
export const NORMALE = V(-1, 2, 2);                       // Ebene −x₁ + 2x₂ + 2x₃ = 0, n · n = 9
export const BEISPIEL_Q = V(1, 2, 3);                     // Q · n = 9 → Q′ = (2 | 0 | 1)

/* ---------- Das Haus (Labor und Bilder): Würfel 2 × 2 × 2 mit Satteldach, First S T in Höhe 3 parallel zur x₁-Achse ---------- */
export const HAUS = {
  ecken: [[2, 0, 0], [2, 2, 0], [0, 2, 0], [0, 0, 0], [2, 0, 2], [2, 2, 2], [0, 2, 2], [0, 0, 2], [2, 1, 3], [0, 1, 3]],
  namen: ["A", "B", "C", "D", "E", "F", "G", "H", "S", "T"],
  kanten: [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7], [8, 9], [4, 8], [5, 8], [7, 9], [6, 9]],
};
/* Labor: Lichtrichtung (v₁ | v₂ | −2) mit −2 ≤ v₁, v₂ ≤ 2; Normalenvektor mit Einträgen −3 … 3, nicht 0 */
export const LABOR_GRENZEN = { v: [-2, 2], n: [-3, 3] };
export function laborMatrix(modus, w) {
  if (modus === "schatten") return schattenMatrix(V(w.v1, w.v2, -2), 2);
  return orthoMatrix(V(w.n1, w.n2, w.n3));
}
export const laborErlaubt = (modus, w) => (modus === "schatten"
  ? [w.v1, w.v2].every((x) => Number.isInteger(x) && x >= -2 && x <= 2)
  : [w.n1, w.n2, w.n3].every((x) => Number.isInteger(x) && x >= -3 && x <= 3) && (w.n1 || w.n2 || w.n3));

/* ---------- Kleine Texthelfer ---------- */
const IDX = ["1", "2", "3"];
/* lineare Terme wie „2p_1 − p_3“ */
export function linTerm(koeff, name = "p") {
  let s = "";
  koeff.forEach((c, i) => {
    const q = Q(c);
    if (qNull(q)) return;
    const b = Math.abs(qWert(q)) === 1 ? "" : qTex(Q(Math.abs(q.z), q.n));
    const glied = `${b}${name}_${IDX[i]}`;
    s += s ? (q.z < 0 ? ` − ${glied}` : ` + ${glied}`) : (q.z < 0 ? `−${glied}` : glied);
  });
  return s || "0";
}
/* Summe k₁ · X₁ + k₂ · X₂ + …: Faktor 1 weglassen, Faktor 0 überspringen, Minus vorziehen */
function summeTex(terme) {
  let s = "";
  for (const [k, x] of terme) {
    const q = Q(k);
    if (qNull(q)) continue;
    const betrag = Q(Math.abs(q.z), q.n);
    const glied = qGleich(betrag, 1) ? x : `${qTex(betrag)} \\cdot ${x}`;
    s += s ? (q.z < 0 ? ` − ${glied}` : ` + ${glied}`) : (q.z < 0 ? `−${glied}` : glied);
  }
  return s || vTex(V(0, 0, 0));
}
const EBENE_NAME = ["x_2x_3", "x_1x_3", "x_1x_2"];       // Koordinatenebene x_k = 0
const EBENE_ORT = ["auf der Rückwand", "auf der linken Wand", "auf dem Boden"];

/* ---------- Übungen ---------- */
export const ARTEN = [
  { id: "matvek", name: "Matrix mal Vektor" },
  { id: "aufstellen", name: "Matrix aufstellen" },
  { id: "schatten", name: "Schattenpunkt" },
  { id: "ortho", name: "Lot auf eine Ebene" },
];
export const STUFEN_NAMEN = {
  matvek: ["kleine Zahlen", "mit Minus", "mit Brüchen", "Projektionsmatrix", "zwei Abbildungen"],
  aufstellen: ["Bilder gegeben", "Rechenvorschrift", "Bild einer Summe", "geometrisch", "andere Vektoren"],
  schatten: ["Boden, ganzzahlig", "Boden, steiles Licht", "Boden, mit Brüchen", "Wand", "beliebige Ebene"],
  ortho: ["einfache Ebene", "n · n = 9", "mit Brüchen", "Normalenvektor frei", "aus der Koordinatenform"],
};

const zufallsVektor = (zufall, lo, hi) => V(zufall(lo, hi), zufall(lo, hi), zufall(lo, hi));
const zufallsMatrix = (zufall, lo, hi) => [0, 1, 2].map(() => [0, 1, 2].map(() => Q(zufall(lo, hi))));
const nullen = (A) => A.flat().filter(qNull).length;

/* Normalenvektoren je Stufe */
const N2 = [[1, 1, 0], [1, 0, 1], [0, 1, 1], [1, -1, 0], [1, 0, -1], [0, 1, -1]];
const N9 = [[1, 2, 2], [2, 1, 2], [2, 2, 1], [1, -2, 2], [2, -1, 2], [2, 2, -1], [1, 2, -2], [2, 1, -2], [-1, 2, 2]];
const N3 = [[1, 1, 1], [1, 1, -1], [1, -1, 1], [-1, 1, 1], [2, 1, 0], [1, 0, 2], [0, 1, 2], [1, 2, 0], [2, 0, 1], [0, 2, 1], [1, 1, 2], [2, 1, 1], [1, 2, 1]];

/* geometrische Abbildungen für „Matrix aufstellen“, Stufe 4 – jeweils mit der Matrix */
export const GEOMETRISCH = [
  { id: "spx3", text: "die Spiegelung an der $x_1x_2$-Ebene", A: [[1, 0, 0], [0, 1, 0], [0, 0, -1]] },
  { id: "spx1", text: "die Spiegelung an der $x_2x_3$-Ebene", A: [[-1, 0, 0], [0, 1, 0], [0, 0, 1]] },
  { id: "spx2", text: "die Spiegelung an der $x_1x_3$-Ebene", A: [[1, 0, 0], [0, -1, 0], [0, 0, 1]] },
  { id: "punkt", text: "die Punktspiegelung am Ursprung", A: [[-1, 0, 0], [0, -1, 0], [0, 0, -1]] },
  { id: "boden", text: "die senkrechte Projektion auf die $x_1x_2$-Ebene", A: [[1, 0, 0], [0, 1, 0], [0, 0, 0]] },
  { id: "achse", text: "die senkrechte Projektion auf die $x_3$-Achse", A: [[0, 0, 0], [0, 0, 0], [0, 0, 1]] },
  { id: "dreh3", text: "die Drehung um die $x_3$-Achse um 90°, bei der die positive $x_1$-Achse auf die positive $x_2$-Achse fällt", A: [[0, -1, 0], [1, 0, 0], [0, 0, 1]] },
  { id: "dreh1", text: "die Drehung um die $x_1$-Achse um 90°, bei der die positive $x_2$-Achse auf die positive $x_3$-Achse fällt", A: [[1, 0, 0], [0, 0, -1], [0, 1, 0]] },
  { id: "tausch", text: "die Spiegelung an der Ebene $x_1 = x_2$ (sie vertauscht $x_1$ und $x_2$)", A: [[0, 1, 0], [1, 0, 0], [0, 0, 1]] },
  { id: "streck2", text: "die Streckung vom Ursprung aus mit dem Faktor 2", A: [[2, 0, 0], [0, 2, 0], [0, 0, 2]] },
  { id: "streckH", text: "die Streckung vom Ursprung aus mit dem Faktor $\\frac{1}{2}$", A: [[Q(1, 2), 0, 0], [0, Q(1, 2), 0], [0, 0, Q(1, 2)]] },
  { id: "schatten", text: "der Schatten auf die $x_1x_2$-Ebene bei Licht in Richtung $\\spalte{2}{−1}{−1}$", A: [[1, 0, 2], [0, 1, -1], [0, 0, 0]] },
];

export function aufgabe(art, stufe, zufall = zz) {
  const s = stufeIn(stufe);
  if (art === "matvek") {
    let A, x, B = null;
    for (let versuch = 0; versuch < 200; versuch++) {
      if (s === 1) { A = zufallsMatrix(zufall, 0, 2); x = zufallsVektor(zufall, 0, 3); }
      else if (s === 2) { A = zufallsMatrix(zufall, -2, 3); x = zufallsVektor(zufall, -3, 3); }
      else if (s === 3) { A = [0, 1, 2].map(() => [0, 1, 2].map(() => Q(zufall(-3, 4), 2))); x = zufallsVektor(zufall, -2, 3); }
      else if (s === 4) {
        A = zufall(0, 2) ? orthoMatrix(V(...wahl([...N2, ...N3, ...N9], zufall)))
          : (() => { const k = zufall(0, 2); const v = zufallsVektor(zufall, -2, 2); v[k] = Q(wahl([-2, -3], zufall)); return schattenMatrix(v, k); })();
        x = zufallsVektor(zufall, -2, 4);
      } else { B = zufallsMatrix(zufall, -2, 2); A = zufallsMatrix(zufall, -1, 2); x = zufallsVektor(zufall, -2, 3); }
      const soll = B ? matVek(A, matVek(B, x)) : matVek(A, x);
      const gut = !vNull(x) && !vNull(soll) && nullen(A) <= 5 && !mGleich(A, EINHEIT)
        && (s !== 2 || [...A.flat(), ...x].some((q) => q.z < 0))
        && (s !== 3 || A.flat().filter((q) => !qGanz(q)).length >= 3)
        && (s !== 5 || (nullen(B) <= 5 && !vGleich(matVek(B, matVek(A, x)), soll)))
        && (s < 3 || x.filter((q) => !qNull(q)).length >= 2);
      if (gut) break;
    }
    const soll = B ? matVek(A, matVek(B, x)) : matVek(A, x);
    return { art, stufe: s, A, B, x, soll, loesung: { y1: qText(soll[0]), y2: qText(soll[1]), y3: qText(soll[2]) } };
  }
  if (art === "aufstellen") {
    let soll, geg = {};
    if (s === 1) {
      do { soll = zufallsMatrix(zufall, -3, 3); } while ([0, 1, 2].some((j) => vNull(spalte(soll, j))) || nullen(soll) > 4);
      geg = { bilder: [0, 1, 2].map((j) => spalte(soll, j)) };
    } else if (s === 2) {
      do {
        soll = [0, 1, 2].map(() => { const z = [0, 0, 0]; const anz = zufall(1, 2); for (let i = 0; i < anz; i++) z[zufall(0, 2)] = wahl([-3, -2, -1, 1, 2, 3], zufall); return z.map((c) => Q(c)); });
      } while (mGleich(soll, EINHEIT) || nullen(soll) > 6 || mGleich(soll, transponiert(soll)));
      geg = { regel: soll.map((z) => linTerm(z)) };
    } else if (s === 3) {
      do { soll = zufallsMatrix(zufall, -3, 3); } while ([0, 1, 2].some((j) => vNull(spalte(soll, j))) || nullen(soll) > 4);
      const summe = wahl([[0, 2], [1, 2], [0, 1, 2]], zufall);           // gegeben: Bild von e₁ + e₃, e₂ + e₃ oder e₁ + e₂ + e₃
      const sv = summe.reduce((acc, j) => vAdd(acc, spalte(soll, j)), V(0, 0, 0));
      geg = { bilder: [spalte(soll, 0), spalte(soll, 1)], summe, summenBild: sv };
    } else if (s === 4) {
      const g = wahl(GEOMETRISCH, zufall);
      soll = MAT(g.A);
      geg = { geo: g.id, text: g.text };
    } else {
      const basis = wahl([[[1, 1, 0], [1, -1, 0], [0, 0, 2]], [[0, 1, 1], [0, 1, -1], [2, 0, 0]], [[1, 0, 1], [-1, 0, 1], [0, 2, 0]]], zufall).map((b) => V(...b));
      let w;
      do { w = [0, 1, 2].map(() => zufallsVektor(zufall, -3, 3)); } while (w.some(vNull));
      /* Einheitsvektoren aus der Basis: lineare Kombinationen mit ½ */
      const A = ausSpalten([0, 1, 2].map((j) => {
        const e = einheitsvektor(j);
        /* Koeffizienten c mit c₀b₀ + c₁b₁ + c₂b₂ = e (Basis ist orthogonal: c_i = e·b_i / b_i·b_i) */
        return [0, 1, 2].reduce((acc, i) => vAdd(acc, vMal(qDiv(skalar(e, basis[i]), skalar(basis[i], basis[i])), w[i])), V(0, 0, 0));
      }));
      soll = A;
      geg = { basis, w };
    }
    const loesung = {};
    soll.forEach((z, i) => z.forEach((x, j) => { loesung[`a${i + 1}${j + 1}`] = qText(x); }));
    return { art, stufe: s, soll, ...geg, loesung };
  }
  if (art === "schatten") {
    let k, v, P;
    for (let versuch = 0; versuch < 300; versuch++) {
      if (s <= 3) k = 2; else if (s === 4) k = zufall(0, 1); else k = zufall(0, 2);
      v = zufallsVektor(zufall, s === 1 ? -2 : -3, s === 1 ? 2 : 3);
      const vk = s === 1 ? -1 : s === 2 ? wahl([-2, -3], zufall) : s === 4 ? wahl([-1, -2], zufall) : wahl([-2, -3, -4], zufall);
      v[k] = Q(vk);
      if (k !== 2) v[2] = Q(zufall(-2, 0));            // Licht an die Wand: kommt nicht von unten
      P = zufallsVektor(zufall, 0, 4);
      P[k] = Q(s === 2 || s === 4 ? -vk * zufall(1, 2) : zufall(1, s === 1 ? 4 : 5));
      const andere = [0, 1, 2].filter((i) => i !== k);
      const t = schattenT(P, v, k);
      const gut = andere.some((i) => !qNull(v[i]))
        && (s === 3 || s === 5 ? !qGanz(t) : qGanz(t))
        && !vGleich(schatten(P, v, k), P);
      if (gut) break;
    }
    const t = schattenT(P, v, k);
    const soll = schatten(P, v, k);
    return { art, stufe: s, k, v, P, t, soll, loesung: { x1: qText(soll[0]), x2: qText(soll[1]), x3: qText(soll[2]) } };
  }
  /* ortho */
  let n, P;
  for (let versuch = 0; versuch < 400; versuch++) {
    if (s === 1) n = V(...wahl(N2, zufall));
    else if (s === 2) n = V(...wahl(N9, zufall));
    else if (s === 3) n = V(...wahl(N3, zufall));
    else { n = zufallsVektor(zufall, -3, 3); if (n.filter((q) => !qNull(q)).length < 2) continue; }
    P = zufallsVektor(zufall, s <= 2 ? -2 : -3, s <= 2 ? 5 : 4);
    const pn = skalar(P, n), nn = skalar(n, n);
    if (qNull(pn)) continue;
    const ganz = qGanz(qDiv(pn, nn));
    if (s <= 2 ? ganz : !ganz) break;
  }
  if (qNull(skalar(P, n)) || qGanz(orthoLambda(P, n)) !== s <= 2) { n = s <= 2 ? V(1, 2, 2) : V(1, 1, 1); P = s <= 2 ? V(3, 0, 3) : V(1, 0, 0); }
  const lambda = orthoLambda(P, n);
  const soll = ortho(P, n);
  return { art, stufe: s, n, P, lambda, soll, koordinatenform: s === 5, loesung: { x1: qText(soll[0]), x2: qText(soll[1]), x3: qText(soll[2]) } };
}

/* Felder je Übung: Form der Eingabe ("spalte" = Ergebnisvektor, "matrix" = 3 × 3, "punkt" = P′( | | )) und Schlüssel */
export function felder(a) {
  if (a.art === "matvek") return { form: "spalte", keys: ["y1", "y2", "y3"] };
  if (a.art === "aufstellen") return { form: "matrix", keys: ["a11", "a12", "a13", "a21", "a22", "a23", "a31", "a32", "a33"] };
  return { form: "punkt", keys: ["x1", "x2", "x3"] };
}

/* Aufgabentext (mit $…$-Formeln) */
export function auftrag(a) {
  if (a.art === "matvek") {
    return a.B
      ? "Ein Punkt wird erst mit der Matrix $B$ abgebildet, sein Bild danach mit der Matrix $A$. Berechne das Endergebnis $A \\cdot (B \\cdot \\vec{x})$."
      : "Berechne $A \\cdot \\vec{x}$.";
  }
  if (a.art === "aufstellen") {
    const E = (j) => `\\vec{e}_${IDX[j]}`;
    if (a.stufe === 1) return `Eine lineare Abbildung bildet ${a.bilder.map((b, j) => `$${E(j)}$ auf $${vTex(b)}$`).join(", ").replace(/, ([^,]*)$/, " und $1")} ab. Stelle ihre Matrix auf.`;
    if (a.stufe === 2) return `Eine Abbildung schickt jeden Punkt $P(p_1 \\mid p_2 \\mid p_3)$ auf $P′(${a.regel.join(" \\mid ")})$. Stelle ihre Matrix auf.`;
    if (a.stufe === 3) {
      const sname = a.summe.map(E).join(" + ");
      return `Von einer linearen Abbildung kennst du die Bilder $${E(0)} \\mapsto ${vTex(a.bilder[0])}$, $${E(1)} \\mapsto ${vTex(a.bilder[1])}$ und $${sname} \\mapsto ${vTex(a.summenBild)}$. Stelle ihre Matrix auf.`;
    }
    if (a.stufe === 4) return `Stelle die Matrix für ${a.text} auf.`;
    return `Eine lineare Abbildung bildet ${a.basis.map((b, i) => `$${vTex(b)}$ auf $${vTex(a.w[i])}$`).join(", ").replace(/, ([^,]*)$/, " und $1")} ab. Stelle ihre Matrix auf.`;
  }
  if (a.art === "schatten") {
    const ebene = `$${EBENE_NAME[a.k]}$-Ebene`;
    return `Licht fällt in Richtung $\\vec{v} = ${vTex(a.v)}$. Wo liegt der Schatten des Punktes $${punktTex("P", a.P)}$ ${EBENE_ORT[a.k]}, also in der ${ebene}?`;
  }
  const ebene = a.koordinatenform
    ? `die Ebene $E: ${linTerm(a.n, "x")} = 0$`
    : `die Ebene $E$ durch den Ursprung mit dem Normalenvektor $\\vec{n} = ${vTex(a.n)}$`;
  return `Projiziere den Punkt $${punktTex("P", a.P)}$ senkrecht auf ${ebene}. Gib den Bildpunkt $P′$ exakt an.`;
}

/* Eingaben lesen: { key: text } → Werte (oder null) */
function lesen(a, eingabe) {
  const { keys } = felder(a);
  const ist = {};
  for (const k of keys) ist[k] = liesQ(eingabe[k]);
  return ist;
}
const sollVon = (a) => {
  const { keys } = felder(a);
  if (a.art === "aufstellen") return Object.fromEntries(keys.map((k) => [k, a.soll[Number(k[1]) - 1][Number(k[2]) - 1]]));
  return Object.fromEntries(keys.map((k, i) => [k, a.soll[i]]));
};

export function pruefe(a, eingabe) {
  const ist = lesen(a, eingabe);
  const soll = sollVon(a);
  const ergebnis = {};
  for (const k of Object.keys(soll)) ergebnis[k] = ist[k] !== null && qGleich(ist[k], soll[k]);
  const ok = Object.values(ergebnis).every(Boolean);
  return { ok, felder: ergebnis, grund: ok ? "" : grundFuer(a, ist, ergebnis, soll) };
}

/* gezielte Rückmeldung zum häufigsten Fehler */
function grundFuer(a, ist, erg, soll) {
  const keys = Object.keys(soll);
  if (keys.some((k) => ist[k] === null)) return "Gib jede Zahl als ganze Zahl oder als Bruch ein, zum Beispiel −3/2.";
  if (keys.some((k) => !erg[k] && Math.abs(qWert(ist[k]) - qWert(soll[k])) < 0.011 && !qGanz(soll[k])))
    return "Fast – gib das Ergebnis exakt als Bruch an (zum Beispiel 2/9 statt 0,22).";
  if (a.art === "matvek") {
    const y = [ist.y1, ist.y2, ist.y3];
    if (a.B) {
      if (vGleich(y, matVek(a.B, matVek(a.A, a.x)))) return "Die Reihenfolge ist vertauscht: Zuerst wirkt $B$ auf $\\vec{x}$, dann $A$ auf dieses Bild – also $A \\cdot (B \\cdot \\vec{x})$.";
      if (vGleich(y, matVek(a.A, a.x)) || vGleich(y, matVek(a.B, a.x))) return "Du hast nur eine der beiden Abbildungen angewendet. Rechne zuerst $\\vec{y} = B \\cdot \\vec{x}$ und danach $A \\cdot \\vec{y}$.";
      const yb = matVek(a.B, a.x);
      if (vGleich(y, matVek(transponiert(a.A), yb)) || vGleich(y, matVek(transponiert(a.A), matVek(transponiert(a.B), a.x)))) return "Spalten und Zeilen sind vertauscht: Die Komponente $x_1$ gewichtet die erste Spalte, nicht die erste Zeile.";
    }
    const M = a.A, x = a.B ? matVek(a.B, a.x) : a.x;
    if (vGleich(y, matVek(transponiert(M), x))) return "Spalten und Zeilen sind vertauscht: Die Komponente $x_1$ gewichtet die erste Spalte, nicht die erste Zeile. Anders gesagt: Komponente $i$ ist Zeile $i$ mal $\\vec{x}$.";
    if (vGleich(y, M.map((z, i) => qMul(z[i], x[i])))) return "Nicht nur die Diagonale: Jede Komponente des Ergebnisses ist eine ganze Zeile mal $\\vec{x}$, also drei Produkte addiert.";
    const i = [0, 1, 2].find((j) => !erg[`y${j + 1}`]);
    return `Die ${IDX[i]}. Komponente stimmt nicht. Sie ist Zeile ${IDX[i]} mal $\\vec{x}$: ${["erster", "zweiter", "dritter"][i]} Eintrag jeder Spalte, gewichtet mit $x_1$, $x_2$, $x_3$.`;
  }
  if (a.art === "aufstellen") {
    const A = [0, 1, 2].map((i) => [0, 1, 2].map((j) => ist[`a${i + 1}${j + 1}`]));
    if (mGleich(A, transponiert(a.soll))) return "Die Bilder der Einheitsvektoren gehören in die Spalten, nicht in die Zeilen: Spalte 1 ist das Bild von $\\vec{e}_1$.";
    if (a.stufe === 3 && vGleich(spalte(A, 2), a.summenBild)) return "Das gegebene Summenbild ist nicht das Bild von $\\vec{e}_3$. Weil die Abbildung linear ist, ziehst du die bekannten Bilder ab.";
    if (a.stufe === 5) {
      if (mGleich(A, ausSpalten(a.w))) return "Die gegebenen Vektoren sind keine Einheitsvektoren. Schreibe zuerst $\\vec{e}_1$, $\\vec{e}_2$, $\\vec{e}_3$ als Kombination von ihnen.";
      if (mGleich(A, a.soll.map((z) => z.map((x) => qMul(x, 2))))) return "Doppelt so groß: Die Summe der beiden ersten Vektoren ist $2\\vec{e}_1$ (bzw. $2\\vec{e}_2$, $2\\vec{e}_3$). Teile noch durch 2.";
    }
    if (a.stufe === 2) return "Lies die Zeilen ab: Die erste Zeile enthält die Faktoren vor $p_1$, $p_2$, $p_3$ in der ersten Koordinate von $P′$. Fehlt ein $p$, steht dort 0.";
    const j = [0, 1, 2].find((c) => [0, 1, 2].some((r) => !erg[`a${r + 1}${c + 1}`]));
    return `Spalte ${IDX[j]} stimmt nicht. Sie ist das Bild von $\\vec{e}_${IDX[j]}$ – überlege, wohin die Abbildung diesen Einheitsvektor schickt.`;
  }
  const y = [ist.x1, ist.x2, ist.x3];
  if (a.art === "schatten") {
    const k = a.k;
    const falschesT = vAdd(a.P, vMal(qNeg(a.t), a.v));
    if (vGleich(y, falschesT)) return `Vorzeichen von $t$: Aus $${qTex(a.P[k])} ${a.v[k].z < 0 ? "−" : "+"} ${qGleich(Q(Math.abs(a.v[k].z)), 1) ? "" : Math.abs(a.v[k].z)}t = 0$ folgt $t = ${qTex(a.t)}$.`;
    if (vGleich(y, vAdd(a.P, vMal(a.P[k], a.v))) || vGleich(y, vAdd(a.P, vMal(qNeg(a.P[k]), a.v)))) return `$t$ ist nicht einfach $${qTex(a.P[k])}$: Die Gleichung heißt $p_${IDX[k]} + t \\cdot v_${IDX[k]} = 0$, also $t = −\\frac{p_${IDX[k]}}{v_${IDX[k]}}$.`;
    if (!qNull(y[k])) return `Der Schattenpunkt liegt in der $${EBENE_NAME[k]}$-Ebene – seine $x_${IDX[k]}$-Koordinate muss 0 sein.`;
    const senkrecht = a.P.map((x, i) => (i === k ? Q(0) : x));
    if (vGleich(y, senkrecht)) return "So sähe der Schatten aus, wenn das Licht senkrecht auf die Ebene fiele. Hier fällt es schräg in Richtung $\\vec{v}$ – setze die Gerade $\\vec{x} = \\vec{p} + t \\cdot \\vec{v}$ an.";
    return `Rechne mit der Geraden $\\vec{x} = \\vec{p} + t \\cdot \\vec{v}$: $t = ${qTex(a.t)}$ einsetzen und komponentenweise addieren.`;
  }
  /* ortho */
  const nn = skalar(a.n, a.n), pn = skalar(a.P, a.n);
  if (vGleich(y, vSub(a.P, vMal(pn, a.n)))) return `Du hast vergessen, durch $\\vec{n} \\cdot \\vec{n} = ${qTex(nn)}$ zu teilen: $\\lambda = \\frac{\\vec{p} \\cdot \\vec{n}}{\\vec{n} \\cdot \\vec{n}}$.`;
  if (vGleich(y, vAdd(a.P, vMal(a.lambda, a.n)))) return "Minus statt Plus: Du gehst von $P$ aus gegen die Richtung des Normalenvektors zur Ebene, $P′ = P − \\lambda \\cdot \\vec{n}$.";
  const probe = skalar(y, a.n);
  if (!qNull(probe)) return `Probe: $\\vec{p′} \\cdot \\vec{n} = ${qTex(probe)}$ und nicht 0 – dein Punkt liegt also nicht in der Ebene.`;
  return "Dein Punkt liegt zwar in der Ebene, ist aber nicht der Lotfußpunkt: $P′ − P$ muss ein Vielfaches von $\\vec{n}$ sein.";
}

/* Rechenweg als TeX-Zeilen */
export function rechenweg(a) {
  if (a.art === "matvek") {
    const zeilen = [];
    const schritt = (A, x, links, name) => {
      const sp = [0, 1, 2].map((j) => spalte(A, j));
      const y = matVek(A, x);
      zeilen.push(`${links} = ${summeTex(x.map((xj, j) => [xj, vTex(sp[j])]))}`);
      const gewichtet = x.map((xj, j) => [xj, sp[j]]).filter(([xj]) => !qNull(xj));
      const ende = `${vTex(y)}${name ? ` = ${name}` : ""}`;
      if (gewichtet.length > 1) zeilen.push(`= ${gewichtet.map(([xj, s]) => vTex(vMal(xj, s))).join(" + ")} = ${ende}`);
      else if (!qGleich(gewichtet[0][0], 1)) zeilen.push(`= ${ende}`);
      else if (name) zeilen[zeilen.length - 1] += ` = ${name}`;
      return y;
    };
    if (a.B) {
      const y = schritt(a.B, a.x, `B \\cdot ${vTex(a.x)}`, "\\vec{y}");
      schritt(a.A, y, `A \\cdot ${vTex(y)}`, "");
    } else schritt(a.A, a.x, `A \\cdot ${vTex(a.x)}`, "");
    return zeilen;
  }
  if (a.art === "aufstellen") {
    const E = (j) => `\\vec{e}_${IDX[j]}`;
    const sp = [0, 1, 2].map((j) => spalte(a.soll, j));
    const z = [];
    if (a.stufe === 2) {
      [0, 1, 2].forEach((j) => z.push(`${E(j)} = ${vTex(einheitsvektor(j))} \\mapsto ${vTex(sp[j])}`));
    } else if (a.stufe === 3) {
      z.push(`${E(0)} \\mapsto ${vTex(sp[0])}, \\quad ${E(1)} \\mapsto ${vTex(sp[1])}`);
      const rest = a.summe.filter((j) => j !== 2);
      z.push(`${E(2)} = (${a.summe.map(E).join(" + ")}) − ${rest.map(E).join(" − ")}`);
      z.push(`${E(2)} \\mapsto ${vTex(a.summenBild)} − ${rest.map((j) => vTex(sp[j])).join(" − ")} = ${vTex(sp[2])}`);
    } else if (a.stufe === 5) {
      const [b0, b1, b2] = a.basis.map(vTex);
      const [w0, w1, w2] = a.w.map(vTex);
      /* die Basis ist so gewählt: b₀ + b₁ = 2e_i, b₀ − b₁ = 2e_j, b₂ = 2e_k */
      const i = [0, 1, 2].find((m) => !qNull(qAdd(a.basis[0][m], a.basis[1][m])));
      const j = [0, 1, 2].find((m) => !qNull(qSub(a.basis[0][m], a.basis[1][m])) && m !== i);
      const k = [0, 1, 2].find((m) => !qNull(a.basis[2][m]));
      /* je Einheitsvektor zwei Zeilen: zerlegen, dann abbilden */
      const drei = [
        [i, `${E(i)} = \\frac{1}{2} \\cdot (${b0} + ${b1})`, `\\mapsto \\frac{1}{2} \\cdot (${w0} + ${w1}) = ${vTex(sp[i])}`],
        [j, `${E(j)} = \\frac{1}{2} \\cdot (${b0} − ${b1})`, `\\mapsto \\frac{1}{2} \\cdot (${w0} − ${w1}) = ${vTex(sp[j])}`],
        [k, `${E(k)} = \\frac{1}{2} \\cdot ${b2}`, `\\mapsto \\frac{1}{2} \\cdot ${w2} = ${vTex(sp[k])}`],
      ];
      drei.sort((p, q) => p[0] - q[0]).forEach(([, a1, a2]) => z.push(a1, a2));
    } else {
      [0, 1, 2].forEach((j) => z.push(`${E(j)} \\mapsto ${vTex(sp[j])}`));
    }
    z.push(`\\text{Matrix: Spalte } j = \\text{Bild von } \\vec{e}_j`);
    return z;
  }
  if (a.art === "schatten") {
    const k = a.k, vk = a.v[k], pk = a.P[k];
    const betrag = Q(Math.abs(vk.z), vk.n);
    const glied = qGleich(betrag, 1) ? "t" : `${qTex(betrag)}t`;
    const tv = vMal(a.t, a.v);
    return [
      `\\vec{x} = ${vTex(a.P)} + t \\cdot ${vTex(a.v)}`,
      `x_${IDX[k]} = 0: \\quad ${qTex(pk)} ${vk.z < 0 ? "−" : "+"} ${glied} = 0 \\;\\Rightarrow\\; t = ${qTex(a.t)}`,
      `P′ = ${vTex(a.P)} + ${qGleich(a.t, 1) ? vTex(a.v) : `${qTexK(a.t)} \\cdot ${vTex(a.v)}`}`,
      ...(qGleich(a.t, 1) ? [] : [`= ${vTex(a.P)} + ${vTex(tv)}`]),
      `= ${vTex(a.soll)}, \\quad ${punktTex("P′", a.soll)}`,
    ];
  }
  /* ortho */
  const n = a.n, P = a.P, nn = skalar(n, n), pn = skalar(P, n);
  const produkt = (u, w) => u.map((x, i) => `${qTexK(x)} \\cdot ${qTexK(w[i])}`).join(" + ");
  const lam = qDiv(pn, nn);
  const betrag = Q(Math.abs(lam.z), lam.n);
  /* λ = (p · n)/(n · n): Bruch nur dann zweimal, wenn er sich kürzen lässt */
  const roh = `${pn.z < 0 ? "−" : ""}\\frac{${Math.abs(pn.z)}}{${nn.z}}`;
  const lamZeile = ggT(pn.z, nn.z) === 1 ? `\\lambda = ${roh}` : `\\lambda = ${roh} = ${qTex(lam)}`;
  const plusMinus = lam.z < 0 ? "+" : "−";
  return [
    `\\vec{p} \\cdot \\vec{n} = ${produkt(P, n)} = ${qTex(pn)}`,
    `\\vec{n} \\cdot \\vec{n} = ${n.map((x) => `${qTexK(x)}^2`).join(" + ")} = ${qTex(nn)}`,
    lamZeile,
    `P′ = ${vTex(P)} ${plusMinus} ${qGleich(betrag, 1) ? vTex(n) : `${qTex(betrag)} \\cdot ${vTex(n)}`}`,
    ...(qGleich(betrag, 1) ? [] : [`= ${vTex(P)} ${plusMinus} ${vTex(vMal(betrag, n))}`]),
    `= ${vTex(a.soll)}`,
    `\\text{Probe: } ${produkt(a.soll, n)} = 0`,
  ];
}

export function tipp(a) {
  if (a.art === "matvek") return a.B
    ? "Erst $\\vec{y} = B \\cdot \\vec{x}$ ausrechnen, dann $A \\cdot \\vec{y}$. Matrix mal Vektor: die Spalten mit den Komponenten gewichten und addieren."
    : "Matrix mal Vektor: $x_1$ mal erste Spalte plus $x_2$ mal zweite Spalte plus $x_3$ mal dritte Spalte.";
  if (a.art === "aufstellen") return "Die Spalten der Matrix sind die Bilder von $\\vec{e}_1$, $\\vec{e}_2$ und $\\vec{e}_3$ – in dieser Reihenfolge.";
  if (a.art === "schatten") return "Gerade $\\vec{x} = \\vec{p} + t \\cdot \\vec{v}$ mit der Ebene schneiden: Die Koordinate, die in der Ebene 0 ist, liefert $t$.";
  return "$P′ = P − \\lambda \\cdot \\vec{n}$ mit $\\lambda = \\frac{\\vec{p} \\cdot \\vec{n}}{\\vec{n} \\cdot \\vec{n}}$. Probe: $\\vec{p′} \\cdot \\vec{n} = 0$.";
}

/* ---------- GFS: Gliederung, Tipps, Kolloquium ---------- */
export const GLIEDERUNG = [
  { min: 2, titel: "Einstieg: ein Schatten an der Tafel", text: "Halte ein kleines Haus aus Pappe ins Licht des Beamers oder einer Taschenlampe. Der Schatten an der Wand ist flach und trotzdem erkennt jeder das Haus. Leitfrage: Wie rechnet man diesen Schatten aus – und warum genügt dafür eine Tabelle aus neun Zahlen?" },
  { min: 4, titel: "Vom Schatten zur Rechenvorschrift", text: "Lichtstrahl als Gerade durch die Hausecke, schneiden mit dem Boden, Parameter t ausrechnen. Dann allgemein für P(p₁ | p₂ | p₃): Jede Koordinate des Schattens ist eine Summe von Vielfachen von p₁, p₂, p₃. Genau das heißt linear." },
  { min: 4, titel: "Die Matrix", text: "Die Bilder der drei Einheitsvektoren als Spalten aufschreiben. Matrix mal Vektor als „Spalten gewichtet addieren“ an einem Punkt vorrechnen und mit der Rechenvorschrift vergleichen. Zeigen: Nur die dritte Spalte hängt vom Licht ab." },
  { min: 4, titel: "Senkrecht auf eine Ebene und A · A = A", text: "Lot auf eine Ebene durch den Ursprung mit Normalenvektor (−1 | 2 | 2): Formel P′ = P − λ · n, Probe mit dem Skalarprodukt, daraus die Matrix. Dann das Kennzeichen jeder Projektion: Zweimal projizieren ändert nichts, also A · A = A." },
  { min: 3, titel: "Schrägbild, Bildschirm und Fazit", text: "Das Schrägbild aus dem Heft ist selbst eine Projektion mit einer 2 × 3-Matrix. Ausblick: Bildschirme rechnen perspektivisch, dort wird durch die Tiefe geteilt – das ist nicht linear. Fazit in einem Satz: Eine lineare Abbildung ist durch die Bilder von drei Vektoren festgelegt." },
];

export const TIPPS = [
  "Bring ein echtes Objekt mit – ein Haus aus Pappe oder einen Würfel – und zeig den Schatten. Danach rechnest du genau diesen Schatten an der Tafel nach.",
  "Schreib die Spalten der Matrix in denselben drei Farben wie die Einheitsvektoren an. Dann sieht jeder sofort: Spalte 1 ist das Bild von e₁, Spalte 2 das Bild von e₂, Spalte 3 das Bild von e₃.",
  "Aufs Handout gehören die Schattenformel, die Regel „Spalten = Bilder der Einheitsvektoren“, ein durchgerechnetes Beispiel für Matrix mal Vektor und die Formel für das Lot auf eine Ebene mit Probe.",
];

export const KOLLOQUIUM = [
  { stufe: "Basis", frage: "Wie rechnet man eine Matrix mal einen Vektor?",
    antwort: "Man gewichtet die Spalten der Matrix mit den Komponenten des Vektors und addiert: x₁ mal erste Spalte plus x₂ mal zweite Spalte plus x₃ mal dritte Spalte. Gleichwertig rechnet man jede Komponente als Zeile mal Vektor, also wie ein Skalarprodukt. Beide Wege liefern dieselben drei Zahlen." },
  { stufe: "Basis", frage: "Warum sind die Spalten der Matrix die Bilder der Einheitsvektoren?",
    antwort: "Multipliziert man die Matrix mit e₁ = (1 | 0 | 0), wird die erste Spalte einmal genommen und die anderen gar nicht. Das Ergebnis ist also genau die erste Spalte. Ebenso liefert e₂ die zweite und e₃ die dritte Spalte. Deshalb stellt man eine Matrix auf, indem man die Bilder von e₁, e₂, e₃ nebeneinanderschreibt." },
  { stufe: "Basis", frage: "Wie berechnet man den Schatten eines Punktes auf dem Boden?",
    antwort: "Der Lichtstrahl durch P ist die Gerade x = p + t · v mit der Lichtrichtung v. Der Boden ist die Ebene x₃ = 0. Aus p₃ + t · v₃ = 0 folgt t = −p₃/v₃, und Einsetzen liefert den Schattenpunkt. Im Beispiel mit v = (1 | 2 | −2) und F(2 | 2 | 2) ist t = 1 und der Schatten liegt bei (3 | 4 | 0)." },
  { stufe: "Basis", frage: "Warum stehen in den ersten beiden Spalten der Schattenmatrix einfach e₁ und e₂?",
    antwort: "e₁ und e₂ liegen schon auf dem Boden. Ein Punkt auf dem Boden ist sein eigener Schatten, denn dort ist t = 0. Also bildet die Abbildung e₁ auf e₁ und e₂ auf e₂ ab. Nur die dritte Spalte – der Schatten von e₃ – hängt von der Richtung des Lichts ab." },
  { stufe: "Vertiefung", frage: "Was bedeutet „linear“, und warum ist der Schattenwurf linear?",
    antwort: "Eine Abbildung φ ist linear, wenn φ(r · x + s · y) = r · φ(x) + s · φ(y) gilt. Beim Schatten ist jede Koordinate des Bildpunkts eine Summe von Vielfachen von p₁, p₂, p₃, ohne festen Summanden – zum Beispiel p₁ + ½p₃. Solche Ausdrücke vertragen Summen und Vielfache. Deshalb reicht es, die Bilder von e₁, e₂, e₃ zu kennen." },
  { stufe: "Vertiefung", frage: "Warum gilt für jede Projektion A · A = A?",
    antwort: "Das Bild eines Punktes liegt schon in der Bildebene. Projiziert man es noch einmal, bewegt es sich nicht mehr: Beim Schatten ist dann t = 0, beim Lot ist p′ · n = 0 und damit λ = 0. Zweimal projizieren wirkt also wie einmal. Weil die Verkettung zweier Abbildungen das Matrixprodukt ist, heißt das A · A = A." },
  { stufe: "Vertiefung", frage: "Kann man aus dem Schatten das Haus zurückrechnen?",
    antwort: "Nein. Alle Punkte auf demselben Lichtstrahl haben denselben Schatten, denn die Lichtrichtung selbst wird auf den Nullvektor abgebildet: A · v = 0. Verschiedene Punkte haben also dasselbe Bild, und die Abbildung lässt sich nicht umkehren. Beim Projizieren geht eine Richtung – die Tiefe – verloren." },
  { stufe: "Vertiefung", frage: "Wie prüft man, ob der Lotfußpunkt P′ richtig ist?",
    antwort: "Zwei Proben: P′ muss in der Ebene liegen, also p′ · n = 0. Und die Verbindung von P zu P′ muss senkrecht auf der Ebene stehen, also ein Vielfaches von n sein. Im Beispiel Q(1 | 2 | 3) mit n = (−1 | 2 | 2) ist Q′ = (2 | 0 | 1), es gilt −2 + 0 + 2 = 0 und Q − Q′ = (−1 | 2 | 2) = n." },
  { stufe: "Profi", frage: "Warum muss die Bildebene durch den Ursprung gehen?",
    antwort: "Jede lineare Abbildung bildet den Nullvektor auf den Nullvektor ab, denn A · 0 = 0. Geht die Bildebene nicht durch den Ursprung, liegt das Bild von 0 nicht in 0. Dann ist die Abbildung Matrix mal Vektor plus ein fester Verschiebungsvektor – man nennt sie affin. Alternativ legt man das Koordinatensystem so, dass die Ebene durch den Ursprung geht." },
  { stufe: "Profi", frage: "Ist das Schrägbild aus dem Heft auch eine Projektion?",
    antwort: "Ja. Mit x₂ nach rechts, x₃ nach oben und einer Kästchendiagonale für eine Einheit auf der x₁-Achse wird e₁ auf (−½ | −½) abgebildet, e₂ auf (1 | 0) und e₃ auf (0 | 1). Das ist genau der Schatten auf die Rückwand x₁ = 0 bei Licht in Richtung (−2 | −1 | −1). Deshalb bleiben im Schrägbild parallele Kanten parallel." },
  { stufe: "Profi", frage: "Warum kommt ein Computerspiel nicht mit einer 3 × 3-Matrix aus?",
    antwort: "Bildschirme zeigen die Welt perspektivisch: Weit entfernte Dinge erscheinen kleiner. Bei der Zentralprojektion mit dem Auge im Ursprung und dem Bildschirm x₁ = 1 wird P auf (p₂/p₁ | p₃/p₁) abgebildet – man teilt durch die Tiefe p₁. Verdoppelt man P, bleibt der Bildpunkt gleich. Das ist nicht linear und deshalb keine Matrix mal Vektor. Grafikkarten rechnen mit einer vierten Koordinate und teilen ganz am Ende durch die Tiefe." },
];
