import React, { useState, useRef, useEffect } from "react";
import { C } from "./base1.jsx";
import { M, Text } from "./func3.jsx";
import { merken } from "./func5.jsx";
import { NeueZeile } from "./funcLGS.jsx";
import { IchHaengeFest } from "./funcHilfe.jsx";
const LGS_ZEILE_CSS = ".lgs-blink{animation:sbBlink 1s step-end infinite}";

/* ======================================================================
   STECKBRIEFAUFGABEN (Analysis)
   Aus gegebenen Eigenschaften die Funktion rekonstruieren:
   1. Ansatz wählen (Struktur der Funktion)
   2. Bedingungen aufstellen: f(1) = 2, f′(1) = 0, f″(3) = 0 …
   3. x-Werte in den Ansatz einsetzen (Rechnung sichtbar: a·6^3 …)
   4. Ausmultiplizieren → lineares Gleichungssystem
   5. LGS lösen (wie im LGS-Werkzeug: Gleichungen kombinieren) —
      bei Exponential- und Sinusfunktionen per Dividieren / Ablesen
   6. Schaubild mit allen gegebenen Eigenschaften und Probe
   ====================================================================== */

const ROEM = ["I", "II", "III", "IV", "V"];
const STRICH = ["", "′", "″"];
const zz = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const wahl = (arr) => arr[Math.floor(Math.random() * arr.length)];
const mischen = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const ggT = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
const kgV = (a, b) => Math.abs(a * b) / ggT(a, b);
const minus = (s) => String(s).replace(/-/g, "−");
const zk = (v) => (v < 0 ? `(${minus(v)})` : String(v));
const rund = (v) => Math.round(v * 1e6) / 1e6;
const dez = (v) => minus(String(Math.round(v * 1000) / 1000).replace(".", ","));
const fallend = (p, k) => { let f = 1; for (let i = 0; i < k; i++) f *= p - i; return f; };
const fName = (k) => `f${STRICH[k]}`;
const zeilenGgT = (r) => r.reduce((g, v) => ggT(g, v), 0);

/* ---------- Ansätze ---------- */
const ANSAETZE = {
  p2: { art: "poly", grad: 2, vars: ["a", "b", "c"], pot: [2, 1, 0], formel: "ax^2 + bx + c", kurz: "Grad 2" },
  p3: { art: "poly", grad: 3, vars: ["a", "b", "c", "d"], pot: [3, 2, 1, 0], formel: "ax^3 + bx^2 + cx + d", kurz: "Grad 3" },
  p3u: { art: "poly", grad: 3, vars: ["a", "b"], pot: [3, 1], formel: "ax^3 + bx", kurz: "Grad 3, nur ungerade Exponenten" },
  p4g: { art: "poly", grad: 4, vars: ["a", "b", "c"], pot: [4, 2, 0], formel: "ax^4 + bx^2 + c", kurz: "Grad 4, nur gerade Exponenten" },
  p4: { art: "poly", grad: 4, vars: ["a", "b", "c", "d", "e"], pot: [4, 3, 2, 1, 0], formel: "ax^4 + bx^3 + cx^2 + dx + e", kurz: "Grad 4, allgemein" },
  exp: { art: "exp", vars: ["c", "a"], formel: "c·a^x", kurz: "Exponentialfunktion" },
  ek: { art: "ek", vars: ["c", "k"], formel: "c·e^{k·x}", kurz: "e-Funktion" },
  sin: { art: "sin", vars: ["a", "b", "c", "d"], formel: "a·sin(b·(x − c)) + d", kurz: "Sinusfunktion" },
};
const WAHL = { poly: ["p2", "p3", "p3u", "p4g", "p4"], adv: ["exp", "ek", "sin", "p3"] };
const GRADWORT = { 2: "zweiten", 3: "dritten", 4: "vierten" };

/* Terme des Ansatzes nach k-maligem Ableiten */
const polyTerme = (ans, k) => ans.vars
  .map((v, i) => ({ v, i, fac: fallend(ans.pot[i], k), pow: ans.pot[i] - k }))
  .filter((t) => t.pow >= 0 && t.fac !== 0);

function ableitungFormel(ans, k) {
  if (ans.art === "poly") {
    const t = polyTerme(ans, k);
    const s = t.map((x) => `${x.fac === 1 ? "" : x.fac}${x.v}${x.pow === 0 ? "" : x.pow === 1 ? "x" : `x^${x.pow}`}`).join(" + ");
    return `${fName(k)}(x) = ${s || "0"}`;
  }
  if (ans.art === "sin") return k === 0 ? "f(x) = a·sin(b·(x − c)) + d" : "f′(x) = a·b·cos(b·(x − c))";
  return `f(x) = ${ans.formel}`;
}

function einsetzFormel(ans, b) {
  const x = b.x;
  let mitte;
  if (ans.art === "poly") {
    mitte = polyTerme(ans, b.k).map((t) => `${t.fac === 1 ? "" : t.fac}${t.v}${t.pow === 0 ? "" : `·${zk(x)}${t.pow === 1 ? "" : `^${t.pow}`}`}`).join(" + ") || "0";
  } else if (ans.art === "exp") mitte = `c·a^{${minus(x)}}`;
  else if (ans.art === "ek") mitte = `c·e^{k·${zk(x)}}`;
  else mitte = b.k === 0 ? `a·sin(b·(${minus(x)} − c)) + d` : `a·b·cos(b·(${minus(x)} − c))`;
  return `${fName(b.k)}(${minus(x)}) = ${mitte} = ${minus(b.y)}`;
}

/* Zeile des LGS: Koeffizienten der Unbekannten + rechte Seite */
function zeileAus(ans, b) {
  const r = ans.vars.map(() => 0);
  polyTerme(ans, b.k).forEach((t) => { r[t.i] = t.fac * Math.pow(b.x, t.pow); });
  return [...r, b.y];
}

function detN(A) {
  const n = A.length, m = A.map((r) => [...r]);
  let d = 1;
  for (let j = 0; j < n; j++) {
    let p = j;
    for (let i = j + 1; i < n; i++) if (Math.abs(m[i][j]) > Math.abs(m[p][j])) p = i;
    if (Math.abs(m[p][j]) < 1e-12) return 0;
    if (p !== j) { [m[p], m[j]] = [m[j], m[p]]; d = -d; }
    d *= m[j][j];
    for (let i = j + 1; i < n; i++) { const f = m[i][j] / m[j][j]; for (let k = j; k < n; k++) m[i][k] -= f * m[j][k]; }
  }
  return d;
}

/* ---------- Eigenschaften → Bedingungen ---------- */
const ROLLEN = {
  punkt: "Punkt", null: "Nullstelle", yachse: "Schnittpunkt mit der y-Achse",
  hoch: "Hochpunkt", tief: "Tiefpunkt", scheitel: "Scheitelpunkt", wende: "Wendepunkt",
  wendeTang: "Wendepunkt mit Wendetangente", sattel: "Sattelpunkt", wstelle: "Wendestelle", tangente: "Punkt mit Tangentensteigung",
};

function bedingungen(props, abl) {
  const b = [];
  props.forEach((p, s) => {
    const add = (k, y) => b.push({ k, x: p.x, y: y === undefined ? abl(p.x, k) : y, s });
    switch (p.rolle) {
      case "punkt": case "null": case "yachse": add(0); break;
      case "hoch": case "tief": case "scheitel": add(0); add(1, 0); break;
      case "wende": add(0); add(2, 0); break;
      case "wendeTang": add(0); add(2, 0); add(1); break;
      case "sattel": add(0); add(1, 0); add(2, 0); break;
      case "wstelle": add(2, 0); break;
      case "tangente": add(0); add(1); break;
      default: break;
    }
  });
  return b;
}

/* Punkt als Formeltext, z. B. H(1 | 2) oder N_1(3 | 0) */
const lbl = (p) => `${p.name}${p.idx ? `_{${p.idx}}` : ""}(${dez(p.x)} | ${dez(p.y)})`;

/* ---------- Aufgaben: Polynome ---------- */
const extremWort = (p) => (p.rolle === "hoch" ? "Hochpunkt" : "Tiefpunkt");

const POLY_VORLAGEN = {
  2: [
    () => {
      const a = wahl([1, -1, 2, -2]), p = zz(-3, 3), q = zz(-4, 4), x1 = p + wahl([-2, -1, 1, 2, 3]);
      return { ansatz: "p2", koeff: [a, -2 * a * p, a * p * p + q], props: [{ rolle: "scheitel", name: "S", x: p }, { rolle: "punkt", name: "P", x: x1 }],
        satz: (P) => `Der Graph einer ganzrationalen Funktion zweiten Grades hat den Scheitelpunkt $${lbl(P[0])}$ und verläuft durch den Punkt $${lbl(P[1])}$.` };
    },
    () => {
      const xs = mischen([-3, -2, -1, 0, 1, 2, 3]).slice(0, 3).sort((u, v) => u - v);
      return { ansatz: "p2", koeff: [wahl([1, -1, 2, -2]), zz(-4, 4), zz(-5, 5)], props: xs.map((x, i) => ({ rolle: "punkt", name: "ABC"[i], x })),
        satz: (P) => `Der Graph einer ganzrationalen Funktion zweiten Grades verläuft durch die Punkte $${lbl(P[0])}$, $${lbl(P[1])}$ und $${lbl(P[2])}$.` };
    },
    () => {
      const [r1, r2] = mischen([-4, -3, -2, -1, 1, 2, 3, 4]).slice(0, 2).sort((u, v) => u - v), a = wahl([1, -1, 2, -2]);
      return { ansatz: "p2", koeff: [a, -a * (r1 + r2), a * r1 * r2],
        props: [{ rolle: "null", name: "N", idx: "1", x: r1 }, { rolle: "null", name: "N", idx: "2", x: r2 }, { rolle: "yachse", name: "S", idx: "y", x: 0 }],
        satz: (P) => `Eine ganzrationale Funktion zweiten Grades hat die Nullstellen $x_1 = ${minus(r1)}$ und $x_2 = ${minus(r2)}$. Ihr Graph schneidet die y-Achse bei $y = ${minus(P[2].y)}$.` };
    },
    () => {
      const x0 = zz(-2, 2), x1 = x0 + wahl([-3, -2, 2, 3]);
      return { ansatz: "p2", koeff: [wahl([1, -1, 2, -2]), zz(-4, 4), zz(-5, 5)], props: [{ rolle: "punkt", name: "P", x: x1 }, { rolle: "tangente", name: "Q", x: x0 }],
        satz: (P) => `Der Graph einer ganzrationalen Funktion zweiten Grades verläuft durch $${lbl(P[0])}$. Die Tangente im Punkt $${lbl(P[1])}$ hat die Steigung $m = ${minus(P[1].m)}$.` };
    },
  ],
  3: [
    () => {
      const a = wahl([1, -1, 2, -2]), diff = wahl(Math.abs(a) === 2 ? [2, 3, 4] : [2, 4]), p = zz(-3, 2), q = p + diff;
      return { ansatz: "p3", koeff: [a, (-3 * a * (p + q)) / 2, 3 * a * p * q, zz(-5, 5)], props: [{ rolle: "extrem", x: p }, { rolle: "extrem", x: q }],
        satz: (P) => { const h = P.find((r) => r.rolle === "hoch"), t = P.find((r) => r.rolle === "tief"); return `Der Graph einer ganzrationalen Funktion dritten Grades hat den Hochpunkt $${lbl(h)}$ und den Tiefpunkt $${lbl(t)}$.`; } };
    },
    () => {
      const a = wahl([1, -1, 2, -2]), diff = wahl(Math.abs(a) === 2 ? [2, 3, 4] : [2, 4]), p = zz(-3, 2), q = p + diff;
      return { ansatz: "p3", koeff: [a, (-3 * a * (p + q)) / 2, 3 * a * p * q, zz(-5, 5)], props: [{ rolle: "extrem", x: p }, { rolle: "extrem", x: q }],
        satz: (P) => { const h = P.find((r) => r.rolle === "hoch"), t = P.find((r) => r.rolle === "tief"); return `Der Graph einer ganzrationalen Funktion dritten Grades hat den Tiefpunkt $${lbl(t)}$ und den Hochpunkt $${lbl(h)}$.`; } };
    },
    () => {
      const a = wahl([1, -1]), w = zz(-2, 2), x1 = w + wahl([-2, -1, 1, 2]);
      return { ansatz: "p3", koeff: [a, -3 * a * w, zz(-4, 4), zz(-4, 4)], props: [{ rolle: "wendeTang", name: "W", x: w }, { rolle: "punkt", name: "P", x: x1 }],
        satz: (P) => `Der Graph einer ganzrationalen Funktion dritten Grades hat den Wendepunkt $${lbl(P[0])}$, die Wendetangente hat dort die Steigung $m = ${minus(P[0].m)}$. Außerdem verläuft der Graph durch $${lbl(P[1])}$.` };
    },
    () => {
      const a = wahl([1, -1, 2, -2]), s = zz(-2, 2), ys = zz(-3, 3), x1 = s + wahl([-2, -1, 1, 2]);
      return { ansatz: "p3", koeff: [a, -3 * a * s, 3 * a * s * s, -a * s * s * s + ys], props: [{ rolle: "sattel", name: "S", x: s }, { rolle: "punkt", name: "P", x: x1 }],
        satz: (P) => `Der Graph einer ganzrationalen Funktion dritten Grades hat im Punkt $${lbl(P[0])}$ einen Sattelpunkt und verläuft durch $${lbl(P[1])}$.` };
    },
    () => {
      const a = wahl([1, -1]), w = zz(-1, 2), p = w + wahl([-2, -1, 1, 2]);
      if (p === 0) return null;
      return { ansatz: "p3", koeff: [a, -3 * a * w, -3 * a * p * p + 6 * a * w * p, zz(-5, 5)],
        props: [{ rolle: "wstelle", name: "W", x: w }, { rolle: "extrem", x: p }, { rolle: "yachse", name: "S", idx: "y", x: 0 }],
        satz: (P) => `Eine ganzrationale Funktion dritten Grades hat an der Stelle $x = ${minus(w)}$ eine Wendestelle und im Punkt $${lbl(P[1])}$ einen ${extremWort(P[1])}. Ihr Graph schneidet die y-Achse bei $y = ${minus(P[2].y)}$.` };
    },
    () => {
      const a = wahl([1, -1, 2, -2]), p = wahl([1, 2, -1, -2]);
      return { ansatz: "p3u", koeff: [a, -3 * a * p * p], props: [{ rolle: "extrem", x: p }],
        satz: (P) => `Der Graph einer ganzrationalen Funktion dritten Grades ist punktsymmetrisch zum Ursprung und hat den ${extremWort(P[0])} $${lbl(P[0])}$.` };
    },
  ],
  4: [
    () => {
      const a = wahl([1, -1]), p = wahl([1, 2, -1, -2]);
      return { ansatz: "p4g", koeff: [a, -2 * a * p * p, zz(-4, 6)], props: [{ rolle: "extrem", x: p }, { rolle: "yachse", name: "S", idx: "y", x: 0 }],
        satz: (P) => `Der Graph einer ganzrationalen Funktion vierten Grades ist achsensymmetrisch zur y-Achse, hat den ${extremWort(P[0])} $${lbl(P[0])}$ und schneidet die y-Achse bei $y = ${minus(P[1].y)}$.` };
    },
    () => {
      const a = wahl([1, -1, 2, -2]), w = wahl([1, -1]), x1 = wahl([2, -2, 0]);
      return { ansatz: "p4g", koeff: [a, -6 * a, zz(-3, 5)], props: [{ rolle: "wende", name: "W", x: w }, { rolle: "punkt", name: "P", x: x1 }],
        satz: (P) => `Der Graph einer ganzrationalen Funktion vierten Grades ist achsensymmetrisch zur y-Achse, hat den Wendepunkt $${lbl(P[0])}$ und verläuft durch $${lbl(P[1])}$.` };
    },
  ],
};

function fertigPoly(v) {
  if (!v) return null;
  const ans = ANSAETZE[v.ansatz];
  if (v.koeff.some((c) => !Number.isInteger(c) || Math.abs(c) > 40) || v.koeff[0] === 0) return null;
  const abl = (x, k) => v.koeff.reduce((s, c, i) => { const p = ans.pot[i]; return p < k ? s : s + c * fallend(p, k) * Math.pow(x, p - k); }, 0);
  const props = v.props.map((p) => ({ ...p, y: abl(p.x, 0), m: abl(p.x, 1) }));
  for (const p of props) {
    if (p.rolle === "extrem") { const s = abl(p.x, 2); if (s === 0) return null; p.rolle = s < 0 ? "hoch" : "tief"; p.name = s < 0 ? "H" : "T"; }
    if ((p.rolle === "tangente" || p.rolle === "wendeTang") && p.m === 0) return null;
    if (Math.abs(p.y) > 40) return null;
  }
  const bed = bedingungen(props, abl);
  if (bed.length !== ans.vars.length) return null;
  const rows = bed.map((b) => zeileAus(ans, b));
  if (rows.flat().some((z) => Math.abs(z) > 300)) return null;
  if (Math.abs(detN(rows.map((r) => r.slice(0, -1)))) < 1e-9) return null;
  return { modus: "poly", ansatz: v.ansatz, koeff: v.koeff, props, bed, satz: v.satz(props), abl };
}

/* ---------- Aufgaben: Advanced ---------- */
const ADV_VORLAGEN = {
  exp: () => {
    const q = wahl([2, 3]), c = zz(1, 5), x1 = wahl([0, 1]), x2 = x1 + wahl([1, 2]);
    return { ansatz: "exp", koeff: [c, q], f: (x) => c * Math.pow(q, x),
      props: [{ rolle: "punkt", name: "P", x: x1 }, { rolle: "punkt", name: "Q", x: x2 }],
      satz: (P) => `Der Graph einer Exponentialfunktion verläuft durch die Punkte $${lbl(P[0])}$ und $${lbl(P[1])}$. Gesucht ist f in der Form $f(x) = c·a^x$.` };
  },
  ek: () => {
    const q = wahl([2, 3]), c = zz(1, 5), x1 = wahl([1, 2]);
    return { ansatz: "ek", koeff: [c, Math.log(q)], q, f: (x) => c * Math.pow(q, x),
      props: [{ rolle: "punkt", name: "P", x: 0 }, { rolle: "punkt", name: "Q", x: x1 }],
      satz: (P) => `Der Graph einer Exponentialfunktion verläuft durch die Punkte $${lbl(P[0])}$ und $${lbl(P[1])}$. Gesucht ist f in der Form $f(x) = c·e^{k·x}$.` };
  },
  sin: () => {
    const h = wahl([1, 2, 2, 3, 4]), A = zz(1, 3), d = zz(-1, 3), xH = zz(-1, 3), rechts = Math.random() < 0.5;
    const xT = rechts ? xH + h : xH - h, c = xH - h / 2;
    const H = { rolle: "hoch", name: "H", x: xH }, T = { rolle: "tief", name: "T", x: xT };
    return { ansatz: "sin", koeff: [A, Math.PI / h, c, d], h, f: (x) => A * Math.sin((Math.PI / h) * (x - c)) + d,
      props: Math.random() < 0.7 ? [H, T] : [T, H],
      satz: (P) => `Eine allgemeine Sinusfunktion hat den ${P[0].rolle === "hoch" ? "Hochpunkt" : "Tiefpunkt"} $${lbl(P[0])}$ und den benachbarten ${P[1].rolle === "hoch" ? "Hochpunkt" : "Tiefpunkt"} $${lbl(P[1])}$.` };
  },
};

function fertigAdv(v) {
  const abl = (x) => rund(v.f(x));
  const props = v.props.map((p) => ({ ...p, y: abl(p.x) }));
  if (props.some((p) => Math.abs(p.y) > 150)) return null;
  const bed = bedingungen(props, abl);
  return { modus: "adv", ansatz: v.ansatz, koeff: v.koeff, h: v.h, q: v.q, f: v.f, props, bed, satz: v.satz(props) };
}

export function aufgabeErzeugen(modus, sub) {
  for (let i = 0; i < 400; i++) {
    const a = modus === "poly" ? fertigPoly(wahl(POLY_VORLAGEN[sub])()) : fertigAdv(ADV_VORLAGEN[sub]());
    if (a) return a;
  }
  return fertigPoly({ ansatz: "p3", koeff: [1, -6, 9, -2], props: [{ rolle: "extrem", x: 1 }, { rolle: "extrem", x: 3 }],
    satz: (P) => `Der Graph einer ganzrationalen Funktion dritten Grades hat den Hochpunkt $${lbl(P[0])}$ und den Tiefpunkt $${lbl(P[1])}$.` });
}

/* Funktionsterm des Ergebnisses als Formeltext */
function polyFormel(k, pot) {
  let s = "";
  k.forEach((c, i) => {
    if (c === 0) return;
    const p = pot[i], b = Math.abs(c);
    const xt = p === 0 ? "" : p === 1 ? "x" : `x^${p}`;
    const zahl = b === 1 && p > 0 ? "" : String(b);
    s += s ? ` ${c < 0 ? "−" : "+"} ${zahl}${xt}` : `${c < 0 ? "−" : ""}${zahl}${xt}`;
  });
  return `f(x) = ${s || "0"}`;
}

const piBruch = (h) => (h === 1 ? "π" : `\\frac{π}{${h}}`);

function ergebnisFormel(auf, L) {
  const ans = ANSAETZE[auf.ansatz];
  if (ans.art === "poly") return polyFormel(L, ans.pot);
  if (ans.art === "exp") return `f(x) = ${L[0] === 1 ? "" : `${L[0]}·`}${L[1]}^x`;
  if (ans.art === "ek") return `f(x) = ${L[0] === 1 ? "" : `${L[0]}·`}e^{ln(${auf.q})·x}`;
  const [A, , c, d] = L;
  const innen = Math.abs(c) < 1e-9 ? "x" : `(x ${c > 0 ? "−" : "+"} ${dez(Math.abs(c))})`;
  return `f(x) = ${A === 1 ? "" : `${A}·`}sin(${piBruch(auf.h)}·${innen})${d === 0 ? "" : ` ${d > 0 ? "+" : "−"} ${Math.abs(d)}`}`;
}

/* ======================================================================
   LGS mit n Unbekannten — Bedienung wie im LGS-Werkzeug
   ====================================================================== */
class KombiFehler extends Error {}

function kombiLesen(text, n) {
  const s = String(text).replace(/[−–]/g, "-").replace(/[·*×]/g, "*").replace(/\s+/g, "").toUpperCase();
  if (!s) throw new KombiFehler("Die Zeile ist noch leer.");
  const namen = ROEM.slice(0, n).map((t, k) => [t, k]).sort((u, v) => v[0].length - u[0].length);
  let i = 0;
  const zahl = () => { let j = i; while (j < s.length && /[0-9]/.test(s[j])) j++; if (j === i) return null; const v = parseInt(s.slice(i, j), 10); i = j; return v; };
  const roem = () => { for (const [t, k] of namen) if (s.startsWith(t, i)) { i += t.length; return k; } return null; };
  const vec = (k) => Array.from({ length: n }, (_, j) => (j === k ? 1 : 0));
  const faktor = () => {
    if (s[i] === "(") { i++; const v = summe(); if (s[i] !== ")") throw new KombiFehler("Eine Klammer ist nicht geschlossen."); i++; return v; }
    const k = roem(); if (k !== null) return vec(k);
    throw new KombiFehler(`Hier fehlt eine Gleichung (${ROEM.slice(0, n).join(", ")}).`);
  };
  const term = () => {
    const z = zahl();
    if (z !== null) {
      if (s[i] === "*") i++;
      if (i >= s.length || !(s[i] === "(" || s[i] === "I")) throw new KombiFehler("Nach einer Zahl muss eine Gleichung kommen, z. B. 3·II.");
      return faktor().map((v) => v * z);
    }
    return faktor();
  };
  const summe = () => {
    let vz = 1;
    if (s[i] === "+" || s[i] === "-") { vz = s[i] === "-" ? -1 : 1; i++; }
    let v = term().map((x) => x * vz);
    while (s[i] === "+" || s[i] === "-") { const f = s[i] === "-" ? -1 : 1; i++; const t = term(); v = v.map((x, j) => x + f * t[j]); }
    return v;
  };
  const v = summe();
  let teiler = 1;
  if (s[i] === ":" || s[i] === "/") { i++; const t = zahl(); if (!t) throw new KombiFehler("Nach „:“ gehört eine Zahl ungleich 0."); teiler = t; }
  if (i < s.length) throw new KombiFehler(`„${minus(s.slice(i))}“ verstehe ich nicht.`);
  if (v.every((x) => x === 0)) throw new KombiFehler("Diese Kombination ergibt 0 = 0 — da geht alle Information verloren.");
  return { vec: v, teiler };
}

function kombiAnwenden(rows, text, n) {
  const { vec, teiler } = kombiLesen(text, n);
  const r = Array.from({ length: n + 1 }, (_, j) => vec.reduce((s, c, k) => s + c * rows[k][j], 0));
  if (r.some((v) => v % teiler !== 0)) throw new KombiFehler(`Nicht alle Zahlen sind durch ${teiler} teilbar.`);
  const erg = r.map((v) => v / teiler);
  if (erg.slice(0, n).every((v) => v === 0)) throw new KombiFehler(erg[n] === 0 ? "Hier bleibt nur 0 = 0 übrig — diese Gleichung trägt keine Information mehr." : `Widerspruch 0 = ${minus(erg[n])} — da ist etwas schiefgelaufen.`);
  return { row: erg, vec };
}

/* Formel mit festen Leerzeichen: In der Flex-Darstellung von M gingen sonst
   die Leerzeichen nach einem Exponenten verloren („ax²+ bx“). */
const F = ({ t }) => (
  <span style={{ display: "inline-block", width: "max-content", maxWidth: "none", verticalAlign: "middle" }}>
    <M t={String(t).replace(/ /g, "\u00a0")} />
  </span>
);

const Var = ({ v }) => <i style={{ fontStyle: "italic", fontWeight: 600 }}>{v}</i>;

function termTeil(c, v, erster) {
  if (c === 0) return null;
  const b = Math.abs(c), k = b === 1 ? "" : String(b);
  if (erster) return <>{c < 0 ? "−" : ""}{k}<Var v={v} /></>;
  return <><span style={{ margin: "0 0.28em 0 0" }}>{c < 0 ? "−" : "+"}</span>{k}<Var v={v} /></>;
}

function GlText({ row, vars }) {
  const n = vars.length;
  let erster = true;
  const teile = [];
  row.slice(0, n).forEach((c, j) => {
    if (c === 0) return;
    teile.push(<React.Fragment key={j}>{!erster && " "}{termTeil(c, vars[j], erster)}</React.Fragment>);
    erster = false;
  });
  return <span style={{ whiteSpace: "nowrap" }}>{teile}{" = "}{minus(row[n])}</span>;
}

function SystemBlock({ rows, vars, labels = ROEM, notizen, neu }) {
  const n = vars.length;
  return (
    <div className={neu ? "sb-neu" : ""} style={{ display: "grid", gridTemplateColumns: `auto repeat(${n}, auto) auto auto auto`, columnGap: 7, rowGap: 6, alignItems: "center", width: "max-content" }}>
      {rows.map((r, i) => {
        const ersterIdx = r.slice(0, n).findIndex((c) => c !== 0);
        return (
          <React.Fragment key={i}>
            <span style={{ fontSize: "0.68em", fontWeight: 700, color: C.hellgrau, minWidth: 20, letterSpacing: "0.02em" }}>{labels[i]}</span>
            {vars.map((v, j) => (
              <span key={j} style={{ textAlign: "right", whiteSpace: "nowrap", minWidth: "2.2em" }}>{termTeil(r[j], v, j === ersterIdx)}</span>
            ))}
            <span style={{ color: C.grau }}>=</span>
            <span style={{ textAlign: "right", minWidth: "1.6em", whiteSpace: "nowrap" }}>{minus(r[n])}</span>
            <span style={{ paddingLeft: notizen && notizen[i] ? 10 : 0, borderLeft: notizen && notizen[i] ? `1.5px solid ${C.hellgrau}` : "none",
              color: C.gruen, fontWeight: 600, fontSize: "0.74em", whiteSpace: "nowrap" }}>
              {notizen && notizen[i] ? minus(notizen[i]) : ""}
            </span>
          </React.Fragment>
        );
      })}
    </div>
  );
}

function geloest(rows, n) {
  const vs = rows.map((r) => { const nz = r.slice(0, n).map((c, j) => (c !== 0 ? j : -1)).filter((j) => j >= 0); return nz.length === 1 ? nz[0] : -1; });
  return vs.every((v) => v >= 0) && new Set(vs).size === n ? vs : null;
}

function eliminiere(a, p, j, nameA, nameP) {
  const ca = a[j], cp = p[j], l = kgV(ca, cp);
  let ma = l / ca, mp = l / cp;
  if (ma < 0) { ma = -ma; mp = -mp; }
  const row = a.map((v, k) => ma * v - mp * p[k]);
  const g = zeilenGgT(row), gg = g > 1 ? g : 1;
  const teil = (m, nm, erster) => {
    if (m === 0) return "";
    const b = Math.abs(m), s = `${b === 1 ? "" : `${b}·`}${nm}`;
    return erster ? (m < 0 ? `−${s}` : s) : (m < 0 ? ` − ${s}` : ` + ${s}`);
  };
  let notiz = teil(ma, nameA, true) + teil(-mp, nameP, false);
  if (gg > 1) notiz = `(${notiz}) : ${gg}`;
  return { row: row.map((v) => v / gg), notiz };
}

function aufloesen(row, j, bekannt, vars) {
  const n = vars.length;
  const rest = vars.map((_, k) => k).filter((k) => k !== j && row[k] !== 0);
  const zeilen = [];
  let rechts = row[n];
  if (rest.length) {
    zeilen.push(<>{termTeil(row[j], vars[j], true)}{rest.map((k) => (
      <React.Fragment key={k}> {row[k] < 0 ? "−" : "+"} {Math.abs(row[k]) === 1 ? "" : `${Math.abs(row[k])}·`}{zk(bekannt[k])}</React.Fragment>
    ))}{" = "}{minus(row[n])}</>);
    const summe = rest.reduce((s, k) => s + row[k] * bekannt[k], 0);
    rechts = row[n] - summe;
    if (summe !== 0) zeilen.push(<>{termTeil(row[j], vars[j], true)} {summe < 0 ? "−" : "+"} {Math.abs(summe)}{" = "}{minus(row[n])}</>);
    if (row[j] !== 1) zeilen.push(<>{termTeil(row[j], vars[j], true)}{" = "}{minus(rechts)}</>);
  } else if (row[j] !== 1) zeilen.push(<>{termTeil(row[j], vars[j], true)}{" = "}{minus(row[n])}</>);
  const wert = rechts / row[j];
  zeilen.push(<b style={{ color: C.see }}><Var v={vars[j]} /> = {minus(wert)}</b>);
  return { wert, zeilen };
}

/* Gauß-Verfahren für n Unbekannte: Treppenform, dann rückwärts einsetzen */
function gaussWeg(start, vars) {
  const n = vars.length;
  let R = start.map((r) => [...r]);
  const schritte = [];
  for (let j = 0; j < n - 1; j++) {
    let p = -1;
    for (let i = j; i < n; i++) if (R[i][j] !== 0 && (p < 0 || Math.abs(R[i][j]) < Math.abs(R[p][j]))) p = i;
    if (p < 0) continue;
    const reihen = [...Array(j).keys(), p, ...Array.from({ length: n - j }, (_, k) => j + k).filter((i) => i !== p)];
    let geaendert = p !== j;
    const neu = [], notiz = [];
    reihen.forEach((i, pos) => {
      if (pos <= j || R[i][j] === 0) { neu.push(R[i]); notiz.push(ROEM[i]); }
      else { const e = eliminiere(R[i], R[p], j, ROEM[i], ROEM[p]); neu.push(e.row); notiz.push(e.notiz); geaendert = true; }
    });
    if (geaendert) schritte.push({ titel: `${vars[j]} aus den Gleichungen darunter eliminieren`, rows: neu, notizen: notiz });
    R = neu;
  }
  const bekannt = {}, rueck = [];
  for (let j = n - 1; j >= 0; j--) {
    const r = aufloesen(R[j], j, bekannt, vars);
    bekannt[j] = r.wert;
    rueck.push({ titel: j === n - 1 ? `${ROEM[j]} nach ${vars[j]} auflösen` : `In ${ROEM[j]} einsetzen und nach ${vars[j]} auflösen`, zeilen: r.zeilen });
  }
  return { schritte, rueck, loesung: vars.map((_, j) => bekannt[j]) };
}

/* ---------- UI-Bausteine ---------- */
const SB_CSS = `
.sb-taste{transition:transform .08s ease, background .12s ease}
.sb-taste:active{transform:scale(.94)}
@media (hover:hover){.sb-taste:hover{filter:brightness(0.97)}}
.sb-neu{animation:sbNeu .38s cubic-bezier(.2,.7,.3,1) both}
@keyframes sbNeu{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.sb-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}
.sb-scroll::-webkit-scrollbar{height:4px}.sb-scroll::-webkit-scrollbar-thumb{background:${C.linie};border-radius:4px}
.sb-blink{animation:sbBlink 1s step-end infinite}
@keyframes sbBlink{50%{opacity:0}}
`;

const karte = { background: C.weiss, borderRadius: 18, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" };
const kicker = { fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", color: C.hellgrau };
const blauVerlauf = `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`;

const Taste = ({ label, ton, onClick, breit, aria }) => (
  <button type="button" className="sb-taste" aria-label={aria || (typeof label === "string" ? label : undefined)} onClick={onClick}
    style={{ gridColumn: breit ? "span 2" : "auto", height: 48, borderRadius: 14, fontFamily: "inherit", cursor: "pointer", padding: 0,
      fontSize: ton === "aktion" ? 15 : ton === "gl" ? 16 : 19, fontWeight: ton === "aktion" || ton === "gl" ? 700 : 500,
      background: ton === "aktion" ? C.gruen : ton === "gl" ? blauVerlauf : ton === "op" ? "#F1F4FA" : C.weiss,
      color: ton === "aktion" ? C.weiss : ton === "gl" ? C.flaggold : C.tinte,
      border: `1px solid ${ton === "aktion" ? C.gruen : ton === "gl" ? C.seeTief : C.linie}`,
      boxShadow: ton === "aktion" ? "0 4px 14px rgba(165,0,68,0.25)" : "0 1px 0 rgba(15,26,51,0.04)",
      display: "flex", alignItems: "center", justifyContent: "center" }}>
    {label}
  </button>
);

const LoeschIcon = <svg width="24" height="18" viewBox="0 0 24 18" aria-hidden="true"><path d="M8 1h13a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8L1 9z" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinejoin="round" /><path d="M11 6l6 6M17 6l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>;

const Pille = ({ aktiv, onClick, children }) => (
  <button type="button" onClick={onClick}
    style={{ border: "none", borderRadius: 999, padding: "7px 13px", fontFamily: "inherit", cursor: "pointer", fontSize: 13, whiteSpace: "nowrap",
      fontWeight: aktiv ? 600 : 400, background: aktiv ? C.weiss : "transparent", color: aktiv ? C.see : C.grau, boxShadow: aktiv ? "0 1px 6px rgba(15,26,51,0.12)" : "none" }}>
    {children}
  </button>
);

const Knopf = ({ onClick, children, leise }) => (
  <button type="button" onClick={onClick} className="sb-taste"
    style={{ marginTop: 16, background: leise ? "none" : C.gruen, color: leise ? C.see : C.weiss, border: leise ? `1px solid ${C.linie}` : "none",
      borderRadius: 999, padding: "11px 22px", fontSize: 14.5, fontWeight: 600, fontFamily: "inherit", cursor: "pointer",
      boxShadow: leise ? "none" : "0 4px 14px rgba(165,0,68,0.22)" }}>
    {children}
  </button>
);

function Schritt({ nr, titel, fertig, scrollen, children }) {
  const ref = useRef(null);
  useEffect(() => {
    if (scrollen && ref.current) { try { ref.current.scrollIntoView({ behavior: "smooth", block: "start" }); } catch (e) { /* egal */ } }
  }, []);
  return (
    <div ref={ref} className="sb-neu" style={{ ...karte, padding: "18px 20px 20px", marginTop: 16, scrollMarginTop: 72 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 14 }}>
        <span aria-hidden="true" style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center",
          background: fertig ? C.smaragd : blauVerlauf, color: fertig ? C.weiss : C.flaggold, fontSize: 13.5, fontWeight: 700 }}>
          {fertig ? "✓" : nr}
        </span>
        <h3 style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.25, color: C.tinte }}>{titel}</h3>
      </div>
      {children}
    </div>
  );
}

const Erklaer = ({ children, style }) => (
  <p style={{ color: C.grau, fontSize: 14.5, fontWeight: 300, lineHeight: 1.7, marginBottom: 12, ...style }}>{children}</p>
);

/* ======================================================================
   Schritt 1: Ansatz
   ====================================================================== */
function ansatzHinweis(id, auf) {
  const soll = auf.ansatz, g = ANSAETZE[id], s = ANSAETZE[soll];
  if (s.art === "poly") {
    if (g.art !== "poly") return "Gesucht ist eine ganzrationale Funktion – also ein Polynom mit Potenzen von x.";
    if (g.grad !== s.grad) return `Der Text spricht von einer Funktion ${GRADWORT[s.grad]} Grades – der höchste Exponent muss ${s.grad} sein.`;
    if (soll === "p3u") return "Fast! Punktsymmetrie zum Ursprung heißt: Es kommen nur ungerade Exponenten vor. Die Terme mit x² und die Konstante fallen weg – zwei Unbekannte weniger.";
    if (soll === "p4g") return "Fast! Achsensymmetrie zur y-Achse heißt: Es kommen nur gerade Exponenten vor. Die Terme mit x³ und x fallen weg – das spart zwei Unbekannte.";
    if (id === "p3u") return "Nur ungerade Exponenten passen bloß, wenn der Graph punktsymmetrisch zum Ursprung ist – davon steht nichts im Text.";
    if (id === "p4g") return "Nur gerade Exponenten passen bloß, wenn der Graph achsensymmetrisch zur y-Achse ist – davon steht nichts im Text.";
  }
  if (g.art === "poly") return "Gesucht ist keine ganzrationale Funktion – lies nach, welcher Funktionstyp im Text steht.";
  if (s.art === "sin") return "Hoch- und Tiefpunkte im Wechsel, Amplitude und Periode – hier ist eine Sinusfunktion gesucht.";
  return `Im Text steht, in welcher Form f gesucht ist: $f(x) = ${s.formel}$.`;
}

function AnsatzSchritt({ auf, gewaehlt, setGewaehlt }) {
  const [falsch, setFalsch] = useState(null);
  const liste = WAHL[auf.modus];
  if (gewaehlt) {
    const ans = ANSAETZE[gewaehlt];
    return (
      <>
        <div className="sb-scroll" style={{ fontSize: 19, fontWeight: 600, color: C.tinte }}><F t={`f(x) = ${ans.formel}`} /></div>
        <Erklaer style={{ marginTop: 10, marginBottom: 0 }}>
          {ans.vars.length} Unbekannte ({ans.vars.join(", ")}) – du brauchst also <b style={{ fontWeight: 600, color: C.tinte }}>{ans.vars.length} Bedingungen</b>, die du aus dem Text liest.
        </Erklaer>
      </>
    );
  }
  return (
    <>
      <Erklaer>Die erste Frage ist immer: Welche Struktur hat die gesuchte Funktion? Lies den Steckbrief darunter und wähle den passenden Ansatz.</Erklaer>
      <div style={{ display: "grid", gap: 8 }}>
        {liste.map((id) => {
          const ans = ANSAETZE[id], rot = falsch === id;
          return (
            <button key={id} type="button" className="sb-taste" onClick={() => { if (id === auf.ansatz) { setGewaehlt(id); setFalsch(null); } else setFalsch(id); }}
              style={{ textAlign: "left", fontFamily: "inherit", cursor: "pointer", padding: "11px 14px", borderRadius: 14, background: rot ? "#FBF1EC" : C.weiss,
                border: `1.5px solid ${rot ? C.signal : C.linie}`, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 16.5, fontWeight: 600, color: C.tinte }}><F t={`f(x) = ${ans.formel}`} /></span>
              <span style={{ fontSize: 12, color: C.grau, fontWeight: 300, marginLeft: "auto" }}>{ans.kurz}</span>
            </button>
          );
        })}
      </div>
      {falsch && <div role="status" className="sb-neu"><Text s={ansatzHinweis(falsch, auf)} style={{ fontSize: 13.5, lineHeight: 1.6, marginTop: 12, color: C.signal, fontWeight: 500 }} /></div>}
    </>
  );
}

/* ======================================================================
   Schritt 2: Bedingungen aufstellen
   ====================================================================== */
const zahlLesen = (s) => (/^−?\d+$/.test(s) ? parseInt(s.replace("−", "-"), 10) : null);

function bedingungsHinweis(r, auf) {
  const B = auf.bed, P = auf.props;
  if (r.k === 0 && B.some((b) => b.k === 0 && b.x === r.y && b.y === r.x && r.x !== r.y)) return "x und y vertauscht? In f(x) = y steht in der Klammer die x-Koordinate.";
  const gleicheStelle = B.filter((b) => b.k === r.k && b.x === r.x);
  if (gleicheStelle.length) {
    if (r.k === 0) return `An der Stelle x = ${minus(r.x)} gehört ein anderer Funktionswert hin – lies die y-Koordinate im Text nach.`;
    const p = P[gleicheStelle[0].s];
    if (r.k === 1 && ["hoch", "tief", "scheitel", "sattel"].includes(p.rolle)) return `Am ${ROLLEN[p.rolle]} ist die Steigung null: f′(${minus(r.x)}) = 0.`;
    if (r.k === 2) return `An einer Wendestelle ist die zweite Ableitung null: f″(${minus(r.x)}) = 0.`;
    return `Die Steigung an der Stelle x = ${minus(r.x)} stimmt nicht – sie steht im Text.`;
  }
  if (r.k === 1 && r.y === 0 && P.some((p) => p.x === r.x && ["wende", "wstelle"].includes(p.rolle))) return "An einer Wendestelle ist nicht f′, sondern f″ gleich null.";
  if (r.k === 2 && r.y === 0 && P.some((p) => p.x === r.x && ["hoch", "tief", "scheitel"].includes(p.rolle))) return "An einer Extremstelle ist f′ gleich null, nicht f″.";
  if (auf.modus === "adv" && r.k === 2) return "Für diese Aufgabe brauchst du keine zweite Ableitung.";
  return "Diese Bedingung steckt so nicht im Text.";
}

function fehltHinweis(b, auf) {
  const p = auf.props[b.s];
  const was = p.rolle === "yachse" ? `Der Schnittpunkt mit der y-Achse (0 | ${minus(p.y)})`
    : p.rolle === "null" ? `Die Nullstelle bei x = ${minus(p.x)}`
    : p.rolle === "wstelle" ? `Die Wendestelle bei x = ${minus(p.x)}`
    : `Der ${ROLLEN[p.rolle]} ${p.name}(${dez(p.x)} | ${dez(p.y)})`;
  if (b.k === 0) return `${was} liegt auf dem Graphen – das ist eine Bedingung für f.`;
  if (b.k === 1 && b.y === 0) return `${was}: Dort verläuft der Graph waagrecht – das liefert eine Bedingung für f′.`;
  if (b.k === 1) return `${was}: Die Steigung ist gegeben – das ist eine Bedingung für f′.`;
  return `${was}: Dort wechselt die Krümmung – das liefert eine Bedingung für f″.`;
}

function BedingungsSchritt({ auf, fertig, onFertig }) {
  const n = auf.bed.length;
  const maxK = auf.modus === "adv" ? 1 : 2;
  const leer = () => Array.from({ length: n }, () => ({ k: null, x: "", y: "" }));
  const [zeilen, setZeilen] = useState(leer);
  const [aktiv, setAktiv] = useState({ z: 0, s: "x" });
  const [status, setStatus] = useState(() => Array(n).fill(null));
  const [hinweise, setHinweise] = useState([]);

  const aendern = (fn) => {
    setZeilen((alt) => alt.map((z, i) => (i === aktiv.z ? fn(z) : z)));
    setStatus((st) => st.map((v, i) => (i === aktiv.z ? null : v)));
    setHinweise([]);
  };
  const setK = (k) => { aendern((z) => ({ ...z, k })); if (!zeilen[aktiv.z].x) setAktiv({ z: aktiv.z, s: "x" }); };
  const ziffer = (d) => aendern((z) => { const v = z[aktiv.s]; return v.replace("−", "").length >= 3 ? z : { ...z, [aktiv.s]: v + d }; });
  const vorzeichen = () => aendern((z) => { const v = z[aktiv.s]; return { ...z, [aktiv.s]: v.startsWith("−") ? v.slice(1) : `−${v}` }; });
  const loeschen = () => {
    const z = zeilen[aktiv.z];
    if (z[aktiv.s]) { aendern((zz2) => ({ ...zz2, [aktiv.s]: zz2[aktiv.s].slice(0, -1) })); return; }
    if (aktiv.s === "y") { setAktiv({ z: aktiv.z, s: "x" }); return; }
    if (z.k !== null) { aendern((zz2) => ({ ...zz2, k: null })); return; }
    if (aktiv.z > 0) setAktiv({ z: aktiv.z - 1, s: "y" });
  };
  const weiter = () => {
    if (aktiv.s === "x") setAktiv({ z: aktiv.z, s: "y" });
    else if (aktiv.z < n - 1) setAktiv({ z: aktiv.z + 1, s: "x" });
  };

  const pruefen = () => {
    const parsed = zeilen.map((z) => ({ k: z.k, x: zahlLesen(z.x), y: zahlLesen(z.y) }));
    const unvoll = parsed.findIndex((r) => r.k === null || r.x === null || r.y === null);
    if (unvoll >= 0) {
      setAktiv({ z: unvoll, s: parsed[unvoll].x === null ? "x" : "y" });
      setHinweise([`Bedingung ${ROEM[unvoll]} ist noch nicht vollständig: Wähle f, f′ oder f″ und trage x-Wert und Ergebnis ein.`]);
      return;
    }
    const offen = [...auf.bed];
    const st = parsed.map((r) => {
      const i = offen.findIndex((b) => b.k === r.k && b.x === r.x && b.y === r.y);
      if (i >= 0) { offen.splice(i, 1); return "ok"; }
      return auf.bed.some((b) => b.k === r.k && b.x === r.x && b.y === r.y) ? "doppelt" : "falsch";
    });
    setStatus(st);
    if (st.every((s) => s === "ok")) { setHinweise([]); onFertig(parsed); return; }
    const h = [];
    parsed.forEach((r, i) => {
      if (st[i] === "doppelt") h.push(`${ROEM[i]}: Diese Bedingung hast du schon – jede Information zählt nur einmal.`);
      if (st[i] === "falsch") h.push(`${ROEM[i]}: ${bedingungsHinweis(r, auf)}`);
    });
    if (offen.length) h.push(`Tipp: ${fehltHinweis(offen[0], auf)}`);
    setHinweise(h);
  };

  const aufdecken = () => {
    const z = auf.bed.map((b) => ({ k: b.k, x: minus(b.x), y: minus(b.y) }));
    setZeilen(z); setStatus(Array(n).fill(null)); setHinweise([]);
  };

  if (fertig) {
    return (
      <div className="sb-scroll" style={{ fontSize: 17, lineHeight: 2, color: C.tinte, fontWeight: 500 }}>
        {fertig.map((r, i) => (
          <div key={i} style={{ whiteSpace: "nowrap" }}>
            <span style={{ display: "inline-block", width: 34, fontSize: 12, fontWeight: 700, color: C.hellgrau }}>{ROEM[i]}</span>
            <F t={`${fName(r.k)}(${minus(r.x)}) = ${minus(r.y)}`} />
          </div>
        ))}
      </div>
    );
  }

  const Slot = ({ i, s }) => {
    const v = zeilen[i][s], an = aktiv.z === i && aktiv.s === s;
    return (
      <span role="button" tabIndex={0} aria-label={`${s === "x" ? "x-Wert" : "Ergebnis"} von Bedingung ${ROEM[i]}`}
        onClick={(e) => { e.stopPropagation(); setAktiv({ z: i, s }); }}
        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: "1.7em", padding: "0 0.2em", height: "1.45em", borderRadius: 7,
          background: an ? "#E6EEF9" : v ? "transparent" : "#F1F4FA", border: `1.5px solid ${an ? C.see : v ? "transparent" : C.linie}`, cursor: "pointer" }}>
        {v}{an && <span className="sb-blink" style={{ color: C.see, fontWeight: 300, marginLeft: 1 }}>|</span>}
      </span>
    );
  };

  return (
    <>
      <Erklaer>
        Übersetze jede Eigenschaft in Bedingungen der Form <b style={{ fontWeight: 600, color: C.tinte }}>f(x) = y</b>, <b style={{ fontWeight: 600, color: C.tinte }}>f′(x) = m</b>
        {maxK === 2 && <> oder <b style={{ fontWeight: 600, color: C.tinte }}>f″(x) = 0</b></>}. Tippe eine Zeile an und baue sie mit den Tasten.
      </Erklaer>
      {zeilen.map((z, i) => {
        const an = aktiv.z === i, st = status[i];
        const rand = st === "ok" ? C.smaragd : st ? C.signal : an ? C.see : C.linie;
        return (
          <div key={i} role="button" tabIndex={0} onClick={() => setAktiv({ z: i, s: z.x && an ? aktiv.s : z.x ? "y" : "x" })}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", marginBottom: 8, minHeight: 54, borderRadius: 14, cursor: "pointer",
              background: an ? C.sand : C.weiss, border: `1.5px solid ${rand}` }}>
            <span style={{ width: 30, fontSize: 13, fontWeight: 700, color: C.hellgrau }}>{ROEM[i]}</span>
            <span style={{ flex: 1, fontSize: 20, fontWeight: 600, color: C.tinte, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 2 }}>
              <span style={{ color: z.k === null ? C.hellgrau : C.gruen, fontStyle: "italic", minWidth: "1.1em" }}>{z.k === null ? "f?" : fName(z.k)}</span>
              (<Slot i={i} s="x" />)<span style={{ margin: "0 0.35em", color: C.grau }}>=</span><Slot i={i} s="y" />
            </span>
            {st && <span aria-hidden="true" style={{ fontSize: 15, fontWeight: 700, color: st === "ok" ? C.smaragd : C.signal }}>{st === "ok" ? "✓" : "✗"}</span>}
          </div>
        );
      })}

      {hinweise.length > 0 && (
        <div role="status" className="sb-neu" style={{ margin: "4px 2px 10px" }}>
          {hinweise.map((h, i) => <p key={i} style={{ fontSize: 13.5, lineHeight: 1.6, color: h.startsWith("Tipp") ? C.see : C.signal, fontWeight: h.startsWith("Tipp") ? 400 : 500, marginBottom: 4 }}>{h}</p>)}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 7, marginTop: 6 }}>
        <Taste ton="gl" label="f" aria="f" onClick={() => setK(0)} />
        <Taste ton="gl" label="f′" aria="f Strich" onClick={() => setK(1)} />
        {maxK === 2 ? <Taste ton="gl" label="f″" aria="f zwei Strich" onClick={() => setK(2)} /> : <span />}
        <Taste ton="op" label="±" aria="Vorzeichen" onClick={vorzeichen} />
        <Taste ton="op" breit aria="Zeichen löschen" label={LoeschIcon} onClick={loeschen} />
        {["7", "8", "9", "4", "5", "6"].map((d) => <Taste key={d} label={d} onClick={() => ziffer(d)} />)}
        {["1", "2", "3", "0"].map((d) => <Taste key={d} label={d} onClick={() => ziffer(d)} />)}
        <Taste ton="op" breit label={<span style={{ fontSize: 14, fontWeight: 600 }}>weiter →</span>} aria="nächstes Feld" onClick={weiter} />
      </div>

      <div className="flex items-center flex-wrap" style={{ gap: 10, marginTop: 4 }}>
        <Knopf onClick={pruefen}>Bedingungen prüfen</Knopf>
        <button type="button" onClick={aufdecken}
          style={{ marginTop: 16, background: "none", border: "none", color: C.see, fontSize: 13, fontWeight: 500, fontFamily: "inherit", cursor: "pointer", padding: "4px 2px" }}>
          Bedingungen aufdecken
        </button>
      </div>
    </>
  );
}

/* ======================================================================
   Schritt 3 & 4: Einsetzen und Ausmultiplizieren
   ====================================================================== */
function EinsetzSchritt({ auf, zeilen }) {
  const ans = ANSAETZE[auf.ansatz];
  const ords = [...new Set([0, ...zeilen.map((r) => r.k)])].sort();
  return (
    <>
      <Erklaer>{ords.length > 1 ? "Die Bedingungen brauchen diese Ableitungen des Ansatzes:" : "Der Ansatz:"}</Erklaer>
      <div className="sb-scroll" style={{ fontSize: 16.5, lineHeight: 2.1, color: C.tinte, marginBottom: 12 }}>
        {ords.map((k) => <div key={k} style={{ whiteSpace: "nowrap" }}><F t={ableitungFormel(ans, k)} /></div>)}
      </div>
      <Erklaer>Jetzt in jeder Bedingung den x-Wert einsetzen:</Erklaer>
      <div className="sb-scroll" style={{ fontSize: 16.5, lineHeight: 2.2, color: C.tinte }}>
        {zeilen.map((r, i) => (
          <div key={i} style={{ whiteSpace: "nowrap" }}>
            <span style={{ display: "inline-block", width: 34, fontSize: 12, fontWeight: 700, color: C.hellgrau }}>{ROEM[i]}</span>
            <F t={einsetzFormel(ans, r)} />
          </div>
        ))}
      </div>
    </>
  );
}

function AusmultSchritt({ auf, rows }) {
  const ans = ANSAETZE[auf.ansatz];
  return (
    <>
      <Erklaer>Potenzen ausrechnen und zusammenfassen – übrig bleibt ein lineares Gleichungssystem für {ans.vars.join(", ")}:</Erklaer>
      <div className="sb-scroll">
        <div style={{ fontSize: "clamp(14.5px, 4.2vw, 18px)", color: C.tinte, fontWeight: 500, paddingBottom: 4 }}>
          <SystemBlock rows={rows} vars={ans.vars} neu />
        </div>
      </div>
    </>
  );
}

/* ======================================================================
   Schritt 5 (Polynome): LGS lösen
   ====================================================================== */
function Rueckwaerts({ rueck }) {
  return (
    <div style={{ marginTop: 12 }}>
      {rueck.map((r, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: C.hellgrau, letterSpacing: "0.04em", marginBottom: 3 }}>{r.titel}</p>
          <div className="sb-scroll" style={{ fontSize: 16, lineHeight: 1.9, color: C.tinte }}>
            {r.zeilen.map((z, k) => <div key={k} style={{ whiteSpace: "nowrap" }}>{k > 0 && <span style={{ color: C.hellgrau, marginRight: 6 }}>⇒</span>}{z}</div>)}
          </div>
        </div>
      ))}
    </div>
  );
}

function LGSSchritt({ start, vars, onGeloest }) {
  const n = vars.length, NAMEN = ROEM.slice(0, n);
  const [bloecke, setBloecke] = useState([{ rows: start, notizen: null }]);
  const [felder, setFelder] = useState(NAMEN);
  const [frisch, setFrisch] = useState(() => Array(n).fill(true));
  const [aktiv, setAktiv] = useState(0);
  const [meldung, setMeldung] = useState(null);
  const [muster, setMuster] = useState(false);
  const gemeldet = useRef(false);
  const heftRef = useRef(null);

  const aktuell = bloecke[bloecke.length - 1].rows;
  const fertig = geloest(aktuell, n);
  const schritte = bloecke.length - 1;
  const L = fertig ? vars.map((_, v) => { const i = fertig.indexOf(v); return aktuell[i][n] / aktuell[i][v]; }) : null;

  useEffect(() => { if (fertig && !gemeldet.current) { gemeldet.current = true; onGeloest(L, "selbst"); } }, [!!fertig]);

  const vorschau = felder.map((f) => {
    try { return { ok: true, ...kombiAnwenden(aktuell, f, n) }; }
    catch (e) { return { ok: false, fehler: e instanceof KombiFehler ? e.message : "Nicht lesbar." }; }
  });

  const tippe = (w) => {
    setMeldung(null);
    const ersetzen = frisch[aktiv] && /^[0-9I(]/.test(w);
    setFrisch((alt) => alt.map((v, i) => (i === aktiv ? false : v)));
    setFelder((alt) => alt.map((f0, i) => {
      if (i !== aktiv) return f0;
      const f = ersetzen ? "" : f0;
      if (NAMEN.includes(w) && /[0-9]$/.test(f)) return `${f}·${w}`;
      if (NAMEN.includes(w) && /[IV]$/.test(f)) return `${f} + ${w}`;
      if (["+", "−"].includes(w)) return `${f} ${w} `;
      if (w === ":") return f.trim() && !/^\(.*\)$/.test(f.trim()) && /[+−-]/.test(f.trim().slice(1)) ? `(${f.trim()}) : ` : `${f} : `;
      return f + w;
    }));
  };
  const zurueck = () => { setFrisch((a) => a.map((v, i) => (i === aktiv ? false : v))); setFelder((alt) => alt.map((f, i) => (i === aktiv ? f.replace(/\s+$/, "").slice(0, -1).replace(/\s+$/, "").replace(/·$/, "") : f))); };
  const leeren = () => { setFrisch((a) => a.map((v, i) => (i === aktiv ? false : v))); setFelder((alt) => alt.map((f, i) => (i === aktiv ? "" : f))); };

  const uebernehmen = () => {
    if (vorschau.some((v) => !v.ok)) {
      const i = vorschau.findIndex((v) => !v.ok);
      setAktiv(i);
      setMeldung({ art: "fehler", text: `${ROEM[i]} neu: ${vorschau[i].fehler}${felder[i].trim() ? "" : ` Soll sie unverändert bleiben, tippe einfach ${ROEM[i]}.`}` });
      return;
    }
    if (Math.abs(detN(vorschau.map((v) => v.vec))) < 1e-9) {
      setMeldung({ art: "fehler", text: "So geht Information verloren: Die neuen Gleichungen hängen voneinander ab. Nimm z. B. eine der alten Gleichungen unverändert mit." });
      return;
    }
    const rows = vorschau.map((v) => v.row);
    if (rows.every((r, i) => r.every((v, j) => v === aktuell[i][j]))) {
      setMeldung({ art: "info", text: "Das ist dasselbe System wie vorher. Ersetze mindestens eine Gleichung durch eine Kombination, z. B. II − I." });
      return;
    }
    setBloecke((b) => [...b, { rows, notizen: felder.map((f) => f.trim().replace(/\s+/g, " ")) }]);
    setFelder(NAMEN); setFrisch(Array(n).fill(true)); setAktiv(0); setMeldung(null);
  };
  const rueckgaengig = () => { if (bloecke.length > 1) { setBloecke((b) => b.slice(0, -1)); setMeldung(null); } };

  useEffect(() => { if (heftRef.current) heftRef.current.scrollLeft = 0; }, [bloecke.length]);
  const gauss = muster ? gaussWeg(start, vars) : null;

  const einzel = (() => { const i = start.findIndex((r) => r.slice(0, n).filter((c) => c !== 0).length === 1); return i >= 0 ? i : -1; })();

  return (
    <>
      <Erklaer>
        Bilde aus den Gleichungen ein neues System: Übernimm eine Gleichung unverändert oder kombiniere sie, z. B. <b style={{ fontWeight: 600, color: C.tinte }}>II − I</b> oder <b style={{ fontWeight: 600, color: C.tinte }}>III − 6·II</b> – bis jede Unbekannte allein dasteht.
        {einzel >= 0 && <> Tipp: In Gleichung {ROEM[einzel]} steht schon nur eine Unbekannte.</>}
      </Erklaer>

      <div style={{ background: C.sand, borderRadius: 14, padding: "14px 0" }}>
        <p style={{ ...kicker, padding: "0 16px", marginBottom: 10 }}>{schritte === 0 ? "AUSGANGSSYSTEM" : `${schritte} ${schritte === 1 ? "SCHRITT" : "SCHRITTE"}`}</p>
        <div ref={heftRef} className="sb-scroll" style={{ padding: "0 16px 4px" }}>
          <div style={{ fontSize: "clamp(14px, 4vw, 18px)", color: C.tinte, fontWeight: 500 }}>
            {bloecke.map((b, i) => (
              <div key={i} style={{ paddingTop: i ? 12 : 0, marginTop: i ? 12 : 0, borderTop: i ? `1px dashed ${C.linie}` : "none", opacity: i === bloecke.length - 1 ? 1 : 0.62 }}>
                <SystemBlock rows={b.rows} vars={vars} notizen={b.notizen} neu={i > 0 && i === bloecke.length - 1} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {fertig ? (
        <div className="sb-neu" style={{ marginTop: 14, padding: "14px 16px", borderRadius: 14, background: blauVerlauf, color: C.weiss }}>
          <p style={{ ...kicker, color: C.flaggold, marginBottom: 6 }}>GELÖST</p>
          <p style={{ fontSize: 19, fontWeight: 600, lineHeight: 1.6 }}>
            {vars.map((v, j) => <span key={v} style={{ whiteSpace: "nowrap", marginRight: 14 }}><i>{v}</i> = {minus(L[j])}</span>)}
          </p>
          <p style={{ fontSize: 12.5, color: C.goldText, fontWeight: 300, marginTop: 4 }}>in {schritte} {schritte === 1 ? "Schritt" : "Schritten"}</p>
        </div>
      ) : (
        <div style={{ marginTop: 14 }}>
          <style>{LGS_ZEILE_CSS}</style>
          {felder.map((f, i) => (
            <NeueZeile key={i} name={ROEM[i]} text={f} frisch={frisch[i]} aktiv={aktiv === i} ok={vorschau[i].ok} fehler={vorschau[i].fehler}
              vorschau={vorschau[i].ok ? <GlText row={vorschau[i].row} vars={vars} /> : null} onClick={() => setAktiv(i)} />
          ))}
          {meldung && <p role="status" style={{ fontSize: 13.5, lineHeight: 1.55, margin: "4px 4px 8px", color: meldung.art === "fehler" ? C.signal : C.see, fontWeight: meldung.art === "fehler" ? 500 : 400 }}>{meldung.text}</p>}

          {(() => {
            const OPS = ["+", "−", "·", ":", "(", ")"];
            const reihe1 = [...NAMEN, ...OPS.slice(0, 6 - n)];
            const rest = [...OPS.slice(6 - n), "C", "⌫"];
            while (rest.length < 6) rest.splice(rest.length - 2, 0, null);
            const opTaste = (w, i) => {
              if (w === null) return <span key={`l${i}`} />;
              if (w === "C") return <Taste key="C" ton="op" label="C" aria="Zeile leeren" onClick={leeren} />;
              if (w === "⌫") return <Taste key="del" ton="op" aria="Zeichen löschen" label={LoeschIcon} onClick={zurueck} />;
              return <Taste key={w} ton={NAMEN.includes(w) ? "gl" : "op"} label={w} aria={NAMEN.includes(w) ? `Gleichung ${w}` : w} onClick={() => tippe(w)} />;
            };
            return (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 7, marginTop: 6 }}>
                {reihe1.map(opTaste)}
                {["7", "8", "9"].map((d) => <Taste key={d} label={d} onClick={() => tippe(d)} />)}
                {rest.slice(0, 3).map(opTaste)}
                {["4", "5", "6"].map((d) => <Taste key={d} label={d} onClick={() => tippe(d)} />)}
                {rest.slice(3, 6).map((w, i) => opTaste(w, i + 3))}
                {["1", "2", "3", "0"].map((d) => <Taste key={d} label={d} onClick={() => tippe(d)} />)}
                <Taste ton="aktion" breit label="Neues System" onClick={uebernehmen} />
              </div>
            );
          })()}

          <div className="flex items-center flex-wrap" style={{ gap: 10, marginTop: 12 }}>
            <button type="button" onClick={rueckgaengig} disabled={schritte === 0}
              style={{ display: "flex", alignItems: "center", gap: 7, background: "none", border: `1px solid ${C.linie}`, color: schritte === 0 ? C.hellgrau : C.grau,
                borderRadius: 999, padding: "9px 16px", fontSize: 13.5, fontFamily: "inherit", cursor: schritte === 0 ? "default" : "pointer" }}>
              <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3L1.5 6.5 5 10M2 6.5h8a4.5 4.5 0 0 1 0 9H7" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Rückgängig
            </button>
            <button type="button" onClick={() => setMuster(!muster)}
              style={{ background: "none", border: "none", color: C.see, fontSize: 13, fontWeight: 500, fontFamily: "inherit", cursor: "pointer", padding: "4px 2px" }}>
              {muster ? "Musterlösung ausblenden" : "Musterlösung (Gauß)"}
            </button>
          </div>
        </div>
      )}

      {gauss && !fertig && (
        <div className="sb-neu" style={{ marginTop: 14, padding: "14px 16px", borderRadius: 14, border: `1px solid ${C.linie}` }}>
          <p style={{ ...kicker, marginBottom: 10 }}>GAUSS-VERFAHREN</p>
          <div className="sb-scroll" style={{ fontSize: "clamp(13.5px, 3.9vw, 17px)", color: C.tinte, fontWeight: 500 }}>
            <SystemBlock rows={start} vars={vars} />
            {gauss.schritte.map((s, i) => (
              <div key={i} style={{ marginTop: 12, paddingTop: 10, borderTop: `1px dashed ${C.linie}` }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: C.see, marginBottom: 6 }}>{i + 1}. {s.titel}</p>
                <SystemBlock rows={s.rows} vars={vars} notizen={s.notizen} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px dashed ${C.linie}` }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: C.see, marginBottom: 2 }}>{gauss.schritte.length + 1}. Rückwärts einsetzen</p>
            <Rueckwaerts rueck={gauss.rueck} />
          </div>
          <Knopf onClick={() => { if (!gemeldet.current) { gemeldet.current = true; onGeloest(gauss.loesung, "muster"); } }}>Lösung übernehmen</Knopf>
        </div>
      )}

      <details style={{ marginTop: 16 }}>
        <summary style={{ fontSize: 13.5, color: C.see, cursor: "pointer", fontWeight: 500 }}>Was kann ich eingeben?</summary>
        <div style={{ fontSize: 13.5, color: C.grau, fontWeight: 300, lineHeight: 1.8, marginTop: 8 }}>
          <p><b style={{ color: C.tinte, fontWeight: 600 }}>Kopie</b>: die Gleichung selbst, z. B. II – so kannst du auch die Reihenfolge ändern.</p>
          <p><b style={{ color: C.tinte, fontWeight: 600 }}>Kombination</b>: z. B. II − I, 2·I + III, III − 6·II.</p>
          <p><b style={{ color: C.tinte, fontWeight: 600 }}>Kürzen</b>: mit „:“ teilst du die ganze Gleichung, z. B. (II − I) : 2.</p>
        </div>
      </details>
    </>
  );
}

/* ======================================================================
   Schritt (Advanced): Gleichungen lösen durch Dividieren / Ablesen
   ====================================================================== */
function advWeg(auf, zeilen) {
  const L = (r) => ROEM[zeilen.findIndex((z) => z.k === r.k && z.x === r.x && z.y === r.y)];
  if (auf.ansatz === "exp") {
    const [c, q] = auf.koeff;
    const pts = zeilen.filter((z) => z.k === 0).sort((u, v) => u.x - v.x);
    const [lo, hi] = pts, R = hi.y / lo.y, dx = hi.x - lo.x;
    const wurzel = (exp, wert) => (exp === 1 ? [`a = ${wert}`] : [`a^{${exp}} = ${wert}`, `a = ${q}`]);
    if (lo.x === 0) return [
      { titel: `Aus ${L(lo)} folgt sofort c, denn a⁰ = 1`, zeilen: [`c·a^0 = ${lo.y}`, `c = ${c}`] },
      { titel: `c in ${L(hi)} einsetzen und durch ${c} teilen`, zeilen: [`${c}·a^{${hi.x}} = ${hi.y}`, ...wurzel(hi.x, hi.y / c)], notiz: hi.x > 1 ? `denn ${q}^${hi.x} = ${hi.y / c} und a > 0` : null },
    ];
    return [
      { titel: `${L(hi)} durch ${L(lo)} teilen – c kürzt sich weg`, zeilen: [`\\frac{c·a^{${hi.x}}}{c·a^{${lo.x}}} = \\frac{${hi.y}}{${lo.y}}`, ...wurzel(dx, R)], notiz: dx > 1 ? `denn ${q}^${dx} = ${R} und a > 0` : null },
      { titel: `a in ${L(lo)} einsetzen`, zeilen: [`c·${q}^{${lo.x}} = ${lo.y}`, `c = \\frac{${lo.y}}{${Math.pow(q, lo.x)}} = ${c}`] },
    ];
  }
  if (auf.ansatz === "ek") {
    const c = auf.koeff[0], q = auf.q;
    const pts = zeilen.filter((z) => z.k === 0).sort((u, v) => u.x - v.x);
    const [lo, hi] = pts, R = hi.y / c;
    return [
      { titel: `Aus ${L(lo)} folgt sofort c, denn e⁰ = 1`, zeilen: [`c·e^{k·0} = ${lo.y}`, `c = ${c}`] },
      { titel: `c in ${L(hi)} einsetzen und logarithmieren`, zeilen: [`${c}·e^{${hi.x}k} = ${hi.y}`, `e^{${hi.x}k} = ${R}`, `${hi.x === 1 ? "" : hi.x}k = ln(${R})`,
        hi.x === 1 ? `k = ln(${R}) ≈ ${dez(Math.log(R))}` : `k = \\frac{ln(${R})}{${hi.x}} = ln(${q}) ≈ ${dez(Math.log(q))}`],
        notiz: hi.x > 1 ? `Logarithmusgesetz: ln(${q}^${hi.x}) = ${hi.x}·ln(${q})` : null },
    ];
  }
  // Sinus
  const [A, , c, d] = auf.koeff, h = auf.h;
  const H = auf.props.find((p) => p.rolle === "hoch"), T = auf.props.find((p) => p.rolle === "tief");
  return [
    { titel: "Mittellinie: genau in der Mitte zwischen Hoch- und Tiefpunkt", zeilen: [`d = \\frac{${minus(H.y)} + ${zk(T.y)}}{2} = ${minus(d)}`] },
    { titel: "Amplitude: Abstand von der Mittellinie bis zum Hochpunkt", zeilen: [`a = \\frac{${minus(H.y)} − ${zk(T.y)}}{2} = ${A}`] },
    { titel: "Periode: Vom Hochpunkt zum benachbarten Tiefpunkt ist eine halbe Periode", zeilen: [`p = 2·${h} = ${2 * h}`, `b = \\frac{2π}{p} = \\frac{2π}{${2 * h}} = ${piBruch(h)}`] },
    { titel: "Verschiebung: Eine Viertelperiode vor dem Hochpunkt steigt der Graph durch die Mittellinie", zeilen: [`c = ${minus(H.x)} − \\frac{${2 * h}}{4} = ${dez(c)}`], notiz: "c ist nur bis auf Vielfache der Periode festgelegt – jedes c + k·p passt auch." },
  ];
}

function AdvSchritt({ auf, zeilen, onFertig }) {
  const weg = advWeg(auf, zeilen);
  const [gezeigt, setGezeigt] = useState(1);
  const gemeldet = useRef(false);
  useEffect(() => { if (gezeigt >= weg.length && !gemeldet.current) { gemeldet.current = true; onFertig(); } }, [gezeigt]);
  return (
    <>
      <Erklaer>
        {auf.ansatz === "sin"
          ? "Diese Gleichungen sind nicht linear – ein LGS hilft hier nicht. Stattdessen liest man die Parameter direkt an Hoch- und Tiefpunkt ab:"
          : "Kein lineares Gleichungssystem – die Unbekannte steht im Exponenten. Der Trick: Gleichungen geschickt teilen bzw. logarithmieren."}
      </Erklaer>
      {weg.slice(0, gezeigt).map((s, i) => (
        <div key={i} className="sb-neu" style={{ marginBottom: 12, paddingTop: i ? 10 : 0, borderTop: i ? `1px dashed ${C.linie}` : "none" }}>
          <p style={{ fontSize: 12.5, fontWeight: 600, color: C.see, marginBottom: 4 }}>{i + 1}. {s.titel}</p>
          <div className="sb-scroll" style={{ fontSize: 16.5, lineHeight: 2.2, color: C.tinte }}>
            {s.zeilen.map((z, k) => <div key={k} style={{ whiteSpace: "nowrap" }}>{k > 0 && <span style={{ color: C.hellgrau, marginRight: 8 }}>⇒</span>}<F t={z} /></div>)}
          </div>
          {s.notiz && <p style={{ fontSize: 12.5, color: C.grau, fontWeight: 300, marginTop: 2 }}>{s.notiz}</p>}
        </div>
      ))}
      {gezeigt < weg.length && <Knopf leise onClick={() => setGezeigt(gezeigt + 1)}>Nächster Schritt</Knopf>}
    </>
  );
}

/* ======================================================================
   Schritt 6: Schaubild mit den gegebenen Eigenschaften
   ====================================================================== */
function tickSchritt(spanne, ziel = 7) {
  const roh = spanne / ziel, mag = Math.pow(10, Math.floor(Math.log10(roh)));
  for (const m of [1, 2, 5, 10]) if (m * mag >= roh) return m * mag;
  return 10 * mag;
}

function Schaubild({ f, abl1, props, sinH }) {
  const W = 360, H = 300, PL = 10, PR = 10, PT = 12, PB = 12;
  const xs = props.map((p) => p.x);
  let xmin, xmax;
  if (sinH) { xmin = Math.min(...xs) - 1.5 * sinH; xmax = Math.max(...xs) + 1.5 * sinH; }
  else { xmin = Math.min(...xs) - 2; xmax = Math.max(...xs) + 2; }
  if (xmax - xmin < 6) { const m = (xmin + xmax) / 2; xmin = m - 3; xmax = m + 3; }
  if (xmin > 0 && xmin < 3) xmin = -1; if (xmax < 0 && xmax > -3) xmax = 1;
  const proben = Array.from({ length: 241 }, (_, i) => f(xmin + ((xmax - xmin) * i) / 240));
  const pys = props.map((p) => p.y);
  const lo = Math.min(...pys), hi = Math.max(...pys), span = Math.max(hi - lo, 4);
  let ymin = Math.min(lo - span * 0.3, Math.max(Math.min(...proben), lo - span * 0.8));
  let ymax = Math.max(hi + span * 0.3, Math.min(Math.max(...proben), hi + span * 0.8));
  if (ymin > 0 && ymin < span * 0.6) ymin = -span * 0.12;
  if (ymax < 0 && ymax > -span * 0.6) ymax = span * 0.12;
  const X = (x) => PL + ((x - xmin) / (xmax - xmin)) * (W - PL - PR);
  const Y = (y) => PT + ((ymax - y) / (ymax - ymin)) * (H - PT - PB);
  const tx = tickSchritt(xmax - xmin), ty = tickSchritt(ymax - ymin, 6);
  const ax0 = Y(Math.min(Math.max(0, ymin), ymax)), ay0 = X(Math.min(Math.max(0, xmin), xmax));

  let pfad = "", stift = false;
  for (let i = 0; i <= 480; i++) {
    const x = xmin + ((xmax - xmin) * i) / 480, y = f(x);
    if (!isFinite(y) || y < ymin - 3 * (ymax - ymin) || y > ymax + 3 * (ymax - ymin)) { stift = false; continue; }
    pfad += `${stift ? "L" : "M"}${X(x).toFixed(1)},${Y(y).toFixed(1)} `;
    stift = true;
  }
  const gitterX = [], gitterY = [];
  for (let v = Math.ceil(xmin / tx) * tx; v <= xmax + 1e-9; v += tx) gitterX.push(rund(v));
  for (let v = Math.ceil(ymin / ty) * ty; v <= ymax + 1e-9; v += ty) gitterY.push(rund(v));

  const FARBE = { hoch: C.gruen, tief: C.gruen, scheitel: C.gruen, wende: C.see, wendeTang: C.see, wstelle: C.see, sattel: C.lila, punkt: C.goldWarm, null: C.goldWarm, yachse: C.goldWarm, tangente: C.goldWarm };
  const tangenten = props.filter((p) => p.rolle === "tangente" || p.rolle === "wendeTang");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", background: C.weiss, borderRadius: 14 }} role="img" aria-label="Schaubild der gesuchten Funktion mit den gegebenen Eigenschaften">
      <defs>
        <clipPath id="sbClip"><rect x={PL} y={PT} width={W - PL - PR} height={H - PT - PB} /></clipPath>
        <marker id="sbPfeil" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill={C.ablGrau} /></marker>
      </defs>
      {gitterX.map((v) => <line key={`gx${v}`} x1={X(v)} y1={PT} x2={X(v)} y2={H - PB} stroke={C.linie} strokeWidth="1" />)}
      {gitterY.map((v) => <line key={`gy${v}`} x1={PL} y1={Y(v)} x2={W - PR} y2={Y(v)} stroke={C.linie} strokeWidth="1" />)}
      <line x1={PL} y1={ax0} x2={W - PR + 2} y2={ax0} stroke={C.ablGrau} strokeWidth="1.3" markerEnd="url(#sbPfeil)" />
      <line x1={ay0} y1={H - PB} x2={ay0} y2={PT - 4} stroke={C.ablGrau} strokeWidth="1.3" markerEnd="url(#sbPfeil)" />
      <g fontSize="10.5" fill={C.hellgrau} fontWeight="500">
        {gitterX.filter((v) => v !== 0).map((v) => <text key={`tx${v}`} x={X(v)} y={Math.min(ax0 + 14, H - PB - 3)} textAnchor="middle">{dez(v)}</text>)}
        {gitterY.filter((v) => v !== 0).map((v) => <text key={`ty${v}`} x={ay0 - 5 < 22 ? ay0 + 5 : ay0 - 5} y={Y(v) + 3.5} textAnchor={ay0 - 5 < 22 ? "start" : "end"}>{dez(v)}</text>)}
      </g>
      <g clipPath="url(#sbClip)">
        {tangenten.map((p, i) => {
          const d = (xmax - xmin) * 0.2, m = abl1(p.x);
          return <line key={`t${i}`} x1={X(p.x - d)} y1={Y(p.y - m * d)} x2={X(p.x + d)} y2={Y(p.y + m * d)} stroke={FARBE[p.rolle]} strokeWidth="1.8" strokeDasharray="6 4" opacity="0.75" />;
        })}
        <path d={pfad} fill="none" stroke={C.seeTief} strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
      </g>
      {props.map((p, i) => {
        const px = X(p.x), py = Y(p.y), oben = !["tief"].includes(p.rolle) && !(p.rolle === "scheitel" && abl1(p.x + 0.5) > 0 && abl1(p.x - 0.5) < 0);
        const links = px > W - 120;
        const ly = oben ? py - 12 : py + 21;
        return (
          <g key={i}>
            <circle cx={px} cy={py} r="9" fill={FARBE[p.rolle]} opacity="0.18" />
            <circle cx={px} cy={py} r="5" fill={FARBE[p.rolle]} stroke={C.weiss} strokeWidth="2" />
            <text x={links ? px - 8 : px + 8} y={Math.max(14, Math.min(H - 6, ly))} textAnchor={links ? "end" : "start"} fontSize="13" fontWeight="700" fill={FARBE[p.rolle]}
              stroke={C.weiss} strokeWidth="4" paintOrder="stroke" strokeLinejoin="round">
              {p.name}{p.idx && <tspan fontSize="9" dy="3.5">{p.idx}</tspan>}<tspan dy={p.idx ? -3.5 : 0}>({dez(p.x)} | {dez(p.y)})</tspan>
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* Vollständige Kurvendiskussion der aktuell bestätigten Funktion als PDF.
   Polynome nutzen den Export des Polynomplotters, die übrigen Funktionstypen den des Advanced Plotters. */
const zahlTxt = (v) => { const r = Math.round(v * 1e6) / 1e6; return r < 0 ? `(${r})` : String(r); };
function pdfQuelle(auf, L) {
  const ans = ANSAETZE[auf.ansatz];
  if (ans.art === "poly") {
    const k = [0, 0, 0, 0, 0];   // Koeffizienten zu x⁴, x³, x², x, 1
    ans.pot.forEach((p, i) => { k[4 - p] = Math.round(L[i] * 1e6) / 1e6; });
    return { art: "poly", k };
  }
  const vor = (v) => (Math.round(v * 1e6) / 1e6 === 1 ? "" : `${zahlTxt(v)}*`);
  if (ans.art === "exp") return { art: "text", text: `${vor(L[0])}${zahlTxt(L[1])}^x`, fenster: 5 };
  if (ans.art === "ek") return { art: "text", text: `${vor(L[0])}e^(ln(${auf.q})*x)`, fenster: 5 };
  const [A, , c, d] = L;
  const r = (v) => Math.round(v * 1e6) / 1e6;
  const faktor = r(A) === 1 ? "" : r(A) === -1 ? "-" : `${r(A)}*`;
  const innen = r(c) === 0 ? "x" : r(c) > 0 ? `(x-${r(c)})` : `(x+${-r(c)})`;
  const plus = r(d) === 0 ? "" : r(d) > 0 ? `+${r(d)}` : `-${-r(d)}`;
  const b = auf.h === 1 ? "pi" : `pi/${auf.h}`;
  return { art: "text", text: `${faktor}sin(${b}*${innen})${plus}`, fenster: Math.max(6, 2 * auf.h + 2) };
}

function KurvendiskussionPdfKnopf({ auf, L }) {
  const [status, setStatus] = useState("bereit");
  const klick = async () => {
    if (status === "laeuft") return;
    setStatus("laeuft");
    try {
      const q = pdfQuelle(auf, L);
      if (q.art === "poly") {
        const { kurvendiskussionPdf } = await import("./func11.jsx");
        const [e, a, b, c, d] = q.k;
        await kurvendiskussionPdf({ e, a, b, c, d, untertitel: "Kurvendiskussion · Steckbriefaufgabe" });
      } else {
        const { diskussionPdfAusText } = await import("./func12.jsx");
        await diskussionPdfAusText(q.text, q.fenster, "Kurvendiskussion · Steckbriefaufgabe");
      }
      setStatus("bereit");
    } catch (err) { console.error(err); setStatus("fehler"); }
  };
  return (
    <div style={{ marginTop: 18 }}>
      <button type="button" onClick={klick} disabled={status === "laeuft"}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, minHeight: 52,
          padding: "13px 18px", border: "none", borderRadius: 14, cursor: status === "laeuft" ? "wait" : "pointer",
          fontFamily: "inherit", fontSize: 15, fontWeight: 700, color: C.weiss, background: blauVerlauf,
          boxShadow: "0 6px 20px rgba(0,77,152,0.25)", opacity: status === "laeuft" ? 0.75 : 1 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.flaggold} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3v12" /><path d="M7 10l5 5 5-5" /><path d="M5 20h14" />
        </svg>
        {status === "laeuft" ? "PDF wird erstellt …" : "Vollständige Kurvendiskussion als PDF downloaden"}
      </button>
      {status === "fehler" && <p role="alert" style={{ fontSize: 12.5, color: C.signal, marginTop: 8, textAlign: "center" }}>Das PDF konnte nicht erstellt werden. Bitte noch einmal versuchen.</p>}
    </div>
  );
}

function ErgebnisSchritt({ auf, L, weg, neu }) {
  const ans = ANSAETZE[auf.ansatz];
  let f, abl;
  if (ans.art === "poly") {
    abl = (x, k) => L.reduce((s, c, i) => { const p = ans.pot[i]; return p < k ? s : s + c * fallend(p, k) * Math.pow(x, p - k); }, 0);
    f = (x) => abl(x, 0);
  } else {
    f = auf.f;
    const h = 1e-5;
    abl = (x, k) => (k === 0 ? f(x) : k === 1 ? (f(x + h) - f(x - h)) / (2 * h) : (f(x + h) - 2 * f(x) + f(x - h)) / (h * h));
  }
  const probe = (b) => { const v = rund(abl(b.x, b.k)); return { v, ok: Math.abs(v - b.y) < 1e-3 }; };
  const ungefaehr = ans.art !== "poly" && ans.art !== "exp";
  return (
    <>
      <div style={{ padding: "16px 18px", borderRadius: 14, background: blauVerlauf, color: C.weiss }}>
        <p style={{ ...kicker, color: C.flaggold, marginBottom: 6 }}>{weg === "muster" ? "ERGEBNIS (MUSTERLÖSUNG)" : "GESUCHTE FUNKTION"}</p>
        <div className="sb-scroll" style={{ fontSize: "clamp(18px, 5.4vw, 23px)", fontWeight: 700, lineHeight: 1.6 }}><F t={ergebnisFormel(auf, L)} /></div>
      </div>

      <p style={{ fontSize: 13, fontWeight: 600, color: C.see, margin: "18px 2px 8px" }}>Das Schaubild – und die gegebenen Eigenschaften liegen genau drauf</p>
      <div style={{ border: `1px solid ${C.linie}`, borderRadius: 14, padding: 4 }}>
        <Schaubild f={f} abl1={(x) => abl(x, 1)} props={auf.props} sinH={ans.art === "sin" ? auf.h : null} />
      </div>

      <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, margin: "18px 2px 6px" }}>Probe</p>
      <div style={{ display: "grid", gap: 8 }}>
        {auf.props.map((p, s) => (
          <div key={s} style={{ padding: "10px 14px", borderRadius: 12, background: C.sand }}>
            <p style={{ fontSize: 13.5, fontWeight: 600, color: C.tinte, marginBottom: 2 }}>
              {ROLLEN[p.rolle]}{p.rolle !== "wstelle" && <> <F t={lbl(p)} /></>}{p.rolle === "wstelle" && <> bei x = {minus(p.x)}</>}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", columnGap: 16, rowGap: 2, fontSize: 14.5, color: C.grau }}>
              {auf.bed.filter((b) => b.s === s).map((b, k) => {
                const pr = probe(b);
                return (
                  <span key={k} style={{ whiteSpace: "nowrap" }}>
                    <F t={`${fName(b.k)}(${minus(b.x)}) ${ungefaehr ? "≈" : "="} ${dez(pr.v)}`} />{" "}
                    <b style={{ color: pr.ok ? C.smaragd : C.signal }}>{pr.ok ? "✓" : "✗"}</b>
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <KurvendiskussionPdfKnopf auf={auf} L={L} />
      <Knopf onClick={neu}>Nächste Aufgabe</Knopf>
    </>
  );
}

/* ======================================================================
   Lernhilfe „Ich hänge fest“ – Hinweise passend zum aktuellen Arbeitsschritt
   ====================================================================== */
function steckbriefHilfe(auf, phase, rows) {
  const ans = ANSAETZE[auf.ansatz];
  const eigenschaften = auf.props.map((p) => (p.rolle === "wstelle" ? `Wendestelle bei x = ${minus(p.x)}` : `${ROLLEN[p.rolle]} $${lbl(p)}$`)).join(", ");
  const b0 = auf.bed[0];
  const beispielBed = `${fehltHinweis(b0, auf)} Das ergibt $${fName(b0.k)}(${minus(b0.x)}) = ${minus(b0.y)}$.`;
  let ansatz;
  if (phase === "ansatz") ansatz = [
    "Welcher Funktionstyp ist gesucht – und welcher Grad bzw. welche Form steht im Text?",
    "Ein Polynom vom Grad n hat n + 1 Unbekannte. Achsensymmetrie zur y-Achse: nur gerade Exponenten. Punktsymmetrie zum Ursprung: nur ungerade Exponenten.",
    `Passender Ansatz: $f(x) = ${ans.formel}$.`,
  ];
  else if (phase === "bedingungen") ansatz = [
    `Dein Ansatz hat ${ans.vars.length} Unbekannte. Wie viele Bedingungen brauchst du also?`,
    "Punkt P(a | b): f(a) = b. Extremstelle a: f′(a) = 0. Wendestelle a: f″(a) = 0. Tangentensteigung m an der Stelle a: f′(a) = m.",
    beispielBed,
  ];
  else if (phase === "einsetzen") ansatz = [
    "Welche Ableitungen des Ansatzes brauchen deine Bedingungen?",
    "Setze den x-Wert jeder Bedingung in f, f′ oder f″ ein. Die Unbekannten bleiben als Buchstaben stehen.",
    `Für Bedingung I: $${einsetzFormel(ans, b0)}$.`,
  ];
  else if (ans.art === "poly") {
    let musterSchritt = "Eliminiere eine Unbekannte, indem du zwei Gleichungen passend subtrahierst.";
    try { const g = gaussWeg(rows, ans.vars); if (g.schritte[0]) musterSchritt = `Erster Schritt im Gauß-Verfahren: ${g.schritte[0].titel} – mit ${g.schritte[0].notizen.filter((t) => /[−+]/.test(t)).join(" und ")}.`; } catch (e) { /* egal */ }
    ansatz = [
      "Welche Unbekannte lässt sich am leichtesten eliminieren? Achte auf Koeffizienten 1 oder Gleichungen mit nur einer Unbekannten.",
      "Kombiniere zwei Gleichungen so, dass sich die Koeffizienten einer Unbekannten aufheben – zum Beispiel II − I oder III − 2·I.",
      musterSchritt,
    ];
  } else if (ans.art === "sin") ansatz = [
    "Was verraten Hoch- und Tiefpunkt über Amplitude, Mittellinie und Periode?",
    "Amplitude $a = \\frac{y_H - y_T}{2}$, Mittellinie $d = \\frac{y_H + y_T}{2}$. Von einem Hochpunkt zum benachbarten Tiefpunkt ist es eine halbe Periode.",
    "Bestimme zuerst a und d, dann aus dem Abstand der beiden Stellen die Periode p und damit $b = \\frac{2\\pi}{p}$.",
  ];
  else ansatz = [
    "Die Gleichungen sind nicht linear. Wie wirst du den Faktor c los?",
    "Teile eine Gleichung durch die andere: Der Faktor c kürzt sich weg, übrig bleibt eine Gleichung nur für die Basis.",
    "Ist die Basis bestimmt, setzt du sie in eine der beiden Gleichungen ein und berechnest c.",
  ];
  const brauchtWende = auf.props.some((p) => ["wende", "wendeTang", "sattel", "wstelle"].includes(p.rolle));
  const brauchtExtrem = auf.props.some((p) => ["hoch", "tief", "scheitel", "sattel"].includes(p.rolle));
  const brauchtTangente = auf.props.some((p) => ["tangente", "wendeTang"].includes(p.rolle));
  return {
    id: `sb-${auf.satz}-${phase}`,
    aufgabe: auf.satz,
    hilfen: {
      verstehen: [
        "Welche Eigenschaften des Graphen nennt der Text? Unterstreiche jede einzelne.",
        `Im Steckbrief stecken: ${eigenschaften}.`,
        "Jede Eigenschaft liefert Bedingungen: Punkt → eine für f; Hoch- oder Tiefpunkt → f und f′; Wendepunkt → f und f″; Tangente → f und f′.",
      ],
      ansatz,
      regel: [
        "Welche Bedingung gehört zu welcher Eigenschaft?",
        "Notwendige Bedingung für eine Extremstelle: f′(a) = 0. Für eine Wendestelle: f″(a) = 0. Die Steigung der Tangente ist f′(a).",
        "Diese Bedingungen sind nur notwendig. Ob wirklich ein Hoch-, Tief- oder Wendepunkt vorliegt, zeigt erst die Probe am Ende (f″(a) ≠ 0 bzw. Vorzeichenwechsel).",
      ],
      umformen: [
        "Hast du beim Einsetzen die Potenzen richtig ausgerechnet? Negative x-Werte gehören in Klammern.",
        "$(-2)^{3} = -8$, $(-2)^{2} = 4$ – aber $-2^{2} = -4$.",
        "Fasse jede Gleichung so zusammen, dass links nur noch die Unbekannten mit ihren Zahlen stehen und rechts eine Zahl.",
      ],
      pruefen: [
        "Erfüllt deine Funktion wirklich alle Bedingungen? Setze sie ein.",
        "Die Zahl der Angaben ist nicht automatisch die Zahl der unabhängigen Bedingungen. Wiederholt eine Bedingung nur eine andere, fehlt dir eine Information.",
        "Bei Extrem- und Wendepunkten gehört der Nachweis dazu: f″(a) ≠ 0 bzw. ein Vorzeichenwechsel von f′ oder f″. Das Schaubild am Ende zeigt es dir.",
      ],
    },
    regeln: [
      ...(brauchtExtrem ? [{ name: "Extrempunkt", bereich: "analysis" }] : []),
      ...(brauchtWende ? [{ name: "Wendepunkt", bereich: "analysis" }] : []),
      ...(brauchtTangente ? [{ name: "Tangente", bereich: "analysis" }] : []),
      { name: "Potenzregel", bereich: "analysis" },
    ],
    grundlage: phase === "einsetzen" || phase === "loesen" ? { trainer: "kuben", name: "Potenzen", grund: "Beim Einsetzen rechnest du viele Potenzen wie 2³ oder (−1)⁴. Eine schnelle Runde hilft." } : null,
    loesung: `$${ergebnisFormel(auf, auf.koeff)}$`,
  };
}

/* ======================================================================
   Hauptkomponente
   ====================================================================== */
const SUB = {
  poly: [{ id: 2, name: "Grad 2" }, { id: 3, name: "Grad 3" }, { id: 4, name: "Grad 4" }],
  adv: [{ id: "exp", name: "c·aˣ" }, { id: "ek", name: "e-Funktion" }, { id: "sin", name: "Sinus" }],
};

export function Steckbriefaufgaben() {
  const [modus, setModus] = useState("poly");
  const [sub, setSub] = useState(3);
  const [auf, setAuf] = useState(() => aufgabeErzeugen("poly", 3));
  const [nr, setNr] = useState(0);
  const [ansatz, setAnsatz] = useState(null);
  const [bedZeilen, setBedZeilen] = useState(null);
  const [ausmult, setAusmult] = useState(false);
  const [loesen, setLoesen] = useState(false);
  const [ergebnis, setErgebnis] = useState(null);   // { L, weg }
  const startZeit = useRef(Date.now());

  const neu = (m = modus, s = sub) => {
    setAuf(aufgabeErzeugen(m, s)); setNr((k) => k + 1);
    setAnsatz(null); setBedZeilen(null); setAusmult(false); setLoesen(false); setErgebnis(null);
    startZeit.current = Date.now();
    try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch (e) { /* egal */ }
  };
  const modusWaehlen = (m) => { const s = m === "poly" ? 3 : "exp"; setModus(m); setSub(s); neu(m, s); };
  const subWaehlen = (s) => { setSub(s); neu(modus, s); };

  const fertig = (L, weg) => {
    setErgebnis({ L, weg });
    try { merken({ bereich: "steckbrief", gruppe: `${auf.modus}-${auf.ansatz}`, stufe: 1, richtig: weg !== "muster", sekunden: Math.max(1, Math.round((Date.now() - startZeit.current) / 1000)), fehlerart: null }); }
    catch (e) { /* optional */ }
  };

  const ans = ANSAETZE[auf.ansatz];
  const istPoly = ans.art === "poly";
  const rows = bedZeilen && istPoly ? bedZeilen.map((b) => zeileAus(ans, b)) : null;
  let k = 0;
  const num = () => ++k;

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <style>{SB_CSS}</style>

      <h2 className="intro-h2" style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 10 }}>
        <span className="titel-lang">Aus Eigenschaften die Funktion bauen</span><span className="titel-kurz">Funktion gesucht!</span>
      </h2>
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.8, marginBottom: 20 }}>
        Hochpunkt, Wendepunkt, Tangente – jede Eigenschaft ist eine Bedingung. Ansatz wählen, Bedingungen aufstellen,
        einsetzen, Gleichungssystem lösen. Am Ende siehst du, dass deine Funktion genau passt.
      </p>

      <div className="flex items-center flex-wrap" style={{ gap: 8, marginBottom: 10 }}>
        <div className="flex" role="group" aria-label="Funktionstyp" style={{ background: "#EEF2F8", borderRadius: 999, padding: 3 }}>
          <Pille aktiv={modus === "poly"} onClick={() => modusWaehlen("poly")}>Polynome</Pille>
          <Pille aktiv={modus === "adv"} onClick={() => modusWaehlen("adv")}>Advanced</Pille>
        </div>
      </div>
      <div className="flex items-center flex-wrap" style={{ gap: 10, marginBottom: 16 }}>
        <div className="flex" role="group" aria-label="Aufgabenart" style={{ background: "#EEF2F8", borderRadius: 999, padding: 3 }}>
          {SUB[modus].map((s) => <Pille key={s.id} aktiv={sub === s.id} onClick={() => subWaehlen(s.id)}>{s.name}</Pille>)}
        </div>
        <button type="button" onClick={() => neu()}
          style={{ marginLeft: "auto", background: "none", border: "none", color: C.see, fontSize: 13, fontWeight: 500, fontFamily: "inherit", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 2.5v3h-3" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Neue Aufgabe
        </button>
      </div>
      {!ergebnis && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 4 }}>
          <IchHaengeFest kontext={steckbriefHilfe(auf, !ansatz ? "ansatz" : !bedZeilen ? "bedingungen" : !loesen ? "einsetzen" : "loesen", rows)} />
        </div>
      )}

      <div key={`s${nr}`}>
        <Schritt nr={num()} titel="Ansatz wählen" fertig={!!ansatz}>
          <AnsatzSchritt auf={auf} gewaehlt={ansatz} setGewaehlt={setAnsatz} />
        </Schritt>

        {/* Aufgabe: nach dem Ansatz, direkt darüber die Bedingungen (Reihenfolge laut Auftrag) */}
        <div key={`a${nr}`} className="sb-neu" style={{ ...karte, padding: "18px 20px", marginTop: 16, borderLeft: `4px solid ${C.flaggold}` }}>
          <p style={{ ...kicker, marginBottom: 8 }}>STECKBRIEF</p>
          <Text s={auf.satz} style={{ fontSize: 16, lineHeight: 1.85, color: C.tinte, fontWeight: 400 }} />
          <p style={{ fontSize: 13, color: C.grau, fontWeight: 300, marginTop: 8 }}>Bestimme den Funktionsterm von f.</p>
        </div>

        {ansatz && (
          <Schritt nr={num()} titel="Bedingungen aufstellen" fertig={!!bedZeilen}>
            <BedingungsSchritt auf={auf} fertig={bedZeilen} onFertig={setBedZeilen} />
          </Schritt>
        )}

        {bedZeilen && (
          <Schritt nr={num()} titel="Einsetzen" fertig={istPoly ? ausmult : loesen} scrollen>
            <EinsetzSchritt auf={auf} zeilen={bedZeilen} />
            {istPoly && !ausmult && <Knopf onClick={() => setAusmult(true)}>Ausmultiplizieren</Knopf>}
            {!istPoly && !loesen && <Knopf onClick={() => setLoesen(true)}>Gleichungen lösen</Knopf>}
          </Schritt>
        )}

        {istPoly && ausmult && (
          <Schritt nr={num()} titel="Ausmultiplizieren" fertig={loesen} scrollen>
            <AusmultSchritt auf={auf} rows={rows} />
            {!loesen && <Knopf onClick={() => setLoesen(true)}>Gleichungssystem lösen</Knopf>}
          </Schritt>
        )}

        {loesen && (
          <Schritt nr={num()} titel={istPoly ? "Gleichungssystem lösen" : "Parameter bestimmen"} fertig={!!ergebnis} scrollen>
            {istPoly
              ? <LGSSchritt start={rows} vars={ans.vars} onGeloest={fertig} />
              : <AdvSchritt auf={auf} zeilen={bedZeilen} onFertig={() => fertig(auf.koeff, "selbst")} />}
          </Schritt>
        )}

        {ergebnis && (
          <Schritt nr={num()} titel="Die Funktion im Schaubild" fertig scrollen>
            <ErgebnisSchritt auf={auf} L={ergebnis.L} weg={ergebnis.weg} neu={() => neu()} />
          </Schritt>
        )}
      </div>
    </div>
  );
}

/* Kleine Grafik für Übersichtskacheln: Steckbrief-Karte mit Kurve */
export function SteckbriefLogoKlein() {
  return (
    <svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true">
      <path d="M8 46 C 18 10, 28 10, 34 30 S 50 54, 58 18" stroke={C.weiss} strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="22" cy="21" r="4" fill={C.flaggold} /><circle cx="46" cy="41" r="4" fill={C.flaggold} />
    </svg>
  );
}
