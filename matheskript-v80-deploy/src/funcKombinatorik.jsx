/* ============================================================
   Stochastik: Urnen und Kombinatorik
   · Versuche durchführen – Urne mit/ohne Zurücklegen, sich ändernde
     Wahrscheinlichkeiten beim Ziehen, Pfadrechnung, Simulation
   · Zählmethode wählen – Reihenfolge? Zurücklegen? → Zählformel;
     kleine Fälle aufzählen; Zählen und Wahrscheinlichkeit getrennt
   · Baumdiagramm aufbauen – Zweige beschriften, Knotensummen prüfen,
     Pfad- und Summenregel
   Ziehen ohne Zurücklegen wird nie binomial modelliert.
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useMemo, useState } from "react";
import { C } from "./base1.jsx";
import { IchHaengeFest } from "./funcHilfe.jsx";
import { binomKoeff } from "./func17.jsx";
import { Auswahl, GrosserKnopf, Rueck, ZahlFeld, hilfeKontext, hinweis, karte, kicker, zw } from "./ui2.jsx";
import { ggT, wahl, zz } from "./rechnen2.js";
import { Aufklapp, Marke, ModusLeiste, Seite, SchrittFolge, liesZahl, zt } from "./ui3.jsx";

let zaehler = 0;
const fr = (z, n) => { if (z === 0) return "0"; const g = ggT(z, n); return n / g === 1 ? String(z / g) : `${z / g}/${n / g}`; };
const fak = (n) => { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; };
const variation = (n, k) => { let r = 1; for (let i = 0; i < k; i++) r *= n - i; return r; };
const tausend = (v) => String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const ROT = "#C8102E", BLAU = C.see;
const KOMB_REGELN = [{ name: "Laplace-Wahrscheinlichkeit", bereich: "stochastik" }, { name: "Fakultät", bereich: "stochastik" }, { name: "Binomialkoeffizient", bereich: "stochastik" },
  { name: "Mit Reihenfolge, mit Zurücklegen", bereich: "stochastik" }];

function hilfeUrne(id) {
  return hilfeKontext({
    id, aufgabe: "Urne ziehen mit ohne Zurücklegen Baumdiagramm Pfadregel",
    verstehen: [
      zw("Wird die gezogene Kugel zurückgelegt? Davon hängt ab, ob sich die Urne beim zweiten Zug verändert.", "Is the drawn ball put back? That decides whether the urn changes for the second draw."),
      zw("Ohne Zurücklegen fehlt beim zweiten Zug eine Kugel – Anzahl und Zusammensetzung ändern sich.", "Without replacement one ball is missing for the second draw – the number and the mix change."),
      zw("Stell dir die Kugeln nummeriert vor: Jede einzelne Kugel hat dieselbe Chance, gezogen zu werden.", "Imagine the balls numbered: each single ball has the same chance of being drawn."),
    ],
    ansatz: [
      zw("Welcher Pfad im Baumdiagramm gehört zu dem gesuchten Ereignis?", "Which path in the tree belongs to the event you want?"),
      zw("Entlang eines Pfades wird multipliziert (Pfadregel), mehrere Pfade werden addiert (Summenregel).", "Multiply along a path (product rule), add several paths (sum rule)."),
      zw("Beim zweiten Zug: Wie viele Kugeln sind noch in der Urne und wie viele davon sind rot?", "On the second draw: how many balls are left, and how many of them are red?"),
    ],
    regel: [
      zw("Welche Regel gilt für die Wahrscheinlichkeit eines Pfades?", "Which rule gives the probability of a path?"),
      zw("Pfadregel: P(Pfad) = Produkt der Zweigwahrscheinlichkeiten.", "Product rule: P(path) = product of the branch probabilities."),
      zw("Die Zweige, die von einem Knoten ausgehen, haben zusammen die Wahrscheinlichkeit 1.", "The branches leaving one node have probability 1 together."),
    ],
    pruefen: [
      zw("Ergeben die Zweige an jedem Knoten zusammen 1?", "Do the branches at every node add up to 1?"),
      zw("Ergeben alle Pfadwahrscheinlichkeiten zusammen 1?", "Do all path probabilities add up to 1?"),
      zw("Ohne Zurücklegen: Hat sich der Nenner beim zweiten Zug um 1 verringert?", "Without replacement: did the denominator drop by 1 on the second draw?"),
    ],
    regeln: KOMB_REGELN,
  });
}

/* ---------- Urne zeichnen ---------- */
function Urne({ rot, blau, gezogen = [] }) {
  const kugeln = [...Array(rot).fill("r"), ...Array(blau).fill("b")];
  const W = 220, H = 120;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: 200, maxWidth: "60%" }} role="img" aria-label={zw(`Urne mit ${rot} roten und ${blau} blauen Kugeln`, `Urn with ${rot} red and ${blau} blue balls`)}>
        <path d="M24 14 Q20 112 110 112 Q200 112 196 14" fill={C.sand} stroke={C.grau} strokeWidth="2" />
        <line x1="16" y1="14" x2="204" y2="14" stroke={C.grau} strokeWidth="2.5" strokeLinecap="round" />
        {kugeln.map((k, i) => {
          const reihe = Math.floor(i / 6), sp = i % 6;
          return <circle key={i} cx={52 + sp * 23 + (reihe % 2) * 11} cy={96 - reihe * 21} r="9.5" fill={k === "r" ? ROT : BLAU} stroke="#fff" strokeWidth="1.5" />;
        })}
      </svg>
      {gezogen.length > 0 && (
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: C.grau, margin: "0 0 4px" }}>{zw("Gezogen", "Drawn")}</p>
          <div style={{ display: "flex", gap: 6 }}>
            {gezogen.map((k, i) => <span key={i} style={{ width: 22, height: 22, borderRadius: 999, background: k === "r" ? ROT : BLAU, display: "inline-block", border: "2px solid #fff", boxShadow: "0 0 0 1px #ccd" }} />)}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Modus 1: Versuche durchführen ---------- */
function urnenAufgabe(zurueck) {
  const r = zz(2, 6), b = zz(2, 6);
  return { id: ++zaehler, r, b, n: r + b, zurueck };
}
function Versuche() {
  const [zurueck, setZurueck] = useState("ohne");
  const [au, setAu] = useState(() => urnenAufgabe(false));
  const [stand, setStand] = useState(0);
  const [inhalt, setInhalt] = useState({ r: au.r, b: au.b, gezogen: [] });
  const [sim, setSim] = useState(null);
  const neu = (z = zurueck) => { const a = urnenAufgabe(z === "mit"); setAu(a); setStand(0); setInhalt({ r: a.r, b: a.b, gezogen: [] }); setSim(null); };
  const wechsel = (z) => { setZurueck(z); neu(z); };
  const { r, b, n } = au, mit = au.zurueck;
  const p1 = r / n, p2 = mit ? r / n : (r - 1) / (n - 1), pBeide = p1 * p2;
  const t1 = fr(r, n), t2 = mit ? fr(r, n) : fr(r - 1, n - 1), tB = mit ? fr(r * r, n * n) : fr(r * (r - 1), n * (n - 1));
  const ziehen = () => {
    if (inhalt.gezogen.length >= 2) return;
    const nr = inhalt.r + inhalt.b, k = Math.random() < inhalt.r / nr ? "r" : "b";
    if (mit) setInhalt({ ...inhalt, gezogen: [...inhalt.gezogen, k] });
    else setInhalt({ r: inhalt.r - (k === "r"), b: inhalt.b - (k === "b"), gezogen: [...inhalt.gezogen, k] });
  };
  const simulieren = () => {
    let treffer = 0;
    for (let i = 0; i < 1000; i++) {
      let rr = r, nn = n;
      const a = Math.random() < rr / nn;
      if (a && !mit) { rr--; } if (!mit) nn--;
      const c = Math.random() < rr / nn;
      if (a && c) treffer++;
    }
    setSim((s) => ({ n: (s?.n || 0) + 1000, t: (s?.t || 0) + treffer }));
  };
  const schritte = useMemo(() => [
    { id: "laplace", titel: zw("Gleichwahrscheinlichkeit prüfen", "Check equal likelihood"), typ: "wahl",
      frage: zw(`In der Urne liegen ${r} rote und ${b} blaue Kugeln. Warum ist P(rot) beim ersten Zug ${t1}?`, `The urn holds ${r} red and ${b} blue balls. Why is P(red) on the first draw ${t1}?`),
      optionen: [["a", zw("Jede einzelne Kugel wird mit gleicher Wahrscheinlichkeit gezogen; rot sind die günstigen Kugeln.", "Each single ball is equally likely to be drawn; the red ones are the favourable balls.")],
        ["b", zw("Rot und Blau sind zwei Ergebnisse, also je 1/2.", "Red and blue are two outcomes, so 1/2 each.")], ["c", zw("Weil rote Kugeln schwerer sind.", "Because red balls are heavier.")]], richtig: "a",
      fehler: [{ wahl: "b", text: zw("„Rot“ und „Blau“ sind nicht gleich wahrscheinlich, wenn verschieden viele Kugeln jeder Farbe in der Urne liegen. Laplace gilt nur für gleich wahrscheinliche Ergebnisse – hier für die einzelnen Kugeln.", "“Red” and “blue” are not equally likely if there are different numbers of each colour. Laplace only applies to equally likely outcomes – here the single balls.") }],
      hinweise: [zw("Nummeriere die Kugeln in Gedanken.", "Number the balls in your mind.")],
      erklaerung: zw(`Jede der ${n} Kugeln ist gleich wahrscheinlich. ${r} davon sind rot: P(rot) = ${t1}.`, `Each of the ${n} balls is equally likely. ${r} of them are red: P(red) = ${t1}.`) },
    { id: "p1", titel: zw("Erster Zug", "First draw"), typ: "zahl", text: zw("P(1. rot) =", "P(1st red) ="), wert: p1, toleranz: 0.0005, wertText: t1,
      frage: zw("Wie groß ist die Wahrscheinlichkeit, beim ersten Zug eine rote Kugel zu ziehen?", "What is the probability of drawing a red ball first?"),
      fehler: [{ wert: r / b, text: zw("Rot durch Blau ist ein Verhältnis, keine Wahrscheinlichkeit. Teile durch die Gesamtzahl aller Kugeln.", "Red divided by blue is a ratio, not a probability. Divide by the total number of balls.") }],
      hinweise: [zw("günstige durch mögliche Kugeln", "favourable divided by possible balls")], erklaerung: `P(1. ${zw("rot", "red")}) = ${r}/${n}${t1 !== `${r}/${n}` ? ` = ${t1}` : ""}.` },
    { id: "p2", titel: zw("Zweiter Zug", "Second draw"), typ: "zahl", text: zw("P(2. rot | 1. rot) =", "P(2nd red | 1st red) ="), wert: p2, toleranz: 0.0005, wertText: t2,
      frage: mit ? zw("Die erste Kugel war rot und wird zurückgelegt. Wie wahrscheinlich ist dann beim zweiten Zug rot?", "The first ball was red and is put back. How likely is red on the second draw?")
        : zw("Die erste Kugel war rot und wird nicht zurückgelegt. Wie wahrscheinlich ist dann beim zweiten Zug rot?", "The first ball was red and is not put back. How likely is red on the second draw?"),
      fehler: mit ? [{ wert: (r - 1) / (n - 1), text: zw("Die Kugel wurde zurückgelegt – die Urne ist wieder wie am Anfang.", "The ball was put back – the urn is as it was at the start.") }]
        : [{ wert: r / n, text: zw("Die erste rote Kugel liegt nicht mehr in der Urne. Es sind eine rote Kugel und insgesamt eine Kugel weniger.", "The first red ball is no longer in the urn: one red ball fewer and one ball fewer in total.") },
          { wert: (r - 1) / n, text: zw("Auch der Nenner ändert sich: Insgesamt liegt eine Kugel weniger in der Urne.", "The denominator changes too: there is one ball fewer in total.") }],
      hinweise: [zw("Zähle die Kugeln, die nach dem ersten Zug in der Urne liegen.", "Count the balls in the urn after the first draw.")],
      erklaerung: mit ? zw(`Zurückgelegt: wieder ${r} rote von ${n} Kugeln, also ${t2}.`, `Put back: again ${r} red out of ${n}, so ${t2}.`) : zw(`Ohne Zurücklegen: noch ${r - 1} rote von ${n - 1} Kugeln, also ${t2}.`, `Without replacement: ${r - 1} red out of ${n - 1} balls left, so ${t2}.`) },
    { id: "pb", titel: zw("Beide rot", "Both red"), typ: "zahl", text: zw("P(rot, rot) =", "P(red, red) ="), wert: pBeide, toleranz: 0.0005, wertText: `${tB} ≈ ${zt(pBeide, 4)}`,
      frage: zw("Wie wahrscheinlich ist es, dass beide gezogenen Kugeln rot sind?", "How likely is it that both drawn balls are red?"),
      fehler: [{ wert: p1 + p2, text: zw("Entlang eines Pfades wird multipliziert, nicht addiert.", "Multiply along a path, don't add.") }, ...(!mit ? [{ wert: p1 * p1, text: zw("Das wäre mit Zurücklegen. Hier ändert sich die Wahrscheinlichkeit beim zweiten Zug.", "That would be with replacement. Here the probability changes on the second draw.") }] : [])],
      hinweise: [zw("Pfadregel: die Wahrscheinlichkeiten entlang des Pfades multiplizieren.", "Product rule: multiply the probabilities along the path.")],
      erklaerung: `${t1} · ${t2} = ${tB} ≈ ${zt(pBeide, 4)}.` },
    { id: "modell", titel: zw("Passendes Modell", "Suitable model"), typ: "wahl", frage: zw("Darf man die Anzahl roter Kugeln bei diesen zwei Zügen mit der Binomialverteilung berechnen?", "May you compute the number of red balls in these two draws with the binomial distribution?"),
      optionen: [["ja", zw(`Ja, mit n = 2 und p = ${t1}.`, `Yes, with n = 2 and p = ${t1}.`)], ["nein", zw("Nein, weil sich die Trefferwahrscheinlichkeit von Zug zu Zug ändert.", "No, because the success probability changes from draw to draw.")]], richtig: mit ? "ja" : "nein",
      fehler: mit ? [{ wahl: "nein", text: zw("Mit Zurücklegen bleibt p bei jedem Zug gleich und die Züge sind unabhängig – eine Bernoulli-Kette.", "With replacement p stays the same on every draw and the draws are independent – a Bernoulli process.") }]
        : [{ wahl: "ja", text: zw("Ohne Zurücklegen ändert sich p nach jedem Zug, die Züge sind abhängig. Ziehen ohne Zurücklegen ist keine Bernoulli-Kette.", "Without replacement p changes after every draw, the draws are dependent. Drawing without replacement is no Bernoulli process.") }],
      hinweise: [zw("Bernoulli-Kette: gleiches p bei jedem Versuch, unabhängige Versuche.", "Bernoulli process: same p on every trial, independent trials.")],
      erklaerung: mit ? zw("Mit Zurücklegen: unabhängige Züge mit gleichem p – binomial mit n = 2.", "With replacement: independent draws with the same p – binomial with n = 2.") : zw("Ohne Zurücklegen ist das Modell nicht binomial; man rechnet mit dem Baumdiagramm (oder hypergeometrisch).", "Without replacement the model is not binomial; use the tree diagram (or the hypergeometric distribution).") },
  ], [au]);
  const nr = inhalt.r + inhalt.b;
  return (
    <div style={{ ...karte, marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        <p style={kicker}>{zw("Versuche durchführen", "Run experiments")}</p>
        <IchHaengeFest kontext={hilfeUrne(`urne-${au.id}`)} />
      </div>
      <Auswahl optionen={[["ohne", zw("ohne Zurücklegen", "without replacement")], ["mit", zw("mit Zurücklegen", "with replacement")]]} wert={zurueck} setWert={wechsel} label={zw("Ziehen", "Drawing")} />
      <p style={{ ...hinweis, color: C.tinte, margin: "10px 0 6px" }}>
        {zw(`Aus der Urne werden nacheinander zwei Kugeln gezogen, ${mit ? "mit" : "ohne"} Zurücklegen.`, `Two balls are drawn one after the other, ${mit ? "with" : "without"} replacement.`)}
      </p>
      <Urne rot={inhalt.r} blau={inhalt.b} gezogen={inhalt.gezogen} />
      <p style={{ fontSize: 13.5, color: C.tinte, margin: "6px 0" }}>
        {inhalt.gezogen.length < 2
          ? <>{zw("Nächster Zug:", "Next draw:")} P({zw("rot", "red")}) = <b>{fr(inhalt.r, nr)}</b>{nr !== n || inhalt.gezogen.length ? zw(` (in der Urne: ${inhalt.r} rot, ${inhalt.b} blau)`, ` (in the urn: ${inhalt.r} red, ${inhalt.b} blue)`) : ""}</>
          : zw("Beide Züge gemacht.", "Both draws done.")}
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 1 }}><GrosserKnopf gold onClick={ziehen} disabled={inhalt.gezogen.length >= 2}>{zw("Kugel ziehen", "Draw a ball")}</GrosserKnopf></div>
        <div style={{ flex: 1 }}><GrosserKnopf ghost onClick={() => setInhalt({ r: au.r, b: au.b, gezogen: [] })}>{zw("Urne neu füllen", "Refill urn")}</GrosserKnopf></div>
      </div>
      <SchrittFolge schritte={schritte} stand={stand} setStand={setStand} fertigText={zw("Fertig: Wahrscheinlichkeiten pro Zug, Pfadregel und passendes Modell.", "Done: probability per draw, product rule and suitable model.")} />
      {stand >= 4 && (
        <div style={{ background: C.sand, borderRadius: 14, padding: "10px 14px", marginTop: 12 }}>
          <p style={{ fontSize: 14, color: C.tinte, margin: "0 0 4px" }}><Marke art="exakt" /> P({zw("rot, rot", "red, red")}) = {tB} ≈ {zt(pBeide, 4)}</p>
          {sim && <p style={{ fontSize: 14, color: C.tinte, margin: 0 }}><Marke art="sim" /> {zw(`${sim.t} von ${sim.n} Versuchen: relative Häufigkeit`, `${sim.t} of ${sim.n} trials: relative frequency`)} {zt(sim.t / sim.n, 4)}</p>}
          <GrosserKnopf ghost onClick={simulieren}>{zw("1000-mal zwei Kugeln ziehen", "Draw two balls 1000 times")}</GrosserKnopf>
        </div>
      )}
      <GrosserKnopf ghost onClick={() => neu()}>{zw("Neue Urne", "New urn")}</GrosserKnopf>
    </div>
  );
}

/* ---------- Modus 2: Zählmethode wählen ---------- */
const TYPEN = {
  mm: { reihenfolge: true, zurueck: true, formel: "nᵏ", f: (n, k) => n ** k },
  mo: { reihenfolge: true, zurueck: false, formel: "n! / (n − k)!", f: variation },
  oo: { reihenfolge: false, zurueck: false, formel: "(n über k)", f: binomKoeff },
  om: { reihenfolge: false, zurueck: true, formel: "(n + k − 1 über k)", f: (n, k) => binomKoeff(n + k - 1, k) },
};
const FORMELN = [["mm", "nᵏ"], ["mo", "n! / (n − k)!"], ["oo", zw("(n über k)", "(n choose k)")], ["om", zw("(n + k − 1 über k)", "(n + k − 1 choose k)")]];

const ueber = zw("über", "choose");
const eingesetzt = ({ typ, n, k }) => typ === "mm" ? `${n}^${k}` : typ === "mo" ? (k === n ? `${n}!` : `${n}! / ${n - k}!`) : typ === "oo" ? `(${n} ${ueber} ${k})` : `(${n + k - 1} ${ueber} ${k})`;
function zaehlAufgabe(vorher) {
  const liste = [
    () => { const n = wahl([8, 10, 12]); return { typ: "oo", n, k: 3, text: zw(`Aus ${n} Personen werden 3 für einen Ausschuss ausgewählt. Wie viele Ausschüsse sind möglich?`, `3 of ${n} people are chosen for a committee. How many committees are possible?`),
      e: { text: zw("Der Ausschuss wird ausgelost. Wie wahrscheinlich ist es, dass Anna dazugehört?", "The committee is drawn by lot. How likely is it that Anna is on it?"), guenstig: binomKoeff(n - 1, 2), gText: zw(`Anna ist fest dabei, die anderen 2 kommen aus ${n - 1} Personen: (${n - 1} über 2)`, `Anna is in; the other 2 come from ${n - 1} people: (${n - 1} choose 2)`) } }; },
    () => { const n = wahl([8, 10, 12]); return { typ: "mo", n, k: 3, text: zw(`Aus ${n} Personen werden Vorsitz, Stellvertretung und Kasse besetzt (jede Person höchstens ein Amt). Wie viele Besetzungen gibt es?`, `Out of ${n} people, chair, deputy and treasurer are filled (one office per person). How many ways are there?`),
      paar: zw("Vergleiche mit dem Ausschuss: Dort ist die Reihenfolge egal, hier sind die Ämter verschieden.", "Compare with the committee: there order does not matter, here the offices differ.") }; },
    () => { const k = wahl([3, 4]); return { typ: "mm", n: 10, k, text: zw(`Ein Zahlenschloss hat ${k} Ringe mit den Ziffern 0 bis 9. Wie viele Codes gibt es?`, `A combination lock has ${k} rings with digits 0 to 9. How many codes are there?`),
      e: { text: zw("Ein Code wird zufällig eingestellt. Wie wahrscheinlich ist es, dass alle Ziffern verschieden sind?", "A code is set at random. How likely is it that all digits are different?"), guenstig: variation(10, k), gText: zw(`verschiedene Ziffern: 10 · 9 · … (${k} Faktoren) = ${variation(10, k)}`, `different digits: 10 · 9 · … (${k} factors) = ${variation(10, k)}`) } }; },
    () => { const n = wahl([5, 6, 7]); return { typ: "mo", n, k: n, text: zw(`Wie viele Möglichkeiten gibt es, ${n} verschiedene Bücher nebeneinander ins Regal zu stellen?`, `In how many ways can ${n} different books be placed side by side on a shelf?`) }; },
    () => ({ typ: "oo", n: 49, k: 6, text: zw("Beim Lotto „6 aus 49“ werden 6 Zahlen ohne Zurücklegen gezogen; die Reihenfolge spielt keine Rolle. Wie viele Tipps gibt es?", "In the lottery “6 out of 49” six numbers are drawn without replacement; order does not matter. How many tickets are there?") }),
    () => { const n = wahl([4, 5, 6]); return { typ: "om", n, k: 3, text: zw(`Ein Becher bekommt 3 Kugeln Eis aus ${n} Sorten. Sorten dürfen sich wiederholen, die Reihenfolge im Becher ist egal. Wie viele Becher gibt es?`, `A cup gets 3 scoops from ${n} flavours. Flavours may repeat, order in the cup does not matter. How many cups are there?`) }; },
    () => { const n = wahl([8, 10]); return { typ: "mo", n, k: 3, text: zw(`${n} Läuferinnen starten. Wie viele Möglichkeiten gibt es für Gold, Silber und Bronze?`, `${n} runners start. How many ways are there for gold, silver and bronze?`),
      e: { text: zw("Alle sind gleich stark, jede Reihenfolge ist gleich wahrscheinlich. Wie wahrscheinlich gewinnt Lena Gold?", "All are equally strong; every order is equally likely. How likely does Lena win gold?"), guenstig: variation(n - 1, 2), gText: zw(`Gold ist fest vergeben, Silber und Bronze: ${n - 1} · ${n - 2}`, `Gold is fixed, silver and bronze: ${n - 1} · ${n - 2}`) } }; },
  ];
  let a;
  do { a = wahl(liste)(); } while (vorher && a.text === vorher.text);
  return { id: ++zaehler, ...a, anzahl: TYPEN[a.typ].f(a.n, a.k) };
}

/* kleine Fälle mit A, B, C, D und k = 2 aufzählen */
function aufzaehlen(typ) {
  const M = ["A", "B", "C", "D"], r = [];
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
    if (!TYPEN[typ].zurueck && i === j) continue;
    if (!TYPEN[typ].reihenfolge && j < i) continue;
    r.push(TYPEN[typ].reihenfolge ? M[i] + M[j] : `{${M[i]}, ${M[j]}}`);
  }
  return r;
}

function Zaehlen() {
  const [au, setAu] = useState(() => zaehlAufgabe());
  const [stand, setStand] = useState(0);
  const [klein, setKlein] = useState(false);
  const neu = () => { setAu(zaehlAufgabe(au)); setStand(0); setKlein(false); };
  const t = TYPEN[au.typ];
  const schritte = useMemo(() => {
    const s = [
      { id: "r", titel: zw("Reihenfolge", "Order"), typ: "wahl", frage: zw("Spielt die Reihenfolge eine Rolle?", "Does the order matter?"),
        optionen: [["ja", zw("Ja", "Yes")], ["nein", zw("Nein", "No")]], richtig: t.reihenfolge ? "ja" : "nein",
        hinweise: [zw("Vertausche zwei Ausgewählte: Entsteht dadurch ein anderes Ergebnis?", "Swap two of the chosen: does that give a different result?")],
        erklaerung: t.reihenfolge ? zw("Vertauschen ergibt ein anderes Ergebnis – die Reihenfolge zählt.", "Swapping gives a different result – order matters.") : zw("Vertauschen ändert nichts – die Reihenfolge zählt nicht.", "Swapping changes nothing – order does not matter.") },
      { id: "z", titel: zw("Wiederholung", "Repetition"), typ: "wahl", frage: zw("Darf dasselbe Element mehrfach vorkommen (mit Zurücklegen)?", "May the same element occur more than once (with replacement)?"),
        optionen: [["ja", zw("Ja", "Yes")], ["nein", zw("Nein", "No")]], richtig: t.zurueck ? "ja" : "nein",
        hinweise: [zw("Kann eine Person, Ziffer, Sorte … zweimal gewählt werden?", "Can one person, digit, flavour … be chosen twice?")],
        erklaerung: t.zurueck ? zw("Wiederholungen sind erlaubt.", "Repetitions are allowed.") : zw("Jedes Element höchstens einmal.", "Each element at most once.") },
      { id: "f", titel: zw("Zählformel", "Counting formula"), typ: "wahl", frage: zw(`Welche Formel passt? (Hier n = ${au.n}, k = ${au.k}.)`, `Which formula fits? (Here n = ${au.n}, k = ${au.k}.)`),
        optionen: FORMELN, richtig: au.typ,
        fehler: [{ wahl: "oo", text: zw("(n über k) zählt Auswahlen ohne Reihenfolge und ohne Wiederholung.", "(n choose k) counts selections without order and without repetition.") },
          { wahl: "mo", text: zw("n!/(n − k)! zählt geordnete Auswahlen ohne Wiederholung.", "n!/(n − k)! counts ordered selections without repetition.") },
          { wahl: "mm", text: zw("nᵏ zählt geordnete Auswahlen mit Wiederholung.", "nᵏ counts ordered selections with repetition.") },
          { wahl: "om", text: zw("(n + k − 1 über k) zählt Auswahlen ohne Reihenfolge, aber mit Wiederholung.", "(n + k − 1 choose k) counts selections without order but with repetition.") }].filter((f) => f.wahl !== au.typ),
        hinweise: [zw("Kombiniere deine beiden Antworten: Reihenfolge ja/nein, Wiederholung ja/nein.", "Combine your two answers: order yes/no, repetition yes/no.")],
        erklaerung: zw(`Reihenfolge ${t.reihenfolge ? "ja" : "nein"}, Wiederholung ${t.zurueck ? "ja" : "nein"} → ${t.formel}.`, `Order ${t.reihenfolge ? "yes" : "no"}, repetition ${t.zurueck ? "yes" : "no"} → ${t.formel}.`) },
      { id: "n", titel: zw("Anzahl", "Number"), typ: "zahl", text: zw("Anzahl =", "Number ="), wert: au.anzahl, wertText: tausend(au.anzahl), breite: 140,
        frage: zw("Berechne die Anzahl der Möglichkeiten.", "Compute the number of possibilities."),
        fehler: [{ wert: TYPEN.mm.f(au.n, au.k), text: zw("Das wäre mit Wiederholung und mit Reihenfolge.", "That would be with repetition and with order.") }, { wert: variation(au.n, au.k), text: zw("Das wäre mit Reihenfolge ohne Wiederholung.", "That would be ordered without repetition.") },
          { wert: binomKoeff(au.n, au.k), text: zw("Das wäre ohne Reihenfolge ohne Wiederholung.", "That would be unordered without repetition.") }].filter((f) => f.wert !== au.anzahl),
        hinweise: [zw(`Setze n = ${au.n} und k = ${au.k} in ${t.formel} ein.`, `Plug n = ${au.n} and k = ${au.k} into ${t.formel}.`)],
        erklaerung: `${t.formel} = ${eingesetzt(au)} = ${tausend(au.anzahl)}.${au.paar ? " " + au.paar : ""}` },
    ];
    if (au.e) {
      const p = au.e.guenstig / au.anzahl;
      s.push({ id: "gl", titel: zw("Laplace-Voraussetzung", "Laplace condition"), typ: "wahl", frage: au.e.text + " " + zw("Darf man hier günstige durch mögliche Fälle rechnen?", "May you compute favourable divided by possible cases here?"),
        optionen: [["ja", zw("Ja, alle gezählten Möglichkeiten sind gleich wahrscheinlich.", "Yes, all counted possibilities are equally likely.")], ["nein", zw("Nein, das geht nie bei Kombinatorik.", "No, never with combinatorics.")]], richtig: "ja",
        hinweise: [zw("Zufällig ausgelost bzw. zufällig eingestellt heißt: jede Möglichkeit gleich wahrscheinlich.", "Drawn or set at random means: every possibility is equally likely.")],
        erklaerung: zw("Weil zufällig gewählt wird, ist jede der gezählten Möglichkeiten gleich wahrscheinlich – Laplace ist erlaubt.", "Because the choice is random, every counted possibility is equally likely – Laplace is allowed.") });
      s.push({ id: "g", titel: zw("Günstige Fälle", "Favourable cases"), typ: "zahl", text: zw("günstig =", "favourable ="), wert: au.e.guenstig, wertText: tausend(au.e.guenstig), breite: 120,
        frage: zw("Wie viele der Möglichkeiten sind günstig?", "How many of the possibilities are favourable?"), hinweise: [au.e.gText], erklaerung: au.e.gText + "." });
      s.push({ id: "p", titel: zw("Wahrscheinlichkeit", "Probability"), typ: "zahl", text: "P =", wert: p, toleranz: 0.0005, wertText: `${fr(au.e.guenstig, au.anzahl)} = ${zt(p, 4)}`,
        frage: zw("Berechne jetzt die Wahrscheinlichkeit.", "Now compute the probability."),
        fehler: [{ wert: au.e.guenstig, text: zw("Das ist die Anzahl günstiger Fälle – noch durch alle Fälle teilen.", "That is the number of favourable cases – divide by all cases.") }],
        hinweise: [zw("P = günstige Fälle / mögliche Fälle", "P = favourable / possible cases")], erklaerung: `P = ${tausend(au.e.guenstig)} / ${tausend(au.anzahl)} = ${fr(au.e.guenstig, au.anzahl)} ≈ ${zt(p, 4)}.` });
    }
    return s;
  }, [au]);
  const liste = aufzaehlen(au.typ);
  return (
    <div style={{ ...karte, marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        <p style={kicker}>{zw("Zählmethode wählen", "Choose a counting method")}</p>
        <IchHaengeFest kontext={hilfeKontext({
          id: `zaehl-${au.id}`, aufgabe: "Kombinatorik Reihenfolge Zurücklegen Binomialkoeffizient Fakultät",
          verstehen: [zw("Zwei Fragen entscheiden alles: Kommt es auf die Reihenfolge an? Darf sich etwas wiederholen?", "Two questions decide everything: does order matter? May something repeat?"), zw("Verschiedene Ämter oder Plätze bedeuten Reihenfolge; eine Gruppe ohne Rollen bedeutet keine Reihenfolge.", "Different offices or places mean order; a group without roles means no order."), zw("Zähle bei Unsicherheit einen kleinen Fall von Hand.", "If unsure, count a small case by hand.")],
          ansatz: [zw("Welche der vier Situationen liegt vor?", "Which of the four situations applies?"), zw("Ordne zu: Reihenfolge ja/nein × Wiederholung ja/nein.", "Match: order yes/no × repetition yes/no."), zw("Dann n und k bestimmen und in die Formel einsetzen.", "Then determine n and k and plug into the formula.")],
          regel: [zw("Welche Formel gehört zu deiner Situation?", "Which formula belongs to your situation?"), "nᵏ · n!/(n − k)! · (n über k) · (n + k − 1 über k)", zw("Ohne Reihenfolge teilt man die geordneten Möglichkeiten durch k!, weil jede Gruppe k!-mal gezählt wurde.", "Without order divide the ordered count by k!, because each group was counted k! times.")],
          pruefen: [zw("Mit Reihenfolge muss mindestens so viel herauskommen wie ohne.", "With order you must get at least as many as without."), zw("Prüfe mit dem kleinen Fall (4 Elemente, k = 2).", "Check with the small case (4 elements, k = 2)."), zw("Eine Wahrscheinlichkeit liegt zwischen 0 und 1.", "A probability lies between 0 and 1.")],
          regeln: KOMB_REGELN,
        })} />
      </div>
      <p style={{ ...hinweis, color: C.tinte, marginBottom: 6 }}>{au.text}</p>
      <SchrittFolge schritte={schritte} stand={stand} setStand={setStand} fertigText={zw("Gezählt und – wo gefragt – die Wahrscheinlichkeit getrennt berechnet.", "Counted, and – where asked – the probability computed separately.")} />
      <Aufklapp titel={zw("Kleinen Fall aufzählen (4 Elemente, k = 2)", "List a small case (4 elements, k = 2)")} start={klein}>
        <p style={{ margin: "0 0 6px" }}>{zw(`Gleiche Situation (Reihenfolge ${t.reihenfolge ? "ja" : "nein"}, Wiederholung ${t.zurueck ? "ja" : "nein"}) mit A, B, C, D und k = 2:`, `Same situation (order ${t.reihenfolge ? "yes" : "no"}, repetition ${t.zurueck ? "yes" : "no"}) with A, B, C, D and k = 2:`)}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{liste.map((x) => <span key={x} style={{ background: C.himmel, color: C.see, borderRadius: 8, padding: "3px 8px", fontWeight: 700, fontSize: 13.5 }}>{x}</span>)}</div>
        <p style={{ margin: "8px 0 0" }}>{zw(`Das sind ${liste.length} Möglichkeiten – genau ${t.formel} mit n = 4, k = 2.`, `That is ${liste.length} possibilities – exactly ${t.formel} with n = 4, k = 2.`)}</p>
      </Aufklapp>
      <GrosserKnopf ghost onClick={neu}>{zw("Neue Aufgabe", "New problem")}</GrosserKnopf>
    </div>
  );
}

/* ---------- Modus 3: Baumdiagramm aufbauen ---------- */
const ZWEIGE = [["r", 0], ["b", 0], ["rr", 1], ["rb", 1], ["br", 1], ["bb", 1]];
function Baum({ werte, ok, pfade }) {
  const W = 340, H = 220;
  const pos = { "": [20, 110], r: [140, 55], b: [140, 165], rr: [270, 25], rb: [270, 85], br: [270, 135], bb: [270, 195] };
  const lbl = (k) => werte[k] || "?";
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 420, display: "block" }} role="img" aria-label={zw("Baumdiagramm", "Tree diagram")}>
      {ZWEIGE.map(([k]) => {
        const von = pos[k.slice(0, -1)], nach = pos[k];
        const mx = (von[0] + nach[0]) / 2, my = (von[1] + nach[1]) / 2;
        const f = ok[k] === true ? "#0F7A4D" : ok[k] === false ? C.gruenDunkel : C.grau;
        return (
          <g key={k}>
            <line x1={von[0] + 8} y1={von[1]} x2={nach[0] - 10} y2={nach[1]} stroke={f} strokeWidth="1.6" />
            <rect x={mx - 24} y={my - 11} width="48" height="20" rx="6" fill="#fff" stroke={f} strokeWidth="1" />
            <text x={mx} y={my + 4} fontSize="11.5" fontWeight="700" textAnchor="middle" fill={f}>{lbl(k)}</text>
          </g>
        );
      })}
      <circle cx={pos[""][0]} cy={pos[""][1]} r="5" fill={C.tinte} />
      {["r", "b", "rr", "rb", "br", "bb"].map((k) => (
        <g key={`n${k}`}>
          <circle cx={pos[k][0]} cy={pos[k][1]} r="9" fill={k.endsWith("r") ? ROT : BLAU} />
          {k.length === 2 && pfade && <text x={pos[k][0] + 14} y={pos[k][1] + 4} fontSize="11" fill={C.tinte} fontWeight="700">{pfade[k]}</text>}
        </g>
      ))}
    </svg>
  );
}

function baumAufgabe() {
  const r = zz(2, 5), b = zz(2, 5), mit = Math.random() < 0.4;
  const n = r + b;
  const w = mit
    ? { r: [r, n], b: [b, n], rr: [r, n], rb: [b, n], br: [r, n], bb: [b, n] }
    : { r: [r, n], b: [b, n], rr: [r - 1, n - 1], rb: [b, n - 1], br: [r, n - 1], bb: [b - 1, n - 1] };
  return { id: ++zaehler, r, b, n, mit, w };
}
function BaumAufbauen() {
  const [au, setAu] = useState(baumAufgabe);
  const [eing, setEing] = useState({});
  const [ok, setOk] = useState({});
  const [meld, setMeld] = useState(null);
  const [stand, setStand] = useState(0);
  const neu = () => { setAu(baumAufgabe()); setEing({}); setOk({}); setMeld(null); setStand(0); };
  const alleOk = ZWEIGE.every(([k]) => ok[k] === true);
  const wert = (k) => au.w[k][0] / au.w[k][1];
  const pruefen = () => {
    const o = {};
    ZWEIGE.forEach(([k]) => { const v = liesZahl(eing[k] || ""); o[k] = v !== null && Math.abs(v - wert(k)) < 5e-4; });
    setOk(o);
    const summe = (a, b) => { const x = liesZahl(eing[a] || ""), y = liesZahl(eing[b] || ""); return x !== null && y !== null && Math.abs(x + y - 1) < 5e-4; };
    const falsch = ZWEIGE.filter(([k]) => !o[k]).map(([k]) => k);
    if (!falsch.length) { setMeld({ art: "gut", text: zw("Alle Zweige stimmen. An jedem Knoten ergeben die Zweige zusammen 1.", "All branches are right. At every node the branches add up to 1.") }); return; }
    const knoten = [["r", "b", zw("am Start", "at the start")], ["rr", "rb", zw("nach „rot“", "after “red”")], ["br", "bb", zw("nach „blau“", "after “blue”")]].filter(([a, b]) => !summe(a, b)).map((x) => x[2]);
    const ohneFehler = !au.mit && ["rr", "bb"].some((k) => falsch.includes(k) && Math.abs((liesZahl(eing[k] || "") ?? -9) - au.w[k[0]][0] / au.n) < 5e-4);
    setMeld({ art: "schlecht", text: [
      knoten.length ? zw(`Die Zweige ${knoten.join(", ")} ergeben zusammen nicht 1.`, `The branches ${knoten.join(", ")} don't add up to 1.`) : "",
      ohneFehler ? zw("Ohne Zurücklegen: Beim zweiten Zug fehlt die erste Kugel – Zähler und Nenner ändern sich.", "Without replacement the first ball is missing on the second draw – numerator and denominator change.") : "",
      zw(`${falsch.length} Zweig(e) stimmen noch nicht (rot markiert).`, `${falsch.length} branch(es) are not right yet (marked red).`),
    ].filter(Boolean).join(" ") });
  };
  const pp = (k) => au.w[k[0]][0] * au.w[k][0] / (au.w[k[0]][1] * au.w[k][1]);
  const ppT = (k) => fr(au.w[k[0]][0] * au.w[k][0], au.w[k[0]][1] * au.w[k][1]);
  const pEine = pp("rb") + pp("br");
  const nenner = au.w.r[1] * au.w.rr[1];
  const schritte = useMemo(() => [
    { id: "pfad", titel: zw("Pfadregel", "Product rule"), typ: "zahl", text: zw("P(rot, blau) =", "P(red, blue) ="), wert: pp("rb"), toleranz: 0.0005, wertText: ppT("rb"),
      frage: zw("Wie wahrscheinlich ist erst rot, dann blau?", "How likely is red first, then blue?"),
      fehler: [{ wert: wert("r") + wert("rb"), text: zw("Entlang eines Pfades wird multipliziert.", "Multiply along a path.") }],
      hinweise: [zw("Zweig „rot“ mal Zweig „blau nach rot“.", "Branch “red” times branch “blue after red”.")], erklaerung: `${fr(...au.w.r)} · ${fr(...au.w.rb)} = ${ppT("rb")}.` },
    { id: "summe", titel: zw("Summenregel", "Sum rule"), typ: "zahl", text: zw("P(genau eine rote) =", "P(exactly one red) ="), wert: pEine, toleranz: 0.0005, wertText: `${fr(Math.round(pEine * nenner), nenner)} ≈ ${zt(pEine, 4)}`,
      frage: zw("Wie wahrscheinlich ist genau eine rote Kugel?", "How likely is exactly one red ball?"),
      fehler: [{ wert: pp("rb"), text: zw("Auch der Pfad „blau, rot“ gehört dazu.", "The path “blue, red” belongs to it as well.") }],
      hinweise: [zw("Zwei Pfade gehören dazu: (rot, blau) und (blau, rot). Addiere sie.", "Two paths belong to it: (red, blue) and (blue, red). Add them.")],
      erklaerung: `${ppT("rb")} + ${ppT("br")} = ${fr(Math.round(pEine * nenner), nenner)} ≈ ${zt(pEine, 4)}.` },
  ], [au]);
  const feld = (k, t) => (
    <label key={k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "4px 0", fontSize: 13.5, color: C.tinte }}>
      <span>{t}</span>
      <ZahlFeld wert={eing[k] || ""} setWert={(v) => { setEing({ ...eing, [k]: v }); setOk({ ...ok, [k]: undefined }); }} label={t} breite={86} farbe={ok[k] === false ? C.gruenDunkel : ok[k] ? "#0F7A4D" : C.see} />
    </label>
  );
  return (
    <div style={{ ...karte, marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        <p style={kicker}>{zw("Baumdiagramm aufbauen", "Build a tree diagram")}</p>
        <IchHaengeFest kontext={hilfeUrne(`baum-${au.id}`)} />
      </div>
      <p style={{ ...hinweis, color: C.tinte, marginBottom: 6 }}>
        {zw(`In einer Urne liegen ${au.r} rote und ${au.b} blaue Kugeln. Es werden zwei Kugeln nacheinander ${au.mit ? "mit" : "ohne"} Zurücklegen gezogen. Beschrifte alle Zweige.`,
          `An urn holds ${au.r} red and ${au.b} blue balls. Two balls are drawn one after the other ${au.mit ? "with" : "without"} replacement. Label all branches.`)}
      </p>
      <Baum werte={eing} ok={ok} pfade={alleOk ? { rr: ppT("rr"), rb: ppT("rb"), br: ppT("br"), bb: ppT("bb") } : null} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", columnGap: 18, marginTop: 6 }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: C.grau, margin: "4px 0" }}>{zw("1. Zug", "1st draw")}</p>
          {feld("r", zw("rot", "red"))}{feld("b", zw("blau", "blue"))}
        </div>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: C.grau, margin: "4px 0" }}>{zw("2. Zug", "2nd draw")}</p>
          {feld("rr", zw("rot nach rot", "red after red"))}{feld("rb", zw("blau nach rot", "blue after red"))}{feld("br", zw("rot nach blau", "red after blue"))}{feld("bb", zw("blau nach blau", "blue after blue"))}
        </div>
      </div>
      <GrosserKnopf onClick={pruefen}>{zw("Zweige prüfen", "Check branches")}</GrosserKnopf>
      {meld && <Rueck art={meld.art}>{meld.text}</Rueck>}
      {!alleOk && (
        <details style={{ marginTop: 6 }}>
          <summary style={{ fontSize: 13, color: C.see, fontWeight: 600, cursor: "pointer", padding: "6px 0" }}>{zw("Lösung der Zweige zeigen", "Show the branch solution")}</summary>
          <p style={{ fontSize: 13.5, color: C.tinte, lineHeight: 1.6 }}>
            {ZWEIGE.map(([k]) => `${k}: ${fr(...au.w[k])}`).join(" · ")}
          </p>
          <GrosserKnopf ghost onClick={() => { const e = {}; ZWEIGE.forEach(([k]) => { e[k] = fr(...au.w[k]); }); setEing(e); setOk(Object.fromEntries(ZWEIGE.map(([k]) => [k, true]))); setMeld(null); }}>{zw("Lösung eintragen", "Fill in the solution")}</GrosserKnopf>
        </details>
      )}
      {alleOk && <SchrittFolge schritte={schritte} stand={stand} setStand={setStand} fertigText={zw("Pfadregel und Summenregel sitzen.", "Product and sum rule done.")} />}
      <GrosserKnopf ghost onClick={neu}>{zw("Neue Aufgabe", "New problem")}</GrosserKnopf>
    </div>
  );
}

const MODI = [["versuche", zw("Versuche durchführen", "Run experiments")], ["zaehlen", zw("Zählmethode wählen", "Choose counting method")], ["baum", zw("Baum\u00ADdiagramm aufbauen", "Build tree diagram")]];
export function UrnenKombinatorik() {
  const [modus, setModus] = useState("versuche");
  return (
    <Seite titel={zw("Urnen und Kombinatorik", "Urns and combinatorics")}
      text={zw("Ziehen mit und ohne Zurücklegen, die passende Zählmethode finden und Baumdiagramme sicher beschriften.", "Drawing with and without replacement, finding the right counting method and labelling tree diagrams.")}>
      <ModusLeiste modi={MODI} modus={modus} setModus={setModus} label={zw("Kombinatorik-Übungen", "Combinatorics exercises")} />
      <Aufklapp titel={zw("Kurz erklärt", "In short")}>
        <p style={{ margin: "0 0 6px" }}>{zw("Mit Zurücklegen bleibt die Urne gleich, ohne Zurücklegen ändert sie sich nach jedem Zug – dann ändern sich auch die Wahrscheinlichkeiten.", "With replacement the urn stays the same; without replacement it changes after every draw – and so do the probabilities.")}</p>
        <p style={{ margin: "0 0 6px" }}>{zw("Zählen: Reihenfolge wichtig und Wiederholung erlaubt → nᵏ; Reihenfolge wichtig, keine Wiederholung → n!/(n − k)!; Reihenfolge egal, keine Wiederholung → (n über k).", "Counting: order matters, repetition allowed → nᵏ; order matters, no repetition → n!/(n − k)!; order irrelevant, no repetition → (n choose k).")}</p>
        <p style={{ margin: 0 }}>{zw("Beispiel: 3 Personen aus 10 für einen Ausschuss: (10 über 3) = 120. Drei verschiedene Ämter: 10 · 9 · 8 = 720 – sechsmal so viele, weil jede Dreiergruppe 3! = 6 Reihenfolgen hat.", "Example: 3 of 10 people for a committee: (10 choose 3) = 120. Three different offices: 10 · 9 · 8 = 720 – six times as many, because each group of three has 3! = 6 orders.")}</p>
      </Aufklapp>
      <div style={{ display: modus === "versuche" ? "block" : "none" }}><Versuche /></div>
      <div style={{ display: modus === "zaehlen" ? "block" : "none" }}><Zaehlen /></div>
      <div style={{ display: modus === "baum" ? "block" : "none" }}><BaumAufbauen /></div>
    </Seite>
  );
}
