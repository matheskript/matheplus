/* ======================================================================
   vekAufgaben4.js – Aufgabentypen zu Kapitel VI des Kurses „Vektoren,
   Geraden und Ebenen“: Hessesche Normalenform und Abstand Punkt–Ebene,
   Abstand Punkt–Gerade (Lotfußpunkt), Abstand windschiefer Geraden,
   Schnittwinkel, Spiegelungen, Training VI (Präfix „abst“) sowie das
   Abitur-Training (Präfix „abi“). Buchseiten 49, 51, 53, 55, 57, 58, 59, 60.
   Jeder Typ: gen(r, variante) → { text, schritte, weg }
   r = Zufallsquelle (vekKern.zufall). Reine Logik, kein React.
   ====================================================================== */
import { qAbs } from "./rechnen2.js";
import {
  q, qAdd, qSub, qMul, qDiv, qNeg, qNum, qGleich, qNull, ggT, ganz, eins, vz, mische, MINUS, Q, zT, dezT,
  zahlS, zahlR, wahlS, listeS, $, vek, zufVek, vAdd, vSub, vSkal, vNeg, vDot, vCross, vNull, vGleich, vNum, vBetrag2,
  mittelpunkt, nach, kollinearFaktor, vKuerzen, vT, pT, kz, malT, summeT, geradeT, koordT, lgsZeilen, ROEM,
  wurzelT, betragT, betragNum, betragWegT, skalarWegT, kreuzWegT, gradAus, gradT, gauss, vektorS, punktS,
  normaleGanzBetrag,
} from "./vekKern.js";

/* ---------- lokale Hilfen ---------- */
const X = ["x_1", "x_2", "x_3"];
const ACHSE = ["$x_1$-Achse", "$x_2$-Achse", "$x_3$-Achse"];
const KOORD_EBENE = ["$x_2x_3$-Ebene", "$x_1x_3$-Ebene", "$x_1x_2$-Ebene"];
const EINHEIT = (k) => [vek(k === 0 ? 1 : 0, k === 1 ? 1 : 0, k === 2 ? 1 : 0)][0];
const zufPunkt = (r, lo = -4, hi = 5) => vek(ganz(r, lo, hi), ganz(r, lo, hi), ganz(r, lo, hi));
const istGanz = (b) => Q(b).n === 1;
const klein = (v, m = 9) => v.every((x) => Math.abs(qNum(Q(x))) <= m);
/* „a + b·t“ bzw. „a − t“ (Konstante zuerst, ohne + −, ohne 0) */
function affT(a, b, v = "t") {
  const A = Q(a), B = Q(b);
  if (B.z === 0) return zT(A);
  const bt = summeT([[B, v]]);
  if (A.z === 0) return bt;
  return `${zT(A)} ${B.z < 0 ? MINUS : "+"} ${summeT([[qAbs(B), v]])}`;
}
/* „p + t·u“ eingesetzt: t = 0 → nur p, t = ±1 ohne Faktor, Null-Stützvektor weggelassen */
function stuetzPlusT(p, t, u) {
  const T = Q(t);
  if (T.z === 0) return vT(p);
  const glied = malT(qAbs(T), vT(u));
  if (vNull(p)) return (T.z < 0 ? MINUS : "") + glied;
  return `${vT(p)} ${T.z < 0 ? MINUS : "+"} ${glied}`;
}
/* Zahl in Klammern nur, wenn negativ */
const kzn = (a) => (Q(a).z < 0 ? `(${zT(a)})` : zT(a));
/* Koordinatenform ohne Namen */
const kf = (n, d) => koordT(n, d, { name: "" });
/* Gerade P + t·u in n·x = d eingesetzt (Glieder in Klammern) */
function geradeInEbeneT(n, p, u, v = "t") {
  const teile = n.map((k, i) => {
    const inner = affT(p[i], u[i], v);
    if (inner === "0") return [0, "0"];
    const tex = inner.includes(" ") || inner.startsWith(MINUS) ? `(${inner})` : inner;
    return [k, tex];
  });
  return summeT(teile);
}
/* Betrag eines Vektors als ganze Zahl oder null */
function betragGanz(v) {
  const b2 = vBetrag2(v);
  if (b2.n !== 1) return null;
  const w = Math.round(Math.sqrt(b2.z));
  return w * w === b2.z ? w : null;
}
/* √(z/n) vereinfacht: { tex, num } – z. B. √(9/3) → √3, √(64/3) → 8√3/3, √(4/9) → 2/3 */
function sqrtQ(b) {
  const B = Q(b);
  const zn = Math.abs(B.z) * B.n;
  let a = 1, rest = zn;
  for (let p = 2; p * p <= rest; p++) while (rest % (p * p) === 0) { a *= p; rest /= p * p; }
  const g = ggT(a, B.n) || 1;
  const zz = a / g, nn = B.n / g;
  const wz = zn === 0 ? "0" : rest === 1 ? `${zz}` : zz === 1 ? `\\sqrt{${rest}}` : `${zz}\\sqrt{${rest}}`;
  return { tex: nn === 1 || zn === 0 ? wz : `\\frac{${wz}}{${nn}}`, num: Math.sqrt(Math.abs(qNum(B))) };
}
/* x/√m vereinfacht (x ≥ 0 ganz, m ganz) */
const quotWurzel = (x, m) => sqrtQ(q(x * x, m));
/* Bruch |w|/b als Abstandstext: ganz, Bruch oder mit Wurzel (b = betragT(n)) */
function abstandT(w, n) {
  const bg = betragGanz(n);
  const aw = Math.abs(qNum(Q(w)));
  if (bg !== null) return { tex: zT(q(Math.round(aw * Q(w).n), bg * Q(w).n)), num: aw / bg };
  const s = quotWurzel(aw, qNum(vBetrag2(n)));
  return { tex: s.tex, num: s.num };
}
/* Summe von Zahlen ohne + −, ohne 0-Glieder: „6 − 5 − 4 − 3“ */
function zahlenSummeT(werte) {
  let out = "";
  for (const w of werte) {
    const b = Q(w);
    if (b.z === 0) continue;
    const abs = zT(qAbs(b));
    out = out ? `${out} ${b.z < 0 ? MINUS : "+"} ${abs}` : (b.z < 0 ? MINUS : "") + abs;
  }
  return out || "0";
}
/* Linke Seite der HNF ohne Nenner: „2x_1 − x_2 + 2x_3 − 4“ (d nach links gebracht) */
const hnfLinksT = (n, d) => `${summeT(n.map((k, i) => [k, X[i]]))}${plusK(qNeg(Q(d)))}`;
/* Konstante anhängen: „ + 3“, „ − 3“, „“ bei 0 */
const plusK = (k) => { const b = Q(k); return b.z === 0 ? "" : ` ${b.z < 0 ? MINUS : "+"} ${zT(qAbs(b))}`; };
/* Zähler der HNF mit eingesetztem Punkt, Produkte ausgerechnet: „6 − 5 − 4 − 3“ */
const hnfZaehlerT = (n, P, d) => zahlenSummeT([...n.map((k, i) => qMul(Q(k), Q(P[i]))), qNeg(Q(d))]);
const hnfWert = (n, P, d) => qSub(vDot(n, P), Q(d));
/* Rechenweg-Zeile zur HNF: d(P, E) = |…|/|n| = |w|/b = Ergebnis */
function hnfWegT(n, d, P, name = "P", eName = "E") {
  const w = hnfWert(n, P, d);
  const a = abstandT(w, n);
  const mitte = `\\frac{|${zT(w)}|}{${betragT(n)}}`;
  const ende = a.tex === mitte ? "" : ` = ${a.tex}`;
  return `$d(${name}, ${eName}) = \\frac{|${hnfZaehlerT(n, P, d)}|}{${betragT(n)}} = ${mitte}${ende}$`;
}
/* Zufällige Ebene mit ganzzahligem Normalenbetrag und kleinem d */
function ebeneGanz(r, { dMax = 12, ohneNull = false } = {}) {
  for (let i = 0; i < 100; i++) {
    const n = normaleGanzBetrag(r);
    if (ohneNull && n.some(qNull)) continue;
    if (n.filter(qNull).length >= 2) continue;
    const d = q(ganz(r, -dMax, dMax));
    return { n, d, b: betragGanz(n) };
  }
  return { n: vek(1, 2, 2), d: q(4), b: 3 };
}
/* Punkt mit möglichst „glattem“ HNF-Wert zur Ebene (w = n·P − d Vielfaches von |n|) */
function punktZuEbene(r, n, d, { glatt = 0.8, lo = -4, hi = 6, nichtDrin = true } = {}) {
  const b = betragGanz(n) || 1;
  let P = zufPunkt(r, lo, hi);
  for (let i = 0; i < 300; i++) {
    P = zufPunkt(r, lo, hi);
    const w = hnfWert(n, P, d);
    if (nichtDrin && qNull(w)) continue;
    if (glatt > r() && w.z % b !== 0) continue;
    if (Math.abs(w.z) > 40) continue;
    return P;
  }
  return P;
}
/* Lot von P auf E: t = (d − n·p)/|n|², F = P + t·n */
function lotEbene(n, d, P) {
  const np = vDot(n, P), nn = vBetrag2(n);
  const t = qDiv(qSub(Q(d), np), nn);
  const F = vAdd(P, vSkal(t, n));
  return { t, F, np, nn, PF: vSub(F, P) };
}
/* Rechenweg Lotfußpunktverfahren */
function lotEbeneWeg(n, d, P, { name = "P", mitAbstand = true } = {}) {
  const L = lotEbene(n, d, P);
  const b = betragT(n);
  const dist = abstandT(qMul(L.t, vBetrag2(n)), n);
  const zeilen = [
    `Lotgerade: $l: \\vec{x} = ${vT(P)} + t \\cdot ${vT(n)}$`,
    `In $E$ einsetzen: $${geradeInEbeneT(n, P, n)} = ${zT(d)}$, also $${affT(L.np, L.nn)} = ${zT(d)}$ und $t = ${zT(L.t)}$`,
    `Lotfußpunkt: $\\vec{f} = ${stuetzPlusT(P, L.t, n)} = ${vT(L.F)}$, also $${pT(L.F, "F")}$`,
  ];
  const at = qAbs(L.t);
  const prod = at.z === at.n ? b : `${zT(at)} \\cdot ${b}`;
  if (mitAbstand) zeilen.push(`Abstand: $d(${name}, E) = |\\vec{${name}F}| = |t| \\cdot |\\vec{n}| = ${prod}${dist.tex === prod ? "" : ` = ${dist.tex}`}$`);
  return { ...L, zeilen, dist };
}
/* Lot von P auf g: x = p + t·u – Weg 2 (Skalarprodukt) */
function lotGerade(P, p, u) {
  const PX0 = vSub(p, P);                       // PX_t = (p − P) + t·u
  const c0 = vDot(PX0, u), c1 = vBetrag2(u);
  const t = qDiv(qNeg(c0), c1);
  const F = vAdd(p, vSkal(t, u));
  const PF = vSub(F, P);
  return { t, F, PF, PX0, c0, c1, dist: { tex: betragT(PF), num: betragNum(PF) } };
}
function lotGeradeWeg(P, p, u, { name = "P", param = "t", gName = "g" } = {}) {
  const L = lotGerade(P, p, u);
  const PXt = `\\spalte{${affT(L.PX0[0], u[0], param)}}{${affT(L.PX0[1], u[1], param)}}{${affT(L.PX0[2], u[2], param)}}`;
  const zeilen = [
    `Allgemeiner Punkt von $${gName}$: $X_${param}$ mit $\\vec{${name}X_${param}} = ${PXt}$`,
    `$\\vec{${name}X_${param}} \\cdot \\vec{u} = ${affT(L.c0, L.c1, param)} = 0$, also $${param} = ${zT(L.t)}$`,
    `Lotfußpunkt: $\\vec{f} = ${stuetzPlusT(p, L.t, u)} = ${vT(L.F)}$, also $${pT(L.F, "F")}$`,
    `Abstand: $d(${name}, ${gName}) = |\\vec{${name}F}| = ${betragWegT(L.PF)}$`,
  ];
  return { ...L, zeilen };
}
/* Orthogonale Paare mit ganzzahligen Beträgen (gemeinsame Permutation und Vorzeichen bleiben orthogonal) */
const ORTHO_PAARE = [
  [[1, 2, 2], [2, 1, -2]], [[1, 2, 2], [2, -2, 1]], [[2, 1, -2], [2, -2, 1]],
  [[2, 3, 6], [3, -6, 2]], [[2, 3, 6], [6, 2, -3]], [[3, -6, 2], [6, 2, -3]],
  [[1, 4, 8], [4, 7, -4]], [[1, 4, 8], [8, -4, 1]], [[3, 4, 0], [4, -3, 0]], [[3, 4, 0], [0, 0, 1]],
  [[1, 2, 2], [0, 1, -1]], [[0, 3, 4], [1, 0, 0]], [[2, 2, 1], [1, -1, 0]],
];
function orthoPaar(r, { ganz: nurGanz = true } = {}) {
  for (let i = 0; i < 100; i++) {
    const [a, b] = eins(r, ORTHO_PAARE);
    const perm = mische(r, [0, 1, 2]);
    const s = [vz(r), vz(r), vz(r)];
    const u = perm.map((k, i2) => q(a[k] * s[i2])), w = perm.map((k, i2) => q(b[k] * s[i2]));
    const paar = r() < 0.5 ? [u, w] : [w, u];
    if (nurGanz && (betragGanz(paar[0]) === null || betragGanz(paar[1]) === null)) continue;
    return paar;
  }
  return [vek(1, 2, 2), vek(2, 1, -2)];
}
/* Winkel aus |cos| bzw. |sin| */
const winkelAus = (sp, a, b, art = "cos") => {
  const w = Math.abs(qNum(sp)) / (betragNum(a) * betragNum(b));
  const c = Math.max(0, Math.min(1, w));
  const grad = art === "cos" ? gradAus(c) : Math.round(Math.asin(c) * 180 / Math.PI * 10) / 10;
  return { wert: c, grad };
};
/* Bruch |sp|/(|a|·|b|) als TeX, gekürzt wenn beide Beträge ganz */
function quotBetragT(sp, a, b) {
  const ba = betragGanz(a), bb = betragGanz(b);
  const asp = qAbs(Q(sp));
  const roh = `\\frac{|${zT(sp)}|}{${betragT(a)} \\cdot ${betragT(b)}}`;
  if (ba !== null && bb !== null) {
    const w = qDiv(asp, q(ba * bb));
    return `${roh} = ${zT(w)}`;
  }
  if (qNull(asp)) return `${roh} = 0`;
  const s = sqrtQ(qDiv(qMul(asp, asp), qMul(vBetrag2(a), vBetrag2(b))));
  return `${roh} = ${s.tex}`;
}
const JA_NEIN = (ja, nein) => [["ja", ja], ["nein", nein]];
/* Schrittfolge Winkel: Skalarprodukt, Beträge, Winkel */
function winkelSchritte(a, b, { art = "cos", na = "\\vec{u}", nb = "\\vec{v}", id = "", name = "\\alpha" } = {}) {
  const sp = vDot(a, b);
  const w = winkelAus(sp, a, b, art);
  const fn = art === "cos" ? "\\cos" : "\\sin";
  return {
    w, sp,
    schritte: [
      zahlS(`sp${id}`, "Skalarprodukt", `Berechne $${na} \\cdot ${nb}$.`, `$${na} \\cdot ${nb} =$`, sp),
      zahlR(`ba${id}`, "Betrag", `Berechne $|${na}|$ (auf 2 Stellen, falls nicht ganz).`, `$|${na}| =$`, Math.round(betragNum(a) * 100) / 100, { tol: 0.011, wertText: `$${betragT(a)}$` }),
      zahlR(`bb${id}`, "Betrag", `Berechne $|${nb}|$.`, `$|${nb}| =$`, Math.round(betragNum(b) * 100) / 100, { tol: 0.011, wertText: `$${betragT(b)}$` }),
      zahlR(`w${id}`, "Winkel", `$${fn} ${name} = \\frac{|${na} \\cdot ${nb}|}{|${na}| \\cdot |${nb}|}$ – berechne $${name}$ in Grad (eine Nachkommastelle).`, `$${name} =$`, w.grad, {
        tol: 0.11, einheit: "°", wertText: `$${gradT(w.grad)}$`,
        fehler: art === "sin" ? [{ wert: Math.round((90 - w.grad) * 10) / 10, text: "Du hast den Kosinus genommen: Das ist der Winkel zum Normalenvektor. Bei Gerade–Ebene gehört der Sinus hin." }] : [],
      }),
    ],
    weg: [
      `$${na} \\cdot ${nb} = ${skalarWegT(a, b)}$`,
      `$|${na}| = ${betragWegT(a)}$, $|${nb}| = ${betragWegT(b)}$`,
      `$${fn} ${name} = ${quotBetragT(sp, a, b)} \\approx ${dezT(Math.round(w.wert * 10000) / 10000)}$, also $${name} \\approx ${gradT(w.grad)}$`,
    ],
  };
}
/* Vektor, dessen Richtung nicht in einer Koordinatenebene liegt und kleine Einträge hat */
const zufRichtung = (r, lo = -3, hi = 3) => zufVek(r, lo, hi);
/* Richtungsvektor senkrecht zu n mit kleinen Einträgen */
function senkrechtZu(r, n, { lo = -3, hi = 3 } = {}) {
  for (let i = 0; i < 200; i++) { const w = zufVek(r, lo, hi); if (qNull(vDot(n, w))) return w; }
  const w = vCross(n, n.some((x) => qNull(x)) ? EINHEIT(n.findIndex(qNull)) : vek(1, 0, 0));
  return vKuerzen(w);
}
/* Punkt der Ebene mit kleinen ganzen Koordinaten */
function punktInEbene(r, n, d, { lo = -4, hi = 5 } = {}) {
  for (let i = 0; i < 300; i++) {
    const P = zufPunkt(r, lo, hi);
    const k = [2, 1, 0].find((j) => !qNull(n[j]));
    const rest = qSub(Q(d), qSub(vDot(n, P), qMul(n[k], P[k])));
    const x = qDiv(rest, n[k]);
    if (x.n !== 1 || Math.abs(x.z) > 7) continue;
    P[k] = x;
    return P;
  }
  return null;
}
/* Windschiefe Geraden mit gemeinsamem Lot: F ∈ g, G = F + k·n ∈ h, |n| ganz wenn möglich */
function windschief(r, { ganzBetrag = true, lo = -2, hi = 2 } = {}) {
  for (let i = 0; i < 600; i++) {
    const u = zufVek(r, lo, hi), v = zufVek(r, lo, hi);
    if (kollinearFaktor(u, v) !== null || u.filter(qNull).length >= 2 || v.filter(qNull).length >= 2) continue;
    const n = vCross(u, v);
    if (!klein(n, 9)) continue;
    const bg = betragGanz(n);
    if (ganzBetrag && bg === null) continue;
    if (!ganzBetrag && bg !== null) continue;
    const F = zufPunkt(r, -3, 4);
    const k = eins(r, [1, 1, -1, 2, -2]);
    const G = vAdd(F, vSkal(k, n));
    const r0 = ganz(r, -2, 2), s0 = ganz(r, -2, 2);
    const p = vSub(F, vSkal(r0, u)), qv = vSub(G, vSkal(s0, v));
    if (!klein(p, 7) || !klein(qv, 7) || !klein(G, 9)) continue;
    const d = abstandT(qMul(q(k), vBetrag2(n)), n);
    return { p, u, q: qv, v, n, F, G, r0, s0, k, d };
  }
  return { p: vek(0, 0, 0), u: vek(1, 0, 1), q: vek(1, -1, -3), v: vek(2, 2, 1), n: vek(-2, 1, 2), F: vek(-1, 0, -1), G: vek(1, -1, -3), r0: -1, s0: 0, k: 1, d: { tex: "3", num: 3 } };
}
/* Rechenweg Abstand windschiefer Geraden mit der Formel */
function windschiefWeg(W) {
  const diff = vSub(W.q, W.p);
  const sp = vDot(diff, W.n);
  return [
    `$\\vec{n} = \\vec{u} \\times \\vec{v} = ${kreuzWegT(W.u, W.v)}$, $|\\vec{n}| = ${betragWegT(W.n)}$`,
    `$\\vec{q} ${MINUS} \\vec{p} = ${vT(W.q)} ${MINUS} ${vT(W.p)} = ${vT(diff)}$`,
    `$d(g, h) = \\frac{|(\\vec{q} ${MINUS} \\vec{p}) \\cdot \\vec{n}|}{|\\vec{n}|} = \\frac{|${skalarWegT(diff, W.n).split(" = ")[0]}|}{${betragT(W.n)}} = \\frac{|${zT(sp)}|}{${betragT(W.n)}}${W.d.tex === `\\frac{|${zT(sp)}|}{${betragT(W.n)}}` ? "" : ` = ${W.d.tex}`}$`,
  ];
}
/* Lotfußpunkte des gemeinsamen Lots über das LGS FG·u = 0, FG·v = 0 */
function lotfusspunkte(W) {
  const diff = vSub(W.q, W.p);
  // FG = diff + s·v − r·u;  FG·u = diff·u + s v·u − r u·u = 0;  FG·v = diff·v + s v·v − r u·v = 0
  const uu = vBetrag2(W.u), uv = vDot(W.u, W.v), vv = vBetrag2(W.v);
  const A = [[qNeg(uu), uv], [qNeg(uv), vv]];
  const b = [qNeg(vDot(diff, W.u)), qNeg(vDot(diff, W.v))];
  const g = gauss(A, b, ["r", "s"]);
  const rr = g.x[0], ss = g.x[1];
  const F = vAdd(W.p, vSkal(rr, W.u)), G = vAdd(W.q, vSkal(ss, W.v));
  const FGt = `\\spalte{${affT2(diff[0], W.v[0], W.u[0])}}{${affT2(diff[1], W.v[1], W.u[1])}}{${affT2(diff[2], W.v[2], W.u[2])}}`;
  const zeilen = [
    `Gemeinsames Lot: $F_r \\in g$, $G_s \\in h$ mit $\\vec{F_rG_s} = ${FGt}$ muss auf $\\vec{u}$ und $\\vec{v}$ senkrecht stehen.`,
    ...lgsZeilen(A, b, ["r", "s"]).map((z, i) => `${z.slice(0, -1)} \\quad (\\vec{F_rG_s} \\cdot ${i === 0 ? "\\vec{u}" : "\\vec{v}"} = 0)$`),
    `Lösung: $r = ${zT(rr)}$, $s = ${zT(ss)}$: $${pT(F, "F")}$, $${pT(G, "G")}$, Probe $|\\vec{FG}| = ${betragWegT(vSub(G, F))}$`,
  ];
  return { r: rr, s: ss, F, G, zeilen };
}
/* „c + b·s − a·r“ */
function affT2(c, b, a) {
  const teile = [];
  const C = Q(c), B = Q(b), A = Q(a);
  let out = C.z === 0 ? "" : zT(C);
  for (const [k, v] of [[B, "s"], [qNeg(A), "r"]]) {
    if (k.z === 0) continue;
    const g = summeT([[qAbs(k), v]]);
    out = out ? `${out} ${k.z < 0 ? MINUS : "+"} ${g}` : (k.z < 0 ? MINUS : "") + g;
  }
  return out || "0";
}
/* Koordinatengleichung n·x = d ganzzahlig kürzen (nur wenn der ggT auch d teilt), erster Eintrag positiv */
function kuerzeGl(n, d) {
  const D = Q(d);
  let g = n.reduce((m, x) => ggT(m, Math.abs(Q(x).z)), 0) || 1;
  if (D.n !== 1 || D.z % g !== 0) g = 1;
  let out = n.map((x) => q(Q(x).z / g)), dd = q(D.z / g);
  const erst = out.find((x) => !qNull(x));
  if (erst && erst.z < 0) { out = vNeg(out); dd = qNeg(dd); }
  return [out, dd];
}
/* Spiegelung p' = 2m − p */
const spiegel = (P, M) => vSub(vSkal(2, M), P);
const spiegelWegT = (P, M, name = "P'") => `$\\vec{p}\\,' = 2\\vec{m} ${MINUS} \\vec{p} = 2 \\cdot ${vT(M)} ${MINUS} ${vT(P)} = ${vT(spiegel(P, M))}$, also $${pT(spiegel(P, M), name)}$`;
/* Punkt zu Punkt mit Lotfußpunkt und ganzem Spiegelpunkt an E */
function punktMitLot(r, n, d, { lo = -3, hi = 4, ks = [1, -1, 2, -2] } = {}) {
  for (let i = 0; i < 200; i++) {
    const F = punktInEbene(r, n, d, { lo, hi });
    if (!F) continue;
    const k = eins(r, ks);
    const P = vAdd(F, vSkal(k, n));
    if (klein(P, 9)) return { P, F, k };
  }
  return { P: vek(4, 4, 5), F: vek(2, 0, 1), k: 1 };
}

/* ===================== Seite 49: HNF und Abstand Punkt–Ebene ===================== */
const S49 = {
  abstHnf: {
    titel: "Abstand Punkt–Ebene mit der HNF",
    gen(r, variante) {
      // variante "zwei": zwei Punkte und die Frage nach der Seite (58-T1)
      const { n, d, b } = ebeneGanz(r);
      const zwei = variante === "zwei";
      const P = punktZuEbene(r, n, d, { glatt: zwei ? 1 : 0.6 });
      let Q2 = null;
      if (zwei) do { Q2 = r() < 0.5 ? vek(0, 0, 0) : punktZuEbene(r, n, d, { glatt: 1 }); } while (vGleich(Q2, P));
      const w = hnfWert(n, P, d), a = abstandT(w, n);
      const schritte = [
        zahlS("b", "Betrag des Normalenvektors", "Lies $\\vec{n}$ aus der Koordinatenform ab und berechne $|\\vec{n}|$.", "$|\\vec{n}| =$", b),
        zahlS("z", "Einsetzen", `Setze $${pT(P, "P")}$ in die linke Seite von $${hnfLinksT(n, d)}$ ein (ohne Betrag).`, `$\\vec{n} \\cdot \\vec{p} ${MINUS} d =$`, w, {
          hinweis: "Erst die rechte Seite nach links bringen, dann die Koordinaten einsetzen.",
          fehler: [{ wert: qNum(vDot(n, P)), text: `Du hast $d = ${zT(d)}$ nicht nach links gebracht: In der HNF steht $\\ldots${plusK(qNeg(d))}$.` }],
        }),
        zahlR("d", "Abstand", "Betrag nehmen und durch $|\\vec{n}|$ teilen.", "$d(P, E) =$", Math.round(a.num * 1000) / 1000, {
          tol: 0.002, wertText: `$${a.tex}$`,
          fehler: [{ wert: Math.abs(qNum(w)), text: "Du hast nicht durch $|\\vec{n}|$ geteilt – so ist der Abstand $|\\vec{n}|$-mal zu groß." }],
        }),
      ];
      const weg = [
        `$\\vec{n} = ${vT(n)}$, $|\\vec{n}| = ${betragWegT(n)}$. HNF: $\\frac{${hnfLinksT(n, d)}}{${b}} = 0$`,
        hnfWegT(n, d, P),
      ];
      if (!zwei) return { text: `Berechne den Abstand des Punktes $${pT(P, "P")}$ von der Ebene $${koordT(n, d)}$.`, schritte, weg };
      const w2 = hnfWert(n, Q2, d), a2 = abstandT(w2, n);
      const qName = vNull(Q2) ? "O" : "Q";
      const selbe = Math.sign(qNum(w)) === Math.sign(qNum(w2));
      schritte.push(zahlR("d2", `Abstand von ${qName}`, `Setze $${pT(Q2, qName)}$ ein und berechne $d(${qName}, E)$.`, `$d(${qName}, E) =$`, Math.round(a2.num * 1000) / 1000, { tol: 0.002, wertText: `$${a2.tex}$` }));
      schritte.push(wahlS("seite", "Seite", `Liegen $P$ und $${qName}$ auf derselben Seite von $E$?`, JA_NEIN("ja, auf derselben Seite", "nein, auf verschiedenen Seiten"), selbe ? "ja" : "nein", { hinweis: "Vergleiche die Vorzeichen der HNF-Werte (ohne Betrag)." }));
      weg.push(hnfWegT(n, d, Q2, qName));
      weg.push(`Orientierte Werte (ohne Betrag): $${zT(w)}$ und $${zT(w2)}$ – ${selbe ? "gleiches Vorzeichen, also dieselbe Seite" : "verschiedene Vorzeichen, also verschiedene Seiten"} von $E$.`);
      return { text: `Berechne den Abstand von $${pT(P, "P")}$ und ${vNull(Q2) ? "vom Ursprung $O$" : `von $${pT(Q2, "Q")}$`} zur Ebene $${koordT(n, d)}$. Liegen beide Punkte auf derselben Seite von $E$?`, schritte, weg };
    },
  },

  abstLotEbene: {
    titel: "Lotfußpunkt und Abstand Punkt–Ebene",
    gen(r, variante) {
      // variante "drohne": Sachkontext (49-5)
      const drohne = variante === "drohne";
      let n, d, P, F, k;
      if (drohne) {
        for (let i = 0; i < 300; i++) {
          n = normaleGanzBetrag(r);
          if (n.filter(qNull).length >= 2) continue;
          F = zufPunkt(r, 0, 6); k = eins(r, [1, 1, 2]);
          if (qNum(n[2]) < 0) n = vNeg(n);
          P = vAdd(F, vSkal(k, n)); d = vDot(n, F);
          if (P.some((x) => x.z < 0) || !klein(P, 14) || P[2].z <= F[2].z) continue;
          break;
        }
      } else {
        ({ n, d } = ebeneGanz(r));
        ({ P, F, k } = punktMitLot(r, n, d, { ks: [1, -1, 2, -2, 3] }));
      }
      const L = lotEbeneWeg(n, d, P);
      const text = drohne
        ? `Eine Drohne schwebt im Punkt $${pT(P, "P")}$ über einer Dachfläche in der Ebene $${koordT(n, d)}$ (Einheit 1 m). Wie weit ist sie vom Dach entfernt? Über welchem Punkt des Dachs steht sie, wenn sie senkrecht zum Dach landet?`
        : `Bestimme den Lotfußpunkt $F$ und den Abstand $d(P, E)$ für $${pT(P, "P")}$ und $${koordT(n, d)}$.`;
      return {
        text,
        schritte: [
          zahlS("t", "Lotgerade schneiden", `Stelle die Lotgerade $\\vec{x} = \\vec{p} + t \\cdot \\vec{n}$ auf, setze sie in $E$ ein und löse nach $t$ auf.`, "$t =$", L.t, { hinweis: `$${affT(L.np, L.nn)} = ${zT(d)}$` }),
          punktS("F", drohne ? "Landepunkt" : "Lotfußpunkt", "Setze $t$ in die Lotgerade ein.", "$F =$", L.F),
          zahlR("d", "Abstand", "$d = |t| \\cdot |\\vec{n}|$ oder $|\\vec{PF}|$ berechnen.", "$d(P, E) =$", Math.round(L.dist.num * 1000) / 1000, { tol: 0.002, einheit: drohne ? "m" : undefined, wertText: `$${L.dist.tex}$`, fehler: [{ wert: Math.abs(qNum(L.t)), text: "Das ist nur $|t|$. Der Abstand ist $|t| \\cdot |\\vec{n}|$, denn $\\vec{PF} = t \\cdot \\vec{n}$." }] }),
        ],
        weg: [...L.zeilen, ...(drohne ? [`Die Drohne ist $${L.dist.tex}$ m vom Dach entfernt und landet im Punkt $${pT(L.F, "F")}$.`] : [])],
      };
    },
  },

  abstEbenenParallel: {
    titel: "Abstand paralleler Ebenen",
    gen(r, variante) {
      // variante "vielfach": zweite Gleichung ist ein Vielfaches (49-3 b)
      const vielfach = variante === "vielfach" || (variante === undefined && r() < 0.4);
      const { n, d, b } = ebeneGanz(r);
      let d2;
      do d2 = q(ganz(r, -12, 12)); while (qGleich(d2, d) || (r() < 0.6 && (d2.z - d.z) % b !== 0));
      const k = vielfach ? eins(r, [-2, 2, -1, 3, -3]) : 1;
      const n2 = vSkal(k, n), d2k = qMul(q(k), d2);
      const a = abstandT(qSub(d2, d), n);
      const Qp = n.map((x, i) => (i === n.findIndex((y) => !qNull(y)) ? qDiv(d2, x) : q(0)));
      return {
        text: `Zeige, dass die Ebenen $${koordT(n, d, { name: "E_1" })}$ und $${koordT(n2, d2k, { name: "E_2" })}$ parallel sind, und berechne ihren Abstand.`,
        schritte: [
          wahlS("par", "Parallel?", "Vergleiche die Normalenvektoren.", [["ja", "ja – die Normalenvektoren sind Vielfache voneinander"], ["nein", "nein – die Normalenvektoren sind nicht kollinear"]], "ja", { hinweis: vielfach ? `Teile die zweite Gleichung durch $${zT(q(k))}$.` : "Beide Gleichungen haben denselben Normalenvektor." }),
          zahlS("d2", "Gleiche Normalenvektoren", `Bringe $E_2$ auf die Form $${kf(n, q(0)).replace(" = 0", "")} = d_2$. Welche Zahl steht rechts?`, "$d_2 =$", d2, { fehler: vielfach ? [{ wert: qNum(d2k), text: `Erst die zweite Gleichung durch $${zT(q(k))}$ teilen, dann erst vergleichen.` }] : [] }),
          zahlR("d", "Abstand", "Setze einen Punkt von $E_2$ in die HNF von $E_1$ ein – oder kurz: $d = \\frac{|d_2 - d_1|}{|\\vec{n}|}$.", "$d(E_1, E_2) =$", Math.round(a.num * 1000) / 1000, { tol: 0.002, wertText: `$${a.tex}$`, fehler: [{ wert: Math.abs(qNum(qSub(d2, d))), text: "Durch $|\\vec{n}|$ teilen nicht vergessen." }] }),
        ],
        weg: [
          vielfach ? `$E_2$ durch $${zT(q(k))}$ geteilt: $${kf(n, d2)}$ – gleicher Normalenvektor $\\vec{n} = ${vT(n)}$ wie $E_1$, also $E_1 \\parallel E_2$.` : `Gleicher Normalenvektor $\\vec{n} = ${vT(n)}$, also $E_1 \\parallel E_2$. $|\\vec{n}| = ${betragWegT(n)}$`,
          `Ein Punkt von $E_2$ genügt: $${pT(Qp, "Q")} \\in E_2$. ${hnfWegT(n, d, Qp, "Q", "E_1").replace("$d(Q, E_1)", "$d(E_1, E_2) = d(Q, E_1)")}`,
        ],
      };
    },
  },

  abstGeradeEbene: {
    titel: "Abstand einer parallelen Geraden zur Ebene",
    gen(r) {
      let n, d, A, u, w;
      do {
        ({ n, d } = ebeneGanz(r));
        u = senkrechtZu(r, n);
        A = punktZuEbene(r, n, d, { glatt: 0.8 });
        w = hnfWert(n, A, d);
      } while (qNull(w) || !klein(u, 4));
      const a = abstandT(w, n);
      return {
        text: `Die Gerade $g$ geht durch $${pT(A, "A")}$ in Richtung $\\vec{u} = ${vT(u)}$. Zeige, dass $g$ parallel zur Ebene $${koordT(n, d)}$ ist, und berechne $d(g, E)$.`,
        schritte: [
          zahlS("nu", "Parallelität", "Berechne $\\vec{u} \\cdot \\vec{n}$.", "$\\vec{u} \\cdot \\vec{n} =$", q(0), { hinweis: "Ist es 0, steht $\\vec{u}$ senkrecht auf $\\vec{n}$ – die Gerade ist parallel zu $E$ (oder liegt darin)." }),
          zahlS("z", "Stützpunkt einsetzen", `Setze $A$ in $${hnfLinksT(n, d)}$ ein.`, `$\\vec{n} \\cdot \\vec{a} ${MINUS} d =$`, w, { hinweis: "Ergebnis ungleich 0: $A$ liegt nicht in $E$, also ist $g$ echt parallel." }),
          zahlR("d", "Abstand", "Betrag durch $|\\vec{n}|$ – alle Punkte von $g$ haben denselben Abstand.", "$d(g, E) =$", Math.round(a.num * 1000) / 1000, { tol: 0.002, wertText: `$${a.tex}$` }),
        ],
        weg: [
          `$\\vec{u} \\cdot \\vec{n} = ${skalarWegT(u, n)}$, also $g \\parallel E$. Wegen $${skalarWegT(n, A)} \\ne ${zT(d)}$ liegt $A$ nicht in $E$: echt parallel.`,
          `Alle Punkte von $g$ haben denselben Abstand – Stützpunkt in die HNF: ${hnfWegT(n, d, A, "A").replace("$d(A, E)", "$d(g, E) = d(A, E)")}`,
        ],
      };
    },
  },

  abstAchsenpunkte: {
    titel: "Punkte einer Achse mit gegebenem Abstand",
    gen(r) {
      let n, d, b, k, nk, dist;
      let gefunden = false;
      for (let i = 0; i < 200 && !gefunden; i++) {
        ({ n, b } = ebeneGanz(r));
        k = eins(r, [0, 1, 2].filter((j) => !qNull(n[j])));
        nk = n[k];
        const m = ganz(r, -4, 4);
        d = qMul(nk, q(m));
        const dists = [1, 2, 3, 4, 5, 6].filter((x) => (x * b) % Math.abs(nk.z) === 0);
        if (!dists.length || Math.abs(d.z) > 14) continue;
        dist = eins(r, dists);
        gefunden = true;
      }
      if (!gefunden) { n = vek(1, 2, 2); b = 3; k = 0; nk = n[0]; d = q(4); dist = 3; }
      // |a·nk − d| = dist·b  →  a = (d ± dist·b)/nk
      const a1 = qDiv(qAdd(d, q(dist * b)), nk), a2 = qDiv(qSub(d, q(dist * b)), nk);
      const P = (a) => vek(0, 0, 0).map((x, i) => (i === k ? a : q(0)));
      return {
        text: `Welche Punkte der ${ACHSE[k]} haben von der Ebene $${koordT(n, d)}$ den Abstand $${dist}$?`,
        schritte: [
          zahlS("z", "Ansatz", `Ein Punkt der ${ACHSE[k]} ist $P(${[0, 1, 2].map((i) => (i === k ? "a" : "0")).join(" \\mid ")})$. Setze ihn in die HNF ein: $\\frac{|\\ldots|}{${b}} = ${dist}$. Welcher Zahl muss der Betrag im Zähler gleich sein?`, "$|\\ldots| =$", q(dist * b), { fehler: [{ wert: dist, text: `Erst mit $|\\vec{n}| = ${b}$ multiplizieren: Der Zähler muss $${dist} \\cdot ${b}$ sein.` }] }),
          listeS("a", "Beide Lösungen", `Löse $|${summeT([[nk, "a"]])}${plusK(qNeg(d))}| = ${dist * b}$ – eine Betragsgleichung hat meist zwei Lösungen. Gib beide Werte von $a$ an (mit Semikolon getrennt).`, "$a =$", [qNum(a1), qNum(a2)], { wertText: `$${zT(a1)}$; $${zT(a2)}$` }),
        ],
        weg: [
          `Punkte der ${ACHSE[k]}: $P(${[0, 1, 2].map((i) => (i === k ? "a" : "0")).join(" \\mid ")})$. HNF: $\\frac{|${summeT([[nk, "a"]])}${plusK(qNeg(d))}|}{${b}} = ${dist}$`,
          `$${summeT([[nk, "a"]])}${plusK(qNeg(d))} = \\pm ${dist * b}$, also $${summeT([[nk, "a"]])} = ${zT(qAdd(d, q(dist * b)))}$ oder $${summeT([[nk, "a"]])} = ${zT(qSub(d, q(dist * b)))}$`,
          `$a = ${zT(a1)}$ oder $a = ${zT(a2)}$: die Punkte $${pT(P(a1), "P_1")}$ und $${pT(P(a2), "P_2")}$`,
        ],
      };
    },
  },

  abstParallelEbenen: {
    titel: "Parallele Ebenen mit gegebenem Abstand",
    gen(r) {
      const { n, d, b } = ebeneGanz(r);
      const dist = eins(r, [1, 2, 3, 4, 5]);
      const d1 = qAdd(d, q(dist * b)), d2 = qSub(d, q(dist * b));
      return {
        text: `Bestimme alle Ebenen, die parallel zu $${koordT(n, d)}$ sind und von $E$ den Abstand $${dist}$ haben.`,
        schritte: [
          zahlS("b", "Betrag", "Berechne $|\\vec{n}|$.", "$|\\vec{n}| =$", b),
          listeS("d", "Beide Ebenen", `Parallele Ebenen haben die Form $${kf(n, q(0)).replace(" = 0", "")} = c$. Löse $\\frac{|c${plusK(qNeg(d))}|}{${b}} = ${dist}$ und gib beide Werte von $c$ an (mit Semikolon).`, "$c =$", [qNum(d1), qNum(d2)], { wertText: `$${zT(d1)}$; $${zT(d2)}$` }),
        ],
        weg: [
          `Parallele Ebene: $F: ${kf(n, q(0)).replace(" = 0", "")} = c$ (gleicher Normalenvektor). Punkt von $F$ in die HNF von $E$: $\\frac{|c${plusK(qNeg(d))}|}{${b}} = ${dist}$`,
          `$c${plusK(qNeg(d))} = \\pm ${dist * b}$, also $c = ${zT(d1)}$ oder $c = ${zT(d2)}$`,
          `$F_1: ${kf(n, d1)}$ und $F_2: ${kf(n, d2)}$`,
        ],
      };
    },
  },

  abstWinkelhalbierend: {
    titel: "Punkte mit gleichem Abstand zu zwei Ebenen",
    gen(r) {
      let n1, n2, d1, d2, b;
      do { [n1, n2] = orthoPaar(r); d1 = q(ganz(r, -6, 6)); d2 = q(ganz(r, -6, 6)); b = betragGanz(n1); } while (b !== betragGanz(n2));
      const nA = vSub(n1, n2), dA = qSub(d1, d2), nB = vAdd(n1, n2), dB = qAdd(d1, d2);
      const [kA, dAk] = kuerzeGl(nA, dA), [kB, dBk] = kuerzeGl(nB, dB);
      return {
        text: `Welche Punkte sind von $${koordT(n1, d1, { name: "E_1" })}$ und $${koordT(n2, d2, { name: "E_2" })}$ gleich weit entfernt? Gib beide Ebenen in Koordinatenform an (ganzzahlig, so weit wie möglich gekürzt).`,
        schritte: [
          zahlS("b", "Beträge", "Berechne $|\\vec{n}_1|$ und $|\\vec{n}_2|$ – sie sind hier gleich.", "$|\\vec{n}_1| = |\\vec{n}_2| =$", b),
          vektorS("nA", "Fall 1: gleiches Vorzeichen", "Setze die beiden HNF-Zähler gleich und sortiere: Welcher Normalenvektor entsteht (gekürzt)?", "$\\vec{n} =$", kA, { hinweis: "Aus $A = B$ folgt $A - B = 0$." }),
          zahlS("dA", "Fall 1: rechte Seite", "Welche Zahl steht rechts (zum gekürzten Normalenvektor)?", "$d =$", dAk),
          vektorS("nB", "Fall 2: verschiedene Vorzeichen", "Setze $A = -B$: Welcher Normalenvektor entsteht (gekürzt)?", "$\\vec{n} =$", kB),
          zahlS("dB", "Fall 2: rechte Seite", "Welche Zahl steht rechts?", "$d =$", dBk),
        ],
        weg: [
          `$|\\vec{n}_1| = |\\vec{n}_2| = ${b}$: $\\frac{|${hnfLinksT(n1, d1)}|}{${b}} = \\frac{|${hnfLinksT(n2, d2)}|}{${b}}$ – die Nenner kürzen sich, aus $|A| = |B|$ folgt $A = B$ oder $A = ${MINUS}B$.`,
          `$A = B$: $${kf(nA, dA)}$${vGleich(nA, kA) ? `, also $F_1: ${kf(kA, dAk)}$` : `, gekürzt $F_1: ${kf(kA, dAk)}$`}`,
          `$A = ${MINUS}B$: $${kf(nB, dB)}$${vGleich(nB, kB) ? `, also $F_2: ${kf(kB, dBk)}$` : `, gekürzt $F_2: ${kf(kB, dBk)}$`}`,
          `Die Normalenvektoren von $F_1$ und $F_2$ sind orthogonal ($${skalarWegT(kA, kB)}$): Es sind die beiden winkelhalbierenden Ebenen von $E_1$ und $E_2$.`,
        ],
      };
    },
  },

  abstGeradenpunkte: {
    titel: "Punkte einer Geraden mit gegebenem Abstand zur Ebene",
    gen(r) {
      let n, d, b, p, u, nu, np, dist, t1, t2;
      do {
        ({ n, d, b } = ebeneGanz(r));
        u = zufVek(r, -2, 2);
        p = r() < 0.5 ? vek(0, 0, 0) : zufPunkt(r, -3, 3);
        nu = vDot(n, u); np = vDot(n, p);
        dist = eins(r, [1, 2, 3, 4]);
        if (qNull(nu)) continue;
        // |np + nu·t − d| = dist·b
        t1 = qDiv(qSub(qAdd(Q(d), q(dist * b)), np), nu); t2 = qDiv(qSub(qSub(Q(d), q(dist * b)), np), nu);
      } while (qNull(nu) || Math.max(t1.n, t2.n) > 4 || Math.abs(qNum(t1)) > 8 || Math.abs(qNum(t2)) > 8);
      const P1 = vAdd(p, vSkal(t1, u)), P2 = vAdd(p, vSkal(t2, u));
      const Xt = `X_t(${[0, 1, 2].map((i) => affT(p[i], u[i])).join(" \\mid ")})`;
      const lin = affT(qSub(np, Q(d)), nu);
      return {
        text: `Welche Punkte der Geraden $${geradeT(p, u)}$ haben von der Ebene $${koordT(n, d)}$ den Abstand $${dist}$?`,
        schritte: [
          listeS("t", "Parameterwerte", `Setze den allgemeinen Punkt $${Xt}$ in die HNF ein: $\\frac{|\\ldots|}{${b}} = ${dist}$. Gib beide Lösungen $t$ an (mit Semikolon).`, "$t =$", [qNum(t1), qNum(t2)], { wertText: `$${zT(t1)}$; $${zT(t2)}$`, hinweis: `Zähler: $${lin}$` }),
          punktS("P1", "Erster Punkt", `Setze $t = ${zT(t1)}$ in $g$ ein.`, "$P_1 =$", P1),
          punktS("P2", "Zweiter Punkt", `Setze $t = ${zT(t2)}$ in $g$ ein.`, "$P_2 =$", P2),
        ],
        weg: [
          `Allgemeiner Punkt: $${Xt}$. HNF: $\\frac{|${geradeInEbeneT(n, p, u)}${plusK(qNeg(d))}|}{${b}} = ${dist}$, also $|${lin}| = ${dist * b}$`,
          `$${lin} = ${dist * b}$ liefert $t = ${zT(t1)}$, $\\;${lin} = ${MINUS}${dist * b}$ liefert $t = ${zT(t2)}$`,
          `Punkte: $${pT(P1, "P_1")}$ und $${pT(P2, "P_2")}$. Da $\\vec{u} \\cdot \\vec{n} = ${zT(nu)} \\ne 0$, schneidet $g$ die Ebene – jeder Abstand wird genau zweimal erreicht.`,
        ],
      };
    },
  },
};

/* ===================== Seite 51: Abstand Punkt–Gerade ===================== */
/* Gerade p + t·u und Punkt P mit ganzem Lotfußpunkt F = p + t0·u und ganzem Abstand (PF ⊥ u, |PF| ganz) */
function punktGeradeSchoen(r, { ursprung = false, achse = null, ganzAbstand = true, lo = -3, hi = 4 } = {}) {
  for (let i = 0; i < 800; i++) {
    let u, p;
    if (achse !== null) { u = EINHEIT(achse); p = vek(0, 0, 0); }
    else { u = r() < 0.6 ? normaleGanzBetrag(r) : zufVek(r, -2, 2); p = ursprung ? vek(0, 0, 0) : zufPunkt(r, lo, hi); }
    if (u.filter(qNull).length >= 2 && achse === null) continue;
    if (!klein(u, 4)) continue;
    const t0 = q(eins(r, [-2, -1, 0, 1, 2, 3]));
    const F = vAdd(p, vSkal(t0, u));
    // w ⊥ u, klein
    let w = null;
    for (let j = 0; j < 60; j++) { const c = zufVek(r, -4, 4); if (qNull(vDot(c, u))) { w = c; break; } }
    if (!w) continue;
    if (ganzAbstand && betragGanz(w) === null) continue;
    const P = vAdd(F, w);
    if (!klein(P, 9) || !klein(F, 9)) continue;
    return { p, u, P, F, t0, w };
  }
  return { p: vek(0, 0, 0), u: vek(1, 2, 2), P: vek(3, 3, 0), F: vek(1, 2, 2), t0: q(1), w: vek(2, 1, -2) };
}
/* Zwei sich schneidende Geraden: Lage über das LGS, Schnittpunkt, Abstand 0 */
function schneidendeGeraden(r) {
  let p, u, qv, v, S, r0, s0;
  for (let i = 0; i < 500; i++) {
    [u, v] = zweiRichtungenKlein(r);
    S = zufPunkt(r, -3, 4); r0 = ganz(r, -3, 3, [0]); s0 = ganz(r, -3, 3, [0]);
    p = vSub(S, vSkal(r0, u)); qv = vSub(S, vSkal(s0, v));
    if (klein(p, 7) && klein(qv, 7)) break;
  }
  const A = [[u[0], qNeg(v[0])], [u[1], qNeg(v[1])], [u[2], qNeg(v[2])]];
  const b = [qSub(qv[0], p[0]), qSub(qv[1], p[1]), qSub(qv[2], p[2])];
  return {
    text: `Bestimme die Lage von $${geradeT(p, u, { param: "r" })}$ und $${geradeT(qv, v, { name: "h", param: "s" })}$ sowie ihren Abstand.`,
    schritte: [
      wahlS("lage", "Richtungen", "Vergleiche die Richtungsvektoren.", [["koll", "kollinear – parallel oder identisch"], ["nicht", "nicht kollinear – die Geraden schneiden sich oder sind windschief"]], "nicht"),
      zahlS("r", "Gleichsetzen", "Setze $\\vec{x}_g = \\vec{x}_h$ und löse zwei der drei Gleichungen: $r$?", "$r =$", q(r0)),
      zahlS("s", "Gleichsetzen", "Und $s$?", "$s =$", q(s0)),
      wahlS("probe", "Dritte Gleichung", "Erfüllen $r$ und $s$ auch die dritte Gleichung?", JA_NEIN("ja – die Geraden schneiden sich", "nein – die Geraden sind windschief"), "ja"),
      punktS("S", "Schnittpunkt", "Setze $r$ in $g$ ein.", "$S =$", S),
      zahlS("d", "Abstand", "Welchen Abstand haben sich schneidende Geraden?", "$d(g, h) =$", q(0)),
    ],
    weg: [
      `Richtungsvektoren nicht kollinear. Gleichsetzen: ${lgsZeilen(A, b, ["r", "s"]).join(", ")}`,
      `Aus zwei Gleichungen: $r = ${zT(q(r0))}$, $s = ${zT(q(s0))}$ – die dritte Gleichung stimmt auch. Die Geraden schneiden sich.`,
      `Schnittpunkt: $\\vec{s} = ${stuetzPlusT(p, q(r0), u)} = ${vT(S)}$, also $${pT(S, "S")}$, $d(g, h) = 0$`,
    ],
  };
}
/* zwei nicht kollineare kleine Richtungen ohne zwei Nullen */
function zweiRichtungenKlein(r) {
  for (let i = 0; i < 200; i++) {
    const u = zufVek(r, -3, 3), v = zufVek(r, -3, 3);
    if (kollinearFaktor(u, v) === null && u.filter(qNull).length < 2 && v.filter(qNull).length < 2) return [u, v];
  }
  return [vek(1, 2, 2), vek(2, -2, 1)];
}
const S51 = {
  abstLotGerade: {
    titel: "Lotfußpunkt und Abstand Punkt–Gerade",
    gen(r, variante) {
      // variante "hilfsebene": Weg 1 über die Hilfsebene (51-2); "achse": g ist eine Koordinatenachse
      const hilfs = variante === "hilfsebene";
      const achse = variante === "achse" ? ganz(r, 0, 2) : null;
      const G = punktGeradeSchoen(r, { ursprung: r() < 0.35, achse });
      const L = lotGerade(G.P, G.p, G.u);
      const gText = achse !== null ? `$g$: ${ACHSE[achse]}` : `$${geradeT(G.p, G.u)}$`;
      const schritte = [];
      const weg = [];
      if (hilfs) {
        const h = vDot(G.u, G.P);
        schritte.push(zahlS("h", "Hilfsebene", `Die Hilfsebene $H$ durch $P$ hat $\\vec{u}$ als Normalenvektor: $H: ${kf(G.u, q(0)).replace(" = 0", "")} = c$. Berechne $c$ durch Einsetzen von $P$.`, "$c =$", h));
        weg.push(`Hilfsebene durch $P$ mit Normalenvektor $\\vec{u}$: $H: ${kf(G.u, q(0)).replace(" = 0", "")} = ${skalarWegT(G.u, G.P)}$`);
        weg.push(`$g$ in $H$ einsetzen: $${geradeInEbeneT(G.u, G.p, G.u)} = ${zT(h)}$, also $${affT(vDot(G.u, G.p), vBetrag2(G.u))} = ${zT(h)}$ und $t = ${zT(L.t)}$`);
      } else {
        weg.push(...lotGeradeWeg(G.P, G.p, G.u).zeilen.slice(0, 2));
      }
      schritte.push(zahlS("t", "Parameter des Lotfußpunkts", hilfs ? "Setze $g$ in $H$ ein und löse nach $t$ auf." : "Setze den allgemeinen Punkt $X_t$ von $g$ an und löse $\\vec{PX_t} \\cdot \\vec{u} = 0$ nach $t$.", "$t =$", L.t, { hinweis: hilfs ? undefined : `$\\vec{PX_t} = (\\vec{p} ${MINUS} \\vec{P}) + t \\cdot \\vec{u}$ – das Skalarprodukt mit $\\vec{u}$ ist linear in $t$.` }));
      schritte.push(punktS("F", "Lotfußpunkt", "Setze $t$ in $g$ ein.", "$F =$", L.F));
      schritte.push(zahlR("d", "Abstand", "Berechne $|\\vec{PF}|$.", "$d(P, g) =$", Math.round(L.dist.num * 1000) / 1000, { tol: 0.002, wertText: `$${L.dist.tex}$` }));
      weg.push(`Lotfußpunkt: $\\vec{f} = ${stuetzPlusT(G.p, L.t, G.u)} = ${vT(L.F)}$, also $${pT(L.F, "F")}$`);
      weg.push(`Abstand: $d(P, g) = |\\vec{PF}| = ${betragWegT(L.PF)}$`);
      return {
        text: hilfs ? `Berechne $d(P, g)$ mit einer Hilfsebene in Koordinatenform: $${pT(G.P, "P")}$, $${geradeT(G.p, G.u)}$.` : `Bestimme den Lotfußpunkt $F$ auf $g$ und den Abstand $d(P, g)$ für $${pT(G.P, "P")}$ und ${gText}.`,
        schritte, weg,
      };
    },
  },

  abstGeradenParallel: {
    titel: "Abstand echt paralleler Geraden",
    gen(r, variante) {
      // variante "lage": Lage erst bestimmen (53-2) – dann zur Hälfte schneidende Geraden mit Abstand 0
      if (variante === "lage" && r() < 0.5) return schneidendeGeraden(r);
      const G = punktGeradeSchoen(r, { ursprung: r() < 0.3 });
      const k = eins(r, [-2, 2, -1, 3, -3]);
      const v = vSkal(k, G.u);
      const L = lotGerade(G.P, G.p, G.u);
      const i0 = G.u.findIndex((x) => !qNull(x));
      const tq = qDiv(qSub(G.P[i0], G.p[i0]), G.u[i0]);
      const j0 = [0, 1, 2].find((j) => j !== i0 && !qGleich(qAdd(G.p[j], qMul(tq, G.u[j])), G.P[j]));
      const schritte = [
        wahlS("lage", "Richtungen", "Vergleiche die Richtungsvektoren.", [["koll", `$\\vec{v} = ${malT(k, "\\vec{u}")}$ – kollinear, also parallel oder identisch`], ["nicht", "nicht kollinear – die Geraden schneiden sich oder sind windschief"]], "koll"),
        wahlS("echt", "Punktprobe", `Liegt der Stützpunkt $${pT(G.P, "Q")}$ von $h$ auf $g$?`, JA_NEIN("ja – die Geraden sind identisch", "nein – die Geraden sind echt parallel"), "nein", { hinweis: `Aus $x_${i0 + 1}$ folgt $t = ${zT(tq)}$ – prüfe die anderen Koordinaten.` }),
        zahlS("t", "Lot von $Q$ auf $g$", "Löse $\\vec{QX_t} \\cdot \\vec{u} = 0$ nach $t$.", "$t =$", L.t),
        punktS("F", "Lotfußpunkt", "Setze $t$ in $g$ ein.", "$F =$", L.F),
        zahlR("d", "Abstand", "$d(g, h) = |\\vec{QF}|$", "$d(g, h) =$", Math.round(L.dist.num * 1000) / 1000, { tol: 0.002, wertText: `$${L.dist.tex}$` }),
      ];
      const W = lotGeradeWeg(G.P, G.p, G.u, { name: "Q" });
      return {
        text: variante === "lage"
          ? `Bestimme die Lage von $${geradeT(G.p, G.u)}$ und $${geradeT(G.P, v, { name: "h", param: "s" })}$ sowie ihren Abstand.`
          : `Zeige, dass $${geradeT(G.p, G.u)}$ und $${geradeT(G.P, v, { name: "h", param: "s" })}$ echt parallel sind, und berechne ihren Abstand.`,
        schritte,
        weg: [
          `$${vT(v)} = ${malT(k, vT(G.u))}$: gleiche Richtung. Punktprobe $Q(${G.P.map((x) => zT(x)).join(" \\mid ")}) \\in g$? Aus $x_${i0 + 1}$: $t = ${zT(tq)}$, dann $x_${j0 + 1} = ${zT(qAdd(G.p[j0], qMul(tq, G.u[j0])))} \\ne ${zT(G.P[j0])}$ – echt parallel.`,
          `Abstand = Abstand von $Q$ zu $g$. ${W.zeilen[0]}`,
          W.zeilen[1], W.zeilen[2],
          `$d(g, h) = |\\vec{QF}| = ${betragWegT(L.PF)}$`,
        ],
      };
    },
  },

  abstDrohneTurm: {
    titel: "Kleinster Abstand einer Flugbahn zu einem Punkt",
    gen(r) {
      let G, L;
      do {
        G = punktGeradeSchoen(r, { lo: 0, hi: 6 });
      } while (G.P.some((x) => x.z < 0) || G.p.some((x) => x.z < 0) || G.F.some((x) => x.z < 0) || qNum(G.t0) <= 0 || betragNum(G.w) < 2);
      L = lotGerade(G.P, G.p, G.u);
      const grenze = eins(r, [2, 3, 4, 5, 6, 7, 8].filter((x) => x !== Math.round(L.dist.num)));
      const ok = L.dist.num >= grenze;
      const W = lotGeradeWeg(G.P, G.p, G.u, { name: "S" });
      return {
        text: `Eine Drohne fliegt von $${pT(G.p, "A")}$ geradlinig in Richtung $\\vec{u} = ${vT(G.u)}$ (Einheit 1 m). Wie nah kommt sie der Turmspitze $${pT(G.P, "S")}$? Hält sie $${grenze}$ m Sicherheitsabstand ein?`,
        schritte: [
          zahlS("t", "Nächster Bahnpunkt", "Löse $\\vec{SX_t} \\cdot \\vec{u} = 0$ nach $t$.", "$t =$", L.t),
          punktS("F", "Nächster Punkt", "Setze $t$ in die Flugbahn ein.", "$F =$", L.F),
          zahlR("d", "Kleinster Abstand", "Berechne $|\\vec{SF}|$.", "$d =$", Math.round(L.dist.num * 1000) / 1000, { tol: 0.002, einheit: "m", wertText: `$${L.dist.tex}$` }),
          wahlS("ok", "Sicherheitsabstand", `Wird der Sicherheitsabstand von $${grenze}$ m eingehalten?`, JA_NEIN("ja", "nein"), ok ? "ja" : "nein"),
        ],
        weg: [...W.zeilen, `Die Drohne kommt der Spitze bis auf $${L.dist.tex}$ m nahe – der Sicherheitsabstand von $${grenze}$ m wird ${ok ? "eingehalten" : "unterschritten"}.`],
      };
    },
  },

  abstDreieckHoehe: {
    titel: "Höhe und Flächeninhalt eines Dreiecks",
    gen(r) {
      // AB mit ganzem Betrag, C = F + w, F = A + t0·AB mit t0 ∈ (0,1)
      let A, B, C, F, w = null, u, t0;
      for (let i = 0; i < 800 && !w; i++) {
        A = zufPunkt(r, -2, 4);
        u = normaleGanzBetrag(r);
        if (u.filter(qNull).length >= 2) continue;
        const m = eins(r, [1, 2]);
        u = vSkal(m, u);
        B = vAdd(A, u);
        t0 = eins(r, [q(1, 2), q(1, 3), q(2, 3), q(1, 4), q(3, 4)]);
        F = vAdd(A, vSkal(t0, u));
        if (!F.every(istGanz)) continue;
        w = null;
        for (let j = 0; j < 60; j++) { const c = zufVek(r, -4, 4); if (qNull(vDot(c, u)) && betragGanz(c) !== null) { w = c; break; } }
        if (!w) continue;
        C = vAdd(F, w);
        if (!klein(B, 9) || !klein(C, 9)) { w = null; continue; }
      }
      if (!w) { A = vek(1, 0, 2); u = vek(4, 2, -4); B = vek(5, 2, -2); t0 = q(1, 2); F = vek(3, 1, 0); w = vek(1, 2, 2); C = vek(4, 3, 2); }
      const L = lotGerade(C, A, u);
      const ab = betragGanz(u), h = betragGanz(w);
      const area = q(ab * h, 2);
      const W = lotGeradeWeg(C, A, u, { name: "C", gName: "AB" });
      return {
        text: `Gegeben ist das Dreieck $${pT(A, "A")}$, $${pT(B, "B")}$, $${pT(C, "C")}$. Berechne die Höhe $h_c$ als Abstand von $C$ zur Geraden $AB$ und damit den Flächeninhalt.`,
        schritte: [
          vektorS("AB", "Richtungsvektor", "Berechne $\\vec{AB}$.", "$\\vec{AB} =$", u),
          zahlS("ab", "Grundseite", "Berechne $c = |\\vec{AB}|$.", "$c =$", q(ab)),
          zahlS("t", "Lot von $C$", "Gerade $AB: \\vec{x} = \\vec{a} + t \\cdot \\vec{AB}$. Löse $\\vec{CX_t} \\cdot \\vec{AB} = 0$.", "$t =$", L.t),
          punktS("F", "Höhenfußpunkt", "Setze $t$ ein.", "$F =$", L.F),
          zahlS("h", "Höhe", "$h_c = |\\vec{CF}|$", "$h_c =$", q(h)),
          zahlS("A", "Flächeninhalt", "$A = \\frac{1}{2} \\cdot c \\cdot h_c$", "$A =$", area),
        ],
        weg: [
          `$\\vec{AB} = ${vT(B)} ${MINUS} ${vT(A)} = ${vT(u)}$, $|\\vec{AB}| = ${betragWegT(u)}$`,
          ...W.zeilen,
          `$A = \\frac{1}{2} \\cdot ${ab} \\cdot ${h} = ${zT(area)}$`,
        ],
      };
    },
  },

  abstParameterPunkt: {
    titel: "Parameter aus gegebenem Abstand Punkt–Gerade",
    gen(r) {
      // P(a | p2 | p3) mit Abstand dist zu g: x = t·u. Quadratische Gleichung in a mit zwei rationalen Lösungen.
      let u, p2, p3, dist, a1, a2, A, B, C;
      for (let i = 0; i < 2000; i++) {
        u = normaleGanzBetrag(r);
        if (u.filter(qNull).length >= 2 || (u.some(qNull) && r() < 0.5)) continue;
        const uu = qNum(vBetrag2(u)), [u1, u2, u3] = vNum(u);
        p2 = ganz(r, -4, 4); p3 = ganz(r, -4, 4);
        if (p2 === 0 && p3 === 0) continue;
        dist = eins(r, [1, 2, 3, 4, 5]);
        // |PF|² = a² + p2² + p3² − (a u1 + p2 u2 + p3 u3)²/uu = dist²
        // (uu − u1²) a² − 2 u1 (p2u2+p3u3) a + uu(p2²+p3²) − (p2u2+p3u3)² − dist²·uu = 0
        const s = p2 * u2 + p3 * u3;
        if (s === 0 && u1 === 0) continue;
        A = uu - u1 * u1; B = -2 * u1 * s; C = uu * (p2 * p2 + p3 * p3) - s * s - dist * dist * uu;
        if (A === 0) continue;
        const D = B * B - 4 * A * C;
        if (D <= 0) continue;
        const sq = Math.round(Math.sqrt(D));
        if (sq * sq !== D) continue;
        const g = ggT(ggT(Math.abs(A), Math.abs(B)), Math.abs(C)) || 1;
        A /= g; B /= g; C /= g;
        a1 = q(-B + sq / g, 2 * A); a2 = q(-B - sq / g, 2 * A);
        if (Math.max(a1.n, a2.n) > 4 || Math.abs(qNum(a1)) > 12 || Math.abs(qNum(a2)) > 12) continue;
        break;
      }
      const uu = vBetrag2(u), [u1, u2, u3] = u;
      const s = qAdd(qMul(q(p2), u2), qMul(q(p3), u3));
      const tT = `\\frac{${affT(s, u1, "a")}}{${zT(uu)}}`;
      const quad = `${summeT([[A, "a^2"], [B, "a"]])}${plusK(C)} = 0`;
      return {
        text: `Für welche Werte von $a$ hat der Punkt $P(a \\mid ${zT(q(p2))} \\mid ${zT(q(p3))})$ von der Geraden $g: \\vec{x} = t \\cdot ${vT(u)}$ den Abstand $${dist}$?`,
        schritte: [
          zahlS("uu", "Betragsquadrat", "Berechne $|\\vec{u}|^2$.", "$|\\vec{u}|^2 =$", uu),
          listeS("a", "Beide Werte", `Lotfußpunkt: $t = \\frac{\\vec{p} \\cdot \\vec{u}}{|\\vec{u}|^2} = ${tT}$. Dann $|\\vec{PF}|^2 = |\\vec{p}|^2 ${MINUS} t^2 |\\vec{u}|^2 = ${dist}^2$ – eine quadratische Gleichung in $a$. Gib beide Lösungen an (mit Semikolon).`, "$a =$", [qNum(a1), qNum(a2)], { wertText: `$${zT(a1)}$; $${zT(a2)}$`, hinweis: `Quadratische Gleichung: $${quad}$` }),
        ],
        weg: [
          `Lot von $P$ auf $g$: $\\vec{PX_t} \\cdot \\vec{u} = 0$ liefert $t = \\frac{\\vec{p} \\cdot \\vec{u}}{|\\vec{u}|^2} = ${tT}$`,
          `Pythagoras im rechtwinkligen Dreieck $OFP$: $|\\vec{PF}|^2 = |\\vec{p}|^2 ${MINUS} |\\vec{OF}|^2 = a^2 + ${p2 * p2 + p3 * p3} ${MINUS} \\frac{(${affT(s, u1, "a")})^2}{${zT(uu)}} = ${dist * dist}$`,
          `Mit $${zT(uu)}$ multipliziert und zusammengefasst: $${quad}$`,
          `$a = ${zT(a1)}$ oder $a = ${zT(a2)}$`,
        ],
      };
    },
  },
};

/* ===================== Seite 53: Abstand windschiefer Geraden ===================== */
const S53 = {
  abstWindschief: {
    titel: "Abstand windschiefer Geraden",
    gen(r, variante) {
      // variante "achse": g ist eine Koordinatenachse (53-1 b); "zeigen": zuerst windschief zeigen (58-T3, 59-3 a/b)
      const zeigen = variante === "zeigen";
      let W;
      if (variante === "achse") {
        for (let i = 0; i < 500; i++) {
          const k = ganz(r, 0, 2);
          const u = EINHEIT(k);
          const v = zufVek(r, -4, 4); v[k] = q(0);
          if (vNull(v) || betragGanz(v) === null) continue;
          const n = vCross(u, v);
          const F = vek(0, 0, 0); F[k] = q(ganz(r, -3, 3));
          const kk = eins(r, [1, -1, 2]);
          const G = vAdd(F, vSkal(kk, vKuerzen(n)));
          const s0 = ganz(r, -2, 2);
          const qv = vSub(G, vSkal(s0, v));
          if (!klein(qv, 7)) continue;
          W = { p: vek(0, 0, 0), u, q: qv, v, n, F, G, r0: 0, s0, k: kk, d: abstandT(vDot(vSub(qv, vek(0, 0, 0)), n), n), achse: k };
          break;
        }
      } else W = windschief(r, { ganzBetrag: r() < 0.8 });
      const diff = vSub(W.q, W.p);
      const sp = vDot(diff, W.n);
      const gText = W.achse !== undefined ? `$g$: ${ACHSE[W.achse]}` : `$${geradeT(W.p, W.u, { param: "r" })}$`;
      const schritte = [];
      const weg = [];
      if (zeigen) {
        // Gleichsetzen: zwei Koordinaten lösen, dritte widerspricht
        const A = [[W.u[0], qNeg(W.v[0])], [W.u[1], qNeg(W.v[1])], [W.u[2], qNeg(W.v[2])]];
        const b = [diff[0], diff[1], diff[2]];
        const g = gauss(A, b, ["r", "s"]);
        schritte.push(wahlS("lage", "Lage", "Sind die Richtungsvektoren kollinear? Hat das Gleichungssystem $g = h$ eine Lösung?", [["wind", "nicht kollinear und das LGS ist unlösbar – windschief"], ["schn", "nicht kollinear und das LGS ist lösbar – sie schneiden sich"], ["par", "kollinear – parallel"]], "wind"));
        weg.push(`Richtungsvektoren nicht kollinear. Gleichsetzen $\\vec{x}_g = \\vec{x}_h$: ${lgsZeilen(A, b, ["r", "s"]).join(", ")} – ${g.art === "keine" ? "das LGS hat keine Lösung (Widerspruch in einer Zeile)" : "unlösbar"}: Die Geraden sind windschief.`);
      }
      schritte.push(vektorS("n", "Gemeinsame Lotrichtung", "Berechne $\\vec{n} = \\vec{u} \\times \\vec{v}$.", "$\\vec{n} =$", W.n));
      schritte.push(zahlR("bn", "Betrag", "Berechne $|\\vec{n}|$ (auf 2 Stellen, falls nicht ganz).", "$|\\vec{n}| =$", Math.round(betragNum(W.n) * 100) / 100, { tol: 0.011, wertText: `$${betragT(W.n)}$` }));
      schritte.push(vektorS("diff", "Verbindungsvektor", "Berechne $\\vec{q} - \\vec{p}$ (Stützpunkt von $h$ minus Stützpunkt von $g$).", "$\\vec{q} - \\vec{p} =$", diff));
      schritte.push(zahlR("d", "Abstand", "$d = \\frac{|(\\vec{q} - \\vec{p}) \\cdot \\vec{n}|}{|\\vec{n}|}$", "$d(g, h) =$", Math.round(W.d.num * 1000) / 1000, { tol: 0.002, wertText: `$${W.d.tex}$`, fehler: [{ wert: Math.abs(qNum(sp)), text: "Durch $|\\vec{n}|$ teilen nicht vergessen." }] }));
      weg.push(...windschiefWeg(W));
      return {
        text: zeigen
          ? `Zeige, dass $${geradeT(W.p, W.u, { param: "r" })}$ und $${geradeT(W.q, W.v, { name: "h", param: "s" })}$ windschief sind, und berechne ihren Abstand.`
          : `Die Geraden $g$ und $h$ sind windschief. Berechne ihren Abstand: ${gText}, $${geradeT(W.q, W.v, { name: "h", param: "s" })}$.`,
        schritte, weg,
      };
    },
  },

  abstLotfusspunkte: {
    titel: "Gemeinsames Lot windschiefer Geraden",
    gen(r, variante) {
      // variante "flug": Flugbahnen in km (59-3); "kontrolle": Lotfußpunkte und Kontrolle |FG| (53-3)
      const flug = variante === "flug";
      let W;
      do W = windschief(r, { ganzBetrag: true }); while (flug && (W.p.some((x) => x.z < 0) || W.q.some((x) => x.z < 0)));
      const Lf = lotfusspunkte(W);
      const grenze = flug ? eins(r, [1, 2, 3, 4, 5].filter((x) => x !== Math.round(W.d.num))) : 0;
      const schritte = [
        vektorS("n", "Lotrichtung", "Berechne $\\vec{n} = \\vec{u} \\times \\vec{v}$.", "$\\vec{n} =$", W.n),
        zahlR("d", "Abstand", "$d = \\frac{|(\\vec{q} - \\vec{p}) \\cdot \\vec{n}|}{|\\vec{n}|}$", "$d(g, h) =$", Math.round(W.d.num * 1000) / 1000, { tol: 0.002, einheit: flug ? "km" : undefined, wertText: `$${W.d.tex}$` }),
        zahlS("r", "Parameter auf $g$", "Setze $F_r \\in g$ und $G_s \\in h$ an. Aus $\\vec{F_rG_s} \\cdot \\vec{u} = 0$ und $\\vec{F_rG_s} \\cdot \\vec{v} = 0$ entsteht ein LGS. Löse es: $r$?", "$r =$", Lf.r),
        zahlS("s", "Parameter auf $h$", "Und $s$?", "$s =$", Lf.s),
        punktS("F", "Lotfußpunkt auf $g$", "Setze $r$ in $g$ ein.", "$F =$", Lf.F),
        punktS("G", "Lotfußpunkt auf $h$", "Setze $s$ in $h$ ein.", "$G =$", Lf.G),
      ];
      if (flug) schritte.push(wahlS("ok", "Mindestabstand", `Vorgeschrieben sind mindestens $${grenze}$ km. Wird das eingehalten?`, JA_NEIN("ja", "nein"), W.d.num >= grenze ? "ja" : "nein"));
      return {
        text: flug
          ? `Zwei Flugzeuge fliegen geradlinig auf $${geradeT(W.p, W.u, { name: "f_1", param: "r" })}$ und $${geradeT(W.q, W.v, { name: "f_2", param: "s" })}$ (Einheit 1 km). Die Bahnen sind windschief. Berechne den kleinsten Abstand der Bahnen – vorgeschrieben sind mindestens $${grenze}$ km – und die beiden Punkte, in denen sich die Bahnen am nächsten kommen.`
          : `Die Geraden $${geradeT(W.p, W.u, { param: "r" })}$ und $${geradeT(W.q, W.v, { name: "h", param: "s" })}$ sind windschief. Berechne ihren Abstand und bestimme die Lotfußpunkte $F \\in g$ und $G \\in h$ des gemeinsamen Lots. Kontrolliere mit $|\\vec{FG}|$.`,
        schritte,
        weg: [...windschiefWeg(W), ...Lf.zeilen, ...(flug ? [`Der Mindestabstand von $${grenze}$ km wird ${W.d.num >= grenze ? "eingehalten" : "nicht eingehalten"}.`] : [])],
      };
    },
  },

  abstWindschiefParameter: {
    titel: "Windschiefe Geraden mit Parameter",
    gen(r) {
      // h_a: q + (0,0,a)-Variante: dritte Stützkoordinate ist a. d(a) = |c0 + c1·a|/|n|
      let W, k, c0, c1, b, dist, a1, a2, aS;
      for (let i = 0; i < 500; i++) {
        W = windschief(r, { ganzBetrag: true });
        k = ganz(r, 0, 2);
        if (qNull(W.n[k])) continue;
        b = betragGanz(W.n);
        const diff = vSub(W.q, W.p);
        // (q − p)·n mit q_k = a: c0 + n_k·a
        c0 = qSub(vDot(diff, W.n), qMul(W.q[k], W.n[k])); c1 = W.n[k];
        aS = qDiv(qNeg(c0), c1);           // Schnitt: Zähler 0
        dist = eins(r, [1, 2, 3, 4, 5, 6]);
        a1 = qDiv(qSub(q(dist * b), c0), c1); a2 = qDiv(qSub(q(-dist * b), c0), c1);
        if (aS.n !== 1 || Math.abs(aS.z) > 12 || Math.max(a1.n, a2.n) > 2 || Math.abs(qNum(a1)) > 20 || Math.abs(qNum(a2)) > 20) continue;
        break;
      }
      const qa = W.q.map((x, i) => (i === k ? "a" : zT(x)));
      const diffT = `\\spalte{${[0, 1, 2].map((i) => (i === k ? affT(qNeg(W.p[i]), 1, "a") : zT(qSub(W.q[i], W.p[i])))).join("}{")}}`;
      const zaehler = affT(c0, c1, "a");
      return {
        text: `Gegeben sind $${geradeT(W.p, W.u, { param: "r" })}$ und $h_a: \\vec{x} = \\spalte{${qa[0]}}{${qa[1]}}{${qa[2]}} + s \\cdot ${vT(W.v)}$. Für welches $a$ schneiden sich $g$ und $h_a$? Für welche $a$ ist der Abstand $${dist}$?`,
        schritte: [
          vektorS("n", "Lotrichtung", "Berechne $\\vec{n} = \\vec{u} \\times \\vec{v}$ (unabhängig von $a$).", "$\\vec{n} =$", W.n),
          zahlS("b", "Betrag", "Berechne $|\\vec{n}|$.", "$|\\vec{n}| =$", q(b)),
          zahlS("aS", "Schnitt", `$(\\vec{q}_a ${MINUS} \\vec{p}) \\cdot \\vec{n} = ${zaehler}$. Für welches $a$ ist der Abstand 0?`, "$a =$", aS),
          listeS("a", "Abstand " + dist, `Löse $\\frac{|${zaehler}|}{${b}} = ${dist}$. Gib beide Werte an (mit Semikolon).`, "$a =$", [qNum(a1), qNum(a2)], { wertText: `$${zT(a1)}$; $${zT(a2)}$` }),
        ],
        weg: [
          `$\\vec{n} = \\vec{u} \\times \\vec{v} = ${kreuzWegT(W.u, W.v)}$, $|\\vec{n}| = ${b}$`,
          `$\\vec{q}_a ${MINUS} \\vec{p} = ${diffT}$, also $d(a) = \\frac{|${zaehler}|}{${b}}$`,
          `Schnitt bei $d = 0$: $${zaehler} = 0$, also $a = ${zT(aS)}$`,
          `$|${zaehler}| = ${dist * b}$: $a = ${zT(a1)}$ oder $a = ${zT(a2)}$`,
        ],
      };
    },
  },

  abstWuerfelDiagonale: {
    titel: "Abstand von Raumdiagonale und Kante im Würfel",
    gen(r) {
      const a = eins(r, [2, 4, 6]);
      // Diagonale O→G(a,a,a); Kante: zwei Ecken, die sich in einer Koordinate unterscheiden und beide nicht auf der Diagonale liegen
      const ecken = [];
      for (const x of [0, a]) for (const y of [0, a]) for (const z of [0, a]) ecken.push(vek(x, y, z));
      const kanten = [];
      for (const P of ecken) for (const Qe of ecken) {
        const dif = vSub(Qe, P);
        if (dif.filter((x) => !qNull(x)).length !== 1) continue;
        if (vNull(P) || vGleich(P, vek(a, a, a)) || vNull(Qe) || vGleich(Qe, vek(a, a, a))) continue;
        if (dif.find((x) => !qNull(x)).z < 0) continue;
        kanten.push([P, Qe]);
      }
      const [B, C] = eins(r, kanten);
      const u = vek(1, 1, 1), v = vKuerzen(vSub(C, B));
      const n = vCross(u, v);
      const diff = B;
      const sp = vDot(diff, n);
      const d = abstandT(sp, n);
      const F = vek(a / 2, a / 2, a / 2), G = mittelpunkt(B, C);
      return {
        text: `Ein Würfel hat die Ecken $O(0 \\mid 0 \\mid 0)$ und $G(${a} \\mid ${a} \\mid ${a})$. Berechne den Abstand der Raumdiagonalen $OG$ von der Kante durch $${pT(B, "B")}$ und $${pT(C, "C")}$. Wo liegen die Lotfußpunkte?`,
        schritte: [
          vektorS("n", "Lotrichtung", `Richtungen: $\\vec{u} = ${vT(u)}$ (Diagonale) und $\\vec{v} = ${vT(v)}$ (Kante). Berechne $\\vec{n} = \\vec{u} \\times \\vec{v}$.`, "$\\vec{n} =$", n),
          zahlR("d", "Abstand", "$d = \\frac{|(\\vec{b} - \\vec{o}) \\cdot \\vec{n}|}{|\\vec{n}|}$ – gib das Ergebnis auf 2 Stellen an.", "$d =$", Math.round(d.num * 100) / 100, { tol: 0.011, wertText: `$${d.tex}$` }),
          punktS("F", "Lotfußpunkt auf der Diagonalen", "Aus Symmetriegründen die Würfelmitte.", "$F =$", F),
          punktS("G", "Lotfußpunkt auf der Kante", "Die Kantenmitte.", "$G' =$", G),
        ],
        weg: [
          `Diagonale: $\\vec{x} = r \\cdot ${vT(u)}$, Kante: $\\vec{x} = ${vT(B)} + s \\cdot ${vT(v)}$. $\\vec{n} = ${kreuzWegT(u, v)}$, $|\\vec{n}| = ${betragWegT(n)}$`,
          `$d = \\frac{|${skalarWegT(B, n).split(" = ")[0]}|}{${betragT(n)}} = \\frac{|${zT(sp)}|}{${betragT(n)}} = ${d.tex}$`,
          `Lotfußpunkte: Würfelmitte $${pT(F, "F")}$ und Kantenmitte $${pT(G, "G'")}$ – Probe: $|\\vec{FG'}| = ${betragWegT(vSub(G, F))}$`,
        ],
      };
    },
  },

  abstFlugbahnen: {
    titel: "Waagrechte Flugbahnen – Abstand und Kreuzungspunkt",
    gen(r) {
      // zwei waagrechte Bahnen in Höhen h1 > h2, Richtungen mit u3 = v3 = 0, Kreuzungspunkt K ganz
      let p, u, qv, v, h1, h2, K;
      for (let i = 0; i < 500; i++) {
        h1 = ganz(r, 5, 10); h2 = ganz(r, 2, h1 - 1);
        const u2 = zufVek(r, -4, 4, { dim: 2 }), v2 = zufVek(r, -4, 4, { dim: 2 });
        if (kollinearFaktor(u2, v2) !== null || qNull(vDot(u2, v2)) && r() < 0.5) continue;
        u = vek(u2[0], u2[1], 0); v = vek(v2[0], v2[1], 0);
        const k1 = vek(ganz(r, 0, 8), ganz(r, 0, 8), 0);
        const r0 = ganz(r, 1, 3), s0 = ganz(r, 1, 3);
        p = vSub(vAdd(k1, vek(0, 0, h1)), vSkal(r0, u)); qv = vSub(vAdd(k1, vek(0, 0, h2)), vSkal(s0, v));
        if (p.some((x) => x.z < 0) || qv.some((x) => x.z < 0) || !klein(p, 12) || !klein(qv, 12)) continue;
        K = k1;
        break;
      }
      const n = vCross(u, v);
      const Lf = lotfusspunkte({ p, u, q: qv, v, n });
      return {
        text: `Flugzeug A fliegt auf $${geradeT(p, u, { name: "g", param: "r" })}$, Flugzeug B auf $${geradeT(qv, v, { name: "h", param: "s" })}$ (Einheit 1 km). Begründe ohne große Rechnung, dass der Abstand der Bahnen $${h1 - h2}$ km ist. Über welchem Bodenpunkt kreuzen sich die Bahnen?`,
        schritte: [
          wahlS("warum", "Begründung", "Warum ist der Abstand genau der Höhenunterschied?", [["hoehe", `Beide Bahnen sind waagrecht (dritte Koordinate der Richtungen ist 0) in $${h1}$ km und $${h2}$ km Höhe; $\\vec{n} = \\vec{u} \\times \\vec{v}$ zeigt senkrecht nach oben.`], ["stuetz", "Weil die Stützpunkte übereinander liegen."], ["betrag", "Weil die Richtungsvektoren gleich lang sind."]], "hoehe"),
          zahlS("d", "Abstand", "Gib den Abstand an.", "$d =$", q(h1 - h2), { einheit: "km" }),
          zahlS("r", "Kreuzung auf $g$", "Setze die ersten beiden Koordinaten gleich (LGS in $r$ und $s$): $r$?", "$r =$", Lf.r),
          zahlS("s", "Kreuzung auf $h$", "Und $s$?", "$s =$", Lf.s),
          punktS("B", "Bodenpunkt", "Der Punkt senkrecht unter der Kreuzung (dritte Koordinate 0).", "$B =$", vek(K[0], K[1], 0)),
        ],
        weg: [
          `Beide Richtungen haben $x_3 = 0$: Die Bahnen verlaufen waagrecht in $${h1}$ km und $${h2}$ km Höhe. $\\vec{n} = \\vec{u} \\times \\vec{v} = ${kreuzWegT(u, v)}$ zeigt senkrecht nach oben, also $d = ${h1} ${MINUS} ${h2} = ${h1 - h2}$ km.`,
          `Kreuzung (Grundriss): $${affT(p[0], u[0], "r")} = ${affT(qv[0], v[0], "s")}$ und $${affT(p[1], u[1], "r")} = ${affT(qv[1], v[1], "s")}$ liefern $r = ${zT(Lf.r)}$, $s = ${zT(Lf.s)}$`,
          `Lotfußpunkte $${pT(Lf.F, "F")}$ und $${pT(Lf.G, "G")}$ – Bodenpunkt $(${zT(K[0])} \\mid ${zT(K[1])} \\mid 0)$`,
        ],
      };
    },
  },
};

/* ===================== Seite 55: Schnittwinkel ===================== */
/* Zwei Richtungen für einen Winkel: schöne Beträge bevorzugt, nicht kollinear */
function zweiFuerWinkel(r, { ortho = 0.15, schoen = 0.7 } = {}) {
  if (r() < ortho) return orthoPaar(r);
  for (let i = 0; i < 200; i++) {
    const a = r() < schoen ? normaleGanzBetrag(r) : zufVek(r, -3, 3);
    const b = r() < schoen ? normaleGanzBetrag(r) : zufVek(r, -3, 3);
    if (kollinearFaktor(a, b) !== null || a.filter(qNull).length >= 2 && b.filter(qNull).length >= 2) continue;
    if (qNum(vBetrag2(a)) > 81 || qNum(vBetrag2(b)) > 81) continue;
    return [a, b];
  }
  return [vek(1, 2, 2), vek(2, -2, 1)];
}
const S55 = {
  abstWinkelGeraden: {
    titel: "Schnittwinkel zweier Geraden",
    gen(r) {
      const [u, v] = zweiFuerWinkel(r);
      const W = winkelSchritte(u, v, { art: "cos" });
      return {
        text: `Berechne den Schnittwinkel zweier Geraden mit den Richtungsvektoren $\\vec{u} = ${vT(u)}$ und $\\vec{v} = ${vT(v)}$ (eine Nachkommastelle).`,
        schritte: W.schritte,
        weg: [...W.weg, ...(W.w.grad === 90 ? ["Skalarprodukt 0: Die Geraden stehen senkrecht aufeinander."] : qNum(W.sp) < 0 ? ["Der Betrag im Zähler sorgt dafür, dass der Schnittwinkel höchstens $90^\\circ$ ist."] : [])],
      };
    },
  },

  abstWinkelGeradeEbene: {
    titel: "Schnittwinkel Gerade–Ebene",
    gen(r, variante) {
      // variante "koord": Koordinatenebene (55-2 b); "fehler": Fehlersuche Kosinus statt Sinus (55-4)
      let u, n, d;
      if (variante === "koord") {
        const k = ganz(r, 0, 2);
        n = EINHEIT(k); d = q(0);
        do u = zufVek(r, -3, 3); while (qNull(u[k]) || kollinearFaktor(u, n) !== null);
      } else {
        [u, n] = zweiFuerWinkel(r, { ortho: 0 });
        d = q(ganz(r, -6, 6));
      }
      const W = winkelSchritte(u, n, { art: "sin", nb: "\\vec{n}" });
      const eText = variante === "koord" ? `der ${KOORD_EBENE[n.findIndex((x) => !qNull(x))]}` : `der Ebene $${koordT(n, d)}$`;
      if (variante === "fehler") {
        const cosGrad = gradAus(W.w.wert);
        return {
          text: `Finde den Fehler: Lea berechnet den Winkel zwischen der Geraden $g$ mit $\\vec{u} = ${vT(u)}$ und ${eText} mit $\\cos \\alpha = ${quotBetragT(W.sp, u, n).split(" = ").pop()}$ und erhält $${gradT(cosGrad)}$.`,
          schritte: [
            wahlS("fehler", "Der Fehler", "Was ist falsch?", [["sin", "Bei Gerade–Ebene gehört der Sinus hin: Lea hat den Winkel zwischen $\\vec{u}$ und $\\vec{n}$ berechnet."], ["betrag", "Lea hat den Betrag im Zähler vergessen."], ["nichts", "Nichts – das Ergebnis stimmt."]], "sin"),
            zahlR("w", "Richtig", "Berechne den richtigen Winkel (eine Nachkommastelle).", "$\\alpha =$", W.w.grad, { tol: 0.11, einheit: "°", wertText: `$${gradT(W.w.grad)}$` }),
          ],
          weg: [
            `$\\vec{n}$ steht senkrecht auf $E$: Der Winkel zwischen $\\vec{u}$ und $\\vec{n}$ ist $${gradT(cosGrad)}$ – das ist nicht der Schnittwinkel, sondern sein Komplement.`,
            `Richtig: $\\sin \\alpha = \\frac{|\\vec{u} \\cdot \\vec{n}|}{|\\vec{u}| \\cdot |\\vec{n}|} = ${quotBetragT(W.sp, u, n)}$, also $\\alpha \\approx ${gradT(W.w.grad)}$ $(= 90^\\circ ${MINUS} ${gradT(cosGrad)})$`,
          ],
        };
      }
      return {
        text: `Berechne den Schnittwinkel der Geraden mit Richtungsvektor $\\vec{u} = ${vT(u)}$ und ${eText} (eine Nachkommastelle).`,
        schritte: W.schritte,
        weg: [`Normalenvektor $\\vec{n} = ${vT(n)}$. Bei Gerade–Ebene gilt $\\sin \\alpha = \\frac{|\\vec{u} \\cdot \\vec{n}|}{|\\vec{u}| \\cdot |\\vec{n}|}$.`, ...W.weg],
      };
    },
  },

  abstWinkelEbenen: {
    titel: "Schnittwinkel zweier Ebenen",
    gen(r, variante) {
      let n1, n2, d1, d2;
      if (variante === "koord") {
        const k = ganz(r, 0, 2);
        n2 = EINHEIT(k); d2 = q(0);
        do n1 = r() < 0.7 ? normaleGanzBetrag(r) : zufVek(r, -3, 3); while (qNull(n1[k]) || kollinearFaktor(n1, n2) !== null);
        d1 = q(ganz(r, -6, 6));
      } else {
        [n1, n2] = zweiFuerWinkel(r, { ortho: 0.1 });
        d1 = q(ganz(r, -6, 6)); d2 = q(ganz(r, -6, 6));
      }
      const W = winkelSchritte(n1, n2, { art: "cos", na: "\\vec{n}_1", nb: "\\vec{n}_2" });
      const e2 = variante === "koord" ? `die ${KOORD_EBENE[n2.findIndex((x) => !qNull(x))]}` : `$${koordT(n2, d2, { name: "E_2" })}$`;
      return {
        text: `Berechne den Schnittwinkel der Ebenen $${koordT(n1, d1, { name: "E_1" })}$ und ${e2} (eine Nachkommastelle).`,
        schritte: W.schritte,
        weg: [`Normalenvektoren $\\vec{n}_1 = ${vT(n1)}$ und $\\vec{n}_2 = ${vT(n2)}$ – die Ebenen schneiden sich unter demselben Winkel wie ihre Normalenvektoren.`, ...W.weg],
      };
    },
  },

  abstPyramideWinkel: {
    titel: "Neigungswinkel in einer Pyramide",
    gen(r) {
      // quadratische Grundfläche mit Seite 2a, Spitze über der Mitte in Höhe h
      const a = eins(r, [2, 3, 4]), h = eins(r, [2, 3, 4, 5, 6]);
      const O = vek(0, 0, 0), A = vek(2 * a, 0, 0), B = vek(2 * a, 2 * a, 0), C = vek(0, 2 * a, 0), S = vek(a, a, h);
      const AB = vSub(B, A), AS = vSub(S, A);
      const nRoh = vCross(AB, AS), n = vKuerzen(nRoh), boden = vek(0, 0, 1);
      const W1 = winkelSchritte(n, boden, { art: "cos", na: "\\vec{n}", nb: "\\vec{n}_B", id: "1", name: "\\alpha" });
      const W2 = winkelSchritte(AS, boden, { art: "sin", na: "\\vec{AS}", nb: "\\vec{n}_B", id: "2", name: "\\beta" });
      return {
        text: `Eine Pyramide hat die quadratische Grundfläche $${pT(O, "O")}$, $${pT(A, "A")}$, $${pT(B, "B")}$, $${pT(C, "C")}$ und die Spitze $${pT(S, "S")}$. Berechne den Neigungswinkel $\\alpha$ der Seitenfläche $ABS$ und den Neigungswinkel $\\beta$ der Kante $AS$ gegen die Grundfläche (eine Nachkommastelle).`,
        schritte: [
          vektorS("n", "Normalenvektor der Seitenfläche", "Berechne $\\vec{AB} \\times \\vec{AS}$ und kürze.", "$\\vec{n} =$", n, { hinweis: `$\\vec{AB} = ${vT(AB)}$, $\\vec{AS} = ${vT(AS)}$` }),
          W1.schritte[3],
          W2.schritte[3],
        ],
        weg: [
          `Seitenfläche: $\\vec{AB} \\times \\vec{AS} = ${kreuzWegT(AB, AS)}$${vGleich(n, nRoh) ? "" : `, gekürzt $\\vec{n} = ${vT(n)}$`}. Grundfläche: $\\vec{n}_B = ${vT(boden)}$.`,
          `$\\cos \\alpha = \\frac{|\\vec{n} \\cdot \\vec{n}_B|}{|\\vec{n}| \\cdot |\\vec{n}_B|} = ${quotBetragT(W1.sp, n, boden)}$, also $\\alpha \\approx ${gradT(W1.w.grad)}$`,
          `Kante: $\\sin \\beta = \\frac{|\\vec{AS} \\cdot \\vec{n}_B|}{|\\vec{AS}| \\cdot |\\vec{n}_B|} = ${quotBetragT(W2.sp, AS, boden)}$, also $\\beta \\approx ${gradT(W2.w.grad)}$`,
        ],
      };
    },
  },

  abstWuerfelWinkel: {
    titel: "Winkel im Einheitswürfel",
    gen(r) {
      // Raumdiagonale d = (1,1,1) gegen Bodenfläche (sin), Kante (cos), andere Raumdiagonale (cos)
      const dg = vek(1, 1, 1);
      const kante = EINHEIT(ganz(r, 0, 2));
      const j = ganz(r, 0, 2);
      const andere = dg.map((x, i) => (i === j ? q(-1) : q(1)));
      const bodenN = vek(0, 0, 1);
      const W1 = winkelSchritte(dg, bodenN, { art: "sin", na: "\\vec{d}", nb: "\\vec{n}", id: "1", name: "\\alpha" });
      const W2 = winkelSchritte(dg, kante, { art: "cos", na: "\\vec{d}", nb: "\\vec{k}", id: "2", name: "\\beta" });
      const W3 = winkelSchritte(dg, andere, { art: "cos", na: "\\vec{d}", nb: "\\vec{e}", id: "3", name: "\\gamma" });
      return {
        text: `Im Einheitswürfel ($O(0 \\mid 0 \\mid 0)$ bis $G(1 \\mid 1 \\mid 1)$): Unter welchem Winkel schneidet die Raumdiagonale $\\vec{d} = ${vT(dg)}$ die Bodenfläche ($x_3 = 0$), die Kante mit Richtung $\\vec{k} = ${vT(kante)}$ und die andere Raumdiagonale $\\vec{e} = ${vT(andere)}$? (eine Nachkommastelle)`,
        schritte: [W1.schritte[3], W2.schritte[3], W3.schritte[3]],
        weg: [
          `Bodenfläche (Normalenvektor $\\vec{n} = ${vT(bodenN)}$): $\\sin \\alpha = ${quotBetragT(W1.sp, dg, bodenN)}$, also $\\alpha \\approx ${gradT(W1.w.grad)}$`,
          `Kante: $\\cos \\beta = ${quotBetragT(W2.sp, dg, kante)}$, also $\\beta \\approx ${gradT(W2.w.grad)}$`,
          `Andere Raumdiagonale: $\\cos \\gamma = ${quotBetragT(W3.sp, dg, andere)}$, also $\\gamma \\approx ${gradT(W3.w.grad)}$`,
        ],
      };
    },
  },

  abstWinkelParameter: {
    titel: "Parameter aus gegebenem Schnittwinkel",
    gen(r) {
      // g: x = t·(u1, u2, a), Koordinatenebene x3 = 0 (n = e3): sin α = a/√(u1²+u2²+a²)
      const [c1, c2] = eins(r, [[1, 1], [1, 0], [2, 0], [1, 2], [2, 2], [3, 0], [2, 1], [3, 4], [1, 3]]);
      const s2 = c1 * c1 + c2 * c2;
      const winkel = eins(r, [30, 45, 60]);
      // sin²α = a²/(s2 + a²) → a² = s2 sin²/(1 − sin²): 30° → s2/3, 45° → s2, 60° → 3 s2
      const faktor = winkel === 30 ? q(1, 3) : winkel === 45 ? q(1) : q(3);
      const a2 = qMul(q(s2), faktor);
      const aT = sqrtQ(a2);
      const sinT = winkel === 30 ? "\\frac{1}{2}" : winkel === 45 ? "\\frac{1}{\\sqrt{2}}" : "\\frac{\\sqrt{3}}{2}";
      const gl = winkel === 30 ? `4a^2 = ${s2} + a^2` : winkel === 45 ? `2a^2 = ${s2} + a^2` : `4a^2 = ${3 * s2} + 3a^2`;
      return {
        text: `Für welches $a > 0$ schneidet $g: \\vec{x} = t \\cdot \\spalte{${c1}}{${c2}}{a}$ die $x_1x_2$-Ebene unter $${winkel}^\\circ$?`,
        schritte: [
          zahlS("a2", "Quadrat", `$\\sin ${winkel}^\\circ = \\frac{a}{\\sqrt{${s2} + a^2}}$. Quadriere und löse nach $a^2$ auf.`, "$a^2 =$", a2, { hinweis: `$\\sin ${winkel}^\\circ = ${sinT}$` }),
          zahlR("a", "Parameter", "Ziehe die Wurzel ($a > 0$), auf 2 Stellen.", "$a =$", Math.round(aT.num * 100) / 100, { tol: 0.011, wertText: `$${aT.tex}$` }),
        ],
        weg: [
          `Normalenvektor der $x_1x_2$-Ebene: $\\vec{n} = \\spalte{0}{0}{1}$. $\\sin \\alpha = \\frac{|\\vec{u} \\cdot \\vec{n}|}{|\\vec{u}| \\cdot |\\vec{n}|} = \\frac{a}{\\sqrt{${s2} + a^2}}$`,
          `$\\frac{a}{\\sqrt{${s2} + a^2}} = \\sin ${winkel}^\\circ = ${sinT}$, quadriert: $${gl}$, also $a^2 = ${zT(a2)}$`,
          `$a = ${aT.tex}${/sqrt/.test(aT.tex) ? ` \\approx ${dezT(Math.round(aT.num * 100) / 100)}` : ""}$`,
        ],
      };
    },
  },
};

/* ===================== Seite 57: Spiegelungen ===================== */
const S57 = {
  abstSpiegelPunkt: {
    titel: "Punkt an Punkt spiegeln",
    gen(r) {
      const P = zufPunkt(r, -4, 5);
      const M = r() < 0.25 ? vek(0, 0, 0) : zufPunkt(r, -3, 4);
      const Ps = spiegel(P, M);
      const mName = vNull(M) ? "O" : "M";
      return {
        text: `Spiegle $${pT(P, "P")}$ am Punkt ${vNull(M) ? "$O$ (Ursprung)" : `$${pT(M, "M")}$`}.`,
        schritte: [punktS("P", "Spiegelpunkt", `$M$ ist der Mittelpunkt von $P$ und $P'$: $\\vec{p}\\,' = 2\\vec{m} ${MINUS} \\vec{p}$.`, "$P' =$", Ps, { hinweis: `Oder: $\\vec{p}\\,' = \\vec{p} + 2 \\cdot \\vec{P${mName}}$` })],
        weg: [spiegelWegT(P, M), `Probe: $\\frac{1}{2}(\\vec{p} + \\vec{p}\\,') = ${vT(M)}$ ✓`],
      };
    },
  },

  abstSpiegelEbene: {
    titel: "Punkt an Ebene spiegeln",
    gen(r, variante) {
      // variante "koord": Koordinatenebene; "beides": an Ebene und an Punkt (58-T5)
      let n, d, P, F, k;
      if (variante === "koord") {
        const j = ganz(r, 0, 2);
        n = EINHEIT(j); d = q(0);
        do P = zufPunkt(r, -4, 5); while (qNull(P[j]));
        F = P.map((x, i) => (i === j ? q(0) : x)); k = qNeg(P[j]);
      } else {
        ({ n, d } = ebeneGanz(r));
        ({ P, F, k } = punktMitLot(r, n, d));
      }
      const Ps = spiegel(P, F);
      const L = lotEbene(n, d, P);
      const eText = variante === "koord" ? `der ${KOORD_EBENE[n.findIndex((x) => !qNull(x))]}` : `der Ebene $${koordT(n, d)}$`;
      const schritte = [
        zahlS("t", "Lotgerade schneiden", "Lotgerade $\\vec{x} = \\vec{p} + t \\cdot \\vec{n}$ in $E$ einsetzen und nach $t$ auflösen.", "$t =$", L.t),
        punktS("F", "Lotfußpunkt", "Setze $t$ ein.", "$F =$", F),
        punktS("P", "Spiegelpunkt", "Gehe von $P$ aus doppelt so weit: $\\vec{p}\\,' = \\vec{p} + 2t \\cdot \\vec{n}$ (oder $2\\vec{f} ${MINUS} \\vec{p}$).", "$P' =$", Ps, { hinweis: "Doppelter Parameter in der Lotgeraden." }),
      ];
      const weg = [
        ...lotEbeneWeg(n, d, P, { mitAbstand: false }).zeilen,
        `Spiegelpunkt: $\\vec{p}\\,' = \\vec{p} + 2t \\cdot \\vec{n} = ${stuetzPlusT(P, qMul(q(2), L.t), n)} = ${vT(Ps)}$, also $${pT(Ps, "P'")}$`,
      ];
      if (variante !== "beides") return { text: `Spiegle $${pT(P, "P")}$ an ${eText}.`, schritte, weg };
      const M = zufPunkt(r, -3, 4);
      const Pm = spiegel(P, M);
      schritte.push(punktS("Pm", "Spiegelung an $M$", `$\\vec{p}\\,' = 2\\vec{m} ${MINUS} \\vec{p}$`, "$P'' =$", Pm));
      weg.push(`An $M$: ${spiegelWegT(P, M, "P''")}`);
      return { text: `Spiegle $${pT(P, "P")}$ an ${eText} (Bild $P'$) und am Punkt $${pT(M, "M")}$ (Bild $P''$).`, schritte, weg };
    },
  },

  abstSpiegelGerade: {
    titel: "Punkt an Gerade spiegeln",
    gen(r) {
      const G = punktGeradeSchoen(r, { ursprung: r() < 0.4 });
      const L = lotGerade(G.P, G.p, G.u);
      const Ps = spiegel(G.P, L.F);
      const W = lotGeradeWeg(G.P, G.p, G.u);
      return {
        text: `Spiegle $${pT(G.P, "P")}$ an der Geraden $${geradeT(G.p, G.u)}$.`,
        schritte: [
          zahlS("t", "Lotfußpunkt", "Löse $\\vec{PX_t} \\cdot \\vec{u} = 0$ nach $t$.", "$t =$", L.t),
          punktS("F", "Lotfußpunkt", "Setze $t$ in $g$ ein.", "$F =$", L.F),
          punktS("P", "Spiegelpunkt", `$\\vec{p}\\,' = 2\\vec{f} ${MINUS} \\vec{p}$`, "$P' =$", Ps),
        ],
        weg: [...W.zeilen.slice(0, 3), spiegelWegT(G.P, L.F).replace("2\\vec{m}", "2\\vec{f}")],
      };
    },
  },

  abstSpiegelGeradeEbene: {
    titel: "Gerade an Ebene spiegeln",
    gen(r, variante) {
      // variante "parallel": g ∥ E, nur den Stützpunkt spiegeln
      const par = variante === "parallel";
      let n, d, A, F, k, u, S, tS;
      for (let i = 0; i < 500; i++) {
        ({ n, d } = ebeneGanz(r));
        ({ P: A, F, k } = punktMitLot(r, n, d, { ks: [1, -1, 2, -2] }));
        if (par) { u = senkrechtZu(r, n); if (!klein(u, 4)) continue; break; }
        // Durchstoßpunkt S in E, u = (S − A)/t0
        S = punktInEbene(r, n, d);
        if (!S || vGleich(S, F)) continue;
        tS = q(eins(r, [1, 2, -1, -2, 3]));
        const diff = vSub(S, A);
        if (!diff.every((x) => qDiv(x, tS).n === 1)) continue;
        u = vSkal(qDiv(q(1), tS), diff);
        if (!klein(u, 5) || vNull(u)) continue;
        break;
      }
      const As = spiegel(A, F);
      const L = lotEbene(n, d, A);
      const lotZ = lotEbeneWeg(n, d, A, { name: "A", mitAbstand: false }).zeilen;
      if (par) {
        return {
          text: `Spiegle die Gerade $${geradeT(A, u)}$ an der Ebene $${koordT(n, d)}$.`,
          schritte: [
            zahlS("nu", "Lage", "Berechne $\\vec{u} \\cdot \\vec{n}$.", "$\\vec{u} \\cdot \\vec{n} =$", q(0), { hinweis: "0 bedeutet: $g$ ist parallel zu $E$ – es gibt keinen Durchstoßpunkt, die Richtung bleibt beim Spiegeln erhalten." }),
            zahlS("t", "Stützpunkt spiegeln", "Lotgerade durch $A$ in $E$ einsetzen: $t$?", "$t =$", L.t),
            punktS("A", "Bild des Stützpunkts", "$\\vec{a}\\,' = \\vec{a} + 2t \\cdot \\vec{n}$", "$A' =$", As),
            vektorS("u", "Richtung der Bildgeraden", "Welche Richtung hat $g'$?", "$\\vec{u}\\,' =$", u, { hinweis: "Bei $g \\parallel E$ bleibt die Richtung gleich." }),
          ],
          weg: [
            `$\\vec{u} \\cdot \\vec{n} = ${skalarWegT(u, n)}$: $g \\parallel E$. Es genügt, den Stützpunkt zu spiegeln – die Richtung bleibt.`,
            ...lotZ.slice(1),
            `$\\vec{a}\\,' = ${stuetzPlusT(A, qMul(q(2), L.t), n)} = ${vT(As)}$. Bildgerade: $${geradeT(As, u, { name: "g'" })}$`,
          ],
        };
      }
      const us = vKuerzen(vSub(S, As));
      const fak = kollinearFaktor(us, vSub(S, As));
      return {
        text: `Spiegle die Gerade $${geradeT(A, u)}$ an der Ebene $${koordT(n, d)}$. Idee: Der Durchstoßpunkt $S$ bleibt fest, dazu spiegelt man den Stützpunkt $A$.`,
        schritte: [
          zahlS("tS", "Durchstoßpunkt", "Setze $g$ in $E$ ein und löse nach $t$ auf.", "$t =$", tS),
          punktS("S", "Durchstoßpunkt", "Setze $t$ in $g$ ein.", "$S =$", S),
          zahlS("k", "Stützpunkt spiegeln", "Lotgerade $\\vec{a} + k \\cdot \\vec{n}$ in $E$ einsetzen: $k$?", "$k =$", L.t),
          punktS("A", "Bild des Stützpunkts", "$\\vec{a}\\,' = \\vec{a} + 2k \\cdot \\vec{n}$", "$A' =$", As),
          vektorS("u", "Richtung der Bildgeraden", "Richtung $\\vec{A'S}$ (ganzzahlig gekürzt).", "$\\vec{u}\\,' =$", us),
        ],
        weg: [
          `Durchstoßpunkt: $${geradeInEbeneT(n, A, u)} = ${zT(d)}$, also $${affT(vDot(n, A), vDot(n, u))} = ${zT(d)}$, $t = ${zT(tS)}$: $${pT(S, "S")}$`,
          `Stützpunkt spiegeln – Lotgerade $\\vec{a} + k \\cdot \\vec{n}$ in $E$: $${affT(L.np, L.nn, "k")} = ${zT(d)}$, $k = ${zT(L.t)}$; $\\vec{a}\\,' = ${stuetzPlusT(A, qMul(q(2), L.t), n)} = ${vT(As)}$`,
          `Bildgerade durch $S$ und $A'$: $\\vec{A'S} = ${vT(vSub(S, As))}${fak && qGleich(fak, q(1)) ? "" : `, gekürzt $${vT(us)}$`}$, also $${geradeT(S, us, { name: "g'", param: "s" })}$`,
        ],
      };
    },
  },

  abstLaserSpiegel: {
    titel: "Lichtweg über einen Spiegel",
    gen(r) {
      // A, B auf derselben Seite von E; B' Spiegelbild; R = Schnitt von AB' mit E; Weg |AB'|
      let n, d, A, B, Bs, Fb, R, s, kA, kB;
      for (let i = 0; i < 800; i++) {
        ({ n, d } = ebeneGanz(r));
        const PA = punktMitLot(r, n, d, { ks: [1, 2] });
        const PB = punktMitLot(r, n, d, { ks: [1, 2, 3] });
        A = PA.P; B = PB.P; kA = PA.k; kB = PB.k;
        if (vGleich(A, B)) continue;
        Fb = PB.F; Bs = spiegel(B, Fb);
        // AB' ∩ E: A + s (B' − A), n·(…) = d → s = (d − n·A)/(n·(B'−A))
        const diff = vSub(Bs, A);
        const nd = vDot(n, diff);
        if (qNull(nd)) continue;
        s = qDiv(qSub(Q(d), vDot(n, A)), nd);
        R = vAdd(A, vSkal(s, diff));
        if (!R.every(istGanz) || !klein(R, 9) || !klein(Bs, 9)) continue;
        if (betragGanz(vSub(R, A)) === null || betragGanz(vSub(B, R)) === null) continue;
        break;
      }
      const AR = betragGanz(vSub(R, A)), RB = betragGanz(vSub(B, R)), ABs = betragGanz(vSub(Bs, A));
      const wA = hnfWert(n, A, d), wB = hnfWert(n, B, d);
      const diff = vSub(Bs, A);
      return {
        text: `Ein Laser in $${pT(A, "A")}$ soll über einen Spiegel in der Ebene $${koordT(n, d)}$ den Sensor $${pT(B, "B")}$ treffen. Wo trifft er den Spiegel? Wie lang ist sein Weg?`,
        schritte: [
          wahlS("seite", "Lage", "Liegen $A$ und $B$ auf derselben Seite von $E$? (HNF-Werte ohne Betrag vergleichen)", JA_NEIN("ja", "nein"), "ja", { hinweis: `HNF-Werte: $${zT(wA)}$ und $${zT(wB)}$` }),
          punktS("Bs", "Sensor spiegeln", "Spiegle $B$ an $E$.", "$B' =$", Bs),
          punktS("R", "Auftreffpunkt", "Schneide die Strecke $AB'$ mit $E$: $\\vec{x} = \\vec{a} + s \\cdot \\vec{AB'}$ einsetzen.", "$R =$", R),
          zahlS("weg", "Weglänge", "$|AR| + |RB| = |AB'|$", "Weg $=$", q(AR + RB)),
        ],
        weg: [
          `HNF-Werte $${zT(wA)}$ und $${zT(wB)}$: dieselbe Seite. Für $X \\in E$ gilt $|XB| = |XB'|$ – der Weg $|AX| + |XB|$ ist am kürzesten, wenn $X$ auf $\\overline{AB'}$ liegt.`,
          `$B$ spiegeln: Lot $\\vec{b} + k \\cdot \\vec{n}$, $k = ${zT(qNeg(q(kB)))}$: $F(${Fb.map((x) => zT(x)).join(" \\mid ")})$, $\\vec{b}\\,' = ${stuetzPlusT(B, q(-2 * kB), n)} = ${vT(Bs)}$`,
          `$\\overline{AB'}$ mit $E$ schneiden: $\\vec{x} = ${vT(A)} + s \\cdot ${vT(diff)}$, $${geradeInEbeneT(n, A, diff, "s")} = ${zT(d)}$, $s = ${zT(s)}$: $${pT(R, "R")}$`,
          `Weg: $|AR| + |RB| = ${AR} + ${RB} = ${AR + RB} = |AB'| = ${betragWegT(diff)}$`,
        ],
      };
    },
  },

  abstSpiegelEbeneFinden: {
    titel: "Spiegelebene zu zwei Punkten",
    gen(r) {
      let P, Qp, M, n, d, kf2;
      for (let i = 0; i < 300; i++) {
        P = zufPunkt(r, -3, 5);
        const w = vSkal(eins(r, [1, 2]), zufVek(r, -2, 2));
        Qp = vAdd(P, vSkal(2, w));
        if (vNull(w) || !klein(Qp, 9)) continue;
        M = mittelpunkt(P, Qp);
        n = vKuerzen(vSub(Qp, P));
        d = vDot(n, M);
        break;
      }
      const f = kollinearFaktor(n, vSub(Qp, P));
      return {
        text: `An welcher Ebene wird $${pT(P, "P")}$ auf $${pT(Qp, "Q")}$ gespiegelt? Gib sie in Koordinatenform an.`,
        schritte: [
          punktS("M", "Mittelpunkt", "Die Spiegelebene geht durch den Mittelpunkt von $P$ und $Q$.", "$M =$", M),
          vektorS("n", "Normalenvektor", "$\\vec{PQ}$ steht senkrecht auf der Ebene – gib den gekürzten Normalenvektor an.", "$\\vec{n} =$", n),
          zahlS("d", "Koordinatenform", `$E: ${kf(n, q(0)).replace(" = 0", "")} = d$ – berechne $d$ mit $M$.`, "$d =$", d),
        ],
        weg: [
          `Mittelpunkt: $\\vec{m} = \\frac{1}{2}(${vT(P)} + ${vT(Qp)}) = ${vT(M)}$`,
          `$\\vec{PQ} = ${vT(vSub(Qp, P))}${f && qGleich(f, q(1)) ? "" : ` = ${malT(f, vT(n))}`}$: Normalenvektor $\\vec{n} = ${vT(n)}$`,
          `$M$ einsetzen: $d = ${skalarWegT(n, M)}$, also $${koordT(n, d)}$`,
        ],
      };
    },
  },

  abstDoppelSpiegel: {
    titel: "Zweimal spiegeln an parallelen Ebenen",
    gen(r) {
      const k = ganz(r, 0, 2);
      const c1 = ganz(r, -3, 3), c2 = ganz(r, -4, 6, [c1]);
      const P = zufPunkt(r, -3, 4);
      const P1 = P.map((x, i) => (i === k ? qSub(q(2 * c1), x) : x));
      const P2 = P1.map((x, i) => (i === k ? qSub(q(2 * c2), x) : x));
      const v = vek(0, 0, 0); v[k] = q(2 * (c2 - c1));
      const xk = X[k];
      const name = ["a", "b", "c"];
      const allg = (c) => name.map((nm, i) => (i === k ? `${2 * c} ${MINUS} ${nm}` : nm)).join(" \\mid ");
      return {
        text: `Ein Punkt wird erst an $E_1: ${xk} = ${zT(q(c1))}$, dann an $E_2: ${xk} = ${zT(q(c2))}$ gespiegelt. Führe das für $${pT(P, "P")}$ durch. Um welchen Vektor wird insgesamt verschoben? Verallgemeinere für zwei parallele Ebenen mit Abstand $d$.`,
        schritte: [
          punktS("P1", "Erste Spiegelung", `Spiegeln an $${xk} = ${zT(q(c1))}$: Nur die Koordinate $${xk}$ ändert sich ($${xk}' = 2 \\cdot ${kzn(q(c1))} ${MINUS} ${xk}$).`, "$P_1 =$", P1),
          punktS("P2", "Zweite Spiegelung", `Spiegeln an $${xk} = ${zT(q(c2))}$.`, "$P_2 =$", P2),
          vektorS("v", "Verschiebung", "Berechne $\\vec{PP_2}$.", "$\\vec{v} =$", v),
          wahlS("allg", "Allgemein", "Zwei Spiegelungen an parallelen Ebenen mit Abstand $d$ ergeben …", [["2d", "eine Verschiebung um $2d$ senkrecht zu den Ebenen (von $E_1$ in Richtung $E_2$)"], ["d", "eine Verschiebung um $d$"], ["dreh", "eine Drehung um $180^\\circ$"]], "2d"),
        ],
        weg: [
          `Allgemein: $(${name.join(" \\mid ")}) \\mapsto (${allg(c1)}) \\mapsto (${name.map((nm, i) => (i === k ? `${2 * (c2 - c1)} + ${nm}` : nm)).join(" \\mid ")})$`,
          `Für $P$: $${pT(P, "P")} \\mapsto ${pT(P1, "P_1")} \\mapsto ${pT(P2, "P_2")}$`,
          `Verschiebung um $\\vec{v} = ${vT(v)}$ – das Doppelte des Abstands $d = ${Math.abs(c2 - c1)}$ der Ebenen, senkrecht zu ihnen. Allgemein: Verschiebung um $2d$ von $E_1$ in Richtung $E_2$.`,
        ],
      };
    },
  },
};

export const TYPEN_4 = { ...S49, ...S51, ...S53, ...S55, ...S57 };

export const BUCH_4 = {
  // 49 HNF
  "49-1": "abstHnf", "49-2": "abstLotEbene", "49-3": "abstEbenenParallel", "49-4": "abstGeradeEbene", "49-5": "abstLotEbene:drohne",
  "49-6": "abstAchsenpunkte", "49-7": "abstParallelEbenen", "49-8": "abstWinkelhalbierend",
  // 51 Punkt–Gerade
  "51-1": "abstLotGerade", "51-2": "abstLotGerade:hilfsebene", "51-3": "abstGeradenParallel", "51-4": "abstDrohneTurm", "51-5": "abstDreieckHoehe", "51-6": "abstParameterPunkt",
  // 53 windschief
  "53-1": "abstWindschief", "53-2": "abstGeradenParallel:lage", "53-3": "abstLotfusspunkte", "53-4": "abstFlugbahnen", "53-5": "abstWuerfelDiagonale", "53-6": "abstWindschiefParameter",
  // 55 Schnittwinkel
  "55-1": "abstWinkelGeraden", "55-2": "abstWinkelGeradeEbene", "55-3": "abstWinkelEbenen", "55-4": "abstWinkelGeradeEbene:fehler", "55-5": "abstPyramideWinkel", "55-6": "abstWuerfelWinkel", "55-7": "abstWinkelParameter",
  // 57 Spiegeln
  "57-1": "abstSpiegelPunkt", "57-2": "abstSpiegelEbene", "57-3": "abstSpiegelGerade", "57-4": "abstSpiegelGeradeEbene", "57-5": "abstLaserSpiegel", "57-6": "abstSpiegelEbeneFinden", "57-7": "abstDoppelSpiegel",
  // 58 Training VI – Typen dieses Kapitels
  "58-T1": "abstHnf", "58-T2": "abstLotGerade", "58-T3": "abstWindschief", "58-T4": "abstWinkelGeraden",
  "58-T5": "abstSpiegelEbene", "58-T6": "abstGeradeEbene", "58-T8": "abstGeradenpunkte",
  // 59/60 Abitur-Training – rein rechnerische Aufgaben mit einem passenden Typ (auch aus Kapitel III und V).
  // Ohne Typ: 58-T7, 59-1, 60-6, 60-8 (Mehrteiler über viele Themen), 59-4 (Begründen), 59-5 (Beweis).
  "59-2": "ebDreiEbenenPunkt", "59-3": "gerFlug", "60-7": "ebParameterParallel", "60-9": "abstSpiegelEbene", "60-10": "abstWindschief",
};
