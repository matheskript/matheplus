/* ======================================================================
   diffAufgaben2.js – Aufgabentypen zu Kapitel III und IV des Kurses
   Differentialrechnung (Ableitungsregeln, Anwenden: Tangente, Normale,
   waagrechte Tangenten, Sachaufgaben).
   Ableiten: Vorlagen je Regel liefern f, f′ (fertig vereinfacht, Regel A5),
   Rechenweg und typische Denkfehler als Terme.
   ====================================================================== */
import {
  q, qAdd, qSub, qMul, qDiv, qNeg, qNum, Q, alsQ, ganz, eins, vz, MINUS,
  zT, dezT, zTxt, zahlT, varT, potT, monomT, polyT, summeT, malT, linT, bruchT, negT, hochT, klammerT, wurzelT, fnT, expT, konstT,
  zahlS, zahlR, wahlS, termS, listeS, stammS,
} from "./diffKern.js";
import { alsQ2, P, kz, quot, psf } from "./diffAufgaben1.js";

const $ = (t) => `$${t}$`;
/* Dezimalbrüche wie 0,1 oder 2,5 bleiben Dezimalzahlen; ½, ⅔ … bleiben Brüche */
const istDez = (c) => [4, 5, 10, 20, 25, 50, 100].includes(Q(c).n);
const dzo = (c) => (istDez(c) ? { dez: true } : undefined);
const gl = (links, t) => `$${links} = ${t.tex}$`;
const neu = (f, d, weg, o = {}) => ({ f, d, weg, fehler: o.fehler || [], bereich: o.bereich, ohne: o.ohne });

/* ===================== Ableiten: Vorlagen je Regel ===================== */
export const VORLAGEN = {
  faktor: [
    (r) => {
      const c = eins(r, [q(7), q(-2), q(1, 2), q(-1), q(2, 3), q(1, 4), q(-1, 10), q(3), q(-4), q(5, 2)]);
      const n = eins(r, [2, 2, 1]);
      const f = monomT(c, n, "x", dzo(c)), d = monomT(qMul(c, q(n)), n - 1, "x", dzo(c));
      return neu(f, d, [n === 2 ? `$f'(x) = ${zT(c, dzo(c))} \\cdot 2x = ${d.tex}$` : `Die Ableitung von $x$ ist 1, also $f'(x) = ${d.tex}$.`], {
        fehler: n === 2 ? [
          { js: () => 2 * qNum(c), text: "Aus $x^2$ wird $2x$ – das $x$ bleibt stehen." },
          { js: (x) => 2 * qNum(c) * x * x, text: "Die Hochzahl wird um 1 kleiner: Aus $x^2$ wird $2x$, nicht $2x^2$." },
        ] : [],
      });
    },
  ],
  summe: [
    (r) => {
      const a = eins(r, [q(4), q(-1), q(1, 2), q(2), q(-3), q(1)]), b = q(ganz(r, -6, 6, [0])), c = q(ganz(r, -8, 8));
      const f = polyT([[a, 2], [b, 1], [c, 0]], "x", dzo(a)), d = polyT([[qMul(q(2), a), 1], [b, 0]]);
      return neu(f, d, [`Summand für Summand: $f'(x) = ${d.tex}$${c.z ? " – die Konstante fällt weg" : ""}`], {
        fehler: c.z ? [{ js: (x) => d.js(x) + qNum(c), text: "Die Ableitung einer Konstanten ist 0 – sie fällt weg." }] : [],
      });
    },
    (r) => {
      const p = q(ganz(r, -4, 4, [0]));
      const innen = linT(1, p);
      const f = hochT(innen, 2), aus = polyT([[1, 2], [qMul(q(2), p), 1], [qMul(p, p), 0]]), d = polyT([[2, 1], [qMul(q(2), p), 0]]);
      return neu(f, d, [`Erst ausmultiplizieren: $${f.tex} = ${aus.tex}$`, `$f'(x) = ${d.tex}$`], { fehler: [{ js: (x) => 2 * x, text: "Erst ausmultiplizieren (binomische Formel): Das Mittelglied liefert auch einen Beitrag." }] });
    },
    (r) => {
      const p = q(ganz(r, 1, 6));
      const f = malT(varT(), klammerT(linT(1, qNeg(p)))), aus = polyT([[1, 2], [qNeg(p), 1]]), d = polyT([[2, 1], [qNeg(p), 0]]);
      return neu(f, d, [`Erst ausmultiplizieren: $${f.tex} = ${aus.tex}$`, `$f'(x) = ${d.tex}$`]);
    },
    (r) => {
      const c = q(ganz(r, 1, 9)), b = q(ganz(r, 1, 5));
      const f = summeT([[1, zahlT(c)], [-1, monomT(b, 1)], [-1, potT(2)]]), d = polyT([[-2, 1], [qNeg(b), 0]]);
      return neu(f, d, [`$f'(x) = 0 ${MINUS} ${zT(b)} ${MINUS} 2x = ${d.tex}$`]);
    },
  ],
  potenz: [
    (r) => {
      const n = eins(r, [3, 4, 5, 6, 7, 8, 9]);
      const c = eins(r, [q(1), q(3), q(-2), q(1, 2), q(1, 3), q(1, 5), q(-1)]);
      const f = monomT(c, n), d = monomT(qMul(c, q(n)), n - 1);
      const regel = `Potenzregel: $(x^{${n}})' = ${monomT(n, n - 1).tex}$`;
      return neu(f, d, c.z === 1 && c.n === 1 ? [regel] : [regel, `$f'(x) = ${zT(c)} \\cdot ${monomT(n, n - 1).tex} = ${d.tex}$`], {
        fehler: [{ js: (x) => qNum(c) * n * x ** (n + 1), text: "Die Hochzahl wird um 1 kleiner, nicht größer." }, { js: (x) => qNum(c) * n * x ** n, text: "Die Hochzahl muss um 1 kleiner werden." }],
      });
    },
    (r) => {
      const grad = eins(r, [3, 4]);
      const glieder = [];
      for (let k = grad; k >= 0; k--) glieder.push([q(k === grad ? ganz(r, -3, 3, [0]) : r() < 0.75 ? ganz(r, -6, 6) : 0), k]);
      const f = polyT(glieder), d = polyT(glieder.filter(([, k]) => k > 0).map(([c, k]) => [qMul(c, q(k)), k - 1]));
      const c0 = qNum(glieder[glieder.length - 1][0]);
      return neu(f, d, [`Summand für Summand mit Potenz- und Faktorregel: $f'(x) = ${d.tex}$`], { fehler: c0 ? [{ js: (x) => d.js(x) + c0, text: "Die Konstante fällt beim Ableiten weg." }] : [] });
    },
    (r) => {
      const p = q(ganz(r, 1, 4) * vz(r));
      const innen = polyT([[1, 2], [p, 0]]);
      const f = hochT(innen, 2), aus = polyT([[1, 4], [qMul(q(2), p), 2], [qMul(p, p), 0]]), d = polyT([[4, 3], [qMul(q(4), p), 1]]);
      return neu(f, d, [`Ausmultiplizieren: $${f.tex} = ${aus.tex}$`, `$f'(x) = ${d.tex}$`], { fehler: [{ js: (x) => 2 * (x * x + qNum(p)), text: "Die Klammer ist nicht einfach $x$ – multipliziere erst aus (oder nimm die Kettenregel)." }] });
    },
  ],
  produkt: [
    (r) => {
      let a, b, c, d0;
      do { a = ganz(r, 1, 3); b = ganz(r, -5, 5, [0]); c = ganz(r, 1, 3); d0 = ganz(r, -5, 5, [0]); } while (a * d0 === b * c);
      const u = linT(a, b), v = linT(c, d0);
      const f = malT(klammerT(u), klammerT(v));
      const d = polyT([[2 * a * c, 1], [a * d0 + b * c, 0]]);
      const roh = summeT([[1, malT(zahlT(a), klammerT(v))], [1, malT(klammerT(u), zahlT(c))]]);
      return neu(f, d, [`$u = ${u.tex}$, $v = ${v.tex}$, $u' = ${a}$, $v' = ${c}$`, `$f'(x) = ${roh.tex} = ${d.tex}$`], {
        fehler: [{ js: () => a * c, text: "Ein Produkt leitet man nicht faktorweise ab: $(u \\cdot v)' = u'v + uv'$." }],
      });
    },
    (r) => {
      const p = q(ganz(r, -5, 5, [0]));
      const u = potT(2), v = linT(1, p);
      const f = malT(u, klammerT(v)), d = polyT([[3, 2], [qMul(q(2), p), 1]]);
      return neu(f, d, [`$u = x^{2}$, $v = ${v.tex}$, $u' = 2x$, $v' = 1$`, `$f'(x) = 2x(${v.tex}) + x^{2} = ${d.tex}$`], { fehler: [{ js: (x) => 2 * x, text: "Das ist nur $u' \\cdot v'$. Richtig: $u'v + uv'$." }] });
    },
    (r) => {
      const p = q(ganz(r, -3, 3, [0])), s = q(ganz(r, -3, 3, [0]));
      const u = polyT([[1, 2], [p, 0]]), v = polyT([[1, 2], [s, 0]]);
      const f = malT(klammerT(u), klammerT(v)), d = polyT([[4, 3], [qMul(q(2), qAdd(p, s)), 1]]);
      return neu(f, d, [`$u' = 2x$, $v' = 2x$`, `$f'(x) = 2x(${v.tex}) + (${u.tex}) \\cdot 2x = ${d.tex}$`], { fehler: [{ js: (x) => 4 * x * x, text: "Das ist nur $u' \\cdot v'$. Richtig: $u'v + uv'$." }] });
    },
    (r) => {
      const m = ganz(r, 1, 4), n = ganz(r, 2, 4);
      const f = malT(potT(m), potT(n)), d = monomT(m + n, m + n - 1);
      return neu(f, d, [`$f'(x) = ${monomT(m, m - 1).tex} \\cdot ${potT(n).tex} + ${potT(m).tex} \\cdot ${monomT(n, n - 1).tex} = ${d.tex}$`], { fehler: [{ js: (x) => m * n * x ** (m + n - 2), text: "Das ist nur $u' \\cdot v'$. Richtig: $u'v + uv'$." }] });
    },
  ],
  quotient: [
    (r) => {
      let a, b, c, d0;
      do { a = ganz(r, 1, 3); b = ganz(r, -4, 4); c = ganz(r, 1, 2); d0 = ganz(r, -4, 4, [0]); } while (a * d0 - b * c === 0);
      const u = linT(a, b), v = linT(c, d0), K = a * d0 - b * c;
      const f = bruchT(u, v);
      const d = K > 0 ? bruchT(zahlT(K), hochT(v, 2)) : negT(bruchT(zahlT(-K), hochT(v, 2)));
      return neu(f, d, [`$u = ${u.tex}$, $u' = ${a}$, $v = ${v.tex}$, $v' = ${c}$`, `$f'(x) = \\frac{${malT(zahlT(a), klammerT(v)).tex} ${MINUS} ${malT(klammerT(u), zahlT(c)).tex}}{${hochT(v, 2).tex}} = ${d.tex}$`], {
        fehler: [{ js: () => a / c, text: "Man darf nicht Zähler und Nenner einzeln ableiten: $\\left(\\frac{u}{v}\\right)' = \\frac{u'v - uv'}{v^2}$." }, { js: (x) => -d.js(x), text: "Reihenfolge im Zähler: erst $u'v$, dann $- uv'$ („NAZ − ZAN“)." }],
        ohne: [-d0 / c],
      });
    },
    (r) => {
      const a = ganz(r, 1, 3), b = eins(r, [1, 1, 4, 9]);
      const u = monomT(a, 1), v = polyT([[1, 2], [b, 0]]);
      const f = bruchT(u, v), d = bruchT(polyT([[-a, 2], [a * b, 0]]), hochT(v, 2));
      return neu(f, d, [`$f'(x) = \\frac{${a}(${v.tex}) ${MINUS} ${u.tex} \\cdot 2x}{${hochT(v, 2).tex}} = ${d.tex}$`.replace("\\frac{1(", "\\frac{(")], { fehler: [{ js: (x) => -d.js(x), text: "Reihenfolge im Zähler: $u'v - uv'$." }] });
    },
    (r) => {
      const c = ganz(r, 1, 5), d0 = eins(r, [1, 4, 9, 2]);
      const v = polyT([[1, 2], [d0, 0]]);
      const f = bruchT(zahlT(c), v), d = negT(bruchT(monomT(2 * c, 1), hochT(v, 2)));
      return neu(f, d, [`$u = ${c}$, $u' = 0$, $v' = 2x$`, `$f'(x) = \\frac{0 ${MINUS} ${c} \\cdot 2x}{${hochT(v, 2).tex}} = ${d.tex}$`], { fehler: [{ js: () => 0, text: "Der Zähler ist zwar konstant, der Nenner hängt aber von $x$ ab." }] });
    },
    (r) => {
      const p = ganz(r, 1, 4) * vz(r);
      const v = linT(1, -p);
      const f = bruchT(potT(2), v), d = bruchT(polyT([[1, 2], [-2 * p, 1]]), hochT(v, 2));
      return neu(f, d, [`$f'(x) = \\frac{2x(${v.tex}) ${MINUS} x^{2}}{${hochT(v, 2).tex}} = ${d.tex}$`], { fehler: [{ js: (x) => (x * x - 2 * x * (x - p)) / (x - p) ** 2, text: "Reihenfolge im Zähler: $u'v - uv'$." }], ohne: [p] });
    },
    (r) => {
      const c = ganz(r, 2, 9);
      const f = bruchT(zahlT(c), varT()), d = negT(bruchT(zahlT(c), potT(2)));
      return neu(f, d, [`$f'(x) = \\frac{0 \\cdot x ${MINUS} ${c}}{x^{2}} = ${d.tex}$`], { ohne: [0] });
    },
  ],
  potneg: [
    (r) => {
      const c = eins(r, [1, 2, 3, 4]), n = ganz(r, 1, 5);
      const f = bruchT(zahlT(c), potT(n)), d = negT(bruchT(zahlT(c * n), potT(n + 1)));
      return neu(f, d, [`$f(x) = ${monomT(c, -n).tex}$`, `$f'(x) = ${monomT(-c * n, -n - 1).tex} = ${d.tex}$`], { fehler: [{ js: (x) => -c * n * x ** (-n + 1), text: "Auch bei negativen Hochzahlen wird die Hochzahl um 1 kleiner: Aus $-" + n + "$ wird $-" + (n + 1) + "$." }], ohne: [0] });
    },
    (r) => {
      const k = eins(r, [2, 3, 4]), n = ganz(r, 2, 4);
      const g = q(n, k);
      const f = bruchT(zahlT(1), monomT(k, n)), d = negT(bruchT(zahlT(g.z), monomT(g.n, n + 1)));
      return neu(f, d, [`$f(x) = ${monomT(q(1, k), -n).tex}$`, `$f'(x) = ${monomT(qNeg(g), -n - 1).tex} = ${d.tex}$`], { ohne: [0] });
    },
  ],
  kette: [
    (r) => {
      const a = ganz(r, 2, 4), b = ganz(r, -5, 5, [0]), n = ganz(r, 2, 5);
      const innen = linT(a, b);
      const f = hochT(innen, n), d = malT(zahlT(n * a), hochT(innen, n - 1));
      return neu(f, d, [`innen $v(x) = ${innen.tex}$, $v'(x) = ${a}$; außen $u(z) = z^{${n}}$`, `$f'(x) = ${n}(${innen.tex})${n - 1 > 1 ? `^{${n - 1}}` : ""} \\cdot ${a} = ${d.tex}$`], { fehler: [{ js: (x) => n * innen.js(x) ** (n - 1), text: "Die innere Ableitung fehlt: Nachdifferenzieren nicht vergessen." }] });
    },
    (r) => {
      const b = ganz(r, 1, 5), n = ganz(r, 3, 5);
      const innen = summeT([[1, zahlT(b)], [-1, varT()]]);
      const f = hochT(innen, n), d = malT(zahlT(-n), hochT(innen, n - 1));
      return neu(f, d, [`innen $v(x) = ${innen.tex}$, $v'(x) = ${MINUS}1$`, `$f'(x) = ${n}(${innen.tex})^{${n - 1}} \\cdot (${MINUS}1) = ${d.tex}$`], { fehler: [{ js: (x) => n * innen.js(x) ** (n - 1), text: "Die innere Ableitung ist $-1$ – das Vorzeichen fehlt." }] });
    },
    (r) => {
      const p = ganz(r, 1, 4), n = ganz(r, 2, 5);
      const innen = polyT([[1, 2], [p, 0]]);
      const f = hochT(innen, n), d = malT(monomT(2 * n, 1), hochT(innen, n - 1));
      return neu(f, d, [`innen $v(x) = ${innen.tex}$, $v'(x) = 2x$`, `$f'(x) = ${n}(${innen.tex})${n - 1 > 1 ? `^{${n - 1}}` : ""} \\cdot 2x = ${d.tex}$`], { fehler: [{ js: (x) => n * innen.js(x) ** (n - 1), text: "Die innere Ableitung $2x$ fehlt." }, { js: (x) => 2 * n * x, text: "Die äußere Ableitung braucht die Klammer hoch " + (n - 1) + "." }] });
    },
    (r) => {
      const a = ganz(r, 1, 6), b = ganz(r, 1, 5);
      const innen = linT(a, b);
      const f = wurzelT(innen);
      const d = a % 2 === 0 ? bruchT(zahlT(a / 2), wurzelT(innen)) : bruchT(zahlT(a), malT(zahlT(2), wurzelT(innen)));
      return neu(f, d, [`$f(x) = (${innen.tex})^{\\frac{1}{2}}$`, `$f'(x) = \\frac{1}{2\\sqrt{${innen.tex}}} \\cdot ${a} = ${d.tex}$`.replace(" \\cdot 1 =", " =")], { fehler: a !== 1 ? [{ js: (x) => 1 / (2 * Math.sqrt(innen.js(x))), text: `Die innere Ableitung ${a} fehlt.` }] : [], bereich: [-b / a + 0.2, 4] });
    },
    (r) => {
      const a = ganz(r, 2, 5), b = ganz(r, -4, 4, [0]);
      const innen = linT(a, b);
      const f = bruchT(zahlT(1), innen), d = negT(bruchT(zahlT(a), hochT(innen, 2)));
      return neu(f, d, [`$f(x) = (${innen.tex})^{${MINUS}1}$`, `$f'(x) = ${MINUS}(${innen.tex})^{${MINUS}2} \\cdot ${a} = ${d.tex}$`], { fehler: [{ js: (x) => -1 / innen.js(x) ** 2, text: `Die innere Ableitung ${a} fehlt.` }], ohne: [-b / a] });
    },
    (r) => {
      const c = eins(r, [1, 4, 9]);
      const innen = summeT([[1, zahlT(c)], [-1, potT(2)]]);
      const f = wurzelT(innen), d = negT(bruchT(varT(), wurzelT(innen)));
      const w = Math.sqrt(c);
      return neu(f, d, [`innen $v(x) = ${innen.tex}$, $v'(x) = ${MINUS}2x$`, `$f'(x) = \\frac{${MINUS}2x}{2\\sqrt{${innen.tex}}} = ${d.tex}$`], { bereich: [-0.9 * w, 0.9 * w] });
    },
    (r) => {
      const art = eins(r, [[[1, 3], [-1, 1]], [[1, 2], [3, 1]], [[1, 3], [2, 0]]]);
      const innen = polyT(art), ab = polyT(art.filter(([, k]) => k > 0).map(([c, k]) => [c * k, k - 1]));
      const f = hochT(innen, 2), d = malT(zahlT(2), klammerT(innen), klammerT(ab));
      return neu(f, d, [`innen $v(x) = ${innen.tex}$, $v'(x) = ${ab.tex}$`, `$f'(x) = ${d.tex}$`], { fehler: [{ js: (x) => 2 * innen.js(x), text: "Die innere Ableitung fehlt." }] });
    },
  ],
  prodkette: [
    (r) => {
      const p = ganz(r, -3, 3, [0]), n = ganz(r, 2, 4);
      const innen = linT(1, p);
      const f = malT(varT(), hochT(innen, n));
      const roh = summeT([[1, hochT(innen, n)], [1, malT(monomT(n, 1), hochT(innen, n - 1))]]);
      const d = malT(hochT(innen, n - 1), klammerT(linT(n + 1, p)));
      return neu(f, d, [`Produktregel mit $u = x$, $v = ${hochT(innen, n).tex}$, $v' = ${malT(zahlT(n), hochT(innen, n - 1)).tex}$`, `$f'(x) = ${roh.tex}$`, `Ausklammern: $f'(x) = ${d.tex}$`], { fehler: [{ js: (x) => n * innen.js(x) ** (n - 1), text: "Das ist nur $u' \\cdot v'$. Produktregel: $u'v + uv'$." }] });
    },
  ],
  speziell: [
    (r) => { const c = ganz(r, 2, 6) * vz(r); const sin = r() < 0.5; const f = malT(zahlT(c), fnT(sin ? "sin" : "cos", varT())); const d = sin ? malT(zahlT(c), fnT("cos", varT())) : malT(zahlT(-c), fnT("sin", varT())); return neu(f, d, [`$(\\${sin ? "sin" : "cos"} x)' = ${sin ? "\\cos x" : "−\\sin x"}$, also $f'(x) = ${d.tex}$`], { fehler: sin ? [] : [{ js: (x) => c * Math.sin(x), text: "$(\\cos x)' = -\\sin x$ – das Minus nicht vergessen." }] }); },
    () => { const f = summeT([[1, fnT("sin", varT())], [1, fnT("cos", varT())]]), d = summeT([[1, fnT("cos", varT())], [-1, fnT("sin", varT())]]); return neu(f, d, [`$f'(x) = ${d.tex}$`], { fehler: [{ js: (x) => Math.cos(x) + Math.sin(x), text: "$(\\cos x)' = -\\sin x$." }] }); },
    (r) => { const c = ganz(r, 2, 5); const f = summeT([[1, malT(zahlT(c), expT(varT()))], [-1, potT(2)]]), d = summeT([[1, malT(zahlT(c), expT(varT()))], [-1, monomT(2, 1)]]); return neu(f, d, [`$(e^{x})' = e^{x}$, also $f'(x) = ${d.tex}$`]); },
    (r) => { const c = ganz(r, 2, 7); const f = malT(zahlT(c), fnT("ln", varT())), d = bruchT(zahlT(c), varT()); return neu(f, d, [`$(\\ln x)' = \\frac{1}{x}$, also $f'(x) = ${d.tex}$`], { bereich: [0.2, 5] }); },
    (r) => { const k = ganz(r, 2, 5) * vz(r); const innen = monomT(k, 1); const f = expT(innen), d = malT(zahlT(k), expT(innen)); return neu(f, d, [`Kettenregel: $f'(x) = e^{${innen.tex}} \\cdot ${kz(k)} = ${d.tex}$`], { fehler: [{ js: (x) => Math.exp(k * x), text: `Die innere Ableitung ${k} fehlt.` }], bereich: [-1, 1] }); },
    (r) => { const k = ganz(r, 2, 5); const innen = monomT(k, 1); const f = fnT("cos", innen), d = malT(zahlT(-k), fnT("sin", innen)); return neu(f, d, [`$f'(x) = ${MINUS}\\sin(${innen.tex}) \\cdot ${k} = ${d.tex}$`], { fehler: [{ js: (x) => -Math.sin(k * x), text: `Die innere Ableitung ${k} fehlt.` }] }); },
    () => { const innen = potT(2); const f = fnT("sin", innen), d = malT(monomT(2, 1), fnT("cos", innen)); return neu(f, d, [`innen $x^{2}$, innere Ableitung $2x$`, `$f'(x) = ${d.tex}$`], { fehler: [{ js: (x) => Math.cos(x * x), text: "Die innere Ableitung $2x$ fehlt." }] }); },
    (r) => { const k = ganz(r, 2, 6); const f = fnT("ln", monomT(k, 1)), d = bruchT(zahlT(1), varT()); return neu(f, d, [`$f'(x) = \\frac{1}{${k}x} \\cdot ${k} = ${d.tex}$`], { fehler: [{ js: (x) => 1 / (k * x), text: `Die innere Ableitung ${k} fehlt – sie kürzt sich mit dem ${k} im Nenner.` }], bereich: [0.2, 5] }); },
    () => { const innen = monomT(-1, 2); const f = expT(innen), d = malT(monomT(-2, 1), expT(innen)); return neu(f, d, [`innen $${MINUS}x^{2}$, innere Ableitung $${MINUS}2x$`, `$f'(x) = ${d.tex}$`], { fehler: [{ js: (x) => Math.exp(-x * x), text: "Die innere Ableitung $-2x$ fehlt." }] }); },
  ],
  speziellPQ: [
    () => { const f = malT(varT(), fnT("sin", varT())), d = summeT([[1, fnT("sin", varT())], [1, malT(varT(), fnT("cos", varT()))]]); return neu(f, d, ["$u = x$, $v = \\sin x$", `$f'(x) = ${d.tex}$`], { fehler: [{ js: (x) => Math.cos(x), text: "Produktregel: $u'v + uv'$, nicht $u' \\cdot v'$." }] }); },
    () => { const f = malT(potT(2), expT(varT())), d = malT(klammerT(polyT([[1, 2], [2, 1]])), expT(varT())); return neu(f, d, [`$f'(x) = 2x\\,e^{x} + x^{2}e^{x} = ${d.tex}$`], { fehler: [{ js: (x) => 2 * x * Math.exp(x), text: "Produktregel: Es fehlt der Summand $u \\cdot v'$." }], bereich: [-2, 2] }); },
    () => { const f = bruchT(expT(varT()), varT()), d = bruchT(malT(klammerT(linT(1, -1)), expT(varT())), potT(2)); return neu(f, d, [`$f'(x) = \\frac{e^{x} \\cdot x ${MINUS} e^{x} \\cdot 1}{x^{2}} = ${d.tex}$`.replace(" \\cdot 1}", "}")], { ohne: [0], bereich: [-2, 2] }); },
    () => { const f = malT(varT(), fnT("ln", varT())), d = summeT([[1, fnT("ln", varT())], [1, zahlT(1)]]); return neu(f, d, [`$f'(x) = 1 \\cdot \\ln x + x \\cdot \\frac{1}{x} = ${d.tex}$`], { bereich: [0.2, 5] }); },
    () => { const f = malT(potT(2), fnT("sin", varT())), d = summeT([[1, malT(monomT(2, 1), fnT("sin", varT()))], [1, malT(potT(2), fnT("cos", varT()))]]); return neu(f, d, [`$f'(x) = ${d.tex}$`], { fehler: [{ js: (x) => 2 * x * Math.cos(x), text: "Produktregel: $u'v + uv'$." }] }); },
    () => { const f = bruchT(fnT("sin", varT()), potT(2)), d = bruchT(summeT([[1, malT(varT(), fnT("cos", varT()))], [-1, malT(zahlT(2), fnT("sin", varT()))]]), potT(3)); return neu(f, d, [`$f'(x) = \\frac{\\cos x \\cdot x^{2} ${MINUS} \\sin x \\cdot 2x}{x^{4}} = ${d.tex}$`], { ohne: [0] }); },
    (r) => { const k = eins(r, [-1, -2]); const innen = monomT(k, 1); const f = malT(varT(), expT(innen)), d = malT(klammerT(linT(k, 1)), expT(innen)); const roh = summeT([[1, expT(innen)], [1, malT(monomT(k, 1), expT(innen))]]); return neu(f, d, [`$f'(x) = ${roh.tex} = ${d.tex}$`], { bereich: [-2, 2] }); },
    () => { const f = fnT("tan", varT()), d = bruchT(zahlT(1), hochT(fnT("cos", varT()), 2)); return neu(f, d, ["$\\tan x = \\frac{\\sin x}{\\cos x}$", `$f'(x) = \\frac{\\cos x \\cdot \\cos x ${MINUS} \\sin x \\cdot (${MINUS}\\sin x)}{(\\cos x)^{2}} = ${d.tex}$`, "(Zähler: $\\sin^2 x + \\cos^2 x = 1$)"], { bereich: [-1.3, 1.3] }); },
  ],
};
VORLAGEN.mix = [...VORLAGEN.potenz, ...VORLAGEN.produkt, ...VORLAGEN.quotient, ...VORLAGEN.kette, ...VORLAGEN.speziell, ...VORLAGEN.speziellPQ, ...VORLAGEN.prodkette];

const REGEL_HINWEIS = {
  faktor: "Faktorregel: $(c \\cdot f)' = c \\cdot f'$.", summe: "Summenregel: jeden Summanden einzeln ableiten.", potenz: "Potenzregel: $(x^n)' = n x^{n-1}$.",
  produkt: "Produktregel: $(u \\cdot v)' = u'v + uv'$.", quotient: "Quotientenregel: $\\left(\\frac{u}{v}\\right)' = \\frac{u'v - uv'}{v^2}$.",
  potneg: "Schreibe den Bruch als Potenz mit negativer Hochzahl.", kette: "Kettenregel: äußere Ableitung mal innere Ableitung.",
  prodkette: "Erst Produktregel, für $v'$ die Kettenregel.", speziell: "$(\\sin x)' = \\cos x$, $(\\cos x)' = -\\sin x$, $(e^x)' = e^x$, $(\\ln x)' = \\frac{1}{x}$.",
  speziellPQ: "Produkt- oder Quotientenregel mit den speziellen Ableitungen.", mix: "Welche Regel passt? Produkt, Quotient, Verkettung – oder erst vereinfachen?",
};
export const REGEL_TITEL = {
  faktor: "Ableiten mit der Faktorregel", summe: "Ableiten mit der Summenregel", potenz: "Ableiten mit der Potenzregel", produkt: "Ableiten mit der Produktregel",
  quotient: "Ableiten mit der Quotientenregel", potneg: "Brüche als Potenz ableiten", kette: "Ableiten mit der Kettenregel", prodkette: "Produkt- und Kettenregel kombiniert",
  speziell: "Sinus, Kosinus, eˣ und ln x ableiten", speziellPQ: "Spezielle Funktionen mit Produkt- und Quotientenregel", mix: "Alle Regeln gemischt",
};

export function ableitAufgabe(regel, r) {
  const v = eins(r, VORLAGEN[regel])(r);
  return {
    text: `Leite ab: ${gl("f(x)", v.f)}`,
    schritte: [termS("d", "Ableitung", REGEL_HINWEIS[regel], "$f'(x) =$", v.d, { fehler: v.fehler, bereich: v.bereich, ohne: v.ohne, hinweis: REGEL_HINWEIS[regel] })],
    weg: v.weg,
    f: v.f, d: v.d,
  };
}

/* ===================== Kapitel III: Anwenden der Regeln ===================== */
const quad = (r) => ({ a: eins(r, [q(2), q(-5), q(1), q(-1), q(3), q(1, 2)]), b: q(r() < 0.6 ? ganz(r, -4, 4, [0]) : 0), c: q(r() < 0.5 ? ganz(r, -5, 5) : 0) });
const quadT = (g) => polyT([[g.a, 2], [g.b, 1], [g.c, 0]], "x", dzo(g.a));
const quadD = (g) => polyT([[qMul(q(2), g.a), 1], [g.b, 0]]);
const fw = (g, x) => qAdd(qAdd(qMul(g.a, qMul(x, x)), qMul(g.b, x)), g.c);

export const TYPEN_III = {
  steigungAnStellen: {
    titel: "Steigung an mehreren Stellen",
    gen(r) {
      const g = quad(r), d = quadD(g);
      const xs = [q(ganz(r, -3, -1)), q(0), eins(r, [q(1), q(3, 2), q(2)])];
      return {
        text: `Berechne die Steigung von ${$(`f(x) = ${quadT(g).tex}`)} an den Stellen ${xs.map((x) => $(zT(x))).join(", ")}.`,
        schritte: [termS("d", "Ableitung", "Leite zuerst ab.", "$f'(x) =$", d), ...xs.map((x, i) => zahlS(`s${i}`, `Stelle ${zTxt(qNum(x))}`, "Setze die Stelle in $f'$ ein.", `$f'(${zT(x)}) =$`, qAdd(qMul(qMul(q(2), g.a), x), g.b)))],
        weg: [`$f'(x) = ${d.tex}$`, xs.map((x) => `$f'(${zT(x)}) = ${zT(qAdd(qMul(qMul(q(2), g.a), x), g.b))}$`).join(", ")],
      };
    },
  },

  rueckwaerts: {
    titel: "Rückwärts: Funktion zur Ableitung finden",
    gen(r) {
      const F = eins(r, [
        [[3, 2]], [[q(-1, 2), 2]], [[7, 1]], [[2, 2], [-2, 1]], [[q(1, 5), 5]], [[2, 3], [-2, 1]],
        [[ganz(r, 1, 4), 2], [ganz(r, -5, 5, [0]), 1]], [[ganz(r, 1, 3), 3], [ganz(r, -4, 4, [0]), 1]],
      ]);
      const Ft = polyT(F), d = polyT(F.map(([c, k]) => [qMul(Q(c), q(k)), k - 1]));
      return {
        text: `Gib eine Funktion $f$ an mit ${gl("f'(x)", d)}. Gibt es nur eine?`,
        schritte: [
          stammS("f", "Eine passende Funktion", "Welche Funktion hat diese Ableitung? Kontrolliere durch Ableiten.", "$f(x) =$", d, { wertText: `$${Ft.tex}$` }),
          wahlS("eind", "Nur eine?", "Gibt es nur eine solche Funktion?", [["nein", "nein – man kann jede Konstante addieren"], ["ja", "ja, sie ist eindeutig"]], "nein"),
        ],
        weg: [`$f(x) = ${Ft.tex}$ (Kontrolle: $f'(x) = ${d.tex}$)`, `Jede Funktion $f(x) = ${Ft.tex} + c$ passt – die Konstante fällt beim Ableiten weg.`],
      };
    },
  },

  faktorSteigung: {
    titel: "Steigung von Vielfachen",
    gen(r) {
      const s = ganz(r, -4, 5, [0, 1]), x0 = ganz(r, -2, 3);
      const ks = [q(ganz(r, 2, 5)), q(-1), eins(r, [q(1, 2), q(-3), q(1, 3)])];
      return {
        text: `Der Graph von $f$ hat an der Stelle ${x0} die Steigung ${zTxt(s)}. Welche Steigung haben dort die Graphen von ${ks.map((k) => $(`${k.z === -1 && k.n === 1 ? MINUS : zT(k)}f`)).join(", ")}?`,
        schritte: ks.map((k, i) => zahlS(`k${i}`, `${["Erster", "Zweiter", "Dritter"][i]} Graph`, `Steigung von $${k.z === -1 && k.n === 1 ? MINUS : zT(k)}f$ an der Stelle ${x0}? Faktorregel: $(c \\cdot f)' = c \\cdot f'$.`, "Steigung:", qMul(k, q(s)))),
        weg: [ks.map((k) => `$${zT(k)} \\cdot ${kz(s)} = ${zT(qMul(k, q(s)))}$`).join(", ")],
      };
    },
  },

  bewegung: {
    titel: "Geschwindigkeit als Ableitung",
    gen(r, variante) {
      if (variante === "bremsweg" || (!variante && r() < 0.3)) {
        const v1 = eins(r, [30, 50, 60]), v2 = eins(r, [80, 100, 120]);
        return {
          text: `Fahrschul-Faustformel: Der Bremsweg beträgt etwa $s(v) = \\frac{v^{2}}{100}$ (in m, $v$ in km/h). Berechne $s'(${v1})$ und $s'(${v2})$.`,
          schritte: [
            termS("d", "Ableitung", "Faktorregel mit $\\frac{1}{100}$.", "$s'(v) =$", bruchT(varT("v"), zahlT(50)), { var: "v" }),
            zahlR("a", `s′(${v1})`, "Setze ein.", `$s'(${v1}) =$`, v1 / 50, { einheit: "m pro km/h" }),
            zahlR("b", `s′(${v2})`, "Setze ein.", `$s'(${v2}) =$`, v2 / 50, { einheit: "m pro km/h" }),
          ],
          weg: [`$s'(v) = \\frac{2v}{100} = \\frac{v}{50}$`, `$s'(${v1}) = ${dezT(v1 / 50)}$, $s'(${v2}) = ${dezT(v2 / 50)}$`, `Bei ${v2} km/h wächst der Bremsweg pro zusätzlichem km/h um ${zTxt(v2 / 50)} m – viel stärker als bei ${v1} km/h.`],
        };
      }
      const c = eins(r, [0.4, 0.5, 0.8, 1.2, 1.5, 2.5]);
      const t1 = ganz(r, 2, 6), vz2 = eins(r, [2, 4, 6]) * c;
      return {
        text: `Eine Kugel rollt eine schiefe Ebene hinab und legt in $t$ Sekunden $s(t) = ${dezT(c)}t^{2}$ Meter zurück. Wie schnell ist sie nach ${t1} Sekunden? Nach wie vielen Sekunden ist sie ${zTxt(vz2)} m/s schnell?`,
        schritte: [
          termS("d", "Geschwindigkeit", "Die Geschwindigkeit ist die Ableitung des Weges.", "$s'(t) =$", polyT([[alsQ(2 * c), 1]], "t", { dez: true }), { var: "t" }),
          zahlR("v", "Nach " + t1 + " s", "Setze ein.", `$s'(${t1}) =$`, 2 * c * t1, { einheit: "m/s" }),
          zahlR("t", "Zeitpunkt", `Löse $s'(t) = ${dezT(vz2)}$.`, "$t =$", vz2 / (2 * c), { einheit: "s" }),
        ],
        weg: [`$s'(t) = ${dezT(2 * c)}t$`, `$s'(${t1}) = ${dezT(2 * c * t1)}$ m/s`, `$${dezT(2 * c)}t = ${dezT(vz2)}$ ergibt $t = ${dezT(vz2 / (2 * c))}$ s`],
      };
    },
  },

  parallelTangente: {
    titel: "Tangente parallel zu einer Geraden",
    gen(r, variante) {
      if (variante === "kubisch") {
        const a = eins(r, [q(1), q(1), q(2), q(1, 3)]), x0 = q(ganz(r, 1, 3));
        const m = qMul(q(3), qMul(a, qMul(x0, x0)));
        const tang = (x) => { const y = qMul(a, qMul(x, qMul(x, x))); return linT(m, qSub(y, qMul(m, x))); };
        return {
          text: `In welchen Punkten hat der Graph von ${$(`f(x) = ${monomT(a, 3).tex}`)} eine Tangente, die parallel zur Geraden ${$(`y = ${monomT(m, 1).tex}`)} ist? Gib die Tangentengleichungen an.`,
          schritte: [
            listeS("x", "Stellen", `Löse $f'(x) = ${zT(m)}$. Trenne mehrere Werte mit Semikolon.`, "$x =$", [qNum(x0), -qNum(x0)]),
            termS("t1", "Tangente rechts", `Tangente an der Stelle $${zT(x0)}$:`, "$y =$", tang(x0)),
            termS("t2", "Tangente links", `Tangente an der Stelle $${zT(qNeg(x0))}$:`, "$y =$", tang(qNeg(x0))),
          ],
          weg: [`$f'(x) = ${monomT(qMul(q(3), a), 2).tex} = ${zT(m)}$ ergibt $x = ${zT(x0)}$ oder $x = ${zT(qNeg(x0))}$`, `$y = ${tang(x0).tex}$ und $y = ${tang(qNeg(x0)).tex}$`],
        };
      }
      const p = q(ganz(r, -4, 4, [0])), c = q(r() < 0.5 ? ganz(r, -4, 4) : 0);
      const x0 = q(ganz(r, -3, 4));
      const m = qAdd(qMul(q(2), x0), p), n = q(ganz(r, -3, 3));
      const g = { a: q(1), b: p, c };
      return {
        text: `In welchem Punkt ist die Tangente an ${$(`f(x) = ${quadT(g).tex}`)} parallel zur Geraden ${$(`y = ${linT(m, n).tex}`)}?`,
        schritte: [
          termS("d", "Ableitung", "Leite ab.", "$f'(x) =$", quadD(g)),
          zahlS("x", "Stelle", `Parallel heißt gleiche Steigung: Löse $f'(x) = ${zT(m)}$.`, "$x =$", x0),
          zahlS("y", "Funktionswert", "Berechne den Funktionswert.", "$y =$", fw(g, x0)),
        ],
        weg: [`$f'(x) = ${quadD(g).tex} = ${zT(m)}$ ergibt $x = ${zT(x0)}$`, `$f(${zT(x0)}) = ${zT(fw(g, x0))}$, also ${$(P(x0, fw(g, x0)))}`],
      };
    },
  },

  waagrecht: {
    titel: "Punkte mit waagrechter Tangente",
    gen(r, variante) {
      const art = variante || eins(r, ["kubisch", "kubisch", "biquad", "bruch"]);
      let f, d, xs, ys, weg;
      if (art === "biquad") {
        const a = ganz(r, 1, 3);
        f = hochT(polyT([[1, 2], [-a * a, 0]]), 2); d = malT(monomT(4, 1), klammerT(polyT([[1, 2], [-a * a, 0]])));
        xs = [-a, 0, a]; ys = [0, a ** 4, 0];
        weg = [`Kettenregel: $f'(x) = 2(x^{2} ${MINUS} ${a * a}) \\cdot 2x = ${d.tex}$`, `$f'(x) = 0$ für $x = 0$ oder $x^{2} = ${a * a}$, also $x = ${MINUS}${a}$, $0$, $${a}$`, `Punkte ${$(P(-a, 0, "A"))}, ${$(P(0, a ** 4, "B"))}, ${$(P(a, 0, "C"))}`];
      } else if (art === "bruch") {
        const a = ganz(r, 1, 3);
        f = bruchT(varT(), polyT([[1, 2], [a * a, 0]])); d = bruchT(polyT([[-1, 2], [a * a, 0]]), hochT(polyT([[1, 2], [a * a, 0]]), 2));
        xs = [-a, a]; ys = [-1 / (2 * a), 1 / (2 * a)];
        weg = [`Quotientenregel: $f'(x) = ${d.tex}$`, `Zähler null: $${a * a} ${MINUS} x^{2} = 0$, also $x = \\pm ${a}$`, `Punkte ${$(P(-a, q(-1, 2 * a), "A"))} und ${$(P(a, q(1, 2 * a), "B"))}`];
      } else {
        let u, v;
        do { u = ganz(r, -3, 2); v = ganz(r, u + 1, 4); } while ((u + v) % 2 !== 0);
        const k = eins(r, [1, 1, -1]), c = ganz(r, -4, 4);
        const F = (x) => k * (x ** 3 - 1.5 * (u + v) * x * x + 3 * u * v * x) + c;
        f = polyT([[k, 3], [-1.5 * (u + v) * k, 2], [3 * u * v * k, 1], [c, 0]]);
        d = polyT([[3 * k, 2], [-3 * (u + v) * k, 1], [3 * u * v * k, 0]]);
        xs = [u, v]; ys = [F(u), F(v)];
        weg = [`$f'(x) = ${d.tex}$`, `$f'(x) = 0$ ergibt $x = ${zT(u)}$ oder $x = ${zT(v)}$`, `Punkte ${$(P(u, F(u), "A"))} und ${$(P(v, F(v), "B"))}`];
      }
      return {
        text: `In welchen Punkten hat der Graph von ${$(`f(x) = ${f.tex}`)} eine waagrechte Tangente?`,
        schritte: [
          termS("d", "Ableitung", "Leite ab.", "$f'(x) =$", d, { ohne: art === "bruch" ? [] : undefined }),
          listeS("x", "Stellen", "Löse $f'(x) = 0$. Trenne mehrere Werte mit Semikolon.", "$x =$", xs),
          listeS("y", "Funktionswerte", "Berechne die $y$-Werte dieser Punkte (mit Semikolon getrennt).", "$y =$", ys),
        ],
        weg,
      };
    },
  },

  parameterBC: {
    titel: "Parameter aus Bedingungen bestimmen",
    gen(r) {
      const c = ganz(r, -5, 6), x0 = ganz(r, -3, 3, [0]);
      return {
        text: `Bestimme $b$ und $c$ so, dass der Graph von $f(x) = x^{2} + bx + c$ durch ${$(P(0, c))} geht und an der Stelle ${$(zT(x0))} eine waagrechte Tangente hat.`,
        schritte: [
          zahlS("c", "c", "Setze den Punkt ein: $f(0) = c$.", "$c =$", c),
          zahlS("b", "b", `Es gilt $f'(x) = 2x + b$. Setze $f'(${zT(x0)}) = 0$.`, "$b =$", -2 * x0, { fehler: [{ wert: 2 * x0, text: "Vorzeichen: $2 \\cdot " + kz(x0) + " + b = 0$." }] }),
        ],
        weg: [`$f(0) = c = ${zT(c)}$`, `$f'(${zT(x0)}) = ${zT(2 * x0)} + b = 0$, also $b = ${zT(-2 * x0)}$`, `$f(x) = ${polyT([[1, 2], [-2 * x0, 1], [c, 0]]).tex}$`],
      };
    },
  },

  umsatz: {
    titel: "Produktregel im Sachzusammenhang",
    gen(r) {
      let p0, k, m0, d, ts;
      for (let i = 0; i < 300; i++) {
        p0 = eins(r, [2, 2.5, 3, 4]); k = eins(r, [0.1, 0.2, 0.5]); m0 = eins(r, [300, 400, 500, 600]); d = eins(r, [5, 10, 20]);
        ts = (k * m0 - p0 * d) / (2 * k * d);
        if (ts > 0 && Number.isInteger(Math.round(ts * 100) / 100) && ts < 40) break;
      }
      const A = k * m0 - p0 * d, B = -2 * k * d;
      const soll = polyT([[alsQ(B), 1], [alsQ(A), 0]], "t", { dez: true });
      return {
        text: `Ein Café erhöht wöchentlich den Preis eines Getränks: $p(t) = ${dezT(p0)} + ${dezT(k)}t$ (in €). Der Absatz sinkt: $m(t) = ${m0} - ${d}t$ (Stück pro Woche). Bestimme für den Umsatz $U(t) = p(t) \\cdot m(t)$ die Ableitung $U'(t)$. Ab wann sinkt der Umsatz?`,
        schritte: [
          termS("d", "Ableitung", "Produktregel: $U' = p'm + pm'$.", "$U'(t) =$", soll, { var: "t", fehler: [{ js: () => -k * d, text: "Das ist nur $p' \\cdot m'$. Produktregel: $p'm + pm'$." }] }),
          zahlR("t", "Umsatz sinkt", "Ab wann ist $U'(t) < 0$? Löse $U'(t) = 0$.", "$t =$", ts, { einheit: "Wochen" }),
        ],
        weg: [`$U'(t) = ${dezT(k)}(${m0} - ${d}t) + (${dezT(p0)} + ${dezT(k)}t) \\cdot (${MINUS}${d}) = ${soll.tex}$`, `$U'(t) = 0$ für $t = ${dezT(ts)}$ – danach sinkt der Umsatz.`],
      };
    },
  },

  hoehere: {
    titel: "Höhere Ableitungen",
    gen(r) {
      const F = [[ganz(r, -2, 3, [0]), 5], [ganz(r, -3, 3), 4], [ganz(r, -6, 6), 3], [ganz(r, -4, 4), 2], [ganz(r, -5, 5, [0]), 1], [ganz(r, -5, 5), 0]];
      const ab = (g) => g.filter(([, k]) => k > 0).map(([c, k]) => [c * k, k - 1]);
      const d1 = ab(F), d2 = ab(d1), d3 = ab(d2);
      return {
        text: `Bestimme $f'$, $f''$ und $f'''$ für ${$(`f(x) = ${polyT(F).tex}`)}.`,
        schritte: [termS("d1", "f′", "Erste Ableitung.", "$f'(x) =$", polyT(d1)), termS("d2", "f″", "Leite $f'$ noch einmal ab.", "$f''(x) =$", polyT(d2)), termS("d3", "f‴", "Und noch einmal.", "$f'''(x) =$", polyT(d3))],
        weg: [`$f'(x) = ${polyT(d1).tex}$`, `$f''(x) = ${polyT(d2).tex}$`, `$f'''(x) = ${polyT(d3).tex}$`],
      };
    },
  },

  potenzN: {
    titel: "Hochzahl aus einer Steigung bestimmen",
    gen(r) {
      const x0 = eins(r, [2, 2, 3]), n = ganz(r, 3, x0 === 2 ? 7 : 5);
      const s = n * x0 ** (n - 1);
      return {
        text: `Für welche natürliche Zahl $n$ hat der Graph von $f(x) = x^{n}$ an der Stelle ${x0} die Steigung ${s}? Ist $n$ eindeutig?`,
        schritte: [
          zahlR("n", "Hochzahl", `Es gilt $f'(${x0}) = n \\cdot ${x0}^{n - 1}$. Probiere $n = 2, 3, 4, …$`, "$n =$", n),
          wahlS("e", "Eindeutig?", "Gibt es noch ein anderes $n$?", [["ja", `nein – $n \\cdot ${x0}^{n-1}$ wächst mit $n$`], ["nein", "ja, es gibt mehrere"]], "ja"),
        ],
        weg: [`$${n} \\cdot ${x0}^{${n - 1}} = ${s}$`, `Für größeres $n$ wird $n \\cdot ${x0}^{n-1}$ immer größer – $n = ${n}$ ist eindeutig.`],
      };
    },
  },

  konzentration: {
    titel: "Quotientenregel im Sachzusammenhang",
    gen(r) {
      const a = eins(r, [8, 10, 12, 20]), b = eins(r, [1, 2, 3]), t1 = 1;
      const v = polyT([[1, 2], [b * b, 0]], "t");
      const d = bruchT(polyT([[-a, 2], [a * b * b, 0]], "t"), hochT(v, 2));
      const w = (a * (b * b - t1 * t1)) / (t1 * t1 + b * b) ** 2;
      return {
        text: `Die Konzentration eines Medikaments im Blut ist $c(t) = \\frac{${a}t}{t^{2} + ${b * b}}$ (in mg/L, $t$ in Stunden). Berechne $c'(${t1})$ und deute den Wert. Wann ist die Konzentration am höchsten?`,
        schritte: [
          termS("d", "Ableitung", "Quotientenregel.", "$c'(t) =$", d, { var: "t", bereich: [0, 6] }),
          zahlR("w", `c′(${t1})`, "Setze ein.", `$c'(${t1}) =$`, w, { einheit: "mg/L pro Stunde", wertText: zT(alsQ(w)) }),
          zahlR("t", "Höchste Konzentration", "Wo ist $c'(t) = 0$ (für $t > 0$)?", "$t =$", b, { einheit: "h" }),
        ],
        weg: [`$c'(t) = \\frac{${a}(t^{2} + ${b * b}) - ${a}t \\cdot 2t}{(t^{2} + ${b * b})^{2}} = ${d.tex}$`, `$c'(${t1}) = ${zT(alsQ(w))}$: ${w > 0 ? "Die Konzentration steigt noch" : w < 0 ? "Die Konzentration sinkt bereits" : "Die Konzentration ändert sich gerade nicht"}.`, `$c'(t) = 0$ für $t = ${b}$: nach ${b} Stunde${b > 1 ? "n" : ""} am höchsten.`],
      };
    },
  },

  kettenSach: {
    titel: "Kettenregel im Sachzusammenhang",
    gen(r) {
      const a = eins(r, [1, 2, 3]), b = eins(r, [1, 2]), t0 = ganz(r, 1, 4);
      const ab = 2 * a * (a * t0 + b);
      const soll = malT(zahlT(2 * a), konstT("\\pi", "pi", Math.PI), klammerT(linT(a, b, "t")));
      return {
        text: `Ein kreisförmiger Ölfleck breitet sich aus. Sein Radius ist $r(t) = ${linT(a, b, "t").tex}$ (in m, $t$ in Stunden). Wie schnell wächst seine Fläche $A = \\pi r^{2}$ nach ${t0} Stunden?`,
        schritte: [
          termS("d", "Ableitung", "$A(t) = \\pi(" + linT(a, b, "t").tex + ")^{2}$ – Kettenregel.", "$A'(t) =$", soll, { var: "t", bereich: [0, 5] }),
          zahlR("w", "Nach " + t0 + " h", "Setze ein (exakt mit pi oder gerundet).", `$A'(${t0}) =$`, ab * Math.PI, { einheit: "m² pro h", tol: 0.05, frei: true, wertText: `$${ab}\\pi \\approx ${dezT(ab * Math.PI, 1)}$` }),
        ],
        weg: [`$A'(t) = 2\\pi(${linT(a, b, "t").tex}) \\cdot ${a} = ${soll.tex}$`.replace(" \\cdot 1 =", " ="), `$A'(${t0}) = ${ab}\\pi \\approx ${dezT(ab * Math.PI, 1)}$ m² pro Stunde`],
      };
    },
  },

  trigStellen: {
    titel: "Stellen mit gegebener Steigung (Sinus, Kosinus)",
    gen(r) {
      const sin = r() < 0.6;
      const v = eins(r, [q(1, 2), q(-1, 2), q(0), q(1), q(-1)]);
      const fs = (x) => (sin ? Math.cos(x) : -Math.sin(x));
      const ks = [];
      for (let k = 0; k <= 24; k++) if (Math.abs(fs((k * Math.PI) / 12) - qNum(v)) < 1e-9) ks.push(k);
      const piT = (k) => { const b = q(k, 12); if (b.z === 0) return "0"; const z = b.z === 1 ? "" : b.z; return b.n === 1 ? `${z}\\pi` : `\\frac{${z}\\pi}{${b.n}}`; };
      return {
        text: `An welchen Stellen im Intervall $[0;\\,2\\pi]$ hat der Graph von $f(x) = \\${sin ? "sin" : "cos"} x$ die Steigung ${$(zT(v))}?`,
        schritte: [
          termS("d", "Ableitung", "Leite ab.", "$f'(x) =$", sin ? fnT("cos", varT()) : negT(fnT("sin", varT()))),
          listeS("x", "Stellen", `Löse $f'(x) = ${zT(v)}$ im Intervall. Schreibe z. B. pi/3; 5pi/3.`, "$x =$", ks.map((k) => (k * Math.PI) / 12), { tol: 1e-4, wertText: `$${ks.map(piT).join("$; $")}$` }),
        ],
        weg: [`$f'(x) = ${sin ? "\\cos x" : "−\\sin x"} = ${zT(v)}$`, `Am Einheitskreis: $x = ${ks.map(piT).join("$, $x = ")}$`],
      };
    },
  },

  wachstum: {
    titel: "Exponentielles Wachstum ableiten",
    gen(r) {
      const N0 = eins(r, [200, 500, 1000, 50]), k = eins(r, [0.1, 0.2, 0.3, 0.05]), t1 = eins(r, [5, 10]);
      const innen = monomT(alsQ(k), 1, "t", { dez: true });
      const soll = malT(zahlT(alsQ(k * N0), { dez: true }), expT(innen));
      return {
        text: `Bakterien vermehren sich nach $N(t) = ${N0} \\cdot e^{${innen.tex}}$ ($t$ in h). Bestimme $N'(t)$ und berechne $N'(0)$ und $N'(${t1})$.`,
        schritte: [
          termS("d", "Ableitung", "Kettenregel: Die innere Ableitung ist die Zahl vor dem $t$.", "$N'(t) =$", soll, { var: "t", bereich: [0, 8], fehler: [{ js: (t) => N0 * Math.exp(k * t), text: `Die innere Ableitung ${zTxt(k)} fehlt.` }] }),
          zahlR("a", "N′(0)", "Setze $t = 0$ ein.", "$N'(0) =$", k * N0, { einheit: "pro Stunde" }),
          zahlR("b", `N′(${t1})`, "Setze ein und runde auf ganze Bakterien.", `$N'(${t1}) \\approx$`, Math.round(k * N0 * Math.exp(k * t1)), { einheit: "pro Stunde", tol: 1 }),
        ],
        weg: [`$N'(t) = ${N0} \\cdot e^{${innen.tex}} \\cdot ${dezT(k)} = ${soll.tex}$`, `$N'(0) = ${dezT(k * N0)}$, $N'(${t1}) \\approx ${Math.round(k * N0 * Math.exp(k * t1))}$`, `Es gilt $N'(t) = ${dezT(k)} \\cdot N(t)$: Die Zunahme ist proportional zum Bestand.`],
      };
    },
  },

  uvWerte: {
    titel: "Regeln mit Funktionswerten anwenden",
    gen(r) {
      const x0 = ganz(r, 1, 3);
      const u = ganz(r, -4, 5, [0, 1]), us = ganz(r, -3, 4, [0, 1]), v = ganz(r, 2, 5), vs = ganz(r, -3, 6, [0, 1]);
      const a = ganz(r, 2, 4);
      return {
        text: `Von zwei Funktionen weiß man nur: $u(${x0}) = ${zT(u)}$, $u'(${x0}) = ${zT(us)}$, $v(${x0}) = ${zT(v)}$, $v'(${x0}) = ${zT(vs)}$. Berechne an der Stelle ${x0} die Ableitung von $u \\cdot v$, $\\frac{u}{v}$, $u^{2}$ und $${a}u - v$.`,
        schritte: [
          zahlS("p", "u · v", "Produktregel: $u'v + uv'$.", `$(u \\cdot v)'(${x0}) =$`, us * v + u * vs, { fehler: [{ wert: us * vs, text: "Das ist nur $u' \\cdot v'$." }] }),
          zahlS("q", "u / v", "Quotientenregel: $\\frac{u'v - uv'}{v^2}$.", `$\\left(\\frac{u}{v}\\right)'(${x0}) =$`, q(us * v - u * vs, v * v), { fehler: [{ wert: (u * vs - us * v) / (v * v), text: "Reihenfolge im Zähler: $u'v - uv'$." }] }),
          zahlS("k", "u²", "Kettenregel: $(u^2)' = 2u \\cdot u'$.", `$(u^{2})'(${x0}) =$`, 2 * u * us, { fehler: [{ wert: 2 * u, text: "Die innere Ableitung $u'$ fehlt." }] }),
          zahlS("s", `${a}u − v`, "Faktor- und Summenregel.", `$(${a}u - v)'(${x0}) =$`, a * us - vs),
        ],
        weg: [
          `$(u \\cdot v)' = ${kz(us)} \\cdot ${v} + ${kz(u)} \\cdot ${kz(vs)} = ${zT(us * v + u * vs)}$`,
          `$\\left(\\frac{u}{v}\\right)' = \\frac{${kz(us)} \\cdot ${v} - ${kz(u)} \\cdot ${kz(vs)}}{${v * v}} = ${zT(q(us * v - u * vs, v * v))}$`,
          `$(u^{2})' = 2 \\cdot ${kz(u)} \\cdot ${kz(us)} = ${zT(2 * u * us)}$`,
          `$(${a}u - v)' = ${a} \\cdot ${kz(us)} - ${kz(vs)} = ${zT(a * us - vs)}$`,
        ],
      };
    },
  },
};

/* ===================== Kapitel IV: Tangente, Normale, Anwenden ===================== */
function tangentenFunktion(r, variante) {
  const art = variante || eins(r, ["quad", "quad", "kubik", "kehr", "exp", "sin", "wurzel", "kubPoly"]);
  if (art === "kubik") { const x0 = q(ganz(r, -2, 2, [0])); return { tex: "x^{3}", x0, y: qMul(x0, qMul(x0, x0)), m: qMul(q(3), qMul(x0, x0)), d: "3x^{2}" }; }
  if (art === "kehr") { const x0 = q(ganz(r, 1, 3) * vz(r)); return { tex: "\\frac{1}{x}", x0, y: qDiv(q(1), x0), m: qDiv(q(-1), qMul(x0, x0)), d: "−\\frac{1}{x^{2}}" }; }
  if (art === "wurzel") { const k = ganz(r, 1, 3); const x0 = q(k * k); return { tex: "\\sqrt{x}", x0, y: q(k), m: q(1, 2 * k), d: "\\frac{1}{2\\sqrt{x}}" }; }
  if (art === "exp") return { tex: "e^{x}", x0: q(0), y: q(1), m: q(1), d: "e^{x}" };
  if (art === "sin") return { tex: "\\sin x", x0: q(0), y: q(0), m: q(1), d: "\\cos x" };
  if (art === "kubPoly") {
    const b = ganz(r, -3, 3, [0]), c = ganz(r, -4, 4);
    const F = [[1, 3], [b, 2], [c, 0]];
    const x0 = q(ganz(r, -1, 2, [0]));
    const f = polyT(F), x = qNum(x0);
    return { tex: f.tex, x0, y: alsQ(f.js(x)), m: alsQ(3 * x * x + 2 * b * x), d: polyT([[3, 2], [2 * b, 1]]).tex };
  }
  const g = quad(r); const x0 = q(ganz(r, -3, 3));
  return { tex: quadT(g).tex, x0, y: fw(g, x0), m: qAdd(qMul(qMul(q(2), g.a), x0), g.b), d: quadD(g).tex };
}

export const TYPEN_IV = {
  tangente: {
    titel: "Tangentengleichung",
    gen(r, variante) {
      const t = tangentenFunktion(r, variante);
      const b = qSub(t.y, qMul(t.m, t.x0));
      const soll = linT(t.m, b);
      return {
        text: `Bestimme die Gleichung der Tangente an den Graphen von ${$(`f(x) = ${t.tex}`)} an der Stelle ${$(`x_0 = ${zT(t.x0)}`)}.`,
        schritte: [
          zahlS("y", "Funktionswert", "Berechne den Berührpunkt.", `$f(${zT(t.x0)}) =$`, t.y),
          zahlS("m", "Steigung", `Es gilt $f'(x) = ${t.d}$.`, `$f'(${zT(t.x0)}) =$`, t.m),
          termS("t", "Tangente", "Punkt-Steigungs-Form: $y = f'(x_0)(x - x_0) + f(x_0)$.", "$y =$", soll, {
            fehler: t.x0.z ? [{ js: (x) => qNum(t.m) * x + qNum(t.y), text: "Es heißt $x - x_0$: Die Tangente muss durch den Berührpunkt gehen." }, { js: (x) => qNum(t.m) * (x + qNum(t.x0)) + qNum(t.y), text: "In der Punkt-Steigungs-Form steht $x - x_0$, nicht $x + x_0$." }] : [],
          }),
        ],
        weg: [`$f(${zT(t.x0)}) = ${zT(t.y)}$, $f'(x) = ${t.d}$, $f'(${zT(t.x0)}) = ${zT(t.m)}$`, `${$(`y = ${psf(t.m, t.x0, t.y)}`)}`, `${$(`y = ${soll.tex}`)}`],
      };
    },
  },

  normale: {
    titel: "Normalengleichung",
    gen(r) {
      const a = eins(r, [q(1), q(1), q(2), q(1, 2), q(-1)]);
      const kub = r() < 0.3;
      const x0 = q(ganz(r, -2, 2, [0]));
      const y = kub ? qMul(a, qMul(x0, qMul(x0, x0))) : qMul(a, qMul(x0, x0));
      const m = kub ? qMul(q(3), qMul(a, qMul(x0, x0))) : qMul(q(2), qMul(a, x0));
      const mn = qDiv(q(-1), m);
      const soll = linT(mn, qSub(y, qMul(mn, x0)));
      return {
        text: `Bestimme die Gleichung der Normalen an den Graphen von ${$(`f(x) = ${monomT(a, kub ? 3 : 2).tex}`)} im Punkt ${$(P(x0, y))}.`,
        schritte: [
          zahlS("m", "Tangentensteigung", "Berechne $f'(x_0)$.", `$f'(${zT(x0)}) =$`, m),
          zahlS("n", "Normalensteigung", "Die Normale steht senkrecht: $m_n = -\\frac{1}{f'(x_0)}$.", "$m_n =$", mn, { fehler: [{ wert: -qNum(m), text: "Senkrecht heißt $m_n = -\\frac{1}{m}$ – nicht nur das Vorzeichen wechseln." }] }),
          termS("g", "Normale", "Gerade durch $P$ mit dieser Steigung.", "$y =$", soll),
        ],
        weg: [`$f'(${zT(x0)}) = ${zT(m)}$, $m_n = ${zT(mn)}$`, `${$(`y = ${psf(mn, x0, y)}`)}`, `${$(`y = ${soll.tex}`)}`],
      };
    },
  },

  tangenteDreieck: {
    titel: "Tangente und Dreiecksfläche",
    gen(r) {
      let g, x0, m, b;
      do { g = { a: q(1), b: q(ganz(r, -5, 5)), c: q(ganz(r, -2, 6)) }; x0 = q(ganz(r, -3, 4)); m = qAdd(qMul(q(2), x0), g.b); b = qSub(fw(g, x0), qMul(m, x0)); } while (m.z === 0 || b.z === 0 || Math.abs(qNum(b)) === 1 || Math.abs(qNum(qDiv(b, m))) === 1);
      const nx = qDiv(qNeg(b), m);
      const A = qMul(q(1, 2), qMul(q(Math.abs(b.z), b.n), q(Math.abs(nx.z), nx.n)));
      const soll = linT(m, b);
      return {
        text: `Bestimme die Tangente an ${$(`f(x) = ${quadT(g).tex}`)} im Punkt ${$(P(x0, fw(g, x0)))}. Sie bildet mit den Koordinatenachsen ein Dreieck. Berechne seinen Flächeninhalt.`,
        schritte: [
          termS("t", "Tangente", "Bestimme $f'(x_0)$ und stelle die Tangente auf.", "$y =$", soll),
          zahlS("nx", "Nullstelle", "Wo schneidet die Tangente die $x$-Achse?", "$x =$", nx),
          zahlS("A", "Flächeninhalt", "Rechtwinkliges Dreieck: $\\frac{1}{2} \\cdot$ Grundseite $\\cdot$ Höhe.", "$A =$", A, { fehler: [{ wert: 2 * qNum(A), text: "Beim Dreieck kommt noch der Faktor $\\frac{1}{2}$ dazu." }] }),
        ],
        weg: [`$f'(${zT(x0)}) = ${zT(m)}$, also $y = ${soll.tex}$`, `$y$-Achse bei $${zT(b)}$, $x$-Achse bei $${zT(nx)}$`, `$A = \\frac{1}{2} \\cdot ${zT(q(Math.abs(b.z), b.n))} \\cdot ${zT(q(Math.abs(nx.z), nx.n))} = ${zT(A)}$`],
      };
    },
  },

  tangenteVonAussen: {
    titel: "Tangenten von einem Punkt außerhalb",
    gen(r) {
      const w = ganz(r, 1, 3), k = w * w;
      return {
        text: `Welche Tangenten an die Normalparabel $f(x) = x^{2}$ gehen durch den Punkt ${$(P(0, -k, "Q"))}? Bestimme die Berührpunkte und Gleichungen.`,
        schritte: [
          listeS("x", "Berührstellen", `Ansatz: Tangente an der Stelle $a$ ist $y = 2a(x - a) + a^{2}$. Setze $Q$ ein und löse nach $a$.`, "$a =$", [w, -w]),
          termS("t1", "Steigende Tangente", "Tangente mit positiver Steigung:", "$y =$", linT(2 * w, -k)),
          termS("t2", "Fallende Tangente", "Tangente mit negativer Steigung:", "$y =$", linT(-2 * w, -k)),
        ],
        weg: [`$${MINUS}${k} = 2a(0 - a) + a^{2} = ${MINUS}a^{2}$, also $a = \\pm ${w}$`, `Berührpunkte ${$(P(w, k, "B_1"))} und ${$(P(-w, k, "B_2"))}`, `$y = ${linT(2 * w, -k).tex}$ und $y = ${linT(-2 * w, -k).tex}$`],
      };
    },
  },

  zufluss: {
    titel: "Änderungsrate im Sachzusammenhang",
    gen(r) {
      const [a, b] = eins(r, [[0.5, 3], [0.5, 4.5], [0.5, 6], [1, 6], [1, 9]]);
      const t0 = ganz(r, 1, 3);
      const tm = b / (3 * a), vmax = -3 * a * tm * tm + 2 * b * tm, tab = (2 * b) / (3 * a);
      return {
        text: `Die Wassermenge in einem Speicherbecken wird beschrieben durch $V(t) = ${dezT(-a)}t^{3} + ${dezT(b)}t^{2}$ ($V$ in m³, $t$ in Stunden). Berechne $V'(${t0})$. Wann fließt am meisten Wasser zu? Ab wann nimmt die Wassermenge ab?`.replace("−1t", "−t"),
        schritte: [
          termS("d", "Zuflussrate", "Leite ab.", "$V'(t) =$", polyT([[alsQ(-3 * a), 2], [alsQ(2 * b), 1]], "t", { dez: true }), { var: "t", bereich: [0, 10] }),
          zahlR("v", `V′(${t0})`, "Setze ein.", `$V'(${t0}) =$`, -3 * a * t0 * t0 + 2 * b * t0, { einheit: "m³ pro h" }),
          zahlR("tm", "Größter Zufluss", "Die Zuflussrate $V'$ ist eine nach unten geöffnete Parabel – wo liegt ihr Scheitel?", "$t =$", tm, { einheit: "h" }),
          zahlR("vm", "Größte Rate", "Wie groß ist die Zuflussrate dann?", "$V'_{max} =$", vmax, { einheit: "m³ pro h" }),
          zahlR("ab", "Abnahme", "Ab wann ist $V'(t) < 0$?", "$t >$", tab, { einheit: "h" }),
        ],
        weg: [`$V'(t) = ${dezT(-3 * a)}t^{2} + ${dezT(2 * b)}t$`, `$V'(${t0}) = ${dezT(-3 * a * t0 * t0 + 2 * b * t0)}$ m³ pro h`, `$V''(t) = ${dezT(-6 * a)}t + ${dezT(2 * b)} = 0$ ergibt $t = ${dezT(tm)}$, dort $V' = ${dezT(vmax)}$`, `$V'(t) = 0$ für $t = ${dezT(tab)}$ – danach nimmt die Wassermenge ab.`],
      };
    },
  },

  schar: {
    titel: "Funktionenschar und Tangente",
    gen(r) {
      const x0 = ganz(r, 1, 3), m = ganz(r, -3, 3);
      const a = 2 * x0 - m;
      return {
        text: `Für jedes $a$ ist $f_a(x) = x^{2} - ax$ gegeben. Für welches $a$ ist die Tangente an der Stelle ${x0} parallel zur Geraden ${$(`y = ${monomT(m, 1).tex}`)}${m === 0 ? " (waagrecht)" : ""}?`,
        schritte: [zahlR("a", "Parameter", `Es gilt $f_a'(x) = 2x - a$. Setze $f_a'(${x0}) = ${zT(m)}$.`, "$a =$", a)],
        weg: [`$f_a'(${x0}) = ${2 * x0} - a = ${zT(m)}$`, `$a = ${zT(a)}$`],
      };
    },
  },

  gewinn: {
    titel: "Gewinnfunktion",
    gen(r) {
      const a = eins(r, [0.5, 1, 2]), xm = eins(r, [20, 30, 40, 50]), c = eins(r, [200, 300, 500]);
      const b = 2 * a * xm;
      const x0 = xm - eins(r, [10, 5, -10]);
      const G = polyT([[alsQ(-a), 2], [alsQ(b), 1], [-c, 0]], "x", { dez: true });
      return {
        text: `Ein Betrieb macht beim Verkauf von $x$ Stück den Gewinn $G(x) = ${G.tex}$ (in €). Berechne $G'(${x0})$ und deute den Wert. Bei welcher Stückzahl ist der Gewinn am größten?`,
        schritte: [
          zahlR("g", `G′(${x0})`, "Leite ab und setze ein.", `$G'(${x0}) =$`, -2 * a * x0 + b, { einheit: "€ pro Stück" }),
          zahlR("x", "Größter Gewinn", "Waagrechte Tangente: $G'(x) = 0$.", "$x =$", xm, { einheit: "Stück" }),
        ],
        weg: [`$G'(x) = ${polyT([[alsQ(-2 * a), 1], [alsQ(b), 0]], "x", { dez: true }).tex}$`, `$G'(${x0}) = ${dezT(-2 * a * x0 + b)}$: Ein weiteres Stück ${-2 * a * x0 + b > 0 ? "erhöht" : "senkt"} den Gewinn um etwa ${zTxt(Math.abs(-2 * a * x0 + b))} €.`, `$G'(x) = 0$ ergibt $x = ${xm}$ Stück.`],
      };
    },
  },
};
