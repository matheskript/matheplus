import React, { useMemo, useState } from "react";
import { C } from "./base1.jsx";
import { M, Text } from "./func3.jsx";
import { MatheFeld } from "./matheTastatur.jsx";
import { FLIESS, KARTE, ZELLE, Formeln, Schritt, Kasten, Chip, PlusMinus, Kicker, H3, Trenner, Inline, RoterFaden, Kolloquium } from "./funcGfsBausteine.jsx";
import { lauf } from "./funcErklaeranimation.jsx";
import { AnimKarte } from "./funcAnimKarte.jsx";
import {
  dk, rate, loesung, euler, wendezeit, maxRate, ANIM, EULER_TABELLE, DATEN, differenzen, quotienten,
  ARTEN, aufgabe, felder, auftrag, pruefe, rechenweg, tipp, RUNDUNG, GLIEDERUNG, TIPPS, KOLLOQUIUM,
} from "./gfsWachstum.js";

/* ============================================================
   Kurs GFS – Themenseite „Wachstum und Differenzialgleichungen“
   (Kursstufe 1, Kapitel II Exponential- und Logarithmusfunktionen)
   Aufbau wie das Ziegenproblem: Leitfrage · Herleitung in sechs Schritten
   (DGL und Lösung durch Einsetzen, exponentiell mit Eindeutigkeitsbeweis,
   beschränkt über den Abstand zur Schranke, logistisch über den Kehrwert
   mit Wendepunkt, Richtungsfeld und Euler-Verfahren, Messreihen und
   Modellgrenzen) · fünf Erkläranimationen · Labor (Modell, k, S, f(0),
   Richtungsfeld mit Lösung und Euler-Streckenzug, f′ gegen f) · Übungen
   aus vier Generatoren · roter Faden · Kolloquium.
   Logik in gfsWachstum.js (tests/gfsWachstum.test.mjs).
   ============================================================ */

const KNOPF = (aktiv = true, farbe = C.see) => ({
  background: aktiv ? farbe : C.hellgrau, color: C.weiss, border: "none", borderRadius: 999, fontSize: 15, fontWeight: 600,
  fontFamily: "inherit", cursor: aktiv ? "pointer" : "default",
});
const LINK = { background: "none", border: "none", color: C.see, fontSize: 13, fontFamily: "inherit", cursor: "pointer", padding: 0, textDecoration: "underline" };
/* aktuelle Aufgabe für automatische Prüfungen (tests/ui/gfswachstum.ui.py) */
const merk = (a) => { if (typeof window !== "undefined") window.__gwAufgabe = a; return a; };

const T = (props) => <text fontFamily="inherit" {...props} />;
const mix = (a, b, p) => a + (b - a) * p;
const fenster = (t, a, b, c, d) => lauf(t, a, b) * (1 - lauf(t, c, d));
const klemm = (v, a, b) => Math.min(b, Math.max(a, v));
const pfad = (pts) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join("");
/* Kurve y = f(t) von … bis, in Bildkoordinaten */
function kurvenPfad(f, von, bis, sx, sy, schritt = 0.05) {
  if (bis - von < 1e-6) return "";
  const pts = [];
  for (let t = von; t < bis - 1e-9; t += schritt) pts.push([sx(t), sy(f(t))]);
  pts.push([sx(bis), sy(f(bis))]);
  return pfad(pts);
}
/* Streckenzug bis zum Anteil 0 … 1 seiner Strecken */
function teilZug(pts, anteil) {
  const n = pts.length - 1, s = klemm(anteil, 0, 1) * n, i = Math.floor(s), r = s - i;
  const aus = pts.slice(0, i + 1);
  if (i < n && r > 0) aus.push([mix(pts[i][0], pts[i + 1][0], r), mix(pts[i][1], pts[i + 1][1], r)]);
  return aus;
}
/* hochgestellter Teil in SVG-Text (am Ende einer Zeile) */
const Hoch = ({ children }) => <tspan dy="-6" fontSize="0.72em">{children}</tspan>;

function Pille({ x, y, text, o = 1, farbe = C.see, voll = false, breite, gross = 12 }) {
  if (o <= 0.001) return null;
  const w = breite || Math.max(40, String(text).length * gross * 0.58 + 20);
  return (
    <g opacity={o}>
      <rect x={x - w / 2} y={y - gross - 4} width={w} height={gross + 12} rx={(gross + 12) / 2} fill={voll ? farbe : C.weiss} stroke={farbe} strokeWidth="1.4" />
      <T x={x} y={y + 1} textAnchor="middle" fontSize={gross} fontWeight="800" fill={voll ? C.weiss : farbe}>{text}</T>
    </g>
  );
}

/* Achsenkreuz: xt/yt = [[Wert, Beschriftung]] */
function Achsen({ x0, x1, y0, y1, tx, ty, xt = [], yt = [], o = 1, nameX, nameY }) {
  if (o <= 0.001) return null;
  return (
    <g opacity={o}>
      <line x1={x0} y1={y0} x2={x1 + 8} y2={y0} stroke={C.tinte} strokeWidth="1.2" />
      <path d={`M${x1 + 8} ${y0 - 3.5} L${x1 + 13} ${y0} L${x1 + 8} ${y0 + 3.5}`} fill={C.tinte} />
      <line x1={x0} y1={y0} x2={x0} y2={y1 - 6} stroke={C.tinte} strokeWidth="1.2" />
      <path d={`M${x0 - 3.5} ${y1 - 4} L${x0} ${y1 - 9} L${x0 + 3.5} ${y1 - 4}`} fill={C.tinte} />
      {xt.map(([w, s]) => (
        <g key={`x${w}`}>
          <line x1={tx(w)} y1={y0} x2={tx(w)} y2={y0 + 4} stroke={C.tinte} strokeWidth="1" />
          <T x={tx(w)} y={y0 + 15} textAnchor="middle" fontSize="10.5" fill={C.grau}>{s}</T>
        </g>
      ))}
      {yt.map(([w, s]) => (
        <g key={`y${w}`}>
          <line x1={x0 - 4} y1={ty(w)} x2={x0} y2={ty(w)} stroke={C.tinte} strokeWidth="1" />
          <T x={x0 - 7} y={ty(w) + 3.5} textAnchor="end" fontSize="10.5" fill={C.grau}>{s}</T>
        </g>
      ))}
      {nameX && <T x={x1 + 13} y={y0 + 15} textAnchor="end" fontSize="11" fontWeight="700" fill={C.grau}>{nameX}</T>}
      {nameY && <T x={x0 + 8} y={y1 - 2} fontSize="11" fontWeight="700" fill={C.grau}>{nameY}</T>}
    </g>
  );
}

/* Strichstück des Richtungsfelds: Mitte (x | y), Steigung m in Daten-Einheiten, sx/sy = Pixel je Einheit */
function Feldstrich({ x, y, m, sx, sy, l = 5, o = 1, farbe = C.hellgrau, breite = 1.3 }) {
  const dx = sx, dy = -sy * m, n = Math.hypot(dx, dy);
  return <line x1={x - (dx / n) * l} y1={y - (dy / n) * l} x2={x + (dx / n) * l} y2={y + (dy / n) * l} stroke={farbe} strokeWidth={breite} strokeLinecap="round" opacity={o} />;
}

/* ======================================================================
   Kopfbild (viewBox 160 × 120): logistisches Wachstum im Richtungsfeld von
   v′ = v · (1 − v) (S = 1, kS = 1). Jedes Strichstück hat genau die Steigung,
   die die DGL vorschreibt; die goldene Kurve v(t) = 1 / (1 + 99e^(−t)) folgt
   ihnen, der Wendepunkt liegt bei t = ln 99, v = S/2.
   ====================================================================== */
export function WachstumBild() {
  const X0 = 14, SX = 13.4, Y0 = 100, SY = 76;
  const x = (t) => X0 + t * SX, y = (v) => Y0 - v * SY;
  const v = (t) => 1 / (1 + 99 * Math.exp(-t));
  const tw = Math.log(99);
  const striche = [];
  for (let i = 0; i < 10; i++) for (let j = 0; j < 5; j++) {
    const t = 0.5 + i, h = 0.1 + 0.2 * j, m = h * (1 - h);
    const dx = SX, dy = -SY * m, n = Math.hypot(dx, dy), l = 3.3;
    striche.push(<line key={`${i}-${j}`} x1={x(t) - (dx / n) * l} y1={y(h) - (dy / n) * l} x2={x(t) + (dx / n) * l} y2={y(h) + (dy / n) * l}
      stroke="rgba(255,255,255,0.34)" strokeWidth="0.9" strokeLinecap="round" />);
  }
  return (
    <svg className="gtk-bild" viewBox="0 0 160 120" role="img" style={{ maxWidth: 320, marginLeft: "auto", marginRight: "auto" }}
      aria-label="Logistisches Wachstum im Richtungsfeld: Die goldene Kurve folgt überall den vorgeschriebenen Steigungen und hat ihren Wendepunkt bei der halben Schranke">
      <defs>
        <radialGradient id="gtk-w-glut" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#EDBB00" stopOpacity="0.6" /><stop offset="100%" stopColor="#EDBB00" stopOpacity="0" /></radialGradient>
        <linearGradient id="gtk-w-gold" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#C9971A" /><stop offset="55%" stopColor="#EDBB00" /><stop offset="100%" stopColor="#FFE9A0" /></linearGradient>
      </defs>
      <ellipse className="gtk-glimmen" cx={x(tw)} cy={y(0.5)} rx="26" ry="24" fill="url(#gtk-w-glut)" />
      <line x1={X0} y1={Y0} x2="152" y2={Y0} stroke="rgba(255,255,255,0.45)" strokeWidth="0.8" />
      <line x1={X0} y1={Y0} x2={X0} y2="16" stroke="rgba(255,255,255,0.45)" strokeWidth="0.8" />
      <g className="gtk-auf">{striche}</g>
      <g className="gtk-auf" style={{ animationDelay: ".2s" }}>
        <line x1={X0} y1={y(1)} x2="150" y2={y(1)} stroke="#FFE9A0" strokeOpacity="0.75" strokeWidth="0.8" strokeDasharray="2.4 2" />
        <T x="153" y={y(1) + 2.2} fontFamily="Montserrat, sans-serif" fontSize="6.5" fontWeight="800" fill="#FFE9A0">S</T>
        <path d={kurvenPfad(v, 0, 10, x, y, 0.1)} fill="none" stroke="url(#gtk-w-gold)" strokeWidth="2.4" strokeLinecap="round" />
      </g>
      <g className="gtk-auf" style={{ animationDelay: ".45s" }}>
        <line x1={X0} y1={y(0.5)} x2={x(tw)} y2={y(0.5)} stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="0.7" strokeDasharray="1.8 1.8" />
        <T x={X0 - 2} y={y(0.5) + 2.2} textAnchor="end" fontFamily="Montserrat, sans-serif" fontSize="5.6" fontWeight="700" fill="rgba(255,255,255,0.8)">S/2</T>
        <circle cx={x(tw)} cy={y(0.5)} r="2.6" fill="#EDBB00" stroke="#FFF6D6" strokeWidth="0.8" />
      </g>
      <g className="gtk-auf" style={{ animationDelay: ".7s" }}>
        <rect x="19" y="27" width="76" height="14" rx="7" fill="#EDBB00" />
        <T x="57" y="36.6" textAnchor="middle" fontFamily="Montserrat, sans-serif" fontSize="7" fontWeight="800" fill="#0B0C10">f′ = k · f · (S − f)</T>
      </g>
    </svg>
  );
}

/* ======================================================================
   Erkläranimationen (Szenen sind reine Funktionen der Zeit; Schlussbild = Standbild)
     feld        – Richtungsfeld von f′ = 0,5 · (8 − f), Lösungen zu drei Startwerten
     exp         – doppelter Bestand, doppelte Steigung; Verdopplung alle 2 Zeiteinheiten
     beschraenkt – Tee: Abstand zu 20 °C halbiert sich alle 6,93 Minuten
     logistisch  – S-Kurve oben, Parabel f′ gegen f unten, Wendepunkt bei S/2
     euler       – Streckenzüge mit Δt = 1; 0,5; 0,25 gegen die exakte Lösung
   ====================================================================== */

/* 1 · Richtungsfeld */
const FD = { X0: 44, X1: 336, Y0: 252, Y1: 40, T: 8, Y: 12 };
const fdx = (t) => FD.X0 + (t / FD.T) * (FD.X1 - FD.X0);
const fdy = (v) => FD.Y0 - (v / FD.Y) * (FD.Y0 - FD.Y1);
const FD_DAUER = 20;
const fdSchritte = () => [
  { von: 0, text: "Die DGL f′ = 0,5 · (8 − f) sagt nicht, wie groß f ist – nur, wie schnell sich f gerade ändert." },
  { von: 3.5, text: "In jeder Höhe y schreibt sie eine Steigung vor: bei y = 2 die Steigung 3, bei y = 8 die Steigung 0. Das ist das Richtungsfeld." },
  { von: 8.5, text: "Ein Startwert legt fest, wo die Kurve beginnt – hier f(0) = 1. Von dort folgt sie überall den Strichen." },
  { von: 14, text: "Andere Startwerte geben andere Lösungen. Alle nähern sich der Höhe 8, wo die Steigung 0 ist." },
];
function fdZeichne(t) {
  const P = ANIM.feld, sx = (FD.X1 - FD.X0) / FD.T, sy = (FD.Y0 - FD.Y1) / FD.Y;
  const achse = lauf(t, 0.2, 1.2), kopf = lauf(t, 0.4, 1.4);
  const ruhe = 1 - 0.5 * lauf(t, 8.8, 9.8);
  const marken = fenster(t, 5.4, 6.4, 8.4, 9.2);
  const k1 = lauf(t, 9.2, 13), k2 = lauf(t, 14.4, 17.4), ziel = lauf(t, 15.2, 16.2);
  const lsg = (f0) => (x) => loesung("beschraenkt", { ...P, f0 }, x);
  const striche = [];
  for (let y = 1; y <= 11; y++) {
    const o = lauf(t, 3.7 + 0.2 * (y - 1), 4.5 + 0.2 * (y - 1)) * ruhe;
    if (o <= 0.001) continue;
    const m = rate("beschraenkt", P, y);
    for (let i = 0; i < 8; i++) striche.push(<Feldstrich key={`${y}-${i}`} x={fdx(0.5 + i)} y={fdy(y)} m={m} sx={sx} sy={sy} l={6.5} o={o} farbe={C.see} breite={1.4} />);
  }
  const ende1 = FD.T * k1;
  return (
    <g>
      <Achsen x0={FD.X0} x1={FD.X1} y0={FD.Y0} y1={FD.Y1} tx={fdx} ty={fdy} o={achse} nameX="t" nameY="y"
        xt={[0, 2, 4, 6, 8].map((v) => [v, String(v)])} yt={[[4, "4"], [8, "8"], [12, "12"]]} />
      <T x="196" y="20" textAnchor="middle" fontSize="13.5" fontWeight="800" fill={C.tinte} opacity={kopf}>f′ = 0,5 · (8 − f)</T>
      {striche}
      {ziel > 0.001 && (
        <g opacity={ziel}>
          <line x1={FD.X0} y1={fdy(8)} x2={FD.X1} y2={fdy(8)} stroke={C.gold} strokeWidth="1.3" strokeDasharray="5 4" />
          <T x={fdx(0.15)} y={fdy(8) + 15} fontSize="11.5" fontWeight="800" fill={C.gold}>Schranke 8</T>
        </g>
      )}
      {k2 > 0.001 && [4, 11].map((f0) => <path key={f0} d={kurvenPfad(lsg(f0), 0, FD.T * k2, fdx, fdy)} fill="none" stroke={C.seeTief} strokeWidth="2.3" strokeLinecap="round" />)}
      {k1 > 0.001 && <path d={kurvenPfad(lsg(1), 0, ende1, fdx, fdy)} fill="none" stroke={C.gold} strokeWidth="3" strokeLinecap="round" />}
      {t >= 8.6 && <circle cx={fdx(ende1)} cy={fdy(lsg(1)(ende1))} r="4.6" fill={C.flaggold} stroke={C.gold} strokeWidth="1.2" />}
      {t >= 8.6 && <T x={fdx(0) + 12} y={fdy(1) + 5} fontSize="11" fontWeight="800" fill={C.gold} opacity={lauf(t, 8.6, 9.4)}>f(0) = 1</T>}
      <Pille x={292} y={fdy(2) + 5} text="Steigung 3" o={marken} farbe={C.see} breite={86} gross={11} />
      <Pille x={292} y={fdy(8) + 5} text="Steigung 0" o={marken} farbe={C.gold} breite={86} gross={11} />
      <Pille x={292} y={fdy(11) + 5} text="Steigung −1,5" o={marken} farbe={C.signal} breite={100} gross={11} />
    </g>
  );
}

/* 2 · Exponentielles Wachstum */
const EP = { X0: 44, X1: 330, Y0: 252, Y1: 34, T: 6, Y: 8 };
const epx = (t) => EP.X0 + (t / EP.T) * (EP.X1 - EP.X0);
const epy = (v) => EP.Y0 - (v / EP.Y) * (EP.Y0 - EP.Y1);
const EP_DAUER = 20;
const epSchritte = () => [
  { von: 0, text: "Exponentielles Wachstum: Die Änderungsrate ist proportional zum Bestand, f′ = k · f. Hier ist f(0) = 1 und k ≈ 0,35." },
  { von: 3, text: "Wo der Bestand doppelt so groß ist, ist auch die Tangente doppelt so steil: Steigung 0,35, dann 0,69, dann 1,39." },
  { von: 9.5, text: "Darum braucht der Bestand für jede Verdopplung gleich lang – hier immer 2 Zeiteinheiten." },
  { von: 15.5, text: "Die Lösung ist f(t) = f(0) · e^(kt). Aus e^(kT) = 2 folgt die Verdopplungszeit T = ln 2 : k." },
];
function epZeichne(t) {
  const P = ANIM.exp, f = (x) => loesung("exp", P, x);
  const achse = lauf(t, 0.2, 1.2), kurve = lauf(t, 0.6, 2.8);
  const tangAus = 1 - 0.7 * lauf(t, 9.4, 10.2), zahlAus = 1 - lauf(t, 9.4, 10.2);
  const formel = lauf(t, 15.8, 17);
  return (
    <g>
      <Achsen x0={EP.X0} x1={EP.X1} y0={EP.Y0} y1={EP.Y1} tx={epx} ty={epy} o={achse} nameX="t" nameY="f(t)"
        xt={[0, 1, 2, 3, 4, 5, 6].map((v) => [v, String(v)])} yt={[[1, "1"], [2, "2"], [4, "4"], [8, "8"]]} />
      {kurve > 0.001 && <path d={kurvenPfad(f, 0, EP.T * kurve, epx, epy)} fill="none" stroke={C.gold} strokeWidth="2.8" strokeLinecap="round" />}
      {[0, 2, 4].map((a, i) => {
        const o = lauf(t, 3.4 + 1.7 * i, 4.4 + 1.7 * i) * tangAus;
        if (o <= 0.001) return null;
        const fa = f(a), m = P.k * fa, von = Math.max(0, a - 0.7), bis = a + 1.5;
        return (
          <g key={a} opacity={o}>
            <path d={`M${epx(a)} ${epy(fa)} L${epx(a + 1)} ${epy(fa)} L${epx(a + 1)} ${epy(fa + m)} Z`} fill={C.flaggold} opacity={0.3 * zahlAus} />
            <line x1={epx(von)} y1={epy(fa + m * (von - a))} x2={epx(bis)} y2={epy(fa + m * (bis - a))} stroke={C.see} strokeWidth="1.8" strokeLinecap="round" />
            <circle cx={epx(a)} cy={epy(fa)} r="4" fill={C.see} stroke={C.weiss} strokeWidth="1.2" />
            <T x={epx(a + 1) + 5} y={(epy(fa) + epy(fa + m)) / 2 + 4} fontSize="11.5" fontWeight="800" fill={C.see} opacity={zahlAus}>{dk(m, 2)}</T>
          </g>
        );
      })}
      {[0, 1, 2].map((i) => {
        const o = lauf(t, 10 + 1.4 * i, 11 + 1.4 * i);
        if (o <= 0.001) return null;
        const a = 2 * i, h = 2 ** i;
        return (
          <g key={i} opacity={o}>
            <line x1={epx(a)} y1={epy(h)} x2={epx(a + 2)} y2={epy(h)} stroke={C.gold} strokeWidth="1.4" strokeDasharray="4 3" />
            <line x1={epx(a + 2)} y1={epy(h)} x2={epx(a + 2)} y2={epy(2 * h) + 5} stroke={C.gold} strokeWidth="2" />
            <path d={`M${epx(a + 2) - 4} ${epy(2 * h) + 7} L${epx(a + 2)} ${epy(2 * h) + 1} L${epx(a + 2) + 4} ${epy(2 * h) + 7}`} fill="none" stroke={C.gold} strokeWidth="2" strokeLinejoin="round" />
            <T x={epx(a + 2) + 6} y={(epy(h) + epy(2 * h)) / 2 + 4} fontSize="11.5" fontWeight="800" fill={C.gold}>· 2</T>
            <T x={epx(a + 1)} y={epy(h) + 15} textAnchor="middle" fontSize="10.5" fontWeight="700" fill={C.gruenDunkel}>2</T>
          </g>
        );
      })}
      <g opacity={formel}>
        <T x={EP.X0 + 18} y="62" fontSize="13.5" fontWeight="800" fill={C.tinte}>f(t) = f(0) · e<Hoch>kt</Hoch></T>
        <T x={EP.X0 + 18} y="86" fontSize="12.5" fontWeight="700" fill={C.gold}>T = ln 2 : k = 2</T>
      </g>
    </g>
  );
}

/* 3 · Beschränktes Wachstum: Tee */
const TE = { X0: 50, X1: 336, Y0: 252, Y1: 34, T: 30, Y: 100 };
const tex = (t) => TE.X0 + (t / TE.T) * (TE.X1 - TE.X0);
const tey = (v) => TE.Y0 - (v / TE.Y) * (TE.Y0 - TE.Y1);
const TE_DAUER = 19;
const teSchritte = () => [
  { von: 0, text: "Tee mit 90 °C in einem Raum mit 20 °C. Nach Newton kühlt er umso schneller ab, je größer der Abstand zur Raumtemperatur ist." },
  { von: 3, text: "Als DGL: f′ = 0,1 · (20 − f). Die Kurve fällt erst steil, dann immer flacher." },
  { von: 7, text: "Der Abstand zu 20 °C halbiert sich alle 6,93 Minuten: 70, 35, 17,5, 8,75. Er nimmt exponentiell ab." },
  { von: 13.5, text: "Die Steigung ist 0,1 mal der Abstand: −7 °C pro Minute am Anfang, −1,75 nach 13,9 Minuten. Die 20 °C erreicht der Tee nie ganz." },
];
function teZeichne(t) {
  const P = ANIM.tee, f = (x) => loesung("beschraenkt", P, x), th = Math.log(2) / P.k;
  const achse = lauf(t, 0.2, 1.2), raum = lauf(t, 0.6, 1.6), kurve = lauf(t, 3.2, 6.4);
  const tg = [lauf(t, 13.8, 14.8), lauf(t, 15.4, 16.4)];
  const pfeileAus = 1 - 0.6 * lauf(t, 13.6, 14.4);
  const labels = ["70", "35", "17,5", "8,75"];
  return (
    <g>
      <Achsen x0={TE.X0} x1={TE.X1} y0={TE.Y0} y1={TE.Y1} tx={tex} ty={tey} o={achse} nameX="t in min" nameY="°C"
        xt={[0, 10, 20].map((v) => [v, String(v)])} yt={[20, 40, 60, 80, 100].map((v) => [v, String(v)])} />
      <g opacity={raum}>
        <line x1={TE.X0} y1={tey(20)} x2={TE.X1} y2={tey(20)} stroke={C.see} strokeWidth="1.3" strokeDasharray="5 4" />
        <T x={TE.X1} y={tey(20) + 16} textAnchor="end" fontSize="11.5" fontWeight="800" fill={C.see}>Raum 20 °C</T>
        <circle cx={tex(0)} cy={tey(90)} r="4.5" fill={C.signal} stroke={C.weiss} strokeWidth="1.2" />
        <T x={tex(0) + 9} y={tey(90) - 6} fontSize="11.5" fontWeight="800" fill={C.signal}>90 °C</T>
      </g>
      {kurve > 0.001 && <path d={kurvenPfad(f, 0, TE.T * kurve, tex, tey, 0.2)} fill="none" stroke={C.signal} strokeWidth="2.8" strokeLinecap="round" />}
      {[0, 1, 2, 3].map((n) => {
        const o = lauf(t, 7.4 + 1.1 * n, 8.2 + 1.1 * n) * pfeileAus;
        if (o <= 0.001) return null;
        const x = tex(n * th) + (n === 0 ? 8 : 0), oben = tey(f(n * th));
        return (
          <g key={n} opacity={o}>
            <line x1={x} y1={tey(20) - 2} x2={x} y2={oben + 4} stroke={C.flaggold} strokeWidth="3" strokeLinecap="round" />
            <T x={x + 5} y={(tey(20) + oben) / 2 + 4} fontSize="11.5" fontWeight="800" fill={C.gold}>{labels[n]}</T>
          </g>
        );
      })}
      {tg[0] > 0.001 && (
        <g opacity={tg[0]}>
          <line x1={tex(0)} y1={tey(90)} x2={tex(6.5)} y2={tey(90 - 7 * 6.5)} stroke={C.seeTief} strokeWidth="1.8" strokeLinecap="round" />
          <line x1={tex(3.6)} y1={tey(90 - 7 * 3.6)} x2={tex(8.6)} y2={tey(78) + 4} stroke={C.seeTief} strokeWidth="0.9" strokeDasharray="2 2" />
          <Pille x={tex(13.2)} y={tey(78) + 5} text="Steigung −7" farbe={C.seeTief} breite={96} gross={11} />
        </g>
      )}
      {tg[1] > 0.001 && (
        <g opacity={tg[1]}>
          <line x1={tex(2 * th - 6)} y1={tey(37.5 + 1.75 * 6)} x2={tex(2 * th + 6)} y2={tey(37.5 - 1.75 * 6)} stroke={C.seeTief} strokeWidth="1.8" strokeLinecap="round" />
          <circle cx={tex(2 * th)} cy={tey(37.5)} r="3.6" fill={C.seeTief} />
          <line x1={tex(2 * th + 1)} y1={tey(37.5) - 4} x2={tex(20)} y2={tey(54) + 4} stroke={C.seeTief} strokeWidth="0.9" strokeDasharray="2 2" />
          <Pille x={tex(23.5)} y={tey(54) + 5} text="Steigung −1,75" farbe={C.seeTief} breite={110} gross={11} />
        </g>
      )}
    </g>
  );
}

/* 4 · Logistisches Wachstum: Bestand oben, Rate gegen Bestand unten */
const LO = { X0: 44, X1: 330, OY0: 150, OY1: 40, UY0: 306, UY1: 206 };
const lox = (t) => LO.X0 + (t / 10) * (LO.X1 - LO.X0);
const loy = (v) => LO.OY0 - (v / 10) * (LO.OY0 - LO.OY1);
const lpx = (f) => LO.X0 + (f / 10) * (LO.X1 - LO.X0);
const lpy = (r) => LO.UY0 - (r / 2.5) * (LO.UY0 - LO.UY1);
const LO_DAUER = 20;
const loSchritte = () => [
  { von: 0, text: "Logistisch: f′ = 0,1 · f · (10 − f). Unten die Änderungsrate in Abhängigkeit vom Bestand – eine nach unten geöffnete Parabel." },
  { von: 4, text: "Am Anfang ist f klein: Die Rate wächst fast proportional zu f, der Bestand fast exponentiell." },
  { von: 10.5, text: "Bei f = 5, der halben Schranke, ist die Parabel am höchsten: Hier wächst der Bestand am schnellsten. Das ist der Wendepunkt." },
  { von: 14, text: "Danach bremst der Faktor 10 − f: Die Rate sinkt, und der Bestand nähert sich der Schranke 10 – wie beim beschränkten Wachstum." },
];
function loZeichne(t) {
  const P = ANIM.logistisch, f = (x) => loesung("logistisch", P, x), g = (v) => rate("logistisch", P, v), tw = wendezeit(P);
  const achse = lauf(t, 0.2, 1.2), parabel = lauf(t, 1, 3);
  const u = t < 4 ? 0 : t < 11 ? tw * lauf(t, 4, 11) : t < 14.2 ? tw : tw + (10 - tw) * lauf(t, 14.2, 19);
  const lauft = t >= 4;
  const hoch = fenster(t, 11, 11.8, 19.6, 20) + lauf(t, 19.6, 20);
  const fu = f(u), ru = g(fu);
  return (
    <g>
      <Achsen x0={LO.X0} x1={LO.X1} y0={LO.OY0} y1={LO.OY1} tx={lox} ty={loy} o={achse} nameX="t" nameY="f(t)"
        xt={[0, 2, 4, 6, 8, 10].map((v) => [v, String(v)])} yt={[[5, "5"], [10, "10"]]} />
      <Achsen x0={LO.X0} x1={LO.X1} y0={LO.UY0} y1={LO.UY1} tx={lpx} ty={lpy} o={achse} nameX="f" nameY="f′"
        xt={[0, 5, 10].map((v) => [v, String(v)])} yt={[[1, "1"], [2, "2"]]} />
      <g opacity={achse}>
        <line x1={LO.X0} y1={loy(10)} x2={LO.X1} y2={loy(10)} stroke={C.gold} strokeWidth="1.2" strokeDasharray="5 4" />
        <T x={lox(0.5)} y={loy(10) + 14} fontSize="11" fontWeight="800" fill={C.gold}>S = 10</T>
      </g>
      {parabel > 0.001 && <path d={kurvenPfad(g, 0, 10 * parabel, lpx, lpy, 0.1)} fill="none" stroke={C.see} strokeWidth="2.6" strokeLinecap="round" />}
      {lauft && u > 0.01 && <path d={kurvenPfad(f, 0, u, lox, loy, 0.05)} fill="none" stroke={C.gold} strokeWidth="2.8" strokeLinecap="round" />}
      {hoch > 0.001 && (
        <g opacity={hoch}>
          <circle cx={lox(tw)} cy={loy(5)} r="13" fill={C.flaggold} opacity="0.3" />
          <circle cx={lpx(5)} cy={lpy(2.5)} r="13" fill={C.flaggold} opacity="0.3" />
          <line x1={lpx(5)} y1={LO.UY0} x2={lpx(5)} y2={lpy(2.5)} stroke={C.gold} strokeWidth="1" strokeDasharray="3 3" />
          <T x={lox(tw) + 14} y={loy(5) + 16} fontSize="11.5" fontWeight="800" fill={C.gold}>Wendepunkt</T>
          <T x={lpx(5) + 14} y={lpy(2.5) + 2} fontSize="11.5" fontWeight="800" fill={C.gold}>größte Rate 2,5</T>
        </g>
      )}
      {lauft && (
        <g>
          <line x1={lox(Math.max(0, u - 0.9))} y1={loy(fu - (u - Math.max(0, u - 0.9)) * ru)} x2={lox(Math.min(10, u + 0.9))} y2={loy(fu + (Math.min(10, u + 0.9) - u) * ru)}
            stroke={C.signal} strokeWidth="1.8" strokeLinecap="round" />
          <circle cx={lox(u)} cy={loy(fu)} r="4.6" fill={C.signal} stroke={C.weiss} strokeWidth="1.3" />
          <circle cx={lpx(fu)} cy={lpy(ru)} r="4.6" fill={C.signal} stroke={C.weiss} strokeWidth="1.3" />
        </g>
      )}
      <T x="186" y="182" textAnchor="middle" fontSize="11" fontWeight="700" fill={C.grau} opacity={parabel}>Rate f′ in Abhängigkeit vom Bestand f</T>
    </g>
  );
}

/* 5 · Euler-Verfahren */
const EU = { X0: 44, X1: 330, Y0: 252, Y1: 34, T: 4, Y: 10 };
const eux = (t) => EU.X0 + (t / EU.T) * (EU.X1 - EU.X0);
const euy = (v) => EU.Y0 - (v / EU.Y) * (EU.Y0 - EU.Y1);
const EU_DAUER = 20;
const euSchritte = () => [
  { von: 0, text: "Euler-Verfahren für f′ = 0,5 · (10 − f) mit f(0) = 2. Am Start schreibt die DGL die Steigung 0,5 · 8 = 4 vor." },
  { von: 3, text: "Wir gehen Δt = 1 entlang dieser Tangente: f(1) ≈ 2 + 4 = 6. Dort gilt die neue Steigung 2, also f(2) ≈ 8." },
  { von: 9, text: "Mit Δt = 0,5 und Δt = 0,25 wird die Steigung öfter neu berechnet. Der Streckenzug schmiegt sich an die Kurve." },
  { von: 15, text: "Exakt ist f(t) = 10 − 8e^(−0,5t). Bei t = 2 liefert Euler 8, 7,47 und 7,25 – exakt sind es 7,06." },
];
const EU_FARBEN = [C.see, C.seeHell, C.tuerkis];
const EU_ZUEGE = ANIM.euler.dts.map((dt) => euler("beschraenkt", ANIM.euler, dt, Math.round(EU.T / dt)).map((v, i) => [eux(i * dt), euy(v)]));
function euZeichne(t) {
  const P = ANIM.euler, f = (x) => loesung("beschraenkt", P, x);
  const achse = lauf(t, 0.2, 1.2), start = fenster(t, 1.2, 2, 3.4, 4);
  const z1 = lauf(t, 3.6, 8.4), z2 = lauf(t, 9.4, 11.2), z3 = lauf(t, 11.6, 13.4);
  const blass = 1 - 0.25 * lauf(t, 9.2, 10);
  const exakt = lauf(t, 15.2, 16.8), legende = lauf(t, 16.6, 17.6);
  const werte = ANIM.euler.dts.map((dt) => { const n = Math.round(2 / dt); return euler("beschraenkt", P, dt, n)[n]; });
  return (
    <g>
      <Achsen x0={EU.X0} x1={EU.X1} y0={EU.Y0} y1={EU.Y1} tx={eux} ty={euy} o={achse} nameX="t" nameY="f(t)"
        xt={[0, 1, 2, 3, 4].map((v) => [v, String(v)])} yt={[2, 4, 6, 8, 10].map((v) => [v, String(v)])} />
      <g opacity={achse}>
        <line x1={EU.X0} y1={euy(10)} x2={EU.X1} y2={euy(10)} stroke={C.gold} strokeWidth="1.2" strokeDasharray="5 4" />
        <circle cx={eux(0)} cy={euy(2)} r="4.6" fill={C.signal} stroke={C.weiss} strokeWidth="1.2" />
      </g>
      {start > 0.001 && (
        <g opacity={start}>
          <line x1={eux(0)} y1={euy(2)} x2={eux(0.7)} y2={euy(2 + 4 * 0.7)} stroke={C.signal} strokeWidth="2" strokeDasharray="4 3" />
          <T x={eux(0.75) + 4} y={euy(4.6)} fontSize="11.5" fontWeight="800" fill={C.signal}>Steigung 4</T>
        </g>
      )}
      {exakt > 0.001 && <path d={kurvenPfad(f, 0, EU.T * exakt, eux, euy)} fill="none" stroke={C.gold} strokeWidth="3" strokeLinecap="round" />}
      {[z1, z2, z3].map((a, i) => (a > 0.001 ? (
        <g key={i} opacity={i === 0 ? blass : 1}>
          <path d={pfad(teilZug(EU_ZUEGE[i], a))} fill="none" stroke={EU_FARBEN[i]} strokeWidth={i === 0 ? 2.4 : 1.8} strokeLinejoin="round" />
          {i === 0 && EU_ZUEGE[0].slice(1).map(([x, y], j) => (a * 4 >= j + 1 - 1e-6 ? <circle key={j} cx={x} cy={y} r="3.6" fill={C.see} stroke={C.weiss} strokeWidth="1" /> : null))}
        </g>
      ) : null))}
      {z1 > 0.3 && t < 9.4 && (
        <g opacity={fenster(t, 5, 5.6, 9, 9.4)}>
          <T x={eux(1) - 4} y={euy(6) - 9} textAnchor="end" fontSize="11.5" fontWeight="800" fill={C.see}>6</T>
          <T x={eux(2) - 4} y={euy(8) - 9} textAnchor="end" fontSize="11.5" fontWeight="800" fill={C.see}>8</T>
        </g>
      )}
      {exakt > 0.001 && <line x1={eux(2)} y1={EU.Y0} x2={eux(2)} y2={euy(8.6)} stroke={C.hellgrau} strokeWidth="1" strokeDasharray="3 3" opacity={exakt} />}
      <g opacity={legende}>
        {[["Δt = 1", werte[0], EU_FARBEN[0]], ["Δt = 0,5", werte[1], EU_FARBEN[1]], ["Δt = 0,25", werte[2], EU_FARBEN[2]], ["exakt", f(2), C.gold]].map(([n, w, farbe], i) => (
          <g key={n}>
            <line x1="206" y1={162 + i * 20} x2="222" y2={162 + i * 20} stroke={farbe} strokeWidth="3" strokeLinecap="round" />
            <T x="228" y={166 + i * 20} fontSize="11.5" fontWeight="700" fill={C.tinte}>{n}</T>
            <T x="326" y={166 + i * 20} textAnchor="end" fontSize="11.5" fontWeight="800" fill={farbe === C.gold ? C.gold : C.tinte}>{dk(w, 2)}</T>
          </g>
        ))}
        <T x="206" y="146" fontSize="10.5" fontWeight="700" fill={C.grau}>f(2) mit …</T>
      </g>
    </g>
  );
}

const WACHSTUM_ANIM = {
  feld: { titel: () => "Aus Steigungen wird eine Kurve", unter: () => "Das Richtungsfeld einer DGL und ihre Lösungen",
    szene: () => ({ dauer: FD_DAUER, hoehe: 272, schritte: fdSchritte(), zeichne: fdZeichne,
      beschreibung: "Animation: Richtungsfeld der DGL f′ = 0,5 · (8 − f) mit Strichstücken der vorgeschriebenen Steigung, Steigung 3 bei y = 2, 0 bei y = 8, −1,5 bei y = 11. Die Lösung mit f(0) = 1 folgt den Strichen; auch die Lösungen mit f(0) = 4 und f(0) = 11 nähern sich der Schranke 8." }) },
  exp: { titel: () => "Exponentielles Wachstum: je mehr, desto schneller", unter: () => "Doppelter Bestand, doppelte Steigung – konstante Verdopplungszeit",
    szene: () => ({ dauer: EP_DAUER, hoehe: 276, schritte: epSchritte(), zeichne: epZeichne,
      beschreibung: "Animation: f(t) = e^(kt) mit k = ln 2 : 2. Tangenten bei f = 1, 2 und 4 haben die Steigungen 0,35, 0,69 und 1,39. Eine Treppe zeigt, dass sich der Bestand alle 2 Zeiteinheiten verdoppelt." }) },
  beschraenkt: { titel: () => "Beschränktes Wachstum: ein Tee kühlt ab", unter: () => "Der Abstand zur Raumtemperatur halbiert sich in gleichen Zeiten",
    szene: () => ({ dauer: TE_DAUER, hoehe: 276, schritte: teSchritte(), zeichne: teZeichne,
      beschreibung: "Animation: Temperatur f(t) = 20 + 70e^(−0,1t) eines Tees in einem Raum mit 20 °C. Die Abstände zur Raumtemperatur 70, 35, 17,5 und 8,75 °C folgen im Abstand von 6,93 Minuten. Die Tangente hat am Anfang die Steigung −7, nach 13,9 Minuten −1,75 °C pro Minute." }) },
  logistisch: { titel: () => "Logistisches Wachstum und sein Wendepunkt", unter: () => "Warum der Bestand bei der halben Schranke am schnellsten wächst",
    szene: () => ({ dauer: LO_DAUER, hoehe: 330, schritte: loSchritte(), zeichne: loZeichne,
      beschreibung: "Animation: Oben die S-Kurve f(t) = 10 : (1 + 99e^(−t)), unten die Parabel f′ = 0,1 · f · (10 − f). Ein Punkt wandert auf beiden; bei f = 5 ist die Parabel am höchsten (Rate 2,5) – der Wendepunkt der S-Kurve." }) },
  euler: { titel: () => "Das Euler-Verfahren", unter: () => "Schritt für Schritt entlang der Tangente – mit kleinerem Δt immer genauer",
    szene: () => ({ dauer: EU_DAUER, hoehe: 276, schritte: euSchritte(), zeichne: euZeichne,
      beschreibung: "Animation: Euler-Streckenzüge für f′ = 0,5 · (10 − f) mit f(0) = 2 und Δt = 1, 0,5 und 0,25, dazu die exakte Lösung 10 − 8e^(−0,5t). Bei t = 2 liefern sie 8, 7,47 und 7,25, exakt sind es 7,06." }) },
};

export function WachstumAnimation({ art, offen = false }) {
  return <AnimKarte szenen={WACHSTUM_ANIM} art={art} offen={offen} merkmal="data-wachstum-anim" />;
}

/* ======================================================================
   Statische Bilder der Herleitung
   ====================================================================== */
const STARK = { fontSize: 15, color: C.tinte, fontWeight: 500, lineHeight: 1.8, margin: "8px 0 10px" };

/* Drei Modelle im Vergleich: Miniaturbild, DGL, Lösung */
const MINI = [
  { id: "exp", name: "Exponentiell", dgl: "f′ = k \\cdot f", lsg: "f(t) = f(0) \\cdot e^{kt}", f: (t) => 0.1 * Math.exp(0.38 * t), s: false,
    satz: "Rate proportional zum Bestand" },
  { id: "beschraenkt", name: "Beschränkt", dgl: "f′ = k \\cdot (S − f)", lsg: "f(t) = S − (S − f(0)) \\cdot e^{−kt}", f: (t) => 0.9 - 0.8 * Math.exp(-0.6 * t), s: true,
    satz: "Rate proportional zum Abstand zur Schranke" },
  { id: "logistisch", name: "Logistisch", dgl: "f′ = k \\cdot f \\cdot (S − f)", lsg: "f(t) = \\frac{S}{1 + \\left(\\frac{S}{f(0)} − 1\\right)e^{−kSt}}", f: (t) => 0.9 / (1 + 30 * Math.exp(-1.3 * t)), s: true,
    satz: "Rate proportional zu Bestand und Abstand" },
];
function ModellUebersicht() {
  const x = (t) => 6 + t * 14, y = (v) => 52 - v * 44;
  return (
    <div style={{ display: "grid", gap: 10, margin: "8px 0 18px" }} data-modell-uebersicht="">
      {MINI.map((m) => (
        <div key={m.id} style={{ ...KARTE, padding: "12px 14px 4px" }}>
          <div className="flex items-center" style={{ gap: 12 }}>
            <svg viewBox="0 0 96 58" width="84" height="51" aria-hidden="true" style={{ flexShrink: 0, background: C.sand, borderRadius: 8 }}>
              <line x1="6" y1="52" x2="92" y2="52" stroke={C.linie} strokeWidth="1" />
              <line x1="6" y1="52" x2="6" y2="4" stroke={C.linie} strokeWidth="1" />
              {m.s && <line x1="6" y1={y(0.9)} x2="92" y2={y(0.9)} stroke={C.gold} strokeWidth="0.9" strokeDasharray="3 2" />}
              <path d={kurvenPfad(m.f, 0, 6, x, y, 0.1)} fill="none" stroke={C.see} strokeWidth="2.2" strokeLinecap="round" />
            </svg>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: C.tinte }}>{m.name}</p>
              <p style={{ fontSize: 12.5, color: C.grau, fontWeight: 300, lineHeight: 1.4 }}>{m.satz}</p>
              <p style={{ fontSize: 15, color: C.tinte, marginTop: 2 }}><Inline s={`$${m.dgl}$`} /></p>
            </div>
          </div>
          <Formeln zeilen={[m.lsg]} max={15} />
        </div>
      ))}
    </div>
  );
}

/* Euler-Tabelle für f′ = 0,5 · (10 − f), f(0) = 2, Wert bei t = 2 */
function EulerTabelle() {
  const kopf = { fontSize: 12, fontWeight: 700, color: C.grau, letterSpacing: "0.02em", padding: "0 4px 8px" };   // keine Großbuchstaben: Δt und f(2) bleiben klein
  const zelle = { fontSize: 13.5, color: C.tinte, padding: "8px 4px", borderTop: `1px solid ${C.linie}`, fontVariantNumeric: "tabular-nums" };
  return (
    <div style={{ ...KARTE, padding: "14px 14px 10px", margin: "4px 0 18px" }} data-euler-tabelle="">
      <div style={{ display: "grid", gridTemplateColumns: "0.9fr 0.9fr 1.1fr 1fr" }}>
        <span style={kopf}>Δt</span><span style={kopf}>Schritte</span><span style={kopf}>Euler f(2)</span><span style={kopf}>Fehler</span>
        {EULER_TABELLE.map((z) => (
          <React.Fragment key={z.dt}>
            <span style={{ ...zelle, fontWeight: 700 }}>{dk(z.dt, 2)}</span>
            <span style={zelle}>{z.n}</span>
            <span style={zelle}>{dk(z.wert, 3)}</span>
            <span style={{ ...zelle, color: C.signal }}>{dk(z.fehler, 3)}</span>
          </React.Fragment>
        ))}
        <span style={{ ...zelle, gridColumn: "1 / span 2", color: C.grau, fontSize: 12.5 }}>exakt</span>
        <span style={{ ...zelle, fontWeight: 800, color: C.gold }}>{dk(loesung("beschraenkt", ANIM.euler, 2), 3)}</span>
        <span style={zelle} />
      </div>
    </div>
  );
}

/* Messreihen mit gleichen Zeitabständen: Werte und das Merkmal, das das Modell verrät */
function DatenTabelle() {
  const zelle = { fontSize: 13.5, color: C.tinte, textAlign: "right", fontVariantNumeric: "tabular-nums", padding: "3px 2px" };
  const klein = { ...zelle, fontSize: 12, color: C.gold, fontWeight: 700 };
  return (
    <div style={{ display: "grid", gap: 10, margin: "6px 0 18px" }} data-daten-tabelle="">
      {DATEN.map((d) => {
        const zeile2 = d.id === "exp" ? quotienten(d.f).map((q) => `· ${dk(q, 2)}`) : differenzen(d.f).map((x) => `+ ${dk(x, 2)}`);
        return (
          <div key={d.id} style={{ ...KARTE, padding: "10px 12px" }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: C.tinte, marginBottom: 4 }}>{d.name[0].toUpperCase() + d.name.slice(1)} <span style={{ fontWeight: 400, color: C.grau, fontSize: 12.5 }}>· {d.merkmal}</span></p>
            <div style={{ display: "grid", gridTemplateColumns: "36px repeat(5, minmax(0, 1fr))", columnGap: 4 }}>
              <span style={{ ...zelle, textAlign: "left", color: C.grau }}>f</span>
              {d.f.map((v, i) => <span key={i} style={zelle}>{dk(v, 2)}</span>)}
              <span style={{ ...klein, textAlign: "left", color: C.grau, fontWeight: 400 }}>{d.id === "exp" ? "q" : "Δ"}</span>
              <span />
              {zeile2.map((v, i) => <span key={i} style={klein}>{v}</span>)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Punkt({ titel, s }) {
  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
      <span aria-hidden="true" style={{ flexShrink: 0, width: 8, height: 8, borderRadius: 999, background: C.flaggold, marginTop: 10 }} />
      <div>
        <p style={{ fontSize: 15, fontWeight: 700, color: C.tinte, marginBottom: 2 }}>{titel}</p>
        <Text s={s} style={{ ...FLIESS, marginBottom: 0 }} />
      </div>
    </div>
  );
}

/* ======================================================================
   Labor: Modell, k, S, f(0) · Richtungsfeld mit Lösung und Euler-Streckenzug · f′ gegen f
   ====================================================================== */
const LB = { X0: 40, X1: 344, Y0: 222, Y1: 18, T: 10, Y: 12 };
const lbx = (t) => LB.X0 + (t / LB.T) * (LB.X1 - LB.X0);
const lby = (v) => LB.Y0 - (v / LB.Y) * (LB.Y0 - LB.Y1);
const LB_SX = (LB.X1 - LB.X0) / LB.T, LB_SY = (LB.Y0 - LB.Y1) / LB.Y;
const PF = { X0: 40, X1: 344, Y0: 124, Y1: 16, F: 12 };
const pfx = (v) => PF.X0 + (v / PF.F) * (PF.X1 - PF.X0);
const START = {
  exp: { k: 0.25, S: 10, f0: 1 },
  beschraenkt: { k: 0.4, S: 8, f0: 1 },
  logistisch: { k: 0.1, S: 10, f0: 0.5 },
};
const BEREICH = {
  exp: { k: [-0.5, 0.5, 0.05], f0: [0.5, 11, 0.5] },
  beschraenkt: { k: [0.1, 1.5, 0.05], S: [1, 11, 0.5], f0: [0, 12, 0.5] },
  logistisch: { k: [0.01, 0.3, 0.01], S: [2, 11, 0.5], f0: [0.1, 12, 0.1] },
};
const LAB_MODELLE = [{ id: "exp", name: "exponentiell" }, { id: "beschraenkt", name: "beschränkt" }, { id: "logistisch", name: "logistisch" }];
const DTS = [2.5, 1.25, 1, 0.5, 0.25, 0.1];
const VERGLEICH = 5;
/* DGL des Labors als TeX, A5: k = 1 und k = 0 ohne „1 ·“ bzw. „0 ·“ */
const dglText = (m, { k, S }) => {
  const kk = Math.round(k * 100) / 100;
  if (kk === 0) return "f′ = 0";
  if (m === "exp") return kk === 1 ? "f′ = f" : `f′ = ${dk(kk, 2)} \\cdot f`;
  if (m === "beschraenkt") return kk === 1 ? `f′ = ${dk(S, 1)} − f` : `f′ = ${dk(kk, 2)} \\cdot (${dk(S, 1)} − f)`;
  return kk === 1 ? `f′ = f \\cdot (${dk(S, 1)} − f)` : `f′ = ${dk(kk, 2)} \\cdot f \\cdot (${dk(S, 1)} − f)`;
};
const wahlStil = (an) => ({
  padding: "6px 11px", borderRadius: 999, border: `1px solid ${an ? C.flaggold : C.linie}`, background: an ? "#FFF6D6" : C.weiss,
  color: an ? C.tinte : C.grau, fontSize: 12.5, fontWeight: an ? 600 : 400, fontFamily: "inherit", cursor: "pointer",
});

function Regler({ label, hilfe, wert, anzeige, min, max, step, setzen }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div className="flex items-baseline" style={{ gap: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: C.tinte }}>{label}</span>
        {hilfe && <span style={{ fontSize: 12, color: C.grau, fontWeight: 300 }}>{hilfe}</span>}
        <span style={{ marginLeft: "auto", fontSize: 14, fontWeight: 800, color: C.see, fontVariantNumeric: "tabular-nums" }}>{anzeige}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={wert} onChange={(e) => setzen(parseFloat(e.target.value))} aria-label={label}
        style={{ width: "100%", accentColor: C.see, margin: "4px 0 0", cursor: "pointer" }} />
    </div>
  );
}

function WachstumLabor() {
  const [modell, setModell] = useState("exp");
  const [werte, setWerte] = useState(START);
  const [dt, setDt] = useState(1);
  const [zeit, setZeit] = useState(3);
  const p = werte[modell], B = BEREICH[modell];
  const setze = (k, v) => setWerte((w) => ({ ...w, [modell]: { ...w[modell], [k]: v } }));
  const f = (t) => loesung(modell, p, t);
  const g = (v) => rate(modell, p, v);
  const n5 = Math.round(VERGLEICH / dt);
  const zug = useMemo(() => euler(modell, p, dt, Math.round(LB.T / dt)), [modell, p, dt]);
  const exakt5 = f(VERGLEICH), euler5 = zug[n5];
  const fz = f(zeit), mz = g(fz);
  /* Richtungsfeld: 10 × 12 Strichstücke */
  const striche = [];
  for (let i = 0; i < 10; i++) for (let j = 0; j < 12; j++) {
    const y = 0.5 + j;
    striche.push(<Feldstrich key={`${i}-${j}`} x={lbx(0.5 + i)} y={lby(y)} m={g(y)} sx={LB_SX} sy={LB_SY} l={5.2} farbe={C.hellgrau} breite={1.2} />);
  }
  const kurve = kurvenPfad((t) => klemm(f(t), -3, 16), 0, LB.T, lbx, lby, 0.04);
  const eulerPunkte = [];
  for (let i = 0; i < zug.length; i++) { if (!Number.isFinite(zug[i])) break; eulerPunkte.push([lbx(i * dt), lby(klemm(zug[i], -6, 18))]); }
  /* f′ gegen f */
  const stichprobe = Array.from({ length: 121 }, (_, i) => g(i * 0.1));
  let lo = Math.min(0, ...stichprobe), hi = Math.max(0, ...stichprobe);
  if (hi - lo < 1e-9) { hi += 1; lo -= 1; }
  const rand = (hi - lo) * 0.12; lo -= rand; hi += rand;
  const pfy = (r) => PF.Y0 - ((r - lo) / (hi - lo)) * (PF.Y0 - PF.Y1);
  const imBild = fz >= 0 && fz <= PF.F;
  /* Startwert per Tipp ins Bild */
  const tippen = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const ySvg = ((e.clientY - r.top) / r.height) * 264;
    const [a, b, s] = B.f0;
    const v = Math.round(klemm((LB.Y0 - ySvg) / LB_SY, a, b) / s) * s;
    setze("f0", Math.round(v * 100) / 100);
  };
  const schwingt = (modell === "exp" && 1 + p.k * dt < 0) || (modell === "beschraenkt" && p.k * dt > 1) || (modell === "logistisch" && p.k * p.S * dt > 1);
  let info;
  if (modell === "exp") info = Math.abs(p.k) < 1e-9 ? "k = 0: Der Bestand bleibt konstant."
    : p.k > 0 ? `Verdopplungszeit ln 2 : k ≈ ${dk(Math.LN2 / p.k, 2)}` : `Halbwertszeit ln 2 : |k| ≈ ${dk(Math.LN2 / -p.k, 2)}`;
  else if (modell === "beschraenkt") info = `Der Abstand zu S halbiert sich alle ln 2 : k ≈ ${dk(Math.LN2 / p.k, 2)} Zeiteinheiten.`;
  else info = p.f0 < p.S / 2 ? `Wendepunkt bei t ≈ ${dk(wendezeit(p), 2)}, f = S/2 = ${dk(p.S / 2, 2)}, größte Rate kS²/4 = ${dk(maxRate(p), 2)}`
    : p.f0 < p.S ? "Start schon über S/2: Der Wendepunkt liegt vor t = 0, die Rate sinkt von Anfang an." : p.f0 > p.S ? "Start über der Schranke: Der Bestand sinkt auf S." : "Start genau auf S: Der Bestand bleibt konstant.";
  const klein = { fontSize: 13.5, color: C.tinte, lineHeight: 1.7, margin: "4px 0" };
  return (
    <div data-wachstum-labor="" data-modell={modell} data-k={p.k} data-s={p.S} data-f0={p.f0} data-dt={dt}
      data-exakt={Number.isFinite(exakt5) ? exakt5.toFixed(6) : "x"} data-euler={Number.isFinite(euler5) ? euler5.toFixed(6) : "x"} data-zeit={zeit} data-steigung={mz.toFixed(6)}>
      <div className="flex flex-wrap" style={{ gap: 8, marginBottom: 10 }}>
        {LAB_MODELLE.map((m) => <Chip key={m.id} aktiv={modell === m.id} onClick={() => setModell(m.id)}>{m.name}</Chip>)}
      </div>
      <p style={{ fontSize: 16, color: C.tinte, margin: "2px 0 8px" }} data-labor-dgl=""><Inline s={`$${dglText(modell, p)}, \\quad f(0) = ${dk(p.f0, 2)}$`} /></p>
      <div style={{ background: C.sand, border: `1px solid ${C.linie}`, borderRadius: 14, padding: "8px 4px 2px", margin: "4px 0 6px" }}>
        <svg viewBox="0 0 360 264" style={{ width: "100%", maxWidth: 520, margin: "0 auto", display: "block", cursor: "crosshair", touchAction: "manipulation" }} role="img"
          onPointerDown={tippen} aria-label={`Richtungsfeld von ${dglText(modell, p).replace(/\\cdot/g, "·")} mit der Lösung zu f(0) = ${dk(p.f0, 2)} und dem Euler-Streckenzug mit Δt = ${dk(dt, 2)}`}>
          <defs><clipPath id="gw-labor-clip"><rect x={LB.X0} y={LB.Y1 - 4} width={LB.X1 - LB.X0 + 4} height={LB.Y0 - LB.Y1 + 4} /></clipPath></defs>
          <Achsen x0={LB.X0} x1={LB.X1} y0={LB.Y0} y1={LB.Y1} tx={lbx} ty={lby} nameX="t"
            xt={[0, 2, 4, 6, 8, 10].map((v) => [v, String(v)])} yt={[0, 4, 8, 12].map((v) => [v, String(v)])} />
          <g clipPath="url(#gw-labor-clip)">
            {striche}
            {modell !== "exp" && <line x1={LB.X0} y1={lby(p.S)} x2={LB.X1} y2={lby(p.S)} stroke={C.gold} strokeWidth="1.1" strokeDasharray="5 4" />}
            <line x1={lbx(VERGLEICH)} y1={LB.Y0} x2={lbx(VERGLEICH)} y2={LB.Y1} stroke={C.linie} strokeWidth="1" strokeDasharray="3 3" />
            <path d={pfad(eulerPunkte)} fill="none" stroke={C.see} strokeWidth="1.9" strokeLinejoin="round" />
            {dt >= 0.5 && eulerPunkte.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.6" fill={C.see} />)}
            <path d={kurve} fill="none" stroke={C.gold} strokeWidth="2.8" strokeLinecap="round" />
            <line x1={lbx(zeit - 1.2)} y1={lby(fz - 1.2 * mz)} x2={lbx(zeit + 1.2)} y2={lby(fz + 1.2 * mz)} stroke={C.signal} strokeWidth="1.8" strokeLinecap="round" />
            <circle cx={lbx(zeit)} cy={lby(fz)} r="4.4" fill={C.signal} stroke={C.weiss} strokeWidth="1.2" />
          </g>
          {modell !== "exp" && p.S <= 11.5 && <T x={LB.X1 + 4} y={lby(p.S) + 4} fontSize="10.5" fontWeight="800" fill={C.gold}>S</T>}
          <g>
            <line x1="52" y1="256" x2="66" y2="256" stroke={C.gold} strokeWidth="2.8" strokeLinecap="round" />
            <T x="70" y="259.5" fontSize="10.5" fontWeight="700" fill={C.grau}>exakt</T>
            <line x1="112" y1="256" x2="126" y2="256" stroke={C.see} strokeWidth="1.9" />
            <T x="130" y="259.5" fontSize="10.5" fontWeight="700" fill={C.grau}>Euler</T>
            <circle cx="179" cy="256" r="3.6" fill={C.signal} />
            <T x="186" y="259.5" fontSize="10.5" fontWeight="700" fill={C.grau}>Zeitpunkt mit Tangente</T>
          </g>
        </svg>
      </div>
      <p style={{ fontSize: 12.5, color: C.grau, fontWeight: 300, lineHeight: 1.6, marginBottom: 10 }}>Tippe ins Bild, um den Startwert f(0) auf diese Höhe zu setzen. Gold die exakte Lösung, blau der Euler-Streckenzug.</p>
      <Regler label="k" hilfe={modell === "logistisch" ? "Wachstumsfaktor (kS wirkt im Exponenten)" : "Wachstumskonstante"} wert={p.k} min={B.k[0]} max={B.k[1]} step={B.k[2]} anzeige={dk(p.k, 2)} setzen={(v) => setze("k", Math.round(v * 100) / 100)} />
      {B.S && <Regler label="S" hilfe="Schranke" wert={p.S} min={B.S[0]} max={B.S[1]} step={B.S[2]} anzeige={dk(p.S, 1)} setzen={(v) => setze("S", v)} />}
      <Regler label="f(0)" hilfe="Startwert" wert={p.f0} min={B.f0[0]} max={B.f0[1]} step={B.f0[2]} anzeige={dk(p.f0, 2)} setzen={(v) => setze("f0", Math.round(v * 100) / 100)} />
      <div className="flex flex-wrap items-center" style={{ gap: 6, margin: "6px 0 10px" }}>
        <span style={{ fontSize: 13, color: C.grau, marginRight: 2 }}>Euler-Schrittweite</span>
        {DTS.map((d) => <button key={d} type="button" onClick={() => setDt(d)} aria-pressed={dt === d} aria-label={`Δt = ${dk(d, 2)}`} style={wahlStil(dt === d)}>{dk(d, 2)}</button>)}
      </div>
      <p style={klein} data-labor-vergleich="">
        Bei t = 5: exakt <b>{dk(exakt5, 3)}</b>, Euler mit Δt = {dk(dt, 2)}: <b>{Number.isFinite(euler5) ? dk(euler5, 3) : "zu groß"}</b>
        {Number.isFinite(euler5) && <> · Abweichung {dk(Math.abs(euler5 - exakt5), 3)}</>}
      </p>
      {schwingt && <p style={{ ...klein, color: C.signal }} data-labor-warnung="">Δt ist so groß, dass Euler über das Ziel hinausschießt und schwingt – mach Δt kleiner.</p>}
      <div style={{ height: 6 }} />
      <Regler label="Zeitpunkt t" hilfe="Punkt mit Tangente" wert={zeit} min={0} max={10} step={0.1} anzeige={dk(zeit, 1)} setzen={setZeit} />
      <p style={klein} data-labor-punkt="">
        <Inline s={`$f(${dk(zeit, 1)}) ≈ ${dk(fz, 2)}$`} />, die DGL liefert die Steigung <Inline s={`$f′(${dk(zeit, 1)}) ≈ ${dk(mz, 2)}$`} />.
      </p>
      <div style={{ background: C.sand, border: `1px solid ${C.linie}`, borderRadius: 14, padding: "6px 4px 0", margin: "6px 0 8px" }}>
        <svg viewBox="0 0 360 150" style={{ width: "100%", maxWidth: 520, margin: "0 auto", display: "block" }} role="img"
          aria-label={`Änderungsrate f′ in Abhängigkeit vom Bestand f: ${modell === "exp" ? "eine Ursprungsgerade" : modell === "beschraenkt" ? "eine fallende Gerade mit Nullstelle S" : "eine Parabel mit den Nullstellen 0 und S"}`}>
          <line x1={PF.X0} y1={pfy(0)} x2={PF.X1 + 8} y2={pfy(0)} stroke={C.tinte} strokeWidth="1.2" />
          <line x1={PF.X0} y1={PF.Y0 + 4} x2={PF.X0} y2={PF.Y1 - 6} stroke={C.tinte} strokeWidth="1.2" />
          <T x={PF.X0 + 6} y={PF.Y1 - 1} fontSize="11" fontWeight="700" fill={C.grau}>f′</T>
          <T x={PF.X1 + 12} y={pfy(0) + 15} textAnchor="end" fontSize="11" fontWeight="700" fill={C.grau}>f</T>
          {[4, 8, 12].map((v) => <T key={v} x={pfx(v)} y={pfy(0) + (lo < -0.05 * (hi - lo) && pfy(0) > PF.Y0 - 14 ? -6 : 14)} textAnchor="middle" fontSize="10" fill={C.grau}>{v}</T>)}
          <path d={kurvenPfad(g, 0, PF.F, pfx, pfy, 0.1)} fill="none" stroke={C.see} strokeWidth="2.4" strokeLinecap="round" />
          {modell !== "exp" && <circle cx={pfx(p.S)} cy={pfy(0)} r="3.2" fill={C.gold} />}
          {modell === "logistisch" && <line x1={pfx(p.S / 2)} y1={pfy(0)} x2={pfx(p.S / 2)} y2={pfy(maxRate(p))} stroke={C.gold} strokeWidth="1" strokeDasharray="3 3" />}
          {imBild && <circle cx={pfx(fz)} cy={pfy(mz)} r="4.4" fill={C.signal} stroke={C.weiss} strokeWidth="1.2" />}
          <T x={PF.X1} y={PF.Y1 + 4} textAnchor="end" fontSize="11.5" fontWeight="800" fill={C.see}>{dglText(modell, p).replace(/\\cdot/g, "·")}</T>
        </svg>
      </div>
      <p style={{ fontSize: 12.5, color: C.grau, fontWeight: 300, lineHeight: 1.6, marginBottom: 6 }}>
        Das untere Bild ist die DGL selbst: Zu jedem Bestand f zeigt es die Änderungsrate f′ – eine {modell === "exp" ? "Ursprungsgerade" : modell === "beschraenkt" ? "fallende Gerade, die bei S die Achse schneidet" : "Parabel mit den Nullstellen 0 und S"}. Der rote Punkt gehört zum gewählten Zeitpunkt.
      </p>
      <p style={{ ...klein, color: C.gruenDunkel, fontWeight: 600 }} data-labor-info="">{info}</p>
    </div>
  );
}

/* ======================================================================
   Übungen
   ====================================================================== */
const ariaText = (s) => String(s).replace(/\$/g, "").replace(/_\{([^}]*)\}/g, "$1").replace(/_/g, "");
function Feld({ k, label, einheit, zeichen, modus, wert, setzen, stand, onEnter }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 16, fontWeight: 500, color: C.tinte }}>
      <span style={{ whiteSpace: "nowrap" }}><Inline s={label} /> {zeichen}</span>
      <MatheFeld modus={modus} value={wert} onChange={(e) => setzen(k, e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") onEnter(); }}
        aria-label={ariaText(label)} placeholder="?" style={{ ...ZELLE(stand), width: 128, textAlign: "left" }} />
      {einheit && <span style={{ fontSize: 13.5, color: C.grau, whiteSpace: "nowrap" }}>{einheit}</span>}
    </label>
  );
}

function Stufen({ stufe, setzen }) {
  return (
    <div className="flex items-center flex-wrap" style={{ gap: 10, marginBottom: 16 }}>
      <span style={{ fontSize: 13.5, color: C.grau, fontWeight: 300 }}>Schwierigkeit</span>
      <PlusMinus setzen={(d) => setzen(stufe + d)} label="Schwierigkeit" />
      <div className="flex" style={{ gap: 4 }}>
        {[1, 2, 3, 4, 5].map((x) => <span key={x} style={{ width: 9, height: 9, borderRadius: 999, background: x <= stufe ? C.see : C.linie, display: "inline-block" }} />)}
      </div>
      <span style={{ fontSize: 13.5, color: C.gruenDunkel, fontWeight: 600 }}>{stufe} / 5</span>
    </div>
  );
}

/* Text mit $…$-Formeln wie Text aus func3 – ein Satzzeichen direkt nach einer Formel bleibt bei ihr
   (sonst kann „= 50“ am Zeilenende stehen und der Punkt allein in der nächsten Zeile) */
function TextFest({ s, style }) {
  const teile = String(s).split("$");
  const aus = [];
  for (let i = 0; i < teile.length; i++) {
    if (i % 2 === 0) { if (teile[i]) aus.push(<span key={i}>{teile[i]}</span>); continue; }
    const m = /^[.,;:!?)]+/.exec(teile[i + 1] || "");
    if (m) teile[i + 1] = teile[i + 1].slice(m[0].length);
    aus.push(<span key={i} style={{ whiteSpace: "nowrap" }}><M t={teile[i]} />{m ? m[0] : ""}</span>);
  }
  return <p style={style}>{aus}</p>;
}

/* Messreihe einer Auswahlaufgabe */
function MessTabelle({ tabelle }) {
  const zelle = { fontSize: 13, color: C.tinte, textAlign: "right", fontVariantNumeric: "tabular-nums", padding: "6px 1px", borderTop: `1px solid ${C.linie}` };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "30px repeat(5, minmax(0, 1fr))", columnGap: 3, margin: "4px 0 14px" }} data-messreihe="">
      <span style={{ ...zelle, textAlign: "left", color: C.grau, borderTop: "none" }}>t</span>
      {tabelle.t.map((t) => <span key={t} style={{ ...zelle, color: C.grau, borderTop: "none" }}>{t}</span>)}
      <span style={{ ...zelle, textAlign: "left", color: C.grau }}>f(t)</span>
      {tabelle.f.map((v, i) => <span key={i} style={{ ...zelle, fontWeight: 700 }}>{dk(v, 2)}</span>)}
    </div>
  );
}

function WachstumTrainer() {
  const [art, setArt] = useState("dgl");
  const [stufe, setStufe] = useState(1);
  const [auf, setAufRoh] = useState(() => merk(aufgabe("dgl", 1)));
  const setAuf = (a) => setAufRoh(merk(a));
  const [ein, setEin] = useState({});
  const [wahl, setWahl] = useState(null);
  const [erg, setErg] = useState(null);
  const [zeigen, setZeigen] = useState(false);
  const [serie, setSerie] = useState({ n: 0, ok: 0 });
  const neu = (a = art, s = stufe) => { setAuf(aufgabe(a, s)); setEin({}); setWahl(null); setErg(null); setZeigen(false); };
  const artSetzen = (a) => { setArt(a); neu(a, stufe); };
  const stufeSetzen = (s) => { const v = Math.max(1, Math.min(5, s)); setStufe(v); neu(art, v); };
  const setze = (k, v) => { setEin((e) => ({ ...e, [k]: v })); setErg(null); };
  const fs = felder(auf);
  const mc = !!auf.mc;
  const leer = mc ? wahl === null : fs.some(([k]) => !String(ein[k] ?? "").trim());
  const pruefen = () => {
    if (leer) return;
    const e = pruefe(auf, mc ? wahl : ein);
    setErg(e);
    setSerie((x) => ({ n: x.n + 1, ok: x.ok + (e.ok ? 1 : 0) }));
  };
  const typen = [...new Set(fs.map(([, , typ]) => typ))];
  const weg = mc
    ? <div style={{ marginTop: 6 }}>{rechenweg(auf).map((z) => <TextFest key={z} s={z} style={{ fontSize: 14, color: C.tinte, fontWeight: 300, lineHeight: 1.75, marginBottom: 6 }} />)}</div>
    : <Formeln zeilen={rechenweg(auf)} max={15} farbe={C.see} />;
  return (
    <div>
      <p style={{ ...FLIESS, lineHeight: 1.7, marginBottom: 18 }}>
        Vier Aufgabentypen: Lösungen einer DGL erkennen und durch Einsetzen prüfen, Parameter wie k und S aus Angaben bestimmen,
        Bestände und Zeitpunkte berechnen und das Euler-Verfahren Schritt für Schritt rechnen.
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        {ARTEN.map((a) => <Chip key={a.id} aktiv={art === a.id} onClick={() => artSetzen(a.id)}>{a.name}</Chip>)}
      </div>
      <Stufen stufe={stufe} setzen={stufeSetzen} />
      <div style={KARTE} data-mm-karte="" data-wachstumtrainer="">
        <TextFest s={auftrag(auf)} style={{ fontSize: 15, color: C.tinte, fontWeight: 400, lineHeight: 1.75, marginBottom: 10 }} />
        {auf.tabelle && <MessTabelle tabelle={auf.tabelle} />}
        {mc ? (
          <div className="flex flex-col" style={{ gap: 8, marginBottom: 12 }}>
            {auf.reihenfolge.map((i) => {
              const an = wahl === i, gut = an && erg && erg.ok, schlecht = an && erg && !erg.ok;
              return (
                <button key={i} type="button" onClick={() => { setWahl(i); setErg(null); }} aria-pressed={an} data-option={i}
                  style={{ textAlign: "left", padding: "10px 14px", borderRadius: 12, fontFamily: "inherit", cursor: "pointer", fontSize: 16,
                    border: `1.5px solid ${gut ? C.see : schlecht ? C.signal : an ? C.see : C.linie}`, background: gut ? C.himmel : an ? "#F3F7FD" : C.weiss, color: C.tinte }}>
                  <Inline s={auf.optionen[i]} />
                </button>
              );
            })}
          </div>
        ) : (
          <>
            {typen.map((typ) => <p key={typ} style={{ fontSize: 12.5, color: C.grau, fontWeight: 300, lineHeight: 1.55, marginBottom: 6 }}>{RUNDUNG[typ]}</p>)}
            <div className="flex flex-wrap" style={{ gap: 14, margin: "10px 0 12px" }}>
              {fs.map(([k, label, typ, einheit, zeichen]) => (
                <Feld key={k} k={k} label={label} einheit={einheit} zeichen={zeichen} modus={typ === "euler" ? "zahl" : "formel"} wert={ein[k] ?? ""}
                  setzen={setze} stand={erg ? erg.felder[k] : null} onEnter={pruefen} />
              ))}
            </div>
          </>
        )}
        {erg && erg.ok && (
          <div style={{ borderLeft: `4px solid ${C.see}`, paddingLeft: 16, marginBottom: 14 }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: C.see, marginBottom: 2 }}>Stimmt!</p>
            {weg}
          </div>
        )}
        {erg && !erg.ok && (
          <div style={{ borderLeft: `4px solid ${C.signal}`, paddingLeft: 16, marginBottom: 14 }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: C.signal, marginBottom: 6 }}>Stimmt noch nicht.</p>
            <p style={{ fontSize: 14, color: C.tinte, fontWeight: 300, lineHeight: 1.75 }}>{erg.grund || tipp(auf)}</p>
            {!zeigen && <button onClick={() => setZeigen(true)} className="mt-3" style={LINK}>{mc ? "Erklärung zeigen" : "Rechenweg zeigen"}</button>}
            {zeigen && weg}
          </div>
        )}
        {!(erg && erg.ok) && <button onClick={pruefen} disabled={leer} className="px-6 py-3" style={KNOPF(!leer)}>Prüfen</button>}
      </div>
      <div className="flex flex-wrap gap-3 mt-5">
        <button onClick={() => neu()} className="px-6 py-3" style={KNOPF(true, C.gruenDunkel)}>Nächste Aufgabe</button>
        {serie.n > 0 && <span className="flex items-center" style={{ fontSize: 13, color: C.grau }}>{serie.ok} von {serie.n} richtig</span>}
      </div>
    </div>
  );
}

/* ======================================================================
   Die Seite
   ====================================================================== */
export function GfsWachstumSeite({ gehe }) {
  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 22 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 14 }}>
        Wie kann man aus der Änderungsrate allein vorhersagen, wie sich ein Bestand entwickelt?
      </h2>
      <Text s="Eine Tasse Tee kühlt ab, Bakterien vermehren sich, ein Gerücht spricht sich herum. Oft kennt man keine Formel für den
        Bestand – wohl aber eine Regel, wovon seine Änderung abhängt: Je mehr Bakterien, desto schneller kommen neue dazu. Je heißer
        der Tee im Vergleich zum Raum, desto schneller kühlt er ab." style={FLIESS} />
      <Text s="Eine solche Regel ist eine Differenzialgleichung. In sechs Schritten lernst du, wie man aus ihr den ganzen Verlauf
        gewinnt: exakt mit der e-Funktion für exponentielles, beschränktes und logistisches Wachstum – und näherungsweise mit dem
        Euler-Verfahren, so wie ein Rechner es macht." style={FLIESS} />

      <WachstumAnimation art="feld" offen />

      <Schritt nr="1" titel="Bestand und Änderungsrate: Was eine Differenzialgleichung ist" />
      <Text s="$f(t)$ ist der Bestand zur Zeit $t$, $f′(t)$ seine momentane Änderungsrate. In einer Nährlösung teilen sich Bakterien
        unabhängig voneinander. Doppelt so viele Bakterien liefern also doppelt so viele neue pro Stunde: Die Änderungsrate ist
        proportional zum Bestand, zum Beispiel $f′(t) = 0,5 \cdot f(t)$." style={FLIESS} />
      <Kasten titel="Definition">
        <Text s="Eine Gleichung, die eine Funktion $f$ mit ihrer Ableitung $f′$ verknüpft, heißt Differenzialgleichung (DGL). Eine
          Lösung ist eine Funktion, die die Gleichung für alle $t$ erfüllt." style={STARK} />
      </Kasten>
      <Text s="Ob eine Funktion eine Lösung ist, prüfst du durch Einsetzen: ableiten, beide Seiten berechnen, vergleichen." style={FLIESS} />
      <Formeln zeilen={[
        "f(t) = 3e^{0,5t}: \\quad f′(t) = 1,5e^{0,5t} = 0,5 \\cdot 3e^{0,5t} = 0,5 \\cdot f(t)",
        "g(t) = t^2 + 3: \\quad g′(0) = 0, \\quad 0,5 \\cdot g(0) = 1,5",
      ]} max={17} />
      <Text s="$3e^{0,5t}$ löst die DGL, $t^2 + 3$ nicht – schon bei $t = 0$ passen die beiden Seiten nicht zusammen. Auch $5e^{0,5t}$
        ist eine Lösung: Die DGL allein legt die Funktion nicht fest. Erst der Anfangswert $f(0)$ wählt eine Kurve aus. Das
        Richtungsfeld oben zeigt, warum: Jeder Startpunkt hat seine eigene Lösungskurve." style={FLIESS} />

      <Schritt nr="2" titel={"Exponentielles Wachstum: f′\u00A0=\u00A0k\u00A0·\u00A0f"} />
      <Text s="Ist die Änderungsrate proportional zum Bestand, gilt $f′(t) = k \cdot f(t)$ mit einer Konstanten $k$. Für $k > 0$
        wächst der Bestand, für $k < 0$ nimmt er ab. Die Lösung mit dem Anfangswert $f(0)$ ist" style={FLIESS} />
      <Formeln zeilen={["f(t) = f(0) \\cdot e^{kt}"]} max={18} />
      <Text s="Einsetzen bestätigt die DGL und den Anfangswert:" style={FLIESS} />
      <Formeln zeilen={[
        "f′(t) = f(0) \\cdot ke^{kt} = k \\cdot f(0)e^{kt} = k \\cdot f(t)",
        "f(0) \\cdot e^0 = f(0)",
      ]} max={17} />
      <Kasten titel="Warum es keine anderen Lösungen gibt">
        <Text s="Ist $g$ irgendeine Lösung, betrachte $h(t) = g(t) \cdot e^{−kt}$. Mit der Produktregel und $g′ = k \cdot g$ gilt:" style={{ ...FLIESS, marginTop: 8, marginBottom: 0 }} />
        <Formeln zeilen={["h′(t) = g′(t) \\cdot e^{−kt} − k \\cdot g(t) \\cdot e^{−kt}", "= (g′(t) − k \\cdot g(t)) \\cdot e^{−kt} = 0"]} max={16} />
        <Text s="Eine Funktion mit der Ableitung 0 auf einem Intervall ist konstant. Also ist $h(t) = h(0) = g(0)$ und damit
          $g(t) = g(0) \cdot e^{kt}$ – genau unsere Lösung." style={{ ...FLIESS, marginBottom: 10 }} />
      </Kasten>
      <Text s="Typisch für exponentielles Wachstum: In gleichen Zeiten wächst der Bestand um denselben Faktor, denn
        $f(t + T) = f(t) \cdot e^{kT}$. Aus $e^{kT} = 2$ folgt die Verdopplungszeit, aus $e^{kT} = 0,5$ bei $k < 0$ die Halbwertszeit:" style={FLIESS} />
      <Formeln zeilen={["T_D = \\frac{\\ln 2}{k} \\quad (k > 0), \\qquad T_H = −\\frac{\\ln 2}{k} \\quad (k < 0)"]} max={17} />
      <Text s="Verdoppelt sich eine Bakterienkultur alle 3 Stunden, ist $k = \frac{\ln 2}{3} ≈ 0,231$ pro Stunde." style={FLIESS} />
      <WachstumAnimation art="exp" />

      <Schritt nr="3" titel={"Beschränktes Wachstum: f′\u00A0=\u00A0k\u00A0·\u00A0(S\u00A0−\u00A0f)"} />
      <Text s="Ein Tee mit 90 °C steht in einem Raum mit 20 °C. Nach dem Abkühlungsgesetz von Newton ist die Abkühlrate
        proportional zur Temperaturdifferenz: Je größer der Abstand zum Raum, desto schneller kühlt der Tee ab. Allgemein ist beim
        beschränkten Wachstum die Änderungsrate proportional zum Abstand von einer Schranke $S$:" style={FLIESS} />
      <Formeln zeilen={["f′(t) = k \\cdot (S − f(t)), \\quad k > 0"]} max={18} />
      <Text s="Der Trick: Betrachte den Abstand $d(t) = S − f(t)$. Er erfüllt die DGL aus Schritt 2 – mit $−k$ statt $k$:" style={FLIESS} />
      <Formeln zeilen={[
        "d′(t) = −f′(t) = −k \\cdot (S − f(t)) = −k \\cdot d(t)",
        "d(t) = d(0) \\cdot e^{−kt} = (S − f(0)) \\cdot e^{−kt}",
        "f(t) = S − (S − f(0)) \\cdot e^{−kt}",
      ]} max={17} />
      <Text s="Der Abstand zur Schranke nimmt also exponentiell ab und halbiert sich alle $\frac{\ln 2}{k}$ Zeiteinheiten. Weil
        $e^{−kt}$ nie 0 wird, erreicht $f$ die Schranke nie ganz. Und weil $d$ nach Schritt 2 eindeutig ist, gibt es auch hier keine
        anderen Lösungen. Probe durch Einsetzen:" style={FLIESS} />
      <Formeln zeilen={["f′(t) = k \\cdot (S − f(0)) \\cdot e^{−kt} = k \\cdot (S − f(t))"]} max={17} />
      <Kasten titel="Beispiel: Tee">
        <Text s={"Mit $S = 20$, $f(0) = 90$ und $k = 0,1$ pro Minute ist $f(t) = 20 + 70e^{−0,1t}$. Nach 10 Minuten ist"
          + " $f(10) = 20 + 70e^{−1} ≈ 45,75$ °C. Auf 40 °C ist der Tee abgekühlt, wenn $70e^{−0,1t} = 20$ ist, also nach"
          + " $t = 10 \\ln 3,5 ≈ 12,53$ Minuten."} style={STARK} />
      </Kasten>
      <Text s="Dasselbe Modell beschreibt eine Sättigung. Bei einer Infusion fließen 6 mg Wirkstoff pro Stunde ins Blut, und der
        Körper baut in jedem Moment $0,2 \cdot f(t)$ mg pro Stunde ab – 20 % der vorhandenen Menge pro Stunde. Ist zu Beginn kein
        Wirkstoff im Blut, gilt:" style={FLIESS} />
      <Formeln zeilen={[
        "f′(t) = 6 − 0,2 \\cdot f(t) = 0,2 \\cdot (30 − f(t))",
        "f(t) = 30 − 30e^{−0,2t}, \\quad f(5) = 30 − 30e^{−1} ≈ 18,96",
      ]} max={17} />
      <Text s="Die Schranke $S = 30$ mg ist das Gleichgewicht: Bei 30 mg werden pro Stunde genau 6 mg abgebaut – so viel, wie
        zufließt." style={FLIESS} />
      <WachstumAnimation art="beschraenkt" />

      <Schritt nr="4" titel={"Logistisches Wachstum: f′\u00A0=\u00A0k\u00A0·\u00A0f\u00A0·\u00A0(S\u00A0−\u00A0f)"} />
      <Text s="An einer Schule mit 1000 Schülern verbreitet sich ein Gerücht. Neue Mitwisser entstehen, wenn jemand, der es kennt,
        auf jemanden trifft, der es noch nicht kennt. Die Zahl solcher Begegnungen ist proportional zu $f$ und zu $S − f$:" style={FLIESS} />
      <Formeln zeilen={["f′(t) = k \\cdot f(t) \\cdot (S − f(t))"]} max={18} />
      <Text s="Am Anfang ist $S − f ≈ S$, also $f′ ≈ kS \cdot f$ – fast exponentielles Wachstum. Am Ende ist $f ≈ S$, also
        $f′ ≈ kS \cdot (S − f)$ – fast beschränktes Wachstum. Den Übergang findest du mit dem Kehrwert $g = \frac{1}{f}$ (für $f > 0$):" style={FLIESS} />
      <Formeln zeilen={[
        "g′(t) = −\\frac{f′(t)}{f(t)^2} = −\\frac{k \\cdot (S − f(t))}{f(t)} = k − kS \\cdot g(t)",
        "g′(t) = kS \\cdot \\left(\\frac{1}{S} − g(t)\\right)",
      ]} max={17} />
      <Text s="Das ist beschränktes Wachstum mit der Schranke $\frac{1}{S}$ und der Konstanten $kS$. Nach Schritt 3 ist
        $g(t) = \frac{1}{S} − \left(\frac{1}{S} − \frac{1}{f(0)}\right)e^{−kSt}$. Der Kehrwert, mit $S$ erweitert, ist die logistische
        Funktion:" style={FLIESS} />
      <Formeln zeilen={["f(t) = \\frac{S}{1 + \\left(\\frac{S}{f(0)} − 1\\right)e^{−kSt}}"]} max={18} />
      <Text s="Probe durch Einsetzen: Mit $a = \frac{S}{f(0)} − 1$ und $q(t) = 1 + ae^{−kSt}$ ist $f = \frac{S}{q}$ und
        $q − 1 = ae^{−kSt}$:" style={FLIESS} />
      <Formeln zeilen={[
        "f′(t) = −\\frac{S \\cdot q′(t)}{q(t)^2} = \\frac{kS^2 \\cdot ae^{−kSt}}{q(t)^2}",
        "k \\cdot f \\cdot (S − f) = k \\cdot \\frac{S}{q} \\cdot \\frac{Sq − S}{q} = \\frac{kS^2 \\cdot (q − 1)}{q^2}",
        "= \\frac{kS^2 \\cdot ae^{−kSt}}{q^2}",
      ]} max={16} />
      <Text s="Beide Seiten stimmen überein. Wo wächst der Bestand am schnellsten? Leite die DGL noch einmal ab:" style={FLIESS} />
      <Formeln zeilen={["f″(t) = k \\cdot (f′ \\cdot (S − f) − f \\cdot f′) = k \\cdot f′(t) \\cdot (S − 2f(t))"]} max={17} />
      <Text s="Für $0 < f(0) < S$ bleibt $f$ zwischen 0 und $S$, also ist $f′ > 0$. Dann wechselt $f″$ genau dort das Vorzeichen, wo
        $f = \frac{S}{2}$ ist: Der Wendepunkt liegt bei der halben Schranke, und dort ist die Änderungsrate am größten. Aus
        $q(t_W) = 2$ folgt $ae^{−kSt_W} = 1$:" style={FLIESS} />
      <Formeln zeilen={["f′_{max} = k \\cdot \\frac{S}{2} \\cdot \\frac{S}{2} = \\frac{kS^2}{4}, \\qquad t_W = \\frac{\\ln a}{kS} \\quad (a > 1)"]} max={17} />
      <Kasten titel="Beispiel: Gerücht">
        <Text s="Mit $S = 1000$, $f(0) = 10$ und $k = 0,0005$ ist $kS = 0,5$ und $a = 99$, also $f(t) = \frac{1000}{1 + 99e^{−0,5t}}$.
          Am schnellsten verbreitet sich das Gerücht nach $t_W = \frac{\ln 99}{0,5} ≈ 9,19$ Tagen, mit $\frac{0,0005 \cdot 1000^2}{4} = 125$
          neuen Mitwissern pro Tag." style={STARK} />
      </Kasten>
      <WachstumAnimation art="logistisch" />
      <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, margin: "18px 0 6px" }}>Die drei Modelle im Vergleich</p>
      <ModellUebersicht />

      <Schritt nr="5" titel="Richtungsfeld und Euler-Verfahren" />
      <Text s="Eine DGL schreibt in jedem Punkt $(t \mid y)$ eine Steigung vor. Zeichnet man an vielen Punkten ein kurzes Strichstück
        mit dieser Steigung, entsteht das Richtungsfeld. Jede Lösungskurve verläuft überall tangential zu den Strichen. Bei unseren
        drei Modellen hängt die Steigung nur von $y$ ab – in jeder waagrechten Reihe sind die Striche gleich." style={FLIESS} />
      <Text s="Daraus wird ein Rechenverfahren, das auf Leonhard Euler zurückgeht: Vom Startpunkt geht man ein kleines Stück $Δt$
        entlang der Tangente, berechnet am neuen Punkt die neue Steigung und wiederholt das:" style={FLIESS} />
      <Formeln zeilen={["f(t + Δt) ≈ f(t) + Δt \\cdot f′(t), \\quad f′(t) \\text{ aus der DGL}"]} max={17} />
      <Text s="Beispiel: $f′ = 0,5 \cdot (10 − f)$ mit $f(0) = 2$ und $Δt = 0,5$:" style={FLIESS} />
      <Formeln zeilen={[
        "f(0,5) ≈ 2 + 0,5 \\cdot 0,5 \\cdot (10 − 2) = 2 + 2 = 4",
        "f(1) ≈ 4 + 0,5 \\cdot 0,5 \\cdot (10 − 4) = 4 + 1,5 = 5,5",
        "f(1,5) ≈ 6,625, \\quad f(2) ≈ 7,46875",
      ]} max={17} />
      <Text s="Die exakte Lösung ist $f(t) = 10 − 8e^{−0,5t}$ mit $f(2) = 10 − 8e^{−1} ≈ 7,06$. Je kleiner $Δt$, desto näher kommt
        Euler heran:" style={FLIESS} />
      <EulerTabelle />
      <Text s="Halbiert man $Δt$, halbiert sich der Fehler ungefähr – für kleine $Δt$ ist er etwa proportional zu $Δt$. Hier liegt
        Euler immer über der Kurve: Die Kurve ist rechtsgekrümmt, ihre Tangenten liegen über ihr. So rechnen auch Computer
        Differenzialgleichungen, die man nicht exakt lösen kann – nur mit verfeinerten Verfahren." style={FLIESS} />
      <Kasten titel="Für Profis: Euler und die Zahl e">
        <Text s="Für $f′ = k \cdot f$ liefert jeder Euler-Schritt den Faktor $1 + kΔt$. Mit $n$ Schritten bis $t$, also
          $Δt = \frac{t}{n}$, ist $f(t) ≈ f(0) \cdot \left(1 + \frac{kt}{n}\right)^n$. Für $n \to \infty$ geht das gegen
          $f(0) \cdot e^{kt}$ – derselbe Grenzwert, mit dem man die Zahl $e$ definieren kann." style={STARK} />
      </Kasten>
      <WachstumAnimation art="euler" />

      <Schritt nr="6" titel="Welches Modell passt? Messwerte prüfen – und die Grenzen" />
      <Text s="In der Praxis hat man Messwerte und sucht das Modell. Bei gleichen Zeitabständen helfen Differenzen und Quotienten
        aufeinanderfolgender Werte. Vier Beispielreihen:" style={FLIESS} />
      <DatenTabelle />
      <Text s="Linear: gleiche Differenzen. Exponentiell: gleiche Quotienten, denn in gleichen Zeiten kommt derselbe Faktor
        $e^k$ dazu. Beschränkt: Die Differenzen schrumpfen um einen festen Faktor, weil der Abstand zur Schranke exponentiell
        abnimmt. Logistisch: Die Differenzen werden erst größer und dann kleiner – der Wendepunkt liegt dort, wo sie am größten
        sind. Echte Messwerte schwanken, deshalb gilt das immer nur ungefähr." style={FLIESS} />
      <Punkt titel="Nichts wächst ewig exponentiell" s="Irgendwann werden Platz, Nahrung oder Kunden knapp. Exponentielles Wachstum
        passt nur für einen begrenzten Zeitraum." />
      <Punkt titel="Die Schranke ist oft unbekannt" s="$S$ muss man schätzen, etwa aus der Kapazität oder aus den Daten selbst. Ein
        falsches $S$ verändert die ganze Vorhersage." />
      <Punkt titel="Konstanten bleiben nicht immer konstant" s="Ändert sich die Raumtemperatur oder greift jemand ein, gilt die DGL
        mit festem $k$ und $S$ nicht mehr." />
      <Punkt titel="Bestände sind oft ganzzahlig" s="Schüler oder Kaninchen kommen einzeln. Das stetige Modell ist eine Näherung, die
        für große Bestände gut passt." />
      <Kasten titel="Zum Mitnehmen">
        <Formeln zeilen={[
          "f′ = k \\cdot f \\;\\Rightarrow\\; f(t) = f(0) \\cdot e^{kt}",
          "f′ = k \\cdot (S − f) \\;\\Rightarrow\\; f(t) = S − (S − f(0)) \\cdot e^{−kt}",
          "f′ = k \\cdot f \\cdot (S − f) \\;\\Rightarrow\\; f(t) = \\frac{S}{1 + \\left(\\frac{S}{f(0)} − 1\\right)e^{−kSt}}",
        ]} max={15} />
        <Text s="Aus der Änderungsrate allein wird mit einem Anfangswert der ganze Verlauf – exakt mit der e-Funktion oder Schritt
          für Schritt mit Euler." style={STARK} />
      </Kasten>

      <div style={{ ...KARTE, margin: "22px 0" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 12 }}>Labor: Modell wählen, k, S und f(0) einstellen, Euler gegen exakt</p>
        <WachstumLabor />
      </div>

      <Trenner />

      <Kicker>Jetzt selbst üben</Kicker>
      <H3>DGL, Parameter, Bestände, Euler</H3>
      <WachstumTrainer />

      {gehe && (
        <div style={{ ...KARTE, marginTop: 22, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: C.tinte, marginBottom: 4 }}>Exponentialfunktionen trainieren</p>
            <p style={{ fontSize: 13.5, color: C.grau, fontWeight: 300, lineHeight: 1.6 }}>Messwerte, Halbwertszeiten, Logarithmen – im Werkzeug Wachstum und Logarithmen.</p>
          </div>
          <button type="button" onClick={() => gehe({ ansicht: "wachstum" })} className="px-5 py-3" style={KNOPF(true)}>Zu Wachstum und Logarithmen</button>
        </div>
      )}

      <Trenner />

      <Kicker>Deine GFS</Kicker>
      <H3>Der rote Faden für den Vortrag</H3>
      <RoterFaden gliederung={GLIEDERUNG} tipps={TIPPS} hinweis="den Abschnitt zum logistischen Wachstum" />

      <div style={{ height: 8 }} />
      <Kicker>Kolloquium</Kicker>
      <H3>Die Fragen nach dem Vortrag trainieren</H3>
      <Kolloquium fragen={KOLLOQUIUM} speicher="mm-gfs-wachstum-kolloquium" />
    </div>
  );
}
