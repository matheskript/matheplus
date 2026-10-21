/* ============================================================
   Mittelstufe · Geometrie: Satz des Pythagoras (Werkzeug)
   · Entdecken – Katheten a, b und Winkel γ einstellen; Quadrate über
     allen drei Seiten. Nur bei γ = 90° gilt a² + b² = c²; sonst sieht
     man, in welche Richtung die Gleichung kippt (Umkehrung).
   · Üben – Hypotenuse, Kathete, Seiten benennen (Dreieck PQR),
     Umkehrung prüfen, Leiter an der Wand, Raumdiagonale im Quader.
   Mathematik in geoMittel.js (getestet). Der Beweis selbst steht in
   „Mathe entdecken → Satz des Pythagoras“ (Link auf der Seite).
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import { startModus } from "./uebenWunsch.js";
import React, { useMemo, useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { FR } from "./funcRegistry.jsx";
import { IchHaengeFest } from "./funcHilfe.jsx";
import { GrosserKnopf, KleinerLink, hilfeKontext, hinweis, karte, kicker, zw } from "./ui2.jsx";
import { Aufklapp, ModusLeiste, Seite, SchrittFolge, zt, EinstellungsPille } from "./ui3.jsx";
import { GRAD, PYTH_ARTEN, pythAufgabe } from "./geoMittel.js";
import { Merke, Regler, WertZeile, Zeichenblatt, add, mal, mitte, sub, EntdeckenZweispaltig } from "./geoUi.jsx";
import { useDesktop } from "./arbeitsflaeche.jsx";
import { AufgabeZweispaltig, ErklaerKarte, GeoDesktop, ReglerD, ReglerKarte, WerteKarte } from "./geoDesktop.jsx";

let zaehler = 0;
const z2 = (v) => zt(v, 2);
const FA = C.flaggold, FB = C.see, FC = C.smaragd;

/* ---------- Quadrate über den Seiten eines Dreiecks ----------
   Liefert die vier Ecken des Quadrats über PQ, nach außen (weg von R). */
function quadrat(P, Q, R) {
  const d = sub(Q, P);
  let n = [-d[1], d[0]];
  const zuR = sub(R, P);
  if (n[0] * zuR[0] + n[1] * zuR[1] > 0) n = mal(n, -1);
  return [P, Q, add(Q, n), add(P, n)];
}
const schwer = (pts) => mal(pts.reduce((s, p) => add(s, p), [0, 0]), 1 / pts.length);

/* ---------- Modus 1: Entdecken ---------- */
function Entdecken() {
  const [a, setA] = useState(3);
  const [b, setB] = useState(4);
  const [g, setG] = useState(90);
  /* C im Ursprung, B auf der x-Achse (CB = a), A unter dem Winkel γ (CA = b) */
  const Cp = [0, 0], B = [a, 0], A = [b * Math.cos(g * GRAD), b * Math.sin(g * GRAD)];
  const c = Math.hypot(A[0] - B[0], A[1] - B[1]);
  const qa = quadrat(Cp, B, A), qb = quadrat(A, Cp, B), qc = quadrat(B, A, Cp);
  const summe = a * a + b * b, c2 = c * c;
  const recht = Math.abs(g - 90) < 0.01;
  const zeichen = recht ? "=" : c2 < summe ? "<" : ">";
  const desktop = useDesktop();
  const bild = (hoehe) => (
          <Zeichenblatt punkte={[...qa, ...qb, ...qc]} hoehe={hoehe} rand={14}
            label={zw("Dreieck mit Quadraten über allen drei Seiten", "Triangle with squares on all three sides")}
            kinder={(zz) => (
              <>
                {zz.vieleck(qa, `${FA}55`, FA, 1.4)}
                {zz.vieleck(qb, `${FB}30`, FB, 1.4)}
                {zz.vieleck(qc, `${FC}30`, FC, 1.4)}
                {zz.vieleck([A, B, Cp], C.weiss, C.tinte, 2.2)}
                {recht ? zz.rechter(Cp, B, A, C.gruen) : zz.bogen(Cp, B, A, `${zt(g, 0)}°`, C.gruen, 16)}
                {zz.text(schwer(qa), `a² = ${z2(a * a)}`, "#6B5200", 12)}
                {zz.text(schwer(qb), `b² = ${z2(b * b)}`, C.seeTief, 12)}
                {zz.text(schwer(qc), `c² = ${z2(c2)}`, "#0B5E43", 12)}
                {zz.punkt(Cp, "C", -10, 14)}
                {zz.punkt(A, "A", -10, -6)}
                {zz.punkt(B, "B", 10, 14)}
              </>
            )} />
  );
  const gleichung = <M t={`a² + b² ${zeichen === "<" ? ">" : zeichen === ">" ? "<" : "="} c²`} />;
  const merkText = recht
            ? zw("Rechter Winkel bei C: Die beiden Kathetenquadrate zusammen sind genau so groß wie das Hypotenusenquadrat. Das ist der Satz des Pythagoras.",
              "Right angle at C: the two squares on the legs together are exactly as large as the square on the hypotenuse. That is Pythagoras' theorem.")
            : g < 90
              ? zw(`γ = ${zt(g, 0)}° ist spitz: c² ist kleiner als a² + b². Stell γ auf 90° – erst dann gilt die Gleichheit.`, `γ = ${zt(g, 0)}° is acute: c² is smaller than a² + b². Set γ to 90° – only then do they match.`)
              : zw(`γ = ${zt(g, 0)}° ist stumpf: c² ist größer als a² + b². Umgekehrt heißt das: Gilt a² + b² = c², dann ist der Winkel genau 90° (Umkehrung).`, `γ = ${zt(g, 0)}° is obtuse: c² is larger than a² + b². Conversely: if a² + b² = c², the angle is exactly 90° (converse).`);
  const beweisLink = (
          <KleinerLink onClick={() => FR.gehe && FR.gehe({ ansicht: "entdecken", seite: "pythagoras" })}>
            {zw("Warum gilt das? Beweis selbst herleiten in Mathe entdecken ›", "Why is that true? Derive the proof yourself in Discover maths ›")}
          </KleinerLink>
  );
  const werte = <>
    <WertZeile links={<M t="a² + b²" />} rechts={z2(summe)} />
    <WertZeile links={<M t="c²" />} rechts={z2(c2)} farbe="#0B5E43" />
  </>;
  if (desktop) {
    return (
      <GeoDesktop
        links={<>
          <ReglerKarte titel={zw("Dreieck einstellen", "Set up the triangle")}>
            <ReglerD name="a" wert={a} setWert={setA} min={1} max={6} schritt={0.5} farbe="#8A6A00" />
            <ReglerD name="b" wert={b} setWert={setB} min={1} max={6} schritt={0.5} farbe={FB} />
            <ReglerD name="γ" wert={g} setWert={setG} min={50} max={130} schritt={1} farbe={C.gruen} format={(v) => `${zt(v, 0)}°`} />
          </ReglerKarte>
          <WerteKarte titel={zw("Vergleich der Flächen", "Comparing the areas")}>
            {werte}
            <div data-pyth-gleichung style={{ textAlign: "center", fontSize: 22, fontWeight: 800, color: recht ? C.smaragd : C.gruen, padding: "12px 0 6px" }}>{gleichung}</div>
          </WerteKarte>
        </>}
        bild={bild(380)}
        unten={<ErklaerKarte farbe={recht ? C.smaragd : C.gruen}>
          {merkText}
          <div style={{ marginTop: 10 }}>{beweisLink}</div>
        </ErklaerKarte>} />
    );
  }
  return (
    <>
      <div style={{ ...karte, marginTop: 16 }}>
        <EntdeckenZweispaltig
          steuerung={<>
        <p style={kicker}>{zw("Dreieck einstellen", "Set up the triangle")}</p>
        <div style={{ display: "grid", gap: 10 }}>
          <Regler name="a" wert={a} setWert={setA} min={1} max={6} schritt={0.5} farbe="#8A6A00" />
          <Regler name="b" wert={b} setWert={setB} min={1} max={6} schritt={0.5} farbe={FB} />
          <Regler name="γ" wert={g} setWert={setG} min={50} max={130} schritt={1} farbe={C.gruen} format={(v) => `${zt(v, 0)}°`} />
        </div>
          <div style={{ marginTop: 12 }} />
        <p style={kicker}>{zw("Vergleich der Flächen", "Comparing the areas")}</p>
        {werte}
          </>}
          bild={
        <div style={{ background: C.sand, borderRadius: 14, padding: 6 }}>
          {bild(300)}
        </div>
          }
          unten={<>
        <div style={{ textAlign: "center", fontSize: 26, fontWeight: 800, color: recht ? C.smaragd : C.gruen, margin: "10px 0 2px" }}>
          {gleichung}
        </div>
        <Merke farbe={recht ? C.smaragd : C.gruen}>
          {merkText}
        </Merke>
        <div style={{ marginTop: 10 }}>
          {beweisLink}
        </div>
          </>}
        />
      </div>
    </>
  );
}

/* ---------- Skizzen für die Übungen ---------- */
/* Rechtwinkliges Dreieck, rechter Winkel bei R; Seitenwerte als Text oder "?" */
function RechtSkizze({ k1, k2, namen = ["A", "B", "C"], werte = {}, hoehe = 200 }) {
  /* namen: [Ecke an Kathete k1, Ecke an Kathete k2, Ecke mit rechtem Winkel] */
  const R = [0, 0], P = [k1, 0], Q = [0, k2];
  return (
    <Zeichenblatt punkte={[R, P, Q]} hoehe={hoehe} rand={38} label={zw("Skizze: rechtwinkliges Dreieck", "Sketch: right triangle")}
      kinder={(zz) => (
        <>
          {zz.vieleck([R, P, Q], `${C.see}10`, C.tinte, 2)}
          {zz.rechter(R, P, Q, C.gruen)}
          {zz.mass(R, P, werte.k1, 1)}
          {zz.mass(R, Q, werte.k2, -1)}
          {zz.mass(P, Q, werte.h, 1, C.smaragd)}
          {zz.punkt(P, namen[0], 8, 16)}
          {zz.punkt(Q, namen[1], -10, -4)}
          {zz.punkt(R, namen[2], -10, 16)}
        </>
      )} />
  );
}

function LeiterSkizze({ au }) {
  const W0 = [0, 0], F = [au.boden, 0], O = [0, au.hoehe];
  return (
    <Zeichenblatt punkte={[W0, F, O, [-0.6, 0], [au.boden + 0.6, 0], [0, au.hoehe + 0.3]]} hoehe={210} rand={30} label={zw("Skizze: Leiter an einer Wand", "Sketch: ladder against a wall")}
      kinder={(zz) => (
        <>
          {zz.vieleck([[-0.45, 0], [0, 0], [0, au.hoehe + 0.3], [-0.45, au.hoehe + 0.3]], `${C.hellgrau}55`, "none")}
          {zz.linie([-0.6, 0], [au.boden + 0.6, 0], C.grau, 1.4)}
          {zz.linie(F, O, "#8A6A00", 4)}
          {zz.rechter(W0, F, O, C.gruen)}
          {zz.mass(W0, F, `${z2(au.boden)} m`, 1)}
          {zz.mass(F, O, `${z2(au.leiter)} m`, 1, "#8A6A00")}
          {zz.mass(W0, O, "?", -1)}
        </>
      )} />
  );
}

function QuaderSkizze({ au }) {
  /* Schrägbild: Tiefe unter 35° auf halbe Länge verkürzt */
  const k = 0.5, w = 35 * GRAD;
  const t = [au.b * k * Math.cos(w), au.b * k * Math.sin(w)];
  const p = (x, y, zz) => [x + zz * t[0], y + zz * t[1]];
  const E = { A: p(0, 0, 0), B: p(au.a, 0, 0), C: p(au.a, 0, 1), D: p(0, 0, 1) };
  const H = { A: [E.A[0], E.A[1] + au.h], B: [E.B[0], E.B[1] + au.h], C: [E.C[0], E.C[1] + au.h], D: [E.D[0], E.D[1] + au.h] };
  return (
    <Zeichenblatt punkte={[...Object.values(E), ...Object.values(H)]} hoehe={220} rand={30} label={zw("Schrägbild eines Quaders mit Raumdiagonale", "Oblique drawing of a cuboid with space diagonal")}
      kinder={(zz) => (
        <>
          {zz.linie(E.A, E.D, C.hellgrau, 1.3, "4 3")}{zz.linie(E.D, E.C, C.hellgrau, 1.3, "4 3")}{zz.linie(E.D, H.D, C.hellgrau, 1.3, "4 3")}
          {zz.linie(E.A, E.B, C.tinte, 1.8)}{zz.linie(E.B, E.C, C.tinte, 1.8)}
          {zz.linie(H.A, H.B, C.tinte, 1.8)}{zz.linie(H.B, H.C, C.tinte, 1.8)}{zz.linie(H.C, H.D, C.tinte, 1.8)}{zz.linie(H.D, H.A, C.tinte, 1.8)}
          {zz.linie(E.A, H.A, C.tinte, 1.8)}{zz.linie(E.B, H.B, C.tinte, 1.8)}{zz.linie(E.C, H.C, C.tinte, 1.8)}
          {zz.linie(E.A, E.C, C.see, 2.2, "6 4")}
          {zz.linie(E.A, H.C, C.smaragd, 2.6)}
          {zz.linie(E.C, H.C, C.gruen, 2.6)}
          {zz.mass(E.A, E.B, `${au.a}`, 1)}
          {zz.mass(E.B, E.C, `${au.b}`, 1)}
          {zz.mass(E.B, H.B, `${au.h}`, 1)}
          {zz.text(mitte(E.A, E.C), "e", C.see, 13)}
          {zz.text(add(mitte(E.A, H.C), [-0.35, 0.35]), "d", "#0B5E43", 14)}
        </>
      )} />
  );
}

/* ---------- Modus 2: Üben ---------- */
export function neueAufgabe(art) {
  return { id: ++zaehler, ...pythAufgabe(art) };
}

const gl = (t) => <M key={t} t={t} />;

export function schritteVon(au) {
  if (au.art === "hyp") {
    const glattC = Math.abs(au.c - Math.round(au.c * 100) / 100) < 1e-9;
    return [
      { id: "py-hyp-gl", titel: zw("Gleichung aufstellen", "Set up the equation"), typ: "wahl",
        frage: zw("Der rechte Winkel liegt bei C, gesucht ist die Hypotenuse c. Welche Gleichung gilt?", "The right angle is at C and you need the hypotenuse c. Which equation holds?"),
        optionen: [["a", gl("c² = a² + b²")], ["b", gl("a² = b² + c²")], ["c", gl("c = a + b")]], richtig: "a",
        fehler: [{ wahl: "b", text: zw("Allein steht immer das Quadrat der Hypotenuse – der Seite gegenüber dem rechten Winkel. Das ist hier c.", "The square of the hypotenuse – the side opposite the right angle – stands alone. Here that is c.") },
          { wahl: "c", text: zw("Pythagoras addiert Quadrate, nicht die Seiten selbst. Zwei Seiten zusammen sind immer länger als die dritte.", "Pythagoras adds squares, not the sides themselves. Two sides together are always longer than the third.") }],
        hinweise: [zw("Die Hypotenuse liegt dem rechten Winkel gegenüber.", "The hypotenuse is opposite the right angle.")],
        erklaerung: zw("c² = a² + b², weil c dem rechten Winkel gegenüberliegt.", "c² = a² + b², because c is opposite the right angle.") },
      { id: "py-hyp-q", titel: zw("Quadrate addieren", "Add the squares"), typ: "zahl", text: "c² =", wert: au.a * au.a + au.b * au.b, toleranz: 1e-6, wertText: z2(au.a * au.a + au.b * au.b),
        frage: zw("Berechne c².", "Calculate c²."),
        fehler: [{ wert: (au.a + au.b) ** 2, text: zw("Du hast (a + b)² gerechnet. Quadriere jede Seite einzeln und addiere dann.", "You computed (a + b)². Square each side separately, then add.") },
          { wert: 2 * au.a + 2 * au.b, text: zw("Quadrieren heißt mit sich selbst malnehmen, nicht verdoppeln.", "Squaring means multiplying by itself, not doubling.") }],
        hinweise: [`${z2(au.a)}² + ${z2(au.b)}²`],
        erklaerung: `c² = ${z2(au.a)}² + ${z2(au.b)}² = ${z2(au.a * au.a)} + ${z2(au.b * au.b)} = ${z2(au.a * au.a + au.b * au.b)}` },
      { id: "py-hyp-w", titel: zw("Wurzel ziehen", "Take the square root"), typ: "zahl", text: "c =", einheit: "cm", wert: au.c, toleranz: glattC ? 1e-6 : 0.011, wertText: z2(au.c),
        frage: zw("Berechne c.", "Calculate c."), rundung: glattC ? null : zw("Runde auf zwei Nachkommastellen.", "Round to two decimal places."),
        fehler: [{ wert: au.a * au.a + au.b * au.b, toleranz: 1e-6, text: zw("Das ist noch c². Zieh die Wurzel.", "That is still c². Take the square root.") },
          { wert: au.a + au.b, toleranz: 1e-6, text: zw("a + b ist zu lang – die Hypotenuse ist immer kürzer als beide Katheten zusammen.", "a + b is too long – the hypotenuse is always shorter than both legs together.") }],
        hinweise: [zw(`c = √${z2(au.a * au.a + au.b * au.b)}`, `c = √${z2(au.a * au.a + au.b * au.b)}`)],
        erklaerung: `c = √${z2(au.a * au.a + au.b * au.b)} ${glattC ? "=" : "≈"} ${z2(au.c)} cm` },
    ];
  }
  if (au.art === "kath") {
    const b2 = au.c * au.c - au.a * au.a, glatt = Math.abs(au.b - Math.round(au.b * 100) / 100) < 1e-9;
    return [
      { id: "py-kat-gl", titel: zw("Gleichung umstellen", "Rearrange the equation"), typ: "wahl",
        frage: zw("Bekannt sind die Hypotenuse c und die Kathete a. Welche Gleichung gilt für b²?", "You know the hypotenuse c and the leg a. Which equation holds for b²?"),
        optionen: [["a", gl("b² = c² + a²")], ["b", gl("b² = c² − a²")], ["c", gl("b² = a² − c²")]], richtig: "b",
        fehler: [{ wahl: "a", text: zw("Die Kathete ist kürzer als die Hypotenuse – also muss etwas abgezogen werden: b² = c² − a².", "The leg is shorter than the hypotenuse – so something has to be subtracted: b² = c² − a².") },
          { wahl: "c", text: zw("Andersherum: a² − c² wäre negativ, weil c die längste Seite ist.", "The other way round: a² − c² would be negative because c is the longest side.") }],
        hinweise: [zw("Starte bei a² + b² = c² und bringe a² auf die andere Seite.", "Start from a² + b² = c² and move a² to the other side.")],
        erklaerung: zw("Aus a² + b² = c² folgt b² = c² − a².", "From a² + b² = c² it follows that b² = c² − a².") },
      { id: "py-kat-q", titel: zw("Differenz der Quadrate", "Difference of the squares"), typ: "zahl", text: "b² =", wert: b2, toleranz: 1e-6, wertText: z2(b2),
        frage: zw("Berechne b².", "Calculate b²."),
        fehler: [{ wert: au.c * au.c + au.a * au.a, text: zw("Du hast addiert. Bei der Kathete wird subtrahiert.", "You added. For a leg you subtract.") },
          { wert: (au.c - au.a) ** 2, text: zw("Du hast (c − a)² gerechnet. Erst quadrieren, dann subtrahieren.", "You computed (c − a)². Square first, then subtract.") }],
        hinweise: [`${z2(au.c)}² − ${z2(au.a)}²`],
        erklaerung: `b² = ${z2(au.c)}² − ${z2(au.a)}² = ${z2(au.c * au.c)} − ${z2(au.a * au.a)} = ${z2(b2)}` },
      { id: "py-kat-w", titel: zw("Wurzel ziehen", "Take the square root"), typ: "zahl", text: "b =", einheit: "cm", wert: au.b, toleranz: glatt ? 1e-6 : 0.011, wertText: z2(au.b),
        frage: zw("Berechne b.", "Calculate b."), rundung: glatt ? null : zw("Runde auf zwei Nachkommastellen.", "Round to two decimal places."),
        fehler: [{ wert: b2, toleranz: 1e-6, text: zw("Das ist noch b². Zieh die Wurzel.", "That is still b². Take the square root.") },
          { wert: au.c - au.a, toleranz: 1e-6, text: zw("c − a ist nicht die Kathete. Die Wurzel zieht man erst am Ende, aus der ganzen Differenz.", "c − a is not the leg. Take the root at the end, of the whole difference.") }],
        hinweise: [`b = √${z2(b2)}`],
        erklaerung: `b = √${z2(b2)} ${glatt ? "=" : "≈"} ${z2(au.b)} cm` },
    ];
  }
  if (au.art === "benennung") {
    const opt = [au.hyp, au.k1, au.k2].sort().map((s) => [s, s]);
    const gegeben = au.gesuchtHyp ? `${au.k1} = ${z2(au.l1)}, ${au.k2} = ${z2(au.l2)}` : `${au.hyp} = ${z2(au.l3)}, ${au.k1} = ${z2(au.l1)}`;
    const gesucht = au.gesuchtHyp ? au.hyp : au.k2;
    return [
      { id: "py-ben-hyp", titel: zw("Hypotenuse finden", "Find the hypotenuse"), typ: "wahl",
        frage: zw(`Der rechte Winkel liegt bei ${au.recht}. Welche Seite ist die Hypotenuse?`, `The right angle is at ${au.recht}. Which side is the hypotenuse?`),
        optionen: opt, richtig: au.hyp,
        fehler: [au.k1, au.k2].map((k) => ({ wahl: k, text: zw(`${k} geht durch ${au.recht} – sie ist ein Schenkel des rechten Winkels, also eine Kathete.`, `${k} passes through ${au.recht} – it is an arm of the right angle, so a leg.`) })),
        hinweise: [zw("Die Hypotenuse berührt den rechten Winkel nicht – sie liegt ihm gegenüber.", "The hypotenuse does not touch the right angle – it lies opposite it.")],
        erklaerung: zw(`${au.hyp} liegt ${au.recht} gegenüber, also ist ${au.hyp} die Hypotenuse.`, `${au.hyp} is opposite ${au.recht}, so ${au.hyp} is the hypotenuse.`) },
      { id: "py-ben-wert", titel: zw("Fehlende Seite", "Missing side"), typ: "zahl", text: `${gesucht} =`, einheit: "cm", wert: au.wert, toleranz: 1e-6, wertText: z2(au.wert),
        frage: zw(`Gegeben: ${gegeben} (in cm). Berechne ${gesucht}.`, `Given: ${gegeben} (in cm). Calculate ${gesucht}.`),
        fehler: au.gesuchtHyp
          ? [{ wert: Math.sqrt(Math.abs(au.l2 ** 2 - au.l1 ** 2)), toleranz: 0.011, text: zw(`Gesucht ist die Hypotenuse – da wird addiert, nicht subtrahiert.`, `You need the hypotenuse – add, don't subtract.`) }]
          : [{ wert: Math.sqrt(au.l3 ** 2 + au.l1 ** 2), toleranz: 0.011, text: zw(`${au.k2} ist eine Kathete – da wird von der Hypotenuse subtrahiert.`, `${au.k2} is a leg – subtract from the hypotenuse.`) }],
        hinweise: [au.gesuchtHyp ? `${au.hyp}² = ${au.k1}² + ${au.k2}²` : `${au.k2}² = ${au.hyp}² − ${au.k1}²`],
        erklaerung: au.gesuchtHyp
          ? `${au.hyp} = √(${z2(au.l1)}² + ${z2(au.l2)}²) = √${z2(au.l1 ** 2 + au.l2 ** 2)} = ${z2(au.l3)} cm`
          : `${au.k2} = √(${z2(au.l3)}² − ${z2(au.l1)}²) = √${z2(au.l3 ** 2 - au.l1 ** 2)} = ${z2(au.l2)} cm` },
    ];
  }
  if (au.art === "umkehr") {
    return [
      { id: "py-um-lang", titel: zw("Längste Seite", "Longest side"), typ: "wahl",
        frage: zw("Wenn das Dreieck rechtwinklig ist – welche Seite müsste dann die Hypotenuse sein?", "If the triangle is right-angled – which side would have to be the hypotenuse?"),
        optionen: au.seiten.map((s, i) => [String(i), `${z2(s)} cm`]), richtig: String(au.seiten.indexOf(au.lang)),
        hinweise: [zw("Die Hypotenuse ist immer die längste Seite.", "The hypotenuse is always the longest side.")],
        erklaerung: zw(`Die längste Seite: ${z2(au.lang)} cm.`, `The longest side: ${z2(au.lang)} cm.`) },
      { id: "py-um-sum", titel: zw("Kurze Seiten quadrieren", "Square the short sides"), typ: "zahl", text: `${z2(au.kurz1)}² + ${z2(au.kurz2)}² =`, wert: au.summe, toleranz: 1e-6, wertText: z2(au.summe),
        frage: zw("Berechne die Summe der Quadrate der beiden kürzeren Seiten.", "Add the squares of the two shorter sides."),
        hinweise: [`${z2(au.kurz1 ** 2)} + ${z2(au.kurz2 ** 2)}`], erklaerung: `${z2(au.kurz1 ** 2)} + ${z2(au.kurz2 ** 2)} = ${z2(au.summe)}` },
      { id: "py-um-q", titel: zw("Lange Seite quadrieren", "Square the long side"), typ: "zahl", text: `${z2(au.lang)}² =`, wert: au.quadrat, toleranz: 1e-6, wertText: z2(au.quadrat),
        frage: zw("Berechne das Quadrat der längsten Seite.", "Square the longest side."), hinweise: [`${z2(au.lang)} · ${z2(au.lang)}`], erklaerung: `${z2(au.lang)}² = ${z2(au.quadrat)}` },
      { id: "py-um-ent", titel: zw("Entscheiden", "Decide"), typ: "wahl",
        frage: zw(`${z2(au.summe)} und ${z2(au.quadrat)} – ist das Dreieck rechtwinklig?`, `${z2(au.summe)} and ${z2(au.quadrat)} – is the triangle right-angled?`),
        optionen: [["ja", zw("Ja, rechtwinklig", "Yes, right-angled")], ["nein", zw("Nein", "No")]], richtig: au.ja ? "ja" : "nein",
        fehler: [{ wahl: au.ja ? "nein" : "ja", text: au.ja ? zw("Beide Werte sind gleich – nach der Umkehrung des Satzes ist das Dreieck rechtwinklig.", "Both values are equal – by the converse the triangle is right-angled.") : zw("Die Werte sind verschieden. Nur bei Gleichheit gibt es einen rechten Winkel.", "The values differ. There is a right angle only if they are equal.") }],
        hinweise: [zw("Umkehrung: Gilt a² + b² = c², dann ist der Winkel gegenüber c ein rechter.", "Converse: if a² + b² = c², the angle opposite c is a right angle.")],
        erklaerung: au.ja ? zw(`${z2(au.summe)} = ${z2(au.quadrat)} → rechtwinklig (Umkehrung des Satzes des Pythagoras).`, `${z2(au.summe)} = ${z2(au.quadrat)} → right-angled (converse of Pythagoras' theorem).`)
          : zw(`${z2(au.summe)} ≠ ${z2(au.quadrat)} → nicht rechtwinklig. (${au.summe > au.quadrat ? "Größer: alle Winkel spitz." : "Kleiner: ein stumpfer Winkel."})`, `${z2(au.summe)} ≠ ${z2(au.quadrat)} → not right-angled. (${au.summe > au.quadrat ? "Greater: all angles acute." : "Smaller: one obtuse angle."})`) },
    ];
  }
  if (au.art === "leiter") {
    return [
      { id: "py-lei-hyp", titel: zw("Hypotenuse erkennen", "Spot the hypotenuse"), typ: "wahl",
        frage: zw("Wand und Boden bilden einen rechten Winkel. Welche Strecke ist die Hypotenuse?", "Wall and floor form a right angle. Which length is the hypotenuse?"),
        optionen: [["leiter", zw("die Leiter", "the ladder")], ["wand", zw("die Höhe an der Wand", "the height on the wall")], ["boden", zw("der Abstand am Boden", "the distance on the floor")]], richtig: "leiter",
        fehler: [{ wahl: "wand", text: zw("Die Höhe an der Wand ist ein Schenkel des rechten Winkels – also eine Kathete.", "The height on the wall is an arm of the right angle – so a leg.") },
          { wahl: "boden", text: zw("Der Boden ist ein Schenkel des rechten Winkels – also eine Kathete.", "The floor is an arm of the right angle – so a leg.") }],
        hinweise: [zw("Welche Strecke liegt dem rechten Winkel unten an der Wand gegenüber?", "Which length lies opposite the right angle at the foot of the wall?")],
        erklaerung: zw("Die Leiter liegt dem rechten Winkel gegenüber – sie ist die Hypotenuse.", "The ladder is opposite the right angle – it is the hypotenuse.") },
      { id: "py-lei-h", titel: zw("Höhe berechnen", "Calculate the height"), typ: "zahl", text: "h =", einheit: "m", wert: au.hoehe, toleranz: 0.011, wertText: z2(au.hoehe),
        frage: zw("Wie hoch reicht die Leiter an der Wand?", "How high up the wall does the ladder reach?"),
        fehler: [{ wert: Math.sqrt(au.leiter ** 2 + au.boden ** 2), toleranz: 0.011, text: zw("Höher als die Leiter lang ist, geht nicht. Gesucht ist eine Kathete – subtrahieren.", "It can't reach higher than the ladder is long. You need a leg – subtract.") }],
        hinweise: [`h² = ${z2(au.leiter)}² − ${z2(au.boden)}²`],
        erklaerung: `h = √(${z2(au.leiter)}² − ${z2(au.boden)}²) = √${z2(au.leiter ** 2 - au.boden ** 2)} = ${z2(au.hoehe)} m` },
    ];
  }
  /* raum */
  const e2 = au.a * au.a + au.b * au.b;
  return [
    { id: "py-raum-e", titel: zw("Diagonale der Grundfläche", "Diagonal of the base"), typ: "zahl", text: "e² =", wert: e2, toleranz: 1e-6, wertText: z2(e2),
      frage: zw("Die Grundfläche ist ein Rechteck. Berechne das Quadrat ihrer Diagonale e.", "The base is a rectangle. Calculate the square of its diagonal e."),
      fehler: [{ wert: e2 + au.h * au.h, text: zw("Das ist schon d². Die Grundfläche hat nur die Seiten a und b.", "That is already d². The base only has sides a and b.") }],
      hinweise: [`e² = ${au.a}² + ${au.b}²`], erklaerung: `e² = ${au.a}² + ${au.b}² = ${z2(e2)}` },
    { id: "py-raum-d", titel: zw("Raumdiagonale", "Space diagonal"), typ: "zahl", text: "d =", einheit: "cm", wert: au.d, toleranz: 1e-6, wertText: z2(au.d),
      frage: zw("e, die Höhe h und die Raumdiagonale d bilden ein rechtwinkliges Dreieck. Berechne d.", "e, the height h and the space diagonal d form a right triangle. Calculate d."),
      fehler: [{ wert: Math.sqrt(e2), toleranz: 0.011, text: zw("Das ist e, die Diagonale der Grundfläche. Jetzt kommt noch die Höhe dazu.", "That is e, the base diagonal. Now add the height.") },
        { wert: e2 + au.h * au.h, toleranz: 1e-6, text: zw("Das ist d². Zieh noch die Wurzel.", "That is d². Take the square root.") }],
      hinweise: [`d² = e² + h² = ${z2(e2)} + ${au.h}²`],
      erklaerung: `d = √(${z2(e2)} + ${au.h}²) = √${z2(e2 + au.h * au.h)} = ${z2(au.d)} cm` },
  ];
}

function aufgabenText(au) {
  if (au.art === "hyp") return zw(`Im Dreieck ABC ist γ = 90°. Gegeben: a = ${z2(au.a)} cm, b = ${z2(au.b)} cm. Berechne die Hypotenuse c.`, `In triangle ABC, γ = 90°. Given: a = ${z2(au.a)} cm, b = ${z2(au.b)} cm. Find the hypotenuse c.`);
  if (au.art === "kath") return zw(`Im Dreieck ABC ist γ = 90°. Gegeben: c = ${z2(au.c)} cm, a = ${z2(au.a)} cm. Berechne die Kathete b.`, `In triangle ABC, γ = 90°. Given: c = ${z2(au.c)} cm, a = ${z2(au.a)} cm. Find the leg b.`);
  if (au.art === "benennung") return zw(`Im Dreieck PQR liegt der rechte Winkel bei ${au.recht}. Die Seiten heißen nach ihren Endpunkten (z. B. PQ).`, `In triangle PQR the right angle is at ${au.recht}. Sides are named by their end points (e.g. PQ).`);
  if (au.art === "umkehr") return zw(`Ein Dreieck hat die Seiten ${au.seiten.map((s) => `${z2(s)} cm`).join(", ")}. Ist es rechtwinklig?`, `A triangle has the sides ${au.seiten.map((s) => `${z2(s)} cm`).join(", ")}. Is it right-angled?`);
  if (au.art === "leiter") return zw(`Eine ${z2(au.leiter)} m lange Leiter lehnt an einer senkrechten Wand. Ihr Fuß steht ${z2(au.boden)} m von der Wand entfernt.`, `A ladder ${z2(au.leiter)} m long leans against a vertical wall. Its foot is ${z2(au.boden)} m from the wall.`);
  return zw(`Ein Quader ist ${au.a} cm lang, ${au.b} cm breit und ${au.h} cm hoch. Wie lang ist die Raumdiagonale d?`, `A cuboid is ${au.a} cm long, ${au.b} cm wide and ${au.h} cm high. How long is the space diagonal d?`);
}

function Skizze({ au }) {
  if (au.art === "leiter") return <LeiterSkizze au={au} />;
  if (au.art === "raum") return <QuaderSkizze au={au} />;
  if (au.art === "umkehr") return null;
  if (au.art === "benennung") {
    const [x, y] = au.recht === "P" ? ["Q", "R"] : au.recht === "Q" ? ["P", "R"] : ["P", "Q"];
    const seite = (u, v) => [u, v].sort().join("");
    const wert = (s) => (s === au.hyp ? (au.gesuchtHyp ? "?" : z2(au.l3)) : s === au.k1 ? z2(au.l1) : au.gesuchtHyp ? z2(au.l2) : "?");
    return <RechtSkizze k1={4} k2={3} namen={[x, y, au.recht]} werte={{ k1: wert(seite(au.recht, x)), k2: wert(seite(au.recht, y)), h: wert(seite(x, y)) }} />;
  }
  const k1 = au.a, k2 = au.b;
  return <RechtSkizze k1={k1} k2={k2} namen={["B", "A", "C"]}
    werte={au.art === "hyp" ? { k1: `a = ${z2(au.a)}`, k2: `b = ${z2(au.b)}`, h: "?" } : { k1: `a = ${z2(au.a)}`, k2: "?", h: `c = ${z2(au.c)}` }} />;
}

const TITEL = {
  hyp: ["Hypotenuse berechnen", "Find the hypotenuse"], kath: ["Kathete berechnen", "Find a leg"], benennung: ["Seiten benennen", "Naming the sides"],
  umkehr: ["Umkehrung prüfen", "Check the converse"], leiter: ["Sachaufgabe: Leiter", "Word problem: ladder"], raum: ["Raumdiagonale", "Space diagonal"],
};

function hilfe(au) {
  return hilfeKontext({
    id: `pythagoras-${au.art}`, aufgabe: "Satz des Pythagoras rechtwinkliges Dreieck Hypotenuse Kathete Quadrat Wurzel",
    verstehen: [zw("Wo ist der rechte Winkel? Markiere ihn in der Skizze.", "Where is the right angle? Mark it in the sketch."),
      zw("Die Seite gegenüber dem rechten Winkel ist die Hypotenuse, die beiden anderen sind Katheten.", "The side opposite the right angle is the hypotenuse, the other two are legs.")],
    ansatz: [zw("Hypotenuse gesucht: Quadrate addieren. Kathete gesucht: Quadrate subtrahieren.", "Hypotenuse wanted: add squares. Leg wanted: subtract squares."),
      zw("Erst quadrieren, dann addieren oder subtrahieren, ganz am Ende die Wurzel ziehen.", "Square first, then add or subtract, take the root at the very end.")],
    regel: [zw("Kathete² + Kathete² = Hypotenuse²", "leg² + leg² = hypotenuse²"), zw("Umkehrung: Gilt a² + b² = c², ist das Dreieck rechtwinklig.", "Converse: if a² + b² = c², the triangle is right-angled.")],
    pruefen: [zw("Die Hypotenuse ist die längste Seite. Ist dein Ergebnis plausibel?", "The hypotenuse is the longest side. Is your result plausible?"),
      zw("Setze zur Probe alle drei Seiten in a² + b² = c² ein.", "Check by putting all three sides into a² + b² = c².")],
  });
}

function Ueben() {
  const [art, setArt] = useState("mix");
  const [au, setAu] = useState(() => neueAufgabe());
  const [stand, setStand] = useState(0);
  const neu = (a = art) => { setAu(neueAufgabe(a === "mix" ? null : a)); setStand(0); };
  const schritte = useMemo(() => schritteVon(au), [au]);
  const ARTEN = [["mix", zw("Gemischt", "Mixed")], ...PYTH_ARTEN.map((a) => [a, zw(TITEL[a][0], TITEL[a][1])])];
  const desktop = useDesktop();
  const aufgabe = <p style={{ ...hinweis, color: C.tinte, marginBottom: 8 }}>{aufgabenText(au)}</p>;
  const folge = <SchrittFolge schritte={schritte} stand={stand} setStand={setStand} fertigText={zw("Richtig gelöst – rechter Winkel erkannt, Gleichung aufgestellt, berechnet.", "Solved – right angle spotted, equation set up, calculated.")} />;
  return (
    <>
      {/* Aufgabe zuerst (21.10.): Typ-Chips hinter der Einstellungs-Pille */}
      <EinstellungsPille kennung="pythagoras" teile={[[zw("Aufgabentyp", "Exercise type"), (ARTEN.find(([id]) => id === art) || ARTEN[0])[1]]]}>
        <div data-aufgabentyp style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {ARTEN.map(([id, t]) => (
            <button key={id} type="button" aria-pressed={art === id} onClick={() => { setArt(id); neu(id); }}
              style={{ padding: "6px 11px", borderRadius: 999, fontFamily: "inherit", fontSize: 12.5, fontWeight: 700, cursor: "pointer",
                border: `1.5px solid ${art === id ? C.see : C.linie}`, background: art === id ? C.see : C.weiss, color: art === id ? C.weiss : C.see }}>{t}</button>
          ))}
        </div>
      </EinstellungsPille>
      <div style={{ ...karte, marginTop: 12 }} key={au.id}>
        <p style={kicker}>{zw(TITEL[au.art][0], TITEL[au.art][1])}</p>
        {desktop && au.art !== "umkehr" ? <AufgabeZweispaltig links={<>{aufgabe}{folge}</>} skizze={<Skizze au={au} />} /> : (<>
        {aufgabe}
        {au.art !== "umkehr" && <div style={{ background: C.sand, borderRadius: 14, padding: 6 }}><Skizze au={au} /></div>}
        {folge}
        </>)}
        <GrosserKnopf ghost onClick={() => neu()}>{zw("Neue Aufgabe", "New exercise")}</GrosserKnopf>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}><IchHaengeFest kontext={hilfe(au)} /></div>
      </div>
    </>
  );
}

const MODI = [["entdecken", zw("Entdecken", "Explore")], ["ueben", zw("Trainieren", "Train")]];

export function SatzDesPythagoras() {
  const [modus, setModus] = useState(() => startModus("pythagoras"));
  const kurzErklaert = (
      <Aufklapp titel={zw("Kurz erklärt", "In short")}>
          <p style={{ margin: "0 0 6px" }}>{zw("Hat ein Dreieck bei C einen rechten Winkel, heißen a und b Katheten und c Hypotenuse. Dann gilt:", "If a triangle has a right angle at C, a and b are called legs and c the hypotenuse. Then:")}</p>
          <p style={{ margin: "0 0 6px", textAlign: "center", fontSize: 17 }}><M t="a² + b² = c²" /></p>
          <p style={{ margin: "0 0 6px" }}>{zw("Kathete gesucht: b² = c² − a². Die Hypotenuse ist immer die längste Seite und liegt dem rechten Winkel gegenüber.", "Leg wanted: b² = c² − a². The hypotenuse is always the longest side and lies opposite the right angle.")}</p>
          <p style={{ margin: 0 }}>{zw("Umkehrung: Gilt a² + b² = c², dann ist das Dreieck bei C rechtwinklig.", "Converse: if a² + b² = c², the triangle has a right angle at C.")}</p>
        </Aufklapp>
  );
  return (
    <Seite titel={zw("Satz des Pythagoras", "Pythagoras' theorem")}
      text={zw("Im rechtwinkligen Dreieck sind die Quadrate über den Katheten zusammen so groß wie das Quadrat über der Hypotenuse. Damit berechnest du jede fehlende Seite – in der Ebene und im Raum.",
        "In a right triangle the squares on the legs together are as large as the square on the hypotenuse. With that you can find any missing side – in the plane and in space.")} knapp={modus === "ueben"}>
      <ModusLeiste modi={MODI} modus={modus} setModus={setModus} label={zw("Satz des Pythagoras", "Pythagoras' theorem")} />
      {modus === "entdecken" && kurzErklaert}
      <div style={{ display: modus === "entdecken" ? "block" : "none" }}><Entdecken /></div>
      <div style={{ display: modus === "ueben" ? "block" : "none" }}><Ueben /></div>
      {modus === "ueben" && kurzErklaert}
    </Seite>
  );
}
