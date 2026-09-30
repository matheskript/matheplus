/* ============================================================
   Advanced Plotter — Variante des Polynomplotters für beliebige
   Funktionen: Verkettungen aus Polynomen, sin, cos, tan, ln, log,
   log zur Basis a, e^x, a^x, Wurzel, Brüchen und Potenzen.

   Aufbau dieser Datei:
   1. Formel-Engine: Tokenizer, Parser, Auswertung, symbolisches
      Ableiten mit Vereinfachung, Ausgabe als TeX (App) und Klartext (PDF)
   2. Numerische Analyse (Definitionsbereich, Nullstellen, Pole,
      Extrem- und Wendepunkte, Grenzverhalten, Integrale)
   3. Kurvendiskussion als Abschnitte (gleiches Format wie beim Polynom-PDF)
   4. Oberfläche: Tastenfeld (6 Spalten), Plot, Anzeige, PDF-Knopf

   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useMemo, useState } from "react";
import { C } from "./base1.jsx";
import { PLATZ } from "./base2.jsx";
import { schoenerSchritt, tiefZiffer, zahl } from "./func2.jsx";
import { M } from "./func3.jsx";

/* ---------- 1. Formel-Engine ---------- */

const FUNKTIONEN = ["sqrt", "sin", "cos", "tan", "ln", "log"];

export function tokenisiere(s) {
  const t = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (ch === PLATZ) { t.push({ k: "box" }); i++; continue; }
    if (/\s/.test(ch)) { i++; continue; }
    if (/[0-9.,]/.test(ch)) {
      let j = i;
      while (j < s.length && /[0-9.,]/.test(s[j])) j++;
      const roh = s.slice(i, j).replace(",", ".");
      if (!/^\d*\.?\d+$|^\d+\.$/.test(roh)) return null;
      t.push({ k: "num", v: parseFloat(roh), roh: s.slice(i, j).replace(".", ",") });
      i = j; continue;
    }
    if (/[a-zA-Zπ]/.test(ch)) {
      const rest = s.slice(i).toLowerCase();
      const fn = FUNKTIONEN.find((n) => rest.startsWith(n));
      if (fn) { t.push({ k: "fn", n: fn }); i += fn.length; continue; }
      if (rest.startsWith("pi")) { t.push({ k: "pi" }); i += 2; continue; }
      if (ch === "π") { t.push({ k: "pi" }); i++; continue; }
      if (ch === "x" || ch === "X") { t.push({ k: "x" }); i++; continue; }
      if (ch === "e") { t.push({ k: "e" }); i++; continue; }
      return null;
    }
    if ("+-−*·×/:^()[]".includes(ch)) {
      const map = { "−": "-", "·": "*", "×": "*", ":": "/" };
      t.push({ k: map[ch] || ch }); i++; continue;
    }
    return null;
  }
  return t;
}

/* Parser mit üblichen Vorrangregeln; implizites Mal (2x, 3sin(x), (x+1)(x-1)).
   Ergebnis: Baum mit Knoten {k: num|x|e|pi|box|+|-|*|/|^|neg|fn|log|par}. */
export function parse(text) {
  const t = tokenisiere(text || "");
  if (!t || !t.length) return null;
  let p = 0;
  const schau = () => t[p];
  const nimm = (k) => (t[p] && t[p].k === k ? (p++, true) : false);

  function summe() {
    let n = produkt(); if (!n) return null;
    while (schau() && (schau().k === "+" || schau().k === "-")) {
      const op = schau().k; p++;
      const r = produkt(); if (!r) return null;
      n = { k: op, a: n, b: r };
    }
    return n;
  }
  function produkt() {
    let n = vorz(); if (!n) return null;
    for (;;) {
      const s = schau();
      if (s && (s.k === "*" || s.k === "/")) {
        p++;
        const r = vorz(); if (!r) return null;
        n = { k: s.k, a: n, b: r };
      } else if (s && ["num", "x", "e", "pi", "box", "fn", "("].includes(s.k)) {
        const r = potenz(); if (!r) return null;
        n = { k: "*", a: n, b: r, still: true };
      } else return n;
    }
  }
  function vorz() {
    if (nimm("-")) { const n = vorz(); return n ? { k: "neg", a: n } : null; }
    if (nimm("+")) return vorz();
    return potenz();
  }
  function potenz() {
    const b = atom(); if (!b) return null;
    if (nimm("^")) { const e = vorz(); return e ? { k: "^", a: b, b: e } : null; }
    return b;
  }
  function atom() {
    const s = schau(); if (!s) return null;
    if (s.k === "num") { p++; return { k: "num", v: s.v }; }
    if (s.k === "x" || s.k === "e" || s.k === "pi" || s.k === "box") { p++; return { k: s.k }; }
    if (s.k === "(") { p++; const n = summe(); if (!n || !nimm(")")) return null; return { k: "par", a: n }; }
    if (s.k === "fn") {
      p++;
      let basis = null;
      if (s.n === "log" && nimm("[")) { basis = summe(); if (!basis || !nimm("]")) return null; }
      // Argument: in Klammern, oder ein einzelnes Atom (sin x)
      let arg;
      if (nimm("(")) { arg = summe(); if (!arg || !nimm(")")) return null; }
      else { arg = potenz(); if (!arg) return null; }
      if (s.n === "log") return { k: "log", b: basis || { k: "num", v: 10 }, a: arg, zehn: !basis };
      return { k: "fn", n: s.n, a: arg };
    }
    return null;
  }
  const n = summe();
  return n && p === t.length ? n : null;
}

export const hatBox = (n) => !!n && (n.k === "box" || ["a", "b"].some((s) => n[s] && hatBox(n[s])));
const hatX = (n) => !!n && (n.k === "x" || ["a", "b"].some((s) => n[s] && hatX(n[s])));
export const ohnePar = (n) => {
  if (!n) return n;
  if (n.k === "par") return ohnePar(n.a);
  const m = { ...n };
  if (n.a) m.a = ohnePar(n.a);
  if (n.b) m.b = ohnePar(n.b);
  return m;
};

/* Auswertung als schnelle JS-Funktion. */
export function kompiliere(n) {
  switch (n.k) {
    case "num": { const v = n.v; return () => v; }
    case "x": return (x) => x;
    case "e": return () => Math.E;
    case "pi": return () => Math.PI;
    case "par": return kompiliere(n.a);
    case "neg": { const a = kompiliere(n.a); return (x) => -a(x); }
    case "+": { const a = kompiliere(n.a), b = kompiliere(n.b); return (x) => a(x) + b(x); }
    case "-": { const a = kompiliere(n.a), b = kompiliere(n.b); return (x) => a(x) - b(x); }
    case "*": { const a = kompiliere(n.a), b = kompiliere(n.b); return (x) => a(x) * b(x); }
    case "/": {
      const a = kompiliere(n.a), b = kompiliere(n.b);
      return (x) => { const q = b(x); return q === 0 ? NaN : a(x) / q; };
    }
    case "^": {
      const a = kompiliere(n.a), b = kompiliere(n.b);
      return (x) => {
        const u = a(x), v = b(x);
        if (u === 0 && v < 0) return NaN;
        if (u < 0 && !Number.isInteger(v)) {
          // ungerade Wurzeln negativer Zahlen (z. B. x^(1/3)) zulassen
          const inv = 1 / v, ni = Math.round(inv);
          if (Math.abs(inv - ni) < 1e-12 && ni % 2 !== 0) return -Math.pow(-u, v);
          return NaN;
        }
        return Math.pow(u, v);
      };
    }
    case "fn": {
      const a = kompiliere(n.a);
      switch (n.n) {
        case "sin": return (x) => Math.sin(a(x));
        case "cos": return (x) => Math.cos(a(x));
        case "tan": return (x) => { const u = a(x); return Math.abs(Math.cos(u)) < 1e-13 ? NaN : Math.tan(u); };
        case "ln": return (x) => { const u = a(x); return u > 0 ? Math.log(u) : NaN; };
        case "sqrt": return (x) => { const u = a(x); return u >= 0 ? Math.sqrt(u) : NaN; };
        default: return () => NaN;
      }
    }
    case "log": {
      const a = kompiliere(n.a), b = kompiliere(n.b);
      return (x) => {
        const u = a(x), g = b(x);
        return u > 0 && g > 0 && g !== 1 ? Math.log(u) / Math.log(g) : NaN;
      };
    }
    default: return () => NaN;
  }
}

/* --- Symbolisches Ableiten mit Vereinfachung --- */

const num = (v) => ({ k: "num", v });
const add = (a, b) => ({ k: "+", a, b });
const sub = (a, b) => ({ k: "-", a, b });
const mul = (a, b) => ({ k: "*", a, b });
const div = (a, b) => ({ k: "/", a, b });
const pow = (a, b) => ({ k: "^", a, b });
const neg = (a) => ({ k: "neg", a });
const fn = (n, a) => ({ k: "fn", n, a });
const istNum = (n, v) => n.k === "num" && (v === undefined || Math.abs(n.v - v) < 1e-12);
const gleich = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function ableiten(n) {
  switch (n.k) {
    case "num": case "e": case "pi": return num(0);
    case "x": return num(1);
    case "par": return ableiten(n.a);
    case "neg": return neg(ableiten(n.a));
    case "+": return add(ableiten(n.a), ableiten(n.b));
    case "-": return sub(ableiten(n.a), ableiten(n.b));
    case "*": return add(mul(ableiten(n.a), n.b), mul(n.a, ableiten(n.b)));
    case "/":
      if (!hatX(n.b)) return div(ableiten(n.a), n.b);
      return div(sub(mul(ableiten(n.a), n.b), mul(n.a, ableiten(n.b))), pow(n.b, num(2)));
    case "^": {
      const u = n.a, v = n.b;
      if (!hatX(v)) return mul(mul(v, pow(u, sub(v, num(1)))), ableiten(u));
      if (!hatX(u)) {
        const lnU = u.k === "e" ? num(1) : fn("ln", u);
        return mul(mul(n, lnU), ableiten(v));
      }
      return mul(n, add(mul(ableiten(v), fn("ln", u)), div(mul(v, ableiten(u)), u)));
    }
    case "fn": {
      const u = n.a, du = ableiten(u);
      switch (n.n) {
        case "sin": return mul(fn("cos", u), du);
        case "cos": return neg(mul(fn("sin", u), du));
        case "tan": return div(du, pow(fn("cos", u), num(2)));
        case "ln": return div(du, u);
        case "sqrt": return div(du, mul(num(2), fn("sqrt", u)));
        default: return num(0);
      }
    }
    case "log": {
      const lnB = n.b.k === "e" ? num(1) : fn("ln", n.b);
      return div(ableiten(n.a), mul(n.a, lnB));
    }
    default: return num(0);
  }
}

/* Koeffizient und Rest eines Terms: 3x² → [3, x²], −sin(x) → [−1, sin(x)]. */
function koef(n) {
  if (n.k === "num") return [n.v, null];
  if (n.k === "neg") { const [c, r] = koef(n.a); return [-c, r]; }
  if (n.k === "*" && n.a.k === "num") return [n.a.v, n.b];
  return [1, n];
}
const baue = (c, r) => (r === null ? num(c) : c === 1 ? r : c === -1 ? neg(r) : c < 0 ? neg(mul(num(-c), r)) : mul(num(c), r));
const ggT = (a, b) => (b ? ggT(b, a % b) : Math.abs(a));
const schoenZahl = (v) => Math.round(v * 1e10) / 1e10;

/* Produkt als Koeffizient mal Potenzen gleicher Basen: 2·x·4·x³ → 8x⁴. */
function produktNormal(n) {
  let c = 1;
  const fak = [];
  const lauf = (m) => {
    if (m.k === "*") { lauf(m.a); lauf(m.b); }
    else if (m.k === "neg") { c = -c; lauf(m.a); }
    else if (m.k === "num") c *= m.v;
    else if (m.k === "^" && m.b.k === "num") fak.push([m.a, m.b.v]);
    else fak.push([m, 1]);
  };
  lauf(n);
  if (c === 0) return num(0);
  const gruppen = [];
  fak.forEach(([b, e]) => {
    const key = JSON.stringify(b);
    const g = gruppen.find((x) => x.key === key);
    if (g) g.e = schoenZahl(g.e + e); else gruppen.push({ key, b, e });
  });
  const teile = gruppen.filter((g) => g.e !== 0).map((g) => (g.e === 1 ? g.b : pow(g.b, num(g.e))));
  if (!teile.length) return num(schoenZahl(c));
  const rumpf = teile.reduce((a, b) => mul(a, b));
  return baue(schoenZahl(c), rumpf);
}

/* Summe mit zusammengefassten gleichartigen Gliedern: 2x⁴ − 8x⁴ → −6x⁴. */
function summeNormal(n) {
  const glieder = [];
  const lauf = (m, s) => {
    if (m.k === "+") { lauf(m.a, s); lauf(m.b, s); }
    else if (m.k === "-") { lauf(m.a, s); lauf(m.b, -s); }
    else if (m.k === "neg") lauf(m.a, -s);
    else { const [c, r] = koef(m); glieder.push([s * c, r]); }
  };
  lauf(n, 1);
  const gruppen = [];
  glieder.forEach(([c, r]) => {
    const key = JSON.stringify(r);
    const g = gruppen.find((x) => x.key === key);
    if (g) g.c = schoenZahl(g.c + c); else gruppen.push({ key, r, c });
  });
  const kons = gruppen.filter((g) => g.r === null);
  const rest = gruppen.filter((g) => g.r !== null && g.c !== 0);
  const liste = [...rest, ...kons.filter((g) => g.c !== 0)];
  if (!liste.length) return num(0);
  let erg = baue(liste[0].c, liste[0].r);
  liste.slice(1).forEach((g) => { erg = g.c < 0 ? sub(erg, baue(-g.c, g.r)) : add(erg, baue(g.c, g.r)); });
  return erg;
}

/* Rein konstante Teilterme aus Zahlen ausrechnen, als Bruch mit kleinem Nenner. */
function nurZahlen(n) {
  if (!n) return false;
  if (n.k === "num") return true;
  if (["+", "-", "*", "/", "^", "neg", "par"].includes(n.k)) return nurZahlen(n.a) && (n.b === undefined || nurZahlen(n.b));
  return false;
}
function alsBruch(v) {
  for (let d = 1; d <= 60; d++) {
    const z = Math.round(v * d);
    if (Math.abs(v * d - z) < 1e-9) return d === 1 ? num(z) : z < 0 ? neg(div(num(-z), num(d))) : div(num(z), num(d));
  }
  return null;
}

function vereinfache1(n) {
  if (!n || !n.k) return n;
  const m = { ...n };
  if (n.a) m.a = vereinfache1(n.a);
  if (n.b) m.b = vereinfache1(n.b);
  const { a, b } = m;
  // Konstanten zusammenrechnen (z. B. 1/3 − 1 → −2/3)
  if (["+", "-", "*", "/", "^", "neg"].includes(m.k) && nurZahlen(m)) {
    const v = kompiliere(m)(0);
    if (isFinite(v)) {
      const br = alsBruch(v);
      if (br && !gleich(br, m)) return br;
    }
  }
  if (m.k === "*") {
    const pn = produktNormal(m);
    if (!gleich(pn, m)) return pn;
  }
  if (m.k === "+" || m.k === "-") {
    const sn = summeNormal(m);
    if (!gleich(sn, m) && JSON.stringify(sn).length <= JSON.stringify(m).length) return sn;
  }
  switch (m.k) {
    case "par": return a;
    case "neg":
      if (a.k === "num") return num(-a.v);
      if (a.k === "neg") return a.a;
      return m;
    case "+":
      if (istNum(a, 0)) return b;
      if (istNum(b, 0)) return a;
      if (a.k === "num" && b.k === "num") return num(a.v + b.v);
      if (b.k === "neg") return sub(a, b.a);
      if (b.k === "num" && b.v < 0) return sub(a, num(-b.v));
      if (b.k === "*" && b.a.k === "num" && b.a.v < 0) return sub(a, istNum(b.a, -1) ? b.b : mul(num(-b.a.v), b.b));
      if (gleich(a, b)) return mul(num(2), a);
      return m;
    case "-":
      if (istNum(b, 0)) return a;
      if (istNum(a, 0)) return neg(b);
      if (a.k === "num" && b.k === "num") return num(a.v - b.v);
      if (b.k === "neg") return add(a, b.a);
      if (b.k === "num" && b.v < 0) return add(a, num(-b.v));
      if (gleich(a, b)) return num(0);
      return m;
    case "*":
      if (istNum(a, 0) || istNum(b, 0)) return num(0);
      if (istNum(a, 1)) return b;
      if (istNum(b, 1)) return a;
      if (istNum(a, -1)) return neg(b);
      if (istNum(b, -1)) return neg(a);
      if (a.k === "num" && b.k === "num") return num(a.v * b.v);
      if (b.k === "num") return mul(b, a);                        // Zahl nach vorn
      if (a.k === "num" && b.k === "*" && b.a.k === "num") return mul(num(a.v * b.a.v), b.b);
      if (a.k === "*" && a.a.k === "num" && b.k !== "num") return mul(a.a, mul(a.b, b));
      if (a.k === "neg") return neg(mul(a.a, b));
      if (b.k === "neg") return neg(mul(a, b.a));
      if (b.k === "/") return div(mul(a, b.a), b.b);
      if (a.k === "/") return div(mul(a.a, b), a.b);
      if (gleich(a, b)) return pow(a, num(2));
      if (b.k === "^" && gleich(a, b.a) && b.b.k === "num") return pow(a, num(b.b.v + 1));
      if (a.k === "^" && gleich(a.a, b) && a.b.k === "num") return pow(b, num(a.b.v + 1));
      if (a.k === "^" && b.k === "^" && gleich(a.a, b.a) && a.b.k === "num" && b.b.k === "num") return pow(a.a, num(a.b.v + b.b.v));
      return m;
    case "/": {
      if (istNum(a, 0)) return num(0);
      // gemeinsame Zahlfaktoren kürzen, Vorzeichen in den Zähler
      const [ca, ra] = koef(a), [cb, rb] = koef(b);
      if (Number.isInteger(ca) && Number.isInteger(cb) && cb !== 0 && (ra !== null || rb !== null)) {
        const g = ggT(Math.abs(ca), Math.abs(cb)) * (cb < 0 ? -1 : 1);
        if (g !== 1) {
          const z = baue(ca / g, ra), nn = baue(cb / g, rb);
          if (gleich(nn, num(1))) return z;
          return z.k === "num" && z.v < 0 ? neg(div(num(-z.v), nn)) : div(z, nn);
        }
      }
      // gleiche Basen kürzen: x^a / x^b
      if (ra && rb) {
        const be = (t) => (t.k === "^" && t.b.k === "num" ? [t.a, t.b.v] : [t, 1]);
        const [ba, ea] = be(ra), [bb, eb] = be(rb);
        if (gleich(ba, bb)) {
          const d = schoenZahl(ea - eb);
          const oben = d > 0 ? (d === 1 ? ba : pow(ba, num(d))) : null;
          const unten = d < 0 ? (d === -1 ? ba : pow(ba, num(-d))) : null;
          const z = oben ? baue(ca, oben) : num(ca);
          const nn = unten ? baue(cb, unten) : num(cb);
          return gleich(nn, num(1)) ? z : div(z, nn);
        }
        // Faktor im Zähler kürzen: (p·q)/q
        if (ra.k === "*" && gleich(ra.b, rb)) return div(baue(ca, ra.a), num(cb));
        if (ra.k === "*" && gleich(ra.a, rb)) return div(baue(ca, ra.b), num(cb));
      }
      if (istNum(b, 1)) return a;
      if (gleich(a, b)) return num(1);
      if (a.k === "num" && b.k === "num" && Number.isInteger(a.v / b.v)) return num(a.v / b.v);
      if (a.k === "neg") return neg(div(a.a, b));
      if (b.k === "num" && b.v < 0) return neg(div(a, num(-b.v)));
      if (a.k === "*" && a.a.k === "num" && b.k === "num" && Number.isInteger(a.a.v / b.v)) return mul(num(a.a.v / b.v), a.b);
      if (a.k === "/" ) return div(a.a, mul(a.b, b));
      if (b.k === "/") return div(mul(a, b.b), b.a);
      return m;
    }
    case "^":
      if (istNum(b, 0)) return num(1);
      if (istNum(b, 1)) return a;
      if (istNum(a, 1)) return num(1);
      if (a.k === "num" && b.k === "num" && Number.isInteger(b.v) && b.v > 0 && Math.abs(a.v ** b.v) < 1e9) return num(a.v ** b.v);
      if (a.k === "^" && a.b.k === "num" && b.k === "num") return pow(a.a, num(a.b.v * b.v));
      return m;
    case "fn":
      if (m.n === "ln" && a.k === "e") return num(1);
      if (m.n === "ln" && istNum(a, 1)) return num(0);
      return m;
    default:
      return m;
  }
}

export function vereinfache(n) {
  let akt = n;
  for (let i = 0; i < 12; i++) {
    const neu = vereinfache1(akt);
    if (gleich(neu, akt)) break;
    akt = neu;
  }
  return akt;
}

export const ableitung = (n) => vereinfache(ableiten(ohnePar(n)));

/* --- Ausgabe --- */

const RANG = { "+": 1, "-": 1, neg: 2, "*": 2, "/": 3, "^": 4 };
const rang = (n) => (n.k in RANG ? RANG[n.k] : 5);

function zahlTex(v) {
  if (Number.isInteger(v)) return String(v);
  const r = Math.round(v * 1e6) / 1e6;
  return String(r).replace(".", "{,}");
}

/* Zahl als Text; Vielfache von π werden erkannt (für trigonometrische Stellen). */
export function wert(v, tex = false) {
  if (!isFinite(v)) return v > 0 ? "∞" : "−∞";
  if (Math.abs(v) < 1e-9) return "0";
  const g = Math.round(v);
  if (Math.abs(v - g) < 1e-7) return String(g).replace("-", "−");
  for (const nenner of [1, 2, 3, 4, 6]) {
    const z = (v * nenner) / Math.PI, zr = Math.round(z);
    if (zr !== 0 && Math.abs(z - zr) < 1e-7 && Math.abs(zr) <= 24) {
      const vz = zr < 0 ? "−" : "", za = Math.abs(zr);
      const oben = `${za === 1 ? "" : za}π`;
      if (nenner === 1) return `${vz}${oben}`;
      return tex ? `${vz}\\frac{${oben}}{${nenner}}` : `${vz}${oben}/${nenner}`;
    }
  }
  return zahl(v).replace("-", "−");
}

export function alsTex(n, aussen = 0, rechts = false) {
  if (!n) return "";
  const klam = (s, r) => (r < aussen || (rechts && r === aussen && aussen <= 2) ? `(${s})` : s);
  switch (n.k) {
    case "num": return n.v < 0 ? klam(`-${zahlTex(-n.v)}`, 2) : zahlTex(n.v);
    case "x": return "x";
    case "e": return "e";
    case "pi": return "π";
    case "box": return "▯";
    case "par": return `(${alsTex(n.a, 0)})`;
    case "neg": return klam(`-${alsTex(n.a, 2)}`, 2);
    case "+": return klam(`${alsTex(n.a, 1)} + ${alsTex(n.b, 1, true)}`, 1);
    case "-": return klam(`${alsTex(n.a, 1)} - ${alsTex(n.b, 1, true)}`, 1);
    case "*": {
      const l = alsTex(n.a, 2), r = alsTex(n.b, 2, n.b.k !== "*");
      const punkt = /[0-9}]$/.test(l) && /^[0-9-]/.test(r);
      return klam(`${l}${punkt ? " \\cdot " : " "}${r}`, 2);
    }
    case "/": return klam(`\\frac{${alsTex(ohneAussenPar(n.a), 0)}}{${alsTex(ohneAussenPar(n.b), 0)}}`, 3);
    case "^": {
      const basis = n.a.k === "fn" || n.a.k === "log" ? `(${alsTex(n.a, 0)})` : alsTex(n.a, 5);
      return klam(`${basis}^{${alsTex(ohneAussenPar(n.b), 0)}}`, 4);
    }
    case "fn": {
      const arg = alsTex(ohneAussenPar(n.a), 0);
      if (n.n === "sqrt") return `\\sqrt{${arg}}`;
      return `\\${n.n}(${arg})`;
    }
    case "log": {
      const arg = alsTex(ohneAussenPar(n.a), 0);
      if (n.zehn) return `\\log(${arg})`;
      return `\\log_{${alsTex(ohneAussenPar(n.b), 0)}}(${arg})`;
    }
    default: return "";
  }
}
const ohneAussenPar = (n) => (n && n.k === "par" ? ohneAussenPar(n.a) : n);

const HOCH = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻", x: "ˣ" };
const hochText = (s) => (/^-?\d+$|^x$/.test(s) ? s.split("").map((z) => HOCH[z]).join("") : null);

/* Klartext für das PDF (Brüche als (…)/(…), einfache Potenzen hochgestellt). */
export function alsText(n, aussen = 0, rechts = false) {
  if (!n) return "";
  const klam = (s, r) => (r < aussen || (rechts && r === aussen && aussen <= 3) ? `(${s})` : s);
  switch (n.k) {
    case "num": return n.v < 0 ? klam(`−${wert(-n.v)}`, 2) : wert(n.v);
    case "x": return "x";
    case "e": return "e";
    case "pi": return "π";
    case "box": return "▯";
    case "par": return `(${alsText(n.a, 0)})`;
    case "neg": return klam(`−${alsText(n.a, 2)}`, 2);
    case "+": return klam(`${alsText(n.a, 1)} + ${alsText(n.b, 1, true)}`, 1);
    case "-": return klam(`${alsText(n.a, 1)} − ${alsText(n.b, 1, true)}`, 1);
    case "*": {
      const teil = (t) => (t.k === "/" ? `(${alsText(t, 0)})` : alsText(t, 2, t.k !== "*"));
      const l = teil(n.a), r = teil(n.b);
      // Zahl direkt vor Variable/Funktion ohne Malpunkt (2x, 3sin(x)), sonst mit Punkt
      const ohne = /^[0-9]+([,][0-9]+)?$/.test(l) && /^[a-zπ√(]/.test(r) && !/^\(/.test(r);
      return klam(`${l}${ohne ? "" : " · "}${r}`, 2);
    }
    case "/": {
      const z = ohneAussenPar(n.a), nn = ohneAussenPar(n.b);
      const zt = alsText(z, 3), nt = alsText(nn, 3, true);
      return klam(`${zt}/${nt}`, 3);
    }
    case "^": {
      const basis = n.a.k === "fn" || n.a.k === "log" ? `(${alsText(n.a, 0)})` : alsText(n.a, 5);
      const expRoh = ohneAussenPar(n.b);
      const einfach = expRoh.k === "num" && Number.isInteger(expRoh.v) ? hochText(String(expRoh.v))
        : expRoh.k === "x" ? "ˣ" : expRoh.k === "neg" && expRoh.a.k === "x" ? "⁻ˣ" : null;
      return klam(einfach ? `${basis}${einfach}` : `${basis}^(${alsText(expRoh, 0)})`, 4);
    }
    case "fn": {
      const arg = alsText(ohneAussenPar(n.a), 0);
      return n.n === "sqrt" ? `√(${arg})` : `${n.n}(${arg})`;
    }
    case "log": {
      const arg = alsText(ohneAussenPar(n.a), 0);
      if (n.zehn) return `log(${arg})`;
      const bs = ohneAussenPar(n.b);
      const basis = bs.k === "num" && Number.isInteger(bs.v) && bs.v > 0 ? tiefZiffer(bs.v) : bs.k === "e" ? "ₑ" : `_(${alsText(bs, 0)})`;
      return `log${basis}(${arg})`;
    }
    default: return "";
  }
}

/* ---------- 2. Numerische Analyse ---------- */

const endlich = (y) => typeof y === "number" && isFinite(y);

function bisektion(g, a, b, ga) {
  let lo = a, hi = b, glo = ga;
  for (let i = 0; i < 80; i++) {
    const m = (lo + hi) / 2, gm = g(m);
    if (!endlich(gm)) return (lo + hi) / 2;
    if (gm === 0) return m;
    if (Math.sign(gm) === Math.sign(glo)) { lo = m; glo = gm; } else hi = m;
  }
  return (lo + hi) / 2;
}

function minimumBetrag(g, a, b) {
  let lo = a, hi = b;
  const phi = (Math.sqrt(5) - 1) / 2;
  for (let i = 0; i < 90; i++) {
    const m1 = hi - phi * (hi - lo), m2 = lo + phi * (hi - lo);
    const v1 = Math.abs(g(m1)), v2 = Math.abs(g(m2));
    if (!(v1 >= v2)) hi = m2; else lo = m1;
  }
  return (lo + hi) / 2;
}

/* Grenze zwischen definiert (bei a) und nicht definiert (bei b). */
function grenzeDefiniert(f, a, b) {
  let lo = a, hi = b;
  for (let i = 0; i < 70; i++) {
    const m = (lo + hi) / 2;
    if (endlich(f(m))) lo = m; else hi = m;
  }
  return Math.abs(lo) < 1e-9 ? 0 : lo;
}

const rund = (x) => {
  const g = Math.round(x);
  if (Math.abs(x - g) < 1e-8) return g;
  for (const nenner of [2, 3, 4, 6]) {
    const z = (x * nenner) / Math.PI;
    if (Math.abs(z - Math.round(z)) < 1e-8) return (Math.round(z) * Math.PI) / nenner;
  }
  return x;
};

function eindeutig(liste, tol) {
  const s = liste.slice().sort((p, q) => p - q);
  const aus = [];
  s.forEach((x) => { if (!aus.length || Math.abs(x - aus[aus.length - 1]) > tol) aus.push(x); });
  return aus;
}

/* Nullstellen von g in den stetigen Stücken [a, b]; Pole (Vorzeichenwechsel
   mit riesigem Betrag) werden nicht als Nullstelle gezählt. */
function nullstellenIn(g, stuecke, N, skala) {
  const erg = [];
  stuecke.forEach(([a, b]) => {
    const n = Math.max(40, Math.round(N * (b - a)));
    const h = (b - a) / n;
    const xs = [], ys = [];
    for (let i = 0; i <= n; i++) {
      const x = a + i * h;
      xs.push(x); ys.push(g(x));
    }
    for (let i = 0; i < n; i++) {
      const y0 = ys[i], y1 = ys[i + 1];
      if (!endlich(y0) || !endlich(y1)) continue;
      if (y0 === 0) { erg.push(xs[i]); continue; }
      if (Math.sign(y0) !== Math.sign(y1) && y1 !== 0) {
        const r = bisektion(g, xs[i], xs[i + 1], y0);
        const gr = g(r);
        if (endlich(gr) && Math.abs(gr) < 1e-6 * (1 + skala)) erg.push(r);
      }
      // Berührstellen: lokales Minimum von |g| nahe null
      if (i > 0 && endlich(ys[i - 1]) && Math.abs(y0) <= Math.abs(ys[i - 1]) && Math.abs(y0) <= Math.abs(y1)
        && Math.sign(ys[i - 1]) === Math.sign(y1) && Math.abs(y0) < 0.05 * (1 + skala)) {
        const r = minimumBetrag(g, xs[i - 1], xs[i + 1]);
        if (Math.abs(g(r)) < 1e-9 * (1 + skala)) erg.push(r);
      }
    }
    if (endlich(ys[n]) && ys[n] === 0) erg.push(xs[n]);
  });
  return eindeutig(erg.map(rund), 1e-6);
}

/* Alle Nenner, Tangens-Argumente usw. sammeln: dort kann f Pole oder Lücken haben. */
function kritischeTerme(n, liste = []) {
  if (!n || !n.k) return liste;
  if (n.k === "/") liste.push(n.b);
  if (n.k === "^" && hatX(n.a)) {
    const e = ohneAussenPar(n.b);
    const negativ = (e.k === "num" && e.v < 0) || e.k === "neg" || hatX(e);
    if (negativ) liste.push(n.a);
  }
  if (n.k === "fn" && n.n === "tan") liste.push(fn("cos", n.a));
  if (n.a) kritischeTerme(n.a, liste);
  if (n.b) kritischeTerme(n.b, liste);
  return liste;
}

function grenzwertUnendlich(f, richtung) {
  const X = [1e1, 1e2, 1e3, 1e4, 1e5, 1e6].map((v) => v * richtung);
  const v = X.map(f);
  if (v.slice(2).every((y) => Number.isNaN(y) || y === undefined)) return { art: "undef" };
  // Überlauf auf ±Infinity mit festem Vorzeichen: bestimmt divergent
  const letzte = v.filter((y) => !Number.isNaN(y));
  if (letzte.length && !isFinite(letzte[letzte.length - 1])) return { art: "unendlich", vz: Math.sign(letzte[letzte.length - 1]) };
  const w = v.slice(2);
  if (!w.every(endlich)) return { art: "keins" };
  const [, b, c, d] = w;
  if (Math.abs(d - c) < 1e-3 * (1 + Math.abs(d)) && Math.abs(c - b) < 1e-2 * (1 + Math.abs(c)))
    return { art: "wert", wert: Math.abs(d) < 1e-4 ? 0 : d };
  // dicht abtasten: monoton wachsend/fallend → ±∞, sonst schwingt f
  const dicht = [];
  for (let i = 0; i < 40; i++) dicht.push(f(richtung * (1000 + i * 7.3)));
  const diff = dicht.slice(1).map((y, i) => y - dicht[i]).filter(endlich);
  const alleGleich = diff.length && (diff.every((x) => x > 0) || diff.every((x) => x < 0));
  const dekaden = v.slice(1).map((y, i) => y - v[i]);
  const dekMono = dekaden.every((x) => x > 0) || dekaden.every((x) => x < 0);
  if (alleGleich && dekMono) return { art: "unendlich", vz: Math.sign(d) || Math.sign(dekaden[dekaden.length - 1]) };
  if (!alleGleich) return { art: "schwingt" };
  return { art: "keins" };
}

function einseitig(f, p, seite) {
  const vals = [1e-3, 1e-5, 1e-7].map((h) => f(p + seite * h));
  if (!vals.every(endlich)) return { art: "undef" };
  const [a, , c] = vals;
  if (Math.abs(c) > 1e4 && Math.abs(c) > Math.abs(a)) return { art: "unendlich", vz: Math.sign(c) };
  return { art: "wert", wert: c };
}

/* Hauptanalyse im Untersuchungsbereich [L, R]. */
export function analysiere(baum, L, R) {
  const b0 = ohnePar(baum);
  const f = kompiliere(b0);
  const d1 = ableitung(b0);
  const d2 = ableitung(d1);
  const fs = kompiliere(d1), fss = kompiliere(d2);

  // Abtasten
  const N = 6000, h = (R - L) / N;
  const xs = [], ys = [];
  for (let i = 0; i <= N; i++) { const x = L + i * h; xs.push(x); ys.push(f(x)); }
  const werte = ys.filter(endlich).map(Math.abs).sort((p, q) => p - q);
  const skala = werte.length ? werte[Math.floor(werte.length * 0.5)] : 1;

  // Zusammenhängend definierte Bereiche (Läufe) mit fein bestimmten Grenzen
  const laeufe = [];
  let start = null;
  for (let i = 0; i <= N; i++) {
    const def = endlich(ys[i]);
    if (def && start === null) start = i;
    if ((!def || i === N) && start !== null) {
      const ende = def ? i : i - 1;
      let a = xs[start], b = xs[ende];
      if (start > 0) a = grenzeDefiniert(f, xs[start], xs[start - 1]);
      if (def && i === N) b = R; else b = grenzeDefiniert(f, xs[ende], xs[ende + 1]);
      if (start === 0) a = L;
      if (b - a > 1e-9 || start === ende) laeufe.push([rund(a), rund(b)]);
      start = null;
    }
  }

  // Kandidaten für Pole und Lücken: Nullstellen der kritischen Terme
  const stellenKrit = [];
  kritischeTerme(b0).forEach((t) => {
    const g = kompiliere(t);
    const gw = [];
    for (let i = 0; i <= 400; i++) { const v = g(L + ((R - L) * i) / 400); if (endlich(v)) gw.push(Math.abs(v)); }
    const sk = gw.length ? gw.sort((p, q) => p - q)[Math.floor(gw.length / 2)] : 1;
    nullstellenIn(g, [[L, R]], 600, sk).forEach((x) => stellenKrit.push(x));
  });
  const luecken = eindeutig(stellenKrit, 1e-7).filter((p) => p > L && p < R)
    .filter((p) => laeufe.some(([a, b]) => p >= a - 1e-9 && p <= b + 1e-9) || !endlich(f(p)));
  const pole = [], hebbar = [];
  luecken.forEach((p) => {
    const li = einseitig(f, p, -1), re = einseitig(f, p, 1);
    const eintrag = { x: p, li, re };
    if (li.art === "unendlich" || re.art === "unendlich") pole.push(eintrag);
    else if (li.art === "wert" && re.art === "wert" && !endlich(f(p))) hebbar.push(eintrag);
  });
  const ausgenommen = [...pole, ...hebbar].map((p) => p.x).sort((p, q) => p - q);

  // Stetige Stücke: Läufe, an Polen/Lücken getrennt
  const stuecke = [];
  laeufe.forEach(([a, b]) => {
    let li = a;
    ausgenommen.filter((p) => p > a && p < b).forEach((p) => { stuecke.push([li, p]); li = p; });
    stuecke.push([li, b]);
  });
  const innen = stuecke.map(([a, b]) => [a + (b - a) * 1e-9 + 1e-9, b - (b - a) * 1e-9 - 1e-9]).filter(([a, b]) => b > a);

  // Nullstellen, Extrem- und Wendepunkte
  const dichte = 3000 / (R - L);
  const ns = nullstellenIn(f, innen, dichte, skala).filter((x) => endlich(f(x)));
  const sk1 = Math.max(1, skala);
  const kandE = nullstellenIn(fs, innen, dichte, sk1).filter((x) => endlich(f(x)));
  const ext = [];
  kandE.forEach((x) => {
    const k = fss(x);
    let art;
    const dx = 1e-4 * Math.max(1, Math.abs(x));
    const l = fs(x - dx), r = fs(x + dx);
    if (endlich(k) && Math.abs(k) > 1e-7) art = k < 0 ? "Hochpunkt" : "Tiefpunkt";
    else art = l > 0 && r < 0 ? "Hochpunkt" : l < 0 && r > 0 ? "Tiefpunkt" : "Sattelpunkt";
    ext.push({ x, y: f(x), art, f2: k });
  });
  const kandW = nullstellenIn(fss, innen, dichte, sk1).filter((x) => endlich(f(x)));
  const wende = [];
  kandW.forEach((x) => {
    const dx = 1e-4 * Math.max(1, Math.abs(x));
    const l = fss(x - dx), r = fss(x + dx);
    if (endlich(l) && endlich(r) && Math.sign(l) !== Math.sign(r) && Math.sign(l) !== 0 && Math.sign(r) !== 0)
      wende.push({ x, y: f(x), art: ext.some((e) => e.art === "Sattelpunkt" && Math.abs(e.x - x) < 1e-6) ? "Sattelpunkt" : "Wendepunkt" });
  });

  // Monotonie- und Krümmungsintervalle
  const intervalle = (g, stellen) => {
    const aus = [];
    stuecke.forEach(([a, b]) => {
      const grenzen = [a, ...stellen.filter((x) => x > a + 1e-9 && x < b - 1e-9), b];
      for (let i = 0; i < grenzen.length - 1; i++) {
        const li = grenzen[i], re = grenzen[i + 1];
        const v = g((li + re) / 2);
        const vz = !endlich(v) || Math.abs(v) < 1e-12 ? 0 : Math.sign(v);
        const letzte = aus[aus.length - 1];
        if (letzte && letzte.vz === vz && Math.abs(letzte.re - li) < 1e-12 && !ausgenommen.some((p) => Math.abs(p - li) < 1e-9)) letzte.re = re;
        else aus.push({ li, re, vz });
      }
    });
    return aus;
  };
  const mono = intervalle(fs, kandE);
  const kruemm = intervalle(fss, kandW);

  // Symmetrie
  let gerade = true, ungerade = true, geprueft = 0;
  const m = Math.min(Math.abs(L), Math.abs(R));
  for (let i = 1; i <= 60; i++) {
    const x = (m * i) / 61 + 0.0137;
    const a = f(x), b = f(-x);
    if (endlich(a) !== endlich(b)) { gerade = false; ungerade = false; break; }
    if (!endlich(a)) continue;
    geprueft++;
    const tol = 1e-7 * (1 + Math.abs(a));
    if (Math.abs(a - b) > tol) gerade = false;
    if (Math.abs(a + b) > tol) ungerade = false;
  }
  if (!geprueft) { gerade = false; ungerade = false; }

  // Verhalten an den Rändern
  const plus = grenzwertUnendlich(f, 1), minus = grenzwertUnendlich(f, -1);
  // Ränder des Definitionsbereichs innerhalb des Fensters (z. B. ln bei 0⁺)
  const raender = [];
  laeufe.forEach(([a, b]) => {
    if (a > L + 1e-9) raender.push({ x: a, seite: 1, g: einseitig(f, a, 1), def: endlich(f(a)) });
    if (b < R - 1e-9) raender.push({ x: b, seite: -1, g: einseitig(f, b, -1), def: endlich(f(b)) });
  });

  // Integrale zwischen benachbarten Nullstellen (nur über stetige Stücke)
  const integrale = [];
  for (let i = 0; i < ns.length - 1; i++) {
    const a = ns[i], b = ns[i + 1];
    if (!stuecke.some(([s, t]) => a >= s - 1e-9 && b <= t + 1e-9)) continue;
    const n = 2000, hh = (b - a) / n;
    let sum = f(a) + f(b);
    for (let j = 1; j < n; j++) sum += (j % 2 ? 4 : 2) * f(a + j * hh);
    const v = (sum * hh) / 3;
    if (endlich(v)) integrale.push({ x1: a, x2: b, wert: v });
  }

  const y0 = f(0);
  return {
    f, fs, fss, d1, d2, laeufe, pole, hebbar, stuecke, ns, ext, wende, mono, kruemm,
    gerade, ungerade, plus, minus, raender, integrale, yAchse: endlich(y0) ? y0 : null, L, R,
  };
}

/* ---------- 3. Kurvendiskussion als Abschnitte ---------- */

const MAX_LISTE = 10;

function grenzeTxt(x, L, R) {
  if (x <= L + 1e-9) return "−∞";
  if (x >= R - 1e-9) return "∞";
  return wert(x);
}

export function baueAllgemeineDiskussion(baum, A) {
  const fText = alsText(ohnePar(baum));
  const abschnitte = [];
  const abschnitt = (titel) => { const s = { titel, zeilen: [] }; abschnitte.push(s); return s; };
  const z = (s, txt, fett, tex) => s.zeilen.push({ txt, fett: !!fett, tex });
  const zP = (s, txt, fett) => s.zeilen.push({ txt, prosa: true, fett: !!fett });
  const fenster = `[${wert(A.L)}; ${wert(A.R)}]`;
  const mitKappe = (liste, zeilenFn, s) => {
    liste.slice(0, MAX_LISTE).forEach(zeilenFn);
    if (liste.length > MAX_LISTE) zP(s, `… und ${liste.length - MAX_LISTE} weitere im Untersuchungsbereich.`);
  };

  // 1. Definitionsbereich
  const s1 = abschnitt("1. Definitionsbereich");
  const ganzFenster = A.laeufe.length === 1 && A.laeufe[0][0] <= A.L + 1e-9 && A.laeufe[0][1] >= A.R - 1e-9;
  const aus = [...A.pole, ...A.hebbar].map((p) => p.x).sort((p, q) => p - q)
    .filter((p) => A.laeufe.some(([a, b]) => p > a + 1e-9 && p < b - 1e-9));
  if (!A.laeufe.length) {
    zP(s1, `f ist im Untersuchungsbereich ${fenster} nirgends definiert.`);
  } else if (ganzFenster) {
    if (!aus.length) z(s1, "D(f) = ℝ", true);
    else if (aus.length <= 6) z(s1, `D(f) = ℝ \\ {${aus.map((x) => wert(x)).join("; ")}}`, true);
    else {
      z(s1, `D(f) = ℝ ohne ${aus.length} Stellen im Bereich ${fenster}`, true);
      zP(s1, `Ausgenommen sind u. a. x = ${aus.slice(0, 4).map((x) => wert(x)).join(", ")}, … (die Lücken wiederholen sich).`);
    }
  } else {
    const teile = A.laeufe.map(([a, b]) => {
      const links = a <= A.L + 1e-9 && A.minus.art !== "undef" ? "(−∞" : `${endlich(A.f(a)) ? "[" : "("}${wert(a)}`;
      const rechts = b >= A.R - 1e-9 && A.plus.art !== "undef" ? "∞)" : `${wert(b)}${endlich(A.f(b)) ? "]" : ")"}`;
      return `${links}; ${rechts}`;
    });
    z(s1, `D(f) = ${teile.join(" ∪ ")}${aus.length ? ` \\ {${aus.map((x) => wert(x)).join("; ")}}` : ""}`, true);
  }
  if (aus.length || !ganzFenster) zP(s1, `Numerisch bestimmt im Untersuchungsbereich ${fenster}.`);

  // 2. Symmetrie
  const s2 = abschnitt("2. Symmetrie");
  if (A.gerade) zP(s2, "f(−x) = f(x) für alle x ⇒ achsensymmetrisch zur y-Achse.");
  else if (A.ungerade) zP(s2, "f(−x) = −f(x) für alle x ⇒ punktsymmetrisch zum Ursprung.");
  else zP(s2, "Weder f(−x) = f(x) noch f(−x) = −f(x) ⇒ keine Symmetrie zur y-Achse oder zum Ursprung.");

  // 3. Verhalten an den Rändern und an Polen
  const s3 = abschnitt("3. Grenzverhalten und Asymptoten");
  const gTxt = (g) => (g.art === "unendlich" ? (g.vz > 0 ? "∞" : "−∞") : g.art === "wert" ? wert(g.wert) : "");
  [[1, A.plus, "∞"], [-1, A.minus, "−∞"]].forEach(([, g, u]) => {
    if (g.art === "undef") return;
    if (g.art === "unendlich" || g.art === "wert") z(s3, `x → ${u}:  f(x) → ${gTxt(g)}`, true);
    if (g.art === "wert") zP(s3, `Waagerechte Asymptote y = ${wert(g.wert)} für x → ${u}.`);
    if (g.art === "schwingt") zP(s3, `x → ${u}: f schwingt und hat keinen Grenzwert.`);
    if (g.art === "keins") zP(s3, `x → ${u}: kein eindeutiger Grenzwert erkennbar.`);
  });
  mitKappe(A.pole, (p) => {
    z(s3, `x → ${wert(p.x)}⁻: f(x) → ${gTxt(p.li)},   x → ${wert(p.x)}⁺: f(x) → ${gTxt(p.re)}`);
    z(s3, `Polstelle ⇒ senkrechte Asymptote x = ${wert(p.x)}`, true);
  }, s3);
  A.hebbar.forEach((p) => z(s3, `x = ${wert(p.x)}: hebbare Definitionslücke, f(x) → ${gTxt(p.li)}`, true));
  const schonGenannt = (x) => [...A.pole, ...A.hebbar].some((p) => Math.abs(p.x - x) < 1e-7);
  A.raender.filter((r) => !schonGenannt(r.x)).slice(0, 6).forEach((r) => {
    if (r.def || r.g.art === "undef") return;
    const pfeil = `x → ${wert(r.x)}${r.seite > 0 ? "⁺" : "⁻"}`;
    z(s3, `${pfeil}:  f(x) → ${gTxt(r.g)}`, true);
    if (r.g.art === "unendlich") zP(s3, `Senkrechte Asymptote x = ${wert(r.x)} am Rand des Definitionsbereichs.`);
  });
  if (!s3.zeilen.length) zP(s3, "Im Untersuchungsbereich ist kein besonderes Grenzverhalten erkennbar.");

  // 4. Nullstellen
  const s4 = abschnitt("4. Nullstellen");
  z(s4, "Ansatz: f(x) = 0", true);
  if (!A.ns.length) zP(s4, `f hat im Untersuchungsbereich ${fenster} keine Nullstelle.`);
  else {
    mitKappe(A.ns, (x, i) => z(s4, `x${tiefZiffer(i + 1)} ${Number.isInteger(rund(x)) || /π/.test(wert(x)) ? "=" : "≈"} ${wert(x)}`), s4);
    zP(s4, "Numerisch bestimmt (Vorzeichenwechsel und Bisektion).");
  }

  // 5. Ableitungen
  const s5 = abschnitt("5. Erste und zweite Ableitung");
  z(s5, `f′(x) = ${alsText(A.d1)}`, false, `f′(x) = ${alsTex(A.d1)}`);
  z(s5, `f″(x) = ${alsText(A.d2)}`, false, `f″(x) = ${alsTex(A.d2)}`);

  // 6. Extrempunkte
  const s6 = abschnitt("6. Extrempunkte");
  z(s6, "Notw. Bed.: f′(x) = 0", true);
  if (!A.ext.length) zP(s6, `f′ hat im Untersuchungsbereich keine Nullstelle ⇒ keine Extrempunkte.`);
  else {
    z(s6, "Hinr. Bed.: Vorzeichen von f″ bzw. Vorzeichenwechsel von f′", true);
    const zaehl = {};
    const anz = {}; A.ext.forEach((p) => { anz[p.art] = (anz[p.art] || 0) + 1; });
    mitKappe(A.ext, (p) => {
      const kurz = p.art === "Hochpunkt" ? "H" : p.art === "Tiefpunkt" ? "T" : "S";
      zaehl[kurz] = (zaehl[kurz] || 0) + 1;
      const idx = anz[p.art] > 1 ? tiefZiffer(zaehl[kurz]) : "";
      if (endlich(p.f2) && Math.abs(p.f2) > 1e-7) z(s6, `f″(${wert(p.x)}) ≈ ${wert(p.f2)} ${p.f2 < 0 ? "< 0 ⇒ Hochpunkt" : "> 0 ⇒ Tiefpunkt"}`);
      z(s6, `${p.art} ${kurz}${idx}(${wert(p.x)} | ${wert(p.y)})`, true);
    }, s6);
  }

  // 7. Monotonie
  const s7 = abschnitt("7. Monotonieverhalten");
  mitKappe(A.mono, (iv) => {
    const r = iv.vz > 0 ? "streng monoton steigend" : iv.vz < 0 ? "streng monoton fallend" : "konstant";
    z(s7, `(${grenzeTxt(iv.li, A.L, A.R)}; ${grenzeTxt(iv.re, A.L, A.R)}):  f′(x) ${iv.vz > 0 ? ">" : iv.vz < 0 ? "<" : "="} 0  ⇒  ${r}`, true);
  }, s7);

  // 8. Wendepunkte
  const s8 = abschnitt("8. Wendepunkte");
  z(s8, "Notw. Bed.: f″(x) = 0 mit Vorzeichenwechsel", true);
  const wps = A.wende.filter((p) => p.art === "Wendepunkt");
  if (!wps.length) zP(s8, "f hat im Untersuchungsbereich keine Wendepunkte.");
  else mitKappe(wps, (p, i) => z(s8, `Wendepunkt W${wps.length > 1 ? tiefZiffer(i + 1) : ""}(${wert(p.x)} | ${wert(p.y)})`, true), s8);

  // 9. Krümmung
  const s9 = abschnitt("9. Krümmungsverhalten");
  mitKappe(A.kruemm, (iv) => {
    const art = iv.vz > 0 ? "Linkskurve (konvex)" : iv.vz < 0 ? "Rechtskurve (konkav)" : "keine Krümmung";
    z(s9, `(${grenzeTxt(iv.li, A.L, A.R)}; ${grenzeTxt(iv.re, A.L, A.R)}):  f″(x) ${iv.vz > 0 ? ">" : iv.vz < 0 ? "<" : "="} 0  ⇒  ${art}`, true);
  }, s9);

  // 10. Alle markanten Punkte
  const s10 = abschnitt("10. Alle markanten Punkte");
  const gruppe = (titel, liste) => {
    if (!liste.length) return;
    z(s10, `${titel}:`, true);
    mitKappe(liste, (t) => z(s10, `   ${t}`), s10);
  };
  gruppe("Nullstellen", A.ns.map((x, i) => `N${A.ns.length > 1 ? tiefZiffer(i + 1) : ""}(${wert(x)} | 0)`));
  const zaehl2 = {}, anz2 = {};
  A.ext.forEach((p) => { anz2[p.art] = (anz2[p.art] || 0) + 1; });
  gruppe("Extrempunkte", A.ext.map((p) => {
    const kurz = p.art === "Hochpunkt" ? "H" : p.art === "Tiefpunkt" ? "T" : "S";
    zaehl2[kurz] = (zaehl2[kurz] || 0) + 1;
    return `${kurz}${anz2[p.art] > 1 ? tiefZiffer(zaehl2[kurz]) : ""}(${wert(p.x)} | ${wert(p.y)})${kurz === "S" ? "   (Sattelpunkt)" : ""}`;
  }));
  gruppe("Wendepunkte", wps.map((p, i) => `W${wps.length > 1 ? tiefZiffer(i + 1) : ""}(${wert(p.x)} | ${wert(p.y)})`));
  if (A.yAchse !== null) gruppe("y-Achsenabschnitt", [`Sᵧ(0 | ${wert(A.yAchse)})   da f(0) = ${wert(A.yAchse)}`]);
  else { z(s10, "y-Achsenabschnitt:", true); z(s10, "   keiner, da f(0) nicht definiert ist"); }

  // 11. Nullstellenintegrale
  const s11 = abschnitt("11. Integrale zwischen den Nullstellen");
  if (!A.integrale.length) zP(s11, "Es gibt keine zwei benachbarten Nullstellen mit stetigem Verlauf dazwischen — kein Nullstellenintegral.");
  else {
    zP(s11, "Numerisch berechnet (Simpson-Regel).");
    mitKappe(A.integrale, (iv, i) => {
      z(s11, `I${tiefZiffer(i + 1)}:  Intervall [${wert(iv.x1)}; ${wert(iv.x2)}]`, true);
      z(s11, `I${tiefZiffer(i + 1)} = ∫ f(x) dx ≈ ${zahl(iv.wert).replace("-", "−")}`);
    }, s11);
  }

  return { funktionstext: `f(x) = ${fText}`, abschnitte };
}

/* ---------- 4. Oberfläche ---------- */

/* Tastenfeld: sechs Spalten. e = einzufügender Text; ▯ ist ein Platzhalter,
   in den die Schreibmarke springt. */
const TASTEN = [
  { z: "sin", e: `sin(${PLATZ})`, art: "fn" }, { z: "cos", e: `cos(${PLATZ})`, art: "fn" },
  { z: "tan", e: `tan(${PLATZ})`, art: "fn" }, { z: "ln", e: `ln(${PLATZ})`, art: "fn" },
  { z: "log", e: `log(${PLATZ})`, art: "fn" }, { z: "logₐ", e: `log[${PLATZ}](${PLATZ})`, art: "fn" },

  { z: "eˣ", e: `e^(${PLATZ})`, art: "fn" }, { z: "aˣ", e: `${PLATZ}^(x)`, art: "fn" },
  { z: "xⁿ", e: `x^(${PLATZ})`, art: "fn" }, { z: "x²", e: "x^2", art: "fn" },
  { z: "x⁻¹", e: "x^(-1)", art: "fn" }, { z: "√", e: `sqrt(${PLATZ})`, art: "fn" },

  { z: "7", e: "7" }, { z: "8", e: "8" }, { z: "9", e: "9" },
  { z: "▯/▯", e: `(${PLATZ})/(${PLATZ})`, art: "op", titel: "Bruch" },
  { z: "(", e: "(", art: "op" }, { z: ")", e: ")", art: "op" },

  { z: "4", e: "4" }, { z: "5", e: "5" }, { z: "6", e: "6" },
  { z: "×", e: "*", art: "op" }, { z: "÷", e: "/", art: "op" }, { z: "x", e: "x", art: "var" },

  { z: "1", e: "1" }, { z: "2", e: "2" }, { z: "3", e: "3" },
  { z: "−", e: "-", art: "op" }, { z: "▯ⁿ", e: `^(${PLATZ})`, art: "op", titel: "hoch" }, { z: "π", e: "pi", art: "var" },

  { z: "0", e: "0" }, { z: ",", e: "," }, { z: "e", e: "e", art: "var" },
  { z: "+", e: "+", art: "op" }, { z: "▯→", e: null, art: "nav", aktion: "platz", titel: "nächster Platzhalter" },
  { z: "Clear", e: null, art: "nav", aktion: "leer", titel: "Clear – alles löschen" },
];

const LOESCH_EINHEITEN = ["sqrt(", "sin(", "cos(", "tan(", "log[", "log(", "ln(", "pi", "e^("];

const BEISPIELE = [
  ["x · e⁻ˣ", "x*e^(-x)"], ["sin(x)/x", "sin(x)/x"], ["ln(x)/x", "ln(x)/x"],
  ["x/(x²−4)", "x/(x^2-4)"], ["e^(−x²)", "e^(-x^2)"], ["tan(x)", "tan(x)"],
  ["2ˣ − 3", "2^x-3"], ["log₂(x) − 1", "log[2](x)-1"], ["x² · ln(x)", "x^2*ln(x)"],
  ["√(4 − x²)", "sqrt(4-x^2)"], ["2sin(x) + cos(2x)", "2sin(x)+cos(2x)"], ["(x²−1)/(x²+1)", "(x^2-1)/(x^2+1)"],
];

export function zufallsFunktion() {
  const r = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const rz = (a, b) => { let v = 0; while (v === 0) v = r(a, b); return v; };
  const vz = (v) => (v < 0 ? `-${-v}` : `+${v}`);
  const vorlagen = [
    () => `${rz(-3, 3)}sin(${r(1, 3)}x)`,
    () => `x*e^(${rz(-2, 2)}x)`,
    () => `ln(x^2${vz(r(1, 5))})`,
    () => `(x^2${vz(rz(-9, 9))})/(x${vz(rz(-4, 4))})`,
    () => `x/(x^2${vz(-r(1, 9))})`,
    () => `e^(-x^2/${r(1, 4)})`,
    () => `${r(2, 3)}^x${vz(rz(-5, 5))}`,
    () => `log[${r(2, 5)}](x)${vz(rz(-3, 3))}`,
    () => `x^${r(2, 4)}*e^(-x)`,
    () => `sin(x)${vz(rz(-2, 2))}cos(${r(1, 3)}x)`,
    () => `sqrt(${r(4, 16)}-x^2)`,
    () => `x^3${vz(rz(-6, 6))}x^2${vz(rz(-9, 9))}x${vz(rz(-9, 9))}`,
    () => `ln(x)/x^${r(1, 2)}`,
    () => `(x^2${vz(rz(-4, 4))})*e^(${rz(-1, 1)}x)`,
    () => `tan(x/${r(1, 2)})`,
  ];
  return vorlagen[r(0, vorlagen.length - 1)]().replace(/\+-/g, "-").replace(/--/g, "+");
}

export function Tastenfeld({ wert: text, setWert, pos, setPos }) {
  const setzen = (t, p) => { setWert(t); setPos(Math.max(0, Math.min(p, t.length))); };
  const einfuegen = (s) => {
    let t = text, p = pos;
    if (t[p] === PLATZ) t = t.slice(0, p) + s + t.slice(p + 1);
    else t = t.slice(0, p) + s + t.slice(p);
    const rel = s.indexOf(PLATZ);
    setzen(t, rel >= 0 ? p + rel : p + s.length);
  };
  const zurueck = () => {
    if (pos === 0) return;
    const vorne = text.slice(0, pos);
    const einheit = LOESCH_EINHEITEN.find((e) => vorne.endsWith(e));
    const n = einheit ? einheit.length : 1;
    setzen(text.slice(0, pos - n) + text.slice(pos), pos - n);
  };
  const naechsterPlatz = () => {
    const ab = text.indexOf(PLATZ, pos + 1);
    const idx = ab >= 0 ? ab : text.indexOf(PLATZ);
    setPos(idx >= 0 ? idx : text.length);
  };
  const klick = (t) => {
    if (t.aktion === "platz") return naechsterPlatz();
    if (t.aktion === "leer") return setzen("", 0);
    if (t.aktion === "links") return setPos(Math.max(0, pos - 1));
    if (t.aktion === "rechts") return setPos(Math.min(text.length, pos + 1));
    if (t.aktion === "zurueck") return zurueck();
    einfuegen(t.e);
  };
  const stil = (art) => {
    if (art === "fn") return { bg: C.himmel, fg: C.see, rand: "#C7D8EF" };
    if (art === "op") return { bg: C.gruen, fg: C.weiss, rand: C.gruen };
    if (art === "var") return { bg: "#FFF4CC", fg: C.seeTief, rand: "#F0DC8A" };
    if (art === "nav") return { bg: C.seeTief, fg: C.flaggold, rand: C.seeTief };
    return { bg: C.weiss, fg: C.tinte, rand: C.linie };
  };
  const Taste = ({ t, span }) => {
    const s = stil(t.art);
    return (
      <button onClick={() => klick(t)} aria-label={t.titel || t.z} className="adv-taste"
        style={{ gridColumn: span ? `span ${span}` : undefined, height: 46, background: s.bg, color: s.fg,
          border: `1px solid ${s.rand}`, borderRadius: 12, fontSize: t.z.length > 3 ? 14 : 17,
          fontWeight: t.art === "op" || t.art === "nav" ? 700 : 600, fontFamily: "inherit", cursor: "pointer",
          padding: 0, display: "flex", alignItems: "center", justifyContent: "center",
          fontStyle: t.art === "var" && t.z === "x" ? "italic" : "normal", boxShadow: "0 1px 0 rgba(15,26,51,0.06)" }}>
        {t.z}
      </button>
    );
  };
  return (
    <div>
      <style>{`.adv-taste{transition:transform .08s ease, filter .12s ease}
        .adv-taste:active{transform:scale(0.93);filter:brightness(0.93)}`}</style>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }}>
        {TASTEN.map((t, i) => <Taste key={i} t={t} />)}
        <Taste t={{ z: "←", art: "nav", aktion: "links", titel: "Schreibmarke nach links" }} span={2} />
        <Taste t={{ z: "→", art: "nav", aktion: "rechts", titel: "Schreibmarke nach rechts" }} span={2} />
        <Taste t={{ z: "⌫", art: "nav", aktion: "zurueck", titel: "Löschen" }} span={2} />
      </div>
    </div>
  );
}

function Eingabe({ text, setText }) {
  const [pos, setPos] = useState(text.length);
  const [tippen, setTippen] = useState(false);
  const baum = useMemo(() => parse(text), [text]);
  const tex = baum ? alsTex(baum) : null;
  const unfertig = baum && hatBox(baum);

  return (
    <div>
      {/* Anzeige */}
      <div style={{ background: C.weiss, border: `1.5px solid ${baum || !text ? C.linie : C.signal}`, borderRadius: 14,
        padding: "12px 14px", minHeight: 64, overflowX: "auto", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 20, fontWeight: 700, color: C.tinte, whiteSpace: "nowrap" }}>f(x) =</span>
        {text ? (
          tex ? <span style={{ fontSize: 21, lineHeight: 1.9 }}><M t={tex} /></span>
            : <span style={{ fontSize: 16, color: C.signal }}>{text}</span>
        ) : (
          <span style={{ fontSize: 15, color: C.hellgrau, fontWeight: 300 }}>Tippe eine Funktion ein …</span>
        )}
      </div>
      <p style={{ fontSize: 12, color: C.hellgrau, fontWeight: 300, margin: "6px 2px 10px", wordBreak: "break-all", minHeight: 16 }}>
        {text.slice(0, pos)}<span style={{ color: C.gruen, fontWeight: 700 }}>|</span>{text.slice(pos)}
        {!baum && text && <span style={{ color: C.signal, marginLeft: 8 }}>· noch nicht vollständig</span>}
        {unfertig && <span style={{ color: C.gruenDunkel, marginLeft: 8 }}>· Platzhalter ▯ füllen</span>}
      </p>

      {/* Spielerische Schnellstarts */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <button onClick={() => { const t = zufallsFunktion(); setText(t); setPos(t.length); }}
          style={{ flex: 1, height: 42, borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "inherit",
            fontSize: 14, fontWeight: 700, color: C.seeTief, background: C.flaggold, boxShadow: "0 3px 10px rgba(237,187,0,0.35)" }}>
          🎲 Zufallsfunktion
        </button>
        <button onClick={() => setTippen(!tippen)}
          style={{ flex: 1, height: 42, borderRadius: 12, border: `1px solid ${C.linie}`, cursor: "pointer",
            fontFamily: "inherit", fontSize: 13.5, fontWeight: 600, color: C.see, background: C.weiss }}>
          {tippen ? "Tastenfeld zeigen" : "Selbst tippen"}
        </button>
      </div>
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8, marginBottom: 6 }}>
        {BEISPIELE.map(([n, t]) => (
          <button key={t} onClick={() => { setText(t); setPos(t.length); }}
            style={{ flexShrink: 0, padding: "6px 11px", borderRadius: 999, border: `1px solid ${C.linie}`,
              background: text === t ? C.see : C.weiss, color: text === t ? C.weiss : C.see, fontSize: 12.5,
              fontFamily: "inherit", cursor: "pointer", whiteSpace: "nowrap" }}>{n}</button>
        ))}
      </div>

      {tippen ? (
        <div>
          <input value={text} onChange={(e) => { setText(e.target.value); setPos(e.target.value.length); }}
            placeholder="z. B. x^2*sin(x) oder log[2](x+1)" autoCapitalize="off" autoCorrect="off" spellCheck="false"
            style={{ width: "100%", boxSizing: "border-box", height: 46, borderRadius: 12, border: `1.5px solid ${C.linie}`,
              padding: "0 12px", fontSize: 16, fontFamily: "ui-monospace, Menlo, monospace", color: C.tinte }} />
          <p style={{ fontSize: 12, color: C.grau, fontWeight: 300, lineHeight: 1.6, marginTop: 8 }}>
            Schreibweise: <b>^</b> hoch, <b>/</b> geteilt, <b>sqrt(…)</b> Wurzel, <b>ln(…)</b>, <b>log(…)</b> zur Basis 10,
            <b> log[a](…)</b> zur Basis a, <b>e^(…)</b>, <b>pi</b>.
          </p>
        </div>
      ) : (
        <Tastenfeld wert={text} setWert={setText} pos={pos} setPos={setPos} />
      )}
    </div>
  );
}

/* Plot mit f, f′, f″, Polen, markanten Punkten und Nullstellenintegralen. */
function AdvPlot({ A, zeigen }) {
  const [zoom, setZoom] = useState(1);
  const Sx = 340, Sy = 250;
  const ok = endlich;
  const punkte = [...A.ns.map((x) => ({ x, y: 0 })), ...A.ext, ...A.wende];
  const xs = [...(A.yAchse !== null ? [0] : []), ...punkte.map((p) => p.x), ...A.pole.map((p) => p.x)];
  let xMin, xMax;
  if (xs.length) {
    xMin = Math.min(...xs); xMax = Math.max(...xs);
    const sp = Math.max(xMax - xMin, 2);
    xMin -= sp * 0.2 + 0.6; xMax += sp * 0.2 + 0.6;
  } else { xMin = A.L / 2; xMax = A.R / 2; }
  xMin = Math.max(xMin, A.L); xMax = Math.min(xMax, A.R);
  const mx = (xMin + xMax) / 2, hx = ((xMax - xMin) / 2) / zoom;
  xMin = Math.max(A.L, mx - hx); xMax = Math.min(A.R, mx + hx);
  const yW = [0, ...(A.yAchse !== null ? [A.yAchse] : []), ...punkte.map((p) => p.y)].filter(ok);
  let yMin = Math.min(...yW), yMax = Math.max(...yW);
  const grenze = Math.max(yMax - yMin, 2) * 0.8;
  for (let i = 0; i <= 300; i++) {
    const y = A.f(xMin + ((xMax - xMin) * i) / 300);
    if (ok(y) && y >= yMin - grenze && y <= yMax + grenze) { yMin = Math.min(yMin, y); yMax = Math.max(yMax, y); }
  }
  const ys = Math.max(yMax - yMin, 2);
  yMin -= ys * 0.12; yMax += ys * 0.12;
  const px = (x) => ((x - xMin) / (xMax - xMin)) * Sx;
  const py = (y) => Sy - ((y - yMin) / (yMax - yMin)) * Sy;

  const pfad = (g) => {
    let d = "", offen = false, vorher = null;
    const hoehe = yMax - yMin;
    for (let i = 0; i <= 900; i++) {
      const x = xMin + ((xMax - xMin) * i) / 900;
      const y = g(x);
      if (!ok(y) || y < yMin - hoehe * 3 || y > yMax + hoehe * 3) { offen = false; vorher = null; continue; }
      if (vorher !== null && Math.abs(y - vorher) > hoehe * 1.5 && Math.sign(y) !== Math.sign(vorher)) offen = false;
      d += `${offen ? "L" : "M"} ${px(x).toFixed(1)} ${py(y).toFixed(1)} `;
      offen = true; vorher = y;
    }
    return d;
  };
  const flaeche = (x1, x2) => {
    let d = `M ${px(x1).toFixed(1)} ${py(0).toFixed(1)} `;
    for (let i = 0; i <= 80; i++) {
      const x = x1 + ((x2 - x1) * i) / 80, y = A.f(x);
      if (ok(y)) d += `L ${px(x).toFixed(1)} ${py(Math.min(Math.max(y, yMin), yMax)).toFixed(1)} `;
    }
    return d + `L ${px(x2).toFixed(1)} ${py(0).toFixed(1)} Z`;
  };
  const sX = schoenerSchritt((xMax - xMin) / 2), sY = schoenerSchritt((yMax - yMin) / 2);
  const gx = []; for (let v = Math.ceil(xMin / sX) * sX; v <= xMax; v += sX) gx.push(Math.round(v * 1000) / 1000);
  const gy = []; for (let v = Math.ceil(yMin / sY) * sY; v <= yMax; v += sY) gy.push(Math.round(v * 1000) / 1000);
  const farben = [C.see, C.gruen, C.gold, C.smaragd, C.lila];
  const knopf = { width: 34, height: 34, background: C.weiss, border: "none", fontSize: 18, color: C.see,
    cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center" };

  return (
    <div style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${Sx} ${Sy}`} style={{ width: "100%", display: "block", background: C.weiss, borderRadius: 12 }}>
        <defs><clipPath id="advfeld"><rect x="0" y="0" width={Sx} height={Sy} /></clipPath></defs>
        {gx.map((v) => <line key={`gx${v}`} x1={px(v)} y1={0} x2={px(v)} y2={Sy} stroke={C.linie} strokeWidth="1" />)}
        {gy.map((v) => <line key={`gy${v}`} x1={0} y1={py(v)} x2={Sx} y2={py(v)} stroke={C.linie} strokeWidth="1" />)}
        <g clipPath="url(#advfeld)">
          {zeigen.integrale && A.integrale.map((iv, i) => (
            <path key={`i${i}`} d={flaeche(iv.x1, iv.x2)} fill={farben[i % farben.length]} opacity="0.2" />
          ))}
        </g>
        {yMin <= 0 && yMax >= 0 && <line x1={0} y1={py(0)} x2={Sx} y2={py(0)} stroke={C.hellgrau} strokeWidth="1.4" />}
        {xMin <= 0 && xMax >= 0 && <line x1={px(0)} y1={0} x2={px(0)} y2={Sy} stroke={C.hellgrau} strokeWidth="1.4" />}
        {gx.filter((v) => Math.abs(v) > 1e-9).map((v) => (
          <text key={`lx${v}`} x={px(v)} y={Math.min(Math.max(py(0) + 12, 10), Sy - 3)} fontSize="9" fill={C.hellgrau} textAnchor="middle">{wert(v)}</text>
        ))}
        {gy.filter((v) => Math.abs(v) > 1e-9).map((v) => (
          <text key={`ly${v}`} x={Math.min(Math.max(px(0) - 4, 16), Sx - 2)} y={py(v) + 3} fontSize="9" fill={C.hellgrau} textAnchor="end">{wert(v)}</text>
        ))}
        <g clipPath="url(#advfeld)">
          {A.pole.map((p, i) => (
            <line key={`p${i}`} x1={px(p.x)} y1={0} x2={px(p.x)} y2={Sy} stroke={C.gruen} strokeWidth="1.2" strokeDasharray="4 4" opacity="0.7" />
          ))}
          {[A.plus, A.minus].map((g, i) => g.art === "wert" && (
            <line key={`a${i}`} x1={0} y1={py(g.wert)} x2={Sx} y2={py(g.wert)} stroke={C.gruen} strokeWidth="1" strokeDasharray="4 4" opacity="0.45" />
          ))}
          {zeigen.f2 && <path d={pfad(A.fss)} stroke={C.granaHell} strokeWidth="1.7" fill="none" strokeDasharray="5 4" opacity="0.75" />}
          {zeigen.f1 && <path d={pfad(A.fs)} stroke={C.flaggold} strokeWidth="2" fill="none" opacity="0.9" />}
          <path d={pfad(A.f)} stroke={C.see} strokeWidth="2.6" fill="none" strokeLinejoin="round" />
          {A.ns.map((x, i) => <circle key={`n${i}`} cx={px(x)} cy={py(0)} r="4.2" fill={C.weiss} stroke={C.see} strokeWidth="2.3" />)}
          {A.ext.map((p, i) => ok(p.y) && <circle key={`e${i}`} cx={px(p.x)} cy={py(p.y)} r="5" fill={C.gruen} />)}
          {A.wende.filter((p) => p.art === "Wendepunkt").map((p, i) => <circle key={`w${i}`} cx={px(p.x)} cy={py(p.y)} r="4.6" fill={C.flaggold} stroke={C.seeTief} strokeWidth="0.8" />)}
          {A.yAchse !== null && <circle cx={px(0)} cy={py(A.yAchse)} r="3.6" fill={C.seeHell} />}
          {A.hebbar.filter((p) => p.li.art === "wert").map((p, i) => (
            <circle key={`h${i}`} cx={px(p.x)} cy={py(p.li.wert)} r="4" fill={C.weiss} stroke={C.gruen} strokeWidth="2" />
          ))}
        </g>
      </svg>
      <div style={{ position: "absolute", right: 8, top: 8, display: "flex", flexDirection: "column", borderRadius: 10,
        overflow: "hidden", boxShadow: "0 2px 8px rgba(15,26,51,0.15)" }}>
        <button style={knopf} onClick={() => setZoom((z) => Math.min(z * 1.6, 20))} aria-label="Hineinzoomen">+</button>
        <button style={{ ...knopf, borderTop: `1px solid ${C.linie}` }} onClick={() => setZoom((z) => Math.max(z / 1.6, 0.3))} aria-label="Herauszoomen">−</button>
      </div>
    </div>
  );
}

function Diskussion({ inhalt }) {
  return (
    <div>
      {inhalt.abschnitte.map((sek, i) => (
        <div key={i} style={{ marginBottom: 18 }}>
          <p style={{ fontSize: 13.5, fontWeight: 700, color: C.see, marginBottom: 8, paddingBottom: 6, borderBottom: `1px solid ${C.linie}` }}>
            {sek.titel}
          </p>
          {sek.zeilen.map((zl, j) => zl.tex ? (
            <div key={j} style={{ overflowX: "auto" }}>
              <p style={{ fontSize: 14.5, color: C.tinte, marginBottom: 6, whiteSpace: "nowrap" }}><M t={zl.tex} /></p>
            </div>
          ) : zl.prosa ? (
            <p key={j} style={{ fontSize: 12.5, fontWeight: zl.fett ? 700 : 400, color: zl.fett ? C.tinte : C.grau, lineHeight: 1.7, marginBottom: 6 }}>{zl.txt}</p>
          ) : (
            <div key={j} style={{ overflowX: "auto" }}>
              <p style={{ fontSize: 12.5, fontWeight: zl.fett ? 700 : 400, color: zl.fett ? C.tinte : C.grau, lineHeight: 1.7, whiteSpace: "pre", marginBottom: 3 }}>{zl.txt}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

const FENSTER = [["±5", 5], ["±10", 10], ["±20", 20], ["±2π", 2 * Math.PI]];

export function AdvancedPlotter() {
  const [text, setText] = useState("x*e^(-x)");
  const [fenster, setFenster] = useState(10);
  const [zeigen, setZeigen] = useState({ f1: true, f2: false, integrale: true });
  const [pdfStatus, setPdfStatus] = useState("bereit");
  const baum = useMemo(() => parse(text), [text]);
  const bereit = !!baum && !hatBox(baum);
  const A = useMemo(() => {
    if (!bereit) return null;
    try { return analysiere(baum, -fenster, fenster); } catch (e) { console.error(e); return null; }
  }, [baum, bereit, fenster]);
  const inhalt = useMemo(() => (A ? baueAllgemeineDiskussion(baum, A) : null), [A, baum]);

  const pdf = async () => {
    if (!A || pdfStatus === "laeuft") return;
    setPdfStatus("laeuft");
    try {
      const { allgemeinesPdf } = await import("./func11.jsx");
      const fT = alsText(ohnePar(baum));
      await allgemeinesPdf({
        kopf: {
          f: `f(x) = ${fT}`, f1: `f′(x) = ${alsText(A.d1)}`, f2: `f″(x) = ${alsText(A.d2)}`,
          fuss: `Kurvendiskussion für f(x) = ${fT}`, untertitel: "Kurvendiskussion · Advanced Plotter",
        },
        inhalt,
        modell: {
          f: A.f, ns: A.ns, mark: [...A.ext, ...A.wende.filter((p) => p.art === "Wendepunkt")],
          yAchse: A.yAchse, integrale: A.integrale.map((iv) => [iv.x1, iv.x2]), fenster: { xMin: A.L, xMax: A.R },
        },
        dateiname: `Kurvendiskussion_${text.replace(/[^\w+\-]/g, "").slice(0, 40) || "Funktion"}.pdf`,
      });
      setPdfStatus("bereit");
    } catch (err) { console.error(err); setPdfStatus("fehler"); }
  };

  const karte = { background: C.weiss, borderRadius: 16, padding: 18, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" };
  const schalter = (schl, label, farbe) => (
    <button key={schl} onClick={() => setZeigen({ ...zeigen, [schl]: !zeigen[schl] })}
      style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 999,
        border: `1px solid ${zeigen[schl] ? farbe : C.linie}`, background: zeigen[schl] ? C.himmel : C.weiss,
        color: C.tinte, fontSize: 12.5, fontFamily: "inherit", cursor: "pointer" }}>
      <span style={{ width: 14, height: 3, borderRadius: 2, background: farbe, opacity: zeigen[schl] ? 1 : 0.35 }} />{label}
    </button>
  );

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 10 }}>
        Baue deine eigene Funktion
      </h2>
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, marginBottom: 18 }}>
        Setz Polynome, sin, cos, tan, ln, Logarithmen, e-Funktionen, Wurzeln und Brüche beliebig zusammen —
        Graph und komplette Kurvendiskussion entstehen live mit.
      </p>

      <div style={karte}>
        <Eingabe text={text} setText={setText} />
      </div>

      {A && (
        <div style={{ ...karte, marginTop: 16 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
            {schalter("f1", "f′", C.flaggold)}
            {schalter("f2", "f″", C.granaHell)}
            {schalter("integrale", "Integrale", C.see)}
          </div>
          <AdvPlot A={A} zeigen={zeigen} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12.5, color: C.grau }}>Untersuchungsbereich</span>
            {FENSTER.map(([n, v]) => (
              <button key={n} onClick={() => setFenster(v)}
                style={{ padding: "5px 11px", borderRadius: 999, border: `1px solid ${fenster === v ? C.see : C.linie}`,
                  background: fenster === v ? C.see : C.weiss, color: fenster === v ? C.weiss : C.see,
                  fontSize: 12.5, fontFamily: "inherit", cursor: "pointer" }}>{n}</button>
            ))}
          </div>
        </div>
      )}

      {inhalt && (
        <div style={{ ...karte, marginTop: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, marginBottom: 6 }}>Kurvendiskussion</p>
          <div style={{ marginBottom: 14, overflowX: "auto" }}>
            <p style={{ fontSize: 19, fontWeight: 700, whiteSpace: "nowrap" }}><M t={`f(x) = ${alsTex(baum)}`} /></p>
            <p style={{ fontSize: 13.5, color: C.grau, whiteSpace: "nowrap", marginTop: 4 }}><M t={`f′(x) = ${alsTex(A.d1)}`} /></p>
            <p style={{ fontSize: 13.5, color: C.grau, whiteSpace: "nowrap", marginTop: 2 }}><M t={`f″(x) = ${alsTex(A.d2)}`} /></p>
          </div>
          <Diskussion inhalt={inhalt} />
          <button onClick={pdf} disabled={pdfStatus === "laeuft"}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 8,
              padding: "15px 18px", border: "none", borderRadius: 14, cursor: pdfStatus === "laeuft" ? "wait" : "pointer",
              fontFamily: "inherit", fontSize: 15.5, fontWeight: 700, color: C.weiss,
              background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`, boxShadow: "0 6px 20px rgba(0,77,152,0.25)",
              opacity: pdfStatus === "laeuft" ? 0.75 : 1 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.flaggold} strokeWidth="2.4"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3v12" /><path d="M7 10l5 5 5-5" /><path d="M5 20h14" />
            </svg>
            {pdfStatus === "laeuft" ? "PDF wird erstellt …" : "Kurvendiskussion als PDF herunterladen"}
          </button>
          {pdfStatus === "fehler" && (
            <p style={{ fontSize: 12.5, color: C.signal, marginTop: 8, textAlign: "center" }}>
              Das PDF konnte nicht erstellt werden. Bitte noch einmal versuchen.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* Hochformat-Grafik für die Startseiten-Kachel. */
export function AdvancedLogoKlein() {
  const W = 230, H = 190, x0 = 62, y0 = 104, sx = 27, sy = 26;
  const pfad = (g, von, bis) => {
    let d = "", offen = false;
    for (let i = 0; i <= 200; i++) {
      const x = von + ((bis - von) * i) / 200, y = g(x);
      if (!isFinite(y) || Math.abs(y) > 3.6) { offen = false; continue; }
      d += `${offen ? "L" : "M"}${(x0 + x * sx).toFixed(1)},${(y0 - y * sy).toFixed(1)}`;
      offen = true;
    }
    return d;
  };
  const pol = 4.2;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "100%", display: "block" }} aria-hidden="true">
      {Array.from({ length: 10 }, (_, i) => x0 + (i - 2) * sx).map((x) => <line key={`v${x}`} x1={x} y1="0" x2={x} y2={H} stroke="rgba(255,255,255,0.06)" />)}
      {Array.from({ length: 8 }, (_, i) => y0 + (i - 4) * sy).map((y) => <line key={`h${y}`} x1="0" y1={y} x2={W} y2={y} stroke="rgba(255,255,255,0.06)" />)}
      <line x1="0" y1={y0} x2={W} y2={y0} stroke="rgba(255,255,255,0.3)" />
      <line x1={x0} y1="0" x2={x0} y2={H} stroke="rgba(255,255,255,0.3)" />
      <line x1={x0 + pol * sx} y1="0" x2={x0 + pol * sx} y2={H} stroke={C.granaHell} strokeWidth="1.4" strokeDasharray="4 4" />
      <path d={pfad((x) => 1 / (pol - x) - 0.3, 2.6, pol - 0.05)} stroke={C.granaHell} strokeWidth="2" fill="none" />
      <path d={pfad((x) => 1 / (pol - x) - 0.3, pol + 0.05, 6)} stroke={C.granaHell} strokeWidth="2" fill="none" />
      <path d={pfad((x) => Math.log(x + 2.4) - 0.6, -2.35, 5.5)} stroke={C.flaggold} strokeWidth="2" fill="none" />
      <path d={pfad((x) => 2.2 * Math.sin(2 * x) * Math.exp(-0.25 * (x + 2.5)), -2.5, 3.8)} stroke={C.weiss} strokeWidth="2.8" fill="none" strokeLinecap="round" />
      <g fontSize="12" fontWeight="700" fontStyle="italic">
        <text x="10" y="20" fill={C.weiss}>sin</text>
        <text x="34" y="20" fill={C.flaggold}>ln</text>
        <text x="52" y="20" fill={C.granaHell}>1/x</text>
      </g>
    </svg>
  );
}

/* Logo für die Startseiten-Kachel: Sinus-Welle mal abklingender e-Funktion,
   Polstelle als gestrichelte Asymptote, dazu eine Logarithmus-Kurve. */
export function AdvancedLogo() {
  const W = 340, H = 170, x0 = 150, y0 = 96, sx = 26, sy = 30;
  const pfad = (g, von, bis) => {
    let d = "", offen = false;
    for (let i = 0; i <= 240; i++) {
      const x = von + ((bis - von) * i) / 240, y = g(x);
      if (!isFinite(y) || Math.abs(y) > 3.2) { offen = false; continue; }
      d += `${offen ? "L" : "M"}${(x0 + x * sx).toFixed(1)},${(y0 - y * sy).toFixed(1)}`;
      offen = true;
    }
    return d;
  };
  return (
    <svg viewBox={`0 62 ${W} 64`} preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%", display: "block" }} aria-hidden="true">
      {Array.from({ length: 14 }, (_, i) => x0 + (i - 6) * sx).map((x) => (
        <line key={`v${x}`} x1={x} y1="0" x2={x} y2={H} stroke="rgba(255,255,255,0.07)" />
      ))}
      {Array.from({ length: 7 }, (_, i) => y0 + (i - 3) * sy).map((y) => (
        <line key={`h${y}`} x1="0" y1={y} x2={W} y2={y} stroke="rgba(255,255,255,0.07)" />
      ))}
      <line x1="0" y1={y0} x2={W} y2={y0} stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" />
      <line x1={x0} y1="0" x2={x0} y2={H} stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" />
      <line x1={x0 + 5 * sx} y1="0" x2={x0 + 5 * sx} y2={H} stroke={C.granaHell} strokeWidth="1.6" strokeDasharray="5 5" opacity="0.9" />
      <path d={pfad((x) => 1 / (5 - x) - 0.4, 3.2, 4.93)} stroke={C.granaHell} strokeWidth="2.2" fill="none" />
      <path d={pfad((x) => 1 / (5 - x) - 0.4, 5.07, 7)} stroke={C.granaHell} strokeWidth="2.2" fill="none" />
      <path d={pfad((x) => Math.log(x + 5.6) - 1.1, -5.55, 3)} stroke={C.flaggold} strokeWidth="2.2" fill="none" opacity="0.95" />
      <path d={pfad((x) => 2.4 * Math.sin(1.6 * x) * Math.exp(-0.18 * (x + 5.5)), -5.8, 4.6)} stroke={C.weiss} strokeWidth="3.2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
