/* ======================================================================
   perfAlgebra.js – exakte Algebra für das Performance-Lab (kein React, kein Speicher).

   Liest Terme und lineare/einfache Gleichungen in einer Variablen x als Polynome mit
   exakten Brüchen. Damit lassen sich
     · Antworten auf mathematische Äquivalenz prüfen (2x−3 = −3+2x = 2·x−3),
     · Rechenwege Zeile für Zeile prüfen und den FRÜHESTEN falschen Übergang finden,
     · Vorzeichenfehler von anderen Fehlern unterscheiden.
   Alles ist exakt (keine Gleitkomma-Toleranzen). Was der Parser nicht versteht, liefert
   null – „nicht prüfbar“ ist nie dasselbe wie „falsch“.
   Keine base-Datei darf diese Datei importieren.
   ====================================================================== */

const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a || 1; };
const sicher = (v) => { if (!Number.isSafeInteger(v)) throw new Error("zu gross"); return v; };
const fr = (z, n = 1) => {
  if (n === 0) throw new Error("null");
  if (n < 0) { z = -z; n = -n; }
  const g = gcd(z, n);
  return { z: sicher(z / g), n: sicher(n / g) };
};
const fAdd = (a, b) => fr(sicher(a.z * b.n + b.z * a.n), sicher(a.n * b.n));
const fMul = (a, b) => fr(sicher(a.z * b.z), sicher(a.n * b.n));
const fNeg = (a) => ({ z: -a.z, n: a.n });
const fNull = (a) => a.z === 0;
const fGleich = (a, b) => a.z === b.z && a.n === b.n;
const NULL = fr(0);

/* ---------- Polynome: dichte Liste, Index = Grad ---------- */
const trim = (p) => { const r = p.slice(); while (r.length > 1 && fNull(r[r.length - 1])) r.pop(); return r.length ? r : [NULL]; };
const pAdd = (a, b) => trim(Array.from({ length: Math.max(a.length, b.length) }, (_, i) => fAdd(a[i] || NULL, b[i] || NULL)));
const pNeg = (a) => a.map(fNeg);
const pSub = (a, b) => pAdd(a, pNeg(b));
const pMul = (a, b) => {
  const r = Array.from({ length: a.length + b.length - 1 }, () => NULL);
  a.forEach((x, i) => b.forEach((y, j) => { r[i + j] = fAdd(r[i + j], fMul(x, y)); }));
  return trim(r);
};
const pKonst = (p) => (p.length === 1 ? p[0] : null);
const pPot = (b, e) => { let r = [fr(1)]; for (let i = 0; i < e; i++) r = pMul(r, b); return r; };

export const polyGleich = (a, b) => {
  const x = trim(a), y = trim(b);
  return x.length === y.length && x.every((c, i) => fGleich(c, y[i]));
};
export const polyGrad = (p) => trim(p).length - 1;
export const polyAbleiten = (p) => (p.length <= 1 ? [NULL] : trim(p.slice(1).map((c, i) => fMul(c, fr(i + 1)))));
export const polyAuswerten = (p, x) => p.reduceRight((s, c) => fAdd(fMul(s, x), c), NULL);

/* ---------- Normalisieren und Lesen ---------- */
export function normalisiere(s) {
  return String(s ?? "")
    .toLowerCase()
    .replace(/[−–—]/g, "-")
    .replace(/[·×⋅]/g, "*")
    .replace(/÷/g, "/")
    .replace(/\*\*/g, "^")
    .replace(/²/g, "^2").replace(/³/g, "^3")
    .replace(/[\s ]+/g, "")
    .replace(/,/g, ".");
}

function tokens(s) {
  const t = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/\d|\./.test(c)) {
      const m = s.slice(i).match(/^(\d+\.?\d*|\.\d+)/);
      if (!m) throw new Error("zahl");
      t.push({ k: "n", v: m[1] }); i += m[1].length;
    } else if (c === "x") { t.push({ k: "x" }); i++; }
    else if ("+-*/^()".includes(c)) { t.push({ k: c }); i++; }
    else throw new Error("zeichen");
  }
  return t;
}

const zahlPoly = (txt) => {
  const [g, d = ""] = txt.split(".");
  const n = 10 ** d.length;
  return [fr(Number((g || "0") + d), n)];
};

/* Term lesen → Polynom (Liste von Brüchen) oder null */
export function parsePoly(text) {
  const s = normalisiere(text);
  if (!s) return null;
  try {
    const t = tokens(s);
    let p = 0;
    const peek = () => (p < t.length ? t[p].k : null);
    const nimm = () => t[p++];
    function ausdruck() {
      let a = term();
      while (peek() === "+" || peek() === "-") { const op = nimm().k; const b = term(); a = op === "+" ? pAdd(a, b) : pSub(a, b); }
      return a;
    }
    function term() {
      let a = faktor();
      for (;;) {
        const k = peek();
        if (k === "*") { nimm(); a = pMul(a, faktor()); }
        else if (k === "/") {
          nimm();
          const d = pKonst(faktor());
          if (!d || fNull(d)) throw new Error("division");
          a = pMul(a, [fr(d.n, d.z)]);
        }
        else if (k === "x" || k === "(") a = pMul(a, potenz());   // 2x, 3(x+1), (x+1)(x−2)
        else break;
      }
      return a;
    }
    function faktor() {
      if (peek() === "-") { nimm(); return pNeg(faktor()); }
      if (peek() === "+") { nimm(); return faktor(); }
      return potenz();
    }
    function potenz() {
      const b = atom();
      if (peek() === "^") {
        nimm();
        let klammer = false;
        if (peek() === "(") { nimm(); klammer = true; }
        const z = nimm();
        if (!z || z.k !== "n" || !/^\d+$/.test(z.v)) throw new Error("exponent");
        if (klammer && nimm()?.k !== ")") throw new Error("klammer");
        const e = Number(z.v);
        if (e > 8) throw new Error("exponent");
        return pPot(b, e);
      }
      return b;
    }
    function atom() {
      const a = nimm();
      if (!a) throw new Error("ende");
      if (a.k === "n") return zahlPoly(a.v);
      if (a.k === "x") return [NULL, fr(1)];
      if (a.k === "(") { const r = ausdruck(); if (nimm()?.k !== ")") throw new Error("klammer"); return r; }
      throw new Error("atom");
    }
    const r = ausdruck();
    return p === t.length ? trim(r) : null;
  } catch (e) { return null; }
}

/* Gleichung „links = rechts“ → { l, r } oder null (genau ein Gleichheitszeichen) */
export function parseGleichung(text) {
  const teile = String(text ?? "").split("=");
  if (teile.length !== 2) return null;
  const l = parsePoly(teile[0]), r = parsePoly(teile[1]);
  return l && r ? { l, r } : null;
}

/* Einzelwert lesen: „12“, „−3/4“, „x = 2,5“ → Bruch {z,n} oder null */
export function parseWert(text) {
  let s = normalisiere(text).replace(/^x=/, "");
  if (!s) return null;
  const p = parsePoly(s);
  return p && p.length === 1 ? p[0] : null;
}
export const wertGleich = (a, b) => !!a && !!b && fGleich(a, b);
export const wertText = (a) => (a.n === 1 ? String(a.z) : `${a.z}/${a.n}`);

/* Lösung einer linearen Gleichung → Bruch, "alle", "keine" oder null (nicht linear) */
export function loeseLinear(text) {
  const g = parseGleichung(text);
  if (!g) return null;
  const d = pSub(g.l, g.r);
  if (d.length === 1) return fNull(d[0]) ? "alle" : "keine";
  if (d.length === 2) return fMul(fNeg(d[0]), fr(d[1].n, d[1].z));
  return null;
}

/* ---------- Anzeige ---------- */
export function polyText(p) {
  const q = trim(p);
  const teile = [];
  for (let k = q.length - 1; k >= 0; k--) {
    const c = q[k];
    if (fNull(c)) continue;
    const betrag = { z: Math.abs(c.z), n: c.n };
    const bTxt = betrag.n === 1 ? String(betrag.z) : `${betrag.z}/${betrag.n}`;
    const koef = k > 0 && betrag.z === 1 && betrag.n === 1 ? "" : bTxt;
    const v = k === 0 ? "" : k === 1 ? "x" : `x^${k}`;
    teile.push({ neg: c.z < 0, text: `${koef}${v}` });
  }
  if (!teile.length) return "0";
  return teile.map((t, i) => (i === 0 ? (t.neg ? "-" : "") + t.text : `${t.neg ? "-" : "+"} ${t.text}`)).join(" ");
}

/* ---------- Zeilen vergleichen ---------- */
function proportional(a, b) {
  const x = trim(a), y = trim(b);
  const nx = x.every((c) => fNull(c)), ny = y.every((c) => fNull(c));
  if (nx || ny) return nx && ny;
  if (x.length !== y.length) return false;
  const i = x.length - 1;
  const c = fMul(x[i], fr(y[i].n, y[i].z));           // Faktor aus dem Spitzenkoeffizienten
  return x.every((v, k) => fGleich(v, fMul(y[k], c)));
}

/* true = gleichwertig, false = nachweislich nicht gleichwertig, null = nicht prüfbar.
   Terme: gleiches Polynom. Gleichungen: gleiche Lösungsmenge (bis auf einen Faktor ≠ 0). */
export function aequivalent(a, b) {
  const ga = String(a).includes("="), gb = String(b).includes("=");
  if (ga !== gb) return null;
  if (!ga) {
    const p = parsePoly(a), q = parsePoly(b);
    return p && q ? polyGleich(p, q) : null;
  }
  const x = parseGleichung(a), y = parseGleichung(b);
  if (!x || !y) return null;
  return proportional(pSub(x.l, x.r), pSub(y.l, y.r));
}

/* Frühester falscher Übergang einer Rechenkette.
   → { status: "ok" | "falsch" | "offen", index (Zeile, die den Fehler enthält), vorher, nachher, luecken: [Zeilen, die nicht prüfbar waren] }
   Folgezeilen werden NICHT als weitere Fehler gemeldet – nur die erste Bruchstelle zählt. */
export function fruehesterFehler(zeilen) {
  const z = (zeilen || []).map((x) => String(x ?? "").trim()).filter(Boolean);
  const luecken = [];
  for (let i = 1; i < z.length; i++) {
    const r = aequivalent(z[i - 1], z[i]);
    if (r === false) return { status: "falsch", index: i, vorher: z[i - 1], nachher: z[i], luecken };
    if (r === null) luecken.push(i);
  }
  return { status: z.length >= 2 && luecken.length === z.length - 1 ? "offen" : "ok", index: null, luecken };
}

/* ---------- Vorzeichenfehler erkennen ---------- */
export const betragsAtome = (s) => {
  const m = normalisiere(s).replace(/=/g, "+").match(/(\d+\.?\d*)?x(\^\d+)?|\d+\.?\d*/g) || [];
  return m.map((a) => a.replace(/^1x/, "x")).sort().join("|");
};

/* Prüft einen nachweislich falschen Übergang vorher → nachher darauf, ob er wie ein
   Vorzeichenfehler aussieht, und benennt den Untertyp. Immer eine HYPOTHESE:
   { ist, sicherheit 0..1, untertyp, grund }.
   art: "ableiten" gibt dem Untertyp den Kontext Ableitung. */
export function erkenneVorzeichenfehler(vorher, nachher, art = null) {
  const gv = String(vorher).includes("="), gn = String(nachher).includes("=");
  if (gv !== gn) return { ist: false, sicherheit: 0, untertyp: null, grund: "Ein Term wurde mit einer Gleichung verglichen." };
  let nurVorzeichen = false, sicherheit = 0;
  if (!gv) {
    const r = parsePoly(vorher), w = parsePoly(nachher);
    if (r && w && !polyGleich(r, w) && r.length === w.length) {
      const flips = r.map((c, k) => (fGleich(c, w[k]) ? 0 : fGleich(c, fNeg(w[k])) ? 1 : -1));
      nurVorzeichen = flips.every((f) => f !== -1) && flips.some((f) => f === 1);
      if (nurVorzeichen) sicherheit = 0.9;
    }
  }
  if (!nurVorzeichen && betragsAtome(vorher) === betragsAtome(nachher) && aequivalent(vorher, nachher) === false) {
    nurVorzeichen = true; sicherheit = 0.7;
  }
  if (!nurVorzeichen) return { ist: false, sicherheit: 0, untertyp: null, grund: "Die Beträge der Terme stimmen nicht überein – kein reiner Vorzeichenfehler." };
  const v = normalisiere(vorher);
  let untertyp, grund;
  if (/-\(/.test(v) && !/\(/.test(normalisiere(nachher))) { untertyp = "minus_klammer"; grund = "Vor der Klammer stand ein Minus, das nicht auf jeden Summanden gewirkt hat."; }
  else if (gv) { untertyp = "umstellen"; grund = "Beim Umstellen der Gleichung wurde ein Vorzeichen nicht mitgedreht."; }
  else if (art === "ableiten") { untertyp = "ableiten"; grund = "Beim Ableiten ist ein Vorzeichen verloren gegangen oder gekippt."; }
  else { untertyp = "zusammenfassen"; grund = "Beim Ausmultiplizieren oder Zusammenfassen ist ein Vorzeichen gekippt."; }
  return { ist: true, sicherheit, untertyp, grund };
}
