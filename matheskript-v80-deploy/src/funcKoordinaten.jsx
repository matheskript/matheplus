/* ============================================================
   Unterstufe · Koordinatensystem und Symmetrie
   · Entdecken – Punkt P verschieben und spiegeln: an der x-Achse, an
     der y-Achse, am Ursprung; die Koordinaten von P′ live
   · Üben – Punkte ablesen, Achsen- und Punktspiegelung (auch an
     einem Zentrum Z), vierten Punkt eines Parallelogramms finden,
     Symmetrieachsen von Figuren zählen
   Mathematik in unterGen.js (getestet).
   ============================================================ */
import React, { useState } from "react";
import { C } from "./base1.jsx";
import { Auswahl, hilfeKontext, karte, kicker, zw } from "./ui2.jsx";
import { KOORD_ARTEN, koordAufgabe } from "./unterGen.js";
import { Merke, Regler, UebenRahmen, WertZeile, ZweiModi, zs } from "./geoUi.jsx";

let zaehler = 0;
const mz = (v) => String(v).replace("-", "−");
const pt = (P) => `(${mz(P[0])} | ${mz(P[1])})`;

export function Gitter({ punkte = [], linien = [], polygone = [], achse = null, hoehe = 260, n = 6 }) {
  const W = 300, s = (W - 20) / (2 * n), X = (x) => W / 2 + x * s, Y = (y) => W / 2 - y * s;
  return (
    <svg viewBox={`0 0 ${W} ${W}`} style={{ width: "100%", maxWidth: hoehe, height: "auto", display: "block", margin: "0 auto" }} role="img" aria-label={zw("Koordinatensystem", "Coordinate system")}>
      {Array.from({ length: 2 * n + 1 }, (_, i) => i - n).map((k) => (
        <g key={k}>
          <line x1={X(k)} y1={Y(-n)} x2={X(k)} y2={Y(n)} stroke={`${C.see}${k ? "18" : "00"}`} />
          <line x1={X(-n)} y1={Y(k)} x2={X(n)} y2={Y(k)} stroke={`${C.see}${k ? "18" : "00"}`} />
          {k && k % 2 === 0 ? <text x={X(k)} y={Y(0) + 13} textAnchor="middle" style={{ fontSize: 9.5, fill: C.grau }}>{mz(k)}</text> : null}
          {k && k % 2 === 0 ? <text x={X(0) - 5} y={Y(k) + 3} textAnchor="end" style={{ fontSize: 9.5, fill: C.grau }}>{mz(k)}</text> : null}
        </g>
      ))}
      <line x1={X(-n)} y1={Y(0)} x2={X(n)} y2={Y(0)} stroke={achse === "x" ? C.gruen : C.tinte} strokeWidth={achse === "x" ? 2.6 : 1.4} />
      <line x1={X(0)} y1={Y(-n)} x2={X(0)} y2={Y(n)} stroke={achse === "y" ? C.gruen : C.tinte} strokeWidth={achse === "y" ? 2.6 : 1.4} />
      <text x={X(n) - 4} y={Y(0) - 6} textAnchor="end" style={{ fontSize: 11, fill: C.tinte, fontWeight: 700 }}>x</text>
      <text x={X(0) + 6} y={Y(n) + 10} style={{ fontSize: 11, fill: C.tinte, fontWeight: 700 }}>y</text>
      {polygone.map((p, i) => <polygon key={i} points={p.pts.map(([x, y]) => `${X(x)},${Y(y)}`).join(" ")} fill={p.fill || `${C.see}18`} stroke={p.farbe || C.see} strokeWidth="1.8" strokeDasharray={p.strich} />)}
      {linien.map((l, i) => <line key={i} x1={X(l[0][0])} y1={Y(l[0][1])} x2={X(l[1][0])} y2={Y(l[1][1])} stroke={l[2] || C.hellgrau} strokeWidth="1.4" strokeDasharray="4 3" />)}
      {punkte.map((p, i) => (
        <g key={i}>
          <circle cx={X(p.P[0])} cy={Y(p.P[1])} r="5" fill={p.farbe || C.see} stroke={C.weiss} strokeWidth="1.2" />
          {p.name && <text x={X(p.P[0]) + 8} y={Y(p.P[1]) - 7} style={{ fontSize: 12.5, fontWeight: 800, fill: p.farbe || C.see }}>{p.name}</text>}
        </g>
      ))}
    </svg>
  );
}

function Entdecken() {
  const [x, setX] = useState(3);
  const [y, setY] = useState(2);
  const [art, setArt] = useState("x");
  const B = art === "x" ? [x, -y] : art === "y" ? [-x, y] : [-x, -y];
  return (
    <div style={{ ...karte, marginTop: 16 }}>
      <p style={kicker}>{zw("Punkt spiegeln", "Reflect a point")}</p>
      <div style={{ display: "grid", gap: 8 }}>
        <Regler name="x" wert={x} setWert={setX} min={-5} max={5} schritt={1} format={mz} />
        <Regler name="y" wert={y} setWert={setY} min={-5} max={5} schritt={1} format={mz} farbe={C.gruen} />
      </div>
      <div style={{ marginTop: 10 }}><Auswahl optionen={[["x", zw("an der x-Achse", "in the x-axis")], ["y", zw("an der y-Achse", "in the y-axis")], ["o", zw("am Ursprung", "in the origin")]]} wert={art} setWert={setArt} label={zw("Spiegelung", "Reflection")} /></div>
      <div style={{ marginTop: 12, background: C.sand, borderRadius: 14, padding: 8 }}>
        <Gitter achse={art === "o" ? null : art} linien={[[[x, y], B, C.gruen]]} punkte={[{ P: [x, y], name: "P" }, { P: B, name: "P′", farbe: "#8A6A00" }, ...(art === "o" ? [{ P: [0, 0], farbe: C.gruen }] : [])]} />
      </div>
      <WertZeile links="P" rechts={pt([x, y])} />
      <WertZeile links="P′" rechts={pt(B)} farbe="#8A6A00" />
      <Merke>{{ x: zw("An der x-Achse: x bleibt, y wechselt das Vorzeichen.", "In the x-axis: x stays, y changes sign."), y: zw("An der y-Achse: y bleibt, x wechselt das Vorzeichen.", "In the y-axis: y stays, x changes sign."), o: zw("Am Ursprung: beide Koordinaten wechseln das Vorzeichen. O ist die Mitte von PP′.", "In the origin: both coordinates change sign. O is the midpoint of PP′.") }[art]}</Merke>
    </div>
  );
}

const TITEL = { ablesen: ["Punkt ablesen", "Read a point"], xachse: ["Spiegeln an der x-Achse", "Reflect in the x-axis"], yachse: ["Spiegeln an der y-Achse", "Reflect in the y-axis"], ursprung: ["Spiegeln am Ursprung", "Reflect in the origin"], punktZ: ["Punktspiegelung an Z", "Point reflection in Z"], viereck: ["Parallelogramm ergänzen", "Complete the parallelogram"], achsen: ["Symmetrieachsen", "Lines of symmetry"] };
const neue = (art) => ({ id: ++zaehler, ...koordAufgabe(art) });
const NAMEN_EN = { "Quadrat": "square", "Rechteck": "rectangle", "Raute": "rhombus", "gleichseitiges Dreieck": "equilateral triangle", "gleichschenkliges Trapez": "isosceles trapezoid", "Parallelogramm": "parallelogram", "Drachenviereck": "kite", "regelmäßiges Sechseck": "regular hexagon" };

function zwei(id, P, wo, extraFehler = []) {
  return [
    zs(`${id}-x`, zw("x-Koordinate", "x-coordinate"), "x =", P[0], zw(`x-Koordinate von ${wo}?`, `x-coordinate of ${wo}?`), { fehler: extraFehler.filter((f) => f.k === 0 && f.wert !== P[0]), erkl: mz(P[0]) }),
    zs(`${id}-y`, zw("y-Koordinate", "y-coordinate"), "y =", P[1], zw(`y-Koordinate von ${wo}?`, `y-coordinate of ${wo}?`), { fehler: extraFehler.filter((f) => f.k === 1 && f.wert !== P[1]), erkl: `${wo} ${pt(P)}` }),
  ];
}

function schritte(k) {
  switch (k.art) {
    case "ablesen": return zwei("ko-a", k.P, "P", [{ k: 0, wert: k.P[1], text: zw("x und y vertauscht: Erst nach rechts/links (x), dann nach oben/unten (y).", "x and y swapped: first right/left (x), then up/down (y).") }, { k: 1, wert: k.P[0], text: zw("x und y vertauscht.", "x and y swapped.") }]);
    case "xachse": case "yachse": case "ursprung": return zwei("ko-s", k.B, "P′", [{ k: 0, wert: -k.B[0], text: zw("Vorzeichen prüfen: Welche Koordinate ändert sich bei dieser Spiegelung?", "Check the sign: which coordinate changes in this reflection?") }, { k: 1, wert: -k.B[1], text: zw("Vorzeichen prüfen: Welche Koordinate ändert sich bei dieser Spiegelung?", "Check the sign: which coordinate changes in this reflection?") }]);
    case "punktZ": return zwei("ko-z", k.B, "P′", [{ k: 0, wert: -k.P[0], text: zw("Das wäre die Spiegelung am Ursprung. Gehe von P zu Z und dann gleich weit weiter.", "That would be reflection in the origin. Go from P to Z and then the same distance further.") }, { k: 1, wert: -k.P[1], text: zw("Das wäre die Spiegelung am Ursprung.", "That would be reflection in the origin.") }]);
    case "viereck": {
      const t = zw("Das ist die falsche Ecke: D liegt gegenüber von B. Gehe von C aus denselben Weg zurück, den du von A nach B gehst.", "That's the wrong corner: D is opposite B. From C go back the same way as from A to B.");
      return zwei("ko-v", k.D, "D", [{ k: 0, wert: k.B[0] + k.C[0] - k.A[0], text: t }, { k: 1, wert: k.B[1] + k.C[1] - k.A[1], text: t }]);
    }
    default: return [zs("ko-ach", zw("Anzahl", "Number"), zw("Achsen:", "Lines:"), k.anzahl, zw(`Wie viele Symmetrieachsen hat ${k.name === "Raute" ? "eine" : "ein"} ${k.name}?`, `How many lines of symmetry does a ${NAMEN_EN[k.name]} have?`), { hinweis: zw("Falte in Gedanken: Wo kommen beide Hälften genau aufeinander?", "Fold it in your mind: where do both halves match exactly?"), erkl: String(k.anzahl), fehler: k.name === "Parallelogramm" ? [{ wert: 2, text: zw("Die Diagonalen sind keine Symmetrieachsen – falte es: Die Hälften passen nicht aufeinander. Es ist punktsymmetrisch.", "The diagonals aren't lines of symmetry – fold it: the halves don't match. It has point symmetry.") }] : k.name === "Rechteck" ? [{ wert: 4, text: zw("Die Diagonalen des Rechtecks sind keine Symmetrieachsen.", "The diagonals of a rectangle are not lines of symmetry.") }] : [] })];
  }
}
function text(k) {
  switch (k.art) {
    case "ablesen": return zw("Lies die Koordinaten des Punktes P ab.", "Read off the coordinates of point P.");
    case "xachse": return zw(`Spiegele P${pt(k.P)} an der x-Achse.`, `Reflect P${pt(k.P)} in the x-axis.`);
    case "yachse": return zw(`Spiegele P${pt(k.P)} an der y-Achse.`, `Reflect P${pt(k.P)} in the y-axis.`);
    case "ursprung": return zw(`Spiegele P${pt(k.P)} am Ursprung.`, `Reflect P${pt(k.P)} in the origin.`);
    case "punktZ": return zw(`Spiegele P${pt(k.P)} am Punkt Z${pt(k.Z)}.`, `Reflect P${pt(k.P)} in the point Z${pt(k.Z)}.`);
    case "viereck": return zw(`A${pt(k.A)}, B${pt(k.B)} und C${pt(k.C)} sind Ecken des Parallelogramms ABCD. Wo liegt D?`, `A${pt(k.A)}, B${pt(k.B)} and C${pt(k.C)} are corners of parallelogram ABCD. Where is D?`);
    default: return zw(`Figur: ${k.name}`, `Figure: ${NAMEN_EN[k.name]}`);
  }
}
function skizze(k) {
  if (k.art === "ablesen") return <Gitter punkte={[{ P: k.P, name: "P" }]} />;
  if (k.art === "viereck") return <Gitter n={6} polygone={[{ pts: [k.A, k.B, k.C], fill: "none", strich: "5 4" }]} punkte={[{ P: k.A, name: "A" }, { P: k.B, name: "B" }, { P: k.C, name: "C" }]} />;
  if (k.art === "punktZ") return <Gitter n={8} punkte={[{ P: k.P, name: "P" }, { P: k.Z, name: "Z", farbe: C.gruen }]} />;
  if (k.art === "achsen") return null;
  return <Gitter achse={k.art === "xachse" ? "x" : k.art === "yachse" ? "y" : null} punkte={[{ P: k.P, name: "P" }]} />;
}
const hilfe = (k) => hilfeKontext({
  id: `koordinaten-${k.art}`, aufgabe: "Koordinatensystem Punkt Koordinaten Achsenspiegelung Punktspiegelung Symmetrie Parallelogramm",
  verstehen: [zw("P(x | y): zuerst x (rechts/links), dann y (oben/unten).", "P(x | y): first x (right/left), then y (up/down).")],
  ansatz: [zw("x-Achse: (x | −y). y-Achse: (−x | y). Ursprung: (−x | −y). Zentrum Z: P′ = 2Z − P.", "x-axis: (x | −y). y-axis: (−x | y). Origin: (−x | −y). Centre Z: P′ = 2Z − P.")],
  regel: [zw("Parallelogramm: Von A nach B ist derselbe Schritt wie von D nach C.", "Parallelogram: from A to B is the same step as from D to C.")],
  pruefen: [zw("Zeichne P′ ein: Liegt es spiegelbildlich?", "Draw P′: is it a mirror image?")],
});

export function Koordinaten() {
  return (
    <ZweiModi titel={zw("Koordinatensystem und Symmetrie", "Coordinates and symmetry")}
      text={zw("Punkte eintragen und ablesen, an Achsen und Punkten spiegeln, Vierecke ergänzen und Symmetrieachsen finden.", "Plot and read points, reflect in axes and points, complete quadrilaterals and find lines of symmetry.")}
      kurz={<p style={{ margin: 0 }}>{zw("Ein Punkt P(x | y): x ist der Rechtswert, y der Hochwert. Achsensymmetrisch: Falten bringt beide Hälften zur Deckung. Punktsymmetrisch: Eine halbe Drehung um das Zentrum bringt die Figur auf sich selbst.", "A point P(x | y): x is the horizontal value, y the vertical value. Line symmetry: folding makes both halves match. Point symmetry: a half turn about the centre maps the figure onto itself.")}</p>}
      entdecken={<Entdecken />}
      ueben={<UebenRahmen titel={TITEL} arten={KOORD_ARTEN} neue={neue} schritte={schritte} text={text} skizze={skizze} hilfe={hilfe} />} />
  );
}
