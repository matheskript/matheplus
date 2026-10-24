import React, { useState } from "react";
import { C } from "./base1.jsx";
import { M, Text } from "./func3.jsx";
import { MatheFeld } from "./matheTastatur.jsx";
import { FLIESS, KARTE, ZELLE, Formeln, Schritt, Kasten, Chip, PlusMinus, Kicker, H3, Trenner, RoterFaden, Kolloquium } from "./funcGfsBausteine.jsx";
import { lauf, T } from "./funcErklaeranimation.jsx";
import { AnimKarte } from "./funcAnimKarte.jsx";
import {
  Q, qTex, qText, qWert, V, vTex, spalte, matVek, matMal, mGleich, matrixGanz, schattenMatrix, orthoMatrix, SCHRAEG, schraegZahl,
  LICHT, NORMALE, HAUS, LABOR_GRENZEN, laborMatrix,
  ARTEN, STUFEN_NAMEN, aufgabe, felder, auftrag, pruefe, rechenweg, tipp, GLIEDERUNG, TIPPS, KOLLOQUIUM,
} from "./gfsProjektion.js";

/* ============================================================
   Kurs GFS – Themenseite „Projektionen mit Matrizen“ (Kursstufe 2, Kap. VII)
   Leitfrage · Herleitung in sechs Schritten (Schatten als Gerade ∩ Boden,
   linear, Matrix aus den Bildern der Einheitsvektoren, Lot auf eine Ebene
   durch 0, A · A = A, Schrägbild und Bildschirm) · vier Erkläranimationen ·
   Labor (Haus, Licht bzw. Ebene per Plus/Minus, Matrix mit farbigen Spalten,
   Probe A · A = A) · Übungen aus vier Generatoren · roter Faden · Kolloquium.
   Alle 3D-Bilder dieser Seite sind Schrägbilder mit genau der Matrix aus
   Schritt 6 (schraegZahl). Logik in gfsProjektion.js (tests/gfsProjektion.test.mjs).
   ============================================================ */

const KNOPF = (aktiv = true, farbe = C.see) => ({
  background: aktiv ? farbe : C.hellgrau, color: C.weiss, border: "none", borderRadius: 999, fontSize: 15, fontWeight: 600,
  fontFamily: "inherit", cursor: aktiv ? "pointer" : "default",
});
const LINK = { background: "none", border: "none", color: C.see, fontSize: 13, fontFamily: "inherit", cursor: "pointer", padding: 0, textDecoration: "underline" };
/* aktuelle Aufgabe für automatische Prüfungen (tests/ui/gfsprojektion.ui.py) */
const merk = (a) => { if (typeof window !== "undefined") window.__projAufgabe = { ...a, loesung: a.loesung }; return a; };

/* Farben der Einheitsvektoren und Matrixspalten: e₁ Blau, e₂ Gold, e₃ Grün – überall gleich */
const FARBE = [C.see, C.gruen, C.smaragd];
const E_NAME = ["e₁", "e₂", "e₃"];

/* ======================================================================
   Zeichenhilfen: Schrägbild (x₂ rechts, x₃ oben, x₁ unter 45° nach vorn, halbe Diagonale)
   ====================================================================== */
const proj = (k, ox, oy) => (p) => { const [u, w] = schraegZahl(p); return [ox + k * u, oy - k * w]; };
const zug = (pts) => pts.map((q) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(" ");
const teil = (a, b, p) => [a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p];
const schattenN = (p, v, k = 2) => { const t = -p[k] / v[k]; return p.map((x, i) => x + t * v[i]); };
const orthoN = (p, n) => { const l = (p[0] * n[0] + p[1] * n[1] + p[2] * n[2]) / (n[0] ** 2 + n[1] ** 2 + n[2] ** 2); return p.map((x, i) => x - l * n[i]); };
const norm = (v) => { const l = Math.hypot(...v); return v.map((x) => x / l); };
const kreuz = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

/* konvexe Hülle (Andrew), für Schattenflächen */
function huelle(punkte) {
  const p = [...punkte].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (p.length < 3) return p;
  const kr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const unten = [], oben = [];
  for (const q of p) { while (unten.length >= 2 && kr(unten[unten.length - 2], unten[unten.length - 1], q) <= 1e-9) unten.pop(); unten.push(q); }
  for (const q of [...p].reverse()) { while (oben.length >= 2 && kr(oben[oben.length - 2], oben[oben.length - 1], q) <= 1e-9) oben.pop(); oben.push(q); }
  return [...unten.slice(0, -1), ...oben.slice(0, -1)];
}

function Pfeil({ a, b, farbe, breite = 2.2, o = 1, kopf = 8, strich }) {
  if (o <= 0.001) return null;
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy);
  if (l < 1) return null;
  const ux = dx / l, uy = dy / l, k = Math.min(kopf, l * 0.5);
  const ende = [b[0] - ux * k * 0.7, b[1] - uy * k * 0.7];
  return (
    <g opacity={o}>
      <line x1={a[0]} y1={a[1]} x2={ende[0]} y2={ende[1]} stroke={farbe} strokeWidth={breite} strokeLinecap="round" strokeDasharray={strich} />
      <path d={`M${b[0]} ${b[1]} L${b[0] - ux * k - uy * k * 0.42} ${b[1] - uy * k + ux * k * 0.42} L${b[0] - ux * k + uy * k * 0.42} ${b[1] - uy * k - ux * k * 0.42} Z`} fill={farbe} />
    </g>
  );
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

/* Haus: sichtbare Flächen (Giebelwand vorn x₁ = 2, rechte Wand x₂ = 2, rechte Dachfläche) und ihre Kanten.
   Die linke Dachfläche steht im Schrägbild genau auf der Kante (sie enthält die Blickrichtung (2 | 1 | 1)). */
const HAUS_FLAECHEN = [{ i: [0, 1, 5, 8, 4], f: C.weiss }, { i: [1, 2, 6, 5], f: C.silberHell }, { i: [5, 6, 9, 8], f: C.seeHell }];
const HAUS_SICHTBAR = [[0, 1], [1, 2], [2, 6], [6, 5], [5, 1], [0, 4], [4, 8], [8, 5], [8, 9], [9, 6]];
function Haus({ P, o = 1, wachsen = 1, ecken = HAUS.ecken }) {
  if (o <= 0.001) return null;
  const s = ecken.map(P);
  return (
    <g opacity={o}>
      {HAUS_FLAECHEN.map((fl, k) => <polygon key={k} points={zug(fl.i.map((i) => s[i]))} fill={fl.f} opacity={lauf(wachsen, 0.6, 1)} />)}
      {HAUS_SICHTBAR.map(([a, b], k) => { const e = teil(s[a], s[b], wachsen); return <line key={k} x1={s[a][0]} y1={s[a][1]} x2={e[0]} y2={e[1]} stroke={C.seeTief} strokeWidth="1.6" strokeLinecap="round" />; })}
    </g>
  );
}
/* Drahtmodell aller 17 Kanten (für Bilder, die durch das Haus hindurch gehen) */
function Draht({ punkte, farbe, breite = 1.4, o = 1, strich }) {
  if (o <= 0.001) return null;
  return (
    <g opacity={o}>
      {HAUS.kanten.map(([a, b], k) => <line key={k} x1={punkte[a][0]} y1={punkte[a][1]} x2={punkte[b][0]} y2={punkte[b][1]} stroke={farbe} strokeWidth={breite} strokeLinecap="round" strokeDasharray={strich} />)}
    </g>
  );
}

/* ======================================================================
   Matrix-Anzeige (HTML): farbige Spalten, auf Wunsch mit gemeinsamem Faktor 1/d
   ====================================================================== */
const KLAMMER = (l) => ({ width: 7, flexShrink: 0, border: `1.6px solid ${C.tinte}`, ...(l ? { borderRight: "none", borderRadius: "8px 0 0 8px" } : { borderLeft: "none", borderRadius: "0 8px 8px 0" }) });
function MatrixBild({ A, tex, name, farbig = true, ganz = true, gross = 16, merkmal }) {
  let zellen = tex || A.map((z) => z.map(qTex));
  let faktor = null;
  if (!tex && ganz) {
    const { d, M: ganzM } = matrixGanz(A);
    if (d > 1) { faktor = d; zellen = ganzM.map((z) => z.map((x) => qTex(Q(x)))); }
  }
  const spalten = zellen[0].length;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: gross, color: C.tinte, verticalAlign: "middle", maxWidth: "100%" }} {...(merkmal ? { [merkmal]: "" } : {})}>
      {name && <M t={`${name} =`} />}
      {faktor && <M t={`\\frac{1}{${faktor}} \\cdot`} />}
      <span style={{ display: "inline-flex", alignItems: "stretch" }}>
        <span style={KLAMMER(true)} />
        <span style={{ display: "grid", gridTemplateColumns: `repeat(${spalten}, auto)`, columnGap: "0.75em", rowGap: "0.1em", padding: "0.25em 0.4em", alignItems: "center", justifyItems: "center" }}>
          {zellen.flatMap((z, i) => z.map((x, j) => (
            <span key={`${i}-${j}`} style={{ color: farbig ? FARBE[j] : C.tinte, fontWeight: farbig ? 700 : 400 }}><M t={x} /></span>
          )))}
        </span>
        <span style={KLAMMER(false)} />
      </span>
    </span>
  );
}
function SpaltenLegende({ spalten = 3 }) {
  return (
    <div className="flex flex-wrap justify-center" style={{ gap: "4px 14px", marginTop: 8, fontSize: 12.5, color: C.grau }}>
      {[0, 1, 2].slice(0, spalten).map((j) => (
        <span key={j} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: FARBE[j], display: "inline-block" }} />
          Spalte {j + 1} = Bild von <M t={`\\vec{e}_${j + 1}`} />
        </span>
      ))}
    </div>
  );
}
const MitteBox = ({ children }) => <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "6px 0 18px", overflowX: "auto" }}>{children}</div>;

/* ======================================================================
   Kopfbild (viewBox 160 × 120): Haus im Sonnenlicht, Schatten exakt mit
   der Schattenmatrix (Licht (1 | 2 | −2)), oben rechts die Matrix mit
   ihren drei farbigen Spalten.
   ====================================================================== */
export function ProjektionBild() {
  const P = proj(17, 38, 74);
  const s = HAUS.ecken.map(P);
  const sch = HAUS.ecken.map((e) => P(schattenN(e, [1, 2, -2])));
  const hull = huelle(sch);
  const boden = [[-0.6, -0.8, 0], [3.6, -0.8, 0], [3.6, 5.6, 0], [-0.6, 5.6, 0]].map(P);
  const spaltenText = [["1", "0", "0"], ["0", "1", "0"], ["½", "1", "0"]];
  const spaltenFarbe = ["#7FB2EA", "#EDBB00", "#5FD39B"];
  return (
    <svg className="gtk-bild" viewBox="0 0 160 120" role="img" style={{ width: "100%", maxWidth: 300, margin: "10px auto 0", justifySelf: "center" }}
      aria-label="Ein Haus im Sonnenlicht wirft einen Schatten auf den Boden; daneben die Matrix der Projektion mit drei farbigen Spalten">
      <defs>
        <linearGradient id="gpk-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#FFE9A0" /><stop offset="60%" stopColor="#EDBB00" /><stop offset="100%" stopColor="#C9971A" /></linearGradient>
        <radialGradient id="gpk-sonne" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#FFE9A0" stopOpacity="0.95" /><stop offset="45%" stopColor="#EDBB00" stopOpacity="0.55" /><stop offset="100%" stopColor="#EDBB00" stopOpacity="0" /></radialGradient>
      </defs>
      <circle className="gtk-glimmen" cx="14" cy="14" r="16" fill="url(#gpk-sonne)" />
      <polygon points={zug(boden)} fill="rgba(255,255,255,0.05)" stroke="rgba(237,187,0,0.25)" strokeWidth="0.6" />
      {/* Lichtstrahlen durch die Ecken, parallel */}
      <g className="gtk-auf" style={{ animationDelay: ".15s" }}>
        {[4, 5, 6, 8, 9].map((i) => <line key={i} x1={s[i][0]} y1={s[i][1]} x2={sch[i][0]} y2={sch[i][1]} stroke="#EDBB00" strokeWidth="0.6" strokeDasharray="1.6 1.6" opacity="0.8" />)}
      </g>
      <polygon className="gtk-auf" style={{ animationDelay: ".3s" }} points={zug(hull)} fill="url(#gpk-gold)" opacity="0.85" />
      <g className="gtk-auf">
        <polygon points={zug([0, 1, 5, 8, 4].map((i) => s[i]))} fill="#1A3778" />
        <polygon points={zug([1, 2, 6, 5].map((i) => s[i]))} fill="#0E1E4A" />
        <polygon points={zug([5, 6, 9, 8].map((i) => s[i]))} fill="#2F5FA8" />
        {HAUS_SICHTBAR.map(([a, b], k) => <line key={k} x1={s[a][0]} y1={s[a][1]} x2={s[b][0]} y2={s[b][1]} stroke="#FFE9A0" strokeWidth="0.8" strokeLinecap="round" />)}
      </g>
      {/* Matrix */}
      <g className="gtk-auf" style={{ animationDelay: ".5s" }} fontFamily="Montserrat, sans-serif" fontWeight="800" fontSize="8.5" textAnchor="middle">
        <path d="M112 10 Q108.5 10 108.5 14 V40 Q108.5 44 112 44" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1" />
        <path d="M152 10 Q155.5 10 155.5 14 V40 Q155.5 44 152 44" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1" />
        {spaltenText.map((sp, j) => sp.map((z, i) => <text key={`${i}${j}`} x={119 + j * 13} y={20 + i * 10.5} fill={spaltenFarbe[j]}>{z}</text>))}
      </g>
    </svg>
  );
}

/* ======================================================================
   Erkläranimationen (Szenen sind reine Funktionen der Zeit; Schlussbild = Standbild)
     schatten – Haus, Licht, Strahl durch F, Schatten, Rechenvorschrift
     spalten  – Einheitsvektoren, ihre Schatten = Spalten, Bild von P als gewichtete Summe
     lot      – Lot auf die Ebene x₁ + 2x₂ + 2x₃ = 0, Probe, zweimal projizieren
     schraeg  – Schrägbild im Heft als 2 × 3-Matrix, Bildschirm teilt durch die Tiefe
   ====================================================================== */

/* 1 · Der Schatten des Hauses */
const SCH_DAUER = 24;
const schSchritte = () => [
  { von: 0, text: "Ein Haus steht im Sonnenlicht auf dem Boden, der x₁x₂-Ebene. Wo genau landet der Schatten der Ecke F(2 | 2 | 2)?" },
  { von: 4, text: "Die Sonne ist sehr weit weg: Alle Strahlen sind parallel und laufen in Richtung (1 | 2 | −2)." },
  { von: 8.5, text: "Der Strahl durch F ist eine Gerade. Am Boden ist x₃ = 0: Aus 2 − 2t = 0 folgt t = 1, also F′(3 | 4 | 0)." },
  { von: 14, text: "So bekommt jede Ecke ihren Schattenpunkt. Zusammen ergeben sie den Schatten des Hauses." },
  { von: 19, text: "Für jeden Punkt gilt t = p₃ : 2. Jede Koordinate von P′ ist eine Summe von Vielfachen von p₁, p₂, p₃." },
];
const SCH_P = proj(42, 105, 200);
function schZeichne(t) {
  const P = SCH_P;
  const boden = lauf(t, 0, 1), haus = lauf(t, 0.3, 2.2);
  const licht = lauf(t, 4.2, 5.6);
  const strahl = lauf(t, 9, 11), marke = lauf(t, 10.6, 11.6);
  const alle = lauf(t, 14.3, 16.3), flaeche = lauf(t, 15.6, 17.4);
  const formel = lauf(t, 19.4, 20.8);
  const F = [2, 2, 2], Fs = schattenN(F, [1, 2, -2]);
  const sF = P(F), sFs = P(Fs), start = P(F.map((x, i) => x - 0.9 * [1, 2, -2][i]));
  const s = HAUS.ecken.map(P), sch = HAUS.ecken.map((e) => P(schattenN(e, [1, 2, -2])));
  const ebene = [[-0.5, -0.5, 0], [3.5, -0.5, 0], [3.5, 5.6, 0], [-0.5, 5.6, 0]].map(P);
  const dir = [1.5, 2.5].map((x) => x / Math.hypot(1.5, 2.5));
  return (
    <g>
      <polygon points={zug(ebene)} fill={C.himmel} stroke={C.linie} strokeWidth="1" opacity={boden} />
      <T x={ebene[1][0] + 30} y={ebene[1][1] - 6} fontSize="10.5" fontWeight="700" fill={C.grau} opacity={boden}>Boden: x₃ = 0</T>
      {flaeche > 0.001 && <polygon points={zug(huelle(sch))} fill={C.flaggold} opacity={0.38 * flaeche} stroke={C.gold} strokeWidth="1.2" />}
      {alle > 0.001 && [4, 6, 7, 8, 9].map((i) => <line key={i} x1={s[i][0]} y1={s[i][1]} x2={teil(s[i], sch[i], alle)[0]} y2={teil(s[i], sch[i], alle)[1]} stroke={C.gold} strokeWidth="1.1" strokeDasharray="3 3" />)}
      <Haus P={P} o={haus} wachsen={haus} />
      {/* Sonne und Lichtrichtung */}
      <g opacity={licht}>
        <circle cx="26" cy="30" r="13" fill={C.flaggold} />
        {[0, 1, 2].map((i) => { const a = [52 + i * 34, 22 + i * 4]; return <Pfeil key={i} a={a} b={[a[0] + dir[0] * 44, a[1] + dir[1] * 44]} farbe={C.gold} breite={1.8} kopf={7} />; })}
        <T x="176" y="34" fontSize="11.5" fontWeight="800" fill={C.gold}>Licht (1 | 2 | −2)</T>
      </g>
      {/* Strahl durch F */}
      {strahl > 0.001 && (
        <g>
          <line x1={start[0]} y1={start[1]} x2={sF[0]} y2={sF[1]} stroke={C.gold} strokeWidth="1.6" strokeDasharray="4 3" opacity={strahl} />
          <line x1={sF[0]} y1={sF[1]} x2={teil(sF, sFs, strahl)[0]} y2={teil(sF, sFs, strahl)[1]} stroke={C.gold} strokeWidth="2.2" />
        </g>
      )}
      <circle cx={sF[0]} cy={sF[1]} r="4" fill={C.signal} opacity={haus} />
      <T x={sF[0] + 7} y={sF[1] - 6} fontSize="13" fontWeight="800" fill={C.signal} opacity={haus}>F</T>
      <g opacity={marke}>
        <circle cx={sFs[0]} cy={sFs[1]} r="4.5" fill={C.signal} />
        <T x={sFs[0] + 9} y={sFs[1] + 4} fontSize="12.5" fontWeight="800" fill={C.signal}>F′(3 | 4 | 0)</T>
        <T x={(sF[0] + sFs[0]) / 2 + 10} y={(sF[1] + sFs[1]) / 2} fontSize="12" fontWeight="800" fill={C.gold}>t = 1</T>
      </g>
      <Pille x={180} y={292} text="P′(p₁ + ½p₃ | p₂ + p₃ | 0)" farbe={C.see} voll o={formel} breite={250} gross={13} />
    </g>
  );
}

/* 2 · Die Spalten sind die Bilder der Einheitsvektoren */
const SP_DAUER = 26;
const spSchritte = () => [
  { von: 0, text: "Die drei Einheitsvektoren e₁, e₂, e₃ in Blau, Gold und Grün. Aus ihnen lässt sich jeder Punkt zusammensetzen." },
  { von: 4.5, text: "Ihre Schatten: e₁ und e₂ liegen schon am Boden und bleiben. Der Schatten von e₃ ist (½ | 1 | 0)." },
  { von: 9.5, text: "Diese drei Schatten sind die Spalten der Matrix A – in derselben Reihenfolge und in denselben Farben." },
  { von: 14, text: "Der Punkt P(1 | 2 | 2) ist 1 · e₁ + 2 · e₂ + 2 · e₃: ein Schritt Blau, zwei Gold, zwei Grün." },
  { von: 19.5, text: "Linear heißt: Sein Bild ist 1 · Spalte 1 + 2 · Spalte 2 + 2 · Spalte 3 = (2 | 4 | 0) – genau der Schatten von P." },
];
const SP_P = proj(52, 118, 190);
function spZeichne(t) {
  const P = SP_P, O = P([0, 0, 0]);
  const achsen = lauf(t, 0, 1);
  const ein = [0, 1, 2].map((j) => lauf(t, 0.6 + j * 0.5, 1.6 + j * 0.5));
  const schatten3 = lauf(t, 5.2, 6.8), puls = lauf(t, 4.6, 5.4) * (1 - lauf(t, 7.4, 8.4));
  const matrix = lauf(t, 9.8, 11);
  const kette = [lauf(t, 14.4, 15.6), lauf(t, 15.6, 16.6), lauf(t, 16.6, 17.8)];
  const bild = [lauf(t, 19.8, 21), lauf(t, 21, 22), lauf(t, 22, 23.2)];
  const strahl = lauf(t, 23.4, 24.6);
  const e3s = [0.5, 1, 0];
  /* Kette e₁ + 2e₂ + 2e₃ und ihr Bild (1|0|0) + 2 · (0|1|0) + 2 · (½|1|0) */
  const k0 = [0, 0, 0], k1 = [1, 0, 0], k2 = [1, 2, 0], k3 = [1, 2, 2];
  const b1 = [1, 0, 0], b2 = [1, 2, 0], b3 = [2, 4, 0];
  const st = (a, b, p) => teil(P(a), P(b), p);
  const achse = (e, l, name) => { const z = P(e.map((x) => x * l)); return (
    <g key={name} opacity={achsen * 0.9}>
      <line x1={O[0]} y1={O[1]} x2={z[0]} y2={z[1]} stroke={C.hellgrau} strokeWidth="1" />
      <T x={z[0] + (name === "x₁" ? -16 : 4)} y={z[1] + (name === "x₃" ? -4 : 12)} fontSize="11" fontWeight="700" fill={C.grau}>{name}</T>
    </g>
  ); };
  const ziele = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  const sp = [[1, 0, 0], [0, 1, 0], ["½", 1, 0]];
  return (
    <g>
      <polygon points={zug([[-0.4, -0.4, 0], [3.4, -0.4, 0], [3.4, 3.8, 0], [-0.4, 3.8, 0]].map(P))} fill={C.himmel} opacity={0.7 * achsen} />
      {achse([1, 0, 0], 3.1, "x₁")}{achse([0, 1, 0], 3.5, "x₂")}{achse([0, 0, 1], 2.7, "x₃")}
      {ziele.map((e, j) => <Pfeil key={j} a={O} b={P(e)} farbe={FARBE[j]} breite={puls > 0 && j < 2 ? 2.6 + 1.6 * puls : 2.6} o={ein[j]} kopf={9} />)}
      {ziele.map((e, j) => { const z = P(e); return <T key={j} x={z[0] + [-20, 2, -22][j]} y={z[1] + [6, -8, 4][j]} fontSize="12.5" fontWeight="800" fill={FARBE[j]} opacity={ein[j]}>{E_NAME[j]}</T>; })}
      {/* Schatten von e₃ */}
      {schatten3 > 0.001 && (
        <g>
          <line x1={P([0, 0, 1])[0]} y1={P([0, 0, 1])[1]} x2={teil(P([0, 0, 1]), P(e3s), schatten3)[0]} y2={teil(P([0, 0, 1]), P(e3s), schatten3)[1]} stroke={C.gold} strokeWidth="1.2" strokeDasharray="3 3" />
          <Pfeil a={O} b={teil(O, P(e3s), schatten3)} farbe={C.smaragd} breite={2.4} strich="5 3" kopf={8} />
          <T x={P(e3s)[0] + 6} y={P(e3s)[1] + 14} fontSize="11.5" fontWeight="800" fill={C.smaragd} opacity={schatten3 * (1 - kette[0])}>(½ | 1 | 0)</T>
        </g>
      )}
      {/* Matrix oben rechts */}
      {matrix > 0.001 && (
        <g opacity={matrix} textAnchor="middle" fontWeight="800" fontSize="14">
          <T x="232" y="52" fontSize="15" fill={C.tinte}>A =</T>
          <path d="M262 26 Q256 26 256 32 V82 Q256 88 262 88" fill="none" stroke={C.tinte} strokeWidth="1.5" />
          <path d="M342 26 Q348 26 348 32 V82 Q348 88 342 88" fill="none" stroke={C.tinte} strokeWidth="1.5" />
          {sp.map((s, j) => s.map((z, i) => <T key={`${i}${j}`} x={276 + j * 26} y={43 + i * 19} fill={FARBE[j]}>{z}</T>))}
        </g>
      )}
      {/* Kette zu P */}
      <Pfeil a={P(k0)} b={st(k0, k1, kette[0])} farbe={C.see} breite={3} o={kette[0]} kopf={9} />
      <Pfeil a={P(k1)} b={st(k1, k2, kette[1])} farbe={C.gruen} breite={3} o={kette[1]} kopf={9} />
      <Pfeil a={P(k2)} b={st(k2, k3, kette[2])} farbe={C.smaragd} breite={3} o={kette[2]} kopf={9} />
      <g opacity={kette[2]}>
        <circle cx={P(k3)[0]} cy={P(k3)[1]} r="4.5" fill={C.signal} />
        <T x={P(k3)[0] - 8} y={P(k3)[1] - 8} textAnchor="end" fontSize="12.5" fontWeight="800" fill={C.signal}>P(1 | 2 | 2)</T>
      </g>
      {/* Bildkette am Boden */}
      <Pfeil a={P(k0)} b={st(k0, b1, bild[0])} farbe={C.see} breite={3} o={bild[0]} kopf={9} strich="6 3" />
      <Pfeil a={P(b1)} b={st(b1, b2, bild[1])} farbe={C.gruen} breite={3} o={bild[1]} kopf={9} strich="6 3" />
      <Pfeil a={P(b2)} b={st(b2, b3, bild[2])} farbe={C.smaragd} breite={3} o={bild[2]} kopf={9} strich="6 3" />
      {strahl > 0.001 && <line x1={P(k3)[0]} y1={P(k3)[1]} x2={teil(P(k3), P(b3), strahl)[0]} y2={teil(P(k3), P(b3), strahl)[1]} stroke={C.gold} strokeWidth="1.4" strokeDasharray="3 3" />}
      <g opacity={bild[2]}>
        <circle cx={P(b3)[0]} cy={P(b3)[1]} r="4.5" fill={C.signal} />
        <T x={P(b3)[0] - 4} y={P(b3)[1] + 20} textAnchor="middle" fontSize="12.5" fontWeight="800" fill={C.signal}>P′(2 | 4 | 0)</T>
      </g>
      <T x="352" y="292" textAnchor="end" fontSize="11.5" fontWeight="700" fill={C.grau} opacity={bild[2]}>= Sp. 1 + 2 · Sp. 2 + 2 · Sp. 3</T>
    </g>
  );
}

/* 3 · Lot auf eine Ebene durch den Ursprung */
const LOT_DAUER = 24;
const lotSchritte = () => [
  { von: 0, text: "Eine Ebene durch den Ursprung mit dem Normalenvektor n = (−1 | 2 | 2). Ihre Punkte erfüllen −x₁ + 2x₂ + 2x₃ = 0." },
  { von: 4.5, text: "Von Q(1 | 2 | 3) geht es senkrecht zur Ebene, also in Richtung des Normalenvektors: X = Q + t · n." },
  { von: 9.5, text: "Q · n = 9 und n · n = 9, also λ = 1 und Q′ = Q − n = (2 | 0 | 1). Die Strecke QQ′ ist genau n." },
  { von: 14.5, text: "Probe: −2 + 0 + 2 = 0, also liegt Q′ in der Ebene. Die Strecke QQ′ steht senkrecht auf ihr." },
  { von: 19, text: "Projiziert man Q′ noch einmal, ist λ = 0: Q′ bleibt liegen. Deshalb gilt A · A = A." },
];
const LOT_P = proj(36, 170, 178);
const LOT_N = [-1, 2, 2], LOT_Q = [1, 2, 3], LOT_QS = [2, 0, 1];
const LOT_A = norm(kreuz(LOT_N, [1, 0, 0])), LOT_B = norm(kreuz(LOT_N, LOT_A));
const ebenenRand = (a, b, r, n = 40) => Array.from({ length: n }, (_, i) => { const w = (2 * Math.PI * i) / n; return a.map((x, k) => r * (Math.cos(w) * x + Math.sin(w) * b[k])); });
function lotZeichne(t) {
  const P = LOT_P, O = P([0, 0, 0]);
  const ebene = lauf(t, 0, 1.4), nPf = lauf(t, 1.2, 2.4);
  const q = lauf(t, 4.8, 5.8), lot = lauf(t, 6, 8.6);
  const zahlen = lauf(t, 9.8, 11), winkel = lauf(t, 14.8, 15.8), puls = lauf(t, 19.4, 20.2) * (1 - lauf(t, 21.8, 22.8));
  const rand = ebenenRand(LOT_A, LOT_B, 3.3).map(P);
  const sq = P(LOT_Q), sqs = P(LOT_QS);
  /* rechter Winkel bei Q′: kleine Ecke aus Lotrichtung und einer Richtung in der Ebene */
  const ecke = (() => {
    const u = norm(LOT_N).map((x) => x * 0.5), v = norm(LOT_QS).map((x) => x * -0.5);
    return [LOT_QS.map((x, i) => x + u[i]), LOT_QS.map((x, i) => x + u[i] + v[i]), LOT_QS.map((x, i) => x + v[i])].map(P);
  })();
  const achse = (e, l, name) => { const z = P(e.map((x) => x * l)); return (
    <g key={name} opacity={0.8 * ebene}>
      <line x1={O[0]} y1={O[1]} x2={z[0]} y2={z[1]} stroke={C.hellgrau} strokeWidth="1" />
      <T x={z[0] + 4} y={z[1] + (name === "x₃" ? -2 : 12)} fontSize="11" fontWeight="700" fill={C.grau}>{name}</T>
    </g>
  ); };
  return (
    <g>
      <polygon points={zug(rand)} fill={C.himmel} stroke={C.seeHell} strokeWidth="1.2" opacity={ebene} />
      <T x={rand[30][0] - 6} y={rand[30][1] + 4} textAnchor="end" fontSize="11" fontWeight="700" fill={C.see} opacity={ebene}>E</T>
      {achse([1, 0, 0], 3.2, "x₁")}{achse([0, 1, 0], 3.4, "x₂")}{achse([0, 0, 1], 3.4, "x₃")}
      <circle cx={O[0]} cy={O[1]} r="3" fill={C.tinte} opacity={ebene} />
      <T x={O[0] - 12} y={O[1] + 4} fontSize="11" fontWeight="700" fill={C.tinte} opacity={ebene}>O</T>
      <Pfeil a={O} b={P(LOT_N)} farbe={C.see} breite={2.6} o={nPf} kopf={9} />
      <T x={P(LOT_N)[0] + 7} y={P(LOT_N)[1] + 4} fontSize="13" fontWeight="800" fill={C.see} opacity={nPf}>n</T>
      <g opacity={q}>
        <circle cx={sq[0]} cy={sq[1]} r="4.5" fill={C.signal} />
        <T x={sq[0] - 10} y={sq[1] - 6} textAnchor="end" fontSize="12.5" fontWeight="800" fill={C.signal}>Q(1 | 2 | 3)</T>
      </g>
      {lot > 0.001 && <line x1={sq[0]} y1={sq[1]} x2={teil(sq, sqs, lot)[0]} y2={teil(sq, sqs, lot)[1]} stroke={C.gold} strokeWidth="2.2" strokeDasharray={lot < 1 ? "5 3" : undefined} />}
      <polyline points={zug(ecke)} fill="none" stroke={C.gold} strokeWidth="1.4" opacity={winkel} />
      <g opacity={zahlen}>
        {puls > 0.001 && <circle cx={sqs[0]} cy={sqs[1]} r={8 + 10 * puls} fill={C.smaragd} opacity={0.25 * (1 - puls * 0.4)} />}
        <circle cx={sqs[0]} cy={sqs[1]} r="4.5" fill={C.smaragd} />
        <T x={sqs[0] - 10} y={sqs[1] + 18} textAnchor="end" fontSize="12.5" fontWeight="800" fill={C.smaragd}>Q′(2 | 0 | 1)</T>
        <T x={(sq[0] + sqs[0]) / 2 - 10} y={(sq[1] + sqs[1]) / 2 + 4} textAnchor="end" fontSize="12" fontWeight="800" fill={C.gold}>λ = 1</T>
      </g>
      <Pille x={180} y={300} text="Probe: −2 + 0 + 2 = 0" farbe={C.smaragd} o={winkel * (1 - lauf(t, 19, 19.6))} breite={200} />
      <Pille x={180} y={300} text="noch einmal: λ = 0, A · A = A" farbe={C.smaragd} voll o={lauf(t, 19.4, 20.4)} breite={250} />
    </g>
  );
}

/* 4 · Schrägbild im Heft und Bildschirm */
const SR_DAUER = 26;
const srSchritte = () => [
  { von: 0, text: "Im Heft zeigt x₂ nach rechts, x₃ nach oben und x₁ schräg nach vorn. Eine Einheit ist dort eine Kästchendiagonale." },
  { von: 5, text: "Mit 1 cm pro Einheit landet e₁ bei (−½ | −½), e₂ bei (1 | 0) und e₃ bei (0 | 1) – Punkte auf dem Blatt." },
  { von: 10, text: "Das sind die Spalten einer 2 × 3-Matrix. Mit ihr wird jede Ecke des Würfels zu einem Punkt auf dem Blatt." },
  { von: 15, text: "Parallele Kanten bleiben parallel und gleich lang – das Schrägbild ist eine Parallelprojektion." },
  { von: 19.5, text: "Ein Bildschirm teilt dagegen durch die Tiefe: Fernes wird kleiner. Das ist nicht linear, also keine Matrix." },
];
const SR_G = 18;                               // Kästchen 0,5 cm = 18 px, 1 cm = 36 px
const SR_P = proj(36, 126, 214);
const WUERFEL = [[0, 0, 0], [2, 0, 0], [2, 2, 0], [0, 2, 0], [0, 0, 2], [2, 0, 2], [2, 2, 2], [0, 2, 2]];
const WUERFEL_K = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
function srZeichne(t) {
  const P = SR_P, O = P([0, 0, 0]);
  const aus = 1 - lauf(t, 19.6, 20.6);
  const gitter = lauf(t, 0, 1) * aus, achsen = lauf(t, 0.6, 1.8) * aus;
  const ev = [0, 1, 2].map((j) => lauf(t, 5.4 + j * 0.6, 6.4 + j * 0.6) * aus);
  const matrix = lauf(t, 10.2, 11.4) * aus, wuerfel = lauf(t, 11.2, 13.4);
  const parallel = lauf(t, 15.4, 16.4) * aus;
  const vergleich = lauf(t, 20.4, 21.8);
  const s = WUERFEL.map(P);
  const linien = [];
  for (let x = 0; x <= 360; x += SR_G) linien.push(<line key={`v${x}`} x1={x} y1="0" x2={x} y2="300" stroke={C.linie} strokeWidth="0.8" />);
  for (let y = 214 % SR_G; y <= 300; y += SR_G) linien.push(<line key={`h${y}`} x1="0" y1={y} x2="360" y2={y} stroke={C.linie} strokeWidth="0.8" />);
  const sp = [["−½", "1", "0"], ["−½", "0", "1"]];
  /* Vergleich: links Schrägbild zweier gleich großer Würfel, rechts Zentralprojektion (Auge in O, Bildschirm x₁ = 1) */
  const Pl = proj(34, 50, 230);
  const klein = WUERFEL.map((p) => p.map((x) => x / 2));
  const w1 = klein.map((p) => Pl([p[0] + 1, p[1], p[2]])), w2 = klein.map((p) => Pl([p[0] - 2, p[1] + 1.4, p[2]]));
  const zen = (p) => [271 + 120 * (p[1] / p[0]), 180 - 120 * (p[2] / p[0])];
  const z1 = klein.map((p) => zen([p[0] + 2, p[1] - 0.9, p[2] - 1])), z2 = klein.map((p) => zen([p[0] + 4, p[1] + 0.4, p[2] - 1]));
  const kanten = (pts, farbe, k) => WUERFEL_K.map(([a, b], i) => <line key={`${k}${i}`} x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]} stroke={farbe} strokeWidth="1.6" strokeLinecap="round" />);
  return (
    <g>
      <g opacity={gitter}>{linien}</g>
      <g opacity={achsen}>
        <line x1={O[0]} y1={O[1]} x2={P([0, 4.2, 0])[0]} y2={O[1]} stroke={C.tinte} strokeWidth="1.3" />
        <line x1={O[0]} y1={O[1]} x2={O[0]} y2={P([0, 0, 4.6])[1]} stroke={C.tinte} strokeWidth="1.3" />
        <line x1={O[0]} y1={O[1]} x2={P([3, 0, 0])[0]} y2={P([3, 0, 0])[1]} stroke={C.tinte} strokeWidth="1.3" />
        <T x={P([0, 4.2, 0])[0] - 2} y={O[1] - 6} textAnchor="end" fontSize="12" fontWeight="700" fill={C.tinte}>x₂</T>
        <T x={O[0] + 6} y={P([0, 0, 4.6])[1] + 10} fontSize="12" fontWeight="700" fill={C.tinte}>x₃</T>
        <T x={P([3, 0, 0])[0] + 8} y={P([3, 0, 0])[1] + 2} fontSize="12" fontWeight="700" fill={C.tinte}>x₁</T>
      </g>
      {[[1, 0, 0], [0, 1, 0], [0, 0, 1]].map((e, j) => <Pfeil key={j} a={O} b={P(e)} farbe={FARBE[j]} breite={3} o={ev[j]} kopf={9} />)}
      <T x={P([1, 0, 0])[0] - 30} y={P([1, 0, 0])[1] + 4} fontSize="12" fontWeight="800" fill={FARBE[0]} opacity={ev[0]}>e₁</T>
      <T x={P([0, 1, 0])[0] - 6} y={P([0, 1, 0])[1] + 16} fontSize="12" fontWeight="800" fill={FARBE[1]} opacity={ev[1]}>e₂</T>
      <T x={P([0, 0, 1])[0] - 20} y={P([0, 0, 1])[1] + 4} fontSize="12" fontWeight="800" fill={FARBE[2]} opacity={ev[2]}>e₃</T>
      <g opacity={wuerfel * aus}>
        {WUERFEL_K.map(([a, b], i) => {
          const hinten = a === 0 || b === 0;          // Ecke O liegt hinten links unten und ist verdeckt
          const par = parallel > 0.01 && [[0, 1], [3, 2], [4, 5], [7, 6]].some(([x, y]) => (x === a && y === b) || (x === b && y === a));
          return <line key={i} x1={s[a][0]} y1={s[a][1]} x2={s[b][0]} y2={s[b][1]} stroke={par ? C.signal : C.seeTief} strokeWidth={par ? 2.4 : 1.7} strokeDasharray={hinten ? "4 3" : undefined} strokeLinecap="round" />;
        })}
      </g>
      {matrix > 0.001 && (
        <g opacity={matrix} textAnchor="middle" fontWeight="800" fontSize="14">
          <T x="226" y="62" fontSize="15" fill={C.tinte}>S =</T>
          <path d="M256 40 Q250 40 250 46 V76 Q250 82 256 82" fill="none" stroke={C.tinte} strokeWidth="1.5" />
          <path d="M344 40 Q350 40 350 46 V76 Q350 82 344 82" fill="none" stroke={C.tinte} strokeWidth="1.5" />
          {sp.map((z, i) => z.map((x, j) => <T key={`${i}${j}`} x={272 + j * 28} y={57 + i * 20} fill={FARBE[j]}>{x}</T>))}
        </g>
      )}
      {vergleich > 0.001 && (
        <g opacity={vergleich}>
          <rect x="6" y="20" width="166" height="272" rx="12" fill={C.weiss} stroke={C.linie} />
          <rect x="188" y="20" width="166" height="272" rx="12" fill={C.weiss} stroke={C.linie} />
          <T x="89" y="44" textAnchor="middle" fontSize="12.5" fontWeight="800" fill={C.see}>Schrägbild</T>
          <T x="89" y="62" textAnchor="middle" fontSize="11" fontWeight="600" fill={C.grau}>gleich groß, parallel</T>
          <T x="271" y="44" textAnchor="middle" fontSize="12.5" fontWeight="800" fill={C.signal}>Bildschirm</T>
          <T x="271" y="62" textAnchor="middle" fontSize="11" fontWeight="600" fill={C.grau}>Fernes wird kleiner</T>
          <T x="247" y="258" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={C.grau}>Tiefe 2</T>
          <T x="298" y="228" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={C.grau}>Tiefe 4</T>
          <T x="42" y="276" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={C.grau}>vorn</T>
          <T x="140" y="152" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={C.grau}>hinten</T>
          {kanten(w1, C.seeTief, "a")}{kanten(w2, C.seeTief, "b")}
          {kanten(z1, C.seeTief, "c")}{kanten(z2, C.seeTief, "d")}
          <T x="271" y="282" textAnchor="middle" fontSize="12" fontWeight="800" fill={C.signal}>(p₂ : p₁ | p₃ : p₁)</T>
          <T x="120" y="282" textAnchor="middle" fontSize="12" fontWeight="800" fill={C.see}>S · p</T>
        </g>
      )}
    </g>
  );
}

const PROJ_ANIM = {
  schatten: { titel: () => "Der Schatten eines Hauses", unter: () => "Lichtstrahl als Gerade, Schnitt mit dem Boden, Rechenvorschrift",
    szene: () => ({ dauer: SCH_DAUER, hoehe: 306, schritte: schSchritte(), zeichne: schZeichne,
      beschreibung: "Animation: Ein Haus steht auf dem Boden, parallele Sonnenstrahlen in Richtung (1 | 2 | −2). Der Strahl durch die Ecke F(2 | 2 | 2) trifft den Boden bei t = 1 im Punkt F′(3 | 4 | 0). Danach werfen alle Ecken ihren Schatten, und die Rechenvorschrift P′(p₁ + ½p₃ | p₂ + p₃ | 0) erscheint." }) },
  spalten: { titel: () => "Spalten sind Bilder der Einheitsvektoren", unter: () => "Warum Matrix mal Vektor die Spalten gewichtet addiert",
    szene: () => ({ dauer: SP_DAUER, hoehe: 300, schritte: spSchritte(), zeichne: spZeichne,
      beschreibung: "Animation: Die Einheitsvektoren e₁, e₂, e₃ in Blau, Gold und Grün und ihre Schatten (1 | 0 | 0), (0 | 1 | 0) und (½ | 1 | 0) als Spalten der Matrix. Der Punkt P(1 | 2 | 2) wird aus e₁ + 2 · e₂ + 2 · e₃ gebaut, sein Schatten aus Spalte 1 + 2 · Spalte 2 + 2 · Spalte 3 = (2 | 4 | 0)." }) },
  lot: { titel: () => "Das Lot auf eine Ebene", unter: () => "Q′ = Q − λ · n, Probe mit dem Skalarprodukt, zweimal projizieren",
    szene: () => ({ dauer: LOT_DAUER, hoehe: 314, schritte: lotSchritte(), zeichne: lotZeichne,
      beschreibung: "Animation: Ebene durch den Ursprung mit Normalenvektor (−1 | 2 | 2). Vom Punkt Q(1 | 2 | 3) führt das Lot zum Fußpunkt Q′(2 | 0 | 1) mit λ = 1; Probe −2 + 0 + 2 = 0; noch einmal projiziert bleibt Q′ liegen." }) },
  schraeg: { titel: () => "Schrägbild im Heft – und der Bildschirm", unter: () => "Eine 2 × 3-Matrix fürs Heft, Teilen durch die Tiefe am Bildschirm",
    szene: () => ({ dauer: SR_DAUER, hoehe: 300, schritte: srSchritte(), zeichne: srZeichne,
      beschreibung: "Animation: Achsenkreuz auf Karopapier, die Einheitsvektoren landen bei (−½ | −½), (1 | 0) und (0 | 1). Diese Spalten bilden die Matrix S, mit der ein Würfel gezeichnet wird; parallele Kanten bleiben parallel. Zum Schluss der Vergleich: Im Schrägbild sind zwei gleiche Würfel gleich groß, am Bildschirm ist der doppelt so weit entfernte halb so groß." }) },
};

function ProjektionAnimation({ art, offen = false }) {
  return <AnimKarte szenen={PROJ_ANIM} art={art} offen={offen} merkmal="data-proj-anim" />;
}

/* ======================================================================
   Labor: Haus, Licht bzw. Ebene einstellen, Matrix mit farbigen Spalten
   ====================================================================== */
const LAB_W = 360;
/* Im Schatten-Modus steht das Haus etwas rechts vom Ursprung (x₂ von 1,5 bis 3,5), damit die Bilder der
   Einheitsvektoren am Ursprung frei sichtbar bleiben; die Abbildung ist linear, das Verschieben ändert nichts an ihr. */
const LAB_HAUS_S = HAUS.ecken.map(([a, b, c]) => [a, b + 1.5, c]);
function Regler({ name, wert, setzen, label }) {
  return (
    <div className="flex items-center" style={{ gap: 8 }}>
      <PlusMinus setzen={setzen} label={label} />
      <span style={{ fontSize: 14, color: C.tinte, minWidth: 54 }}><M t={`${name} = ${qTex(Q(wert))}`} /></span>
    </div>
  );
}
function ProjektionLabor() {
  const [modus, setModus] = useState("schatten");
  const [w, setW] = useState({ v1: 1, v2: 2, n1: -1, n2: 2, n3: 2 });
  const [strahlen, setStrahlen] = useState(true);
  const [probe, setProbe] = useState(false);
  const setze = (k, d) => setW((alt) => {
    const [lo, hi] = k[0] === "v" ? LABOR_GRENZEN.v : LABOR_GRENZEN.n;
    const neu = { ...alt, [k]: Math.max(lo, Math.min(hi, alt[k] + d)) };
    return k[0] === "n" && !neu.n1 && !neu.n2 && !neu.n3 ? alt : neu;
  });
  const schatt = modus === "schatten";
  const A = laborMatrix(modus, w);
  const AN = A.map((z) => z.map(qWert));
  const bild = (p) => [0, 1, 2].map((i) => AN[i][0] * p[0] + AN[i][1] * p[1] + AN[i][2] * p[2]);
  const P = schatt ? proj(28, 124, 150) : proj(28, 180, 135);
  const LAB_H = schatt ? 228 : 270;
  const O = P([0, 0, 0]);
  const ecken = schatt ? LAB_HAUS_S : HAUS.ecken;
  const s = ecken.map(P);
  const b3 = ecken.map(bild), b = b3.map(P);
  const n = [w.n1, w.n2, w.n3];
  const ebene = schatt
    ? [[-3, -1.5, 0], [5, -1.5, 0], [5, 6.5, 0], [-3, 6.5, 0]].map(P)
    : (() => { const a = norm(kreuz(n, Math.abs(n[0]) < 0.9 * Math.hypot(...n) ? [1, 0, 0] : [0, 1, 0])); const c = norm(kreuz(n, a)); return ebenenRand(a, c, 3.6, 48).map(P); })();
  const AA = matMal(A, A);
  const idem = mGleich(AA, A);
  const v = [w.v1, w.v2, -2];
  const dir = (() => { const [u, ww] = schraegZahl(v); const l = Math.hypot(u, ww); return [u / l, -ww / l]; })();
  return (
    <div data-proj-labor="" data-modus={modus} data-matrix={JSON.stringify(A.map((z) => z.map(qText)))}>
      <div className="flex flex-wrap" style={{ gap: 8, marginBottom: 12 }}>
        <Chip aktiv={schatt} onClick={() => { setModus("schatten"); setProbe(false); }}>Schatten (Sonne)</Chip>
        <Chip aktiv={!schatt} onClick={() => { setModus("ortho"); setProbe(false); }}>Senkrecht auf eine Ebene</Chip>
      </div>
      <div className="flex flex-wrap items-center" style={{ gap: "10px 18px", marginBottom: 10 }}>
        {schatt ? (
          <>
            <Regler name="v_1" wert={w.v1} setzen={(d) => setze("v1", d)} label="Komponente v1" />
            <Regler name="v_2" wert={w.v2} setzen={(d) => setze("v2", d)} label="Komponente v2" />
            <span style={{ fontSize: 13, color: C.grau }}>Licht <M t={`\\vec{v} = ${vTex(V(w.v1, w.v2, -2))}`} /></span>
          </>
        ) : (
          <>
            <Regler name="n_1" wert={w.n1} setzen={(d) => setze("n1", d)} label="Komponente n1" />
            <Regler name="n_2" wert={w.n2} setzen={(d) => setze("n2", d)} label="Komponente n2" />
            <Regler name="n_3" wert={w.n3} setzen={(d) => setze("n3", d)} label="Komponente n3" />
          </>
        )}
      </div>
      <svg viewBox={`0 0 ${LAB_W} ${LAB_H}`} style={{ width: "100%", maxWidth: 480, display: "block", margin: "0 auto", background: C.sand, borderRadius: 12 }} role="img" data-labor-bild=""
        aria-label={schatt ? `Haus und sein Schatten bei Licht in Richtung (${w.v1} | ${w.v2} | −2)` : `Haus und sein senkrechtes Bild auf der Ebene mit Normalenvektor (${n.join(" | ")})`}>
        <polygon points={zug(ebene)} fill={C.himmel} stroke={C.seeHell} strokeWidth="1" opacity={schatt ? 1 : 0.85} />
        <polygon points={zug(huelle(b))} fill={C.flaggold} opacity="0.4" stroke={C.gold} strokeWidth="1.2" />
        {!schatt && <Draht punkte={b} farbe={C.gold} breite={1.3} />}
        {strahlen && ecken.map((e, i) => (Math.hypot(b[i][0] - s[i][0], b[i][1] - s[i][1]) > 2
          ? <line key={i} x1={s[i][0]} y1={s[i][1]} x2={b[i][0]} y2={b[i][1]} stroke={C.gold} strokeWidth="0.9" strokeDasharray="3 3" /> : null))}
        {schatt ? <Haus P={P} ecken={ecken} /> : <Draht punkte={s} farbe={C.seeTief} breite={1.5} />}
        {/* Bilder der Einheitsvektoren = Spalten */}
        {[0, 1, 2].map((j) => <Pfeil key={j} a={O} b={P(spalte(AN, j))} farbe={FARBE[j]} breite={2.6} kopf={8} />)}
        <circle cx={O[0]} cy={O[1]} r="2.6" fill={C.tinte} />
        {schatt ? (
          <g>
            <circle cx="22" cy="22" r="11" fill={C.flaggold} />
            {[0, 1].map((i) => { const a = [44 + i * 30, 16 + i * 10]; return <Pfeil key={i} a={a} b={[a[0] + dir[0] * 34, a[1] + dir[1] * 34]} farbe={C.gold} breite={1.6} kopf={6} />; })}
          </g>
        ) : (
          <g>
            <Pfeil a={O} b={P(norm(n).map((x) => x * 1.6))} farbe={C.signal} breite={2} kopf={7} strich="4 3" />
            <T x={P(norm(n).map((x) => x * 1.6))[0] + 5} y={P(norm(n).map((x) => x * 1.6))[1] - 3} fontSize="11" fontWeight="800" fill={C.signal}>n</T>
          </g>
        )}
      </svg>
      <div className="flex flex-wrap justify-center" style={{ gap: 14, marginTop: 8 }}>
        <button type="button" onClick={() => setStrahlen((x) => !x)} aria-pressed={strahlen} style={LINK}>{strahlen ? (schatt ? "Lichtstrahlen ausblenden" : "Lote ausblenden") : (schatt ? "Lichtstrahlen zeigen" : "Lote zeigen")}</button>
      </div>
      <MitteBox>
        <MatrixBild A={A} name="A" ganz={!schatt} merkmal="data-labor-matrix" />
        <SpaltenLegende />
      </MitteBox>
      <p style={{ fontSize: 13, color: C.grau, fontWeight: 300, lineHeight: 1.6, textAlign: "center", marginTop: -6 }}>
        {schatt ? "Nur die dritte Spalte hängt vom Licht ab – Punkte am Boden bleiben, wo sie sind." : "Der Normalenvektor wird auf den Nullvektor abgebildet: Das Lot schrumpft auf einen Punkt."}
      </p>
      <div className="flex flex-wrap justify-center" style={{ gap: 10, marginTop: 10 }}>
        <button type="button" onClick={() => setProbe((x) => !x)} className="px-5 py-3" style={KNOPF(true, C.seeTief)} aria-pressed={probe}>{probe ? "Probe ausblenden" : "Probe A · A = A"}</button>
      </div>
      {probe && (
        <div data-probe={idem ? "ja" : "nein"} style={{ marginTop: 12 }}>
          <MitteBox>
            <MatrixBild A={AA} name={"A \\cdot A"} ganz={!schatt} farbig={false} />
            <p style={{ fontSize: 14, fontWeight: 700, color: idem ? C.smaragd : C.signal, marginTop: 8 }}>{idem ? "= A: Zweimal projizieren ändert nichts." : "≠ A"}</p>
          </MitteBox>
        </div>
      )}
    </div>
  );
}

/* ======================================================================
   Übungen
   ====================================================================== */
const ARIA = { y1: "erste Komponente", y2: "zweite Komponente", y3: "dritte Komponente", x1: "x1 von P Strich", x2: "x2 von P Strich", x3: "x3 von P Strich" };
function Eingabe({ k, wert, setzen, stand, onEnter, breite = 62, label }) {
  return (
    <MatheFeld modus="bruch" value={wert} onChange={(e) => setzen(k, e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") onEnter(); }}
      aria-label={label || ARIA[k] || `Zeile ${k[1]}, Spalte ${k[2]}`} data-feld={k} placeholder="?" style={{ ...ZELLE(stand), width: breite, padding: "7px 4px", fontSize: 15 }} />
  );
}
function EingabeForm({ a, ein, setze, erg, pruefen }) {
  const { form, keys } = felder(a);
  const feld = (k, breite) => <Eingabe key={`${k}-${a.art}`} k={k} breite={breite} wert={ein[k] ?? ""} setzen={setze} stand={erg ? erg.felder[k] : null} onEnter={pruefen} />;
  if (form === "punkt") return (
    <div className="flex items-center" style={{ gap: 4, fontSize: 18, color: C.tinte, flexWrap: "nowrap" }}>
      <span style={{ fontWeight: 600 }}>P′(</span>{feld("x1", 60)}<span>|</span>{feld("x2", 60)}<span>|</span>{feld("x3", 60)}<span style={{ fontWeight: 600 }}>)</span>
    </div>
  );
  const links = form === "spalte" ? (a.B ? "A \\cdot (B \\cdot \\vec{x}) =" : "A \\cdot \\vec{x} =") : "A =";
  const spalten = form === "spalte" ? 1 : 3;
  return (
    <div className="flex items-center" style={{ gap: 8, fontSize: 17, color: C.tinte }}>
      <M t={links} />
      <span style={{ display: "inline-flex", alignItems: "stretch" }}>
        <span style={KLAMMER(true)} />
        <span style={{ display: "grid", gridTemplateColumns: `repeat(${spalten}, auto)`, gap: 6, padding: "4px 5px" }}>{keys.map((k) => feld(k, spalten === 1 ? 70 : 56))}</span>
        <span style={KLAMMER(false)} />
      </span>
    </div>
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
function ProjektionTrainer() {
  const [art, setArt] = useState("matvek");
  const [stufe, setStufe] = useState(1);
  const [auf, setAufRoh] = useState(() => merk(aufgabe("matvek", 1)));
  const setAuf = (a) => setAufRoh(merk(a));
  const [ein, setEin] = useState({});
  const [erg, setErg] = useState(null);
  const [zeigen, setZeigen] = useState(false);
  const [serie, setSerie] = useState({ n: 0, ok: 0 });
  const neu = (a = art, s = stufe) => { setAuf(aufgabe(a, s)); setEin({}); setErg(null); setZeigen(false); };
  const artSetzen = (a) => { setArt(a); neu(a, stufe); };
  const stufeSetzen = (s) => { const v = Math.max(1, Math.min(5, s)); setStufe(v); neu(art, v); };
  const setze = (k, v) => { setEin((e) => ({ ...e, [k]: v })); setErg(null); };
  const { keys } = felder(auf);
  const leer = keys.some((k) => !String(ein[k] ?? "").trim());
  const pruefen = () => {
    if (leer) return;
    const e = pruefe(auf, ein);
    setErg(e);
    setSerie((x) => ({ n: x.n + 1, ok: x.ok + (e.ok ? 1 : 0) }));
  };
  const weg = <Formeln zeilen={rechenweg(auf)} max={15} min={9.5} farbe={C.see} />;
  return (
    <div>
      <p style={{ ...FLIESS, lineHeight: 1.7, marginBottom: 18 }}>
        Vier Aufgabentypen mit immer neuen Zahlen: Matrix mal Vektor, eine Matrix aus den Bildern der Einheitsvektoren aufstellen,
        Schattenpunkte berechnen und Punkte senkrecht auf eine Ebene projizieren. Brüche gibst du als 3/4 ein, negative Zahlen mit Minus.
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        {ARTEN.map((a) => <Chip key={a.id} aktiv={art === a.id} onClick={() => artSetzen(a.id)}>{a.name}</Chip>)}
      </div>
      <Stufen art={art} stufe={stufe} setzen={stufeSetzen} />
      <div style={KARTE} data-mm-karte="" data-projtrainer="">
        <Text s={auftrag(auf)} style={{ fontSize: 15, color: C.tinte, fontWeight: 400, lineHeight: 1.9, marginBottom: 12 }} />
        {auf.art === "matvek" && (
          <div className="flex flex-wrap items-center" style={{ gap: "10px 20px", marginBottom: 14 }}>
            {auf.B && <MatrixBild A={auf.B} name="B" farbig={false} gross={15} />}
            <MatrixBild A={auf.A} name="A" gross={15} />
            <span style={{ fontSize: 15 }}><M t={`\\vec{x} = ${vTex(auf.x)}`} /></span>
          </div>
        )}
        <div style={{ marginBottom: 14, overflowX: "auto" }}>
          <EingabeForm a={auf} ein={ein} setze={setze} erg={erg} pruefen={pruefen} />
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
            <Text s={erg.grund || tipp(auf)} style={{ fontSize: 14, color: C.tinte, fontWeight: 300, lineHeight: 1.85 }} />
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
const ERGEBNIS = { fontSize: 15, color: C.tinte, fontWeight: 500, lineHeight: 1.85, margin: "8px 0 10px" };
const SCHATTEN_A = schattenMatrix(LICHT);
const ORTHO_A = orthoMatrix(NORMALE);
export function GfsProjektionSeite({ gehe }) {
  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 22 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 14 }}>
        Wie macht man aus einem Körper im Raum ein flaches Bild – und warum genügt dafür eine Matrix?
      </h2>
      <Text s={`Ein Haus im Sonnenlicht wirft einen flachen Schatten. Eine Zeichnung im Heft macht aus einem Würfel ein Bild auf dem
        Papier, ein Bildschirm aus einer 3D-Welt ein flaches Foto. Jedes Mal wird aus einem Punkt im Raum ein Punkt in einer Ebene.`} style={FLIESS} />
      <Text s={`Wir rechnen solche Bilder in sechs Schritten aus. Dabei zeigt sich: Für Schatten und senkrechte Projektionen genügen
        neun Zahlen in einer Tabelle – einer Matrix. Ihre Spalten sind die Bilder von nur drei Vektoren. Übrigens: Jedes räumliche Bild
        auf dieser Seite ist selbst mit einer solchen Matrix gezeichnet.`} style={FLIESS} />

      <ProjektionAnimation art="schatten" offen />

      <Schritt nr="1" titel="Ein Schatten als Rechenvorschrift" />
      <Text s={`Das Haus steht auf dem Boden, der $x_1x_2$-Ebene. Die Sonne ist so weit weg, dass alle Lichtstrahlen parallel sind; sie
        fallen in Richtung $\\vec{v} = \\spalte{1}{2}{−2}$. Der Strahl durch die Hausecke $F(2 \\mid 2 \\mid 2)$ ist die Gerade`} style={FLIESS} />
      <Formeln zeilen={["\\vec{x} = \\spalte{2}{2}{2} + t \\cdot \\spalte{1}{2}{−2}"]} max={17} />
      <Text s={`Der Schatten liegt dort, wo diese Gerade den Boden trifft – also dort, wo $x_3 = 0$ ist:`} style={FLIESS} />
      <Formeln zeilen={[
        "2 − 2t = 0 \\;\\Rightarrow\\; t = 1",
        "F′ = \\spalte{2}{2}{2} + \\spalte{1}{2}{−2} = \\spalte{3}{4}{0}",
      ]} max={17} />
      <Text s={`Dieselbe Rechnung funktioniert für jeden Punkt $P(p_1 \\mid p_2 \\mid p_3)$. Aus $p_3 − 2t = 0$ folgt $t = \\frac{p_3}{2}$ und damit`} style={FLIESS} />
      <Formeln zeilen={[
        "P′ = \\spalte{p_1}{p_2}{p_3} + \\frac{p_3}{2} \\cdot \\spalte{1}{2}{−2}",
        "= \\spalte{p_1 + \\frac{1}{2}p_3}{p_2 + p_3}{0}",
      ]} max={17} />
      <Kasten titel="Schattenwurf als Abbildung">
        <Text s={`Jedem Punkt $P$ wird sein Schattenpunkt $P′(p_1 + \\frac{1}{2}p_3 \\mid p_2 + p_3 \\mid 0)$ zugeordnet. Punkte auf dem
          Boden, also mit $p_3 = 0$, bleiben, wo sie sind.`} style={ERGEBNIS} />
      </Kasten>

      <Schritt nr="2" titel="Linear: Drei Bilder genügen" />
      <Text s={`Sieh dir die Rechenvorschrift genau an: Jede Koordinate von $P′$ ist eine Summe von Vielfachen von $p_1$, $p_2$ und
        $p_3$ – ohne Quadrate, ohne Produkte, ohne festen Summanden. Eine solche Abbildung $\\varphi$ heißt linear. Für sie gilt`} style={FLIESS} />
      <Formeln zeilen={["\\varphi(r \\cdot \\vec{x} + s \\cdot \\vec{y}) = r \\cdot \\varphi(\\vec{x}) + s \\cdot \\varphi(\\vec{y})"]} max={16} />
      <Text s={`Das hat eine starke Folge. Jeder Ortsvektor setzt sich aus den drei Einheitsvektoren zusammen, und eine lineare
        Abbildung nimmt diese Zerlegung einfach mit:`} style={FLIESS} />
      <Formeln zeilen={[
        "\\vec{p} = p_1 \\cdot \\vec{e}_1 + p_2 \\cdot \\vec{e}_2 + p_3 \\cdot \\vec{e}_3",
        "\\varphi(\\vec{p}) = p_1 \\cdot \\varphi(\\vec{e}_1) + p_2 \\cdot \\varphi(\\vec{e}_2) + p_3 \\cdot \\varphi(\\vec{e}_3)",
      ]} max={16} />
      <Text s={`Wer die drei Bilder $\\varphi(\\vec{e}_1)$, $\\varphi(\\vec{e}_2)$ und $\\varphi(\\vec{e}_3)$ kennt, kennt also die ganze
        Abbildung. Beim Schatten sind das:`} style={FLIESS} />
      <Formeln zeilen={["\\vec{e}_1 \\mapsto \\spalte{1}{0}{0}, \\quad \\vec{e}_2 \\mapsto \\spalte{0}{1}{0}, \\quad \\vec{e}_3 \\mapsto \\spalte{\\frac{1}{2}}{1}{0}"]} max={16} />
      <Text s={`Die ersten beiden liegen schon auf dem Boden und bleiben. Nur das Bild von $\\vec{e}_3$ hängt davon ab, wie das Licht fällt.`} style={FLIESS} />

      <Schritt nr="3" titel="Die Matrix: Ihre Spalten sind die Bilder" />
      <Text s={`Schreibt man die drei Bilder als Spalten nebeneinander, entsteht eine Matrix – eine Tabelle aus drei Zeilen und drei Spalten:`} style={FLIESS} />
      <MitteBox>
        <MatrixBild A={SCHATTEN_A} name="A" gross={18} ganz={false} />
        <SpaltenLegende />
      </MitteBox>
      <Text s={`Matrix mal Vektor heißt: die Spalten mit den Komponenten des Vektors gewichten und addieren. Für die Hausecke $F$:`} style={FLIESS} />
      <Formeln zeilen={[
        "A \\cdot \\spalte{2}{2}{2} = 2 \\cdot \\spalte{1}{0}{0} + 2 \\cdot \\spalte{0}{1}{0} + 2 \\cdot \\spalte{\\frac{1}{2}}{1}{0}",
        "= \\spalte{2}{0}{0} + \\spalte{0}{2}{0} + \\spalte{1}{2}{0} = \\spalte{3}{4}{0}",
      ]} max={16} />
      <Text s={`Das ist genau $F′$ aus Schritt 1. Gleichwertig rechnest du zeilenweise: Die erste Komponente ist die erste Zeile mal den
        Vektor, wie beim Skalarprodukt – hier $2 + 0 + \\frac{1}{2} \\cdot 2 = 3$.`} style={FLIESS} />
      <Kasten titel="Matrix einer linearen Abbildung">
        <Text s={`Spalte 1 ist das Bild von $\\vec{e}_1$, Spalte 2 das Bild von $\\vec{e}_2$, Spalte 3 das Bild von $\\vec{e}_3$. Das Bild
          eines Punktes ist die Matrix mal seinen Ortsvektor.`} style={ERGEBNIS} />
      </Kasten>
      <Text s={`Für jede Lichtrichtung $\\vec{v}$ mit $v_3 \\neq 0$ liefert dieselbe Rechnung $t = −\\frac{p_3}{v_3}$ und damit die Schattenmatrix`} style={FLIESS} />
      <MitteBox>
        <MatrixBild tex={[["1", "0", "−\\frac{v_1}{v_3}"], ["0", "1", "−\\frac{v_2}{v_3}"], ["0", "0", "0"]]} name="A" gross={17} />
      </MitteBox>
      <Text s={`Sie bildet die Lichtrichtung selbst auf den Nullvektor ab: $A \\cdot \\vec{v} = \\vec{0}$. Alle Punkte auf einem Lichtstrahl
        haben denselben Schatten. Aus dem Schatten allein lässt sich das Haus deshalb nicht zurückrechnen.`} style={FLIESS} />
      <ProjektionAnimation art="spalten" />

      <Schritt nr="4" titel="Senkrecht auf eine Ebene durch den Ursprung" />
      <Text s={`Statt schräger Sonnenstrahlen nehmen wir jetzt Strahlen, die senkrecht auf eine Ebene treffen. Die Ebene $E$ gehe durch
        den Ursprung und habe den Normalenvektor $\\vec{n}$, also $E: \\vec{n} \\cdot \\vec{x} = 0$. Die Lotgerade durch $P$ hat die
        Richtung $\\vec{n}$. Eingesetzt in die Ebenengleichung:`} style={FLIESS} />
      <Formeln zeilen={[
        "\\vec{x} = \\vec{p} + t \\cdot \\vec{n}",
        "\\vec{n} \\cdot \\vec{p} + t \\cdot \\vec{n} \\cdot \\vec{n} = 0 \\;\\Rightarrow\\; t = −\\frac{\\vec{p} \\cdot \\vec{n}}{\\vec{n} \\cdot \\vec{n}}",
      ]} max={16} />
      <Kasten titel="Orthogonale Projektion auf E">
        <Formeln zeilen={["P′ = P − \\lambda \\cdot \\vec{n}, \\quad \\lambda = \\frac{\\vec{p} \\cdot \\vec{n}}{\\vec{n} \\cdot \\vec{n}}"]} max={17} />
        <Text s={`Probe: $\\vec{p′} \\cdot \\vec{n} = \\vec{p} \\cdot \\vec{n} − \\lambda \\cdot \\vec{n} \\cdot \\vec{n} = 0$ – der Bildpunkt liegt in der Ebene.`} style={ERGEBNIS} />
      </Kasten>
      <Text s={`Ein Beispiel: $E: −x_1 + 2x_2 + 2x_3 = 0$, also $\\vec{n} = \\spalte{−1}{2}{2}$, und der Punkt $Q(1 \\mid 2 \\mid 3)$:`} style={FLIESS} />
      <Formeln zeilen={[
        "\\vec{q} \\cdot \\vec{n} = −1 + 4 + 6 = 9, \\quad \\vec{n} \\cdot \\vec{n} = 1 + 4 + 4 = 9",
        "\\lambda = \\frac{9}{9} = 1",
        "Q′ = \\spalte{1}{2}{3} − \\spalte{−1}{2}{2} = \\spalte{2}{0}{1}",
        "\\text{Probe: } −2 + 0 + 2 = 0",
      ]} max={16} />
      <Text s={`Auch diese Abbildung ist linear, denn $\\lambda$ hängt linear von $\\vec{p}$ ab. Ihre Spalten bekommst du, indem du
        $\\vec{e}_1$, $\\vec{e}_2$ und $\\vec{e}_3$ projizierst – zum Beispiel ist $\\vec{e}_1 \\cdot \\vec{n} = −1$, also
        $\\vec{e}_1 \\mapsto \\vec{e}_1 + \\frac{1}{9} \\cdot \\vec{n} = \\spalte{\\frac{8}{9}}{\\frac{2}{9}}{\\frac{2}{9}}$. Zusammen:`} style={FLIESS} />
      <MitteBox>
        <MatrixBild A={ORTHO_A} name="A" gross={17} />
        <SpaltenLegende />
      </MitteBox>
      <Text s={`Probe mit der Matrix, erste Zeile mal $\\vec{q}$: $\\frac{1}{9} \\cdot (8 \\cdot 1 + 2 \\cdot 2 + 2 \\cdot 3) = \\frac{18}{9} = 2$ –
        die erste Koordinate von $Q′$ stimmt.`} style={FLIESS} />
      <ProjektionAnimation art="lot" />

      <Schritt nr="5" titel="Zweimal projizieren ändert nichts" />
      <Text s={`Führt man zwei lineare Abbildungen nacheinander aus – erst $B$, dann $A$ –, entsteht wieder eine lineare Abbildung. Ihre
        Matrix bekommst du wie immer aus den Bildern der Einheitsvektoren: Die $j$-te Spalte ist $A$ mal die $j$-te Spalte von $B$.
        Diese Matrix heißt Produkt $A \\cdot B$:`} style={FLIESS} />
      <Formeln zeilen={["A \\cdot (B \\cdot \\vec{x}) = (A \\cdot B) \\cdot \\vec{x}"]} max={17} />
      <Text s={`Was passiert, wenn man ein Bild noch einmal projiziert? Ein Schattenpunkt liegt schon am Boden, dort ist $t = 0$ – er bleibt,
        wo er ist. Beim Lot ist $\\vec{p′} \\cdot \\vec{n} = 0$, also $\\lambda = 0$. Zweimal projizieren wirkt wie einmal:`} style={FLIESS} />
      <Kasten titel="Kennzeichen jeder Projektion">
        <Formeln zeilen={["A \\cdot A = A"]} max={18} />
        <Text s={`Bei der Schattenmatrix sieht man es direkt: Die ersten beiden Spalten bleiben ohnehin, und die dritte Spalte
          $\\spalte{\\frac{1}{2}}{1}{0}$ liegt am Boden, also gilt $A \\cdot \\spalte{\\frac{1}{2}}{1}{0} = \\spalte{\\frac{1}{2}}{1}{0}$.`} style={ERGEBNIS} />
      </Kasten>
      <Text s={`Eine Drehung um 90° hat diese Eigenschaft nicht – zweimal gedreht ist um 180° gedreht. Und die Reihenfolge zählt:
        $A \\cdot B$ und $B \\cdot A$ sind meistens verschieden. Erst den Schatten werfen und dann senkrecht projizieren liefert ein
        anderes Bild als umgekehrt.`} style={FLIESS} />

      <Schritt nr="6" titel="Das Schrägbild im Heft – und der Bildschirm" />
      <Text s={`Auch das Schrägbild, mit dem du im Heft Körper zeichnest, ist eine lineare Abbildung – nur landet das Bild auf dem Blatt,
        also in zwei Dimensionen. Die $x_2$-Achse zeigt nach rechts, die $x_3$-Achse nach oben, die $x_1$-Achse unter 45° nach links
        unten. Eine Einheit ist auf ihr eine Kästchendiagonale; bei 1 cm pro Einheit ist das nur $\\frac{1}{2}\\sqrt{2}$ cm. Damit
        zeigt das Bild von $\\vec{e}_1$ je einen halben Zentimeter nach links und nach unten:`} style={FLIESS} />
      <Formeln zeilen={["\\vec{e}_1 \\mapsto \\binom{−\\frac{1}{2}}{−\\frac{1}{2}}, \\quad \\vec{e}_2 \\mapsto \\binom{1}{0}, \\quad \\vec{e}_3 \\mapsto \\binom{0}{1}"]} max={17} />
      <MitteBox>
        <MatrixBild A={SCHRAEG} name="S" gross={17} ganz={false} />
      </MitteBox>
      <Text s={`Die Matrix hat zwei Zeilen und drei Spalten: Aus drei Koordinaten werden zwei. Die Hausecke $F(2 \\mid 2 \\mid 2)$ landet
        zum Beispiel bei $2 \\cdot \\binom{−\\frac{1}{2}}{−\\frac{1}{2}} + 2 \\cdot \\binom{1}{0} + 2 \\cdot \\binom{0}{1} = \\binom{1}{1}$.`} style={FLIESS} />
      <Text s={`Das Schrägbild ist sogar ein echter Schatten: Fällt Licht in Richtung $\\spalte{−2}{−1}{−1}$ auf die Rückwand, die
        $x_2x_3$-Ebene, ergibt sich genau diese Rechnung. Wählt man auf der $x_1$-Achse die Verkürzung $\\frac{1}{2}$ statt der
        Kästchendiagonale, ändert sich nur die erste Spalte: Sie wird zu $\\binom{−\\frac{1}{4}\\sqrt{2}}{−\\frac{1}{4}\\sqrt{2}}$.`} style={FLIESS} />
      <ProjektionAnimation art="schraeg" />
      <Kasten titel="Grenze: Bildschirme rechnen anders">
        <Text s={`Ein Foto oder ein Computerspiel zeigt die Welt perspektivisch: Was doppelt so weit weg ist, erscheint halb so groß.
          Mit dem Auge im Ursprung und dem Bildschirm in der Ebene $x_1 = 1$ wird $P$ zum Bildpunkt $(\\frac{p_2}{p_1} \\mid \\frac{p_3}{p_1})$ –
          man teilt durch die Tiefe $p_1$. Verdoppelt man $\\vec{p}$, bleibt der Bildpunkt gleich. Das ist nicht linear und damit
          keine Matrix mal Vektor. Grafikkarten rechnen trotzdem viel mit Matrizen, mit einer vierten Koordinate; das Teilen durch
          die Tiefe kommt aber als eigener Schritt am Ende.`} style={{ fontSize: 14.5, color: C.tinte, fontWeight: 400, lineHeight: 1.85, margin: "8px 0 10px" }} />
      </Kasten>
      <Kasten titel="Zum Mitnehmen">
        <Text s={`Schatten, Lote und Schrägbilder sind lineare Abbildungen. Ihre Matrix besteht aus den Bildern von $\\vec{e}_1$,
          $\\vec{e}_2$ und $\\vec{e}_3$ als Spalten, und Matrix mal Vektor gewichtet diese Spalten. Projektionen erkennt man an $A \\cdot A = A$.`} style={ERGEBNIS} />
      </Kasten>

      <div style={{ ...KARTE, margin: "22px 0" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 12 }}>Labor: Licht und Ebene einstellen – die Matrix rechnet mit</p>
        <ProjektionLabor />
      </div>

      <Trenner />

      <Kicker>Jetzt selbst üben</Kicker>
      <H3>Matrix mal Vektor, Matrix aufstellen, Schatten, Lot</H3>
      <ProjektionTrainer />

      {gehe && (
        <div style={{ ...KARTE, marginTop: 22, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: C.tinte, marginBottom: 4 }}>Abstände mit dem Lot</p>
            <p style={{ fontSize: 13.5, color: C.grau, fontWeight: 300, lineHeight: 1.6 }}>Wie weit ist P von der Ebene entfernt? Das Lot aus Schritt 4 führt direkt zur Hesse-Normalenform.</p>
          </div>
          <button type="button" onClick={() => gehe({ ansicht: "hesse" })} className="px-5 py-3" style={KNOPF(true)}>Zur Hesse-Normalenform</button>
        </div>
      )}

      <Trenner />

      <Kicker>Deine GFS</Kicker>
      <H3>Der rote Faden für den Vortrag</H3>
      <RoterFaden gliederung={GLIEDERUNG} tipps={TIPPS} hinweis="den Abschnitt „Die Matrix“" />

      <div style={{ height: 8 }} />
      <Kicker>Kolloquium</Kicker>
      <H3>Die Fragen nach dem Vortrag trainieren</H3>
      <Kolloquium fragen={KOLLOQUIUM} speicher="mm-gfs-projektion-kolloquium" />
    </div>
  );
}
