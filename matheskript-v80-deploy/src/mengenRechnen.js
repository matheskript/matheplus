/* ======================================================================
   mengenRechnen.js – gemeinsame reine Mathematik für
   „Ungleichungen und Beträge“, „Mengen und Logik“ und „Funktionen“:
   · Zahlen und lineare Terme als TeX (Regel A5: kein 1x, kein + −, kein + 0)
   · Teilmengen von ℝ (Intervalle, Vereinigungen, ℝ ohne Punkte, leere Menge)
     mit TeX-Darstellung in deutscher Intervallschreibweise ]a; b[,
     Mitgliedschaftstest und Vergleich
   Kein React, Node-testbar (tests/mengenRechnen.test.mjs).
   ====================================================================== */

/* ---------- Zufall ---------- */
export const ganz = (lo, hi, z = Math.random) => lo + Math.floor(z() * (hi - lo + 1));
export const ganzOhne0 = (lo, hi, z = Math.random) => { let x = 0; while (x === 0) x = ganz(lo, hi, z); return x; };
export const wahlAus = (l, z = Math.random) => l[Math.floor(z() * l.length)];
export const mischen = (l, z = Math.random) => { const r = [...l]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(z() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };

/* ---------- Zahlen als TeX ---------- */
const ggT = (a, b) => (b ? ggT(b, a % b) : Math.abs(a));
/* Bruch zu einer Dezimalzahl finden (Nenner ≤ 24), sonst null */
export function alsBruch(v) {
  for (let n = 1; n <= 24; n++) {
    const z = Math.round(v * n);
    if (Math.abs(z / n - v) < 1e-9) { const g = ggT(z, n) || 1; return [z / g, n / g]; }
  }
  return null;
}
/* Zahl → TeX: ganze Zahl, gekürzter Bruch oder Dezimalzahl mit Komma; Minus als „−“ */
export function zTex(v) {
  if (v === Infinity) return "\\infty";
  if (v === -Infinity) return "−\\infty";
  const b = alsBruch(v);
  if (b) {
    const [z, n] = b;
    if (n === 1) return z < 0 ? `−${-z}` : String(z === 0 ? 0 : z);
    return `${z < 0 ? "−" : ""}\\frac{${Math.abs(z)}}{${n}}`;
  }
  const r = Math.round(v * 1000) / 1000;
  return (r < 0 ? "−" : "") + String(Math.abs(r)).replace(".", "{,}");
}
/* Dezimalzahl als TeX mit Komma: dezTex(0.05, 2) → "0{,}05"; fest = true hält die Stellen (Geld: 1,50) */
export function dezTex(v, st = 2, fest = false) {
  const r = Math.round(v * 10 ** st) / 10 ** st;
  let t = fest && !Number.isInteger(r) ? Math.abs(r).toFixed(st) : String(Math.abs(r));
  return (r < 0 ? "−" : "") + t.replace(".", "{,}");
}
/* Zahl als Klartext (für SVG-Beschriftungen): 3, −2, 5/3, 1,5 */
export function zText(v) {
  if (v === Infinity) return "∞";
  if (v === -Infinity) return "−∞";
  const b = alsBruch(v);
  if (b) { const [z, n] = b; return n === 1 ? String(z).replace("-", "−") : `${z < 0 ? "−" : ""}${Math.abs(z)}/${n}`; }
  return String(Math.round(v * 100) / 100).replace("-", "−").replace(".", ",");
}
/* Zahl, die rechts von einem Rechenzeichen steht: negative in Klammern */
export const zKl = (v) => (v < 0 ? `(${zTex(v)})` : zTex(v));

/* a·x + b als TeX: linTex(1, -3) → "x − 3", linTex(-1, 0) → "−x", linTex(0, 4) → "4" */
export function linTex(a, b = 0, v = "x") {
  let s = "";
  if (a !== 0) {
    if (a === 1) s = v;
    else if (a === -1) s = `−${v}`;
    else s = `${zTex(a)}${v}`;
  }
  if (b !== 0 || !s) {
    if (!s) s = zTex(b);
    else s += b > 0 ? ` + ${zTex(b)}` : ` − ${zTex(-b)}`;
  }
  return s;
}
/* x − m als TeX (Abstand zu m): m = 3 → "x − 3", m = −2 → "x + 2", m = 0 → "x" */
export const abstandTex = (m, v = "x") => linTex(1, -m, v);
/* Polynom a·x² + b·x + c als TeX */
export function quadTex(a, b, c, v = "x") {
  const teile = [];
  const term = (k, pot) => {
    if (k === 0) return null;
    const p = pot === 2 ? `${v}^2` : pot === 1 ? v : "";
    const betrag = Math.abs(k);
    const koef = pot === 0 ? zTex(betrag) : betrag === 1 ? "" : zTex(betrag);
    return { neg: k < 0, t: `${koef}${p}` };
  };
  [term(a, 2), term(b, 1), term(c, 0)].filter(Boolean).forEach((t, i) => {
    teile.push(i === 0 ? `${t.neg ? "−" : ""}${t.t}` : ` ${t.neg ? "−" : "+"} ${t.t}`);
  });
  return teile.join("") || "0";
}

/* ---------- Relationen ---------- */
export const RELS = ["<", "<=", ">", ">="];
export const REL_TEX = { "<": "<", "<=": "\\le", ">": ">", ">=": "\\ge" };
export const REL_TEXT = { "<": "<", "<=": "≤", ">": ">", ">=": "≥" };
/* Zeichen umdrehen (bei Mal/Geteilt mit negativer Zahl) */
export const DREH = { "<": ">", "<=": ">=", ">": "<", ">=": "<=" };
export const gilt = (l, rel, r) => (rel === "<" ? l < r - 1e-12 : rel === "<=" ? l <= r + 1e-12 : rel === ">" ? l > r + 1e-12 : l >= r - 1e-12);
export const istStreng = (rel) => rel === "<" || rel === ">";

/* ---------- Teilmengen von ℝ ----------
   { art: "R" }                     ℝ
   { art: "leer" }                  ∅
   { art: "ohne", pkt: [a, …] }     ℝ \ {a, …}
   { art: "pkt", pkt: [a, …] }      endliche Menge {a, …}
   { art: "iv", lo, hi, loZu, hiZu } Intervall; lo = −∞ / hi = ∞ erlaubt; …Zu = Grenze gehört dazu
   { art: "ver", teile: [iv, iv] }  Vereinigung zweier Intervalle
   { art: "ivOhne", iv, pkt: [a] }  Intervall ohne einzelne Punkte                                  */
export const R = () => ({ art: "R" });
export const LEER = () => ({ art: "leer" });
export const iv = (lo, hi, loZu = false, hiZu = false) => ({ art: "iv", lo, hi, loZu: lo === -Infinity ? false : loZu, hiZu: hi === Infinity ? false : hiZu });
export const ver = (a, b) => ({ art: "ver", teile: [a, b] });
export const ohne = (...pkt) => ({ art: "ohne", pkt: [...pkt].sort((x, y) => x - y) });
export const pktMenge = (...pkt) => ({ art: "pkt", pkt: [...pkt].sort((x, y) => x - y) });

/* Lösungsmenge von x rel g (rel aus RELS) */
export function halbIntervall(rel, g) {
  if (rel === "<") return iv(-Infinity, g, false, false);
  if (rel === "<=") return iv(-Infinity, g, false, true);
  if (rel === ">") return iv(g, Infinity, false, false);
  return iv(g, Infinity, true, false);
}

export function enthaelt(m, x) {
  switch (m.art) {
    case "R": return true;
    case "leer": return false;
    case "ohne": return !m.pkt.some((p) => Math.abs(p - x) < 1e-9);
    case "pkt": return m.pkt.some((p) => Math.abs(p - x) < 1e-9);
    case "iv": {
      const links = m.lo === -Infinity || x > m.lo + 1e-12 || (m.loZu && Math.abs(x - m.lo) < 1e-9);
      const rechts = m.hi === Infinity || x < m.hi - 1e-12 || (m.hiZu && Math.abs(x - m.hi) < 1e-9);
      return links && rechts;
    }
    case "ver": return m.teile.some((t) => enthaelt(t, x));
    case "ivOhne": return enthaelt(m.iv, x) && !m.pkt.some((p) => Math.abs(p - x) < 1e-9);
    default: return false;
  }
}

/* Intervall in deutscher Schreibweise: [a; b], ]a; b[, ]−∞; a] */
export function ivTex(m) {
  if (m.lo === -Infinity && m.hi === Infinity) return "\\mathbb{R}";
  const l = m.lo === -Infinity || !m.loZu ? "]" : "[";
  const r = m.hi === Infinity || !m.hiZu ? "[" : "]";
  return `${l}${zTex(m.lo)}; ${zTex(m.hi)}${r}`;
}
export function mengeTex(m) {
  switch (m.art) {
    case "R": return "\\mathbb{R}";
    case "leer": return "\\emptyset";
    case "ohne": return `\\mathbb{R} \\setminus \\{${m.pkt.map(zTex).join("; ")}\\}`;
    case "pkt": return `\\{${m.pkt.map(zTex).join("; ")}\\}`;
    case "iv": return ivTex(m);
    case "ver": return m.teile.map(ivTex).join(" \\cup ");
    case "ivOhne": return `${ivTex(m.iv)} \\setminus \\{${m.pkt.map(zTex).join("; ")}\\}`;
    default: return "";
  }
}
/* Schlüssel zum Vergleich zweier Mengen-Darstellungen (gleiche Darstellung ⇔ gleicher Schlüssel) */
export const mengeSchluessel = (m) => mengeTex(m);

/* Gleichheit über Stichproben (genügt für die hier vorkommenden Mengen mit „schönen“ Grenzen) */
export function mengenGleich(a, b) {
  const proben = [];
  const grenzen = new Set();
  const sammle = (m) => {
    if (m.art === "iv") { [m.lo, m.hi].forEach((g) => isFinite(g) && grenzen.add(g)); }
    if (m.art === "ver") m.teile.forEach(sammle);
    if (m.art === "ohne" || m.art === "pkt") m.pkt.forEach((p) => grenzen.add(p));
    if (m.art === "ivOhne") { sammle(m.iv); m.pkt.forEach((p) => grenzen.add(p)); }
  };
  sammle(a); sammle(b);
  const g = [...grenzen].sort((x, y) => x - y);
  g.forEach((x) => { proben.push(x, x - 0.013, x + 0.013); });
  for (let i = 0; i + 1 < g.length; i++) proben.push((g[i] + g[i + 1]) / 2);
  proben.push(-1e6, 1e6, 0.5, -0.5);
  return proben.every((x) => enthaelt(a, x) === enthaelt(b, x));
}

/* Ungleichung „x rel g“ als TeX: relTex("<=", 3) → "x \\le 3" */
export const loesTex = (rel, g, v = "x") => `${v} ${REL_TEX[rel]} ${zTex(g)}`;

/* Plausible falsche Lösungsmengen zu einem Halbintervall (falsche Klammer, falsche Richtung) */
export function nachbarnHalb(rel, g) {
  const richtig = halbIntervall(rel, g);
  const offen = istStreng(rel);
  const klammer = halbIntervall(offen ? (rel === "<" ? "<=" : ">=") : (rel === "<=" ? "<" : ">"), g);
  const dreh = halbIntervall(DREH[rel], g);
  return [richtig, klammer, dreh];
}

/* Optionsliste [schlüssel, $tex$] aus Mengen, ohne doppelte Darstellungen */
export function mengenOptionen(mengen) {
  const gesehen = new Set();
  const aus = [];
  mengen.forEach((m) => {
    const t = mengeTex(m);
    if (gesehen.has(t)) return;
    gesehen.add(t);
    aus.push([t, `$${t}$`]);
  });
  return aus;
}
