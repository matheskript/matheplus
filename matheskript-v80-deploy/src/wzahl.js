/* ======================================================================
   wzahl.js – exakte Zahlen mit Wurzeln (kein React, nur rechnen2.js).
   Eine Zahl ist eine Summe  q₁·√w₁ + q₂·√w₂ + …  mit rationalen q und quadratfreien w ≥ 1
   (w = 1 ist der rationale Anteil). Beispiele: 3/2, √5, −2√3/5, 1 − √2/2.
   · Rechnen: Summe, Differenz, Produkt, Division durch einen Einzelterm (Nenner: c·√w)
   · Lesen:   Brüche, Kommazahlen, Wurzeln – „1/2“, „0,5“, „√5“, „−√7“, „2√3/5“, „sqrt(5)“, Summen davon
   · Ausgabe: TeX für die Formelanzeige, Klartext für Eingabefelder, Zahlenwert
   Keine base-Datei darf diese Datei importieren.
   ====================================================================== */
import { ggT, q, qAbs, qAdd, qDiv, qGleich, qLies, qMul, qNeg, qNull, qNum, qTex, qText } from "./rechnen2.js";

/* n = s²·w mit quadratfreiem w */
function quadratfrei(n) {
  let s = 1, w = n;
  for (let p = 2; p * p <= w; p++) while (w % (p * p) === 0) { w /= p * p; s *= p; }
  return [s, w];
}

/* c·√n als Zahl (n ≥ 0 ganz) */
export function wTerm(c, n = 1) {
  if (n === 0 || qNull(c)) return [];
  const [s, w] = quadratfrei(n);
  return [{ w, c: qMul(c, q(s)) }];
}
export const wZ = (qv) => wTerm(typeof qv === "number" ? q(qv) : qv, 1);       // rationale Zahl
export const wWurzel = (n, c = q(1)) => wTerm(c, n);
export const wNull = [];
export const wEins = wZ(1);

function normal(terme) {
  const m = new Map();
  for (const t of terme) m.set(t.w, m.has(t.w) ? qAdd(m.get(t.w), t.c) : t.c);
  return [...m.entries()].filter(([, c]) => !qNull(c)).map(([w, c]) => ({ w, c })).sort((a, b) => a.w - b.w);
}

export const wAdd = (a, b) => normal([...a, ...b]);
export const wNeg = (a) => a.map((t) => ({ w: t.w, c: qNeg(t.c) }));
export const wSub = (a, b) => wAdd(a, wNeg(b));
export function wMul(a, b) {
  const r = [];
  for (const x of a) for (const y of b) r.push(...wTerm(qMul(x.c, y.c), x.w * y.w));
  return normal(r);
}
/* a / b – nur wenn b ein einzelner Term c·√w ≠ 0 ist, sonst null */
export function wDiv(a, b) {
  if (b.length !== 1) return null;
  const { c, w } = b[0];
  return wMul(a, wTerm(qDiv(q(1), qMul(c, q(w))), w));              // 1/(c·√w) = √w / (c·w)
}

export const wIstNull = (a) => a.length === 0;
export const wEinTerm = (a) => a.length === 1;
export const wIstRational = (a) => a.every((t) => t.w === 1);
export const wRational = (a) => (a.find((t) => t.w === 1) || { c: q(0) }).c;
export const wGanz = (a) => wIstRational(a) && wRational(a).n === 1;
export const wGleich = (a, b) => a.length === b.length && a.every((t, i) => t.w === b[i].w && qGleich(t.c, b[i].c));
export const wNum = (a) => a.reduce((s, t) => s + qNum(t.c) * Math.sqrt(t.w), 0);
export const wNegativ = (a) => wNum(a) < 0;
export const wBetrag = (a) => (wNegativ(a) ? wNeg(a) : a);
export const wIstEins = (a) => wGleich(a, wEins);
export const wIstMinusEins = (a) => wGleich(a, wZ(-1));

/* ---------- Ausgabe ---------- */
const teilTex = (t) => {
  const m = qAbs(t.c);
  if (t.w === 1) return qTex(m);
  const wz = `\\sqrt{${t.w}}`;
  if (m.n === 1) return m.z === 1 ? wz : `${m.z}${wz}`;
  return `\\frac{${m.z === 1 ? "" : m.z}${wz}}{${m.n}}`;
};
const teilText = (t) => {
  const m = qAbs(t.c);
  if (t.w === 1) return qText(m);
  const wz = `√${t.w}`;
  if (m.n === 1) return m.z === 1 ? wz : `${m.z}${wz}`;
  return `${m.z === 1 ? "" : m.z}${wz}/${m.n}`;
};
const geordnet = (a) => [...a].sort((x, y) => x.w - y.w);

/* [{ neg, text }] – ein Eintrag je Term (Betrag als TeX), rationaler Anteil zuerst */
export const wTeile = (a) => geordnet(a).map((t) => ({ neg: qNum(t.c) < 0, text: teilTex(t) }));
export function wTex(a) {
  const T = wTeile(a);
  if (!T.length) return "0";
  return T.map((t, i) => (i === 0 ? (t.neg ? "−" : "") + t.text : ` ${t.neg ? "−" : "+"} ${t.text}`)).join("");
}
/* zum Anhängen an einen Ausdruck: " + 3 − \sqrt{2}" (leer bei 0) */
export const wAnh = (a) => wTeile(a).map((t) => ` ${t.neg ? "−" : "+"} ${t.text}`).join("");
/* Betrag eines Einzelterms als TeX (für „x − 3“-Formen) */
export const wBetragTex = (a) => (a.length ? wTeile(wBetrag(a)).map((t) => t.text).join(" + ") : "0");
/* in Klammern, wenn negativ oder mehrteilig */
export const wTexKl = (a) => (a.length === 0 ? "0" : a.length === 1 && !wNegativ(a) ? wTex(a) : `\\left(${wTex(a)}\\right)`);
export function wText(a) {
  const T = geordnet(a);
  if (!T.length) return "0";
  return T.map((t, i) => {
    const neg = qNum(t.c) < 0, s = teilText(t);
    return i === 0 ? (neg ? "−" : "") + s : ` ${neg ? "−" : "+"} ${s}`;
  }).join("");
}

/* ---------- Lesen ---------- */
export const WZ_MAX_RADIKAND = 10000;

function einTerm(tok) {
  const m = tok.match(/^([+-]?)(\d+(?:\.\d+)?)?√(\d+)(?:\/(\d+))?$/);
  if (!m) { const r = qLies(tok.replace(/^\+/, "")); return r ? wZ(r) : null; }
  const n = +m[3];
  if (n > WZ_MAX_RADIKAND) return null;
  let c = m[2] ? qLies(m[2]) : q(1);
  if (!c) return null;
  if (m[4] !== undefined) { if (!+m[4]) return null; c = qDiv(c, q(+m[4])); }
  if (m[1] === "-") c = qNeg(c);
  return wTerm(c, n);
}

/* Eingabe → Zahl (oder null, wenn nicht lesbar) */
export function wLies(s) {
  let t = String(s ?? "").trim().toLowerCase();
  if (!t) return null;
  t = t.replace(/[−–—]/g, "-").replace(/\s+/g, "").replace(/,/g, ".").replace(/wurzel|sqrt|√/g, "√").replace(/[·*]/g, "")
    .replace(/√\((\d+)\)/g, "√$1");
  if (!t || /[^0-9.+\-/√]/.test(t)) return null;
  const toks = t.split(/(?=[+-])/).filter((x) => x !== "");
  if (!toks.length) return null;
  let summe = [];
  for (const tok of toks) {
    const z = einTerm(tok);
    if (!z) return null;
    summe = wAdd(summe, z);
  }
  return summe;
}
