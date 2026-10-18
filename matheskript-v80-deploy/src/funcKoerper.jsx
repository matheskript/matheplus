/* ============================================================
   Mittelstufe · Geometrie: Körper – Volumen und Oberfläche
   Prisma, Zylinder, Pyramide, Kegel, Kugel.
   · Entdecken – Körper wählen, Maße einstellen, Schrägbild mit
     Höhe, Mantellinie bzw. Seitenhöhe; Volumen und Oberfläche live
   · Üben – Volumen und Oberfläche aller Körper, Mantellinie und
     Seitenhöhe über Pythagoras, Höhe aus dem Volumen
   Mathematik in geoMittel2.js (getestet).
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { Auswahl, hilfeKontext, karte, kicker, zw } from "./ui2.jsx";
import { Aufklapp, ModusLeiste, Seite, zt } from "./ui3.jsx";
import { KOERPER_ARTEN, koerper, koerperAufgabe } from "./geoMittel2.js";
import { Merke, Regler, UebenRahmen, WertZeile, Zeichenblatt, tolRund, EntdeckenZweispaltig } from "./geoUi.jsx";
import { GeoAnimation } from "./funcGeoAnimationen.jsx";

let zaehler = 0;
const z2 = (v) => zt(v, 2);
const PI = Math.PI;

/* Ellipsenbogen (Schrägbild eines Kreises): Winkel von w0 bis w1 in Grad */
const ellipse = (cx, cy, rx, ry, w0 = 0, w1 = 360, n = 40) =>
  Array.from({ length: n + 1 }, (_, i) => { const w = (w0 + ((w1 - w0) * i) / n) * PI / 180; return [cx + rx * Math.cos(w), cy + ry * Math.sin(w)]; });

function Kante({ zz, pts, farbe = C.tinte, b = 2, strich }) {
  return <>{pts.slice(1).map((p, i) => zz.linie(pts[i], p, farbe, b, strich, `k${i}`))}</>;
}

/* Schrägbild eines Körpers. m: Maße, beschr: Beschriftungen (h, r, a, s, hs) */
export function KoerperBild({ k, m, beschr = {}, hoehe = 220 }) {
  const ry = 0.32;   // Verkürzung der Tiefe
  let pts = [], inhalt;
  if (k === "zylinder" || k === "kegel") {
    const { r, h } = m;
    pts = [[-r, -r * ry], [r, h + r * ry]];
    inhalt = (zz) => (
      <>
        {zz.vieleck(k === "zylinder" ? [[-r, 0], [-r, h], [r, h], [r, 0]] : [[-r, 0], [0, h], [r, 0]], `${C.see}14`, "none")}
        <Kante zz={zz} pts={ellipse(0, 0, r, r * ry, 180, 360)} />
        <Kante zz={zz} pts={ellipse(0, 0, r, r * ry, 0, 180)} farbe={C.hellgrau} b={1.4} strich="4 3" />
        {k === "zylinder" ? <>
          <Kante zz={zz} pts={ellipse(0, h, r, r * ry)} />
          {zz.linie([-r, 0], [-r, h])}{zz.linie([r, 0], [r, h])}
          {zz.linie([0, 0], [0, h], C.gruen, 1.6, "5 4")}{zz.mass([0, 0], [0, h], beschr.h, -1, C.gruen, 12)}
        </> : <>
          {zz.linie([-r, 0], [0, h])}{zz.linie([r, 0], [0, h])}
          {zz.linie([0, 0], [0, h], C.gruen, 1.6, "5 4")}{zz.mass([0, 0], [0, h], beschr.h, -1, C.gruen, 12)}
          {beschr.s && zz.mass([r, 0], [0, h], beschr.s, 1, "#8A6A00", 14)}
        </>}
        {zz.linie([0, 0], [r, 0], C.see, 1.8)}{zz.mass([0, 0], [r, 0], beschr.r, 1, C.see, 12)}
        {zz.punkt([0, 0], null, 0, 0, C.tinte, 2.6)}
      </>
    );
  } else if (k === "kugel") {
    const { r } = m;
    pts = [[-r, -r], [r, r]];
    inhalt = (zz) => (
      <>
        {zz.kreis([0, 0], r, C.tinte, 2, `${C.see}14`)}
        <Kante zz={zz} pts={ellipse(0, 0, r, r * ry, 180, 360)} b={1.4} />
        <Kante zz={zz} pts={ellipse(0, 0, r, r * ry, 0, 180)} farbe={C.hellgrau} b={1.2} strich="4 3" />
        {zz.linie([0, 0], [r * 0.7, r * 0.7], C.see, 1.8)}{zz.mass([0, 0], [r * 0.7, r * 0.7], beschr.r, -1, C.see, 12)}
        {zz.punkt([0, 0], null, 0, 0, C.tinte, 2.6)}
      </>
    );
  } else if (k === "pyramide") {
    const { a, h } = m;
    const t = [a * 0.45 * Math.cos(PI / 5), a * 0.45 * Math.sin(PI / 5)];
    const E = [[0, 0], [a, 0], [a + t[0], t[1]], [t[0], t[1]]];
    const Mi = [a / 2 + t[0] / 2, t[1] / 2], S = [Mi[0], Mi[1] + h], Mk = [a / 2, 0];
    pts = [...E, S];
    inhalt = (zz) => (
      <>
        {zz.vieleck([E[0], E[1], S], `${C.see}18`, "none")}{zz.vieleck([E[1], E[2], S], `${C.see}0C`, "none")}
        {zz.linie(E[0], E[3], C.hellgrau, 1.3, "4 3")}{zz.linie(E[3], E[2], C.hellgrau, 1.3, "4 3")}{zz.linie(E[3], S, C.hellgrau, 1.3, "4 3")}
        {zz.linie(E[0], E[1])}{zz.linie(E[1], E[2])}{zz.linie(E[0], S)}{zz.linie(E[1], S)}{zz.linie(E[2], S)}
        {zz.linie(Mi, S, C.gruen, 1.6, "5 4")}{zz.mass(Mi, S, beschr.h, 1, C.gruen, 12)}
        {beschr.hs && <>{zz.linie(Mk, S, "#8A6A00", 1.8)}{zz.mass(Mk, S, beschr.hs, -1, "#8A6A00", 14)}</>}
        {zz.mass(E[0], E[1], beschr.a, 1, C.see, 12)}
      </>
    );
  } else {
    /* Prisma mit rechtwinkligem Dreieck als Grundfläche, nach hinten gezogen */
    const { a, b, h } = m;
    const t = [h * 0.5 * Math.cos(PI / 6), h * 0.5 * Math.sin(PI / 6)];
    const V = [[0, 0], [a, 0], [0, b]], H = V.map((p) => [p[0] + t[0], p[1] + t[1]]);
    pts = [...V, ...H];
    inhalt = (zz) => (
      <>
        {zz.vieleck(V, `${C.flaggold}40`, C.tinte, 2)}
        {zz.linie(H[0], H[1], C.hellgrau, 1.3, "4 3")}{zz.linie(H[0], H[2], C.hellgrau, 1.3, "4 3")}{zz.linie(V[0], H[0], C.hellgrau, 1.3, "4 3")}
        {zz.linie(H[1], H[2])}{zz.linie(V[1], H[1])}{zz.linie(V[2], H[2])}
        {zz.rechter(V[0], V[1], V[2], C.tinte, 9)}
        {zz.mass(V[0], V[1], beschr.a, 1, C.see, 12)}{zz.mass(V[0], V[2], beschr.b, -1, C.see, 12)}{zz.mass(V[1], H[1], beschr.h, 1, C.gruen, 12)}
      </>
    );
  }
  return <Zeichenblatt punkte={pts} hoehe={hoehe} rand={30} label={zw("Schrägbild des Körpers", "Oblique drawing of the solid")} kinder={inhalt} />;
}

const NAMEN = { prisma: zw("Prisma", "Prism"), zylinder: zw("Zylinder", "Cylinder"), pyramide: zw("Pyramide", "Pyramid"), kegel: zw("Kegel", "Cone"), kugel: zw("Kugel", "Sphere") };
const FORMEL = {
  prisma: ["V = G · h", "O = 2G + M"], zylinder: ["V = πr² · h", "O = 2πr² + 2πrh"], pyramide: ["V = \\frac{1}{3} a² · h", "O = a² + 2a · h_s"],
  kegel: ["V = \\frac{1}{3} πr² · h", "O = πr² + πrs"], kugel: ["V = \\frac{4}{3} πr³", "O = 4πr²"],
};

function Entdecken() {
  const [k, setK] = useState("zylinder");
  const [x, setX] = useState(3);
  const [h, setH] = useState(5);
  const m = k === "pyramide" ? { a: x, h } : k === "prisma" ? { a: x, b: x * 0.75 + 1, h } : { r: x, h };
  const w = koerper[k](m);
  return (
    <>
      <GeoAnimation art="koerper" offen />
      <div style={{ ...karte, marginTop: 16 }}>
        <EntdeckenZweispaltig
          steuerung={<>
        <p style={kicker}>{zw("Körper wählen", "Choose a solid")}</p>
        <Auswahl optionen={Object.keys(NAMEN).map((id) => [id, NAMEN[id]])} wert={k} setWert={setK} label={zw("Körper", "Solid")} />
        <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
          <Regler name={k === "pyramide" || k === "prisma" ? "a" : "r"} wert={x} setWert={setX} min={1} max={6} schritt={0.5} />
          {k !== "kugel" && <Regler name="h" wert={h} setWert={setH} min={1} max={10} schritt={0.5} farbe={C.gruen} />}
        </div>
          <div style={{ marginTop: 12 }} />
        <p style={kicker}>{NAMEN[k]}</p>
        {w.G !== undefined && <WertZeile links={zw("Grundfläche G", "Base G")} rechts={z2(w.G)} />}
        {w.s !== undefined && <WertZeile links={zw("Mantellinie s = √(r² + h²)", "Slant height s = √(r² + h²)")} rechts={z2(w.s)} farbe="#8A6A00" />}
        {w.hs !== undefined && <WertZeile links={zw("Seitenhöhe hₛ = √(h² + (a/2)²)", "Face height hₛ = √(h² + (a/2)²)")} rechts={z2(w.hs)} farbe="#8A6A00" />}
        <WertZeile links={<><M t={FORMEL[k][0]} /></>} rechts={z2(w.V)} farbe={C.gruen} />
        <WertZeile links={<><M t={FORMEL[k][1]} /></>} rechts={z2(w.O)} />
          </>}
          bild={
        <div style={{ background: C.sand, borderRadius: 14, padding: 6 }}>
          <KoerperBild k={k} m={m} hoehe={240}
            beschr={{ r: "r", h: "h", a: "a", b: "b", s: k === "kegel" ? "s" : null, hs: k === "pyramide" ? "hₛ" : null }} />
        </div>
          }
          unten={<>
        <Merke>{k === "pyramide" || k === "kegel"
          ? zw("Spitze Körper haben ein Drittel des Volumens des passenden Prismas bzw. Zylinders – drei Pyramiden füllen genau einen Quader mit gleicher Grundfläche und Höhe. Für die Oberfläche brauchst du die schräge Höhe: Pythagoras im Inneren des Körpers.",
            "Pointed solids have a third of the volume of the matching prism or cylinder – three pyramids exactly fill a box with the same base and height. For the surface you need the slanted height: Pythagoras inside the solid.")
          : k === "kugel"
            ? zw("Die Kugel ist der einzige Körper hier ohne Grundfläche. Ihre Oberfläche ist genau viermal so groß wie ein Kreis mit demselben Radius.", "The sphere is the only solid here without a base. Its surface is exactly four times a circle with the same radius.")
            : zw("Gerade Körper: Volumen = Grundfläche mal Höhe. Die Oberfläche besteht aus zwei Grundflächen und dem Mantel, der abgerollt ein Rechteck ist.", "Straight solids: volume = base times height. The surface consists of two bases and the lateral surface, which unrolls into a rectangle.")}</Merke>
          </>}
        />
      </div>
    </>
  );
}

/* ---------- Üben ---------- */
const TITEL = {
  zylV: ["Zylinder: Volumen", "Cylinder: volume"], zylO: ["Zylinder: Oberfläche", "Cylinder: surface"], pyrV: ["Pyramide: Volumen", "Pyramid: volume"], pyrO: ["Pyramide: Oberfläche", "Pyramid: surface"],
  kegV: ["Kegel: Volumen", "Cone: volume"], kegO: ["Kegel: Oberfläche", "Cone: surface"], kugV: ["Kugel: Volumen", "Sphere: volume"], kugO: ["Kugel: Oberfläche", "Sphere: surface"],
  prismaV: ["Prisma: Volumen", "Prism: volume"], hoehe: ["Höhe aus dem Volumen", "Height from the volume"],
};
const neue = (art) => ({ id: ++zaehler, ...koerperAufgabe(art) });
const RUND = zw("Runde auf zwei Nachkommastellen.", "Round to two decimal places.");
const zs = (id, titel, textT, einheit, wert, frage, fehler, hinweis, erkl) => ({ id, titel, typ: "zahl", text: textT, einheit, wert, toleranz: tolRund(wert), wertText: z2(wert), frage, fehler: fehler.map((f) => ({ toleranz: tolRund(f.wert), ...f })), hinweise: [hinweis], erklaerung: erkl, rundung: RUND });

function schritte(au) {
  const { m } = au;
  switch (au.art) {
    case "zylV": return [
      zs("kp-zv-g", zw("Grundfläche", "Base"), "G =", "cm²", au.G, zw("Die Grundfläche ist ein Kreis.", "The base is a circle."), [{ wert: 2 * PI * m.r, text: zw("Das ist der Umfang. Die Fläche ist πr².", "That's the circumference. The area is πr².") }], `π · ${m.r}²`, `G = π · ${m.r}² ≈ ${z2(au.G)} cm²`),
      zs("kp-zv", zw("Volumen", "Volume"), "V =", "cm³", au.V, zw("Grundfläche mal Höhe.", "Base times height."), [{ wert: au.V / 3, text: zw("Das Drittel gehört zu Kegel und Pyramide, nicht zum Zylinder.", "The third belongs to cones and pyramids, not cylinders.") }], `${z2(au.G)} · ${m.h}`, `V ≈ ${z2(au.G)} · ${m.h} ≈ ${z2(au.V)} cm³`)];
    case "zylO": return [
      zs("kp-zo-m", zw("Mantel", "Lateral surface"), "M =", "cm²", au.M, zw("Der Mantel ist abgerollt ein Rechteck: Umfang mal Höhe.", "Unrolled, the lateral surface is a rectangle: circumference times height."), [{ wert: PI * m.r * m.r * m.h, text: zw("Das ist das Volumen.", "That's the volume.") }], `2π · ${m.r} · ${m.h}`, `M = 2π · ${m.r} · ${m.h} ≈ ${z2(au.M)} cm²`),
      zs("kp-zo", zw("Oberfläche", "Surface"), "O =", "cm²", au.O, zw("Dazu kommen Boden und Deckel.", "Add the bottom and the lid."), [{ wert: au.M + PI * m.r * m.r, text: zw("Es sind zwei Kreise – Boden und Deckel.", "There are two circles – bottom and lid.") }], `2π · ${m.r}² + ${z2(au.M)}`, `O ≈ ${z2(2 * PI * m.r * m.r)} + ${z2(au.M)} ≈ ${z2(au.O)} cm²`)];
    case "pyrV": return [
      zs("kp-pv-g", zw("Grundfläche", "Base"), "G =", "cm²", au.G, zw("Die Grundfläche ist ein Quadrat.", "The base is a square."), [], `${m.a}²`, `G = ${m.a}² = ${au.G} cm²`),
      zs("kp-pv", zw("Volumen", "Volume"), "V =", "cm³", au.V, zw("Spitzer Körper: ein Drittel von G · h.", "Pointed solid: a third of G · h."), [{ wert: au.G * m.h, text: zw("Das wäre der Quader. Die Pyramide hat ein Drittel davon.", "That would be the box. The pyramid has a third of it.") }], `${au.G} · ${m.h} : 3`, `V = ${au.G} · ${m.h} : 3 = ${z2(au.V)} cm³`)];
    case "pyrO": return [
      zs("kp-po-hs", zw("Seitenhöhe", "Face height"), "hₛ =", "cm", au.hs, zw("Die Seitenhöhe hₛ ist Hypotenuse im Dreieck aus h und a/2. Berechne sie.", "The face height hₛ is the hypotenuse of the triangle with h and a/2. Calculate it."),
        [{ wert: m.h, text: zw("Die Körperhöhe h steht senkrecht in der Mitte; die Seitenfläche ist geneigt und länger.", "The height h stands vertically in the middle; the face is slanted and longer.") }, { wert: Math.hypot(m.h, m.a), text: zw("Vom Mittelpunkt bis zur Kante ist es a/2, nicht a.", "From the centre to the edge it's a/2, not a.") }],
        `√(${m.h}² + ${m.a / 2}²)`, `hₛ = √(${m.h}² + ${m.a / 2}²) = ${z2(au.hs)} cm`),
      zs("kp-po", zw("Oberfläche", "Surface"), "O =", "cm²", au.O, zw("Grundfläche plus vier Dreiecke mit Grundseite a und Höhe hₛ.", "Base plus four triangles with base a and height hₛ."),
        [{ wert: m.a * m.a + 4 * m.a * au.hs, text: zw("Jedes Dreieck ist a · hₛ : 2 – das „: 2“ fehlt.", "Each triangle is a · hₛ : 2 – the “: 2” is missing.") }, { wert: m.a * m.a + 2 * m.a * m.h, text: zw("Mit h statt hₛ werden die Dreiecke zu klein.", "Using h instead of hₛ makes the triangles too small.") }],
        `${m.a}² + 4 · ${m.a} · ${z2(au.hs)} : 2`, `O = ${m.a * m.a} + 2 · ${m.a} · ${z2(au.hs)} = ${z2(au.O)} cm²`)];
    case "kegV": return [
      zs("kp-kv", zw("Volumen", "Volume"), "V =", "cm³", au.V, zw("Berechne das Volumen.", "Calculate the volume."), [{ wert: au.G * m.h, text: zw("Das wäre der Zylinder. Der Kegel hat ein Drittel davon.", "That would be the cylinder. The cone has a third of it.") }], `π · ${m.r}² · ${m.h} : 3`, `V = π · ${m.r}² · ${m.h} : 3 ≈ ${z2(au.V)} cm³`)];
    case "kegO": return [
      zs("kp-ko-s", zw("Mantellinie", "Slant height"), "s =", "cm", au.s, zw("r, h und s bilden ein rechtwinkliges Dreieck. Berechne s.", "r, h and s form a right triangle. Calculate s."), [{ wert: m.h, text: zw("h ist die senkrechte Höhe – s läuft schräg an der Außenseite.", "h is the vertical height – s runs slanted along the outside.") }], `√(${m.r}² + ${m.h}²)`, `s = √(${m.r}² + ${m.h}²) = ${z2(au.s)} cm`),
      zs("kp-ko", zw("Oberfläche", "Surface"), "O =", "cm²", au.O, zw("Grundkreis plus Mantel πrs.", "Base circle plus lateral surface πrs."), [{ wert: au.M, text: zw("Das ist nur der Mantel. Der Boden fehlt.", "That's only the lateral surface. The base is missing.") }, { wert: PI * m.r * m.r + PI * m.r * m.h, text: zw("Mantel mit s, nicht mit h.", "Lateral surface with s, not h.") }], `π · ${m.r}² + π · ${m.r} · ${au.s}`, `O = π · ${m.r}² + π · ${m.r} · ${au.s} ≈ ${z2(au.O)} cm²`)];
    case "kugV": return [
      zs("kp-uv", zw("Volumen", "Volume"), "V =", "cm³", au.V, zw("Berechne das Volumen.", "Calculate the volume."), [{ wert: au.O, text: zw("Das ist die Oberfläche 4πr². Das Volumen ist 4/3 · πr³.", "That's the surface 4πr². The volume is 4/3 · πr³.") }, { wert: (4 / 3) * PI * m.r * m.r, text: zw("r muss hoch drei – Volumen hat drei Dimensionen.", "r must be cubed – volume has three dimensions.") }], `4/3 · π · ${m.r}³`, `V = 4/3 · π · ${m.r}³ ≈ ${z2(au.V)} cm³`)];
    case "kugO": return [
      zs("kp-uo", zw("Oberfläche", "Surface"), "O =", "cm²", au.O, zw("Berechne die Oberfläche.", "Calculate the surface."), [{ wert: PI * m.r * m.r, text: zw("Das ist ein Kreis. Die Kugel hat viermal so viel Oberfläche.", "That's one circle. The sphere has four times as much surface.") }], `4 · π · ${m.r}²`, `O = 4 · π · ${m.r}² ≈ ${z2(au.O)} cm²`)];
    case "prismaV": return [
      zs("kp-rv-g", zw("Grundfläche", "Base"), "G =", "cm²", au.G, zw("Die Grundfläche ist ein rechtwinkliges Dreieck.", "The base is a right triangle."), [{ wert: m.a * m.b, text: zw("Das wäre ein Rechteck. Das Dreieck ist halb so groß.", "That would be a rectangle. The triangle is half of it.") }], `${m.a} · ${m.b} : 2`, `G = ${m.a} · ${m.b} : 2 = ${au.G} cm²`),
      zs("kp-rv", zw("Volumen", "Volume"), "V =", "cm³", au.V, zw("Grundfläche mal Höhe.", "Base times height."), [{ wert: au.V / 3, text: zw("Ein Prisma ist gerade – kein Drittel.", "A prism is straight – no third.") }], `${au.G} · ${m.h}`, `V = ${au.G} · ${m.h} = ${au.V} cm³`)];
    default: return [
      zs("kp-h-g", zw("Grundfläche", "Base"), "G =", "cm²", au.G, zw("Berechne die Grundfläche des Zylinders.", "Calculate the base of the cylinder."), [], `π · ${m.r}²`, `G = π · ${m.r}² ≈ ${z2(au.G)} cm²`),
      zs("kp-h", zw("Höhe", "Height"), "h =", "cm", au.hWert, zw("Stelle V = G · h nach h um.", "Rearrange V = G · h for h."), [{ wert: au.Vgeg * au.G, text: zw("Teilen, nicht malnehmen: h = V : G.", "Divide, don't multiply: h = V : G.") }], `${z2(au.Vgeg)} : ${z2(au.G)}`, `h = ${z2(au.Vgeg)} : ${z2(au.G)} ≈ ${z2(au.hWert)} cm`)];
  }
}

function text(au) {
  const { m } = au;
  if (au.k === "zylinder" && au.art !== "hoehe") return zw(`Ein Zylinder hat den Radius r = ${m.r} cm und die Höhe h = ${m.h} cm.`, `A cylinder has radius r = ${m.r} cm and height h = ${m.h} cm.`);
  if (au.art === "hoehe") return zw(`Eine zylinderförmige Dose fasst ${z2(au.Vgeg)} cm³ und hat den Radius r = ${m.r} cm. Wie hoch ist sie?`, `A cylindrical can holds ${z2(au.Vgeg)} cm³ and has radius r = ${m.r} cm. How tall is it?`);
  if (au.k === "pyramide") return zw(`Eine quadratische Pyramide hat die Grundkante a = ${m.a} cm und die Höhe h = ${m.h} cm.`, `A square pyramid has base edge a = ${m.a} cm and height h = ${m.h} cm.`);
  if (au.k === "kegel") return zw(`Ein Kegel hat den Radius r = ${m.r} cm und die Höhe h = ${m.h} cm.`, `A cone has radius r = ${m.r} cm and height h = ${m.h} cm.`);
  if (au.k === "kugel") return zw(`Eine Kugel hat den Radius r = ${z2(m.r)} cm.`, `A sphere has radius r = ${z2(m.r)} cm.`);
  return zw(`Ein Prisma hat als Grundfläche ein rechtwinkliges Dreieck mit den Katheten ${m.a} cm und ${m.b} cm. Es ist ${m.h} cm hoch.`, `A prism has a right triangle with legs ${m.a} cm and ${m.b} cm as its base. It is ${m.h} cm tall.`);
}

function skizze(au) {
  const { m } = au;
  const b = { r: m.r !== undefined ? `r = ${z2(m.r)}` : null, h: au.art === "hoehe" ? "h = ?" : m.h !== undefined ? `h = ${m.h}` : null, a: m.a !== undefined ? `${m.a}` : null, b: m.b !== undefined ? `${m.b}` : null,
    s: au.art === "kegO" ? "s" : null, hs: au.art === "pyrO" ? "hₛ" : null };
  return <KoerperBild k={au.k} m={m} beschr={b} hoehe={190} />;
}

const hilfe = (au) => hilfeKontext({
  id: `koerper-${au.art}`, aufgabe: "Körper Volumen Oberfläche Zylinder Kegel Pyramide Kugel Prisma Mantel Mantellinie",
  verstehen: [zw("Welche Grundfläche hat der Körper? Ist er gerade (Prisma, Zylinder) oder spitz (Pyramide, Kegel)?", "What is the base? Is the solid straight (prism, cylinder) or pointed (pyramid, cone)?")],
  ansatz: [zw("Gerade: V = G · h. Spitz: V = G · h : 3. Kugel: V = 4/3 · πr³.", "Straight: V = G · h. Pointed: V = G · h : 3. Sphere: V = 4/3 · πr³.")],
  regel: [zw("Für die Oberfläche spitzer Körper die schräge Höhe mit Pythagoras bestimmen.", "For the surface of pointed solids, find the slanted height with Pythagoras.")],
  pruefen: [zw("Einheiten: Volumen in cm³, Flächen in cm².", "Units: volume in cm³, areas in cm².")],
});

const MODI = [["entdecken", zw("Entdecken", "Explore")], ["ueben", zw("Üben", "Practise")]];

export function KoerperVolumen() {
  const [modus, setModus] = useState("entdecken");
  return (
    <Seite titel={zw("Körper: Volumen und Oberfläche", "Solids: volume and surface")}
      text={zw("Prisma, Zylinder, Pyramide, Kegel und Kugel – mit Schrägbild, den Formeln dahinter und Pythagoras für die schrägen Höhen.", "Prism, cylinder, pyramid, cone and sphere – with oblique drawings, the formulas behind them and Pythagoras for the slanted heights.")}>
      <ModusLeiste modi={MODI} modus={modus} setModus={setModus} label={zw("Körper", "Solids")} />
      <Aufklapp titel={zw("Kurz erklärt", "In short")}>
        {Object.keys(FORMEL).map((k) => <p key={k} style={{ margin: "0 0 4px" }}><b>{NAMEN[k]}:</b> <M t={FORMEL[k][0]} />, <M t={FORMEL[k][1]} /></p>)}
        <p style={{ margin: "6px 0 0" }}>{zw("Kegel: s = √(r² + h²). Pyramide: hₛ = √(h² + (a/2)²).", "Cone: s = √(r² + h²). Pyramid: hₛ = √(h² + (a/2)²).")}</p>
      </Aufklapp>
      <div style={{ display: modus === "entdecken" ? "block" : "none" }}><Entdecken /></div>
      <div style={{ display: modus === "ueben" ? "block" : "none" }}>
        <UebenRahmen titel={TITEL} arten={KOERPER_ARTEN} neue={neue} schritte={schritte} text={text} skizze={skizze} hilfe={hilfe} />
      </div>
    </Seite>
  );
}
