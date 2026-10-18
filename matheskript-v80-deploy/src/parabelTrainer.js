/* ======================================================================
   parabelTrainer.js – reine Aufgabenlogik des Parabel-Trainers (kein React).
   Drei Kernthemen, je mit mehreren Aufgabentypen und drei Stufen:
     · normal   – Normalform f(x) = ax² + bx + c
     · scheitel – Scheitelform f(x) = a(x − d)² + e
     · null     – Nullstellen
   Eine Aufgabe besteht aus Teilen, die nacheinander aufgehen (wie f′ → f″
   im Ableitungstrainer). Teil-Arten:
     · zahl   – ein oder mehrere Zahlfelder (felder: [{ name, wert }]),
                ungeordnet: true → Reihenfolge egal (Nullstellen)
     · wahl   – Auswahl (optionen: [{ id, tex | text | kurve }], richtig)
     · regler – Zielgraph treffen: Parameter mit − / + einstellen
   Jeder Teil kennt typische Denkfehler und meldet sie gezielt zurück.
   Alle Rechnungen exakt (rechnen2.js); Lösungswege nach Regel A5.
   Der Scheitel liegt immer in [−5, 5] × [−5, 5] (Schaubild −10 … 10).
   ====================================================================== */
import { q, qAdd, qSub, qMul, qDiv, qNeg, qNum, qGleich, qNull, qTex, qLies } from "./rechnen2.js";
import { ausScheitel, normalTex, parabel, scheitelTex } from "./parabel.js";
import { englisch } from "./i18n.js";

const zw = (de, en) => (englisch() ? en : de);
let zufall = Math.random;
/* Für Tests: feste Zufallsquelle setzen (null = Math.random) */
export const setzeZufall = (f) => { zufall = f || Math.random; };
const rnd = (a, b) => a + Math.floor(zufall() * (b - a + 1));
const wahl = (l) => l[Math.floor(zufall() * l.length)];
const mischen = (l) => { const k = [...l]; for (let i = k.length - 1; i > 0; i--) { const j = Math.floor(zufall() * (i + 1)); [k[i], k[j]] = [k[j], k[i]]; } return k; };

/* ---------- Themen und Aufgabentypen ---------- */
export const THEMEN = [
  { id: "normal", name: "Normalform", en: "Standard form", formel: "ax² + bx + c", kern: true },
  { id: "scheitel", name: "Scheitelform", en: "Vertex form", formel: "a(x − d)² + e", kern: true },
  { id: "null", name: "Nullstellen", en: "Roots", formel: "f(x) = 0", kern: true },
  { id: "brenn", name: "Brennpunkt", en: "Focus", formel: "F", kern: false },
  { id: "schnitt", name: "Schnittpunkte", en: "Intersections", formel: "f = g", kern: false },
];

export const TYPEN = {
  normal: [
    { id: "n-graph", name: "Graph finden", en: "Find the graph" },
    { id: "n-ablesen", name: "Ablesen", en: "Read off" },
    { id: "n-wert", name: "Einsetzen", en: "Substitute" },
    { id: "n-ziel", name: "🎯 Zielgraph", en: "🎯 Target graph" },
  ],
  scheitel: [
    { id: "s-ablesen", name: "Scheitel ablesen", en: "Read the vertex" },
    { id: "s-graph", name: "Aus dem Graph", en: "From the graph" },
    { id: "s-umformen", name: "Normal → Scheitel", en: "Standard → vertex" },
    { id: "s-ausmult", name: "Scheitel → Normal", en: "Vertex → standard" },
    { id: "s-ziel", name: "🎯 Zielgraph", en: "🎯 Target graph" },
  ],
  null: [
    { id: "z-anzahl", name: "Wie viele?", en: "How many?" },
    { id: "z-produkt", name: "Produktform", en: "Factored form" },
    { id: "z-formel", name: "abc-Formel", en: "Quadratic formula" },
    { id: "z-sonder", name: "Ohne Formel", en: "Without formula" },
    { id: "z-scheitel", name: "Aus der Scheitelform", en: "From vertex form" },
    { id: "z-graph", name: "Am Graph", en: "On the graph" },
  ],
};
export const typName = (t) => (englisch() ? t.en : t.name);
export const themaName = (t) => (englisch() ? t.en : t.name);

/* ---------- Text-Bausteine (TeX) ---------- */
const Q = (x) => (typeof x === "number" ? q(x) : x);
const T = (x) => qTex(Q(x));
const K = (x) => (qNum(Q(x)) < 0 ? `(${T(x)})` : T(x));          // negative Zahl in Klammern
const neg = (x) => qNum(Q(x)) < 0;
const abs = (x) => (neg(x) ? qNeg(Q(x)) : Q(x));
const klammerX = (r) => (qNull(Q(r)) ? "x" : `(x ${neg(r) ? "+" : "−"} ${T(abs(r))})`);
const vorA = (a) => (qGleich(Q(a), q(1)) ? "" : qGleich(Q(a), q(-1)) ? "−" : `${T(a)}`);
/* a(x − r₁)(x − r₂) */
export function produktTex(a, r1, r2) {
  const f1 = klammerX(r1), f2 = klammerX(r2);
  if (qGleich(Q(r1), Q(r2))) return `${vorA(a)}${f1 === "x" ? "x^2" : `${f1}^2`}`;
  const teile = f1 === "x" ? `x${f2}` : f2 === "x" ? `x${f1}` : `${f1}${f2}`;
  return `${vorA(a)}${teile}`;
}
const fTex = (p) => `f(x) = ${normalTex(p)}`;
const sTex = (a, d, e) => `f(x) = ${scheitelTex(a, d, e)}`;
const kurve = (p) => ({ a: qNum(p.a), b: qNum(p.b), c: qNum(p.c) });
const ganz = (x) => Q(x).n === 1;

/* a-Werte je Stufe */
const A_STUFE = { 1: [1, -1], 2: [1, -1, 2, -2, 3, -3], 3: [q(1, 2), q(-1, 2), 2, -2, 3, -3, q(3, 2)] };
const aWahl = (stufe) => Q(wahl(A_STUFE[stufe] || A_STUFE[2]));
const imBild = (p, g = 5) => Math.abs(qNum(p.d)) <= g && Math.abs(qNum(p.e)) <= g;

/* Parabel mit ganzzahligem Scheitel in [−5, 5]², ganzzahligen b, c */
function zufallsParabel(stufe, { ohneB = false, eNichtNull = false, dNichtNull = false } = {}) {
  for (let v = 0; v < 4000; v++) {
    const a = aWahl(stufe), d = ohneB ? 0 : rnd(-4, 4), e = rnd(-5, 5);
    const p = ausScheitel(a, d, e);
    if (!ganz(p.b) || !ganz(p.c)) continue;
    if (eNichtNull && e === 0) continue;
    if (dNichtNull && d === 0) continue;
    if (!ohneB && d === 0 && stufe > 1 && zufall() < 0.7) continue;
    if (qNull(p.b) && qNull(p.c)) continue;
    if (Math.abs(qNum(p.c)) > 20) continue;
    return { p, a, d: q(d), e: q(e) };
  }
  return { p: ausScheitel(1, 2, -1), a: q(1), d: q(2), e: q(-1) };
}

/* Parabel mit zwei ganzzahligen Nullstellen r1 < r2 und Scheitel im Bild */
function zufallsNullstellen(stufe, { verschieden = true } = {}) {
  const aListe = stufe === 1 ? [1] : stufe === 2 ? [1, -1, 2, -2] : [1, -1, 2, -2, 3, q(1, 2), q(-1, 2)];
  for (let v = 0; v < 6000; v++) {
    const a = Q(wahl(aListe)), r1 = rnd(-7, 6), r2 = rnd(verschieden ? r1 + 1 : r1, 7);
    if (r1 === 0 && r2 === 0) continue;
    const p = parabel(a, qMul(qNeg(a), q(r1 + r2)), qMul(a, q(r1 * r2)));
    if (!ganz(p.b) || !ganz(p.c) || !imBild(p) || Math.abs(qNum(p.c)) > 30) continue;
    if ((r1 + r2) % 2 !== 0 && stufe === 1 && zufall() < 0.5) continue;      // Stufe 1: meist ganzzahliger Scheitel
    return { p, a, r1: q(r1), r2: q(r2) };
  }
  return { p: parabel(1, -1, -6), a: q(1), r1: q(-2), r2: q(3) };
}

/* ---------- Teile ---------- */
const zahlTeil = (frage, felder, extra = {}) => ({ art: "zahl", frage, felder: felder.map(([name, wert]) => ({ name, wert: Q(wert) })), ...extra });
const wahlTeil = (frage, optionen, richtig, extra = {}) => ({ art: "wahl", frage, optionen, richtig, ...extra });

/* ======================================================================
   Normalform
   ====================================================================== */
function nGraph(stufe) {
  for (let v = 0; v < 400; v++) {
    const { p } = zufallsParabel(stufe, { eNichtNull: true });
    if (qNull(p.b) || qNull(p.c)) continue;
    const kand = [
      { id: "ok", p },
      { id: "spiegel", p: parabel(p.a, qNeg(p.b), p.c), text: zw("Fast: Dieser Graph gehört zu −b. Das Vorzeichen von b entscheidet, ob der Scheitel links oder rechts der y-Achse liegt.", "Close: this graph belongs to −b. The sign of b decides whether the vertex is left or right of the y-axis.") },
      { id: "oeffnung", p: parabel(qNeg(p.a), p.b, p.c), text: zw(`Achte auf das Vorzeichen von a: a = ${T(p.a)} – die Parabel ist nach ${neg(p.a) ? "unten" : "oben"} geöffnet.`, `Watch the sign of a: a = ${T(p.a)} – the parabola opens ${neg(p.a) ? "downwards" : "upwards"}.`) },
      { id: "c", p: parabel(p.a, p.b, qNeg(p.c)), text: zw(`Schau auf die y-Achse: Bei x = 0 ist f(0) = c = ${T(p.c)}.`, `Look at the y-axis: at x = 0, f(0) = c = ${T(p.c)}.`) },
    ];
    if (!kand.every((k) => Math.abs(qNum(k.p.d)) <= 7 && Math.abs(qNum(k.p.e)) <= 8)) continue;
    const opts = mischen(kand).map((k) => ({ id: k.id, kurve: kurve(k.p) }));
    const fehler = Object.fromEntries(kand.filter((k) => k.text).map((k) => [k.id, k.text]));
    return {
      formel: fTex(p),
      frage: zw("Welcher Graph gehört zu dieser Funktion?", "Which graph belongs to this function?"),
      bild: null,
      teile: [wahlTeil(zw("Tippe den passenden Graph an.", "Tap the matching graph."), opts, "ok", { fehler, kacheln: true })],
      loesung: [
        `a = ${T(p.a)} ${neg(p.a) ? "< 0" : "> 0"}:\\ ${zw(neg(p.a) ? "\\text{nach unten geöffnet}" : "\\text{nach oben geöffnet}", neg(p.a) ? "\\text{opens downwards}" : "\\text{opens upwards}")}`,
        `f(0) = c = ${T(p.c)}`,
        `x_s = −\\frac{b}{2a} = ${T(p.d)}`,
      ],
      kurve: kurve(p),
      hilfe: {
        verstehen: [zw("Drei Merkmale reichen: Öffnung, y-Achsenabschnitt und auf welcher Seite der Scheitel liegt.", "Three features are enough: opening, y-intercept and on which side the vertex lies.")],
        ansatz: [zw("Vorzeichen von a → oben oder unten. c → Schnittpunkt mit der y-Achse.", "Sign of a → up or down. c → y-intercept.")],
        regel: [zw("Der Scheitel liegt bei $x_s = −\\frac{b}{2a}$.", "The vertex is at $x_s = −\\frac{b}{2a}$.")],
        pruefen: [zw("Setz x = 1 ein und vergleiche mit dem Graph.", "Substitute x = 1 and compare with the graph.")],
      },
    };
  }
  return nGraph(1);
}

function nAblesen(stufe) {
  const { p } = zufallsParabel(stufe, { eNichtNull: true });
  const teile = [
    wahlTeil(zw("Wie ist die Parabel geöffnet?", "How does the parabola open?"),
      [{ id: "oben", text: zw("nach oben", "upwards") }, { id: "unten", text: zw("nach unten", "downwards") }],
      neg(p.a) ? "unten" : "oben",
      { fehler: { oben: zw("Schau, wohin die Äste zeigen: Hier gehen sie nach unten – also a < 0.", "Look where the arms point: here they go down – so a < 0."), unten: zw("Die Äste zeigen nach oben – also a > 0.", "The arms point up – so a > 0.") } }),
    zahlTeil(zw("Wo schneidet der Graph die y-Achse? Das ist c.", "Where does the graph cross the y-axis? That is c."), [["c", p.c]],
      { fehler: [{ wert: qNeg(p.c), text: zw("Vorzeichen prüfen: Liegt der Schnittpunkt über oder unter der x-Achse?", "Check the sign: is the crossing above or below the x-axis?") }] }),
  ];
  if (stufe >= 2) teile.push(zahlTeil(zw("Und wo liegt die Symmetrieachse? x = …", "And where is the axis of symmetry? x = …"), [["x_s", p.d]]));
  return {
    formel: "f(x) = ax^2 + bx + c",
    frage: zw("Lies am Graph ab.", "Read off the graph."),
    bild: { kurve: kurve(p), zeigen: true },
    teile,
    loesung: [`f(x) = ${normalTex(p)}`, `c = f(0) = ${T(p.c)}`, `S(${T(p.d)} | ${T(p.e)})`],
    kurve: kurve(p),
    hilfe: {
      verstehen: [zw("Setzt du x = 0 ein, bleibt nur c übrig: f(0) = c.", "Substituting x = 0 leaves only c: f(0) = c.")],
      ansatz: [zw("Folge der y-Achse, bis sie den Graph trifft.", "Follow the y-axis until it meets the graph.")],
      regel: [zw("a > 0: nach oben geöffnet, a < 0: nach unten.", "a > 0: opens upwards, a < 0: downwards.")],
      pruefen: [zw("Der Punkt (0 | c) muss auf dem Graph liegen.", "The point (0 | c) must lie on the graph.")],
    },
  };
}

function nWert(stufe) {
  const { p } = zufallsParabel(stufe);
  const x0 = q(wahl(stufe === 1 ? [-2, -1, 1, 2, 3] : [-3, -2, -1, 2, 3, 4]));
  const xx = qMul(x0, x0);
  const wert = qAdd(qAdd(qMul(p.a, xx), qMul(p.b, x0)), p.c);
  const falschQuadrat = qAdd(qAdd(qMul(p.a, qNeg(xx)), qMul(p.b, x0)), p.c);   // −x² statt (−x)²
  const falschB = qAdd(qSub(qMul(p.a, xx), qMul(p.b, x0)), p.c);
  const fehler = [];
  if (neg(x0)) fehler.push({ wert: falschQuadrat, text: zw(`Achtung beim Quadrieren: $${K(x0)}^2 = ${T(xx)}$ – ein Quadrat ist nie negativ.`, `Careful when squaring: $${K(x0)}^2 = ${T(xx)}$ – a square is never negative.`) });
  fehler.push({ wert: falschB, text: zw(`Prüf den Summanden $b \\cdot x$: $${K(p.b)} \\cdot ${K(x0)} = ${T(qMul(p.b, x0))}$.`, `Check the term $b \\cdot x$: $${K(p.b)} \\cdot ${K(x0)} = ${T(qMul(p.b, x0))}$.`) });
  const aT = qGleich(p.a, q(1)) ? "" : qGleich(p.a, q(-1)) ? "−" : `${T(p.a)} \\cdot `;
  const bT = qNull(p.b) ? "" : ` ${neg(p.b) ? "−" : "+"} ${qGleich(abs(p.b), q(1)) ? "" : `${T(abs(p.b))} \\cdot `}${K(x0)}`;
  const cT = qNull(p.c) ? "" : ` ${neg(p.c) ? "−" : "+"} ${T(abs(p.c))}`;
  const rest = (qNull(p.b) ? "" : ` ${neg(qMul(p.b, x0)) ? "−" : "+"} ${T(abs(qMul(p.b, x0)))}`) + cT;
  return {
    formel: fTex(p),
    frage: zw(`Berechne $f(${T(x0)})$.`, `Calculate $f(${T(x0)})$.`),
    bild: { kurve: kurve(p), zeigen: "danach", punkte: [{ x: qNum(x0), y: qNum(wert), name: `(${T(x0)} | ${T(wert)})`.replace(/\\frac\{(\d+)\}\{(\d+)\}/g, "$1/$2") }] },
    teile: [zahlTeil(zw("Setze ein und rechne aus.", "Substitute and calculate."), [[`f(${T(x0)})`, wert]], { fehler })],
    loesung: [`f(${T(x0)}) = ${aT}${K(x0)}^2${bT}${cT}`, `= ${T(qMul(p.a, xx))}${rest} = ${T(wert)}`],
    kurve: kurve(p),
    hilfe: {
      verstehen: [zw(`Überall, wo x steht, setzt du ${T(x0)} ein – mit Klammern.`, `Wherever there is an x, put in ${T(x0)} – with brackets.`)],
      ansatz: [zw("Erst quadrieren, dann mal a, dann b · x, zum Schluss c.", "Square first, then times a, then b · x, finally c.")],
      regel: [zw("Punkt vor Strich, Potenz vor Punkt.", "Powers before products before sums.")],
      pruefen: [zw("Der Punkt muss auf dem Graph liegen – nach dem Lösen wird er eingezeichnet.", "The point must lie on the graph – it is drawn once you are done.")],
    },
  };
}

/* Zielgraph: gesucht sind a, b, c (Normalform) */
function nZiel(stufe) {
  const { p } = zufallsParabel(stufe === 3 ? 2 : stufe);
  return {
    formel: null,
    frage: zw("Stell a, b und c so ein, dass dein Graph auf dem gestrichelten Zielgraph liegt.", "Set a, b and c so that your graph lies on the dashed target graph."),
    bild: { ziel: kurve(p), zeigen: true },
    teile: [{ art: "regler", form: "normal", frage: zw("Triff den Zielgraph.", "Hit the target graph."), params: ["a", "b", "c"], start: { a: 1, b: 0, c: 0 }, ziel: kurve(p), schritt: { a: 1, b: 1, c: 1 } }],
    loesung: [fTex(p)],
    kurve: kurve(p),
    hilfe: {
      verstehen: [zw("c verschiebt den Graph nach oben und unten, a macht ihn steiler oder flacher, b schiebt den Scheitel schräg.", "c moves the graph up and down, a makes it steeper or flatter, b moves the vertex diagonally.")],
      ansatz: [zw("Stell zuerst c ein (y-Achsenabschnitt), dann a (Öffnung), zuletzt b.", "Set c first (y-intercept), then a (opening), finally b.")],
      regel: [zw("Vom Scheitel aus 1 nach rechts geht es a nach oben.", "From the vertex, 1 to the right goes a up.")],
      pruefen: [zw(`Der Zielgraph schneidet die y-Achse bei ${T(p.c)}.`, `The target graph crosses the y-axis at ${T(p.c)}.`)],
    },
  };
}

/* ======================================================================
   Scheitelform
   ====================================================================== */
function sAblesen(stufe) {
  const a = aWahl(stufe), d = q(rnd(-5, 5)), e = q(rnd(-5, 5));
  const dd = qNull(d) ? q(wahl([-3, 2])) : d;
  return {
    formel: sTex(a, dd, e),
    frage: zw("Wo liegt der Scheitelpunkt?", "Where is the vertex?"),
    bild: { kurve: kurve(ausScheitel(a, dd, e)), zeigen: "danach", punkte: [{ x: qNum(dd), y: qNum(e), name: "S" }] },
    teile: [zahlTeil(zw("Gib die Koordinaten von S ein.", "Enter the coordinates of S."), [["x_s", dd], ["y_s", e]],
      { punkt: "S", fehler: [{ werte: [qNeg(dd), e], text: zw(`Vorzeichenfalle! In $(x ${neg(dd) ? "+" : "−"} ${T(abs(dd))})$ steckt $x_s = ${T(dd)}$: Die Klammer wird 0, wenn $x = ${T(dd)}$.`, `Sign trap! $(x ${neg(dd) ? "+" : "−"} ${T(abs(dd))})$ contains $x_s = ${T(dd)}$: the bracket is 0 when $x = ${T(dd)}$.`) },
        { werte: [qNeg(dd), qNeg(e)], text: zw("Nur x_s dreht das Vorzeichen um – y_s steht genau so da, wie es ist.", "Only x_s flips its sign – y_s is exactly as written.") }] })],
    loesung: [`${scheitelTex(a, dd, e)} = a(x − x_s)^2 + y_s`, `S(${T(dd)} | ${T(e)})`],
    kurve: kurve(ausScheitel(a, dd, e)),
    hilfe: {
      verstehen: [zw("Die Scheitelform heißt so, weil man den Scheitel direkt ablesen kann: f(x) = a(x − x_s)² + y_s.", "Vertex form is named for showing the vertex directly: f(x) = a(x − x_s)² + y_s.")],
      ansatz: [zw("Für welches x wird die Klammer 0? Das ist x_s.", "For which x is the bracket 0? That is x_s.")],
      regel: [zw("x_s mit umgedrehtem Vorzeichen aus der Klammer, y_s wie es dasteht.", "x_s with flipped sign from the bracket, y_s as written.")],
      pruefen: [zw("Setz x_s ein: Die Klammer muss 0 werden, f(x_s) = y_s.", "Substitute x_s: the bracket must vanish, f(x_s) = y_s.")],
    },
  };
}

function sGraph(stufe) {
  const aL = stufe === 1 ? [1, -1] : stufe === 2 ? [1, -1, 2, -2] : [q(1, 2), q(-1, 2), 2, -2, 3];
  for (let v = 0; v < 500; v++) {
    const a = Q(wahl(aL)), d = q(rnd(-4, 4)), e = q(rnd(-4, 4));
    const schritt = ganz(a) ? 1 : 2;
    const px = qAdd(d, q(schritt)), py = qAdd(e, qMul(a, q(schritt * schritt)));
    if (Math.abs(qNum(py)) > 9 || Math.abs(qNum(px)) > 9) continue;
    const p = ausScheitel(a, d, e);
    return {
      formel: "f(x) = a(x − x_s)^2 + y_s",
      frage: zw("Stell die Scheitelform zu diesem Graph auf.", "Set up the vertex form for this graph."),
      bild: { kurve: kurve(p), zeigen: true, punkte: [{ x: qNum(d), y: qNum(e), name: "S" }, { x: qNum(px), y: qNum(py), name: "P", hohl: true }] },
      teile: [
        zahlTeil(zw("Lies den Scheitel ab.", "Read off the vertex."), [["x_s", d], ["y_s", e]], { punkt: "S", fehler: [{ werte: [e, d], text: zw("x und y vertauscht? Erst nach rechts/links (x), dann nach oben/unten (y).", "x and y swapped? First right/left (x), then up/down (y).") }] }),
        zahlTeil(zw(`Vom Scheitel ${schritt} nach rechts zu P – wie groß ist a?`, `From the vertex ${schritt} to the right to P – what is a?`), [["a", a]],
          { fehler: [{ wert: qNeg(a), text: zw("Geht es von S zu P nach oben oder nach unten? Das entscheidet das Vorzeichen von a.", "From S to P – up or down? That decides the sign of a.") },
            ...(schritt === 2 ? [{ wert: qMul(a, q(4)), text: zw("Fast: 2 nach rechts heißt 2² = 4-mal a nach oben. Teile den Höhenunterschied durch 4.", "Almost: 2 to the right means 2² = 4 times a upwards. Divide the height difference by 4.") }] : [])] }),
      ],
      loesung: [`S(${T(d)} | ${T(e)})`, schritt === 1 ? `a = ${T(a)}` : `a = \\frac{${T(qSub(py, e))}}{4} = ${T(a)}`, sTex(a, d, e)],
      kurve: kurve(p),
      hilfe: {
        verstehen: [zw("Zwei Informationen braucht die Scheitelform: den Scheitel S und den Streckfaktor a.", "Vertex form needs two things: the vertex S and the stretch factor a.")],
        ansatz: [zw("Geh vom Scheitel 1 Kästchen nach rechts: Der Graph steigt (oder fällt) um a.", "From the vertex go 1 square to the right: the graph rises (or falls) by a.")],
        regel: [zw("f(x_s + 1) = a + y_s und f(x_s + 2) = 4a + y_s.", "f(x_s + 1) = a + y_s and f(x_s + 2) = 4a + y_s.")],
        pruefen: [zw("Setz P in deine Scheitelform ein – es muss passen.", "Substitute P into your vertex form – it must fit.")],
      },
    };
  }
  return sGraph(1);
}

function sUmformen(stufe) {
  const { p: pp, a, e } = zufallsParabel(stufe, { eNichtNull: true, dNichtNull: true });
  const xs = pp.d, ys = pp.e;
  const optionen = mischen([
    { id: "ok", tex: scheitelTex(a, xs, ys) },
    { id: "vz", tex: scheitelTex(a, qNeg(xs), ys) },
    { id: "ohneA", tex: qGleich(a, q(1)) ? scheitelTex(a, xs, qNeg(ys)) : scheitelTex(q(1), xs, ys) },
    { id: "beide", tex: scheitelTex(a, qNeg(xs), qNeg(ys)) },
  ]);
  return {
    formel: fTex(pp),
    frage: zw("Bring die Funktion in Scheitelform.", "Write the function in vertex form."),
    bild: { kurve: kurve(pp), zeigen: "danach", punkte: [{ x: qNum(xs), y: qNum(ys), name: "S" }] },
    teile: [
      zahlTeil(zw("Schritt 1: Berechne $x_s = −\\frac{b}{2a}$.", "Step 1: Calculate $x_s = −\\frac{b}{2a}$."), [["x_s", xs]],
        { fehler: [{ wert: qNeg(xs), text: zw("Das Minus vor dem Bruch nicht vergessen: $x_s = −\\frac{b}{2a}$.", "Don't forget the minus in front: $x_s = −\\frac{b}{2a}$.") },
          { wert: qNeg(qDiv(pp.b, pp.a)), text: zw("Du hast durch a geteilt, aber nicht durch 2a.", "You divided by a, but not by 2a.") }] }),
      zahlTeil(zw(`Schritt 2: Berechne $y_s = f(${T(xs)})$.`, `Step 2: Calculate $y_s = f(${T(xs)})$.`), [["y_s", ys]],
        { fehler: [{ wert: qAdd(qSub(qMul(pp.a, qMul(xs, xs)), qMul(pp.b, xs)), pp.c), text: zw("Prüf den Summanden b · x_s – das Vorzeichen.", "Check the term b · x_s – its sign.") }] }),
      wahlTeil(zw("Schritt 3: Welche Scheitelform ist richtig?", "Step 3: Which vertex form is correct?"), optionen, "ok",
        { fehler: { vz: zw(`In der Klammer steht x minus x_s: Mit x_s = ${T(xs)} wird daraus $${klammerX(xs)}$.`, `The bracket is x minus x_s: with x_s = ${T(xs)} it becomes $${klammerX(xs)}$.`), ohneA: zw(`Der Faktor a = ${T(a)} bleibt vor der Klammer stehen.`, `The factor a = ${T(a)} stays in front of the bracket.`), beide: zw("y_s wird nicht umgedreht – nur in der Klammer steht −x_s.", "y_s is not flipped – only the bracket holds −x_s.") } }),
    ],
    loesung: [
      `x_s = −\\frac{${T(pp.b)}}{2 \\cdot ${K(pp.a)}} = ${T(xs)}`,
      `y_s = f(${T(xs)}) = ${T(ys)}`,
      sTex(a, xs, ys),
    ],
    kurve: kurve(pp),
    hilfe: {
      verstehen: [zw("Die Scheitelform braucht a, x_s und y_s. a steht schon da.", "Vertex form needs a, x_s and y_s. a is already given.")],
      ansatz: [zw("x_s mit der Formel, dann y_s durch Einsetzen von x_s in f.", "x_s with the formula, then y_s by substituting x_s into f.")],
      regel: [zw("$x_s = −\\frac{b}{2a}$, $y_s = f(x_s)$. Oder quadratisch ergänzen.", "$x_s = −\\frac{b}{2a}$, $y_s = f(x_s)$. Or complete the square.")],
      pruefen: [zw("Multiplizier deine Scheitelform aus – es muss die Normalform herauskommen.", "Expand your vertex form – you must get the standard form back.")],
    },
  };
}

function sAusmult(stufe) {
  const { p, a, d: dd, e } = zufallsParabel(stufe, { eNichtNull: true, dNichtNull: true });
  const d2 = qMul(dd, dd);
  const bin = `x^2 ${neg(dd) ? "+" : "−"} ${T(abs(qMul(q(2), dd)))}x + ${T(d2)}`;
  return {
    formel: sTex(a, dd, e),
    frage: zw("Multipliziere aus: Wie lautet die Normalform?", "Expand: what is the standard form?"),
    bild: { kurve: kurve(p), zeigen: "danach" },
    teile: [zahlTeil(zw(`$f(x) = ${vorA(a) || ""}x^2 + b x + c$ – bestimme b und c.`, `$f(x) = ${vorA(a) || ""}x^2 + b x + c$ – find b and c.`), [["b", p.b], ["c", p.c]],
      { fehler: [
        { werte: [qNeg(p.b), p.c], text: zw(`Binomische Formel: $${klammerX(dd)}^2 = ${bin}$ – prüf das Vorzeichen des mittleren Glieds.`, `Binomial formula: $${klammerX(dd)}^2 = ${bin}$ – check the sign of the middle term.`) },
        { werte: [p.b, qAdd(d2, e)], text: zw(`Der Faktor a muss auch mit $${T(d2)}$ multipliziert werden.`, `The factor a must also multiply $${T(d2)}$.`) },
        { werte: [qMul(q(-2), dd), qAdd(d2, e)], text: zw("Der Faktor a gilt für die ganze Klammer – auch für b und das Quadrat.", "The factor a applies to the whole bracket – including b and the square.") },
        { werte: [p.b, qMul(a, d2)], text: zw(`Am Ende kommt noch y_s = ${T(e)} dazu.`, `Finally add y_s = ${T(e)}.`) },
      ] })],
    loesung: [
      `f(x) = ${vorA(a)}${qGleich(a, q(1)) ? `${bin}` : `(${bin})`} ${neg(e) ? "−" : "+"} ${T(abs(e))} = ${normalTex(p)}`,
    ],
    kurve: kurve(p),
    hilfe: {
      verstehen: [zw("Erst die Klammer mit der binomischen Formel auflösen, dann a hineinmultiplizieren, zum Schluss y_s addieren.", "First expand the bracket with the binomial formula, multiply in a, finally add y_s.")],
      ansatz: [zw(`$${klammerX(dd)}^2 = ${bin}$`, `$${klammerX(dd)}^2 = ${bin}$`)],
      regel: [zw("$(x − d)^2 = x^2 − 2dx + d^2$", "$(x − d)^2 = x^2 − 2dx + d^2$")],
      pruefen: [zw("Prüf mit x = 0: f(0) = c muss in beiden Formen gleich sein.", "Check with x = 0: f(0) = c must agree in both forms.")],
    },
  };
}

function sZiel(stufe) {
  const a = Q(wahl(stufe === 1 ? [1, -1] : [1, -1, 2, -2, q(1, 2), q(-1, 2)]));
  let d = rnd(-4, 4), e = rnd(-4, 4);
  if (d === 0 && e === 0) { d = wahl([-3, 2]); e = wahl([-2, 1]); }
  const p = ausScheitel(a, d, e);
  return {
    formel: null,
    frage: zw("Stell a, d und e so ein, dass dein Graph auf dem Zielgraph liegt.", "Set a, d and e so that your graph lies on the target graph."),
    bild: { ziel: kurve(p), zeigen: true },
    teile: [{ art: "regler", form: "scheitel", frage: zw("Triff den Zielgraph.", "Hit the target graph."), params: ["a", "d", "e"], start: { a: 1, d: 0, e: 0 }, ziel: { a: qNum(a), d, e }, schritt: { a: stufe === 1 ? 1 : 0.5, d: 1, e: 1 } }],
    loesung: [sTex(a, d, e)],
    kurve: kurve(p),
    hilfe: {
      verstehen: [zw("d schiebt nach links/rechts, e nach oben/unten, a macht steiler/flacher.", "d moves left/right, e up/down, a steeper/flatter.")],
      ansatz: [zw("Bring zuerst den Scheitel an die richtige Stelle (d, e), dann passe a an.", "First move the vertex to the right place (d, e), then adjust a.")],
      regel: [zw("Der Scheitel von a(x − d)² + e liegt bei S(d | e).", "The vertex of a(x − d)² + e is at S(d | e).")],
      pruefen: [zw(`Der Zielscheitel liegt bei S(${d} | ${e}).`.replace(/-/g, "−"), `The target vertex is at S(${d} | ${e}).`.replace(/-/g, "−"))],
    },
  };
}

/* ======================================================================
   Nullstellen
   ====================================================================== */
const nullFelder = (r1, r2) => (qGleich(r1, r2) ? [["x_1", r1]] : [["x_1", r1], ["x_2", r2]]);

function zAnzahl(stufe) {
  const fall = wahl(["zwei", "zwei", "eine", "keine", "keine"]);
  let p = null;
  for (let v = 0; v < 6000 && !p; v++) {
    const { p: k } = zufallsParabel(stufe);
    const D = qNum(k.D);
    if ((fall === "zwei" && D > 0) || (fall === "eine" && D === 0) || (fall === "keine" && D < 0)) p = k;
  }
  p = p || parabel(1, -2, -3);
  const D = p.D, Dn = qNum(D);
  const anz = Dn > 0 ? "2" : Dn === 0 ? "1" : "0";
  const b2 = qMul(p.b, p.b), ac4 = qMul(q(4), qMul(p.a, p.c));
  return {
    formel: fTex(p),
    frage: zw("Wie viele Nullstellen hat f? Die Diskriminante verrät es.", "How many roots does f have? The discriminant tells you."),
    bild: { kurve: kurve(p), zeigen: "danach" },
    teile: [
      zahlTeil(zw("Berechne $D = b^2 − 4ac$.", "Calculate $D = b^2 − 4ac$."), [["D", D]],
        { fehler: [{ wert: qAdd(b2, ac4), text: zw(`Minus beachten: $D = b^2 − 4ac = ${T(b2)} − ${K(ac4)}$.`, `Mind the minus: $D = b^2 − 4ac = ${T(b2)} − ${K(ac4)}$.`) },
          { wert: qSub(qNeg(b2), ac4), text: zw(`$b^2$ ist nie negativ: $${K(p.b)}^2 = ${T(b2)}$.`, `$b^2$ is never negative: $${K(p.b)}^2 = ${T(b2)}$.`) }] }),
      wahlTeil(zw("Wie viele Nullstellen sind das?", "How many roots is that?"),
        [{ id: "0", text: zw("keine", "none") }, { id: "1", text: zw("eine", "one") }, { id: "2", text: zw("zwei", "two") }], anz,
        { fehler: { 0: zw("D < 0 heißt keine, D = 0 eine, D > 0 zwei Nullstellen.", "D < 0 means none, D = 0 one, D > 0 two roots."), 1: zw("Nur bei D = 0 gibt es genau eine Nullstelle.", "Only D = 0 gives exactly one root."), 2: zw("D > 0 wäre nötig für zwei Nullstellen.", "Two roots need D > 0.") } }),
    ],
    loesung: [`D = ${K(p.b)}^2 − 4 \\cdot ${K(p.a)} \\cdot ${K(p.c)} = ${T(b2)} ${neg(ac4) ? "+" : "−"} ${T(abs(ac4))} = ${T(D)}`,
      Dn > 0 ? zw("D > 0:\\ \\text{zwei Nullstellen}", "D > 0:\\ \\text{two roots}") : Dn === 0 ? zw("D = 0:\\ \\text{eine Nullstelle}", "D = 0:\\ \\text{one root}") : zw("D < 0:\\ \\text{keine Nullstelle}", "D < 0:\\ \\text{no root}")],
    kurve: kurve(p),
    hilfe: {
      verstehen: [zw("Die Diskriminante ist der Teil unter der Wurzel in der abc-Formel.", "The discriminant is the part under the root in the quadratic formula.")],
      ansatz: [zw(`a = ${T(p.a)}, b = ${T(p.b)}, c = ${T(p.c)} einsetzen.`, `Substitute a = ${T(p.a)}, b = ${T(p.b)}, c = ${T(p.c)}.`)],
      regel: [zw("D > 0: zwei, D = 0: eine, D < 0: keine Nullstelle.", "D > 0: two, D = 0: one, D < 0: no root.")],
      pruefen: [zw("Nach dem Lösen siehst du den Graph – zähl die Schnittpunkte mit der x-Achse.", "Once solved you see the graph – count the crossings with the x-axis.")],
    },
  };
}

function zProdukt(stufe) {
  const { p, a, r1, r2 } = zufallsNullstellen(stufe);
  return {
    formel: `f(x) = ${produktTex(a, r1, r2)}`,
    frage: zw("Lies die Nullstellen ab – ohne zu rechnen.", "Read off the roots – no calculation needed."),
    bild: { kurve: kurve(p), zeigen: "danach", punkte: [{ x: qNum(r1), y: 0 }, { x: qNum(r2), y: 0 }] },
    teile: [zahlTeil(zw("Gib beide Nullstellen ein (Reihenfolge egal).", "Enter both roots (any order)."), nullFelder(r1, r2),
      { ungeordnet: true, fehler: [{ werte: [qNeg(r1), qNeg(r2)], text: zw("Vorzeichenfalle: $(x − 3) = 0$ gilt für x = 3, nicht für −3.", "Sign trap: $(x − 3) = 0$ holds for x = 3, not −3.") }] })],
    loesung: [`${produktTex(a, r1, r2)} = 0`, zw(`\\text{Ein Produkt ist 0, wenn ein Faktor 0 ist.}`, `\\text{A product is 0 if one factor is 0.}`), `x_1 = ${T(r1)},\\quad x_2 = ${T(r2)}`],
    kurve: kurve(p),
    hilfe: {
      verstehen: [zw("Satz vom Nullprodukt: Ein Produkt ist 0, wenn einer der Faktoren 0 ist.", "Zero product rule: a product is 0 when one factor is 0.")],
      ansatz: [zw("Setz jede Klammer einzeln gleich 0.", "Set each bracket equal to 0.")],
      regel: [zw("x − r = 0 ⇒ x = r. Der Faktor a vorne hat keinen Einfluss auf die Nullstellen.", "x − r = 0 ⇒ x = r. The factor a in front does not affect the roots.")],
      pruefen: [zw("Setz deine Zahl ein: Eine Klammer muss 0 ergeben.", "Substitute your number: one bracket must become 0.")],
    },
  };
}

function zFormel(stufe) {
  const { p, r1, r2 } = zufallsNullstellen(stufe);
  const D = p.D, w = q(Math.round(Math.sqrt(qNum(D))));
  const zweiA = qMul(q(2), p.a);
  const pq = qGleich(p.a, q(1));
  return {
    formel: fTex(p),
    frage: zw(`Löse $f(x) = 0$ mit der ${pq ? "pq- oder " : ""}abc-Formel.`, `Solve $f(x) = 0$ with the quadratic formula.`),
    bild: { kurve: kurve(p), zeigen: "danach", punkte: [{ x: qNum(r1), y: 0 }, { x: qNum(r2), y: 0 }] },
    teile: [
      zahlTeil(zw("Diskriminante: $D = b^2 − 4ac$", "Discriminant: $D = b^2 − 4ac$"), [["D", D]],
        { fehler: [{ wert: qAdd(qMul(p.b, p.b), qMul(q(4), qMul(p.a, p.c))), text: zw("Minus vor 4ac beachten – bei negativem c wird daraus ein Plus.", "Mind the minus before 4ac – with negative c it becomes a plus.") }] }),
      zahlTeil(zw(`$x_{1,2} = \\frac{−b \\pm \\sqrt{D}}{2a} = \\frac{${T(qNeg(p.b))} \\pm ${T(w)}}{${T(zweiA)}}$`, `$x_{1,2} = \\frac{−b \\pm \\sqrt{D}}{2a} = \\frac{${T(qNeg(p.b))} \\pm ${T(w)}}{${T(zweiA)}}$`), nullFelder(r1, r2),
        { ungeordnet: true, fehler: [{ werte: [qNeg(r1), qNeg(r2)], text: zw("Vorne steht −b: Bei b = " + T(p.b) + " ist −b = " + T(qNeg(p.b)) + ".", "In front is −b: with b = " + T(p.b) + ", −b = " + T(qNeg(p.b)) + ".") }] }),
    ],
    loesung: [
      `D = ${K(p.b)}^2 − 4 \\cdot ${K(p.a)} \\cdot ${K(p.c)} = ${T(D)}`,
      `x_{1,2} = \\frac{${T(qNeg(p.b))} \\pm ${T(w)}}{${T(zweiA)}}`,
      `x_1 = ${T(r1)},\\quad x_2 = ${T(r2)}`,
    ],
    kurve: kurve(p),
    hilfe: {
      verstehen: [zw("Nullstellen sind die x-Werte mit f(x) = 0 – dort schneidet der Graph die x-Achse.", "Roots are the x-values with f(x) = 0 – where the graph crosses the x-axis.")],
      ansatz: [zw(`a = ${T(p.a)}, b = ${T(p.b)}, c = ${T(p.c)} ablesen und einsetzen.`, `Read off a = ${T(p.a)}, b = ${T(p.b)}, c = ${T(p.c)} and substitute.`)],
      regel: [zw("$x_{1,2} = \\frac{−b \\pm \\sqrt{b^2 − 4ac}}{2a}$", "$x_{1,2} = \\frac{−b \\pm \\sqrt{b^2 − 4ac}}{2a}$")],
      pruefen: [zw(`Vieta: $x_1 + x_2 = −\\frac{b}{a} = ${T(qAdd(r1, r2))}$.`, `Vieta: $x_1 + x_2 = −\\frac{b}{a} = ${T(qAdd(r1, r2))}$.`)],
    },
  };
}

function zSonder(stufe) {
  const ausklammern = zufall() < 0.5;
  if (ausklammern) {
    for (let v = 0; v < 2000; v++) {
      const a = Q(wahl(stufe === 1 ? [1, -1] : [1, -1, 2, -2, 3])), r = q(rnd(-8, 8));
      if (qNull(r)) continue;
      const p = parabel(a, qMul(qNeg(a), r), q(0));
      if (!imBild(p)) continue;
      const lin = `${vorA(a)}x ${neg(p.b) ? "−" : "+"} ${T(abs(p.b))}`;
      return {
        formel: fTex(p),
        frage: zw("Hier fehlt c – das geht ohne Formel.", "There is no c – no formula needed."),
        bild: { kurve: kurve(p), zeigen: "danach", punkte: [{ x: 0, y: 0 }, { x: qNum(r), y: 0 }] },
        teile: [zahlTeil(zw("Klammer x aus und gib beide Nullstellen ein.", "Factor out x and enter both roots."), [["x_1", 0], ["x_2", r]],
          { ungeordnet: true, fehler: [{ werte: [q(0), qNeg(r)], text: zw("Prüf das Vorzeichen: Für welches x wird die Klammer 0?", "Check the sign: for which x does the bracket vanish?") }, { werte: [q(0), q(0)], text: zw("Zwei Faktoren, zwei Nullstellen: x = 0 und die Nullstelle der Klammer.", "Two factors, two roots: x = 0 and the root of the bracket.") }] })],
        loesung: [`${normalTex(p)} = x(${lin}) = 0`, `x_1 = 0,\\quad ${lin} = 0 \\Rightarrow x_2 = ${T(r)}`],
        kurve: kurve(p),
        hilfe: {
          verstehen: [zw("Ohne c steckt in jedem Summanden ein x.", "Without c every term contains an x.")],
          ansatz: [zw("x ausklammern: x · (ax + b) = 0.", "Factor out x: x · (ax + b) = 0.")],
          regel: [zw("Satz vom Nullprodukt: x = 0 oder ax + b = 0.", "Zero product rule: x = 0 or ax + b = 0.")],
          pruefen: [zw("x = 0 ist bei c = 0 immer eine Nullstelle.", "With c = 0, x = 0 is always a root.")],
        },
      };
    }
  }
  for (let v = 0; v < 2000; v++) {
    const a = Q(wahl(stufe === 1 ? [1] : [1, -1, 2, -2])), k = q(rnd(1, 4));
    const p = parabel(a, q(0), qMul(qNeg(a), qMul(k, k)));
    if (!imBild(p)) continue;
    const rechts = qDiv(qNeg(p.c), p.a);
    return {
      formel: fTex(p),
      frage: zw("Hier fehlt b – das geht ohne Formel.", "There is no b – no formula needed."),
      bild: { kurve: kurve(p), zeigen: "danach", punkte: [{ x: -qNum(k), y: 0 }, { x: qNum(k), y: 0 }] },
      teile: [zahlTeil(zw("Stell nach x² um, zieh die Wurzel – an beide Vorzeichen denken.", "Solve for x², take the root – remember both signs."), [["x_1", qNeg(k)], ["x_2", k]],
        { ungeordnet: true, fehler: [{ werte: [k, k], text: zw("Die Wurzel hat zwei Lösungen: +√ und −√.", "The root has two solutions: +√ and −√.") }] })],
      loesung: [`${normalTex(p)} = 0`, `x^2 = ${T(rechts)}`, `x_1 = −${T(k)},\\quad x_2 = ${T(k)}`],
      kurve: kurve(p),
      hilfe: {
        verstehen: [zw("Ohne b steht nur x² da – du kannst direkt umstellen.", "Without b there's only x² – rearrange directly.")],
        ansatz: [zw("c auf die andere Seite, durch a teilen.", "Move c to the other side, divide by a.")],
        regel: [zw("x² = r ⇒ x = ±√r (für r > 0).", "x² = r ⇒ x = ±√r (for r > 0).")],
        pruefen: [zw("Die Parabel ist symmetrisch zur y-Achse – die Nullstellen auch.", "The parabola is symmetric about the y-axis – so are the roots.")],
      },
    };
  }
  return zProdukt(stufe);
}

function zScheitel(stufe) {
  for (let v = 0; v < 3000; v++) {
    const a = Q(wahl(stufe === 1 ? [1, -1] : [1, -1, 2, -2])), d = q(rnd(-4, 4)), k = q(rnd(1, 3));
    const e = qMul(qNeg(a), qMul(k, k));
    if (Math.abs(qNum(e)) > 5) continue;
    const r1 = qSub(d, k), r2 = qAdd(d, k);
    const p = ausScheitel(a, d, e);
    const rechts = qDiv(qNeg(e), a);
    return {
      formel: sTex(a, d, e),
      frage: zw("Berechne die Nullstellen direkt aus der Scheitelform.", "Calculate the roots straight from the vertex form."),
      bild: { kurve: kurve(p), zeigen: "danach", punkte: [{ x: qNum(r1), y: 0 }, { x: qNum(r2), y: 0 }, { x: qNum(d), y: qNum(e), name: "S" }] },
      teile: [
        zahlTeil(zw("Stell nach der Klammer um: e rüber, durch a teilen.", "Rearrange for the bracket: move e, divide by a."), [[klammerX(d) === "x" ? "x^2" : `${klammerX(d)}^2`, rechts]],
          { fehler: [{ wert: qNeg(rechts), text: zw("Beim Rüberbringen dreht e sein Vorzeichen.", "When moving e across, it flips its sign.") }, { wert: qNeg(e), text: zw(`Danach noch durch a = ${T(a)} teilen.`, `Then divide by a = ${T(a)}.`) }] }),
        zahlTeil(zw("Wurzel ziehen (±) und nach x auflösen.", "Take the root (±) and solve for x."), [["x_1", r1], ["x_2", r2]],
          { ungeordnet: true, fehler: [{ werte: [qNeg(r1), qNeg(r2)], text: zw("Vorzeichen von x_s beachten: Die Nullstellen liegen symmetrisch um x_s = " + T(d) + ".", "Mind the sign of x_s: the roots lie symmetrically around x_s = " + T(d) + ".") }, { werte: [qNeg(k), k], text: zw(`Noch x_s = ${T(d)} dazurechnen – die Nullstellen liegen um den Scheitel herum.`, `Still add x_s = ${T(d)} – the roots lie around the vertex.`) }] }),
      ],
      loesung: [`${scheitelTex(a, d, e)} = 0`, `${klammerX(d) === "x" ? "x^2" : `${klammerX(d)}^2`} = ${T(rechts)}`, `${klammerX(d) === "x" ? "x" : `x ${neg(d) ? "+" : "−"} ${T(abs(d))}`} = \\pm ${T(k)}`, `x_1 = ${T(r1)},\\quad x_2 = ${T(r2)}`],
      kurve: kurve(p),
      hilfe: {
        verstehen: [zw("In der Scheitelform steht x nur einmal – du kannst rückwärts rechnen.", "In vertex form x appears only once – you can work backwards.")],
        ansatz: [zw("e rüber, durch a teilen, Wurzel ziehen (±), x_s rüber.", "Move e, divide by a, take the root (±), move x_s.")],
        regel: [zw("x_{1,2} = x_s ± √(−e/a)", "x_{1,2} = x_s ± √(−e/a)")],
        pruefen: [zw("Die Nullstellen liegen gleich weit links und rechts vom Scheitel.", "The roots lie equally far left and right of the vertex.")],
      },
    };
  }
  return zProdukt(stufe);
}

function zGraph(stufe) {
  const { p, r1, r2 } = zufallsNullstellen(stufe === 3 ? 2 : stufe);
  return {
    formel: null,
    frage: zw("Lies die Nullstellen am Graph ab.", "Read the roots off the graph."),
    bild: { kurve: kurve(p), zeigen: true },
    teile: [
      zahlTeil(zw("Wo schneidet der Graph die x-Achse?", "Where does the graph cross the x-axis?"), nullFelder(r1, r2),
        { ungeordnet: true, fehler: [{ werte: [qNeg(r1), qNeg(r2)], text: zw("Links von der y-Achse sind die x-Werte negativ.", "Left of the y-axis the x-values are negative.") }] }),
      zahlTeil(zw("Bonus: Wo liegt der Scheitel? (genau in der Mitte)", "Bonus: where is the vertex? (exactly in the middle)"), [["x_s", p.d]],
        { fehler: [{ wert: qAdd(r1, r2), text: zw("Fast – die Mitte ist der Durchschnitt: (x₁ + x₂) / 2.", "Almost – the middle is the average: (x₁ + x₂) / 2.") }] }),
    ],
    loesung: [`x_1 = ${T(r1)},\\quad x_2 = ${T(r2)}`, `x_s = \\frac{${T(r1)} + ${K(r2)}}{2} = ${T(p.d)}`, `f(x) = ${produktTex(p.a, r1, r2)}`],
    kurve: kurve(p),
    hilfe: {
      verstehen: [zw("Nullstellen sind die Stellen, an denen der Graph die x-Achse trifft (y = 0).", "Roots are where the graph meets the x-axis (y = 0).")],
      ansatz: [zw("Fahr die x-Achse entlang und lies die Kästchen ab.", "Run along the x-axis and count the squares.")],
      regel: [zw("Der Scheitel liegt genau zwischen den Nullstellen.", "The vertex lies exactly between the roots.")],
      pruefen: [zw("Gleich weit vom Scheitel entfernt? Dann passt es.", "Equally far from the vertex? Then it fits.")],
    },
  };
}

/* ---------- Zusammenführen ---------- */
const MACHER = {
  "n-graph": nGraph, "n-ablesen": nAblesen, "n-wert": nWert, "n-ziel": nZiel,
  "s-ablesen": sAblesen, "s-graph": sGraph, "s-umformen": sUmformen, "s-ausmult": sAusmult, "s-ziel": sZiel,
  "z-anzahl": zAnzahl, "z-produkt": zProdukt, "z-formel": zFormel, "z-sonder": zSonder, "z-scheitel": zScheitel, "z-graph": zGraph,
};
export const alleTypIds = () => Object.keys(MACHER);
let laufNr = 0;

/* thema: normal | scheitel | null; typ: Typ-Id oder "mix"; stufe 1–3 */
export function neueAufgabe(thema, typ = "mix", stufe = 1) {
  const liste = TYPEN[thema] || TYPEN.normal;
  const t = typ === "mix" || !MACHER[typ] ? wahl(liste.filter((x) => !x.id.endsWith("ziel"))).id : typ;
  const a = MACHER[t](stufe);
  laufNr += 1;
  return { id: `${t}-${laufNr}`, thema, typ: t, stufe, ...a };
}

/* ---------- Prüfen ---------- */
const lies = (s) => qLies(String(s ?? "").replace(/\s/g, "").replace(/[−–]/g, "-"));
const gleichMenge = (a, b) => {
  if (a.length !== b.length) return false;
  const rest = [...b];
  return a.every((x) => { const i = rest.findIndex((y) => y && x && qGleich(x, y)); if (i < 0) return false; rest.splice(i, 1); return true; });
};

/* Liefert { ok, text, leer, fehlerart } */
export function pruefeTeil(teil, eingabe) {
  if (teil.art === "wahl") {
    if (eingabe == null) return { ok: false, leer: true, text: "" };
    if (String(eingabe) === String(teil.richtig)) return { ok: true, text: "" };
    const t = (teil.fehler && teil.fehler[eingabe]) || zw("Noch nicht – schau dir die Merkmale noch einmal an.", "Not yet – look at the features again.");
    return { ok: false, text: t, fehlerart: `wahl-${eingabe}` };
  }
  if (teil.art === "regler") {
    const z = teil.ziel, e = eingabe || {};
    const ok = teil.params.every((k) => Math.abs((e[k] ?? NaN) - z[k]) < 1e-9);
    if (ok) return { ok: true, text: "" };
    const falsch = teil.params.filter((k) => Math.abs((e[k] ?? NaN) - z[k]) > 1e-9);
    return { ok: false, text: zw(`Noch nicht deckungsgleich – ${falsch.length === 1 ? `ein Wert passt nicht` : `${falsch.length} Werte passen nicht`}.`, `Not on top yet – ${falsch.length === 1 ? "one value is off" : `${falsch.length} values are off`}.`) };
  }
  const werte = (eingabe || []).map(lies);
  if (werte.some((w) => w === null)) {
    const leer = (eingabe || []).some((s) => !String(s ?? "").trim());
    return { ok: false, leer, text: leer ? zw("Bitte alle Felder ausfüllen.", "Please fill in all fields.") : zw("Das kann ich nicht lesen – schreib z. B. −3, 1/2 oder 0,5.", "I can't read that – write e.g. −3, 1/2 or 0.5.") };
  }
  const soll = teil.felder.map((f) => f.wert);
  const passt = (a, b) => (teil.ungeordnet ? gleichMenge(a, b) : a.every((x, i) => qGleich(x, b[i])));
  if (passt(werte, soll)) return { ok: true, text: "" };
  for (const f of teil.fehler || []) {
    const fw = f.werte || [f.wert];
    if (fw.length === werte.length && fw.every(Boolean) && passt(werte, fw)) return { ok: false, text: f.text, fehlerart: "denkfehler" };
  }
  if (soll.length > 1 && !teil.ungeordnet) {
    const richtig = werte.filter((w, i) => qGleich(w, soll[i])).length;
    if (richtig) return { ok: false, text: zw(`${richtig} von ${soll.length} Werten stimmen schon.`, `${richtig} of ${soll.length} values are already right.`) };
  }
  if (teil.ungeordnet && soll.length > 1) {
    const treffer = werte.filter((w) => soll.some((s) => qGleich(s, w))).length;
    if (treffer) return { ok: false, text: zw("Eine Nullstelle stimmt schon – prüf die andere.", "One root is right – check the other.") };
  }
  return { ok: false, text: zw("Noch nicht richtig. Tipp unten auf „Ich hänge fest“, wenn du einen Hinweis brauchst.", "Not right yet. Tap “I'm stuck” below if you need a hint.") };
}

/* Lösung eines Teils als Text für die Felder */
export function loesungText(teil) {
  if (teil.art === "zahl") return teil.felder.map((f) => (f.wert.n === 1 ? String(f.wert.z) : `${f.wert.z}/${f.wert.n}`).replace("-", "−"));
  if (teil.art === "wahl") return teil.richtig;
  return teil.ziel;
}

/* Regler: Funktionswert für die Live-Kurve */
export const reglerKurve = (form, w) => (form === "scheitel"
  ? { a: w.a, b: -2 * w.a * w.d, c: w.a * w.d * w.d + w.e }
  : { a: w.a, b: w.b, c: w.c });

/* Regler-Formel als TeX */
export function reglerTex(form, w) {
  const z = (v) => { const r = Math.round(v * 2); return r % 2 ? q(r, 2) : q(r / 2); };
  if (form === "scheitel") return `f(x) = ${qNull(z(w.a)) ? "0" : scheitelTex(z(w.a), z(w.d), z(w.e))}`;
  if (qNull(z(w.a))) return "f(x) = \\;?";
  return `f(x) = ${normalTex(parabel(z(w.a), z(w.b), z(w.c)))}`;
}
