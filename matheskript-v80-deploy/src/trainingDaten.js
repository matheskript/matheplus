/* ======================================================================
   trainingDaten.js – reine Mathematik und Auswertung für das persönliche
   Training (5 Minuten Mathe, Meine Fehler üben, Prüfungsmodus, Klausur
   nachbereiten, Erklär deinen Schritt). Kein React, kein Speicher.

   Jede Aufgabe kommt mit
     · der richtigen Antwort, berechnet mit den vorhandenen Rechenbausteinen
       (rechnen2.js, hypo.js, aufgaben2.js) – nie aus einem KI-Text,
     · typischen Fehlantworten, die jeweils einem Fehlertyp zugeordnet sind.
   Nur so lässt sich ein Fehler später sauber einer Ursache zuordnen.

   Aufgabe: { id, thema, variante, afb, punkte, sekunden, text, typ: "zahl" | "wahl",
              optionen, richtig            (wahl)
              wert, toleranz, einheit, eingabe   (zahl)
              fehler: [{ wert | wahl, typ, text }],
              hinweise: [Denkfrage, Regel, nächster Schritt],
              regeln: [{ name }], grundlage, loesung: [..], erklaer: {..} }
   Keine base-Datei darf diese Datei importieren.
   ====================================================================== */
import {
  bestimmt, flaeche, laenge, mischen, pAus, pInt, pNum, q, qAdd, qMul, qNum, qSub, skalar, wahl, winkelGeradeEbene, winkelZwischen, zz, zzOhne0,
} from "./rechnen2.js";
import { neueFlaechenAufgabe } from "./aufgaben2.js";
import { binomTabelle, kumuliert, pAb, pBis } from "./hypo.js";

/* ---------- Anzeige ---------- */
const mi = (s) => String(s).replace(/-/g, "−");
export const dez = (v, st = 4) => mi(String(Math.round(v * 10 ** st) / 10 ** st).replace(".", ","));
const sgn = (b) => (b < 0 ? `- ${-b}` : `+ ${b}`);
const tm = (c, v) => (c === 0 ? "" : Math.abs(c) === 1 && v ? `${c < 0 ? "-" : "+"} ${v}` : `${c < 0 ? "-" : "+"} ${Math.abs(c)}${v}`);
const koef = (a) => (a === 1 ? "" : a === -1 ? "-" : String(a));
const klam = (v) => (v < 0 ? `(${v})` : String(v));
const ggT = (a, b) => (b ? ggT(b, a % b) : Math.abs(a));
const bruchTex = (z, n) => { const g = ggT(z, n) || 1; z /= g; n /= g; if (n < 0) { z = -z; n = -n; } return n === 1 ? String(z) : `${z < 0 ? "-" : ""}\\frac{${Math.abs(z)}}{${n}}`; };
const bruchTxt = (z, n) => { const g = ggT(z, n) || 1; z /= g; n /= g; if (n < 0) { z = -z; n = -n; } return n === 1 ? mi(z) : `${mi(z)}/${n}`; };
const qTexS = (a) => bruchTex(a.z, a.n);
const qTxt = (a) => bruchTxt(a.z, a.n);

/* ---------- Themen ---------- */
export const THEMEN = {
  ableiten:   { name: "Ableiten", gruppe: "Analysis", grund: false, tools: [{ ansicht: "ableitungstrainer", name: "Ableitungstrainer" }] },
  gleichungen:{ name: "Gleichungen lösen", gruppe: "Grundlagen", grund: true, tools: [{ ansicht: "gleichungen", name: "Gleichungen" }] },
  brueche:    { name: "Bruchrechnen", gruppe: "Grundlagen", grund: true, tools: [{ ansicht: "kopf", trainer: "bruchrechnen", name: "Bruchrechnen (Kopfrechnen)" }] },
  terme:      { name: "Terme und binomische Formeln", gruppe: "Grundlagen", grund: true, tools: [{ ansicht: "terme", name: "Terme und Potenzgesetze" }] },
  kurven:     { name: "Kurvendiskussion", gruppe: "Analysis", grund: false, tools: [{ ansicht: "plotter", name: "Polynomplotter" }] },
  integrale:  { name: "Integrale", gruppe: "Analysis", grund: false, tools: [{ ansicht: "integrale", name: "Integrale" }] },
  bernoulli:  { name: "Bernoulli-Ketten", gruppe: "Stochastik", grund: false, tools: [{ ansicht: "bernoulli", name: "Bernoulli-Kette" }] },
  vektoren:   { name: "Vektoren und Winkel", gruppe: "Vektoren", grund: false, tools: [{ ansicht: "winkel", name: "Winkel und Skalarprodukt" }, { ansicht: "vektorgenerator", name: "Rechnen mit Vektoren" }] },
};
export const THEMA_IDS = Object.keys(THEMEN);

/* ---------- Fehlertypen ---------- */
export const FEHLERTYPEN = {
  vorzeichen:       { name: "Vorzeichen", thema: "gleichungen", kurz: "Ein Vorzeichen wird beim Umformen, Einsetzen oder Ablesen verdreht.",
                      tipp: "Schreib jede Umformung in eine eigene Zeile und prüfe am Ende durch Einsetzen." },
  pqformel:         { name: "p/2 in der pq-Formel", thema: "gleichungen", kurz: "In der pq-Formel wird p statt p/2 verwendet.",
                      tipp: "Merke: x = −(p/2) ± √((p/2)² − q). Das p wird zuerst halbiert." },
  ausmultiplizieren:{ name: "Klammer ausmultiplizieren", thema: "gleichungen", kurz: "Der Faktor vor der Klammer wird nicht mit jedem Summanden multipliziert.",
                      tipp: "Jeder Summand in der Klammer bekommt den Faktor: a·(x + b) = a·x + a·b." },
  loesungsanzahl:   { name: "Lösung geht verloren", thema: "gleichungen", kurz: "Durch Teilen durch x geht die Lösung x = 0 verloren.",
                      tipp: "Nie durch einen Term mit x teilen. Stattdessen ausklammern und den Satz vom Nullprodukt nutzen." },
  potenzregel:      { name: "Potenzregel", thema: "ableiten", kurz: "Beim Ableiten von xⁿ wird der Exponent oder der Faktor n vergessen.",
                      tipp: "Aus xⁿ wird n·xⁿ⁻¹: Exponent nach vorn, dann um 1 verkleinern." },
  kettenregel:      { name: "Kettenregel (innere Ableitung)", thema: "ableiten", kurz: "Die innere Ableitung wird nicht mit der äußeren multipliziert.",
                      tipp: "Frag dich immer: Steckt in der Klammer oder im Exponenten mehr als nur x? Dann kommt die innere Ableitung dazu." },
  stammfunktion:    { name: "Aufleiten statt Ableiten", thema: "integrale", kurz: "Statt einer Stammfunktion wird die Ableitung gebildet.",
                      tipp: "Beim Integrieren geht der Exponent um 1 hoch und du teilst durch den neuen Exponenten." },
  grenzen:          { name: "Integrationsgrenzen", thema: "integrale", kurz: "Es wird nur die obere Grenze eingesetzt oder die Grenzen werden vertauscht.",
                      tipp: "Immer F(b) − F(a): obere Grenze minus untere Grenze, beide einsetzen." },
  flaechenvorzeichen:{ name: "Fläche mit Vorzeichenwechsel", thema: "integrale", kurz: "Bei einem Vorzeichenwechsel wird das Integral statt der Fläche berechnet.",
                      tipp: "Erst die Nullstellen bestimmen, dann je Teilintervall den Betrag des Integrals addieren." },
  ereignisgrenze:   { name: "Ereignisgrenze (≥ oder >)", thema: "bernoulli", kurz: "„mindestens“, „höchstens“, „mehr als“, „weniger als“ werden mit der falschen Grenze übersetzt.",
                      tipp: "Mehr als k heißt X ≥ k + 1, weniger als k heißt X ≤ k − 1. Schreib das Ereignis mit Ungleichung auf." },
  binomkoeff:       { name: "Anzahl der Pfade", thema: "bernoulli", kurz: "Der Binomialkoeffizient (Anzahl der Pfade) fehlt in der Bernoulli-Formel.",
                      tipp: "P(X = k) = (n über k)·pᵏ·(1−p)ⁿ⁻ᵏ. Es gibt mehrere Reihenfolgen mit k Treffern." },
  normalenwinkel:   { name: "Winkel zur Ebene (Normalenwinkel)", thema: "vektoren", kurz: "Der Winkel zum Normalenvektor wird mit dem Winkel zur Ebene verwechselt.",
                      tipp: "Gerade–Ebene: sin φ = |u·n| / (|u|·|n|). Mit Kosinus erhältst du den Winkel zum Normalenvektor, also 90° − φ." },
  betragswurzel:    { name: "Länge eines Vektors", thema: "vektoren", kurz: "Bei der Länge fehlt die Wurzel oder es werden die Beträge der Koordinaten addiert.",
                      tipp: "|v| = √(v₁² + v₂² + v₃²): erst quadrieren, dann addieren, dann die Wurzel ziehen." },
  nachweis:         { name: "Extremstelle ohne Kriterium", thema: "kurven", kurz: "f′(x) = 0 oder f″(x) = 0 allein reicht nicht als Nachweis.",
                      tipp: "Extremstelle: f′ wechselt das Vorzeichen (oder f′ = 0 und f″ ≠ 0). Wendestelle: f″ wechselt das Vorzeichen." },
  ableitungsstufe:  { name: "f′ statt f″", thema: "kurven", kurz: "Für die Wendestelle wird f′ = 0 gelöst statt f″ = 0.",
                      tipp: "Extremstellen: f′ = 0. Wendestellen: f″ = 0. Notiere zuerst, welche Stelle gesucht ist." },
  bruchaddition:    { name: "Brüche addieren", thema: "brueche", kurz: "Zähler und Nenner werden einzeln addiert.",
                      tipp: "Erst auf den gemeinsamen Nenner erweitern, dann nur die Zähler addieren." },
  bruchdivision:    { name: "Durch einen Bruch teilen", thema: "brueche", kurz: "Beim Teilen durch einen Bruch wird nicht der Kehrwert genommen.",
                      tipp: "Durch einen Bruch teilen heißt: mit dem Kehrwert malnehmen." },
  mittelterm:       { name: "Mittelterm der binomischen Formel", thema: "terme", kurz: "Beim Ausmultiplizieren von (x ± a)² fehlt der Mittelterm 2ax.",
                      tipp: "(x ± a)² ist nicht x² ± a². Schreib (x ± a)(x ± a) aus." },
};
export const FEHLER_IDS = Object.keys(FEHLERTYPEN);

/* ---------- Gemeinsame Bausteine der Aufgaben ---------- */
let zaehler = 0;
const neuId = () => `t${Date.now().toString(36)}${++zaehler}`;
const rund = (v, st) => Math.round(v * 10 ** st) / 10 ** st;
/* Fehlerwerte bereinigen: nur Werte, die sich von der richtigen Antwort und voneinander unterscheiden */
function bereinigen(a) {
  if (a.typ === "zahl") {
    const gesehen = [a.wert];
    const rein = [];
    for (const f of a.fehler) {
      if (!isFinite(f.wert)) continue;
      if (gesehen.some((g) => Math.abs(g - f.wert) <= (a.abstand ?? a.toleranz * 4 + 1e-9))) continue;
      gesehen.push(f.wert); rein.push(f);
    }
    a.fehler = rein;
  }
  return a;
}

const REGEL_BRUCH_ADD = { name: "Brüche addieren", gruppe: "Bruchrechnen", f: "\\frac{a}{b} + \\frac{c}{d} = \\frac{ad + bc}{bd}", kurz: "Erst auf den gemeinsamen Nenner bringen, dann die Zähler addieren.", beispiel: "$\\frac{1}{2} + \\frac{1}{3} = \\frac{3}{6} + \\frac{2}{6} = \\frac{5}{6}$" };
const REGEL_BRUCH_DIV = { name: "Durch einen Bruch teilen", gruppe: "Bruchrechnen", f: "\\frac{a}{b} : \\frac{c}{d} = \\frac{a}{b} \\cdot \\frac{d}{c}", kurz: "Durch einen Bruch teilen heißt: mit dem Kehrwert multiplizieren.", beispiel: "$\\frac{1}{2} : \\frac{1}{4} = \\frac{1}{2} \\cdot 4 = 2$" };
const GRUND_BRUCH = { name: "Bruchrechnen", trainer: "bruchrechnen", grund: "Brüche sind die Grundlage für fast jede Rechnung in der Oberstufe. Ein kurzer Check hilft dir weiter." };

/* ======================================================================
   GENERATOREN – jeder liefert eine Aufgabe und nennt die Fehlertypen, die er auslösen kann
   ====================================================================== */
export const GENERATOREN = [];
const reg = (g) => { GENERATOREN.push(g); return g; };

/* ---------- Ableiten ---------- */
reg({ id: "abl-potenz", thema: "ableiten", afb: 1, fuer: ["potenzregel", "vorzeichen"], mach() {
  const a = zz(2, 6), n = wahl([2, 3, 4]), b = zzOhne0(-5, 5), x0 = wahl([1, 2, 3, -1, -2]);
  const richtig = a * n * x0 ** (n - 1) + b;
  const fehler = [
    { wert: a * n * x0 ** n + b, typ: "potenzregel", text: "Beim Ableiten sinkt der Exponent um 1: aus x^n wird n·x^(n−1). Du hast den Exponenten nicht verkleinert." },
    { wert: a * x0 ** (n - 1) + b, typ: "potenzregel", text: "Der Exponent n muss als Faktor nach vorn: (a·x^n)′ = a·n·x^(n−1)." },
  ];
  if (x0 < 0 && n % 2 === 0) fehler.push({ wert: a * n * Math.abs(x0) ** (n - 1) + b, typ: "vorzeichen", text: `Achte beim Einsetzen auf das Vorzeichen: ${n - 1} ist ungerade, also bleibt (${x0})^${n - 1} negativ.` });
  return bereinigen({
    daten: { a, n, b, x0 },
    text: `Gegeben ist $f(x) = ${koef(a)}x^{${n}} ${tm(b, "x")}$. Bestimme $f′(${x0})$.`, typ: "zahl", wert: richtig, toleranz: 1e-9, fehler,
    hinweise: ["Welche Ableitungsregel gehört zu einer Potenz $x^n$, und was passiert mit dem Summanden $b·x$?", "Potenzregel: $(x^n)′ = n·x^{n-1}$, Faktorregel: Konstante Faktoren bleiben stehen.", `Leite zuerst $f$ ab: $f′(x) = ${a * n}x^{${n - 1}} ${sgn(b)}$. Setze dann $x = ${x0}$ ein.`],
    regeln: [{ name: "Potenzregel" }, { name: "Faktorregel" }, { name: "Summenregel" }],
    loesung: [`$f′(x) = ${a * n}x^{${n - 1}} ${sgn(b)}$`, `$f′(${x0}) = ${a * n}·${klam(x0)}^{${n - 1}} ${sgn(b)} = ${mi(richtig)}$`],
    erklaer: erklaerAbleiten("potenz"),
  });
} });
reg({ id: "abl-kette", thema: "ableiten", afb: 2, fuer: ["kettenregel", "potenzregel"], mach() {
  const a = wahl([2, 3, -2, 4]), b = zzOhne0(-3, 3), n = wahl([2, 3, 4]), x0 = wahl([0, 1, 2, -1]);
  const innen = a * x0 + b;
  if (innen === 0) return this.mach();
  const richtig = n * a * innen ** (n - 1);
  const fehler = [
    { wert: n * innen ** (n - 1), typ: "kettenregel", text: `Hier steckt $${koef(a)}x ${sgn(b)}$ in der Klammer. Die innere Ableitung ${a} fehlt: Kettenregel heißt äußere Ableitung mal innere Ableitung.` },
    { wert: a * innen ** (n - 1), typ: "potenzregel", text: "Der Exponent n muss als Faktor nach vorn: aus $(\\dots)^n$ wird $n·(\\dots)^{n-1}$." },
    { wert: n * a * innen ** n, typ: "potenzregel", text: "Beim Ableiten sinkt der Exponent um 1. Der Exponent in der Klammer bleibt bei dir unverändert." },
  ];
  return bereinigen({
    daten: { a, b, n, x0 },
    text: `Gegeben ist $f(x) = (${koef(a)}x ${sgn(b)})^{${n}}$. Bestimme $f′(${x0})$.`, typ: "zahl", wert: richtig, toleranz: 1e-9, fehler,
    hinweise: ["Was ist die innere, was die äußere Funktion? Was gehört zur inneren Ableitung?", "Kettenregel: $f′(x) = u′(v(x)) · v′(x)$. Hier ist $v(x)$ der Term in der Klammer.", `Äußere Ableitung: $${n}·(${koef(a)}x ${sgn(b)})^{${n - 1}}$, innere Ableitung: $${a}$. Multipliziere beide und setze $x = ${x0}$ ein.`],
    regeln: [{ name: "Kettenregel" }, { name: "Potenzregel" }],
    loesung: [`$f′(x) = ${n}·(${koef(a)}x ${sgn(b)})^{${n - 1}} · ${klam(a)}$`, `$f′(${x0}) = ${n}·${klam(innen)}^{${n - 1}}·${klam(a)} = ${mi(richtig)}$`],
    erklaer: erklaerAbleiten("kette"),
  });
} });
reg({ id: "abl-exp", thema: "ableiten", afb: 2, fuer: ["kettenregel"], mach() {
  const c = wahl([2, 3, 4, 5, -2, -3]), k = wahl([2, 3, 4, -1, -2, -3]);
  const richtig = c * k;
  return bereinigen({
    daten: { c, k },
    text: `Es ist $f(x) = ${koef(c)}e^{${k}x}$. Die Ableitung hat die Form $f′(x) = c·e^{${k}x}$. Bestimme $c$.`, typ: "zahl", wert: richtig, toleranz: 1e-9,
    fehler: [{ wert: c, typ: "kettenregel", text: `Im Exponenten steht $${k}x$, nicht nur $x$. Die innere Ableitung ${k} muss als Faktor dazu.` },
             { wert: c * Math.abs(k), typ: "vorzeichen", text: "Auch das Vorzeichen der inneren Ableitung gehört zum Faktor." }],
    hinweise: ["Was steht im Exponenten, und wie leitest du diesen Teil ab?", "$(e^{kx})′ = k·e^{kx}$ – die innere Ableitung des Exponenten kommt als Faktor dazu.", `Multipliziere den Vorfaktor ${c} mit der inneren Ableitung ${k}.`],
    regeln: [{ name: "e-Funktion" }, { name: "Kettenregel" }],
    loesung: [`$f′(x) = ${koef(c)}·${klam(k)}·e^{${k}x}$`, `$c = ${mi(richtig)}$`],
    erklaer: erklaerAbleiten("exp"),
  });
} });

/* ---------- Gleichungen ---------- */
reg({ id: "gl-quadrat", thema: "gleichungen", afb: 1, fuer: ["vorzeichen", "pqformel"], mach() {
  let r1 = zz(-6, 6), r2 = zz(-6, 6);
  while (r1 === r2) r2 = zz(-6, 6);
  const p = -(r1 + r2), qq = r1 * r2, gross = Math.max(r1, r2), klein = Math.min(r1, r2);
  const fehler = [{ wert: -klein, typ: "vorzeichen", text: "Prüfe die Vorzeichen: Die pq-Formel beginnt mit $-\\frac{p}{2}$. Setze die Lösung zur Probe in die Gleichung ein." }];
  const D = p * p - qq;
  if (D >= 0) fehler.push({ wert: -p + Math.sqrt(D), typ: "pqformel", text: "In der pq-Formel wird $p$ halbiert: $x = -\\frac{p}{2} ± \\sqrt{(\\frac{p}{2})^2 - q}$." });
  return bereinigen({
    daten: { p, q: qq, r1, r2 },
    text: `Löse $x^2 ${tm(p, "x")} ${sgn(qq)} = 0$. Gib die größere der beiden Lösungen an.`, typ: "zahl", wert: gross, toleranz: 1e-9, fehler,
    hinweise: ["Welche Verfahren kennst du für eine quadratische Gleichung der Form $x^2 + px + q = 0$?", "pq-Formel: $x_{1,2} = -\\frac{p}{2} ± \\sqrt{(\\frac{p}{2})^2 - q}$", `Hier ist $p = ${p}$ und $q = ${qq}$. Berechne erst $-\\frac{p}{2}$ und dann die Wurzel.`],
    regeln: [{ name: "Mitternachtsformel" }, { name: "Satz vom Nullprodukt" }],
    loesung: [`$p = ${p}$, $q = ${qq}$`, `$x_{1,2} = ${mi(-p / 2)} ± \\sqrt{${mi((p / 2) ** 2)} ${sgn(-qq)}} = ${mi(-p / 2)} ± ${Math.abs(r1 - r2) / 2}$`, `$x_1 = ${klein}$, $x_2 = ${gross}$`],
    erklaer: erklaerGleichung("quadrat"),
  });
} });
reg({ id: "gl-linear", thema: "gleichungen", afb: 1, fuer: ["ausmultiplizieren", "vorzeichen"], mach() {
  const a = zz(2, 5), b = zzOhne0(-5, 5), c = zzOhne0(-6, 6), x = zzOhne0(-5, 5);
  const d = a * (x + b) - c;
  const fehler = [
    { wert: (d + c - b) / a, typ: "ausmultiplizieren", text: `Der Faktor ${a} gehört vor jeden Summanden der Klammer: $${a}(x ${sgn(b)}) = ${a}x ${sgn(a * b)}$.` },
    { wert: (d - c) / a - b, typ: "vorzeichen", text: `Beim Umstellen wird die Zahl ${c} auf beiden Seiten durch die Gegenoperation beseitigt – achte auf das Vorzeichen.` },
  ];
  return bereinigen({
    daten: { a, b, c, d, x },
    text: `Löse die Gleichung $${a}(x ${sgn(b)}) ${sgn(-c)} = ${d}$.`, typ: "zahl", wert: x, toleranz: 1e-9, fehler, abstand: 1e-6,
    hinweise: ["Was musst du zuerst tun, um das $x$ aus der Klammer zu befreien?", "Ausmultiplizieren: Jeder Summand in der Klammer wird mit dem Faktor multipliziert.", `Schreibe $${a}x ${sgn(a * b)} ${sgn(-c)} = ${d}$ und stelle dann nach $x$ um.`],
    regeln: [{ name: "Distributivgesetz" }],
    loesung: [`$${a}x ${sgn(a * b)} ${sgn(-c)} = ${d}$`, `$${a}x = ${mi(d - a * b + c)}$`, `$x = ${mi(x)}$`],
    erklaer: erklaerGleichung("linear"),
  });
} });
reg({ id: "gl-ausklammern", thema: "gleichungen", afb: 2, fuer: ["loesungsanzahl"], mach() {
  const a = zz(2, 5), m = zz(2, 7), c = a * m;
  const opt = ["Keine Lösung", "Genau eine Lösung", "Genau zwei Lösungen", "Unendlich viele Lösungen"];
  return {
    daten: { a, m, c },
    text: `Wie viele Lösungen hat die Gleichung $${a}x^2 = ${c}x$?`, typ: "wahl", optionen: opt, richtig: 2,
    fehler: [{ wahl: 1, typ: "loesungsanzahl", text: `Wenn du durch $x$ teilst, verlierst du die Lösung $x = 0$. Besser: $${a}x^2 - ${c}x = 0$, ausklammern, $x(${a}x - ${c}) = 0$.` }],
    hinweise: ["Darfst du beide Seiten einfach durch $x$ teilen? Für welches $x$ wäre das verboten?", "Bringe alles auf eine Seite, klammere aus und nutze den Satz vom Nullprodukt.", `$x(${a}x - ${c}) = 0$ ist null, wenn $x = 0$ oder $${a}x - ${c} = 0$.`],
    regeln: [{ name: "Satz vom Nullprodukt" }],
    loesung: [`$${a}x^2 - ${c}x = 0$`, `$x(${a}x - ${c}) = 0$`, `$x_1 = 0$ und $x_2 = ${m}$ – also genau zwei Lösungen.`],
    erklaer: erklaerGleichung("ausklammern"),
  };
} });

/* ---------- Brüche ---------- */
const nennerWahl = [[2, 3], [3, 4], [2, 5], [4, 6], [3, 5], [4, 5], [6, 8], [2, 7], [3, 6]];
function bruchPaar() {
  for (;;) {
    const [b, d] = wahl(nennerWahl);
    const a = zz(1, b - 1), c = zz(1, d - 1);
    if (ggT(a, b) === 1 && ggT(c, d) === 1 && b !== d) return { a, b, c, d };
  }
}
reg({ id: "bru-add", thema: "brueche", afb: 1, fuer: ["bruchaddition"], mach() {
  const { a, b, c, d } = bruchPaar();
  const z = a * d + c * b, n = b * d;
  return bereinigen({
    daten: { a, b, c, d },
    text: `Berechne $\\frac{${a}}{${b}} + \\frac{${c}}{${d}}$. Gib das Ergebnis als Bruch (z. B. 7/12) oder als Dezimalzahl mit mindestens drei Nachkommastellen an.`,
    typ: "zahl", wert: z / n, toleranz: 6e-4, eingabe: "Bruch oder Dezimalzahl",
    fehler: [{ wert: (a + c) / (b + d), typ: "bruchaddition", text: "Zähler und Nenner dürfen nicht einzeln addiert werden. Erst auf den gemeinsamen Nenner erweitern, dann nur die Zähler addieren." }],
    hinweise: ["Was müssen zwei Brüche gemeinsam haben, bevor du sie addieren kannst?", "Erweitere auf einen gemeinsamen Nenner, z. B. $b·d$. Dann addierst du nur die Zähler.", `Erweitere zu $\\frac{${a * d}}{${n}} + \\frac{${c * b}}{${n}}$ und addiere die Zähler.`],
    regeln: [REGEL_BRUCH_ADD], grundlage: GRUND_BRUCH,
    loesung: [`$\\frac{${a * d}}{${n}} + \\frac{${c * b}}{${n}} = \\frac{${z}}{${n}} = ${bruchTex(z, n)}$`],
    erklaer: erklaerBruch("add"),
  });
} });
reg({ id: "bru-div", thema: "brueche", afb: 2, fuer: ["bruchdivision"], mach() {
  const { a, b, c, d } = bruchPaar();
  const z = a * d, n = b * c;
  return bereinigen({
    daten: { a, b, c, d },
    text: `Berechne $\\frac{${a}}{${b}} : \\frac{${c}}{${d}}$. Gib das Ergebnis als Bruch (z. B. 7/12) oder als Dezimalzahl mit mindestens drei Nachkommastellen an.`,
    typ: "zahl", wert: z / n, toleranz: 6e-4, eingabe: "Bruch oder Dezimalzahl",
    fehler: [{ wert: (a * c) / (b * d), typ: "bruchdivision", text: "Beim Teilen durch einen Bruch wird mit dem Kehrwert multipliziert: $\\frac{c}{d}$ wird zu $\\frac{d}{c}$." }],
    hinweise: ["Was bedeutet es, durch einen Bruch zu teilen? Denk an $1 : \\frac{1}{2}$.", "Durch einen Bruch teilen heißt: mit dem Kehrwert malnehmen.", `Rechne $\\frac{${a}}{${b}} · \\frac{${d}}{${c}}$ und kürze, wenn möglich.`],
    regeln: [REGEL_BRUCH_DIV], grundlage: GRUND_BRUCH,
    loesung: [`$\\frac{${a}}{${b}} : \\frac{${c}}{${d}} = \\frac{${a}}{${b}} · \\frac{${d}}{${c}} = \\frac{${z}}{${n}} = ${bruchTex(z, n)}$`],
    erklaer: erklaerBruch("div"),
  });
} });

/* ---------- Terme ---------- */
reg({ id: "ter-binom", thema: "terme", afb: 1, fuer: ["mittelterm", "vorzeichen"], mach() {
  const a = zz(2, 9), minus = Math.random() < 0.5;
  const richtig = minus ? -2 * a : 2 * a;
  const fehler = [
    { wert: 0, typ: "mittelterm", text: "Das ist die häufigste Falle: $(x ± a)^2$ ist nicht $x^2 ± a^2$. Der Mittelterm $±2ax$ fehlt." },
    { wert: a, typ: "mittelterm", text: "Der Mittelterm ist das Doppelte des Produkts: $2·x·a$, nicht nur $a$." },
  ];
  if (minus) fehler.push({ wert: 2 * a, typ: "vorzeichen", text: "Bei der zweiten binomischen Formel ist der Mittelterm negativ: $(x - a)^2 = x^2 - 2ax + a^2$." });
  return bereinigen({
    daten: { a, minus },
    text: `Multipliziere aus: $(x ${minus ? "-" : "+"} ${a})^2 = x^2 + □ \\cdot x + ${a * a}$. Welche Zahl gehört in das Kästchen?`, typ: "zahl", wert: richtig, toleranz: 1e-9, fehler,
    hinweise: ["Schreibe $(x ± a)^2$ als Produkt zweier gleicher Klammern.", `${minus ? "Zweite" : "Erste"} binomische Formel: $(x ${minus ? "-" : "+"} a)^2 = x^2 ${minus ? "-" : "+"} 2ax + a^2$.`, `Hier ist $a = ${a}$. Der Mittelterm ist $${minus ? "-" : ""}2·${a}·x$.`],
    regeln: [{ name: minus ? "Zweite binomische Formel" : "Erste binomische Formel" }],
    loesung: [`$(x ${minus ? "-" : "+"} ${a})(x ${minus ? "-" : "+"} ${a}) = x^2 ${minus ? "-" : "+"} ${2 * a}x + ${a * a}$`, `Das Kästchen enthält $${mi(richtig)}$.`],
    erklaer: erklaerTerm(),
  });
} });

/* ---------- Bernoulli-Ketten ---------- */
const WAHRSCH = [0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.75];
const binom = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return Math.round(r); };
reg({ id: "ber-genau", thema: "bernoulli", afb: 1, fuer: ["binomkoeff"], mach() {
  for (;;) {
    const n = zz(4, 8), p = wahl(WAHRSCH), k = zz(1, n - 1);
    const t = binomTabelle(n, p);
    const richtig = rund(t[k], 4);
    const ohne = rund(p ** k * (1 - p) ** (n - k), 4);
    if (Math.abs(richtig - ohne) < 0.002 || richtig < 0.01 || Math.abs((t[k] * 1e4) % 1 - 0.5) < 0.03) continue;
    return bereinigen({
    daten: { n, p, k },
      text: `Ein Zufallsexperiment gelingt mit der Wahrscheinlichkeit $p = ${dez(p, 2)}$ und wird $${n}$-mal unabhängig wiederholt. Wie groß ist die Wahrscheinlichkeit für genau $${k}$ Treffer? Runde auf vier Nachkommastellen.`,
      typ: "zahl", wert: richtig, toleranz: 6e-5, eingabe: "Dezimalzahl, 4 Stellen", abstand: 1e-3,
      fehler: [{ wert: ohne, typ: "binomkoeff", text: `Es gibt mehrere Reihenfolgen, in denen die ${k} Treffer vorkommen können. Der Faktor $\\binom{${n}}{${k}} = ${binom(n, k)}$ fehlt.` }],
      hinweise: ["Wie viele Treffer und wie viele Nieten gibt es? Wie viele Reihenfolgen sind möglich?", "Bernoulli-Formel: $P(X = k) = \\binom{n}{k}·p^k·(1-p)^{n-k}$.", `Setze $n = ${n}$, $k = ${k}$, $p = ${dez(p, 2)}$ ein und rechne $\\binom{${n}}{${k}} = ${binom(n, k)}$ mit.`],
      regeln: [{ name: "Bernoulli-Formel" }, { name: "Binomialkoeffizient" }],
      loesung: [`$P(X = ${k}) = \\binom{${n}}{${k}}·${dez(p, 2)}^{${k}}·${dez(1 - p, 2)}^{${n - k}}$`, `$= ${binom(n, k)}·${dez(p ** k, 6)}·${dez((1 - p) ** (n - k), 6)} ≈ ${dez(richtig, 4)}$`],
      erklaer: erklaerBernoulli("genau"),
    });
  }
} });
reg({ id: "ber-grenze", thema: "bernoulli", afb: 2, fuer: ["ereignisgrenze"], mach() {
  for (;;) {
    const n = zz(5, 10), p = wahl(WAHRSCH), k = zz(2, n - 2);
    const c = kumuliert(binomTabelle(n, p));
    const arten = [
      { s: "mindestens", ev: `X ≥ ${k}`, w: pAb(c, k), f: pAb(c, k + 1), fs: `X ≥ ${k + 1}`, tex: `X \\ge ${k}` },
      { s: "höchstens", ev: `X ≤ ${k}`, w: pBis(c, k), f: pBis(c, k - 1), fs: `X ≤ ${k - 1}`, tex: `X \\le ${k}` },
      { s: "mehr als", ev: `X ≥ ${k + 1}`, w: pAb(c, k + 1), f: pAb(c, k), fs: `X ≥ ${k}`, tex: `X \\ge ${k + 1}` },
      { s: "weniger als", ev: `X ≤ ${k - 1}`, w: pBis(c, k - 1), f: pBis(c, k), fs: `X ≤ ${k}`, tex: `X \\le ${k - 1}` },
    ];
    const art = wahl(arten);
    const richtig = rund(art.w, 4), falsch = rund(art.f, 4);
    if (Math.abs(richtig - falsch) < 0.004 || richtig < 0.02 || richtig > 0.98 || Math.abs((art.w * 1e4) % 1 - 0.5) < 0.03) continue;
    return bereinigen({
    daten: { n, p, k, art: art.s },
      text: `Eine Bernoulli-Kette hat die Länge $n = ${n}$ und die Trefferwahrscheinlichkeit $p = ${dez(p, 2)}$. Wie groß ist die Wahrscheinlichkeit für „${art.s} ${k}“ Treffer? Runde auf vier Nachkommastellen.`,
      typ: "zahl", wert: richtig, toleranz: 6e-5, eingabe: "Dezimalzahl, 4 Stellen", abstand: 1e-3,
      fehler: [{ wert: falsch, typ: "ereignisgrenze", text: `„${art.s} ${k}“ bedeutet $${art.tex}$. Du hast mit $${art.fs.replace("≥", "\\ge").replace("≤", "\\le")}$ gerechnet – die Grenze liegt um eins daneben.` }],
      hinweise: ["Schreibe das Ereignis als Ungleichung mit $X$ auf. Gehört die Zahl selbst dazu?", "„mindestens k“ heißt $X ≥ k$, „höchstens k“ heißt $X ≤ k$, „mehr als k“ heißt $X ≥ k+1$, „weniger als k“ heißt $X ≤ k-1$.", `Das gesuchte Ereignis ist $${art.tex}$. Addiere die passenden Einzelwahrscheinlichkeiten oder nutze das Gegenereignis.`],
      regeln: [{ name: "Höchstens und mindestens" }, { name: "Gegenereignis" }],
      loesung: [`Ereignis: $${art.tex}$`, `$P(${art.tex}) ≈ ${dez(richtig, 4)}$`],
      erklaer: erklaerBernoulli("grenze"),
    });
  }
} });

/* ---------- Vektoren ---------- */
const PYTHAGORAS = [[2, 3, 6], [1, 4, 8], [2, 6, 9], [4, 4, 7], [6, 6, 7], [1, 2, 2], [2, 10, 11], [3, 4, 12]];
reg({ id: "vek-betrag", thema: "vektoren", afb: 1, fuer: ["betragswurzel"], mach() {
  const roh = wahl(PYTHAGORAS);
  const v = mischen(roh).map((x) => (Math.random() < 0.5 ? -x : x));
  const richtig = laenge(v);
  return bereinigen({
    daten: { v },
    text: `Berechne die Länge des Vektors $\\vec{v} = \\spalte{${v[0]}}{${v[1]}}{${v[2]}}$.`, typ: "zahl", wert: richtig, toleranz: 1e-6,
    fehler: [{ wert: v.reduce((s, x) => s + x * x, 0), typ: "betragswurzel", text: "Die Wurzel fehlt: $|\\vec{v}| = \\sqrt{v_1^2 + v_2^2 + v_3^2}$." },
             { wert: v.reduce((s, x) => s + Math.abs(x), 0), typ: "betragswurzel", text: "Die Länge ist nicht die Summe der Beträge, sondern $\\sqrt{v_1^2 + v_2^2 + v_3^2}$." }],
    hinweise: ["Welche Formel kennst du für die Länge eines Vektors? Denk an den Satz des Pythagoras im Raum.", "$|\\vec{v}| = \\sqrt{v_1^2 + v_2^2 + v_3^2}$", `Quadriere jede Koordinate, addiere ($${v.reduce((s, x) => s + x * x, 0)}$) und ziehe die Wurzel.`],
    regeln: [{ name: "Betrag (Länge)" }],
    loesung: [`$|\\vec{v}| = \\sqrt{${v.map((x) => klam(x) + "^2").join(" + ")}} = \\sqrt{${v.reduce((s, x) => s + x * x, 0)}} = ${richtig}$`],
    erklaer: erklaerVektor("betrag"),
  });
} });
reg({ id: "vek-ortho", thema: "vektoren", afb: 2, fuer: ["vorzeichen"], mach() {
  for (let versuch = 0; versuch < 500; versuch++) {
    const a = zz(-4, 4), b = zz(-4, 4), c = wahl([-3, -2, -1, 1, 2, 3]), d = zz(-4, 4), e = zz(-4, 4);
    const s = a * d + b * e;
    if (s === 0 || s % c !== 0) continue;
    const t = -s / c;
    return bereinigen({
    daten: { u: [a, b, c], w: [d, e, t] },
      text: `Für welchen Wert von $t$ stehen $\\vec{u} = \\spalte{${a}}{${b}}{${c}}$ und $\\vec{w} = \\spalte{${d}}{${e}}{t}$ senkrecht aufeinander?`,
      typ: "zahl", wert: t, toleranz: 1e-9,
      fehler: [{ wert: s / c, typ: "vorzeichen", text: `Prüfe das Vorzeichen: $${s} + ${c}·t = 0$ führt zu $t = -\\frac{${s}}{${c}}$.` }],
      hinweise: ["Wann sind zwei Vektoren orthogonal? Welche Rechnung gehört dazu?", "Orthogonal bedeutet: Das Skalarprodukt ist null.", `Berechne $\\vec{u} · \\vec{w} = ${a}·${klam(d)} + ${b}·${klam(e)} + ${c}·t$ und setze es gleich 0.`],
      regeln: [{ name: "Orthogonalität" }, { name: "Skalarprodukt" }],
      loesung: [`$\\vec{u} · \\vec{w} = ${s} ${c < 0 ? "-" : "+"} ${Math.abs(c)}·t = 0$`, `$t = ${mi(t)}$`],
      erklaer: erklaerVektor("ortho"),
    });
  }
  return this.mach();
} });
reg({ id: "vek-geradeebene", thema: "vektoren", afb: 3, fuer: ["normalenwinkel"], mach() {
  for (let versuch = 0; versuch < 800; versuch++) {
    const u = [zz(-3, 3), zz(-3, 3), zz(-3, 3)], n = [zz(-3, 3), zz(-3, 3), zz(-3, 3)];
    if (u.every((x) => x === 0) || n.every((x) => x === 0)) continue;
    const phi = winkelGeradeEbene(u, n);
    if (!(phi > 8 && phi < 82) || Math.abs(phi - 45) < 6) continue;
    const richtig = rund(phi, 1);
    const zumNormalen = Math.min(winkelZwischen(u, n), 180 - winkelZwischen(u, n));
    return bereinigen({
    daten: { u, n },
      text: `Eine Gerade mit Richtungsvektor $\\vec{u} = \\spalte{${u[0]}}{${u[1]}}{${u[2]}}$ trifft eine Ebene mit Normalenvektor $\\vec{n} = \\spalte{${n[0]}}{${n[1]}}{${n[2]}}$. Unter welchem Winkel schneidet die Gerade die Ebene? Gib den spitzen Winkel in Grad an, auf eine Nachkommastelle gerundet.`,
      typ: "zahl", wert: richtig, toleranz: 0.11, einheit: "°", eingabe: "Grad, eine Nachkommastelle", abstand: 1,
      fehler: [{ wert: rund(zumNormalen, 1), typ: "normalenwinkel", text: "Das ist der Winkel zwischen Gerade und Normalenvektor. Der Schnittwinkel mit der Ebene ist $90° - $ dieser Winkel, also rechne mit dem Sinus." }],
      hinweise: ["Zwischen welchen beiden Objekten misst du den Winkel – Gerade und Ebene oder Gerade und Normalenvektor?", "$\\sin φ = \\frac{|\\vec{u} · \\vec{n}|}{|\\vec{u}|·|\\vec{n}|}$ für den Winkel zwischen Gerade und Ebene.", `Berechne $\\vec{u}·\\vec{n} = ${skalar(u, n)}$, $|\\vec{u}| ≈ ${dez(laenge(u), 3)}$, $|\\vec{n}| ≈ ${dez(laenge(n), 3)}$ und wende $arcsin$ an.`],
      regeln: [{ name: "Winkel Gerade–Ebene" }, { name: "Skalarprodukt" }],
      loesung: [`$\\sin φ = \\frac{|${skalar(u, n)}|}{${dez(laenge(u), 3)}·${dez(laenge(n), 3)}}$`, `$φ ≈ ${dez(richtig, 1)}°$`],
      erklaer: erklaerVektor("winkel"),
    });
  }
  return this.mach();
} });

/* ---------- Integrale ---------- */
reg({ id: "int-grenzen", thema: "integrale", afb: 1, fuer: ["grenzen", "stammfunktion", "vorzeichen"], mach() {
  for (;;) {
    const c2 = wahl([1, 2, 3, 6, -3]), c1 = zz(-4, 4), c0 = zz(-3, 3);
    const p = [q(c0), q(c1), q(c2)];
    let a = zz(-2, 2), b = zz(a + 1, 3);
    if (a >= b) continue;
    const F = pInt(p);
    const wertQ = qSub(pAus(F, q(b)), pAus(F, q(a)));
    const w = qNum(wertQ);
    const Fb = qNum(pAus(F, q(b)));
    const pAbl = [q(c1), q(2 * c2)];
    const ableit = pNum(pAbl, b) - pNum(pAbl, a);
    const fehler = [
      { wert: Fb, typ: "grenzen", text: "Du hast nur die obere Grenze eingesetzt. Es gilt $F(b) - F(a)$: Beide Grenzen einsetzen und subtrahieren." },
      { wert: -w, typ: "vorzeichen", text: "Die Reihenfolge der Grenzen ist vertauscht: obere Grenze minus untere Grenze, also $F(b) - F(a)$." },
      { wert: ableit, typ: "stammfunktion", text: "Das ist die Rechnung mit der Ableitung. Gesucht ist eine Stammfunktion: Exponent um 1 erhöhen und durch den neuen Exponenten teilen." },
    ];
    const poly = polyTex(p);
    return bereinigen({
    daten: { c0, c1, c2, a, b },
      text: `Berechne $\\int_{${a}}^{${b}} (${poly}) \\, dx$. Gib das Ergebnis als Bruch (z. B. 7/3) oder als Dezimalzahl mit mindestens drei Nachkommastellen an.`,
      typ: "zahl", wert: w, toleranz: 6e-4, eingabe: "Bruch oder Dezimalzahl", fehler,
      hinweise: ["Wie kommt man von einer Funktion zu ihrer Stammfunktion? Und was sagt der Hauptsatz?", "Potenzregel rückwärts: $\\int x^n dx = \\frac{x^{n+1}}{n+1}$. Hauptsatz: $\\int_a^b f(x) dx = F(b) - F(a)$.", `Bilde die Stammfunktion Term für Term, setze dann zuerst $x = ${b}$ und danach $x = ${a}$ ein und subtrahiere.`],
      regeln: [{ name: "Potenzregel rückwärts" }, { name: "Hauptsatz" }],
      loesung: [`$F(x) = \\frac{${c2}}{3}x^3 + \\frac{${c1}}{2}x^2 + ${c0}x$`, `$F(${b}) - F(${a}) = ${qTexS(wertQ)}$`],
      erklaer: erklaerIntegral("grenzen"),
    });
  }
} });
reg({ id: "int-flaeche", thema: "integrale", afb: 2, fuer: ["flaechenvorzeichen"], mach() {
  for (let v = 0; v < 300; v++) {
    const { p, nst, a, b } = neueFlaechenAufgabe();
    const nstZ = nst.map(qNum);
    if (!nstZ.some((r) => r > a && r < b)) continue;
    const fl = flaeche(p, q(a), q(b), nst);
    const w = qNum(fl.A), s = qNum(fl.I);
    if (Math.abs(w - s) < 0.05 || w > 60) continue;
    return bereinigen({
    daten: { p, a, b },
      text: `Die Funktion $f$ mit $f(x) = ${polyTex(p)}$ schließt zwischen $x = ${a}$ und $x = ${b}$ mit der $x$-Achse Flächen ein. Berechne den Flächeninhalt. Gib das Ergebnis als Bruch oder als Dezimalzahl mit mindestens drei Nachkommastellen an.`,
      typ: "zahl", wert: w, toleranz: 6e-4, eingabe: "Bruch oder Dezimalzahl",
      fehler: [{ wert: s, typ: "flaechenvorzeichen", text: "Das ist die Flächenbilanz. Wo der Graph unter der $x$-Achse liegt, zählt das Integral negativ. Rechne bei jedem Teilstück mit dem Betrag." }],
      hinweise: ["Liegt der Graph im ganzen Intervall auf einer Seite der x-Achse? Woran erkennst du das?", "Bestimme die Nullstellen im Intervall, zerlege dort das Integral und addiere die Beträge der Teilintegrale.", `Die Nullstellen im Intervall sind ${nstZ.filter((r) => r > a && r < b).map(mi).join(" und ")}. Integriere je Teilintervall getrennt.`],
      regeln: [{ name: "Hauptsatz" }, { name: "Fläche zwischen Graphen" }],
      loesung: [`Flächeninhalt = Summe der Beträge der Teilintegrale`, `$A = ${qTexS(fl.A)} ≈ ${dez(w, 4)}$`],
      erklaer: erklaerIntegral("flaeche"),
    });
  }
  return GENERATOREN.find((g) => g.id === "int-grenzen").mach();
} });
function polyTex(p) {
  const teile = [];
  for (let i = p.length - 1; i >= 0; i--) {
    const c = p[i];
    if (c.z === 0) continue;
    const betrag = qTexS({ z: Math.abs(c.z), n: c.n });
    const kopf = c.z < 0 ? "-" : teile.length ? "+" : "";
    const koeff = i > 0 && c.n === 1 && Math.abs(c.z) === 1 ? "" : betrag;
    const pot = i === 0 ? "" : i === 1 ? "x" : `x^{${i}}`;
    teile.push(`${kopf}${teile.length ? " " : ""}${koeff}${pot}`);
  }
  return teile.join(" ") || "0";
}

/* ---------- Kurvendiskussion ---------- */
reg({ id: "kur-wende", thema: "kurven", afb: 2, fuer: ["ableitungsstufe"], mach() {
  for (;;) {
    const r1 = zz(-3, 5), r2 = zz(-3, 5);
    if (r1 === r2 || (r1 + r2) % 2 !== 0) continue;
    const b = (-3 * (r1 + r2)) / 2, c = 3 * r1 * r2;
    const xw = (r1 + r2) / 2;
    return bereinigen({
    daten: { b, c, xw },
      text: `Gegeben ist $f(x) = x^3 ${tm(b, "x^2")} ${tm(c, "x")}$. Bestimme die $x$-Koordinate des Wendepunkts.`, typ: "zahl", wert: xw, toleranz: 1e-9, abstand: 1e-6,
      fehler: [{ wert: r1, typ: "ableitungsstufe", text: "Du hast $f′(x) = 0$ gelöst – das liefert Kandidaten für Extremstellen. Für Wendestellen löst du $f″(x) = 0$." },
               { wert: r2, typ: "ableitungsstufe", text: "Du hast $f′(x) = 0$ gelöst – das liefert Kandidaten für Extremstellen. Für Wendestellen löst du $f″(x) = 0$." }],
      hinweise: ["Wendestelle oder Extremstelle? Welche Ableitung musst du dafür gleich null setzen?", "Notwendig für eine Wendestelle: $f″(x) = 0$. Hinreichend: $f″$ wechselt dort das Vorzeichen (oder $f‴(x) ≠ 0$).", `Berechne $f″(x) = 6x ${sgn(2 * b)}$ und setze sie gleich 0.`],
      regeln: [{ name: "Wendepunkt" }],
      loesung: [`$f′(x) = 3x^2 ${tm(2 * b, "x")} ${sgn(c)}$`, `$f″(x) = 6x ${sgn(2 * b)}$`, `$f″(x) = 0 \\Rightarrow x = ${mi(xw)}$; $f‴ = 6 ≠ 0$ – also Wendestelle.`],
      erklaer: erklaerKurve("wende"),
    });
  }
} });
reg({ id: "kur-nachweis", thema: "kurven", afb: 3, fuer: ["nachweis"], mach() {
  const vari = wahl([1, 2, 3]);
  if (vari === 1) {
    const a = wahl([1, 2, -1]);
    return {
      text: `Für $f(x) = ${koef(a)}x^3$ gilt $f′(0) = 0$ und $f″(0) = 0$. Welche Aussage ist richtig?`, typ: "wahl",
      optionen: ["Bei $x = 0$ liegt ein Tiefpunkt, weil $f′(0) = 0$ ist.", "Bei $x = 0$ liegt kein Extrempunkt, weil $f′$ dort das Vorzeichen nicht wechselt.", "Bei $x = 0$ liegt ein Hochpunkt, weil $f″(0) = 0$ ist.", "Man kann ohne weitere Rechnung nichts sagen, also gibt es sicher einen Extrempunkt."],
      richtig: 1,
      fehler: [{ wahl: 0, typ: "nachweis", text: "$f′(x) = 0$ ist nur notwendig. Ob ein Extremum vorliegt, entscheidet erst ein hinreichendes Kriterium, z. B. der Vorzeichenwechsel von $f′$." },
               { wahl: 2, typ: "nachweis", text: "$f″(0) = 0$ sagt nichts über Hoch- oder Tiefpunkt. Das Kriterium $f″ ≠ 0$ ist hier nicht anwendbar." },
               { wahl: 3, typ: "nachweis", text: "Auch wenn das $f″$-Kriterium versagt, kann man den Vorzeichenwechsel von $f′$ prüfen: $f′(x) = " + `${3 * a}x^2` + "$ ändert das Vorzeichen nicht." }],
      hinweise: ["Reicht $f′(0) = 0$ allein als Nachweis eines Extrempunkts?", "Hinreichend: $f′$ wechselt das Vorzeichen, oder $f′(x_0) = 0$ und $f″(x_0) ≠ 0$.", `Untersuche $f′(x) = ${3 * a}x^2$ links und rechts von 0.`],
      regeln: [{ name: "Extrempunkt" }],
      loesung: [`$f′(x) = ${3 * a}x^2$ hat links und rechts von 0 dasselbe Vorzeichen.`, `Kein Vorzeichenwechsel: kein Extrempunkt, sondern ein Sattelpunkt.`],
      erklaer: erklaerKurve("nachweis"),
    };
  }
  if (vari === 2) {
    return {
      text: "Für $f(x) = x^4$ gilt $f′(0) = 0$ und $f″(0) = 0$. Welche Aussage ist richtig?", typ: "wahl",
      optionen: ["Bei $x = 0$ liegt kein Extrempunkt, weil $f″(0) = 0$ ist.", "Bei $x = 0$ liegt ein Tiefpunkt, weil $f′$ dort von negativ zu positiv wechselt.", "Bei $x = 0$ liegt ein Wendepunkt, weil $f″(0) = 0$ ist.", "Bei $x = 0$ liegt ein Hochpunkt, weil $f′(0) = 0$ ist."],
      richtig: 1,
      fehler: [{ wahl: 0, typ: "nachweis", text: "$f″(0) = 0$ heißt nur: Dieses Kriterium entscheidet nicht. $f′(x) = 4x^3$ wechselt aber bei 0 von − nach +." },
               { wahl: 2, typ: "nachweis", text: "Für eine Wendestelle muss $f″$ das Vorzeichen wechseln. $f″(x) = 12x^2$ bleibt aber ≥ 0." },
               { wahl: 3, typ: "nachweis", text: "$f′ = 0$ allein unterscheidet nicht zwischen Hoch- und Tiefpunkt. Prüfe den Vorzeichenwechsel." }],
      hinweise: ["Was passiert, wenn das $f″$-Kriterium nicht entscheidet? Welches Kriterium bleibt?", "Vorzeichenwechsel von $f′$: von − nach + ergibt einen Tiefpunkt, von + nach − einen Hochpunkt.", "Berechne $f′(-1)$ und $f′(1)$."],
      regeln: [{ name: "Extrempunkt" }, { name: "Wendepunkt" }],
      loesung: ["$f′(x) = 4x^3$: $f′(-1) = -4 < 0$, $f′(1) = 4 > 0$.", "Vorzeichenwechsel von − nach +: Tiefpunkt in $x = 0$."],
      erklaer: erklaerKurve("nachweis"),
    };
  }
  const h = zz(-3, 3), k = zz(-4, 4), w = wahl([1, 2, 3]);
  const klammer = h === 0 ? "x" : `(x ${sgn(-h)})`;
  return {
    text: `Der Graph von $f(x) = -${w === 1 ? "" : w}${klammer}^2 ${sgn(k)}$ ist eine nach unten geöffnete Parabel. An der Stelle $x = ${h}$ gilt $f′(${h}) = 0$ und $f″(${h}) = ${-2 * w}$. Welche Folgerung ist richtig?`, typ: "wahl",
    optionen: ["Tiefpunkt, weil $f″ ≠ 0$ ist.", `Hochpunkt, weil $f′ = 0$ und $f″ < 0$ ist.`, "Sattelpunkt, weil $f″ ≠ 0$ ist.", "Kein Extrempunkt, weil $f″ < 0$ ist."],
    richtig: 1,
    fehler: [{ wahl: 0, typ: "nachweis", text: "Das Vorzeichen von $f″$ entscheidet: $f″ > 0$ ergibt einen Tiefpunkt, $f″ < 0$ einen Hochpunkt." },
             { wahl: 2, typ: "nachweis", text: "Ein Sattelpunkt hat $f″ = 0$. Hier ist $f″ ≠ 0$, also liegt ein Extrempunkt vor." },
             { wahl: 3, typ: "nachweis", text: "Mit $f′ = 0$ und $f″ ≠ 0$ ist ein Extremum nachgewiesen. Das Vorzeichen von $f″$ sagt, welche Art." }],
    hinweise: ["Welche beiden Bedingungen zusammen reichen für einen Extrempunkt?", "$f′(x_0) = 0$ und $f″(x_0) < 0$ ergibt einen Hochpunkt, $f″(x_0) > 0$ einen Tiefpunkt.", "Lies das Vorzeichen von $f″$ in der Aufgabe ab."],
    regeln: [{ name: "Extrempunkt" }],
    loesung: [`$f′(${h}) = 0$ und $f″(${h}) = ${-2 * w} < 0$`, "Hinreichendes Kriterium erfüllt: Hochpunkt."],
    erklaer: erklaerKurve("kriterium"),
  };
} });

/* ======================================================================
   Aufgaben erzeugen und prüfen
   ====================================================================== */
export function neueAufgabe(generatorId, varianteVon) {
  const g = typeof generatorId === "string" ? GENERATOREN.find((x) => x.id === generatorId) : generatorId;
  const a = g.mach.call(g);
  a.id = neuId(); a.thema = g.thema; a.variante = g.id; a.afb = g.afb;
  a.punkte = g.afb === 1 ? 2 : g.afb === 2 ? 3 : 4;
  a.sekunden = a.typ === "wahl" ? 90 : g.afb === 1 ? 90 : g.afb === 2 ? 150 : 210;
  a.fuer = g.fuer;
  return a;
}
export const generatorenZu = (thema) => GENERATOREN.filter((g) => g.thema === thema);
export const generatorenFuerFehler = (typ) => GENERATOREN.filter((g) => g.fuer.includes(typ));

/* Bewertet die Eingabe: { ok, typ (Fehlertyp oder null), text (Rückmeldung), roh } */
export function pruefeAntwort(a, eingabe) {
  if (a.typ === "wahl") {
    if (eingabe === null || eingabe === undefined || eingabe === "") return { ok: false, leer: true };
    const i = Number(eingabe);
    if (i === a.richtig) return { ok: true };
    const f = a.fehler.find((x) => x.wahl === i);
    return { ok: false, typ: f ? f.typ : null, text: f ? f.text : "Das passt noch nicht. Prüfe die Aussage Schritt für Schritt." };
  }
  const v = lies(eingabe);
  if (v === null) return { ok: false, leer: String(eingabe || "").trim() === "", ungueltig: String(eingabe || "").trim() !== "" };
  if (Math.abs(v - a.wert) <= a.toleranz + 1e-12) return { ok: true, wert: v };
  const f = a.fehler.find((x) => Math.abs(x.wert - v) <= a.toleranz + 1e-9);
  return { ok: false, wert: v, typ: f ? f.typ : null, text: f ? f.text : "Das passt noch nicht. Prüfe die Rechnung noch einmal oder öffne „Ich hänge fest“." };
}

/* Zahl lesen: Bruch a/b, Dezimalzahl mit Komma oder Punkt, Minus auch als „−“ */
export function lies(s) {
  const t = String(s ?? "").replace(/−/g, "-").replace(/\s/g, "").replace(/°$/, "");
  if (!t) return null;
  const m = t.match(/^(-?\d+(?:[.,]\d+)?)\/(-?\d+(?:[.,]\d+)?)$/);
  if (m) { const z = Number(m[1].replace(",", ".")), n = Number(m[2].replace(",", ".")); return n === 0 ? null : z / n; }
  if (!/^-?\d+([.,]\d+)?$/.test(t)) return null;
  const v = Number(t.replace(",", "."));
  return isFinite(v) ? v : null;
}

/* ======================================================================
   Erklär deinen Schritt – feste, fachlich geprüfte Kriterien (ohne KI)
   Jedes Kriterium: { id, text (was zu nennen ist), muster (Stichwörter), rueckfrage }
   ====================================================================== */
const K = (id, text, muster, rueckfrage) => ({ id, text, muster, rueckfrage });
function erklaerAbleiten(art) {
  const basis = { frage: "Erkläre in ein bis zwei Sätzen, wie du die Ableitung gebildet hast.", kriterien: [] };
  if (art === "potenz") basis.kriterien = [K("regel", "Die Potenzregel nennen", ["potenzregel", "exponent", "hochzahl", "n\\s*[·*]?\\s*x", "runter", "nach vorn", "vorne"], "Welche Regel hast du für den Term mit x² bzw. xⁿ benutzt?"), K("expo", "Sagen, was mit dem Exponenten passiert", ["um 1", "eins", "verkleiner", "minus 1", "-\\s*1", "kleiner", "sinkt"], "Was passiert mit dem Exponenten, nachdem er als Faktor nach vorn gewandert ist?")];
  else if (art === "kette") basis.kriterien = [K("regel", "Die Kettenregel nennen", ["kettenregel", "innere", "äußere", "aeussere", "verkettet"], "Welche Regel brauchst du, wenn in der Klammer mehr als nur x steht?"), K("innen", "Die innere Ableitung nennen", ["innere ableitung", "nachdifferenzier", "mal die ableitung", "ableitung der klammer", "ableitung von der klammer", "innen"], "Womit musst du die äußere Ableitung multiplizieren, und wie groß ist dieser Faktor hier?")];
  else basis.kriterien = [K("regel", "Die e-Funktion nennen", ["e-funktion", "e hoch", "e\\^", "exponential", "bleibt"], "Was passiert mit e^(kx) beim Ableiten?"), K("innen", "Die innere Ableitung des Exponenten nennen", ["innere", "kettenregel", "exponent", "vorfaktor", "faktor"], "Welcher Faktor kommt wegen des Terms im Exponenten dazu?")];
  return basis;
}
function erklaerGleichung(art) {
  const k = { quadrat: [K("verfahren", "Das Lösungsverfahren nennen (pq-Formel, Mitternachtsformel oder Faktorisieren)", ["pq", "mitternacht", "abc", "faktor", "nullprodukt", "satz vom", "quadratisch ergänz"], "Welches Verfahren hast du benutzt, und warum passt es zu dieser Gleichung?"), K("probe", "Eine Probe oder Kontrolle erwähnen", ["probe", "einsetz", "kontroll", "prüf", "pruef"], "Wie kannst du überprüfen, dass dein Ergebnis wirklich eine Lösung ist?")],
    linear: [K("klammer", "Das Ausmultiplizieren der Klammer nennen", ["ausmultipl", "klammer", "distributiv", "verteil"], "Was hast du zuerst mit der Klammer gemacht?"), K("umstellen", "Das Umstellen nach x beschreiben", ["umstell", "auf beiden seiten", "beide seiten", "addier", "subtrahier", "dividier", "teil"], "Welche Rechenoperationen hast du auf beiden Seiten ausgeführt?")],
    ausklammern: [K("nullprodukt", "Den Satz vom Nullprodukt oder Ausklammern nennen", ["nullprodukt", "ausklammer", "faktor", "produkt ist null", "produkt null"], "Was darfst du bei einem Produkt, das null ergibt, schließen?"), K("teilen", "Erklären, warum man nicht durch x teilt", ["durch x", "teilen", "dividier", "verloren", "verlier", "null", "0"], "Welche Lösung würdest du verlieren, wenn du beide Seiten durch x teilst?")] };
  return { frage: "Erkläre in ein bis zwei Sätzen, wie du zur Lösung gekommen bist.", kriterien: k[art] };
}
function erklaerBruch(art) {
  return art === "add"
    ? { frage: "Erkläre, wie du die beiden Brüche addiert hast.", kriterien: [K("nenner", "Den gemeinsamen Nenner nennen", ["gemeinsamen nenner", "gleichnamig", "erweiter", "hauptnenner", "nenner"], "Was musst du mit den Nennern tun, bevor du addierst?"), K("zaehler", "Nur die Zähler addieren", ["zähler", "zaehler", "nur die zähler", "oben"], "Was passiert mit dem Nenner, wenn du die Zähler addierst?")] }
    : { frage: "Erkläre, wie du durch den Bruch geteilt hast.", kriterien: [K("kehrwert", "Den Kehrwert nennen", ["kehrwert", "umdreh", "stürz", "stuerz", "invers"], "Wie verwandelst du das Teilen durch einen Bruch in eine Multiplikation?"), K("mal", "Das Multiplizieren und Kürzen erwähnen", ["mal", "multipl", "kürz", "kuerz"], "Was rechnest du mit dem Kehrwert, und kannst du am Ende noch kürzen?")] };
}
function erklaerTerm() {
  return { frage: "Erkläre, wie du den Mittelterm bestimmt hast.", kriterien: [K("formel", "Die binomische Formel nennen", ["binomisch", "formel", "(x\\s*[+-]\\s*a)"], "Welche binomische Formel gehört zu diesem Term?"), K("mittel", "Den Mittelterm als Doppeltes Produkt beschreiben", ["doppelte", "2\\s*[·*]?\\s*a", "zweimal", "2ax", "mittelterm", "produkt"], "Wie entsteht der Mittelterm aus den beiden Gliedern der Klammer?")] };
}
function erklaerBernoulli(art) {
  return art === "genau"
    ? { frage: "Erkläre, wie sich die Wahrscheinlichkeit zusammensetzt.", kriterien: [K("pfad", "Die Anzahl der Pfade (Binomialkoeffizient) nennen", ["binomial", "pfade", "reihenfolge", "über", "n über k", "anzahl"], "Auf wie viele Arten können die Treffer auf die Versuche verteilt sein?"), K("potenz", "Treffer- und Nieten-Wahrscheinlichkeit nennen", ["p\\^", "nieten", "gegenwahrscheinlichkeit", "1-p", "1 - p", "treffer"], "Mit welcher Wahrscheinlichkeit tritt eine einzelne Reihenfolge auf?")] }
    : { frage: "Erkläre, wie du das Ereignis aufgeschrieben und berechnet hast.", kriterien: [K("ungleichung", "Das Ereignis als Ungleichung angeben", ["x\\s*[≥≤<>]", "ungleichung", "mindestens", "höchstens", "mehr als", "weniger als"], "Wie lautet das Ereignis als Ungleichung mit X?"), K("grenze", "Die Grenze genau begründen", ["dazu", "eingeschlossen", "gehört", "selbst", "\\+\\s*1", "-\\s*1", "um eins", "grenze"], "Gehört die Zahl k selbst zum Ereignis? Was bedeutet das für die Grenze?")] };
}
function erklaerVektor(art) {
  if (art === "betrag") return { frage: "Erkläre, wie du die Länge berechnet hast.", kriterien: [K("formel", "Die Formel nennen (Quadrate addieren, Wurzel)", ["wurzel", "quadrat", "pythagoras", "√"], "Welche Rechenschritte führen von den Koordinaten zur Länge?")] };
  if (art === "ortho") return { frage: "Erkläre, wie du t bestimmt hast.", kriterien: [K("skalar", "Das Skalarprodukt nennen", ["skalarprodukt", "skalar"], "Welche Rechnung zwischen den beiden Vektoren muss null ergeben?"), K("null", "Die Bedingung „Skalarprodukt gleich null“ nennen", ["null", "= 0", "=0", "orthogonal", "senkrecht"], "Was muss für das Skalarprodukt gelten, damit die Vektoren senkrecht stehen?")] };
  return { frage: "Erkläre, wie du den Winkel berechnet hast.", kriterien: [K("formel", "Sinus bzw. arcsin nennen", ["sinus", "sin", "arcsin"], "Welche Winkelfunktion gehört zum Winkel zwischen Gerade und Ebene?"), K("normal", "Den Zusammenhang mit dem Normalenvektor erwähnen", ["normalen", "90", "senkrecht", "komplement"], "Wie hängt der Winkel zur Ebene mit dem Winkel zum Normalenvektor zusammen?")] };
}
function erklaerIntegral(art) {
  return art === "grenzen"
    ? { frage: "Erkläre, wie du das Integral berechnet hast.", kriterien: [K("stamm", "Die Stammfunktion nennen", ["stammfunktion", "aufleit", "potenzregel", "exponent", "erhöh"], "Wie bist du von f zu einer Stammfunktion F gekommen?"), K("grenzen", "F(b) − F(a) nennen", ["f\\(b\\)", "obere", "untere", "grenzen", "einsetz", "hauptsatz", "differenz"], "Was machst du mit der oberen und der unteren Grenze?")] }
    : { frage: "Erkläre, warum du die Fläche in Teile zerlegt hast.", kriterien: [K("nullstellen", "Die Nullstellen als Teilungsstellen nennen", ["nullstelle", "teil", "zerleg", "intervall"], "Wo musst du das Intervall teilen und warum?"), K("betrag", "Den Betrag der Teilintegrale erwähnen", ["betrag", "negativ", "unter der", "vorzeichen", "positiv"], "Was passiert mit Flächen unterhalb der x-Achse im Integral, und wie korrigierst du das?")] };
}
function erklaerKurve(art) {
  return art === "wende"
    ? { frage: "Erkläre, wie du die Wendestelle bestimmt hast.", kriterien: [K("zweite", "Die zweite Ableitung nennen", ["zweite ableitung", "f″", "f''", "f\\s*″", "krümmung", "kruemmung"], "Welche Ableitung musst du gleich null setzen, um eine Wendestelle zu finden?"), K("nachweis", "Den Nachweis (Vorzeichenwechsel oder f‴ ≠ 0) erwähnen", ["vorzeichenwechsel", "dritte", "f‴", "f'''", "hinreichend", "≠\\s*0", "ungleich"], "Reicht f″ = 0 allein schon aus? Was musst du noch prüfen?")] }
    : { frage: "Begründe deine Wahl in ein bis zwei Sätzen.", kriterien: [K("notwendig", "Sagen, dass f′ = 0 allein nicht genügt (notwendig, nicht hinreichend)", ["notwendig", "hinreichend", "reicht nicht", "genügt nicht", "alleine", "allein"], "Reicht f′(x) = 0 schon aus, um einen Extrempunkt zu belegen?"), K("vzw", "Den Vorzeichenwechsel von f′ oder das Vorzeichen von f″ nennen", ["vorzeichenwechsel", "vorzeichen", "f″", "f''", "wechsel", "links und rechts"], "Welche Prüfung entscheidet, ob wirklich ein Extrempunkt vorliegt?")] };
}

/* Bewertet eine schriftliche Erklärung gegen die Kriterien.
   Rückgabe: { erfuellt: [Kriterium], offen: [Kriterium], rueckfrage } */
export function pruefeErklaerung(kriterien, text) {
  const t = String(text || "").toLowerCase();
  const erfuellt = [], offen = [];
  for (const k of kriterien) (k.muster.some((m) => new RegExp(m, "i").test(t)) ? erfuellt : offen).push(k);
  return { erfuellt, offen, rueckfrage: offen[0] ? offen[0].rueckfrage : null };
}

/* ======================================================================
   Auswertung: Fehler beobachten, Typen absichern, Fortschritt zählen
   ====================================================================== */
export const MIN_BEOBACHTUNGEN = 3;   // erst ab drei Beobachtungen gilt ein Typ als wiederkehrend
export const MIN_TAGE = 2;            // … verteilt auf mindestens zwei verschiedene Tage
const tagVon = (ts) => Math.floor(ts / 86400000);

export function leereDaten() {
  return { beobachtungen: [], ausgeblendet: [], themen: {}, fortschritt: {}, pruefungen: [], klausuren: [], rueckmeldungen: [], zuletzt: null };
}
export function normiere(T) {
  const d = { ...leereDaten(), ...(T || {}) };
  d.beobachtungen = Array.isArray(d.beobachtungen) ? d.beobachtungen : [];
  d.rueckmeldungen = Array.isArray(d.rueckmeldungen) ? d.rueckmeldungen : [];
  return d;
}

/* Status eines Fehlertyps: "keine" | "einzeln" | "wiederkehrend" */
export function typStatus(T, typ) {
  const b = (T.beobachtungen || []).filter((x) => x.typ === typ);
  if (!b.length) return { status: "keine", n: 0 };
  const tage = new Set(b.map((x) => tagVon(x.zeit))).size;
  if (b.length >= MIN_BEOBACHTUNGEN && tage >= MIN_TAGE) return { status: "wiederkehrend", n: b.length, tage };
  return { status: "einzeln", n: b.length, tage };
}
export const wiederkehrende = (T) => FEHLER_IDS
  .map((id) => ({ id, ...typStatus(T, id) }))
  .filter((x) => x.status === "wiederkehrend" && !(T.ausgeblendet || []).includes(x.id))
  .sort((a, b) => b.n - a.n);
export const einzelne = (T) => FEHLER_IDS
  .map((id) => ({ id, ...typStatus(T, id) }))
  .filter((x) => x.status === "einzeln" && !(T.ausgeblendet || []).includes(x.id))
  .sort((a, b) => b.n - a.n);

/* Wiederholungsabstände je Thema (Tage): wächst mit jeder richtigen Antwort ohne Hilfe, fällt bei Fehlern */
const ABSTAENDE = [1, 2, 4, 8, 16, 30];
export function themaAktualisieren(T, thema, ok, hilfe, zeit = Date.now()) {
  const s = T.themen[thema] || { n: 0, ok: 0, stufe: 0, zuletzt: 0, faellig: 0 };
  s.n += 1; s.zuletzt = zeit;
  if (ok) { s.ok += 1; s.stufe = hilfe === 0 ? Math.min(ABSTAENDE.length - 1, s.stufe + 1) : s.stufe; }
  else s.stufe = Math.max(0, s.stufe - 1);
  s.faellig = zeit + ABSTAENDE[s.stufe] * 86400000;
  T.themen[thema] = s;
  T.zuletzt = thema;
}

/* Fortschritt je Thema: getrennt nach Art der Bearbeitung (hilfe: 0 = keine, 1–3 = Hinweisstufe, 4 = Lösung gezeigt) */
export function fortschrittBuchen(T, a, ok, hilfe, quelle) {
  if (!ok) return;
  const f = T.fortschritt[a.thema] || { anleitung: 0, hinweise: 0, ohneHilfe: 0, transfer: 0, pruefung: 0, varianten: [] };
  if (hilfe >= 4) f.anleitung += 1;
  else if (hilfe >= 1) f.hinweise += 1;
  else {
    f.ohneHilfe += 1;
    if (quelle === "pruefung") f.pruefung = (f.pruefung || 0) + 1;
    if (f.varianten.length && !f.varianten.includes(a.variante)) f.transfer += 1;
    if (!f.varianten.includes(a.variante)) f.varianten.push(a.variante);
  }
  T.fortschritt[a.thema] = f;
}

/* Beobachtung eintragen (höchstens 300 gespeichert, älteste fallen weg) */
export function beobachte(T, typ, thema, quelle, zeit = Date.now()) {
  if (!typ || !FEHLERTYPEN[typ]) return;
  T.beobachtungen.push({ id: `${zeit}-${T.beobachtungen.length}`, typ, thema, quelle, zeit });
  if (T.beobachtungen.length > 300) T.beobachtungen.splice(0, T.beobachtungen.length - 300);
}

/* Aufgabenauswahl für „5 Minuten Mathe“: Grundlagen, zuletzt bearbeitetes Thema, wiederkehrender Fehler, fällige Wiederholung */
export function warmupAuswahl(T, anzahl = 5, jetzt = Date.now()) {
  const gewaehlt = [];
  const nimm = (generatoren) => {
    const frei = generatoren.filter((g) => !gewaehlt.some((x) => x.id === g.id));
    if (!frei.length) return;
    gewaehlt.push(wahl(frei));
  };
  const grundThemen = THEMA_IDS.filter((t) => THEMEN[t].grund);
  nimm(GENERATOREN.filter((g) => grundThemen.includes(g.thema) && g.afb === 1));
  const w = wiederkehrende(T)[0];
  if (w) nimm(generatorenFuerFehler(w.id));
  if (T.zuletzt && THEMEN[T.zuletzt]) nimm(generatorenZu(T.zuletzt));
  const faellig = THEMA_IDS.filter((t) => T.themen[t] && T.themen[t].faellig <= jetzt).sort((a, b) => T.themen[a].faellig - T.themen[b].faellig);
  for (const t of faellig) { if (gewaehlt.length >= anzahl) break; nimm(generatorenZu(t)); }
  const geuebt = THEMA_IDS.filter((t) => T.themen[t]);
  const neu = THEMA_IDS.filter((t) => !T.themen[t]);
  while (gewaehlt.length < anzahl) {
    const vorher = gewaehlt.length;
    nimm(GENERATOREN.filter((g) => (neu.length ? neu : geuebt).includes(g.thema) && g.afb <= 2));
    if (gewaehlt.length === vorher) nimm(GENERATOREN);
    if (gewaehlt.length === vorher) break;
  }
  return mischen(gewaehlt).slice(0, anzahl);
}

/* Aufgaben für den Prüfungsmodus: Themenblock, Schwierigkeit, grobe Dauer */
export const SCHWIERIGKEIT = { leicht: [1, 1, 2], mittel: [1, 2, 2, 3], schwer: [2, 3, 3] };
export function pruefungAuswahl(themen, schwierigkeit, anzahl) {
  const afbs = SCHWIERIGKEIT[schwierigkeit] || SCHWIERIGKEIT.mittel;
  const pool = GENERATOREN.filter((g) => themen.includes(g.thema));
  const gewaehlt = [];
  for (let i = 0; i < anzahl && pool.length; i++) {
    const wunsch = afbs[i % afbs.length];
    const passend = pool.filter((g) => g.afb === wunsch);
    const quelle = passend.length ? passend : pool;
    // gleichmäßig über die Themen verteilen: Thema mit den wenigsten bisherigen Aufgaben bevorzugen
    const zaehle = (t) => gewaehlt.filter((g) => g.thema === t).length;
    const minZ = Math.min(...[...new Set(quelle.map((g) => g.thema))].map(zaehle));
    const kand = quelle.filter((g) => zaehle(g.thema) === minZ);
    const unbenutzt = kand.filter((g) => !gewaehlt.some((x) => x.id === g.id));
    gewaehlt.push(wahl(unbenutzt.length ? unbenutzt : kand));
  }
  return gewaehlt;
}

/* Klausur: Ursachen und Auswertung */
export const URSACHEN = {
  verstaendnis: { name: "Verständnis", kurz: "Ich habe die Aufgabe oder den Stoff nicht verstanden." },
  ansatz: { name: "Ansatz", kurz: "Ich wusste nicht, wie ich anfangen soll." },
  rechnung: { name: "Rechnung", kurz: "Der Ansatz war richtig, aber ich habe mich verrechnet." },
  darstellung: { name: "Darstellung", kurz: "Das Ergebnis stimmte, aber der Weg war unklar oder unvollständig." },
  zeit: { name: "Zeit", kurz: "Ich bin nicht mehr fertig geworden." },
};
export function klausurAuswertung(k) {
  const verloren = (a) => Math.max(0, (Number(a.max) || 0) - (Number(a.erreicht) || 0));
  const proUrsache = {}, proThema = {};
  let gesamtMax = 0, gesamtErr = 0;
  for (const a of k.aufgaben) {
    const v = verloren(a);
    gesamtMax += Number(a.max) || 0; gesamtErr += Math.min(Number(a.erreicht) || 0, Number(a.max) || 0);
    if (v > 0) {
      proUrsache[a.ursache || "unklar"] = (proUrsache[a.ursache || "unklar"] || 0) + v;
      proThema[a.thema || "sonst"] = (proThema[a.thema || "sonst"] || 0) + v;
    }
  }
  return { verloren: gesamtMax - gesamtErr, gesamtMax, gesamtErr, proUrsache, proThema };
}
/* Trainingsplan: nur echte, erreichbare Werkzeuge und Trainingsmodi */
export function klausurPlan(auswertung) {
  const kom = (v) => String(v).replace(".", ",");
  const schritte = [];
  const themen = Object.entries(auswertung.proThema).filter(([t]) => THEMEN[t]).sort((a, b) => b[1] - a[1]);
  for (const [t, v] of themen.slice(0, 3)) {
    schritte.push({ art: "thema", thema: t, punkte: v, text: `${THEMEN[t].name}: ${kom(v)} Punkte verloren`, tools: THEMEN[t].tools });
  }
  const u = auswertung.proUrsache;
  if (u.rechnung) schritte.push({ art: "fehler", punkte: u.rechnung, text: `Rechnung: ${kom(u.rechnung)} Punkte – Flüchtigkeits- und Vorzeichenfehler gezielt trainieren`, ziel: { ansicht: "fehlertraining" } });
  if (u.verstaendnis || u.ansatz) schritte.push({ art: "erklaeren", punkte: (u.verstaendnis || 0) + (u.ansatz || 0), text: `Verständnis und Ansatz: ${kom((u.verstaendnis || 0) + (u.ansatz || 0))} Punkte – kurze Aufgaben mit „Erklär deinen Schritt“`, ziel: { ansicht: "warmup" } });
  if (u.zeit) schritte.push({ art: "zeit", punkte: u.zeit, text: `Zeit: ${kom(u.zeit)} Punkte – unter Zeitbegrenzung üben`, ziel: { ansicht: "pruefung" } });
  if (u.darstellung) schritte.push({ art: "darstellung", punkte: u.darstellung, text: `Darstellung: ${kom(u.darstellung)} Punkte – jeden Schritt in eine eigene Zeile schreiben und das Ergebnis als Satz notieren`, ziel: null });
  return schritte;
}

/* ---------- Prüfungsmodus von einer Fachseite aus: passende Themen zur Ansicht ---------- */
const ANSICHT_THEMA = { ableitungstrainer: "ableiten", plotter: "kurven", advplotter: "kurven", integrale: "integrale", gleichungen: "gleichungen", lgs: "gleichungen", gleichverstehen: "gleichungen", terme: "terme", bernoulli: "bernoulli" };
const VEKTOR_ANSICHTEN = ["vektoren", "ebenen", "ebenevsebene", "kreuzprodukt", "vektorgenerator", "zweipunkte", "dreipunkte", "abstaende", "geraden", "winkel"];
export function pruefungsThemen(ansicht) {
  if (ANSICHT_THEMA[ansicht]) return [ANSICHT_THEMA[ansicht]];
  if (VEKTOR_ANSICHTEN.includes(ansicht)) return ["vektoren"];
  if (["stochastik", "vierfelder", "erwartungswert", "kombinatorik", "hypothesentest"].includes(ansicht)) return ["bernoulli"];
  if (["analysis", "geradengleichung", "parabeln", "sinus", "steckbrief", "optimierung", "wachstum", "scharen"].includes(ansicht)) return ["kurven", "integrale"];
  return null;
}
export const RUECKMELDUNGEN = [
  ["hinweis", "Ein Hinweis zum Anfangen"], ["beispiel", "Ein Beispiel"], ["erklaerung", "Eine andere Erklärung"],
  ["leichter", "Eine leichtere Aufgabe davor"], ["zeit", "Mehr Zeit"], ["nichts", "Nichts – es lief gut"],
];
