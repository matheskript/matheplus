import React, { useState } from "react";
import { C } from "./base1.jsx";
import { M, Text } from "./func3.jsx";
import { MatheFeld } from "./matheTastatur.jsx";
import { FLIESS, KARTE, ZELLE, Formeln, Schritt, Kasten, Chip, PlusMinus, Kicker, H3, Trenner, RoterFaden, Kolloquium } from "./funcGfsBausteine.jsx";
import { lauf } from "./funcErklaeranimation.jsx";
import { AnimKarte } from "./funcAnimKarte.jsx";
import { kamera } from "./func16.jsx";
import { q } from "./rechnen2.js";
import { wTex } from "./wzahl.js";
import {
  dk, kTex, punktTex, spalteTex, ebeneTex, quadTex,
  LABOR, laborGerade, laborEbene,
  ARTEN, STUFEN_NAMEN, stufenZahl, aufgabe, pruefe, rechenweg, tipp, GLIEDERUNG, TIPPS, KOLLOQUIUM,
} from "./gfsKugeln.js";

/* ============================================================
   Kurs GFS – Themenseite „Kugeln“
   (Kursstufe 1, Kap. VI Geraden und Ebenen)
   Aufbau wie das Ziegenproblem: Leitfrage · Herleitung in sechs Schritten
   (Kugelgleichung aus dem Abstand, quadratische Ergänzung, Gerade und
   Kugel mit Diskriminante, Ebene und Kugel mit Schnittkreis,
   Tangentialebene, Orten mit drei Kugeln) · vier Erkläranimationen ·
   Labor (Kugel mit Gerade oder Ebene, Abstand per Regler) · Übungen aus
   vier Generatoren · roter Faden · Kolloquium.
   Logik in gfsKugeln.js (getestet in tests/gfsKugeln.test.mjs).
   3D-Bilder: orthografische Projektion kamera() aus func16.jsx; Kugel als
   Umriss mit Äquator, Kreise auf der Kugel vorne durchgezogen, hinten
   gestrichelt. Farben: Kugel Blau, Gerade/Ebene Gold, Ergebnis Smaragd.
   ============================================================ */

const KNOPF = (aktiv = true, farbe = C.see) => ({
  background: aktiv ? farbe : C.hellgrau, color: C.weiss, border: "none", borderRadius: 999, fontSize: 15, fontWeight: 600,
  fontFamily: "inherit", cursor: aktiv ? "pointer" : "default",
});
const LINK = { background: "none", border: "none", color: C.see, fontSize: 13, fontFamily: "inherit", cursor: "pointer", padding: 0, textDecoration: "underline" };
/* aktuelle Aufgabe für automatische Prüfungen (tests/ui/gfskugeln.ui.py) */
const merk = (a) => { if (typeof window !== "undefined") window.__kugelAufgabe = a; return a; };

const T = (props) => <text fontFamily="inherit" {...props} />;
/* Beschriftung mit hellem Rand, damit sie über Linien lesbar bleibt */
const TR = ({ grund = C.sand, ...props }) => <T stroke={grund} strokeWidth="3.4" strokeLinejoin="round" paintOrder="stroke" {...props} />;

/* ======================================================================
   3D-Hilfen (Weltkoordinaten x₁, x₂, x₃; Bild: x nach rechts, y nach unten)
   ====================================================================== */
const plus = (a, b) => a.map((x, i) => x + b[i]);
const minus = (a, b) => a.map((x, i) => x - b[i]);
const mal = (a, k) => a.map((x) => x * k);
const pkt = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const laenge = (a) => Math.sqrt(pkt(a, a));
const einheit = (a) => mal(a, 1 / laenge(a));
const kreuzF = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
/* zwei Einheitsvektoren senkrecht zu n (und zueinander) */
function basis(n) {
  const n0 = einheit(n);
  const k = kreuzF(n0, [0, 0, 1]);
  const e1 = laenge(k) < 1e-9 ? [1, 0, 0] : einheit(k);
  return [e1, kreuzF(n0, e1)];
}
const CAM = kamera(0.55, 0.34);
const BLICK = CAM.blick;
/* Welt → Bild; der Weltpunkt mitte liegt bei (cx, cy), s Pixel je Längeneinheit */
function projektor(mitte, s, cx, cy) {
  const pm = CAM.proj(mitte);
  return (X) => { const p = CAM.proj(X); return [cx + (p.u - pm.u) * s, cy - (p.v - pm.v) * s]; };
}
const f1 = (x) => x.toFixed(1);
const pfad = (punkte) => punkte.map(([x, y], i) => `${i ? "L" : "M"}${f1(x)} ${f1(y)}`).join("");
/* Punktfolge mit Sichtbarkeit → zwei Pfade: sichtbar (vorn) und verdeckt (hinten) */
function zerlegen(P, punkte, sichtbar) {
  let vorn = "", hinten = "", alt = null, lp = null;
  for (const X of punkte) {
    const s = sichtbar(X), [x, y] = P(X);
    const seg = s !== alt ? `${lp ? `M${f1(lp[0])} ${f1(lp[1])}L` : "M"}${f1(x)} ${f1(y)}` : `L${f1(x)} ${f1(y)}`;
    if (s) vorn += seg; else hinten += seg;
    alt = s; lp = [x, y];
  }
  return { vorn, hinten };
}
/* Kreis um F mit Radius rho in der Ebene von e1, e2 */
const kreis = (F, e1, e2, rho, n = 96) => Array.from({ length: n + 1 }, (_, i) => {
  const a = (2 * Math.PI * i) / n;
  return plus(F, plus(mal(e1, rho * Math.cos(a)), mal(e2, rho * Math.sin(a))));
});
/* ein Punkt auf der Kugel ist sichtbar, wenn er zur Betrachterseite zeigt */
const vorneAuf = (Mk) => (X) => pkt(minus(X, Mk), BLICK) >= -1e-9;
/* ein Punkt im Raum ist sichtbar, wenn die Kugel ihn nicht verdeckt */
const nichtVerdeckt = (Mk, r) => (X) => {
  const w = minus(X, Mk), t = pkt(w, BLICK), q2 = pkt(w, w) - t * t;
  return !(q2 < r * r - 1e-9 && t < Math.sqrt(r * r - q2));
};
const strecke = (A, B, n = 120) => Array.from({ length: n + 1 }, (_, i) => plus(A, mal(minus(B, A), i / n)));

/* ---------- Bildbausteine ---------- */
function Kugel({ P, Mk, r, s, id, o = 1, aequator = true }) {
  if (o <= 0.001) return null;
  const [cx, cy] = P(Mk);
  const aeq = aequator ? zerlegen(P, kreis(Mk, [1, 0, 0], [0, 1, 0], r), vorneAuf(Mk)) : null;
  return (
    <g opacity={o}>
      <defs>
        <radialGradient id={id} cx="36%" cy="28%" r="80%">
          <stop offset="0%" stopColor={C.weiss} />
          <stop offset="55%" stopColor={C.himmel} />
          <stop offset="100%" stopColor="#B4C7E6" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r * s} fill={`url(#${id})`} stroke={C.see} strokeWidth="1.6" />
      {aeq && <path d={aeq.hinten} fill="none" stroke={C.see} strokeWidth="1" strokeDasharray="3 4" opacity="0.35" />}
      {aeq && <path d={aeq.vorn} fill="none" stroke={C.see} strokeWidth="1.1" opacity="0.45" />}
    </g>
  );
}

function Flaeche({ P, F, e1, e2, a, o = 1, farbe = C.flaggold, fuell = 0.16, name, linie = C.gold }) {
  if (o <= 0.001) return null;
  const ecken = [[1, 1], [-1, 1], [-1, -1], [1, -1]].map(([i, j]) => P(plus(F, plus(mal(e1, a * i), mal(e2, a * j)))));
  const unten = ecken.reduce((b, p) => (p[1] > b[1] ? p : b), ecken[0]);
  return (
    <g opacity={o}>
      <path d={`${pfad(ecken)}Z`} fill={farbe} fillOpacity={fuell} stroke={linie} strokeWidth="1.2" strokeOpacity="0.75" strokeLinejoin="round" />
      {name && <TR x={unten[0] + 6} y={unten[1] - 6} fontSize="13" fontWeight="800" fill={linie}>{name}</TR>}
    </g>
  );
}

function Pkt({ p, farbe = C.tinte, r = 3.6, name, dx = 7, dy = -7, o = 1, anker = "start", gross = 12.5 }) {
  if (o <= 0.001) return null;
  return (
    <g opacity={o}>
      <circle cx={p[0]} cy={p[1]} r={r} fill={farbe} stroke={C.weiss} strokeWidth="1.3" />
      {name && <TR x={p[0] + dx} y={p[1] + dy} textAnchor={anker} fontSize={gross} fontWeight="800" fill={farbe}>{name}</TR>}
    </g>
  );
}

/* Glanzpunkt für den Kern-Moment (Berührpunkt) */
function Glanz({ p, o = 1 }) {
  if (o <= 0.001) return null;
  return <circle cx={p[0]} cy={p[1]} r="13" fill={C.flaggold} opacity={0.4 * o} />;
}

/* rechter Winkel bei V zwischen den Richtungen nach A und B (in der Welt gezeichnet) */
function Winkel({ P, V, A, B, k = 0.55, farbe = C.tinte, o = 1 }) {
  if (o <= 0.001) return null;
  const a = einheit(minus(A, V)), b = einheit(minus(B, V));
  return <path d={pfad([P(plus(V, mal(a, k))), P(plus(V, plus(mal(a, k), mal(b, k)))), P(plus(V, mal(b, k)))])} fill="none" stroke={farbe} strokeWidth="1.2" opacity={o} />;
}

function Pille({ x, y, text, o = 1, farbe = C.see, voll = false, breite, gross = 12.5 }) {
  if (o <= 0.001) return null;
  const w = breite || Math.max(44, String(text).length * gross * 0.56 + 22);
  return (
    <g opacity={o}>
      <rect x={x - w / 2} y={y - gross - 4} width={w} height={gross + 13} rx={(gross + 13) / 2} fill={voll ? farbe : C.weiss} stroke={farbe} strokeWidth="1.4" />
      <T x={x} y={y + 1} textAnchor="middle" fontSize={gross} fontWeight="800" fill={voll ? C.weiss : farbe}>{text}</T>
    </g>
  );
}

/* Linie durch die Welt, von der Kugel verdeckte Teile gestrichelt */
function Linie({ P, A, B, Mk, r, farbe = C.gold, breite = 2.2, o = 1 }) {
  if (o <= 0.001) return null;
  const { vorn, hinten } = zerlegen(P, strecke(A, B), Mk ? nichtVerdeckt(Mk, r) : () => true);
  return (
    <g opacity={o} fill="none" strokeLinecap="round">
      {hinten && <path d={hinten} stroke={farbe} strokeWidth={breite * 0.7} strokeDasharray="4 4" opacity="0.55" />}
      {vorn && <path d={vorn} stroke={farbe} strokeWidth={breite} />}
    </g>
  );
}

/* ======================================================================
   Kopfbild (viewBox 160 × 120): Kugel r = 5, waagrechte Ebene im Abstand
   d = 3 unter M schneidet den Kreis mit ρ = 4 aus (3-4-5-Dreieck), dazu eine
   Tangente am Umriss. Die Ebene verdeckt die untere Kappe, die obere Kappe
   liegt über ihr – exakt projiziert wie alle Bilder der Seite.
   ====================================================================== */
export function KugelnBild() {
  const s = 7.4, Mk = [0, 0, 0], r = 5, P = projektor(Mk, s, 78, 58);
  const [cx, cy] = P(Mk), R = r * s;
  const F = [0, 0, -3], rho = 4;
  const ring = zerlegen(P, kreis(F, [1, 0, 0], [0, 1, 0], rho, 120), vorneAuf(Mk));
  /* Umriss der oberen Kappe: vorderer Bogen des Schnittkreises, dann oben über den Kugelrand zurück */
  const vorne = kreis(F, [1, 0, 0], [0, 1, 0], rho, 240).filter(vorneAuf(Mk)).map(P).sort((a, b) => a[0] - b[0]);
  const links = vorne[0];
  const kappe = `${pfad(vorne)}A${R} ${R} 0 1 0 ${f1(links[0])} ${f1(links[1])}Z`;
  const ecken = [[1, 1], [-1, 1], [-1, -1], [1, -1]].map(([i, j]) => P([6.2 * i, 6.2 * j, -3]));
  const beta = -0.86, B = [cx + R * Math.cos(beta), cy + R * Math.sin(beta)], dir = [-Math.sin(beta), Math.cos(beta)];
  const tangente = `M${f1(B[0] - 36 * dir[0])} ${f1(B[1] - 36 * dir[1])}L${f1(B[0] + 30 * dir[0])} ${f1(B[1] + 30 * dir[1])}`;
  return (
    <svg className="gtk-bild" viewBox="0 0 160 120" role="img" style={{ width: "100%", maxWidth: 300, margin: "10px auto 0", justifySelf: "center" }}
      aria-label="Kugel mit einer Ebene, die einen goldenen Schnittkreis ausschneidet, und einer Tangente, die die Kugel in einem Punkt berührt">
      <defs>
        <radialGradient id="gku-k-kugel" cx="34%" cy="26%" r="82%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="30%" stopColor="#C9D6EE" />
          <stop offset="70%" stopColor="#2F5296" />
          <stop offset="100%" stopColor="#0B1B44" />
        </radialGradient>
        <linearGradient id="gku-k-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#FFF3C4" /><stop offset="45%" stopColor={C.flaggold} /><stop offset="100%" stopColor={C.goldWarm} /></linearGradient>
        <radialGradient id="gku-k-glut" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor={C.flaggold} stopOpacity="0.75" /><stop offset="100%" stopColor={C.flaggold} stopOpacity="0" /></radialGradient>
        <clipPath id="gku-k-kappe"><path d={kappe} /></clipPath>
      </defs>
      <ellipse className="gtk-glimmen" cx={cx} cy={cy + 6} rx="58" ry="40" fill="url(#gku-k-glut)" opacity="0.35" />
      <g className="gtk-auf">
        <circle cx={cx} cy={cy} r={R} fill="url(#gku-k-kugel)" opacity="0.8" />
        <path d={`${pfad(ecken)}Z`} fill="rgba(237,187,0,0.16)" stroke="rgba(237,187,0,0.6)" strokeWidth="0.9" strokeLinejoin="round" />
        <path d={`${pfad(ecken)}Z`} fill="rgba(14,12,8,0.38)" stroke="none" />
        <path d={ring.hinten} fill="none" stroke={C.flaggold} strokeWidth="0.9" strokeDasharray="2.2 2.2" opacity="0.6" />
      </g>
      <g className="gtk-auf" style={{ animationDelay: ".2s" }}>
        <circle cx={cx} cy={cy} r={R} fill="url(#gku-k-kugel)" clipPath="url(#gku-k-kappe)" />
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.7" clipPath="url(#gku-k-kappe)" />
      </g>
      <g className="gtk-auf" style={{ animationDelay: ".4s" }}>
        <path d={ring.vorn} fill="none" stroke="url(#gku-k-gold)" strokeWidth="2" strokeLinecap="round" />
      </g>
      <g className="gtk-auf" style={{ animationDelay: ".6s" }}>
        <path d={tangente} fill="none" stroke="url(#gku-k-gold)" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx={B[0]} cy={B[1]} r="6" fill="url(#gku-k-glut)" />
        <circle cx={B[0]} cy={B[1]} r="2.4" fill={C.flaggold} stroke={C.weiss} strokeWidth="0.8" />
        <circle cx={cx} cy={cy} r="1.8" fill={C.weiss} />
        <T x={cx - 4} y={cy - 3.5} textAnchor="end" fontFamily="Montserrat, sans-serif" fontSize="9" fontWeight="800" fill={C.weiss}>M</T>
      </g>
    </svg>
  );
}

/* ======================================================================
   Erkläranimationen (Szenen sind reine Funktionen der Zeit; Schlussbild = Standbild)
     gleichung   – vom Abstand zur Kugelgleichung: Quader, zweimal Pythagoras
     gerade      – Gerade mit Abstand d = 3, 5, 6: Sekante, Tangente, Passante
     ebene       – Ebene nähert sich: kein Punkt, Berührpunkt, Schnittkreis ρ = 4
     tangential  – Tangentialebene in B(5 | −1 | 7), danach gekippte Ebene
   ====================================================================== */
const BSP = { m: [2, -1, 3], r: 5 };

/* 1 · Vom Abstand zur Gleichung */
const G_DAUER = 23;
const gSchritte = () => [
  { von: 0, text: "Eine Kugel besteht aus allen Punkten X, die vom Mittelpunkt M denselben Abstand r haben." },
  { von: 4, text: "Von M nach X geht es um x₁ − m₁, x₂ − m₂ und x₃ − m₃ entlang der drei Achsen." },
  { von: 9, text: "Pythagoras zweimal: erst in der Grundfläche, dann mit der Höhe. |MX|² ist die Summe der drei Quadrate." },
  { von: 14, text: "X wandert, der Abstand bleibt r. Alle diese Punkte zusammen bilden die Kugel." },
  { von: 19, text: "Quadriert ergibt das die Kugelgleichung: (x₁ − m₁)² + (x₂ − m₂)² + (x₃ − m₃)² = r²." },
];
const G_W = mal(einheit([1.8, 3.2, 3.3]), 5);
const G_AZ = Math.atan2(G_W[1], G_W[0]), G_EL = Math.asin(G_W[2] / 5);
const gLage = (w) => {   // Wanderung über die Kugel: einmal herum, dabei unter den Äquator und zurück
  const az = G_AZ + 2 * Math.PI * w, el = G_EL - (G_EL + 0.55) * Math.sin(Math.PI * w);
  return [5 * Math.cos(el) * Math.cos(az), 5 * Math.cos(el) * Math.sin(az), 5 * Math.sin(el)];
};
/* Beschriftung neben der Mitte einer Strecke, um (dx, dy) versetzt */
const mitteVon = (a, b, dx = 0, dy = 0) => [(a[0] + b[0]) / 2 + dx, (a[1] + b[1]) / 2 + dy];
function gZeichne(t) {
  const O = [0, 0, 0], r = 5;
  const sk = 34 - 14 * lauf(t, 14, 15.4);          // zuerst nah am Quader, dann die ganze Kugel
  const P = projektor(O, sk, 180, 146 - 10 * lauf(t, 14, 15.4));
  const wander = lauf(t, 14.6, 18.6);
  const X = gLage(wander);
  const A1 = [G_W[0], 0, 0], A2 = [G_W[0], G_W[1], 0];
  const kasten = 1 - lauf(t, 14, 14.8);
  const k1 = lauf(t, 4.4, 5.6), k2 = lauf(t, 5.6, 6.8), k3 = lauf(t, 6.8, 8);
  const diag = lauf(t, 9.4, 10.4), dreieck = lauf(t, 11, 12.2);
  const formel1 = lauf(t, 10.4, 11.6) * (1 - lauf(t, 18.6, 19.4)), formel2 = lauf(t, 19.2, 20.4);
  const kugel = lauf(t, 15.2, 17.6);
  const spur = wander > 0.001 ? zerlegen(P, Array.from({ length: 81 }, (_, i) => gLage((wander * i) / 80)), vorneAuf(O)) : null;
  const pM = P(O), pX = P(X);
  const kante = (A, B, p) => (p > 0.001 ? <path d={pfad([P(A), P(plus(A, mal(minus(B, A), p)))])} stroke={C.see} strokeWidth="2" fill="none" strokeLinecap="round" /> : null);
  const [l1, l2, l3] = [mitteVon(P(O), P(A1), -14, 0), mitteVon(P(A1), P(A2), 0, 20), mitteVon(P(A2), P(G_W), 8, 4)];
  /* der ganze Quader dünn, damit man ihn räumlich liest */
  const [w1, w2, w3] = G_W;
  const ecke = (i, j, k) => [i * w1, j * w2, k * w3];
  const quader = [];
  for (const [a, b] of [[[0, 0, 0], [0, 1, 0]], [[0, 0, 0], [0, 0, 1]], [[1, 0, 0], [1, 0, 1]], [[0, 1, 0], [1, 1, 0]], [[0, 1, 0], [0, 1, 1]],
    [[0, 0, 1], [1, 0, 1]], [[0, 0, 1], [0, 1, 1]], [[1, 0, 1], [1, 1, 1]], [[0, 1, 1], [1, 1, 1]]]) quader.push([P(ecke(...a)), P(ecke(...b))]);
  const lr = mitteVon(pM, pX, -8, -6);
  return (
    <g>
      <Kugel P={P} Mk={O} r={r} s={sk} id="gku-a1" o={kugel} />
      {spur && <path d={spur.hinten} fill="none" stroke={C.gold} strokeWidth="1.4" strokeDasharray="2 3" opacity="0.5" />}
      {spur && <path d={spur.vorn} fill="none" stroke={C.gold} strokeWidth="1.8" opacity="0.9" />}
      <g opacity={kasten}>
        <g opacity={0.5 * k3}>{quader.map(([a, b], i) => <path key={i} d={pfad([a, b])} stroke={C.hellgrau} strokeWidth="1" strokeDasharray="3 3" fill="none" />)}</g>
        {kante(O, A1, k1)}{kante(A1, A2, k2)}{kante(A2, G_W, k3)}
        <TR x={l1[0]} y={l1[1]} textAnchor="end" fontSize="12.5" fontWeight="700" fill={C.see} opacity={k1}>x₁ − m₁</TR>
        <TR x={l2[0]} y={l2[1]} textAnchor="middle" fontSize="12.5" fontWeight="700" fill={C.see} opacity={k2}>x₂ − m₂</TR>
        <TR x={l3[0]} y={l3[1]} fontSize="12.5" fontWeight="700" fill={C.see} opacity={k3}>x₃ − m₃</TR>
        <Winkel P={P} V={A1} A={O} B={A2} k={0.35} farbe={C.see} o={k2} />
        {diag > 0.001 && <path d={pfad([P(O), P(mal(A2, diag))])} stroke={C.flaggold} strokeWidth="2.4" fill="none" strokeLinecap="round" />}
        {dreieck > 0.001 && <path d={`${pfad([P(O), P(A2), P(G_W)])}Z`} fill={C.flaggold} fillOpacity={0.22 * dreieck} stroke="none" />}
        <Winkel P={P} V={A2} A={O} B={G_W} k={0.35} farbe={C.gold} o={dreieck} />
      </g>
      {/* Strecke MX mit r */}
      <path d={pfad([pM, plus(pM, mal(minus(pX, pM), lauf(t, 1.6, 3)))])} stroke={C.tinte} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <TR x={lr[0]} y={lr[1]} textAnchor="end" fontSize="14" fontWeight="800" fill={C.tinte} opacity={lauf(t, 2.6, 3.4)}>r</TR>
      <Pkt p={pM} name="M" dx={-8} dy={-8} anker="end" o={lauf(t, 0.2, 1)} />
      <Pkt p={pX} name="X" farbe={C.gold} r={4.4} o={lauf(t, 1, 1.8)} />
      <TR x="180" y="270" textAnchor="middle" fontSize="12.5" fontWeight="700" fill={C.tinte} opacity={formel1}>|MX|² = (x₁ − m₁)² + (x₂ − m₂)² + (x₃ − m₃)²</TR>
      <Pille x={180} y={272} text="(x₁ − m₁)² + (x₂ − m₂)² + (x₃ − m₃)² = r²" farbe={C.gold} voll o={formel2} breite={318} gross={12.5} />
      <TR x="180" y="296" textAnchor="middle" fontSize="11.5" fontWeight="600" fill={C.grau} opacity={formel2}>für alle Punkte X der Kugel – und nur für sie</TR>
    </g>
  );
}

/* 2 · Gerade und Kugel */
const R_DAUER = 26;
const rSchritte = () => [
  { von: 0, text: "Kugel um M(2 | −1 | 3) mit r = 5. Die Gerade g hat die Richtung (−3 | 4 | 0) und von M den Abstand d = 3." },
  { von: 5, text: "Setzt man g in die Kugelgleichung ein, entsteht 25t² − 50t + d² = 0. Die Diskriminante ist D = 100(25 − d²)." },
  { von: 10, text: "Bei d = 3 ist D = 1600 > 0: zwei Lösungen t = 0,2 und t = 1,8, also zwei Schnittpunkte. g ist eine Sekante." },
  { von: 15, text: "g wandert nach oben. Bei d = 5 = r wird D = 0: genau ein Berührpunkt B(2 | −1 | 8). g ist eine Tangente." },
  { von: 21, text: "Bei d = 6 ist D < 0: keine Lösung, kein gemeinsamer Punkt. g ist eine Passante." },
];
function rZeichne(t) {
  const { m: Mk, r } = BSP, s = 17, P = projektor(Mk, s, 180, 158);
  const d = 3 + 2 * lauf(t, 15.4, 17.8) + lauf(t, 21.4, 22.8);
  const p = [5, -5, 3 + d], u = [-3, 4, 0];
  const fuss = plus(Mk, [0, 0, d]);
  const rest = 25 - d * d, D = 100 * rest;
  const zwei = rest > 1e-6, beruehrt = Math.abs(rest) < 1e-6;
  const S = zwei ? [-1, 1].map((sg) => plus(p, mal(u, 1 + (sg * Math.sqrt(rest)) / 5))) : [];
  const punkte = lauf(t, 10.6, 11.6), glanz = lauf(t, 17.6, 18.4);
  const lage = D > 1e-6 ? ["Sekante: zwei Schnittpunkte", C.see, false] : beruehrt ? ["Tangente: ein Berührpunkt", C.gold, true] : ["Passante: kein gemeinsamer Punkt", C.grau, false];
  const pM = P(Mk), pF = P(fuss);
  return (
    <g>
      <Kugel P={P} Mk={Mk} r={r} s={s} id="gku-a2" o={lauf(t, 0.2, 1.2)} />
      <Linie P={P} A={plus(p, mal(u, -0.9))} B={plus(p, mal(u, 2.9))} Mk={Mk} r={r} o={lauf(t, 1, 2.2)} />
      <TR x={P(plus(p, mal(u, 2.9)))[0] - 2} y={P(plus(p, mal(u, 2.9)))[1] - 8} textAnchor="end" fontSize="13" fontWeight="800" fill={C.gold} opacity={lauf(t, 1.4, 2.4)}>g</TR>
      <g opacity={lauf(t, 2.4, 3.4)}>
        <path d={pfad([pM, pF])} stroke={C.tinte} strokeWidth="1.4" strokeDasharray="4 3" fill="none" />
        <Winkel P={P} V={fuss} A={Mk} B={plus(fuss, u)} k={0.45} />
        <TR x={(pM[0] + pF[0]) / 2 - 7} y={(pM[1] + pF[1]) / 2 + 4} textAnchor="end" fontSize="12.5" fontWeight="800" fill={C.tinte}>d</TR>
      </g>
      {zwei && punkte > 0.001 && <path d={pfad([P(S[0]), P(S[1])])} stroke={C.smaragd} strokeWidth="3" opacity={0.85 * punkte} fill="none" strokeLinecap="round" />}
      {zwei && <Pkt p={P(S[0])} farbe={C.smaragd} r={4.4} name="S₁" dx={-2} dy={16} anker="end" o={punkte} />}
      {zwei && <Pkt p={P(S[1])} farbe={C.smaragd} r={4.4} name="S₂" dx={2} dy={16} o={punkte} />}
      {beruehrt && <Glanz p={pF} o={glanz} />}
      {beruehrt && <Pkt p={pF} farbe={C.gold} r={5} name="B" dx={2} dy={-10} o={glanz} />}
      <Pkt p={pM} name="M" dx={-8} dy={14} anker="end" o={lauf(t, 0.3, 1.1)} />
      <Pille x={180} y={20} text={lage[0]} farbe={lage[1]} voll={lage[2]} o={lauf(t, 10.4, 11.2)} breite={250} gross={12.5} />
      <g opacity={lauf(t, 5.4, 6.4)}>
        <TR x="180" y="270" textAnchor="middle" fontSize="13" fontWeight="800" fill={C.tinte}>25t² − 50t + d² = 0</TR>
        <TR x="180" y="294" textAnchor="middle" fontSize="12.5" fontWeight="700" fill={D > 1e-6 ? C.see : beruehrt ? C.gold : C.grau}>
          {`d = ${dk(d, 2)} · D = 100(25 − d²) = ${dk(D, 0)} ${D > 1e-6 ? "> 0" : beruehrt ? "" : "< 0"}`}
        </TR>
      </g>
    </g>
  );
}

/* 3 · Ebene und Kugel */
const E_DAUER = 25;
const eSchritte = () => [
  { von: 0, text: "Eine Ebene mit dem Normalenvektor (2 | 1 | −2) nähert sich der Kugel. Es zählt nur ihr Abstand d von M." },
  { von: 5, text: "Bei d = 5 = r berührt die Ebene die Kugel in genau einem Punkt: im Fußpunkt des Lotes von M." },
  { von: 10, text: "Bei d = 3 schneidet die Ebene einen Kreis aus. Sein Mittelpunkt ist der Lotfußpunkt F(4 | 0 | 1)." },
  { von: 15, text: "M, F und ein Kreispunkt X bilden ein rechtwinkliges Dreieck: d² + ρ² = r², also ρ = 4." },
  { von: 20, text: "Geht die Ebene durch M (d = 0), ist der Schnitt ein Großkreis mit ρ = r = 5." },
];
const E_N0 = einheit([2, 1, -2]);
const [E_E1, E_E2] = basis([2, 1, -2]);
function eZeichne(t) {
  const { m: Mk, r } = BSP, s = 17, P = projektor(Mk, s, 180, 128);
  const d = 7.5 - 1.5 * lauf(t, 1.4, 3.6) - lauf(t, 5.4, 7.2) - 2 * lauf(t, 10.4, 12.4) - 3 * lauf(t, 20.4, 22.4);
  const F = plus(Mk, mal(E_N0, d));
  const rho2 = r * r - d * d, rho = rho2 > 0 ? Math.sqrt(rho2) : 0;
  const beruehrt = Math.abs(rho2) < 1e-6;
  const ring = rho > 1e-6 ? zerlegen(P, kreis(F, E_E1, E_E2, rho), vorneAuf(Mk)) : null;
  const X = plus(F, mal(E_E1, -rho));
  const dreieck = lauf(t, 15.4, 16.8) * (1 - lauf(t, 19.6, 20.4));
  const pM = P(Mk), pF = P(F), pX = P(X);
  return (
    <g>
      <Kugel P={P} Mk={Mk} r={r} s={s} id="gku-a3" o={lauf(t, 0.2, 1.2)} aequator={false} />
      <Flaeche P={P} F={F} e1={E_E1} e2={E_E2} a={7} o={lauf(t, 0.6, 1.8)} name="E" />
      {ring && <path d={ring.hinten} fill="none" stroke={C.smaragd} strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />}
      {ring && <path d={ring.vorn} fill="none" stroke={C.smaragd} strokeWidth="2.8" strokeLinecap="round" />}
      <g opacity={lauf(t, 1.6, 2.6) * Math.min(1, d / 0.8)}>
        <path d={pfad([pM, pF])} stroke={C.tinte} strokeWidth="1.4" strokeDasharray="4 3" fill="none" />
        <TR x={(pM[0] + pF[0]) / 2 - 7} y={(pM[1] + pF[1]) / 2 + 4} textAnchor="end" fontSize="12.5" fontWeight="800" fill={C.tinte}>d</TR>
      </g>
      {dreieck > 0.001 && (
        <g opacity={dreieck}>
          <path d={`${pfad([pM, pF, pX])}Z`} fill={C.flaggold} fillOpacity="0.22" stroke={C.gold} strokeWidth="1.6" strokeLinejoin="round" />
          <Winkel P={P} V={F} A={Mk} B={X} k={0.55} farbe={C.gold} />
          <TR x={(pF[0] + pX[0]) / 2} y={(pF[1] + pX[1]) / 2 + 16} textAnchor="middle" fontSize="13" fontWeight="800" fill={C.smaragd}>ρ</TR>
          <TR x={(pM[0] + pX[0]) / 2 + 8} y={(pM[1] + pX[1]) / 2 - 4} fontSize="13" fontWeight="800" fill={C.see}>r</TR>
          <Pkt p={pX} farbe={C.smaragd} name="X" dx={8} dy={4} />
        </g>
      )}
      {beruehrt && <Glanz p={pF} o={lauf(t, 7, 7.8)} />}
      <Pkt p={pF} farbe={beruehrt ? C.gold : d < r ? C.smaragd : C.grau} r={beruehrt ? 5 : 3.6} name={beruehrt ? "Berührpunkt" : d < r ? "F" : ""} dx={9} dy={beruehrt ? 16 : 14} o={lauf(t, 1.6, 2.6) * (d < 1e-6 ? 0 : 1)} />
      <Pkt p={pM} name="M" dx={-8} dy={-7} anker="end" o={lauf(t, 0.3, 1.1)} />
      <Pille x={92} y={22} text={`d = ${dk(d, 1)}`} farbe={C.tinte} o={lauf(t, 1.6, 2.4)} breite={100} />
      <Pille x={268} y={22} text={rho2 > 1e-6 ? `ρ = ${dk(rho, 2)}` : beruehrt ? "d = r" : "d > r"} farbe={rho2 > 1e-6 ? C.smaragd : beruehrt ? C.gold : C.grau} voll={beruehrt} o={lauf(t, 1.6, 2.4)} breite={100} />
    </g>
  );
}

/* 4 · Tangentialebene */
const T_DAUER = 22;
const tSchritte = () => [
  { von: 0, text: "B(6 | −4 | 3) liegt auf der Kugel um M(2 | −1 | 3) mit r = 5. Der Radius von M nach B ist (4 | −3 | 0)." },
  { von: 5, text: "Die Ebene durch B senkrecht zu diesem Radius ist T: 4x₁ − 3x₂ = 36." },
  { von: 10, text: "Ein Punkt X wandert in T. Pythagoras: MX² = r² + BX². Für jedes X außer B ist das mehr als r²." },
  { von: 16, text: "Kippt man die Ebene um B, kommt sie M näher als r und schneidet einen Kreis aus. Nur die senkrechte Ebene berührt." },
];
const T_B = [6, -4, 3], T_N0 = [0.8, -0.6, 0], T_E1 = [0, 0, 1], T_E2 = [0.6, 0.8, 0];
function tZeichne(t) {
  const { m: Mk, r } = BSP, s = 15, P = projektor(Mk, s, 214, 152);
  const rx = 4 * lauf(t, 10.4, 12), a = 1.1 * Math.PI * lauf(t, 12.4, 15.2);
  const X = plus(T_B, plus(mal(T_E1, rx * Math.cos(a)), mal(T_E2, rx * Math.sin(a))));
  const xo = lauf(t, 10.4, 11) * (1 - lauf(t, 15.4, 16.2));
  const alpha = (Math.PI / 6) * lauf(t, 16.4, 18.6);
  const nA = plus(mal(T_N0, Math.cos(alpha)), mal(T_E2, Math.sin(alpha)));
  const [k1, k2] = basis(nA);
  const dA = r * Math.cos(alpha), rhoA = r * Math.sin(alpha);
  const FA = plus(Mk, mal(nA, dA));
  const ring = rhoA > 1e-3 ? zerlegen(P, kreis(FA, k1, k2, rhoA), vorneAuf(Mk)) : null;
  const kipp = lauf(t, 16.4, 17);
  const pM = P(Mk), pB = P(T_B), pX = P(X);
  const bx2 = rx * rx;
  return (
    <g>
      <Kugel P={P} Mk={Mk} r={r} s={s} id="gku-a4" o={lauf(t, 0.2, 1.2)} aequator={false} />
      <Flaeche P={P} F={T_B} e1={T_E1} e2={T_E2} a={6} o={lauf(t, 5.4, 6.8) * (1 - 0.7 * kipp)} fuell={0.12} name="T" />
      {kipp > 0.001 && <Flaeche P={P} F={T_B} e1={k1} e2={k2} a={6} o={kipp} linie={C.gold} fuell={0.2} />}
      {ring && <path d={ring.hinten} fill="none" stroke={C.smaragd} strokeWidth="1.4" strokeDasharray="4 4" opacity="0.6" />}
      {ring && <path d={ring.vorn} fill="none" stroke={C.smaragd} strokeWidth="2.6" strokeLinecap="round" />}
      <g opacity={lauf(t, 0.8, 2)}>
        <path d={pfad([pM, pB])} stroke={C.see} strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <TR x={(pM[0] + pB[0]) / 2} y={(pM[1] + pB[1]) / 2 + 18} textAnchor="middle" fontSize="12.5" fontWeight="800" fill={C.see}>r = 5</TR>
      </g>
      <Winkel P={P} V={T_B} A={Mk} B={plus(T_B, T_E1)} k={0.9} farbe={C.gold} o={lauf(t, 6, 7) * (1 - kipp)} />
      {xo > 0.001 && rx > 0.01 && (
        <g opacity={xo}>
          <path d={`${pfad([pM, pB, pX])}Z`} fill={C.flaggold} fillOpacity="0.18" stroke="none" />
          <path d={pfad([pB, pX])} stroke={C.gold} strokeWidth="2" fill="none" />
          <path d={pfad([pM, pX])} stroke={C.tinte} strokeWidth="1.4" strokeDasharray="4 3" fill="none" />
          <Pkt p={pX} farbe={C.gold} name="X" dx={8} dy={-6} />
        </g>
      )}
      <Pkt p={pM} name="M" dx={8} dy={-6} o={lauf(t, 0.3, 1.1)} />
      <Glanz p={pB} o={lauf(t, 0.6, 1.4) * (1 - lauf(t, 3, 4))} />
      <Pkt p={pB} farbe={C.gold} r={4.6} name="B" dx={-9} dy={16} anker="end" o={lauf(t, 0.4, 1.2)} />
      <TR x="180" y="290" textAnchor="middle" fontSize="12.5" fontWeight="800" fill={C.tinte} opacity={lauf(t, 10.6, 11.4) * (1 - lauf(t, 15.4, 16.2))}>
        {`MX² = r² + BX² = 25 + ${dk(bx2, 1)} = ${dk(25 + bx2, 1)}`}
      </TR>
      <TR x="180" y="290" textAnchor="middle" fontSize="12.5" fontWeight="800" fill={C.smaragd} opacity={lauf(t, 16.6, 17.4)}>
        {`Abstand von M: ${dk(dA, 2)} < 5 · Kreisradius ${dk(rhoA, 2)}`}
      </TR>
      <TR x="180" y="22" textAnchor="middle" fontSize="12.5" fontWeight="800" fill={C.gold} opacity={lauf(t, 5.6, 6.6) * (1 - kipp)}>T: 4x₁ − 3x₂ = 36</TR>
    </g>
  );
}

const KUGEL_ANIM = {
  gleichung: { titel: () => "Vom Abstand zur Kugelgleichung", unter: () => "Zweimal Pythagoras im Quader – und alle Punkte im Abstand r",
    szene: () => ({ dauer: G_DAUER, hoehe: 304, schritte: gSchritte(), zeichne: gZeichne,
      beschreibung: "Animation: Mittelpunkt M und ein Punkt X im Abstand r. Die Verbindung ist die Raumdiagonale eines Quaders mit den Kanten x₁ − m₁, x₂ − m₂, x₃ − m₃; zweimal Pythagoras ergibt |MX|². X wandert über die Kugel, am Ende steht die Kugelgleichung." }) },
  gerade: { titel: () => "Sekante, Tangente, Passante", unter: () => "Die Diskriminante D = 100(25 − d²) entscheidet",
    szene: () => ({ dauer: R_DAUER, hoehe: 304, schritte: rSchritte(), zeichne: rZeichne,
      beschreibung: "Animation: Kugel um M(2 | −1 | 3) mit r = 5 und eine Gerade mit Richtung (−3 | 4 | 0) im Abstand d über M. Bei d = 3 zwei Schnittpunkte, bei d = 5 ein Berührpunkt B(2 | −1 | 8), bei d = 6 kein gemeinsamer Punkt." }) },
  ebene: { titel: () => "Ebene und Kugel: der Schnittkreis", unter: () => "Abstand d gegen r, Radius ρ aus d² + ρ² = r²",
    szene: () => ({ dauer: E_DAUER, hoehe: 310, schritte: eSchritte(), zeichne: eZeichne,
      beschreibung: "Animation: Eine Ebene mit Normalenvektor (2 | 1 | −2) nähert sich der Kugel. Bei d = 5 berührt sie, bei d = 3 schneidet sie einen Kreis mit Mittelpunkt F(4 | 0 | 1) und Radius 4 aus, bei d = 0 einen Großkreis." }) },
  tangential: { titel: () => "Die Tangentialebene", unter: () => "Warum der Radius senkrecht auf ihr steht",
    szene: () => ({ dauer: T_DAUER, hoehe: 304, schritte: tSchritte(), zeichne: tZeichne,
      beschreibung: "Animation: B(6 | −4 | 3) auf der Kugel, Tangentialebene 4x₁ − 3x₂ = 36 senkrecht zum Radius. Für einen Punkt X in der Ebene gilt MX² = 25 + BX². Eine um B gekippte Ebene schneidet die Kugel in einem Kreis." }) },
};

export function KugelnAnimation({ art, offen = false }) {
  return <AnimKarte szenen={KUGEL_ANIM} art={art} offen={offen} merkmal="data-kugel-anim" />;
}

/* ======================================================================
   Tafel der drei Lagen (Herleitung)
   ====================================================================== */
function LagenTafel({ zeilen }) {
  return (
    <div style={{ ...KARTE, padding: "12px 12px 8px", margin: "4px 0 18px" }} data-lagen-tafel="">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
        {zeilen.map(([bed, name, text, gold]) => (
          <div key={name} style={{ borderRadius: 12, padding: "10px 8px", textAlign: "center", background: gold ? "#FFF6D6" : C.sand, border: `1px solid ${gold ? C.flaggold : C.linie}` }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.tinte, marginBottom: 4 }}><M t={bed} /></div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: gold ? C.gruenDunkel : C.see, marginBottom: 2 }}>{name}</div>
            <div style={{ fontSize: 12, color: C.grau, lineHeight: 1.35 }}>{text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ======================================================================
   Labor: Kugel mit Gerade oder Ebene, Abstand per Regler
   ====================================================================== */
const LAGE_TEXT = {
  sekante: ["Sekante", "D > 0: zwei Lösungen t, zwei Schnittpunkte."],
  tangente: ["Tangente", "D = 0: genau eine Lösung – g berührt K."],
  passante: ["Passante", "D < 0: keine Lösung, kein gemeinsamer Punkt."],
  kreis: ["Schnittkreis", "d < r: E schneidet K in einem Kreis."],
  beruehrt: ["Berührpunkt", "d = r: E ist eine Tangentialebene."],
  keine: ["Kein gemeinsamer Punkt", "d > r: E geht an K vorbei."],
};
const ACHSEN = [[[1, 0, 0], "x₁"], [[0, 1, 0], "x₂"], [[0, 0, 1], "x₃"]];

function Regler3({ name, wert, setzen, label }) {
  return (
    <div className="flex items-center" style={{ gap: 8 }}>
      <span style={{ fontSize: 14, color: C.tinte, minWidth: 54 }}><M t={name} /> = <b style={{ fontWeight: 700 }}>{String(wert).replace("-", "−")}</b></span>
      <PlusMinus setzen={setzen} label={label} />
    </div>
  );
}

function KugelLabor() {
  const [modus, setModus] = useState("gerade");
  const [m, setM] = useState([2, -1, 3]);
  const [r, setR] = useState(5);
  const [sRoh, setS] = useState(3);
  const grenze = r + LABOR.extra;
  const s = Math.max(-grenze, Math.min(grenze, sRoh));
  const [lo, hi] = LABOR.m;
  const mSetzen = (i, dlt) => setM((alt) => alt.map((x, j) => (j === i ? Math.max(lo, Math.min(hi, x + dlt)) : x)));
  const rSetzen = (dlt) => setR((x) => Math.max(LABOR.r[0], Math.min(LABOR.r[1], x + dlt)));
  const g = laborGerade(m, r, s), e = laborEbene(m, r, s);
  const lage = modus === "gerade" ? g.lage : e.lage;
  const beruehrt = lage === "tangente" || lage === "beruehrt";
  const d = Math.abs(s);

  /* Bild */
  const S = 12.5, P = projektor([0, 0, 0], S, 180, 150);
  const pM = P(m);
  let bild;
  if (modus === "gerade") {
    const fuss = g.fuss, pF = P(fuss);
    bild = (
      <>
        <Kugel P={P} Mk={m} r={r} s={S} id="gku-labor" />
        <Linie P={P} A={plus(g.p, mal(LABOR.u, -2.4))} B={plus(g.p, mal(LABOR.u, 4.4))} Mk={m} r={r} />
        {d > 0 && <path d={pfad([pM, pF])} stroke={C.tinte} strokeWidth="1.3" strokeDasharray="4 3" fill="none" />}
        {d > 0 && <TR x={(pM[0] + pF[0]) / 2} y={(pM[1] + pF[1]) / 2 - 7} textAnchor="middle" fontSize="12" fontWeight="800" fill={C.tinte}>d</TR>}
        {g.lage === "sekante" && <path d={pfad(g.punkte.map(P))} stroke={C.smaragd} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.85" />}
        {g.lage === "sekante" && g.punkte.map((X, i) => <Pkt key={i} p={P(X)} farbe={C.smaragd} r={4.2} name={i ? "S₂" : "S₁"} dx={i ? 8 : -8} dy={i ? 5 : -6} anker={i ? "start" : "end"} />)}
        {g.lage === "tangente" && <Glanz p={pF} />}
        {g.lage === "tangente" && <Pkt p={pF} farbe={C.gold} r={5} name="B" dx={8} dy={-6} />}
      </>
    );
  } else {
    const [e1, e2] = basis(LABOR.n);
    const F = e.F.map((x) => x.z / x.n), pF = P(F);
    const rho = e.lage === "kreis" ? Math.sqrt(r * r - d * d) : 0;
    const ring = rho > 0 ? zerlegen(P, kreis(F, e1, e2, rho), vorneAuf(m)) : null;
    bild = (
      <>
        <Kugel P={P} Mk={m} r={r} s={S} id="gku-labor" aequator={false} />
        <Flaeche P={P} F={F} e1={e1} e2={e2} a={r + 2.5} name="E" />
        {ring && <path d={ring.hinten} fill="none" stroke={C.smaragd} strokeWidth="1.4" strokeDasharray="4 4" opacity="0.6" />}
        {ring && <path d={ring.vorn} fill="none" stroke={C.smaragd} strokeWidth="2.6" strokeLinecap="round" />}
        {d > 0 && <path d={pfad([pM, pF])} stroke={C.tinte} strokeWidth="1.3" strokeDasharray="4 3" fill="none" />}
        {d > 0 && <TR x={(pM[0] + pF[0]) / 2 - 7} y={(pM[1] + pF[1]) / 2 + 4} textAnchor="end" fontSize="12" fontWeight="800" fill={C.tinte}>d</TR>}
        {e.lage === "beruehrt" && <Glanz p={pF} />}
        {d > 0 && <Pkt p={pF} farbe={e.lage === "beruehrt" ? C.gold : e.lage === "kreis" ? C.smaragd : C.grau} r={e.lage === "beruehrt" ? 5 : 3.4} name={e.lage === "beruehrt" ? "B" : "F"} dx={9} dy={12} />}
      </>
    );
  }

  /* Rechnung */
  const zeilen = modus === "gerade"
    ? [
      `g: \\vec{x} = ${spalteTex(g.p)} + t \\cdot ${spalteTex(LABOR.u)}`,
      `\\text{eingesetzt: } ${quadTex(g.a, g.b, g.c)} = 0`,
      `D = b^2 − 4ac = ${kTex(g.D)}${g.D > 0 ? " > 0" : g.D < 0 ? " < 0" : ""}`,
      ...(g.lage === "passante" ? [] : g.punkteExakt
        ? [g.punkteExakt.map((X, i) => punktTex(g.lage === "tangente" ? "B" : `S_${i + 1}`, X)).join(", \\quad ")]
        : [g.punkte.map((X, i) => `S_${i + 1} \\approx (${X.map((x) => dk(x)).join(" \\mid ")})`).join(", \\quad ")]),
      ...(g.lage === "sekante" ? [`\\text{Sehne: } 2\\sqrt{r^2 − d^2} = 2\\sqrt{${r * r - d * d}}${wTex(g.sehne) === `2\\sqrt{${r * r - d * d}}` ? "" : ` = ${wTex(g.sehne)}`}`] : []),
    ]
    : [
      `E: ${ebeneTex(LABOR.n, e.k)}`,
      `d = \\frac{|\\vec{n} \\cdot \\vec{m} − k|}{|\\vec{n}|} = \\frac{${Math.abs(e.diff)}}{3} = ${kTex(q(Math.abs(e.diff), 3))}`,
      ...(e.lage === "keine" ? [`d = ${d} > ${r} = r`] : [punktTex(e.lage === "beruehrt" ? "B" : "F", e.F)]),
      ...(e.lage === "kreis" ? [`\\rho = \\sqrt{r^2 − d^2} = \\sqrt{${r * r - d * d}}${wTex(e.rho) === `\\sqrt{${r * r - d * d}}` ? "" : ` = ${wTex(e.rho)}`}`] : []),
    ];

  return (
    <div data-kugel-labor="" data-modus={modus} data-lage={lage} data-r={r} data-s={s}>
      <div className="flex flex-wrap" style={{ gap: 8, marginBottom: 12 }}>
        <Chip aktiv={modus === "gerade"} onClick={() => setModus("gerade")}>Gerade</Chip>
        <Chip aktiv={modus === "ebene"} onClick={() => setModus("ebene")}>Ebene</Chip>
      </div>
      <div className="flex flex-wrap" style={{ gap: "10px 18px", marginBottom: 10 }}>
        <Regler3 name="m_1" wert={m[0]} setzen={(dlt) => mSetzen(0, dlt)} label="m1" />
        <Regler3 name="m_2" wert={m[1]} setzen={(dlt) => mSetzen(1, dlt)} label="m2" />
        <Regler3 name="m_3" wert={m[2]} setzen={(dlt) => mSetzen(2, dlt)} label="m3" />
        <Regler3 name="r" wert={r} setzen={rSetzen} label="Radius" />
      </div>
      <svg viewBox="0 0 360 300" style={{ width: "100%", maxWidth: 480, display: "block", margin: "0 auto", background: C.sand, borderRadius: 14, border: `1px solid ${C.linie}`, overflow: "hidden" }}
        role="img" aria-label={`Kugel um M(${m.join(" | ")}) mit r = ${r} und ${modus === "gerade" ? "eine Gerade" : "eine Ebene"} im Abstand ${d}: ${LAGE_TEXT[lage][0]}`}>
        {ACHSEN.map(([v, name]) => {
          const a = P(mal(v, -3)), b = P(mal(v, 8));
          return (
            <g key={name} opacity="0.55">
              <path d={pfad([a, b])} stroke={C.hellgrau} strokeWidth="1.1" fill="none" />
              <T x={b[0] + (name === "x₁" ? -12 : 4)} y={b[1] + (name === "x₃" ? -2 : 12)} fontSize="11" fontWeight="700" fill={C.grau}>{name}</T>
            </g>
          );
        })}
        {bild}
        <Pkt p={pM} name="M" dx={-8} dy={-7} anker="end" />
      </svg>
      <div className="flex items-center flex-wrap" style={{ gap: "6px 12px", margin: "12px 0 4px" }}>
        <label htmlFor="gku-abstand" style={{ fontSize: 13.5, color: C.tinte, fontWeight: 600 }}>{modus === "gerade" ? "Gerade" : "Ebene"} verschieben</label>
        <span style={{ fontSize: 13.5, color: C.grau }}>Abstand d = {d}</span>
      </div>
      <input id="gku-abstand" type="range" min={-grenze} max={grenze} step={1} value={s} onChange={(ev) => setS(parseInt(ev.target.value, 10))}
        aria-label="Abstand der Geraden bzw. Ebene vom Mittelpunkt" style={{ width: "100%", accentColor: C.gold, margin: "2px 0 10px", cursor: "pointer" }} />
      <div data-lage-box="" style={{ borderRadius: 12, padding: "10px 14px", marginBottom: 8, background: beruehrt ? "#FFF3C4" : C.sand, border: `1.5px solid ${beruehrt ? C.flaggold : C.linie}` }}>
        <p style={{ fontSize: 16, fontWeight: 800, color: beruehrt ? C.gruenDunkel : lage === "passante" || lage === "keine" ? C.grau : C.smaragd }}>{LAGE_TEXT[lage][0]}</p>
        <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.5 }}>{`${modus === "gerade" ? `d = ${d}, r = ${r}. ` : ""}${LAGE_TEXT[lage][1]}`}</p>
      </div>
      <Formeln zeilen={zeilen} max={15} farbe={C.tinte} />
    </div>
  );
}

/* ======================================================================
   Übungen
   ====================================================================== */
function Feld({ k, modus, wert, setzen, stand, onEnter, aria, breite = 58 }) {
  return (
    <MatheFeld modus={modus} value={wert} onChange={(e) => setzen(k, e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") onEnter(); }}
      aria-label={aria || k} data-feld={k} placeholder="?" style={{ ...ZELLE(stand), width: breite, padding: "7px 4px" }} />
  );
}
const ZEILE = { display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px 6px", fontSize: 16, color: C.tinte };

function Block({ b, ein, setze, stand, onEnter }) {
  const feld = (k, modus, aria, breite) => <Feld key={k} k={k} modus={modus} wert={ein[k] ?? ""} setzen={setze} stand={stand ? stand[k] : null} onEnter={onEnter} aria={aria} breite={breite} />;
  if (b.typ === "wahl") {
    return (
      <div role="group" aria-label="Lage" className="flex flex-wrap" style={{ gap: 8 }}>
        {b.optionen.map((o) => {
          const an = ein[b.k] === o.id, gut = an && stand && stand[b.k] === true, schlecht = an && stand && stand[b.k] === false;
          return (
            <button key={o.id} type="button" data-wahl={o.id} aria-pressed={an} onClick={() => setze(b.k, o.id)}
              style={{ padding: "8px 12px", borderRadius: 999, fontFamily: "inherit", cursor: "pointer", fontSize: 14, fontWeight: an ? 700 : 500,
                border: `1.5px solid ${gut ? C.see : schlecht ? C.signal : an ? C.see : C.linie}`, background: gut ? C.himmel : an ? "#F3F7FD" : C.weiss, color: C.tinte }}>
              {o.name}
            </button>
          );
        })}
      </div>
    );
  }
  if (b.typ === "zahl") return <div style={ZEILE}><M t={b.tex} /><span>=</span>{feld(b.k, b.modus, b.k, b.modus === "wurzel" ? 84 : 64)}</div>;
  if (b.typ === "punkt" || b.typ === "vektor") {
    const [a1, a2, a3] = b.ks;
    return (
      <div style={ZEILE}>
        <M t={b.typ === "vektor" ? `${b.name} =` : b.name} />
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, flexWrap: "nowrap" }}>
          <span>(</span>{feld(a1, b.modus, `${b.name.replace(/\\[a-z]+\{|\}/g, "")} erste Koordinate`)}<span>|</span>
          {feld(a2, b.modus, `${b.name.replace(/\\[a-z]+\{|\}/g, "")} zweite Koordinate`)}<span>|</span>
          {feld(a3, b.modus, `${b.name.replace(/\\[a-z]+\{|\}/g, "")} dritte Koordinate`)}<span>)</span>
        </span>
      </div>
    );
  }
  if (b.typ === "quad") {
    const [a, bb, c] = b.ks;
    return (
      <div style={ZEILE}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>{feld(a, "ganzvz", "a")}<M t="t^2 +" /></span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>{feld(bb, "ganzvz", "b")}<M t="t +" /></span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>{feld(c, "ganzvz", "c")}<M t="= 0" /></span>
      </div>
    );
  }
  const [a, bb, c, k] = b.ks;   // Ebene in Koordinatenform
  return (
    <div style={ZEILE}>
      <M t="T:" />
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>{feld(a, "ganzvz", "a")}<M t="x_1 +" /></span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>{feld(bb, "ganzvz", "b")}<M t="x_2 +" /></span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>{feld(c, "ganzvz", "c")}<M t="x_3 =" /></span>
      {feld(k, "ganzvz", "k")}
    </div>
  );
}

function Stufen({ stufe, n, setzen }) {
  return (
    <div className="flex items-center flex-wrap" style={{ gap: 10, marginBottom: 16 }}>
      <span style={{ fontSize: 13.5, color: C.grau, fontWeight: 300 }}>Schwierigkeit</span>
      <PlusMinus setzen={(d) => setzen(stufe + d)} label="Schwierigkeit" />
      <div className="flex" style={{ gap: 4 }}>
        {Array.from({ length: n }, (_, i) => <span key={i} style={{ width: 9, height: 9, borderRadius: 999, background: i < stufe ? C.see : C.linie, display: "inline-block" }} />)}
      </div>
      <span style={{ fontSize: 13.5, color: C.gruenDunkel, fontWeight: 600 }}>{stufe} / {n}</span>
    </div>
  );
}

const HINWEIS = "Brüche als 3/2, Wurzeln exakt wie 2√6 oder gerundet auf zwei Stellen (4,9).";
function KugelTrainer() {
  const [art, setArt] = useState("gleichung");
  const [stufe, setStufe] = useState(1);
  const [auf, setAufRoh] = useState(() => merk(aufgabe("gleichung", 1)));
  const setAuf = (a) => setAufRoh(merk(a));
  const [ein, setEin] = useState({});
  const [erg, setErg] = useState(null);
  const [zeigen, setZeigen] = useState(false);
  const [serie, setSerie] = useState({ n: 0, ok: 0 });
  const neu = (a = art, s = stufe) => { setAuf(aufgabe(a, s)); setEin({}); setErg(null); setZeigen(false); };
  const artSetzen = (a) => { const s = Math.min(stufe, stufenZahl(a)); setArt(a); setStufe(s); neu(a, s); };
  const stufeSetzen = (s) => { const v = Math.max(1, Math.min(stufenZahl(art), s)); setStufe(v); neu(art, v); };
  const setze = (k, v) => { setEin((e) => ({ ...e, [k]: v })); setErg(null); };
  const leer = auf.keys.some((k) => !String(ein[k] ?? "").trim());
  const pruefen = () => {
    if (leer) return;
    const e = pruefe(auf, ein);
    setErg(e);
    setSerie((x) => ({ n: x.n + 1, ok: x.ok + (e.ok ? 1 : 0) }));
  };
  const weg = <Formeln zeilen={rechenweg(auf)} max={15} farbe={C.see} />;
  const n = stufenZahl(art);
  return (
    <div>
      <p style={{ ...FLIESS, lineHeight: 1.7, marginBottom: 18 }}>
        Vier Aufgabentypen mit immer neuen Zahlen: Kugelgleichungen aufstellen und lesen, Punkte und Geraden einsetzen, Ebenen über
        den Abstand einordnen und Tangentialebenen bestimmen. Auf jeder Stufe gibt es nach einem Fehlversuch eine gezielte Rückmeldung.
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        {ARTEN.map((a) => <Chip key={a.id} aktiv={art === a.id} onClick={() => artSetzen(a.id)}>{a.name}</Chip>)}
      </div>
      <Stufen stufe={stufe} n={n} setzen={stufeSetzen} />
      <div style={KARTE} data-mm-karte="" data-kugeltrainer="" data-art={auf.art} data-stufe={auf.stufe}>
        <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: C.gruenDunkel, marginBottom: 6 }}>{STUFEN_NAMEN[auf.art][auf.stufe - 1]}</p>
        <Text s={auf.text} style={{ fontSize: 15, color: C.tinte, fontWeight: 400, lineHeight: 1.85, marginBottom: 12 }} />
        <p style={{ fontSize: 12.5, color: C.grau, fontWeight: 300, marginBottom: 10 }}>{auf.art === "gerade" && auf.stufe === 2 ? "Kürzen und Vorzeichen umdrehen ist erlaubt. " : ""}{HINWEIS}</p>
        <div className="flex flex-col" style={{ gap: 12, marginBottom: 14 }}>
          {auf.bloecke.map((b, i) => <Block key={i} b={b} ein={ein} setze={setze} stand={erg ? erg.felder : null} onEnter={pruefen} />)}
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
            <div data-grund=""><Text s={erg.grund || tipp(auf)} style={{ fontSize: 14, color: C.tinte, fontWeight: 300, lineHeight: 1.85 }} /></div>
            {erg.grund && <Text s={`Tipp: ${tipp(auf)}`} style={{ fontSize: 13, color: C.grau, fontWeight: 300, lineHeight: 1.8, marginTop: 6 }} />}
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
const LISTE = { fontSize: 14, color: C.tinte, fontWeight: 300, lineHeight: 1.7, marginBottom: 6 };
export function GfsKugelnSeite({ gehe }) {
  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 22 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 14 }}>
        Wie beschreibt man eine Kugel mit einer Gleichung – und was passiert, wenn eine Gerade oder Ebene sie trifft?
      </h2>
      <Text s="Ein Ball, eine Seifenblase, ein Planet: Die Kugel ist die einfachste Form im Raum. Mathematisch ist sie noch einfacher – sie besteht aus allen Punkten, die von einem Mittelpunkt denselben Abstand haben. Aus diesem einen Satz wird eine Gleichung." style={FLIESS} />
      <Text s="Mit der Gleichung lassen sich alle Lagefragen rechnen: Liegt ein Punkt innen oder außen? Schneidet eine Gerade die Kugel, berührt sie sie oder geht sie vorbei? Welchen Kreis schneidet eine Ebene heraus? Wo liegt die Ebene, die die Kugel in einem Punkt berührt? Am Ende steht eine Anwendung: orten mit Abständen." style={FLIESS} />

      <KugelnAnimation art="gleichung" offen />

      <Schritt nr="1" titel="Vom Abstand zur Kugelgleichung" />
      <Text s={"Die Kugel $K$ mit dem Mittelpunkt $M$ und dem Radius $r > 0$ besteht aus allen Punkten $X$, die von $M$ den Abstand $r$ haben. Der Abstand ist die Länge des Vektors $\\vec{x} − \\vec{m}$ – nach dem Satz des Pythagoras im Raum:"} style={FLIESS} />
      <Formeln titel="Kugel um M mit Radius r" zeilen={[
        "|\\vec{x} − \\vec{m}| = r",
        "\\sqrt{(x_1 − m_1)^2 + (x_2 − m_2)^2 + (x_3 − m_3)^2} = r",
        "(x_1 − m_1)^2 + (x_2 − m_2)^2 + (x_3 − m_3)^2 = r^2",
      ]} max={17} />
      <Text s={"Quadrieren ist hier ungefährlich: Beide Seiten sind nicht negativ, die Gleichungen sind also gleichwertig. In Vektorform heißt die letzte Zeile $(\\vec{x} − \\vec{m})^2 = r^2$, denn das Skalarprodukt eines Vektors mit sich selbst ist das Quadrat seiner Länge."} style={FLIESS} />
      <Text s={"Beispiel: $M(2 \\mid −1 \\mid 3)$ und $r = 5$. Diese Kugel begleitet uns durch die ganze Seite:"} style={FLIESS} />
      <Formeln zeilen={["K: (x_1 − 2)^2 + (x_2 + 1)^2 + (x_3 − 3)^2 = 25"]} max={17} />
      <Kasten titel="Punktprobe">
        <Text s={"Setze den Punkt in die linke Seite ein. Das Ergebnis ist sein Abstandsquadrat zu $M$: kleiner als $r^2$ heißt innen, gleich $r^2$ heißt auf $K$, größer heißt außen."} style={{ ...LISTE, margin: "8px 0 4px" }} />
        <Formeln zeilen={[
          "P(5 \\mid 3 \\mid 3)\\text{: } 3^2 + 4^2 + 0^2 = 25 \\;\\Rightarrow\\; P \\in K",
          "Q(1 \\mid 1 \\mid 1)\\text{: } (−1)^2 + 2^2 + (−2)^2 = 9 < 25 \\;\\Rightarrow\\; Q \\text{ innen}",
          "R(7 \\mid −1 \\mid −1)\\text{: } 5^2 + 0^2 + (−4)^2 = 41 > 25 \\;\\Rightarrow\\; R \\text{ außen}",
        ]} max={15} />
      </Kasten>

      <Schritt nr="2" titel="Rückweg: Mittelpunkt und Radius aus der ausmultiplizierten Form" />
      <Text s="Multipliziert man die Klammern aus und bringt alles auf eine Seite, sieht man der Gleichung die Kugel nicht mehr an:" style={FLIESS} />
      <Formeln zeilen={["x_1^2 + x_2^2 + x_3^2 − 4x_1 + 2x_2 − 6x_3 − 11 = 0"]} max={17} />
      <Text s="Zurück kommst du mit quadratischer Ergänzung, für jede Koordinate einzeln. Was du links ergänzt, addierst du auch rechts:" style={FLIESS} />
      <Formeln zeilen={[
        "x_1^2 − 4x_1 + x_2^2 + 2x_2 + x_3^2 − 6x_3 = 11",
        "(x_1^2 − 4x_1 + 4) + (x_2^2 + 2x_2 + 1) + (x_3^2 − 6x_3 + 9) = 11 + 4 + 1 + 9",
        "(x_1 − 2)^2 + (x_2 + 1)^2 + (x_3 − 3)^2 = 25",
        "M(2 \\mid −1 \\mid 3), \\quad r = 5",
      ]} max={17} />
      <Text s={"Allgemein wird aus $x_1^2 + x_2^2 + x_3^2 + ax_1 + bx_2 + cx_3 + e = 0$ auf demselben Weg"} style={FLIESS} />
      <Formeln zeilen={["M\\left(−\\frac{a}{2} \\mid −\\frac{b}{2} \\mid −\\frac{c}{2}\\right), \\quad r^2 = \\frac{a^2 + b^2 + c^2}{4} − e"]} max={17} />
      <Text s={"Kurz: Die Koordinaten des Mittelpunkts sind minus die Hälfte der Zahlen vor $x_1$, $x_2$ und $x_3$. Stehen vor den Quadraten gleiche Zahlen ungleich 1, teilst du zuerst durch diese Zahl. Sind sie verschieden, ist es keine Kugel."} style={FLIESS} />
      <Kasten titel="Nicht jede solche Gleichung ist eine Kugel">
        <Text s={"Links steht nach der Ergänzung eine Summe von Quadraten – sie ist nie negativ. Ist die Zahl rechts positiv, ist es eine Kugel. Ist sie null, erfüllt nur der Punkt $M$ die Gleichung. Ist sie negativ, erfüllt sie kein einziger Punkt:"} style={{ ...LISTE, margin: "8px 0 4px" }} />
        <Formeln zeilen={[
          "x_1^2 + x_2^2 + x_3^2 − 2x_1 + 4x_3 + 6 = 0",
          "(x_1 − 1)^2 + x_2^2 + (x_3 + 2)^2 = −6 + 1 + 4 = −1",
        ]} max={15} />
      </Kasten>

      <Schritt nr="3" titel="Gerade und Kugel: einsetzen und die Diskriminante fragen" />
      <Text s={"Eine Gerade $g: \\vec{x} = \\vec{p} + t\\vec{u}$ hat mit einer Kugel höchstens zwei Punkte gemeinsam. Welche, findest du durch Einsetzen: Die Koordinaten der Geraden hängen von $t$ ab und ersetzen $x_1$, $x_2$ und $x_3$ in der Kugelgleichung. Es entsteht eine quadratische Gleichung für $t$."} style={FLIESS} />
      <Formeln titel="Beispiel: Sekante" zeilen={[
        "g: \\vec{x} = \\spalte{−3}{−2}{6} + t \\cdot \\spalte{1}{1}{0}",
        "x_1 = −3 + t, \\; x_2 = −2 + t, \\; x_3 = 6",
        "(t − 5)^2 + (t − 1)^2 + 3^2 = 25",
        "2t^2 − 12t + 10 = 0 \\;\\Rightarrow\\; t^2 − 6t + 5 = 0",
        "t_1 = 1, \\quad t_2 = 5",
        "S_1(−2 \\mid −1 \\mid 6), \\quad S_2(2 \\mid 3 \\mid 6)",
      ]} max={17} />
      <Text s={"Die beiden Schnittpunkte begrenzen eine Sehne der Länge $|\\vec{S_1S_2}| = \\sqrt{4^2 + 4^2 + 0^2} = \\sqrt{32} = 4\\sqrt{2}$. Wie viele Schnittpunkte es gibt, entscheidet allein die Diskriminante $D = b^2 − 4ac$ der Gleichung $at^2 + bt + c = 0$. Zwei parallele Geraden zeigen die anderen Fälle:"} style={FLIESS} />
      <Formeln zeilen={[
        "h: \\vec{x} = \\spalte{3}{0}{8} + t \\cdot \\spalte{1}{1}{0}\\text{: } 2t^2 + 4t + 2 = 0, \\; D = 0",
        "t = −1 \\;\\Rightarrow\\; B(2 \\mid −1 \\mid 8)",
        "k: \\vec{x} = \\spalte{3}{0}{9} + t \\cdot \\spalte{1}{1}{0}\\text{: } 2t^2 + 4t + 13 = 0, \\; D = −88",
      ]} max={16} />
      <LagenTafel zeilen={[
        ["D > 0", "Sekante", "zwei Schnittpunkte", false],
        ["D = 0", "Tangente", "ein Berührpunkt", true],
        ["D < 0", "Passante", "kein gemeinsamer Punkt", false],
      ]} />
      <Text s={"Warum gerade $D$? Mit $\\vec{w} = \\vec{p} − \\vec{m}$ heißt die eingesetzte Gleichung $|\\vec{w} + t\\vec{u}|^2 = r^2$. Ausmultipliziert und mit der Diskriminante:"} style={FLIESS} />
      <Formeln zeilen={[
        "|\\vec{u}|^2t^2 + 2(\\vec{u} \\cdot \\vec{w})t + |\\vec{w}|^2 − r^2 = 0",
        "D = 4(\\vec{u} \\cdot \\vec{w})^2 − 4|\\vec{u}|^2(|\\vec{w}|^2 − r^2) = 4|\\vec{u}|^2(r^2 − d^2)",
        "d^2 = |\\vec{w}|^2 − \\frac{(\\vec{u} \\cdot \\vec{w})^2}{|\\vec{u}|^2}",
      ]} max={16} />
      <Text s={"Dabei ist $d$ der Abstand von $M$ zur Geraden: $|\\vec{w} + t\\vec{u}|^2$ ist eine nach oben geöffnete Parabel in $t$, und ihr Tiefpunkt hat genau den Wert $d^2$. Also ist $D$ positiv, null oder negativ, je nachdem ob $d$ kleiner, gleich oder größer als $r$ ist. Für $g$ ist $d^2 = 35 − \\frac{36}{2} = 17 < 25$. Auch die Sehnenlänge folgt daraus: $s = 2\\sqrt{r^2 − d^2} = 2\\sqrt{8} = 4\\sqrt{2}$."} style={FLIESS} />
      <KugelnAnimation art="gerade" />

      <Schritt nr="4" titel="Ebene und Kugel: Der Abstand entscheidet" />
      <Text s={"Bei einer Ebene musst du nicht einsetzen. Es genügt der Abstand $d$ des Mittelpunkts von der Ebene – mit der Hesse-Normalenform. Für $E: 2x_1 + x_2 − 2x_3 = 6$ ist $|\\vec{n}| = \\sqrt{2^2 + 1^2 + (−2)^2} = 3$:"} style={FLIESS} />
      <Formeln zeilen={["d = \\frac{|2 \\cdot 2 − 1 − 2 \\cdot 3 − 6|}{3} = \\frac{9}{3} = 3"]} max={17} />
      <LagenTafel zeilen={[
        ["d > r", "kein Punkt", "E geht vorbei", false],
        ["d = r", "Berührpunkt", "E ist Tangentialebene", true],
        ["d < r", "Schnittkreis", "E schneidet K", false],
      ]} />
      <Text s={"Warum ist der Schnitt ein Kreis? Sei $F$ der Fußpunkt des Lotes von $M$ auf $E$. Für jeden Punkt $X$ der Ebene steht $MF$ senkrecht auf $FX$, also gilt nach Pythagoras:"} style={FLIESS} />
      <Formeln zeilen={[
        "|\\vec{MX}|^2 = d^2 + |\\vec{FX}|^2",
        "X \\in K \\;\\Leftrightarrow\\; |\\vec{FX}|^2 = r^2 − d^2",
      ]} max={17} />
      <Text s={"Alle gemeinsamen Punkte haben also denselben Abstand von $F$ – sie bilden einen Kreis um $F$ mit dem Radius $\\rho = \\sqrt{r^2 − d^2}$. Den Mittelpunkt $F$ liefert die Lotgerade durch $M$ in Richtung $\\vec{n}$, eingesetzt in $E$:"} style={FLIESS} />
      <Formeln titel="Schnittkreis von E und K" zeilen={[
        "\\vec{x} = \\spalte{2}{−1}{3} + λ \\cdot \\spalte{2}{1}{−2}",
        "2(2 + 2λ) + (−1 + λ) − 2(3 − 2λ) = 6",
        "−3 + 9λ = 6 \\;\\Rightarrow\\; λ = 1",
        "F(4 \\mid 0 \\mid 1), \\quad \\rho = \\sqrt{25 − 9} = 4",
      ]} max={17} />
      <Text s={"Verschiebt man $E$ parallel, ändert sich nur die Zahl rechts. Bei $2x_1 + x_2 − 2x_3 = 12$ ist $d = \\frac{|−3 − 12|}{3} = 5 = r$: Die Ebene berührt $K$. Bei $2x_1 + x_2 − 2x_3 = 15$ ist $d = 6 > 5$: kein gemeinsamer Punkt."} style={FLIESS} />
      <KugelnAnimation art="ebene" />

      <Schritt nr="5" titel="Die Tangentialebene" />
      <Text s={"Die Tangentialebene $T$ in einem Kugelpunkt $B$ berührt $K$ nur in $B$. Ihr Normalenvektor ist der Radiusvektor von $M$ nach $B$:"} style={FLIESS} />
      <Formeln titel="Tangentialebene in B" zeilen={[
        "T: (\\vec{x} − \\vec{b}) \\cdot (\\vec{b} − \\vec{m}) = 0",
        "T: (\\vec{x} − \\vec{m}) \\cdot (\\vec{b} − \\vec{m}) = r^2",
      ]} max={17} />
      <Text s={"Die zweite Form entsteht, weil $\\vec{x} − \\vec{m} = (\\vec{x} − \\vec{b}) + (\\vec{b} − \\vec{m})$ ist und $(\\vec{b} − \\vec{m})^2 = r^2$. Warum berührt $T$ nur in $B$? Für jeden Punkt $X$ von $T$ steht $BX$ senkrecht auf $MB$. Pythagoras im Dreieck $M$, $B$, $X$:"} style={FLIESS} />
      <Formeln zeilen={["|\\vec{MX}|^2 = r^2 + |\\vec{BX}|^2 > r^2 \\quad \\text{für } X \\neq B"]} max={17} />
      <Text s={"Jeder andere Punkt von $T$ liegt also außerhalb der Kugel. Jede andere Ebene durch $B$ steht schräg zum Radius, hat von $M$ einen Abstand $d < r$ und schneidet $K$ deshalb in einem Kreis. Beispiel: $B(6 \\mid −4 \\mid 3)$ liegt auf $K$, denn $4^2 + (−3)^2 + 0^2 = 25$."} style={FLIESS} />
      <Formeln zeilen={[
        "\\vec{n} = \\vec{MB} = \\spalte{4}{−3}{0}",
        "T: 4x_1 − 3x_2 = 4 \\cdot 6 − 3 \\cdot (−4) = 36",
      ]} max={17} />
      <KugelnAnimation art="tangential" />

      <Schritt nr="6" titel="Anwendung: orten mit drei Kugeln" />
      <Text s={"Ein Empfänger kennt nur seine Abstände zu drei Sendern: $7$ zum Sender im Ursprung $O$, $9$ zum Sender $A(8 \\mid 0 \\mid 0)$ und $11$ zum Sender $C(0 \\mid 12 \\mid 0)$, alles in Kilometern. Er liegt also auf drei Kugeln zugleich. Zieht man die Gleichungen voneinander ab, fallen die Quadrate weg:"} style={FLIESS} />
      <Formeln zeilen={[
        "K_1: x_1^2 + x_2^2 + x_3^2 = 49",
        "K_2: (x_1 − 8)^2 + x_2^2 + x_3^2 = 81",
        "K_3: x_1^2 + (x_2 − 12)^2 + x_3^2 = 121",
        "K_1 − K_2\\text{: } 16x_1 − 64 = −32 \\;\\Rightarrow\\; x_1 = 2",
        "K_1 − K_3\\text{: } 24x_2 − 144 = −72 \\;\\Rightarrow\\; x_2 = 3",
        "x_3^2 = 49 − 4 − 9 = 36 \\;\\Rightarrow\\; x_3 = 6 \\text{ oder } x_3 = −6",
      ]} max={16} />
      <Text s={"Geometrisch: Die Differenz $K_1 − K_2$ ist die Ebene $x_1 = 2$. In ihr liegt der Schnittkreis von $K_1$ und $K_2$ mit dem Radius $\\sqrt{49 − 4} = 3\\sqrt{5}$. Die dritte Kugel schneidet diesen Kreis in zwei Punkten: $(2 \\mid 3 \\mid 6)$ und $(2 \\mid 3 \\mid −6)$. Welcher der richtige ist, muss eine weitere Angabe entscheiden – etwa, dass der Empfänger oberhalb der Ebene der Sender liegt ($x_3 > 0$), oder ein vierter Sender."} style={FLIESS} />
      <Text s="Grenzen des Modells: Echte Abstände sind gemessen und deshalb ungenau. Dann treffen sich die Kugeln nicht exakt in einem Punkt, und man sucht den Punkt, der am besten zu allen Messungen passt." style={FLIESS} />
      <Kasten titel="Zum Mitnehmen">
        <Text s={"Eine Kugel ist eine Abstandsbedingung: $|\\vec{x} − \\vec{m}| = r$. Darum entscheiden immer Abstände – beim Punkt das Einsetzen, bei der Geraden die Diskriminante $D = 4|\\vec{u}|^2(r^2 − d^2)$, bei der Ebene der Vergleich von $d$ mit $r$. Der Radius zum Berührpunkt steht immer senkrecht auf der Tangente und der Tangentialebene."} style={ERGEBNIS} />
      </Kasten>

      <div style={{ ...KARTE, margin: "22px 0" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 12 }}>Labor: Kugel verändern, Gerade oder Ebene verschieben</p>
        <KugelLabor />
      </div>

      <Trenner />

      <Kicker>Jetzt selbst üben</Kicker>
      <H3>Kugelgleichung, Gerade, Ebene, Tangentialebene</H3>
      <KugelTrainer />

      {gehe && (
        <div style={{ ...KARTE, marginTop: 22, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: C.tinte, marginBottom: 4 }}>Abstände sicher berechnen</p>
            <p style={{ fontSize: 13.5, color: C.grau, fontWeight: 300, lineHeight: 1.6 }}>Woher die Formel für den Abstand eines Punktes von einer Ebene kommt – mit 3D-Bild und Übungen.</p>
          </div>
          <button type="button" onClick={() => gehe({ ansicht: "hesse" })} className="px-5 py-3" style={KNOPF(true)}>Zur Hesse-Normalenform</button>
        </div>
      )}

      <Trenner />

      <Kicker>Deine GFS</Kicker>
      <H3>Der rote Faden für den Vortrag</H3>
      <RoterFaden gliederung={GLIEDERUNG} tipps={TIPPS} hinweis="den Abschnitt „Gerade und Kugel“" />

      <div style={{ height: 8 }} />
      <Kicker>Kolloquium</Kicker>
      <H3>Die Fragen nach dem Vortrag trainieren</H3>
      <Kolloquium fragen={KOLLOQUIUM} speicher="mm-gfs-kugeln-kolloquium" />
    </div>
  );
}
