/* ============================================================
   Mittelstufe · Geometrie: Besondere Linien im Dreieck
   (Konstruktionen: Mittelsenkrechte, Winkelhalbierende, Höhe,
   Seitenhalbierende – Umkreis, Inkreis, Höhenschnittpunkt, Schwerpunkt)
   · Entdecken – Punkt C verschieben, Linienart wählen; die drei
     Linien schneiden sich immer in einem Punkt. Mit Euler-Gerade.
   · Üben – Welche Linie liefert welchen Punkt, Lage des Umkreis-
     mittelpunkts, Schwerpunkt aus Koordinaten, Umkreismittelpunkt im
     rechtwinkligen Dreieck, Inkreisradius, Teilung 2 : 1
   Mathematik in geoMittel2.js (getestet).
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { Auswahl, hilfeKontext, karte, kicker, zw } from "./ui2.jsx";
import { Aufklapp, ModusLeiste, Seite, zt } from "./ui3.jsx";
import { KONSTR_ARTEN, hoehenschnitt, inkreismitte, konstrAufgabe, schwerpunkt, umkreismitte } from "./geoMittel2.js";
import { Merke, Regler, UebenRahmen, Zeichenblatt, add, einheit, laenge, mal, mitte, sub, winkelAn } from "./geoUi.jsx";

let zaehler = 0;
const z2 = (v) => zt(v, 2);

const ART = {
  mittelsenkrechte: { name: zw("Mittelsenkrechten", "Perpendicular bisectors"), punkt: zw("Umkreismittelpunkt U", "Circumcentre U"), farbe: C.see,
    text: zw("Jeder Punkt der Mittelsenkrechten ist von zwei Ecken gleich weit entfernt. Ihr Schnittpunkt U ist von allen drei Ecken gleich weit entfernt – der Mittelpunkt des Umkreises.",
      "Every point on a perpendicular bisector is equally far from two corners. Their intersection U is equally far from all three – the centre of the circumcircle.") },
  winkelhalbierende: { name: zw("Winkelhalbierende", "Angle bisectors"), punkt: zw("Inkreismittelpunkt I", "Incentre I"), farbe: C.smaragd,
    text: zw("Jeder Punkt einer Winkelhalbierenden ist von zwei Seiten gleich weit entfernt. Ihr Schnittpunkt I hat zu allen drei Seiten denselben Abstand – der Mittelpunkt des Inkreises.",
      "Every point on an angle bisector is equally far from two sides. Their intersection I has the same distance to all three sides – the centre of the incircle.") },
  hoehe: { name: zw("Höhen", "Altitudes"), punkt: zw("Höhenschnittpunkt H", "Orthocentre H"), farbe: C.gruen,
    text: zw("Eine Höhe steht senkrecht auf einer Seite und geht durch die gegenüberliegende Ecke. Bei stumpfen Dreiecken liegt H außerhalb – die Höhen müssen verlängert werden.",
      "An altitude is perpendicular to a side and passes through the opposite corner. In obtuse triangles H lies outside – the altitudes must be extended.") },
  seitenhalbierende: { name: zw("Seitenhalbierende", "Medians"), punkt: zw("Schwerpunkt S", "Centroid S"), farbe: "#8A6A00",
    text: zw("Eine Seitenhalbierende verbindet eine Ecke mit der Mitte der Gegenseite. Ihr Schnittpunkt S ist der Schwerpunkt – dort balanciert ein Papierdreieck. S teilt jede Seitenhalbierende im Verhältnis 2 : 1.",
      "A median joins a corner to the midpoint of the opposite side. They meet in the centroid S – where a paper triangle balances. S divides each median in the ratio 2 : 1.") },
};

/* Fußpunkt des Lots von P auf die Gerade QR */
function lotfuss(P, Q, R) {
  const d = sub(R, Q), t = ((P[0] - Q[0]) * d[0] + (P[1] - Q[1]) * d[1]) / (d[0] * d[0] + d[1] * d[1]);
  return add(Q, mal(d, t));
}

function DreieckLinien({ A, B, Cp, art, euler, hoehe = 260 }) {
  const U = umkreismitte(A, B, Cp), Ik = inkreismitte(A, B, Cp), H = hoehenschnitt(A, B, Cp), S = schwerpunkt(A, B, Cp);
  const ecken = [[A, B, Cp], [B, Cp, A], [Cp, A, B]];
  const R = U ? laenge(sub(A, U)) : 0;
  const punkte = [A, B, Cp];
  if (art === "mittelsenkrechte" && U) punkte.push([U[0] - R, U[1] - R], [U[0] + R, U[1] + R]);
  if (art === "hoehe" && H) punkte.push(H);
  if (euler && U && H) punkte.push(U, H);
  const f = ART[art].farbe;
  return (
    <Zeichenblatt punkte={punkte} hoehe={hoehe} rand={22} label={zw("Dreieck mit besonderen Linien", "Triangle with special lines")}
      kinder={(zz) => (
        <>
          {art === "mittelsenkrechte" && U && zz.kreis(U, R, `${f}88`, 1.4, `${f}0A`)}
          {art === "winkelhalbierende" && zz.kreis(Ik.M, Ik.r, `${f}AA`, 1.6, `${f}14`)}
          {zz.vieleck([A, B, Cp], `${C.see}0D`, C.tinte, 2.2)}
          {ecken.map(([P, Q, Rr], i) => {
            if (art === "mittelsenkrechte") {
              const m = mitte(Q, Rr), n = einheit([-(Rr[1] - Q[1]), Rr[0] - Q[0]]);
              return <g key={i}>{zz.linie(add(m, mal(n, -R * 1.1)), add(m, mal(n, R * 1.1)), f, 1.5)}{zz.rechter(m, Rr, add(m, n), f, 7)}</g>;
            }
            if (art === "winkelhalbierende") {
              const b = laenge(sub(P, Rr)), c = laenge(sub(P, Q));
              const D = add(Q, mal(sub(Rr, Q), c / (b + c)));
              return <g key={i}>{zz.linie(P, D, f, 1.5)}</g>;
            }
            if (art === "hoehe") {
              const F = lotfuss(P, Q, Rr);
              const ende = H && laenge(sub(H, P)) > laenge(sub(F, P)) ? H : F;
              return <g key={i}>{zz.linie(Q, F, C.hellgrau, 1.2, "4 3")}{zz.linie(Rr, F, C.hellgrau, 1.2, "4 3")}{zz.linie(P, ende, f, 1.5)}{zz.rechter(F, P, laenge(sub(Q, F)) > 0.01 ? Q : Rr, f, 7)}</g>;
            }
            const Mq = mitte(Q, Rr);
            return <g key={i}>{zz.linie(P, Mq, f, 1.5)}{zz.punkt(Mq, null, 0, 0, f, 2.6)}</g>;
          })}
          {euler && U && H && zz.linie(add(U, mal(sub(H, U), -0.2)), add(H, mal(sub(H, U), 0.2)), C.granaHell, 1.6, "8 4")}
          {(art === "mittelsenkrechte" || euler) && U && zz.punkt(U, "U", 9, -6, C.see, 4)}
          {art === "winkelhalbierende" && zz.punkt(Ik.M, "I", 9, -6, C.smaragd, 4)}
          {(art === "hoehe" || euler) && H && zz.punkt(H, "H", 9, -6, C.gruen, 4)}
          {(art === "seitenhalbierende" || euler) && zz.punkt(S, "S", 9, -6, "#8A6A00", 4)}
          {zz.punkt(A, "A", -8, 14)}{zz.punkt(B, "B", 8, 14)}{zz.punkt(Cp, "C", 0, -10)}
        </>
      )} />
  );
}

function Entdecken() {
  const [art, setArt] = useState("mittelsenkrechte");
  const [cx, setCx] = useState(2.4);
  const [cy, setCy] = useState(3.6);
  const [euler, setEuler] = useState(false);
  const A = [0, 0], B = [6, 0], Cp = [cx, cy];
  const w = [winkelAn(A, B, Cp), winkelAn(B, A, Cp), winkelAn(Cp, A, B)];
  const groesst = Math.max(...w);
  const typ = Math.abs(groesst - 90) < 0.5 ? zw("rechtwinklig", "right-angled") : groesst > 90 ? zw("stumpfwinklig", "obtuse") : zw("spitzwinklig", "acute");
  return (
    <>
      <div style={{ ...karte, marginTop: 16 }}>
        <p style={kicker}>{zw("Linien wählen", "Choose the lines")}</p>
        <Auswahl optionen={Object.keys(ART).map((k) => [k, ART[k].name])} wert={art} setWert={setArt} label={zw("Linienart", "Kind of line")} />
        <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
          <Regler name="C → x" wert={cx} setWert={setCx} min={-1.5} max={7.5} schritt={0.1} breiteName={58} />
          <Regler name="C → y" wert={cy} setWert={setCy} min={1.4} max={6} schritt={0.1} breiteName={58} />
        </div>
        <div style={{ marginTop: 10 }}>
          <Auswahl optionen={[["aus", zw("Ohne Euler-Gerade", "Without Euler line")], ["an", zw("Euler-Gerade zeigen", "Show Euler line")]]} wert={euler ? "an" : "aus"} setWert={(v) => setEuler(v === "an")} label={zw("Euler-Gerade", "Euler line")} />
        </div>
        <div style={{ marginTop: 12, background: C.sand, borderRadius: 14, padding: 6 }}>
          <DreieckLinien A={A} B={B} Cp={Cp} art={art} euler={euler} />
        </div>
        <p style={{ fontSize: 13, color: C.grau, margin: "8px 2px 0" }}>{zw(`Das Dreieck ist gerade ${typ} (größter Winkel ${zt(groesst, 1)}°).`, `The triangle is currently ${typ} (largest angle ${zt(groesst, 1)}°).`)}</p>
      </div>
      <div style={{ ...karte, marginTop: 12 }}>
        <p style={kicker}>{ART[art].punkt}</p>
        <Merke farbe={ART[art].farbe}>{ART[art].text}</Merke>
        {art === "mittelsenkrechte" && <Merke>{zw("Spitzwinklig: U liegt innen. Rechtwinklig: U ist die Mitte der Hypotenuse (Thales). Stumpfwinklig: U liegt außen. Zieh C und schau zu.", "Acute: U lies inside. Right-angled: U is the midpoint of the hypotenuse (Thales). Obtuse: U lies outside. Drag C and watch.")}</Merke>}
        {euler && <Merke farbe={C.granaHell}>{zw("Euler-Gerade: U, S und H liegen immer auf einer Geraden, und S teilt die Strecke UH im Verhältnis 1 : 2.", "Euler line: U, S and H always lie on one line, and S divides UH in the ratio 1 : 2.")}</Merke>}
      </div>
    </>
  );
}

/* ---------- Üben ---------- */
const TITEL = {
  linie: ["Linie und Punkt", "Line and point"], lage: ["Lage des Umkreismittelpunkts", "Position of the circumcentre"], schwerpunkt: ["Schwerpunkt berechnen", "Calculate the centroid"],
  umkreis: ["Umkreismittelpunkt", "Circumcentre"], inkreis: ["Inkreisradius", "Inradius"], teilung: ["Teilung 2 : 1", "Ratio 2 : 1"],
};
const neue = (art) => ({ id: ++zaehler, ...konstrAufgabe(art) });
const PUNKT_OPT = [["mittelsenkrechte", zw("Umkreismittelpunkt", "Circumcentre")], ["winkelhalbierende", zw("Inkreismittelpunkt", "Incentre")], ["hoehe", zw("Höhenschnittpunkt", "Orthocentre")], ["seitenhalbierende", zw("Schwerpunkt", "Centroid")]];
const EIGENSCHAFT = {
  mittelsenkrechte: zw("gleicher Abstand zu allen drei Ecken", "equal distance to all three corners"),
  winkelhalbierende: zw("gleicher Abstand zu allen drei Seiten", "equal distance to all three sides"),
  hoehe: zw("senkrecht zur Gegenseite durch die Ecke", "perpendicular to the opposite side through the corner"),
  seitenhalbierende: zw("Gleichgewichtspunkt, teilt im Verhältnis 2 : 1", "balance point, divides in the ratio 2 : 1"),
};

function schritte(au) {
  if (au.art === "linie") {
    return [
      { id: "ko-l-p", titel: zw("Schnittpunkt", "Intersection"), typ: "wahl", frage: zw(`Was ist der Schnittpunkt der drei ${ART[au.linie].name}?`, `What is the intersection of the three ${ART[au.linie].name.toLowerCase()}?`),
        optionen: PUNKT_OPT, richtig: au.linie,
        fehler: PUNKT_OPT.filter(([k]) => k !== au.linie).map(([k, n]) => ({ wahl: k, text: zw(`Der ${n} entsteht aus den ${ART[k].name}.`, `The ${n.toLowerCase()} comes from the ${ART[k].name.toLowerCase()}.`) })),
        hinweise: [zw("Umkreis ↔ Ecken, Inkreis ↔ Seiten.", "Circumcircle ↔ corners, incircle ↔ sides.")], erklaerung: ART[au.linie].punkt },
      { id: "ko-l-e", titel: zw("Eigenschaft", "Property"), typ: "wahl", frage: zw("Welche Eigenschaft hat dieser Punkt?", "What property does this point have?"),
        optionen: Object.keys(EIGENSCHAFT).map((k) => [k, EIGENSCHAFT[k]]), richtig: au.linie,
        hinweise: [zw("Was ist an jeder einzelnen Linie gleich weit entfernt oder besonders?", "What is equally far away or special for each single line?")], erklaerung: EIGENSCHAFT[au.linie] },
    ];
  }
  if (au.art === "lage") {
    const r = { spitz: "innen", recht: "auf", stumpf: "aussen" }[au.typ];
    return [
      { id: "ko-la-t", titel: zw("Dreiecksart", "Kind of triangle"), typ: "wahl", frage: zw("Was für ein Dreieck ist das?", "What kind of triangle is it?"),
        optionen: [["spitz", zw("spitzwinklig", "acute")], ["recht", zw("rechtwinklig", "right-angled")], ["stumpf", zw("stumpfwinklig", "obtuse")]], richtig: au.typ,
        hinweise: [zw("Entscheidend ist der größte Winkel.", "The largest angle decides.")], erklaerung: zw(`Größter Winkel: ${Math.max(...au.winkel)}°`, `Largest angle: ${Math.max(...au.winkel)}°`) },
      { id: "ko-la-u", titel: zw("Lage von U", "Position of U"), typ: "wahl", frage: zw("Wo liegt der Umkreismittelpunkt?", "Where is the circumcentre?"),
        optionen: [["innen", zw("innerhalb des Dreiecks", "inside the triangle")], ["auf", zw("auf der längsten Seite (in ihrer Mitte)", "on the longest side (at its midpoint)")], ["aussen", zw("außerhalb des Dreiecks", "outside the triangle")]], richtig: r,
        fehler: [{ wahl: r === "innen" ? "aussen" : "innen", text: zw("Probier es im Modus Entdecken: Zieh C, bis der größte Winkel so groß ist wie hier.", "Try it in Explore mode: drag C until the largest angle matches.") }],
        hinweise: [zw("Rechtwinklig: Thales – die Hypotenuse ist Durchmesser.", "Right-angled: Thales – the hypotenuse is the diameter.")],
        erklaerung: { innen: zw("Spitzwinklig → U liegt innen.", "Acute → U lies inside."), auf: zw("Rechtwinklig → U ist die Mitte der Hypotenuse.", "Right-angled → U is the midpoint of the hypotenuse."), aussen: zw("Stumpfwinklig → U liegt außen.", "Obtuse → U lies outside.") }[r] },
    ];
  }
  if (au.art === "schwerpunkt") {
    const sx = au.A[0] + au.B[0] + au.C[0], sy = au.A[1] + au.B[1] + au.C[1];
    return [
      { id: "ko-s-x", titel: zw("x-Koordinate", "x-coordinate"), typ: "zahl", text: "$x_S$ =", wert: au.S[0], toleranz: 1e-9, wertText: String(au.S[0]),
        frage: zw("Der Schwerpunkt ist der Mittelwert der drei Ecken. Berechne $x_S$.", "The centroid is the mean of the three corners. Calculate $x_S$."),
        fehler: [{ wert: sx, text: zw("Das ist die Summe – noch durch 3 teilen.", "That's the sum – divide by 3.") }, { wert: sx / 2, text: zw("Es sind drei Ecken: durch 3, nicht durch 2.", "There are three corners: divide by 3, not 2.") }],
        hinweise: [`(${au.A[0]} + ${au.B[0]} + ${au.C[0]}) : 3`], erklaerung: `$x_S$ = (${au.A[0]} + ${au.B[0]} + ${au.C[0]}) : 3 = ${au.S[0]}` },
      { id: "ko-s-y", titel: zw("y-Koordinate", "y-coordinate"), typ: "zahl", text: "$y_S$ =", wert: au.S[1], toleranz: 1e-9, wertText: String(au.S[1]),
        frage: zw("Und $y_S$?", "And $y_S$?"), fehler: [{ wert: sy, text: zw("Noch durch 3 teilen.", "Divide by 3.") }],
        hinweise: [`(${au.A[1]} + ${au.B[1]} + ${au.C[1]}) : 3`], erklaerung: `$y_S$ = (${au.A[1]} + ${au.B[1]} + ${au.C[1]}) : 3 = ${au.S[1]}  →  S(${au.S[0]} | ${au.S[1]})` },
    ];
  }
  if (au.art === "umkreis") {
    return [
      { id: "ko-u-w", titel: zw("Wo liegt U?", "Where is U?"), typ: "wahl", frage: zw("Das Dreieck hat bei C einen rechten Winkel. Wo liegt der Umkreismittelpunkt?", "The triangle has a right angle at C. Where is the circumcentre?"),
        optionen: [["ab", zw("in der Mitte von AB", "at the midpoint of AB")], ["c", zw("in C", "at C")], ["s", zw("im Schwerpunkt", "at the centroid")]], richtig: "ab",
        hinweise: [zw("Satz des Thales, umgekehrt.", "Thales' theorem, the other way round.")], erklaerung: zw("Mitte der Hypotenuse AB.", "Midpoint of the hypotenuse AB.") },
      { id: "ko-u-x", titel: zw("x-Koordinate", "x-coordinate"), typ: "zahl", text: "$x_U$ =", wert: au.M[0], toleranz: 1e-9, wertText: z2(au.M[0]),
        frage: zw("Berechne die Mitte von AB: x-Koordinate.", "Calculate the midpoint of AB: x-coordinate."), hinweise: [`(${au.A[0]} + ${au.B[0]}) : 2`], erklaerung: `$x_U$ = ${z2(au.M[0])}` },
      { id: "ko-u-y", titel: zw("y-Koordinate", "y-coordinate"), typ: "zahl", text: "$y_U$ =", wert: au.M[1], toleranz: 1e-9, wertText: z2(au.M[1]),
        frage: zw("Und die y-Koordinate.", "And the y-coordinate."), hinweise: [`(${au.A[1]} + ${au.B[1]}) : 2`], erklaerung: `U(${z2(au.M[0])} | ${z2(au.M[1])})` },
    ];
  }
  if (au.art === "inkreis") {
    return [
      { id: "ko-i-a", titel: zw("Fläche", "Area"), typ: "zahl", text: "A =", einheit: "cm²", wert: au.flaeche, toleranz: 1e-9, wertText: z2(au.flaeche),
        frage: zw("Berechne die Fläche des rechtwinkligen Dreiecks.", "Calculate the area of the right triangle."), fehler: [{ wert: au.a * au.b, text: zw("Durch 2 teilen – es ist ein halbes Rechteck.", "Divide by 2 – it's half a rectangle.") }],
        hinweise: [`${au.a} · ${au.b} : 2`], erklaerung: `A = ${au.a} · ${au.b} : 2 = ${au.flaeche} cm²` },
      { id: "ko-i-u", titel: zw("Umfang", "Perimeter"), typ: "zahl", text: "u =", einheit: "cm", wert: au.u, toleranz: 1e-9, wertText: String(au.u),
        frage: zw("Berechne den Umfang.", "Calculate the perimeter."), hinweise: [`${au.a} + ${au.b} + ${au.c}`], erklaerung: `u = ${au.u} cm` },
      { id: "ko-i-r", titel: zw("Inkreisradius", "Inradius"), typ: "zahl", text: "r =", einheit: "cm", wert: au.r, toleranz: 1e-9, wertText: String(au.r),
        frage: zw("Zerlege das Dreieck von I aus in drei Dreiecke mit Höhe r: A = r · u : 2. Berechne r.", "Split the triangle from I into three triangles of height r: A = r · u : 2. Calculate r."),
        fehler: [{ wert: au.flaeche / au.u, text: zw("Das „: 2“ steht in der Formel – r = 2A : u.", "The “: 2” is in the formula – r = 2A : u.") }],
        hinweise: [`r = 2 · ${au.flaeche} : ${au.u}`], erklaerung: `r = 2 · ${au.flaeche} : ${au.u} = ${au.r} cm` },
    ];
  }
  return [
    { id: "ko-t-e", titel: zw("Ecke bis S", "Corner to S"), typ: "zahl", text: zw("Ecke → S =", "corner → S ="), einheit: "cm", wert: au.ecke, toleranz: 1e-9, wertText: z2(au.ecke),
      frage: zw("Wie weit ist S von der Ecke entfernt?", "How far is S from the corner?"),
      fehler: [{ wert: au.s / 2, text: zw("S ist nicht die Mitte. Er teilt im Verhältnis 2 : 1 – zwei Drittel liegen bei der Ecke.", "S is not the midpoint. It divides in the ratio 2 : 1 – two thirds are on the corner side.") }, { wert: au.seite, text: zw("Das ist das kurze Stück zur Seitenmitte.", "That's the short piece to the midpoint of the side.") }],
      hinweise: [`${z2(au.s)} · 2 : 3`], erklaerung: `${z2(au.s)} · 2 : 3 = ${z2(au.ecke)} cm` },
    { id: "ko-t-s", titel: zw("S bis Seitenmitte", "S to midpoint"), typ: "zahl", text: zw("S → Mitte =", "S → midpoint ="), einheit: "cm", wert: au.seite, toleranz: 1e-9, wertText: z2(au.seite),
      frage: zw("Und der Rest bis zur Seitenmitte?", "And the rest to the midpoint of the side?"), hinweise: [`${z2(au.s)} − ${z2(au.ecke)}`], erklaerung: `${z2(au.seite)} cm` },
  ];
}

function text(au) {
  if (au.art === "linie") return zw(`In einem Dreieck werden alle drei ${ART[au.linie].name} gezeichnet.`, `In a triangle all three ${ART[au.linie].name.toLowerCase()} are drawn.`);
  if (au.art === "lage") return zw(`Ein Dreieck hat die Winkel ${au.winkel.map((w) => `${w}°`).join(", ")}.`, `A triangle has the angles ${au.winkel.map((w) => `${w}°`).join(", ")}.`);
  if (au.art === "schwerpunkt") return zw(`Dreieck mit A(${au.A.join(" | ")}), B(${au.B.join(" | ")}), C(${au.C.join(" | ")}). Wo liegt der Schwerpunkt S?`, `Triangle with A(${au.A.join(" | ")}), B(${au.B.join(" | ")}), C(${au.C.join(" | ")}). Where is the centroid S?`);
  if (au.art === "umkreis") return zw(`Dreieck mit A(${au.A.join(" | ")}), B(${au.B.join(" | ")}), C(${au.C.join(" | ")}).`, `Triangle with A(${au.A.join(" | ")}), B(${au.B.join(" | ")}), C(${au.C.join(" | ")}).`);
  if (au.art === "inkreis") return zw(`Ein rechtwinkliges Dreieck hat die Seiten ${au.a} cm, ${au.b} cm und ${au.c} cm. Wie groß ist der Inkreisradius?`, `A right triangle has sides ${au.a} cm, ${au.b} cm and ${au.c} cm. What is the inradius?`);
  return zw(`Eine Seitenhalbierende ist ${z2(au.s)} cm lang.`, `A median is ${z2(au.s)} cm long.`);
}

function skizze(au) {
  if (au.art === "linie") return <DreieckLinien A={[0, 0]} B={[6, 0]} Cp={[2.3, 3.6]} art={au.linie} hoehe={210} />;
  if (au.art === "schwerpunkt" || au.art === "umkreis") {
    const xs = [au.A, au.B, au.C].map((p) => p[0]), ys = [au.A, au.B, au.C].map((p) => p[1]);
    const x0 = Math.min(...xs, 0) - 1, x1 = Math.max(...xs, 0) + 1, y0 = Math.min(...ys, 0) - 1, y1 = Math.max(...ys, 0) + 1;
    return (
      <Zeichenblatt punkte={[[x0, y0], [x1, y1]]} hoehe={210} rand={16} label={zw("Dreieck im Koordinatensystem", "Triangle in a coordinate system")}
        kinder={(zz) => (
          <>
            {Array.from({ length: x1 - x0 + 1 }, (_, i) => zz.linie([x0 + i, y0], [x0 + i, y1], `${C.see}18`, 1, undefined, `v${i}`))}
            {Array.from({ length: y1 - y0 + 1 }, (_, i) => zz.linie([x0, y0 + i], [x1, y0 + i], `${C.see}18`, 1, undefined, `h${i}`))}
            {zz.linie([x0, 0], [x1, 0], C.hellgrau, 1.2)}{zz.linie([0, y0], [0, y1], C.hellgrau, 1.2)}
            {zz.vieleck([au.A, au.B, au.C], `${C.see}14`, C.tinte, 2)}
            {au.art === "umkreis" && zz.rechter(au.C, au.A, au.B, C.tinte, 9)}
            {zz.punkt(au.A, "A", -8, 14)}{zz.punkt(au.B, "B", 8, 14)}{zz.punkt(au.C, "C", 0, -10)}
          </>
        )} />
    );
  }
  return null;
}

const hilfe = (au) => hilfeKontext({
  id: `konstruktion-${au.art}`, aufgabe: "Mittelsenkrechte Winkelhalbierende Höhe Seitenhalbierende Umkreis Inkreis Schwerpunkt Höhenschnittpunkt",
  verstehen: [zw("Welche Linie ist gemeint? Durch eine Ecke oder durch eine Seitenmitte, senkrecht oder nicht?", "Which line is meant? Through a corner or a midpoint, perpendicular or not?")],
  ansatz: [zw("Mittelsenkrechten → Umkreis, Winkelhalbierende → Inkreis, Höhen → H, Seitenhalbierende → S.", "Perpendicular bisectors → circumcircle, angle bisectors → incircle, altitudes → H, medians → S.")],
  regel: [zw("Schwerpunkt = Mittelwert der Ecken; S teilt jede Seitenhalbierende 2 : 1.", "Centroid = mean of the corners; S divides each median 2 : 1.")],
  pruefen: [zw("Liegt dein Punkt plausibel (innen/außen)? Zeichne eine grobe Skizze.", "Is your point plausibly placed (inside/outside)? Make a rough sketch.")],
});

const MODI = [["entdecken", zw("Entdecken", "Explore")], ["ueben", zw("Üben", "Practise")]];

export function Konstruktionen() {
  const [modus, setModus] = useState("entdecken");
  return (
    <Seite titel={zw("Besondere Linien im Dreieck", "Special lines in a triangle")}
      text={zw("Mittelsenkrechte, Winkelhalbierende, Höhe und Seitenhalbierende: Je drei davon treffen sich immer in einem Punkt – Umkreismittelpunkt, Inkreismittelpunkt, Höhenschnittpunkt und Schwerpunkt.",
        "Perpendicular bisectors, angle bisectors, altitudes and medians: each set of three always meets in one point – circumcentre, incentre, orthocentre and centroid.")}>
      <ModusLeiste modi={MODI} modus={modus} setModus={setModus} label={zw("Konstruktionen", "Constructions")} />
      <Aufklapp titel={zw("Kurz erklärt", "In short")}>
        {Object.keys(ART).map((k) => <p key={k} style={{ margin: "0 0 4px" }}><b>{ART[k].name}</b> → {ART[k].punkt}</p>)}
        <p style={{ margin: "6px 0 0" }}>{zw("Konstruieren mit Zirkel: Mittelsenkrechte über zwei gleich große Kreisbögen um die Endpunkte; Winkelhalbierende über einen Bogen um den Scheitel und zwei gleiche Bögen um die Schnittpunkte.", "Constructing with compasses: perpendicular bisector via two equal arcs around the end points; angle bisector via one arc around the vertex and two equal arcs around the intersections.")} <M t="S = \frac{A + B + C}{3}" /></p>
      </Aufklapp>
      <div style={{ display: modus === "entdecken" ? "block" : "none" }}><Entdecken /></div>
      <div style={{ display: modus === "ueben" ? "block" : "none" }}>
        <UebenRahmen titel={TITEL} arten={KONSTR_ARTEN} neue={neue} schritte={schritte} text={text} skizze={skizze} hilfe={hilfe} />
      </div>
    </Seite>
  );
}
