/* ======================================================================
   kurvAufgaben.js – Aufgabentypen zum Schulbuch Band 3 „Kurvendiskussion“
   Jede rechnerische Buchaufgabe ist einem Typ zugeordnet (BUCH_TYPEN).
   Die QR-Codes im Buch (/b3/<Seite>-<Nr>) öffnen ein Aufgabenblatt mit neuen
   Aufgaben desselben Typs samt Lösungen (funcBlatt.jsx).
   Begründungs-, Beweis- und Skizzenaufgaben haben keinen Typ.
   Wiederverwendet aus Band 1: „waagrecht“ und „scheitel“ (diffAufgaben.js).
   Reine Logik (Tests: tests/kurvAufgaben.test.mjs).
   ====================================================================== */
import { zufall, ganz, eins, MINUS, zT, polyT, zahlS, wahlS, termS, listeS, q } from "./diffKern.js";
import { P } from "./diffAufgaben1.js";
import { TYPEN as DIFF } from "./diffAufgaben.js";

const $ = (t) => `$${t}$`;
const ART = [["H", "Hochpunkt"], ["T", "Tiefpunkt"], ["S", "Sattelpunkt"]];
const ARTNAME = { H: "Hochpunkt", T: "Tiefpunkt", S: "Sattelpunkt" };
const vzText = (s) => (s > 0 ? "+" : MINUS);
const fak = (u) => (u === 0 ? "x" : `(x ${u < 0 ? "+" : MINUS} ${Math.abs(u)})`);

/* kubische Funktion mit Extremstellen u < v (ganzzahlig): f(x) = k(x³ − 1,5(u+v)x² + 3uv·x) + c */
function kubisch(r) {
  let u, v;
  do { u = ganz(r, -3, 2); v = ganz(r, u + 1, 4); } while ((u + v) % 2 !== 0);
  const k = eins(r, [1, 1, -1]), c = ganz(r, -4, 4);
  const F = (x) => k * (x ** 3 - 1.5 * (u + v) * x * x + 3 * u * v * x) + c;
  const f = polyT([[k, 3], [-1.5 * (u + v) * k, 2], [3 * u * v * k, 1], [c, 0]]);
  const d = polyT([[3 * k, 2], [-3 * (u + v) * k, 1], [3 * u * v * k, 0]]);
  const d2 = polyT([[6 * k, 1], [-3 * (u + v) * k, 0]]);
  const artU = k > 0 ? "H" : "T", artV = k > 0 ? "T" : "H";
  return { u, v, k, F, f, d, d2, artU, artV, f2u: 3 * k * (u - v), f2v: 3 * k * (v - u) };
}

function extremKubisch(r, mitF2) {
  const K = kubisch(r);
  const { u, v, F, f, d, d2, artU, artV } = K;
  const links = u - 1, mitte = (u + v) / 2, rechts = v + 1;
  const dJs = (x) => 3 * K.k * (x - u) * (x - v);
  const vzw = `Testwerte: $f'(${zT(links)}) = ${zT(dJs(links))}$, $f'(${zT(mitte)}) = ${zT(dJs(mitte))}$, $f'(${zT(rechts)}) = ${zT(dJs(rechts))}$ – VZW von ${vzText(dJs(links))} nach ${vzText(dJs(mitte))} bei $x = ${zT(u)}$, von ${vzText(dJs(mitte))} nach ${vzText(dJs(rechts))} bei $x = ${zT(v)}$`;
  const f2 = `$f''(x) = ${d2.tex}$: $f''(${zT(u)}) = ${zT(K.f2u)}$, $f''(${zT(v)}) = ${zT(K.f2v)}$`;
  const schritte = [
    termS("d", "Ableitung", "Leite ab.", "$f'(x) =$", d),
    listeS("x", "Kandidaten", "Löse $f'(x) = 0$. Trenne mehrere Werte mit Semikolon.", "$x =$", [u, v]),
  ];
  if (mitF2) {
    schritte.push(termS("d2", "Zweite Ableitung", "Leite noch einmal ab.", "$f''(x) =$", d2));
    schritte.push(zahlS("f2u", "Einsetzen", `Berechne $f''(${zT(u)})$.`, `$f''(${zT(u)}) =$`, q(K.f2u)));
  }
  schritte.push(wahlS("artU", `Art bei x = ${u}`, mitF2 ? `Was liegt bei $x = ${zT(u)}$ vor?` : `Prüfe das Vorzeichen von $f'$ links und rechts von $${zT(u)}$. Was liegt dort vor?`, ART, artU));
  schritte.push(wahlS("artV", `Art bei x = ${v}`, `Und bei $x = ${zT(v)}$?`, ART, artV));
  schritte.push(listeS("y", "Funktionswerte", "Berechne die $y$-Werte (mit Semikolon getrennt).", "$y =$", [F(u), F(v)]));
  return {
    text: `Bestimme die Extrempunkte von ${$(`f(x) = ${f.tex}`)}${mitF2 ? " mit der zweiten Ableitung" : " mit dem Vorzeichenwechsel von $f'$"}.`,
    schritte,
    weg: [`$f'(x) = ${d.tex} = ${K.k > 0 ? "" : MINUS}3${fak(u)}${fak(v)}$`,
      `$f'(x) = 0$ ergibt $x = ${zT(u)}$ oder $x = ${zT(v)}$`, mitF2 ? f2 : vzw,
      `${ARTNAME[artU]} ${$(P(u, F(u), artU))}, ${ARTNAME[artV]} ${$(P(v, F(v), artV))}`],
  };
}

export const TYPEN_KURV = {
  extremVZW: { titel: "Extrempunkte mit dem Vorzeichenwechsel", gen: (r) => extremKubisch(r, false) },
  extremF2: { titel: "Extrempunkte mit der zweiten Ableitung", gen: (r) => extremKubisch(r, true) },

  /* f(x) = k(x⁴ − 2a²x²) + c: Extremstellen −a, 0, a */
  extremBiquad: {
    titel: "Extrempunkte einer Funktion 4. Grades",
    gen(r) {
      const a = ganz(r, 1, 2), k = eins(r, [1, 1, -1]), c = ganz(r, -4, 4);
      const F = (x) => k * (x ** 4 - 2 * a * a * x * x) + c;
      const f = polyT([[k, 4], [-2 * a * a * k, 2], [c, 0]]);
      const d = polyT([[4 * k, 3], [-4 * a * a * k, 1]]);
      const d2 = polyT([[12 * k, 2], [-4 * a * a * k, 0]]);
      const art0 = k > 0 ? "H" : "T", artA = k > 0 ? "T" : "H";
      return {
        text: `Bestimme alle Extrempunkte von ${$(`f(x) = ${f.tex}`)} mit der zweiten Ableitung.`,
        schritte: [
          termS("d", "Ableitung", "Leite ab.", "$f'(x) =$", d),
          listeS("x", "Kandidaten", "Löse $f'(x) = 0$ (Ausklammern). Trenne die Werte mit Semikolon.", "$x =$", [-a, 0, a]),
          termS("d2", "Zweite Ableitung", "Leite noch einmal ab.", "$f''(x) =$", d2),
          wahlS("art0", "Art bei x = 0", `$f''(0) = ${zT(-4 * a * a * k)}$. Was liegt bei $x = 0$ vor?`, ART, art0),
          wahlS("artA", `Art bei x = ±${a}`, `$f''(\\pm ${a}) = ${zT(8 * a * a * k)}$. Was liegt dort vor?`, ART, artA),
          listeS("y", "Funktionswerte", "Berechne die $y$-Werte der drei Punkte (mit Semikolon getrennt).", "$y =$", [F(-a), F(0), F(a)]),
        ],
        weg: [`$f'(x) = ${d.tex}$`, `$f'(x) = 0$ ergibt $x = ${MINUS}${a}$, $x = 0$, $x = ${a}$`,
          `$f''(x) = ${d2.tex}$: $f''(0) = ${zT(-4 * a * a * k)}$, $f''(\\pm ${a}) = ${zT(8 * a * a * k)}$`,
          `${ARTNAME[art0]} ${$(P(0, F(0), art0))}, ${ARTNAME[artA]}e ${$(P(-a, F(-a), artA + "_1"))} und ${$(P(a, F(a), artA + "_2"))}`],
      };
    },
  },

  /* f(x) = k(x⁴ − 4b·x³) + c: f'(x) = 4k·x²(x − 3b), f''(0) = 0 → Sattelpunkt bei 0 */
  sattel: {
    titel: "Extrempunkte, wenn f″ versagt",
    gen(r) {
      const b = eins(r, [1, -1]), k = eins(r, [1, 1, -1]), c = ganz(r, -3, 3);
      const x0 = 3 * b;
      const F = (x) => k * (x ** 4 - 4 * b * x ** 3) + c;
      const f = polyT([[k, 4], [-4 * b * k, 3], [c, 0]]);
      const d = polyT([[4 * k, 3], [-12 * b * k, 2]]);
      const art0 = k > 0 ? "T" : "H";
      const xs = [0, x0].sort((p, s) => p - s);
      const links = -1 * Math.sign(x0), dl = 4 * k * (links * links) * (links - x0), dr = 4 * k * (Math.sign(x0)) * (Math.sign(x0) - x0);
      return {
        text: `Bestimme alle Extrempunkte von ${$(`f(x) = ${f.tex}`)}. An welcher Stelle hilft $f''$ nicht weiter?`,
        schritte: [
          termS("d", "Ableitung", "Leite ab.", "$f'(x) =$", d),
          listeS("x", "Kandidaten", "Löse $f'(x) = 0$ (Ausklammern). Trenne die Werte mit Semikolon.", "$x =$", xs),
          zahlS("f20", "f″ bei 0", "Berechne $f''(0)$.", "$f''(0) =$", q(0)),
          wahlS("art0", "Art bei x = 0", "$f''(0) = 0$ – entscheide mit dem Vorzeichen von $f'$ links und rechts von 0.", ART, "S"),
          wahlS("art1", `Art bei x = ${x0}`, `$f''(${zT(x0)}) = ${zT(36 * k)}$. Was liegt dort vor?`, ART, art0),
          listeS("y", "Funktionswerte", "Berechne die $y$-Werte beider Punkte (mit Semikolon getrennt).", "$y =$", xs.map(F)),
        ],
        weg: [`$f'(x) = ${d.tex} = ${zT(4 * k)}x^{2}(x ${x0 < 0 ? "+" : MINUS} ${Math.abs(x0)})$`,
          `$f'(x) = 0$ ergibt $x = 0$ oder $x = ${zT(x0)}$`,
          `$f''(${zT(x0)}) = ${zT(36 * k)}$: ${ARTNAME[art0]} ${$(P(x0, F(x0), art0))}`,
          `$f''(0) = 0$ – $f''$ hilft nicht. $f'(${zT(links)}) = ${zT(dl)}$, $f'(${zT(Math.sign(x0))}) = ${zT(dr)}$: kein VZW, Sattelpunkt ${$(P(0, F(0), "S"))}`],
      };
    },
  },

  /* Parameter aus einer Extremstellen-Bedingung */
  parameterExtrem: {
    titel: "Parameter für eine Extremstelle",
    gen(r, variante) {
      const art = variante || eins(r, ["quad", "kubisch", "viert"]);
      if (art === "quad") {
        const x0 = ganz(r, -3, 3, [0]), c = ganz(r, -4, 5);
        const a = -2 * x0, y0 = x0 * x0 + a * x0 + c;
        return {
          text: `Für welchen Wert von $a$ hat der Graph von $f(x) = x^{2} + ax ${c < 0 ? MINUS : "+"} ${Math.abs(c)}$ an der Stelle $${zT(x0)}$ eine waagrechte Tangente? Gib den Punkt an.`.replace(" + 0$", "$"),
          schritte: [
            zahlS("a", "Parameter", `$f'(x) = 2x + a$. Setze $f'(${zT(x0)}) = 0$.`, "$a =$", q(a)),
            zahlS("y", "Funktionswert", `Berechne $f(${zT(x0)})$ mit diesem $a$.`, "$y =$", q(y0)),
          ],
          weg: [`$f'(${zT(x0)}) = ${zT(2 * x0)} + a = 0$, also $a = ${zT(a)}$`, `$f(${zT(x0)}) = ${zT(y0)}$, Punkt ${$(P(x0, y0, "T"))} (Tiefpunkt, die Parabel ist nach oben geöffnet)`],
        };
      }
      if (art === "kubisch") {
        const x0 = eins(r, [-4, -2, 2, 4]), a = -1.5 * x0;
        const F = (x) => x ** 3 + a * x * x, art0 = x0 > 0 ? "T" : "H", artNull = x0 > 0 ? "H" : "T";
        return {
          text: `Bestimme $a$ so, dass $f(x) = x^{3} + ax^{2}$ bei $x = ${zT(x0)}$ ein Extremum hat. Gib beide Extrempunkte an.`,
          schritte: [
            zahlS("a", "Parameter", `$f'(x) = 3x^{2} + 2ax$. Setze $f'(${zT(x0)}) = 0$.`, "$a =$", q(a)),
            wahlS("art0", `Art bei x = ${x0}`, `$f''(x) = 6x + 2a$. Was liegt bei $x = ${zT(x0)}$ vor?`, ART, art0),
            zahlS("y0", "Funktionswert", `Berechne $f(${zT(x0)})$.`, "$y =$", q(F(x0))),
            wahlS("artNull", "Art bei x = 0", "Auch $f'(0) = 0$. Was liegt bei $x = 0$ vor?", ART, artNull),
          ],
          weg: [`$f'(${zT(x0)}) = ${zT(3 * x0 * x0)} ${x0 < 0 ? MINUS : "+"} ${Math.abs(2 * x0)}a = 0$, also $a = ${zT(a)}$`,
            `$f''(${zT(x0)}) = ${zT(6 * x0 + 2 * a)}$: ${ARTNAME[art0]} ${$(P(x0, F(x0), art0))}`,
            `$f''(0) = ${zT(2 * a)}$: ${ARTNAME[artNull]} ${$(P(0, 0, artNull))}`],
        };
      }
      // viert: f(x) = x⁴ − kx³ + c, waagrechte Tangente bei x0 = ±3 → k = 4x0/3
      const x0 = eins(r, [3, -3]), k = (4 * x0) / 3, c = ganz(r, -3, 3);
      const F = (x) => x ** 4 - k * x ** 3 + c;
      const kTex = "kx^{3}";
      return {
        text: `Für welchen Wert von $k$ hat $f(x) = x^{4} ${MINUS} ${kTex}${c ? ` ${c < 0 ? MINUS : "+"} ${Math.abs(c)}` : ""}$ an der Stelle $${zT(x0)}$ eine waagrechte Tangente? Bestimme für diesen Wert alle Extrempunkte.`,
        schritte: [
          zahlS("k", "Parameter", `$f'(x) = 4x^{3} ${MINUS} 3kx^{2}$. Setze $f'(${zT(x0)}) = 0$.`, "$k =$", q(k)),
          wahlS("art1", `Art bei x = ${x0}`, `Was liegt bei $x = ${zT(x0)}$ vor?`, ART, "T"),
          zahlS("y1", "Funktionswert", `Berechne $f(${zT(x0)})$.`, "$y =$", q(F(x0))),
          wahlS("art0", "Art bei x = 0", "Auch $f'(0) = 0$, aber $f''(0) = 0$. Entscheide mit dem VZW.", ART, "S"),
        ],
        weg: [`$f'(${zT(x0)}) = ${zT(4 * x0 ** 3)} ${MINUS} ${zT(3 * x0 * x0)}k = 0$, also $k = ${zT(k)}$`,
          `$f''(${zT(x0)}) = ${zT(12 * x0 * x0 - 6 * k * x0)} > 0$: Tiefpunkt ${$(P(x0, F(x0), "T"))}`,
          `$f''(0) = 0$, aber $f'$ wechselt bei 0 das Vorzeichen nicht: Sattelpunkt ${$(P(0, c, "S"))}`],
      };
    },
  },

  /* Sachaufgabe: Maximum eines kubischen Gewinns bzw. einer Höhe */
  sachMax: {
    titel: "Größter Wert in einer Sachaufgabe",
    gen(r, variante) {
      const art = variante || eins(r, ["gewinn", "drohne"]);
      if (art === "drohne") {
        const s = ganz(r, 1, 2), t0 = 2 * s, h0 = 4 * s ** 3;
        const f = polyT([[-1, 3], [3 * s, 2]], "t"), d = polyT([[-3, 2], [6 * s, 1]], "t");
        return {
          text: `Eine Drohne steigt und landet wieder. Ihre Höhe ist ${$(`h(t) = ${f.tex}`)} ($h$ in m, $t$ in min, $0 \\le t \\le ${3 * s}$). Wann ist sie am höchsten, und wie hoch?`,
          schritte: [
            termS("d", "Ableitung", "Leite ab.", "$h'(t) =$", d, { var: "t" }),
            zahlS("t", "Zeitpunkt", "Löse $h'(t) = 0$ im Bereich $t > 0$.", "$t =$", q(t0)),
            zahlS("h", "Höhe", "Berechne die größte Höhe.", "$h =$", q(h0)),
          ],
          weg: [`$h'(t) = ${d.tex} = ${MINUS}3t(t ${MINUS} ${t0})$`, `$h''(${t0}) = ${zT(-6 * t0 + 6 * s)} < 0$: Maximum bei $t = ${t0}$`, `$h(${t0}) = ${h0}$: Nach ${t0} min ist sie mit ${h0} m am höchsten.`],
        };
      }
      let u, w;
      do { u = ganz(r, 3, 6); w = ganz(r, 1, 2); } while ((u - w) % 2 !== 0);
      const b2 = 1.5 * (u - w), b1 = 3 * u * w;
      const c = -ganz(r, 5, Math.min(30, Math.floor((0.5 * u ** 3 + 1.5 * w * u * u) / 2)));
      const G = (x) => -(x ** 3) + b2 * x * x + b1 * x + c;
      const f = polyT([[-1, 3], [b2, 2], [b1, 1], [c, 0]]), d = polyT([[-3, 2], [2 * b2, 1], [b1, 0]]);
      const gmax = G(u);
      return {
        text: `Der Gewinn einer Firma ist ${$(`G(x) = ${f.tex}`)} ($x$ in Tausend Stück, $G$ in Tausend €, $0 \\le x \\le ${u + 2}$). Bei welcher Menge ist er maximal, und wie groß?`,
        schritte: [
          termS("d", "Ableitung", "Leite ab.", "$G'(x) =$", d),
          zahlS("x", "Menge", `Löse $G'(x) = 0$ im Bereich $0 \\le x \\le ${u + 2}$.`, "$x =$", q(u)),
          zahlS("g", "Gewinn", "Berechne den größten Gewinn (in Tausend €).", "$G =$", q(gmax)),
        ],
        weg: [`$G'(x) = ${d.tex} = ${MINUS}3(x ${MINUS} ${u})(x + ${w})$`, `Im Bereich nur $x = ${u}$; $G''(${u}) = ${zT(-6 * u + 2 * b2)} < 0$: Maximum`, `$G(${u}) = ${zT(gmax)}$; Rand: $G(0) = ${zT(c)}$, $G(${u + 2}) = ${zT(G(u + 2))}$. Größter Gewinn ${gmax} 000 € bei ${u} 000 Stück.`],
      };
    },
  },

  /* senkrechter Wurf h(t) = −5t² + v·t + h0 */
  wurf: {
    titel: "Höchster Punkt beim Wurf",
    gen(r) {
      const v = eins(r, [10, 20, 30]), h0 = ganz(r, 1, 3);
      const t0 = v / 10, H = h0 + (v * v) / 20;
      const f = polyT([[-5, 2], [v, 1], [h0, 0]], "t"), d = polyT([[-10, 1], [v, 0]], "t");
      return {
        text: `Ein Ball fliegt senkrecht hoch: ${$(`h(t) = ${f.tex}`)} ($h$ in m, $t$ in s). Wann ist die Tangente waagrecht? Wie hoch fliegt er?`,
        schritte: [
          termS("d", "Ableitung", "Leite ab.", "$h'(t) =$", d, { var: "t" }),
          zahlS("t", "Zeitpunkt", "Löse $h'(t) = 0$.", "$t =$", q(t0)),
          zahlS("h", "Höhe", "Berechne die größte Höhe.", "$h =$", q(H)),
        ],
        weg: [`$h'(t) = ${d.tex} = 0$, also $t = ${t0}$`, `$h(${t0}) = ${H}$: Nach ${t0} s ist der Ball ${H} m hoch – höher kommt er nicht.`],
      };
    },
  },
};

export const TYPEN = { waagrecht: DIFF.waagrecht, scheitel: DIFF.scheitel, ...TYPEN_KURV };

/* Buchseite-Aufgabennummer → Aufgabentyp (Seitenzahlen wie im Buch, schulbuch/kurvendiskussion).
   NIE Seiten oder Nummern ändern, die schon gedruckt sind – die QR-Codes zeigen darauf. */
export const BUCH_TYPEN = {
  // 1 Die waagrechte Tangente (S. 5)
  "5-1": "waagrecht:kubisch", "5-4": "wurf", "5-5": "parameterExtrem:quad",
  // 2 Vorzeichenwechsel und zweite Ableitung (S. 7)
  "7-1": "extremVZW", "7-2": "extremF2", "7-4": "sattel", "7-5": "sachMax:gewinn", "7-6": "parameterExtrem:kubisch",
  // Training I (S. 8)
  "8-T1": "extremF2", "8-T2": "scheitel", "8-T4": "extremBiquad", "8-T5": "sachMax:drohne", "8-T7": "parameterExtrem:viert",
};

export const typVon = (seite, nr) => BUCH_TYPEN[`${seite}-${nr}`] || null;
export const typTitel = (schluessel) => (TYPEN[String(schluessel).split(":")[0]] || {}).titel || "";

let laufend = 0;
/* Neue Aufgabe zum Typ „typ“ bzw. „typ:variante“. seed (Zahl) macht sie wiederholbar. */
export function neueAufgabe(schluessel, seed) {
  const [typ, variante] = String(schluessel).split(":");
  const T = TYPEN[typ];
  if (!T) throw new Error("Unbekannter Aufgabentyp: " + schluessel);
  const r = zufall(seed);
  const a = T.gen(r, variante);
  a.weg = (a.weg || []).filter((z, i, alle) => z !== alle[i - 1]);
  laufend += 1;
  return { ...a, typ: schluessel, titel: T.titel, id: `${typ}-${seed ?? "z"}-${laufend}` };
}
