/* ============================================================
   Stochastik: Hypothesentests (Binomialtest)
   · Test aufbauen – Sachkontext lesen, H₀ und Testrichtung bestimmen,
     Verteilung am Rand von H₀, Ablehnungsbereich, Entscheidung formulieren
   · Ablehnungsbereich – Grenze am Histogramm verschieben, bis der
     größte Bereich mit P(X ∈ A) ≤ α erreicht ist
   · Fehler verstehen – Fehler 1. Art unter H₀, Fehler 2. Art für ein
     konkretes p₁, Simulation vieler Tests
   Grundsätze: Nichtverwerfen von H₀ ist kein Beweis; diskrete Grenzen
   halten das Niveau ein (tatsächliches α′ ≤ α).
   Rechnungen in hypo.js. Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useMemo, useState } from "react";
import { C } from "./base1.jsx";
import { IchHaengeFest } from "./funcHilfe.jsx";
import { GrosserKnopf, Rueck, Stufe, hilfeKontext, hinweis, karte, kicker, zw } from "./ui2.jsx";
import { wahl } from "./rechnen2.js";
import { Aufklapp, Balken, Marke, ModusLeiste, Seite, SchrittFolge, zf, zt } from "./ui3.jsx";
import { binomTabelle, fehler1, fehler2, imBereich, kritisch, kumuliert, pAb, pAblehnung, pBis, simuliereTests } from "./hypo.js";

let zaehler = 0;
const pT = (p) => (Math.abs(p - 1 / 6) < 1e-12 ? "1/6" : zt(p, 3));
const prz = (a) => `${zt(a * 100, 1)} %`;

/* ---------- Sachkontexte ---------- */
const KONTEXTE = [
  { id: "defekt", p0: 0.05, r: "rechts", ns: [50, 100], X: zw("Anzahl defekter Bauteile", "number of defective parts"),
    text: (n) => zw(`Ein Hersteller behauptet, höchstens 5 % seiner Bauteile seien defekt. Ein Kunde vermutet einen höheren Anteil und prüft ${n} zufällig ausgewählte Bauteile.`, `A manufacturer claims that at most 5 % of its parts are defective. A customer suspects a higher share and checks ${n} randomly chosen parts.`),
    h1: zw("Der Kunde vermutet mehr Defekte – das ist H₁: p > 0,05. Die angezweifelte Behauptung „höchstens 5 %“ ist H₀.", "The customer suspects more defects – that is H₁: p > 0.05. The doubted claim “at most 5 %” is H₀.") },
  { id: "partei", p0: 0.4, r: "links", ns: [50, 100], X: zw("Anzahl der Befragten, die die Partei wählen würden", "number of respondents who would vote for the party"),
    text: (n) => zw(`Eine Partei behauptet, mindestens 40 % der Wahlberechtigten würden sie wählen. Eine Journalistin zweifelt daran und befragt ${n} zufällig ausgewählte Wahlberechtigte.`, `A party claims that at least 40 % of voters would vote for it. A journalist doubts this and asks ${n} randomly chosen voters.`),
    h1: zw("Die Journalistin vermutet weniger Zustimmung – H₁: p < 0,4. Die Behauptung „mindestens 40 %“ ist H₀.", "The journalist suspects less support – H₁: p < 0.4. The claim “at least 40 %” is H₀.") },
  { id: "wuerfel", p0: 1 / 6, r: "beide", ns: [60, 120], X: zw("Anzahl der Sechsen", "number of sixes"),
    text: (n) => zw(`Ein Würfel soll fair sein. Um zu prüfen, ob die Sechs zu oft oder zu selten fällt, wird er ${n}-mal geworfen.`, `A die is supposed to be fair. To check whether six comes up too often or too rarely, it is rolled ${n} times.`),
    h1: zw("Abweichungen in beide Richtungen sprechen gegen Fairness – H₁: p ≠ 1/6, H₀: p = 1/6.", "Deviations in both directions speak against fairness – H₁: p ≠ 1/6, H₀: p = 1/6.") },
  { id: "medikament", p0: 0.6, r: "rechts", ns: [50, 100], X: zw("Anzahl der geheilten Patienten", "number of cured patients"),
    text: (n) => zw(`Ein bewährtes Medikament heilt 60 % der Erkrankten. Eine Firma will zeigen, dass ihr neues Medikament besser wirkt, und testet es an ${n} Patienten.`, `A proven drug cures 60 % of patients. A company wants to show that its new drug works better and tests it on ${n} patients.`),
    h1: zw("Gezeigt werden soll „besser“ – das ist H₁: p > 0,6. H₀ ist „nicht besser“: p ≤ 0,6.", "What should be shown is “better” – that is H₁: p > 0.6. H₀ is “not better”: p ≤ 0.6.") },
  { id: "freiwurf", p0: 0.7, r: "links", ns: [20, 50], X: zw("Anzahl der Treffer", "number of hits"),
    text: (n) => zw(`Eine Basketballerin behauptet, mindestens 70 % ihrer Freiwürfe zu treffen. Ihr Trainer zweifelt und lässt sie ${n} Freiwürfe werfen.`, `A basketball player claims to make at least 70 % of her free throws. Her coach doubts it and has her take ${n} free throws.`),
    h1: zw("Der Trainer vermutet eine schlechtere Quote – H₁: p < 0,7. H₀: p ≥ 0,7.", "The coach suspects a lower rate – H₁: p < 0.7. H₀: p ≥ 0.7.") },
  { id: "muenze", p0: 0.5, r: "beide", ns: [50, 100], X: zw("Anzahl „Kopf“", "number of heads"),
    text: (n) => zw(`Eine Münze soll fair sein. Sie wird ${n}-mal geworfen, um zu prüfen, ob „Kopf“ zu oft oder zu selten fällt.`, `A coin is supposed to be fair. It is tossed ${n} times to check whether heads comes up too often or too rarely.`),
    h1: zw("Beide Richtungen sind verdächtig – H₁: p ≠ 0,5, H₀: p = 0,5.", "Both directions are suspicious – H₁: p ≠ 0.5, H₀: p = 0.5.") },
];

const zufallsK = (n, p) => { let k = 0; for (let i = 0; i < n; i++) if (Math.random() < p) k++; return k; };
function testAufgabe(nurEinseitig = false) {
  const kx = wahl(nurEinseitig ? KONTEXTE.filter((k) => k.r !== "beide") : KONTEXTE);
  const n = wahl(kx.ns), alpha = wahl([0.05, 0.05, 0.1, 0.01]);
  const r = kritisch(n, kx.p0, alpha, kx.r);
  const dir = kx.r === "links" ? -1 : 1;
  const p1 = Math.round(Math.min(0.95, Math.max(0.02, kx.p0 + dir * (kx.p0 < 0.1 ? 0.05 : 0.1))) * 100) / 100;
  const pWahr = Math.random() < 0.5 ? kx.p0 : p1;
  return { id: ++zaehler, ...kx, n, alpha, krit: r, p1, k: zufallsK(n, pWahr) };
}
const bereichText = (r, richtung, n) => (richtung === "links" ? (r.g < 0 ? "A = { }" : `A = {0; …; ${r.g}}`) : richtung === "rechts" ? (r.g > n ? "A = { }" : `A = {${r.g}; …; ${n}}`)
  : `A = {0; …; ${r.gl}} ∪ {${r.gr}; …; ${n}}`);
const H0 = (au) => (au.r === "links" ? `H₀: p ≥ ${pT(au.p0)}` : au.r === "rechts" ? `H₀: p ≤ ${pT(au.p0)}` : `H₀: p = ${pT(au.p0)}`);

function hilfeTest(id, au) {
  return hilfeKontext({
    id, aufgabe: "Hypothesentest Nullhypothese Signifikanzniveau Ablehnungsbereich Fehler erster zweiter Art",
    verstehen: [
      zw("Welche Behauptung wird angezweifelt, und was vermutet die zweifelnde Person?", "Which claim is doubted, and what does the doubter suspect?"),
      zw("H₀ ist die angezweifelte Behauptung (bzw. „kein Effekt“). H₁ ist das, was man nachweisen will.", "H₀ is the doubted claim (or “no effect”). H₁ is what you want to show."),
      au.h1,
    ],
    ansatz: [
      zw("Welche Werte von X sprechen gegen H₀ – große, kleine oder beide?", "Which values of X speak against H₀ – large, small or both?"),
      zw("Daraus folgt die Lage des Ablehnungsbereichs: links, rechts oder auf beiden Seiten.", "This gives the position of the rejection region: left, right or both sides."),
      zw(`Unter H₀ (am Rand) ist X ~ B(${au.n}; ${pT(au.p0)}). Suche den größten Bereich mit P(X ∈ A) ≤ α${au.r === "beide" ? " – zweiseitig je Seite α/2" : ""}.`, `Under H₀ (at the boundary) X ~ B(${au.n}; ${pT(au.p0)}). Find the largest region with P(X ∈ A) ≤ α${au.r === "beide" ? " – two-sided α/2 per side" : ""}.`),
    ],
    regel: [
      zw("Welche Wahrscheinlichkeit darf der Ablehnungsbereich unter H₀ höchstens haben?", "What probability may the rejection region have under H₀ at most?"),
      zw("P(X ∈ A) ≤ α. Für einen rechten Bereich: P(X ≥ g) = 1 − P(X ≤ g − 1).", "P(X ∈ A) ≤ α. For a right region: P(X ≥ g) = 1 − P(X ≤ g − 1)."),
      zw("Fehler 1. Art: H₀ verworfen, obwohl wahr. Fehler 2. Art: H₀ nicht verworfen, obwohl falsch.", "Type I error: H₀ rejected although true. Type II error: H₀ kept although false."),
    ],
    pruefen: [
      zw("Ist P(X ∈ A) wirklich ≤ α – und wäre der Bereich um einen Wert größer schon zu groß?", "Is P(X ∈ A) really ≤ α – and would one more value already be too much?"),
      zw("Liegt der Ablehnungsbereich auf der Seite, die gegen H₀ spricht?", "Is the rejection region on the side that speaks against H₀?"),
      zw("Formuliere vorsichtig: „H₀ wird nicht verworfen“ heißt nicht „H₀ ist bewiesen“.", "Phrase carefully: “H₀ is not rejected” does not mean “H₀ is proven”."),
    ],
    regeln: [{ name: "Höchstens und mindestens", bereich: "stochastik" }, { name: "Bernoulli-Formel", bereich: "stochastik" }, { name: "Gegenereignis", bereich: "stochastik" }],
  });
}

/* Tabelle der kumulierten Wahrscheinlichkeiten in einem Fenster */
function KumTabelle({ n, p, von, bis }) {
  const c = kumuliert(binomTabelle(n, p));
  const zeilen = []; for (let k = Math.max(0, von); k <= Math.min(n, bis); k++) zeilen.push(k);
  const z = { padding: "4px 8px", borderBottom: `1px solid ${C.linie}`, textAlign: "right", fontVariantNumeric: "tabular-nums" };
  return (
    <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13, color: C.tinte }}>
      <thead><tr><th style={{ ...z, textAlign: "left", color: C.grau }}>k</th><th style={{ ...z, color: C.grau }}>P(X ≤ k)</th><th style={{ ...z, color: C.grau }}>P(X ≥ k)</th></tr></thead>
      <tbody>{zeilen.map((k) => <tr key={k}><td style={{ ...z, textAlign: "left", fontWeight: 700 }}>{k}</td><td style={z}>{zf(pBis(c, k))}</td><td style={z}>{zf(pAb(c, k))}</td></tr>)}</tbody>
    </table>
  );
}
const fenster = (au) => {
  const mu = au.n * au.p0, s = Math.sqrt(au.n * au.p0 * (1 - au.p0));
  return [Math.max(0, Math.floor(mu - 4 * s) - 1), Math.min(au.n, Math.ceil(mu + 4 * s) + 1)];
};

/* ---------- Modus 1: Test aufbauen ---------- */
function TestAufbauen() {
  const [au, setAu] = useState(() => testAufgabe());
  const [stand, setStand] = useState(0);
  const neu = () => { setAu(testAufgabe()); setStand(0); };
  const { n, p0, alpha, krit: r } = au;
  const c = useMemo(() => kumuliert(binomTabelle(n, p0)), [au]);
  const drin = imBereich(au.k, r, au.r);
  const tabVon = au.r === "rechts" ? r.g - 6 : au.r === "links" ? r.g - 5 : r.gl - 4;
  const tabBis = au.r === "rechts" ? r.g + 5 : au.r === "links" ? r.g + 6 : r.gl + 4;
  const schritte = useMemo(() => {
    const s = [
      { id: "h0", titel: zw("Nullhypothese", "Null hypothesis"), typ: "wahl", frage: zw("Welche Hypothese ist H₀?", "Which hypothesis is H₀?"),
        optionen: [["le", `H₀: p ≤ ${pT(p0)}`], ["ge", `H₀: p ≥ ${pT(p0)}`], ["eq", `H₀: p = ${pT(p0)}`]], richtig: au.r === "rechts" ? "le" : au.r === "links" ? "ge" : "eq",
        hinweise: [zw("H₀ ist die Behauptung, die angezweifelt wird – H₁ das, was man zeigen möchte bzw. vermutet.", "H₀ is the doubted claim – H₁ is what you want to show or suspect."), au.h1],
        erklaerung: au.h1 },
      { id: "richtung", titel: zw("Testrichtung", "Direction of the test"), typ: "wahl", frage: zw(`X ist die ${au.X}. Welche Werte von X sprechen gegen H₀?`, `X is the ${au.X}. Which values of X speak against H₀?`),
        optionen: [["links", zw("kleine Werte – linksseitiger Test", "small values – left-sided test")], ["rechts", zw("große Werte – rechtsseitiger Test", "large values – right-sided test")], ["beide", zw("sehr kleine und sehr große – zweiseitiger Test", "very small and very large – two-sided test")]], richtig: au.r,
        hinweise: [zw("Welche Abweichung stellt die Behauptung infrage?", "Which deviation calls the claim into question?"), au.h1],
        erklaerung: au.r === "links" ? zw("Auffällig wenige Treffer sprechen gegen H₀ – der Ablehnungsbereich liegt links.", "Strikingly few successes speak against H₀ – the rejection region is on the left.")
          : au.r === "rechts" ? zw("Auffällig viele Treffer sprechen gegen H₀ – der Ablehnungsbereich liegt rechts.", "Strikingly many successes speak against H₀ – the rejection region is on the right.")
            : zw("Zu viele und zu wenige Treffer sprechen gegen H₀ – Ablehnungsbereich auf beiden Seiten, je α/2.", "Too many and too few successes speak against H₀ – rejection region on both sides, α/2 each.") },
      { id: "vert", titel: zw("Verteilung unter H₀", "Distribution under H₀"), typ: "wahl", frage: zw("Mit welcher Verteilung rechnest du den Ablehnungsbereich aus?", "Which distribution do you use to compute the rejection region?"),
        optionen: [["p0", `X ~ B(${n}; ${pT(p0)})`], ["alpha", `X ~ B(${n}; ${zt(alpha, 2)})`], ["beob", `X ~ B(${n}; ${zt(au.k / n, 2)})`]], richtig: "p0",
        fehler: [{ wahl: "alpha", text: zw("α ist das Signifikanzniveau, keine Trefferwahrscheinlichkeit.", "α is the significance level, not a success probability.") }, { wahl: "beob", text: zw("Den Ablehnungsbereich legt man vor der Beobachtung fest – gerechnet wird unter H₀.", "The rejection region is fixed before the observation – compute under H₀.") }],
        hinweise: [zw("Der Ablehnungsbereich wird unter der Annahme berechnet, dass H₀ gilt – am Rand p = p₀.", "The rejection region is computed assuming H₀ – at the boundary p = p₀.")],
        erklaerung: zw(`Gerechnet wird am Rand von H₀: X ~ B(${n}; ${pT(p0)}). Dort ist die Gefahr eines Fehlers 1. Art am größten.`, `Compute at the boundary of H₀: X ~ B(${n}; ${pT(p0)}). That is where a type I error is most likely.`) },
    ];
    if (au.r === "rechts") {
      s.push({ id: "g", titel: zw("Ablehnungsbereich", "Rejection region"), typ: "zahl", text: "g =", wert: r.g, wertText: String(r.g), breite: 80,
        frage: zw(`A = {g; …; ${n}}. Bestimme das kleinste g mit P(X ≥ g) ≤ ${zt(alpha, 2)}. Die Tabelle unten hilft.`, `A = {g; …; ${n}}. Find the smallest g with P(X ≥ g) ≤ ${zt(alpha, 2)}. The table below helps.`),
        fehler: [{ wert: r.g - 1, text: zw(`P(X ≥ ${r.g - 1}) = ${zf(pAb(c, r.g - 1))} ist größer als α – dieser Bereich ist zu groß.`, `P(X ≥ ${r.g - 1}) = ${zf(pAb(c, r.g - 1))} is larger than α – this region is too big.`) },
          { wert: r.g + 1, text: zw(`P(X ≥ ${r.g + 1}) ≤ α stimmt, aber auch mit ${r.g} bleibt man unter α. Gesucht ist der größte zulässige Bereich.`, `P(X ≥ ${r.g + 1}) ≤ α holds, but ${r.g} also stays below α. You want the largest admissible region.`) }],
        hinweise: [zw("P(X ≥ g) = 1 − P(X ≤ g − 1). Suche in der Tabelle, wo P(X ≥ k) zum ersten Mal ≤ α wird.", "P(X ≥ g) = 1 − P(X ≤ g − 1). Look in the table where P(X ≥ k) first drops to ≤ α.")],
        erklaerung: zw(`P(X ≥ ${r.g}) = ${zf(pAb(c, r.g))} ≤ ${zt(alpha, 2)}, aber P(X ≥ ${r.g - 1}) = ${zf(pAb(c, r.g - 1))} > ${zt(alpha, 2)}. Also ${bereichText(r, au.r, n)}.`, `P(X ≥ ${r.g}) = ${zf(pAb(c, r.g))} ≤ ${zt(alpha, 2)}, but P(X ≥ ${r.g - 1}) = ${zf(pAb(c, r.g - 1))} > ${zt(alpha, 2)}. So ${bereichText(r, au.r, n)}.`) });
    } else if (au.r === "links") {
      s.push({ id: "g", titel: zw("Ablehnungsbereich", "Rejection region"), typ: "zahl", text: "g =", wert: r.g, wertText: String(r.g), breite: 80,
        frage: zw(`A = {0; …; g}. Bestimme das größte g mit P(X ≤ g) ≤ ${zt(alpha, 2)}. Die Tabelle unten hilft.`, `A = {0; …; g}. Find the largest g with P(X ≤ g) ≤ ${zt(alpha, 2)}. The table below helps.`),
        fehler: [{ wert: r.g + 1, text: zw(`P(X ≤ ${r.g + 1}) = ${zf(pBis(c, r.g + 1))} ist größer als α – dieser Bereich ist zu groß.`, `P(X ≤ ${r.g + 1}) = ${zf(pBis(c, r.g + 1))} is larger than α – this region is too big.`) },
          { wert: r.g - 1, text: zw(`Zulässig, aber nicht der größte Bereich: auch P(X ≤ ${r.g}) ist noch ≤ α.`, `Admissible, but not the largest region: P(X ≤ ${r.g}) is still ≤ α.`) }],
        hinweise: [zw("Suche in der Tabelle den letzten Wert k, bei dem P(X ≤ k) noch ≤ α ist.", "Find the last k in the table with P(X ≤ k) still ≤ α.")],
        erklaerung: zw(`P(X ≤ ${r.g}) = ${zf(pBis(c, r.g))} ≤ ${zt(alpha, 2)}, aber P(X ≤ ${r.g + 1}) = ${zf(pBis(c, r.g + 1))} > ${zt(alpha, 2)}. Also ${bereichText(r, au.r, n)}.`, `P(X ≤ ${r.g}) = ${zf(pBis(c, r.g))} ≤ ${zt(alpha, 2)}, but P(X ≤ ${r.g + 1}) = ${zf(pBis(c, r.g + 1))} > ${zt(alpha, 2)}. So ${bereichText(r, au.r, n)}.`) });
    } else {
      const ganzL = kritisch(n, p0, alpha, "links").g, ganzR = kritisch(n, p0, alpha, "rechts").g;
      s.push({ id: "gl", titel: zw("Linke Grenze", "Left limit"), typ: "zahl", text: "g₁ =", wert: r.gl, wertText: String(r.gl), breite: 80,
        frage: zw(`Linker Teil {0; …; g₁}: größtes g₁ mit P(X ≤ g₁) ≤ α/2 = ${zt(alpha / 2, 3)}.`, `Left part {0; …; g₁}: largest g₁ with P(X ≤ g₁) ≤ α/2 = ${zt(alpha / 2, 3)}.`),
        fehler: [...(ganzL !== r.gl ? [{ wert: ganzL, text: zw("Beim zweiseitigen Test bekommt jede Seite nur α/2, nicht das ganze α.", "In a two-sided test each side only gets α/2, not the whole α.") }] : []),
          { wert: r.gl + 1, text: zw(`P(X ≤ ${r.gl + 1}) = ${zf(pBis(c, r.gl + 1))} ist größer als α/2.`, `P(X ≤ ${r.gl + 1}) = ${zf(pBis(c, r.gl + 1))} is larger than α/2.`) }],
        hinweise: [zw("Jede Seite darf höchstens α/2 bekommen.", "Each side may get at most α/2.")],
        erklaerung: zw(`P(X ≤ ${r.gl}) = ${zf(pBis(c, r.gl))} ≤ ${zt(alpha / 2, 3)} < P(X ≤ ${r.gl + 1}) = ${zf(pBis(c, r.gl + 1))}.`, `P(X ≤ ${r.gl}) = ${zf(pBis(c, r.gl))} ≤ ${zt(alpha / 2, 3)} < P(X ≤ ${r.gl + 1}) = ${zf(pBis(c, r.gl + 1))}.`) });
      s.push({ id: "gr", titel: zw("Rechte Grenze", "Right limit"), typ: "zahl", text: "g₂ =", wert: r.gr, wertText: String(r.gr), breite: 80,
        frage: zw(`Rechter Teil {g₂; …; ${n}}: kleinstes g₂ mit P(X ≥ g₂) ≤ α/2.`, `Right part {g₂; …; ${n}}: smallest g₂ with P(X ≥ g₂) ≤ α/2.`),
        fehler: [...(ganzR !== r.gr ? [{ wert: ganzR, text: zw("Auch rechts gilt nur α/2.", "On the right, too, only α/2 is allowed.") }] : []),
          { wert: r.gr - 1, text: zw(`P(X ≥ ${r.gr - 1}) = ${zf(pAb(c, r.gr - 1))} ist größer als α/2.`, `P(X ≥ ${r.gr - 1}) = ${zf(pAb(c, r.gr - 1))} is larger than α/2.`) }],
        hinweise: [zw("P(X ≥ g₂) = 1 − P(X ≤ g₂ − 1) ≤ α/2", "P(X ≥ g₂) = 1 − P(X ≤ g₂ − 1) ≤ α/2")],
        erklaerung: zw(`P(X ≥ ${r.gr}) = ${zf(pAb(c, r.gr))} ≤ ${zt(alpha / 2, 3)} < P(X ≥ ${r.gr - 1}) = ${zf(pAb(c, r.gr - 1))}. Also ${bereichText(r, au.r, n)}.`, `P(X ≥ ${r.gr}) = ${zf(pAb(c, r.gr))} ≤ ${zt(alpha / 2, 3)} < P(X ≥ ${r.gr - 1}) = ${zf(pAb(c, r.gr - 1))}. So ${bereichText(r, au.r, n)}.`) });
    }
    s.push({ id: "entscheidung", titel: zw("Entscheidung", "Decision"), typ: "wahl",
      frage: zw(`Bei der Stichprobe ergibt sich X = ${au.k}. ${bereichText(r, au.r, n)}. Wie lautet die Entscheidung?`, `The sample gives X = ${au.k}. ${bereichText(r, au.r, n)}. What is the decision?`),
      optionen: [["v", zw(`X = ${au.k} liegt in A: H₀ wird auf dem Niveau ${prz(alpha)} verworfen.`, `X = ${au.k} lies in A: H₀ is rejected at the ${prz(alpha)} level.`)],
        ["n", zw(`X = ${au.k} liegt nicht in A: H₀ wird nicht verworfen – die Stichprobe spricht nicht signifikant gegen H₀.`, `X = ${au.k} is not in A: H₀ is not rejected – the sample gives no significant evidence against H₀.`)],
        ["b", zw(`X = ${au.k} liegt nicht in A: Damit ist bewiesen, dass H₀ stimmt.`, `X = ${au.k} is not in A: this proves that H₀ is true.`)]],
      richtig: drin ? "v" : "n",
      fehler: [{ wahl: "b", text: zw("Nichtverwerfen ist kein Beweis für H₀. Die Daten reichen nur nicht aus, um H₀ abzulehnen.", "Not rejecting is no proof of H₀. The data are just not enough to reject H₀.") },
        { wahl: drin ? "n" : "v", text: zw(`Prüfe genau, ob ${au.k} im Ablehnungsbereich liegt.`, `Check carefully whether ${au.k} lies in the rejection region.`) }],
      hinweise: [zw("Liegt der beobachtete Wert im Ablehnungsbereich?", "Is the observed value in the rejection region?")],
      erklaerung: drin ? zw(`${au.k} ∈ A. Die Abweichung ist signifikant; H₀ wird verworfen. Dabei kann trotzdem ein Fehler 1. Art passiert sein – höchstens mit Wahrscheinlichkeit ${zf(fehler1(n, p0, r, au.r))}.`, `${au.k} ∈ A. The deviation is significant; H₀ is rejected. A type I error may still have happened – with probability at most ${zf(fehler1(n, p0, r, au.r))}.`)
        : zw(`${au.k} ∉ A. H₀ wird nicht verworfen. Das ist kein Beweis für H₀ – möglicherweise ist ein Fehler 2. Art passiert.`, `${au.k} ∉ A. H₀ is not rejected. This is no proof of H₀ – a type II error may have happened.`) });
    return s;
  }, [au, c]);
  const [von0, bis0] = fenster(au);
  const von = Math.min(von0, au.k), bis = Math.max(bis0, au.k);
  const werte = []; const t = binomTabelle(n, p0);
  for (let k = von; k <= bis; k++) werte.push({ x: k, h: t[k] });
  const zeigeA = stand >= (au.r === "beide" ? 5 : 4);
  return (
    <div style={{ ...karte, marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        <p style={kicker}>{zw("Test aufbauen", "Set up a test")}</p>
        <IchHaengeFest kontext={hilfeTest(`ht-${au.id}`, au)} />
      </div>
      <p style={{ ...hinweis, color: C.tinte, marginBottom: 4 }}>{au.text(n)} {zw(`Signifikanzniveau α = ${prz(alpha)}.`, `Significance level α = ${prz(alpha)}.`)}</p>
      {stand >= 3 && (
        <div style={{ margin: "8px 0" }}>
          <p style={{ fontSize: 12.5, fontWeight: 700, color: C.grau, margin: "0 0 4px" }}><Marke art="exakt" /> {zw(`Verteilung unter H₀: B(${n}; ${pT(p0)})`, `Distribution under H₀: B(${n}; ${pT(p0)})`)}</p>
          <Balken werte={werte} markiert={zeigeA ? (k) => (imBereich(k, r, au.r) ? C.gruen : null) : null} hoehe={170}
            linien={zeigeA ? [{ x: au.k, farbe: "#B58A00", text: `X = ${au.k}`, rechts: au.r === "links" }] : []} />
        </div>
      )}
      {stand >= 3 && stand < (au.r === "beide" ? 5 : 4) && (
        <Aufklapp titel={zw("Tabelle der kumulierten Wahrscheinlichkeiten unter H₀", "Table of cumulative probabilities under H₀")}>
          <KumTabelle n={n} p={p0} von={tabVon} bis={tabBis} />
          {au.r === "beide" && <div style={{ marginTop: 8 }}><KumTabelle n={n} p={p0} von={r.gr - 5} bis={r.gr + 4} /></div>}
        </Aufklapp>
      )}
      <SchrittFolge schritte={schritte} stand={stand} setStand={setStand} fertigText={zw("Test vollständig: Hypothesen, Richtung, Ablehnungsbereich und vorsichtig formulierte Entscheidung.", "Test complete: hypotheses, direction, rejection region and a carefully phrased decision.")} />
      <GrosserKnopf ghost onClick={neu}>{zw("Neuer Test", "New test")}</GrosserKnopf>
    </div>
  );
}

/* ---------- Modus 2: Ablehnungsbereich am Histogramm ---------- */
function Ablehnungsbereich() {
  const [au, setAu] = useState(() => testAufgabe());
  const start = (a) => { const mu = Math.round(a.n * a.p0); return a.r === "beide" ? { gl: Math.max(0, mu - 3), gr: Math.min(a.n, mu + 3) } : { g: a.r === "links" ? Math.max(0, mu - 3) : Math.min(a.n, mu + 3) }; };
  const [wahlG, setWahlG] = useState(() => start(au));
  const [meld, setMeld] = useState(null);
  const neu = () => { const a = testAufgabe(); setAu(a); setWahlG(start(a)); setMeld(null); };
  const { n, p0, alpha, krit: r } = au;
  const t = useMemo(() => binomTabelle(n, p0), [au]);
  const c = useMemo(() => kumuliert(t), [t]);
  const [von, bis] = fenster(au);
  const werte = []; for (let k = von; k <= bis; k++) werte.push({ x: k, h: t[k] });
  const P = au.r === "links" ? pBis(c, wahlG.g) : au.r === "rechts" ? pAb(c, wahlG.g) : pBis(c, wahlG.gl) + pAb(c, wahlG.gr);
  const setze = (feld) => (v) => { setWahlG({ ...wahlG, [feld]: v }); setMeld(null); };
  const pruefen = () => {
    if (au.r === "beide") {
      const L = pBis(c, wahlG.gl), R = pAb(c, wahlG.gr);
      if (L > alpha / 2 + 1e-12 || R > alpha / 2 + 1e-12) { setMeld({ art: "schlecht", text: zw(`Zu groß: links ${zf(L)}, rechts ${zf(R)} – jede Seite darf höchstens α/2 = ${zt(alpha / 2, 3)} haben.`, `Too big: left ${zf(L)}, right ${zf(R)} – each side may have at most α/2 = ${zt(alpha / 2, 3)}.`) }); return; }
      if (wahlG.gl !== r.gl || wahlG.gr !== r.gr) { setMeld({ art: "warn", text: zw("Zulässig, aber noch nicht der größte Bereich: Mindestens eine Seite lässt sich noch vergrößern, ohne α/2 zu überschreiten.", "Admissible, but not yet the largest region: at least one side can still grow without exceeding α/2.") }); return; }
    } else {
      if (P > alpha + 1e-12) { setMeld({ art: "schlecht", text: zw(`Zu groß: P(X ∈ A) = ${zf(P)} > α = ${zt(alpha, 2)}. So würde H₀ zu oft fälschlich verworfen.`, `Too big: P(X ∈ A) = ${zf(P)} > α = ${zt(alpha, 2)}. H₀ would be wrongly rejected too often.`) }); return; }
      if (wahlG.g !== r.g) { setMeld({ art: "warn", text: zw("Zulässig, aber nicht der größte Bereich – du kannst ihn noch um mindestens einen Wert vergrößern.", "Admissible, but not the largest region – you can still enlarge it by at least one value.") }); return; }
    }
    setMeld({ art: "gut", text: zw(`Richtig: ${bereichText(r, au.r, n)}. Die tatsächliche Irrtumswahrscheinlichkeit ist ${zf(P)} – wegen der ganzzahligen Grenzen meist kleiner als α = ${zt(alpha, 2)}. Ein Wert mehr würde α überschreiten.`,
      `Correct: ${bereichText(r, au.r, n)}. The actual error probability is ${zf(P)} – because of the integer limits usually smaller than α = ${zt(alpha, 2)}. One more value would exceed α.`) });
  };
  const ok = P <= alpha + 1e-12 && (au.r !== "beide" || (pBis(c, wahlG.gl) <= alpha / 2 + 1e-12 && pAb(c, wahlG.gr) <= alpha / 2 + 1e-12));
  return (
    <div style={{ ...karte, marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        <p style={kicker}>{zw("Ablehnungsbereich", "Rejection region")}</p>
        <IchHaengeFest kontext={hilfeTest(`ab-${au.id}`, au)} />
      </div>
      <p style={{ ...hinweis, color: C.tinte, marginBottom: 4 }}>{au.text(n)}</p>
      <p style={{ fontSize: 14, color: C.tinte, margin: "0 0 8px", lineHeight: 1.6 }}>
        <b>{H0(au)}</b>, α = {prz(alpha)}. {zw("Verschiebe die Grenze, bis der Ablehnungsbereich so groß wie möglich ist, ohne dass P(X ∈ A) unter H₀ größer als α wird.", "Move the limit until the rejection region is as large as possible without P(X ∈ A) under H₀ exceeding α.")}
      </p>
      <Balken werte={werte} hoehe={180} markiert={(k) => (imBereich(k, wahlG, au.r) ? (ok ? C.gruen : C.signal) : null)} legende={`B(${n}; ${pT(p0)})`} />
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", margin: "10px 0" }}>
        {au.r === "beide"
          ? <><Stufe wert={wahlG.gl} setWert={setze("gl")} min={0} max={wahlG.gr - 1} label={zw("linke Grenze", "left limit")} text="g₁" /><Stufe wert={wahlG.gr} setWert={setze("gr")} min={wahlG.gl + 1} max={n} label={zw("rechte Grenze", "right limit")} text="g₂" /></>
          : <Stufe wert={wahlG.g} setWert={setze("g")} min={0} max={n} label={zw("Grenze", "limit")} text="g" />}
      </div>
      <p style={{ fontSize: 14.5, color: C.tinte, margin: "0 0 4px" }}>{bereichText(wahlG, au.r, n)}</p>
      <p style={{ fontSize: 14.5, color: C.tinte, margin: 0 }}>
        <Marke art="exakt" /> P(X ∈ A) = <b style={{ color: ok ? "#0F7A4D" : C.gruenDunkel }}>{zf(P)}</b> {ok ? "≤" : ">"} α = {zt(alpha, 2)}
        {au.r === "beide" && <span style={{ color: C.grau, fontSize: 13 }}> ({zw("links", "left")} {zf(pBis(c, wahlG.gl))}, {zw("rechts", "right")} {zf(pAb(c, wahlG.gr))})</span>}
      </p>
      <GrosserKnopf onClick={pruefen}>{zw("Ablehnungsbereich prüfen", "Check rejection region")}</GrosserKnopf>
      {meld && <Rueck art={meld.art}>{meld.text}</Rueck>}
      <GrosserKnopf ghost onClick={neu}>{zw("Neuer Test", "New test")}</GrosserKnopf>
    </div>
  );
}

/* ---------- Modus 3: Fehler verstehen ---------- */
function FehlerVerstehen() {
  const [au, setAu] = useState(() => testAufgabe(true));
  const [stand, setStand] = useState(0);
  const [pWahr, setPWahr] = useState(au.p1);
  const [sim, setSim] = useState(null);
  const neu = () => { const a = testAufgabe(true); setAu(a); setStand(0); setPWahr(a.p1); setSim(null); };
  const { n, p0, krit: r, p1 } = au;
  const a1 = fehler1(n, p0, r, au.r), b2 = fehler2(n, p1, r, au.r);
  const pAbl = pAblehnung(n, pWahr, r, au.r);
  const inH0 = au.r === "links" ? pWahr >= p0 - 1e-12 : pWahr <= p0 + 1e-12;
  const schritte = useMemo(() => [
    { id: "d1", titel: zw("Fehler 1. Art", "Type I error"), typ: "wahl", frage: zw("Was ist ein Fehler 1. Art?", "What is a type I error?"),
      optionen: [["a", zw("H₀ wird verworfen, obwohl H₀ wahr ist.", "H₀ is rejected although H₀ is true.")], ["b", zw("H₀ wird nicht verworfen, obwohl H₀ falsch ist.", "H₀ is not rejected although H₀ is false.")], ["c", zw("Man hat sich beim Rechnen vertan.", "A calculation mistake was made.")]], richtig: "a",
      fehler: [{ wahl: "b", text: zw("Das ist der Fehler 2. Art.", "That is the type II error.") }, { wahl: "c", text: zw("Fehler 1. und 2. Art sind Fehlentscheidungen trotz richtiger Rechnung – der Zufall hat eine untypische Stichprobe geliefert.", "Type I and II errors are wrong decisions despite correct calculation – chance produced an untypical sample.") }],
      hinweise: [zw("Fehler 1. Art: die Behauptung zu Unrecht ablehnen.", "Type I: wrongly rejecting the claim.")], erklaerung: zw("Fehler 1. Art: H₀ ist wahr, aber X fällt zufällig in den Ablehnungsbereich.", "Type I: H₀ is true, but X happens to fall into the rejection region.") },
    { id: "a1", titel: zw("Wahrscheinlichkeit für den Fehler 1. Art", "Probability of a type I error"), typ: "zahl", text: "α′ =", wert: a1, toleranz: 0.0006, wertText: zf(a1),
      frage: zw(`Berechne P(X ∈ A) unter H₀ (am Rand p = ${pT(p0)}). Auf vier Nachkommastellen.`, `Compute P(X ∈ A) under H₀ (at the boundary p = ${pT(p0)}). To four decimals.`),
      fehler: [{ wert: au.alpha, toleranz: 1e-9, text: zw("α ist nur die Obergrenze. Wegen der ganzzahligen Grenzen ist die tatsächliche Wahrscheinlichkeit meist kleiner – rechne P(X ∈ A) aus.", "α is only the upper bound. Because of the integer limits the actual probability is usually smaller – compute P(X ∈ A).") },
        { wert: 1 - a1, toleranz: 0.0006, text: zw("Das ist die Wahrscheinlichkeit, nicht zu verwerfen. Gesucht ist P(X ∈ A).", "That is the probability of not rejecting. You need P(X ∈ A).") }],
      hinweise: [au.r === "rechts" ? zw(`P(X ≥ ${r.g}) = 1 − P(X ≤ ${r.g - 1}) mit p = ${pT(p0)}`, `P(X ≥ ${r.g}) = 1 − P(X ≤ ${r.g - 1}) with p = ${pT(p0)}`) : zw(`P(X ≤ ${r.g}) mit p = ${pT(p0)}`, `P(X ≤ ${r.g}) with p = ${pT(p0)}`)],
      erklaerung: zw(`α′ = P(X ∈ A) = ${zf(a1)} ≤ α = ${zt(au.alpha, 2)}.`, `α′ = P(X ∈ A) = ${zf(a1)} ≤ α = ${zt(au.alpha, 2)}.`) },
    { id: "d2", titel: zw("Fehler 2. Art", "Type II error"), typ: "wahl", frage: zw("Warum braucht man für den Fehler 2. Art einen konkreten Wert p₁?", "Why do you need a concrete value p₁ for the type II error?"),
      optionen: [["a", zw("Weil H₁ viele mögliche Werte für p enthält und die Wahrscheinlichkeit davon abhängt.", "Because H₁ contains many possible values of p and the probability depends on it.")], ["b", zw("Weil β immer gleich α ist.", "Because β always equals α.")], ["c", zw("Weil man p₁ aus der Stichprobe abliest.", "Because you read p₁ off the sample.")]], richtig: "a",
      fehler: [{ wahl: "b", text: zw("α und β hängen zusammen, sind aber nicht gleich. Wird α kleiner, wird β bei gleichem n meist größer.", "α and β are related but not equal. If α gets smaller, β usually gets larger for the same n.") }],
      hinweise: [zw("Unter H₁ ist p nicht festgelegt – z. B. p > 0,05 erlaubt 0,06 ebenso wie 0,3.", "Under H₁ p is not fixed – e.g. p > 0.05 allows 0.06 as well as 0.3.")],
      erklaerung: zw("β hängt vom wahren p ab: Je näher p₁ an p₀ liegt, desto größer ist β.", "β depends on the true p: the closer p₁ is to p₀, the larger β.") },
    { id: "b2", titel: zw("Wahrscheinlichkeit für den Fehler 2. Art", "Probability of a type II error"), typ: "zahl", text: "β =", wert: b2, toleranz: 0.0006, wertText: zf(b2),
      frage: zw(`Angenommen, in Wahrheit ist p₁ = ${pT(p1)}. Wie wahrscheinlich wird H₀ dann nicht verworfen? Auf vier Nachkommastellen.`, `Suppose the true value is p₁ = ${pT(p1)}. How likely is H₀ then not rejected? To four decimals.`),
      fehler: [{ wert: 1 - b2, toleranz: 0.0006, text: zw("Das ist die Wahrscheinlichkeit, H₀ zu verwerfen. Gesucht ist P(X ∉ A) mit p₁.", "That is the probability of rejecting H₀. You need P(X ∉ A) with p₁.") },
        { wert: 1 - a1, toleranz: 0.0006, text: zw(`Du hast mit p₀ gerechnet. Für β gilt X ~ B(${n}; ${pT(p1)}).`, `You computed with p₀. For β, X ~ B(${n}; ${pT(p1)}).`) }],
      hinweise: [zw(`X ~ B(${n}; ${pT(p1)}). β = P(X ∉ A) = 1 − P(X ∈ A).`, `X ~ B(${n}; ${pT(p1)}). β = P(X ∉ A) = 1 − P(X ∈ A).`)],
      erklaerung: zw(`Mit p₁ = ${pT(p1)}: β = P(X ∉ A) = ${zf(b2)}. Die Gegenwahrscheinlichkeit ${zf(1 - b2)} ist die Chance, die Abweichung zu entdecken.`, `With p₁ = ${pT(p1)}: β = P(X ∉ A) = ${zf(b2)}. Its complement ${zf(1 - b2)} is the chance of detecting the deviation.`) },
  ], [au]);
  const [von, bis] = fenster(au);
  const t0 = binomTabelle(n, p0), t1 = binomTabelle(n, pWahr);
  const lo = Math.max(0, Math.min(von, Math.floor(n * pWahr - 3 * Math.sqrt(n * pWahr * (1 - pWahr)) - 1)));
  const hi = Math.min(n, Math.max(bis, Math.ceil(n * pWahr + 3 * Math.sqrt(n * pWahr * (1 - pWahr)) + 1)));
  const werte = [], werte2 = [];
  for (let k = lo; k <= hi; k++) { werte.push({ x: k, h: t0[k] }); werte2.push({ x: k, h: t1[k] }); }
  const simulieren = () => { const ab = simuliereTests(n, pWahr, r, au.r, 1000); setSim({ p: pWahr, ab }); };
  return (
    <div style={{ ...karte, marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        <p style={kicker}>{zw("Fehler verstehen", "Understand errors")}</p>
        <IchHaengeFest kontext={hilfeTest(`fv-${au.id}`, au)} />
      </div>
      <p style={{ ...hinweis, color: C.tinte, marginBottom: 4 }}>{au.text(n)}</p>
      <p style={{ fontSize: 14, color: C.tinte, margin: "0 0 8px", lineHeight: 1.6 }}><b>{H0(au)}</b>, α = {prz(au.alpha)}, <b>{bereichText(r, au.r, n)}</b></p>
      <SchrittFolge schritte={schritte} stand={stand} setStand={setStand} fertigText={zw("Beide Fehlerarten berechnet und gedeutet.", "Both error types computed and interpreted.")} />
      <div style={{ background: C.sand, borderRadius: 14, padding: "12px 14px", marginTop: 14 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: C.tinte, margin: "0 0 6px" }}>{zw("Ausprobieren: Was, wenn in Wahrheit p gilt?", "Try it: what if the true value is p?")}</p>
        <label style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: C.tinte }}><span>{zw("wahres p", "true p")}</span><b style={{ color: C.gruen }}>{zt(pWahr, 2)}</b></label>
        <input type="range" min={0.01} max={0.99} step={0.01} value={pWahr} onChange={(e) => { setPWahr(Number(e.target.value)); setSim(null); }} aria-label={zw("wahres p", "true p")} style={{ width: "100%", accentColor: C.gruen, height: 32 }} />
        <Balken werte={werte} werte2={werte2} hoehe={170} markiert={(k) => (imBereich(k, r, au.r) ? "#E9B3C8" : null)} legende={zw(`Balken: p₀ = ${pT(p0)} · gestrichelt: p = ${zt(pWahr, 2)}`, `bars: p₀ = ${pT(p0)} · dashed: p = ${zt(pWahr, 2)}`)} />
        <p style={{ fontSize: 14, color: C.tinte, margin: "8px 0 2px" }}>
          <Marke art="exakt" /> P({zw("H₀ verwerfen", "reject H₀")} | p = {zt(pWahr, 2)}) = <b>{zf(pAbl)}</b>
        </p>
        <p style={{ fontSize: 13, color: C.grau, margin: 0, lineHeight: 1.55 }}>
          {inH0 ? zw(`Dieses p gehört zu H₀. Jede Ablehnung wäre ein Fehler 1. Art (Wahrscheinlichkeit ${zf(pAbl)}, höchstens α′ = ${zf(a1)}).`, `This p belongs to H₀. Every rejection would be a type I error (probability ${zf(pAbl)}, at most α′ = ${zf(a1)}).`)
            : zw(`Dieses p gehört zu H₁. Nicht verwerfen wäre ein Fehler 2. Art: β = ${zf(1 - pAbl)}.`, `This p belongs to H₁. Not rejecting would be a type II error: β = ${zf(1 - pAbl)}.`)}
        </p>
        <GrosserKnopf ghost onClick={simulieren}>{zw("1000 Tests simulieren", "Simulate 1000 tests")}</GrosserKnopf>
        {sim && (
          <p style={{ fontSize: 14, color: C.tinte, margin: "8px 0 0" }}>
            <Marke art="sim" /> {zw(`H₀ wurde in ${sim.ab} von 1000 Tests verworfen (relative Häufigkeit ${zt(sim.ab / 1000, 3)}). Exakt: ${zf(pAbl)}.`, `H₀ was rejected in ${sim.ab} of 1000 tests (relative frequency ${zt(sim.ab / 1000, 3)}). Exact: ${zf(pAbl)}.`)}
          </p>
        )}
      </div>
      <GrosserKnopf ghost onClick={neu}>{zw("Neuer Test", "New test")}</GrosserKnopf>
    </div>
  );
}

const MODI = [["aufbauen", zw("Test aufbauen", "Set up a test")], ["bereich", zw("Ablehnungs­bereich", "Rejection region")], ["fehler", zw("Fehler verstehen", "Understand errors")]];
export function Hypothesentests() {
  const [modus, setModus] = useState("aufbauen");
  return (
    <Seite titel={zw("Hypothesentests", "Hypothesis tests")}
      text={zw("Vom Sachkontext zur Entscheidung: H₀ und Testrichtung bestimmen, den Ablehnungsbereich finden und verstehen, welche Fehler passieren können.", "From context to decision: set H₀ and direction, find the rejection region and understand which errors can happen.")}>
      <ModusLeiste modi={MODI} modus={modus} setModus={setModus} label={zw("Hypothesentest-Übungen", "Hypothesis test exercises")} />
      <Aufklapp titel={zw("Kurz erklärt", "In short")}>
        <p style={{ margin: "0 0 6px" }}>{zw("H₀ ist die angezweifelte Behauptung, H₁ das, was man zeigen will. Der Ablehnungsbereich A enthält die Werte, die so unwahrscheinlich sind, dass man H₀ nicht mehr glaubt: P(X ∈ A) ≤ α, berechnet unter H₀.", "H₀ is the doubted claim, H₁ what you want to show. The rejection region A holds values so unlikely that you no longer believe H₀: P(X ∈ A) ≤ α, computed under H₀.")}</p>
        <p style={{ margin: "0 0 6px" }}>{zw("Liegt die Beobachtung in A, wird H₀ verworfen. Sonst wird H₀ nicht verworfen – das ist kein Beweis, dass H₀ stimmt.", "If the observation is in A, H₀ is rejected. Otherwise H₀ is not rejected – which is no proof that H₀ is true.")}</p>
        <p style={{ margin: 0 }}>{zw("Beispiel: Münze, H₀: p = 0,5, n = 100, α = 5 %, zweiseitig: A = {0; …; 39} ∪ {61; …; 100}. Bei 58-mal Kopf wird H₀ nicht verworfen.", "Example: coin, H₀: p = 0.5, n = 100, α = 5 %, two-sided: A = {0; …; 39} ∪ {61; …; 100}. With 58 heads H₀ is not rejected.")}</p>
      </Aufklapp>
      <div style={{ display: modus === "aufbauen" ? "block" : "none" }}><TestAufbauen /></div>
      <div style={{ display: modus === "bereich" ? "block" : "none" }}><Ablehnungsbereich /></div>
      <div style={{ display: modus === "fehler" ? "block" : "none" }}><FehlerVerstehen /></div>
    </Seite>
  );
}
