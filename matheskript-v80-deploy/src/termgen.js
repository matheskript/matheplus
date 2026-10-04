/* ======================================================================
   termgen.js – Aufgabengeneratoren für „Terme und Potenzgesetze“.
   Rein, ohne React. Jede Aufgabe liefert:
     art, tex (Aufgabe), ref(x) (Referenzwert), pruef (Art der Formprüfung),
     loesung [TeX-Zeilen], hinweise [Texte], vor [Vorschritte],
     bei Brüchen: ausschluss (verbotene x-Werte).
   ====================================================================== */
import { ggT, mischen, pAdd, pMul, pNum, pSkal, pTex, pVonZahlen, q, wahl, zz, zzOhne0 } from "./rechnen2.js";

const sg = (b) => (b < 0 ? `− ${-b}` : `+ ${b}`);               // "+ 3", "− 3"
const lin = (a, b) => `${a === 1 ? "" : a === -1 ? "−" : a}x ${sg(b)}`;   // "2x + 5"
const klammer = (a, b) => `(${lin(a, b)})`;
export const zweitext = (n) => String(n).replace(/-/g, "−");
let zaehler = 0;
const neuId = () => ++zaehler;
const P = (...k) => pVonZahlen(k);

/* ---------- Terme vereinfachen ---------- */
function neuTerme_() {
  const t = wahl([1, 2, 3, 4]);
  let tex, poly, schritte, hinweise;
  if (t === 1) {
    const a = zz(2, 5), b = zz(1, 6), c = zzOhne0(-5, 5), d = zz(1, 6);
    const ca = Math.abs(c), cs = c < 0 ? "−" : "+";
    tex = `${a}(x + ${b}) ${cs} ${ca === 1 ? "" : ca}(x − ${d})`;
    poly = pAdd(P(a * b, a), P(-c * d, c));
    schritte = [tex, `${a}x + ${a * b} ${cs} ${ca === 1 ? "" : ca}x ${c < 0 ? "+" : "−"} ${ca * d}`, pTex(poly)];
  } else if (t === 2) {
    const a = zz(1, 6), b = zz(1, 6), c = zz(1, 6);
    tex = `(x + ${a})(x + ${b}) − x(x + ${c})`;
    poly = pAdd(pMul(P(a, 1), P(b, 1)), pSkal(pMul(P(0, 1), P(c, 1)), q(-1)));
    schritte = [tex, `x² + ${a + b}x + ${a * b} − x² − ${c}x`, pTex(poly)];
  } else if (t === 3) {
    const a = zz(2, 6), b = zzOhne0(-6, 6), c = zz(1, 5), d = zzOhne0(-6, 6), e = zzOhne0(-9, 9);
    tex = `${a}x² ${sg(b).replace(/(\d+)/, "$1")}x − (${c}x² ${sg(d)}x) ${sg(e)}`;
    poly = pAdd(P(e, b - d, a - c), P(0));
    schritte = [tex, `${a}x² ${sg(b)}x − ${c}x² ${d < 0 ? "+" : "−"} ${Math.abs(d)}x ${sg(e)}`, pTex(poly)];
  } else {
    const a = zz(1, 6), b = zz(2, 7);
    tex = `(x + ${a})² − (x − ${b})(x + ${b})`;
    poly = pAdd(pMul(P(a, 1), P(a, 1)), pSkal(pMul(P(-b, 1), P(b, 1)), q(-1)));
    schritte = [tex, `x² + ${2 * a}x + ${a * a} − (x² − ${b * b})`, `x² + ${2 * a}x + ${a * a} − x² + ${b * b}`, pTex(poly)];
  }
  hinweise = [
    "Löse zuerst die Klammern auf (Distributivgesetz).",
    "Jeden Summanden in der Klammer mit dem Faktor davor multiplizieren. Ein Minus vor der Klammer dreht alle Vorzeichen um.",
    "Fasse dann gleichartige Terme zusammen: x²-Terme, x-Terme und Zahlen jeweils für sich.",
  ];
  const n = poly.filter((c) => c.z !== 0).length;
  return { id: neuId(), art: "terme", tex, ref: (x) => pNum(poly, x), pruef: "vereinfacht", terme: n, loesung: schritte, hinweise, zielTex: pTex(poly) };
}

/* ---------- Ausklammern ---------- */
function neuAusklammern_() {
  const dreiTerme = Math.random() < 0.3;
  const c = zz(2, 6);
  let k, Q;
  for (;;) {
    if (dreiTerme) { k = 1; Q = [zzOhne0(-5, 5), zzOhne0(-5, 5), zz(1, 3)]; }
    else { k = zz(1, 2); Q = [zzOhne0(-6, 6), zz(1, 3)]; }
    if (Q.reduce((g, v) => ggT(g, v), 0) === 1) break;
  }
  const Qp = pVonZahlen(Q);
  const xk = pVonZahlen([...Array(k).fill(0), c]);
  const poly = pMul(xk, Qp);
  const F = `${c}${k === 1 ? "x" : "x²"}`;
  return {
    id: neuId(), art: "ausklammern", tex: pTex(poly), ref: (x) => pNum(poly, x), pruef: "ausgeklammert", faktor: (x) => c * x ** k,
    loesung: [pTex(poly), `${F} · (${pTex(Qp)})`],
    hinweise: [
      "Suche den größten Zahlenfaktor, der in allen Koeffizienten steckt.",
      "Welche Potenz von x steckt in jedem Summanden? Die kleinste vorkommende Potenz wird ausgeklammert.",
      "Schreibe Faktor · (Rest). Probe: Multipliziere wieder aus – du musst den Ausgangsterm erhalten.",
    ],
    zielTex: `${F}(${pTex(Qp)})`,
  };
}

/* ---------- Binomische Formeln ---------- */
const FORMELN = [["p", "(a + b)² = a² + 2ab + b²"], ["m", "(a − b)² = a² − 2ab + b²"], ["d", "(a + b)(a − b) = a² − b²"]];
function neuBinomisch_(richtung) {
  const art = wahl(["p", "m", "d"]);
  const a = zz(1, 4), b = zz(1, 6);
  const vor = a === 1 ? "" : String(a);
  const bin = (s) => `${vor}x ${s} ${b}`;
  let faktorTex, polyTex, poly, ref;
  if (art === "p") { faktorTex = `(${bin("+")})²`; poly = P(b * b, 2 * a * b, a * a); }
  else if (art === "m") { faktorTex = `(${bin("−")})²`; poly = P(b * b, -2 * a * b, a * a); }
  else { faktorTex = `(${bin("+")})(${bin("−")})`; poly = P(-b * b, 0, a * a); }
  polyTex = pTex(poly);
  ref = (x) => pNum(poly, x);
  const optionen = FORMELN.map(([id, t]) => [id, t]);
  const ausm = richtung === "ausmultiplizieren";
  return {
    id: neuId(), art: "binomisch", richtung, formel: art, tex: ausm ? faktorTex : polyTex, ref, pruef: ausm ? "ausmultipliziert" : "faktorisiert", terme: poly.filter((c) => c.z !== 0).length,
    vor: [{ typ: "wahl", titel: "Formel erkennen", frage: "Welche binomische Formel passt?", optionen, richtig: art,
      hinweise: ausm ? ["Schau auf die Klammer: Steht in beiden Klammern dasselbe Vorzeichen, oder sind sie verschieden?", "Zweimal dieselbe Klammer mit Plus: erste Formel; mit Minus: zweite; Plus und Minus gemischt: dritte."]
        : ["Zähle die Summanden und prüfe die Vorzeichen: Gibt es einen Mittelterm?", "Kein Mittelterm und ein Minus: dritte Formel. Mittelterm mit Plus: erste, mit Minus: zweite."],
      erklaerung: FORMELN.find((f) => f[0] === art)[1] }],
    loesung: ausm
      ? [faktorTex, art === "d" ? `(${a === 1 ? "" : a}x)² − ${b}²` : `(${a === 1 ? "" : a}x)² ${art === "p" ? "+" : "−"} 2 · ${a === 1 ? "" : a + " · "}x · ${b} + ${b}²`, polyTex]
      : [polyTex, art === "d" ? `(${a === 1 ? "" : a}x)² − ${b}²` : `(${a === 1 ? "" : a}x)² ${art === "p" ? "+" : "−"} 2 · ${a === 1 ? "" : a + " · "}x · ${b} + ${b}²`, faktorTex],
    hinweise: ausm
      ? ["Setze in die passende Formel ein: Was ist a, was ist b?", "Quadriere beide Glieder und vergiss den Mittelterm 2ab nicht (außer bei der dritten Formel).", "Fasse zusammen und ordne nach Potenzen von x."]
      : ["Suche a² und b²: Welche Terme sind Quadrate?", "Der Mittelterm muss 2ab sein – prüfe das, sonst passt keine Formel.", "Schreibe das Ergebnis als Produkt zweier Klammern oder als Quadrat einer Klammer."],
    zielTex: ausm ? polyTex : faktorTex,
  };
}

/* ---------- Potenzgesetze ---------- */
const GESETZE = [
  ["mal", "Gleiche Basis multiplizieren: Exponenten addieren"],
  ["geteilt", "Gleiche Basis dividieren: Exponenten subtrahieren"],
  ["potpot", "Potenz potenzieren: Exponenten multiplizieren"],
  ["produkt", "Potenz eines Produkts: jeden Faktor potenzieren"],
  ["negativ", "Negativer Exponent: Kehrwert bilden"],
];
function neuPotenz_() {
  const t = wahl(["mal", "geteilt", "potpot", "produkt", "negativ", "kombi"]);
  let tex, ref, gesetz, loesung, hinweise, ziel, pruef = "potenz", negativ = false;
  if (t === "mal") { const m = zz(2, 6), n = zz(2, 6); tex = `x^{${m}} \\cdot x^{${n}}`; ref = (x) => x ** (m + n); gesetz = "mal"; ziel = `x^{${m + n}}`; loesung = [tex, `x^{${m} + ${n}}`, ziel]; }
  else if (t === "geteilt") {
    const n = zz(2, 4), m = n + zz(1, 5), c = wahl([1, 1, 2, 3]), d = c === 1 ? 1 : wahl([1, c]);
    tex = `\\frac{${c === 1 ? "" : c}x^{${m}}}{${d === 1 ? "" : d}x^{${n}}}`; ref = (x) => (c / d) * x ** (m - n); gesetz = "geteilt";
    ziel = `${c / d === 1 ? "" : c / d}x^{${m - n}}`; loesung = [tex, `${c === d ? "" : `${c / d} \\cdot `}x^{${m} - ${n}}`, ziel];
  } else if (t === "potpot") { const m = zz(2, 4), n = zz(2, 4); tex = `\\left(x^{${m}}\\right)^{${n}}`; ref = (x) => x ** (m * n); gesetz = "potpot"; ziel = `x^{${m * n}}`; loesung = [tex, `x^{${m} \\cdot ${n}}`, ziel]; }
  else if (t === "produkt") { const c = zz(2, 3), n = zz(2, 4); tex = `(${c}x)^{${n}}`; ref = (x) => c ** n * x ** n; gesetz = "produkt"; ziel = `${c ** n}x^{${n}}`; loesung = [tex, `${c}^{${n}} \\cdot x^{${n}}`, ziel]; }
  else if (t === "negativ") { const n = zz(2, 5); tex = `x^{-${n}}`; ref = (x) => x ** -n; gesetz = "negativ"; ziel = `\\frac{1}{x^{${n}}}`; loesung = [tex, `\\frac{1}{x^{${n}}}`]; pruef = "potenzNeg"; negativ = true; }
  else { const c = zz(1, 4), a = zz(2, 5), b = zz(2, 5); const m = a + b + c; tex = `\\frac{x^{${a}} \\cdot x^{${b}}}{x^{${c}}}`; ref = (x) => x ** (a + b - c); gesetz = "mal"; ziel = `x^{${a + b - c}}`; loesung = [tex, `\\frac{x^{${a + b}}}{x^{${c}}}`, ziel]; void m; }
  hinweise = {
    mal: ["Wie hängen die Basen zusammen?", "Bei gleicher Basis und Mal gilt: aᵐ · aⁿ = aᵐ⁺ⁿ.", "Addiere die Exponenten; die Basis bleibt."],
    geteilt: ["Zähler und Nenner haben dieselbe Basis x.", "Bei Division gilt: aᵐ : aⁿ = aᵐ⁻ⁿ. Zahlen vor dem x kürzt du separat.", "Subtrahiere die Exponenten: Zähler minus Nenner."],
    potpot: ["Eine Potenz wird noch einmal potenziert.", "Es gilt (aᵐ)ⁿ = aᵐ·ⁿ.", "Multipliziere die beiden Exponenten."],
    produkt: ["Die Klammer enthält ein Produkt aus Zahl und x.", "Es gilt (a · b)ⁿ = aⁿ · bⁿ – jeder Faktor wird potenziert, auch die Zahl.", "Rechne die Zahlenpotenz aus und schreibe das Ergebnis als c · xⁿ."],
    negativ: ["Ein negativer Exponent ist kein negatives Ergebnis.", "Es gilt a⁻ⁿ = 1 / aⁿ.", "Schreibe x⁻ⁿ als Bruch mit x im Nenner."],
  }[t === "kombi" ? "mal" : t];
  return { id: neuId(), art: "potenz", unterart: t, tex, ref, pruef, positiv: true, negativ, loesung, hinweise, zielTex: ziel,
    vor: [{ typ: "wahl", titel: "Gesetz wählen", frage: "Welches Potenzgesetz brauchst du (zuerst)?", optionen: GESETZE, richtig: gesetz, hinweise: ["Schau auf Zeichen und Basen: mal, geteilt, Klammer mit Exponent, negativer Exponent?"], erklaerung: GESETZE.find((g) => g[0] === gesetz)[1] }] };
}

/* ---------- Bruchterme ---------- */
function neuBruch_() {
  const t = wahl(["A", "A", "B", "C", "D"]);
  const a = zz(2, 9);
  let tex, ausschluss, ziel, ref, pruef, loesung, hinweise, ausgangsNenner;
  if (t === "A") {
    const s = wahl([1, -1]);                                  // Nenner x + s·a
    tex = `\\frac{x^{2} − ${a * a}}{x ${s === 1 ? "+" : "−"} ${a}}`; ausschluss = [-s * a];
    ref = (x) => x - s * a; ziel = `x ${s === 1 ? "−" : "+"} ${a}`; pruef = "bruchPoly";
    loesung = [tex, `\\frac{(x + ${a})(x − ${a})}{x ${s === 1 ? "+" : "−"} ${a}}`, ziel];
  } else if (t === "B") {
    const c = zz(2, 5), b = zzOhne0(-6, 6);
    tex = `\\frac{${c}x^{2} ${sg(c * b)}x}{${c}x}`; ausschluss = [0]; ref = (x) => x + b; ziel = `x ${sg(b)}`; pruef = "bruchPoly";
    loesung = [tex, `\\frac{${c}x(x ${sg(b)})}{${c}x}`, ziel];
  } else if (t === "C") {
    tex = `\\frac{x^{2} + ${2 * a}x + ${a * a}}{x + ${a}}`; ausschluss = [-a]; ref = (x) => x + a; ziel = `x + ${a}`; pruef = "bruchPoly";
    loesung = [tex, `\\frac{(x + ${a})^{2}}{x + ${a}}`, ziel];
  } else {
    tex = `\\frac{x^{2} − ${a}x}{x^{2} − ${a * a}}`; ausschluss = [-a, a].sort((u, v) => u - v); ref = (x) => x / (x + a); ziel = `\\frac{x}{x + ${a}}`; pruef = "bruchBruch";
    loesung = [tex, `\\frac{x(x − ${a})}{(x + ${a})(x − ${a})}`, ziel];
  }
  ausgangsNenner = ausschluss;
  hinweise = [
    "Faktorisiere Zähler und Nenner: ausklammern oder binomische Formel.",
    "Gekürzt wird nur, was als Faktor in Zähler und Nenner steht – nie einzelne Summanden.",
    "Nach dem Kürzen gilt der Term nur für die erlaubten x-Werte.",
  ];
  return {
    id: neuId(), art: "bruch", unterart: t, tex, ref, pruef, ausschluss, loesung, hinweise, zielTex: ziel, terme: 1,
    vor: [
      { typ: "liste", titel: "Definitionsmenge", frage: "Für welche x ist der Nenner null? Gib die verbotenen Werte an (mehrere mit Semikolon trennen).", ausschluss,
        hinweise: ["Setze den Nenner gleich 0.", "Bei Produkten im Nenner genügt es, wenn ein Faktor null wird."], erklaerung: `x ≠ ${ausschluss.map(zweitext).join("; ")}` },
      { typ: "wahl", titel: "Methode", frage: "Wie gehst du vor?",
        optionen: mischen([["r", "Zähler und Nenner faktorisieren, dann gemeinsamen Faktor kürzen"], ["f1", "Summanden einzeln kürzen (z. B. x² mit x)"], ["f2", "Alle x streichen"]]), richtig: "r",
        hinweise: ["Kürzen darf man nur Faktoren, keine Summanden.", "Faktorisiere erst – dann sieht man den gemeinsamen Faktor."], erklaerung: "Erst faktorisieren, dann gemeinsame Faktoren kürzen." },
    ],
  };
}
export { FORMELN, GESETZE };

/* Ausgabe vereinheitlichen: Unicode-Hochzahlen und Malpunkt als TeX */
const T = (t) => String(t).replace(/\(x\)/g, "x").replace(/²/g, "^{2}").replace(/³/g, "^{3}").replace(/ · /g, " \\cdot ").replace(/(^|[^\d.])1x/g, "$1x");
const tidy = (a) => ({ ...a, tex: T(a.tex), zielTex: T(a.zielTex), loesung: a.loesung.map(T) });
export const neuTerme = () => tidy(neuTerme_());
export const neuAusklammern = () => tidy(neuAusklammern_());
export const neuBinomisch = (r) => tidy(neuBinomisch_(r));
export const neuPotenz = () => tidy(neuPotenz_());
export const neuBruch = () => tidy(neuBruch_());
