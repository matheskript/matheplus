/* ============================================================
   Mittelstufe · Geometrie: Satz des Thales
   · Entdecken – C auf dem Kreis über AB verschieben (γ bleibt 90°),
     C vom Kreis wegziehen (γ wird stumpf bzw. spitz → Umkehrung),
     Beweisidee mit den gleichschenkligen Dreiecken AMC und MBC.
   · Üben – Winkel berechnen, Beweis in Schritten, Thaleskreis-Radius,
     Lage eines Punktes, Tangentenabschnitt, Umkreis.
   Mathematik in geoMittel.js (getestet).
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useMemo, useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { IchHaengeFest } from "./funcHilfe.jsx";
import { Auswahl, GrosserKnopf, hilfeKontext, hinweis, karte, kicker, zw } from "./ui2.jsx";
import { Aufklapp, ModusLeiste, Seite, SchrittFolge, zt } from "./ui3.jsx";
import { THALES_ARTEN, thalesAufgabe, winkelBeiC } from "./geoMittel.js";
import { Merke, Regler, WertZeile, Zeichenblatt, polar, winkelAn, EntdeckenZweispaltig } from "./geoUi.jsx";
import { useDesktop } from "./arbeitsflaeche.jsx";
import { AufgabeZweispaltig, ChipWahl, ErklaerKarte, GeoDesktop, ReglerD, ReglerKarte, WerteKarte } from "./geoDesktop.jsx";

let zaehler = 0;
const z2 = (v) => zt(v, 2);
const g0 = (v) => `${zt(v, 1)}°`;

/* ---------- Modus 1: Entdecken ---------- */
function Entdecken() {
  const [t, setT] = useState(118);
  const [f, setF] = useState(1);
  const [beweis, setBeweis] = useState(false);
  const r = 3;
  const A = [-r, 0], B = [r, 0], Mi = [0, 0], Cp = polar(f * r, t);
  const gamma = winkelBeiC(t, f);
  const alpha = winkelAn(A, B, Cp), beta = winkelAn(B, A, Cp);
  const auf = Math.abs(f - 1) < 1e-9;
  const imKreis = f < 1;
  const desktop = useDesktop();
  const bild = (hoehe) => (
          <Zeichenblatt punkte={[[-r, -r], [r, r], [0, 1.6 * r]]} hoehe={hoehe} rand={18}
            label={zw("Thaleskreis über AB mit Punkt C", "Thales circle over AB with point C")}
            kinder={(zz) => (
              <>
                {zz.kreis(Mi, r, `${C.see}99`, 1.6, `${C.see}0D`)}
                {zz.linie(A, B, C.tinte, 2.2)}
                {beweis && zz.vieleck([A, Mi, Cp], `${C.flaggold}30`, "none")}
                {beweis && zz.vieleck([Mi, B, Cp], `${C.smaragd}26`, "none")}
                {zz.linie(A, Cp, C.tinte, 2.2)}
                {zz.linie(B, Cp, C.tinte, 2.2)}
                {(beweis || auf) && zz.linie(Mi, Cp, auf ? C.see : C.hellgrau, 1.6, "5 4")}
                {zz.bogen(A, B, Cp, beweis ? "α" : g0(alpha), C.flaggold, 24)}
                {zz.bogen(B, Cp, A, beweis ? "β" : g0(beta), C.smaragd, 24)}
                {beweis && auf
                  ? <>{zz.bogen(Cp, A, Mi, "α", C.flaggold, 30)}{zz.bogen(Cp, Mi, B, "β", C.smaragd, 22)}</>
                  : (Math.abs(gamma - 90) < 0.05 ? zz.rechter(Cp, A, B, C.gruen, 13) : zz.bogen(Cp, A, B, g0(gamma), C.gruen, 22))}
                {zz.punkt(A, "A", -4, 18)}
                {zz.punkt(B, "B", 4, 18)}
                {zz.punkt(Mi, "M", 0, 18, C.see, 3)}
                {zz.punkt(Cp, "C", 0, -12)}
                {beweis && auf && zz.mass(Mi, A, "r", -1, C.see, 12)}
                {beweis && auf && zz.mass(Mi, B, "r", -1, C.see, 12)}
              </>
            )} />
  );
  const beweisZeigen = beweis && auf;
  const merkFarbe = beweisZeigen ? C.see : auf ? C.smaragd : C.gruen;
  const merkInhalt = beweisZeigen ? (
    <>
      <b>{zw("Beweisidee:", "Proof idea:")}</b>{" "}
      {zw("MA, MB und MC sind Radien, also gleich lang. Darum sind die Dreiecke AMC und MBC gleichschenklig, und ihre Basiswinkel sind gleich: Bei C steckt einmal α und einmal β. Also γ = α + β. Mit der Winkelsumme α + β + γ = 180° folgt 2γ = 180°, also γ = 90°.",
        "MA, MB and MC are radii, so they are equal. Hence triangles AMC and MBC are isosceles and their base angles are equal: at C there is one α and one β. So γ = α + β. With the angle sum α + β + γ = 180° we get 2γ = 180°, so γ = 90°.")}
    </>
  ) : auf
    ? zw("C liegt auf dem Kreis über dem Durchmesser AB: Egal wo – der Winkel bei C ist immer 90°. Das ist der Satz des Thales.", "C lies on the circle over the diameter AB: wherever it is, the angle at C is always 90°. That is Thales' theorem.")
    : imKreis
      ? zw("C liegt innerhalb des Kreises: Der Winkel bei C ist größer als 90° (stumpf).", "C lies inside the circle: the angle at C is greater than 90° (obtuse).")
      : zw("C liegt außerhalb des Kreises: Der Winkel bei C ist kleiner als 90° (spitz). Nur auf dem Kreis ist er genau 90° – das ist die Umkehrung.", "C lies outside the circle: the angle at C is less than 90° (acute). Only on the circle is it exactly 90° – that is the converse.");
  const ANSICHT = [["ohne", zw("Nur Winkel", "Angles only")], ["mit", zw("Beweisidee zeigen", "Show the proof idea")]];
  const werte = <>
    <WertZeile links="α" rechts={g0(alpha)} farbe="#8A6A00" />
    <WertZeile links="β" rechts={g0(beta)} farbe="#0B5E43" />
    <WertZeile links={zw("γ (bei C)", "γ (at C)")} rechts={g0(gamma)} farbe={C.gruen} />
  </>;
  if (desktop) {
    return (
      <GeoDesktop
        links={<>
          <ReglerKarte titel={zw("Punkt C bewegen", "Move point C")}>
            <ReglerD name={zw("Lage", "Position")} wert={t} setWert={setT} min={12} max={168} schritt={1} format={(v) => `${zt(v, 0)}°`} />
            <ReglerD name={zw("Abstand", "Distance")} wert={f} setWert={setF} min={0.5} max={1.6} schritt={0.05} farbe={C.gruen} format={(v) => (Math.abs(v - 1) < 1e-9 ? "r" : `${zt(v, 2)} r`)} />
          </ReglerKarte>
          <WerteKarte titel={zw("Winkel im Dreieck", "Angles in the triangle")}>{werte}</WerteKarte>
        </>}
        bild={bild(300)}
        werkzeuge={[{ titel: zw("Ansicht", "View"), inhalt: <ChipWahl optionen={ANSICHT} wert={beweis ? "mit" : "ohne"} setWert={(v) => setBeweis(v === "mit")} label={zw("Ansicht", "View")} /> }]}
        unten={<ErklaerKarte farbe={merkFarbe}>{merkInhalt}</ErklaerKarte>} />
    );
  }
  return (
    <>
      <div style={{ ...karte, marginTop: 16 }}>
        <EntdeckenZweispaltig
          steuerung={<>
        <p style={kicker}>{zw("Punkt C bewegen", "Move point C")}</p>
        <div style={{ display: "grid", gap: 10 }}>
          <Regler name={zw("Lage", "Position")} wert={t} setWert={setT} min={12} max={168} schritt={1} format={(v) => `${zt(v, 0)}°`} breiteName={58} />
          <Regler name={zw("Abstand", "Distance")} wert={f} setWert={setF} min={0.5} max={1.6} schritt={0.05} farbe={C.gruen} format={(v) => (Math.abs(v - 1) < 1e-9 ? "r" : `${zt(v, 2)} r`)} breiteName={58} />
        </div>
        <div style={{ marginTop: 10 }}>
          <Auswahl optionen={ANSICHT} wert={beweis ? "mit" : "ohne"} setWert={(v) => setBeweis(v === "mit")} label={zw("Ansicht", "View")} />
        </div>
          <div style={{ marginTop: 12 }} />
        <p style={kicker}>{zw("Winkel im Dreieck", "Angles in the triangle")}</p>
        {werte}
          </>}
          bild={
        <div style={{ background: C.sand, borderRadius: 14, padding: 6 }}>
          {bild(beweis ? 290 : 270)}
        </div>
          }
          unten={<>
        <Merke farbe={merkFarbe}>{merkInhalt}</Merke>
          </>}
        />
      </div>
    </>
  );
}

/* ---------- Skizzen ---------- */
function ThalesSkizze({ au }) {
  const r = 3, A = [-r, 0], B = [r, 0], Mi = [0, 0];
  const t = au.alpha ? 2 * au.alpha : 110;
  const Cp = polar(r, t);
  const beweis = au.art === "beweis";
  return (
    <Zeichenblatt punkte={[[-r, -0.6], [r, r]]} hoehe={beweis ? 210 : 190} rand={24} label={zw("Skizze: Dreieck im Thaleskreis", "Sketch: triangle in a Thales circle")}
      kinder={(zz) => (
        <>
          {zz.kreis(Mi, r, `${C.see}88`, 1.4)}
          {zz.vieleck([A, B, Cp], `${C.see}0D`, C.tinte, 2)}
          {beweis && zz.linie(Mi, Cp, C.see, 1.6, "5 4")}
          {zz.bogen(A, B, Cp, au.art === "radius" ? null : `${au.alpha}°`, C.flaggold, 24)}
          {zz.bogen(B, Cp, A, au.art === "radius" ? null : "?", C.smaragd, 24)}
          {zz.punkt(A, "A", -4, 18)}{zz.punkt(B, "B", 4, 18)}{zz.punkt(Mi, "M", 0, 18, C.see, 3)}{zz.punkt(Cp, "C", 0, -12)}
        </>
      )} />
  );
}

function RadiusSkizze({ au }) {
  /* rechtwinkliges Dreieck mit rechtem Winkel bei C, Thaleskreis über der Hypotenuse AB */
  const A = [0, 0], B = [au.ab, 0];
  const p = (au.ac * au.ac) / au.ab, h = (au.ac * au.bc) / au.ab;
  const Cp = [p, h], Mi = [au.ab / 2, 0];
  return (
    <Zeichenblatt punkte={[[0, -au.ab / 2], [au.ab, au.ab / 2]]} hoehe={220} rand={24} label={zw("Skizze: rechtwinkliges Dreieck mit Umkreis", "Sketch: right triangle with circumcircle")}
      kinder={(zz) => (
        <>
          {zz.kreis(Mi, au.ab / 2, `${C.see}66`, 1.4, "none", "6 5")}
          {zz.vieleck([A, B, Cp], `${C.see}0D`, C.tinte, 2)}
          {zz.rechter(Cp, A, B, C.gruen)}
          {zz.mass(A, Cp, String(z2(au.ac)), -1)}
          {zz.mass(Cp, B, String(z2(au.bc)), -1)}
          {zz.punkt(A, "A", -4, 18)}{zz.punkt(B, "B", 4, 18)}{zz.punkt(Cp, "C", 0, -12)}
        </>
      )} />
  );
}

function TangentenSkizze({ au }) {
  const Mi = [0, 0], P = [au.d, 0];
  /* Berührpunkt: Winkel bei M mit cos = r/d */
  const w = Math.acos(au.r / au.d) * 180 / Math.PI;
  const Bp = polar(au.r, w);
  return (
    <Zeichenblatt punkte={[[-au.r, -au.r], [au.d, au.r]]} hoehe={210} rand={24} label={zw("Skizze: Tangente von P an den Kreis", "Sketch: tangent from P to the circle")}
      kinder={(zz) => (
        <>
          {zz.kreis(Mi, au.r, C.see, 1.8, `${C.see}0D`)}
          {zz.kreis([au.d / 2, 0], au.d / 2, `${C.gruen}88`, 1.3, "none", "5 4")}
          {zz.linie(Mi, P, C.tinte, 1.6)}
          {zz.linie(Mi, Bp, C.see, 2)}
          {zz.linie(P, [Bp[0] + (Bp[0] - P[0]) * 0.25, Bp[1] + (Bp[1] - P[1]) * 0.25], C.tinte, 2)}
          {zz.rechter(Bp, Mi, P, C.gruen)}
          {zz.mass(Mi, Bp, `r = ${z2(au.r)}`, -1, C.see, 13)}
          {zz.mass(Mi, P, `${z2(au.d)}`, 1, C.tinte, 13)}
          {zz.mass(Bp, P, "?", -1)}
          {zz.punkt(Mi, "M", -4, 18)}{zz.punkt(P, "P", 4, 18)}{zz.punkt(Bp, "B", 0, -12)}
        </>
      )} />
  );
}

/* ---------- Modus 2: Üben ---------- */
export function neueAufgabe(art) {
  return { id: ++zaehler, ...thalesAufgabe(art) };
}

const WARUM90 = (richtig = "a") => ({
  id: "th-90", titel: zw("Der Winkel bei C", "The angle at C"), typ: "wahl",
  frage: zw("Wie groß ist γ und warum?", "How large is γ and why?"),
  optionen: [["a", zw("90°, weil C auf dem Kreis über dem Durchmesser AB liegt", "90°, because C lies on the circle over the diameter AB")],
    ["b", zw("60°, weil alle Winkel gleich sind", "60°, because all angles are equal")], ["c", zw("Das lässt sich nicht sagen", "You can't tell")]],
  richtig,
  fehler: [{ wahl: "b", text: zw("Gleich große Winkel hätte nur ein gleichseitiges Dreieck. Hier hilft der Kreis: AB ist ein Durchmesser.", "Only an equilateral triangle has equal angles. The circle helps here: AB is a diameter.") },
    { wahl: "c", text: zw("Doch: Liegt C auf einem Kreis mit Durchmesser AB, ist der Winkel bei C immer ein rechter (Thales).", "Yes you can: if C lies on a circle with diameter AB, the angle at C is always a right angle (Thales).") }],
  hinweise: [zw("Satz des Thales: Winkel im Halbkreis.", "Thales' theorem: the angle in a semicircle.")],
  erklaerung: zw("γ = 90° (Satz des Thales).", "γ = 90° (Thales' theorem)."),
});

export function schritteVon(au) {
  if (au.art === "winkel") {
    return [
      WARUM90(),
      { id: "th-beta", titel: zw("Dritter Winkel", "Third angle"), typ: "zahl", text: "β =", einheit: "°", wert: au.beta, toleranz: 1e-6, wertText: String(au.beta),
        frage: zw("Berechne β.", "Calculate β."),
        fehler: [{ wert: 180 - au.alpha, text: zw("Du hast γ vergessen. Im Dreieck sind α + β + γ = 180° und γ = 90°.", "You forgot γ. In a triangle α + β + γ = 180° and γ = 90°.") },
          { wert: au.alpha, text: zw("β ist nicht automatisch gleich α – das Dreieck ist nicht gleichschenklig.", "β is not automatically equal to α – the triangle is not isosceles.") }],
        hinweise: [`β = 180° − 90° − ${au.alpha}°`], erklaerung: `β = 180° − 90° − ${au.alpha}° = ${au.beta}°` },
    ];
  }
  if (au.art === "beweis") {
    const a = au.alpha;
    return [
      { id: "th-b1", titel: zw("Gleichschenkliges Dreieck AMC", "Isosceles triangle AMC"), typ: "zahl", text: "∠ACM =", einheit: "°", wert: a, toleranz: 1e-6, wertText: String(a),
        frage: zw(`MA und MC sind Radien. Wie groß ist der Winkel ∠ACM, wenn α = ${a}°?`, `MA and MC are radii. How large is the angle ∠ACM if α = ${a}°?`),
        fehler: [{ wert: 180 - 2 * a, text: zw("Das ist der Winkel an der Spitze M. Gefragt ist der Basiswinkel bei C.", "That is the angle at the apex M. You need the base angle at C.") }],
        hinweise: [zw("Im gleichschenkligen Dreieck sind die Basiswinkel gleich.", "In an isosceles triangle the base angles are equal.")],
        erklaerung: zw(`Basiswinkel im gleichschenkligen Dreieck AMC: ∠ACM = α = ${a}°.`, `Base angle in the isosceles triangle AMC: ∠ACM = α = ${a}°.`) },
      { id: "th-b2", titel: zw("Winkel bei M", "Angle at M"), typ: "zahl", text: "∠AMC =", einheit: "°", wert: 180 - 2 * a, toleranz: 1e-6, wertText: String(180 - 2 * a),
        frage: zw("Berechne den Winkel ∠AMC.", "Calculate the angle ∠AMC."),
        fehler: [{ wert: 180 - a, text: zw("Im Dreieck AMC kommt α zweimal vor (bei A und bei C).", "In triangle AMC, α appears twice (at A and at C).") }],
        hinweise: [`180° − ${a}° − ${a}°`], erklaerung: `∠AMC = 180° − 2 · ${a}° = ${180 - 2 * a}°` },
      { id: "th-b3", titel: zw("Nebenwinkel", "Supplementary angle"), typ: "zahl", text: "∠CMB =", einheit: "°", wert: 2 * a, toleranz: 1e-6, wertText: String(2 * a),
        frage: zw("A, M und B liegen auf einer Geraden. Wie groß ist ∠CMB?", "A, M and B lie on a line. How large is ∠CMB?"),
        hinweise: [`180° − ${180 - 2 * a}°`], erklaerung: `∠CMB = 180° − ${180 - 2 * a}° = ${2 * a}°` },
      { id: "th-b4", titel: zw("Gleichschenkliges Dreieck MBC", "Isosceles triangle MBC"), typ: "zahl", text: "∠MCB =", einheit: "°", wert: 90 - a, toleranz: 1e-6, wertText: String(90 - a),
        frage: zw("Auch MBC ist gleichschenklig. Berechne den Basiswinkel ∠MCB.", "MBC is isosceles too. Calculate the base angle ∠MCB."),
        fehler: [{ wert: 180 - 2 * a, text: zw("Zieh ∠CMB von 180° ab und teile den Rest auf die beiden gleichen Basiswinkel auf.", "Subtract ∠CMB from 180° and split the rest between the two equal base angles.") }],
        hinweise: [`(180° − ${2 * a}°) : 2`], erklaerung: `∠MCB = (180° − ${2 * a}°) : 2 = ${90 - a}°` },
      { id: "th-b5", titel: zw("Winkel bei C", "Angle at C"), typ: "zahl", text: "γ =", einheit: "°", wert: 90, toleranz: 1e-6, wertText: "90",
        frage: zw("γ setzt sich aus ∠ACM und ∠MCB zusammen. Wie groß ist γ?", "γ is made up of ∠ACM and ∠MCB. How large is γ?"),
        hinweise: [`${a}° + ${90 - a}°`], erklaerung: zw(`γ = ${a}° + ${90 - a}° = 90° – für jedes α. Das ist der Satz des Thales.`, `γ = ${a}° + ${90 - a}° = 90° – for every α. That is Thales' theorem.`) },
    ];
  }
  if (au.art === "radius") {
    return [
      { id: "th-r-m", titel: zw("Mittelpunkt finden", "Find the centre"), typ: "wahl",
        frage: zw("Das Dreieck ist bei C rechtwinklig. Wo liegt der Mittelpunkt des Kreises durch A, B und C?", "The triangle has a right angle at C. Where is the centre of the circle through A, B and C?"),
        optionen: [["a", zw("in der Mitte der Hypotenuse AB", "at the midpoint of the hypotenuse AB")], ["b", zw("im Punkt C", "at point C")], ["c", zw("in der Mitte der Kathete AC", "at the midpoint of the leg AC")]], richtig: "a",
        fehler: [{ wahl: "b", text: zw("C liegt selbst auf dem Kreis, nicht in seiner Mitte.", "C lies on the circle itself, not at its centre.") },
          { wahl: "c", text: zw("Umkehrung des Thales: Bei einem rechten Winkel ist die Hypotenuse der Durchmesser.", "Converse of Thales: with a right angle, the hypotenuse is the diameter.") }],
        hinweise: [zw("Der rechte Winkel „sieht“ den Durchmesser.", "The right angle “sees” the diameter.")],
        erklaerung: zw("Die Hypotenuse AB ist Durchmesser des Thaleskreises, M ist ihre Mitte.", "The hypotenuse AB is the diameter of the Thales circle, M is its midpoint.") },
      { id: "th-r-ab", titel: zw("Hypotenuse", "Hypotenuse"), typ: "zahl", text: "AB =", einheit: "cm", wert: au.ab, toleranz: 1e-6, wertText: z2(au.ab),
        frage: zw("Berechne die Länge von AB mit dem Satz des Pythagoras.", "Calculate the length of AB with Pythagoras' theorem."),
        fehler: [{ wert: au.ac + au.bc, text: zw("Seiten addiert man nicht direkt – erst die Quadrate.", "Don't add the sides directly – add their squares.") }],
        hinweise: [`AB² = ${z2(au.ac)}² + ${z2(au.bc)}²`], erklaerung: `AB = √(${z2(au.ac)}² + ${z2(au.bc)}²) = ${z2(au.ab)} cm` },
      { id: "th-r-r", titel: zw("Radius", "Radius"), typ: "zahl", text: "r =", einheit: "cm", wert: au.r, toleranz: 1e-6, wertText: z2(au.r),
        frage: zw("Wie groß ist der Radius des Thaleskreises?", "What is the radius of the Thales circle?"),
        fehler: [{ wert: au.ab, text: zw("Das ist der Durchmesser. Der Radius ist halb so lang.", "That is the diameter. The radius is half as long.") }],
        hinweise: [`r = ${z2(au.ab)} : 2`], erklaerung: `r = ${z2(au.ab)} : 2 = ${z2(au.r)} cm` },
    ];
  }
  if (au.art === "lage") {
    const rl = { innen: "innen", auf: "auf", aussen: "aussen" }[au.lage];
    const rg = { innen: "gross", auf: "gleich", aussen: "klein" }[au.lage];
    return [
      { id: "th-l-lage", titel: zw("Lage von C", "Position of C"), typ: "wahl",
        frage: zw(`Der Thaleskreis über AB hat den Radius r = ${z2(au.r)} cm. Der Punkt C ist ${z2(au.d)} cm von M entfernt. Wo liegt C?`, `The Thales circle over AB has radius r = ${z2(au.r)} cm. Point C is ${z2(au.d)} cm from M. Where is C?`),
        optionen: [["innen", zw("innerhalb des Kreises", "inside the circle")], ["auf", zw("auf dem Kreis", "on the circle")], ["aussen", zw("außerhalb des Kreises", "outside the circle")]], richtig: rl,
        hinweise: [zw("Vergleiche den Abstand MC mit dem Radius.", "Compare the distance MC with the radius.")],
        erklaerung: zw(`${z2(au.d)} cm ${au.d < au.r ? "<" : au.d > au.r ? ">" : "="} ${z2(au.r)} cm`, `${z2(au.d)} cm ${au.d < au.r ? "<" : au.d > au.r ? ">" : "="} ${z2(au.r)} cm`) },
      { id: "th-l-w", titel: zw("Winkel bei C", "Angle at C"), typ: "wahl",
        frage: zw("Was folgt für den Winkel γ = ∠ACB?", "What follows for the angle γ = ∠ACB?"),
        optionen: [["gross", zw("γ > 90°", "γ > 90°")], ["gleich", zw("γ = 90°", "γ = 90°")], ["klein", zw("γ < 90°", "γ < 90°")]], richtig: rg,
        fehler: [{ wahl: "gleich", text: zw("Genau 90° gibt es nur auf dem Kreis.", "Exactly 90° only happens on the circle.") },
          ...(rg === "gross" ? [{ wahl: "klein", text: zw("Andersherum: Je näher C an AB heranrückt, desto weiter öffnet sich der Winkel.", "The other way round: the closer C moves to AB, the wider the angle opens.") }] : []),
          ...(rg === "klein" ? [{ wahl: "gross", text: zw("Andersherum: Je weiter C wegrückt, desto spitzer wird der Winkel.", "The other way round: the further away C moves, the more acute the angle gets.") }] : [])],
        hinweise: [zw("Probier es im Modus Entdecken mit dem Regler „Abstand“ aus.", "Try it in Explore mode with the “Distance” slider.")],
        erklaerung: { innen: zw("Innerhalb: stumpfer Winkel, γ > 90°.", "Inside: obtuse angle, γ > 90°."), auf: zw("Auf dem Kreis: γ = 90° (Thales).", "On the circle: γ = 90° (Thales)."), aussen: zw("Außerhalb: spitzer Winkel, γ < 90°.", "Outside: acute angle, γ < 90°.") }[au.lage] },
    ];
  }
  if (au.art === "tangente") {
    return [
      { id: "th-t-90", titel: zw("Rechter Winkel", "Right angle"), typ: "wahl",
        frage: zw("Die Tangente von P berührt den Kreis in B. Wo ist ein rechter Winkel?", "The tangent from P touches the circle at B. Where is there a right angle?"),
        optionen: [["b", zw("bei B, zwischen Radius MB und Tangente PB", "at B, between radius MB and tangent PB")], ["m", zw("bei M", "at M")], ["p", zw("bei P", "at P")]], richtig: "b",
        fehler: [{ wahl: "m", text: zw("Bei M treffen sich Radius und MP – dort ist kein rechter Winkel.", "Radius and MP meet at M – there is no right angle there.") },
          { wahl: "p", text: zw("Bei P ist der Winkel spitz.", "The angle at P is acute.") }],
        hinweise: [zw("Der Berührradius steht senkrecht auf der Tangente. B liegt deshalb auf dem Thaleskreis über MP.", "The radius to the point of contact is perpendicular to the tangent. So B lies on the Thales circle over MP.")],
        erklaerung: zw("∠MBP = 90°: B liegt auf dem Thaleskreis über MP (grün gestrichelt).", "∠MBP = 90°: B lies on the Thales circle over MP (dashed green).") },
      { id: "th-t-l", titel: zw("Tangentenabschnitt", "Tangent length"), typ: "zahl", text: "PB =", einheit: "cm", wert: au.t, toleranz: 1e-6, wertText: z2(au.t),
        frage: zw(`r = ${z2(au.r)} cm, MP = ${z2(au.d)} cm. Berechne PB.`, `r = ${z2(au.r)} cm, MP = ${z2(au.d)} cm. Calculate PB.`),
        fehler: [{ wert: Math.sqrt(au.r ** 2 + au.d ** 2), toleranz: 0.011, text: zw("MP ist die Hypotenuse (gegenüber dem rechten Winkel bei B) – also subtrahieren.", "MP is the hypotenuse (opposite the right angle at B) – so subtract.") },
          { wert: au.d - au.r, text: zw("Das ist der Abstand von P zum Kreis entlang MP, nicht die Tangente.", "That is the distance from P to the circle along MP, not the tangent.") }],
        hinweise: [`PB² = ${z2(au.d)}² − ${z2(au.r)}²`], erklaerung: `PB = √(${z2(au.d)}² − ${z2(au.r)}²) = √${z2(au.d ** 2 - au.r ** 2)} = ${z2(au.t)} cm` },
    ];
  }
  /* umkreis */
  return [
    { id: "th-u-m", titel: zw("Umkreismittelpunkt", "Circumcentre"), typ: "wahl",
      frage: zw("Wo liegt der Mittelpunkt des Umkreises eines rechtwinkligen Dreiecks?", "Where is the circumcentre of a right triangle?"),
      optionen: [["a", zw("in der Mitte der Hypotenuse", "at the midpoint of the hypotenuse")], ["b", zw("im Schnittpunkt der Winkelhalbierenden", "where the angle bisectors meet")], ["c", zw("im Scheitel des rechten Winkels", "at the vertex of the right angle")]], richtig: "a",
      fehler: [{ wahl: "b", text: zw("Die Winkelhalbierenden liefern den Inkreis. Der Umkreis kommt von den Mittelsenkrechten – beim rechtwinkligen Dreieck treffen sie sich auf der Hypotenuse.", "The angle bisectors give the incircle. The circumcircle comes from the perpendicular bisectors – in a right triangle they meet on the hypotenuse.") },
        { wahl: "c", text: zw("Der Scheitel des rechten Winkels liegt auf dem Kreis, nicht in der Mitte.", "The vertex of the right angle lies on the circle, not at its centre.") }],
      hinweise: [zw("Umkehrung des Thales.", "Converse of Thales.")], erklaerung: zw("Hypotenuse = Durchmesser, Mittelpunkt = Mitte der Hypotenuse.", "Hypotenuse = diameter, centre = midpoint of the hypotenuse.") },
    { id: "th-u-c", titel: zw("Hypotenuse", "Hypotenuse"), typ: "zahl", text: "c =", einheit: "cm", wert: au.c, toleranz: 1e-6, wertText: z2(au.c),
      frage: zw(`Die Katheten sind ${au.a} cm und ${au.b} cm lang. Berechne c.`, `The legs are ${au.a} cm and ${au.b} cm long. Calculate c.`),
      hinweise: [`c² = ${au.a}² + ${au.b}²`], erklaerung: `c = √(${au.a}² + ${au.b}²) = ${z2(au.c)} cm` },
    { id: "th-u-r", titel: zw("Umkreisradius", "Circumradius"), typ: "zahl", text: "r =", einheit: "cm", wert: au.r, toleranz: 1e-6, wertText: z2(au.r),
      frage: zw("Wie groß ist der Umkreisradius?", "What is the circumradius?"),
      fehler: [{ wert: au.c, text: zw("Das ist der Durchmesser.", "That is the diameter.") }],
      hinweise: [`r = c : 2`], erklaerung: `r = ${z2(au.c)} : 2 = ${z2(au.r)} cm` },
  ];
}

function aufgabenText(au) {
  if (au.art === "winkel") return zw(`AB ist ein Durchmesser des Kreises, C liegt auf dem Kreis. Es ist α = ${au.alpha}°.`, `AB is a diameter of the circle, C lies on the circle. α = ${au.alpha}°.`);
  if (au.art === "beweis") return zw(`Beweise Schritt für Schritt, dass γ = 90° ist. M ist der Mittelpunkt von AB, C liegt auf dem Kreis, α = ${au.alpha}°.`, `Prove step by step that γ = 90°. M is the midpoint of AB, C lies on the circle, α = ${au.alpha}°.`);
  if (au.art === "radius") return zw(`Ein Dreieck ABC hat bei C einen rechten Winkel, AC = ${z2(au.ac)} cm und BC = ${z2(au.bc)} cm.`, `Triangle ABC has a right angle at C, AC = ${z2(au.ac)} cm and BC = ${z2(au.bc)} cm.`);
  if (au.art === "lage") return zw(`Über der Strecke AB = ${z2(au.durchmesser)} cm liegt der Thaleskreis mit Mittelpunkt M.`, `The Thales circle with centre M lies over the segment AB = ${z2(au.durchmesser)} cm.`);
  if (au.art === "tangente") return zw(`Von einem Punkt P außerhalb eines Kreises um M wird eine Tangente an den Kreis gelegt.`, `A tangent is drawn from a point P outside a circle with centre M.`);
  return zw(`Ein rechtwinkliges Dreieck hat die Katheten ${au.a} cm und ${au.b} cm.`, `A right triangle has legs of ${au.a} cm and ${au.b} cm.`);
}

function Skizze({ au }) {
  if (au.art === "winkel" || au.art === "beweis") return <ThalesSkizze au={au} />;
  if (au.art === "radius") return <RadiusSkizze au={au} />;
  if (au.art === "tangente") return <TangentenSkizze au={au} />;
  return null;
}

const TITEL = {
  winkel: ["Winkel berechnen", "Calculate angles"], beweis: ["Beweis in Schritten", "Proof in steps"], radius: ["Thaleskreis-Radius", "Thales circle radius"],
  lage: ["Innen, auf, außen", "Inside, on, outside"], tangente: ["Tangente", "Tangent"], umkreis: ["Umkreis", "Circumcircle"],
};

function hilfe(au) {
  return hilfeKontext({
    id: `thales-${au.art}`, aufgabe: "Satz des Thales Thaleskreis Halbkreis rechter Winkel Durchmesser Umkreis Tangente",
    verstehen: [zw("Gibt es einen Kreis, auf dem C liegt, und ist AB dessen Durchmesser?", "Is there a circle C lies on, with AB as its diameter?"),
      zw("Markiere den Mittelpunkt M und die Radien – sie sind alle gleich lang.", "Mark the centre M and the radii – they are all the same length.")],
    ansatz: [zw("Thales: C auf dem Kreis über AB ⇒ γ = 90°.", "Thales: C on the circle over AB ⇒ γ = 90°."),
      zw("Umkehrung: γ = 90° ⇒ C liegt auf dem Kreis über AB; die Hypotenuse ist der Durchmesser.", "Converse: γ = 90° ⇒ C lies on the circle over AB; the hypotenuse is the diameter.")],
    regel: [zw("Winkelsumme im Dreieck: 180°", "Angle sum in a triangle: 180°"), zw("Gleichschenkliges Dreieck: gleiche Basiswinkel", "Isosceles triangle: equal base angles")],
    pruefen: [zw("Ergeben alle drei Winkel zusammen 180°?", "Do all three angles add up to 180°?"), zw("Radius = halber Durchmesser.", "Radius = half the diameter.")],
  });
}

function Ueben() {
  const [art, setArt] = useState("mix");
  const [au, setAu] = useState(() => neueAufgabe());
  const [stand, setStand] = useState(0);
  const neu = (a = art) => { setAu(neueAufgabe(a === "mix" ? null : a)); setStand(0); };
  const schritte = useMemo(() => schritteVon(au), [au]);
  const ARTEN = [["mix", zw("Gemischt", "Mixed")], ...THALES_ARTEN.map((a) => [a, zw(TITEL[a][0], TITEL[a][1])])];
  const sk = Skizze({ au });
  const desktop = useDesktop();
  const aufgabe = <p style={{ ...hinweis, color: C.tinte, marginBottom: 8 }}>{aufgabenText(au)}</p>;
  const folge = <SchrittFolge schritte={schritte} stand={stand} setStand={setStand} fertigText={zw("Richtig gelöst.", "Solved.")} />;
  return (
    <>
      <div style={{ ...karte, marginTop: 16 }}>
        <p style={kicker}>{zw("Aufgabentyp", "Exercise type")}</p>
        <div data-aufgabentyp style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {ARTEN.map(([id, t]) => (
            <button key={id} type="button" aria-pressed={art === id} onClick={() => { setArt(id); neu(id); }}
              style={{ padding: "6px 11px", borderRadius: 999, fontFamily: "inherit", fontSize: 12.5, fontWeight: 700, cursor: "pointer",
                border: `1.5px solid ${art === id ? C.see : C.linie}`, background: art === id ? C.see : C.weiss, color: art === id ? C.weiss : C.see }}>{t}</button>
          ))}
        </div>
      </div>
      <div style={{ ...karte, marginTop: 12 }} key={au.id}>
        <p style={kicker}>{zw(TITEL[au.art][0], TITEL[au.art][1])}</p>
        {desktop && sk ? <AufgabeZweispaltig links={<>{aufgabe}{folge}</>} skizze={sk} /> : (<>
        {aufgabe}
        {sk && <div style={{ background: C.sand, borderRadius: 14, padding: 6 }}>{sk}</div>}
        {folge}
        </>)}
        <GrosserKnopf ghost onClick={() => neu()}>{zw("Neue Aufgabe", "New exercise")}</GrosserKnopf>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}><IchHaengeFest kontext={hilfe(au)} /></div>
      </div>
    </>
  );
}

const MODI = [["entdecken", zw("Entdecken", "Explore")], ["ueben", zw("Üben", "Practise")]];

export function SatzDesThales() {
  const [modus, setModus] = useState("entdecken");
  return (
    <Seite titel={zw("Satz des Thales", "Thales' theorem")}
      text={zw("Jeder Winkel im Halbkreis ist ein rechter. Damit erkennst du rechte Winkel, ohne sie zu messen, findest Umkreise und konstruierst Tangenten.",
        "Every angle in a semicircle is a right angle. With that you can spot right angles without measuring, find circumcircles and construct tangents.")}>
      <ModusLeiste modi={MODI} modus={modus} setModus={setModus} label={zw("Satz des Thales", "Thales' theorem")} />
      <Aufklapp titel={zw("Kurz erklärt", "In short")}>
        <p style={{ margin: "0 0 6px" }}>{zw("Liegt C auf dem Kreis mit dem Durchmesser AB, dann hat das Dreieck ABC bei C einen rechten Winkel:", "If C lies on the circle with diameter AB, triangle ABC has a right angle at C:")}</p>
        <p style={{ margin: "0 0 6px", textAlign: "center", fontSize: 17 }}><M t="γ = 90°" /></p>
        <p style={{ margin: 0 }}>{zw("Umkehrung: Hat ein Dreieck bei C einen rechten Winkel, liegt C auf dem Kreis über der Hypotenuse AB. Der Mittelpunkt des Umkreises ist dann die Mitte der Hypotenuse.", "Converse: if a triangle has a right angle at C, then C lies on the circle over the hypotenuse AB. The circumcentre is then the midpoint of the hypotenuse.")}</p>
      </Aufklapp>
      <div style={{ display: modus === "entdecken" ? "block" : "none" }}><Entdecken /></div>
      <div style={{ display: modus === "ueben" ? "block" : "none" }}><Ueben /></div>
    </Seite>
  );
}
