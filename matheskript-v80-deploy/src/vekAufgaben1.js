/* ======================================================================
   vekAufgaben1.js – Aufgabentypen zu Kapitel I und II des Kurses
   „Vektoren, Geraden und Ebenen“:
   I  Zwei Geraden in der Ebene, Gauß-Verfahren, Lösungsmengen (lgs…)
   II Punkte im Raum, Vektoren, Rechnen mit Vektoren, lineare
      Abhängigkeit (vek…)
   Jeder Typ: gen(r, variante) → { text, schritte, weg }
   r = Zufallsquelle (zufall aus diffKern). Reine Logik, kein React.
   ====================================================================== */
import { qAbs } from "./rechnen2.js";
import {
  q, qAdd, qSub, qMul, qDiv, qNeg, qNum, qGleich, qNull, Q, ganz, eins, vz, mische, MINUS,
  zT, dezT, zTxt, zahlS, zahlR, wahlS, listeS, $,
  vek, zufVek, vAdd, vSub, vSkal, vDot, vNull, vGleich, vNum, vBetrag2, mittelpunkt, nach, kollinearFaktor,
  vT, pT, kz, malT, summeT, linGlT, lgsZeilen, ROEM, wurzelT, betragT, betragNum, betragWegT,
  gauss, vektorS, punktS, zweiRichtungen, GANZE_BETRAEGE,
} from "./vekKern.js";

/* ---------- lokale Helfer ---------- */
const vq = (arr) => arr.map((x) => q(x));
/* Summe mit eingesetzten Zahlen: 2 · (−3) + x_1 − 4 · 2 (Koeffizient 1 ohne Malpunkt) */
function einsetzT(teile, o) {
  let out = "";
  for (const [k, v] of teile) {
    const b = Q(k);
    if (b.z === 0) continue;
    const istVar = typeof v === "string";
    const vt = istVar ? v : kn(v, o);
    const abs = qAbs(b);
    const glied = abs.z === abs.n && abs.n === 1 ? vt : `${zT(abs, o)}${istVar ? "" : " \\cdot "}${vt}`;
    const neg = b.z < 0;
    if (!out) out = (neg ? MINUS : "") + glied;
    else out += ` ${neg ? MINUS : "+"} ${glied}`;
  }
  return out || "0";
}
/* Klammern nur bei negativer Zahl */
const kn = (a, o) => (Q(a).z < 0 ? `(${zT(a, o)})` : zT(a, o));
/* Gleichungssystem-Zeilen mit Dezimalzahlen rechts */
const lgsZeilenD = (A, b, vars) => A.map((zeile, i) => `$\\text{${ROEM[i]}}\\quad ${summeT(zeile.map((k, j) => [k, vars[j]]))} = ${zT(b[i], { dez: true })}$`);
/* Konstante anhängen: „ + 3“, „ − 3“, „“ bei 0 */
const plusK = (k) => { const b = Q(k); return b.z === 0 ? "" : ` ${b.z < 0 ? MINUS : "+"} ${zT(qAbs(b))}`; };
const JA_NEIN = [["ja", "ja"], ["nein", "nein"]];
const P2 = (x, y, name = "S") => pT([Q(x), Q(y)], name);
/* y = mx + c ohne 1x, + −, + 0 */
function linY(m, c) {
  const mm = Q(m), cc = Q(c);
  const t = mm.z === 0 ? "" : summeT([[mm, "x"]]);
  if (cc.z === 0) return t || "0";
  if (!t) return zT(cc);
  return `${t} ${cc.z < 0 ? MINUS : "+"} ${zT(qAbs(cc))}`;
}
const gerY = (name, m, c) => `${name}: y = ${linY(m, c)}`;
/* Affin in einem Parameter, Konstante zuerst: −1 + 2t, 3 − t, t, 2 */
function affT(k0, k1, p = "t") {
  const a = Q(k0), b = Q(k1);
  if (b.z === 0) return zT(a);
  const tp = summeT([[b, p]]);
  if (a.z === 0) return tp;
  return `${zT(a)} ${b.z < 0 ? MINUS : "+"} ${summeT([[qAbs(b), p]])}`;
}
/* Lösungstripel-Anzeige (x | y | z) */
const tripel = (xs) => `(${xs.map((x) => zT(x)).join(" \\mid ")})`;
/* Rückwärtseinsetzen nach gauss() mit art "eine": Zeilen des Rechenwegs */
function rueckweg(g, vars = ["x_1", "x_2", "x_3"], o) {
  const n = g.x.length, out = [];
  for (let i = n - 1; i >= 0; i--) {
    const teile = [[g.A[i][i], vars[i]]];
    for (let j = i + 1; j < n; j++) if (!qNull(g.A[i][j]) && !qNull(g.x[j])) teile.push([g.A[i][j], g.x[j]]);
    if (teile.length === 1 && qGleich(g.A[i][i], q(1))) out.push(`$\\text{${ROEM[i]}}: ${vars[i]} = ${zT(g.x[i], o)}$`);
    else out.push(`$\\text{${ROEM[i]}}: ${einsetzT(teile, o)} = ${zT(g.b[i], o)}$, also $${vars[i]} = ${zT(g.x[i], o)}$`);
  }
  return out;
}
/* Parameterlösung nach gauss() mit art "unendlich", Rang 2, Pivots in Spalte 1 und 2, x_3 = t.
   Liefert { x1: [k0, k1], x2: [k0, k1], zeilen } (x_i = k0 + k1·t) */
function paramLsg(g, vars = ["x_1", "x_2", "x_3"]) {
  const [a11, a12, a13] = g.A[0], a22 = g.A[1][1], a23 = g.A[1][2];
  const x2 = [qDiv(g.b[1], a22), qNeg(qDiv(a23, a22))];
  const x1 = [qDiv(qSub(qSub(g.b[0], qMul(a12, x2[0])), q(0)), a11), qDiv(qNeg(qAdd(qMul(a12, x2[1]), a13)), a11)];
  const zeilen = [
    `Die Nullzeile fällt weg, $${vars[2]}$ ist frei: $${vars[2]} = t$.`,
    `$\\text{II}: ${summeT([[a22, vars[1]], [a23, "t"]])} = ${zT(g.b[1])}$, also $${vars[1]} = ${affT(x2[0], x2[1])}$`,
    `$\\text{I}: ${summeT([[a11, vars[0]], [a12, `(${affT(x2[0], x2[1])})`], [a13, "t"]])} = ${zT(g.b[0])}$, also $${vars[0]} = ${affT(x1[0], x1[1])}$`,
    `$L = \\{(${affT(x1[0], x1[1])} \\mid ${affT(x2[0], x2[1])} \\mid t) \\mid t \\in \\mathbb{R}\\}$`,
  ];
  const bei = (t) => [qAdd(x1[0], qMul(x1[1], q(t))), qAdd(x2[0], qMul(x2[1], q(t))), q(t)];
  return { x1, x2, zeilen, bei };
}
/* Zufällige 3×3-Matrix mit kleinen Einträgen, erste Spalte oben ≠ 0 */
function zufMatrix(r, lo = -3, hi = 3) {
  const A = [0, 1, 2].map(() => [0, 1, 2].map(() => ganz(r, lo, hi)));
  if (A[0][0] === 0) A[0][0] = eins(r, [1, -1, 2]);
  return A;
}
const minorNull = (a, b, i) => { const [p, qq] = [0, 1, 2].filter((j) => j !== i); return qNull(qSub(qMul(a[p], b[qq]), qMul(a[qq], b[p]))); };
const det3 = (A) => A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) - A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) + A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0]);
const matMul = (A, x) => A.map((z) => z.reduce((s, k, j) => s + k * x[j], 0));
/* Vektor mit ganzzahligem Betrag (aus den Mustern), ohne Nullvektor */
function schoenerVek(r, { nurVoll = false, mind = 1 } = {}) {
  const muster = GANZE_BETRAEGE.filter((m) => (nurVoll ? m.every((x) => x !== 0) : m.filter((x) => x !== 0).length >= mind));
  const basis = eins(r, muster);
  return mische(r, basis.map((x) => q(x * vz(r))));
}
/* Betrag-Schritt: ganzzahlig exakt, sonst gerundet auf zwei Stellen mit Toleranz */
function betragS(id, titel, frage, text, v, o = {}) {
  const b2 = vBetrag2(v), w = Math.sqrt(qNum(b2));
  if (Number.isInteger(w)) return zahlS(id, titel, frage, text, w, o);
  return zahlR(id, titel, `${frage} Runde auf zwei Nachkommastellen.`, text, Math.round(w * 100) / 100, { tol: 0.02, wertText: `$${wurzelT(b2)} \\approx ${dezT(w, 2)}$`, ...o });
}
const LAGE = [["schnitt", "Schnittpunkt"], ["senkrecht", "senkrecht (Schnittpunkt)"], ["parallel", "parallel"], ["identisch", "identisch"]];
const ANZAHL = [["eine", "genau eine Lösung"], ["unendlich", "unendlich viele Lösungen"], ["keine", "keine Lösung"]];
const BRUECHE_M = [q(1, 2), q(-1, 2), q(1, 3), q(-1, 3), q(3, 2), q(-3, 2), q(2, 3), q(-2, 3)];
const steig = (r, bruch = 0.3) => (r() < bruch ? eins(r, BRUECHE_M) : q(ganz(r, -4, 4, [0])));
const kgv = (a, b) => (a * b) / ggTl(a, b);
const ggTl = (a, b) => (b ? ggTl(b, a % b) : Math.abs(a));

/* ===================== Kapitel I: Lineare Gleichungssysteme ===================== */
export const TYPEN_1 = {
  lgsSchnitt2d: {
    titel: "Schnittpunkt zweier Geraden durch Gleichsetzen",
    gen(r, variante) {
      let m1, m2, sx, sy, c1, c2;
      do {
        if (variante === "senkrecht") { m1 = eins(r, [q(2), q(-2), q(3), q(-3), q(1, 2), q(-1, 2), q(1, 3), q(-1, 3)]); m2 = qDiv(q(-1), m1); }
        else { m1 = steig(r); m2 = steig(r); }
        const n = kgv(m1.n, m2.n);
        sx = q(ganz(r, -3, 3) * n); sy = q(ganz(r, -4, 4));
        c1 = qSub(sy, qMul(m1, sx)); c2 = qSub(sy, qMul(m2, sx));
      } while (qGleich(m1, m2) || Math.abs(qNum(c1)) > 9 || Math.abs(qNum(c2)) > 9 || qGleich(c1, c2));
      const dm = qSub(m1, m2), dc = qSub(c2, c1);
      const schritte = [];
      if (variante === "senkrecht") schritte.push(zahlS("prod", "Senkrecht?", "Berechne das Produkt der Steigungen. Senkrechte Geraden haben $m_1 \\cdot m_2 = -1$.", "$m_1 \\cdot m_2 =$", -1, { fehler: [{ wert: qNum(qAdd(m1, m2)), text: "Nicht addieren: Für senkrechte Geraden gilt $m_1 \\cdot m_2 = -1$." }] }));
      schritte.push(
        zahlS("x", "x-Koordinate", "Setze die rechten Seiten gleich und löse nach $x$ auf.", "$x =$", sx, { hinweis: `$${linY(m1, c1)} = ${linY(m2, c2)}$`, fehler: [{ wert: qNum(qDiv(qSub(c1, c2), dm)), text: "Vorzeichenfehler beim Sortieren: Bringe die $x$-Glieder auf eine Seite, die Zahlen auf die andere." }] }),
        zahlS("y", "y-Koordinate", "Setze $x$ in eine der beiden Gleichungen ein.", "$y =$", sy),
      );
      const weg = [];
      if (variante === "senkrecht") weg.push(`$m_1 \\cdot m_2 = ${kn(m1)} \\cdot ${kn(m2)} = ${MINUS}1$, also stehen $g$ und $h$ senkrecht aufeinander.`);
      weg.push(
        `Gleichsetzen: $${linY(m1, c1)} = ${linY(m2, c2)}$`,
        `$${summeT([[dm, "x"]])} = ${zT(dc)}$, also $x = ${zT(sx)}$`,
        `$y = ${einsetzT([[m1, sx]])}${plusK(c1)} = ${zT(sy)}$`,
        `Schnittpunkt $${P2(sx, sy)}$`,
      );
      return {
        text: variante === "senkrecht"
          ? `Zeige, dass die Geraden $${gerY("g", m1, c1)}$ und $${gerY("h", m2, c2)}$ senkrecht aufeinander stehen, und berechne ihren Schnittpunkt.`
          : `Berechne den Schnittpunkt der Geraden $${gerY("g", m1, c1)}$ und $${gerY("h", m2, c2)}$ durch Gleichsetzen.`,
        schritte, weg,
      };
    },
  },

  lgsLage2d: {
    titel: "Lage zweier Geraden erkennen",
    gen(r, variante) {
      const fall = eins(r, ["schnitt", "schnitt", "parallel", "identisch", "senkrecht"]);
      let m1, c1, m2, c2;
      do {
        m1 = steig(r, 0.35); c1 = q(ganz(r, -4, 4));
        if (fall === "parallel") { m2 = m1; c2 = q(ganz(r, -4, 4, [c1.z])); }
        else if (fall === "identisch") { m2 = m1; c2 = c1; }
        else if (fall === "senkrecht") { m2 = qDiv(q(-1), m1); c2 = q(ganz(r, -4, 4)); }
        else { m2 = steig(r, 0.35); c2 = q(ganz(r, -4, 4)); }
      } while ((fall === "schnitt" && (qGleich(m1, m2) || qGleich(qMul(m1, m2), q(-1)))) || (fall === "senkrecht" && Math.abs(m1.z) === m1.n));
      // Darstellung der zweiten Geraden: manchmal als ax + by = c (mit Faktor)
      const k = eins(r, [1, 1, 2, -1, 3]);
      const versteckt = r() < 0.5;
      const n = m2.n;
      const hTex = versteckt ? `h: ${linGlT(qMul(q(-k * n), m2), q(k * n), qMul(q(k * n), c2))}` : gerY("h", m2, c2);
      const schnitt = fall === "schnitt" || fall === "senkrecht";
      let sx = null, sy = null;
      if (schnitt) { sx = qDiv(qSub(c2, c1), qSub(m1, m2)); sy = qAdd(qMul(m1, sx), c1); }
      const mitPunkt = variante === "schnitt" && schnitt;
      const schritte = [wahlS("lage", "Lage", "Vergleiche Steigung und $y$-Achsenabschnitt. Wie liegen $g$ und $h$ zueinander?", LAGE, fall, { hinweis: versteckt ? "Stelle $h$ zuerst nach $y$ um." : "Gleiche Steigung: parallel oder identisch. $m_1 \\cdot m_2 = -1$: senkrecht." })];
      if (mitPunkt) schritte.push(punktS("s", "Schnittpunkt", "Berechne den Schnittpunkt durch Gleichsetzen.", "$S =$", [sx, sy]));
      const weg = [];
      if (versteckt) weg.push(`Umstellen von $h$: $y = ${linY(m2, c2)}$, also $m_2 = ${zT(m2)}$ und $c_2 = ${zT(c2)}$.`);
      if (fall === "parallel") weg.push(`Gleiche Steigung $m = ${zT(m1)}$, verschiedene Achsenabschnitte $${zT(c1)}$ und $${zT(c2)}$: Die Geraden sind parallel.`);
      else if (fall === "identisch") weg.push(`Gleiche Steigung $m = ${zT(m1)}$ und gleicher Achsenabschnitt $c = ${zT(c1)}$: Die Geraden sind identisch.`);
      else if (fall === "senkrecht") weg.push(`$m_1 \\cdot m_2 = ${kn(m1)} \\cdot ${kn(m2)} = ${MINUS}1$: Die Geraden schneiden sich, und zwar senkrecht.`);
      else weg.push(`Verschiedene Steigungen $${zT(m1)} \\ne ${zT(m2)}$: Die Geraden schneiden sich. Wegen $m_1 \\cdot m_2 = ${zT(qMul(m1, m2))} \\ne ${MINUS}1$ nicht senkrecht.`);
      if (mitPunkt) weg.push(`$${linY(m1, c1)} = ${linY(m2, c2)}$ ergibt $x = ${zT(sx)}$, $y = ${zT(sy)}$: $${P2(sx, sy)}$`);
      return {
        text: `Wie liegen die Geraden $${gerY("g", m1, c1)}$ und $${hTex}$ zueinander: Schnittpunkt, senkrecht, parallel oder identisch?${mitPunkt ? " Berechne den Schnittpunkt." : ""}`,
        schritte, weg,
      };
    },
  },

  lgsUmstellen: {
    titel: "Geradengleichung nach y umstellen",
    gen(r) {
      let a, b, c;
      do { a = ganz(r, -5, 5, [0]); b = ganz(r, -4, 4, [0]); c = ganz(r, -8, 8); } while (Math.abs(b) === 1 && r() < 0.5);
      const m = q(-a, b), cc = q(c, b);
      return {
        text: `Stelle die Gleichung $${linGlT(a, b, c)}$ nach $y$ um und gib Steigung und $y$-Achsenabschnitt an.`,
        schritte: [
          zahlS("m", "Steigung", "Bringe $x$ auf die rechte Seite und teile durch den Faktor vor $y$.", "$m =$", m, { fehler: [{ wert: qNum(q(a, b)), text: "Vorzeichen: Beim Hinüberbringen wird aus $+ax$ ein $-ax$." }, { wert: -a, text: "Du hast noch nicht durch den Faktor vor $y$ geteilt." }] }),
          zahlS("c", "y-Achsenabschnitt", "Auch die rechte Seite durch den Faktor vor $y$ teilen.", "$c =$", cc, { fehler: [{ wert: c, text: "Auch die Zahl rechts muss durch den Faktor vor $y$ geteilt werden." }] }),
        ],
        weg: [
          `$${linGlT(a, b, c)}$, also $${summeT([[b, "y"]])} = ${summeT([[-a, "x"]])} ${c < 0 ? MINUS : "+"} ${Math.abs(c)}$`.replace(" + 0", ""),
          `$y = ${linY(m, cc)}$: $m = ${zT(m)}$, $c = ${zT(cc)}$`,
        ],
      };
    },
  },

  lgsAdd2: {
    titel: "LGS mit zwei Unbekannten (Additionsverfahren)",
    gen(r, variante) {
      let a1, b1, a2, b2, x, y, c1, c2, f1, f2;
      do {
        x = ganz(r, -4, 5); y = ganz(r, -4, 5);
        a1 = ganz(r, 1, 3); b1 = ganz(r, -3, 3, [0]);
        a2 = ganz(r, -3, 4, [0]); b2 = ganz(r, -3, 3, [0]);
        c1 = a1 * x + b1 * y; c2 = a2 * x + b2 * y;
        // Faktoren, damit y wegfällt: f1·b1 + f2·b2 = 0
        const g = ggTl(b1, b2);
        f1 = Math.abs(b2 / g); f2 = -Math.sign(b1 * b2) * Math.abs(b1 / g);
      } while (a1 * b2 - a2 * b1 === 0 || Math.abs(c1) > 20 || Math.abs(c2) > 20 || Math.abs(f1) > 3 || Math.abs(f2) > 3);
      const ax = f1 * a1 + f2 * a2, cx = f1 * c1 + f2 * c2;
      const mal = (k, name) => (Math.abs(k) === 1 ? `\\text{${name}}` : `${Math.abs(k)} \\cdot \\text{${name}}`);
      const komb = `${f1 < 0 ? MINUS : ""}${mal(f1, "I")} ${f2 < 0 ? MINUS : "+"} ${mal(f2, "II")}`;
      const deut = variante === "schnitt";
      const schritte = [
        zahlS("x", "x berechnen", `Multipliziere so, dass $y$ beim Addieren wegfällt (${$(komb)}).`, "$x =$", x, { hinweis: `$${summeT([[ax, "x"]])} = ${zT(cx)}$` }),
        zahlS("y", "y berechnen", "Setze $x$ in eine Gleichung ein.", "$y =$", y),
      ];
      return {
        text: `${deut ? "Löse das Gleichungssystem und deute die Lösung als Schnittpunkt zweier Geraden." : "Löse das Gleichungssystem mit dem Additionsverfahren."} $\\text{I}\\quad ${linGlT(a1, b1, c1)}$ und $\\text{II}\\quad ${linGlT(a2, b2, c2)}$`,
        schritte,
        weg: [
          `$${komb}$: $${summeT([[ax, "x"]])} = ${zT(cx)}$, also $x = ${zT(x)}$`,
          `In $\\text{I}$: $${einsetzT([[a1, q(x)], [b1, "y"]])} = ${zT(c1)}$, also $y = ${zT(y)}$`,
          deut ? `Die Geraden $\\text{I}$ und $\\text{II}$ schneiden sich im Punkt $${P2(x, y)}$.` : `Lösung: $x = ${zT(x)}$, $y = ${zT(y)}$`,
        ],
      };
    },
  },

  lgsKerze: {
    titel: "Zwei Kerzen – wann sind sie gleich hoch?",
    gen(r) {
      let h1, h2, v1, v2, t;
      do {
        t = ganz(r, 2, 8);
        v1 = eins(r, [1, 1.5, 2, 2.5, 3]); v2 = eins(r, [0.5, 1, 1.5]);
        h2 = ganz(r, 8, 20);
        h1 = h2 + (v1 - v2) * t;
      } while (v1 <= v2 || h1 > 30 || h1 - v1 * t <= 0 || h1 === h2);
      const rest = h1 - v1 * t;
      const hT = (h, v) => `${dezT(h)} ${MINUS} ${v === 1 ? "" : dezT(v)}t`;
      return {
        text: `Kerze A ist ${zTxt(h1)} cm hoch und brennt pro Stunde ${zTxt(v1)} cm ab, Kerze B ist ${zTxt(h2)} cm hoch und brennt pro Stunde ${zTxt(v2)} cm ab. Beide werden zur Zeit $t = 0$ angezündet. Nach wie vielen Stunden sind sie gleich hoch, und wie hoch sind sie dann?`,
        schritte: [
          zahlS("t", "Zeit", "Stelle für beide Kerzen die Höhe $h(t)$ auf und setze gleich.", "$t =$", t, { einheit: "h", hinweis: `$h_A(t) = ${hT(h1, v1)}$, $h_B(t) = ${hT(h2, v2)}$` }),
          zahlS("h", "Höhe", "Setze $t$ in eine der Höhen ein.", "$h =$", rest, { einheit: "cm" }),
        ],
        weg: [
          `$h_A(t) = ${hT(h1, v1)}$ und $h_B(t) = ${hT(h2, v2)}$`,
          `$${hT(h1, v1)} = ${hT(h2, v2)}$, also $${v1 - v2 === 1 ? `t = ${dezT(t)}` : `${dezT(v1 - v2)}t = ${dezT(h1 - h2)}$ und $t = ${dezT(t)}`}$`,
          `Nach ${zTxt(t)} Stunden sind beide $${dezT(h1)} ${MINUS} ${malT(v1, dezT(t))} = ${dezT(rest)}$ cm hoch.`,
        ],
      };
    },
  },

  lgsParallelA: {
    titel: "Parameter a: parallel, identisch, Schnittpunkt",
    gen(r) {
      // g_a: y = a x + p,  h_a: y = m x − a  (bzw. + k·a)
      const m = ganz(r, -4, 4, [0]), p = ganz(r, -4, 4, [0]);
      const a0 = ganz(r, -3, 3, [0, m]);
      const k = eins(r, [-1, 1, 2, -2]);
      let sx, sy;
      // identisch: a = m und p = k·a  ⇔ p = k·m
      const identisch = p === k * m;
      // Schnittpunkt für a = a0: a0 x + p = m x + k a0 → (a0 − m) x = k a0 − p
      sx = q(k * a0 - p, a0 - m); sy = qAdd(qMul(q(a0), sx), q(p));
      const hc = (a) => (k === 1 ? "a" : k === -1 ? `${MINUS}a` : `${k < 0 ? MINUS : ""}${Math.abs(k)}a`);
      const schritte = [
        zahlS("a", "Parallel", "Für welches $a$ haben beide Geraden dieselbe Steigung?", "$a =$", m, { fehler: [{ wert: -m, text: "Parallel heißt gleiche Steigung: Vergleiche die Zahlen vor dem $x$." }] }),
        wahlS("id", "Identisch?", "Können die Geraden für ein $a$ identisch sein? Dann müssten Steigung und Achsenabschnitt gleich sein.", JA_NEIN, identisch ? "ja" : "nein"),
        punktS("s", `Schnittpunkt für a = ${zT(a0)}`, `Setze $a = ${zT(a0)}$ ein und berechne den Schnittpunkt durch Gleichsetzen.`, "$S =$", [sx, sy]),
      ];
      return {
        text: `Gegeben sind die Geraden $g_a: y = ax ${p < 0 ? MINUS : "+"} ${Math.abs(p)}$ und $h_a: y = ${summeT([[m, "x"]])} ${k < 0 ? MINUS : "+"} ${Math.abs(k) === 1 ? "a" : `${Math.abs(k)}a`}$. Für welches $a$ sind sie parallel? Können sie identisch sein? Bestimme für $a = ${zT(a0)}$ den Schnittpunkt.`,
        schritte,
        weg: [
          `Parallel bei gleicher Steigung: $a = ${zT(m)}$. Dann hat $h_a$ den Achsenabschnitt $${hc()} = ${zT(k * m)}$.`,
          identisch ? `Für $a = ${zT(m)}$ sind auch die Achsenabschnitte gleich ($${zT(p)} = ${zT(k * m)}$): Die Geraden sind dann identisch.` : `Identisch wäre $a = ${zT(m)}$ und $${hc()} = ${zT(p)}$ zugleich, also $a = ${zT(q(p, k))}$ – geht nicht. Nie identisch.`,
          `$a = ${zT(a0)}$: $${linY(a0, p)} = ${linY(m, k * a0)}$, also $x = ${zT(sx)}$, $y = ${zT(sy)}$: $${P2(sx, sy)}$`,
        ],
      };
    },
  },

  lgsStufe: {
    titel: "Stufenform – Rückwärtseinsetzen",
    gen(r) {
      let A, x, b;
      do {
        x = [ganz(r, -3, 4), ganz(r, -3, 4), ganz(r, -3, 4)];
        A = [[eins(r, [1, 1, 2]), ganz(r, -3, 3, [0]), ganz(r, -3, 3, [0])], [0, eins(r, [1, -1, 1, 2]), ganz(r, -3, 4, [0])], [0, 0, eins(r, [2, 3, -2, 4, 1])]];
        b = matMul(A, x);
      } while (b.some((v) => Math.abs(v) > 20));
      const g = gauss(A, b);
      return {
        text: `Das Gleichungssystem hat schon Stufenform. Löse es durch Rückwärtseinsetzen. ${lgsZeilen(A, b).join(" ")}`,
        schritte: [
          zahlS("x3", "x₃ aus Zeile III", "Löse die letzte Gleichung nach $x_3$ auf.", "$x_3 =$", x[2]),
          zahlS("x2", "x₂ aus Zeile II", "Setze $x_3$ in Zeile II ein.", "$x_2 =$", x[1]),
          zahlS("x1", "x₁ aus Zeile I", "Setze $x_2$ und $x_3$ in Zeile I ein.", "$x_1 =$", x[0]),
        ],
        weg: [...rueckweg(g), `$L = \\{${tripel(g.x)}\\}$`],
      };
    },
  },

  lgsGauss3: {
    titel: "Gauß-Verfahren mit drei Unbekannten",
    gen(r, variante) {
      let A, x, b, g;
      do {
        x = [ganz(r, -3, 4), ganz(r, -3, 4), ganz(r, -3, 4)];
        A = zufMatrix(r, -2, 3);
        if (Math.abs(A[0][0]) !== 1) A[0][0] = 1;
        b = matMul(A, x);
        g = det3(A) === 0 ? null : gauss(A, b);
      } while (!g || g.art !== "eine" || b.some((v) => Math.abs(v) > 20) || g.schritte.some((s) => /Zeilen .* tauschen/.test(s)) || g.schritte.length !== 3 || g.b.some((v) => Math.abs(v.z) > 60));
      const probe = variante === "probe";
      const schritte = [
        zahlS("x3", "Stufenform und x₃", "Eliminiere $x_1$ aus II und III, dann $x_2$ aus III. Lies $x_3$ ab.", "$x_3 =$", x[2], { hinweis: g.schritte[0] }),
        zahlS("x2", "x₂", "Setze $x_3$ in die neue Zeile II ein.", "$x_2 =$", x[1]),
        zahlS("x1", "x₁", "Setze $x_2$ und $x_3$ in Zeile I ein.", "$x_1 =$", x[0]),
      ];
      const weg = [...g.schritte, ...rueckweg(g), `$L = \\{${tripel(g.x)}\\}$`];
      if (probe) weg.push(`Probe in $\\text{III}$: $${einsetzT(A[2].map((k, j) => [k, q(x[j])]).filter(([k, v]) => k !== 0 && v.z !== 0))} = ${zT(b[2])}$ ✓`);
      return {
        text: `Löse das Gleichungssystem mit dem Gauß-Verfahren. Notiere jede Umformung.${probe ? " Mache die Probe." : ""} ${lgsZeilen(A, b).join(" ")}`,
        schritte, weg,
      };
    },
  },

  lgsParabel: {
    titel: "Parabel durch drei Punkte (LGS aufstellen)",
    gen(r) {
      let a, b, c, xs, ys;
      do {
        a = ganz(r, -2, 2, [0]); b = ganz(r, -4, 4); c = ganz(r, -4, 5);
        xs = [eins(r, [-1, 1]), ...mische(r, [-3, -2, 2, 3]).slice(0, 2)].sort((u, v) => Math.abs(u) - Math.abs(v) || u - v);
        ys = xs.map((x) => a * x * x + b * x + c);
      } while (ys.some((y) => Math.abs(y) > 12));
      const A = xs.map((x) => [x * x, x, 1]);
      const g = gauss(A, ys, ["a", "b", "c"]);
      const fxT = `${summeT([[a, "x^2"], [b, "x"]])}${plusK(c)}`;
      return {
        text: `Die Parabel $f(x) = ax^2 + bx + c$ geht durch ${$(pT([q(xs[0]), q(ys[0])], "A"))}, ${$(pT([q(xs[1]), q(ys[1])], "B"))} und ${$(pT([q(xs[2]), q(ys[2])], "C"))}. Stelle ein Gleichungssystem für $a$, $b$, $c$ auf und bestimme $f(x)$.`,
        schritte: [
          zahlS("a", "a", "Setze die drei Punkte in $f(x) = ax^2 + bx + c$ ein und löse das LGS.", "$a =$", a, { hinweis: lgsZeilen(A, ys, ["a", "b", "c"]).join(" ") }),
          zahlS("b", "b", "", "$b =$", b),
          zahlS("c", "c", "", "$c =$", c),
        ],
        weg: [
          `Einsetzen: ${lgsZeilen(A, ys, ["a", "b", "c"]).join(", ")}`,
          ...g.schritte,
          ...rueckweg(g, ["a", "b", "c"]).slice(0, 3),
          `$f(x) = ${fxT}$`,
        ],
      };
    },
  },

  lgsSachtext3: {
    titel: "Sachaufgabe mit drei Unbekannten",
    gen(r, variante) {
      if (variante === "zahlen") {
        // Drei Zahlen: Summe s; 2·x1 = x2 + d1 ; x3 = x1 + d2
        let x1, x2, x3, d1, d2;
        do { x1 = ganz(r, 1, 6); d1 = ganz(r, -3, 3); d2 = ganz(r, -3, 4, [0]); x2 = 2 * x1 - d1; x3 = x1 + d2; } while (x2 <= 0 || x3 <= 0 || x2 > 12 || x1 + x2 + x3 > 25);
        const s = x1 + x2 + x3;
        const A = [[1, 1, 1], [2, -1, 0], [-1, 0, 1]], b = [s, d1, d2];
        const g = gauss(A, b);
        const groesser = (d) => (d === 0 ? "genauso groß wie" : d > 0 ? `um ${d} größer als` : `um ${-d} kleiner als`);
        return {
          text: `Drei Zahlen haben die Summe ${s}. Das Doppelte der ersten Zahl ist ${groesser(d1)} die zweite, die dritte Zahl ist ${groesser(d2)} die erste. Bestimme die drei Zahlen.`,
          schritte: [listeS("z", "Die drei Zahlen", "Stelle drei Gleichungen auf und löse das LGS. Gib die Zahlen in der Reihenfolge erste; zweite; dritte an.", "Zahlen:", [x1, x2, x3], { hinweis: lgsZeilen(A, b).join(" ") })],
          weg: [`Gleichungen: ${lgsZeilen(A, b).join(", ")}`, ...g.schritte, ...rueckweg(g), `Die Zahlen sind ${x1}, ${x2} und ${x3}.`],
        };
      }
      if (variante === "konzert") {
        let n1, n2, n3, k;
        do { n1 = ganz(r, 5, 30) * 10; k = eins(r, [2, 3]); n2 = k * n1; n3 = ganz(r, 5, 40) * 10; } while (n1 + n2 + n3 > 1200);
        const N = n1 + n2 + n3, E = 30 * n1 + 20 * n2 + 10 * n3;
        const A = [[1, 1, 1], [30, 20, 10], [-k, 1, 0]], b = [N, E, 0];
        const g = gauss(A, b);
        return {
          text: `Ein Konzert verkauft ${N} Karten zu 30 €, 20 € und 10 € und nimmt ${E} € ein. Von den 20-€-Karten wurden ${k === 2 ? "doppelt" : "dreimal"} so viele verkauft wie von den 30-€-Karten. Wie viele Karten jeder Sorte waren es?`,
          schritte: [listeS("n", "Anzahlen", "Stelle drei Gleichungen auf ($x_1$: 30 €, $x_2$: 20 €, $x_3$: 10 €) und löse. Reihenfolge: 30 €; 20 €; 10 €.", "Karten:", [n1, n2, n3], { hinweis: lgsZeilen(A, b).join(" ") })],
          weg: [`$x_1 + x_2 + x_3 = ${N}$, $30x_1 + 20x_2 + 10x_3 = ${E}$, $x_2 = ${k}x_1$`, ...g.schritte, ...rueckweg(g), `${n1} Karten zu 30 €, ${n2} zu 20 € und ${n3} zu 10 €.`],
        };
      }
      // Kiosk: Preise e, k, b (Vielfache von 0,5)
      let e, k, bz, M, p;
      do {
        e = ganz(r, 2, 8) / 2; k = ganz(r, 3, 8) / 2; bz = ganz(r, 2, 8) / 2;
        M = [[2, 1, 1], [1, 2, 0], [3, 1, 2]];
        if (r() < 0.5) M = [[1, 1, 1], [2, 0, 1], [1, 3, 2]];
        p = matMul(M, [e, k, bz]);
      } while (det3(M) === 0);
      const g = gauss(M, p, ["e", "k", "b"]);
      const satz = (z, pr) => `${[["Eis", z[0]], ["Kaffee", z[1]], ["Brezel", z[2]]].filter(([, n]) => n).map(([w, n]) => `${n} ${w}`).join(", ")} zusammen ${zTxt(pr)} €`;
      return {
        text: `Am Kiosk kosten ${satz(M[0], p[0])}; ${satz(M[1], p[1])}; ${satz(M[2], p[2])}. Was kostet jedes einzeln?`,
        schritte: [listeS("p", "Einzelpreise", "Stelle für Eis $e$, Kaffee $k$ und Brezel $b$ drei Gleichungen auf und löse. Reihenfolge: Eis; Kaffee; Brezel (in €).", "Preise:", [e, k, bz], { hinweis: lgsZeilenD(M, p, ["e", "k", "b"]).join(" ") })],
        weg: [`Gleichungen: ${lgsZeilenD(M, p, ["e", "k", "b"]).join(", ")}`, ...g.schritte, ...rueckweg(g, ["e", "k", "b"], { dez: true }), `Eis ${zTxt(e)} €, Kaffee ${zTxt(k)} €, Brezel ${zTxt(bz)} €.`],
      };
    },
  },

  lgsEbene3P: {
    titel: "Gleichung a x₁ + b x₂ + c x₃ = d durch drei Punkte",
    gen(r) {
      let a, b, c, d, P, Qp, R;
      do {
        a = ganz(r, 1, 4); b = ganz(r, -3, 4, [0]); c = ganz(r, 1, 4);
        d = eins(r, [6, 12, 4, 8]);
        // Q auf x1-Achse, R auf x3-Achse, P beliebig ganzzahlig
        if (d % a !== 0 || d % c !== 0) continue;
        Qp = [d / a, 0, 0]; R = [0, 0, d / c];
        const p1 = ganz(r, -2, 3), p2 = ganz(r, -3, 3, [0]);
        const rest = d - a * p1 - b * p2;
        if (rest % c !== 0) continue;
        P = [p1, p2, rest / c];
        if (Math.abs(P[2]) > 6) continue;
        break;
      } while (true);
      const A = [P, Qp, R];
      const g = gauss(A, [d, d, d], ["a", "b", "c"]);
      return {
        text: `Bestimme $a$, $b$ und $c$ so, dass die Punkte ${$(pT(vq(P), "P"))}, ${$(pT(vq(Qp), "Q"))} und ${$(pT(vq(R), "R"))} die Gleichung $ax_1 + bx_2 + cx_3 = ${d}$ erfüllen.`,
        schritte: [
          zahlS("a", "a", `Setze $Q$ ein: Nur $a$ bleibt übrig.`, "$a =$", a, { hinweis: `$${summeT([[Qp[0], "a"]])} = ${d}$` }),
          zahlS("c", "c", `Setze $R$ ein.`, "$c =$", c),
          zahlS("b", "b", `Setze $P$ ein und löse nach $b$ auf.`, "$b =$", b),
        ],
        weg: [
          `Einsetzen: ${lgsZeilen(A, [d, d, d], ["a", "b", "c"]).join(", ")}`,
          `Aus $\\text{II}$: $a = ${a}$, aus $\\text{III}$: $c = ${c}$`,
          `In $\\text{I}$: $${einsetzT([[P[0], q(a)], [P[1], "b"], [P[2], q(c)]])} = ${d}$, also $b = ${zT(b)}$`,
          `Die Gleichung $${summeT([[a, "x_1"], [b, "x_2"], [c, "x_3"]])} = ${d}$ beschreibt die Ebene durch $P$, $Q$ und $R$.`,
        ],
      };
    },
  },

  lgsStufeArt: {
    titel: "Stufenform: wie viele Lösungen?",
    gen(r) {
      const fall = eins(r, ["eine", "unendlich", "keine"]);
      let A, b, g, x;
      do {
        x = [ganz(r, -3, 4), ganz(r, -3, 4), ganz(r, -3, 4)];
        A = [[1, ganz(r, -2, 3, [0]), ganz(r, -3, 3, [0])], [0, 1, ganz(r, -3, 3, [0])], [0, 0, fall === "eine" ? eins(r, [1, 2, 3, -2]) : 0]];
        b = matMul(A, x);
        if (fall === "keine") b[2] = ganz(r, 1, 5) * vz(r);
        g = gauss(A, b);
      } while (b.some((v) => Math.abs(v) > 15) || g.art !== fall);
      const schritte = [wahlS("art", "Anzahl der Lösungen", "Sieh dir die letzte Zeile an: $k \\cdot x_3 = d$, $0 = 0$ oder $0 = d \\ne 0$?", ANZAHL, fall)];
      const weg = [];
      if (fall === "eine") {
        schritte.push(punktS("l", "Lösung", "Rechne rückwärts ein.", "$(x_1 \\mid x_2 \\mid x_3) =$", g.x));
        weg.push(`Die letzte Zeile liefert $x_3$ eindeutig: genau eine Lösung.`, ...rueckweg(g), `$L = \\{${tripel(g.x)}\\}$`);
      } else if (fall === "unendlich") {
        const pl = paramLsg(g);
        schritte.push(punktS("t1", "Lösung für t = 1", "Setze $x_3 = t$, drücke $x_2$ und $x_1$ durch $t$ aus und gib die Lösung für $t = 1$ an.", "$(x_1 \\mid x_2 \\mid x_3) =$", pl.bei(1)));
        weg.push(`Die Zeile $0 = 0$ ist immer erfüllt: unendlich viele Lösungen.`, ...pl.zeilen);
      } else {
        weg.push(`Die letzte Zeile $0 = ${zT(b[2])}$ ist ein Widerspruch: keine Lösung, $L = \\{\\,\\}$.`);
      }
      const zeilen = lgsZeilen(A, b).slice(0, 2);
      zeilen.push(`$\\text{III}\\quad 0 = ${zT(b[2])}$`);
      return {
        text: `Wie viele Lösungen hat das Gleichungssystem in Stufenform? Gib die Lösungsmenge an. ${zeilen.join(" ")}`,
        schritte, weg,
      };
    },
  },

  lgsZweiGl: {
    titel: "Zwei Gleichungen: lösen und geometrisch deuten",
    gen(r) {
      const fall = eins(r, ["eine", "eine", "unendlich", "keine"]);
      let a1, b1, c1, a2, b2, c2, k, x, y;
      do {
        a1 = ganz(r, 1, 3); b1 = ganz(r, -3, 3, [0]);
        x = ganz(r, -3, 4); y = ganz(r, -3, 4); c1 = a1 * x + b1 * y;
        if (fall === "eine") { a2 = ganz(r, -3, 3, [0]); b2 = ganz(r, -3, 3, [0]); c2 = a2 * x + b2 * y; }
        else { k = eins(r, [-2, 2, 3, -1]); a2 = k * a1; b2 = k * b1; c2 = fall === "unendlich" ? k * c1 : k * c1 + ganz(r, 1, 4) * vz(r); }
      } while ((fall === "eine" && a1 * b2 - a2 * b1 === 0) || Math.abs(c1) > 15 || Math.abs(c2) > 20);
      const g = gauss([[a1, b1], [a2, b2]], [c1, c2], ["x", "y"]);
      const DEUT = [["schnitt", "Schnittpunkt: genau eine Lösung"], ["parallel", "parallel: keine Lösung"], ["identisch", "identisch: unendlich viele Lösungen"]];
      const deut = fall === "eine" ? "schnitt" : fall === "keine" ? "parallel" : "identisch";
      const schritte = [wahlS("lage", "Deutung", fall === "eine" ? "Löse mit dem Additionsverfahren. Was ergibt sich für die beiden Geraden?" : `Forme um (z. B. $\\text{II} ${k < 0 ? "+" : MINUS} ${Math.abs(k) === 1 ? "" : `${Math.abs(k)} \\cdot `}\\text{I}$). Was ergibt sich für die beiden Geraden?`, DEUT, deut)];
      const weg = [...g.schritte];
      if (fall === "eine") {
        schritte.push(punktS("s", "Schnittpunkt", "Berechne die Lösung.", "$S =$", [q(x), q(y)]));
        weg.push(`$y = ${zT(y)}$, in $\\text{I}$: $x = ${zT(x)}$. Die Geraden schneiden sich in $${P2(x, y)}$.`);
      } else if (fall === "keine") weg.push(`Widerspruch: keine Lösung. Die Geraden sind parallel.`);
      else weg.push(`Nullzeile: unendlich viele Lösungen, die Geraden sind identisch. $x = t$, $y = ${affT(q(c1, b1), q(-a1, b1))}$.`);
      return {
        text: `Löse das Gleichungssystem und deute das Ergebnis geometrisch (Schnittpunkt, parallel oder identisch). $\\text{I}\\quad ${linGlT(a1, b1, c1)}$ und $\\text{II}\\quad ${linGlT(a2, b2, c2)}$`,
        schritte, weg,
      };
    },
  },

  lgsGaussArt: {
    titel: "Gauß-Verfahren: eine, keine oder unendlich viele Lösungen",
    gen(r, variante) {
      const fall = variante === "unendlich" ? "unendlich" : eins(r, ["eine", "unendlich", "keine"]);
      let A, b, g, x;
      for (let i = 0; i < 2000; i++) {
        x = [ganz(r, -3, 4), ganz(r, -3, 4), ganz(r, -3, 4)];
        const z1 = [1, ganz(r, -2, 3, [0]), ganz(r, -3, 3, [0])];
        const z2 = [eins(r, [1, 2, -1, 2]), ganz(r, -3, 4), ganz(r, -3, 3)];
        let z3;
        if (fall === "eine") z3 = [ganz(r, -2, 3), ganz(r, -3, 3), ganz(r, -3, 3)];
        else { const p = eins(r, [1, -1, 2]), s = eins(r, [1, -1, 2, -2]); z3 = z1.map((v, j) => p * v + s * z2[j]); }
        A = [z1, z2, z3];
        b = matMul(A, x);
        if (fall === "keine") b[2] += ganz(r, 1, 3) * vz(r);
        if (z3.every((v) => v === 0) || z3.some((v) => Math.abs(v) > 6)) continue;
        g = gauss(A, b);
        if (g.art !== fall || b.some((v) => Math.abs(v) > 20) || g.schritte.some((s) => /tauschen/.test(s)) || (fall === "unendlich" && (g.rang !== 2 || g.pivotSpalten.join() !== "0,1")) || g.b.some((v) => Math.abs(v.z) > 60)) continue;
        break;
      }
      const schritte = [];
      const weg = [...g.schritte];
      if (variante !== "unendlich") schritte.push(wahlS("art", "Anzahl der Lösungen", "Bringe das LGS auf Stufenform. Wie sieht die letzte Zeile aus?", ANZAHL, fall));
      if (fall === "eine") {
        schritte.push(punktS("l", "Lösung", "Rechne rückwärts ein.", "$(x_1 \\mid x_2 \\mid x_3) =$", g.x));
        weg.push(...rueckweg(g), `$L = \\{${tripel(g.x)}\\}$`);
      } else if (fall === "unendlich") {
        const pl = paramLsg(g);
        schritte.push(
          punktS("t0", "Lösung für t = 0", "Die letzte Zeile ist $0 = 0$. Setze $x_3 = t$ und drücke $x_2$, $x_1$ durch $t$ aus. Gib die Lösung für $t = 0$ an.", "$(x_1 \\mid x_2 \\mid x_3) =$", pl.bei(0)),
          punktS("t1", "Lösung für t = 1", "Und für $t = 1$?", "$(x_1 \\mid x_2 \\mid x_3) =$", pl.bei(1)),
        );
        weg.push(...pl.zeilen);
      } else {
        const zb = g.b[2];
        weg.push(`Die letzte Zeile lautet $0 = ${zT(zb)}$: Widerspruch, $L = \\{\\,\\}$.`);
      }
      return {
        text: `${variante === "unendlich" ? "Zeige, dass das Gleichungssystem unendlich viele Lösungen hat, und gib die Lösungsmenge in Parameterform an." : "Löse das Gleichungssystem mit dem Gauß-Verfahren und gib die Lösungsmenge an."} ${lgsZeilen(A, b).join(" ")}`,
        schritte, weg,
      };
    },
  },

  lgsParamAB: {
    titel: "Parameter a und b: Anzahl der Lösungen",
    gen(r) {
      // I: x + p y = c ; II: k x + a y = b  →  II − k·I: (a − kp) y = b − kc
      let p, c, k;
      do { p = ganz(r, -3, 3, [0]); c = ganz(r, -4, 4, [0]); k = eins(r, [2, 3, -2, -3]); } while (Math.abs(k * p) > 9);
      const a0 = k * p, b0 = k * c;
      return {
        text: `Gegeben ist das Gleichungssystem $\\text{I}\\quad ${linGlT(1, p, c)}$ und $\\text{II}\\quad ${k === 1 ? "x" : k === -1 ? `${MINUS}x` : `${k < 0 ? MINUS : ""}${Math.abs(k)}x`} + ay = b$. Bestimme $a$ und $b$ so, dass das LGS a) unendlich viele, b) keine, c) genau eine Lösung hat.`,
        schritte: [
          zahlS("a", "Wert von a", `Rechne $\\text{II} ${k < 0 ? "+" : MINUS} ${Math.abs(k)} \\cdot \\text{I}$. Für welches $a$ fällt $y$ weg?`, "$a =$", a0, { fehler: [{ wert: -a0, text: "Vorzeichen: $a - (" + k + ") \\cdot (" + p + ") = 0$." }] }),
          zahlS("b", "Wert von b für unendlich viele Lösungen", "Welches $b$ macht die rechte Seite auch zu 0?", "$b =$", b0),
          wahlS("keine", "Keine Lösung", `Wann hat das LGS keine Lösung?`, [["ab", `$a = ${zT(a0)}$ und $b \\ne ${zT(b0)}$`], ["a", `$a \\ne ${zT(a0)}$, $b$ beliebig`], ["b", `$b = ${zT(b0)}$, $a$ beliebig`]], "ab"),
        ],
        weg: [
          `$\\text{II} ${k < 0 ? "+" : MINUS} ${Math.abs(k)} \\cdot \\text{I}$: $(a${plusK(-a0)})y = b${plusK(-b0)}$`,
          `a) Nullzeile $0 = 0$: $a = ${zT(a0)}$ und $b = ${zT(b0)}$ – unendlich viele Lösungen.`,
          `b) $0 = b${plusK(-b0)} \\ne 0$: $a = ${zT(a0)}$ und $b \\ne ${zT(b0)}$ – keine Lösung.`,
          `c) $a \\ne ${zT(a0)}$, $b$ beliebig – genau eine Lösung.`,
        ],
      };
    },
  },

  lgsUnterbestimmt: {
    titel: "Zwei Gleichungen, drei Preise – was liegt fest?",
    gen(r) {
      // Preise Erwachsene x1, Kinder x2, Senioren x3. Familie A: a1 x1 + a2 x2 + a3 x3 = pA, Familie B: b1… – Differenz legt x2 fest
      let x1, x2, x3, A, B, pA, pB, d;
      do {
        x1 = ganz(r, 8, 14); d = ganz(r, 3, 7); x3 = x1 - d; x2 = ganz(r, 4, 8);
        A = [1, ganz(r, 1, 3), 1]; B = [2, A[1], 2];
        pA = A[0] * x1 + A[1] * x2 + A[2] * x3; pB = B[0] * x1 + B[1] * x2 + B[2] * x3;
      } while (x3 <= x2);
      const s13 = x1 + x3;
      const wer = (z) => `${z[0]} ${z[0] === 1 ? "Erwachsener" : "Erwachsene"}, ${z[1]} ${z[1] === 1 ? "Kind" : "Kinder"} und ${z[2]} ${z[2] === 1 ? "Senior" : "Senioren"}`;
      return {
        text: `Im Strandbad zahlt Familie A (${wer(A)}) ${pA} €, Familie B (${wer(B)}) ${pB} €. Zeige, dass nur der Kinderpreis festliegt. Welche Preise gelten, wenn Senioren ${d} € weniger zahlen als Erwachsene?`,
        schritte: [
          zahlS("k", "Kinderpreis", `Rechne $\\text{II} ${MINUS} \\text{I}$ und setze in $\\text{I}$ ein.`, "Kinder:", x2, { einheit: "€", hinweis: `$\\text{I}\\quad ${summeT([[A[0], "x_1"], [A[1], "x_2"], [A[2], "x_3"]])} = ${pA}$, $\\text{II}\\quad ${summeT([[B[0], "x_1"], [B[1], "x_2"], [B[2], "x_3"]])} = ${pB}$` }),
          zahlS("e", "Erwachsene", `Mit $x_3 = x_1 ${MINUS} ${d}$: Erwachsenenpreis?`, "Erwachsene:", x1, { einheit: "€" }),
          zahlS("s", "Senioren", "", "Senioren:", x3, { einheit: "€" }),
        ],
        weg: [
          `$\\text{I}\\quad ${summeT([[A[0], "x_1"], [A[1], "x_2"], [A[2], "x_3"]])} = ${pA}$, $\\text{II}\\quad ${summeT([[B[0], "x_1"], [B[1], "x_2"], [B[2], "x_3"]])} = ${pB}$`,
          `$\\text{II} ${MINUS} \\text{I}$: $x_1 + x_3 = ${s13}$; in $\\text{I}$: $${summeT([[A[1], "x_2"]])} = ${pA} ${MINUS} ${s13} = ${pA - s13}$, also $x_2 = ${x2}$`,
          `Nur der Kinderpreis ${x2} € liegt fest: $x_1 = ${s13} ${MINUS} t$, $x_3 = t$ bleiben frei.`,
          `Mit $x_3 = x_1 ${MINUS} ${d}$: $2x_1 ${MINUS} ${d} = ${s13}$, also $x_1 = ${x1}$ € und $x_3 = ${x3}$ €.`,
        ],
      };
    },
  },

  lgsParamA3: {
    titel: "Parameter a im LGS mit drei Unbekannten",
    gen(r) {
      // Zeilen z1, z2 fest, z3 = p·z1 + s·z2 bis auf Eintrag 3 = a; rechte Seite passend zu Lösung x mit x3 = 0
      let z1, z2, z3, x, b, a0, g, gA;
      do {
        x = [ganz(r, -2, 3), ganz(r, -2, 3), 0];
        z1 = [1, ganz(r, -2, 2, [0]), ganz(r, -2, 2, [0])];
        z2 = [eins(r, [2, -1, 3]), ganz(r, -2, 2), ganz(r, -2, 2, [0])];
        const p = eins(r, [1, -1, 2]), s = eins(r, [1, -1]);
        z3 = z1.map((v, j) => p * v + s * z2[j]);
        a0 = z3[2];
        b = [matMul([z1], x)[0], matMul([z2], x)[0], matMul([z3], x)[0]];
        if (z3[0] === 0 && z3[1] === 0) continue;
        g = gauss([z1, z2, z3], b);
        gA = gauss([z1, z2, [z3[0], z3[1], a0 + 1]], b);
      } while (!g || g.art !== "unendlich" || g.rang !== 2 || g.pivotSpalten.join() !== "0,1" || gA.art !== "eine" || g.schritte.some((s) => /tauschen/.test(s)) || Math.abs(a0) > 6);
      const pl = paramLsg(g);
      // Dritte Zeile symbolisch: III − z3[0]·I, dann q·III − p·II
      const c2 = z3[1] - z3[0] * z1[1], r3 = b[2] - z3[0] * b[0];
      const f = qDiv(q(c2), g.A[1][1]);
      const pq = f.z, qq = f.n;
      const mal = (k, name) => (k === 1 ? `\\text{${name}}` : `${k} \\cdot \\text{${name}}`);
      const st1 = `$${mal(1, "III")} ${z3[0] < 0 ? "+" : MINUS} ${mal(Math.abs(z3[0]), "I")}: ${c2 === 0 ? "" : summeT([[c2, "x_2"]]) + " + "}(a${plusK(-z3[0] * z1[2])})x_3 = ${zT(r3)}$`;
      const st2 = `$${mal(qq, "III")} ${pq < 0 ? "+" : MINUS} ${mal(Math.abs(pq), "II")}: ${qq === 1 ? "" : qq}(a${plusK(-a0)})x_3 = 0$`;
      const sym = [g.schritte[0], ...(z3[0] === 0 ? [] : [st1]), st2];
      const zeilen = [...lgsZeilen([z1, z2], b.slice(0, 2)), `$\\text{III}\\quad ${summeT([[z3[0], "x_1"], [z3[1], "x_2"]])} + ax_3 = ${zT(b[2])}$`];
      return {
        text: `Für welches $a$ hat das Gleichungssystem unendlich viele Lösungen? Gib dann die Lösungsmenge an. Was gilt für alle anderen $a$? ${zeilen.join(" ")}`,
        schritte: [
          zahlS("a", "Wert von a", "Bringe das LGS auf Stufenform. Für welches $a$ entsteht eine Nullzeile?", "$a =$", a0),
          punktS("t1", "Lösung für t = 1", `Setze $a = ${zT(a0)}$ und $x_3 = t$. Gib die Lösung für $t = 1$ an.`, "$(x_1 \\mid x_2 \\mid x_3) =$", pl.bei(1)),
          punktS("sonst", "Lösung für andere a", "Für $a \\ne " + zT(a0) + "$ gibt es genau eine Lösung. Welche?", "$(x_1 \\mid x_2 \\mid x_3) =$", vq(x), { hinweis: "Dann folgt $x_3 = 0$." }),
        ],
        weg: [
          ...sym,
          `Für $a = ${zT(a0)}$ wird die letzte Zeile zur Nullzeile $0 = 0$: unendlich viele Lösungen.`,
          ...pl.zeilen.slice(1),
          `Für $a \\ne ${zT(a0)}$ bleibt $(a ${a0 < 0 ? "+" : MINUS} ${Math.abs(a0)}) \\cdot x_3 = 0$, also $x_3 = 0$: genau eine Lösung $${tripel(vq(x))}$.`,
        ],
      };
    },
  },

  lgsAchsen: {
    titel: "Gerade ax + by = c: Schnitt mit Ursprungsgerade und Achsen",
    gen(r) {
      let a, b, c, m, sx, sy;
      do {
        a = ganz(r, 1, 5); b = ganz(r, -4, 4, [0]); m = ganz(r, -3, 3, [0]);
        sx = ganz(r, -3, 3, [0]); sy = m * sx; c = a * sx + b * sy;
      } while (a + b * m === 0 || c === 0 || Math.abs(c) > 20);
      const nx = q(c, a), ny = q(c, b);
      return {
        text: `Die Gerade $g: ${linGlT(a, b, c)}$ schneidet die Gerade $h$ durch den Ursprung mit der Steigung $${zT(m)}$. Bestimme den Schnittpunkt sowie die Schnittpunkte von $g$ mit den Koordinatenachsen.`,
        schritte: [
          punktS("s", "Schnittpunkt", `Setze $y = ${summeT([[m, "x"]])}$ in $g$ ein.`, "$S =$", [q(sx), q(sy)], { hinweis: `$${summeT([[a, "x"], [b * m, "x"]])} = ${zT(c)}$` }),
          zahlS("nx", "Schnitt mit der x-Achse", "Setze $y = 0$.", "$x =$", nx),
          zahlS("ny", "Schnitt mit der y-Achse", "Setze $x = 0$.", "$y =$", ny),
        ],
        weg: [
          `$h: y = ${summeT([[m, "x"]])}$ einsetzen: $${summeT([[a, "x"], [b * m, "x"]])} = ${zT(c)}$, also $${summeT([[a + b * m, "x"]])} = ${zT(c)}$ und $x = ${zT(sx)}$, $y = ${zT(sy)}$: $${P2(sx, sy)}$`,
          `$y = 0$: $${summeT([[a, "x"]])} = ${zT(c)}$, also $${pT([nx, q(0)], "S_x")}$`,
          `$x = 0$: $${summeT([[b, "y"]])} = ${zT(c)}$, also $${pT([q(0), ny], "S_y")}$`,
        ],
      };
    },
  },

  lgsSymA: {
    titel: "LGS x + ay = c, ax + y = c für verschiedene a",
    gen(r) {
      const c = ganz(r, 1, 4);
      const a2 = eins(r, [2, 3, -2, -3]);
      const s = q(c, 1 + a2);
      return {
        text: `Untersuche das Gleichungssystem $\\text{I}\\quad x + ay = ${c}$, $\\text{II}\\quad ax + y = ${c}$ für $a = 1$, $a = ${MINUS}1$ und $a = ${zT(a2)}$. Deute jeweils geometrisch.`,
        schritte: [
          wahlS("a1", "a = 1", "Setze $a = 1$ ein. Was ergibt sich?", [["identisch", "identische Geraden, unendlich viele Lösungen"], ["parallel", "parallele Geraden, keine Lösung"], ["schnitt", "Schnittpunkt, genau eine Lösung"]], "identisch"),
          wahlS("am1", "a = −1", `Setze $a = ${MINUS}1$ ein.`, [["identisch", "identische Geraden, unendlich viele Lösungen"], ["parallel", "parallele Geraden, keine Lösung"], ["schnitt", "Schnittpunkt, genau eine Lösung"]], "parallel"),
          punktS("s", `a = ${zT(a2)}`, `Setze $a = ${zT(a2)}$ ein und löse.`, "$S =$", [s, s], { hinweis: "Beide Gleichungen sind symmetrisch: Probiere $x = y$." }),
        ],
        weg: [
          `$a = 1$: zweimal $x + y = ${c}$ – identische Geraden, unendlich viele Lösungen.`,
          `$a = ${MINUS}1$: $x ${MINUS} y = ${c}$ und $${MINUS}x + y = ${c}$, also $x ${MINUS} y = ${MINUS}${c}$ – parallele Geraden, keine Lösung.`,
          `$a = ${zT(a2)}$: $\\text{II} ${a2 < 0 ? "+" : MINUS} ${Math.abs(a2)} \\cdot \\text{I}$: $(1 ${MINUS} ${a2 * a2})y = ${einsetzT([[1, q(c)], [-a2, q(c)]])}$, also $y = ${zT(s)}$, $x = ${zT(s)}$ – Schnittpunkt $${pT([s, s], "S")}$.`,
        ],
      };
    },
  },
};

/* ===================== Kapitel II: Vektoren ===================== */
/* Punkt mit ganzen Koordinaten */
const zufPunkt = (r, lo = -4, hi = 5) => vek(ganz(r, lo, hi), ganz(r, lo, hi), ganz(r, lo, hi));
/* Vektorsumme ausgeschrieben komponentenweise: \spalte{1 + 2}{−2 + 0}{3 + (−1)} */
function kompT(teile) {
  const komp = (i) => {
    const t = teile.filter(([, v]) => !qNull(v[i]));
    if (!t.length) return "0";
    let out = "";
    t.forEach(([k, v], idx) => {
      const b = Q(k);
      let g = b.z === b.n ? (idx === 0 ? zT(v[i]) : kz(v[i])) : b.z === -b.n ? `${MINUS}${kz(v[i])}` : `${zT(b)} \\cdot ${kz(v[i])}`;
      if (!out) out = g;
      else if (g.startsWith(MINUS)) out += ` ${MINUS} ${g.slice(1)}`;
      else out += ` + ${g}`;
    });
    return out;
  };
  return `\\spalte{${komp(0)}}{${komp(1)}}{${komp(2)}}`;
}

const TYPEN_1_VEK = {
  vekLage: {
    titel: "Punkt auf Achse oder in Koordinatenebene",
    gen(r) {
      const art = eins(r, ["x1", "x2", "x3", "x1x2", "x1x3", "x2x3"]);
      const w = () => ganz(r, -5, 6, [0]);
      const P = art === "x1" ? [w(), 0, 0] : art === "x2" ? [0, w(), 0] : art === "x3" ? [0, 0, w()] : art === "x1x2" ? [w(), w(), 0] : art === "x1x3" ? [w(), 0, w()] : [0, w(), w()];
      const OPT = [["x1", "$x_1$-Achse"], ["x2", "$x_2$-Achse"], ["x3", "$x_3$-Achse"], ["x1x2", "$x_1x_2$-Ebene"], ["x1x3", "$x_1x_3$-Ebene"], ["x2x3", "$x_2x_3$-Ebene"]];
      const txt = OPT.find((o) => o[0] === art)[1];
      return {
        text: `Auf welcher Koordinatenachse oder in welcher Koordinatenebene liegt der Punkt ${$(pT(vq(P)))}?`,
        schritte: [wahlS("lage", "Lage", "Welche Koordinaten sind 0? Zwei Nullen: Achse. Eine Null: Ebene der beiden anderen Achsen.", OPT, art)],
        weg: [art.length === 2 ? `Zwei Koordinaten sind 0, nur $${art.replace("x", "x_")}$ nicht: $P$ liegt auf der ${txt}.` : `Nur die Koordinate $${["x_1", "x_2", "x_3"].find((v) => !art.includes(v.replace("_", "")))}$ ist 0: $P$ liegt in der ${txt}.`],
      };
    },
  },

  vekAbstand: {
    titel: "Abstand zweier Punkte",
    gen(r, variante) {
      let P, Qp, d;
      do {
        P = zufPunkt(r); d = variante === "wurzel" ? zufVek(r, -4, 4, { keineNull: true }) : schoenerVek(r, { mind: 2 }); Qp = vAdd(P, d);
      } while (Qp.some((x) => Math.abs(x.z) > 9) || (variante === "wurzel" && Number.isInteger(betragNum(d))));
      const v = nach(P, Qp);
      return {
        text: `Berechne den Abstand der Punkte ${$(pT(P, "P"))} und ${$(pT(Qp, "Q"))}.`,
        schritte: [
          vektorS("v", "Verbindungsvektor", "Bestimme $\\vec{PQ}$ (Spitze minus Fuß).", "$\\vec{PQ} =$", v),
          betragS("d", "Abstand", "Berechne die Länge des Vektors: $\\sqrt{v_1^2 + v_2^2 + v_3^2}$.", "$\\overline{PQ} =$", v, { fehler: [{ wert: qNum(v.reduce((s, x) => qAdd(s, x), q(0))), text: "Nicht die Einträge addieren – quadrieren, addieren, Wurzel ziehen." }] }),
        ],
        weg: [`$\\vec{PQ} = ${vT(Qp)} ${MINUS} ${vT(P)} = ${vT(v)}$`, `$\\overline{PQ} = ${betragWegT(v)}$`],
      };
    },
  },

  vekQuader: {
    titel: "Quader im Koordinatensystem",
    gen(r) {
      const [a, b] = r() < 0.5 ? eins(r, [[3, 4], [4, 3], [6, 8], [8, 6]]) : [ganz(r, 2, 6), ganz(r, 2, 6)];
      const c = ganz(r, 1, 5);
      const E = [[0, 0, 0], [a, 0, 0], [a, b, 0], [0, b, 0], [0, 0, c], [a, 0, c], [a, b, c], [0, b, c]];
      const N = ["O", "A", "B", "C", "D", "E", "F", "G"];
      const boden = vek(a, b, 0), raum = vek(a, b, c);
      return {
        text: `Ein Quader hat die Ecke $O$ im Ursprung, die Ecken ${$(pT(vek(a, 0, 0), "A"))} und ${$(pT(vek(0, b, 0), "C"))} im Boden und ist ${c} hoch. Gib die Ecken $B$ (vierte Bodenecke), $F$ (über $B$) und $G$ (über $C$) an und berechne die Länge der Bodendiagonale $\\overline{OB}$ und der Raumdiagonale $\\overline{OF}$.`,
        schritte: [
          punktS("B", "Ecke B", "Die vierte Bodenecke hat die $x_1$-Koordinate von $A$ und die $x_2$-Koordinate von $C$.", "$B =$", vq(E[2])),
          punktS("F", "Ecke F", `$F$ liegt ${c} über $B$.`, "$F =$", vq(E[6])),
          punktS("G", "Ecke G", `$G$ liegt ${c} über $C$.`, "$G =$", vq(E[7])),
          betragS("ob", "Bodendiagonale", "Länge von $\\vec{OB}$:", "$\\overline{OB} =$", boden),
          betragS("of", "Raumdiagonale", "Länge von $\\vec{OF}$:", "$\\overline{OF} =$", raum),
        ],
        weg: [
          `Ecken: ${E.map((p, i) => $(pT(vq(p), N[i]))).join(", ")}`,
          `$\\overline{OB} = \\sqrt{${a}^2 + ${b}^2} = ${betragT(boden)}$`,
          `$\\overline{OF} = \\sqrt{${a}^2 + ${b}^2 + ${c}^2} = ${betragT(raum)}$`,
        ],
      };
    },
  },

  vekDreieckArt: {
    titel: "Dreieck: gleichschenklig, rechtwinklig?",
    gen(r, variante) {
      // Gleichschenklig bei A: |AB| = |AC|; rechtwinklig zusätzlich AB·AC = 0
      let A, u, v, B, C;
      for (let i = 0; i < 500; i++) {
        A = zufPunkt(r, -3, 4);
        u = r() < 0.6 ? schoenerVek(r, { mind: 2 }) : zufVek(r, -3, 3);
        if (variante === "rechtwinklig") {
          // v senkrecht zu u mit gleichem Betrag: zwei Einträge tauschen, eines negieren (dritter Eintrag 0)
          const [u1, u2, u3] = u.map(qNum);
          const kand = [[-u2, u1, 0], [u2, -u1, 0], [-u3, 0, u1], [u3, 0, -u1], [0, -u3, u2], [0, u3, -u2]].filter((w) => w.some((x) => x !== 0) && w[0] * w[0] + w[1] * w[1] + w[2] * w[2] === u1 * u1 + u2 * u2 + u3 * u3);
          if (!kand.length) continue;
          v = vq(eins(r, kand));
        } else {
          v = mische(r, u.map((x) => qMul(x, q(vz(r)))));
        }
        B = vAdd(A, u); C = vAdd(A, v);
        if (vGleich(u, v) || vGleich(u, vSkal(-1, v)) || kollinearFaktor(u, v) !== null || [B, C].some((P) => P.some((x) => Math.abs(x.z) > 8))) continue;
        break;
      }
      const w = nach(B, C);
      const lab = qNum(vBetrag2(u)), lac = qNum(vBetrag2(v)), lbc = qNum(vBetrag2(w));
      const rechtw = lab + lac === lbc;
      const schritte = [
        betragS("ab", "Seite AB", "Berechne $|\\vec{AB}|$.", "$\\overline{AB} =$", u),
        betragS("ac", "Seite AC", "Berechne $|\\vec{AC}|$.", "$\\overline{AC} =$", v),
        betragS("bc", "Seite BC", "Berechne $|\\vec{BC}|$.", "$\\overline{BC} =$", w),
        wahlS("gl", "Gleichschenklig?", "Zwei gleich lange Seiten?", JA_NEIN, "ja"),
      ];
      if (variante === "rechtwinklig") schritte.push(wahlS("rw", "Rechtwinklig?", "Prüfe mit dem Satz des Pythagoras: $\\overline{AB}^2 + \\overline{AC}^2 = \\overline{BC}^2$?", JA_NEIN, rechtw ? "ja" : "nein"));
      const weg = [
        `$\\vec{AB} = ${vT(u)}$, $|\\vec{AB}| = ${betragWegT(u)}$`,
        `$\\vec{AC} = ${vT(v)}$, $|\\vec{AC}| = ${betragWegT(v)}$`,
        `$\\vec{BC} = ${vT(w)}$, $|\\vec{BC}| = ${betragWegT(w)}$`,
        `$\\overline{AB} = \\overline{AC}$: Das Dreieck ist gleichschenklig mit der Spitze $A$.`,
      ];
      if (variante === "rechtwinklig") weg.push(rechtw ? `$\\overline{AB}^2 + \\overline{AC}^2 = ${lab} + ${lac} = ${lbc} = \\overline{BC}^2$: rechter Winkel bei $A$.` : `$${lab} + ${lac} \\ne ${lbc}$: nicht rechtwinklig.`);
      return {
        text: variante === "rechtwinklig"
          ? `Zeige: Das Dreieck mit ${$(pT(A, "A"))}, ${$(pT(B, "B"))}, ${$(pT(C, "C"))} ist gleichschenklig. Ist es auch rechtwinklig?`
          : `Zeige, dass das Dreieck mit ${$(pT(A, "A"))}, ${$(pT(B, "B"))}, ${$(pT(C, "C"))} gleichschenklig ist.`,
        schritte, weg,
      };
    },
  },

  vekAbstandParam: {
    titel: "Parameter a bei vorgegebenem Abstand",
    gen(r) {
      // P(a | p2 | p3), Q(q1 | q2 | q3): (a − q1)² + d2² + d3² = d²
      let Qp, d2, d3, d, k;
      do {
        Qp = zufPunkt(r, -3, 3);
        const m = eins(r, GANZE_BETRAEGE.filter((x) => x.every((y) => y !== 0)));
        [k, d2, d3] = mische(r, m.map((x) => x * vz(r)));
        d = Math.sqrt(k * k + d2 * d2 + d3 * d3);
      } while (!Number.isInteger(d));
      const p2 = qNum(Qp[1]) + d2, p3 = qNum(Qp[2]) + d3;
      const q1 = qNum(Qp[0]);
      const a1 = q1 + Math.abs(k), a2 = q1 - Math.abs(k);
      const rest = d2 * d2 + d3 * d3;
      const aK = (k) => (k === 0 ? "a" : `(a${plusK(k)})`);
      return {
        text: `Für welche Zahlen $a$ hat der Punkt $P(a \\mid ${zT(p2)} \\mid ${zT(p3)})$ vom Punkt ${$(pT(Qp, "Q"))} den Abstand ${d}?`,
        schritte: [listeS("a", "Werte von a", "Setze den Abstand in die Formel ein, quadriere und löse nach $a$ auf. Gib beide Werte an.", "$a =$", [a1, a2].sort((x, y) => x - y), { hinweis: `$${aK(-q1)}^2 + ${d2 * d2} + ${d3 * d3} = ${d * d}$` })],
        weg: [
          `$\\overline{PQ}^2 = ${aK(-q1)}^2 + ${kz(d2)}^2 + ${kz(d3)}^2 = ${d}^2$`,
          `$${aK(-q1)}^2 = ${d * d} ${MINUS} ${rest} = ${k * k}$, also $a${plusK(-q1)} = \\pm ${Math.abs(k)}$`,
          `$a = ${zT(a1)}$ oder $a = ${zT(a2)}$`,
        ],
      };
    },
  },

  vekVerbindung: {
    titel: "Verbindungsvektor zweier Punkte",
    gen(r, variante) {
      let A, B, v;
      do { A = zufPunkt(r); v = variante === "verschieben" ? schoenerVek(r, { mind: 2 }) : zufVek(r, -5, 5); B = vAdd(A, v); } while (B.some((x) => Math.abs(x.z) > 9) || vNull(v));
      const schritte = [vektorS("ab", "Vektor AB", `Spitze minus Fuß: $\\vec{AB} = \\vec{b} ${MINUS} \\vec{a}$.`, "$\\vec{AB} =$", v)];
      const weg = [`$\\vec{AB} = ${vT(B)} ${MINUS} ${vT(A)} = ${vT(v)}$`];
      if (variante === "verschieben") {
        const C = vAdd(B, v);
        schritte.push(
          betragS("d", "Abstand", "Berechne $|\\vec{AB}|$.", "$\\overline{AB} =$", v),
          punktS("c", "Punkt C", "Verschiebe $B$ um $\\vec{AB}$: $\\vec{c} = \\vec{b} + \\vec{AB}$.", "$C =$", C),
          wahlS("mitte", "Lage von B", "Was ist $B$ für die Strecke $\\overline{AC}$?", [["mitte", "der Mittelpunkt"], ["drittel", "ein Drittelpunkt"], ["ende", "ein Endpunkt"]], "mitte"),
        );
        weg.push(`$\\overline{AB} = ${betragWegT(v)}$`, `$\\vec{c} = ${vT(B)} + ${vT(v)} = ${vT(C)}$, also ${$(pT(C, "C"))}`, `$\\vec{AB} = \\vec{BC}$: $B$ ist der Mittelpunkt von $\\overline{AC}$.`);
      } else {
        schritte.push(vektorS("ba", "Vektor BA", "Der Gegenvektor.", "$\\vec{BA} =$", vSkal(-1, v)));
        weg.push(`$\\vec{BA} = ${MINUS}\\vec{AB} = ${vT(vSkal(-1, v))}$`);
      }
      return {
        text: variante === "verschieben"
          ? `Bestimme $\\vec{AB}$ und den Abstand der Punkte ${$(pT(A, "A"))} und ${$(pT(B, "B"))}. Auf welchen Punkt $C$ verschiebt $\\vec{AB}$ den Punkt $B$? Was ist $B$ für die Strecke $\\overline{AC}$?`
          : `Bestimme $\\vec{AB}$ und $\\vec{BA}$ für ${$(pT(A, "A"))} und ${$(pT(B, "B"))}.`,
        schritte, weg,
      };
    },
  },

  vekBetrag: {
    titel: "Betrag eines Vektors",
    gen(r, variante) {
      let v;
      do { v = variante === "wurzel" ? zufVek(r, -4, 4) : schoenerVek(r, { mind: 2 }); } while (variante === "wurzel" && Number.isInteger(betragNum(v)));
      return {
        text: `Berechne den Betrag des Vektors $\\vec{v} = ${vT(v)}$.`,
        schritte: [betragS("b", "Betrag", "$|\\vec{v}| = \\sqrt{v_1^2 + v_2^2 + v_3^2}$", "$|\\vec{v}| =$", v, { fehler: [{ wert: qNum(v.reduce((s, x) => qAdd(s, x), q(0))), text: "Nicht die Einträge addieren – erst quadrieren, dann addieren, dann Wurzel ziehen." }, { wert: qNum(vBetrag2(v)), text: "Die Wurzel fehlt noch." }] })],
        weg: [`$|\\vec{v}| = ${betragWegT(v)}$`],
      };
    },
  },

  vekParallelogramm: {
    titel: "Ist ABCD ein Parallelogramm?",
    gen(r) {
      const ist = r() < 0.5;
      let A, B, C, D, u, w;
      do {
        A = zufPunkt(r, -2, 5); u = zufVek(r, -3, 3); w = zufVek(r, -3, 4);
        B = vAdd(A, u); D = vAdd(A, w); C = vAdd(D, u);
        if (!ist) { const i = ganz(r, 0, 2); C = C.map((x, j) => (j === i ? qAdd(x, q(eins(r, [1, -1, 2]))) : x)); }
      } while (kollinearFaktor(u, w) !== null || [B, C, D].some((P) => P.some((x) => Math.abs(x.z) > 9)));
      const dc = nach(D, C);
      return {
        text: `Prüfe, ob $ABCD$ mit ${$(pT(A, "A"))}, ${$(pT(B, "B"))}, ${$(pT(C, "C"))}, ${$(pT(D, "D"))} ein Parallelogramm ist.`,
        schritte: [
          vektorS("ab", "Vektor AB", "Berechne $\\vec{AB}$.", "$\\vec{AB} =$", u),
          vektorS("dc", "Vektor DC", "Berechne $\\vec{DC}$.", "$\\vec{DC} =$", dc),
          wahlS("p", "Parallelogramm?", "Ein Parallelogramm hat $\\vec{AB} = \\vec{DC}$.", JA_NEIN, ist ? "ja" : "nein"),
        ],
        weg: [`$\\vec{AB} = ${vT(B)} ${MINUS} ${vT(A)} = ${vT(u)}$`, `$\\vec{DC} = ${vT(C)} ${MINUS} ${vT(D)} = ${vT(dc)}$`, ist ? `$\\vec{AB} = \\vec{DC}$: $ABCD$ ist ein Parallelogramm.` : `$\\vec{AB} \\ne \\vec{DC}$: $ABCD$ ist kein Parallelogramm.`],
      };
    },
  },

  vekBetragParam: {
    titel: "Parameter t bei vorgegebenem Betrag",
    gen(r) {
      const m = eins(r, GANZE_BETRAEGE.filter((x) => x.every((y) => y !== 0)));
      const k = mische(r, m.map((x) => x * vz(r)));
      const n = Math.sqrt(k[0] ** 2 + k[1] ** 2 + k[2] ** 2);
      const t0 = ganz(r, 1, 3);
      const L = n * t0;
      const v = (t) => vek(k[0] * t, k[1] * t, k[2] * t);
      const et = (c) => (c === 1 ? "t" : c === -1 ? `${MINUS}t` : `${c < 0 ? MINUS : ""}${Math.abs(c)}t`);
      return {
        text: `Für welche Zahlen $t$ hat der Vektor $\\spalte{${et(k[0])}}{${et(k[1])}}{${et(k[2])}}$ den Betrag ${L}?`,
        schritte: [listeS("t", "Werte von t", "Berechne den Betrag in Abhängigkeit von $t$ und setze ihn gleich " + L + ". Gib beide Werte an.", "$t =$", [-t0, t0], { hinweis: `$\\sqrt{${k[0] * k[0]}t^2 + ${k[1] * k[1]}t^2 + ${k[2] * k[2]}t^2} = ${n}|t|$` })],
        weg: [
          `$\\sqrt{(${et(k[0])})^2 + (${et(k[1])})^2 + (${et(k[2])})^2} = \\sqrt{${k[0] ** 2 + k[1] ** 2 + k[2] ** 2}t^2} = ${n}|t|$`,
          `$${n}|t| = ${L}$, also $t = ${t0}$ oder $t = ${MINUS}${t0}$: $${vT(v(t0))}$ bzw. $${vT(v(-t0))}$`,
        ],
      };
    },
  },

  vekLinKomb: {
    titel: "Rechnen mit Vektoren",
    gen(r, variante) {
      let a, b, c;
      do { a = zufVek(r, -4, 4); b = zufVek(r, -4, 4); c = zufVek(r, -4, 4); } while (vGleich(a, b) || vGleich(a, c));
      const V = { a, b, c };
      const FORMEN = [
        [[1, "a"], [1, "b"]], [[1, "a"], [-1, "b"]], [[2, "a"], [1, "c"]], [[1, "a"], [1, "b"], [1, "c"]], [[3, "a"], [-2, "b"]], [[-1, "b"], [2, "c"]], [[2, "a"], [-3, "c"]],
      ];
      const form = variante === "einfach" ? eins(r, FORMEN.slice(0, 2)) : eins(r, FORMEN);
      const halb = variante !== "einfach" && r() < 0.25;
      let res = form.reduce((s, [k, n]) => vAdd(s, vSkal(k, V[n])), vek(0, 0, 0));
      if (halb) res = vSkal(q(1, 2), res);
      const ausdruck = summeT(form.map(([k, n]) => [k, `\\vec{${n}}`]));
      const tex = halb ? `\\frac{1}{2}(${ausdruck})` : ausdruck;
      const namen = [...new Set(form.map(([, n]) => n))];
      const innen = form.reduce((s, [k, n]) => vAdd(s, vSkal(k, V[n])), vek(0, 0, 0));
      const weg = [`$${ausdruck} = ${form.map(([k, n]) => malT(k, vT(V[n]))).join(" + ").replace(/\+ −/g, `${MINUS} `)} = ${kompT(form.map(([k, n]) => [k, V[n]]))} = ${vT(innen)}$`];
      if (halb) weg.push(`$\\frac{1}{2} \\cdot ${vT(innen)} = ${vT(res)}$`);
      return {
        text: `Berechne $${tex}$ für ${namen.map((n) => `$\\vec{${n}} = ${vT(V[n])}$`).join(", ")}.`,
        schritte: [vektorS("v", "Ergebnis", "Rechne komponentenweise: erst mit den Zahlen multiplizieren, dann addieren.", `$${tex} =$`, res)],
        weg,
      };
    },
  },

  vekMittelpunkt: {
    titel: "Mittelpunkt und Schwerpunkt",
    gen(r, variante) {
      if (variante === "schwerpunkt") {
        let A, B, C, S;
        do { A = zufPunkt(r); B = zufPunkt(r); C = zufPunkt(r); S = vSkal(q(1, 3), vAdd(vAdd(A, B), C)); } while (S.some((x) => x.n !== 1) || kollinearFaktor(nach(A, B), nach(A, C)) !== null);
        return {
          text: `Bestimme den Schwerpunkt $S$ des Dreiecks ${$(pT(A, "A"))}, ${$(pT(B, "B"))}, ${$(pT(C, "C"))}.`,
          schritte: [punktS("s", "Schwerpunkt", "$\\vec{s} = \\frac{1}{3}(\\vec{a} + \\vec{b} + \\vec{c})$", "$S =$", S)],
          weg: [`$\\vec{s} = \\frac{1}{3}\\left(${vT(A)} + ${vT(B)} + ${vT(C)}\\right) = \\frac{1}{3} \\cdot ${vT(vAdd(vAdd(A, B), C))} = ${vT(S)}$`, `${$(pT(S, "S"))}`],
        };
      }
      let A, B, M;
      do { A = zufPunkt(r, -6, 6); B = zufPunkt(r, -6, 6); M = mittelpunkt(A, B); } while (vGleich(A, B) || (variante !== "bruch" && M.some((x) => x.n !== 1)));
      return {
        text: `Bestimme den Mittelpunkt $M$ der Strecke $\\overline{AB}$ mit ${$(pT(A, "A"))} und ${$(pT(B, "B"))}.`,
        schritte: [punktS("m", "Mittelpunkt", "$\\vec{m} = \\frac{1}{2}(\\vec{a} + \\vec{b})$", "$M =$", M)],
        weg: [`$\\vec{m} = \\frac{1}{2}\\left(${vT(A)} + ${vT(B)}\\right) = \\frac{1}{2} \\cdot ${vT(vAdd(A, B))} = ${vT(M)}$`, `${$(pT(M, "M"))}`],
      };
    },
  },

  vekEndpunkt: {
    titel: "Endpunkt aus Mittelpunkt bestimmen",
    gen(r) {
      let A, M, B;
      do { A = zufPunkt(r); M = zufPunkt(r); B = vSub(vSkal(2, M), A); } while (vGleich(A, M) || B.some((x) => Math.abs(x.z) > 9));
      return {
        text: `${$(pT(M, "M"))} ist der Mittelpunkt der Strecke $\\overline{AB}$ mit ${$(pT(A, "A"))}. Bestimme $B$.`,
        schritte: [punktS("b", "Punkt B", `$\\vec{b} = \\vec{a} + 2\\,\\vec{AM} = 2\\vec{m} ${MINUS} \\vec{a}$`, "$B =$", B, { hinweis: `$\\vec{AM} = ${vT(nach(A, M))}$` })],
        weg: [`$\\vec{AM} = ${vT(M)} ${MINUS} ${vT(A)} = ${vT(nach(A, M))}$`, `$\\vec{b} = \\vec{a} + 2\\,\\vec{AM} = ${vT(A)} + 2 \\cdot ${vT(nach(A, M))} = ${vT(B)}$`, `${$(pT(B, "B"))}`],
      };
    },
  },

  vekEinheit: {
    titel: "Einheitsvektor und Vektor vorgegebener Länge",
    gen(r, variante) {
      const u = schoenerVek(r, { mind: 2 });
      const lu = betragNum(u);
      const e = vSkal(q(1, lu), u);
      const schritte = [
        zahlS("l", "Betrag", "Berechne $|\\vec{u}|$.", "$|\\vec{u}| =$", lu),
        vektorS("e", "Einheitsvektor", "Teile jeden Eintrag durch den Betrag.", "$\\vec{u}^{\\,0} =$", e),
      ];
      const weg = [`$|\\vec{u}| = ${betragWegT(u)}$`, `$\\vec{u}^{\\,0} = \\frac{1}{${lu}} \\cdot ${vT(u)} = ${vT(e)}$`];
      let text = `Bestimme den Einheitsvektor zu $\\vec{u} = ${vT(u)}$.`;
      if (variante === "laenge") {
        const L = lu * ganz(r, 2, 4);
        const w = vSkal(q(L, lu), u);
        schritte.push(vektorS("w", `Länge ${L}`, `Welcher Vektor der Länge ${L} zeigt in Richtung $\\vec{u}$? Multipliziere den Einheitsvektor mit ${L}.`, "$\\vec{w} =$", w));
        weg.push(`$\\vec{w} = ${L} \\cdot \\vec{u}^{\\,0} = ${zT(q(L, lu))} \\cdot ${vT(u)} = ${vT(w)}$`);
        text += ` Welcher Vektor der Länge ${L} zeigt in Richtung $\\vec{u}$?`;
      }
      return { text, schritte, weg };
    },
  },

  vekVereinfachen: {
    titel: "Vektorterme vereinfachen",
    gen(r) {
      // p(a + m b) + s b − t a  → (p − t) a + (p m + s) b
      let p, m, s, t, ka, kb;
      do { p = ganz(r, 2, 4); m = ganz(r, -3, 3, [0]); s = ganz(r, -5, 5, [0]); t = ganz(r, -3, 3, [0]); ka = p - t; kb = p * m + s; } while (ka === 0 && kb === 0);
      const innen = summeT([[1, "\\vec{a}"], [m, "\\vec{b}"]]);
      const term = `${p}(${innen}) ${s < 0 ? MINUS : "+"} ${summeT([[Math.abs(s), "\\vec{b}"]])} ${t < 0 ? "+" : MINUS} ${summeT([[Math.abs(t), "\\vec{a}"]])}`;
      const erg = summeT([[ka, "\\vec{a}"], [kb, "\\vec{b}"]]);
      const OPT = mische(r, [
        ["r", `$${erg}$`],
        ["f1", `$${summeT([[p - t, "\\vec{a}"], [m + s, "\\vec{b}"]])}$`],
        ["f2", `$${summeT([[p + t, "\\vec{a}"], [p * m + s, "\\vec{b}"]])}$`],
      ].filter((o, i, arr) => o[0] === "r" || o[1] !== arr[0][1]));
      return {
        text: `Vereinfache: $${term}$`,
        schritte: [
          zahlS("ka", "Koeffizient von a", "Multipliziere die Klammer aus und fasse die $\\vec{a}$-Glieder zusammen.", "Zahl vor $\\vec{a}$:", ka),
          zahlS("kb", "Koeffizient von b", "Fasse die $\\vec{b}$-Glieder zusammen.", "Zahl vor $\\vec{b}$:", kb, { fehler: [{ wert: m + s, text: "Beim Ausmultiplizieren muss auch der zweite Summand in der Klammer mit " + p + " multipliziert werden." }] }),
          wahlS("erg", "Ergebnis", "Welcher Term ist es?", OPT, "r"),
        ],
        weg: [`$${term} = ${summeT([[p, "\\vec{a}"], [p * m, "\\vec{b}"], [s, "\\vec{b}"], [-t, "\\vec{a}"]])}$`, `$= ${erg}$`],
      };
    },
  },

  vekViertePunkt: {
    titel: "Vierter Punkt eines Parallelogramms",
    gen(r, variante) {
      let A, B, C, D, u, w;
      do { A = zufPunkt(r, -3, 5); u = zufVek(r, -4, 4); w = zufVek(r, -4, 4); B = vAdd(A, u); C = vAdd(B, w); D = vAdd(A, w); } while (kollinearFaktor(u, w) !== null || [B, C, D].some((P) => P.some((x) => Math.abs(x.z) > 9)));
      const schritte = [punktS("d", "Punkt D", `$\\vec{d} = \\vec{a} + \\vec{BC} = \\vec{a} + \\vec{c} ${MINUS} \\vec{b}$`, "$D =$", D, { hinweis: `$\\vec{BC} = ${vT(w)}$` })];
      const weg = [`$\\vec{BC} = ${vT(C)} ${MINUS} ${vT(B)} = ${vT(w)}$`, `$\\vec{d} = \\vec{a} + \\vec{BC} = ${vT(A)} + ${vT(w)} = ${vT(D)}$, also ${$(pT(D, "D"))}`];
      let text = `Die Punkte ${$(pT(A, "A"))}, ${$(pT(B, "B"))}, ${$(pT(C, "C"))} sind Ecken des Parallelogramms $ABCD$. Bestimme $D$.`;
      if (variante === "diagonalen") {
        const M = mittelpunkt(A, C);
        schritte.push(punktS("m", "Diagonalenmitte", "Berechne den Mittelpunkt von $\\overline{AC}$ und vergleiche mit dem von $\\overline{BD}$.", "$M =$", M));
        weg.push(`Mittelpunkt von $\\overline{AC}$: $\\frac{1}{2}\\left(${vT(A)} + ${vT(C)}\\right) = ${vT(M)}$; von $\\overline{BD}$: $\\frac{1}{2}\\left(${vT(B)} + ${vT(D)}\\right) = ${vT(mittelpunkt(B, D))}$ – gleich: Die Diagonalen halbieren sich.`);
        text += " Zeige, dass sich die Diagonalen gegenseitig halbieren.";
      }
      return { text, schritte, weg };
    },
  },

  vekTeilung: {
    titel: "Strecke in gleich lange Teile zerlegen",
    gen(r, variante) {
      let A, B, v, n;
      n = 3;
      do { A = zufPunkt(r, -3, 5); v = vSkal(3, zufVek(r, -2, 3)); B = vAdd(A, v); } while (B.some((x) => Math.abs(x.z) > 9) || vNull(v));
      const T1 = vAdd(A, vSkal(q(1, 3), v)), T2 = vAdd(A, vSkal(q(2, 3), v));
      if (variante === "drohne") {
        // Drohne: 2/3 der Strecke, Restweg 1/3·|AB| – mit schönem Betrag
        let d;
        do { A = zufPunkt(r, 0, 6); d = schoenerVek(r, { nurVoll: true }); B = vAdd(A, d); } while (B.some((x) => Math.abs(x.z) > 9 || x.z < 0) || betragNum(d) % 3 === 0);
        const Pp = vAdd(A, vSkal(q(2, 3), d));
        const L = betragNum(d), rest = L / 3;
        return {
          text: `Eine Drohne fliegt geradlinig von ${$(pT(A, "A"))} nach ${$(pT(B, "B"))} (Einheit 1 m). Wo ist sie, wenn sie $\\frac{2}{3}$ der Strecke geschafft hat? Wie weit ist sie dann noch von $B$ entfernt?`,
          schritte: [
            punktS("p", "Position", "$\\vec{p} = \\vec{a} + \\frac{2}{3}\\,\\vec{AB}$", "$P =$", Pp, { hinweis: `$\\vec{AB} = ${vT(d)}$` }),
            zahlR("rest", "Restweg", "Noch ein Drittel von $|\\vec{AB}|$. Runde auf eine Nachkommastelle.", "Restweg:", Math.round(rest * 10) / 10, { einheit: "m", tol: 0.06, wertText: `$\\frac{1}{3} \\cdot ${L} = ${zT(q(L, 3))} \\approx ${dezT(rest, 1)}$` }),
          ],
          weg: [`$\\vec{AB} = ${vT(B)} ${MINUS} ${vT(A)} = ${vT(d)}$`, `$\\vec{p} = ${vT(A)} + \\frac{2}{3} \\cdot ${vT(d)} = ${vT(Pp)}$, also ${$(pT(Pp, "P"))}`, `$|\\vec{AB}| = ${betragWegT(d)}$, Restweg $\\frac{1}{3} \\cdot ${L} = ${zT(q(L, 3))} \\approx ${dezT(rest, 1)}$ m`],
        };
      }
      return {
        text: `Die Strecke von ${$(pT(A, "A"))} nach ${$(pT(B, "B"))} wird in drei gleich lange Teile zerlegt. Bestimme die beiden Teilungspunkte $T_1$ und $T_2$.`,
        schritte: [
          vektorS("ab", "Vektor AB", "Berechne $\\vec{AB}$.", "$\\vec{AB} =$", v),
          punktS("t1", "Erster Teilungspunkt", "$\\vec{t}_1 = \\vec{a} + \\frac{1}{3}\\,\\vec{AB}$", "$T_1 =$", T1),
          punktS("t2", "Zweiter Teilungspunkt", "$\\vec{t}_2 = \\vec{a} + \\frac{2}{3}\\,\\vec{AB}$", "$T_2 =$", T2),
        ],
        weg: [`$\\vec{AB} = ${vT(B)} ${MINUS} ${vT(A)} = ${vT(v)}$`, `$\\vec{t}_1 = ${vT(A)} + \\frac{1}{3} \\cdot ${vT(v)} = ${vT(T1)}$, also ${$(pT(T1, "T_1"))}`, `$\\vec{t}_2 = ${vT(A)} + \\frac{2}{3} \\cdot ${vT(v)} = ${vT(T2)}$, also ${$(pT(T2, "T_2"))}`],
      };
    },
  },

  vekMittenviereck: {
    titel: "Seitenmitten eines Vierecks",
    gen(r) {
      let A, B, C, D, M;
      do {
        A = zufPunkt(r, -2, 4); B = zufPunkt(r, -2, 6); C = zufPunkt(r, -2, 6); D = zufPunkt(r, -2, 6);
        M = [[A, B], [B, C], [C, D], [D, A]].map(([P, Qp]) => mittelpunkt(P, Qp));
      } while (M.some((m) => m.some((x) => x.n !== 1)) || kollinearFaktor(nach(A, B), nach(A, C)) !== null || vGleich(M[0], M[1]));
      const v = nach(M[0], M[1]), w = nach(M[3], M[2]);
      return {
        text: `Die Seitenmitten eines Vierecks bilden stets ein Parallelogramm. Prüfe das für ${$(pT(A, "A"))}, ${$(pT(B, "B"))}, ${$(pT(C, "C"))}, ${$(pT(D, "D"))}: Berechne die Mitten $M_1$ von $\\overline{AB}$, $M_2$ von $\\overline{BC}$, $M_3$ von $\\overline{CD}$, $M_4$ von $\\overline{DA}$ und vergleiche $\\vec{M_1M_2}$ mit $\\vec{M_4M_3}$.`,
        schritte: [
          punktS("m1", "Mitte von AB", "", "$M_1 =$", M[0]),
          punktS("m2", "Mitte von BC", "", "$M_2 =$", M[1]),
          punktS("m3", "Mitte von CD", "", "$M_3 =$", M[2]),
          punktS("m4", "Mitte von DA", "", "$M_4 =$", M[3]),
          vektorS("v", "Vektor M₁M₂", "Vergleiche mit $\\vec{M_4M_3}$ – gleich?", "$\\vec{M_1M_2} =$", v),
        ],
        weg: [
          `Seitenmitten: ${M.map((m, i) => $(pT(m, `M_${i + 1}`))).join(", ")}`,
          `$\\vec{M_1M_2} = ${vT(v)}$ und $\\vec{M_4M_3} = ${vT(w)}$ – gleich, also ist $M_1M_2M_3M_4$ ein Parallelogramm.`,
          `Allgemein: $\\vec{M_1M_2} = \\frac{1}{2}(\\vec{c} ${MINUS} \\vec{a}) = \\vec{M_4M_3}$.`,
        ],
      };
    },
  },

  vekKollinear: {
    titel: "Kollineare Vektoren",
    gen(r) {
      const ist = r() < 0.6;
      let u, v, k;
      do {
        u = zufVek(r, -4, 4);
        k = eins(r, [q(2), q(-2), q(3), q(-3), q(1, 2), q(-1, 2), q(1, 3), q(-1, 3), q(-1), q(3, 2)]);
        v = vSkal(k, u);
        if (!ist) { const i = ganz(r, 0, 2); v = v.map((x, j) => (j === i ? qAdd(x, q(eins(r, [1, -1, 2]))) : x)); }
      } while (v.some((x) => x.n !== 1 || Math.abs(x.z) > 9) || kollinearFaktor(u, v) !== null !== ist);
      const schritte = [wahlS("k", "Kollinear?", "Ist $\\vec{v}$ ein Vielfaches von $\\vec{u}$? Vergleiche die Verhältnisse der Einträge.", JA_NEIN, ist ? "ja" : "nein")];
      if (ist) schritte.push(zahlS("r", "Faktor r", "Gib $r$ mit $\\vec{v} = r \\cdot \\vec{u}$ an.", "$r =$", k, { fehler: [{ wert: 1 / qNum(k), text: "Kehrwert: $r$ ist der Faktor von $\\vec{u}$ nach $\\vec{v}$, nicht umgekehrt." }] }));
      const glei = u.map((x, i) => (qNull(x) ? `$${zT(v[i])} = r \\cdot 0$` : `$${zT(v[i])} = r \\cdot ${kz(x)}$ ergibt $r = ${zT(qDiv(v[i], x))}$`));
      return {
        text: `Sind $\\vec{u} = ${vT(u)}$ und $\\vec{v} = ${vT(v)}$ kollinear? Gib gegebenenfalls $r$ mit $\\vec{v} = r \\cdot \\vec{u}$ an.`,
        schritte,
        weg: ist
          ? [`Ansatz $\\vec{v} = r \\cdot \\vec{u}$ zeilenweise: ${glei.join(", ")}.`, `Überall dasselbe $r$: $\\vec{v} = ${malT(k, "\\vec{u}")}$, kollinear mit $r = ${zT(k)}$.`]
          : [`Ansatz $\\vec{v} = r \\cdot \\vec{u}$ zeilenweise: ${glei.join(", ")}.`, `Kein gemeinsames $r$: nicht kollinear.`],
      };
    },
  },

  vekLinKombDarstellen: {
    titel: "Vektor als Linearkombination darstellen",
    gen(r, variante) {
      // a, b mit a3 ≠ 0 frei, b = (0 | b2 | b3): I r a1 = c1, II r a2 + s b2 = c2, III Probe
      const moeglich = variante === "geo" ? true : r() < 0.6;
      let a, b, c, rr, ss;
      do {
        a = [q(eins(r, [1, -1, 2])), q(ganz(r, -3, 3)), q(ganz(r, -3, 3, [0]))];
        b = [q(0), q(eins(r, [1, -1, 2])), q(ganz(r, -3, 4, [0]))];
        rr = ganz(r, -3, 3, [0]); ss = ganz(r, -3, 3, [0]);
        c = vAdd(vSkal(rr, a), vSkal(ss, b));
        if (!moeglich) c = [c[0], c[1], qAdd(c[2], q(eins(r, [1, -1, 2, -2])))];
      } while (kollinearFaktor(a, b) !== null || c.some((x) => Math.abs(x.z) > 12));
      const schritte = [
        zahlS("r", "r aus Zeile I", "Setze $\\vec{c} = r\\vec{a} + s\\vec{b}$ an. In Zeile I kommt nur $r$ vor.", "$r =$", rr, { hinweis: `$\\text{I}\\quad ${summeT([[a[0], "r"]])} = ${zT(c[0])}$` }),
        zahlS("s", "s aus Zeile II", "Setze $r$ in Zeile II ein.", "$s =$", ss),
        wahlS("ok", "Probe in Zeile III", "Erfüllen $r$ und $s$ auch die dritte Gleichung?", [["ja", "ja – Darstellung möglich"], ["nein", "nein – nicht möglich"]], moeglich ? "ja" : "nein"),
      ];
      const links3 = einsetzT([[a[2], q(rr)], [b[2], q(ss)]]);
      const wert3 = qAdd(qMul(a[2], q(rr)), qMul(b[2], q(ss)));
      const weg = [
        `Ansatz $r \\cdot ${vT(a)} + s \\cdot ${vT(b)} = ${vT(c)}$: $\\text{I}\\quad ${summeT([[a[0], "r"]])} = ${zT(c[0])}$, $\\text{II}\\quad ${summeT([[a[1], "r"], [b[1], "s"]])} = ${zT(c[1])}$, $\\text{III}\\quad ${summeT([[a[2], "r"], [b[2], "s"]])} = ${zT(c[2])}$`,
        `Aus $\\text{I}$: $r = ${zT(rr)}$; in $\\text{II}$: $s = ${zT(ss)}$`,
        moeglich
          ? `Probe $\\text{III}$: $${links3} = ${zT(wert3)}$ ✓, also $\\vec{c} = ${summeT([[rr, "\\vec{a}"], [ss, "\\vec{b}"]])}$`
          : `Probe $\\text{III}$: $${links3} = ${zT(wert3)} \\ne ${zT(c[2])}$: nicht möglich – $\\vec{c}$ ist keine Linearkombination von $\\vec{a}$ und $\\vec{b}$.`,
      ];
      if (variante === "geo") {
        schritte.push(wahlS("geo", "Geometrische Bedeutung", "Was bedeutet das Ergebnis?", [["komplanar", "Die drei Vektoren sind komplanar: $\\vec{c}$ liegt in der von $\\vec{a}$ und $\\vec{b}$ aufgespannten Ebene."], ["kollinear", "Die drei Vektoren sind kollinear."], ["unabh", "Die drei Vektoren sind linear unabhängig."]], "komplanar"));
        weg.push(`Die drei Vektoren sind komplanar: $\\vec{c}$ liegt in der von $\\vec{a}$ und $\\vec{b}$ aufgespannten Ebene.`);
      }
      return {
        text: variante === "geo"
          ? `Ist $\\vec{c} = ${vT(c)}$ eine Linearkombination von $\\vec{a} = ${vT(a)}$ und $\\vec{b} = ${vT(b)}$? Was bedeutet das Ergebnis geometrisch?`
          : `Stelle $\\vec{c} = ${vT(c)}$ als Linearkombination von $\\vec{a} = ${vT(a)}$ und $\\vec{b} = ${vT(b)}$ dar, falls möglich.`,
        schritte, weg,
      };
    },
  },

  vekLinAbh: {
    titel: "Lineare Abhängigkeit dreier Vektoren",
    gen(r) {
      const abh = r() < 0.5;
      let a, b, c, p, s;
      do {
        [a, b] = zweiRichtungen(r, -3, 3);
        if (abh) { p = ganz(r, -2, 3, [0]); s = ganz(r, -2, 3, [0]); c = vAdd(vSkal(p, a), vSkal(s, b)); }
        else c = zufVek(r, -3, 4);
      } while (c.some((x) => Math.abs(x.z) > 8) || (det3([a, b, c].map(vNum)) === 0) !== abh || [a, b, c].some((v) => vNull(v)) || (!abh && kollinearFaktor(a, c) !== null) || qNull(a[0]) || qNull(a[1]) && qNull(b[1]));
      // Gauß für r a + s b + t c = 0 (Spalten = Vektoren)
      const A = [0, 1, 2].map((i) => [qNum(a[i]), qNum(b[i]), qNum(c[i])]);
      const g = gauss(A, [0, 0, 0], ["r", "s", "t"]);
      const weg = [`Ansatz $r\\vec{a} + s\\vec{b} + t\\vec{c} = \\vec{0}$: ${lgsZeilen(A, [0, 0, 0], ["r", "s", "t"]).join(", ")}`, ...g.schritte];
      if (abh) weg.push(`Eine Nullzeile: Es gibt Lösungen außer $r = s = t = 0$, z. B. $${summeT([[p, "\\vec{a}"], [s, "\\vec{b}"], [-1, "\\vec{c}"]])} = \\vec{0}$. Die Vektoren sind linear abhängig.`);
      else weg.push(`Nur $r = s = t = 0$ löst das System: Die Vektoren sind linear unabhängig.`);
      return {
        text: `Untersuche die Vektoren $${vT(a)}$, $${vT(b)}$ und $${vT(c)}$ auf lineare Abhängigkeit.`,
        schritte: [wahlS("abh", "Ergebnis", "Löse $r\\vec{a} + s\\vec{b} + t\\vec{c} = \\vec{0}$ mit dem Gauß-Verfahren. Gibt es eine Lösung außer $r = s = t = 0$?", [["abh", "linear abhängig"], ["unabh", "linear unabhängig"]], abh ? "abh" : "unabh", { hinweis: "Eine Nullzeile in der Stufenform bedeutet: abhängig." })],
        weg,
      };
    },
  },

  vekPunkteGerade: {
    titel: "Liegen drei Punkte auf einer Geraden?",
    gen(r) {
      const ja = r() < 0.5;
      let A, B, C, u, k;
      do {
        A = zufPunkt(r); u = zufVek(r, -3, 3); k = eins(r, [2, 3, -1, -2, 4]);
        B = vAdd(A, u); C = vAdd(A, vSkal(k, u));
        if (!ja) { const i = ganz(r, 0, 2); C = C.map((x, j) => (j === i ? qAdd(x, q(eins(r, [1, -1, 2]))) : x)); }
      } while ([B, C].some((P) => P.some((x) => Math.abs(x.z) > 9)) || (kollinearFaktor(u, nach(A, C)) !== null) !== ja);
      const ac = nach(A, C);
      return {
        text: `Liegen die Punkte ${$(pT(A, "A"))}, ${$(pT(B, "B"))} und ${$(pT(C, "C"))} auf einer Geraden?`,
        schritte: [
          vektorS("ab", "Vektor AB", "", "$\\vec{AB} =$", u),
          vektorS("ac", "Vektor AC", "", "$\\vec{AC} =$", ac),
          wahlS("ja", "Auf einer Geraden?", "Sind $\\vec{AB}$ und $\\vec{AC}$ kollinear?", JA_NEIN, ja ? "ja" : "nein"),
        ],
        weg: [`$\\vec{AB} = ${vT(u)}$, $\\vec{AC} = ${vT(ac)}$`, ja ? `$\\vec{AC} = ${malT(k, "\\vec{AB}")}$: kollinear, die Punkte liegen auf einer Geraden.` : `$\\vec{AC}$ ist kein Vielfaches von $\\vec{AB}$: Die Punkte liegen nicht auf einer Geraden.`],
      };
    },
  },

  vekParamK: {
    /* Die 2×2-Unterdeterminante von a, b ohne Zeile i darf nicht 0 sein – sonst hängt die Abhängigkeit nicht von k ab */
    titel: "Parameter k für lineare Abhängigkeit",
    gen(r, variante) {
      // a, b fest; c = p a + s b, k = Eintrag von c an Position i (Position „k“)
      let a, b, c, p, s, i, kk, A, g;
      do {
        [a, b] = zweiRichtungen(r, -3, 3);
        p = ganz(r, -2, 3, [0]); s = ganz(r, -3, 3, [0]);
        c = vAdd(vSkal(p, a), vSkal(s, b));
        i = ganz(r, 0, 2);
        kk = c[i];
        // Gleichungssystem mit k an Stelle i: in der Zeile i steht r·a_i + s·b_i + t·k = 0
        A = [0, 1, 2].map((j) => [qNum(a[j]), qNum(b[j]), qNum(c[j])]);
        g = gauss(A, [0, 0, 0], ["r", "s", "t"]);
      } while (c.some((x) => Math.abs(x.z) > 8) || [a, b].some((v) => qNull(v[0]) && qNull(v[1])) || vNull(c) || Math.abs(kk.z) > 6 || minorNull(a, b, i));
      const cTex = `\\spalte{${[0, 1, 2].map((j) => (j === i ? "k" : zT(c[j]))).join("}{")}}`;
      const schritte = [zahlS("k", "Wert von k", "Setze $r\\vec{a} + s\\vec{b} + t\\vec{c} = \\vec{0}$ an, eliminiere mit Gauß und bestimme $k$ so, dass eine Nullzeile entsteht (nichttriviale Lösung).", "$k =$", kk)];
      const weg = [
        `Ansatz $r \\cdot ${vT(a)} + s \\cdot ${vT(b)} + t \\cdot ${cTex} = \\vec{0}$.`,
        `Für $k = ${zT(kk)}$ gilt $${cTex.replace("k", zT(kk))} = ${summeT([[p, vT(a)], [s, vT(b)]])}$, also $${summeT([[p, "\\vec{a}"], [s, "\\vec{b}"], [-1, "\\vec{c}"]])} = \\vec{0}$: abhängig.`,
        `Für jedes andere $k$ bleibt beim Gauß-Verfahren nur $r = s = t = 0$: unabhängig. Also genau für $k = ${zT(kk)}$ linear abhängig.`,
      ];
      if (variante === "nullkomb") {
        const K = [p, s, -1];
        const gg = ggTl(ggTl(Math.abs(p), Math.abs(s)), 1);
        schritte.push(listeS("rst", "Linearkombination", `Gib für $k = ${zT(kk)}$ Zahlen $r$; $s$; $t$ (nicht alle 0) mit $r\\vec{a} + s\\vec{b} + t\\vec{c} = \\vec{0}$ an – in der Form mit $t = ${MINUS}1$.`, "$r; s; t =$", K, { hinweis: `Welche Kombination von $\\vec{a}$ und $\\vec{b}$ ergibt $\\vec{c}$?` }));
      }
      return {
        text: `Für welches $k$ sind $${vT(a)}$, $${vT(b)}$ und $${cTex}$ linear abhängig?${variante === "nullkomb" ? " Gib für diesen Fall eine Linearkombination an, die den Nullvektor ergibt." : ""}`,
        schritte, weg,
      };
    },
  },

  vekKomplanar: {
    titel: "Liegen vier Punkte in einer Ebene?",
    gen(r) {
      const ja = r() < 0.6;
      let A, B, C, D, u, v, w, p, s;
      do {
        A = zufPunkt(r, -2, 3); [u, v] = zweiRichtungen(r, -3, 3);
        B = vAdd(A, u); C = vAdd(A, v);
        p = ganz(r, -2, 2, [0]); s = ganz(r, -2, 2, [0]);
        w = vAdd(vSkal(p, u), vSkal(s, v));
        if (!ja) { const i = ganz(r, 0, 2); w = w.map((x, j) => (j === i ? qAdd(x, q(eins(r, [1, -1, 2]))) : x)); }
        D = vAdd(A, w);
      } while ([B, C, D].some((P) => P.some((x) => Math.abs(x.z) > 8)) || (det3([u, v, w].map(vNum)) === 0) !== ja || vNull(w));
      return {
        text: `Liegen die Punkte ${$(pT(A, "A"))}, ${$(pT(B, "B"))}, ${$(pT(C, "C"))} und ${$(pT(D, "D"))} in einer Ebene? Untersuche $\\vec{AB}$, $\\vec{AC}$ und $\\vec{AD}$.`,
        schritte: [
          vektorS("ab", "Vektor AB", "", "$\\vec{AB} =$", u),
          vektorS("ac", "Vektor AC", "", "$\\vec{AC} =$", v),
          vektorS("ad", "Vektor AD", "", "$\\vec{AD} =$", w),
          wahlS("ja", "In einer Ebene?", "Ist $\\vec{AD}$ eine Linearkombination von $\\vec{AB}$ und $\\vec{AC}$ (komplanar)?", JA_NEIN, ja ? "ja" : "nein"),
        ],
        weg: [
          `$\\vec{AB} = ${vT(u)}$, $\\vec{AC} = ${vT(v)}$, $\\vec{AD} = ${vT(w)}$`,
          ja ? `$\\vec{AD} = ${summeT([[p, "\\vec{AB}"], [s, "\\vec{AC}"]])}$: linear abhängig, also komplanar – die vier Punkte liegen in einer Ebene.` : `$r\\,\\vec{AB} + s\\,\\vec{AC} = \\vec{AD}$ hat keine Lösung (Gauß liefert einen Widerspruch): linear unabhängig – die Punkte liegen nicht in einer Ebene.`,
        ],
      };
    },
  },

  vekBasisKoord: {
    titel: "Koordinaten bezüglich einer Basis",
    gen(r) {
      // Basis a = (1|1|0), b = (0|1|1), c = (1|0|1)-artig; v = x a + y b + z c
      let a, b, c, x, y, z, v;
      do {
        a = vek(1, eins(r, [1, 2, -1]), 0); b = vek(0, 1, eins(r, [1, 2, -1])); c = vek(eins(r, [1, 0, -1]), 0, 1);
        x = ganz(r, -3, 4); y = ganz(r, -3, 4); z = ganz(r, -3, 4, [0]);
        v = vAdd(vAdd(vSkal(x, a), vSkal(y, b)), vSkal(z, c));
      } while (det3([a, b, c].map(vNum)) === 0 || v.some((e) => Math.abs(e.z) > 9) || vNull(v));
      const A = [0, 1, 2].map((i) => [qNum(a[i]), qNum(b[i]), qNum(c[i])]);
      const g = gauss(A, vNum(v), ["x", "y", "z"]);
      return {
        text: `Die Vektoren $\\vec{a} = ${vT(a)}$, $\\vec{b} = ${vT(b)}$, $\\vec{c} = ${vT(c)}$ bilden eine Basis. Bestimme die Koordinaten $x$, $y$, $z$ des Vektors $\\vec{v} = ${vT(v)}$ bezüglich dieser Basis, also $\\vec{v} = x\\vec{a} + y\\vec{b} + z\\vec{c}$.`,
        schritte: [listeS("xyz", "Koordinaten", "Löse das Gleichungssystem $x\\vec{a} + y\\vec{b} + z\\vec{c} = \\vec{v}$. Gib $x$; $y$; $z$ an.", "$x; y; z =$", [x, y, z], { hinweis: lgsZeilen(A, vNum(v), ["x", "y", "z"]).join(" ") })],
        weg: [`Gleichungssystem: ${lgsZeilen(A, vNum(v), ["x", "y", "z"]).join(", ")}`, ...g.schritte, ...rueckweg(g, ["x", "y", "z"]), `$\\vec{v} = ${summeT([[x, "\\vec{a}"], [y, "\\vec{b}"], [z, "\\vec{c}"]])}$, Koordinaten $${zT(x)}$, $${zT(y)}$, $${zT(z)}$.`],
      };
    },
  },
};
Object.assign(TYPEN_1, TYPEN_1_VEK);

/* Buchseite-Nummer → Typ[:Variante] */
export const BUCH_1 = {
  // 1 Zwei Geraden in der Ebene (S. 5)
  "5-1": "lgsSchnitt2d", "5-2": "lgsLage2d", "5-3": "lgsUmstellen", "5-4": "lgsAdd2:schnitt", "5-6": "lgsKerze", "5-7": "lgsSchnitt2d:senkrecht", "5-8": "lgsParallelA",
  // 2 Gauß-Verfahren (S. 7)
  "7-1": "lgsAdd2", "7-2": "lgsStufe", "7-3": "lgsGauss3", "7-5": "lgsParabel", "7-6": "lgsSachtext3", "7-7": "lgsSachtext3:zahlen", "7-8": "lgsEbene3P",
  // 3 Lösungsmengen (S. 9)
  "9-1": "lgsStufeArt", "9-2": "lgsZweiGl", "9-3": "lgsGaussArt", "9-5": "lgsParamAB", "9-6": "lgsUnterbestimmt", "9-7": "lgsParamA3",
  // Training I (S. 10)
  "10-T1": "lgsSchnitt2d", "10-T2": "lgsLage2d:schnitt", "10-T3": "lgsAchsen", "10-T4": "lgsGauss3:probe", "10-T5": "lgsSachtext3:konzert", "10-T6": "lgsGaussArt:unendlich", "10-T7": "lgsSymA",
  // 4 Punkte im Raum (S. 13)
  "13-2": "vekLage", "13-3": "vekAbstand", "13-4": "vekQuader", "13-5": "vekDreieckArt", "13-6": "vekAbstandParam",
  // 5 Vektoren (S. 15)
  "15-1": "vekVerbindung", "15-2": "vekBetrag", "15-3": "vekParallelogramm", "15-4": "vekDreieckArt:rechtwinklig", "15-6": "vekBetragParam",
  // 6 Rechnen mit Vektoren (S. 17)
  "17-1": "vekLinKomb", "17-2": "vekMittelpunkt", "17-3": "vekEndpunkt", "17-4": "vekEinheit:laenge", "17-5": "vekVereinfachen", "17-6": "vekViertePunkt", "17-7": "vekTeilung", "17-8": "vekMittenviereck",
  // 7 Lineare Abhängigkeit (S. 19)
  "19-1": "vekKollinear", "19-2": "vekLinKombDarstellen", "19-3": "vekLinAbh", "19-4": "vekPunkteGerade", "19-5": "vekParamK", "19-6": "vekKomplanar", "19-7": "vekBasisKoord",
  // Training II (S. 20)
  "20-T1": "vekQuader", "20-T2": "vekVerbindung:verschieben", "20-T3": "vekLinKomb", "20-T4": "vekMittelpunkt:schwerpunkt", "20-T5": "vekViertePunkt:diagonalen", "20-T6": "vekLinKombDarstellen:geo", "20-T7": "vekParamK:nullkomb", "20-T8": "vekTeilung:drohne",
};
