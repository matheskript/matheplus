/* ============================================================
   Sinusfunktion – Zusätzlich üben
   f(x) = a · sin(b · (x − c)) + d
   · Parameter bestimmen: aus dem Graphen Mittellinie, Amplitude, Periode,
     b und Verschiebung ablesen (geführte Schritte)
   · Zielgraph treffen: a, b, c, d so eintippen, dass der eigene Graph
     auf dem Zielgraphen liegt – mit gezielter Rückmeldung, welcher
     Parameter noch nicht passt
   Alle Aufgaben haben glatte Werte; c wird in Vielfachen von π angegeben.
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useMemo, useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { Auswahl, GrosserKnopf, KleinerLink, Rueck, ZahlFeld, hinweis, karte, kicker, zw } from "./ui2.jsx";
import { FunktionsBild, SchrittFolge, liesZahl, zt } from "./ui3.jsx";
import { wahl } from "./rechnen2.js";
import { AufklappZeichen } from "./aufklappen.jsx";

const PI = Math.PI;
let zaehler = 0;
const zufallsSinus = () => {
  const a = wahl([1, 2, 3, -1, -2]);
  const b = wahl([1, 1, 2, 3, 0.5]);
  const p = 2 * PI / b;                                       // Periode
  const cPi = wahl([0, 0.5, 1, -0.5, 0.25].filter((k) => Math.abs(k * PI) < p));   // Verschiebung in π, innerhalb einer Periode
  return { id: ++zaehler, a, b, c: cPi * PI, cPi, d: wahl([-2, -1, 0, 1, 2]) };
};
const f = (s) => (x) => s.a * Math.sin(s.b * (x - s.c)) + s.d;
const pis = (v) => (v === 0 ? "0" : `${zt(v, 3)}π`);
const termTex = (s) => {
  const aT = s.a === 1 ? "" : s.a === -1 ? "-" : zt(s.a, 3);
  const inner = s.cPi === 0 ? (s.b === 1 ? "x" : `${zt(s.b, 3)}x`) : `${s.b === 1 ? "" : zt(s.b, 3)}\\left(x ${s.cPi < 0 ? "+" : "-"} ${zt(Math.abs(s.cPi), 3)}\\pi\\right)`;
  const dT = s.d === 0 ? "" : s.d > 0 ? ` + ${s.d}` : ` - ${-s.d}`;
  return `f(x) = ${aT}\\sin\\left(${inner}\\right)${dT}`.replace(/\./g, "{,}");
};
const bereich = (s) => { const p = 2 * PI / s.b; return [-0.5 * PI, Math.max(2 * PI, p * 1.7) - 0.2]; };
const kurve = (s, farbe, name, extra = {}) => ({ f: f(s), farbe, name, ...extra });
const Bild = ({ kurven, s, hoehe = 200 }) => {
  const [x0, x1] = bereich(s);
  return <FunktionsBild kurven={kurven} x0={x0} x1={x1} y0={Math.min(-3.5, s.d - Math.abs(s.a) - 0.7)} y1={Math.max(3.5, s.d + Math.abs(s.a) + 0.7)} hoehe={hoehe} einheitX={zw("x im Bogenmaß", "x in radians")} />;
};
const knopf = { minHeight: 52, padding: "8px 14px", borderRadius: 14, fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer", textAlign: "left", background: C.weiss, border: `1.5px solid ${C.linie}`, color: C.see };

/* ---------- Parameter bestimmen ---------- */
function ParameterBestimmen() {
  const [s, setS] = useState(zufallsSinus);
  const [stand, setStand] = useState(0);
  const neu = () => { setS(zufallsSinus()); setStand(0); };
  const p = 2 * PI / s.b;
  const c0 = ((s.c % p) + p) % p;
  const schritte = useMemo(() => {
    const falschTerme = [
      [termTex(s), "r"],
      [termTex({ ...s, b: s.b === 1 ? 2 : 1 / s.b }), "f1"],
      [termTex({ ...s, cPi: -s.cPi === s.cPi ? s.cPi + 0.5 : -s.cPi }), "f2"],
      [termTex({ ...s, a: -s.a }), "f3"],
    ];
    const seen = new Set(); const opt = [];
    falschTerme.forEach(([t, id]) => { if (!seen.has(t)) { seen.add(t); opt.push([id, t]); } });
    return [
      { id: "d", titel: zw("Mittellinie", "Midline"), typ: "zahl", text: "d =", wert: s.d, frage: zw("Der Graph pendelt um eine waagerechte Mittellinie. Auf welcher Höhe liegt sie?", "The graph oscillates around a horizontal midline. At what height is it?"),
        hinweise: [zw("Lies die höchste und die tiefste Höhe des Graphen ab.", "Read off the highest and lowest height of the graph."), zw("Die Mittellinie liegt genau in der Mitte: (Hoch + Tief) / 2.", "The midline is exactly halfway: (high + low) / 2.")],
        erklaerung: zw(`Hochwert ${s.d + Math.abs(s.a)}, Tiefwert ${s.d - Math.abs(s.a)} ⇒ d = ${s.d}.`, `High ${s.d + Math.abs(s.a)}, low ${s.d - Math.abs(s.a)} ⇒ d = ${s.d}.`) },
      { id: "a", titel: zw("Amplitude", "Amplitude"), typ: "zahl", text: "|a| =", wert: Math.abs(s.a), frage: zw("Wie weit geht der Graph von der Mittellinie nach oben (bzw. nach unten)?", "How far does the graph go above (or below) the midline?"),
        fehler: [{ wert: 2 * Math.abs(s.a), text: zw("Das ist der Abstand zwischen Hoch- und Tiefpunkt. Die Amplitude ist nur der halbe Abstand.", "That is the distance between high and low point. The amplitude is only half of it.") }, { wert: Math.abs(s.a) + s.d, text: zw("Die Amplitude misst man von der Mittellinie aus, nicht von der x-Achse.", "The amplitude is measured from the midline, not from the x-axis.") }],
        hinweise: [zw("Amplitude = Hochwert − Mittellinie.", "Amplitude = high value − midline.")], erklaerung: `|a| = ${s.d + Math.abs(s.a)} − ${s.d} = ${Math.abs(s.a)}.` },
      { id: "vz", titel: zw("Vorzeichen von a", "Sign of a"), typ: "wahl", frage: zw("Der Graph verläuft an der Stelle x = c durch die Mittellinie. Wie geht es dort weiter?", "At x = c the graph crosses the midline. How does it continue?"),
        optionen: [["pos", zw("nach oben (steigend) ⇒ a > 0", "upwards (rising) ⇒ a > 0")], ["neg", zw("nach unten (fallend) ⇒ a < 0", "downwards (falling) ⇒ a < 0")]], richtig: s.a > 0 ? "pos" : "neg",
        hinweise: [zw("Schau auf die Stelle direkt rechts von der Verschiebung c.", "Look right after the shift c.")],
        erklaerung: s.a > 0 ? zw("Der Sinus startet an der Mittellinie nach oben – also a > 0.", "The sine starts upwards at the midline – so a > 0.") : zw("Der Graph fällt dort zuerst – der Sinus ist an der Mittellinie gespiegelt, also a < 0.", "The graph falls first there – the sine is reflected, so a < 0.") },
      { id: "p", titel: zw("Periode", "Period"), typ: "zahl", text: "p =", einheit: "π", wert: p / PI, toleranz: 0.01, wertText: zt(p / PI, 3), frage: zw("Nach welcher Länge wiederholt sich der Graph? Gib die Periode in Vielfachen von π an (Bruch oder Dezimalzahl).", "After what length does the graph repeat? Give the period as a multiple of π (fraction or decimal)."),
        fehler: [{ wert: p, toleranz: 0.02, text: zw("Das ist die Periode als Zahl. Hier ist sie in Vielfachen von π gefragt, also durch π teilen.", "That is the period as a plain number. Here it is asked as a multiple of π, so divide by π.") }],
        hinweise: [zw("Messe den Abstand zwischen zwei gleichen Punkten, z. B. zwei Hochpunkten.", "Measure the distance between two equal points, e.g. two high points.")], erklaerung: zw(`Zwei Hochpunkte liegen ${zt(p / PI, 3)}π auseinander.`, `Two high points are ${zt(p / PI, 3)}π apart.`) },
      { id: "b", titel: "b", typ: "zahl", text: "b =", wert: s.b, toleranz: 0.005, frage: zw("Berechne b aus der Periode mit p = 2π / b.", "Compute b from the period with p = 2π / b."),
        fehler: [{ wert: p / PI, toleranz: 0.01, text: zw("Das ist die Periode in π. Umgestellt: b = 2π / p.", "That is the period in π. Rearranged: b = 2π / p.") }, { wert: 1 / s.b, toleranz: 0.005, text: zw("Der Kehrwert: je kürzer die Periode, desto größer b.", "That is the reciprocal: the shorter the period, the larger b.") }],
        hinweise: [zw("b = 2π / p", "b = 2π / p")], erklaerung: `b = 2π / ${pis(p / PI)} = ${zt(s.b, 3)}.` },
      { id: "c", titel: zw("Verschiebung", "Shift"), typ: "zahl", text: "c =", einheit: "π", wert: c0 / PI, toleranz: 0.01, wertText: zt(c0 / PI, 3),
        frage: zw(`Um wie viel ist der Graph nach rechts verschoben? Gib die kleinste Verschiebung c mit 0 ≤ c < p in Vielfachen von π an.`, `By how much is the graph shifted to the right? Give the smallest shift c with 0 ≤ c < p as a multiple of π.`),
        hinweise: [zw(`Suche eine Stelle, an der der Graph auf der Mittellinie ${s.a > 0 ? "steigend" : "fallend"} durchläuft.`, `Find a point where the graph crosses the midline ${s.a > 0 ? "rising" : "falling"}.`), zw("Das ist die Stelle, an der der normale Sinus bei x = 0 beginnt.", "That is where the ordinary sine begins at x = 0.")],
        erklaerung: zw(`Die Kurve läuft bei x = ${pis(c0 / PI)} ${s.a > 0 ? "steigend" : "fallend"} durch die Mittellinie ⇒ c = ${pis(c0 / PI)}.`, `The curve crosses the midline ${s.a > 0 ? "rising" : "falling"} at x = ${pis(c0 / PI)} ⇒ c = ${pis(c0 / PI)}.`) },
      { id: "term", titel: zw("Funktionsterm", "Function term"), typ: "wahl", frage: zw("Welcher Term gehört zum Graphen? (c kann bis auf ganze Perioden abweichen.)", "Which term belongs to the graph? (c may differ by whole periods.)"),
        optionen: opt.map(([id, t]) => [id, t]), richtig: "r", hinweise: [zw("Setze die Werte für a, b, c, d in f(x) = a · sin(b · (x − c)) + d ein.", "Insert a, b, c, d into f(x) = a · sin(b · (x − c)) + d.")], erklaerung: `f(x) = ${s.a === 1 ? "" : s.a === -1 ? "−" : zt(s.a, 3)}sin(${s.b === 1 ? "" : zt(s.b, 3) + "·"}(x ${s.cPi < 0 ? "+" : "−"} ${pis(Math.abs(s.cPi))}))${s.d === 0 ? "" : s.d > 0 ? ` + ${s.d}` : ` − ${-s.d}`}` },
    ];
  }, [s, c0, p]);
  const wahlFormen = schritte.find((x) => x.id === "term");
  void wahlFormen;
  return (
    <div style={{ ...karte, marginTop: 16 }}>
      <p style={kicker}>{zw("Parameter bestimmen", "Determine the parameters")}</p>
      <p style={hinweis}>{zw("Lies am Graphen ab und bestimme a, b, c und d in f(x) = a · sin(b · (x − c)) + d.", "Read off the graph and find a, b, c and d in f(x) = a · sin(b · (x − c)) + d.")}</p>
      <Bild kurven={[kurve(s, C.see, "f")]} s={s} />
      <SchrittFolge schritte={schritte.map((st) => (st.id === "term" ? { ...st, optionen: st.optionen.map(([id, t]) => [id, t]) } : st))} stand={stand} setStand={setStand}
        fertigText={zw("Geschafft: Alle vier Parameter bestimmt und den Term aufgestellt.", "Done: all four parameters found and the term set up.")} />
      {stand >= schritte.length && <div style={{ textAlign: "center", fontSize: 18, padding: "6px 0" }}><M t={termTex(s)} /></div>}
      <GrosserKnopf ghost onClick={neu}>{zw("Neue Aufgabe", "New problem")}</GrosserKnopf>
    </div>
  );
}

/* ---------- Zielgraph treffen ---------- */
function Zielgraph() {
  const [ziel, setZiel] = useState(zufallsSinus);
  const [v, setV] = useState({ a: "1", b: "1", c: "0", d: "0" });
  const [rueck, setRueck] = useState(null);
  const [hilfe, setHilfe] = useState(0);
  const setF = (k) => (x) => { setV((alt) => ({ ...alt, [k]: x })); setRueck(null); };
  const w = { a: liesZahl(v.a), b: liesZahl(v.b), c: liesZahl(v.c), d: liesZahl(v.d) };
  const gueltig = Object.values(w).every((x) => x !== null) && w.b !== 0;
  const eigen = gueltig ? { a: w.a, b: w.b, c: w.c * PI, cPi: w.c, d: w.d } : null;
  const neu = () => { setZiel(zufallsSinus()); setV({ a: "1", b: "1", c: "0", d: "0" }); setRueck(null); setHilfe(0); };
  const pruefen = () => {
    if (!eigen) { setRueck({ art: "warn", text: zw("Bitte vier Zahlen eingeben (b darf nicht 0 sein; Dezimalzahlen wie 0,5 oder Brüche wie 1/2 sind erlaubt).", "Please enter four numbers (b must not be 0; decimals like 0.5 or fractions like 1/2 are fine).") }); return; }
    const g = f(ziel), h = f(eigen);
    const gleich = Array.from({ length: 41 }, (_, i) => -2 * PI + (i * 8 * PI) / 40).every((x) => Math.abs(g(x) - h(x)) < 1e-6);
    if (gleich) { setRueck({ art: "gut", text: zw("Treffer: Dein Graph liegt genau auf dem Zielgraphen.", "Hit: your graph lies exactly on the target graph.") }); return; }
    const pa = 2 * PI / Math.abs(ziel.b), pe = 2 * PI / Math.abs(eigen.b);
    let text;
    if (eigen.d !== ziel.d) text = zw("Die Mittellinie passt noch nicht: Vergleiche die Höhe, um die beide Graphen pendeln (d).", "The midline does not match yet: compare the height both graphs oscillate around (d).");
    else if (Math.abs(Math.abs(eigen.a) - Math.abs(ziel.a)) > 1e-9) text = zw("Die Amplitude passt noch nicht: Vergleiche, wie weit beide Graphen von der Mittellinie abweichen (|a|).", "The amplitude does not match yet: compare how far both graphs deviate from the midline (|a|).");
    else if (Math.abs(pe - pa) > 1e-9) text = zw("Die Periode passt noch nicht: Vergleiche, wie oft sich der Graph auf gleicher Strecke wiederholt (b = 2π / p).", "The period does not match yet: compare how often the graph repeats over the same distance (b = 2π / p).");
    else text = zw("Mittellinie, Amplitude und Periode stimmen. Es fehlt noch die Verschiebung nach rechts (c) – oder das Vorzeichen von a.", "Midline, amplitude and period match. The shift to the right (c) – or the sign of a – is still missing.");
    setRueck({ art: "schlecht", text });
  };
  const hilfen = [
    zw("Beginne mit der Mittellinie d: In der Mitte zwischen Hoch- und Tiefpunkt des Zielgraphen.", "Start with the midline d: halfway between high and low point of the target graph."),
    zw("Dann |a| als Abstand von der Mittellinie zum Hochpunkt, danach die Periode und b = 2π / p.", "Then |a| as the distance from the midline to the high point, then the period and b = 2π / p."),
    zw("Zuletzt c: Suche, wo der Zielgraph auf der Mittellinie durchläuft (steigend bei a > 0) und teile durch π.", "Finally c: find where the target crosses the midline (rising if a > 0) and divide by π."),
  ];
  return (
    <div style={{ ...karte, marginTop: 16 }}>
      <p style={kicker}>{zw("Zielgraph treffen", "Hit the target graph")}</p>
      <p style={hinweis}>{zw("Der goldene Graph ist das Ziel. Tippe a, b, c und d so ein, dass dein blauer Graph genau darauf liegt. c gibst du in Vielfachen von π an.", "The gold graph is the target. Enter a, b, c and d so your blue graph lies exactly on it. Give c as a multiple of π.")}</p>
      <Bild s={ziel} kurven={[kurve(ziel, C.flaggold, zw("Ziel", "Target"), { breite: 3.4 }), ...(eigen ? [kurve(eigen, C.see, zw("dein Graph", "your graph"))] : [])]} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10, marginTop: 12 }}>
        {[["a", "a ="], ["b", "b ="], ["c", zw("c = (in π)", "c = (in π)")], ["d", "d ="]].map(([k, l]) => (
          <label key={k} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 700, color: C.tinte }}>
            <span style={{ minWidth: 62 }}>{l}</span>
            <ZahlFeld wert={v[k]} setWert={setF(k)} label={k} breite={86} onEnter={pruefen} />
          </label>
        ))}
      </div>
      <GrosserKnopf onClick={pruefen}>{zw("Prüfen", "Check")}</GrosserKnopf>
      {rueck && <Rueck art={rueck.art}>{rueck.text}</Rueck>}
      {hilfe > 0 && <Rueck art="info">{hilfen.slice(0, hilfe).map((h, i) => <span key={i} style={{ display: "block" }}>{i + 1}. {h}</span>)}</Rueck>}
      {hilfe < hilfen.length && <KleinerLink onClick={() => setHilfe(hilfe + 1)}>{zw("Hinweis zeigen", "Show a hint")}</KleinerLink>}
      {hilfe >= hilfen.length && rueck?.art !== "gut" && <KleinerLink onClick={() => { setHilfe(hilfen.length); setRueck({ art: "info", text: `${zw("Lösung", "Solution")}: a = ${zt(ziel.a, 3)}, b = ${zt(ziel.b, 3)}, c = ${pis(ziel.cPi)}, d = ${zt(ziel.d, 3)}` }); }}>{zw("Lösung zeigen", "Show solution")}</KleinerLink>}
      <GrosserKnopf ghost onClick={neu}>{zw("Neues Ziel", "New target")}</GrosserKnopf>
    </div>
  );
}

/* ---------- Einklappbarer Abschnitt unter dem Sinus-Titel ---------- */
const MODI = [["bestimmen", "Parameter bestimmen", "Determine parameters"], ["ziel", "Zielgraph treffen", "Hit the target graph"]];
export function SinusUebungen() {
  const [auf, setAuf] = useState(false);
  const [modus, setModus] = useState(null);
  return (
    <div className="mx-auto px-6" style={{ maxWidth: 620, paddingTop: 18 }}>
      <button type="button" aria-expanded={auf} onClick={() => setAuf(!auf)}
        style={{ width: "100%", minHeight: 48, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 16px", borderRadius: 14, cursor: "pointer", fontFamily: "inherit", background: C.weiss, border: `1.5px solid ${C.linie}`, fontSize: 15, fontWeight: 700, color: C.see }}>
        <span>{zw("Zusätzlich üben", "Practise more")}</span><AufklappZeichen auf={auf} />
      </button>
      {auf && (
        <div data-aufklapp-inhalt style={{ marginTop: 8 }}>
          <Auswahl optionen={MODI.map(([id, de, en]) => [id, zw(de, en)])} wert={modus} setWert={setModus} label={zw("Sinus-Übungen", "Sine exercises")} />
          {modus === "bestimmen" && <ParameterBestimmen />}
          {modus === "ziel" && <Zielgraph />}
          {modus && <KleinerLink onClick={() => setModus(null)}>{zw("← Zurück zu den Übungen", "← Back to the exercises")}</KleinerLink>}
        </div>
      )}
    </div>
  );
}
void knopf;
