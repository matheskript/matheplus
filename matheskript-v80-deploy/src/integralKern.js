/* ============================================================
   Integraltrainer – Rechenkern (ohne Oberfläche)
   Fünf Aufgabentypen, je mit Stufen:
     stamm     Stammfunktion bilden             ∫ f(x) dx = F(x) + C
     anfang    Stammfunktion durch einen Punkt   F(x₀) = y₀  →  C
     bestimmt  Bestimmtes Integral               ∫ₐᵇ f(x) dx = F(b) − F(a)
     flaeche   Fläche mit der x-Achse            Nullstellen → Teilintegrale → A = |I₁| + |I₂| …
     zwei      Fläche zwischen zwei Graphen      d = f − g → Schnittstellen → A = |I₁| + …
   Jede Aufgabe bringt ihren vollständigen Rechenweg mit: eine Liste von Schritten
   { id, titel, frage, label, art (term | zahl | zahlen | info), zeilen, antwortTex, pruefen, fokus }.
   Eine Rechenzeile ist { k: [Stücke …], notiz } – die Stücke gehören zu EINER Zeile
   (die Oberfläche bricht nur zwischen ihnen um), damit nach jedem ausrechenbaren
   Ausdruck in derselben Zeile mit „=“ weitergerechnet wird (Regel A5).
   Polynom-Aufgaben rechnen exakt mit Brüchen (rechnen2.js), alles andere über die
   Formel-Engine (regelwerkKern.js) plus Exaktwert-Erkennung (e, e², π, ln 2 …).
   Bild-Daten (bild) beschreiben, was das Schaubild zeigt.
   Test: tests/integralTrainer.test.mjs. Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import {
  q, qAbs, qAdd, qDiv, qGleich, qMul, qNeg, qNull, qNum, qSub, qTex, pAdd, pAus, pAusNullstellen, pDer, pInt, pNum, pSub, pTex, pTrim, teilIntervalle, wahl, zz,
} from "./rechnen2.js";
import {
  auswerter, bruch, einsetzen, grenzeLesen, hauptsatz, lies, neueStammAufgabe, polyKoef, pruefeIntegralStamm, pruefeStamm, stammfunktion, tex,
} from "./regelwerkKern.js";

/* ---------- Aufgabentypen ---------- */

export const TYPEN = [
  { id: "stamm", name: "Stammfunktion bilden", kurz: "Stammfunktion", zeichen: "∫ f(x) dx",
    stufen: ["Potenzen", "Brüche und Wurzeln", "sin, cos, eˣ, 1/x", "Verkettet: f(mx + c)"], eigen: true },
  { id: "anfang", name: "Stammfunktion durch einen Punkt", kurz: "Durch einen Punkt", zeichen: "F(x₀) = y₀",
    stufen: ["Einfache Polynome", "Polynome", "sin, cos, eˣ, 1/x"] },
  { id: "bestimmt", name: "Bestimmtes Integral", kurz: "Bestimmtes Integral", zeichen: "∫ₐᵇ f(x) dx",
    stufen: ["Einstieg", "Polynome mit Vorzeichen", "sin, cos, eˣ, 1/x", "Verkettet: f(mx + c)"], eigen: true },
  { id: "flaeche", name: "Fläche mit der x-Achse", kurz: "Fläche mit x-Achse", zeichen: "A = |I₁| + |I₂|",
    stufen: ["Eine Teilfläche", "Zwei Teilflächen", "Grenzen und mehr Teilflächen"] },
  { id: "zwei", name: "Fläche zwischen zwei Graphen", kurz: "Zwischen zwei Graphen", zeichen: "∫ (f − g) dx",
    stufen: ["Parabel und Gerade", "Zwei Parabeln", "Drei Schnittstellen"] },
];
export const typVon = (id) => TYPEN.find((t) => t.id === id) || TYPEN[0];

/* ---------- kleine Helfer ---------- */

const endlich = (v) => typeof v === "number" && Number.isFinite(v);
const ohne0 = (a, b) => { let z = 0; while (z === 0) z = zz(a, b); return z; };
const komma = (s) => String(s).replace(".", "{,}").replace(/-/g, "−");
/* Dezimalzahl für „≈ …“ (TeX: Komma als {,}) */
export function naeherung(v, st = 2) {
  if (!endlich(v)) return "–";
  const r = Math.round(v * 10 ** st) / 10 ** st;
  return komma(Object.is(r, -0) ? 0 : r);
}
/* Klartext-Dezimalzahl für Hinweise */
const dezText = (v, st = 2) => naeherung(v, st).replace("{,}", ",");
const qVonZahl = (v) => { const b = bruch(v, 2000); return b && Math.abs(b.z) < 1e7 ? q(b.z, b.n) : null; };
/* Ein Wert, der abgezogen wird, bekommt Klammern, wenn er mit Minus beginnt oder eine Summe ist */
const abzug = (t) => (/^−/.test(t) || /\s[+−]\s/.test(t) ? `(${t})` : t);
const summand = (t) => (/\s[+−]\s/.test(t) ? `(${t})` : t);
/* Polynom als Eingabetext für die Formel-Engine: 1/2x^3-2x+1 */
export function pEingabe(p) {
  const t = pTrim(p);
  let s = "";
  for (let i = t.length - 1; i >= 0; i--) {
    const c = t[i];
    if (qNull(c)) continue;
    const a = qAbs(c), eins = qGleich(a, q(1));
    const k = i === 0 ? (a.n === 1 ? `${a.z}` : `${a.z}/${a.n}`) : eins ? "" : a.n === 1 ? `${a.z}` : `${a.z}/${a.n}`;
    const pot = i === 0 ? "" : i === 1 ? "x" : `x^${i}`;
    s += (c.z < 0 ? "-" : s ? "+" : "") + k + pot;
  }
  return s || "0";
}
/* Zahl im Polynom als Grenze: TeX */
const xTex = (x) => qTex(x);
/* Wurzel eines Bruchs, der ein Quadrat ist */
function qWurzel(a) {
  const wz = Math.round(Math.sqrt(a.z)), wn = Math.round(Math.sqrt(a.n));
  return wz * wz === a.z && wn * wn === a.n ? q(wz, wn) : null;
}

/* Pen & Paper: Produkte eng – „2 x“ → „2x“, „\\frac{1}{3} x^{3}“ → „\\frac{1}{3}x^{3}“, „2 \\cos(x)“ → „2\\cos(x)“ */
export const eng = (t) => String(t).replace(/([\d}])\s+(?=[a-zπ(]|\\(?:sin|cos|tan|ln|sqrt|pi)\b)/g, "$1");
const T = (n) => eng(tex(n));
/* Eingesetzte Grenze: Malpunkt vor Brüchen („2 · π/2“ statt „2 π/2“) */
const substTex = (t) => eng(t).replace(/([\d)])\s*(\\frac)/g, "$1 \\cdot $2");

/* ---------- Exaktwerte erkennen: Bruch, oder Bruch · Konstante + Bruch ---------- */

const KONSTANTEN = [
  { tex: "e", v: Math.E },
  { tex: "e^{2}", v: Math.E ** 2 },
  { tex: "π", v: Math.PI, pi: true },
  { tex: "π^{2}", v: Math.PI ** 2 },
  { tex: "\\ln(2)", v: Math.LN2 },
  { tex: "\\ln(3)", v: Math.log(3) },
  { tex: "e", v: 1 / Math.E, kehr: true },
];
function konstTerm(c, k) {
  const a = qAbs(c), vor = c.z < 0 ? "−" : "";
  if (k.kehr) return `${vor}\\frac{${a.z}}{${a.n === 1 ? "" : a.n}e}`;
  if (k.pi && a.n !== 1) return `${vor}\\frac{${a.z === 1 ? "" : a.z}${k.tex}}{${a.n}}`;
  if (qGleich(a, q(1))) return `${vor}${k.tex}`;
  return `${vor}${qTex(a)}${k.tex}`;
}
export function exaktTex(v) {
  if (!endlich(v)) return null;
  const r = bruch(v, 120);
  if (r) return qTex(q(r.z, r.n));
  for (const k of KONSTANTEN) {
    for (let n = 1; n <= 12; n++) {
      for (let z = -48; z <= 48; z++) {
        if (!z) continue;
        const c = q(z, n);
        if (c.n !== n) continue;                       // nur gekürzte Brüche
        const rest = v - qNum(c) * k.v;
        const rr = bruch(rest, 12);
        if (!rr || Math.abs(rest - rr.z / rr.n) > 1e-9 * (1 + Math.abs(v))) continue;
        const t = konstTerm(c, k), r0 = q(rr.z, rr.n);
        if (qNull(r0)) return t;
        if (c.z > 0) return `${t} ${r0.z < 0 ? "−" : "+"} ${qTex(qAbs(r0))}`;
        return r0.z > 0 ? `${qTex(r0)} − ${konstTerm(qAbs(c), k)}` : `${t} − ${qTex(qAbs(r0))}`;
      }
    }
  }
  return null;
}
/* Rundungsreste (cos(π/2) = 6e−17) auf den Bruch setzen */
const glatt = (v) => { const b = bruch(v, 120); return b ? b.z / b.n : v; };
/* Wert als TeX: exakt, sonst „≈ 1,23“ */
const wertTex = (v) => exaktTex(v) || `≈ ${naeherung(v, 3)}`;

/* ---------- Polynom einsetzen: „F(2) = ⅓ · 2³ − 4 · 2 = 8/3 − 8 = −16/3“ ---------- */

const basis = (x0) => (x0.z < 0 || x0.n !== 1 ? `(${qTex(x0)})` : qTex(x0));
function gliedTex(a, i, x0) {
  if (i === 0) return qTex(a);
  const pot = i === 1 ? basis(x0) : `${basis(x0)}^{${i}}`;
  return qGleich(a, q(1)) ? pot : `${qTex(a)} \\cdot ${pot}`;
}
const verbinde = (teile) => teile.map(({ neg, t }, i) => (i === 0 ? `${neg ? "−" : ""}${t}` : ` ${neg ? "−" : "+"} ${t}`)).join("");
/* Stücke rechts vom Gleichheitszeichen: [„= Einsetzen“, „= Werte“, „= Summe“] */
export function polyEinsetzen(p, x0) {
  const glieder = [];
  for (let i = p.length - 1; i >= 0; i--) if (!qNull(p[i])) glieder.push({ c: p[i], i });
  const wert = pAus(p, x0);
  if (qNull(x0) || !glieder.length) return { stuecke: [`= ${qTex(wert)}`], wert };
  const einsetzenT = verbinde(glieder.map(({ c, i }) => ({ neg: c.z < 0, t: gliedTex(qAbs(c), i, x0) })));
  const werte = glieder.map(({ c, i }) => qMul(c, pAus([...Array(i).fill(q(0)), q(1)], x0)));
  const werteT = verbinde(werte.filter((w) => !qNull(w)).map((w) => ({ neg: w.z < 0, t: qTex(qAbs(w)) })));
  const st = [`= ${einsetzenT}`];
  if (werte.filter((w) => !qNull(w)).length > 1 && werteT !== einsetzenT) st.push(`= ${werteT}`);
  if (qTex(wert) !== st[st.length - 1].slice(2)) st.push(`= ${qTex(wert)}`);
  return { stuecke: st, wert };
}

/* ---------- Nullstellen eines Polynoms mit bekannten rationalen Nullstellen ---------- */

const teilerTex = (c) => {
  // „| : k“ – bei Stammbrüchen „| · n“
  if (c.z === 1 || c.z === -1) { const n = q(c.n * c.z); return `| \\cdot ${n.z < 0 ? `(${qTex(n)})` : qTex(n)}`; }
  return `| : ${c.z < 0 ? `(${qTex(c)})` : qTex(c)}`;
};
const loesListe = (v, werte) => werte.map((w, i) => `${v}_{${i + 1}} = ${qTex(w)}`).join("; \\; ");
const sortQ = (l) => [...l].sort((x, y) => qNum(x) - qNum(y));

/* quadratisch: Zeilen und Lösungen (oder-Form, wenn eingebettet) */
function quadWeg(p, v, eingebettet) {
  const [c0, c1, c2] = [p[0] || q(0), p[1] || q(0), p[2] || q(0)];
  const zeilen = [];
  const schluss = (werte) => (eingebettet
    ? `${v} = ${werte.map(qTex).join(` \\;\\text{ oder }\\; ${v} = `)}`
    : loesListe(v, werte));
  if (qNull(c0)) {
    const r = qNeg(qDiv(c1, c2));
    zeilen.push({ k: [`${v} \\cdot (${pTex([c1, c2], v)}) = 0`], notiz: `${v} ausklammern` });
    zeilen.push({ k: [`${v} = 0 \\;\\text{ oder }\\; ${pTex([c1, c2], v)} = 0`], notiz: "Satz vom Nullprodukt" });
    const w = sortQ([q(0), r]);
    zeilen.push({ k: [schluss(w)] });
    return { zeilen, loesungen: w };
  }
  let P = c1, Q = c0, teiler = null;
  if (!qGleich(c2, q(1))) {
    if (eingebettet) zeilen.push({ k: [`${pTex([c0, c1, c2], v)} = 0 \\;\\; ${teilerTex(c2)}`] });
    else teiler = teilerTex(c2);
    P = qDiv(c1, c2); Q = qDiv(c0, c2);
    zeilen.push({ k: [`${pTex([Q, P, q(1)], v)} = 0`], notiz: "Normalform" });
  }
  if (qNull(P)) {
    const w = qWurzel(qNeg(Q));
    zeilen.push({ k: [`${v}^{2} = ${qTex(qNeg(Q))}`, `\\;\\Rightarrow\\; ${v} = ±${qTex(w)}`] });
    const l = sortQ([qNeg(w), w]);
    zeilen.push({ k: [schluss(l)] });
    return { zeilen, loesungen: l, teiler };
  }
  const m = qDiv(P, q(-2)), m2 = qMul(m, m), D = qSub(m2, Q), w = qWurzel(D);
  zeilen.push({
    k: [`${v}_{1,2} = ${qTex(m)} ± \\sqrt{${qTex(m2)} ${Q.z < 0 ? "+" : "−"} ${qTex(qAbs(Q))}}`, `= ${qTex(m)} ± \\sqrt{${qTex(D)}}`, `= ${qTex(m)} ± ${qTex(w)}`],
    notiz: "pq-Formel",
  });
  const l = sortQ([qSub(m, w), qAdd(m, w)]);
  zeilen.push({ k: [schluss(l)] });
  return { zeilen, loesungen: l, teiler };
}

/* Polynomdivision durch (x − r): Horner, ohne Rest */
function teile(p, r) {
  const t = pTrim(p), n = t.length - 1, erg = new Array(n).fill(q(0));
  let s = q(0);
  for (let i = n; i >= 1; i--) { s = qAdd(qMul(s, r), t[i]); erg[i - 1] = s; }
  return erg;
}
const linTex = (r, v = "x") => (qNull(r) ? v : `${v} ${r.z < 0 ? "+" : "−"} ${qTex(qAbs(r))}`);

/* Nullstellenweg für Grad 2, 3 (mit 0 oder geraten) und biquadratisch; name: f oder d */
export function nullstellenWeg(p0, name = "f") {
  const p = pTrim(p0), grad = p.length - 1;
  const kopf = { k: [`${name}(x) = 0`, `\\;\\Leftrightarrow\\; ${pTex(p)} = 0`] };
  const anhaengen = (zeile, teiler) => (teiler ? { ...zeile, k: [...zeile.k.slice(0, -1), `${zeile.k[zeile.k.length - 1]} \\;\\; ${teiler}`] } : zeile);
  if (grad === 2) {
    const { zeilen, loesungen, teiler } = quadWeg(p, "x", false);
    return { zeilen: [anhaengen(kopf, teiler), ...zeilen], loesungen };
  }
  if (grad === 4 && qNull(p[1]) && qNull(p[3])) {
    const z = [p[0], p[2], p[4]];
    const inner = quadWeg(z, "z", false);
    const zeilen = [kopf, anhaengen({ k: [`\\text{Substitution } z = x^{2}:`, `\\; ${pTex(z, "z")} = 0`], notiz: "biquadratisch: nur x⁴, x² und eine Zahl" }, inner.teiler)];
    zeilen.push(...inner.zeilen);
    const l = [];
    for (const zw of inner.loesungen) {
      if (zw.z < 0) { zeilen.push({ k: [`x^{2} = ${qTex(zw)}`, "\\;\\Rightarrow\\; \\text{keine Lösung}"] }); continue; }
      if (qNull(zw)) { zeilen.push({ k: ["x^{2} = 0", "\\;\\Rightarrow\\; x = 0"] }); l.push(q(0)); continue; }
      const w = qWurzel(zw);
      zeilen.push({ k: [`x^{2} = ${qTex(zw)}`, `\\;\\Rightarrow\\; x = ±${qTex(w)}`], notiz: "Rücksubstitution" });
      l.push(qNeg(w), w);
    }
    const s = sortQ(l);
    zeilen.push({ k: [loesListe("x", s)] });
    return { zeilen, loesungen: s };
  }
  if (grad === 3) {
    if (qNull(p[0])) {
      const quad = [p[1], p[2], p[3]];
      const zeilen = [kopf,
        { k: [`x \\cdot (${pTex(quad)}) = 0`], notiz: "x ausklammern" },
        { k: [`x = 0 \\;\\text{ oder }\\; ${pTex(quad)} = 0`], notiz: "Satz vom Nullprodukt" }];
      const inner = quadWeg(quad, "x", true);
      zeilen.push(...inner.zeilen);
      const s = sortQ([q(0), ...inner.loesungen]);
      zeilen.push({ k: [loesListe("x", s)] });
      return { zeilen, loesungen: s };
    }
    // Ganzzahlige Nullstelle raten (kleinster Betrag), dann Polynomdivision
    let r = null;
    for (const k of [1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 6, -6]) if (qNull(pAus(p, q(k)))) { r = q(k); break; }
    if (r) {
      const quad = teile(p, r);
      const zeilen = [kopf,
        { k: [`${name}(${qTex(r)})`, ...polyEinsetzen(p, r).stuecke], notiz: "Nullstelle raten (Teiler der Zahl ohne x)" },
        { k: [`(${pTex(p)}) : (${linTex(r)}) = ${pTex(quad)}`], notiz: "Polynomdivision" },
        ...(qGleich(quad[2], q(1)) ? [{ k: [`${pTex(quad)} = 0`] }] : [])];
      const inner = quadWeg(quad, "x", true);
      zeilen.push(...inner.zeilen);
      const s = sortQ([r, ...inner.loesungen]);
      zeilen.push({ k: [loesListe("x", s)] });
      return { zeilen, loesungen: s };
    }
  }
  return { zeilen: [kopf], loesungen: [] };
}

/* ---------- Prüfen von Eingaben ---------- */

/* Zahl-Eingabe lesen: 7/3, −2, 2,5, π/2, e − 1, ln(2) */
export function zahlLesen(text) {
  let t = String(text ?? "").trim();
  if (!t) return null;
  t = t.replace(/[−–]/g, "-").replace(/(\d),(\d)/g, "$1.$2").replace(/π/g, "pi").replace(/·/g, "*");
  const g = grenzeLesen(t);
  return g ? g.v : null;
}
const nah = (a, b, tol = 1e-6) => endlich(a) && endlich(b) && Math.abs(a - b) <= tol * (1 + Math.abs(b));
/* gerundete Eingabe (2 Nachkommastellen genügen) */
const gerundetNah = (a, b) => endlich(a) && endlich(b) && Math.abs(a - b) <= 0.0051 + 1e-9;

/* Prüft eine Zahl; fallen: [{ wert, hinweis }] für typische Fehler (nur wenn wirklich falsch) */
function zahlPruefer(soll, sollTex, fallen = []) {
  return (text) => {
    const v = zahlLesen(text);
    if (v === null) return { ok: false, unvollstaendig: true, hinweis: "Gib eine Zahl ein – Brüche wie 7/3, Dezimalzahlen wie 2,5, auch π, e oder ln(2) sind erlaubt." };
    if (nah(v, soll)) return { ok: true, hinweis: "" };
    if (!exaktIstGanz(soll) && gerundetNah(v, soll)) return { ok: true, hinweis: `Richtig (gerundet). Exakt: $${sollTex}$` };
    for (const f of fallen) if (endlich(f.wert) && (nah(v, f.wert) || gerundetNah(v, f.wert)) && !nah(f.wert, soll)) return { ok: false, art: f.art, hinweis: f.hinweis };
    return { ok: false, art: "sonst", hinweis: "Noch nicht richtig. Rechne den Schritt in Ruhe noch einmal nach – oder lass dir die Lösung zeigen." };
  };
}
const exaktIstGanz = (v) => Math.abs(v - Math.round(v)) < 1e-9;

/* Mehrere Zahlen (Nullstellen, Schnittstellen) in beliebiger Reihenfolge */
function zahlenPruefer(soll, fn, name) {
  return (texte) => {
    const werte = texte.map(zahlLesen);
    if (werte.some((w) => w === null)) return { ok: false, unvollstaendig: true, hinweis: `Fülle alle ${soll.length} Felder aus – jede Stelle einmal.` };
    const s = [...soll].sort((a, b) => a - b), w = [...werte].sort((a, b) => a - b);
    if (s.every((x, i) => nah(w[i], x))) return { ok: true, hinweis: "" };
    const falsch = werte.find((x) => !soll.some((y) => nah(x, y)));
    if (falsch !== undefined && fn) {
      const y = fn(falsch);
      return { ok: false, art: "keine", hinweis: `$x = ${naeherung(falsch, 3)}$ ist keine Lösung: $${name}(${naeherung(falsch, 3)}) ${endlich(y) && Math.abs(y) < 1e4 ? `= ${naeherung(y, 3)}` : ""} \\neq 0$.` };
    }
    return { ok: false, art: "doppelt", hinweis: "Eine Stelle steht doppelt – es gibt verschiedene Lösungen." };
  };
}

/* Differenzfunktion: f − g (oder g − f) als Term */
function differenzPruefer(dn, dBaum) {
  return (text) => {
    const b = lies(text);
    if (!b) return { ok: false, unvollstaendig: true, hinweis: "Der Term ist noch nicht vollständig – fülle alle Platzhalter ▯ und schließe die Klammern." };
    const e = auswerter(b);
    const stellen = [-2.31, -0.77, 0.43, 1.19, 2.63];
    if (stellen.every((x) => nah(e(x), dn(x), 1e-7))) {
      const glied = (polyKoef(b) || []).filter((c) => Math.abs(c) > 1e-12).length;
      const soll = (polyKoef(dBaum) || []).filter((c) => Math.abs(c) > 1e-12).length;
      return glied > soll
        ? { ok: true, hinweis: "Richtig – fasse beim nächsten Mal gleich zusammen: gleiche Potenzen von x zu einem Glied." }
        : { ok: true, hinweis: "" };
    }
    if (stellen.every((x) => nah(e(x), -dn(x), 1e-7))) return { ok: true, hinweis: "Auch richtig: Das ist g − f. Wir rechnen mit d = f − g weiter – am Flächeninhalt ändert das nichts." };
    return { ok: false, art: "klammer", hinweis: "Noch nicht richtig. Achte auf die Klammer: Beim Abziehen von g dreht sich jedes Vorzeichen in g um." };
  };
}

/* ---------- Bausteine der Rechenwege ---------- */

const z = (k, notiz) => ({ k: Array.isArray(k) ? k : [k], ...(notiz ? { notiz } : {}) });
const intTex = (a, b, inner) => `\\int_{${a}}^{${b}} ${inner}\\,dx`;
/* Klammer um den Integranden nur, wenn auf oberster Ebene ein + oder − steht: x² + 1 → (x² + 1), aber (2x − 1)³ bleibt. */
const klammerInner = (t) => {
  if (/^−/.test(t)) return `(${t})`;
  let tiefe = 0;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (c === "(" || c === "{") tiefe++;
    else if (c === ")" || c === "}") tiefe--;
    else if (tiefe === 0 && (c === "+" || c === "−") && t[i - 1] === " " && t[i + 1] === " ") return `(${t})`;
  }
  return t;
};

/* Teilintegral über ein Polynom P = Stammfunktion: ∫ₓᵧ name(x) dx = [P]ₓʸ = P(y) − P(x) = … */
function teilZeilen(name, NAME, Ptex, P, x, y) {
  const Py = pAus(P, y), Px = pAus(P, x), I = qSub(Py, Px);
  return {
    I, Py, Px,
    zeilen: [
      z([intTex(xTex(x), xTex(y), `${name}(x)`), `= \\left[${Ptex}\\right]_{${xTex(x)}}^{${xTex(y)}}`]),
      z([`${NAME}(${xTex(y)})`, ...polyEinsetzen(P, y).stuecke]),
      z([`${NAME}(${xTex(x)})`, ...polyEinsetzen(P, x).stuecke]),
      z([`I`, `= ${NAME}(${xTex(y)}) − ${NAME}(${xTex(x)})`,
        ...(qNull(Px) ? [] : [qNull(Py) ? `= −${/^−/.test(qTex(Px)) ? `(${qTex(Px)})` : qTex(Px)}` : `= ${qTex(Py)} − ${abzug(qTex(Px))}`]), `= ${qTex(I)}`]),
    ],
  };
}

/* Ergebniszeile A = |I₁| + |I₂| … */
/* „≈ 3,08“ – oder „= 4,5“, wenn die Dezimalzahl exakt ist */
const dezimalStueck = (A) => {
  const v = qNum(A);
  return Math.abs(v * 100 - Math.round(v * 100)) < 1e-9 ? `= ${naeherung(v)}` : `≈ ${naeherung(v)}`;
};

function flaechenZeile(Is, zwei = false) {
  const A = Is.reduce((s, I) => qAdd(s, qAbs(I)), q(0));
  const namen = Is.map((_, i) => `|I_{${i + 1}}|`).join(" + ");
  const betraege = Is.map((I) => `|${qTex(I)}|`).join(" + ");
  const werte = Is.map((I) => qTex(qAbs(I))).join(" + ");
  const st = [`A = ${namen}`, `= ${betraege}`];
  if (Is.length > 1) st.push(`= ${werte}`);
  st.push(`= ${qTex(A)}`);
  if (A.n !== 1) st.push(dezimalStueck(A));
  const notiz = zwei
    ? (Is.length > 1 ? "Wo g über f liegt, ist d negativ – deshalb die Beträge der Teilintegrale."
      : Is[0].z < 0 ? "Hier liegt g über f: Das Integral über d ist negativ, der Flächeninhalt ist sein Betrag."
        : "Hier liegt f über g: Integral und Flächeninhalt stimmen überein.")
    : Is.length > 1 ? "Teilflächen unter der x-Achse zählen positiv – deshalb die Beträge."
      : Is[0].z < 0 ? "Die Fläche liegt unter der x-Achse: Das Integral ist negativ, der Flächeninhalt ist sein Betrag."
        : "Die Fläche liegt über der x-Achse: Integral und Flächeninhalt stimmen überein.";
  return { A, zeile: z(st, notiz) };
}

/* Klartext-Fallen für Teilintegrale und Fläche */
const fallenTeil = (I) => [
  { wert: -qNum(I), art: "grenzen", hinweis: qNum(I) < 0
    ? "Das ist der Betrag. Das Integral selbst ist hier negativ, weil die Fläche unter der Achse liegt – den Betrag nimmst du erst beim Flächeninhalt A."
    : "Vorzeichen gedreht – hast du die Grenzen vertauscht? Es heißt F(obere Grenze) − F(untere Grenze)." },
];

/* ---------- Typ 1: Stammfunktion bilden ---------- */

const REGEL_KURZ = (t) => `${t.regel}${t.linear ? ` Innere Funktion ${t.linear.m === 1 ? "" : t.linear.m}x${t.linear.c ? (t.linear.c < 0 ? " − " : " + ") + Math.abs(t.linear.c) : ""}: durch ${t.linear.m} teilen.` : ""}`;

function fensterFuer(fn, wunsch = [-4, 4]) {
  const links = [-3.3, -2.1, -1.2, -0.4].every((x) => !endlich(fn(x)));
  return links ? [-0.6, 5] : wunsch;
}

export function baueStamm(fText, stufe = 1, eigen = false) {
  const f = lies(fText);
  const st = f ? stammfunktion(f) : null;
  if (!st || !st.teile.length) return { fehler: "Für diese Funktion kennt der Trainer keine Stammfunktionsregel (Schulstoff: Potenzen, sin, cos, eˣ, 1/x, lineare Verkettung)." };
  const fTex = T(f), FTex = T(st.F), fn = auswerter(f), Fn = auswerter(st.F);
  const regeln = [...new Set(st.teile.map((t) => t.regel))];
  const schritte = [
    {
      id: "F", titel: "Stammfunktion bilden", frage: "Finde F mit $F′(x) = f(x)$. Das + C ergänzt der Trainer.", label: "F(x) =", art: "term", plusC: true,
      platzhalter: "z. B. x^3 oder -cos(2x)",
      zeilen: [
        ...st.teile.map((t) => z([T(t.f), "\\;\\to\\;", T(t.F)], REGEL_KURZ(t))),
        z(["F(x)", `= ${FTex} + C`]),
      ],
      antwortTex: `${FTex} + C`, fokus: "F",
      pruefen: (e) => pruefeStamm(e, f),
    },
    {
      id: "probe", titel: "Probe", frage: "Leite F ab – es muss wieder f herauskommen.", art: "info",
      zeilen: [z(["F′(x)", `= ${fTex}`, "= f(x) \\;✓"], "Jede Stammfunktion hat an jeder Stelle x die Steigung f(x).")],
      fokus: "tangente",
    },
  ];
  return {
    typ: "stamm", stufe, eigen,
    kopf: { kicker: "Stammfunktion", satz: "Bestimme alle Stammfunktionen von f.", formel: `\\int ${klammerInner(fTex)}\\,dx`, funktionen: [{ name: "f", tex: fTex }] },
    f: { text: fText, tex: fTex }, F: { tex: FTex },
    schritte, regeln,
    ergebnis: { tex: `F(x) = ${FTex} + C` },
    bild: { art: "stamm", fn, Fn, fenster: fensterFuer(fn), fName: "f", FName: "F" },
  };
}

/* Potenz einer linearen Klammer, z. B. 3(2x − 1)², (x + 4)³ – bleibt verkettet stehen */
function kettenPotenz() {
  const m = wahl([1, 2, 2, 3]), n = wahl([2, 2, 3, 3, 4]);
  let c = ohne0(-4, 4);
  while (m > 1 && c % m === 0) c = ohne0(-4, 4);                       // nicht 2x + 4 = 2(x + 2)
  const k = wahl([1, 1, m * (n + 1), 2]);
  const innen = `${m === 1 ? "" : m}x${c < 0 ? "-" : "+"}${Math.abs(c)}`;
  return `${k === 1 ? "" : k}(${innen})^${n}`;
}

function stammAufgabe(stufe) {
  for (let i = 0; i < 30; i++) {
    let text;
    if (stufe === 1) {
      const grad = wahl([1, 2, 2, 3]);
      const p = [q(zz(-5, 5))];
      for (let k = 1; k <= grad; k++) p.push(q((k + 1) * zz(-3, 3)));
      p[grad] = q((grad + 1) * ohne0(1, 3) * wahl([1, 1, -1]));
      text = pEingabe(p);
    } else if (stufe === 2) text = neueStammAufgabe("potenz", 3).text;
    else if (stufe === 3) text = neueStammAufgabe("speziell", wahl([1, 2, 3])).text;
    else if (Math.random() < 0.35) text = kettenPotenz();
    else text = neueStammAufgabe(wahl(["linear", "linear", "gemischt"]), wahl([1, 2, 3])).text;
    const a = baueStamm(text, stufe);
    if (!a.fehler) return a;
  }
  return baueStamm("3x^2", stufe);
}

/* ---------- Typ 2: Stammfunktion durch einen Punkt ---------- */

function anfangPoly(f, F0, x0, y0, stufe) {
  const fTex = pTex(f), F0Tex = pTex(F0);
  const W = polyEinsetzen(F0, x0), w = W.wert, C = qSub(y0, w);
  const Fq = pAdd(F0, [C]);
  const cZeilen = [z(`F(${xTex(x0)}) = ${qTex(y0)}`, "P liegt auf dem Graphen von F.")];
  if (qNull(x0)) cZeilen.push(z(`C = ${qTex(y0)}`, "Bei x = 0 fallen alle x-Glieder weg."));
  else cZeilen.push(cAufloesen(W.stuecke[0].slice(2), qTex(w), qTex(y0), qTex(C), qNull(w)));
  return baueAnfang({
    fTex, fText: pEingabe(f), F0Tex, FTex: pTex(Fq), x0Tex: xTex(x0), y0Tex: qTex(y0), C: qNum(C), CTex: qTex(C),
    fBaum: lies(pEingabe(f)), fn: (x) => pNum(f, x), F0n: (x) => pNum(F0, x), x0: qNum(x0), y0: qNum(y0), cZeilen, stufe, w: qNum(w), F0Text: pEingabe(F0),
  });
}

/* „subst + C = y₀ ⇔ wert + C = y₀ ⇔ C = y₀ − wert = C“ als eine Zeile */
function cAufloesen(subst, wert, y0, C, wertNull) {
  const k = [`${subst} + C = ${y0}`];
  if (wert !== subst && !wertNull) k.push(`\\;\\Leftrightarrow\\; ${summand(wert)} + C = ${y0}`);
  k.push(wertNull ? `\\;\\Leftrightarrow\\; C = ${y0}` : `\\;\\Leftrightarrow\\; C = ${y0} − ${abzug(wert)}`);
  if (!wertNull) k.push(`= ${C}`);
  return z(k, "Nach C auflösen.");
}

function baueAnfang(d) {
  const schritte = [
    {
      id: "F", titel: "Alle Stammfunktionen", frage: "Bilde eine Stammfunktion $F_{0}$ von f. Alle Stammfunktionen sind dann $F(x) = F_{0}(x) + C$.", label: "F(x) =", art: "term", plusC: true,
      platzhalter: "z. B. x^3 + 2x",
      zeilen: [z(["F(x)", `= ${d.F0Tex} + C`], "Potenzregel rückwärts – das C ist noch frei.")],
      antwortTex: `${d.F0Tex} + C`, sollText: d.F0Text, fokus: "schar",
      pruefen: (e) => pruefeStamm(e, d.fBaum),
    },
    {
      id: "C", titel: "C bestimmen", frage: `Der Graph von F soll durch $P(${d.x0Tex} | ${d.y0Tex})$ gehen. Setze ein und löse nach C auf.`, label: "C =", art: "zahl",
      zeilen: d.cZeilen, antwortTex: d.CTex, soll: d.C, fokus: "punkt",
      pruefen: zahlPruefer(d.C, d.CTex, [
        { wert: d.y0 + d.w, art: "vorzeichen", hinweis: "Vorzeichen: Aus F₀(x₀) + C = y₀ folgt C = y₀ − F₀(x₀)." },
        { wert: d.y0, art: "vergessen", hinweis: `Fast: $F_{0}(${d.x0Tex})$ ist nicht 0 – setze $x_{0}$ in $F_{0}$ ein und ziehe den Wert von $y_{0}$ ab.` },
      ]),
    },
    {
      id: "erg", titel: "Die gesuchte Stammfunktion", frage: "Setze C in $F(x) = F_{0}(x) + C$ ein.", art: "info",
      zeilen: [z(["F(x)", `= ${d.FTex}`], "Von allen Stammfunktionen geht genau diese durch den Punkt P.")],
      fokus: "kurve",
    },
  ];
  return {
    typ: "anfang", stufe: d.stufe,
    kopf: { kicker: "Stammfunktion durch einen Punkt", satz: `Bestimme die Stammfunktion F von f, deren Graph durch $P(${d.x0Tex} | ${d.y0Tex})$ geht.`, formel: `f(x) = ${d.fTex}`, punkt: `P(${d.x0Tex} | ${d.y0Tex})`, funktionen: [{ name: "f", tex: d.fTex }] },
    f: { text: d.fText, tex: d.fTex }, F: { tex: d.FTex },
    schritte, regeln: ["Stammfunktion"],
    ergebnis: { tex: `F(x) = ${d.FTex}` },
    bild: { art: "anfang", fn: d.fn, Fn: d.F0n, x0: d.x0, y0: d.y0, C: d.C, fenster: fensterFuer(d.fn, [Math.min(-4, d.x0 - 1.5), Math.max(4, d.x0 + 1.5)]), fName: "f", FName: "F" },
  };
}

const ANFANG_TRANS = [
  () => { const k = wahl([1, 2, 3]); return { f: k === 1 ? "sin(x)" : `${k}sin(x)`, x0: wahl(["0", "pi"]) }; },
  () => { const k = wahl([1, 2, 3]); return { f: k === 1 ? "cos(x)" : `${k}cos(x)`, x0: wahl(["pi/2", "pi"]) }; },
  () => { const k = wahl([1, 2, 3]); return { f: k === 1 ? "e^x" : `${k}e^x`, x0: "0" }; },
  () => { const k = wahl([1, 2, 4]), m = wahl([1, 2, 3]); return { f: `${k === 1 ? "" : k}e^x+${m}`, x0: "0" }; },
  () => { const k = wahl([1, 2, 3]); return { f: k === 1 ? "1/x" : `${k}/x`, x0: wahl(["1", "e"]) }; },
  () => ({ f: wahl(["e^(2x)", "2e^(2x)", "4e^(2x)"]), x0: "0" }),
  () => ({ f: wahl(["2x+cos(x)", "x-sin(x)", "4x+2cos(x)"]), x0: "0" }),
];

function anfangTrans(fText, x0Text, y0, stufe) {
  const f = lies(fText), st = f && stammfunktion(f), x0 = grenzeLesen(x0Text);
  if (!st || !x0) return null;
  const F0 = st.F, w0 = auswerter(F0)(x0.v), wE = exaktTex(w0);
  if (!wE) return null;
  const wq = bruch(w0, 120), w = wq ? wq.z / wq.n : w0;                 // Rundungsrest von sin(π) & Co. weg
  const C = y0 - w, CTex = exaktTex(C);
  if (!CTex) return null;
  const x0Tex = exaktTex(x0.v) || T(x0.baum);
  const subst = T(einsetzen(F0, x0.baum));
  const y0T = qTex(q(y0));
  const cZeilen = [z(`F(${x0Tex}) = ${y0T}`, "P liegt auf dem Graphen von F."), cAufloesen(subst, wE, y0T, CTex, Math.abs(w) < 1e-12)];
  const F0Tex = T(F0);
  const FTex = Math.abs(C) < 1e-12 ? F0Tex : `${F0Tex} ${CTex.startsWith("−") ? "−" : "+"} ${CTex.replace(/^−/, "")}`;
  return baueAnfang({
    fTex: T(f), fText, F0Tex, FTex, x0Tex, y0Tex: y0T, C, CTex, fBaum: f, fn: auswerter(f), F0n: auswerter(F0), x0: x0.v, y0, cZeilen, stufe, w,
  });
}

function anfangAufgabe(stufe) {
  for (let i = 0; i < 60; i++) {
    if (stufe <= 2) {
      let f, F0;
      if (stufe === 1) {
        const grad = wahl([1, 2, 2]);
        F0 = [q(0), q(zz(-4, 4))];
        if (grad >= 1) F0.push(q(ohne0(-2, 2)));
        if (grad === 2 && Math.random() < 0.4) F0.push(q(wahl([1, -1])));
        F0 = pTrim(F0); f = pDer(F0);
      } else {
        const grad = wahl([2, 2, 3]);
        f = [q(zz(-4, 4))];
        for (let k = 1; k <= grad; k++) f.push(q(zz(-3, 3)));
        f[grad] = q(ohne0(-3, 3));
        f = pTrim(f); F0 = pInt(f);
      }
      const x0 = q(stufe === 1 ? wahl([1, 2, -1, 0]) : wahl([1, 2, 3, -1, -2]));
      const y0 = q(zz(-4, 6));
      const w = pAus(F0, x0);
      if (Math.abs(qNum(w)) > 30 || pTrim(f).length < 2 && qNull(f[0])) continue;
      return anfangPoly(f, F0, x0, y0, stufe);
    }
    const t = wahl(ANFANG_TRANS)();
    const a = anfangTrans(t.f, t.x0, zz(-3, 5), stufe);
    if (a) return a;
  }
  return anfangPoly([q(0), q(2)], [q(0), q(0), q(1)], q(1), q(3), stufe);
}

/* ---------- Typ 3: Bestimmtes Integral ---------- */

function bestimmtSchritte({ FTex, FText, FbSt, FaSt, Fb, Fa, FbTex, FaTex, I, ITex, aTex, bTex, inner, pruefeF, fb, fa, notizF, notizI }) {
  // F(a) = 0: kein „− 0“ (A5); F(b) = 0: „= −(F(a))“
  const differenz = Fa === 0 ? null : Fb === 0 ? `−${/^−/.test(FaTex) || /\s[+−]\s/.test(FaTex) ? `(${FaTex})` : FaTex}` : `${summand(FbTex)} − ${abzug(FaTex)}`;
  const IZeile = [`= F(${bTex}) − F(${aTex})`];
  if (differenz) IZeile.push(`= ${differenz}`);
  if (differenz !== ITex) IZeile.push(/^≈/.test(ITex) ? ITex : `= ${ITex}`);
  if (/[eπ]|\\ln/.test(ITex)) IZeile.push(`≈ ${naeherung(I)}`);
  return [
    {
      id: "F", titel: "Stammfunktion bilden", frage: "Bilde eine Stammfunktion F von f. Beim bestimmten Integral lässt man das + C weg.", label: "F(x) =", art: "term",
      platzhalter: "z. B. x^3 + x", zeilen: [z(["F(x)", `= ${FTex}`], notizF)], antwortTex: FTex, sollText: FText, fokus: "F", pruefen: pruefeF,
    },
    {
      id: "Fb", titel: "Obere Grenze einsetzen", frage: `Setze die obere Grenze $b = ${bTex}$ in F ein.`, label: `F(${bTex}) =`, art: "zahl",
      zeilen: [z([`F(${bTex})`, ...FbSt])], antwortTex: FbTex, soll: Fb, fokus: "Fb",
      pruefen: zahlPruefer(Fb, FbTex, [{ wert: fb, art: "f", hinweis: "Das ist f(b) – eingesetzt wird in die Stammfunktion F, nicht in f." }]),
    },
    {
      id: "Fa", titel: "Untere Grenze einsetzen", frage: `Setze die untere Grenze $a = ${aTex}$ in F ein.`, label: `F(${aTex}) =`, art: "zahl",
      zeilen: [z([`F(${aTex})`, ...FaSt])], antwortTex: FaTex, soll: Fa, fokus: "Fa",
      pruefen: zahlPruefer(Fa, FaTex, [{ wert: fa, art: "f", hinweis: "Das ist f(a) – eingesetzt wird in die Stammfunktion F, nicht in f." }]),
    },
    {
      id: "I", titel: "Hauptsatz einsetzen", frage: "Hauptsatz: $\\int_{a}^{b} f(x)\\,dx = F(b) − F(a)$.", label: `${intTex(aTex, bTex, inner)} =`, ueber: `F(${bTex}) − F(${aTex})`, art: "zahl",
      zeilen: [z([intTex(aTex, bTex, inner), `= \\left[${FTex}\\right]_{${aTex}}^{${bTex}}`]), z(IZeile, notizI)],
      antwortTex: ITex.replace(/^≈ /, ""), soll: I, fokus: "I",
      pruefen: zahlPruefer(I, ITex, [
        { wert: -I, art: "vorzeichen", hinweis: "Vorzeichen gedreht: Es heißt F(b) − F(a) – erst die obere Grenze, dann die untere abziehen." },
        { wert: Fb + Fa, art: "addiert", hinweis: "Du hast F(a) addiert statt abgezogen." },
        { wert: Fb, art: "ohneFa", hinweis: "Das ist nur F(b) – F(a) muss noch abgezogen werden." },
      ]),
    },
  ];
}

function vorzeichenwechsel(fn, a, b) {
  let s = 0, wechsel = false;
  for (let i = 1; i < 200; i++) {
    const y = fn(a + ((b - a) * i) / 200);
    if (!endlich(y) || Math.abs(y) < 1e-9) continue;
    const t = Math.sign(y);
    if (s && t !== s) wechsel = true;
    s = t;
  }
  return wechsel;
}

export function baueBestimmtPoly(f, a, b, stufe = 1, eigen = false) {
  const F = pInt(f), fTex = pTex(f), FTex = pTex(F), fn = (x) => pNum(f, x);
  const Wb = polyEinsetzen(F, b), Wa = polyEinsetzen(F, a);
  const Iq = qSub(Wb.wert, Wa.wert), I = qNum(Iq);
  const aTex = xTex(a), bTex = xTex(b);
  const fBaum = lies(pEingabe(f)), hs = hauptsatz(fBaum, grenzeLesen(pEingabe([a])), grenzeLesen(pEingabe([b])));
  const wechsel = vorzeichenwechsel(fn, qNum(a), qNum(b));
  const notizI = wechsel
    ? "f wechselt zwischen a und b das Vorzeichen: Das Integral ist eine Bilanz – Flächen unter der x-Achse zählen negativ."
    : I < 0 ? "Negativ, weil der Graph zwischen a und b unter der x-Achse liegt." : "Positiv: Der Graph liegt zwischen a und b über der x-Achse – das Integral ist hier der Flächeninhalt.";
  return {
    typ: "bestimmt", stufe, eigen,
    kopf: { kicker: "Bestimmtes Integral", satz: "Berechne das Integral mit dem Hauptsatz.", int: { a: aTex, b: bTex, inner: klammerInner(fTex) }, funktionen: [{ name: "f", tex: fTex }] },
    f: { text: pEingabe(f), tex: fTex }, F: { tex: FTex },
    schritte: bestimmtSchritte({
      FTex, FText: pEingabe(F), FbSt: Wb.stuecke, FaSt: Wa.stuecke, Fb: qNum(Wb.wert), Fa: qNum(Wa.wert), FbTex: qTex(Wb.wert), FaTex: qTex(Wa.wert), I, ITex: qTex(Iq),
      aTex, bTex, inner: klammerInner(fTex), fb: fn(qNum(b)), fa: fn(qNum(a)),
      pruefeF: (e) => (hs && !hs.fehler ? pruefeIntegralStamm(e, fBaum, hs, qNum(a), qNum(b)) : pruefeStamm(e, fBaum)),
      notizF: "Potenzregel rückwärts: Exponent um 1 erhöhen, durch den neuen Exponenten teilen.", notizI,
    }),
    regeln: ["Hauptsatz", "Potenzregel rückwärts"],
    ergebnis: { tex: qTex(Iq), wert: I, naeherung: Iq.n !== 1 ? naeherung(I) : null },
    bild: { art: "bestimmt", fn, Fn: (x) => pNum(F, x), a: qNum(a), b: qNum(b), I, ITex: qTex(Iq), fName: "f", FName: "F" },
  };
}

/* Bestimmtes Integral über die Formel-Engine (sin, cos, eˣ, 1/x …) */
export function baueBestimmtTerm(fText, aText, bText, stufe = 3, eigen = false) {
  const f = lies(fText), aG = grenzeLesen(aText), bG = grenzeLesen(bText);
  if (!f) return { fehler: "Der Term ist noch nicht vollständig." };
  if (!aG || !bG) return { fehler: "Die Grenzen a und b müssen Zahlen sein (auch π, e oder Brüche)." };
  if (Math.abs(aG.v - bG.v) < 1e-12) return { fehler: "a und b sind gleich – das Integral ist 0." };
  // Polynom mit rationalen Grenzen: exakt rechnen – außer bei Potenzen einer Klammer wie (2x − 1)³:
  // die bleiben verkettet (Kettenregel rückwärts), sonst wäre die Stufe „Verkettet“ ein ausmultipliziertes Polynom.
  const verkettet = /\)\s*\^/.test(fText);
  const pk = polyKoef(f), qa = qVonZahl(aG.v), qb = qVonZahl(bG.v);
  if (!verkettet && pk && qa && qb && pk.every((c) => qVonZahl(c))) {
    const fq = pTrim(pk.map((c) => qVonZahl(c)));
    if (fq.length > 1 || !qNull(fq[0])) return baueBestimmtPoly(fq, qa, qb, stufe, eigen);
  }
  const hs = hauptsatz(f, aG, bG);
  if (hs.fehler === "stamm") return { fehler: "Für diese Funktion kennt der Trainer keine Stammfunktionsregel (Schulstoff: Potenzen, sin, cos, eˣ, 1/x, lineare Verkettung)." };
  if (hs.fehler === "stetig") return { fehler: `f ist auf dem Intervall nicht überall definiert oder springt (bei x ≈ ${dezText(hs.stelle)}). Dort darf man den Hauptsatz nicht anwenden.` };
  const fTex = T(f), FTex = T(hs.F), fn = auswerter(f), Fn = auswerter(hs.F);
  const aTex = exaktTex(aG.v) || T(aG.baum), bTex = exaktTex(bG.v) || T(bG.baum);
  const FbE = wertTex(hs.Fb), FaE = wertTex(hs.Fa), IE = wertTex(hs.wert);
  const st = (sub, e) => (sub === e ? [`= ${e}`] : /^≈/.test(e) ? [`= ${sub}`, e] : [`= ${sub}`, `= ${e}`]);
  const wechsel = vorzeichenwechsel(fn, aG.v, bG.v);
  const notizI = wechsel ? "f wechselt zwischen a und b das Vorzeichen: Das Integral ist eine Bilanz." : hs.wert < 0 ? "Negativ, weil der Graph zwischen a und b unter der x-Achse liegt." : "";
  const regeln = [...new Set(hs.st.teile.map((t) => REGEL_KURZ(t)))];
  return {
    typ: "bestimmt", stufe, eigen,
    kopf: { kicker: "Bestimmtes Integral", satz: "Berechne das Integral mit dem Hauptsatz.", int: { a: aTex, b: bTex, inner: klammerInner(fTex) }, funktionen: [{ name: "f", tex: fTex }] },
    f: { text: fText, tex: fTex }, F: { tex: FTex },
    schritte: bestimmtSchritte({
      FTex, FbSt: st(substTex(hs.FbTex), FbE), FaSt: st(substTex(hs.FaTex), FaE), Fb: glatt(hs.Fb), Fa: glatt(hs.Fa), FbTex: FbE.replace(/^≈ /, ""), FaTex: FaE.replace(/^≈ /, ""), I: glatt(hs.wert), ITex: IE,
      aTex, bTex, inner: klammerInner(fTex), fb: fn(bG.v), fa: fn(aG.v),
      pruefeF: (e) => pruefeIntegralStamm(e, f, hs, aG.v, bG.v), notizF: regeln.join(" "), notizI,
    }),
    regeln: ["Hauptsatz", "Stammfunktion"],
    ergebnis: { tex: IE, wert: hs.wert, naeherung: /[eπ]|\\ln/.test(IE) ? naeherung(hs.wert) : null },
    bild: { art: "bestimmt", fn, Fn, a: aG.v, b: bG.v, I: hs.wert, ITex: IE, fName: "f", FName: "F" },
  };
}

/* Grenzen bewusst gemischt: nicht nur ab 0 oder ab einer Nullstelle von f,
   sondern oft Intervalle, an deren Rändern f ≠ 0 und F(a) ≠ 0 ist (z. B. ln 2 … ln 3, π/3 … 2π/3). */
const k1 = (k, t) => (k === 1 ? t : `${k}${t}`);
const B3 = [
  () => { const k = wahl([1, 2, 3]); return { f: k1(k, "sin(x)"), ...wahl([{ a: "pi/3", b: "2pi/3" }, { a: "pi/3", b: "3pi/2" }, { a: "pi/3", b: "pi" }, { a: "0", b: "pi" }]) }; },
  () => { const k = wahl([1, 2, 3]); return { f: k1(k, "cos(x)"), ...wahl([{ a: "-pi/6", b: "pi/6" }, { a: "pi/6", b: "pi" }, { a: "pi/6", b: "pi/2" }, { a: "0", b: "pi/2" }]) }; },
  () => { const k = wahl([1, 2, 3]); return { f: k1(k, "e^x"), ...wahl([{ a: "ln(2)", b: "ln(3)" }, { a: "ln(2)", b: "1" }, { a: "-1", b: "0" }, { a: "0", b: "ln(3)" }]) }; },
  () => { const k = wahl([1, 2, 3]); return { f: k === 1 ? "1/x" : `${k}/x`, ...wahl([{ a: "2", b: "4" }, { a: "2", b: "6" }, { a: "e", b: "e^2" }, { a: "1", b: wahl(["e", "3"]) }]) }; },
  () => ({ f: wahl(["1/x^2", "2/x^2", "x+1/x^2"]), ...wahl([{ a: "1", b: "2" }, { a: "2", b: "4" }]) }),
  () => ({ f: wahl(["sqrt(x)", "3sqrt(x)"]), ...wahl([{ a: "1", b: "4" }, { a: "4", b: "9" }, { a: "1", b: "9" }, { a: "0", b: "4" }]) }),
  () => wahl([
    { f: "e^x+2x", a: "-1", b: "0" }, { f: "e^x-x", a: "-1", b: "0" }, { f: "1/x+2x", a: "1", b: "e" },
    { f: "sin(x)+1", a: "pi/3", b: "2pi/3" }, { f: "cos(x)+1", a: "pi/6", b: "pi/2" }, { f: "2x-1/x", a: "2", b: "4" },
  ]),
];
const B4 = [
  () => ({ f: wahl(["e^(2x)", "2e^(2x)"]), ...wahl([{ a: "ln(2)", b: "ln(3)" }, { a: "-1/2", b: "0" }, { a: "0", b: "ln(2)" }]) }),
  () => ({ f: wahl(["e^(-x)", "2e^(-x)"]), ...wahl([{ a: "-ln(2)", b: "ln(2)" }, { a: "-1", b: "0" }, { a: "0", b: "ln(2)" }]) }),
  () => ({ f: wahl(["sin(2x)", "2sin(2x)"]), ...wahl([{ a: "pi/6", b: "pi/3" }, { a: "pi/6", b: "pi/2" }, { a: "0", b: "pi/2" }]) }),
  () => ({ f: wahl(["cos(2x)", "2cos(2x)"]), ...wahl([{ a: "pi/12", b: "pi/4" }, { a: "-pi/12", b: "pi/12" }, { a: "0", b: "pi/4" }]) }),
  () => wahl([{ f: "(2x-1)^3", a: "1", b: "2" }, { f: "(2x-1)^2", a: "1", b: "2" }]),
  () => wahl([{ f: "(x+1)^2", a: "1", b: "2" }, { f: "3(x-1)^2", a: "-1", b: "2" }, { f: "(x+1)^3", a: "-2", b: "1" }]),
  () => ({ f: "sqrt(2x+1)", ...wahl([{ a: "4", b: "12" }, { a: "0", b: "4" }]) }),
  () => ({ f: wahl(["1/(2x+1)", "2/(2x+1)"]), ...wahl([{ a: "1", b: "4" }, { a: "1", b: "13" }, { a: "0", b: "1" }]) }),
  () => ({ f: "4/(2x+1)^2", ...wahl([{ a: "1", b: "2" }, { a: "0", b: "1" }]) }),
];

/* Ränder: Liegt a auf 0 oder ist f(a) bzw. f(b) gleich 0, wird meistens neu gewürfelt. */
const randLangweilig = (fn, a, b) => a === 0 || Math.abs(fn(a)) < 1e-12 || Math.abs(fn(b)) < 1e-12;

function bestimmtAufgabe(stufe) {
  for (let i = 0; i < 80; i++) {
    const streng = i < 60 && Math.random() < 0.85;
    if (stufe === 1) {
      // F mit ganzen Koeffizienten → f = F′, Grenzen meist 1 … 3
      const F = pTrim([q(0), q(zz(0, 4)), q(zz(0, 2)), q(wahl([0, 0, 1]))]);
      if (F.length < 3) continue;
      const f = pDer(F), a = wahl([0, 1, 1, 1, 2]), b = Math.min(3, a + zz(1, 2));
      if (b <= a || (streng && randLangweilig((x) => pNum(f, x), a, b))) continue;
      return baueBestimmtPoly(f, q(a), q(b), stufe);
    }
    if (stufe === 2) {
      const grad = wahl([2, 2, 3]);
      const f = [q(zz(-3, 3))];
      for (let k = 1; k <= grad; k++) f.push(q(zz(-3, 3)));
      f[grad] = q(ohne0(-2, 2));
      const a = zz(-2, 1), b = a + zz(1, 3);
      const fp = pTrim(f);
      if (streng && randLangweilig((x) => pNum(fp, x), a, b)) continue;
      const mx = Math.max(...[0, 0.25, 0.5, 0.75, 1].map((t) => Math.abs(pNum(fp, a + t * (b - a)))));
      if (mx > 16 || mx < 1) continue;
      return baueBestimmtPoly(fp, q(a), q(b), stufe);
    }
    const t = wahl(stufe === 3 ? B3 : B4)();
    const r = baueBestimmtTerm(t.f, t.a, t.b, stufe);
    if (r.fehler) continue;
    if (streng && randLangweilig(r.bild.fn, r.bild.a, r.bild.b)) continue;
    return r;
  }
  return baueBestimmtPoly([q(1), q(0), q(3)], q(1), q(2), stufe);
}

/* ---------- Typ 4: Fläche mit der x-Achse ---------- */

export function baueFlaeche(f, nst, grenzen, stufe = 1) {
  const F = pInt(f), fTex = pTex(f), FTex = pTex(F), fn = (x) => pNum(f, x);
  const weg = nullstellenWeg(f, "f");
  const [a, b] = grenzen || [nst[0], nst[nst.length - 1]];
  const intervalle = teilIntervalle(a, b, nst);
  const teileT = intervalle.map(([x, y]) => teilZeilen("f", "F", FTex, F, x, y));
  const Is = teileT.map((t) => t.I);
  const { A, zeile } = flaechenZeile(Is);
  const bilanz = Is.reduce((s, I) => qAdd(s, I), q(0));
  const innen = nst.filter((r) => qNum(r) > qNum(a) && qNum(r) < qNum(b));
  const schritte = [
    {
      id: "null", titel: "Nullstellen", frage: grenzen ? "Bestimme alle Nullstellen von f – sie teilen die Fläche in Teilflächen." : "Bestimme die Nullstellen von f: Dort beginnt und endet die Fläche.",
      label: "x", art: "zahlen", anzahl: nst.length, zeilen: weg.zeilen, antwortTex: loesListe("x", nst), sollWerte: nst.map(qNum), fokus: "null",
      pruefen: zahlenPruefer(nst.map(qNum), fn, "f"),
    },
    {
      id: "F", titel: "Stammfunktion", frage: "Bilde eine Stammfunktion F von f (ohne + C).", label: "F(x) =", art: "term", platzhalter: "z. B. 1/3x^3 - 4x",
      zeilen: [z(["F(x)", `= ${FTex}`])], antwortTex: FTex, sollText: pEingabe(F), fokus: "F",
      pruefen: (e) => pruefeStamm(e, lies(pEingabe(f))),
    },
    ...teileT.map((t, i) => {
      const [x, y] = intervalle[i];
      const frage = grenzen && i === 0 && innen.length
        ? `Zwischen $a = ${xTex(a)}$ und $b = ${xTex(b)}$ liegt ${innen.length === 1 ? `die Nullstelle $x = ${xTex(innen[0])}$` : "mehr als eine Nullstelle"}. Integriere stückweise – zuerst von $${xTex(x)}$ bis $${xTex(y)}$.`
        : `Berechne $${intTex(xTex(x), xTex(y), "f(x)")}$.`;
      return {
        id: `I${i + 1}`, titel: `Teilintegral I${["₁", "₂", "₃", "₄"][i]}`, frage,
        label: `I_${i + 1} =`, art: "zahl", zeilen: t.zeilen.map((zz2, j) => (j === 3 ? { ...zz2, k: [`I_{${i + 1}}`, ...zz2.k.slice(1)] } : zz2)),
        antwortTex: qTex(t.I), soll: qNum(t.I), fokus: `teil${i}`, pruefen: zahlPruefer(qNum(t.I), qTex(t.I), fallenTeil(t.I)),
      };
    }),
    {
      id: "A", titel: "Flächeninhalt", frage: Is.length > 1 ? "Addiere die Beträge der Teilintegrale." : "Der Flächeninhalt ist der Betrag des Integrals.", label: "A =", art: "zahl",
      zeilen: [zeile, ...(Is.length > 1 && !qGleich(qAbs(bilanz), A) ? [z([intTex(xTex(a), xTex(b), "f(x)"), `= ${qTex(bilanz)}`], "Zum Vergleich: Über das ganze Intervall integriert kommt nur die Bilanz heraus – nicht der Flächeninhalt.")] : [])],
      antwortTex: qTex(A), soll: qNum(A), fokus: "A",
      pruefen: zahlPruefer(qNum(A), qTex(A), [
        { wert: qNum(bilanz), art: "bilanz", hinweis: "Das ist die Bilanz. Für den Flächeninhalt zählen auch Teilflächen unter der x-Achse positiv: Beträge addieren." },
        { wert: Math.abs(qNum(bilanz)), art: "bilanz", hinweis: "Das ist der Betrag der Bilanz – du musst die Beträge der einzelnen Teilintegrale addieren." },
        { wert: -qNum(A), art: "negativ", hinweis: "Ein Flächeninhalt ist nie negativ." },
      ]),
    },
  ];
  const satz = grenzen
    ? `Berechne den Inhalt der Fläche zwischen dem Graphen von f, der x-Achse und den Geraden $x = ${xTex(a)}$ und $x = ${xTex(b)}$.`
    : "Der Graph von f schließt mit der x-Achse eine Fläche ein. Berechne ihren Inhalt.";
  return {
    typ: "flaeche", stufe,
    kopf: { kicker: "Fläche mit der x-Achse", satz, formel: `f(x) = ${fTex}`, funktionen: [{ name: "f", tex: fTex }] },
    f: { text: pEingabe(f), tex: fTex }, F: { tex: FTex },
    schritte, regeln: ["Hauptsatz", "Stammfunktion"],
    ergebnis: { tex: qTex(A), wert: qNum(A), naeherung: A.n !== 1 ? naeherung(qNum(A)) : null, einheit: "FE" },
    bild: {
      art: "flaeche", fn, a: qNum(a), b: qNum(b), grenzen: !!grenzen, nullstellen: nst.map(qNum),
      teile: intervalle.map(([x, y], i) => ({ von: qNum(x), bis: qNum(y), wert: qNum(Is[i]), tex: qTex(qAbs(Is[i])), name: `A${["₁", "₂", "₃", "₄"][i]}` })),
      fName: "f",
    },
  };
}

function flaecheAufgabe(stufe) {
  for (let i = 0; i < 200; i++) {
    let nst, k, grenzen = null;
    if (stufe === 1) {
      const r1 = zz(-3, 2), r2 = r1 + zz(2, 4);
      nst = [r1, r2]; k = wahl([q(1), q(-1), q(-1), q(1, 2), q(-1, 2), q(2), q(-2)]);
    } else if (stufe === 2) {
      nst = [0];
      while (nst.length < 3) { const r = zz(-3, 3); if (!nst.includes(r)) nst.push(r); }
      nst.sort((x, y) => x - y);
      if (nst[2] - nst[0] > 5) continue;
      k = wahl([q(1), q(-1), q(1, 2), q(-1, 2)]);
    } else if (Math.random() < 0.45) {
      const [u, v] = wahl([[1, 2], [1, 3], [1, 2]]);
      nst = [-v, -u, u, v];
      k = u === 1 && v === 2 ? wahl([q(1), q(-1), q(1, 2), q(-1, 2)]) : wahl([q(1, 4), q(-1, 4), q(1, 2), q(-1, 2)]);
    } else {
      const anz = wahl([2, 3]);
      nst = [];
      while (nst.length < anz) { const r = zz(-2, 3); if (!nst.includes(r)) nst.push(r); }
      nst.sort((x, y) => x - y);
      k = anz === 2 ? wahl([q(1), q(-1), q(1, 2)]) : wahl([q(1, 2), q(-1, 2), q(1), q(-1)]);
      const innen = wahl(nst);
      const a = innen - zz(1, 2), b = innen + zz(1, 2);
      if (nst.includes(a) || nst.includes(b)) continue;
      grenzen = [q(a), q(b)];
    }
    const nq = nst.map((r) => q(r));
    const f = pAusNullstellen(k, nq);
    const lo = grenzen ? qNum(grenzen[0]) : nst[0], hi = grenzen ? qNum(grenzen[1]) : nst[nst.length - 1];
    const mx = Math.max(...Array.from({ length: 41 }, (_, j) => Math.abs(pNum(f, lo + ((hi - lo) * j) / 40))));
    if (mx > 14 || mx < 0.8) continue;
    if (pTrim(f).some((c) => c.n > 4 || Math.abs(c.z) > 40)) continue;
    return baueFlaeche(f, nq, grenzen, stufe);
  }
  return baueFlaeche(pAusNullstellen(q(-1), [q(-2), q(2)]), [q(-2), q(2)], null, stufe);
}

/* ---------- Typ 5: Fläche zwischen zwei Graphen ---------- */

export function baueZwei(f, g, nst, stufe = 1) {
  const d = pSub(f, g), D = pInt(d);
  const fTex = pTex(f), gTex = pTex(g), dTex = pTex(d), DTex = pTex(D);
  const fn = (x) => pNum(f, x), gn = (x) => pNum(g, x), dn = (x) => pNum(d, x);
  const weg = nullstellenWeg(d, "d");
  const intervalle = teilIntervalle(nst[0], nst[nst.length - 1], nst);
  const teileT = intervalle.map(([x, y]) => teilZeilen("d", "D", DTex, D, x, y));
  const Is = teileT.map((t) => t.I);
  const { A, zeile } = flaechenZeile(Is, true);
  const bilanz = Is.reduce((s, I) => qAdd(s, I), q(0));
  const dBaum = lies(pEingabe(d));
  const schritte = [
    {
      id: "d", titel: "Differenzfunktion", frage: "Bilde $d(x) = f(x) − g(x)$ und fasse zusammen. Die Fläche zwischen f und g ist so groß wie die Fläche zwischen d und der x-Achse.",
      label: "d(x) =", art: "term", platzhalter: "z. B. -x^2 + x + 2",
      zeilen: [z(["d(x) = f(x) − g(x)", `= (${fTex}) − (${gTex})`, `= ${dTex}`], "Klammer um g: Jedes Vorzeichen von g dreht sich um.")],
      antwortTex: dTex, sollText: pEingabe(d), fokus: "d", pruefen: differenzPruefer(dn, dBaum),
    },
    {
      id: "null", titel: "Schnittstellen", frage: "Löse $d(x) = 0$ – dort schneiden sich die Graphen von f und g.", label: "x", art: "zahlen", anzahl: nst.length,
      zeilen: weg.zeilen, antwortTex: loesListe("x", nst), sollWerte: nst.map(qNum), fokus: "null", pruefen: zahlenPruefer(nst.map(qNum), dn, "d"),
    },
    {
      id: "D", titel: "Stammfunktion von d", frage: "Bilde eine Stammfunktion D von d (ohne + C).", label: "D(x) =", art: "term", platzhalter: "z. B. -1/3x^3 + 1/2x^2 + 2x",
      zeilen: [z(["D(x)", `= ${DTex}`])], antwortTex: DTex, sollText: pEingabe(D), fokus: "D", pruefen: (e) => pruefeStamm(e, dBaum),
    },
    ...teileT.map((t, i) => {
      const [x, y] = intervalle[i];
      return {
        id: `I${i + 1}`, titel: `Teilintegral I${["₁", "₂", "₃"][i]}`, frage: `Berechne $${intTex(xTex(x), xTex(y), "d(x)")}$.`,
        label: `I_${i + 1} =`, art: "zahl", zeilen: t.zeilen.map((zz2, j) => (j === 3 ? { ...zz2, k: [`I_{${i + 1}}`, ...zz2.k.slice(1)] } : zz2)),
        antwortTex: qTex(t.I), soll: qNum(t.I), fokus: `teil${i}`,
        pruefen: zahlPruefer(qNum(t.I), qTex(t.I), [{ wert: -qNum(t.I), art: "vorzeichen", hinweis: qNum(t.I) < 0 ? "Das ist der Betrag. Das Integral über d ist hier negativ, weil g über f liegt – den Betrag nimmst du erst bei A." : "Vorzeichen gedreht – D(obere Grenze) − D(untere Grenze)." }]),
      };
    }),
    {
      id: "A", titel: "Flächeninhalt", frage: Is.length > 1 ? "Addiere die Beträge der Teilintegrale." : "Der Flächeninhalt ist der Betrag des Integrals.", label: "A =", art: "zahl",
      zeilen: [zeile], antwortTex: qTex(A), soll: qNum(A), fokus: "A",
      pruefen: zahlPruefer(qNum(A), qTex(A), [
        { wert: qNum(bilanz), art: "bilanz", hinweis: "Das ist die Bilanz: Wo g über f liegt, ist d negativ. Für den Flächeninhalt die Beträge der Teilintegrale addieren." },
        { wert: Math.abs(qNum(bilanz)), art: "bilanz", hinweis: "Das ist der Betrag der Bilanz – addiere die Beträge der einzelnen Teilintegrale." },
        { wert: -qNum(A), art: "negativ", hinweis: "Ein Flächeninhalt ist nie negativ." },
      ]),
    },
  ];
  return {
    typ: "zwei", stufe,
    kopf: { kicker: "Fläche zwischen zwei Graphen", satz: "Die Graphen von f und g schließen eine Fläche ein. Berechne ihren Inhalt.", funktionen: [{ name: "f", tex: fTex }, { name: "g", tex: gTex }] },
    f: { text: pEingabe(f), tex: fTex }, g: { text: pEingabe(g), tex: gTex }, d: { text: pEingabe(d), tex: dTex }, F: { tex: DTex },
    schritte, regeln: ["Hauptsatz", "Stammfunktion"],
    ergebnis: { tex: qTex(A), wert: qNum(A), naeherung: A.n !== 1 ? naeherung(qNum(A)) : null, einheit: "FE" },
    bild: {
      art: "zwei", fn, gn, dn, a: qNum(nst[0]), b: qNum(nst[nst.length - 1]), nullstellen: nst.map(qNum),
      teile: intervalle.map(([x, y], i) => ({ von: qNum(x), bis: qNum(y), wert: qNum(Is[i]), tex: qTex(qAbs(Is[i])), name: `A${["₁", "₂", "₃"][i]}` })),
      fName: "f", gName: "g",
    },
  };
}

function zweiAufgabe(stufe) {
  for (let i = 0; i < 200; i++) {
    let nst, k;
    if (stufe <= 2) {
      const r1 = zz(-3, 2), r2 = r1 + zz(2, 4);
      nst = [r1, r2]; k = wahl([q(1), q(-1), q(1, 2), q(-1, 2)]);
    } else {
      nst = [];
      while (nst.length < 3) { const r = zz(-3, 3); if (!nst.includes(r)) nst.push(r); }
      nst.sort((x, y) => x - y);
      if (nst[2] - nst[0] > 5) continue;
      k = wahl([q(1, 2), q(-1, 2), q(1), q(-1)]);
    }
    const nq = nst.map((r) => q(r));
    const d = pAusNullstellen(k, nq);
    let g;
    if (stufe === 1 || (stufe === 3 && Math.random() < 0.5)) g = pTrim([q(zz(-2, 3)), q(zz(-2, 2))]);
    else g = pTrim([q(zz(-2, 3)), q(zz(-2, 2)), wahl([q(1), q(-1), q(1, 2), q(-1, 2)])]);
    const f = pAdd(d, g);
    if (stufe === 2 && (pTrim(f).length < 3 || pTrim(g).length < 3)) continue;
    if (pTrim(g).length === 1 && qNull(g[0]) && stufe !== 3) continue;
    const lo = nst[0] - 0.5, hi = nst[nst.length - 1] + 0.5;
    const werte = Array.from({ length: 41 }, (_, j) => lo + ((hi - lo) * j) / 40).flatMap((x) => [pNum(f, x), pNum(g, x)]);
    if (Math.max(...werte.map(Math.abs)) > 14) continue;
    if (Math.max(...Array.from({ length: 21 }, (_, j) => Math.abs(pNum(d, nst[0] + ((nst[nst.length - 1] - nst[0]) * j) / 20)))) < 1) continue;
    if ([...f, ...g].some((c) => c.n > 4 || Math.abs(c.z) > 30)) continue;
    return baueZwei(f, g, nq, stufe);
  }
  return baueZwei(pAusNullstellen(q(-1), [q(-1), q(2)]), [q(0)], [q(-1), q(2)], stufe);
}

/* ---------- Öffentliche Schnittstelle ---------- */

export function neueAufgabe(typ = "bestimmt", stufe = 1) {
  const s = Math.max(1, Math.min(typVon(typ).stufen.length, stufe));
  if (typ === "stamm") return stammAufgabe(s);
  if (typ === "anfang") return anfangAufgabe(s);
  if (typ === "flaeche") return flaecheAufgabe(s);
  if (typ === "zwei") return zweiAufgabe(s);
  return bestimmtAufgabe(s);
}

/* Eigene Funktion (Automatik oder Übergabe aus der Kurvendiskussion) */
export function eigeneAufgabe(typ, { f, a, b }) {
  if (typ === "stamm") return baueStamm(f, 0, true);
  return baueBestimmtTerm(f, a, b, 0, true);
}

/* Schritte, die eine Eingabe brauchen */
export const eingabeSchritte = (aufgabe) => aufgabe.schritte.filter((s) => s.art !== "info");

/* ---------- „Ich hänge fest“ ---------- */

const HILFEN = {
  stamm: {
    verstehen: ["Gesucht ist eine Funktion, deren Ableitung f ist.", "Aufleiten ist Ableiten rückwärts: F′(x) = f(x).", "Bearbeite die Summanden einzeln – jeder bekommt seine eigene Stammfunktion."],
    regel: ["Welche Ableitungsregel liest du rückwärts?", "$\\int x^{n} \\,dx = \\frac{x^{n+1}}{n+1} + C$ für $n \\neq −1$; $\\int \\frac{1}{x} \\,dx = \\ln|x| + C$; $\\int \\sin(x) \\,dx = −\\cos(x) + C$; $\\int e^{x} \\,dx = e^{x} + C$.", "Bei f(mx + c): Stammfunktion der äußeren Funktion bilden und durch m teilen."],
    pruefen: ["Wie kannst du selbst prüfen, ob dein F stimmt?", "Leite dein F ab – es muss genau f herauskommen.", "Das + C darfst du nicht vergessen: Jede Konstante fällt beim Ableiten weg."],
  },
  anfang: {
    verstehen: ["Es gibt unendlich viele Stammfunktionen – eine Schar F(x) + C.", "Der Punkt P legt fest, welche davon gemeint ist.", "Erst F mit + C bilden, dann den Punkt einsetzen."],
    umformen: ["Was weißt du über F(x₀)?", "P liegt auf dem Graphen: F(x₀) = y₀.", "x₀ einsetzen, alles ausrechnen und nach C auflösen: C = y₀ − F₀(x₀)."],
  },
  bestimmt: {
    verstehen: ["Gesucht ist eine Zahl: die Flächenbilanz von f zwischen a und b.", "Flächen unter der x-Achse zählen negativ.", "Der Hauptsatz macht daraus eine Rechnung: $\\int_{a}^{b} f(x)\\,dx = F(b) − F(a)$."],
    ansatz: ["Was brauchst du zuerst?", "Eine Stammfunktion F – ohne + C, es hebt sich weg.", "Dann F(b) und F(a) einzeln ausrechnen und abziehen."],
    umformen: ["Negative Grenzen brauchen Klammern.", "Beispiel: F(x) = x³, F(−2) = (−2)³ = −8.", "Bei F(b) − F(a) steht vor F(a) ein Minus – ist F(a) negativ, wird daraus ein Plus."],
  },
  flaeche: {
    verstehen: ["Gesucht ist ein Flächeninhalt – er ist nie negativ.", "Liegt ein Teil der Fläche unter der x-Achse, ist sein Integral negativ.", "Deshalb an den Nullstellen trennen und die Beträge der Teilintegrale addieren."],
    ansatz: ["Wo beginnt und endet jede Teilfläche?", "An den Nullstellen von f (und an den Grenzen a, b).", "Nullstellen → Stammfunktion → Teilintegrale → Beträge addieren."],
  },
  zwei: {
    verstehen: ["Gesucht ist die Fläche zwischen zwei Graphen.", "Sie ist so groß wie die Fläche zwischen d = f − g und der x-Achse.", "Die Schnittstellen von f und g sind die Nullstellen von d."],
    ansatz: ["Womit fängst du an?", "Mit der Differenzfunktion d(x) = f(x) − g(x), zusammengefasst.", "Dann wie bei „Fläche mit der x-Achse“: Nullstellen von d, Stammfunktion, Teilintegrale, Beträge."],
  },
};

export function hilfeKontext(aufgabe, schrittId) {
  if (!aufgabe || aufgabe.fehler) return null;
  const s = aufgabe.schritte.find((x) => x.id === schrittId) || aufgabe.schritte[0];
  const funk = (aufgabe.kopf.funktionen || []).map((f) => `${f.name}(x) = ${f.tex}`).join(", ");
  return {
    id: `int-${aufgabe.typ}-${funk}-${s.id}`,
    aufgabe: `${aufgabe.kopf.kicker}: ${funk}. Schritt: ${s.titel} – ${s.frage}`,
    hilfen: HILFEN[aufgabe.typ] || {},
    regeln: (aufgabe.regeln || []).map((name) => ({ name, bereich: "analysis" })),
    grundlage: aufgabe.typ === "bestimmt" || aufgabe.typ === "flaeche" || aufgabe.typ === "zwei"
      ? { trainer: "bruchrechnen", name: "Brüche", grund: "Beim Einsetzen der Grenzen entstehen viele Brüche wie 8/3 − 1/2. Ein paar Runden Bruchrechnen helfen." } : null,
    loesung: s.antwortTex ? `$${s.label && s.art !== "zahlen" ? s.label.replace(/_(\d)/, "_{$1}") + " " : ""}${s.antwortTex}$` : null,
  };
}
