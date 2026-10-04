/* ============================================================
   Analysis-Bereich: Optimierungswerkstatt
   Drei Wege durch dieselbe Schrittfolge:
   · Schachtel – offene Schachtel aus einem quadratischen Blech
   · Fläche und Umfang – Rechteck mit festem Umfang bzw. mit Hauswand
   · Eigener Ansatz – Rechteck unter f(x) = k − x²; die Zielfunktion
     tippt der Lernende selbst ein und wird numerisch auf Gleichwertigkeit geprüft
   Schritte: Zielgröße, (Nebenbedingung), Zielfunktion, Definitionsmenge,
   Extremwert, Maximalwert, Randwerte, Antwortsatz mit Einheit.
   Hinweise kommen stufenweise, die Lösung erst auf Wunsch.
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { parse, kompiliere, hatX, hatBox } from "./func12.jsx";
import { IchHaengeFest } from "./funcHilfe.jsx";
import { Auswahl, GrosserKnopf, KleinerLink, Rueck, Schaubild, TextFeld, ZahlFeld, hilfeKontext, hinweis, karte, kicker, zw } from "./ui2.jsx";
import { mischen, pVonZahlen, qLies, qNum, wahl } from "./rechnen2.js";

const sym = (z) => String(z).replace(/-/g, "−");
const dk = (z) => sym(String(z).replace(".", ","));
const zeile = { display: "flex", alignItems: "center", gap: 6, fontSize: 17, lineHeight: 1.9, whiteSpace: "nowrap", overflowX: "auto", color: C.tinte };
const loesungBox = { background: C.sand, borderRadius: 14, padding: "10px 14px", marginTop: 10, fontSize: 14, lineHeight: 1.6, color: C.tinte };
let zaehler = 0;

/* ---------- Aufgaben ---------- */
function schachtel() {
  const a = wahl([12, 18, 24, 30, 36]);
  const x = a / 6, V = (2 * a ** 3) / 27;
  const korrekt = zw(`Bei x = ${x} cm Höhe hat die Schachtel das größte Volumen von ${V} cm³.`, `At a height of x = ${x} cm the box has its largest volume of ${V} cm³.`);
  return {
    id: ++zaehler, art: "schachtel", a, x, V, einheit: "cm³",
    kopf: zw(`Aus einem quadratischen Blech mit der Seitenlänge ${a} cm werden an den vier Ecken Quadrate der Seitenlänge x ausgeschnitten. Die Seiten werden hochgeklappt – es entsteht eine oben offene Schachtel. Für welches x ist das Volumen am größten?`,
      `From a square sheet with side length ${a} cm, squares of side x are cut out at the four corners. The sides are folded up to make an open box. For which x is the volume largest?`),
    ziel: { optionen: [["V", zw("Volumen V", "Volume V")], ["O", zw("Oberfläche O", "Surface area O")], ["h", zw("Höhe h", "Height h")]], richtig: "V",
      hinweise: [zw("Was soll „am größten“ werden – steht im Aufgabentext.", "What should become “largest” – see the text."), zw("Gefragt ist nach dem Volumen.", "The question is about the volume.")] },
    fkt: { optionen: [["a", `V(x) = x · (${a} − 2x)²`], ["b", `V(x) = x · (${a} − x)²`], ["c", `V(x) = x² · (${a} − 2x)`]], richtig: "a",
      hinweise: [zw("Die Höhe der Schachtel ist x. Die Grundfläche ist ein Quadrat.", "The height of the box is x. The base is a square."),
        zw(`An jeder Seite fehlt zweimal x: Die Grundseite ist ${a} − 2x lang, die Grundfläche (${a} − 2x)².`, `Each side loses x twice: the base side is ${a} − 2x, the base area (${a} − 2x)².`)],
      erklaerung: zw(`V = Grundfläche · Höhe = (${a} − 2x)² · x.`, `V = base area · height = (${a} − 2x)² · x.`) },
    grenze: { text: zw("x muss kleiner sein als", "x must be smaller than"), wert: a / 2, einheit: "cm",
      hinweise: [zw("Die Grundseite a − 2x muss positiv bleiben.", "The base side a − 2x must stay positive."), zw(`Löse ${a} − 2x > 0 nach x.`, `Solve ${a} − 2x > 0 for x.`)],
      erklaerung: zw(`${a} − 2x > 0 ⇔ x < ${a / 2}. Also 0 < x < ${a / 2}.`, `${a} − 2x > 0 ⇔ x < ${a / 2}. So 0 < x < ${a / 2}.`) },
    ext: { text: "x =", wert: x, einheit: "cm",
      hinweise: [zw("Notwendige Bedingung: V′(x) = 0.", "Necessary condition: V′(x) = 0."),
        zw(`V(x) = 4x³ − ${4 * a}x² + ${a * a}x, also V′(x) = 12x² − ${8 * a}x + ${a * a}. Setze das gleich 0 (pq-Formel oder Faktorisieren).`, `V(x) = 4x³ − ${4 * a}x² + ${a * a}x, so V′(x) = 12x² − ${8 * a}x + ${a * a}. Set it to 0.`),
        zw(`Die Lösungen sind x = ${a / 6} und x = ${a / 2}. Eine liegt im Inneren von 0 < x < ${a / 2}.`, `The solutions are x = ${a / 6} and x = ${a / 2}. One lies inside 0 < x < ${a / 2}.`)],
      erklaerung: zw(`V′(x) = (6x − ${a})(2x − ${a}) = 0 ⇒ x = ${a / 6} oder x = ${a / 2}. Nur x = ${a / 6} liegt im Inneren.`, `V′(x) = (6x − ${a})(2x − ${a}) = 0 ⇒ x = ${a / 6} or x = ${a / 2}. Only x = ${a / 6} is inside.`) },
    max: { text: zw(`V(${x}) =`, `V(${x}) =`), wert: V, einheit: "cm³",
      hinweise: [zw("Setze deinen Extremwert in die Zielfunktion ein – nicht in die Ableitung.", "Plug your extremum into the target function – not into the derivative."),
        zw(`V(${x}) = ${x} · (${a} − 2 · ${x})²`, `V(${x}) = ${x} · (${a} − 2 · ${x})²`)],
      erklaerung: zw(`V(${x}) = ${x} · (${a - 2 * x})² = ${V}.`, `V(${x}) = ${x} · (${a - 2 * x})² = ${V}.`) },
    randText: zw(`Am Rand gilt V(0) = 0 und V(${a / 2}) = 0, im Inneren ist V(${x}) = ${V} > 0.`, `At the boundary V(0) = 0 and V(${a / 2}) = 0, inside V(${x}) = ${V} > 0.`),
    antwort: { richtig: korrekt, falsch: [zw(`Bei x = ${x} cm Höhe hat die Schachtel das größte Volumen von ${V} cm².`, `At a height of x = ${x} cm the box has its largest volume of ${V} cm².`),
      zw(`Das Volumen ist am größten, wenn x = ${a / 2} cm ist.`, `The volume is largest when x = ${a / 2} cm.`),
      zw(`Bei x = ${V} cm hat die Schachtel das größte Volumen von ${x} cm³.`, `At x = ${V} cm the box has its largest volume of ${x} cm³.`)] },
    kurven: [{ p: pVonZahlen([0, a * a, -4 * a, 4]), farbe: C.see, name: "V" }], bereich: [0, a / 2], yMax: V * 1.25, punktAus: (x0) => ({ x: x0, y: V }),
    hilfeText: "Schachtel Volumen Zielfunktion Definitionsmenge Ableitung Extremwert",
  };
}

function flaeche(variante) {
  const N = wahl([40, 60, 80, 100]);
  const wand = variante === "wand";
  const x = N / 4, A = wand ? (N * N) / 8 : (N * N) / 16;
  const fOpt = wand ? `x · (${N} − 2x)` : `x · (${N / 2} − x)`;
  return {
    id: ++zaehler, art: "flaeche", variante, N, x, A, einheit: "m²",
    kopf: wand
      ? zw(`Ein rechteckiger Garten grenzt mit einer Seite an eine Hauswand. Für die drei anderen Seiten stehen ${N} m Zaun zur Verfügung. Welche Maße ergeben die größte Fläche?`, `A rectangular garden borders a house wall on one side. ${N} m of fence are available for the other three sides. Which dimensions give the largest area?`)
      : zw(`Ein Rechteck hat den Umfang ${N} m. Welche Seitenlängen ergeben den größten Flächeninhalt?`, `A rectangle has a perimeter of ${N} m. Which side lengths give the largest area?`),
    ziel: { optionen: [["A", zw("Flächeninhalt A", "Area A")], ["U", zw("Umfang U", "Perimeter P")], ["d", zw("Diagonale d", "Diagonal d")]], richtig: "A",
      hinweise: [zw("Was soll maximal werden?", "What should be maximal?"), zw("Gefragt ist die größte Fläche.", "The question asks for the largest area.")] },
    neben: wand
      ? { optionen: [["a", "2x + y = " + N], ["b", "x + y = " + N], ["c", "x · y = " + N]], richtig: "a",
        hinweise: [zw("Nenne die Breite x (zwei Seiten an der Hauswand) und die Länge y (parallel zur Wand).", "Call the width x (two sides at the wall) and the length y (parallel to the wall)."), zw("Welche Seiten brauchen Zaun? Zweimal x und einmal y.", "Which sides need fence? Twice x and once y.")],
        erklaerung: zw(`Zaun: x + y + x = ${N}, also y = ${N} − 2x.`, `Fence: x + y + x = ${N}, so y = ${N} − 2x.`) }
      : { optionen: [["a", `2x + 2y = ${N}`], ["b", `x + y = ${N}`], ["c", `x · y = ${N}`]], richtig: "a",
        hinweise: [zw("Der Umfang eines Rechtecks setzt sich aus allen vier Seiten zusammen.", "The perimeter of a rectangle consists of all four sides."), zw("Zwei Seiten x und zwei Seiten y.", "Two sides x and two sides y.")],
        erklaerung: zw(`2x + 2y = ${N} ⇒ y = ${N / 2} − x.`, `2x + 2y = ${N} ⇒ y = ${N / 2} − x.`) },
    fkt: wand
      ? { optionen: [["a", `A(x) = x · (${N} − 2x)`], ["b", `A(x) = x · (${N} − x)`], ["c", `A(x) = 2x · (${N} − 2x)`]], richtig: "a",
        hinweise: [zw("A = x · y. Ersetze y mithilfe der Nebenbedingung.", "A = x · y. Replace y using the constraint."), zw(`Aus 2x + y = ${N} folgt y = ${N} − 2x.`, `From 2x + y = ${N} we get y = ${N} − 2x.`)],
        erklaerung: zw(`A = x · y = x · (${N} − 2x).`, `A = x · y = x · (${N} − 2x).`) }
      : { optionen: [["a", `A(x) = x · (${N / 2} − x)`], ["b", `A(x) = x · (${N} − x)`], ["c", `A(x) = 2x · (${N / 2} − x)`]], richtig: "a",
        hinweise: [zw("A = x · y. Ersetze y mithilfe der Nebenbedingung.", "A = x · y. Replace y using the constraint."), zw(`Aus 2x + 2y = ${N} folgt y = ${N / 2} − x.`, `From 2x + 2y = ${N} we get y = ${N / 2} − x.`)],
        erklaerung: zw(`A = x · y = x · (${N / 2} − x).`, `A = x · y = x · (${N / 2} − x).`) },
    grenze: { text: zw("x muss kleiner sein als", "x must be smaller than"), wert: N / 2, einheit: "m",
      hinweise: [zw("Die andere Seite y muss positiv bleiben.", "The other side y must stay positive."), wand ? zw(`Löse ${N} − 2x > 0.`, `Solve ${N} − 2x > 0.`) : zw(`Löse ${N / 2} − x > 0.`, `Solve ${N / 2} − x > 0.`)],
      erklaerung: wand ? zw(`${N} − 2x > 0 ⇔ x < ${N / 2}.`, `${N} − 2x > 0 ⇔ x < ${N / 2}.`) : zw(`${N / 2} − x > 0 ⇔ x < ${N / 2}.`, `${N / 2} − x > 0 ⇔ x < ${N / 2}.`) },
    ext: { text: "x =", wert: x, einheit: "m",
      hinweise: [zw("A′(x) = 0 setzen.", "Set A′(x) = 0."), wand ? zw(`A(x) = ${N}x − 2x², also A′(x) = ${N} − 4x.`, `A(x) = ${N}x − 2x², so A′(x) = ${N} − 4x.`) : zw(`A(x) = ${N / 2}x − x², also A′(x) = ${N / 2} − 2x.`, `A(x) = ${N / 2}x − x², so A′(x) = ${N / 2} − 2x.`)],
      erklaerung: wand ? zw(`${N} − 4x = 0 ⇒ x = ${x}.`, `${N} − 4x = 0 ⇒ x = ${x}.`) : zw(`${N / 2} − 2x = 0 ⇒ x = ${x}.`, `${N / 2} − 2x = 0 ⇒ x = ${x}.`) },
    max: { text: `A(${x}) =`, wert: A, einheit: "m²",
      hinweise: [zw("Setze x in die Zielfunktion A(x) ein.", "Plug x into the target function A(x)."), zw(`A(${x}) = ${fOpt.replace(/x/g, String(x))}`, `A(${x}) = ${fOpt.replace(/x/g, String(x))}`)],
      erklaerung: wand ? zw(`A(${x}) = ${x} · (${N} − ${2 * x}) = ${A}.`, `A(${x}) = ${x} · (${N} − ${2 * x}) = ${A}.`) : zw(`A(${x}) = ${x} · (${N / 2} − ${x}) = ${A}.`, `A(${x}) = ${x} · (${N / 2} − ${x}) = ${A}.`) },
    randText: zw(`Am Rand ist A = 0 (x = 0 oder x = ${N / 2}), im Inneren ist A(${x}) = ${A} > 0.`, `At the boundary A = 0 (x = 0 or x = ${N / 2}), inside A(${x}) = ${A} > 0.`),
    antwort: wand
      ? { richtig: zw(`Der Garten ist ${x} m breit und ${N - 2 * x} m lang; die größte Fläche beträgt ${A} m².`, `The garden is ${x} m wide and ${N - 2 * x} m long; the largest area is ${A} m².`),
        falsch: [zw(`Der Garten ist ${x} m breit und ${N - 2 * x} m lang; die größte Fläche beträgt ${A} m.`, `The garden is ${x} m wide and ${N - 2 * x} m long; the largest area is ${A} m.`),
          zw(`Der Garten ist ${x} m breit und ${N / 2 - x} m lang; die größte Fläche beträgt ${A} m².`, `The garden is ${x} m wide and ${N / 2 - x} m long; the largest area is ${A} m².`),
          zw(`Die größte Fläche beträgt ${x} m², sie wird bei x = ${A} m erreicht.`, `The largest area is ${x} m², reached at x = ${A} m.`)] }
      : { richtig: zw(`Das Quadrat mit Seitenlänge ${x} m hat die größte Fläche von ${A} m².`, `The square with side length ${x} m has the largest area of ${A} m².`),
        falsch: [zw(`Das Quadrat mit Seitenlänge ${x} m hat die größte Fläche von ${A} m.`, `The square with side length ${x} m has the largest area of ${A} m.`),
          zw(`Das Rechteck mit den Seiten ${x} m und ${N / 2} m hat die größte Fläche von ${A} m².`, `The rectangle with sides ${x} m and ${N / 2} m has the largest area of ${A} m².`),
          zw(`Die größte Fläche beträgt ${x} m², sie wird bei x = ${A} m erreicht.`, `The largest area is ${x} m², reached at x = ${A} m.`)] },
    kurven: [{ p: wand ? pVonZahlen([0, N, -2]) : pVonZahlen([0, N / 2, -1]), farbe: C.see, name: "A" }], bereich: [0, N / 2], yMax: A * 1.25, punktAus: (x0) => ({ x: x0, y: A }),
    hilfeText: "Fläche Umfang Nebenbedingung Zielfunktion Extremwert Rechteck Hauswand",
  };
}

const KS = [3, 12, 27];
function eigen() {
  const k = wahl(KS);
  const x = Math.sqrt(k / 3), A = 2 * x * (k - x * x);
  return {
    id: ++zaehler, art: "eigen", k, x, A, einheit: "FE",
    kopf: zw(`Unter dem Graphen von f(x) = ${k} − x² liegt ein Rechteck. Zwei Ecken liegen auf der x-Achse (symmetrisch zur y-Achse), die oberen beiden Ecken auf dem Graphen. Für welches x ist die Fläche des Rechtecks am größten?`,
      `A rectangle lies under the graph of f(x) = ${k} − x². Two corners are on the x-axis (symmetric about the y-axis), the upper two on the graph. For which x is the rectangle’s area largest?`),
    ziel: { optionen: [["A", zw("Flächeninhalt des Rechtecks", "Area of the rectangle")], ["U", zw("Umfang des Rechtecks", "Perimeter of the rectangle")], ["f", zw("Funktionswert f(x)", "Function value f(x)")]], richtig: "A",
      hinweise: [zw("Was soll maximal werden?", "What should be maximal?"), zw("Gefragt ist die Fläche des Rechtecks.", "The question is about the rectangle’s area.")] },
    fkt: { eigen: true, f: (t) => 2 * t * (k - t * t), halb: (t) => t * (k - t * t),
      hinweise: [zw("Fläche = Breite · Höhe. Zeichne dir das Rechteck auf.", "Area = width · height. Sketch the rectangle."),
        zw(`Die rechte obere Ecke ist (x | f(x)) = (x | ${k} − x²). Die Höhe ist ${k} − x².`, `The upper right corner is (x | f(x)) = (x | ${k} − x²). The height is ${k} − x².`),
        zw("Das Rechteck reicht von −x bis x – die Breite ist 2x.", "The rectangle runs from −x to x – the width is 2x.")],
      erklaerung: zw(`A(x) = 2x · (${k} − x²) = ${2 * k}x − 2x³.`, `A(x) = 2x · (${k} − x²) = ${2 * k}x − 2x³.`) },
    grenze: { optionen: [["a", `0 < x < √${k}`], ["b", `0 < x < ${k}`], ["c", `0 < x < ${k}/2`]], richtig: "a",
      hinweise: [zw("Die Höhe muss positiv bleiben: f(x) > 0.", "The height must stay positive: f(x) > 0."), zw(`${k} − x² > 0 ⇔ x² < ${k}.`, `${k} − x² > 0 ⇔ x² < ${k}.`)],
      erklaerung: zw(`${k} − x² > 0 ⇔ x < √${k} (für x > 0).`, `${k} − x² > 0 ⇔ x < √${k} (for x > 0).`) },
    ext: { text: "x =", wert: x, einheit: "LE",
      hinweise: [zw("A′(x) = 0 setzen.", "Set A′(x) = 0."), zw(`A(x) = ${2 * k}x − 2x³, also A′(x) = ${2 * k} − 6x².`, `A(x) = ${2 * k}x − 2x³, so A′(x) = ${2 * k} − 6x².`), zw(`${2 * k} − 6x² = 0 ⇔ x² = ${k / 3}. Nimm die positive Lösung.`, `${2 * k} − 6x² = 0 ⇔ x² = ${k / 3}. Take the positive solution.`)],
      erklaerung: zw(`${2 * k} − 6x² = 0 ⇒ x² = ${k / 3} ⇒ x = ${x}.`, `${2 * k} − 6x² = 0 ⇒ x² = ${k / 3} ⇒ x = ${x}.`) },
    max: { text: `A(${x}) =`, wert: A, einheit: "FE",
      hinweise: [zw("Setze x in die Zielfunktion ein.", "Plug x into the target function."), zw(`A(${x}) = 2 · ${x} · (${k} − ${x}²)`, `A(${x}) = 2 · ${x} · (${k} − ${x}²)`)],
      erklaerung: zw(`A(${x}) = ${2 * x} · (${k} − ${x * x}) = ${A}.`, `A(${x}) = ${2 * x} · (${k} − ${x * x}) = ${A}.`) },
    randText: zw(`Am Rand ist A(0) = 0 und A(√${k}) = 0, im Inneren ist A(${x}) = ${A} > 0.`, `At the boundary A(0) = 0 and A(√${k}) = 0, inside A(${x}) = ${A} > 0.`),
    antwort: { richtig: zw(`Für x = ${x} ist die Rechteckfläche mit ${A} FE am größten.`, `For x = ${x} the rectangle’s area is largest with ${A} AU.`),
      falsch: [zw(`Für x = ${x} ist die Rechteckfläche mit ${A} LE am größten.`, `For x = ${x} the rectangle’s area is largest with ${A} LU.`),
        zw(`Für x = ${A} ist die Rechteckfläche mit ${x} FE am größten.`, `For x = ${A} the rectangle’s area is largest with ${x} AU.`),
        zw(`Für x = √${k} ist die Rechteckfläche am größten.`, `For x = √${k} the rectangle’s area is largest.`)] },
    kurven: [{ p: pVonZahlen([k, 0, -1]), farbe: C.gold || C.flaggold, name: "f" }, { p: pVonZahlen([0, 2 * k, 0, -2]), farbe: C.see, name: "A" }], bereich: [0, Math.sqrt(k) + 0.3], yMax: Math.max(k, A) * 1.2, punktAus: (x0) => ({ x: x0, y: A }),
    hilfeText: "Rechteck unter Parabel Zielfunktion Extremwert Randwerte",
  };
}

/* ---------- Eingabeprüfung ---------- */
function leseTerm(text) {
  if (!text.trim()) return { fehler: zw("Bitte einen Term eintippen, z. B. 2x(12 − x^2).", "Please type a term, e.g. 2x(12 − x^2).") };
  const n = parse(text.replace(/−/g, "-").replace(/,/g, "."));
  if (!n || hatBox(n)) return { fehler: zw("Das lässt sich nicht lesen. Setze Klammern und nutze ^ für Potenzen.", "I can’t read that. Use brackets and ^ for powers.") };
  if (!hatX(n)) return { fehler: zw("Die Zielfunktion muss x enthalten.", "The target function must contain x.") };
  return { f: kompiliere(n) };
}
const gleichFkt = (f, g) => [0.4, 0.9, 1.3, 1.7, 2.2].every((t) => { const a = f(t), b = g(t); return isFinite(a) && Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(b)); });

/* ---------- Schrittfolge ---------- */
function baueSchritte(au) {
  const s = [];
  s.push({ id: "ziel", titel: zw("Zielgröße", "Target quantity"), typ: "wahl", frage: zw("Was soll maximal werden?", "What should be maximal?"), ...au.ziel,
    erklaerung: zw("Die Zielgröße ist die Größe, die extremal werden soll.", "The target quantity is the one that should become extremal.") });
  if (au.neben) s.push({ id: "neben", titel: zw("Nebenbedingung", "Constraint"), typ: "wahl", frage: zw("Welche Gleichung verbindet die beiden Seiten x und y?", "Which equation connects the sides x and y?"), ...au.neben });
  s.push(au.fkt.eigen
    ? { id: "fkt", titel: zw("Zielfunktion", "Target function"), typ: "term", frage: zw("Stelle A(x) auf und tippe den Term ein.", "Set up A(x) and type the term."), ...au.fkt }
    : { id: "fkt", titel: zw("Zielfunktion", "Target function"), typ: "wahl", frage: zw("Welche Zielfunktion mit nur einer Variablen stimmt?", "Which target function with a single variable is correct?"), ...au.fkt });
  s.push({ id: "grenze", titel: zw("Definitionsmenge", "Domain"), typ: au.grenze.optionen ? "wahl" : "zahl", frage: zw("Zwischen welchen Werten darf x liegen?", "Between which values may x lie?"), ...au.grenze });
  s.push({ id: "ext", titel: zw("Extremwert", "Extremum"), typ: "zahl", frage: zw("Leite die Zielfunktion ab, setze die Ableitung gleich 0 und wähle die Lösung im Definitionsbereich.", "Differentiate the target function, set the derivative to 0 and pick the solution inside the domain."), ...au.ext });
  s.push({ id: "max", titel: zw("Maximalwert", "Maximum value"), typ: "zahl", frage: zw("Wie groß ist die Zielgröße an dieser Stelle?", "How large is the target quantity there?"), ...au.max });
  s.push({ id: "rand", titel: zw("Randwerte", "Boundary values"), typ: "wahl", frage: zw("Ist das wirklich ein Maximum? Vergleiche mit den Rändern.", "Is it really a maximum? Compare with the boundary."),
    optionen: [["a", zw("Ja – an beiden Rändern ist der Wert 0, im Inneren aber größer als 0.", "Yes – at both ends the value is 0, inside it is larger than 0.")], ["b", zw("Nein – am Rand ist der Wert am größten.", "No – the value is largest at the boundary.")], ["c", zw("Das lässt sich nicht entscheiden.", "This cannot be decided.")]], richtig: "a",
    hinweise: [zw("Berechne die Zielgröße am linken und rechten Rand des Definitionsbereichs.", "Compute the target quantity at the left and right end of the domain."), zw("Setze x = 0 und die obere Grenze ein.", "Plug in x = 0 and the upper limit.")], erklaerung: au.randText });
  const opt = mischen([["r", au.antwort.richtig], ...au.antwort.falsch.map((t, i) => ["f" + i, t])]);
  s.push({ id: "antwort", titel: zw("Antwortsatz", "Answer"), typ: "wahl", frage: zw("Welcher Antwortsatz ist vollständig und hat die richtige Einheit?", "Which answer sentence is complete and has the right unit?"), optionen: opt, richtig: "r",
    hinweise: [zw("Prüfe Einheit und Zuordnung: Was gehört zu x, was zur Zielgröße?", "Check unit and assignment: what belongs to x, what to the target quantity?"), zw("Flächen haben Quadrat-, Volumen Kubikeinheiten.", "Areas have square units, volumes cubic units.")] });
  return s;
}

function Schritt({ st, nr, aktiv, fertig, onFertig, au }) {
  const [eing, setEing] = useState("");
  const [versuche, setVersuche] = useState(0);
  const [rueck, setRueck] = useState(null);
  const [zeigen, setZeigen] = useState(false);
  const [ok, setOk] = useState(false);
  const pruefen = () => {
    let r;
    if (st.typ === "wahl") r = eing === st.richtig;
    else if (st.typ === "zahl") {
      const v = qLies(eing);
      if (v === null) { setRueck({ art: "warn", text: zw("Bitte eine Zahl eingeben (auch Bruch oder Dezimalzahl).", "Please enter a number (fraction or decimal is fine).") }); return; }
      r = Math.abs(qNum(v) - st.wert) < 1e-9;
    } else {
      const t = leseTerm(eing);
      if (t.fehler) { setRueck({ art: "warn", text: t.fehler }); return; }
      r = gleichFkt(t.f, st.f);
      if (!r && gleichFkt(t.f, st.halb)) { setVersuche((n) => n + 1); setRueck({ art: "schlecht", text: zw("Fast: Das Rechteck reicht von −x bis x. Wie breit ist es dann?", "Almost: the rectangle runs from −x to x. How wide is it then?") }); return; }
    }
    if (r) { setOk(true); setRueck(null); onFertig(); return; }
    const n = versuche + 1; setVersuche(n);
    const h = st.hinweise?.[Math.min(n - 1, st.hinweise.length - 1)];
    setRueck({ art: "schlecht", text: `${zw("Noch nicht.", "Not yet.")} ${h ? `${zw("Hinweis", "Hint")} ${Math.min(n, st.hinweise.length)}/${st.hinweise.length}: ${h}` : ""}` });
  };
  const zusammen = fertig || ok;
  const kopf = (
    <p style={{ fontSize: 13, fontWeight: 700, color: zusammen ? "#0F7A4D" : C.grau, margin: "14px 0 6px", display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ display: "inline-flex", width: 20, height: 20, borderRadius: 999, background: zusammen ? "#E6F6EF" : C.himmel, color: zusammen ? "#0F7A4D" : C.see, alignItems: "center", justifyContent: "center", fontSize: 11.5 }}>{zusammen ? "✓" : nr}</span>
      {st.titel}
    </p>
  );
  if (!aktiv && !zusammen) return null;
  const antwortAnzeige = st.typ === "wahl" ? st.optionen.find((o) => o[0] === (zeigen ? st.richtig : eing))?.[1] : zeigen ? (st.typ === "zahl" ? sym(String(st.wert)) : "") : eing;
  if (zusammen) {
    return (
      <div>
        {kopf}
        <p style={{ fontSize: 14, color: C.tinte, margin: "0 0 0 26px", lineHeight: 1.55 }}>{st.typ === "zahl" ? <>{st.text} <b>{dk(st.wert)}</b> {st.einheit}</> : <b>{antwortAnzeige}</b>}</p>
        {st.erklaerung && <p style={{ fontSize: 12.5, color: C.grau, margin: "2px 0 0 26px", lineHeight: 1.55 }}>{st.erklaerung}</p>}
      </div>
    );
  }
  return (
    <div>
      {kopf}
      <p style={{ fontSize: 14.5, color: C.tinte, lineHeight: 1.6, margin: "0 0 8px" }}>{st.frage}</p>
      {st.typ === "wahl" && <Auswahl optionen={st.optionen} wert={eing} setWert={(v) => { setEing(v); setRueck(null); }} label={st.titel} />}
      {st.typ === "zahl" && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: C.tinte }}>{st.text}</span>
          <ZahlFeld wert={eing} setWert={(v) => { setEing(v); setRueck(null); }} label={st.titel} onEnter={pruefen} />
          <span style={{ fontSize: 15, color: C.grau }}>{st.einheit}</span>
        </div>
      )}
      {st.typ === "term" && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: C.tinte, whiteSpace: "nowrap" }}>A(x) =</span>
          <TextFeld wert={eing} setWert={(v) => { setEing(v); setRueck(null); }} label="A(x)" platzhalter="2x(12 - x^2)" onEnter={pruefen} />
        </div>
      )}
      <GrosserKnopf onClick={pruefen} disabled={!eing.trim()}>{zw("Schritt prüfen", "Check step")}</GrosserKnopf>
      {rueck && <Rueck art={rueck.art}>{rueck.text}</Rueck>}
      {!zeigen
        ? <KleinerLink onClick={() => { setZeigen(true); }}>{zw("Lösung dieses Schritts zeigen", "Show the solution of this step")}</KleinerLink>
        : (
          <div style={loesungBox}>
            <p style={{ margin: 0 }}>{st.erklaerung}</p>
            <div style={{ marginTop: 8 }}><GrosserKnopf ghost onClick={() => { setOk(true); onFertig(); }}>{zw("Weiter zum nächsten Schritt", "Continue to the next step")}</GrosserKnopf></div>
          </div>
        )}
    </div>
  );
}

function Werkstatt({ au, neu, titel }) {
  const schritte = React.useMemo(() => baueSchritte(au), [au]);
  const [stand, setStand] = useState(0);
  const fertig = stand >= schritte.length;
  const xE = stand > 4 ? au.x : null;
  const hilfe = hilfeKontext({
    id: `opt-${au.id}`,
    aufgabe: au.hilfeText,
    verstehen: [
      zw("Eine Extremwertaufgabe hat eine Zielgröße (soll maximal oder minimal werden) und eine Nebenbedingung.", "An optimisation problem has a target quantity (to be maximal or minimal) and a constraint."),
      zw("Zeichne eine Skizze und benenne die Größen: x ist die Variable, alles andere drückst du durch x aus.", "Draw a sketch and name the quantities: x is the variable, express everything else through x."),
      zw("Am Ende gehört immer ein Antwortsatz mit Einheit dazu.", "An answer sentence with a unit always belongs at the end."),
    ],
    ansatz: [
      zw("Was soll maximal werden – und wovon hängt es ab?", "What should be maximal – and what does it depend on?"),
      zw("Mit der Nebenbedingung wird aus zwei Variablen eine: die Zielfunktion.", "With the constraint two variables become one: the target function."),
      zw("Zielfunktion ableiten, Ableitung gleich 0 setzen, Lösung im Definitionsbereich auswählen.", "Differentiate, set the derivative to 0, pick the solution inside the domain."),
    ],
    regel: [
      zw("Welche Ableitungsregel brauchst du?", "Which differentiation rule do you need?"),
      zw("Erst ausmultiplizieren, dann Potenzregel: (xⁿ)′ = n · xⁿ⁻¹.", "Expand first, then the power rule: (xⁿ)′ = n · xⁿ⁻¹."),
      zw("Notwendig: f′(x) = 0. Hinreichend: Vorzeichenwechsel von f′ oder f″ < 0 (Maximum).", "Necessary: f′(x) = 0. Sufficient: sign change of f′ or f″ < 0 (maximum)."),
    ],
    pruefen: [
      zw("Liegt dein x im Definitionsbereich?", "Is your x inside the domain?"),
      zw("Vergleiche den Wert mit den Randwerten – ein Extremwert im Inneren ist nicht automatisch das globale Maximum.", "Compare with the boundary values – an interior extremum is not automatically the global maximum."),
      zw("Prüfe die Einheit: Länge, Fläche oder Volumen?", "Check the unit: length, area or volume?"),
    ],
    regeln: [{ name: "Extremwertaufgaben", bereich: "analysis" }],
  });
  const pkt = xE !== null ? [{ ...au.punktAus(au.x), farbe: C.smaragd, name: zw("Max.", "Max.") }] : [];
  return (
    <div style={{ ...karte, marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        <p style={kicker}>{titel}</p>
        <IchHaengeFest kontext={hilfe} />
      </div>
      <p style={{ ...hinweis, color: C.tinte, marginBottom: 6 }}>{au.kopf}</p>
      {stand >= 3 && (
        <div style={{ margin: "8px 0" }}>
          <Schaubild kurven={au.kurven} punkte={pkt} x0={au.bereich[0]} x1={au.bereich[1]} yMin={0} yMax={au.yMax} hoehe={190} />
        </div>
      )}
      {schritte.map((st, i) => (
        <Schritt key={st.id} st={st} nr={i + 1} au={au} aktiv={i === stand} fertig={i < stand} onFertig={() => setStand((n) => Math.max(n, i + 1))} />
      ))}
      {fertig && <Rueck art="gut">{zw("Geschafft: Du hast die Aufgabe vollständig gelöst – von der Zielgröße bis zum Antwortsatz.", "Done: you solved the problem completely – from target quantity to answer sentence.")}</Rueck>}
      <GrosserKnopf ghost onClick={neu}>{zw("Neue Aufgabe", "New problem")}</GrosserKnopf>
    </div>
  );
}

export function Schachtelaufgabe() {
  const [au, setAu] = useState(schachtel);
  return <Werkstatt key={au.id} au={au} neu={() => setAu(schachtel())} titel={zw("Schachtel", "Box")} />;
}
export function FlaecheUmfang() {
  const [v, setV] = useState("umfang");
  const [au, setAu] = useState(() => flaeche("umfang"));
  const wechsel = (n) => { setV(n); setAu(flaeche(n)); };
  return (
    <div>
      <div style={{ marginTop: 14 }}>
        <Auswahl optionen={[["umfang", zw("Rechteck mit festem Umfang", "Rectangle with fixed perimeter")], ["wand", zw("Garten an der Hauswand", "Garden at a house wall")]]} wert={v} setWert={wechsel} label={zw("Variante", "Variant")} />
      </div>
      <Werkstatt key={au.id} au={au} neu={() => setAu(flaeche(v))} titel={zw("Fläche und Umfang", "Area and perimeter")} />
    </div>
  );
}
export function EigenerAnsatz() {
  const [au, setAu] = useState(eigen);
  return <Werkstatt key={au.id} au={au} neu={() => setAu(eigen())} titel={zw("Eigener Ansatz", "Your own approach")} />;
}

const MODI = [["schachtel", "Schachtel", "Box"], ["flaeche", "Fläche und Umfang", "Area and perimeter"], ["eigen", "Eigener Ansatz", "Own approach"]];
export function Optimierungswerkstatt() {
  const [modus, setModus] = useState("schachtel");
  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 24 }}>
      <h2 className="intro-h2" style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 8 }}>{zw("Optimierungswerkstatt", "Optimisation workshop")}</h2>
      <p style={{ ...hinweis, marginBottom: 14 }}>{zw("Vom Text zur Zielfunktion: Skizze, Nebenbedingung, Ableitung, Randwerte und Antwortsatz – Schritt für Schritt, Lösungen nur auf Wunsch.", "From text to target function: sketch, constraint, derivative, boundary values and answer – step by step, solutions only on request.")}</p>
      <div role="tablist" aria-label={zw("Optimierungs-Aufgaben", "Optimisation tasks")} style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
        {MODI.map(([id, de, en]) => {
          const an = modus === id;
          return (
            <button key={id} type="button" role="tab" aria-selected={an} onClick={() => setModus(id)}
              style={{ minHeight: 52, padding: "8px 6px", borderRadius: 14, fontFamily: "inherit", cursor: "pointer", fontSize: 13.5, fontWeight: 700, lineHeight: 1.25, textAlign: "center",
                border: `1.5px solid ${an ? C.see : C.linie}`, background: an ? C.see : C.weiss, color: an ? C.weiss : C.see }}>{zw(de, en)}</button>
          );
        })}
      </div>
      <div style={{ display: modus === "schachtel" ? "block" : "none" }}><Schachtelaufgabe /></div>
      <div style={{ display: modus === "flaeche" ? "block" : "none" }}><FlaecheUmfang /></div>
      <div style={{ display: modus === "eigen" ? "block" : "none" }}><EigenerAnsatz /></div>
    </div>
  );
}
