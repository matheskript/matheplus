import React, { useEffect, useMemo, useState } from "react";
import { C } from "./base1.jsx";
import { M, Formel } from "./func3.jsx";
import { GrosserKnopf, KleinerLink, Rueck, karte } from "./ui2.jsx";
import { Aufklapp, SchrittFolge, zt } from "./ui3.jsx";
import { Aufforderung, BildKarte, T, Zaehler } from "./funcEntdeckenPotenz.jsx";
import { MODUL_PHASEN, modulFertigSetzen, modulPhaseSetzen, modulStand, modulStandSetzen, modulZuruecksetzen } from "./entdeckenSpeicher.js";
import { beweisZwei, dreieckBeiT, quadrateUeber, schraegesQuadrat, umlegePlan, zufallsTripel } from "./pythagoras.js";

import { springe } from "./sprung.js";
/* ======================================================================
   ENTDECKE DEN SATZ DES PYTHAGORAS – VOM RECHTECK ZUM BEWEIS
   Sechsphasiges, interaktives Lernmodul (Teil von „Mathe entdecken“):
     1 Der Flächeninhalt eines Rechtecks
     2 Das rechtwinklige Dreieck – das halbe Rechteck
     3 Jedes Dreieck: zwei rechtwinklige Dreiecke
     4 Der Satz des Pythagoras – Beweis mit dem Quadrat der Seite a + b
     5 Ein zweiter Beweis – das Quadrat in der Mitte
     6 Den Satz anwenden
   Aufbau wie beim Potenzregel-Modul: kurze Einführung, ein Schaubild zum Ausprobieren
   und geführte Schritte (Eingabe oder Auswahl, gestufte Hinweise, gezielte Rückmeldung
   bei typischen Denkfehlern, Lösung nur auf Wunsch). Der Stand wird je Schritt
   gespeichert (entdeckenSpeicher.js, Kennung „pythagoras“). Die Geometrie der Bilder
   steht – getestet – in pythagoras.js.
   ====================================================================== */

const ID = "pythagoras";
export const PYTHAGORAS_PHASEN_ANZAHL = MODUL_PHASEN[ID];

const BLAU = "#D6E4F7", GOLD = "#FFF1BF", GOLD2 = "#FBE08A", GRANA = "#F7D3E0", DREIECK = "#A9C4EC";
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const punkte = (arr) => arr.map((p) => p.map((v) => v.toFixed(2)).join(",")).join(" ");
const komma = (v, st = 3) => zt(v, st).replace(",", "{,}");

const Beschriftung = ({ x, y, children, farbe = C.tinte, groesse = 13, anker = "middle" }) => (
  <text x={x} y={y} textAnchor={anker} fontSize={groesse} fontWeight="700" fill={farbe}>{children}</text>
);

const svgStil = { width: "100%", maxWidth: 340, display: "block", margin: "0 auto" };

function Schieber({ label, wert, setWert, text }) {
  return (
    <label style={{ display: "block", marginTop: 12, fontSize: 13.5, fontWeight: 600, color: C.grau }}>
      {label}{text !== undefined && <> <b style={{ color: C.tinte }}>{text}</b></>}
      <input type="range" min="0" max="100" step="1" value={Math.round(wert * 100)} onChange={(e) => setWert(Number(e.target.value) / 100)} aria-label={label}
        style={{ width: "100%", accentColor: C.see, height: 36 }} />
    </label>
  );
}

const KleinKnopf = ({ children, onClick, an }) => (
  <button type="button" onClick={onClick} aria-pressed={an}
    style={{ flex: 1, minHeight: 40, borderRadius: 10, fontFamily: "inherit", cursor: "pointer", fontSize: 13, fontWeight: 700,
      border: `1.5px solid ${an ? C.see : C.linie}`, background: an ? C.see : C.weiss, color: an ? C.weiss : C.see }}>{children}</button>
);

/* ---------- Phase 1: Rechteck aus Kästchen ---------- */
function RechteckBild() {
  const [a, setA] = useState(3);
  const [b, setB] = useState(4);
  const u = Math.min(250 / a, 170 / b, 44), w = a * u, h = b * u, x0 = (320 - w) / 2, y0 = 20;
  return (
    <BildKarte>
      <Aufforderung>Verändere die Seitenlängen und zähle die Kästchen. Wie hängt ihre Anzahl von a und b ab?</Aufforderung>
      <svg viewBox="0 0 320 238" role="img" aria-label={`Rechteck mit den Seiten ${a} und ${b} aus ${a * b} Kästchen`} style={svgStil}>
        {Array.from({ length: b }, (_, j) => Array.from({ length: a }, (_, i) => (
          <rect key={`${i}-${j}`} x={x0 + i * u} y={y0 + j * u} width={u} height={u} fill={BLAU} stroke={C.weiss} strokeWidth="1.5" />
        )))}
        <rect x={x0} y={y0} width={w} height={h} fill="none" stroke={C.see} strokeWidth="2" />
        <Beschriftung x={x0 + w / 2} y={y0 + h + 21} farbe={C.see}>a</Beschriftung>
        <Beschriftung x={x0 - 11} y={y0 + h / 2 + 5} farbe={C.gruen}>b</Beschriftung>
      </svg>
      <div style={{ display: "flex", gap: 22, flexWrap: "wrap", justifyContent: "center", marginTop: 10 }}>
        <Zaehler label="a" wert={a} setWert={setA} min={1} max={8} />
        <Zaehler label="b" wert={b} setWert={setB} min={1} max={6} />
      </div>
      <div style={{ textAlign: "center", fontSize: 16, marginTop: 12 }}><T s={"$" + a + "\\cdot " + b + " = " + a * b + "$"} /> <span style={{ fontSize: 13.5, color: C.grau }}>Kästchen</span></div>
    </BildKarte>
  );
}

/* ---------- Phase 2: Diagonale halbiert das Rechteck ---------- */
function DiagonaleBild() {
  const [a, setA] = useState(3);
  const [b, setB] = useState(4);
  const [d, setD] = useState(0);
  const u = Math.min(250 / a, 170 / b, 44), w = a * u, h = b * u, x0 = (320 - w) / 2, y0 = 20;
  const cx = x0 + w / 2, cy = y0 + h / 2, m = 10;
  return (
    <BildKarte>
      <Aufforderung>Die Diagonale halbiert das Rechteck. Drehe das rosa Dreieck mit dem Schieber – passt es genau auf das blaue?</Aufforderung>
      <svg viewBox="0 0 320 238" role="img" aria-label="Rechteck, durch die Diagonale in zwei rechtwinklige Dreiecke geteilt" style={svgStil}>
        <polygon points={punkte([[x0, y0 + h], [x0 + w, y0 + h], [x0 + w, y0]])} fill={BLAU} stroke={C.see} strokeWidth="2" strokeLinejoin="round" />
        <polygon points={punkte([[x0, y0 + h], [x0 + w, y0], [x0, y0]])} fill={GRANA} fillOpacity="0.92" stroke={C.gruen} strokeWidth="2" strokeLinejoin="round"
          transform={`rotate(${180 * d} ${cx} ${cy})`} />
        <line x1={x0} y1={y0 + h} x2={x0 + w} y2={y0} stroke={C.tinte} strokeWidth="1.5" strokeDasharray={d > 0.98 ? "0" : "5 4"} opacity="0.6" />
        <path d={`M${x0 + w - m} ${y0 + h} L${x0 + w - m} ${y0 + h - m} L${x0 + w} ${y0 + h - m}`} fill="none" stroke={C.tinte} strokeWidth="1.4" />
        <Beschriftung x={x0 + w / 2} y={y0 + h + 21} farbe={C.see}>a</Beschriftung>
        <Beschriftung x={x0 + w + 12} y={y0 + h / 2 + 5} farbe={C.gruen}>b</Beschriftung>
      </svg>
      <Schieber label="Rosa Dreieck drehen" wert={d} setWert={setD} />
      <div style={{ display: "flex", gap: 22, flexWrap: "wrap", justifyContent: "center", marginTop: 6 }}>
        <Zaehler label="a" wert={a} setWert={setA} min={1} max={8} />
        <Zaehler label="b" wert={b} setWert={setB} min={1} max={6} />
      </div>
      <p style={{ margin: "12px 0 0", fontSize: 13.5, color: C.grau, lineHeight: 1.6 }}>
        Die Seiten am rechten Winkel heißen <b style={{ color: C.tinte }}>Katheten</b> (hier a und b), die Diagonale gegenüber heißt <b style={{ color: C.tinte }}>Hypotenuse</b>.
      </p>
    </BildKarte>
  );
}

/* ---------- Phase 3: Spitze irgendwo auf der oberen Kante ---------- */
function DreieckBild() {
  const [a, setA] = useState(4);
  const [b, setB] = useState(7);
  const [p, setP] = useState(2);
  const pp = Math.min(p, b), q = b - pp;
  const u = Math.min(260 / b, 165 / a, 42), w = b * u, h = a * u, x0 = (320 - w) / 2, y0 = 22, yb = y0 + h, sx = x0 + pp * u;
  return (
    <BildKarte>
      <Aufforderung>Verschiebe die Spitze auf der oberen Kante. Wie ändern sich die beiden Teilflächen – und ihre Summe?</Aufforderung>
      <svg viewBox="0 0 320 244" role="img" aria-label="Rechteck mit einem Dreieck, dessen Spitze auf der oberen Kante liegt, zerlegt in zwei rechtwinklige Dreiecke" style={svgStil}>
        <rect x={x0} y={y0} width={w} height={h} fill="#F4F6FA" stroke={C.hellgrau} strokeWidth="1.2" strokeDasharray="4 3" />
        <polygon points={punkte([[x0, yb], [sx, yb], [sx, y0]])} fill={BLAU} stroke={C.see} strokeWidth="2" strokeLinejoin="round" />
        <polygon points={punkte([[sx, yb], [x0 + w, yb], [sx, y0]])} fill={GRANA} stroke={C.gruen} strokeWidth="2" strokeLinejoin="round" />
        <line x1={sx} y1={y0} x2={sx} y2={yb} stroke={C.tinte} strokeWidth="1.4" strokeDasharray="4 3" opacity="0.6" />
        <circle cx={sx} cy={y0} r="4.5" fill={C.tinte} />
        {pp > 0 && <Beschriftung x={x0 + (pp * u) / 2} y={yb + 20} farbe={C.see}>p</Beschriftung>}
        {q > 0 && <Beschriftung x={sx + (q * u) / 2} y={yb + 20} farbe={C.gruen}>q</Beschriftung>}
        <Beschriftung x={x0 - 11} y={y0 + h / 2 + 5} farbe={C.tinte}>a</Beschriftung>
        <Beschriftung x={x0 + w / 2} y={yb + 40} farbe={C.tinte}>b = p + q</Beschriftung>
      </svg>
      <div style={{ display: "flex", gap: 22, flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
        <Zaehler label="a" wert={a} setWert={setA} min={1} max={6} />
        <Zaehler label="b" wert={b} setWert={(v) => { setB(v); setP((x) => Math.min(x, v)); }} min={2} max={8} />
        <Zaehler label="p" wert={pp} setWert={setP} min={0} max={b} />
      </div>
      <Aufklapp titel="Zahlen zum Bild (zum Kontrollieren)">
        <p style={{ margin: "0 0 6px" }}><T s={"Links: $\\frac{p\\cdot a}{2} = \\frac{" + pp + "\\cdot " + a + "}{2}$ · Rechts: $\\frac{q\\cdot a}{2} = \\frac{" + q + "\\cdot " + a + "}{2}$"} /></p>
        <p style={{ margin: 0 }}><T s={"Zusammen: $\\frac{(p+q)\\cdot a}{2} = \\frac{" + b + "\\cdot " + a + "}{2} = " + komma((b * a) / 2) + "$"} /></p>
      </Aufklapp>
    </BildKarte>
  );
}

/* ---------- Phase 4: Dreiecke umlegen – das große Quadrat der Seite a + b ---------- */
function BeweisEinsBild() {
  const [a, setA] = useState(3);
  const [b, setB] = useState(4);
  const [t, setT] = useState(0);
  const s = a + b, D = 270, sc = D / s, X0 = 25, Y0 = 28;
  const P = ([x, y]) => [X0 + x * sc, Y0 + (s - y) * sc];
  const poly = (arr) => punkte(arr.map(P));
  const plan = useMemo(() => umlegePlan(a, b), [a, b]);
  const tri = plan.map((pl) => dreieckBeiT(pl, t));
  const [ax, ay] = P([0, a]), [bx, by] = P([a, s]);
  const text = t < 0.02 ? "Zerlegung 1: vier Dreiecke und das schräge Quadrat c²."
    : t > 0.98 ? "Zerlegung 2: dieselben vier Dreiecke – frei bleiben a² und b²."
    : "Die Dreiecke wandern. Sie bleiben gleich groß – also bleibt auch der freie Platz gleich groß.";
  return (
    <BildKarte>
      <Aufforderung>Schiebe den Regler: Die vier Dreiecke wandern im großen Quadrat der Seite a + b von einer Anordnung zur anderen.</Aufforderung>
      <svg viewBox="0 0 320 326" role="img" aria-label="Quadrat der Seite a plus b mit vier rechtwinkligen Dreiecken, die zwischen zwei Anordnungen umgelegt werden" style={svgStil}>
        <rect x={X0} y={Y0} width={D} height={D} fill="#FFF6D6" stroke={C.tinte} strokeWidth="1.6" />
        <polygon points={poly(schraegesQuadrat(a, b))} fill={GOLD2} fillOpacity={1 - t} />
        <rect x={ax} y={ay} width={a * sc} height={a * sc} fill={BLAU} fillOpacity={t} />
        <rect x={bx} y={by} width={b * sc} height={b * sc} fill={GRANA} fillOpacity={t} />
        <defs><clipPath id="pyth-beweis1-rahmen"><rect x={X0} y={Y0} width={D} height={D} /></clipPath></defs>
        <g clipPath="url(#pyth-beweis1-rahmen)">
          {tri.map((d, i) => <polygon key={i} points={poly(d)} fill={DREIECK} stroke={C.see} strokeWidth="1.6" strokeLinejoin="round" />)}
        </g>
        <rect x={X0} y={Y0} width={D} height={D} fill="none" stroke={C.tinte} strokeWidth="1.6" />
        {t < 0.04 && <Beschriftung x={P([s / 2, s / 2])[0]} y={P([s / 2, s / 2])[1] + 6} groesse={19}>c²</Beschriftung>}
        {t > 0.96 && <>
          <Beschriftung x={P([a / 2, a / 2])[0]} y={P([a / 2, a / 2])[1] + 6} groesse={19} farbe={C.see}>a²</Beschriftung>
          <Beschriftung x={P([a + b / 2, a + b / 2])[0]} y={P([a + b / 2, a + b / 2])[1] + 6} groesse={19} farbe={C.gruen}>b²</Beschriftung>
        </>}
        <Beschriftung x={X0 + (a * sc) / 2} y={Y0 + D + 20} farbe={C.see}>a</Beschriftung>
        <Beschriftung x={X0 + a * sc + (b * sc) / 2} y={Y0 + D + 20} farbe={C.gruen}>b</Beschriftung>
        <Beschriftung x={X0 + D / 2} y={Y0 - 10}>a + b</Beschriftung>
      </svg>
      <Schieber label="Dreiecke umlegen" wert={t} setWert={setT} />
      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
        <KleinKnopf an={t < 0.02} onClick={() => setT(0)}>Zerlegung 1</KleinKnopf>
        <KleinKnopf an={t > 0.98} onClick={() => setT(1)}>Zerlegung 2</KleinKnopf>
      </div>
      <p aria-live="polite" style={{ margin: "10px 0 0", fontSize: 13.5, color: C.grau, lineHeight: 1.6, minHeight: 44 }}>{text}</p>
      <div style={{ display: "flex", gap: 22, flexWrap: "wrap", justifyContent: "center", marginTop: 4 }}>
        <Zaehler label="a" wert={a} setWert={setA} min={1} max={6} />
        <Zaehler label="b" wert={b} setWert={setB} min={1} max={6} />
      </div>
      <Aufklapp titel="Zahlen zum Bild (zum Kontrollieren)">
        <p style={{ margin: "0 0 6px" }}><T s={"Großes Quadrat: $(a+b)^2 = " + s + "^2 = " + s * s + "$"} /></p>
        <p style={{ margin: "0 0 6px" }}><T s={"Vier Dreiecke: $4\\cdot\\frac{ab}{2} = 2ab = " + 2 * a * b + "$"} /></p>
        <p style={{ margin: "0 0 6px" }}><T s={"Zerlegung 1: $c^2 + " + 2 * a * b + " = " + s * s + "$, also $c^2 = " + (s * s - 2 * a * b) + "$"} /></p>
        <p style={{ margin: 0 }}><T s={"Zerlegung 2: $a^2 + b^2 + " + 2 * a * b + " = " + a * a + " + " + b * b + " + " + 2 * a * b + " = " + s * s + "$"} /></p>
      </Aufklapp>
    </BildKarte>
  );
}

/* ---------- Phase 5: c² außen, Dreiecke innen, Quadrat der Seite |a − b| in der Mitte ---------- */
function BeweisZweiBild() {
  const [a, setA] = useState(2);
  const [b, setB] = useState(5);
  const { c, V, innen, dreiecke } = useMemo(() => beweisZwei(a, b), [a, b]);
  const D = 258, sc = D / c, X0 = (320 - D) / 2, Y0 = 26;
  const P = ([x, y]) => [X0 + x * sc, Y0 + (c - y) * sc];
  const poly = (arr) => punkte(arr.map(P));
  const diff = Math.abs(b - a);
  const mitte = P([c / 2, c / 2]);
  const [v0, v1, q0] = dreiecke[0];
  const schw = P([(v0[0] + v1[0] + q0[0]) / 3, (v0[1] + v1[1] + q0[1]) / 3]);
  const randLabel = (p, q, text, farbe) => {
    const A = P(p), B = P(q), mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
    let dx = mx - schw[0], dy = my - schw[1];
    const n = Math.hypot(dx, dy) || 1;
    return <Beschriftung x={mx + (dx / n) * 12} y={my + (dy / n) * 12 + 5} farbe={farbe}>{text}</Beschriftung>;
  };
  const innenText = b > a ? "(b−a)²" : "(a−b)²";
  return (
    <BildKarte>
      <Aufforderung>Jetzt liegt das Quadrat der Seite c außen. Die vier Dreiecke sind nach innen geklappt – in der Mitte bleibt ein kleines Quadrat.</Aufforderung>
      <svg viewBox="0 0 320 316" role="img" aria-label="Quadrat der Seite c mit vier nach innen geklappten Dreiecken und einem kleinen Quadrat in der Mitte" style={svgStil}>
        <rect x={X0} y={Y0} width={D} height={D} fill={GOLD} />
        <polygon points={poly(innen)} fill={GOLD2} />
        {dreiecke.map((d, i) => <polygon key={i} points={poly(d)} fill={DREIECK} stroke={C.see} strokeWidth="1.6" strokeLinejoin="round" />)}
        <polygon points={poly(V)} fill="none" stroke={C.tinte} strokeWidth="1.8" strokeLinejoin="round" />
        {diff * sc > 38 && <Beschriftung x={mitte[0]} y={mitte[1] + 5} groesse={diff * sc > 56 ? 14 : 11}>{innenText}</Beschriftung>}
        <Beschriftung x={X0 + D / 2} y={Y0 + D + 22}>c</Beschriftung>
        {randLabel(v0, q0, "b", C.gruen)}
        {randLabel(q0, v1, "a", C.see)}
      </svg>
      <div style={{ display: "flex", gap: 22, flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
        <Zaehler label="a" wert={a} setWert={setA} min={1} max={6} />
        <Zaehler label="b" wert={b} setWert={setB} min={1} max={6} />
      </div>
      {a === b && <p style={{ margin: "10px 0 0", fontSize: 13.5, color: C.grau, lineHeight: 1.6 }}>Bei a = b schrumpft das Quadrat in der Mitte zu einem Punkt – die Fläche ist 0.</p>}
      <Aufklapp titel="Zahlen zum Bild (zum Kontrollieren)">
        <p style={{ margin: "0 0 6px" }}><T s={"Vier Dreiecke: $4\\cdot\\frac{ab}{2} = 2ab = " + 2 * a * b + "$"} /></p>
        <p style={{ margin: "0 0 6px" }}><T s={"Quadrat in der Mitte: $" + (b > a ? "(b-a)" : "(a-b)") + "^2 = " + diff + "^2 = " + diff * diff + "$"} /></p>
        <p style={{ margin: 0 }}><T s={"Außenquadrat: $c^2 = " + 2 * a * b + " + " + diff * diff + " = " + (2 * a * b + diff * diff) + "$"} /></p>
      </Aufklapp>
    </BildKarte>
  );
}

/* ---------- Phase 6: Quadrate über den drei Seiten ---------- */
function QuadrateBild() {
  const [a, setA] = useState(3);
  const [b, setB] = useState(4);
  const q = quadrateUeber(a, b), k = q.kasten;
  const bw = k.x1 - k.x0, bh = k.y1 - k.y0, sc = Math.min(296 / bw, 262 / bh), X0 = (320 - bw * sc) / 2, Y0 = 12;
  const P = ([x, y]) => [X0 + (x - k.x0) * sc, Y0 + (k.y1 - y) * sc];
  const poly = (arr) => punkte(arr.map(P));
  const mitteVon = (arr) => P([(arr[0][0] + arr[2][0]) / 2, (arr[0][1] + arr[2][1]) / 2]);
  const gitter = [];
  for (let i = 1; i < a; i++) { const [x1, y1] = P([i, 0]), [x2, y2] = P([i, -a]); gitter.push(<line key={`a${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.weiss} strokeWidth="1.2" />); }
  for (let j = 1; j < a; j++) { const [x1, y1] = P([0, -j]), [x2, y2] = P([a, -j]); gitter.push(<line key={`ah${j}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.weiss} strokeWidth="1.2" />); }
  for (let i = 1; i < b; i++) { const [x1, y1] = P([-i, 0]), [x2, y2] = P([-i, b]); gitter.push(<line key={`b${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.weiss} strokeWidth="1.2" />); }
  for (let j = 1; j < b; j++) { const [x1, y1] = P([-b, j]), [x2, y2] = P([0, j]); gitter.push(<line key={`bh${j}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.weiss} strokeWidth="1.2" />); }
  const [ma, mb, mc] = [mitteVon(q.quadratA), mitteVon(q.quadratB), mitteVon(q.quadratC)];
  const c2 = a * a + b * b, cText = Number.isInteger(Math.sqrt(c2)) ? "\\sqrt{" + c2 + "} = " + Math.sqrt(c2) : "\\sqrt{" + c2 + "} \\approx " + komma(Math.sqrt(c2));
  const o = P([0, 0]), m = 10;
  return (
    <BildKarte>
      <Aufforderung>Über jeder Seite des rechtwinkligen Dreiecks steht ein Quadrat. Verändere a und b – die beiden kleinen Quadrate zusammen und das große?</Aufforderung>
      <svg viewBox="0 0 320 286" role="img" aria-label={`Rechtwinkliges Dreieck mit den Katheten ${a} und ${b} und den Quadraten über allen drei Seiten`} style={svgStil}>
        <polygon points={poly(q.quadratA)} fill={BLAU} stroke={C.see} strokeWidth="1.8" />
        <polygon points={poly(q.quadratB)} fill={GRANA} stroke={C.gruen} strokeWidth="1.8" />
        <polygon points={poly(q.quadratC)} fill={GOLD} stroke="#B8920A" strokeWidth="1.8" strokeLinejoin="round" />
        {gitter}
        <polygon points={poly(q.dreieck)} fill="#E4E8F0" stroke={C.tinte} strokeWidth="2" strokeLinejoin="round" />
        <path d={`M${o[0] + m} ${o[1]} L${o[0] + m} ${o[1] - m} L${o[0]} ${o[1] - m}`} fill="none" stroke={C.tinte} strokeWidth="1.3" />
        <Beschriftung x={ma[0]} y={ma[1] + 5} farbe={C.see} groesse={a * sc > 34 ? 14 : 11}>{a * a}</Beschriftung>
        <Beschriftung x={mb[0]} y={mb[1] + 5} farbe={C.gruen} groesse={b * sc > 34 ? 14 : 11}>{b * b}</Beschriftung>
        <Beschriftung x={mc[0]} y={mc[1] + 5} groesse={c2 > 99 ? 15 : 14}>{c2}</Beschriftung>
      </svg>
      <div style={{ display: "flex", gap: 22, flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
        <Zaehler label="a" wert={a} setWert={setA} min={1} max={6} />
        <Zaehler label="b" wert={b} setWert={setB} min={1} max={6} />
      </div>
      <div style={{ background: C.sand, borderRadius: 12, padding: "10px 14px", marginTop: 12, fontSize: 15, lineHeight: 1.9, overflowX: "auto" }}>
        <div><T s={"$a^2 + b^2 = " + a * a + " + " + b * b + " = " + c2 + " = c^2$"} /></div>
        <div style={{ color: C.grau }}><T s={"$c = " + cText + "$"} /></div>
      </div>
    </BildKarte>
  );
}

/* ---------- Anzeige des Satzes ---------- */
function SatzAnzeige({ hell = false }) {
  return (
    <div style={{ margin: "14px 0 4px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: hell ? C.flaggold : C.gruenDunkel }}>Satz des Pythagoras:</span>
        <span style={{ fontSize: 22, color: hell ? C.weiss : C.tinte }}><M t="a^2 + b^2 = c^2" /></span>
      </div>
      <p style={{ margin: "8px 0 0", fontSize: 14, fontWeight: 300, lineHeight: 1.65, color: hell ? "#C9D6EE" : C.grau }}>
        In jedem rechtwinkligen Dreieck sind die Quadrate über den beiden Katheten zusammen genauso groß wie das Quadrat über der Hypotenuse.
      </p>
    </div>
  );
}

/* ---------- Schritte je Phase ---------- */
function bauePhasen(z) {
  const [ta, tb, tc] = z.t1, [tx, ty, tz] = z.t2;
  const opt = (liste) => liste.map(([id, s]) => [id, <T key={id} s={s} />]);

  return [
    {
      titel: "Der Flächeninhalt eines Rechtecks", kurz: "Rechteck",
      intro: "Alles beginnt mit einer Frage, die du seit der Grundschule kennst: Wie groß ist die Fläche eines Rechtecks? Wir messen sie in Kästchen – und am Ende steht eine Formel, die für jedes Rechteck gilt.",
      bild: <RechteckBild />,
      fertig: "Geschafft: Ein Rechteck mit den Seiten a und b hat die Fläche a · b. Ein Quadrat ist ein Rechteck mit a = b – seine Fläche ist a · a = a². Diese beiden Flächen brauchst du gleich.",
      schritte: [
        { id: "y1a", titel: "Kästchen zählen", typ: "zahl", frage: <T s="Stelle $a=3$ und $b=4$ ein. Wie viele Kästchen hat das Rechteck?" />, text: "Kästchen:", wert: 12, breite: 96,
          hinweise: ["Zähle die Kästchen einer Reihe und dann die Reihen.", "3 Kästchen pro Reihe, 4 Reihen."],
          fehler: [{ wert: 7, text: "7 ist 3 + 4 – das wäre der halbe Umfang. Gezählt wird die Fläche: 3 Kästchen in jeder von 4 Reihen." }, { wert: 14, text: "14 ist der Umfang (2·3 + 2·4), also der Weg um das Rechteck herum. Die Fläche zählt die Kästchen darin." }],
          erklaerung: <T s="$3\cdot 4 = 12$: 4 Reihen mit je 3 Kästchen." /> },
        { id: "y1b", titel: "Die Formel", typ: "wahl", frage: "Welche Formel gibt die Fläche eines Rechtecks mit den Seiten a und b an?", richtig: "r",
          optionen: opt([["f", "$a + b$"], ["r", "$a\\cdot b$"], ["g", "$2a + 2b$"], ["h", "$a^2 + b^2$"]]),
          fehler: [{ wahl: "f", text: "a + b ist nur eine Länge. Für die Fläche muss man die Kästchen pro Reihe mit der Anzahl der Reihen malnehmen." }, { wahl: "g", text: "2a + 2b ist der Umfang. Die Fläche ist ein Produkt." }, { wahl: "h", text: "a² + b² beschreibt zwei Quadrate, nicht ein Rechteck. Dass diese Summe später eine wichtige Rolle spielt, siehst du noch." }],
          hinweise: ["Denke an das Zählen: Kästchen pro Reihe mal Anzahl der Reihen."],
          erklaerung: <T s="Fläche des Rechtecks: $a\cdot b$." /> },
        { id: "y1c", titel: "Mit Maßen", typ: "zahl", frage: <T s="Ein Rechteck ist $7\,\text{cm}$ lang und $5\,\text{cm}$ breit. Wie groß ist seine Fläche in cm²?" />, text: "Fläche:", einheit: "cm²", wert: 35, breite: 96,
          hinweise: ["Länge mal Breite."],
          fehler: [{ wert: 12, text: "12 ist die Summe 7 + 5. Die Fläche ist das Produkt." }, { wert: 24, text: "24 ist der Umfang (2·7 + 2·5). Gefragt ist die Fläche." }],
          erklaerung: <T s="$7\cdot 5 = 35$, also $35\,\text{cm}^2$." /> },
        { id: "y1d", titel: "Das Quadrat", typ: "wahl", frage: <T s="Ein Quadrat hat die Seitenlänge $a$. Welche Fläche hat es?" />, richtig: "r",
          optionen: opt([["f", "$2a$"], ["g", "$4a$"], ["r", "$a\\cdot a = a^2$"], ["h", "$a + a$"]]),
          fehler: [{ wahl: "f", text: "2a ist dasselbe wie a + a – eine Länge. Die Fläche braucht beide Seiten: a mal a." }, { wahl: "g", text: "4a ist der Umfang des Quadrats (vier Seiten)." }, { wahl: "h", text: "a + a ist 2a, also eine Länge." }],
          erklaerung: <T s="Ein Quadrat ist ein Rechteck mit $b = a$. Die Fläche ist $a\cdot a = a^2$ – daher kommt der Name „a Quadrat“." /> },
      ],
    },
    {
      titel: "Das rechtwinklige Dreieck – das halbe Rechteck", kurz: "Dreieck",
      intro: "Jetzt halbieren wir das Rechteck mit einer Diagonale. Es entstehen zwei rechtwinklige Dreiecke. Was weißt du über ihre Fläche?",
      bild: <DiagonaleBild />,
      fertig: "Geschafft: Ein rechtwinkliges Dreieck mit den Katheten a und b ist ein halbes Rechteck. Seine Fläche ist a · b : 2.",
      schritte: [
        { id: "y2a", titel: "Die Hälfte", typ: "zahl", frage: <T s="Das Rechteck mit $a=3$ und $b=4$ wird durch die Diagonale halbiert. Wie groß ist die Fläche eines der beiden Dreiecke?" />, text: "Fläche:", wert: 6, breite: 96,
          hinweise: ["Das ganze Rechteck hat 12 Kästchen.", "Die Diagonale teilt es in zwei gleiche Hälften."],
          fehler: [{ wert: 12, text: "12 ist das ganze Rechteck. Das Dreieck ist nur die Hälfte davon." }, { wert: 7, text: "7 ist 3 + 4. Flächen bekommst du durch Multiplizieren." }, { wert: 3.5, text: "3,5 wäre die Hälfte von 3 + 4. Zuerst wird multipliziert (3 · 4 = 12), dann halbiert." }],
          erklaerung: <T s="$\frac{3\cdot 4}{2} = \frac{12}{2} = 6$." /> },
        { id: "y2b", titel: "Warum gleich groß?", typ: "wahl", frage: "Warum haben die beiden Dreiecke dieselbe Fläche? Probiere den Schieber im Bild.", richtig: "r",
          optionen: [["f", "Weil sie die Diagonale als gemeinsame Seite haben"], ["r", "Weil man das eine um 180° drehen kann und es genau auf das andere passt"], ["g", "Weil die Diagonale jeden Winkel des Rechtecks halbiert"]],
          fehler: [{ wahl: "f", text: "Eine gemeinsame Seite allein reicht nicht für gleiche Flächen. Entscheidend ist, dass die Dreiecke deckungsgleich sind – das zeigt der Schieber." }, { wahl: "g", text: "Das stimmt nur bei einem Quadrat. Bei a = 3 und b = 4 teilt die Diagonale die Winkel ungleich – die Dreiecke sind trotzdem gleich groß." }],
          erklaerung: "Dreht man das rosa Dreieck um den Mittelpunkt des Rechtecks um 180°, liegt es genau auf dem blauen. Deckungsgleiche Dreiecke haben dieselbe Fläche." },
        { id: "y2c", titel: "Die Formel", typ: "wahl", frage: <T s="Ein rechtwinkliges Dreieck hat die Katheten $a$ und $b$. Welche Formel gibt seine Fläche an?" />, richtig: "r",
          optionen: opt([["f", "$a\\cdot b$"], ["r", "$\\frac{a\\cdot b}{2}$"], ["g", "$\\frac{a+b}{2}$"], ["h", "$a + \\frac{b}{2}$"]]),
          fehler: [{ wahl: "f", text: "a · b ist das ganze Rechteck. Das Dreieck ist die Hälfte davon." }, { wahl: "g", text: "Die Hälfte der Summe hat mit der Fläche nichts zu tun – die Fläche ist die Hälfte des Produkts." }, { wahl: "h", text: "Hier wird nur b halbiert und dann addiert. Das ganze Produkt a · b wird halbiert." }],
          erklaerung: <T s="Fläche des rechtwinkligen Dreiecks: $\frac{a\cdot b}{2}$." /> },
        { id: "y2d", titel: "Mit Maßen", typ: "zahl", frage: <T s="Ein rechtwinkliges Dreieck hat die Katheten $6\,\text{cm}$ und $5\,\text{cm}$. Wie groß ist seine Fläche in cm²?" />, text: "Fläche:", einheit: "cm²", wert: 15, breite: 96,
          hinweise: ["Erst 6 · 5, dann halbieren."],
          fehler: [{ wert: 30, text: "30 ist das ganze Rechteck 6 · 5. Das Dreieck ist die Hälfte." }, { wert: 11, text: "11 ist 6 + 5. Für die Fläche wird multipliziert." }, { wert: 5.5, text: "5,5 ist die Hälfte von 6 + 5. Richtig ist: erst malnehmen, dann halbieren." }],
          erklaerung: <T s="$\frac{6\cdot 5}{2} = 15$, also $15\,\text{cm}^2$." /> },
      ],
    },
    {
      titel: "Jedes Dreieck: zwei rechtwinklige Dreiecke", kurz: "Zerlegen",
      intro: "Nicht jedes Dreieck hat einen rechten Winkel. Aber wenn die Spitze irgendwo auf der oberen Kante eines Rechtecks liegt (Breite $b$, Höhe $a$), zerfällt das Dreieck in zwei rechtwinklige Dreiecke. Die obere Kante teilt sich in $p$ und $q$, es gilt $p + q = b$.",
      bild: <DreieckBild />,
      fertig: "Geschafft: Egal wo die Spitze liegt – die Fläche ist immer b · a : 2. Allgemein gilt für jedes Dreieck mit Grundseite g und Höhe h die Formel A = g · h : 2.",
      schritte: [
        { id: "y3a", titel: "Das linke Teildreieck", typ: "zahl", frage: <T s="Stelle $a=4$, $b=7$ und $p=2$ ein (dann ist $q=5$). Wie groß ist die Fläche des linken rechtwinkligen Teildreiecks mit den Katheten $p$ und $a$?" />, text: "Fläche:", wert: 4, breite: 96,
          hinweise: ["Rechtwinkliges Dreieck: a · b : 2 aus Phase 2.", "Katheten 2 und 4."],
          fehler: [{ wert: 8, text: "8 ist das ganze Rechteck 2 · 4. Das Dreieck ist die Hälfte." }, { wert: 10, text: "10 ist die Fläche des rechten Teildreiecks (5 · 4 : 2). Gefragt ist das linke." }],
          erklaerung: <T s="$\frac{p\cdot a}{2} = \frac{2\cdot 4}{2} = 4$." /> },
        { id: "y3b", titel: "Das rechte Teildreieck", typ: "zahl", frage: <T s="Und wie groß ist die Fläche des rechten Teildreiecks mit den Katheten $q=5$ und $a=4$?" />, text: "Fläche:", wert: 10, breite: 96,
          hinweise: ["Katheten 5 und 4."],
          fehler: [{ wert: 20, text: "20 ist das ganze Rechteck 5 · 4. Das Dreieck ist die Hälfte." }, { wert: 4, text: "4 ist die Fläche des linken Teildreiecks. Hier rechnest du mit q = 5." }],
          erklaerung: <T s="$\frac{q\cdot a}{2} = \frac{5\cdot 4}{2} = 10$." /> },
        { id: "y3c", titel: "Das ganze Dreieck", typ: "zahl", frage: "Wie groß ist die Fläche des ganzen Dreiecks?", text: "Fläche:", wert: 14, breite: 96,
          hinweise: ["Addiere die beiden Teilflächen.", "4 + 10 = ?"],
          fehler: [{ wert: 28, text: "28 ist das ganze Rechteck 7 · 4. Das Dreieck ist die Hälfte davon." }, { wert: 10, text: "10 ist nur das rechte Teildreieck. Das ganze Dreieck besteht aus beiden Teilen." }],
          erklaerung: <T s="$4 + 10 = 14$. Kontrolle: $\frac{7\cdot 4}{2} = 14$ – dasselbe Ergebnis." /> },
        { id: "y3d", titel: "Warum immer dasselbe?", typ: "wahl", frage: <T s="Welche Rechnung zeigt allgemein, warum die Fläche nicht von $p$ abhängt?" />, richtig: "r",
          optionen: opt([["f", "$\\frac{p\\cdot a}{2} + \\frac{q\\cdot a}{2} = \\frac{p\\cdot q\\cdot a}{2}$"], ["r", "$\\frac{p\\cdot a}{2} + \\frac{q\\cdot a}{2} = \\frac{(p+q)\\cdot a}{2} = \\frac{b\\cdot a}{2}$"], ["g", "$p\\cdot a + q\\cdot a = b\\cdot a$"]]),
          fehler: [{ wahl: "f", text: "Beim Zusammenfassen wird der gemeinsame Faktor a ausgeklammert – dann steht p + q, nicht p · q. Prüfe mit p = 2, q = 5: 2 + 5 = 7, aber 2 · 5 = 10." }, { wahl: "g", text: "Die Rechnung vergisst die Halbierung: Beide Teildreiecke sind nur halb so groß wie die Rechtecke p · a und q · a." }],
          erklaerung: <T s="Beide Brüche haben den Faktor $\frac{a}{2}$: $\frac{p\cdot a}{2} + \frac{q\cdot a}{2} = \frac{(p+q)\cdot a}{2}$. Und weil $p + q = b$ ist, bleibt $\frac{b\cdot a}{2}$ – ganz ohne $p$." /> },
        { id: "y3e", titel: "Die Dreiecksformel", typ: "wahl", frage: <T s="Welche Formel gilt für jedes Dreieck mit Grundseite $g$ und Höhe $h$?" />, richtig: "r",
          optionen: opt([["f", "$g\\cdot h$"], ["r", "$\\frac{g\\cdot h}{2}$"], ["g", "$\\frac{g+h}{2}$"]]),
          fehler: [{ wahl: "f", text: "g · h ist die Fläche des Rechtecks, das das Dreieck umschließt. Das Dreieck ist die Hälfte." }, { wahl: "g", text: "Die Fläche ist die Hälfte des Produkts, nicht die Hälfte der Summe." }],
          erklaerung: <T s="Mit Grundseite $g = b$ und Höhe $h = a$ steht genau unser Ergebnis da: $A = \frac{g\cdot h}{2}$." /> },
      ],
      abschlussFormel: { titel: "Flächeninhalt eines Dreiecks", zeilen: ["A = \\frac{g\\cdot h}{2}"] },
    },
    {
      titel: "Der Satz des Pythagoras", kurz: "Beweis",
      intro: "Jetzt wird es spannend. Wir nehmen vier gleiche rechtwinklige Dreiecke mit den Katheten $a$ und $b$ und der Hypotenuse $c$ und bauen damit ein großes Quadrat der Seite $a + b$ – und zwar zweimal, auf zwei verschiedene Arten. Schiebe den Regler und beobachte, was frei bleibt.",
      bild: <BeweisEinsBild />,
      fertig: "Das war der Beweis: Zwei Zerlegungen desselben Quadrats, ein Abziehen von 2ab – und übrig bleibt a² + b² = c².",
      schritte: [
        { id: "y4a", titel: "Ein Dreieck", typ: "zahl", frage: <T s="Die vier Dreiecke haben die Katheten $a=3$ und $b=4$. Wie groß ist die Fläche eines Dreiecks?" />, text: "Fläche:", wert: 6, breite: 96,
          hinweise: ["Rechtwinkliges Dreieck: halbes Rechteck aus Phase 2."],
          fehler: [{ wert: 12, text: "12 ist das ganze Rechteck 3 · 4. Das Dreieck ist die Hälfte." }, { wert: 7, text: "7 ist 3 + 4. Für die Fläche wird multipliziert und halbiert." }],
          erklaerung: <T s="$\frac{a\cdot b}{2} = \frac{3\cdot 4}{2} = 6$." /> },
        { id: "y4b", titel: "Alle vier Dreiecke", typ: "zahl", frage: "Wie groß ist die Fläche aller vier Dreiecke zusammen?", text: "Fläche:", wert: 24, breite: 96,
          hinweise: ["Vier gleiche Dreiecke mit je 6.", "4 · 6 = ?"],
          fehler: [{ wert: 6, text: "6 ist ein einzelnes Dreieck. Im großen Quadrat liegen vier davon." }, { wert: 12, text: "12 sind erst zwei Dreiecke." }, { wert: 48, text: "48 entsteht, wenn man 4 · 12 rechnet – dabei wurde die Halbierung vergessen. Ein Dreieck hat nur 6." }],
          erklaerung: <T s="$4\cdot 6 = 24$. Allgemein: $4\cdot\frac{ab}{2} = 2ab$." /> },
        { id: "y4c", titel: "Das große Quadrat", typ: "zahl", frage: <T s="Das große Quadrat hat die Seitenlänge $a + b = 7$. Wie groß ist seine Fläche?" />, text: "Fläche:", wert: 49, breite: 96,
          hinweise: ["Fläche eines Quadrats: Seite mal Seite."],
          fehler: [{ wert: 25, text: "25 ist 3² + 4². Das große Quadrat hat aber die Seite 3 + 4 = 7, und (3 + 4)² ist nicht 3² + 4² – das kennst du von der binomischen Formel." }, { wert: 14, text: "14 ist 7 + 7. Die Fläche ist 7 · 7." }],
          erklaerung: <T s="$(a+b)^2 = 7^2 = 49$." /> },
        { id: "y4d", titel: "Zerlegung 1", typ: "wahl", frage: "Zerlegung 1: Im Quadrat der Seite a + b liegen vier Dreiecke und in der Mitte das schräge Quadrat c². Wie groß ist das große Quadrat insgesamt?", richtig: "r",
          optionen: opt([["f", "$c^2 + 4ab$"], ["r", "$c^2 + 2ab$"], ["g", "$c^2 + ab$"], ["h", "$c^2$"]]),
          fehler: [{ wahl: "f", text: "Vier Dreiecke mit je ab/2 ergeben zusammen 4 · ab/2 = 2ab, nicht 4ab." }, { wahl: "g", text: "Das wäre ein einziges Rechteck ab oder zwei Dreiecke. Es liegen aber vier Dreiecke im Quadrat." }, { wahl: "h", text: "Das schräge Quadrat füllt nur die Mitte. Die vier Dreiecke gehören noch dazu." }],
          hinweise: ["Fläche der Mitte plus Fläche der vier Dreiecke – die kennst du aus dem vorigen Schritt."],
          erklaerung: <T s="$(a+b)^2 = c^2 + 4\cdot\frac{ab}{2} = c^2 + 2ab$." /> },
        { id: "y4e", titel: "Zerlegung 2", typ: "wahl", frage: "Zerlegung 2: Dieselben vier Dreiecke liegen jetzt so, dass die beiden Quadrate a² und b² frei bleiben. Wie groß ist das große Quadrat insgesamt?", richtig: "r",
          optionen: opt([["f", "$a^2 + b^2$"], ["r", "$a^2 + b^2 + 2ab$"], ["g", "$a^2 + b^2 + 4ab$"], ["h", "$a^2 + b^2 + ab$"]]),
          fehler: [{ wahl: "f", text: "Die vier Dreiecke gehören dazu. Sie füllen den restlichen Platz im Quadrat." }, { wahl: "g", text: "Vier Dreiecke haben zusammen 2ab, nicht 4ab." }, { wahl: "h", text: "Vier Dreiecke haben zusammen 2ab (zwei Rechtecke ab), nicht nur ab." }],
          erklaerung: <T s="$(a+b)^2 = a^2 + b^2 + 4\cdot\frac{ab}{2} = a^2 + 2ab + b^2$ – genau die erste binomische Formel." /> },
        { id: "y4f", titel: "Abziehen", typ: "wahl", frage: <T s="Beide Zerlegungen füllen dasselbe Quadrat, also gilt $c^2 + 2ab = a^2 + 2ab + b^2$. Was bleibt, wenn du auf beiden Seiten $2ab$ abziehst?" />, richtig: "r",
          optionen: opt([["f", "$c = a + b$"], ["r", "$c^2 = a^2 + b^2$"], ["g", "$c^2 = a^2 + b^2 + 2ab$"], ["h", "$c^2 = a^2 - b^2$"]]),
          fehler: [{ wahl: "f", text: "Aus c² = a² + b² folgt nicht c = a + b. Probe mit 3, 4 und 5: 3 + 4 = 7, aber c = 5. Der direkte Weg c ist kürzer als der Umweg a + b." }, { wahl: "g", text: "Das 2ab steht auf beiden Seiten und fällt weg – es wird nicht auf die rechte Seite verschoben." }, { wahl: "h", text: "Vorzeichen: Auf der rechten Seite steht ein Plus, kein Minus." }],
          erklaerung: <T s="$c^2 + 2ab - 2ab = a^2 + 2ab + b^2 - 2ab$, also $c^2 = a^2 + b^2$." /> },
        { id: "y4g", titel: "Probe mit Zahlen", typ: "zahl", frage: <T s="Ein rechtwinkliges Dreieck hat die Katheten $a=3$ und $b=4$. Wie lang ist die Hypotenuse $c$?" />, text: "c =", wert: 5, breite: 96,
          hinweise: ["Erst c² = 3² + 4² ausrechnen.", "Welche Zahl mit sich selbst multipliziert ergibt 25?"],
          fehler: [{ wert: 7, text: "7 ist 3 + 4. Der Satz verbindet die Quadrate: c² = 3² + 4²." }, { wert: 25, text: "25 ist c², nicht c. Ziehe noch die Wurzel." }],
          erklaerung: <T s="$c^2 = 3^2 + 4^2 = 9 + 16 = 25$, also $c = \sqrt{25} = 5$." /> },
      ],
      abschlussFormel: {
        titel: "Dein Beweis in Kurzform",
        zeilen: ["(a+b)^2 = c^2 + 4\\cdot\\frac{ab}{2} = c^2 + 2ab", "(a+b)^2 = a^2 + b^2 + 4\\cdot\\frac{ab}{2} = a^2 + 2ab + b^2", "c^2 + 2ab = a^2 + 2ab + b^2 \\;\\Rightarrow\\; a^2 + b^2 = c^2"],
      },
      abschlussSatz: true,
    },
    {
      titel: "Ein zweiter Beweis – das Quadrat in der Mitte", kurz: "Zweiter Beweis",
      intro: "Es geht auch andersherum: Jetzt ist das Quadrat der Seite $c$ das große Äußere, und die vier Dreiecke sind nach innen geklappt. In der Mitte bleibt ein kleines Quadrat, dessen Seite der Unterschied der beiden Katheten ist: $b - a$ (oder $a - b$, je nachdem was größer ist).",
      bild: <BeweisZweiBild />,
      fertig: "Zwei ganz verschiedene Bilder, dasselbe Ergebnis: a² + b² = c². Wenn Mathematik stimmt, führen viele Wege zum selben Ziel.",
      schritte: [
        { id: "y5a", titel: "Das innere Quadrat", typ: "zahl", frage: <T s="Stelle $a=2$ und $b=5$ ein. Wie lang ist die Seite des kleinen Quadrats in der Mitte?" />, text: "Seitenlänge:", wert: 3, breite: 96,
          hinweise: ["Die längere Kathete b ragt über die kürzere Kathete a hinaus – dieses Stück ist eine Seite des Quadrats.", "5 − 2 = ?"],
          fehler: [{ wert: 7, text: "7 ist a + b – so lang war die Seite des großen Quadrats im ersten Beweis. Hier ist es der Unterschied." }, { wert: 10, text: "10 ist a · b, ein Flächenmaß. Gefragt ist eine Länge." }],
          erklaerung: <T s="Die Seite ist $b - a = 5 - 2 = 3$." /> },
        { id: "y5b", titel: "Seine Fläche", typ: "zahl", frage: "Wie groß ist die Fläche des kleinen Quadrats in der Mitte?", text: "Fläche:", wert: 9, breite: 96,
          hinweise: ["Seite mal Seite."],
          fehler: [{ wert: 3, text: "3 ist die Seitenlänge. Die Fläche ist 3 · 3." }, { wert: 21, text: "21 ist b² − a² (25 − 4). Das Quadrat in der Mitte hat aber die Fläche (b − a)² – erst die Differenz bilden, dann quadrieren." }],
          erklaerung: <T s="$(b-a)^2 = 3^2 = 9$." /> },
        { id: "y5c", titel: "Alle vier Dreiecke", typ: "zahl", frage: <T s="Die Dreiecke haben die Katheten $2$ und $5$. Wie groß ist die Fläche aller vier Dreiecke zusammen?" />, text: "Fläche:", wert: 20, breite: 96,
          hinweise: ["Ein Dreieck: 2 · 5 : 2 = 5.", "Vier Dreiecke: 4 · 5."],
          fehler: [{ wert: 5, text: "5 ist ein einzelnes Dreieck. Es gibt vier." }, { wert: 10, text: "10 ist das Rechteck 2 · 5 oder zwei Dreiecke. Es liegen vier Dreiecke im Quadrat." }, { wert: 40, text: "40 entsteht, wenn man die Halbierung vergisst: vier Rechtecke 2 · 5." }],
          erklaerung: <T s="$4\cdot\frac{2\cdot 5}{2} = 20$." /> },
        { id: "y5d", titel: "Das große Quadrat", typ: "zahl", frage: <T s="Das äußere Quadrat besteht aus den vier Dreiecken und dem kleinen Quadrat in der Mitte. Wie groß ist seine Fläche $c^2$?" />, text: "c² =", wert: 29, breite: 96,
          hinweise: ["Vier Dreiecke: 20. Quadrat in der Mitte: 9.", "20 + 9 = ?"],
          fehler: [{ wert: 49, text: "49 ist (a + b)² – das große Quadrat aus dem ersten Beweis. Hier besteht das Außenquadrat nur aus Dreiecken und dem kleinen Quadrat in der Mitte." }, { wert: 23, text: "23 ist 20 + 3. Die Mitte hat die Fläche 3² = 9, nicht 3." }, { wert: 20, text: "20 sind nur die vier Dreiecke. Das Quadrat in der Mitte gehört dazu." }],
          erklaerung: <T s="$c^2 = 20 + 9 = 29$. Das ist übrigens genau $2^2 + 5^2 = 4 + 25$ – der Satz stimmt, obwohl $c = \sqrt{29}$ keine ganze Zahl ist." /> },
        { id: "y5e", titel: "Allgemein ausmultiplizieren", typ: "wahl", frage: <T s="Allgemein gilt $c^2 = 2ab + (b-a)^2$. Wie lautet $(b-a)^2$ ausmultipliziert?" />, richtig: "r",
          optionen: opt([["f", "$a^2 - b^2$"], ["g", "$a^2 + b^2$"], ["r", "$a^2 - 2ab + b^2$"], ["h", "$a^2 + 2ab + b^2$"]]),
          fehler: [{ wahl: "f", text: "(b − a)² ist nicht b² − a². Das Quadrat einer Differenz hat drei Summanden, mit dem Mittelterm −2ab." }, { wahl: "g", text: "Der Mittelterm fehlt. Prüfe mit b = 5 und a = 2: (5 − 2)² = 9, aber 4 + 25 = 29." }, { wahl: "h", text: "Bei der Differenz steht in der Mitte ein Minus: −2ab. Prüfe mit b = 5, a = 2: 4 + 20 + 25 = 49 ≠ 9." }],
          erklaerung: <T s="Zweite binomische Formel: $(b-a)^2 = b^2 - 2ab + a^2$." /> },
        { id: "y5f", titel: "Einsetzen", typ: "wahl", frage: <T s="Setze ein: $c^2 = 2ab + a^2 - 2ab + b^2 = \ldots$" />, richtig: "r",
          optionen: opt([["f", "$a^2 + 4ab + b^2$"], ["g", "$a^2 - b^2$"], ["r", "$a^2 + b^2$"], ["h", "$a^2 + b^2 - 2ab$"]]),
          fehler: [{ wahl: "f", text: "Das Minus vor 2ab hebt das Plus von 2ab auf – die beiden verdoppeln sich nicht." }, { wahl: "g", text: "Das Plus vor b² bleibt ein Plus." }, { wahl: "h", text: "Das ist der Term in der Klammer (b − a)². Vorne steht noch +2ab, und das hebt −2ab auf." }],
          erklaerung: <T s="$2ab$ und $-2ab$ heben sich auf. Übrig bleibt $c^2 = a^2 + b^2$ – derselbe Satz wie im ersten Beweis." /> },
        { id: "y5g", titel: "Was zeigt der Beweis?", typ: "wahl", frage: "Welche Aussage über den zweiten Beweis stimmt?", richtig: "r",
          optionen: [["r", "Er liefert dieselbe Gleichung a² + b² = c² auf einem anderen Weg"], ["f", "Er funktioniert nur, wenn b größer als a ist"], ["g", "Er funktioniert nur für ganzzahlige Seiten"]],
          fehler: [{ wahl: "f", text: "Ist a größer als b, spielt nur (a − b)² statt (b − a)² mit – und beide sind gleich. Bei a = b schrumpft das innere Quadrat zu einem Punkt und die Rechnung stimmt trotzdem." }, { wahl: "g", text: "Die Rechnung benutzt nur Flächen und eine binomische Formel, keine bestimmten Zahlen. Auch für c = √29 gilt der Satz." }],
          erklaerung: "Zwei verschiedene Bilder, zwei verschiedene Rechnungen – am Ende steht dieselbe Gleichung. Das macht den Satz so sicher." },
      ],
      abschlussFormel: { titel: "Zweiter Beweis in Kurzform", zeilen: ["c^2 = 4\\cdot\\frac{ab}{2} + (b-a)^2 = 2ab + a^2 - 2ab + b^2 = a^2 + b^2"] },
    },
    {
      titel: "Den Satz anwenden", kurz: "Anwenden",
      intro: "Jetzt gehört der Satz dir: Hypotenuse berechnen, Kathete berechnen und prüfen, ob ein Dreieck rechtwinklig ist. Das Bild zeigt den Satz als drei Quadrate über den Seiten.",
      bild: <QuadrateBild />,
      fertig: "Du kannst den Satz des Pythagoras nicht nur anwenden, sondern auch auf zwei Wegen beweisen. Das ist der Unterschied zwischen Auswendiglernen und Verstehen.",
      schritte: [
        { id: "y6a", titel: "Hypotenuse berechnen", typ: "zahl", frage: <T s={"Ein rechtwinkliges Dreieck hat die Katheten $a=" + ta + "$ und $b=" + tb + "$. Wie lang ist die Hypotenuse $c$?"} />, text: "c =", wert: tc, breite: 96,
          hinweise: ["Erst c² = a² + b² ausrechnen, dann die Wurzel ziehen.", `c² = ${ta}² + ${tb}² = ${ta * ta} + ${tb * tb}`],
          fehler: [{ wert: ta + tb, text: `${ta + tb} ist ${ta} + ${tb}. Der Satz verbindet die Quadrate: c² = a² + b² – der direkte Weg c ist kürzer als der Umweg a + b.` }, { wert: ta * ta + tb * tb, text: `${ta * ta + tb * tb} ist c², nicht c. Ziehe noch die Wurzel.` }],
          erklaerung: <T s={"$c^2 = " + ta + "^2 + " + tb + "^2 = " + ta * ta + " + " + tb * tb + " = " + tc * tc + "$, also $c = " + tc + "$."} /> },
        { id: "y6b", titel: "Kathete berechnen", typ: "zahl", frage: <T s={"Die Hypotenuse ist $c=" + tz + "$, eine Kathete ist $a=" + tx + "$. Wie lang ist die andere Kathete $b$?"} />, text: "b =", wert: ty, breite: 96,
          hinweise: ["Stelle den Satz um: b² = c² − a².", `b² = ${tz}² − ${tx}² = ${tz * tz} − ${tx * tx}`],
          fehler: [{ wert: tz - tx, text: `${tz - tx} ist ${tz} − ${tx}. Es werden die Quadrate abgezogen, nicht die Seiten: b² = c² − a².` }, { wert: tz * tz - tx * tx, text: `${tz * tz - tx * tx} ist b², nicht b. Ziehe noch die Wurzel.` }],
          erklaerung: <T s={"$b^2 = c^2 - a^2 = " + tz + "^2 - " + tx + "^2 = " + tz * tz + " - " + tx * tx + " = " + ty * ty + "$, also $b = " + ty + "$."} /> },
        { id: "y6c", titel: "Ist es rechtwinklig?", typ: "wahl", frage: "Ein Dreieck hat die Seitenlängen 5, 7 und 9. Ist es rechtwinklig? Prüfe mit dem Satz – die längste Seite spielt die Rolle von c.", richtig: "r",
          optionen: [["r", "Nein, denn 5² + 7² = 74, aber 9² = 81"], ["f", "Ja, denn 5 + 7 ist größer als 9"], ["g", "Ja, denn 9 ist die längste Seite"], ["h", "Nein, denn 5 + 7 = 12 und nicht 9"]],
          fehler: [{ wahl: "f", text: "5 + 7 > 9 sagt nur, dass es ein Dreieck gibt. Für einen rechten Winkel muss a² + b² = c² gelten." }, { wahl: "g", text: "Jedes Dreieck hat eine längste Seite. Entscheidend ist, ob die Quadrate der beiden kürzeren Seiten zusammen das Quadrat der längsten ergeben." }, { wahl: "h", text: "Die Summe der Seiten spielt keine Rolle. Verglichen werden die Quadrate: 5² + 7² gegen 9²." }],
          erklaerung: "5² + 7² = 25 + 49 = 74, aber 9² = 81. Die Gleichung stimmt nicht, also ist der Winkel nicht 90°. Umgekehrt gilt auch: Passt die Gleichung, ist der Winkel genau 90°." },
      ],
      abschluss: true,
    },
  ];
}

/* ---------- Das Modul ---------- */
export function PythagorasModul({ onZurueck }) {
  const N = PYTHAGORAS_PHASEN_ANZAHL;
  const zuf = useMemo(() => {
    const t1 = zufallsTripel();
    let t2 = zufallsTripel();
    while (t2[2] === t1[2]) t2 = zufallsTripel();
    return { t1, t2 };
  }, []);
  const phasen = useMemo(() => bauePhasen(zuf), [zuf]);
  const [stand, setStandLok] = useState(() => modulStand(ID).stand.slice());
  const fertigePhase = (k) => stand[k] >= phasen[k].schritte.length;
  const ersteOffene = (() => { const i = phasen.findIndex((_, k) => !fertigePhase(k)); return i < 0 ? N - 1 : i; })();
  const alleFertig = phasen.every((_, k) => fertigePhase(k));
  const [phase, setPhase] = useState(() => Math.min(modulStand(ID).phase || 0, N - 1));
  const [bestaetige, setBestaetige] = useState(false);
  const aktuell = Math.min(phase, Math.max(ersteOffene, 0));

  useEffect(() => { springe("entdecken-phasen", () => window.scrollTo(0, 0)); }, [aktuell]);
  useEffect(() => { if (alleFertig && !modulStand(ID).fertig) modulFertigSetzen(ID, true); }, [alleFertig]);

  const gehePhase = (k) => { setPhase(k); modulPhaseSetzen(ID, k); setBestaetige(false); };
  const setterFuer = (k) => (f) => {
    const neu = typeof f === "function" ? f(stand[k]) : f;
    if (neu > stand[k]) {
      modulStandSetzen(ID, k, neu);
      setStandLok((s) => { const c = s.slice(); c[k] = Math.max(c[k], neu); return c; });
    }
  };

  const p = phasen[aktuell];
  const fertigDiese = fertigePhase(aktuell);
  const gesamt = phasen.reduce((s, ph, k) => s + Math.min(stand[k], ph.schritte.length), 0);
  const anzahlSchritte = phasen.reduce((s, ph) => s + ph.schritte.length, 0);

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 22 }}>
      <button type="button" onClick={onZurueck}
        style={{ fontFamily: "inherit", cursor: "pointer", background: "none", border: "none", padding: "6px 0", marginBottom: 10, fontSize: 13.5, fontWeight: 600, color: C.see }}>
        ← Mathe entdecken
      </button>
      <h2 style={{ fontSize: "clamp(20px, 6.2vw, 25px)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, color: C.tinte, marginBottom: 6 }}>
        Entdecke den Satz des Pythagoras – vom Rechteck zum Beweis
      </h2>
      <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, marginBottom: 14 }}>
        Sechs Phasen, ein Gedankengang. Du schiebst und drehst die Bilder selbst, rechnest mit und bekommst bei Bedarf schrittweise Hilfe.
      </p>

      {/* Phasenleiste */}
      <div role="tablist" aria-label="Phasen" style={{ display: "grid", gridTemplateColumns: `repeat(${N}, minmax(0, 1fr))`, gap: 6 }}>
        {phasen.map((ph, k) => {
          const an = k === aktuell, ok = fertigePhase(k), offen = k <= ersteOffene;
          return (
            <button key={k} type="button" role="tab" aria-selected={an} aria-label={`Phase ${k + 1}: ${ph.titel}${ok ? " (abgeschlossen)" : ""}`} disabled={!offen}
              onClick={() => gehePhase(k)}
              style={{ height: 40, borderRadius: 10, fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: offen ? "pointer" : "default",
                border: `1.5px solid ${an ? C.see : ok ? "#0F7A4D" : C.linie}`, background: an ? C.see : ok ? "#E6F6EF" : C.weiss,
                color: an ? C.weiss : ok ? "#0F7A4D" : offen ? C.see : C.hellgrau, opacity: offen ? 1 : 0.6 }}>
              {ok && !an ? "✓" : k + 1}
            </button>
          );
        })}
      </div>
      <div aria-hidden="true" style={{ height: 5, borderRadius: 3, background: C.linie, marginTop: 10, overflow: "hidden" }}>
        <div style={{ width: `${(gesamt / anzahlSchritte) * 100}%`, height: "100%", background: `linear-gradient(90deg, ${C.see}, ${C.gruen})`, transition: "width .3s ease" }} />
      </div>

      {/* Aktuelle Phase */}
      <div style={{ marginTop: 22 }}>
        <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.gruenDunkel, marginBottom: 6 }}>Phase {aktuell + 1} von {N}</p>
        <h3 style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.25, color: C.tinte, marginBottom: 12 }}>{p.titel}</h3>
        <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.8, margin: 0 }}><T s={p.intro} /></p>
        {p.bild}

        <div style={{ ...karte, marginTop: 18 }}>
          <SchrittFolge key={aktuell} schritte={p.schritte} stand={stand[aktuell]} setStand={setterFuer(aktuell)} fertigText={p.fertig} />
        </div>

        {fertigDiese && p.abschlussFormel && <div style={{ marginTop: 6 }}><Formel titel={p.abschlussFormel.titel} zeilen={p.abschlussFormel.zeilen} /></div>}
        {fertigDiese && p.abschlussSatz && (
          <div style={{ ...karte, marginTop: 14, borderLeft: `4px solid ${C.flaggold}` }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, margin: 0 }}>Das hast du selbst bewiesen:</p>
            <SatzAnzeige />
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          {aktuell > 0 && <div style={{ flex: "0 0 38%" }}><GrosserKnopf ghost onClick={() => gehePhase(aktuell - 1)}>← Zurück</GrosserKnopf></div>}
          {fertigDiese && aktuell < N - 1 && (
            <div style={{ flex: 1 }}><GrosserKnopf onClick={() => gehePhase(aktuell + 1)}>Weiter zu Phase {aktuell + 2} →</GrosserKnopf></div>
          )}
        </div>

        {alleFertig && aktuell === N - 1 && (
          <div style={{ ...karte, marginTop: 20, background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`, color: C.weiss }}>
            <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.flaggold, margin: "0 0 6px" }}>Modul abgeschlossen</p>
            <p style={{ fontSize: 17, fontWeight: 700, margin: "0 0 4px", lineHeight: 1.3 }}>Du hast den Satz des Pythagoras entdeckt.</p>
            <p style={{ fontSize: 14, fontWeight: 300, lineHeight: 1.65, margin: "0 0 4px", color: "#C9D6EE" }}>
              Vom Rechteck über das Dreieck bis zu zwei eigenen Beweisen – und am Ende steht ein Satz, den du selbst begründen kannst.
            </p>
            <SatzAnzeige hell />
            <GrosserKnopf gold onClick={onZurueck}>Zurück zu Mathe entdecken</GrosserKnopf>
          </div>
        )}

        {gesamt > 0 && (
          <div style={{ marginTop: 22, textAlign: "center" }}>
            {!bestaetige
              ? <KleinerLink onClick={() => setBestaetige(true)}>Modul von vorn beginnen</KleinerLink>
              : (
                <Rueck art="warn">
                  Dein Fortschritt in diesem Modul wird gelöscht.
                  <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                    <div style={{ flex: 1 }}><GrosserKnopf ghost onClick={() => setBestaetige(false)}>Abbrechen</GrosserKnopf></div>
                    <div style={{ flex: 1 }}><GrosserKnopf onClick={() => { modulZuruecksetzen(ID); setStandLok(Array(N).fill(0)); setPhase(0); setBestaetige(false); springe("entdecken-phasen", () => window.scrollTo(0, 0)); }}>Ja, neu beginnen</GrosserKnopf></div>
                  </div>
                </Rueck>
              )}
          </div>
        )}
      </div>
    </div>
  );
}

export const PYTHAGORAS_PHASEN = ["Der Flächeninhalt eines Rechtecks", "Das rechtwinklige Dreieck – das halbe Rechteck", "Jedes Dreieck: zwei rechtwinklige Dreiecke", "Der Satz des Pythagoras", "Ein zweiter Beweis – das Quadrat in der Mitte", "Den Satz anwenden"];
