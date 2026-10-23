import React, { useState } from "react";
import { C } from "./base1.jsx";
import { M, Text } from "./func3.jsx";
import { MatheFeld } from "./matheTastatur.jsx";
import { FLIESS, KARTE, ZELLE, Formeln, Schritt, Kasten, Chip, PlusMinus, Kicker, H3, Trenner, RoterFaden, Kolloquium } from "./funcGfsBausteine.jsx";
import { lauf, T } from "./funcErklaeranimation.jsx";
import { AnimKarte } from "./funcAnimKarte.jsx";
import {
  dk, fass, summiert, parabelDurch, fassProfil, fassVolumen, parabelFass, fassAbweichung, fassErlaubt, kreis,
  LABOR_FUNKTIONEN, grenzeSetzen, laborWerte, FASS_VORLAGEN, FASS_GRENZEN, BEISPIEL_EXP, BEISPIEL_KEHR, POTENZ_TEST, Q, qTex, dkTex,
  ARTEN, ENTSCHEIDUNG, STUFEN_NAMEN, aufgabe, felder, auftrag, pruefe, rechenweg, tipp,
  GLIEDERUNG, TIPPS, KOLLOQUIUM,
} from "./gfsFassregel.js";

/* ============================================================
   Kurs GFS – Themenseite „Die Keplersche Fassregel“
   (Kursstufe 1, Kapitel III Integralrechnung)
   Aufbau wie das Ziegenproblem: Leitfrage · Herleitung in sechs Schritten
   (Rechteck und Trapez, Parabel durch drei Punkte, Fläche = Fassregel,
   exakt bis Grad 3, Fehler und summierte Regel, Fassvolumen) · fünf
   Erkläranimationen · Labor (Fläche: Funktion, Intervall, Parabel, Fehler
   live; Fass: Radien und Höhe) · Übungen aus vier Generatoren · roter
   Faden · Kolloquium. Logik in gfsFassregel.js (tests/gfsFassregel.test.mjs).
   ============================================================ */

const KNOPF = (aktiv = true, farbe = C.see) => ({
  background: aktiv ? farbe : C.hellgrau, color: C.weiss, border: "none", borderRadius: 999, fontSize: 15, fontWeight: 600,
  fontFamily: "inherit", cursor: aktiv ? "pointer" : "default",
});
const LINK = { background: "none", border: "none", color: C.see, fontSize: 13, fontFamily: "inherit", cursor: "pointer", padding: 0, textDecoration: "underline" };
/* aktuelle Aufgabe für automatische Prüfungen (tests/ui/gfsfassregel.ui.py) */
const merk = (a) => { if (typeof window !== "undefined") window.__fassAufgabe = a; return a; };

const mix = (a, b, p) => a + (b - a) * p;
const fenster = (t, a, b, c, d) => lauf(t, a, b) * (1 - lauf(t, c, d));
const skala = (u0, u1, p0, p1) => (u) => p0 + ((u - u0) / (u1 - u0)) * (p1 - p0);
const zahl = (v) => v.toFixed(1);
/* Kurve als Pfad, Fläche bis zur x-Achse, Fläche zwischen zwei Kurven */
function kurve(f, x0, x1, X, Y, n = 64) {
  let d = "";
  for (let i = 0; i <= n; i++) { const x = x0 + ((x1 - x0) * i) / n; d += `${i ? "L" : "M"}${zahl(X(x))} ${zahl(Y(f(x)))}`; }
  return d;
}
const unter = (f, x0, x1, X, Y, n = 64) => `${kurve(f, x0, x1, X, Y, n)}L${zahl(X(x1))} ${zahl(Y(0))}L${zahl(X(x0))} ${zahl(Y(0))}Z`;
function zwischen(f, g, x0, x1, X, Y, n = 48) {
  let d = kurve(f, x0, x1, X, Y, n);
  for (let i = n; i >= 0; i--) { const x = x0 + ((x1 - x0) * i) / n; d += `L${zahl(X(x))} ${zahl(Y(g(x)))}`; }
  return `${d}Z`;
}

function Pille({ x, y, text, o = 1, farbe = C.see, voll = false, breite, gross = 12.5 }) {
  if (o <= 0.001) return null;
  const w = breite || Math.max(44, String(text).length * gross * 0.56 + 22);
  return (
    <g opacity={o}>
      <rect x={x - w / 2} y={y - gross - 4} width={w} height={gross + 12} rx={(gross + 12) / 2} fill={voll ? farbe : C.weiss} stroke={farbe} strokeWidth="1.4" />
      <T x={x} y={y + 0.5} textAnchor="middle" fontSize={gross} fontWeight="800" fill={voll ? (farbe === C.flaggold ? C.tinte : C.weiss) : farbe}>{text}</T>
    </g>
  );
}

/* Achsen mit Pfeil und Strichen; xt/yt = beschriftete Stellen */
function Achsen({ X, Y, xr, yr, xt = [], yt = [], o = 1, xName = "x", yName = "y" }) {
  if (o <= 0.001) return null;
  const ay = Y(0), ax = X(0), xe = X(xr[1]), yo = Y(yr[1]);
  const yAchse = xr[0] < 0 && xr[1] > 0;
  return (
    <g opacity={o}>
      <line x1={X(xr[0])} y1={ay} x2={xe + 2} y2={ay} stroke={C.tinte} strokeWidth="1.2" />
      <path d={`M${xe + 2} ${ay - 3.5}L${xe + 8} ${ay}L${xe + 2} ${ay + 3.5}Z`} fill={C.tinte} />
      <T x={xe + 6} y={ay + 15} textAnchor="end" fontSize="11" fontStyle="italic" fill={C.grau}>{xName}</T>
      {yAchse && <line x1={ax} y1={Y(yr[0])} x2={ax} y2={yo - 2} stroke={C.tinte} strokeWidth="1.2" />}
      {yAchse && <path d={`M${ax - 3.5} ${yo - 2}L${ax} ${yo - 8}L${ax + 3.5} ${yo - 2}Z`} fill={C.tinte} />}
      {yAchse && <T x={ax - 6} y={yo + 2} textAnchor="end" fontSize="11" fontStyle="italic" fill={C.grau}>{yName}</T>}
      {xt.map((x) => (
        <g key={`x${x}`}>
          <line x1={X(x)} y1={ay - 3} x2={X(x)} y2={ay + 3} stroke={C.tinte} strokeWidth="1" />
          <T x={X(x)} y={ay + 14} textAnchor="middle" fontSize="10" fill={C.grau}>{String(x).replace("-", "−").replace(".", ",")}</T>
        </g>
      ))}
      {yAchse && yt.map((y) => (
        <g key={`y${y}`}>
          <line x1={ax - 3} y1={Y(y)} x2={ax + 3} y2={Y(y)} stroke={C.tinte} strokeWidth="1" />
          <T x={ax - 6} y={Y(y) + 3.5} textAnchor="end" fontSize="10" fill={C.grau}>{String(y).replace("-", "−").replace(".", ",")}</T>
        </g>
      ))}
    </g>
  );
}

/* ======================================================================
   Kopfbild (viewBox 160 × 120): Weinfass mit drei Querschnitten unten,
   in halber Höhe und oben, Gewichte 1 : 4 : 1. Exakt: Wand = Parabel durch
   die Radien 25, 30, 25 cm bei 80 cm Höhe (fassProfil).
   ====================================================================== */
export function FassBild() {
  const s = 1.05, cx = 52, yU = 100, H = 80, yO = yU - H * s, yM = yU - (H / 2) * s, e = 0.26;
  const r = fassProfil(25, 30, 25, H);
  const N = 32, links = [], rechts = [];
  for (let i = 0; i <= N; i++) { const z = (H * i) / N, y = yU - z * s; links.push(`${zahl(cx - r(z) * s)} ${zahl(y)}`); rechts.unshift(`${zahl(cx + r(z) * s)} ${zahl(y)}`); }
  const ru = 25 * s, rm = 30 * s;
  const koerper = `M${links.join(" L")} L${rechts.join(" L")} A${ru} ${ru * e} 0 0 1 ${cx - ru} ${yU} Z`;
  const daube = (f) => { let d = ""; for (let i = 0; i <= N; i++) { const z = (H * i) / N; d += `${i ? "L" : "M"}${zahl(cx + f * r(z) * s)} ${zahl(yU - z * s)}`; } return d; };
  const reifen = (z) => { const rr = r(z) * s, y = yU - z * s; return `M${zahl(cx - rr)} ${zahl(y)} A${zahl(rr)} ${zahl(rr * e)} 0 0 0 ${zahl(cx + rr)} ${zahl(y)}`; };
  const PX = 132;
  const gewicht = [{ y: yO, t: "· 1" }, { y: yM, t: "· 4", gold: true }, { y: yU, t: "· 1" }];
  return (
    <svg className="gtk-bild" viewBox="0 0 160 120" role="img" style={{ maxWidth: 320, marginLeft: "auto", marginRight: "auto" }}
      aria-label="Weinfass mit drei Querschnitten unten, in halber Höhe und oben – sie zählen im Verhältnis 1 zu 4 zu 1">
      <defs>
        <linearGradient id="gtk-f-holz" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#140F05" /><stop offset="38%" stopColor="#3A2C0C" /><stop offset="55%" stopColor="#4A3910" /><stop offset="100%" stopColor="#140F05" />
        </linearGradient>
        <linearGradient id="gtk-f-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#FFE9A0" /><stop offset="60%" stopColor="#EDBB00" /><stop offset="100%" stopColor="#C9971A" /></linearGradient>
        <radialGradient id="gtk-f-glut" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#EDBB00" stopOpacity="0.6" /><stop offset="100%" stopColor="#EDBB00" stopOpacity="0" /></radialGradient>
      </defs>
      <ellipse className="gtk-glimmen" cx={cx} cy={yM} rx="46" ry="30" fill="url(#gtk-f-glut)" />
      <g className="gtk-auf">
        <ellipse cx={cx} cy={yU + 3} rx={ru + 4} ry={ru * e * 0.8} fill="#000" opacity="0.45" />
        <path d={koerper} fill="url(#gtk-f-holz)" stroke="rgba(237,187,0,0.45)" strokeWidth="0.7" />
        {[-0.7, -0.38, 0, 0.38, 0.7].map((f) => <path key={f} d={daube(f)} fill="none" stroke="rgba(237,187,0,0.16)" strokeWidth="0.6" />)}
        {[10, 70].map((z) => <path key={z} d={reifen(z)} fill="none" stroke="rgba(237,187,0,0.32)" strokeWidth="1.6" />)}
      </g>
      {/* drei Querschnitte */}
      <g className="gtk-auf" style={{ animationDelay: ".25s" }}>
        <ellipse cx={cx} cy={yU} rx={ru} ry={ru * e} fill="rgba(237,187,0,0.22)" stroke="url(#gtk-f-gold)" strokeWidth="1.4" />
        <ellipse cx={cx} cy={yM} rx={rm} ry={rm * e} fill="rgba(237,187,0,0.38)" stroke="url(#gtk-f-gold)" strokeWidth="1.8" />
        <ellipse cx={cx} cy={yO} rx={ru} ry={ru * e} fill="#2A2109" stroke="url(#gtk-f-gold)" strokeWidth="1.4" />
      </g>
      {/* Höhe h */}
      <g className="gtk-auf" style={{ animationDelay: ".4s" }} stroke="rgba(255,255,255,0.55)" strokeWidth="0.8">
        <line x1="13" y1={yO} x2="13" y2={yU} /><line x1="10.5" y1={yO} x2="15.5" y2={yO} /><line x1="10.5" y1={yU} x2="15.5" y2={yU} />
      </g>
      <T className="gtk-auf" style={{ animationDelay: ".4s" }} x="7" y={yM + 3} textAnchor="middle" fontFamily="Montserrat, sans-serif" fontSize="9" fontWeight="700" fontStyle="italic" fill="rgba(255,255,255,0.75)">h</T>
      {/* Gewichte 1 : 4 : 1 */}
      {gewicht.map((g, i) => (
        <g key={i} className="gtk-auf" style={{ animationDelay: `${0.55 + 0.1 * i}s` }}>
          <line x1={cx + (g.gold ? rm : ru) + 2} y1={g.y} x2={PX - 13} y2={g.y} stroke="rgba(237,187,0,0.5)" strokeWidth="0.7" strokeDasharray="1.6 1.8" />
          <rect x={PX - 12} y={g.y - 7} width="24" height="14" rx="7" fill={g.gold ? "url(#gtk-f-gold)" : "rgba(255,255,255,0.1)"} stroke={g.gold ? "none" : "rgba(237,187,0,0.55)"} strokeWidth="0.7" />
          <T x={PX} y={g.y + 3.4} textAnchor="middle" fontFamily="Montserrat, sans-serif" fontSize="8.6" fontWeight="800" fill={g.gold ? "#0B0C10" : "#FFFFFF"}>{g.t}</T>
        </g>
      ))}
      <T className="gtk-auf" style={{ animationDelay: ".9s" }} x="80" y="116" textAnchor="middle" fontFamily="Montserrat, sans-serif" fontSize="6.4" fontWeight="600" fill="rgba(255,255,255,0.62)" letterSpacing="0.02em">V ≈ h/6 · (unten + 4 · Mitte + oben)</T>
    </svg>
  );
}

/* ======================================================================
   Erkläranimationen (Szenen = reine Funktionen der Zeit; Schlussbild = Standbild)
     idee      – Rechteck, Trapez, Parabel für eˣ auf [0; 2]
     parabel   – Herleitung auf [−h; h]: βx fällt weg, Gewichte 1 : 4 : 1
     grad3     – warum x³ exakt ist (ungerader Unterschied), x⁴ nicht
     summiert  – 1, 2, 4 Fässer: Fehler etwa 16-mal kleiner je Halbierung
     fass      – Volumen über Querschnitte, A(z) als Kurve, exakte Körper
   ====================================================================== */

/* 1 · Rechteck, Trapez, Parabel (eˣ auf [0; 2]) */
const I_DAUER = 22;
const iSchritte = () => [
  { von: 0, text: "Gesucht ist die Fläche unter eˣ von 0 bis 2. Bekannt sind nur drei Werte: an den Rändern und in der Mitte." },
  { von: 4.5, text: "Ein Wert ergibt ein Rechteck mit der Höhe in der Mitte. Es liefert 5,44 – rund 0,95 zu wenig." },
  { von: 9, text: "Zwei Werte ergeben ein Trapez. Es liefert 8,39 – genau 2 zu viel." },
  { von: 13.5, text: "Durch drei Punkte geht genau eine Parabel. Die Fläche unter ihr ist 6,42 – nur 0,03 zu viel." },
  { von: 18, text: "Diese Parabelfläche ist die Keplersche Fassregel." },
];
function iZeichne(t) {
  const X = skala(-0.3, 2.3, 42, 330), Y = skala(0, 8, 208, 42);
  const f = Math.exp, p = parabelDurch(f, 0, 2);
  const achse = lauf(t, 0.2, 1), fl = lauf(t, 0.8, 1.8), pkt = lauf(t, 1.6, 2.6);
  const re = lauf(t, 4.8, 6) * (1 - 0.75 * lauf(t, 9, 9.6)), tr = lauf(t, 9.3, 10.5) * (1 - 0.75 * lauf(t, 13.5, 14.1)), pa = lauf(t, 13.8, 15.2), fo = lauf(t, 18.2, 19.4);
  const zeile = (y, name, wert, fehler, farbe, o, an = false) => o > 0.001 && (
    <g opacity={o}>
      {an && <rect x="34" y={y - 15} width="304" height="21" rx="10.5" fill="#FFF3C4" stroke={C.flaggold} strokeWidth="1" />}
      <T x="44" y={y} fontSize="12.5" fontWeight="700" fill={farbe}>{name}</T>
      <T x="226" y={y} textAnchor="end" fontSize="12.5" fontWeight="800" fill={C.tinte}>{wert}</T>
      <T x="330" y={y} textAnchor="end" fontSize="12" fontWeight="700" fill={farbe}>{fehler}</T>
    </g>
  );
  return (
    <g>
      <Achsen X={X} Y={Y} xr={[-0.3, 2.3]} yr={[0, 8]} xt={[1, 2]} yt={[2, 4, 6]} o={achse} />
      {fl > 0.001 && <path d={unter(f, 0, 2, X, Y)} fill={C.himmel} opacity={fl} />}
      {re > 0.001 && <rect x={X(0)} y={Y(Math.E)} width={X(2) - X(0)} height={Y(0) - Y(Math.E)} fill={C.signal} fillOpacity="0.12" stroke={C.signal} strokeWidth="1.8" opacity={re} />}
      {tr > 0.001 && <path d={`M${X(0)} ${Y(0)}L${X(0)} ${Y(1)}L${X(2)} ${Y(Math.E ** 2)}L${X(2)} ${Y(0)}Z`} fill={C.lila} fillOpacity="0.1" stroke={C.lila} strokeWidth="1.8" opacity={tr} />}
      {pa > 0.001 && <path d={unter(p, 0, 2, X, Y)} fill={C.flaggold} opacity={0.22 * pa} />}
      <path d={kurve(f, -0.3, Math.log(8.2), X, Y)} fill="none" stroke={C.see} strokeWidth="2.4" opacity={achse} />
      {pa > 0.001 && <path d={kurve(p, -0.15, 2.04, X, Y)} fill="none" stroke={C.gold} strokeWidth="2.2" strokeDasharray="6 4" opacity={pa} />}
      {[0, 1, 2].map((x) => <circle key={x} cx={X(x)} cy={Y(f(x))} r="4.6" fill={C.flaggold} stroke={C.gold} strokeWidth="1.3" opacity={pkt} />)}
      <T x={X(0) + 9} y={Y(1) + 15} fontSize="11" fontWeight="700" fill={C.gold} opacity={pkt}>f(0) = 1</T>
      <T x={X(1) + 9} y={Y(Math.E) + 17} fontSize="11" fontWeight="700" fill={C.gold} opacity={pkt}>f(1) = e</T>
      <T x={X(2) - 8} y={Y(Math.E ** 2) + 4} textAnchor="end" fontSize="11" fontWeight="700" fill={C.gold} opacity={pkt}>f(2) = e²</T>
      <T x={X(2.12)} y={Y(6.4)} fontSize="12" fontWeight="800" fontStyle="italic" fill={C.see} opacity={achse}>f</T>
      <T x="44" y="16" fontSize="12.5" fontWeight="800" fill={C.gold} opacity={fo}>(b − a)/6 · (f(a) + 4f(m) + f(b))</T>
      {zeile(236, "exakt  e² − 1", "6,389", "Fehler", C.grau, lauf(t, 1.4, 2.4))}
      {zeile(258, "Rechteck", "5,437", "−0,952", C.signal, lauf(t, 5.6, 6.6))}
      {zeile(280, "Trapez", "8,389", "+2,000", C.lila, lauf(t, 10, 11))}
      {zeile(302, "Fassregel", "6,421", "+0,032", C.gold, lauf(t, 14.8, 15.8), fo > 0.5)}
    </g>
  );
}

/* 2 · Herleitung auf [−h; h]: y0 = 0,5, y1 = 3, y2 = 2,5 → α = −1,5, β = 1, γ = 3, Fläche 5 */
const P_DAUER = 25;
const pSchritte = () => [
  { von: 0, text: "Wir verschieben das Intervall, bis die Mitte bei 0 liegt. Es reicht dann von −h bis h – die Fläche bleibt gleich." },
  { von: 5, text: "Durch die drei Punkte geht genau eine Parabel p(x) = αx² + βx + γ." },
  { von: 9.5, text: "Der Teil βx ist ungerade: Links liegt so viel Fläche unter der Achse wie rechts darüber. Er fällt weg." },
  { von: 14.5, text: "Übrig bleibt (2/3)αh³ + 2γh. Mit γ = y₁ und α aus den Punkten wird daraus h/3 · (y₀ + 4y₁ + y₂)." },
  { von: 20, text: "Die drei Werte zählen im Verhältnis 1 : 4 : 1 – die Mitte vierfach." },
];
const P_Y = [0.5, 3, 2.5];
const pPar = (x) => -1.5 * x * x + x + 3;
const pF = (x) => 0.6 * x ** 3 - 1.5 * x * x + 0.4 * x + 3;          // Kurve durch dieselben drei Punkte
function pZeichne(t) {
  const dx = 46 * (1 - lauf(t, 1, 3.4));
  const X0 = skala(-1.45, 1.45, 36, 324), X = (x) => X0(x) + dx, Y = skala(-1.1, 3.4, 200, 44);
  const achse = lauf(t, 0.2, 1), fl = lauf(t, 0.5, 1.4) * (1 - 0.6 * lauf(t, 9.6, 10.4)), alt = 1 - lauf(t, 1.6, 2.4), neu = lauf(t, 2.2, 3);
  const par = lauf(t, 5.2, 6.6), ung = fenster(t, 9.8, 11, 14.6, 15.4), f1 = lauf(t, 14.8, 15.8), f2 = lauf(t, 16.4, 17.4), f3 = lauf(t, 18, 19), gew = lauf(t, 20.2, 21.4);
  const lab = (i) => [["a", "m", "b"], ["−h", "0", "h"]].map((l, k) => (
    <T key={k} x={X(i - 1)} y="216" textAnchor="middle" fontSize="12.5" fontWeight="700" fontStyle="italic" fill={C.tinte} opacity={k ? neu : alt}>{l[i]}</T>));
  return (
    <g>
      {fl > 0.001 && <path d={unter(pF, -1, 1, X, Y)} fill={C.himmel} opacity={fl} />}
      <g opacity={achse}>
        <line x1="30" y1={Y(0)} x2="334" y2={Y(0)} stroke={C.tinte} strokeWidth="1.2" />
        <path d={`M334 ${Y(0) - 3.5}L340 ${Y(0)}L334 ${Y(0) + 3.5}Z`} fill={C.tinte} />
        <line x1={X(0)} y1={Y(-1.05)} x2={X(0)} y2={Y(3.35)} stroke={C.tinte} strokeWidth="1" opacity={neu} />
      </g>
      {[-1, 0, 1].map((x) => <line key={x} x1={X(x)} y1={Y(P_Y[x + 1])} x2={X(x)} y2="204" stroke={C.hellgrau} strokeWidth="1" strokeDasharray="3 3" opacity={achse} />)}
      {[0, 1, 2].map(lab)}
      <path d={kurve(pF, -1.25, 1.2, X, Y)} fill="none" stroke={C.see} strokeWidth="2.2" opacity={achse * (1 - 0.55 * par)} />
      {par > 0.001 && <path d={kurve(pPar, -1.22, 1.22, X, Y)} fill="none" stroke={C.gold} strokeWidth="2.4" strokeDasharray="6 4" opacity={par} />}
      <T x={X(0.5)} y="20" textAnchor="middle" fontSize="13" fontWeight="800" fill={C.gold} opacity={par}>p(x) = αx² + βx + γ</T>
      {/* ungerader Teil βx: Dreiecke links (−) und rechts (+) */}
      {ung > 0.001 && (
        <g opacity={ung}>
          <path d={`M${X(-1)} ${Y(0)}L${X(0)} ${Y(0)}L${X(-1)} ${Y(-1)}Z`} fill={C.signal} fillOpacity="0.25" stroke={C.signal} strokeWidth="1.2" />
          <path d={`M${X(0)} ${Y(0)}L${X(1)} ${Y(0)}L${X(1)} ${Y(1)}Z`} fill={C.smaragd} fillOpacity="0.25" stroke={C.smaragd} strokeWidth="1.2" />
          <line x1={X(-1.15)} y1={Y(-1.15)} x2={X(1.15)} y2={Y(1.15)} stroke={C.tinte} strokeWidth="1.4" strokeDasharray="4 3" />
          <T x={X(-0.7)} y={Y(-0.32)} textAnchor="middle" fontSize="16" fontWeight="800" fill={C.signal}>−</T>
          <T x={X(0.7)} y={Y(0.18)} textAnchor="middle" fontSize="16" fontWeight="800" fill={C.smaragd}>+</T>
          <T x={X(1.18)} y={Y(1.25)} fontSize="12" fontWeight="800" fill={C.tinte}>βx</T>
        </g>
      )}
      {[0, 1, 2].map((i) => <circle key={i} cx={X(i - 1)} cy={Y(P_Y[i])} r="4.8" fill={C.flaggold} stroke={C.gold} strokeWidth="1.3" opacity={achse} />)}
      {["y₀", "y₁", "y₂"].map((l, i) => <T key={l} x={X(i - 1) + (i === 0 ? -9 : 9)} y={Y(P_Y[i]) + (i === 0 ? 4 : -10)} textAnchor={i === 0 ? "end" : "start"} fontSize="12" fontWeight="800" fill={C.gold} opacity={lauf(t, 1.2, 2)}>{l}</T>)}
      {/* Gewichte */}
      {[1, 4, 1].map((g, i) => <Pille key={i} x={X(i - 1)} y={240} text={`· ${g}`} farbe={i === 1 ? C.flaggold : C.gold} voll={i === 1} o={gew} breite={i === 1 ? 48 : 40} />)}
      <Pille x={X(0.5)} y={Y(1.05)} text="Fläche = 5" farbe={C.see} o={gew} breite={84} gross={11.5} />
      <g fontSize="12.5" fontWeight="700">
        <T x="180" y="266" textAnchor="middle" fill={C.tinte} opacity={f1}>∫ p dx = (2/3)αh³ + <tspan fill={C.signal}>0</tspan> + 2γh</T>
        <T x="180" y="288" textAnchor="middle" fill={C.grau} opacity={f2}>γ = y₁,   α = (y₀ − 2y₁ + y₂) / (2h²)</T>
        <T x="180" y="310" textAnchor="middle" fontSize="14" fontWeight="800" fill={C.gold} opacity={f3}>= h/3 · (y₀ + 4y₁ + y₂)</T>
      </g>
    </g>
  );
}

/* 3 · Grad 3 exakt, Grad 4 nicht: f − p ungerade bzw. gerade */
const G_DAUER = 24;
const gSchritte = () => [
  { von: 0, text: "Jetzt ist f ein Polynom 3. Grades. Die Parabel durch die drei Punkte ist eine andere Kurve." },
  { von: 4.5, text: "Der Unterschied f − p ist ein Vielfaches von x³ − h²x. Diese Funktion ist ungerade." },
  { von: 9.5, text: "Links liegt f über p, rechts darunter – beide Flächen dazwischen sind 0,375 groß. Sie heben sich auf: exakt." },
  { von: 14, text: "Bei Grad 4 klappt das nicht: Der Unterschied ist gerade, f liegt auf beiden Seiten unter der Parabel." },
  { von: 19.5, text: "Also: exakt bis Grad 3, ab Grad 4 nicht mehr." },
];
const g3 = (x) => 1.5 * x ** 3 - 0.5 * x * x + 2.5, p3 = (x) => -0.5 * x * x + 1.5 * x + 2.5;
const g4 = (x) => 1.5 * x ** 4 + 0.5 * x + 1, p4 = (x) => 1.5 * x * x + 0.5 * x + 1;
function gZeichne(t) {
  const X = skala(-1.45, 1.45, 36, 324), Y = skala(-0.45, 3.9, 196, 26);
  const achse = lauf(t, 0.2, 1);
  const drei = 1 - lauf(t, 14.2, 15.2), vier = lauf(t, 14.8, 15.8);
  const p3o = lauf(t, 1.8, 3.2), linse = lauf(t, 4.8, 6), wert3 = lauf(t, 9.8, 11), null3 = lauf(t, 11.4, 12.4);
  const linse4 = lauf(t, 16, 17), wert4 = lauf(t, 17.4, 18.4), ende = lauf(t, 19.8, 21);
  const marke = (f, o) => [-1, 0, 1].map((x) => <circle key={x} cx={X(x)} cy={Y(f(x))} r="4.4" fill={C.flaggold} stroke={C.gold} strokeWidth="1.2" opacity={o} />);
  return (
    <g>
      <Achsen X={X} Y={Y} xr={[-1.45, 1.4]} yr={[-0.45, 3.85]} xt={[-1, 1]} yt={[1, 2, 3]} o={achse} />
      {/* Grad 3 */}
      <g opacity={drei}>
        {linse > 0.001 && <path d={zwischen(g3, p3, -1, 0, X, Y)} fill={C.flaggold} opacity={0.45 * linse} />}
        {linse > 0.001 && <path d={zwischen(g3, p3, 0, 1, X, Y)} fill={C.signal} opacity={0.35 * linse} />}
        <path d={kurve(g3, -1.04, 1.1, X, Y)} fill="none" stroke={C.see} strokeWidth="2.3" opacity={achse} />
        {p3o > 0.001 && <path d={kurve(p3, -1.15, 1.2, X, Y)} fill="none" stroke={C.gold} strokeWidth="2.2" strokeDasharray="6 4" opacity={p3o} />}
        {marke(g3, achse)}
        <T x={X(1.1) + 4} y={Y(g3(1.1)) + 4} fontSize="12.5" fontWeight="800" fontStyle="italic" fill={C.see} opacity={achse}>f</T>
        <T x={X(1.2) + 4} y={Y(p3(1.2)) + 12} fontSize="12.5" fontWeight="800" fontStyle="italic" fill={C.gold} opacity={p3o}>p</T>
        <Pille x={X(-0.72)} y={Y(2.85)} text="+ 0,375" farbe={C.gold} o={wert3} breite={70} gross={11.5} />
        <Pille x={X(0.58)} y={Y(1.95)} text="− 0,375" farbe={C.signal} o={wert3} breite={70} gross={11.5} />
        <T x="180" y="232" textAnchor="middle" fontSize="12.5" fontWeight="700" fill={C.tinte} opacity={linse}>f − p = 1,5x³ − 1,5x = 1,5 · (x³ − x)</T>
        <Pille x={180} y={262} text="Fehler: 0 – exakt" farbe={C.see} voll o={null3} breite={160} />
        <T x="48" y="20" fontSize="13" fontWeight="800" fill={C.see} opacity={achse}>Grad 3</T>
      </g>
      {/* Grad 4 */}
      {vier > 0.001 && (
        <g opacity={vier}>
          {linse4 > 0.001 && <path d={zwischen(g4, p4, -1, 0, X, Y)} fill={C.signal} opacity={0.35 * linse4} />}
          {linse4 > 0.001 && <path d={zwischen(g4, p4, 0, 1, X, Y)} fill={C.signal} opacity={0.35 * linse4} />}
          <path d={kurve(g4, -1.1, 1.05, X, Y)} fill="none" stroke={C.see} strokeWidth="2.3" />
          <path d={kurve(p4, -1.2, 1.12, X, Y)} fill="none" stroke={C.gold} strokeWidth="2.2" strokeDasharray="6 4" />
          {marke(g4, 1)}
          <T x={X(0.97) + 7} y={Y(2.45)} fontSize="12.5" fontWeight="800" fontStyle="italic" fill={C.see}>f</T>
          <T x={X(-1.2) - 4} y={Y(p4(-1.2)) + 4} textAnchor="end" fontSize="12.5" fontWeight="800" fontStyle="italic" fill={C.gold}>p</T>
          <Pille x={X(-0.6)} y={Y(0.32)} text="− 0,2" farbe={C.signal} o={wert4} breite={56} gross={11.5} />
          <Pille x={X(0.6)} y={Y(0.32)} text="− 0,2" farbe={C.signal} o={wert4} breite={56} gross={11.5} />
          <T x="180" y="232" textAnchor="middle" fontSize="12.5" fontWeight="700" fill={C.tinte}>f − p = 1,5x⁴ − 1,5x² = 1,5x² · (x² − 1)</T>
          <Pille x={180} y={262} text="Fehler: 0,4 zu viel" farbe={C.signal} voll o={wert4} breite={170} />
          <T x="48" y="20" fontSize="13" fontWeight="800" fill={C.signal}>Grad 4</T>
        </g>
      )}
      <T x="180" y="290" textAnchor="middle" fontSize="13" fontWeight="800" fill={C.gold} opacity={ende}>exakt bis Grad 3, ab Grad 4 nicht mehr</T>
    </g>
  );
}

/* 4 · Summierte Fassregel für eˣ auf [0; 2]: 1, 2, 4 Fässer */
const S_DAUER = 20;
const S_N = [1, 2, 4];
const S_WERT = S_N.map((n) => summiert(fass, Math.exp, 0, 2, n));
const S_FEHLER = S_WERT.map((v) => v - (Math.E ** 2 - 1));
const sSchritte = () => [
  { von: 0, text: "Ein Fass über die ganze Breite von 0 bis 2 liefert 6,4207. Der Fehler ist 0,0317." },
  { von: 5, text: "Zwei Fässer, jedes halb so breit: Der Fehler sinkt auf 0,0022 – etwa 15-mal kleiner." },
  { von: 10, text: "Vier Fässer: Fehler 0,00014. Jede Halbierung macht den Fehler rund 16-mal kleiner." },
  { von: 15, text: "Das ist die summierte Fassregel. Gemessen wird an einer ungeraden Zahl von Stellen: 3, 5, 9 …" },
];
const fehlerText = (e) => (Math.abs(e) >= 0.001 ? dk(e, 4) : dk(e, 5));
function sZeichne(t) {
  const X = skala(-0.15, 2.2, 44, 330), Y = skala(0, 8, 168, 26), f = Math.exp;
  const achse = lauf(t, 0.2, 1);
  const o = [1 - lauf(t, 5, 5.8), lauf(t, 5.2, 6) * (1 - lauf(t, 10, 10.8)), lauf(t, 10.2, 11)];
  const balken = [lauf(t, 1.2, 2.4), lauf(t, 6, 7.2), lauf(t, 11, 12.2)];
  const punkte = lauf(t, 15.2, 16.4);
  const LB = 292, LH = 84, lg = (v) => ((Math.log10(Math.abs(v)) + 4.5) / 3.5) * LH;
  const BX = [140, 214, 288];
  return (
    <g>
      <Achsen X={X} Y={Y} xr={[-0.15, 2.2]} yr={[0, 8]} xt={[1, 2]} yt={[2, 4, 6]} o={achse} />
      <path d={unter(f, 0, 2, X, Y)} fill={C.himmel} opacity={achse} />
      <path d={kurve(f, -0.15, Math.log(8.2), X, Y)} fill="none" stroke={C.see} strokeWidth="2.3" opacity={achse} />
      {S_N.map((n, k) => o[k] > 0.001 && (
        <g key={n} opacity={o[k]}>
          {Array.from({ length: n }, (_, i) => {
            const a = (2 * i) / n, b = (2 * (i + 1)) / n, p = parabelDurch(f, a, b);
            return (
              <g key={i}>
                {i > 0 && <line x1={X(a)} y1={Y(0)} x2={X(a)} y2={Y(f(a))} stroke={C.gold} strokeWidth="1.2" strokeDasharray="3 3" />}
                <path d={kurve(p, a, b, X, Y, 24)} fill="none" stroke={C.gold} strokeWidth="2.2" strokeDasharray="6 4" />
              </g>
            );
          })}
          {Array.from({ length: 2 * n + 1 }, (_, i) => (2 * i) / (2 * n)).map((x) => (
            <circle key={x} cx={X(x)} cy={Y(f(x))} r={3.6 + 1.6 * punkte} fill={C.flaggold} stroke={C.gold} strokeWidth="1.1" />
          ))}
          <T x="150" y="44" textAnchor="middle" fontSize="12" fontWeight="800" fill={C.gold}>{n === 1 ? "1 Fass" : `${n} Fässer`}</T>
          <T x="150" y="62" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.tinte}>N = {dk(S_WERT[k], 4)}</T>
        </g>
      ))}
      {/* Fehler, logarithmisch */}
      <g opacity={achse}>
        <T x="44" y="198" fontSize="10.5" fontWeight="700" fill={C.grau} letterSpacing="0.04em">FEHLER (LOGARITHMISCHE SKALA)</T>
        {[0.1, 0.01, 0.001, 0.0001].map((v) => (
          <g key={v}>
            <line x1="92" y1={LB - lg(v)} x2="330" y2={LB - lg(v)} stroke={C.linie} strokeWidth="1" />
            <T x="88" y={LB - lg(v) + 3.5} textAnchor="end" fontSize="9.5" fill={C.grau}>{dk(v, 4)}</T>
          </g>
        ))}
        <line x1="92" y1={LB} x2="330" y2={LB} stroke={C.tinte} strokeWidth="1" />
      </g>
      {S_N.map((n, k) => balken[k] > 0.001 && (
        <g key={n} opacity={balken[k]}>
          <rect x={BX[k] - 18} y={LB - lg(S_FEHLER[k]) * balken[k]} width="36" height={lg(S_FEHLER[k]) * balken[k]} rx="4" fill={C.flaggold} stroke={C.gold} strokeWidth="1" />
          <T x={BX[k]} y={LB - lg(S_FEHLER[k]) - 6} textAnchor="middle" fontSize="10.5" fontWeight="800" fill={C.tinte}>{fehlerText(S_FEHLER[k])}</T>
          <T x={BX[k]} y={LB + 14} textAnchor="middle" fontSize="10.5" fontWeight="700" fill={C.grau}>n = {n}</T>
        </g>
      ))}
      <T x={(BX[0] + BX[1]) / 2} y={LB - 30} textAnchor="middle" fontSize="11" fontWeight="800" fill={C.signal} opacity={lauf(t, 7, 8)}>÷ 15</T>
      <T x={(BX[1] + BX[2]) / 2} y={LB - 12} textAnchor="middle" fontSize="11" fontWeight="800" fill={C.signal} opacity={lauf(t, 12, 13)}>÷ 16</T>
    </g>
  );
}

/* 5 · Das Fass: Querschnitte, A(z), Fassregel für Volumen */
const F_DAUER = 26;
const fSchritte = () => [
  { von: 0, text: "Ein Fass wird in dünne Scheiben zerlegt. Sein Volumen ist das Integral der Querschnittsfläche A über die Höhe." },
  { von: 5, text: "Gemessen werden nur drei Querschnitte: unten, in halber Höhe und oben." },
  { von: 10, text: "Fassregel für Volumen: h/6 · (unten + 4 · Mitte + oben), jeweils mit den Querschnittsflächen." },
  { von: 15, text: "Bei 80 cm Höhe und den Radien 25, 30 und 25 cm sind das etwa 203 Liter." },
  { von: 20.5, text: "Zylinder, Kegel und Kugel kommen exakt heraus: Ihr Querschnitt ist höchstens quadratisch in der Höhe." },
];
function MiniKoerper({ x, y, art, o }) {
  if (o <= 0.001) return null;
  const w = 22, h = 44, e = 0.3;
  const quer = art === "zylinder" ? [w, w, w] : art === "kegel" ? [w, w / 2, 0] : [0, w, 0];
  const ys = [y, y - h / 2, y - h];
  const umriss = art === "zylinder" ? `M${x - w} ${y}L${x - w} ${y - h}L${x + w} ${y - h}L${x + w} ${y}Z`
    : art === "kegel" ? `M${x - w} ${y}L${x} ${y - h}L${x + w} ${y}Z` : null;
  return (
    <g opacity={o}>
      {umriss ? <path d={umriss} fill={C.himmel} stroke={C.see} strokeWidth="1.3" /> : <circle cx={x} cy={y - h / 2} r={h / 2} fill={C.himmel} stroke={C.see} strokeWidth="1.3" />}
      {quer.map((r, i) => (r > 0
        ? <ellipse key={i} cx={x} cy={ys[i]} rx={r} ry={r * e} fill={C.flaggold} fillOpacity="0.35" stroke={C.gold} strokeWidth="1.2" />
        : <circle key={i} cx={x} cy={ys[i]} r="2" fill={C.gold} />))}
      <T x={x} y={y + 18} textAnchor="middle" fontSize="11" fontWeight="800" fill={C.tinte}>{art === "zylinder" ? "Zylinder" : art === "kegel" ? "Kegel" : "Kugel"} ✓</T>
    </g>
  );
}
function fZeichne(t) {
  const H = 80, RU = 25, RM = 30, s = 1.75, cx = 88, yU = 226, yO = yU - H * s, yM = yU - (H / 2) * s, e = 0.22;
  const r = fassProfil(RU, RM, RU, H);
  const A = (z) => kreis(r(z));
  const GX = 196, kA = 128 / kreis(RM);
  const koerper = lauf(t, 0.2, 1.4), scheiben = fenster(t, 1.4, 2.6, 5.4, 6.4), graph = lauf(t, 2.4, 3.8);
  const quer = lauf(t, 5.4, 6.8), formel = lauf(t, 10.4, 11.6), zahlen = lauf(t, 15.4, 16.6), mini = lauf(t, 21, 22.4);
  const dimm = 1 - 0.55 * mini;
  const N = 32, links = [], rechts = [], kurveA = [];
  for (let i = 0; i <= N; i++) {
    const z = (H * i) / N, y = yU - z * s;
    links.push(`${zahl(cx - r(z) * s)} ${zahl(y)}`); rechts.unshift(`${zahl(cx + r(z) * s)} ${zahl(y)}`);
    kurveA.push(`${zahl(GX + A(z) * kA)} ${zahl(y)}`);
  }
  const wand = `M${links.join(" L")} L${rechts.join(" L")} A${RU * s} ${RU * s * e} 0 0 1 ${cx - RU * s} ${yU} Z`;
  const schnitte = [{ z: 0, y: yU, n: "A_u" }, { z: H / 2, y: yM, n: "A_m" }, { z: H, y: yO, n: "A_o" }];
  return (
    <g>
      <g opacity={koerper * dimm}>
        <path d={wand} fill={C.himmel} stroke={C.see} strokeWidth="1.6" />
        <ellipse cx={cx} cy={yO} rx={RU * s} ry={RU * s * e} fill="#DCE6F5" stroke={C.see} strokeWidth="1.4" />
        {scheiben > 0.001 && Array.from({ length: 9 }, (_, i) => (i + 1) * 8).map((z) => (
          <ellipse key={z} cx={cx} cy={yU - z * s} rx={r(z) * s} ry={r(z) * s * e} fill="none" stroke={C.see} strokeWidth="0.9" opacity={0.6 * scheiben} />
        ))}
      </g>
      {/* A(z) als Kurve, z nach oben */}
      <g opacity={graph * dimm}>
        <line x1={GX} y1={yU} x2="344" y2={yU} stroke={C.tinte} strokeWidth="1.2" />
        <path d={`M344 ${yU - 3.5}L350 ${yU}L344 ${yU + 3.5}Z`} fill={C.tinte} />
        <line x1={GX} y1={yU} x2={GX} y2={yO - 14} stroke={C.tinte} strokeWidth="1.2" />
        <path d={`M${GX - 3.5} ${yO - 14}L${GX} ${yO - 20}L${GX + 3.5} ${yO - 14}Z`} fill={C.tinte} />
        <T x={GX - 6} y={yO - 12} textAnchor="end" fontSize="11" fontStyle="italic" fill={C.grau}>z</T>
        <T x="348" y={yU + 15} textAnchor="end" fontSize="11" fontStyle="italic" fill={C.grau}>A(z)</T>
        <path d={`M${GX} ${yU} L${kurveA.join(" L")} L${GX} ${yO} Z`} fill={C.himmel} />
        <path d={`M${kurveA.join(" L")}`} fill="none" stroke={C.see} strokeWidth="2.2" />
        <T x={GX + 10} y={yM + 34} fontSize="10.5" fontWeight="700" fill={C.see}>Fläche = Volumen</T>
      </g>
      {/* drei Querschnitte und ihre Punkte auf A(z) */}
      {schnitte.map((q, i) => (
        <g key={q.n} opacity={quer * dimm}>
          <ellipse cx={cx} cy={q.y} rx={r(q.z) * s} ry={r(q.z) * s * e} fill={C.flaggold} fillOpacity={i === 1 ? 0.45 : 0.3} stroke={C.gold} strokeWidth={i === 1 ? 2.2 : 1.6} />
          <line x1={cx + r(q.z) * s + 4} y1={q.y} x2={GX + A(q.z) * kA - 5} y2={q.y} stroke={C.gold} strokeWidth="1" strokeDasharray="3 3" />
          <circle cx={GX + A(q.z) * kA} cy={q.y} r="4.6" fill={C.flaggold} stroke={C.gold} strokeWidth="1.2" />
          <T x={GX + A(q.z) * kA - 8} y={q.y + (i === 2 ? 15 : -8)} textAnchor="end" fontSize="11.5" fontWeight="800" fill={C.gold}>
            A<tspan dy="3" fontSize="8.5">{q.n.slice(2)}</tspan>
          </T>
        </g>
      ))}
      <T x="180" y="24" textAnchor="middle" fontSize="15" fontWeight="800" fill={C.tinte} opacity={formel}>
        V ≈ h/6 · (A<tspan dy="3" fontSize="10">u</tspan><tspan dy="-3"> + 4A</tspan><tspan dy="3" fontSize="10">m</tspan><tspan dy="-3"> + A</tspan><tspan dy="3" fontSize="10">o</tspan><tspan dy="-3">)</tspan>
      </T>
      <T x="180" y="48" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.gold} opacity={zahlen}>80/6 · π · (625 + 4 · 900 + 625) ≈ 203 l</T>
      <g opacity={zahlen * dimm}>
        <T x={cx} y={yU + 22} textAnchor="middle" fontSize="10.5" fontWeight="700" fill={C.grau}>Radien 25, 30, 25 cm; h = 80 cm</T>
      </g>
      <MiniKoerper x={70} y={306} art="zylinder" o={mini} />
      <MiniKoerper x={180} y={306} art="kegel" o={lauf(t, 21.4, 22.8)} />
      <MiniKoerper x={290} y={306} art="kugel" o={lauf(t, 21.8, 23.2)} />
    </g>
  );
}

const FASS_ANIM = {
  idee: { titel: () => "Rechteck, Trapez, Parabel", unter: () => "Ein, zwei und drei Werte für die Fläche unter eˣ",
    szene: () => ({ dauer: I_DAUER, hoehe: 312, schritte: iSchritte(), zeichne: iZeichne,
      beschreibung: "Animation: Fläche unter e hoch x von 0 bis 2. Das Rechteck mit der Höhe in der Mitte liefert 5,437, das Trapez 8,389, die Parabel durch die drei Punkte 6,421; exakt sind 6,389." }) },
  parabel: { titel: () => "Die Herleitung in Bildern", unter: () => "Parabel durch drei Punkte, βx fällt weg, Gewichte 1 : 4 : 1",
    szene: () => ({ dauer: P_DAUER, hoehe: 318, schritte: pSchritte(), zeichne: pZeichne,
      beschreibung: "Animation: Das Intervall wird auf minus h bis h verschoben. Durch die drei Punkte geht eine Parabel. Der ungerade Teil beta x liefert links und rechts gleich große Flächen mit verschiedenem Vorzeichen und fällt weg. Übrig bleibt h/3 mal (y0 + 4 y1 + y2)." }) },
  grad3: { titel: () => "Warum sogar Grad 3 exakt ist", unter: () => "Ungerader Unterschied hebt sich auf – bei Grad 4 nicht",
    szene: () => ({ dauer: G_DAUER, hoehe: 298, schritte: gSchritte(), zeichne: gZeichne,
      beschreibung: "Animation: Ein Polynom dritten Grades und die Parabel durch dieselben drei Punkte. Der Unterschied ist ungerade, die Flächen plus 0,375 und minus 0,375 heben sich auf. Bei Grad 4 liegt die Kurve auf beiden Seiten 0,2 unter der Parabel, zusammen 0,4 Fehler." }) },
  summiert: { titel: () => "Mehr Fässer: die summierte Regel", unter: () => "Halbe Breite, etwa 16-mal kleinerer Fehler",
    szene: () => ({ dauer: S_DAUER, hoehe: 312, schritte: sSchritte(), zeichne: sZeichne,
      beschreibung: "Animation: e hoch x auf 0 bis 2 mit einem, zwei und vier Fässern. Die Fehler 0,0317, 0,0022 und 0,00014 werden in einem logarithmischen Balkendiagramm verglichen." }) },
  fass: { titel: () => "Das Fass: Volumen aus drei Querschnitten", unter: () => "Querschnittsfläche A(z), Fassregel, exakte Körper",
    szene: () => ({ dauer: F_DAUER, hoehe: 334, schritte: fSchritte(), zeichne: fZeichne,
      beschreibung: "Animation: Ein Fass wird in Scheiben zerlegt, daneben die Querschnittsfläche A(z) als Kurve. Drei Querschnitte unten, in der Mitte und oben ergeben mit der Fassregel etwa 203 Liter. Zylinder, Kegel und Kugel kommen exakt heraus." }) },
};

export function FassAnimation({ art, offen = false }) {
  return <AnimKarte szenen={FASS_ANIM} art={art} offen={offen} merkmal="data-fass-anim" />;
}

/* ======================================================================
   Statische Bausteine der Herleitung
   ====================================================================== */
const TAB_KOPF = { fontSize: 12, fontWeight: 700, color: C.grau, padding: "0 4px 8px" };
const TAB_ZELLE = { fontSize: 14, color: C.tinte, padding: "8px 4px", borderTop: `1px solid ${C.linie}`, display: "flex", alignItems: "center", minWidth: 0 };

/* Bausteine 1, x, …, x⁴ auf [−h; h]: Fassregel gegen exaktes Integral */
const POTENZ_ZEILEN = [
  { f: "1", regel: "\\frac{h}{3}(1 + 4 + 1) = 2h", exakt: "2h" },
  { f: "x", regel: "\\frac{h}{3}(−h + h) = 0", exakt: "0" },
  { f: "x^2", regel: "\\frac{h}{3}(h^2 + h^2) = \\frac{2}{3}h^3", exakt: "\\frac{2}{3}h^3" },
  { f: "x^3", regel: "\\frac{h}{3}(−h^3 + h^3) = 0", exakt: "0" },
  { f: "x^4", regel: "\\frac{h}{3}(h^4 + h^4) = \\frac{2}{3}h^5", exakt: "\\frac{2}{5}h^5" },
];
function PotenzTabelle() {
  return (
    <div style={{ ...KARTE, padding: "14px 12px 8px", margin: "4px 0 18px" }} data-potenz-tabelle="">
      <div style={{ display: "grid", gridTemplateColumns: "auto minmax(0, 1fr) auto auto", alignItems: "stretch", columnGap: 6 }}>
        <span style={TAB_KOPF}>f(x)</span><span style={TAB_KOPF}>Fassregel</span><span style={TAB_KOPF}>exakt</span><span style={TAB_KOPF} />
        {POTENZ_ZEILEN.map((z, i) => {
          const ok = POTENZ_TEST[i].ok;
          return (
            <React.Fragment key={z.f}>
              <span style={{ ...TAB_ZELLE, fontWeight: 700 }}><M t={z.f} /></span>
              <span style={{ ...TAB_ZELLE, fontSize: 13.5 }}><M t={z.regel} /></span>
              <span style={TAB_ZELLE}><M t={z.exakt} /></span>
              <span style={{ ...TAB_ZELLE, fontWeight: 800, color: ok ? C.smaragd : C.signal }} aria-label={ok ? "stimmt" : "stimmt nicht"}>{ok ? "✓" : "✗"}</span>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

/* Rechteck, Trapez, Fassregel für eˣ auf [0; 2] und 1/x auf [1; 3] */
function VergleichTabelle() {
  const zeilen = [
    ["Rechteck", BEISPIEL_EXP.rechteck, BEISPIEL_EXP.I, BEISPIEL_KEHR.rechteck, BEISPIEL_KEHR.I, C.signal],
    ["Trapez", BEISPIEL_EXP.trapez, BEISPIEL_EXP.I, BEISPIEL_KEHR.trapez, BEISPIEL_KEHR.I, C.lila],
    ["Fassregel", BEISPIEL_EXP.fass, BEISPIEL_EXP.I, BEISPIEL_KEHR.fass, BEISPIEL_KEHR.I, C.gold],
  ];
  const fz = (v, I) => { const e = v - I; return `${e > 0 ? "+" : ""}${dk(e, 4)}`; };
  const zelle = (v, I, farbe) => (
    <span style={{ ...TAB_ZELLE, flexDirection: "column", alignItems: "flex-end", fontVariantNumeric: "tabular-nums" }}>
      <b style={{ fontWeight: 700 }}>{dk(v, 4)}</b><span style={{ fontSize: 12, color: farbe, fontWeight: 700 }}>{fz(v, I)}</span>
    </span>
  );
  return (
    <div style={{ ...KARTE, padding: "14px 14px 8px", margin: "4px 0 18px" }} data-vergleich-tabelle="">
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto auto", columnGap: 12 }}>
        <span style={TAB_KOPF}>Regel</span>
        <span style={{ ...TAB_KOPF, textAlign: "right" }}><M t={"e^x \\text{ auf } [0; 2]"} /></span>
        <span style={{ ...TAB_KOPF, textAlign: "right" }}><M t={"\\frac{1}{x} \\text{ auf } [1; 3]"} /></span>
        <span style={{ ...TAB_ZELLE, color: C.grau }}>exakt</span>
        <span style={{ ...TAB_ZELLE, justifyContent: "flex-end", fontWeight: 700 }}>{dk(BEISPIEL_EXP.I, 4)}</span>
        <span style={{ ...TAB_ZELLE, justifyContent: "flex-end", fontWeight: 700 }}>{dk(BEISPIEL_KEHR.I, 4)}</span>
        {zeilen.map(([name, v1, I1, v2, I2, farbe]) => (
          <React.Fragment key={name}>
            <span style={{ ...TAB_ZELLE, fontWeight: 700, color: farbe }}>{name}</span>
            {zelle(v1, I1, farbe)}
            {zelle(v2, I2, farbe)}
          </React.Fragment>
        ))}
      </div>
      <p style={{ fontSize: 12, color: C.grau, fontWeight: 300, margin: "8px 0 4px" }}>Darunter jeweils der Fehler: Näherung − exakter Wert.</p>
    </div>
  );
}

/* ======================================================================
   Labor 1: Fläche schätzen – Funktion, Intervall, Parabel, Fehler live
   ====================================================================== */
const LW = 360, LH = 230, LL = 30, LR = 344, LT = 12, LB = 200;
/* Fehler als TeX: +0,032, −0,0022, +1,2 · 10^{−6} */
function fehlerAnzeige(e) {
  if (e === 0) return "0";
  const v = Math.abs(e) >= 0.01 ? dk(e, 3) : Math.abs(e) >= 1e-4 ? dk(e, Math.abs(e) >= 0.001 ? 4 : 5) : null;
  if (v !== null) return `${e > 0 ? "+" : ""}${v}`;
  const k = Math.floor(Math.log10(Math.abs(e))), m = Math.abs(e) / 10 ** k;
  return `${e > 0 ? "+" : "−"}${dk(m, 1)} \\cdot 10^{−${-k}}`;
}
function FlaechenBild({ fn, a, b, n, parabel }) {
  const X = skala(fn.fenster[0], fn.fenster[1], LL, LR), Y = skala(fn.y[0], fn.y[1], LB, LT);
  const von = fn.ab ?? fn.fenster[0];
  const stuecke = Array.from({ length: n }, (_, i) => [a + ((b - a) * i) / n, a + ((b - a) * (i + 1)) / n]);
  const punkte = Array.from({ length: 2 * n + 1 }, (_, i) => a + ((b - a) * i) / (2 * n));
  const ganz = (lo, hi, d = 1) => { const l = []; for (let x = Math.ceil(lo / d) * d; x <= hi + 1e-9; x += d) if (Math.abs(x) > 1e-9) l.push(Math.round(x * 100) / 100); return l; };
  const yd = fn.y[1] - fn.y[0] > 5 ? 2 : 1;
  return (
    <svg viewBox={`0 0 ${LW} ${LH}`} style={{ width: "100%", maxWidth: 480, display: "block", margin: "0 auto" }} role="img"
      aria-label={`Schaubild: Fläche unter der Kurve von ${dk(a, 2)} bis ${dk(b, 2)}${parabel ? ", dazu die Parabel durch die drei Punkte" : ""}`} data-flaechen-bild="">
      <defs><clipPath id="fass-labor-rahmen"><rect x={LL} y={LT - 6} width={LR - LL} height={LB - LT + 6} /></clipPath></defs>
      <g clipPath="url(#fass-labor-rahmen)">
        <path d={unter(fn.f, a, b, X, Y)} fill={C.himmel} />
        {parabel && stuecke.map(([u, v], i) => {
          const p = parabelDurch(fn.f, u, v);
          return (
            <g key={i}>
              <path d={zwischen(fn.f, p, u, v, X, Y)} fill={C.signal} fillOpacity="0.3" />
              <path d={kurve(p, u, v, X, Y, 32)} fill="none" stroke={C.gold} strokeWidth="2.2" strokeDasharray="6 4" />
            </g>
          );
        })}
        <path d={kurve(fn.f, von, fn.fenster[1], X, Y, 160)} fill="none" stroke={C.see} strokeWidth="2.3" />
      </g>
      <Achsen X={X} Y={Y} xr={fn.fenster} yr={fn.y} xt={ganz(fn.fenster[0] + 0.2, fn.fenster[1] - 0.2)} yt={ganz(fn.y[0] + 0.2, fn.y[1] - 0.2, yd)} />
      {[a, b].map((x, i) => (
        <g key={i}>
          <line x1={X(x)} y1={Math.min(Y(0), Y(fn.f(x)))} x2={X(x)} y2={LB + 8} stroke={C.hellgrau} strokeWidth="1" strokeDasharray="3 3" />
          <T x={X(x)} y={LB + 22} textAnchor="middle" fontSize="12" fontWeight="800" fontStyle="italic" fill={C.tinte}>{i ? "b" : "a"}</T>
        </g>
      ))}
      {stuecke.slice(1).map(([u]) => <line key={u} x1={X(u)} y1={Y(0)} x2={X(u)} y2={Y(fn.f(u))} stroke={C.gold} strokeWidth="1" strokeDasharray="2 3" />)}
      {punkte.map((x, i) => <circle key={i} cx={X(x)} cy={Y(fn.f(x))} r={i % 2 ? 4.4 : 3.8} fill={i % 2 ? C.flaggold : C.weiss} stroke={C.gold} strokeWidth="1.4" />)}
    </svg>
  );
}
function GrenzeKnopf({ name, wert, setzen }) {
  return (
    <div className="flex items-center" style={{ gap: 8 }}>
      <PlusMinus setzen={setzen} label={name === "a" ? "Untere Grenze a" : "Obere Grenze b"} />
      <span style={{ fontSize: 16, color: C.tinte, fontVariantNumeric: "tabular-nums", minWidth: 62 }} data-grenze={name}><M t={`${name} = ${dk(wert, 2)}`} /></span>
    </div>
  );
}
const KLEIN_CHIP = (an) => ({
  padding: "6px 11px", borderRadius: 999, border: `1px solid ${an ? C.flaggold : C.linie}`, background: an ? "#FFF6D6" : C.weiss,
  color: an ? C.tinte : C.grau, fontSize: 12.5, fontWeight: an ? 600 : 400, fontFamily: "inherit", cursor: "pointer",
});
function FlaechenLabor() {
  const [fid, setFid] = useState("kubisch");
  const fn = LABOR_FUNKTIONEN.find((x) => x.id === fid);
  const [[a, b], setAb] = useState(fn.start);
  const [n, setN] = useState(1);
  const [parabel, setParabel] = useState(true);
  const waehle = (id) => { setFid(id); setAb(LABOR_FUNKTIONEN.find((x) => x.id === id).start); };
  const w = laborWerte(fn, a, b, n);
  const status = fn.grad !== null
    ? (fn.grad <= 3 ? `Polynom vom Grad ${fn.grad}: Die Fassregel ist exakt – egal, welches Intervall.` : "Polynom vom Grad 4: nicht exakt. Mit mehr Fässern wird der Fehler schnell kleiner.")
    : "Kein Polynom: Die Parabel trifft die Kurve nicht genau, ein kleiner Fehler bleibt.";
  const zeile = (name, wert, fehler, farbe, attr) => (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto auto", gap: 12, alignItems: "baseline", padding: "7px 0", borderTop: `1px solid ${C.linie}` }} {...attr}>
      <span style={{ fontSize: 13.5, fontWeight: 700, color: farbe }}>{name}</span>
      <span style={{ fontSize: 14.5, fontWeight: 700, color: C.tinte, fontVariantNumeric: "tabular-nums", textAlign: "right" }}>{dk(wert, 4)}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: fehler === "0" ? C.smaragd : farbe, fontVariantNumeric: "tabular-nums", textAlign: "right", minWidth: 74 }}>
        {fehler === "Fehler" ? fehler : <M t={fehler} />}
      </span>
    </div>
  );
  return (
    <div data-flaechen-labor="" data-funktion={fid} data-fehler={w.fassFehler}>
      <div className="flex flex-wrap items-center" style={{ gap: 6, marginBottom: 10 }}>
        {LABOR_FUNKTIONEN.map((x) => <button key={x.id} type="button" onClick={() => waehle(x.id)} aria-pressed={fid === x.id} style={KLEIN_CHIP(fid === x.id)}>{x.name}</button>)}
      </div>
      <p style={{ fontSize: 15, color: C.tinte, marginBottom: 6, overflowX: "auto" }}><M t={fn.tex} /></p>
      <FlaechenBild fn={fn} a={a} b={b} n={n} parabel={parabel} />
      <div className="flex flex-wrap items-center" style={{ gap: "10px 18px", margin: "10px 0 10px" }}>
        <GrenzeKnopf name="a" wert={a} setzen={(d) => setAb(grenzeSetzen(fn, a, b, "a", d))} />
        <GrenzeKnopf name="b" wert={b} setzen={(d) => setAb(grenzeSetzen(fn, a, b, "b", d))} />
      </div>
      <div className="flex flex-wrap items-center" style={{ gap: 6, marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: C.grau, marginRight: 2 }}>Fässer</span>
        {[1, 2, 4].map((k) => <button key={k} type="button" onClick={() => setN(k)} aria-pressed={n === k} aria-label={`${k} ${k === 1 ? "Fass" : "Fässer"}`} style={KLEIN_CHIP(n === k)}>{k}</button>)}
        <button type="button" onClick={() => setParabel((p) => !p)} aria-pressed={parabel} style={{ ...KLEIN_CHIP(parabel), marginLeft: 6 }}>Parabel zeigen</button>
      </div>
      <div>
        {zeile("exakt", w.exakt, "Fehler", C.grau, { "data-exakt": w.exakt })}
        {zeile(n === 1 ? "Fassregel" : `Fassregel, ${n} Fässer`, w.fass, fehlerAnzeige(w.fassFehler), C.gold, { "data-fass": w.fass })}
        {zeile(n === 1 ? "Trapez" : `Trapez, ${n} Stücke`, w.trapez, fehlerAnzeige(w.trapezFehler), C.lila, {})}
        {zeile(n === 1 ? "Rechteck" : `Rechteck, ${n} Stücke`, w.rechteck, fehlerAnzeige(w.rechteckFehler), C.signal, {})}
      </div>
      <p style={{ fontSize: 13, color: C.gruenDunkel, fontWeight: 600, lineHeight: 1.6, marginTop: 8 }} data-labor-status="">{status}</p>
      {parabel && <p style={{ fontSize: 12.5, color: C.grau, fontWeight: 300, lineHeight: 1.6, marginTop: 4 }}>Gestrichelt: die Parabel durch die drei Punkte jedes Fasses. Rot getönt: der Unterschied zwischen Kurve und Parabel.</p>}
    </div>
  );
}

/* ======================================================================
   Labor 2: Fass – Radien und Höhe einstellen
   ====================================================================== */
function FassZeichnung({ ru, rm, ro, h }) {
  const W = 360, HH = 252, cx = 150, e = 0.2;
  const r = fassProfil(ru, rm, ro, h);
  const N = 40, zs = Array.from({ length: N + 1 }, (_, i) => (h * i) / N);
  const rMax = Math.max(1, ...zs.map(r));
  const s = Math.min(190 / h, 92 / rMax);
  /* flache Fässer senkrecht mittig, hohe stehen wie bisher unten bei 222 */
  const yU = 127 + (h * s) / 2, yO = yU - h * s, yM = yU - (h / 2) * s;
  const links = zs.map((z) => `${zahl(cx - r(z) * s)} ${zahl(yU - z * s)}`), rechts = zs.map((z) => `${zahl(cx + r(z) * s)} ${zahl(yU - z * s)}`).reverse();
  const wand = `M${links.join(" L")} L${rechts.join(" L")}${ru > 0 ? ` A${ru * s} ${ru * s * e} 0 0 1 ${cx - ru * s} ${yU}` : ""} Z`;
  const schnitte = [{ r: ru, y: yU, n: "u" }, { r: rm, y: yM, n: "m" }, { r: ro, y: yO, n: "o" }];
  const LX = cx + rMax * s + 16;
  return (
    <svg viewBox={`0 0 ${W} ${HH}`} style={{ width: "100%", maxWidth: 440, display: "block", margin: "0 auto" }} role="img" data-fass-bild=""
      aria-label={`Fass mit den Radien ${ru}, ${rm} und ${ro} cm und der Höhe ${h} cm`}>
      <path d={wand} fill={C.himmel} stroke={C.see} strokeWidth="1.6" strokeLinejoin="round" />
      {ro > 0 && <ellipse cx={cx} cy={yO} rx={ro * s} ry={ro * s * e} fill="#DCE6F5" stroke={C.see} strokeWidth="1.3" />}
      {schnitte.map((q, i) => (q.r > 0
        ? <ellipse key={q.n} cx={cx} cy={q.y} rx={q.r * s} ry={q.r * s * e} fill={C.flaggold} fillOpacity={i === 1 ? 0.42 : 0.3} stroke={C.gold} strokeWidth={i === 1 ? 2 : 1.5} />
        : <circle key={q.n} cx={cx} cy={q.y} r="2.6" fill={C.gold} />))}
      {schnitte.map((q) => (
        <g key={`l${q.n}`}>
          <line x1={cx + q.r * s + 3} y1={q.y} x2={LX - 4} y2={q.y} stroke={C.gold} strokeWidth="1" strokeDasharray="2 3" />
          <T x={LX} y={q.y + 4} fontSize="12" fontWeight="700" fill={C.tinte}>r<tspan dy="3" fontSize="9">{q.n}</tspan><tspan dy="-3"> = {q.r} cm</tspan></T>
        </g>
      ))}
      <g stroke={C.grau} strokeWidth="1">
        <line x1={cx - rMax * s - 18} y1={yO} x2={cx - rMax * s - 18} y2={yU} />
        <line x1={cx - rMax * s - 22} y1={yO} x2={cx - rMax * s - 14} y2={yO} />
        <line x1={cx - rMax * s - 22} y1={yU} x2={cx - rMax * s - 14} y2={yU} />
      </g>
      <T x={cx - rMax * s - 24} y={yM} textAnchor="middle" fontSize="12" fontWeight="700" fill={C.tinte} transform={`rotate(-90 ${cx - rMax * s - 24} ${yM})`}>h = {h} cm</T>
    </svg>
  );
}
function MassKnopf({ k, name, wert, einheit, setzen }) {
  return (
    <div className="flex items-center" style={{ gap: 8, minWidth: 0 }}>
      <PlusMinus setzen={setzen} label={name} />
      <span style={{ fontSize: 15, color: C.tinte, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }} data-mass={k}>
        <M t={`${k === "h" ? "h" : `r_${k.slice(1)}`} = ${wert}\\text{ ${einheit}}`} />
      </span>
    </div>
  );
}
function FassLabor() {
  const [m, setM] = useState({ ru: 25, rm: 30, ro: 25, h: 80 });
  const setze = (k, d) => setM((x) => {
    const neu = { ...x, [k]: x[k] + d * (k === "h" ? 5 : 1) };
    const [lo, hi] = k === "h" ? FASS_GRENZEN.h : FASS_GRENZEN.r;
    return neu[k] < lo || neu[k] > hi || !fassErlaubt(neu.ru, neu.rm, neu.ro, neu.h) || Math.max(neu.ru, neu.rm, neu.ro) === 0 ? x : neu;
  });
  const { ru, rm, ro, h } = m;
  const V = fassVolumen(ru, rm, ro, h) / 1000, Vp = parabelFass(ru, rm, ro, h) / 1000, d = fassAbweichung(ru, rm, ro, h) / 1000;
  const gerade = Math.abs(ru - 2 * rm + ro) < 1e-9;
  const vorlage = FASS_VORLAGEN.find((v) => v.ru === ru && v.rm === rm && v.ro === ro && v.h === h);
  return (
    <div data-fass-labor="" data-volumen={V}>
      <div className="flex flex-wrap items-center" style={{ gap: 6, marginBottom: 10 }}>
        {FASS_VORLAGEN.map((v) => (
          <button key={v.id} type="button" onClick={() => setM({ ru: v.ru, rm: v.rm, ro: v.ro, h: v.h })} aria-pressed={!!vorlage && vorlage.id === v.id} style={KLEIN_CHIP(!!vorlage && vorlage.id === v.id)}>{v.name}</button>
        ))}
      </div>
      <FassZeichnung ru={ru} rm={rm} ro={ro} h={h} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px 12px", margin: "10px 0 12px" }}>
        <MassKnopf k="ro" name="Radius oben" wert={ro} einheit="cm" setzen={(x) => setze("ro", x)} />
        <MassKnopf k="h" name="Höhe" wert={h} einheit="cm" setzen={(x) => setze("h", x)} />
        <MassKnopf k="rm" name="Radius Mitte" wert={rm} einheit="cm" setzen={(x) => setze("rm", x)} />
        <span />
        <MassKnopf k="ru" name="Radius unten" wert={ru} einheit="cm" setzen={(x) => setze("ru", x)} />
      </div>
      <Formeln zeilen={[
        `A_u \\approx ${dkTex(kreis(ru), 0)}\\text{ cm}^2, \\quad A_m \\approx ${dkTex(kreis(rm), 0)}\\text{ cm}^2, \\quad A_o \\approx ${dkTex(kreis(ro), 0)}\\text{ cm}^2`,
        `V \\approx ${qTex(Q(h, 6))} \\cdot (A_u + 4A_m + A_o) \\approx ${dkTex(V * 1000, 0)}\\text{ cm}^3`,
      ]} max={14} min={10.5} />
      <div style={{ borderRadius: 14, padding: "12px 14px", color: C.weiss, background: `linear-gradient(160deg, ${C.seeTief} 0%, ${C.see} 100%)` }}>
        <div className="flex flex-wrap items-baseline" style={{ gap: "2px 12px" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.flaggold, letterSpacing: "0.03em" }}>FASSREGEL</span>
          <span style={{ marginLeft: "auto", fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }} data-fass-liter="">{dk(V, 1)} l</span>
        </div>
        <p style={{ fontSize: 13, fontWeight: 300, lineHeight: 1.6, color: "#E6ECF8", marginTop: 4 }}>
          {gerade
            ? "Die Wand ist gerade (Zylinder, Kegel oder Kegelstumpf) – die Fassregel ist exakt."
            : `Ist die Wand eine Parabel durch die drei Radien, fasst das Fass genau ${dk(Vp, 1)} l. Die Fassregel liegt ${dk(d, 2)} l darüber (${dk((100 * d) / Vp, 2)} %).`}
        </p>
      </div>
    </div>
  );
}

/* ======================================================================
   Übungen
   ====================================================================== */
const ARIA = { m: "Mitte m", N: "Näherung", E: "Fehler", V: "Volumen", rm: "Radius in halber Höhe", alpha: "alpha", beta: "beta", gamma: "gamma", A: "Fläche", g0: "Gewicht g0", g1: "Gewicht g1", g2: "Gewicht g2" };
function Feld({ k, tex, einheit, modus, wert, setzen, stand, onEnter }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 16, fontWeight: 500, color: C.tinte }}>
      <span><M t={`${tex} =`} /></span>
      <MatheFeld modus={modus} value={wert} onChange={(e) => setzen(k, e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") onEnter(); }}
        aria-label={ARIA[k]} data-feld={k} placeholder="?" style={{ ...ZELLE(stand), width: 100 }} />
      {einheit && <span style={{ fontSize: 13.5, color: C.grau }}>{einheit}</span>}
    </label>
  );
}
function Stufen({ art, stufe, setzen }) {
  return (
    <div className="flex items-center flex-wrap" style={{ gap: 10, marginBottom: 16 }}>
      <span style={{ fontSize: 13.5, color: C.grau, fontWeight: 300 }}>Schwierigkeit</span>
      <PlusMinus setzen={(d) => setzen(stufe + d)} label="Schwierigkeit" />
      <div className="flex" style={{ gap: 4 }}>
        {[1, 2, 3, 4, 5].map((s) => <span key={s} style={{ width: 9, height: 9, borderRadius: 999, background: s <= stufe ? C.see : C.linie, display: "inline-block" }} />)}
      </div>
      <span style={{ fontSize: 13.5, color: C.gruenDunkel, fontWeight: 600 }}>{stufe} / 5 · {STUFEN_NAMEN[art][stufe - 1]}</span>
    </div>
  );
}
function FassTrainer() {
  const [art, setArt] = useState("anwenden");
  const [stufe, setStufe] = useState(1);
  const [auf, setAufRoh] = useState(() => merk(aufgabe("anwenden", 1)));
  const setAuf = (a) => setAufRoh(merk(a));
  const [ein, setEin] = useState({});
  const [erg, setErg] = useState(null);
  const [zeigen, setZeigen] = useState(false);
  const [serie, setSerie] = useState({ n: 0, ok: 0 });
  const neu = (a = art, s = stufe) => { setAuf(aufgabe(a, s)); setEin({}); setErg(null); setZeigen(false); };
  const artSetzen = (a) => { setArt(a); neu(a, stufe); };
  const stufeSetzen = (s) => { const v = Math.max(1, Math.min(5, s)); setStufe(v); neu(art, v); };
  const setze = (k, v) => { setEin((e) => ({ ...e, [k]: v })); setErg(null); };
  const fe = felder(auf);
  const leer = fe.some(([k]) => !String(ein[k] ?? "").trim());
  const pruefen = () => {
    if (leer) return;
    const e = pruefe(auf, ein);
    setErg(e);
    setSerie((x) => ({ n: x.n + 1, ok: x.ok + (e.ok ? 1 : 0) }));
  };
  const weg = <Formeln zeilen={rechenweg(auf)} max={15} min={10.5} farbe={C.see} />;
  return (
    <div>
      <p style={{ ...FLIESS, lineHeight: 1.7, marginBottom: 18 }}>
        Vier Aufgabentypen mit immer neuen Zahlen: die Regel anwenden, entscheiden, ob sie exakt ist, Fassvolumen schätzen
        und die Parabel samt Gewichten 1 : 4 : 1 selbst herleiten. Brüche gibst du als 7/3 ein, Dezimalzahlen mit Komma.
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        {ARTEN.map((a) => <Chip key={a.id} aktiv={art === a.id} onClick={() => artSetzen(a.id)}>{a.name}</Chip>)}
      </div>
      <Stufen art={art} stufe={stufe} setzen={stufeSetzen} />
      <div style={KARTE} data-mm-karte="" data-fasstrainer="">
        <Text s={auftrag(auf)} style={{ fontSize: 15, color: C.tinte, fontWeight: 400, lineHeight: 1.75, marginBottom: 12 }} />
        {fe.some(([, , , modus]) => modus === "wahl") && (
          <div className="flex flex-wrap" style={{ gap: 8, marginBottom: 12 }} role="group" aria-label="Ist die Fassregel exakt?">
            {ENTSCHEIDUNG.map((o) => {
              const an = ein.ex === o.id, schlecht = an && erg && erg.felder.ex === false;
              return (
                <button key={o.id} type="button" onClick={() => setze("ex", o.id)} aria-pressed={an} data-wahl={o.id}
                  style={{ padding: "9px 16px", borderRadius: 999, fontFamily: "inherit", fontSize: 14.5, fontWeight: 600, cursor: "pointer",
                    border: `1.5px solid ${schlecht ? C.signal : an ? C.see : C.linie}`, background: an ? (schlecht ? "#FBEFE9" : C.himmel) : C.weiss, color: C.tinte }}>
                  {o.name}
                </button>
              );
            })}
          </div>
        )}
        <div className="flex flex-wrap" style={{ gap: 14, marginBottom: 12 }}>
          {fe.filter(([, , , modus]) => modus !== "wahl").map(([k, tex, einheit, modus]) => (
            <Feld key={`${k}-${auf.art}-${auf.stufe}`} k={k} tex={tex} einheit={einheit} modus={modus} wert={ein[k] ?? ""} setzen={setze} stand={erg ? erg.felder[k] : null} onEnter={pruefen} />
          ))}
        </div>
        {erg && erg.ok && (
          <div style={{ borderLeft: `4px solid ${C.see}`, paddingLeft: 16, marginBottom: 14 }} data-ergebnis="richtig">
            <p style={{ fontSize: 16, fontWeight: 600, color: C.see, marginBottom: 2 }}>Stimmt!</p>
            {weg}
          </div>
        )}
        {erg && !erg.ok && (
          <div style={{ borderLeft: `4px solid ${C.signal}`, paddingLeft: 16, marginBottom: 14 }} data-ergebnis="falsch">
            <p style={{ fontSize: 15, fontWeight: 600, color: C.signal, marginBottom: 6 }}>Stimmt noch nicht.</p>
            <Text s={erg.grund || tipp(auf)} style={{ fontSize: 14, color: C.tinte, fontWeight: 300, lineHeight: 1.75 }} />
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
const ERGEBNIS = { fontSize: 15, color: C.tinte, fontWeight: 500, lineHeight: 1.8, margin: "8px 0 10px" };
export function GfsFassregelSeite({ gehe }) {
  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 22 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 14 }}>
        Wie schätzt man ein Integral mit nur drei Funktionswerten – und warum ist das oft exakt?
      </h2>
      <Text s={`Ein Fass, drei Messungen: der Durchmesser unten, in halber Höhe und oben. Mehr braucht man nicht, um das Volumen
        erstaunlich genau zu schätzen. Dasselbe funktioniert mit Flächen: Drei Funktionswerte genügen, um ein Integral zu schätzen –
        ganz ohne Stammfunktion.`} style={FLIESS} />
      <Text s={`Die Regel dahinter heißt Keplersche Fassregel. Wir leiten sie in sechs Schritten her, beweisen, dass sie für alle
        Polynome bis Grad 3 sogar exakt ist, messen, wie gut sie bei anderen Funktionen ist, und berechnen damit Fassvolumen.`} style={FLIESS} />

      <FassAnimation art="idee" offen />

      <Schritt nr="1" titel="Das Problem: eine Fläche aus wenigen Werten" />
      <Text s={`Oft kennt man von einer Funktion nur einzelne Werte – etwa die Geschwindigkeit eines Autos zu drei Zeitpunkten –,
        oder die Stammfunktion ist unbequem. Trotzdem will man $\\int_a^b f(x)\\,dx$ wissen. Zwei einfache Schätzungen kennst du
        vielleicht schon. Mit der Mitte $m = \\frac{a + b}{2}$:`} style={FLIESS} />
      <Formeln zeilen={[
        "\\text{Rechteck: } (b − a) \\cdot f(m)",
        "\\text{Trapez: } \\frac{b − a}{2} \\cdot (f(a) + f(b))",
      ]} max={17} />
      <Text s={`Beide ersetzen die Kurve durch eine Gerade: das Rechteck durch eine waagrechte in der Höhe $f(m)$, das Trapez durch
        die Sehne. Für $f(x) = e^x$ auf $[0; 2]$ ist die Fläche exakt $e^2 − 1 \\approx 6,389$:`} style={FLIESS} />
      <Formeln zeilen={[
        "\\text{Rechteck: } (2 − 0) \\cdot f(1) = 2e \\approx 5,437",
        "\\text{Trapez: } \\frac{2 − 0}{2} \\cdot (f(0) + f(2)) = 1 + e^2 \\approx 8,389",
      ]} max={16} />
      <Text s={`Das Rechteck liefert 0,952 zu wenig, das Trapez sogar genau 2 zu viel, denn $(1 + e^2) − (e^2 − 1) = 2$.
        Eine Gerade kann sich einer gekrümmten Kurve eben nur schlecht anpassen.`} style={FLIESS} />

      <Schritt nr="2" titel="Die Idee: eine Parabel durch drei Punkte" />
      <Text s={`Nimmt man den Wert in der Mitte dazu, hat man drei Punkte. Durch drei Punkte mit verschiedenen x-Werten geht genau
        eine Parabel – oder eine Gerade, wenn die Punkte auf einer liegen. Die Fläche unter dieser Parabel können wir exakt
        ausrechnen und als Schätzung für die Fläche unter $f$ nehmen.`} style={FLIESS} />
      <Text s={`Damit die Rechnung kurz wird, verschieben wir das Intervall so, dass die Mitte bei 0 liegt. Mit der halben Breite
        $h = \\frac{b − a}{2}$ wird aus $[a; b]$ das Intervall $[−h; h]$. Verschieben ändert keine Fläche. Die drei Werte heißen
        jetzt $y_0 = f(a)$, $y_1 = f(m)$ und $y_2 = f(b)$. Die Parabel $p(x) = \\alpha{}x^2 + \\beta{}x + \\gamma$ soll durch
        $(−h \\mid y_0)$, $(0 \\mid y_1)$ und $(h \\mid y_2)$ gehen:`} style={FLIESS} />
      <Formeln zeilen={[
        "p(0) = \\gamma = y_1",
        "p(h) = \\alpha{}h^2 + \\beta{}h + \\gamma = y_2",
        "p(−h) = \\alpha{}h^2 − \\beta{}h + \\gamma = y_0",
      ]} max={17} />
      <Text s={`Addiert man die letzten beiden Gleichungen, fällt $\\beta$ weg. Subtrahiert man sie, fällt alles außer $\\beta$ weg:`} style={FLIESS} />
      <Formeln zeilen={[
        "2\\alpha{}h^2 + 2\\gamma = y_0 + y_2 \\;\\Rightarrow\\; \\alpha = \\frac{y_0 − 2y_1 + y_2}{2h^2}",
        "2\\beta{}h = y_2 − y_0 \\;\\Rightarrow\\; \\beta = \\frac{y_2 − y_0}{2h}",
      ]} max={17} />

      <Schritt nr="3" titel="Die Fläche unter der Parabel ist die Fassregel" />
      <Text s={`Jetzt integrieren wir $p$ von $−h$ bis $h$. Der Teil $\\beta{}x$ liefert dabei 0: Links von 0 liegt gleich viel
        Fläche unter der Achse wie rechts darüber, denn $\\frac{\\beta}{2}h^2 − \\frac{\\beta}{2}(−h)^2 = 0$.`} style={FLIESS} />
      <Formeln zeilen={[
        "\\int_{−h}^{h} 1\\,dx = 2h, \\quad \\int_{−h}^{h} x\\,dx = 0",
        "\\int_{−h}^{h} x^2\\,dx = \\frac{2}{3}h^3",
      ]} max={16} />
      <Formeln zeilen={[
        "\\int_{−h}^{h} p(x)\\,dx = \\alpha \\cdot \\frac{2}{3}h^3 + \\beta \\cdot 0 + \\gamma \\cdot 2h",
        "= \\frac{2}{3}\\alpha{}h^3 + 2\\gamma{}h",
        "= \\frac{2}{3} \\cdot \\frac{y_0 − 2y_1 + y_2}{2h^2} \\cdot h^3 + 2y_1h",
        "= \\frac{h}{3} \\cdot (y_0 − 2y_1 + y_2) + \\frac{h}{3} \\cdot 6y_1",
        "= \\frac{h}{3} \\cdot (y_0 + 4y_1 + y_2)",
      ]} max={16} />
      <Text s={`Zurück auf $[a; b]$: Wegen $h = \\frac{b − a}{2}$ ist $\\frac{h}{3} = \\frac{b − a}{6}$.`} style={FLIESS} />
      <Kasten titel="Keplersche Fassregel">
        <Formeln zeilen={[
          "\\int_a^b f(x)\\,dx \\approx \\frac{b − a}{6} \\cdot (f(a) + 4f(m) + f(b))",
          "m = \\frac{a + b}{2}",
        ]} max={16} />
        <Text s={`Die drei Werte zählen im Verhältnis $1 : 4 : 1$ – zusammen also 6, deshalb steht die 6 im Nenner.
          Für $e^x$ auf $[0; 2]$ liefert die Regel nur 0,032 zu viel:`} style={ERGEBNIS} />
        <Formeln zeilen={["\\frac{2 − 0}{6} \\cdot (1 + 4e + e^2) = \\frac{1 + 4e + e^2}{3} \\approx 6,421"]} max={16} />
      </Kasten>
      <FassAnimation art="parabel" />

      <Schritt nr="4" titel="Warum die Regel bis Grad 3 exakt ist" />
      <Text s={`Die Fassregel benutzt nur eine Parabel – trotzdem stimmt sie sogar für jedes Polynom vom Grad 3. Der Beweis braucht
        zwei Beobachtungen. Erstens sind Integral und Fassregel beide linear: Ist die Regel für $f$ und $g$ exakt, dann auch für
        $r \\cdot f + s \\cdot g$. Es reicht also, die Bausteine $1$, $x$, $x^2$ und $x^3$ zu prüfen. Zweitens reicht das Intervall
        $[−h; h]$: Verschiebt man ein Polynom vom Grad 3, ist es wieder eines vom Grad höchstens 3, und weder Fläche noch Regel ändern sich.`} style={FLIESS} />
      <PotenzTabelle />
      <Text s={`Für $x$ und $x^3$ sind Fläche und Regel 0, weil beide Funktionen ungerade sind. Für $x^2$ stimmt es, weil die
        Parabel ja genau dafür gebaut ist. Erst bei $x^4$ geht es schief: $\\frac{2}{3}h^5$ statt $\\frac{2}{5}h^5$.`} style={FLIESS} />
      <Kasten titel="Satz">
        <Text s={`Für jedes Polynom $f$ vom Grad höchstens 3 gilt $\\int_a^b f(x)\\,dx = \\frac{b − a}{6} \\cdot (f(a) + 4f(m) + f(b))$.
          Für $f(x) = x^4$ liefert die Regel genau $\\frac{(b − a)^5}{120}$ zu viel.`} style={ERGEBNIS} />
      </Kasten>
      <Text s={`Zum Nachrechnen auf $[0; 2]$, also $\\frac{b − a}{6} = \\frac{1}{3}$:`} style={FLIESS} />
      <Formeln zeilen={[
        "x^3: \\quad \\frac{1}{3} \\cdot (0 + 4 + 8) = 4 = \\int_0^2 x^3\\,dx",
        "x^4: \\quad \\frac{1}{3} \\cdot (0 + 4 + 16) = \\frac{20}{3}, \\quad \\int_0^2 x^4\\,dx = \\frac{32}{5}",
        "\\frac{20}{3} − \\frac{32}{5} = \\frac{4}{15} = \\frac{2^5}{120}",
      ]} max={16} />
      <FassAnimation art="grad3" />

      <Schritt nr="5" titel="Wie gut ist die Regel bei anderen Funktionen?" />
      <Text s={`Bei $e^x$, $\\frac{1}{x}$ oder $\\sqrt{x}$ ist die Parabel nur eine Näherung. Zwei Beispiele mit allen drei Regeln:`} style={FLIESS} />
      <VergleichTabelle />
      <Text s={`Rechteck und Trapez irren in verschiedene Richtungen, das Trapez etwa doppelt so stark. Die Fassregel ist genau die
        Mischung, bei der sich die Fehler fast aufheben:`} style={FLIESS} />
      <Formeln zeilen={[
        "\\frac{2}{3} \\cdot \\text{Rechteck} + \\frac{1}{3} \\cdot \\text{Trapez}",
        "= \\frac{2}{3} \\cdot (b − a) \\cdot f(m) + \\frac{1}{3} \\cdot \\frac{b − a}{2} \\cdot (f(a) + f(b))",
        "= \\frac{b − a}{6} \\cdot (f(a) + 4f(m) + f(b))",
      ]} max={15} />
      <Text s={`Ist $f$ viermal stetig differenzierbar, gibt es eine Fehlerformel: Näherung − exakter Wert
        $= \\frac{(b − a)^5}{2880} \\cdot f^{(4)}(\\xi)$ für eine Stelle $\\xi$ zwischen $a$ und $b$. Der Fehler hängt also von der
        vierten Ableitung ab – bei Polynomen bis Grad 3 ist sie 0, bei $x^4$ ist sie 24, und $\\frac{24}{2880} = \\frac{1}{120}$.`} style={FLIESS} />
      <Text s={`Noch genauer wird es mit der summierten Fassregel: Man teilt $[a; b]$ in $n$ gleich breite Stücke und wendet auf jedes
        die Fassregel an. Für $e^x$ auf $[0; 2]$:`} style={FLIESS} />
      <Formeln zeilen={[
        `n = 1: \\quad N \\approx ${dk(S_WERT[0], 5)} \\quad \\text{Fehler} \\approx ${dk(S_FEHLER[0], 4)}`,
        `n = 2: \\quad N \\approx ${dk(S_WERT[1], 5)} \\quad \\text{Fehler} \\approx ${dk(S_FEHLER[1], 4)}`,
        `n = 4: \\quad N \\approx ${dk(S_WERT[2], 5)} \\quad \\text{Fehler} \\approx ${dk(S_FEHLER[2], 5)}`,
      ]} max={16} />
      <Text s={`Halbiert man die Breite, wird der Fehler etwa 16-mal kleiner: Jedes Stück ist ungefähr $2^5 = 32$-mal genauer,
        aber es gibt doppelt so viele Stücke.`} style={FLIESS} />
      <FassAnimation art="summiert" />

      <Schritt nr="6" titel="Das Fass: Volumen aus drei Querschnitten" />
      <Text s={`Schneidet man einen Körper waagrecht in dünne Scheiben, ist sein Volumen das Integral der Querschnittsfläche über
        die Höhe: $V = \\int_0^h A(z)\\,dz$ mit der ganzen Höhe $h$ des Körpers (nicht der halben Breite wie oben). Mit der Fassregel genügen drei
        Querschnitte – unten, in halber Höhe und oben:`} style={FLIESS} />
      <Kasten titel="Fassregel für Volumen">
        <Formeln zeilen={["V \\approx \\frac{h}{6} \\cdot (A_u + 4A_m + A_o)"]} max={18} />
      </Kasten>
      <Text s={`Für Zylinder, Kegel, Kegelstumpf und Kugel ist das exakt, denn dort ist $A(z)$ ein Polynom vom Grad höchstens 2.
        Mit dem Radius $r$ (Kugel: Höhe $2r$):`} style={FLIESS} />
      <Formeln zeilen={[
        "\\text{Zylinder: } \\frac{h}{6} \\cdot (\\pi{}r^2 + 4\\pi{}r^2 + \\pi{}r^2) = \\pi{}r^2h",
        "\\text{Kegel: } \\frac{h}{6} \\cdot (\\pi{}r^2 + 4\\pi \\cdot \\frac{r^2}{4} + 0) = \\frac{1}{3}\\pi{}r^2h",
        "\\text{Kugel: } \\frac{2r}{6} \\cdot (0 + 4\\pi{}r^2 + 0) = \\frac{4}{3}\\pi{}r^3",
      ]} max={16} />
      <Formeln titel="Kegelstumpf, Radius unten und oben" zeilen={[
        "\\frac{h}{6} \\cdot (\\pi{}r_u^2 + \\pi(r_u + r_o)^2 + \\pi{}r_o^2)",
        "= \\frac{1}{3}\\pi{}h(r_u^2 + r_ur_o + r_o^2)",
      ]} max={16} />
      <Text s={`Beim Kegelstumpf ist der Radius in halber Höhe $r_m = \\frac{r_u + r_o}{2}$, also $4\\pi{}r_m^2 = \\pi(r_u + r_o)^2$.
        Ein echtes Weinfass hat dagegen eine gebogene Wand. Ist sie eine Parabel, dann ist der Radius $r(z)$ quadratisch und
        $A(z) = \\pi \\cdot r(z)^2$ hat Grad 4 – die Fassregel liefert dann genau $\\frac{\\pi{}h(r_u − 2r_m + r_o)^2}{30}$ zu viel.
        Für ein Fass mit $h = 80$ cm und den Radien 25, 30 und 25 cm:`} style={FLIESS} />
      <Formeln zeilen={[
        "V \\approx \\frac{80}{6} \\cdot \\pi \\cdot (625 + 4 \\cdot 900 + 625)",
        "= \\frac{40}{3} \\cdot 4850\\pi \\approx 203\\,156\\text{ cm}^3",
        "\\text{zu viel: } \\frac{80\\pi \\cdot (25 − 60 + 25)^2}{30}",
        "= \\frac{800}{3}\\pi \\approx 838\\text{ cm}^3",
        "V \\approx 203,2\\text{ l statt } 202,3\\text{ l, gut } 0,4\\,\\% \\text{ zu viel}",
      ]} max={16} />
      <FassAnimation art="fass" />
      <Kasten titel="Woher der Name kommt">
        <Text s={`Johannes Kepler veröffentlichte 1615 ein Buch über das Ausmessen von Weinfässern. Nach ihm heißt die Regel im
          deutschsprachigen Raum Keplersche Fassregel. Im Englischen und in vielen anderen Sprachen heißt sie Simpsonregel, nach dem englischen
          Mathematiker Thomas Simpson.`} style={{ fontSize: 14.5, color: C.tinte, fontWeight: 400, lineHeight: 1.8, margin: "8px 0 10px" }} />
      </Kasten>
      <Kasten titel="Zum Mitnehmen">
        <Text s={`Drei Werte, Gewichte $1 : 4 : 1$, Vorfaktor $\\frac{b − a}{6}$. Für Polynome bis Grad 3 – und damit für Zylinder,
          Kegel und Kugel – ist die Fassregel exakt, sonst meist erstaunlich genau.`} style={ERGEBNIS} />
      </Kasten>

      <div style={{ ...KARTE, margin: "22px 0" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 12 }}>Labor: Fläche schätzen – Funktion und Intervall wählen</p>
        <FlaechenLabor />
      </div>
      <div style={{ ...KARTE, margin: "22px 0" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 12 }}>Labor: Fass – Radien und Höhe einstellen</p>
        <FassLabor />
      </div>

      <Trenner />

      <Kicker>Jetzt selbst üben</Kicker>
      <H3>Anwenden, exakt oder nicht, Fassvolumen, Gewichte</H3>
      <FassTrainer />

      {gehe && (
        <div style={{ ...KARTE, marginTop: 22, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: C.tinte, marginBottom: 4 }}>Integrale exakt berechnen</p>
            <p style={{ fontSize: 13.5, color: C.grau, fontWeight: 300, lineHeight: 1.6 }}>Stammfunktionen, bestimmte Integrale und Flächen mit vollständigem Rechenweg – im Integraltrainer.</p>
          </div>
          <button type="button" onClick={() => gehe({ ansicht: "integrale" })} className="px-5 py-3" style={KNOPF(true)}>Zum Integraltrainer</button>
        </div>
      )}

      <Trenner />

      <Kicker>Deine GFS</Kicker>
      <H3>Der rote Faden für den Vortrag</H3>
      <RoterFaden gliederung={GLIEDERUNG} tipps={TIPPS} hinweis="den Abschnitt „Wie gut ist sie?“" />

      <div style={{ height: 8 }} />
      <Kicker>Kolloquium</Kicker>
      <H3>Die Fragen nach dem Vortrag trainieren</H3>
      <Kolloquium fragen={KOLLOQUIUM} speicher="mm-gfs-fassregel-kolloquium" />
    </div>
  );
}
