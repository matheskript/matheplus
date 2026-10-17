/* ============================================================
   Mittelstufe · Geometrie: Kongruenzsätze
   SSS, SWS, WSW (mit SWW) und SsW – und warum SSW mit dem Winkel
   gegenüber der kleineren Seite und WWW nicht reichen.
   · Entdecken – je Fall eine Konstruktion mit Reglern: Wie viele
     Dreiecke passen zu den gegebenen Stücken? (0, 1, 2, unendlich)
   · Üben – „Welcher Satz?“ und „Wie viele Dreiecke?“ zu Angaben in
     Schulbuch-Bezeichnung; Begründen an Figuren (Parallelogramm,
     gleichschenkliges Dreieck, Kreuz, Drachen).
   Mathematik in geoMittel.js (getestet).
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useMemo, useState } from "react";
import { C } from "./base1.jsx";
import { IchHaengeFest } from "./funcHilfe.jsx";
import { Auswahl, GrosserKnopf, hilfeKontext, hinweis, karte, kicker, zw } from "./ui2.jsx";
import { Aufklapp, ModusLeiste, Seite, SchrittFolge, zt } from "./ui3.jsx";
import { GRAD, KONG_FIGUREN, kongruenzAufgabe, ssw, sssMoeglich } from "./geoMittel.js";
import { Merke, Regler, Zeichenblatt, add, mitte, polar } from "./geoUi.jsx";

let zaehler = 0;
const z1 = (v) => zt(v, 1);
const G = "#8A6A00";   // Gold als Textfarbe (lesbar auf Weiß)

/* ---------- Entdecken ---------- */
const FAELLE = [
  ["sss", "SSS"], ["sws", "SWS"], ["wsw", "WSW"], ["ssw", zw("SsW / SSW", "SsW / SSW")], ["www", "WWW"],
];

function Ergebnis({ anzahl, text }) {
  const farbe = anzahl === 1 ? C.smaragd : anzahl === 0 ? C.gruen : C.see;
  const t = anzahl === 1 ? zw("genau ein Dreieck", "exactly one triangle") : anzahl === 0 ? zw("kein Dreieck", "no triangle")
    : anzahl === 2 ? zw("zwei verschiedene Dreiecke", "two different triangles") : zw("unendlich viele Dreiecke", "infinitely many triangles");
  return (
    <Merke farbe={farbe}>
      <b style={{ color: farbe }}>{t}</b>{text ? <> – {text}</> : null}
    </Merke>
  );
}

function FallSSS() {
  const [a, setA] = useState(4);
  const [c, setC] = useState(6);
  const b = 5;
  const A = [0, 0], B = [c, 0];
  const ok = sssMoeglich(a, b, c);
  const x = (b * b - a * a + c * c) / (2 * c);
  const Cp = ok ? [x, Math.sqrt(Math.max(0, b * b - x * x))] : null;
  return (
    <>
      <Regler name="a" wert={a} setWert={setA} min={1} max={9} schritt={0.5} />
      <div style={{ height: 8 }} />
      <Regler name="c" wert={c} setWert={setC} min={1} max={10} schritt={0.5} farbe={C.gruen} />
      <p style={{ fontSize: 12.5, color: C.grau, margin: "8px 0 0" }}>{zw("b = 5 bleibt fest. Kreis um A mit Radius b, Kreis um B mit Radius a – C liegt auf beiden.", "b = 5 stays fixed. Circle around A with radius b, circle around B with radius a – C lies on both.")}</p>
      <div style={{ marginTop: 10, background: C.sand, borderRadius: 14, padding: 6 }}>
        <Zeichenblatt punkte={[[-b, -b], [Math.max(c + a, b), b]]} hoehe={260} rand={14} label={zw("Konstruktion SSS mit zwei Kreisen", "SSS construction with two circles")}
          kinder={(zz) => (
            <>
              {zz.kreis(A, b, `${C.see}88`, 1.3, "none", "5 4")}
              {zz.kreis(B, a, `${G}AA`, 1.3, "none", "5 4")}
              {zz.linie(A, B, C.gruen, 3)}
              {Cp && zz.vieleck([A, B, Cp], `${C.see}14`, C.tinte, 2)}
              {Cp && zz.vieleck([A, B, [Cp[0], -Cp[1]]], "none", C.hellgrau, 1.2)}
              {Cp && zz.mass(A, Cp, "b", -1, C.see, 12)}
              {Cp && zz.mass(B, Cp, "a", 1, G, 12)}
              {zz.mass(A, B, "c", 1, C.gruen, 12)}
              {zz.punkt(A, "A", -8, 14)}{zz.punkt(B, "B", 8, 14)}
              {Cp && zz.punkt(Cp, "C", 0, -10)}
            </>
          )} />
      </div>
      <Ergebnis anzahl={ok ? 1 : 0} text={ok
        ? zw("Das gespiegelte Dreieck unten ist deckungsgleich (kongruent). Drei Seiten legen das Dreieck fest: SSS.", "The mirrored triangle below is congruent. Three sides fix the triangle: SSS.")
        : zw("Die Kreise treffen sich nicht. Jede Seite muss kürzer sein als die beiden anderen zusammen (Dreiecksungleichung).", "The circles don't meet. Each side must be shorter than the other two together (triangle inequality).")} />
    </>
  );
}

function FallSWS() {
  const [b, setB] = useState(4);
  const [c, setC] = useState(6);
  const [al, setAl] = useState(50);
  const A = [0, 0], B = [c, 0], Cp = polar(b, al);
  return (
    <>
      <div style={{ display: "grid", gap: 8 }}>
        <Regler name="b" wert={b} setWert={setB} min={1} max={8} schritt={0.5} />
        <Regler name="c" wert={c} setWert={setC} min={1} max={9} schritt={0.5} farbe={C.gruen} />
        <Regler name="α" wert={al} setWert={setAl} min={10} max={170} schritt={5} farbe={G} format={(v) => `${zt(v, 0)}°`} />
      </div>
      <div style={{ marginTop: 10, background: C.sand, borderRadius: 14, padding: 6 }}>
        <Zeichenblatt punkte={[[-3, 0], [9, 7.5], A, B, Cp]} hoehe={230} rand={18} label={zw("Konstruktion SWS", "SWS construction")}
          kinder={(zz) => (
            <>
              {zz.vieleck([A, B, Cp], `${C.see}14`, C.tinte, 1.6)}
              {zz.linie(A, B, C.gruen, 3.2)}
              {zz.linie(A, Cp, C.see, 3.2)}
              {zz.bogen(A, B, Cp, `${zt(al, 0)}°`, C.flaggold, 22)}
              {zz.mass(A, Cp, "b", -1, C.see, 12)}{zz.mass(A, B, "c", 1, C.gruen, 12)}
              {zz.punkt(A, "A", -8, 14)}{zz.punkt(B, "B", 8, 14)}{zz.punkt(Cp, "C", 0, -10)}
            </>
          )} />
      </div>
      <Ergebnis anzahl={1} text={zw("Der Winkel liegt zwischen den beiden Seiten (eingeschlossen). Dann gibt es nur eine Verbindung von B nach C: SWS.", "The angle lies between the two sides (included). Then there is only one way to join B and C: SWS.")} />
    </>
  );
}

function FallWSW() {
  const [c, setC] = useState(6);
  const [al, setAl] = useState(50);
  const [be, setBe] = useState(60);
  const A = [0, 0], B = [c, 0];
  const ok = al + be < 180;
  const t = ok ? (c * Math.sin(be * GRAD)) / Math.sin((al + be) * GRAD) : 0;
  const Cp = ok ? polar(t, al) : null;
  const strahl = (P, w) => add(P, polar(Math.max(4, c * 0.9), w));
  return (
    <>
      <div style={{ display: "grid", gap: 8 }}>
        <Regler name="c" wert={c} setWert={setC} min={2} max={9} schritt={0.5} farbe={C.gruen} />
        <Regler name="α" wert={al} setWert={setAl} min={10} max={160} schritt={5} farbe={G} format={(v) => `${zt(v, 0)}°`} />
        <Regler name="β" wert={be} setWert={setBe} min={10} max={160} schritt={5} farbe={G} format={(v) => `${zt(v, 0)}°`} />
      </div>
      <div style={{ marginTop: 10, background: C.sand, borderRadius: 14, padding: 6 }}>
        <Zeichenblatt punkte={[[-1, 0], [c + 1, 0], ...(Cp && t < 14 ? [Cp] : [[0, 5]]), strahl(A, al), strahl(B, 180 - be)]} hoehe={230} rand={18} label={zw("Konstruktion WSW", "ASA construction")}
          kinder={(zz) => (
            <>
              {zz.linie(A, strahl(A, al), C.hellgrau, 1.2, "5 4")}
              {zz.linie(B, strahl(B, 180 - be), C.hellgrau, 1.2, "5 4")}
              {Cp && t < 14 && zz.vieleck([A, B, Cp], `${C.see}14`, C.tinte, 1.6)}
              {zz.linie(A, B, C.gruen, 3.2)}
              {zz.bogen(A, B, strahl(A, al), `${zt(al, 0)}°`, C.flaggold, 22)}
              {zz.bogen(B, strahl(B, 180 - be), A, `${zt(be, 0)}°`, C.flaggold, 22)}
              {zz.mass(A, B, "c", 1, C.gruen, 12)}
              {zz.punkt(A, "A", -8, 14)}{zz.punkt(B, "B", 8, 14)}
              {Cp && t < 14 && zz.punkt(Cp, "C", 0, -10)}
            </>
          )} />
      </div>
      <Ergebnis anzahl={ok ? 1 : 0} text={ok
        ? zw("Die beiden freien Schenkel schneiden sich in genau einem Punkt C: WSW. Kennst du statt eines anliegenden den gegenüberliegenden Winkel (SWW), rechnest du den dritten mit der Winkelsumme aus – und bist wieder bei WSW.", "The two free arms meet in exactly one point C: ASA. If you know the opposite angle instead of an adjacent one (AAS), work out the third with the angle sum – and you are back at ASA.")
        : zw(`α + β = ${zt(al + be, 0)}° – die Schenkel laufen nicht aufeinander zu. Zwei Winkel im Dreieck müssen zusammen kleiner als 180° sein.`, `α + β = ${zt(al + be, 0)}° – the arms don't meet. Two angles in a triangle must add up to less than 180°.`)} />
    </>
  );
}

function FallSSW() {
  const [a, setA] = useState(4.5);
  const [al, setAl] = useState(40);
  const b = 6;
  const A = [0, 0], Cp = polar(b, al);
  const r = ssw(b, a, al);
  const Bs = r.xs.map((x) => [x, 0]);
  const gross = a > b;
  const text = r.anzahl === 0
    ? zw(`a = ${z1(a)} ist kürzer als der Abstand von C zum Schenkel (${z1(r.h)}). Der Kreis um C erreicht den Schenkel nicht.`, `a = ${z1(a)} is shorter than the distance from C to the arm (${z1(r.h)}). The circle around C doesn't reach the arm.`)
    : r.anzahl === 2
      ? zw("Der Kreis um C schneidet den Schenkel zweimal: B₁ und B₂ liefern zwei verschiedene Dreiecke. Der Winkel liegt der kleineren Seite gegenüber – das reicht nicht.", "The circle around C cuts the arm twice: B₁ and B₂ give two different triangles. The angle is opposite the smaller side – that is not enough.")
      : gross
        ? zw("Der Winkel liegt der größeren Seite gegenüber (a > b): Der zweite Schnittpunkt liegt hinter A, es bleibt genau ein Dreieck. Das ist SsW.", "The angle is opposite the larger side (a > b): the second intersection lies behind A, so exactly one triangle remains. That is SsA.")
        : zw("Genau ein Schnittpunkt – Sonderfall. Sicher eindeutig ist es erst, wenn der Winkel der größeren Seite gegenüberliegt (SsW).", "Exactly one intersection – a special case. It is only guaranteed unique if the angle is opposite the larger side (SsA).");
  return (
    <>
      <div style={{ display: "grid", gap: 8 }}>
        <Regler name={zw("a (gegenüber)", "a (opposite)")} wert={a} setWert={setA} min={1} max={9} schritt={0.25} farbe={G} breiteName={96} />
        <Regler name="α" wert={al} setWert={setAl} min={20} max={80} schritt={5} farbe={C.gruen} format={(v) => `${zt(v, 0)}°`} breiteName={96} />
      </div>
      <p style={{ fontSize: 12.5, color: C.grau, margin: "8px 0 0" }}>{zw("b = 6 bleibt fest. α liegt an b an und der Seite a gegenüber. B muss auf dem Schenkel liegen und von C den Abstand a haben.", "b = 6 stays fixed. α is adjacent to b and opposite side a. B must lie on the arm at distance a from C.")}</p>
      <div style={{ marginTop: 10, background: C.sand, borderRadius: 14, padding: 6 }}>
        <Zeichenblatt punkte={[[-1.5, -1], [12, 6.5]]} hoehe={230} rand={14} label={zw("Konstruktion SSW mit einem Kreis um C", "SSA construction with a circle around C")}
          kinder={(zz) => (
            <>
              {zz.linie(A, [12, 0], C.hellgrau, 1.3)}
              {zz.kreis(Cp, a, `${G}AA`, 1.3, "none", "5 4")}
              {Bs.map((B, i) => zz.vieleck([A, B, Cp], i ? `${C.smaragd}1A` : `${C.see}14`, i ? C.smaragd : C.tinte, 1.6, `t${i}`))}
              {zz.linie(A, Cp, C.see, 3.2)}
              {zz.bogen(A, [5, 0], Cp, `${zt(al, 0)}°`, C.gruen, 22)}
              {zz.mass(A, Cp, "b", -1, C.see, 12)}
              {zz.punkt(A, "A", -8, 14)}{zz.punkt(Cp, "C", 0, -10)}
              {Bs.map((B, i) => zz.punkt(B, Bs.length > 1 ? `B${i ? "₂" : "₁"}` : "B", 0, 16, i ? C.smaragd : C.tinte, 3.6, `b${i}`))}
            </>
          )} />
      </div>
      <Ergebnis anzahl={r.anzahl} text={text} />
    </>
  );
}

function FallWWW() {
  const [k, setK] = useState(1.6);
  const al = 50, be = 65;
  const dreieck = (c, x0) => {
    const t = (c * Math.sin(be * GRAD)) / Math.sin((al + be) * GRAD);
    return [[x0, 0], [x0 + c, 0], add([x0, 0], polar(t, al))];
  };
  const d1 = dreieck(3, 0), d2 = dreieck(3 * k, 4);
  return (
    <>
      <Regler name={zw("Größe", "Size")} wert={k} setWert={setK} min={0.6} max={2.2} schritt={0.1} format={(v) => `${zt(v, 1)} ×`} breiteName={58} />
      <div style={{ marginTop: 10, background: C.sand, borderRadius: 14, padding: 6 }}>
        <Zeichenblatt punkte={[...d1, ...d2, [11, 0]]} hoehe={200} rand={18} label={zw("Zwei Dreiecke mit gleichen Winkeln", "Two triangles with equal angles")}
          kinder={(zz) => (
            <>
              {zz.vieleck(d1, `${C.see}14`, C.tinte, 1.8)}
              {zz.vieleck(d2, `${C.smaragd}1A`, C.smaragd, 1.8)}
              {[d1, d2].map((d, i) => (
                <g key={i}>{zz.bogen(d[0], d[1], d[2], "50°", C.flaggold, 16)}{zz.bogen(d[1], d[2], d[0], "65°", C.flaggold, 16)}{zz.bogen(d[2], d[0], d[1], "65°", C.flaggold, 14)}</g>
              ))}
            </>
          )} />
      </div>
      <Ergebnis anzahl="unendlich" text={zw("Gleiche Winkel, aber beliebige Größe: Die Dreiecke sind ähnlich, nicht kongruent. Drei Winkel legen nur die Form fest, nicht die Größe.", "Equal angles but any size: the triangles are similar, not congruent. Three angles fix only the shape, not the size.")} />
    </>
  );
}

function Entdecken() {
  const [fall, setFall] = useState("sss");
  const INFO = {
    sss: zw("Drei Seiten gegeben.", "Three sides given."),
    sws: zw("Zwei Seiten und der Winkel dazwischen.", "Two sides and the angle between them."),
    wsw: zw("Eine Seite und die beiden Winkel an ihren Enden.", "One side and the two angles at its ends."),
    ssw: zw("Zwei Seiten und ein Winkel, der nicht dazwischen liegt.", "Two sides and an angle that is not between them."),
    www: zw("Nur drei Winkel.", "Only three angles."),
  };
  return (
    <>
      <div style={{ ...karte, marginTop: 16 }}>
        <p style={kicker}>{zw("Was ist gegeben?", "What is given?")}</p>
        <Auswahl optionen={FAELLE} wert={fall} setWert={setFall} label={zw("Fall wählen", "Choose a case")} />
        <p style={{ fontSize: 13.5, color: C.see, fontWeight: 600, margin: "12px 0 10px" }}>{INFO[fall]}</p>
        {fall === "sss" && <FallSSS />}
        {fall === "sws" && <FallSWS />}
        {fall === "wsw" && <FallWSW />}
        {fall === "ssw" && <FallSSW />}
        {fall === "www" && <FallWWW />}
      </div>
    </>
  );
}

/* ---------- Referenzdreieck mit hervorgehobenen Stücken ---------- */
const REF = { A: [0, 0], B: [6, 0], C: [2.2, 3.4] };
function ReferenzDreieck({ stuecke }) {
  const hat = (n) => stuecke.find((s) => s.name === n);
  const wertText = (s) => (s.t === "S" ? `${s.name} = ${z1(s.wert)}` : `${s.name} = ${zt(s.wert, 0)}°`);
  const seite = (n, P, Q, sz) => {
    const s = hat(n);
    return s ? <g key={n}>{sz.linie(P, Q, C.flaggold, 4.5)}{sz.mass(P, Q, wertText(s), n === "b" ? -1 : 1, G, 16)}</g>
      : sz.text(add(mitte(P, Q), n === "c" ? [0, -0.45] : n === "a" ? [0.35, 0.3] : [-0.4, 0.25]), n, C.grau, 13, "middle", 600);
  };
  const winkel = (n, S, P, Q, sz) => {
    const s = hat(n);
    return sz.bogen(S, P, Q, s ? `${zt(s.wert, 0)}°` : n, s ? C.flaggold : C.hellgrau, s ? 22 : 16);
  };
  return (
    <Zeichenblatt punkte={[[-0.6, -0.6], [6.6, 3.9]]} hoehe={200} rand={20} label={zw("Dreieck ABC mit den gegebenen Stücken", "Triangle ABC with the given parts")}
      kinder={(sz) => (
        <>
          {sz.vieleck([REF.A, REF.B, REF.C], `${C.see}0D`, C.tinte, 1.8)}
          {winkel("α", REF.A, REF.B, REF.C, sz)}{winkel("β", REF.B, REF.C, REF.A, sz)}{winkel("γ", REF.C, REF.A, REF.B, sz)}
          {seite("c", REF.A, REF.B, sz)}{seite("a", REF.B, REF.C, sz)}{seite("b", REF.A, REF.C, sz)}
          {sz.punkt(REF.A, "A", -8, 14)}{sz.punkt(REF.B, "B", 8, 14)}{sz.punkt(REF.C, "C", 0, -10)}
        </>
      )} />
  );
}

/* ---------- Figuren zum Begründen ---------- */
function FigurSkizze({ id }) {
  const P = {
    parallelogramm: { pts: { A: [0, 0], B: [5, 0], C: [6.5, 3], D: [1.5, 3] }, linien: [["A", "B"], ["B", "C"], ["C", "D"], ["D", "A"]], hilfs: [["A", "C"]] },
    gleichschenklig: { pts: { A: [0, 0], B: [6, 0], C: [3, 4], M: [3, 0] }, linien: [["A", "B"], ["B", "C"], ["C", "A"]], hilfs: [["C", "M"]] },
    kreuz: { pts: { A: [0, 0], C: [6, 3], B: [0.5, 3.4], D: [5.5, -0.4], S: [3, 1.5] }, linien: [["A", "B"], ["C", "D"]], hilfs: [["A", "C"], ["B", "D"]] },
    drachen: { pts: { A: [0, 2], B: [2.2, 3.6], C: [7, 2], D: [2.2, 0.4] }, linien: [["A", "B"], ["B", "C"], ["C", "D"], ["D", "A"]], hilfs: [["A", "C"]] },
  }[id];
  const pos = { A: [-10, 4], B: [8, -6], C: [10, 4], D: [-8, 14], M: [0, 16], S: [0, -10] };
  if (id === "parallelogramm") Object.assign(pos, { A: [-8, 14], B: [8, 14], C: [8, -6], D: [-8, -6] });
  if (id === "gleichschenklig") Object.assign(pos, { A: [-8, 14], B: [8, 14], C: [0, -10] });
  if (id === "drachen") Object.assign(pos, { A: [-10, 4], B: [0, -10], C: [10, 4], D: [0, 18] });
  return (
    <Zeichenblatt punkte={Object.values(P.pts)} hoehe={190} rand={26} label={zw("Figur zur Aufgabe", "Figure for the exercise")}
      kinder={(zz) => (
        <>
          {P.linien.map(([u, v]) => zz.linie(P.pts[u], P.pts[v], C.tinte, 2, undefined, `${u}${v}`))}
          {P.hilfs.map(([u, v]) => zz.linie(P.pts[u], P.pts[v], C.see, 2, "6 4", `h${u}${v}`))}
          {Object.entries(P.pts).map(([n, p]) => zz.punkt(p, n, pos[n][0], pos[n][1], C.tinte, 3.2, n))}
        </>
      )} />
  );
}

/* ---------- Modus 2: Üben ---------- */
export function neueAufgabe(art) {
  if (art === "figur" || (!art && Math.random() < 0.25)) {
    const f = KONG_FIGUREN[Math.floor(Math.random() * KONG_FIGUREN.length)];
    return { id: ++zaehler, art: "figur", figur: f };
  }
  return { id: ++zaehler, ...kongruenzAufgabe(art) };
}

const SATZ_OPT = [["SSS", "SSS"], ["SWS", "SWS"], ["WSW", zw("WSW (auch SWW)", "ASA (also AAS)")], ["SsW", "SsW"], ["keiner", zw("keiner – nicht eindeutig", "none – not unique")]];
const ANZ_OPT = [["0", zw("kein", "none")], ["1", zw("genau eins", "exactly one")], ["2", zw("zwei", "two")], ["unendlich", zw("unendlich viele", "infinitely many")]];

const angabe = (st) => st.map((s) => (s.t === "S" ? `${s.name} = ${z1(s.wert)} cm` : `${s.name} = ${zt(s.wert, 0)}°`)).join(", ");

function satzFehler(au) {
  const f = [];
  const t = {
    SWS: zw("SWS braucht den Winkel zwischen den beiden Seiten. γ liegt zwischen a und b, α zwischen b und c, β zwischen a und c.", "SAS needs the angle between the two sides. γ lies between a and b, α between b and c, β between a and c."),
    SsW: zw("SsW verlangt, dass der Winkel der größeren der beiden Seiten gegenüberliegt.", "SsA requires the angle to be opposite the larger of the two sides."),
    WSW: zw("WSW braucht zwei Winkel und eine Seite.", "ASA needs two angles and one side."),
    SSS: zw("SSS braucht drei Seiten.", "SSS needs three sides."),
    keiner: au.satz === "WSW" && au.sww ? zw("Den dritten Winkel bekommst du über die Winkelsumme. Dann liegen an der Seite beide Winkel an – WSW.", "You get the third angle from the angle sum. Then both angles at the side are known – ASA.")
      : zw("Hier passt ein Kongruenzsatz.", "A congruence theorem fits here."),
  };
  for (const [k] of SATZ_OPT) if (k !== au.satz) f.push({ wahl: k, text: t[k] });
  return f;
}

export function schritteVon(au) {
  if (au.art === "figur") {
    const f = au.figur;
    const andere = KONG_FIGUREN.filter((x) => x.id !== f.id).map((x) => x.gleich);
    const opts = [["r", f.gleich.join(" · ")], ["x", andere[0].join(" · ")], ["y", andere[1].join(" · ")]].sort((p, q) => p[1].localeCompare(q[1]));
    return [
      { id: "ko-fig-st", titel: zw("Übereinstimmende Stücke", "Matching parts"), typ: "wahl",
        frage: zw("Welche drei Stücke stimmen in den beiden Dreiecken überein?", "Which three parts match in the two triangles?"),
        optionen: opts, richtig: "r",
        hinweise: [zw("Suche gemeinsame Seiten, gleich lange Strecken aus der Angabe und Winkel an Parallelen oder Scheitelwinkel.", "Look for shared sides, equal lengths from the text, and angles at parallels or vertical angles.")],
        erklaerung: f.gleich.join(", ") },
      { id: "ko-fig-satz", titel: zw("Kongruenzsatz", "Congruence theorem"), typ: "wahl",
        frage: zw("Welcher Kongruenzsatz begründet die Kongruenz?", "Which congruence theorem justifies it?"),
        optionen: SATZ_OPT.slice(0, 4), richtig: f.satz,
        hinweise: [zw("Zähle: Wie viele Seiten, wie viele Winkel? Liegt der Winkel zwischen den Seiten?", "Count: how many sides, how many angles? Is the angle between the sides?")],
        erklaerung: zw(`${f.satz}: ${f.gleich.join(", ")}.`, `${f.satz}: ${f.gleich.join(", ")}.`) },
    ];
  }
  const anzahlText = String(au.anzahl);
  const sswFall = au.art.startsWith("ssw");
  const schritte = [];
  if (sswFall) {
    const w = au.stuecke.find((s) => s.t === "W");
    schritte.push({ id: "ko-zw", titel: zw("Lage des Winkels", "Position of the angle"), typ: "wahl",
      frage: zw(`Liegt ${w.name} zwischen den beiden gegebenen Seiten?`, `Does ${w.name} lie between the two given sides?`),
      optionen: [["ja", zw("ja", "yes")], ["nein", zw("nein – er liegt einer der Seiten gegenüber", "no – it is opposite one of the sides")]], richtig: "nein",
      fehler: [{ wahl: "ja", text: zw(`${w.name} liegt der Seite ${au.stuecke[0].name} gegenüber. Zwischen zwei Seiten liegt nur der Winkel, an dem beide anliegen.`, `${w.name} is opposite side ${au.stuecke[0].name}. Only the angle at which both sides meet lies between them.`) }],
      hinweise: [zw("Winkel und Seite gehören zusammen, wenn sie den gleichen Buchstaben haben (α gegenüber a).", "An angle and a side belong together if they share a letter (α opposite a).")],
      erklaerung: zw(`${w.name} liegt ${au.stuecke[0].name} gegenüber (${au.stuecke[0].name} = ${z1(au.stuecke[0].wert)}, ${au.stuecke[1].name} = ${z1(au.stuecke[1].wert)}).`, `${w.name} is opposite ${au.stuecke[0].name} (${au.stuecke[0].name} = ${z1(au.stuecke[0].wert)}, ${au.stuecke[1].name} = ${z1(au.stuecke[1].wert)}).`) });
  }
  schritte.push({ id: "ko-satz", titel: zw("Welcher Satz?", "Which theorem?"), typ: "wahl",
    frage: zw("Welcher Kongruenzsatz passt zu den Angaben?", "Which congruence theorem fits the data?"),
    optionen: SATZ_OPT, richtig: au.satz, fehler: satzFehler(au),
    hinweise: [zw("Zähle Seiten (S) und Winkel (W). Prüfe dann, wo der Winkel liegt.", "Count sides (S) and angles (A). Then check where the angle lies.")],
    erklaerung: au.satz === "keiner"
      ? (au.art === "www" ? zw("Nur Winkel: Die Größe bleibt offen.", "Angles only: the size is not fixed.") : zw("Der Winkel liegt der kleineren Seite gegenüber – kein Kongruenzsatz.", "The angle is opposite the smaller side – no congruence theorem."))
      : au.sww ? zw("SWW: dritter Winkel über die Winkelsumme, dann WSW.", "AAS: third angle from the angle sum, then ASA.") : au.satz });
  schritte.push({ id: "ko-anz", titel: zw("Wie viele Dreiecke?", "How many triangles?"), typ: "wahl",
    frage: zw("Wie viele nicht deckungsgleiche Dreiecke gibt es mit diesen Angaben?", "How many non-congruent triangles fit this data?"),
    optionen: ANZ_OPT, richtig: anzahlText,
    fehler: [
      ...(au.art === "sss-falsch" ? [{ wahl: "1", text: zw(`Prüfe die Dreiecksungleichung: ${z1(au.stuecke[0].wert)} + ${z1(au.stuecke[1].wert)} ist nicht größer als ${z1(au.stuecke[2].wert)}.`, `Check the triangle inequality: ${z1(au.stuecke[0].wert)} + ${z1(au.stuecke[1].wert)} is not greater than ${z1(au.stuecke[2].wert)}.`) }] : []),
      ...(au.art === "wsw-falsch" ? [{ wahl: "1", text: zw(`Die beiden Winkel ergeben zusammen schon ${zt(au.stuecke[1].wert + au.stuecke[2].wert, 0)}° – für den dritten bleibt nichts.`, `The two angles already add up to ${zt(au.stuecke[1].wert + au.stuecke[2].wert, 0)}° – nothing is left for the third.`) }] : []),
      ...(au.art === "ssw-klein" ? [{ wahl: "1", text: zw("Probier es im Modus Entdecken (SsW / SSW): Der Kreis schneidet den Schenkel zweimal.", "Try it in Explore mode (SsA / SSA): the circle cuts the arm twice.") }] : []),
      ...(au.art === "ssw-schief" ? [{ wahl: "1", text: zw(`Die Seite gegenüber dem Winkel ist kürzer als der Abstand ${z1(au.h)} – sie erreicht den anderen Schenkel nicht.`, `The side opposite the angle is shorter than the distance ${z1(au.h)} – it can't reach the other arm.`) }] : []),
      ...(au.art === "www" ? [{ wahl: "1", text: zw("Gleiche Winkel legen nur die Form fest. Vergrößern oder verkleinern geht immer.", "Equal angles only fix the shape. You can always enlarge or shrink.") }] : []),
    ],
    hinweise: [zw("Stell dir die Konstruktion vor: Kreis um einen Punkt, Schenkel eines Winkels – wie viele Schnittpunkte?", "Imagine the construction: circle around a point, arm of an angle – how many intersections?")],
    erklaerung: { 0: zw("Kein Dreieck möglich.", "No triangle possible."), 1: zw("Genau ein Dreieck (bis auf Lage).", "Exactly one triangle (up to position)."), 2: zw("Zwei verschiedene Dreiecke.", "Two different triangles."), unendlich: zw("Unendlich viele, alle ähnlich.", "Infinitely many, all similar.") }[anzahlText] });
  return schritte;
}

const TITEL = { figur: ["Begründen an einer Figur", "Justify with a figure"] };
const ARTEN_UI = [["mix", zw("Gemischt", "Mixed")], ["daten", zw("Angaben prüfen", "Check data")], ["figur", zw("An Figuren begründen", "Justify with figures")]];

function hilfe(au) {
  return hilfeKontext({
    id: `kongruenz-${au.art}`, aufgabe: "Kongruenzsätze SSS SWS WSW SsW kongruent deckungsgleich Dreieck konstruieren",
    verstehen: [zw("Schreibe die gegebenen Stücke in die Skizze: Seiten a, b, c und Winkel α, β, γ.", "Write the given parts into the sketch: sides a, b, c and angles α, β, γ."),
      zw("α liegt bei A und gegenüber von a; γ liegt zwischen a und b.", "α is at A and opposite a; γ lies between a and b.")],
    ansatz: [zw("Drei Seiten → SSS. Zwei Seiten + Winkel dazwischen → SWS. Seite + zwei Winkel → WSW.", "Three sides → SSS. Two sides + angle between → SAS. Side + two angles → ASA."),
      zw("Zwei Seiten + Winkel nicht dazwischen → nur eindeutig, wenn der Winkel der größeren Seite gegenüberliegt (SsW).", "Two sides + angle not between → only unique if the angle is opposite the larger side (SsA).")],
    regel: [zw("Dreiecksungleichung: Zwei Seiten zusammen sind länger als die dritte.", "Triangle inequality: any two sides together are longer than the third."), zw("Winkelsumme: 180°", "Angle sum: 180°")],
    pruefen: [zw("Würde eine Konstruktion mit Zirkel und Geodreieck genau ein Dreieck liefern?", "Would a construction with compass and set square give exactly one triangle?")],
  });
}

function Ueben() {
  const [art, setArt] = useState("mix");
  const neuAus = (a) => (a === "figur" ? neueAufgabe("figur") : a === "daten" ? { id: ++zaehler, ...kongruenzAufgabe() } : neueAufgabe());
  const [au, setAu] = useState(() => neueAufgabe());
  const [stand, setStand] = useState(0);
  const neu = (a = art) => { setAu(neuAus(a)); setStand(0); };
  const schritte = useMemo(() => schritteVon(au), [au]);
  return (
    <>
      <div style={{ ...karte, marginTop: 16 }}>
        <p style={kicker}>{zw("Aufgabentyp", "Exercise type")}</p>
        <div data-aufgabentyp><Auswahl optionen={ARTEN_UI} wert={art} setWert={(a) => { setArt(a); neu(a); }} label={zw("Aufgabentyp", "Exercise type")} /></div>
      </div>
      <div style={{ ...karte, marginTop: 12 }} key={au.id}>
        <p style={kicker}>{au.art === "figur" ? zw(TITEL.figur[0], TITEL.figur[1]) : zw("Angaben prüfen", "Check the data")}</p>
        <p style={{ ...hinweis, color: C.tinte, marginBottom: 8 }}>
          {au.art === "figur" ? au.figur.text : zw(`Von einem Dreieck ABC kennst du: ${angabe(au.stuecke)}.`, `For a triangle ABC you know: ${angabe(au.stuecke)}.`)}
        </p>
        <div style={{ background: C.sand, borderRadius: 14, padding: 6 }}>
          {au.art === "figur" ? <FigurSkizze id={au.figur.id} /> : <ReferenzDreieck stuecke={au.stuecke} />}
        </div>
        {au.art !== "figur" && <p style={{ fontSize: 12, color: C.hellgrau, margin: "6px 2px 0" }}>{zw("Skizze nicht maßstabsgetreu – sie zeigt nur, wo die gegebenen Stücke liegen.", "Sketch not to scale – it only shows where the given parts are.")}</p>}
        <SchrittFolge schritte={schritte} stand={stand} setStand={setStand} fertigText={zw("Richtig – Stücke zugeordnet und den passenden Satz gefunden.", "Correct – parts matched and the right theorem found.")} />
        <GrosserKnopf ghost onClick={() => neu()}>{zw("Neue Aufgabe", "New exercise")}</GrosserKnopf>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}><IchHaengeFest kontext={hilfe(au)} /></div>
      </div>
    </>
  );
}

const MODI = [["entdecken", zw("Entdecken", "Explore")], ["ueben", zw("Üben", "Practise")]];

export function Kongruenzsaetze() {
  const [modus, setModus] = useState("entdecken");
  return (
    <Seite titel={zw("Kongruenzsätze", "Congruence theorems")}
      text={zw("Wann legen drei Stücke ein Dreieck eindeutig fest? SSS, SWS, WSW und SsW – und warum SSW und WWW nicht reichen. Probiere die Konstruktionen aus und begründe Kongruenz an Figuren.",
        "When do three parts fix a triangle uniquely? SSS, SAS, ASA and SsA – and why SSA and AAA are not enough. Try the constructions and justify congruence in figures.")}>
      <ModusLeiste modi={MODI} modus={modus} setModus={setModus} label={zw("Kongruenzsätze", "Congruence theorems")} />
      <Aufklapp titel={zw("Kurz erklärt", "In short")}>
        <p style={{ margin: "0 0 6px" }}>{zw("Zwei Dreiecke sind kongruent (deckungsgleich), wenn sie in diesen Stücken übereinstimmen:", "Two triangles are congruent if they match in these parts:")}</p>
        <p style={{ margin: "0 0 4px" }}><b>SSS</b> – {zw("drei Seiten", "three sides")}</p>
        <p style={{ margin: "0 0 4px" }}><b>SWS</b> – {zw("zwei Seiten und der eingeschlossene Winkel", "two sides and the included angle")}</p>
        <p style={{ margin: "0 0 4px" }}><b>WSW</b> – {zw("eine Seite und die beiden anliegenden Winkel (SWW geht über die Winkelsumme genauso)", "one side and both adjacent angles (AAS works the same via the angle sum)")}</p>
        <p style={{ margin: "0 0 6px" }}><b>SsW</b> – {zw("zwei Seiten und der Winkel, der der größeren Seite gegenüberliegt", "two sides and the angle opposite the larger side")}</p>
        <p style={{ margin: 0 }}>{zw("Nicht eindeutig: WWW (nur ähnlich) und SSW mit dem Winkel gegenüber der kleineren Seite (null, ein oder zwei Dreiecke).", "Not unique: AAA (only similar) and SSA with the angle opposite the smaller side (zero, one or two triangles).")}</p>
      </Aufklapp>
      <div style={{ display: modus === "entdecken" ? "block" : "none" }}><Entdecken /></div>
      <div style={{ display: modus === "ueben" ? "block" : "none" }}><Ueben /></div>
    </Seite>
  );
}

