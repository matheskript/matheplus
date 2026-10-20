/* ======================================================================
   vekAufgaben3.js – Aufgabentypen zu Kapitel V des Kurses „Vektoren,
   Geraden und Ebenen“: Ebenen in Parameterform, Punktprobe, Normalen-
   und Koordinatenform, Umwandlungen, Spurpunkte, Lage Gerade–Ebene,
   Lage Ebene–Ebene (Schnittgerade), drei Ebenen (LGS 3×3), Training V.
   Buchseiten 37, 39, 41, 43, 45, 46. Typ-Präfix „eb“.
   Jeder Typ: gen(r, variante) → { text, schritte, weg }
   r = Zufallsquelle (vekKern.zufall). Reine Logik, kein React.
   ====================================================================== */
import {
  q, qAdd, qSub, qMul, qDiv, qNeg, qNum, qGleich, qNull, ggT, ganz, eins, vz, mische, MINUS, Q, zT, dezT,
  zahlS, wahlS, $, vek, zufVek, vAdd, vSub, vSkal, vNeg, vDot, vCross, vNull, vGleich, nach, mittelpunkt,
  kollinearFaktor, vKuerzen, vT, pT, kz, malT, summeT, geradeT, ebeneParamT, ebeneNormalT, koordT, lgsZeilen, ROEM,
  skalarWegT, kreuzWegT, gauss, vektorS, punktS, zweiRichtungen, ebeneAusRichtungen,
} from "./vekKern.js";

/* ---------- lokale Hilfen ---------- */
const kgV = (a, b) => Math.abs(a * b) / ggT(Math.abs(a), Math.abs(b));
const X = ["x_1", "x_2", "x_3"];
/* kleiner ganzzahliger Punkt */
const zufPunkt = (r, lo = -4, hi = 5) => vek(ganz(r, lo, hi), ganz(r, lo, hi), ganz(r, lo, hi));
/* „a + b·t“ bzw. „a − t“ (Konstante zuerst, ohne + −, ohne 0) */
function affT(a, b, v = "t") {
  const A = Q(a), B = Q(b);
  if (B.z === 0) return zT(A);
  const bt = summeT([[B, v]]);
  if (A.z === 0) return bt;
  const abs = summeT([[q(Math.abs(B.z), B.n), v]]);
  return `${zT(A)} ${B.z < 0 ? MINUS : "+"} ${abs}`;
}
/* Zahl in Klammern nur, wenn negativ (Brüche ohne Klammern) */
const kzn = (a) => (Q(a).z < 0 ? `(${zT(a)})` : zT(a));
/* Konstante plus Summe: „4 − x_1 − 2x_2“ (Konstante zuerst, ohne + −, ohne 0) */
function affSumT(c, teile) {
  const C = Q(c);
  const rest = teile.filter(([k]) => !qNull(Q(k)));
  if (C.z === 0) return summeT(rest);
  let out = zT(C);
  for (const [k, tex] of rest) {
    const K = Q(k);
    out += ` ${K.z < 0 ? MINUS : "+"} ${summeT([[q(Math.abs(K.z), K.n), tex]])}`;
  }
  return out;
}
/* Skalarprodukt n · x als Zahl eingesetzt: „2 · 1 + (−1) · 3 + 4 · 0 = 3“ */
const einsetzT = (n, p) => skalarWegT(n, p);
/* Koordinatenform ohne Namen */
const kf = (n, d) => koordT(n, d, { name: "" });
/* Gleichung „n·x = d“ mit Parameter-Gerade eingesetzt: Linearform in t, Glieder in Klammern */
function geradeInEbeneT(n, p, u, v = "t") {
  const teile = n.map((k, i) => {
    const inner = affT(p[i], u[i], v);
    if (inner === "0") return [0, "0"];
    const tex = inner.includes(" ") || inner.startsWith(MINUS) ? `(${inner})` : inner;
    return [k, tex];
  });
  return summeT(teile);
}
/* Faktor mal Variable im ausgeschriebenen Skalarprodukt: 1 · a → a, (−1) · a → (−1) · a bleibt (Buchstil), sonst kz(k) · a */
const malVarT = (k, v) => (Q(k).z === Q(k).n ? v : `${kz(k)} \\cdot ${v}`);
/* Vielfaches einer Koordinatengleichung: „2 · I“ bzw. „I“, „−I“ */
const malRoemT = (k, i) => (Q(k).z === Q(k).n ? `\\text{${ROEM[i]}}` : Q(k).z === -Q(k).n ? `${MINUS}\\text{${ROEM[i]}}` : `${zT(k)} \\cdot \\text{${ROEM[i]}}`);
/* Teilmengen-Auswahl: Welche der Objekte A, B, C …? */
function teilmengeWahl(r, id, titel, frage, namen, drin) {
  const alle = [];
  const n = namen.length;
  for (let m = 0; m < 1 << n; m++) {
    const liste = namen.filter((_, i) => m & (1 << i));
    const idm = liste.join("") || "keiner";
    const text = liste.length === 0 ? "keiner" : liste.length === n ? (n === 2 ? "beide" : "alle") : liste.length === 1 ? `nur $${liste[0]}$` : liste.map((x) => `$${x}$`).join(" und ");
    alle.push([idm, text, liste]);
  }
  const richtig = alle.find((o) => o[2].length === drin.length && drin.every((x) => o[2].includes(x)));
  const andere = mische(r, alle.filter((o) => o !== richtig)).slice(0, 3);
  const optionen = mische(r, [richtig, ...andere]).map(([i, t]) => [i, t]);
  return wahlS(id, titel, frage, optionen, richtig[0]);
}
/* Zufällige Ebene in Koordinatenform mit kleinem Normalenvektor und ganzem d */
function zufEbene(r, { lo = -3, hi = 3, keineNull = false, dMax = 12 } = {}) {
  for (let i = 0; i < 300; i++) {
    const n = zufVek(r, lo, hi, { keineNull });
    const g = n.reduce((m, x) => ggT(m, Math.abs(x.z)), 0);
    if (g !== 1 && !(g === 0)) continue;
    const P = zufPunkt(r, -3, 4);
    const d = vDot(n, P);
    if (Math.abs(d.z) <= dMax) return { n, d, P };
  }
  return { n: vek(1, 1, 1), d: q(3), P: vek(1, 1, 1) };
}
/* Schnittgerade zweier Ebenen, freie Koordinate x_k = t: liefert { P, u } mit x = P + t·u, u_k = 1 */
function schnittgerade(n1, d1, n2, d2, k) {
  const [i, j] = [0, 1, 2].filter((x) => x !== k);
  const det = qSub(qMul(n1[i], n2[j]), qMul(n1[j], n2[i]));
  if (qNull(det)) return null;
  // Konstante
  const Ai = qDiv(qSub(qMul(d1, n2[j]), qMul(d2, n1[j])), det);
  const Aj = qDiv(qSub(qMul(n1[i], d2), qMul(n2[i], d1)), det);
  // Koeffizient von t: rechte Seiten −n1_k, −n2_k
  const Bi = qDiv(qSub(qMul(qNeg(n1[k]), n2[j]), qMul(qNeg(n2[k]), n1[j])), det);
  const Bj = qDiv(qSub(qMul(n1[i], qNeg(n2[k])), qMul(n2[i], qNeg(n1[k]))), det);
  const P = [q(0), q(0), q(0)], u = [q(0), q(0), q(0)];
  P[i] = Ai; P[j] = Aj; u[i] = Bi; u[j] = Bj; u[k] = q(1);
  return { P, u, i, j };
}
/* Gerade P + t·u und Ebene n·x = d schneiden: { art, t?, D? } */
function geradeEbene(P, u, n, d) {
  const nu = vDot(n, u), np = vDot(n, P);
  if (qNull(nu)) return { art: qGleich(np, d) ? "liegt" : "parallel", nu, np };
  const t = qDiv(qSub(d, np), nu);
  return { art: "schneidet", nu, np, t, D: vAdd(P, vSkal(t, u)) };
}
const LAGE_GE = [["schneidet", "$g$ schneidet $E$ in einem Punkt"], ["parallel", "$g$ ist echt parallel zu $E$"], ["liegt", "$g$ liegt in $E$"]];
const LAGE_EE = [["schneiden", "sie schneiden sich in einer Geraden"], ["parallel", "sie sind echt parallel"], ["identisch", "sie sind identisch"]];
const JA_NEIN = (ja, nein) => [["ja", ja], ["nein", nein]];
const liegtT = (name, drin) => `$${name}$ liegt ${drin ? "" : "nicht "}in $E$`;

/* ===================== Seite 37: Ebenen in Parameterform ===================== */
/* drei Punkte, die eine Ebene festlegen (nicht kollinear), mit kleinem Normalenvektor */
function dreiPunkte(r, { ursprung = false } = {}) {
  for (let i = 0; i < 200; i++) {
    const A = ursprung ? vek(0, 0, 0) : zufPunkt(r, -3, 4);
    const u = zufVek(r, -3, 3), v = zufVek(r, -3, 3);
    if (kollinearFaktor(u, v) !== null) continue;
    const n = vKuerzen(vCross(u, v));
    if (!n.every((x) => Math.abs(x.z) <= 9)) continue;
    const B = vAdd(A, u), C = vAdd(A, v);
    if ([B, C].some((P) => P.some((x) => Math.abs(x.z) > 6))) continue;
    return { A, B, C, u, v, n };
  }
  return { A: vek(1, 0, 1), B: vek(3, 0, 2), C: vek(0, 2, 3), u: vek(2, 0, 1), v: vek(-1, 2, 2), n: vKuerzen(vCross(vek(2, 0, 1), vek(-1, 2, 2))) };
}
/* Punktprobe in Parameterform: r, s aus zwei Gleichungen, dritte prüfen */
function punktprobeParam(r, A, u, v) {
  for (let i = 0; i < 200; i++) {
    const rr = ganz(r, -3, 3), ss = ganz(r, -3, 3);
    const drin = r() < 0.5;
    const abw = drin ? 0 : ganz(r, -3, 3, [0]);
    // Gleichungen I, II müssen r, s eindeutig liefern
    const det = qSub(qMul(u[0], v[1]), qMul(u[1], v[0]));
    if (qNull(det)) return null;
    const P = vAdd(A, vAdd(vSkal(rr, u), vSkal(ss, v)));
    P[2] = qAdd(P[2], q(abw));
    if (P.some((x) => Math.abs(x.z) > 9)) continue;
    const links3 = qAdd(A[2], qAdd(qMul(q(rr), u[2]), qMul(q(ss), v[2])));
    return { P, rr: q(rr), ss: q(ss), drin, links3 };
  }
  return null;
}
function punktprobeSchritte(P, A, u, v, pp, name = "P") {
  const lgs = [0, 1].map((i) => `$\\text{${ROEM[i]}}\\quad ${summeT([[u[i], "r"], [v[i], "s"]])} = ${zT(qSub(P[i], A[i]))}$`).join(", ");
  return {
    schritte: [
      zahlS("r", "Parameter r", `Setze ${$(pT(P, name))} gleich und löse die Gleichungen I und II nach $r$ und $s$ auf.`, "$r =$", pp.rr, { hinweis: `${lgs}` }),
      zahlS("s", "Parameter s", "Und der zweite Parameter?", "$s =$", pp.ss),
      zahlS("d", "Dritte Gleichung", "Setze $r$ und $s$ in die dritte Gleichung ein: Welcher Wert ergibt sich für $x_3$?", "$x_3 =$", pp.links3, { fehler: pp.drin ? [] : [{ wert: qNum(P[2]), text: "Das ist der Wert, der herauskommen müsste. Rechne die linke Seite mit deinen Werten für $r$ und $s$ aus." }] }),
      wahlS("lage", "Ergebnis", `Liegt ${$(name)} in $E$?`, JA_NEIN(`ja, ${$(name)} liegt in $E$`, `nein, ${$(name)} liegt nicht in $E$`), pp.drin ? "ja" : "nein"),
    ],
    weg: [
      `Gleichsetzen: ${$(`${vT(P)} = ${vT(A)} + r \\cdot ${vT(u)} + s \\cdot ${vT(v)}`)}, also ${lgs} und $\\text{III}\\quad ${summeT([[u[2], "r"], [v[2], "s"]])} = ${zT(qSub(P[2], A[2]))}$`,
      `Aus I und II: ${$(`r = ${zT(pp.rr)}`)}, ${$(`s = ${zT(pp.ss)}`)}`,
      `Probe in III: ${$(`${zT(A[2])} + ${kz(pp.rr)} \\cdot ${kz(u[2])} + ${kz(pp.ss)} \\cdot ${kz(v[2])} = ${zT(pp.links3)}`)} ${pp.drin ? `$= ${zT(P[2])}$ ✓` : `$\\ne ${zT(P[2])}$ ✗`}`,
      `${$(name)} liegt ${pp.drin ? "" : "nicht "}in $E$.`,
    ],
  };
}

export const TYPEN_3 = {
  ebParamDreiPunkte: {
    titel: "Ebene durch drei Punkte (Parameterform)",
    gen(r, variante) {
      const ursprung = variante === "ursprung";
      const { A, B, C, u, v } = dreiPunkte(r, { ursprung });
      const nameA = ursprung ? "O" : "A";
      return {
        text: `Stelle eine Gleichung der Ebene durch ${$(pT(A, nameA))}, ${$(pT(B, "B"))} und ${$(pT(C, "C"))} in Parameterform auf.`,
        schritte: [
          vektorS("u", "Erster Spannvektor", `Berechne $\\vec{${nameA}B}$.`, `$\\vec{${nameA}B} =$`, u, { hinweis: "Spitze minus Fuß: $\\vec{b} - \\vec{a}$." }),
          vektorS("v", "Zweiter Spannvektor", `Berechne $\\vec{${nameA}C}$.`, `$\\vec{${nameA}C} =$`, v),
          wahlS("koll", "Kontrolle", "Sind die beiden Spannvektoren kollinear?", JA_NEIN("ja – dann gäbe es keine eindeutige Ebene", "nein – sie spannen eine Ebene auf"), "nein"),
        ],
        weg: [
          `${$(`\\vec{${nameA}B} = ${vT(B)} ${MINUS} ${vT(A)} = ${vT(u)}`)}, ${$(`\\vec{${nameA}C} = ${vT(C)} ${MINUS} ${vT(A)} = ${vT(v)}`)}`,
          `Die Spannvektoren sind nicht kollinear (kein gemeinsamer Faktor), die drei Punkte legen also eine Ebene fest.`,
          `${$(ursprung ? `E: \\vec{x} = r \\cdot ${vT(u)} + s \\cdot ${vT(v)}` : ebeneParamT(A, u, v))}`,
        ],
      };
    },
  },

  ebPunktprobeParam: {
    titel: "Punktprobe in der Parameterform",
    gen(r) {
      let A, u, v, pp;
      do { ({ A, u, v } = dreiPunkte(r)); pp = punktprobeParam(r, A, u, v); } while (!pp);
      const s = punktprobeSchritte(pp.P, A, u, v, pp);
      return {
        text: `Prüfe, ob der Punkt ${$(pT(pp.P))} in der Ebene ${$(ebeneParamT(A, u, v))} liegt.`,
        ...s,
      };
    },
  },

  ebDreiPunkteFest: {
    titel: "Legen drei Punkte eine Ebene fest?",
    gen(r) {
      const A = zufPunkt(r, -3, 4);
      const u = zufVek(r, -3, 3);
      const koll = r() < 0.5;
      let v;
      if (koll) { const k = eins(r, [-2, 2, 3, -1]); v = vSkal(k, u); } else do { v = zufVek(r, -3, 3); } while (kollinearFaktor(u, v) !== null);
      const B = vAdd(A, u), C = vAdd(A, v);
      const k = kollinearFaktor(u, v);
      return {
        text: `Legen die Punkte ${$(pT(A, "A"))}, ${$(pT(B, "B"))} und ${$(pT(C, "C"))} genau eine Ebene fest?`,
        schritte: [
          vektorS("u", "Vektor AB", "Berechne $\\vec{AB}$.", "$\\vec{AB} =$", u),
          vektorS("v", "Vektor AC", "Berechne $\\vec{AC}$.", "$\\vec{AC} =$", v),
          wahlS("koll", "Kollinear?", "Ist $\\vec{AC}$ ein Vielfaches von $\\vec{AB}$?", JA_NEIN("ja, die Vektoren sind kollinear", "nein, die Vektoren sind nicht kollinear"), koll ? "ja" : "nein", { hinweis: "Teile die Komponenten paarweise: Kommt überall derselbe Faktor heraus?" }),
          wahlS("erg", "Ergebnis", "Was folgt daraus?", [["eine", "Die drei Punkte legen genau eine Ebene fest."], ["keine", "Die drei Punkte liegen auf einer Geraden: keine eindeutige Ebene."]], koll ? "keine" : "eine"),
        ],
        weg: [
          `${$(`\\vec{AB} = ${vT(u)}`)}, ${$(`\\vec{AC} = ${vT(v)}`)}`,
          koll ? `${$(`\\vec{AC} = ${malT(k, `\\vec{AB}`)}`)}: Die Vektoren sind kollinear, die Punkte liegen auf einer Geraden. Sie legen keine eindeutige Ebene fest.` : `Es gibt keinen Faktor $k$ mit $\\vec{AC} = k \\cdot \\vec{AB}$: nicht kollinear. Die drei Punkte legen genau eine Ebene fest.`,
        ],
      };
    },
  },

  ebPunktGerade: {
    titel: "Ebene durch Punkt und Gerade",
    gen(r) {
      let A, u, P, w, t1, t2;
      do {
        A = zufPunkt(r, -3, 4); u = zufVek(r, -3, 3, { keineNull: true });
        w = zufVek(r, -3, 3);
        P = vAdd(A, w);
      } while (kollinearFaktor(u, w) !== null || P.some((x) => Math.abs(x.z) > 6));
      // zwei Komponenten, die verschiedene t liefern
      t1 = qDiv(qSub(P[0], A[0]), u[0]); t2 = qDiv(qSub(P[1], A[1]), u[1]);
      if (qGleich(t1, t2)) { t2 = qDiv(qSub(P[2], A[2]), u[2]); }
      const zeile2 = qGleich(qDiv(qSub(P[1], A[1]), u[1]), t1) ? 2 : 1;
      return {
        text: `Stelle eine Ebene auf, die den Punkt ${$(pT(P, "P"))} und die Gerade ${$(geradeT(A, u))} enthält. Prüfe zuerst, dass $P$ nicht auf $g$ liegt.`,
        schritte: [
          zahlS("t1", "Punktprobe, erste Zeile", `Setze $P$ in $g$ ein: Welches $t$ liefert die erste Koordinate?`, "$t =$", t1),
          zahlS("t2", `Punktprobe, ${zeile2 === 1 ? "zweite" : "dritte"} Zeile`, `Welches $t$ liefert die ${zeile2 === 1 ? "zweite" : "dritte"} Koordinate?`, "$t =$", t2),
          wahlS("aufG", "Liegt P auf g?", "Was folgt aus den beiden Werten?", JA_NEIN("ja, $P$ liegt auf $g$", "nein, die Werte widersprechen sich: $P$ liegt nicht auf $g$"), "nein"),
          vektorS("v", "Zweiter Spannvektor", "Nimm den Stützpunkt $A$ von $g$ und berechne $\\vec{AP}$.", "$\\vec{AP} =$", w),
        ],
        weg: [
          `$P$ in $g$: ${$(`${affT(A[0], u[0])} = ${zT(P[0])}`)} liefert ${$(`t = ${zT(t1)}`)}, aber ${$(`${affT(A[zeile2], u[zeile2])} = ${zT(P[zeile2])}`)} liefert ${$(`t = ${zT(t2)}`)}: Widerspruch, $P$ liegt nicht auf $g$.`,
          `Zweiter Spannvektor: ${$(`\\vec{AP} = ${vT(P)} ${MINUS} ${vT(A)} = ${vT(w)}`)}`,
          `${$(ebeneParamT(A, u, w))}`,
        ],
      };
    },
  },

  ebZweiGeradenSchnitt: {
    titel: "Ebene durch zwei sich schneidende Geraden",
    gen(r) {
      let A, u, B, v, S, t, k;
      do {
        [u, v] = zweiRichtungen(r, -3, 3);
        S = zufPunkt(r, -3, 4);
        t = ganz(r, -3, 3, [0]); k = ganz(r, -3, 3, [0]);
        A = vSub(S, vSkal(t, u)); B = vSub(S, vSkal(k, v));
      } while ([A, B].some((P) => P.some((x) => Math.abs(x.z) > 7)));
      return {
        text: `Zeige, dass sich ${$(geradeT(A, u))} und ${$(geradeT(B, v, { name: "h", param: "k" }))} schneiden, und gib die Ebene an, die beide Geraden enthält.`,
        schritte: [
          zahlS("t", "Parameter t", "Setze $g$ und $h$ gleich und löse das Gleichungssystem.", "$t =$", t, { hinweis: lgsZeilen([0, 1, 2].map((i) => [u[i], qNeg(v[i])]), [0, 1, 2].map((i) => qSub(B[i], A[i])), ["t", "k"]).join(", ") }),
          zahlS("k", "Parameter k", "Und $k$?", "$k =$", k),
          punktS("S", "Schnittpunkt", "Setze $t$ in $g$ ein.", "$S =$", S),
          vektorS("n", "Kontrolle", "Berechne $\\vec{u} \\times \\vec{v}$ – ist er nicht der Nullvektor, sind die Richtungen nicht kollinear.", "$\\vec{u} \\times \\vec{v} =$", vCross(u, v)),
        ],
        weg: [
          `Gleichsetzen ${$(`${vT(A)} + t \\cdot ${vT(u)} = ${vT(B)} + k \\cdot ${vT(v)}`)} ergibt ${$(`t = ${zT(t)}`)}, ${$(`k = ${zT(k)}`)} (alle drei Gleichungen erfüllt).`,
          `Schnittpunkt: ${$(`\\vec{s} = ${vT(A)} ${t < 0 ? MINUS : "+"} ${malT(Math.abs(t), vT(u))} = ${vT(S)}`)}, also ${$(pT(S, "S"))}`,
          `Die Richtungsvektoren sind nicht kollinear, also spannen sie die Ebene auf: ${$(ebeneParamT(A, u, v))}`,
        ],
      };
    },
  },

  ebZweiGeradenParallel: {
    titel: "Ebene durch zwei echt parallele Geraden",
    gen(r) {
      let A, u, B, v, w, f;
      do {
        u = zufVek(r, -3, 3); f = eins(r, [-2, 2, -1, 3, -3]); v = vSkal(f, u);
        A = zufPunkt(r, -3, 4); w = zufVek(r, -3, 3); B = vAdd(A, w);
      } while (kollinearFaktor(u, w) !== null || B.some((x) => Math.abs(x.z) > 6) || v.some((x) => Math.abs(x.z) > 9));
      return {
        text: `Gegeben sind ${$(geradeT(A, u))} und ${$(geradeT(B, v, { name: "h", param: "k" }))}. Zeige, dass die Geraden echt parallel sind, und gib die Ebene an, die beide enthält.`,
        schritte: [
          zahlS("f", "Faktor", "Mit welchem Faktor $f$ gilt $\\vec{v} = f \\cdot \\vec{u}$?", "$f =$", f),
          vektorS("w", "Verbindungsvektor", "Berechne $\\vec{AB}$ vom Stützpunkt $A$ von $g$ zum Stützpunkt $B$ von $h$.", "$\\vec{AB} =$", w),
          wahlS("echt", "Echt parallel?", "Ist $\\vec{AB}$ ein Vielfaches von $\\vec{u}$?", JA_NEIN("ja – dann wären $g$ und $h$ identisch", "nein – $B$ liegt nicht auf $g$, die Geraden sind echt parallel"), "nein"),
        ],
        weg: [
          `${$(`${vT(v)} = ${malT(f, vT(u))}`)}: Die Richtungsvektoren sind kollinear, $g \\parallel h$.`,
          `${$(`\\vec{AB} = ${vT(w)}`)} ist kein Vielfaches von ${$(vT(u))}, also liegt $B$ nicht auf $g$: echt parallel.`,
          `Ebene aus $A$, $\\vec{u}$ und $\\vec{AB}$: ${$(ebeneParamT(A, u, w))}`,
        ],
      };
    },
  },

  ebParameterA: {
    titel: "Koordinate so bestimmen, dass der Punkt in der Ebene liegt",
    gen(r) {
      let A, u, v, rr, ss, P, det;
      do {
        ({ A, u, v } = dreiPunkte(r));
        det = qSub(qMul(u[1], v[2]), qMul(u[2], v[1]));
        rr = ganz(r, -3, 3); ss = ganz(r, -3, 3);
        P = vAdd(A, vAdd(vSkal(rr, u), vSkal(ss, v)));
      } while (qNull(det) || P.some((x) => Math.abs(x.z) > 9));
      const a = P[0];
      const zeilen = [1, 2].map((i) => `$\\text{${ROEM[i]}}\\quad ${summeT([[u[i], "r"], [v[i], "s"]])} = ${zT(qSub(P[i], A[i]))}$`).join(", ");
      return {
        text: `Bestimme $a$ so, dass der Punkt $Q(a \\mid ${zT(P[1])} \\mid ${zT(P[2])})$ in der Ebene ${$(ebeneParamT(A, u, v))} liegt.`,
        schritte: [
          zahlS("r", "Parameter r", "Die zweite und dritte Gleichung enthalten kein $a$. Löse sie nach $r$ und $s$ auf.", "$r =$", rr, { hinweis: zeilen }),
          zahlS("s", "Parameter s", "Und $s$?", "$s =$", ss),
          zahlS("a", "Koordinate a", "Setze $r$ und $s$ in die erste Gleichung ein.", "$a =$", a, { fehler: [{ wert: qNum(qSub(a, A[0])), text: "Du hast den Stützpunkt vergessen: $a = $ erste Koordinate des Stützpunkts plus $r \\cdot u_1 + s \\cdot v_1$." }] }),
        ],
        weg: [
          `Aus II und III: ${zeilen}, also ${$(`r = ${zT(rr)}`)}, ${$(`s = ${zT(ss)}`)}`,
          `I: ${$(`a = ${zT(A[0])} + ${kz(rr)} \\cdot ${kz(u[0])} + ${kz(ss)} \\cdot ${kz(v[0])} = ${zT(a)}`)}`,
        ],
      };
    },
  },

  /* ===================== Seite 39: Normalenform und Koordinatenform ===================== */
  ebNormalZuKoord: {
    titel: "Normalenform und Koordinatenform aus Punkt und Normalenvektor",
    gen(r, variante) {
      let P, n, d;
      do {
        P = zufPunkt(r, -3, 5);
        n = variante === "achse" ? mische(r, [q(vz(r)), q(0), q(0)]) : zufVek(r, -3, 4);
        d = vDot(n, P);
      } while (Math.abs(d.z) > 15 || qNull(d) || (variante !== "achse" && n.filter(qNull).length > 1));
      const ursprung = variante === "ursprung";
      return {
        text: `Die Ebene $E$ geht durch ${$(pT(P, "P"))} und hat den Normalenvektor ${$(`\\vec{n} = ${vT(n)}`)}. Gib eine Normalenform und eine Koordinatenform von $E$ an.${ursprung ? " Welche Ebene durch den Ursprung ist parallel zu $E$?" : ""}`,
        schritte: [
          wahlS("nf", "Normalenform", "Welche Gleichung ist die Normalenform von $E$?", mische(r, [
            ["richtig", $(ebeneNormalT(P, n, { name: "" }).replace(/^: /, ""))],
            ["vertauscht", $(ebeneNormalT(n, P, { name: "" }).replace(/^: /, ""))],
            ["plus", $(`\\left[\\vec{x} + ${vT(P)}\\right] \\cdot ${vT(n)} = 0`)],
          ]), "richtig", { hinweis: "In der Klammer steht $\\vec{x} - \\vec{p}$, dahinter der Normalenvektor." }),
          zahlS("d", "Rechte Seite", "Ausmultiplizieren: $\\vec{n} \\cdot \\vec{x} = \\vec{n} \\cdot \\vec{p}$. Berechne $d = \\vec{n} \\cdot \\vec{p}$.", "$d =$", d, { hinweis: `$d = ${einsetzT(n, P).split(" = ")[0]}$` }),
          vektorS("n", "Koeffizienten", "Welche Zahlen stehen in der Koordinatenform vor $x_1$, $x_2$, $x_3$?", "$(n_1; n_2; n_3) =$", n),
          ...(ursprung ? [zahlS("d0", "Parallele durch O", "Welche rechte Seite hat die zu $E$ parallele Ebene durch den Ursprung?", "$d =$", 0, { fehler: [{ wert: qNum(d), text: "Das ist $E$ selbst. Der Ursprung muss die Gleichung erfüllen: Einsetzen von $(0 \\mid 0 \\mid 0)$ ergibt links 0." }] })] : []),
        ],
        weg: [
          `Normalenform: ${$(ebeneNormalT(P, n))}`,
          `Ausmultiplizieren: ${$(`\\vec{n} \\cdot \\vec{x} = \\vec{n} \\cdot \\vec{p} = ${einsetzT(n, P)}`)}`,
          `Koordinatenform: ${$(koordT(n, d))}`,
          ...(ursprung ? [`Parallel durch $O$: gleicher Normalenvektor, Ursprung einsetzen ergibt $d = 0$: ${$(koordT(n, 0, { name: "F" }))}`] : []),
        ],
      };
    },
  },

  ebKoordAblesen: {
    titel: "Normalenvektor und Punkt aus der Koordinatenform ablesen",
    gen(r, variante) {
      let n, d;
      do {
        n = variante === "einfach" ? mische(r, [q(ganz(r, 1, 3)), q(ganz(r, -3, 3)), q(0)]) : zufVek(r, -4, 4, { keineNull: true });
        d = q(ganz(r, -8, 9, [0]));
      } while (n.filter((x) => !qNull(x)).length < 1);
      // Punkt: eine Koordinate, deren Koeffizient d teilt
      const i = [0, 1, 2].find((j) => !qNull(n[j]) && d.z % n[j].z === 0) ?? [0, 1, 2].find((j) => !qNull(n[j]));
      const P = [q(0), q(0), q(0)]; P[i] = qDiv(d, n[i]);
      const falsch = [...n]; falsch[2] = d;
      return {
        text: `Gib einen Normalenvektor und einen Punkt der Ebene ${$(koordT(n, d))} an.`,
        schritte: [
          vektorS("n", "Normalenvektor", "Lies die Koeffizienten von $x_1$, $x_2$, $x_3$ ab.", "$\\vec{n} =$", n, { hinweis: "Fehlt eine Variable, ist ihr Koeffizient 0. Die rechte Seite gehört nicht dazu." }),
          wahlS("falsch", "Typischer Fehler", `Jemand liest ${$(`\\vec{n} = ${vT(falsch)}`)} ab. Was ist falsch?`, [["d", "Die rechte Seite $d$ ist kein Koeffizient – sie gehört nicht in den Normalenvektor."], ["ok", "Nichts, das ist ein Normalenvektor."]], "d"),
          punktS("P", "Punkt", `Setze zwei Koordinaten 0 und berechne die dritte: Gib den Punkt mit ${["x_2 = x_3 = 0", "x_1 = x_3 = 0", "x_1 = x_2 = 0"][i]} an.`, "$P =$", P),
        ],
        weg: [
          `Koeffizienten: ${$(`\\vec{n} = ${vT(n)}`)} (fehlende Variable: Koeffizient 0; die rechte Seite ${zT(d)} gehört nicht dazu)`,
          `Punkt: ${["x_2 = x_3 = 0", "x_1 = x_3 = 0", "x_1 = x_2 = 0"].map((t) => `$${t}$`)[i]} einsetzen: ${$(`${summeT([[n[i], X[i]]])} = ${zT(d)}`)}${Q(n[i]).z === 1 ? "" : `, also ${$(`${X[i]} = ${zT(P[i])}`)}`}: ${$(pT(P, "P"))}`,
        ],
      };
    },
  },

  ebPunktprobeKoord: {
    titel: "Punktprobe in der Koordinatenform",
    gen(r) {
      let n, d, pts, drin;
      do {
        ({ n, d } = zufEbene(r, { keineNull: true }));
        pts = []; drin = [];
        for (let k = 0; k < 3; k++) {
          const P = zufPunkt(r, -3, 5);
          const w = vDot(n, P);
          const soll = r() < 0.5;
          if (soll && !qGleich(w, d)) {
            // letzte Koordinate anpassen, wenn teilbar
            const rest = qSub(d, qSub(w, qMul(n[2], P[2])));
            const x3 = qDiv(rest, n[2]);
            if (x3.n === 1 && Math.abs(x3.z) <= 6) P[2] = x3;
          }
          pts.push(P); drin.push(qGleich(vDot(n, P), d));
        }
      } while (!drin.some(Boolean) || drin.every(Boolean) || pts.some((P, i) => pts.some((R, j) => j < i && vGleich(P, R))));
      const namen = ["A", "B", "C"];
      return {
        text: `Welche der Punkte ${pts.map((P, i) => $(pT(P, namen[i]))).join(", ")} liegen in der Ebene ${$(koordT(n, d))}?`,
        schritte: [
          ...pts.map((P, i) => zahlS(`w${i}`, `Punkt ${namen[i]} einsetzen`, `Setze ${$(pT(P, namen[i]))} in die linke Seite ein.`, `$\\vec{n} \\cdot \\vec{${namen[i].toLowerCase()}} =$`, vDot(n, P), { hinweis: `$${einsetzT(n, P).split(" = ")[0]}$` })),
          teilmengeWahl(r, "drin", "Ergebnis", `Welche Punkte liegen in $E$ (rechte Seite ${$(zT(d))})?`, namen, namen.filter((_, i) => drin[i])),
        ],
        weg: [
          ...pts.map((P, i) => `${$(namen[i])}: ${$(einsetzT(n, P))} ${drin[i] ? `$= ${zT(d)}$ ✓` : `$\\ne ${zT(d)}$ ✗`}`),
          `In $E$ liegen: ${namen.filter((_, i) => drin[i]).map((x) => `$${x}$`).join(", ")}.`,
        ],
      };
    },
  },

  ebKoordDreiPunkte: {
    titel: "Koordinatenform der Ebene durch drei Punkte (Kreuzprodukt)",
    gen(r) {
      const { A, B, C, u, v, n } = dreiPunkte(r);
      const kreuz = vCross(u, v);
      const d = vDot(n, A);
      const gek = !vGleich(kreuz, n);
      return {
        text: `Bestimme eine Koordinatenform der Ebene durch ${$(pT(A, "A"))}, ${$(pT(B, "B"))} und ${$(pT(C, "C"))} mit dem Kreuzprodukt.`,
        schritte: [
          vektorS("u", "Spannvektor AB", "Berechne $\\vec{AB}$.", "$\\vec{AB} =$", u),
          vektorS("v", "Spannvektor AC", "Berechne $\\vec{AC}$.", "$\\vec{AC} =$", v),
          vektorS("n", "Normalenvektor", "Berechne $\\vec{AB} \\times \\vec{AC}$.", "$\\vec{AB} \\times \\vec{AC} =$", kreuz, { hinweis: "Kreuzprodukt: $\\spalte{a_2 b_3 - a_3 b_2}{a_3 b_1 - a_1 b_3}{a_1 b_2 - a_2 b_1}$" }),
          zahlS("d", "Rechte Seite", `Setze $A$ in $\\vec{n} \\cdot \\vec{x} = d$ ein${gek ? ` – mit dem gekürzten Normalenvektor ${$(vT(n))}` : ""}.`, "$d =$", d),
        ],
        weg: [
          `${$(`\\vec{AB} = ${vT(u)}`)}, ${$(`\\vec{AC} = ${vT(v)}`)}`,
          `${$(`\\vec{AB} \\times \\vec{AC} = ${kreuzWegT(u, v)}`)}${gek ? `, gekürzt ${$(`\\vec{n} = ${vT(n)}`)}` : ""}`,
          `$A$ einsetzen: ${$(`d = ${einsetzT(n, A)}`)}`,
          `${$(koordT(n, d))}`,
        ],
      };
    },
  },

  ebParallelDurchPunkt: {
    titel: "Parallele Ebene durch einen Punkt",
    gen(r) {
      let n, d, Qp, d2;
      do {
        ({ n, d } = zufEbene(r));
        Qp = zufPunkt(r, -3, 4);
        d2 = vDot(n, Qp);
      } while (qGleich(d, d2) || Math.abs(d2.z) > 15);
      return {
        text: `Gib die Ebene an, die parallel zu ${$(koordT(n, d))} ist und durch ${$(pT(Qp, "Q"))} geht.`,
        schritte: [
          vektorS("n", "Normalenvektor", "Parallele Ebenen haben denselben Normalenvektor. Welchen?", "$\\vec{n} =$", n),
          zahlS("d", "Rechte Seite", "Setze $Q$ in $\\vec{n} \\cdot \\vec{x} = d$ ein.", "$d =$", d2, { fehler: [{ wert: qNum(d), text: "Das ist die rechte Seite der alten Ebene. Die neue Ebene geht durch $Q$ – setze $Q$ ein." }] }),
        ],
        weg: [
          `Gleicher Normalenvektor ${$(`\\vec{n} = ${vT(n)}`)}, neue rechte Seite durch Einsetzen von $Q$: ${$(`d = ${einsetzT(n, Qp)}`)}`,
          `${$(koordT(n, d2, { name: "F" }))}`,
        ],
      };
    },
  },

  ebMittelsenkrecht: {
    titel: "Mittelebene senkrecht zu einer Strecke",
    gen(r) {
      let A, B, ab, n, M, d;
      do {
        A = zufPunkt(r, -3, 4);
        ab = zufVek(r, -3, 3).map((x) => qMul(x, q(2)));
        B = vAdd(A, ab);
        n = vKuerzen(ab); M = mittelpunkt(A, B); d = vDot(n, M);
      } while (B.some((x) => Math.abs(x.z) > 7) || Math.abs(d.z) > 20 || ab.filter(qNull).length > 1);
      const gek = !vGleich(ab, n);
      return {
        text: `Gegeben sind ${$(pT(A, "A"))} und ${$(pT(B, "B"))}. Die Ebene $M$ steht senkrecht auf $\\vec{AB}$ und geht durch den Mittelpunkt der Strecke $AB$. Bestimme $M$ in Koordinatenform.`,
        schritte: [
          vektorS("ab", "Vektor AB", "Berechne $\\vec{AB}$ – er ist ein Normalenvektor von $M$.", "$\\vec{AB} =$", ab),
          punktS("M", "Mittelpunkt", "Berechne den Mittelpunkt $\\frac{1}{2}(\\vec{a} + \\vec{b})$.", "$M =$", M),
          zahlS("d", "Rechte Seite", `Setze den Mittelpunkt in ${$(`${summeT(n.map((k, i) => [k, X[i]]))} = d`)} ein${gek ? ` (Normalenvektor gekürzt zu ${$(vT(n))})` : ""}.`, "$d =$", d),
        ],
        weg: [
          `${$(`\\vec{AB} = ${vT(ab)}`)}${gek ? `, gekürzt ${$(`\\vec{n} = ${vT(n)}`)}` : ""}; Mittelpunkt ${$(`\\frac{1}{2}\\left(${vT(A)} + ${vT(B)}\\right) = ${vT(M)}`)}`,
          `Einsetzen: ${$(`d = ${einsetzT(n, M)}`)}`,
          `${$(koordT(n, d, { name: "M" }))}`,
        ],
      };
    },
  },

  /* ===================== Seite 41: Spurpunkte, Umwandlungen ===================== */
  ebSpurpunkte: {
    titel: "Spurpunkte einer Ebene",
    gen(r) {
      // n_i teilt d, alle n_i ≠ 0
      let n, d;
      do {
        n = zufVek(r, -4, 6, { keineNull: true });
        const k = n.reduce((m, x) => kgV(m, x.z), 1);
        d = q(k * eins(r, [1, 1, 2, -1]));
      } while (Math.abs(d.z) > 24 || n.reduce((m, x) => ggT(m, Math.abs(x.z)), 0) !== 1);
      const S = [0, 1, 2].map((i) => { const P = [q(0), q(0), q(0)]; P[i] = qDiv(d, n[i]); return P; });
      return {
        text: `Bestimme die Spurpunkte der Ebene ${$(koordT(n, d))} (die Schnittpunkte mit den drei Koordinatenachsen).`,
        schritte: S.map((P, i) => punktS(`s${i + 1}`, `Spurpunkt S_${i + 1}`, `Auf der $${X[i]}$-Achse sind die anderen beiden Koordinaten 0. Setze ein und löse nach $${X[i]}$ auf.`, `$S_${i + 1} =$`, P, { hinweis: `$${summeT([[n[i], X[i]]])} = ${zT(d)}$` })),
        weg: [
          ...S.map((P, i) => `$${X[i]}$-Achse: ${$(`${summeT([[n[i], X[i]]])} = ${zT(d)}`)}${n[i].z === 1 ? "" : `, also ${$(`${X[i]} = ${zT(P[i])}`)}`}: ${$(pT(P, `S_${i + 1}`))}`),
          `Die drei Spurpunkte bilden das Spurdreieck von $E$.`,
        ],
      };
    },
  },

  ebParamZuKoord: {
    titel: "Parameterform in Koordinatenform umwandeln",
    gen(r) {
      const { u, v, n } = ebeneAusRichtungen(r);
      const A = zufPunkt(r, -3, 4);
      const kreuz = vCross(u, v), d = vDot(n, A);
      const gek = !vGleich(kreuz, n);
      return {
        text: `Wandle die Ebene ${$(ebeneParamT(A, u, v))} in eine Koordinatenform um.`,
        schritte: [
          vektorS("n", "Normalenvektor", "Berechne das Kreuzprodukt der Spannvektoren.", "$\\vec{u} \\times \\vec{v} =$", kreuz),
          zahlS("d", "Rechte Seite", `Setze den Stützpunkt in $\\vec{n} \\cdot \\vec{x} = d$ ein${gek ? ` (gekürzter Normalenvektor ${$(vT(n))})` : ""}.`, "$d =$", d),
        ],
        weg: [
          `${$(`\\vec{u} \\times \\vec{v} = ${kreuzWegT(u, v)}`)}${gek ? `, gekürzt ${$(`\\vec{n} = ${vT(n)}`)}` : ""}`,
          `Stützpunkt einsetzen: ${$(`d = ${einsetzT(n, A)}`)}`,
          `${$(koordT(n, d))}`,
        ],
      };
    },
  },

  ebKoordZuParam: {
    titel: "Koordinatenform in Parameterform umwandeln",
    gen(r) {
      // Koeffizient ±1 bei einer Variablen, nach der aufgelöst wird
      let n, d, k;
      do {
        n = zufVek(r, -3, 3, { keineNull: true });
        k = ganz(r, 0, 2);
        n[k] = q(vz(r));
        d = q(ganz(r, -6, 8, [0]));
      } while (false);
      const [i, j] = [0, 1, 2].filter((x) => x !== k);
      // x_k = (d − n_i x_i − n_j x_j)/n_k
      const P = [q(0), q(0), q(0)]; P[k] = qDiv(d, n[k]);
      const U = [q(0), q(0), q(0)]; U[i] = q(1); U[k] = qDiv(qNeg(n[i]), n[k]);
      const V = [q(0), q(0), q(0)]; V[j] = q(1); V[k] = qDiv(qNeg(n[j]), n[k]);
      const aufl = `${X[k]} = ${affSumT(P[k], [[U[k], X[i]], [V[k], X[j]]])}`;
      return {
        text: `Wandle die Ebene ${$(koordT(n, d))} in eine Parameterform um. Löse dazu nach $${X[k]}$ auf und setze $${X[i]} = r$, $${X[j]} = s$.`,
        schritte: [
          punktS("P", "Stützpunkt", `Setze $r = s = 0$ (also $${X[i]} = ${X[j]} = 0$): Welcher Punkt ergibt sich?`, "$P =$", P),
          vektorS("u", "Spannvektor zu r", `Der Koeffizient von $r$ in jeder Koordinate: $${X[i]} = r$ liefert 1, $${X[j]}$ liefert 0, $${X[k]}$ den Koeffizienten von $${X[i]}$ nach dem Auflösen.`, "$\\vec{u} =$", U),
          vektorS("v", "Spannvektor zu s", "Ebenso für $s$.", "$\\vec{v} =$", V),
          vektorS("probe", "Kontrolle", `Beide Spannvektoren müssen senkrecht auf $\\vec{n}$ stehen: Berechne $\\vec{n} \\cdot \\vec{u}$ und $\\vec{n} \\cdot \\vec{v}$.`, "$(\\vec{n} \\cdot \\vec{u}; \\vec{n} \\cdot \\vec{v}) =$", [q(0), q(0)]),
        ],
        weg: [
          `Auflösen: ${$(aufl)}`,
          `${$(`${X[i]} = r`)}, ${$(`${X[j]} = s`)}, ${$(`${X[k]} = ${affSumT(P[k], [[U[k], "r"], [V[k], "s"]])}`)}`,
          `${$(ebeneParamT(P, U, V))} – Kontrolle: ${$(`\\vec{n} \\cdot \\vec{u} = ${skalarWegT(n, U)}`)}, ${$(`\\vec{n} \\cdot \\vec{v} = ${skalarWegT(n, V)}`)} ✓`,
        ],
      };
    },
  },

  ebBesondereLage: {
    titel: "Besondere Lage einer Ebene erkennen",
    gen(r) {
      const art = eins(r, ["achse", "koordEbene", "parallelKoordEbene", "ursprung"]);
      let n, d, text, richtig, weg;
      const ACHSEN = ["x_1", "x_2", "x_3"];
      const EBENEN = ["x_2x_3", "x_1x_3", "x_1x_2"];
      if (art === "achse") {
        const k = ganz(r, 0, 2); n = [q(ganz(r, 1, 3)), q(ganz(r, 1, 3)), q(ganz(r, 1, 3))]; n[k] = q(0); d = q(ganz(r, 1, 8));
        if (r() < 0.4) n[(k + 1) % 3] = qNeg(n[(k + 1) % 3]);
        richtig = `achse${k}`;
        weg = [`Die Variable $${ACHSEN[k]}$ fehlt, also $n_${k + 1} = 0$: Der Normalenvektor steht senkrecht auf der $${ACHSEN[k]}$-Achse.`, `$E$ ist parallel zur $${ACHSEN[k]}$-Achse (sie enthält die Achse nicht, da $d \\ne 0$).`];
      } else if (art === "koordEbene") {
        const k = ganz(r, 0, 2); n = [q(0), q(0), q(0)]; n[k] = q(1); d = q(0);
        richtig = `ebene${k}`;
        weg = [`$${ACHSEN[k]} = 0$: Alle Punkte mit $${ACHSEN[k]}$-Koordinate 0 – das ist genau die $${EBENEN[k]}$-Koordinatenebene.`];
      } else if (art === "parallelKoordEbene") {
        const k = ganz(r, 0, 2); n = [q(0), q(0), q(0)]; n[k] = q(1); d = q(ganz(r, -5, 5, [0]));
        richtig = `parEbene${k}`;
        weg = [`$${ACHSEN[k]} = ${zT(d)}$: Alle Punkte mit $${ACHSEN[k]}$-Koordinate ${zT(d)} – eine Ebene parallel zur $${EBENEN[k]}$-Ebene im Abstand ${zT(q(Math.abs(d.z)))}.`];
      } else {
        ({ n } = zufEbene(r, { keineNull: true })); d = q(0);
        richtig = "ursprung";
        weg = [`$d = 0$: Der Ursprung $O(0 \\mid 0 \\mid 0)$ erfüllt die Gleichung, $E$ geht durch den Ursprung. Alle drei Variablen kommen vor: zu keiner Achse parallel.`];
      }
      const optionen = [];
      const k0 = richtig.match(/\d/) ? Number(richtig.match(/\d/)[0]) : ganz(r, 0, 2);
      const alle = [
        [`achse${k0}`, `parallel zur $${ACHSEN[k0]}$-Achse`],
        [`ebene${k0}`, `die $${EBENEN[k0]}$-Koordinatenebene`],
        [`parEbene${k0}`, `parallel zur $${EBENEN[k0]}$-Koordinatenebene`],
        ["ursprung", "Ebene durch den Ursprung, zu keiner Achse parallel"],
      ];
      optionen.push(...mische(r, alle));
      return {
        text: `Beschreibe die besondere Lage der Ebene ${$(koordT(n, d))} im Koordinatensystem.`,
        schritte: [
          vektorS("n", "Normalenvektor", "Lies den Normalenvektor ab.", "$\\vec{n} =$", n),
          wahlS("lage", "Lage", "Welche Lage hat $E$?", optionen, richtig, { hinweis: "Fehlt eine Variable, ist $E$ parallel zu dieser Achse. Fehlen zwei, ist $E$ parallel zu einer Koordinatenebene. $d = 0$: $E$ geht durch den Ursprung." }),
        ],
        weg: [`${$(`\\vec{n} = ${vT(n)}`)}`, ...weg],
      };
    },
  },

  ebAusSpurpunkten: {
    titel: "Koordinatenform aus den Spurpunkten",
    gen(r) {
      let a, b, c;
      do { a = ganz(r, 1, 6) * vz(r); b = ganz(r, 1, 6) * vz(r); c = ganz(r, 1, 6) * vz(r); } while (new Set([Math.abs(a), Math.abs(b), Math.abs(c)]).size < 2 || (a < 0 && b < 0 && c < 0));
      const L = kgV(kgV(Math.abs(a), Math.abs(b)), Math.abs(c));
      const n = [q(L / a), q(L / b), q(L / c)], d = q(L);
      return {
        text: `Eine Ebene hat die Spurpunkte ${$(`S_1(${zT(q(a))} \\mid 0 \\mid 0)`)}, ${$(`S_2(0 \\mid ${zT(q(b))} \\mid 0)`)} und ${$(`S_3(0 \\mid 0 \\mid ${zT(q(c))})`)}. Gib eine Koordinatenform mit ganzzahligen Koeffizienten an.`,
        schritte: [
          zahlS("L", "Hauptnenner", `Achsenabschnittsform: $\\frac{x_1}{${zT(q(a))}} + \\frac{x_2}{${zT(q(b))}} + \\frac{x_3}{${zT(q(c))}} = 1$. Multipliziere mit dem kleinsten gemeinsamen Vielfachen der Beträge. Welches ist das?`, "$d =$", d),
          vektorS("n", "Koeffizienten", "Welche Koeffizienten stehen dann vor $x_1$, $x_2$, $x_3$?", "$(n_1; n_2; n_3) =$", n),
        ],
        weg: [
          `Achsenabschnittsform: ${$(`\\frac{x_1}{${zT(q(a))}} + \\frac{x_2}{${zT(q(b))}} + \\frac{x_3}{${zT(q(c))}} = 1`)}`,
          `Mal ${zT(d)}: ${$(koordT(n, d))}`,
          `Probe mit $S_1$: ${$(`${kz(n[0])} \\cdot ${kz(q(a))} = ${zT(d)}`)} ✓`,
        ],
      };
    },
  },

  ebPyramide: {
    titel: "Volumen der Pyramide aus Spurdreieck und Ursprung",
    gen(r) {
      let n, d;
      do {
        n = zufVek(r, 1, 6, { keineNull: true });
        const k = n.reduce((m, x) => kgV(m, x.z), 1);
        d = q(k);
      } while (d.z > 24 || n.reduce((m, x) => ggT(m, x.z), 0) !== 1);
      const S = n.map((x) => qDiv(d, x));
      const G = qMul(q(1, 2), qMul(S[0], S[1]));
      const V = qMul(q(1, 3), qMul(G, S[2]));
      return {
        text: `Das Spurdreieck der Ebene ${$(koordT(n, d))} bildet mit dem Ursprung eine Pyramide. Berechne ihr Volumen.`,
        schritte: [
          punktS("S", "Spurpunkte", "Gib die Achsenabschnitte an: Wo schneidet $E$ die $x_1$-, $x_2$- und $x_3$-Achse?", "$(s_1; s_2; s_3) =$", S),
          zahlS("G", "Grundfläche", "Die Grundfläche ist das rechtwinklige Dreieck $O S_1 S_2$ in der $x_1x_2$-Ebene.", "$G =$", G, { hinweis: "$G = \\frac{1}{2} \\cdot s_1 \\cdot s_2$" }),
          zahlS("V", "Volumen", "Die Höhe ist der Abschnitt auf der $x_3$-Achse.", "$V =$", V, { fehler: [{ wert: qNum(qMul(G, S[2])), text: "Pyramide: $V = \\frac{1}{3} \\cdot G \\cdot h$ – der Faktor $\\frac{1}{3}$ fehlt." }] }),
        ],
        weg: [
          `Spurpunkte: ${$(`S_1(${zT(S[0])} \\mid 0 \\mid 0)`)}, ${$(`S_2(0 \\mid ${zT(S[1])} \\mid 0)`)}, ${$(`S_3(0 \\mid 0 \\mid ${zT(S[2])})`)}`,
          `Grundfläche: ${$(`G = \\frac{1}{2} \\cdot ${zT(S[0])} \\cdot ${zT(S[1])} = ${zT(G)}`)}, Höhe ${$(`h = ${zT(S[2])}`)}`,
          `${$(`V = \\frac{1}{3} \\cdot ${zT(G)} \\cdot ${zT(S[2])} = ${zT(V)}`)}`,
        ],
      };
    },
  },

  ebParallelAchse: {
    titel: "Ebene parallel zu einer Achse durch zwei Spurpunkte",
    gen(r) {
      const k = ganz(r, 0, 2);
      const [i, j] = [0, 1, 2].filter((x) => x !== k);
      let a, b;
      do { a = ganz(r, 1, 6) * vz(r); b = ganz(r, 1, 6) * vz(r); } while (Math.abs(a) === Math.abs(b) && r() < 0.7);
      const L = kgV(Math.abs(a), Math.abs(b));
      const n = [q(0), q(0), q(0)]; n[i] = q(L / a); n[j] = q(L / b);
      const d = q(L);
      const Si = [q(0), q(0), q(0)]; Si[i] = q(a);
      const Sj = [q(0), q(0), q(0)]; Sj[j] = q(b);
      return {
        text: `Die Ebene $E$ ist parallel zur $${X[k]}$-Achse und geht durch ${$(pT(Si, "S_1"))} und ${$(pT(Sj, "S_2"))}. Gib $E$ in Koordinatenform an.`,
        schritte: [
          zahlS("nk", "Koeffizient", `Parallel zur $${X[k]}$-Achse: Welchen Wert hat $n_${k + 1}$?`, `$n_${k + 1} =$`, 0, { hinweis: `Die Richtung $\\spalte{${k === 0 ? 1 : 0}}{${k === 1 ? 1 : 0}}{${k === 2 ? 1 : 0}}$ liegt in $E$, also ist $\\vec{n}$ senkrecht dazu.` }),
          vektorS("n", "Normalenvektor", `Aus $\\frac{${X[i]}}{${zT(q(a))}} + \\frac{${X[j]}}{${zT(q(b))}} = 1$ mit Hauptnenner: Gib $\\vec{n}$ an.`, "$\\vec{n} =$", n),
          zahlS("d", "Rechte Seite", "Und die rechte Seite?", "$d =$", d),
        ],
        weg: [
          `$E \\parallel ${X[k]}$-Achse, also $n_${k + 1} = 0$: Die Gleichung enthält kein $${X[k]}$.`,
          `Achsenabschnitte: ${$(`\\frac{${X[i]}}{${zT(q(a))}} + \\frac{${X[j]}}{${zT(q(b))}} = 1`)}, mal ${zT(d)}: ${$(koordT(n, d))}`,
          `Probe: $S_1$: ${$(`${kz(n[i])} \\cdot ${kz(q(a))} = ${zT(d)}`)} ✓, $S_2$: ${$(`${kz(n[j])} \\cdot ${kz(q(b))} = ${zT(d)}`)} ✓`,
        ],
      };
    },
  },

  /* ===================== Seite 43: Lage Gerade – Ebene ===================== */
  ebGeradeEbene: {
    titel: "Lage von Gerade und Ebene, Durchstoßpunkt",
    gen(r, variante) {
      // variante: "schneidet" | "parallel" | "liegt" | undefined (zufällig)
      const soll = variante || eins(r, ["schneidet", "schneidet", "parallel", "liegt"]);
      let n, d, P, u, erg;
      for (let i = 0; i < 400; i++) {
        ({ n, d } = zufEbene(r, { keineNull: r() < 0.6 }));
        if (soll === "schneidet") {
          u = zufVek(r, -3, 3);
          const t = ganz(r, -3, 3, [0]);
          const D = zufPunkt(r, -3, 4);
          if (!qGleich(vDot(n, D), d)) {
            // D in E legen: Koordinate mit n_k ≠ 0 anpassen
            const k = [2, 1, 0].find((j) => !qNull(n[j]));
            const rest = qSub(d, qSub(vDot(n, D), qMul(n[k], D[k])));
            const x = qDiv(rest, n[k]);
            if (x.n !== 1 || Math.abs(x.z) > 6) continue;
            D[k] = x;
          }
          P = vSub(D, vSkal(t, u));
        } else {
          // u senkrecht zu n: u = kleines Kreuzprodukt oder Suche
          u = null;
          for (let j = 0; j < 50 && !u; j++) { const w = zufVek(r, -3, 3); if (qNull(vDot(n, w))) u = w; }
          if (!u) continue;
          P = zufPunkt(r, -3, 4);
          if (soll === "liegt") {
            const k = [2, 1, 0].find((j) => !qNull(n[j]));
            const rest = qSub(d, qSub(vDot(n, P), qMul(n[k], P[k])));
            const x = qDiv(rest, n[k]);
            if (x.n !== 1 || Math.abs(x.z) > 6) continue;
            P[k] = x;
          } else if (qGleich(vDot(n, P), d)) continue;
        }
        if (P.some((x) => Math.abs(x.z) > 7)) continue;
        erg = geradeEbene(P, u, n, d);
        if (erg.art === soll) break;
      }
      const eingesetzt = geradeInEbeneT(n, P, u);
      const links = affT(erg.np, erg.nu);
      const schritte = [
        zahlS("nu", "Skalarprodukt", "Berechne $\\vec{n} \\cdot \\vec{u}$ (Normalenvektor mal Richtungsvektor).", "$\\vec{n} \\cdot \\vec{u} =$", erg.nu, { hinweis: "Ist es 0, ist $g$ parallel zu $E$ (oder liegt darin)." }),
        zahlS("np", "Stützpunkt einsetzen", "Setze den Stützpunkt von $g$ in die linke Seite der Ebenengleichung ein.", "$\\vec{n} \\cdot \\vec{p} =$", erg.np),
        wahlS("lage", "Lage", "Wie liegen $g$ und $E$ zueinander?", LAGE_GE, erg.art, { hinweis: `Gleichung nach dem Einsetzen: $${links} = ${zT(d)}$` }),
      ];
      if (erg.art === "schneidet") {
        schritte.push(zahlS("t", "Parameter", "Löse die Gleichung nach $t$ auf.", "$t =$", erg.t));
        schritte.push(punktS("D", "Durchstoßpunkt", "Setze $t$ in $g$ ein.", "$D =$", erg.D));
      }
      const weg = [`$g$ in $E$ einsetzen: ${$(`${eingesetzt} = ${zT(d)}`)}`, `Zusammenfassen: ${$(`${links} = ${zT(d)}`)}`];
      if (erg.art === "schneidet") weg.push(`${$(`t = ${zT(erg.t)}`)}, Durchstoßpunkt ${$(`\\vec{d} = ${vT(P)} ${erg.t.z < 0 ? MINUS : "+"} ${malT(q(Math.abs(erg.t.z), erg.t.n), vT(u))} = ${vT(erg.D)}`)}: ${$(pT(erg.D, "D"))}`);
      else if (erg.art === "parallel") weg.push(`${$(`${zT(erg.np)} \\ne ${zT(d)}`)}: Die Gleichung hat keine Lösung, $g$ ist echt parallel zu $E$ ($\\vec{n} \\cdot \\vec{u} = 0$).`);
      else weg.push(`${$(`${zT(erg.np)} = ${zT(d)}`)} gilt für jedes $t$: $g$ liegt in $E$.`);
      return {
        text: `Untersuche die Lage von ${$(geradeT(P, u))} und ${$(koordT(n, d))}. Berechne gegebenenfalls den Durchstoßpunkt.`,
        schritte, weg,
      };
    },
  },

  ebKoordEbenenDurchstoss: {
    titel: "Durchstoßpunkte mit den Koordinatenebenen",
    gen(r) {
      let P, u, ts;
      do {
        u = zufVek(r, -3, 3, { keineNull: true });
        ts = [ganz(r, -3, 3, [0]), ganz(r, -3, 3, [0]), ganz(r, -3, 3, [0])];
        P = [0, 1, 2].map((i) => qMul(q(-ts[i]), u[i]));
      } while (P.some((x) => Math.abs(x.z) > 8) || new Set(ts).size < 3);
      const D = ts.map((t) => vAdd(P, vSkal(t, u)));
      return {
        text: `Wo durchstößt die Gerade ${$(geradeT(P, u))} die drei Koordinatenebenen $x_1 = 0$, $x_2 = 0$ und $x_3 = 0$?`,
        schritte: [0, 1, 2].flatMap((i) => [
          zahlS(`t${i}`, `Parameter für ${X[i]} = 0`, `Setze die ${["erste", "zweite", "dritte"][i]} Koordinate von $g$ gleich 0 und löse nach $t$ auf.`, "$t =$", ts[i], { hinweis: `$${affT(P[i], u[i])} = 0$` }),
          punktS(`D${i}`, `Durchstoßpunkt mit ${X[i]} = 0`, "Setze $t$ in $g$ ein.", `$D_${i + 1} =$`, D[i]),
        ]),
        weg: [0, 1, 2].map((i) => `$${X[i]} = 0$: ${$(`${affT(P[i], u[i])} = 0`)}, ${$(`t = ${zT(q(ts[i]))}`)}: ${$(pT(D[i], `D_${i + 1}`))}`),
      };
    },
  },

  ebRichtungParallel: {
    titel: "Richtungsvektoren parallel zur Ebene",
    gen(r) {
      let n, d, vs, drin;
      do {
        ({ n, d } = zufEbene(r, { keineNull: true }));
        vs = []; drin = [];
        for (let k = 0; k < 3; k++) {
          let w = null;
          if (r() < 0.5) for (let j = 0; j < 60 && !w; j++) { const c = zufVek(r, -3, 3); if (qNull(vDot(n, c))) w = c; }
          if (!w) w = zufVek(r, -3, 3);
          vs.push(w); drin.push(qNull(vDot(n, w)));
        }
      } while (!drin.some(Boolean) || drin.every(Boolean));
      const namen = ["a", "b", "c"];
      return {
        text: `Welche der Vektoren ${vs.map((w, i) => $(`\\vec{${namen[i]}} = ${vT(w)}`)).join(", ")} sind Richtungsvektoren von Geraden, die parallel zur Ebene ${$(koordT(n, d))} verlaufen?`,
        schritte: [
          ...vs.map((w, i) => zahlS(`s${i}`, `Skalarprodukt mit ${namen[i]}`, `Berechne $\\vec{n} \\cdot \\vec{${namen[i]}}$.`, `$\\vec{n} \\cdot \\vec{${namen[i]}} =$`, vDot(n, w))),
          teilmengeWahl(r, "par", "Ergebnis", "Welche Vektoren sind parallel zu $E$ (Skalarprodukt 0)?", namen.map((x) => `\\vec{${x}}`), namen.filter((_, i) => drin[i]).map((x) => `\\vec{${x}}`)),
        ],
        weg: [
          `Eine Gerade ist parallel zu $E$, wenn ihr Richtungsvektor senkrecht auf $\\vec{n} = ${vT(n)}$ steht.`,
          ...vs.map((w, i) => `${$(`\\vec{n} \\cdot \\vec{${namen[i]}} = ${skalarWegT(n, w)}`)} ${drin[i] ? "✓" : "✗"}`),
          `Parallel: ${namen.filter((_, i) => drin[i]).map((x) => `$\\vec{${x}}$`).join(", ")}.`,
        ],
      };
    },
  },

  ebDurchstossParam: {
    titel: "Durchstoßpunkt mit einer Ebene in Parameterform",
    gen(r) {
      let A, u, v, n, d, P, w, t, D, erg;
      do {
        ({ u, v, n } = ebeneAusRichtungen(r));
        A = zufPunkt(r, -2, 3); d = vDot(n, A);
        w = zufVek(r, -3, 3);
        t = ganz(r, -3, 3, [0]);
        // Durchstoßpunkt D = A + a·u + b·v
        D = vAdd(A, vAdd(vSkal(ganz(r, -2, 2), u), vSkal(ganz(r, -2, 2), v)));
        P = vSub(D, vSkal(t, w));
        erg = geradeEbene(P, w, n, d);
      } while (qNull(vDot(n, w)) || erg.art !== "schneidet" || P.some((x) => Math.abs(x.z) > 7) || D.some((x) => Math.abs(x.z) > 8) || Math.abs(d.z) > 15);
      const kreuz = vCross(u, v), gek = !vGleich(kreuz, n);
      return {
        text: `Bestimme den Durchstoßpunkt von ${$(geradeT(P, w))} mit ${$(ebeneParamT(A, u, v))}. Wandle $E$ zuerst in eine Koordinatenform um.`,
        schritte: [
          vektorS("n", "Normalenvektor", "Berechne $\\vec{u} \\times \\vec{v}$.", "$\\vec{u} \\times \\vec{v} =$", kreuz),
          zahlS("d", "Rechte Seite", `Setze den Stützpunkt von $E$ ein${gek ? ` (gekürzter Normalenvektor ${$(vT(n))})` : ""}.`, "$d =$", d),
          zahlS("t", "Parameter", `Setze $g$ in ${$(koordT(n, d))} ein und löse nach $t$ auf.`, "$t =$", t, { hinweis: `$${geradeInEbeneT(n, P, w)} = ${zT(d)}$` }),
          punktS("D", "Durchstoßpunkt", "Setze $t$ in $g$ ein.", "$D =$", D),
        ],
        weg: [
          `${$(`\\vec{u} \\times \\vec{v} = ${kreuzWegT(u, v)}`)}${gek ? `, gekürzt ${$(`\\vec{n} = ${vT(n)}`)}` : ""}, ${$(`d = ${einsetzT(n, A)}`)}: ${$(koordT(n, d))}`,
          `$g$ einsetzen: ${$(`${geradeInEbeneT(n, P, w)} = ${zT(d)}`)}, also ${$(`${affT(erg.np, erg.nu)} = ${zT(d)}`)}, ${$(`t = ${zT(q(t))}`)}`,
          `${$(`\\vec{d} = ${vT(P)} ${t < 0 ? MINUS : "+"} ${malT(Math.abs(t), vT(w))} = ${vT(D)}`)}: ${$(pT(D, "D"))}`,
        ],
      };
    },
  },

  ebSchatten: {
    titel: "Schatten einer Mastspitze (Boden und Wand)",
    gen(r) {
      let S, u, tB, tW, wand, B, W;
      do {
        u = [q(ganz(r, 1, 3)), q(ganz(r, -2, 3, [0])), q(-ganz(r, 1, 3))];
        tB = ganz(r, 2, 4);
        S = [q(ganz(r, 1, 5)), q(ganz(r, 1, 5)), qMul(q(tB), qNeg(u[2]))];
        tW = ganz(r, 1, tB - 1);
        wand = qAdd(S[0], qMul(q(tW), u[0]));
        B = vAdd(S, vSkal(tB, u)); W = vAdd(S, vSkal(tW, u));
      } while (tW < 1 || wand.z <= S[0].z || B.some((x) => Math.abs(x.z) > 20));
      const zuerst = tW < tB;
      return {
        text: `Ein Mast hat die Spitze ${$(pT(S, "P"))}. Sonnenlicht fällt in Richtung ${$(vT(u))}. a) Wo wäre der Schatten der Spitze auf dem Boden $x_3 = 0$? b) Bei $x_1 = ${zT(wand)}$ steht eine Hauswand. Wo trifft der Schatten der Spitze wirklich auf?`,
        schritte: [
          zahlS("tB", "Boden: Parameter", "Lichtstrahl $\\vec{x} = \\vec{p} + t \\cdot \\vec{u}$. Setze $x_3 = 0$ und löse nach $t$ auf.", "$t =$", tB, { hinweis: `$${affT(S[2], u[2])} = 0$` }),
          punktS("B", "Boden: Schattenpunkt", "Setze $t$ ein.", "$B =$", B),
          zahlS("tW", "Wand: Parameter", `Setze $x_1 = ${zT(wand)}$ und löse nach $t$ auf.`, "$t =$", tW, { hinweis: `$${affT(S[0], u[0])} = ${zT(wand)}$` }),
          punktS("W", "Wand: Treffpunkt", "Setze $t$ ein.", "$W =$", W),
          wahlS("erst", "Was trifft das Licht zuerst?", "Vergleiche die beiden Parameterwerte: Der kleinere wird zuerst erreicht.", [["wand", "die Wand – der Schatten der Spitze liegt an der Wand"], ["boden", "den Boden – der Schatten der Spitze liegt auf dem Boden"]], zuerst ? "wand" : "boden"),
        ],
        weg: [
          `Lichtstrahl: ${$(geradeT(S, u, { name: "s" }))}`,
          `a) Boden $x_3 = 0$: ${$(`${affT(S[2], u[2])} = 0`)}, ${$(`t = ${tB}`)}: ${$(pT(B, "B"))}`,
          `b) Wand $x_1 = ${zT(wand)}$: ${$(`${affT(S[0], u[0])} = ${zT(wand)}`)}, ${$(`t = ${tW}`)}: ${$(pT(W, "W"))}`,
          zuerst ? `Wegen ${$(`${tW} < ${tB}`)} trifft das Licht zuerst die Wand: Der Schatten der Spitze liegt bei ${$(pT(W, "W"))} an der Wand.` : `Wegen ${$(`${tB} < ${tW}`)} trifft das Licht zuerst den Boden: Der Schatten der Spitze liegt bei ${$(pT(B, "B"))} auf dem Boden; die Wand wird erst dahinter getroffen.`,
        ],
      };
    },
  },

  ebParameterParallel: {
    titel: "Parameter so bestimmen, dass die Gerade parallel zur Ebene ist",
    gen(r) {
      let n, d, P, u, a, k;
      do {
        ({ n, d } = zufEbene(r, { keineNull: true }));
        k = ganz(r, 0, 2);
        u = zufVek(r, -3, 3, { keineNull: true });
        // a so, dass n·u = 0: n_k · a = −(Rest)
        const rest = [0, 1, 2].filter((i) => i !== k).reduce((s, i) => qAdd(s, qMul(n[i], u[i])), q(0));
        a = qDiv(qNeg(rest), n[k]);
        P = zufPunkt(r, -3, 4);
      } while (a.n !== 1 || Math.abs(a.z) > 6 || a.z === 0 || qGleich(vDot(n, P), d));
      u[k] = a;
      const uA = u.map((x, i) => (i === k ? "a" : zT(x)));
      const np = vDot(n, P);
      const rest = [0, 1, 2].filter((i) => i !== k).reduce((s, i) => qAdd(s, qMul(n[i], u[i])), q(0));
      const zusammen = affSumT(rest, [[n[k], "a"]]);
      return {
        text: `Bestimme $a$ so, dass ${$(`g: \\vec{x} = ${vT(P)} + t \\cdot \\spalte{${uA[0]}}{${uA[1]}}{${uA[2]}}`)} parallel zur Ebene ${$(koordT(n, d))} ist. Liegt $g$ dann in $E$?`,
        schritte: [
          zahlS("a", "Parameter a", "Parallel bedeutet $\\vec{n} \\cdot \\vec{u} = 0$. Stelle die Gleichung auf und löse nach $a$ auf.", "$a =$", a, { hinweis: `$${[0, 1, 2].map((i) => (i === k ? malVarT(n[i], "a") : `${kz(n[i])} \\cdot ${kz(u[i])}`)).join(" + ")} = 0$` }),
          zahlS("np", "Stützpunkt prüfen", "Setze den Stützpunkt von $g$ in die linke Seite von $E$ ein.", "$\\vec{n} \\cdot \\vec{p} =$", np),
          wahlS("lage", "Liegt g in E?", `Vergleiche mit der rechten Seite ${$(zT(d))}.`, [["parallel", "nein, $g$ ist echt parallel zu $E$"], ["liegt", "ja, $g$ liegt in $E$"]], "parallel"),
        ],
        weg: [
          `${$(`\\vec{n} \\cdot \\vec{u} = ${[0, 1, 2].map((i) => (i === k ? malVarT(n[i], "a") : `${kz(n[i])} \\cdot ${kz(u[i])}`)).join(" + ")} = ${zusammen} = 0`)}, also ${$(`a = ${zT(a)}`)}`,
          `Stützpunkt: ${$(einsetzT(n, P))} ${$(`\\ne ${zT(d)}`)}: $g$ ist echt parallel zu $E$ und liegt nicht in $E$.`,
        ],
      };
    },
  },

  ebParameterLiegt: {
    titel: "Parameter so bestimmen, dass die Gerade in der Ebene liegt",
    gen(r) {
      let n, d, u, P, k, kWert, np0;
      do {
        ({ n, d } = zufEbene(r, { keineNull: true }));
        u = null;
        for (let j = 0; j < 60 && !u; j++) { const w = zufVek(r, -3, 3); if (qNull(vDot(n, w)) && !vNull(w)) u = w; }
        if (!u) continue;
        k = ganz(r, 0, 2);
        P = zufPunkt(r, -3, 4);
        // n_k · kWert + rest = d
        const rest = [0, 1, 2].filter((i) => i !== k).reduce((s, i) => qAdd(s, qMul(n[i], P[i])), q(0));
        kWert = qDiv(qSub(d, rest), n[k]);
        np0 = rest;
      } while (!u || kWert.n !== 1 || Math.abs(kWert.z) > 6);
      P[k] = kWert;
      const pK = P.map((x, i) => (i === k ? "k" : zT(x)));
      return {
        text: `Für welches $k$ liegt die Gerade ${$(`g_k: \\vec{x} = \\spalte{${pK[0]}}{${pK[1]}}{${pK[2]}} + t \\cdot ${vT(u)}`)} in der Ebene ${$(koordT(n, d))}? Was gilt für alle anderen $k$?`,
        schritte: [
          zahlS("nu", "Richtung prüfen", "Berechne $\\vec{n} \\cdot \\vec{u}$.", "$\\vec{n} \\cdot \\vec{u} =$", 0, { hinweis: "Ist es 0, ist $g_k$ für jedes $k$ parallel zu $E$ oder liegt darin." }),
          zahlS("k", "Parameter k", "Setze den Stützpunkt in $E$ ein und löse nach $k$ auf.", "$k =$", kWert, { hinweis: `$${[0, 1, 2].map((i) => (i === k ? malVarT(n[i], "k") : `${kz(n[i])} \\cdot ${kz(P[i])}`)).join(" + ")} = ${zT(d)}$` }),
          wahlS("sonst", "Alle anderen k", `Was gilt für $k \\ne ${zT(kWert)}$?`, [["parallel", "$g_k$ ist echt parallel zu $E$"], ["schneidet", "$g_k$ schneidet $E$ in einem Punkt"]], "parallel"),
        ],
        weg: [
          `${$(`\\vec{n} \\cdot \\vec{u} = ${skalarWegT(n, u)}`)}: $g_k$ ist für jedes $k$ parallel zu $E$ oder liegt in $E$.`,
          `Stützpunkt einsetzen: ${$(`${[0, 1, 2].map((i) => (i === k ? malVarT(n[i], "k") : `${kz(n[i])} \\cdot ${kz(P[i])}`)).join(" + ")} = ${zT(d)}`)}, also ${$(`${summeT([[n[k], "k"]])} = ${zT(qSub(d, np0))}`)}${Q(n[k]).z === 1 ? "" : `, ${$(`k = ${zT(kWert)}`)}`}`,
          `Für ${$(`k = ${zT(kWert)}`)} liegt $g_k$ in $E$; für alle anderen $k$ ist $g_k$ echt parallel zu $E$.`,
        ],
      };
    },
  },

  ebPunktImDreieck: {
    titel: "Liegt der Punkt im Dreieck?",
    gen(r) {
      let A, B, C, u, v, rr, ss, D, det;
      do {
        A = zufPunkt(r, -2, 4);
        u = zufVek(r, -3, 3).map((x) => qMul(x, q(2))); v = zufVek(r, -3, 3).map((x) => qMul(x, q(2)));
        B = vAdd(A, u); C = vAdd(A, v);
        det = qSub(qMul(u[0], v[1]), qMul(u[1], v[0]));
        rr = eins(r, [q(1, 4), q(1, 2), q(1, 3), q(3, 4), q(2, 3), q(3, 2), q(-1, 2)]);
        ss = eins(r, [q(1, 4), q(1, 2), q(1, 3), q(3, 4), q(2, 3)]);
        D = vAdd(A, vAdd(vSkal(rr, u), vSkal(ss, v)));
      } while (kollinearFaktor(u, v) !== null || qNull(det) || D.some((x) => x.n !== 1 || Math.abs(x.z) > 8) || [B, C].some((P) => P.some((x) => Math.abs(x.z) > 8)));
      const summe = qAdd(rr, ss);
      const drin = qNum(rr) >= 0 && qNum(ss) >= 0 && qNum(summe) <= 1;
      return {
        text: `Das Dreieck $ABC$ mit ${$(pT(A, "A"))}, ${$(pT(B, "B"))}, ${$(pT(C, "C"))} liegt in der Ebene ${$(ebeneParamT(A, u, v))}. Liegt der Punkt ${$(pT(D, "D"))} im Dreieck? Bestimme dazu $r$ und $s$ mit $\\vec{d} = \\vec{a} + r \\cdot \\vec{AB} + s \\cdot \\vec{AC}$.`,
        schritte: [
          zahlS("r", "Parameter r", "Setze $D$ in $E$ ein und löse die ersten beiden Gleichungen.", "$r =$", rr),
          zahlS("s", "Parameter s", "Und $s$?", "$s =$", ss),
          zahlS("sum", "Summe", "Berechne $r + s$.", "$r + s =$", summe),
          wahlS("drin", "Im Dreieck?", "Der Punkt liegt genau dann im Dreieck, wenn $r \\ge 0$, $s \\ge 0$ und $r + s \\le 1$.", JA_NEIN("ja, $D$ liegt im Dreieck", "nein, $D$ liegt in der Ebene, aber außerhalb des Dreiecks"), drin ? "ja" : "nein"),
        ],
        weg: [
          `${$(`${vT(D)} = ${vT(A)} + r \\cdot ${vT(u)} + s \\cdot ${vT(v)}`)}: aus I und II ${$(`r = ${zT(rr)}`)}, ${$(`s = ${zT(ss)}`)}; III: ${$(`${zT(A[2])} + ${kzn(rr)} \\cdot ${kz(u[2])} + ${kzn(ss)} \\cdot ${kz(v[2])} = ${zT(D[2])}`)} ✓`,
          `${$(`r + s = ${zT(summe)}`)}. ${drin ? `Wegen $r, s \\ge 0$ und $r + s \\le 1$ liegt $D$ im Dreieck $ABC$.` : `Die Bedingung $r, s \\ge 0$ und $r + s \\le 1$ ist verletzt: $D$ liegt außerhalb des Dreiecks.`}`,
        ],
      };
    },
  },

  /* ===================== Seite 45: Lage Ebene – Ebene, drei Ebenen ===================== */
  ebEbeneEbene: {
    titel: "Lage zweier Ebenen, Schnittgerade",
    gen(r, variante) {
      const soll = variante || eins(r, ["schneiden", "schneiden", "parallel", "identisch"]);
      let n1, d1, n2, d2, sg, k, f;
      for (let i = 0; i < 400; i++) {
        ({ n: n1, d: d1 } = zufEbene(r, { keineNull: true }));
        if (soll === "schneiden") {
          ({ n: n2, d: d2 } = zufEbene(r));
          if (kollinearFaktor(n1, n2) !== null) continue;
          // freie Koordinate so wählen, dass P und u ganzzahlig sind
          const kand = mische(r, [2, 1, 0]).map((kk) => ({ kk, s: schnittgerade(n1, d1, n2, d2, kk) })).filter((o) => o.s && o.s.P.every((x) => x.n === 1 && Math.abs(x.z) <= 8) && o.s.u.every((x) => x.n === 1 && Math.abs(x.z) <= 6));
          if (!kand.length) continue;
          k = kand[0].kk; sg = kand[0].s;
          break;
        } else {
          f = eins(r, [-2, 2, 3, -1, -3]);
          n2 = vSkal(f, n1); d2 = soll === "identisch" ? qMul(q(f), d1) : qAdd(qMul(q(f), d1), q(ganz(r, -4, 4, [0])));
          if (n2.some((x) => Math.abs(x.z) > 9) || Math.abs(d2.z) > 20) continue;
          break;
        }
      }
      const schritte = [
        wahlS("koll", "Normalenvektoren", `Sind ${$(`\\vec{n}_1 = ${vT(n1)}`)} und ${$(`\\vec{n}_2 = ${vT(n2)}`)} kollinear?`, JA_NEIN("ja – die Ebenen sind parallel oder identisch", "nein – die Ebenen schneiden sich in einer Geraden"), soll === "schneiden" ? "nein" : "ja"),
        wahlS("lage", "Lage", "Wie liegen $E_1$ und $E_2$ zueinander?", LAGE_EE, soll, { hinweis: soll === "schneiden" ? "Nicht kollineare Normalenvektoren: Schnittgerade." : `Vergleiche: Ist $E_2$ genau das ${zT(q(f))}-Fache von $E_1$ – auch die rechte Seite?` }),
      ];
      const weg = [];
      if (soll === "schneiden") {
        const { P, u, i, j } = sg;
        const vars = [X[i], X[j]];
        weg.push(`${$(`\\vec{n}_1 = ${vT(n1)}`)} und ${$(`\\vec{n}_2 = ${vT(n2)}`)} sind nicht kollinear: Die Ebenen schneiden sich in einer Geraden.`);
        weg.push(`Zwei Gleichungen, drei Unbekannte – eine Koordinate ist frei wählbar. Setze $${X[k]} = t$ und bringe sie nach rechts: $\\text{I}\\quad ${summeT([[n1[i], vars[0]], [n1[j], vars[1]]])} = ${affT(d1, qNeg(n1[k]))}$, $\\text{II}\\quad ${summeT([[n2[i], vars[0]], [n2[j], vars[1]]])} = ${affT(d2, qNeg(n2[k]))}$`);
        weg.push(`Lösen (z. B. Additionsverfahren): ${$(`${vars[0]} = ${affT(P[i], u[i])}`)}, ${$(`${vars[1]} = ${affT(P[j], u[j])}`)}, ${$(`${X[k]} = t`)}`);
        weg.push(`Schnittgerade: ${$(geradeT(P, u, { name: "s" }))}. Kontrolle: ${$(`\\vec{n}_1 \\cdot \\vec{u} = ${skalarWegT(n1, u)}`)}, ${$(`\\vec{n}_2 \\cdot \\vec{u} = ${skalarWegT(n2, u)}`)} ✓`);
        schritte.push(punktS("P", "Punkt der Schnittgeraden", `Setze $${X[k]} = t$ und löse das Gleichungssystem nach $${vars[0]}$ und $${vars[1]}$ auf. Gib den Punkt für $t = 0$ an.`, "$P =$", P, { hinweis: `$${summeT([[n1[i], vars[0]], [n1[j], vars[1]]])} = ${affT(d1, qNeg(n1[k]))}$ und $${summeT([[n2[i], vars[0]], [n2[j], vars[1]]])} = ${affT(d2, qNeg(n2[k]))}$` }));
        schritte.push(vektorS("u", "Richtungsvektor", `Der Richtungsvektor besteht aus den Koeffizienten von $t$ (mit $${X[k]} = t$, also ${X[k]}-Komponente 1).`, "$\\vec{u} =$", u, { hinweis: "Kontrolle: $\\vec{u}$ muss senkrecht auf beiden Normalenvektoren stehen – $\\vec{n}_1 \\times \\vec{n}_2$ ist ein Vielfaches davon." }));
      } else {
        weg.push(`${$(`\\vec{n}_2 = ${vT(n2)} = ${malT(f, vT(n1))}`)}: Die Normalenvektoren sind kollinear, die Ebenen sind parallel oder identisch.`);
        if (soll === "identisch") weg.push(`Auch die rechte Seite: ${$(`${zT(d2)} = ${kz(q(f))} \\cdot ${kz(d1)}`)}. Die zweite Gleichung ist das ${zT(q(f))}-Fache der ersten: $E_1$ und $E_2$ sind identisch.`);
        else weg.push(`Rechte Seite: ${$(`${kz(q(f))} \\cdot ${kz(d1)} = ${zT(qMul(q(f), d1))} \\ne ${zT(d2)}`)}. Die Gleichungen widersprechen sich: $E_1$ und $E_2$ sind echt parallel.`);
      }
      return {
        text: `Untersuche die Lage der Ebenen ${$(koordT(n1, d1, { name: "E_1" }))} und ${$(koordT(n2, d2, { name: "E_2" }))}. Bestimme gegebenenfalls die Schnittgerade.`,
        schritte, weg,
      };
    },
  },

  ebSchnittgerade: {
    titel: "Schnittgerade zweier Ebenen",
    gen(r) {
      let n1, d1, n2, d2, sg, k;
      for (let i = 0; i < 500; i++) {
        ({ n: n1, d: d1 } = zufEbene(r, { keineNull: true }));
        ({ n: n2, d: d2 } = zufEbene(r, { keineNull: r() < 0.5 }));
        if (kollinearFaktor(n1, n2) !== null) continue;
        const kand = mische(r, [2, 1, 0]).map((kk) => ({ kk, s: schnittgerade(n1, d1, n2, d2, kk) })).filter((o) => o.s && o.s.P.every((x) => x.n === 1 && Math.abs(x.z) <= 8) && o.s.u.every((x) => x.n === 1 && Math.abs(x.z) <= 6));
        if (!kand.length) continue;
        k = kand[0].kk; sg = kand[0].s; break;
      }
      const { P, u, i, j } = sg;
      const vars = [X[i], X[j]];
      const kreuz = vCross(n1, n2);
      const fk = kollinearFaktor(u, kreuz);
      return {
        text: `Bestimme die Schnittgerade der Ebenen ${$(koordT(n1, d1))} und ${$(koordT(n2, d2, { name: "F" }))}. Kontrolliere den Richtungsvektor mit $\\vec{n}_E \\times \\vec{n}_F$.`,
        schritte: [
          punktS("P", "Punkt für t = 0", `Setze $${X[k]} = t$, löse nach $${vars[0]}$ und $${vars[1]}$ auf und gib den Punkt für $t = 0$ an.`, "$P =$", P, { hinweis: `$${summeT([[n1[i], vars[0]], [n1[j], vars[1]]])} = ${affT(d1, qNeg(n1[k]))}$ und $${summeT([[n2[i], vars[0]], [n2[j], vars[1]]])} = ${affT(d2, qNeg(n2[k]))}$` }),
          vektorS("u", "Richtungsvektor", `Koeffizienten von $t$ (${X[k]}-Komponente 1).`, "$\\vec{u} =$", u),
          vektorS("kreuz", "Kontrolle", "Berechne $\\vec{n}_E \\times \\vec{n}_F$.", "$\\vec{n}_E \\times \\vec{n}_F =$", kreuz, { hinweis: "Er muss ein Vielfaches von $\\vec{u}$ sein." }),
        ],
        weg: [
          `Zwei Gleichungen, drei Unbekannte: Eine Koordinate ist frei. Setze $${X[k]} = t$: $\\text{I}\\quad ${summeT([[n1[i], vars[0]], [n1[j], vars[1]]])} = ${affT(d1, qNeg(n1[k]))}$, $\\text{II}\\quad ${summeT([[n2[i], vars[0]], [n2[j], vars[1]]])} = ${affT(d2, qNeg(n2[k]))}$`,
          `Lösen: ${$(`${vars[0]} = ${affT(P[i], u[i])}`)}, ${$(`${vars[1]} = ${affT(P[j], u[j])}`)}, ${$(`${X[k]} = t`)}`,
          `Schnittgerade: ${$(geradeT(P, u, { name: "s" }))}`,
          `Kontrolle: ${$(`\\vec{n}_E \\times \\vec{n}_F = ${kreuzWegT(n1, n2)} = ${malT(qDiv(q(1), fk), vT(u))}`)} ✓ (Vielfaches von $\\vec{u}$)`,
        ],
      };
    },
  },

  ebDreiEbenenPunkt: {
    titel: "Gemeinsamer Punkt dreier Ebenen (LGS 3×3)",
    gen(r) {
      let A, b, S, g;
      do {
        S = zufPunkt(r, -3, 4);
        A = [zufVek(r, -3, 3, { keineNull: r() < 0.5 }), zufVek(r, -3, 3), zufVek(r, -3, 3)];
        b = A.map((z) => vDot(z, S));
        g = gauss(A, b);
      } while (g.art !== "eine" || A.some((z) => z.filter(qNull).length > 1) || b.some((x) => Math.abs(x.z) > 15) || g.schritte.length > 4);
      return {
        text: `Bestimme den gemeinsamen Punkt der drei Ebenen ${A.map((z, i) => $(koordT(z, b[i], { name: `E_${i + 1}` }))).join(", ")}.`,
        schritte: [
          wahlS("wie", "Vorgehen", "Was ist zu tun?", [["lgs", "Die drei Gleichungen bilden ein LGS mit drei Unbekannten – mit Gauß lösen."], ["kreuz", "Die drei Normalenvektoren addieren."]], "lgs"),
          zahlS("x1", "Erste Koordinate", "Löse das LGS (z. B. mit dem Gauß-Verfahren).", "$x_1 =$", S[0]),
          zahlS("x2", "Zweite Koordinate", "", "$x_2 =$", S[1]),
          zahlS("x3", "Dritte Koordinate", "", "$x_3 =$", S[2]),
        ],
        weg: [
          `LGS: ${lgsZeilen(A, b).join(", ")}`,
          ...g.schritte,
          `Rückwärts einsetzen: ${$(`x_3 = ${zT(S[2])}`)}, ${$(`x_2 = ${zT(S[1])}`)}, ${$(`x_1 = ${zT(S[0])}`)}`,
          `Gemeinsamer Punkt ${$(pT(S, "S"))} – Probe in $E_1$: ${$(einsetzT(A[0], S))} ✓`,
        ],
      };
    },
  },

  ebDreiEbenenC: {
    titel: "Drei Ebenen mit Parameter: Schnittgerade oder Prisma",
    gen(r) {
      // E1, E2 schneiden sich; E3 = a·E1 + b·E2 (Büschel) mit c = richtiger Wert bzw. anderer
      let n1, d1, n2, d2, a, bb, n3, d3, sg, k;
      for (let i = 0; i < 500; i++) {
        ({ n: n1, d: d1 } = zufEbene(r, { keineNull: true }));
        ({ n: n2, d: d2 } = zufEbene(r));
        if (kollinearFaktor(n1, n2) !== null) continue;
        a = eins(r, [1, 1, 2, -1]); bb = eins(r, [1, 1, -1, 2]);
        n3 = vAdd(vSkal(a, n1), vSkal(bb, n2)); d3 = qAdd(qMul(q(a), d1), qMul(q(bb), d2));
        if (vNull(n3) || n3.some((x) => Math.abs(x.z) > 9) || Math.abs(d3.z) > 20) continue;
        const kand = mische(r, [2, 1, 0]).map((kk) => ({ kk, s: schnittgerade(n1, d1, n2, d2, kk) })).filter((o) => o.s && o.s.P.every((x) => x.n === 1 && Math.abs(x.z) <= 8) && o.s.u.every((x) => x.n === 1 && Math.abs(x.z) <= 6));
        if (!kand.length) continue;
        k = kand[0].kk; sg = kand[0].s; break;
      }
      const c2 = qAdd(d3, q(ganz(r, -3, 3, [0])));
      const { P, u } = sg;
      const kombi = `${malRoemT(a, 0)} ${bb < 0 ? MINUS : "+"} ${malRoemT(Math.abs(bb), 1)}`;
      return {
        text: `Gegeben sind ${$(koordT(n1, d1, { name: "E_1" }))}, ${$(koordT(n2, d2, { name: "E_2" }))} und ${$(`E_3: ${summeT(n3.map((x, i) => [x, X[i]]))} = c`)}. Untersuche die gemeinsamen Punkte für $c = ${zT(d3)}$ und für $c = ${zT(c2)}$. Beschreibe beide Fälle geometrisch.`,
        schritte: [
          wahlS("kombi", "Zusammenhang", `Wie entsteht die linke Seite von $E_3$ aus $E_1$ und $E_2$?`, mische(r, [["richtig", $(kombi)], ["falsch1", $(`${malRoemT(a, 0)} ${bb < 0 ? "+" : MINUS} ${malRoemT(Math.abs(bb), 1)}`)], ["falsch2", $(`${malRoemT(a + 1, 0)} ${bb < 0 ? MINUS : "+"} ${malRoemT(Math.abs(bb), 1)}`)]]), "richtig"),
          zahlS("c", "Verträglicher Wert", `Welche rechte Seite ergibt ${$(kombi)}? Für dieses $c$ ist $E_3$ überflüssig.`, "$c =$", d3),
          wahlS("fall1", `Fall c = ${zT(d3)}`, "Wie liegen die drei Ebenen dann?", [["gerade", "Sie haben eine gemeinsame Schnittgerade (Ebenenbüschel)."], ["punkt", "Sie haben genau einen gemeinsamen Punkt."], ["prisma", "Keine gemeinsamen Punkte (Prisma)."]], "gerade"),
          wahlS("fall2", `Fall c = ${zT(c2)}`, "Und für diesen Wert?", [["prisma", "Keine gemeinsamen Punkte: Die Ebenen bilden ein Prisma."], ["gerade", "Eine gemeinsame Schnittgerade."], ["punkt", "Genau ein gemeinsamer Punkt."]], "prisma"),
          punktS("P", "Punkt der Schnittgeraden", `Für $c = ${zT(d3)}$: Setze $${X[k]} = t$ in $E_1$ und $E_2$ und gib den Punkt der Schnittgeraden für $t = 0$ an.`, "$P =$", P),
          vektorS("u", "Richtungsvektor", "Koeffizienten von $t$.", "$\\vec{u} =$", u),
        ],
        weg: [
          `${$(kombi)} ergibt ${$(`${summeT(n3.map((x, i) => [x, X[i]]))} = ${zT(d3)}`)}: Die linke Seite von $E_3$ ist eine Kombination von $E_1$ und $E_2$.`,
          `$c = ${zT(d3)}$: $E_3$ folgt aus $E_1$ und $E_2$, ist also überflüssig. Es bleibt die Schnittgerade von $E_1$ und $E_2$ – mit $${X[k]} = t$: ${$(geradeT(P, u, { name: "s" }))}. Alle drei Ebenen gehen durch diese Gerade (Ebenenbüschel).`,
          `$c = ${zT(c2)}$: ${$(`${zT(d3)} = ${zT(c2)}`)} ist ein Widerspruch, das LGS hat keine Lösung. Keine zwei Normalenvektoren sind kollinear, je zwei Ebenen schneiden sich in parallelen Geraden: Prisma.`,
        ],
      };
    },
  },

  ebDreiEbenenAB: {
    titel: "Für welche a, b: ein, kein, unendlich viele gemeinsame Punkte?",
    gen(r) {
      // E1, E2 fest, E3: n3 mit Parameter a in Komponente k, rechte Seite b. E1 + E2 (oder Kombination) eliminiert eine Variable.
      let n1, d1, n2, d2, k, m, kombiN, kombiD, f, n3, aWert, bWert;
      for (let i = 0; i < 600; i++) {
        ({ n: n1, d: d1 } = zufEbene(r, { keineNull: true }));
        ({ n: n2, d: d2 } = zufEbene(r, { keineNull: true }));
        if (kollinearFaktor(n1, n2) !== null) continue;
        // Variable m, die bei I + f·II verschwindet (f = ±1)
        const opt = [0, 1, 2].flatMap((mm) => [1, -1].map((ff) => ({ mm, ff }))).filter(({ mm, ff }) => qNull(qAdd(n1[mm], qMul(q(ff), n2[mm]))));
        if (!opt.length) continue;
        ({ mm: m, ff: f } = eins(r, opt));
        kombiN = vAdd(n1, vSkal(f, n2)); kombiD = qAdd(d1, qMul(q(f), d2));
        if (vNull(kombiN) || kombiN.filter(qNull).length !== 1) continue;
        // E3: Vielfaches g der Kombination, Komponente k (≠ m) durch a ersetzt
        const g = eins(r, [1, 1, 2, -1]);
        n3 = vSkal(g, kombiN);
        const ks = [0, 1, 2].filter((j) => j !== m);
        k = eins(r, ks);
        aWert = n3[k]; bWert = qMul(q(g), kombiD);
        if (n3.some((x) => Math.abs(x.z) > 9) || Math.abs(bWert.z) > 20) continue;
        break;
      }
      const n3T = n3.map((x, i) => (i === k ? "a" : null));
      const linksE3 = summeT([0, 1, 2].map((i) => (i === k ? [1, `a \\cdot ${X[i]}`] : [n3[i], X[i]])));
      const kombiText = `${malRoemT(1, 0)} ${f < 0 ? MINUS : "+"} ${malRoemT(1, 1)}`;
      const other = [0, 1, 2].filter((i) => i !== k && !qNull(n3[i]))[0];
      return {
        text: `Für welche $a$ und $b$ haben die Ebenen ${$(koordT(n1, d1, { name: "E_1" }))}, ${$(koordT(n2, d2, { name: "E_2" }))} und ${$(`E_3: ${linksE3} = b`)} a) genau einen, b) keinen, c) unendlich viele gemeinsame Punkte?`,
        schritte: [
          wahlS("elim", "Variable eliminieren", `Welche Kombination von I und II enthält kein $${X[m]}$ mehr?`, mische(r, [["richtig", $(kombiText)], ["falsch", $(`${malRoemT(1, 0)} ${f < 0 ? "+" : MINUS} ${malRoemT(1, 1)}`)]]), "richtig"),
          zahlS("a", "Kritisches a", `${$(kombiText)} ergibt ${$(`${summeT(kombiN.map((x, i) => [x, X[i]]))} = ${zT(kombiD)}`)}. Für welches $a$ hat $E_3$ dieselbe linke Seite (bis auf einen Faktor)?`, "$a =$", aWert, { hinweis: `Vergleiche die Koeffizienten von $${X[other]}$: Faktor ${zT(qDiv(n3[other], kombiN[other]))}.` }),
          zahlS("b", "Passendes b", "Für welches $b$ ist $E_3$ dann sogar dieselbe Gleichung?", "$b =$", bWert),
          wahlS("a1", "a) genau ein Punkt", "Wann gibt es genau einen gemeinsamen Punkt?", [["aNe", `$a \\ne ${zT(aWert)}$ (jedes $b$)`], ["aEq", `$a = ${zT(aWert)}$ und $b \\ne ${zT(bWert)}$`], ["beide", `$a = ${zT(aWert)}$ und $b = ${zT(bWert)}$`]], "aNe"),
          wahlS("a2", "b) kein Punkt", "Wann gibt es keinen gemeinsamen Punkt?", [["aEq", `$a = ${zT(aWert)}$ und $b \\ne ${zT(bWert)}$`], ["aNe", `$a \\ne ${zT(aWert)}$`], ["beide", `$a = ${zT(aWert)}$ und $b = ${zT(bWert)}$`]], "aEq"),
          wahlS("a3", "c) unendlich viele Punkte", "Wann gibt es unendlich viele gemeinsame Punkte?", [["beide", `$a = ${zT(aWert)}$ und $b = ${zT(bWert)}$`], ["aEq", `$a = ${zT(aWert)}$ und $b \\ne ${zT(bWert)}$`], ["aNe", `$a \\ne ${zT(aWert)}$`]], "beide"),
        ],
        weg: [
          `${$(kombiText)}: ${$(`${summeT(kombiN.map((x, i) => [x, X[i]]))} = ${zT(kombiD)}`)} – diese Gleichung folgt aus $E_1$ und $E_2$.`,
          `Das ${zT(qDiv(n3[other], kombiN[other]))}-Fache davon: ${$(`${summeT(n3.map((x, i) => [x, X[i]]))} = ${zT(bWert)}`)}. Vergleich mit $E_3$: gleiche linke Seite genau für $a = ${zT(aWert)}$.`,
          `a) $a \\ne ${zT(aWert)}$: $E_3$ liefert eine neue Bedingung – genau ein gemeinsamer Punkt. b) $a = ${zT(aWert)}$, $b \\ne ${zT(bWert)}$: Widerspruch, kein gemeinsamer Punkt (Prisma). c) $a = ${zT(aWert)}$, $b = ${zT(bWert)}$: $E_3$ ist überflüssig, gemeinsame Schnittgerade (Ebenenbüschel).`,
        ],
      };
    },
  },

  ebBueschelUrsprung: {
    titel: "Ebenenbüschel: Ebene durch den Ursprung",
    gen(r) {
      let n1, d1, n2, d2, kWert, n, sg;
      for (let i = 0; i < 500; i++) {
        ({ n: n1, d: d1 } = zufEbene(r, { keineNull: true }));
        ({ n: n2, d: d2 } = zufEbene(r));
        if (kollinearFaktor(n1, n2) !== null || qNull(d1) || qNull(d2)) continue;
        kWert = qDiv(qNeg(d1), d2);
        if (kWert.n !== 1 || Math.abs(kWert.z) > 4) continue;
        n = vAdd(n1, vSkal(kWert, n2));
        if (vNull(n) || n.some((x) => Math.abs(x.z) > 12)) continue;
        sg = schnittgerade(n1, d1, n2, d2, 2) || schnittgerade(n1, d1, n2, d2, 1) || schnittgerade(n1, d1, n2, d2, 0);
        if (!sg) continue;
        break;
      }
      const klam1 = `(${summeT(n1.map((x, i) => [x, X[i]]))} ${d1.z < 0 ? "+" : MINUS} ${zT(q(Math.abs(d1.z), d1.n))})`;
      const klam2 = `(${summeT(n2.map((x, i) => [x, X[i]]))} ${d2.z < 0 ? "+" : MINUS} ${zT(q(Math.abs(d2.z), d2.n))})`;
      return {
        text: `Die Ebenen ${$(koordT(n1, d1, { name: "E_1" }))} und ${$(koordT(n2, d2, { name: "E_2" }))} schneiden sich in einer Geraden $s$. Jede Ebene ${$(`E_k: ${klam1} + k \\cdot ${klam2} = 0`)} enthält $s$. Für welches $k$ geht $E_k$ durch den Ursprung? Gib diese Ebene in Koordinatenform an.`,
        schritte: [
          wahlS("warum", "Warum enthält jede E_k die Gerade s?", "Welche Begründung stimmt?", [["null", "Für jeden Punkt von $s$ sind beide Klammern 0, also ist die ganze Summe 0 – für jedes $k$."], ["kreuz", "Weil die Normalenvektoren von $E_1$ und $E_2$ senkrecht aufeinander stehen."]], "null"),
          zahlS("k", "Parameter k", "Setze den Ursprung $O(0 \\mid 0 \\mid 0)$ ein und löse nach $k$ auf.", "$k =$", kWert, { hinweis: `$${zT(qNeg(d1))} + k \\cdot ${kz(qNeg(d2))} = 0$` }),
          vektorS("n", "Normalenvektor", "Setze $k$ ein und fasse die Koeffizienten zusammen.", "$\\vec{n} =$", n),
        ],
        weg: [
          `Jeder Punkt von $s$ erfüllt beide Gleichungen, also sind beide Klammern 0 und die Summe ist 0: $s$ liegt in jeder Ebene $E_k$.`,
          `Ursprung einsetzen: ${$(`${zT(qNeg(d1))} + k \\cdot ${kz(qNeg(d2))} = 0`)}, also ${$(`k = ${zT(kWert)}`)}`,
          `${$(`${klam1} ${kWert.z < 0 ? MINUS : "+"} ${Math.abs(kWert.z) === 1 ? klam2 : `${Math.abs(kWert.z)} \\cdot ${klam2}`} = 0`)} ergibt ${$(koordT(n, 0, { name: "E_k" }))}`,
        ],
      };
    },
  },

  /* ===================== Seite 46: Training V ===================== */
  ebDreiPunkteVoll: {
    titel: "Ebene durch drei Punkte: Parameterform, Koordinatenform, Punktprobe",
    gen(r) {
      let A, B, C, u, v, n, d, P1, P2, drin1, drin2;
      do {
        ({ A, B, C, u, v, n } = dreiPunkte(r));
        d = vDot(n, A);
        P1 = vAdd(A, vAdd(vSkal(ganz(r, -2, 2), u), vSkal(ganz(r, -2, 2), v)));
        P2 = zufPunkt(r, -3, 4);
        drin1 = qGleich(vDot(n, P1), d); drin2 = qGleich(vDot(n, P2), d);
      } while (Math.abs(d.z) > 15 || P1.some((x) => Math.abs(x.z) > 8) || drin2 || !drin1);
      const kreuz = vCross(u, v), gek = !vGleich(kreuz, n);
      return {
        text: `Stelle für die Ebene durch ${$(pT(A, "A"))}, ${$(pT(B, "B"))} und ${$(pT(C, "C"))} eine Parameterform und eine Koordinatenform auf. Liegen ${$(pT(P1, "P"))} und ${$(pT(P2, "Q"))} in der Ebene?`,
        schritte: [
          vektorS("u", "Spannvektor AB", "Berechne $\\vec{AB}$.", "$\\vec{AB} =$", u),
          vektorS("v", "Spannvektor AC", "Berechne $\\vec{AC}$.", "$\\vec{AC} =$", v),
          vektorS("n", "Normalenvektor", "Berechne $\\vec{AB} \\times \\vec{AC}$.", "$\\vec{AB} \\times \\vec{AC} =$", kreuz),
          zahlS("d", "Rechte Seite", `Setze $A$ ein${gek ? ` (gekürzter Normalenvektor ${$(vT(n))})` : ""}.`, "$d =$", d),
          zahlS("p", "Punkt P einsetzen", "Setze $P$ in die linke Seite der Koordinatenform ein.", "$\\vec{n} \\cdot \\vec{p} =$", vDot(n, P1)),
          zahlS("q", "Punkt Q einsetzen", "Setze $Q$ ein.", "$\\vec{n} \\cdot \\vec{q} =$", vDot(n, P2)),
          wahlS("erg", "Ergebnis", "Welche Punkte liegen in $E$?", [["P", "nur $P$"], ["Q", "nur $Q$"], ["PQ", "$P$ und $Q$"], ["keiner", "keiner"]], "P"),
        ],
        weg: [
          `Parameterform: ${$(ebeneParamT(A, u, v))}`,
          `${$(`\\vec{AB} \\times \\vec{AC} = ${kreuzWegT(u, v)}`)}${gek ? `, gekürzt ${$(`\\vec{n} = ${vT(n)}`)}` : ""}; ${$(`d = ${einsetzT(n, A)}`)}: ${$(koordT(n, d))}`,
          `$P$: ${$(einsetzT(n, P1))} $= ${zT(d)}$ ✓ – $P$ liegt in $E$. $Q$: ${$(einsetzT(n, P2))} $\\ne ${zT(d)}$ ✗ – $Q$ liegt nicht in $E$.`,
        ],
      };
    },
  },

  ebSpurpunkteVoll: {
    titel: "Spurpunkte, Parameterform und Pyramidenvolumen",
    gen(r) {
      let n, d;
      do {
        n = zufVek(r, 1, 6, { keineNull: true });
        d = q(n.reduce((m, x) => kgV(m, x.z), 1));
      } while (d.z > 24 || n.reduce((m, x) => ggT(m, x.z), 0) !== 1);
      const S = [0, 1, 2].map((i) => { const P = [q(0), q(0), q(0)]; P[i] = qDiv(d, n[i]); return P; });
      const u = vSub(S[1], S[0]), v = vSub(S[2], S[0]);
      const G = qMul(q(1, 2), qMul(S[0][0], S[1][1])), V = qMul(q(1, 3), qMul(G, S[2][2]));
      return {
        text: `Bestimme die Spurpunkte von ${$(koordT(n, d))}. Gib eine Parameterform von $E$ an (mit den Spurpunkten). Welches Volumen hat die Pyramide aus dem Spurdreieck und dem Ursprung?`,
        schritte: [
          ...S.map((P, i) => punktS(`s${i + 1}`, `Spurpunkt S_${i + 1}`, `Setze die anderen beiden Koordinaten 0.`, `$S_${i + 1} =$`, P)),
          vektorS("u", "Spannvektor", "Berechne $\\vec{S_1S_2}$.", "$\\vec{S_1S_2} =$", u),
          vektorS("v", "Zweiter Spannvektor", "Berechne $\\vec{S_1S_3}$.", "$\\vec{S_1S_3} =$", v),
          zahlS("V", "Volumen", "Grundfläche $\\frac{1}{2} s_1 s_2$ in der $x_1x_2$-Ebene, Höhe $s_3$.", "$V =$", V, { fehler: [{ wert: qNum(qMul(G, S[2][2])), text: "Pyramide: $V = \\frac{1}{3} \\cdot G \\cdot h$." }] }),
        ],
        weg: [
          `Spurpunkte: ${S.map((P, i) => $(pT(P, `S_${i + 1}`))).join(", ")}`,
          `Parameterform mit $S_1$ als Stützpunkt: ${$(ebeneParamT(S[0], u, v))}`,
          `${$(`V = \\frac{1}{3} \\cdot \\frac{1}{2} \\cdot ${zT(S[0][0])} \\cdot ${zT(S[1][1])} \\cdot ${zT(S[2][2])} = ${zT(V)}`)}`,
        ],
      };
    },
  },

  ebDreiEbenenWechsel: {
    titel: "Drei Ebenen: Schnittpunkt – und Schnittgerade nach Austausch",
    gen(r) {
      let A, b, S, g, sg, k;
      for (let i = 0; i < 600; i++) {
        S = zufPunkt(r, -3, 4);
        A = [zufVek(r, -3, 3, { keineNull: true }), zufVek(r, -3, 3), zufVek(r, -3, 3)];
        b = A.map((z) => vDot(z, S));
        g = gauss(A, b);
        if (g.art !== "eine" || b.some((x) => Math.abs(x.z) > 15) || A.some((z) => z.filter(qNull).length > 1) || g.schritte.length > 4) continue;
        const kand = mische(r, [2, 1, 0]).map((kk) => ({ kk, s: schnittgerade(A[0], b[0], A[1], b[1], kk) })).filter((o) => o.s && o.s.P.every((x) => x.n === 1 && Math.abs(x.z) <= 8) && o.s.u.every((x) => x.n === 1 && Math.abs(x.z) <= 8));
        if (!kand.length) continue;
        k = kand[0].kk; sg = kand[0].s; break;
      }
      const n3 = vAdd(A[0], A[1]), d3 = qAdd(b[0], b[1]);
      const { P, u } = sg;
      // Schnittgerade durch S legen (S liegt auf ihr): Stützpunkt S
      return {
        text: `Untersuche die gemeinsamen Punkte von ${A.map((z, i) => $(koordT(z, b[i], { name: `E_${i + 1}` }))).join(", ")}. Was ändert sich, wenn man die dritte Gleichung durch ${$(koordT(n3, d3, { name: "E_3'" }))} ersetzt?`,
        schritte: [
          punktS("S", "Schnittpunkt", "Löse das LGS aus den drei Gleichungen.", "$S =$", S),
          wahlS("neu", "Neue dritte Gleichung", "Wie hängt $E_3'$ mit $E_1$ und $E_2$ zusammen?", mische(r, [["summe", "$E_3'$ ist $\\text{I} + \\text{II}$ – sie folgt aus den ersten beiden."], ["diff", "$E_3'$ ist $\\text{I} - \\text{II}$."], ["unab", "$E_3'$ ist unabhängig von $E_1$ und $E_2$."]]), "summe"),
          wahlS("lage", "Lage", "Was folgt für die gemeinsamen Punkte von $E_1$, $E_2$, $E_3'$?", [["gerade", "unendlich viele: die Schnittgerade von $E_1$ und $E_2$"], ["punkt", "weiterhin genau ein Punkt"], ["keine", "keine gemeinsamen Punkte"]], "gerade"),
          vektorS("u", "Richtungsvektor der Schnittgeraden", `Setze $${X[k]} = t$ in $E_1$ und $E_2$ und löse: Welcher Richtungsvektor ergibt sich (${X[k]}-Komponente 1)?`, "$\\vec{u} =$", u, { hinweis: "Kontrolle: $\\vec{u}$ steht senkrecht auf $\\vec{n}_1$ und $\\vec{n}_2$." }),
        ],
        weg: [
          `LGS: ${lgsZeilen(A, b).join(", ")}`,
          ...g.schritte,
          `Lösung ${$(pT(S, "S"))}: genau ein gemeinsamer Punkt.`,
          `${$(`\\text{I} + \\text{II}`)} ergibt ${$(koordT(n3, d3, { name: "" }))}: Die neue dritte Gleichung folgt aus den ersten beiden und bringt keine neue Bedingung. Es bleibt die Schnittgerade von $E_1$ und $E_2$.`,
          `Mit $${X[k]} = t$: ${$(geradeT(P, u, { name: "s" }))} – sie geht durch $S$ (für $t = ${zT(S[k])}$).`,
        ],
      };
    },
  },

  ebStrahl: {
    titel: "Lichtstrahl trifft Dach und Boden",
    gen(r) {
      let L, u, tD, tB, nD, dD, D, B;
      for (let i = 0; i < 600; i++) {
        tB = ganz(r, 2, 4);
        u = [q(ganz(r, 1, 3)), q(ganz(r, 0, 2)), q(-ganz(r, 1, 2))];
        L = [q(ganz(r, -2, 2)), q(ganz(r, -2, 2)), qMul(q(tB), qNeg(u[2]))];
        tD = eins(r, [q(1), q(3, 2), q(2), q(1, 2), q(5, 2), q(3)]);
        if (qGleich(tD, q(tB))) continue;
        D = vAdd(L, vSkal(tD, u));
        nD = [q(ganz(r, 1, 2)), q(0), q(ganz(r, 1, 3))];
        if (r() < 0.3) nD[1] = q(ganz(r, 1, 2));
        if (qNull(vDot(nD, u))) continue;
        dD = vDot(nD, D);
        if (dD.n !== 1 || Math.abs(dD.z) > 20 || D.some((x) => Math.abs(qNum(x)) > 12)) continue;
        B = vAdd(L, vSkal(tB, u));
        break;
      }
      const erst = qNum(tD) < tB;
      return {
        text: `Eine Lampe in ${$(pT(L, "L"))} strahlt in Richtung ${$(vT(u))}. Eine schräge Dachfläche liegt in der Ebene ${$(koordT(nD, dD))}, der Boden ist $x_3 = 0$. Berechne, wo der Strahl beide Ebenen trifft. Was trifft er zuerst?`,
        schritte: [
          zahlS("tD", "Dach: Parameter", "Setze den Strahl $\\vec{x} = \\vec{l} + t \\cdot \\vec{u}$ in $E$ ein und löse nach $t$ auf.", "$t =$", tD, { hinweis: `$${geradeInEbeneT(nD, L, u)} = ${zT(dD)}$` }),
          punktS("D", "Dach: Treffpunkt", "Setze $t$ ein.", "$D =$", D),
          zahlS("tB", "Boden: Parameter", "Setze $x_3 = 0$ und löse nach $t$ auf.", "$t =$", tB, { hinweis: `$${affT(L[2], u[2])} = 0$` }),
          punktS("B", "Boden: Treffpunkt", "Setze $t$ ein.", "$B =$", B),
          wahlS("erst", "Zuerst", "Was trifft der Strahl zuerst (kleinerer Parameter)?", [["dach", "das Dach"], ["boden", "den Boden"]], erst ? "dach" : "boden"),
        ],
        weg: [
          `Strahl: ${$(geradeT(L, u, { name: "s" }))}`,
          `Dach: ${$(`${geradeInEbeneT(nD, L, u)} = ${zT(dD)}`)}, also ${$(`${affT(vDot(nD, L), vDot(nD, u))} = ${zT(dD)}`)}, ${$(`t = ${zT(tD)}`)}: ${$(pT(D, "D", { dez: true }))}`,
          `Boden: ${$(`${affT(L[2], u[2])} = 0`)}, ${$(`t = ${tB}`)}: ${$(pT(B, "B"))}`,
          erst ? `Wegen ${$(`${zT(tD)} < ${tB}`)} trifft der Strahl zuerst das Dach.` : `Wegen ${$(`${tB} < ${zT(tD)}`)} trifft der Strahl zuerst den Boden.`,
        ],
      };
    },
  },
};

/* Buchseite-Aufgabennummer → Aufgabentyp (optional „typ:variante“) */
export const BUCH_3 = {
  // 18 Ebenen in Parameterform (S. 37)
  "37-1": "ebParamDreiPunkte", "37-2": "ebPunktprobeParam", "37-3": "ebDreiPunkteFest", "37-4": "ebPunktGerade", "37-5": "ebZweiGeradenSchnitt", "37-6": "ebZweiGeradenParallel", "37-7": "ebParameterA",
  // 19 Normalenform und Koordinatenform (S. 39)
  "39-1": "ebNormalZuKoord", "39-2": "ebKoordAblesen", "39-3": "ebPunktprobeKoord", "39-4": "ebKoordDreiPunkte", "39-5": "ebKoordAblesen", "39-6": "ebParallelDurchPunkt", "39-7": "ebMittelsenkrecht",
  // 20 Spurpunkte und Umwandlungen (S. 41)
  "41-1": "ebSpurpunkte", "41-2": "ebParamZuKoord", "41-3": "ebKoordZuParam", "41-4": "ebBesondereLage", "41-5": "ebAusSpurpunkten", "41-7": "ebPyramide", "41-8": "ebParallelAchse",
  // 21 Gerade und Ebene (S. 43)
  "43-1": "ebGeradeEbene", "43-2": "ebKoordEbenenDurchstoss", "43-3": "ebRichtungParallel", "43-4": "ebDurchstossParam", "43-5": "ebSchatten", "43-6": "ebParameterParallel", "43-7": "ebPunktImDreieck", "43-8": "ebParameterLiegt",
  // 22 Ebene und Ebene (S. 45)
  "45-1": "ebEbeneEbene", "45-2": "ebSchnittgerade", "45-3": "ebDreiEbenenPunkt", "45-4": "ebDreiEbenenC", "45-5": "ebDreiEbenenAB", "45-7": "ebBueschelUrsprung",
  // Training V (S. 46)
  "46-T1": "ebDreiPunkteVoll", "46-T2": "ebNormalZuKoord:ursprung", "46-T3": "ebPunktprobeParam", "46-T4": "ebSpurpunkteVoll", "46-T5": "ebGeradeEbene", "46-T6": "ebSchnittgerade", "46-T7": "ebDreiEbenenWechsel", "46-T8": "ebStrahl",
};
