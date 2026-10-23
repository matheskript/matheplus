import React, { useMemo, useState } from "react";
import { C } from "./base1.jsx";
import { M, Text } from "./func3.jsx";
import { MatheFeld } from "./matheTastatur.jsx";
import { FLIESS, KARTE, ZELLE, Formeln, Schritt, Kasten, Chip, PlusMinus, Kicker, H3, Trenner, Inline, RoterFaden, Kolloquium } from "./funcGfsBausteine.jsx";
import { lauf } from "./funcErklaeranimation.jsx";
import { AnimKarte } from "./funcAnimKarte.jsx";
import {
  dk, dichte, vert, intervall, median, erwartung, zufallszahlen, simuliere, histogramm, mittel,
  TREPPE_L, TREPPE_WERTE, GRENZ_TABELLE, KERNE, uebrigNach,
  ARTEN, aufgabe, felder, auftrag, pruefe, rechenweg, tipp, RUNDUNG, GLIEDERUNG, TIPPS, KOLLOQUIUM,
} from "./gfsExponential.js";

/* ============================================================
   Kurs GFS – Themenseite „Die Exponentialverteilung“
   (Kursstufe 2, Kapitel X Normalverteilung / stetige Zufallsgrößen)
   Aufbau wie das Ziegenproblem: Leitfrage · Herleitung in sechs Schritten
   (geometrische Verteilung → e^(−λt), Dichte und Fläche, Erwartungswert
   mit partieller Integration, Median, Gedächtnislosigkeit, Anwendungen
   und Grenzen) · fünf Erkläranimationen · Labor (λ, Fläche, Simulation,
   Gedächtnis-Demo) · Übungen aus vier Generatoren · roter Faden ·
   Kolloquium. Logik in gfsExponential.js (tests/gfsExponential.test.mjs).
   ============================================================ */

const KNOPF = (aktiv = true, farbe = C.see) => ({
  background: aktiv ? farbe : C.hellgrau, color: C.weiss, border: "none", borderRadius: 999, fontSize: 15, fontWeight: 600,
  fontFamily: "inherit", cursor: aktiv ? "pointer" : "default",
});
const LINK = { background: "none", border: "none", color: C.see, fontSize: 13, fontFamily: "inherit", cursor: "pointer", padding: 0, textDecoration: "underline" };
/* aktuelle Aufgabe für automatische Prüfungen (tests/ui/gfsexponential.ui.py) */
const merk = (a) => { if (typeof window !== "undefined") window.__geAufgabe = a; return a; };

const T = (props) => <text fontFamily="inherit" {...props} />;
const mix = (a, b, p) => a + (b - a) * p;
const fenster = (t, a, b, c, d) => lauf(t, a, b) * (1 - lauf(t, c, d));
const pfad = (pts) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join("");
/* Kurve y = f(t) von … bis, in Bildkoordinaten */
function kurvenPfad(f, von, bis, sx, sy, schritt = 0.05) {
  const pts = [];
  for (let t = von; t < bis - 1e-9; t += schritt) pts.push([sx(t), sy(f(t))]);
  pts.push([sx(bis), sy(f(bis))]);
  return pfad(pts);
}
/* Fläche unter f zwischen von und bis (bis zur Achse y0) */
function flaechenPfad(f, von, bis, sx, sy, y0, schritt = 0.05) {
  if (bis - von < 1e-6) return "";
  const pts = [[sx(von), y0]];
  for (let t = von; t < bis - 1e-9; t += schritt) pts.push([sx(t), sy(f(t))]);
  pts.push([sx(bis), sy(f(bis))], [sx(bis), y0]);
  return `${pfad(pts)}Z`;
}
/* hochgestellter Teil in SVG-Text */
const Hoch = ({ children }) => <tspan dy="-6" fontSize="0.72em">{children}</tspan>;
const Runter = () => <tspan dy="6"> </tspan>;

function Pille({ x, y, text, o = 1, farbe = C.see, voll = false, breite, gross = 12.5 }) {
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
function Achsen({ x0, x1, y0, y1, tx, ty, xt = [], yt = [], o = 1 }) {
  if (o <= 0.001) return null;
  return (
    <g opacity={o}>
      <line x1={x0} y1={y0} x2={x1 + 8} y2={y0} stroke={C.tinte} strokeWidth="1.2" />
      <path d={`M${x1 + 8} ${y0 - 3.5} L${x1 + 13} ${y0} L${x1 + 8} ${y0 + 3.5}`} fill={C.tinte} />
      <line x1={x0} y1={y0} x2={x0} y2={y1 - 6} stroke={C.tinte} strokeWidth="1.2" />
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
    </g>
  );
}

/* ======================================================================
   Kopfbild (viewBox 160 × 120): Dichte e^(−t); nach s = 1 (1000 h) wird der
   Ausläufer neu ausgerichtet – gestrichelt liegt er exakt auf der Kurve.
   ====================================================================== */
export function ExponentialBild() {
  const X0 = 16, Y0 = 98, SX = 30, SY = 70, ENDE = 4.35;
  const x = (t) => X0 + t * SX, y = (v) => Y0 - v * SY;
  const f = (t) => Math.exp(-t);
  const links = flaechenPfad(f, 0, 1, x, (v) => y(v), Y0);
  const rechts = flaechenPfad(f, 1, ENDE, x, (v) => y(v), Y0);
  const linie = kurvenPfad(f, 0, ENDE, x, (v) => y(v));
  const neu = kurvenPfad(f, 0, ENDE - 1, x, (v) => y(v));      // Rest ab s, um s verschoben und mit e gestreckt = f selbst
  return (
    <svg className="gtk-bild" viewBox="0 0 160 120" role="img" style={{ maxWidth: 320, marginLeft: "auto", marginRight: "auto" }}
      aria-label="Dichte der Exponentialverteilung: Der Teil nach 1000 Stunden, neu ab 0 gezählt, liegt genau auf der ursprünglichen Kurve – wieder wie neu">
      <defs>
        <linearGradient id="gtk-e-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FFE9A0" stopOpacity="0.95" /><stop offset="55%" stopColor="#EDBB00" stopOpacity="0.75" /><stop offset="100%" stopColor="#C9971A" stopOpacity="0.35" /></linearGradient>
        <radialGradient id="gtk-e-glut" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#EDBB00" stopOpacity="0.55" /><stop offset="100%" stopColor="#EDBB00" stopOpacity="0" /></radialGradient>
      </defs>
      <ellipse className="gtk-glimmen" cx={x(0.9)} cy={y(0.55)} rx="34" ry="30" fill="url(#gtk-e-glut)" />
      <line x1={X0} y1={Y0} x2="150" y2={Y0} stroke="rgba(255,255,255,0.45)" strokeWidth="0.8" />
      <line x1={X0} y1={Y0} x2={X0} y2="20" stroke="rgba(255,255,255,0.45)" strokeWidth="0.8" />
      <g className="gtk-auf">
        <path d={links} fill="rgba(255,255,255,0.10)" />
        <path d={rechts} fill="url(#gtk-e-gold)" />
        <path d={linie} fill="none" stroke="#EDBB00" strokeWidth="2.2" strokeLinecap="round" />
      </g>
      <g className="gtk-auf" style={{ animationDelay: ".3s" }}>
        <line x1={x(1)} y1={Y0} x2={x(1)} y2="22" stroke="#FFFFFF" strokeOpacity="0.7" strokeWidth="0.8" strokeDasharray="2 2" />
        <T x={x(0)} y="108" textAnchor="middle" fontFamily="Montserrat, sans-serif" fontSize="6.5" fontWeight="700" fill="rgba(255,255,255,0.7)">0</T>
        <T x={x(1)} y="108" textAnchor="middle" fontFamily="Montserrat, sans-serif" fontSize="6.5" fontWeight="700" fill="rgba(255,255,255,0.85)">1000 h</T>
      </g>
      <g className="gtk-auf" style={{ animationDelay: ".55s" }}>
        <path d={neu} fill="none" stroke="#FFFFFF" strokeWidth="1.1" strokeDasharray="2.4 2.2" strokeLinecap="round" />
        <path d={`M${x(1) + 4} ${y(f(1)) - 5} Q${x(1) + 2} ${y(1) - 4} ${x(0) + 9} ${y(1) - 5}`} fill="none" stroke="#FFE9A0" strokeWidth="1" />
        <path d={`M${x(0) + 13} ${y(1) - 8.4} L${x(0) + 8.5} ${y(1) - 5} L${x(0) + 13} ${y(1) - 1.8}`} fill="none" stroke="#FFE9A0" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g className="gtk-auf" style={{ animationDelay: ".75s" }}>
        <rect x="80" y="27" width="64" height="15" rx="7.5" fill="#EDBB00" />
        <T x="112" y="37.4" textAnchor="middle" fontFamily="Montserrat, sans-serif" fontSize="7.6" fontWeight="800" fill="#0B0C10">wieder wie neu</T>
        <T x="112" y="54" textAnchor="middle" fontFamily="Montserrat, sans-serif" fontSize="6" fontWeight="600" fill="rgba(255,255,255,0.7)">Rest ab 1000 h, neu ab 0</T>
      </g>
    </svg>
  );
}

/* ======================================================================
   Erkläranimationen (Szenen sind reine Funktionen der Zeit; Schlussbild = Standbild)
     treppe       – geometrische Verteilung mit immer feineren Schritten → e^(−λt)
     flaeche      – F oben, f unten: Fläche bis t = Höhe von F; P(1 ≤ T ≤ 3); Gesamtfläche 1
     lage         – Median teilt die Fläche, Erwartungswert ist der Schwerpunkt
     gedaechtnis  – Rest nach 1000 h, neu ab 0 und auf 1 gestreckt = ursprüngliche Kurve
     zerfall      – 100 Kerne, Halbwertszeit als Median
   ====================================================================== */

/* 1 · Von der Treppe zur Kurve */
const TR_DAUER = 24;
const trSchritte = () => [
  { von: 0, text: "Im Schnitt kommen 0,5 Anrufe pro Minute. Wir teilen die Zeit in Schritte von 1 Minute – in jedem kommt der Anruf mit 0,5." },
  { von: 4.5, text: "P(T > t) fällt als Treppe: Nach jeder Minute bleibt die Hälfte. Bei t = 2 sind es 0,5² = 0,25." },
  { von: 9, text: "Schritte von 0,5 Minuten mit je 0,25: Bis t = 2 sind es vier Schritte, also 0,75⁴ ≈ 0,316." },
  { von: 14, text: "Je feiner die Schritte, desto glatter die Treppe: 0,875⁸ ≈ 0,344, mit 40 Schritten 0,975⁴⁰ ≈ 0,363." },
  { von: 19, text: "Im Grenzfall wird die Treppe zur Kurve e^(−0,5t). Bei t = 2 ergibt sich e^(−1) ≈ 0,368." },
];
const TA = { X0: 50, X1: 336, Y0: 232, Y1: 56, T: 6 };
const tax = (t) => TA.X0 + (t / TA.T) * (TA.X1 - TA.X0);
const tay = (p) => TA.Y0 - p * (TA.Y0 - TA.Y1);
function treppenPfad(dt, bis) {
  const p = TREPPE_L * dt;
  const pts = [[tax(0), tay(1)]];
  let k = 0, w = 1;
  while ((k + 1) * dt <= bis + 1e-9) {
    k += 1;
    pts.push([tax(k * dt), tay(w)]);
    w *= 1 - p;
    pts.push([tax(k * dt), tay(w)]);
  }
  pts.push([tax(bis), tay(w)]);
  return pfad(pts);
}
function trZeichne(t) {
  const achse = lauf(t, 0.2, 1.2);
  const stufen = [
    { an: lauf(t, 1.4, 4.2), aus: lauf(t, 9.2, 10.2) },
    { an: lauf(t, 9.4, 11.4), aus: lauf(t, 14, 14.8) },
    { an: lauf(t, 14.2, 15.6), aus: lauf(t, 16.2, 17) },
    { an: lauf(t, 16.4, 17.8), aus: lauf(t, 19.2, 20) },
  ];
  const kurve = lauf(t, 19.4, 21.4);
  const marke = lauf(t, 5, 6);
  const idx = kurve > 0.5 ? 4 : stufen.reduce((a, s, i) => (s.an > 0.5 ? i : a), 0);
  const wert = idx === 4 ? Math.exp(-1) : TREPPE_WERTE[idx].wert;
  const W = TREPPE_WERTE[Math.min(idx, 3)];
  return (
    <g>
      <Achsen x0={TA.X0} x1={TA.X1} y0={TA.Y0} y1={TA.Y1} tx={tax} ty={tay} o={achse}
        xt={[0, 1, 2, 3, 4, 5, 6].map((v) => [v, String(v)])} yt={[[0.25, "0,25"], [0.5, "0,5"], [0.75, "0,75"], [1, "1"]]} />
      <g opacity={achse}>
        <T x={TA.X0 + 8} y={TA.Y1 - 8} fontSize="11.5" fontWeight="800" fill={C.tinte}>P(T &gt; t)</T>
        <T x={TA.X1 + 12} y={TA.Y0 + 30} textAnchor="end" fontSize="10.5" fontWeight="600" fill={C.grau}>t in Minuten</T>
      </g>
      <g opacity={lauf(t, 0.6, 1.4)}>
        {idx < 4 ? (
          <T x="190" y="22" textAnchor="middle" fontSize="12" fontWeight="800" fill={C.see}>Schritte von {dk(W.dt, 2)} min · je Schritt {dk(W.p, 3)}</T>
        ) : (
          <T x="190" y="22" textAnchor="middle" fontSize="12.5" fontWeight="800" fill={C.gold}>Grenzfall: P(T &gt; t) = e<Hoch>−0,5t</Hoch></T>
        )}
      </g>
      {stufen.map((s, i) => s.an > 0.001 && (
        <path key={i} d={treppenPfad(TREPPE_WERTE[i].dt, TA.T * s.an)} fill="none" stroke={C.see} strokeWidth="2.2" strokeLinejoin="round"
          opacity={1 - 0.82 * s.aus} />
      ))}
      {kurve > 0.001 && <path d={kurvenPfad((x) => Math.exp(-TREPPE_L * x), 0, TA.T * kurve, tax, tay)} fill="none" stroke={C.gold} strokeWidth="2.8" strokeLinecap="round" />}
      {marke > 0.001 && (
        <g opacity={marke}>
          <line x1={tax(2)} y1={TA.Y0} x2={tax(2)} y2={TA.Y1} stroke={C.hellgrau} strokeWidth="1.1" strokeDasharray="4 4" />
          <circle cx={tax(2)} cy={tay(wert)} r="4.6" fill={C.flaggold} stroke={C.gold} strokeWidth="1.3" />
          <Pille x={tax(2) + 40} y={tay(wert) - 12} text={dk(wert, 3)} farbe={idx === 4 ? C.gold : C.see} voll={idx === 4} breite={58} gross={12} />
        </g>
      )}
    </g>
  );
}

/* 2 · Dichte und Fläche */
const FL_DAUER = 24;
const flSchritte = () => [
  { von: 0, text: "Oben die Verteilungsfunktion F(t) = P(T ≤ t), unten ihre Ableitung, die Dichte f(t) = 0,5e^(−0,5t)." },
  { von: 5, text: "Ein Punkt wandert nach rechts. Die Fläche unter f bis zu ihm ist genau die Höhe von F an derselben Stelle." },
  { von: 12, text: "Wahrscheinlichkeiten sind Flächen: P(1 ≤ T ≤ 3) = F(3) − F(1) = e^(−0,5) − e^(−1,5) ≈ 0,383." },
  { von: 18, text: "Die ganze Fläche ist 1 – irgendwann kommt der Anruf sicher. Ein einzelner Zeitpunkt hat die Fläche 0." },
];
const FA = { X0: 50, X1: 330, T: 8, FY0: 126, FY1: 46, fY0: 292, fY1: 200 };
const fax = (t) => FA.X0 + (t / FA.T) * (FA.X1 - FA.X0);
const faF = (v) => FA.FY0 - v * (FA.FY0 - FA.FY1);
const faf = (v) => FA.fY0 - (v / 0.5) * (FA.fY0 - FA.fY1);
const FF = (t) => vert(0.5, t), Ff = (t) => dichte(0.5, t);
function flZeichne(t) {
  const achse = lauf(t, 0.2, 1);
  const bis = FA.T * lauf(t, 0.4, 2.6);
  const sw = fenster(t, 5.2, 5.8, 11.4, 12.2);
  const u = 0.05 + 3.95 * lauf(t, 5.6, 10.8);
  const iv = fenster(t, 12.4, 13.4, 18, 18.8);
  const ges = lauf(t, 18.6, 19.8), eins = lauf(t, 20.6, 21.6);
  const xt = [0, 2, 4, 6, 8].map((v) => [v, String(v)]);
  const F1 = FF(1), F3 = FF(3);
  return (
    <g>
      <Achsen x0={FA.X0} x1={FA.X1} y0={FA.FY0} y1={FA.FY1} tx={fax} ty={faF} xt={xt} yt={[[0.5, "0,5"], [1, "1"]]} o={achse} />
      <Achsen x0={FA.X0} x1={FA.X1} y0={FA.fY0} y1={FA.fY1} tx={fax} ty={faf} xt={xt} yt={[[0.25, "0,25"], [0.5, "0,5"]]} o={achse} />
      <g opacity={achse}>
        <T x={FA.X0 + 8} y="32" fontSize="11.5" fontWeight="800" fill={C.see}>F(t) = P(T ≤ t)</T>
        <T x={FA.X1} y="196" textAnchor="end" fontSize="11.5" fontWeight="800" fill={C.gold}>f(t) = F′(t)</T>
        <T x={FA.X1 + 13} y={FA.fY0 + 30} textAnchor="end" fontSize="10.5" fontWeight="600" fill={C.grau}>t in Minuten</T>
      </g>
      {ges > 0.001 && <path d={flaechenPfad(Ff, 0, FA.T, fax, faf, FA.fY0)} fill={C.flaggold} opacity={0.32 * ges} />}
      {sw > 0.001 && <path d={flaechenPfad(Ff, 0, u, fax, faf, FA.fY0)} fill={C.flaggold} opacity={0.5 * sw} />}
      {iv > 0.001 && <path d={flaechenPfad(Ff, 1, 3, fax, faf, FA.fY0)} fill={C.see} opacity={0.35 * iv} />}
      {bis > 0.001 && <path d={kurvenPfad(FF, 0, bis, fax, faF)} fill="none" stroke={C.see} strokeWidth="2.4" strokeLinecap="round" />}
      {bis > 0.001 && <path d={kurvenPfad(Ff, 0, bis, fax, faf)} fill="none" stroke={C.gold} strokeWidth="2.4" strokeLinecap="round" />}
      {sw > 0.001 && (
        <g opacity={sw}>
          <line x1={fax(u)} y1={faF(FF(u))} x2={fax(u)} y2={faf(Ff(u))} stroke={C.hellgrau} strokeWidth="1" strokeDasharray="3 4" />
          <line x1={fax(u)} y1={FA.FY0} x2={fax(u)} y2={faF(FF(u))} stroke={C.flaggold} strokeWidth="4" strokeLinecap="round" />
          <circle cx={fax(u)} cy={faF(FF(u))} r="4" fill={C.see} stroke={C.weiss} strokeWidth="1.2" />
          <T x={fax(u) + 9} y={faF(FF(u)) + 17} fontSize="11.5" fontWeight="800" fill={C.see}>F ≈ {dk(FF(u), 2)}</T>
          <T x={fax(u) + 8} y={faf(Ff(u)) - 7} fontSize="11.5" fontWeight="800" fill={C.gold}>Fläche ≈ {dk(FF(u), 2)}</T>
        </g>
      )}
      {iv > 0.001 && (
        <g opacity={iv}>
          <line x1={fax(1)} y1={faF(F1)} x2={fax(6.6)} y2={faF(F1)} stroke={C.see} strokeWidth="1" strokeDasharray="3 3" />
          <line x1={fax(3)} y1={faF(F3)} x2={fax(6.6)} y2={faF(F3)} stroke={C.see} strokeWidth="1" strokeDasharray="3 3" />
          <path d={`M${fax(6.6)} ${faF(F1)} H${fax(6.6) + 6} V${faF(F3)} H${fax(6.6)}`} fill="none" stroke={C.see} strokeWidth="1.6" />
          <T x={fax(6.6) + 11} y={(faF(F1) + faF(F3)) / 2 + 4} fontSize="12" fontWeight="800" fill={C.see}>≈ 0,383</T>
          <T x={fax(4.2)} y={faf(0.2)} fontSize="12" fontWeight="800" fill={C.see}>P(1 ≤ T ≤ 3) ≈ 0,383</T>
        </g>
      )}
      {ges > 0.001 && (
        <g opacity={ges}>
          <line x1={FA.X0} y1={faF(1)} x2={FA.X1} y2={faF(1)} stroke={C.gold} strokeWidth="1" strokeDasharray="4 4" />
          <T x={fax(4.6)} y={faf(0.12)} fontSize="12" fontWeight="800" fill={C.gold}>Gesamtfläche = 1</T>
        </g>
      )}
      {eins > 0.001 && (
        <g opacity={eins}>
          <line x1={fax(2)} y1={FA.fY0} x2={fax(2)} y2={faf(Ff(2))} stroke={C.signal} strokeWidth="2.2" />
          <T x={fax(2) + 6} y={faf(Ff(2)) - 12} fontSize="11.5" fontWeight="800" fill={C.signal}>P(T = 2) = 0</T>
        </g>
      )}
    </g>
  );
}

/* 3 · Median und Erwartungswert */
const LG_DAUER = 24;
const lgSchritte = () => [
  { von: 0, text: "Die Dichte der Wartezeit bei λ = 0,5. Der Median m teilt die Fläche in zwei gleich große Hälften: m = ln 2/λ ≈ 1,39." },
  { von: 7, text: "Der Erwartungswert E(T) = 1/λ = 2 ist der Schwerpunkt der Fläche: Auf diesem Punkt wäre sie im Gleichgewicht." },
  { von: 13, text: "Der lange, flache Ausläufer rechts hat einen großen Hebel. Er zieht den Schwerpunkt nach rechts – den Median nicht." },
  { von: 19, text: "Darum liegt m vor E(T): Rund 63 % der Wartezeiten sind kürzer als der Mittelwert, denn 1 − e^(−1) ≈ 0,632." },
];
const LA = { X0: 46, X1: 330, T: 8, Y0: 214, H: 300 };
const lax = (t) => LA.X0 + (t / LA.T) * (LA.X1 - LA.X0);
const lay = (v) => LA.Y0 - v * LA.H;
const Lf = (t) => dichte(0.5, t);
const LM = median(0.5), LE = erwartung(0.5);
function lgZeichne(t) {
  const achse = lauf(t, 0.2, 1.6);
  const halb = fenster(t, 1.8, 3, 7.2, 8.4);
  const schwer = lauf(t, 7.4, 8.6);
  const hebel = fenster(t, 13.2, 14.6, 19, 19.8);
  const anteil = lauf(t, 19.2, 20.6);
  return (
    <g>
      <Achsen x0={LA.X0} x1={LA.X1} y0={LA.Y0} y1={64} tx={lax} ty={lay} xt={[0, 4, 6, 8].map((v) => [v, String(v)])} o={achse} />
      <T x={LA.X1} y="44" textAnchor="end" fontSize="11.5" fontWeight="800" fill={C.gold} opacity={achse}>Dichte f, λ = 0,5</T>
      <path d={flaechenPfad(Lf, 0, LA.T, lax, lay, LA.Y0)} fill={C.flaggold} opacity={0.3 * achse * (1 - halb)} />
      {halb > 0.001 && (
        <g opacity={halb}>
          <path d={flaechenPfad(Lf, 0, LM, lax, lay, LA.Y0)} fill={C.see} opacity="0.4" />
          <path d={flaechenPfad(Lf, LM, LA.T, lax, lay, LA.Y0)} fill={C.flaggold} opacity="0.45" />
          <T x={lax(LM / 2)} y={lay(Lf(LM / 2) / 2) + 4} textAnchor="middle" fontSize="12.5" fontWeight="800" fill={C.seeTief}>0,5</T>
          <T x={lax(3.3)} y={lay(0.055)} textAnchor="middle" fontSize="12.5" fontWeight="800" fill={C.gold}>0,5</T>
        </g>
      )}
      {hebel > 0.001 && <path d={flaechenPfad(Lf, 4, LA.T, lax, lay, LA.Y0)} fill={C.flaggold} opacity={0.55 * hebel} />}
      {anteil > 0.001 && <path d={flaechenPfad(Lf, 0, LE, lax, lay, LA.Y0)} fill={C.gold} opacity={0.5 * anteil} />}
      <path d={kurvenPfad(Lf, 0, LA.T * lauf(t, 0.4, 1.8), lax, lay)} fill="none" stroke={C.gold} strokeWidth="2.6" strokeLinecap="round" />
      {/* Median */}
      <g opacity={lauf(t, 2, 3)}>
        <line x1={lax(LM)} y1={LA.Y0} x2={lax(LM)} y2="46" stroke={C.see} strokeWidth="1.6" />
        <T x={lax(LM) - 5} y="44" textAnchor="end" fontSize="12" fontWeight="800" fill={C.see}>m ≈ 1,39</T>
      </g>
      {/* Erwartungswert als Schwerpunkt */}
      {schwer > 0.001 && (
        <g opacity={schwer}>
          <line x1={lax(LE)} y1={LA.Y0} x2={lax(LE)} y2="46" stroke={C.gold} strokeWidth="1.6" strokeDasharray="5 3" />
          <path d={`M${lax(LE)} ${LA.Y0 + 1} L${lax(LE) - 8} ${LA.Y0 + 14} L${lax(LE) + 8} ${LA.Y0 + 14} Z`} fill={C.flaggold} stroke={C.gold} strokeWidth="1.2" />
          <T x={lax(LE) + 5} y="44" fontSize="12" fontWeight="800" fill={C.gold}>E(T) = 2</T>
          <T x={lax(LE)} y={LA.Y0 + 30} textAnchor="middle" fontSize="11" fontWeight="700" fill={C.gold}>Schwerpunkt</T>
        </g>
      )}
      {hebel > 0.001 && (
        <g opacity={hebel}>
          <line x1={lax(3)} y1="160" x2={lax(6.6)} y2="160" stroke={C.signal} strokeWidth="2" />
          <path d={`M${lax(6.6) - 7} 155 L${lax(6.6)} 160 L${lax(6.6) - 7} 165`} fill="none" stroke={C.signal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <T x={lax(3)} y="150" fontSize="11.5" fontWeight="800" fill={C.signal}>zieht E(T) nach rechts</T>
          <T x={lax(5.2)} y={lay(0.075)} fontSize="11.5" fontWeight="700" fill={C.gold}>langer Ausläufer</T>
        </g>
      )}
      {anteil > 0.001 && (
        <g opacity={anteil}>
          {/* Anteile als Pillen über Linien und Kurve, damit nichts kreuzt */}
          <Pille x={lax(1)} y={lay(0.13)} text="≈ 63 %" farbe={C.seeTief} breite={58} gross={11.5} />
          <Pille x={lax(4.4)} y={lay(0.17)} text="≈ 37 %" farbe={C.gold} breite={58} gross={11.5} />
          <T x="180" y="268" textAnchor="middle" fontSize="12.5" fontWeight="800" fill={C.tinte}>
            P(T ≤ E(T)) = 1 − e<Hoch>−1</Hoch><Runter />≈ 0,632
          </T>
        </g>
      )}
    </g>
  );
}

/* 4 · Ohne Gedächtnis: 1000 Stunden später */
const GD_DAUER = 23;
const gdSchritte = () => [
  { von: 0, text: "Die Lebensdauer eines Sensors, im Mittel 1000 Stunden. Die ganze Fläche unter der Dichte steht für alle Sensoren." },
  { von: 4, text: "Nach 1000 Stunden sind rund 63 % ausgefallen. Wir betrachten nur noch die übrigen 37 %." },
  { von: 10, text: "Für sie zählen wir die Zeit neu ab 0 und strecken die Fläche wieder auf 1 – das macht die bedingte Wahrscheinlichkeit." },
  { von: 17, text: "Die neue Kurve liegt genau auf der alten: Ein Sensor, der 1000 Stunden gehalten hat, ist wieder so gut wie neu." },
];
const GA = { X0: 50, X1: 330, T: 4, Y0: 224, H: 150 };
const gax = (u) => GA.X0 + (u / GA.T) * (GA.X1 - GA.X0);
const gay = (r) => GA.Y0 - r * GA.H;
const Ge = (u) => Math.exp(-u);
function gdZeichne(t) {
  const achse = lauf(t, 0.2, 1.2);
  const voll = lauf(t, 0.4, 2.4);
  const schnitt = fenster(t, 4.4, 5.4, 10, 10.8);
  const weg = lauf(t, 5.6, 7.6);
  const etik = fenster(t, 6, 7, 10, 10.8);
  const p1 = lauf(t, 10.4, 13.2), p2 = lauf(t, 13.8, 16.4);
  const deckung = lauf(t, 17.2, 18.4);
  /* Rest ab u = 1: um p1 nach links, Höhe mit e^(p2) gestreckt */
  const restF = (v) => Ge(1 + v) * Math.exp(p2);
  const rx = (v) => gax(1 + v - p1);
  const restLinie = kurvenPfad(restF, 0, GA.T - 1, rx, gay);
  const restFlaeche = flaechenPfad(restF, 0, GA.T - 1, rx, gay, GA.Y0);
  return (
    <g>
      <Achsen x0={GA.X0} x1={GA.X1} y0={GA.Y0} y1={64} tx={gax} ty={gay} o={achse}
        xt={[[0, "0"], [1, "1000"], [2, "2000"], [3, "3000"], [4, "4000"]]} />
      <T x={GA.X1 + 13} y={GA.Y0 + 30} textAnchor="end" fontSize="10.5" fontWeight="600" fill={C.grau} opacity={achse}>Lebensdauer in Stunden</T>
      <T x={GA.X1} y="58" textAnchor="end" fontSize="11.5" fontWeight="800" fill={C.gold} opacity={achse * (1 - lauf(t, 4, 5))}>alle Sensoren: Fläche 1</T>
      {/* links: ausgefallen */}
      {weg < 0.999 && voll > 0.001 && (
        <g opacity={1 - weg}>
          <path d={flaechenPfad(Ge, 0, Math.min(1, GA.T * voll), gax, gay, GA.Y0)} fill={mixFarbe(weg)} opacity="0.4" />
          <path d={kurvenPfad(Ge, 0, Math.min(1, GA.T * voll), gax, gay)} fill="none" stroke={weg > 0.3 ? C.hellgrau : C.gold} strokeWidth="2.4" />
        </g>
      )}
      {/* rechts: übrig (und später verschoben/gestreckt) */}
      {voll * GA.T > 1 && (
        <g>
          <path d={p1 > 0 || p2 > 0 ? restFlaeche : flaechenPfad(Ge, 1, GA.T * voll, gax, gay, GA.Y0)} fill={C.flaggold} opacity="0.4" />
          <path d={p1 > 0 || p2 > 0 ? restLinie : kurvenPfad(Ge, 1, GA.T * voll, gax, gay)} fill="none" stroke={C.gold} strokeWidth="2.6" strokeLinecap="round" />
        </g>
      )}
      {schnitt > 0.001 && (
        <g opacity={schnitt}>
          <line x1={gax(1)} y1={GA.Y0} x2={gax(1)} y2="66" stroke={C.signal} strokeWidth="1.6" strokeDasharray="5 4" />
          <T x={gax(1)} y="60" textAnchor="middle" fontSize="12" fontWeight="800" fill={C.signal}>1000 h</T>
        </g>
      )}
      {etik > 0.001 && (
        <g opacity={etik}>
          <T x={gax(0.48)} y={gay(0.3)} textAnchor="middle" fontSize="10.5" fontWeight="800" fill={C.grau}>ausgefallen</T>
          <T x={gax(0.48)} y={gay(0.3) + 14} textAnchor="middle" fontSize="10.5" fontWeight="800" fill={C.grau}>≈ 63 %</T>
          <T x={gax(2.1)} y={gay(0.3)} textAnchor="middle" fontSize="11.5" fontWeight="800" fill={C.gold}>übrig ≈ 37 %</T>
        </g>
      )}
      {p1 > 0.001 && p2 < 0.999 && (
        <T x="190" y="22" textAnchor="middle" fontSize="12" fontWeight="800" fill={C.see} opacity={fenster(t, 10.4, 11, 16.6, 17.2)}>
          {p2 < 0.05 ? "Zeit neu ab 0 zählen" : "Fläche auf 1 strecken: Höhe · e"}
        </T>
      )}
      {deckung > 0.001 && (
        <g opacity={deckung}>
          <path d={kurvenPfad(Ge, 0, GA.T - 1, gax, gay)} fill="none" stroke={C.see} strokeWidth="1.8" strokeDasharray="5 4" />
          <Pille x={gax(2.15)} y={gay(0.62)} text="gleiche Kurve – wie neu" farbe={C.gold} voll breite={170} gross={12} />
          <T x="180" y="282" textAnchor="middle" fontSize="12" fontWeight="800" fill={C.tinte}>
            P<tspan dy="4" fontSize="0.72em">T &gt; 1000</tspan><tspan dy="-4">(T &gt; 1000 + t) = P(T &gt; t)</tspan>
          </T>
        </g>
      )}
    </g>
  );
}
/* Gold → Grau beim Ausfallen */
const mixFarbe = (p) => (p > 0.35 ? C.hellgrau : C.flaggold);

/* 5 · Radioaktiver Zerfall */
const ZF_DAUER = 22;
const zfSchritte = () => [
  { von: 0, text: "100 Kerne eines radioaktiven Isotops. Jeder zerfällt zu einer zufälligen, exponentialverteilten Zeit – unabhängig von den anderen." },
  { von: 3, text: "Nach einer Halbwertszeit sind 49 Kerne übrig, fast genau die Hälfte. Die Halbwertszeit ist der Median der Lebensdauer." },
  { von: 8, text: "Die übrigen Kerne sind wie neu: Nach jeder weiteren Halbwertszeit zerfällt wieder etwa die Hälfte des Rests – 24, dann 14." },
  { von: 15, text: "Die Kurve 100 · (1/2)^k ist der Erwartungswert nach k Halbwertszeiten. Die gezählten Kerne schwanken zufällig darum." },
];
const ZA = { X0: 50, X1: 330, Y0: 300, K: 4 };
const zax = (k) => ZA.X0 + (k / ZA.K) * (ZA.X1 - ZA.X0);
const zay = (n) => ZA.Y0 - n;
function zaehlPfad(bis) {
  const pts = [[zax(0), zay(100)]];
  let n = 100;
  for (const x of [...KERNE].sort((a, b) => a - b)) {
    if (x > bis) break;
    pts.push([zax(x), zay(n)]);
    n -= 1;
    pts.push([zax(x), zay(n)]);
  }
  pts.push([zax(bis), zay(n)]);
  return pfad(pts);
}
function zfZeichne(t) {
  const ein = lauf(t, 0.2, 1.6);
  const tau = lauf(t, 3.4, 7.6) + 2 * lauf(t, 8.4, 14.6) + lauf(t, 15.4, 19.6);
  const n = uebrigNach(tau);
  const graph = lauf(t, 1, 2.2);
  return (
    <g>
      <T x="180" y="18" textAnchor="middle" fontSize="12.5" fontWeight="800" fill={C.tinte} opacity={ein}>
        t = {tau.toFixed(1).replace(".", ",")} T½ · noch {n} Kerne
      </T>
      {KERNE.map((x, i) => {
        const cx = 110 + 7 + 14 * (i % 10), cy = 30 + 7 + 14 * Math.floor(i / 10);
        const d = Math.min(1, Math.max(0, (tau - x) / 0.06));
        return (
          <g key={i} opacity={ein}>
            {d < 0.999 && <circle cx={cx} cy={cy} r="5.2" fill={C.flaggold} stroke={C.gold} strokeWidth="0.8" opacity={1 - d} />}
            {d > 0.001 && <circle cx={cx} cy={cy} r="2.6" fill={C.hellgrau} opacity={d} />}
          </g>
        );
      })}
      <Achsen x0={ZA.X0} x1={ZA.X1} y0={ZA.Y0} y1={200} tx={zax} ty={zay} o={graph}
        xt={[[0, "0"], [1, "1 T½"], [2, "2 T½"], [3, "3 T½"], [4, "4 T½"]]} yt={[[50, "50"], [100, "100"]]} />
      {tau > 0.001 && <path d={kurvenPfad((k) => 100 * 2 ** -k, 0, tau, zax, zay)} fill="none" stroke={C.see} strokeWidth="1.8" strokeDasharray="5 4" />}
      {graph > 0.001 && <path d={zaehlPfad(tau)} fill="none" stroke={C.gold} strokeWidth="2.2" opacity={graph} />}
      {[1, 2, 3, 4].filter((k) => tau >= k - 0.001).map((k) => (
        <g key={k}>
          <circle cx={zax(k)} cy={zay(uebrigNach(k))} r="4" fill={C.flaggold} stroke={C.gold} strokeWidth="1.2" />
          <T x={zax(k) + 6} y={zay(uebrigNach(k)) - 8} fontSize="12" fontWeight="800" fill={C.gold}>{uebrigNach(k)}</T>
        </g>
      ))}
    </g>
  );
}

const EXP_ANIM = {
  treppe: { titel: () => "Von der Treppe zur e-Funktion", unter: () => "Immer feinere Zeitschritte: Aus der geometrischen Verteilung wird e^(−λt)",
    szene: () => ({ dauer: TR_DAUER, hoehe: 272, schritte: trSchritte(), zeichne: trZeichne,
      beschreibung: "Animation: P(T > t) als Treppe mit Schritten von 1, 0,5, 0,25 und 0,05 Minuten bei 0,5 Anrufen pro Minute. Die Treppen nähern sich der Kurve e^(−0,5t); bei t = 2 steigen die Werte von 0,25 über 0,316, 0,344 und 0,363 auf e^(−1) ≈ 0,368." }) },
  flaeche: { titel: () => "Dichte, Verteilungsfunktion und Fläche", unter: () => "Die Fläche unter f bis t ist die Höhe von F bei t",
    szene: () => ({ dauer: FL_DAUER, hoehe: 326, schritte: flSchritte(), zeichne: flZeichne,
      beschreibung: "Animation: Oben die Verteilungsfunktion F, unten die Dichte f bei λ = 0,5. Die Fläche unter f bis zu einer wandernden Stelle ist so groß wie F an dieser Stelle. P(1 ≤ T ≤ 3) ist die Fläche zwischen 1 und 3, etwa 0,383; die ganze Fläche ist 1." }) },
  lage: { titel: () => "Median und Erwartungswert", unter: () => "Warum die Hälfte schon vor dem Mittelwert vorbei ist",
    szene: () => ({ dauer: LG_DAUER, hoehe: 280, schritte: lgSchritte(), zeichne: lgZeichne,
      beschreibung: "Animation: Dichte bei λ = 0,5. Der Median 1,39 teilt die Fläche in zwei Hälften, der Erwartungswert 2 ist der Schwerpunkt. Der lange Ausläufer zieht den Schwerpunkt nach rechts; 63 Prozent der Fläche liegen links vom Erwartungswert." }) },
  gedaechtnis: { titel: () => "Ohne Gedächtnis: 1000 Stunden später", unter: () => "Der Rest der Kurve, neu ab 0 gezählt, ist wieder die ganze Kurve",
    szene: () => ({ dauer: GD_DAUER, hoehe: 292, schritte: gdSchritte(), zeichne: gdZeichne,
      beschreibung: "Animation: Dichte der Lebensdauer mit Mittelwert 1000 Stunden. Der Teil vor 1000 Stunden verschwindet, der Rest wird um 1000 Stunden nach links geschoben und mit e gestreckt. Er liegt danach genau auf der ursprünglichen Kurve." }) },
  zerfall: { titel: () => "Radioaktiver Zerfall: 100 Kerne", unter: () => "Die Halbwertszeit ist der Median der Lebensdauer",
    szene: () => ({ dauer: ZF_DAUER, hoehe: 324, schritte: zfSchritte(), zeichne: zfZeichne,
      beschreibung: "Animation: 100 Kerne zerfallen zu zufälligen, exponentialverteilten Zeiten. Nach 1, 2, 3 und 4 Halbwertszeiten sind 49, 24, 14 und 6 Kerne übrig; die gestrichelte Kurve 100 · (1/2)^k zeigt den Erwartungswert." }) },
};

export function ExpAnimation({ art, offen = false }) {
  return <AnimKarte szenen={EXP_ANIM} art={art} offen={offen} merkmal="data-exp-anim" />;
}

/* ======================================================================
   Statisches Bild der Herleitung: Tabelle (1 − λt/n)^n für λ = 0,5, t = 2
   ====================================================================== */
function GrenzTabelle() {
  const kopf = { fontSize: 11, fontWeight: 700, color: C.grau, letterSpacing: "0.03em", textTransform: "uppercase", padding: "0 4px 8px" };
  const zelle = { fontSize: 13.5, color: C.tinte, padding: "8px 4px", borderTop: `1px solid ${C.linie}`, fontVariantNumeric: "tabular-nums" };
  return (
    <div style={{ ...KARTE, padding: "14px 14px 10px", margin: "4px 0 18px" }} data-grenz-tabelle="">
      <div style={{ display: "grid", gridTemplateColumns: "0.8fr 0.9fr 1fr 1.1fr" }}>
        <span style={kopf}>Schritte n</span><span style={kopf}>Δt in min</span><span style={kopf}>je Schritt</span><span style={kopf}>P(T &gt; 2)</span>
        {GRENZ_TABELLE.map((g) => (
          <React.Fragment key={g.n}>
            <span style={{ ...zelle, fontWeight: 700 }}>{g.n}</span>
            <span style={zelle}>{dk(2 / g.n, 3)}</span>
            <span style={zelle}>{dk(1 / g.n, 3)}</span>
            <span style={zelle}>{dk(g.wert, 4)}</span>
          </React.Fragment>
        ))}
        <span style={{ ...zelle, fontWeight: 700 }}>n → ∞</span>
        <span style={zelle}>→ 0</span>
        <span style={zelle}>→ 0</span>
        <span style={{ ...zelle, fontWeight: 800, color: C.gold }}><Inline s={"$e^{−1} ≈ 0,3679$"} /></span>
      </div>
    </div>
  );
}

/* ======================================================================
   Labor: λ einstellen · Fläche [a; b] · Simulation · Gedächtnis
   ====================================================================== */
const LT = 10, KLASSE = 0.5, KLASSEN = 20, GROSS = 4000;
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
const ANSICHTEN = [{ id: "flaeche", name: "Fläche" }, { id: "simulation", name: "Simulation" }, { id: "gedaechtnis", name: "Gedächtnis" }];
const eHochTex = (k) => (k < 1e-9 ? "1" : `e^{−${dk(k, 4)}}`);

function LaborBild({ l, ansicht, kurve, a, b, werte, gross, s, neu }) {
  const X0 = 42, X1 = 338, Y0 = 200, Y1 = 30;
  const tx = (t) => X0 + (t / LT) * (X1 - X0);
  const istF = ansicht === "flaeche" && kurve === "F";
  /* Höhe der Dichte-Achse: kleinste Stufe über f(0) = λ (Kurve füllt das Bild), F immer bis 1 */
  const stufe = istF ? 1 : [0.25, 0.5, 1, 2].find((x) => l <= x + 1e-9);
  const ymax = stufe * 1.12;
  const ty = (v) => Y0 - (Math.max(0, Math.min(v, ymax)) / ymax) * (Y0 - Y1);
  const yt = { 0.25: [[0.1, "0,1"], [0.2, "0,2"]], 0.5: [[0.25, "0,25"], [0.5, "0,5"]], 1: [[0.5, "0,5"], [1, "1"]], 2: [[1, "1"], [2, "2"]] }[stufe];
  const f = (t) => dichte(l, t), F = (t) => vert(l, t);
  const fn = istF ? F : f;
  const balken = (liste, nenner, farbe, deckkraft, key) => {
    const { h } = histogramm(liste, KLASSE, KLASSEN);
    return h.map((c, k) => {
      const v = nenner ? c / (nenner * KLASSE) : 0;
      return v > 0 ? <rect key={`${key}${k}`} x={tx(k * KLASSE) + 0.6} y={ty(v)} width={tx(KLASSE) - X0 - 1.2} height={Y0 - ty(v)} fill={farbe} opacity={deckkraft} /> : null;
    });
  };
  const m = median(l), E = erwartung(l);
  const ueber = gross.filter((w) => w > s);
  let inhalt = null;
  if (ansicht === "flaeche" && !istF) {
    inhalt = (
      <g>
        <path d={flaechenPfad(f, a, b, tx, ty, Y0)} fill={C.flaggold} opacity="0.55" />
        <line x1={tx(m)} y1={Y0} x2={tx(m)} y2={Y1 + 4} stroke={C.see} strokeWidth="1.2" strokeDasharray="4 3" />
        <line x1={tx(E)} y1={Y0} x2={tx(E)} y2={Y1 - 10} stroke={C.gold} strokeWidth="1.2" strokeDasharray="4 3" />
        {/* m eine Etage tiefer als E(T), beide rechts der Linie – sie liegen bei großem λ eng beieinander */}
        <T x={tx(m) + 4} y={Y1 + 12} fontSize="11" fontWeight="800" fill={C.see}>m</T>
        <T x={tx(E) + 4} y={Y1 - 4} fontSize="11" fontWeight="800" fill={C.gold}>E(T)</T>
      </g>
    );
  } else if (istF) {
    const Fa = F(a), Fb = F(b);
    const rechts = b <= 7.4;
    const bx = rechts ? tx(b) + 8 : tx(a) - 8;
    inhalt = (
      <g>
        <line x1={tx(a)} y1={Y0} x2={tx(a)} y2={ty(Fa)} stroke={C.hellgrau} strokeWidth="1" strokeDasharray="3 3" />
        <line x1={tx(b)} y1={Y0} x2={tx(b)} y2={ty(Fb)} stroke={C.hellgrau} strokeWidth="1" strokeDasharray="3 3" />
        <line x1={Math.min(tx(a), bx)} y1={ty(Fa)} x2={Math.max(tx(a), bx)} y2={ty(Fa)} stroke={C.gold} strokeWidth="1" strokeDasharray="3 3" />
        <line x1={Math.min(tx(b), bx)} y1={ty(Fb)} x2={Math.max(tx(b), bx)} y2={ty(Fb)} stroke={C.gold} strokeWidth="1" strokeDasharray="3 3" />
        <line x1={bx} y1={ty(Fa)} x2={bx} y2={ty(Fb)} stroke={C.flaggold} strokeWidth="4" strokeLinecap="round" />
        <circle cx={tx(a)} cy={ty(Fa)} r="3.5" fill={C.see} /><circle cx={tx(b)} cy={ty(Fb)} r="3.5" fill={C.see} />
        <T x={rechts ? bx + 7 : bx - 7} y={(ty(Fa) + ty(Fb)) / 2 + 4} textAnchor={rechts ? "start" : "end"} fontSize="11.5" fontWeight="800" fill={C.gold}>F(b) − F(a)</T>
      </g>
    );
  } else if (ansicht === "simulation") {
    inhalt = <g>{balken(werte, werte.length, C.flaggold, 0.6, "s")}</g>;
  } else if (!neu) {
    inhalt = (
      <g>
        {balken(gross, gross.length, C.hellgrau, 0.45, "a")}
        {balken(ueber, gross.length, C.flaggold, 0.75, "u")}
        <line x1={tx(s)} y1={Y0} x2={tx(s)} y2={Y1 - 2} stroke={C.signal} strokeWidth="1.6" strokeDasharray="5 3" />
        <T x={tx(s) + 4} y={Y1 - 6} fontSize="11" fontWeight="800" fill={C.signal}>s</T>
      </g>
    );
  } else {
    const rest = ueber.map((w) => w - s);
    inhalt = <g>{balken(rest, rest.length, C.flaggold, 0.75, "r")}</g>;
  }
  return (
    <svg viewBox="0 0 360 236" style={{ width: "100%", maxWidth: 520, margin: "0 auto", display: "block" }} role="img"
      aria-label={istF ? `Verteilungsfunktion F bei λ = ${dk(l, 2)}` : `Dichte f bei λ = ${dk(l, 2)}`}>
      {inhalt}
      <path d={kurvenPfad(fn, 0, LT, tx, ty)} fill="none" stroke={istF ? C.see : ansicht === "flaeche" ? C.gold : C.see} strokeWidth="2.4" strokeLinecap="round"
        opacity={ansicht === "gedaechtnis" && !neu ? 0.45 : 1} />
      <Achsen x0={X0} x1={X1} y0={Y0} y1={Y1} tx={tx} ty={ty} xt={[0, 2, 4, 6, 8, 10].map((v) => [v, String(v)])} yt={yt} />
      <T x={X1} y={Y1 - 6} textAnchor="end" fontSize="11.5" fontWeight="800" fill={istF ? C.see : C.gold}>{istF ? "F(t)" : "f(t)"} bei λ = {dk(l, 2)}</T>
      <T x={X1 + 13} y={Y0 + 30} textAnchor="end" fontSize="10.5" fontWeight="600" fill={C.grau}>t in Minuten</T>
    </svg>
  );
}

function ExpLabor() {
  const [l, setL] = useState(0.5);
  const [ansicht, setAnsicht] = useState("flaeche");
  const [kurve, setKurve] = useState("f");
  const [a, setA] = useState(1);
  const [b, setB] = useState(3);
  const [stich, setStich] = useState({ seed: 1, n: 0 });
  const [s, setS] = useState(2);
  const [neu, setNeu] = useState(false);
  /* gleicher Startwert für jedes λ: dieselben Zufallszahlen, nur anders skaliert (t = −ln(1 − u)/λ) */
  const werte = useMemo(() => simuliere(stich.n, l, zufallszahlen(stich.seed)), [stich, l]);
  const gross = useMemo(() => simuliere(GROSS, l, zufallszahlen(stich.seed + 500)), [stich.seed, l]);
  const p = intervall(l, a, b);
  const ueber = gross.filter((w) => w > s);
  const rest = ueber.map((w) => w - s);
  const drueber = werte.filter((w) => w >= LT).length;
  const klein = { fontSize: 13.5, color: C.tinte, lineHeight: 1.7, margin: "4px 0" };
  const dazu = (k) => setStich((x) => ({ ...x, n: x.n + k }));
  return (
    <div data-exp-labor="" data-ansicht={ansicht} data-n={stich.n} data-p={p.toFixed(6)} data-ueberlebende={ueber.length} data-neu={neu ? "ja" : "nein"}>
      <div className="flex flex-wrap" style={{ gap: 8, marginBottom: 14 }}>
        {ANSICHTEN.map((x) => <Chip key={x.id} aktiv={ansicht === x.id} onClick={() => setAnsicht(x.id)}>{x.name}</Chip>)}
      </div>
      <Regler label="λ" hilfe="Rate pro Minute" wert={l} min={0.2} max={2} step={0.05} anzeige={dk(l, 2)} setzen={setL} />
      <p style={{ fontSize: 12.5, color: C.grau, margin: "0 0 10px", display: "flex", flexWrap: "wrap", columnGap: 18, rowGap: 4 }} data-labor-kennwerte="">
        <span>Mittelwert <Inline s={`$E(T) = \\frac{1}{λ} = ${dk(1 / l, 2)}$`} /></span>
        <span>Median <Inline s={`$m = \\frac{\\ln 2}{λ} ≈ ${dk(median(l), 2)}$`} /></span>
      </p>
      {ansicht === "flaeche" && (
        <div className="flex flex-wrap" style={{ gap: 6, marginBottom: 6 }}>
          <button type="button" onClick={() => setKurve("f")} aria-pressed={kurve === "f"} style={wahlStil(kurve === "f")}>Dichte f</button>
          <button type="button" onClick={() => setKurve("F")} aria-pressed={kurve === "F"} style={wahlStil(kurve === "F")}>Verteilungsfunktion F</button>
        </div>
      )}
      <div style={{ background: C.sand, border: `1px solid ${C.linie}`, borderRadius: 14, padding: "8px 4px 2px", margin: "6px 0 10px" }}>
        <LaborBild l={l} ansicht={ansicht} kurve={kurve} a={a} b={b} werte={werte} gross={gross} s={s} neu={neu} />
      </div>
      {ansicht === "flaeche" && (
        <>
          <Regler label="a" hilfe="untere Grenze" wert={a} min={0} max={LT} step={0.1} anzeige={dk(a, 1)} setzen={(v) => { setA(v); if (v > b) setB(v); }} />
          <Regler label="b" hilfe="obere Grenze" wert={b} min={0} max={LT} step={0.1} anzeige={dk(b, 1)} setzen={(v) => { setB(v); if (v < a) setA(v); }} />
          <p style={klein} data-labor-ergebnis="">
            {Math.abs(b - a) < 1e-9
              ? <>Ein einzelner Zeitpunkt: <Inline s={`$P(T = ${dk(a, 1)}) = 0$`} /></>
              : <Inline s={`$P(${dk(a, 1)} ≤ T ≤ ${dk(b, 1)}) = ${eHochTex(l * a)} − ${eHochTex(l * b)} ≈ ${p.toFixed(3).replace(".", ",")}$`} />}
          </p>
          <p style={{ fontSize: 12.5, color: C.grau, fontWeight: 300, lineHeight: 1.6 }}>
            {kurve === "f" ? "Die goldene Fläche unter der Dichte ist die Wahrscheinlichkeit. Gestrichelt: Median m und Erwartungswert E(T)."
              : "An der Verteilungsfunktion liest du dieselbe Wahrscheinlichkeit als Höhenunterschied F(b) − F(a) ab."}
          </p>
        </>
      )}
      {ansicht === "simulation" && (
        <>
          <p style={klein} data-labor-ergebnis="">
            {stich.n === 0 ? "Noch keine Wartezeit gezogen."
              : <>{stich.n} Wartezeiten, Mittelwert <Inline s={`$\\overline{t} ≈ ${dk(mittel(werte), 2)}$`} />, erwartet <Inline s={`$E(T) = ${dk(1 / l, 2)}$`} />{drueber > 0 ? `; ${drueber} davon länger als ${LT} min` : ""}</>}
          </p>
          <p style={{ fontSize: 12.5, color: C.grau, fontWeight: 300, lineHeight: 1.6, marginBottom: 10 }}>
            Jede Wartezeit entsteht aus einer Zufallszahl u zwischen 0 und 1 als <Inline s={"$t = −\\frac{\\ln(1 − u)}{λ}$"} />. Die Säulen sind so hoch, dass ihre Fläche
            den Anteil der Wartezeiten in der Klasse zeigt – je mehr Werte, desto genauer folgen sie der Dichte.
          </p>
          <div className="flex flex-wrap items-center" style={{ gap: 10 }}>
            <button type="button" onClick={() => dazu(100)} className="px-5 py-3" style={KNOPF(true)}>+100 Wartezeiten</button>
            <button type="button" onClick={() => dazu(1000)} className="px-5 py-3" style={KNOPF(true, C.seeTief)}>+1000 Wartezeiten</button>
            {stich.n > 0 && <button type="button" onClick={() => setStich((x) => ({ seed: x.seed + 1, n: 0 }))} style={LINK}>Neue Stichprobe</button>}
          </div>
        </>
      )}
      {ansicht === "gedaechtnis" && (
        <>
          <Regler label="s" hilfe="schon gewartet, in Minuten" wert={s} min={0} max={6} step={0.5} anzeige={dk(s, 1)} setzen={setS} />
          <p style={klein} data-labor-ergebnis="">
            {neu
              ? <>Restzeiten der {ueber.length} Überlebenden: Mittelwert <Inline s={`$≈ ${dk(mittel(rest), 2)}$`} />, erwartet <Inline s={`$\\frac{1}{λ} = ${dk(1 / l, 2)}$`} /></>
              : <>{ueber.length} von {GROSS} Wartezeiten sind länger als s: Anteil <Inline s={`$${dk(ueber.length / GROSS, 3)}$`} />, erwartet <Inline s={`$${eHochTex(l * s)} ≈ ${dk(Math.exp(-l * s), 3)}$`} /></>}
          </p>
          <p style={{ fontSize: 12.5, color: C.grau, fontWeight: 300, lineHeight: 1.6, marginBottom: 10 }}>
            {neu ? "Die Überlebenden, neu ab 0 gezählt und wieder auf die Fläche 1 gebracht, folgen derselben Dichte wie am Anfang – egal, wie groß s ist."
              : "Grau sind alle 4000 Wartezeiten, gold die, die länger als s dauern. Richte die goldenen neu aus: Zeit ab s neu zählen."}
          </p>
          <button type="button" onClick={() => setNeu((x) => !x)} aria-pressed={neu} className="px-5 py-3" style={KNOPF(true, neu ? C.seeTief : C.see)}>
            {neu ? "Alle Wartezeiten zeigen" : "Überlebende ab 0 neu ausrichten"}
          </button>
        </>
      )}
    </div>
  );
}
const wahlStil = (an) => ({
  padding: "6px 12px", borderRadius: 999, border: `1px solid ${an ? C.flaggold : C.linie}`, background: an ? "#FFF6D6" : C.weiss,
  color: an ? C.tinte : C.grau, fontSize: 12.5, fontWeight: an ? 600 : 400, fontFamily: "inherit", cursor: "pointer",
});

/* ======================================================================
   Übungen
   ====================================================================== */
const EINHEIT = { min: "min", h: "h", d: "Tage" };
function Feld({ k, label, einheit, wert, setzen, stand, onEnter }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 16, fontWeight: 500, color: C.tinte }}>
      <span style={{ whiteSpace: "nowrap" }}>{label} =</span>
      <MatheFeld modus="formel" value={wert} onChange={(e) => setzen(k, e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") onEnter(); }}
        aria-label={label} placeholder="?" style={{ ...ZELLE(stand), width: 132, textAlign: "left" }} />
      {einheit && <span style={{ fontSize: 13.5, color: C.grau }}>{EINHEIT[einheit]}</span>}
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

function ExpTrainer() {
  const [art, setArt] = useState("wkt");
  const [stufe, setStufe] = useState(1);
  const [auf, setAufRoh] = useState(() => merk(aufgabe("wkt", 1)));
  const setAuf = (a) => setAufRoh(merk(a));
  const [ein, setEin] = useState({});
  const [erg, setErg] = useState(null);
  const [zeigen, setZeigen] = useState(false);
  const [serie, setSerie] = useState({ n: 0, ok: 0 });
  const neu = (a = art, s = stufe) => { setAuf(aufgabe(a, s)); setEin({}); setErg(null); setZeigen(false); };
  const artSetzen = (a) => { setArt(a); neu(a, stufe); };
  const stufeSetzen = (s) => { const v = Math.max(1, Math.min(5, s)); setStufe(v); neu(art, v); };
  const setze = (k, v) => { setEin((e) => ({ ...e, [k]: v })); setErg(null); };
  const fs = felder(auf);
  const leer = fs.some(([k]) => !String(ein[k] ?? "").trim());
  const pruefen = () => {
    if (leer) return;
    const e = pruefe(auf, ein);
    setErg(e);
    setSerie((x) => ({ n: x.n + 1, ok: x.ok + (e.ok ? 1 : 0) }));
  };
  const typen = [...new Set(fs.map(([, , typ]) => typ))];
  const weg = <Formeln zeilen={rechenweg(auf)} max={15} farbe={C.see} />;
  return (
    <div>
      <p style={{ ...FLIESS, lineHeight: 1.7, marginBottom: 18 }}>
        Vier Aufgabentypen: Wahrscheinlichkeiten als Flächen berechnen, Erwartungswert, Median und Halbwertszeit bestimmen,
        λ aus einer Angabe zurückrechnen und mit der Gedächtnislosigkeit bedingte Wahrscheinlichkeiten lösen.
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        {ARTEN.map((a) => <Chip key={a.id} aktiv={art === a.id} onClick={() => artSetzen(a.id)}>{a.name}</Chip>)}
      </div>
      <Stufen stufe={stufe} setzen={stufeSetzen} />
      <div style={KARTE} data-mm-karte="" data-exptrainer="">
        <p style={{ fontSize: 15, color: C.tinte, fontWeight: 400, lineHeight: 1.7, marginBottom: 10 }}>{auftrag(auf)}</p>
        {typen.map((typ) => <p key={typ} style={{ fontSize: 12.5, color: C.grau, fontWeight: 300, lineHeight: 1.55, marginBottom: 6 }}>{RUNDUNG[typ]}</p>)}
        <div className="flex flex-wrap" style={{ gap: 14, margin: "10px 0 12px" }}>
          {fs.map(([k, label, , einheit]) => (
            <Feld key={k} k={k} label={label} einheit={einheit} wert={ein[k] ?? ""} setzen={setze} stand={erg ? erg.felder[k] : null} onEnter={pruefen} />
          ))}
        </div>
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
            {!zeigen && <button onClick={() => setZeigen(true)} className="mt-3" style={LINK}>Rechenweg zeigen</button>}
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
const STARK = { fontSize: 15, color: C.tinte, fontWeight: 500, lineHeight: 1.8, margin: "8px 0 10px" };
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

export function GfsExponentialSeite({ gehe }) {
  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 22 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 14 }}>
        Warum ist ein Bauteil, das schon 1000 Stunden hält, wieder so gut wie neu?
      </h2>
      <Text s="Zwei gleiche Temperatursensoren liegen vor dir. Der eine ist neu, der andere läuft schon seit 1000 Stunden. Welchen
        baust du ein? Fast jeder nimmt den neuen. Doch wenn die Lebensdauer exponentialverteilt ist, ist es egal: Der gebrauchte
        hält mit genau derselben Wahrscheinlichkeit noch weitere 500 Stunden wie der neue." style={FLIESS} />
      <Text s="Die Exponentialverteilung beschreibt Wartezeiten auf Ereignisse, die zufällig und unabhängig voneinander eintreten:
        den nächsten Anruf, den Zerfall eines Atomkerns, den Ausfall eines Bauteils. Wir leiten sie in sechs Schritten aus der
        geometrischen Verteilung her, berechnen Erwartungswert und Median und beweisen, dass sie kein Gedächtnis hat." style={FLIESS} />

      <ExpAnimation art="treppe" offen />

      <Schritt nr="1" titel="Von kleinen Zeitschritten zur e-Funktion" />
      <Text s="Anrufe gehen zufällig und unabhängig voneinander ein, im Schnitt $λ$ pro Minute – $λ$ heißt Rate. $T$ ist die
        Wartezeit bis zum nächsten Anruf. Teile die Zeit bis $t$ in $n$ gleich lange Schritte der Länge $Δt = \frac{t}{n}$. Sind die
        Schritte kurz, kommt in einem Schritt höchstens ein Anruf, und zwar mit der Wahrscheinlichkeit $λΔt$. Die Nummer des
        ersten Schritts mit Anruf ist dann geometrisch verteilt:" style={FLIESS} />
      <Formeln zeilen={[
        "P(\\text{kein Anruf in } n \\text{ Schritten}) = (1 − λΔt)^n",
        "P(T > t) ≈ \\left(1 − \\frac{λt}{n}\\right)^n",
      ]} max={17} />
      <Text s="Je feiner die Schritte, desto besser stimmt das Modell. Für $λ = 0,5$ pro Minute und $t = 2$ Minuten ist $λt = 1$:" style={FLIESS} />
      <GrenzTabelle />
      <Text s="Die Werte wachsen und nähern sich 0,3679 – das ist $e^{−1}$. Den Grenzwert für $n \to \infty$ zeigst du allgemein
        mit dem Logarithmus. Setze $h = \frac{λt}{n}$, also $n = \frac{λt}{h}$:" style={FLIESS} />
      <Formeln zeilen={[
        "\\ln\\left(\\left(1 − \\frac{λt}{n}\\right)^n\\right) = n \\cdot \\ln(1 − h) = −λt \\cdot \\frac{\\ln(1 − h)}{−h}",
        "\\frac{\\ln(1 − h)}{−h} = \\frac{\\ln(1 + (−h)) − \\ln 1}{−h} \\to \\ln′(1) = 1",
        "\\lim_{n \\to \\infty} \\left(1 − \\frac{λt}{n}\\right)^n = e^{−λt}",
      ]} max={17} />
      <Text s="Der Bruch in der zweiten Zeile ist ein Differenzenquotient von ln an der Stelle 1 mit der Schrittweite $−h$. Für
        $n \to \infty$ geht $h \to 0$, der Bruch also gegen $\ln′(1) = \frac{1}{1} = 1$. Damit geht der Logarithmus gegen $−λt$ und die
        Potenz selbst gegen $e^{−λt}$." style={FLIESS} />
      <Kasten titel="Definition">
        <Text s="Eine Zufallsgröße $T$ mit $P(T > t) = e^{−λt}$ für alle $t ≥ 0$ heißt exponentialverteilt mit dem Parameter $λ > 0$.
          Sie ist die stetige Schwester der geometrischen Verteilung: Statt Versuche zählt sie Zeit." style={STARK} />
      </Kasten>

      <Schritt nr="2" titel="Verteilungsfunktion, Dichte und Wahrscheinlichkeit als Fläche" />
      <Text s="Die Verteilungsfunktion $F$ gibt an, mit welcher Wahrscheinlichkeit das Ereignis bis zur Zeit $t$ eingetreten ist.
        Ihre Ableitung ist die Dichte $f$:" style={FLIESS} />
      <Formeln zeilen={[
        "F(t) = P(T ≤ t) = 1 − e^{−λt} \\quad (t ≥ 0)",
        "f(t) = F′(t) = λe^{−λt}",
      ]} max={18} />
      <Text s="Wahrscheinlichkeiten sind Flächen unter der Dichte. Nach dem Hauptsatz ist die Fläche von $a$ bis $b$ gleich $F(b) − F(a)$:" style={FLIESS} />
      <Formeln zeilen={[
        "P(a ≤ T ≤ b) = \\int_a^b λe^{−λt}\\,dt = F(b) − F(a)",
        "= (1 − e^{−λb}) − (1 − e^{−λa}) = e^{−λa} − e^{−λb}",
        "\\int_0^b λe^{−λt}\\,dt = 1 − e^{−λb} \\to 1 \\quad (b \\to \\infty)",
      ]} max={17} />
      <Text s="Die ganze Fläche ist also 1. Zwei Besonderheiten stetiger Zufallsgrößen: Ein einzelner Zeitpunkt hat die
        Wahrscheinlichkeit 0 – darum ist es egal, ob du $T ≤ t$ oder $T < t$ schreibst. Und $f(t)$ selbst ist keine
        Wahrscheinlichkeit; bei $λ = 2$ ist $f(0) = 2$." style={FLIESS} />
      <Kasten titel="Beispiel">
        <Text s="Im Schnitt kommen 0,5 Anrufe pro Minute. Die Wahrscheinlichkeit, dass der nächste nach 1 bis 3 Minuten kommt:
          $P(1 ≤ T ≤ 3) = e^{−0,5} − e^{−1,5} ≈ 0,383$." style={STARK} />
      </Kasten>
      <ExpAnimation art="flaeche" />

      <Schritt nr="3" titel="Der Erwartungswert: im Mittel 1/λ" />
      <Text s="Bei einer stetigen Zufallsgröße wird aus der Summe „Wert mal Wahrscheinlichkeit“ ein Integral:
        $E(T) = \int_0^{\infty} t \cdot f(t)\,dt$. Wir integrieren zunächst nur bis $b$ und lassen dann $b$ gegen unendlich gehen.
        Partielle Integration mit $u(t) = t$ und $v′(t) = λe^{−λt}$, also $u′(t) = 1$ und $v(t) = −e^{−λt}$:" style={FLIESS} />
      <Formeln zeilen={[
        "\\int_0^b t \\cdot λe^{−λt}\\,dt = \\left[−te^{−λt}\\right]_0^b + \\int_0^b e^{−λt}\\,dt",
        "= −be^{−λb} + \\left[−\\frac{1}{λ}e^{−λt}\\right]_0^b",
        "= −be^{−λb} − \\frac{1}{λ}e^{−λb} + \\frac{1}{λ}",
      ]} max={17} />
      <Text s="Für $b \to \infty$ gehen beide Produkte gegen 0, denn die e-Funktion wächst schneller als jede Potenz:
        $be^{−λb} = \frac{b}{e^{λb}} \to 0$. Es bleibt:" style={FLIESS} />
      <Formeln zeilen={["E(T) = \\lim_{b \\to \\infty} \\left(\\frac{1}{λ} − \\left(b + \\frac{1}{λ}\\right)e^{−λb}\\right) = \\frac{1}{λ}"]} max={17} />
      <Text s="Ohne partielle Integration prüfst du das Ergebnis durch Ableiten: $G(t) = −\left(t + \frac{1}{λ}\right)e^{−λt}$ ist
        eine Stammfunktion von $t \cdot λe^{−λt}$." style={FLIESS} />
      <Formeln zeilen={[
        "G′(t) = −e^{−λt} + λ\\left(t + \\frac{1}{λ}\\right)e^{−λt}",
        "= −e^{−λt} + λte^{−λt} + e^{−λt} = λte^{−λt}",
      ]} max={17} />
      <Kasten titel="Ergebnis">
        <Text s="Die mittlere Wartezeit ist der Kehrwert der Rate: $E(T) = \frac{1}{λ}$. Kommen im Schnitt 0,5 Anrufe pro Minute,
          wartest du im Mittel 2 Minuten." style={STARK} />
      </Kasten>

      <Schritt nr="4" titel="Der Median: ln 2/λ – früher als der Mittelwert" />
      <Text s="Der Median $m$ ist die Zeit, die in der Hälfte der Fälle unterschritten wird: $F(m) = 0,5$." style={FLIESS} />
      <Formeln zeilen={[
        "1 − e^{−λm} = 0,5 \\;\\Leftrightarrow\\; e^{−λm} = 0,5",
        "−λm = \\ln 0,5 = −\\ln 2 \\;\\Leftrightarrow\\; m = \\frac{\\ln 2}{λ}",
        "m = \\frac{\\ln 2}{λ} ≈ \\frac{0,693}{λ} < \\frac{1}{λ} = E(T)",
      ]} max={17} />
      <Text s="Der Median liegt also immer vor dem Erwartungswert, bei rund 69 % von ihm. Der Grund ist die schiefe Form der
        Dichte: Viele Wartezeiten sind kurz, einige sehr lang. Die langen ziehen den Mittelwert nach rechts – am Median ändern sie
        nichts, denn für ihn zählt nur, wie viele Werte links und rechts liegen." style={FLIESS} />
      <Formeln zeilen={["P(T ≤ E(T)) = 1 − e^{−λ \\cdot \\frac{1}{λ}} = 1 − e^{−1} ≈ 0,632"]} max={17} />
      <Text s="Rund 63 % aller Wartezeiten sind kürzer als der Mittelwert – für jedes $λ$." style={FLIESS} />
      <ExpAnimation art="lage" />

      <Schritt nr="5" titel="Ohne Gedächtnis – die Antwort auf die Leitfrage" />
      <Text s="Ein Bauteil läuft schon $s$ Stunden. Wie wahrscheinlich hält es noch weitere $t$ Stunden? Gesucht ist die bedingte
        Wahrscheinlichkeit $P_{T > s}(T > s + t)$. Wer länger als $s + t$ hält, hält auch länger als $s$ – im Zähler bleibt also nur
        $P(T > s + t)$:" style={FLIESS} />
      <Formeln zeilen={[
        "P_{T > s}(T > s + t) = \\frac{P(T > s + t)}{P(T > s)} = \\frac{e^{−λ(s + t)}}{e^{−λs}}",
        "= e^{−λs − λt + λs} = e^{−λt} = P(T > t)",
      ]} max={17} />
      <Text s="Die schon vergangene Zeit $s$ kürzt sich vollständig heraus. Die Exponentialverteilung hat kein Gedächtnis: Wie
        lange du schon gewartet hast, ändert nichts an der Restwartezeit." style={FLIESS} />
      <Kasten titel="Antwort auf die Leitfrage">
        <Text s="Mit $λ = 0,001$ pro Stunde hält ein neuer Sensor mit $P(T > 500) = e^{−0,5} ≈ 0,607$ länger als 500 Stunden. Einer,
          der schon 1000 Stunden läuft, hält mit $P_{T > 1000}(T > 1500) = \frac{e^{−1,5}}{e^{−1}} = e^{−0,5} ≈ 0,607$ noch 500 weitere.
          Er ist wieder so gut wie neu." style={STARK} />
      </Kasten>
      <ExpAnimation art="gedaechtnis" />

      <Schritt nr="6" titel="Anwendungen – und wo das Modell nicht passt" />
      <Text s="Die Exponentialverteilung passt überall, wo Ereignisse zufällig, unabhängig voneinander und mit konstanter Rate
        eintreten:" style={FLIESS} />
      <Punkt titel="Radioaktiver Zerfall" s="Die Lebensdauer eines einzelnen Kerns ist exponentialverteilt. Die Halbwertszeit ist
        ihr Median: $T_{1/2} = \frac{\ln 2}{λ}$. Von $N_0$ Kernen sind nach der Zeit $t$ im Mittel noch $N_0 \cdot e^{−λt} = N_0 \cdot 2^{−t/T_{1/2}}$ übrig." />
      <Punkt titel="Lebensdauer von Bauteilen" s="Elektronische Bauteile fallen in ihrer mittleren Lebensphase oft durch zufällige
        Einflüsse aus, nicht durch Abnutzung. Dort beschreibt die Exponentialverteilung die Lebensdauer gut." />
      <Punkt titel="Warteschlangen" s="Anrufe bei einer Hotline, Kunden an einer Kasse, Anfragen an einen Server – solange die Rate
        konstant bleibt." />
      <ExpAnimation art="zerfall" />
      <Text s="Das Modell setzt eine konstante Ausfallrate voraus. Wo etwas altert, stimmt das nicht: Reifen, Bremsbeläge oder
        Kugellager nutzen sich ab – ein gebrauchtes Teil ist dann schlechter als ein neues. Auch Frühausfälle durch
        Fertigungsfehler passen nicht. In der Technik beschreibt man den ganzen Lebenslauf mit der Badewannenkurve: erst
        Frühausfälle, dann eine lange Phase mit fast konstanter Rate – nur dort passt die Exponentialverteilung –, dann Verschleiß.
        Und die Rate selbst muss gleich bleiben: Eine Hotline bekommt vormittags mehr Anrufe als nachts." style={FLIESS} />
      <Kasten titel="Zum Mitnehmen">
        <Text s="$P(T > t) = e^{−λt}$, $E(T) = \frac{1}{λ}$, $m = \frac{\ln 2}{λ}$. Die Exponentialverteilung ist die einzige stetige
          Verteilung ohne Gedächtnis: Was schon gewartet ist, zählt nicht mehr." style={STARK} />
      </Kasten>

      <div style={{ ...KARTE, margin: "22px 0" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 12 }}>Labor: λ einstellen, Flächen messen, Wartezeiten ziehen</p>
        <ExpLabor />
      </div>

      <Trenner />

      <Kicker>Jetzt selbst üben</Kicker>
      <H3>Wahrscheinlichkeiten, Kennwerte, λ, Gedächtnis</H3>
      <ExpTrainer />

      {gehe && (
        <div style={{ ...KARTE, marginTop: 22, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: C.tinte, marginBottom: 4 }}>Die e-Funktion auffrischen</p>
            <p style={{ fontSize: 13.5, color: C.grau, fontWeight: 300, lineHeight: 1.6 }}>Eulersche Zahl, Grenzwert, Ableiten – im Minikurs zur natürlichen Exponentialfunktion.</p>
          </div>
          <button type="button" onClick={() => gehe({ ansicht: "efunktion" })} className="px-5 py-3" style={KNOPF(true)}>Zur e-Funktion</button>
        </div>
      )}

      <Trenner />

      <Kicker>Deine GFS</Kicker>
      <H3>Der rote Faden für den Vortrag</H3>
      <RoterFaden gliederung={GLIEDERUNG} tipps={TIPPS} hinweis="den Abschnitt zu Erwartungswert und Median" />

      <div style={{ height: 8 }} />
      <Kicker>Kolloquium</Kicker>
      <H3>Die Fragen nach dem Vortrag trainieren</H3>
      <Kolloquium fragen={KOLLOQUIUM} speicher="mm-gfs-exponential-kolloquium" />
    </div>
  );
}
