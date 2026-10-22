import React, { useState } from "react";
import { C } from "./base1.jsx";
import { M, Text } from "./func3.jsx";
import { MatheFeld } from "./matheTastatur.jsx";
import { FLIESS, KARTE, ZELLE, Formeln, Schritt, Kasten, Chip, PlusMinus, Kicker, H3, Trenner, RoterFaden, Kolloquium } from "./funcGfsBausteine.jsx";
import { lauf } from "./funcErklaeranimation.jsx";
import { AnimKarte } from "./funcAnimKarte.jsx";
import {
  LABOR, LABOR_VORLAGEN, labor, drehmomente, dreiSorten, dreiGrenzen, DREI, dezimal,
  ARTEN, aufgabe, felder, auftrag, pruefe, rechenweg, tipp, GLIEDERUNG, TIPPS, KOLLOQUIUM,
} from "./gfsMischungen.js";

/* ============================================================
   Kurs GFS – Themenseite „Mischungen“
   (Klasse 8, Kapitel VII Lineare Gleichungssysteme)
   Aufbau wie das Ziegenproblem: Leitfrage · Herleitung in sechs Schritten
   (Erhaltung, gewichteter Mittelwert, Gleichungssystem, Mischungskreuz mit
   Wippe, Grenzen und Verdünnen, drei Sorten) · fünf Erkläranimationen ·
   Labor (zwei Gefäße und eine Wippe) · Übungen aus vier Generatoren ·
   roter Faden · Kolloquium.
   Logik in gfsMischungen.js (getestet in tests/gfsMischungen.test.mjs).
   Farben: Sorte 1 Blau, Sorte 2 Gold, Mischung/Drehpunkt Smaragd.
   ============================================================ */

const KNOPF = (aktiv = true, farbe = C.see) => ({
  background: aktiv ? farbe : C.hellgrau, color: C.weiss, border: "none", borderRadius: 999, fontSize: 15, fontWeight: 600,
  fontFamily: "inherit", cursor: aktiv ? "pointer" : "default",
});
const LINK = { background: "none", border: "none", color: C.see, fontSize: 13, fontFamily: "inherit", cursor: "pointer", padding: 0, textDecoration: "underline" };
const PILLE = (an) => ({
  padding: "6px 11px", borderRadius: 999, border: `1px solid ${an ? C.flaggold : C.linie}`, background: an ? "#FFF6D6" : C.weiss,
  color: an ? C.tinte : C.grau, fontSize: 12.5, fontWeight: an ? 600 : 400, fontFamily: "inherit", cursor: "pointer",
});
/* aktuelle Aufgabe für automatische Prüfungen (tests/ui/gfsmischungen.ui.py) */
const merk = (a) => { if (typeof window !== "undefined") window.__mischAufgabe = a; return a; };

const T = (props) => <text fontFamily="inherit" {...props} />;
const mix = (a, b, p) => a + (b - a) * p;
const klemm = (x, a, b) => Math.min(b, Math.max(a, x));
/* Farbtiefe einer Lösung: linear im Anteil – so hat die Mischung automatisch die „gemittelte“ Farbe */
const tiefe = (c) => 0.08 + 0.022 * c;
const zahl = (x) => String(Math.round(x * 100) / 100).replace(".", ",");
const DREI_GRENZE = dreiGrenzen(DREI);

/* ======================================================================
   Bildbausteine
   ====================================================================== */

/* Glas mit unten gerundeten Ecken; (x, yb) = links unten, Flüssigkeit füllt fuell Pixel */
function Glas({ id, x, yb, b, h, fuell, c, rand = C.tinte, o = 1, breite = 2 }) {
  if (o <= 0.001) return null;
  const r = Math.min(9, b / 5);
  const innen = `M${x} ${yb - h} V${yb - r} Q${x} ${yb} ${x + r} ${yb} H${x + b - r} Q${x + b} ${yb} ${x + b} ${yb - r} V${yb - h} Z`;
  const offen = `M${x} ${yb - h} V${yb - r} Q${x} ${yb} ${x + r} ${yb} H${x + b - r} Q${x + b} ${yb} ${x + b} ${yb - r} V${yb - h}`;
  return (
    <g opacity={o}>
      <defs><clipPath id={id}><path d={innen} /></clipPath></defs>
      <path d={innen} fill={C.weiss} />
      {fuell > 0.2 && (
        <g clipPath={`url(#${id})`}>
          <rect x={x} y={yb - fuell} width={b} height={fuell + 1} fill={C.see} fillOpacity={tiefe(c)} />
          <rect x={x} y={yb - fuell} width={b} height="1.6" fill={C.see} fillOpacity={Math.min(1, tiefe(c) + 0.25)} />
        </g>
      )}
      <path d={offen} fill="none" stroke={rand} strokeWidth={breite} strokeLinecap="round" strokeLinejoin="round" />
      <line x1={x - 3} y1={yb - h} x2={x + 2} y2={yb - h} stroke={rand} strokeWidth={breite} strokeLinecap="round" />
      <line x1={x + b - 2} y1={yb - h} x2={x + b + 3} y2={yb - h} stroke={rand} strokeWidth={breite} strokeLinecap="round" />
    </g>
  );
}

function Pille({ x, y, text, o = 1, farbe = C.see, voll = false, breite, gross = 13 }) {
  if (o <= 0.001) return null;
  const w = breite || Math.max(44, String(text).length * gross * 0.56 + 22);
  return (
    <g opacity={o}>
      <rect x={x - w / 2} y={y - gross - 4} width={w} height={gross + 13} rx={(gross + 13) / 2} fill={voll ? farbe : C.weiss} stroke={farbe} strokeWidth="1.4" />
      <T x={x} y={y + 1} textAnchor="middle" fontSize={gross} fontWeight="800" fill={voll ? C.weiss : farbe}>{text}</T>
    </g>
  );
}

/* Wippe: Balken auf einem Zahlenstrahl, Gewichte bei c, Drehpunkt bei p, Neigung theta (Grad, + = rechts unten) */
function Wippe({ xVon, py, teile, p, theta, bis = LABOR.cMax, s = 1, glanz = 0, o = 1, beschriften = true }) {
  if (o <= 0.001) return null;
  const xp = xVon(p);
  const x0 = xVon(0) - 8, x1 = xVon(bis) + 8;
  return (
    <g opacity={o}>
      {glanz > 0.001 && <ellipse cx={xp} cy={py + 8} rx="26" ry="20" fill={C.flaggold} opacity={0.35 * glanz} />}
      <g transform={`rotate(${theta} ${xp} ${py})`}>
        <rect x={x0} y={py - 3} width={x1 - x0} height="6" rx="3" fill={C.seeTief} />
        {teile.map((w, i) => {
          const seite = Math.max(6, 2.2 * s * Math.sqrt(w.m));
          return (
            <g key={i}>
              <rect x={xVon(w.c) - seite / 2} y={py - 3 - seite} width={seite} height={seite} rx="3" fill={i === 0 ? C.see : C.flaggold} stroke={i === 0 ? C.seeTief : C.gold} strokeWidth="1" />
              {beschriften && seite >= 26 && <T x={xVon(w.c)} y={py - 3 - seite / 2 + 3.6} textAnchor="middle" fontSize="10" fontWeight="800" fill={i === 0 ? C.weiss : C.tinte}>{w.m} g</T>}
            </g>
          );
        })}
      </g>
      <path d={`M${xp} ${py + 3} L${xp - 15} ${py + 28} L${xp + 15} ${py + 28} Z`} fill={C.smaragd} />
    </g>
  );
}

/* ======================================================================
   Kopfbild (viewBox 160 × 120): 200 g mit 5 % und 100 g mit 20 % ergeben
   300 g mit 10 %. Füllhöhe ∝ Masse, Goldtiefe ∝ Anteil; darunter die Wippe:
   Gewichte 2 : 1 bei 5 und 20, Drehpunkt bei 10 – 2 · 5 = 1 · 10.
   ====================================================================== */
export function MischungenBild() {
  const yb = 66, h = 46, b = 26;
  const glas = (x, fuell, c, gold) => {
    const r = 5;
    const innen = `M${x} ${yb - h} V${yb - r} Q${x} ${yb} ${x + r} ${yb} H${x + b - r} Q${x + b} ${yb} ${x + b} ${yb - r} V${yb - h}`;
    return (
      <g>
        <path d={`${innen} Z`} fill={C.weiss} fillOpacity="0.06" />
        <path d={`M${x} ${yb - fuell} V${yb - r} Q${x} ${yb} ${x + r} ${yb} H${x + b - r} Q${x + b} ${yb} ${x + b} ${yb - r} V${yb - fuell} Z`} fill={C.flaggold} fillOpacity={0.12 + 0.04 * c} />
        <path d={innen} fill="none" stroke={gold ? C.flaggold : C.weiss} strokeOpacity={gold ? 1 : 0.7} strokeWidth="1.3" strokeLinecap="round" />
      </g>
    );
  };
  /* gleiche Fläche je Gramm in allen Gläsern: 200 g = 38 px im schmalen Glas, das doppelt so breite Mischglas
     steigt je Gramm nur halb so hoch (300 g = 28,5 px) */
  const k = 38 / 200;
  const xs = (c) => 30 + c * 5;   // Zahlenstrahl der Wippe: 0 % → 30, 20 % → 130
  return (
    <svg className="gtk-bild" viewBox="0 0 160 120" role="img" style={{ width: "100%", maxWidth: 300, margin: "10px auto 0", justifySelf: "center" }}
      aria-label="200 g mit 5 Prozent und 100 g mit 20 Prozent ergeben 300 g mit 10 Prozent; darunter eine Wippe mit den Gewichten 2 zu 1 bei 5 und 20, im Gleichgewicht bei 10">
      <defs>
        <radialGradient id="gmk-glut" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor={C.flaggold} stopOpacity="0.55" /><stop offset="100%" stopColor={C.flaggold} stopOpacity="0" /></radialGradient>
        <linearGradient id="gmk-boden" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor={C.flaggold} stopOpacity="0" /><stop offset="50%" stopColor={C.flaggold} stopOpacity="0.7" /><stop offset="100%" stopColor={C.flaggold} stopOpacity="0" /></linearGradient>
      </defs>
      <ellipse className="gtk-glimmen" cx="80" cy="46" rx="34" ry="30" fill="url(#gmk-glut)" />
      <g className="gtk-auf">{glas(8, 200 * k, 5, false)}</g>
      <g className="gtk-auf" style={{ animationDelay: ".1s" }}>{glas(126, 100 * k, 20, false)}</g>
      <g className="gtk-auf" style={{ animationDelay: ".3s" }}>
        <path d={`M54 ${yb - h} V${yb - 5} Q54 ${yb} 59 ${yb} H101 Q106 ${yb} 106 ${yb - 5} V${yb - h} Z`} fill={C.weiss} fillOpacity="0.06" />
        <path d={`M54 ${yb - 300 * k / 2} V${yb - 5} Q54 ${yb} 59 ${yb} H101 Q106 ${yb} 106 ${yb - 5} V${yb - 300 * k / 2} Z`} fill={C.flaggold} fillOpacity={0.12 + 0.04 * 10} />
        <path d={`M54 ${yb - h} V${yb - 5} Q54 ${yb} 59 ${yb} H101 Q106 ${yb} 106 ${yb - 5} V${yb - h}`} fill="none" stroke={C.flaggold} strokeWidth="1.5" strokeLinecap="round" />
      </g>
      {/* Zuflüsse */}
      <g className="gtk-auf" style={{ animationDelay: ".45s" }} fill="none" stroke={C.flaggold} strokeWidth="1.2" strokeLinecap="round" strokeDasharray="2.4 2.2">
        <path d="M36 16 Q46 8 58 18" /><path d="M124 16 Q114 8 102 18" />
      </g>
      <g className="gtk-auf" style={{ animationDelay: ".55s" }} fontFamily="Montserrat, sans-serif" fontWeight="800" textAnchor="middle">
        <text x="21" y="76" fontSize="8" fill={C.weiss} fillOpacity="0.8">5 %</text>
        <text x="139" y="76" fontSize="8" fill={C.weiss} fillOpacity="0.8">20 %</text>
        <text x="80" y="76" fontSize="8.5" fill={C.flaggold}>10 %</text>
      </g>
      {/* Wippe im Gleichgewicht */}
      <g className="gtk-auf" style={{ animationDelay: ".7s" }}>
        <rect x="24" y="96" width="112" height="3" rx="1.5" fill={C.weiss} fillOpacity="0.85" />
        <rect x={xs(5) - 7} y="82" width="14" height="14" rx="2" fill={C.weiss} fillOpacity="0.9" />
        <rect x={xs(20) - 5} y="86" width="10" height="10" rx="2" fill={C.flaggold} />
        <path d={`M${xs(10)} 99 L${xs(10) - 7} 110 L${xs(10) + 7} 110 Z`} fill={C.flaggold} />
        <rect x="14" y="110.4" width="132" height="1.2" rx="0.6" fill="url(#gmk-boden)" />
      </g>
    </svg>
  );
}

/* ======================================================================
   Erkläranimationen (Szenen sind reine Funktionen der Zeit; Schlussbild = Standbild)
     gefaesse – zwei Gläser zusammengießen: der Zucker bleibt, Prozente addieren sich nicht
     system   – Gleichung I und II als Geraden, der Schnittpunkt ist die Mischung
     kreuz    – Abstände auf dem Zahlenstrahl, über Kreuz die Teile
     wippe    – Hebelgesetz: Gleichgewicht genau beim Mischwert
     drei     – drei Sorten: unendlich viele Mischungen
   ====================================================================== */

/* 1 · Zwei Gläser */
const G_DAUER = 19;
const gSchritte = () => [
  { von: 0, text: "200 g Zuckerwasser mit 5 % und 100 g mit 20 %. Wie stark ist die Mischung?" },
  { von: 4.5, text: "5 % von 200 g sind 10 g Zucker, 20 % von 100 g sind 20 g. Ein Punkt steht für 2 g." },
  { von: 9, text: "Beim Zusammengießen bleibt alles erhalten: 300 g Lösung mit 30 g Zucker." },
  { von: 14, text: "30 g von 300 g sind 10 %. Prozente addiert man nicht – man zählt den Zucker." },
];
const GX = [20, 112, 262], GB = 76, GYB = 210, GS = 0.5;   // Gläser: x, Breite, Boden, px je g
const G_A = [[38, 128], [72, 142], [52, 166], [80, 186], [34, 196]];
const G_B = [[124, 170], [140, 177], [156, 168], [171, 176], [181, 168], [127, 192], [145, 198], [160, 189], [176, 198], [137, 184]];
const G_C = Array.from({ length: 15 }, (_, i) => {
  const reihe = Math.floor(i / 3), spalte = i % 3;
  return [281 + spalte * 19 + (((reihe * 7 + spalte * 3) % 5) - 2) * 2, 80 + reihe * 27 + (((spalte * 5 + reihe * 3) % 7) - 3) * 1.5];
});
const G_ZIEL_A = [1, 5, 8, 12, 13];
const G_ZIEL_B = G_C.map((_, i) => i).filter((i) => !G_ZIEL_A.includes(i));
function gZeichne(t) {
  const ein = lauf(t, 0.2, 1.2), kopf = lauf(t, 0.6, 1.4);
  const punkte = lauf(t, 4.8, 5.8), menge = lauf(t, 5.6, 6.6);
  const giessen = lauf(t, 9.4, 12.4);
  const fA = 200 * GS * (1 - giessen), fB = 100 * GS * (1 - giessen), fC = 300 * GS * giessen;
  const nachher = lauf(t, 12.2, 13.2), ergebnis = lauf(t, 14.4, 15.4), falle = lauf(t, 15.8, 16.8);
  const quellen = [...G_A.map((p, i) => ({ p, ziel: G_C[G_ZIEL_A[i]] })), ...G_B.map((p, i) => ({ p, ziel: G_C[G_ZIEL_B[i]] }))]
    .sort((u, v) => u.p[1] - v.p[1]);
  const mitte = (i) => GX[i] + GB / 2;
  return (
    <g>
      <Glas id="gm-a1" x={GX[0]} yb={GYB} b={GB} h={150} fuell={fA} c={5} rand={C.see} o={ein} />
      <Glas id="gm-a2" x={GX[1]} yb={GYB} b={GB} h={150} fuell={fB} c={20} rand={C.gold} o={ein} />
      <Glas id="gm-a3" x={GX[2]} yb={GYB} b={GB} h={150} fuell={fC} c={10} rand={C.smaragd} o={ein} />
      <path d="M198 132 H250 M243 125 L251 132 L243 139" fill="none" stroke={C.hellgrau} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity={ein} />
      <g opacity={kopf} fontWeight="800" textAnchor="middle" fontSize="12.5">
        <T x={mitte(0)} y="48" fill={C.see}>200 g · 5 %</T>
        <T x={mitte(1)} y="48" fill={C.gold}>100 g · 20 %</T>
      </g>
      <T x={mitte(2)} y="48" textAnchor="middle" fontSize="12.5" fontWeight="800" fill={C.smaragd} opacity={kopf * (1 - nachher)}>? %</T>
      <T x={mitte(2)} y="48" textAnchor="middle" fontSize="12.5" fontWeight="800" fill={C.smaragd} opacity={nachher}>300 g</T>
      <T x="20" y="20" fontSize="11" fontWeight="700" fill={C.grau} opacity={punkte}>● = 2 g Zucker</T>
      {punkte > 0.001 && quellen.map(({ p, ziel }, k) => {
        const q = lauf(t, 9.6 + k * 0.1, 11.4 + k * 0.1);
        const x = mix(p[0], ziel[0], q), y = mix(p[1], ziel[1], q) - 46 * Math.sin(Math.PI * q);
        return <circle key={k} cx={x} cy={y} r="3.6" fill={C.seeTief} opacity={punkte} />;
      })}
      <g opacity={menge * (1 - giessen)} fontSize="11.5" fontWeight="700" textAnchor="middle">
        <T x={mitte(0)} y="230" fill={C.see}>10 g Zucker</T>
        <T x={mitte(1)} y="230" fill={C.gold}>20 g Zucker</T>
      </g>
      <T x={mitte(2)} y="230" textAnchor="middle" fontSize="11.5" fontWeight="700" fill={C.smaragd} opacity={nachher}>30 g Zucker</T>
      <Pille x={180} y={264} text="30 g : 300 g = 10 %" farbe={C.smaragd} voll o={ergebnis} breite={196} gross={13} />
      <T x="180" y="293" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.signal} opacity={falle}>nicht 5 % + 20 % = 25 % · nicht der Mittelwert 12,5 %</T>
    </g>
  );
}

/* 2 · Gleichungssystem als zwei Geraden */
const Y_DAUER = 23;
const ySchritte = () => [
  { von: 0, text: "Gesucht: x g mit 5 % und y g mit 20 % für 600 g mit 12 %." },
  { von: 4, text: "Gleichung I zählt die Mengen: x + y = 600. Jeder Punkt der blauen Geraden hat die richtige Gesamtmenge." },
  { von: 9, text: "Gleichung II zählt den Zucker: 0,05x + 0,2y = 72, denn 12 % von 600 g sind 72 g." },
  { von: 14, text: "Beides erfüllt nur der Schnittpunkt: x = 320 und y = 280." },
  { von: 18.5, text: "Probe: 320 + 280 = 600 und 16 + 56 = 72. Rechnerisch: Einsetzungs- oder Additionsverfahren." },
];
const YO = [54, 272], YK = 0.42;
const yx = (x) => YO[0] + YK * x, yy = (y) => YO[1] - YK * y;
function yZeichne(t) {
  const achse = lauf(t, 0.2, 1.2);
  const g1 = lauf(t, 4.4, 6.4), g2 = lauf(t, 9.4, 11.4);
  const punkt = lauf(t, 14.4, 15.4), probe = lauf(t, 18.8, 19.8);
  const strich = (x0, y0, x1, y1, p, farbe) => p > 0.001 && (
    <line x1={yx(x0)} y1={yy(y0)} x2={yx(mix(x0, x1, p))} y2={yy(mix(y0, y1, p))} stroke={farbe} strokeWidth="2.6" strokeLinecap="round" />
  );
  return (
    <g>
      <g opacity={achse}>
        <line x1={YO[0]} y1={YO[1]} x2="330" y2={YO[1]} stroke={C.tinte} strokeWidth="1.2" />
        <path d="M324 267 L331 272 L324 277" fill="none" stroke={C.tinte} strokeWidth="1.2" />
        <line x1={YO[0]} y1={YO[1]} x2={YO[0]} y2="8" stroke={C.tinte} strokeWidth="1.2" />
        <path d="M49 14 L54 7 L59 14" fill="none" stroke={C.tinte} strokeWidth="1.2" />
        <T x="336" y="276" fontSize="12" fontWeight="700" fill={C.tinte}>x</T>
        <T x="64" y="14" fontSize="12" fontWeight="700" fill={C.tinte}>y</T>
        {[200, 400, 600].map((v) => (
          <g key={v}>
            <line x1={yx(v)} y1={YO[1]} x2={yx(v)} y2={YO[1] + 4} stroke={C.tinte} strokeWidth="1" />
            <T x={yx(v)} y={YO[1] + 16} textAnchor="middle" fontSize="10" fill={C.grau}>{v}</T>
            <line x1={YO[0] - 4} y1={yy(v)} x2={YO[0]} y2={yy(v)} stroke={C.tinte} strokeWidth="1" />
            <T x={YO[0] - 7} y={yy(v) + 3.5} textAnchor="end" fontSize="10" fill={C.grau}>{v}</T>
          </g>
        ))}
      </g>
      {strich(0, 600, 600, 0, g1, C.see)}
      <T x="118" y="50" fontSize="12.5" fontWeight="800" fill={C.see} opacity={lauf(t, 5.6, 6.4)}>I: x + y = 600</T>
      {strich(0, 360, 640, 200, g2, C.gold)}
      <T x="352" y="146" textAnchor="end" fontSize="12.5" fontWeight="800" fill={C.gold} opacity={lauf(t, 10.6, 11.4)}>II: 0,05x + 0,2y = 72</T>
      {punkt > 0.001 && (
        <g opacity={punkt}>
          <line x1={yx(320)} y1={yy(280)} x2={yx(320)} y2={YO[1]} stroke={C.smaragd} strokeWidth="1.2" strokeDasharray="4 3" />
          <line x1={YO[0]} y1={yy(280)} x2={yx(320)} y2={yy(280)} stroke={C.smaragd} strokeWidth="1.2" strokeDasharray="4 3" />
          <circle cx={yx(320)} cy={yy(280)} r="12" fill={C.flaggold} opacity="0.35" />
          <circle cx={yx(320)} cy={yy(280)} r="5" fill={C.smaragd} stroke={C.weiss} strokeWidth="1.5" />
          <T x={yx(320) - 8} y={yy(280) + 22} textAnchor="end" fontSize="12.5" fontWeight="800" fill={C.smaragd}>S(320 | 280)</T>
          <rect x={yx(320) - 13} y={YO[1] + 5} width="26" height="14" rx="4" fill={C.weiss} />
          <T x={yx(320)} y={YO[1] + 16} textAnchor="middle" fontSize="10.5" fontWeight="800" fill={C.smaragd}>320</T>
          <rect x={YO[0] - 30} y={yy(280) - 8} width="26" height="14" rx="4" fill={C.weiss} />
          <T x={YO[0] - 7} y={yy(280) + 3.5} textAnchor="end" fontSize="10.5" fontWeight="800" fill={C.smaragd}>280</T>
        </g>
      )}
      <T x="180" y="310" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.tinte} opacity={probe}>Probe: 320 + 280 = 600 · 16 g + 56 g = 72 g</T>
    </g>
  );
}

/* 3 · Mischungskreuz */
const K_DAUER = 24;
const kSchritte = () => [
  { von: 0, text: "Ziel: 12 % aus 5 % und 20 %. Auf dem Zahlenstrahl liegt 12 näher an 5 als an 20." },
  { von: 4.5, text: "Die Abstände zum Ziel: 12 − 5 = 7 und 20 − 12 = 8." },
  { von: 9, text: "Über Kreuz: Jede Sorte bekommt so viele Teile, wie die andere vom Ziel entfernt ist – 8 und 7." },
  { von: 14, text: "15 Teile für 600 g: Ein Teil sind 40 g. Also 320 g mit 5 % und 280 g mit 20 %." },
  { von: 19, text: "Warum? Umgestellt sagt die Mischungsgleichung m₁ · 7 = m₂ · 8." },
];
const kx = (c) => 30 + 12 * c;
function kZeichne(t) {
  const strahl = lauf(t, 0.2, 1.2), ziel = lauf(t, 1.4, 2.2), abst = lauf(t, 4.8, 6);
  const l1 = lauf(t, 9.4, 10.6), l2 = lauf(t, 10.4, 11.6);
  const teile = lauf(t, 14.4, 15.4), mengen = lauf(t, 15.6, 16.6), probe = lauf(t, 19.4, 20.4);
  const kreuz = lauf(t, 8.8, 9.6);
  const linie = (x0, y0, x1, y1, p) => p > 0.001 && (
    <line x1={x0} y1={y0} x2={mix(x0, x1, p)} y2={mix(y0, y1, p)} stroke={C.hellgrau} strokeWidth="2" strokeLinecap="round" />
  );
  return (
    <g>
      <g opacity={strahl}>
        <line x1="24" y1="56" x2="338" y2="56" stroke={C.tinte} strokeWidth="1.3" />
        {[0, 5, 10, 15, 20, 25].map((c) => <line key={c} x1={kx(c)} y1="52" x2={kx(c)} y2="60" stroke={C.tinte} strokeWidth="1" />)}
        <T x={kx(0)} y="74" textAnchor="middle" fontSize="10" fill={C.grau}>0</T>
        <T x={kx(25)} y="74" textAnchor="middle" fontSize="10" fill={C.grau}>25</T>
        <circle cx={kx(5)} cy="56" r="6" fill={C.see} />
        <circle cx={kx(20)} cy="56" r="6" fill={C.flaggold} stroke={C.gold} strokeWidth="1" />
        <T x={kx(5)} y="38" textAnchor="middle" fontSize="13" fontWeight="800" fill={C.see}>5 %</T>
        <T x={kx(20)} y="38" textAnchor="middle" fontSize="13" fontWeight="800" fill={C.gold}>20 %</T>
      </g>
      <g opacity={ziel}>
        <circle cx={kx(12)} cy="56" r="6" fill={C.smaragd} />
        <T x={kx(12)} y="38" textAnchor="middle" fontSize="13" fontWeight="800" fill={C.smaragd}>12 %</T>
      </g>
      <g opacity={abst} fontSize="12.5" fontWeight="800" textAnchor="middle">
        <path d={`M${kx(5)} 78 V84 H${kx(12)} V78`} fill="none" stroke={C.gold} strokeWidth="1.4" />
        <path d={`M${kx(12)} 78 V84 H${kx(20)} V78`} fill="none" stroke={C.see} strokeWidth="1.4" />
        <T x={(kx(5) + kx(12)) / 2} y="100" fill={C.gold}>7</T>
        <T x={(kx(12) + kx(20)) / 2} y="100" fill={C.see}>8</T>
      </g>
      {/* das Kreuz */}
      <g opacity={kreuz}>
        <T x="62" y="146" textAnchor="middle" fontSize="15" fontWeight="800" fill={C.see}>5 %</T>
        <T x="62" y="232" textAnchor="middle" fontSize="15" fontWeight="800" fill={C.gold}>20 %</T>
      </g>
      {linie(92, 138, 268, 224, l1)}
      {linie(92, 224, 268, 138, l2)}
      <g opacity={kreuz}>
        <circle cx="180" cy="181" r="25" fill={C.weiss} stroke={C.smaragd} strokeWidth="1.8" />
        <T x="180" y="186" textAnchor="middle" fontSize="13.5" fontWeight="800" fill={C.smaragd}>12 %</T>
      </g>
      <g opacity={lauf(t, 11.2, 12)}>
        <T x="300" y="142" textAnchor="middle" fontSize="14" fontWeight="800" fill={C.see}>8 Teile</T>
        <T x="300" y="158" textAnchor="middle" fontSize="10.5" fontWeight="600" fill={C.grau}>20 − 12</T>
      </g>
      <g opacity={lauf(t, 10.4, 11.2)}>
        <T x="300" y="228" textAnchor="middle" fontSize="14" fontWeight="800" fill={C.gold}>7 Teile</T>
        <T x="300" y="244" textAnchor="middle" fontSize="10.5" fontWeight="600" fill={C.grau}>12 − 5</T>
      </g>
      <T x="180" y="274" textAnchor="middle" fontSize="12.5" fontWeight="700" fill={C.tinte} opacity={teile}>8 + 7 = 15 Teile · 600 g : 15 = 40 g</T>
      <g opacity={mengen} fontSize="12.5" fontWeight="800" textAnchor="middle">
        <T x="100" y="298" fill={C.see}>m₁ = 8 · 40 = 320 g</T>
        <T x="262" y="298" fill={C.gold}>m₂ = 7 · 40 = 280 g</T>
      </g>
      <T x="180" y="324" textAnchor="middle" fontSize="13" fontWeight="800" fill={C.smaragd} opacity={probe}>Probe: 320 · 7 = 2240 = 280 · 8</T>
    </g>
  );
}

/* 4 · Wippe */
const W_DAUER = 25;
const wSchritte = () => [
  { von: 0, text: "Die Mengen als Gewichte auf einem Zahlenstrahl: 320 g bei 5 %, 280 g bei 20 %." },
  { von: 4, text: "Drehpunkt bei 17 %: Die Wippe kippt nach links. Links ist Gewicht mal Abstand größer." },
  { von: 9, text: "Bei 12 % ist sie im Gleichgewicht – genau beim Mischwert: 320 · 7 = 280 · 8." },
  { von: 15, text: "Mehr von der starken Sorte: 480 g bei 20 %. Jetzt kippt die Wippe nach rechts." },
  { von: 19, text: "Neues Gleichgewicht bei 14 %, dem neuen Mischwert: 320 · 9 = 480 · 6." },
];
const wx = (c) => 30 + 12 * c;
function wPos(t) {
  const p = t < 9.4 ? 17 : t < 19.4 ? mix(17, 12, lauf(t, 9.4, 11.4)) : mix(12, 14, lauf(t, 19.4, 21.2));
  const m2 = mix(280, 480, lauf(t, 15.4, 16.6));
  return { p, m2 };
}
function wZeichne(t) {
  const ein = lauf(t, 0.2, 1.2), halt = lauf(t, 4.4, 5.8);
  const { p, m2 } = wPos(t);
  const teile = [{ m: 320, c: 5 }, { m: m2, c: 20 }];
  const { links, rechts } = drehmomente(teile, p);
  const theta = 7 * klemm((rechts - links) / 1500, -1, 1) * halt;
  const glanz = halt * (1 - Math.min(1, Math.abs(rechts - links) / 250));
  const py = 140;
  const zeile = (von, bis, text, farbe) => {
    const o = lauf(t, von, von + 0.8) * (1 - (bis ? lauf(t, bis, bis + 0.6) : 0));
    return <T x="180" y="262" textAnchor="middle" fontSize="13" fontWeight="800" fill={farbe} opacity={o}>{text}</T>;
  };
  return (
    <g>
      <g opacity={ein}>
        <line x1="20" y1={py + 28} x2="340" y2={py + 28} stroke={C.linie} strokeWidth="2" />
        <line x1={wx(0)} y1="200" x2={wx(25)} y2="200" stroke={C.tinte} strokeWidth="1.2" />
        {[0, 5, 10, 15, 20, 25].map((c) => (
          <g key={c}>
            <line x1={wx(c)} y1="196" x2={wx(c)} y2="204" stroke={C.tinte} strokeWidth="1" />
            <T x={wx(c)} y="218" textAnchor="middle" fontSize="10.5" fill={C.grau}>{c} %</T>
          </g>
        ))}
      </g>
      <Wippe xVon={wx} py={py} teile={teile} p={p} theta={theta} bis={25} glanz={glanz} o={ein} />
      <path d={`M${wx(p)} 196 L${wx(p) - 5} 188 L${wx(p) + 5} 188 Z`} fill={C.smaragd} opacity={ein} />
      <T x={klemm(wx(p), 70, 290)} y="238" textAnchor="middle" fontSize="11.5" fontWeight="700" fill={C.smaragd} opacity={ein}>Drehpunkt {zahl(Math.round(p * 2) / 2)} %</T>
      {zeile(4.6, 9.2, "320 · 12 = 3840  >  840 = 280 · 3", C.signal)}
      {zeile(11.4, 15.2, "320 · 7 = 2240 = 280 · 8", C.smaragd)}
      {zeile(16.6, 19.4, "320 · 7 = 2240  <  3840 = 480 · 8", C.signal)}
      {zeile(21.2, null, "320 · 9 = 2880 = 480 · 6", C.smaragd)}
    </g>
  );
}

/* 5 · Drei Sorten */
const D_DAUER = 24;
const dSchritte = () => [
  { von: 0, text: "Nüsse zu 8 €, 12 € und 20 € je kg sollen 10 kg zu 14 € je kg ergeben." },
  { von: 4.5, text: "Drei Unbekannte, aber nur zwei Gleichungen: eine für die Menge, eine für den Preis." },
  { von: 9, text: "Wähle z frei. Aus II − 8 · I folgt y = 15 − 3z, aus I dann x = 2z − 5." },
  { von: 14, text: "Jedes z von 2,5 kg bis 5 kg ergibt eine Mischung zu genau 14 € je kg." },
  { von: 19.5, text: "Unendlich viele Lösungen. Erst eine dritte Bedingung wie x = y legt sie fest: z = 4." },
];
function dZ(t) {
  if (t < 14.4) return 3;
  if (t < 15.4) return mix(3, 2.5, lauf(t, 14.4, 15.2));
  if (t < 19.8) return mix(2.5, 5, lauf(t, 15.4, 18.6));
  return mix(5, 4, lauf(t, 19.8, 20.8));
}
function dZeichne(t) {
  const kopf = lauf(t, 0.2, 1.2), gl = lauf(t, 4.8, 5.8), frei = lauf(t, 9.4, 10.4), balken = lauf(t, 10.6, 11.6);
  const strahl = lauf(t, 14.2, 15), schluss = lauf(t, 20.4, 21.4);
  const zc = dZ(t);
  const x = 2 * zc - 5, y = 15 - 3 * zc;
  const zs = Math.round(zc * 2) / 2, s = dreiSorten(zs), w = (v) => dezimal(v);
  const B0 = 30, BK = 30, BY = 186;
  const seg = [[x, C.see, C.weiss, "x"], [y, C.flaggold, C.tinte, "y"], [zc, C.smaragd, C.weiss, "z"]];
  let lauf0 = B0;
  const zx = (z) => 40 + 28 * z;
  return (
    <g>
      <g opacity={kopf}>
        <Pille x={66} y={30} text="x kg zu 8 €" farbe={C.see} breite={104} gross={12} />
        <Pille x={180} y={30} text="y kg zu 12 €" farbe={C.gold} breite={110} gross={12} />
        <Pille x={296} y={30} text="z kg zu 20 €" farbe={C.smaragd} breite={110} gross={12} />
        <T x="180" y="62" textAnchor="middle" fontSize="12" fontWeight="600" fill={C.grau}>Ziel: 10 kg zu 14 € je kg, also 140 €</T>
      </g>
      <g opacity={gl} fontSize="13" fontWeight="800" textAnchor="middle" fill={C.tinte}>
        <T x="180" y="90">I: x + y + z = 10</T>
        <T x="180" y="112">II: 8x + 12y + 20z = 140</T>
      </g>
      <g opacity={frei} fontSize="12.5" fontWeight="700" textAnchor="middle">
        <T x="180" y="138" fill={C.grau}>II − 8 · I: 4y + 12z = 60</T>
        <T x="180" y="160" fill={C.smaragd}>y = 15 − 3z, x = 2z − 5</T>
      </g>
      {balken > 0.001 && (
        <g opacity={balken}>
          {seg.map(([v, farbe, schrift, n]) => {
            const b = Math.max(0, v) * BK, x0 = lauf0;
            lauf0 += b;
            return (
              <g key={n}>
                {b > 0.3 && <rect x={x0} y={BY} width={b} height="28" fill={farbe} />}
                {b >= 22 && <T x={x0 + b / 2} y={BY + 18.5} textAnchor="middle" fontSize="12" fontWeight="800" fill={schrift}>{n}</T>}
              </g>
            );
          })}
          <rect x={B0} y={BY} width={10 * BK} height="28" rx="3" fill="none" stroke={C.tinte} strokeWidth="1.2" />
          <T x="180" y="236" textAnchor="middle" fontSize="12.5" fontWeight="800" fill={C.tinte}>x = {w(s.x)} kg · y = {w(s.y)} kg · z = {w(s.z)} kg</T>
          <T x="180" y="256" textAnchor="middle" fontSize="11.5" fontWeight="600" fill={C.grau}>8 · {w(s.x)} + 12 · {w(s.y)} + 20 · {w(s.z)} = 140 €</T>
        </g>
      )}
      <g opacity={strahl}>
        <line x1={zx(0)} y1="282" x2={zx(10)} y2="282" stroke={C.linie} strokeWidth="3" strokeLinecap="round" />
        <line x1={zx(2.5)} y1="282" x2={zx(5)} y2="282" stroke={C.smaragd} strokeWidth="5" strokeLinecap="round" />
        <T x={zx(0) - 12} y="286" textAnchor="end" fontSize="11" fontWeight="700" fill={C.grau}>z</T>
        <T x={zx(0)} y="300" textAnchor="middle" fontSize="10" fill={C.grau}>0</T>
        <T x={zx(2.5)} y="300" textAnchor="middle" fontSize="10" fontWeight="700" fill={C.smaragd}>2,5</T>
        <T x={zx(5)} y="300" textAnchor="middle" fontSize="10" fontWeight="700" fill={C.smaragd}>5</T>
        <T x={zx(10)} y="300" textAnchor="middle" fontSize="10" fill={C.grau}>10</T>
        <circle cx={zx(zc)} cy="282" r="5.5" fill={C.weiss} stroke={C.smaragd} strokeWidth="2" />
      </g>
      <T x={zx(7.6)} y="276" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={C.gold} opacity={schluss}>x = y: z = 4</T>
    </g>
  );
}

const MISCH_ANIM = {
  gefaesse: { titel: () => "Zwei Gläser, eine Mischung", unter: () => "Was erhalten bleibt – und warum 5 % + 20 % nicht 25 % sind",
    szene: () => ({ dauer: G_DAUER, hoehe: 300, schritte: gSchritte(), zeichne: gZeichne,
      beschreibung: "Animation: 200 g Zuckerwasser mit 5 % (10 g Zucker) und 100 g mit 20 % (20 g Zucker) werden zusammengegossen. Die Mischung wiegt 300 g und enthält 30 g Zucker, also 10 %." }) },
  system: { titel: () => "Zwei Gleichungen, zwei Geraden", unter: () => "Die Mischung ist der Schnittpunkt",
    szene: () => ({ dauer: Y_DAUER, hoehe: 318, schritte: ySchritte(), zeichne: yZeichne,
      beschreibung: "Animation: Koordinatensystem mit der Geraden x + y = 600 und der Geraden 0,05x + 0,2y = 72. Sie schneiden sich im Punkt S(320 | 280): 320 g mit 5 % und 280 g mit 20 %." }) },
  kreuz: { titel: () => "Das Mischungskreuz", unter: () => "Die Abstände zum Ziel, über Kreuz gelesen, sind die Teile",
    szene: () => ({ dauer: K_DAUER, hoehe: 332, schritte: kSchritte(), zeichne: kZeichne,
      beschreibung: "Animation: Auf dem Zahlenstrahl liegen 5 %, 12 % und 20 %. Die Abstände 7 und 8 werden über Kreuz zu den Teilen 8 für 5 % und 7 für 20 %. 600 g auf 15 Teile ergeben 320 g und 280 g." }) },
  wippe: { titel: () => "Die Wippe: Gleichgewicht beim Mischwert", unter: () => "Hebelgesetz und Mischungsgleichung sind dieselbe Gleichung",
    szene: () => ({ dauer: W_DAUER, hoehe: 272, schritte: wSchritte(), zeichne: wZeichne,
      beschreibung: "Animation: Eine Wippe trägt 320 g bei 5 und 280 g bei 20. Bei 17 kippt sie nach links, bei 12 ist sie im Gleichgewicht. Mit 480 g bei 20 liegt das Gleichgewicht bei 14." }) },
  drei: { titel: () => "Drei Sorten: unendlich viele Mischungen", unter: () => "Zwei Gleichungen reichen nicht für drei Unbekannte",
    szene: () => ({ dauer: D_DAUER, hoehe: 308, schritte: dSchritte(), zeichne: dZeichne,
      beschreibung: "Animation: Nüsse zu 8, 12 und 20 Euro je kg ergeben 10 kg zu 14 Euro je kg. Mit y = 15 − 3z und x = 2z − 5 passt jedes z zwischen 2,5 und 5 kg; mit x = y ist z = 4." }) },
};

export function MischAnimation({ art, offen = false }) {
  return <AnimKarte szenen={MISCH_ANIM} art={art} offen={offen} merkmal="data-misch-anim" />;
}

/* ======================================================================
   Statisches Bild: das Mischungskreuz allgemein und am Beispiel
   ====================================================================== */
function KreuzBild() {
  return (
    <svg viewBox="0 0 360 214" style={{ width: "100%", maxWidth: 460, display: "block", margin: "6px auto 14px" }} role="img" data-kreuz-bild=""
      aria-label="Mischungskreuz: links 5 Prozent und 20 Prozent, in der Mitte 12 Prozent. Über Kreuz: 20 minus 12 gleich 8 Teile für 5 Prozent, 12 minus 5 gleich 7 Teile für 20 Prozent.">
      <T x="62" y="24" textAnchor="middle" fontSize="10" fontWeight="700" fill={C.hellgrau} letterSpacing="0.06em">SORTEN</T>
      <T x="298" y="24" textAnchor="middle" fontSize="10" fontWeight="700" fill={C.hellgrau} letterSpacing="0.06em">TEILE</T>
      <line x1="94" y1="52" x2="266" y2="164" stroke={C.hellgrau} strokeWidth="2" />
      <line x1="94" y1="164" x2="266" y2="52" stroke={C.hellgrau} strokeWidth="2" />
      <path d="M257 152 L267 165 L251 162" fill="none" stroke={C.hellgrau} strokeWidth="2" strokeLinejoin="round" />
      <path d="M251 54 L267 51 L257 64" fill="none" stroke={C.hellgrau} strokeWidth="2" strokeLinejoin="round" />
      <T x="62" y="56" textAnchor="middle" fontSize="16" fontWeight="800" fill={C.see}>5 %</T>
      <T x="62" y="74" textAnchor="middle" fontSize="11" fontWeight="600" fill={C.grau}>c₁</T>
      <T x="62" y="170" textAnchor="middle" fontSize="16" fontWeight="800" fill={C.gold}>20 %</T>
      <T x="62" y="188" textAnchor="middle" fontSize="11" fontWeight="600" fill={C.grau}>c₂</T>
      <circle cx="180" cy="108" r="27" fill={C.weiss} stroke={C.smaragd} strokeWidth="1.8" />
      <T x="180" y="108" textAnchor="middle" fontSize="14" fontWeight="800" fill={C.smaragd}>12 %</T>
      <T x="180" y="123" textAnchor="middle" fontSize="10.5" fontWeight="600" fill={C.grau}>c</T>
      <T x="298" y="56" textAnchor="middle" fontSize="15" fontWeight="800" fill={C.see}>8</T>
      <T x="298" y="74" textAnchor="middle" fontSize="11" fontWeight="600" fill={C.grau}>c₂ − c = 20 − 12</T>
      <T x="298" y="170" textAnchor="middle" fontSize="15" fontWeight="800" fill={C.gold}>7</T>
      <T x="298" y="188" textAnchor="middle" fontSize="11" fontWeight="600" fill={C.grau}>c − c₁ = 12 − 5</T>
      <T x="180" y="208" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.tinte}>m₁ : m₂ = 8 : 7</T>
    </svg>
  );
}

/* ======================================================================
   Labor: zwei Gefäße und eine Wippe
   ====================================================================== */
function Stepper({ name, label, wert, einheit, setzen, schritt, min, max }) {
  const knopf = (zeichen, d) => {
    const aus = d < 0 ? wert <= min : wert >= max;
    return (
      <button type="button" onClick={() => setzen(klemm(wert + d * schritt, min, max))} disabled={aus} aria-label={`${label} ${d > 0 ? "erhöhen" : "verringern"}`}
        data-stepper={`${name}${d > 0 ? "+" : "-"}`}
        style={{ width: 30, height: 30, borderRadius: 10, border: "none", background: aus ? C.linie : d > 0 ? C.see : C.seeTief, color: C.weiss,
          fontSize: 18, fontWeight: 700, fontFamily: "inherit", cursor: aus ? "default" : "pointer", padding: 0, lineHeight: 1, flexShrink: 0 }}>{zeichen}</button>
    );
  };
  return (
    <div style={{ minWidth: 0 }}>
      <p style={{ fontSize: 11.5, fontWeight: 600, color: C.grau, marginBottom: 4 }}>{label}</p>
      <div className="flex items-center" style={{ gap: 4 }}>
        {knopf("−", -1)}
        <span data-wert={name} style={{ minWidth: 54, textAlign: "center", fontSize: 15, fontWeight: 800, color: C.tinte, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{wert} {einheit}</span>
        {knopf("+", 1)}
      </div>
    </div>
  );
}

function Gefaess({ nr, m, c, setM, setC, farbe }) {
  return (
    <div style={{ flex: "1 1 250px", minWidth: 0, border: `1.5px solid ${farbe}`, borderRadius: 14, padding: "10px 10px 12px", background: C.sand }} data-gefaess={nr}>
      <p style={{ fontSize: 13, fontWeight: 700, color: farbe === C.flaggold ? C.gold : farbe, marginBottom: 8 }}>Gefäß {nr}</p>
      <div className="flex flex-wrap" style={{ gap: "10px 12px" }}>
        <Stepper name={`m${nr}`} label={`Menge m${nr === 1 ? "₁" : "₂"}`} wert={m} einheit="g" setzen={setM} schritt={LABOR.mSchritt} min={LABOR.mMin} max={LABOR.mMax} />
        <Stepper name={`c${nr}`} label={`Anteil c${nr === 1 ? "₁" : "₂"}`} wert={c} einheit="%" setzen={setC} schritt={LABOR.cSchritt} min={LABOR.cMin} max={LABOR.cMax} />
      </div>
    </div>
  );
}

const LX = (c) => 24 + 7.8 * c;    // Zahlenstrahl der Wippe im Labor: 0 … 40 %
function LaborBild({ m1, c1, m2, c2, r, suchen, p }) {
  /* gleiche Fläche je Gramm in allen Gläsern: kleine Gläser 64 px breit, Mischglas 128 px breit, 600 g = 112 px */
  const K = 112 / 600;
  const PY = 236;
  const teile = [{ m: m1, c: c1 }, { m: m2, c: c2 }];
  const cw = r.ca.text;
  const punkt = suchen ? p : Number(r.c.z / r.c.n);
  const { links, rechts } = drehmomente(teile, punkt);
  const theta = suchen ? 8 * klemm((rechts - links) / Math.max(400, 4 * (m1 + m2)), -1, 1) : 0;
  const gleich = !suchen || Math.abs(punkt - r.c.z / r.c.n) < 0.25 + 1e-9;
  return (
    <svg viewBox="0 0 360 312" style={{ width: "100%", maxWidth: 520, display: "block", margin: "4px auto 0" }} role="img" data-labor-bild=""
      aria-label={`Gefäß 1: ${m1} g mit ${c1} Prozent, Gefäß 2: ${m2} g mit ${c2} Prozent, Mischung: ${m1 + m2} g mit ${cw} Prozent. Darunter eine Wippe mit den Gewichten an den Stellen ${c1} und ${c2}.`}>
      <Glas id="gm-l1" x={16} yb={152} b={64} h={116} fuell={m1 * K} c={c1} rand={C.see} />
      <Glas id="gm-l2" x={96} yb={152} b={64} h={116} fuell={m2 * K} c={c2} rand={C.gold} />
      <Glas id="gm-l3" x={216} yb={152} b={128} h={116} fuell={(m1 + m2) * K / 2} c={r.c.z / r.c.n} rand={C.smaragd} />
      <path d="M170 96 H204 M197 89 L205 96 L197 103" fill="none" stroke={C.hellgrau} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <T x="48" y="26" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={C.see}>{m1} g · {c1} %</T>
      <T x="128" y="26" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={C.gold}>{m2} g · {c2} %</T>
      <T x="280" y="26" textAnchor="middle" fontSize="12" fontWeight="800" fill={C.smaragd} data-labor-c={cw}>{m1 + m2} g · {r.ca.exakt ? "" : "≈ "}{cw} %</T>
      <T x="48" y="170" textAnchor="middle" fontSize="10.5" fontWeight="600" fill={C.grau}>{zahl(r.s1.z / r.s1.n)} g Stoff</T>
      <T x="128" y="170" textAnchor="middle" fontSize="10.5" fontWeight="600" fill={C.grau}>{zahl(r.s2.z / r.s2.n)} g Stoff</T>
      <T x="280" y="170" textAnchor="middle" fontSize="10.5" fontWeight="600" fill={C.grau}>{zahl(r.S.z / r.S.n)} g Stoff</T>
      {/* Wippe */}
      <line x1="14" y1={PY + 28} x2="346" y2={PY + 28} stroke={C.linie} strokeWidth="2" />
      <line x1={LX(0)} y1="282" x2={LX(40)} y2="282" stroke={C.tinte} strokeWidth="1.1" />
      {[0, 10, 20, 30, 40].map((c) => (
        <g key={c}>
          <line x1={LX(c)} y1="278" x2={LX(c)} y2="286" stroke={C.tinte} strokeWidth="1" />
          <T x={LX(c)} y="300" textAnchor="middle" fontSize="10" fill={C.grau}>{c} %</T>
        </g>
      ))}
      <Wippe xVon={LX} py={PY} teile={teile} p={punkt} theta={theta} s={0.75} glanz={gleich ? 1 : 0} beschriften={false} />
      <path d={`M${LX(punkt)} 278 L${LX(punkt) - 5} 270 L${LX(punkt) + 5} 270 Z`} fill={C.smaragd} />
      <T x={klemm(LX(punkt), 40, 320)} y="198" textAnchor="middle" fontSize="11" fontWeight="800" fill={gleich ? C.smaragd : C.signal}>
        {suchen ? `Drehpunkt ${zahl(punkt)} %` : `Gleichgewicht bei ${r.ca.exakt ? "" : "≈ "}${cw} %`}
      </T>
    </svg>
  );
}

function MischLabor() {
  const [m1, setM1] = useState(LABOR_VORLAGEN[0].m1);
  const [c1, setC1] = useState(LABOR_VORLAGEN[0].c1);
  const [m2, setM2] = useState(LABOR_VORLAGEN[0].m2);
  const [c2, setC2] = useState(LABOR_VORLAGEN[0].c2);
  const [suchen, setSuchen] = useState(false);
  const [p, setP] = useState(20);
  const r = labor(m1, c1, m2, c2);
  const cWert = r.c.z / r.c.n;
  const gleich = Math.abs(p - cWert) < 0.25 + 1e-9;
  const { links, rechts } = drehmomente([{ m: m1, c: c1 }, { m: m2, c: c2 }], p);
  const gesetzt = LABOR_VORLAGEN.find((v) => v.m1 === m1 && v.c1 === c1 && v.m2 === m2 && v.c2 === c2);
  const hinweis = !suchen ? null
    : gleich ? `Gleichgewicht! Der Drehpunkt steht beim Mischwert ${r.ca.exakt ? "" : "≈ "}${r.ca.text} %.`
      : `Die Wippe kippt nach ${rechts > links ? "rechts" : "links"} – schieb den Drehpunkt nach ${rechts > links ? "rechts" : "links"}.`;
  return (
    <div data-misch-labor="" data-labor-gleich={suchen && gleich ? "1" : "0"}>
      <div className="flex flex-wrap items-center" style={{ gap: 6, marginBottom: 12 }}>
        {LABOR_VORLAGEN.map((v) => {
          const an = gesetzt && gesetzt.id === v.id;
          return (
            <button key={v.id} type="button" onClick={() => { setM1(v.m1); setC1(v.c1); setM2(v.m2); setC2(v.c2); }} aria-pressed={!!an} style={PILLE(an)}>{v.name}</button>
          );
        })}
      </div>
      <div className="flex flex-wrap" style={{ gap: 10, marginBottom: 12 }}>
        <Gefaess nr={1} m={m1} c={c1} setM={setM1} setC={setC1} farbe={C.see} />
        <Gefaess nr={2} m={m2} c={c2} setM={setM2} setC={setC2} farbe={C.flaggold} />
      </div>
      <LaborBild m1={m1} c1={c1} m2={m2} c2={c2} r={r} suchen={suchen} p={p} />
      <div className="flex flex-wrap items-center" style={{ gap: 10, margin: "10px 0 4px" }}>
        <button type="button" onClick={() => { setSuchen((s) => !s); setP(c1 === c2 ? Math.min(40, c1 + 6) : Math.max(c1, c2)); }} aria-pressed={suchen} style={PILLE(suchen)}>
          {suchen ? "Drehpunkt zeigen" : "Drehpunkt selbst suchen"}
        </button>
        {suchen && <span style={{ fontSize: 12.5, color: C.grau }}>Schieb den Drehpunkt, bis die Wippe waagrecht ist.</span>}
      </div>
      {suchen && (
        <>
          <input type="range" min={0} max={40} step={0.5} value={p} onChange={(e) => setP(parseFloat(e.target.value))} aria-label="Drehpunkt"
            style={{ width: "100%", accentColor: C.smaragd, margin: "6px 0 2px", cursor: "pointer" }} />
          <p aria-live="polite" data-labor-hinweis="" style={{ fontSize: 14, color: gleich ? C.smaragd : C.tinte, fontWeight: gleich ? 700 : 400, lineHeight: 1.6, margin: "4px 0 6px" }}>{hinweis}</p>
        </>
      )}
      <Formeln zeilen={r.zeilen} max={15} />
      <p style={{ fontSize: 12.5, color: C.grau, fontWeight: 300, lineHeight: 1.6 }}>
        Die Farbe wird mit dem Anteil kräftiger – die Mischung hat immer eine Farbe zwischen den beiden Gefäßen. Auf der Wippe sind die
        Kästchen die Mengen; Gewicht mal Abstand zum Drehpunkt ist im Gleichgewicht links und rechts gleich.
      </p>
    </div>
  );
}

/* ======================================================================
   Übungen
   ====================================================================== */
function Stufen({ stufe, setzen }) {
  return (
    <div className="flex items-center flex-wrap" style={{ gap: 10, marginBottom: 16 }}>
      <span style={{ fontSize: 13.5, color: C.grau, fontWeight: 300 }}>Schwierigkeit</span>
      <PlusMinus setzen={(d) => setzen(stufe + d)} label="Schwierigkeit" />
      <div className="flex" style={{ gap: 4 }}>
        {[1, 2, 3, 4, 5].map((s) => <span key={s} style={{ width: 9, height: 9, borderRadius: 999, background: s <= stufe ? C.see : C.linie, display: "inline-block" }} />)}
      </div>
      <span style={{ fontSize: 13.5, color: C.gruenDunkel, fontWeight: 600 }}>{stufe} / 5</span>
    </div>
  );
}

function Eingabe({ f, wert, setzen, stand, onEnter, breite = 84, klein = false }) {
  return (
    <MatheFeld modus="bruch" value={wert} onChange={(e) => setzen(f.k, e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") onEnter(); }}
      aria-label={f.aria} data-feld={f.k} placeholder="?"
      style={{ ...ZELLE(stand), width: breite, ...(klein ? { fontSize: 15, padding: "7px 3px" } : {}) }} />
  );
}

function Feld({ f, wert, setzen, stand, onEnter }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 16, fontWeight: 500, color: C.tinte }}>
      <span><M t={`${f.tex} =`} /></span>
      <Eingabe f={f} wert={wert} setzen={setzen} stand={stand} onEnter={onEnter} />
      {f.einheit && <span style={{ fontSize: 13.5, color: C.grau }}>{f.einheit}</span>}
    </label>
  );
}

/* Gleichungssystem: I x + y = [S], II [A]x + [B]y = [W], darunter x und y */
function SystemFelder({ a, ein, setze, erg, onEnter }) {
  const f = (k) => a.felder.find((x) => x.k === k);
  const st = (k) => (erg ? erg.felder[k] : null);
  const feld = (k, breite = 54) => <Eingabe f={f(k)} wert={ein[k] ?? ""} setzen={setze} stand={st(k)} onEnter={onEnter} breite={breite} klein />;
  const zeile = { display: "flex", alignItems: "center", gap: 4, fontSize: 16, color: C.tinte, minWidth: 0 };
  const nr = { fontSize: 14, fontWeight: 800, color: C.grau };
  return (
    <div data-system-felder="" style={{ marginBottom: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "24px minmax(0, 1fr)", rowGap: 10, alignItems: "center", marginBottom: 12 }}>
        <span style={nr}>I</span>
        <div style={zeile}><M t="x + y =" />{feld("S", 70)}</div>
        <span style={nr}>II</span>
        <div style={zeile}>{feld("A")}<M t="x +" />{feld("B")}<M t="y =" />{feld("W", 62)}</div>
      </div>
      <div className="flex flex-wrap" style={{ gap: 14 }}>
        <Feld f={f("x")} wert={ein.x ?? ""} setzen={setze} stand={st("x")} onEnter={onEnter} />
        <Feld f={f("y")} wert={ein.y ?? ""} setzen={setze} stand={st("y")} onEnter={onEnter} />
      </div>
    </div>
  );
}

function MischTrainer() {
  const [art, setArt] = useState("mischwert");
  const [stufe, setStufe] = useState(1);
  const [auf, setAufRoh] = useState(() => merk(aufgabe("mischwert", 1)));
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
  const leer = fs.some(({ k }) => !String(ein[k] ?? "").trim());
  const pruefen = () => {
    if (leer) return;
    const e = pruefe(auf, ein);
    setErg(e);
    setSerie((x) => ({ n: x.n + 1, ok: x.ok + (e.ok ? 1 : 0) }));
  };
  const loesungZeigen = <Formeln zeilen={rechenweg(auf)} max={15} farbe={C.see} />;
  return (
    <div>
      <p style={{ ...FLIESS, lineHeight: 1.7, marginBottom: 18 }}>
        Vier Aufgabentypen: den Wert einer Mischung berechnen, Mengen für eine Zielmischung finden, verdünnen und aufkonzentrieren und
        ein Gleichungssystem zu einer Textaufgabe aufstellen. Zahlen darfst du ganz, als Dezimalzahl (12,5) oder als Bruch (25/2) eingeben.
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        {ARTEN.map((a) => <Chip key={a.id} aktiv={art === a.id} onClick={() => artSetzen(a.id)}>{a.name}</Chip>)}
      </div>
      <Stufen stufe={stufe} setzen={stufeSetzen} />
      <div style={KARTE} data-mm-karte="" data-mischtrainer="" data-art={auf.art}>
        <p style={{ fontSize: 15, color: C.tinte, fontWeight: 400, lineHeight: 1.7, marginBottom: 10 }}>{auftrag(auf)}</p>
        {auf.legende && (
          <p style={{ fontSize: 12.5, color: C.grau, fontWeight: 400, lineHeight: 1.6, marginBottom: 10 }}>{auf.legende.join(" · ")}</p>
        )}
        {auf.art === "lgs"
          ? <SystemFelder a={auf} ein={ein} setze={setze} erg={erg} onEnter={pruefen} />
          : (
            <div className="flex flex-wrap" style={{ gap: 14, marginBottom: 12 }}>
              {fs.map((f) => <Feld key={f.k} f={f} wert={ein[f.k] ?? ""} setzen={setze} stand={erg ? erg.felder[f.k] : null} onEnter={pruefen} />)}
            </div>
          )}
        {erg && erg.ok && (
          <div style={{ borderLeft: `4px solid ${C.see}`, paddingLeft: 16, marginBottom: 14 }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: C.see, marginBottom: 2 }}>Stimmt!</p>
            {loesungZeigen}
          </div>
        )}
        {erg && !erg.ok && (
          <div style={{ borderLeft: `4px solid ${C.signal}`, paddingLeft: 16, marginBottom: 14 }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: C.signal, marginBottom: 6 }}>Stimmt noch nicht.</p>
            <p data-misch-grund="" style={{ fontSize: 14, color: C.tinte, fontWeight: 300, lineHeight: 1.75 }}>{erg.grund || tipp(auf)}</p>
            <p style={{ fontSize: 13, color: C.grau, fontWeight: 300, lineHeight: 1.65, marginTop: 6 }}>Tipp: {tipp(auf)}</p>
            {!zeigen && <button onClick={() => setZeigen(true)} className="mt-3" style={LINK}>Rechenweg zeigen</button>}
            {zeigen && loesungZeigen}
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
const LISTE = { margin: "8px 0 10px", paddingLeft: 18, listStyle: "disc" };
const PUNKT = { fontSize: 14, color: C.tinte, fontWeight: 300, lineHeight: 1.7, marginBottom: 6 };
const KERN = { fontSize: 15, color: C.tinte, fontWeight: 500, lineHeight: 1.8, margin: "8px 0 10px" };

export function GfsMischungenSeite({ gehe }) {
  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 22 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 14 }}>
        Wie viel nimmt man von jeder Sorte – und warum funktioniert das Mischungskreuz?
      </h2>
      <Text s="Ein Glas Zuckerwasser mit 5 % und eines mit 20 % – was kommt heraus, wenn man beide zusammengießt? Und umgekehrt: Wie viel
        muss man von jeder Sorte nehmen, damit genau 12 % herauskommen? Solche Fragen stellen sich in der Küche, im Labor, beim
        Kaffeehändler und beim Goldschmied." style={FLIESS} />
      <Text s="Hinter allen steckt dieselbe Gleichung. Wir leiten sie in sechs Schritten her, lösen damit Aufgaben mit zwei Unbekannten
        und zeigen, warum das Mischungskreuz funktioniert – mit einer Wippe als Beweis zum Anfassen." style={FLIESS} />

      <MischAnimation art="gefaesse" offen />

      <Schritt nr="1" titel="Was beim Mischen erhalten bleibt" />
      <Text s="Prozent ist ein Anteil, kein Vorrat: 5 % Zucker heißt, in 100 g Lösung stecken 5 g Zucker. Beim Zusammengießen geht nichts
        verloren und nichts kommt dazu. Erhalten bleiben die Masse der Lösung und die Masse des Zuckers – die Prozentsätze dagegen
        addieren sich nicht." style={FLIESS} />
      <Formeln zeilen={[
        "\\text{Lösung 1: } 200 \\text{ g} \\cdot 5 % = 10 \\text{ g Zucker}",
        "\\text{Lösung 2: } 100 \\text{ g} \\cdot 20 % = 20 \\text{ g Zucker}",
        "\\text{Mischung: } 300 \\text{ g mit } 30 \\text{ g Zucker}",
        "c = \\frac{30}{300} = 0,1 = 10 %",
      ]} max={17} />
      <Kasten titel="Die Mischungsgleichung">
        <Text s={"Mischt man $m_1$ Gramm mit dem Anteil $c_1$ und $m_2$ Gramm mit dem Anteil $c_2$, dann gilt für den Anteil $c$ der Mischung:"}
          style={{ ...PUNKT, margin: "8px 0 0" }} />
        <Formeln zeilen={["m_1 \\cdot c_1 + m_2 \\cdot c_2 = (m_1 + m_2) \\cdot c"]} max={18} />
        <Text s={"Links steht der Stoff aus beiden Sorten, rechts der Stoff in der Mischung. Dieselbe Gleichung gilt für Preise: Dann ist $c$ der Preis je kg und $m \\cdot c$ der Preis einer Sorte."}
          style={{ ...PUNKT, marginBottom: 10 }} />
      </Kasten>

      <Schritt nr="2" titel="Mischen heißt: gewichtet mitteln" />
      <Text s="Teilt man die Mischungsgleichung durch die Gesamtmenge, sieht man, was beim Mischen passiert: Jede Sorte geht mit ihrem
        Mengenanteil in den Mittelwert ein. Im Beispiel sind 200 g von 300 g genau zwei Drittel." style={FLIESS} />
      <Formeln zeilen={[
        "c = \\frac{m_1}{m_1 + m_2} \\cdot c_1 + \\frac{m_2}{m_1 + m_2} \\cdot c_2",
        "c = \\frac{2}{3} \\cdot 5 + \\frac{1}{3} \\cdot 20 = \\frac{10}{3} + \\frac{20}{3} = 10",
      ]} max={17} />
      <Text s={"Die beiden Anteile sind positiv und ergeben zusammen 1. Nur bei gleichen Mengen sind beide $\\frac{1}{2}$ – dann ist der Mischwert der gewöhnliche Mittelwert. Sonst zieht die größere Menge den Mischwert zu sich: Hier liegt er mit 10 % näher an 5 % als an 20 %."}
        style={FLIESS} />
      <Kasten titel="Die Mischung liegt immer zwischen den Sorten">
        <Text s={"Ist $c_1 < c_2$, dann gilt $c_1 < c < c_2$. Setzt man $c$ aus der Formel oben ein und fasst über dem gemeinsamen Nenner zusammen, erhält man:"}
          style={{ ...PUNKT, margin: "8px 0 0" }} />
        <Formeln zeilen={[
          "c − c_1 = \\frac{m_2}{m_1 + m_2} \\cdot (c_2 − c_1) > 0",
          "c_2 − c = \\frac{m_1}{m_1 + m_2} \\cdot (c_2 − c_1) > 0",
        ]} max={17} />
        <Text s="Diese beiden Zeilen sind schon fast das Mischungskreuz – dazu mehr in Schritt 4." style={{ ...PUNKT, marginBottom: 10 }} />
      </Kasten>

      <Schritt nr="3" titel="Zwei Unbekannte: das Gleichungssystem" />
      <Text s={"Jetzt umgekehrt: Du brauchst 600 g Zuckerwasser mit 12 % und hast nur Lösungen mit 5 % und 20 %. Gesucht sind zwei Mengen, also zwei Variablen: $x$ Gramm von der 5-%-Lösung und $y$ Gramm von der 20-%-Lösung. Dafür brauchst du zwei Gleichungen – und die Aufgabe liefert genau zwei Bedingungen."}
        style={FLIESS} />
      <Formeln titel="I zählt die Mengen, II zählt den Zucker" zeilen={[
        "\\text{I: } x + y = 600",
        "\\text{II: } 0,05x + 0,2y = 72 \\quad (12 % \\text{ von } 600 \\text{ g})",
      ]} max={17} />
      <Text s={"Einsetzungsverfahren: Gleichung I nach $x$ auflösen und in II einsetzen."} style={FLIESS} />
      <Formeln zeilen={[
        "x = 600 − y",
        "0,05 \\cdot (600 − y) + 0,2y = 72",
        "30 − 0,05y + 0,2y = 72",
        "30 + 0,15y = 72",
        "0,15y = 42",
        "y = \\frac{42}{0,15} = 280",
        "x = 600 − 280 = 320",
      ]} max={17} />
      <Text s={"Mit dem Additionsverfahren geht es genauso: Multipliziere I mit 0,05 und ziehe das Ergebnis von II ab – dann fällt $x$ weg."}
        style={FLIESS} />
      <Formeln zeilen={[
        "0,05 \\cdot \\text{I: } 0,05x + 0,05y = 30",
        "\\text{II} − 0,05 \\cdot \\text{I: } 0,15y = 42 \\;\\Rightarrow\\; y = 280",
        "\\text{Probe: } 0,05 \\cdot 320 + 0,2 \\cdot 280 = 16 + 56 = 72",
      ]} max={17} />
      <Text s="Jede Gleichung allein hat unendlich viele Lösungen – im Koordinatensystem ist das je eine Gerade. Beide zusammen erfüllt nur
        der Schnittpunkt." style={FLIESS} />
      <MischAnimation art="system" />

      <Schritt nr="4" titel="Das Mischungskreuz – und warum es stimmt" />
      <Text s="Das Mischungskreuz liefert das Verhältnis der Mengen ohne Gleichungssystem. Es ist keine Zauberei, sondern die umgestellte
        Mischungsgleichung:" style={FLIESS} />
      <Formeln zeilen={[
        "m_1 \\cdot c_1 + m_2 \\cdot c_2 = (m_1 + m_2) \\cdot c",
        "m_1 \\cdot c_1 + m_2 \\cdot c_2 = m_1 \\cdot c + m_2 \\cdot c",
        "m_2 \\cdot c_2 − m_2 \\cdot c = m_1 \\cdot c − m_1 \\cdot c_1",
        "m_2 \\cdot (c_2 − c) = m_1 \\cdot (c − c_1)",
        "\\frac{m_1}{m_2} = \\frac{c_2 − c}{c − c_1}",
      ]} max={17} />
      <Text s="In Worten: Von jeder Sorte nimmst du so viele Teile, wie die andere Sorte vom Zielwert entfernt ist. Deshalb stehen die
        Abstände über Kreuz – und die Sorte, die näher am Ziel liegt, bekommt mehr Teile." style={FLIESS} />
      <KreuzBild />
      <Formeln zeilen={[
        "8 + 7 = 15 \\text{ Teile}, \\quad 600 \\text{ g} : 15 = 40 \\text{ g}",
        "m_1 = 8 \\cdot 40 = 320 \\text{ g}, \\quad m_2 = 7 \\cdot 40 = 280 \\text{ g}",
      ]} max={17} />
      <Text s="Dasselbe Ergebnis wie mit dem Gleichungssystem, nur schneller. Das Kreuz liefert aber nur das Verhältnis: Die Gesamtmenge
        (hier 600 g) brauchst du als zweite Angabe – im Gleichungssystem ist das Gleichung I." style={FLIESS} />
      <MischAnimation art="kreuz" />
      <Kasten titel="Die Wippe">
        <Text s={"Die Zeile $m_1 \\cdot (c − c_1) = m_2 \\cdot (c_2 − c)$ ist das Hebelgesetz. Leg die Mengen als Gewichte auf einen Zahlenstrahl: $m_1$ an die Stelle $c_1$, $m_2$ an die Stelle $c_2$. Die Wippe ist im Gleichgewicht, wenn Gewicht mal Abstand zum Drehpunkt auf beiden Seiten gleich ist – und das ist genau beim Mischwert $c$ der Fall: $320 \\cdot 7 = 2240 = 280 \\cdot 8$."}
          style={{ ...PUNKT, margin: "8px 0 10px" }} />
      </Kasten>
      <MischAnimation art="wippe" />

      <Schritt nr="5" titel="Grenzen, Verdünnen und andere Mischungen" />
      <Text s="Kann man aus 5 % und 20 % eine Lösung mit 25 % mischen? Nein – die Mischung liegt immer zwischen den Sorten (Schritt 2).
        Das Kreuz zeigt es auch: Es verlangt eine negative Menge." style={FLIESS} />
      <Formeln zeilen={[
        "c = 25: \\quad c_2 − c = 20 − 25 = −5",
        "m_1 : m_2 = −5 : 20 \\;\\Rightarrow\\; \\text{unmöglich}",
      ]} max={17} />
      <Text s={"Liegt das Ziel genau auf einer Sorte, braucht man von der anderen nichts. Und: Wasser ist eine Lösung mit 0 % – Verdünnen ist Mischen mit $c_1 = 0$. Beispiel: 400 g Salzlösung mit 15 % sollen auf 6 % verdünnt werden."}
        style={FLIESS} />
      <Formeln zeilen={[
        "\\text{Salz: } 400 \\cdot 15 % = 60 \\text{ g (bleibt gleich)}",
        "60 \\text{ g sind } 6 % \\text{ der neuen Lösung: } \\frac{60}{0,06} = 1000 \\text{ g}",
        "\\text{Wasser: } 1000 − 400 = 600 \\text{ g}",
        "\\text{Kreuz: } \\text{Wasser} : \\text{Lösung} = (15 − 6) : (6 − 0) = 9 : 6 = 3 : 2",
      ]} max={17} />
      <Text s="Beide Wege liefern 600 g Wasser zu 400 g Lösung, also 3 : 2. Umgekehrt ist reines Salz eine „Lösung“ mit 100 %. Und die
        Rechnung funktioniert überall, wo ein gewichteter Mittelwert entsteht:" style={FLIESS} />
      <Kasten titel="Drei Bereiche, eine Gleichung">
        <ul style={LISTE}>
          <li style={PUNKT}><b style={{ fontWeight: 600 }}>Lösungen:</b> Prozent als Massenanteil, Wasser hat 0 %, reiner Stoff 100 %.</li>
          <li style={PUNKT}><b style={{ fontWeight: 600 }}>Sorten:</b> Preis je kg. Kaffee zu 18 € und 30 € je kg ergibt 21 € je kg im Verhältnis (30 − 21) : (21 − 18) = 9 : 3 = 3 : 1.</li>
          <li style={PUNKT}><b style={{ fontWeight: 600 }}>Legierungen:</b> Feingehalt in Promille. Sterlingsilber (925 ‰) aus 800er Silber und reinem Silber: (1000 − 925) : (925 − 800) = 75 : 125 = 3 : 5.</li>
        </ul>
      </Kasten>

      <Schritt nr="6" titel="Ausblick: drei Sorten" />
      <Text s={"Ein Bioladen mischt Nüsse zu 8 €, 12 € und 20 € je kg zu 10 kg einer Mischung für 14 € je kg. Jetzt gibt es drei Unbekannte $x$, $y$ und $z$ – aber weiterhin nur zwei Bedingungen."}
        style={FLIESS} />
      <Formeln zeilen={[
        "\\text{I: } x + y + z = 10",
        "\\text{II: } 8x + 12y + 20z = 140",
        "\\text{II} − 8 \\cdot \\text{I: } 4y + 12z = 60",
        "y = 15 − 3z, \\quad x = 10 − y − z = 2z − 5",
      ]} max={17} />
      <Text s={`Für jedes $z$ erhältst du eine passende Mischung, etwa $z = 3$: dann ist $y = 6$ und $x = 1$. Damit keine Menge negativ wird, muss $2z − 5 \\ge 0$ und $15 − 3z \\ge 0$ sein, also $${dezimal(DREI_GRENZE[0])} \\le z \\le ${dezimal(DREI_GRENZE[1])}$. Es gibt unendlich viele Lösungen – erst eine dritte Bedingung, zum Beispiel „gleich viel von Sorte 1 und 2“, legt die Mischung fest: $z = 4$, $x = y = 3$.`}
        style={FLIESS} />
      <MischAnimation art="drei" />
      <Kasten titel="Zum Mitnehmen">
        <Text s="Mischen ist gewichtetes Mitteln. Die Mengen verhalten sich umgekehrt wie die Abstände der Sorten zum Zielwert – das sagen
          Mischungsgleichung, Gleichungssystem, Mischungskreuz und Wippe auf vier verschiedene Arten." style={KERN} />
      </Kasten>

      <div style={{ ...KARTE, margin: "22px 0" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 12 }}>Labor: zwei Gefäße und eine Wippe</p>
        <MischLabor />
      </div>

      <Trenner />

      <Kicker>Jetzt selbst üben</Kicker>
      <H3>Mischung, Mengen, Verdünnen, Gleichungssystem</H3>
      <MischTrainer />

      {gehe && (
        <div style={{ ...KARTE, marginTop: 22, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: C.tinte, marginBottom: 4 }}>Mehr Gleichungssysteme</p>
            <p style={{ fontSize: 13.5, color: C.grau, fontWeight: 300, lineHeight: 1.6 }}>Gleichungssysteme lösen und trainieren – im Werkzeug Gleichungssysteme.</p>
          </div>
          <button type="button" onClick={() => gehe({ ansicht: "lgs" })} className="px-5 py-3" style={KNOPF(true)}>Zu den Gleichungssystemen</button>
        </div>
      )}

      <Trenner />

      <Kicker>Deine GFS</Kicker>
      <H3>Der rote Faden für den Vortrag</H3>
      <RoterFaden gliederung={GLIEDERUNG} tipps={TIPPS} hinweis="den Abschnitt „Mischungskreuz und Wippe“" />

      <div style={{ height: 8 }} />
      <Kicker>Kolloquium</Kicker>
      <H3>Die Fragen nach dem Vortrag trainieren</H3>
      <Kolloquium fragen={KOLLOQUIUM} speicher="mm-gfs-mischungen-kolloquium" />
    </div>
  );
}

