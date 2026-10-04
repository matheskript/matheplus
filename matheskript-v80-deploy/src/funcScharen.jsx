/* ============================================================
   Analysis: Funktionsscharen
   · Parameter entdecken – Regler für a, Nullstellen, Extrem- und
     Wendepunkte wandern mit; Ortskurve; allgemeine Formeln daneben
   · Besondere Punkte – f′ₐ, notwendige und hinreichende Bedingung,
     Existenzbedingungen für a, Koordinaten, Ortskurve
   · Parameterfälle – Bedingungen nach a auflösen, Sonderfälle
     (a = 0, Nennerbedingungen, Sattelpunkt statt Extremum)
   Drei Scharen: fₐ(x) = x³ − 3ax, fₐ(x) = ax² − 4x, fₐ(x) = x · e^(−ax).
   Der Parameter a wird in Formeln farbig von x unterschieden.
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useMemo, useState } from "react";
import { C } from "./base1.jsx";
import { IchHaengeFest } from "./funcHilfe.jsx";
import { Auswahl, GrosserKnopf, hilfeKontext, hinweis, karte, kicker, zw } from "./ui2.jsx";
import { wahl } from "./rechnen2.js";
import { Aufklapp, FunktionsBild, ModusLeiste, Seite, SchrittFolge, zt } from "./ui3.jsx";

let zaehler = 0;
const PARAM = C.gruen;   // Farbe des Parameters a
const E = Math.E;
const DE = zw(true, false);   // im Englischen wäre der Artikel „a“ sonst farbig

/* Formeltext: das Parameterzeichen a farbig hervorheben */
export function PT({ t, style }) {
  const teile = String(t).split(/(?<![A-Za-zÄÖÜäöüß])(a)(?![A-Za-zÄÖÜäöüß])/);
  return <span style={style}>{teile.map((s, i) => (s === "a" ? <b key={i} style={{ color: PARAM, fontStyle: "italic" }}>a</b> : <span key={i}>{s}</span>))}</span>;
}

/* ---------- Scharen ---------- */
const SCHAREN = {
  kubisch: {
    name: "fₐ(x) = x³ − 3a·x", f: (a) => (x) => x ** 3 - 3 * a * x,
    ableitung: "f′ₐ(x) = 3x² − 3a", zweite: "f″ₐ(x) = 6x",
    punkte: (a) => {
      const p = [{ art: "N", x: 0, y: 0 }];
      if (a > 0) { const w = Math.sqrt(3 * a); p.push({ art: "N", x: -w, y: 0 }, { art: "N", x: w, y: 0 }); const s = Math.sqrt(a); p.push({ art: "H", x: -s, y: 2 * a * s }, { art: "T", x: s, y: -2 * a * s }); }
      p.push({ art: "W", x: 0, y: 0 });
      return p;
    },
    formeln: [
      [zw("Nullstellen", "Zeros"), "x = 0;  für a > 0 zusätzlich x = ±√(3a)"],
      [zw("Extrempunkte", "Extrema"), "für a > 0: H(−√a | 2a√a), T(√a | −2a√a)"],
      [zw("Wendepunkt", "Inflection point"), "W(0 | 0) für alle a"],
      [zw("Ortskurve der Extrempunkte", "Locus of the extrema"), "y = −2x³"],
    ],
    faelle: (a) => (a > 0 ? zw("a > 0: drei Nullstellen, Hoch- und Tiefpunkt.", "a > 0: three zeros, maximum and minimum.") : a === 0 ? zw("a = 0: f₀(x) = x³ – f′₀(0) = 0, aber kein Vorzeichenwechsel: Sattelpunkt, kein Extremum.", "a = 0: f₀(x) = x³ – f′₀(0) = 0 but no sign change: saddle point, no extremum.") : zw("a < 0: f′ₐ(x) = 3x² − 3a > 0 – streng monoton steigend, keine Extrema, eine Nullstelle.", "a < 0: f′ₐ(x) = 3x² − 3a > 0 – strictly increasing, no extrema, one zero.")),
    orts: (x) => -2 * x ** 3, ortsName: "y = −2x³", bereich: [-3, 3, -6, 6],
  },
  parabel: {
    name: "fₐ(x) = a·x² − 4x", f: (a) => (x) => a * x * x - 4 * x,
    ableitung: "f′ₐ(x) = 2a·x − 4", zweite: "f″ₐ(x) = 2a",
    punkte: (a) => {
      const p = [{ art: "N", x: 0, y: 0 }];
      if (a !== 0) { p.push({ art: "N", x: 4 / a, y: 0 }); p.push({ art: a > 0 ? "T" : "H", x: 2 / a, y: -4 / a }); }
      return p;
    },
    formeln: [
      [zw("Nullstellen", "Zeros"), "x = 0 und x = 4/a  (a ≠ 0)"],
      [zw("Scheitelpunkt", "Vertex"), "S(2/a | −4/a)  (a ≠ 0)"],
      [zw("Art", "Type"), zw("a > 0: Tiefpunkt, a < 0: Hochpunkt", "a > 0: minimum, a < 0: maximum")],
      [zw("Ortskurve der Scheitel", "Locus of the vertices"), "y = −2x"],
    ],
    faelle: (a) => (a === 0 ? zw("a = 0: f₀(x) = −4x ist eine Gerade – keine Parabel, kein Scheitel, nur die Nullstelle x = 0. Die Formel 2/a ist hier nicht definiert.", "a = 0: f₀(x) = −4x is a line – no parabola, no vertex, only the zero x = 0. The formula 2/a is undefined here.")
      : a > 0 ? zw("a > 0: nach oben geöffnet, Tiefpunkt.", "a > 0: opens upward, minimum.") : zw("a < 0: nach unten geöffnet, Hochpunkt.", "a < 0: opens downward, maximum.")),
    orts: (x) => -2 * x, ortsName: "y = −2x", bereich: [-4, 4, -8, 8],
  },
  exp: {
    name: "fₐ(x) = x · e^(−a·x)", f: (a) => (x) => x * Math.exp(-a * x),
    ableitung: "f′ₐ(x) = (1 − a·x) · e^(−a·x)", zweite: "f″ₐ(x) = (a²x − 2a) · e^(−a·x)",
    punkte: (a) => {
      const p = [{ art: "N", x: 0, y: 0 }];
      if (a !== 0) { p.push({ art: a > 0 ? "H" : "T", x: 1 / a, y: 1 / (a * E) }); p.push({ art: "W", x: 2 / a, y: (2 / a) * Math.exp(-2) }); }
      return p;
    },
    formeln: [
      [zw("Nullstelle", "Zero"), "x = 0 für alle a"],
      [zw("Extrempunkt", "Extremum"), "E(1/a | 1/(a·e))  (a ≠ 0);  a > 0 Hochpunkt, a < 0 Tiefpunkt"],
      [zw("Wendepunkt", "Inflection point"), "W(2/a | 2/(a·e²))  (a ≠ 0)"],
      [zw("Ortskurve der Extrempunkte", "Locus of the extrema"), "y = x/e"],
    ],
    faelle: (a) => (a === 0 ? zw("a = 0: f₀(x) = x – eine Gerade ohne Extrem- und Wendepunkte.", "a = 0: f₀(x) = x – a line without extrema or inflection points.") : a > 0 ? zw("a > 0: Hochpunkt rechts von der y-Achse, für x → ∞ geht fₐ gegen 0.", "a > 0: maximum to the right of the y-axis; fₐ tends to 0 as x → ∞.") : zw("a < 0: Tiefpunkt links von der y-Achse, für x → −∞ geht fₐ gegen 0.", "a < 0: minimum to the left of the y-axis; fₐ tends to 0 as x → −∞.")),
    orts: (x) => x / E, ortsName: "y = x/e", bereich: [-4, 4, -3, 3],
  },
};
const SCHAR_WAHL = [["kubisch", "x³ − 3ax"], ["parabel", "ax² − 4x"], ["exp", "x · e^(−ax)"]];
const FARBE = { N: C.see, H: "#0F7A4D", T: "#0F7A4D", W: "#B58A00" };
const NAME = { N: "N", H: "H", T: "T", W: "W" };

function ScharBild({ sid, a, ortskurve, zeigeSchar = true }) {
  const s = SCHAREN[sid];
  const [x0, x1, y0, y1] = s.bereich;
  const andere = zeigeSchar ? [-2, -1, 1, 2].filter((v) => Math.abs(v - a) > 0.05).map((v) => ({ f: s.f(v), farbe: C.see, blass: true, breite: 1.6 })) : [];
  const kurven = [...andere, { f: s.f(a), farbe: C.see, name: `a = ${zt(a, 2)}`, breite: 2.8 }];
  if (ortskurve) kurven.push({ f: s.orts, farbe: PARAM, gestrichelt: true, breite: 1.8 });
  const punkte = s.punkte(a).map((p) => ({ ...p, farbe: FARBE[p.art], name: NAME[p.art] }));
  return <FunktionsBild kurven={kurven} punkte={punkte} x0={x0} x1={x1} y0={y0} y1={y1} hoehe={250} />;
}

function hilfeS(id) {
  return hilfeKontext({
    id, aufgabe: "Funktionsschar Parameter Extrempunkt Wendepunkt Ortskurve Fallunterscheidung",
    verstehen: [
      zw("Eine Schar ist eine ganze Familie von Funktionen. Für jedes a erhältst du eine eigene Funktion.", "A family is a whole set of functions. Each a gives its own function."),
      zw("x ist die Variable, a ist ein fester, aber beliebiger Wert. Beim Ableiten nach x behandelst du a wie eine Zahl.", "x is the variable, a is a fixed but arbitrary value. When differentiating with respect to x, treat a like a number."),
      zw("Ergebnisse hängen oft von a ab – und manchmal gibt es sie nur für bestimmte a.", "Results often depend on a – and sometimes only exist for certain a."),
    ],
    ansatz: [
      zw("Was ist gesucht: ein Punkt in Abhängigkeit von a, oder ein bestimmter Wert von a?", "What is wanted: a point depending on a, or a particular value of a?"),
      zw("Für besondere Punkte: wie gewohnt f′ₐ(x) = 0 bzw. f″ₐ(x) = 0, dann nach x auflösen.", "For special points: as usual f′ₐ(x) = 0 or f″ₐ(x) = 0, then solve for x."),
      zw("Für einen Wert von a: die Bedingung aufstellen (z. B. f′ₐ(2) = 0) und nach a auflösen.", "For a value of a: set up the condition (e.g. f′ₐ(2) = 0) and solve for a."),
    ],
    regel: [
      zw("Was ist notwendig, was hinreichend?", "What is necessary, what is sufficient?"),
      zw("Extremstelle: f′ₐ(x) = 0 und Vorzeichenwechsel von f′ₐ (oder f″ₐ(x) ≠ 0). Wendestelle: f″ₐ(x) = 0 und Vorzeichenwechsel von f″ₐ.", "Extremum: f′ₐ(x) = 0 and a sign change of f′ₐ (or f″ₐ(x) ≠ 0). Inflection: f″ₐ(x) = 0 and a sign change of f″ₐ."),
      zw("Ortskurve: x-Koordinate nach a auflösen und in die y-Koordinate einsetzen.", "Locus: solve the x-coordinate for a and substitute into the y-coordinate."),
    ],
    pruefen: [
      zw("Teilst du durch a? Dann gilt das Ergebnis nur für a ≠ 0 – untersuche a = 0 extra.", "Do you divide by a? Then the result only holds for a ≠ 0 – check a = 0 separately."),
      zw("Ziehst du eine Wurzel aus einem Term mit a? Dann muss er ≥ 0 bzw. > 0 sein.", "Do you take a root of a term with a? It must be ≥ 0 or > 0."),
      zw("Kontrolliere mit dem Regler: Wandert der Punkt so, wie deine Formel es sagt?", "Check with the slider: does the point move as your formula says?"),
    ],
    regeln: [{ name: "Potenzregel", bereich: "analysis" }, { name: "Kettenregel", bereich: "analysis" }, { name: "Produktregel", bereich: "analysis" }],
  });
}

/* ---------- Modus 1: Parameter entdecken ---------- */
function Entdecken() {
  const [sid, setSid] = useState("kubisch");
  const [a, setA] = useState(1);
  const [orts, setOrts] = useState(false);
  const s = SCHAREN[sid];
  const pkt = s.punkte(a).filter((p, i, l) => l.findIndex((q) => q.art === p.art && Math.abs(q.x - p.x) < 1e-9) === i);
  return (
    <div style={{ ...karte, marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        <p style={kicker}>{zw("Parameter entdecken", "Explore the parameter")}</p>
        <IchHaengeFest kontext={hilfeS(`sch-e-${sid}`)} />
      </div>
      <Auswahl optionen={SCHAR_WAHL} wert={sid} setWert={(v) => { setSid(v); setOrts(false); }} label={zw("Schar", "Family")} />
      <p style={{ fontSize: 16, fontWeight: 700, color: C.tinte, margin: "12px 0 4px" }}><PT t={s.name} /></p>
      <div style={{ background: C.sand, borderRadius: 14, padding: "10px 14px", margin: "6px 0 10px" }}>
        <label style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700, color: C.tinte }}>
          <span>{zw("Parameter", "Parameter")} <b style={{ color: PARAM, fontStyle: "italic" }}>a</b></span><b style={{ color: PARAM, fontSize: 17 }}>{zt(a, 2)}</b>
        </label>
        <input type="range" min={-3} max={3} step={0.1} value={a} onChange={(e) => setA(Math.round(Number(e.target.value) * 10) / 10)} aria-label={zw("Parameter a", "Parameter a")} style={{ width: "100%", accentColor: PARAM, height: 32 }} />
      </div>
      <ScharBild sid={sid} a={a} ortskurve={orts} />
      <p style={{ fontSize: 12.5, color: C.grau, margin: "6px 0 0" }}>{zw("Blass im Hintergrund: die Scharkurven für a = −2, −1, 1, 2.", "Faint in the background: the curves for a = −2, −1, 1, 2.")}</p>
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: C.tinte, margin: "8px 0", minHeight: 44, cursor: "pointer" }}>
        <input type="checkbox" checked={orts} onChange={(e) => setOrts(e.target.checked)} style={{ width: 20, height: 20, accentColor: PARAM }} />
        {zw("Ortskurve der", "Locus of the")} {sid === "parabel" ? zw("Scheitelpunkte", "vertices") : zw("Extrempunkte", "extrema")} {zw("anzeigen", "")} ({s.ortsName})
      </label>
      <div style={{ border: `1px solid ${C.linie}`, borderRadius: 14, padding: "10px 12px" }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: C.grau, margin: "0 0 6px" }}>{zw(`Für a = ${zt(a, 2)}`, `For a = ${zt(a, 2)}`)}</p>
        {pkt.length ? pkt.map((p, i) => (
          <p key={i} style={{ fontSize: 14, color: C.tinte, margin: "2px 0" }}>
            <b style={{ color: FARBE[p.art] }}>{p.art === "N" ? zw("Nullstelle", "Zero") : p.art === "H" ? zw("Hochpunkt", "Maximum") : p.art === "T" ? zw("Tiefpunkt", "Minimum") : zw("Wendepunkt", "Inflection point")}</b>{" "}
            ({zt(p.x, 3)} | {zt(p.y, 3)})
          </p>
        )) : null}
        <p style={{ fontSize: 13, color: C.grau, margin: "6px 0 0", lineHeight: 1.55 }}>{s.faelle(a)}</p>
      </div>
      <Aufklapp titel={zw("Die Rechnung dahinter – allgemein für jedes a", "The calculation behind it – for every a")}>
        <p style={{ margin: "0 0 4px" }}><PT t={s.ableitung} /></p>
        <p style={{ margin: "0 0 8px" }}><PT t={s.zweite} /></p>
        {s.formeln.map(([k, v]) => <p key={k} style={{ margin: "2px 0" }}><b>{k}:</b> <PT t={v} /></p>)}
        <p style={{ margin: "8px 0 0", color: C.grau }}>{zw("Der Regler zeigt Beispiele – begründet wird mit der Rechnung.", "The slider shows examples – the reasoning comes from the calculation.")}</p>
      </Aufklapp>
    </div>
  );
}

/* ---------- Modus 2: Besondere Punkte ---------- */
function punkteSchritte(sid) {
  if (sid === "kubisch") return [
    { id: "abl", titel: zw("Ableitung", "Derivative"), typ: "wahl", frage: zw("Leite fₐ(x) = x³ − 3ax nach x ab.", "Differentiate fₐ(x) = x³ − 3ax with respect to x."),
      optionen: [["a", <PT key="a" t="3x² − 3a" />], ["b", <PT key="b" t="3x² − 3" />], ["c", <PT key="c" t="3x² − 3a·x − 3x" />]], richtig: "a",
      fehler: [{ wahl: "b", text: zw("Der Faktor a bleibt beim Ableiten stehen: (3a·x)′ = 3a.", "The factor a stays when differentiating: (3a·x)′ = 3a.") }, { wahl: "c", text: zw("Abgeleitet wird nur nach x – a ist eine Konstante.", "Differentiate only with respect to x – a is a constant.") }],
      hinweise: [zw("Behandle a wie eine Zahl, z. B. wie 5.", "Treat a like a number, e.g. like 5.")], erklaerung: "f′ₐ(x) = 3x² − 3a, f″ₐ(x) = 6x." },
    { id: "notw", titel: zw("Notwendige Bedingung", "Necessary condition"), typ: "wahl", frage: zw("f′ₐ(x) = 0 führt auf …", "f′ₐ(x) = 0 leads to …"),
      optionen: [["a", <PT key="a" t="x² = a" />], ["b", <PT key="b" t="x = a" />], ["c", <PT key="c" t="x² = 3a" />]], richtig: "a",
      fehler: [{ wahl: "c", text: zw("Das ist die Gleichung für die Nullstellen von fₐ, nicht für f′ₐ.", "That is the equation for the zeros of fₐ, not of f′ₐ.") }],
      hinweise: [zw("3x² − 3a = 0 durch 3 teilen.", "Divide 3x² − 3a = 0 by 3.")], erklaerung: "3x² − 3a = 0 ⇔ x² = a." },
    { id: "exist", titel: zw("Für welche a?", "For which a?"), typ: "wahl", frage: zw("Für welche Werte von a hat fₐ Extremstellen?", "For which values of a does fₐ have extrema?"),
      optionen: [["a", <PT key="a" t="nur für a > 0" />], ["b", <PT key="b" t="für a ≥ 0" />], ["c", zw("für alle a", "for all a")]], richtig: "a",
      fehler: [{ wahl: "b", text: zw("Für a = 0 ist f′₀(0) = 0, aber f′₀(x) = 3x² wechselt das Vorzeichen nicht – Sattelpunkt, kein Extremum.", "For a = 0, f′₀(0) = 0, but f′₀(x) = 3x² does not change sign – saddle point, no extremum.") }, { wahl: "c", text: zw("Für a < 0 hat x² = a keine reelle Lösung.", "For a < 0, x² = a has no real solution.") }],
      hinweise: [zw("x² = a hat nur für a ≥ 0 Lösungen. Was passiert genau bei a = 0?", "x² = a only has solutions for a ≥ 0. What happens exactly at a = 0?")], erklaerung: zw("a > 0: x = ±√a. a = 0: nur Sattelpunkt. a < 0: keine Lösung.", "a > 0: x = ±√a. a = 0: only a saddle point. a < 0: no solution.") },
    { id: "art", titel: zw("Hinreichende Bedingung", "Sufficient condition"), typ: "wahl", frage: zw("Welche Art hat der Punkt bei x = √a (a > 0)?", "What type is the point at x = √a (a > 0)?"),
      optionen: [["a", <PT key="a" t="Tiefpunkt T(√a | −2a√a), da f″ₐ(√a) = 6√a > 0" />], ["b", <PT key="b" t="Hochpunkt H(√a | 2a√a), da f″ₐ(√a) > 0" />], ["c", zw("Wendepunkt, weil f′ₐ(√a) = 0", "Inflection point because f′ₐ(√a) = 0")]], richtig: "a",
      fehler: [{ wahl: "b", text: zw("f″ > 0 bedeutet Linkskrümmung – also Tiefpunkt.", "f″ > 0 means curving upward – a minimum.") }, { wahl: "c", text: zw("f′ = 0 allein entscheidet nichts – und für einen Wendepunkt bräuchte man f″ = 0.", "f′ = 0 alone decides nothing – and an inflection point would need f″ = 0.") }],
      hinweise: [zw("Setze x = √a in f″ₐ(x) = 6x ein. Für die y-Koordinate in fₐ.", "Plug x = √a into f″ₐ(x) = 6x. For the y-coordinate use fₐ.")], erklaerung: zw("f″ₐ(√a) = 6√a > 0 ⇒ Tiefpunkt; fₐ(√a) = a√a − 3a√a = −2a√a. Symmetrisch: H(−√a | 2a√a).", "f″ₐ(√a) = 6√a > 0 ⇒ minimum; fₐ(√a) = a√a − 3a√a = −2a√a. Symmetrically: H(−√a | 2a√a).") },
    { id: "wp", titel: zw("Wendepunkt", "Inflection point"), typ: "wahl", frage: zw("Wo liegt der Wendepunkt?", "Where is the inflection point?"),
      optionen: [["a", zw("W(0 | 0) – für jedes a", "W(0 | 0) – for every a")], ["b", <PT key="b" t="W(√a | 0)" />], ["c", zw("Es gibt keinen.", "There is none.")]], richtig: "a",
      hinweise: [zw("f″ₐ(x) = 6x = 0, und f″ₐ wechselt bei 0 das Vorzeichen.", "f″ₐ(x) = 6x = 0, and f″ₐ changes sign at 0.")], erklaerung: zw("f″ₐ(x) = 6x = 0 ⇒ x = 0, Vorzeichenwechsel von f″ₐ; fₐ(0) = 0. Alle Kurven der Schar haben denselben Wendepunkt.", "f″ₐ(x) = 6x = 0 ⇒ x = 0, f″ₐ changes sign; fₐ(0) = 0. All curves share the same inflection point.") },
    { id: "orts", titel: zw("Ortskurve", "Locus"), typ: "wahl", frage: zw("Auf welcher Kurve liegen alle Tiefpunkte T(√a | −2a√a)?", "On which curve do all minima T(√a | −2a√a) lie?"),
      optionen: [["a", "y = −2x³"], ["b", "y = −2x"], ["c", "y = −2x²"]], richtig: "a",
      hinweise: [zw("Aus x = √a folgt a = x². Setze das in y = −2a√a ein.", "From x = √a we get a = x². Substitute into y = −2a√a.")], erklaerung: zw("a = x² ⇒ y = −2 · x² · x = −2x³ (auch die Hochpunkte liegen darauf).", "a = x² ⇒ y = −2 · x² · x = −2x³ (the maxima lie on it too).") },
  ];
  if (sid === "parabel") return [
    { id: "abl", titel: zw("Ableitung", "Derivative"), typ: "wahl", frage: zw("Leite fₐ(x) = ax² − 4x nach x ab.", "Differentiate fₐ(x) = ax² − 4x with respect to x."),
      optionen: [["a", <PT key="a" t="2a·x − 4" />], ["b", <PT key="b" t="2x − 4" />], ["c", <PT key="c" t="x² − 4" />]], richtig: "a",
      fehler: [{ wahl: "b", text: zw("a ist ein Faktor und bleibt stehen.", "a is a factor and stays.") }, { wahl: "c", text: zw("Das wäre die Ableitung nach a. Abgeleitet wird nach x.", "That would be the derivative with respect to a. Differentiate with respect to x.") }],
      hinweise: [zw("a wie eine Zahl behandeln.", "Treat a like a number.")], erklaerung: "f′ₐ(x) = 2ax − 4, f″ₐ(x) = 2a." },
    { id: "x", titel: zw("Extremstelle", "Extremal point"), typ: "wahl", frage: zw("Löse f′ₐ(x) = 0 nach x.", "Solve f′ₐ(x) = 0 for x."),
      optionen: [["a", <PT key="a" t="x = 2/a, nur für a ≠ 0" />], ["b", <PT key="b" t="x = 2/a für alle a" />], ["c", <PT key="c" t="x = 2a" />]], richtig: "a",
      fehler: [{ wahl: "b", text: zw("Durch 0 darf man nicht teilen. Für a = 0 ist f₀(x) = −4x eine Gerade ohne Extremum.", "You may not divide by 0. For a = 0, f₀(x) = −4x is a line without an extremum.") }, { wahl: "c", text: zw("2ax = 4 ⇒ x = 4/(2a) = 2/a.", "2ax = 4 ⇒ x = 4/(2a) = 2/a.") }],
      hinweise: [zw("2ax − 4 = 0 ⇔ 2ax = 4. Wodurch teilst du?", "2ax − 4 = 0 ⇔ 2ax = 4. What do you divide by?")], erklaerung: zw("2ax = 4 ⇒ x = 2/a – Division durch a nur für a ≠ 0. Fall a = 0 extra: Gerade, kein Scheitel.", "2ax = 4 ⇒ x = 2/a – dividing by a only for a ≠ 0. Case a = 0 separately: line, no vertex.") },
    { id: "y", titel: zw("y-Koordinate", "y-coordinate"), typ: "wahl", frage: zw("Berechne fₐ(2/a).", "Compute fₐ(2/a)."),
      optionen: [["a", <PT key="a" t="−4/a" />], ["b", <PT key="b" t="4/a" />], ["c", <PT key="c" t="−8/a" />]], richtig: "a",
      fehler: [{ wahl: "c", text: zw("a · (2/a)² = 4/a, nicht 0. Insgesamt 4/a − 8/a.", "a · (2/a)² = 4/a, not 0. In total 4/a − 8/a.") }],
      hinweise: [zw("a · (2/a)² − 4 · 2/a = 4/a − 8/a", "a · (2/a)² − 4 · 2/a = 4/a − 8/a")], erklaerung: "fₐ(2/a) = 4/a − 8/a = −4/a." },
    { id: "art", titel: zw("Art des Extremums", "Type of extremum"), typ: "wahl", frage: zw("Wann ist der Scheitel ein Hochpunkt?", "When is the vertex a maximum?"),
      optionen: [["a", <PT key="a" t="für a < 0, da dann f″ₐ = 2a < 0" />], ["b", <PT key="b" t="für a > 0" />], ["c", zw("immer", "always")]], richtig: "a",
      fehler: [{ wahl: "b", text: zw("Für a > 0 ist f″ₐ = 2a > 0 – nach oben geöffnet, also Tiefpunkt.", "For a > 0, f″ₐ = 2a > 0 – opens upward, so a minimum.") }],
      hinweise: [zw("Vorzeichen von f″ₐ(x) = 2a.", "Sign of f″ₐ(x) = 2a.")], erklaerung: zw("a < 0: Hochpunkt, a > 0: Tiefpunkt, a = 0: kein Extremum.", "a < 0: maximum, a > 0: minimum, a = 0: no extremum.") },
    { id: "orts", titel: zw("Ortskurve", "Locus"), typ: "wahl", frage: zw("Auf welcher Kurve liegen alle Scheitelpunkte S(2/a | −4/a)?", "On which curve do all vertices S(2/a | −4/a) lie?"),
      optionen: [["a", "y = −2x"], ["b", "y = −4x"], ["c", "y = −x²"]], richtig: "a",
      hinweise: [zw("Aus x = 2/a folgt a = 2/x. In y = −4/a einsetzen.", "From x = 2/a, a = 2/x. Substitute into y = −4/a.")], erklaerung: zw("a = 2/x ⇒ y = −4 : (2/x) = −2x (für x ≠ 0).", "a = 2/x ⇒ y = −4 : (2/x) = −2x (for x ≠ 0).") },
  ];
  return [
    { id: "abl", titel: zw("Ableitung", "Derivative"), typ: "wahl", frage: zw("Leite fₐ(x) = x · e^(−ax) ab (Produkt- und Kettenregel).", "Differentiate fₐ(x) = x · e^(−ax) (product and chain rule)."),
      optionen: [["a", <PT key="a" t="(1 − a·x) · e^(−a·x)" />], ["b", <PT key="b" t="−a · e^(−a·x)" />], ["c", <PT key="c" t="e^(−a·x) − x · e^(−a·x)" />]], richtig: "a",
      fehler: [{ wahl: "b", text: zw("Das ist nur die Ableitung von e^(−ax). Produktregel: u′v + uv′.", "That is only the derivative of e^(−ax). Product rule: u′v + uv′.") }, { wahl: "c", text: zw("Die innere Ableitung von −ax ist −a, nicht −1.", "The inner derivative of −ax is −a, not −1.") }],
      hinweise: [zw("u = x, v = e^(−ax), v′ = −a · e^(−ax)", "u = x, v = e^(−ax), v′ = −a · e^(−ax)")], erklaerung: "f′ₐ(x) = 1 · e^(−ax) + x · (−a) · e^(−ax) = (1 − ax) · e^(−ax)." },
    { id: "x", titel: zw("Extremstelle", "Extremal point"), typ: "wahl", frage: zw("Löse f′ₐ(x) = 0.", "Solve f′ₐ(x) = 0."),
      optionen: [["a", <PT key="a" t="x = 1/a, nur für a ≠ 0" />], ["b", <PT key="b" t="x = 1/a und e^(−a·x) = 0" />], ["c", <PT key="c" t="x = a" />]], richtig: "a",
      fehler: [{ wahl: "b", text: zw("e^(−ax) ist immer positiv und nie 0 – nur der andere Faktor kann 0 werden.", "e^(−ax) is always positive and never 0 – only the other factor can be 0.") }],
      hinweise: [zw("Satz vom Nullprodukt: e^(−ax) > 0, also 1 − ax = 0.", "Zero product: e^(−ax) > 0, so 1 − ax = 0.")], erklaerung: zw("1 − ax = 0 ⇒ x = 1/a (a ≠ 0). Für a = 0 ist f′₀(x) = 1 ≠ 0: kein Extremum.", "1 − ax = 0 ⇒ x = 1/a (a ≠ 0). For a = 0, f′₀(x) = 1 ≠ 0: no extremum.") },
    { id: "art", titel: zw("Art und Koordinaten", "Type and coordinates"), typ: "wahl", frage: zw("Für a > 0 ist der Punkt bei x = 1/a ein …", "For a > 0 the point at x = 1/a is a …"),
      optionen: [["a", <PT key="a" t="Hochpunkt H(1/a | 1/(a·e)), da f″ₐ(1/a) = −a/e < 0" />], ["b", <PT key="b" t="Tiefpunkt T(1/a | 1/(a·e))" />], ["c", <PT key="c" t="Hochpunkt H(1/a | 1/a)" />]], richtig: "a",
      fehler: [{ wahl: "b", text: zw("f″ₐ(1/a) = (a − 2a) · e⁻¹ = −a/e < 0 für a > 0 – also Hochpunkt.", "f″ₐ(1/a) = (a − 2a) · e⁻¹ = −a/e < 0 for a > 0 – so a maximum.") }, { wahl: "c", text: zw("fₐ(1/a) = (1/a) · e^(−1) = 1/(a·e).", "fₐ(1/a) = (1/a) · e^(−1) = 1/(a·e).") }],
      hinweise: [zw("f″ₐ(x) = (a²x − 2a) · e^(−ax) bei x = 1/a auswerten.", "Evaluate f″ₐ(x) = (a²x − 2a) · e^(−ax) at x = 1/a.")], erklaerung: zw("f″ₐ(1/a) = −a/e < 0 für a > 0: Hochpunkt H(1/a | 1/(a·e)); für a < 0 Tiefpunkt.", "f″ₐ(1/a) = −a/e < 0 for a > 0: maximum H(1/a | 1/(a·e)); for a < 0 a minimum.") },
    { id: "wp", titel: zw("Wendepunkt", "Inflection point"), typ: "wahl", frage: zw("f″ₐ(x) = 0 liefert die Wendestelle …", "f″ₐ(x) = 0 gives the inflection point …"),
      optionen: [["a", <PT key="a" t="x = 2/a (a ≠ 0)" />], ["b", <PT key="b" t="x = a/2" />], ["c", "x = 0"]], richtig: "a",
      hinweise: [zw("a²x − 2a = 0 ⇔ a(ax − 2) = 0", "a²x − 2a = 0 ⇔ a(ax − 2) = 0")], erklaerung: zw("a(ax − 2) = 0 ⇒ x = 2/a für a ≠ 0; f″ₐ wechselt dort das Vorzeichen. W(2/a | 2/(a·e²)).", "a(ax − 2) = 0 ⇒ x = 2/a for a ≠ 0; f″ₐ changes sign there. W(2/a | 2/(a·e²)).") },
    { id: "orts", titel: zw("Ortskurve", "Locus"), typ: "wahl", frage: zw("Auf welcher Kurve liegen alle Extrempunkte (1/a | 1/(a·e))?", "On which curve do all extrema (1/a | 1/(a·e)) lie?"),
      optionen: [["a", "y = x/e"], ["b", "y = e·x"], ["c", "y = 1/x"]], richtig: "a",
      hinweise: [zw("Aus x = 1/a folgt 1/a = x.", "From x = 1/a we get 1/a = x.")], erklaerung: zw("1/a = x ⇒ y = x · 1/e = x/e.", "1/a = x ⇒ y = x · 1/e = x/e.") },
  ];
}
function BesonderePunkte() {
  const [sid, setSid] = useState("kubisch");
  const [nr, setNr] = useState(0);
  const [stand, setStand] = useState(0);
  const [a, setA] = useState(1);
  const schritte = useMemo(() => punkteSchritte(sid), [sid, nr]);
  const wechsel = (v) => { setSid(v); setStand(0); setNr((n) => n + 1); };
  return (
    <div style={{ ...karte, marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        <p style={kicker}>{zw("Besondere Punkte", "Special points")}</p>
        <IchHaengeFest kontext={hilfeS(`sch-p-${sid}`)} />
      </div>
      <Auswahl optionen={SCHAR_WAHL} wert={sid} setWert={wechsel} label={zw("Schar", "Family")} />
      <p style={{ ...hinweis, color: C.tinte, margin: "10px 0 4px" }}>{zw("Bestimme die besonderen Punkte allgemein in Abhängigkeit von", "Determine the special points in general, depending on")} <b style={{ color: PARAM }}>a</b>: <PT t={SCHAREN[sid].name} /></p>
      <SchrittFolge key={`${sid}-${nr}`} schritte={schritte} stand={stand} setStand={setStand} fertigText={zw("Alle besonderen Punkte allgemein bestimmt – inklusive der Fälle, in denen es sie nicht gibt.", "All special points found in general – including the cases where they don't exist.")} />
      {stand >= 2 && (
        <div style={{ marginTop: 12 }}>
          <p style={{ fontSize: 13, color: C.grau, margin: "0 0 4px" }}>{zw("Kontrolle am Graphen: Regler bewegen und prüfen, ob die Punkte wandern wie berechnet.", "Check on the graph: move the slider and see whether the points move as computed.")}</p>
          <input type="range" min={-3} max={3} step={0.1} value={a} onChange={(e) => setA(Math.round(Number(e.target.value) * 10) / 10)} aria-label={zw("Parameter a", "Parameter a")} style={{ width: "100%", accentColor: PARAM, height: 32 }} />
          <ScharBild sid={sid} a={a} ortskurve={stand >= schritte.length} zeigeSchar={false} />
        </div>
      )}
      <GrosserKnopf ghost onClick={() => { setStand(0); setNr((n) => n + 1); }}>{zw("Von vorn", "Start again")}</GrosserKnopf>
    </div>
  );
}

/* ---------- Modus 3: Parameterfälle ---------- */
function fallAufgabe(vorher) {
  const liste = [
    () => { const k = wahl([1, 2]); const a = k * k; return { sid: "kubisch", text: zw(`Für welches a hat f_a(x) = x³ − 3ax an der Stelle x = ${k} eine Extremstelle?`, `For which a does f_a(x) = x³ − 3ax have an extremum at x = ${k}?`),
      schritte: [
        { id: "b", titel: zw("Bedingung", "Condition"), typ: "wahl", frage: zw("Welche Bedingung stellst du auf?", "Which condition do you set up?"), optionen: [["a", `f′ₐ(${k}) = 0`], ["b", `fₐ(${k}) = 0`], ["c", `f″ₐ(${k}) = 0`]], richtig: "a",
          fehler: [{ wahl: "b", text: zw("fₐ(k) = 0 wäre eine Nullstelle.", "fₐ(k) = 0 would be a zero.") }, { wahl: "c", text: zw("f″ = 0 ist die Bedingung für Wendestellen.", "f″ = 0 is the condition for inflection points.") }],
          hinweise: [zw("Notwendige Bedingung für eine Extremstelle.", "Necessary condition for an extremum.")], erklaerung: `f′ₐ(${k}) = 3 · ${k * k} − 3a = 0.` },
        { id: "a", titel: zw("Nach a auflösen", "Solve for a"), typ: "zahl", text: "a =", wert: a, frage: zw(`Löse 3 · ${k}² − 3a = 0 nach a auf.`, `Solve 3 · ${k}² − 3a = 0 for a.`), hinweise: [`3a = ${3 * k * k}`], erklaerung: `3a = ${3 * k * k} ⇒ a = ${a}.` },
        { id: "h", titel: zw("Hinreichend?", "Sufficient?"), typ: "wahl", frage: zw(`Ist bei x = ${k} wirklich ein Extremum?`, `Is there really an extremum at x = ${k}?`),
          optionen: [["a", zw(`Ja: f″ₐ(${k}) = ${6 * k} > 0, also ein Tiefpunkt.`, `Yes: f″ₐ(${k}) = ${6 * k} > 0, so a minimum.`)], ["b", zw("Ja, weil f′ₐ(k) = 0 schon reicht.", "Yes, because f′ₐ(k) = 0 is enough.")], ["c", zw(`Nein, f″ₐ(${k}) = 0.`, `No, f″ₐ(${k}) = 0.`)]], richtig: "a",
          fehler: [{ wahl: "b", text: zw("f′ = 0 ist nur notwendig. Für a = 0 wäre z. B. x = 0 ein Sattelpunkt.", "f′ = 0 is only necessary. For a = 0, x = 0 would be a saddle point.") }],
          hinweise: [zw("f″ₐ(x) = 6x an der Stelle prüfen.", "Check f″ₐ(x) = 6x at the point.")], erklaerung: zw(`f″ₐ(${k}) = ${6 * k} ≠ 0 ⇒ Extremum (Tiefpunkt). Für a = ${a} ist die Bedingung also auch hinreichend erfüllt.`, `f″ₐ(${k}) = ${6 * k} ≠ 0 ⇒ extremum (minimum). For a = ${a} the condition is also sufficient.`) },
      ], aWert: a }; },
    () => { const a = wahl([-2, -1, 1, 2]); const y = 1 - 3 * a; return { sid: "kubisch", text: zw(`Für welches a verläuft der Graph von f_a(x) = x³ − 3ax durch P(1 | ${y})?`, `For which a does the graph of f_a(x) = x³ − 3ax pass through P(1 | ${y})?`),
      schritte: [
        { id: "b", titel: zw("Bedingung", "Condition"), typ: "wahl", frage: zw("Welche Gleichung beschreibt „P liegt auf dem Graphen“?", "Which equation says “P lies on the graph”?"), optionen: [["a", `fₐ(1) = ${y}`], ["b", `f′ₐ(1) = ${y}`], ["c", `fₐ(${y}) = 1`]], richtig: "a",
          fehler: [{ wahl: "c", text: zw("x- und y-Koordinate sind vertauscht.", "x- and y-coordinates are swapped.") }], hinweise: [zw("Punktprobe: x einsetzen, y herauskommen lassen.", "Point test: plug in x, get y.")], erklaerung: `fₐ(1) = 1 − 3a = ${y}.` },
        { id: "a", titel: zw("Nach a auflösen", "Solve for a"), typ: "zahl", text: "a =", wert: a, frage: zw(`Löse 1 − 3a = ${y}.`, `Solve 1 − 3a = ${y}.`), hinweise: [`−3a = ${y - 1}`], erklaerung: `−3a = ${y - 1} ⇒ a = ${a}.` },
        { id: "eind", titel: zw("Wie viele Lösungen?", "How many solutions?"), typ: "wahl", frage: zw("Gibt es weitere Scharkurven durch P?", "Are there other curves of the family through P?"),
          optionen: [["a", zw("Nein – die Gleichung ist linear in a und hat genau eine Lösung.", "No – the equation is linear in a and has exactly one solution.")], ["b", zw("Ja, unendlich viele.", "Yes, infinitely many.")]], richtig: "a",
          hinweise: [zw("Wie oft kommt a in der Gleichung vor?", "How does a appear in the equation?")], erklaerung: zw("1 − 3a = y hat genau eine Lösung – genau eine Scharkurve geht durch P.", "1 − 3a = y has exactly one solution – exactly one curve passes through P.") },
      ], aWert: a }; },
    () => { const s = wahl([1, 2, 4, -1, -2]); const a = 2 / s; return { sid: "parabel", text: zw(`Für welches a liegt der Scheitelpunkt von f_a(x) = ax² − 4x bei x = ${s}?`, `For which a is the vertex of f_a(x) = ax² − 4x at x = ${s}?`),
      schritte: [
        { id: "b", titel: zw("Bedingung", "Condition"), typ: "wahl", frage: zw("Der Scheitel liegt bei x = 2/a. Welche Gleichung entsteht?", "The vertex is at x = 2/a. Which equation results?"), optionen: [["a", `2/a = ${s}`], ["b", `2a = ${s}`], ["c", `−4/a = ${s}`]], richtig: "a",
          fehler: [{ wahl: "c", text: zw("−4/a ist die y-Koordinate des Scheitels.", "−4/a is the y-coordinate of the vertex.") }], hinweise: [zw("x-Koordinate des Scheitels gleichsetzen.", "Set the x-coordinate of the vertex equal.")], erklaerung: `2/a = ${s}.` },
        { id: "a", titel: zw("Nach a auflösen", "Solve for a"), typ: "zahl", text: "a =", wert: a, toleranz: 1e-9, wertText: zt(a, 3), frage: zw(`Löse 2/a = ${s} nach a auf.`, `Solve 2/a = ${s} for a.`),
          fehler: [{ wert: 2 * s, text: zw("Mit a multiplizieren und dann durch die Zahl teilen: a = 2/s.", "Multiply by a, then divide by the number: a = 2/s.") }], hinweise: [`a = 2 / ${s}`], erklaerung: `a = 2 / ${s} = ${zt(a, 3)}.` },
        { id: "art", titel: zw("Art", "Type"), typ: "wahl", frage: zw(`Ist der Scheitel für a = ${zt(a, 3)} ein Hoch- oder Tiefpunkt?`, `Is the vertex for a = ${zt(a, 3)} a maximum or minimum?`),
          optionen: [["T", zw("Tiefpunkt", "Minimum")], ["H", zw("Hochpunkt", "Maximum")]], richtig: a > 0 ? "T" : "H",
          hinweise: [zw("f″ₐ = 2a – Vorzeichen prüfen.", "f″ₐ = 2a – check the sign.")], erklaerung: a > 0 ? zw(`f″ = 2a = ${zt(2 * a, 3)} > 0: Tiefpunkt.`, `f″ = 2a = ${zt(2 * a, 3)} > 0: minimum.`) : zw(`f″ = 2a = ${zt(2 * a, 3)} < 0: Hochpunkt.`, `f″ = 2a = ${zt(2 * a, 3)} < 0: maximum.`) },
        { id: "null", titel: zw("Sonderfall a = 0", "Special case a = 0"), typ: "wahl", frage: zw("Was ist mit a = 0?", "What about a = 0?"),
          optionen: [["a", zw("f₀(x) = −4x ist eine Gerade – sie hat keinen Scheitel.", "f₀(x) = −4x is a line – it has no vertex.")], ["b", zw("Der Scheitel liegt dann im Unendlichen bei x = 2/0.", "The vertex is then at infinity at x = 2/0.")]], richtig: "a",
          fehler: [{ wahl: "b", text: zw("2/0 ist nicht definiert. Für a = 0 entfällt der Scheitel ganz.", "2/0 is undefined. For a = 0 there simply is no vertex.") }], hinweise: [zw("Setze a = 0 in die Funktion ein.", "Plug a = 0 into the function.")], erklaerung: zw("Für a = 0 ist fₐ keine Parabel – Nennerbedingung a ≠ 0.", "For a = 0, fₐ is no parabola – denominator condition a ≠ 0.") },
      ], aWert: a }; },
    () => { const n = wahl([2, 4, -4, 8]); const a = 4 / n; return { sid: "parabel", text: zw(`Für welches a hat f_a(x) = ax² − 4x die Nullstelle x = ${n}?`, `For which a does f_a(x) = ax² − 4x have the zero x = ${n}?`),
      schritte: [
        { id: "b", titel: zw("Bedingung", "Condition"), typ: "wahl", frage: zw("Welche Bedingung stellst du auf?", "Which condition do you set up?"), optionen: [["a", `fₐ(${n}) = 0`], ["b", `f′ₐ(${n}) = 0`], ["c", `fₐ(0) = ${n}`]], richtig: "a",
          hinweise: [zw("Nullstelle: Funktionswert 0.", "Zero: function value 0.")], erklaerung: `fₐ(${n}) = ${n * n}a − ${4 * n} = 0.` },
        { id: "a", titel: zw("Nach a auflösen", "Solve for a"), typ: "zahl", text: "a =", wert: a, wertText: zt(a, 3), frage: zw(`Löse ${n * n}a − ${4 * n} = 0.`, `Solve ${n * n}a − ${4 * n} = 0.`), hinweise: [`${n * n}a = ${4 * n}`], erklaerung: `a = ${4 * n} / ${n * n} = ${zt(a, 3)}.` },
        { id: "probe", titel: zw("Probe", "Check"), typ: "wahl", frage: zw("Welche Nullstellen hat fₐ für diesen Wert?", "Which zeros does fₐ have for this value?"),
          optionen: [["a", `x = 0 ${zw("und", "and")} x = ${n}`], ["b", zw(`nur x = ${n}`, `only x = ${n}`)]], richtig: "a",
          hinweise: [zw("Nullstellen der Schar: 0 und 4/a.", "Zeros of the family: 0 and 4/a.")], erklaerung: zw(`x(ax − 4) = 0 ⇒ x = 0 oder x = 4/a = ${n}.`, `x(ax − 4) = 0 ⇒ x = 0 or x = 4/a = ${n}.`) },
      ], aWert: a }; },
    () => { const h = wahl([1, 2, 0.5, 4]); const a = 1 / h; return { sid: "exp", text: zw(`Für welches a hat f_a(x) = x · e^(−ax) bei x = ${zt(h, 2)} einen Hochpunkt?`, `For which a does f_a(x) = x · e^(−ax) have a maximum at x = ${zt(h, 2)}?`),
      schritte: [
        { id: "b", titel: zw("Bedingung", "Condition"), typ: "wahl", frage: zw("Die Extremstelle ist x = 1/a. Welche Gleichung entsteht?", "The extremum is at x = 1/a. Which equation results?"), optionen: [["a", `1/a = ${zt(h, 2)}`], ["b", `a = ${zt(h, 2)}`], ["c", `1/(a·e) = ${zt(h, 2)}`]], richtig: "a",
          fehler: [{ wahl: "c", text: zw("1/(a·e) ist die y-Koordinate.", "1/(a·e) is the y-coordinate.") }], hinweise: [zw("x-Koordinate gleichsetzen.", "Set the x-coordinate equal.")], erklaerung: `1/a = ${zt(h, 2)}.` },
        { id: "a", titel: zw("Nach a auflösen", "Solve for a"), typ: "zahl", text: "a =", wert: a, wertText: zt(a, 3), frage: zw("Bestimme a.", "Find a."), fehler: [{ wert: h, text: zw("Kehrwert bilden: a = 1/x.", "Take the reciprocal: a = 1/x.") }].filter((f) => Math.abs(f.wert - a) > 1e-9), hinweise: [`a = 1 / ${zt(h, 2)}`], erklaerung: `a = 1 / ${zt(h, 2)} = ${zt(a, 3)}.` },
        { id: "art", titel: zw("Wirklich ein Hochpunkt?", "Really a maximum?"), typ: "wahl", frage: zw("Prüfe mit der hinreichenden Bedingung.", "Check with the sufficient condition."),
          optionen: [["a", zw(`Ja: f″ₐ(1/a) = −a/e < 0, weil a = ${zt(a, 3)} > 0.`, `Yes: f″ₐ(1/a) = −a/e < 0 because a = ${zt(a, 3)} > 0.`)], ["b", zw("Nein, es ist ein Tiefpunkt.", "No, it is a minimum.")]], richtig: "a",
          hinweise: [zw("f″ₐ(1/a) = −a/e", "f″ₐ(1/a) = −a/e")], erklaerung: zw("Für a > 0 ist f″ₐ(1/a) < 0 – Hochpunkt. Für negatives a läge bei x = 1/a ein Tiefpunkt.", "For a > 0, f″ₐ(1/a) < 0 – maximum. For negative a there would be a minimum at x = 1/a.") },
      ], aWert: a }; },
    () => ({ sid: "kubisch", text: zw("Wie viele Nullstellen hat f_a(x) = x³ − 3ax? Untersuche die Fälle.", "How many zeros does f_a(x) = x³ − 3ax have? Examine the cases."),
      schritte: [
        { id: "faktor", titel: zw("Ausklammern", "Factor out"), typ: "wahl", frage: zw("fₐ(x) = 0 ⇔ …", "fₐ(x) = 0 ⇔ …"), optionen: [["a", <PT key="a" t="x · (x² − 3a) = 0" />], ["b", <PT key="b" t="x² − 3a = 0" />]], richtig: "a",
          fehler: [{ wahl: "b", text: zw("Durch x teilen verliert die Lösung x = 0. Ausklammern statt teilen!", "Dividing by x loses the solution x = 0. Factor out instead of dividing!") }], hinweise: [zw("x ausklammern.", "Factor out x.")], erklaerung: "x · (x² − 3a) = 0 ⇒ x = 0 oder x² = 3a." },
        { id: "neg", titel: "a < 0", typ: "wahl", frage: zw("Anzahl der Nullstellen für a < 0?", "Number of zeros for a < 0?"), optionen: [["1", "1"], ["2", "2"], ["3", "3"]], richtig: "1",
          hinweise: [zw("x² = 3a mit 3a < 0?", "x² = 3a with 3a < 0?")], erklaerung: zw("x² = 3a < 0 hat keine Lösung – nur x = 0.", "x² = 3a < 0 has no solution – only x = 0.") },
        { id: "null", titel: "a = 0", typ: "wahl", frage: zw("Anzahl der Nullstellen für a = 0?", "Number of zeros for a = 0?"), optionen: [["1", "1"], ["2", "2"], ["3", "3"]], richtig: "1",
          fehler: [{ wahl: "3", text: zw("x³ = 0 hat nur die (dreifache) Nullstelle x = 0 – als Stelle zählt sie einmal.", "x³ = 0 has only the (triple) zero x = 0 – as a point it counts once.") }], hinweise: [zw("f₀(x) = x³", "f₀(x) = x³")], erklaerung: zw("f₀(x) = x³: genau eine Nullstelle (dreifach).", "f₀(x) = x³: exactly one zero (triple).") },
        { id: "pos", titel: "a > 0", typ: "wahl", frage: zw("Anzahl der Nullstellen für a > 0?", "Number of zeros for a > 0?"), optionen: [["1", "1"], ["2", "2"], ["3", "3"]], richtig: "3",
          hinweise: [zw("x² = 3a > 0 hat zwei Lösungen.", "x² = 3a > 0 has two solutions.")], erklaerung: zw("x = 0 und x = ±√(3a): drei Nullstellen.", "x = 0 and x = ±√(3a): three zeros.") },
      ], aWert: 1 }),
  ];
  let f;
  do { f = wahl(liste)(); } while (vorher && f.text === vorher.text);
  return { id: ++zaehler, ...f };
}
function Parameterfaelle() {
  const [au, setAu] = useState(() => fallAufgabe());
  const [stand, setStand] = useState(0);
  const neu = () => { setAu(fallAufgabe(au)); setStand(0); };
  return (
    <div style={{ ...karte, marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        <p style={kicker}>{zw("Parameterfälle", "Parameter cases")}</p>
        <IchHaengeFest kontext={hilfeS(`sch-f-${au.id}`)} />
      </div>
      <p style={{ ...hinweis, color: C.tinte, marginBottom: 4 }}>{DE ? <PT t={au.text.replace("f_a", "fₐ")} /> : au.text.replace("f_a", "fₐ")}</p>
      <SchrittFolge key={au.id} schritte={au.schritte} stand={stand} setStand={setStand} fertigText={zw("Gelöst – mit Probe und Blick auf die Sonderfälle.", "Solved – with a check and an eye on the special cases.")} />
      {stand >= au.schritte.length && <div style={{ marginTop: 10 }}><ScharBild sid={au.sid} a={au.aWert} ortskurve={false} /></div>}
      <GrosserKnopf ghost onClick={neu}>{zw("Neue Aufgabe", "New problem")}</GrosserKnopf>
    </div>
  );
}

const MODI = [["entdecken", zw("Parameter entdecken", "Explore the parameter")], ["punkte", zw("Besondere Punkte", "Special points")], ["faelle", zw("Parameter­fälle", "Parameter cases")]];
export function Funktionsscharen() {
  const [modus, setModus] = useState("entdecken");
  return (
    <Seite titel={zw("Funktionsscharen", "Families of functions")}
      text={zw("Mit dem Regler sehen, wie a den Graphen verändert – und mit der Rechnung begründen: besondere Punkte, Ortskurven und Sonderfälle.", "See with the slider how a changes the graph – and justify it with calculation: special points, loci and special cases.")}>
      <ModusLeiste modi={MODI} modus={modus} setModus={setModus} label={zw("Übungen zu Funktionsscharen", "Exercises on families of functions")} />
      <Aufklapp titel={zw("Kurz erklärt", "In short")}>
        <p style={{ margin: "0 0 6px" }}>{zw("Eine Funktionsschar fₐ enthält einen Parameter", "A family fₐ contains a parameter")} <b style={{ color: PARAM }}>a</b>. {zw("Für jeden Wert von a entsteht eine eigene Funktion von x. Beim Ableiten nach x ist a eine Konstante.", "Each value of a gives its own function of x. When differentiating with respect to x, a is a constant.")}</p>
        <p style={{ margin: "0 0 6px" }}>{zw("Teilst du durch a oder ziehst eine Wurzel, gilt das Ergebnis nur für bestimmte a – die übrigen Fälle (oft a = 0) extra untersuchen.", "If you divide by a or take a root, the result only holds for certain a – examine the remaining cases (often a = 0) separately.")}</p>
        <p style={{ margin: 0 }}>{zw("Beispiel: fₐ(x) = ax² − 4x hat den Scheitel S(2/a | −4/a) für a ≠ 0. Alle Scheitel liegen auf der Ortskurve y = −2x.", "Example: fₐ(x) = ax² − 4x has the vertex S(2/a | −4/a) for a ≠ 0. All vertices lie on the locus y = −2x.")}</p>
      </Aufklapp>
      <div style={{ display: modus === "entdecken" ? "block" : "none" }}><Entdecken /></div>
      <div style={{ display: modus === "punkte" ? "block" : "none" }}><BesonderePunkte /></div>
      <div style={{ display: modus === "faelle" ? "block" : "none" }}><Parameterfaelle /></div>
    </Seite>
  );
}
