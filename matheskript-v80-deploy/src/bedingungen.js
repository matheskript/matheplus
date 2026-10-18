/* ======================================================================
   bedingungen.js – getippte Bedingungen lesen und mathematisch vergleichen
   (reine Logik, kein React, Node-testbar: tests/bedingungen.test.mjs)

   Wofür: Im Bereich „Textaufgaben übersetzen“ tippt der Schüler, was eine
   Textstelle bedeutet – „f'(6) = 0; f(6) = 4“, „3x − 4 = 11“, „P(X ≥ 3)“.
   Verglichen wird nicht der Text, sondern die Mathematik:

   · Gleichung/Ungleichung  L ~ R  wird zu D = L − R (bei ≤, < umgedreht).
     Zwei Bedingungen sind gleichwertig, wenn D_schüler = k · D_ziel für eine
     feste Zahl k ≠ 0 (bei Ungleichungen k > 0, gleiche Strenge) –
     „11 = 3x − 4“ und „6x − 8 = 22“ zählen also wie „3x − 4 = 11“.
   · Term ohne Relationszeichen: gleicher Wert (k = 1).
   · Geprüft wird an 7 festen Zufallsbelegungen aller Variablen.
   · Funktionswerte f(6), f'(6), f''(6): ohne Ansatz eigene Zufallszahlen je
     (Name, Ableitung, Stelle) – f(6) = 4 und f(4) = 6 sind also verschieden.
     Mit Ansatz (z. B. f(x) = ax³ + bx² + cx + d) wird wirklich eingesetzt;
     dann zählt auch „108a + 12b + c = 0“ für f'(6) = 0.
   · P(X …): Ereignisse über k = 0 … 200 mit Zufallsgewichten (Summe 1) –
     P(X > 2), P(X ≥ 3) und 1 − P(X ≤ 2) sind gleich, P(X ≥ 2) nicht.

   Eingabe: Bedingungen getrennt durch „;“, Zeilenumbruch, „und“/„and“ oder
   „, “ (Komma mit Leerzeichen zwischen zwei Gleichungen). Dezimalkomma und
   -punkt, Hochzahlen ² ³, Striche ′ ″, Malpunkt ·, ≥ ≤ ≠ auch als >= <= !=.
   ====================================================================== */

/* Standard-Funktionsnamen: ein Buchstabe vor „(“ ist ein Funktionsaufruf, kein Mal */
export const STANDARD_FUNKTIONEN = ["f", "g", "h", "k", "p", "r", "s", "v", "w", "A", "B", "E", "F", "G", "H", "K", "N", "T", "V", "W"];
const N_EREIGNIS = 200;
const PROBEN = 7;

/* ---------- Zufall (deterministisch) ---------- */
function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashText(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/* ---------- Text vereinheitlichen ---------- */
const HOCH = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9" };
export function vereinheitlichen(s) {
  return String(s ?? "")
    .replace(/[−–—]/g, "-")
    .replace(/[·×∙⋅]/g, "*")
    .replace(/÷/g, "/")
    .replace(/[′’´`]/g, "'").replace(/″/g, "''")
    .replace(/>=|=>/g, "≥").replace(/<=|=</g, "≤").replace(/!=|<>/g, "≠")
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, (m) => "^" + [...m].map((c) => HOCH[c]).join(""))
    .replace(/\u00a0/g, " ")
    .replace(/(^|[;\n])\s*H_?\{?[01]\}?\s*:/g, "$1");
}

/* Eingabe in einzelne Bedingungen zerlegen */
export function zerlegen(eingabe) {
  const roh = vereinheitlichen(eingabe)
    .split(/;|\n|\bund\b|\band\b|&/i)
    .map((t) => t.trim()).filter(Boolean);
  const aus = [];
  for (const t of roh) {
    const rel = (t.match(/[=≥≤≠<>]/g) || []).length;
    if (rel >= 2 && /,\s/.test(t)) {
      /* „f(2) = 0, f'(2) = 0“ – Komma mit Leerzeichen trennt, solange keine P(…)-Kette betroffen ist */
      const teile = t.split(/,\s+/).map((x) => x.trim()).filter(Boolean);
      if (teile.every((x) => /[=≥≤≠<>]/.test(x))) { aus.push(...teile); continue; }
    }
    aus.push(t);
  }
  return aus;
}

/* ---------- Zerlegen in Zeichen ---------- */
function tokens(s) {
  const t = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (/\s/.test(ch)) { i++; continue; }
    if (/[0-9]/.test(ch) || (ch === "." && /[0-9]/.test(s[i + 1] || ""))) {
      let j = i;
      while (j < s.length && /[0-9]/.test(s[j])) j++;
      if ((s[j] === "," || s[j] === ".") && /[0-9]/.test(s[j + 1] || "")) { j++; while (j < s.length && /[0-9]/.test(s[j])) j++; }
      const roh = s.slice(i, j).replace(",", ".");
      if (!/^\d*\.?\d+$/.test(roh)) return null;
      t.push({ k: "num", v: parseFloat(roh) });
      i = j; continue;
    }
    if (/[A-Za-zα-ωπ]/.test(ch)) {
      if (s.slice(i, i + 4).toLowerCase() === "sqrt") { t.push({ k: "sqrt" }); i += 4; continue; }
      if (ch === "π" || s.slice(i, i + 2) === "pi") { t.push({ k: "num", v: Math.PI }); i += ch === "π" ? 1 : 2; continue; }
      let striche = 0, j = i + 1;
      while (s[j] === "'") { striche++; j++; }
      t.push({ k: "id", n: ch, striche });
      i = j; continue;
    }
    if (ch === "√") { t.push({ k: "sqrt" }); i++; continue; }
    if ("+-*/^()=≥≤≠<>|".includes(ch)) { t.push({ k: ch }); i++; continue; }
    if (ch === ":") { t.push({ k: "/" }); i++; continue; }
    if (ch === "[" || ch === "{") { t.push({ k: "(" }); i++; continue; }
    if (ch === "]" || ch === "}") { t.push({ k: ")" }); i++; continue; }
    return null;
  }
  return t;
}

const REL = ["=", "≥", "≤", "≠", "<", ">"];

/* ---------- Parser ----------
   Knoten: {k:"num",v} {k:"var",n} {k:"+"|"-"|"*"|"/"|"^",a,b} {k:"neg",a}
           {k:"call",n,striche,a} {k:"P",ev} {k:"sqrt",a}
   Ergebnis: { L, rel, R } (rel null bei reinem Term) oder null */
export function lies(text, { funktionen = STANDARD_FUNKTIONEN } = {}) {
  const t = tokens(vereinheitlichen(text));
  if (!t || !t.length) return null;
  let p = 0;
  const schau = () => t[p];
  const ist = (k) => t[p] && t[p].k === k;
  const istFn = (tok) => tok && tok.k === "id" && (tok.striche > 0 || funktionen.includes(tok.n)) && t[p + 1] && t[p + 1].k === "(";

  function summe() {
    let n = produkt(); if (!n) return null;
    while (ist("+") || ist("-")) {
      const op = t[p++].k;
      const r = produkt(); if (!r) return null;
      n = { k: op, a: n, b: r };
    }
    return n;
  }
  function produkt() {
    let n = vorz(); if (!n) return null;
    for (;;) {
      if (ist("*") || ist("/")) {
        const op = t[p++].k;
        const r = vorz(); if (!r) return null;
        n = { k: op, a: n, b: r };
      } else if (schau() && ["num", "id", "(", "sqrt"].includes(schau().k)) {
        const r = potenz(); if (!r) return null;
        n = { k: "*", a: n, b: r };
      } else return n;
    }
  }
  function vorz() {
    if (ist("-")) { p++; const n = vorz(); return n ? { k: "neg", a: n } : null; }
    if (ist("+")) { p++; return vorz(); }
    return potenz();
  }
  function potenz() {
    const b = atom(); if (!b) return null;
    if (ist("^")) { p++; const e = vorz(); return e ? { k: "^", a: b, b: e } : null; }
    return b;
  }
  function ereignis() {
    /* Inhalt von P( … ) bis zur passenden Klammer: X op k, k op X op m, X = k */
    const start = p;
    let tiefe = 0;
    while (p < t.length) {
      if (t[p].k === "(") tiefe++;
      if (t[p].k === ")") { if (tiefe === 0) break; tiefe--; }
      p++;
    }
    const innen = t.slice(start, p);
    if (!ist(")")) return null;
    p++;
    const zahlen = [];
    const ops = [];
    let x = false;
    for (let i = 0; i < innen.length; i++) {
      const z = innen[i];
      if (z.k === "id" && (z.n === "X" || z.n === "Y" || z.n === "Z")) { x = true; zahlen.push("X"); continue; }
      if (z.k === "num") { zahlen.push(z.v); continue; }
      if (z.k === "-" && innen[i + 1] && innen[i + 1].k === "num") { zahlen.push(-innen[i + 1].v); i++; continue; }
      if (REL.includes(z.k)) { ops.push(z.k); continue; }
      return null;
    }
    if (!x) return null;
    const ganz = (v) => Number.isInteger(v);
    /* Grenzen in Mengen ganzer Zahlen umrechnen */
    const bed = [];
    const einzeln = (a, op, b) => {   // a op b, einer davon "X"
      if (a === "X" && typeof b === "number") return { op, k: b };
      if (b === "X" && typeof a === "number") return { op: { "<": ">", ">": "<", "≤": "≥", "≥": "≤", "=": "=", "≠": "≠" }[op], k: a };
      return null;
    };
    if (zahlen.length === 3 && ops.length === 2 && zahlen[1] === "X") {
      const e1 = einzeln(zahlen[0], ops[0], "X"), e2 = einzeln("X", ops[1], zahlen[2]);
      if (!e1 || !e2) return null;
      bed.push(e1, e2);
    } else if (zahlen.length === 2 && ops.length === 1) {
      const e = einzeln(zahlen[0], ops[0], zahlen[1]);
      if (!e) return null;
      bed.push(e);
    } else return null;
    if (!bed.every((b) => ganz(b.k))) return null;
    return { k: "P", bed };
  }
  function atom() {
    const s = schau(); if (!s) return null;
    if (s.k === "num") { p++; return { k: "num", v: s.v }; }
    if (s.k === "sqrt") {
      p++;
      if (ist("(")) { p++; const n = summe(); if (!n || !ist(")")) return null; p++; return { k: "sqrt", a: n }; }
      const n = potenz(); return n ? { k: "sqrt", a: n } : null;
    }
    if (s.k === "(") { p++; const n = summe(); if (!n || !ist(")")) return null; p++; return n; }
    if (s.k === "|") { p++; const n = summe(); if (!n || !ist("|")) return null; p++; return { k: "abs", a: n }; }
    if (s.k === "id") {
      if (s.n === "P" && t[p + 1] && t[p + 1].k === "(" && s.striche === 0) {
        p += 2;
        const ev = ereignis();
        if (ev) return ev;
        return null;
      }
      if (istFn(s)) {
        p += 2;
        const arg = summe(); if (!arg || !ist(")")) return null; p++;
        return { k: "call", n: s.n, striche: s.striche, a: arg };
      }
      if (s.striche > 0) return null;
      p++;
      return { k: "var", n: s.n };
    }
    return null;
  }
  const L = summe(); if (!L) return null;
  let rel = null, R = null;
  if (schau() && REL.includes(schau().k)) {
    rel = t[p++].k;
    R = summe(); if (!R) return null;
  }
  if (p !== t.length) return null;
  return { L, rel, R };
}

/* ---------- Auswerten an einer Belegung ---------- */
function variablenIn(n, menge = new Set()) {
  if (!n) return menge;
  if (n.k === "var") menge.add(n.n);
  for (const s of ["a", "b"]) if (n[s]) variablenIn(n[s], menge);
  return menge;
}

/* Belegung Nr. i: Variablen, Funktionswerte, Ereignisgewichte */
function belegung(i, ansatz) {
  const zufall = mulberry(1000 + 7919 * i);
  const werte = {};
  const varWert = (n) => {
    if (!(n in werte)) {
      if (n === "e" && !(ansatz && ansatz.variablen && ansatz.variablen.includes("e"))) werte[n] = Math.E;
      else werte[n] = 0.6 + 2.3 * mulberry(hashText(`${i}|var|${n}`))();
    }
    return werte[n];
  };
  let gewichte = null;
  const gew = () => {
    if (gewichte) return gewichte;
    const g = Array.from({ length: N_EREIGNIS + 1 }, () => 0.2 + zufall());
    const s = g.reduce((a, b) => a + b, 0);
    gewichte = g.map((x) => x / s);
    return gewichte;
  };
  return {
    var: varWert,
    call(n, striche, x) {
      if (ansatz && ansatz.name === n && typeof ansatz.wert === "function") return ansatz.wert(varWert, x, striche);
      return 1 + 4 * mulberry(hashText(`${i}|fn|${n}|${striche}|${Math.round(x * 1e6)}`))();
    },
    P(bed) {
      const g = gew();
      let s = 0;
      for (let k = 0; k <= N_EREIGNIS; k++) {
        if (bed.every((b) => ({ "=": k === b.k, "≠": k !== b.k, "<": k < b.k, ">": k > b.k, "≤": k <= b.k, "≥": k >= b.k })[b.op])) s += g[k];
      }
      return s;
    },
  };
}

function wert(n, B) {
  switch (n.k) {
    case "num": return n.v;
    case "var": return B.var(n.n);
    case "neg": return -wert(n.a, B);
    case "+": return wert(n.a, B) + wert(n.b, B);
    case "-": return wert(n.a, B) - wert(n.b, B);
    case "*": return wert(n.a, B) * wert(n.b, B);
    case "/": { const q = wert(n.b, B); return q === 0 ? NaN : wert(n.a, B) / q; }
    case "^": return Math.pow(wert(n.a, B), wert(n.b, B));
    case "sqrt": { const u = wert(n.a, B); return u >= 0 ? Math.sqrt(u) : NaN; }
    case "abs": return Math.abs(wert(n.a, B));
    case "call": return B.call(n.n, n.striche, wert(n.a, B));
    case "P": return B.P(n.bed);
    default: return NaN;
  }
}

/* Bedingung → Liste der D-Werte über alle Belegungen; null bei Lesefehler */
function profil(b, ansatz) {
  const strikt = b.rel === "<" || b.rel === ">";
  const dreh = b.rel === "≤" || b.rel === "<";
  const art = b.rel === null ? "term" : b.rel === "=" ? "gleich" : b.rel === "≠" ? "ungleich" : strikt ? "groesser" : "groessergleich";
  const D = [];
  for (let i = 0; i < PROBEN; i++) {
    const B = belegung(i, ansatz);
    const v = b.rel === null ? wert(b.L, B) : wert(b.L, B) - wert(b.R, B);
    D.push(dreh ? -v : v);
  }
  return { art, D };
}

const fast = (a, b) => Math.abs(a - b) <= 1e-7 * (1 + Math.abs(a) + Math.abs(b));

/* Sind zwei gelesene Bedingungen gleichwertig? */
export function gleichwertigGelesen(a, b, ansatz = null) {
  if (!a || !b) return false;
  const pa = profil(a, ansatz), pb = profil(b, ansatz);
  if (pa.D.some((x) => !isFinite(x)) || pb.D.some((x) => !isFinite(x))) return false;
  if (pa.art === "term" || pb.art === "term") {
    if (pa.art !== pb.art) return false;
    return pa.D.every((x, i) => fast(x, pb.D[i]));
  }
  if (pa.art !== pb.art) return false;
  /* Faktor k aus der Probe mit dem größten |D_ziel| */
  let im = 0;
  for (let i = 1; i < PROBEN; i++) if (Math.abs(pb.D[i]) > Math.abs(pb.D[im])) im = i;
  if (Math.abs(pb.D[im]) < 1e-12) return pa.D.every((x) => Math.abs(x) < 1e-9);
  const k = pa.D[im] / pb.D[im];
  if (Math.abs(k) < 1e-9) return false;
  if ((pa.art === "groesser" || pa.art === "groessergleich") && k <= 0) return false;
  return pa.D.every((x, i) => fast(x, k * pb.D[i]));
}

export function gleichwertig(a, b, opt = {}) {
  const la = typeof a === "string" ? lies(a, opt) : a;
  const lb = typeof b === "string" ? lies(b, opt) : b;
  return gleichwertigGelesen(la, lb, opt.ansatz || null);
}

/* ---------- Eingabe gegen Ziele prüfen ----------
   ziele:  [{ c, alt?: [..] }]       – was zur Textstelle gehört
   falsch: [{ c, text }]              – typische Denkfehler mit Rückmeldung
   Ergebnis: { ok, gefunden: [bool je Ziel], unlesbar: [text], extra: [{ text, fehler? }], doppelt } */
export function pruefeEingabe(eingabe, ziele, { falsch = [], funktionen = STANDARD_FUNKTIONEN, ansatz = null } = {}) {
  const teile = zerlegen(eingabe);
  const opt = { funktionen };
  const gelesen = teile.map((t) => ({ t, b: lies(t, opt) }));
  const unlesbar = gelesen.filter((g) => !g.b).map((g) => g.t);
  const zielGelesen = ziele.map((z) => [z.c, ...(z.alt || [])].map((c) => lies(c, opt)).filter(Boolean));
  const gefunden = ziele.map(() => false);
  const extra = [];
  for (const g of gelesen) {
    if (!g.b) continue;
    const i = zielGelesen.findIndex((liste, j) => !gefunden[j] && liste.some((z) => gleichwertigGelesen(g.b, z, ansatz)));
    if (i >= 0) { gefunden[i] = true; continue; }
    if (ansatz && g.b.rel === "=" && profil(g.b, ansatz).D.every((x) => Math.abs(x) < 1e-9)) { extra.push({ text: g.t, trivial: true }); continue; }
    const schon = zielGelesen.findIndex((liste) => liste.some((z) => gleichwertigGelesen(g.b, z, ansatz)));
    if (schon >= 0) { extra.push({ text: g.t, doppelt: true }); continue; }
    const f = falsch.find((x) => x.c && (() => { const lf = lies(x.c, opt); return lf && gleichwertigGelesen(g.b, lf, ansatz); })());
    extra.push({ text: g.t, fehler: f ? f.text : null });
  }
  const ok = gefunden.every(Boolean) && !extra.some((e) => !e.doppelt && !e.trivial) && unlesbar.length === 0;
  return { ok, gefunden, unlesbar, extra, leer: teile.length === 0 };
}

/* ---------- Ansätze zum Einsetzen ---------- */
const fallend = (p, k) => { let f = 1; for (let i = 0; i < k; i++) f *= p - i; return f; };
/* Ganzrationaler Ansatz: koeff = [["a", 3], ["b", 2], …] → f^(k)(x) */
export function polyAnsatz(koeff, name = "f") {
  return {
    name, variablen: koeff.map(([v]) => v), koeff,
    wert: (varWert, x, k) => koeff.reduce((s, [v, p]) => (p - k < 0 ? s : s + varWert(v) * fallend(p, k) * Math.pow(x, p - k)), 0),
  };
}
/* Exponentialansatz f(x) = a · b^x */
export function expAnsatz(a = "a", b = "b", name = "f") {
  return {
    name, variablen: [a, b],
    wert: (varWert, x, k) => varWert(a) * Math.pow(Math.log(varWert(b)), k) * Math.pow(varWert(b), x),
  };
}
/* Lineare Funktion f(x) = m·x + c und Scheitelform f(x) = a(x − d)² + e */
export const linAnsatz = (name = "f") => polyAnsatz([["m", 1], ["c", 0]], name);
export function scheitelAnsatz(name = "f") {
  return {
    name, variablen: ["a", "d", "e"],
    wert: (varWert, x, k) => {
      const a = varWert("a"), d = varWert("d"), e = varWert("e");
      if (k === 0) return a * (x - d) ** 2 + e;
      if (k === 1) return 2 * a * (x - d);
      if (k === 2) return 2 * a;
      return 0;
    },
  };
}

/* ---------- Anzeige: einfache Schreibweise → Mini-TeX ----------
   „f'(6) = 0“ → „f′(6) = 0“, „3*x“ → „3 \cdot x“, „x/4“ → „\frac{x}{4}“, „>=“ → „\geq“ */
export function alsTex(s) {
  let t = vereinheitlichen(s);
  /* einfache Brüche a/b (Zahl, Buchstabe oder Klammer) */
  const kl = "\\((?:[^()]|\\([^()]*\\))*\\)";
  const teil = `(\\d+(?:[.,]\\d+)?|[A-Za-z](?:'*\\([^()]*\\))?|${kl})`;
  t = t.replace(new RegExp(`${teil}\\s*/\\s*${teil}`, "g"), (m, a, b) => `\\frac{${a.replace(/^\((.*)\)$/, "$1")}}{${b.replace(/^\((.*)\)$/, "$1")}}`);
  t = t.replace(/\^\(([^()]*)\)/g, "^{$1}").replace(/\^(-?\d+(?:[.,]\d+)?|[A-Za-z])/g, "^{$1}");
  t = t.replace(/sqrt\(([^()]*)\)/g, "\\sqrt{$1}");
  t = t.replace(/''/g, "″").replace(/'/g, "′");
  t = t.replace(/\*/g, " \\cdot ").replace(/≥/g, " \\geq ").replace(/≤/g, " \\leq ").replace(/≠/g, " \\neq ");
  t = t.replace(/-/g, "−");
  return t.replace(/\s{2,}/g, " ").trim();
}
