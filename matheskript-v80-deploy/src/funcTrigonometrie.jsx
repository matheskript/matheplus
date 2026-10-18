/* ============================================================
   Mittelstufe · Trigonometrie – vom Einheitskreis bis zum Kosinussatz
   Ein Lernweg in sechs Kapiteln, jedes mit Erklärvideo (Motion),
   interaktiver Darstellung und Übungen:
     1 Einheitskreis        – Definition sin α = y, cos α = x von P
     2 Grad und Bogenmaß    – zwei Namen für dieselbe Drehung, DEG/RAD
     3 Rechtwinkliges Dreieck – Einheitskreis-Dreieck mit c gestreckt,
                              Verhältnisse, Seiten, Winkel, Sachaufgaben
     4 Tangens              – Tangente bei (1|0), tan = sin/cos, Steigung
     5 Sinus- und Kosinussatz – Herleitung über die Höhe, SWS/SSS/WSW/SsW
     6 Alles gemischt
   Alle Rechen-Schritte nehmen Zahl ODER Rechnung (Trig-Rechner mit
   eigenem Tastenfeld, DEG/RAD wie beim Taschenrechner). Steht der Rechner
   auf RAD, erkennt die Rückmeldung den Bogenmaß-Fehler.
   Das Abitur-Werkzeug zur Sinusfunktion a · sin(b(x − c)) + d ist davon
   unabhängig (funcSinusUebung.jsx).
   Bezeichnungen im Dreieck: Ecken A, B, C; Seite a gegenüber A usw.;
   Winkel α bei A, β bei B, γ bei C. Rechtwinklig: γ = 90°.
   Reine Mathematik und Generatoren: trigMittel.js (getestet).
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useEffect, useRef, useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { Auswahl, MS, hilfeKontext, karte, kicker, zw } from "./ui2.jsx";
import { wahl } from "./rechnen2.js";
import { Aufklapp, Seite, zt } from "./ui3.jsx";
import { Merke, Pille, Regler, UebenRahmen, WertZeile, misch, tolRund, ws, zs } from "./geoUi.jsx";
import { TrigFeld, TrigRechnerKarte, WinkelSchalter, trigLies } from "./funcTrigRechner.jsx";
import { COS, HYP, SIN, TAN, TrigFilm } from "./funcTrigAnimationen.jsx";
import { springe } from "./sprung.js";
import {
  BM_ARTEN, EK_ARTEN, SACHEN, TAN_ARTEN, acosG, asinG, atanG, bmAufgabe, cosG, ekAufgabe, piBruch, piTex,
  quadrant, sachAufgabe, sinG, tanAufgabe, tanG, verhaeltnisAufgabe,
} from "./trigMittel.js";

let zaehler = 0;
const RAD = Math.PI / 180;
const r1 = (v) => Math.round(v * 10) / 10;
const z2 = (v) => zt(v, 2);
const grad = (v, st = 1) => `${zt(v, st)}°`;
const tex = (v, st = 2) => String(zt(v, st)).replace(",", "{,}");
const T = { fontFamily: "Montserrat, system-ui, sans-serif", fontWeight: 700 };
const ROEM = ["", "I", "II", "III", "IV"];

/* Zahl-Schritt mit Trig-Rechner: Zahl oder Rechnung wie „7,5 · sin(35)“ */
const zr = (...a) => ({ ...zs(...a), feld: TrigFeld, lies: trigLies });
const radFehler = (wert, tol = 0.02) => ({ wert, toleranz: tol, text: zw("Dein Rechner steht auf RAD (Bogenmaß). Für Winkel in Grad stell den Rechner auf DEG um.", "Your calculator is set to RAD (radians). For angles in degrees switch to DEG.") });

/* ============================================================
   Gemeinsame Bausteine
   ============================================================ */

/* Dreiecksskizze: A, B, C (Einheiten, y nach oben). beschr: { a, b, c, al, be, ga } (Text, "?" oder null). */
function Dreieck({ A, B, Cc, beschr = {}, farben = {}, recht = false, hoehe = 220, winkelBogen = ["al"], namen = ["A", "B", "C"] }) {
  const pts = [A, B, Cc];
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const W = 340, rand = 34;
  const br = Math.max(...xs) - Math.min(...xs), ho = Math.max(...ys) - Math.min(...ys);
  const s = Math.min((W - 2 * rand) / br, (hoehe - 2 * rand) / Math.max(ho, 0.3));
  const ox = rand - Math.min(...xs) * s + ((W - 2 * rand) - br * s) / 2;
  const oy = hoehe - rand + Math.min(...ys) * s - ((hoehe - 2 * rand) - ho * s) / 2;
  const P = (p) => [ox + p[0] * s, oy - p[1] * s];
  const [pa, pb, pc] = [P(A), P(B), P(Cc)];
  const mitte = [(pa[0] + pb[0] + pc[0]) / 3, (pa[1] + pb[1] + pc[1]) / 3];
  const seite = (p, q, text, farbe) => {
    const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
    const dx = mx - mitte[0], dy = my - mitte[1], l = Math.hypot(dx, dy) || 1;
    const tb = text == null ? 0 : String(text).length * 7.2;
    const ab = 14 + Math.abs(dx / l) * tb / 2;
    const lx = Math.max(tb / 2 + 4, Math.min(W - tb / 2 - 4, mx + (dx / l) * ab)), ly = my + (dy / l) * ab;
    return (
      <g>
        <line x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke={farbe || C.tinte} strokeWidth={farbe ? 3.4 : 2} strokeLinecap="round" />
        {text != null && (text === "?"
          ? <><rect x={lx - 11} y={ly - 10} width="22" height="19" rx="9.5" fill={C.flaggold} /><text x={lx} y={ly + 4.5} textAnchor="middle" style={{ ...T, fontSize: 12, fill: C.seeTief }}>?</text></>
          : <text x={lx} y={ly + 4.5} textAnchor="middle" style={{ ...T, fontSize: 12.5, fill: farbe || C.tinte }}>{text}</text>)}
      </g>
    );
  };
  const bogen = (e, u, v, text, farbe = C.see) => {
    const w1 = Math.atan2(u[1] - e[1], u[0] - e[0]), w2 = Math.atan2(v[1] - e[1], v[0] - e[0]);
    let d = w2 - w1; while (d <= -Math.PI) d += 2 * Math.PI; while (d > Math.PI) d -= 2 * Math.PI;
    const r = 24, p1 = [e[0] + r * Math.cos(w1), e[1] + r * Math.sin(w1)], p2 = [e[0] + r * Math.cos(w1 + d), e[1] + r * Math.sin(w1 + d)];
    const wm = w1 + d / 2, tx = e[0] + 40 * Math.cos(wm), ty = e[1] + 40 * Math.sin(wm);
    return (
      <g>
        <path d={`M${p1[0]} ${p1[1]} A${r} ${r} 0 0 ${d > 0 ? 1 : 0} ${p2[0]} ${p2[1]}`} fill="none" stroke={farbe} strokeWidth="2" />
        {text != null && (text === "?"
          ? <><rect x={tx - 11} y={ty - 10} width="22" height="19" rx="9.5" fill={C.flaggold} /><text x={tx} y={ty + 4.5} textAnchor="middle" style={{ ...T, fontSize: 12, fill: C.seeTief }}>?</text></>
          : <text x={tx} y={ty + 4.5} textAnchor="middle" style={{ ...T, fontSize: 12, fill: farbe }}>{text}</text>)}
      </g>
    );
  };
  const ecke = (p, n) => {
    if (!n) return null;
    const dx = p[0] - mitte[0], dy = p[1] - mitte[1], l = Math.hypot(dx, dy) || 1;
    return <text x={p[0] + (dx / l) * 15} y={p[1] + (dy / l) * 15 + 5} textAnchor="middle" style={{ ...T, fontSize: 14, fill: C.tinte }}>{n}</text>;
  };
  let rechter = null;
  if (recht) {
    const u = [pa[0] - pc[0], pa[1] - pc[1]], v = [pb[0] - pc[0], pb[1] - pc[1]];
    const lu = Math.hypot(...u), lv = Math.hypot(...v), q = 13;
    const e1 = [pc[0] + (u[0] / lu) * q, pc[1] + (u[1] / lu) * q], e2 = [pc[0] + (v[0] / lv) * q, pc[1] + (v[1] / lv) * q];
    rechter = <path d={`M${e1[0]} ${e1[1]} L${e1[0] + e2[0] - pc[0]} ${e1[1] + e2[1] - pc[1]} L${e2[0]} ${e2[1]}`} fill="none" stroke={C.tinte} strokeWidth="1.4" />;
  }
  return (
    <svg viewBox={`0 0 ${W} ${hoehe}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label={zw("Skizze eines Dreiecks", "Sketch of a triangle")}>
      <path d={`M${pa[0]} ${pa[1]} L${pb[0]} ${pb[1]} L${pc[0]} ${pc[1]} Z`} fill={`${C.see}0D`} />
      {seite(pb, pc, beschr.a, farben.a)}
      {seite(pa, pc, beschr.b, farben.b)}
      {seite(pa, pb, beschr.c, farben.c)}
      {rechter}
      {winkelBogen.includes("al") && bogen(pa, pb, pc, beschr.al)}
      {winkelBogen.includes("be") && bogen(pb, pc, pa, beschr.be)}
      {winkelBogen.includes("ga") && bogen(pc, pa, pb, beschr.ga)}
      {ecke(pa, namen[0])}{ecke(pb, namen[1])}{ecke(pc, namen[2])}
    </svg>
  );
}

/* Rechtwinkliges Dreieck: γ = 90° bei C, α bei A. a gegenüber α, b an α, c Hypotenuse */
const rechtEcken = (al, c) => {
  const a = c * sinG(al), b = c * cosG(al);
  return { A: [0, 0], Cc: [b, 0], B: [b, a] };
};

/* Kleiner Einheitskreis für Aufgaben: Winkel al (Grad), optional Punkt-Beschriftung */
function KreisSkizze({ al, zeigeWinkel = true, punktText = "P", xText = null, yText = null, hoehe = 210 }) {
  const W = 340, cx = 170, cy = hoehe / 2, R = Math.min(78, hoehe / 2 - 24);
  const P = [cx + R * Math.cos(al * RAD), cy - R * Math.sin(al * RAD)];
  const am = ((al % 360) + 360) % 360;
  const bogenD = (() => {
    if (am < 0.5) return "";
    const r = 22, e = [cx + r * Math.cos(am * RAD), cy - r * Math.sin(am * RAD)];
    return `M${cx + r} ${cy} A${r} ${r} 0 ${am > 180 ? 1 : 0} 0 ${e[0]} ${e[1]}`;
  })();
  return (
    <svg viewBox={`0 0 ${W} ${hoehe}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label={zw("Einheitskreis", "Unit circle")}>
      <line x1={cx - R - 18} x2={cx + R + 18} y1={cy} y2={cy} stroke={C.hellgrau} />
      <line x1={cx} x2={cx} y1={cy - R - 14} y2={cy + R + 14} stroke={C.hellgrau} />
      {[1, 2, 3, 4].map((q) => (
        <text key={q} x={cx + (q === 1 || q === 4 ? 1 : -1) * (R + 34)} y={cy + (q <= 2 ? -1 : 1) * (R * 0.75) + 4} textAnchor="middle" style={{ ...T, fontSize: 11, fill: C.hellgrau }}>{ROEM[q]}</text>
      ))}
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={HYP} strokeWidth="1.6" opacity="0.7" />
      <line x1={P[0]} y1={cy} x2={P[0]} y2={P[1]} stroke={SIN} strokeWidth="3" />
      <line x1={cx} y1={cy} x2={P[0]} y2={cy} stroke={COS} strokeWidth="3" />
      <line x1={cx} y1={cy} x2={P[0]} y2={P[1]} stroke={HYP} strokeWidth="2.2" />
      {zeigeWinkel && bogenD && <path d={bogenD} fill="none" stroke={C.tinte} strokeWidth="1.4" />}
      {zeigeWinkel && <text x={cx + 30 * Math.cos((am / 2) * RAD) + (am > 200 ? 6 : 0)} y={cy - 30 * Math.sin((am / 2) * RAD) + 4} style={{ ...T, fontSize: 11.5, fill: C.tinte }}>{typeof zeigeWinkel === "string" ? zeigeWinkel : "α"}</text>}
      <circle cx={P[0]} cy={P[1]} r="4.5" fill={C.seeTief} />
      <text x={P[0] + (Math.cos(am * RAD) >= 0 ? 8 : -8)} y={P[1] + (Math.sin(am * RAD) >= 0 ? -8 : 16)} textAnchor={Math.cos(am * RAD) >= 0 ? "start" : "end"} style={{ ...T, fontSize: 12.5, fill: C.seeTief }}>{punktText}</text>
      {xText && <text x={(cx + P[0]) / 2} y={cy + (Math.sin(am * RAD) >= 0 ? 16 : -8)} textAnchor="middle" style={{ ...T, fontSize: 12, fill: COS }}>{xText}</text>}
      {yText && <text x={P[0] + (Math.cos(am * RAD) >= 0 ? 6 : -6)} y={(cy + P[1]) / 2 + 4} textAnchor={Math.cos(am * RAD) >= 0 ? "start" : "end"} style={{ ...T, fontSize: 12, fill: SIN }}>{yText}</text>}
    </svg>
  );
}

/* Kapitelkopf, Herleitung, Übungskopf */
const Leitfrage = ({ nr, children }) => (
  <>
    <p style={{ ...kicker, marginTop: 22 }}>{zw(`Kapitel ${nr} von 6`, `Chapter ${nr} of 6`)}</p>
    <h3 style={{ fontSize: "clamp(20px, 5.6vw, 24px)", fontWeight: 700, color: C.tinte, letterSpacing: "-0.02em", lineHeight: 1.25, margin: "0 0 10px" }}>{children}</h3>
  </>
);
const Absatz = ({ children }) => <p style={{ fontSize: 15, color: C.grau, lineHeight: 1.8, margin: "0 0 12px" }}>{typeof children === "string" ? <MS s={children} /> : children}</p>;
const FormelBlock = ({ t }) => (
  <div style={{ background: C.weiss, border: `1px solid ${C.linie}`, borderRadius: 14, padding: "12px 14px", margin: "4px 0 14px", fontSize: 17, color: C.tinte, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 14 }}>
    {t.map((z, i) => <M key={i} t={z} />)}
  </div>
);
const Aufforderung = ({ children }) => <p style={{ fontSize: 13, color: C.see, fontWeight: 600, margin: "0 0 10px" }}>{children}</p>;
const Trenner = () => <div style={{ height: 1, background: C.linie, margin: "30px 0 26px" }} />;
const UebenKopf = ({ children }) => (
  <>
    <p style={{ fontSize: 13, fontWeight: 600, color: C.gruen, margin: "0 0 4px" }}>{zw("Jetzt selbst üben", "Practise now")}</p>
    <h3 style={{ fontSize: 21, fontWeight: 700, color: C.tinte, margin: "0 0 4px", letterSpacing: "-0.01em" }}>{children}</h3>
  </>
);

function hilfeT(id, extra = {}) {
  return hilfeKontext({
    id, aufgabe: "Trigonometrie Einheitskreis Bogenmaß Sinus Kosinus Tangens Dreieck Winkel Sinussatz Kosinussatz Hypotenuse Kathete",
    verstehen: extra.verstehen || [
      zw("Mach eine Skizze und trage alle gegebenen Größen ein; markiere die gesuchte.", "Make a sketch with all given values; mark the one you want."),
      zw("Gibt es einen rechten Winkel? Dann reichen sin, cos, tan.", "Is there a right angle? Then sin, cos, tan are enough."),
    ],
    ansatz: extra.ansatz || [
      zw("Einheitskreis: cos α ist die x-, sin α die y-Koordinate von P.", "Unit circle: cos α is the x-, sin α the y-coordinate of P."),
      zw("Rechtwinklig: Seiten von deinem Winkel aus benennen (Gegen-, Ankathete, Hypotenuse).", "Right triangle: name the sides from your angle (opposite, adjacent, hypotenuse)."),
      zw("Allgemein: Paar aus Seite und Gegenwinkel bekannt → Sinussatz, sonst Kosinussatz.", "General: a side and its opposite angle known → law of sines, else law of cosines."),
    ],
    regel: extra.regel || [
      "sin α = GK/H · cos α = AK/H · tan α = GK/AK = sin α/cos α",
      zw("Bogenmaß: x = α · π/180°", "Radians: x = α · π/180°"),
      zw("Sinussatz: a/sin α = b/sin β = c/sin γ · Kosinussatz: a² = b² + c² − 2bc · cos α", "Law of sines: a/sin α = b/sin β = c/sin γ · law of cosines: a² = b² + c² − 2bc · cos α"),
    ],
    pruefen: [
      zw("Rechner auf DEG, wenn die Winkel in Grad gegeben sind.", "Calculator on DEG when angles are in degrees."),
      zw("−1 ≤ sin α, cos α ≤ 1. Größere Seite liegt dem größeren Winkel gegenüber.", "−1 ≤ sin α, cos α ≤ 1. The longer side is opposite the larger angle."),
    ],
  });
}

/* ============================================================
   KAPITEL 1 · EINHEITSKREIS
   ============================================================ */
/* π-Bruch als einfacher Text für SVG-Beschriftungen: π, 2π, π/6, 3π/4 */
const piText = ([z, n]) => (z === 0 ? "0" : `${z === 1 ? "" : z}π${n === 1 ? "" : `/${n}`}`);
const BESONDERE = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];

function EinheitskreisLabor() {
  const [al, setAl] = useState(40);
  const [mass, setMass] = useState("grad");
  const [spiegel, setSpiegel] = useState(null);   // null | "sin" | "cos"
  const ref = useRef(null);
  const W = 340, H = 300, cx = 170, cy = 150, R = 108;
  const P = [cx + R * cosG(al), cy - R * sinG(al)];
  const sp = spiegel === "sin" ? (540 - al) % 360 : spiegel === "cos" ? (360 - al) % 360 : null;
  const S = sp == null ? null : [cx + R * cosG(sp), cy - R * sinG(sp)];
  const zieh = (e) => {
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) * (W / r.width) - cx, y = cy - (e.clientY - r.top) * (H / r.height);
    let a = Math.round(Math.atan2(y, x) / RAD);
    if (a < 0) a += 360;
    const nah = BESONDERE.find((b) => Math.abs(b - a) <= 2);
    setAl(nah ?? a);
  };
  const c = cosG(al), s = sinG(al);
  const q = quadrant(al);
  const bogenD = al > 0.5 ? `M${cx + 28} ${cy} A28 28 0 ${al > 180 ? 1 : 0} 0 ${cx + 28 * c} ${cy - 28 * s}` : "";
  const winkelText = mass === "grad" ? `${al}°` : al % 15 === 0 ? piText(piBruch(al)) : `≈ ${zt(al * RAD, 3)}`;
  return (
    <div style={{ ...karte, marginTop: 16 }}>
      <p style={kicker}>{zw("Einheitskreis zum Anfassen", "Hands-on unit circle")}</p>
      <Aufforderung>{zw("Zieh P über den Kreis (oder nimm den Regler) und beobachte die Koordinaten.", "Drag P around the circle (or use the slider) and watch the coordinates.")}</Aufforderung>
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block", touchAction: "pan-y", cursor: "pointer", userSelect: "none" }}
        role="img" aria-label={zw(`Einheitskreis mit α = ${al}°`, `Unit circle with α = ${al}°`)}
        onPointerDown={(e) => { try { e.currentTarget.setPointerCapture(e.pointerId); } catch (x) { /* egal */ } zieh(e); }}
        onPointerMove={(e) => { if (e.buttons) zieh(e); }}>
        <rect x="0" y="0" width={W} height={H} fill={C.sand} rx="14" />
        {[1, 2, 3, 4].map((k) => (
          <text key={k} x={cx + (k === 1 || k === 4 ? 1 : -1) * 132} y={cy + (k <= 2 ? -1 : 1) * 112 + 4} textAnchor="middle" style={{ ...T, fontSize: 12, fill: q === k ? C.see : C.hellgrau }}>{ROEM[k]}</text>
        ))}
        <line x1={cx - R - 20} x2={cx + R + 20} y1={cy} y2={cy} stroke={C.hellgrau} />
        <line x1={cx} x2={cx} y1={cy - R - 20} y2={cy + R + 20} stroke={C.hellgrau} />
        {[-1, 1].map((v) => (
          <g key={v}>
            <text x={cx + v * R + (v > 0 ? 4 : -4)} y={cy + 14} textAnchor={v > 0 ? "start" : "end"} style={{ ...T, fontSize: 10.5, fill: C.grau }}>{v > 0 ? "1" : "−1"}</text>
            <text x={cx + 5} y={cy - v * R + (v > 0 ? -4 : 12)} style={{ ...T, fontSize: 10.5, fill: C.grau }}>{v > 0 ? "1" : "−1"}</text>
          </g>
        ))}
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={HYP} strokeWidth="1.8" opacity="0.7" />
        {S && (
          <g opacity="0.85">
            <line x1={cx} y1={cy} x2={S[0]} y2={S[1]} stroke={C.hellgrau} strokeWidth="1.8" strokeDasharray="5 4" />
            <line x1={P[0]} y1={spiegel === "sin" ? P[1] : P[1]} x2={S[0]} y2={S[1]} stroke={spiegel === "sin" ? SIN : COS} strokeWidth="1.3" strokeDasharray="2 4" />
            <circle cx={S[0]} cy={S[1]} r="5.5" fill={C.weiss} stroke={C.seeTief} strokeWidth="2" />
            <text x={S[0] + (S[0] >= cx ? 9 : -9)} y={S[1] + (S[1] <= cy ? -9 : 17)} textAnchor={S[0] >= cx ? "start" : "end"} style={{ ...T, fontSize: 12, fill: C.seeTief }}>{`${sp}°`}</text>
          </g>
        )}
        <line x1={cx} y1={cy} x2={P[0]} y2={cy} stroke={COS} strokeWidth="5" strokeLinecap="round" />
        <line x1={P[0]} y1={cy} x2={P[0]} y2={P[1]} stroke={SIN} strokeWidth="5" strokeLinecap="round" />
        <line x1={cx} y1={cy} x2={P[0]} y2={P[1]} stroke={HYP} strokeWidth="2.6" strokeLinecap="round" />
        {bogenD && <path d={bogenD} fill={`${C.flaggold}30`} stroke={C.tinte} strokeWidth="1.4" />}
        <circle cx={P[0]} cy={P[1]} r="14" fill={`${C.see}1F`} />
        <circle cx={P[0]} cy={P[1]} r="7" fill={C.seeTief} />
        <text x={P[0] + (c >= 0 ? 12 : -12)} y={P[1] + (s >= 0 ? -10 : 20)} textAnchor={c >= 0 ? "start" : "end"} style={{ ...T, fontSize: 13, fill: C.seeTief }}>P</text>
        {Math.abs(c) > 0.2 && <text x={(cx + P[0]) / 2} y={cy + (s >= 0 ? 17 : -9)} textAnchor="middle" style={{ ...T, fontSize: 12, fill: COS }}>cos α</text>}
        {Math.abs(s) > 0.2 && <text x={P[0] + (c >= 0 ? 7 : -7)} y={(cy + P[1]) / 2 + 4} textAnchor={c >= 0 ? "start" : "end"} style={{ ...T, fontSize: 12, fill: SIN }}>sin α</text>}
        <text x="12" y="22" style={{ ...T, fontSize: 13, fill: C.tinte }}>{mass === "grad" ? "α" : "x"} = {winkelText}</text>
      </svg>
      <div style={{ marginTop: 10 }}>
        <Regler name="α" wert={al} setWert={(v) => setAl(Math.round(v))} min={0} max={360} schritt={1} format={(v) => `${Math.round(v)}°`} breiteName={20} />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
        {BESONDERE.map((b) => <Pille key={b} an={al === b} onClick={() => setAl(b)}>{b}°</Pille>)}
      </div>
      <div style={{ marginTop: 12 }}>
        <WertZeile links={<span>P = (cos α | sin α)</span>} rechts={`(${zt(c, 3)} | ${zt(s, 3)})`} farbe={C.seeTief} />
        <WertZeile links={<span style={{ color: COS }}>cos α</span>} rechts={zt(c, 4)} farbe={COS} />
        <WertZeile links={<span style={{ color: SIN }}>sin α</span>} rechts={zt(s, 4)} farbe={SIN} />
        <WertZeile links={<span>{zw("Quadrant", "Quadrant")}</span>} rechts={q ? `${ROEM[q]} · cos ${c > 0 ? ">" : "<"} 0 · sin ${s > 0 ? ">" : "<"} 0` : zw("auf einer Achse", "on an axis")} farbe={C.see} />
        <WertZeile links={<M t="\sin^2 α + \cos^2 α" />} rechts={zt(c * c + s * s, 4)} farbe={C.grau} />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14, alignItems: "center" }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: C.grau }}>{zw("Winkel in", "Angle in")}</span>
        <Pille an={mass === "grad"} onClick={() => setMass("grad")}>{zw("Grad", "degrees")}</Pille>
        <Pille an={mass === "bogen"} onClick={() => setMass("bogen")}>{zw("Bogenmaß", "radians")}</Pille>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8, alignItems: "center" }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: C.grau }}>{zw("Symmetrie", "Symmetry")}</span>
        <Pille an={spiegel === "sin"} onClick={() => setSpiegel(spiegel === "sin" ? null : "sin")} farbe={SIN}>{zw("gleicher Sinus", "same sine")}</Pille>
        <Pille an={spiegel === "cos"} onClick={() => setSpiegel(spiegel === "cos" ? null : "cos")} farbe={COS}>{zw("gleicher Kosinus", "same cosine")}</Pille>
      </div>
      {spiegel && (
        <p style={{ fontSize: 13.5, color: C.tinte, lineHeight: 1.6, margin: "10px 0 0" }}>
          {spiegel === "sin"
            ? zw(`Spiegelung an der y-Achse: Der Punkt bei ${sp}° hat dieselbe Höhe wie P. Also sin ${sp}° = sin ${al}°. Allgemein: sin(180° − α) = sin α.`, `Reflection in the y-axis: the point at ${sp}° has the same height as P. So sin ${sp}° = sin ${al}°. In general: sin(180° − α) = sin α.`)
            : zw(`Spiegelung an der x-Achse: Der Punkt bei ${sp}° liegt genauso weit rechts bzw. links wie P. Also cos ${sp}° = cos ${al}°. Allgemein: cos(360° − α) = cos α.`, `Reflection in the x-axis: the point at ${sp}° is as far right or left as P. So cos ${sp}° = cos ${al}°. In general: cos(360° − α) = cos α.`)}
        </p>
      )}
    </div>
  );
}

const EK_TITEL = {
  vorzeichen: ["Vorzeichen", "Sign"], bezug: ["Zurück in den 1. Quadranten", "Back to quadrant I"], gleich: ["Gleicher Wert, anderer Winkel", "Same value, other angle"],
  punkt: ["Punkt auf dem Kreis", "Point on the circle"], winkel: ["Winkel im richtigen Quadranten", "Angle in the right quadrant"],
};
const fnName = (fn) => (fn === "sin" ? zw("Sinus", "sine") : zw("Kosinus", "cosine"));
const quadrantOptionen = [["1", "I"], ["2", "II"], ["3", "III"], ["4", "IV"]];

const EK = {
  titel: EK_TITEL, arten: EK_ARTEN, neue: (art) => ekAufgabe(art || undefined),
  text: (au) => {
    if (au.art === "vorzeichen") return zw(`Ohne Rechner: Ist $\\${au.fn} ${au.al}°$ positiv oder negativ?`, `Without a calculator: is $\\${au.fn} ${au.al}°$ positive or negative?`);
    if (au.art === "bezug") return zw(`Schreib $\\${au.fn} ${au.al}°$ mit einem Winkel β zwischen 0° und 90°.`, `Write $\\${au.fn} ${au.al}°$ using an angle β between 0° and 90°.`);
    if (au.art === "gleich") return zw(`Welcher zweite Winkel φ zwischen 0° und 360° hat denselben ${fnName(au.fn)} wie ${au.al}°?`, `Which second angle φ between 0° and 360° has the same ${fnName(au.fn)} as ${au.al}°?`);
    if (au.art === "punkt") return zw(`Der Punkt $P(${tex(au.x)} \\mid y)$ liegt auf dem Einheitskreis im ${ROEM[au.q]}. Quadranten. Bestimme y und den Winkel α.`, `The point $P(${tex(au.x)} \\mid y)$ lies on the unit circle in quadrant ${ROEM[au.q]}. Find y and the angle α.`);
    return au.fn === "sin"
      ? zw(`Es gilt $\\sin α = ${tex(au.v)}$ und 90° < α < 180°. Bestimme α.`, `We have $\\sin α = ${tex(au.v)}$ and 90° < α < 180°. Find α.`)
      : zw(`Es gilt $\\cos α = ${tex(au.v)}$ und 270° < α < 360°. Bestimme α.`, `We have $\\cos α = ${tex(au.v)}$ and 270° < α < 360°. Find α.`);
  },
  skizze: (au) => {
    if (au.art === "vorzeichen" || au.art === "bezug") return <KreisSkizze al={au.al} />;
    if (au.art === "gleich") return <KreisSkizze al={au.al} zeigeWinkel={`${au.al}°`} />;
    if (au.art === "punkt") return <KreisSkizze al={au.al} xText={zt(au.x, 2)} yText="y" zeigeWinkel="α?" />;
    return null;
  },
  hilfe: (au) => hilfeT(`trig-ek-${au.art}`, { ansatz: [zw("cos α ist die x-Koordinate, sin α die y-Koordinate von P.", "cos α is the x-, sin α the y-coordinate of P."), zw("Symmetrie: sin(180° − α) = sin α, cos(360° − α) = cos α.", "Symmetry: sin(180° − α) = sin α, cos(360° − α) = cos α.")] }),
  schritte: (au) => {
    const xy = au.fn === "sin" ? zw("y-Koordinate", "y-coordinate") : zw("x-Koordinate", "x-coordinate");
    if (au.art === "vorzeichen") return [
      ws("ek-q", zw("Quadrant", "Quadrant"), zw(`In welchem Quadranten liegt P für α = ${au.al}°?`, `In which quadrant does P lie for α = ${au.al}°?`), quadrantOptionen, String(au.q),
        { hinweis: zw("I: 0°–90°, II: 90°–180°, III: 180°–270°, IV: 270°–360°.", "I: 0°–90°, II: 90°–180°, III: 180°–270°, IV: 270°–360°."), erkl: zw(`${au.al}° liegt im ${ROEM[au.q]}. Quadranten.`, `${au.al}° is in quadrant ${ROEM[au.q]}.`) }),
      ws("ek-vz", zw("Vorzeichen", "Sign"), zw(`${au.fn} α ist die ${xy} von P. Welches Vorzeichen hat sie dort?`, `${au.fn} α is the ${xy} of P. Which sign does it have there?`),
        [["+", zw("positiv", "positive")], ["-", zw("negativ", "negative")]], au.richtig,
        { hinweis: au.fn === "sin" ? zw("Liegt P oberhalb oder unterhalb der x-Achse?", "Is P above or below the x-axis?") : zw("Liegt P rechts oder links der y-Achse?", "Is P right or left of the y-axis?"),
          erkl: zw(`${au.fn} ${au.al}° ${au.richtig === "+" ? "> 0" : "< 0"} – Kontrolle: ${zt(au.wert, 3)}`, `${au.fn} ${au.al}° ${au.richtig === "+" ? "> 0" : "< 0"} – check: ${zt(au.wert, 3)}`) }),
    ];
    if (au.art === "bezug") {
      const andere = au.fn === "sin" ? "cos" : "sin";
      const vz = au.richtig[0] === "+" ? "" : "−";
      return [
        zs("bz-be", zw("Bezugswinkel", "Reference angle"), "β =", au.be, zw("Wie weit ist der Radius von der x-Achse entfernt? (Winkel zwischen 0° und 90°)", "How far is the radius from the x-axis? (angle between 0° and 90°)"),
          { einheit: "°", fehler: [{ wert: 90 - au.be, text: zw("Das ist der Abstand zur y-Achse. Gesucht ist der Winkel zur x-Achse.", "That's the distance to the y-axis. We need the angle to the x-axis.") }],
            hinweis: zw(au.form === "180-" ? "β = 180° − α" : au.form === "180+" ? "β = α − 180°" : "β = 360° − α", au.form === "180-" ? "β = 180° − α" : au.form === "180+" ? "β = α − 180°" : "β = 360° − α"), erkl: `β = ${au.be}°`, wertText: `${au.be}` }),
        ws("bz-form", zw("Umschreiben", "Rewrite"), zw(`Welcher Ausdruck ist gleich $\\${au.fn} ${au.al}°$?`, `Which expression equals $\\${au.fn} ${au.al}°$?`),
          misch([["+sin", `$\\sin ${au.be}°$`], ["-sin", `$−\\sin ${au.be}°$`], ["+cos", `$\\cos ${au.be}°$`], ["-cos", `$−\\cos ${au.be}°$`]], au.id), au.richtig,
          { fehler: [{ wahl: `${au.richtig[0] === "+" ? "-" : "+"}${au.fn}`, text: zw("Der Betrag stimmt, das Vorzeichen nicht: Schau, in welchem Quadranten P liegt.", "The size is right, the sign isn't: check which quadrant P is in.") },
            { wahl: `+${andere}`, text: zw("Beim Spiegeln bleibt die Funktion gleich – aus sin wird nur bei 90° ± α ein cos.", "Reflecting keeps the function – sin only turns into cos at 90° ± α.") },
            { wahl: `-${andere}`, text: zw("Beim Spiegeln bleibt die Funktion gleich – aus sin wird nur bei 90° ± α ein cos.", "Reflecting keeps the function – sin only turns into cos at 90° ± α.") }],
            hinweis: zw("Gespiegelte Punkte haben gleich große Koordinaten; nur das Vorzeichen kann wechseln.", "Reflected points have coordinates of equal size; only the sign can change."), erkl: `$\\${au.fn} ${au.al}° = ${vz}\\${au.fn} ${au.be}°$` }),
        zr("bz-wert", zw("Mit dem Rechner prüfen", "Check with the calculator"), `${au.fn} ${au.al}° ≈`, au.wert, zw("Tipp beides in den Rechner – es muss dasselbe herauskommen.", "Type both into the calculator – the result must be the same."),
          { tol: 0.002, fehler: [radFehler(au.fn === "sin" ? Math.sin(au.al) : Math.cos(au.al), 0.002), { wert: -au.wert, text: zw("Vorzeichen prüfen.", "Check the sign.") }], hinweis: `${au.fn}(${au.al})`, erkl: `≈ ${zt(au.wert, 4)}`, wertText: zt(au.wert, 3), rundung: zw("Auf drei Nachkommastellen.", "To three decimals.") }),
      ];
    }
    if (au.art === "gleich") {
      const falsch = au.fn === "sin" ? (360 - au.al + 360) % 360 : (180 - au.al + 360) % 360;
      return [
        zs("gl-w", zw("Zweiter Winkel", "Second angle"), "φ =", au.partner,
          au.fn === "sin" ? zw("Gleicher Sinus heißt: gleiche Höhe. Spiegle P an der y-Achse.", "Same sine means same height. Reflect P in the y-axis.") : zw("Gleicher Kosinus heißt: gleiche x-Koordinate. Spiegle P an der x-Achse.", "Same cosine means same x-coordinate. Reflect P in the x-axis."),
          { einheit: "°", fehler: [{ wert: falsch, text: au.fn === "sin" ? zw("Das ist der Winkel mit gleichem Kosinus (Spiegelung an der x-Achse). Für gleichen Sinus spiegelst du an der y-Achse.", "That's the angle with the same cosine (reflection in the x-axis). For the same sine reflect in the y-axis.") : zw("Das ist der Winkel mit gleichem Sinus. Für gleichen Kosinus spiegelst du an der x-Achse.", "That's the angle with the same sine. For the same cosine reflect in the x-axis.") },
            { wert: au.al, text: zw("Das ist der gegebene Winkel selbst – gesucht ist der zweite.", "That's the given angle itself – we want the second one.") }],
            hinweis: au.fn === "sin" ? "φ = 180° − α" : "φ = 360° − α", erkl: au.fn === "sin" ? `φ = 180° − ${au.al}° ${au.al > 180 ? "+ 360° " : ""}= ${au.partner}°` : `φ = 360° − ${au.al}° = ${au.partner}°`, wertText: `${au.partner}` }),
      ];
    }
    if (au.art === "punkt") {
      const y = au.y;
      return [
        zr("pk-y", zw("y-Koordinate", "y-coordinate"), "y =", y, zw("P liegt auf dem Kreis mit Radius 1: $x^2 + y^2 = 1$.", "P lies on the circle of radius 1: $x^2 + y^2 = 1$."),
          { tol: 0.005, fehler: [{ wert: -y, text: zw("Im 1. und 2. Quadranten liegt P oberhalb der x-Achse: y > 0.", "In quadrants I and II, P is above the x-axis: y > 0.") }, { wert: 1 - au.x * au.x, text: zw("Das ist y². Zieh noch die Wurzel.", "That's y². Take the square root.") }, { wert: 1 - Math.abs(au.x), text: zw("Nicht 1 − x, sondern 1 − x²: Pythagoras im Dreieck mit Hypotenuse 1.", "Not 1 − x but 1 − x²: Pythagoras in the triangle with hypotenuse 1.") }],
            hinweis: `y = √(1 − ${zt(au.x, 2)}²)`, erkl: `$y = \\sqrt{1 − (${tex(au.x)})^2} = ${tex(y)}$`, wertText: zt(y, 2) }),
        zr("pk-al", zw("Winkel", "Angle"), "α ≈", au.al, zw("x = cos α. Welche Umkehrfunktion liefert α?", "x = cos α. Which inverse function gives α?"),
          { einheit: "°", tol: 0.1, fehler: [radFehler(Math.acos(au.x), 0.01), { wert: asinG(y), tol: 0.1, text: zw("sin⁻¹ liefert nur Winkel zwischen −90° und 90°. Im 2. Quadranten nimm cos⁻¹ der x-Koordinate.", "sin⁻¹ only gives angles between −90° and 90°. In quadrant II use cos⁻¹ of the x-coordinate.") }],
            hinweis: `α = cos⁻¹(${zt(au.x, 2)})`, erkl: `α = cos⁻¹(${zt(au.x, 2)}) ≈ ${zt(au.al, 1)}°`, wertText: zt(au.al, 1), rundung: zw("Auf eine Nachkommastelle.", "To one decimal.") }),
      ];
    }
    const inv = au.fn === "sin" ? "sin⁻¹" : "cos⁻¹";
    return [
      zr("wk-g", zw("Grundwinkel", "Basic angle"), "α₀ ≈", au.grund, zw(`Der Rechner liefert mit ${inv} zuerst den Winkel im 1. Quadranten.`, `The calculator's ${inv} first gives the angle in quadrant I.`),
        { einheit: "°", tol: 0.1, fehler: [radFehler(au.fn === "sin" ? Math.asin(au.v) : Math.acos(au.v), 0.01)], hinweis: `${inv}(${zt(au.v, 2)})`, erkl: `α₀ = ${inv}(${zt(au.v, 2)}) ≈ ${zt(au.grund, 1)}°`, wertText: zt(au.grund, 1), rundung: zw("Auf eine Nachkommastelle.", "To one decimal.") }),
      zr("wk-z", zw("Winkel im richtigen Quadranten", "Angle in the right quadrant"), "α ≈", au.ziel, au.fn === "sin" ? zw("Gleicher Sinus im 2. Quadranten: an der y-Achse spiegeln.", "Same sine in quadrant II: reflect in the y-axis.") : zw("Gleicher Kosinus im 4. Quadranten: an der x-Achse spiegeln.", "Same cosine in quadrant IV: reflect in the x-axis."),
        { einheit: "°", tol: 0.1, fehler: [{ wert: au.grund, text: zw("Das ist der Winkel im 1. Quadranten – er liegt nicht im verlangten Bereich.", "That's the angle in quadrant I – it isn't in the required range.") }, { wert: au.fn === "sin" ? 360 - au.grund : 180 - au.grund, text: zw("Falsch gespiegelt – prüf, welche Koordinate gleich bleiben muss.", "Wrong reflection – check which coordinate has to stay the same.") }],
          hinweis: au.fn === "sin" ? "α = 180° − α₀" : "α = 360° − α₀", erkl: `α ≈ ${zt(au.ziel, 1)}°`, wertText: zt(au.ziel, 1) }),
    ];
  },
};

function KapitelEinheitskreis() {
  return (
    <>
      <Leitfrage nr={1}>{zw("Was ist eigentlich sin α – und was cos α?", "What actually is sin α – and cos α?")}</Leitfrage>
      <Absatz>{zw("Auf dem Taschenrechner sind sin und cos einfach Tasten. Dahinter steckt ein Bild: der Einheitskreis, ein Kreis mit Radius 1 um den Ursprung. Ein Punkt P liegt auf diesem Kreis, und der Radius zu P schließt mit der positiven x-Achse den Winkel α ein.",
        "On a calculator, sin and cos are just keys. Behind them is a picture: the unit circle, a circle of radius 1 around the origin. A point P lies on this circle, and the radius to P makes the angle α with the positive x-axis.")}</Absatz>
      <Absatz>{zw("Die Definition ist ganz kurz: $\\cos α$ ist die x-Koordinate von P, $\\sin α$ ist die y-Koordinate. Mehr ist es nicht – und trotzdem steckt darin die ganze Trigonometrie.",
        "The definition is very short: $\\cos α$ is the x-coordinate of P, $\\sin α$ is the y-coordinate. That's all – and yet the whole of trigonometry is in it.")}</Absatz>
      <FormelBlock t={["P = (\\cos α \\mid \\sin α)", "\\sin^2 α + \\cos^2 α = 1"]} />
      <TrigFilm art="einheitskreis" />
      <EinheitskreisLabor />
      <Merke>
        <MS s={zw("Wichtig zum Merken: $−1 ≤ \\sin α ≤ 1$ und $−1 ≤ \\cos α ≤ 1$. Im II. Quadranten ist cos negativ, im III. beide, im IV. sin. Gleicher Sinus: $\\sin(180° − α) = \\sin α$. Gleicher Kosinus: $\\cos(360° − α) = \\cos α$.",
          "Remember: $−1 ≤ \\sin α ≤ 1$ and $−1 ≤ \\cos α ≤ 1$. In quadrant II cos is negative, in III both, in IV sin. Same sine: $\\sin(180° − α) = \\sin α$. Same cosine: $\\cos(360° − α) = \\cos α$.")} />
      </Merke>
      <Aufklapp titel={zw("Merkhilfe: die besonderen Werte", "Memory aid: the special values")}>
        <p style={{ margin: "0 0 8px" }}>{zw("Für 0°, 30°, 45°, 60°, 90° steigt der Sinus nach einem schönen Muster – unter der Wurzel stehen 0, 1, 2, 3, 4:", "For 0°, 30°, 45°, 60°, 90° the sine follows a neat pattern – under the root stand 0, 1, 2, 3, 4:")}</p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", fontSize: 14, minWidth: 300 }}>
            <tbody>
              <tr>{["α", "0°", "30°", "45°", "60°", "90°"].map((h) => <th key={h} style={{ padding: "6px 8px", borderBottom: `1px solid ${C.linie}`, color: C.see }}>{h}</th>)}</tr>
              <tr><td style={{ padding: "6px 8px", color: SIN, fontWeight: 700 }}>sin α</td>{["\\frac{\\sqrt{0}}{2}", "\\frac{\\sqrt{1}}{2}", "\\frac{\\sqrt{2}}{2}", "\\frac{\\sqrt{3}}{2}", "\\frac{\\sqrt{4}}{2}"].map((t) => <td key={t} style={{ padding: "6px 8px", textAlign: "center" }}><M t={t} /></td>)}</tr>
              <tr><td style={{ padding: "6px 8px", color: SIN, fontWeight: 700 }}>=</td>{["0", "\\frac{1}{2}", "\\frac{\\sqrt{2}}{2}", "\\frac{\\sqrt{3}}{2}", "1"].map((t) => <td key={t} style={{ padding: "6px 8px", textAlign: "center" }}><M t={t} /></td>)}</tr>
              <tr><td style={{ padding: "6px 8px", color: COS, fontWeight: 700 }}>cos α</td>{["1", "\\frac{\\sqrt{3}}{2}", "\\frac{\\sqrt{2}}{2}", "\\frac{1}{2}", "0"].map((t) => <td key={t} style={{ padding: "6px 8px", textAlign: "center" }}><M t={t} /></td>)}</tr>
            </tbody>
          </table>
        </div>
        <p style={{ margin: "8px 0 0" }}>{zw("Der Kosinus läuft dieselbe Reihe rückwärts, denn cos α = sin(90° − α).", "Cosine runs the same row backwards, since cos α = sin(90° − α).")}</p>
      </Aufklapp>
      <Trenner />
      <UebenKopf>{zw("Im Einheitskreis denken", "Thinking in the unit circle")}</UebenKopf>
      <UebenRahmen {...EK} fertig={zw("Richtig – du denkst im Einheitskreis.", "Correct – you're thinking in the unit circle.")} />
    </>
  );
}

/* ============================================================
   KAPITEL 2 · GRAD- UND BOGENMASS
   ============================================================ */
function BogenLabor() {
  const [al, setAl] = useState(135);
  const x = al * RAD;
  const W = 340, H = 230, cx = 116, cy = 115, R = 86;
  const P = [cx + R * Math.cos(x), cy - R * Math.sin(x)];
  const schoen = al % 15 === 0;
  const arc = al > 0.5 ? `M${cx + R} ${cy} A${R} ${R} 0 ${al > 180 ? 1 : 0} 0 ${P[0]} ${P[1]}` : "";
  const sDeg = sinG(al), sRad = Math.sin(al);
  return (
    <div style={{ ...karte, marginTop: 16 }}>
      <p style={kicker}>{zw("Eine Drehung – zwei Maße", "One turn – two measures")}</p>
      <Aufforderung>{zw("Dreh am Regler: Die goldene Bogenlänge auf dem Einheitskreis ist das Bogenmaß.", "Move the slider: the golden arc length on the unit circle is the radian measure.")}</Aufforderung>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label={zw(`Winkel ${al}° gleich ${zt(x, 3)} im Bogenmaß`, `Angle ${al}° equals ${zt(x, 3)} radians`)}>
        <rect x="0" y="0" width={W} height={H} rx="14" fill={C.sand} />
        <line x1={cx - R - 14} x2={cx + R + 14} y1={cy} y2={cy} stroke={C.hellgrau} />
        <line x1={cx} x2={cx} y1={cy - R - 14} y2={cy + R + 14} stroke={C.hellgrau} />
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={HYP} strokeWidth="1.6" opacity="0.6" />
        {arc && <path d={arc} fill="none" stroke={C.flaggold} strokeWidth="6" strokeLinecap="round" />}
        {al > 0.5 && <path d={`M${cx + 22} ${cy} A22 22 0 ${al > 180 ? 1 : 0} 0 ${cx + 22 * Math.cos(x)} ${cy - 22 * Math.sin(x)}`} fill="none" stroke={C.tinte} strokeWidth="1.4" />}
        <line x1={cx} y1={cy} x2={P[0]} y2={P[1]} stroke={HYP} strokeWidth="2.4" />
        <circle cx={P[0]} cy={P[1]} r="5" fill={C.seeTief} />
        <text x={cx + R / 2} y={cy + 15} textAnchor="middle" style={{ ...T, fontSize: 11, fill: HYP }}>r = 1</text>
        <text x="228" y="40" style={{ ...T, fontSize: 13, fill: C.tinte }}>α = {al}°</text>
        <text x="228" y="66" style={{ ...T, fontSize: 13, fill: "#8A6A00" }}>x ≈ {zt(x, 3)}</text>
        <text x="228" y="88" style={{ ...T, fontSize: 11, fill: C.grau }}>{zw("Bogenlänge", "arc length")}</text>
        <text x="228" y="130" style={{ ...T, fontSize: 11, fill: C.grau }}>{zw("Anteil am Kreis", "share of circle")}</text>
        <text x="228" y="150" style={{ ...T, fontSize: 13, fill: C.tinte }}>{zt((al / 360) * 100, 1)} %</text>
      </svg>
      <div style={{ marginTop: 10 }}>
        <Regler name="α" wert={al} setWert={(v) => setAl(Math.round(v))} min={0} max={360} schritt={5} format={(v) => `${Math.round(v)}°`} breiteName={20} />
      </div>
      <div style={{ marginTop: 12 }}>
        <WertZeile links={zw("Gradmaß", "Degrees")} rechts={`${al}°`} />
        <WertZeile links={zw("Bogenmaß exakt", "Radians, exact")} rechts={schoen ? <M t={piTex(piBruch(al))} /> : <M t={`\\frac{${al}π}{180}`} />} />
        <WertZeile links={zw("Bogenmaß als Zahl", "Radians as a number")} rechts={zt(x, 4)} farbe="#8A6A00" />
      </div>
      <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 12, background: C.himmel }}>
        <p style={{ fontSize: 12.5, fontWeight: 700, color: C.see, margin: "0 0 6px", letterSpacing: "0.04em", textTransform: "uppercase" }}>{zw("Die Taschenrechner-Probe", "The calculator test")}</p>
        <WertZeile links={<span>sin({al}) {zw("auf", "on")} <b style={{ color: C.see }}>DEG</b></span>} rechts={zt(sDeg, 4)} />
        <WertZeile links={<span>sin({zt(x, 4)}) {zw("auf", "on")} <b style={{ color: C.gruen }}>RAD</b></span>} rechts={zt(sDeg, 4)} />
        <WertZeile links={<span>sin({al}) {zw("auf", "on")} <b style={{ color: C.gruen }}>RAD</b> ✗</span>} rechts={zt(sRad, 4)} farbe={C.signal} blass={Math.abs(sRad - sDeg) < 1e-6} />
        <p style={{ fontSize: 13, color: C.tinte, lineHeight: 1.6, margin: "8px 0 0" }}>
          {zw(`Gleiche Drehung, gleicher Sinus – egal ob du ${al}° oder ${zt(x, 3)} eingibst. Falsch wird es nur, wenn der Rechner die Zahl ${al} als Bogenmaß liest: Das wären ${zt(al / (2 * Math.PI), 1)} Umdrehungen.`,
            `Same turn, same sine – whether you enter ${al}° or ${zt(x, 3)}. It only goes wrong if the calculator reads ${al} as radians: that would be ${zt(al / (2 * Math.PI), 1)} turns.`)}
        </p>
      </div>
    </div>
  );
}

const BM_TITEL = { zuBogen: ["Grad → Bogenmaß", "Degrees → radians"], zuGrad: ["Bogenmaß → Grad", "Radians → degrees"], bogen: ["Bogenlänge", "Arc length"], falle: ["Die RAD-Falle", "The RAD trap"] };
const BM = {
  titel: BM_TITEL, arten: BM_ARTEN, neue: (art) => bmAufgabe(art || undefined),
  text: (au) => {
    if (au.art === "zuBogen") return zw(`Rechne α = ${au.g}° ins Bogenmaß um – exakt als Vielfaches von π und als Dezimalzahl.`, `Convert α = ${au.g}° to radians – exactly as a multiple of π and as a decimal.`);
    if (au.art === "zuGrad") return au.mitPi ? zw(`Rechne $x = ${piTex([au.z, au.n])}$ ins Gradmaß um.`, `Convert $x = ${piTex([au.z, au.n])}$ to degrees.`) : zw(`Rechne x = ${zt(au.x, 1)} (Bogenmaß) ins Gradmaß um.`, `Convert x = ${zt(au.x, 1)} (radians) to degrees.`);
    if (au.art === "bogen") return zw(`Ein Kreis hat den Radius r = ${au.r} cm. Wie lang ist der Bogen zum Mittelpunktswinkel α = ${au.g}°?`, `A circle has radius r = ${au.r} cm. How long is the arc for the central angle α = ${au.g}°?`);
    return zw(`Lea tippt sin(${au.g}) in ihren Taschenrechner und bekommt ${zt(au.rad, 4)}. Sie wollte aber den Sinus von ${au.g}°.`, `Lea types sin(${au.g}) into her calculator and gets ${zt(au.rad, 4)}. But she wanted the sine of ${au.g}°.`);
  },
  skizze: (au) => (au.art === "bogen" ? <KreisSkizze al={au.g} punktText="" zeigeWinkel={`${au.g}°`} hoehe={190} /> : null),
  hilfe: (au) => hilfeT(`trig-bm-${au.art}`, { regel: [zw("360° = 2π, 180° = π", "360° = 2π, 180° = π"), "x = α · π/180°", "α = x · 180°/π", zw("Bogenlänge b = r · x", "Arc length b = r · x")] }),
  schritte: (au) => {
    if (au.art === "zuBogen") return [
      zs("bm-k", zw("Exakt", "Exact"), "x =", au.k, zw("Welcher Bruchteil von π ist das? $x = \\frac{α}{180°} \\cdot π$", "Which fraction of π is it? $x = \\frac{α}{180°} \\cdot π$"),
        { einheit: "· π", gekuerzt: true, fehler: [{ wert: 180 / au.g, text: zw("Kehrwert: Es heißt α durch 180°, nicht 180° durch α.", "Reciprocal: it's α over 180°, not 180° over α.") }, { wert: au.g / 360, text: zw("Durch 360° teilen gibt den Anteil am Vollkreis – der Vollkreis ist aber 2π, nicht π.", "Dividing by 360° gives the share of a full turn – but a full turn is 2π, not π.") }],
          hinweis: zw(`${au.g}° : 180° – als Bruch, vollständig gekürzt`, `${au.g}° : 180° – as a fraction, fully reduced`), erkl: `$x = \\frac{${au.g}°}{180°} \\cdot π = ${piTex([au.z, au.n])}$`, wertText: au.n === 1 ? `${au.z}` : `${au.z}/${au.n}`, breite: 96 }),
      zr("bm-x", zw("Als Zahl", "As a number"), "x ≈", au.x, zw("Jetzt als Dezimalzahl – tipp die Rechnung ein.", "Now as a decimal – type the calculation."),
        { tol: 0.006, fehler: [{ wert: au.g, text: zw("Das ist noch das Gradmaß.", "That's still degrees.") }, { wert: (au.g * 180) / Math.PI, tol: 0.5, text: zw("Falsch herum: mal π und durch 180°.", "Wrong way round: times π and divided by 180°.") }],
          hinweis: `${au.g}·π÷180`, erkl: `x ≈ ${zt(au.x, 3)}`, wertText: zt(au.x, 3), rundung: zw("Auf zwei bis drei Nachkommastellen.", "To two or three decimals.") }),
    ];
    if (au.art === "zuGrad") return [
      zr("bm-g", zw("Gradmaß", "Degrees"), "α =", au.g, au.mitPi ? zw("π entspricht 180°. Setz für π einfach 180° ein.", "π corresponds to 180°. Just replace π by 180°.") : zw("$α = x \\cdot \\frac{180°}{π}$", "$α = x \\cdot \\frac{180°}{π}$"),
        { einheit: "°", tol: au.mitPi ? 0.01 : 0.05, fehler: [{ wert: au.x * Math.PI / 180, tol: 0.01, text: zw("Falsch herum: mal 180° und durch π.", "Wrong way round: times 180° and divided by π.") }, ...(au.mitPi ? [{ wert: au.z / au.n, tol: 0.001, text: zw("Du hast π weggelassen – ersetze π durch 180°.", "You dropped π – replace π by 180°.") }] : [])],
          hinweis: au.mitPi ? `${au.z}·180÷${au.n}` : `${zt(au.x, 1)}·180÷π`, erkl: au.mitPi ? `$${piTex([au.z, au.n])} \\;\\widehat{=}\\; ${au.g}°$` : `α = ${zt(au.x, 1)} · 180° : π ≈ ${zt(au.g, 1)}°`, wertText: zt(au.g, au.mitPi ? 0 : 1), rundung: au.mitPi ? null : zw("Auf eine Nachkommastelle.", "To one decimal.") }),
    ];
    if (au.art === "bogen") return [
      zr("bm-bx", zw("Winkel im Bogenmaß", "Angle in radians"), "x ≈", au.x, zw("Erst den Winkel ins Bogenmaß: Das ist die Bogenlänge im Einheitskreis.", "First convert the angle to radians: that's the arc length on the unit circle."),
        { tol: 0.006, fehler: [{ wert: au.g, text: zw("Das ist noch das Gradmaß.", "That's still degrees.") }], hinweis: `${au.g}·π÷180`, erkl: `x ≈ ${zt(au.x, 3)}`, wertText: zt(au.x, 3) }),
      zr("bm-b", zw("Bogenlänge", "Arc length"), "b ≈", au.b, zw(`Der Kreis ist ${au.r}-mal so groß wie der Einheitskreis – der Bogen also auch: $b = r \\cdot x$.`, `The circle is ${au.r} times the unit circle – so is the arc: $b = r \\cdot x$.`),
        { einheit: "cm", tol: tolRund(au.b), fehler: [{ wert: au.falsch, tol: 0.5, text: zw("Mit dem Gradmaß multipliziert – für Längen braucht man das Bogenmaß.", "Multiplied by degrees – lengths need radians.") }], hinweis: `${au.r}·${au.g}·π÷180`, erkl: `b = ${au.r} · ${zt(au.x, 3)} ≈ ${z2(au.b)} cm`, wertText: z2(au.b), rundung: zw("Auf zwei Nachkommastellen.", "To two decimals.") }),
    ];
    return [
      ws("fa-was", zw("Was ist passiert?", "What happened?"), zw("Woher kommt der seltsame Wert?", "Where does the strange value come from?"),
        misch([["rad", zw("Der Rechner steht auf RAD und rechnet mit Bogenmaß", "The calculator is on RAD and uses radians")], ["neg", zw(`sin ${au.g}° ist wirklich so groß`, `sin ${au.g}° really is that value`)], ["inv", zw("Sie hat sin⁻¹ statt sin gedrückt", "She pressed sin⁻¹ instead of sin")]], au.id), "rad",
        { fehler: [{ wahl: "neg", text: zw(`Für 0° < α < 90° liegt P im I. Quadranten: sin ${au.g}° liegt zwischen 0 und 1${au.g === 90 ? " (genau 1)" : ""}.`, `For 0° < α < 90° P is in quadrant I: sin ${au.g}° lies between 0 and 1.`) }, { wahl: "inv", text: zw(`sin⁻¹(${au.g}) gibt es gar nicht – sin⁻¹ geht nur für Werte zwischen −1 und 1.`, `sin⁻¹(${au.g}) doesn't exist – sin⁻¹ only works for values between −1 and 1.`) }],
          hinweis: zw(`${au.g} Bogenmaß sind ${zt(au.g / (2 * Math.PI), 1)} Umdrehungen.`, `${au.g} radians are ${zt(au.g / (2 * Math.PI), 1)} turns.`), erkl: zw(`Auf RAD bedeutet sin(${au.g}) den Sinus von ${au.g} Bogenmaß.`, `On RAD, sin(${au.g}) means the sine of ${au.g} radians.`) }),
      zr("fa-wert", zw("Richtig rechnen", "Calculate correctly"), `sin ${au.g}° ≈`, au.deg, zw("Stell auf DEG oder schreib das Gradzeichen: sin(30°).", "Switch to DEG or type the degree sign: sin(30°)."),
        { tol: 0.002, fehler: [radFehler(au.rad, 0.002)], hinweis: `sin(${au.g}°)`, erkl: `sin ${au.g}° ≈ ${zt(au.deg, 4)}`, wertText: zt(au.deg, 3), rundung: zw("Auf drei Nachkommastellen.", "To three decimals.") }),
    ];
  },
};

function KapitelBogenmass() {
  return (
    <>
      <Leitfrage nr={2}>{zw("Grad oder π – warum geht beides?", "Degrees or π – why do both work?")}</Leitfrage>
      <Absatz>{zw("Ein Winkel beschreibt eine Drehung. Wie man die misst, ist eine Frage der Einheit – so wie man eine Strecke in Zentimetern oder Zoll angeben kann. Im Gradmaß hat eine volle Drehung 360°. Im Bogenmaß misst man stattdessen, wie lang der Weg ist, den P dabei auf dem Einheitskreis zurücklegt.",
        "An angle describes a turn. How you measure it is a matter of units – just as a length can be given in centimetres or inches. In degrees a full turn is 360°. In radians you instead measure how long the path is that P travels on the unit circle.")}</Absatz>
      <Absatz>{zw("Der Umfang des Einheitskreises ist $2π \\cdot 1 = 2π$. Also gehören zu 360° genau 2π und zu 180° genau π. Daraus folgt die Umrechnung:",
        "The circumference of the unit circle is $2π \\cdot 1 = 2π$. So 360° belongs to exactly 2π and 180° to exactly π. That gives the conversion:")}</Absatz>
      <FormelBlock t={["x = α \\cdot \\frac{π}{180°}", "α = x \\cdot \\frac{180°}{π}"]} />
      <Absatz>{zw("Und warum macht es für sin und cos keinen Unterschied? Weil beide Zahlen nur davon abhängen, wo P landet – nicht davon, wie man die Drehung nennt. $\\sin 30°$ und $\\sin\\frac{π}{6}$ sind derselbe Punkt, also derselbe Wert 0,5. Nur der Taschenrechner muss wissen, in welcher Einheit du die Zahl meinst: DEG für Grad, RAD für Bogenmaß.",
        "And why does it make no difference to sin and cos? Because both numbers only depend on where P ends up – not on what you call the turn. $\\sin 30°$ and $\\sin\\frac{π}{6}$ are the same point, hence the same value 0.5. Only the calculator needs to know which unit you mean: DEG for degrees, RAD for radians.")}</Absatz>
      <TrigFilm art="bogenmass" />
      <BogenLabor />
      <Merke>
        <MS s={zw("In der Mittelstufe rechnest du im rechtwinkligen Dreieck fast immer in Grad. Das Bogenmaß wird wichtig, sobald der Winkel eine echte Zahl auf der x-Achse ist – bei der Sinusfunktion $f(x) = \\sin x$ und beim Ableiten in der Oberstufe. Dort gilt zum Beispiel $(\\sin x)' = \\cos x$ nur im Bogenmaß.",
          "In middle school you almost always work in degrees in right triangles. Radians become important once the angle is a real number on the x-axis – for the sine function $f(x) = \\sin x$ and for derivatives later on. There, for example, $(\\sin x)' = \\cos x$ only holds in radians.")} />
      </Merke>
      <Trenner />
      <UebenKopf>{zw("Zwischen Grad und Bogenmaß wechseln", "Switching between degrees and radians")}</UebenKopf>
      <UebenRahmen {...BM} fertig={zw("Richtig – beide Maße im Griff.", "Correct – both measures under control.")} />
    </>
  );
}

/* ============================================================
   KAPITEL 3 · RECHTWINKLIGES DREIECK
   ============================================================ */
function RechtEntdecken() {
  const [al, setAl] = useState(35);
  const [c, setC] = useState(6);
  const [sicht, setSicht] = useState("al");
  const { A, B, Cc } = rechtEcken(al, c);
  const a = c * sinG(al), b = c * cosG(al);
  const w = sicht === "al" ? al : 90 - al;
  const wn = sicht === "al" ? "α" : "β";
  const gk = sicht === "al" ? "a" : "b", ak = sicht === "al" ? "b" : "a";
  const gkW = sicht === "al" ? a : b, akW = sicht === "al" ? b : a;
  const farben = sicht === "al" ? { a: SIN, b: COS, c: HYP } : { b: SIN, a: COS, c: HYP };
  const zeile = (fn, z, n, wert) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "8px 0", borderBottom: `1px solid ${C.linie}`, flexWrap: "wrap" }}>
      <span style={{ fontSize: 15, color: C.tinte, display: "inline-flex", alignItems: "center", gap: 6 }}>
        <M t={`\\${fn} ${wn} = \\frac{\\text{${z[0]}}}{\\text{${n[0]}}} = \\frac{${z[1]}}{${n[1]}}`} />
      </span>
      <span style={{ fontSize: 15, fontWeight: 800, color: C.see, fontVariantNumeric: "tabular-nums" }}>{zt(wert, 3)}</span>
    </div>
  );
  const GKt = zw("GK", "opp"), AKt = zw("AK", "adj"), HYt = zw("H", "hyp");
  return (
    <>
      <div style={{ ...karte, marginTop: 16 }}>
        <p style={kicker}>{zw("Rechtwinkliges Dreieck", "Right triangle")}</p>
        <Auswahl optionen={[["al", zw("Sicht von α", "Seen from α")], ["be", zw("Sicht von β", "Seen from β")]]} wert={sicht} setWert={setSicht} label={zw("Bezugswinkel", "Reference angle")} />
        <Aufforderung><span style={{ display: "block", marginTop: 12 }}>{zw("Zieh an c: Die Seiten wachsen, die Verhältnisse bleiben. Zieh an α: Die Verhältnisse ändern sich.", "Move c: the sides grow, the ratios stay. Move α: the ratios change.")}</span></Aufforderung>
        <div style={{ display: "grid", gap: 10 }}>
          <Regler name="α" wert={al} setWert={setAl} min={5} max={85} schritt={1} format={(v) => grad(v, 0)} breiteName={20} />
          <Regler name="c" wert={c} setWert={setC} min={2} max={9} schritt={0.5} farbe={HYP} format={(v) => zt(v, 1)} breiteName={20} />
        </div>
        <div style={{ marginTop: 12, background: C.sand, borderRadius: 14, padding: 8 }}>
          <Dreieck A={A} B={B} Cc={Cc} recht farben={farben} winkelBogen={[sicht]}
            beschr={{ a: `a = ${z2(a)}`, b: `b = ${z2(b)}`, c: `c = ${z2(c)}`, al: sicht === "al" ? grad(al, 0) : null, be: sicht === "be" ? grad(90 - al, 0) : null }} />
        </div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 8, fontSize: 12.5, fontWeight: 700 }}>
          <span style={{ color: SIN }}>■ {zw("Gegenkathete", "opposite")} ({gk})</span>
          <span style={{ color: COS }}>■ {zw("Ankathete", "adjacent")} ({ak})</span>
          <span style={{ color: HYP }}>■ {zw("Hypotenuse", "hypotenuse")} (c)</span>
        </div>
      </div>
      <div style={{ ...karte, marginTop: 12 }}>
        <p style={kicker}>{zw("Seitenverhältnisse für ", "Side ratios for ")}<span style={{ textTransform: "none" }}>{wn} = {zt(w, 0)}°</span></p>
        {zeile("sin", [GKt, gk], [HYt, "c"], gkW / c)}
        {zeile("cos", [AKt, ak], [HYt, "c"], akW / c)}
        {zeile("tan", [GKt, gk], [AKt, ak], gkW / akW)}
        <p style={{ fontSize: 13.5, color: C.tinte, lineHeight: 1.6, margin: "10px 0 0" }}>
          {zw("Die Hypotenuse liegt immer gegenüber dem rechten Winkel. Welche Kathete „Gegen-“ und welche „An-“kathete ist, hängt vom Winkel ab: Für α ist a die Gegenkathete, für β ist es b. Darum gilt sin α = cos β.",
            "The hypotenuse is always opposite the right angle. Which leg is “opposite” and which is “adjacent” depends on the angle: for α, a is opposite; for β, it is b. That is why sin α = cos β.")}
        </p>
      </div>
    </>
  );
}

/* Seite oder Winkel mit sin, cos, tan */
const ROLLE = { a: "gk", b: "ak", c: "hy" };
const FUNKTION = (p, q) => {
  const s = new Set([p, q]);
  if (s.has("gk") && s.has("hy")) return "sin";
  if (s.has("ak") && s.has("hy")) return "cos";
  return "tan";
};
const FN_FORMEL = { sin: "\\sin α = \\frac{a}{c}", cos: "\\cos α = \\frac{b}{c}", tan: "\\tan α = \\frac{a}{b}" };
const fnText = (fn) => <M key={fn} t={FN_FORMEL[fn]} />;
const FN_OPT = [["sin", fnText("sin")], ["cos", fnText("cos")], ["tan", fnText("tan")]];

export function neueRechtAufgabe(artW) {
  const art = artW || (Math.random() < 0.6 ? "seite" : "winkel");
  if (art === "seite") {
    for (;;) {
      const al = 20 + Math.floor(Math.random() * 51);
      const c = wahl([4, 5, 6, 7.5, 8, 10]);
      const exakt = { a: c * sinG(al), b: c * cosG(al), c };
      const geg = wahl(["a", "b", "c"]);
      const ges = wahl(["a", "b", "c"].filter((x) => x !== geg));
      const gWert = r1(exakt[geg]);
      const fn = FUNKTION(ROLLE[geg], ROLLE[ges]);
      const f = { sin: sinG(al), cos: cosG(al), tan: tanG(al) }[fn];
      const fr = { sin: Math.sin(al), cos: Math.cos(al), tan: Math.tan(al) }[fn];
      let wert, radWert, formel, kehr, formelMit;
      const gT = tex(gWert, 1);
      const zaehlerSeite = fn === "sin" ? "a" : fn === "cos" ? "b" : "a";
      if (ges === zaehlerSeite) { wert = gWert * f; radWert = gWert * fr; kehr = gWert / f; formel = `${ges} = ${geg} \\cdot \\${fn} α`; formelMit = `${ges} = ${gT} \\cdot \\${fn} ${al}°`; }
      else { wert = gWert / f; radWert = gWert / fr; kehr = gWert * f; formel = `${ges} = \\frac{${geg}}{\\${fn} α}`; formelMit = `${ges} = \\frac{${gT}}{\\${fn} ${al}°}`; }
      if (Math.abs(radWert - wert) < 0.05 || Math.abs(kehr - wert) < 0.05) continue;   // Fehler sonst nicht unterscheidbar
      const tipp = ges === zaehlerSeite ? `${zt(gWert, 1)}·${fn}(${al})` : `${zt(gWert, 1)}÷${fn}(${al})`;
      return { id: ++zaehler, art, al, c, geg, ges, gWert, fn, wert, radWert, kehr, formel, formelMit, tipp, ecken: rechtEcken(al, c) };
    }
  }
  /* Winkel aus zwei Seiten (ganze Zahlen), danach die dritte Seite */
  const paar = wahl([["a", "c"], ["b", "c"], ["a", "b"]]);
  let a, b, c;
  if (paar[1] === "c") { c = 5 + Math.floor(Math.random() * 8); const k = 2 + Math.floor(Math.random() * (c - 3)); if (paar[0] === "a") { a = k; b = Math.sqrt(c * c - a * a); } else { b = k; a = Math.sqrt(c * c - b * b); } }
  else { a = 2 + Math.floor(Math.random() * 8); b = 2 + Math.floor(Math.random() * 8); if (a === b) b += 1; c = Math.hypot(a, b); }
  const al = atanG(a / b);
  const fn = FUNKTION(ROLLE[paar[0]], ROLLE[paar[1]]);
  const q = { sin: a / c, cos: b / c, tan: a / b }[fn];
  const radWinkel = { sin: Math.asin(q), cos: Math.acos(q), tan: Math.atan(q) }[fn];
  const dritte = ["a", "b", "c"].find((s) => !paar.includes(s));
  return { id: ++zaehler, art, paar, a, b, c, al, fn, q, radWinkel, dritte, ecken: { A: [0, 0], Cc: [b, 0], B: [b, a] } };
}

export function rechtSchritte(au) {
  const rolleName = { gk: zw("Gegenkathete", "opposite"), ak: zw("Ankathete", "adjacent"), hy: zw("Hypotenuse", "hypotenuse") };
  if (au.art === "seite") {
    const andere = ["sin", "cos", "tan"].filter((f) => f !== au.fn);
    return [
      { id: "r-fn", titel: zw("Passende Funktion", "Matching function"), typ: "wahl",
        frage: zw(`Gegeben sind α und ${au.geg} (${rolleName[ROLLE[au.geg]]}), gesucht ist ${au.ges} (${rolleName[ROLLE[au.ges]]}). Welche Beziehung verbindet beide?`, `Given α and ${au.geg} (${rolleName[ROLLE[au.geg]]}), you need ${au.ges} (${rolleName[ROLLE[au.ges]]}). Which relation links both?`),
        optionen: FN_OPT, richtig: au.fn,
        fehler: andere.map((f) => ({ wahl: f, text: zw(`Bei ${f} kommt eine Seite vor, die weder gegeben noch gesucht ist.`, `${f} uses a side that is neither given nor wanted.`) })),
        hinweise: [zw("Bestimme zuerst für beide Seiten: Gegenkathete, Ankathete oder Hypotenuse – von α aus gesehen.", "First name both sides as opposite, adjacent or hypotenuse – seen from α."), zw("GK/H = sin, AK/H = cos, GK/AK = tan.", "opp/hyp = sin, adj/hyp = cos, opp/adj = tan.")],
        erklaerung: <span>{zw("Passend ist", "The right one is")} <M t={FN_FORMEL[au.fn]} />.</span> },
      { id: "r-wert", titel: zw("Berechnen", "Calculate"), typ: "zahl", text: `${au.ges} ≈`, einheit: "cm", wert: au.wert, toleranz: 0.02, wertText: z2(au.wert), rundung: zw("Auf zwei Nachkommastellen – oder tipp die Rechnung ein.", "To two decimals – or type the calculation."),
        frage: <span>{zw("Stelle um und berechne", "Rearrange and calculate")} <M t={au.formel} />.</span>, feld: TrigFeld, lies: trigLies,
        fehler: [radFehler(au.radWert), { wert: au.kehr, toleranz: 0.02, text: zw("Falsch umgestellt: Steht die gesuchte Seite im Nenner, wird geteilt – im Zähler wird multipliziert.", "Rearranged wrongly: if the wanted side is in the denominator you divide; in the numerator you multiply.") }],
        hinweise: [<M key="h" t={au.formelMit} />, zw(`In den Rechner: ${au.tipp}`, `Into the calculator: ${au.tipp}`)],
        erklaerung: <span><M t={au.formelMit} /> ≈ {z2(au.wert)} cm</span> },
    ];
  }
  const [s1, s2] = au.paar;
  const wert1 = au[s1], wert2 = au[s2];
  const drW = au[au.dritte];
  const drFormel = au.dritte === "c" ? `c = \\sqrt{a^2 + b^2}` : `${au.dritte} = \\sqrt{c^2 − ${au.dritte === "a" ? "b" : "a"}^2}`;
  return [
    { id: "w-fn", titel: zw("Passende Funktion", "Matching function"), typ: "wahl",
      frage: zw(`Gegeben sind ${s1} = ${zt(wert1, 2)} cm und ${s2} = ${zt(wert2, 2)} cm. Mit welcher Beziehung bekommst du α?`, `Given ${s1} = ${zt(wert1, 2)} cm and ${s2} = ${zt(wert2, 2)} cm. Which relation gives you α?`),
      optionen: FN_OPT, richtig: au.fn,
      fehler: ["sin", "cos", "tan"].filter((f) => f !== au.fn).map((f) => ({ wahl: f, text: zw(`${f} braucht eine Seite, die hier nicht gegeben ist.`, `${f} needs a side that isn't given here.`) })),
      hinweise: [zw("Von α aus: Welche der beiden Seiten ist Gegenkathete, Ankathete, Hypotenuse?", "From α: which of the two sides is opposite, adjacent, hypotenuse?")],
      erklaerung: <span><M t={FN_FORMEL[au.fn]} /></span> },
    { id: "w-q", titel: zw("Verhältnis", "Ratio"), typ: "zahl", text: `${au.fn} α ≈`, wert: au.q, toleranz: 0.0015, wertText: zt(au.q, 3), rundung: zw("Auf drei Nachkommastellen – oder als Bruch.", "To three decimals – or as a fraction."),
      frage: zw("Berechne den Wert des Verhältnisses.", "Calculate the value of the ratio."), feld: TrigFeld, lies: trigLies,
      fehler: [{ wert: 1 / au.q, toleranz: 0.0015, text: zw("Kehrwert: Zähler und Nenner vertauscht.", "Reciprocal: numerator and denominator swapped.") }],
      hinweise: [zw("Seite durch Seite, wie in der Formel.", "Side divided by side, as in the formula.")], erklaerung: `${au.fn} α ≈ ${zt(au.q, 3)}` },
    { id: "w-al", titel: zw("Winkel", "Angle"), typ: "zahl", text: "α ≈", einheit: "°", wert: au.al, toleranz: 0.1, wertText: zt(au.al, 1), rundung: zw("Auf eine Nachkommastelle.", "To one decimal."),
      frage: zw(`Wende die Umkehrfunktion an: α = ${au.fn}⁻¹(…)`, `Apply the inverse function: α = ${au.fn}⁻¹(…)`), feld: TrigFeld, lies: trigLies,
      fehler: [radFehler(au.radWinkel, 0.01), { wert: { sin: sinG, cos: cosG, tan: tanG }[au.fn](au.q), toleranz: 0.005, text: zw(`Das ist ${au.fn} von deiner Zahl. Gesucht ist der Winkel – nimm ${au.fn}⁻¹.`, `That's ${au.fn} of your number. You want the angle – use ${au.fn}⁻¹.`) }],
      hinweise: [zw(`Taste ${au.fn}⁻¹, Modus DEG.`, `Key ${au.fn}⁻¹, mode DEG.`)], erklaerung: `α = ${au.fn}⁻¹(${zt(au.q, 3)}) ≈ ${zt(au.al, 1)}°` },
    { id: "w-be", titel: zw("Dritter Winkel", "Third angle"), typ: "zahl", text: "β ≈", einheit: "°", wert: 90 - au.al, toleranz: 0.1, wertText: zt(90 - au.al, 1),
      frage: zw("Wie groß ist β?", "How large is β?"), feld: TrigFeld, lies: trigLies,
      fehler: [{ wert: 180 - au.al, toleranz: 0.1, text: zw("Der rechte Winkel γ = 90° gehört auch zur Winkelsumme.", "The right angle γ = 90° also belongs to the angle sum.") }],
      hinweise: [zw("Winkelsumme im Dreieck: α + β + γ = 180°, γ = 90°.", "Angle sum: α + β + γ = 180°, γ = 90°.")], erklaerung: `β = 90° − ${zt(au.al, 1)}° = ${zt(90 - au.al, 1)}°` },
    { id: "w-dr", titel: zw("Dritte Seite", "Third side"), typ: "zahl", text: `${au.dritte} ≈`, einheit: "cm", wert: drW, toleranz: 0.02, wertText: z2(drW), rundung: zw("Auf zwei Nachkommastellen.", "To two decimals."),
      frage: zw("Jetzt fehlt nur noch eine Seite. Mit zwei Seiten bekommst du die dritte über den Satz des Pythagoras.", "Only one side is missing. From two sides you get the third with Pythagoras."), feld: TrigFeld, lies: trigLies,
      fehler: au.dritte === "c" ? [{ wert: au.a + au.b, toleranz: 0.02, text: zw("Seiten addieren reicht nicht – die Quadrate werden addiert.", "Adding the sides isn't enough – you add the squares.") }, { wert: au.a * au.a + au.b * au.b, toleranz: 0.05, text: zw("Das ist c². Zieh noch die Wurzel.", "That's c². Take the square root.") }]
        : [{ wert: Math.hypot(wert1, wert2), toleranz: 0.02, text: zw("Gesucht ist eine Kathete – dann wird subtrahiert: Hypotenuse² minus Kathete².", "You want a leg – so subtract: hypotenuse² minus leg².") }],
      hinweise: [<M key="h" t={drFormel} />], erklaerung: <span><M t={drFormel} /> ≈ {z2(drW)} cm</span> },
  ];
}

const RW_TITEL = { verhaeltnis: ["Zwei Seiten → sin, cos, tan", "Two sides → sin, cos, tan"], seite: ["Seite berechnen", "Find a side"], winkel: ["Winkel und dritte Seite", "Angle and third side"], sache: ["Sachaufgabe", "Word problem"] };
const SACH_TEXT = {
  leiter: (s) => zw(`Eine ${s.L} m lange Leiter lehnt an einer Hauswand und bildet mit dem Boden einen Winkel von ${s.al}°. In welcher Höhe berührt sie die Wand?`, `A ${s.L} m ladder leans against a wall at an angle of ${s.al}° to the ground. At what height does it touch the wall?`),
  rampe: (s) => zw(`Eine ${zt(s.L, 1)} m lange Rampe überwindet einen Höhenunterschied von ${zt(s.h, 1)} m. Wie groß ist ihr Neigungswinkel?`, `A ${zt(s.L, 1)} m long ramp rises ${zt(s.h, 1)} m. What is its angle of inclination?`),
  drachen: (s) => zw(`Die Schnur eines Drachens ist ${s.L} m lang und straff gespannt. Sie bildet mit dem Boden einen Winkel von ${s.al}°. Wie hoch fliegt der Drachen über der Hand?`, `A kite string is ${s.L} m long and taut. It makes an angle of ${s.al}° with the ground. How high above the hand is the kite?`),
  lot: (s) => zw(`Ein Weg führt ${s.L} m einen Hang mit ${s.al}° Neigung hinauf. Wie weit ist das waagerecht gemessen (auf der Karte)?`, `A path runs ${s.L} m up a slope inclined at ${s.al}°. How far is that measured horizontally (on the map)?`),
};
const SACH_SKIZZE = {
  leiter: (s) => ({ ...rechtEcken(s.al, s.L), beschr: { c: `${s.L} m`, a: "?", al: `${s.al}°` } }),
  rampe: (s) => ({ ...rechtEcken(asinG(s.h / s.L), s.L), beschr: { c: `${zt(s.L, 1)} m`, a: `${zt(s.h, 1)} m`, al: "?" } }),
  drachen: (s) => ({ ...rechtEcken(s.al, s.L), beschr: { c: `${s.L} m`, a: "?", al: `${s.al}°` } }),
  lot: (s) => ({ ...rechtEcken(s.al, s.L), beschr: { c: `${s.L} m`, b: "?", al: `${s.al}°` } }),
};
const sachSchritte = (s) => {
  const fn = s.was === "rampe" ? "sin" : s.fn;
  const wahlSchritt = { id: "sa-fn", titel: zw("Welche Funktion?", "Which function?"), typ: "wahl", frage: zw("Benenne die Seiten vom gegebenen Winkel aus. Welche Funktion verbindet Gegebenes und Gesuchtes?", "Name the sides from the given angle. Which function links given and wanted?"),
    optionen: [["sin", "sin"], ["cos", "cos"], ["tan", "tan"]], richtig: fn, fehler: [],
    hinweise: [s.was === "lot" ? zw("Weg am Hang = Hypotenuse, waagerechte Strecke = Ankathete.", "Path on the slope = hypotenuse, horizontal distance = adjacent.") : zw("Schnur, Leiter oder Rampe sind die Hypotenuse; die Höhe liegt dem Winkel am Boden gegenüber.", "String, ladder or ramp is the hypotenuse; the height is opposite the angle at the ground.")],
    erklaerung: zw(`${fn}: ${fn === "cos" ? "Ankathete" : "Gegenkathete"} und Hypotenuse.`, `${fn}: ${fn === "cos" ? "adjacent" : "opposite"} and hypotenuse.`) };
  if (s.was === "rampe") return [wahlSchritt,
    zr("sa-w", zw("Neigungswinkel", "Angle of inclination"), "α ≈", s.wert, zw(`$\\sin α = \\frac{${tex(s.h, 1)}}{${tex(s.L, 1)}}$ – jetzt sin⁻¹.`, `$\\sin α = \\frac{${tex(s.h, 1)}}{${tex(s.L, 1)}}$ – now sin⁻¹.`),
      { einheit: "°", tol: 0.05, fehler: [radFehler(s.rad, 0.01)], hinweis: `sin⁻¹(${zt(s.h, 1)}÷${zt(s.L, 1)})`, erkl: `α = sin⁻¹(${zt(s.h, 1)} : ${zt(s.L, 1)}) ≈ ${zt(s.wert, 2)}°`, wertText: zt(s.wert, 2), rundung: zw("Auf zwei Nachkommastellen.", "To two decimals.") })];
  const ges = s.was === "lot" ? zw("Waagerechte", "Horizontal") : zw("Höhe", "Height");
  return [wahlSchritt,
    zr("sa-w", ges, `${s.was === "lot" ? "x" : "h"} ≈`, s.wert, zw(`$${s.was === "lot" ? "x" : "h"} = ${s.L} \\cdot \\${fn} ${s.al}°$`, `$${s.was === "lot" ? "x" : "h"} = ${s.L} \\cdot \\${fn} ${s.al}°$`),
      { einheit: "m", tol: Math.max(0.02, s.wert * 0.002), fehler: [radFehler(s.rad), { wert: s.falsch, tol: 0.02, text: zw(`Falsche Funktion – das wäre die ${s.was === "lot" ? "Höhe" : "waagerechte Strecke"}.`, `Wrong function – that would be the ${s.was === "lot" ? "height" : "horizontal distance"}.`) }],
        hinweis: `${s.L}·${fn}(${s.al})`, erkl: `${s.L} · ${fn} ${s.al}° ≈ ${z2(s.wert)} m`, wertText: z2(s.wert), rundung: zw("Auf zwei Nachkommastellen.", "To two decimals.") })];
};

const verhSchritte = (v) => {
  const geg = ["a", "b", "c"].filter((s) => s !== v.fehlt);
  const drFormel = v.fehlt === "c" ? "c = \\sqrt{a^2 + b^2}" : `${v.fehlt} = \\sqrt{c^2 − ${v.fehlt === "a" ? "b" : "a"}^2}`;
  const fnF = { sin: ["a", "c"], cos: ["b", "c"], tan: ["a", "b"] }[v.fn];
  return [
    zr("vh-s", zw("Dritte Seite", "Third side"), `${v.fehlt} =`, v[v.fehlt], zw(`Gegeben sind ${geg[0]} = ${v[geg[0]]} cm und ${geg[1]} = ${v[geg[1]]} cm. Berechne zuerst die dritte Seite mit Pythagoras.`, `Given ${geg[0]} = ${v[geg[0]]} cm and ${geg[1]} = ${v[geg[1]]} cm. First find the third side with Pythagoras.`),
      { einheit: "cm", tol: 0.01, fehler: v.fehlt === "c"
        ? [{ wert: v.a * v.a + v.b * v.b, text: zw("Das ist c². Zieh noch die Wurzel.", "That's c². Take the square root.") }, { wert: v.a + v.b, text: zw("Nicht die Seiten addieren, sondern ihre Quadrate.", "Don't add the sides – add their squares.") }]
        : [{ wert: Math.hypot(v[geg[0]], v[geg[1]]), tol: 0.01, text: zw("Gesucht ist eine Kathete: c² minus die andere Kathete², nicht plus.", "You want a leg: c² minus the other leg², not plus.") }],
        hinweis: <M t={drFormel} />, erkl: <span><M t={drFormel} /> = {v[v.fehlt]} cm</span>, wertText: `${v[v.fehlt]}` }),
    zr("vh-f", `${v.fn} α`, `${v.fn} α =`, v.wert, zw(`Jetzt das Verhältnis – als Bruch oder als Dezimalzahl.`, `Now the ratio – as a fraction or a decimal.`),
      { tol: 0.0015, fehler: [{ wert: 1 / v.wert, text: zw("Kehrwert – Zähler und Nenner vertauscht.", "Reciprocal – numerator and denominator swapped.") },
        ...["sin", "cos", "tan"].filter((f) => f !== v.fn).map((f) => ({ wert: { sin: v.a / v.c, cos: v.b / v.c, tan: v.a / v.b }[f], text: zw(`Das ist ${f} α. Gesucht ist ${v.fn} α.`, `That's ${f} α. We want ${v.fn} α.`) }))],
        hinweis: <M t={FN_FORMEL[v.fn]} />, erkl: <span><M t={`\\${v.fn} α = \\frac{${fnF[0]}}{${fnF[1]}} = \\frac{${v[fnF[0]]}}{${v[fnF[1]]}}${v.bruch[0] !== v[fnF[0]] ? ` = \\frac{${v.bruch[0]}}{${v.bruch[1]}}` : ""} ≈ ${tex(v.wert, 3)}`} /></span>, wertText: zt(v.wert, 3) }),
  ];
};

const RW = {
  titel: RW_TITEL, arten: ["verhaeltnis", "seite", "winkel", "sache"],
  neue: (art) => {
    const a = art || wahl(["verhaeltnis", "seite", "seite", "winkel", "sache"]);
    if (a === "verhaeltnis") return verhaeltnisAufgabe();
    if (a === "sache") return sachAufgabe(wahl(SACHEN));
    return neueRechtAufgabe(a);
  },
  text: (au) => {
    if (au.art === "verhaeltnis") return zw(`Im Dreieck ABC ist γ = 90°. Berechne die fehlende Seite und dann $\\${au.fn} α$.`, `In triangle ABC, γ = 90°. Find the missing side and then $\\${au.fn} α$.`);
    if (au.art === "sache") return SACH_TEXT[au.was](au);
    if (au.art === "seite") return zw(`Im Dreieck ABC ist γ = 90°, α = ${au.al}° und ${au.geg} = ${zt(au.gWert, 1)} cm. Berechne ${au.ges}.`, `In triangle ABC, γ = 90°, α = ${au.al}° and ${au.geg} = ${zt(au.gWert, 1)} cm. Find ${au.ges}.`);
    return zw(`Im Dreieck ABC ist γ = 90°, ${au.paar[0]} = ${zt(au[au.paar[0]], 2)} cm und ${au.paar[1]} = ${zt(au[au.paar[1]], 2)} cm. Berechne α, β und die dritte Seite.`, `In triangle ABC, γ = 90°, ${au.paar[0]} = ${zt(au[au.paar[0]], 2)} cm and ${au.paar[1]} = ${zt(au[au.paar[1]], 2)} cm. Find α, β and the third side.`);
  },
  skizze: (au) => {
    if (au.art === "verhaeltnis") {
      const e = { A: [0, 0], Cc: [au.b, 0], B: [au.b, au.a] };
      const beschr = { a: `a = ${au.a}`, b: `b = ${au.b}`, c: `c = ${au.c}`, al: "α" };
      beschr[au.fehlt] = "?";
      return <Dreieck {...e} recht beschr={beschr} hoehe={190} />;
    }
    if (au.art === "sache") { const s = SACH_SKIZZE[au.was](au); return <Dreieck A={s.A} B={s.B} Cc={s.Cc} recht beschr={s.beschr} hoehe={180} namen={[null, null, null]} />; }
    const { A, B, Cc } = au.ecken;
    const beschr = au.art === "seite"
      ? { [au.geg]: `${au.geg} = ${zt(au.gWert, 1)}`, [au.ges]: "?", al: grad(au.al, 0) }
      : { [au.paar[0]]: `${au.paar[0]} = ${zt(au[au.paar[0]], 2)}`, [au.paar[1]]: `${au.paar[1]} = ${zt(au[au.paar[1]], 2)}`, al: "?" };
    return <Dreieck A={A} B={B} Cc={Cc} recht beschr={beschr} hoehe={190} />;
  },
  schritte: (au) => (au.art === "verhaeltnis" ? verhSchritte(au) : au.art === "sache" ? sachSchritte(au) : rechtSchritte(au)),
  hilfe: (au) => hilfeT(`trig-r-${au.art}`),
};

function KapitelDreieck() {
  return (
    <>
      <Leitfrage nr={3}>{zw("Vom Kreis ins Dreieck: sin, cos und tan mit Seiten", "From circle to triangle: sin, cos and tan with sides")}</Leitfrage>
      <Absatz>{zw("Im Einheitskreis bilden Radius, cos α und sin α ein rechtwinkliges Dreieck mit der Hypotenuse 1. Jedes andere rechtwinklige Dreieck mit demselben Winkel α ist eine Vergrößerung davon – mit einem Faktor c. Dann ist die Hypotenuse c, die Ankathete $c \\cdot \\cos α$ und die Gegenkathete $c \\cdot \\sin α$.",
        "In the unit circle, the radius, cos α and sin α form a right triangle with hypotenuse 1. Every other right triangle with the same angle α is an enlargement of it – by a factor c. Then the hypotenuse is c, the adjacent leg $c \\cdot \\cos α$ and the opposite leg $c \\cdot \\sin α$.")}</Absatz>
      <Absatz>{zw("Teilt man durch c, kommt man zurück zum Einheitskreis. Darum gilt in jedem rechtwinkligen Dreieck:", "Dividing by c takes you back to the unit circle. So in every right triangle:")}</Absatz>
      <FormelBlock t={["\\sin α = \\frac{\\text{Gegenkathete}}{\\text{Hypotenuse}}", "\\cos α = \\frac{\\text{Ankathete}}{\\text{Hypotenuse}}", "\\tan α = \\frac{\\text{Gegenkathete}}{\\text{Ankathete}}"].map((t) => (zw(t, t.replace("Gegenkathete", "opposite").replace("Gegenkathete", "opposite").replace("Ankathete", "adjacent").replace("Hypotenuse", "hypotenuse"))))} />
      <TrigFilm art="dreieck" />
      <RechtEntdecken />
      <TrigRechnerKarte />
      <Merke>
        <MS s={zw("So gehst du vor: 1. Rechten Winkel finden – gegenüber liegt die Hypotenuse. 2. Von deinem Winkel aus Gegen- und Ankathete benennen. 3. Die Funktion wählen, in der genau die gegebene und die gesuchte Seite vorkommen. 4. Umstellen und rechnen – den Winkel bekommst du mit $\\sin^{−1}$, $\\cos^{−1}$ oder $\\tan^{−1}$.",
          "How to proceed: 1. Find the right angle – the hypotenuse is opposite. 2. From your angle, name the opposite and adjacent legs. 3. Choose the function containing exactly the given and the wanted side. 4. Rearrange and calculate – you get the angle with $\\sin^{−1}$, $\\cos^{−1}$ or $\\tan^{−1}$.")} />
      </Merke>
      <Trenner />
      <UebenKopf>{zw("Seiten und Winkel im rechtwinkligen Dreieck", "Sides and angles in right triangles")}</UebenKopf>
      <UebenRahmen {...RW} fertig={zw("Richtig – Seiten benannt, Funktion gewählt, berechnet.", "Correct – sides named, function chosen, calculated.")} />
    </>
  );
}

/* ============================================================
   KAPITEL 4 · TANGENS
   ============================================================ */
function TangensLabor() {
  const [al, setAl] = useState(35);
  const W = 340, H = 300, cx = 120, cy = 160, R = 80, tx = cx + R;
  const c = cosG(al), s = sinG(al);
  const def = Math.abs(c) > 1e-9;
  const t = def ? s / c : Infinity;
  const P = [cx + R * c, cy - R * s];
  /* Gerade durch O mit Steigung tan α, am Rahmen abgeschnitten (Schnittpunkte mit den vier Rändern) */
  let linie = [[cx, 6], [cx, H - 6]];
  if (def) {
    const pts = [];
    for (const x of [6, W - 6]) { const y = cy - (x - cx) * t; if (y >= 6 && y <= H - 6) pts.push([x, y]); }
    if (Math.abs(t) > 1e-9) for (const y of [6, H - 6]) { const x = cx + (cy - y) / t; if (x >= 6 && x <= W - 6) pts.push([x, y]); }
    pts.sort((p, q) => p[0] - q[0]);
    if (pts.length >= 2) linie = [pts[0], pts[pts.length - 1]];
  }
  const Ty = def ? cy - R * t : null;
  const Tsicht = def && Ty > 8 && Ty < H - 8;
  return (
    <div style={{ ...karte, marginTop: 16 }}>
      <p style={kicker}>{zw("Tangens am Einheitskreis", "Tangent on the unit circle")}</p>
      <Aufforderung>{zw("Dreh α und beobachte, wo die Gerade durch O und P die Tangente trifft.", "Turn α and watch where the line through O and P meets the tangent.")}</Aufforderung>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label={zw(`Tangens von ${al}°`, `Tangent of ${al}°`)}>
        <rect x="0" y="0" width={W} height={H} rx="14" fill={C.sand} />
        <line x1={cx - R - 30} x2={W - 8} y1={cy} y2={cy} stroke={C.hellgrau} />
        <line x1={cx} x2={cx} y1={8} y2={H - 8} stroke={C.hellgrau} />
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={HYP} strokeWidth="1.6" opacity="0.65" />
        <line x1={tx} x2={tx} y1={6} y2={H - 6} stroke={TAN} strokeWidth="1.4" strokeDasharray="4 4" opacity="0.8" />
        <text x={tx + 5} y={H - 12} style={{ ...T, fontSize: 10.5, fill: TAN }}>x = 1</text>
        <line x1={linie[0][0]} y1={linie[0][1]} x2={linie[1][0]} y2={linie[1][1]} stroke={HYP} strokeWidth="1.4" opacity="0.55" />
        {def && Tsicht && <line x1={tx} y1={cy} x2={tx} y2={Ty} stroke={TAN} strokeWidth="5" strokeLinecap="round" />}
        {def && !Tsicht && <text x={tx + 8} y={t > 0 ? 22 : H - 26} style={{ ...T, fontSize: 12, fill: TAN }}>{t > 0 ? "↑" : "↓"} T {zw("außerhalb", "outside")}</text>}
        <line x1={cx} y1={cy} x2={P[0]} y2={cy} stroke={COS} strokeWidth="3.5" />
        <line x1={P[0]} y1={cy} x2={P[0]} y2={P[1]} stroke={SIN} strokeWidth="3.5" />
        <line x1={cx} y1={cy} x2={P[0]} y2={P[1]} stroke={HYP} strokeWidth="2.4" />
        <circle cx={P[0]} cy={P[1]} r="5" fill={C.seeTief} />
        {def && Tsicht && <circle cx={tx} cy={Ty} r="5.5" fill={TAN} />}
        {def && Tsicht && <text x={tx + 9} y={Ty + 4} style={{ ...T, fontSize: 12.5, fill: TAN }}>T</text>}
        {def && Tsicht && Math.abs(Ty - cy) > 22 && <text x={tx - 7} y={(cy + Ty) / 2 + 4} textAnchor="end" style={{ ...T, fontSize: 12, fill: TAN }}>tan α</text>}
        <text x="12" y="22" style={{ ...T, fontSize: 13, fill: C.tinte }}>α = {al}°</text>
      </svg>
      <div style={{ marginTop: 10 }}>
        <Regler name="α" wert={al} setWert={(v) => setAl(Math.round(v))} min={0} max={360} schritt={1} format={(v) => `${Math.round(v)}°`} breiteName={20} />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
        {[0, 30, 45, 60, 80, 90, 135, 180, 225, 270].map((b) => <Pille key={b} an={al === b} onClick={() => setAl(b)} farbe={TAN}>{b}°</Pille>)}
      </div>
      <div style={{ marginTop: 12 }}>
        <WertZeile links={<span style={{ color: SIN }}>sin α</span>} rechts={zt(s, 4)} farbe={SIN} />
        <WertZeile links={<span style={{ color: COS }}>cos α</span>} rechts={zt(c, 4)} farbe={COS} />
        <WertZeile links={<M t="\tan α = \frac{\sin α}{\cos α}" />} rechts={def ? zt(t, 4) : zw("nicht definiert", "undefined")} farbe={TAN} />
        <WertZeile links={zw("Steigung der Geraden durch O und P", "Slope of the line through O and P")} rechts={def ? zt(t, 4) : zw("senkrecht", "vertical")} farbe={C.see} />
      </div>
    </div>
  );
}

const fmtGerade = (m, b) => {
  const mt = m === 1 ? "" : tex(m);
  const bt = b === 0 ? "" : b > 0 ? ` + ${b}` : ` − ${-b}`;
  return `y = ${mt}x${bt}`;
};
const TAN_TITEL = { einheit: ["tan aus sin und cos", "tan from sin and cos"], steigung: ["Steigungswinkel einer Geraden", "Angle of a line"], prozent: ["Steigung in Prozent", "Gradient in percent"], hoehe: ["Höhe aus der Entfernung", "Height from a distance"], schatten: ["Sonnenstand aus dem Schatten", "Sun angle from a shadow"] };
const TA = {
  titel: TAN_TITEL, arten: TAN_ARTEN, neue: (art) => tanAufgabe(art || undefined),
  text: (au) => {
    if (au.art === "einheit") return zw(`Für einen Winkel α gilt $\\sin α = ${tex(au.sin)}$ und $\\cos α = ${tex(au.cos)}$. Berechne $\\tan α$.`, `For an angle α, $\\sin α = ${tex(au.sin)}$ and $\\cos α = ${tex(au.cos)}$. Find $\\tan α$.`);
    if (au.art === "steigung") return zw(`Unter welchem Winkel α steigt die Gerade $${fmtGerade(au.m, au.b)}$ gegen die x-Achse an?`, `At what angle α does the line $${fmtGerade(au.m, au.b)}$ rise relative to the x-axis?`);
    if (au.art === "prozent") return au.richtung === "winkel"
      ? zw(`Ein Verkehrsschild warnt vor ${au.p} % Steigung: Auf 100 m waagerecht geht es ${au.p} m nach oben. Wie groß ist der Steigungswinkel?`, `A road sign warns of a ${au.p} % gradient: over 100 m horizontally the road rises ${au.p} m. What is the angle of inclination?`)
      : zw(`Eine Straße steigt unter einem Winkel von ${au.al}° an. Wie viel Prozent Steigung sind das?`, `A road rises at an angle of ${au.al}°. What gradient in percent is that?`);
    if (au.art === "hoehe") return zw(`Du stehst ${au.d} m vom Fuß eines Turms entfernt und siehst die Spitze unter einem Höhenwinkel von ${au.al}°${au.auge ? `. Deine Augen sind ${zt(au.auge, 1)} m über dem Boden` : " (vom Boden aus gemessen)"}. Wie hoch ist der Turm?`, `You stand ${au.d} m from the foot of a tower and see the top at an angle of elevation of ${au.al}°${au.auge ? `. Your eyes are ${zt(au.auge, 1)} m above the ground` : " (measured from the ground)"}. How tall is the tower?`);
    return zw(`Ein ${au.h} m hoher Mast wirft einen ${au.s} m langen Schatten. Unter welchem Winkel fallen die Sonnenstrahlen ein?`, `A ${au.h} m tall pole casts a ${au.s} m long shadow. At what angle do the sun's rays come in?`);
  },
  skizze: (au) => {
    if (au.art === "einheit") return <KreisSkizze al={acosG(au.cos)} xText={zt(au.cos, 2)} yText={zt(au.sin, 2)} />;
    if (au.art === "hoehe") return <Dreieck A={[0, 0]} Cc={[au.d, 0]} B={[au.d, au.h1]} recht beschr={{ b: `${au.d} m`, a: "?", al: `${au.al}°` }} hoehe={180} namen={[null, null, null]} />;
    if (au.art === "schatten") return <Dreieck A={[0, 0]} Cc={[au.s, 0]} B={[au.s, au.h]} recht beschr={{ b: `${au.s} m`, a: `${au.h} m`, al: "?" }} hoehe={180} namen={[null, null, null]} />;
    if (au.art === "prozent") { const w = au.richtung === "winkel" ? au.wert : au.al; return <Dreieck A={[0, 0]} Cc={[100, 0]} B={[100, 100 * tanG(w)]} recht beschr={{ b: "100 m", a: au.richtung === "winkel" ? `${au.p} m` : "?", al: au.richtung === "winkel" ? "?" : `${au.al}°` }} hoehe={150} namen={[null, null, null]} />; }
    return null;
  },
  hilfe: (au) => hilfeT(`trig-tan-${au.art}`, { regel: ["tan α = GK/AK = sin α/cos α", zw("Steigung m = tan α", "Slope m = tan α"), zw("p % Steigung: tan α = p/100", "p % gradient: tan α = p/100")] }),
  schritte: (au) => {
    if (au.art === "einheit") return [
      zr("te-t", "tan α", "tan α =", au.wert, zw("Im Einheitskreis: $\\tan α = \\frac{\\sin α}{\\cos α}$.", "In the unit circle: $\\tan α = \\frac{\\sin α}{\\cos α}$."),
        { tol: 0.002, fehler: [{ wert: au.kehr, text: zw("Kehrwert: sin steht oben, cos unten.", "Reciprocal: sin on top, cos below.") }, { wert: -au.wert, text: zw("Vorzeichen: Im II. Quadranten ist cos negativ – also auch tan.", "Sign: in quadrant II cos is negative – so is tan.") }],
          hinweis: `${zt(au.sin, 2)} ÷ ${zt(au.cos, 2)}`, erkl: `$\\tan α = \\frac{${tex(au.sin)}}{${tex(au.cos)}} ≈ ${tex(au.wert, 3)}$`, wertText: zt(au.wert, 3), rundung: zw("Auf drei Nachkommastellen – oder als Bruch.", "To three decimals – or as a fraction.") }),
    ];
    if (au.art === "steigung") return [
      zs("ts-m", zw("Steigung", "Slope"), "tan α =", au.m, zw("Die Steigung m sagt: 1 nach rechts, m nach oben. Das ist genau tan α.", "The slope m says: 1 right, m up. That is exactly tan α."),
        { fehler: [{ wert: au.b, text: zw("Das ist der y-Achsenabschnitt, nicht die Steigung.", "That's the y-intercept, not the slope.") }], hinweis: zw("Die Zahl vor dem x.", "The number in front of x."), erkl: `tan α = m = ${zt(au.m, 2)}`, wertText: zt(au.m, 2) }),
      zr("ts-a", zw("Steigungswinkel", "Angle"), "α ≈", au.wert, zw("Jetzt tan⁻¹.", "Now tan⁻¹."),
        { einheit: "°", tol: 0.1, fehler: [radFehler(au.rad, 0.01), { wert: au.kehr, tol: 0.1, text: zw("Das ist der Winkel zur y-Achse (tan⁻¹ vom Kehrwert).", "That's the angle to the y-axis (tan⁻¹ of the reciprocal).") }],
          hinweis: `tan⁻¹(${zt(au.m, 2)})`, erkl: `α = tan⁻¹(${zt(au.m, 2)}) ≈ ${zt(au.wert, 1)}°`, wertText: zt(au.wert, 1), rundung: zw("Auf eine Nachkommastelle.", "To one decimal.") }),
    ];
    if (au.art === "prozent") return au.richtung === "winkel" ? [
      zs("tp-t", "tan α", "tan α =", au.p / 100, zw(`Gegenkathete ${au.p} m, Ankathete 100 m.`, `Opposite ${au.p} m, adjacent 100 m.`),
        { tol: 1e-6, fehler: [{ wert: au.p, text: zw(`Prozent heißt „von 100“: ${au.p} % = ${zt(au.p / 100, 2)}.`, `Percent means “per 100”: ${au.p} % = ${zt(au.p / 100, 2)}.`) }], hinweis: `${au.p} ÷ 100`, erkl: `tan α = ${zt(au.p / 100, 2)}`, wertText: zt(au.p / 100, 2) }),
      zr("tp-a", zw("Steigungswinkel", "Angle"), "α ≈", au.wert, zw("Jetzt tan⁻¹.", "Now tan⁻¹."),
        { einheit: "°", tol: 0.05, fehler: [{ wert: au.falsch, tol: 0.1, text: zw(`tan⁻¹(${au.p}) wäre fast senkrecht – nimm tan⁻¹(${zt(au.p / 100, 2)}).`, `tan⁻¹(${au.p}) would be almost vertical – use tan⁻¹(${zt(au.p / 100, 2)}).`) }, radFehler(au.rad, 0.005)],
          hinweis: `tan⁻¹(${zt(au.p / 100, 2)})`, erkl: zw(`α ≈ ${zt(au.wert, 2)}° – ${au.p} % Steigung ist also viel flacher als ${au.p}°.`, `α ≈ ${zt(au.wert, 2)}° – so ${au.p} % is much flatter than ${au.p}°.`), wertText: zt(au.wert, 2), rundung: zw("Auf zwei Nachkommastellen.", "To two decimals.") }),
    ] : [
      zr("tp-p", zw("Steigung in Prozent", "Gradient in percent"), "p ≈", au.wert, zw("Auf 100 m waagerecht geht es $100 \\cdot \\tan α$ Meter hoch.", "Over 100 m horizontally it rises $100 \\cdot \\tan α$ metres."),
        { einheit: "%", tol: 0.05, fehler: [{ wert: au.falsch, tol: 0.01, text: zw("Grad und Prozent sind verschiedene Dinge – rechne 100 · tan α.", "Degrees and percent are different things – calculate 100 · tan α.") }, radFehler(au.rad, 0.05)],
          hinweis: `100·tan(${au.al})`, erkl: `p = 100 · tan ${au.al}° ≈ ${zt(au.wert, 2)} %`, wertText: zt(au.wert, 2), rundung: zw("Auf zwei Nachkommastellen.", "To two decimals.") }),
    ];
    if (au.art === "hoehe") {
      const st = [
        zr("th-h", au.auge ? zw("Höhe über Augenhöhe", "Height above eye level") : zw("Turmhöhe", "Tower height"), "h ≈", au.h1, zw("Gegeben: Ankathete (Entfernung) und Winkel. Gesucht: Gegenkathete. Das ist der Fall für tan.", "Given: adjacent (distance) and angle. Wanted: opposite. That's a job for tan."),
          { einheit: "m", tol: Math.max(0.02, au.h1 * 0.002), fehler: [{ wert: au.falsch, tol: 0.02, text: zw("sin passt nicht: Die Entfernung ist eine Kathete, keine Hypotenuse.", "sin doesn't fit: the distance is a leg, not the hypotenuse.") }, radFehler(au.rad), { wert: au.d / tanG(au.al), tol: 0.02, text: zw("Falsch umgestellt: h = Entfernung · tan α.", "Rearranged wrongly: h = distance · tan α.") }],
            hinweis: `${au.d}·tan(${au.al})`, erkl: `h = ${au.d} · tan ${au.al}° ≈ ${z2(au.h1)} m`, wertText: z2(au.h1), rundung: zw("Auf zwei Nachkommastellen.", "To two decimals.") }),
      ];
      if (au.auge) st.push(zr("th-g", zw("Gesamthöhe", "Total height"), "H ≈", au.wert, zw("Vergiss deine Augenhöhe nicht.", "Don't forget your eye height."),
        { einheit: "m", tol: Math.max(0.02, au.wert * 0.002), fehler: [{ wert: au.h1, tol: 0.02, text: zw("Gemessen wurde ab deinen Augen – addiere die Augenhöhe.", "You measured from your eyes – add the eye height.") }], hinweis: `${z2(au.h1)} + ${zt(au.auge, 1)}`, erkl: `H ≈ ${z2(au.h1)} + ${zt(au.auge, 1)} = ${z2(au.wert)} m`, wertText: z2(au.wert) }));
      return st;
    }
    return [
      ws("tsch-fn", zw("Welche Funktion?", "Which function?"), zw("Mast und Schatten sind die beiden Katheten. Welche Funktion verbindet sie?", "Pole and shadow are the two legs. Which function links them?"),
        [["sin", "sin"], ["cos", "cos"], ["tan", "tan"]], "tan", { hinweis: zw("Die Hypotenuse (der Sonnenstrahl) ist gar nicht bekannt.", "The hypotenuse (the sun ray) isn't known."), erkl: zw("tan α = Gegenkathete : Ankathete = Mast : Schatten", "tan α = opposite : adjacent = pole : shadow") }),
      zr("tsch-a", zw("Einfallswinkel", "Angle"), "α ≈", au.wert, zw(`$\\tan α = \\frac{${au.h}}{${au.s}}$ – jetzt tan⁻¹.`, `$\\tan α = \\frac{${au.h}}{${au.s}}$ – now tan⁻¹.`),
        { einheit: "°", tol: 0.1, fehler: [{ wert: au.kehr, tol: 0.1, text: zw("Kehrwert: Der Mast liegt dem Winkel gegenüber, der Schatten am Winkel.", "Reciprocal: the pole is opposite the angle, the shadow adjacent.") }, radFehler(au.rad, 0.01)],
          hinweis: `tan⁻¹(${au.h}÷${au.s})`, erkl: `α = tan⁻¹(${au.h} : ${au.s}) ≈ ${zt(au.wert, 1)}°`, wertText: zt(au.wert, 1), rundung: zw("Auf eine Nachkommastelle.", "To one decimal.") }),
    ];
  },
};

function KapitelTangens() {
  return (
    <>
      <Leitfrage nr={4}>{zw("Der Tangens – und wo man ihn braucht", "The tangent – and where you need it")}</Leitfrage>
      <Absatz>{zw("Sinus und Kosinus sind die Koordinaten von P. Der Tangens bekommt seinen eigenen Platz: Zeichne an den Einheitskreis die senkrechte Tangente im Punkt (1|0) und verlängere den Radius durch P, bis er sie im Punkt T trifft. Die Strecke von (1|0) bis T ist $\\tan α$ – sie liegt auf der Tangente, daher der Name.",
        "Sine and cosine are the coordinates of P. The tangent gets a place of its own: draw the vertical tangent to the unit circle at (1|0) and extend the radius through P until it meets it at T. The segment from (1|0) to T is $\\tan α$ – it lies on the tangent line, hence the name.")}</Absatz>
      <Absatz>{zw("Das kleine Dreieck mit den Katheten cos α und sin α und das große mit 1 und tan α sind ähnlich. Der Strahlensatz liefert:", "The small triangle with legs cos α and sin α and the large one with 1 and tan α are similar. The intercept theorem gives:")}</Absatz>
      <FormelBlock t={["\\tan α = \\frac{\\sin α}{\\cos α}", zw("\\tan α = \\frac{\\text{Gegenkathete}}{\\text{Ankathete}}", "\\tan α = \\frac{\\text{opposite}}{\\text{adjacent}}")]} />
      <Absatz>{zw("Wo braucht man ihn? Immer dann, wenn die Hypotenuse keine Rolle spielt und zwei Katheten zusammengehören: bei der Steigung einer Geraden ($m = \\tan α$), bei Straßen und Rampen (12 % Steigung heißt $\\tan α = 0{,}12$) und wenn man eine Höhe aus einer Entfernung und einem Höhenwinkel bestimmt.",
        "Where do you need it? Whenever the hypotenuse plays no role and the two legs belong together: for the slope of a line ($m = \\tan α$), for roads and ramps (12 % gradient means $\\tan α = 0.12$) and when you find a height from a distance and an angle of elevation.")}</Absatz>
      <TrigFilm art="tangens" />
      <TangensLabor />
      <Merke>
        <MS s={zw("tan 90° gibt es nicht: Dort ist $\\cos α = 0$, und die Gerade durch O und P läuft parallel zur Tangente. Für Winkel knapp unter 90° wird tan α riesig – eine sehr steile Gerade.",
          "tan 90° doesn't exist: there $\\cos α = 0$, and the line through O and P runs parallel to the tangent. For angles just below 90° tan α becomes huge – a very steep line.")} />
      </Merke>
      <Trenner />
      <UebenKopf>{zw("Steigungen, Höhen, Schatten", "Slopes, heights, shadows")}</UebenKopf>
      <UebenRahmen {...TA} fertig={zw("Richtig – der Tangens sitzt.", "Correct – the tangent is in place.")} />
    </>
  );
}

/* ============================================================
   KAPITEL 5 · SINUS- UND KOSINUSSATZ
   ============================================================ */
function neuesDreieck() {
  for (;;) {
    const al = 35 + Math.floor(Math.random() * 46), be = 30 + Math.floor(Math.random() * 46), ga = 180 - al - be;
    if (ga < 25) continue;
    const c = wahl([5, 6, 7, 8, 9, 10]);
    return { al, be, ga, c, a: c * sinG(al) / sinG(ga), b: c * sinG(be) / sinG(ga) };
  }
}
export function neueAllgAufgabe(artW) {
  const art = artW || wahl(["kos-seite", "kos-winkel", "sin-seite", "sin-winkel"]);
  const d = neuesDreieck();
  const a = r1(d.a), b = r1(d.b), c = d.c;
  if (art === "kos-seite") {
    const wert = Math.sqrt(b * b + c * c - 2 * b * c * cosG(d.al));
    return { id: ++zaehler, art, d, b, c, al: d.al, wert, ohne: Math.sqrt(b * b + c * c), rad: Math.sqrt(Math.abs(b * b + c * c - 2 * b * c * Math.cos(d.al))) };
  }
  if (art === "kos-winkel") {
    const q = (b * b + c * c - a * a) / (2 * b * c);
    return { id: ++zaehler, art, d, a, b, c, q, wert: acosG(q), rad: Math.acos(q) };
  }
  if (art === "sin-seite") {
    const wert = a * sinG(d.be) / sinG(d.al);
    return { id: ++zaehler, art, d, a, al: d.al, be: d.be, wert, kehr: a * sinG(d.al) / sinG(d.be), rad: a * Math.sin(d.be) / Math.sin(d.al) };
  }
  let A = a, B = b, AL = d.al;
  if (a < b) { A = b; B = a; AL = d.be; }
  const q = B * sinG(AL) / A;
  return { id: ++zaehler, art, d, a: A, b: B, al: AL, getauscht: a < b, q, wert: asinG(q), rad: Math.asin(q) };
}

export function allgSchritte(au) {
  const R = { feld: TrigFeld, lies: trigLies };
  const satzFrage = { id: "a-satz", titel: zw("Welcher Satz?", "Which law?"), typ: "wahl",
    frage: zw("Welcher Satz führt hier zum Ziel?", "Which law gets you there?"),
    optionen: [["sin", zw("Sinussatz", "Law of sines")], ["kos", zw("Kosinussatz", "Law of cosines")], ["pyth", zw("Satz des Pythagoras", "Pythagorean theorem")]],
    richtig: au.art.startsWith("kos") ? "kos" : "sin",
    fehler: [{ wahl: "pyth", text: zw("Pythagoras gilt nur im rechtwinkligen Dreieck – hier gibt es keinen rechten Winkel.", "Pythagoras only holds in right triangles – there's no right angle here.") },
      au.art.startsWith("kos")
        ? { wahl: "sin", text: zw("Für den Sinussatz brauchst du ein Paar aus Seite und gegenüberliegendem Winkel – das fehlt hier.", "The law of sines needs a pair of a side and its opposite angle – that's missing here.") }
        : { wahl: "kos", text: zw("Hier kennst du ein Paar aus Seite und gegenüberliegendem Winkel – das ist der Fall für den Sinussatz.", "You know a pair of a side and its opposite angle – that's a case for the law of sines.") }],
    hinweise: [zw("Gibt es ein Paar „Seite + gegenüberliegender Winkel“? Dann Sinussatz. Sonst (SWS oder SSS) Kosinussatz.", "Is there a pair “side + opposite angle”? Then law of sines. Otherwise (SAS or SSS) law of cosines.")],
    erklaerung: au.art.startsWith("kos") ? zw("Kosinussatz: zwei Seiten und der eingeschlossene Winkel (SWS) oder drei Seiten (SSS).", "Law of cosines: two sides and the included angle (SAS) or three sides (SSS).") : zw("Sinussatz: Ein Paar aus Seite und Gegenwinkel ist bekannt.", "Law of sines: a pair of a side and its opposite angle is known.") };
  if (au.art === "kos-seite") return [satzFrage,
    { id: "a-kos-a", titel: zw("Seite a", "Side a"), typ: "zahl", text: "a ≈", einheit: "cm", wert: au.wert, toleranz: 0.02, wertText: z2(au.wert), rundung: zw("Auf zwei Nachkommastellen – oder tipp die ganze Rechnung ein.", "To two decimals – or type the whole calculation."), ...R,
      frage: <M t="a^2 = b^2 + c^2 − 2bc \cdot \cos α" />,
      fehler: [{ wert: au.ohne, toleranz: 0.02, text: zw("Das „− 2bc · cos α“ fehlt – ohne ihn wäre es Pythagoras.", "The “− 2bc · cos α” is missing – without it, it would be Pythagoras.") }, radFehler(au.rad),
        { wert: au.wert * au.wert, toleranz: 0.05, text: zw("Das ist a². Zieh noch die Wurzel.", "That's a². Take the square root.") }],
      hinweise: [<M key="h" t={`a^2 = ${tex(au.b, 1)}^2 + ${au.c}^2 − 2 \\cdot ${tex(au.b, 1)} \\cdot ${au.c} \\cdot \\cos ${au.al}°`} />, `√(${zt(au.b, 1)}²+${au.c}²−2·${zt(au.b, 1)}·${au.c}·cos(${au.al}))`],
      erklaerung: <span><M t={`a = \\sqrt{${tex(au.b, 1)}^2 + ${au.c}^2 − 2 \\cdot ${tex(au.b, 1)} \\cdot ${au.c} \\cdot \\cos ${au.al}°}`} /> ≈ {z2(au.wert)} cm</span> }];
  if (au.art === "kos-winkel") return [satzFrage,
    { id: "a-kos-q", titel: "cos α", typ: "zahl", text: "cos α ≈", wert: au.q, toleranz: 0.0015, wertText: zt(au.q, 3), rundung: zw("Auf drei Nachkommastellen.", "To three decimals."), ...R,
      frage: <span>{zw("Stelle den Kosinussatz nach cos α um:", "Rearrange the law of cosines for cos α:")} <M t="\cos α = \frac{b^2 + c^2 − a^2}{2bc}" /></span>,
      fehler: [{ wert: (au.a * au.a - au.b * au.b - au.c * au.c) / (2 * au.b * au.c), toleranz: 0.0015, text: zw("Vorzeichen: Im Zähler steht b² + c² − a².", "Sign: the numerator is b² + c² − a².") }],
      hinweise: [<M key="h" t={`\\cos α = \\frac{${tex(au.b, 1)}^2 + ${au.c}^2 − ${tex(au.a, 1)}^2}{2 \\cdot ${tex(au.b, 1)} \\cdot ${au.c}}`} />], erklaerung: `cos α ≈ ${zt(au.q, 3)}` },
    { id: "a-kos-al", titel: zw("Winkel α", "Angle α"), typ: "zahl", text: "α ≈", einheit: "°", wert: au.wert, toleranz: 0.15, wertText: zt(au.wert, 1), rundung: zw("Auf eine Nachkommastelle.", "To one decimal."), ...R,
      frage: zw("Wende cos⁻¹ an.", "Apply cos⁻¹."), fehler: [radFehler(au.rad, 0.01)], hinweise: [zw("Taste cos⁻¹, Modus DEG.", "Key cos⁻¹, mode DEG.")], erklaerung: `α = cos⁻¹(${zt(au.q, 3)}) ≈ ${zt(au.wert, 1)}°` }];
  if (au.art === "sin-seite") return [satzFrage,
    { id: "a-sin-b", titel: zw("Seite b", "Side b"), typ: "zahl", text: "b ≈", einheit: "cm", wert: au.wert, toleranz: 0.02, wertText: z2(au.wert), rundung: zw("Auf zwei Nachkommastellen.", "To two decimals."), ...R,
      frage: <span><M t="\frac{b}{\sin β} = \frac{a}{\sin α}" /> {zw("– nach b umstellen.", "– solve for b.")}</span>,
      fehler: [{ wert: au.kehr, toleranz: 0.02, text: zw("sin α und sin β vertauscht: b gehört zu β.", "sin α and sin β swapped: b belongs to β.") }, radFehler(au.rad)],
      hinweise: [<M key="h" t={`b = \\frac{${tex(au.a, 1)} \\cdot \\sin ${au.be}°}{\\sin ${au.al}°}`} />],
      erklaerung: <span><M t={`b = \\frac{${tex(au.a, 1)} \\cdot \\sin ${au.be}°}{\\sin ${au.al}°}`} /> ≈ {z2(au.wert)} cm</span> }];
  return [satzFrage,
    { id: "a-sin-q", titel: "sin β", typ: "zahl", text: "sin β ≈", wert: au.q, toleranz: 0.0015, wertText: zt(au.q, 3), rundung: zw("Auf drei Nachkommastellen.", "To three decimals."), ...R,
      frage: <span><M t="\frac{\sin β}{b} = \frac{\sin α}{a}" /> {zw("– nach sin β umstellen.", "– solve for sin β.")}</span>,
      fehler: [{ wert: au.a * sinG(au.al) / au.b, toleranz: 0.0015, text: zw("a und b vertauscht – ein Sinus ist nie größer als 1.", "a and b swapped – a sine is never larger than 1.") }],
      hinweise: [<M key="h" t={`\\sin β = \\frac{${tex(au.b, 1)} \\cdot \\sin ${au.al}°}{${tex(au.a, 1)}}`} />], erklaerung: `sin β ≈ ${zt(au.q, 3)}` },
    { id: "a-sin-be", titel: zw("Winkel β", "Angle β"), typ: "zahl", text: "β ≈", einheit: "°", wert: au.wert, toleranz: 0.15, wertText: zt(au.wert, 1), rundung: zw("Auf eine Nachkommastelle.", "To one decimal."), ...R,
      frage: zw("Wende sin⁻¹ an. Da b < a, ist β kleiner als α – also spitz und eindeutig.", "Apply sin⁻¹. Since b < a, β is smaller than α – acute and unique."),
      fehler: [radFehler(au.rad, 0.01), { wert: 180 - au.wert, toleranz: 0.15, text: zw("Das wäre die stumpfe Lösung. Gegenüber der kürzeren Seite liegt der kleinere Winkel – β ist spitz.", "That would be the obtuse solution. The smaller angle is opposite the shorter side – β is acute.") }],
      hinweise: [zw("Taste sin⁻¹, Modus DEG.", "Key sin⁻¹, mode DEG.")], erklaerung: `β = sin⁻¹(${zt(au.q, 3)}) ≈ ${zt(au.wert, 1)}°` }];
}

const SA_TITEL = { "kos-seite": ["Kosinussatz: Seite (SWS)", "Cosines: side (SAS)"], "kos-winkel": ["Kosinussatz: Winkel (SSS)", "Cosines: angle (SSS)"], "sin-seite": ["Sinussatz: Seite (WSW)", "Sines: side (ASA)"], "sin-winkel": ["Sinussatz: Winkel (SsW)", "Sines: angle (SsA)"] };
const SA = {
  titel: SA_TITEL, arten: ["kos-seite", "kos-winkel", "sin-seite", "sin-winkel"], neue: (art) => neueAllgAufgabe(art || undefined), schritte: allgSchritte,
  text: (au) => {
    const z = zw(" Die Skizze ist nicht maßstabsgetreu.", " The sketch is not to scale.");
    if (au.art === "kos-seite") return zw(`Gegeben: b = ${zt(au.b, 1)} cm, c = ${au.c} cm, α = ${au.al}°. Berechne a.`, `Given: b = ${zt(au.b, 1)} cm, c = ${au.c} cm, α = ${au.al}°. Find a.`) + z;
    if (au.art === "kos-winkel") return zw(`Gegeben: a = ${zt(au.a, 1)} cm, b = ${zt(au.b, 1)} cm, c = ${au.c} cm. Berechne α.`, `Given: a = ${zt(au.a, 1)} cm, b = ${zt(au.b, 1)} cm, c = ${au.c} cm. Find α.`) + z;
    if (au.art === "sin-seite") return zw(`Gegeben: a = ${zt(au.a, 1)} cm, α = ${au.al}°, β = ${au.be}°. Berechne b.`, `Given: a = ${zt(au.a, 1)} cm, α = ${au.al}°, β = ${au.be}°. Find b.`) + z;
    return zw(`Gegeben: a = ${zt(au.a, 1)} cm, b = ${zt(au.b, 1)} cm, α = ${au.al}°. Berechne β.`, `Given: a = ${zt(au.a, 1)} cm, b = ${zt(au.b, 1)} cm, α = ${au.al}°. Find β.`) + z;
  },
  skizze: (au) => {
    const d = au.d;
    const ecken = { A: [0, 0], B: [d.c, 0], Cc: [d.b * cosG(d.al), d.b * sinG(d.al)] };
    let beschr, boegen;
    if (au.art === "kos-seite") { beschr = { a: "?", b: `b = ${zt(au.b, 1)}`, c: `c = ${au.c}`, al: grad(au.al, 0) }; boegen = ["al"]; }
    else if (au.art === "kos-winkel") { beschr = { a: `a = ${zt(au.a, 1)}`, b: `b = ${zt(au.b, 1)}`, c: `c = ${au.c}`, al: "?" }; boegen = ["al"]; }
    else if (au.art === "sin-seite") { beschr = { a: `a = ${zt(au.a, 1)}`, b: "?", al: grad(au.al, 0), be: grad(au.be, 0) }; boegen = ["al", "be"]; }
    else {
      if (au.getauscht) { ecken.A = [d.c, 0]; ecken.B = [0, 0]; }
      beschr = { a: `a = ${zt(au.a, 1)}`, b: `b = ${zt(au.b, 1)}`, al: grad(au.al, 0), be: "?" }; boegen = ["al", "be"];
    }
    return <Dreieck A={ecken.A} B={ecken.B} Cc={ecken.Cc} beschr={beschr} winkelBogen={boegen} hoehe={190} />;
  },
  hilfe: (au) => hilfeT(`trig-a-${au.art}`),
};

function KapitelSaetze() {
  const zeilen = [
    ["SSS", zw("drei Seiten", "three sides"), zw("Kosinussatz", "law of cosines")],
    ["SWS", zw("zwei Seiten, eingeschlossener Winkel", "two sides, included angle"), zw("Kosinussatz", "law of cosines")],
    ["WSW / SWW", zw("eine Seite, zwei Winkel", "one side, two angles"), zw("Sinussatz", "law of sines")],
    ["SsW", zw("zwei Seiten, Winkel gegenüber der größeren", "two sides, angle opposite the longer"), zw("Sinussatz", "law of sines")],
  ];
  return (
    <>
      <Leitfrage nr={5}>{zw("Ohne rechten Winkel: Sinussatz und Kosinussatz", "Without a right angle: laws of sines and cosines")}</Leitfrage>
      <Absatz>{zw("sin, cos und tan als Seitenverhältnisse funktionieren nur im rechtwinkligen Dreieck. Der Trick für alle anderen Dreiecke: Man zeichnet eine Höhe ein. Sie zerlegt das Dreieck in zwei rechtwinklige Dreiecke – und dort darf man wieder mit sin und cos rechnen.",
        "sin, cos and tan as side ratios only work in right triangles. The trick for all other triangles: draw a height. It splits the triangle into two right triangles – where sin and cos work again.")}</Absatz>
      <Absatz>{zw("Drückt man die Höhe h auf zwei Arten aus, $h = b \\cdot \\sin α$ und $h = a \\cdot \\sin β$, entsteht der Sinussatz:", "Writing the height h in two ways, $h = b \\cdot \\sin α$ and $h = a \\cdot \\sin β$, gives the law of sines:")}</Absatz>
      <FormelBlock t={["\\frac{a}{\\sin α} = \\frac{b}{\\sin β} = \\frac{c}{\\sin γ}"]} />
      <TrigFilm art="sinussatz" />
      <Absatz>{zw("Kennt man kein Paar aus Seite und Gegenwinkel, hilft der Kosinussatz. Die Höhe teilt c in die Stücke $p = b \\cdot \\cos α$ und $c − p$; zweimal Pythagoras ergibt:", "If no pair of side and opposite angle is known, the law of cosines helps. The height splits c into $p = b \\cdot \\cos α$ and $c − p$; Pythagoras twice gives:")}</Absatz>
      <FormelBlock t={["a^2 = b^2 + c^2 − 2bc \\cdot \\cos α"]} />
      <TrigFilm art="kosinussatz" />
      <div style={{ ...karte, marginTop: 16 }}>
        <p style={kicker}>{zw("Welcher Satz wann?", "Which law when?")}</p>
        {zeilen.map(([k, t, s]) => (
          <div key={k} style={{ display: "grid", gridTemplateColumns: "84px 1fr auto", gap: 10, alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${C.linie}` }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: C.see }}>{k}</span>
            <span style={{ fontSize: 13.5, color: C.tinte, lineHeight: 1.45 }}>{t}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: s.startsWith("Kos") || s.startsWith("law of c") ? C.smaragd : "#8A6A00", textAlign: "right" }}>{s}</span>
          </div>
        ))}
        <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, margin: "10px 0 0" }}>
          {zw("Faustregel: Kennst du eine Seite und den Winkel gegenüber, nimm den Sinussatz. Sonst den Kosinussatz. Und gibt es doch einen rechten Winkel, reichen sin, cos und tan.", "Rule of thumb: if you know a side and the angle opposite it, use the law of sines. Otherwise the law of cosines. And if there is a right angle after all, sin, cos and tan are enough.")}
        </p>
      </div>
      <Trenner />
      <UebenKopf>{zw("Dreiecke ohne rechten Winkel berechnen", "Solving triangles without a right angle")}</UebenKopf>
      <UebenRahmen {...SA} fertig={zw("Richtig – Satz gewählt und sauber berechnet.", "Correct – law chosen and calculated.")} />
    </>
  );
}

/* ============================================================
   KAPITEL 6 · ALLES GEMISCHT
   ============================================================ */
const SETS = { ek: EK, bm: BM, rw: RW, tan: TA, saetze: SA };
const MIX_TITEL = { ek: ["Einheitskreis", "Unit circle"], bm: ["Grad und Bogenmaß", "Degrees and radians"], rw: ["Rechtwinkliges Dreieck", "Right triangle"], tan: ["Tangens", "Tangent"], saetze: ["Sinus- und Kosinussatz", "Sines and cosines"] };
const MIX = {
  titel: MIX_TITEL, arten: Object.keys(SETS),
  neue: (art) => { const k = art || wahl(Object.keys(SETS)); const au = SETS[k].neue(null); return { ...au, art: k, sub: au.art, id: au.id * 10 + Object.keys(SETS).indexOf(k) }; },
  text: (au) => SETS[au.art].text({ ...au, art: au.sub }),
  skizze: (au) => SETS[au.art].skizze({ ...au, art: au.sub }),
  schritte: (au) => SETS[au.art].schritte({ ...au, art: au.sub }),
  hilfe: (au) => SETS[au.art].hilfe({ ...au, art: au.sub }),
};

function KapitelMix() {
  return (
    <>
      <Leitfrage nr={6}>{zw("Alles gemischt – wie in der Klassenarbeit", "Everything mixed – like in a test")}</Leitfrage>
      <Absatz>{zw("Jetzt kommen die Aufgaben aus allen fünf Kapiteln durcheinander. Die eigentliche Kunst ist, zu erkennen, welches Werkzeug passt: Einheitskreis, Bogenmaß, sin/cos/tan, Sinus- oder Kosinussatz.",
        "Now exercises from all five chapters come in random order. The real skill is recognising which tool fits: unit circle, radians, sin/cos/tan, law of sines or cosines.")}</Absatz>
      <div style={{ ...karte, marginTop: 6 }}>
        <p style={kicker}>{zw("Spickzettel", "Cheat sheet")}</p>
        <div style={{ display: "grid", gap: 8, fontSize: 15, color: C.tinte }}>
          <M t="P = (\cos α \mid \sin α), \quad \sin^2 α + \cos^2 α = 1" />
          <M t="x = α \cdot \frac{π}{180°}" />
          <M t={zw("\\sin α = \\frac{GK}{H}, \\quad \\cos α = \\frac{AK}{H}, \\quad \\tan α = \\frac{GK}{AK} = \\frac{\\sin α}{\\cos α}", "\\sin α = \\frac{opp}{hyp}, \\quad \\cos α = \\frac{adj}{hyp}, \\quad \\tan α = \\frac{opp}{adj} = \\frac{\\sin α}{\\cos α}")} />
          <M t="\frac{a}{\sin α} = \frac{b}{\sin β} = \frac{c}{\sin γ}" />
          <M t="a^2 = b^2 + c^2 − 2bc \cdot \cos α" />
        </div>
      </div>
      <Trenner />
      <UebenKopf>{zw("Gemischtes Training", "Mixed training")}</UebenKopf>
      <UebenRahmen {...MIX} fertig={zw("Richtig gelöst.", "Solved.")} />
    </>
  );
}

/* ============================================================
   SEITE
   ============================================================ */
const KAPITEL = [
  ["einheitskreis", zw("Einheits­kreis", "Unit circle"), KapitelEinheitskreis],
  ["bogenmass", zw("Grad und Bogen­maß", "Degrees & radians"), KapitelBogenmass],
  ["dreieck", zw("Recht­winkliges Dreieck", "Right triangle"), KapitelDreieck],
  ["tangens", zw("Tangens", "Tangent"), KapitelTangens],
  ["saetze", zw("Sinus- und Kosinus­satz", "Sines & cosines"), KapitelSaetze],
  ["mix", zw("Alles gemischt", "All mixed"), KapitelMix],
];
const SPEICHER = "matheplus-trig-kapitel";

function Lernweg({ kap, setKap }) {
  return (
    <nav aria-label={zw("Kapitel", "Chapters")} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, marginTop: 4 }}>
      {KAPITEL.map(([id, name], i) => {
        const an = kap === id;
        return (
          <button key={id} type="button" aria-current={an ? "step" : undefined} onClick={() => setKap(id)} data-kapitel={id}
            style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 52, padding: "8px 10px", borderRadius: 14, cursor: "pointer", fontFamily: "inherit", textAlign: "left",
              border: `1.5px solid ${an ? C.see : C.linie}`, background: an ? C.see : C.weiss, color: an ? C.weiss : C.see }}>
            <span style={{ width: 24, height: 24, borderRadius: 999, flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800,
              background: an ? C.flaggold : C.himmel, color: C.seeTief }}>{i + 1}</span>
            <span style={{ fontSize: 12.5, fontWeight: 700, lineHeight: 1.25, hyphens: "manual", overflowWrap: "break-word", minWidth: 0 }}>{name}</span>
          </button>
        );
      })}
    </nav>
  );
}

export function TrigonometrieDreieck() {
  const [kap, setKapRoh] = useState(() => {
    try { const k = localStorage.getItem(SPEICHER); return KAPITEL.some(([id]) => id === k) ? k : "einheitskreis"; } catch (e) { return "einheitskreis"; }
  });
  const oben = useRef(null);
  const erstes = useRef(true);
  const quelle = useRef("trigo-kapitel");   // Sprung-Schalter: Leiste oben oder „Weiter“-Knopf unten
  const setKap = (k, q = "trigo-kapitel") => { quelle.current = q; setKapRoh(k); try { localStorage.setItem(SPEICHER, k); } catch (e) { /* ohne Speicher */ } };
  useEffect(() => {
    if (erstes.current) { erstes.current = false; return; }
    springe(quelle.current, () => oben.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }, [kap]);
  const idx = KAPITEL.findIndex(([id]) => id === kap);
  const Inhalt = KAPITEL[idx][2];
  const naechstes = KAPITEL[idx + 1];
  return (
    <Seite titel={zw("Trigonometrie vom Einheitskreis aus", "Trigonometry from the unit circle")}
      text={zw("Erst verstehen, was sin, cos und tan wirklich sind – dann damit rechnen: im Einheitskreis, im rechtwinkligen Dreieck und mit Sinus- und Kosinussatz in jedem Dreieck.",
        "First understand what sin, cos and tan really are – then calculate with them: in the unit circle, in right triangles and with the laws of sines and cosines in any triangle.")}>
      <div ref={oben} style={{ scrollMarginTop: 80 }} />
      <Lernweg kap={kap} setKap={setKap} />
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, marginTop: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: C.grau }}>{zw("Rechner:", "Calculator:")}</span>
        <WinkelSchalter klein />
      </div>
      <div key={kap}><Inhalt /></div>
      {naechstes && (
        <button type="button" onClick={() => setKap(naechstes[0], "lernweg-weiter")}
          style={{ width: "100%", marginTop: 26, minHeight: 56, borderRadius: 16, border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left", padding: "12px 18px",
            background: `linear-gradient(170deg, ${C.seeTief} 0%, ${C.see} 100%)`, color: C.weiss, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <span>
            <span style={{ display: "block", fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.flaggold }}>{zw(`Weiter mit Kapitel ${idx + 2}`, `On to chapter ${idx + 2}`)}</span>
            <span style={{ display: "block", fontSize: 16, fontWeight: 700 }}>{naechstes[1].replace(/­/g, "")}</span>
          </span>
          <span aria-hidden="true" style={{ fontSize: 22, color: C.flaggold }}>→</span>
        </button>
      )}
    </Seite>
  );
}
