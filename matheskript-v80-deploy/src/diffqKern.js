/* ============================================================
   Differenzenquotient – Rechenkern (ohne Oberfläche)
   Das Werkzeug „Differenzenquotient“ (funcDiffqTrainer.jsx) lässt den Schüler
   den Bruch des Differenzenquotienten Zeile für Zeile selbst aufbauen:

     f′(x) = lim  f(x+h) − f(x)        Zeile 0: Vorlage, steht fest
             h→0 ─────────────
                      h
           = lim  [ A ] − [ B ]        einsetzen: A = f(x+h), B = f(x)
             h→0 ─────────────
                      h
           = lim  [ Zähler ]           bruch: Zähler umformen (ausmultiplizieren,
             h→0 ──────────                   zusammenfassen, h ausklammern)
                     h
           = lim  [ Term ]             frei: h ist gekürzt, kein Bruch mehr
             h→0
     f′(x) =  [ Term ]                 limes: h → 0, kein h mehr

   Jede Zeile wird numerisch gegen die Funktion geprüft (x und h als freie
   Variablen der Formel-Engine), deshalb zählt jede gleichwertige Schreibweise.
   Dazu je Funktionsart ein Musterweg (Rechnen-Modus, „Lösung zeigen“).
   „An einer Stelle“: x ist eine feste Zahl x₀, die Terme enthalten nur h.
   Reine Logik, ohne React – testbar mit Node (tests/diffqKern.test.mjs).
   ============================================================ */
import { ableitung, alsTex, hatBox, hatVar, hatX, kompiliere, ohnePar, parse } from "./formelEngine.js";

/* ---------- Zufall ---------- */
const ganz = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const ganzNZ = (a, b) => { let z = 0; while (z === 0) z = ganz(a, b); return z; };
const wahl = (l) => l[Math.floor(Math.random() * l.length)];

/* ---------- Zahlen als Eingabetext (Tastenfeld-Schreibweise, deutsches Komma) ---------- */
const rund = (v) => Math.round(v * 1e9) / 1e9;
export const zahlText = (v) => {
  const r = rund(v);
  if (Number.isInteger(r)) return String(r);
  return String(Math.round(r * 1e6) / 1e6).replace(".", ",");
};
const MINUS = "−";

/* ---------- Polynome in x als Koeffizientenliste [a0, a1, …] ---------- */
function pAdd(p, q, s = 1) {
  const r = [];
  for (let i = 0; i < Math.max(p.length, q.length); i++) r[i] = (p[i] || 0) + s * (q[i] || 0);
  return r;
}
function pMul(p, q) {
  const r = new Array(p.length + q.length - 1).fill(0);
  p.forEach((a, i) => q.forEach((b, j) => { r[i + j] += a * b; }));
  return r;
}
/* Koeffizienten [a0, a1, …] oder null, wenn der Baum kein Polynom in x ist */
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
      if (!p || !q || p.length + q.length > 10) return null;
      return pMul(p, q);
    }
    case "/": {
      if (hatX(n.b) || n.b.k !== "num" || n.b.v === 0) return null;
      const p = polyKoef(n.a);
      return p && p.map((c) => c / n.b.v);
    }
    case "^": {
      if (n.b.k !== "num" || !Number.isInteger(n.b.v) || n.b.v < 0 || n.b.v > 6) return null;
      const p = polyKoef(n.a);
      if (!p) return null;
      let r = [1];
      for (let i = 0; i < n.b.v; i++) r = pMul(r, p);
      return r;
    }
    default: return null;
  }
}
const pTrim = (p) => { const r = p.map(rund); while (r.length && r[r.length - 1] === 0) r.pop(); return r; };

/* ---------- Polynome in x und h: Liste von Gliedern { c, i, j } = c · xⁱ · hʲ ---------- */
const binom = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - i + 1)) / i; return r; };
/* f(x + h) ausmultipliziert: Σ aₖ (x+h)ᵏ = Σ aₖ Σ (k über j) x^(k−j) h^j */
export function entwickelt(koef) {
  const g = {};
  koef.forEach((a, k) => {
    if (!a) return;
    for (let j = 0; j <= k; j++) {
      const key = `${k - j},${j}`;
      g[key] = (g[key] || 0) + a * binom(k, j);
    }
  });
  return Object.entries(g).map(([key, c]) => { const [i, j] = key.split(",").map(Number); return { c: rund(c), i, j }; }).filter((t) => t.c !== 0);
}
/* Reihenfolge wie von Hand: nach h-Grad aufsteigend, darin x-Grad absteigend (2xh + h², 6x²h − 6xh + h + 6xh² …) */
const geordnet = (glieder) => [...glieder].sort((a, b) => a.j - b.j || b.i - a.i);
/* Reihenfolge beim Ausmultiplizieren: Potenz für Potenz (Gesamtgrad absteigend), darin die binomische Entwicklung (x², 2xh, h²) */
const entwickeltGeordnet = (glieder) => [...glieder].sort((a, b) => (b.i + b.j) - (a.i + a.j) || a.j - b.j);
export const zusammengefasst = (glieder) => {
  const g = {};
  glieder.forEach(({ c, i, j }) => { const key = `${i},${j}`; g[key] = (g[key] || 0) + c; });
  return Object.entries(g).map(([key, c]) => { const [i, j] = key.split(",").map(Number); return { c: rund(c), i, j }; }).filter((t) => t.c !== 0);
};

/* Ein Glied c · xⁱ hʲ als Eingabetext („2xh“, „3x^2h“, „h^3“, „-4“); erster: ohne führendes Plus */
function gliedText(t, erster) {
  const { c, i, j } = t;
  const pot = (v, e) => (e === 0 ? "" : e === 1 ? v : `${v}^${e}`);
  const rest = pot("x", i) + pot("h", j);
  const betrag = Math.abs(c);
  const zahl = betrag === 1 && rest ? "" : zahlText(betrag);
  const vz = c < 0 ? "-" : erster ? "" : "+";
  return `${vz}${zahl}${rest}`;
}
export const gliederText = (glieder, entwicklung = false) => {
  const g = entwicklung ? entwickeltGeordnet(glieder) : geordnet(glieder);
  if (!g.length) return "0";
  return g.map((t, k) => gliedText(t, k === 0)).join("");
};

/* Polynom als Eingabetext mit beliebiger Basis statt x: basis "x" → „2x^3-x+4“, basis "(x+h)" → „2(x+h)^3-(x+h)+4“ */
export function polyText(koef, basis = "x") {
  const teile = [];
  for (let k = koef.length - 1; k >= 0; k--) {
    const c = rund(koef[k]);
    if (!c) continue;
    const pot = k === 0 ? "" : k === 1 ? basis : `${basis}^${k}`;
    const betrag = Math.abs(c);
    const zahl = betrag === 1 && pot ? "" : zahlText(betrag);
    const vz = c < 0 ? "-" : teile.length ? "+" : "";
    teile.push(`${vz}${zahl}${pot}`);
  }
  return teile.length ? teile.join("") : "0";
}

/* ---------- Terme lesen und auswerten ---------- */
/* Eingabetext → Baum ohne Klammerknoten; leer, unlesbar oder mit Platzhalter ▯ → null */
export function lies(text) {
  const b = parse(String(text || ""));
  return b && !hatBox(b) ? ohnePar(b) : null;
}
export const texVon = (text) => { const b = parse(String(text || "")); return b ? alsTex(b) : String(text || ""); };
/* Auswertbare Funktion (x, h) ↦ Wert, oder null */
export function termXH(text) {
  const b = lies(text);
  if (!b) return null;
  const g = kompiliere(b);
  return (x, h) => g(x, { h });
}
const endlich = (y) => typeof y === "number" && Number.isFinite(y);

/* Prüfpaare (x, h): h nie 0, x bewusst „krumm“ und so, dass Wurzeln und Brüche definiert bleiben */
export const PAARE = [
  { x: 0.37, h: 0.5 }, { x: 0.83, h: -0.25 }, { x: 1.29, h: 0.13 }, { x: 1.77, h: 0.071 },
  { x: 2.41, h: 0.019 }, { x: 3.13, h: -0.37 }, { x: -0.61, h: 0.9 }, { x: -1.17, h: -0.05 },
  { x: 0.52, h: 0.31 }, { x: 4.07, h: -0.6 }, { x: 5.3, h: 0.27 }, { x: 6.71, h: -0.44 }, { x: 8.13, h: 0.5 },
];
export const H_WERTE = [0.5, -0.25, 0.13, 0.071, 0.019, -0.37, 0.9, -0.05, 0.31, -0.6];

/* Stimmen zwei Terme in (x, h) überein? x0 ≠ null: x fest, nur h variiert. */
export function gleichXH(g1, g2, x0 = null) {
  let geprueft = 0, anders = 0;
  const stellen = x0 === null ? PAARE : H_WERTE.map((h) => ({ x: x0, h }));
  for (const { x, h } of stellen) {
    let a, b;
    try { a = g1(x, h); b = g2(x, h); } catch (e) { continue; }
    if (!endlich(b)) continue;
    if (!endlich(a)) { anders++; continue; }
    geprueft++;
    if (Math.abs(a - b) > 1e-6 * (1 + Math.abs(b))) anders++;
  }
  return { ok: anders === 0 && geprueft >= 4, geprueft, anders };
}
const istGleich = (g1, g2, x0) => gleichXH(g1, g2, x0).ok;

/* ---------- Funktionsarten ---------- */
const nz = (c) => (c === 0 ? "" : c < 0 ? `-${-c}` : `+${c}`);   // „+3“ / „-2“ / „“
const BRUECHE = [1, 1, 1, 2, 3, -1, -2];
export const ARTEN = [
  { id: "linear", name: "Linear", regel: "f(x) = m·x + b", mach: (st) => {
    const m = st === 1 ? ganzNZ(1, 5) : st === 2 ? ganzNZ(-6, 6) : wahl([0.5, -0.5, 1.5, -1.5, 2.5]);
    return polyText([st === 1 ? ganz(-5, 5) : ganz(-9, 9), m]);
  } },
  { id: "quadratisch", name: "Quadratisch", regel: "f(x) = a·x² + b·x + c", mach: (st) => {
    if (st === 1) return polyText([ganz(-5, 5), 0, 1]);
    if (st === 2) return polyText([ganz(-5, 5), ganzNZ(-4, 4), wahl([1, 1, -1, 2])]);
    return polyText([ganz(-6, 6), ganzNZ(-5, 5), wahl([-3, -2, 2, 3, 0.5])]);
  } },
  { id: "kubisch", name: "Kubisch", regel: "f(x) = a·x³ + …", mach: (st) => {
    if (st === 1) return polyText([ganz(-3, 3), 0, 0, 1]);
    if (st === 2) return polyText([ganz(-4, 4), ganzNZ(-4, 4), 0, wahl([1, 1, -1, 2])]);
    return polyText([ganz(-5, 5), ganzNZ(-4, 4), ganzNZ(-3, 3), wahl([-2, -1, 1, 2, 3])]);
  } },
  { id: "potenz", name: "Potenzen", regel: "f(x) = a·xⁿ, n = 4, 5", mach: (st) => {
    const n = st === 1 ? 4 : wahl([4, 5]);
    if (st === 1) { const k = new Array(n + 1).fill(0); k[n] = 1; return polyText(k); }
    if (st === 2) { const k = new Array(n + 1).fill(0); k[n] = wahl([2, 3, -1, -2]); k[0] = ganz(-4, 4); return polyText(k); }
    const k = new Array(n + 1).fill(0); k[n] = wahl([1, 2, -1]); k[2] = ganzNZ(-3, 3); k[1] = ganz(-4, 4); return polyText(k);
  } },
  { id: "bruch", name: "Bruch", regel: "f(x) = a / (x + c)", mach: (st) => {
    if (st === 1) return "1/x";
    if (st === 2) return `1/(x${nz(ganzNZ(-4, 4))})`;
    const a = wahl([2, 3, -1, -2, 4]), c = ganz(-4, 4);
    return c === 0 ? `${a}/x` : `${a}/(x${nz(c)})`;
  } },
  { id: "wurzel", name: "Wurzel", regel: "f(x) = a·√(x + c)", mach: (st) => {
    if (st === 1) return "sqrt(x)";
    if (st === 2) return `sqrt(x${nz(ganzNZ(-3, 5))})`;
    const a = wahl([2, 3, -1, 4]), c = ganz(-3, 5);
    const az = a === -1 ? "-" : String(a);
    return c === 0 ? `${az}sqrt(x)` : `${az}sqrt(x${nz(c)})`;
  } },
];
export const art = (id) => ARTEN.find((a) => a.id === id) || null;

/* ---------- Aufgabe aus einem Funktionsterm ---------- */
/* Erkennt a / (x + c): Zähler Zahl, Nenner x oder (x ± c) */
function bruchForm(b) {
  if (b && b.k === "neg") { const f = bruchForm(b.a); return f ? { a: -f.a, c: f.c } : null; }
  if (!b || b.k !== "/") return null;
  const z = b.a.k === "neg" && b.a.a.k === "num" ? -b.a.a.v : b.a.k === "num" ? b.a.v : null;   // Zähler: Zahl, auch negativ (−2/(x−1) liest der Parser als (−2)/(x−1))
  if (z === null) return null;
  const n = ohnePar(b.b);
  if (n.k === "x") return { a: z, c: 0 };
  if ((n.k === "+" || n.k === "-") && n.a.k === "x" && n.b.k === "num") return { a: z, c: n.k === "-" ? -n.b.v : n.b.v };
  return null;
}
/* Erkennt a · √(x + c) (a = 1 erlaubt) */
function wurzelForm(b) {
  if (!b) return null;
  let a = 1, w = b;
  if (b.k === "neg") { a = -1; w = b.a; }
  if (w.k === "*" && w.a.k === "num" && w.b.k === "fn") { a *= w.a.v; w = w.b; }
  if (w.k !== "fn" || w.n !== "sqrt") return null;
  const n = ohnePar(w.a);
  if (n.k === "x") return { a, c: 0 };
  if ((n.k === "+" || n.k === "-") && n.a.k === "x" && n.b.k === "num") return { a, c: n.k === "-" ? -n.b.v : n.b.v };
  return null;
}
/* Baum: jedes x durch den Ersatzbaum (geklammert) ersetzen */
function ersetzeX(n, ersatz) {
  if (!n) return n;
  if (n.k === "x") return { k: "par", a: ersatz };
  const m = { ...n };
  if (n.a) m.a = ersetzeX(n.a, ersatz);
  if (n.b) m.b = ersetzeX(n.b, ersatz);
  return m;
}
/* Baum → Eingabetext (Tastenfeld-Schreibweise): Zahlen mit Komma, Potenzen mit ^, Wurzel als sqrt( ) */
export function alsEingabe(n, aussen = 0, rechts = false) {
  if (!n) return "";
  const klam = (s, r) => (r < aussen || (rechts && r === aussen && aussen <= 3) ? `(${s})` : s);
  switch (n.k) {
    case "num": return n.v < 0 ? klam(`-${zahlText(-n.v)}`, 2) : zahlText(n.v);
    case "x": return "x";
    case "var": return n.n;
    case "e": return "e";
    case "pi": return "pi";
    case "par": return `(${alsEingabe(n.a, 0)})`;
    case "neg": return klam(`-${alsEingabe(n.a, 2)}`, 2);
    case "+": return klam(`${alsEingabe(n.a, 1)}+${alsEingabe(n.b, 1, true)}`, 1);
    case "-": return klam(`${alsEingabe(n.a, 1)}-${alsEingabe(n.b, 1, true)}`, 1);
    case "*": {
      const l = alsEingabe(n.a, 2), r = alsEingabe(n.b, 2, n.b.k !== "*");
      const ohne = /[0-9]$/.test(l) && /^[a-z(]/.test(r);
      return klam(`${l}${ohne ? "" : "*"}${r}`, 2);
    }
    case "/": return klam(`${alsEingabe(n.a, 3)}/${alsEingabe(n.b, 3, true)}`, 3);
    case "^": {
      const basis = n.a.k === "fn" || n.a.k === "log" ? `(${alsEingabe(n.a, 0)})` : alsEingabe(n.a, 5);
      const e = n.b.k === "num" && Number.isInteger(n.b.v) && n.b.v >= 0 ? zahlText(n.b.v) : `(${alsEingabe(n.b, 0)})`;
      return klam(`${basis}^${e}`, 4);
    }
    case "fn": return `${n.n}(${alsEingabe(n.a.k === "par" ? n.a.a : n.a, 0)})`;
    case "log": return n.zehn ? `log(${alsEingabe(n.a, 0)})` : `log[${alsEingabe(n.b, 0)}](${alsEingabe(n.a, 0)})`;
    default: return "";
  }
}

/* Aufgabe: { f (Text), tex, baum, fn(x), familie: poly | bruch | wurzel | frei, koef | form } oder null */
export function aufgabeAus(fText) {
  const baum = lies(fText);
  if (!baum || hatVar(baum)) return null;
  const g = kompiliere(baum);
  const fn = (x) => g(x);
  const koef = polyKoef(baum);
  if (koef) return { f: fText, tex: alsTex(baum), baum, fn, familie: "poly", koef: pTrim(koef) };
  const br = bruchForm(baum);
  if (br && br.a !== 0) return { f: fText, tex: alsTex(baum), baum, fn, familie: "bruch", form: br };
  const wu = wurzelForm(baum);
  if (wu && wu.a !== 0) return { f: fText, tex: alsTex(baum), baum, fn, familie: "wurzel", form: wu };
  return { f: fText, tex: alsTex(baum), baum, fn, familie: "frei" };
}
export function neueAufgabe(artId, stufe = 1) {
  const a = art(artId) || wahl(ARTEN);
  for (let i = 0; i < 20; i++) {
    const auf = aufgabeAus(a.mach(Math.max(1, Math.min(3, stufe))));
    if (auf) return { ...auf, art: a.id };
  }
  return { ...aufgabeAus("x^2"), art: "quadratisch" };
}
/* Stelle x₀ zur Aufgabe: ganzzahlig, im Definitionsbereich, Nenner ≠ 0 */
export function stelleZu(auf) {
  for (let i = 0; i < 30; i++) {
    const x0 = ganz(-3, 4);
    if (stelleOk(auf, x0)) return x0;
  }
  // Zufall ohne Treffer (z. B. √(x − 3)): die erste gültige Stelle nahe null
  for (let d = 0; d <= 12; d++) for (const x0 of [d, -d]) if (stelleOk(auf, x0)) return x0;
  return 1;
}
export function stelleOk(auf, x0) {
  if (auf.familie === "bruch" && x0 + auf.form.c === 0) return false;
  if (auf.familie === "wurzel" && x0 + auf.form.c <= 0) return false;
  return endlich(auf.fn(x0)) && endlich(auf.fn(x0 + 0.5)) && endlich(auf.fn(x0 - 0.25));
}

/* Ableitung: symbolisch (Baum) und als Funktion */
export function ableitungVon(auf) {
  if (auf.familie === "poly") {
    const k = auf.koef.slice(1).map((c, i) => c * (i + 1));
    const g = (x) => k.reduce((s, c, i) => s + c * x ** i, 0);
    return { text: polyText(k), fn: g };
  }
  if (auf.familie === "bruch") {
    const { a, c } = auf.form;
    const nenner = c === 0 ? "x^2" : `(x${nz(c)})^2`;
    return { text: `${zahlText(-a)}/${nenner}`, fn: (x) => -a / (x + c) ** 2 };
  }
  if (auf.familie === "wurzel") {
    const { a, c } = auf.form;
    const w = c === 0 ? "sqrt(x)" : `sqrt(x${nz(c)})`;
    const z = a === 1 ? "1" : zahlText(a);
    return { text: `${z}/(2${w})`, fn: (x) => a / (2 * Math.sqrt(x + c)) };
  }
  let abl = null;
  try { abl = ableitung(auf.baum); } catch (e) { abl = null; }
  if (abl) { const g = kompiliere(abl); return { text: alsEingabe(abl), fn: (x) => g(x) }; }
  const d = 1e-4;
  return { text: null, fn: (x) => (auf.fn(x - 2 * d) - 8 * auf.fn(x - d) + 8 * auf.fn(x + d) - auf.fn(x + 2 * d)) / (12 * d) };
}

/* Bruch z/n als Eingabetext, gekürzt („-1/9“, „2“, „-0,5“ bleibt als Bruch „-1/2“) */
const ggT = (a, b) => (b ? ggT(b, a % b) : Math.abs(a));
export function bruchText(z, n) {
  if (!Number.isInteger(z) || !Number.isInteger(n) || n === 0) return zahlText(z / n);
  const g = ggT(z, n) || 1;
  let zz = z / g, nn = n / g;
  if (nn < 0) { zz = -zz; nn = -nn; }
  return nn === 1 ? String(zz) : `${zz}/${nn}`;
}

/* ---------- Musterweg ---------- */
/* Zeilen { art, label, a, b | text }. x0 = null: allgemein, sonst an der Stelle x₀.
   Ausgangszähler (f(x+h) − f(x)) steht als eigene Zeile „ausmultipliziert“, dann zusammengefasst, h ausgeklammert, gekürzt, Grenzwert. */
export function musterweg(auf, x0 = null) {
  const stelle = x0 !== null;
  const basis = stelle ? `(${zahlText(x0)}+h)` : "(x+h)";
  const abl = ableitungVon(auf);
  const limesText = stelle ? zahlText(abl.fn(x0)) : abl.text;
  const limes = { art: "limes", label: "Grenzwert h → 0", text: limesText };

  if (auf.familie === "poly") {
    const k = auf.koef;
    const a = polyText(k, basis);
    const b = stelle ? zahlText(auf.fn(x0)) : polyText(k, "x");
    const zeilen = [{ art: "einsetzen", label: "Einsetzen", a, b }];
    // f(x+h) ausmultipliziert, in der Stelle-Fassung ist x schon die Zahl x₀
    let P = entwickelt(k);
    if (stelle) P = zusammengefasst(P.map(({ c, i, j }) => ({ c: c * x0 ** i, i: 0, j })));
    const fx = stelle ? zahlText(auf.fn(x0)) : polyText(k, "x");
    const klammer = /^-/.test(fx) || /[+-]/.test(fx.slice(1)) ? `(${fx})` : fx;
    const ausmult = `${gliederText(P, !stelle)}-${klammer}`;
    const Q = zusammengefasst([...P, ...(stelle ? [{ c: -auf.fn(x0), i: 0, j: 0 }] : k.map((c, i) => ({ c: -c, i, j: 0 })))]);
    const zusammen = gliederText(Q);
    if (ausmult !== zusammen) zeilen.push({ art: "bruch", label: "Ausmultiplizieren", text: ausmult });
    zeilen.push({ art: "bruch", label: "Zusammenfassen", text: zusammen });
    const R = Q.map((t) => ({ ...t, j: t.j - 1 }));
    const gekuerzt = gliederText(R);
    if (R.length > 1) zeilen.push({ art: "bruch", label: "h ausklammern", text: `h(${gekuerzt})` });
    zeilen.push({ art: "frei", label: "Durch h kürzen", text: gekuerzt });
    zeilen.push(limes);
    return zeilen;
  }
  if (auf.familie === "bruch") {
    const { a, c } = auf.form;
    const az = zahlText(a), azNeg = zahlText(-a);
    const faktor = (v) => (v === 1 ? "" : v === -1 ? "-" : zahlText(v));   // Faktor vor Klammer oder h
    const minus = (k, t) => (k < 0 ? `+${faktor(-k)}${t}` : `-${faktor(k)}${t}`);   // „− a·t“ ohne doppeltes Minus
    if (stelle) {
      const s = x0 + c, st = zahlText(s);
      const sh = `(${st}+h)`;
      return [
        { art: "einsetzen", label: "Einsetzen", a: `${az}/${sh}`, b: bruchText(a, s) },
        { art: "bruch", label: "Auf einen Nenner bringen", text: `(${zahlText(a * s)}${minus(a, sh)})/(${faktor(s)}${sh})` },
        { art: "bruch", label: "Zusammenfassen", text: `${faktor(-a)}h/(${faktor(s)}${sh})` },
        { art: "frei", label: "Durch h kürzen", text: `${azNeg}/(${faktor(s)}${sh})` },
        { ...limes, text: bruchText(-a, s * s) },
      ];
    }
    const xc = c === 0 ? "x" : `(x${nz(c)})`, xhc = `(x+h${nz(c)})`;
    return [
      { art: "einsetzen", label: "Einsetzen", a: `${az}/${xhc}`, b: `${az}/${xc}` },
      { art: "bruch", label: "Auf einen Nenner bringen", text: `(${faktor(a)}${xc}${minus(a, xhc)})/(${xhc}${xc})` },
      { art: "bruch", label: "Zusammenfassen", text: `${faktor(-a)}h/(${xhc}${xc})` },
      { art: "frei", label: "Durch h kürzen", text: `${azNeg}/(${xhc}${xc})` },
      limes,
    ];
  }
  if (auf.familie === "wurzel") {
    const { a, c } = auf.form;
    const az = a === 1 ? "" : a === -1 ? "-" : zahlText(a);
    const innen = stelle ? zahlText(x0 + c) : c === 0 ? "x" : `x${nz(c)}`;
    const m = stelle ? x0 + c : null, wm = stelle ? Math.sqrt(m) : null, glatt = stelle && Number.isInteger(wm);
    const w1 = `sqrt(${innen}+h)`, w2 = glatt ? zahlText(wm) : `sqrt(${innen})`;
    const summe = `(${w1}+${w2})`;
    const azZ = az === "" ? "1" : az === "-" ? "-1" : az;
    if (stelle) limes.text = glatt ? bruchText(a, 2 * wm) : `${azZ}/(2sqrt(${zahlText(m)}))`;
    return [
      { art: "einsetzen", label: "Einsetzen", a: `${az}${w1}`, b: stelle ? (glatt ? zahlText(a * wm) : `${az}${w2}`) : `${az}${w2}` },
      { art: "bruch", label: `Mit ${summe.slice(1, -1).replace(/sqrt\(([^)]*)\)/g, "√($1)")} erweitern`, text: `${az}(${innen}+h-${/[+-]/.test(innen.slice(1)) ? `(${innen})` : innen})/${summe}` },
      { art: "bruch", label: "Zusammenfassen", text: `${az}h/${summe}` },
      { art: "frei", label: "Durch h kürzen", text: `${azZ}/${summe}` },
      limes,
    ];
  }
  // Beliebige Funktion: nur Einsetzen und Ergebnis
  const aBaum = ersetzeX(auf.baum, stelle ? { k: "+", a: { k: "num", v: x0 }, b: { k: "var", n: "h" } } : { k: "+", a: { k: "x" }, b: { k: "var", n: "h" } });
  return [
    { art: "einsetzen", label: "Einsetzen", a: alsEingabe(aBaum), b: stelle ? zahlText(auf.fn(x0)) : auf.f },
    { ...limes, text: limesText },
  ];
}

/* ---------- Prüfen ---------- */
const dz = (v) => String(Math.round(v * 1000) / 1000).replace(".", ",").replace("-", MINUS);
const XH_PROBE = { x: 1.29, h: 0.5 };

/* Eingabe-Feld lesen: { g, baum } oder { fehler } */
function lesen(text, x0, bezeichnung) {
  const t = String(text || "").trim();
  if (!t) return { fehler: `${bezeichnung} ist noch leer.` };
  const baum = lies(t);
  if (!baum) return { fehler: "Der Term ist noch nicht vollständig – fülle alle Platzhalter ▯ und schließe die Klammern." };
  if (hatVar(baum) && [..."abckmnt"].some((v) => hatVar(baum, v))) return { fehler: "Im Term dürfen nur x, h und Zahlen vorkommen." };
  if (x0 !== null && hatX(baum)) return { fehler: `An der Stelle x₀ = ${zahlText(x0)} steht statt x überall die Zahl ${zahlText(x0)} – hier darf kein x mehr vorkommen.` };
  const g = kompiliere(baum);
  return { baum, g: (x, h) => g(x, { h }) };
}

/* Einsetzen: beide Felder getrennt. Ergebnis { a: { ok, hinweis }, b: { ok, hinweis } } */
/* Vorbereitung: f(x+h) ausrechnen (vor dem Bruch). wo = "Das Feld" | "Das erste Feld" (im Bruch) */
export function pruefeFxh(auf, x0, text, wo = "Das Feld") {
  const fxh = (x, h) => auf.fn(x + h), fx = (x) => auf.fn(x);
  const A = lesen(text, x0, wo);
  if (A.fehler) return { ok: false, hinweis: A.fehler };
  if (istGleich(A.g, fxh, x0)) return { ok: true, hinweis: "" };
  const name = x0 === null ? "f(x+h)" : `f(${zahlText(x0)}+h)`, ersatz = x0 === null ? "(x+h)" : `(${zahlText(x0)}+h)`;
  let hinweis = x0 === null ? "Das ist noch nicht f(x+h). Nimm den Term von f und ersetze jedes x durch (x+h) – mit Klammer."
    : `Das ist noch nicht ${name}. Setz in f für x überall ${ersatz} ein – mit Klammer.`;
  if (istGleich(A.g, (x) => fx(x), x0)) hinweis = x0 === null ? `Das ist f(x) selbst. Gesucht ist ${name}: Ersetze jedes x durch (x+h).` : `Das ist f(${zahlText(x0)}). Gesucht ist ${name}: Setz ${ersatz} für x ein.`;
  else if (istGleich(A.g, (x, h) => fx(x) + h, x0)) hinweis = "Das h gehört in die Klammer zu x – f(x+h), nicht f(x) + h.";
  else if (auf.familie === "poly" && auf.koef.length > 2 && istGleich(A.g, (x, h) => fx(x) + fx(h) - fx(0), x0)) hinweis = "Binomische Formel: (x+h)² ist x² + 2xh + h² – das gemischte Glied fehlt. Potenzen von (x+h) nie gliedweise.";
  else if (istGleich(A.g, (x, h) => -fxh(x, h), x0)) hinweis = "Fast – alle Vorzeichen sind gedreht.";
  return { ok: false, hinweis };
}

/* Musterweg der Vorbereitung: f(x+h) eingesetzt, bei Polynomen zusätzlich ausmultipliziert */
export function fxhWeg(auf, x0 = null) {
  const stelle = x0 !== null;
  const erst = musterweg(auf, x0)[0].a;
  if (auf.familie !== "poly") return [erst];
  let P = entwickelt(auf.koef);
  if (stelle) P = zusammengefasst(P.map(({ c, i, j }) => ({ c: c * x0 ** i, i: 0, j })));
  const aus = gliederText(P, !stelle);
  return aus === erst ? [erst] : [erst, aus];
}

export function pruefeEinsetzen(auf, x0, aText, bText) {
  const fxh = (x, h) => auf.fn(x + h), fx = (x) => auf.fn(x);
  const erg = { a: pruefeFxh(auf, x0, aText, "Das erste Feld"), b: null };
  const B = lesen(bText, x0, "Das zweite Feld");
  if (B.fehler) erg.b = { ok: false, hinweis: B.fehler };
  else if (istGleich(B.g, (x) => fx(x), x0)) erg.b = { ok: true, hinweis: "" };
  else {
    let hinweis = x0 === null ? "Ins zweite Feld gehört f(x) selbst – der Term der Aufgabe, ohne h." : `Ins zweite Feld gehört f(${zahlText(x0)}) – eine Zahl: Setz ${zahlText(x0)} in f ein.`;
    if (istGleich(B.g, fxh, x0)) hinweis = x0 === null ? "Das ist f(x+h) – ins zweite Feld gehört f(x), ganz ohne h." : `Das ist f(${zahlText(x0)}+h) – ins zweite Feld gehört f(${zahlText(x0)}), ganz ohne h.`;
    else if (x0 !== null && hatVar(B.baum, "h")) hinweis = `f(${zahlText(x0)}) ist eine Zahl – hier kommt kein h vor.`;
    erg.b = { ok: false, hinweis };
  }
  return erg;
}

/* Eine Umformungszeile: art = bruch (Zähler über h) | frei (ohne Bruch, h bleibt) | limes (kein h). */
export function pruefeZeile(auf, x0, artZeile, text) {
  const fxh = (x, h) => auf.fn(x + h), fx = (x) => auf.fn(x);
  const zaehler = (x, h) => fxh(x, h) - fx(x);
  const dq = (x, h) => zaehler(x, h) / h;
  const abl = ableitungVon(auf);
  const T = lesen(text, x0, "Die Zeile");
  if (T.fehler) return { ok: false, hinweis: T.fehler };
  const { g, baum } = T;
  const probe = (soll) => {
    const x = x0 === null ? XH_PROBE.x : x0, h = XH_PROBE.h;
    const m = g(x, h), s = soll(x, h);
    if (!endlich(m) || !endlich(s)) return "Noch nicht gleichwertig zur Zeile darüber. Prüf jeden Umformungsschritt einzeln.";
    return `Noch nicht gleichwertig zur Zeile darüber: bei ${x0 === null ? "x = 1,29 und " : ""}h = 0,5 liefert deine Zeile ${dz(m)}, die Zeile darüber ${dz(s)}.`;
  };
  if (artZeile === "bruch") {
    if (istGleich(g, zaehler, x0)) return { ok: true, hinweis: "" };
    if (istGleich(g, (x, h) => -zaehler(x, h), x0)) return { ok: false, hinweis: "Vorzeichen gedreht: Es heißt f(x+h) − f(x), nicht umgekehrt." };
    if (istGleich(g, dq, x0)) return { ok: false, hinweis: "Du hast schon durch h geteilt – dann gehört die Zeile nicht mehr über den Bruchstrich. Nimm dafür „h kürzen“." };
    if (istGleich(g, fxh, x0)) return { ok: false, hinweis: "Da fehlt das − f(x): Im Zähler steht f(x+h) minus f(x)." };
    if (istGleich(g, (x, h) => fxh(x, h) + fx(x), x0)) return { ok: false, hinweis: "Minus, nicht plus: f(x+h) − f(x)." };
    return { ok: false, hinweis: probe(zaehler) };
  }
  if (artZeile === "frei") {
    if (istGleich(g, dq, x0)) {
      // gekürzt heißt: bei h = 0 muss der Term einen Wert haben (kein h mehr im Nenner)
      const xs = x0 === null ? PAARE.map((p) => p.x) : [x0];
      const def = xs.filter((x) => endlich(auf.fn(x))).some((x) => endlich(g(x, 0)));
      if (def) return { ok: true, hinweis: "" };
      return { ok: false, hinweis: "Rechnerisch stimmt es, aber h steht noch im Nenner – bei h = 0 wäre der Term nicht definiert. Kürze h erst weg, dann darf der Bruch verschwinden." };
    }
    if (istGleich(g, zaehler, x0)) return { ok: false, hinweis: "Du hast den Nenner h vergessen: Der ganze Zähler muss durch h geteilt werden – erst dann kürzen." };
    if (istGleich(g, (x, h) => -dq(x, h), x0)) return { ok: false, hinweis: "Vorzeichen gedreht: Es heißt f(x+h) − f(x), nicht umgekehrt." };
    if (!hatVar(baum, "h") && istGleich(g, (x) => abl.fn(x), x0)) return { ok: false, hinweis: "Das ist schon das Ergebnis – aber hier steht noch „lim“ davor, das h gehört in dieser Zeile noch mit in den Term. Den letzten Schritt nimmst du mit „Grenzwert h → 0“." };
    return { ok: false, hinweis: probe(dq) };
  }
  // limes
  if (hatVar(baum, "h")) return { ok: false, hinweis: "Nach h → 0 darf kein h mehr vorkommen – setz überall h = 0 ein und vereinfache." };
  if (istGleich(g, (x) => abl.fn(x), x0)) return { ok: true, hinweis: "" };
  if (istGleich(g, (x) => fx(x), x0)) return { ok: false, hinweis: x0 === null ? "Das ist f(x) selbst, nicht die Ableitung." : `Das ist f(${zahlText(x0)}), der Funktionswert – gesucht ist die Steigung f′(${zahlText(x0)}).` };
  if (istGleich(g, (x) => -abl.fn(x), x0)) return { ok: false, hinweis: "Fast – alle Vorzeichen sind gedreht." };
  if (x0 !== null) {
    const m = g(x0, 0), s = abl.fn(x0);
    if (endlich(m) && endlich(s) && Math.abs(m - s) < 1e-3 * (1 + Math.abs(s))) return { ok: true, hinweis: "", gerundet: true };
    return { ok: false, hinweis: `Setz in deiner Zeile davor einfach h = 0 ein${endlich(m) ? ` – ${dz(m)} stimmt noch nicht` : ""}.` };
  }
  return { ok: false, hinweis: "Noch nicht f′(x). Setz in deiner Zeile davor einfach h = 0 ein – alle Glieder mit h fallen weg." };
}

/* Vorbelegung der nächsten Zeile: Text der Zeile darüber (Einsetzen → A − (B)) */
export function naechsterText(zeile) {
  if (!zeile) return "";
  if (zeile.art === "einsetzen") {
    const b = String(zeile.b || "").trim(), a = String(zeile.a || "").trim();
    if (!a && !b) return "";
    const klammer = /[+-]/.test(b.slice(1)) || /^-/.test(b) ? `(${b})` : b;
    return `${a}-${klammer}`;
  }
  return String(zeile.text || "");
}
