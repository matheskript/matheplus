/* ======================================================================
   ENTDECKE DIE ABLEITUNG ALS GRENZWERT – VON DER SEKANTE ZUR TANGENTE
   Fünfphasiges Lernmodul in „Mathe entdecken“ (Kennung „grenzwert“):
     1 Die Sekantensteigung – zwei Punkte auf f(x) = x²
     2 h wird kleiner – eine Tabelle zeigt, wohin es geht
     3 Rechnen statt Raten – (1 + h)² ausmultiplizieren, h kürzen
     4 An jeder Stelle x – f′(x) = 2x
     5 Weiter mit x³ – das Pascalsche Dreieck liefert 3x²
   Die Grafik zeigt Sekante (blau) und Tangente (gold gestrichelt);
   mit dem Regler für h wandert Q auf P zu.
   ====================================================================== */
import React, { useMemo, useState } from "react";
import { C } from "./base1.jsx";
import { zt } from "./ui3.jsx";
import { Aufforderung, BildKarte, EntdeckenModul, Regler, T } from "./funcEntdeckenModul.jsx";

const ID = "grenzwert";
const svgStil = { width: "100%", maxWidth: 340, display: "block", margin: "0 auto" };
const txt = { fontFamily: "Montserrat, system-ui, sans-serif", fontWeight: 700 };
const opt = (liste) => liste.map(([id, s]) => [id, <T key={id} s={s} />]);
const zk = (v, st = 4) => zt(v, st);

/* Graph von f mit Sekante durch P(x0|f(x0)) und Q(x0+h|f(x0+h)) */
function SekanteBild({ f, fs, name, x0Start = 1, mitX0 = false, hStart = 1, x1 = 3.2, y1 = 9.5 }) {
  const [h, setH] = useState(hStart);
  const [x0, setX0] = useState(x0Start);
  const W = 340, H = 240, L = 30, R = 10, O = 12, U = 24;
  const xa = -1, ya = -1;
  const X = (x) => L + ((x - xa) / (x1 - xa)) * (W - L - R);
  const Y = (y) => O + ((y1 - y) / (y1 - ya)) * (H - O - U);
  const pfad = [];
  for (let i = 0; i <= 120; i++) { const x = xa + (i / 120) * (x1 - xa); const y = f(x); if (y >= ya - 1 && y <= y1 + 1) pfad.push(`${pfad.length ? "L" : "M"}${X(x).toFixed(1)} ${Y(Math.max(ya - 1, Math.min(y1 + 1, y))).toFixed(1)}`); }
  const xq = x0 + h, P = [x0, f(x0)], Q = [xq, f(xq)];
  const m = (Q[1] - P[1]) / h, mt = fs(x0);
  const gerade = (mm, farbe, strich) => <line x1={X(xa)} y1={Y(P[1] + mm * (xa - x0))} x2={X(x1)} y2={Y(P[1] + mm * (x1 - x0))} stroke={farbe} strokeWidth="2" strokeDasharray={strich} />;
  return (
    <BildKarte>
      <Aufforderung>Zieh h kleiner: Q rückt an P heran, die blaue Sekante dreht sich zur goldenen Tangente.</Aufforderung>
      <svg viewBox={`0 0 ${W} ${H}`} style={svgStil} role="img" aria-label={`Graph von ${name} mit Sekante durch P und Q`}>
        <defs><clipPath id="gw-clip"><rect x={L} y={O} width={W - L - R} height={H - O - U} /></clipPath></defs>
        <line x1={X(xa)} y1={Y(0)} x2={X(x1)} y2={Y(0)} stroke={C.hellgrau} />
        <line x1={X(0)} y1={Y(ya)} x2={X(0)} y2={Y(y1)} stroke={C.hellgrau} />
        {[1, 2, 3].filter((v) => v <= x1).map((v) => <text key={v} x={X(v)} y={Y(0) + 14} textAnchor="middle" style={{ fontSize: 10, fill: C.grau }}>{v}</text>)}
        <g clipPath="url(#gw-clip)">
          <path d={pfad.join(" ")} fill="none" stroke={C.tinte} strokeWidth="2.2" />
          {gerade(mt, C.flaggold, "6 5")}
          {gerade(m, C.see)}
          <line x1={X(P[0])} y1={Y(P[1])} x2={X(Q[0])} y2={Y(P[1])} stroke={C.smaragd} strokeWidth="1.6" />
          <line x1={X(Q[0])} y1={Y(P[1])} x2={X(Q[0])} y2={Y(Q[1])} stroke={C.smaragd} strokeWidth="1.6" />
        </g>
        <circle cx={X(P[0])} cy={Y(P[1])} r="4.5" fill={C.tinte} />
        <circle cx={X(Q[0])} cy={Y(Q[1])} r="4.5" fill={C.see} />
        <text x={X(P[0]) - 8} y={Y(P[1]) - 8} textAnchor="end" style={{ ...txt, fontSize: 13, fill: C.tinte }}>P</text>
        {h > 0.15 && <text x={X(Q[0]) + 8} y={Y(Q[1]) + 4} style={{ ...txt, fontSize: 13, fill: C.see }}>Q</text>}
        {h > 0.3 && <text x={(X(P[0]) + X(Q[0])) / 2} y={Y(P[1]) + 14} textAnchor="middle" style={{ ...txt, fontSize: 11, fill: C.smaragd }}>h</text>}
      </svg>
      <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
        {mitX0 && <Regler name="x" wert={x0} setWert={setX0} min={-0.5} max={2} schritt={0.5} farbe={C.tinte} />}
        <Regler name="h" wert={h} setWert={setH} min={0.01} max={2} schritt={0.01} format={(v) => zk(v, 2)} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginTop: 10, fontSize: 14, fontWeight: 700 }}>
        <span style={{ color: C.see }}>Sekante: m = {zk(m, 4)}</span>
        <span style={{ color: "#9A7400" }}>Tangente: m = {zk(mt, 4)}</span>
      </div>
    </BildKarte>
  );
}

function Tabelle() {
  const hs = [1, 0.1, 0.01, 0.001];
  const zelle = { padding: "7px 8px", borderBottom: `1px solid ${C.linie}`, textAlign: "center", fontSize: 14.5, fontVariantNumeric: "tabular-nums" };
  return (
    <BildKarte>
      <Aufforderung>Sekantensteigung bei P(1 | 1) für immer kleinere h – zwei Zeilen fehlen noch, die rechnest du gleich selbst.</Aufforderung>
      <table style={{ borderCollapse: "collapse", width: "100%", color: C.tinte }}>
        <thead><tr><th style={{ ...zelle, color: C.grau, fontSize: 12.5 }}>h</th><th style={{ ...zelle, color: C.grau, fontSize: 12.5 }}>f(1 + h)</th><th style={{ ...zelle, color: C.grau, fontSize: 12.5 }}>Steigung</th></tr></thead>
        <tbody>
          {hs.map((h, i) => (
            <tr key={h}><td style={zelle}>{zk(h, 3)}</td><td style={zelle}>{i === 1 || i === 2 ? "?" : zk((1 + h) ** 2, 6)}</td><td style={{ ...zelle, fontWeight: 800, color: C.see }}>{i === 1 || i === 2 ? "?" : zk(2 + h, 4)}</td></tr>
          ))}
        </tbody>
      </table>
    </BildKarte>
  );
}

function bauePhasen(r) {
  const sq = (x) => x * x;
  return [
    {
      titel: "Die Sekantensteigung",
      intro: "Wie steil ist die Parabel $f(x) = x^2$ genau im Punkt $P(1 \\mid 1)$? Eine Steigung braucht eigentlich zwei Punkte. Also nehmen wir einen zweiten Punkt Q dazu – im Abstand $h$.",
      bild: <SekanteBild f={sq} fs={(x) => 2 * x} name="f(x) = x²" hStart={1} />,
      fertig: "Geschafft: Die Steigung zwischen P und Q ist der Differenzenquotient. Er hängt noch von h ab.",
      schritte: [
        { id: "g1a", titel: "h = 1", typ: "zahl", frage: <T s="Für $h = 1$ ist $Q(2 \mid 4)$. Wie groß ist die Steigung $\frac{4 − 1}{2 − 1}$?" />, text: "m =", wert: 3, breite: 96,
          fehler: [{ wert: 4, text: "4 ist der y-Wert von Q. Gesucht ist Höhenunterschied durch Breite." }, { wert: 1 / 3, toleranz: 0.01, text: "Kehrwert: oben steht der y-Unterschied." }],
          hinweise: ["Höhenunterschied 4 − 1, Breite 2 − 1."], erklaerung: <T s="$m = \frac{3}{1} = 3$" /> },
        { id: "g1b", titel: "h = 0,5", typ: "zahl", frage: <T s="Für $h = 0{,}5$ ist $Q(1{,}5 \mid 2{,}25)$. Berechne die Steigung." />, text: "m =", wert: 2.5, breite: 96,
          fehler: [{ wert: 1.25, text: "Das ist nur der Höhenunterschied. Noch durch h = 0,5 teilen." }],
          hinweise: [<T key="h" s="$\frac{2{,}25 − 1}{0{,}5}$" />], erklaerung: <T s="$\frac{1{,}25}{0{,}5} = 2{,}5$" /> },
        { id: "g1c", titel: "Allgemein", typ: "wahl", frage: "Welcher Term gibt die Steigung der Sekante für beliebiges h an?", richtig: "r",
          optionen: opt([["r", "$\\frac{f(1 + h) − f(1)}{h}$"], ["f", "$\\frac{f(1 + h)}{h}$"], ["g", "$f(1 + h) − f(1)$"]]),
          fehler: [{ wahl: "f", text: "Es fehlt der Startwert f(1): Gesucht ist der Höhenunterschied." }, { wahl: "g", text: "Das ist nur der Höhenunterschied – noch durch die Breite h teilen." }],
          hinweise: ["Steigung = Höhenunterschied : Breite."], erklaerung: <T s="Differenzenquotient: $\frac{f(1 + h) − f(1)}{h}$" /> },
      ],
    },
    {
      titel: "h wird kleiner",
      intro: "Die Tangente berührt in P – dafür müsste Q genau auf P liegen, also $h = 0$. Das geht nicht direkt. Aber wir können h immer kleiner machen und beobachten.",
      bild: <Tabelle />,
      fertig: "Geschafft: Die Steigungen nähern sich 2. Diese Zahl ist die Steigung der Tangente – die Ableitung f′(1).",
      schritte: [
        { id: "g2a", titel: "h = 0,1", typ: "zahl", frage: <T s="Berechne $\frac{1{,}1^2 − 1}{0{,}1}$." />, text: "m =", wert: 2.1, toleranz: 1e-6, breite: 96,
          fehler: [{ wert: 0.21, toleranz: 1e-6, text: "Das ist der Zähler 1,21 − 1. Noch durch 0,1 teilen." }],
          hinweise: ["1,1² = 1,21"], erklaerung: <T s="$\frac{0{,}21}{0{,}1} = 2{,}1$" /> },
        { id: "g2b", titel: "h = 0,01", typ: "zahl", frage: <T s="Und $\frac{1{,}01^2 − 1}{0{,}01}$?" />, text: "m =", wert: 2.01, toleranz: 1e-6, breite: 96,
          hinweise: ["1,01² = 1,0201"], erklaerung: <T s="$\frac{0{,}0201}{0{,}01} = 2{,}01$" /> },
        { id: "g2c", titel: "Wohin geht es?", typ: "zahl", frage: "3 · 2,1 · 2,01 · 2,001 … Welchem Wert nähern sich die Steigungen?", text: "Grenzwert:", wert: 2, breite: 96,
          fehler: [{ wert: 0, text: "h geht gegen 0, die Steigung nicht. Schau auf die Tabelle." }],
          hinweise: ["Die Nachkommastellen nach der 2 werden immer kleiner."], erklaerung: "Die Steigungen nähern sich 2." },
        { id: "g2d", titel: "Warum nicht h = 0?", typ: "wahl", frage: "Warum setzt man nicht einfach h = 0 ein?", richtig: "r",
          optionen: opt([["r", "Dann stünde $\\frac{0}{0}$ da – das ist nicht definiert."], ["f", "Dann käme 0 heraus."], ["g", "Weil h immer 1 sein muss."]]),
          fehler: [{ wahl: "f", text: "Auch der Nenner wäre 0 – man darf gar nicht teilen." }, { wahl: "g", text: "h darf jede Zahl außer 0 sein." }],
          hinweise: ["Was steht im Zähler und im Nenner, wenn Q = P ist?"], erklaerung: "Bei h = 0 steht 0 : 0 da. Deshalb der Grenzwert: h kommt beliebig nah an 0, ist aber nie 0." },
      ],
    },
    {
      titel: "Rechnen statt Raten",
      intro: "Die Tabelle legt 2 nahe – aber ist das sicher? Mit der binomischen Formel wird es exakt: Wir vereinfachen den Differenzenquotienten, bevor h klein wird.",
      bild: null,
      fertig: "Geschafft: Der Differenzenquotient ist genau 2 + h. Für h → 0 bleibt exakt 2 – nicht nur ungefähr.",
      schritte: [
        { id: "g3a", titel: "Ausmultiplizieren", typ: "wahl", frage: <T s="$(1 + h)^2 = \ ?$" />, richtig: "r",
          optionen: opt([["f", "$1 + h^2$"], ["r", "$1 + 2h + h^2$"], ["g", "$1 + h + h^2$"]]),
          fehler: [{ wahl: "f", text: "Erste binomische Formel: Das mittlere Glied 2 · 1 · h fehlt." }, { wahl: "g", text: "Das mittlere Glied ist 2ab = 2h." }],
          hinweise: ["(a + b)² = a² + 2ab + b² mit a = 1, b = h"], erklaerung: <T s="$(1+h)^2 = 1 + 2h + h^2$" /> },
        { id: "g3b", titel: "Zähler", typ: "wahl", frage: <T s="Was bleibt im Zähler $(1 + h)^2 − 1$?" />, richtig: "r",
          optionen: opt([["r", "$2h + h^2$"], ["f", "$h^2$"], ["g", "$1 + 2h$"]]),
          fehler: [{ wahl: "f", text: "Das 2h bleibt stehen." }, { wahl: "g", text: "Die 1 hebt sich mit −1 weg." }],
          hinweise: ["1 − 1 = 0"], erklaerung: <T s="$1 + 2h + h^2 − 1 = 2h + h^2$" /> },
        { id: "g3c", titel: "h kürzen", typ: "wahl", frage: <T s="$\frac{2h + h^2}{h} = \ ?$ (für $h \neq 0$)" />, richtig: "r",
          optionen: opt([["r", "$2 + h$"], ["f", "$2 + h^2$"], ["g", "$2h$"]]),
          fehler: [{ wahl: "f", text: "Jeder Summand wird durch h geteilt: h² : h = h." }, { wahl: "g", text: "2h : h = 2, nicht 2h." }],
          hinweise: ["h ausklammern: h · (2 + h)"], erklaerung: <T s="$\frac{h(2 + h)}{h} = 2 + h$" /> },
        { id: "g3d", titel: "Grenzwert", typ: "zahl", frage: <T s="$\lim_{h \to 0} (2 + h) = \ ?$ Jetzt darfst du h = 0 einsetzen – es steht nichts mehr im Nenner." />, text: "f′(1) =", wert: 2, breite: 96,
          hinweise: ["2 + 0"], erklaerung: <T s="$f'(1) = 2$" /> },
      ],
    },
    {
      titel: "An jeder Stelle x",
      intro: "Dasselbe funktioniert an jeder Stelle. Statt 1 schreiben wir $x$ – und erhalten auf einen Schlag die Steigung überall.",
      bild: <SekanteBild f={(x) => x * x} fs={(x) => 2 * x} name="f(x) = x²" mitX0 hStart={0.8} />,
      fertig: "Geschafft: Für f(x) = x² gilt f′(x) = 2x – an jeder Stelle. Probier es oben mit dem x-Regler aus.",
      schritte: [
        { id: "g4a", titel: "Zähler", typ: "wahl", frage: <T s="$(x + h)^2 − x^2 = \ ?$" />, richtig: "r",
          optionen: opt([["r", "$2xh + h^2$"], ["f", "$h^2$"], ["g", "$2x + h^2$"]]),
          fehler: [{ wahl: "f", text: "Das mittlere Glied 2xh fehlt." }, { wahl: "g", text: "Das mittlere Glied ist 2 · x · h." }],
          hinweise: ["(x + h)² = x² + 2xh + h²"], erklaerung: <T s="$x^2 + 2xh + h^2 − x^2 = 2xh + h^2$" /> },
        { id: "g4b", titel: "Ableitung", typ: "wahl", frage: <T s="$f'(x) = \lim_{h \to 0} \frac{2xh + h^2}{h} = \ ?$" />, richtig: "r",
          optionen: opt([["r", "$2x$"], ["f", "$x^2$"], ["g", "$2x + 1$"]]),
          fehler: [{ wahl: "f", text: "Das ist f selbst, nicht die Steigung." }, { wahl: "g", text: "Kürzen ergibt 2x + h, und h → 0." }],
          hinweise: ["Erst kürzen: 2x + h"], erklaerung: <T s="$f'(x) = 2x$" /> },
        { id: "g4c", titel: "Probe", typ: "zahl", frage: <T s={`Wie steil ist die Parabel an der Stelle $x = ${r.x}$?`} />, text: `f′(${r.x}) =`, wert: 2 * r.x, breite: 96,
          fehler: [{ wert: r.x * r.x, text: "Das ist f(x), der y-Wert. Die Steigung ist f′(x) = 2x." }],
          hinweise: ["f′(x) = 2x"], erklaerung: `f′(${r.x}) = 2 · ${r.x} = ${2 * r.x}` },
      ],
    },
    {
      titel: "Weiter mit x³",
      intro: "Für $f(x) = x^3$ brauchst du $(x + h)^3$. Die Zahlen 1, 3, 3, 1 aus dem Pascalschen Dreieck liefern die Koeffizienten.",
      bild: <SekanteBild f={(x) => x * x * x} fs={(x) => 3 * x * x} name="f(x) = x³" x0Start={1} hStart={0.8} x1={2.4} y1={10} />,
      fertig: "Geschafft: f(x) = x³ hat die Ableitung f′(x) = 3x². Das Muster dahinter ist die Potenzregel: f(x) = xⁿ ⇒ f′(x) = n · xⁿ⁻¹.",
      abschluss: <p style={{ fontSize: 14, color: C.tinte, lineHeight: 1.65, margin: 0 }}>Die vollständige Herleitung der Potenzregel für jedes n findest du im Lernangebot <b>Pascalsches Dreieck</b>.</p>,
      schritte: [
        { id: "g5a", titel: "Ausmultiplizieren", typ: "wahl", frage: <T s="$(x + h)^3 = \ ?$" />, richtig: "r",
          optionen: opt([["r", "$x^3 + 3x^2h + 3xh^2 + h^3$"], ["f", "$x^3 + h^3$"], ["g", "$x^3 + 3xh + h^3$"]]),
          fehler: [{ wahl: "f", text: "Die gemischten Glieder fehlen. Pascal: 1, 3, 3, 1." }, { wahl: "g", text: "Es gibt zwei gemischte Glieder: 3x²h und 3xh²." }],
          hinweise: ["Koeffizienten 1, 3, 3, 1; die Potenzen von x fallen, die von h steigen."], erklaerung: <T s="$x^3 + 3x^2h + 3xh^2 + h^3$" /> },
        { id: "g5b", titel: "Differenzenquotient", typ: "wahl", frage: <T s="$\frac{(x + h)^3 − x^3}{h} = \ ?$" />, richtig: "r",
          optionen: opt([["r", "$3x^2 + 3xh + h^2$"], ["f", "$3x^2h + 3xh^2 + h^3$"], ["g", "$3x^2 + 3x + 1$"]]),
          fehler: [{ wahl: "f", text: "Das ist nur der Zähler – noch durch h teilen." }, { wahl: "g", text: "Durch h teilen heißt: jede Potenz von h sinkt um eins, nicht h wird zu 1." }],
          hinweise: ["x³ hebt sich weg, dann jeden Summanden durch h teilen."], erklaerung: <T s="$3x^2 + 3xh + h^2$" /> },
        { id: "g5c", titel: "Grenzwert", typ: "wahl", frage: <T s="$f'(x) = \lim_{h \to 0} (3x^2 + 3xh + h^2) = \ ?$" />, richtig: "r",
          optionen: opt([["r", "$3x^2$"], ["f", "$3x^2 + 3x$"], ["g", "$x^3$"]]),
          fehler: [{ wahl: "f", text: "3xh geht mit h gegen 0." }, { wahl: "g", text: "Das ist f selbst." }],
          hinweise: ["Alle Glieder mit h verschwinden."], erklaerung: <T s="$f'(x) = 3x^2$" /> },
        { id: "g5d", titel: "Probe", typ: "zahl", frage: <T s={`Wie steil ist $f(x) = x^3$ an der Stelle $x = ${r.k}$?`} />, text: `f′(${r.k}) =`, wert: 3 * r.k * r.k, breite: 96,
          fehler: [{ wert: r.k ** 3, text: "Das ist f(x). Gesucht ist f′(x) = 3x²." }, { wert: 3 * r.k, text: "3x² – das x wird quadriert." }],
          hinweise: ["f′(x) = 3x²"], erklaerung: `f′(${r.k}) = 3 · ${r.k}² = ${3 * r.k * r.k}` },
      ],
    },
  ];
}

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export function GrenzwertModul({ onZurueck }) {
  const r = useMemo(() => ({ x: pick([3, 4, 5, -2, -3]), k: pick([2, 4, 5, -2]) }), []);
  const phasen = useMemo(() => bauePhasen(r), [r]);
  return (
    <EntdeckenModul id={ID} phasen={phasen} onZurueck={onZurueck}
      titel="Entdecke die Ableitung als Grenzwert – von der Sekante zur Tangente"
      untertitel="Fünf Phasen: Du lässt einen Punkt auf einen anderen zulaufen und siehst, wie aus einer Durchschnittssteigung die Steigung in einem Punkt wird."
      abschlussTitel="Du hast die Ableitung selbst hergeleitet."
      abschlussText="Aus dem Differenzenquotienten wird mit h → 0 der Differentialquotient – die Steigung der Tangente."
      abschlussFormel={["f'(x) = \\lim_{h \\to 0} \\frac{f(x + h) − f(x)}{h}", "(x^2)' = 2x \\qquad (x^3)' = 3x^2"]} />
  );
}
export const GRENZWERT_PHASEN = ["Sekantensteigung", "h wird kleiner", "Rechnen statt Raten", "An jeder Stelle x", "Weiter mit x³"];
