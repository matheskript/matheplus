/* ============================================================
   TERM-NORMALFORM – Regel A5 für alle symbolischen Ableitungen
   Der alte Vereinfacher (vereinfache in formelEngine.js) arbeitet lokal am
   Baum und lässt bei höheren Ableitungen Reste wie 2(x + (x + 4)),
   2(2e^{2x}(x − 1) + e^{2x}) oder Nenner (x − 1)⁴ ohne Kürzen stehen.

   Hier wird ein Term in eine Normalform gebracht und schön zurückgebaut:
     • Summe aus Gliedern  c · Π Basis^Exponent
       Basen: x, eine Summe (z. B. (2x + 1)⁴), sin/cos/tan/ln(…), e^(…), a^(…), e, π
     • Produkte werden ausmultipliziert, solange eine Summe nur mit Exponent 1
       vorkommt; Potenzen von Summen (Kettenregel) bleiben als (…)ⁿ stehen
     • gleiche Glieder zusammengefasst, Wurzeln als Exponent ½ (√x · √x = x)
   Rückbau: gemeinsame Potenzen von Summen und gleiche e-Funktionen werden
   ausgeklammert (gemeinsamer Nenner bei Brüchen), Polynome im Zähler werden
   durch den Nenner gekürzt, Glieder nach fallender x-Potenz geordnet.
     (x² + 1)/(x − 1) → f′ = (x² − 2x − 1)/(x − 1)²
     e^{2x}(x − 1)    → f′ = (2x − 1) e^{2x}
     (2x + 1)⁵        → f′ = 10 (2x + 1)⁴

   Bewusst ohne Import aus formelEngine.js (die importiert diese Datei).
   normalBaum(n) liefert einen Baum oder null, wenn etwas nicht darstellbar ist;
   die Engine prüft das Ergebnis zusätzlich numerisch gegen den alten Term.
   ============================================================ */

const EPS = 1e-10;
const schoen = (v) => { const r = Math.round(v * 1e9) / 1e9; return Math.abs(r) < EPS ? 0 : r; };
const ganz = (v) => Math.abs(v - Math.round(v)) < 1e-9;

class Nicht extends Error {}
const nicht = () => { throw new Nicht(); };

/* ---------- Normalform ----------
   Glied: { c, f: { key → { b: Basis, e } } }      Summe: Glied[]
   Basis: { t: "x" } | { t: "s", s: Summe } | { t: "fn", n, s } | { t: "exp", s } (e^s, e immer 1)
          | { t: "apot", a, s } (a^s, a > 0 Zahl) | { t: "k", n: "e" | "pi" } | { t: "roh", n: Baum } */

function sKey(S) { return S.map((g) => `${g.c}*${gKey(g)}`).sort().join("+"); }
function gKey(g) { return Object.keys(g.f).sort().map((k) => (g.f[k].b.t === "exp" || g.f[k].b.t === "apot" ? k : `${k}^${g.f[k].e}`)).join("·"); }
function bKey(b) {
  switch (b.t) {
    case "x": return "x";
    case "s": return `S(${sKey(b.s)})`;
    case "fn": return `${b.n}(${sKey(b.s)})`;
    case "exp": return "E";
    case "apot": return `A${b.a}`;
    case "k": return `K${b.n}`;
    default: return `R${JSON.stringify(b.n)}`;
  }
}

const zahl = (c) => [{ c, f: {} }];
const atom = (b, e = 1) => { const k = bKey(b); return [{ c: 1, f: { [k]: { b, e } } }]; };

/* exp/apot-Faktoren tragen ihr Argument (Summe), Exponent bleibt 1 */
function faktorMal(fa, fb) {
  if (fa.b.t === "exp" || fa.b.t === "apot") {
    const s = summe([...fa.b.s, ...fb.b.s]);
    return s.length ? { b: { ...fa.b, s }, e: 1 } : null;
  }
  const e = schoen(fa.e + fb.e);
  return e === 0 ? null : { b: fa.b, e };
}

function gliedMal(g, h) {
  const f = { ...g.f };
  for (const k of Object.keys(h.f)) {
    if (f[k]) { const m = faktorMal(f[k], h.f[k]); if (m) f[k] = m; else delete f[k]; }
    else f[k] = h.f[k];
  }
  return { c: g.c * h.c, f };
}

/* Gleiche Glieder zusammenfassen; Summen mit Exponent 1 ausmultiplizieren */
function summe(liste) {
  const offen = [...liste];
  const raus = [];
  while (offen.length) {
    const g = offen.shift();
    const k1 = Object.keys(g.f).find((k) => g.f[k].b.t === "s" && g.f[k].e === 1);
    if (k1) {
      const rest = { c: g.c, f: { ...g.f } };
      const s = rest.f[k1].b.s;
      delete rest.f[k1];
      s.forEach((h) => offen.push(gliedMal(rest, h)));
      continue;
    }
    raus.push(g);
  }
  const m = new Map();
  for (const g of raus) {
    const k = gKey(g);
    if (m.has(k)) m.get(k).c += g.c; else m.set(k, { c: g.c, f: g.f });
  }
  return [...m.values()].map((g) => ({ ...g, c: schoen(g.c) })).filter((g) => g.c !== 0);
}

const plus = (A, B) => summe([...A, ...B]);
/* Eine Summe als Faktor erst als Potenz ^1 einsetzen: trifft sie auf dieselbe Summe mit anderem
   Exponenten, verschmelzen die Exponenten ((x² + 1) · √(x² + 1) = (x² + 1)^{3/2}); sonst
   multipliziert summe() sie aus. */
const alsFaktor = (A) => (A.length > 1 ? atom({ t: "s", s: A }, 1) : A);
const ausmult = (A, B) => summe(A.flatMap((g) => B.map((h) => gliedMal(g, h))));
const mal = (A, B) => { const a = alsFaktor(A), b = alsFaktor(B); return summe(a.flatMap((g) => b.map((h) => gliedMal(g, h)))); };
const skal = (A, c) => summe(A.map((g) => ({ ...g, c: g.c * c })));

const NETT = (v) => { for (let d = 1; d <= 60; d++) if (ganz(v * d)) return true; return false; };

function hoch(A, k) {
  if (!A.length) return k > 0 ? A : nicht();
  if (A.length === 1) {
    const g = A[0];
    const c = Math.pow(g.c, k);
    if (Number.isFinite(c) && NETT(c) && (g.c > 0 || ganz(k))) {
      const f = {};
      for (const key of Object.keys(g.f)) {
        const x = g.f[key];
        if (x.b.t === "exp" || x.b.t === "apot") { const s = skal(x.b.s, k); if (s.length) f[key] = { b: { ...x.b, s }, e: 1 }; }
        else { const e = schoen(x.e * k); if (e !== 0) f[key] = { b: x.b, e }; }
      }
      return [{ c: schoen(c), f }];
    }
  }
  if (ganz(k) && k === 1) return A;
  if (ganz(k) && k === 0) return zahl(1);
  // Summe (oder unschöner Einzelterm) als Basis: (2x + 1)⁴, √(x² + 1), (x − 1)⁻²
  return summe(atom({ t: "s", s: A }, k));
}

function konstWert(n) {
  switch (n.k) {
    case "num": return n.v;
    case "e": return Math.E;
    case "pi": return Math.PI;
    case "par": return konstWert(n.a);
    case "neg": { const a = konstWert(n.a); return a === null ? null : -a; }
    case "+": case "-": case "*": case "/": case "^": {
      const a = konstWert(n.a), b = konstWert(n.b);
      if (a === null || b === null) return null;
      const v = n.k === "+" ? a + b : n.k === "-" ? a - b : n.k === "*" ? a * b : n.k === "/" ? a / b : Math.pow(a, b);
      return Number.isFinite(v) ? v : null;
    }
    default: return null;
  }
}
const nurZahl = (n) => n && (n.k === "num" || (["par", "neg", "+", "-", "*", "/", "^"].includes(n.k) && nurZahl(n.a) && (n.b === undefined || nurZahl(n.b))));

export function normal(n) {
  if (!n) return nicht();
  if (nurZahl(n)) { const v = konstWert(n); if (v !== null && NETT(v)) return v === 0 ? [] : zahl(schoen(v)); }
  switch (n.k) {
    case "num": return n.v === 0 ? [] : zahl(n.v);
    case "x": return atom({ t: "x" });
    case "e": case "pi": return atom({ t: "k", n: n.k });
    case "par": return normal(n.a);
    case "neg": return skal(normal(n.a), -1);
    case "+": return plus(normal(n.a), normal(n.b));
    case "-": return plus(normal(n.a), skal(normal(n.b), -1));
    case "*": return mal(normal(n.a), normal(n.b));
    case "/": {
      const B = normal(n.b);
      if (!B.length) return nicht();
      return mal(normal(n.a), hoch(B, -1));
    }
    case "^": {
      const k = nurZahl(n.b) ? konstWert(n.b) : null;
      if (k !== null) return hoch(normal(n.a), k);
      if (n.a.k === "e") { const s = normal(n.b); return s.length ? atom({ t: "exp", s }) : zahl(1); }
      const a = nurZahl(n.a) ? konstWert(n.a) : null;
      if (a !== null && a > 0 && a !== 1 && NETT(a)) { const s = normal(n.b); return s.length ? atom({ t: "apot", a, s }) : zahl(1); }
      return atom({ t: "roh", n });
    }
    case "fn": {
      const s = normal(n.a);
      if (n.n === "sqrt") return hoch(s, 0.5);
      if (n.n === "ln") {
        if (s.length === 1 && !Object.keys(s[0].f).length && Math.abs(s[0].c - 1) < EPS) return [];
        if (s.length === 1 && Object.keys(s[0].f).length === 1 && s[0].c === 1) {
          const f = Object.values(s[0].f)[0];
          if (f.b.t === "k" && f.b.n === "e" && f.e === 1) return zahl(1);
          if (f.b.t === "exp") return f.b.s;   // ln(e^u) = u
        }
      }
      if (!["sin", "cos", "tan", "ln"].includes(n.n)) return nicht();
      if (!s.length) return n.n === "cos" ? zahl(1) : n.n === "ln" ? nicht() : [];
      return atom({ t: "fn", n: n.n, s });
    }
    case "log": return atom({ t: "roh", n });
    default: return nicht();
  }
}

/* ---------- Polynome (nur x, ganze Exponenten ≥ 0) ---------- */
function alsPolynom(S) {
  const p = [];
  for (const g of S) {
    const ks = Object.keys(g.f);
    let d = 0;
    if (ks.length > 1) return null;
    if (ks.length === 1) { const f = g.f[ks[0]]; if (f.b.t !== "x" || !ganz(f.e) || f.e < 0) return null; d = Math.round(f.e); }
    p[d] = (p[d] || 0) + g.c;
  }
  for (let i = 0; i < p.length; i++) p[i] = p[i] || 0;
  return p;
}
function ausPolynom(p) {
  return summe(p.map((c, d) => (d === 0 ? { c, f: {} } : { c, f: { x: { b: { t: "x" }, e: d } } })).filter((g) => Math.abs(g.c) > EPS));
}
/* p / q, wenn ohne Rest teilbar, sonst null */
function teile(p, q) {
  const r = p.slice(), n = q.length - 1;
  while (n > 0 && Math.abs(q[q.length - 1]) < EPS) return null;
  if (r.length - 1 < n) return null;
  const erg = new Array(r.length - n).fill(0);
  for (let i = r.length - 1; i >= n; i--) {
    const f = r[i] / q[n];
    erg[i - n] = f;
    for (let j = 0; j <= n; j++) r[i - n + j] -= f * q[j];
  }
  const skala = Math.max(1, ...p.map(Math.abs));
  return r.slice(0, n).every((v) => Math.abs(v) < 1e-8 * skala) ? erg.map(schoen) : null;
}

/* ---------- Rückbau zum Baum ---------- */
const N = (v) => ({ k: "num", v });
const MUL = (a, b) => ({ k: "*", a, b });
const DIV = (a, b) => ({ k: "/", a, b });
const POW = (a, b) => ({ k: "^", a, b });

function bruch(v) {
  for (let d = 1; d <= 60; d++) { const z = Math.round(v * d); if (Math.abs(v * d - z) < 1e-7) return [z, d]; }
  return null;
}
function zahlBaum(v) {
  const b = bruch(Math.abs(v));
  return b && b[1] > 1 ? DIV(N(b[0]), N(b[1])) : N(schoen(Math.abs(v)));
}

/* Basis^e (e > 0) als Baum */
function potBaum(basis, e) {
  if (e === 1) return basis;
  if (Math.abs(e - 0.5) < EPS) return { k: "fn", n: "sqrt", a: basis };
  if (ganz(e)) return POW(basis, N(Math.round(e)));
  const k = Math.floor(e + 1e-9), r = schoen(e - k);
  const rest = Math.abs(r - 0.5) < EPS ? { k: "fn", n: "sqrt", a: basis } : POW(basis, zahlBaum(r));
  // x^{7/3} = x² · x^{1/3}: der ganze Teil getrennt, damit ungerade Wurzeln auch für x < 0 gelten
  return k === 0 ? rest : MUL(k === 1 ? basis : POW(basis, N(k)), rest);
}

const RANG_BASIS = { x: 0, k: 1, s: 2, roh: 3, fn: 4, apot: 5, exp: 6 };
function basisBaum(b, tiefe) {
  switch (b.t) {
    case "x": return { k: "x" };
    case "k": return { k: b.n };
    case "s": return summeBaum(b.s, tiefe + 1);
    case "fn": return { k: "fn", n: b.n, a: summeBaum(b.s, tiefe + 1) };
    case "exp": return POW({ k: "e" }, summeBaum(b.s, tiefe + 1));
    case "apot": return POW(N(b.a), summeBaum(b.s, tiefe + 1));
    default: return b.n;
  }
}

function gliedBaum(g, tiefe) {
  const fs = Object.values(g.f).sort((p, q) => RANG_BASIS[p.b.t] - RANG_BASIS[q.b.t]);
  const oben = [], unten = [];
  for (const f of fs) {
    const pos = f.b.t === "exp" || f.b.t === "apot" || f.e > 0;
    const e = f.b.t === "exp" || f.b.t === "apot" ? 1 : Math.abs(f.e);
    (pos ? oben : unten).push(potBaum(basisBaum(f.b, tiefe), e));
  }
  const br = bruch(Math.abs(g.c)) || [Math.abs(g.c), 1];
  const [z, d] = br;
  const prod = (l) => l.reduce((a, b) => MUL(a, b));
  let baum;
  if (!unten.length && d === 1) baum = z === 1 && oben.length ? prod(oben) : oben.length ? MUL(N(z), prod(oben)) : N(z);
  else if (!unten.length) baum = oben.length ? MUL(DIV(N(z), N(d)), prod(oben)) : DIV(N(z), N(d));
  else {
    const zaehler = z === 1 && oben.length ? prod(oben) : oben.length ? MUL(N(z), prod(oben)) : N(z);
    const nenner = d === 1 ? prod(unten) : MUL(N(d), prod(unten));
    baum = DIV(zaehler, nenner);
  }
  return { baum, neg: g.c < 0 };
}

const xGrad = (g) => (g.f.x ? g.f.x.e : 0) + (Object.keys(g.f).length > (g.f.x ? 1 : 0) ? 0.001 : 0);

function reineSumme(S, tiefe) {
  if (!S.length) return N(0);
  const teile_ = S.slice().sort((p, q) => xGrad(q) - xGrad(p)).map((g) => gliedBaum(g, tiefe));
  let erg = teile_[0].neg ? { k: "neg", a: teile_[0].baum } : teile_[0].baum;
  for (const t of teile_.slice(1)) erg = { k: t.neg ? "-" : "+", a: erg, b: t.baum };
  return erg;
}

/* Positive ganze Potenzen (bis 6) der Summe mit Schlüssel k ausmultiplizieren */
function potenzAusmult(S, k) {
  return summe(S.flatMap((g) => {
    const f = g.f[k];
    if (!f || !ganz(f.e) || f.e < 1 || f.e > 6) return [g];
    const rest = { c: g.c, f: { ...g.f } };
    delete rest.f[k];
    let T = [rest];
    for (let i = 0; i < Math.round(f.e); i++) T = ausmult(T, f.b.s);
    return T;
  }));
}

/* Ausklammern: Potenzen derselben Summe (gemeinsamer Nenner oder gemeinsamer Faktor)
   und gleiche e-/a-Funktionen, die in allen Gliedern stehen */
function summeBaum(S, tiefe = 0) {
  if (tiefe > 6) nicht();
  if (S.length < 2) return reineSumme(S, tiefe);
  // Positive Potenzen einer Summe, die nicht in allen Gliedern steht, ausmultiplizieren –
  // sonst stünde 180 (3x − 2)² neben 3240 x² − 3024 x + 576
  for (const k of new Set(S.flatMap((g) => Object.keys(g.f)))) {
    const b0 = S.find((g) => g.f[k]).f[k].b;
    if (b0.t !== "s") continue;
    const exps = S.map((g) => (g.f[k] ? g.f[k].e : 0));
    if (exps.some((e) => e < 0) || exps.every((e) => e !== 0)) continue;
    S = potenzAusmult(S, k);
  }
  if (S.length < 2) return reineSumme(S, tiefe);
  const keys = new Set(S.flatMap((g) => Object.keys(g.f)));
  const raus = {};
  for (const k of keys) {
    const f0 = S.find((g) => g.f[k]).f[k];
    if (f0.b.t === "s") {
      const exps = S.map((g) => (g.f[k] ? g.f[k].e : 0));
      const min = Math.min(...exps), alle = exps.every((e) => e !== 0);
      if (min < 0 || (alle && min > 0)) raus[k] = { b: f0.b, e: min };
    } else if (f0.b.t === "x") {
      // gemeinsamer Nenner xⁿ, wenn mindestens zwei Glieder x im Nenner haben
      const exps = S.map((g) => (g.f[k] ? g.f[k].e : 0));
      if (exps.filter((e) => e < 0).length >= 2) raus[k] = { b: f0.b, e: Math.min(...exps) };
    } else if ((f0.b.t === "exp" || f0.b.t === "apot") && S.every((g) => g.f[k] && sKey(g.f[k].b.s) === sKey(f0.b.s))) {
      raus[k] = { b: f0.b, e: 1 };
    }
  }
  if (!Object.keys(raus).length) return reineSumme(S, tiefe);
  // Innen = S geteilt durch die ausgeklammerten Faktoren (Summen mit Exponent 1 werden dabei ausmultipliziert)
  let innen = summe(S.map((g) => {
    const f = { ...g.f };
    for (const k of Object.keys(raus)) {
      if (raus[k].b.t === "exp" || raus[k].b.t === "apot") delete f[k];
      else { const e = schoen((f[k] ? f[k].e : 0) - raus[k].e); if (e === 0) delete f[k]; else f[k] = { b: raus[k].b, e }; }
    }
    return { c: g.c, f };
  }));
  // Übrige positive Potenzen einer ausgeklammerten Summe im Inneren ausmultiplizieren
  // (beim gemeinsamen Nenner wird der Zähler so ein Polynom und kann gekürzt werden)
  for (const k of Object.keys(raus)) if (raus[k].b.t === "s") innen = potenzAusmult(innen, k);
  // Kürzen: Zähler-Polynom durch Nenner-Polynom
  for (const k of Object.keys(raus)) {
    const r = raus[k];
    if (r.b.t !== "s" || r.e >= 0) continue;
    const q = alsPolynom(r.b.s);
    while (r.e < 0 && q && q.length > 1) {
      const p = alsPolynom(innen);
      const t = p && teile(p, q);
      if (!t) break;
      innen = ausPolynom(t);
      r.e = schoen(r.e + 1);
    }
  }
  // Brüche in der inneren Summe auf den Hauptnenner bringen: ¾ x − ¼ → (3x − 1) / 4
  // (ein ganzzahliger gemeinsamer Faktor wie in 2x − 2 bleibt drin, kein weiteres Ausklammern)
  const g = { c: 1, f: {} };
  if (innen.length > 1 && Object.values(raus).some((r) => r.e < 0)) {
    let hn = 1;
    const ggt = (a, b) => (b ? ggt(b, a % b) : a);
    for (const h of innen) { const br = bruch(Math.abs(h.c)); if (!br) { hn = 1; break; } hn = (hn * br[1]) / ggt(hn, br[1]); }
    if (hn > 1 && hn <= 360) { innen = innen.map((h) => ({ ...h, c: schoen(h.c * hn) })); g.c = 1 / hn; }
  }
  for (const k of Object.keys(raus)) if (raus[k].e !== 0) g.f[k] = raus[k];
  if (!innen.length) return N(0);
  if (!Object.keys(g.f).length && g.c === 1) return summeBaum(innen, tiefe + 1);
  const innenBaum = innen.length === 1 ? null : summeBaum(innen, tiefe + 1);
  if (!innenBaum) {
    const ein = gliedMal(innen[0], g);
    const t = gliedBaum(ein, tiefe);
    return t.neg ? { k: "neg", a: t.baum } : t.baum;
  }
  const { baum: faktor } = gliedBaum(g, tiefe);   // c = 1 (oder 1/Hauptnenner): nur Faktoren, evtl. als 1 / Nenner
  if (faktor.k === "/" && faktor.a.k === "num" && faktor.a.v === 1) return DIV(innenBaum, faktor.b);
  if (faktor.k === "/") return DIV(MUL(innenBaum, faktor.a), faktor.b);
  if (faktor.k === "*" && faktor.a.k === "/" && faktor.a.a.k === "num" && faktor.a.a.v === 1) return DIV(MUL(innenBaum, faktor.b), faktor.a.b);
  return MUL(innenBaum, faktor);
}

/* Normalform als Baum, oder null wenn nicht möglich */
export function normalBaum(n) {
  try {
    return summeBaum(normal(n));
  } catch (e) {
    if (e instanceof Nicht) return null;
    throw e;
  }
}
