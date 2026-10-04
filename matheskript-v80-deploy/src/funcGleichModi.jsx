/* ============================================================
   Gleichungen: Gleichungen verstehen – fünf Modi
   · Umformungen trainieren – jede Äquivalenzumformung einzeln wählen
   · Methode wählen – erst das passende Verfahren, dann die Lösungen
   · Fehler finden – in einer fertigen Rechnung die falsche Zeile aufspüren
   · Lösungsmenge verstehen – eine, keine, unendlich viele; Diskriminante
   · Geometrisch deuten – f(x) = g(x) als Schnittpunkte am Graphen
   Hinweise stufenweise, Lösung nur auf Wunsch.
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useMemo, useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { IchHaengeFest } from "./funcHilfe.jsx";
import { GrosserKnopf, hilfeKontext, hinweis, karte, kicker, zw } from "./ui2.jsx";
import { FunktionsBild, Seite, SchrittFolge } from "./ui3.jsx";
import { METHODEN, bruchTex, kT, neueLoesungsmenge, neueMethode, neuFehler, neuGeometrisch, neuUmformung, pl } from "./gleichgen.js";
import { mischen } from "./rechnen2.js";

const sym = (v) => String(v).replace(/-/g, "−");
const zeile = { display: "flex", alignItems: "center", gap: 6, fontSize: 18, lineHeight: 1.9, whiteSpace: "nowrap", overflowX: "auto", color: C.tinte };

const hilfe = (id, aufgabe) => hilfeKontext({
  id, aufgabe,
  verstehen: [zw("Eine Gleichung bleibt wahr, wenn du auf beiden Seiten dasselbe tust.", "An equation stays true if you do the same on both sides."), zw("Ziel: x allein auf einer Seite.", "Goal: x alone on one side."), zw("Zeichne dir bei Unsicherheit eine Probe: Setze dein Ergebnis in die Ausgangsgleichung ein.", "If unsure, check: plug your result into the original equation.")],
  ansatz: [zw("Was steht im Weg, damit x allein steht?", "What is in the way of isolating x?"), zw("Erst Summanden verschieben, dann durch den Faktor vor x teilen.", "First move summands, then divide by the factor in front of x."), zw("Mache immer nur einen Schritt auf einmal.", "Always do just one step at a time.")],
  regel: [zw("Welche Umkehroperation passt?", "Which inverse operation fits?"), zw("Plus ↔ Minus, Mal ↔ Geteilt.", "Plus ↔ minus, times ↔ divide."), zw("Bei quadratischen Gleichungen: Nullprodukt, Wurzel oder pq-Formel.", "For quadratic equations: zero product, root or pq formula.")],
  pruefen: [zw("Probe: Linke und rechte Seite einzeln ausrechnen.", "Check: compute left and right side separately."), zw("Kommt auf beiden Seiten dasselbe heraus?", "Same value on both sides?"), zw("Bei Brüchen: Nenner darf nie null werden.", "With fractions: the denominator must never be zero.")],
  regeln: [{ name: "Äquivalenzumformung", bereich: "terme" }],
});
const Karte = ({ titel, hilfeId, aufgabe, neu, children }) => (
  <div style={{ ...karte, marginTop: 16 }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
      <p style={kicker}>{titel}</p>
      <IchHaengeFest kontext={hilfe(hilfeId, aufgabe)} />
    </div>
    {children}
    <GrosserKnopf ghost onClick={neu}>{zw("Neue Aufgabe", "New problem")}</GrosserKnopf>
  </div>
);
const Zeile = ({ t }) => <div style={{ ...zeile, justifyContent: "center" }}><M t={t} /></div>;

/* ---------- 1) Umformungen trainieren ---------- */
function Umformungen() {
  const [au, setAu] = useState(neuUmformung);
  const [stand, setStand] = useState(0);
  const neu = () => { setAu(neuUmformung()); setStand(0); };
  const { a, b, c, d, k, r, X } = au;
  const s = useMemo(() => [
    { id: "u1", titel: zw("Erste Umformung", "First transformation"), typ: "wahl", frage: zw("Alle x sollen auf die linke Seite. Welche Umformung machst du?", "All x should go to the left side. Which transformation do you do?"),
      optionen: mischen([["r", zw(`${c}x auf beiden Seiten abziehen`, `subtract ${c}x on both sides`)], ["f1", zw(`${c}x nur auf der linken Seite abziehen`, `subtract ${c}x on the left side only`)], ["f2", zw(`${c}x auf beiden Seiten addieren`, `add ${c}x on both sides`)]]), richtig: "r",
      fehler: [{ wahl: "f1", text: zw("Eine Äquivalenzumformung muss auf BEIDEN Seiten gleich geschehen – sonst wird die Gleichung verändert.", "An equivalence transformation must be done on BOTH sides – otherwise you change the equation.") }, { wahl: "f2", text: zw(`Das ist erlaubt, bringt aber nichts: Dann stehen sogar ${a + c} x links und ${2 * c} x rechts. Du willst x loswerden, nicht mehr davon.`, `That is allowed but does not help: you would then have ${a + c} x on the left and ${2 * c} x on the right.`) }],
      hinweise: [zw("Welche Umkehroperation hebt „+ " + c + "x“ auf der rechten Seite auf?", "Which inverse operation cancels “+ " + c + "x” on the right side?")], erklaerung: zw(`Subtrahiere ${c}x auf beiden Seiten: ${k === 1 ? "x" : k + "x"} ${pl(b)} = ${d}.`, `Subtract ${c}x on both sides: ${k === 1 ? "x" : k + "x"} ${pl(b)} = ${d}.`) },
    { id: "u2", titel: zw("Zweite Umformung", "Second transformation"), typ: "zahl", text: zw("rechts steht", "right side is"), frage: zw(`Jetzt steht ${kT(k)} ${pl(b)} = ${d} da. Du ziehst ${sym(b)} auf beiden Seiten ab bzw. addierst ${sym(-b)}. Was steht danach rechts?`, `Now ${kT(k)} ${pl(b)} = ${d}. You do ${b > 0 ? "−" : "+"}${Math.abs(b)} on both sides. What is on the right side afterwards?`),
      wert: r, fehler: [{ wert: d + b, text: zw("Du hast das Vorzeichen nicht umgekehrt: Wer b links beseitigt, muss b rechts mit dem Gegenzeichen anwenden.", "You did not reverse the sign: to remove b on the left you apply the opposite sign on the right.") }],
      hinweise: [zw("Rechts steht d. Was passiert mit d, wenn du b abziehst?", "On the right is d. What happens to d if you subtract b?")], erklaerung: `${d} ${pl(-b)} = ${r}.` },
    { id: "u3", titel: zw("Dritte Umformung", "Third transformation"), typ: "zahl", text: zw("teilen durch", "divide by"), frage: zw(`Jetzt steht ${kT(k)} = ${sym(r)}. Durch welche Zahl teilst du beide Seiten?`, `Now ${kT(k)} = ${sym(r)}. By which number do you divide both sides?`),
      wert: k, fehler: [{ wert: -k, text: zw("Der Koeffizient von x ist positiv – teile durch ihn selbst, nicht durch sein Gegenteil.", "The coefficient of x is positive – divide by itself, not by its opposite.") }, { wert: r, text: zw("Du teilst durch den Faktor vor x, nicht durch die rechte Seite.", "You divide by the factor in front of x, not by the right side.") }],
      hinweise: [zw("Welcher Faktor steht direkt vor x?", "Which factor stands directly in front of x?")], erklaerung: `${k}x = ${sym(r)} ⇒ x = ${sym(r)} : ${k}.` },
    { id: "u4", titel: zw("Lösung", "Solution"), typ: "zahl", text: "x =", wert: X, frage: zw("Wie lautet die Lösung?", "What is the solution?"),
      hinweise: [zw("Rechne rechts durch den Koeffizienten.", "Divide the right side by the coefficient.")], erklaerung: zw(`x = ${sym(r)} : ${k} = ${sym(X)}. Probe: links ${sym(a * X + b)}, rechts ${sym(c * X + d)}.`, `x = ${sym(r)} : ${k} = ${sym(X)}. Check: left ${sym(a * X + b)}, right ${sym(c * X + d)}.`) },
  ], [au]);
  return (
    <Karte titel={zw("Umformungen trainieren", "Practise transformations")} hilfeId={`gu-${au.id}`} aufgabe="Gleichung lösen Äquivalenzumformung" neu={neu}>
      <p style={hinweis}>{zw("Du wählst jede Umformung einzeln – die App sagt dir genau, warum etwas nicht geht.", "You pick every transformation one by one – the app tells you exactly why something does not work.")}</p>
      <Zeile t={au.gl} />
      <SchrittFolge schritte={s} stand={stand} setStand={setStand} fertigText={zw("Geschafft – Schritt für Schritt gelöst, ohne einen Fehler zu übersehen.", "Done – solved step by step.")} />
    </Karte>
  );
}

/* ---------- 2) Methode wählen ---------- */
function MethodeWaehlen() {
  const [au, setAu] = useState(neueMethode);
  const [stand, setStand] = useState(0);
  const neu = () => { setAu(neueMethode()); setStand(0); };
  const L = au.loesungen;
  const erkl = {
    lin: zw("Eine Gleichung ersten Grades löst du mit Äquivalenzumformungen.", "A first-degree equation is solved with equivalence transformations."),
    aus: zw("Kein Absolutglied: x ausklammern, dann gilt der Satz vom Nullprodukt.", "No constant term: factor out x, then use the zero product property."),
    wurzel: zw("Nur x² und eine Zahl, kein x-Term: nach x² auflösen und beide Wurzeln nehmen (±).", "Only x² and a number, no x term: solve for x² and take both roots (±)."),
    pq: zw("Vollständige quadratische Gleichung: pq-Formel (oder Satz von Vieta).", "A complete quadratic equation: pq formula (or Vieta)."),
    log: zw("Die Unbekannte steht im Exponenten: Logarithmus bzw. Exponentenvergleich.", "The unknown is in the exponent: logarithm or comparing exponents."),
  }[au.t];
  const s = useMemo(() => {
    const out = [{ id: "m", titel: zw("Methode", "Method"), typ: "wahl", frage: zw("Welches Verfahren ist hier am schnellsten?", "Which method is the quickest here?"),
      optionen: METHODEN.map(([id, t]) => [id, t]), richtig: au.t, hinweise: [zw("Schau, welche Terme vorkommen: x², x, eine Zahl, oder x im Exponenten?", "Look at which terms appear: x², x, a number, or x in the exponent?")],
      fehler: au.t === "aus" ? [{ wahl: "pq", text: zw("Mit der pq-Formel kämst du auch ans Ziel, aber es geht schneller: Hier fehlt das Absolutglied – klammere x aus.", "The pq formula also works, but there is a faster way: the constant term is missing – factor out x.") }] : au.t === "wurzel" ? [{ wahl: "pq", text: zw("Hier fehlt der x-Term (p = 0). Einfacher: nach x² auflösen und die Wurzel ziehen.", "The x term is missing (p = 0). Simpler: solve for x² and take the root.") }] : [],
      erklaerung: erkl }];
    if (L.length === 1) out.push({ id: "x", titel: zw("Lösung", "Solution"), typ: "zahl", text: "x =", wert: L[0], frage: zw("Löse die Gleichung.", "Solve the equation."), hinweise: [zw("Wende das gewählte Verfahren an und mache die Probe.", "Apply the chosen method and check.")], erklaerung: `x = ${sym(L[0])}` });
    else out.push(
      { id: "x1", titel: zw("Kleinere Lösung", "Smaller solution"), typ: "zahl", text: "x₁ =", wert: L[0], frage: zw("Bestimme die kleinere der beiden Lösungen.", "Find the smaller of the two solutions."), hinweise: [zw("Es gibt zwei Lösungen – berechne beide.", "There are two solutions – compute both.")], erklaerung: `x₁ = ${sym(L[0])}` },
      { id: "x2", titel: zw("Größere Lösung", "Larger solution"), typ: "zahl", text: "x₂ =", wert: L[1], frage: zw("Und die größere?", "And the larger one?"), hinweise: [zw("Probe: Setze beide Werte in die Gleichung ein.", "Check: plug both values into the equation.")], erklaerung: `x₂ = ${sym(L[1])}. ${zw("Probe für beide Werte durchführen.", "Check both values.")}` });
    return out;
  }, [au]);
  return (
    <Karte titel={zw("Methode wählen", "Choose a method")} hilfeId={`gm-${au.id}`} aufgabe="Gleichung Methode wählen pq-Formel Ausklammern Wurzel Logarithmus" neu={neu}>
      <p style={hinweis}>{zw("Erst überlegen, dann rechnen: Welches Verfahren passt zu dieser Gleichung?", "Think first, then calculate: which method fits this equation?")}</p>
      <Zeile t={au.gl} />
      <SchrittFolge schritte={s} stand={stand} setStand={setStand} fertigText={zw("Richtig: passendes Verfahren und alle Lösungen.", "Correct: the right method and all solutions.")} />
    </Karte>
  );
}

/* ---------- 3) Fehler finden ---------- */
function FehlerFinden() {
  const [au, setAu] = useState(neuFehler);
  const [stand, setStand] = useState(0);
  const neu = () => { setAu(neuFehler()); setStand(0); };
  const { a, b, c, d, X, e } = au;
  const k = a - c, r = d - b;
  const s = useMemo(() => [
    { id: "wo", titel: zw("Wo steckt der Fehler?", "Where is the mistake?"), typ: "wahl", frage: zw("Eine Zeile folgt nicht korrekt aus der vorigen. Bei welchem Übergang passiert der erste Fehler?", "One line does not follow correctly from the previous one. At which step does the first mistake happen?"),
      optionen: au.optionen, richtig: String(e), hinweise: [zw("Rechne jeden Übergang selbst nach, von oben nach unten.", "Redo every step yourself, from top to bottom."), zw("Der erste falsche Übergang zählt – spätere Zeilen können aus dem Fehler konsequent folgen.", "The first wrong step counts – later lines may follow consistently from the mistake.")],
      erklaerung: au.optionen[e - 1][1] + ". " + au.text },
    { id: "was", titel: zw("Was wurde falsch gemacht?", "What went wrong?"), typ: "wahl", frage: zw("Welche Fehlerart passt?", "Which kind of mistake fits?"), optionen: mischen(au.arten), richtig: au.artRichtig,
      hinweise: [zw("Vergleiche die falsche Zeile mit der richtigen Umformung.", "Compare the wrong line with the correct transformation.")], erklaerung: au.text },
    { id: "x", titel: zw("Richtige Lösung", "Correct solution"), typ: "zahl", text: "x =", wert: X, frage: zw("Rechne die Aufgabe von Anfang an richtig durch. Wie lautet x?", "Redo the problem correctly from the start. What is x?"),
      hinweise: [zw("Beginne bei Zeile 1 und mache keine Abkürzungen.", "Start at line 1 and take no shortcuts.")], erklaerung: `${kT(k)} ${pl(b)} = ${d} ⇒ ${kT(k)} = ${sym(r)} ⇒ x = ${sym(X)}.` },
  ], [au]);
  return (
    <Karte titel={zw("Fehler finden", "Find the mistake")} hilfeId={`gf-${au.id}`} aufgabe="Fehler finden Gleichung Rechnung prüfen" neu={neu}>
      <p style={hinweis}>{zw("Diese Rechnung enthält genau einen Fehler. Finde ihn und rechne dann richtig.", "This calculation contains exactly one mistake. Find it, then calculate correctly.")}</p>
      {au.zeilen.map((z, i) => <div key={i} style={zeile}><span style={{ fontSize: 12.5, color: C.grau, minWidth: 54 }}>{zw("Zeile", "Line")} {i + 1}</span><M t={z} /></div>)}
      <SchrittFolge schritte={s} stand={stand} setStand={setStand} fertigText={zw("Fehler gefunden, erklärt und die Aufgabe richtig gelöst.", "Mistake found, explained, and the problem solved correctly.")} />
    </Karte>
  );
}

/* ---------- 4) Lösungsmenge verstehen ---------- */
function Loesungsmenge() {
  const [au, setAu] = useState(neueLoesungsmenge);
  const [stand, setStand] = useState(0);
  const neu = () => { setAu(neueLoesungsmenge()); setStand(0); };
  const { art, X, p, q, D, anzahl } = au;
  const opt = [["eine", `L = { ${sym(X ?? "x₀")} }`], ["keine", "L = { }"], ["alle", "L = ℝ"]];
  const s = useMemo(() => [
    { id: "l", titel: zw("Lösungsmenge der linearen Gleichung", "Solution set of the linear equation"), typ: "wahl", frage: zw("Forme um. Welche Lösungsmenge hat die Gleichung?", "Transform it. Which solution set does the equation have?"),
      optionen: opt.map(([id, t]) => [id, id === "eine" ? (art === "eine" ? t : zw("genau eine Lösung", "exactly one solution")) : t]), richtig: art,
      fehler: art === "keine" ? [{ wahl: "alle", text: zw("Am Ende steht eine falsche Aussage (z. B. 3 = 5). Dann passt kein x – die Lösungsmenge ist leer.", "In the end you get a false statement (e.g. 3 = 5). Then no x fits – the solution set is empty.") }] : art === "alle" ? [{ wahl: "keine", text: zw("Am Ende steht eine wahre Aussage (z. B. 4 = 4) ohne x. Dann passt jedes x – L = ℝ.", "In the end you get a true statement (e.g. 4 = 4) without x. Then every x fits – L = ℝ.") }] : [],
      hinweise: [zw("Bringe alle x auf eine Seite. Bleibt x übrig?", "Move all x to one side. Is any x left?"), zw("Fällt x ganz weg: wahre Aussage ⇒ alle x, falsche Aussage ⇒ kein x.", "If x cancels completely: true statement ⇒ all x, false statement ⇒ none.")],
      erklaerung: art === "eine" ? zw(`x bleibt übrig und liefert genau x = ${sym(X)}.`, `x remains and gives exactly x = ${sym(X)}.`) : art === "keine" ? zw("x fällt weg, übrig bleibt eine falsche Aussage ⇒ L = { }.", "x cancels and a false statement remains ⇒ L = { }.") : zw("x fällt weg, übrig bleibt eine wahre Aussage ⇒ L = ℝ.", "x cancels and a true statement remains ⇒ L = ℝ.") },
    { id: "D", titel: zw("Diskriminante", "Discriminant"), typ: "zahl", text: "D =", wert: D, frage: zw(`Nun die quadratische Gleichung unten. Berechne die Diskriminante D = p² − 4q mit p = ${sym(p)} und q = ${sym(q)}.`, `Now the quadratic equation below. Compute the discriminant D = p² − 4q with p = ${sym(p)} and q = ${sym(q)}.`),
      fehler: [{ wert: p * p - 2 * q, text: zw("Der Faktor vor q ist 4, nicht 2.", "The factor before q is 4, not 2.") }, { wert: -(p * p) - 4 * q, text: zw("p² ist immer positiv: (−p)² = p².", "p² is always positive: (−p)² = p².") }],
      hinweise: [zw("D = p² − 4 · q", "D = p² − 4 · q")], erklaerung: `D = (${sym(p)})² − 4 · ${q < 0 ? `(${sym(q)})` : q} = ${sym(D)}.` },
    { id: "n", titel: zw("Anzahl der Lösungen", "Number of solutions"), typ: "wahl", frage: zw("Wie viele reelle Lösungen hat die quadratische Gleichung?", "How many real solutions does the quadratic equation have?"),
      optionen: [["0", zw("keine", "none")], ["1", zw("genau eine (doppelte)", "exactly one (double)")], ["2", zw("zwei", "two")]], richtig: String(anzahl),
      fehler: [], hinweise: [zw("D > 0: zwei · D = 0: eine · D < 0: keine reelle Lösung.", "D > 0: two · D = 0: one · D < 0: no real solution.")],
      erklaerung: zw(`D = ${sym(D)} ${D > 0 ? "> 0 ⇒ zwei Lösungen" : D === 0 ? "= 0 ⇒ eine Lösung" : "< 0 ⇒ keine reelle Lösung"}.`, `D = ${sym(D)} ${D > 0 ? "> 0 ⇒ two solutions" : D === 0 ? "= 0 ⇒ one solution" : "< 0 ⇒ no real solution"}.`) },
  ], [au]);
  return (
    <Karte titel={zw("Lösungsmenge verstehen", "Understand the solution set")} hilfeId={`gl-${au.id}`} aufgabe="Lösungsmenge keine Lösung unendlich viele Diskriminante" neu={neu}>
      <p style={hinweis}>{zw("Nicht jede Gleichung hat genau eine Lösung. Hier siehst du, woran man das erkennt.", "Not every equation has exactly one solution. See how to tell.")}</p>
      <Zeile t={au.gl} />
      {stand >= 1 && <Zeile t={au.quad} />}
      <SchrittFolge schritte={s} stand={stand} setStand={setStand} fertigText={zw("Richtig – du erkennst, wann es keine, eine oder viele Lösungen gibt.", "Correct – you can tell when there are none, one or many solutions.")} />
    </Karte>
  );
}

/* ---------- 5) Geometrisch deuten ---------- */
function Geometrisch() {
  const [au, setAu] = useState(neuGeometrisch);
  const [stand, setStand] = useState(0);
  const neu = () => { setAu(neuGeometrisch()); setStand(0); };
  const { anzahl, loes, f, g } = au;
  const lo = Math.min(...(loes.length ? loes : [au.p]), au.p) - 3, hi = Math.max(...(loes.length ? loes : [au.p]), au.p) + 3.5;
  const pkt = stand >= 1 ? loes.map((x) => ({ x, y: g(x), farbe: C.signal, hohl: false })) : [];
  const s = useMemo(() => {
    const out = [
      { id: "n", titel: zw("Anzahl der Lösungen", "Number of solutions"), typ: "wahl", frage: zw("Die Gleichung f(x) = g(x) fragt, wo beide Graphen denselben Funktionswert haben. Wie viele Lösungen hat sie?", "The equation f(x) = g(x) asks where both graphs have the same value. How many solutions does it have?"),
        optionen: [["0", zw("keine", "none")], ["1", zw("eine", "one")], ["2", zw("zwei", "two")]], richtig: String(anzahl),
        fehler: [], hinweise: [zw("Zähle die Schnittpunkte der beiden Graphen.", "Count the intersection points of the two graphs."), zw("Eine Berührstelle zählt als eine Lösung.", "A touching point counts as one solution.")], erklaerung: zw(`Die Graphen haben ${anzahl} gemeinsame${anzahl === 1 ? "n" : ""} Punkt${anzahl === 1 ? "" : "e"}.`, `The graphs share ${anzahl} point${anzahl === 1 ? "" : "s"}.`) },
      { id: "w", titel: zw("Was liest du ab?", "What do you read off?"), typ: "wahl", frage: zw("Welche Koordinate eines Schnittpunkts ist die Lösung der Gleichung?", "Which coordinate of an intersection point is the solution of the equation?"),
        optionen: [["x", zw("die x-Koordinate", "the x-coordinate")], ["y", zw("die y-Koordinate", "the y-coordinate")], ["m", zw("die Steigung im Schnittpunkt", "the slope at the intersection")]], richtig: "x",
        fehler: [{ wahl: "y", text: zw("Die y-Koordinate ist der gemeinsame Funktionswert. Gesucht ist das x, für das beide Seiten gleich sind.", "The y-coordinate is the common function value. You are looking for the x for which both sides are equal.") }],
        hinweise: [zw("Die Unbekannte der Gleichung heißt x.", "The unknown of the equation is x.")], erklaerung: zw("Die Lösungen sind die x-Werte der Schnittpunkte.", "The solutions are the x-values of the intersection points.") },
    ];
    if (anzahl === 0) out.push({ id: "L", titel: zw("Lösungsmenge", "Solution set"), typ: "wahl", frage: zw("Wie schreibst du die Lösungsmenge auf?", "How do you write the solution set?"), optionen: [["leer", "L = { }"], ["R", "L = ℝ"], ["0", "L = { 0 }"]], richtig: "leer", hinweise: [zw("Keine Schnittpunkte – keine Lösung.", "No intersection points – no solution.")], erklaerung: "L = { }" });
    else out.push({ id: "x", titel: zw(anzahl === 1 ? "Lösung" : "Kleinere Lösung", anzahl === 1 ? "Solution" : "Smaller solution"), typ: "zahl", text: "x =", wert: loes[0], frage: zw(`Lies am Graphen die ${anzahl === 1 ? "x-Koordinate des gemeinsamen Punkts" : "kleinere x-Koordinate der beiden Schnittpunkte"} ab.`, `Read off the ${anzahl === 1 ? "x-coordinate of the common point" : "smaller x-coordinate of the two intersection points"} from the graph.`),
      hinweise: [zw("Gehe vom Schnittpunkt senkrecht zur x-Achse.", "Go vertically from the intersection to the x-axis.")], erklaerung: `x = ${sym(loes[0])}${anzahl === 2 ? `, ${zw("zweite Lösung", "second solution")} x = ${sym(loes[1])}` : ""}.` });
    if (anzahl === 2) out.push({ id: "x2", titel: zw("Größere Lösung", "Larger solution"), typ: "zahl", text: "x =", wert: loes[1], frage: zw("Und die größere?", "And the larger one?"), hinweise: [zw("Der zweite Schnittpunkt.", "The second intersection.")], erklaerung: `x = ${sym(loes[1])}` });
    return out;
  }, [au]);
  return (
    <Karte titel={zw("Geometrisch deuten", "Interpret geometrically")} hilfeId={`gg-${au.id}`} aufgabe="Gleichung geometrisch Schnittpunkte Graphen f(x)=g(x)" neu={neu}>
      <p style={hinweis}>{zw("Eine Gleichung f(x) = g(x) lösen heißt: Schnittpunkte der Graphen finden.", "Solving f(x) = g(x) means finding the intersection points of the graphs.")}</p>
      <FunktionsBild kurven={[{ f, farbe: C.see, name: "f" }, { f: g, farbe: C.flaggold, name: "g" }]} punkte={pkt} x0={lo} x1={hi} hoehe={210} />
      <SchrittFolge schritte={s} stand={stand} setStand={setStand} fertigText={zw("Richtig – Gleichung und Graph passen zusammen.", "Correct – equation and graph fit together.")} />
    </Karte>
  );
}

const MODI = [["umf", "Umformungen trainieren", "Practise transformations"], ["meth", "Methode wählen", "Choose a method"], ["fehl", "Fehler finden", "Find the mistake"], ["lm", "Lösungsmenge verstehen", "Solution set"], ["geo", "Geometrisch deuten", "Geometric view"]];
export function GleichungenVerstehen() {
  const [modus, setModus] = useState("umf");
  return (
    <Seite titel={zw("Gleichungen verstehen", "Understanding equations")} text={zw("Fünf Wege, Gleichungen wirklich zu durchschauen: Umformen, Methode wählen, Fehler finden, Lösungsmengen und der Blick auf den Graphen.", "Five ways to really understand equations: transforming, choosing a method, finding mistakes, solution sets and the graph view.")}>
      <div role="tablist" aria-label={zw("Übungen", "Exercises")} style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
        {MODI.map(([id, de, en]) => {
          const an = modus === id;
          return (
            <button key={id} type="button" role="tab" aria-selected={an} onClick={() => setModus(id)}
              style={{ minHeight: 48, padding: "8px 8px", borderRadius: 14, fontFamily: "inherit", cursor: "pointer", fontSize: 13.5, fontWeight: 700, lineHeight: 1.25, textAlign: "center", border: `1.5px solid ${an ? C.see : C.linie}`, background: an ? C.see : C.weiss, color: an ? C.weiss : C.see }}>{zw(de, en)}</button>
          );
        })}
      </div>
      <div style={{ display: modus === "umf" ? "block" : "none" }}><Umformungen /></div>
      <div style={{ display: modus === "meth" ? "block" : "none" }}><MethodeWaehlen /></div>
      <div style={{ display: modus === "fehl" ? "block" : "none" }}><FehlerFinden /></div>
      <div style={{ display: modus === "lm" ? "block" : "none" }}><Loesungsmenge /></div>
      <div style={{ display: modus === "geo" ? "block" : "none" }}><Geometrisch /></div>
    </Seite>
  );
}
void bruchTex;
