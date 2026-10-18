/* ======================================================================
   diffKern.js – reine Bausteine für die Aufgaben-Generatoren des Kurses
   Differentialrechnung (diffAufgaben.js). Kein React.
   · Zufall (mit Startwert für Tests), ganze Zahlen, Auswahl
   · Zahlen und Brüche als TeX (Mini-TeX der App: \frac, ^, \sqrt …)
   · Terme: jedes Stück trägt drei Fassungen – tex (Anzeige), ein (Eingabe-
     schreibweise, die der Parser aus formelEngine.js versteht) und js
     (Auswertung). So prüfen die Tests, dass Anzeige und Rechnung zusammenpassen.
   · Prüfen von Schülereingaben: Term (wertgleich an Stichproben), Liste
   Alle Ausgaben halten Regel A5 ein: kein 1x, kein x^1, kein + −, kein + 0.
   ====================================================================== */
import { q, qAdd, qSub, qMul, qDiv, qNeg, qNum } from "./rechnen2.js";
import { parse, kompiliere } from "./formelEngine.js";

export { q, qAdd, qSub, qMul, qDiv, qNeg, qNum };

/* ---------- Zufall ---------- */
export function zufall(seed) {
  if (seed == null) return Math.random;
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const ganz = (r, lo, hi, ohne = []) => {
  for (let i = 0; i < 200; i++) {
    const v = lo + Math.floor(r() * (hi - lo + 1));
    if (!ohne.includes(v)) return v;
  }
  return lo;
};
export const eins = (r, liste) => liste[Math.floor(r() * liste.length)];
export const vz = (r) => (r() < 0.5 ? -1 : 1);
export const mische = (r, liste) => {
  const a = [...liste];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

/* ---------- Zahlen ---------- */
export const MINUS = "−";
const istQ = (a) => a && typeof a === "object" && "z" in a;
export const Q = (a, n) => (istQ(a) ? a : n !== undefined ? q(a, n) : alsQ(a));
/* Dezimalzahl (bis 6 Stellen) → Bruch */
export function alsQ(v) {
  if (Number.isInteger(v)) return q(v);
  // kleinster Nenner bis 1000, der die Zahl (bis auf Rundungsrauschen) trifft: 0,3333… → 1/3
  for (let n = 2; n <= 1000; n++) { const z = Math.round(v * n); if (Math.abs(z / n - v) < 1e-9 * Math.max(1, Math.abs(v))) return q(z, n); }
  return q(Math.round(v * 1e6), 1e6);
}
/* Zahl als TeX. dez: Dezimalschreibweise mit Komma (0{,}5) statt Bruch, wenn sie endlich ist */
export function zT(a, { dez = false } = {}) {
  const b = Q(a);
  if (b.n === 1) return (b.z < 0 ? MINUS : "") + Math.abs(b.z);
  if (dez && endlichDez(b)) return dezT(qNum(b));
  return `${b.z < 0 ? MINUS : ""}\\frac{${Math.abs(b.z)}}{${b.n}}`;
}
export const endlichDez = (b) => { let n = b.n; while (n % 2 === 0) n /= 2; while (n % 5 === 0) n /= 5; return n === 1; };
/* Dezimalzahl als TeX: 2{,}5 – gerundet auf st Stellen, ohne überflüssige Nullen */
export function dezT(v, st = 6) {
  const r = Math.round(v * 10 ** st) / 10 ** st;
  const s = String(Object.is(r, -0) ? 0 : Math.abs(r)).replace(".", "{,}");
  return (r < 0 ? MINUS : "") + s;
}
/* Zahl als Eingabe-Text für den Parser */
export const zE = (a) => { const b = Q(a); return b.n === 1 ? `(${b.z})` : `(${b.z}/${b.n})`; };
/* Zahl als Text im Fließtext (ohne $): 2,5 bzw. −3 */
export const zTxt = (v, st = 4) => {
  const r = Math.round(v * 10 ** st) / 10 ** st;
  return (r < 0 ? MINUS : "") + String(Math.abs(r)).replace(".", ",");
};

/* ---------- Terme ----------
   Ein Term ist { tex, ein, js, art } – art: "summe" (braucht Klammern als Faktor), "prod", "atom".
   Bausteine: Zahl, x-Potenz, Summen mit Vorzeichen, Produkte, Brüche, Funktionen. */
const T = (tex, ein, js, art = "atom") => ({ tex, ein, js, art });
export const zahlT = (a, o) => { const b = Q(a); const v = qNum(b); return T(zT(b, o), zE(b), () => v, b.z < 0 || b.n !== 1 ? "zahl-" + (b.z < 0 ? "neg" : "bruch") : "atom"); };
export const varT = (v = "x") => T(v, "x", (x) => x);
/* x^n (n ganz ≥ 0 oder Bruch) */
export function potT(n, v = "x") {
  const e = Q(n);
  if (e.z === 0) return zahlT(1);
  if (e.z === e.n) return varT(v);
  const ex = qNum(e);
  return T(`${v}^{${zT(e)}}`, `x^${zE(e)}`, (x) => Math.pow(x, ex));
}
/* Monom c·x^n (c Bruch/Zahl, n ganz) */
export function monomT(c, n, v = "x", o) {
  const k = Q(c);
  if (k.z === 0) return zahlT(0);
  if (n === 0) return zahlT(k, o);
  const p = potT(n, v);
  const cv = qNum(k);
  if (k.z === k.n) return p;
  if (k.z === -k.n) return T(`${MINUS}${p.tex}`, `-${p.ein}`, (x) => -p.js(x), "prod");
  return T(`${zT(k, o)}${p.tex}`, `${zE(k)}*${p.ein}`, (x) => cv * p.js(x), "prod");
}
/* Polynom aus [[c, n], …] – Glieder mit c = 0 fallen weg, sortiert nach Hochzahl */
export function polyT(glieder, v = "x", o) {
  const g = glieder.map(([c, n]) => [Q(c), n]).filter(([c]) => c.z !== 0).sort((a, b) => b[1] - a[1]);
  if (!g.length) return zahlT(0);
  return summeT(g.map(([c, n]) => [c.z < 0 ? -1 : 1, monomT(c.z < 0 ? qNeg(c) : c, n, v, o)]));
}
/* Summe aus [vorzeichen (+1/−1), Term] – der erste Summand trägt sein Vorzeichen vorn */
export function summeT(teile) {
  const t = teile.filter(([, a]) => !(a.tex === "0"));
  if (!t.length) return zahlT(0);
  let tex = "", ein = "";
  t.forEach(([s, a], i) => {
    let at = a.tex, ae = a.ein, sg = s;
    // ein negativer Summand („−3x“) wird zum Minuszeichen davor
    if (at.startsWith(MINUS) && a.art !== "summe") { at = at.slice(1); ae = `-(${ae})`; sg = -sg; }
    else if (a.art === "summe" && i > 0 && sg < 0) { at = `(${at})`; }
    if (i === 0) { tex += (sg < 0 ? MINUS : "") + (sg < 0 && a.art === "summe" ? `(${a.tex})` : at); ein += sg < 0 ? `-(${ae})` : `(${ae})`; }
    else { tex += ` ${sg < 0 ? MINUS : "+"} ${at}`; ein += `${sg < 0 ? "-" : "+"}(${ae})`; }
  });
  const fs = t.map(([s, a]) => [s, a.js]);
  return T(tex, ein, (x) => fs.reduce((acc, [s, f]) => acc + s * f(x), 0), t.length > 1 ? "summe" : t[0][1].art);
}
export const plusT = (...ts) => summeT(ts.map((a) => [1, a]));
/* Klammer, wenn nötig */
export const klT = (a) => (a.art === "summe" || a.art === "zahl-neg" ? T(`(${a.tex})`, `(${a.ein})`, a.js, "atom") : a);
export const klammerT = (a) => T(`(${a.tex})`, `(${a.ein})`, a.js, "atom");
/* Produkt: Zahlfaktor vorn ohne Malpunkt („3x“, „2(x + 1)“), sonst Malpunkt nur, wo nötig */
export function malT(...fs) {
  let faktoren = fs.filter((f) => f.tex !== "1");
  if (faktoren.some((f) => f.tex === "0")) return zahlT(0);
  if (!faktoren.length) return zahlT(1);
  if (faktoren.length === 1) return faktoren[0];
  let neg = false;
  faktoren = faktoren.map((f, i) => {
    if (i === 0 && f.tex === `${MINUS}1`) { neg = true; return null; }
    return f;
  }).filter(Boolean);
  let tex = "", ein = "";
  faktoren.forEach((f, i) => {
    const g = i === 0 && f.art !== "summe" ? f : klT(f);
    const punkt = i > 0 && (/^[\d−]/.test(g.tex) || /^\\frac/.test(g.tex));
    const fuge = i === 0 ? "" : punkt ? " \\cdot " : /^\\(sin|cos|tan|ln)/.test(g.tex) ? "\\," : "";
    tex += fuge + g.tex;
    ein += (i > 0 ? "*" : "") + `(${f.ein})`;
  });
  const js = faktoren.map((f) => f.js);
  return T((neg ? MINUS : "") + tex, (neg ? "-" : "") + ein, (x) => (neg ? -1 : 1) * js.reduce((p, f) => p * f(x), 1), neg ? "prod" : "prod");
}
export function bruchT(z, n) {
  return T(`\\frac{${z.tex}}{${n.tex}}`, `(${z.ein})/(${n.ein})`, (x) => z.js(x) / n.js(x), "prod");
}
/* negativer Bruch: −\frac{…}{…} */
export const negT = (a) => (a.tex.startsWith(MINUS) ? T(a.tex.slice(1), `-(${a.ein})`, (x) => -a.js(x), a.art) : T(`${MINUS}${a.art === "summe" ? `(${a.tex})` : a.tex}`, `-(${a.ein})`, (x) => -a.js(x), "prod"));
/* (innen)^n */
export function hochT(innen, n) {
  const e = Q(n);
  if (e.z === e.n) return innen;
  const ex = qNum(e);
  const basis = innen.art === "atom" && !/[ +−]/.test(innen.tex) && !/^\\/.test(innen.tex) ? innen.tex : `(${innen.tex})`;
  return T(`${basis}^{${zT(e)}}`, `(${innen.ein})^${zE(e)}`, (x) => Math.pow(innen.js(x), ex), "atom");
}
export const wurzelT = (innen) => T(`\\sqrt{${innen.tex}}`, `sqrt(${innen.ein})`, (x) => Math.sqrt(innen.js(x)));
const FN = { sin: Math.sin, cos: Math.cos, ln: Math.log, tan: Math.tan };
export function fnT(name, innen) {
  const f = FN[name];
  const nackt = innen.tex === "x";
  const arg = nackt ? " x" : `(${innen.tex})`;
  return T(`\\${name}${arg}`, `${name}(${innen.ein})`, (x) => f(innen.js(x)));
}
export function expT(innen) {
  const roh = innen.tex === "x" ? "x" : innen.tex;
  return T(`e^{${roh}}`, `e^(${innen.ein})`, (x) => Math.exp(innen.js(x)));
}
/* lineare Funktion a x + b als Term */
export const linT = (a, b, v = "x") => polyT([[a, 1], [b, 0]], v);

/* Gerade y = m x + b als TeX-Zeile */
export const geradeTex = (m, b, links = "y") => `${links} = ${linT(m, b).tex}`;

/* ---------- Eingaben prüfen ---------- */
/* Variablenbuchstabe (t, h, r …) auf x abbilden – nur als einzelner Buchstabe, nicht in sqrt, ln … */
export function aufX(text, v = "x") {
  let s = String(text ?? "").replace(/[−–]/g, "-").replace(/·|×/g, "*").replace(/π/g, "pi").replace(/√/g, "sqrt");
  // links stehende Bezeichnung weglassen: „y =“, „f'(x) =“, „t(x) =“
  s = s.replace(/^\s*[a-zA-Z]\s*'{0,3}\s*(\([a-z]\))?\s*=\s*/, "");
  if (v !== "x") s = s.replace(new RegExp(`(?<![a-zA-Z])${v}(?![a-zA-Z])`, "g"), "x");
  return s;
}
export function termAus(text, v = "x") {
  const baum = parse(aufX(text, v));
  return baum ? kompiliere(baum) : null;
}
/* Stichproben im Bereich [lo, hi], ohne die Stellen, an denen die Sollfunktion nicht existiert */
function stellen(soll, lo, hi, ohne = []) {
  const s = [];
  for (let i = 0; s.length < 9 && i < 60; i++) {
    const x = lo + ((hi - lo) * (i * 0.6180339887 % 1));
    if (ohne.some((o) => Math.abs(o - x) < 1e-3)) continue;
    const y = soll(x);
    if (isFinite(y) && Math.abs(y) < 1e7) s.push([x, y]);
  }
  return s;
}
export const gleichAn = (f, punkte, rel = 1e-6) => punkte.every(([x, y]) => { const w = f(x); return isFinite(w) && Math.abs(w - y) <= rel * Math.max(1, Math.abs(y)); });
/* Ergebnis: { wert: 0 } richtig, { wert: 2 + i } = typischer Fehler i, { wert: 1 } falsch, { warn } nicht lesbar */
export function pruefeTerm(eingabe, st) {
  const f = termAus(eingabe, st.var || "x");
  if (!f) return { warn: "Den Term kann ich nicht lesen. Schreibe z. B. 3x^2 - 2x + 1, (2x+1)^3, sqrt(x), e^(2x), sin(x), ln(x) oder 1/(x+1)." };
  const [lo, hi] = st.bereich || [-3, 3];
  const pkt = stellen(st.soll.js, lo, hi, st.ohne);
  if (gleichAn(f, pkt)) return { wert: 0 };
  const i = (st.fehler || []).findIndex((fe) => fe.js && gleichAn(f, stellen(fe.js, lo, hi, st.ohne).filter(([x]) => isFinite(st.soll.js(x)))));
  return { wert: i >= 0 ? 2 + i : 1 };
}
/* Liste von Zahlen/Termen (π, Wurzeln, Brüche) mit „;“ getrennt */
export function liesListe(text) {
  const teile = String(text ?? "").split(/;|\bund\b|\boder\b/).map((s) => s.trim()).filter(Boolean);
  const werte = [];
  for (const t of teile) {
    const f = termAus(t.replace(/^[a-z]\s*[₀-₉\d]*\s*=\s*/i, ""));
    const v = f ? f(0) : NaN;
    if (!isFinite(v)) return null;
    werte.push(v);
  }
  return werte;
}
export function pruefeListe(eingabe, st) {
  const w = liesListe(eingabe);
  if (!w || !w.length) return { warn: "Bitte die Werte mit Semikolon trennen, z. B. -2; 2 oder pi/3; 2pi/3." };
  const soll = [...st.werte].sort((a, b) => a - b), ist = [...w].sort((a, b) => a - b);
  if (ist.length !== soll.length) return { warn: soll.length === 1 ? "Gesucht ist genau ein Wert." : `Es gibt genau ${soll.length} Werte.` };
  const tol = st.tol ?? 1e-6;
  return { wert: soll.every((s, i) => Math.abs(s - ist[i]) <= tol * Math.max(1, Math.abs(s))) ? 0 : 1 };
}

/* ---------- Schritte (werden in funcDiffKursUeben.jsx zu Schritt-Karten) ---------- */
export const zahlS = (id, titel, frage, text, wert, o = {}) => ({ art: "zahl", id, titel, frage, text, wert: Q(wert) && qNum(Q(wert)), ...o });
export const zahlR = (id, titel, frage, text, wert, o = {}) => ({ art: "zahl", id, titel, frage, text, wert, ...o });
export const wahlS = (id, titel, frage, optionen, richtig, o = {}) => ({ art: "wahl", id, titel, frage, optionen, richtig, ...o });
export const termS = (id, titel, frage, text, soll, o = {}) => ({ art: "term", id, titel, frage, text, soll, ...o });
export const listeS = (id, titel, frage, text, werte, o = {}) => ({ art: "liste", id, titel, frage, text, werte, ...o });

/* freie Konstante wie π oder e als Term */
export const konstT = (tex, ein, wert) => T(tex, ein, () => wert);
/* Stammfunktion prüfen: Die Ableitung der Eingabe (numerisch) muss soll.js sein */
export function pruefeStamm(eingabe, st) {
  const F = termAus(eingabe, st.var || "x");
  if (!F) return { warn: "Den Term kann ich nicht lesen. Schreibe z. B. 3x^2 + 2x." };
  const [lo, hi] = st.bereich || [-3, 3];
  const h = 1e-4;
  for (let i = 0; i < 9; i++) {
    const x = lo + ((hi - lo) * ((i * 0.6180339887) % 1));
    const d = (F(x + h) - F(x - h)) / (2 * h), s = st.soll.js(x);
    if (!isFinite(d) || Math.abs(d - s) > 1e-4 * Math.max(1, Math.abs(s))) return { wert: 1 };
  }
  return { wert: 0 };
}
export const stammS = (id, titel, frage, text, soll, o = {}) => ({ art: "stamm", id, titel, frage, text, soll, ...o });
