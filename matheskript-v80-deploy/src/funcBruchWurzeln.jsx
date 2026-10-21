/* ============================================================
   Mittelstufe · „Brüche und Wurzeln“ – Trainer im Kurs Mittelstufe
   (Werkzeug-Band: Geraden · Parabeln · Pythagoras · Gleichungen · Brüche und √Wurzeln)
   · Brüche  – die Übungen aus Bruchterme (Definitionsmenge, Kürzen, Hauptnenner,
               Bruchgleichung, Falle „Lösung nicht in D“)
   · Wurzeln – Quadratwurzeln ziehen, teilweise Wurzel ziehen, Wurzeln multiplizieren,
               Falle √(a² + b²) ≠ a + b, Nenner rational machen, Wurzel aus einem Bruch
   Mathematik in wurzelGen.js (getestet), Schritte über SchrittFolge (ui3.jsx).
   Wurzeln nur über $\sqrt{…}$ (M/MS zeichnen den Linienzug) – nie „√“ + eigene Linie.
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useMemo, useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { IchHaengeFest } from "./funcHilfe.jsx";
import { GrosserKnopf, hilfeKontext, hinweis, kicker, zw } from "./ui2.jsx";
import { Aufklapp, ModusLeiste, Seite, SchrittFolge } from "./ui3.jsx";
import { WURZEL_ARTEN, wurzelAufgabe } from "./wurzelGen.js";
import { wahlDrehen } from "./antwortReihenfolge.js";
import { useKarte } from "./funcZahlenDesktop.jsx";
import { Ueben as BruchtermeUeben } from "./funcBruchterme.jsx";

let zaehler = 0;
const T = (t) => <M t={t} />;
const W = (r) => `\\sqrt{${r}}`;

export function neueWurzelAufgabe(art) {
  return { id: ++zaehler, ...wurzelAufgabe(art) };
}


export function wurzelSchritte(au) {
  const schritte = wurzelSchritteRoh(au);
  const s0 = (au.id || 0) + (au.k || 0) + (au.p || 0) + (au.a || 0);
  return wahlDrehen(schritte, s0);   // richtige Antwort nicht immer vorn
}

function wurzelSchritteRoh(au) {
  if (au.art === "ziehen") {
    const { k, r } = au;
    return [
      { id: "wz-z", titel: zw("Wurzel ziehen", "Take the root"), typ: "zahl", text: `$${W(r)} =$`, wert: k, toleranz: 1e-9, wertText: String(k),
        frage: zw(`Welche positive Zahl ergibt mit sich selbst malgenommen ${r}?`, `Which positive number multiplied by itself gives ${r}?`),
        fehler: [{ wert: r / 2, text: zw(`Wurzelziehen ist nicht Halbieren. Gesucht ist die Zahl x mit x · x = ${r}.`, `Taking a root is not halving. You need the number x with x · x = ${r}.`) },
          { wert: -k, text: zw("Die Quadratwurzel ist immer die positive Zahl.", "The square root is always the positive number.") }],
        hinweise: [zw(`Probiere: ${k - 1} · ${k - 1} = ${(k - 1) * (k - 1)} – etwas zu klein.`, `Try: ${k - 1} · ${k - 1} = ${(k - 1) * (k - 1)} – a bit too small.`)],
        erklaerung: `$${k} · ${k} = ${r}$, ${zw("also", "so")} $${W(r)} = ${k}$` },
    ];
  }
  if (au.art === "teilweise") {
    const { k, m, r } = au;
    return [
      { id: "wz-t-z", titel: zw("Quadratzahl abspalten", "Split off a square"), typ: "wahl",
        frage: zw(`Zerlege ${r} so, dass eine möglichst große Quadratzahl als Faktor dasteht.`, `Split ${r} so that the largest possible square number is a factor.`),
        optionen: [["a", T(`${k * k} · ${m}`)], ["b", T(`${k * k} + ${r - k * k}`)], ["c", T(`${k} · ${k * m}`)]], richtig: "a",
        fehler: [{ wahl: "b", text: zw("Aus einer Summe darf man die Wurzel nicht teilweise ziehen – nur aus einem Produkt.", "You can't partly take the root of a sum – only of a product.") },
          { wahl: "c", text: zw(`Das ist ein Produkt, aber keiner der Faktoren ist eine Quadratzahl. Suche einen Faktor wie 4, 9, 16, 25 …`, `That's a product, but neither factor is a square number. Look for a factor like 4, 9, 16, 25 …`) }],
        hinweise: [zw("Quadratzahlen: 4, 9, 16, 25, 36, 49 … Welche teilt " + r + "?", "Square numbers: 4, 9, 16, 25, 36, 49 … Which one divides " + r + "?")],
        erklaerung: `$${r} = ${k * k} · ${m}$` },
      { id: "wz-t-k", titel: zw("Vor die Wurzel ziehen", "Move it in front of the root"), typ: "zahl", text: zw("Zahl vor der Wurzel:", "Number in front of the root:"), wert: k, toleranz: 1e-9, wertText: String(k),
        frage: `$${W(r)} = ${W(`${k * k} · ${m}`)} = $ □ $ · ${W(m)}$`,
        fehler: [{ wert: k * k, text: zw(`Vor die Wurzel kommt $${W(k * k)} = ${k}$, nicht ${k * k} selbst.`, `What goes in front is $${W(k * k)} = ${k}$, not ${k * k} itself.`) },
          { wert: m, text: zw(`${m} bleibt unter der Wurzel – davor steht die Wurzel der Quadratzahl.`, `${m} stays under the root – the root of the square goes in front.`) }],
        hinweise: [`$${W(`${k * k} · ${m}`)} = ${W(k * k)} · ${W(m)}$`],
        erklaerung: `$${W(r)} = ${W(k * k)} · ${W(m)} = ${k}${W(m)}$` },
    ];
  }
  if (au.art === "produkt") {
    const { a, b, n } = au;
    return [
      { id: "wz-p-r", titel: zw("Regel wählen", "Pick the rule"), typ: "wahl",
        frage: zw(`Wie fasst du $${W(a)} · ${W(b)}$ zusammen?`, `How do you combine $${W(a)} · ${W(b)}$?`),
        optionen: [["a", T(W(`${a} · ${b}`))], ["b", T(W(`${a} + ${b}`))], ["c", T(`${a} · ${b}`)]], richtig: "a",
        fehler: [{ wahl: "b", text: zw("Malgenommen wird unter der Wurzel auch malgenommen – nicht addiert.", "A product stays a product under the root – nothing is added.") },
          { wahl: "c", text: zw("Die Wurzel verschwindet nicht – sie steht über dem ganzen Produkt.", "The root doesn't disappear – it covers the whole product.") }],
        hinweise: [`$${W("x")} · ${W("y")} = ${W("x · y")}$`], erklaerung: `$${W(a)} · ${W(b)} = ${W(a * b)}$` },
      { id: "wz-p-e", titel: zw("Ausrechnen", "Work it out"), typ: "zahl", text: `$${W(a)} · ${W(b)} =$`, wert: n, toleranz: 1e-9, wertText: String(n),
        frage: zw(`Ziehe die Wurzel aus ${a * b}.`, `Take the root of ${a * b}.`),
        fehler: [{ wert: a * b, text: zw(`Das ist ${a * b} – jetzt noch die Wurzel ziehen.`, `That's ${a * b} – now take the root.`) }],
        hinweise: [zw(`Welche Zahl mal sich selbst ergibt ${a * b}?`, `Which number times itself gives ${a * b}?`)],
        erklaerung: `$${W(a * b)} = ${n}$` },
    ];
  }
  if (au.art === "summe") {
    const { a, b, c } = au;
    return [
      { id: "wz-s-e", titel: zw("Erst unter der Wurzel rechnen", "Work under the root first"), typ: "zahl", text: `$${W(`${a}^2 + ${b}^2`)} =$`, wert: c, toleranz: 1e-9, wertText: String(c),
        frage: zw("Berechne den Wert.", "Work out the value."),
        fehler: [{ wert: a + b, text: zw(`Falle: Die Wurzel einer Summe ist nicht die Summe der Wurzeln. Erst ${a * a} + ${b * b} = ${a * a + b * b}, dann die Wurzel.`, `Trap: the root of a sum is not the sum of the roots. First ${a * a} + ${b * b} = ${a * a + b * b}, then the root.`) },
          { wert: a * a + b * b, text: zw(`Das ist der Wert unter der Wurzel – jetzt noch die Wurzel ziehen.`, `That's the value under the root – now take the root.`) }],
        hinweise: [`$${a}^2 + ${b}^2 = ${a * a} + ${b * b} = ${a * a + b * b}$`],
        erklaerung: `$${W(`${a * a} + ${b * b}`)} = ${W(a * a + b * b)} = ${c}$` },
      { id: "wz-s-r", titel: zw("Was gilt allgemein?", "What holds in general?"), typ: "wahl",
        frage: zw(`Hier ist $${W(`${a}^2 + ${b}^2`)} = ${c}$, aber ${a} + ${b} = ${a + b}. Was folgt daraus?`, `Here $${W(`${a}^2 + ${b}^2`)} = ${c}$, but ${a} + ${b} = ${a + b}. What follows?`),
        optionen: [["a", zw("Aus einer Summe darf man die Wurzel nicht gliedweise ziehen.", "You can't take the root of a sum term by term.")],
          ["b", T(`${W("x + y")} = ${W("x")} + ${W("y")}`)], ["c", zw("Das gilt nur bei ungeraden Zahlen.", "That only holds for odd numbers.")]], richtig: "a",
        fehler: [{ wahl: "b", text: zw(`Gerade widerlegt: ${c} ≠ ${a + b}.`, `Just disproved: ${c} ≠ ${a + b}.`) },
          { wahl: "c", text: zw("Mit Paritäten hat das nichts zu tun – es geht nie gliedweise.", "Parity has nothing to do with it – it never works term by term.") }],
        hinweise: [zw("Ein Gegenbeispiel reicht, um eine Regel zu widerlegen.", "One counterexample is enough to disprove a rule.")],
        erklaerung: `$${W("x + y")} ≠ ${W("x")} + ${W("y")}$ ${zw("(nur bei x = 0 oder y = 0 gleich)", "(equal only if x = 0 or y = 0)")}` },
    ];
  }
  if (au.art === "nenner") {
    const { a, k, m } = au;
    return [
      { id: "wz-n-e", titel: zw("Erweitern", "Expand"), typ: "wahl",
        frage: zw(`Womit erweiterst du $\\frac{${a}}{${W(m)}}$, damit im Nenner keine Wurzel mehr steht?`, `What do you expand $\\frac{${a}}{${W(m)}}$ by so that no root is left in the denominator?`),
        optionen: [["a", T(W(m))], ["b", T(String(m))], ["c", T(String(a))]], richtig: "a",
        fehler: [{ wahl: "b", text: zw(`Dann steht im Nenner $${m}${W(m)}$ – die Wurzel ist immer noch da.`, `Then the denominator is $${m}${W(m)}$ – the root is still there.`) },
          { wahl: "c", text: zw("Erweitern mit dem Zähler hilft nicht: Die Wurzel bleibt im Nenner.", "Expanding by the numerator doesn't help: the root stays in the denominator.") }],
        hinweise: [`$${W(m)} · ${W(m)} = ${m}$`], erklaerung: `$\\frac{${a}}{${W(m)}} = \\frac{${a}${W(m)}}{${m}}$` },
      { id: "wz-n-k", titel: zw("Kürzen", "Simplify"), typ: "zahl", text: zw("Zahl vor der Wurzel:", "Number in front of the root:"), wert: k, toleranz: 1e-9, wertText: String(k),
        frage: `$\\frac{${a}${W(m)}}{${m}} = $ □ $ · ${W(m)}$`,
        fehler: [{ wert: a, text: zw(`Der Nenner ${m} fehlt noch: ${a} : ${m} = ${k}.`, `The denominator ${m} is still missing: ${a} : ${m} = ${k}.`) },
          { wert: a * m, text: zw(`Du hast mit ${m} malgenommen statt durch ${m} geteilt.`, `You multiplied by ${m} instead of dividing by it.`) }],
        hinweise: [`${a} : ${m}`], erklaerung: `$\\frac{${a}${W(m)}}{${m}} = ${k}${W(m)}$` },
    ];
  }
  /* bruch */
  const { p, q } = au;
  return [
    { id: "wz-b", titel: zw("Wurzel aus einem Bruch", "Root of a fraction"), typ: "wahl",
      frage: zw(`Berechne $${W(`\\frac{${p * p}}{${q * q}}`)}$.`, `Work out $${W(`\\frac{${p * p}}{${q * q}}`)}$.`),
      optionen: [["a", T(`\\frac{${p}}{${q}}`)], ["b", T(`\\frac{${p}}{${q * q}}`)], ["c", T(`\\frac{${p * p}}{${q}}`)]], richtig: "a",
      fehler: [{ wahl: "b", text: zw("Die Wurzel gilt für Zähler und Nenner – auch der Nenner wird gezogen.", "The root applies to numerator and denominator – take the root of the denominator too.") },
        { wahl: "c", text: zw("Auch der Zähler steht unter der Wurzel.", "The numerator is under the root as well.") }],
      hinweise: [`$${W("\\frac{x}{y}")} = \\frac{${W("x")}}{${W("y")}}$`],
      erklaerung: `$${W(`\\frac{${p * p}}{${q * q}}`)} = \\frac{${W(p * p)}}{${W(q * q)}} = \\frac{${p}}{${q}}$` },
  ];
}

function aufgabenText(au) {
  if (au.art === "ziehen") return <>{zw("Ziehe die Wurzel: ", "Take the root: ")}{T(W(au.r))}</>;
  if (au.art === "teilweise") return <>{zw("Ziehe teilweise die Wurzel: ", "Partly take the root: ")}{T(W(au.r))}</>;
  if (au.art === "produkt") return <>{zw("Fasse zusammen und rechne aus: ", "Combine and work out: ")}{T(`${W(au.a)} · ${W(au.b)}`)}</>;
  if (au.art === "summe") return <>{zw("Berechne: ", "Work out: ")}{T(W(`${au.a}^2 + ${au.b}^2`))}</>;
  if (au.art === "nenner") return <>{zw("Mache den Nenner wurzelfrei: ", "Rationalise the denominator: ")}{T(`\\frac{${au.a}}{${W(au.m)}}`)}</>;
  return <>{zw("Berechne: ", "Work out: ")}{T(W(`\\frac{${au.p * au.p}}{${au.q * au.q}}`))}</>;
}

const TITEL = {
  ziehen: ["Wurzel ziehen", "Take a root"], teilweise: ["Teilweise Wurzel ziehen", "Partial root"], produkt: ["Wurzeln multiplizieren", "Multiply roots"],
  summe: ["Falle: Wurzel einer Summe", "Trap: root of a sum"], nenner: ["Nenner wurzelfrei", "Rationalise"], bruch: ["Wurzel aus einem Bruch", "Root of a fraction"],
};

function hilfe(au) {
  return hilfeKontext({
    id: `wurzel-${au.art}`, aufgabe: "Quadratwurzel Wurzel ziehen teilweise Wurzelgesetze Nenner rational machen",
    verstehen: [zw("Die Wurzel aus a ist die positive Zahl, die mit sich selbst malgenommen a ergibt.", "The root of a is the positive number that gives a when multiplied by itself.")],
    ansatz: [zw("Bei Produkten und Brüchen darf man die Wurzel aufteilen, bei Summen nie.", "With products and fractions you may split the root, with sums never."),
      zw("Teilweise Wurzel ziehen: eine Quadratzahl als Faktor abspalten.", "Partial root: split off a square number as a factor.")],
    regel: ["√(a · b) = √a · √b", "√(a / b) = √a / √b", zw("√(a + b) ≠ √a + √b", "√(a + b) ≠ √a + √b")],
    pruefen: [zw("Quadriere dein Ergebnis – kommt die Zahl unter der Wurzel heraus?", "Square your result – do you get the number under the root?")],
  });
}

function WurzelUeben() {
  const [art, setArt] = useState("mix");
  const [au, setAu] = useState(() => neueWurzelAufgabe());
  const [stand, setStand] = useState(0);
  const neu = (a = art) => { setAu(neueWurzelAufgabe(a === "mix" ? null : a)); setStand(0); };
  const schritte = useMemo(() => wurzelSchritte(au), [au]);
  /* für automatische Prüfungen (tests/ui/mittelstufe-kurs.ui.py): Aufgabe und richtige Antworten je Schritt */
  if (typeof window !== "undefined") window.__wzAufgabe = { ...au, antworten: schritte.map((st) => (st.typ === "wahl" ? { wahl: st.optionen.findIndex((o) => o[0] === st.richtig) } : { zahl: st.wertText })) };
  const ARTEN = [["mix", zw("Gemischt", "Mixed")], ...WURZEL_ARTEN.map((a) => [a, zw(TITEL[a][0], TITEL[a][1])])];
  const karte = useKarte();
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
      <div style={{ ...karte, marginTop: 12 }} key={au.id} data-wurzel-aufgabe={au.art}>
        <p style={kicker}>{zw(TITEL[au.art][0], TITEL[au.art][1])}</p>
        <p style={{ ...hinweis, color: C.tinte, fontSize: 15.5, marginBottom: 4 }}>{aufgabenText(au)}</p>
        <SchrittFolge schritte={schritte} stand={stand} setStand={setStand} fertigText={zw("Richtig gelöst.", "Solved.")} />
        <GrosserKnopf ghost onClick={() => neu()}>{zw("Neue Aufgabe", "New exercise")}</GrosserKnopf>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}><IchHaengeFest kontext={hilfe(au)} /></div>
      </div>
    </>
  );
}

const MODI = [["brueche", zw("Brüche", "Fractions")], ["wurzeln", zw("Wurzeln", "Roots")]];

export function BruchWurzeln() {
  const [modus, setModus] = useState("brueche");
  return (
    <Seite titel={zw("Brüche und Wurzeln", "Fractions and roots")}
      text={zw("Zwei Dinge, an denen in der Mittelstufe fast jede Rechnung hängt: Bruchterme sauber kürzen und lösen – und mit Quadratwurzeln rechnen, ohne in die typischen Fallen zu tappen.",
        "Two things almost every calculation in middle school depends on: simplifying and solving fraction terms cleanly – and working with square roots without falling into the usual traps.")}>
      <ModusLeiste modi={MODI} modus={modus} setModus={setModus} label={zw("Brüche und Wurzeln", "Fractions and roots")} />
      {modus === "brueche" ? (
        <Aufklapp titel={zw("Kurz erklärt", "In short")}>
          <p style={{ margin: "0 0 6px" }}><b>{zw("Definitionsmenge:", "Domain:")}</b> {zw("alle Zahlen außer denen, für die ein Nenner 0 wird.", "all numbers except those that make a denominator 0.")}</p>
          <p style={{ margin: "0 0 6px" }}><b>{zw("Kürzen:", "Simplifying:")}</b> {zw("nur gemeinsame Faktoren – erst faktorisieren.", "only common factors – factor first.")}</p>
          <p style={{ margin: 0 }}><b>{zw("Gleichungen:", "Equations:")}</b> {zw("mit dem Hauptnenner malnehmen, lösen, jede Lösung mit D vergleichen.", "multiply by the common denominator, solve, compare every solution with D.")}</p>
        </Aufklapp>
      ) : (
        <Aufklapp titel={zw("Kurz erklärt", "In short")}>
          <p style={{ margin: "0 0 6px" }}><b>{zw("Produkte und Brüche:", "Products and fractions:")}</b> {T(`${W("a · b")} = ${W("a")} · ${W("b")}`)}, {T(`${W("\\frac{a}{b}")} = \\frac{${W("a")}}{${W("b")}}`)}</p>
          <p style={{ margin: "0 0 6px" }}><b>{zw("Teilweise Wurzel ziehen:", "Partial root:")}</b> {T(`${W(50)} = ${W("25 · 2")} = 5${W(2)}`)}</p>
          <p style={{ margin: 0 }}><b>{zw("Falle:", "Trap:")}</b> {T(`${W("9 + 16")} = 5`)}{zw(", nicht 3 + 4.", ", not 3 + 4.")}</p>
        </Aufklapp>
      )}
      <div style={{ display: modus === "brueche" ? "block" : "none" }}><BruchtermeUeben /></div>
      <div style={{ display: modus === "wurzeln" ? "block" : "none" }}><WurzelUeben /></div>
    </Seite>
  );
}
