/* ======================================================================
   parabelW.js – Parabel f(x) = ax² + bx + c mit exakten Wurzelzahlen (wzahl.js).
   Voraussetzung: a ist ein einzelner Term ≠ 0 (Division durch a), b und der Scheitel-x ebenfalls Einzelterme.
   Reine Mathematik, kein React. Keine base-Datei darf diese Datei importieren.
   ====================================================================== */
import {
  wAdd, wAnh, wBetragTex, wDiv, wEinTerm, wIstEins, wIstMinusEins, wIstNull, wMul, wNeg, wNegativ, wNum, wSub, wTex, wZ,
} from "./wzahl.js";

const zwei = wZ(2), vier = wZ(4);

/* Normalform → Scheitel (d = xₛ, e = yₛ) und Diskriminante */
export function parabelW(a, b, c) {
  const d = wNeg(wDiv(b, wMul(zwei, a)));                                   // −b / (2a)
  const e = wSub(c, wDiv(wMul(b, b), wMul(vier, a)));                       // c − b² / (4a)
  const D = wSub(wMul(b, b), wMul(vier, wMul(a, c)));                       // b² − 4ac
  return { a, b, c, d, e, D };
}

/* Scheitelform a(x − d)² + e → Normalform */
export function ausScheitelW(a, d, e) {
  const b = wNeg(wMul(zwei, wMul(a, d)));
  const c = wAdd(wMul(a, wMul(d, d)), e);
  const D = wSub(wMul(b, b), wMul(vier, wMul(a, c)));
  return { a, b, c, d, e, D };
}

export const fW = (p) => {
  const A = wNum(p.a), B = wNum(p.b), Cc = wNum(p.c);
  return (x) => A * x * x + B * x + Cc;
};

/* ---------- TeX ---------- */
/* Koeffizient vor x: Betrag, bei 1 weggelassen */
const koefTex = (k, hatX) => (hatX && wIstEins(wNegativ(k) ? wNeg(k) : k) ? "" : wBetragTex(k));
const vorz = (k) => (wNegativ(k) ? "−" : "+");

/* a·x² + b·x + c */
export function normalTexW(p) {
  const teile = [];
  const einzel = (k, pot) => {
    if (wIstNull(k)) return;
    const mehr = !wEinTerm(k);                                              // mehrteilig: in Klammern
    const kern = mehr ? `\\left(${wTex(k)}\\right)` : koefTex(k, true);
    teile.push([mehr ? "+" : vorz(k), `${kern}${pot}`]);
  };
  einzel(p.a, "x^2"); einzel(p.b, "x");
  let s = teile.map(([v, t], i) => (i === 0 ? (v === "−" ? "−" : "") + t : ` ${v} ${t}`)).join("");
  if (!wIstNull(p.c)) s += s ? wAnh(p.c) : wTex(p.c);
  return s || "0";
}

/* a(x − d)² + e */
export function scheitelTexW(a, d, e) {
  const klammer = wIstNull(d) ? "x" : wEinTerm(d) ? `x ${wNegativ(d) ? "+" : "−"} ${wBetragTex(d)}` : `x − \\left(${wTex(d)}\\right)`;
  const quad = wIstNull(d) ? "x^2" : `(${klammer})^2`;
  const vorA = wIstEins(a) ? "" : wIstMinusEins(a) ? "−" : wEinTerm(a) ? wTex(a) : `\\left(${wTex(a)}\\right)`;
  return `${vorA}${quad}${wAnh(e)}`;
}

/* Vorfaktor vor einer Klammer: 1 → nichts, −1 → „−“ */
export const vorfaktorTex = (a) => (wIstEins(a) ? "" : wIstMinusEins(a) ? "−" : wEinTerm(a) ? wTex(a) : `\\left(${wTex(a)}\\right)`);
