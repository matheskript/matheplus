/* ======================================================================
   vekKern.js – reine Bausteine für die Aufgaben-Generatoren des Kurses
   „Vektoren, Geraden und Ebenen“ (vekAufgaben*.js). Kein React.
   · Vektoren als Arrays von Brüchen (q aus rechnen2.js) oder ganzen Zahlen
   · Anzeige als Mini-TeX der App: Spaltenvektor \spalte{a}{b}{c} (3D) bzw.
     \binom{a}{b} (2D), Punkte A(1 \mid 2 \mid 3), Wurzeln vereinfacht (3\sqrt{2})
   · Rechnen: Summe, Vielfaches, Skalarprodukt, Kreuzprodukt, Betrag,
     Kollinearität, Gauß-Verfahren mit Brüchen
   · Schritte: vektorS (Eingabe „1; −2; 3“), zahlS, wahlS, termS aus diffKern
   Regel A5: kein 1·v, kein + −, kein + 0, kein 0·v in Anzeigen.
   ====================================================================== */
import { q, qAdd, qSub, qMul, qDiv, qNeg, qNum, qGleich, qNull, ggT } from "./rechnen2.js";
import { zufall, ganz, eins, vz, mische, MINUS, Q, zT, dezT, zTxt, zahlS, zahlR, wahlS, termS, listeS } from "./diffKern.js";

export { q, qAdd, qSub, qMul, qDiv, qNeg, qNum, qGleich, qNull, ggT, zufall, ganz, eins, vz, mische, MINUS, Q, zT, dezT, zTxt, zahlS, zahlR, wahlS, termS, listeS };

export const $ = (t) => `$${t}$`;

/* ---------- Vektoren ---------- */
export const vek = (...k) => k.map((x) => Q(x));
/* Zufälliger ganzzahliger Vektor; ohneNull: kein Nullvektor; keineNull: kein Eintrag 0 */
export function zufVek(r, lo = -5, hi = 5, { dim = 3, ohneNull = true, keineNull = false } = {}) {
  for (let i = 0; i < 200; i++) {
    const v = Array.from({ length: dim }, () => q(ganz(r, lo, hi, keineNull ? [0] : [])));
    if (!ohneNull || v.some((x) => !qNull(x))) return v;
  }
  return Array.from({ length: dim }, (_, i) => q(i === 0 ? 1 : 0));
}
export const vAdd = (a, b) => a.map((x, i) => qAdd(x, b[i]));
export const vSub = (a, b) => a.map((x, i) => qSub(x, b[i]));
export const vSkal = (k, a) => a.map((x) => qMul(Q(k), x));
export const vNeg = (a) => a.map(qNeg);
export const vDot = (a, b) => a.reduce((s, x, i) => qAdd(s, qMul(x, b[i])), q(0));
export const vCross = (a, b) => [
  qSub(qMul(a[1], b[2]), qMul(a[2], b[1])),
  qSub(qMul(a[2], b[0]), qMul(a[0], b[2])),
  qSub(qMul(a[0], b[1]), qMul(a[1], b[0])),
];
export const vNull = (a) => a.every(qNull);
export const vGleich = (a, b) => a.length === b.length && a.every((x, i) => qGleich(x, b[i]));
export const vNum = (a) => a.map(qNum);
/* Betrag² als Bruch */
export const vBetrag2 = (a) => vDot(a, a);
/* Mittelpunkt zweier Punkte */
export const mittelpunkt = (A, B) => vSkal(q(1, 2), vAdd(A, B));
/* Vektor von A nach B */
export const nach = (A, B) => vSub(B, A);
/* Kollinear: b = k·a? Liefert k (Bruch) oder null */
export function kollinearFaktor(a, b) {
  if (vNull(a)) return vNull(b) ? q(1) : null;
  let k = null;
  for (let i = 0; i < a.length; i++) {
    if (qNull(a[i])) { if (!qNull(b[i])) return null; continue; }
    const kk = qDiv(b[i], a[i]);
    if (k === null) k = kk; else if (!qGleich(k, kk)) return null;
  }
  return k;
}
/* Ganzzahliger Vektor auf teilerfremde Einträge kürzen (für Normalenvektoren) */
export function vKuerzen(a) {
  const n = a.map((x) => Q(x));
  const nenner = n.reduce((m, x) => (m * x.n) / ggT(m, x.n), 1);
  let g = n.map((x) => Math.abs((x.z * nenner) / x.n));
  const t = g.reduce((m, x) => ggT(m, x), 0) || 1;
  const out = n.map((x) => q((x.z * nenner) / x.n / t));
  // erster Eintrag ≠ 0 positiv
  const erst = out.find((x) => !qNull(x));
  return erst && erst.z < 0 ? vNeg(out) : out;
}

/* ---------- Anzeige ---------- */
/* Spaltenvektor in Mini-TeX. Brüche bleiben Brüche; dez: Dezimalschreibweise */
export function vT(a, o) {
  const e = a.map((x) => zT(x, o));
  if (e.length === 2) return `\\binom{${e[0]}}{${e[1]}}`;
  return `\\spalte{${e[0]}}{${e[1]}}{${e[2]}}`;
}
/* Punkt: A(1 \mid −2 \mid 3) */
export const pT = (P, name = "P", o) => `${name}(${P.map((x) => zT(x, o)).join(" \\mid ")})`;
/* Zahl in Klammern, wenn negativ oder Bruch (zum Einsetzen) */
export const kz = (a, o) => { const b = Q(a); return b.z < 0 || b.n !== 1 ? `(${zT(b, o)})` : zT(b, o); };
/* Produkt k · (…): 1·x → x, −1·x → −x, 0 … bleibt „0“ */
export function malT(k, tex) {
  const b = Q(k);
  if (b.z === 0) return "0";
  if (b.z === b.n) return tex;
  if (b.z === -b.n) return `${MINUS}${tex}`;
  return `${zT(b)} \\cdot ${tex}`;
}
/* Summe aus [koeffizient, tex]-Paaren ohne + − und ohne 0-Glieder: „2a − b + 3c“ */
export function summeT(teile) {
  let out = "";
  for (const [k, tex] of teile) {
    const b = Q(k);
    if (b.z === 0) continue;
    const neg = b.z < 0;
    const abs = q(Math.abs(b.z), b.n);
    const glied = abs.z === abs.n && abs.n === 1 ? tex : `${zT(abs)}${/^[a-z\\(]/.test(tex) ? "" : " \\cdot "}${tex}`;
    if (!out) out = (neg ? MINUS : "") + glied;
    else out += ` ${neg ? MINUS : "+"} ${glied}`;
  }
  return out || "0";
}
/* Linearkombination von Vektoren: r·a + s·b (als \spalte) */
export const linKombT = (paare) => summeT(paare.map(([k, v]) => [k, vT(v)]));
/* Gerade als Parameterform: g: \vec{x} = \spalte… + t · \spalte… */
export function geradeT(stuetz, richtung, { name = "g", param = "t" } = {}) {
  return `${name}: \\vec{x} = ${vT(stuetz)} + ${param} \\cdot ${vT(richtung)}`;
}
/* Ebene in Parameterform */
export function ebeneParamT(stuetz, u, v, { name = "E", p1 = "r", p2 = "s" } = {}) {
  return `${name}: \\vec{x} = ${vT(stuetz)} + ${p1} \\cdot ${vT(u)} + ${p2} \\cdot ${vT(v)}`;
}
/* Ebene in Normalenform: E: [\vec{x} − \spalte…] · \spalte… = 0 */
export function ebeneNormalT(stuetz, n, { name = "E" } = {}) {
  return `${name}: \\left[\\vec{x} ${MINUS} ${vT(stuetz)}\\right] \\cdot ${vT(n)} = 0`;
}
/* Koordinatenform: E: 2x_1 − x_2 + 3x_3 = 5 (n·x = d) */
export function koordT(n, d, { name = "E", var: v = "x" } = {}) {
  const links = summeT(n.map((k, i) => [k, `${v}_${i + 1}`]));
  return `${name ? `${name}: ` : ""}${links} = ${zT(d)}`;
}
/* Lineare Gleichung a·x + b·y = c in x, y */
export const linGlT = (a, b, c) => `${summeT([[a, "x"], [b, "y"]])} = ${zT(c)}`;
/* Gleichungssystem als Zeilen (Mini-TeX kann keine Matrizen: eine Zeile je Gleichung, mit Römisch I, II, III) */
export const ROEM = ["I", "II", "III", "IV"];
export function lgsZeilen(A, b, vars = ["x_1", "x_2", "x_3"]) {
  return A.map((zeile, i) => `$\\text{${ROEM[i]}}\\quad ${summeT(zeile.map((k, j) => [k, vars[j]]))} = ${zT(b[i])}$`);
}

/* Wurzel aus einer ganzen Zahl vereinfacht: 18 → 3\sqrt{2}, 16 → 4, 0 → 0 */
export function wurzelT(n) {
  const m = Q(n);
  if (m.n !== 1) return `\\sqrt{${zT(m)}}`;
  const w = m.z;
  if (w < 0) return "\\sqrt{" + w + "}";
  let a = 1, b = w;
  for (let p = 2; p * p <= b; p++) while (b % (p * p) === 0) { a *= p; b /= p * p; }
  if (b === 1) return String(a);
  if (a === 1) return `\\sqrt{${b}}`;
  return `${a}\\sqrt{${b}}`;
}
/* Betrag eines Vektors als TeX (vereinfachte Wurzel) und als Zahl */
export const betragT = (a) => wurzelT(vBetrag2(a));
export const betragNum = (a) => Math.sqrt(qNum(vBetrag2(a)));
/* Betragsrechnung ausgeschrieben: \sqrt{1^2 + (−2)^2 + 3^2} = \sqrt{14} */
export function betragWegT(a) {
  const quadrate = a.map((x) => `${kz(x)}^2`).join(" + ");
  const s = vBetrag2(a);
  const links = `\\sqrt{${quadrate}}`;
  const mitte = `\\sqrt{${zT(s)}}`;
  const rechts = wurzelT(s);
  return rechts === mitte ? `${links} = ${mitte}` : `${links} = ${mitte} = ${rechts}`;
}
/* Skalarprodukt ausgeschrieben: 1 · 2 + (−3) · 4 + 0 · 1 = −10 */
export function skalarWegT(a, b) {
  const t = a.map((x, i) => `${kz(x)} \\cdot ${kz(b[i])}`).join(" + ");
  return `${t} = ${zT(vDot(a, b))}`;
}
/* Kreuzprodukt ausgeschrieben (die drei Zeilen der Formel) */
export function kreuzWegT(a, b) {
  const [a1, a2, a3] = a, [b1, b2, b3] = b;
  const z = (p, pp, m, mm) => `${kz(p)} \\cdot ${kz(pp)} ${MINUS} ${kz(m)} \\cdot ${kz(mm)}`;
  return `\\spalte{${z(a2, b3, a3, b2)}}{${z(a3, b1, a1, b3)}}{${z(a1, b2, a2, b1)}} = ${vT(vCross(a, b))}`;
}
/* Winkel in Grad (gerundet) aus cos */
export const gradAus = (cosWert, st = 1) => Math.round(Math.acos(Math.max(-1, Math.min(1, cosWert))) * 180 / Math.PI * 10 ** st) / 10 ** st;
/* Grad als Text mit Komma: 54,7° */
export const gradT = (g) => `${dezT(g)}^\\circ`;

/* ---------- Gauß-Verfahren mit Brüchen ----------
   gauss(A, b) → { art: "eine" | "keine" | "unendlich", x?: [Bruch…], rang, schritte: [TeX-Zeilen] }
   A: Zeilen aus Zahlen/Brüchen, b: rechte Seite. Schritte zeigen die Umformungen. */
export function gauss(Ain, bin, vars = ["x_1", "x_2", "x_3"]) {
  const A = Ain.map((z) => z.map((x) => Q(x)));
  const b = bin.map((x) => Q(x));
  const n = A.length, m = A[0].length;
  const schritte = [];
  const zeile = (i) => `${summeT(A[i].map((k, j) => [k, vars[j]]))} = ${zT(b[i])}`;
  let rang = 0;
  const pivotSpalten = [];
  for (let s = 0; s < m && rang < n; s++) {
    let p = -1;
    for (let i = rang; i < n; i++) if (!qNull(A[i][s])) { p = i; break; }
    if (p < 0) continue;
    if (p !== rang) { [A[p], A[rang]] = [A[rang], A[p]]; [b[p], b[rang]] = [b[rang], b[p]]; schritte.push(`Zeilen ${ROEM[p]} und ${ROEM[rang]} tauschen.`); }
    for (let i = rang + 1; i < n; i++) {
      if (qNull(A[i][s])) continue;
      const f = qDiv(A[i][s], A[rang][s]);   // = p/q gekürzt
      const pz = f.z, qn = f.n;
      // Schulweg ohne Brüche: Zeile i ← q · Zeile i − p · Zeile rang
      A[i] = A[i].map((x, j) => qSub(qMul(q(qn), x), qMul(q(pz), A[rang][j])));
      b[i] = qSub(qMul(q(qn), b[i]), qMul(q(pz), b[rang]));
      const mal = (k, name) => (k === 1 ? `\\text{${name}}` : `${k} \\cdot \\text{${name}}`);
      schritte.push(`$${mal(qn, ROEM[i])} ${pz < 0 ? "+" : MINUS} ${mal(Math.abs(pz), ROEM[rang])}: ${zeile(i)}$`);
    }
    pivotSpalten.push(s);
    rang++;
  }
  // Widerspruch?
  for (let i = rang; i < n; i++) if (!qNull(b[i])) return { art: "keine", rang, schritte, A, b };
  if (rang < m) return { art: "unendlich", rang, schritte, A, b, pivotSpalten };
  // Rückwärts einsetzen
  const x = Array(m).fill(q(0));
  for (let i = m - 1; i >= 0; i--) {
    let s = b[i];
    for (let j = i + 1; j < m; j++) s = qSub(s, qMul(A[i][j], x[j]));
    x[i] = qDiv(s, A[i][i]);
  }
  return { art: "eine", rang, schritte, x, A, b };
}

/* ---------- Schritte ---------- */
/* Vektor eingeben: „1; −2; 3“ (Liste) */
export const vektorS = (id, titel, frage, text, v, o = {}) => listeS(id, titel, frage, text, v.map((x) => qNum(Q(x))), { ...o, vektor: true });
/* Punkt eingeben (wie Vektor) */
export const punktS = (id, titel, frage, text, P, o = {}) => listeS(id, titel, frage, text, P.map((x) => qNum(Q(x))), { ...o, punkt: true });

/* ---------- Zufällige Objekte mit „schönen“ Zahlen ---------- */
/* Zwei nicht kollineare ganzzahlige Vektoren */
export function zweiRichtungen(r, lo = -4, hi = 4) {
  for (let i = 0; i < 100; i++) {
    const u = zufVek(r, lo, hi), v = zufVek(r, lo, hi);
    if (kollinearFaktor(u, v) === null) return [u, v];
  }
  return [vek(1, 0, 0), vek(0, 1, 0)];
}
/* Ebene mit kleinem, gekürztem Normalenvektor aus zwei Richtungen */
export function ebeneAusRichtungen(r, lo = -3, hi = 3) {
  for (let i = 0; i < 200; i++) {
    const [u, v] = zweiRichtungen(r, lo, hi);
    const n = vKuerzen(vCross(u, v));
    if (n.every((x) => Math.abs(x.z) <= 9)) return { u, v, n };
  }
  return { u: vek(1, 0, 0), v: vek(0, 1, 0), n: vek(0, 0, 1) };
}
/* Normalenvektor mit ganzzahligem Betrag (für HNF): Vielfache von (1,2,2), (2,3,6), (1,4,8), (2,6,9), (3,4,0) … */
export const GANZE_BETRAEGE = [[1, 2, 2], [2, 3, 6], [1, 4, 8], [2, 6, 9], [3, 4, 0], [4, 4, 7], [6, 6, 7], [0, 0, 1], [0, 1, 0], [1, 0, 0]];
export function normaleGanzBetrag(r) {
  const basis = eins(r, GANZE_BETRAEGE);
  const v = basis.map((x) => q(x * vz(r)));
  return mische(r, v);
}
