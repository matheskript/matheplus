/* ============================================================
   Mathe-Kern für die Regel-Werkstatt (Ableitungstrainer) und das
   Werkzeug „Stammfunktion & Integral“.

   · Zerlegung eines Terms in u und v (Produkt, Quotient, Reziprok)
     bzw. in äußere und innere Funktion (Kettenregel)
   · Schönschreiben: Polynome ausmultiplizieren, Faktoren ordnen,
     gemeinsame Funktionsfaktoren ausklammern
   · Aufgaben-Generatoren je Regel und Stufe
   · Stammfunktionen (Potenzregel rückwärts, sin, cos, eˣ, 1/x,
     lineare Substitution) und Hauptsatz-Rechnung
   Alles arbeitet auf den Bäumen der Formel-Engine aus func12.
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import { ableitung, alsTex, hatBox, hatX, kompiliere, ohnePar, parse, vereinfache } from "./func12.jsx";

/* ---------- Bausteine ---------- */

export const num = (v) => ({ k: "num", v });
export const X = { k: "x" };
const add = (a, b) => ({ k: "+", a, b });
const sub = (a, b) => ({ k: "-", a, b });
const mul = (a, b) => ({ k: "*", a, b });
const div = (a, b) => ({ k: "/", a, b });
const pow = (a, b) => ({ k: "^", a, b });
const neg = (a) => ({ k: "neg", a });
const fn = (n, a) => ({ k: "fn", n, a });
const endlich = (y) => typeof y === "number" && Number.isFinite(y);
const wahl = (l) => l[Math.floor(Math.random() * l.length)];
const ganz = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const ohneNull = (a, b) => { let z = 0; while (z === 0) z = ganz(a, b); return z; };
const istX = (n) => n && n.k === "x";

/* Text (Tastenfeld-Schreibweise) → Baum ohne Klammerknoten; unvollständig → null */
export function lies(text) {
  const b = parse(String(text || ""));
  return b && !hatBox(b) ? ohnePar(b) : null;
}

/* x im Baum durch einen anderen Baum ersetzen */
export function einsetzen(n, e) {
  if (!n) return n;
  if (n.k === "x") return e;
  const m = { ...n };
  if (n.a) m.a = einsetzen(n.a, e);
  if (n.b) m.b = einsetzen(n.b, e);
  return m;
}

/* ln|…| hat in der Engine keinen eigenen Knoten: intern „lnb“, ausgewertet als ln(√(A²)) */
function ohneLnb(n) {
  if (!n) return n;
  if (n.k === "fn" && n.n === "lnb") return fn("ln", fn("sqrt", pow(ohneLnb(n.a), num(2))));
  const m = { ...n };
  if (n.a) m.a = ohneLnb(n.a);
  if (n.b) m.b = ohneLnb(n.b);
  return m;
}
function lnbAlsLn(n) {
  if (!n) return n;
  const m = { ...n };
  if (n.k === "fn" && n.n === "lnb") m.n = "ln";
  if (n.a) m.a = lnbAlsLn(n.a);
  if (n.b) m.b = lnbAlsLn(n.b);
  return m;
}
export const auswerter = (n) => kompiliere(ohneLnb(n));

/* TeX-Ausgabe; \lnb(…) wird zu \ln|…| */
export function tex(n, aussen = 0) {
  let s = alsTex(n, aussen);
  for (let i = s.indexOf("\\lnb("); i >= 0; i = s.indexOf("\\lnb(")) {
    let tiefe = 0, j = i + 5;
    for (; j < s.length; j++) {
      if (s[j] === "(") tiefe++;
      else if (s[j] === ")") { if (tiefe === 0) break; tiefe--; }
    }
    s = `${s.slice(0, i)}\\ln|${s.slice(i + 5, j)}|${s.slice(j + 1)}`;
  }
  return s;
}

/* Basis einer Potenz: nur zusammengesetzte Terme in Klammern (x², nicht (x)²) */
export const basisTex = (n) => (["x", "e", "pi", "num"].includes(n.k) && !(n.k === "num" && n.v < 0) ? tex(n) : `(${tex(n)})`);

/* Faktor in einem Produkt: Summen und negative Terme in Klammern */
export function fakTex(n) {
  if (!n) return "";
  const t = tex(n);
  if (["+", "-", "neg"].includes(n.k) || (n.k === "num" && n.v < 0) || t.startsWith("−")) return `(${t})`;
  return tex(n, 2);
}

/* ---------- Numerischer Vergleich ---------- */

export const STELLEN = [-2.73, -1.91, -1.17, -0.61, -0.29, 0.37, 0.83, 1.29, 1.77, 2.41, 3.13, 4.07];

const fnVon = (a) => (typeof a === "function" ? a : auswerter(a));

/* gleichwertig: überall dort, wo das Soll definiert ist, liefert der Term denselben Wert */
export function gleichwertig(term, soll) {
  const g = fnVon(term), s = fnVon(soll);
  let gleich = 0;
  for (const x of STELLEN) {
    const sv = s(x);
    if (!endlich(sv)) continue;
    const gv = g(x);
    if (!endlich(gv)) return false;
    if (Math.abs(gv - sv) > 1e-6 * (1 + Math.abs(sv))) return false;
    gleich++;
  }
  return gleich >= 4;
}

/* Stammfunktion prüfen: F unterscheidet sich vom Soll nur um eine Konstante.
   Wer ln(x) statt ln|x| schreibt, ist für x > 0 richtig – das wird gemeldet, nicht bestraft. */
export function bisAufKonstante(F, soll) {
  const g = fnVon(F), s = fnVon(soll);
  const d = [];
  let nurPositiv = false;
  for (const x of STELLEN) {
    const sv = s(x);
    if (!endlich(sv)) continue;
    const gv = g(x);
    if (!endlich(gv)) { if (x < 0) { nurPositiv = true; continue; } return { ok: false }; }
    d.push(gv - sv);
  }
  if (d.length < 4) return { ok: false };
  const ok = Math.max(...d) - Math.min(...d) <= 1e-6 * (1 + Math.max(...d.map(Math.abs)));
  return { ok, nurPositiv: ok && nurPositiv, c: d[0] };
}

/* ---------- Brüche ---------- */

export function bruch(v, maxN = 1000) {
  if (!endlich(v)) return null;
  for (let n = 1; n <= maxN; n++) {
    const z = v * n, r = Math.round(z);
    if (Math.abs(z - r) < 1e-9 * Math.max(1, Math.abs(z))) return { z: r, n };
  }
  return null;
}
/* Zahl als Knoten: ganze Zahl oder Bruch z/n (nie Dezimalzahl, wenn es ein Bruch ist) */
export function zahlKnoten(v) {
  const q = bruch(v);
  if (!q) return num(v);
  const betrag = q.n === 1 ? num(Math.abs(q.z)) : div(num(Math.abs(q.z)), num(q.n));
  return q.z < 0 ? neg(betrag) : betrag;
}
/* Koeffizient · Kern ohne „1 ·“ und mit sauberem Minus */
function mitKoef(v, kern) {
  if (Math.abs(v - 1) < 1e-12) return kern;
  if (Math.abs(v + 1) < 1e-12) return neg(kern);
  const q = bruch(v);
  if (!q) return mul(num(v), kern);
  const b = q.n === 1 ? num(Math.abs(q.z)) : div(num(Math.abs(q.z)), num(q.n));
  return q.z < 0 ? neg(mul(b, kern)) : mul(b, kern);
}

/* ---------- Polynome ---------- */

const rund = (c) => (Math.abs(c - Math.round(c)) < 1e-9 ? Math.round(c) : c);
function pMul(p, q) {
  const r = new Array(p.length + q.length - 1).fill(0);
  p.forEach((a, i) => q.forEach((b, j) => { r[i + j] += a * b; }));
  return r;
}
function pAdd(p, q, s = 1) {
  const r = new Array(Math.max(p.length, q.length)).fill(0);
  p.forEach((a, i) => { r[i] += a; });
  q.forEach((b, i) => { r[i] += s * b; });
  return r;
}
/* Koeffizienten [a0, a1, …] oder null, wenn kein Polynom */
export function polyKoef(n) {
  if (!n) return null;
  switch (n.k) {
    case "num": return [n.v];
    case "x": return [0, 1];
    case "par": return polyKoef(n.a);
    case "neg": { const p = polyKoef(n.a); return p && p.map((c) => -c); }
    case "+": case "-": {
      const p = polyKoef(n.a), q = polyKoef(n.b);
      return p && q ? pAdd(p, q, n.k === "-" ? -1 : 1) : null;
    }
    case "*": {
      const p = polyKoef(n.a), q = polyKoef(n.b);
      if (!p || !q || p.length + q.length > 14) return null;
      return pMul(p, q);
    }
    case "/": {
      if (hatX(n.b) || n.b.k !== "num" || n.b.v === 0) return null;
      const p = polyKoef(n.a);
      return p && p.map((c) => c / n.b.v);
    }
    case "^": {
      if (n.b.k !== "num" || !Number.isInteger(n.b.v) || n.b.v < 0 || n.b.v > 8) return null;
      const p = polyKoef(n.a);
      if (!p) return null;
      let r = [1];
      for (let i = 0; i < n.b.v; i++) r = pMul(r, p);
      return r.length > 14 ? null : r;
    }
    default: return null;
  }
}
/* Exakte Polynomdivision p / q → Quotient oder null (Rest ≠ 0) */
function pDiv(p, q) {
  const a = p.map(rund), b = q.map(rund);
  while (b.length && Math.abs(b[b.length - 1]) < 1e-12) b.pop();
  while (a.length && Math.abs(a[a.length - 1]) < 1e-12) a.pop();
  if (!b.length || a.length < b.length) return null;
  const erg = new Array(a.length - b.length + 1).fill(0);
  for (let i = a.length - b.length; i >= 0; i--) {
    const c = a[i + b.length - 1] / b[b.length - 1];
    erg[i] = c;
    b.forEach((bv, j) => { a[i + j] -= c * bv; });
  }
  return a.slice(0, b.length - 1).every((r) => Math.abs(r) < 1e-9) ? erg.map(rund) : null;
}
const mono = (e) => (e === 0 ? null : e === 1 ? X : pow(X, num(e)));
function monoTerm(c, e) {
  const m = mono(e);
  if (!m) return zahlKnoten(Math.abs(c));
  return mitKoef(Math.abs(c), m);
}
/* Polynom in absteigender Reihenfolge, ohne +0, ·1, x¹ */
export function polyBaum(koef) {
  const k = koef.map(rund);
  const da = k.map((c, e) => [c, e]).filter(([c]) => Math.abs(c) > 1e-12);
  // 2 − 3x statt −3x + 2: bei zwei Gliedern mit führendem Minus das positive zuerst
  if (da.length === 2 && da[1][0] < 0 && da[0][0] > 0) {
    const [c0, e0] = da[0], [c1, e1] = da[1];
    return sub(monoTerm(c0, e0), monoTerm(c1, e1));
  }
  let erg = null;
  for (let e = k.length - 1; e >= 0; e--) {
    const c = k[e];
    if (Math.abs(c) < 1e-12) continue;
    const t = monoTerm(c, e);
    if (!erg) erg = c < 0 ? neg(t) : t;
    else erg = c < 0 ? sub(erg, t) : add(erg, t);
  }
  return erg || num(0);
}

/* ---------- Produkte ordnen ---------- */

/* Faktorliste mit Zahlfaktor: 3x·(−2)·sin x → { koef: −6, faktoren: [x, sin x] } */
export function faktorListe(n) {
  let koef = 1;
  const faktoren = [];
  const geh = (m) => {
    if (m.k === "par") return geh(m.a);
    if (m.k === "neg") { koef = -koef; return geh(m.a); }
    if (m.k === "num") { koef *= m.v; return; }
    if (m.k === "*") { geh(m.a); geh(m.b); return; }
    if (m.k === "/" && !hatX(m.b) && m.b.k === "num" && m.b.v !== 0) { koef /= m.b.v; geh(m.a); return; }
    if (m.k === "/" && !hatX(m.a) && m.a.k === "num" && m.a.v !== 1) { koef *= m.a.v; faktoren.push(div(num(1), m.b)); return; }
    faktoren.push(m);
  };
  geh(n);
  return { koef: rund(koef), faktoren };
}
const basisExp = (f) => (f.k === "^" && f.b.k === "num" ? [f.a, f.b.v] : [f, 1]);
function klasse(f) {
  const [b] = basisExp(f);
  if (istX(b)) return 1;
  if (polyKoef(f)) return 2;
  if (f.k === "^" && polyKoef(f.a)) return 3;
  if (f.k === "/") return 6;
  if (f.k === "fn" && f.n === "sqrt") return 4;
  return 5;
}
function produktBaum(koef, faktoren) {
  if (!faktoren.length) return zahlKnoten(koef);
  let p = faktoren[0];
  for (let i = 1; i < faktoren.length; i++) p = mul(p, faktoren[i]);
  return mitKoef(koef, p);
}
function produktOrdnen(n) {
  const { koef, faktoren } = faktorListe(n);
  if (koef === 0) return num(0);
  // gleiche Basen zusammenfassen: x · x² → x³
  const gruppen = [];
  for (const f of faktoren) {
    const [b, e] = basisExp(f);
    const t = tex(b);
    const g = gruppen.find((x) => x.t === t);
    if (g) g.e += e; else gruppen.push({ t, b, e, f });
  }
  const neu = gruppen.filter((g) => Math.abs(g.e) > 1e-12)
    .map((g) => (g.e === 1 ? g.b : pow(g.b, zahlKnoten(g.e))))
    .map((f, i) => ({ f, i, kl: klasse(f) }))
    .sort((a, b) => a.kl - b.kl || a.i - b.i)
    .map((x) => x.f);
  return produktBaum(koef, neu);
}

/* Summanden mit Vorzeichen: a − b + c → [a, −b, c] */
export function summanden(n) {
  const l = [];
  const geh = (m, vz) => {
    if (m.k === "par") return geh(m.a, vz);
    if (m.k === "+") { geh(m.a, vz); geh(m.b, vz); return; }
    if (m.k === "-") { geh(m.a, vz); geh(m.b, -vz); return; }
    l.push(vz < 0 ? neg(m) : m);
  };
  geh(n, 1);
  return l;
}
function summeBaum(teile) {
  let erg = null;
  for (const t of teile) {
    const { koef, faktoren } = faktorListe(t);
    if (koef === 0) continue;
    const betrag = produktBaum(Math.abs(koef), faktoren);
    if (!erg) erg = koef < 0 ? neg(betrag) : betrag;
    else erg = koef < 0 ? sub(erg, betrag) : add(erg, betrag);
  }
  return erg || num(0);
}

/* Schönschreiben: Polynome ausmultiplizieren, Faktoren ordnen (Zahl, x-Potenz, Klammer, Funktion) */
function schoen1(n) {
  if (!n || typeof n !== "object") return n;
  const m = { ...n };
  if (n.a) m.a = schoen1(n.a);
  if (n.b) m.b = schoen1(n.b);
  if (m.k === "+" || m.k === "-") {
    const p = polyKoef(m);
    if (p) return polyBaum(p);
    return summeBaum(summanden(m).map((t) => (t.k === "neg" ? neg(produktOrdnen(t.a)) : produktOrdnen(t))));
  }
  if (m.k === "*" || m.k === "neg") {
    const p = polyKoef(m);
    if (p && p.filter((c) => Math.abs(c) > 1e-12).length === 1) return polyBaum(p);
    return produktOrdnen(m);
  }
  if (m.k === "/") {
    const pz = polyKoef(m.a), pn = polyKoef(m.b);
    if (pz && pn && hatX(m.b)) { const q = pDiv(pz, pn); if (q) return polyBaum(q); }
    // Zahlfaktor des Zählers vor den Bruch, wenn der Zähler sonst nur aus Faktoren besteht
    if (m.a.k === "num" && m.a.v < 0) return neg(div(num(-m.a.v), m.b));
    if (m.a.k === "neg") return neg(div(m.a.a, m.b));
    return m;
  }
  return m;
}
export function schoen(n) {
  if (!n) return n;
  try {
    const s = schoen1(vereinfache(n));
    return gleichwertig(s, n) ? s : vereinfache(n);
  } catch (e) {
    return n;
  }
}

/* Gemeinsame Funktionsfaktoren ausklammern: 2x·e^{3x} + 3x²·e^{3x} → (3x² + 2x)·e^{3x}.
   Gibt null zurück, wenn es nichts Sinnvolles auszuklammern gibt. */
export function ausklammern(n) {
  if (n && n.k === "/") { const z = ausklammern(n.a); return z ? div(z, n.b) : null; }
  if (n && n.k === "neg" && n.a.k === "/") { const z = ausklammern(n.a.a); return z ? neg(div(z, n.a.b)) : null; }
  if (!n || !["+", "-"].includes(n.k)) return null;
  const teile = summanden(n).map(faktorListe);
  if (teile.length < 2) return null;
  const listen = teile.map((t) => t.faktoren.map((f) => { const [b, e] = basisExp(f); return { t: tex(b), b, e, kl: klasse(f) }; }));
  const gemeinsam = [];
  for (const kand of listen[0]) {
    const klammer = ["+", "-"].includes(kand.b.k);          // (2x + 1)² darf heraus
    if (kand.kl < 3 && !klammer) continue;                   // x-Potenzen und Polynome bleiben in der Klammer
    if (gemeinsam.some((g) => g.t === kand.t)) continue;
    const exps = listen.map((l) => l.filter((f) => f.t === kand.t).reduce((s, f) => s + f.e, 0));
    if (exps.some((e) => e === 0) || exps.some((e) => typeof e !== "number")) continue;
    const e = Math.min(...exps);
    if (e <= 0) continue;
    gemeinsam.push({ t: kand.t, b: kand.b, e });
  }
  if (!gemeinsam.length) return null;
  const rest = teile.map((t, i) => {
    const uebrig = [];
    const verbrauch = Object.fromEntries(gemeinsam.map((g) => [g.t, g.e]));
    listen[i].forEach((f, j) => {
      const g = verbrauch[f.t];
      if (g === undefined) { uebrig.push(t.faktoren[j]); return; }
      const bleibt = f.e - g;
      verbrauch[f.t] = Math.max(0, g - f.e);
      if (bleibt > 1e-12) uebrig.push(bleibt === 1 ? f.b : pow(f.b, zahlKnoten(bleibt)));
    });
    return produktBaum(t.koef, uebrig);
  });
  let klammer = rest[0];
  for (let i = 1; i < rest.length; i++) klammer = add(klammer, rest[i]);
  klammer = schoen(klammer);
  let erg = klammer;
  // Vorzeichen der Klammer: führendes Minus vor das Produkt ziehen
  let vorn = false;
  if (erg.k === "neg") { erg = erg.a; vorn = true; }
  gemeinsam.sort((p, q) => (["+", "-"].includes(q.b.k) ? 1 : 0) - (["+", "-"].includes(p.b.k) ? 1 : 0));
  for (const g of gemeinsam) erg = mul(erg, g.e === 1 ? g.b : pow(g.b, zahlKnoten(g.e)));
  if (vorn) erg = neg(erg);
  if (!gleichwertig(erg, n)) return null;
  if (tex(erg) === tex(n)) return null;
  return erg;
}

/* ---------- Zerlegung ---------- */

/* Produkt: u · v mit zwei nicht konstanten Faktoren; ein Zahlfaktor bleibt bei u */
export function zerlegeProdukt(n) {
  if (!n) return null;
  const { koef, faktoren } = faktorListe(n);
  const nk = faktoren.filter(hatX);
  if (nk.length < 2 || nk.length !== faktoren.length) return null;
  const u = produktBaum(koef, [nk[0]]);
  const v = produktBaum(1, nk.slice(1));
  return { u, v };
}
export function zerlegeQuotient(n) {
  let m = n, vz = 1;
  while (m && m.k === "neg") { vz = -vz; m = m.a; }
  if (!m || m.k !== "/" || !hatX(m.b)) return null;
  return { u: vz < 0 ? neg(m.a) : m.a, v: m.b, reziprok: !hatX(m.a) };
}
/* Kettenregel: f = u(v(x)) mit äußerer Funktion u (in x geschrieben) und innerer Funktion v ≠ x */
export function zerlegeKette(n) {
  if (!n || !hatX(n)) return null;
  const { koef, faktoren } = faktorListe(n);
  if (faktoren.length !== 1) return null;
  const f = faktoren[0];
  let aussen = null, innen = null;
  if ((f.k === "fn" || f.k === "log") && !istX(f.a) && hatX(f.a)) { aussen = { ...f, a: X }; innen = f.a; }
  else if (f.k === "^" && hatX(f.a) && !hatX(f.b) && !istX(f.a)) { aussen = pow(X, f.b); innen = f.a; }
  else if (f.k === "^" && !hatX(f.a) && hatX(f.b) && !istX(f.b)) { aussen = pow(f.a, X); innen = f.b; }
  else if (f.k === "/" && !hatX(f.a) && hatX(f.b) && !istX(f.b)) {
    const be = basisExp(f.b);
    if (be[1] !== 1 && !istX(be[0])) { aussen = div(f.a, pow(X, num(be[1]))); innen = be[0]; }
    else { aussen = div(f.a, X); innen = f.b; }
  }
  if (!aussen) return null;
  return { u: mitKoef(koef, aussen), v: innen };
}
export function istLinear(n) {
  if (!n || !hatX(n)) return false;
  const d = ableitung(n);
  if (hatX(d)) return false;
  const a = auswerter(d)(0);
  return endlich(a) && Math.abs(a) > 1e-12;
}

/* Welche Regel braucht man, um n abzuleiten? (für Nebenrechnungen) */
export function regelFuer(n) {
  if (!n || !hatX(n)) return { art: "konst" };
  const p = zerlegeProdukt(n);
  if (p) return { art: "produkt", ...p };
  const q = zerlegeQuotient(n);
  if (q) return q.reziprok ? { art: "reziprok", c: q.u, v: q.v } : { art: "quotient", u: q.u, v: q.v };
  const k = zerlegeKette(n);
  if (k) return { art: istLinear(k.v) ? "linkette" : "kette", ...k };
  if (n.k === "+" || n.k === "-") {
    const teile = summanden(n);
    const schwer = teile.some((t) => { const r = regelFuer(t); return !["grund", "konst"].includes(r.art); });
    return { art: schwer ? "summe" : "grund" };
  }
  return { art: "grund" };
}

/* ---------- Die Regeln ---------- */

export const REGELN = {
  produkt: {
    name: "Produktregel", kurz: "Produkt", felder: ["u", "v"],
    formel: "f′(x) = u′(x) \\cdot v(x) + u(x) \\cdot v′(x)",
    fBild: "f(x) = u(x) \\cdot v(x)",
  },
  quotient: {
    name: "Quotientenregel", kurz: "Quotient", felder: ["u", "v"],
    formel: "f′(x) = \\frac{u′(x) \\cdot v(x) - u(x) \\cdot v′(x)}{(v(x))^{2}}",
    fBild: "f(x) = \\frac{u(x)}{v(x)}",
  },
  reziprok: {
    name: "Reziprokenregel", kurz: "Reziprok", felder: ["v"],
    formel: "f′(x) = -\\frac{v′(x)}{(v(x))^{2}}",
    fBild: "f(x) = \\frac{1}{v(x)}",
  },
  linkette: {
    name: "Lineare Kettenregel", kurz: "Lin. Kette", felder: ["u", "v"],
    formel: "f′(x) = m \\cdot u′(mx + c)",
    fBild: "f(x) = u(mx + c)",
  },
  kette: {
    name: "Kettenregel", kurz: "Kette", felder: ["u", "v"],
    formel: "f′(x) = u′(v(x)) \\cdot v′(x)",
    fBild: "f(x) = u(v(x))",
  },
};

/* Aus den Teilen u, v (Bäume) die Funktion f bauen */
export function baueF(regel, u, v) {
  if (regel === "produkt") return mul(u, v);
  if (regel === "quotient") return div(u, v);
  if (regel === "reziprok") return div(num(1), v);
  return einsetzen(u, v);
}

/* Musterlösung zu einer Regel: alle Teile, eingesetzte Regel (farbig), Ergebnis */
export function musterloesung(regel, u, v) {
  const f = baueF(regel, u, v);
  const fs = { f, regel };
  const T = (n) => tex(schoen(n));
  if (regel === "produkt" || regel === "quotient") {
    const u1 = schoen(ableitung(u)), v1 = schoen(ableitung(v));
    Object.assign(fs, { u, v, u1, v1 });
    const fu1 = `\\farbe{u}{${fakTex(u1)}}`, fv = `\\farbe{v}{${fakTex(v)}}`, fu = `\\farbe{u}{${fakTex(u)}}`, fv1 = `\\farbe{v}{${fakTex(v1)}}`;
    if (regel === "produkt") {
      fs.roh = add(mul(u1, v), mul(u, v1));
      fs.einsetzen = `${fu1} \\cdot ${fv} + ${fu} \\cdot ${fv1}`;
    } else {
      fs.roh = div(sub(mul(u1, v), mul(u, v1)), pow(v, num(2)));
      fs.einsetzen = `\\frac{${fu1} \\cdot ${fv} - ${fu} \\cdot ${fv1}}{\\farbe{v}{${basisTex(v)}}^{2}}`;
    }
  } else if (regel === "reziprok") {
    const v1 = schoen(ableitung(v));
    Object.assign(fs, { v, v1 });
    fs.roh = neg(div(v1, pow(v, num(2))));
    fs.einsetzen = `-\\frac{\\farbe{v}{${tex(v1)}}}{\\farbe{v}{${basisTex(v)}}^{2}}`;
  } else {
    // Kettenregeln: u äußere, v innere Funktion
    const u1 = schoen(ableitung(u)), v1 = schoen(ableitung(v));
    const uv = schoen(einsetzen(u1, v));
    Object.assign(fs, { u, v, u1, v1, uv });
    fs.roh = mul(einsetzen(u1, v), v1);
    if (regel === "linkette") {
      fs.m = v1;
      fs.einsetzen = `\\farbe{v}{${fakTex(v1)}} \\cdot \\farbe{u}{${fakTex(uv)}}`;
      fs.roh = mul(v1, einsetzen(u1, v));
    } else {
      fs.einsetzen = `\\farbe{u}{${fakTex(uv)}} \\cdot \\farbe{v}{${fakTex(v1)}}`;
    }
  }
  const soll = ableitung(f);
  let erg = schoen(fs.roh);
  if (!gleichwertig(erg, soll)) erg = schoen(soll);
  fs.ergebnis = erg;
  fs.ausgeklammert = ausklammern(erg);
  fs.soll = soll;
  fs.T = T;
  return fs;
}

/* ---------- Aufgaben ---------- */

const pm = () => (Math.random() < 0.5 ? 1 : -1);
const k1 = (k) => (k === 1 ? "" : k === -1 ? "-" : `${k}`);
const mon = (k, n) => (n === 0 ? `${k}` : `${k1(k)}x${n === 1 ? "" : `^${n}`}`);
const plusTxt = (k) => (k < 0 ? `-${Math.abs(k)}` : `+${k}`);
const linTxt = (a, b) => `${k1(a)}x${b ? plusTxt(b) : ""}`;
const linTxtRev = (b, a) => `${b}${a < 0 ? "-" : "+"}${Math.abs(a) === 1 ? "" : Math.abs(a)}x`;
const quad = () => { const a = wahl([1, 1, 2, 3]), c = ohneNull(-4, 5); return `${k1(a)}x^2${plusTxt(c)}`; };
const pmK = (b) => `${b < 0 ? "-" : "+"}${k1(Math.abs(b))}`;
const quadB = () => { const b = ohneNull(-4, 4), c = ohneNull(-5, 5); return `x^2${pmK(b)}x${plusTxt(c)}`; };
const grund = () => wahl(["sin(x)", "cos(x)", "e^x", "ln(x)"]);
const linAussen = () => wahl(["sin(x)", "cos(x)", "e^x", `x^${ganz(2, 5)}`, "sqrt(x)", "e^x"]);

const GEN = {
  produkt: [
    () => ({ u: mon(wahl([1, 1, 2, 3, -2]), ganz(2, 4)), v: grund() }),
    () => wahl([
      () => ({ u: wahl([quad(), linTxt(ohneNull(1, 4), ohneNull(-5, 5)), `x^3${pmK(ohneNull(-4, 4))}x`]), v: wahl(["e^x", "sin(x)", "cos(x)", "ln(x)", "sqrt(x)"]) }),
      () => ({ u: "sin(x)", v: wahl(["cos(x)", "e^x"]) }),
      () => ({ u: mon(ganz(1, 3), ganz(2, 3)), v: wahl(["sqrt(x)", "ln(x)"]) }),
    ])(),
    () => ({ u: wahl([quadB(), mon(ganz(1, 3), ganz(2, 3)), "sqrt(x)"]), v: wahl([`e^(${k1(ohneNull(-3, 3))}x)`, `sin(${ganz(2, 4)}x)`, `cos(${ganz(2, 4)}x)`, `e^(${linTxt(ganz(2, 3), ohneNull(-3, 3))})`]) }),
  ],
  quotient: [
    () => { const u = wahl(["x", linTxt(ganz(1, 3), ohneNull(-4, 4)), "x^2", `${ganz(2, 5)}x`]); let v; do { v = wahl([linTxt(1, ohneNull(-4, 4)), "x^2+1", linTxt(ganz(2, 3), ohneNull(-3, 3)), `x^2${plusTxt(ganz(1, 4))}`]); } while (v === u); return { u, v }; },
    () => wahl([
      () => ({ u: wahl([quad(), "x^2-4", `${ganz(2, 4)}x^2`]), v: wahl(["x^2+1", linTxt(1, ohneNull(-3, 3)), `x^2${plusTxt(ganz(2, 5))}`]) }),
      () => ({ u: wahl(["sin(x)", "e^x", "cos(x)"]), v: wahl(["x", "x^2+1", linTxt(1, ganz(1, 3))]) }),
    ])(),
    () => wahl([
      () => ({ u: "ln(x)", v: wahl(["x", "x^2"]) }),
      () => ({ u: "e^x", v: wahl(["x^2+1", linTxt(1, ganz(1, 3))]) }),
      () => ({ u: wahl(["x^2", `${ganz(2, 3)}x`]), v: "e^x" }),
      () => ({ u: "x^2-1", v: "x^2+1" }),
      () => ({ u: "sqrt(x)", v: linTxt(1, ganz(1, 3)) }),
      () => ({ u: "sin(x)", v: wahl(["cos(x)+2", "x^2+1"]) }),
    ])(),
  ],
  reziprok: [
    () => ({ v: wahl([`x^2${plusTxt(ohneNull(-4, 5))}`, linTxt(ganz(1, 4), ohneNull(-5, 5)), `x^3${plusTxt(ganz(1, 4))}`, `${ganz(2, 3)}x^2+1`]) }),
    () => ({ v: wahl([`x^3${pmK(ohneNull(-4, 4))}x`, "e^x+1", `x^4-${ganz(2, 4)}x^2+1`, "sqrt(x)+1", quadB()]) }),
    () => ({ v: wahl([`sin(x)+${ganz(2, 3)}`, "cos(x)", `e^(${ganz(2, 3)}x)+x`, "ln(x)", "x+e^x", `${ganz(2, 3)}+cos(x)`]) }),
  ],
  linkette: [
    () => ({ u: linAussen(), v: `${ganz(2, 5)}x` }),
    () => ({ u: linAussen(), v: linTxt(ganz(2, 5), ohneNull(-5, 5)) }),
    () => wahl([
      () => ({ u: `${wahl([2, 3, -2, 4])}${wahl(["sin(x)", "cos(x)", "e^x"])}`, v: linTxtRev(ganz(1, 5), -ganz(2, 4)) }),
      () => ({ u: `x^${ganz(3, 5)}`, v: linTxtRev(ganz(1, 4), -ganz(2, 3)) }),
      () => ({ u: wahl(["sqrt(x)", "ln(x)"]), v: linTxt(ganz(2, 5), ohneNull(-3, 3)) }),
      () => ({ u: `${wahl([2, 3, 5])}/x`, v: linTxt(ganz(2, 4), ohneNull(-3, 3)) }),
    ])(),
  ],
  kette: [
    () => wahl([
      () => ({ u: `x^${ganz(2, 5)}`, v: wahl([quad(), quadB(), `x^3${plusTxt(ohneNull(-4, 4))}`]) }),
      () => ({ u: "e^x", v: wahl(["x^2", "-x^2", `x^2${plusTxt(ohneNull(-3, 3))}`, `${ganz(2, 3)}x^2`]) }),
    ])(),
    () => wahl([
      () => ({ u: wahl(["sin(x)", "cos(x)"]), v: wahl(["x^2", `x^2${plusTxt(ohneNull(-3, 3))}`, `x^3`]) }),
      () => ({ u: "sqrt(x)", v: wahl([`x^2+${ganz(1, 9)}`, `x^3+1`]) }),
      () => ({ u: "ln(x)", v: wahl(["x^2+1", `x^2+${ganz(2, 5)}`]) }),
      () => ({ u: `x^${ganz(3, 5)}`, v: `x^3${pmK(ohneNull(-3, 3))}x` }),
      () => ({ u: "e^x", v: `x^3${pmK(ohneNull(-3, 3))}x` }),
    ])(),
    () => wahl([
      () => ({ u: "e^x", v: wahl(["sin(x)", "cos(x)"]) }),
      () => ({ u: `x^${ganz(2, 4)}`, v: wahl(["sin(x)", "cos(x)", "ln(x)"]) }),
      () => ({ u: wahl(["sin(x)", "cos(x)"]), v: "e^x" }),
      () => ({ u: "sqrt(x)", v: "e^x+1" }),
      () => ({ u: "ln(x)", v: wahl(["e^x+1", "x^4+1"]) }),
      () => ({ u: `${ganz(2, 3)}sin(x)`, v: "x^2+x" }),
    ])(),
  ],
  kombo: [
    () => wahl([
      () => ({ art: "produkt", u: mon(1, ganz(1, 3)), v: `e^(${k1(ohneNull(-3, 3))}x)` }),
      () => ({ art: "produkt", u: wahl(["x", "x^2"]), v: `${wahl(["sin", "cos"])}(${ganz(2, 4)}x)` }),
      () => ({ art: "produkt", u: linTxt(1, ohneNull(-3, 3)), v: `e^(${k1(ohneNull(-2, 2))}x)` }),
    ])(),
    () => wahl([
      () => ({ art: "produkt", u: "x", v: wahl(["e^(x^2)", "e^(-x^2)", "sqrt(x^2+1)", "ln(x^2+1)", "sin(x^2)"]) }),
      () => ({ art: "produkt", u: wahl(["x^2+1", "x^2", "x^3"]), v: wahl(["e^(-x)", "e^(2x)", "cos(x^2)", "sin(3x)"]) }),
      () => ({ art: "produkt", u: mon(1, ganz(2, 3)), v: `(${linTxt(ganz(2, 3), ohneNull(-3, 3))})^${ganz(3, 4)}` }),
    ])(),
    () => wahl([
      () => ({ art: "produkt", u: "e^(-x^2)", v: `sin(${ganz(2, 3)}x)` }),
      () => ({ art: "produkt", u: `(${linTxt(2, 1)})^3`, v: "e^(-x)" }),
      () => ({ art: "produkt", u: "x^2", v: "ln(x^2+1)" }),
      () => ({ art: "produkt", u: "e^(2x)", v: "cos(x^2)" }),
      () => ({ art: "kette", u: "e^x", v: wahl(["x*sin(x)", "x*cos(x)", "x^2*ln(x)"]) }),
      () => ({ art: "kette", u: "sqrt(x)", v: wahl(["x*e^x", "x*e^(-x)+2"]) }),
      () => ({ art: "kette", u: `x^${ganz(2, 3)}`, v: wahl(["x*e^x", "x*sin(x)"]) }),
    ])(),
  ],
};

/* Neue Aufgabe zu einer Regel und Stufe 1–3: { regel, u, v } (Texte) */
export function neueAufgabe(regel, stufe = 1) {
  const g = GEN[regel] || GEN.produkt;
  for (let i = 0; i < 40; i++) {
    const a = g[Math.max(0, Math.min(2, stufe - 1))]();
    const r = regel === "kombo" ? a.art : regel;
    const u = r === "reziprok" ? null : lies(a.u), v = lies(a.v);
    if (r !== "reziprok" && !u) continue;
    if (!v) continue;
    const f = baueF(r, u, v);
    // Sinnvoll: f ist definiert und die Ableitung nicht überall null
    const ff = auswerter(f), fd = auswerter(ableitung(f));
    const ok = STELLEN.filter((x) => endlich(ff(x)) && endlich(fd(x))).length >= 5;
    if (!ok) continue;
    return { regel: r, uText: a.u || "", vText: a.v, u, v, f };
  }
  const u = lies("x^2"), v = lies("sin(x)");
  return { regel: "produkt", uText: "x^2", vText: "sin(x)", u, v, f: mul(u, v) };
}

/* Typische Fehler zu einer Regel: [Baum, Hinweis] — für die Rückmeldung im Training */
export function fehlerbilder(regel, u, v) {
  if (!v) return [];
  const u1 = u ? ableitung(u) : null, v1 = ableitung(v);
  if (regel === "produkt") return [
    [mul(u1, v1), "Achtung: (u·v)′ ist nicht u′·v′. Es gilt u′·v + u·v′."],
    [mul(u1, v), "Der zweite Summand u·v′ fehlt."],
    [mul(u, v1), "Der erste Summand u′·v fehlt."],
  ];
  if (regel === "quotient") return [
    [div(sub(mul(u, v1), mul(u1, v)), pow(v, num(2))), "Reihenfolge im Zähler vertauscht: Es heißt u′·v − u·v′ („NAZ minus ZAN“)."],
    [sub(mul(u1, v), mul(u, v1)), "Der Nenner (v(x))² fehlt."],
    [div(u1, v1), "Achtung: (u/v)′ ist nicht u′/v′. Nutze die Quotientenregel."],
    [div(sub(mul(u1, v), mul(u, v1)), v), "Im Nenner muss v(x) zum Quadrat stehen."],
  ];
  if (regel === "reziprok") return [
    [div(v1, pow(v, num(2))), "Das Minuszeichen fehlt: (1/v)′ = −v′/v²."],
    [div(num(1), v1), "Achtung: (1/v)′ ist nicht 1/v′. Nutze die Reziprokenregel."],
    [neg(div(v1, v)), "Im Nenner muss v(x) zum Quadrat stehen."],
  ];
  // Kettenregeln
  return [
    [einsetzen(u1, v), "Die innere Ableitung fehlt: Du musst noch mit v′(x) multiplizieren („nachdifferenzieren“)."],
    [mul(u1, v1), "Die äußere Ableitung muss an der Stelle v(x) stehen: u′(v(x)), nicht u′(x)."],
    [mul(einsetzen(u1, v), v), "Multipliziert wird mit der Ableitung der inneren Funktion v′(x), nicht mit v(x)."],
  ];
}

/* Kurze Diagnose, wenn ein Term nicht passt */
export function diagnose(term, soll, bilder = []) {
  for (const [b, text] of bilder) if (b && gleichwertig(term, b)) return text;
  if (gleichwertig(term, neg(soll))) return "Fast! Das Vorzeichen ist gedreht – prüfe, wo ein Minus verloren gegangen ist.";
  const g = fnVon(term), s = fnVon(soll);
  const werte = STELLEN.map((x) => ({ m: g(x), s: s(x) })).filter((w) => endlich(w.m) && endlich(w.s) && Math.abs(w.s) > 1e-9);
  if (werte.length >= 4) {
    const q = werte.map((w) => w.m / w.s);
    if (Math.max(...q) - Math.min(...q) < 1e-6 && Math.abs(q[0] - 1) > 1e-6)
      return `Die Form stimmt, aber ein konstanter Faktor ist falsch (dein Term ist das ${String(Math.round(q[0] * 100) / 100).replace(".", ",").replace("-", "−")}-Fache).`;
  }
  const x0 = 1.29, mv = g(x0), sv = s(x0);
  const dz = (v) => String(Math.round(v * 1000) / 1000).replace(".", ",").replace("-", "−");
  if (endlich(mv) && endlich(sv)) return `Noch nicht richtig: Bei x = 1,29 liefert dein Term ${dz(mv)}, richtig wäre ${dz(sv)}.`;
  return "Noch nicht richtig.";
}

/* ============================================================
   Stammfunktionen
   ============================================================ */

/* Ist n = m·x + c mit m ≠ 0? → { m, c } */
function linear(n) {
  if (istX(n)) return { m: 1, c: 0 };
  if (!istLinear(n)) return null;
  const g = auswerter(n), c = g(0), m = g(1) - c;
  return endlich(m) && endlich(c) ? { m: rund(m), c: rund(c) } : null;
}
/* n als Potenz basis^r mit konstantem r (x, x^r, √…, 1/…) */
function alsPotenz(n) {
  if (istX(n) || (n.k !== "^" && n.k !== "fn" && n.k !== "/" && linear(n))) return { b: n, r: 1, k: 1 };
  if (n.k === "^" && hatX(n.a) && !hatX(n.b)) {
    const r = auswerter(n.b)(0);
    return endlich(r) ? { b: n.a, r, k: 1 } : null;
  }
  if (n.k === "fn" && n.n === "sqrt") return { b: n.a, r: 0.5, k: 1 };
  if (n.k === "/" && !hatX(n.a) && hatX(n.b)) {
    const k = auswerter(n.a)(0);
    const p = alsPotenz(n.b);
    return p && endlich(k) ? { b: p.b, r: -p.r, k: k * p.k } : null;
  }
  return null;
}

const REGELTEXT = {
  potenz: "Potenzregel rückwärts: Exponent um 1 erhöhen, durch den neuen Exponenten teilen.",
  konst: "Konstante: aus k wird k · x.",
  ln: "Aus 1/x wird ln|x|.",
  sin: "Aus sin(x) wird −cos(x).",
  cos: "Aus cos(x) wird sin(x).",
  exp: "eˣ bleibt eˣ.",
  ax: "Aus aˣ wird aˣ / ln(a).",
};

/* Stammfunktion eines Summanden: { F, regel, linear } oder null */
function stammSummand(t) {
  const { koef, faktoren } = faktorListe(t);
  if (!faktoren.length) return { F: mitKoef(koef, X), regel: REGELTEXT.konst };
  if (faktoren.length > 1) return null;
  const g = faktoren[0];
  const potenz = alsPotenz(g);
  if (potenz) {
    const lin = linear(potenz.b);
    if (!lin) return null;
    const k = koef * potenz.k, r = rund(potenz.r);
    const linTxt = lin.m !== 1 || lin.c !== 0;
    if (Math.abs(r + 1) < 1e-12) {
      const kern = { k: "fn", n: "lnb", a: potenz.b };
      return { F: mitKoef(rund(k / lin.m), kern), regel: REGELTEXT.ln, linear: linTxt ? lin : null };
    }
    const s = rund(r + 1), c = rund(k / (lin.m * s));
    let F;
    if (s < 0) {
      const q = bruch(Math.abs(c)) || { z: Math.abs(c), n: 1 };
      const nenner = Math.abs(s) === 1 ? potenz.b : pow(potenz.b, zahlKnoten(Math.abs(s)));
      const b = div(num(q.z), q.n === 1 ? nenner : mul(num(q.n), nenner));
      F = c < 0 ? neg(b) : b;
    } else {
      const kern = s === 1 ? potenz.b : pow(potenz.b, zahlKnoten(s));
      F = mitKoef(c, kern);
    }
    return { F, regel: istX(potenz.b) && potenz.r === 0 ? REGELTEXT.konst : REGELTEXT.potenz, linear: linTxt ? lin : null };
  }
  if (g.k === "fn" && (g.n === "sin" || g.n === "cos")) {
    const lin = linear(g.a);
    if (!lin) return null;
    const linTxt = lin.m !== 1 || lin.c !== 0;
    if (g.n === "sin") return { F: mitKoef(rund(-koef / lin.m), fn("cos", g.a)), regel: REGELTEXT.sin, linear: linTxt ? lin : null };
    return { F: mitKoef(rund(koef / lin.m), fn("sin", g.a)), regel: REGELTEXT.cos, linear: linTxt ? lin : null };
  }
  if (g.k === "^" && !hatX(g.a) && hatX(g.b)) {
    const lin = linear(g.b);
    if (!lin) return null;
    const linTxt = lin.m !== 1 || lin.c !== 0;
    if (g.a.k === "e") return { F: mitKoef(rund(koef / lin.m), g), regel: REGELTEXT.exp, linear: linTxt ? lin : null };
    const a = auswerter(g.a)(0);
    if (!(a > 0) || a === 1) return null;
    const vor = rund(koef / lin.m);
    const F = div(mitKoef(vor, g), fn("ln", g.a));
    return { F, regel: REGELTEXT.ax, linear: linTxt ? lin : null };
  }
  return null;
}

/* Stammfunktion von f: { teile: [{ f, F, regel, linear }], F } oder null.
   Polynome werden vorher ausmultipliziert, Summen gliedweise integriert. */
export function stammfunktion(f) {
  if (!f) return null;
  const direkt = stammAusTeilen(f, summanden(f));
  if (direkt) return direkt;
  let teile;
  const p = polyKoef(f);
  if (p) {
    teile = [];
    for (let e = p.length - 1; e >= 0; e--) {
      const c = rund(p[e]);
      if (Math.abs(c) < 1e-12) continue;
      const t = monoTerm(c, e);
      teile.push(c < 0 ? neg(t) : t);
    }
    if (!teile.length) teile = [num(0)];
  } else return null;
  return stammAusTeilen(f, teile);
}
function stammAusTeilen(f, teile) {
  const erg = [];
  for (const t of teile) {
    if (t.k === "num" && t.v === 0) continue;
    const s = stammSummand(t);
    if (!s) return null;
    erg.push({ f: t, ...s });
  }
  if (!erg.length) return { teile: [], F: num(0) };
  let F = null;
  for (const t of erg) {
    if (!F) F = t.F;
    else F = t.F.k === "neg" ? sub(F, t.F.a) : add(F, t.F);
  }
  // Probe: F′ = f
  const Fd = auswerter(F);
  const h = 1e-5;
  const ok = gleichwertig((x) => (Fd(x + h) - Fd(x - h)) / (2 * h), (x) => {
    const v = auswerter(f)(x);
    return endlich(v) && Math.abs(v) < 1e6 ? v : NaN;
  });
  if (!ok) return null;
  return { teile: erg, F };
}

/* Ableitung von F für die Probe (ln|x| wird wie ln abgeleitet) */
export function probe(F, f) {
  const d = schoen(ableitung(lnbAlsLn(F)));
  if (f && (tex(d).length > tex(f).length || !gleichwertig(d, f))) return schoen(f);
  return d;
}

/* ---------- Zahlen und Grenzen ---------- */

export function dez(v, stellen = 4) {
  if (!endlich(v)) return "–";
  const r = Math.round(v * 10 ** stellen) / 10 ** stellen;
  return (Object.is(r, -0) ? "0" : String(r)).replace(".", ",").replace("-", "−");
}
/* Zahl (auch π/2, e, 1/3) lesen → { v, baum } */
export function grenzeLesen(text) {
  const b = lies(String(text || "").replace(/π/g, "pi"));
  if (!b || hatX(b)) return null;
  const v = auswerter(b)(0);
  return endlich(v) ? { v, baum: b } : null;
}
/* Zahlwert in TeX: Bruch, wenn möglich, sonst gerundet */
export function zahlTex(v) {
  const q = bruch(v, 200);
  if (q) {
    if (q.n === 1) return String(q.z).replace("-", "−");
    return `${q.z < 0 ? "−" : ""}\\frac{${Math.abs(q.z)}}{${q.n}}`;
  }
  return null;
}

/* Hauptsatz: ∫ₐᵇ f(x) dx = F(b) − F(a) — mit allen Zwischenschritten */
export function hauptsatz(f, a, b) {
  const st = stammfunktion(f);
  if (!st) return { fehler: "stamm" };
  const fn0 = auswerter(f);
  // Stetigkeit auf [a; b] prüfen
  const lo = Math.min(a.v, b.v), hi = Math.max(a.v, b.v);
  let xMax = lo, yMax = -1;
  for (let i = 0; i <= 1200; i++) {
    const x = lo + ((hi - lo) * i) / 1200, y = fn0(x);
    if (!endlich(y) || Math.abs(y) > 1e7) return { fehler: "stetig", stelle: x, st };
    if (Math.abs(y) > yMax) { yMax = Math.abs(y); xMax = x; }
  }
  // Polstelle in der Nähe des größten Betrags? Dann wächst |f| beim Heranzoomen weiter.
  let vorher = yMax, wachsend = 0;
  for (const d of [1e-3, 1e-5, 1e-7, 1e-9]) {
    const w = Math.max(...[xMax - d, xMax + d].filter((x) => x >= lo && x <= hi).map((x) => Math.abs(fn0(x))).map((y) => (endlich(y) ? y : Infinity)));
    if (!endlich(w) || w > 50 * vorher) wachsend++;
    vorher = Math.max(vorher, w);
  }
  if (wachsend >= 2) return { fehler: "stetig", stelle: xMax, st };
  const F = st.F, Fn = auswerter(F);
  const Fb = Fn(b.v), Fa = Fn(a.v), wert = Fb - Fa;
  const nurPoly = !!polyKoef(F);
  const qa = bruch(a.v, 200), qb = bruch(b.v, 200);
  const exakt = nurPoly && qa && qb;
  const einsetzenTex = (g) => tex(einsetzen(F, g.baum)).replace(/\\frac\{([^{}]+)\}\{1\}/g, "$1");
  const glatt = (v) => { const q = bruch(v, 12); return q && Math.abs(q.z / q.n - v) < 1e-11; };
  const exTex = (v) => (exakt || glatt(v) ? zahlTex(v) : null);
  return {
    st, F, Fb, Fa, wert,
    FbTex: einsetzenTex(b), FaTex: einsetzenTex(a),
    FbWert: exTex(Fb), FaWert: exTex(Fa), wertTex: exTex(wert), exakt: !!exakt,
  };
}

/* ---------- Aufgaben: Stammfunktion und Integral ---------- */

const potMon = () => mon(ohneNull(-5, 6), ganz(1, 5));
export const STAMM_ARTEN = [
  { id: "potenz", name: "Potenzregel" },
  { id: "speziell", name: "sin, cos, eˣ, 1/x" },
  { id: "linear", name: "Lineare Substitution" },
  { id: "gemischt", name: "Gemischt" },
];
const STAMM_GEN = {
  potenz: [
    () => wahl([mon(ganz(1, 5) * wahl([1, 2, 3]), ganz(1, 4)), `${ohneNull(2, 9)}`]),
    () => { const n = ganz(2, 4); return `${mon(ganz(1, 4) * (n + 1), n)}${pmK(ohneNull(-6, 6))}x${plusTxt(ohneNull(-5, 5))}`; },
    () => wahl([`1/x^${ganz(2, 3)}`, `${ganz(2, 6)}/x^2`, "sqrt(x)", `${ganz(2, 4)}sqrt(x)`, `x^3+1/x^2`, `${ganz(2, 4)}x-${ganz(2, 4)}/x^2`]),
  ],
  speziell: [
    () => wahl(["sin(x)", "cos(x)", "e^x", "1/x", `${ganz(2, 5)}cos(x)`, `-${ganz(2, 4)}sin(x)`, `${ganz(2, 5)}e^x`, `${ganz(2, 5)}/x`]),
    () => wahl([`sin(x)+cos(x)`, `${ganz(2, 4)}x+cos(x)`, `e^x-sin(x)`, `x^2+1/x`, `${ganz(2, 3)}cos(x)-e^x`, `x^3+sin(x)`]),
    () => wahl([`${ganz(2, 4)}e^x-${ganz(2, 5)}/x+x^2`, `4x^3-2sin(x)+3/x`, `cos(x)-sin(x)+e^x`, `2^x`, `${ganz(2, 3)}^x+x`]),
  ],
  linear: [
    () => wahl([`e^(${ganz(2, 4)}x)`, `sin(${ganz(2, 4)}x)`, `cos(${ganz(2, 4)}x)`, `e^(-x)`]),
    () => wahl([`(${linTxt(ganz(2, 3), ohneNull(-3, 3))})^${ganz(2, 4)}`, `e^(${linTxt(ganz(2, 3), ohneNull(-3, 3))})`, `cos(${linTxt(ganz(2, 3), ohneNull(-2, 2))})`, `1/(${linTxt(ganz(2, 3), ganz(1, 4))})`]),
    () => wahl([`sqrt(${linTxt(ganz(2, 4), ganz(1, 3))})`, `${ganz(2, 6)}/(${linTxt(ganz(2, 3), -ganz(1, 3))})^2`, `${ganz(2, 4)}sin(${linTxtRev(ganz(1, 3), -2)})`, `(${linTxtRev(ganz(1, 3), -ganz(2, 3))})^${ganz(3, 4)}`, `e^(${linTxtRev(ganz(1, 3), -ganz(2, 3))})`]),
  ],
};
STAMM_GEN.gemischt = [
  () => `${potMon()}${wahl(["+", "-"])}${wahl(["sin(x)", "cos(x)", "e^x", "2/x"])}`,
  () => `${potMon()}+${wahl([`e^(${ganz(2, 3)}x)`, `cos(${ganz(2, 3)}x)`, `sin(${ganz(2, 3)}x)`])}`,
  () => `${wahl([`${ganz(2, 4)}/x^2`, "sqrt(x)", `1/(${linTxt(2, 1)})`])}+${wahl([`e^(${ohneNull(-2, 2)}x)`, `${ganz(2, 4)}cos(2x)`])}-${ganz(2, 5)}`,
];

export function neueStammAufgabe(art = "potenz", stufe = 1) {
  const g = STAMM_GEN[art] || STAMM_GEN.potenz;
  for (let i = 0; i < 40; i++) {
    const text = g[Math.max(0, Math.min(2, stufe - 1))]();
    const f = lies(text);
    if (f && stammfunktion(f)) return { text, f };
  }
  return { text: "3x^2", f: lies("3x^2") };
}

/* Integral-Aufgabe mit passenden Grenzen */
export function neueIntegralAufgabe(stufe = 1) {
  const pool = [
    () => { const t = wahl([`${3 * ganz(1, 2)}x^2`, `2x${plusTxt(ganz(1, 4))}`, `x^2${plusTxt(ohneNull(-3, 3))}`, `${ganz(1, 3)}x^3`]); const a = ganz(-1, 1); return { t, a: `${a}`, b: `${a + ganz(1, 3)}` }; },
    () => { const t = wahl([`x^3-3x`, `${ganz(2, 4)}x^2-2x+1`, `6x^2-4x`, `x^2-${ganz(1, 4)}`, `4x^3-${2 * ganz(1, 3)}x`]); const a = ganz(-2, 0); return { t, a: `${a}`, b: `${ganz(1, 3)}` }; },
    () => wahl([
      () => ({ t: wahl(["sin(x)", "cos(x)", `${ganz(2, 3)}sin(x)`]), a: "0", b: wahl(["pi", "pi/2"]) }),
      () => ({ t: wahl(["e^x", `${ganz(2, 3)}e^x`, "e^(2x)"]), a: "0", b: wahl(["1", "2", "ln(2)"]) }),
      () => ({ t: wahl(["1/x", `${ganz(2, 4)}/x`]), a: "1", b: wahl(["e", "2", "e^2"]) }),
      () => ({ t: wahl(["1/x^2", `x+1/x^2`, "sqrt(x)"]), a: "1", b: wahl(["2", "4"]) }),
    ])(),
  ];
  for (let i = 0; i < 40; i++) {
    const r = pool[Math.max(0, Math.min(2, stufe - 1))]();
    const f = lies(r.t), a = grenzeLesen(r.a), b = grenzeLesen(r.b);
    if (!f || !a || !b || a.v === b.v) continue;
    const h = hauptsatz(f, a, b);
    if (h.fehler) continue;
    return { fText: r.t, aText: r.a, bText: r.b };
  }
  return { fText: "3x^2", aText: "0", bText: "2" };
}
