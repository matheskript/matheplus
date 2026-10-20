/* ============================================================
   Mittelstufe · Geometrie: Kreis und Kreisteile
   · Entdecken – Radius und Mittelpunktswinkel einstellen; Umfang,
     Fläche, Bogen und Sektor live; Anteil α : 360° sichtbar
   · Üben – Umfang, Fläche, Radius aus Umfang/Fläche, Bogenlänge,
     Sektorfläche, Kreisring, Durchmesser-Falle
   Mathematik in geoMittel2.js (getestet).
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { hilfeKontext, karte, kicker, zw } from "./ui2.jsx";
import { uebenWunschLesen } from "./uebenWunsch.js";
import { Aufklapp, ModusLeiste, Seite, zt } from "./ui3.jsx";
import { KREIS_ARTEN, kreisAufgabe } from "./geoMittel2.js";
import { Merke, Regler, UebenRahmen, WertZeile, tolRund, EntdeckenZweispaltig } from "./geoUi.jsx";
import { GeoAnimation } from "./funcGeoAnimationen.jsx";

let zaehler = 0;
const z2 = (v) => zt(v, 2);
const PI = Math.PI;

/* Kreis mit Sektor als SVG-Pfad (eigene Zeichnung, damit der Sektor > 180° richtig gefüllt wird) */
function KreisBild({ r = 3, alpha = 90, hoehe = 230, beschr = {}, ring = null }) {
  const W = 300, H = hoehe, cx = W / 2, cy = H / 2, s = (Math.min(W, H) / 2 - 22) / Math.max(r, ring || 0);
  const R = r * s, a = Math.min(alpha, 359.999) * PI / 180;
  const ex = cx + R * Math.cos(-a), ey = cy + R * Math.sin(-a);
  const gross = alpha > 180 ? 1 : 0;
  const t = { fontFamily: "Montserrat, system-ui, sans-serif", fontWeight: 800, fontSize: 12 };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label={zw("Kreis mit Kreisausschnitt", "Circle with sector")}>
      {ring && <circle cx={cx} cy={cy} r={ring * s} fill={`${C.see}22`} stroke={C.see} strokeWidth="1.8" />}
      <circle cx={cx} cy={cy} r={R} fill={ring ? C.sand : `${C.see}0D`} stroke={C.see} strokeWidth="1.8" />
      {alpha > 0 && !ring && <path d={`M ${cx} ${cy} L ${cx + R} ${cy} A ${R} ${R} 0 ${gross} 0 ${ex} ${ey} Z`} fill={`${C.flaggold}55`} stroke={C.flaggold} strokeWidth="1.5" />}
      {alpha > 0 && !ring && <path d={`M ${cx + R} ${cy} A ${R} ${R} 0 ${gross} 0 ${ex} ${ey}`} fill="none" stroke={C.gruen} strokeWidth="4" strokeLinecap="round" />}
      <line x1={cx} y1={cy} x2={cx + R} y2={cy} stroke={C.tinte} strokeWidth="1.8" />
      {ring && <line x1={cx} y1={cy} x2={cx} y2={cy - ring * s} stroke={C.tinte} strokeWidth="1.8" />}
      <circle cx={cx} cy={cy} r="3.4" fill={C.tinte} />
      <text x={cx + R / 2} y={cy + 16} textAnchor="middle" style={{ ...t, fill: C.tinte }}>{beschr.r ?? "r"}</text>
      {ring && <text x={cx + 8} y={cy - ring * s / 2} style={{ ...t, fill: C.tinte }}>{beschr.R ?? "R"}</text>}
      {alpha > 0 && alpha < 360 && !ring && <text x={cx + 26 * Math.cos(-a / 2)} y={cy + 26 * Math.sin(-a / 2) + 4} textAnchor="middle" style={{ ...t, fill: "#8A6A00" }}>{beschr.alpha ?? `${zt(alpha, 0)}°`}</text>}
    </svg>
  );
}

function Entdecken() {
  const [r, setR] = useState(3);
  const [alpha, setAlpha] = useState(120);
  const u = 2 * PI * r, A = PI * r * r, anteil = alpha / 360;
  return (
    <>
      <GeoAnimation art="kreis" offen />
      <div style={{ ...karte, marginTop: 16 }}>
        <EntdeckenZweispaltig
          steuerung={<>
        <p style={kicker}>{zw("Kreis einstellen", "Set up the circle")}</p>
        <div style={{ display: "grid", gap: 8 }}>
          <Regler name="r" wert={r} setWert={setR} min={1} max={8} schritt={0.5} />
          <Regler name="α" wert={alpha} setWert={setAlpha} min={0} max={360} schritt={5} farbe={C.gruen} format={(v) => `${zt(v, 0)}°`} />
        </div>
          <div style={{ marginTop: 12 }} />
        <p style={kicker}>{zw("Werte", "Values")}</p>
        <WertZeile links={zw("Durchmesser d = 2r", "Diameter d = 2r")} rechts={z2(2 * r)} />
        <WertZeile links={zw("Umfang u = 2πr", "Circumference u = 2πr")} rechts={z2(u)} />
        <WertZeile links={zw("Fläche A = πr²", "Area A = πr²")} rechts={z2(A)} />
        <WertZeile links={zw("Anteil α : 360°", "Share α : 360°")} rechts={`${zt(anteil * 100, 1)} %`} farbe={C.gruen} />
        <WertZeile links={zw("Bogen b = u · α : 360°", "Arc b = u · α : 360°")} rechts={z2(u * anteil)} farbe={C.gruen} />
        <WertZeile links={zw("Sektorfläche = A · α : 360°", "Sector area = A · α : 360°")} rechts={z2(A * anteil)} farbe="#8A6A00" />
          </>}
          bild={
        <div style={{ background: C.sand, borderRadius: 14, padding: 6 }}><KreisBild r={3} alpha={alpha} beschr={{ r: `r = ${z2(r)}` }} /></div>
          }
          unten={<>
        <Merke>{zw(`Jeder Kreis ist eine Vergrößerung jedes anderen. Darum ist Umfang : Durchmesser immer dieselbe Zahl: π ≈ 3,14159. Bogen und Sektor sind einfach der Anteil α : 360° vom Ganzen – hier ${zt(anteil * 100, 1)} %.`,
          `Every circle is an enlargement of every other. So circumference : diameter is always the same number: π ≈ 3.14159. Arc and sector are just the share α : 360° of the whole – here ${zt(anteil * 100, 1)} %.`)}</Merke>
          </>}
        />
      </div>
    </>
  );
}

const TITEL = {
  umfang: ["Umfang", "Circumference"], flaeche: ["Flächeninhalt", "Area"], radiusU: ["Radius aus Umfang", "Radius from circumference"], radiusA: ["Radius aus Fläche", "Radius from area"],
  bogen: ["Kreisbogen", "Arc length"], sektor: ["Kreisausschnitt", "Sector"], ring: ["Kreisring", "Annulus"], durchmesser: ["Fläche aus Durchmesser", "Area from diameter"],
};
const neue = (art) => ({ id: ++zaehler, ...kreisAufgabe(art) });
const RUND = zw("Runde auf zwei Nachkommastellen.", "Round to two decimal places.");

function schritte(au) {
  const z = (id, titel, textT, einheit, wert, frage, fehler, hinweis, erkl) => ({ id, titel, typ: "zahl", text: textT, einheit, wert, toleranz: tolRund(wert), wertText: z2(wert), frage, fehler, hinweise: [hinweis], erklaerung: erkl, rundung: RUND });
  if (au.art === "umfang") return [z("kr-u", zw("Umfang", "Circumference"), "u =", "cm", au.wert, zw("Berechne den Umfang.", "Calculate the circumference."),
    [{ wert: PI * au.r, toleranz: tolRund(PI * au.r), text: zw("Das ist der halbe Umfang: u = 2πr oder πd.", "That's half the circumference: u = 2πr or πd.") }, { wert: PI * au.r * au.r, toleranz: tolRund(PI * au.r * au.r), text: zw("Das ist die Fläche πr².", "That's the area πr².") }],
    `2 · π · ${z2(au.r)}`, `u = 2 · π · ${z2(au.r)} ≈ ${z2(au.wert)} cm`)];
  if (au.art === "flaeche") return [z("kr-a", zw("Fläche", "Area"), "A =", "cm²", au.wert, zw("Berechne den Flächeninhalt.", "Calculate the area."),
    [{ wert: 2 * PI * au.r, toleranz: tolRund(2 * PI * au.r), text: zw("Das ist der Umfang. Für die Fläche wird r quadriert.", "That's the circumference. For the area, square r.") }, { wert: (PI * au.r) ** 2, toleranz: tolRund((PI * au.r) ** 2), text: zw("Nur r wird quadriert, nicht π.", "Only r is squared, not π.") }],
    `π · ${z2(au.r)}²`, `A = π · ${z2(au.r)}² ≈ ${z2(au.wert)} cm²`)];
  if (au.art === "durchmesser") return [
    { id: "kr-d-r", titel: zw("Radius", "Radius"), typ: "zahl", text: "r =", einheit: "cm", wert: au.r, toleranz: 1e-9, wertText: z2(au.r), frage: zw("Die Formel braucht den Radius. Wie groß ist er?", "The formula needs the radius. What is it?"),
      fehler: [{ wert: au.d, text: zw("Das ist der Durchmesser. Der Radius ist halb so lang.", "That's the diameter. The radius is half as long.") }], hinweise: [`${au.d} : 2`], erklaerung: `r = ${au.d} : 2 = ${z2(au.r)} cm` },
    z("kr-d-a", zw("Fläche", "Area"), "A =", "cm²", au.wert, zw("Berechne den Flächeninhalt.", "Calculate the area."),
      [{ wert: PI * au.d * au.d, toleranz: tolRund(PI * au.d * au.d), text: zw("Mit d statt r wird die Fläche viermal zu groß.", "Using d instead of r makes the area four times too large.") }],
      `π · ${z2(au.r)}²`, `A = π · ${z2(au.r)}² ≈ ${z2(au.wert)} cm²`)];
  if (au.art === "radiusU") return [
    { id: "kr-ru-g", titel: zw("Umstellen", "Rearrange"), typ: "wahl", frage: zw("Wie bekommst du r aus u = 2πr?", "How do you get r from u = 2πr?"),
      optionen: [["a", <M key="a" t="r = \frac{u}{2π}" />], ["b", <M key="b" t="r = 2π · u" />], ["c", <M key="c" t="r = \sqrt{\frac{u}{π}}" />]], richtig: "a",
      fehler: [{ wahl: "b", text: zw("Malnehmen ist die falsche Richtung – teilen.", "Multiplying is the wrong direction – divide.") }, { wahl: "c", text: zw("Die Wurzel gehört zur Fläche, im Umfang steht r nicht im Quadrat.", "The root belongs to the area; in the circumference r is not squared.") }],
      hinweise: [zw("Teile beide Seiten durch 2π.", "Divide both sides by 2π.")], erklaerung: "r = u : (2π)" },
    z("kr-ru", zw("Radius", "Radius"), "r =", "cm", au.wert, zw("Berechne r.", "Calculate r."), [{ wert: au.u / PI, toleranz: tolRund(au.u / PI), text: zw("Das ist der Durchmesser – noch durch 2 teilen.", "That's the diameter – divide by 2.") }],
      `${z2(au.u)} : (2π)`, `r = ${z2(au.u)} : (2π) ≈ ${z2(au.wert)} cm`)];
  if (au.art === "radiusA") return [
    { id: "kr-ra-g", titel: zw("Umstellen", "Rearrange"), typ: "wahl", frage: zw("Wie bekommst du r aus A = πr²?", "How do you get r from A = πr²?"),
      optionen: [["a", <M key="a" t="r = \frac{A}{2π}" />], ["b", <M key="b" t="r = \sqrt{\frac{A}{π}}" />], ["c", <M key="c" t="r = \frac{A}{π}" />]], richtig: "b",
      fehler: [{ wahl: "a", text: zw("Das wäre der Umfang. Hier steht r im Quadrat.", "That would be the circumference. Here r is squared.") }, { wahl: "c", text: zw("Das ist erst r². Zieh noch die Wurzel.", "That's only r². Still take the root.") }],
      hinweise: [zw("Erst durch π teilen, dann die Wurzel ziehen.", "Divide by π first, then take the root.")], erklaerung: "r = √(A : π)" },
    z("kr-ra", zw("Radius", "Radius"), "r =", "cm", au.wert, zw("Berechne r.", "Calculate r."), [{ wert: au.A / PI, toleranz: tolRund(au.A / PI), text: zw("Das ist r². Zieh die Wurzel.", "That's r². Take the root.") }],
      `√(${z2(au.A)} : π)`, `r = √(${z2(au.A)} : π) ≈ ${z2(au.wert)} cm`)];
  if (au.art === "bogen") return [
    z("kr-b-u", zw("Ganzer Umfang", "Whole circumference"), "u =", "cm", au.umfang, zw("Berechne zuerst den ganzen Umfang.", "First calculate the whole circumference."), [], `2 · π · ${z2(au.r)}`, `u ≈ ${z2(au.umfang)} cm`),
    z("kr-b", zw("Bogen", "Arc"), "b =", "cm", au.wert, zw(`Der Bogen ist der Anteil ${au.alpha}° : 360° davon.`, `The arc is the share ${au.alpha}° : 360° of it.`),
      [{ wert: au.umfang * au.alpha / 180, toleranz: tolRund(au.umfang * au.alpha / 180), text: zw("Ein voller Kreis hat 360°, nicht 180°.", "A full circle has 360°, not 180°.") }],
      `${z2(au.umfang)} · ${au.alpha} : 360`, `b = ${z2(au.umfang)} · ${au.alpha}° : 360° ≈ ${z2(au.wert)} cm`)];
  if (au.art === "sektor") return [
    z("kr-s-a", zw("Ganze Fläche", "Whole area"), "A =", "cm²", au.flaeche, zw("Berechne zuerst die ganze Kreisfläche.", "First calculate the whole circle's area."), [], `π · ${z2(au.r)}²`, `A ≈ ${z2(au.flaeche)} cm²`),
    z("kr-s", zw("Sektor", "Sector"), "$A_S$ =", "cm²", au.wert, zw(`Der Ausschnitt ist der Anteil ${au.alpha}° : 360° davon.`, `The sector is the share ${au.alpha}° : 360° of it.`),
      [{ wert: au.flaeche * au.alpha / 180, toleranz: tolRund(au.flaeche * au.alpha / 180), text: zw("Ein voller Kreis hat 360°.", "A full circle has 360°.") }],
      `${z2(au.flaeche)} · ${au.alpha} : 360`, `$A_S$ = ${z2(au.flaeche)} · ${au.alpha}° : 360° ≈ ${z2(au.wert)} cm²`)];
  /* ring */
  const falsch = PI * (au.R - au.r) ** 2;
  return [z("kr-ring", zw("Kreisring", "Annulus"), "A =", "cm²", au.wert, zw("Berechne die Fläche des Rings: großer Kreis minus kleiner Kreis.", "Calculate the ring's area: large circle minus small circle."),
    [{ wert: falsch, toleranz: tolRund(falsch), text: zw("π(R − r)² ist der Kreis mit der Ringbreite als Radius. Zieh die Flächen ab: π(R² − r²).", "π(R − r)² is the circle with the ring width as radius. Subtract areas: π(R² − r²).") }],
    `π · (${z2(au.R)}² − ${z2(au.r)}²)`, `A = π · (${z2(au.R)}² − ${z2(au.r)}²) ≈ ${z2(au.wert)} cm²`)];
}

function text(au) {
  if (au.art === "umfang" || au.art === "flaeche") return zw(`Ein Kreis hat den Radius r = ${z2(au.r)} cm.`, `A circle has radius r = ${z2(au.r)} cm.`);
  if (au.art === "durchmesser") return zw(`Ein runder Tisch hat den Durchmesser d = ${au.d} dm. Wie groß ist die Tischfläche? (Rechne in dm statt cm.)`, `A round table has diameter d = ${au.d} dm. How large is its surface? (Work in dm instead of cm.)`);
  if (au.art === "radiusU") return zw(`Ein Kreis hat den Umfang u = ${z2(au.u)} cm. Wie groß ist sein Radius?`, `A circle has circumference u = ${z2(au.u)} cm. What is its radius?`);
  if (au.art === "radiusA") return zw(`Ein Kreis hat die Fläche A = ${z2(au.A)} cm². Wie groß ist sein Radius?`, `A circle has area A = ${z2(au.A)} cm². What is its radius?`);
  if (au.art === "bogen") return zw(`Kreis mit r = ${z2(au.r)} cm, Mittelpunktswinkel α = ${au.alpha}°. Wie lang ist der Bogen?`, `Circle with r = ${z2(au.r)} cm, central angle α = ${au.alpha}°. How long is the arc?`);
  if (au.art === "sektor") return zw(`Kreis mit r = ${z2(au.r)} cm, Mittelpunktswinkel α = ${au.alpha}°. Wie groß ist der Kreisausschnitt?`, `Circle with r = ${z2(au.r)} cm, central angle α = ${au.alpha}°. How large is the sector?`);
  return zw(`Ein Kreisring hat den Außenradius R = ${z2(au.R)} cm und den Innenradius r = ${z2(au.r)} cm.`, `An annulus has outer radius R = ${z2(au.R)} cm and inner radius r = ${z2(au.r)} cm.`);
}

function skizze(au) {
  if (au.art === "ring") return <KreisBild r={au.r} ring={au.R} hoehe={190} beschr={{ r: `r = ${z2(au.r)}`, R: `R = ${z2(au.R)}` }} />;
  if (au.art === "bogen" || au.art === "sektor") return <KreisBild r={3} alpha={au.alpha} hoehe={190} beschr={{ r: `r = ${z2(au.r)}` }} />;
  return null;
}

const hilfe = (au) => hilfeKontext({
  id: `kreis-${au.art}`, aufgabe: "Kreis Umfang Fläche Radius Durchmesser Pi Bogen Sektor Kreisausschnitt Kreisring",
  verstehen: [zw("Radius oder Durchmesser gegeben? Die Formeln brauchen den Radius.", "Radius or diameter given? The formulas need the radius.")],
  ansatz: [zw("Umfang u = 2πr, Fläche A = πr². Teile des Kreises: Anteil α : 360°.", "Circumference u = 2πr, area A = πr². Parts of a circle: share α : 360°.")],
  regel: [zw("Rückwärts: r = u : (2π) bzw. r = √(A : π)", "Backwards: r = u : (2π) or r = √(A : π)")],
  pruefen: [zw("Faustregel: Umfang ≈ 6 · r, Fläche ≈ 3 · r².", "Rule of thumb: circumference ≈ 6 · r, area ≈ 3 · r².")],
});

const MODI = [["entdecken", zw("Entdecken", "Explore")], ["ueben", zw("Üben", "Practise")]];

export function KreisUndKreisteile() {
  const [modus, setModus] = useState(() => { const w = uebenWunschLesen("kreis"); return w && w.modus ? w.modus : "entdecken"; });   // Wunsch einer Lernseite (uebenWunsch.js)
  return (
    <Seite titel={zw("Kreis und Kreisteile", "Circles and their parts")}
      text={zw("Umfang, Fläche, Bogen und Kreisausschnitt – und warum π in allem steckt. Mit Rückwärtsrechnen und Kreisring.", "Circumference, area, arc and sector – and why π is in all of them. Including working backwards and the annulus.")}>
      <ModusLeiste modi={MODI} modus={modus} setModus={setModus} label={zw("Kreis", "Circle")} />
      <Aufklapp titel={zw("Kurz erklärt", "In short")}>
        <p style={{ margin: "0 0 6px", textAlign: "center", fontSize: 16 }}><M t="u = 2πr" />, <M t="A = πr²" /></p>
        <p style={{ margin: "0 0 6px", textAlign: "center", fontSize: 16 }}><M t="b = 2πr · \frac{α}{360°}" />, <M t="A_S = πr² · \frac{α}{360°}" /></p>
        <p style={{ margin: 0 }}>{zw("Kreisring: A = π(R² − r²). Ist der Durchmesser gegeben, erst halbieren.", "Annulus: A = π(R² − r²). If the diameter is given, halve it first.")}</p>
      </Aufklapp>
      <div style={{ display: modus === "entdecken" ? "block" : "none" }}><Entdecken /></div>
      <div style={{ display: modus === "ueben" ? "block" : "none" }}>
        <UebenRahmen titel={TITEL} arten={KREIS_ARTEN} neue={neue} schritte={schritte} text={text} skizze={skizze} hilfe={hilfe} />
      </div>
    </Seite>
  );
}

