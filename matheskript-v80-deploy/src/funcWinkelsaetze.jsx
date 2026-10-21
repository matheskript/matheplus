/* ============================================================
   Mittelstufe · Geometrie: Winkel an Geraden und Winkelsummen
   · Entdecken – Parallelen mit Schnittgerade (Scheitel-, Neben-,
     Stufen-, Wechsel- und Nachbarwinkel hervorheben), Winkelsumme im
     Dreieck mit Parallelen-Beweis, Winkelsumme im n-Eck
   · Üben – Winkel an Parallelen benennen und berechnen, Dreieck,
     gleichschenkliges Dreieck, Außenwinkel, n-Eck, regelmäßiges n-Eck
   Mathematik in geoMittel2.js (getestet).
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { Auswahl, hilfeKontext, karte, kicker, zw } from "./ui2.jsx";
import { startModus, uebenWunschLesen } from "./uebenWunsch.js";
import { Aufklapp, ModusLeiste, Seite, zt } from "./ui3.jsx";
import { WINKEL_ARTEN, lagenWert, winkelAufgabe } from "./geoMittel2.js";
import { Merke, Regler, UebenRahmen, WertZeile, Zeichenblatt, add, mal, polar } from "./geoUi.jsx";
import { ErgebnisReihe, useDesktop } from "./arbeitsflaeche.jsx";
import { ChipWahl, ErklaerKarte, GeoDesktop, ReglerD, ReglerKarte, ThemenLeiste, WerteKarte } from "./geoDesktop.jsx";

let zaehler = 0;
const g0 = (v) => `${zt(v, 1)}°`;

/* ---------- Parallelen-Figur ---------- */
const BEZ = {
  scheitel: [zw("Scheitelwinkel", "Vertical angles"), zw("gegenüber am selben Schnittpunkt – gleich groß", "opposite at the same intersection – equal")],
  neben: [zw("Nebenwinkel", "Adjacent angles"), zw("nebeneinander am selben Schnittpunkt – zusammen 180°", "next to each other at the same intersection – together 180°")],
  stufen: [zw("Stufenwinkel", "Corresponding angles"), zw("gleiche Lage an beiden Parallelen – gleich groß", "same position at both parallels – equal")],
  wechsel: [zw("Wechselwinkel", "Alternate angles"), zw("zwischen den Parallelen, auf verschiedenen Seiten der Schnittgeraden – gleich groß", "between the parallels, on opposite sides of the transversal – equal")],
  nachbar: [zw("Nachbarwinkel", "Co-interior angles"), zw("zwischen den Parallelen, auf derselben Seite – zusammen 180°", "between the parallels, on the same side – together 180°")],
};
const PAARE = { scheitel: [[1, "or"], [1, "ul"]], neben: [[1, "or"], [1, "ol"]], stufen: [[1, "or"], [2, "or"]], wechsel: [[1, "ul"], [2, "or"]], nachbar: [[1, "ur"], [2, "or"]] };

/* Strahlenpaar für eine Lage */
function strahlen(lage, t) {
  const rechts = [1, 0], links = [-1, 0], hoch = t, runter = mal(t, -1);
  return { or: [rechts, hoch], ol: [hoch, links], ul: [links, runter], ur: [runter, rechts] }[lage];
}

function ParallelFigur({ phi, marken = [], hoehe = 250 }) {
  /* marken: [{ s: 1|2, lage, text, farbe }] */
  const t = polar(1, phi), y = 1.6;
  const S = { 1: [y / Math.tan(phi * Math.PI / 180), y], 2: [-y / Math.tan(phi * Math.PI / 180), -y] };
  const lang = 3.4;
  const tA = add(S[2], mal(t, -1.5)), tE = add(S[1], mal(t, 1.5));
  const xs = [S[1][0], S[2][0], tA[0], tE[0]];
  const x0 = Math.min(...xs) - 1.2, x1 = Math.max(...xs) + 1.2;
  return (
    <Zeichenblatt punkte={[[x0, -y - 1.2], [x1, y + 1.2], [-lang, 0], [lang, 0]]} hoehe={hoehe} rand={14}
      label={zw("Zwei Parallelen und eine Schnittgerade", "Two parallel lines and a transversal")}
      kinder={(zz) => (
        <>
          {zz.linie([x0, y], [x1, y], C.tinte, 2)}
          {zz.linie([x0, -y], [x1, -y], C.tinte, 2)}
          {zz.linie(tA, tE, C.see, 2)}
          {zz.text([x1 - 0.3, y + 0.32], "g", C.tinte, 13)}
          {zz.text([x1 - 0.3, -y + 0.32], "h", C.tinte, 13)}
          {zz.text(add(tE, [0.25, -0.1]), "t", C.see, 13)}
          {marken.map((m, i) => {
            const [u, v] = strahlen(m.lage, t);
            return <g key={i}>{zz.bogen(S[m.s], add(S[m.s], u), add(S[m.s], v), m.text, m.farbe || C.flaggold, 22)}</g>;
          })}
          {zz.punkt(S[1], null, 0, 0, C.tinte, 3)}{zz.punkt(S[2], null, 0, 0, C.tinte, 3)}
        </>
      )} />
  );
}

function EntdeckenParallelen({ thema }) {
  const [phi, setPhi] = useState(58);
  const [bez, setBez] = useState("wechsel");
  const [[s1, l1], [s2, l2]] = PAARE[bez];
  const w1 = lagenWert(l1, phi), w2 = lagenWert(l2, phi);
  const desktop = useDesktop();
  const PAAR_OPT = Object.keys(BEZ).map((k) => [k, BEZ[k][0]]);
  const figur = (hoehe) => <ParallelFigur phi={phi} hoehe={hoehe} marken={[{ s: s1, lage: l1, text: g0(w1) }, { s: s2, lage: l2, text: g0(w2), farbe: C.smaragd }]} />;
  const merke = <><b>{BEZ[bez][0]}:</b> {BEZ[bez][1]}. {w1 === w2 ? `${g0(w1)} = ${g0(w2)}` : `${g0(w1)} + ${g0(w2)} = 180°`}</>;
  if (desktop) {
    return (
      <GeoDesktop thema={thema}
        links={<>
          <ReglerKarte titel={zw("Schnittwinkel", "Angle of intersection")}>
            <ReglerD name={zw("Winkel", "Angle")} wert={phi} setWert={setPhi} min={25} max={155} schritt={1} format={(v) => `${zt(v, 0)}°`} />
          </ReglerKarte>
          <WerteKarte titel={BEZ[bez][0]}>
            <WertZeile links={zw("goldener Winkel", "gold angle")} rechts={g0(w1)} farbe="#8A6A00" />
            <WertZeile links={zw("grüner Winkel", "green angle")} rechts={g0(w2)} farbe="#0B5E43" />
          </WerteKarte>
          <ErklaerKarte farbe={w1 === w2 ? C.smaragd : C.gruen}>{merke}</ErklaerKarte>
        </>}
        bild={figur(300)}
        werkzeuge={[{ titel: zw("Winkelpaar", "Angle pair"), inhalt: <ChipWahl optionen={PAAR_OPT} wert={bez} setWert={setBez} label={zw("Winkelpaar", "Angle pair")} /> }]} />
    );
  }
  return (
    <>
      <Regler name={zw("Winkel", "Angle")} wert={phi} setWert={setPhi} min={25} max={155} schritt={1} format={(v) => `${zt(v, 0)}°`} breiteName={58} />
      <div style={{ marginTop: 10 }}>
        <Auswahl optionen={PAAR_OPT} wert={bez} setWert={setBez} label={zw("Winkelpaar", "Angle pair")} />
      </div>
      <div style={{ marginTop: 12, background: C.sand, borderRadius: 14, padding: 6 }}>
        {figur(250)}
      </div>
      <Merke farbe={w1 === w2 ? C.smaragd : C.gruen}>
        {merke}
      </Merke>
    </>
  );
}

/* Auf Zehntel runden, Summe erhalten (größter Rest): 52,44 + 61,44 + 66,12 → 52,4 + 61,5 + 66,1 = 180 */
function zehntelMitSumme(werte) {
  const z = werte.map((v) => v * 10), unten = z.map(Math.floor);
  let rest = Math.round(z.reduce((s, v) => s + v, 0)) - unten.reduce((s, v) => s + v, 0);
  const reihe = z.map((v, i) => [v - unten[i], i]).sort((x, y) => y[0] - x[0]);
  for (const [, i] of reihe) { if (rest <= 0) break; unten[i]++; rest--; }
  return unten.map((v) => v / 10);
}

function EntdeckenDreieck({ thema }) {
  const [cx, setCx] = useState(2.2);
  const [cy, setCy] = useState(3.2);
  const A = [0, 0], B = [6, 0], Cp = [cx, cy];
  const w = (P, Q, R) => {
    const u = [Q[0] - P[0], Q[1] - P[1]], v = [R[0] - P[0], R[1] - P[1]];
    return Math.acos((u[0] * v[0] + u[1] * v[1]) / (Math.hypot(...u) * Math.hypot(...v))) * 180 / Math.PI;
  };
  // Alle drei Winkel gemessen (nicht γ = 180° − α − β), die Summe daraus berechnet.
  // Gerundet wird auf Zehntel so, dass die angezeigten Werte genau die angezeigte Summe ergeben.
  const [al, be, ga] = zehntelMitSumme([w(A, B, Cp), w(B, A, Cp), w(Cp, A, B)]);
  const summe = (Math.round(al * 10) + Math.round(be * 10) + Math.round(ga * 10)) / 10;
  const P1 = [cx - 3, cy], P2 = [cx + 3, cy];
  const desktop = useDesktop();
  /* Desktop: Parallele etwas kürzer, damit das Dreieck die Breite besser nutzt */
  const bild = (hoehe, eng = false) => (
    <Zeichenblatt punkte={eng ? [[-1.5, -0.6], [7.5, 5.4]] : [[-4, -0.8], [10, 5.6], P1, P2]} hoehe={hoehe} rand={14} label={zw("Dreieck mit Parallele durch C", "Triangle with a parallel through C")}
      kinder={(zz) => (
        <>
          {zz.linie(eng ? [Math.max(-1.5, cx - 2.2), cy] : P1, eng ? [Math.min(7.5, cx + 2.2), cy] : P2, C.hellgrau, 1.6, "6 4")}
          {zz.vieleck([A, B, Cp], `${C.see}10`, C.tinte, 2)}
          {zz.bogen(A, B, Cp, "α", C.flaggold, 24)}
          {zz.bogen(B, Cp, A, "β", C.smaragd, 24)}
          {zz.bogen(Cp, A, B, "γ", C.see, 20)}
          {zz.bogen(Cp, P1, A, "α", C.flaggold, 30)}
          {zz.bogen(Cp, B, P2, "β", C.smaragd, 30)}
          {zz.punkt(A, "A", -8, 14)}{zz.punkt(B, "B", 8, 14)}{zz.punkt(Cp, "C", 0, -10)}
        </>
      )} />
  );
  const werte = <>
    <WertZeile links="α" rechts={g0(al)} farbe="#8A6A00" />
    <WertZeile links="β" rechts={g0(be)} farbe="#0B5E43" />
    <WertZeile links="γ" rechts={g0(ga)} />
    <WertZeile links="α + β + γ" rechts={g0(summe)} farbe={C.gruen} />
  </>;
  const merke = zw("Zieh durch C die Parallele zu AB. Links von C liegt α noch einmal (Wechselwinkel), rechts β. Zusammen mit γ bilden sie einen gestreckten Winkel: α + β + γ = 180°.",
    "Draw the parallel to AB through C. To the left of C you find α again (alternate angle), to the right β. Together with γ they form a straight angle: α + β + γ = 180°.");
  if (desktop) {
    return (
      <GeoDesktop thema={thema}
        links={<>
          <ReglerKarte titel={zw("Punkt C verschieben", "Move point C")}>
            <ReglerD name="C → x" wert={cx} setWert={setCx} min={-1} max={7} schritt={0.2} />
            <ReglerD name="C → y" wert={cy} setWert={setCy} min={1} max={5} schritt={0.2} />
          </ReglerKarte>
        </>}
        bild={bild(226, true)}
        unten={<ErgebnisReihe spalten="minmax(0, 290px) minmax(0, 1fr)" gap={20}>
          <WerteKarte titel={zw("Winkel im Dreieck", "Angles in the triangle")}>{werte}</WerteKarte>
          <ErklaerKarte titel={zw("Warum 180°?", "Why 180°?")}>{merke}</ErklaerKarte>
        </ErgebnisReihe>} />
    );
  }
  return (
    <>
      <div style={{ display: "grid", gap: 8 }}>
        <Regler name="C → x" wert={cx} setWert={setCx} min={-1} max={7} schritt={0.2} breiteName={58} />
        <Regler name="C → y" wert={cy} setWert={setCy} min={1} max={5} schritt={0.2} breiteName={58} />
      </div>
      <div style={{ marginTop: 12, background: C.sand, borderRadius: 14, padding: 6 }}>
        {bild(220)}
      </div>
      {werte}
      <Merke>{merke}</Merke>
    </>
  );
}

function regelVieleck(n, r = 3) {
  return Array.from({ length: n }, (_, i) => polar(r, 90 + (360 * i) / n));
}

function EntdeckenNEck({ thema }) {
  const [n, setN] = useState(6);
  const pts = regelVieleck(n);
  const desktop = useDesktop();
  const bild = (hoehe) => (
    <Zeichenblatt punkte={[[-3.3, -3.3], [3.3, 3.3]]} hoehe={hoehe} rand={12} label={zw("n-Eck, von einer Ecke aus in Dreiecke zerlegt", "Polygon split into triangles from one corner")}
      kinder={(zz) => (
        <>
          {pts.slice(1, -1).map((p, i) => zz.vieleck([pts[0], p, pts[i + 2]], i % 2 ? `${C.flaggold}33` : `${C.see}22`, "none", 1, `d${i}`))}
          {zz.vieleck(pts, "none", C.tinte, 2)}
          {pts.slice(2, -1).map((p, i) => zz.linie(pts[0], p, C.see, 1.4, "5 4", `l${i}`))}
          {zz.punkt(pts[0], null, 0, 0, C.gruen, 4.5)}
        </>
      )} />
  );
  const werte = <>
    <WertZeile links={zw("Dreiecke", "Triangles")} rechts={`${n} − 2 = ${n - 2}`} />
    <WertZeile links={zw("Innenwinkelsumme", "Interior angle sum")} rechts={`${n - 2} · 180° = ${(n - 2) * 180}°`} farbe={C.gruen} />
    <WertZeile links={zw("Ein Innenwinkel (regelmäßig)", "One interior angle (regular)")} rechts={g0(((n - 2) * 180) / n)} />
  </>;
  const merke = zw("Von einer Ecke aus zerfällt jedes n-Eck in n − 2 Dreiecke. Jedes bringt 180° mit: Winkelsumme (n − 2) · 180°.",
    "From one corner, every n-gon splits into n − 2 triangles. Each contributes 180°: angle sum (n − 2) · 180°.");
  if (desktop) {
    return (
      <GeoDesktop thema={thema}
        links={<>
          <ReglerKarte titel={zw("Vieleck", "Polygon")}>
            <ReglerD name={zw("Ecken n", "Corners n")} wert={n} setWert={setN} min={3} max={12} schritt={1} format={(v) => String(v)} />
          </ReglerKarte>
          <WerteKarte titel={zw("Winkelsumme", "Angle sum")}>{werte}</WerteKarte>
          <ErklaerKarte>{merke}</ErklaerKarte>
        </>}
        bild={bild(300)} />
    );
  }
  return (
    <>
      <Regler name={zw("Ecken n", "Corners n")} wert={n} setWert={setN} min={3} max={12} schritt={1} format={(v) => String(v)} breiteName={70} />
      <div style={{ marginTop: 12, background: C.sand, borderRadius: 14, padding: 6 }}>
        {bild(230)}
      </div>
      {werte}
      <Merke>{merke}</Merke>
    </>
  );
}

function Entdecken() {
  const [teil, setTeil] = useState("parallel");
  const desktop = useDesktop();
  const TEILE = [["parallel", zw("Winkel an Parallelen", "Angles at parallels")], ["dreieck", zw("Winkelsumme im Dreieck", "Angle sum in a triangle")], ["neck", zw("Winkelsumme im n-Eck", "Angle sum in a polygon")]];
  if (desktop) {
    const thema = <ThemenLeiste titel={zw("Was willst du sehen?", "What do you want to see?")} optionen={TEILE} wert={teil} setWert={setTeil} label={zw("Thema", "Topic")} />;
    return (
      <>
        {teil === "parallel" && <EntdeckenParallelen thema={thema} />}
        {teil === "dreieck" && <EntdeckenDreieck thema={thema} />}
        {teil === "neck" && <EntdeckenNEck thema={thema} />}
      </>
    );
  }
  return (
    <div style={{ ...karte, marginTop: 16 }}>
      <p style={kicker}>{zw("Was willst du sehen?", "What do you want to see?")}</p>
      <Auswahl optionen={TEILE}
        wert={teil} setWert={setTeil} label={zw("Thema", "Topic")} />
      <div style={{ marginTop: 14 }}>
        {teil === "parallel" && <EntdeckenParallelen />}
        {teil === "dreieck" && <EntdeckenDreieck />}
        {teil === "neck" && <EntdeckenNEck />}
      </div>
    </div>
  );
}

/* ---------- Üben ---------- */
const TITEL = {
  parallel: ["Winkel an Parallelen", "Angles at parallels"], dreieck: ["Dritter Winkel", "Third angle"], gleichschenklig: ["Gleichschenkliges Dreieck", "Isosceles triangle"],
  aussen: ["Außenwinkel", "Exterior angle"], neck: ["Winkelsumme im n-Eck", "Polygon angle sum"], regelmaessig: ["Regelmäßiges n-Eck", "Regular polygon"],
};
const neue = (art) => ({ id: ++zaehler, ...winkelAufgabe(art) });

function schritte(au) {
  if (au.art === "parallel") {
    const gleich = ["scheitel", "stufen", "wechsel"].includes(au.bez);
    return [
      { id: "wi-bez", titel: zw("Beziehung erkennen", "Spot the relation"), typ: "wahl",
        frage: zw("Wie heißen die beiden markierten Winkel?", "What are the two marked angles called?"),
        optionen: Object.keys(BEZ).map((k) => [k, BEZ[k][0]]), richtig: au.bez,
        fehler: Object.keys(BEZ).filter((k) => k !== au.bez).map((k) => ({ wahl: k, text: zw(`${BEZ[k][0]} liegen so: ${BEZ[k][1]}. Prüfe, ob beide Winkel am selben Schnittpunkt liegen und ob sie zwischen den Parallelen liegen.`, `${BEZ[k][0]}: ${BEZ[k][1]}. Check whether both angles are at the same intersection and whether they lie between the parallels.`) })),
        hinweise: [zw("Gleicher Schnittpunkt: Scheitel- oder Nebenwinkel. Verschiedene Schnittpunkte: Stufen-, Wechsel- oder Nachbarwinkel.", "Same intersection: vertical or adjacent. Different intersections: corresponding, alternate or co-interior.")],
        erklaerung: `${BEZ[au.bez][0]}: ${BEZ[au.bez][1]}.` },
      { id: "wi-wert", titel: zw("Winkel berechnen", "Calculate the angle"), typ: "zahl", text: "? =", einheit: "°", wert: au.gesucht, toleranz: 1e-9, wertText: String(au.gesucht),
        frage: zw("Wie groß ist der gesuchte Winkel?", "How large is the angle you need?"),
        fehler: [{ wert: gleich ? 180 - au.gegeben : au.gegeben, text: gleich ? zw("Diese Winkel sind gleich groß, sie ergänzen sich nicht zu 180°.", "These angles are equal, they don't add up to 180°.") : zw("Diese Winkel ergänzen sich zu 180° – sie sind nicht gleich groß.", "These angles add up to 180° – they are not equal.") }],
        hinweise: [gleich ? zw("Gleich groß.", "Equal.") : `180° − ${au.gegeben}°`],
        erklaerung: gleich ? `${au.gegeben}°` : `180° − ${au.gegeben}° = ${au.gesucht}°` },
    ];
  }
  if (au.art === "dreieck") {
    return [{ id: "wi-dr", titel: zw("Winkelsumme", "Angle sum"), typ: "zahl", text: "γ =", einheit: "°", wert: au.c, toleranz: 1e-9, wertText: String(au.c),
      frage: zw("Berechne γ.", "Calculate γ."),
      fehler: [{ wert: 360 - au.a - au.b, text: zw("360° ist die Winkelsumme im Viereck. Im Dreieck sind es 180°.", "360° is the angle sum of a quadrilateral. In a triangle it is 180°.") }],
      hinweise: [`180° − ${au.a}° − ${au.b}°`], erklaerung: `γ = 180° − ${au.a}° − ${au.b}° = ${au.c}°` }];
  }
  if (au.art === "gleichschenklig") {
    return [
      { id: "wi-gs-r", titel: zw("Eigenschaft", "Property"), typ: "wahl", frage: zw("Was weißt du über die Basiswinkel?", "What do you know about the base angles?"),
        optionen: [["g", zw("Sie sind gleich groß.", "They are equal.")], ["s", zw("Sie ergeben zusammen 90°.", "Together they make 90°.")], ["n", zw("Nichts Besonderes.", "Nothing special.")]], richtig: "g",
        hinweise: [zw("Spiegele das Dreieck an seiner Symmetrieachse.", "Reflect the triangle in its axis of symmetry.")], erklaerung: zw("Basiswinkel sind gleich groß.", "Base angles are equal.") },
      au.spitzeGegeben
        ? { id: "wi-gs-b", titel: zw("Basiswinkel", "Base angle"), typ: "zahl", text: "α =", einheit: "°", wert: au.basis, toleranz: 1e-9, wertText: String(au.basis),
          frage: zw("Berechne einen Basiswinkel.", "Calculate one base angle."),
          fehler: [{ wert: 180 - au.spitze, text: zw("Das ist die Summe beider Basiswinkel – teile noch durch 2.", "That is the sum of both base angles – divide by 2.") }],
          hinweise: [`(180° − ${au.spitze}°) : 2`], erklaerung: `(180° − ${au.spitze}°) : 2 = ${au.basis}°` }
        : { id: "wi-gs-s", titel: zw("Winkel an der Spitze", "Apex angle"), typ: "zahl", text: "γ =", einheit: "°", wert: au.spitze, toleranz: 1e-9, wertText: String(au.spitze),
          frage: zw("Berechne den Winkel an der Spitze.", "Calculate the apex angle."),
          fehler: [{ wert: 180 - au.basis, text: zw("Es gibt zwei Basiswinkel – beide abziehen.", "There are two base angles – subtract both.") }],
          hinweise: [`180° − 2 · ${au.basis}°`], erklaerung: `180° − 2 · ${au.basis}° = ${au.spitze}°` },
    ];
  }
  if (au.art === "aussen") {
    return [
      { id: "wi-au-i", titel: zw("Innenwinkel", "Interior angle"), typ: "zahl", text: "γ =", einheit: "°", wert: au.innen, toleranz: 1e-9, wertText: String(au.innen),
        frage: zw("Berechne zuerst den Innenwinkel γ.", "First calculate the interior angle γ."), hinweise: [`180° − ${au.a}° − ${au.b}°`], erklaerung: `γ = ${au.innen}°` },
      { id: "wi-au-a", titel: zw("Außenwinkel", "Exterior angle"), typ: "zahl", text: "γ′ =", einheit: "°", wert: au.aussen, toleranz: 1e-9, wertText: String(au.aussen),
        frage: zw("Der Außenwinkel γ′ ist der Nebenwinkel von γ. Wie groß ist er?", "The exterior angle γ′ is adjacent to γ. How large is it?"),
        fehler: [{ wert: au.innen, text: zw("Das ist der Innenwinkel. Der Außenwinkel ergänzt ihn zu 180°.", "That's the interior angle. The exterior angle makes it up to 180°.") }],
        hinweise: [`180° − ${au.innen}°`], erklaerung: zw(`γ′ = 180° − ${au.innen}° = ${au.aussen}° = α + β. Der Außenwinkel ist so groß wie die beiden nicht anliegenden Innenwinkel zusammen.`, `γ′ = 180° − ${au.innen}° = ${au.aussen}° = α + β. The exterior angle equals the two non-adjacent interior angles combined.`) },
    ];
  }
  if (au.art === "neck") {
    return [
      { id: "wi-n-d", titel: zw("In Dreiecke zerlegen", "Split into triangles"), typ: "zahl", text: zw("Dreiecke:", "Triangles:"), wert: au.n - 2, toleranz: 1e-9, wertText: String(au.n - 2),
        frage: zw("In wie viele Dreiecke zerfällt das n-Eck, wenn du von einer Ecke aus alle Diagonalen zeichnest?", "Into how many triangles does the polygon split if you draw all diagonals from one corner?"),
        fehler: [{ wert: au.n, text: zw("Von einer Ecke aus entstehen zwei Dreiecke weniger, als es Ecken gibt.", "From one corner you get two fewer triangles than there are corners.") }, { wert: au.n - 3, text: zw("Das ist die Zahl der Diagonalen. Es entsteht ein Dreieck mehr.", "That is the number of diagonals. There is one more triangle.") }],
        hinweise: [zw("Probier es beim Viereck: eine Diagonale, zwei Dreiecke.", "Try a quadrilateral: one diagonal, two triangles.")], erklaerung: `${au.n} − 2 = ${au.n - 2}` },
      { id: "wi-n-s", titel: zw("Winkelsumme", "Angle sum"), typ: "zahl", text: zw("Summe =", "Sum ="), einheit: "°", wert: au.summe, toleranz: 1e-9, wertText: String(au.summe),
        frage: zw("Wie groß ist die Innenwinkelsumme?", "What is the interior angle sum?"),
        fehler: [{ wert: au.n * 180, text: zw("Mit n · 180° zählst du zwei Dreiecke zu viel.", "With n · 180° you count two triangles too many.") }],
        hinweise: [`${au.n - 2} · 180°`], erklaerung: `(${au.n} − 2) · 180° = ${au.summe}°` },
    ];
  }
  return [
    { id: "wi-r-s", titel: zw("Winkelsumme", "Angle sum"), typ: "zahl", text: zw("Summe =", "Sum ="), einheit: "°", wert: au.summe, toleranz: 1e-9, wertText: String(au.summe),
      frage: zw(`Wie groß ist die Innenwinkelsumme im ${au.n}-Eck?`, `What is the interior angle sum of a ${au.n}-gon?`), hinweise: [`(${au.n} − 2) · 180°`], erklaerung: `${au.summe}°` },
    { id: "wi-r-i", titel: zw("Ein Innenwinkel", "One interior angle"), typ: "zahl", text: "α =", einheit: "°", wert: au.innen, toleranz: 1e-9, wertText: zt(au.innen, 2),
      frage: zw("Alle Winkel sind gleich groß. Wie groß ist einer?", "All angles are equal. How large is one?"),
      fehler: [{ wert: au.aussen, text: zw("Das ist der Außenwinkel 360° : n. Der Innenwinkel ergänzt ihn zu 180°.", "That's the exterior angle 360° : n. The interior angle makes it up to 180°.") }],
      hinweise: [`${au.summe}° : ${au.n}`], erklaerung: `${au.summe}° : ${au.n} = ${zt(au.innen, 2)}°` },
  ];
}

function text(au) {
  if (au.art === "parallel") return zw(`Die Geraden g und h sind parallel. Der goldene Winkel ist ${au.gegeben}°. Gesucht ist der grüne Winkel.`, `Lines g and h are parallel. The gold angle is ${au.gegeben}°. You need the green angle.`);
  if (au.art === "dreieck") return zw(`In einem Dreieck ist α = ${au.a}° und β = ${au.b}°.`, `In a triangle α = ${au.a}° and β = ${au.b}°.`);
  if (au.art === "gleichschenklig") return au.spitzeGegeben ? zw(`Ein gleichschenkliges Dreieck hat an der Spitze den Winkel γ = ${au.spitze}°.`, `An isosceles triangle has the apex angle γ = ${au.spitze}°.`) : zw(`Ein gleichschenkliges Dreieck hat die Basiswinkel α = β = ${au.basis}°.`, `An isosceles triangle has base angles α = β = ${au.basis}°.`);
  if (au.art === "aussen") return zw(`In einem Dreieck ist α = ${au.a}° und β = ${au.b}°. Bei C wird die Seite b über C hinaus verlängert.`, `In a triangle α = ${au.a}° and β = ${au.b}°. At C, side b is extended beyond C.`);
  if (au.art === "neck") return zw(`Ein ${au.n}-Eck (nicht unbedingt regelmäßig).`, `A ${au.n}-gon (not necessarily regular).`);
  return zw(`Ein regelmäßiges ${au.n}-Eck.`, `A regular ${au.n}-gon.`);
}

function skizze(au) {
  if (au.art === "parallel") {
    return <ParallelFigur phi={au.phi} hoehe={220} marken={[{ s: au.s1, lage: au.l1, text: `${au.gegeben}°` }, { s: au.s2, lage: au.l2, text: "?", farbe: C.smaragd }]} />;
  }
  if (au.art === "neck" || au.art === "regelmaessig") {
    const pts = regelVieleck(au.n);
    return (
      <Zeichenblatt punkte={[[-3.3, -3.3], [3.3, 3.3]]} hoehe={170} rand={10} label={zw("Vieleck", "Polygon")}
        kinder={(zz) => <>{zz.vieleck(pts, `${C.see}10`, C.tinte, 2)}{au.art === "regelmaessig" && zz.bogen(pts[0], pts[1], pts[pts.length - 1], "?", C.flaggold, 18)}</>} />
    );
  }
  const A = [0, 0], B = [6, 0], Cp = au.art === "gleichschenklig" ? [3, 3.4] : [2.2, 3.3];
  const verl = [Cp[0] + (Cp[0] - A[0]) * 0.55, Cp[1] + (Cp[1] - A[1]) * 0.55];
  return (
    <Zeichenblatt punkte={[[-0.5, -0.5], [6.5, au.art === "aussen" ? verl[1] + 0.3 : 3.9]]} hoehe={180} rand={22} label={zw("Dreieck", "Triangle")}
      kinder={(zz) => (
        <>
          {zz.vieleck([A, B, Cp], `${C.see}10`, C.tinte, 2)}
          {au.art === "aussen" && zz.linie(Cp, verl, C.tinte, 2, "5 4")}
          {au.art === "dreieck" && <>{zz.bogen(A, B, Cp, `${au.a}°`, C.flaggold, 24)}{zz.bogen(B, Cp, A, `${au.b}°`, C.flaggold, 24)}{zz.bogen(Cp, A, B, "?", C.smaragd, 20)}</>}
          {au.art === "aussen" && <>{zz.bogen(A, B, Cp, `${au.a}°`, C.flaggold, 24)}{zz.bogen(B, Cp, A, `${au.b}°`, C.flaggold, 24)}{zz.bogen(Cp, B, verl, "γ′", C.smaragd, 20)}</>}
          {au.art === "gleichschenklig" && (au.spitzeGegeben
            ? <>{zz.bogen(Cp, A, B, `${au.spitze}°`, C.flaggold, 20)}{zz.bogen(A, B, Cp, "?", C.smaragd, 24)}{zz.bogen(B, Cp, A, "?", C.smaragd, 24)}</>
            : <>{zz.bogen(A, B, Cp, `${au.basis}°`, C.flaggold, 24)}{zz.bogen(B, Cp, A, `${au.basis}°`, C.flaggold, 24)}{zz.bogen(Cp, A, B, "?", C.smaragd, 20)}</>)}
          {zz.punkt(A, "A", -8, 14)}{zz.punkt(B, "B", 8, 14)}{zz.punkt(Cp, "C", 0, -10)}
        </>
      )} />
  );
}

const hilfe = (au) => hilfeKontext({
  id: `winkel-${au.art}`, aufgabe: "Winkel Scheitelwinkel Nebenwinkel Stufenwinkel Wechselwinkel Winkelsumme Dreieck n-Eck",
  verstehen: [zw("Markiere, welche Winkel gegeben und welche gesucht sind.", "Mark which angles are given and which you need.")],
  ansatz: [zw("Gleich groß: Scheitel-, Stufen-, Wechselwinkel. Zusammen 180°: Neben- und Nachbarwinkel.", "Equal: vertical, corresponding, alternate. Together 180°: adjacent and co-interior.")],
  regel: [zw("Dreieck: 180°. n-Eck: (n − 2) · 180°.", "Triangle: 180°. n-gon: (n − 2) · 180°.")],
  pruefen: [zw("Spitzer Winkel sieht spitz aus, stumpfer stumpf – passt dein Ergebnis zur Skizze?", "Acute looks acute, obtuse looks obtuse – does your result match the sketch?")],
});

const MODI = [["entdecken", zw("Entdecken", "Explore")], ["ueben", zw("Trainieren", "Train")]];

export function Winkelsaetze() {
  const [modus, setModus] = useState(() => startModus("winkelsaetze"));   // Wunsch einer Lernseite (uebenWunsch.js)
  const kurzErklaert = (
      <Aufklapp titel={zw("Kurz erklärt", "In short")}>
          <p style={{ margin: "0 0 6px" }}>{zw("Gleich groß: Scheitelwinkel, Stufenwinkel und Wechselwinkel (an Parallelen). Zusammen 180°: Nebenwinkel und Nachbarwinkel.", "Equal: vertical, corresponding and alternate angles (at parallels). Together 180°: adjacent and co-interior angles.")}</p>
          <p style={{ margin: "0 0 6px", textAlign: "center", fontSize: 16 }}><M t="α + β + γ = 180°" /></p>
          <p style={{ margin: 0 }}>{zw("Im n-Eck ist die Innenwinkelsumme (n − 2) · 180°, im regelmäßigen n-Eck ist jeder Innenwinkel (n − 2) · 180° : n.", "In an n-gon the interior angle sum is (n − 2) · 180°; in a regular n-gon each interior angle is (n − 2) · 180° : n.")}</p>
        </Aufklapp>
  );
  return (
    <Seite titel={zw("Winkel und Winkelsummen", "Angles and angle sums")}
      text={zw("Scheitel-, Neben-, Stufen- und Wechselwinkel, die Winkelsumme im Dreieck und im n-Eck: die Werkzeuge, mit denen man jeden fehlenden Winkel findet.",
        "Vertical, adjacent, corresponding and alternate angles, the angle sum in triangles and polygons: the tools to find any missing angle.")} knapp={modus === "ueben"}>
      <ModusLeiste modi={MODI} modus={modus} setModus={setModus} label={zw("Winkelsätze", "Angle theorems")} />
      {modus === "entdecken" && kurzErklaert}
      <div style={{ display: modus === "entdecken" ? "block" : "none" }}><Entdecken /></div>
      <div style={{ display: modus === "ueben" ? "block" : "none" }}>
      {modus === "ueben" && kurzErklaert}
        <UebenRahmen titel={TITEL} arten={WINKEL_ARTEN} neue={neue} schritte={schritte} text={text} skizze={skizze} hilfe={hilfe} />
      </div>
    </Seite>
  );
}
