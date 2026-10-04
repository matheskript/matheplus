/* ======================================================================
   gleichgen.js – Aufgaben für „Gleichungen verstehen“ (fünf Modi).
   Rein, ohne React. Alle Lösungen ganzzahlig bzw. exakt (Brüche als Text).
   ====================================================================== */
import { ggT, mischen, wahl, zz, zzOhne0 } from "./rechnen2.js";

const M = (v) => String(v).replace(/-/g, "−");
export const kT = (c, v = "x") => (c === 1 ? v : c === -1 ? `−${v}` : `${M(c)}${v}`);               // Koeffizient + Variable
export const pl = (b) => (b < 0 ? `− ${-b}` : `+ ${b}`);                                              // "+ 3" / "− 3"
export const lin = (a, b) => `${kT(a)} ${pl(b)}`;
export const bruchTex = (z, n) => { if (n < 0) { z = -z; n = -n; } const g = ggT(z, n) || 1; z /= g; n /= g; return n === 1 ? M(z) : `${z < 0 ? "−" : ""}\\frac{${Math.abs(z)}}{${n}}`; };
let zaehler = 0;
const id = () => ++zaehler;

/* ---------- 1) Umformungen trainieren:  a·x + b = c·x + d ---------- */
export function neuUmformung() {
  let a, b, c, d, X;
  do { a = zz(2, 7); c = zz(1, a - 1); X = zzOhne0(-6, 6); b = zzOhne0(-9, 9); d = a * X + b - c * X; } while (d === b);
  return { id: id(), a, b, c, d, X, gl: `${lin(a, b)} = ${c === 0 ? "" : kT(c)} ${pl(d)}`, k: a - c, r: d - b };
}

/* ---------- 2) Methode wählen ---------- */
export function neueMethode() {
  const t = wahl(["lin", "aus", "wurzel", "pq", "log"]);
  if (t === "lin") { const a = zz(2, 9), X = zzOhne0(-8, 8), b = zzOhne0(-9, 9); return { id: id(), t, gl: `${lin(a, b)} = ${a * X + b}`, loesungen: [X] }; }
  if (t === "aus") { const p = zzOhne0(-9, 9); return { id: id(), t, gl: `x^{2} ${pl(p)}x = 0`, loesungen: [-p, 0].sort((u, v) => u - v) }; }
  if (t === "wurzel") { const k = zz(2, 12); return { id: id(), t, gl: `x^{2} − ${k * k} = 0`, loesungen: [-k, k] }; }
  if (t === "pq") {
    let r1, r2; do { r1 = zzOhne0(-8, 8); r2 = zzOhne0(-8, 8); } while (r1 === r2 || r1 + r2 === 0);
    return { id: id(), t, gl: `x^{2} ${pl(-(r1 + r2))}x ${pl(r1 * r2)} = 0`, loesungen: [r1, r2].sort((u, v) => u - v) };
  }
  const base = wahl([2, 3, 5]), n = zz(2, 5); return { id: id(), t: "log", gl: `${base}^{x} = ${base ** n}`, loesungen: [n] };
}
export const METHODEN = [
  ["lin", "Äquivalenzumformungen (nach x auflösen)"], ["aus", "Ausklammern, dann Satz vom Nullprodukt"],
  ["wurzel", "Wurzel ziehen (±)"], ["pq", "pq-Formel"], ["log", "Logarithmus / Exponentenvergleich"],
];

/* ---------- 3) Fehler finden ---------- */
export function neuFehler() {
  let a, b, c, d, X;
  do { a = zz(3, 7); c = zz(1, a - 1); X = zzOhne0(-6, 6); b = zzOhne0(-9, 9); d = a * X + b - c * X; } while (d === b || Math.abs(X) === 1);
  const k = a - c, r = d - b;
  const e = wahl([1, 2, 3]);                                   // Übergang mit dem Fehler (1→2, 2→3, 3→4)
  const L = [];
  L[0] = `${lin(a, b)} = ${kT(c)} ${pl(d)}`;
  const k2 = e === 1 ? a + c : k;
  L[1] = `${lin(k2, b)} = ${d}`;
  const r3 = e === 2 ? d + b : r;
  L[2] = `${kT(k2)} = ${M(r3)}`;
  L[3] = e === 3 ? `x = ${bruchTex(k2, r3)}` : `x = ${bruchTex(r3, k2)}`;
  const text = [
    "Beim Subtrahieren von cx wurde c addiert statt abgezogen: Aus ax − cx wird (a − c)x, nicht (a + c)x.",
    "Beim Umstellen wurde b falsch behandelt: Wer b auf der linken Seite abzieht, muss b auch rechts abziehen, nicht addieren.",
    "Beim Teilen durch den Koeffizienten wurden Zähler und Nenner vertauscht: x = Rechts / Koeffizient.",
  ][e - 1];
  const optionen = [["1", "Von Zeile 1 zu Zeile 2"], ["2", "Von Zeile 2 zu Zeile 3"], ["3", "Von Zeile 3 zu Zeile 4"]];
  const arten = [["add", "cx wurde addiert statt subtrahiert"], ["vz", "b wurde auf der falschen Seite mit falschem Vorzeichen umgestellt"], ["div", "Zähler und Nenner wurden vertauscht"]];
  return { id: id(), zeilen: L, e, X, text, optionen, arten, artRichtig: ["add", "vz", "div"][e - 1], a, b, c, d, korrekt: [`${kT(k)} ${pl(b)} = ${d}`.replace(/^/, ""), `${kT(k)} = ${M(r)}`, `x = ${bruchTex(r, k)}`] };
}

/* ---------- 4) Lösungsmenge verstehen ---------- */
export function neueLoesungsmenge() {
  const art = wahl(["eine", "keine", "alle"]);
  let gl, X = null;
  if (art === "eine") { let a, c, b, d; do { a = zz(2, 6); c = zz(1, a - 1); X = zzOhne0(-7, 7); b = zzOhne0(-8, 8); d = a * X + b - c * X; } while (false); gl = `${lin(a, b)} = ${kT(c)} ${pl(d)}`; }
  else if (art === "keine") { const a = zz(2, 6), b = zzOhne0(-8, 8); let d; do { d = zzOhne0(-8, 8); } while (d === b); gl = `${lin(a, b)} = ${kT(a)} ${pl(d)}`; }
  else { const a = zz(2, 5), k = zzOhne0(-5, 5); gl = `${a}(x ${pl(k)}) = ${kT(a)} ${pl(a * k)}`; }
  let p, q, D;
  do { p = zzOhne0(-6, 6); q = zz(-8, 9); D = p * p - 4 * q; } while (false);
  const anzahl = D > 0 ? 2 : D === 0 ? 1 : 0;
  return { id: id(), art, gl, X, quad: `x^{2} ${pl(p)}x ${pl(q)} = 0`, p, q, D, anzahl };
}

/* ---------- 5) Geometrisch deuten: f(x) = g(x) ---------- */
export function neuGeometrisch() {
  const m = zzOhne0(-2, 2), n = zz(-3, 3), s = wahl([1, -1]);
  const art = wahl(["zwei", "zwei", "eine", "keine"]);
  let p = zz(-3, 2), q = p + zz(1, 3), r = 0;
  if (art === "eine") q = p;
  if (art === "keine") { r = zz(1, 3); q = p; }
  /* f(x) − g(x) = s·(x − p)(x − q)  bzw. s·((x − p)² + r) */
  const dquad = art === "keine" ? [p * p + r, -2 * p, 1] : [p * q, -(p + q), 1];     // Koeffizienten (x⁰, x¹, x²)
  const f = (x) => m * x + n + s * (dquad[0] + dquad[1] * x + dquad[2] * x * x);
  const g = (x) => m * x + n;
  const anzahl = art === "zwei" ? 2 : art === "eine" ? 1 : 0;
  return { id: id(), art, anzahl, f, g, m, n, s, p, q, r, loes: art === "zwei" ? [Math.min(p, q), Math.max(p, q)] : art === "eine" ? [p] : [] };
}
export { mischen };
