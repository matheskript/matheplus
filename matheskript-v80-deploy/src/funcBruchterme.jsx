/* ============================================================
   Mittelstufe · Bruchrechnen: Bruchterme und Bruchgleichungen
   · Entdecken – (x² − p²)/(x − p) gegen x + p: gleiche Werte überall,
     nur bei x = p ist der Bruchterm nicht definiert (Lücke im Graphen)
   · Üben – Definitionsmenge, Kürzen (nur Faktoren!), Addieren mit
     Hauptnenner, Bruchgleichung lösen, Falle: Lösung nicht in D.
   Mathematik in bruchGen.js (getestet).
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useMemo, useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { IchHaengeFest } from "./funcHilfe.jsx";
import { GrosserKnopf, hilfeKontext, hinweis, karte, kicker, zw } from "./ui2.jsx";
import { Aufklapp, ModusLeiste, Seite, SchrittFolge, zt } from "./ui3.jsx";
import { TERM_ARTEN, termAufgabe, xMinus } from "./bruchGen.js";
import { Merke, Regler, SCHRIFT, WertZeile } from "./geoUi.jsx";
import { Arbeitsflaeche, BildKarte, useBreite, useDesktop } from "./arbeitsflaeche.jsx";
import { ErgebnisKarte, StellKarte, useKarte } from "./funcZahlenDesktop.jsx";

let zaehler = 0;
const T = (t) => <M t={t} />;
const mz = (v) => String(v).replace("-", "−");
const plus = (p) => (p < 0 ? `− ${-p}` : `+ ${p}`);
const xPlus = (p) => (p === 0 ? "x" : `x ${plus(p)}`);

/* ---------- Modus 1: Entdecken ---------- */
function Entdecken() {
  const [p, setP] = useState(2);
  const [x, setX] = useState(0);
  const loch = Math.abs(x - p) < 1e-9;
  const wert = loch ? null : (x * x - p * p) / (x - p);
  /* Graph y = x + p mit Loch bei x = p – am Desktop in echten Pixeln (DESKTOP-STIL.md), Handy unverändert 320 × 220 */
  const desktop = useDesktop();
  const [plotRef, plotBreite] = useBreite();
  const gr = desktop && plotBreite;
  const W = gr ? plotBreite : 320, H = gr ? Math.round(plotBreite * 0.72) : 220, x0 = -6, x1 = 6, y0 = -4, y1 = 11;
  const sx = (v) => ((v - x0) / (x1 - x0)) * W, sy = (v) => H - ((v - y0) / (y1 - y0)) * H;
  const graph = (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label={zw("Graph mit Lücke", "Graph with a hole")}>
      {Array.from({ length: 13 }, (_, i) => <line key={`v${i}`} x1={sx(x0 + i)} y1={0} x2={sx(x0 + i)} y2={H} stroke={`${C.see}14`} />)}
      {Array.from({ length: 16 }, (_, i) => <line key={`h${i}`} x1={0} y1={sy(y0 + i)} x2={W} y2={sy(y0 + i)} stroke={`${C.see}14`} />)}
      <line x1={0} y1={sy(0)} x2={W} y2={sy(0)} stroke={C.hellgrau} />
      <line x1={sx(0)} y1={0} x2={sx(0)} y2={H} stroke={C.hellgrau} />
      <line x1={sx(x0)} y1={sy(x0 + p)} x2={sx(x1)} y2={sy(x1 + p)} stroke={C.see} strokeWidth="2.6" />
      <circle cx={sx(p)} cy={sy(2 * p)} r="5.5" fill={C.weiss} stroke={C.gruen} strokeWidth="2.2" />
      <line x1={sx(p)} y1={sy(2 * p)} x2={sx(p)} y2={sy(0)} stroke={C.gruen} strokeDasharray="3 3" />
      <text x={sx(p) + 8} y={sy(2 * p) - 8} style={{ fontSize: gr ? 12.5 : 11.5, fontWeight: 800, fill: C.gruen, fontFamily: SCHRIFT }}>{zw("Lücke", "hole")}</text>
      {!loch && x >= x0 && x <= x1 && wert <= y1 && wert >= y0 && <circle cx={sx(x)} cy={sy(wert)} r="5" fill={C.flaggold} stroke={C.seeTief} strokeWidth="1.2" />}
    </svg>
  );
  const werte = <>
    <WertZeile links={T(`\\frac{x² − ${p * p}}{x − ${p}}`)} rechts={loch ? zw("nicht definiert", "undefined") : zt(wert, 2)} farbe={loch ? C.gruen : C.see} />
    <WertZeile links={T(`x + ${p}`)} rechts={zt(x + p, 2)} />
  </>;
  const merkeText = loch
    ? zw(`Bei x = ${p} wird der Nenner 0 – durch 0 teilt man nicht. Der gekürzte Term x + ${p} hätte hier den Wert ${2 * p}, der Bruchterm hat dort gar keinen. Deshalb gehört zum Kürzen immer die Definitionsmenge: D = ℝ ∖ {${p}}.`,
      `At x = ${p} the denominator is 0 – you can't divide by 0. The simplified term x + ${p} would be ${2 * p} here, the fraction term has no value at all. That is why simplifying always comes with the domain: D = ℝ ∖ {${p}}.`)
    : zw(`Zähler mit der 3. binomischen Formel zerlegen: x² − ${p * p} = (x − ${p})(x + ${p}). Dann den gemeinsamen Faktor (x − ${p}) kürzen. Beide Terme liefern denselben Wert – außer bei x = ${p}. Stell x auf ${p}.`,
      `Factor the numerator with the difference of squares: x² − ${p * p} = (x − ${p})(x + ${p}). Then cancel the common factor (x − ${p}). Both terms give the same value – except at x = ${p}. Set x to ${p}.`);
  if (desktop) {
    return (
      <div style={{ marginTop: 16 }} data-bruchterm="breit">
        <Arbeitsflaeche
          links={<>
            <StellKarte titel={zw("Bruchterm gegen gekürzten Term", "Fraction term vs. simplified term")} kopf={T(`\\frac{x² − ${p * p}}{x − ${p}}`)} werte={[
              { name: "p", wert: p, setWert: setP, min: 1, max: 5, farbe: C.gruen },
              { name: "x", wert: x, setWert: setX, min: -6, max: 6, schritt: 0.5, format: (v) => zt(v, 1), regler: true },
            ]} />
            <ErgebnisKarte titel={zw("Werte an der Stelle x", "Values at x")}>{werte}</ErgebnisKarte>
          </>}
          rechts={<BildKarte><div ref={plotRef}>{graph}</div></BildKarte>} />
        <div style={{ marginTop: 8 }}><Merke farbe={loch ? C.gruen : C.see}>{merkeText}</Merke></div>
      </div>
    );
  }
  return (
    <>
      <div style={{ ...karte, marginTop: 16 }}>
        <p style={kicker}>{zw("Bruchterm gegen gekürzten Term", "Fraction term vs. simplified term")}</p>
        <div style={{ display: "grid", gap: 8 }}>
          <Regler name="p" wert={p} setWert={setP} min={1} max={5} schritt={1} farbe={C.gruen} format={(v) => String(v)} />
          <Regler name="x" wert={x} setWert={setX} min={-6} max={6} schritt={0.5} format={(v) => zt(v, 1)} />
        </div>
        <div style={{ marginTop: 12, background: C.sand, borderRadius: 14, padding: 8 }}>
          {graph}
        </div>
      </div>
      <div style={{ ...karte, marginTop: 12 }}>
        <p style={kicker}>{zw("Werte an der Stelle x", "Values at x")}</p>
        {werte}
        <Merke farbe={loch ? C.gruen : C.see}>
          {merkeText}
        </Merke>
      </div>
    </>
  );
}

/* ---------- Modus 2: Üben ---------- */
export function neueAufgabe(art) {
  return { id: ++zaehler, ...termAufgabe(art) };
}

const NENNER0 = {
  id: "bt-d-regel", titel: zw("Wann geht es nicht?", "When does it fail?"), typ: "wahl",
  frage: zw("Wann ist ein Bruchterm nicht definiert?", "When is a fraction term undefined?"),
  optionen: [["n", zw("wenn der Nenner 0 wird", "when the denominator becomes 0")], ["z", zw("wenn der Zähler 0 wird", "when the numerator becomes 0")], ["x", zw("wenn x negativ ist", "when x is negative")]], richtig: "n",
  fehler: [{ wahl: "z", text: zw("0 geteilt durch etwas ist einfach 0 – das ist erlaubt. Verboten ist nur das Teilen durch 0.", "0 divided by something is simply 0 – that is allowed. Only dividing by 0 is forbidden.") },
    { wahl: "x", text: zw("Negative Zahlen darf man ganz normal einsetzen.", "You can substitute negative numbers just fine.") }],
  hinweise: [zw("Durch welche Zahl darf man nie teilen?", "Which number can you never divide by?")],
  erklaerung: zw("Nicht definiert, wenn der Nenner 0 wird.", "Undefined when the denominator becomes 0."),
};

export function schritteVon(au) {
  if (au.art === "definition") {
    return [
      NENNER0,
      { id: "bt-d-x", titel: zw("Ausgeschlossene Zahl", "Excluded number"), typ: "zahl", text: "x =", wert: au.p, toleranz: 1e-9, wertText: mz(au.p),
        frage: zw("Für welche Zahl wird der Nenner 0?", "For which number does the denominator become 0?"),
        fehler: [{ wert: -au.p, text: zw(`Vorzeichen vertauscht: Bei x = ${mz(-au.p)} ist der Nenner ${mz(-2 * au.p)}, nicht 0. Löse ${xMinus(au.p)} = 0.`, `Sign swapped: at x = ${mz(-au.p)} the denominator is ${mz(-2 * au.p)}, not 0. Solve ${xMinus(au.p)} = 0.`) },
          ...(au.a !== 0 && Math.abs(-au.b / au.a - au.p) > 1e-9 ? [{ wert: -au.b / au.a, toleranz: 1e-9, text: zw("Hier wird der Zähler 0 – das ist erlaubt. Schau auf den Nenner.", "That makes the numerator 0 – which is allowed. Look at the denominator.") }] : [])],
        hinweise: [`${xMinus(au.p)} = 0`], erklaerung: `${xMinus(au.p)} = 0 ⇒ x = ${mz(au.p)}, D = ℝ ∖ {${mz(au.p)}}` },
    ];
  }
  if (au.art === "definition2") {
    return [
      { id: "bt-d2-f", titel: zw("Nenner zerlegen", "Factor the denominator"), typ: "wahl",
        frage: zw(`Zerlege den Nenner x² − ${au.p * au.p}.`, `Factor the denominator x² − ${au.p * au.p}.`),
        optionen: [["a", T(`(x − ${au.p})(x + ${au.p})`)], ["b", T(`(x − ${au.p})²`)], ["c", T(`x(x − ${au.p * au.p})`)]], richtig: "a",
        fehler: [{ wahl: "b", text: zw(`(x − ${au.p})² = x² − ${2 * au.p}x + ${au.p * au.p} – das ist die 2. binomische Formel.`, `(x − ${au.p})² = x² − ${2 * au.p}x + ${au.p * au.p} – that's the 2nd binomial formula.`) },
          { wahl: "c", text: zw("Ausmultipliziert gibt das x² − " + au.p * au.p + "x, nicht x² − " + au.p * au.p + ".", "Multiplied out that gives x² − " + au.p * au.p + "x, not x² − " + au.p * au.p + ".") }],
        hinweise: [zw("3. binomische Formel: a² − b² = (a − b)(a + b)", "Difference of squares: a² − b² = (a − b)(a + b)")],
        erklaerung: `x² − ${au.p * au.p} = (x − ${au.p})(x + ${au.p})` },
      { id: "bt-d2-k", titel: zw("Kleinere ausgeschlossene Zahl", "Smaller excluded number"), typ: "zahl", text: "x₁ =", wert: -au.p, toleranz: 1e-9, wertText: mz(-au.p),
        frage: zw("Ein Produkt ist 0, wenn ein Faktor 0 ist. Welche negative Zahl ist ausgeschlossen?", "A product is 0 when one factor is 0. Which negative number is excluded?"),
        fehler: [{ wert: -au.p * au.p, text: zw("Die Wurzel fehlt: x² = " + au.p * au.p + " hat die Lösungen ±" + au.p + ".", "The root is missing: x² = " + au.p * au.p + " has the solutions ±" + au.p + ".") }],
        hinweise: [`x + ${au.p} = 0`], erklaerung: `x + ${au.p} = 0 ⇒ x = −${au.p}` },
      { id: "bt-d2-g", titel: zw("Größere ausgeschlossene Zahl", "Larger excluded number"), typ: "zahl", text: "x₂ =", wert: au.p, toleranz: 1e-9, wertText: String(au.p),
        frage: zw("Und die positive?", "And the positive one?"),
        fehler: [{ wert: au.p * au.p, text: zw("Die Wurzel fehlt.", "The root is missing.") }],
        hinweise: [`x − ${au.p} = 0`], erklaerung: `x = ${au.p}, D = ℝ ∖ {−${au.p}; ${au.p}}` },
    ];
  }
  if (au.art === "kuerzen") {
    const { p, k } = au;
    if (au.variante === "binom") {
      return [
        { id: "bt-k-zerl", titel: zw("Zähler zerlegen", "Factor the numerator"), typ: "wahl",
          frage: zw("Kürzen darf man nur Faktoren. Schreibe den Zähler als Produkt.", "You may only cancel factors. Write the numerator as a product."),
          optionen: [["a", T(`(x − ${p})(x + ${p})`)], ["b", T(`(x − ${p})²`)], ["c", T(`x(x − ${p * p})`)]], richtig: "a",
          fehler: [{ wahl: "b", text: zw("Das wäre x² − " + 2 * p + "x + " + p * p + ".", "That would be x² − " + 2 * p + "x + " + p * p + ".") }, { wahl: "c", text: zw("Ausmultipliziert stimmt das nicht.", "Multiplied out, that doesn't match.") }],
          hinweise: [zw("3. binomische Formel", "Difference of squares")], erklaerung: `x² − ${p * p} = (x − ${p})(x + ${p})` },
        { id: "bt-k-erg", titel: zw("Gekürzter Term", "Simplified term"), typ: "wahl",
          frage: zw(`Kürze. (Es gilt x ≠ ${p}.)`, `Simplify. (x ≠ ${p}.)`),
          optionen: [["a", T(`x + ${p}`)], ["b", T(`x − ${p}`)], ["c", T(`x² − ${p}`)]], richtig: "a",
          fehler: [{ wahl: "b", text: zw(`Gekürzt wird der gemeinsame Faktor (x − ${p}). Übrig bleibt der andere Faktor.`, `The common factor (x − ${p}) cancels. The other factor remains.`) },
            { wahl: "c", text: zw("Du hast aus einer Differenz gekürzt. Kürzen geht nur bei Faktoren, nie bei einzelnen Summanden.", "You cancelled inside a difference. You can only cancel factors, never single terms of a sum.") }],
          hinweise: [T(`\\frac{(x − ${p})(x + ${p})}{x − ${p}}`)], erklaerung: `x + ${p}  (D = ℝ ∖ {${p}})` },
      ];
    }
    if (au.variante === "faktor") {
      return [
        { id: "bt-k2-a", titel: zw("Ausklammern", "Factor out"), typ: "wahl",
          frage: zw(`Klammere im Zähler ${k}x + ${k * p} aus.`, `Factor the numerator ${k}x + ${k * p}.`),
          optionen: [["a", T(`${k}(x + ${p})`)], ["b", T(`${k}(x + ${k * p})`)], ["c", T(`x(${k} + ${k * p})`)]], richtig: "a",
          fehler: [{ wahl: "b", text: zw(`Auch ${k * p} muss durch ${k} geteilt werden.`, `${k * p} also has to be divided by ${k}.`) }, { wahl: "c", text: zw(`${k * p} enthält kein x.`, `${k * p} contains no x.`) }],
          hinweise: [zw(`Beide Summanden sind Vielfache von ${k}.`, `Both terms are multiples of ${k}.`)], erklaerung: `${k}x + ${k * p} = ${k}(x + ${p})` },
        { id: "bt-k2-e", titel: zw("Gekürzter Term", "Simplified term"), typ: "wahl",
          frage: zw(`Kürze. (Es gilt x ≠ −${p}.)`, `Simplify. (x ≠ −${p}.)`),
          optionen: [["a", T(String(k))], ["b", T(`${k}x`)], ["c", T(`x + ${p}`)]], richtig: "a",
          fehler: [{ wahl: "b", text: zw("Das x steckt in der Klammer und wird mitgekürzt.", "The x is inside the bracket and cancels with it.") }, { wahl: "c", text: zw("Gekürzt wird gerade die Klammer (x + " + p + ").", "It is exactly the bracket (x + " + p + ") that cancels.") }],
          hinweise: [T(`\\frac{${k}(x + ${p})}{x + ${p}}`)], erklaerung: `${k}  (D = ℝ ∖ {−${p}})` },
      ];
    }
    return [
      { id: "bt-k3-a", titel: zw("Ausklammern", "Factor out"), typ: "wahl",
        frage: zw(`Klammere im Zähler x² + ${p}x aus.`, `Factor the numerator x² + ${p}x.`),
        optionen: [["a", T(`x(x + ${p})`)], ["b", T(`x(x + ${p}x)`)], ["c", T(`${p}(x² + x)`)]], richtig: "a",
        fehler: [{ wahl: "b", text: zw("Ausmultipliziert gäbe das x² + " + p + "x².", "Multiplied out that gives x² + " + p + "x².") }, { wahl: "c", text: zw("x² ist nicht durch " + p + " teilbar.", "x² is not divisible by " + p + ".") }],
        hinweise: [zw("Beide Summanden enthalten x.", "Both terms contain x.")], erklaerung: `x² + ${p}x = x(x + ${p})` },
      { id: "bt-k3-e", titel: zw("Gekürzter Term", "Simplified term"), typ: "wahl",
        frage: zw("Kürze den Faktor x. (Es gilt x ≠ 0.)", "Cancel the factor x. (x ≠ 0.)"),
        optionen: [["a", T(`\\frac{x + ${p}}{${k}}`)], ["b", T(`\\frac{x + ${p}x}{${k}}`)], ["c", T(`\\frac{x² + ${p}}{${k}}`)]], richtig: "a",
        fehler: [{ wahl: "c", text: zw("Gekürzt wird der Faktor x vor der Klammer, nicht ein x aus einem Summanden.", "You cancel the factor x in front of the bracket, not an x from one term.") }],
        hinweise: [T(`\\frac{x(x + ${p})}{${k}x}`)], erklaerung: T(`\\frac{x(x + ${p})}{${k}x} = \\frac{x + ${p}}{${k}}`) },
    ];
  }
  if (au.art === "addieren") {
    const { a, b, p } = au;
    return [
      { id: "bt-a-hn", titel: zw("Hauptnenner", "Common denominator"), typ: "wahl",
        frage: zw("Welcher Hauptnenner passt?", "Which common denominator fits?"),
        optionen: [["a", T(`x(x + ${p})`)], ["b", T(`2x + ${p}`)], ["c", T(`x + ${p}`)]], richtig: "a",
        fehler: [{ wahl: "b", text: zw("Nenner werden nicht addiert – wie bei Zahlen nimmt man das Produkt (oder das kgV).", "Denominators aren't added – as with numbers, take the product (or lcm).") },
          { wahl: "c", text: zw(`x + ${p} ist nicht durch x teilbar – der erste Bruch passt nicht hinein.`, `x + ${p} is not divisible by x – the first fraction doesn't fit.`) }],
        hinweise: [zw("Die Nenner x und x + " + p + " haben keinen gemeinsamen Faktor.", "The denominators x and x + " + p + " share no factor.")], erklaerung: `x(x + ${p})` },
      { id: "bt-a-e", titel: zw("Zusammenfassen", "Combine"), typ: "wahl",
        frage: zw("Erweitere beide Brüche und fasse zusammen.", "Expand both fractions and combine."),
        optionen: [["a", T(`\\frac{${au.zx}x + ${au.z0}}{x(x + ${p})}`)], ["b", T(`\\frac{${a + b}}{2x + ${p}}`)], ["c", T(`\\frac{${a + b}}{x(x + ${p})}`)]], richtig: "a",
        fehler: [{ wahl: "b", text: zw("Zähler plus Zähler durch Nenner plus Nenner – das geht bei Brüchen nie.", "Numerator plus numerator over denominator plus denominator – never works with fractions.") },
          { wahl: "c", text: zw("Die Zähler müssen beim Erweitern mit dem fehlenden Faktor malgenommen werden.", "When expanding, the numerators must be multiplied by the missing factor.") }],
        hinweise: [T(`\\frac{${a}(x + ${p})}{x(x + ${p})} + \\frac{${b}x}{x(x + ${p})}`)],
        erklaerung: T(`\\frac{${a}(x + ${p}) + ${b}x}{x(x + ${p})} = \\frac{${au.zx}x + ${au.z0}}{x(x + ${p})}`) },
    ];
  }
  if (au.art === "gleichung") {
    const { a, b, p } = au;
    return [
      { id: "bt-g-d", titel: zw("Definitionsmenge", "Domain"), typ: "zahl", text: zw("ausgeschlossen: x =", "excluded: x ="), wert: p, toleranz: 1e-9, wertText: mz(p),
        frage: zw("Welche Zahl darf x nicht sein?", "Which number may x not be?"),
        fehler: [{ wert: -p, text: zw(`Löse ${xMinus(p)} = 0.`, `Solve ${xMinus(p)} = 0.`) }],
        hinweise: [`${xMinus(p)} = 0`], erklaerung: `D = ℝ ∖ {${mz(p)}}` },
      { id: "bt-g-m", titel: zw("Nenner beseitigen", "Clear the denominator"), typ: "wahl",
        frage: zw("Womit multiplizierst du beide Seiten?", "What do you multiply both sides by?"),
        optionen: [["a", T(`(${xMinus(p)})`)], ["b", T(String(a))], ["c", T("x")]], richtig: "a",
        fehler: [{ wahl: "b", text: zw("Damit bleibt der Bruch stehen. Der Nenner verschwindet nur, wenn du mit ihm selbst malnimmst.", "The fraction would remain. The denominator only disappears if you multiply by it.") },
          { wahl: "c", text: zw(`Der Nenner ist ${xMinus(p)}, nicht nur x.`, `The denominator is ${xMinus(p)}, not just x.`) }],
        hinweise: [zw("Multipliziere mit dem Nenner.", "Multiply by the denominator.")], erklaerung: `${a} = ${b}(${xMinus(p)})` },
      { id: "bt-g-x", titel: zw("Lösen", "Solve"), typ: "zahl", text: "x =", wert: au.x, toleranz: 1e-9, wertText: mz(au.x),
        frage: zw("Löse nach x auf und prüfe, ob die Lösung in D liegt.", "Solve for x and check that the solution is in D."),
        fehler: [{ wert: a / b, text: zw(`Das ist x ${plus(-p)}. Bring noch ${mz(-p)} auf die andere Seite.`, `That is x ${plus(-p)}. Still move ${mz(-p)} to the other side.`) },
          ...(a / b - p !== au.x ? [{ wert: a / b - p, text: zw("Vorzeichenfehler beim Rüberbringen.", "Sign error when moving the term across.") }] : [])],
        hinweise: [`${xMinus(p)} = ${mz(a)} : ${b}`], erklaerung: `${xMinus(p)} = ${mz(a / b)} ⇒ x = ${mz(au.x)} ∈ D, L = {${mz(au.x)}}` },
    ];
  }
  /* falle */
  const { p, c } = au;
  return [
    { id: "bt-f-d", titel: zw("Definitionsmenge", "Domain"), typ: "zahl", text: zw("ausgeschlossen: x =", "excluded: x ="), wert: p, toleranz: 1e-9, wertText: String(p),
      frage: zw("Welche Zahl darf x nicht sein?", "Which number may x not be?"),
      fehler: [{ wert: -p, text: zw(`Löse x − ${p} = 0.`, `Solve x − ${p} = 0.`) }],
      hinweise: [`x − ${p} = 0`], erklaerung: `D = ℝ ∖ {${p}}` },
    { id: "bt-f-k", titel: zw("Rechnen", "Calculate"), typ: "zahl", text: "x =", wert: p, toleranz: 1e-9, wertText: String(p),
      frage: zw("Beide Seiten haben denselben Nenner. Setze die Zähler gleich und löse.", "Both sides have the same denominator. Set the numerators equal and solve."),
      hinweise: [`x + ${c} = ${p + c}`], erklaerung: `x + ${c} = ${p + c} ⇒ x = ${p}` },
    { id: "bt-f-l", titel: zw("Lösungsmenge", "Solution set"), typ: "wahl",
      frage: zw(`Was ist die Lösungsmenge?`, `What is the solution set?`),
      optionen: [["p", `L = {${p}}`], ["leer", "L = { }"], ["r", "L = ℝ"]], richtig: "leer",
      fehler: [{ wahl: "p", text: zw(`${p} liegt nicht in D – dort wird der Nenner 0. Diese „Lösung“ fällt weg.`, `${p} is not in D – the denominator is 0 there. This “solution” drops out.`) },
        { wahl: "r", text: zw("Die Zähler sind nur für eine Zahl gleich, nicht für alle.", "The numerators are equal for one number only, not for all.") }],
      hinweise: [zw("Prüfe die gefundene Zahl mit der Definitionsmenge.", "Check the number you found against the domain.")],
      erklaerung: zw(`x = ${p} ∉ D, also L = { }. Die Probe hätte eine Division durch 0 ergeben.`, `x = ${p} ∉ D, so L = { }. The check would have meant dividing by 0.`) },
  ];
}

function aufgabenText(au) {
  if (au.art === "definition") return <>{zw("Bestimme die Definitionsmenge von ", "Find the domain of ")}{T(`\\frac{${au.a === 1 ? "" : au.a}x ${plus(au.b)}}{${xMinus(au.p)}}`)}</>;
  if (au.art === "definition2") return <>{zw("Bestimme die Definitionsmenge von ", "Find the domain of ")}{T(`\\frac{${au.c}}{x² − ${au.p * au.p}}`)}</>;
  if (au.art === "kuerzen") {
    const t = au.variante === "binom" ? `\\frac{x² − ${au.p * au.p}}{x − ${au.p}}` : au.variante === "faktor" ? `\\frac{${au.k}x + ${au.k * au.p}}{x + ${au.p}}` : `\\frac{x² + ${au.p}x}{${au.k}x}`;
    return <>{zw("Kürze den Bruchterm: ", "Simplify the fraction term: ")}{T(t)}</>;
  }
  if (au.art === "addieren") return <>{zw("Fasse zusammen: ", "Combine: ")}{T(`\\frac{${au.a}}{x} + \\frac{${au.b}}{x + ${au.p}}`)}</>;
  if (au.art === "gleichung") return <>{zw("Löse die Bruchgleichung: ", "Solve the fractional equation: ")}{T(`\\frac{${mz(au.a)}}{${xMinus(au.p)}} = ${au.b}`)}</>;
  return <>{zw("Löse die Bruchgleichung: ", "Solve the fractional equation: ")}{T(`\\frac{x + ${au.c}}{x − ${au.p}} = \\frac{${au.p + au.c}}{x − ${au.p}}`)}</>;
}

const TITEL = {
  definition: ["Definitionsmenge", "Domain"], definition2: ["Definitionsmenge mit x²", "Domain with x²"], kuerzen: ["Kürzen", "Simplify"],
  addieren: ["Addieren", "Add"], gleichung: ["Bruchgleichung", "Fractional equation"], falle: ["Falle: Lösung prüfen", "Trap: check the solution"],
};

function hilfe(au) {
  return hilfeKontext({
    id: `bruchterm-${au.art}`, aufgabe: "Bruchterm Bruchgleichung Definitionsmenge kürzen Hauptnenner Nenner null",
    verstehen: [zw("Zuerst den Nenner anschauen: Für welche x wird er 0?", "Look at the denominator first: for which x does it become 0?")],
    ansatz: [zw("Kürzen: erst faktorisieren (ausklammern, binomische Formeln), dann gleiche Faktoren streichen.", "Simplifying: factor first (take out factors, binomial formulas), then cancel equal factors."),
      zw("Gleichung: mit dem Hauptnenner malnehmen, dann wie gewohnt lösen.", "Equation: multiply by the common denominator, then solve as usual.")],
    regel: [zw("Aus Summen wird nicht gekürzt – nur Faktoren.", "Never cancel terms of a sum – only factors."), zw("Jede Lösung mit der Definitionsmenge prüfen.", "Check every solution against the domain.")],
    pruefen: [zw("Setze die Lösung ein: Wird ein Nenner 0? Dann fällt sie weg.", "Substitute the solution: does a denominator become 0? Then it drops out.")],
  });
}

function Ueben() {
  const [art, setArt] = useState("mix");
  const [au, setAu] = useState(() => neueAufgabe());
  const [stand, setStand] = useState(0);
  const neu = (a = art) => { setAu(neueAufgabe(a === "mix" ? null : a)); setStand(0); };
  const schritte = useMemo(() => schritteVon(au), [au]);
  const ARTEN = [["mix", zw("Gemischt", "Mixed")], ...TERM_ARTEN.map((a) => [a, zw(TITEL[a][0], TITEL[a][1])])];
  const karte = useKarte();   // Desktop: feiner Rahmen statt Schatten
  return (
    <>
      <div style={{ ...karte, marginTop: 16 }}>
        <p style={kicker}>{zw("Aufgabentyp", "Exercise type")}</p>
        <div data-aufgabentyp style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {ARTEN.map(([id, t]) => (
            <button key={id} type="button" aria-pressed={art === id} onClick={() => { setArt(id); neu(id); }}
              style={{ padding: "6px 11px", borderRadius: 999, fontFamily: "inherit", fontSize: 12.5, fontWeight: 700, cursor: "pointer",
                border: `1.5px solid ${art === id ? C.see : C.linie}`, background: art === id ? C.see : C.weiss, color: art === id ? C.weiss : C.see }}>{t}</button>
          ))}
        </div>
      </div>
      <div style={{ ...karte, marginTop: 12 }} key={au.id}>
        <p style={kicker}>{zw(TITEL[au.art][0], TITEL[au.art][1])}</p>
        <p style={{ ...hinweis, color: C.tinte, fontSize: 15.5, marginBottom: 4 }}>{aufgabenText(au)}</p>
        <SchrittFolge schritte={schritte} stand={stand} setStand={setStand} fertigText={zw("Richtig gelöst.", "Solved.")} />
        <GrosserKnopf ghost onClick={() => neu()}>{zw("Neue Aufgabe", "New exercise")}</GrosserKnopf>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}><IchHaengeFest kontext={hilfe(au)} /></div>
      </div>
    </>
  );
}

const MODI = [["entdecken", zw("Entdecken", "Explore")], ["ueben", zw("Üben", "Practise")]];

export function Bruchterme() {
  const [modus, setModus] = useState("entdecken");
  return (
    <Seite titel={zw("Bruchterme und Bruchgleichungen", "Fraction terms and equations")}
      text={zw("Sobald x im Nenner steht, kommt eine neue Frage dazu: Wo ist der Term überhaupt definiert? Kürzen, zusammenfassen, Gleichungen lösen – und keine Scheinlösung durchrutschen lassen.",
        "As soon as x is in the denominator, a new question appears: where is the term defined at all? Simplify, combine, solve equations – and don't let a false solution slip through.")}>
      <ModusLeiste modi={MODI} modus={modus} setModus={setModus} label={zw("Bruchterme", "Fraction terms")} />
      <Aufklapp titel={zw("Kurz erklärt", "In short")}>
        <p style={{ margin: "0 0 6px" }}><b>{zw("Definitionsmenge:", "Domain:")}</b> {zw("alle Zahlen außer denen, für die ein Nenner 0 wird.", "all numbers except those that make a denominator 0.")}</p>
        <p style={{ margin: "0 0 6px" }}><b>{zw("Kürzen:", "Simplifying:")}</b> {zw("nur gemeinsame Faktoren – erst faktorisieren.", "only common factors – factor first.")} {T("\\frac{x² − 9}{x − 3} = \\frac{(x − 3)(x + 3)}{x − 3} = x + 3")}</p>
        <p style={{ margin: 0 }}><b>{zw("Gleichungen:", "Equations:")}</b> {zw("mit dem Hauptnenner malnehmen, lösen, dann jede Lösung mit D vergleichen.", "multiply by the common denominator, solve, then compare every solution with D.")}</p>
      </Aufklapp>
      <div style={{ display: modus === "entdecken" ? "block" : "none" }}><Entdecken /></div>
      <div style={{ display: modus === "ueben" ? "block" : "none" }}><Ueben /></div>
    </Seite>
  );
}
