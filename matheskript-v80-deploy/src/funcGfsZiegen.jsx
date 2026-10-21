import React, { useState, useRef, useEffect } from "react";
import { C } from "./base1.jsx";
import { Text } from "./func3.jsx";
import { FLIESS, KARTE, ZELLE, Formeln, Schritt, Kasten, Chip, PlusMinus, Kicker, H3, Trenner, Inline, RoterFaden, Kolloquium } from "./funcGfsBausteine.jsx";
import { lauf } from "./funcErklaeranimation.jsx";
import { AnimKarte } from "./funcAnimKarte.jsx";
import {
  zufallszahlen, simuliere, moderatorOeffnet, dk, bText,
  ARTEN, aufgabe, felder, auftrag, pruefe, rechenweg, tipp, FAELLE, dreihundert,
  GLIEDERUNG, TIPPS, KOLLOQUIUM,
} from "./gfsZiegen.js";

/* ============================================================
   Kurs GFS – Themenseite „Das Ziegenproblem“
   (Lambacher Schweizer 9 BW, Kapitel VI Wahrscheinlichkeit)
   Aufbau wie die Dosen-Seite: Leitfrage · Herleitung in sechs Schritten
   (Regeln, Fallunterscheidung, Baumdiagramm, 300 Spiele, Wissen des
   Moderators, n Türen) · fünf Erkläranimationen · Labor (drei Türen mit
   Strichliste, Schnellsimulation mit 3/10/100 Türen) · Übungen aus vier
   Generatoren · roter Faden · Kolloquium.
   Logik in gfsZiegen.js (getestet in tests/gfsZiegen.test.mjs).
   ============================================================ */

const KNOPF = (aktiv = true, farbe = C.see) => ({
  background: aktiv ? farbe : C.hellgrau, color: C.weiss, border: "none", borderRadius: 999, fontSize: 15, fontWeight: 600,
  fontFamily: "inherit", cursor: aktiv ? "pointer" : "default",
});
const LINK = { background: "none", border: "none", color: C.see, fontSize: 13, fontFamily: "inherit", cursor: "pointer", padding: 0, textDecoration: "underline" };
/* aktuelle Aufgabe für automatische Prüfungen (tests/ui/gfsziegen.ui.py) */
const merk = (a) => { if (typeof window !== "undefined") window.__gzAufgabe = a; return a; };
const leise = () => typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const T = (props) => <text fontFamily="inherit" {...props} />;
const mix = (a, b, p) => a + (b - a) * p;
const fenster = (t, a, b, c, d) => lauf(t, a, b) * (1 - lauf(t, c, d));

/* ======================================================================
   Bildbausteine: Ziege, Auto, Tür (in allen Bildern dieselben)
   ====================================================================== */

/* Ziege (Blick nach links) in einem 40 × 34-Kasten; (x, y) = Mitte unten */
function ZiegeForm({ x, y, s = 1, farbe = C.tinte, auge = C.weiss, o = 1 }) {
  if (o <= 0.001) return null;
  return (
    <g opacity={o} transform={`translate(${x - 20 * s} ${y - 34 * s}) scale(${s})`}>
      <g stroke={farbe} strokeWidth="2.6" strokeLinecap="round">
        <line x1="15.5" y1="23" x2="14.5" y2="33" /><line x1="19.5" y1="24" x2="19.5" y2="33" />
        <line x1="28.5" y1="24" x2="28.5" y2="33" /><line x1="32.5" y1="23" x2="33.5" y2="33" />
      </g>
      <ellipse cx="24" cy="19" rx="11.5" ry="7" fill={farbe} />
      <path d="M14 17 L9.5 10 L14.5 8.6 L18.5 14.5 Z" fill={farbe} />
      <ellipse cx="8.6" cy="10.6" rx="5.1" ry="3.5" transform="rotate(-18 8.6 10.6)" fill={farbe} />
      <ellipse cx="13" cy="8.6" rx="2.8" ry="1.2" transform="rotate(28 13 8.6)" fill={farbe} />
      <path d="M8.6 7.6 Q9.6 2 15.4 2.4" fill="none" stroke={farbe} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M5 12.4 L4.4 17.2 L7.4 13.2 Z" fill={farbe} />
      <path d="M35 15 L38.6 11.2 L36.8 16.2 Z" fill={farbe} />
      <circle cx="7.4" cy="9.8" r="0.85" fill={auge} />
    </g>
  );
}
const Ziege = React.memo(ZiegeForm);

/* Auto in einem 44 × 22-Kasten; (x, y) = Mitte unten */
function AutoForm({ x, y, s = 1, farbe = C.flaggold, dunkel = C.seeTief, o = 1 }) {
  if (o <= 0.001) return null;
  return (
    <g opacity={o} transform={`translate(${x - 22 * s} ${y - 22 * s}) scale(${s})`}>
      <path d="M3 17 Q2 12 6 11 L12 10 L16 4.5 Q17.5 3 20 3 L29 3 Q31.5 3 33 5 L36.5 10 L40 11 Q43 12 42.5 17 Z" fill={farbe} />
      <path d="M17.6 5.2 L23.4 5.2 L23.4 9.6 L14.7 9.6 Z" fill={C.weiss} opacity="0.85" />
      <path d="M25.3 5.2 L29.4 5.2 Q30.6 5.2 31.4 6.2 L34 9.6 L25.3 9.6 Z" fill={C.weiss} opacity="0.85" />
      <circle cx="12" cy="17.5" r="3.9" fill={dunkel} /><circle cx="12" cy="17.5" r="1.6" fill={C.silber} />
      <circle cx="33" cy="17.5" r="3.9" fill={dunkel} /><circle cx="33" cy="17.5" r="1.6" fill={C.silber} />
    </g>
  );
}
const Auto = React.memo(AutoForm);

/* Tür: Rahmen, Inhalt dahinter, Türblatt klappt beim Öffnen nach links (auf = 0 … 1) */
function Tuer({ x, y, b, h, nr, auf = 0, inhalt = null, gewaehlt = false, o = 1, schrift, blass = 0 }) {
  if (o <= 0.001) return null;
  const r = Math.max(2, b * 0.07);
  const blatt = b * (1 - 0.84 * auf);
  const fs = schrift || Math.max(7, b * 0.3);
  return (
    <g opacity={o * (1 - blass)}>
      <rect x={x} y={y} width={b} height={h} rx={r} fill="#E9EEF7" stroke={C.linie} strokeWidth="1" />
      {auf > 0.02 && inhalt === "ziege" && <Ziege x={x + b / 2 + b * 0.06} y={y + h - b * 0.08} s={(b * 0.72) / 40} farbe={C.tinte} />}
      {auf > 0.02 && inhalt === "auto" && <Auto x={x + b / 2 + b * 0.06} y={y + h - b * 0.1} s={(b * 0.78) / 44} />}
      <rect x={x} y={y} width={blatt} height={h} rx={r} fill={C.seeTief} />
      <rect x={x + b * 0.1 * (1 - auf)} y={y + h * 0.08} width={Math.max(0, blatt - b * 0.2 * (1 - auf))} height={h * 0.38} rx={r * 0.6} fill="none" stroke="rgba(237,187,0,0.35)" strokeWidth="1" />
      {auf < 0.6 && <circle cx={x + blatt - b * 0.13} cy={y + h * 0.56} r={Math.max(1.2, b * 0.035)} fill={C.flaggold} opacity={1 - auf / 0.6} />}
      {nr !== undefined && <T x={x + blatt / 2} y={y + h * 0.3 + fs * 0.36} textAnchor="middle" fontSize={fs} fontWeight="800" fill={C.flaggold} opacity={Math.max(0, 1 - auf * 1.6)}>{nr}</T>}
      {gewaehlt && <rect x={x - 2} y={y - 2} width={b + 4} height={h + 4} rx={r + 2} fill="none" stroke={C.flaggold} strokeWidth={Math.max(1.6, b * 0.04)} />}
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

/* ======================================================================
   Kopfbild (viewBox 160 × 120): deine Tür 1/3, Moderator zeigt die Ziege,
   die übrige Tür trägt jetzt 2/3 – die Zahlen sind exakt die des Spiels.
   ====================================================================== */
export function ZiegenBild() {
  const B = 34, H = 58, Y = 30, X = [12, 63, 114];
  return (
    <svg className="gtk-bild" viewBox="0 0 160 120" role="img" style={{ width: "100%", maxWidth: 300, margin: "10px auto 0", justifySelf: "center" }}
      aria-label="Drei Türen: deine Wahl hat die Gewinnchance 1/3, hinter der geöffneten Tür steht eine Ziege, die übrige Tür hat 2/3">
      <defs>
        <linearGradient id="gzk-tuer" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#0B1B44" /><stop offset="50%" stopColor="#1A3778" /><stop offset="100%" stopColor="#0B1B44" /></linearGradient>
        <linearGradient id="gzk-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#FFE9A0" /><stop offset="60%" stopColor="#EDBB00" /><stop offset="100%" stopColor="#C9971A" /></linearGradient>
        <radialGradient id="gzk-glut" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#EDBB00" stopOpacity="0.7" /><stop offset="100%" stopColor="#EDBB00" stopOpacity="0" /></radialGradient>
        <linearGradient id="gzk-boden" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#EDBB00" stopOpacity="0" /><stop offset="50%" stopColor="#EDBB00" stopOpacity="0.7" /><stop offset="100%" stopColor="#EDBB00" stopOpacity="0" /></linearGradient>
      </defs>
      <ellipse className="gtk-glimmen" cx={X[1] + B / 2} cy={Y + H / 2} rx="30" ry="40" fill="url(#gzk-glut)" />
      <rect x="4" y={Y + H + 1} width="152" height="1.4" rx="0.7" fill="url(#gzk-boden)" />
      {X.map((x, i) => (
        <g key={i} className="gtk-auf" style={{ animationDelay: `${0.1 * i}s` }}>
          <rect x={x} y={Y} width={B} height={H} rx="3" fill={i === 2 ? "#1B2233" : "url(#gzk-tuer)"} stroke={i === 0 ? "#EDBB00" : "rgba(237,187,0,0.35)"} strokeWidth={i === 0 ? 1.8 : 0.8} />
          {i < 2 && <T x={x + B / 2} y={Y + 22} textAnchor="middle" fontFamily="Montserrat, sans-serif" fontSize="13" fontWeight="800" fill="#EDBB00">{i + 1}</T>}
          {i < 2 && <circle cx={x + B - 6} cy={Y + H * 0.56} r="1.6" fill="#EDBB00" />}
        </g>
      ))}
      {/* geöffnete Tür 3: Türblatt zur Seite, Ziege */}
      <g className="gtk-auf" style={{ animationDelay: ".35s" }}>
        <rect x={X[2]} y={Y} width="5" height={H} rx="1.5" fill="url(#gzk-tuer)" />
        <Ziege x={X[2] + B / 2 + 2} y={Y + H - 3} s={0.66} farbe="#E9ECF1" auge="#1B2233" />
      </g>
      {/* die 1/3 von Tür 3 wandert zu Tür 2 */}
      <g className="gtk-auf" style={{ animationDelay: ".55s" }}>
        <path d={`M${X[2] + B / 2} ${Y - 4} Q${X[2] - 4} ${Y - 22} ${X[1] + B / 2 + 4} ${Y - 6}`} fill="none" stroke="#EDBB00" strokeWidth="1.3" strokeDasharray="2.6 2.4" />
        <path d={`M${X[1] + B / 2 + 1} ${Y - 10.5} L${X[1] + B / 2 + 3.6} ${Y - 4.4} L${X[1] + B / 2 + 8.8} ${Y - 8.6}`} fill="none" stroke="#EDBB00" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {/* Gewinnchancen */}
      <g className="gtk-auf" style={{ animationDelay: ".7s" }}>
        <rect x={X[0] + B / 2 - 15} y="96" width="30" height="16" rx="8" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.45)" strokeWidth="0.8" />
        <T x={X[0] + B / 2} y="107.6" textAnchor="middle" fontFamily="Montserrat, sans-serif" fontSize="10" fontWeight="800" fill="#FFFFFF">1/3</T>
        <rect x={X[1] + B / 2 - 15} y="96" width="30" height="16" rx="8" fill="url(#gzk-gold)" />
        <T x={X[1] + B / 2} y="107.6" textAnchor="middle" fontFamily="Montserrat, sans-serif" fontSize="10" fontWeight="800" fill="#0B0C10">2/3</T>
        <T x={X[2] + B / 2} y="107.6" textAnchor="middle" fontFamily="Montserrat, sans-serif" fontSize="10" fontWeight="700" fill="rgba(255,255,255,0.55)">0</T>
      </g>
    </svg>
  );
}

/* ======================================================================
   Erkläranimationen (Szenen sind reine Funktionen der Zeit; Schlussbild = Standbild)
     spiel    – Ablauf der Show und die Wanderung der 1/3
     baum     – Baum der drei Anfangswahlen: Bleiben 1 Ast, Wechseln 2 Äste
     wissen   – der Moderator weiß Bescheid (2 von 3) gegen den ahnungslosen (2 von 4)
     zahlen   – Gesetz der großen Zahlen: 1000 Runden, relative Häufigkeiten
     hundert  – 100 Türen: 1/100 gegen 99/100
   ====================================================================== */

/* 1 · Das Spiel */
const S_DAUER = 24;
const sSchritte = () => [
  { von: 0, text: "Drei geschlossene Türen. Hinter einer steht ein Auto, hinter den beiden anderen je eine Ziege. Solange niemand etwas weiß, hat jede Tür die Chance 1/3." },
  { von: 4.5, text: "Der Kandidat zeigt auf Tür 1. Sie bleibt zu. Seine Tür hat 1/3 – die beiden anderen zusammen 2/3." },
  { von: 9, text: "Der Moderator weiß, wo das Auto steht. Von den beiden anderen Türen öffnet er eine mit Ziege, hier Tür 3. Das kann er immer – an den 1/3 von Tür 1 ändert sein Öffnen deshalb nichts." },
  { von: 14, text: "Die 2/3 der beiden anderen Türen liegen jetzt ganz auf Tür 2, denn Tür 3 ist als Ziegentür enttarnt. Die Türen 1 und 2 sind also nicht gleich gut." },
  { von: 18.5, text: "Bleiben gewinnt mit 1/3, Wechseln mit 2/3. Wer wechselt, verdoppelt seine Gewinnchance." },
];
function sZeichne(t) {
  const B = 78, H = 124, Y = 72, X = [24, 141, 258], mx = X.map((x) => x + B / 2);
  const ein = (i) => lauf(t, 0.2 + i * 0.25, 1.2 + i * 0.25);
  const pillen = lauf(t, 1.6, 2.6);
  const wahl = lauf(t, 4.8, 5.6);
  const gruppe = fenster(t, 6, 7.2, 13.6, 14.4);
  const auf3 = lauf(t, 9.4, 10.8);
  const wandern = lauf(t, 14.4, 16);
  const ende = lauf(t, 18.8, 20.2);
  const glanz = lauf(t, 15.6, 16.6);
  return (
    <g>
      {glanz > 0.001 && <ellipse cx={mx[1]} cy={Y + H / 2} rx={B * 0.85} ry={H * 0.66} fill={C.flaggold} opacity={0.18 * glanz} />}
      {X.map((x, i) => (
        <Tuer key={i} x={x} y={Y} b={B} h={H} nr={i + 1} o={ein(i)} auf={i === 2 ? auf3 : 0} inhalt={i === 2 ? "ziege" : null} gewaehlt={i === 0 && wahl > 0.5} schrift={26} />
      ))}
      <T x={mx[0]} y={Y - 12} textAnchor="middle" fontSize="12" fontWeight="800" fill={C.gold} opacity={wahl}>Deine Wahl</T>
      <T x={mx[2]} y={Y - 12} textAnchor="middle" fontSize="12" fontWeight="800" fill={C.see} opacity={lauf(t, 9, 9.8)}>Moderator öffnet</T>
      {/* Gewinnchancen unter den Türen */}
      <Pille x={mx[0]} y={Y + H + 28} text="1/3" o={pillen} farbe={C.see} />
      <Pille x={mx[1]} y={Y + H + 28} text={wandern > 0.98 ? "2/3" : "1/3"} o={pillen} farbe={wandern > 0.98 ? C.gold : C.see} voll={wandern > 0.98} />
      <Pille x={mix(mx[2], mx[1], wandern)} y={Y + H + 28} text="1/3" o={pillen * (1 - lauf(t, 15.6, 16))} farbe={C.see} />
      <T x={mx[2]} y={Y + H + 29} textAnchor="middle" fontSize="14" fontWeight="800" fill={C.hellgrau} opacity={lauf(t, 16, 16.8)}>0</T>
      {/* Klammer: die beiden anderen zusammen */}
      {gruppe > 0.001 && (
        <g opacity={gruppe}>
          <rect x={X[1] - 6} y={Y + H + 6} width={X[2] + B - X[1] + 12} height="36" rx="18" fill="none" stroke={C.gold} strokeWidth="1.6" strokeDasharray="5 4" />
          <T x={(mx[1] + mx[2]) / 2} y={Y + H + 62} textAnchor="middle" fontSize="12.5" fontWeight="800" fill={C.gold}>zusammen 2/3</T>
        </g>
      )}
      {/* Ergebnis */}
      {ende > 0.001 && (
        <g opacity={ende}>
          <Pille x={110} y={34} text="Bleiben: 1/3" farbe={C.see} breite={128} />
          <Pille x={250} y={34} text="Wechseln: 2/3" farbe={C.gold} voll breite={136} />
        </g>
      )}
    </g>
  );
}

/* 2 · Baum der drei Anfangswahlen */
const B_DAUER = 27;
const bSchritte = () => [
  { von: 0, text: "Der Kandidat wählt eine Tür. Dahinter kann das Auto stehen oder Ziege A oder Ziege B – drei gleich wahrscheinliche Fälle, je 1/3." },
  { von: 6, text: "Dann öffnet der Moderator. Hat der Kandidat das Auto, darf er eine der beiden Ziegen zeigen. Hat der Kandidat eine Ziege, bleibt ihm keine Wahl: Er muss die andere Ziege zeigen." },
  { von: 13, text: "Wer bleibt, behält seine erste Tür. Er gewinnt nur im obersten Ast – also mit 1/3." },
  { von: 18, text: "Wer wechselt, bekommt die einzige Tür, die noch zu ist. In beiden Ziegen-Ästen steht dort das Auto." },
  { von: 22, text: "Summenregel: Wechseln gewinnt mit 1/3 + 1/3 = 2/3. In jedem Ast gewinnt genau eine der beiden Strategien – deshalb ergeben 1/3 und 2/3 zusammen 1." },
];
function bZeichne(t) {
  const R = { x: 18, y: 166 }, YS = [72, 166, 260];
  const K1 = 112, K2 = 206, KB = 288, KW = 334;
  const name = ["Auto", "Ziege A", "Ziege B"];
  const zeigt = ["zeigt A oder B", "muss B zeigen", "muss A zeigen"];
  const kopf = lauf(t, 0.2, 1);
  const spalteB = lauf(t, 13.2, 14.2), spalteW = lauf(t, 18.2, 19.2);
  const summe = lauf(t, 22.2, 23.6);
  return (
    <g>
      <g opacity={kopf} fontFamily="inherit">
        <T x={K1} y="24" textAnchor="middle" fontSize="10" fontWeight="700" fill={C.hellgrau} letterSpacing="0.06em">ERSTE WAHL</T>
        <T x={K2} y="24" textAnchor="middle" fontSize="10" fontWeight="700" fill={C.hellgrau} letterSpacing="0.06em" opacity={lauf(t, 6, 6.8)}>MODERATOR</T>
      </g>
      <T x={KB} y="24" textAnchor="middle" fontSize="9" fontWeight="800" fill={C.see} opacity={spalteB}>bleiben</T>
      <T x={KW + 2} y="24" textAnchor="middle" fontSize="9" fontWeight="800" fill={C.gold} opacity={spalteW}>wechseln</T>
      {spalteB > 0.001 && <rect x={KB - 23} y="34" width="46" height="252" rx="12" fill={C.see} opacity={0.07 * spalteB} />}
      {spalteW > 0.001 && <rect x={KW - 21} y="34" width="42" height="252" rx="12" fill={C.flaggold} opacity={0.16 * spalteW} />}
      <circle cx={R.x} cy={R.y} r="5" fill={C.tinte} opacity={lauf(t, 0.3, 1)} />
      {YS.map((y, i) => {
        const ast = lauf(t, 0.8 + i * 0.4, 2 + i * 0.4);
        const box = lauf(t, 1.8 + i * 0.4, 2.6 + i * 0.4);
        const zahl = lauf(t, 2.8, 3.6);
        const mod = lauf(t, 6.4 + i * 0.6, 7.4 + i * 0.6);
        const muss = i > 0 ? lauf(t, 9.4, 10.4) : 0;
        const auto = i === 0;
        const iconB = lauf(t, 13.6 + i * 0.4, 14.4 + i * 0.4), iconW = lauf(t, 18.6 + i * 0.4, 19.4 + i * 0.4);
        const gewB = auto, gewW = !auto;
        const ex = mix(R.x, K1 - 31, ast), ey = mix(R.y, y, ast);
        return (
          <g key={i}>
            {ast > 0.001 && <line x1={R.x} y1={R.y} x2={ex} y2={ey} stroke={C.tinte} strokeWidth="1.8" strokeLinecap="round" />}
            <T x={(R.x + K1 - 31) / 2 + 4} y={(R.y + y) / 2 + (i === 1 ? -6 : i === 0 ? -4 : 14)} textAnchor="middle" fontSize="12.5" fontWeight="800" fill={C.see} opacity={zahl}>1/3</T>
            <g opacity={box}>
              <rect x={K1 - 31} y={y - 14} width="62" height="28" rx="9" fill={auto ? "#FFF3C4" : C.himmel} stroke={auto ? C.gold : C.see} strokeWidth="1.4" />
              <T x={K1} y={y + 4.5} textAnchor="middle" fontSize="12.5" fontWeight="800" fill={auto ? C.gold : C.seeTief}>{name[i]}</T>
            </g>
            {mod > 0.001 && (
              <g opacity={mod}>
                <line x1={K1 + 31} y1={y} x2={K2 - 43} y2={y} stroke={C.tinte} strokeWidth="1.6" />
                <rect x={K2 - 43} y={y - 14} width="86" height="28" rx="9" fill={C.weiss} stroke={muss > 0.5 ? C.signal : C.linie} strokeWidth={muss > 0.5 ? 1.6 : 1.2} />
                <T x={K2} y={y + 3.6} textAnchor="middle" fontSize="9.8" fontWeight="700" fill={muss > 0.5 ? C.signal : C.tinte}>{zeigt[i]}</T>
              </g>
            )}
            {iconB > 0.001 && (
              <g opacity={iconB}>
                {gewB && <circle cx={KB} cy={y - 2} r="17" fill={C.flaggold} opacity="0.35" />}
                {gewB ? <Auto x={KB} y={y + 7} s={0.58} /> : <Ziege x={KB + 1} y={y + 9} s={0.5} farbe={C.hellgrau} />}
              </g>
            )}
            {iconW > 0.001 && (
              <g opacity={iconW}>
                {gewW && <circle cx={KW} cy={y - 2} r="17" fill={C.flaggold} opacity="0.35" />}
                {gewW ? <Auto x={KW} y={y + 7} s={0.58} /> : <Ziege x={KW + 1} y={y + 9} s={0.5} farbe={C.hellgrau} />}
              </g>
            )}
          </g>
        );
      })}
      <g opacity={summe}>
        <T x={KB} y="306" textAnchor="middle" fontSize="15" fontWeight="800" fill={C.see}>1/3</T>
        <T x={KW} y="306" textAnchor="middle" fontSize="15" fontWeight="800" fill={C.gold}>2/3</T>
        <T x="18" y="306" fontSize="12.5" fontWeight="700" fill={C.tinte}>Wechseln: 1/3 + 1/3 = 2/3</T>
      </g>
    </g>
  );
}

/* 3 · Der Moderator weiß, wo das Auto ist */
const W_DAUER = 28;
const wSchritte = () => [
  { von: 0, text: "Der Kandidat wählt Tür 1. Das Auto steht mit gleicher Wahrscheinlichkeit hinter Tür 1, 2 oder 3 – drei gleich wahrscheinliche Spiele." },
  { von: 5, text: "Der Moderator weiß Bescheid und öffnet nie die Autotür. Steht das Auto hinter Tür 2 oder 3, ist seine Wahl erzwungen: Die Tür, die er stehen lässt, ist genau die Autotür." },
  { von: 11, text: "Wechseln gewinnt in 2 von 3 Spielen. Sein Wissen steckt in der Tür, die er nicht öffnet." },
  { von: 15, text: "Jetzt ein ahnungsloser Moderator: Er öffnet zufällig Tür 2 oder Tür 3. Zusammen mit den drei Autopositionen ergibt das sechs gleich wahrscheinliche Fälle." },
  { von: 21, text: "In zwei Fällen öffnet er die Autotür – die passen nicht zu dem, was wir gesehen haben, und fallen weg. Von den vier übrigen gewinnt Wechseln nur zwei: 1/2. Erst sein Wissen macht Wechseln besser." },
];
function MiniSpiel({ x, y, auto, oeffnet, o = 1, auf = 0, ergebnis, eo = 0, weg = 0 }) {
  if (o <= 0.001) return null;
  const b = 24, h = 34, g = 5, x0 = x - (3 * b + 2 * g) / 2;
  return (
    <g opacity={o * (1 - 0.55 * weg)}>
      <T x={x} y={y - 4} textAnchor="middle" fontSize="9.5" fontWeight="700" fill={C.grau}>Auto hinter Tür {auto}</T>
      {[1, 2, 3].map((n) => (
        <Tuer key={n} x={x0 + (n - 1) * (b + g)} y={y} b={b} h={h} nr={n} schrift={10} gewaehlt={n === 1}
          auf={n === oeffnet ? auf : 0} inhalt={n === oeffnet ? (n === auto ? "auto" : "ziege") : null} />
      ))}
      {eo > 0.001 && <T x={x} y={y + h + 15} textAnchor="middle" fontSize="10.5" fontWeight="800" opacity={eo}
        fill={ergebnis === "auto" ? C.gold : ergebnis === "weg" ? C.signal : C.hellgrau}>
        {ergebnis === "auto" ? "Wechseln: Auto" : ergebnis === "weg" ? "Auto gezeigt" : "Wechseln: Ziege"}</T>}
      {weg > 0.001 && (
        <g opacity={weg} stroke={C.signal} strokeWidth="2.6" strokeLinecap="round">
          <line x1={x0 - 4} y1={y - 2} x2={x0 + 3 * b + 2 * g + 4} y2={y + h + 2} />
          <line x1={x0 + 3 * b + 2 * g + 4} y1={y - 2} x2={x0 - 4} y2={y + h + 2} />
        </g>
      )}
    </g>
  );
}
function wZeichne(t) {
  const XS = [62, 180, 298];
  const A = [{ auto: 1, oeffnet: 3, erg: "ziege" }, { auto: 2, oeffnet: 3, erg: "auto" }, { auto: 3, oeffnet: 2, erg: "auto" }];
  const Bf = [   // Zeile 0: öffnet Tür 2, Zeile 1: öffnet Tür 3; Spalte = Autoposition
    { auto: 1, oeffnet: 2, erg: "ziege", z: 0 }, { auto: 2, oeffnet: 2, erg: "weg", z: 0 }, { auto: 3, oeffnet: 2, erg: "auto", z: 0 },
    { auto: 1, oeffnet: 3, erg: "ziege", z: 1 }, { auto: 2, oeffnet: 3, erg: "auto", z: 1 }, { auto: 3, oeffnet: 3, erg: "weg", z: 1 },
  ];
  const ergA = lauf(t, 11.2, 12.4), ergB = lauf(t, 23, 24.2), weg = lauf(t, 21.4, 22.6);
  return (
    <g>
      <T x="180" y="16" textAnchor="middle" fontSize="11" fontWeight="700" fill={C.see} letterSpacing="0.06em" opacity={lauf(t, 0.2, 1)}>MODERATOR WEISS BESCHEID</T>
      {A.map((s, i) => (
        <MiniSpiel key={i} x={XS[i]} y={42} auto={s.auto} oeffnet={s.oeffnet} o={lauf(t, 0.5 + i * 0.4, 1.4 + i * 0.4)}
          auf={lauf(t, 5.6 + i * 0.7, 6.6 + i * 0.7)} ergebnis={s.erg} eo={ergA} />
      ))}
      <Pille x={180} y={120} text="Wechseln gewinnt 2 von 3" farbe={C.gold} voll o={ergA} breite={210} gross={12.5} />
      <line x1="20" y1="142" x2="340" y2="142" stroke={C.linie} strokeWidth="1" opacity={lauf(t, 15, 15.6)} />
      <T x="180" y="162" textAnchor="middle" fontSize="11" fontWeight="700" fill={C.signal} letterSpacing="0.06em" opacity={lauf(t, 15.2, 16)}>MODERATOR RÄT NUR</T>
      {Bf.map((s, i) => (
        <MiniSpiel key={i} x={XS[s.auto - 1]} y={s.z === 0 ? 186 : 260} auto={s.auto} oeffnet={s.oeffnet}
          o={lauf(t, 15.6 + i * 0.25, 16.6 + i * 0.25)} auf={lauf(t, 17.8 + i * 0.3, 18.8 + i * 0.3)} ergebnis={s.erg} eo={s.erg === "weg" ? weg : ergB} weg={s.erg === "weg" ? weg : 0} />
      ))}
      <Pille x={180} y={338} text="Wechseln gewinnt 2 von 4 = 1/2" farbe={C.signal} o={ergB} breite={244} gross={12.5} />
    </g>
  );
}

/* 4 · Gesetz der großen Zahlen (1000 echte Runden mit festem Startwert, Wechseln und Bleiben in denselben Spielen) */
const Z_DAUER = 26;
const KURVE = simuliere(1000, 3, zufallszahlen(248), 1, true).kurve;
const zSchritte = () => [
  { von: 0, text: "Ein einzelnes Spiel beweist nichts – wer wechselt, kann trotzdem die Ziege bekommen. Deshalb spielen wir 1000 Runden und zählen nach jeder Runde mit." },
  { von: 5, text: "Am Anfang springen die relativen Häufigkeiten wild hin und her: Nach 10 Runden hat Wechseln hier 8-mal gewonnen. Die Rundenachse ist gestaucht – 1, 10, 100 und 1000 haben gleiche Abstände." },
  { von: 12, text: "Mit wachsender Rundenzahl pendeln sich die Kurven ein: Wechseln nahe 2/3, Bleiben nahe 1/3. Das ist das empirische Gesetz der großen Zahlen." },
  { von: 19, text: "Die beiden Kurven sind Spiegelbilder: In jedem Spiel gewinnt genau eine der beiden Strategien – zusammen ergeben die relativen Häufigkeiten immer 1." },
];
const ZX0 = 50, ZX1 = 334, ZY0 = 226, ZY1 = 44;
const zx = (i) => ZX0 + ((ZX1 - ZX0) * Math.log10(i)) / 3;
const zy = (v) => ZY0 - (ZY0 - ZY1) * v;
function zPunkte(bis, k) {
  const p = [];
  for (let i = 1; i <= bis; i += i < 120 ? 1 : 4) p.push(`${zx(i).toFixed(1)},${zy(KURVE[i - 1][k]).toFixed(1)}`);
  if (bis > 1) p.push(`${zx(bis).toFixed(1)},${zy(KURVE[bis - 1][k]).toFixed(1)}`);
  return p.join(" ");
}
function zZeichne(t) {
  const achse = lauf(t, 0.2, 1.2);
  const fortschritt = Math.min(1, Math.max(0, (t - 4.6) / 13));
  const bis = Math.max(1, Math.min(1000, Math.round(10 ** (3 * fortschritt))));
  const lauft = t >= 4.6;
  const [b, w] = KURVE[bis - 1];
  const spiegel = lauf(t, 19.4, 20.6);
  return (
    <g>
      <g opacity={achse}>
        <line x1={ZX0} y1={ZY0} x2={ZX1 + 6} y2={ZY0} stroke={C.tinte} strokeWidth="1.2" />
        <line x1={ZX0} y1={ZY0} x2={ZX0} y2={ZY1 - 8} stroke={C.tinte} strokeWidth="1.2" />
        {[1, 10, 100, 1000].map((i) => <T key={i} x={zx(i)} y={ZY0 + 15} textAnchor="middle" fontSize="10.5" fill={C.grau}>{i === 1000 ? "1000" : i}</T>)}
        {[1, 10, 100, 1000].map((i) => <line key={i} x1={zx(i)} y1={ZY0} x2={zx(i)} y2={ZY0 + 4} stroke={C.tinte} strokeWidth="1" />)}
        <T x={(ZX0 + ZX1) / 2} y={ZY0 + 32} textAnchor="middle" fontSize="10.5" fontWeight="600" fill={C.grau}>Runden (gestauchte Achse)</T>
        {[[0, "0"], [1 / 3, "1/3"], [2 / 3, "2/3"], [1, "1"]].map(([v, s]) => <T key={s} x={ZX0 - 6} y={zy(v) + 4} textAnchor="end" fontSize="10.5" fontWeight="700" fill={v === 2 / 3 ? C.gold : v === 1 / 3 ? C.see : C.grau}>{s}</T>)}
        <line x1={ZX0} y1={zy(2 / 3)} x2={ZX1} y2={zy(2 / 3)} stroke={C.gold} strokeWidth="1" strokeDasharray="4 4" />
        <line x1={ZX0} y1={zy(1 / 3)} x2={ZX1} y2={zy(1 / 3)} stroke={C.see} strokeWidth="1" strokeDasharray="4 4" />
      </g>
      {spiegel > 0.001 && <line x1={ZX0} y1={zy(0.5)} x2={ZX1} y2={zy(0.5)} stroke={C.signal} strokeWidth="1.2" strokeDasharray="2 3" opacity={spiegel} />}
      {lauft && bis > 1 && <polyline points={zPunkte(bis, 0)} fill="none" stroke={C.see} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />}
      {lauft && bis > 1 && <polyline points={zPunkte(bis, 1)} fill="none" stroke={C.gold} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />}
      {lauft && <circle cx={zx(bis)} cy={zy(w)} r="4" fill={C.flaggold} stroke={C.gold} strokeWidth="1.2" />}
      {lauft && <circle cx={zx(bis)} cy={zy(b)} r="4" fill={C.see} stroke={C.weiss} strokeWidth="1.2" />}
      <g opacity={lauf(t, 4.4, 5)}>
        <T x="180" y="20" textAnchor="middle" fontSize="12.5" fontWeight="800" fill={C.tinte}>Runde {bis}</T>
        <T x="120" y="36" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={C.see}>Bleiben {dk(b)}</T>
        <T x="240" y="36" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={C.gold}>Wechseln {dk(w)}</T>
      </g>
      <Pille x={180} y={284} text={`zusammen immer 1: ${dk(b)} + ${dk(w)}`} farbe={C.signal} o={spiegel} breite={236} gross={12} />
    </g>
  );
}

/* 5 · Hundert Türen */
const H_DAUER = 23;
const H_WAHL = 36, H_REST = 81;                     // Tür 37 gewählt, Tür 82 bleibt zu
const H_REIHE = (() => {                            // Reihenfolge, in der der Moderator die 98 Türen öffnet
  const r = zufallszahlen(100), l = [];
  for (let i = 0; i < 100; i++) if (i !== H_WAHL && i !== H_REST) l.push(i);
  for (let i = l.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [l[i], l[j]] = [l[j], l[i]]; }
  const rang = new Array(100).fill(-1);
  l.forEach((tuer, k) => { rang[tuer] = k; });
  return rang;
})();
const hSchritte = () => [
  { von: 0, text: "Dasselbe Spiel mit 100 Türen. Hinter einer steht das Auto, hinter 99 eine Ziege. Der Kandidat wählt Tür 37 – sie ist mit der Wahrscheinlichkeit 1/100 die richtige." },
  { von: 5, text: "Der Moderator weiß Bescheid und öffnet 98 der übrigen 99 Türen, alle mit Ziege. Nur Tür 82 lässt er zu." },
  { von: 12, text: "Warum gerade Tür 82? Entweder steht dort das Auto – oder der Kandidat hatte mit Tür 37 von Anfang an Glück. Das Glück hat nur 1/100, also gehören Tür 82 die übrigen 99/100." },
  { von: 17, text: "Allgemein mit n Türen: Bleiben gewinnt mit 1/n, Wechseln mit (n − 1)/n. Bei drei Türen sind das genau 1/3 und 2/3." },
];
function hZeichne(t) {
  const b = 20, h = 17, dx = 26.5, dy = 21.5, x0 = (360 - (9 * dx + b)) / 2, y0 = 30;
  const ein = lauf(t, 0.2, 1.4), wahl = lauf(t, 2, 2.8);
  const pillen = lauf(t, 12.4, 13.6), formel = lauf(t, 17.4, 18.8);
  const tueren = [];
  for (let i = 0; i < 100; i++) {
    const x = x0 + (i % 10) * dx, y = y0 + Math.floor(i / 10) * dy;
    const rang = H_REIHE[i];
    const auf = rang < 0 ? 0 : lauf(t, 5.6 + rang * 0.056, 5.95 + rang * 0.056);
    tueren.push(<Tuer key={i} x={x} y={y} b={b} h={h} nr={i + 1} schrift={7.5} o={ein} auf={auf} inhalt={rang >= 0 ? "ziege" : null}
      gewaehlt={i === H_WAHL && wahl > 0.5} blass={rang >= 0 ? 0.45 * lauf(t, 11.2, 12) : 0} />);
  }
  const pos = (i) => [x0 + (i % 10) * dx + b / 2, y0 + Math.floor(i / 10) * dy];
  const [wx, wy] = pos(H_WAHL), [rx, ry] = pos(H_REST);
  return (
    <g>
      <T x="180" y="18" textAnchor="middle" fontSize="12" fontWeight="800" fill={C.gold} opacity={wahl}>Du wählst Tür 37</T>
      {tueren}
      {pillen > 0.001 && <circle cx={rx} cy={ry + h / 2} r="16" fill={C.flaggold} opacity={0.3 * pillen} />}
      <Pille x={wx} y={wy + h + 17} text="1/100" farbe={C.see} voll o={pillen} gross={11} breite={54} />
      <Pille x={rx} y={ry - 10} text="99/100" farbe={C.gold} voll o={pillen} gross={11} breite={62} />
      <g opacity={formel}>
        <T x="180" y="266" textAnchor="middle" fontSize="13.5" fontWeight="800" fill={C.tinte}>Bleiben 1/100 · Wechseln 99/100</T>
        <T x="180" y="288" textAnchor="middle" fontSize="12.5" fontWeight="700" fill={C.grau}>n Türen: Bleiben 1/n, Wechseln (n − 1)/n</T>
      </g>
    </g>
  );
}

const ZIEGEN_ANIM = {
  spiel: { titel: () => "Die Show: drei Türen, eine Ziege wird gezeigt", unter: () => "Warum die 1/3 von Tür 3 zu Tür 2 wandert",
    szene: () => ({ dauer: S_DAUER, hoehe: 300, schritte: sSchritte(), zeichne: sZeichne,
      beschreibung: "Animation: Drei Türen mit je 1/3. Der Kandidat wählt Tür 1, der Moderator öffnet Tür 3 mit einer Ziege. Die 1/3 von Tür 3 geht auf Tür 2 über: Tür 1 behält 1/3, Tür 2 hat 2/3." }) },
  baum: { titel: () => "Der Baum der drei Anfangswahlen", unter: () => "Bleiben gewinnt in einem Ast, Wechseln in zwei",
    szene: () => ({ dauer: B_DAUER, hoehe: 316, schritte: bSchritte(), zeichne: bZeichne,
      beschreibung: "Animation: Baumdiagramm mit den drei gleich wahrscheinlichen ersten Wahlen Auto, Ziege A, Ziege B. Der Moderator muss in den Ziegen-Ästen die andere Ziege zeigen. Bleiben gewinnt nur im Auto-Ast (1/3), Wechseln in beiden Ziegen-Ästen (2/3)." }) },
  wissen: { titel: () => "Der Moderator weiß, wo das Auto ist", unter: () => "Mit Wissen 2 von 3 – ein ahnungsloser Moderator liefert nur 1/2",
    szene: () => ({ dauer: W_DAUER, hoehe: 352, schritte: wSchritte(), zeichne: wZeichne,
      beschreibung: "Animation: Oben drei Spiele mit wissendem Moderator, Wechseln gewinnt in zwei. Unten sechs Fälle mit ahnungslosem Moderator; zwei fallen weg, weil er das Auto zeigt, von den vier übrigen gewinnt Wechseln zwei." }) },
  zahlen: { titel: () => "Das Gesetz der großen Zahlen", unter: () => "1000 Runden: die relativen Häufigkeiten pendeln sich bei 1/3 und 2/3 ein",
    szene: () => ({ dauer: Z_DAUER, hoehe: 300, schritte: zSchritte(), zeichne: zZeichne,
      beschreibung: "Animation: Relative Häufigkeiten der Gewinne beim Bleiben und Wechseln über 1000 simulierte Runden mit logarithmischer Rundenachse. Sie schwanken zuerst stark und nähern sich dann 1/3 und 2/3; zusammen ergeben sie immer 1." }) },
  hundert: { titel: () => "Hundert Türen", unter: () => "Der Moderator öffnet 98 – Bleiben 1/100, Wechseln 99/100",
    szene: () => ({ dauer: H_DAUER, hoehe: 300, schritte: hSchritte(), zeichne: hZeichne,
      beschreibung: "Animation: 100 Türen, der Kandidat wählt Tür 37, der Moderator öffnet 98 Ziegentüren und lässt Tür 82 zu. Tür 37 hat 1/100, Tür 82 hat 99/100." }) },
};

export function ZiegenAnimation({ art, offen = false }) {
  return <AnimKarte szenen={ZIEGEN_ANIM} art={art} offen={offen} merkmal="data-ziegen-anim" />;
}

/* ======================================================================
   Statische Bilder der Herleitung
   ====================================================================== */

/* Baumdiagramm der Strategie „Wechseln“ (mit Pfadregel) */
function BaumBild() {
  const pfad = (x1, y1, x2, y2) => <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.tinte} strokeWidth="1.6" strokeLinecap="round" />;
  const knoten = (x, y, text, gold) => (
    <g>
      <rect x={x - 46} y={y - 15} width="92" height="30" rx="10" fill={gold ? "#FFF3C4" : C.himmel} stroke={gold ? C.gold : C.see} strokeWidth="1.3" />
      <T x={x} y={y + 4.5} textAnchor="middle" fontSize="12" fontWeight="800" fill={gold ? C.gold : C.seeTief}>{text}</T>
    </g>
  );
  return (
    <svg viewBox="0 0 360 196" style={{ width: "100%", maxWidth: 480, display: "block", margin: "6px auto 14px" }} role="img"
      aria-label="Baumdiagramm: erste Wahl Auto mit 1/3, danach liefert Wechseln sicher eine Ziege; erste Wahl Ziege mit 2/3, danach liefert Wechseln sicher das Auto. P(Wechseln gewinnt) = 2/3.">
      <T x="140" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill={C.hellgrau} letterSpacing="0.06em">ERSTE WAHL</T>
      <T x="290" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill={C.hellgrau} letterSpacing="0.06em">NACH DEM WECHSEL</T>
      <circle cx="18" cy="98" r="5" fill={C.tinte} />
      {pfad(18, 98, 94, 52)}{pfad(18, 98, 94, 144)}
      <T x="50" y="66" textAnchor="middle" fontSize="13" fontWeight="800" fill={C.see}>1/3</T>
      <T x="50" y="140" textAnchor="middle" fontSize="13" fontWeight="800" fill={C.see}>2/3</T>
      {knoten(140, 52, "Auto", true)}{knoten(140, 144, "Ziege", false)}
      {pfad(186, 52, 244, 52)}{pfad(186, 144, 244, 144)}
      <T x="215" y="45" textAnchor="middle" fontSize="13" fontWeight="800" fill={C.see}>1</T>
      <T x="215" y="137" textAnchor="middle" fontSize="13" fontWeight="800" fill={C.see}>1</T>
      {knoten(290, 52, "Ziege", false)}{knoten(290, 144, "Auto", true)}
      <T x="290" y="84" textAnchor="middle" fontSize="11" fontWeight="700" fill={C.grau}>verloren · 1/3</T>
      <T x="290" y="176" textAnchor="middle" fontSize="11.5" fontWeight="800" fill={C.gold}>gewonnen · 2/3</T>
    </svg>
  );
}

/* Tabelle der Fallunterscheidung (du wählst Tür 1) */
function FallTabelle() {
  const kopf = { fontSize: 11, fontWeight: 700, color: C.grau, letterSpacing: "0.03em", textTransform: "uppercase", padding: "0 4px 8px" };
  const zelle = { fontSize: 13.5, color: C.tinte, padding: "9px 4px", borderTop: `1px solid ${C.linie}`, display: "flex", alignItems: "center" };
  const marke = (gewinnt) => (
    <span style={{ display: "inline-block", padding: "3px 9px", borderRadius: 999, fontSize: 12.5, fontWeight: 700,
      background: gewinnt ? "#FFF3C4" : C.silberHell, color: gewinnt ? C.gruenDunkel : C.grau, border: `1px solid ${gewinnt ? C.flaggold : C.linie}` }}>
      {gewinnt ? "Auto" : "Ziege"}
    </span>
  );
  return (
    <div style={{ ...KARTE, padding: "14px 14px 10px", margin: "4px 0 18px" }} data-fall-tabelle="">
      <div style={{ display: "grid", gridTemplateColumns: "1.05fr 1.15fr 0.9fr 0.95fr", alignItems: "stretch" }}>
        <span style={kopf}>Auto hinter</span><span style={kopf}>Moderator öffnet</span><span style={kopf}>Bleiben</span><span style={kopf}>Wechseln</span>
        {FAELLE.map((f) => (
          <React.Fragment key={f.auto}>
            <span style={{ ...zelle, fontWeight: 700 }}>Tür {f.auto}</span>
            <span style={zelle}>Tür {f.oeffnet}</span>
            <span style={zelle}>{marke(f.bleiben)}</span>
            <span style={zelle}>{marke(f.wechseln)}</span>
          </React.Fragment>
        ))}
        <span style={{ ...zelle, gridColumn: "1 / span 2", color: C.grau, fontSize: 12.5 }}>gewonnen in</span>
        <span style={{ ...zelle, fontWeight: 800, color: C.see }}>1 von 3</span>
        <span style={{ ...zelle, fontWeight: 800, color: C.gold }}>2 von 3</span>
      </div>
    </div>
  );
}

/* 300 Spiele als Balken: in welchen öffnet er Tür 3? */
function DreihundertBalken({ wissend }) {
  const d = dreihundert(wissend);
  const teile = wissend
    ? [[d.auto1, "Auto hinter Tür 1", C.see, C.weiss], [d.auto2, "Auto hinter Tür 2", C.flaggold, C.tinte]]
    : [[d.auto1, "Auto Tür 1", C.see, C.weiss], [d.auto2, "Auto Tür 2", C.flaggold, C.tinte], [d.auto3, "Auto gezeigt", C.silberHell, C.grau]];
  const summe = teile.reduce((s, x) => s + x[0], 0);
  return (
    <div style={{ margin: "6px 0 16px" }}>
      <p style={{ fontSize: 12.5, fontWeight: 600, color: C.gruenDunkel, marginBottom: 6 }}>
        {wissend ? "Spiele, in denen der wissende Moderator Tür 3 öffnet" : "Spiele, in denen der ahnungslose Moderator Tür 3 öffnet"}
      </p>
      <div style={{ display: "flex", borderRadius: 10, overflow: "hidden", border: `1px solid ${C.linie}` }}>
        {teile.map(([zahl, name, farbe, schrift]) => (
          <div key={name} style={{ flex: zahl / summe, background: farbe, color: schrift, padding: "8px 6px", minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.1 }}>{zahl}</div>
            <div style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.25, opacity: 0.9 }}>{name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ======================================================================
   Labor 1: drei Türen zum Selbstspielen mit Strichliste
   ====================================================================== */

/* weiche Übergänge für die Türen (bei „Bewegung reduzieren“ sofort) */
function useWeich(ziele, dauer = 480) {
  const [werte, setWerte] = useState(ziele);
  const ref = useRef(ziele);
  const schluessel = ziele.join(",");
  useEffect(() => {
    if (leise()) { ref.current = ziele; setWerte(ziele); return undefined; }
    const start = ref.current.slice(), t0 = performance.now();
    let raf = 0;
    const tick = (jetzt) => {
      const p = Math.min(1, (jetzt - t0) / dauer), e = p * p * (3 - 2 * p);
      const v = start.map((s, i) => s + (ziele[i] - s) * e);
      ref.current = v; setWerte(v);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [schluessel]); // eslint-disable-line react-hooks/exhaustive-deps
  return werte;
}

/* Strichliste: Fünferbündel (vier Striche, der fünfte quer), höchstens 20 Striche, Zahl dahinter */
function Striche({ n, farbe }) {
  const zeige = Math.min(n, 20), buendel = Math.ceil(zeige / 5);
  const w = Math.max(4, buendel * 22);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, minHeight: 22 }}>
      {zeige > 0 && (
        <svg width={w} height="18" viewBox={`0 0 ${w} 18`} aria-hidden="true">
          {Array.from({ length: zeige }, (_, i) => {
            const bnd = Math.floor(i / 5), k = i % 5, x = bnd * 22 + 2;
            return k < 4
              ? <line key={i} x1={x + k * 4} y1="2" x2={x + k * 4} y2="16" stroke={farbe} strokeWidth="1.8" strokeLinecap="round" />
              : <line key={i} x1={x - 2} y1="13" x2={x + 14} y2="5" stroke={farbe} strokeWidth="1.8" strokeLinecap="round" />;
          })}
        </svg>
      )}
      <span style={{ fontSize: 13.5, fontWeight: 700, color: C.tinte }}>{n}</span>
    </span>
  );
}

function TuerLabor() {
  const [runde, setRunde] = useState(() => ({ auto: Math.floor(Math.random() * 3) }));
  const [phase, setPhase] = useState("waehlen");          // waehlen → oeffnet → entscheiden → fertig
  const [wahl, setWahl] = useState(null);
  const [offen, setOffen] = useState(null);
  const [ende, setEnde] = useState(null);                 // { tuer, strategie, gewonnen }
  const [liste, setListe] = useState({ bg: 0, bv: 0, wg: 0, wv: 0 });
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);

  const waehlen = (i) => {
    if (phase !== "waehlen") return;
    setWahl(i); setPhase("oeffnet");
    const tuer = moderatorOeffnet(3, runde.auto, i, 1)[0];
    timer.current = setTimeout(() => { setOffen(tuer); setPhase("entscheiden"); }, leise() ? 0 : 650);
  };
  const andere = wahl === null || offen === null ? null : [0, 1, 2].find((i) => i !== wahl && i !== offen);
  const entscheiden = (strategie) => {
    if (phase !== "entscheiden") return;
    const tuer = strategie === "bleiben" ? wahl : andere;
    const gewonnen = tuer === runde.auto;
    setEnde({ tuer, strategie, gewonnen });
    setPhase("fertig");
    setListe((l) => ({ ...l, [`${strategie[0]}${gewonnen ? "g" : "v"}`]: l[`${strategie[0]}${gewonnen ? "g" : "v"}`] + 1 }));
  };
  const weiter = () => { setRunde({ auto: Math.floor(Math.random() * 3) }); setWahl(null); setOffen(null); setEnde(null); setPhase("waehlen"); };
  const klick = (i) => {
    if (phase === "waehlen") waehlen(i);
    else if (phase === "entscheiden" && i !== offen) entscheiden(i === wahl ? "bleiben" : "wechseln");
  };

  const ziele = [0, 1, 2].map((i) => (phase === "fertig" || i === offen ? 1 : 0));
  const auf = useWeich(ziele);
  const B = 76, H = 128, Y = 36, X = [18, 112, 206];
  const summe = liste.bg + liste.bv + liste.wg + liste.wv;
  const nb = liste.bg + liste.bv, nw = liste.wg + liste.wv;
  const anteil = (g, n) => (n ? `${g} von ${n} = ${dk(g / n, 2)}` : "–");
  const zeile = (titel, g, v, n, farbe, soll) => (
    <div style={{ display: "grid", gridTemplateColumns: "74px 1fr 1fr", gap: 8, alignItems: "center", padding: "8px 0", borderTop: `1px solid ${C.linie}` }}>
      <span style={{ fontSize: 13.5, fontWeight: 700, color: farbe }}>{titel}</span>
      <span><Striche n={g} farbe={C.gold} /></span>
      <span><Striche n={v} farbe={C.hellgrau} /></span>
      <span style={{ gridColumn: "2 / span 2", fontSize: 12.5, color: C.grau, marginTop: -2 }}>Anteil gewonnen: <b style={{ color: C.tinte }}>{anteil(g, n)}</b> · erwartet {soll}</span>
    </div>
  );
  const hinweis = phase === "waehlen" ? "Tippe auf eine Tür." : phase === "oeffnet" ? "Der Moderator öffnet eine Tür …"
    : phase === "entscheiden" ? `Hinter Tür ${offen + 1} steht eine Ziege. Bleibst du bei Tür ${wahl + 1} oder wechselst du zu Tür ${andere + 1}?`
    : `Das Auto stand hinter Tür ${runde.auto + 1}. ${ende.strategie === "bleiben" ? "Du bist geblieben" : "Du hast gewechselt"} und hast ${ende.gewonnen ? "gewonnen" : "verloren"} – ${ende.strategie === "bleiben" ? "Wechseln" : "Bleiben"} hätte ${ende.gewonnen ? "verloren" : "gewonnen"}.`;
  return (
    <div data-ziegen-labor="">
      <svg viewBox="0 0 300 196" style={{ width: "100%", maxWidth: 420, display: "block", margin: "0 auto" }} aria-label="Drei Türen">
        {X.map((x, i) => {
          const inhalt = i === runde.auto ? "auto" : "ziege";
          const bedienbar = phase === "waehlen" || (phase === "entscheiden" && i !== offen);
          return (
            <g key={i} role="button" tabIndex={bedienbar ? 0 : -1} aria-label={`Tür ${i + 1}`} aria-disabled={!bedienbar}
              onClick={() => klick(i)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); klick(i); } }}
              style={{ cursor: bedienbar ? "pointer" : "default", outline: "none" }}>
              {phase === "fertig" && i === ende.tuer && <rect x={x - 6} y={Y - 6} width={B + 12} height={H + 12} rx="10" fill={ende.gewonnen ? C.flaggold : C.signal} opacity="0.25" />}
              <Tuer x={x} y={Y} b={B} h={H} nr={i + 1} auf={auf[i]} inhalt={inhalt} gewaehlt={i === wahl} schrift={26} />
              <T x={x + B / 2} y={Y - 10} textAnchor="middle" fontSize="11.5" fontWeight="800" fill={i === wahl ? C.gold : C.see}>
                {i === wahl ? "Deine Wahl" : i === offen ? "Moderator" : ""}
              </T>
            </g>
          );
        })}
        <T x="150" y={Y + H + 24} textAnchor="middle" fontSize="11.5" fontWeight="600" fill={C.grau}>{summe === 1 ? "1 Runde gespielt" : `${summe} Runden gespielt`}</T>
      </svg>
      <p aria-live="polite" style={{ fontSize: 14, color: C.tinte, lineHeight: 1.65, textAlign: "center", minHeight: 46, margin: "6px 0 10px" }}>{hinweis}</p>
      <div className="flex flex-wrap justify-center" style={{ gap: 10, minHeight: 46 }}>
        {phase === "entscheiden" && (
          <>
            <button type="button" onClick={() => entscheiden("bleiben")} className="px-5 py-3" style={KNOPF(true, C.see)}>Bei Tür {wahl + 1} bleiben</button>
            <button type="button" onClick={() => entscheiden("wechseln")} className="px-5 py-3" style={{ ...KNOPF(true, C.flaggold), color: C.tinte }}>Zu Tür {andere + 1} wechseln</button>
          </>
        )}
        {phase === "fertig" && <button type="button" onClick={weiter} className="px-6 py-3" style={KNOPF(true, C.gruenDunkel)}>Nächste Runde</button>}
      </div>
      <div style={{ marginTop: 14 }} data-strichliste="" data-runden={summe}>
        <div style={{ display: "grid", gridTemplateColumns: "74px 1fr 1fr", gap: 8, fontSize: 11, fontWeight: 700, color: C.grau, letterSpacing: "0.03em", textTransform: "uppercase", paddingBottom: 6 }}>
          <span>Strichliste</span><span>gewonnen</span><span>verloren</span>
        </div>
        {zeile("Bleiben", liste.bg, liste.bv, nb, C.see, "1/3 ≈ 0,33")}
        {zeile("Wechseln", liste.wg, liste.wv, nw, C.gold, "2/3 ≈ 0,67")}
      </div>
      {summe > 0 && summe < 20 && <p style={{ fontSize: 12.5, color: C.grau, fontWeight: 300, lineHeight: 1.6, marginTop: 8 }}>Nach wenigen Runden sagt die Strichliste noch wenig – der Zufall schwankt stark. Dafür gibt es die Schnellsimulation.</p>}
    </div>
  );
}

/* ======================================================================
   Labor 2: Schnellsimulation (3, 10 oder 100 Türen)
   ====================================================================== */
const SIM_TUEREN = [3, 10, 100];
function Schnellsimulation() {
  const [n, setN] = useState(3);
  const [stand, setStand] = useState({ N: 0, b: 0, w: 0, verlauf: [] });
  const dazu = (anzahl) => {
    const s = simuliere(anzahl, n, Math.random);
    setStand((x) => {
      const N = x.N + anzahl, b = x.b + s.bleiben, w = x.w + s.wechseln;
      return { N, b, w, verlauf: [...x.verlauf, [N, w / N, b / N]].slice(-40) };
    });
  };
  const tuerenSetzen = (m) => { setN(m); setStand({ N: 0, b: 0, w: 0, verlauf: [] }); };
  const pB = 1 / n, pW = (n - 1) / n;
  const balken = (titel, g, p, farbe, sollText) => {
    const h = stand.N ? g / stand.N : 0;
    return (
      <div style={{ marginBottom: 12 }}>
        <div className="flex items-baseline" style={{ gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: farbe }}>{titel}</span>
          <span style={{ fontSize: 12.5, color: C.grau }}>{stand.N ? `${g} von ${stand.N} gewonnen = ${dk(h)}` : "noch keine Runde"}</span>
          <span style={{ marginLeft: "auto", fontSize: 12, color: C.grau }}>erwartet {sollText}</span>
        </div>
        <div style={{ position: "relative", height: 16, borderRadius: 999, background: C.silberHell, overflow: "hidden" }}>
          <div style={{ width: `${h * 100}%`, height: "100%", background: farbe, borderRadius: 999, transition: leise() ? "none" : "width .35s" }} />
          <div style={{ position: "absolute", left: `calc(${p * 100}% - 1px)`, top: -2, bottom: -2, width: 2, background: C.tinte, opacity: 0.75 }} />
        </div>
      </div>
    );
  };
  /* kleiner Verlauf der relativen Häufigkeit beim Wechseln nach jedem Klick */
  const V = stand.verlauf, VW = 300, VH = 74;
  const vx = (i) => 10 + (V.length < 2 ? 0 : (i / (V.length - 1)) * (VW - 20));
  const lo = Math.max(0, pW - 0.25), hi = Math.min(1, pW + 0.1);
  const vy = (v) => VH - 8 - ((Math.min(hi, Math.max(lo, v)) - lo) / (hi - lo)) * (VH - 16);
  return (
    <div data-ziegen-sim="" data-runden={stand.N}>
      <div className="flex flex-wrap items-center" style={{ gap: 6, marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: C.grau, marginRight: 4 }}>Türen</span>
        {SIM_TUEREN.map((m) => (
          <button key={m} type="button" onClick={() => tuerenSetzen(m)} aria-pressed={n === m}
            style={{ padding: "6px 12px", borderRadius: 999, border: `1px solid ${n === m ? C.flaggold : C.linie}`, background: n === m ? "#FFF6D6" : C.weiss,
              color: n === m ? C.tinte : C.grau, fontSize: 12.5, fontWeight: n === m ? 600 : 400, fontFamily: "inherit", cursor: "pointer" }}>{m}</button>
        ))}
        <span style={{ fontSize: 12, color: C.grau, marginLeft: 4 }}>{n === 3 ? "Moderator öffnet 1 Tür" : `Moderator öffnet ${n - 2} Türen`}</span>
      </div>
      {balken("Bleiben", stand.b, pB, C.see, n === 3 ? "1/3 ≈ 0,333" : `1/${n} = ${dk(pB)}`)}
      {balken("Wechseln", stand.w, pW, C.gold, n === 3 ? "2/3 ≈ 0,667" : `${n - 1}/${n} = ${dk(pW)}`)}
      {V.length >= 2 && (
        <svg viewBox={`0 0 ${VW} ${VH}`} style={{ width: "100%", display: "block", margin: "2px 0 8px" }} role="img"
          aria-label={`Verlauf der relativen Häufigkeit beim Wechseln über ${V.length} Schritte, zuletzt ${dk(V[V.length - 1][1])}`}>
          <line x1="10" y1={vy(pW)} x2={VW - 10} y2={vy(pW)} stroke={C.gold} strokeWidth="1" strokeDasharray="4 4" />
          <T x={VW - 10} y={vy(pW) - 4} textAnchor="end" fontSize="9.5" fontWeight="700" fill={C.gold}>{bText({ z: n - 1, n })}</T>
          <polyline points={V.map((p, i) => `${vx(i).toFixed(1)},${vy(p[1]).toFixed(1)}`).join(" ")} fill="none" stroke={C.gold} strokeWidth="2" strokeLinejoin="round" />
          {V.map((p, i) => <circle key={i} cx={vx(i)} cy={vy(p[1])} r="2.4" fill={C.flaggold} />)}
          <T x="10" y={VH - 1} fontSize="9.5" fill={C.grau}>Wechseln nach jedem Klick</T>
        </svg>
      )}
      <div className="flex flex-wrap items-center" style={{ gap: 10 }}>
        <button type="button" onClick={() => dazu(100)} className="px-5 py-3" style={KNOPF(true)}>+100 Runden</button>
        <button type="button" onClick={() => dazu(1000)} className="px-5 py-3" style={KNOPF(true, C.seeTief)}>+1000 Runden</button>
        {stand.N > 0 && <button type="button" onClick={() => tuerenSetzen(n)} style={LINK}>Zurücksetzen</button>}
        <span style={{ marginLeft: "auto", fontSize: 13, color: C.grau }}>{stand.N} Runden</span>
      </div>
    </div>
  );
}

/* ======================================================================
   Übungen
   ====================================================================== */
function Feld({ k, label, wert, setzen, stand, onEnter, breite = 96, zahl }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 16, fontWeight: 500, color: C.tinte }}>
      <span>{label} =</span>
      <input value={wert} onChange={(e) => setzen(k, e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") onEnter(); }}
        inputMode={zahl ? "decimal" : "text"} autoComplete="off" aria-label={label} placeholder="?" style={{ ...ZELLE(stand), width: breite }} />
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

/* Baumdiagramm mit Lücken a, b, c, d zur Übung „Baumdiagramm“ */
function LueckenBaum({ a, stand }) {
  const farbe = (k) => (stand && stand[k] === true ? C.see : stand && stand[k] === false ? C.signal : C.gold);
  const luecke = (x, y, k) => (
    <g>
      <rect x={x - 13} y={y - 13} width="26" height="22" rx="7" fill={C.weiss} stroke={farbe(k)} strokeWidth="1.6" />
      <T x={x} y={y + 3} textAnchor="middle" fontSize="13" fontWeight="800" fill={farbe(k)}>{k}</T>
    </g>
  );
  const box = (x, y, text, gold) => (
    <g>
      <rect x={x - 44} y={y - 14} width="88" height="28" rx="9" fill={gold ? "#FFF3C4" : C.himmel} stroke={gold ? C.gold : C.see} strokeWidth="1.2" />
      <T x={x} y={y + 4} textAnchor="middle" fontSize="11" fontWeight="800" fill={gold ? C.gold : C.seeTief}>{text}</T>
    </g>
  );
  const l = (x1, y1, x2, y2) => <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.tinte} strokeWidth="1.4" />;
  return (
    <svg viewBox="0 0 340 170" style={{ width: "100%", maxWidth: 440, display: "block", margin: "4px auto 10px" }} role="img"
      aria-label={`Baumdiagramm mit ${a.n} Türen: Lücke a am Ast erste Wahl Auto, b am Ast erste Wahl Ziege, c am Ast Wechseln trifft das Auto, d ist die Pfadwahrscheinlichkeit`}>
      <circle cx="14" cy="85" r="4.5" fill={C.tinte} />
      {l(14, 85, 96, 38)}{l(14, 85, 96, 132)}
      {luecke(52, 52, "a")}{luecke(52, 128, "b")}
      {box(132, 38, "Auto", true)}{box(132, 132, "Ziege", false)}
      {l(176, 38, 248, 38)}{l(176, 132, 248, 100)}{l(176, 132, 248, 152)}
      <T x="212" y="30" textAnchor="middle" fontSize="12" fontWeight="800" fill={C.see}>1</T>
      {luecke(206, 104, "c")}
      {box(292, 38, "Ziege", false)}{box(292, 100, "Auto", true)}{box(292, 152, "Ziege", false)}
      <T x="292" y="74" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={C.grau}>Wechsel</T>
      <T x="214" y="164" textAnchor="middle" fontSize="10" fontWeight="700" fill={C.grau}>1 − c</T>
      <T x="338" y="126" textAnchor="end" fontSize="11" fontWeight="800" fill={farbe("d")}>Pfad: d</T>
    </svg>
  );
}

const EINGABE_HINWEIS = "Als Bruch (2/3), Dezimalzahl (0,67) oder in Prozent (67 %).";
function ZiegenTrainer() {
  const [art, setArt] = useState("grundtyp");
  const [stufe, setStufe] = useState(1);
  const [auf, setAufRoh] = useState(() => merk(aufgabe("grundtyp", 1)));
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
  const mc = auf.art === "moderator";
  const leer = mc ? wahl === null : fs.some(([k]) => !String(ein[k] ?? "").trim());
  const pruefen = () => {
    if (leer) return;
    const e = pruefe(auf, mc ? wahl : ein);
    setErg(e);
    setSerie((x) => ({ n: x.n + 1, ok: x.ok + (e.ok ? 1 : 0) }));
  };
  const loesungZeigen = mc
    ? <div style={{ marginTop: 6 }}>{auf.erklaerung.map((z) => <Text key={z} s={z} style={{ fontSize: 14, color: C.tinte, fontWeight: 300, lineHeight: 1.75, marginBottom: 6 }} />)}</div>
    : <Formeln zeilen={rechenweg(auf)} max={15} farbe={C.see} />;
  return (
    <div>
      <p style={{ ...FLIESS, lineHeight: 1.7, marginBottom: 18 }}>
        Vier Aufgabentypen: Gewinnchancen mit beliebig vielen Türen berechnen, ein Baumdiagramm ergänzen, Strichlisten
        auswerten und herausfinden, was das Wissen des Moderators verändert.
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        {ARTEN.map((a) => <Chip key={a.id} aktiv={art === a.id} onClick={() => artSetzen(a.id)}>{a.name}</Chip>)}
      </div>
      <Stufen stufe={stufe} setzen={stufeSetzen} />
      <div style={KARTE} data-mm-karte="" data-ziegentrainer="">
        <p style={{ fontSize: 15, color: C.tinte, fontWeight: 400, lineHeight: 1.7, marginBottom: 10 }}>{auftrag(auf)}</p>
        {auf.art === "baum" && <LueckenBaum a={auf} stand={erg ? erg.felder : null} />}
        {mc ? (
          <div className="flex flex-col" style={{ gap: 8, marginBottom: 12 }}>
            {auf.reihenfolge.map((i) => {
              const an = wahl === i, gut = an && erg && erg.ok, schlecht = an && erg && !erg.ok;
              return (
                <button key={i} type="button" onClick={() => { setWahl(i); setErg(null); }} aria-pressed={an} data-option={i}
                  style={{ textAlign: "left", padding: "10px 14px", borderRadius: 12, fontFamily: "inherit", cursor: "pointer", fontSize: 17,
                    border: `1.5px solid ${gut ? C.see : schlecht ? C.signal : an ? C.see : C.linie}`, background: gut ? C.himmel : an ? "#F3F7FD" : C.weiss, color: C.tinte }}>
                  <Inline s={`$P(\\text{Wechseln gewinnt}) = ${auf.optionen[i]}$`} />
                </button>
              );
            })}
          </div>
        ) : (
          <>
            <p style={{ fontSize: 12.5, color: C.grau, fontWeight: 300, marginBottom: 8 }}>{auf.art === "haeufigkeit" ? "h als Bruch oder Dezimalzahl, Anzahlen als ganze Zahl." : EINGABE_HINWEIS}</p>
            <div className="flex flex-wrap" style={{ gap: 14, marginBottom: 12 }}>
              {fs.map(([k, label, , typ]) => (
                <Feld key={k} k={k} label={label} wert={ein[k] ?? ""} setzen={setze} stand={erg ? erg.felder[k] : null} onEnter={pruefen} zahl={typ === "zahl"} />
              ))}
            </div>
          </>
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
            <p style={{ fontSize: 14, color: C.tinte, fontWeight: 300, lineHeight: 1.75 }}>{erg.grund || tipp(auf)}</p>
            {!zeigen && <button onClick={() => setZeigen(true)} className="mt-3" style={LINK}>{mc ? "Erklärung zeigen" : "Rechenweg zeigen"}</button>}
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
export function GfsZiegenSeite({ gehe }) {
  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 22 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 14 }}>
        Bleiben oder wechseln – wo steht das Auto?
      </h2>
      <Text s="Eine Spielshow, drei Türen. Hinter einer steht ein Auto, hinter den beiden anderen je eine Ziege. Du wählst eine Tür,
        der Moderator öffnet eine andere – eine Ziege – und fragt: Willst du wechseln? Fast jeder denkt: Zwei Türen, also 50 zu 50,
        egal. Das stimmt nicht. Wer wechselt, gewinnt doppelt so oft wie jemand, der bleibt." style={FLIESS} />
      <Text s="Das Ziegenproblem ist berühmt, weil selbst Mathematiker sich darüber gestritten haben. Wir lösen es in sechs Schritten –
        mit Fallunterscheidung, Baumdiagramm und Pfadregel – und prüfen das Ergebnis mit einer Simulation." style={FLIESS} />

      <ZiegenAnimation art="spiel" offen />

      <Schritt nr="1" titel="Die Spielregeln genau festlegen" />
      <Text s="Eine Wahrscheinlichkeit kann man nur ausrechnen, wenn das Zufallsexperiment eindeutig beschrieben ist. Beim
        Ziegenproblem gelten vier Regeln – und auf jede kommt es an:" style={FLIESS} />
      <Kasten titel="Die vier Regeln">
        <ol style={{ margin: "8px 0 10px", paddingLeft: 20, listStyle: "decimal" }}>
          {[
            "Das Auto steht zufällig hinter einer der drei Türen, jede ist gleich wahrscheinlich.",
            "Der Moderator öffnet nie deine Tür und nie die Autotür – er weiß, wo das Auto steht.",
            "Hat er die Wahl zwischen zwei Ziegentüren, entscheidet er zufällig.",
            "Er öffnet in jedem Spiel eine Tür und bietet dir den Wechsel an.",
          ].map((r) => <li key={r} style={{ fontSize: 14, color: C.tinte, fontWeight: 300, lineHeight: 1.7, marginBottom: 6 }}>{r}</li>)}
        </ol>
      </Kasten>

      <Schritt nr="2" titel="Fallunterscheidung: drei Fälle, drei Ausgänge" />
      <Text s="Ohne Einschränkung wählst du Tür 1 – für jede andere Wahl läuft die Überlegung genauso. Das Auto steht mit je
        $\frac{1}{3}$ hinter Tür 1, 2 oder 3. Wir gehen alle drei Fälle durch:" style={FLIESS} />
      <FallTabelle />
      <Text s="Wer bleibt, gewinnt nur im ersten Fall. Wer wechselt, gewinnt im zweiten und dritten – denn dann muss der Moderator
        die einzige andere Ziegentür öffnen, und die übrige Tür ist die Autotür. Auffällig: In jedem Fall gewinnt genau eine der
        beiden Strategien." style={FLIESS} />
      <ZiegenAnimation art="baum" />

      <Schritt nr="3" titel="Baumdiagramm und Pfadregel" />
      <Text s="Für die Strategie „Wechseln“ reicht ein Baum mit zwei Stufen. Erste Stufe: Was steckt hinter deiner ersten Wahl?
        Zweite Stufe: Was bekommst du nach dem Wechsel? Hast du das Auto gewählt, bekommst du sicher eine Ziege. Hast du eine
        Ziege gewählt, bekommst du sicher das Auto." style={FLIESS} />
      <BaumBild />
      <Formeln zeilen={[
        "P(\\text{Wechseln gewinnt}) = \\frac{2}{3} \\cdot 1 = \\frac{2}{3}",
        "P(\\text{Bleiben gewinnt}) = \\frac{1}{3}",
        "\\frac{1}{3} + \\frac{2}{3} = 1",
      ]} max={18} />
      <Kasten titel="Ergebnis">
        <Text s="Wer bleibt, gewinnt mit der Wahrscheinlichkeit $\frac{1}{3}$, wer wechselt, mit $\frac{2}{3}$. Wechseln
          verdoppelt die Gewinnchance – nicht, weil sich hinter den Türen etwas ändert, sondern weil der Wechsel genau dann
          gewinnt, wenn die erste Wahl danebenlag."
          style={{ fontSize: 15, color: C.tinte, fontWeight: 500, lineHeight: 1.8, margin: "8px 0 10px" }} />
      </Kasten>

      <Schritt nr="4" titel="Und wenn Tür 3 schon offen ist? 300 Spiele zählen" />
      <Text s="Ein häufiger Einwand: „Jetzt, wo Tür 3 offen ist, sind doch nur noch zwei Türen übrig.“ Stell dir 300 Spiele vor, in
        denen du immer Tür 1 wählst. In je 100 steht das Auto hinter Tür 1, 2 und 3. Steht es hinter Tür 1, öffnet der Moderator
        in der Hälfte der Spiele Tür 3. Steht es hinter Tür 2, muss er Tür 3 öffnen. Steht es hinter Tür 3, öffnet er sie nie." style={FLIESS} />
      <DreihundertBalken wissend />
      <Formeln zeilen={[
        "\\text{Tür 3 offen: } 50 + 100 = 150 \\text{ Spiele}",
        "P(\\text{Wechseln gewinnt} \\mid \\text{Tür 3 offen}) = \\frac{100}{150} = \\frac{2}{3}",
      ]} max={17} />
      <Text s="Auch wenn du schon weißt, welche Tür geöffnet wurde, bleibt es bei $\frac{2}{3}$. Die beiden geschlossenen Türen sind
        nicht gleichwertig: Deine Tür hat der Moderator gar nicht angefasst, die andere hat er bewusst stehen lassen." style={FLIESS} />

      <Schritt nr="5" titel="Was das Wissen des Moderators ausmacht" />
      <Text s="Woher kommt dann das Gefühl „50 zu 50“? Es stimmt – aber für ein anderes Spiel. Öffnet ein ahnungsloser Moderator
        zufällig Tür 2 oder Tür 3, zeigt er in einem Drittel der Spiele das Auto. Lässt man diese Spiele weg, bleiben in 300 Spielen
        mit offener Tür 3 nur 100 übrig:" style={FLIESS} />
      <DreihundertBalken wissend={false} />
      <Formeln zeilen={["P(\\text{Wechseln gewinnt}) = \\frac{50}{100} = \\frac{1}{2}"]} max={17} />
      <Text s="Der Unterschied ist das Wissen: Der wissende Moderator kann gar nicht anders, als die Autotür stehen zu lassen. Damit
        verrät er dir in zwei von drei Spielen, wo das Auto ist. Ein zufälliges Öffnen verrät nichts." style={FLIESS} />
      <ZiegenAnimation art="wissen" />

      <Schritt nr="6" titel="Variante: n Türen" />
      <Text s="Mit $n$ Türen und einem Moderator, der $k$ Ziegentüren öffnet ($1 \le k \le n − 2$), gilt dieselbe Überlegung.
        Bleiben gewinnt nur, wenn die erste Wahl stimmt. Wechseln gewinnt, wenn die erste Wahl eine Ziege war und du dann
        unter den $n − 1 − k$ übrigen geschlossenen Türen die richtige erwischst:" style={FLIESS} />
      <Formeln zeilen={[
        "P(\\text{Bleiben}) = \\frac{1}{n}",
        "P(\\text{Wechseln}) = \\frac{n − 1}{n} \\cdot \\frac{1}{n − 1 − k} = \\frac{n − 1}{n(n − 1 − k)}",
        "k = n − 2: \\quad P(\\text{Wechseln}) = \\frac{n − 1}{n}",
      ]} max={18} />
      <Text s="Wechseln lohnt sich immer, sobald der Moderator mindestens eine Tür öffnet: Aus $n − 1 − k < n − 1$ folgt
        $\frac{n − 1}{n(n − 1 − k)} > \frac{n − 1}{n(n − 1)} = \frac{1}{n}$. Öffnet er alle Türen bis auf eine, wird der Effekt riesig –
        bei 100 Türen gewinnt Wechseln mit $\frac{99}{100}$." style={FLIESS} />
      <ZiegenAnimation art="hundert" />
      <Kasten titel="Zum Mitnehmen">
        <Text s="Wechseln gewinnt genau dann, wenn die erste Wahl danebenlag. Bei drei Türen passiert das in zwei von drei Fällen –
          vorausgesetzt, der Moderator weiß Bescheid und öffnet immer eine Ziegentür."
          style={{ fontSize: 15, color: C.tinte, fontWeight: 500, lineHeight: 1.8, margin: "8px 0 10px" }} />
      </Kasten>

      <div style={{ ...KARTE, margin: "22px 0" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 12 }}>Labor: selbst spielen – Tür wählen, bleiben oder wechseln</p>
        <TuerLabor />
      </div>
      <div style={{ ...KARTE, margin: "22px 0" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 12 }}>Labor: Schnellsimulation – viele Runden auf einmal</p>
        <Schnellsimulation />
      </div>
      <ZiegenAnimation art="zahlen" />
      <Text s="Die Simulation ersetzt keinen Beweis – aber sie zeigt, dass die Rechnung zur Wirklichkeit passt. Nach dem empirischen
        Gesetz der großen Zahlen nähert sich die relative Häufigkeit mit wachsender Rundenzahl der Wahrscheinlichkeit." style={FLIESS} />

      <Trenner />

      <Kicker>Jetzt selbst üben</Kicker>
      <H3>Gewinnchancen, Baumdiagramm, Häufigkeiten, Moderator</H3>
      <ZiegenTrainer />

      {gehe && (
        <div style={{ ...KARTE, marginTop: 22, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: C.tinte, marginBottom: 4 }}>Mehr Baumdiagramme</p>
            <p style={{ fontSize: 13.5, color: C.grau, fontWeight: 300, lineHeight: 1.6 }}>Urnen ziehen, Pfade zählen, Pfadregeln üben – im Werkzeug Urnen und Kombinatorik.</p>
          </div>
          <button type="button" onClick={() => gehe({ ansicht: "kombinatorik" })} className="px-5 py-3" style={KNOPF(true)}>Zu Urnen und Kombinatorik</button>
        </div>
      )}

      <Trenner />

      <Kicker>Deine GFS</Kicker>
      <H3>Der rote Faden für den Vortrag</H3>
      <RoterFaden gliederung={GLIEDERUNG} tipps={TIPPS} hinweis="den Abschnitt „Warum die Intuition irrt“" />

      <div style={{ height: 8 }} />
      <Kicker>Kolloquium</Kicker>
      <H3>Die Fragen nach dem Vortrag trainieren</H3>
      <Kolloquium fragen={KOLLOQUIUM} speicher="mm-gfs-ziegen-kolloquium" />
    </div>
  );
}
