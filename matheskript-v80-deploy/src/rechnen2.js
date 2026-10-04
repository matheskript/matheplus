/* ======================================================================
   rechnen2.js – reine Rechenbausteine für die Etappe-2-Werkzeuge
   (Integrale erweitert, Geraden im Raum, Winkel, Optimierung, Terme).
   Kein React, keine Importe: exakte Brüche, Polynome, Geraden/Ebenen.
   ====================================================================== */

/* ---------- Brüche ---------- */
export const ggT = (a, b) => (b ? ggT(b, a % b) : Math.abs(a));
export const minus = (x) => String(x).replace(/-/g, "−");
export const q = (z, n = 1) => {
  if (n < 0) { z = -z; n = -n; }
  const g = ggT(z, n) || 1;
  return { z: z / g, n: n / g };
};
export const qAdd = (a, b) => q(a.z * b.n + b.z * a.n, a.n * b.n);
export const qSub = (a, b) => q(a.z * b.n - b.z * a.n, a.n * b.n);
export const qMul = (a, b) => q(a.z * b.z, a.n * b.n);
export const qDiv = (a, b) => q(a.z * b.n, a.n * b.z);
export const qNeg = (a) => q(-a.z, a.n);
export const qAbs = (a) => q(Math.abs(a.z), a.n);
export const qNum = (a) => a.z / a.n;
export const qGleich = (a, b) => a.z === b.z && a.n === b.n;
export const qNull = (a) => a.z === 0;
export const qVorz = (a) => Math.sign(a.z);
export const qPot = (a, e) => { let r = q(1); for (let i = 0; i < e; i++) r = qMul(r, a); return r; };
export const qText = (a) => (a.n === 1 ? minus(a.z) : `${minus(a.z)}/${a.n}`);
export const qTex = (a) => (a.n === 1 ? minus(a.z) : `${a.z < 0 ? "−" : ""}\\frac{${Math.abs(a.z)}}{${a.n}}`);

/* Schülereingabe → Bruch: 3, −2, 7/3, 2,5 */
export function qLies(s) {
  const t = String(s ?? "").trim().replace(/[−–]/g, "-").replace(/\s+/g, "").replace(",", ".");
  let m;
  if ((m = t.match(/^(-?\d+)\/(\d+)$/))) return +m[2] ? q(+m[1], +m[2]) : null;
  if ((m = t.match(/^(-?)(\d+)\.(\d+)$/))) { const d = m[3].length; return d > 6 ? null : q((m[1] ? -1 : 1) * +(m[2] + m[3]), 10 ** d); }
  if (/^-?\d+$/.test(t)) return q(+t);
  return null;
}
/* Dezimalzahl mit Komma, passende Genauigkeit */
export const dez = (v, st = 2) => minus(String(Math.round(v * 10 ** st) / 10 ** st).replace(".", ","));

/* ---------- Polynome (Koeffizienten als Brüche, Index = Potenz) ---------- */
export const pTrim = (p) => { const r = [...p]; while (r.length > 1 && qNull(r[r.length - 1])) r.pop(); return r; };
export const pGrad = (p) => pTrim(p).length - 1;
export const pAdd = (a, b) => pTrim(Array.from({ length: Math.max(a.length, b.length) }, (_, i) => qAdd(a[i] || q(0), b[i] || q(0))));
export const pSkal = (a, c) => pTrim(a.map((x) => qMul(x, c)));
export const pSub = (a, b) => pAdd(a, pSkal(b, q(-1)));
export const pMul = (a, b) => {
  const r = Array.from({ length: a.length + b.length - 1 }, () => q(0));
  a.forEach((x, i) => b.forEach((y, j) => { r[i + j] = qAdd(r[i + j], qMul(x, y)); }));
  return pTrim(r);
};
export const pDer = (p) => (p.length <= 1 ? [q(0)] : pTrim(p.slice(1).map((c, i) => qMul(c, q(i + 1)))));
export const pInt = (p) => [q(0), ...p.map((c, i) => qDiv(c, q(i + 1)))];
export const pAus = (p, x) => p.reduceRight((s, c) => qAdd(qMul(s, x), c), q(0));
export const pNum = (p, x) => { let s = 0; for (let i = p.length - 1; i >= 0; i--) s = s * x + qNum(p[i]); return s; };
export const pVonZahlen = (zs) => pTrim(zs.map((z) => (typeof z === "number" ? q(z) : z)));
export const pAusNullstellen = (c, nst) => nst.reduce((p, r) => pMul(p, [qNeg(typeof r === "number" ? q(r) : r), q(1)]), [typeof c === "number" ? q(c) : c]);

/* TeX: 2x^{3} - \frac{1}{2}x + 4 */
export function pTex(p, v = "x") {
  const t = pTrim(p);
  let s = "";
  for (let i = t.length - 1; i >= 0; i--) {
    const c = t[i];
    if (qNull(c)) continue;
    const neg = c.z < 0, a = qAbs(c);
    const kern = i === 0 ? qTex(a) : qGleich(a, q(1)) ? "" : qTex(a);
    const pot = i === 0 ? "" : i === 1 ? v : `${v}^{${i}}`;
    const teil = `${kern}${pot}`;
    s += s === "" ? (neg ? "−" : "") + teil : ` ${neg ? "−" : "+"} ${teil}`;
  }
  return s || "0";
}
/* Klartext: 2x³ − x/2 + 4 */
const HOCH = { 2: "²", 3: "³", 4: "⁴", 5: "⁵" };
export function pText(p, v = "x") {
  const t = pTrim(p);
  let s = "";
  for (let i = t.length - 1; i >= 0; i--) {
    const c = t[i];
    if (qNull(c)) continue;
    const neg = c.z < 0, a = qAbs(c);
    const kern = i === 0 ? qText(a) : qGleich(a, q(1)) ? "" : a.n === 1 ? qText(a) : `(${qText(a)})`;
    const pot = i === 0 ? "" : i === 1 ? v : `${v}${HOCH[i] || `^${i}`}`;
    const teil = `${kern}${pot}`;
    s += s === "" ? (neg ? "−" : "") + teil : ` ${neg ? "−" : "+"} ${teil}`;
  }
  return s || "0";
}

/* ---------- Integrale ---------- */
export const bestimmt = (p, a, b) => { const F = pInt(p); return qSub(pAus(F, b), pAus(F, a)); };

/* Teilintervalle zwischen a und b, getrennt an allen Nullstellen (alle reellen Nullstellen von p müssen in nst stehen) */
export function teilIntervalle(a, b, nst) {
  const innen = nst.filter((r) => qNum(r) > qNum(a) && qNum(r) < qNum(b));
  const pts = [a, ...innen.sort((x, y) => qNum(x) - qNum(y)), b];
  const feld = [];
  for (let i = 0; i + 1 < pts.length; i++) if (!qGleich(pts[i], pts[i + 1])) feld.push([pts[i], pts[i + 1]]);
  return feld;
}
export function flaeche(p, a, b, nst) {
  const teile = teilIntervalle(a, b, nst).map(([x, y]) => { const I = bestimmt(p, x, y); return { von: x, bis: y, I, A: qAbs(I) }; });
  const A = teile.reduce((s, t) => qAdd(s, t.A), q(0));
  const I = teile.reduce((s, t) => qAdd(s, t.I), q(0));
  return { teile, A, I };
}

/* ---------- Vektoren (ganzzahlig) ---------- */
export const vSub = (u, v) => u.map((x, i) => x - v[i]);
export const vAdd = (u, v) => u.map((x, i) => x + v[i]);
export const vMal = (u, c) => u.map((x) => x * c);
export const skalar = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
export const kreuz = (u, v) => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
export const laenge = (u) => Math.sqrt(skalar(u, u));
export const nullVek = (u) => u.every((x) => x === 0);
export const gradAusRad = (r) => (r * 180) / Math.PI;
/* Winkel über atan2 – auch bei fast parallelen Vektoren numerisch stabil */
export const winkelZwischen = (u, v) => gradAusRad(Math.atan2(laenge(kreuz(u, v)), skalar(u, v)));
export const winkelGeradeEbene = (u, nv) => gradAusRad(Math.atan2(Math.abs(skalar(u, nv)), laenge(kreuz(u, nv))));

/* ---------- Lagebeziehungen ---------- */
/* Gerade g: A + t·u, Gerade h: B + s·v */
export function lageGG(A, u, B, v) {
  const w = vSub(B, A), uv = kreuz(u, v);
  if (nullVek(uv)) {
    return nullVek(kreuz(w, u)) ? { art: "identisch", w, uv } : { art: "parallel", w, uv };
  }
  const kk = uv.findIndex((x) => x !== 0);
  const [i, j] = [0, 1, 2].filter((x) => x !== kk);
  const D = -(u[i] * v[j] - u[j] * v[i]);                      // det [[u_i, −v_i],[u_j, −v_j]]
  const t = q(w[i] * -v[j] - w[j] * -v[i], D);                 // Cramer
  const s = q(u[i] * w[j] - u[j] * w[i], D);
  const dritte = qSub(qMul(t, q(u[kk])), qMul(s, q(v[kk])));   // t·u_k − s·v_k
  const ok = qGleich(dritte, q(w[kk]));
  const S = ok ? [0, 1, 2].map((r) => qAdd(q(A[r]), qMul(t, q(u[r])))) : null;
  return { art: ok ? "schneidend" : "windschief", w, uv, zeilen: [i, j], dritte: kk, t, s, linksDritte: dritte, S };
}
/* Gerade g: A + t·u, Ebene E: n·x = d */
export function lageGE(A, u, nv, d) {
  const un = skalar(u, nv), An = skalar(A, nv);
  if (un !== 0) {
    const t = q(d - An, un);
    return { art: "schneidend", un, An, t, S: [0, 1, 2].map((r) => qAdd(q(A[r]), qMul(t, q(u[r])))) };
  }
  return { art: An === d ? "enthalten" : "parallel", un, An };
}
/* Punktprobe: liegt P auf g: A + t·u ? */
export function punktprobe(A, u, P) {
  const zeilen = [0, 1, 2].map((r) => {
    const rechts = P[r] - A[r];
    if (u[r] === 0) return { r, frei: true, ok: rechts === 0, rechts };
    return { r, frei: false, t: q(rechts, u[r]), rechts };
  });
  const feste = zeilen.filter((z) => !z.frei);
  const tt = feste[0]?.t;
  const ok = zeilen.every((z) => (z.frei ? z.ok : qGleich(z.t, tt)));
  return { zeilen, ok, t: ok ? tt : null };
}

/* ---------- Zufall ---------- */
export const zz = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
export const zzOhne0 = (a, b) => { let x = 0; while (x === 0) x = zz(a, b); return x; };
export const wahl = (l) => l[Math.floor(Math.random() * l.length)];
export const mischen = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export const zufallsVektor = (r = 4, hoechstensNullen = 1) => {
  for (;;) {
    const v = [zz(-r, r), zz(-r, r), zz(-r, r)];
    if (v.filter((x) => x === 0).length <= hoechstensNullen) return v;
  }
};
