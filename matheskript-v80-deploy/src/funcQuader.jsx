/* ============================================================
   Unterstufe · Quader und Würfel
   · Entdecken – Quader aus Einheitswürfeln (Regler a, b, c): Volumen,
     Oberfläche, Kantenlänge; Würfelnetze falten: gegenüberliegende
     Flächen haben dieselbe Farbe, ungültige Netze werden erkannt
   · Üben – Volumen, Oberfläche, Kantenlänge, Höhe aus dem Volumen,
     Würfel, „Welches ist ein Würfelnetz?“
   Mathematik in unterGen.js (getestet, inkl. Faltprüfung: 11 Netze).
   ============================================================ */
import React, { useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { Auswahl, hilfeKontext, karte, kicker, zw } from "./ui2.jsx";
import { NETZE, QUADER_ARTEN, netzFalten, quaderAufgabe } from "./unterGen.js";
import { Merke, Regler, UebenRahmen, WertZeile, ZweiModi, ws, zs } from "./geoUi.jsx";
import { werkzeugAnimationen } from "./unterstufeMedien.js";
import { FeinKarte, titelStil, useDesktop } from "./arbeitsflaeche.jsx";
import { ChipWahl, ErklaerKarte, GeoDesktop, ReglerD, ReglerKarte, ThemenLeiste, WerteKarte } from "./geoDesktop.jsx";

let zaehler = 0;
const PAAR = { A: 0, B: 0, C: 1, D: 1, E: 2, F: 2 };
const FARBEN = [C.flaggold, C.see, C.smaragd];

/* echt: in echten Pixeln (1 Einheit = 1 px), mittig – für den Desktop */
export function NetzBild({ id, faerben = false, nr = null, groesse = 26, echt = false }) {
  const n = NETZE.find((x) => x.id === id);
  const f = netzFalten(n.zellen);
  const W = Math.max(...n.zellen.map((c) => c[0])) + 1, H = Math.max(...n.zellen.map((c) => c[1])) + 1;
  const vb = [W * groesse + 8, H * groesse + 8 + (nr ? 18 : 0)];
  return (
    <svg viewBox={`-4 -4 ${vb[0]} ${vb[1]}`} style={echt ? { width: vb[0], maxWidth: "100%", height: "auto", display: "block", margin: "0 auto" } : { width: "100%", height: "auto", maxHeight: 170, display: "block" }} role="img" aria-label={zw("Würfelnetz", "Cube net")}>
      {n.zellen.map((c) => {
        const fl = f.flaechen[c.join(",")];
        const farbe = faerben && f.gueltig && fl ? FARBEN[PAAR[fl]] : null;
        return <rect key={c.join(",")} x={c[0] * groesse} y={c[1] * groesse} width={groesse} height={groesse} fill={farbe ? `${farbe}88` : `${C.see}14`} stroke={C.tinte} strokeWidth="1.5" />;
      })}
      {nr && <text x={(W * groesse) / 2} y={H * groesse + 16} textAnchor="middle" style={{ fontSize: 13, fontWeight: 800, fill: C.see, fontFamily: "inherit" }}>{nr}</text>}
    </svg>
  );
}

function QuaderBild({ a, b, c, echt = false }) {
  /* Schrägbild aus Einheitswürfeln: Tiefe b unter 30°, halb verkürzt.
     echt (Desktop): größerer Rahmen, in echten Pixeln gezeichnet und mittig */
  const s = echt ? Math.min(46, 360 / (a + b * 0.6 + 1), 270 / (c + b * 0.4 + 0.5)) : Math.min(26, 230 / (a + b * 0.6 + 1), 150 / (c + b * 0.4 + 0.5));
  const dx = s * 0.5 * Math.cos(Math.PI / 6), dy = s * 0.5 * Math.sin(Math.PI / 6);
  const W = a * s + b * dx + 20, H = c * s + b * dy + 20, x0 = 10, y0 = H - 10;
  const P = (x, y, z) => [x0 + x * s + y * dx, y0 - z * s - y * dy];
  const pfad = (pts) => pts.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ") + "Z";
  const linien = [];
  for (let i = 0; i <= a; i++) { linien.push([P(i, 0, 0), P(i, 0, c)]); linien.push([P(i, 0, c), P(i, b, c)]); }
  for (let k = 0; k <= c; k++) { linien.push([P(0, 0, k), P(a, 0, k)]); linien.push([P(a, 0, k), P(a, b, k)]); }
  for (let j = 0; j <= b; j++) { linien.push([P(0, j, c), P(a, j, c)]); linien.push([P(a, j, 0), P(a, j, c)]); }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={echt ? { width: W, maxWidth: "100%", height: "auto", display: "block", margin: "0 auto" } : { width: "100%", height: "auto", maxHeight: 240, display: "block" }} role="img" aria-label={zw("Quader aus Einheitswürfeln", "Cuboid made of unit cubes")}>
      <path d={pfad([P(0, 0, 0), P(a, 0, 0), P(a, 0, c), P(0, 0, c)])} fill={`${C.see}22`} />
      <path d={pfad([P(0, 0, c), P(a, 0, c), P(a, b, c), P(0, b, c)])} fill={`${C.flaggold}44`} />
      <path d={pfad([P(a, 0, 0), P(a, b, 0), P(a, b, c), P(a, 0, c)])} fill={`${C.see}38`} />
      {linien.map(([p, q], i) => <line key={i} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke={`${C.tinte}88`} strokeWidth="0.8" />)}
      <path d={pfad([P(0, 0, 0), P(a, 0, 0), P(a, b, 0), P(a, b, c), P(0, b, c), P(0, 0, c)])} fill="none" stroke={C.tinte} strokeWidth="1.8" />
    </svg>
  );
}

function Entdecken() {
  const [teil, setTeil] = useState("quader");
  const [a, setA] = useState(4);
  const [b, setB] = useState(3);
  const [c, setC] = useState(2);
  const [netz, setNetz] = useState("kreuz");
  const f = netzFalten(NETZE.find((n) => n.id === netz).zellen);
  const desktop = useDesktop();
  const TEILE = [["quader", zw("Quader aus Würfeln", "Cuboid from cubes")], ["netz", zw("Würfelnetze falten", "Folding cube nets")]];
  const NETZ_OPT = NETZE.map((n, i) => [n.id, String(i + 1)]);
  const quaderMerke = zw(`Volumen = Zahl der Einheitswürfel: ${a} in einer Reihe, ${b} Reihen, ${c} Schichten. Die Oberfläche besteht aus drei Paaren gleicher Rechtecke.`, `Volume = number of unit cubes: ${a} in a row, ${b} rows, ${c} layers. The surface consists of three pairs of equal rectangles.`);
  const netzMerke = f.gueltig
    ? zw("Das ist ein Würfelnetz. Gleiche Farbe = gegenüberliegende Flächen: Sie berühren sich im Netz nie an einer Kante.", "This is a cube net. Same colour = opposite faces: in the net they never share an edge.")
    : zw("Kein Würfelnetz: Beim Falten würden zwei Flächen aufeinander liegen (z. B. 2 × 2-Block oder fünf in einer Reihe).", "Not a cube net: when folding, two faces would end up on top of each other (e.g. a 2 × 2 block or five in a row).");
  const werte = <>
    <WertZeile links={<M t="V = a · b · c" />} rechts={`${a * b * c} cm³`} farbe={C.gruen} />
    <WertZeile links={<M t="O = 2(ab + ac + bc)" />} rechts={`${2 * (a * b + a * c + b * c)} cm²`} />
    <WertZeile links={zw("Kantenlänge 4(a + b + c)", "Edge length 4(a + b + c)")} rechts={`${4 * (a + b + c)} cm`} />
  </>;
  if (desktop) {
    const thema = <ThemenLeiste titel={zw("Was willst du sehen?", "What do you want to see?")} optionen={TEILE} wert={teil} setWert={setTeil} label={zw("Thema", "Topic")} />;
    if (teil === "quader") {
      return (
        <GeoDesktop thema={thema}
          links={<>
            <ReglerKarte titel={zw("Kanten", "Edges")}>
              <ReglerD name={zw("a (Länge)", "a (length)")} wert={a} setWert={setA} min={1} max={8} schritt={1} format={(v) => String(v)} />
              <ReglerD name={zw("b (Breite)", "b (width)")} wert={b} setWert={setB} min={1} max={6} schritt={1} format={(v) => String(v)} farbe={C.gruen} />
              <ReglerD name={zw("c (Höhe)", "c (height)")} wert={c} setWert={setC} min={1} max={6} schritt={1} format={(v) => String(v)} farbe="#8A6A00" />
            </ReglerKarte>
          </>}
          bild={<div style={{ padding: "18px 8px", display: "flex", alignItems: "center", minHeight: 300 }}><div style={{ width: "100%" }}><QuaderBild a={a} b={b} c={c} echt /></div></div>}
          unten={<>
            <WerteKarte titel={zw("Volumen, Oberfläche, Kanten", "Volume, surface, edges")}>{werte}</WerteKarte>
            <ErklaerKarte>{quaderMerke}</ErklaerKarte>
          </>} />
      );
    }
    return (
      <GeoDesktop thema={thema}
        links={<>
          <FeinKarte>
            <p style={titelStil}>{zw("Netz wählen", "Choose a net")}</p>
            <ChipWahl optionen={NETZ_OPT} wert={netz} setWert={setNetz} label={zw("Netz", "Net")} />
          </FeinKarte>
          <ErklaerKarte farbe={f.gueltig ? C.smaragd : C.gruen} titel={f.gueltig ? zw("Würfelnetz", "Cube net") : zw("Kein Würfelnetz", "Not a cube net")}>{netzMerke}</ErklaerKarte>
        </>}
        bild={<div style={{ padding: "24px 8px", minHeight: 260, display: "flex", alignItems: "center" }}><div style={{ width: "100%" }}><NetzBild id={netz} faerben groesse={54} echt /></div></div>} />
    );
  }
  return (
    <div style={{ ...karte, marginTop: 16 }}>
      <p style={kicker}>{zw("Was willst du sehen?", "What do you want to see?")}</p>
      <Auswahl optionen={TEILE} wert={teil} setWert={setTeil} label={zw("Thema", "Topic")} />
      {teil === "quader" ? (
        <>
          <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
            <Regler name={zw("a (Länge)", "a (length)")} wert={a} setWert={setA} min={1} max={8} schritt={1} format={(v) => String(v)} breiteName={86} />
            <Regler name={zw("b (Breite)", "b (width)")} wert={b} setWert={setB} min={1} max={6} schritt={1} format={(v) => String(v)} breiteName={86} farbe={C.gruen} />
            <Regler name={zw("c (Höhe)", "c (height)")} wert={c} setWert={setC} min={1} max={6} schritt={1} format={(v) => String(v)} breiteName={86} farbe="#8A6A00" />
          </div>
          <div style={{ marginTop: 12, background: C.sand, borderRadius: 14, padding: 8 }}><QuaderBild a={a} b={b} c={c} /></div>
          {werte}
          <Merke>{quaderMerke}</Merke>
        </>
      ) : (
        <>
          <div style={{ marginTop: 12 }}><Auswahl optionen={NETZ_OPT} wert={netz} setWert={setNetz} label={zw("Netz", "Net")} /></div>
          <div style={{ marginTop: 12, background: C.sand, borderRadius: 14, padding: 12, maxWidth: 300 }}><NetzBild id={netz} faerben groesse={30} /></div>
          <Merke farbe={f.gueltig ? C.smaragd : C.gruen}>{netzMerke}</Merke>
        </>
      )}
    </div>
  );
}

const TITEL = { volumen: ["Volumen", "Volume"], oberflaeche: ["Oberfläche", "Surface area"], kanten: ["Kantenlänge", "Total edge length"], hoehe: ["Höhe aus Volumen", "Height from volume"], wuerfel: ["Würfel", "Cube"], netz: ["Würfelnetz erkennen", "Spot the cube net"] };
const neue = (art) => ({ id: ++zaehler, ...quaderAufgabe(art) });

function schritte(q) {
  switch (q.art) {
    case "volumen": return [zs("qu-v", zw("Volumen", "Volume"), "V =", q.V, zw("Berechne das Volumen.", "Calculate the volume."), { einheit: "cm³", fehler: [{ wert: q.O, text: zw("Das ist die Oberfläche.", "That's the surface area.") }, { wert: q.a + q.b + q.c, text: zw("Volumen ist ein Produkt: a · b · c.", "Volume is a product: a · b · c.") }], hinweis: `${q.a} · ${q.b} · ${q.c}`, erkl: `V = ${q.a} · ${q.b} · ${q.c} = ${q.V} cm³` })];
    case "oberflaeche": return [
      zs("qu-o1", zw("Drei Flächen", "Three faces"), "ab + ac + bc =", q.O / 2, zw("Berechne die drei verschiedenen Rechteckflächen und addiere sie.", "Calculate the three different rectangles and add them."), { hinweis: `${q.a * q.b} + ${q.a * q.c} + ${q.b * q.c}`, erkl: `${q.a * q.b} + ${q.a * q.c} + ${q.b * q.c} = ${q.O / 2}` }),
      zs("qu-o2", zw("Oberfläche", "Surface area"), "O =", q.O, zw("Jedes Rechteck kommt zweimal vor.", "Each rectangle appears twice."), { einheit: "cm²", fehler: [{ wert: q.O / 2, text: zw("Noch verdoppeln – oben/unten, vorn/hinten, links/rechts.", "Still double it – top/bottom, front/back, left/right.") }], hinweis: `2 · ${q.O / 2}`, erkl: `O = ${q.O} cm²` }),
    ];
    case "kanten": return [zs("qu-k", zw("Kantenlänge", "Edge length"), zw("Kanten =", "Edges ="), q.K, zw("Wie lang sind alle 12 Kanten zusammen?", "How long are all 12 edges together?"), { einheit: "cm", fehler: [{ wert: q.a + q.b + q.c, text: zw("Jede Kantenlänge kommt viermal vor.", "Each edge length appears four times.") }, { wert: 2 * (q.a + q.b + q.c), text: zw("Es sind 12 Kanten – je 4 gleich lange.", "There are 12 edges – 4 of each length.") }], hinweis: `4 · (${q.a} + ${q.b} + ${q.c})`, erkl: `4 · ${q.a + q.b + q.c} = ${q.K} cm` })];
    case "hoehe": return [
      zs("qu-h1", zw("Grundfläche", "Base"), "G =", q.a * q.b, zw("Berechne die Grundfläche a · b.", "Calculate the base a · b."), { einheit: "cm²", erkl: `${q.a} · ${q.b} = ${q.a * q.b}` }),
      zs("qu-h2", zw("Höhe", "Height"), "c =", q.c, zw("Teile das Volumen durch die Grundfläche.", "Divide the volume by the base."), { einheit: "cm", fehler: [{ wert: q.V * q.a * q.b, text: zw("Teilen, nicht malnehmen.", "Divide, don't multiply.") }], hinweis: `${q.V} : ${q.a * q.b}`, erkl: `c = ${q.V} : ${q.a * q.b} = ${q.c} cm` }),
    ];
    case "wuerfel": return [
      zs("qu-w1", zw("Volumen", "Volume"), "V =", q.V, zw("Berechne das Volumen des Würfels.", "Calculate the cube's volume."), { einheit: "cm³", fehler: [{ wert: 3 * q.a, text: zw("a³ heißt a · a · a, nicht 3 · a.", "a³ means a · a · a, not 3 · a.") }, { wert: q.a * q.a, text: zw("Das ist nur eine Fläche. Volumen hat drei Dimensionen.", "That's only one face. Volume has three dimensions.") }], hinweis: `${q.a} · ${q.a} · ${q.a}`, erkl: `V = ${q.a}³ = ${q.V} cm³` }),
      zs("qu-w2", zw("Oberfläche", "Surface area"), "O =", q.O, zw("Berechne die Oberfläche.", "Calculate the surface area."), { einheit: "cm²", fehler: [{ wert: 4 * q.a * q.a, text: zw("Ein Würfel hat 6 Flächen.", "A cube has 6 faces.") }], hinweis: `6 · ${q.a}²`, erkl: `O = 6 · ${q.a * q.a} = ${q.O} cm²` }),
    ];
    default: return [ws("qu-n", zw("Würfelnetz", "Cube net"), zw("Welche Figur lässt sich zu einem Würfel falten?", "Which figure folds into a cube?"), q.netze.map((id, i) => [id, `${zw("Netz", "Net")} ${i + 1}`]), q.richtig,
      { fehler: q.netze.filter((id) => id !== q.richtig).map((id) => ({ wahl: id, text: zw("Falte in Gedanken: Hier würden zwei Flächen übereinander liegen. Ein 2 × 2-Block oder fünf in einer Reihe gehen nie.", "Fold it in your mind: two faces would overlap here. A 2 × 2 block or five in a row never work.") })),
        hinweis: zw("Probier die Netze im Modus Entdecken aus.", "Try the nets in Explore mode."), erkl: zw(`Netz ${q.netze.indexOf(q.richtig) + 1} ist ein Würfelnetz.`, `Net ${q.netze.indexOf(q.richtig) + 1} is a cube net.`) })];
  }
}

function text(q) {
  if (q.art === "wuerfel") return zw(`Ein Würfel hat die Kantenlänge a = ${q.a} cm.`, `A cube has edge length a = ${q.a} cm.`);
  if (q.art === "netz") return zw("Welches dieser drei Netze ist ein Würfelnetz?", "Which of these three nets is a cube net?");
  if (q.art === "hoehe") return zw(`Ein Quader hat das Volumen ${q.V} cm³, die Länge ${q.a} cm und die Breite ${q.b} cm. Wie hoch ist er?`, `A cuboid has volume ${q.V} cm³, length ${q.a} cm and width ${q.b} cm. How tall is it?`);
  return zw(`Ein Quader ist ${q.a} cm lang, ${q.b} cm breit und ${q.c} cm hoch.`, `A cuboid is ${q.a} cm long, ${q.b} cm wide and ${q.c} cm tall.`);
}
function skizze(q) {
  if (q.art === "netz") return <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, alignItems: "end" }}>{q.netze.map((id, i) => <NetzBild key={id} id={id} nr={`${zw("Netz", "Net")} ${i + 1}`} groesse={20} />)}</div>;
  if (q.art === "wuerfel") return <QuaderBild a={Math.min(q.a, 6)} b={Math.min(q.a, 6)} c={Math.min(q.a, 6)} />;
  return <QuaderBild a={q.a} b={q.b} c={q.c} />;
}
const hilfe = (q) => hilfeKontext({
  id: `quader-${q.art}`, aufgabe: "Quader Würfel Volumen Oberfläche Kantenlänge Würfelnetz Einheitswürfel",
  verstehen: [zw("Volumen = wie viele Einheitswürfel hineinpassen. Oberfläche = wie viel Papier man zum Einpacken braucht.", "Volume = how many unit cubes fit in. Surface area = how much paper you need to wrap it.")],
  ansatz: [zw("V = a · b · c, O = 2(ab + ac + bc), Würfel: V = a³, O = 6a².", "V = a · b · c, S = 2(ab + ac + bc), cube: V = a³, S = 6a².")],
  regel: [zw("Volumen in cm³, Oberfläche in cm², Kanten in cm.", "Volume in cm³, surface in cm², edges in cm.")],
  pruefen: [zw("Würfelnetz: Gegenüberliegende Flächen berühren sich nicht.", "Cube net: opposite faces don't touch.")],
});

export function QuaderWuerfel() {
  return (
    <ZweiModi animationen={werkzeugAnimationen("quader")} titel={zw("Quader und Würfel", "Cuboids and cubes")}
      text={zw("Volumen aus Einheitswürfeln, Oberfläche aus sechs Rechtecken – und welche Netze sich wirklich zu einem Würfel falten lassen.", "Volume from unit cubes, surface from six rectangles – and which nets really fold into a cube.")}
      kurz={<p style={{ margin: 0 }}>{zw("Quader: V = a · b · c, O = 2 · (a · b + a · c + b · c), 12 Kanten. Würfel: V = a³, O = 6a². Es gibt genau 11 verschiedene Würfelnetze.", "Cuboid: V = a · b · c, S = 2 · (a · b + a · c + b · c), 12 edges. Cube: V = a³, S = 6a². There are exactly 11 different cube nets.")}</p>}
      entdecken={<Entdecken />}
      ueben={<UebenRahmen titel={TITEL} arten={QUADER_ARTEN} neue={neue} schritte={schritte} text={text} skizze={skizze} hilfe={hilfe} />} />
  );
}
