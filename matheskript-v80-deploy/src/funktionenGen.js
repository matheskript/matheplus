/* ======================================================================
   funktionenGen.js – Aufgaben für „Funktionen: Grundlagen“ (Analysis · Kennen)
   Kapitel: Funktionsbegriff · Potenzfunktionen · Wurzelfunktionen ·
   Umkehrfunktion · Verkettung · Definitions- und Wertebereich (eigenes Training).
   Datenformat wie ungleichGen.js ({ art, text, schritte, pruef }).
   Jede Funktion trägt ihre Rechenvorschrift f, damit der Test Definitions-
   und Wertebereich, Umkehrfunktion und Verkettung numerisch nachprüft.
   Kein React, Node-testbar (tests/funktionenGen.test.mjs).
   ====================================================================== */
import { R, enthaelt, ganz, ganzOhne0, iv, linTex, mengeTex, mengenOptionen, ohne, ver, wahlAus, zKl, zTex } from "./mengenRechnen.js";

const T = (de, en) => [de, en];
const zahl = (id, titel, frage, text, wert, o = {}) => ({ typ: "zahl", id, titel, frage, text, wert, ...o, fehler: (o.fehler || []).filter((f) => Math.abs(f.wert - wert) > 1e-9) });
const wahl = (id, titel, frage, optionen, richtig, o = {}) => ({ typ: "wahl", id, titel, frage, optionen, richtig, ...o,
  fehler: (o.fehler || []).filter((f) => f.wahl !== richtig && optionen.some((op) => op[0] === f.wahl)) });
const dreh = (l, k) => { const n = l.length; const s = ((k % n) + n) % n; return [...l.slice(s), ...l.slice(0, s)]; };
const plusZahl = (c) => (c === 0 ? "" : c > 0 ? ` + ${zTex(c)}` : ` − ${zTex(-c)}`);
const vorFaktor = (a) => (a === 1 ? "" : a === -1 ? "−" : zTex(a));
const RECHTS = (g, zu) => iv(g, Infinity, zu, false);
const LINKS = (g, zu) => iv(-Infinity, g, false, zu);

/* ======================================================================
   Funktionsfamilien mit Definitions- und Wertebereich
   ====================================================================== */
export const FAMILIEN = {
  /* √(ax + b) + c */
  wurzel: (z) => {
    const a = wahlAus([1, 1, 2, 3, -1, -2], z), g = ganz(-6, 6, z), c = z() < 0.4 ? ganzOhne0(-4, 4, z) : 0;
    const b = -a * g;
    return { art: "wurzel", tex: `\\sqrt{${linTex(a, b)}}${plusZahl(c)}`, f: (x) => Math.sqrt(a * x + b) + c,
      D: a > 0 ? RECHTS(g, true) : LINKS(g, true), W: RECHTS(c, true), krit: g, wkrit: c,
      dHinweis: T(`Unter der Wurzel darf nichts Negatives stehen: $${linTex(a, b)} \\ge 0$.`, `Nothing negative under the root: $${linTex(a, b)} \\ge 0$.`),
      dErkl: T(`$${linTex(a, b)} \\ge 0 \\Leftrightarrow x ${a > 0 ? "\\ge" : "\\le"} ${zTex(g)}$${a < 0 ? " (Zeichen dreht beim Teilen durch " + zTex(a) + ")" : ""}`, `$${linTex(a, b)} \\ge 0 \\Leftrightarrow x ${a > 0 ? "\\ge" : "\\le"} ${zTex(g)}$${a < 0 ? " (sign flips when dividing by " + zTex(a) + ")" : ""}`),
      wHinweis: T("Eine Wurzel liefert alle Werte ≥ 0 – danach wird um c verschoben.", "A square root gives all values ≥ 0 – then it is shifted by c."),
      wErkl: T(`$\\sqrt{\\ldots} \\ge 0 \\Rightarrow f(x) \\ge ${zTex(c)}$`, `$\\sqrt{\\ldots} \\ge 0 \\Rightarrow f(x) \\ge ${zTex(c)}$`) };
  },
  /* c/(x − g) + d */
  bruch: (z) => {
    const c = ganzOhne0(-6, 6, z), g = ganz(-6, 6, z), d = z() < 0.5 ? ganzOhne0(-4, 4, z) : 0;
    const nenner = g === 0 ? "x" : linTex(1, -g);
    return { art: "bruch", tex: `\\frac{${zTex(Math.abs(c))}}{${nenner}}${plusZahl(d)}`.replace(/^/, c < 0 ? "−" : ""), f: (x) => c / (x - g) + d,
      D: ohne(g), W: ohne(d), krit: g, wkrit: d,
      dHinweis: T("Durch 0 darf man nicht teilen: Wann ist der Nenner 0?", "You can't divide by 0: when is the denominator 0?"),
      dErkl: T(`$${nenner} = 0 \\Leftrightarrow x = ${zTex(g)}$`, `$${nenner} = 0 \\Leftrightarrow x = ${zTex(g)}$`),
      wHinweis: T(`Der Bruch $\\frac{${zTex(Math.abs(c))}}{\\ldots}$ wird nie 0 – also wird $${zTex(d)}$ nie erreicht.`, `The fraction $\\frac{${zTex(Math.abs(c))}}{\\ldots}$ is never 0 – so $${zTex(d)}$ is never reached.`),
      wErkl: T(`Waagerechte Asymptote $y = ${zTex(d)}$: $W = \\mathbb{R} \\setminus \\{${zTex(d)}\\}$`, `Horizontal asymptote $y = ${zTex(d)}$: $W = \\mathbb{R} \\setminus \\{${zTex(d)}\\}$`) };
  },
  /* 1/(x² − r²) */
  bruch2: (z) => {
    const r = ganz(1, 6, z);
    return { art: "bruch2", tex: `\\frac{1}{x^2 − ${r * r}}`, f: (x) => 1 / (x * x - r * r), D: ohne(-r, r), krit: r,
      dHinweis: T(`Nenner gleich 0 setzen: $x^2 = ${r * r}$ hat zwei Lösungen.`, `Set the denominator to 0: $x^2 = ${r * r}$ has two solutions.`),
      dErkl: T(`$x^2 − ${r * r} = 0 \\Leftrightarrow x = \\pm ${r}$`, `$x^2 − ${r * r} = 0 \\Leftrightarrow x = \\pm ${r}$`) };
  },
  /* ln(ax + b) */
  ln: (z) => {
    const a = wahlAus([1, 2, -1, 3], z), g = ganz(-5, 5, z), b = -a * g;
    return { art: "ln", tex: `\\ln(${linTex(a, b)})`, f: (x) => Math.log(a * x + b), D: a > 0 ? RECHTS(g, false) : LINKS(g, false), W: R(), krit: g,
      dHinweis: T(`Der Logarithmus braucht ein positives Argument: $${linTex(a, b)} > 0$ (echt größer!).`, `The logarithm needs a positive argument: $${linTex(a, b)} > 0$ (strictly!).`),
      dErkl: T(`$${linTex(a, b)} > 0 \\Leftrightarrow x ${a > 0 ? ">" : "<"} ${zTex(g)}$`, `$${linTex(a, b)} > 0 \\Leftrightarrow x ${a > 0 ? ">" : "<"} ${zTex(g)}$`),
      wHinweis: T("ln nimmt jeden reellen Wert an.", "ln takes every real value."), wErkl: T("$W = \\mathbb{R}$", "$W = \\mathbb{R}$") };
  },
  /* 1/√(x − g) */
  wurzelbruch: (z) => {
    const g = ganz(-6, 6, z);
    const innen = g === 0 ? "x" : linTex(1, -g);
    return { art: "wurzelbruch", tex: `\\frac{1}{\\sqrt{${innen}}}`, f: (x) => 1 / Math.sqrt(x - g), D: RECHTS(g, false), W: RECHTS(0, false), krit: g, wkrit: 0,
      dHinweis: T("Zwei Bedingungen: Unter der Wurzel ≥ 0 und Nenner ≠ 0 – zusammen: unter der Wurzel > 0.", "Two conditions: under the root ≥ 0 and denominator ≠ 0 – together: under the root > 0."),
      dErkl: T(`$${innen} > 0 \\Leftrightarrow x > ${zTex(g)}$`, `$${innen} > 0 \\Leftrightarrow x > ${zTex(g)}$`),
      wHinweis: T("1 geteilt durch eine positive Zahl ist positiv – und kann beliebig klein werden.", "1 divided by a positive number is positive – and can get arbitrarily small."),
      wErkl: T("$W = ]0; \\infty[$", "$W = ]0; \\infty[$") };
  },
  /* √(r² − x²) */
  kreis: (z) => {
    const r = ganz(1, 6, z);
    return { art: "kreis", tex: `\\sqrt{${r * r} − x^2}`, f: (x) => Math.sqrt(r * r - x * x), D: iv(-r, r, true, true), W: iv(0, r, true, true), krit: r, wkrit: r,
      dHinweis: T(`$${r * r} − x^2 \\ge 0 \\Leftrightarrow x^2 \\le ${r * r}$`, `$${r * r} − x^2 \\ge 0 \\Leftrightarrow x^2 \\le ${r * r}$`),
      dErkl: T(`$−${r} \\le x \\le ${r}$ – der Graph ist ein Halbkreis mit Radius ${r}.`, `$−${r} \\le x \\le ${r}$ – the graph is a semicircle of radius ${r}.`),
      wHinweis: T("Größter Wert bei x = 0, kleinster am Rand.", "Largest value at x = 0, smallest at the ends."), wErkl: T(`$W = [0; ${r}]$`, `$W = [0; ${r}]$`) };
  },
  /* a(x − d)² + e */
  quadrat: (z) => {
    const a = wahlAus([1, 2, -1, -2, 3], z), d = ganz(-5, 5, z), e = ganz(-6, 6, z);
    const kern = d === 0 ? "x^2" : `(${linTex(1, -d)})^2`;
    return { art: "quadrat", tex: `${vorFaktor(a)}${kern}${plusZahl(e)}`, f: (x) => a * (x - d) ** 2 + e, D: R(), W: a > 0 ? RECHTS(e, true) : LINKS(e, true), wkrit: e,
      wHinweis: T(`Scheitelform: Scheitel $S(${zTex(d)} \\mid ${zTex(e)})$, Öffnung nach ${a > 0 ? "oben" : "unten"}.`, `Vertex form: vertex $S(${zTex(d)} \\mid ${zTex(e)})$, opening ${a > 0 ? "up" : "down"}.`),
      wErkl: T(`$W = ${mengeTex(a > 0 ? RECHTS(e, true) : LINKS(e, true))}$ – der Scheitel ist der ${a > 0 ? "tiefste" : "höchste"} Punkt.`, `$W = ${mengeTex(a > 0 ? RECHTS(e, true) : LINKS(e, true))}$ – the vertex is the ${a > 0 ? "lowest" : "highest"} point.`) };
  },
  /* a·eˣ + c */
  exp: (z) => {
    const a = wahlAus([1, 2, -1, 3], z), c = ganz(-5, 5, z);
    return { art: "exp", tex: `${vorFaktor(a)}e^x${plusZahl(c)}`, f: (x) => a * Math.exp(x) + c, D: R(), W: a > 0 ? RECHTS(c, false) : LINKS(c, false), wkrit: c,
      wHinweis: T("eˣ ist immer positiv, kommt der 0 aber beliebig nahe.", "eˣ is always positive but gets arbitrarily close to 0."),
      wErkl: T(`Asymptote $y = ${zTex(c)}$, nie erreicht: $W = ${mengeTex(a > 0 ? RECHTS(c, false) : LINKS(c, false))}$`, `Asymptote $y = ${zTex(c)}$, never reached: $W = ${mengeTex(a > 0 ? RECHTS(c, false) : LINKS(c, false))}$`) };
  },
  /* a·sin(x) + d */
  sinus: (z) => {
    const a = wahlAus([1, 2, 3, -2], z), d = ganz(-4, 4, z);
    const A = Math.abs(a);
    return { art: "sinus", tex: `${vorFaktor(a)}\\sin(x)${plusZahl(d)}`, f: (x) => a * Math.sin(x) + d, D: R(), W: iv(d - A, d + A, true, true), wkrit: d - A,
      wHinweis: T(`sin(x) liegt zwischen −1 und 1. Mal ${zTex(a)}, dann ${d >= 0 ? "+" : "−"} ${Math.abs(d)}.`, `sin(x) is between −1 and 1. Times ${zTex(a)}, then ${d >= 0 ? "+" : "−"} ${Math.abs(d)}.`),
      wErkl: T(`$${zTex(d)} − ${A} \\le f(x) \\le ${zTex(d)} + ${A}$`, `$${zTex(d)} − ${A} \\le f(x) \\le ${zTex(d)} + ${A}$`) };
  },
  /* |x − d| + e */
  betrag: (z) => {
    const d = ganz(-5, 5, z), e = ganz(-5, 5, z);
    return { art: "betrag", tex: `|${d === 0 ? "x" : linTex(1, -d)}|${plusZahl(e)}`, f: (x) => Math.abs(x - d) + e, D: R(), W: RECHTS(e, true), wkrit: e,
      wHinweis: T("Ein Betrag ist mindestens 0 – und 0 wird bei x = d erreicht.", "An absolute value is at least 0 – reached at x = d."), wErkl: T(`$W = [${zTex(e)}; \\infty[$`, `$W = [${zTex(e)}; \\infty[$`) };
  },
  /* a/x² (negative Hochzahl) */
  potneg: (z) => {
    const a = wahlAus([1, 2, 3, -1], z), n = wahlAus([2, 4], z);
    return { art: "potneg", tex: `\\frac{${Math.abs(a)}}{x^${n}}`.replace(/^/, a < 0 ? "−" : ""), f: (x) => a / x ** n, D: ohne(0), W: a > 0 ? RECHTS(0, false) : LINKS(0, false), krit: 0, wkrit: 0,
      dHinweis: T("Der Nenner wird bei x = 0 null.", "The denominator is 0 at x = 0."), dErkl: T("$D = \\mathbb{R} \\setminus \\{0\\}$", "$D = \\mathbb{R} \\setminus \\{0\\}$"),
      wHinweis: T(`x^${n} ist für x ≠ 0 positiv; der Bruch hat also das Vorzeichen von ${a > 0 ? "+" : "−"}${Math.abs(a)} und wird nie 0.`, `x^${n} is positive for x ≠ 0; the fraction has the sign of ${a > 0 ? "+" : "−"}${Math.abs(a)} and is never 0.`),
      wErkl: T(`$W = ${mengeTex(a > 0 ? RECHTS(0, false) : LINKS(0, false))}$`, `$W = ${mengeTex(a > 0 ? RECHTS(0, false) : LINKS(0, false))}$`) };
  },
  /* √(x² − r²) */
  wurzelquad: (z) => {
    const r = ganz(1, 5, z);
    return { art: "wurzelquad", tex: `\\sqrt{x^2 − ${r * r}}`, f: (x) => Math.sqrt(x * x - r * r), D: ver(LINKS(-r, true), RECHTS(r, true)), W: RECHTS(0, true), krit: r, wkrit: 0,
      dHinweis: T(`$x^2 − ${r * r} \\ge 0 \\Leftrightarrow x^2 \\ge ${r * r}$ – das gilt weit links und weit rechts.`, `$x^2 − ${r * r} \\ge 0 \\Leftrightarrow x^2 \\ge ${r * r}$ – true far left and far right.`),
      dErkl: T(`$x \\le −${r}$ oder $x \\ge ${r}$`, `$x \\le −${r}$ or $x \\ge ${r}$`), wHinweis: T("Wurzel ≥ 0, und 0 wird bei x = ±r erreicht.", "Root ≥ 0, and 0 is reached at x = ±r."), wErkl: T("$W = [0; \\infty[$", "$W = [0; \\infty[$") };
  },
};
export const D_FAMILIEN = ["wurzel", "bruch", "bruch2", "ln", "wurzelbruch", "kreis", "potneg", "wurzelquad"];
export const W_FAMILIEN = ["wurzel", "bruch", "quadrat", "exp", "sinus", "betrag", "potneg", "kreis", "wurzelbruch", "wurzelquad"];

/* falsche Kandidaten für einen Definitions- oder Wertebereich */
function nachbarn(m) {
  if (m.art === "R") return [ohne(0), RECHTS(0, true)];
  if (m.art === "ohne") return m.pkt.length === 1 ? [R(), RECHTS(m.pkt[0], false), ohne(-m.pkt[0] || 1)] : [ohne(m.pkt[1]), iv(m.pkt[0], m.pkt[1], false, false), R()];
  if (m.art === "iv") {
    const l = [];
    if (isFinite(m.lo) && isFinite(m.hi)) l.push(iv(m.lo, m.hi, !m.loZu, !m.hiZu), RECHTS(m.lo, m.loZu), ver(LINKS(m.lo, !m.loZu), RECHTS(m.hi, !m.hiZu)));
    else if (isFinite(m.lo)) l.push(RECHTS(m.lo, !m.loZu), LINKS(m.lo, m.loZu), ohne(m.lo));
    else l.push(LINKS(m.hi, !m.hiZu), RECHTS(m.hi, m.hiZu), ohne(m.hi));
    return l;
  }
  if (m.art === "ver") return [iv(m.teile[0].hi, m.teile[1].lo, true, true), iv(m.teile[0].hi, m.teile[1].lo, false, false), ohne(m.teile[0].hi, m.teile[1].lo)];
  return [R()];
}
function bereichSchritt(id, was, m, k, hinweis, erkl) {
  const opt = dreh(mengenOptionen([m, ...nachbarn(m)]), k);
  return wahl(id, was === "D" ? T("Definitionsbereich", "Domain") : T("Wertebereich", "Range"), was === "D" ? T("Wie lautet der maximale Definitionsbereich D?", "What is the maximal domain D?") : T("Wie lautet der Wertebereich W?", "What is the range W?"), opt, mengeTex(m), {
    hinweis, erkl: [`${erkl[0]} – $${was} = ${mengeTex(m)}$`, `${erkl[1]} – $${was} = ${mengeTex(m)}$`] });
}

function dAufgabe(fam, z) {
  const F = FAMILIEN[fam](z);
  const k = ganz(0, 3, z);
  const kritFrage = fam === "bruch2" || fam === "wurzelquad" || fam === "kreis" ? T("Welche positive Zahl ist die kritische Stelle?", "Which positive number is the critical value?") : T("Welche Stelle ist kritisch (Grenze bzw. ausgeschlossene Stelle)?", "Which value is critical (bound or excluded value)?");
  return {
    art: "d", fam,
    text: T(`$f(x) = ${F.tex}$`, `$f(x) = ${F.tex}$`),
    schritte: [
      zahl("fd-1", T("Kritische Stelle", "Critical value"), kritFrage, "$x =$", F.krit, { hinweis: F.dHinweis, erkl: F.dErkl,
        fehler: F.krit !== 0 && !["bruch2", "wurzelquad", "kreis"].includes(fam) ? [{ wert: -F.krit, text: T("Vorzeichen prüfen: Setze die Zahl ein – wird der kritische Teil dann wirklich 0?", "Check the sign: substitute the number – does the critical part really become 0?") }] : [] }),
      bereichSchritt("fd-2", "D", F.D, k, T("Klammer: Gehört die Grenze dazu? Bei ≥ 0 (Wurzel) ja, bei > 0 (ln, Nenner) nein.", "Bracket: is the bound included? With ≥ 0 (root) yes, with > 0 (ln, denominator) no."), F.dErkl),
    ],
    pruef: { F, menge: F.D },
  };
}
function wAufgabe(fam, z) {
  const F = FAMILIEN[fam](z);
  const k = ganz(0, 3, z);
  return {
    art: "w", fam,
    text: T(`$f(x) = ${F.tex}$`, `$f(x) = ${F.tex}$`),
    schritte: [
      zahl("fw-1", T("Grenzwert des Wertebereichs", "Bound of the range"), fam === "sinus" ? T("Was ist der kleinste Funktionswert?", "What is the smallest function value?") : fam === "kreis" ? T("Was ist der größte Funktionswert?", "What is the largest function value?") : T("An welcher Zahl beginnt bzw. endet der Wertebereich (oder welche fehlt)?", "At which number does the range start or end (or which is missing)?"), "$y =$", F.wkrit, {
        hinweis: F.wHinweis, erkl: F.wErkl }),
      bereichSchritt("fw-2", "W", F.W, k, F.wHinweis, F.wErkl),
    ],
    pruef: { F, menge: F.W },
  };
}

/* ======================================================================
   KAPITEL 1 · FUNKTIONSBEGRIFF
   ====================================================================== */
export const FB_ARTEN = ["istfunktion", "wert", "urbild", "dbasis"];
export const ZUORDNUNGEN = [
  { t: T("Jeder Zahl x wird ihr Quadrat x² zugeordnet.", "Each number x is assigned its square x²."), ja: true, e: T("Zu jedem x gibt es genau ein x².", "For each x there is exactly one x².") },
  { t: T("Jeder positiven Zahl x werden die Zahlen zugeordnet, deren Quadrat x ist.", "Each positive number x is assigned the numbers whose square is x."), ja: false, e: T("Zu x = 4 gehören 2 und −2 – zwei Werte.", "x = 4 gets 2 and −2 – two values.") },
  { t: T("Jedem Schüler wird sein Geburtstag zugeordnet.", "Each student is assigned their birthday."), ja: true, e: T("Jeder hat genau einen Geburtstag – dass zwei Schüler denselben haben, ist erlaubt.", "Everyone has exactly one birthday – two students sharing one is allowed.") },
  { t: T("Jedem Schüler werden seine Geschwister zugeordnet.", "Each student is assigned their siblings."), ja: false, e: T("Manche haben mehrere oder keine Geschwister.", "Some have several siblings or none.") },
  { t: T("Die Punkte mit $x^2 + y^2 = 25$ (ein Kreis).", "The points with $x^2 + y^2 = 25$ (a circle)."), ja: false, e: T("Zu x = 3 gehören y = 4 und y = −4 – senkrechte Gerade schneidet zweimal.", "x = 3 gives y = 4 and y = −4 – a vertical line meets twice.") },
  { t: T("Wertetabelle: x = 1, 2, 3, 2 mit y = 5, 7, 9, 8.", "Table: x = 1, 2, 3, 2 with y = 5, 7, 9, 8."), ja: false, e: T("x = 2 hat zwei verschiedene y-Werte (7 und 8).", "x = 2 has two different y-values (7 and 8).") },
  { t: T("Wertetabelle: x = 1, 2, 3, 4 mit y = 5, 5, 5, 5.", "Table: x = 1, 2, 3, 4 with y = 5, 5, 5, 5."), ja: true, e: T("Jedes x hat genau ein y – gleiche y-Werte sind erlaubt (konstante Funktion).", "Each x has exactly one y – equal y-values are allowed (constant function).") },
  { t: T("Jeder Uhrzeit eines Tages wird die Temperatur in Konstanz zugeordnet.", "Each time of day is assigned the temperature in Konstanz."), ja: true, e: T("Zu jedem Zeitpunkt gibt es genau eine Temperatur.", "At each moment there is exactly one temperature.") },
  { t: T("Der Graph ist eine senkrechte Gerade $x = 2$.", "The graph is a vertical line $x = 2$."), ja: false, e: T("Zu x = 2 gehören unendlich viele y-Werte.", "x = 2 has infinitely many y-values.") },
];
function istfunktion(z) {
  const zz = wahlAus(ZUORDNUNGEN, z);
  return { art: "istfunktion", text: zz.t,
    schritte: [wahl("fb-i", T("Funktion?", "Function?"), T("Ist das eine Funktion (jedem x genau ein y)?", "Is this a function (exactly one y for each x)?"), [["ja", T("ja", "yes")], ["nein", T("nein", "no")]], zz.ja ? "ja" : "nein", {
      hinweis: T("Senkrechtentest: Schneidet jede senkrechte Gerade den Graphen höchstens einmal?", "Vertical line test: does every vertical line meet the graph at most once?"), erkl: zz.e })],
    pruef: { ja: zz.ja } };
}
function wert(z) {
  const a = ganzOhne0(-3, 3, z), b = ganz(-5, 5, z), c = ganz(-6, 6, z), x0 = ganzOhne0(-4, 4, z);
  const tex = `${a === 1 ? "" : a === -1 ? "−" : zTex(a)}x^2${b === 0 ? "" : b > 0 ? ` + ${b === 1 ? "" : b}x` : ` − ${b === -1 ? "" : -b}x`}${plusZahl(c)}`;
  const w = a * x0 * x0 + b * x0 + c;
  return { art: "wert", text: T(`$f(x) = ${tex}$`, `$f(x) = ${tex}$`),
    schritte: [zahl("fb-w", T("Funktionswert", "Function value"), T(`Berechne $f(${zTex(x0)})$.`, `Calculate $f(${zTex(x0)})$.`), `$f(${zTex(x0)}) =$`, w, {
      fehler: x0 < 0 ? [{ wert: -a * x0 * x0 + b * x0 + c, text: T(`$(${zTex(x0)})^2 = ${x0 * x0}$ – das Quadrat einer negativen Zahl ist positiv.`, `$(${zTex(x0)})^2 = ${x0 * x0}$ – the square of a negative number is positive.`) }] : [],
      hinweis: T(`Setze ${zKl(x0)} für jedes x ein – in Klammern!`, `Substitute ${zKl(x0)} for every x – in brackets!`), erkl: `$f(${zTex(x0)}) = ${zTex(w)}$` })],
    pruef: { f: (x) => a * x * x + b * x + c, x0, w } };
}
function urbild(z) {
  if (z() < 0.55) {
    const m = ganzOhne0(-4, 5, z), c = ganz(-8, 8, z), x0 = ganz(-6, 6, z);
    const y0 = m * x0 + c;
    return { art: "urbild", text: T(`$f(x) = ${linTex(m, c)}$`, `$f(x) = ${linTex(m, c)}$`),
      schritte: [zahl("fb-u", T("Urbild", "Pre-image"), T(`Für welches x ist $f(x) = ${zTex(y0)}$?`, `For which x is $f(x) = ${zTex(y0)}$?`), "$x =$", x0, {
        fehler: [{ wert: m * y0 + c, text: T("Das ist f(" + zTex(y0) + ") – gesucht ist umgekehrt das x, das " + zTex(y0) + " ergibt.", "That's f(" + zTex(y0) + ") – we want the x that gives " + zTex(y0) + ".") }],
        hinweis: T(`Löse $${linTex(m, c)} = ${zTex(y0)}$.`, `Solve $${linTex(m, c)} = ${zTex(y0)}$.`), erkl: `$x = ${zTex(x0)}$` })],
      pruef: { f: (x) => m * x + c, y0, loes: [x0] } };
  }
  const k = ganz(1, 6, z), c = ganz(-5, 5, z);
  const y0 = k * k + c;
  return { art: "urbild", text: T(`$f(x) = ${c === 0 ? "x^2" : `x^2${plusZahl(c)}`}$`, `$f(x) = ${c === 0 ? "x^2" : `x^2${plusZahl(c)}`}$`),
    schritte: [
      wahl("fb-u1", T("Wie viele Urbilder?", "How many pre-images?"), T(`Wie viele x haben den Funktionswert $${zTex(y0)}$?`, `How many x have the value $${zTex(y0)}$?`), [["0", "0"], ["1", "1"], ["2", "2"]], "2", {
        hinweis: T("Eine Parabel wird von einer waagerechten Geraden oberhalb des Scheitels zweimal geschnitten.", "A horizontal line above the vertex meets a parabola twice."), erkl: T("zwei – symmetrisch zur y-Achse", "two – symmetric about the y-axis") }),
      zahl("fb-u2", T("Positives Urbild", "Positive pre-image"), T("Welches positive x?", "Which positive x?"), "$x =$", k, { hinweis: T(`$x^2 = ${zTex(y0 - c)}$`, `$x^2 = ${zTex(y0 - c)}$`), erkl: `$x = \\pm ${k}$` }),
    ],
    pruef: { f: (x) => x * x + c, y0, loes: [k, -k] } };
}

/* ======================================================================
   KAPITEL 2 · POTENZFUNKTIONEN
   ====================================================================== */
export const PO_ARTEN = ["symmetrie", "verhalten", "parameter", "potdw"];
const potTex = (a, n) => (n > 0 ? `${vorFaktor(a)}x^${n === 1 ? "" : n}`.replace(/\^$/, "") : `${a < 0 ? "−" : ""}\\frac{${zTex(Math.abs(a))}}{x${-n === 1 ? "" : `^${-n}`}}`);
function symmetrie(z) {
  const n = wahlAus([2, 3, 4, 5, -1, -2, -3], z), a = wahlAus([1, 2, -1, 3, -2], z);
  const gerade = n % 2 === 0;
  return { art: "symmetrie", text: T(`$f(x) = ${potTex(a, n)}$`, `$f(x) = ${potTex(a, n)}$`),
    schritte: [wahl("po-s", T("Symmetrie", "Symmetry"), T("Wie ist der Graph symmetrisch?", "How is the graph symmetric?"), [["y", T("zur y-Achse", "about the y-axis")], ["0", T("zum Ursprung", "about the origin")]], gerade ? "y" : "0", {
      fehler: [{ wahl: gerade ? "0" : "y", text: T("Entscheidend ist, ob die Hochzahl gerade oder ungerade ist – nicht das Vorzeichen von a.", "What matters is whether the exponent is even or odd – not the sign of a.") }],
      hinweis: T("Gerade Hochzahl: f(−x) = f(x). Ungerade Hochzahl: f(−x) = −f(x).", "Even exponent: f(−x) = f(x). Odd exponent: f(−x) = −f(x)."),
      erkl: gerade ? T(`Hochzahl ${n} gerade: $f(−x) = f(x)$ – achsensymmetrisch zur y-Achse.`, `Exponent ${n} even: $f(−x) = f(x)$ – symmetric about the y-axis.`) : T(`Hochzahl ${n} ungerade: $f(−x) = −f(x)$ – punktsymmetrisch zum Ursprung.`, `Exponent ${n} odd: $f(−x) = −f(x)$ – point-symmetric about the origin.`) })],
    pruef: { f: (x) => a * x ** n, gerade } };
}
function verhalten(z) {
  const n = wahlAus([2, 3, 4, 5], z), a = wahlAus([1, 2, -1, -3], z);
  const plus = a > 0 ? "p" : "m";
  const minus = (n % 2 === 0) === (a > 0) ? "p" : "m";
  const opt = [["pp", "$+\\infty$ | $+\\infty$"], ["pm", "$+\\infty$ | $−\\infty$"], ["mp", "$−\\infty$ | $+\\infty$"], ["mm", "$−\\infty$ | $−\\infty$"]];
  return { art: "verhalten", text: T(`$f(x) = ${potTex(a, n)}$. Wohin gehen die Funktionswerte für $x \\to +\\infty$ | $x \\to −\\infty$?`, `$f(x) = ${potTex(a, n)}$. Where do the values go for $x \\to +\\infty$ | $x \\to −\\infty$?`),
    schritte: [wahl("po-v", T("Verhalten im Unendlichen", "End behaviour"), T("Links: $x \\to +\\infty$, rechts: $x \\to −\\infty$.", "Left: $x \\to +\\infty$, right: $x \\to −\\infty$."), dreh(opt, ganz(0, 3, z)), plus + minus, {
      hinweis: T("Setz eine große Zahl ein (z. B. 10 und −10) und schau aufs Vorzeichen.", "Plug in a large number (e.g. 10 and −10) and look at the sign."),
      erkl: T(`$f(10) = ${zTex(a * 10 ** n)}$, $f(−10) = ${zTex(a * (-10) ** n)}$`, `$f(10) = ${zTex(a * 10 ** n)}$, $f(−10) = ${zTex(a * (-10) ** n)}$`) })],
    pruef: { f: (x) => a * x ** n, richtig: plus + minus } };
}
function parameter(z) {
  const n = wahlAus([2, 3, 4, -1, -2], z), a = ganzOhne0(-4, 4, z), k = wahlAus([2, -2, 3, 1], z);
  const y = a * k ** n;
  return { art: "parameter", text: T(`Der Graph von $f(x) = a \\cdot x^{${zTex(n)}}$ geht durch $P(${zTex(k)} \\mid ${zTex(y)})$.`, `The graph of $f(x) = a \\cdot x^{${zTex(n)}}$ passes through $P(${zTex(k)} \\mid ${zTex(y)})$.`),
    schritte: [zahl("po-p", T("Faktor a", "Factor a"), T("Bestimme a.", "Find a."), "$a =$", a, {
      hinweis: T(`Punktprobe: $${zTex(y)} = a \\cdot (${zTex(k)})^{${zTex(n)}}$`, `Point test: $${zTex(y)} = a \\cdot (${zTex(k)})^{${zTex(n)}}$`),
      erkl: `$(${zTex(k)})^{${zTex(n)}} = ${zTex(k ** n)} \\Rightarrow a = ${zTex(a)}$` })],
    pruef: { a, n, k, y } };
}
function potdw(z) {
  const n = wahlAus([2, 3, 4, -1, -2, -3], z), a = wahlAus([1, -1, 2], z);
  const D = n > 0 ? R() : ohne(0);
  let W;
  if (n > 0) W = n % 2 === 1 ? R() : a > 0 ? RECHTS(0, true) : LINKS(0, true);
  else W = n % 2 !== 0 ? ohne(0) : a > 0 ? RECHTS(0, false) : LINKS(0, false);
  return { art: "potdw", text: T(`$f(x) = ${potTex(a, n)}$`, `$f(x) = ${potTex(a, n)}$`),
    schritte: [
      wahl("po-d", T("Definitionsbereich", "Domain"), T("Maximaler Definitionsbereich?", "Maximal domain?"), mengenOptionen([R(), ohne(0), RECHTS(0, false)]), mengeTex(D), {
        hinweis: T("Negative Hochzahl heißt: x steht im Nenner.", "A negative exponent means x is in the denominator."), erkl: `$D = ${mengeTex(D)}$` }),
      wahl("po-w", T("Wertebereich", "Range"), T("Wertebereich?", "Range?"), dreh(mengenOptionen([W, R(), ohne(0), RECHTS(0, true), RECHTS(0, false), LINKS(0, true)]).slice(0, 5), ganz(0, 2, z)), mengeTex(W), {
        hinweis: T("Gerade Hochzahl: Vorzeichen von a entscheidet. Ungerade: alle Vorzeichen kommen vor.", "Even exponent: the sign of a decides. Odd: every sign occurs."), erkl: `$W = ${mengeTex(W)}$` }),
    ],
    pruef: { f: (x) => a * x ** n, D, W } };
}

/* ======================================================================
   KAPITEL 3 · WURZELFUNKTIONEN
   ====================================================================== */
export const WU_ARTEN = ["umschreiben", "wwert", "wgleichung", "wdw"];
export const WURZEL_FORMEN = [
  { p: 1, q: 2, w: "\\sqrt{x}" }, { p: 1, q: 3, w: "\\sqrt[3]{x}" }, { p: 3, q: 2, w: "\\sqrt{x^3}" }, { p: 2, q: 3, w: "\\sqrt[3]{x^2}" },
  { p: -1, q: 2, w: "\\frac{1}{\\sqrt{x}}" }, { p: 1, q: 4, w: "\\sqrt[4]{x}" }, { p: 3, q: 4, w: "\\sqrt[4]{x^3}" }, { p: 5, q: 2, w: "\\sqrt{x^5}" },
];
const hochBruch = (p, q) => `x^{${p < 0 ? "−" : ""}\\frac{${Math.abs(p)}}{${q}}}`;
function umschreiben(z) {
  const i = ganz(0, WURZEL_FORMEN.length - 1, z), F = WURZEL_FORMEN[i];
  const falsch = WURZEL_FORMEN.filter((x, j) => j !== i && !(x.p === F.p && x.q === F.q));
  const tausch = WURZEL_FORMEN.find((x) => x.p === F.q && x.q === F.p);
  const opt = [[F.w, `$${F.w}$`]];
  if (tausch) opt.push([tausch.w, `$${tausch.w}$`]);
  for (const x of falsch) if (opt.length < 4 && !opt.some((o) => o[0] === x.w)) opt.push([x.w, `$${x.w}$`]);
  return { art: "umschreiben", text: T(`Schreibe $${hochBruch(F.p, F.q)}$ mit Wurzelzeichen ($x > 0$).`, `Write $${hochBruch(F.p, F.q)}$ using a root sign ($x > 0$).`),
    schritte: [wahl("wu-u", T("Wurzelschreibweise", "Root notation"), T("Welcher Term ist gleich?", "Which term is equal?"), dreh(opt, ganz(0, 3, z)), F.w, {
      hinweis: T("$x^{\\frac{p}{q}} = \\sqrt[q]{x^p}$ – der Nenner wird zur Wurzel, der Zähler zur Hochzahl.", "$x^{\\frac{p}{q}} = \\sqrt[q]{x^p}$ – the denominator becomes the root, the numerator the power."),
      erkl: `$${hochBruch(F.p, F.q)} = ${F.w}$` })],
    pruef: { p: F.p, q: F.q } };
}
function wwert(z) {
  const a = wahlAus([1, 2, 3, -1, -2], z), b = ganz(-5, 5, z), c = ganz(-5, 5, z), k = ganz(1, 5, z);
  const x0 = b + k * k;
  const innen = b === 0 ? "x" : linTex(1, -b);
  const tex = `${vorFaktor(a)}\\sqrt{${innen}}${plusZahl(c)}`;
  return { art: "wwert", text: T(`$f(x) = ${tex}$`, `$f(x) = ${tex}$`),
    schritte: [zahl("wu-w", T("Funktionswert", "Function value"), T(`Berechne $f(${zTex(x0)})$.`, `Calculate $f(${zTex(x0)})$.`), `$f(${zTex(x0)}) =$`, a * k + c, {
      hinweis: b === 0 ? T(`Unter der Wurzel steht ${zTex(x0)}.`, `Under the root is ${zTex(x0)}.`) : T(`Unter der Wurzel: $${zTex(x0)} − ${zKl(b)} = ${k * k}$`, `Under the root: $${zTex(x0)} − ${zKl(b)} = ${k * k}$`), erkl: `$${vorFaktor(a)}\\sqrt{${k * k}}${plusZahl(c)} = ${zTex(a * k + c)}$` })],
    pruef: { f: (x) => a * Math.sqrt(x - b) + c, x0, w: a * k + c } };
}
function wgleichung(z) {
  const a = ganz(-6, 6, z), b = z() < 0.75 ? ganz(1, 6, z) : -ganz(1, 4, z);
  const innen = a === 0 ? "x" : linTex(1, a);
  const ja = b >= 0;
  const st = [wahl("wu-g1", T("Lösbar?", "Solvable?"), T("Hat die Gleichung eine Lösung?", "Does the equation have a solution?"), [["ja", T("ja", "yes")], ["nein", T("nein", "no")]], ja ? "ja" : "nein", {
    fehler: ja ? [] : [{ wahl: "ja", text: T(`Eine Wurzel ist nie negativ – $${zTex(b)}$ wird nie erreicht. (Quadrieren würde eine Scheinlösung liefern!)`, `A square root is never negative – $${zTex(b)}$ is never reached. (Squaring would give a false solution!)`) }],
    hinweis: T("Kann eine Wurzel diesen Wert annehmen?", "Can a square root take this value?"), erkl: ja ? T("Ja – die rechte Seite ist nicht negativ.", "Yes – the right side is not negative.") : T("Nein – $L = \\emptyset$.", "No – $L = \\emptyset$.") })];
  if (ja) st.push(zahl("wu-g2", T("Quadrieren", "Square"), T("Quadriere beide Seiten und löse.", "Square both sides and solve."), "$x =$", b * b - a, {
    fehler: [{ wert: b - a, text: T("Auch die rechte Seite muss quadriert werden.", "The right side has to be squared too.") }],
    hinweis: T(`$${innen} = ${b * b}$`, `$${innen} = ${b * b}$`), erkl: T(`$x = ${zTex(b * b - a)}$, Probe: $\\sqrt{${b * b}} = ${b}$ ✓`, `$x = ${zTex(b * b - a)}$, check: $\\sqrt{${b * b}} = ${b}$ ✓`) }));
  return { art: "wgleichung", text: T(`Löse $\\sqrt{${innen}} = ${zTex(b)}$.`, `Solve $\\sqrt{${innen}} = ${zTex(b)}$.`), schritte: st, pruef: { a, b, loes: ja ? [b * b - a] : [] } };
}
function wdw(z) {
  const a = wahlAus([1, 2, -1, 3], z), b = ganz(-5, 5, z), c = ganz(-5, 5, z);
  const innen = b === 0 ? "x" : linTex(1, -b);
  const tex = `${vorFaktor(a)}\\sqrt{${innen}}${plusZahl(c)}`;
  const D = RECHTS(b, true), W = a > 0 ? RECHTS(c, true) : LINKS(c, true);
  return { art: "wdw", text: T(`$f(x) = ${tex}$`, `$f(x) = ${tex}$`),
    schritte: [
      bereichSchritt("wu-d", "D", D, ganz(0, 3, z), T(`$${innen} \\ge 0$`, `$${innen} \\ge 0$`), T(`$x \\ge ${zTex(b)}$`, `$x \\ge ${zTex(b)}$`)),
      bereichSchritt("wu-w2", "W", W, ganz(0, 3, z), T(`Startpunkt $(${zTex(b)} \\mid ${zTex(c)})$, dann ${a > 0 ? "steigend" : "fallend"}.`, `Starting point $(${zTex(b)} \\mid ${zTex(c)})$, then ${a > 0 ? "increasing" : "decreasing"}.`), T(`Startpunkt bei $y = ${zTex(c)}$`, `Starting point at $y = ${zTex(c)}$`)),
    ],
    pruef: { f: (x) => a * Math.sqrt(x - b) + c, D, W } };
}

/* ======================================================================
   KAPITEL 4 · UMKEHRFUNKTION
   ====================================================================== */
export const UK_ARTEN = ["ulinear", "uwert", "umkehrbar", "uterm"];
function ulinear(z) {
  const m = wahlAus([2, 3, 4, -2, 5, -1, -4], z), c = ganz(-8, 8, z);
  const s = 1 / m, t = -c / m;
  const yc = c === 0 ? "y" : linTex(1, -c, "y");
  const opt = dreh([
    ["r", `$x = \\frac{${yc}}{${zTex(m)}}$`],
    ["f1", `$x = \\frac{${c === 0 ? "y" : linTex(1, c, "y")}}{${zTex(m)}}$`],
    ["f2", `$x = ${linTex(m, c, "y")}$`],
  ].filter((o, i, l) => l.findIndex((p) => p[1] === o[1]) === i), ganz(0, 2, z));
  return { art: "ulinear", text: T(`$f(x) = ${linTex(m, c)}$. Bestimme die Umkehrfunktion.`, `$f(x) = ${linTex(m, c)}$. Find the inverse function.`),
    schritte: [
      wahl("uk-l1", T("Nach x auflösen", "Solve for x"), T(`Löse $y = ${linTex(m, c)}$ nach x auf.`, `Solve $y = ${linTex(m, c)}$ for x.`), opt, "r", {
        fehler: [{ wahl: "f1", text: T("Beim Hinüberbringen wechselt das Vorzeichen.", "Moving it across flips the sign.") }, { wahl: "f2", text: T("Das ist f selbst mit y statt x.", "That's f itself with y instead of x.") }],
        hinweis: T(`Erst ${c >= 0 ? "− " + c : "+ " + -c}, dann durch ${zTex(m)} teilen.`, `First ${c >= 0 ? "− " + c : "+ " + -c}, then divide by ${zTex(m)}.`), erkl: `$x = \\frac{${yc}}{${zTex(m)}}$` }),
      zahl("uk-l2", T("Steigung von f⁻¹", "Slope of f⁻¹"), T("Tausche x und y. Steigung der Umkehrfunktion?", "Swap x and y. Slope of the inverse?"), "$m' =$", s, {
        fehler: [{ wert: m, text: T("Die Steigung der Umkehrfunktion ist der Kehrwert.", "The slope of the inverse is the reciprocal.") }, { wert: -m, text: T("Kehrwert, nicht Gegenzahl.", "Reciprocal, not the opposite.") }],
        hinweis: T("Bruch eingeben, z. B. 1/2.", "Enter a fraction, e.g. 1/2."), erkl: `$m' = ${zTex(s)}$` }),
      zahl("uk-l3", T("y-Achsenabschnitt von f⁻¹", "y-intercept of f⁻¹"), T("Und der y-Achsenabschnitt?", "And the y-intercept?"), "$c' =$", t, {
        hinweis: T(`$\\frac{${yc}}{${zTex(m)}}$ aufteilen.`, `Split $\\frac{${yc}}{${zTex(m)}}$.`), erkl: `$f^{−1}(x) = ${linTex(s, t)}$` }),
    ],
    pruef: { f: (x) => m * x + c, finv: (x) => s * x + t } };
}
function uwert(z) {
  const typ = ganz(0, 2, z), x0 = ganz(-3, 3, z);
  let tex, f;
  if (typ === 0) { const c = ganz(-5, 5, z); tex = `x^3${plusZahl(c)}`; f = (x) => x ** 3 + c; }
  else if (typ === 1) { const m = ganzOhne0(-3, 4, z), c = ganz(-6, 6, z); tex = linTex(m, c); f = (x) => m * x + c; }
  else { const c = ganz(-4, 4, z); tex = `2^x${plusZahl(c)}`; f = (x) => 2 ** x + c; }
  const y0 = f(x0);
  return { art: "uwert", text: T(`$f(x) = ${tex}$ ist umkehrbar.`, `$f(x) = ${tex}$ is invertible.`),
    schritte: [zahl("uk-w", T("Wert der Umkehrfunktion", "Value of the inverse"), T(`Bestimme $f^{−1}(${zTex(y0)})$ – ohne den Term von $f^{−1}$ auszurechnen.`, `Find $f^{−1}(${zTex(y0)})$ – without computing the formula for $f^{−1}$.`), `$f^{−1}(${zTex(y0)}) =$`, x0, {
      fehler: [{ wert: f(y0), text: T("Das ist f(" + zTex(y0) + "). Gesucht ist das x mit f(x) = " + zTex(y0) + ".", "That's f(" + zTex(y0) + "). We want the x with f(x) = " + zTex(y0) + ".") }],
      hinweis: T(`$f^{−1}(${zTex(y0)})$ ist die Zahl x mit $f(x) = ${zTex(y0)}$.`, `$f^{−1}(${zTex(y0)})$ is the number x with $f(x) = ${zTex(y0)}$.`), erkl: T(`$f(${zTex(x0)}) = ${zTex(y0)}$, also $f^{−1}(${zTex(y0)}) = ${zTex(x0)}$`, `$f(${zTex(x0)}) = ${zTex(y0)}$, so $f^{−1}(${zTex(y0)}) = ${zTex(x0)}$`) })],
    pruef: { f, x0, y0 } };
}
export const UMKEHRBAR = [
  { t: "f(x) = x^2,\\; D = \\mathbb{R}", ja: false, e: T("f(2) = f(−2) = 4 – nicht eindeutig umkehrbar.", "f(2) = f(−2) = 4 – not one-to-one.") },
  { t: "f(x) = x^2,\\; D = [0; \\infty[", ja: true, e: T("Auf [0; ∞[ ist f streng monoton steigend – Umkehrfunktion √x.", "On [0; ∞[ f is strictly increasing – inverse √x.") },
  { t: "f(x) = x^3,\\; D = \\mathbb{R}", ja: true, e: T("Streng monoton steigend – Umkehrfunktion ∛x.", "Strictly increasing – inverse ∛x.") },
  { t: "f(x) = e^x,\\; D = \\mathbb{R}", ja: true, e: T("Streng monoton – Umkehrfunktion ln x.", "Strictly monotonic – inverse ln x.") },
  { t: "f(x) = |x|,\\; D = \\mathbb{R}", ja: false, e: T("f(3) = f(−3) = 3.", "f(3) = f(−3) = 3.") },
  { t: "f(x) = \\sin(x),\\; D = \\mathbb{R}", ja: false, e: T("Periodisch – jeder Wert wird unendlich oft angenommen.", "Periodic – every value is taken infinitely often.") },
  { t: "f(x) = \\frac{1}{x},\\; D = \\mathbb{R} \\setminus \\{0\\}", ja: true, e: T("Jeder Wert y ≠ 0 kommt genau einmal vor; f ist sogar ihre eigene Umkehrfunktion.", "Each y ≠ 0 occurs exactly once; f is even its own inverse.") },
  { t: "f(x) = (x − 2)^2,\\; D = [2; \\infty[", ja: true, e: T("Rechts vom Scheitel streng monoton steigend.", "Strictly increasing to the right of the vertex.") },
  { t: "f(x) = x^4 − 1,\\; D = \\mathbb{R}", ja: false, e: T("Achsensymmetrisch: f(1) = f(−1).", "Symmetric: f(1) = f(−1).") },
];
function umkehrbar(z) {
  const u = wahlAus(UMKEHRBAR, z);
  return { art: "umkehrbar", text: T(`$${u.t}$`, `$${u.t}$`),
    schritte: [wahl("uk-u", T("Umkehrbar?", "Invertible?"), T("Ist f auf D umkehrbar?", "Is f invertible on D?"), [["ja", T("ja", "yes")], ["nein", T("nein", "no")]], u.ja ? "ja" : "nein", {
      hinweis: T("Waagerechtentest: Trifft jede waagerechte Gerade den Graphen höchstens einmal?", "Horizontal line test: does every horizontal line meet the graph at most once?"), erkl: u.e })],
    pruef: { ja: u.ja } };
}
function uterm(z) {
  const typ = ganz(0, 2, z);
  if (typ === 0) {
    const d = ganz(-4, 4, z), e = ganz(-4, 4, z);
    const ftex = `${d === 0 ? "x^2" : `(${linTex(1, -d)})^2`}${plusZahl(e)},\\; x \\ge ${zTex(d)}`;
    const w = (p, q) => `\\sqrt{${p === 0 ? "x" : linTex(1, -p)}}${plusZahl(q)}`;
    const r = w(e, d);
    const kand = [r, w(-e, -d), w(d, e), `${e === 0 ? "x^2" : `(${linTex(1, -e)})^2`}${plusZahl(d)}`];
    const opt = [...new Set(kand)].map((k) => [k, `$${k}$`]);
    const Dinv = RECHTS(e, true);
    return { art: "uterm", text: T(`$f(x) = ${ftex}$`, `$f(x) = ${ftex}$`),
      schritte: [
        wahl("uk-t1", T("Term der Umkehrfunktion", "Formula of the inverse"), T("Welcher Term ist $f^{−1}(x)$?", "Which formula is $f^{−1}(x)$?"), dreh(opt, ganz(0, 3, z)), r, {
          hinweis: T(`$y = ${ftex.split(",")[0]}$ nach x auflösen: erst ${e >= 0 ? "− " + e : "+ " + -e}, dann Wurzel (positiv, weil x ≥ ${zTex(d)}), dann ${d >= 0 ? "+ " + d : "− " + -d}.`, `Solve $y = ${ftex.split(",")[0]}$ for x: first ${e >= 0 ? "− " + e : "+ " + -e}, then the root (positive since x ≥ ${zTex(d)}), then ${d >= 0 ? "+ " + d : "− " + -d}.`),
          erkl: `$f^{−1}(x) = ${r}$` }),
        bereichSchritt("uk-t2", "D", Dinv, ganz(0, 3, z), T("D(f⁻¹) = W(f): Die Rollen von D und W tauschen.", "D(f⁻¹) = W(f): domain and range swap roles."), T(`$W(f) = [${zTex(e)}; \\infty[$`, `$W(f) = [${zTex(e)}; \\infty[$`)),
      ],
      pruef: { f: (x) => (x - d) ** 2 + e, finv: (x) => Math.sqrt(x - e) + d, Dinv, Df: RECHTS(d, true) } };
  }
  if (typ === 1) {
    const a = ganz(-4, 4, z);
    const r = a === 0 ? "\\ln(x)" : `\\ln(x)${plusZahl(a)}`;
    const kand = [r, a === 0 ? "e^x" : `\\ln(x)${plusZahl(-a)}`, `\\ln(${a === 0 ? "x" : linTex(1, -a)})`, `e^{−x}`];
    const opt = [...new Set(kand)].map((k) => [k, `$${k}$`]);
    return { art: "uterm", text: T(`$f(x) = e^{${a === 0 ? "x" : linTex(1, -a)}}$`, `$f(x) = e^{${a === 0 ? "x" : linTex(1, -a)}}$`),
      schritte: [
        wahl("uk-t1", T("Term der Umkehrfunktion", "Formula of the inverse"), T("Welcher Term ist $f^{−1}(x)$?", "Which formula is $f^{−1}(x)$?"), dreh(opt, ganz(0, 3, z)), r, {
          hinweis: T("ln ist die Umkehrung von e: Logarithmiere beide Seiten.", "ln undoes e: take the logarithm of both sides."), erkl: T(`$y = e^{${a === 0 ? "x" : linTex(1, -a)}} \\Rightarrow \\ln(y) = ${a === 0 ? "x" : linTex(1, -a)} \\Rightarrow x = ${r.replace(/\(x\)/, "(y)")}$`, `$y = e^{${a === 0 ? "x" : linTex(1, -a)}} \\Rightarrow \\ln(y) = ${a === 0 ? "x" : linTex(1, -a)} \\Rightarrow x = ${r.replace(/\(x\)/, "(y)")}$`) }),
        bereichSchritt("uk-t2", "D", RECHTS(0, false), ganz(0, 3, z), T("D(f⁻¹) = W(f) – welche Werte nimmt eˣ an?", "D(f⁻¹) = W(f) – which values does eˣ take?"), T("$e^{\\ldots} > 0$", "$e^{\\ldots} > 0$")),
      ],
      pruef: { f: (x) => Math.exp(x - a), finv: (x) => Math.log(x) + a, Dinv: RECHTS(0, false), Df: R() } };
  }
  const c = ganz(-4, 4, z);
  const r = `\\sqrt[3]{${c === 0 ? "x" : linTex(1, -c)}}`;
  const kand = [r, `\\sqrt[3]{${c === 0 ? "−x" : linTex(1, c)}}`, `\\sqrt[3]{x}${plusZahl(-c)}`, `x^3${plusZahl(-c)}`];
  const opt = [...new Set(kand)].map((k) => [k, `$${k}$`]);
  return { art: "uterm", text: T(`$f(x) = x^3${plusZahl(c)}$`, `$f(x) = x^3${plusZahl(c)}$`),
    schritte: [
      wahl("uk-t1", T("Term der Umkehrfunktion", "Formula of the inverse"), T("Welcher Term ist $f^{−1}(x)$?", "Which formula is $f^{−1}(x)$?"), dreh(opt, ganz(0, 3, z)), r, {
        hinweis: T(`Erst ${c >= 0 ? "− " + c : "+ " + -c}, dann die dritte Wurzel – die gibt es auch für negative Zahlen.`, `First ${c >= 0 ? "− " + c : "+ " + -c}, then the cube root – which exists for negative numbers too.`), erkl: `$f^{−1}(x) = ${r}$` }),
      bereichSchritt("uk-t2", "D", R(), ganz(0, 3, z), T("x³ nimmt jeden Wert an.", "x³ takes every value."), T("$W(f) = \\mathbb{R}$", "$W(f) = \\mathbb{R}$")),
    ],
    pruef: { f: (x) => x ** 3 + c, finv: (x) => Math.cbrt(x - c), Dinv: R(), Df: R() } };
}

/* ======================================================================
   KAPITEL 5 · VERKETTUNG
   ====================================================================== */
export const VK_ARTEN = ["vwert", "vterm", "zerlegen", "reihenfolge", "vd"];
/* Klammern nur, wo nötig: einzelne Bausteine (x, 2x, √…, |…|, ln(…), e^{…}) brauchen beim Malnehmen keine */
const EINZEL = /^([a-z0-9]+|\\sqrt(\[\d\])?\{[^{}]*\}|\|[^|]*\||\\ln\([^()]*\)|e\^\{[^{}]*\}|\\frac\{[^{}]*\}\{[^{}]*\})$/i;
const klammer = (t) => (/^[a-z0-9]+$/i.test(t) ? t : `(${t})`);
const klammerMal = (t) => (EINZEL.test(t) ? t : `(${t})`);
/* g(f(x)) als TeX: jedes x in g durch f(x) ersetzen – vor einer Hochzahl immer mit Klammer */
const einsetzen = (gt, ft) => gt.replace(/x(\^)?/g, (m, h) => (h ? `${klammer(ft)}^` : klammerMal(ft)));
/* äußere Funktionen f(u) */
export const AUSSEN = {
  quad: { tex: (u) => `${klammer(u)}^2`, f: (u) => u * u, name: "u^2" },
  wurzel: { tex: (u) => `\\sqrt{${u}}`, f: (u) => Math.sqrt(u), name: "\\sqrt{u}" },
  kehr: { tex: (u) => `\\frac{1}{${u}}`, f: (u) => 1 / u, name: "\\frac{1}{u}" },
  lin: { tex: (u) => `2${klammer(u)} + 1`, f: (u) => 2 * u + 1, name: "2u + 1" },
  exp: { tex: (u) => `e^{${u}}`, f: (u) => Math.exp(u), name: "e^u" },
  ln: { tex: (u) => `\\ln(${u})`, f: (u) => Math.log(u), name: "\\ln(u)" },
  betrag: { tex: (u) => `|${u}|`, f: (u) => Math.abs(u), name: "|u|" },
};
/* innere Funktionen g(x) */
export const INNEN = {
  lin: { tex: "3x − 1", f: (x) => 3 * x - 1 },
  quad1: { tex: "x^2 + 1", f: (x) => x * x + 1 },
  minus4: { tex: "x − 4", f: (x) => x - 4 },
  doppel: { tex: "2x", f: (x) => 2 * x },
  kubik: { tex: "x^3", f: (x) => x ** 3 },
  plus2: { tex: "x + 2", f: (x) => x + 2 },
};
const fTex = (k) => AUSSEN[k].tex("x");
function paar(z) {
  return [wahlAus(Object.keys(AUSSEN), z), wahlAus(Object.keys(INNEN), z)];
}
function vwert(z) {
  /* nur Paare mit „schönem“ Ergebnis */
  for (let i = 0; i < 200; i++) {
    const a = wahlAus(["quad", "wurzel", "kehr", "lin", "betrag"], z), g = wahlAus(Object.keys(INNEN), z), x0 = ganz(-3, 4, z);
    const u = INNEN[g].f(x0), w = AUSSEN[a].f(u);
    if (!Number.isFinite(w) || (a === "wurzel" && !Number.isInteger(w)) || (a === "kehr" && Math.abs(u) > 12)) continue;
    return { art: "vwert", text: T(`$f(x) = ${fTex(a)}$, $g(x) = ${INNEN[g].tex}$`, `$f(x) = ${fTex(a)}$, $g(x) = ${INNEN[g].tex}$`),
      schritte: [
        zahl("vk-w1", T("Innen zuerst", "Inside first"), T(`Berechne $g(${zTex(x0)})$.`, `Calculate $g(${zTex(x0)})$.`), `$g(${zTex(x0)}) =$`, u, { hinweis: T("Die innere Funktion wird zuerst angewendet.", "The inner function is applied first."), erkl: `$g(${zTex(x0)}) = ${zTex(u)}$` }),
        zahl("vk-w2", T("Dann außen", "Then outside"), T(`Berechne $(f \\,∘\\, g)(${zTex(x0)}) = f(g(${zTex(x0)}))$.`, `Calculate $(f \\,∘\\, g)(${zTex(x0)}) = f(g(${zTex(x0)}))$.`), `$f(${zTex(u)}) =$`, w, {
          fehler: Number.isFinite(INNEN[g].f(AUSSEN[a].f(x0))) ? [{ wert: INNEN[g].f(AUSSEN[a].f(x0)), text: T("Das ist g(f(" + zTex(x0) + ")) – die Reihenfolge ist umgekehrt.", "That's g(f(" + zTex(x0) + ")) – the order is reversed.") }] : [],
          hinweis: T(`Setze $${zTex(u)}$ in f ein.`, `Substitute $${zTex(u)}$ into f.`), erkl: `$f(${zTex(u)}) = ${zTex(w)}$` }),
      ],
      pruef: { a, g, x0, w } };
  }
  return vwert(Math.random);
}
function vterm(z) {
  let a, g;
  do { [a, g] = paar(z); } while (a === "lin" || AUSSEN[a].tex(INNEN[g].tex) === einsetzen(INNEN[g].tex, fTex(a)));
  const richtig = AUSSEN[a].tex(INNEN[g].tex);
  const umgekehrt = einsetzen(INNEN[g].tex, fTex(a));
  const produkt = `${klammer(fTex(a))} \\cdot ${klammer(INNEN[g].tex)}`;
  const opt = dreh([[richtig, `$${richtig}$`], [umgekehrt, `$${umgekehrt}$`], [produkt, `$${produkt}$`]].filter((o, i, l) => l.findIndex((p) => p[0] === o[0]) === i), ganz(0, 2, z));
  return { art: "vterm", text: T(`$f(x) = ${fTex(a)}$, $g(x) = ${INNEN[g].tex}$`, `$f(x) = ${fTex(a)}$, $g(x) = ${INNEN[g].tex}$`),
    schritte: [wahl("vk-t", T("Verkettung aufstellen", "Build the composition"), T("Welcher Term ist $(f \\,∘\\, g)(x) = f(g(x))$?", "Which term is $(f \\,∘\\, g)(x) = f(g(x))$?"), opt, richtig, {
      fehler: [{ wahl: umgekehrt, text: T("Das ist g(f(x)) – bei f ∘ g wird g zuerst angewendet und in f eingesetzt.", "That's g(f(x)) – in f ∘ g, g is applied first and substituted into f.") }, { wahl: produkt, text: T("Verkettung ist kein Produkt: g(x) wird für x in f eingesetzt.", "Composition is not a product: g(x) is substituted for x in f.") }],
      hinweis: T("Ersetze in f jedes x durch den ganzen Term g(x).", "Replace every x in f by the whole term g(x)."), erkl: `$f(g(x)) = ${richtig}$` })],
    pruef: { a, g, richtig } };
}
function zerlegen(z) {
  let a, g;
  do { [a, g] = paar(z); } while (a === "lin");
  const h = AUSSEN[a].tex(INNEN[g].tex);
  const optI = dreh(Object.keys(INNEN).filter((k) => k === g || z() < 0.6).slice(0, 4).map((k) => [k, `$g(x) = ${INNEN[k].tex}$`]), ganz(0, 3, z));
  if (!optI.some((o) => o[0] === g)) optI.push([g, `$g(x) = ${INNEN[g].tex}$`]);
  if (optI.length < 2) optI.push([g === "lin" ? "plus2" : "lin", `$g(x) = ${INNEN[g === "lin" ? "plus2" : "lin"].tex}$`]);
  const optA = dreh(Object.keys(AUSSEN).filter((k) => k !== "lin" && (k === a || z() < 0.5)).slice(0, 4).map((k) => [k, `$f(u) = ${AUSSEN[k].name}$`]), ganz(0, 3, z));
  if (!optA.some((o) => o[0] === a)) optA.push([a, `$f(u) = ${AUSSEN[a].name}$`]);
  if (optA.length < 2) optA.push([a === "quad" ? "wurzel" : "quad", `$f(u) = ${AUSSEN[a === "quad" ? "wurzel" : "quad"].name}$`]);
  return { art: "zerlegen", text: T(`$h(x) = ${h}$ soll als $h = f \\,∘\\, g$ geschrieben werden.`, `Write $h(x) = ${h}$ as $h = f \\,∘\\, g$.`),
    schritte: [
      wahl("vk-z1", T("Innere Funktion", "Inner function"), T("Was wird zuerst gerechnet? Innere Funktion g:", "What is calculated first? Inner function g:"), optI, g, { hinweis: T("Was steht in der Klammer, unter der Wurzel, im Exponenten oder im Nenner?", "What is in the brackets, under the root, in the exponent or in the denominator?"), erkl: `$g(x) = ${INNEN[g].tex}$` }),
      wahl("vk-z2", T("Äußere Funktion", "Outer function"), T("Was passiert danach mit dem Ergebnis u = g(x)?", "What happens next with the result u = g(x)?"), optA, a, { hinweis: T("Ersetze den inneren Term gedanklich durch u.", "Mentally replace the inner term by u."), erkl: `$f(u) = ${AUSSEN[a].name}$` }),
    ],
    pruef: { a, g, h } };
}
function reihenfolge(z) {
  for (let i = 0; i < 200; i++) {
    const a = wahlAus(["quad", "lin", "betrag"], z), g = wahlAus(["lin", "minus4", "doppel", "plus2", "quad1"], z), x0 = ganz(-3, 3, z);
    const fg = AUSSEN[a].f(INNEN[g].f(x0)), gf = INNEN[g].f(AUSSEN[a].f(x0));
    if (fg === gf) continue;
    return { art: "reihenfolge", text: T(`$f(x) = ${fTex(a)}$, $g(x) = ${INNEN[g].tex}$`, `$f(x) = ${fTex(a)}$, $g(x) = ${INNEN[g].tex}$`),
      schritte: [
        zahl("vk-r1", T("$f(g(x_0))$", "$f(g(x_0))$"), T(`Berechne $(f \\,∘\\, g)(${zTex(x0)})$.`, `Calculate $(f \\,∘\\, g)(${zTex(x0)})$.`), `$f(g(${zTex(x0)})) =$`, fg, { hinweis: T("Erst g, dann f.", "First g, then f."), erkl: `$f(${zTex(INNEN[g].f(x0))}) = ${zTex(fg)}$` }),
        zahl("vk-r2", T("$g(f(x_0))$", "$g(f(x_0))$"), T(`Berechne $(g \\,∘\\, f)(${zTex(x0)})$.`, `Calculate $(g \\,∘\\, f)(${zTex(x0)})$.`), `$g(f(${zTex(x0)})) =$`, gf, { hinweis: T("Erst f, dann g.", "First f, then g."), erkl: T(`$g(${zTex(AUSSEN[a].f(x0))}) = ${zTex(gf)}$ – die Reihenfolge ändert das Ergebnis.`, `$g(${zTex(AUSSEN[a].f(x0))}) = ${zTex(gf)}$ – the order changes the result.`) }),
      ],
      pruef: { fg, gf } };
  }
  return reihenfolge(Math.random);
}
function vd(z) {
  const typ = ganz(0, 2, z);
  const fam = typ === 0 ? "wurzelquad" : typ === 1 ? "bruch2" : "ln";
  const au = dAufgabe(fam, z);
  return { ...au, art: "vd", text: T(`${au.text[0]} – eine Verkettung. Wo ist sie definiert?`, `${au.text[1]} – a composition. Where is it defined?`) };
}

/* ======================================================================
   KAPITEL 6 · DEFINITIONS- UND WERTEBEREICH (eigenes Training)
   ====================================================================== */
export const DW_ARTEN = ["dwurzel", "dbruch", "dln", "dmix", "wquadrat", "wexp", "wsinus", "wmix"];

/* ======================================================================
   Öffentliche Erzeuger
   ====================================================================== */
const ERZ = {
  istfunktion, wert, urbild, dbasis: (z) => dAufgabe(wahlAus(["wurzel", "bruch"], z), z),
  symmetrie, verhalten, parameter, potdw,
  umschreiben, wwert, wgleichung, wdw,
  ulinear, uwert, umkehrbar, uterm,
  vwert, vterm, zerlegen, reihenfolge, vd,
  dwurzel: (z) => dAufgabe(wahlAus(["wurzel", "wurzelbruch", "kreis"], z), z), dbruch: (z) => dAufgabe(wahlAus(["bruch", "bruch2", "potneg"], z), z),
  dln: (z) => dAufgabe("ln", z), dmix: (z) => dAufgabe(wahlAus(D_FAMILIEN, z), z),
  wquadrat: (z) => wAufgabe(wahlAus(["quadrat", "betrag"], z), z), wexp: (z) => wAufgabe(wahlAus(["exp", "potneg", "wurzelbruch"], z), z),
  wsinus: (z) => wAufgabe("sinus", z), wmix: (z) => wAufgabe(wahlAus(W_FAMILIEN, z), z),
};
export const FK_TITEL = {
  istfunktion: ["Funktion oder nicht?", "Function or not?"], wert: ["Funktionswert", "Function value"], urbild: ["Urbild finden", "Find the pre-image"], dbasis: ["Erster Definitionsbereich", "First domain"],
  symmetrie: ["Symmetrie", "Symmetry"], verhalten: ["Verhalten im Unendlichen", "End behaviour"], parameter: ["Faktor aus einem Punkt", "Factor from a point"], potdw: ["D und W von xⁿ", "D and W of xⁿ"],
  umschreiben: ["Potenz ↔ Wurzel", "Power ↔ root"], wwert: ["Wurzelfunktion auswerten", "Evaluate a root function"], wgleichung: ["Wurzelgleichung", "Root equation"], wdw: ["D und W der Wurzelfunktion", "D and W of a root function"],
  ulinear: ["Lineare Umkehrfunktion", "Linear inverse"], uwert: ["Wert von f⁻¹", "Value of f⁻¹"], umkehrbar: ["Umkehrbar?", "Invertible?"], uterm: ["Term von f⁻¹", "Formula of f⁻¹"],
  vwert: ["f(g(x)) berechnen", "Calculate f(g(x))"], vterm: ["f ∘ g aufstellen", "Build f ∘ g"], zerlegen: ["Verkettung zerlegen", "Decompose"], reihenfolge: ["f ∘ g oder g ∘ f?", "f ∘ g or g ∘ f?"], vd: ["D einer Verkettung", "Domain of a composition"],
  dwurzel: ["D: Wurzeln", "D: roots"], dbruch: ["D: Brüche", "D: fractions"], dln: ["D: Logarithmus", "D: logarithm"], dmix: ["D: gemischt", "D: mixed"],
  wquadrat: ["W: Scheitel und Betrag", "W: vertex and absolute value"], wexp: ["W: Asymptoten", "W: asymptotes"], wsinus: ["W: Sinus", "W: sine"], wmix: ["W: gemischt", "W: mixed"],
};
export const FK_KAPITEL_ARTEN = { fb: FB_ARTEN, po: PO_ARTEN, wu: WU_ARTEN, uk: UK_ARTEN, vk: VK_ARTEN, dw: DW_ARTEN };
export function fkAufgabe(art, z = Math.random) { return { ...ERZ[art](z), art }; }
export { enthaelt };
