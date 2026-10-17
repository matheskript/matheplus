/* ============================================================
   Formel-Engine (reine Logik, kein React, kein DOM)
   Tokenizer, Parser, Auswertung, symbolisches Ableiten mit Vereinfachung,
   Ausgabe als TeX (App) und Klartext (PDF), numerische Analyse
   (Definitionsbereich, Nullstellen, Pole, Extrem- und Wendepunkte,
   Grenzverhalten, Integrale). Aus func12.jsx herausgelöst, damit
   Tests (Node) und Mathilda (api/claude.js, Tool Use) dieselbe
   Mathematik nutzen wie der Advanced Plotter.
   Keine Importe aus der App; PLATZ, zahl und tiefZiffer sind hier kopiert
   (gleich wie in base2.jsx / func2.jsx halten).
   ============================================================ */

export const PLATZ = "▯";   // Platzhalter im Tastenfeld (base2.jsx)

/* Zahl mit höchstens zwei Nachkommastellen, deutsches Komma (func2.jsx) */
export function zahl(v) {
  const g = Math.round(v * 100) / 100;
  return Number.isInteger(g) ? String(g) : g.toFixed(2).replace(".", ",");
}
/* Tiefgestellte Ziffern (func2.jsx) */
export function tiefZiffer(n) {
  const KARTE = { "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄", "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉" };
  return String(n).split("").map((z) => KARTE[z] || z).join("");
}

const FUNKTIONEN = ["sqrt", "sin", "cos", "tan", "ln", "log"];
const CURSOR = "‸", FELD_AUF = "⟦", FELD_ZU = "⟧";

/* Anzeige-Text mit Schreibmarke: ‸ an der Position, und die innerste Klammer,
   in der sie steht, wird mit ⟦ … ⟧ als Feld markiert (grau hinterlegt). */
export function mitSchreibmarke(text, pos) {
  const p = Math.max(0, Math.min(pos, text.length));
  const zu = { "(": ")", "[": "]" };
  const stapel = [];
  let auf = -1;
  for (let i = 0; i < p; i++) {
    if (text[i] === "(" || text[i] === "[") stapel.push(i);
    else if ((text[i] === ")" || text[i] === "]") && stapel.length) stapel.pop();
  }
  if (stapel.length) auf = stapel[stapel.length - 1];
  let ende = -1;
  if (auf >= 0) {
    let tiefe = 0;
    for (let i = p; i < text.length; i++) {
      if (text[i] === "(" || text[i] === "[") tiefe++;
      else if (text[i] === ")" || text[i] === "]") {
        if (tiefe === 0) { if (text[i] === zu[text[auf]]) ende = i; break; }
        tiefe--;
      }
    }
  }
  const mitMarke = text.slice(0, p) + CURSOR + text.slice(p);
  if (auf < 0 || ende < 0) return mitMarke;
  const e = ende + 1; // Position der Klammer nach dem Einfügen der Marke
  return mitMarke.slice(0, auf + 1) + FELD_AUF + mitMarke.slice(auf + 1, e) + FELD_ZU + mitMarke.slice(e);
}

export function tokenisiere(s) {
  const t = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (ch === PLATZ) { t.push({ k: "box" }); i++; continue; }
    // Nur für die Anzeige: Schreibmarke ‸ und das Feld ⟦…⟧, in dem sie steht
    if (ch === CURSOR) { t.push({ k: "cur" }); i++; continue; }
    if (ch === FELD_AUF || ch === FELD_ZU) { t.push({ k: ch }); i++; continue; }
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
      } else if (s && ["num", "x", "e", "pi", "box", "fn", "(", "cur", FELD_AUF].includes(s.k)) {
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
    if (s.k === "x" || s.k === "e" || s.k === "pi" || s.k === "box" || s.k === "cur") { p++; return { k: s.k }; }
    if (s.k === FELD_AUF) { p++; const n = summe(); if (!n || !nimm(FELD_ZU)) return null; return { k: "feld", a: n }; }
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
export const hatX = (n) => !!n && (n.k === "x" || ["a", "b"].some((s) => n[s] && hatX(n[s])));
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
export const div = (a, b) => ({ k: "/", a, b });
const pow = (a, b) => ({ k: "^", a, b });
const neg = (a) => ({ k: "neg", a });
export const fn = (n, a) => ({ k: "fn", n, a });
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

/* Das Minuszeichen der Anzeige ist das echte Minus (U+2212): genauso breit wie das Plus
   und auf der Höhe des Pluszeichens — der Bindestrich „-“ ist kürzer und sitzt tiefer. */
const MINUS = "−";

/* Spaltet das Vorzeichen eines Summanden ab: „-3x²“ → [true, 3x²].
   So wird aus „a + (−b)“ die Schreibweise „a − b“. */
function vorzeichenWeg(n) {
  if (!n) return [false, n];
  if (n.k === "neg") return [true, n.a];
  if (n.k === "num" && n.v < 0) return [true, { ...n, v: -n.v }];
  if (n.k === "*") {
    const [neg, a] = vorzeichenWeg(n.a);
    if (!neg) return [false, n];
    if (a.k === "num" && a.v === 1) return [true, n.b];   // −1·x → −x
    return [true, { ...n, a }];
  }
  return [false, n];
}

export function alsTex(n, aussen = 0, rechts = false) {
  if (!n) return "";
  const klam = (s, r) => (r < aussen || (rechts && r === aussen && aussen <= 2) ? `(${s})` : s);
  switch (n.k) {
    case "num": return n.v < 0 ? klam(`${MINUS}${zahlTex(-n.v)}`, 2) : zahlTex(n.v);
    case "x": return "x";
    case "e": return "e";
    case "pi": return "π";
    case "box": return "▯";
    case "cur": return "\\cursor ";
    case "feld": return `\\feld{${alsTex(ohneAussenPar(n.a), 0)}}`;
    case "par": return `(${alsTex(n.a, 0)})`;
    case "neg": return klam(`${MINUS}${alsTex(n.a, 2)}`, 2);
    case "+": {
      // a + (−b) wird als a − b geschrieben, nie als „+ −“
      const [neg, b] = vorzeichenWeg(n.b);
      if (!neg) return klam(`${alsTex(n.a, 1)} + ${alsTex(n.b, 1, true)}`, 1);
      const rest = vorzeichenWeg(b)[0] ? `(${alsTex(b, 0)})` : alsTex(b, 1, true);
      return klam(`${alsTex(n.a, 1)} ${MINUS} ${rest}`, 1);
    }
    case "-": {
      // a − (−b): die Klammer bleibt, damit nie „− −“ dasteht
      const neg = vorzeichenWeg(n.b)[0];
      const rest = neg ? `(${alsTex(n.b, 0)})` : alsTex(n.b, 1, true);
      return klam(`${alsTex(n.a, 1)} ${MINUS} ${rest}`, 1);
    }
    case "*": {
      // Faktor 1 wird nicht geschrieben: 1·x → x, x·1 → x (nur vor Variable, Funktion, Potenz oder Klammer)
      const FOLGT = ["x", "e", "pi", "par", "fn", "log", "^", "*"];
      if (n.a.k === "num" && n.a.v === 1 && FOLGT.includes(n.b.k)) return alsTex(n.b, aussen, rechts);
      if (n.b.k === "num" && n.b.v === 1 && FOLGT.includes(n.a.k)) return alsTex(n.a, aussen, rechts);
      const l = alsTex(n.a, 2), r = alsTex(n.b, 2, n.b.k !== "*");
      const punkt = /[0-9}]$/.test(l) && /^[0-9−-]/.test(r);
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

/* Live-Anzeige beim Tippen: Auch ein unvollständiger Term („15x^2+“, „sin(2x+“) erscheint
   sofort als gesetzte Formel, nicht als Rohtext. Dafür wird er nur zur Anzeige ergänzt:
   ein fehlender Operand wird zum Platzhalter ▯, offene Klammern werden geschlossen.
   Gibt null zurück, wenn der Text Zeichen enthält, die keine Formel ergeben. */
export function liveTex(text) {
  const roh = String(text || "");
  if (!roh.trim()) return null;
  const direkt = parse(roh);
  if (direkt) return alsTex(direkt);
  const WILL_OPERAND = new Set(["+", "-", "*", "/", "^", "(", "[", "fn", "]"]);
  let rand = [roh];
  const gesehen = new Set(rand);
  for (let tiefe = 0; tiefe < 6; tiefe++) {
    const neu = [];
    for (const s of rand) {
      const tok = tokenisiere(s);
      if (!tok || !tok.length) return null;
      const stapel = [];
      for (const z of tok) {
        if (z.k === "(" || z.k === "[") stapel.push(z.k);
        else if (z.k === ")" || z.k === "]") stapel.pop();
      }
      const letzt = tok[tok.length - 1].k;
      const kandidaten = [];
      if (WILL_OPERAND.has(letzt)) kandidaten.push(s + PLATZ);
      if (stapel.length) kandidaten.push(s + (stapel[stapel.length - 1] === "(" ? ")" : "]"));
      for (const c of kandidaten) {
        if (gesehen.has(c)) continue;
        gesehen.add(c);
        const b = parse(c);
        if (b) return alsTex(b);
        neu.push(c);
      }
    }
    if (!neu.length) break;
    rand = neu.slice(0, 24);
  }
  return null;
}

/* Formel-Anzeige für Eingabezeilen: immer im gleichen Schriftbild wie die Aufgabe oben.
   Was gar keine Formel ergibt, bleibt trotzdem in derselben Schrift (nicht als Skript-Text). */

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

export const endlich = (y) => typeof y === "number" && isFinite(y);

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

export const rund = (x) => {
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
  // Keine „runden“ Stellen: Bei periodischen Funktionen träfe man sonst womöglich immer Nullstellen (sin(π/2·x) bei x = 10ᵏ)
  const X = [1e1, 1e2, 1e3, 1e4, 1e5, 1e6].map((v) => v * 1.0731 * richtung);
  const v = X.map(f);
  if (v.slice(2).every((y) => Number.isNaN(y) || y === undefined)) return { art: "undef" };
  // Überlauf auf ±Infinity mit festem Vorzeichen: bestimmt divergent
  const letzte = v.filter((y) => !Number.isNaN(y));
  if (letzte.length && !isFinite(letzte[letzte.length - 1])) return { art: "unendlich", vz: Math.sign(letzte[letzte.length - 1]) };
  const w = v.slice(2);
  if (!w.every(endlich)) return { art: "keins" };
  const [, b, c, d] = w;
  // Zusätzlich dicht prüfen: Ein echter Grenzwert ändert sich auch zwischen den Stützstellen kaum
  const ruhig = () => {
    const t = []; for (let i = 0; i < 30; i++) t.push(f(richtung * (1e4 * 1.0731 + i * 0.377)));
    return t.every(endlich) && Math.max(...t) - Math.min(...t) < 1e-3 * (1 + Math.abs(d));
  };
  if (Math.abs(d - c) < 1e-3 * (1 + Math.abs(d)) && Math.abs(c - b) < 1e-2 * (1 + Math.abs(c)) && ruhig())
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

/* Einseitiger Grenzwert bei p. Abgetastet wird dekadenweise (h = 10⁻² … 10⁻⁹).
   Neben schnellen Polen (1/x) erkennt das auch langsame Divergenz wie ln(x) für x → 0⁺:
   Dort wächst |f| pro Dekade um einen festen Betrag (≈ 2,3), die Zuwächse klingen also
   nicht ab — bei echter Konvergenz schrumpfen sie dagegen von Dekade zu Dekade deutlich. */
function einseitig(f, p, seite) {
  const hs = [1e-2, 1e-3, 1e-4, 1e-5, 1e-6, 1e-7, 1e-8, 1e-9];
  const v = hs.map((h) => f(p + seite * h));
  const unend = v.find((y) => y === Infinity || y === -Infinity);
  if (unend !== undefined) return { art: "unendlich", vz: Math.sign(unend) };
  if (!v.slice(-5).every(endlich)) return { art: "undef" };
  const w = v.filter(endlich);
  const letzter = w[w.length - 1];
  if (Math.abs(letzter) > 1e4 && Math.abs(letzter) > 10 * Math.abs(w[0])) return { art: "unendlich", vz: Math.sign(letzter) };
  const d = w.slice(1).map((y, i) => y - w[i]).slice(-4);
  const gleichesVZ = d.every((x) => x > 0) || d.every((x) => x < 0);
  const summe = d.reduce((s0, x) => s0 + x, 0);
  const deutlich = Math.abs(summe) > 1e-3 * (1 + Math.abs(letzter));
  const klingtNichtAb = Math.abs(d[3]) >= 0.8 * Math.abs(d[0]);
  if (gleichesVZ && deutlich && klingtNichtAb) return { art: "unendlich", vz: Math.sign(summe) };
  if (!gleichesVZ && deutlich && klingtNichtAb) return { art: "keins" };
  return { art: "wert", wert: Math.abs(letzter) < 1e-6 ? 0 : letzter };
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

export const MAX_LISTE = 10;

export function grenzeTxt(x, L, R) {
  if (x <= L + 1e-9) return "−∞";
  if (x >= R - 1e-9) return "∞";
  return wert(x);
}

/* Ist f ein biquadratisches Polynom a·x⁴ + b·x² + c mit ganzen Koeffizienten (a ≠ 0)? Dann [a, 0, b, 0, c], sonst null.
   Erkannt wird es an Funktionswerten – so zählt auch ein ausmultiplizierbares (x²−1)(x²−4) mit. */
export function biquadratischeKoeffizienten(f) {
  const v = (x) => { try { return f(x); } catch (e) { return NaN; } };
  const c = v(0), p1 = v(1) - c, p2 = v(2) - c;
  if (![c, p1, p2].every(Number.isFinite)) return null;
  const a = (p2 - 4 * p1) / 12, b = p1 - a;
  const ganz = (t) => Math.abs(t - Math.round(t)) < 1e-7 && Math.abs(t) <= 10000;
  if (!ganz(a) || !ganz(b) || !ganz(c) || Math.round(a) === 0) return null;
  const [A0, B0, C0] = [Math.round(a), Math.round(b), Math.round(c)];
  for (const x of [-3, -1.5, -0.5, 0.7, 2.5, 3.3]) {
    const soll = A0 * x ** 4 + B0 * x * x + C0, ist = v(x);
    if (!Number.isFinite(ist) || Math.abs(ist - soll) > 1e-7 * (1 + Math.abs(soll))) return null;
  }
  return [A0, 0, B0, 0, C0];
}
