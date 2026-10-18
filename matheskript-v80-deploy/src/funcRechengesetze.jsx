/* ============================================================
   Unterstufe · Rechengesetze und Rechenvorteile
   · Entdecken – Rechenreihenfolge Schritt für Schritt: Klammer →
     Potenz → Punkt → Strich, von links nach rechts; der jeweils nächste
     Rechenschritt wird markiert
   · Üben – Punkt vor Strich, Klammern, Potenzen, Distributivgesetz,
     Rechenvorteile, Gesetze benennen, Terme aus Text
   Mathematik in unterGen.js (getestet).
   ============================================================ */
import React, { useState } from "react";
import { C } from "./base1.jsx";
import { Auswahl, GrosserKnopf, hilfeKontext, karte, kicker, zw } from "./ui2.jsx";
import { RG_ARTEN, rgAufgabe } from "./unterGen.js";
import { Merke, UebenRahmen, ZweiModi, misch, ws, zs } from "./geoUi.jsx";

let zaehler = 0;

/* Schrittfolgen: [[…]] markiert den nächsten Rechenschritt */
const BEISPIELE = [
  { titel: "50 − 2 · (3 + 1)²", schritte: ["50 − 2 · [[(3 + 1)]]²", "50 − 2 · [[4²]]", "50 − [[2 · 16]]", "[[50 − 32]]", "18"], warum: [zw("Klammer zuerst", "Brackets first"), zw("dann Potenz", "then powers"), zw("dann Punkt", "then multiplication"), zw("zuletzt Strich", "subtraction last")] },
  { titel: "24 : 4 · 3", schritte: ["[[24 : 4]] · 3", "[[6 · 3]]", "18"], warum: [zw("gleiche Stufe: von links nach rechts", "same level: left to right"), zw("weiter von links", "continue from the left")] },
  { titel: "(8 + 4) : 3 − 2", schritte: ["[[(8 + 4)]] : 3 − 2", "[[12 : 3]] − 2", "[[4 − 2]]", "2"], warum: [zw("Klammer zuerst", "Brackets first"), zw("Punkt vor Strich", "multiplication/division before addition/subtraction"), zw("Strich", "subtraction")] },
  { titel: "7 · 98", schritte: ["7 · [[98]]", "[[7 · (100 − 2)]]", "[[700 − 14]]", "686"], warum: [zw("98 = 100 − 2 schreiben", "write 98 = 100 − 2"), zw("Distributivgesetz: ausmultiplizieren", "distributive law: multiply out"), zw("leicht im Kopf", "easy mentally")] },
  { titel: "25 · 17 · 4", schritte: ["25 · 17 · 4", "[[25 · 4]] · 17", "[[100 · 17]]", "1700"], warum: [zw("Kommutativgesetz: Faktoren tauschen", "commutative law: swap factors"), zw("Assoziativgesetz: günstig zusammenfassen", "associative law: group cleverly"), zw("mal 100 ist leicht", "times 100 is easy")] },
];

function Zeile({ t, aktiv }) {
  const teile = t.split(/(\[\[.*?\]\])/);
  return (
    <div style={{ fontSize: 20, fontWeight: 700, padding: "6px 0", color: aktiv ? C.tinte : C.hellgrau, fontVariantNumeric: "tabular-nums" }}>
      {teile.map((p, i) => (p.startsWith("[[")
        ? <span key={i} style={{ background: aktiv ? `${C.flaggold}66` : "transparent", borderRadius: 6, padding: "0 4px" }}>{p.slice(2, -2)}</span>
        : <span key={i}>{p}</span>))}
    </div>
  );
}

function Entdecken() {
  const [nr, setNr] = useState(0);
  const [s, setS] = useState(0);
  const B = BEISPIELE[nr];
  return (
    <div style={{ ...karte, marginTop: 16 }}>
      <p style={kicker}>{zw("Rechnung wählen", "Choose a calculation")}</p>
      <Auswahl optionen={BEISPIELE.map((b, i) => [String(i), b.titel])} wert={String(nr)} setWert={(v) => { setNr(Number(v)); setS(0); }} label={zw("Rechnung", "Calculation")} />
      <div style={{ marginTop: 12, background: C.sand, borderRadius: 14, padding: "10px 14px" }}>
        {B.schritte.slice(0, s + 1).map((t, i) => (
          <div key={i}>
            <Zeile t={(i ? "= " : "") + t} aktiv={i === s} />
            {i < s && <div style={{ fontSize: 12, color: C.gruen, fontWeight: 700, marginTop: -4 }}>↳ {B.warum[i]}</div>}
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
        <GrosserKnopf onClick={() => setS(s + 1)} disabled={s >= B.schritte.length - 1}>{zw("Nächster Schritt", "Next step")}</GrosserKnopf>
        <GrosserKnopf ghost onClick={() => setS(0)}>{zw("Von vorn", "Restart")}</GrosserKnopf>
      </div>
      <Merke>{zw("Reihenfolge: Klammern → Potenzen → Punktrechnung (· und :) → Strichrechnung (+ und −). Innerhalb einer Stufe von links nach rechts. Rechengesetze helfen, geschickt umzustellen.", "Order: brackets → powers → multiplication and division → addition and subtraction. Within a level, left to right. The laws of arithmetic help you rearrange cleverly.")}</Merke>
    </div>
  );
}

const TITEL = { punkt: ["Punkt vor Strich", "× before +"], klammer: ["Klammern", "Brackets"], potenz: ["Potenzen", "Powers"], distributiv: ["Distributivgesetz", "Distributive law"], vorteil: ["Rechenvorteil", "Clever calculation"], gesetz: ["Gesetz benennen", "Name the law"], text: ["Term aus Text", "Expression from words"] };
const neue = (art) => ({ id: ++zaehler, ...rgAufgabe(art) });
const GESETZ = {
  kommutativ: { bsp: "17 + 38 + 3 = 17 + 3 + 38", name: zw("Kommutativgesetz (Vertauschen)", "commutative law (swapping)") },
  assoziativ: { bsp: "(14 · 5) · 2 = 14 · (5 · 2)", name: zw("Assoziativgesetz (Klammern versetzen)", "associative law (moving brackets)") },
  distributiv: { bsp: "6 · (10 + 3) = 6 · 10 + 6 · 3", name: zw("Distributivgesetz (Ausmultiplizieren)", "distributive law (multiplying out)") },
};

function schritte(r) {
  switch (r.art) {
    case "punkt": return [
      ws("rg-p1", zw("Was zuerst?", "What first?"), zw("Welche Rechnung kommt zuerst?", "Which operation comes first?"), [["mal", `${r.b} · ${r.c}`], ["plus", `${r.a} + ${r.b}`]], "mal", { fehler: [{ wahl: "plus", text: zw("Punkt vor Strich: erst malnehmen.", "Multiplication before addition.") }], hinweis: zw("· und : vor + und −", "· and : before + and −"), erkl: `${r.b} · ${r.c} = ${r.b * r.c}` }),
      zs("rg-p2", zw("Ergebnis", "Result"), `${r.a} + ${r.b} · ${r.c} =`, r.wert, zw("Rechne aus.", "Calculate."), { fehler: [{ wert: r.falsch, text: zw("Von links nach rechts gerechnet – Punkt vor Strich vergessen.", "Calculated left to right – forgot × before +.") }], erkl: `${r.a} + ${r.b * r.c} = ${r.wert}` }),
    ];
    case "klammer": return [zs("rg-k", zw("Ergebnis", "Result"), `(${r.a} + ${r.b}) · ${r.c} =`, r.wert, zw("Rechne aus – die Klammer zuerst.", "Calculate – brackets first."), { fehler: [{ wert: r.falsch, text: zw("Die Klammer zählt zuerst: erst addieren, dann malnehmen.", "Brackets come first: add, then multiply.") }], hinweis: `${r.a + r.b} · ${r.c}`, erkl: `${r.a + r.b} · ${r.c} = ${r.wert}` })];
    case "potenz": return [
      zs("rg-po1", zw("Potenz", "Power"), `${r.b}² =`, r.b * r.b, zw("Berechne zuerst die Potenz.", "First calculate the power."), { fehler: [{ wert: 2 * r.b, text: zw("Hoch 2 heißt mit sich selbst malnehmen.", "Squared means multiplied by itself.") }], erkl: String(r.b * r.b) }),
      zs("rg-po2", zw("Ergebnis", "Result"), `${r.a} + ${r.b}² =`, r.wert, zw("Rechne aus.", "Calculate."), { fehler: [{ wert: r.falsch, text: zw("Die Potenz gehört nur zu " + r.b + ", nicht zur Summe.", "The power belongs only to " + r.b + ", not to the sum.") }], erkl: `${r.a} + ${r.b * r.b} = ${r.wert}` }),
    ];
    case "distributiv": return [
      zs("rg-d1", zw("Glatte Zahl", "Round number"), `${r.a} · ${r.rund} =`, r.a * r.rund, zw(`Schreibe ${r.n} = ${r.rund} − ${r.d}. Berechne zuerst ${r.a} · ${r.rund}.`, `Write ${r.n} = ${r.rund} − ${r.d}. First calculate ${r.a} · ${r.rund}.`), { erkl: String(r.a * r.rund) }),
      zs("rg-d2", zw("Korrektur", "Correction"), `${r.a} · ${r.d} =`, r.a * r.d, zw("Was musst du wieder abziehen?", "What do you have to subtract again?"), { erkl: String(r.a * r.d) }),
      zs("rg-d3", zw("Ergebnis", "Result"), `${r.a} · ${r.n} =`, r.wert, zw("Zusammenrechnen.", "Combine."), { fehler: [{ wert: r.a * r.rund - r.d, text: zw("Auch die " + r.d + " muss mit " + r.a + " multipliziert werden.", "The " + r.d + " must also be multiplied by " + r.a + ".") }], hinweis: `${r.a * r.rund} − ${r.a * r.d}`, erkl: `${r.a} · (${r.rund} − ${r.d}) = ${r.a * r.rund} − ${r.a * r.d} = ${r.wert}` }),
    ];
    case "vorteil": return [
      ws("rg-v1", zw("Geschickt kombinieren", "Combine cleverly"), zw("Welche zwei Faktoren rechnest du zuerst?", "Which two factors do you multiply first?"), misch([["xy", `${r.x} · ${r.y}`], ["xm", `${r.x} · ${r.m}`], ["ym", `${r.m} · ${r.y}`]], r.id), "xy", { fehler: [{ wahl: "xm", text: zw(`${r.x} · ${r.y} ergibt eine runde Zahl.`, `${r.x} · ${r.y} gives a round number.`) }, { wahl: "ym", text: zw(`${r.x} · ${r.y} ergibt eine runde Zahl.`, `${r.x} · ${r.y} gives a round number.`) }], hinweis: zw("Suche ein Paar, das 100 oder 1000 ergibt.", "Look for a pair that makes 100 or 1000."), erkl: `${r.x} · ${r.y} = ${r.x * r.y}` }),
      zs("rg-v2", zw("Ergebnis", "Result"), `${r.x} · ${r.m} · ${r.y} =`, r.wert, zw("Rechne aus.", "Calculate."), { hinweis: `${r.x * r.y} · ${r.m}`, erkl: `${r.x * r.y} · ${r.m} = ${r.wert}` }),
    ];
    case "gesetz": return [ws("rg-g", zw("Gesetz", "Law"), zw(`Welches Gesetz zeigt ${GESETZ[r.g].bsp}?`, `Which law does ${GESETZ[r.g].bsp} show?`), Object.keys(GESETZ).map((k) => [k, GESETZ[k].name]), r.g, { hinweis: zw("Tauschen, Klammern versetzen oder Ausmultiplizieren?", "Swapping, moving brackets or multiplying out?"), erkl: GESETZ[r.g].name })];
    default: {
      const T = { summeProdukt: [`${r.a} + ${r.b} · ${r.c}`, `(${r.a} + ${r.b}) · ${r.c}`, `${r.a} · ${r.b} + ${r.c}`], produktSumme: [`${r.a} · (${r.b} + ${r.c})`, `${r.a} · ${r.b} + ${r.c}`, `(${r.a} + ${r.b}) · ${r.c}`], differenzQuotient: [`(${r.d} − ${r.b}) : ${r.b}`, `${r.d} − ${r.b} : ${r.b}`, `${r.b} : (${r.d} − ${r.b})`] }[r.v];
      return [
        ws("rg-t1", zw("Term aufstellen", "Set up the expression"), zw("Welcher Term passt zum Text?", "Which expression matches the text?"), misch([["a", T[0]], ["b", T[1]], ["c", T[2]]], r.id), "a", { fehler: [{ wahl: "b", text: zw("Achte auf Klammern: Was wird zuerst gerechnet?", "Watch the brackets: what is calculated first?") }, { wahl: "c", text: zw("Die Reihenfolge der Zahlen stimmt nicht mit dem Text überein.", "The order of the numbers doesn't match the text.") }], hinweis: zw("Das letzte Wort im Satz („Summe“, „Produkt“ …) ist die zuletzt ausgeführte Rechnung.", "The main word (“sum”, “product” …) names the operation done last."), erkl: T[0] }),
        zs("rg-t2", zw("Ausrechnen", "Calculate"), `${T[0]} =`, r.wert, zw("Rechne aus.", "Calculate."), { erkl: String(r.wert) }),
      ];
    }
  }
}
function text(r) {
  switch (r.art) {
    case "punkt": return zw(`Berechne ${r.a} + ${r.b} · ${r.c}.`, `Calculate ${r.a} + ${r.b} · ${r.c}.`);
    case "klammer": return zw(`Berechne (${r.a} + ${r.b}) · ${r.c}.`, `Calculate (${r.a} + ${r.b}) · ${r.c}.`);
    case "potenz": return zw(`Berechne ${r.a} + ${r.b}².`, `Calculate ${r.a} + ${r.b}².`);
    case "distributiv": return zw(`Rechne geschickt im Kopf: ${r.a} · ${r.n}.`, `Calculate cleverly in your head: ${r.a} · ${r.n}.`);
    case "vorteil": return zw(`Rechne geschickt: ${r.x} · ${r.m} · ${r.y}.`, `Calculate cleverly: ${r.x} · ${r.m} · ${r.y}.`);
    case "gesetz": return zw("Welches Rechengesetz wird hier benutzt?", "Which law of arithmetic is used here?");
    default: return { summeProdukt: zw(`Addiere ${r.a} zum Produkt von ${r.b} und ${r.c}.`, `Add ${r.a} to the product of ${r.b} and ${r.c}.`), produktSumme: zw(`Multipliziere ${r.a} mit der Summe aus ${r.b} und ${r.c}.`, `Multiply ${r.a} by the sum of ${r.b} and ${r.c}.`), differenzQuotient: zw(`Dividiere die Differenz aus ${r.d} und ${r.b} durch ${r.b}.`, `Divide the difference of ${r.d} and ${r.b} by ${r.b}.`) }[r.v];
  }
}
const hilfe = (r) => hilfeKontext({
  id: `rechengesetze-${r.art}`, aufgabe: "Punkt vor Strich Klammer Potenz Rechengesetze Kommutativgesetz Assoziativgesetz Distributivgesetz Rechenvorteil Term",
  verstehen: [zw("Markiere, was zuerst gerechnet wird.", "Mark what is calculated first.")],
  ansatz: [zw("Klammer → Potenz → Punkt → Strich, sonst von links nach rechts.", "Brackets → powers → multiplication/division → addition/subtraction, otherwise left to right.")],
  regel: [zw("a + b = b + a, (a · b) · c = a · (b · c), a · (b + c) = a · b + a · c", "a + b = b + a, (a · b) · c = a · (b · c), a · (b + c) = a · b + a · c")],
  pruefen: [zw("Überschlage grob – passt die Größenordnung?", "Estimate roughly – is the order of magnitude right?")],
});

export function Rechengesetze() {
  return (
    <ZweiModi titel={zw("Rechengesetze und Rechenvorteile", "Laws of arithmetic and clever calculation")}
      text={zw("In welcher Reihenfolge wird gerechnet? Und wie rechnet man schwierige Aufgaben mit Vertauschen, Klammern und Ausmultiplizieren ganz leicht im Kopf?", "In what order do you calculate? And how do you make hard calculations easy in your head by swapping, bracketing and multiplying out?")}
      kurz={<p style={{ margin: 0 }}>{zw("Klammer vor Potenz vor Punkt vor Strich. Kommutativ: a + b = b + a. Assoziativ: (a + b) + c = a + (b + c). Distributiv: a · (b + c) = a · b + a · c.", "Brackets before powers before multiplication before addition. Commutative: a + b = b + a. Associative: (a + b) + c = a + (b + c). Distributive: a · (b + c) = a · b + a · c.")}</p>}
      entdecken={<Entdecken />}
      ueben={<UebenRahmen titel={TITEL} arten={RG_ARTEN} neue={neue} schritte={schritte} text={text} hilfe={hilfe} />} />
  );
}
