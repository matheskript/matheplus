/* ======================================================================
   vekAufgaben2.js – Aufgabentypen zu Kapitel III und IV des Kurses
   „Vektoren, Geraden und Ebenen“ (Band 2):
   III Geraden in Parameterform, Punktprobe, Gerade durch zwei Punkte,
       Lage zweier Geraden (identisch, parallel, schneidend, windschief)
   IV  Skalarprodukt, Orthogonalität, Winkel, Kreuzprodukt, Flächen, Spat
   Jeder Typ: gen(r, variante) → { text, schritte, weg }. r = Zufallsquelle.
   Reine Logik, kein React. Typ-Präfixe: ger… (III), prod… (IV).
   ====================================================================== */
import {
  q, qAdd, qSub, qMul, qDiv, qNeg, qNum, qGleich, qNull, Q, ganz, eins, vz, mische, MINUS,
  zT, dezT, zahlS, zahlR, wahlS, listeS, vektorS, punktS, $,
  vek, zufVek, vAdd, vSub, vSkal, vNeg, vDot, vCross, vNull, vGleich, vBetrag2, mittelpunkt, nach,
  kollinearFaktor, vKuerzen, vT, pT, kz, malT, summeT, geradeT, wurzelT, betragT, betragNum, betragWegT,
  skalarWegT, kreuzWegT, gradAus, gradT, gauss, zweiRichtungen, ROEM,
} from "./vekKern.js";

/* ---------- lokale Hilfen ---------- */
const JA_NEIN = [["ja", "Ja"], ["nein", "Nein"]];
const LAGEN = [["identisch", "identisch"], ["parallel", "echt parallel"], ["schnitt", "sie schneiden sich"], ["windschief", "windschief"]];
const LAGE_TEXT = { identisch: "identisch", parallel: "echt parallel", schnitt: "schneiden sich", windschief: "windschief" };
/* Punkt als Vektor mit Koordinaten lo…hi (Nullvektor erlaubt) */
const zufPunkt = (r, lo = -4, hi = 5) => zufVek(r, lo, hi, { ohneNull: false });
/* Richtungsvektor: kein Nullvektor, nicht nur Nullen und Einsen (zu langweilig) */
const zufRichtung = (r, lo = -3, hi = 3) => zufVek(r, lo, hi);
/* p + k·v als TeX, z. B. „2 + 3t“, „−1 − t“, „4“ (Regel A5) */
function linPlusT(p, k, v) {
  const s = summeT([[k, v]]);
  const pp = Q(p);
  if (pp.z === 0) return s;
  if (s === "0") return zT(pp);
  return s.startsWith(MINUS) ? `${zT(pp)} ${MINUS} ${s.slice(1)}` : `${zT(pp)} + ${s}`;
}
/* Koordinatengleichungen einer Punktprobe: p_i + u_i·t = x_i → t = … */
function probeZeilen(p, u, X) {
  return p.map((pi, i) => {
    const li = linPlusT(pi, u[i], "t");
    if (qNull(u[i])) return `$\\text{${ROEM[i]}}\\quad ${li} = ${zT(X[i])}$ ${qGleich(pi, X[i]) ? "(wahr)" : "(falsch)"}`;
    const t = qDiv(qSub(X[i], pi), u[i]);
    return `$\\text{${ROEM[i]}}\\quad ${li} = ${zT(X[i])}$, also $t = ${zT(t)}$`;
  });
}
/* Liegt X auf der Geraden p + t·u? → { liegt, t } */
function punktprobe(p, u, X) {
  let t = null;
  for (let i = 0; i < 3; i++) {
    if (qNull(u[i])) { if (!qGleich(p[i], X[i])) return { liegt: false, t }; continue; }
    const ti = qDiv(qSub(X[i], p[i]), u[i]);
    if (t === null) t = ti; else if (!qGleich(t, ti)) return { liegt: false, t };
  }
  return { liegt: true, t: t ?? q(0) };
}
/* Punkt auf der Geraden zum Parameter t */
const punktZu = (p, u, t) => vAdd(p, vSkal(t, u));
/* Einsetzen eines Parameters ausgeschrieben: \spalte{p} + 2 · \spalte{u} = \spalte{…} */
const einsetzT = (p, u, t, param = "t") => {
  const tt = Q(t);
  const produkt = tt.z === 0 ? "" : tt.z < 0 ? ` ${MINUS} ${malT(qNeg(tt), vT(u))}` : ` + ${malT(tt, vT(u))}`;
  return `${param} = ${zT(t)}: \\vec{x} = ${vT(p)}${produkt} = ${vT(punktZu(p, u, t))}`;
};

/* Die drei Gleichungen des LGS „p + t·u = q + s·v“ als Zeilen (I, II, III) */
const lgsText = (p, u, qq, v) => p.map((pi, i) => `$\\text{${ROEM[i]}}\\quad ${linPlusT(pi, u[i], "t")} = ${linPlusT(qq[i], v[i], "s")}$`);

/* Lage zweier Geraden g: p + t·u, h: q + s·v.
   → { lage, t, s, S, zeilen: [Weg-Zeilen], kollinear, k } */
function lageGeraden(p, u, qq, v) {
  const k = kollinearFaktor(u, v);
  if (k !== null) {
    const pr = punktprobe(p, u, qq);
    const zeilen = [
      `Richtungsvektoren: $${vT(v)} = ${malT(k, vT(u))}$, also kollinear – die Geraden sind parallel oder identisch.`,
      `Punktprobe mit dem Stützpunkt $${pT(qq, "Q")}$ von $h$ in $g$:`,
      ...probeZeilen(p, u, qq),
      pr.liegt ? `Alle Gleichungen liefern $t = ${zT(pr.t)}$: $Q$ liegt auf $g$. Die Geraden sind identisch.` : `Kein gemeinsames $t$: $Q$ liegt nicht auf $g$. Die Geraden sind echt parallel.`,
    ];
    return { lage: pr.liegt ? "identisch" : "parallel", kollinear: true, k, zeilen, probe: pr };
  }
  // zwei Zeilen mit nicht verschwindender Determinante wählen
  const rows = [[0, 1], [0, 2], [1, 2]];
  let wahl = null;
  for (const [i, j] of rows) {
    const det = qSub(qMul(u[i], qNeg(v[j])), qMul(u[j], qNeg(v[i])));
    if (!qNull(det)) { wahl = [i, j]; break; }
  }
  const [i, j] = wahl, kk = [0, 1, 2].find((x) => x !== i && x !== j);
  const A = [[u[i], qNeg(v[i])], [u[j], qNeg(v[j])]];
  const b = [qSub(qq[i], p[i]), qSub(qq[j], p[j])];
  const G = gauss(A, b, ["t", "s"]);
  const t = G.x[0], s = G.x[1];
  const links = qAdd(p[kk], qMul(t, u[kk])), rechts = qAdd(qq[kk], qMul(s, v[kk]));
  const ok = qGleich(links, rechts);
  const S = punktZu(p, u, t);
  const zeilen = [
    `Richtungsvektoren nicht kollinear: Die Geraden schneiden sich oder sind windschief. Gleichsetzen $\\vec{x}_g = \\vec{x}_h$:`,
    ...lgsText(p, u, qq, v),
    `Aus $\\text{${ROEM[i]}}$ und $\\text{${ROEM[j]}}$: $${summeT([[u[i], "t"], [qNeg(v[i]), "s"]])} = ${zT(b[0])}$ und $${summeT([[u[j], "t"], [qNeg(v[j]), "s"]])} = ${zT(b[1])}$, also $t = ${zT(t)}$, $s = ${zT(s)}$.`,
    `Probe in $\\text{${ROEM[kk]}}$: $${linPlusT(p[kk], u[kk], "t")} = ${linPlusT(qq[kk], v[kk], "s")}$ mit $t = ${zT(t)}$, $s = ${zT(s)}$: $${zT(links)} ${ok ? "=" : "\\ne"} ${zT(rechts)}$ ${ok ? "– erfüllt." : "– Widerspruch."}`,
    ok ? `Die Geraden schneiden sich. Schnittpunkt: $${einsetzT(p, u, t)}$, also $${pT(S, "S")}$.` : `Die dritte Gleichung ist verletzt: Die Geraden sind windschief.`,
  ];
  return { lage: ok ? "schnitt" : "windschief", kollinear: false, t, s, S, zeilen, zeilenIdx: [i, j, kk], links, rechts };
}

/* Zwei Geraden mit vorgegebener Lage erzeugen */
function geradenMitLage(r, lage) {
  for (let n = 0; n < 500; n++) {
    const p = zufPunkt(r, -3, 4), u = zufRichtung(r);
    let qq, v;
    if (lage === "identisch" || lage === "parallel") {
      const k = eins(r, [q(2), q(-2), q(-1), q(3), q(-3), q(1, 2)]);
      v = vSkal(k, u);
      if (!v.every((x) => x.n === 1 && Math.abs(x.z) <= 9)) continue;
      const t0 = q(ganz(r, -3, 3, [0]));
      qq = lage === "identisch" ? punktZu(p, u, t0) : vAdd(punktZu(p, u, t0), zufVek(r, -2, 2));
      if (lage === "parallel" && punktprobe(p, u, qq).liegt) continue;
    } else {
      v = zufRichtung(r);
      if (kollinearFaktor(u, v) !== null) continue;
      const t0 = q(ganz(r, -3, 3, [0])), s0 = q(ganz(r, -3, 3, [0]));
      const S = punktZu(p, u, t0);
      qq = vSub(S, vSkal(s0, v));
      if (lage === "windschief") qq = vAdd(qq, zufVek(r, -2, 2));
    }
    if (qq.some((x) => Math.abs(x.z) > 9)) continue;
    const L = lageGeraden(p, u, qq, v);
    if (L.lage !== lage) continue;
    if (L.t && (Math.abs(L.t.z) > 12 || L.t.n > 4 || L.s.n > 4)) continue;
    return { p, u, q: qq, v, L };
  }
  // Rückfall (kommt praktisch nie vor)
  const p = vek(1, 2, 3), u = vek(2, -1, 1), qq = vek(4, 2, 3), v = vek(1, 1, -1);
  return { p, u, q: qq, v, L: lageGeraden(p, u, qq, v) };
}

/* Schritte zur Lage zweier Geraden (gemeinsam für mehrere Typen) */
function lageSchritte(p, u, qq, v, L) {
  const s = [wahlS("koll", "Richtungsvektoren", "Sind die Richtungsvektoren von $g$ und $h$ kollinear (Vielfache voneinander)?", JA_NEIN, L.kollinear ? "ja" : "nein", { hinweis: "Prüfe, ob es ein $k$ mit $\\vec{v} = k \\cdot \\vec{u}$ gibt – für alle drei Koordinaten dasselbe $k$." })];
  if (L.kollinear) {
    s.push(wahlS("probe", "Punktprobe", `Liegt der Stützpunkt $${pT(qq, "Q")}$ von $h$ auf $g$?`, JA_NEIN, L.probe.liegt ? "ja" : "nein", { hinweis: "Setze $Q$ in $g$ ein und löse jede Koordinatengleichung nach $t$ auf. Es muss dreimal dasselbe $t$ herauskommen." }));
    s.push(wahlS("lage", "Lage", "Wie liegen $g$ und $h$ zueinander?", LAGEN, L.lage, { hinweis: "Kollineare Richtungen: identisch, wenn ein Punkt der einen auf der anderen liegt, sonst echt parallel." }));
  } else {
    const [i, j, kk] = L.zeilenIdx;
    s.push(zahlS("t", "Parameter t", `Setze $g$ und $h$ gleich. Löse die Gleichungen $\\text{${ROEM[i]}}$ und $\\text{${ROEM[j]}}$ nach $t$ und $s$ auf.`, "$t =$", L.t, { hinweis: lgsText(p, u, qq, v).join(", ") }));
    s.push(zahlS("s", "Parameter s", "Und der Wert von $s$?", "$s =$", L.s));
    s.push(wahlS("dritte", "Dritte Gleichung", `Setze $t$ und $s$ in die Gleichung $\\text{${ROEM[kk]}}$ ein. Ist sie erfüllt?`, JA_NEIN, L.lage === "schnitt" ? "ja" : "nein", { hinweis: `$\\text{${ROEM[kk]}}\\quad ${linPlusT(p[kk], u[kk], "t")} = ${linPlusT(qq[kk], v[kk], "s")}$` }));
    s.push(wahlS("lage", "Lage", "Wie liegen $g$ und $h$ zueinander?", LAGEN, L.lage, { hinweis: "Nicht kollinear und das LGS lösbar: Schnittpunkt. Nicht lösbar: windschief." }));
    if (L.lage === "schnitt") s.push(punktS("S", "Schnittpunkt", "Setze $t$ in $g$ ein (oder $s$ in $h$).", "$S =$", L.S, { hinweis: `$${einsetzT(p, u, L.t)}$` }));
  }
  return s;
}

/* ===================== Kapitel III: Geraden ===================== */
export const TYPEN_2 = {
  gerPunkte: {
    titel: "Punkte einer Geraden berechnen",
    gen(r) {
      const p = zufPunkt(r), u = zufRichtung(r);
      const ts = mische(r, [q(0), q(-1), q(ganz(r, 2, 3)), eins(r, [q(1, 2), q(-1, 2), q(3, 2)])]);
      return {
        text: `Gegeben ist die Gerade $${geradeT(p, u)}$. Berechne die Punkte der Geraden zu ${ts.map((t) => `$t = ${zT(t)}$`).join(", ")}.`,
        schritte: ts.map((t, i) => punktS(`p${i}`, `Punkt zu t = ${zT(t).replace(/\\frac\{(\d+)\}\{(\d+)\}/, "$1/$2")}`, `Setze $t = ${zT(t)}$ ein und rechne die Koordinaten aus.`, `$P_${i + 1} =$`, punktZu(p, u, t), i === 0 ? { hinweis: "Stützvektor plus $t$-faches des Richtungsvektors, koordinatenweise." } : {})),
        weg: ts.map((t) => `$${einsetzT(p, u, t)}$`),
      };
    },
  },

  gerPunktprobe: {
    titel: "Punktprobe bei einer Geraden",
    gen(r, variante) {
      let p, u, P, Qp, pr;
      do {
        p = zufPunkt(r); u = zufRichtung(r);
        if (u.filter(qNull).length > 1) continue;
        const tP = q(ganz(r, -3, 3, [0]));
        P = punktZu(p, u, tP);
        const tQ = q(ganz(r, -3, 3, [0]));
        const i = ganz(r, 0, 2);
        Qp = punktZu(p, u, tQ).map((x, j) => (j === i ? qAdd(x, q(ganz(r, 1, 2) * vz(r))) : x));
        pr = punktprobe(p, u, Qp);
      } while (!u || u.filter(qNull).length > 1 || pr.liegt);
      const [erst, zweit] = variante === "tausch" ? [Qp, P] : [P, Qp];
      const prE = punktprobe(p, u, erst), prZ = punktprobe(p, u, zweit);
      const schritt = (id, X, name, pr2) => wahlS(id, `Punkt ${name}`, `Liegt $${pT(X, name)}$ auf $g$? Setze $${name}$ für $\\vec{x}$ ein und löse jede Koordinatengleichung nach $t$ auf.`, JA_NEIN, pr2.liegt ? "ja" : "nein", { hinweis: "Nur wenn alle drei Gleichungen dasselbe $t$ liefern, liegt der Punkt auf der Geraden." });
      return {
        text: `Prüfe, ob die Punkte $${pT(erst, "P")}$ und $${pT(zweit, "Q")}$ auf der Geraden $${geradeT(p, u)}$ liegen.`,
        schritte: [schritt("P", erst, "P", prE), schritt("Q", zweit, "Q", prZ)],
        weg: [
          `Punkt $P$: $${vT(erst)} = ${vT(p)} + t \\cdot ${vT(u)}$`,
          ...probeZeilen(p, u, erst),
          prE.liegt ? `Dreimal dasselbe $t = ${zT(prE.t)}$: $P$ liegt auf $g$.` : `Die Gleichungen widersprechen sich: $P$ liegt nicht auf $g$.`,
          `Punkt $Q$:`,
          ...probeZeilen(p, u, zweit),
          prZ.liegt ? `Dreimal dasselbe $t = ${zT(prZ.t)}$: $Q$ liegt auf $g$.` : `Die Gleichungen widersprechen sich: $Q$ liegt nicht auf $g$.`,
        ],
      };
    },
  },

  gerDurchZwei: {
    titel: "Gerade durch zwei Punkte",
    gen(r, variante) {
      let A, B, AB;
      do {
        A = variante === "ursprung" ? vek(0, 0, 0) : zufPunkt(r); B = zufPunkt(r); AB = nach(A, B);
      } while (vNull(AB) || (variante === "achse" ? AB.filter(qNull).length !== 2 : AB.filter(qNull).length > 1));
      const schritte = [
        vektorS("ab", "Richtungsvektor", "Berechne $\\vec{AB} = \\vec{b} - \\vec{a}$ (Ziel minus Start).", "$\\vec{AB} =$", AB, { hinweis: `$${vT(B)} ${MINUS} ${vT(A)}$` }),
        wahlS("form", "Parameterform", "Welche Gleichung beschreibt die Gerade $AB$?", mische(r, [
          ["richtig", `$\\vec{x} = ${vT(A)} + t \\cdot ${vT(AB)}$`],
          ["falschStuetz", `$\\vec{x} = ${vT(AB)} + t \\cdot ${vT(A)}$`],
          ["falschRicht", `$\\vec{x} = ${vT(A)} + t \\cdot ${vT(vAdd(A, B))}$`],
        ]), "richtig", { hinweis: "Stützvektor: ein Punkt der Geraden (z. B. $\\vec{a}$). Richtungsvektor: $\\vec{AB}$." }),
      ];
      const weg = [`$\\vec{AB} = ${vT(B)} ${MINUS} ${vT(A)} = ${vT(AB)}$`, `$${geradeT(A, AB)}$ (Stützpunkt $A$, Richtung $\\vec{AB}$)`];
      if (variante === "probe") {
        const t2 = q(ganz(r, 2, 3));
        const P2 = punktZu(A, AB, t2);
        let Qp; do { Qp = punktZu(A, AB, q(ganz(r, -2, -1))); if (r() < 0.5) Qp = Qp.map((x, i) => (i === 1 ? qAdd(x, q(1)) : x)); } while (false);
        const pr = punktprobe(A, AB, Qp);
        schritte.push(punktS("P", `Punkt zu t = ${zT(t2)}`, `Setze $t = ${zT(t2)}$ ein.`, "$P =$", P2));
        schritte.push(wahlS("Q", "Punktprobe", `Liegt $${pT(Qp, "Q")}$ auf $g$?`, JA_NEIN, pr.liegt ? "ja" : "nein", { hinweis: "Alle drei Koordinatengleichungen müssen dasselbe $t$ liefern." }));
        weg.push(`$${einsetzT(A, AB, t2)}$`, `Punktprobe mit $Q$:`, ...probeZeilen(A, AB, Qp), pr.liegt ? `Dreimal $t = ${zT(pr.t)}$: $Q$ liegt auf $g$.` : `Kein gemeinsames $t$: $Q$ liegt nicht auf $g$.`);
        return { text: `Stelle eine Gleichung der Geraden $g$ durch $${pT(A, "A")}$ und $${pT(B, "B")}$ auf. Berechne den Punkt zu $t = ${zT(t2)}$ und prüfe, ob $${pT(Qp, "Q")}$ auf $g$ liegt.`, schritte, weg };
      }
      return { text: `Stelle eine Gleichung der Geraden durch $${pT(A, "A")}$ und $${pT(B, "B")}$ auf.`, schritte, weg };
    },
  },

  gerUmparametrisieren: {
    titel: "Andere Parameterform derselben Geraden",
    gen(r) {
      let A, B, AB, k, w;
      do {
        A = zufPunkt(r); B = zufPunkt(r); AB = nach(A, B);
        w = ganz(r, -2, 2, [0]);
        k = qNull(AB[0]) ? null : qDiv(q(w), AB[0]);
      } while (vNull(AB) || qNull(AB[0]) || Math.abs(AB[0].z) === Math.abs(w) || Math.abs(AB[0].z) > 4 || AB.filter(qNull).length > 1);
      const v = vSkal(k, AB);
      return {
        text: `Die Gerade $g$ geht durch $${pT(A, "A")}$ und $${pT(B, "B")}$. Gib $g$ mit dem Stützpunkt $B$ und einem Richtungsvektor an, dessen erste Koordinate $${zT(w)}$ ist.`,
        schritte: [
          vektorS("ab", "Richtungsvektor", "Berechne zuerst $\\vec{AB}$.", "$\\vec{AB} =$", AB),
          zahlS("k", "Faktor", `Mit welchem Faktor $k$ musst du $\\vec{AB}$ multiplizieren, damit die erste Koordinate $${zT(w)}$ wird?`, "$k =$", k, { hinweis: `$k \\cdot ${kz(AB[0])} = ${zT(w)}$`, fehler: [{ wert: qNum(qNeg(k)), text: "Vorzeichen prüfen: $k \\cdot$ (erste Koordinate von $\\vec{AB}$) muss genau die gewünschte Zahl ergeben." }] }),
          vektorS("v", "Neuer Richtungsvektor", "Berechne $k \\cdot \\vec{AB}$.", "$\\vec{v} =$", v),
          wahlS("form", "Gleichung", "Welche Gleichung ist gesucht?", mische(r, [["richtig", `$\\vec{x} = ${vT(B)} + t \\cdot ${vT(v)}$`], ["falsch", `$\\vec{x} = ${vT(v)} + t \\cdot ${vT(B)}$`], ["falsch2", `$\\vec{x} = ${vT(A)} + t \\cdot ${vT(v)}$`]]), "richtig", { hinweis: "Stützpunkt $B$, Richtung $\\vec{v}$." }),
        ],
        weg: [
          `$\\vec{AB} = ${vT(B)} ${MINUS} ${vT(A)} = ${vT(AB)}$`,
          `Erste Koordinate soll $${zT(w)}$ sein: $k \\cdot ${kz(AB[0])} = ${zT(w)}$, also $k = ${zT(k)}$.`,
          `$\\vec{v} = ${malT(k, vT(AB))} = ${vT(v)}$`,
          `$${geradeT(B, v)}$ – dieselbe Gerade, nur anders beschrieben.`,
        ],
      };
    },
  },

  gerAchse: {
    titel: "Parameterform von Achsen und Parallelen",
    gen(r, variante) {
      const i = ganz(r, 0, 2);
      const e = vek(i === 0 ? 1 : 0, i === 1 ? 1 : 0, i === 2 ? 1 : 0);
      const achse = `x_${i + 1}`;
      if (variante === "achse") {
        return {
          text: `Gib eine Parameterform der $${achse}$-Achse an.`,
          schritte: [
            punktS("p", "Stützpunkt", `Nenne einen Punkt auf der $${achse}$-Achse – am einfachsten den Ursprung.`, "$P =$", vek(0, 0, 0), { hinweis: "Der Ursprung liegt auf jeder Achse." }),
            vektorS("u", "Richtungsvektor", `Welcher Einheitsvektor zeigt in Richtung der $${achse}$-Achse?`, "$\\vec{u} =$", e),
          ],
          weg: [`Die $${achse}$-Achse geht durch den Ursprung in Richtung $${vT(e)}$.`, `$${geradeT(vek(0, 0, 0), e)}$, also $\\vec{x} = t \\cdot ${vT(e)}$`],
        };
      }
      let P; do { P = zufPunkt(r, -4, 5); } while (vNull(P));
      return {
        text: `Gib eine Parameterform der Parallelen zur $${achse}$-Achse durch $${pT(P, "P")}$ an.`,
        schritte: [
          punktS("p", "Stützpunkt", "Welchen Punkt nimmst du als Stützpunkt?", "$P =$", P, { hinweis: "Der gegebene Punkt liegt auf der Geraden." }),
          vektorS("u", "Richtungsvektor", `Parallel zur $${achse}$-Achse heißt: gleiche Richtung wie die Achse.`, "$\\vec{u} =$", e, { hinweis: "Der Richtungsvektor der Achse hat eine 1 und zwei Nullen." }),
        ],
        weg: [`Richtung der $${achse}$-Achse: $${vT(e)}$. Stützpunkt $P$.`, `$${geradeT(P, e)}$`],
      };
    },
  },

  gerParam2d: {
    titel: "Geradengleichung in Parameterform (Ebene)",
    gen(r, variante) {
      if (variante === "senkrecht") {
        const c = q(ganz(r, -5, 5, [0]));
        return {
          text: `Schreibe die Gerade $x = ${zT(c)}$ in Parameterform. Warum hat sie keine Gleichung der Form $y = mx + c$?`,
          schritte: [
            punktS("p", "Stützpunkt", `Nenne einen Punkt mit $x = ${zT(c)}$, z. B. auf der $x$-Achse.`, "$P =$", vek(c, 0), { hinweis: "Alle Punkte der Geraden haben dieselbe $x$-Koordinate." }),
            vektorS("u", "Richtungsvektor", "In welche Richtung läuft die Gerade?", "$\\vec{u} =$", vek(0, 1), { hinweis: "Senkrecht nach oben: $x$ ändert sich nicht, $y$ beliebig." }),
            wahlS("warum", "Begründung", "Warum gibt es keine Form $y = mx + c$?", [["senk", "Die Gerade ist senkrecht – zu einem $x$ gehören unendlich viele $y$, sie ist kein Funktionsgraph."], ["null", "Weil $c$ null ist."], ["neg", "Weil die Steigung negativ ist."]], "senk"),
          ],
          weg: [`Punkt $(${zT(c)} \\mid 0)$ liegt auf der Geraden, Richtung $\\binom{0}{1}$.`, `$g: \\vec{x} = \\binom{${zT(c)}}{0} + t \\cdot \\binom{0}{1}$`, `Senkrechte Geraden haben keine Steigung $m$ – sie sind keine Funktionsgraphen.`],
        };
      }
      const m = eins(r, [q(3), q(-2), q(2), q(-3), q(1, 2), q(-1, 2), q(2, 3), q(-3, 4), q(1), q(-1)]);
      const c = q(ganz(r, -5, 5, [0]));
      const u = vek(m.n, m.z);
      const term = summeT([[m, "x"]]) + (c.z < 0 ? ` ${MINUS} ${zT(qNeg(c))}` : ` + ${zT(c)}`);
      return {
        text: `Schreibe die Gerade $y = ${term}$ in Parameterform.`,
        schritte: [
          punktS("p", "Stützpunkt", "Nimm den Schnittpunkt mit der $y$-Achse als Stützpunkt.", "$P =$", vek(0, c), { hinweis: "Setze $x = 0$ ein." }),
          vektorS("u", "Richtungsvektor", `Die Steigung $m = ${zT(m)}$ liefert den Richtungsvektor: $\\Delta x = ${m.n}$, $\\Delta y = ${zT(m.z)}$.`, "$\\vec{u} =$", u, { hinweis: "Ein Schritt nach rechts, $m$ Schritte nach oben – bei Bruch $m$ den Nenner als $\\Delta x$ nehmen." }),
        ],
        weg: [`$x = 0$: $y = ${zT(c)}$, Stützpunkt $(0 \\mid ${zT(c)})$.`, `Steigung $${zT(m)}$: Richtungsvektor $\\binom{${m.n}}{${zT(m.z)}}$.`, `$g: \\vec{x} = \\binom{0}{${zT(c)}} + t \\cdot \\binom{${m.n}}{${zT(m.z)}}$`],
      };
    },
  },

  gerTeilpunkt: {
    titel: "Mittelpunkt, Teilpunkt und Strecke",
    gen(r, variante) {
      let A, AB, B;
      const teil = eins(r, [q(1, 4), q(3, 4), q(1, 3), q(2, 3)]);
      do { A = zufPunkt(r, -3, 4); AB = zufVek(r, -2, 2).map((x) => qMul(x, q(teil.n === 3 ? 3 : 4))); B = vAdd(A, AB); } while (vNull(AB) || B.some((x) => Math.abs(x.z) > 9));
      const M = mittelpunkt(A, B), T = punktZu(A, AB, teil);
      if (variante === "dreiPunkte") {
        const tP = eins(r, [q(1, 4), q(1, 2), q(3, 4)]), tQ = eins(r, [q(3, 2), q(-1, 2), q(2), q(-1)]);
        const P = punktZu(A, AB, tP), Qp = punktZu(A, AB, tQ);
        const R = punktZu(A, AB, q(1, 2)).map((x, i) => (i === 2 ? qAdd(x, q(ganz(r, 1, 2) * vz(r))) : x));
        const OPT = [["strecke", "auf der Strecke"], ["gerade", "nur auf der Geraden"], ["keins", "auf keinem von beiden"]];
        const erkl = (X, t, liegt) => (liegt ? `dreimal $t = ${zT(t)}$, ${qNum(t) >= 0 && qNum(t) <= 1 ? "zwischen 0 und 1: auf der Strecke" : "nicht zwischen 0 und 1: nur auf der Geraden"}` : "kein gemeinsames $t$: weder Strecke noch Gerade");
        return {
          text: `Gegeben sind $${pT(A, "A")}$ und $${pT(B, "B")}$. Liegen $${pT(P, "P")}$, $${pT(Qp, "Q")}$ und $${pT(R, "R")}$ auf der Strecke $\\vec{AB}$, nur auf der Geraden $AB$ oder auf keinem von beiden?`,
          schritte: [
            vektorS("ab", "Richtungsvektor", "Berechne $\\vec{AB}$.", "$\\vec{AB} =$", AB),
            wahlS("P", "Punkt P", "Setze $P$ in $\\vec{x} = \\vec{a} + t \\cdot \\vec{AB}$ ein. Wo liegt $P$?", OPT, "strecke", { hinweis: "Auf der Strecke: ein gemeinsames $t$ zwischen $0$ und $1$." }),
            wahlS("Q", "Punkt Q", "Wo liegt $Q$?", OPT, "gerade", { hinweis: "Gemeinsames $t$, aber nicht zwischen $0$ und $1$: nur auf der Geraden." }),
            wahlS("R", "Punkt R", "Wo liegt $R$?", OPT, "keins", { hinweis: "Liefern die Gleichungen verschiedene $t$, liegt der Punkt gar nicht auf der Geraden." }),
          ],
          weg: [
            `$\\vec{AB} = ${vT(AB)}$, Gerade $AB$: $\\vec{x} = ${vT(A)} + t \\cdot ${vT(AB)}$. Die Strecke sind die Punkte mit $t$ zwischen $0$ und $1$.`,
            `$P$: ${probeZeilen(A, AB, P).map((z) => z.replace(/^\$\\text\{(I+)\}\\quad /, "$1: $")).join("; ")} – ${erkl(P, tP, true)}.`,
            `$Q$: ${probeZeilen(A, AB, Qp).map((z) => z.replace(/^\$\\text\{(I+)\}\\quad /, "$1: $")).join("; ")} – ${erkl(Qp, tQ, true)}.`,
            `$R$: ${probeZeilen(A, AB, R).map((z) => z.replace(/^\$\\text\{(I+)\}\\quad /, "$1: $")).join("; ")} – ${erkl(R, null, false)}.`,
          ],
        };
      }
      const tC = eins(r, [q(3, 2), q(2), q(5, 4), q(-1, 2)]);
      const C = punktZu(A, AB, tC);
      return {
        text: `Gegeben sind $${pT(A, "A")}$ und $${pT(B, "B")}$. Berechne den Mittelpunkt von $\\vec{AB}$ und den Punkt $T$, der die Strecke von $A$ aus im Verhältnis $${teil.z} : ${teil.n - teil.z}$ teilt. Liegt $${pT(C, "C")}$ auf der Strecke $\\vec{AB}$?`,
        schritte: [
          vektorS("ab", "Richtungsvektor", "Berechne $\\vec{AB}$.", "$\\vec{AB} =$", AB),
          punktS("M", "Mittelpunkt", "Mittelpunkt: $\\vec{m} = \\vec{a} + \\frac{1}{2} \\cdot \\vec{AB}$ (oder $\\frac{1}{2}(\\vec{a} + \\vec{b})$).", "$M =$", M),
          punktS("T", "Teilpunkt", `Teilverhältnis $${teil.z} : ${teil.n - teil.z}$ heißt: $T$ liegt bei $t = \\frac{${teil.z}}{${teil.n}}$ von $A$ aus.`, "$T =$", T, { hinweis: `$\\vec{t} = \\vec{a} + ${zT(teil)} \\cdot \\vec{AB}$` }),
          zahlS("tc", "Parameter von C", "Welches $t$ gehört zu $C$ auf der Geraden $AB$?", "$t =$", tC, { hinweis: "Setze $C$ ein und löse eine Koordinatengleichung nach $t$ auf – alle drei liefern denselben Wert." }),
          wahlS("C", "Strecke?", "Liegt $C$ auf der Strecke $\\vec{AB}$?", JA_NEIN, qNum(tC) >= 0 && qNum(tC) <= 1 ? "ja" : "nein", { hinweis: "Auf der Strecke liegen genau die Punkte mit $t$ zwischen $0$ und $1$." }),
        ],
        weg: [
          `$\\vec{AB} = ${vT(B)} ${MINUS} ${vT(A)} = ${vT(AB)}$`,
          `Mittelpunkt ($t = \\frac{1}{2}$): $\\vec{m} = ${vT(A)} + \\frac{1}{2} \\cdot ${vT(AB)} = ${vT(M)}$, also $${pT(M, "M")}$`,
          `Teilpunkt ($t = ${zT(teil)}$): $\\vec{t} = ${vT(A)} + ${zT(teil)} \\cdot ${vT(AB)} = ${vT(T)}$, also $${pT(T, "T")}$`,
          `$C$: ${probeZeilen(A, AB, C).map((z) => z.replace(/^\$\\text\{(I+)\}\\quad /, "$1: $")).join("; ")}. Dreimal $t = ${zT(tC)}$ – ${qNum(tC) > 1 ? "größer als 1: $C$ liegt auf der Geraden hinter $B$, nicht auf der Strecke." : qNum(tC) < 0 ? "kleiner als 0: $C$ liegt auf der Geraden vor $A$, nicht auf der Strecke." : "zwischen 0 und 1: $C$ liegt auf der Strecke."}`,
        ],
      };
    },
  },

  gerBallon: {
    titel: "Geradlinige Bewegung",
    gen(r) {
      const basis = eins(r, [[3, 4, 12], [2, 3, 6], [1, 4, 8], [2, 6, 9], [4, 4, 7], [6, 6, 7]]);
      const f = eins(r, [10, 10, 20, 5]);
      const perm = mische(r, [0, 1]);
      const u = vek(basis[perm[0]] * f * vz(r), basis[perm[1]] * f * vz(r), basis[2] * f);
      const betrag = Math.sqrt(basis[0] ** 2 + basis[1] ** 2 + basis[2] ** 2) * f;
      const t1 = eins(r, [q(3, 2), q(5, 2), q(2), q(3), q(1, 2)]);
      const P1 = vSkal(t1, u);
      const t2 = q(ganz(r, 3, 6));
      const h = qMul(t2, u[2]);
      const P2 = vSkal(t2, u);
      return {
        text: `Ein Ballon steigt vom Startplatz $O(0 \\mid 0 \\mid 0)$ aus geradlinig und legt jede Minute den Vektor $\\vec{u} = ${vT(u)}$ zurück (Koordinaten in m). Wie weit fliegt er pro Minute? Wo ist er nach $${zT(t1, { dez: true })}$ min? Wann ist er $${zT(h)}$ m hoch, und wo ist er dann?`,
        schritte: [
          zahlS("b", "Strecke pro Minute", "Berechne den Betrag von $\\vec{u}$.", "$|\\vec{u}| =$", q(Math.round(betrag)), { einheit: "m", hinweis: "$|\\vec{u}| = \\sqrt{u_1^2 + u_2^2 + u_3^2}$" }),
          punktS("p1", `Ort nach ${zT(t1, { dez: true }).replace("{,}", ",")} min`, `Bahn: $\\vec{x} = t \\cdot \\vec{u}$ mit $t$ in Minuten. Setze $t = ${zT(t1, { dez: true })}$ ein.`, "$P =$", P1),
          zahlS("t", "Zeitpunkt", `Die Höhe ist die $x_3$-Koordinate: $${zT(u[2])} \\cdot t = ${zT(h)}$.`, "$t =$", t2, { einheit: "min" }),
          punktS("p2", "Ort in dieser Höhe", "Setze diesen Zeitpunkt in die Bahngleichung ein.", "$Q =$", P2),
        ],
        weg: [
          `$|\\vec{u}| = ${betragWegT(u)}$, also $${Math.round(betrag)}$ m pro Minute.`,
          `Bahn: $\\vec{x} = t \\cdot ${vT(u)}$. Nach $${zT(t1, { dez: true })}$ min: $${zT(t1, { dez: true })} \\cdot ${vT(u)} = ${vT(P1)}$`,
          `Höhe $${zT(h)}$ m: $${zT(u[2])} \\cdot t = ${zT(h)}$, also $t = ${zT(t2)}$ min. Ort: $${zT(t2)} \\cdot ${vT(u)} = ${vT(P2)}$, also $${pT(P2, "Q")}$.`,
        ],
      };
    },
  },

  gerSpurpunkte: {
    titel: "Spurpunkte einer Geraden",
    gen(r) {
      let p, u;
      do { p = zufPunkt(r, -4, 5); u = zufRichtung(r); } while (u.some(qNull) || p.some(qNull) || [0, 1, 2].some((i) => qDiv(qNeg(p[i]), u[i]).n > 2));
      const spur = [0, 1, 2].map((i) => { const t = qDiv(qNeg(p[i]), u[i]); return { i, t, S: punktZu(p, u, t) }; });
      const namen = ["S_{23}", "S_{13}", "S_{12}"];
      const ebenen = ["x_2x_3", "x_1x_3", "x_1x_2"];
      return {
        text: `Bestimme die Spurpunkte der Geraden $${geradeT(p, u, { name: "h" })}$ (die Schnittpunkte mit den drei Koordinatenebenen).`,
        schritte: spur.map(({ i, t, S }) => punktS(`s${i}`, `Spurpunkt in der ${ebenen[i].replace(/x_(\d)x_(\d)/, "x$1x$2")}-Ebene`, `In der $${ebenen[i]}$-Ebene gilt $x_${i + 1} = 0$. Setze die $x_${i + 1}$-Koordinate der Geraden gleich 0, löse nach $t$ auf und berechne den Punkt.`, `$${namen[i]} =$`, S, { hinweis: `$${linPlusT(p[i], u[i], "t")} = 0$, also $t = ${zT(t)}$` })),
        weg: spur.map(({ i, t, S }) => `$x_${i + 1} = 0$: $${linPlusT(p[i], u[i], "t")} = 0$, $t = ${zT(t)}$: $${einsetzT(p, u, t)}$, also $${pT(S, namen[i])}$`),
      };
    },
  },

  gerLage: {
    titel: "Lage zweier Geraden",
    gen(r, variante) {
      const lage = ["identisch", "parallel", "schnitt", "windschief"].includes(variante) ? variante : eins(r, ["identisch", "parallel", "schnitt", "schnitt", "windschief"]);
      if (variante === "punkte") {
        // Geraden durch je zwei Punkte, die sich schneiden
        const G = geradenMitLage(r, "schnitt");
        const A = G.p, B = vAdd(G.p, G.u), C = G.q, D = vAdd(G.q, G.v);
        return {
          text: `Die Gerade $g$ geht durch $${pT(A, "A")}$ und $${pT(B, "B")}$, die Gerade $h$ durch $${pT(C, "C")}$ und $${pT(D, "D")}$. Zeige, dass sich $g$ und $h$ schneiden, und berechne den Schnittpunkt.`,
          schritte: [
            vektorS("u", "Richtung von g", "Berechne $\\vec{AB}$.", "$\\vec{AB} =$", G.u),
            vektorS("v", "Richtung von h", "Berechne $\\vec{CD}$.", "$\\vec{CD} =$", G.v),
            ...lageSchritte(G.p, G.u, G.q, G.v, G.L).slice(1),
          ],
          weg: [`$${geradeT(A, G.u)}$ (mit $\\vec{AB} = ${vT(G.u)}$), $${geradeT(C, G.v, { name: "h", param: "s" })}$ (mit $\\vec{CD} = ${vT(G.v)}$)`, ...G.L.zeilen],
        };
      }
      const G = geradenMitLage(r, lage);
      return {
        text: `Wie liegen die Geraden $${geradeT(G.p, G.u)}$ und $${geradeT(G.q, G.v, { name: "h", param: "s" })}$ zueinander? Gib gegebenenfalls den Schnittpunkt an.`,
        schritte: lageSchritte(G.p, G.u, G.q, G.v, G.L),
        weg: G.L.zeilen,
      };
    },
  },

  gerFlug: {
    titel: "Flugbahnen: Kreuzen und Zusammenstoßen",
    gen(r, variante) {
      if (variante === "schatten") {
        // windschiefe Bahnen, deren Schatten (Projektion auf x1x2) sich kreuzen; Höhen vergleichen
        let p, u, qq, v, t, s, h1, h2;
        for (let n = 0; n < 500; n++) {
          p = vek(ganz(r, 0, 8), ganz(r, 0, 8), ganz(r, 1, 5)); u = vek(ganz(r, -3, 3), ganz(r, -3, 3), ganz(r, -1, 1));
          qq = vek(ganz(r, 0, 8), ganz(r, 0, 8), ganz(r, 1, 5)); v = vek(ganz(r, -3, 3), ganz(r, -3, 3), ganz(r, -1, 1));
          if (qNull(u[0]) && qNull(u[1])) continue; if (qNull(v[0]) && qNull(v[1])) continue;
          const det = qSub(qMul(u[0], qNeg(v[1])), qMul(u[1], qNeg(v[0])));
          if (qNull(det)) continue;
          const G = gauss([[u[0], qNeg(v[0])], [u[1], qNeg(v[1])]], [qSub(qq[0], p[0]), qSub(qq[1], p[1])], ["t", "s"]);
          t = G.x[0]; s = G.x[1];
          if (t.n > 2 || s.n > 2 || qNum(t) <= 0 || qNum(s) <= 0 || qNum(t) > 6 || qNum(s) > 6) continue;
          h1 = qAdd(p[2], qMul(t, u[2])); h2 = qAdd(qq[2], qMul(s, v[2]));
          if (qGleich(h1, h2) || h1.n !== 1 || h2.n !== 1 || qNum(h1) <= 0 || qNum(h2) <= 0) continue;
          break;
        }
        const B = vek(qAdd(p[0], qMul(t, u[0])), qAdd(p[1], qMul(t, u[1])), q(0));
        return {
          text: `Zwei Flugzeuge fliegen auf den Bahnen $${geradeT(p, u, { name: "f_1" })}$ und $${geradeT(qq, v, { name: "f_2", param: "s" })}$ (Einheit 1 km, $x_3$ ist die Höhe). Zeige, dass die Bahnen windschief sind. Über welchem Bodenpunkt kreuzen sich die Schatten der Bahnen, und wie hoch ist dort jedes Flugzeug?`,
          schritte: [
            zahlS("t", "Parameter t", "Setze die ersten beiden Koordinaten gleich (Gleichungen I und II) und löse nach $t$ und $s$ auf.", "$t =$", t, { hinweis: lgsText(p, u, qq, v).slice(0, 2).join(", ") }),
            zahlS("s", "Parameter s", "Und $s$?", "$s =$", s),
            wahlS("dritte", "Dritte Gleichung", "Erfüllen $t$ und $s$ auch die dritte Gleichung?", JA_NEIN, "nein", { hinweis: `$\\text{III}\\quad ${linPlusT(p[2], u[2], "t")} = ${linPlusT(qq[2], v[2], "s")}$` }),
            punktS("B", "Bodenpunkt", "Die Schatten kreuzen sich unter dem Punkt mit diesen $x_1$- und $x_2$-Werten (Höhe 0).", "$B =$", B),
            zahlS("h1", "Höhe Flugzeug 1", "Setze $t$ in die $x_3$-Koordinate von $f_1$ ein.", "$h_1 =$", h1, { einheit: "km" }),
            zahlS("h2", "Höhe Flugzeug 2", "Setze $s$ in die $x_3$-Koordinate von $f_2$ ein.", "$h_2 =$", h2, { einheit: "km" }),
          ],
          weg: [
            `Gleichsetzen: ${lgsText(p, u, qq, v).join(", ")}`,
            `Aus I und II: $t = ${zT(t)}$, $s = ${zT(s)}$. Probe in III: $${zT(h1)} \\ne ${zT(h2)}$ – die Bahnen sind windschief.`,
            `Die Schatten (Bahnen ohne Höhe) kreuzen sich bei $t = ${zT(t)}$ bzw. $s = ${zT(s)}$ über $${pT(B, "B")}$.`,
            `Dort ist Flugzeug 1 in $${zT(h1)}$ km Höhe, Flugzeug 2 in $${zT(h2)}$ km Höhe – $${zT(qNum(h1) > qNum(h2) ? qSub(h1, h2) : qSub(h2, h1))}$ km übereinander.`,
          ],
        };
      }
      // Bahnen kreuzen sich, Flugzeuge zu verschiedenen Zeiten dort
      let G;
      do { G = geradenMitLage(r, "schnitt"); } while (qNum(G.L.t) <= 0 || qNum(G.L.s) <= 0 || qGleich(G.L.t, G.L.s) || G.L.t.n !== 1 || G.L.s.n !== 1);
      const { p, u, q: qq, v, L } = G;
      return {
        text: `Zwei Flugzeuge starten gleichzeitig und fliegen auf den Bahnen $${geradeT(p, u, { name: "f_1" })}$ und $${geradeT(qq, v, { name: "f_2", param: "s" })}$ ($t$, $s$ in Minuten, Einheit 1 km). Kreuzen sich die Bahnen? Stoßen die Flugzeuge zusammen?`,
        schritte: [
          ...lageSchritte(p, u, qq, v, L).slice(1),
          wahlS("crash", "Zusammenstoß?", "Sind beide Flugzeuge zur gleichen Zeit im Schnittpunkt?", JA_NEIN, "nein", { hinweis: "Vergleiche $t$ und $s$ – beide zählen Minuten seit dem Start." }),
        ],
        weg: [...L.zeilen, `Flugzeug 1 ist nach $${zT(L.t)}$ min im Schnittpunkt, Flugzeug 2 nach $${zT(L.s)}$ min – kein Zusammenstoß.`],
      };
    },
  },

  gerParameterA: {
    titel: "Schnitt in Abhängigkeit von einem Parameter",
    gen(r) {
      // g: p + t·u, h_a: q + s·v mit q_j = a in einer Koordinate j; u, v nicht kollinear
      let p, u, qq, v, j, t, s, a, S, i1, i2;
      for (let n = 0; n < 500; n++) {
        p = zufPunkt(r, -2, 3); u = zufRichtung(r, -2, 2); v = zufRichtung(r, -2, 2);
        if (kollinearFaktor(u, v) !== null) continue;
        if (u.filter(qNull).length > 1 || v.filter(qNull).length > 1) continue;
        j = ganz(r, 0, 2);
        const andere = [0, 1, 2].filter((x) => x !== j);
        [i1, i2] = andere;
        const det = qSub(qMul(u[i1], qNeg(v[i2])), qMul(u[i2], qNeg(v[i1])));
        if (qNull(det)) continue;
        t = q(ganz(r, -3, 3, [0])); s = q(ganz(r, -3, 3, [0]));
        S = punktZu(p, u, t);
        qq = vSub(S, vSkal(s, v));
        if (qq.some((x) => Math.abs(x.z) > 6)) continue;
        a = qq[j];
        break;
      }
      const qa = qq.map((x, i) => (i === j ? "a" : zT(x)));
      const hT = `h_a: \\vec{x} = \\spalte{${qa[0]}}{${qa[1]}}{${qa[2]}} + s \\cdot ${vT(v)}`;
      const rechtsJ = qNull(v[j]) ? "a" : `a ${summeT([[v[j], "s"]]).startsWith(MINUS) ? MINUS : "+"} ${summeT([[v[j], "s"]]).replace(MINUS, "")}`;
      return {
        text: `Für welchen Wert von $a$ schneiden sich die Geraden $${geradeT(p, u)}$ und $${hT}$? Gib den Schnittpunkt an. Wie liegen die Geraden für alle anderen Werte von $a$?`,
        schritte: [
          zahlS("t", "Parameter t", `Setze gleich. Die Gleichungen $\\text{${ROEM[i1]}}$ und $\\text{${ROEM[i2]}}$ enthalten kein $a$ – löse sie nach $t$ und $s$ auf.`, "$t =$", t, { hinweis: `$\\text{${ROEM[i1]}}\\quad ${linPlusT(p[i1], u[i1], "t")} = ${linPlusT(qq[i1], v[i1], "s")}$, $\\text{${ROEM[i2]}}\\quad ${linPlusT(p[i2], u[i2], "t")} = ${linPlusT(qq[i2], v[i2], "s")}$` }),
          zahlS("s", "Parameter s", "Und $s$?", "$s =$", s),
          zahlS("a", "Wert von a", `Setze $t$ und $s$ in die Gleichung $\\text{${ROEM[j]}}$ ein und löse nach $a$ auf.`, "$a =$", a, { hinweis: `$\\text{${ROEM[j]}}\\quad ${linPlusT(p[j], u[j], "t")} = ${rechtsJ}$` }),
          punktS("S", "Schnittpunkt", "Setze $t$ in $g$ ein.", "$S =$", S),
          wahlS("sonst", "Andere Werte von a", "Wie liegen $g$ und $h_a$ für $a \\ne$ diesem Wert?", LAGEN, "windschief", { hinweis: "Die Richtungsvektoren sind nicht kollinear, und ohne Schnittpunkt bleibt nur eine Möglichkeit." }),
        ],
        weg: [
          `Gleichsetzen: ${[0, 1, 2].map((i) => `$\\text{${ROEM[i]}}\\quad ${linPlusT(p[i], u[i], "t")} = ${i === j ? rechtsJ : linPlusT(qq[i], v[i], "s")}$`).join(", ")}`,
          `Aus $\\text{${ROEM[i1]}}$ und $\\text{${ROEM[i2]}}$: $t = ${zT(t)}$, $s = ${zT(s)}$.`,
          `In $\\text{${ROEM[j]}}$: $${zT(qAdd(p[j], qMul(t, u[j])))} = ${qNull(v[j]) ? "a" : `a ${qNum(qMul(s, v[j])) < 0 ? MINUS : "+"} ${zT(Math.abs(qNum(qMul(s, v[j]))))}`}$, also $a = ${zT(a)}$.`,
          `Schnittpunkt: $${einsetzT(p, u, t)}$, also $${pT(S, "S")}$.`,
          `Die Richtungsvektoren $${vT(u)}$ und $${vT(v)}$ sind nie kollinear: Für $a \\ne ${zT(a)}$ sind die Geraden windschief.`,
        ],
      };
    },
  },
};


/* ===================== Kapitel IV: Produkte ===================== */
const WINKELART = [["spitz", "spitz"], ["recht", "rechter Winkel"], ["stumpf", "stumpf"]];
const winkelArt = (sp) => (qNum(sp) > 0 ? "spitz" : qNum(sp) < 0 ? "stumpf" : "recht");
const winkelArtText = { spitz: "spitz ($\\vec{a} \\cdot \\vec{b} > 0$)", recht: "ein rechter Winkel ($\\vec{a} \\cdot \\vec{b} = 0$)", stumpf: "stumpf ($\\vec{a} \\cdot \\vec{b} < 0$)" };
/* Vektor orthogonal zu a mit kleinen ganzen Zahlen (nicht Nullvektor) */
function orthogonalZu(r, a, lo = -3, hi = 3) {
  for (let i = 0; i < 300; i++) {
    const b = zufVek(r, lo, hi);
    if (qNull(vDot(a, b)) && !vNull(b)) return b;
  }
  // konstruiert: (a2, −a1, 0) oder (0, a3, −a2)
  return qNull(a[0]) && qNull(a[1]) ? vek(1, 0, 0) : vek(a[1], qNeg(a[0]), 0);
}
/* cos-Wert als TeX-Bruch mit Wurzeln: Skalarprodukt / (|a|·|b|), gekürzt wenn möglich */
function cosT(sp, a, b) {
  const s2 = vBetrag2(a), t2 = vBetrag2(b);
  const roh = `\\frac{${zT(sp)}}{${betragT(a)} \\cdot ${betragT(b)}}`;
  const ba = betragT(a), bb = betragT(b);
  // beide Beträge ganz → Bruch kürzen
  if (!/sqrt/.test(ba) && !/sqrt/.test(bb)) {
    const w = qDiv(sp, qMul(q(+ba), q(+bb)));
    return zT(w) === roh ? roh : `${roh} = ${zT(w)}`;
  }
  return roh;
}
/* Winkel aus zwei Vektoren: { sp, cos, grad } */
function winkel(a, b) {
  const sp = vDot(a, b);
  const c = qNum(sp) / (betragNum(a) * betragNum(b));
  return { sp, cos: c, grad: gradAus(c) };
}
/* Winkel-Schritte: Skalarprodukt, Beträge, Winkel (gerundet) */
function winkelSchritte(a, b, { id = "", na = "\\vec{a}", nb = "\\vec{b}", name = "\\alpha" } = {}) {
  const w = winkel(a, b);
  return [
    zahlS(`sp${id}`, "Skalarprodukt", `Berechne $${na} \\cdot ${nb}$.`, `$${na} \\cdot ${nb} =$`, w.sp),
    zahlR(`ba${id}`, "Betrag", `Berechne $|${na}|$ (auf 2 Stellen, falls nicht ganz).`, `$|${na}| =$`, Math.round(betragNum(a) * 100) / 100, { tol: 0.011, wertText: `$${betragT(a)}$` }),
    zahlR(`bb${id}`, "Betrag", `Berechne $|${nb}|$.`, `$|${nb}| =$`, Math.round(betragNum(b) * 100) / 100, { tol: 0.011, wertText: `$${betragT(b)}$` }),
    zahlR(`w${id}`, "Winkel", `$\\cos ${name} = \\frac{${na} \\cdot ${nb}}{|${na}| \\cdot |${nb}|}$ – berechne $${name}$ in Grad (eine Nachkommastelle).`, `$${name} =$`, w.grad, { tol: 0.11, einheit: "°", wertText: `$${gradT(w.grad)}$` }),
  ];
}
const winkelWegT = (a, b, name = "\\alpha") => { const w = winkel(a, b); return `$\\cos ${name} = \\frac{${skalarWegT(a, b).split(" = ")[0]}}{${betragT(a)} \\cdot ${betragT(b)}} = ${cosT(w.sp, a, b)}$, also $${name} \\approx ${gradT(w.grad)}$`; };

/* Dreieck mit ganzzahligen Ecken; rechtwinklig bei Ecke k (0,1,2) oder keins */
function dreieck(r, { recht = null, lo = -3, hi = 4 } = {}) {
  for (let n = 0; n < 500; n++) {
    const A = zufPunkt(r, lo, hi), B = zufPunkt(r, lo, hi), C = zufPunkt(r, lo, hi);
    const AB = nach(A, B), AC = nach(A, C), BC = nach(B, C);
    if (vNull(AB) || vNull(AC) || vNull(BC) || kollinearFaktor(AB, AC) !== null) continue;
    const sp = [vDot(AB, AC), vDot(vNeg(AB), BC), vDot(vNeg(AC), vNeg(BC))];   // bei A, B, C
    const rechtBei = sp.findIndex(qNull);
    if (recht === "keins" && rechtBei >= 0) continue;
    if (typeof recht === "number" && rechtBei !== recht) continue;
    if (recht === null && n < 300 && rechtBei >= 0 && r() < 0.5) continue;
    return { A, B, C, AB, AC, BC, sp, rechtBei };
  }
  return { A: vek(0, 0, 0), B: vek(3, 0, 0), C: vek(0, 4, 0), AB: vek(3, 0, 0), AC: vek(0, 4, 0), BC: vek(-3, 4, 0), sp: [q(0), q(9), q(16)], rechtBei: 0 };
}

Object.assign(TYPEN_2, {
  prodSkalar: {
    titel: "Skalarprodukt berechnen",
    gen(r, variante) {
      let a, b;
      do { a = zufVek(r, -4, 4); b = zufVek(r, -4, 4); } while (vNull(a) || vNull(b));
      if (variante === "orthogonal") { b = orthogonalZu(r, a, -4, 4); }
      if (variante === "gleich") b = a;
      const sp = vDot(a, b);
      const schritte = [zahlS("sp", "Skalarprodukt", "Multipliziere die Koordinaten paarweise und addiere.", `$\\vec{a} \\cdot \\vec{b} =$`, sp, { hinweis: "$a_1 b_1 + a_2 b_2 + a_3 b_3$", fehler: [{ wert: qNum(vDot(a, a)) + qNum(vDot(b, b)), text: "Du hast die Quadrate der Koordinaten addiert – das Skalarprodukt multipliziert die Koordinaten von $\\vec{a}$ mit denen von $\\vec{b}$." }] })];
      const weg = [`$\\vec{a} \\cdot \\vec{b} = ${skalarWegT(a, b)}$`];
      if (variante === "art") {
        schritte.push(wahlS("art", "Winkelart", "Spitz, recht oder stumpf? Entscheide nur mit dem Vorzeichen des Skalarprodukts.", WINKELART, winkelArt(sp), { hinweis: "Positiv: spitz. Null: rechter Winkel. Negativ: stumpf." }));
        weg.push(`Der Winkel ist ${winkelArtText[winkelArt(sp)]}.`);
        return { text: `Berechne das Skalarprodukt $${vT(a)} \\cdot ${vT(b)}$. Ist der Winkel zwischen den Vektoren spitz, recht oder stumpf?`, schritte, weg };
      }
      weg.push(qNull(sp) ? "Das Skalarprodukt ist 0: Die Vektoren sind orthogonal." : `Das Skalarprodukt ist eine Zahl, kein Vektor – hier $${zT(sp)}$, also ${qNum(sp) > 0 ? "positiv: Der Winkel zwischen den Vektoren ist spitz." : "negativ: Der Winkel zwischen den Vektoren ist stumpf."}`);
      if (variante === "gleich") weg.push(`$\\vec{a} \\cdot \\vec{a} = |\\vec{a}|^2$, also $|\\vec{a}| = ${wurzelT(sp)}$.`);
      return { text: `Berechne das Skalarprodukt $${vT(a)} \\cdot ${vT(b)}$.`, schritte, weg };
    },
  },

  prodOrthoPaare: {
    titel: "Orthogonale Paare finden",
    gen(r) {
      let u, v, w, z, paare;
      do {
        u = zufVek(r, -3, 3); v = orthogonalZu(r, u); w = orthogonalZu(r, u); z = zufVek(r, -3, 3);
        const alle = { u, v, w, z };
        const namen = ["u", "v", "w", "z"];
        paare = [];
        for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) paare.push({ n1: namen[i], n2: namen[j], a: alle[namen[i]], b: alle[namen[j]], sp: vDot(alle[namen[i]], alle[namen[j]]) });
      } while (kollinearFaktor(v, w) !== null || paare.filter((p) => qNull(p.sp)).length < 2 || paare.filter((p) => qNull(p.sp)).length > 4 || qNull(vDot(u, z)));
      const ortho = paare.filter((p) => qNull(p.sp));
      return {
        text: `Welche der Vektoren $\\vec{u} = ${vT(u)}$, $\\vec{v} = ${vT(v)}$, $\\vec{w} = ${vT(w)}$ und $\\vec{z} = ${vT(z)}$ sind zueinander orthogonal? Berechne alle Skalarprodukte.`,
        schritte: [
          ...paare.map((p) => zahlS(`${p.n1}${p.n2}`, `${p.n1} · ${p.n2}`, `Berechne $\\vec{${p.n1}} \\cdot \\vec{${p.n2}}$.`, `$\\vec{${p.n1}} \\cdot \\vec{${p.n2}} =$`, p.sp)),
          zahlS("anz", "Orthogonale Paare", "Wie viele der sechs Paare sind orthogonal (Skalarprodukt 0)?", "Anzahl $=$", q(ortho.length)),
        ],
        weg: [
          ...paare.map((p) => `$\\vec{${p.n1}} \\cdot \\vec{${p.n2}} = ${skalarWegT(p.a, p.b)}$${qNull(p.sp) ? " – orthogonal" : ""}`),
          `Orthogonal sind genau ${ortho.length} Paare: ${ortho.map((p) => `$\\vec{${p.n1}} \\perp \\vec{${p.n2}}$`).join(", ")}.`,
        ],
      };
    },
  },

  prodOrthoParam: {
    titel: "Parameter für Orthogonalität bestimmen",
    gen(r, variante) {
      if (variante === "quadrat") {
        // (t, a2, a3) · (t, b2, b3) = t² + c = 0 mit c = −k²
        let a2, a3, b2, b3, k;
        do { a2 = ganz(r, -4, 4, [0]); a3 = ganz(r, -4, 4, [0]); b2 = ganz(r, -4, 4, [0]); k = ganz(r, 1, 4); b3 = (-(k * k) - a2 * b2) / a3; } while (!Number.isInteger(b3) || b3 === 0 || Math.abs(b3) > 9);
        const c = a2 * b2 + a3 * b3;
        return {
          text: `Bestimme $t$ so, dass $\\spalte{t}{${zT(a2)}}{${zT(a3)}}$ und $\\spalte{t}{${zT(b2)}}{${zT(b3)}}$ orthogonal sind.`,
          schritte: [
            zahlS("c", "Konstante", `Skalarprodukt: $t \\cdot t + ${kz(a2)} \\cdot ${kz(b2)} + ${kz(a3)} \\cdot ${kz(b3)} = t^2 + c$. Wie groß ist $c$?`, "$c =$", q(c)),
            listeS("t", "Lösungen", "Löse $t^2 + c = 0$. Gib beide Lösungen mit Semikolon getrennt an.", "$t =$", [k, -k], { hinweis: "Eine quadratische Gleichung ohne lineares Glied: Wurzel ziehen, beide Vorzeichen." }),
          ],
          weg: [
            `$\\spalte{t}{${zT(a2)}}{${zT(a3)}} \\cdot \\spalte{t}{${zT(b2)}}{${zT(b3)}} = t^2 + ${kz(a2)} \\cdot ${kz(b2)} + ${kz(a3)} \\cdot ${kz(b3)} = t^2 ${c < 0 ? MINUS : "+"} ${Math.abs(c)}$`,
            `$t^2 ${c < 0 ? MINUS : "+"} ${Math.abs(c)} = 0$, also $t^2 = ${k * k}$ und $t = ${k}$ oder $t = ${MINUS}${k}$.`,
          ],
        };
      }
      // linear: a·b mit t in einer oder zwei Stellen → m·t + c = 0, t ganz
      let a, b, pos, m, c, t;
      const beide = variante === "zwei";
      do {
        a = zufVek(r, -4, 4, { keineNull: true }); b = zufVek(r, -4, 4, { keineNull: true });
        pos = ganz(r, 0, 2);
        t = ganz(r, -3, 3, [0]);
        if (beide) {
          // a = (k·t, a2, a3), b = (b1, t, b3): Skalarprodukt k·t·b1 + a2·t + a3·b3
          const k = ganz(r, 1, 3);
          m = k * b[0].z + a[1].z; c = a[2].z * b[2].z;
          a = [null, a[1], a[2]]; b = [b[0], null, b[2]];
          a.k = k;
        } else {
          m = b[pos].z; c = [0, 1, 2].filter((i) => i !== pos).reduce((s, i) => s + a[i].z * b[i].z, 0);
        }
      } while (m === 0 || c % m !== 0 || c === 0 || Math.abs(c / m) > 6);
      t = -c / m;
      if (beide) {
        const k = a.k;
        const aT = `\\spalte{${k === 1 ? "t" : `${k}t`}}{${zT(a[1])}}{${zT(a[2])}}`, bT = `\\spalte{${zT(b[0])}}{t}{${zT(b[2])}}`;
        const mT = summeT([[k * b[0].z, "t"], [a[1], "t"]]);
        return {
          text: `Bestimme $t$ so, dass $${aT}$ und $${bT}$ orthogonal sind.`,
          schritte: [
            zahlS("m", "Faktor vor t", `Skalarprodukt: $${k === 1 ? "t" : `${k}t`} \\cdot ${kz(b[0])} + ${kz(a[1])} \\cdot t + ${kz(a[2])} \\cdot ${kz(b[2])}$. Fasse zusammen zu $m \\cdot t + c$: Wie groß ist $m$?`, "$m =$", q(m)),
            zahlS("c", "Konstante", "Und $c$?", "$c =$", q(c)),
            zahlS("t", "Lösung", "Löse $m \\cdot t + c = 0$.", "$t =$", q(t), { fehler: [{ wert: -t, text: "Vorzeichen: $t = -\\frac{c}{m}$." }] }),
          ],
          weg: [`$${aT} \\cdot ${bT} = ${mT} + ${kz(a[2])} \\cdot ${kz(b[2])} = ${summeT([[m, "t"]])} ${c < 0 ? MINUS : "+"} ${Math.abs(c)}$`, `$${summeT([[m, "t"]])} ${c < 0 ? MINUS : "+"} ${Math.abs(c)} = 0$, also $t = ${zT(t)}$.`],
        };
      }
      const aT = `\\spalte{${pos === 0 ? "t" : zT(a[0])}}{${pos === 1 ? "t" : zT(a[1])}}{${pos === 2 ? "t" : zT(a[2])}}`;
      const glieder = [0, 1, 2].map((i) => (i === pos ? `t \\cdot ${kz(b[i])}` : `${kz(a[i])} \\cdot ${kz(b[i])}`)).join(" + ");
      return {
        text: `Bestimme $t$ so, dass $${aT}$ und $${vT(b)}$ orthogonal sind.`,
        schritte: [
          zahlS("c", "Konstante", `Skalarprodukt: $${glieder}$. Fasse zu $${summeT([[m, "t"]])} + c$ zusammen: Wie groß ist $c$?`, "$c =$", q(c)),
          zahlS("t", "Lösung", `Löse $${summeT([[m, "t"]])} + c = 0$.`, "$t =$", q(t), { fehler: [{ wert: -t, text: "Vorzeichen: $t = -\\frac{c}{m}$." }] }),
        ],
        weg: [`$${aT} \\cdot ${vT(b)} = ${glieder} = ${summeT([[m, "t"]])} ${c < 0 ? MINUS : "+"} ${Math.abs(c)}$`, `$${summeT([[m, "t"]])} ${c < 0 ? MINUS : "+"} ${Math.abs(c)} = 0$, also $t = ${zT(t)}$.`],
      };
    },
  },

  prodOrthoFinden: {
    titel: "Orthogonale Vektoren angeben",
    gen(r) {
      let w; do { w = zufVek(r, -4, 4, { keineNull: true }); } while (Math.abs(w[0].z) === Math.abs(w[1].z) && Math.abs(w[1].z) === Math.abs(w[2].z));
      const [w1, w2, w3] = w.map(qNum);
      const kand = [vKuerzen(vek(w2, -w1, 0)), vKuerzen(vek(w3, 0, -w1)), vKuerzen(vek(0, w3, -w2))];
      return {
        text: `Gib drei Vektoren an, die zu $\\vec{w} = ${vT(w)}$ orthogonal sind und von denen keine zwei parallel sind. Tipp: Setze je eine Koordinate 0 und tausche die anderen beiden mit einem Vorzeichenwechsel.`,
        schritte: [
          vektorS("v1", "Erster Vektor", "Dritte Koordinate 0: Welcher Vektor $\\spalte{x}{y}{0}$ mit kleinen ganzen Zahlen ist orthogonal zu $\\vec{w}$? (Nimm $x = w_2$.)", "$\\vec{v}_1 =$", vek(w2, -w1, 0), { hinweis: `$x \\cdot ${kz(w1)} + y \\cdot ${kz(w2)} = 0$` }),
          vektorS("v2", "Zweiter Vektor", "Zweite Koordinate 0: Welcher Vektor $\\spalte{x}{0}{z}$ ist orthogonal zu $\\vec{w}$? (Nimm $x = w_3$.)", "$\\vec{v}_2 =$", vek(w3, 0, -w1)),
          vektorS("v3", "Dritter Vektor", "Erste Koordinate 0: Welcher Vektor $\\spalte{0}{y}{z}$ ist orthogonal zu $\\vec{w}$? (Nimm $y = w_3$.)", "$\\vec{v}_3 =$", vek(0, w3, -w2)),
        ],
        weg: [
          `$\\spalte{${zT(w2)}}{${zT(-w1)}}{0} \\cdot ${vT(w)} = ${skalarWegT(vek(w2, -w1, 0), w)}$`,
          `$\\spalte{${zT(w3)}}{0}{${zT(-w1)}} \\cdot ${vT(w)} = ${skalarWegT(vek(w3, 0, -w1), w)}$`,
          `$\\spalte{0}{${zT(w3)}}{${zT(-w2)}} \\cdot ${vT(w)} = ${skalarWegT(vek(0, w3, -w2), w)}$`,
          `Keine zwei dieser Vektoren sind Vielfache voneinander (die Nullen stehen an verschiedenen Stellen). Jedes Vielfache davon ist ebenfalls eine Lösung.`,
        ],
      };
    },
  },

  prodRechterWinkel: {
    titel: "Rechter Winkel im Dreieck",
    gen(r, variante) {
      const D = variante === "keiner" ? dreieck(r, { recht: "keins" }) : dreieck(r, { recht: ganz(r, 0, 2) });
      const { A, B, C, AB, AC, BC, sp, rechtBei } = D;
      const ECKEN = [["A", "bei A"], ["B", "bei B"], ["C", "bei C"], ["keine", "kein rechter Winkel"]];
      return {
        text: `Prüfe, ob das Dreieck $${pT(A, "A")}$, $${pT(B, "B")}$, $${pT(C, "C")}$ einen rechten Winkel hat, und gib gegebenenfalls die Ecke an.`,
        schritte: [
          zahlS("a", "Ecke A", "Berechne $\\vec{AB} \\cdot \\vec{AC}$ – beide Vektoren zeigen von $A$ weg.", "$\\vec{AB} \\cdot \\vec{AC} =$", sp[0], { hinweis: `$\\vec{AB} = ${vT(AB)}$, $\\vec{AC} = ${vT(AC)}$` }),
          zahlS("b", "Ecke B", "Berechne $\\vec{BA} \\cdot \\vec{BC}$.", "$\\vec{BA} \\cdot \\vec{BC} =$", sp[1], { hinweis: `$\\vec{BA} = ${vT(vNeg(AB))}$, $\\vec{BC} = ${vT(BC)}$` }),
          zahlS("c", "Ecke C", "Berechne $\\vec{CA} \\cdot \\vec{CB}$.", "$\\vec{CA} \\cdot \\vec{CB} =$", sp[2], { hinweis: `$\\vec{CA} = ${vT(vNeg(AC))}$, $\\vec{CB} = ${vT(vNeg(BC))}$` }),
          wahlS("ecke", "Rechter Winkel", "Wo ist der rechte Winkel?", ECKEN, rechtBei >= 0 ? ["A", "B", "C"][rechtBei] : "keine", { hinweis: "Rechter Winkel genau dort, wo das Skalarprodukt der beiden Schenkel 0 ist." }),
        ],
        weg: [
          `$\\vec{AB} \\cdot \\vec{AC} = ${vT(AB)} \\cdot ${vT(AC)} = ${skalarWegT(AB, AC)}$`,
          `$\\vec{BA} \\cdot \\vec{BC} = ${vT(vNeg(AB))} \\cdot ${vT(BC)} = ${skalarWegT(vNeg(AB), BC)}$`,
          `$\\vec{CA} \\cdot \\vec{CB} = ${vT(vNeg(AC))} \\cdot ${vT(vNeg(BC))} = ${skalarWegT(vNeg(AC), vNeg(BC))}$`,
          rechtBei >= 0 ? `Nur bei $${["A", "B", "C"][rechtBei]}$ ist das Skalarprodukt 0: Dort ist der rechte Winkel.` : "Kein Skalarprodukt ist 0: Das Dreieck hat keinen rechten Winkel.",
        ],
      };
    },
  },

  prodWuerfelDiagonalen: {
    titel: "Diagonalen im Würfel",
    gen(r) {
      const k = ganz(r, 2, 6);
      const O = vek(0, 0, 0), G = vek(k, k, k), B = vek(k, 0, 0), Dp = vek(0, k, 0), F = vek(k, k, 0);
      const OG = G, BD = nach(B, Dp), OF = F;
      return {
        text: `Im Würfel mit den Ecken $O(0 \\mid 0 \\mid 0)$ und $G(${k} \\mid ${k} \\mid ${k})$ ist die Raumdiagonale $\\vec{OG}$ orthogonal zur Flächendiagonale von $B(${k} \\mid 0 \\mid 0)$ nach $D(0 \\mid ${k} \\mid 0)$, aber nicht zu der von $O$ nach $F(${k} \\mid ${k} \\mid 0)$. Zeige das rechnerisch.`,
        schritte: [
          vektorS("og", "Raumdiagonale", "Gib $\\vec{OG}$ an.", "$\\vec{OG} =$", OG),
          vektorS("bd", "Flächendiagonale BD", "Berechne $\\vec{BD} = \\vec{d} - \\vec{b}$.", "$\\vec{BD} =$", BD),
          zahlS("s1", "Skalarprodukt", "Berechne $\\vec{OG} \\cdot \\vec{BD}$.", "$\\vec{OG} \\cdot \\vec{BD} =$", vDot(OG, BD)),
          zahlS("s2", "Skalarprodukt", "Berechne $\\vec{OG} \\cdot \\vec{OF}$.", "$\\vec{OG} \\cdot \\vec{OF} =$", vDot(OG, OF)),
          wahlS("fazit", "Folgerung", "Was folgt?", [["bd", "$\\vec{OG} \\perp \\vec{BD}$, aber $\\vec{OG}$ ist nicht orthogonal zu $\\vec{OF}$."], ["beide", "Beide Flächendiagonalen sind orthogonal zu $\\vec{OG}$."], ["keine", "Keine der beiden ist orthogonal zu $\\vec{OG}$."]], "bd"),
        ],
        weg: [
          `$\\vec{OG} = ${vT(OG)}$, $\\vec{BD} = ${vT(Dp)} ${MINUS} ${vT(B)} = ${vT(BD)}$, $\\vec{OF} = ${vT(OF)}$`,
          `$\\vec{OG} \\cdot \\vec{BD} = ${skalarWegT(OG, BD)}$ – orthogonal.`,
          `$\\vec{OG} \\cdot \\vec{OF} = ${skalarWegT(OG, OF)} \\ne 0$ – nicht orthogonal.`,
        ],
      };
    },
  },

  prodSenkrechte2d: {
    titel: "Senkrechte Gerade mit dem Skalarprodukt",
    gen(r) {
      const m = eins(r, [q(2, 3), q(-2, 3), q(3, 2), q(-3, 2), q(1, 2), q(-1, 2), q(3, 4), q(-3, 4), q(2), q(-2), q(1, 3), q(-1, 3)]);
      const c = q(ganz(r, -4, 4));
      const u = vek(m.n, m.z);           // Richtungsvektor von g
      const n = vek(-m.z, m.n);          // senkrecht dazu
      const mh = qDiv(q(-1), m);
      const px = q(ganz(r, -4, 4, [0]) * (mh.n === 1 ? 1 : mh.n)), py = q(ganz(r, -4, 5));
      const ch = qSub(py, qMul(mh, px));
      const gl = (mm, cc) => `${summeT([[mm, "x"]])}${cc.z === 0 ? "" : cc.z < 0 ? ` ${MINUS} ${zT(qNeg(cc))}` : ` + ${zT(cc)}`}`;
      return {
        text: `Bestimme mit dem Skalarprodukt die Gerade $h$ durch $P(${zT(px)} \\mid ${zT(py)})$, die senkrecht zu $g: y = ${gl(m, c)}$ ist.`,
        schritte: [
          vektorS("u", "Richtungsvektor von g", `Steigung $${zT(m)}$: $\\Delta x = ${m.n}$, $\\Delta y = ${zT(m.z)}$.`, "$\\vec{u} =$", u, { hinweis: "Ein Richtungsvektor der Geraden $y = mx + c$ ist $\\binom{1}{m}$ – oder ein Vielfaches ohne Bruch." }),
          vektorS("n", "Senkrechter Vektor", "Finde $\\vec{n}$ mit $\\vec{u} \\cdot \\vec{n} = 0$: Koordinaten tauschen, ein Vorzeichen wechseln.", "$\\vec{n} =$", n, { hinweis: `$${vT(n)}$ oder das Negative davon – beide passen.` }),
          zahlS("mh", "Steigung von h", "Welche Steigung hat $h$? ($\\Delta y$ durch $\\Delta x$ des senkrechten Vektors.)", "$m_h =$", mh, { fehler: [{ wert: -qNum(m), text: "Nur das Vorzeichen wechseln reicht nicht: $m_h = -\\frac{1}{m}$." }] }),
          zahlS("ch", "y-Achsenabschnitt", "Setze $P$ in $y = m_h x + c$ ein.", "$c_h =$", ch),
        ],
        weg: [
          `Richtungsvektor von $g$: $\\vec{u} = ${vT(u)}$. Senkrecht dazu: $\\vec{n} = ${vT(n)}$, denn $${skalarWegT(u, n)}$.`,
          `Steigung von $h$: $m_h = \\frac{${zT(n[1])}}{${zT(n[0])}} = ${zT(mh)}$.`,
          `$P$ einsetzen: $${zT(py)} = ${zT(mh)} \\cdot ${kz(px)} + c$, also $c = ${zT(ch)}$. $h: y = ${gl(mh, ch)}$`,
        ],
      };
    },
  },

  prodWinkel: {
    titel: "Winkel zwischen zwei Vektoren",
    gen(r, variante) {
      let a, b;
      if (variante === "schoen") {
        // ganzzahlige Beträge
        const basis = [[1, 2, 2], [2, 3, 6], [3, 0, 4], [1, 4, 8], [2, 6, 9], [0, 3, 4], [4, 4, 7]];
        do { a = mische(r, eins(r, basis).map((x) => q(x * vz(r)))); b = mische(r, eins(r, basis).map((x) => q(x * vz(r)))); } while (kollinearFaktor(a, b) !== null);
      } else {
        do { a = zufVek(r, -3, 4); b = zufVek(r, -3, 4); } while (kollinearFaktor(a, b) !== null || qNum(vBetrag2(a)) > 30 || qNum(vBetrag2(b)) > 30);
      }
      const w = winkel(a, b);
      return {
        text: `Berechne den Winkel zwischen $\\vec{a} = ${vT(a)}$ und $\\vec{b} = ${vT(b)}$ (auf eine Nachkommastelle).`,
        schritte: winkelSchritte(a, b),
        weg: [
          `$\\vec{a} \\cdot \\vec{b} = ${skalarWegT(a, b)}$`,
          `$|\\vec{a}| = ${betragWegT(a)}$, $|\\vec{b}| = ${betragWegT(b)}$`,
          `$\\cos \\alpha = \\frac{\\vec{a} \\cdot \\vec{b}}{|\\vec{a}| \\cdot |\\vec{b}|} = ${cosT(w.sp, a, b)} \\approx ${dezT(Math.round(w.cos * 10000) / 10000)}$, also $\\alpha \\approx ${gradT(w.grad)}$`,
          ...(w.grad === 90 ? ["Skalarprodukt 0: Die Vektoren stehen senkrecht aufeinander."] : w.grad > 90 ? ["Negatives Skalarprodukt: Der Winkel ist stumpf."] : []),
        ],
      };
    },
  },

  prodDreieckWinkel: {
    titel: "Innenwinkel eines Dreiecks",
    gen(r, variante) {
      const D = variante === "rechtwinklig" ? dreieck(r, { recht: 1 }) : dreieck(r, { recht: "keins", lo: -2, hi: 4 });
      const { A, B, C, AB, AC, BC } = D;
      const wA = winkel(AB, AC), wB = winkel(vNeg(AB), BC), wC = winkel(vNeg(AC), vNeg(BC));
      const summe = Math.round((wA.grad + wB.grad + wC.grad) * 10) / 10;
      if (variante === "rechtwinklig") {
        const kr = vCross(AB, AC);
        const F2 = qNum(vBetrag2(kr));
        const F = Math.sqrt(F2) / 2;
        const katheten = [betragNum(AB), betragNum(BC)];
        return {
          text: `Gegeben ist das Dreieck $${pT(A, "A")}$, $${pT(B, "B")}$, $${pT(C, "C")}$. a) Zeige, dass es bei $B$ rechtwinklig ist. b) Berechne die beiden anderen Innenwinkel und prüfe mit der Winkelsumme. c) Berechne den Flächeninhalt mit den Katheten und mit dem Kreuzprodukt.`,
          schritte: [
            zahlS("spB", "Skalarprodukt bei B", "Berechne $\\vec{BA} \\cdot \\vec{BC}$.", "$\\vec{BA} \\cdot \\vec{BC} =$", q(0), { hinweis: `$\\vec{BA} = ${vT(vNeg(AB))}$, $\\vec{BC} = ${vT(BC)}$` }),
            zahlR("wA", "Winkel bei A", "$\\cos \\alpha = \\frac{\\vec{AB} \\cdot \\vec{AC}}{|\\vec{AB}| \\cdot |\\vec{AC}|}$", "$\\alpha =$", wA.grad, { tol: 0.11, einheit: "°", wertText: `$${gradT(wA.grad)}$` }),
            zahlR("wC", "Winkel bei C", "$\\cos \\gamma = \\frac{\\vec{CA} \\cdot \\vec{CB}}{|\\vec{CA}| \\cdot |\\vec{CB}|}$", "$\\gamma =$", wC.grad, { tol: 0.11, einheit: "°", wertText: `$${gradT(wC.grad)}$` }),
            zahlR("summe", "Winkelsumme", "Addiere $\\alpha + 90^\\circ + \\gamma$ (Rundung: ±0,1°).", "Summe $=$", summe, { tol: 0.15, einheit: "°", wertText: `$${gradT(summe)}$` }),
            zahlR("F1", "Fläche mit Katheten", `Die Katheten sind $|\\vec{BA}| = ${betragT(AB)}$ und $|\\vec{BC}| = ${betragT(BC)}$: $F = \\frac{1}{2} \\cdot |\\vec{BA}| \\cdot |\\vec{BC}|$.`, "$F =$", Math.round(F * 100) / 100, { tol: 0.011, wertText: `$${dezT(Math.round(F * 100) / 100)}$` }),
            vektorS("kr", "Kreuzprodukt", "Berechne $\\vec{AB} \\times \\vec{AC}$.", "$\\vec{AB} \\times \\vec{AC} =$", kr),
            zahlR("F2", "Fläche mit Kreuzprodukt", "$F = \\frac{1}{2} \\cdot |\\vec{AB} \\times \\vec{AC}|$", "$F =$", Math.round(F * 100) / 100, { tol: 0.011, wertText: `$${dezT(Math.round(F * 100) / 100)}$` }),
          ],
          weg: [
            `a) $\\vec{BA} \\cdot \\vec{BC} = ${vT(vNeg(AB))} \\cdot ${vT(BC)} = ${skalarWegT(vNeg(AB), BC)}$ – rechter Winkel bei $B$.`,
            `b) ${winkelWegT(AB, AC, "\\alpha").replace(/^\$/, "$")}; ${winkelWegT(vNeg(AC), vNeg(BC), "\\gamma")}`,
            `Winkelsumme: $${gradT(wA.grad)} + 90^\\circ + ${gradT(wC.grad)} = ${gradT(summe)}$`,
            `c) Katheten: $F = \\frac{1}{2} \\cdot ${betragT(AB)} \\cdot ${betragT(BC)} ${Number.isInteger(F * 2) ? "=" : "\\approx"} ${dezT(Math.round(F * 100) / 100)}$`,
            `Kreuzprodukt: $\\vec{AB} \\times \\vec{AC} = ${kreuzWegT(AB, AC)}$, $|\\vec{AB} \\times \\vec{AC}| = ${betragWegT(kr)}$, $F = \\frac{1}{2} \\cdot ${wurzelT(F2)} ${Number.isInteger(F * 2) ? "=" : "\\approx"} ${dezT(Math.round(F * 100) / 100)}$`,
          ],
        };
      }
      return {
        text: `Berechne alle Innenwinkel des Dreiecks $${pT(A, "A")}$, $${pT(B, "B")}$, $${pT(C, "C")}$ (auf eine Nachkommastelle) und prüfe mit der Winkelsumme.`,
        schritte: [
          zahlR("wA", "Winkel bei A", "Schenkel $\\vec{AB}$ und $\\vec{AC}$ – beide zeigen von $A$ weg.", "$\\alpha =$", wA.grad, { tol: 0.11, einheit: "°", wertText: `$${gradT(wA.grad)}$`, hinweis: `$\\vec{AB} = ${vT(AB)}$, $\\vec{AC} = ${vT(AC)}$` }),
          zahlR("wB", "Winkel bei B", "Schenkel $\\vec{BA}$ und $\\vec{BC}$.", "$\\beta =$", wB.grad, { tol: 0.11, einheit: "°", wertText: `$${gradT(wB.grad)}$`, hinweis: `$\\vec{BA} = ${vT(vNeg(AB))}$, $\\vec{BC} = ${vT(BC)}$` }),
          zahlR("wC", "Winkel bei C", "Schenkel $\\vec{CA}$ und $\\vec{CB}$.", "$\\gamma =$", wC.grad, { tol: 0.11, einheit: "°", wertText: `$${gradT(wC.grad)}$`, hinweis: `$\\vec{CA} = ${vT(vNeg(AC))}$, $\\vec{CB} = ${vT(vNeg(BC))}$` }),
          zahlR("summe", "Winkelsumme", "Addiere die drei Winkel (durch Rundung kann 179,9° oder 180,1° herauskommen).", "Summe $=$", summe, { tol: 0.15, einheit: "°", wertText: `$${gradT(summe)}$` }),
        ],
        weg: [
          `$\\vec{AB} = ${vT(AB)}$, $\\vec{AC} = ${vT(AC)}$, $\\vec{BC} = ${vT(BC)}$`,
          `Bei $A$: ${winkelWegT(AB, AC, "\\alpha")}`,
          `Bei $B$: ${winkelWegT(vNeg(AB), BC, "\\beta")}`,
          `Bei $C$: ${winkelWegT(vNeg(AC), vNeg(BC), "\\gamma")}`,
          `Summe: $${gradT(wA.grad)} + ${gradT(wB.grad)} + ${gradT(wC.grad)} = ${gradT(summe)}$`,
        ],
      };
    },
  },

  prodWuerfelWinkel: {
    titel: "Winkel im Würfel",
    gen(r) {
      const k = ganz(r, 2, 6);
      const OG = vek(k, k, k), OB = vek(k, 0, 0), OF = vek(k, k, 0);
      const w1 = winkel(OG, OB), w2 = winkel(OG, OF);
      return {
        text: `Im Würfel mit den Ecken $O(0 \\mid 0 \\mid 0)$, $B(${k} \\mid 0 \\mid 0)$, $F(${k} \\mid ${k} \\mid 0)$ und $G(${k} \\mid ${k} \\mid ${k})$: Berechne den Winkel $\\alpha$ zwischen $\\vec{OG}$ und $\\vec{OB}$ sowie den Winkel $\\beta$ zwischen $\\vec{OG}$ und $\\vec{OF}$ (eine Nachkommastelle).`,
        schritte: [
          zahlS("sp1", "Skalarprodukt", "Berechne $\\vec{OG} \\cdot \\vec{OB}$.", "$\\vec{OG} \\cdot \\vec{OB} =$", w1.sp),
          zahlR("bOG", "Betrag der Raumdiagonale", "Berechne $|\\vec{OG}|$ (2 Stellen).", "$|\\vec{OG}| =$", Math.round(betragNum(OG) * 100) / 100, { tol: 0.011, wertText: `$${betragT(OG)}$` }),
          zahlR("w1", "Winkel α", "$\\cos \\alpha = \\frac{\\vec{OG} \\cdot \\vec{OB}}{|\\vec{OG}| \\cdot |\\vec{OB}|}$", "$\\alpha =$", w1.grad, { tol: 0.11, einheit: "°", wertText: `$${gradT(w1.grad)}$` }),
          zahlS("sp2", "Skalarprodukt", "Berechne $\\vec{OG} \\cdot \\vec{OF}$.", "$\\vec{OG} \\cdot \\vec{OF} =$", w2.sp),
          zahlR("w2", "Winkel β", "$\\cos \\beta = \\frac{\\vec{OG} \\cdot \\vec{OF}}{|\\vec{OG}| \\cdot |\\vec{OF}|}$", "$\\beta =$", w2.grad, { tol: 0.11, einheit: "°", wertText: `$${gradT(w2.grad)}$` }),
        ],
        weg: [
          `$\\vec{OG} = ${vT(OG)}$, $\\vec{OB} = ${vT(OB)}$, $\\vec{OF} = ${vT(OF)}$; $|\\vec{OG}| = ${betragWegT(OG)}$, $|\\vec{OB}| = ${k}$, $|\\vec{OF}| = ${betragWegT(OF)}$`,
          winkelWegT(OG, OB, "\\alpha"),
          winkelWegT(OG, OF, "\\beta"),
          `Kontrolle: $\\alpha + \\beta = ${gradT(Math.round((w1.grad + w2.grad) * 10) / 10)}$ – die Raumdiagonale, die Kante und die Flächendiagonale bilden ein rechtwinkliges Dreieck. Die Winkel hängen nicht von der Kantenlänge ab.`,
        ],
      };
    },
  },

  prodDachWinkel: {
    titel: "Winkel zwischen Dachkanten",
    gen(r) {
      // Pyramide: quadratische Grundfläche A(a|−a|0) B(a|a|0) C(−a|a|0) D(−a|−a|0), Spitze S(0|0|h)
      const a = ganz(r, 1, 3), h = ganz(r, 2, 5);
      const S = vek(0, 0, h), A = vek(a, -a, 0), B = vek(a, a, 0), C = vek(-a, a, 0);
      const SA = nach(S, A), SB = nach(S, B), SC = nach(S, C);
      const w1 = winkel(SA, SC), w2 = winkel(SA, SB);
      return {
        text: `Ein Zeltdach ist eine Pyramide mit der Spitze $${pT(S, "S")}$ über dem Quadrat mit den Ecken $${pT(A, "A")}$, $${pT(B, "B")}$, $${pT(C, "C")}$ und $D(${MINUS}${a} \\mid ${MINUS}${a} \\mid 0)$ (in m). Wie groß ist der Winkel zwischen den gegenüberliegenden Dachkanten $\\vec{SA}$ und $\\vec{SC}$? Wie groß ist der Winkel zwischen den benachbarten Kanten $\\vec{SA}$ und $\\vec{SB}$?`,
        schritte: [
          vektorS("sa", "Kante SA", "Berechne $\\vec{SA} = \\vec{a} - \\vec{s}$.", "$\\vec{SA} =$", SA),
          vektorS("sc", "Kante SC", "Berechne $\\vec{SC}$.", "$\\vec{SC} =$", SC),
          zahlR("w1", "Winkel zwischen SA und SC", "$\\cos \\alpha = \\frac{\\vec{SA} \\cdot \\vec{SC}}{|\\vec{SA}| \\cdot |\\vec{SC}|}$", "$\\alpha =$", w1.grad, { tol: 0.11, einheit: "°", wertText: `$${gradT(w1.grad)}$` }),
          zahlR("w2", "Winkel zwischen SA und SB", "$\\vec{SB} = \\vec{b} - \\vec{s}$, dann die Winkelformel.", "$\\beta =$", w2.grad, { tol: 0.11, einheit: "°", wertText: `$${gradT(w2.grad)}$` }),
        ],
        weg: [
          `$\\vec{SA} = ${vT(A)} ${MINUS} ${vT(S)} = ${vT(SA)}$, $\\vec{SC} = ${vT(SC)}$, $\\vec{SB} = ${vT(SB)}$; alle drei haben den Betrag $${betragWegT(SA)}$.`,
          winkelWegT(SA, SC, "\\alpha") + (w1.grad === 90 ? " – die gegenüberliegenden Kanten stehen senkrecht." : " – nicht senkrecht."),
          winkelWegT(SA, SB, "\\beta"),
        ],
      };
    },
  },

  prodWinkelFehler: {
    titel: "Winkel bei einer Ecke – richtige Schenkel",
    gen(r) {
      // Dreieck, bei dem der Winkel bei B stumpf ist: AB·BC > 0 (Lea nimmt AB und BC → spitzer Nebenwinkel)
      let D;
      do { D = dreieck(r, { recht: "keins", lo: -2, hi: 4 }); } while (qNum(vDot(D.AB, D.BC)) <= 0 || qNum(vBetrag2(D.AB)) > 20 || qNum(vBetrag2(D.BC)) > 20);
      const { A, B, C, AB, BC } = D;
      const falsch = winkel(AB, BC), richtig = winkel(vNeg(AB), BC);
      return {
        text: `Finde den Fehler: Lea soll im Dreieck $${pT(A, "A")}$, $${pT(B, "B")}$, $${pT(C, "C")}$ den Winkel bei $B$ berechnen. Sie nimmt $\\vec{AB}$ und $\\vec{BC}$ und erhält $${gradT(falsch.grad)}$.`,
        schritte: [
          wahlS("fehler", "Der Fehler", "Was hat Lea falsch gemacht?", mische(r, [["schenkel", "$\\vec{AB}$ zeigt nicht von $B$ weg – beide Schenkel müssen in $B$ beginnen: $\\vec{BA}$ und $\\vec{BC}$."], ["betrag", "Sie hat die Beträge falsch berechnet."], ["cos", "Sie hätte den Sinus statt des Kosinus nehmen müssen."]]), "schenkel"),
          vektorS("ba", "Richtiger Schenkel", "Berechne $\\vec{BA}$.", "$\\vec{BA} =$", vNeg(AB)),
          zahlS("sp", "Skalarprodukt", "Berechne $\\vec{BA} \\cdot \\vec{BC}$.", "$\\vec{BA} \\cdot \\vec{BC} =$", richtig.sp),
          zahlR("w", "Winkel bei B", "Berechne $\\beta$ mit der Winkelformel (eine Nachkommastelle).", "$\\beta =$", richtig.grad, { tol: 0.11, einheit: "°", wertText: `$${gradT(richtig.grad)}$` }),
        ],
        weg: [
          `$\\vec{AB} = ${vT(AB)}$ zeigt zu $B$ hin, nicht von $B$ weg. Beide Schenkel müssen in $B$ beginnen: $\\vec{BA} = ${vT(vNeg(AB))}$ und $\\vec{BC} = ${vT(BC)}$.`,
          winkelWegT(vNeg(AB), BC, "\\beta"),
          `Leas $${gradT(falsch.grad)}$ ist der Nebenwinkel: $${gradT(falsch.grad)} + ${gradT(richtig.grad)} = 180^\\circ$.`,
        ],
      };
    },
  },

  prodWinkelParam: {
    titel: "Parameter für einen vorgegebenen Winkel",
    gen(r) {
      // (1,0,0)·(1,1,t): cos = 1/sqrt(2+t²) = 1/2 → t² = 2;  allgemein: e_i und (…) mit Winkel 60° oder 45°
      const art = eins(r, ["60", "45", "60"]);
      if (art === "45") {
        // (1,0,0) und (1,t,0)... cos 45 = 1/sqrt(1+t²)= √2/2 → t² = 1 → langweilig; nimm (2,0,0),(2,t,t): 2/(sqrt(4+2t²)) → 4/(4+2t²)=1/2 → t²=2
        return {
          text: `Für welche Werte von $t$ schließen $\\spalte{2}{0}{0}$ und $\\spalte{2}{t}{t}$ einen Winkel von $45^\\circ$ ein?`,
          schritte: [
            zahlR("cos", "Kosinus", "Welchen Wert hat $\\cos 45^\\circ$ (3 Stellen)?", "$\\cos 45^\\circ =$", 0.707, { tol: 0.002, wertText: "$\\frac{\\sqrt{2}}{2} \\approx 0{,}707$" }),
            zahlS("t2", "Gleichung", "Winkelformel: $\\frac{4}{2 \\cdot \\sqrt{4 + 2t^2}} = \\frac{\\sqrt{2}}{2}$. Quadriere und löse nach $t^2$ auf.", "$t^2 =$", q(2)),
            listeS("t", "Lösungen", "Beide Lösungen (Semikolon, z. B. sqrt(2); -sqrt(2)).", "$t =$", [Math.SQRT2, -Math.SQRT2], { tol: 1e-4, wertText: "$\\sqrt{2}$; $-\\sqrt{2}$" }),
          ],
          weg: [
            `$\\cos \\alpha = \\frac{2 \\cdot 2 + 0 \\cdot t + 0 \\cdot t}{2 \\cdot \\sqrt{4 + 2t^2}} = \\frac{2}{\\sqrt{4 + 2t^2}}$ und $\\cos 45^\\circ = \\frac{\\sqrt{2}}{2}$`,
            `$\\frac{2}{\\sqrt{4 + 2t^2}} = \\frac{\\sqrt{2}}{2}$, quadriert: $\\frac{4}{4 + 2t^2} = \\frac{1}{2}$, also $4 + 2t^2 = 8$, $t^2 = 2$.`,
            `$t = \\sqrt{2}$ oder $t = ${MINUS}\\sqrt{2}$.`,
          ],
        };
      }
      // 60°: (1,0,0)·(1,c,t) mit c ∈ {1,2,3}: cos = 1/sqrt(1+c²+t²) = 1/2 → t² = 3 − c²  → c=1: t²=2
      // allgemeiner: (k,0,0)·(k,c,t): k/sqrt(k²+c²+t²)=1/2 → t² = 3k² − c²
      let k, c, t2;
      do { k = ganz(r, 1, 3); c = ganz(r, 1, 3); t2 = 3 * k * k - c * c; } while (t2 <= 0 || Number.isInteger(Math.sqrt(t2)) || t2 > 30);
      const wT = wurzelT(t2);
      const tNum = Math.sqrt(t2);
      const vT2 = `\\spalte{${k}}{${c}}{t}`;
      const nenner = `${k === 1 ? "" : `${k} \\cdot `}\\sqrt{${k * k + c * c} + t^2}`;
      return {
        text: `Für welche Werte von $t$ schließen $\\spalte{${k}}{0}{0}$ und $${vT2}$ einen Winkel von $60^\\circ$ ein?`,
        schritte: [
          zahlS("cos", "Kosinus", "Welchen Wert hat $\\cos 60^\\circ$?", "$\\cos 60^\\circ =$", q(1, 2)),
          zahlS("t2", "Gleichung", `Winkelformel: $\\frac{${k * k}}{${nenner}} = \\frac{1}{2}$. Löse nach $t^2$ auf.`, "$t^2 =$", q(t2), { hinweis: `Kürzen: $\\frac{${k}}{\\sqrt{${k * k + c * c} + t^2}} = \\frac{1}{2}$, dann $\\sqrt{${k * k + c * c} + t^2} = ${2 * k}$, quadrieren.` }),
          listeS("t", "Lösungen", `Beide Lösungen (Semikolon, Wurzeln als sqrt(…)).`, "$t =$", [tNum, -tNum], { tol: 1e-4, wertText: `$${wT}$; $${MINUS}${wT}$` }),
        ],
        weg: [
          `$\\cos \\alpha = \\frac{${k} \\cdot ${k} + 0 \\cdot ${c} + 0 \\cdot t}{${k === 1 ? "" : `${k} \\cdot `}\\sqrt{${k * k} + ${c * c} + t^2}} = \\frac{${k}}{\\sqrt{${k * k + c * c} + t^2}}$ und $\\cos 60^\\circ = \\frac{1}{2}$`,
          `$\\frac{${k}}{\\sqrt{${k * k + c * c} + t^2}} = \\frac{1}{2}$, also $\\sqrt{${k * k + c * c} + t^2} = ${2 * k}$, quadriert: $${k * k + c * c} + t^2 = ${4 * k * k}$, $t^2 = ${t2}$.`,
          `$t = ${wT}$ oder $t = ${MINUS}${wT}$.`,
        ],
      };
    },
  },

  prodKreuz: {
    titel: "Kreuzprodukt mit Probe",
    gen(r, variante) {
      let a, b;
      do { a = zufVek(r, -4, 4); b = zufVek(r, -4, 4); } while (variante !== "parallel" && kollinearFaktor(a, b) !== null);
      if (variante === "parallel") { do { a = zufVek(r, -3, 3); } while (vNull(a)); const k = eins(r, [q(-2), q(2), q(-1), q(3)]); b = vSkal(k, a); }
      const c = vCross(a, b);
      const schritte = [
        vektorS("c", "Kreuzprodukt", "Berechne $\\vec{a} \\times \\vec{b}$ mit der Formel $\\spalte{a_2 b_3 - a_3 b_2}{a_3 b_1 - a_1 b_3}{a_1 b_2 - a_2 b_1}$.", "$\\vec{a} \\times \\vec{b} =$", c, { hinweis: "Für jede Zeile die beiden anderen Zeilen über Kreuz multiplizieren – erst „nach unten“, dann „nach oben“ abziehen." }),
        zahlS("pa", "Probe mit a", "Berechne $(\\vec{a} \\times \\vec{b}) \\cdot \\vec{a}$.", "$(\\vec{a} \\times \\vec{b}) \\cdot \\vec{a} =$", q(0)),
        zahlS("pb", "Probe mit b", "Berechne $(\\vec{a} \\times \\vec{b}) \\cdot \\vec{b}$.", "$(\\vec{a} \\times \\vec{b}) \\cdot \\vec{b} =$", q(0)),
      ];
      const weg = [`$\\vec{a} \\times \\vec{b} = ${kreuzWegT(a, b)}$`];
      if (vNull(c)) {
        const k = kollinearFaktor(a, b);
        weg.push(`Das Kreuzprodukt ist der Nullvektor: Die Vektoren sind parallel ($\\vec{b} = ${malT(k, "\\vec{a}")}$). Probe: Skalarprodukt mit $\\vec{a}$ und $\\vec{b}$ ist 0.`);
        schritte.push(wahlS("warum", "Deutung", "Warum kommt der Nullvektor heraus?", [["par", "Die Vektoren sind parallel – sie spannen kein Parallelogramm auf."], ["ortho", "Die Vektoren sind orthogonal."], ["rechen", "Rechenfehler – der Nullvektor kann nicht herauskommen."]], "par"));
      } else {
        weg.push(`Probe: $${vT(c)} \\cdot ${vT(a)} = ${skalarWegT(c, a)}$ und $${vT(c)} \\cdot ${vT(b)} = ${skalarWegT(c, b)}$ – das Ergebnis steht senkrecht auf beiden Vektoren.`);
      }
      return { text: `Berechne $${vT(a)} \\times ${vT(b)}$ und zeige mit dem Skalarprodukt, dass das Ergebnis zu beiden Vektoren orthogonal ist.`, schritte, weg };
    },
  },

  prodDreieckFlaeche: {
    titel: "Flächeninhalt eines Dreiecks",
    gen(r) {
      let D, kr, F2;
      do { D = dreieck(r, { lo: -2, hi: 4 }); kr = vCross(D.AB, D.AC); F2 = qNum(vBetrag2(kr)); } while (F2 > 400 || kr.some((x) => Math.abs(x.z) > 20));
      const { A, B, C, AB, AC } = D;
      const F = Math.sqrt(F2) / 2;
      const ganzF = Number.isInteger(Math.sqrt(F2));
      return {
        text: `Berechne den Flächeninhalt des Dreiecks $${pT(A, "A")}$, $${pT(B, "B")}$, $${pT(C, "C")}$${ganzF ? "" : " (auf 2 Nachkommastellen)"}.`,
        schritte: [
          vektorS("ab", "Richtungsvektor", "Berechne $\\vec{AB}$.", "$\\vec{AB} =$", AB),
          vektorS("ac", "Richtungsvektor", "Berechne $\\vec{AC}$.", "$\\vec{AC} =$", AC),
          vektorS("kr", "Kreuzprodukt", "Berechne $\\vec{AB} \\times \\vec{AC}$.", "$\\vec{AB} \\times \\vec{AC} =$", kr),
          zahlR("F", "Fläche", "$F = \\frac{1}{2} \\cdot |\\vec{AB} \\times \\vec{AC}|$", "$F =$", Math.round(F * 100) / 100, { tol: 0.011, wertText: ganzF ? `$${dezT(F)}$` : `$\\frac{1}{2} \\cdot ${wurzelT(F2)} \\approx ${dezT(Math.round(F * 100) / 100)}$`, fehler: [{ wert: Math.round(F * 200) / 100, text: "Das ist die Fläche des Parallelogramms – das Dreieck ist die Hälfte." }] }),
        ],
        weg: [
          `$\\vec{AB} = ${vT(AB)}$, $\\vec{AC} = ${vT(AC)}$`,
          `$\\vec{AB} \\times \\vec{AC} = ${kreuzWegT(AB, AC)}$`,
          `$|\\vec{AB} \\times \\vec{AC}| = ${betragWegT(kr)}$`,
          `$F = \\frac{1}{2} \\cdot ${wurzelT(F2)} ${ganzF ? "=" : "\\approx"} ${dezT(Math.round(F * 100) / 100)}$`,
        ],
      };
    },
  },

  prodParallelogramm: {
    titel: "Parallelogramm: vierte Ecke und Fläche",
    gen(r) {
      let A, B, Dp, AB, AD, kr, F2;
      do {
        A = zufPunkt(r, -2, 4); B = zufPunkt(r, -2, 4); Dp = zufPunkt(r, -2, 4);
        AB = nach(A, B); AD = nach(A, Dp); kr = vCross(AB, AD); F2 = qNum(vBetrag2(kr));
      } while (vNull(AB) || vNull(AD) || kollinearFaktor(AB, AD) !== null || !Number.isInteger(Math.sqrt(F2)) || F2 > 900 || F2 === 0);
      const C = vAdd(B, AD);
      const F = Math.sqrt(F2);
      return {
        text: `Das Parallelogramm $ABCD$ hat die Ecken $${pT(A, "A")}$, $${pT(B, "B")}$ und $${pT(Dp, "D")}$. Bestimme $C$ und den Flächeninhalt.`,
        schritte: [
          vektorS("ab", "Seite AB", "Berechne $\\vec{AB}$.", "$\\vec{AB} =$", AB),
          vektorS("ad", "Seite AD", "Berechne $\\vec{AD}$.", "$\\vec{AD} =$", AD),
          punktS("C", "Ecke C", "Im Parallelogramm gilt $\\vec{c} = \\vec{b} + \\vec{AD}$ (von $B$ aus genauso weiter wie von $A$ nach $D$).", "$C =$", C, { hinweis: "$\\vec{c} = \\vec{b} + \\vec{d} - \\vec{a}$" }),
          vektorS("kr", "Kreuzprodukt", "Berechne $\\vec{AB} \\times \\vec{AD}$.", "$\\vec{AB} \\times \\vec{AD} =$", kr),
          zahlS("F", "Fläche", "$F = |\\vec{AB} \\times \\vec{AD}|$ – beim Parallelogramm ohne $\\frac{1}{2}$.", "$F =$", q(F), { fehler: [{ wert: F / 2, text: "Das wäre die Dreiecksfläche. Das Parallelogramm ist das ganze Kreuzprodukt." }] }),
        ],
        weg: [
          `$\\vec{AB} = ${vT(AB)}$, $\\vec{AD} = ${vT(AD)}$; $\\vec{c} = \\vec{b} + \\vec{AD} = ${vT(B)} + ${vT(AD)} = ${vT(C)}$, also $${pT(C, "C")}$`,
          `$\\vec{AB} \\times \\vec{AD} = ${kreuzWegT(AB, AD)}$`,
          `$F = |\\vec{AB} \\times \\vec{AD}| = ${betragWegT(kr)}$`,
        ],
      };
    },
  },

  prodSpat: {
    titel: "Spatprodukt: Volumen von Spat und Pyramide",
    gen(r, variante) {
      if (variante === "pyramide") {
        // Pyramide O, A(a|0|0), B(0|b|0), S(s1|s2|h): V = a·b·h/6
        const a = ganz(r, 2, 6), b = ganz(r, 2, 6), h = ganz(r, 2, 8);
        const S = vek(ganz(r, 0, 3), ganz(r, 0, 3), h);
        const OA = vek(a, 0, 0), OB = vek(0, b, 0);
        const kr = vCross(OA, OB), spat = vDot(kr, S);
        const V = qDiv(spat, q(6)), G = q(a * b, 2);
        return {
          text: `Eine Pyramide hat die Ecken $O(0 \\mid 0 \\mid 0)$, $A(${a} \\mid 0 \\mid 0)$, $B(0 \\mid ${b} \\mid 0)$ und die Spitze $${pT(S, "S")}$. Berechne ihr Volumen mit dem Spatprodukt und kontrolliere mit $V = \\frac{1}{3} \\cdot G \\cdot h$.`,
          schritte: [
            vektorS("kr", "Kreuzprodukt", "Berechne $\\vec{OA} \\times \\vec{OB}$.", "$\\vec{OA} \\times \\vec{OB} =$", kr),
            zahlS("sp", "Spatprodukt", "Berechne $(\\vec{OA} \\times \\vec{OB}) \\cdot \\vec{OS}$.", "$(\\vec{OA} \\times \\vec{OB}) \\cdot \\vec{OS} =$", spat),
            zahlS("V", "Volumen", "Die dreiseitige Pyramide ist ein Sechstel des Spats: $V = \\frac{1}{6} \\cdot |\\text{Spatprodukt}|$.", "$V =$", V, { fehler: [{ wert: qNum(spat) / 3, text: "Ein Drittel gilt für $G \\cdot h$ – das Spatprodukt ist aber das Spatvolumen, davon ist die Pyramide ein Sechstel." }, { wert: qNum(spat), text: "Das ist das Volumen des ganzen Spats." }] }),
            zahlS("G", "Grundfläche", "Kontrolle: Grundfläche des rechtwinkligen Dreiecks $OAB$.", "$G =$", G),
            zahlS("h", "Höhe", "Höhe der Pyramide über der $x_1x_2$-Ebene.", "$h =$", q(h)),
          ],
          weg: [
            `$\\vec{OA} \\times \\vec{OB} = ${kreuzWegT(OA, OB)}$, $(\\vec{OA} \\times \\vec{OB}) \\cdot \\vec{OS} = ${skalarWegT(kr, S)}$`,
            `$V = \\frac{1}{6} \\cdot ${zT(spat)} = ${zT(V)}$`,
            `Kontrolle: $G = \\frac{1}{2} \\cdot ${a} \\cdot ${b} = ${zT(G)}$, $h = ${h}$ (die $x_3$-Koordinate von $S$), $V = \\frac{1}{3} \\cdot ${zT(G)} \\cdot ${h} = ${zT(V)}$ – stimmt.`,
          ],
        };
      }
      let a, b, c, kr, spat;
      do { a = zufVek(r, -2, 3); b = zufVek(r, -2, 3); c = zufVek(r, -1, 3); kr = vCross(a, b); spat = vDot(kr, c); } while (qNull(spat) || kollinearFaktor(a, b) !== null || Math.abs(spat.z) > 40);
      const VS = q(Math.abs(spat.z)), VP = qDiv(VS, q(6));
      return {
        text: `Ein Spat wird von $\\vec{a} = ${vT(a)}$, $\\vec{b} = ${vT(b)}$ und $\\vec{c} = ${vT(c)}$ aufgespannt. Berechne sein Volumen und das Volumen der Pyramide mit denselben drei Kanten.`,
        schritte: [
          vektorS("kr", "Kreuzprodukt", "Berechne $\\vec{a} \\times \\vec{b}$.", "$\\vec{a} \\times \\vec{b} =$", kr),
          zahlS("sp", "Spatprodukt", "Berechne $(\\vec{a} \\times \\vec{b}) \\cdot \\vec{c}$.", "$(\\vec{a} \\times \\vec{b}) \\cdot \\vec{c} =$", spat),
          zahlS("VS", "Spatvolumen", "Das Volumen ist der Betrag des Spatprodukts.", "$V_{\\text{Spat}} =$", VS, { fehler: spat.z < 0 ? [{ wert: qNum(spat), text: "Ein Volumen ist nie negativ – nimm den Betrag." }] : [] }),
          zahlS("VP", "Pyramide", "Die Pyramide mit denselben Kanten hat ein Sechstel des Spatvolumens.", "$V_{\\text{Pyramide}} =$", VP, { fehler: [{ wert: qNum(VS) / 3, text: "Ein Sechstel, nicht ein Drittel: $\\frac{1}{3} \\cdot G \\cdot h$ mit $G = \\frac{1}{2}$ Parallelogramm." }] }),
        ],
        weg: [
          `$\\vec{a} \\times \\vec{b} = ${kreuzWegT(a, b)}$`,
          `$(\\vec{a} \\times \\vec{b}) \\cdot \\vec{c} = ${skalarWegT(kr, c)}$`,
          `Spat: $V = |${zT(spat)}| = ${zT(VS)}$; Pyramide: $V = \\frac{1}{6} \\cdot ${zT(VS)} = ${zT(VP)}$`,
        ],
      };
    },
  },

  prodZeltdach: {
    titel: "Dachfläche einer Pyramide",
    gen(r) {
      const a = ganz(r, 1, 3), h = ganz(r, 2, 5);
      const S = vek(0, 0, h), A = vek(a, -a, 0), B = vek(a, a, 0);
      const AB = nach(A, B), AS = nach(A, S);
      const kr = vCross(AB, AS), F2 = qNum(vBetrag2(kr));
      const F = Math.sqrt(F2) / 2, ges = 4 * F;
      return {
        text: `Ein Zeltdach ist eine Pyramide mit der Spitze $${pT(S, "S")}$ über dem Quadrat mit den Ecken $${pT(A, "A")}$, $${pT(B, "B")}$, $C(${MINUS}${a} \\mid ${a} \\mid 0)$, $D(${MINUS}${a} \\mid ${MINUS}${a} \\mid 0)$ (in m). Berechne die Fläche des Dachdreiecks $ABS$ und die gesamte Dachfläche (auf $0{,}1\\,\\text{m}^2$).`,
        schritte: [
          vektorS("ab", "Kante AB", "Berechne $\\vec{AB}$.", "$\\vec{AB} =$", AB),
          vektorS("as", "Kante AS", "Berechne $\\vec{AS}$.", "$\\vec{AS} =$", AS),
          vektorS("kr", "Kreuzprodukt", "Berechne $\\vec{AB} \\times \\vec{AS}$.", "$\\vec{AB} \\times \\vec{AS} =$", kr),
          zahlR("F", "Dreieck ABS", "$F = \\frac{1}{2} \\cdot |\\vec{AB} \\times \\vec{AS}|$ (eine Nachkommastelle).", "$F =$", Math.round(F * 10) / 10, { tol: 0.06, einheit: "m²", wertText: `$\\frac{1}{2} \\cdot ${wurzelT(F2)} \\approx ${dezT(Math.round(F * 10) / 10)}$` }),
          zahlR("ges", "Ganze Dachfläche", "Vier gleich große Dachdreiecke.", "$F_{\\text{ges}} =$", Math.round(ges * 10) / 10, { tol: 0.06, einheit: "m²", wertText: `$${dezT(Math.round(ges * 10) / 10)}$` }),
        ],
        weg: [
          `$\\vec{AB} = ${vT(B)} ${MINUS} ${vT(A)} = ${vT(AB)}$, $\\vec{AS} = ${vT(S)} ${MINUS} ${vT(A)} = ${vT(AS)}$`,
          `$\\vec{AB} \\times \\vec{AS} = ${kreuzWegT(AB, AS)}$, Betrag $${betragWegT(kr)}$`,
          `Dreieck $ABS$: $F = \\frac{1}{2} \\cdot ${wurzelT(F2)} \\approx ${dezT(Math.round(F * 10) / 10)}\\,\\text{m}^2$`,
          `Vier gleiche Dachflächen: $4 \\cdot \\frac{1}{2} \\cdot ${wurzelT(F2)} = ${wurzelT(4 * F2)} \\approx ${dezT(Math.round(ges * 10) / 10)}\\,\\text{m}^2$`,
        ],
      };
    },
  },

  prodKomplanar: {
    titel: "Liegt der Punkt in der Ebene? (Normalenvektor)",
    gen(r) {
      let A, B, C, n, D1, D2;
      do {
        A = zufPunkt(r, -1, 3); B = zufPunkt(r, -1, 3); C = zufPunkt(r, -1, 3);
        const AB = nach(A, B), AC = nach(A, C);
        if (vNull(AB) || vNull(AC) || kollinearFaktor(AB, AC) !== null) { n = null; continue; }
        n = vCross(AB, AC);
        // D1 in der Ebene: A + AB + AC bzw. A + 2AB − AC; D2 daneben
        D1 = vAdd(A, vAdd(vSkal(eins(r, [q(1), q(2), q(-1)]), AB), vSkal(eins(r, [q(1), q(-1), q(2)]), AC)));
        D2 = vAdd(D1, zufVek(r, -1, 1));
      } while (!n || n.some((x) => Math.abs(x.z) > 9) || D1.some((x) => Math.abs(x.z) > 7) || qNull(vDot(n, nach(A, D2))) || D2.some((x) => Math.abs(x.z) > 7));
      const [erst, zweit] = r() < 0.5 ? [D1, D2] : [D2, D1];
      const s1 = vDot(n, nach(A, erst)), s2 = vDot(n, nach(A, zweit));
      return {
        text: `Liegt der Punkt $D$ in einer Ebene mit $${pT(A, "A")}$, $${pT(B, "B")}$ und $${pT(C, "C")}$? Prüfe mit $\\vec{n} = \\vec{AB} \\times \\vec{AC}$ und $\\vec{n} \\cdot \\vec{AD}$. a) $${pT(erst, "D")}$ b) $${pT(zweit, "D")}$`,
        schritte: [
          vektorS("n", "Normalenvektor", "Berechne $\\vec{n} = \\vec{AB} \\times \\vec{AC}$.", "$\\vec{n} =$", n, { hinweis: `$\\vec{AB} = ${vT(nach(A, B))}$, $\\vec{AC} = ${vT(nach(A, C))}$` }),
          zahlS("s1", "Fall a)", `Berechne $\\vec{n} \\cdot \\vec{AD}$ für $${pT(erst, "D")}$.`, "$\\vec{n} \\cdot \\vec{AD} =$", s1),
          wahlS("a", "Fall a)", "Liegt dieser Punkt $D$ in der Ebene?", JA_NEIN, qNull(s1) ? "ja" : "nein", { hinweis: "In der Ebene genau dann, wenn $\\vec{AD}$ senkrecht zu $\\vec{n}$ ist, also $\\vec{n} \\cdot \\vec{AD} = 0$." }),
          zahlS("s2", "Fall b)", `Berechne $\\vec{n} \\cdot \\vec{AD}$ für $${pT(zweit, "D")}$.`, "$\\vec{n} \\cdot \\vec{AD} =$", s2),
          wahlS("b", "Fall b)", "Liegt dieser Punkt $D$ in der Ebene?", JA_NEIN, qNull(s2) ? "ja" : "nein"),
        ],
        weg: [
          `$\\vec{n} = \\vec{AB} \\times \\vec{AC} = ${kreuzWegT(nach(A, B), nach(A, C))}$`,
          `a) $\\vec{AD} = ${vT(nach(A, erst))}$, $\\vec{n} \\cdot \\vec{AD} = ${skalarWegT(n, nach(A, erst))}$ – ${qNull(s1) ? "$D$ liegt in der Ebene." : "$D$ liegt nicht in der Ebene."}`,
          `b) $\\vec{AD} = ${vT(nach(A, zweit))}$, $\\vec{n} \\cdot \\vec{AD} = ${skalarWegT(n, nach(A, zweit))}$ – ${qNull(s2) ? "$D$ liegt in der Ebene." : "$D$ liegt nicht in der Ebene."}`,
        ],
      };
    },
  },

  prodNormalLaenge: {
    titel: "Orthogonale Vektoren mit vorgegebener Länge",
    gen(r) {
      let a, b, n, L, betrag;
      do {
        a = zufVek(r, -2, 2); b = zufVek(r, -2, 2);
        if (kollinearFaktor(a, b) === null) { n = vKuerzen(vCross(a, b)); betrag = betragNum(n); }
      } while (kollinearFaktor(a, b) !== null || !Number.isInteger(betrag) || betrag > 9);
      const k = ganz(r, 2, 4);
      L = k * betrag;
      const w1 = vSkal(k, n), w2 = vNeg(w1);
      return {
        text: `Bestimme alle Vektoren der Länge $${L}$, die zu $${vT(a)}$ und zu $${vT(b)}$ orthogonal sind. Warum gibt es genau zwei?`,
        schritte: [
          vektorS("n", "Normalenvektor", "Berechne $\\vec{n} = \\vec{a} \\times \\vec{b}$ (ggf. gekürzt).", "$\\vec{n} =$", n, { hinweis: "Das Kreuzprodukt steht senkrecht auf beiden Vektoren. Ein Vielfaches davon ist auch erlaubt." }),
          zahlS("b", "Betrag", "Berechne $|\\vec{n}|$.", "$|\\vec{n}| =$", q(betrag)),
          zahlS("k", "Streckfaktor", `Mit welchem Faktor $k$ wird $\\vec{n}$ zur Länge $${L}$ gestreckt?`, "$k =$", q(k)),
          vektorS("w1", "Erster Vektor", "Gib $k \\cdot \\vec{n}$ an.", "$\\vec{w}_1 =$", w1),
          vektorS("w2", "Zweiter Vektor", "Und der entgegengesetzte Vektor.", "$\\vec{w}_2 =$", w2),
          wahlS("warum", "Warum genau zwei?", "Warum gibt es genau zwei solche Vektoren?", mische(r, [["gerade", "Alle zu $\\vec{a}$ und $\\vec{b}$ orthogonalen Vektoren sind Vielfache von $\\vec{n}$; auf dieser Geraden gibt es genau zwei Vektoren der Länge $" + L + "$ (in beide Richtungen)."], ["ebene", "Weil die orthogonalen Vektoren eine Ebene bilden."], ["betrag", "Weil der Betrag immer positiv ist."]]), "gerade"),
        ],
        weg: [
          `$\\vec{a} \\times \\vec{b} = ${kreuzWegT(a, b)}$${vGleich(vCross(a, b), n) ? "" : `, gekürzt $\\vec{n} = ${vT(n)}$`}, $|\\vec{n}| = ${betragWegT(n)}$`,
          `Länge $${L}$: $k = \\frac{${L}}{${betrag}} = ${k}$. Gesucht sind $\\pm ${k} \\cdot \\vec{n}$: $${vT(w1)}$ und $${vT(w2)}$.`,
          `Alle Vektoren, die zu $\\vec{a}$ und $\\vec{b}$ orthogonal sind, sind Vielfache von $\\vec{n}$ – auf dieser Geraden gibt es genau zwei Vektoren der Länge $${L}$.`,
        ],
      };
    },
  },
});

/* ---------- Buchseite-Nr → Typ ---------- */
export const BUCH_2 = {
  // 8 Geraden in Parameterform (S. 23)
  "23-1": "gerPunkte", "23-2": "gerDurchZwei", "23-3": "gerUmparametrisieren", "23-4": "gerAchse", "23-5": "gerTeilpunkt", "23-6": "gerBallon", "23-7": "gerSpurpunkte",
  // 9 Lage zweier Geraden (S. 25)
  "25-1": "gerLage", "25-2": "gerLage", "25-3": "gerLage:windschief", "25-4": "gerFlug", "25-6": "gerParameterA",
  // Training III (S. 26)
  "26-T1": "gerParam2d", "26-T2": "gerDurchZwei:probe", "26-T3": "gerPunktprobe", "26-T4": "gerTeilpunkt:dreiPunkte", "26-T5": "gerLage", "26-T6": "gerLage:punkte", "26-T7": "gerParameterA", "26-T8": "gerFlug:schatten",
  // 10 Skalarprodukt (S. 29)
  "29-1": "prodSkalar", "29-2": "prodOrthoPaare", "29-3": "prodOrthoParam", "29-4": "prodOrthoFinden", "29-5": "prodRechterWinkel", "29-6": "prodWuerfelDiagonalen", "29-7": "prodSenkrechte2d",
  // 11 Winkel (S. 31)
  "31-1": "prodWinkel", "31-2": "prodSkalar:art", "31-3": "prodDreieckWinkel", "31-4": "prodWuerfelWinkel", "31-5": "prodDachWinkel", "31-6": "prodWinkelFehler", "31-7": "prodWinkelParam",
  // 12 Kreuzprodukt (S. 33)
  "33-1": "prodKreuz", "33-2": "prodDreieckFlaeche", "33-3": "prodParallelogramm", "33-4": "prodSpat", "33-5": "prodZeltdach", "33-6": "prodKomplanar",
  // Training IV (S. 34)
  "34-T1": "prodSkalar:art", "34-T2": "prodOrthoParam:zwei", "34-T3": "prodWinkel:schoen", "34-T4": "prodDreieckWinkel:rechtwinklig", "34-T5": "prodKreuz", "34-T6": "prodDreieckFlaeche", "34-T7": "prodSpat:pyramide", "34-T8": "prodNormalLaenge",
};
