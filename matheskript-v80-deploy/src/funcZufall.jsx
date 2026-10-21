/* ============================================================
   Unterstufe (Kl. 7) · Zufall und Wahrscheinlichkeit – Einstieg
   · Entdecken – Würfel werfen (10, 100, 1000 Mal): relative Häufigkeiten
     pendeln sich bei 1/6 ein (Gesetz der großen Zahlen)
   · Üben – Laplace-Wahrscheinlichkeit am Würfel, Urne, Gegenereignis,
     zweistufig mit Pfadregel, relative Häufigkeit, erwartete Anzahl
   Mathematik in unterGen.js (getestet).
   ============================================================ */
import React, { useState } from "react";
import { C } from "./base1.jsx";
import { GrosserKnopf, hilfeKontext, karte, kicker, zw } from "./ui2.jsx";
import { zt } from "./ui3.jsx";
import { qNum } from "./rechnen2.js";
import { ZUFALL_ARTEN, zufallAufgabe } from "./unterGen.js";
import { Merke, UebenRahmen, WertZeile, ZweiModi, zs } from "./geoUi.jsx";
import { werkzeugAnimationen } from "./unterstufeMedien.js";
import { Arbeitsflaeche, BildKarte, FeinKarte, titelStil, useBreite, useDesktop } from "./arbeitsflaeche.jsx";

let zaehler = 0;
const fr = (b) => (b.n === 1 ? String(b.z) : `$\\frac{${b.z}}{${b.n}}$`);

/* breite/hoehe: Desktop zeichnet in echten Pixeln (gemessene Breite), Handy wie bisher im Format 320 × 180 */
function Haeufigkeiten({ h, breite, hoehe }) {
  const n = h.reduce((s, x) => s + x, 0), W = breite || 320, H = hoehe || 180, b = (W - 40) / 6, max = 0.4;
  const g = breite ? 1.1 : 1;   // Desktop: Beschriftung eine Spur größer
  const Y = (v) => H - 24 * g - (v / max) * (H - 40 * g);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label={zw("Relative Häufigkeiten der Augenzahlen", "Relative frequencies of the dice values")}>
      {[0, 0.1, 0.2, 0.3, 0.4].map((v) => <g key={v}><line x1="30" y1={Y(v)} x2={W - 6} y2={Y(v)} stroke={`${C.see}18`} /><text x="26" y={Y(v) + 4} textAnchor="end" style={{ fontSize: 10 * g, fill: C.grau }}>{zt(v, 1)}</text></g>)}
      {h.map((x, i) => { const r = n ? x / n : 0; return <g key={i}><rect x={34 + i * b + b * 0.15} y={Y(r)} width={b * 0.7} height={Y(0) - Y(r)} rx="3" fill={C.see} opacity="0.85" /><text x={34 + i * b + b / 2} y={H - 8} textAnchor="middle" style={{ fontSize: 12 * g, fontWeight: 800, fill: C.tinte }}>{i + 1}</text></g>; })}
      <line x1="30" y1={Y(1 / 6)} x2={W - 6} y2={Y(1 / 6)} stroke={C.flaggold} strokeWidth="2" strokeDasharray="6 4" />
      <text x={W - 8} y={Y(1 / 6) - 5} textAnchor="end" style={{ fontSize: 11 * g, fontWeight: 800, fill: "#8A6A00" }}>1/6 ≈ 0,167</text>
    </svg>
  );
}

function Entdecken() {
  const [h, setH] = useState([0, 0, 0, 0, 0, 0]);
  const wirf = (k) => { const neu = [...h]; for (let i = 0; i < k; i++) neu[Math.floor(Math.random() * 6)] += 1; setH(neu); };
  const n = h.reduce((s, x) => s + x, 0);
  const abw = n ? Math.max(...h.map((x) => Math.abs(x / n - 1 / 6))) : 0;
  const desktop = useDesktop();
  const [bildRef, bildBreite] = useBreite();
  const knoepfe = (spalten) => (
    <div style={{ display: "grid", gridTemplateColumns: spalten, gap: 6 }}>
      <GrosserKnopf onClick={() => wirf(10)}>+10</GrosserKnopf>
      <GrosserKnopf onClick={() => wirf(100)}>+100</GrosserKnopf>
      <GrosserKnopf onClick={() => wirf(1000)}>+1000</GrosserKnopf>
      <GrosserKnopf ghost onClick={() => setH([0, 0, 0, 0, 0, 0])}>{zw("Neu", "Reset")}</GrosserKnopf>
    </div>
  );
  const werte = (
    <>
      <WertZeile links={zw("Würfe insgesamt", "Total throws")} rechts={n} />
      <WertZeile links={zw("Größte Abweichung von 1/6", "Largest deviation from 1/6")} rechts={n ? zt(abw, 3) : "–"} farbe={C.gruen} />
    </>
  );
  const merke = <Merke>{zw("Bei wenigen Würfen schwanken die relativen Häufigkeiten stark. Je öfter du würfelst, desto näher kommen sie der Wahrscheinlichkeit 1/6 – das empirische Gesetz der großen Zahlen.", "With few throws the relative frequencies vary a lot. The more often you throw, the closer they get to the probability 1/6 – the empirical law of large numbers.")}</Merke>;

  /* Desktop: Würfeln und Kennzahlen links, Diagramm rechts in echten Pixeln */
  if (desktop) {
    const W = bildBreite || 400;
    return (
      <div data-zufall="breit" style={{ marginTop: 16 }}>
        <Arbeitsflaeche
          links={(
            <FeinKarte>
              <p style={titelStil}>{zw("Würfel-Experiment", "Dice experiment")}</p>
              <div style={{ marginTop: -12 }}>{knoepfe("repeat(2, minmax(0, 1fr))")}</div>
              <div style={{ marginTop: 10 }}>{werte}</div>
            </FeinKarte>
          )}
          rechts={<BildKarte><div style={{ padding: "12px 14px 8px" }}><div ref={bildRef}><Haeufigkeiten h={h} breite={W} hoehe={Math.round(W * 0.62)} /></div></div></BildKarte>} />
        <div style={{ marginTop: 8 }}>{merke}</div>
      </div>
    );
  }

  return (
    <div style={{ ...karte, marginTop: 16 }}>
      <p style={kicker}>{zw("Würfel-Experiment", "Dice experiment")}</p>
      {knoepfe("repeat(4, 1fr)")}
      <div style={{ marginTop: 12, background: C.sand, borderRadius: 14, padding: 6 }}><Haeufigkeiten h={h} /></div>
      {werte}
      {merke}
    </div>
  );
}

const TITEL = { wuerfel: ["Würfel", "Dice"], urne: ["Urne", "Urn"], gegen: ["Gegenereignis", "Complement"], zweistufig: ["Zweistufig", "Two stages"], relativ: ["Relative Häufigkeit", "Relative frequency"], erwartet: ["Erwartete Anzahl", "Expected number"] };
const neue = (art) => ({ id: ++zaehler, ...zufallAufgabe(art) });
const BR = zw("Gib den Bruch als 1/6 ein.", "Enter the fraction as 1/6.");

function schritte(a) {
  switch (a.art) {
    case "wuerfel": return [
      zs("zf-g", zw("Günstige Ergebnisse", "Favourable outcomes"), zw("Anzahl =", "Count ="), a.guenstig.length, zw("Wie viele Augenzahlen sind günstig?", "How many outcomes are favourable?"), { hinweis: zw("Schreibe sie auf: 1, 2, 3, 4, 5, 6 – welche passen?", "Write them down: 1, 2, 3, 4, 5, 6 – which fit?"), erkl: `{${a.guenstig.join(", ")}}` }),
      zs("zf-p", zw("Wahrscheinlichkeit", "Probability"), "P =", qNum(a.p), `${zw("Günstige durch mögliche Ergebnisse, vollständig gekürzt.", "Favourable divided by possible outcomes, fully simplified.")} ${BR}`, { gekuerzt: true, wertText: fr(a.p), breite: 110, fehler: [{ wert: a.guenstig.length / 10, text: zw("Ein Würfel hat 6 mögliche Ergebnisse.", "A die has 6 possible outcomes.") }], hinweis: `$\\frac{${a.guenstig.length}}{6}$`, erkl: `P = $\\frac{${a.guenstig.length}}{6}$ = ${fr(a.p)}` }),
    ];
    case "urne": return [zs("zf-u", zw("Wahrscheinlichkeit", "Probability"), zw("P(rot) =", "P(red) ="), qNum(a.p), `${zw("Wie wahrscheinlich ist es, eine rote Kugel zu ziehen? Kürze vollständig.", "How likely is it to draw a red ball? Simplify fully.")} ${BR}`, { gekuerzt: true, wertText: fr(a.p), breite: 110, fehler: [{ wert: a.r / (a.b + a.g || 1), text: zw("Im Nenner stehen alle Kugeln – auch die roten.", "The denominator contains all balls – including the red ones.") }].filter((f) => Math.abs(f.wert - qNum(a.p)) > 1e-9), hinweis: `$\\frac{${a.r}}{${a.r + a.b + a.g}}$`, erkl: `P = ${fr(a.p)}` })];
    case "gegen": return [zs("zf-ge", zw("Gegenwahrscheinlichkeit", "Complement"), zw("P(nicht E) =", "P(not E) ="), qNum(a.gegen), `${zw("Berechne die Wahrscheinlichkeit des Gegenereignisses.", "Calculate the probability of the complement.")} ${BR}`, { gekuerzt: true, wertText: fr(a.gegen), breite: 110, hinweis: `1 − ${fr(a.p)}`, erkl: `1 − ${fr(a.p)} = ${fr(a.gegen)}` })];
    case "zweistufig": return [
      zs("zf-z1", zw("Erste Stufe", "First stage"), "P₁ =", qNum(a.p1), `${zw("Wie wahrscheinlich ist das gewünschte Ergebnis beim ersten Mal?", "How likely is the desired outcome the first time?")} ${BR}`, { gekuerzt: true, wertText: fr(a.p1), breite: 110, erkl: fr(a.p1) }),
      zs("zf-z2", zw("Pfadregel", "Path rule"), "P =", qNum(a.p), `${zw("Entlang eines Pfades wird multipliziert. Wie wahrscheinlich ist es, dass es beide Male klappt?", "Along a path you multiply. How likely is it to succeed both times?")} ${BR}`, { gekuerzt: true, wertText: fr(a.p), breite: 110, fehler: [{ wert: qNum(a.p1) + qNum(a.p2), text: zw("Entlang eines Pfades wird multipliziert, nicht addiert.", "Along a path you multiply, not add.") }], hinweis: `${fr(a.p1)} · ${fr(a.p2)}`, erkl: `${fr(a.p1)} · ${fr(a.p2)} = ${fr(a.p)}` }),
    ];
    case "relativ": return [zs("zf-r", zw("Relative Häufigkeit", "Relative frequency"), "h =", a.wert, zw("Anzahl der Treffer durch Anzahl der Versuche (als Dezimalzahl).", "Number of hits divided by number of trials (as a decimal)."), { tol: 0.0005, fehler: [{ wert: a.n / a.k, text: zw("Umgekehrt: Treffer : Versuche.", "The other way round: hits : trials.") }], hinweis: `${a.k} : ${a.n}`, erkl: `${a.k} : ${a.n} = ${zt(a.wert, 3)}` })];
    default: return [zs("zf-e", zw("Erwartete Anzahl", "Expected number"), zw("etwa", "about"), a.wert, zw("Wie oft ist das Ereignis ungefähr zu erwarten?", "About how often is the event to be expected?"), { fehler: [{ wert: a.n * a.p.n / a.p.z, text: zw("Geteilt statt mal: erwartete Anzahl = Versuche · Wahrscheinlichkeit.", "Divided instead of multiplied: expected number = trials · probability.") }], hinweis: `${a.n} · ${fr(a.p)}`, erkl: `${a.n} · ${fr(a.p)} = ${a.wert}` })];
  }
}
function text(a) {
  switch (a.art) {
    case "wuerfel": return zw(`Ein normaler Würfel wird einmal geworfen. Wie wahrscheinlich ist ${a.text}?`, `A normal die is thrown once. How likely is ${{ "eine gerade Zahl": "an even number", "eine Zahl größer als 4": "a number greater than 4", "eine Primzahl": "a prime", "eine Sechs": "a six", "höchstens eine Zwei": "at most a two", "eine durch 3 teilbare Zahl": "a number divisible by 3" }[a.text]}?`);
    case "urne": return zw(`In einer Urne liegen ${a.r} rote, ${a.b} blaue${a.g ? ` und ${a.g} grüne` : ""} Kugeln. Es wird eine Kugel gezogen.`, `An urn contains ${a.r} red, ${a.b} blue${a.g ? ` and ${a.g} green` : ""} balls. One ball is drawn.`);
    case "gegen": return zw(`Ein Ereignis E hat die Wahrscheinlichkeit ${fr(a.p)}.`, `An event E has probability ${fr(a.p)}.`);
    case "zweistufig": return a.v === "muenze" ? zw("Eine Münze wird zweimal geworfen. Wie wahrscheinlich ist zweimal Kopf?", "A coin is tossed twice. How likely are two heads?") : a.v === "wuerfel6" ? zw("Ein Würfel wird zweimal geworfen. Wie wahrscheinlich sind zwei Sechsen?", "A die is thrown twice. How likely are two sixes?") : zw(`Aus einer Urne mit ${a.r} roten und ${a.b} blauen Kugeln wird zweimal mit Zurücklegen gezogen. Wie wahrscheinlich ist zweimal rot?`, `From an urn with ${a.r} red and ${a.b} blue balls you draw twice with replacement. How likely is red twice?`);
    case "relativ": return zw(`Ein Reißnagel wurde ${a.n}-mal geworfen und landete ${a.k}-mal auf der Spitze.`, `A drawing pin was thrown ${a.n} times and landed point-up ${a.k} times.`);
    default: return zw(`Ein Ereignis hat die Wahrscheinlichkeit ${fr(a.p)}. Das Experiment wird ${a.n}-mal durchgeführt.`, `An event has probability ${fr(a.p)}. The experiment is carried out ${a.n} times.`);
  }
}
const hilfe = (a) => hilfeKontext({
  id: `zufall-${a.art}`, aufgabe: "Wahrscheinlichkeit Laplace Zufall Würfel Urne Gegenereignis Pfadregel relative Häufigkeit",
  verstehen: [zw("Was sind alle möglichen Ergebnisse? Sind sie gleich wahrscheinlich?", "What are all possible outcomes? Are they equally likely?")],
  ansatz: [zw("Laplace: P = günstige : mögliche. Gegenereignis: 1 − P. Pfad: multiplizieren.", "Laplace: P = favourable : possible. Complement: 1 − P. Path: multiply.")],
  regel: [zw("0 ≤ P ≤ 1. Erwartete Anzahl = n · P.", "0 ≤ P ≤ 1. Expected number = n · P.")],
  pruefen: [zw("Liegt dein Ergebnis zwischen 0 und 1?", "Is your result between 0 and 1?")],
});

export function ZufallEinstieg() {
  return (
    <ZweiModi werkzeug="zufall" animationen={werkzeugAnimationen("zufall")} titel={zw("Zufall und Wahrscheinlichkeit", "Chance and probability")}
      text={zw("Würfel, Münzen und Urnen: Wahrscheinlichkeiten berechnen, mit Experimenten vergleichen und zweistufige Versuche mit der Pfadregel lösen.", "Dice, coins and urns: calculate probabilities, compare with experiments and solve two-stage experiments with the path rule.")}
      kurz={<p style={{ margin: 0 }}>{zw("Laplace-Experiment (alle Ergebnisse gleich wahrscheinlich): P(E) = Anzahl günstiger : Anzahl möglicher Ergebnisse. P(nicht E) = 1 − P(E). Zweistufig: entlang des Pfades multiplizieren.", "Laplace experiment (all outcomes equally likely): P(E) = favourable : possible outcomes. P(not E) = 1 − P(E). Two stages: multiply along the path.")}</p>}
      entdecken={<Entdecken />}
      ueben={<UebenRahmen titel={TITEL} arten={ZUFALL_ARTEN} neue={neue} schritte={schritte} text={text} hilfe={hilfe} />} />
  );
}
