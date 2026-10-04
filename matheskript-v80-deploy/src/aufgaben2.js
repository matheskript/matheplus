/* ======================================================================
   aufgaben2.js – Aufgabengeneratoren (rein, ohne React) der Integrale-Erweiterung.
   Getestet mit Zufallsläufen gegen numerische Kontrollrechnungen.
   ====================================================================== */
import {
  bestimmt, ggT, kreuz, lageGE, lageGG, pAdd, pAus, pAusNullstellen, pInt, pNum, punktprobe, q, qAbs, qAdd, qGleich, qMul, qSub, qVorz, skalar, vAdd, vMal, vSub,
  wahl, zufallsVektor, zz, zzOhne0,
} from "./rechnen2.js";

const zzNull = (a, b) => { let x = 0; while (x === 0) x = zz(a, b); return x; };

export function neueFlaechenAufgabe() {
  const anz = wahl([1, 2, 2, 3]);
  const nst = [];
  while (nst.length < anz) { const r = zz(-3, 3); if (!nst.includes(r)) nst.push(r); }
  nst.sort((a, b) => a - b);
  const c = anz === 1 ? wahl([q(1), q(-1), q(2), q(-2), q(1, 2)]) : wahl([q(1), q(-1), q(1, 2), q(-1, 2)]);
  const p = pAusNullstellen(c, nst);
  let a = Math.max(-4, nst[0] - 1), b = Math.min(4, nst[nst.length - 1] + 1);
  if (a >= b) { a = -2; b = 2; }
  return { p, nst: nst.map((r) => q(r)), a, b };
}

export function neueZweiGraphen() {
  for (;;) {
    const anz = wahl([2, 2, 3]);
    const nst = [];
    while (nst.length < anz) { const r = zz(-3, 3); if (!nst.includes(r)) nst.push(r); }
    nst.sort((x, y) => x - y);
    const c = anz === 2 ? wahl([q(1), q(-1), q(1, 2), q(-1, 2)]) : wahl([q(1, 2), q(-1, 2)]);
    const d = pAusNullstellen(c, nst);
    const g = wahl([0, 1, 1]) === 0 ? [q(zz(-2, 3)), q(zz(-2, 2)), q(wahl([-1, 1]))] : [q(zz(-2, 3)), q(zz(-2, 2))];
    const f = pAdd(g, d);
    const intervalle = nst.slice(0, -1).map((r, i) => [q(r), q(nst[i + 1])]);
    const oben = intervalle.map(([x, y]) => (qVorz(pAus(d, qMul(qAdd(x, y), q(1, 2)))) > 0 ? "f" : "g"));
    const teile = intervalle.map(([x, y], i) => { const I = bestimmt(d, x, y); return { von: x, bis: y, I, A: qAbs(I), oben: oben[i] }; });
    const A = teile.reduce((s, t) => qAdd(s, t.A), q(0));
    const summeSigned = teile.reduce((s, t) => qAdd(s, t.I), q(0));
    const sichtbar = [f, g].every((p) => { for (let x = -4; x <= 4; x += 0.5) if (Math.abs(pNum(p, x)) > 18) return false; return true; });
    if (sichtbar && (anz === 2 || !qGleich(qAbs(summeSigned), A))) return { f, g, d, nst, intervalle, oben, teile, A, summeSigned };
  }
}

export function neuerBestand() {
  for (let versuch = 0; versuch < 500; versuch++) {
    const T = wahl([4, 5, 6]);
    const t1 = zz(1, 2), t2 = zz(t1 + 1, T);
    const k = wahl([2, 3, 4]);
    const c = qMul(q(k), wahl([q(1), q(-1)]));
    const r = pAusNullstellen(c, [t1, t2]);
    const B0 = wahl([40, 60, 100]);
    const Bf = pAdd([q(B0)], pInt(r));
    const bilanz = bestimmt(r, q(0), q(T));
    if (qGleich(bilanz, q(0))) continue;
    let ok = true;
    for (let t = 0; t <= T; t += 0.1) if (pNum(Bf, t) < 0 || Math.abs(pNum(r, t)) > 40) { ok = false; break; }
    if (!ok) continue;
    return { T, r, B0, Bf, bilanz, ende: qAdd(q(B0), bilanz), t1, t2 };
  }
  return { T: 4, r: pAusNullstellen(q(2), [1, 3]), B0: 40, Bf: pAdd([q(40)], pInt(pAusNullstellen(q(2), [1, 3]))), bilanz: bestimmt(pAusNullstellen(q(2), [1, 3]), q(0), q(4)), ende: qAdd(q(40), bestimmt(pAusNullstellen(q(2), [1, 3]), q(0), q(4))), t1: 1, t2: 3 };
}

export function neuUmgekehrt() {
  const a = wahl([-2, -1, 1, 2]);
  const ts = wahl([2, 3, 4]);
  const b = -2 * a * ts;
  const T = 2 * ts;
  const B0 = a > 0 ? a * ts * ts + zz(3, 12) : zz(5, 20);
  const Bf = [q(B0), q(b), q(a)];
  const kandidaten = [];
  for (let t0 = 1; t0 < T; t0++) if (t0 !== ts) kandidaten.push(t0);
  const t0 = wahl(kandidaten);
  const rate = 2 * a * t0 + b;
  return { a, b, B0, T, ts, t0, Bf, rate, Bt0: a * t0 * t0 + b * t0 + B0 };
}

export function neuerAnfangswert() {
  const grad = wahl([1, 2, 2]);
  const f = grad === 1 ? [q(zz(-4, 4)), q(zzNull(-3, 3))] : [q(zz(-3, 3)), q(zz(-4, 4)), q(zzNull(-3, 3))];
  const F0 = pInt(f);
  const x0 = zz(-2, 3), y0 = zz(-6, 9);
  const C0 = qSub(q(y0), pAus(F0, q(x0)));
  return { f, F0, x0, y0, C0 };
}



/* ---------- Geraden im Raum ---------- */

const klein = (v, m = 9) => v.every((x) => Math.abs(x) <= m);

/* fall: "identisch" | "parallel" | "schneidend" | "windschief" (ohne Angabe zufällig) */
export function neueLageGG(fall) {
  for (let versuch = 0; versuch < 2000; versuch++) {
    const f = fall || wahl(["identisch", "parallel", "schneidend", "windschief"]);
    let A = zufallsVektor(3, 1), B, v;
    const u = zufallsVektor(2, 1);
    if (f === "identisch") { v = vMal(u, wahl([-2, -1, 2, 3])); B = vAdd(A, vMal(u, wahl([-2, -1, 1, 2, 3]))); }
    else if (f === "parallel") { v = vMal(u, wahl([-2, -1, 2, 3])); B = vAdd(A, zufallsVektor(3, 1)); }
    else if (f === "schneidend") {
      v = zufallsVektor(2, 1);
      const S = zufallsVektor(3, 1);
      A = vSub(S, vMal(u, zzOhne0(-2, 2)));
      B = vSub(S, vMal(v, zzOhne0(-2, 2)));
    } else { v = zufallsVektor(2, 1); B = zufallsVektor(3, 1); }
    if (!klein(A) || !klein(B) || !klein(v)) continue;
    const L = lageGG(A, u, B, v);
    if (L.art === f) return { A, u, B, v, art: f, L };
  }
  return null;
}

/* fall: "schneidend" | "parallel" | "enthalten" */
export function neueLageGE(fall) {
  for (let versuch = 0; versuch < 2000; versuch++) {
    const f = fall || wahl(["schneidend", "parallel", "enthalten"]);
    const nv = zufallsVektor(2, 1);
    let A, u, d;
    if (f === "schneidend") {
      u = zufallsVektor(2, 1);
      if (skalar(u, nv) === 0) continue;
      const S = zufallsVektor(3, 1);
      A = vSub(S, vMal(u, zzOhne0(-2, 2)));
      d = skalar(nv, S);
    } else {
      const w = zufallsVektor(2, 1);
      let u0 = kreuz(nv, w);
      if (u0.every((x) => x === 0)) continue;
      const g = u0.reduce((a, b) => ggT(a, b), 0) || 1;
      u = u0.map((x) => x / g);
      A = zufallsVektor(3, 1);
      d = skalar(nv, A) + (f === "enthalten" ? 0 : wahl([-3, -2, -1, 1, 2, 3]));
    }
    if (!klein(A) || !klein(u, 6)) continue;
    const L = lageGE(A, u, nv, d);
    if (L.art === f) return { A, u, n: nv, d, art: f, L };
  }
  return null;
}

export function neuePunktprobe() {
  for (;;) {
    const A = zufallsVektor(3, 1), u = zufallsVektor(2, 1);
    const t0 = zzOhne0(-3, 3);
    const auf = Math.random() < 0.5;
    let P = vAdd(A, vMal(u, t0));
    if (!auf) { const r = zz(0, 2); P = P.map((x, i) => (i === r ? x + zzOhne0(-2, 2) : x)); }
    const pp = punktprobe(A, u, P);
    if (pp.ok === auf && klein(P, 10)) return { A, u, P, auf, t0, pp };
  }
}

/* ---------- Skalarprodukt und Winkel ---------- */

/* Zwei Vektoren; mit Wahrscheinlichkeit pOrtho rechtwinklig */
export function neuesVektorPaar(pOrtho = 0.2) {
  for (;;) {
    const a = zufallsVektor(4, 1);
    let b;
    if (Math.random() < pOrtho) {
      const w = zufallsVektor(3, 1);
      const k0 = kreuz(a, w);
      if (k0.every((x) => x === 0)) continue;
      const g = k0.reduce((x, y) => ggT(x, y), 0) || 1;
      b = k0.map((x) => x / g);
    } else b = zufallsVektor(4, 1);
    if (b.every((x) => x === 0) || !klein(b, 7)) continue;
    return { a, b };
  }
}
