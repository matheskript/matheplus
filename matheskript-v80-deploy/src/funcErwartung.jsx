/* ============================================================
   Stochastik: Erwartungswert und faire Spiele
   · Gewinnverteilung – fehlende Wahrscheinlichkeit, Nettogewinne
     (Auszahlung − Einsatz), Erwartungswert, Deutung
   · Fairer Einsatz – Einsatz verändern, bis der erwartete Nettogewinn 0 ist
   · Langfristig spielen – viele Durchläufe simulieren, Durchschnitt
     mit dem exakten Erwartungswert vergleichen
   Die Wahrscheinlichkeiten jedes Spiels sind exakte Brüche und summieren
   sich zu 1; Auszahlung und Nettogewinn werden durchgehend getrennt.
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useMemo, useState } from "react";
import { C } from "./base1.jsx";
import { IchHaengeFest } from "./funcHilfe.jsx";
import { GrosserKnopf, Rueck, hilfeKontext, hinweis, karte, kicker, zw } from "./ui2.jsx";
import { ggT, wahl } from "./rechnen2.js";
import { Aufklapp, Balken, Marke, ModusLeiste, Seite, SchrittFolge, Verlauf, euro, minusZ, ziehe, zt } from "./ui3.jsx";

let zaehler = 0;

/* ---------- Spiele ---------- */
const SPIELE = [
  { id: "wuerfel", N: 6, text: zw("Du wirfst einen fairen Würfel.", "You roll a fair die."),
    erg: [[zw("Sechs", "Six"), 1], [zw("Vier oder Fünf", "Four or five"), 2], [zw("Eins bis Drei", "One to three"), 3]] },
  { id: "rad", N: 8, text: zw("Ein Glücksrad hat acht gleich große Felder: ein rotes, drei gelbe und vier blaue.", "A wheel has eight equal sectors: one red, three yellow and four blue."),
    erg: [[zw("Rot", "Red"), 1], [zw("Gelb", "Yellow"), 3], [zw("Blau", "Blue"), 4]] },
  { id: "muenzen", N: 4, text: zw("Du wirfst zwei faire Münzen.", "You toss two fair coins."),
    erg: [[zw("Zweimal Kopf", "Two heads"), 1], [zw("Genau einmal Kopf", "Exactly one head"), 2], [zw("Keinmal Kopf", "No head"), 1]] },
  { id: "pasch", N: 36, text: zw("Du wirfst zwei faire Würfel.", "You roll two fair dice."),
    erg: [[zw("Pasch", "Doubles"), 6], [zw("Augensumme 7", "Sum of 7"), 6], [zw("Keins von beiden", "Neither"), 24]] },
];

const bruch = (c, N) => { const g = ggT(c, N); return { z: c / g, n: N / g }; };
const bText = ({ z, n }) => (n === 1 ? String(z) : `${z}/${n}`);

/* Spiel mit Auszahlungen: erstes Ergebnis Hauptgewinn, zweites kleiner Gewinn, drittes nichts.
   fairBar: Einsatz so wählbar, dass der faire Einsatz ein Vielfaches von 0,50 € ist. */
function spiel({ fairBar = false } = {}) {
  for (let v = 0; v < 400; v++) {
    const s = wahl(SPIELE);
    const A1 = wahl([4, 5, 6, 8, 10, 12, 15, 20]), A2 = wahl([1, 2, 3]);
    if (A2 >= A1) continue;
    const aus = [A1, A2, 0];
    const EA = (aus[0] * s.erg[0][1] + aus[1] * s.erg[1][1]) / s.N;
    if (fairBar && Math.abs(EA * 2 - Math.round(EA * 2)) > 1e-9) continue;
    if (EA < 0.5) continue;
    let e = wahl([1, 1.5, 2, 2.5, 3, 4, 5]);
    if (!fairBar) { if (Math.abs(EA - e) < 1e-9 || e > A1) continue; }
    const p = s.erg.map(([, c]) => c / s.N);
    return { id: ++zaehler, ...s, aus, e, p, EA, namen: s.erg.map(([n]) => n), brueche: s.erg.map(([, c]) => bruch(c, s.N)) };
  }
  return null;
}

/* ---------- Tabelle der Verteilung ---------- */
function Tabelle({ sp, zeigeP3, netto, einsatz }) {
  const e = einsatz ?? sp.e;
  const zelle = { padding: "7px 6px", borderBottom: `1px solid ${C.linie}`, fontSize: 13.5, lineHeight: 1.35, verticalAlign: "top" };
  const kopfZ = { ...zelle, fontWeight: 700, color: C.grau, fontSize: 12, textAlign: "left" };
  return (
    <table style={{ borderCollapse: "collapse", width: "100%", tableLayout: "fixed", color: C.tinte, margin: "8px 0" }}>
      <colgroup><col style={{ width: "34%" }} /><col style={{ width: "16%" }} /><col style={{ width: "25%" }} /><col style={{ width: "25%" }} /></colgroup>
      <thead><tr>
        <th style={kopfZ}>{zw("Ergebnis", "Outcome")}</th><th style={{ ...kopfZ, textAlign: "center" }}>P</th>
        <th style={{ ...kopfZ, textAlign: "right" }}>{zw("Auszahlung", "Payout")}</th><th style={{ ...kopfZ, textAlign: "right" }}>{zw("Netto", "Net")}</th>
      </tr></thead>
      <tbody>
        {sp.namen.map((n, i) => (
          <tr key={n}>
            <td style={{ ...zelle, fontWeight: 700 }}>{n}</td>
            <td style={{ ...zelle, textAlign: "center" }}>{i === 2 && !zeigeP3 ? "?" : bText(sp.brueche[i])}</td>
            <td style={{ ...zelle, textAlign: "right" }}>{euro(sp.aus[i])}</td>
            <td style={{ ...zelle, textAlign: "right", fontWeight: 700, color: netto[i] ? (sp.aus[i] - e < 0 ? C.gruenDunkel : "#0F7A4D") : C.hellgrau }}>{netto[i] ? euro(sp.aus[i] - e) : "?"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const ERW_REGELN = [{ name: "Erwartungswert", bereich: "stochastik" }, { name: "Gegenereignis", bereich: "stochastik" }];
function hilfeFuer(id, sp) {
  return hilfeKontext({
    id, aufgabe: "Erwartungswert Einsatz Auszahlung Nettogewinn faires Spiel",
    verstehen: [
      zw("Unterscheide Auszahlung und Nettogewinn: Den Einsatz zahlst du immer, auch wenn du verlierst.", "Distinguish payout and net gain: you always pay the stake, even when you lose."),
      zw(`Hier kostet ein Spiel ${euro(sp.e)}. Nettogewinn = Auszahlung − Einsatz.`, `Here one game costs ${euro(sp.e)}. Net gain = payout − stake.`),
      zw("Der Erwartungswert ist der Durchschnitt, der sich auf lange Sicht pro Spiel einstellt – nicht das Ergebnis eines einzelnen Spiels.", "The expected value is the long-run average per game – not the result of a single game."),
    ],
    ansatz: [
      zw("Welche Werte kann der Nettogewinn annehmen und mit welcher Wahrscheinlichkeit?", "Which values can the net gain take, and with which probability?"),
      zw("Lege eine Tabelle an: Ergebnis, Wahrscheinlichkeit, Nettogewinn.", "Make a table: outcome, probability, net gain."),
      zw("Multipliziere jeden Nettogewinn mit seiner Wahrscheinlichkeit und addiere alles.", "Multiply each net gain by its probability and add everything up."),
    ],
    regel: [
      zw("Wie berechnet man einen gewichteten Durchschnitt?", "How do you compute a weighted average?"),
      zw("E(X) = x₁ · p₁ + x₂ · p₂ + … + xₙ · pₙ", "E(X) = x₁ · p₁ + x₂ · p₂ + … + xₙ · pₙ"),
      zw("Fair heißt: erwarteter Nettogewinn E(X) = 0. Dann ist der faire Einsatz gleich der erwarteten Auszahlung.", "Fair means: expected net gain E(X) = 0. Then the fair stake equals the expected payout."),
    ],
    pruefen: [
      zw("Summieren sich alle Wahrscheinlichkeiten zu 1?", "Do all probabilities add up to 1?"),
      zw("Liegt der Erwartungswert zwischen dem kleinsten und dem größten möglichen Nettogewinn?", "Is the expected value between the smallest and largest possible net gain?"),
      zw("Kontrolle: E(Nettogewinn) = E(Auszahlung) − Einsatz.", "Check: E(net gain) = E(payout) − stake."),
    ],
    regeln: ERW_REGELN,
  });
}

/* ---------- Modus 1: Gewinnverteilung ---------- */
function Gewinnverteilung() {
  const [sp, setSp] = useState(() => spiel());
  const [stand, setStand] = useState(0);
  const neu = () => { setSp(spiel()); setStand(0); };
  const netto = sp.aus.map((a) => a - sp.e);
  const E = netto.reduce((s, x, i) => s + x * sp.p[i], 0);
  const p3 = sp.brueche[2];
  const ungewichtet = (netto[0] + netto[1] + netto[2]) / 3;
  const schritte = useMemo(() => [
    { id: "p3", titel: zw("Fehlende Wahrscheinlichkeit", "Missing probability"), typ: "zahl", text: `P(${sp.namen[2]}) =`, wert: sp.p[2], toleranz: 0.0005, wertText: bText(p3),
      frage: zw("Alle Wahrscheinlichkeiten zusammen ergeben 1. Wie groß ist die fehlende Wahrscheinlichkeit?", "All probabilities add up to 1. How large is the missing probability?"),
      fehler: [{ wert: sp.p[0] + sp.p[1], text: zw("Das ist die Wahrscheinlichkeit der beiden anderen Ergebnisse zusammen. Gesucht ist der Rest bis 1.", "That is the probability of the other two outcomes together. You need what is left up to 1.") }],
      hinweise: [zw("Nutze das Gegenereignis: 1 minus die beiden bekannten Wahrscheinlichkeiten.", "Use the complement: 1 minus the two known probabilities."), zw(`1 − ${bText(sp.brueche[0])} − ${bText(sp.brueche[1])}`, `1 − ${bText(sp.brueche[0])} − ${bText(sp.brueche[1])}`)],
      erklaerung: zw(`P(${sp.namen[2]}) = 1 − ${bText(sp.brueche[0])} − ${bText(sp.brueche[1])} = ${bText(p3)}.`, `P(${sp.namen[2]}) = 1 − ${bText(sp.brueche[0])} − ${bText(sp.brueche[1])} = ${bText(p3)}.`) },
    { id: "n1", titel: zw(`Nettogewinn bei „${sp.namen[0]}“`, `Net gain for “${sp.namen[0]}”`), typ: "zahl", text: zw("Nettogewinn =", "Net gain ="), wert: netto[0], einheit: "€", wertText: zt(netto[0], 2),
      frage: zw(`Die Auszahlung beträgt ${euro(sp.aus[0])}, der Einsatz ${euro(sp.e)}. Wie viel hast du nach diesem Spiel netto gewonnen?`, `The payout is ${euro(sp.aus[0])}, the stake ${euro(sp.e)}. How much did you gain net after this game?`),
      fehler: [{ wert: sp.aus[0], text: zw("Das ist die Auszahlung. Den Einsatz hast du vorher bezahlt – zieh ihn ab.", "That is the payout. You paid the stake beforehand – subtract it.") }],
      hinweise: [zw("Nettogewinn = Auszahlung − Einsatz.", "Net gain = payout − stake.")],
      erklaerung: `${euro(sp.aus[0])} − ${euro(sp.e)} = ${euro(netto[0])}.` },
    { id: "n2", titel: zw(`Nettogewinn bei „${sp.namen[1]}“`, `Net gain for “${sp.namen[1]}”`), typ: "zahl", text: zw("Nettogewinn =", "Net gain ="), wert: netto[1], einheit: "€", wertText: zt(netto[1], 2),
      frage: zw(`Hier werden ${euro(sp.aus[1])} ausgezahlt. Achtung, das Ergebnis kann auch negativ sein.`, `Here ${euro(sp.aus[1])} is paid out. Careful, the result can be negative.`),
      fehler: [{ wert: sp.aus[1], text: zw("Das ist wieder die Auszahlung, nicht der Nettogewinn.", "That is again the payout, not the net gain.") }, { wert: -netto[1], text: zw("Vorzeichen prüfen: Auszahlung minus Einsatz, nicht umgekehrt.", "Check the sign: payout minus stake, not the other way round.") }],
      hinweise: [zw("Nettogewinn = Auszahlung − Einsatz.", "Net gain = payout − stake.")],
      erklaerung: `${euro(sp.aus[1])} − ${euro(sp.e)} = ${euro(netto[1])}.` },
    { id: "n3", titel: zw(`Nettogewinn bei „${sp.namen[2]}“`, `Net gain for “${sp.namen[2]}”`), typ: "zahl", text: zw("Nettogewinn =", "Net gain ="), wert: netto[2], einheit: "€", wertText: zt(netto[2], 2),
      frage: zw("Bei diesem Ergebnis wird nichts ausgezahlt.", "Nothing is paid out for this outcome."),
      fehler: [{ wert: 0, text: zw("Es wird zwar nichts ausgezahlt, aber dein Einsatz ist weg. Der Nettogewinn ist negativ.", "Nothing is paid out, but your stake is gone. The net gain is negative.") }],
      hinweise: [zw("0 € Auszahlung − Einsatz.", "€0 payout − stake.")],
      erklaerung: `0 € − ${euro(sp.e)} = ${euro(netto[2])}.` },
    { id: "E", titel: zw("Erwartungswert des Nettogewinns", "Expected net gain"), typ: "zahl", text: "E(X) =", wert: E, toleranz: 0.0051, einheit: "€", wertText: zt(E, 4),
      rundung: zw("Auf zwei Nachkommastellen gerundet reicht; ein Bruch geht auch.", "Rounded to two decimals is fine; a fraction works too."),
      frage: zw("X ist der Nettogewinn eines Spiels. Berechne E(X).", "X is the net gain of one game. Compute E(X)."),
      fehler: [{ wert: sp.EA, toleranz: 0.0051, text: zw("Das ist der Erwartungswert der Auszahlung. Für den Nettogewinn fehlt noch der Einsatz.", "That is the expected payout. For the net gain the stake is still missing.") },
        { wert: ungewichtet, toleranz: 0.0051, text: zw("Du hast die drei Nettogewinne einfach gemittelt. Sie sind aber verschieden wahrscheinlich – gewichte jeden Wert mit seiner Wahrscheinlichkeit.", "You simply averaged the three net gains. They are not equally likely – weight each value with its probability.") }],
      hinweise: [zw("E(X) = Nettogewinn₁ · p₁ + Nettogewinn₂ · p₂ + Nettogewinn₃ · p₃", "E(X) = net gain₁ · p₁ + net gain₂ · p₂ + net gain₃ · p₃"),
        zw(`${zt(netto[0], 2)} · ${bText(sp.brueche[0])} + ${zt(netto[1], 2)} · ${bText(sp.brueche[1])} + (${zt(netto[2], 2)}) · ${bText(p3)}`, `${zt(netto[0], 2)} · ${bText(sp.brueche[0])} + ${zt(netto[1], 2)} · ${bText(sp.brueche[1])} + (${zt(netto[2], 2)}) · ${bText(p3)}`)],
      erklaerung: zw(`E(X) = ${zt(netto[0], 2)} · ${bText(sp.brueche[0])} + ${zt(netto[1], 2)} · ${bText(sp.brueche[1])} + (${zt(netto[2], 2)}) · ${bText(p3)} ≈ ${euro(E)}. Kontrolle: erwartete Auszahlung ${zt(sp.EA, 4)} € minus Einsatz ${euro(sp.e)}.`,
        `E(X) = ${zt(netto[0], 2)} · ${bText(sp.brueche[0])} + ${zt(netto[1], 2)} · ${bText(sp.brueche[1])} + (${zt(netto[2], 2)}) · ${bText(p3)} ≈ ${euro(E)}. Check: expected payout €${zt(sp.EA, 4)} minus stake ${euro(sp.e)}.`) },
    { id: "deutung", titel: zw("Deutung", "Interpretation"), typ: "wahl",
      frage: zw("Was sagt dieser Erwartungswert aus?", "What does this expected value tell you?"),
      optionen: E < 0
        ? [["a", zw(`Auf lange Sicht verliert man im Mittel etwa ${euro(-E)} pro Spiel.`, `In the long run you lose about ${euro(-E)} per game on average.`)], ["b", zw(`Man verliert bei jedem einzelnen Spiel genau ${euro(-E)}.`, `You lose exactly ${euro(-E)} in every single game.`)], ["c", zw("Das Spiel ist fair.", "The game is fair.")]]
        : [["a", zw(`Auf lange Sicht gewinnt man im Mittel etwa ${euro(E)} pro Spiel.`, `In the long run you win about ${euro(E)} per game on average.`)], ["b", zw(`Man gewinnt bei jedem einzelnen Spiel genau ${euro(E)}.`, `You win exactly ${euro(E)} in every single game.`)], ["c", zw("Das Spiel ist fair.", "The game is fair.")]],
      richtig: "a",
      fehler: [{ wahl: "b", text: zw(`Ein einzelnes Spiel endet mit ${euro(netto[0])}, ${euro(netto[1])} oder ${euro(netto[2])} – nie mit dem Erwartungswert. Er ist ein langfristiger Durchschnitt.`, `A single game ends with ${euro(netto[0])}, ${euro(netto[1])} or ${euro(netto[2])} – never with the expected value. It is a long-run average.`) },
        { wahl: "c", text: zw("Fair wäre das Spiel nur bei einem erwarteten Nettogewinn von genau 0 €.", "The game would only be fair with an expected net gain of exactly €0.") }],
      hinweise: [zw("Ist E(X) gleich 0? Und was passiert in einem einzelnen Spiel?", "Is E(X) equal to 0? And what happens in a single game?")],
      erklaerung: zw("Der Erwartungswert beschreibt den Durchschnitt über sehr viele Spiele. Einzelne Spiele schwanken stark.", "The expected value describes the average over very many games. Single games vary a lot.") },
  ], [sp]);
  const nettoSichtbar = [stand > 1, stand > 2, stand > 3];
  const balken = stand > 3 ? netto.map((x, i) => ({ x: zt(x, 2), h: sp.p[i], wert: x })).sort((a, b) => a.wert - b.wert) : null;
  return (
    <div style={{ ...karte, marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        <p style={kicker}>{zw("Gewinnverteilung", "Payout distribution")}</p>
        <IchHaengeFest kontext={hilfeFuer(`erw-v-${sp.id}`, sp)} />
      </div>
      <p style={{ ...hinweis, color: C.tinte, marginBottom: 4 }}>{sp.text} {zw(`Ein Spiel kostet ${euro(sp.e)} Einsatz. Ausgezahlt wird nach folgender Tabelle.`, `One game costs a stake of ${euro(sp.e)}. Payouts follow the table.`)}</p>
      <Tabelle sp={sp} zeigeP3={stand > 0} netto={nettoSichtbar} />
      {balken && (
        <div style={{ margin: "8px 0" }}>
          <Balken werte={balken} hoehe={170} xBeschriftung={zw("Nettogewinn in €", "Net gain in €")} label={zw("Verteilung des Nettogewinns", "Distribution of the net gain")} />
        </div>
      )}
      <SchrittFolge schritte={schritte} stand={stand} setStand={setStand}
        fertigText={zw("Vollständig: Verteilung aufgestellt, Erwartungswert berechnet und richtig gedeutet.", "Complete: distribution set up, expected value computed and interpreted correctly.")} />
      <GrosserKnopf ghost onClick={neu}>{zw("Neue Aufgabe", "New problem")}</GrosserKnopf>
    </div>
  );
}

/* ---------- Modus 2: Fairer Einsatz ---------- */
function FairerEinsatz() {
  const [sp, setSp] = useState(() => spiel({ fairBar: true }));
  const [einsatz, setEinsatz] = useState(1);
  const [stand, setStand] = useState(0);
  const neu = () => { setSp(spiel({ fairBar: true })); setEinsatz(1); setStand(0); };
  const Enetto = sp.EA - einsatz;
  const maxE = Math.max(...sp.aus);
  const schritte = useMemo(() => [
    { id: "EA", titel: zw("Erwartete Auszahlung", "Expected payout"), typ: "zahl", text: zw("E(Auszahlung) =", "E(payout) ="), wert: sp.EA, toleranz: 0.0051, einheit: "€", wertText: zt(sp.EA, 2),
      frage: zw("Wie viel wird pro Spiel im Mittel ausgezahlt? (Den Einsatz lässt du hier noch weg.)", "How much is paid out per game on average? (Leave out the stake for now.)"),
      fehler: [{ wert: (sp.aus[0] + sp.aus[1]) / 3, toleranz: 0.0051, text: zw("Die Auszahlungen sind nicht gleich wahrscheinlich – gewichte sie mit ihren Wahrscheinlichkeiten.", "The payouts are not equally likely – weight them with their probabilities.") }],
      hinweise: [zw("Auszahlung mal Wahrscheinlichkeit, für alle Ergebnisse, dann addieren.", "Payout times probability for every outcome, then add.")],
      erklaerung: zw(`${sp.aus[0]} · ${bText(sp.brueche[0])} + ${sp.aus[1]} · ${bText(sp.brueche[1])} + 0 · ${bText(sp.brueche[2])} = ${euro(sp.EA)}.`, `${sp.aus[0]} · ${bText(sp.brueche[0])} + ${sp.aus[1]} · ${bText(sp.brueche[1])} + 0 · ${bText(sp.brueche[2])} = ${euro(sp.EA)}.`) },
    { id: "fair", titel: zw("Fairer Einsatz", "Fair stake"), typ: "zahl", text: zw("Einsatz =", "Stake ="), wert: sp.EA, toleranz: 0.0051, einheit: "€", wertText: zt(sp.EA, 2),
      frage: zw("Stell den Einsatz mit dem Regler so ein, dass der erwartete Nettogewinn 0 € ist, und trag ihn hier ein.", "Use the slider to set the stake so the expected net gain is €0, then enter it here."),
      fehler: [{ wert: maxE, text: zw("Dann bekäme man selbst beim Hauptgewinn netto nichts – das Spiel wäre klar unfair für die Spieler.", "Then even the jackpot would give no net gain – clearly unfair for the players.") }],
      hinweise: [zw("Fair heißt E(Auszahlung) − Einsatz = 0.", "Fair means E(payout) − stake = 0."), zw("Also Einsatz = erwartete Auszahlung.", "So stake = expected payout.")],
      erklaerung: zw(`E(Nettogewinn) = ${euro(sp.EA)} − Einsatz = 0 ⇔ Einsatz = ${euro(sp.EA)}.`, `E(net gain) = ${euro(sp.EA)} − stake = 0 ⇔ stake = ${euro(sp.EA)}.`) },
    { id: "deutung", titel: zw("Was heißt fair?", "What does fair mean?"), typ: "wahl", frage: zw(`Der Einsatz beträgt jetzt ${euro(sp.EA)}. Welche Aussage stimmt?`, `The stake is now ${euro(sp.EA)}. Which statement is true?`),
      optionen: [["a", zw("Auf lange Sicht gleichen sich Gewinne und Verluste im Mittel aus; einzelne Spiele können trotzdem stark schwanken.", "In the long run gains and losses balance on average; single games can still vary a lot.")],
        ["b", zw("Bei jedem Spiel bekommt man seinen Einsatz zurück.", "You get your stake back in every game.")], ["c", zw("Nach genau zehn Spielen hat man garantiert 0 € gewonnen.", "After exactly ten games you are guaranteed to have won €0.")]], richtig: "a",
      fehler: [{ wahl: "b", text: zw(`Bei „${sp.namen[2]}“ verliert man den ganzen Einsatz. Fair ist nur der Durchschnitt.`, `With “${sp.namen[2]}” you lose the whole stake. Only the average is fair.`) }, { wahl: "c", text: zw("Der Erwartungswert ist kein Versprechen für eine feste Zahl von Spielen – auch nach zehn Spielen kann man deutlich im Plus oder Minus sein.", "The expected value is no promise for a fixed number of games – after ten games you can still be clearly up or down.") }],
      hinweise: [zw("Probiere es im Modus „Langfristig spielen“ aus.", "Try it in the “Play in the long run” mode.")],
      erklaerung: zw("Fair bedeutet: erwarteter Nettogewinn 0. Das ist eine Aussage über den Durchschnitt vieler Spiele.", "Fair means: expected net gain 0. It is a statement about the average of many games.") },
  ], [sp, maxE]);
  return (
    <div style={{ ...karte, marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        <p style={kicker}>{zw("Fairer Einsatz", "Fair stake")}</p>
        <IchHaengeFest kontext={hilfeFuer(`erw-f-${sp.id}`, { ...sp, e: einsatz })} />
      </div>
      <p style={{ ...hinweis, color: C.tinte, marginBottom: 4 }}>{sp.text} {zw("Wie hoch muss der Einsatz sein, damit das Spiel fair ist?", "How high must the stake be for the game to be fair?")}</p>
      <Tabelle sp={sp} zeigeP3 netto={[true, true, true]} einsatz={einsatz} />
      <div style={{ background: C.sand, borderRadius: 14, padding: "12px 14px", margin: "8px 0" }}>
        <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, fontSize: 14, fontWeight: 700, color: C.tinte }}>
          <span>{zw("Einsatz", "Stake")}</span><span style={{ color: C.see, fontSize: 17 }}>{euro(einsatz)}</span>
        </label>
        <input type="range" min={0} max={maxE} step={0.5} value={einsatz} onChange={(e) => setEinsatz(Number(e.target.value))} aria-label={zw("Einsatz in Euro", "Stake in euros")}
          style={{ width: "100%", accentColor: C.see, height: 32 }} />
        <p style={{ margin: "2px 0 0", fontSize: 14, color: C.tinte }}>
          <Marke art="exakt" /> {zw("Erwarteter Nettogewinn pro Spiel:", "Expected net gain per game:")}{" "}
          <b style={{ color: Math.abs(Enetto) < 1e-9 ? "#0F7A4D" : Enetto < 0 ? C.gruenDunkel : C.see }}>{euro(Enetto)}</b>
          {Math.abs(Enetto) < 1e-9 ? zw(" – fair!", " – fair!") : Enetto < 0 ? zw(" – Vorteil für den Anbieter", " – advantage for the operator") : zw(" – Vorteil für die Spieler", " – advantage for the players")}
        </p>
      </div>
      <SchrittFolge schritte={schritte} stand={stand} setStand={setStand} fertigText={zw("Richtig: Der faire Einsatz ist die erwartete Auszahlung.", "Correct: the fair stake is the expected payout.")} />
      <GrosserKnopf ghost onClick={neu}>{zw("Neue Aufgabe", "New problem")}</GrosserKnopf>
    </div>
  );
}

/* ---------- Modus 3: Langfristig spielen (Simulation) ---------- */
const MAX_SPIELE = 20000;
function Langfristig() {
  const [sp, setSp] = useState(() => spiel());
  const [prognose, setPrognose] = useState(null);
  const [verlauf, setVerlauf] = useState([]);
  const [summe, setSumme] = useState(0);
  const [anzahl, setAnzahl] = useState([0, 0, 0]);
  const [letztes, setLetztes] = useState(null);
  const netto = sp.aus.map((a) => a - sp.e);
  const E = netto.reduce((s, x, i) => s + x * sp.p[i], 0);
  const n = verlauf.length;
  const spielen = (k) => {
    const v = [...verlauf], a = [...anzahl];
    let s = summe, l = null;
    for (let i = 0; i < k && v.length < MAX_SPIELE; i++) {
      const j = ziehe(sp.p);
      a[j]++; s += netto[j]; l = j;
      v.push(s / (v.length + 1));
    }
    setVerlauf(v); setSumme(s); setAnzahl(a); setLetztes(l);
  };
  const zuruecksetzen = () => { setVerlauf([]); setSumme(0); setAnzahl([0, 0, 0]); setLetztes(null); };
  const neu = () => { setSp(spiel()); setPrognose(null); zuruecksetzen(); };
  const knopf = (k, t) => (
    <button key={k} type="button" onClick={() => spielen(k)} disabled={n >= MAX_SPIELE}
      style={{ flex: "1 1 70px", minHeight: 46, borderRadius: 12, border: `1.5px solid ${C.see}`, background: k === 1 ? C.see : C.weiss, color: k === 1 ? C.weiss : C.see,
        fontFamily: "inherit", fontSize: 14.5, fontWeight: 800, cursor: "pointer" }}>{t}</button>
  );
  const PROG = [["a", zw("Er nähert sich dem Erwartungswert, schwankt aber weiter ein wenig.", "It approaches the expected value but keeps fluctuating a little.")],
    ["b", zw("Er ist nach jedem Spiel genau gleich dem Erwartungswert.", "It equals the expected value exactly after every game.")],
    ["c", zw("Er wird mit jedem Spiel immer größer.", "It keeps growing with every game.")]];
  return (
    <div style={{ ...karte, marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        <p style={kicker}>{zw("Langfristig spielen", "Play in the long run")}</p>
        <IchHaengeFest kontext={hilfeFuer(`erw-l-${sp.id}`, sp)} />
      </div>
      <p style={{ ...hinweis, color: C.tinte, marginBottom: 4 }}>{sp.text} {zw(`Einsatz ${euro(sp.e)} pro Spiel.`, `Stake ${euro(sp.e)} per game.`)}</p>
      <Tabelle sp={sp} zeigeP3 netto={[true, true, true]} />
      <p style={{ fontSize: 14.5, color: C.tinte, margin: "4px 0 6px" }}>
        <Marke art="exakt" /> {zw("Erwarteter Nettogewinn:", "Expected net gain:")} <b>{euro(E)}</b> <span style={{ color: C.grau, fontSize: 13 }}>({zt(E, 4)} €)</span>
      </p>
      {!prognose ? (
        <div style={{ marginTop: 8 }}>
          <p style={{ fontSize: 14.5, color: C.tinte, lineHeight: 1.6, margin: "0 0 8px" }}>
            {zw("Erst vermuten: Was passiert mit dem durchschnittlichen Nettogewinn pro Spiel, wenn du sehr oft spielst?", "Guess first: what happens to the average net gain per game if you play very often?")}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {PROG.map(([id, t]) => (
              <button key={id} type="button" onClick={() => setPrognose(id)}
                style={{ minHeight: 46, padding: "8px 14px", borderRadius: 14, border: `1.5px solid ${C.linie}`, background: C.weiss, color: C.see, fontFamily: "inherit", fontSize: 14, fontWeight: 700, textAlign: "left", cursor: "pointer" }}>{t}</button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <p style={{ fontSize: 13, color: C.grau, margin: "6px 0" }}>{zw("Deine Vermutung:", "Your guess:")} {PROG.find((x) => x[0] === prognose)[1]}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "6px 0 10px" }}>
            {knopf(1, zw("1 Spiel", "1 game"))}{knopf(10, "+10")}{knopf(100, "+100")}{knopf(1000, "+1000")}
          </div>
          {n > 0 && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8, marginBottom: 10 }}>
                {[[zw("Gespielt", "Played"), String(n)], [zw("Letztes Spiel", "Last game"), letztes === null ? "–" : `${sp.namen[letztes]}: ${euro(netto[letztes])}`],
                  [zw("Summe netto", "Total net"), euro(summe)], [zw("Durchschnitt pro Spiel", "Average per game"), `${zt(summe / n, 3)} €`]].map(([t, w]) => (
                  <div key={t} style={{ background: C.sand, borderRadius: 12, padding: "8px 10px" }}>
                    <p style={{ fontSize: 11.5, fontWeight: 700, color: C.grau, margin: 0 }}>{t}</p>
                    <p style={{ fontSize: 15, fontWeight: 800, color: C.tinte, margin: "2px 0 0" }}>{w}</p>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 12.5, fontWeight: 700, color: C.grau, margin: "0 0 4px" }}><Marke art="sim" /> {zw("Durchschnittlicher Nettogewinn nach n Spielen", "Average net gain after n games")}</p>
              <Verlauf werte={verlauf} ziel={E} zielText={`E = ${zt(E, 2)} €`} einheit={zw("Spiele", "games")} />
              <div style={{ overflowX: "auto", marginTop: 10 }}>
                <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13.5, color: C.tinte }}>
                  <thead><tr>{[zw("Ergebnis", "Outcome"), zw("relative Häufigkeit", "relative frequency"), zw("Wahrscheinlichkeit", "probability")].map((t) => <th key={t} style={{ textAlign: "left", padding: "6px 6px", fontSize: 12, color: C.grau, borderBottom: `1px solid ${C.linie}` }}>{t}</th>)}</tr></thead>
                  <tbody>{sp.namen.map((nm, i) => (
                    <tr key={nm}><td style={{ padding: "6px", borderBottom: `1px solid ${C.linie}` }}>{nm}</td>
                      <td style={{ padding: "6px", borderBottom: `1px solid ${C.linie}` }}>{zt(anzahl[i] / n, 3)}</td>
                      <td style={{ padding: "6px", borderBottom: `1px solid ${C.linie}` }}>{bText(sp.brueche[i])} ≈ {zt(sp.p[i], 3)}</td></tr>
                  ))}</tbody>
                </table>
              </div>
              {n >= 100 && (
                <Rueck art={prognose === "a" ? "gut" : "info"}>
                  {prognose === "a" ? zw("Deine Vermutung passt: ", "Your guess fits: ") : zw("Schau genau hin: ", "Look closely: ")}
                  {zw(`Der Durchschnitt (Simulation) liegt nach ${n} Spielen bei ${zt(summe / n, 3)} €, der Erwartungswert (exakt) bei ${zt(E, 3)} €. Mit wachsender Spielzahl rückt der Durchschnitt meist näher an E heran – einzelne Spiele und kurze Serien schwanken trotzdem stark.`,
                    `After ${n} games the average (simulation) is €${zt(summe / n, 3)}, the expected value (exact) €${zt(E, 3)}. As the number of games grows, the average usually moves closer to E – single games and short runs still vary a lot.`)}
                </Rueck>
              )}
              <GrosserKnopf ghost onClick={zuruecksetzen}>{zw("Simulation zurücksetzen", "Reset simulation")}</GrosserKnopf>
            </>
          )}
        </>
      )}
      <GrosserKnopf ghost onClick={neu}>{zw("Neues Spiel", "New game")}</GrosserKnopf>
    </div>
  );
}

const MODI = [["verteilung", zw("Gewinn\u00ADverteilung", "Payout distribution")], ["fair", zw("Fairer Einsatz", "Fair stake")], ["lang", zw("Langfristig spielen", "Play in the long run")]];
export function ErwartungswertSpiele() {
  const [modus, setModus] = useState("verteilung");
  return (
    <Seite titel={zw("Erwartungswert und faire Spiele", "Expected value and fair games")}
      text={zw("Auszahlung, Einsatz und Nettogewinn sauber trennen, den Erwartungswert berechnen und sehen, was er über viele Spiele aussagt.", "Separate payout, stake and net gain, compute the expected value and see what it says about many games.")}>
      <ModusLeiste modi={MODI} modus={modus} setModus={setModus} label={zw("Erwartungswert-Übungen", "Expected value exercises")} />
      <Aufklapp titel={zw("Kurz erklärt", "In short")}>
        <p style={{ margin: "0 0 6px" }}>{zw("Eine Zufallsgröße X ordnet jedem Ergebnis eine Zahl zu, hier den Nettogewinn = Auszahlung − Einsatz.", "A random variable X assigns a number to each outcome, here the net gain = payout − stake.")}</p>
        <p style={{ margin: "0 0 6px" }}><b>E(X) = x₁ · p₁ + x₂ · p₂ + … + xₙ · pₙ</b> {zw("– jeder Wert wird mit seiner Wahrscheinlichkeit gewichtet.", "– each value is weighted with its probability.")}</p>
        <p style={{ margin: "0 0 6px" }}>{zw("Fair ist ein Spiel, wenn der erwartete Nettogewinn genau 0 ist.", "A game is fair if the expected net gain is exactly 0.")}</p>
        <p style={{ margin: 0 }}>{zw("Beispiel: Würfel, Einsatz 1 €, bei einer Sechs 6 € Auszahlung. Nettogewinne 5 € (p = 1/6) und −1 € (p = 5/6): E(X) = 5 · 1/6 − 1 · 5/6 = 0 – fair.", "Example: die, stake €1, payout €6 for a six. Net gains €5 (p = 1/6) and −€1 (p = 5/6): E(X) = 5 · 1/6 − 1 · 5/6 = 0 – fair.")}</p>
      </Aufklapp>
      <div style={{ display: modus === "verteilung" ? "block" : "none" }}><Gewinnverteilung /></div>
      <div style={{ display: modus === "fair" ? "block" : "none" }}><FairerEinsatz /></div>
      <div style={{ display: modus === "lang" ? "block" : "none" }}><Langfristig /></div>
    </Seite>
  );
}
