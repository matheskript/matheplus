/* ============================================================
   geradenLogik.js – reine Mathematik für das Werkzeug „Geraden“
   (Basics, P & Q, P & m). Kein React, Node-testbar (tests/geraden.test.mjs).

   · Brüche exakt (bruch, bAdd, …) – Steigung und y-Achsenabschnitt
     sind rationale Zahlen, nie gerundete Dezimalzahlen
   · geradePQ / achsenabschnitt – Lösung
   · steigungWeg / achsenWeg – Rechenwege als Mini-TeX (Regel A5:
     jede Kette endet vereinfacht, negative Werte stehen in Klammern)
   · gleichungTex – y = m·x + c ohne 1x, +0, + − (Regel A5)
   · bewerte – Eingabe prüfen: richtig, ungekürzt, typischer Fehler
   · fenster – Bildausschnitt im goldenen Schnitt, zeigt immer den Ursprung
   · zufallPQ / zufallPm – Aufgaben für den Würfel
   ============================================================ */

export const PHI = (1 + Math.sqrt(5)) / 2;   // goldener Schnitt: Breite : Höhe
export const GRENZE = 20;                    // Koordinaten von −20 bis 20

const mz = (v) => String(v).replace("-", "−");

/* ---------- Brüche ---------- */
export const ggT = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { const r = a % b; a = b; b = r; } return a; };

export function bruch(n, d = 1) {
  if (!Number.isInteger(n) || !Number.isInteger(d) || d === 0) return null;
  const g = ggT(n, d) || 1;
  let z = n / g, nn = d / g;
  if (nn < 0) { z = -z; nn = -nn; }
  return { n: z === 0 ? 0 : z, d: nn };
}
export const bGleich = (a, b) => !!a && !!b && a.n === b.n && a.d === b.d;
export const bAdd = (a, b) => bruch(a.n * b.d + b.n * a.d, a.d * b.d);
export const bSub = (a, b) => bruch(a.n * b.d - b.n * a.d, a.d * b.d);
export const bMal = (a, b) => bruch(a.n * b.n, a.d * b.d);
export const bNeg = (a) => bruch(-a.n, a.d);
export const bWert = (a) => a.n / a.d;

export const bruchText = (b) => (b.d === 1 ? mz(b.n) : `${mz(b.n)}/${b.d}`);
/* Mini-TeX: −\frac{3}{2}; ganze Zahlen ohne Bruch */
export const bruchTex = (b) => (b.d === 1 ? mz(b.n) : `${b.n < 0 ? "−" : ""}\\frac{${Math.abs(b.n)}}{${b.d}}`);
/* Wert in Klammern, wenn er negativ ist: (−2) bzw. (−\frac{1}{2}) */
const bKlammer = (b) => (b.n < 0 ? `(${bruchTex(b)})` : bruchTex(b));
const zKlammer = (v) => (v < 0 ? `(${mz(v)})` : String(v));

/* ---------- Eingabe lesen und bewerten ---------- */
/* Erlaubt: 5, −5, 3/2, −3/2 (so entsteht es am Zahlenfeld). Unfertiges („−“, „3/“) und /0 → null. */
export function leseAntwort(text) {
  const t = String(text ?? "").replace(/\s+/g, "").replace(/[−–]/g, "-");
  const tr = /^(-?)(\d{1,4})(?:\/(\d{1,4}))?$/.exec(t);
  if (!tr) return null;
  const n = Number(tr[2]) * (tr[1] ? -1 : 1);
  const hatBruch = tr[3] !== undefined;
  const d = hatBruch ? Number(tr[3]) : 1;
  if (d === 0) return null;
  const wert = bruch(n, d);
  // Kanonisch: ganze Zahl ohne Bruchstrich, sonst vollständig gekürzt
  const kanonisch = hatBruch ? (wert.d !== 1 && ggT(n, d) === 1) : true;
  return { n, d, wert, kanonisch, hatBruch };
}

/* Taste des kleinen Zahlenfelds auf den Eingabetext anwenden.
   Tasten: 0–9, ±, ⌫, / (nur mit bruch). maxZiffern gilt je Zähler bzw. Nenner. */
export function tasteAnwenden(text, taste, { bruch: mitBruch = false, maxZiffern = 2 } = {}) {
  const t = String(text ?? "");
  if (taste === "⌫") return t.slice(0, -1);
  if (taste === "±") return t.startsWith("-") ? t.slice(1) : `-${t}`;
  if (taste === "/") return mitBruch && !t.includes("/") && /\d$/.test(t) ? `${t}/` : t;
  if (!/^\d$/.test(taste)) return t;
  const teile = t.split("/");
  const teil = teile[teile.length - 1].replace("-", "");
  if (teil === "0") return t.slice(0, -1) + taste;   // keine führende Null: 0 → 5, −0 → −5
  if (teil.length >= maxZiffern) return t;
  return t + taste;
}

/* fehlerFaelle: [{ wert: Bruch, id, text }] – bekannte typische Fehler */
export function bewerte(eingabe, soll, fehlerFaelle = []) {
  if (!String(eingabe ?? "").trim()) return { art: "leer" };
  const a = leseAntwort(eingabe);
  if (!a) return { art: "unfertig" };
  if (bGleich(a.wert, soll)) {
    return a.kanonisch ? { art: "richtig" }
      : { art: "ungekuerzt", hinweis: "Der Wert stimmt – kürze den Bruch noch vollständig." };
  }
  for (const f of fehlerFaelle) if (f.wert && bGleich(a.wert, f.wert)) return { art: "falsch", hinweis: f.text, fehler: f.id };
  return { art: "falsch", hinweis: null, fehler: null };
}

/* ---------- Lösung ---------- */
export function geradePQ(P, Q) {
  const dx = Q[0] - P[0], dy = Q[1] - P[1];
  if (dx === 0) return { senkrecht: true, gleichePunkte: dy === 0, dx, dy };
  const m = bruch(dy, dx);
  return { senkrecht: false, dx, dy, m, c: achsenabschnitt(P, m) };
}
export function achsenabschnitt(P, m) {
  return bSub(bruch(P[1]), bMal(m, bruch(P[0])));
}

/* ---------- Schreibweise: y = m·x + c ---------- */
function mTeil(m) {
  if (m.n === 0) return null;
  if (m.d === 1) return m.n === 1 ? "x" : m.n === -1 ? "−x" : `${mz(m.n)}x`;
  return `${m.n < 0 ? "−" : ""}\\frac{${Math.abs(m.n)}}{${m.d}}x`;
}
const cBetrag = (c) => (c.d === 1 ? String(Math.abs(c.n)) : `\\frac{${Math.abs(c.n)}}{${c.d}}`);

export function gleichungTex(m, c) {
  const a = mTeil(m);
  if (!a) return `y = ${bruchTex(c)}`;
  if (c.n === 0) return `y = ${a}`;
  return `y = ${a} ${c.n < 0 ? "−" : "+"} ${cBetrag(c)}`;
}
export function gleichungText(m, c) {
  const a = m.n === 0 ? null : m.d === 1 ? (m.n === 1 ? "x" : m.n === -1 ? "−x" : `${mz(m.n)}x`) : `(${bruchText(m)})x`;
  if (!a) return `y = ${bruchText(c)}`;
  if (c.n === 0) return `y = ${a}`;
  return `y = ${a} ${c.n < 0 ? "−" : "+"} ${c.d === 1 ? Math.abs(c.n) : bruchText({ n: Math.abs(c.n), d: c.d })}`;
}

/* ---------- Rechenwege (Mini-TeX) ---------- */
const kette = (teile) => teile.filter(Boolean).join(" = ");

export function steigungWeg(P, Q) {
  const [xp, yp] = P, [xq, yq] = Q;
  const dx = xq - xp, dy = yq - yp;
  const m = bruch(dy, dx);
  const eingesetzt = `\\frac{${mz(yq)} − ${zKlammer(yp)}}{${mz(xq)} − ${zKlammer(xp)}}`;
  const gerechnet = dx === 1 ? null : `\\frac{${mz(dy)}}{${mz(dx)}}`;
  const ergebnis = bruchTex(m);
  return kette([
    "m", "\\frac{y_Q − y_P}{x_Q − x_P}", eingesetzt,
    gerechnet !== ergebnis ? gerechnet : null,
    ergebnis,
  ]);
}

export function achsenWeg(P, m) {
  const [xp, yp] = P;
  const w = bMal(m, bruch(xp));
  const c = bSub(bruch(yp), w);
  const eingesetzt = `${mz(yp)} − ${bKlammer(m)} · ${zKlammer(xp)}`;
  const gerechnet = w.n === 0 ? null : `${mz(yp)} − ${bKlammer(w)}`;
  const ergebnis = bruchTex(c);
  return kette([
    "c", "y_P − m · x_P", eingesetzt,
    gerechnet !== ergebnis ? gerechnet : null,
    ergebnis,
  ]);
}

/* Einsetzprobe für Basics: T(x | y) liegt auf der Geraden. m und c sind Zahlen (Vielfache von 0,5 bzw. ganz). */
export const zahlText = (v) => {
  const r = Math.round(v * 100) / 100;
  return mz(String(Object.is(r, -0) ? 0 : r).replace(".", ","));
};
export function probeText(m, c, x) {
  const y = m * x + c;
  const mm = m < 0 ? `(${zahlText(m)})` : zahlText(m);
  const cc = c === 0 ? "" : ` ${c < 0 ? "−" : "+"} ${zahlText(Math.abs(c))}`;
  const xx = x < 0 ? `(${zahlText(x)})` : zahlText(x);
  return { y, text: `y = ${mm} · ${xx}${cc} = ${zahlText(y)}` };
}

/* ---------- Typische Fehler ---------- */
export function fehlerFaelleM(P, Q) {
  const dx = Q[0] - P[0], dy = Q[1] - P[1];
  if (dx === 0) return [];
  const m = bruch(dy, dx);
  const liste = [
    { wert: bNeg(m), id: "vorzeichen", text: "Vorzeichen prüfen: In Zähler und Nenner muss dieselbe Reihenfolge stehen – beide Male Q minus P." },
    { wert: bruch(dy), id: "nurDy", text: "Das ist nur die Höhe Δy. Teile noch durch die Breite Δx." },
    { wert: bruch(dx), id: "nurDx", text: "Das ist nur die Breite Δx. Gesucht ist Höhe durch Breite: Δy durch Δx." },
  ];
  if (m.n !== 0) liste.splice(1, 0, { wert: bruch(m.d, m.n), id: "kehrwert", text: "Zähler und Nenner sind vertauscht: Steigung = Höhe durch Breite, also Δy durch Δx." });
  return liste.filter((f) => f.wert);
}
export function fehlerFaelleC(P, m) {
  const w = bMal(m, bruch(P[0]));
  const c = bSub(bruch(P[1]), w);
  return [
    { wert: bruch(P[1]), id: "ohneM", text: "Du hast m · x_P vergessen: c = y_P − m · x_P." },
    { wert: bAdd(bruch(P[1]), w), id: "plus", text: "Vorzeichen: Es heißt y_P − m · x_P, nicht plus." },
    { wert: bNeg(c), id: "umgekehrt", text: "Fast: Die Reihenfolge ist y_P − m · x_P, nicht umgekehrt." },
  ].filter((f) => f.wert);
}

/* ---------- Bildausschnitt: goldener Schnitt, immer mit Ursprung ---------- */
export function schrittFuer(h) {
  const roh = h / 9;
  for (const s of [1, 2, 5, 10, 20, 50]) if (s >= roh) return s;
  return 100;
}

/* punkte: Liste [x, y]. Gleiche Einheit auf beiden Achsen, Breite : Höhe = φ : 1. */
export function fenster(punkte, { rand = 1.5, minH = 8 } = {}) {
  const xs = [0, ...punkte.map((p) => p[0])], ys = [0, ...punkte.map((p) => p[1])];
  const bx0 = Math.min(...xs), bx1 = Math.max(...xs), by0 = Math.min(...ys), by1 = Math.max(...ys);
  const wx = bx1 - bx0 + 2 * rand, wy = by1 - by0 + 2 * rand;
  const h = Math.max(wy, wx / PHI, minH);
  const w = h * PHI;
  const cx = (bx0 + bx1) / 2, cy = (by0 + by1) / 2;
  return { x0: cx - w / 2, x1: cx + w / 2, y0: cy - h / 2, y1: cy + h / 2, w, h, schritt: schrittFuer(h) };
}

export const zuBild = (p, f, W, H) => [((p[0] - f.x0) / (f.x1 - f.x0)) * W, ((f.y1 - p[1]) / (f.y1 - f.y0)) * H];
export const zuMathe = (px, py, f, W, H) => [f.x0 + (px / W) * (f.x1 - f.x0), f.y1 - (py / H) * (f.y1 - f.y0)];

/* Ziehen: auf ganze Zahlen einrasten, im Fenster und im erlaubten Bereich bleiben */
export function einrasten(p, f, grenze = GRENZE) {
  const lim = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  return [
    lim(Math.round(p[0]), Math.max(-grenze, Math.ceil(f.x0)), Math.min(grenze, Math.floor(f.x1))),
    lim(Math.round(p[1]), Math.max(-grenze, Math.ceil(f.y0)), Math.min(grenze, Math.floor(f.y1))),
  ];
}

/* Gerade y = m·x + c (Zahlen) auf das Fenster zuschneiden → zwei Endpunkte oder null */
export function linieImFenster(m, c, f) {
  const pts = [];
  for (const x of [f.x0, f.x1]) {
    const y = m * x + c;
    if (y >= f.y0 - 1e-9 && y <= f.y1 + 1e-9) pts.push([x, y]);
  }
  if (m !== 0) for (const y of [f.y0, f.y1]) {
    const x = (y - c) / m;
    if (x > f.x0 + 1e-9 && x < f.x1 - 1e-9) pts.push([x, y]);
  }
  pts.sort((a, b) => a[0] - b[0]);
  return pts.length >= 2 ? [pts[0], pts[pts.length - 1]] : null;
}

/* Steigungsdreieck von P nach Q: Eckpunkt R unter/über Q */
export const dreieck = (P, Q) => ({ R: [Q[0], P[1]], dx: Q[0] - P[0], dy: Q[1] - P[1] });

/* Steigungsdreieck an einem Punkt mit gegebenem m: Breite = Nenner, Höhe = Zähler (ganzzahlige Seiten) */
export function dreieckPm(P, m) {
  const b = m.d, a = m.n;
  return { R: [P[0] + b, P[1]], Q: [P[0] + b, P[1] + a], dx: b, dy: a };
}

/* ---------- Zufallsaufgaben ---------- */
const ri = (rnd, a, b) => a + Math.floor(rnd() * (b - a + 1));
const vz = (rnd) => (rnd() < 0.5 ? -1 : 1);
const innen = (p, g) => Math.abs(p[0]) <= g && Math.abs(p[1]) <= g;

export function zufallPQ(rnd = Math.random) {
  for (let i = 0; i < 500; i++) {
    let P, Q;
    if (rnd() < 0.5) {
      // ganzzahlige Steigung, selten waagerecht
      const m = rnd() < 0.08 ? 0 : vz(rnd) * ri(rnd, 1, 3);
      const dx = vz(rnd) * ri(rnd, 1, 4);
      P = [ri(rnd, -6, 6), ri(rnd, -6, 6)];
      Q = [P[0] + dx, P[1] + m * dx];
    } else {
      // Bruch als Steigung; k = 2 → der Bruch muss erst gekürzt werden
      const b = ri(rnd, 2, 4), a = vz(rnd) * ri(rnd, 1, 5);
      if (ggT(a, b) !== 1) continue;
      const k = rnd() < 0.7 ? 1 : 2, s = vz(rnd);
      const px = rnd() < 0.75 ? b * ri(rnd, -2, 2) : ri(rnd, -6, 6);
      P = [px, ri(rnd, -6, 6)];
      Q = [px + s * b * k, P[1] + a * s * k];
    }
    if (innen(P, 8) && innen(Q, 8) && P[0] !== Q[0]) {
      const c = achsenabschnitt(P, bruch(Q[1] - P[1], Q[0] - P[0]));
      if (Math.abs(bWert(c)) <= 12) return { P, Q };   // y-Achsenabschnitt bleibt im Bild
    }
  }
  return { P: [1, 3], Q: [3, 7] };
}

export function zufallPm(rnd = Math.random) {
  for (let i = 0; i < 500; i++) {
    let m;
    const r = rnd();
    if (r < 0.06) m = bruch(0);
    else if (r < 0.6) m = bruch(vz(rnd) * ri(rnd, 1, 3));
    else {
      const b = ri(rnd, 2, 4), a = vz(rnd) * ri(rnd, 1, 5);
      if (ggT(a, b) !== 1) continue;
      m = bruch(a, b);
    }
    const px = m.d > 1 && rnd() < 0.8 ? m.d * ri(rnd, -2, 2) : ri(rnd, -6, 6);
    const P = [px, ri(rnd, -6, 6)];
    const c = achsenabschnitt(P, m);
    if (Math.abs(bWert(c)) <= 12 && innen(P, 8)) return { P, m };
  }
  return { P: [2, 3], m: bruch(2) };
}
