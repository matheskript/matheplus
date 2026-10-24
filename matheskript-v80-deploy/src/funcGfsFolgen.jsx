import React, { useState } from "react";
import { C } from "./base1.jsx";
import { Text, M } from "./func3.jsx";
import { MatheFeld } from "./matheTastatur.jsx";
import { FLIESS, KARTE, ZELLE, Formeln, Schritt, Kasten, Chip, PlusMinus, Kicker, H3, Trenner, RoterFaden, Kolloquium } from "./funcGfsBausteine.jsx";
import { lauf } from "./funcErklaeranimation.jsx";
import { AnimKarte } from "./funcAnimKarte.jsx";
import {
  dk, zTex,
  LABOR_FOLGEN, EPS_LISTE, EPS_START, LABOR_START, laborGlied, laborSumme, laborEigenschaften, laborN0, ueberSchranke,
  ARTEN, aufgabe, felder, auftrag, pruefe, rechenweg, tipp,
  GLIEDERUNG, TIPPS, KOLLOQUIUM,
} from "./gfsFolgen.js";

/* ============================================================
   Kurs GFS – Themenseite „Folgen und Grenzwerte“
   (Kursstufe 1, Kap. I Grundlagen der Differenzialrechnung)
   Aufbau wie das Ziegenproblem: Leitfrage · Herleitung in sechs Schritten
   (explizit/rekursiv, arithmetisch/geometrisch, ε-Schlauch, Summenformeln,
   unendliche geometrische Reihe, harmonische Reihe als Grenze) · fünf
   Erkläranimationen · Labor (vier Folgen, ε-Regler, n₀, Partialsummen) ·
   Übungen aus vier Generatoren · roter Faden · Kolloquium.
   Logik in gfsFolgen.js (getestet in tests/gfsFolgen.test.mjs).
   ============================================================ */

const KNOPF = (aktiv = true, farbe = C.see) => ({
  background: aktiv ? farbe : C.hellgrau, color: C.weiss, border: "none", borderRadius: 999, fontSize: 15, fontWeight: 600,
  fontFamily: "inherit", cursor: aktiv ? "pointer" : "default",
});
const LINK = { background: "none", border: "none", color: C.see, fontSize: 13, fontFamily: "inherit", cursor: "pointer", padding: 0, textDecoration: "underline" };
/* aktuelle Aufgabe für automatische Prüfungen (tests/ui/gfsfolgen.ui.py) */
const merk = (a) => { if (typeof window !== "undefined") window.__gfoAufgabe = a; return a; };

const T = (props) => <text fontFamily="inherit" {...props} />;
const mix = (a, b, p) => a + (b - a) * p;

/* SVG-Text mit tief- und hochgestellten Stücken: teile = ["a", { u: "n" }, " = 1/n"] (u tief, o hoch).
   Die Verschiebung wird in Einheiten der Grundgröße g gerechnet, damit die Grundlinie danach wieder stimmt. */
const LAGE = { 0: 0, 1: 0.28, [-1]: -0.4 };
function F({ teile, g = 13, ...props }) {
  let lage = 0;
  return (
    <T fontSize={g} {...props}>
      {teile.map((s, i) => {
        const ziel = s && typeof s === "object" ? (s.u !== undefined ? 1 : -1) : 0;
        const inhalt = s && typeof s === "object" ? (s.u !== undefined ? s.u : s.o) : s;
        const dy = (LAGE[ziel] - LAGE[lage]) * g;
        lage = ziel;
        return <tspan key={i} dy={dy ? dy.toFixed(2) : undefined} fontSize={ziel ? (g * 0.72).toFixed(2) : undefined}>{inhalt}</tspan>;
      })}
    </T>
  );
}

/* ======================================================================
   Kopfbild (viewBox 160 × 120): ein Quadrat, immer wieder halbiert –
   1/2 + 1/4 + 1/8 + … füllt es ganz aus. Daneben die Partialsummen
   sₙ = 1 − 1/2ⁿ, die in einen schmalen Schlauch um 1 laufen.
   ====================================================================== */
function halbStuecke(X0, Y0, S, anzahl) {
  const stuecke = [];
  let x = X0, y = Y0, w = S, h = S;
  for (let i = 0; i < anzahl; i++) {
    if (i % 2 === 0) { stuecke.push({ x, y, w: w / 2, h, i }); x += w / 2; w /= 2; }
    else { stuecke.push({ x, y, w, h: h / 2, i }); y += h / 2; h /= 2; }
  }
  return stuecke;
}

export function FolgenBild() {
  const X0 = 8, Y0 = 12, S = 90;
  const stuecke = halbStuecke(X0, Y0, S, 10);
  const PX = (n) => 113 + (n - 1) * 5.6, PY = (v) => 100 - v * 76;
  const EPS = 0.06;
  return (
    <svg className="gtk-bild" viewBox="0 0 160 120" role="img" style={{ width: "100%", maxWidth: 300, margin: "10px auto 0", justifySelf: "center" }}
      aria-label="Ein Quadrat wird immer wieder halbiert: 1/2 + 1/4 + 1/8 + … füllt es ganz aus. Daneben laufen die Partialsummen in einen schmalen Schlauch um 1.">
      <defs>
        <linearGradient id="gfo-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#FFE9A0" /><stop offset="60%" stopColor={C.flaggold} /><stop offset="100%" stopColor={C.goldWarm} /></linearGradient>
        <linearGradient id="gfo-blau" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={C.seeHell} /><stop offset="100%" stopColor={C.seeTief} /></linearGradient>
        <radialGradient id="gfo-glut" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor={C.flaggold} stopOpacity="0.45" /><stop offset="100%" stopColor={C.flaggold} stopOpacity="0" /></radialGradient>
      </defs>
      <ellipse className="gtk-glimmen" cx={X0 + S / 2} cy={Y0 + S / 2} rx="58" ry="58" fill="url(#gfo-glut)" />
      <rect x={X0} y={Y0} width={S} height={S} rx="2" fill="none" stroke="rgba(237,187,0,0.5)" strokeWidth="0.8" />
      {stuecke.map((s) => (
        <rect key={s.i} className="gtk-auf" style={{ animationDelay: `${0.07 * s.i}s` }} x={s.x + 0.6} y={s.y + 0.6}
          width={Math.max(0.3, s.w - 1.2)} height={Math.max(0.3, s.h - 1.2)} rx={Math.min(2, s.w / 6)}
          fill={s.i % 2 === 0 ? "url(#gfo-gold)" : "url(#gfo-blau)"} stroke={s.i % 2 === 0 ? "rgba(255,246,214,0.5)" : "rgba(91,143,209,0.6)"} strokeWidth="0.5" />
      ))}
      <g className="gtk-auf" style={{ animationDelay: ".7s" }} fontFamily="Montserrat, sans-serif" fontWeight="800" textAnchor="middle">
        <text x={X0 + S / 4} y={Y0 + S / 2 + 4} fontSize="12" fill={C.nachtschwarz}>1/2</text>
        <text x={X0 + (3 * S) / 4} y={Y0 + S / 4 + 3.4} fontSize="10" fill={C.weiss}>1/4</text>
        <text x={X0 + S / 2 + S / 8} y={Y0 + (3 * S) / 4 + 2.6} fontSize="7.5" fill={C.nachtschwarz}>1/8</text>
      </g>
      {/* Partialsummen mit Schlauch um 1 */}
      <g className="gtk-auf" style={{ animationDelay: ".45s" }}>
        <line x1="108" y1="100" x2="156" y2="100" stroke="rgba(255,255,255,0.35)" strokeWidth="0.7" />
        <rect x="108" y={PY(1 + EPS)} width="48" height={PY(1 - EPS) - PY(1 + EPS)} fill={C.flaggold} opacity="0.16" />
        <line x1="108" y1={PY(1)} x2="156" y2={PY(1)} stroke={C.flaggold} strokeWidth="0.8" strokeDasharray="2.4 2" />
        <text x="105" y={PY(1) + 3} textAnchor="end" fontFamily="Montserrat, sans-serif" fontSize="8" fontWeight="800" fill={C.flaggold}>1</text>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => {
          const v = 1 - 2 ** -n, drin = 1 - v < EPS;
          return <circle key={n} cx={PX(n)} cy={PY(v)} r="2" fill={drin ? C.flaggold : C.weiss} stroke={drin ? "#FFF6D6" : "rgba(255,255,255,0.6)"} strokeWidth="0.5" />;
        })}
      </g>
      <g className="gtk-auf" style={{ animationDelay: ".9s" }} fontFamily="Montserrat, sans-serif">
        <text x={X0 + S / 2} y="114" textAnchor="middle" fontSize="7.6" fontWeight="700" fill="rgba(255,255,255,0.8)">1/2 + 1/4 + 1/8 + … = 1</text>
        <text x="132" y="114" textAnchor="middle" fontSize="7.6" fontWeight="700" fill="rgba(255,255,255,0.8)">
          <tspan>s</tspan><tspan dy="1.8" fontSize="5.4">n</tspan><tspan dy="-1.8"> → 1</tspan>
        </text>
      </g>
    </svg>
  );
}

/* ======================================================================
   Erkläranimationen (Szenen sind reine Funktionen der Zeit; Schlussbild = Standbild)
     halbieren  – 1/2 + 1/4 + 1/8 + … = 1 am Quadrat, Lücke 1/2ⁿ
     schlauch   – ε-Schlauch um 1 für (n + 1)/n: n₀ = 6, 11, 21
     gauss      – Treppe + umgedrehte Treppe = Rechteck 8 · 9
     achilles   – Zenons Etappen als geometrische Reihe: 100/9 s
     harmonisch – Bündel ≥ 1/2: die harmonische Reihe wächst über jede Grenze
   ====================================================================== */

/* 1 · Halbieren ohne Ende */
const HA_DAUER = 23;
const haSchritte = () => [
  { von: 0, text: "Ein Quadrat mit dem Flächeninhalt 1. Die erste Hälfte wird gefärbt: 1/2." },
  { von: 3.8, text: "Vom Rest wieder die Hälfte: 1/4. Zusammen sind es 3/4." },
  { von: 7, text: "Immer so weiter: 1/8, 1/16, 1/32 … Jedes Stück ist halb so groß wie das vorige." },
  { von: 12, text: "Es fehlt immer genau so viel wie das letzte Stück: 1 − sₙ = 1/2ⁿ. Die Lücke wird beliebig klein." },
  { von: 17.5, text: "Unendlich viele Summanden passen in ein Quadrat: 1/2 + 1/4 + 1/8 + … = 1." },
];
const HA_ZEIT = (i) => (i === 0 ? 1 : i === 1 ? 4.2 : 7.4 + (i - 2) * 0.62);
const HA_TEXT = ["1/2", "1/4", "1/8", "1/16", "1/32"];
const HA_SUMMEN = ["0,5", "0,75", "0,875", "0,9375", "0,96875", "0,984375"];
function haZeichne(t) {
  const X0 = 20, Y0 = 22, S = 200;
  const stuecke = halbStuecke(X0, Y0, S, 10);
  const rahmen = lauf(t, 0.1, 0.9);
  /* Zahlenstrahl: sₙ läuft gegen 1, die Lücke 1 − sₙ (rot) schrumpft */
  const strahl = lauf(t, 12.2, 13);
  const k = Math.max(1, Math.min(8, 1 + Math.floor(Math.max(0, t - 13) / 0.5)));
  const L = (v) => 20 + 320 * v;
  const sk = 1 - 2 ** -k;
  const ende = lauf(t, 17.8, 19);
  return (
    <g>
      <rect x={X0} y={Y0} width={S} height={S} rx="3" fill={C.weiss} stroke={C.tinte} strokeWidth="1.6" opacity={rahmen} />
      {stuecke.map((s) => {
        const o = lauf(t, HA_ZEIT(s.i), HA_ZEIT(s.i) + 0.8);
        if (o <= 0.001) return null;
        const gold = s.i % 2 === 0;
        return (
          <g key={s.i} opacity={o}>
            <rect x={s.x + 1} y={s.y + 1} width={Math.max(0.4, s.w - 2)} height={Math.max(0.4, s.h - 2)} rx={Math.min(3, s.w / 6)}
              fill={gold ? C.flaggold : C.see} stroke={gold ? C.gold : C.seeTief} strokeWidth="1" />
            {s.i < HA_TEXT.length && (
              <T x={s.x + s.w / 2} y={s.y + s.h / 2 + [8, 6, 5, 4, 3][s.i]} textAnchor="middle" fontSize={[24, 18, 14, 11, 8][s.i]} fontWeight="800"
                fill={gold ? C.seeTief : C.weiss}>{HA_TEXT[s.i]}</T>
            )}
          </g>
        );
      })}
      {/* Partialsummen rechts */}
      {HA_SUMMEN.map((w, i) => (
        <F key={i} x="236" y={44 + i * 27} g={14} fontWeight={i === 5 ? 700 : 600} fill={C.tinte} opacity={lauf(t, HA_ZEIT(i) + 0.3, HA_ZEIT(i) + 1)}
          teile={["s", { u: String(i + 1) }, ` = ${w}`]} />
      ))}
      <T x="236" y="214" fontSize="16" fontWeight="800" fill={C.gold} opacity={lauf(t, 11, 11.8)}>… → 1</T>
      {/* Zahlenstrahl mit Lücke */}
      {strahl > 0.001 && (
        <g opacity={strahl}>
          <line x1={L(0)} y1="250" x2={L(1)} y2="250" stroke={C.tinte} strokeWidth="1.4" />
          {[0, 0.5, 1].map((v) => <line key={v} x1={L(v)} y1="245" x2={L(v)} y2="255" stroke={C.tinte} strokeWidth="1.2" />)}
          <T x={L(0)} y="270" textAnchor="middle" fontSize="12" fontWeight="600" fill={C.grau}>0</T>
          <T x={L(0.5)} y="270" textAnchor="middle" fontSize="12" fontWeight="600" fill={C.grau}>1/2</T>
          <T x={L(1)} y="270" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.tinte}>1</T>
          <line x1={L(0)} y1="250" x2={L(sk)} y2="250" stroke={C.flaggold} strokeWidth="5" strokeLinecap="round" />
          <line x1={L(sk)} y1="250" x2={L(1)} y2="250" stroke={C.signal} strokeWidth="5" />
          <circle cx={L(sk)} cy="250" r="5" fill={C.flaggold} stroke={C.gold} strokeWidth="1.4" />
          <F x={Math.min(L(sk), 270)} y="236" g={12} textAnchor="end" fontWeight="700" fill={C.signal} opacity={1 - ende}
            teile={[`Lücke 1/${2 ** k} nach `, "s", { u: String(k) }]} />
        </g>
      )}
      <T x="180" y="294" textAnchor="middle" fontSize="18" fontWeight="800" fill={C.tinte} opacity={ende}>
        1/2 + 1/4 + 1/8 + … = <tspan fill={C.gold}>1</tspan>
      </T>
    </g>
  );
}

/* 2 · Der ε-Schlauch um 1 für aₙ = (n + 1)/n */
const SC_DAUER = 26;
const scSchritte = () => [
  { von: 0, text: "Die Folge aₙ = (n + 1)/n beginnt mit 2; 1,5; 1,33; 1,25 … Die Punkte rücken an die 1 heran." },
  { von: 4.5, text: "Um g = 1 legen wir einen Schlauch: ε = 0,2 nach oben und nach unten." },
  { von: 8.8, text: "|aₙ − 1| = 1/n < 0,2 gilt für n > 5. Ab n₀ = 6 bleiben alle Punkte im Schlauch." },
  { von: 13.8, text: "Schmalerer Schlauch, späteres n₀: Bei ε = 0,1 ab n₀ = 11, bei ε = 0,05 ab n₀ = 21." },
  { von: 20, text: "Zu jedem ε > 0 gibt es so ein n₀. Genau das heißt: Die Folge hat den Grenzwert 1." },
];
const scX = (n) => 48 + (n - 1) * (292 / 29);
const scY = (v) => 244 - (v - 0.75) * 150;
function scZeichne(t) {
  const achse = lauf(t, 0.1, 0.8);
  const gAn = lauf(t, 2.6, 3.4);
  const bandAn = lauf(t, 5, 6.2);
  const e1 = lauf(t, 14.4, 15.6), e2 = lauf(t, 17.4, 18.6);
  const eps = mix(mix(0.2, 0.1, e1), 0.05, e2);
  const n0An = lauf(t, 9.2, 10.2);
  let n0 = 1; while (1 / n0 >= eps - 1e-12) n0++;
  const halb = eps * 150 * bandAn;
  const ende = lauf(t, 20.2, 21.2);
  return (
    <g>
      <F x="48" y="24" g={14} fontWeight="800" fill={C.seeTief} opacity={achse} teile={["a", { u: "n" }, " = (n + 1)/n"]} />
      <g opacity={achse}>
        <line x1="40" y1="254" x2="346" y2="254" stroke={C.tinte} strokeWidth="1.2" />
        <line x1="40" y1="254" x2="40" y2="40" stroke={C.tinte} strokeWidth="1.2" />
        {[1, 5, 10, 15, 20, 25, 30].map((n) => (
          <g key={n}>
            <line x1={scX(n)} y1="254" x2={scX(n)} y2="258" stroke={C.tinte} strokeWidth="1" />
            <T x={scX(n)} y="272" textAnchor="middle" fontSize="11" fill={C.grau}>{n}</T>
          </g>
        ))}
        <T x="346" y="248" textAnchor="end" fontSize="11" fontWeight="700" fill={C.grau}>n</T>
        {[[1, "1"], [1.5, "1,5"], [2, "2"]].map(([v, s]) => (
          <g key={s}>
            <line x1="36" y1={scY(v)} x2="40" y2={scY(v)} stroke={C.tinte} strokeWidth="1" />
            <T x="32" y={scY(v) + 4} textAnchor="end" fontSize="11" fill={C.grau}>{s}</T>
          </g>
        ))}
      </g>
      {halb > 0.1 && (
        <g>
          <rect x="41" y={scY(1) - halb} width="305" height={2 * halb} fill={C.flaggold} opacity="0.2" />
          <line x1="41" y1={scY(1) - halb} x2="346" y2={scY(1) - halb} stroke={C.gold} strokeWidth="1" strokeDasharray="4 3" />
          <line x1="41" y1={scY(1) + halb} x2="346" y2={scY(1) + halb} stroke={C.gold} strokeWidth="1" strokeDasharray="4 3" />
          <T x="344" y={scY(1) - halb - 5} textAnchor="end" fontSize="12" fontWeight="800" fill={C.gold} opacity={bandAn}>ε = {dk(eps, 2)}</T>
        </g>
      )}
      <line x1="41" y1={scY(1)} x2="346" y2={scY(1)} stroke={C.gold} strokeWidth="1.6" strokeDasharray="6 4" opacity={gAn} />
      <T x="56" y={scY(1) - 6} fontSize="12" fontWeight="800" fill={C.gold} opacity={gAn * (1 - bandAn)}>g = 1</T>
      {n0An > 0.001 && (
        <g opacity={n0An}>
          <line x1={scX(n0) - 5} y1="44" x2={scX(n0) - 5} y2="254" stroke={C.seeTief} strokeWidth="1.4" strokeDasharray="3 3" />
          <F x={scX(n0) - 1} y="56" g={12.5} fontWeight="800" fill={C.seeTief} teile={["n", { u: "0" }, ` = ${n0}`]} />
        </g>
      )}
      {Array.from({ length: 30 }, (_, i) => {
        const n = i + 1, v = 1 + 1 / n;
        const o = lauf(t, 0.6 + 0.1 * i, 0.9 + 0.1 * i);
        if (o <= 0.001) return null;
        const drin = n0An > 0.5 && n >= n0;
        return <circle key={n} cx={scX(n)} cy={scY(v)} r="4.2" opacity={o} fill={drin ? C.flaggold : C.weiss} stroke={drin ? C.gold : C.see} strokeWidth="1.6" />;
      })}
      <g opacity={n0An * (1 - ende)}>
        <F x="180" y="294" g={13.5} textAnchor="middle" fontWeight="700" fill={C.tinte}
          teile={[`ε = ${dk(eps, 2)}: alle Punkte ab `, "n", { u: "0" }, ` = ${n0} im Schlauch`]} />
      </g>
      <F x="180" y="294" g={14} textAnchor="middle" fontWeight="800" fill={C.gold} opacity={ende}
        teile={["Für jedes ε > 0 gibt es ein ", "n", { u: "0" }, "."]} />
    </g>
  );
}

/* 3 · Gauß: Treppe und umgedrehte Treppe */
const GA_DAUER = 23;
const gaSchritte = () => [
  { von: 0, text: "1 + 2 + … + 8 als Treppe: In Spalte k stehen k Kästchen." },
  { von: 4.4, text: "Dieselbe Treppe noch einmal, umgedreht daraufgesetzt: rückwärts 8 + 7 + … + 1." },
  { von: 9, text: "Jede Spalte hat jetzt 8 + 1 = 9 Kästchen. Zusammen ein Rechteck aus 8 · 9 = 72." },
  { von: 13.4, text: "Die Treppe ist genau die Hälfte davon: 1 + 2 + … + 8 = 72 : 2 = 36." },
  { von: 17.8, text: "Allgemein: sₙ = n(n + 1)/2. Für 1 bis 100 sind das 100 · 101 : 2 = 5050." },
];
function gaZeichne(t) {
  const U = 21, X0 = 18, YB = 232, N = 8;
  const gelbBlass = 1 - 0.7 * lauf(t, 13.6, 14.6);
  const rechteck = lauf(t, 9.4, 10.2);
  const zeile = (y, text, an, farbe, gross = 14, gewicht = 700) => <T x="206" y={y} fontSize={gross} fontWeight={gewicht} fill={farbe} opacity={an}>{text}</T>;
  return (
    <g>
      {Array.from({ length: N }, (_, i) => {
        const k = i + 1, x = X0 + i * U;
        const blau = lauf(t, 0.3 + 0.32 * i, 0.8 + 0.32 * i);
        const gold = lauf(t, 4.8 + 0.14 * i, 5.8 + 0.14 * i);
        return (
          <g key={k}>
            {blau > 0.001 && Array.from({ length: k }, (_, j) => (
              <rect key={j} x={x + 1} y={YB - (j + 1) * U + 1} width={U - 2} height={U - 2} rx="3" fill={C.see} opacity={blau} />
            ))}
            {gold > 0.001 && Array.from({ length: N + 1 - k }, (_, j) => (
              <rect key={j} x={x + 1} y={YB - (k + j + 1) * U + 1 - 36 * (1 - gold)} width={U - 2} height={U - 2} rx="3" fill={C.flaggold} stroke={C.gold} strokeWidth="0.8"
                opacity={gold * gelbBlass} />
            ))}
            <T x={x + U / 2} y={YB + 16} textAnchor="middle" fontSize="11.5" fontWeight="800" fill={C.see} opacity={lauf(t, 1.4, 2.2)}>{k}</T>
            <T x={x + U / 2} y={YB - (N + 1) * U - 6} textAnchor="middle" fontSize="11.5" fontWeight="800" fill={C.gold} opacity={gold * gelbBlass}>{N + 1 - k}</T>
          </g>
        );
      })}
      {rechteck > 0.001 && (
        <rect x={X0 - 2} y={YB - (N + 1) * U - 2} width={N * U + 4} height={(N + 1) * U + 4} rx="4" fill="none" stroke={C.tinte} strokeWidth="2" opacity={rechteck} />
      )}
      <T x={X0 - 6} y={YB - ((N + 1) * U) / 2 + 4} textAnchor="end" fontSize="12" fontWeight="800" fill={C.tinte} opacity={rechteck}>9</T>
      {zeile(62, "1 + 2 + … + 8", lauf(t, 1.6, 2.4), C.see)}
      {zeile(88, "8 + 7 + … + 1", lauf(t, 5.6, 6.4), C.gold)}
      {zeile(114, "9 + 9 + … + 9", lauf(t, 9.6, 10.4), C.tinte)}
      {zeile(142, "8 · 9 = 72", lauf(t, 10.4, 11.2), C.tinte, 15, 800)}
      {zeile(172, "72 : 2 = 36", lauf(t, 14, 14.8), C.see, 17, 800)}
      <F x="206" y="214" g={14} fontWeight="800" fill={C.tinte} opacity={lauf(t, 18.2, 19)} teile={["s", { u: "n" }, " = n(n + 1)/2"]} />
      {zeile(240, "1 + … + 100 = 5050", lauf(t, 19.4, 20.2), C.gold, 13.5, 800)}
    </g>
  );
}

/* 4 · Achilles und die Schildkröte: 100 m Vorsprung, 10 m/s gegen 1 m/s */
const AC_DAUER = 23;
const acSchritte = () => [
  { von: 0, text: "Achilles läuft 10 m/s, die Schildkröte nur 1 m/s – aber sie hat 100 m Vorsprung." },
  { von: 4, text: "Etappe 1: Achilles braucht 10 s bis zum Startpunkt der Schildkröte. Sie ist inzwischen 10 m weiter." },
  { von: 8.6, text: "Etappe 2 dauert 1 s, Etappe 3 nur 0,1 s. Jede Etappe dauert ein Zehntel der vorigen." },
  { von: 13.8, text: "Zenon: unendlich viele Etappen – also holt er sie nie ein? Die Zeiten bilden eine geometrische Reihe." },
  { von: 17.4, text: "10 + 1 + 0,1 + … = 10/(1 − 0,1) = 100/9 ≈ 11,1 s. Dann ist er nach rund 111,1 m bei ihr." },
];
/* [Beginn, Ende (gezeichnete Zeit), Laufzeit von, bis] – innerhalb einer Etappe gleichmäßig, dazwischen Pause */
const AC_ETAPPEN = [[4.6, 7.6, 0, 10], [9.0, 11.2, 10, 11], [11.8, 13.4, 11, 11.1], [14.2, 15.2, 11.1, 11.11], [15.4, 16.6, 11.11, 100 / 9]];
const acTau = (t) => {
  let r = 0;
  for (const [a, b, von, bis] of AC_ETAPPEN) if (t >= a) r = von + (bis - von) * Math.min(1, (t - a) / (b - a));
  return r;
};
const AC_SUMMEN = ["10", "10 + 1 = 11", "10 + 1 + 0,1 = 11,1", "10 + 1 + 0,1 + 0,01 = 11,11"];
function Laeufer({ x, y, o = 1 }) {
  if (o <= 0.001) return null;
  return (
    <g opacity={o}>
      <circle cx={x} cy={y - 9} r="7.5" fill={C.flaggold} stroke={C.gold} strokeWidth="1.2" />
      <T x={x} y={y - 5.6} textAnchor="middle" fontSize="9.5" fontWeight="800" fill={C.seeTief}>A</T>
    </g>
  );
}
function Kroete({ x, y, o = 1 }) {
  if (o <= 0.001) return null;
  return (
    <g opacity={o}>
      <path d={`M${x - 9} ${y - 3} Q${x - 8} ${y - 13} ${x} ${y - 13} Q${x + 8} ${y - 13} ${x + 9} ${y - 3} Z`} fill={C.smaragd} stroke="#1F6B43" strokeWidth="1" />
      <circle cx={x + 11.5} cy={y - 6} r="2.8" fill={C.smaragd} />
      <line x1={x - 6} y1={y - 3} x2={x - 7} y2={y} stroke="#1F6B43" strokeWidth="1.6" strokeLinecap="round" />
      <line x1={x + 6} y1={y - 3} x2={x + 7} y2={y} stroke="#1F6B43" strokeWidth="1.6" strokeLinecap="round" />
    </g>
  );
}
function acZeichne(t) {
  const X = (m) => 24 + m * 2.6, Z = (m) => 24 + (m - 100) * 26;
  const OY = 84, ZY = 180;   // Übersicht und Lupe
  const tau = acTau(t), a = 10 * tau, s = 100 + tau;
  const da = lauf(t, 0.2, 1.2);
  const lupe = lauf(t, 8.6, 9.4);
  const fertig = AC_ETAPPEN.filter(([, b]) => t >= b).length;
  const summe = lauf(t, 17.8, 18.8), treff = lauf(t, 19, 20);
  const imZoom = (m) => m >= 99.6 && m <= 112.4;
  const klammer = (x1, x2, y) => <path d={`M${x1} ${y + 4} V${y} H${x2} V${y + 4}`} fill="none" stroke={C.gold} strokeWidth="1.3" />;
  return (
    <g>
      <g opacity={da}>
        <circle cx="29" cy="16" r="5" fill={C.flaggold} stroke={C.gold} />
        <T x="38" y="20" fontSize="11" fontWeight="700" fill={C.tinte}>Achilles 10 m/s</T>
        <circle cx="146" cy="16" r="5" fill={C.smaragd} />
        <T x="155" y="20" fontSize="11" fontWeight="700" fill={C.tinte}>Schildkröte 1 m/s</T>
        <T x="346" y="20" textAnchor="end" fontSize="11.5" fontWeight="800" fill={C.seeTief}>t = {dk(tau, 2)} s</T>
        {/* Übersicht 0 bis 120 m */}
        <line x1={X(0)} y1={OY} x2={X(120)} y2={OY} stroke={C.tinte} strokeWidth="1.4" />
        {[0, 50, 100].map((m) => (
          <g key={m}>
            <line x1={X(m)} y1={OY - 4} x2={X(m)} y2={OY + 4} stroke={C.tinte} strokeWidth="1" />
            <T x={X(m)} y={OY + 18} textAnchor="middle" fontSize="11" fill={C.grau}>{m} m</T>
          </g>
        ))}
      </g>
      {/* Etappe 1 als Klammer */}
      <g opacity={lauf(t, 7.6, 8.2)}>
        {klammer(X(0), X(100), 48)}
        <T x={X(50)} y="44" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={C.gold}>Etappe 1: 10 s</T>
      </g>
      {/* Lupe 100 bis 112 m */}
      <g opacity={lupe}>
        <rect x={X(100)} y={OY - 8} width={X(112) - X(100)} height="16" rx="3" fill="none" stroke={C.seeTief} strokeWidth="1" strokeDasharray="3 2" />
        <line x1={X(100)} y1={OY + 8} x2={Z(100)} y2={ZY - 30} stroke={C.hellgrau} strokeWidth="0.9" strokeDasharray="3 3" />
        <line x1={X(112)} y1={OY + 8} x2={Z(112)} y2={ZY - 30} stroke={C.hellgrau} strokeWidth="0.9" strokeDasharray="3 3" />
        <T x="250" y="128" textAnchor="middle" fontSize="11" fontWeight="700" fill={C.grau}>Lupe: 100 m bis 112 m</T>
        <line x1={Z(100)} y1={ZY} x2={Z(112)} y2={ZY} stroke={C.tinte} strokeWidth="1.4" />
        {[[100, "100"], [105, "105"], [110, "110"], [111, "111"]].map(([m, s2]) => (
          <g key={m}>
            <line x1={Z(m)} y1={ZY - 4} x2={Z(m)} y2={ZY + 4} stroke={C.tinte} strokeWidth="1" />
            <T x={Z(m)} y={ZY + 18} textAnchor="middle" fontSize="10.5" fill={C.grau}>{s2}</T>
          </g>
        ))}
        {fertig >= 2 && klammer(Z(100), Z(110), ZY - 30)}
        {fertig >= 2 && <T x={Z(105)} y={ZY - 34} textAnchor="middle" fontSize="11" fontWeight="800" fill={C.gold}>Etappe 2: 1 s</T>}
        {fertig >= 3 && <path d={`M${Z(110)} ${ZY + 22} V${ZY + 26} H${Z(111)} V${ZY + 22}`} fill="none" stroke={C.gold} strokeWidth="1.3" />}
        {fertig >= 3 && <T x={Z(110.5)} y={ZY + 40} textAnchor="middle" fontSize="10.5" fontWeight="800" fill={C.gold}>Etappe 3: 0,1 s</T>}
      </g>
      {/* Läufer in der Übersicht und in der Lupe */}
      <Kroete x={X(s)} y={OY - 6} o={da} />
      <Laeufer x={X(a)} y={OY - 6} o={da} />
      {imZoom(s) && <Kroete x={Z(s)} y={ZY - 6} o={lupe} />}
      {imZoom(a) && <Laeufer x={Z(a)} y={ZY - 6} o={lupe} />}
      {treff > 0.001 && <circle cx={Z(1000 / 9)} cy={ZY - 8} r="15" fill="none" stroke={C.gold} strokeWidth="2" opacity={treff} />}
      {/* Zeiten */}
      {fertig > 0 && fertig <= 4 && <T x="180" y="244" textAnchor="middle" fontSize="14" fontWeight="700" fill={C.tinte} opacity={1 - summe}>Zeit: {AC_SUMMEN[fertig - 1]} s</T>}
      <T x="180" y="244" textAnchor="middle" fontSize="14" fontWeight="700" fill={C.tinte} opacity={summe}>Zeit: 10 + 1 + 0,1 + 0,01 + …</T>
      <T x="180" y="270" textAnchor="middle" fontSize="15" fontWeight="800" fill={C.see} opacity={summe}>= 10/(1 − 0,1) = 100/9 ≈ 11,1 s</T>
      <T x="180" y="296" textAnchor="middle" fontSize="13.5" fontWeight="800" fill={C.gold} opacity={treff}>Treffpunkt: 10 · 100/9 = 1000/9 ≈ 111,1 m</T>
    </g>
  );
}

/* 5 · Die harmonische Reihe: Bündel mit je mindestens 1/2 */
const HR_DAUER = 23;
const hrSchritte = () => [
  { von: 0, text: "Die harmonische Reihe 1 + 1/2 + 1/3 + 1/4 + … Ihre Glieder werden immer kleiner und gehen gegen 0." },
  { von: 4.4, text: "Wir bündeln: 1/3 + 1/4, dann 1/5 bis 1/8, dann 1/9 bis 1/16 – jedes Bündel doppelt so lang wie das vorige." },
  { von: 9.4, text: "Im Bündel ist jedes Glied mindestens so groß wie das letzte. Darum bringt jedes Bündel mindestens 1/2." },
  { von: 14, text: "Unendlich viele Bündel mit je mindestens 1/2: Die Summe wächst über jede Grenze." },
  { von: 18, text: "Aber sehr langsam: Über 10 kommt sie erst bei n = 12 367. Glieder gegen 0 reichen also nicht." },
];
const hrGruppe = (k) => (k === 1 ? 0 : Math.ceil(Math.log2(k) - 1e-9));
const HR_BUENDEL = [[3, 4, "1/3 + 1/4", "2 · 1/4"], [5, 8, "1/5 bis 1/8", "4 · 1/8"], [9, 16, "1/9 bis 1/16", "8 · 1/16"]];
function hrZeichne(t) {
  const BX = (k) => 26 + (k - 1) * 20, YB = 150, H = 112;
  const gruppen = lauf(t, 4.8, 6.2);
  const mindest = lauf(t, 9.8, 11);
  const band = lauf(t, 11.6, 12.6);
  const weiter = lauf(t, 14.4, 15.6);
  const ende = lauf(t, 18.4, 19.4);
  const E = 60, BAND_X = 26;
  const grenzen = [0, 1, 1.5, 2, 2.5, 3];
  return (
    <g>
      <line x1="20" y1={YB} x2="346" y2={YB} stroke={C.tinte} strokeWidth="1.2" opacity={lauf(t, 0.1, 0.6)} />
      {Array.from({ length: 16 }, (_, i) => {
        const k = i + 1, h = H / k, g = hrGruppe(k);
        const o = lauf(t, 0.2 + 0.18 * i, 0.6 + 0.18 * i);
        if (o <= 0.001) return null;
        const gold = g % 2 === 1;
        const minH = g >= 2 ? H / 2 ** g : h;
        return (
          <g key={k} opacity={o}>
            <rect x={BX(k)} y={YB - h} width="16" height={h} rx="2" fill={C.see} />
            {gold && <rect x={BX(k)} y={YB - h} width="16" height={h} rx="2" fill={C.flaggold} opacity={gruppen} />}
            {g >= 2 && mindest > 0.001 && <rect x={BX(k)} y={YB - h} width="16" height={h - minH} rx="2" fill={C.weiss} opacity={0.55 * mindest} />}
            <T x={BX(k) + 8} y={YB - h - 4} textAnchor="middle" fontSize={k < 10 ? 9.5 : 8} fontWeight="700" fill={C.grau} opacity={k <= 9 ? 1 - 0.6 * mindest : 0}>{k === 1 ? "1" : `1/${k}`}</T>
          </g>
        );
      })}
      {HR_BUENDEL.map(([von, bis, text, mind], j) => {
        const x1 = BX(von), x2 = BX(bis) + 16, mitte = (x1 + x2) / 2;
        const o = gruppen * lauf(t, 5.2 + j * 0.6, 6 + j * 0.6);
        const g = j + 2;
        return (
          <g key={von} opacity={o}>
            <path d={`M${x1} ${YB + 6} V${YB + 11} H${x2} V${YB + 6}`} fill="none" stroke={C.tinte} strokeWidth="1.2" />
            <T x={mitte} y={YB + 25} textAnchor="middle" fontSize="10.5" fontWeight="700" fill={C.tinte} opacity={1 - mindest}>{text}</T>
            <T x={mitte} y={YB + 25} textAnchor="middle" fontSize="11" fontWeight="800" fill={C.gold} opacity={mindest}>≥ 1/2</T>
            <T x={mitte} y={YB + 38} textAnchor="middle" fontSize="9" fontWeight="600" fill={C.grau} opacity={mindest}>{mind}</T>
            {mindest > 0.001 && <line x1={x1 - 1} y1={YB - H / 2 ** g} x2={x2 + 1} y2={YB - H / 2 ** g} stroke={C.signal} strokeWidth="1.4" strokeDasharray="3 2" opacity={mindest} />}
          </g>
        );
      })}
      {/* Untergrenze als Band: 1, 1/2, 1/2, 1/2, 1/2 … */}
      {band > 0.001 && (
        <g opacity={band}>
          {grenzen.slice(0, -1).map((v, i) => (
            <rect key={i} x={BAND_X + v * E} y="214" width={(grenzen[i + 1] - v) * E - 1.5} height="16" rx="3"
              fill={i % 2 === 0 ? C.see : C.flaggold} />
          ))}
          {grenzen.slice(1).map((v, i) => <T key={i} x={BAND_X + v * E - 3} y="246" textAnchor="end" fontSize="10" fontWeight="700" fill={C.grau}>{dk(v, 1)}</T>)}
          <F x={BAND_X} y="207" g={11.5} fontWeight="700" fill={C.tinte} teile={["nach 16 Gliedern mindestens 1 + 4 · 1/2 = 3"]} />
        </g>
      )}
      {weiter > 0.001 && (
        <g opacity={weiter}>
          {[0, 1, 2].map((i) => (
            <rect key={i} x={BAND_X + (3 + i * 0.5) * E} y="214" width={0.5 * E - 1.5} height="16" rx="3" fill="none"
              stroke={i % 2 === 0 ? C.see : C.gold} strokeWidth="1.2" strokeDasharray="3 2" />
          ))}
          <T x="346" y="227" textAnchor="end" fontSize="16" fontWeight="800" fill={C.signal}>→ ∞</T>
          <F x="180" y="270" g={13} textAnchor="middle" fontWeight="700" fill={C.tinte} teile={["Nach 2", { o: "k" }, " Gliedern: Summe ≥ 1 + k/2"]} />
        </g>
      )}
      <T x="180" y="296" textAnchor="middle" fontSize="15" fontWeight="800" fill={C.gold} opacity={ende}>Über 10 erst ab n = 12 367</T>
    </g>
  );
}

const FOLGEN_ANIM = {
  halbieren: { titel: () => "Halbieren ohne Ende", unter: () => "1/2 + 1/4 + 1/8 + … füllt genau ein Quadrat",
    szene: () => ({ dauer: HA_DAUER, hoehe: 300, schritte: haSchritte(), zeichne: haZeichne,
      beschreibung: "Animation: Ein Quadrat mit dem Flächeninhalt 1 wird immer wieder halbiert. Die Stücke 1/2, 1/4, 1/8 … füllen es aus, die Partialsummen 0,5; 0,75; 0,875 … laufen gegen 1, die Lücke 1/2ⁿ wird beliebig klein." }) },
  schlauch: { titel: () => "Der ε-Schlauch", unter: () => "Ab welchem n bleiben alle Glieder von (n + 1)/n nahe bei 1?",
    szene: () => ({ dauer: SC_DAUER, hoehe: 300, schritte: scSchritte(), zeichne: scZeichne,
      beschreibung: "Animation: Die Punkte der Folge (n + 1)/n für n = 1 bis 30 nähern sich 1. Um 1 liegt ein Schlauch der Breite ε. Bei ε = 0,2 liegen alle Punkte ab n₀ = 6 darin, bei 0,1 ab 11, bei 0,05 ab 21." }) },
  gauss: { titel: () => "Der Trick mit der umgedrehten Treppe", unter: () => "Warum 1 + 2 + … + n = n(n + 1)/2 ist",
    szene: () => ({ dauer: GA_DAUER, hoehe: 260, schritte: gaSchritte(), zeichne: gaZeichne,
      beschreibung: "Animation: Die Summe 1 + 2 + … + 8 als Treppe aus Kästchen. Eine umgedrehte Kopie ergänzt sie zu einem Rechteck aus 8 · 9 = 72 Kästchen, die Treppe ist die Hälfte: 36." }) },
  achilles: { titel: () => "Achilles und die Schildkröte", unter: () => "Unendlich viele Etappen – und doch eine endliche Zeit",
    szene: () => ({ dauer: AC_DAUER, hoehe: 304, schritte: acSchritte(), zeichne: acZeichne,
      beschreibung: "Animation: Achilles (10 m/s) verfolgt eine Schildkröte (1 m/s) mit 100 m Vorsprung. Die Etappen dauern 10 s, 1 s, 0,1 s … Ihre Summe ist 100/9 ≈ 11,1 s, der Treffpunkt liegt bei 1000/9 ≈ 111,1 m." }) },
  harmonisch: { titel: () => "Die harmonische Reihe", unter: () => "Glieder gegen 0 – und trotzdem keine endliche Summe",
    szene: () => ({ dauer: HR_DAUER, hoehe: 304, schritte: hrSchritte(), zeichne: hrZeichne,
      beschreibung: "Animation: Balken für 1, 1/2, 1/3 bis 1/16. Die Glieder werden zu Bündeln 1/3 + 1/4, 1/5 bis 1/8, 1/9 bis 1/16 zusammengefasst, jedes Bündel ist mindestens 1/2. Darum wächst die Summe über jede Grenze, über 10 aber erst ab n = 12 367." }) },
};

export function FolgenAnimation({ art, offen = false }) {
  return <AnimKarte szenen={FOLGEN_ANIM} art={art} offen={offen} merkmal="data-folgen-anim" />;
}

/* ======================================================================
   Labor: Folge wählen, ε-Schlauch, n₀, Partialsummen
   ====================================================================== */
function Regler({ label, wert, anzeige, min, max, step, setzen, hilfe }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div className="flex items-baseline" style={{ gap: 8 }}>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: C.tinte }}>{label}</span>
        {hilfe && <span style={{ fontSize: 12, color: C.grau, fontWeight: 300 }}>{hilfe}</span>}
        <span style={{ marginLeft: "auto", fontSize: 14, fontWeight: 800, color: C.see, fontVariantNumeric: "tabular-nums" }}>{anzeige}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={wert} onChange={(e) => setzen(parseFloat(e.target.value))} aria-label={label}
        style={{ width: "100%", accentColor: C.see, margin: "4px 0 0", cursor: "pointer" }} />
    </div>
  );
}

/* schöne Achsenmarken zwischen lo und hi */
function marken(lo, hi, anzahl = 4) {
  const roh = (hi - lo || 1) / anzahl, p = 10 ** Math.floor(Math.log10(roh)), f = roh / p;
  const schritt = (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p;
  const liste = [];
  for (let v = Math.ceil(lo / schritt - 1e-9) * schritt; v <= hi + 1e-9; v += schritt) liste.push(Math.round(v / schritt) * schritt);
  const stellen = Math.max(0, -Math.floor(Math.log10(schritt) + 1e-9));
  return liste.map((v) => ({ v, text: dk(v, stellen) }));
}

/* Punkte (n | wert) mit optionalem Schlauch um g und Linie bei n₀ */
function PunkteBild({ titel, werte, g = null, eps = null, n0 = null, linie = null, linieText = "", markiert = null, aria }) {
  const N = werte.length;
  const L = 40, R = 332, O = 16, U = 168;
  const zahl = werte.filter((v) => v !== null && Number.isFinite(v));
  let lo = Math.min(...zahl), hi = Math.max(...zahl);
  if (g !== null) { lo = Math.min(lo, g - (eps || 0)); hi = Math.max(hi, g + (eps || 0)); }
  if (linie !== null) { lo = Math.min(lo, linie); hi = Math.max(hi, linie); }
  if (hi - lo < 1e-9) { lo -= 1; hi += 1; }
  const rand = (hi - lo) * 0.08; lo -= rand; hi += rand;
  const X = (n) => L + 6 + ((n - 1) / Math.max(1, N - 1)) * (R - L - 12);
  const Y = (v) => U - ((v - lo) / (hi - lo)) * (U - O);
  const r = N <= 30 ? 3.4 : N <= 60 ? 2.6 : 1.9;
  const xMarken = [1, ...Array.from({ length: Math.floor(N / (N > 60 ? 20 : 10)) }, (_, i) => (i + 1) * (N > 60 ? 20 : 10))];
  const yMarken = marken(lo, hi);
  return (
    <svg viewBox="0 0 340 194" style={{ width: "100%", display: "block" }} role="img" aria-label={aria}>
      <T x={L} y="11" fontSize="11.5" fontWeight="700" fill={C.gruenDunkel}>{titel}</T>
      {g !== null && eps !== null && (
        <rect x={L} y={Y(g + eps)} width={R - L} height={Math.max(0.5, Y(g - eps) - Y(g + eps))} fill={C.flaggold} opacity="0.2" />
      )}
      {g !== null && <line x1={L} y1={Y(g)} x2={R} y2={Y(g)} stroke={C.gold} strokeWidth="1.4" strokeDasharray="5 4" />}
      {linie !== null && (
        <g>
          <line x1={L} y1={Y(linie)} x2={R} y2={Y(linie)} stroke={C.gold} strokeWidth="1.4" strokeDasharray="5 4" />
          <T x={R} y={Y(linie) - 5} textAnchor="end" fontSize="11" fontWeight="800" fill={C.gold}>{linieText}</T>
        </g>
      )}
      <line x1={L} y1={U} x2={R} y2={U} stroke={C.tinte} strokeWidth="1" />
      <line x1={L} y1={O - 4} x2={L} y2={U} stroke={C.tinte} strokeWidth="1" />
      {yMarken.map((m) => (
        <g key={m.v}>
          <line x1={L - 3} y1={Y(m.v)} x2={L} y2={Y(m.v)} stroke={C.tinte} strokeWidth="1" />
          <T x={L - 5} y={Y(m.v) + 3.5} textAnchor="end" fontSize="9.5" fill={C.grau}>{m.text}</T>
        </g>
      ))}
      {xMarken.map((n) => <T key={n} x={X(n)} y={U + 13} textAnchor="middle" fontSize="9.5" fill={C.grau}>{n}</T>)}
      <T x={R} y={U + 24} textAnchor="end" fontSize="9.5" fontWeight="700" fill={C.grau}>n</T>
      {n0 !== null && n0 <= N && (
        <g>
          <line x1={X(n0) - (R - L - 12) / Math.max(1, N - 1) / 2} y1={O} x2={X(n0) - (R - L - 12) / Math.max(1, N - 1) / 2} y2={U}
            stroke={C.seeTief} strokeWidth="1.2" strokeDasharray="3 3" />
          <F x={Math.min(X(n0) + 2, R - 52)} y={O + 12} g={11} fontWeight="800" fill={C.seeTief} teile={["n", { u: "0" }, ` = ${n0}`]} />
        </g>
      )}
      {werte.map((v, i) => {
        if (v === null || !Number.isFinite(v)) return null;
        const n = i + 1;
        const gold = (n0 !== null && n >= n0) || (markiert !== null && n >= markiert);
        return <circle key={n} cx={X(n)} cy={Y(v)} r={r} fill={gold ? C.flaggold : g !== null || markiert !== null ? C.weiss : C.see}
          stroke={gold ? C.gold : C.see} strokeWidth={N <= 60 ? 1.3 : 0.9} />;
      })}
    </svg>
  );
}

/* Zahl für die Kacheln: höchstens vier gültige Ziffern, große Zahlen ganz */
const TIEF = "₀₁₂₃₄₅₆₇₈₉";
const tief = (n) => String(n).replace(/\d/g, (z) => TIEF[z]);
const sigText = (x) => (Math.abs(x) >= 1000 ? dk(x, 0) : Math.abs(x) >= 1 ? dk(x, 3) : dk(x, 4));
const MONOTON = { steigend: "steigend", fallend: "fallend", konstant: "konstant", keine: "nicht monoton" };
const zahlTex = (b) => zTex(b);
function laborFormel(art, p) {
  if (art === "arith") {
    const d = p.d2 / 2;
    if (d === 0) return `a_n = ${dk(p.a1)}`;
    return `a_n = ${dk(p.a1)} + (n − 1) \\cdot ${d < 0 ? `(${dk(d)})` : dk(d)}`;
  }
  if (art === "geo") {
    const q = p.k / 20;
    return `a_n = ${q < 0 ? `(${dk(q, 2)})` : dk(q, 2)}^{n − 1}`;
  }
  if (art === "kehr") return "a_n = \\frac{1}{n}";
  return "H_n = 1 + \\frac{1}{2} + \\frac{1}{3} + \\ldots + \\frac{1}{n}";
}
function laborSatz(art, p, eig, eps, n0, nS) {
  const e = dk(eps.z / eps.n, 2);
  if (art === "harm") return `$H_n$ wächst über jede Schranke, nur sehr langsam: Über ${p.S} kommt die Summe erst ab $n = ${nS}$. Rechts: Die Glieder $\\frac{1}{n}$ gehen trotzdem gegen 0.`;
  if (art === "arith" && p.d2 !== 0) return `Die Glieder ${p.d2 > 0 ? "wachsen" : "fallen"} bei jedem Schritt um ${dk(Math.abs(p.d2 / 2))} – ${p.d2 > 0 ? "über" : "unter"} jede Grenze. Kein Grenzwert, also auch kein Schlauch; die Partialsummen haben ebenfalls keinen Grenzwert.`;
  if (art === "geo" && Math.abs(p.k) > 20) return "$|q| > 1$: Die Glieder wachsen dem Betrag nach über jede Grenze. Kein Grenzwert, und die Reihe hat keine endliche Summe.";
  if (art === "geo" && p.k === -20) return "$q = −1$: Die Glieder springen zwischen 1 und −1 hin und her – kein Grenzwert. Die Partialsummen springen zwischen 1 und 0.";
  const g = `$|a_n − ${zahlTex(eig.g)}| < ${e}$`;
  const basis = `Ab $n_0 = ${n0}$ liegen alle Glieder im Schlauch: ${g}.`;
  if (art === "geo" && p.k === 20) return `$q = 1$: Alle Glieder sind 1, ${basis} Aber $1 + 1 + 1 + \\ldots$ wächst über jede Grenze.`;
  if (art === "arith") return `Konstante Folge: ${basis} Die Reihe ${p.a1 === 0 ? "ist 0" : "wächst um " + dk(p.a1) + " pro Glied – keine endliche Summe"}.`;
  if (art === "kehr") return `${basis} Die Partialsummen $1 + \\frac{1}{2} + \\ldots + \\frac{1}{n}$ wachsen aber weiter: Das ist die harmonische Reihe.`;
  return `${basis} Die Partialsummen nähern sich $\\frac{1}{1 − q} = ${zahlTex(eig.reihe)}$.`;
}

function FolgenLabor() {
  const [art, setArt] = useState("geo");
  const [par, setPar] = useState(LABOR_START);
  const [epsI, setEpsI] = useState(EPS_START);
  const p = par[art], eps = EPS_LISTE[epsI];
  const setze = (k, v) => setPar((alt) => ({ ...alt, [art]: { ...alt[art], [k]: v } }));
  const eig = laborEigenschaften(art, p);
  const harm = art === "harm";
  const n0 = harm ? null : laborN0(art, p, eps);
  const nS = harm ? ueberSchranke(p.S) : null;
  const N = harm ? (nS + 4 <= 120 ? Math.max(30, nS + 4) : 120)
    : n0 !== null && n0 + 3 > 30 ? Math.min(120, n0 + Math.max(4, Math.ceil(n0 * 0.15))) : 30;
  const glieder = Array.from({ length: N }, (_, i) => laborGlied(art, p, i + 1));
  const summen = harm ? Array.from({ length: N }, (_, i) => 1 / (i + 1)) : Array.from({ length: N }, (_, i) => laborSumme(art, p, i + 1));
  const epsWert = eps.z / eps.n, gWert = eig.g ? eig.g.z / eig.g.n : null;
  const kachel = (name, inhalt, key) => (
    <div key={key} style={{ background: C.sand, border: `1px solid ${C.linie}`, borderRadius: 12, padding: "8px 10px", minWidth: 0 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: C.grau, marginBottom: 2 }}>{name}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: C.tinte }}>{inhalt}</div>
    </div>
  );
  return (
    <div data-folgen-labor="" data-art={art} data-n0={n0 ?? ""} data-ns={nS ?? ""}>
      <div className="flex flex-wrap gap-2" style={{ marginBottom: 14 }}>
        {LABOR_FOLGEN.map((f) => <Chip key={f.id} aktiv={art === f.id} onClick={() => setArt(f.id)}>{f.name}</Chip>)}
      </div>
      {art === "arith" && (
        <>
          <Regler label="Startwert a₁" wert={p.a1} min={-5} max={5} step={1} anzeige={dk(p.a1)} setzen={(v) => setze("a1", Math.round(v))} />
          <Regler label="Differenz d" hilfe="aₙ₊₁ = aₙ + d" wert={p.d2} min={-4} max={4} step={1} anzeige={dk(p.d2 / 2)} setzen={(v) => setze("d2", Math.round(v))} />
        </>
      )}
      {art === "geo" && (
        <Regler label="Quotient q" hilfe="aₙ₊₁ = q · aₙ, a₁ = 1" wert={p.k} min={-24} max={24} step={1} anzeige={dk(p.k / 20, 2)} setzen={(v) => setze("k", Math.round(v))} />
      )}
      {harm && <Regler label="Schranke S" hilfe="Wann ist Hₙ größer?" wert={p.S} min={1} max={10} step={1} anzeige={String(p.S)} setzen={(v) => setze("S", Math.round(v))} />}
      {!harm && (
        <Regler label="Schlauch ε" hilfe="|aₙ − g| < ε" wert={epsI} min={0} max={EPS_LISTE.length - 1} step={1} anzeige={dk(epsWert, 2)} setzen={(v) => setEpsI(Math.round(v))} />
      )}
      <div style={{ fontSize: 16, color: C.tinte, margin: "4px 0 6px" }}><M t={laborFormel(art, p)} /></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 290px), 1fr))", gap: 12, margin: "6px 0 10px" }}>
        <PunkteBild titel={harm ? "Partialsummen Hₙ" : "Glieder aₙ"} werte={glieder} g={harm ? null : gWert} eps={harm || gWert === null ? null : epsWert}
          n0={harm ? null : n0} linie={harm ? p.S : null} linieText={harm ? `S = ${p.S}` : ""} markiert={harm && nS <= N ? nS : null}
          aria={harm ? `Partialsummen der harmonischen Reihe bis n = ${N}, über ${p.S} ab n = ${nS}` : `Glieder der Folge bis n = ${N}${n0 ? `, ab n₀ = ${n0} im Schlauch` : ""}`} />
        <PunkteBild titel={harm ? "Glieder 1/n der Reihe" : "Partialsummen sₙ = a₁ + … + aₙ"} werte={summen}
          linie={harm ? 0 : eig.reihe ? eig.reihe.z / eig.reihe.n : null} linieText={harm ? "0" : eig.reihe ? `s = ${dk(eig.reihe.z / eig.reihe.n, 3)}` : ""}
          aria={harm ? "Die Glieder 1/n gehen gegen 0" : eig.reihe ? `Partialsummen nähern sich ${dk(eig.reihe.z / eig.reihe.n, 3)}` : "Partialsummen ohne endlichen Grenzwert"} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(max(118px, calc((100% - 16px) / 3)), 1fr))", gap: 8, marginBottom: 10 }}>
        {kachel("Monotonie", MONOTON[eig.monoton], "m")}
        {kachel("Beschränkt", eig.beschraenkt ? "ja" : "nein", "b")}
        {kachel("Grenzwert", eig.g && !harm ? <M t={zahlTex(eig.g)} /> : "keiner", "g")}
        {harm ? kachel(`über ${p.S} ab`, <span data-labor-ns="">n = {nS}</span>, "s")
          : kachel(`n₀ für ε = ${dk(epsWert, 2)}`, <span data-labor-n0="">{n0 ?? "–"}</span>, "n")}
        {kachel("Reihe", eig.reihe && !harm ? <M t={zahlTex(eig.reihe)} /> : "keine Summe", "r")}
        {harm ? kachel(`Glied 1/${N}`, `≈ ${sigText(1 / N)}`, "l")
          : kachel(`Partialsumme s${tief(N)}`, `≈ ${sigText(summen[N - 1])}`, "l")}
      </div>
      <Text s={laborSatz(art, p, eig, eps, n0, nS)} style={{ fontSize: 13.5, color: C.tinte, fontWeight: 300, lineHeight: 1.7, margin: 0 }} />
    </div>
  );
}

/* ======================================================================
   Übungen
   ====================================================================== */
function Feld({ f, wert, setzen, stand, onEnter }) {
  const breite = f.einheit === "€" ? 116 : f.typ === "ganz" ? 92 : 104;
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 16, fontWeight: 500, color: C.tinte }}>
      <span><M t={`${f.label} =`} /></span>
      <MatheFeld modus={f.modus} value={wert} onChange={(e) => setzen(f.k, e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") onEnter(); }}
        aria-label={f.name || f.k} data-feld={f.k} placeholder="?" style={{ ...ZELLE(stand), width: breite }} />
      {f.einheit && <span style={{ fontSize: 13.5, color: C.grau }}>{f.einheit}</span>}
    </label>
  );
}

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

/* Eingabehinweis je Aufgabe */
function hinweis(a) {
  if (a.art === "rekursiv") return a.vorlage === "arith" ? "Explizit: $a_n = a_1 + (n − 1) \\cdot d$. Exakt eingeben, Brüche wie 3/4." : "Explizit: $a_n = a_1 \\cdot q^{n − 1}$. Exakt eingeben, Brüche wie 3/4.";
  if (a.felder.some((f) => f.einheit === "€")) return "Auf Cent gerundet, zum Beispiel 1234,56.";
  if (a.felder.some((f) => f.typ === "gerundet")) return "Auf eine Nachkommastelle gerundet, zum Beispiel 11,1.";
  if (a.felder.some((f) => f.typ === "gekuerzt")) return "Als vollständig gekürzten Bruch, zum Beispiel 7/33.";
  if (a.art === "grenzwert") return "g exakt (ganze Zahl oder Bruch wie 5/4), $n_0$ als ganze Zahl.";
  return "Exakt: ganze Zahl, Dezimalzahl oder Bruch wie 27/2.";
}

function FolgenTrainer() {
  const [art, setArt] = useState("rekursiv");
  const [stufe, setStufe] = useState(1);
  const [auf, setAufRoh] = useState(() => merk(aufgabe("rekursiv", 1)));
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
  const leer = fs.some((f) => !String(ein[f.k] ?? "").trim());
  const pruefen = () => {
    if (leer) return;
    const e = pruefe(auf, ein);
    setErg(e);
    setSerie((x) => ({ n: x.n + 1, ok: x.ok + (e.ok ? 1 : 0) }));
  };
  const weg = <Formeln zeilen={rechenweg(auf)} max={15} farbe={C.see} />;
  return (
    <div>
      <p style={{ ...FLIESS, lineHeight: 1.7, marginBottom: 18 }}>
        Vier Aufgabentypen: aus einer rekursiven Angabe die explizite Formel machen, Summen arithmetischer und geometrischer
        Folgen berechnen, Grenzwert und n₀ für einen ε-Schlauch bestimmen und unendliche geometrische Reihen summieren –
        bis zu periodischen Dezimalzahlen, Achilles und dem springenden Ball.
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        {ARTEN.map((a) => <Chip key={a.id} aktiv={art === a.id} onClick={() => artSetzen(a.id)}>{a.name}</Chip>)}
      </div>
      <Stufen stufe={stufe} setzen={stufeSetzen} />
      <div style={KARTE} data-mm-karte="" data-folgentrainer="" data-art={auf.art} data-stufe={auf.stufe}>
        <Text s={auftrag(auf)} style={{ fontSize: 15, color: C.tinte, fontWeight: 400, lineHeight: 1.75, marginBottom: 10 }} />
        <Text s={hinweis(auf)} style={{ fontSize: 12.5, color: C.grau, fontWeight: 300, marginBottom: 10 }} />
        <div className="flex flex-wrap" style={{ gap: 14, marginBottom: 12 }}>
          {fs.map((f) => (
            <Feld key={f.k} f={f} wert={ein[f.k] ?? ""} setzen={setze} stand={erg ? erg.felder[f.k] : null} onEnter={pruefen} />
          ))}
        </div>
        {erg && erg.ok && (
          <div style={{ borderLeft: `4px solid ${C.see}`, paddingLeft: 16, marginBottom: 14 }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: C.see, marginBottom: 2 }}>Stimmt!</p>
            {weg}
          </div>
        )}
        {erg && !erg.ok && (
          <div style={{ borderLeft: `4px solid ${C.signal}`, paddingLeft: 16, marginBottom: 14 }} data-rueckmeldung="">
            <p style={{ fontSize: 15, fontWeight: 600, color: C.signal, marginBottom: 6 }}>Stimmt noch nicht.</p>
            <Text s={erg.grund || tipp(auf)} style={{ fontSize: 14, color: C.tinte, fontWeight: 300, lineHeight: 1.75 }} />
            {!zeigen && <button type="button" onClick={() => setZeigen(true)} className="mt-3" style={LINK}>Rechenweg zeigen</button>}
            {zeigen && weg}
          </div>
        )}
        {!(erg && erg.ok) && <button type="button" onClick={pruefen} disabled={leer} className="px-6 py-3" style={KNOPF(!leer)}>Prüfen</button>}
      </div>
      <div className="flex flex-wrap gap-3 mt-5">
        <button type="button" onClick={() => neu()} className="px-6 py-3" style={KNOPF(true, C.gruenDunkel)}>Nächste Aufgabe</button>
        {serie.n > 0 && <span className="flex items-center" style={{ fontSize: 13, color: C.grau }}>{serie.ok} von {serie.n} richtig</span>}
      </div>
    </div>
  );
}

/* ======================================================================
   Die Seite
   ====================================================================== */
const ERGEBNIS = { fontSize: 15, color: C.tinte, fontWeight: 500, lineHeight: 1.8, margin: "8px 0 10px" };
const LISTE = { fontSize: 14, color: C.tinte, fontWeight: 300, lineHeight: 1.7, marginBottom: 6 };

export function GfsFolgenSeite({ gehe }) {
  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 22 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 14 }}>
        Kann man unendlich viele Zahlen addieren und trotzdem eine endliche Summe bekommen?
      </h2>
      <Text s={`Leg ein halbes Blatt Papier auf den Tisch, dann ein Viertel, dann ein Achtel und so weiter – ohne Ende. Unendlich viele
        Stücke, aber auf dem Tisch liegt nie mehr als ein ganzes Blatt. Wie kann das sein? Und warum klappt derselbe Trick bei
        $1 + \\frac{1}{2} + \\frac{1}{3} + \\frac{1}{4} + \\ldots$ nicht, obwohl auch dort die Summanden immer kleiner werden?`} style={FLIESS} />
      <Text s={`Um das sauber zu beantworten, brauchst du drei Werkzeuge: Folgen, den Grenzwert und Summenformeln. Wir bauen sie in
        sechs Schritten auf – vom Zählen über den ε-Schlauch bis zur unendlichen geometrischen Reihe und ihrer Grenze.`} style={FLIESS} />

      <FolgenAnimation art="halbieren" offen />

      <Schritt nr="1" titel="Folgen: explizit und rekursiv" />
      <Text s={`Eine Folge ordnet jeder natürlichen Zahl $n = 1, 2, 3, \\ldots$ eine Zahl $a_n$ zu, das $n$-te Glied. Man kann sie auf zwei
        Arten beschreiben. Explizit: Eine Formel liefert jedes Glied direkt aus $n$. Rekursiv: Man gibt den Anfang an und die Regel, wie
        aus einem Glied das nächste entsteht.`} style={FLIESS} />
      <Formeln titel="Dieselbe Folge zweimal" zeilen={[
        "\\text{explizit: } a_n = 2n + 1 \\quad \\Rightarrow \\quad a_1 = 3, \\; a_2 = 5, \\; a_{100} = 201",
        "\\text{rekursiv: } a_1 = 3, \\quad a_{n+1} = a_n + 2",
      ]} max={17} />
      <Text s={`Die explizite Form ist praktisch, wenn du ein Glied weit hinten brauchst: Rekursiv müsstest du für $a_{100}$ neunundneunzig
        Schritte gehen. Die rekursive Form zeigt dafür sofort, wie die Folge wächst.`} style={FLIESS} />
      <Kasten titel="Monotonie und Beschränktheit">
        <ul style={{ margin: "8px 0 10px", paddingLeft: 18, listStyle: "disc" }}>
          <li style={LISTE}><Text s={"Monoton steigend heißt $a_{n+1} \\ge a_n$ für alle $n$, monoton fallend $a_{n+1} \\le a_n$. Mit $>$ bzw. $<$ heißt die Folge streng monoton."} style={{ margin: 0 }} /></li>
          <li style={LISTE}><Text s={"Beschränkt heißt: Es gibt eine Zahl $S$ mit $|a_n| \\le S$ für alle $n$ – die Glieder laufen nicht nach oben oder unten davon."} style={{ margin: 0 }} /></li>
          <li style={LISTE}><Text s={"Beispiele: $a_n = \\frac{1}{n}$ ist streng monoton fallend und beschränkt ($0 < a_n \\le 1$). $a_n = 2n + 1$ steigt und ist unbeschränkt. $a_n = (−1)^n$ springt zwischen $−1$ und $1$: beschränkt, aber nicht monoton."} style={{ margin: 0 }} /></li>
        </ul>
      </Kasten>

      <Schritt nr="2" titel="Arithmetische und geometrische Folgen" />
      <Text s={`Zwei Folgentypen tauchen überall auf. Bei einer arithmetischen Folge kommt in jedem Schritt dieselbe Zahl $d$ dazu, bei einer
        geometrischen Folge wird in jedem Schritt mit demselben Faktor $q$ multipliziert. Von $a_1$ bis $a_n$ sind es $n − 1$ Schritte –
        daher das $n − 1$ in beiden Formeln:`} style={FLIESS} />
      <Formeln zeilen={[
        "\\text{arithmetisch: } a_{n+1} = a_n + d \\quad \\Rightarrow \\quad a_n = a_1 + (n − 1) \\cdot d",
        "\\text{geometrisch: } a_{n+1} = q \\cdot a_n \\quad \\Rightarrow \\quad a_n = a_1 \\cdot q^{n − 1}",
      ]} max={17} />
      <Text s={`Ein Beispiel aus dem Alltag ist der Zinseszins. Legst du $1000$ € zu $2\\,\\%$ Zinsen pro Jahr an, wird das Guthaben jedes Jahr
        mit $1{,}02$ multipliziert – eine geometrische Folge mit $q = 1{,}02$:`} style={FLIESS} />
      <Formeln zeilen={[
        "K_n = 1000 \\cdot 1{,}02^{n}",
        "K_1 = 1020, \\quad K_2 = 1040{,}4, \\quad K_3 = 1061{,}208 \\approx 1061{,}21 \\text{ €}",
      ]} max={17} />

      <Schritt nr="3" titel="Der Grenzwert: der ε-Schlauch" />
      <Text s={`Die Folge $a_n = \\frac{n + 1}{n} = 1 + \\frac{1}{n}$ beginnt mit $2;\\ 1{,}5;\\ 1{,}33\\ldots$ und kommt der $1$ immer näher.
        Was „immer näher“ genau heißt, sagt der ε-Schlauch: Um die Zahl $g$ legen wir einen Streifen, der $ε$ nach oben und $ε$ nach
        unten reicht. Egal wie schmal er ist – ab einem Index $n_0$ müssen alle Glieder darin bleiben.`} style={FLIESS} />
      <Kasten titel="Definition">
        <Text s={`Eine Zahl $g$ heißt Grenzwert der Folge $(a_n)$, wenn es zu jedem $ε > 0$ ein $n_0$ gibt, sodass $|a_n − g| < ε$ für
          alle $n \\ge n_0$ gilt. Man schreibt $\\lim_{n \\to \\infty} a_n = g$ und nennt die Folge konvergent. Eine Folge ohne Grenzwert heißt divergent.`}
          style={ERGEBNIS} />
      </Kasten>
      <FolgenAnimation art="schlauch" />
      <Text s={`Rechnerisch löst man die Ungleichung $|a_n − g| < ε$ nach $n$ auf. Für $a_n = \\frac{1}{n}$ mit $g = 0$ und $ε = 0{,}01$:`} style={FLIESS} />
      <Formeln zeilen={[
        "|a_n − 0| = \\frac{1}{n} < 0{,}01 \\;\\Leftrightarrow\\; n > 100 \\;\\Rightarrow\\; n_0 = 101",
        "\\text{allgemein: } \\frac{1}{n} < ε \\;\\Leftrightarrow\\; n > \\frac{1}{ε}",
      ]} max={17} />
      <Text s={`Zu jedem noch so kleinen $ε$ gibt es also ein passendes $n_0$: $\\lim_{n \\to \\infty} \\frac{1}{n} = 0$. Für $\\frac{n + 1}{n}$ ist
        der Abstand zur $1$ genau derselbe, $\\frac{1}{n}$ – also ist auch $\\lim_{n \\to \\infty} \\frac{n + 1}{n} = 1$. Für die Reihen in Schritt 5
        brauchen wir noch $q^n$ mit $|q| < 1$. Weil $\\ln |q| < 0$ ist, dreht sich beim Teilen das Ungleichheitszeichen um:`} style={FLIESS} />
      <Formeln zeilen={[
        "|q|^{n} < ε \\;\\Leftrightarrow\\; n \\cdot \\ln |q| < \\ln ε \\;\\Leftrightarrow\\; n > \\frac{\\ln ε}{\\ln |q|}",
        "q = 0{,}5, \\; ε = 0{,}001: \\quad n > \\frac{\\ln 0{,}001}{\\ln 0{,}5} = 9{,}96\\ldots \\;\\Rightarrow\\; n_0 = 10",
        "\\text{also: } |q| < 1 \\;\\Rightarrow\\; \\lim_{n \\to \\infty} q^{n} = 0",
      ]} max={17} />
      <Text s={`Nicht jede Folge hat einen Grenzwert. $(−1)^n$ springt zwischen $−1$ und $1$: Ein Schlauch mit $ε = \\frac{1}{2}$ ist nur $1$ breit und
        kann die beiden Werte im Abstand $2$ nie zugleich enthalten. Wichtig ist auch der Satz: Eine monotone und beschränkte Folge ist konvergent.
        Und ein Grenzwert steckt schon in der Ableitung: $f′(x_0) = \\lim_{h \\to 0} \\frac{f(x_0 + h) − f(x_0)}{h}$ ist der Grenzwert der Sekantensteigungen.`} style={FLIESS} />

      <Schritt nr="4" titel="Summen: Gauß und der Trick mit q" />
      <Text s={`Für die Summe der ersten $n$ natürlichen Zahlen schreibt man sie einmal vorwärts und einmal rückwärts untereinander. Jedes Paar
        ergibt $n + 1$, und es gibt $n$ Paare:`} style={FLIESS} />
      <Formeln zeilen={[
        "s_n = 1 + 2 + \\ldots + n",
        "s_n = n + (n − 1) + \\ldots + 1",
        "2s_n = (n + 1) + (n + 1) + \\ldots + (n + 1) = n(n + 1)",
        "s_n = \\frac{n(n + 1)}{2}, \\quad 1 + 2 + \\ldots + 100 = \\frac{100 \\cdot 101}{2} = 5050",
      ]} max={17} />
      <FolgenAnimation art="gauss" />
      <Text s={`Derselbe Trick funktioniert für jede arithmetische Folge: Erstes plus letztes Glied, zweites plus vorletztes und so weiter ergeben
        immer dasselbe, also $s_n = \\frac{n(a_1 + a_n)}{2}$. Für eine geometrische Folge hilft ein anderer Trick: Man multipliziert die Summe mit
        $q$ und zieht ab. Fast alles hebt sich weg:`} style={FLIESS} />
      <Formeln zeilen={[
        "s_n = a_1 + a_1q + a_1q^{2} + \\ldots + a_1q^{n − 1}",
        "q \\cdot s_n = a_1q + a_1q^{2} + \\ldots + a_1q^{n − 1} + a_1q^{n}",
        "s_n − q \\cdot s_n = a_1 − a_1q^{n} \\;\\Rightarrow\\; s_n(1 − q) = a_1(1 − q^{n})",
        "s_n = a_1 \\cdot \\frac{1 − q^{n}}{1 − q} \\quad (q \\ne 1)",
      ]} max={17} />
      <Text s={"Beispiel: $1 + 2 + 4 + \\ldots + 512$ hat $10$ Summanden mit $a_1 = 1$ und $q = 2$:"} style={FLIESS} />
      <Formeln zeilen={["s_{10} = \\frac{1 − 2^{10}}{1 − 2} = \\frac{−1023}{−1} = 1023"]} max={17} />
      <Text s={`Auch ein Sparplan ist eine geometrische Summe: Wer zu Beginn jedes Jahres $R$ Euro einzahlt und $p$ Zinsen bekommt, hat nach $n$ Jahren
        $R(1 + p) + R(1 + p)^2 + \\ldots + R(1 + p)^n$ auf dem Konto – die erste Einzahlung ist dann $n$ Jahre lang gewachsen, die letzte ein Jahr.`} style={FLIESS} />

      <Schritt nr="5" titel="Unendlich viele Summanden: die geometrische Reihe" />
      <Text s={`Jetzt kommt die Antwort auf die Leitfrage. Lässt man in der Summenformel $n$ gegen unendlich gehen, bleibt für $|q| < 1$ nur
        der Teil ohne $q^n$ übrig, denn $q^n \\to 0$ (Schritt 3):`} style={FLIESS} />
      <Formeln zeilen={[
        "s_n = \\frac{a_1}{1 − q} − \\frac{a_1}{1 − q} \\cdot q^{n} \\;\\to\\; \\frac{a_1}{1 − q}",
        "a_1 + a_1q + a_1q^{2} + \\ldots = \\frac{a_1}{1 − q} \\quad \\text{für } |q| < 1",
      ]} max={17} />
      <Kasten titel="Ergebnis">
        <Text s={"Unendlich viele Summanden können eine endliche Summe haben. Beim halbierten Blatt ist $a_1 = \\frac{1}{2}$ und $q = \\frac{1}{2}$ – mehr als ein Blatt wird es nie:"} style={ERGEBNIS} />
        <Formeln zeilen={["\\frac{1}{2} + \\frac{1}{4} + \\frac{1}{8} + \\ldots = \\frac{\\frac{1}{2}}{1 − \\frac{1}{2}} = 1"]} max={17} />
      </Kasten>
      <Text s={`Dieselbe Formel erklärt, warum $0{,}\\overline{9}$ genau $1$ ist, und macht jede periodische Dezimalzahl zum Bruch.
        Die Ziffern nach dem Komma sind die Glieder einer geometrischen Reihe mit $q = \\frac{1}{10}$:`} style={FLIESS} />
      <Formeln zeilen={[
        "0{,}\\overline{9} = \\frac{9}{10} + \\frac{9}{100} + \\ldots = \\frac{\\frac{9}{10}}{1 − \\frac{1}{10}} = \\frac{\\frac{9}{10}}{\\frac{9}{10}} = 1",
        "0{,}\\overline{3} = \\frac{3}{10} + \\frac{3}{100} + \\ldots = \\frac{\\frac{3}{10}}{\\frac{9}{10}} = \\frac{1}{3}",
      ]} max={17} />
      <FolgenAnimation art="achilles" />
      <Text s={`Auch Zenons Paradox löst sich so auf: Die Etappenzeiten $10 + 1 + 0{,}1 + \\ldots$ bilden eine geometrische Reihe mit $q = 0{,}1$.
        Und ein Ball, der aus $2$ m fällt und jedes Mal auf $60\\,\\%$ seiner Höhe zurückspringt, legt insgesamt nur eine endliche Strecke zurück –
        jeder Rücksprung geht hoch und wieder runter:`} style={FLIESS} />
      <Formeln zeilen={[
        "T = 10 + 1 + 0{,}1 + \\ldots = \\frac{10}{1 − 0{,}1} = \\frac{100}{9} \\approx 11{,}1 \\text{ s}",
        "s = 2 + 2 \\cdot (1{,}2 + 0{,}72 + \\ldots) = 2 + 2 \\cdot \\frac{1{,}2}{1 − 0{,}6} = 2 + 2 \\cdot 3 = 8 \\text{ m}",
      ]} max={17} />

      <Schritt nr="6" titel="Die Grenze: die harmonische Reihe" />
      <Text s={`Reicht es also, dass die Summanden gegen $0$ gehen? Nein. Die harmonische Reihe $1 + \\frac{1}{2} + \\frac{1}{3} + \\ldots$ hat Glieder,
        die gegen $0$ gehen – und trotzdem keine endliche Summe. Der Beweis bündelt die Glieder: In jedem Bündel ist jedes Glied mindestens
        so groß wie das letzte.`} style={FLIESS} />
      <Formeln zeilen={[
        "1 + \\frac{1}{2} + \\left(\\frac{1}{3} + \\frac{1}{4}\\right) + \\left(\\frac{1}{5} + \\ldots + \\frac{1}{8}\\right) + \\ldots",
        "\\ge 1 + \\frac{1}{2} + \\left(2 \\cdot \\frac{1}{4}\\right) + \\left(4 \\cdot \\frac{1}{8}\\right) + \\ldots",
        "= 1 + \\frac{1}{2} + \\frac{1}{2} + \\frac{1}{2} + \\ldots",
        "\\text{nach } 2^{k} \\text{ Gliedern: } H_{2^k} \\ge 1 + \\frac{k}{2}",
      ]} max={16} />
      <Text s={`Weil $1 + \\frac{k}{2}$ über jede Grenze wächst, wächst auch die harmonische Reihe über jede Grenze – nur sehr langsam: Über $10$
        kommt sie erst nach $12\\,367$ Gliedern. Dass die Glieder gegen $0$ gehen, ist also notwendig für eine endliche Summe, aber nicht
        hinreichend. Für die geometrische Reihe heißt das: Bei $|q| \\ge 1$ gehen schon die Glieder nicht gegen $0$, eine endliche Summe gibt es nicht.`} style={FLIESS} />
      <FolgenAnimation art="harmonisch" />
      <Kasten titel="Zum Mitnehmen">
        <Text s={`Unendlich viele Summanden haben eine endliche Summe, wenn sie schnell genug kleiner werden – zum Beispiel geometrisch mit
          $|q| < 1$: $a_1 + a_1q + a_1q^2 + \\ldots = \\frac{a_1}{1 − q}$. Dass die Summanden nur gegen $0$ gehen, reicht nicht.`} style={ERGEBNIS} />
      </Kasten>

      <div style={{ ...KARTE, margin: "22px 0" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 12 }}>Labor: Folge wählen, Schlauch verengen, Partialsummen beobachten</p>
        <FolgenLabor />
      </div>

      <Trenner />

      <Kicker>Jetzt selbst üben</Kicker>
      <H3>Rekursiv, Summen, Grenzwerte, Reihen</H3>
      <FolgenTrainer />

      {gehe && (
        <div style={{ ...KARTE, marginTop: 22, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: C.tinte, marginBottom: 4 }}>Vom Grenzwert zur Ableitung</p>
            <p style={{ fontSize: 13.5, color: C.grau, fontWeight: 300, lineHeight: 1.6 }}>Sekanten werden zur Tangente – der Grenzwert, mit dem die Differenzialrechnung beginnt.</p>
          </div>
          <button type="button" onClick={() => gehe({ ansicht: "diffq" })} className="px-5 py-3" style={KNOPF(true)}>Zum Differenzenquotienten</button>
        </div>
      )}

      <Trenner />

      <Kicker>Deine GFS</Kicker>
      <H3>Der rote Faden für den Vortrag</H3>
      <RoterFaden gliederung={GLIEDERUNG} tipps={TIPPS} hinweis="den Abschnitt „Summen und die geometrische Reihe“" />

      <div style={{ height: 8 }} />
      <Kicker>Kolloquium</Kicker>
      <H3>Die Fragen nach dem Vortrag trainieren</H3>
      <Kolloquium fragen={KOLLOQUIUM} speicher="mm-gfs-folgen-kolloquium" />
    </div>
  );
}
