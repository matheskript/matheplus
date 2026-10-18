/* ======================================================================
   diffAufgaben1.js – Aufgabentypen zu Kapitel I und II des Kurses
   Differentialrechnung (Geraden, Änderungsrate, Differenzenquotient,
   h-Methode, Ableitung an einer Stelle, Ableitungsfunktion).
   Jeder Typ: gen(r, variante) → { text, schritte, weg, skizze?, tabelle? }
   r = Zufallsquelle (diffKern.zufall). Reine Logik, kein React.
   ====================================================================== */
import { ggT } from "./rechnen2.js";
import {
  q, qAdd, qSub, qMul, qDiv, qNeg, qNum, Q, ganz, eins, vz, MINUS,
  zT, dezT, zTxt, zahlT, varT, monomT, polyT, summeT, malT, linT, bruchT, negT, hochT, klammerT,
  geradeTex, zahlS, zahlR, wahlS, termS,
} from "./diffKern.js";

const $ = (t) => `$${t}$`;
const P = (x, y, name = "P", o) => `${name}(${zT(x, o)} \\mid ${zT(y, o)})`;
/* Zahl in Klammern, wenn negativ (für Einsetzen) */
const kz = (a, o) => { const b = Q(a); return b.z < 0 ? `(${zT(b, o)})` : zT(b, o); };
/* „z/n = gekürzt“ – nur so viele Glieder, wie nötig */
function quot(z, n, o) {
  const zz = Q(z), nn = Q(n);
  const w = qDiv(zz, nn);
  const roh = `\\frac{${zT(zz, o)}}{${zT(nn, o)}}`;
  if (nn.z === nn.n && nn.n === 1) return zT(w, o);
  return roh === zT(w, o) ? roh : `${roh} = ${zT(w, o)}`;
}
/* „y = m(x − x₀) + y₀, also y = mx + b“ – ohne doppelte Zeile, wenn beides gleich aussieht */
function yZeile(m, x0, y0, soll) {
  const p = psf(m, x0, y0);
  return p === soll.tex ? `$y = ${soll.tex}$` : `$y = ${p}$, also $y = ${soll.tex}$`;
}
const steigtText = (m) => (qNum(Q(m)) > 0 ? "steigt" : qNum(Q(m)) < 0 ? "fällt" : "ist waagrecht");
const STEIGT = [["steigt", "steigt"], ["faellt", "fällt"], ["waagrecht", "waagrecht"]];
const steigtId = (m) => (qNum(Q(m)) > 0 ? "steigt" : qNum(Q(m)) < 0 ? "faellt" : "waagrecht");
const BRUECHE = [q(1, 2), q(-1, 2), q(1, 3), q(-1, 3), q(2, 3), q(-2, 3), q(3, 2), q(-3, 2), q(1, 4), q(-1, 4)];
const steigung = (r, { null0 = false, bruch = 0.35 } = {}) => {
  if (r() < bruch) return eins(r, BRUECHE);
  return q(ganz(r, -4, 4, null0 ? [] : [0]));
};
/* Gerade durch P(x0|y0) mit Steigung m: y = m(x − x0) + y0 als TeX */
function psf(m, x0, y0) {
  if (Q(x0).z === 0) return linT(m, y0).tex;
  const klam = malT(zahlT(m), linT(1, qNeg(Q(x0))));
  return summeT([[1, klam], [1, zahlT(y0)]]).tex;
}

/* ===================== Kapitel I: Geraden ===================== */
export const TYPEN_I = {
  steigung2p: {
    titel: "Steigung aus zwei Punkten",
    gen(r) {
      let x1, x2, y1, y2;
      do { x1 = ganz(r, -5, 4); x2 = ganz(r, -4, 6); y1 = ganz(r, -6, 6); y2 = ganz(r, -6, 6); } while (x1 === x2 || Math.abs(x2 - x1) > 7);
      const m = q(y2 - y1, x2 - x1), dy = y2 - y1, dx = x2 - x1;
      const fehler = [];
      if (dy !== 0) fehler.push({ wert: dx / dy, text: "Du hast $\\Delta x$ durch $\\Delta y$ geteilt. Oben steht der Höhenunterschied $\\Delta y$, unten $\\Delta x$." });
      if (dy !== 0) fehler.push({ wert: -qNum(m), text: "Vorzeichenfehler: Oben und unten muss dieselbe Reihenfolge stehen – erst B, dann A." });
      return {
        text: `Berechne die Steigung der Geraden durch ${$(P(x1, y1, "A"))} und ${$(P(x2, y2, "B"))}. Steigt oder fällt sie?`,
        schritte: [
          zahlS("m", "Steigung", "Berechne $m = \\frac{y_2 - y_1}{x_2 - x_1}$.", "$m =$", m, { fehler, hinweis: `$\\Delta y = ${kz(y2)} ${MINUS} ${kz(y1)}$ und $\\Delta x = ${kz(x2)} ${MINUS} ${kz(x1)}$.` }),
          wahlS("lage", "Verlauf", "Steigt die Gerade, fällt sie oder ist sie waagrecht?", STEIGT, steigtId(m), { hinweis: "Das Vorzeichen von $m$ entscheidet." }),
        ],
        weg: [`$m = \\frac{${kz(y2)} ${MINUS} ${kz(y1)}}{${kz(x2)} ${MINUS} ${kz(x1)}} = ${quot(dy, dx)}$`, `Die Gerade ${steigtText(m)}.`],
      };
    },
  },

  mbAblesen: {
    titel: "Steigung und y-Achsenabschnitt ablesen",
    gen(r) {
      const m = r() < 0.15 ? q(0) : steigung(r);
      const b = q(ganz(r, -7, 7, [0]));
      const unsortiert = m.z !== 0 && r() < 0.45;
      const term = m.z === 0 ? zahlT(b) : unsortiert ? summeT([[1, zahlT(b)], [1, monomT(m, 1)]]) : linT(m, b);
      const fehler = unsortiert ? [{ wert: qNum(b), text: "Erst sortieren: Die Steigung ist die Zahl vor dem $x$, egal wo sie steht." }] : [];
      return {
        text: `Gib Steigung und $y$-Achsenabschnitt der Geraden ${$(`y = ${term.tex}`)} an. Steigt oder fällt sie?`,
        schritte: [
          zahlS("m", "Steigung", "Welche Zahl steht vor dem $x$?", "$m =$", m, { fehler, hinweis: m.z === 0 ? "Hier kommt gar kein $x$ vor." : "Sortiere zur Form $y = mx + b$." }),
          zahlS("b", "y-Achsenabschnitt", "Wo schneidet die Gerade die $y$-Achse?", "$b =$", b, { fehler: unsortiert ? [{ wert: qNum(m), text: "Das ist die Steigung. Der Achsenabschnitt ist der Summand ohne $x$." }] : [], hinweis: "Setze $x = 0$ ein." }),
          wahlS("lage", "Verlauf", "Steigt die Gerade, fällt sie oder ist sie waagrecht?", STEIGT, steigtId(m)),
        ],
        weg: [`${$(`y = ${linT(m, b).tex}`)}, also ${$(`m = ${zT(m)}`)} und ${$(`b = ${zT(b)}`)}.`, `Die Gerade ${steigtText(m)}.`],
      };
    },
  },

  punktSteigung: {
    titel: "Gerade durch einen Punkt mit gegebener Steigung",
    gen(r) {
      const m = steigung(r, { null0: true, bruch: 0.3 });
      const x0 = q(ganz(r, -5, 6, [0]) * (m.n === 1 ? 1 : m.n > 2 ? 1 : 2)), y0 = q(ganz(r, -6, 7));
      const b = qAdd(y0, qNeg(qMul(m, x0)));
      const soll = linT(m, b);
      const falsch = linT(m, qAdd(y0, qMul(m, x0)));
      return {
        text: `Bestimme die Gleichung der Geraden durch ${$(P(x0, y0))} mit der Steigung ${$(`m = ${zT(m)}`)}.`,
        schritte: [
          zahlS("b", "Achsenabschnitt", `Setze ${$(P(x0, y0))} in $y = mx + b$ ein und löse nach $b$ auf.`, "$b =$", b, {
            fehler: [{ wert: qNum(qAdd(y0, qMul(m, x0))), text: "Vorzeichenfehler beim Umstellen: $b = y_0 - m \\cdot x_0$." }],
            hinweis: `$${zT(y0)} = ${zT(m)} \\cdot ${kz(x0)} + b$`,
          }),
          termS("g", "Geradengleichung", "Gib die Gleichung an.", "$y =$", soll, { fehler: [{ js: falsch.js, text: "In der Punkt-Steigungs-Form steht $x - x_0$, nicht $x + x_0$." }] }),
        ],
        weg: [
          `Punkt-Steigungs-Form: ${$(`y = m(x - x_0) + y_0`)}`,
          `${$(`y = ${psf(m, x0, y0)}`)}`,
          `${$(`y = ${soll.tex}`)}`,
        ],
      };
    },
  },

  zweiPunkte: {
    titel: "Gerade durch zwei Punkte",
    gen(r) {
      let x1, x2, y1, y2;
      do { x1 = ganz(r, -5, 4); x2 = ganz(r, -3, 6); y1 = ganz(r, -6, 7); y2 = ganz(r, -6, 7); } while (x1 === x2 || Math.abs(x2 - x1) > 6 || (y2 - y1) % (x2 - x1) !== 0 && r() < 0.6);
      const m = q(y2 - y1, x2 - x1), b = qSub(q(y1), qMul(m, q(x1)));
      const soll = linT(m, b);
      return {
        text: `Bestimme die Gleichung der Geraden durch ${$(P(x1, y1, "A"))} und ${$(P(x2, y2, "B"))}.`,
        schritte: [
          zahlS("m", "Steigung", "Berechne zuerst die Steigung.", "$m =$", m, { fehler: y2 !== y1 ? [{ wert: (x2 - x1) / (y2 - y1), text: "Kehrwert: oben $\\Delta y$, unten $\\Delta x$." }] : [] }),
          termS("g", "Geradengleichung", "Setze einen der Punkte ein und gib die Gleichung an.", "$y =$", soll),
        ],
        weg: [`$m = \\frac{${kz(y2)} ${MINUS} ${kz(y1)}}{${kz(x2)} ${MINUS} ${kz(x1)}} = ${quot(y2 - y1, x2 - x1)}$`, `${$(`y = ${psf(m, x1, y1)}`)}`, `${$(`y = ${soll.tex}`)}`],
      };
    },
  },

  parallel: {
    titel: "Parallele durch einen Punkt",
    gen(r) {
      let ax, ay, bx, by;
      do { ax = ganz(r, -4, 3); ay = ganz(r, -4, 4); bx = ganz(r, -2, 6); by = ganz(r, -5, 7); } while (ax === bx || by === ay);
      const m = q(by - ay, bx - ax);
      const px = q(ganz(r, -4, 4, [0]) * m.n), py = q(ganz(r, -5, 5));
      const b = qSub(py, qMul(m, px));
      const soll = linT(m, b);
      return {
        text: `Bestimme die Gerade durch ${$(P(px, py))}, die parallel zur Geraden durch ${$(P(ax, ay, "A"))} und ${$(P(bx, by, "B"))} verläuft.`,
        schritte: [
          zahlS("m", "Steigung", "Parallele Geraden haben dieselbe Steigung. Berechne $m_{AB}$.", "$m =$", m),
          termS("g", "Geradengleichung", `Gerade durch ${$(P(px, py))} mit dieser Steigung:`, "$y =$", soll),
        ],
        weg: [`$m_{AB} = ${quot(by - ay, bx - ax)}$`, `${$(`y = ${psf(m, px, py)}`)}`, `${$(`y = ${soll.tex}`)}`],
      };
    },
  },

  senkrecht: {
    titel: "Senkrechte Gerade und Schnittpunkt",
    gen(r) {
      const m1 = eins(r, [q(1), q(-1), q(2), q(-2), q(3), q(-3), q(1, 2), q(-1, 2), q(1, 3), q(-1, 3)]);
      const c = q(ganz(r, -4, 4));
      const m2 = qDiv(q(-1), m1);
      const px = q(ganz(r, -4, 5, [0]) * m2.n), py = q(ganz(r, -4, 5));
      const b2 = qSub(py, qMul(m2, px));
      const sx = qDiv(qSub(b2, c), qSub(m1, m2)), sy = qAdd(qMul(m1, sx), c);
      const soll = linT(m2, b2);
      return {
        text: `Bestimme die Gerade durch ${$(P(px, py))}, die senkrecht auf ${$(`y = ${linT(m1, c).tex}`)} steht. In welchem Punkt schneiden sich die beiden Geraden?`,
        schritte: [
          zahlS("m", "Steigung der Senkrechten", "Für senkrechte Geraden gilt $m_1 \\cdot m_2 = -1$.", "$m_2 =$", m2, {
            fehler: [{ wert: -qNum(m1), text: "Nur das Vorzeichen zu wechseln reicht nicht: Es gilt $m_2 = -\\frac{1}{m_1}$." }, { wert: 1 / qNum(m1), text: "Der Kehrwert allein reicht nicht – das Vorzeichen wechselt auch." }],
          }),
          termS("g", "Geradengleichung", "Gib die Gleichung der Senkrechten an.", "$y =$", soll),
          zahlS("sx", "Schnittstelle", "Setze beide Gleichungen gleich und löse nach $x$ auf.", "$x =$", sx),
          zahlS("sy", "Schnittpunkt", "Setze $x$ in eine der beiden Gleichungen ein.", "$y =$", sy),
        ],
        weg: [
          `$m_2 = -\\frac{1}{${zT(m1)}} = ${zT(m2)}$`,
          yZeile(m2, px, py, soll),
          `${$(`${linT(m1, c).tex} = ${soll.tex}`)} ergibt ${$(`x = ${zT(sx)}`)}`,
          `Schnittpunkt ${$(P(sx, sy, "S"))}`,
        ],
      };
    },
  },

  achsenschnitt: {
    titel: "Schnittpunkte mit den Achsen",
    gen(r) {
      const m = steigung(r, { bruch: 0.4 });
      const b = q(ganz(r, -6, 6, [0]));
      const k1 = ganz(r, -3, 1), k2 = ganz(r, 2, 4);
      const x1 = q(k1 * m.n), x2 = q(k2 * m.n);
      const y1 = qAdd(qMul(m, x1), b), y2 = qAdd(qMul(m, x2), b);
      const nx = qDiv(qNeg(b), m);
      return {
        text: `Die Gerade $g$ geht durch ${$(P(x1, y1, "A"))} und ${$(P(x2, y2, "B"))}. In welchem Punkt schneidet sie die $x$-Achse, in welchem die $y$-Achse?`,
        schritte: [
          zahlS("m", "Steigung", "Berechne die Steigung.", "$m =$", m),
          zahlS("b", "y-Achse", "Bestimme $b$: Der Schnittpunkt mit der $y$-Achse ist $S_y(0 \\mid b)$.", "$b =$", b),
          zahlS("nx", "x-Achse", "Setze $y = 0$ und löse nach $x$ auf.", "$x =$", nx, { fehler: [{ wert: qNum(qDiv(b, m)), text: "Vorzeichen: Aus $0 = mx + b$ folgt $x = -\\frac{b}{m}$." }] }),
        ],
        weg: [`$m = ${quot(qSub(y2, y1), qSub(x2, x1))}$`, `${$(`y = ${linT(m, b).tex}`)}, also ${$(`S_y(0 \\mid ${zT(b)})`)}`, `${$(`0 = ${linT(m, b).tex}`)} ergibt ${$(`x = ${zT(nx)}`)}, also ${$(`S_x(${zT(nx)} \\mid 0)`)}`],
      };
    },
  },

  punktAufGerade: {
    titel: "Fehlende Koordinate bestimmen",
    gen(r) {
      const m = eins(r, BRUECHE);
      const px = q(ganz(r, -3, 3)), py = q(ganz(r, -4, 5));
      const xq = qAdd(px, q(ganz(r, 1, 3) * m.n * (r() < 0.3 ? -1 : 1)));
      const a = qAdd(qMul(m, qSub(xq, px)), py);
      return {
        text: `Für welchen Wert von $a$ liegt der Punkt ${$(`Q(${zT(xq)} \\mid a)`)} auf der Geraden durch ${$(P(px, py))} mit der Steigung ${$(zT(m))}?`,
        schritte: [zahlS("a", "Wert von a", "Stelle die Geradengleichung auf und setze $x$ von $Q$ ein.", "$a =$", a, { hinweis: `${$(`y = ${psf(m, px, py)}`)}` })],
        weg: [`${$(`y = ${psf(m, px, py)}`)}`, `Für ${$(`x = ${zT(xq)}`)}: ${$(`y = ${zT(m)} \\cdot ${kz(qSub(xq, px))} + ${kz(py)} = ${zT(a)}`)}, also ${$(`a = ${zT(a)}`)}.`],
      };
    },
  },

  prozent: {
    titel: "Steigung in Prozent",
    gen(r) {
      const L = eins(r, [100, 200, 250, 400, 500, 800, 1000]);
      const p = eins(r, [2.5, 3, 4, 5, 6, 7.5, 8, 10, 12]);
      const H = (L * p) / 100;
      const m = p / 100;
      const grenze = 6;
      return {
        text: `Eine Straße steigt auf ${zTxt(L)} m waagrechter Strecke um ${zTxt(H)} m. Gib die Steigung als Dezimalzahl und in Prozent an. Darf hier ein Rollstuhl fahren, wenn höchstens ${grenze} % erlaubt sind?`,
        schritte: [
          zahlR("m", "Steigung", "Steigung = Höhe durch waagrechte Strecke.", "$m =$", m, { fehler: [{ wert: L / H, text: "Umgekehrt: Höhe durch Strecke, nicht Strecke durch Höhe." }] }),
          zahlR("p", "In Prozent", "Prozent heißt „von Hundert“.", "", p, { einheit: "%" }),
          wahlS("rolli", "Rollstuhl", `Höchstens ${grenze} % sind erlaubt. Darf ein Rollstuhl hier fahren?`, [["ja", "ja"], ["nein", "nein"]], p <= grenze ? "ja" : "nein"),
        ],
        weg: [`$m = \\frac{${zTxt(H).replace(",", "{,}")}}{${L}} = ${dezT(m)} = ${dezT(p)}\\,\\%$`, p <= grenze ? `Höchstens ${grenze} % – ein Rollstuhl darf fahren.` : `Mehr als ${grenze} % – für Rollstühle zu steil.`],
      };
    },
  },

  kollinear: {
    titel: "Liegen drei Punkte auf einer Geraden?",
    gen(r) {
      const dx = ganz(r, 1, 4), dy = ganz(r, -5, 5, [0]);
      const ax = ganz(r, -4, 1), ay = ganz(r, -5, 3);
      const bx = ax + dx, by = ay + dy;
      const k = ganz(r, 1, 2);
      const auf = r() < 0.5;
      const cx = bx + k * dx, cy = by + k * dy + (auf ? 0 : vz(r));
      const m1 = q(dy, dx), m2 = q(cy - by, cx - bx);
      return {
        text: `Liegen die Punkte ${$(P(ax, ay, "A"))}, ${$(P(bx, by, "B"))} und ${$(P(cx, cy, "C"))} auf einer Geraden? Begründe mit Steigungen.`,
        schritte: [
          zahlS("m1", "Steigung AB", "Berechne die Steigung von $A$ nach $B$.", "$m_{AB} =$", m1),
          zahlS("m2", "Steigung BC", "Berechne die Steigung von $B$ nach $C$.", "$m_{BC} =$", m2),
          wahlS("auf", "Entscheidung", "Liegen die drei Punkte auf einer Geraden?", [["ja", "ja"], ["nein", "nein"]], auf ? "ja" : "nein", { hinweis: "Gleiche Steigung und gemeinsamer Punkt $B$ – dann ja." }),
        ],
        weg: [`$m_{AB} = ${quot(dy, dx)}$ und $m_{BC} = ${quot(cy - by, cx - bx)}$`, auf ? "Gleiche Steigung und gemeinsamer Punkt $B$: Die Punkte liegen auf einer Geraden." : "Die Steigungen sind verschieden: Die Punkte liegen nicht auf einer Geraden."],
      };
    },
  },

  linGrund: {
    titel: "Lineare Funktion im Sachzusammenhang",
    gen(r) {
      const K = eins(r, [
        { was: "Ein Taxi kostet", g: eins(r, [3, 3.5, 4, 4.5, 5]), k: eins(r, [1.8, 2, 2.2, 2.5, 2.8]), ein: "Kilometer", x: "$x$ = Strecke in km", xw: eins(r, [8, 12, 15]), steig: "Preis pro Kilometer", grund: "Grundgebühr" },
        { was: "Ein Handytarif kostet", g: eins(r, [5, 8, 10, 12]), k: eins(r, [2, 2.5, 3, 4]), ein: "GB Datenvolumen", x: "$x$ = Datenvolumen in GB", xw: eins(r, [4, 6, 10]), steig: "Preis pro GB", grund: "Grundpreis" },
        { was: "Ein Fitnessstudio verlangt", g: eins(r, [20, 30, 40, 50]), k: eins(r, [19, 25, 29, 35]), ein: "Monat", x: "$x$ = Anzahl der Monate", xw: eins(r, [6, 12]), steig: "Beitrag pro Monat", grund: "Aufnahmegebühr" },
      ]);
      const term = linT(alsQ2(K.k), alsQ2(K.g), "x");
      const t2 = polyT([[alsQ2(K.k), 1], [alsQ2(K.g), 0]], "x", { dez: true });
      return {
        text: `${K.was} ${euroT(K.g)} ${K.grund} und ${euroT(K.k)} pro ${K.ein}. Stelle den Preis $p(x)$ als lineare Funktion dar (${K.x}). Was kostet es bei $x = ${K.xw}$?`,
        schritte: [
          termS("p", "Funktionsterm", "Grundbetrag plus Betrag pro Einheit mal Anzahl.", "$p(x) =$", term, { fehler: [{ js: (x) => K.g * x + K.k, text: "Vertauscht: Der Betrag pro Einheit gehört vor das $x$." }] }),
          wahlS("deut", "Bedeutung", "Was bedeutet die Steigung?", mischeFest([["s", K.steig], ["g", K.grund], ["p", "der Gesamtpreis"]], K.xw), "s"),
          zahlR("w", "Preis", `Berechne $p(${K.xw})$.`, `$p(${K.xw}) =$`, K.k * K.xw + K.g, { einheit: "€" }),
        ],
        weg: [`${$(`p(x) = ${t2.tex}`)}`, `Steigung: ${K.steig}, Achsenabschnitt: ${K.grund}.`, `${$(`p(${K.xw}) = ${dezT(K.k)} \\cdot ${K.xw} + ${dezT(K.g)} = ${dezT(K.k * K.xw + K.g)}`)} €`],
      };
    },
  },

  linZwei: {
    titel: "Linearer Preis aus zwei Angaben",
    gen(r) {
      const k = eins(r, [2, 2.5, 3, 4]), g = eins(r, [5, 7, 8, 10]);
      const x1 = ganz(r, 2, 3), x2 = x1 + ganz(r, 2, 4), x3 = x2 + ganz(r, 2, 4);
      const p = (x) => g + k * x;
      return {
        text: `Ein Handyvertrag kostet bei ${x1} GB Datenvolumen ${euroT(p(x1))} und bei ${x2} GB ${euroT(p(x2))}. Der Preis hängt linear vom Volumen ab. Was kosten ${x3} GB?`,
        schritte: [
          zahlR("m", "Steigung", "Preisunterschied durch Volumenunterschied.", "$m =$", k, { einheit: "€ pro GB" }),
          zahlR("b", "Grundpreis", "Setze einen Punkt in $p(x) = mx + b$ ein.", "$b =$", g, { einheit: "€" }),
          zahlR("w", "Preis", `Berechne den Preis für ${x3} GB.`, `$p(${x3}) =$`, p(x3), { einheit: "€" }),
        ],
        weg: [`$m = \\frac{${dezT(p(x2))} - ${dezT(p(x1))}}{${x2} - ${x1}} = ${dezT(k)}$`, `$b = ${dezT(p(x1))} - ${dezT(k)} \\cdot ${x1} = ${dezT(g)}$`, `$p(${x3}) = ${dezT(k)} \\cdot ${x3} + ${dezT(g)} = ${dezT(p(x3))}$ €`, "Steigung: Preis pro GB, Achsenabschnitt: Grundpreis."],
      };
    },
  },

  kerze: {
    titel: "Abnehmende lineare Größe",
    gen(r) {
      const m = eins(r, [1, 1.5, 2, 2.5, 3]);
      const T = eins(r, [8, 10, 12, 14]);
      const b = m * T;
      const t1 = ganz(r, 1, 3), t2 = t1 + ganz(r, 2, 4);
      const h = (t) => b - m * t;
      return {
        text: `Eine Kerze ist nach ${t1} Stunden noch ${zTxt(h(t1))} cm und nach ${t2} Stunden noch ${zTxt(h(t2))} cm hoch. Sie brennt gleichmäßig ab. Wie hoch war sie am Anfang, wann ist sie abgebrannt?`,
        schritte: [
          zahlR("m", "Steigung", "Höhenänderung durch Zeitunterschied (sie nimmt ab!).", "$m =$", -m, { einheit: "cm pro h", fehler: [{ wert: m, text: "Die Kerze wird kürzer – die Steigung ist negativ." }] }),
          zahlR("b", "Anfangshöhe", "Der $y$-Achsenabschnitt ist die Höhe zur Zeit $t = 0$.", "$h(0) =$", b, { einheit: "cm" }),
          zahlR("t", "Abgebrannt", "Setze $h(t) = 0$.", "$t =$", T, { einheit: "h" }),
        ],
        weg: [`$m = \\frac{${dezT(h(t2))} - ${dezT(h(t1))}}{${t2} - ${t1}} = ${dezT(-m)}$`, `$h(t) = ${dezT(-m)}t + ${dezT(b)}$ (Anfangshöhe ${zTxt(b)} cm)`, `$0 = ${dezT(-m)}t + ${dezT(b)}$ ergibt $t = ${T}$: nach ${T} Stunden abgebrannt.`],
      };
    },
  },

  geradeAusGraph: {
    titel: "Geradengleichung aus dem Graphen",
    gen(r) {
      const m = eins(r, [q(2), q(-2), q(1), q(-1), q(1, 2), q(-1, 2), q(3), q(-3), q(1, 3), q(-1, 3), q(2, 3), q(-3, 2), q(0)]);
      const b = q(ganz(r, -3, 3));
      const soll = linT(m, b);
      return {
        text: "Gib die Gleichung der abgebildeten Geraden an. Lies dazu den $y$-Achsenabschnitt und ein Steigungsdreieck ab.",
        skizze: { kurven: [{ f: soll.js }], x0: -5, x1: 5, y0: -5, y1: 5 },
        schritte: [
          zahlS("b", "y-Achsenabschnitt", "Wo schneidet die Gerade die $y$-Achse?", "$b =$", b),
          zahlS("m", "Steigung", "Gehe vom Schnittpunkt aus nach rechts und zähle, wie weit es hoch oder runter geht.", "$m =$", m),
          termS("g", "Gleichung", "Gib die Gleichung an.", "$y =$", soll),
        ],
        weg: [`Achsenabschnitt ${$(`b = ${zT(b)}`)}, Steigung ${$(`m = ${zT(m)}`)}`, `${$(`y = ${soll.tex}`)}`],
      };
    },
  },
};

function alsQ2(v) { return Number.isInteger(v) ? q(v) : q(Math.round(v * 100), 100); }
function euroT(v) { return `${zTxt(v, 2).replace(/,(\d)$/, ",$10")} €`; }
function mischeFest(liste, seed) { const k = Math.abs(seed) % liste.length; return [...liste.slice(k), ...liste.slice(0, k)]; }

/* ===================== Kapitel I: Änderungsrate ===================== */
/* Funktionen mit exakten Werten: f(x) als Bruch */
const FKT = {
  quadrat: { tex: "x^{2}", w: (x) => qMul(x, x) },
  kubik: { tex: "x^{3}", w: (x) => qMul(x, qMul(x, x)) },
  kehr: { tex: "\\frac{1}{x}", w: (x) => qDiv(q(1), x), pos: true },
  wurzel: { tex: "\\sqrt{x}", w: (x) => q(Math.round(Math.sqrt(qNum(x)))), quadratzahl: true },
};
function rateFunktion(r) {
  const art = eins(r, ["quadrat", "quadrat", "kubik", "kehr", "wurzel", "linear", "quadPlus", "kubMinus"]);
  if (art === "linear") { const m = ganz(r, -3, 4, [0]), c = ganz(r, -5, 5); return { tex: linT(m, c).tex, w: (x) => qAdd(qMul(q(m), x), q(c)), iv: () => { const a = ganz(r, -3, 2); return [a, a + ganz(r, 2, 8)]; } }; }
  if (art === "quadPlus") { const p = ganz(r, -4, 4, [0]); return { tex: polyT([[1, 2], [p, 1]]).tex, w: (x) => qAdd(qMul(x, x), qMul(q(p), x)), iv: () => { const a = ganz(r, -2, 2); return [a, a + 2]; } }; }
  if (art === "kubMinus") return { tex: "x^{3} − x", w: (x) => qSub(qMul(x, qMul(x, x)), x), iv: () => { const a = ganz(r, -1, 1); return [a, a + 2]; } };
  const f = FKT[art];
  return {
    tex: f.tex, w: f.w,
    iv: () => {
      if (f.quadratzahl) { const a = ganz(r, 0, 4), b = ganz(r, a + 1, a + 4); return [a * a, b * b]; }
      if (f.pos) { const a = ganz(r, 1, 3); return [a, a + ganz(r, 1, 4)]; }
      if (art === "kubik") { const a = ganz(r, -2, 1); return [a, a + ganz(r, 1, 2)]; }
      const a = ganz(r, -4, 3); return [a, a + ganz(r, 1, 4)];
    },
  };
}

export const TYPEN_I2 = {
  mittlereRate: {
    titel: "Mittlere Änderungsrate berechnen",
    gen(r) {
      const f = rateFunktion(r);
      const [a, b] = f.iv();
      const fa = f.w(q(a)), fb = f.w(q(b));
      const rate = qDiv(qSub(fb, fa), q(b - a));
      return {
        text: `Berechne die mittlere Änderungsrate von ${$(`f(x) = ${f.tex}`)} im Intervall ${$(`[${zT(a)};\\,${zT(b)}]`)}.`,
        schritte: [
          zahlS("fa", "Wert am Anfang", "Berechne den Funktionswert am linken Rand.", `$f(${zT(a)}) =$`, fa),
          zahlS("fb", "Wert am Ende", "Berechne den Funktionswert am rechten Rand.", `$f(${zT(b)}) =$`, fb),
          zahlS("r", "Änderungsrate", "Teile die Änderung der Funktionswerte durch die Intervallbreite.", "$\\frac{f(b) - f(a)}{b - a} =$", rate, {
            fehler: [{ wert: qNum(qSub(fb, fa)), text: "Das ist nur die Änderung $f(b) - f(a)$. Teile noch durch die Breite $b - a$." }],
          }),
        ],
        weg: [`$f(${zT(a)}) = ${zT(fa)}$, $f(${zT(b)}) = ${zT(fb)}$`, `$\\frac{${zT(fb)} ${MINUS} ${kz(fa)}}{${kz(b)} ${MINUS} ${kz(a)}} = ${quot(qSub(fb, fa), q(b - a))}$`],
      };
    },
  },

  sekante: {
    titel: "Sekantengleichung aufstellen",
    gen(r, variante) {
      const kub = variante === "kubisch" || r() < 0.25;
      const p = kub ? 0 : ganz(r, -3, 3);
      const f = kub ? { tex: "x^{3} − x", w: (x) => qSub(qMul(x, qMul(x, x)), x) } : { tex: polyT([[1, 2], [p, 1]]).tex, w: (x) => qAdd(qMul(x, x), qMul(q(p), x)) };
      const x1 = ganz(r, -3, 1), x2 = x1 + ganz(r, 1, 3);
      const y1 = f.w(q(x1)), y2 = f.w(q(x2));
      const m = qDiv(qSub(y2, y1), q(x2 - x1)), b = qSub(y1, qMul(m, q(x1)));
      const soll = linT(m, b);
      return {
        text: `Bestimme die Gleichung der Sekante an den Graphen von ${$(`f(x) = ${f.tex}`)} durch die Punkte mit $x = ${zT(x1)}$ und $x = ${zT(x2)}$.`,
        schritte: [
          zahlS("m", "Steigung", "Die Steigung der Sekante ist die mittlere Änderungsrate.", "$m =$", m),
          termS("g", "Sekante", `Gerade durch ${$(P(x1, y1))} mit dieser Steigung:`, "$y =$", soll),
        ],
        weg: [`Punkte ${$(P(x1, y1))} und ${$(P(x2, y2, "Q"))}`, `$m = ${quot(qSub(y2, y1), q(x2 - x1))}$`, yZeile(m, x1, y1, soll)],
      };
    },
  },

  durchschnitt: {
    titel: "Durchschnittsgeschwindigkeit und momentane Geschwindigkeit",
    gen(r) {
      const c = eins(r, [2, 2.5, 4, 5, 0.5]);
      const t0 = ganz(r, 1, 3);
      const hs = [1, 0.5, 0.1];
      const sT = `${dezT(c)}t^{2}`;
      const v = (h) => c * (2 * t0 + h);
      return {
        text: `Ein Körper bewegt sich nach $s(t) = ${sT}$ ($s$ in m, $t$ in s). Berechne seine Durchschnittsgeschwindigkeit in den Intervallen ${hs.map((h) => `$[${t0};\\,${dezT(t0 + h)}]$`).join(", ")}. Welche Geschwindigkeit vermutest du genau zum Zeitpunkt $t = ${t0}$?`,
        schritte: [
          ...hs.map((h, i) => zahlR(`v${i}`, `Intervall [${t0}; ${zTxt(t0 + h)}]`, "Weg-Änderung durch Zeit-Änderung.", `$v_m =$`, v(h), { einheit: "m/s", tol: 1e-6 })),
          zahlR("v", "Vermutung", `Welchem Wert nähern sich die Ergebnisse, wenn das Intervall immer kleiner wird?`, `$v(${t0}) \\approx$`, 2 * c * t0, { einheit: "m/s" }),
        ],
        weg: [
          ...hs.map((h) => `$\\frac{s(${dezT(t0 + h)}) - s(${t0})}{${dezT(h)}} = \\frac{${dezT(c * (t0 + h) ** 2)} - ${dezT(c * t0 * t0)}}{${dezT(h)}} = ${dezT(v(h))}$`),
          `Die Werte nähern sich ${zTxt(2 * c * t0)} m/s.`,
        ],
      };
    },
  },

  tabelleRate: {
    titel: "Mittlere Rate aus einer Tabelle",
    gen(r) {
      let d;
      do { d = [ganz(r, 2, 9) * 5, ganz(r, 2, 9) * 5, ganz(r, 1, 6) * 5, ganz(r, 1, 4) * 5]; } while (new Set(d).size < 4 || d.filter((x) => x === Math.max(...d)).length > 1);
      const V = [0, d[0], d[0] + d[1], d[0] + d[1] + d[2], d[0] + d[1] + d[2] + d[3]];
      const max = d.indexOf(Math.max(...d));
      const abschnitte = [["0", "0 bis 2 min"], ["1", "2 bis 4 min"], ["2", "4 bis 6 min"], ["3", "6 bis 8 min"]];
      return {
        text: "In eine Badewanne läuft Wasser. Die Tabelle zeigt die Wassermenge. Berechne die mittlere Zuflussrate in den ersten und in den letzten vier Minuten. In welchem Zwei-Minuten-Abschnitt fließt im Mittel am meisten zu?",
        tabelle: { kopf: ["Zeit (min)", "0", "2", "4", "6", "8"], zeilen: [["Wasser (Liter)", ...V.map(String)]] },
        schritte: [
          zahlR("r1", "Erste vier Minuten", "Änderung der Wassermenge durch 4 Minuten.", "Rate:", V[2] / 4, { einheit: "Liter pro Minute" }),
          zahlR("r2", "Letzte vier Minuten", "Von Minute 4 bis Minute 8.", "Rate:", (V[4] - V[2]) / 4, { einheit: "Liter pro Minute" }),
          wahlS("max", "Größter Zufluss", "In welchem Abschnitt fließt im Mittel am meisten Wasser zu?", abschnitte, String(max)),
        ],
        weg: [`Erste vier Minuten: $\\frac{${V[2]} - 0}{4} = ${dezT(V[2] / 4)}$ Liter pro Minute`, `Letzte vier Minuten: $\\frac{${V[4]} - ${V[2]}}{4} = ${dezT((V[4] - V[2]) / 4)}$ Liter pro Minute`, `Die Zunahmen je Abschnitt sind ${d.join(", ")} Liter – am meisten im Abschnitt ${abschnitte[max][1]}.`],
      };
    },
  },

  rateZwei: {
    titel: "Mittlere Änderungsrate mit Einheit",
    gen(r) {
      const j1 = eins(r, [2010, 2012, 2015]), j2 = j1 + eins(r, [5, 8, 10]);
      const p1 = ganz(r, 40, 95) * 1000 + ganz(r, 0, 9) * 100;
      const rate = eins(r, [-120, 150, 240, 330, 410, -260]);
      const p2 = p1 + rate * (j2 - j1);
      const tsd = (v) => String(v).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
      return {
        text: `Die Einwohnerzahl einer Stadt ${rate > 0 ? "stieg" : "sank"} von ${tsd(p1)} (${j1}) auf ${tsd(p2)} (${j2}). Berechne die mittlere Änderungsrate mit Einheit.`,
        schritte: [zahlR("r", "Änderungsrate", "Änderung der Einwohnerzahl durch Anzahl der Jahre.", "Rate:", rate, { einheit: "Einwohner pro Jahr" })],
        weg: [`$\\frac{${p2} - ${p1}}{${j2} - ${j1}} = \\frac{${zT(p2 - p1)}}{${j2 - j1}} = ${zT(rate)}$`, `Im Mittel ${rate > 0 ? "kamen" : "gingen"} pro Jahr ${tsd(Math.abs(rate))} Einwohner ${rate > 0 ? "hinzu" : "verloren"}.`],
      };
    },
  },
};

/* ===================== Kapitel II: Differenzenquotient, h-Methode ===================== */
/* Quadratische Funktion a x² + b x + c als Term */
const quadT = (a, b, c, v = "x") => polyT([[a, 2], [b, 1], [c, 0]], v);
function quadZufall(r, { mitB = true, mitC = true } = {}) {
  const a = eins(r, [1, 1, 2, 3, -1, -2, 0.5]);
  const b = mitB && r() < 0.6 ? ganz(r, -4, 4, [0]) : 0;
  const c = mitC && r() < 0.5 ? ganz(r, -5, 5, [0]) : 0;
  return { a: alsQ2(a), b: q(b), c: q(c) };
}
/* Differenzenquotient von a x² + b x + c an x0 als Term in h: (2a x0 + b) + a h */
function dqQuad(f, x0) {
  const A = qAdd(qMul(q(2), qMul(f.a, x0)), f.b);
  return { A, term: polyT([[f.a, 1], [A, 0]], "h"), diff: polyT([[f.a, 2], [A, 1]], "h") };
}
function fStelleText(x0) { return Q(x0).z === 0 ? "h" : `${zT(x0)} + h`; }

function dqAufgabe(r, variante) {
  const art = variante || eins(r, ["quad", "quad", "quad", "linear", "kubik", "kehr"]);
  if (art === "linear") {
    const m = ganz(r, -4, 5, [0]), c = ganz(r, -5, 5), x0 = q(ganz(r, -3, 5));
    return {
      tex: linT(m, c).tex, x0, soll: zahlT(m),
      weg: [`$f(${fStelleText(x0)}) - f(${zT(x0)}) = ${zT(m)}h$`, `$\\frac{${zT(m)}h}{h} = ${zT(m)}$`, "Bei einer Geraden hängt der Differenzenquotient nicht von $h$ ab."],
      fehler: [],
    };
  }
  if (art === "kubik") {
    const x0 = q(ganz(r, -2, 2, [0]));
    const x2 = qMul(x0, x0);
    const soll = polyT([[1, 2], [qMul(q(3), x0), 1], [qMul(q(3), x2), 0]], "h");
    return {
      tex: "x^{3}", x0, soll,
      weg: [`$(${fStelleText(x0)})^{3} = ${polyT([[1, 3], [qMul(q(3), x0), 2], [qMul(q(3), x2), 1], [qMul(x2, x0), 0]], "h").tex}$`, `$f(${fStelleText(x0)}) - f(${zT(x0)}) = ${polyT([[1, 3], [qMul(q(3), x0), 2], [qMul(q(3), x2), 1]], "h").tex}$`, `Durch $h$ geteilt: $${soll.tex}$`],
      fehler: [],
    };
  }
  if (art === "kehr") {
    const c = eins(r, [1, 1, 2, 3]), x0 = q(ganz(r, 1, 4));
    const g = ggT(c, x0.z), cz = c / g, xn = x0.z / g;
    const xh = summeT([[1, zahlT(x0)], [1, varT("h")]]);
    const soll = negT(bruchT(zahlT(cz), xn === 1 ? xh : malT(zahlT(xn), klammerT(xh))));
    return {
      tex: c === 1 ? "\\frac{1}{x}" : `\\frac{${c}}{x}`, x0, soll, bereich: [-0.5, 0.9],
      weg: (() => {
        const X = zT(x0), eins1 = x0.z === 1;
        const nenner = eins1 ? "1 + h" : `${X}(${X} + h)`;
        const fx0 = eins1 ? String(c) : `\\frac{${c}}{${X}}`;
        const vorn = eins1 ? String(c) : c === 1 ? X : `${c} \\cdot ${X}`;
        const zaehler = `${vorn} - ${c === 1 ? "" : c}(${X} + h)`;
        return [`$\\frac{${c}}{${X} + h} - ${fx0} = \\frac{${zaehler}}{${nenner}} = \\frac{${MINUS}${c === 1 ? "" : c}h}{${nenner}}$`, `Durch $h$ geteilt: $${soll.tex}$`];
      })(),
      fehler: [],
    };
  }
  const f = quadZufall(r);
  const x0 = q(ganz(r, -3, 3, [0]));
  const d = dqQuad(f, x0);
  const fx0 = qAdd(qAdd(qMul(f.a, qMul(x0, x0)), qMul(f.b, x0)), f.c);
  const fxh = polyT([[f.a, 2], [d.A, 1], [fx0, 0]], "h");
  return {
    tex: quadT(f.a, f.b, f.c).tex, x0, soll: d.term, f,
    weg: [`$f(${fStelleText(x0)}) = ${fxh.tex}$`, `$f(${fStelleText(x0)}) - f(${zT(x0)}) = ${d.diff.tex}$`, `$\\frac{${d.diff.tex}}{h} = ${d.term.tex}$`],
    fehler: [{ js: (h) => qNum(f.a) * h + qNum(f.b), text: "Beim Ausmultiplizieren fehlt das Mittelglied: $(x_0 + h)^2 = x_0^2 + 2x_0h + h^2$." }],
  };
}

export const TYPEN_II = {
  dqTerm: {
    titel: "Differenzenquotient als Term in h",
    gen(r, variante) {
      const d = dqAufgabe(r, variante);
      return {
        text: `Stelle für ${$(`f(x) = ${d.tex}`)} an der Stelle ${$(`x_0 = ${zT(d.x0)}`)} den Differenzenquotienten ${$("\\frac{f(x_0 + h) - f(x_0)}{h}")} als Term in $h$ auf und vereinfache ihn so weit wie möglich.`,
        schritte: [termS("dq", "Differenzenquotient", "Berechne $f(x_0 + h)$, ziehe $f(x_0)$ ab und teile durch $h$.", "$\\frac{f(x_0 + h) - f(x_0)}{h} =$", d.soll, { var: "h", bereich: d.bereich || [-0.9, 0.9], fehler: d.fehler })],
        weg: d.weg,
      };
    },
  },

  dqZahl: {
    titel: "Differenzenquotient für kleine h",
    gen(r) {
      const a = eins(r, [1, 1, 2, 0.5, 3]);
      const x0 = ganz(r, -2, 3, [0]);
      const hs = [1, 0.1, -0.1, 0.01];
      const dq = (h) => a * (2 * x0 + h);
      return {
        text: `Berechne für ${$(`f(x) = ${monomT(alsQ2(a), 2, "x", { dez: true }).tex}`)} und $x_0 = ${zT(x0)}$ den Differenzenquotienten für ${hs.map((h) => `$h = ${dezT(h)}$`).join(", ")}. Welchem Wert nähern sich die Ergebnisse?`,
        schritte: [
          ...hs.map((h, i) => zahlR(`d${i}`, `h = ${zTxt(h)}`, "$\\frac{f(x_0 + h) - f(x_0)}{h}$", "", dq(h), { tol: 1e-6 })),
          zahlR("g", "Grenzwert", "Welchem Wert nähern sich die Ergebnisse?", `$f'(${zT(x0)}) =$`, 2 * a * x0),
        ],
        weg: [...hs.map((h) => `$h = ${dezT(h)}$: $\\frac{f(${dezT(x0 + h)}) - f(${zT(x0)})}{${dezT(h)}} = ${dezT(dq(h))}$`), `Die Werte nähern sich $${dezT(2 * a * x0)}$.`],
      };
    },
  },

  dqNumerisch: {
    titel: "Steigung numerisch schätzen",
    gen(r) {
      const a = eins(r, [2, 3, 5, 10]);
      const x0 = eins(r, [0, 0, 1]);
      const hs = [0.1, 0.01, 0.001];
      const f = (x) => a ** x;
      const dq = (h) => Math.round(((f(x0 + h) - f(x0)) / h) * 1000) / 1000;
      const exakt = Math.log(a) * a ** x0;
      return {
        text: `Schätze $f'(${x0})$ für $f(x) = ${a}^{x}$ numerisch mit ${hs.map((h) => `$h = ${dezT(h)}$`).join(", ")}. Runde auf drei Nachkommastellen.`,
        schritte: [
          ...hs.map((h, i) => zahlR(`d${i}`, `h = ${zTxt(h)}`, "Berechne den Differenzenquotienten mit dem Taschenrechner.", "", dq(h), { tol: 0.0006 })),
          zahlR("s", "Schätzwert", "Welchem Wert nähern sich die Ergebnisse (drei Nachkommastellen)?", `$f'(${x0}) \\approx$`, Math.round(exakt * 1000) / 1000, { tol: 0.0025 }),
        ],
        weg: [...hs.map((h) => `$h = ${dezT(h)}$: $\\frac{${a}^{${dezT(x0 + h)}} - ${a ** x0}}{${dezT(h)}} \\approx ${dezT(dq(h), 3)}$`), `Also $f'(${x0}) \\approx ${dezT(exakt, 3)}$.`],
      };
    },
  },

  dqSymmetrisch: {
    titel: "Symmetrischer Differenzenquotient",
    gen(r) {
      const x0 = ganz(r, 1, 3), h = 0.1;
      const f = (x) => x ** 3;
      const rechts = (f(x0 + h) - f(x0)) / h, sym = (f(x0 + h) - f(x0 - h)) / (2 * h), exakt = 3 * x0 * x0;
      return {
        text: `Berechne für $f(x) = x^{3}$ an der Stelle $x_0 = ${x0}$ mit $h = 0{,}1$ den gewöhnlichen und den symmetrischen Differenzenquotienten $\\frac{f(x_0 + h) - f(x_0 - h)}{2h}$. Welcher liegt näher an $f'(${x0}) = ${exakt}$?`,
        schritte: [
          zahlR("d", "Gewöhnlich", "$\\frac{f(x_0 + h) - f(x_0)}{h}$", "", rechts, { tol: 1e-6 }),
          zahlR("s", "Symmetrisch", "$\\frac{f(x_0 + h) - f(x_0 - h)}{2h}$", "", sym, { tol: 1e-6 }),
          wahlS("w", "Vergleich", "Welcher liegt näher am exakten Wert?", [["s", "der symmetrische"], ["d", "der gewöhnliche"]], "s"),
        ],
        weg: [`Gewöhnlich: $\\frac{${dezT(f(x0 + h), 4)} - ${f(x0)}}{0{,}1} = ${dezT(rechts, 4)}$`, `Symmetrisch: $\\frac{${dezT(f(x0 + h), 4)} - ${dezT(f(x0 - h), 4)}}{0{,}2} = ${dezT(sym, 4)}$`, `Der symmetrische liegt näher an ${exakt}.`],
      };
    },
  },

  hMethode: {
    titel: "Ableitung an einer Stelle mit der h-Methode",
    gen(r, variante) {
      if (variante === "bewegung") {
        const c = eins(r, [2, 4, 5, 0.5]);
        const t0 = ganz(r, 1, 4);
        const term = polyT([[alsQ2(c), 1], [alsQ2(2 * c * t0), 0]], "h", { dez: true });
        return {
          text: `Ein Stein fällt nach $s(t) = ${dezT(c)}t^{2}$ ($s$ in m, $t$ in s). Berechne seine momentane Geschwindigkeit nach ${t0} ${t0 === 1 ? "Sekunde" : "Sekunden"} mit der h-Methode.`,
          schritte: [
            termS("dq", "Differenzenquotient", "Stelle $\\frac{s(t_0 + h) - s(t_0)}{h}$ auf und vereinfache.", `$\\frac{s(${t0} + h) - s(${t0})}{h} =$`, term, { var: "h", bereich: [-0.9, 0.9] }),
            zahlR("v", "Momentane Geschwindigkeit", "Lass $h$ gegen 0 gehen.", `$s'(${t0}) =$`, 2 * c * t0, { einheit: "m/s", fehler: [{ wert: c * (2 * t0 + 1), text: "Das ist der Wert für $h = 1$ – $h$ muss gegen 0 gehen." }] }),
          ],
          weg: [`$s(${t0} + h) - s(${t0}) = ${dezT(2 * c * t0)}h + ${dezT(c)}h^{2}$`, `$\\frac{s(${t0} + h) - s(${t0})}{h} = ${term.tex}$`, `$h \\to 0$: $s'(${t0}) = ${dezT(2 * c * t0)}$ m/s`],
        };
      }
      if (variante === "ballon") {
        const p = eins(r, [8, 10, 12]);
        const t0 = ganz(r, 1, p / 2 - 1);
        const term = polyT([[-1, 1], [p - 2 * t0, 0]], "h");
        return {
          text: `Ein Wetterballon steigt. Seine Höhe beträgt $H(t) = −t^{2} + ${p}t$ (in m, $t$ in min). Bestimme seine momentane Steiggeschwindigkeit bei $t = ${t0}$ mit der h-Methode. Wann ist sie null?`,
          schritte: [
            termS("dq", "Differenzenquotient", "Stelle den Differenzenquotienten an der Stelle $t_0$ auf .", `$\\frac{H(${t0} + h) - H(${t0})}{h} =$`, term, { var: "h", bereich: [-0.9, 0.9] }),
            zahlR("v", "Geschwindigkeit", "Lass $h$ gegen 0 gehen.", `$H'(${t0}) =$`, p - 2 * t0, { einheit: "m pro min" }),
            zahlR("t", "Steiggeschwindigkeit null", "Allgemein gilt $H'(t) = −2t + " + p + "$. Setze null.", "$t =$", p / 2, { einheit: "min" }),
          ],
          weg: [`$\\frac{H(${t0} + h) - H(${t0})}{h} = ${term.tex}$`, `$H'(${t0}) = ${p - 2 * t0}$ m pro min`, `$−2t + ${p} = 0$ ergibt $t = ${p / 2}$`],
        };
      }
      const d = dqAufgabe(r, variante === "kehr" ? "kehr" : variante === "kubik" ? "kubik" : eins(r, ["quad", "quad", "quad", "kubik", "kehr"]));
      const ableitung = d.soll.js(0);
      return {
        text: `Bestimme $f'(${zT(d.x0)})$ für ${$(`f(x) = ${d.tex}`)} mit der h-Methode.`,
        schritte: [
          termS("dq", "Differenzenquotient", "Stelle $\\frac{f(x_0 + h) - f(x_0)}{h}$ auf und vereinfache, bis du durch $h$ kürzen kannst.", `$\\frac{f(${fStelleText(d.x0)}) - f(${zT(d.x0)})}{h} =$`, d.soll, { var: "h", bereich: d.bereich || [-0.9, 0.9], fehler: d.fehler }),
          zahlR("abl", "Grenzwert", "Lass $h$ gegen 0 gehen.", `$f'(${zT(d.x0)}) =$`, ableitung, { fehler: [{ wert: d.soll.js(1), text: "Das ist der Wert für $h = 1$. Für die Ableitung geht $h$ gegen 0." }], wertText: zT(alsQ(ableitung)) }),
        ],
        weg: [...d.weg, `$h \\to 0$: $f'(${zT(d.x0)}) = ${zT(alsQ(ableitung))}$`],
      };
    },
  },

  stelleZurSteigung: {
    titel: "Stelle mit gegebener Steigung",
    gen(r) {
      const a = eins(r, [q(1), q(1), q(2), q(3, 2), q(1, 2), q(-1), q(3)]);
      const b = r() < 0.35 ? q(ganz(r, -4, 4, [0])) : q(0);
      const x0 = eins(r, [q(ganz(r, -3, 3, [0])), q(ganz(r, -3, 3) * 2 + 1, 2)]);
      const s = qAdd(qMul(q(2), qMul(a, x0)), b);
      const y0 = qAdd(qMul(a, qMul(x0, x0)), qMul(b, x0));
      const f = polyT([[a, 2], [b, 1]]), d = polyT([[qMul(q(2), a), 1], [b, 0]]);
      return {
        text: `In welchem Punkt hat der Graph von ${$(`f(x) = ${f.tex}`)} die Steigung ${$(zT(s))}?`,
        schritte: [
          termS("d", "Ableitung", "Bestimme zuerst $f'(x)$.", "$f'(x) =$", d),
          zahlS("x", "Stelle", `Löse $f'(x) = ${zT(s)}$.`, "$x =$", x0),
          zahlS("y", "Punkt", "Berechne den Funktionswert an dieser Stelle.", "$y =$", y0, { fehler: [{ wert: qNum(s), text: "Das ist die Steigung, nicht der Funktionswert. Setze $x$ in $f$ ein." }] }),
        ],
        weg: [`$f'(x) = ${d.tex}$`, `Aus $f'(x) = ${zT(s)}$ folgt $x = ${zT(x0)}$`, `$f(${zT(x0)}) = ${zT(y0)}$, also ${$(P(x0, y0))}`],
      };
    },
  },

  hFunktion: {
    titel: "Ableitungsfunktion mit der h-Methode",
    gen(r) {
      const art = eins(r, ["quad", "quad", "kubik", "kehr", "konst"]);
      const x1 = ganz(r, -3, 4, [0]);
      let f, d, weg;
      if (art === "konst") {
        const c = eins(r, [q(12), q(-5, 2), q(7), q(-3)]);
        f = zahlT(c, { dez: true }); d = zahlT(0);
        weg = [`$f(x + h) - f(x) = ${zT(c, { dez: true })} - ${kz(c, { dez: true })} = 0$`, "$f'(x) = 0$ – eine Konstante ändert sich nicht."];
      } else if (art === "kubik") {
        f = polyT([[1, 3]]); d = polyT([[3, 2]]);
        weg = ["$(x + h)^{3} - x^{3} = 3x^{2}h + 3xh^{2} + h^{3}$", "$\\frac{3x^{2}h + 3xh^{2} + h^{3}}{h} = 3x^{2} + 3xh + h^{2}$", "$h \\to 0$: $f'(x) = 3x^{2}$"];
      } else if (art === "kehr") {
        const c = eins(r, [1, 2, 3]);
        f = bruchT(zahlT(c), varT()); d = negT(bruchT(zahlT(c), hochT(varT(), 2)));
        weg = [`$\\frac{${c}}{x + h} - \\frac{${c}}{x} = \\frac{${zT(-c)}h}{x(x + h)}$`, `Durch $h$ geteilt: $−\\frac{${c}}{x(x + h)}$`, `$h \\to 0$: $f'(x) = ${d.tex}$`];
      } else {
        const g = quadZufall(r);
        f = quadT(g.a, g.b, g.c);
        const A = qMul(q(2), g.a);
        d = polyT([[A, 1], [g.b, 0]]);
        const diff = summeT([[1, malT(monomT(A, 1), varT("h"))], [1, monomT(g.b, 1, "h")], [1, monomT(g.a, 2, "h")]]);
        const geteilt = summeT([[1, polyT([[A, 1], [g.b, 0]])], [1, monomT(g.a, 1, "h")]]);
        weg = [`$f(x + h) - f(x) = ${diff.tex}$`, `Durch $h$ geteilt: $${geteilt.tex}$`, `$h \\to 0$: $f'(x) = ${d.tex}$`];
      }
      const w = d.js(x1);
      return {
        text: `Bestimme die Ableitungsfunktion von ${$(`f(x) = ${f.tex}`)} mit der h-Methode und berechne $f'(${x1})$.`,
        schritte: [
          termS("d", "Ableitungsfunktion", "Stelle $\\frac{f(x + h) - f(x)}{h}$ allgemein auf, vereinfache und lass $h$ gegen 0 gehen.", "$f'(x) =$", d, { bereich: art === "kehr" ? [0.3, 4] : [-3, 3] }),
          zahlR("w", "Wert", `Setze $x = ${x1}$ ein.`, `$f'(${x1}) =$`, w, { wertText: zT(alsQ(w)) }),
        ],
        weg: [...weg, `$f'(${x1}) = ${zT(alsQ(w))}$`],
      };
    },
  },

  parameterA: {
    titel: "Parameter aus einer Steigung bestimmen",
    gen(r) {
      const n = eins(r, [2, 2, 3]);
      const a = eins(r, [q(2), q(-1), q(3), q(1, 2), q(-2), q(4)]);
      const x0 = q(ganz(r, -3, 3, [0]));
      const s = qMul(qMul(q(n), a), n === 2 ? x0 : qMul(x0, x0));
      return {
        text: `Für welchen Wert von $a$ hat der Graph von $f(x) = a x^{${n}}$ an der Stelle $${zT(x0)}$ die Steigung $${zT(s)}$?`,
        schritte: [zahlS("a", "Parameter", `Es gilt $f'(x) = ${n}a x${n === 3 ? "^{2}" : ""}$. Setze die Stelle ein und löse nach $a$ auf.`, "$a =$", a)],
        weg: [`$f'(x) = ${n}ax${n === 3 ? "^{2}" : ""}$`, `$f'(${zT(x0)}) = ${zT(qMul(q(n), n === 2 ? x0 : qMul(x0, x0)))}a = ${zT(s)}$`, `$a = ${zT(a)}$`],
      };
    },
  },

  vorzeichenGraph: {
    titel: "Vorzeichen der Ableitung am Graphen",
    gen(r) {
      const u = ganz(r, -3, -1), v = u + eins(r, [2, 4]);
      const k = eins(r, [0.25, -0.25, 0.2, -0.2]);
      const f = (x) => k * (x ** 3 - 1.5 * (u + v) * x ** 2 + 3 * u * v * x) + 1;
      const fs = (x) => 3 * k * (x - u) * (x - v);
      const xs = [u - 1.2, u, (u + v) / 2, v, v + 1.2];
      const namen = ["A", "B", "C", "D", "E"];
      const opt = [["+", "positiv"], ["-", "negativ"], ["0", "null"]];
      const zeichen = (x) => (Math.abs(fs(x)) < 1e-9 ? "0" : fs(x) > 0 ? "+" : "-");
      return {
        text: "Gib für den abgebildeten Graphen das Vorzeichen von $f'(x)$ in jedem der Punkte $A$ bis $E$ an.",
        skizze: { kurven: [{ f }], x0: u - 2, x1: v + 2, punkte: xs.map((x, i) => ({ x, y: f(x), name: namen[i] })) },
        schritte: xs.map((x, i) => wahlS(`p${i}`, `Punkt ${namen[i]}`, `Steigt der Graph in ${namen[i]}, fällt er oder ist die Tangente waagrecht?`, opt, zeichen(x))),
        weg: [xs.map((x, i) => `${namen[i]}: ${zeichen(x) === "+" ? "steigt, $f' > 0$" : zeichen(x) === "-" ? "fällt, $f' < 0$" : "waagrechte Tangente, $f' = 0$"}`).join(" · ")],
      };
    },
  },

  scheitel: {
    titel: "Waagrechte Tangente einer Parabel",
    gen(r) {
      const a = eins(r, [q(1), q(-1), q(2), q(-2), q(1, 2), q(3)]);
      const xs = r() < 0.75 ? q(ganz(r, -3, 4, [0])) : q(ganz(r, -2, 2) * 2 + 1, 2);
      const b = qMul(q(-2), qMul(a, xs));
      const c = q(ganz(r, -6, 6));
      const ys = qAdd(qAdd(qMul(a, qMul(xs, xs)), qMul(b, xs)), c);
      const f = quadT(a, b, c), d = polyT([[qMul(q(2), a), 1], [b, 0]]);
      return {
        text: `Bestimme mit der Ableitung den Punkt, in dem der Graph von ${$(`f(x) = ${f.tex}`)} eine waagrechte Tangente hat (den Scheitelpunkt).`,
        schritte: [
          termS("d", "Ableitung", "Leite ab.", "$f'(x) =$", d),
          zahlS("x", "Stelle", "Waagrechte Tangente heißt $f'(x) = 0$.", "$x =$", xs),
          zahlS("y", "Funktionswert", "Setze die Stelle in $f$ ein.", "$y =$", ys),
        ],
        weg: [`$f'(x) = ${d.tex}$`, `$${d.tex} = 0$ ergibt $x = ${zT(xs)}$`, `$f(${zT(xs)}) = ${zT(ys)}$, Scheitelpunkt ${$(P(xs, ys, "S"))}`],
      };
    },
  },
};

export { alsQ2, quadT, dqAufgabe, P, kz, quot, psf };
import { alsQ } from "./diffKern.js";
