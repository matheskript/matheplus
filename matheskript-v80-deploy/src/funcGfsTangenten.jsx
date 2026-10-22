import React, { useRef, useState } from "react";
import { C } from "./base1.jsx";
import { M, Text } from "./func3.jsx";
import { MatheFeld } from "./matheTastatur.jsx";
import { FLIESS, KARTE, ZELLE, Formeln, Schritt, Kasten, Chip, PlusMinus, Kicker, H3, Trenner, RoterFaden, Kolloquium } from "./funcGfsBausteine.jsx";
import { lauf } from "./funcErklaeranimation.jsx";
import { AnimKarte } from "./funcAnimKarte.jsx";
import {
  dk, KURVEN, HUEGEL, huegelTangente, sichtHindernis, parabelStellen, kubikStellen, anzahlParabel, anzahlKubisch,
  anzahlTangenten, beruehrstellen, tangenteIn, geradeText, laborKoeffizienten, polyDez,
  ARTEN, aufgabe, auftrag, pruefe, rechenweg, tipp, GLIEDERUNG, TIPPS, KOLLOQUIUM,
} from "./gfsTangenten.js";

/* ============================================================
   Kurs GFS – Themenseite „Tangentenprobleme“
   (Kursstufe 1, Kap. I Grundlagen der Differenzialrechnung)
   Aufbau wie das Ziegenproblem: Leitfrage · Herleitung in sechs Schritten
   (Tangente und Normale, Tangente von außen, Normalparabel 2/1/0,
   kubische Funktion bis zu drei, gemeinsame Tangente, Hügel) · fünf
   Erkläranimationen · Labor (Punkt P verschieben, Gebiete, alle Tangenten
   live) · Übungen aus vier Generatoren · roter Faden · Kolloquium.
   Logik in gfsTangenten.js (getestet in tests/gfsTangenten.test.mjs).
   Alle Bilder sind exakt gerechnet: Tangenten berühren, wo sie sollen.
   ============================================================ */

const KNOPF = (aktiv = true, farbe = C.see) => ({
  background: aktiv ? farbe : C.hellgrau, color: C.weiss, border: "none", borderRadius: 999, fontSize: 15, fontWeight: 600,
  fontFamily: "inherit", cursor: aktiv ? "pointer" : "default",
});
const LINK = { background: "none", border: "none", color: C.see, fontSize: 13, fontFamily: "inherit", cursor: "pointer", padding: 0, textDecoration: "underline" };
/* aktuelle Aufgabe für automatische Prüfungen (tests/ui/gfstangenten.ui.py) */
const merk = (a) => { if (typeof window !== "undefined") window.__gtanAufgabe = a; return a; };

const T = (props) => <text fontFamily="inherit" {...props} />;
/* Beschriftung mit hellem Rand, damit sie über Linien lesbar bleibt */
const TR = ({ grund = C.sand, ...props }) => <T stroke={grund} strokeWidth="3.2" strokeLinejoin="round" paintOrder="stroke" {...props} />;
const mix = (a, b, p) => a + (b - a) * p;
const fenster = (t, a, b, c, d) => lauf(t, a, b) * (1 - lauf(t, c, d));
const TFARBEN = [C.gold, C.see, C.smaragd];
const tangentenWort = (n) => (n === 1 ? "Tangente" : "Tangenten");

/* ======================================================================
   Koordinaten: Abbildung eines Rechtecks der Ebene auf Bildpunkte
   ====================================================================== */
function abb({ x: [x0, x1], y: [y0, y1], L = 20, R = 340, O = 12, U = 280 }) {
  const sx = (R - L) / (x1 - x0), sy = (U - O) / (y1 - y0);
  return { x0, x1, y0, y1, L, R, O, U, sx, sy, X: (x) => L + (x - x0) * sx, Y: (y) => U - (y - y0) * sy,
    xAus: (px) => x0 + (px - L) / sx, yAus: (py) => y0 + (U - py) / sy };
}
/* Graph als Pfad; Werte weit außerhalb werden begrenzt (der Ausschnitt schneidet sie ohnehin ab) */
function pfad(f, A, von = A.x0, bis = A.x1, n = 180) {
  const lo = A.y0 - 40, hi = A.y1 + 40;
  let d = "";
  for (let i = 0; i <= n; i++) {
    const x = von + ((bis - von) * i) / n;
    d += `${i ? "L" : "M"}${A.X(x).toFixed(1)} ${A.Y(Math.max(lo, Math.min(hi, f(x)))).toFixed(1)}`;
  }
  return d;
}
function Ausschnitt({ id, A, children }) {
  return (
    <>
      <defs><clipPath id={id}><rect x={A.L} y={A.O} width={A.R - A.L} height={A.U - A.O} /></clipPath></defs>
      <g clipPath={`url(#${id})`}>{children}</g>
    </>
  );
}
const Gerade = ({ A, m, c, farbe = C.gold, breite = 2, o = 1, strich }) => (o <= 0.001 ? null : (
  <line x1={A.X(A.x0)} y1={A.Y(m * A.x0 + c)} x2={A.X(A.x1)} y2={A.Y(m * A.x1 + c)} stroke={farbe} strokeWidth={breite} opacity={o} strokeDasharray={strich} strokeLinecap="round" />
));
function Achsen({ A, o = 1, zx = [], zy = [] }) {
  if (o <= 0.001) return null;
  const ya = A.Y(0), xa = A.X(0);
  const xs = [], ys = [];
  for (let k = Math.ceil(A.x0); k <= Math.floor(A.x1); k++) if (k) xs.push(k);
  for (let k = Math.ceil(A.y0); k <= Math.floor(A.y1); k++) if (k) ys.push(k);
  const zahl = (k) => (k < 0 ? `−${-k}` : String(k));
  return (
    <g opacity={o}>
      <line x1={A.L} y1={ya} x2={A.R} y2={ya} stroke={C.ablGrau} strokeWidth="1" />
      <path d={`M${A.R - 6} ${ya - 3.5} L${A.R} ${ya} L${A.R - 6} ${ya + 3.5}`} fill="none" stroke={C.ablGrau} strokeWidth="1" />
      <line x1={xa} y1={A.U} x2={xa} y2={A.O} stroke={C.ablGrau} strokeWidth="1" />
      <path d={`M${xa - 3.5} ${A.O + 6} L${xa} ${A.O} L${xa + 3.5} ${A.O + 6}`} fill="none" stroke={C.ablGrau} strokeWidth="1" />
      {xs.map((k) => <line key={`x${k}`} x1={A.X(k)} y1={ya - 2.5} x2={A.X(k)} y2={ya + 2.5} stroke={C.ablGrau} strokeWidth="1" />)}
      {ys.map((k) => <line key={`y${k}`} x1={xa - 2.5} y1={A.Y(k)} x2={xa + 2.5} y2={A.Y(k)} stroke={C.ablGrau} strokeWidth="1" />)}
      {zx.map((k) => <T key={`zx${k}`} x={A.X(k)} y={ya + 13} textAnchor="middle" fontSize="9.5" fill={C.hellgrau}>{zahl(k)}</T>)}
      {zy.map((k) => <T key={`zy${k}`} x={xa - 5} y={A.Y(k) + 3.3} textAnchor="end" fontSize="9.5" fill={C.hellgrau}>{zahl(k)}</T>)}
      <T x={A.R - 3} y={ya - 6} textAnchor="end" fontSize="11" fontStyle="italic" fill={C.grau}>x</T>
      <T x={xa + 6} y={A.O + 9} fontSize="11" fontStyle="italic" fill={C.grau}>y</T>
    </g>
  );
}
function Punkt({ x, y, r = 4.5, farbe = C.signal, o = 1, ring = 0 }) {
  if (o <= 0.001) return null;
  return (
    <g opacity={o}>
      {ring > 0.001 && <circle cx={x} cy={y} r={r + 11 * ring} fill={C.flaggold} opacity={0.35 * ring} />}
      <circle cx={x} cy={y} r={r} fill={farbe} stroke={C.weiss} strokeWidth="1.5" />
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
/* Formelzeile unter dem Bild */
const Zeile = ({ y, text, o = 1, farbe = C.tinte, gross = 13.5 }) => (o <= 0.001 ? null : (
  <T x="180" y={y} textAnchor="middle" fontSize={gross} fontWeight="700" fill={farbe} opacity={o}>{text}</T>
));

/* ======================================================================
   Kopfbild (viewBox 160 × 120): Normalparabel, P(0 | −1) darunter und die
   beiden Tangenten y = ±2x − 1, die in (±1 | 1) berühren – exakt gerechnet.
   ====================================================================== */
export function TangentenBild() {
  const X = (x) => 80 + 30 * x, Y = (y) => 90 - 18 * y;
  const parabel = (() => { let d = ""; for (let i = 0; i <= 80; i++) { const x = -2.1 + (4.2 * i) / 80; d += `${i ? "L" : "M"}${X(x).toFixed(2)} ${Y(x * x).toFixed(2)}`; } return d; })();
  const linie = (s) => `M${X(-1.95 * s)} ${Y(2 * 1.95 - 1)} L${X(0)} ${Y(-1)}`;   // y = −2sx − 1 bis x = ∓1,95
  return (
    <svg className="gtk-bild" viewBox="0 0 160 120" role="img" style={{ width: "100%", maxWidth: 300, margin: "10px auto 0", justifySelf: "center" }}
      aria-label="Normalparabel mit einem Punkt P darunter: genau zwei Tangenten gehen durch P und berühren die Parabel">
      <defs>
        <linearGradient id="gtan-k-silber" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor={C.silberDunkel} /><stop offset="50%" stopColor={C.weiss} /><stop offset="100%" stopColor={C.silberDunkel} /></linearGradient>
        <linearGradient id="gtan-k-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={C.weiss} /><stop offset="35%" stopColor={C.flaggold} /><stop offset="100%" stopColor={C.goldWarm} /></linearGradient>
        <radialGradient id="gtan-k-glut" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor={C.flaggold} stopOpacity="0.75" /><stop offset="100%" stopColor={C.flaggold} stopOpacity="0" /></radialGradient>
      </defs>
      <ellipse className="gtk-glimmen" cx={X(0)} cy={Y(-1)} rx="22" ry="16" fill="url(#gtan-k-glut)" />
      <g className="gtk-auf">
        <path d={parabel} fill="none" stroke="url(#gtan-k-silber)" strokeWidth="2.2" strokeLinecap="round" />
      </g>
      <g className="gtk-auf" style={{ animationDelay: ".25s" }}>
        <path d={linie(1)} fill="none" stroke="url(#gtan-k-gold)" strokeWidth="1.6" strokeLinecap="round" />
        <path d={linie(-1)} fill="none" stroke="url(#gtan-k-gold)" strokeWidth="1.6" strokeLinecap="round" />
      </g>
      <g className="gtk-auf" style={{ animationDelay: ".5s" }}>
        {[-1, 1].map((x) => (
          <g key={x}>
            <circle cx={X(x)} cy={Y(1)} r="6.5" fill="url(#gtan-k-glut)" />
            <circle cx={X(x)} cy={Y(1)} r="2.6" fill={C.flaggold} stroke={C.weiss} strokeWidth="0.8" />
          </g>
        ))}
      </g>
      <g className="gtk-auf" style={{ animationDelay: ".1s" }}>
        <circle cx={X(0)} cy={Y(-1)} r="3.4" fill={C.weiss} stroke={C.flaggold} strokeWidth="1.4" />
        <T x={X(0) + 8} y={Y(-1) + 4} fontFamily="Montserrat, sans-serif" fontSize="11" fontWeight="800" fill={C.flaggold}>P</T>
      </g>
    </svg>
  );
}

/* ======================================================================
   Erkläranimationen (Szenen sind reine Funktionen der Zeit; Schlussbild = Standbild)
     aussen    – Lineal durch P, wandernde Berührstelle u, zwei Lösungen
     beruehren – Sekante wird Tangente, Normale senkrecht dazu
     anzahl    – P wandert nach oben: 2 → 1 → 0 Tangenten, D = a² − b
     kubisch   – x³ − 3x: drei Tangenten, Gebiet zwischen Kurve und Wendetangente
     huegel    – Drohne über dem Hügel: Sichtgrenze ist die Tangente von B
   ====================================================================== */

/* 1 · Tangenten von außen: P(1 | −3) an f(x) = x² */
const A_AUSSEN = abb({ x: [-3, 4.5], y: [-5, 10], O: 12, U: 276 });
const AUS_DAUER = 26;
const ausSchritte = () => [
  { von: 0, text: "P(1 | −3) liegt unterhalb der Parabel. Ein Lineal durch P berührt sie in genau zwei Lagen." },
  { von: 6.6, text: "Die Berührstelle u wandert. Die Tangente in u trifft die Linie x = 1 in der Höhe 2u − u²." },
  { von: 16, text: "Durch P geht sie nur für 2u − u² = −3, also u² − 2u − 3 = 0: u = −1 oder u = 3." },
  { von: 21, text: "Die beiden Tangenten: t₁(x) = −2x − 1 berührt in B₁(−1 | 1), t₂(x) = 6x − 9 in B₂(3 | 9)." },
];
function ausZeichne(t) {
  const A = A_AUSSEN, f = (x) => x * x;
  const ein = lauf(t, 0, 1.2), pe = lauf(t, 0.8, 1.6);
  const lin = fenster(t, 1.6, 2.2, 6, 6.6);
  const s = Math.tan(mix(-1.45, 1.47, lauf(t, 1.8, 5.8)));
  const glanz = Math.max(Math.max(0, 1 - Math.abs(s + 2) / 0.5), Math.max(0, 1 - Math.abs(s - 6) / 1.6));
  const wan = fenster(t, 6.8, 7.4, 15.6, 16.2);
  const u = mix(-2.4, 4, lauf(t, 7.2, 15.4));
  const h = 2 * u - u * u;
  const treffer = Math.max(0, 1 - Math.abs(h + 3) / 0.7);
  const fertig = lauf(t, 16.2, 17.4), namen = lauf(t, 21.2, 22.4);
  const P = [A.X(1), A.Y(-3)];
  return (
    <g>
      <Achsen A={A} o={ein} zx={[-2, 2, 4]} zy={[5]} />
      <Ausschnitt id="gtan-a-aussen" A={A}>
        <path d={pfad(f, A)} fill="none" stroke={C.tinte} strokeWidth="2.2" opacity={ein} />
        {lin > 0.001 && <Gerade A={A} m={s} c={-3 - s} farbe={glanz > 0.5 ? C.gold : C.hellgrau} breite={glanz > 0.5 ? 2.4 : 1.8} o={lin} />}
        {wan > 0.001 && (
          <g opacity={wan}>
            <line x1={A.X(1)} y1={A.O} x2={A.X(1)} y2={A.U} stroke={C.hellgrau} strokeWidth="1" strokeDasharray="4 4" />
            <Gerade A={A} m={2 * u} c={-u * u} farbe={treffer > 0.6 ? C.gold : C.see} breite={2} />
            <Punkt x={A.X(u)} y={A.Y(f(u))} farbe={C.see} r={4} />
            <Punkt x={A.X(1)} y={A.Y(h)} farbe={C.see} r={3.4} />
          </g>
        )}
        {fertig > 0.001 && (
          <g opacity={fertig}>
            <Gerade A={A} m={-2} c={-1} />
            <Gerade A={A} m={6} c={-9} />
            <Punkt x={A.X(-1)} y={A.Y(1)} farbe={C.flaggold} />
            <Punkt x={A.X(3)} y={A.Y(9)} farbe={C.flaggold} />
          </g>
        )}
      </Ausschnitt>
      <Punkt x={P[0]} y={P[1]} r={5} o={pe} ring={Math.max(wan * treffer, lin * glanz)} />
      <TR x={P[0] + 10} y={P[1] + 4} fontSize="12.5" fontWeight="800" fill={C.signal} opacity={pe}>P(1 | −3)</TR>
      {wan > 0.001 && (
        <g opacity={wan}>
          <TR x={A.X(u) + (u > 2.5 ? -8 : 8)} y={Math.max(A.O + 12, A.Y(f(u)) + 4)} textAnchor={u > 2.5 ? "end" : "start"} fontSize="11.5" fontWeight="800" fill={C.see}>u = {dk(u, 1)}</TR>
          <TR x={A.X(1) - 8} y={A.Y(h) + 4} textAnchor="end" fontSize="11.5" fontWeight="700" fill={treffer > 0.6 ? C.gold : C.see}>Höhe {dk(h, 1)}</TR>
        </g>
      )}
      {fertig > 0.001 && (
        <g opacity={fertig}>
          <TR x={A.X(-1) - 10} y={A.Y(1) + 5} textAnchor="end" fontSize="11.5" fontWeight="800" fill={C.gold}>B₁(−1 | 1)</TR>
          <TR x={A.X(3) - 9} y={A.Y(9) + 4} textAnchor="end" fontSize="11.5" fontWeight="800" fill={C.gold}>B₂(3 | 9)</TR>
        </g>
      )}
      <Zeile y={302} o={wan} text={`u = ${dk(u, 1)}:  Tangente bei x = 1 in der Höhe ${dk(h, 1)}`} gross={12.5} farbe={C.see} />
      <Zeile y={302} o={fenster(t, 16.4, 17.4, 21, 21.6)} text="−3 = 2u − u²   ⇒   u = −1 oder u = 3" />
      <Zeile y={302} o={namen} text="t₁(x) = −2x − 1   ·   t₂(x) = 6x − 9" farbe={C.gold} />
    </g>
  );
}

/* 2 · Tangente und Normale in B(1 | 1) – gleiche Einheit auf beiden Achsen, damit der rechte Winkel stimmt */
const A_BER = abb({ x: [-2.2, 3.4], y: [-1.24, 3.45], O: 12, U: 280 });
const BER_DAUER = 24;
const berSchritte = () => [
  { von: 0, text: "Die Normalparabel f(x) = x² und der Punkt B(1 | 1) auf ihr." },
  { von: 4, text: "Sekanten durch B und einen zweiten Kurvenpunkt Q. Rückt Q an B heran, strebt die Steigung gegen f′(1) = 2." },
  { von: 10, text: "Die Gerade durch B mit der Steigung f′(1) ist die Tangente: t(x) = 2(x − 1) + 1 = 2x − 1." },
  { von: 15, text: "Die Normale steht in B senkrecht auf der Tangente. Ihre Steigung ist −1 : f′(1) = −0,5." },
  { von: 20, text: "Also n(x) = −0,5(x − 1) + 1 = −0,5x + 1,5." },
];
function berZeichne(t) {
  const A = A_BER, f = (x) => x * x;
  const ein = lauf(t, 0, 1.2), be = lauf(t, 1, 2);
  const sek = fenster(t, 4.2, 4.8, 10.2, 10.8);
  const xq = mix(2, 1, lauf(t, 4.8, 9.4));
  const sQ = xq + 1;
  const tang = lauf(t, 10.2, 11.2);
  const dreh = lauf(t, 15.2, 16.8), winkel = lauf(t, 16.8, 17.6);
  const bx = A.X(1), by = A.Y(1);
  /* Richtungen in Bildpunkten (y nach unten): Tangente (1 | 2), Normale (−2 | 1), je auf Länge 1 */
  const w5 = Math.sqrt(5);
  const dt = [1 / w5, -2 / w5], dn = [-2 / w5, -1 / w5];
  const phi = Math.atan2(2, 1) + (Math.PI / 2) * dreh;   // Richtung der Normale beim Eindrehen
  const L = 400;
  const q = 12;
  return (
    <g>
      <Achsen A={A} o={ein} zx={[-2, -1, 1, 2, 3]} zy={[1, 2, 3]} />
      <Ausschnitt id="gtan-a-ber" A={A}>
        <path d={pfad(f, A)} fill="none" stroke={C.tinte} strokeWidth="2.2" opacity={ein} />
        {sek > 0.001 && <Gerade A={A} m={sQ} c={1 - sQ} farbe={C.hellgrau} breite={1.8} o={sek} />}
        {sek > 0.001 && xq > 1.02 && <Punkt x={A.X(xq)} y={A.Y(f(xq))} farbe={C.hellgrau} r={4} o={sek} />}
        <Gerade A={A} m={2} c={-1} o={tang} breite={2.4} />
        {dreh > 0.001 && <line x1={bx - L * Math.cos(phi)} y1={by + L * Math.sin(phi)} x2={bx + L * Math.cos(phi)} y2={by - L * Math.sin(phi)} stroke={C.see} strokeWidth="2.2" opacity={dreh} />}
      </Ausschnitt>
      {winkel > 0.001 && (
        <path d={`M${bx + q * dt[0]} ${by + q * dt[1]} L${bx + q * (dt[0] + dn[0])} ${by + q * (dt[1] + dn[1])} L${bx + q * dn[0]} ${by + q * dn[1]}`}
          fill="none" stroke={C.see} strokeWidth="1.4" opacity={winkel} />
      )}
      <Punkt x={bx} y={by} farbe={C.flaggold} o={be} />
      <TR x={bx + 10} y={by + 16} fontSize="12.5" fontWeight="800" fill={C.gruenDunkel} opacity={be}>B(1 | 1)</TR>
      {sek > 0.001 && xq > 1.02 && (
        <TR x={A.X(xq) + 8} y={A.Y(f(xq)) + 4} fontSize="11.5" fontWeight="700" fill={C.grau} opacity={sek}>Q · Steigung {dk(sQ, 2)}</TR>
      )}
      <TR x={A.X(2.05)} y={A.Y(3.1)} fontSize="12" fontWeight="800" fill={C.gold} opacity={tang}>Tangente</TR>
      <TR x={A.X(2.05)} y={A.Y(0.85)} fontSize="12" fontWeight="800" fill={C.see} opacity={winkel}>Normale</TR>
      <Zeile y={304} o={lauf(t, 10.6, 11.6)} text="t(x) = 2(x − 1) + 1 = 2x − 1" farbe={C.gold} />
      <Zeile y={326} o={lauf(t, 20.2, 21.2)} text="n(x) = −0,5(x − 1) + 1 = −0,5x + 1,5" farbe={C.see} />
    </g>
  );
}

/* 3 · Wie viele? P(1 | b) wandert von unten durch die Parabel nach oben */
const A_ANZ = abb({ x: [-2.6, 4.6], y: [-4.6, 9.6], O: 12, U: 276 });
const ANZ_DAUER = 27;
const anzSchritte = () => [
  { von: 0, text: "P(1 | −3) liegt unterhalb der Parabel: zwei Tangenten. Für P(a | b) gilt u² − 2au + b = 0." },
  { von: 5.2, text: "P wandert nach oben. Die Diskriminante D = a² − b wird kleiner, die Berührpunkte rücken zusammen." },
  { von: 11.6, text: "Auf der Parabel ist D = 0: Beide Berührstellen fallen in P zusammen – nur eine Tangente." },
  { von: 17, text: "Oberhalb ist D < 0. Jede Tangente verläuft unterhalb der Parabel und damit unter P." },
  { von: 22.6, text: "Unterhalb zwei, auf der Parabel eine, oberhalb keine Tangente." },
];
function anzZeichne(t) {
  const A = A_ANZ, f = (x) => x * x;
  const ein = lauf(t, 0, 1.2), pe = lauf(t, 0.6, 1.4), tg = lauf(t, 1.4, 2.6);
  const b = -3 + 4 * lauf(t, 5.6, 11.2) + 2 * lauf(t, 17.4, 20.4);
  const n = anzahlParabel(1, b);
  const stellen = parabelStellen(1, b);
  const grau = lauf(t, 18.2, 19.6);
  const flaeche = lauf(t, 0.4, 1.6);
  const r = Math.sqrt(A.y1 + 1);
  const innen = `${pfad(f, A, -r, r, 120)} Z`;
  return (
    <g>
      <g opacity={flaeche}>
        <rect x={A.L} y={A.O} width={A.R - A.L} height={A.U - A.O} fill={C.flaggold} opacity="0.1" />
        <Ausschnitt id="gtan-a-anz-f" A={A}><path d={innen} fill={C.himmel} /></Ausschnitt>
      </g>
      <Achsen A={A} o={ein} zx={[-2, 2, 4]} zy={[-3, 3, 6, 9]} />
      <Ausschnitt id="gtan-a-anz" A={A}>
        <path d={pfad(f, A)} fill="none" stroke={C.tinte} strokeWidth="2.2" opacity={ein} />
        {grau > 0.001 && [-1, 0, 2, 3].map((u) => <Gerade key={u} A={A} m={2 * u} c={-u * u} farbe={C.hellgrau} breite={1.2} o={grau} />)}
        {stellen.map((u, i) => <Gerade key={i} A={A} m={2 * u} c={-u * u} o={tg} farbe={TFARBEN[i]} breite={2.2} />)}
        {stellen.map((u, i) => <Punkt key={`p${i}`} x={A.X(u)} y={A.Y(f(u))} farbe={TFARBEN[i]} r={4} o={tg} />)}
      </Ausschnitt>
      <Punkt x={A.X(1)} y={A.Y(b)} r={5} o={pe} ring={n === 1 ? lauf(t, 11.2, 12) * (1 - lauf(t, 17.4, 17.8)) : 0} />
      <TR x={A.X(1) + (b > 1.2 ? 0 : 10)} y={A.Y(b) + (b > 1.2 ? -10 : 4)} textAnchor={b > 1.2 ? "middle" : "start"} fontSize="12" fontWeight="800" fill={C.signal} opacity={pe}>P(1 | {dk(b, 1)})</TR>
      <TR x={A.L + 8} y={A.O + 20} fontSize="12.5" fontWeight="800" fill={n === 2 ? C.gold : n === 1 ? C.gruenDunkel : C.see} opacity={pe}>D = 1 − b = {dk(1 - b, 1)}</TR>
      <Pille x={A.R - 52} y={A.O + 22} text={`${n} ${tangentenWort(n)}`} farbe={n ? C.gold : C.see} voll o={pe} breite={98} gross={12} />
      <Zeile y={300} o={lauf(t, 22.8, 24)} text="unterhalb: 2   ·   auf: 1   ·   oberhalb: 0" />
    </g>
  );
}

/* 4 · Kubisch: f(x) = x³ − 3x, Wendetangente w(x) = −3x */
const A_KUB = abb({ x: [-3, 3.2], y: [-6.5, 5.5], O: 12, U: 276 });
const KUB_DAUER = 22;
const kubSchritte = () => [
  { von: 0, text: "f(x) = x³ − 3x mit dem Wendepunkt W(0 | 0) und der Wendetangente w(x) = −3x." },
  { von: 4, text: "Für P(1 | −2,5) wird die Bedingung kubisch: 2u³ − 3u² + 0,5 = 0. Drei Lösungen, drei Tangenten." },
  { von: 10.4, text: "Zwischen Kurve und Wendetangente gehen drei Tangenten durch P, außerhalb nur eine." },
  { von: 16, text: "Auf der Wendetangente fallen zwei Berührstellen im Wendepunkt zusammen: zwei Tangenten." },
];
function kubZeichne(t) {
  const A = A_KUB, K = KURVEN.kubisch;
  const ein = lauf(t, 0, 1.2), wende = lauf(t, 1.4, 2.6);
  const pe = lauf(t, 4.2, 5);
  const b = -2.5 + 4 * lauf(t, 11, 13.6) - 4.5 * lauf(t, 16.4, 19.4);
  const stellen = pe > 0.001 ? kubikStellen(K.p, 1, b) : [];
  const n = anzahlKubisch(K.p, 1, b);
  const gebiet = lauf(t, 10.4, 11.4);
  const zwischen = `${pfad(K.f, A, A.x0, A.x1, 160)} ${pfad(K.wende, A, A.x1, A.x0, 2).replace(/^M/, "L")} Z`;
  return (
    <g>
      {gebiet > 0.001 && (
        <g opacity={gebiet}>
          <rect x={A.L} y={A.O} width={A.R - A.L} height={A.U - A.O} fill={C.himmel} opacity="0.7" />
          <Ausschnitt id="gtan-a-kub-f" A={A}><path d={zwischen} fill={C.flaggold} opacity="0.18" /></Ausschnitt>
        </g>
      )}
      <Achsen A={A} o={ein} zx={[-2, -1, 1, 2]} zy={[-4, -2, 2, 4]} />
      <Ausschnitt id="gtan-a-kub" A={A}>
        <path d={pfad(K.f, A)} fill="none" stroke={C.tinte} strokeWidth="2.2" opacity={ein} />
        <Gerade A={A} m={-3} c={0} farbe={C.see} breite={1.6} strich="6 5" o={wende} />
        {stellen.map((u, i) => { const g = tangenteIn("kubisch", u); return <Gerade key={i} A={A} m={g.m} c={g.c} farbe={TFARBEN[i]} breite={2} o={lauf(t, 5 + i * 0.9, 5.8 + i * 0.9)} />; })}
        {stellen.map((u, i) => <Punkt key={`p${i}`} x={A.X(u)} y={A.Y(K.f(u))} farbe={TFARBEN[i]} r={4} o={lauf(t, 5 + i * 0.9, 5.8 + i * 0.9)} />)}
      </Ausschnitt>
      <Punkt x={A.X(0)} y={A.Y(0)} farbe={C.see} r={3.5} o={wende} />
      <TR x={A.X(0) - 7} y={A.Y(0) + 15} textAnchor="end" fontSize="11.5" fontWeight="800" fill={C.see} opacity={wende}>W</TR>
      <TR x={A.X(-1.75)} y={A.Y(4.6)} fontSize="11.5" fontWeight="800" fill={C.see} opacity={wende}>w(x) = −3x</TR>
      <Punkt x={A.X(1)} y={A.Y(b)} r={5} o={pe} ring={n === 2 ? lauf(t, 19.4, 20) : 0} />
      <TR x={A.X(1) + 10} y={A.Y(b) + 4} fontSize="12" fontWeight="800" fill={C.signal} opacity={pe}>P(1 | {dk(b, 1)})</TR>
      <Pille x={A.R - 52} y={A.O + 22} text={`${n} ${tangentenWort(n)}`} farbe={C.gold} voll o={pe} breite={98} gross={12} />
      <Zeile y={300} o={fenster(t, 4.6, 5.6, 10.4, 11)} text="2u³ − 3u² + 0,5 = 0   ⇒   drei Lösungen" />
      <Zeile y={300} o={fenster(t, 11, 11.8, 16, 16.6)} text="gold: drei Tangenten   ·   blau: eine" farbe={C.gruenDunkel} gross={12.5} />
      <Zeile y={300} o={lauf(t, 16.6, 17.6)} text="b = −3a:   u²(2u − 3a) = 0   ⇒   u = 0 doppelt" farbe={C.see} gross={12.5} />
    </g>
  );
}

/* 5 · Anwendung: Sicht über den Hügel f(x) = 4 − 0,25x² auf die Hütte B(5 | 0) */
const A_HUE = abb({ x: [-5.6, 6.2], y: [-0.9, 10.6], O: 12, U: 270 });
const HUE_DAUER = 23;
const hueSchritte = () => [
  { von: 0, text: "Ein Hügel f(x) = 4 − 0,25x² und dahinter eine Hütte bei B(5 | 0). Über x = −4 steigt eine Drohne auf." },
  { von: 4.6, text: "Solange die Sichtlinie den Hügel schneidet, ist die Hütte verdeckt." },
  { von: 13, text: "Die Grenze ist die Tangente von B an den Hügel. Sie berührt ihn im Punkt (2 | 3)." },
  { von: 18, text: "B einsetzen ergibt u² − 10u + 16 = 0, also u = 2 (u = 8 liegt nicht auf dem Hügel). t(−4) = 9: Ab dieser Höhe ist die Sicht frei." },
];
function Drohne({ x, y, o = 1 }) {
  if (o <= 0.001) return null;
  return (
    <g opacity={o}>
      <line x1={x - 13} y1={y - 3} x2={x + 13} y2={y - 3} stroke={C.seeTief} strokeWidth="1.6" />
      <ellipse cx={x - 13} cy={y - 5.5} rx="6.5" ry="1.6" fill={C.seeHell} />
      <ellipse cx={x + 13} cy={y - 5.5} rx="6.5" ry="1.6" fill={C.seeHell} />
      <rect x={x - 6} y={y - 4} width="12" height="7" rx="2.5" fill={C.seeTief} />
      <circle cx={x} cy={y + 0.5} r="1.6" fill={C.flaggold} />
    </g>
  );
}
function hueZeichne(t) {
  const A = A_HUE, H = HUEGEL;
  const ein = lauf(t, 0, 1.2), dro = lauf(t, 0.8, 1.8);
  const h = 2 + 7 * lauf(t, 4.8, 12.2) + 1.4 * lauf(t, 19, 21);
  const hindernis = sichtHindernis(h);
  const tangente = Math.abs(h - H.grenze) < 1e-9;
  /* Anzeige nie „9“, solange die Sicht verdeckt bzw. schon frei ist */
  const hz = tangente ? H.grenze : h < H.grenze ? Math.min(Math.floor(h * 10) / 10, H.grenze - 0.1) : Math.max(Math.ceil(h * 10) / 10, H.grenze + 0.1);
  const grenze = lauf(t, 13.2, 14.4);
  const [bx, by] = [A.X(H.B[0]), A.Y(H.B[1])];
  const dx = A.X(H.drohneX), dy = A.Y(h);
  const huegel = `${pfad(H.f, A, -H.rand, H.rand, 80)} L${A.X(H.rand)} ${A.Y(0)} L${A.X(-H.rand)} ${A.Y(0)} Z`;
  const sicht = lauf(t, 4.6, 5.4);
  return (
    <g>
      <line x1={A.L} y1={A.Y(0)} x2={A.R} y2={A.Y(0)} stroke={C.ablGrau} strokeWidth="1.2" opacity={ein} />
      <path d={huegel} fill={C.smNebel} stroke={C.smaragd} strokeWidth="2" opacity={ein} />
      {/* Hütte */}
      <g opacity={ein}>
        <rect x={bx - 8} y={by - 13} width="16" height="13" fill={C.weiss} stroke={C.tinte} strokeWidth="1.3" />
        <path d={`M${bx - 11} ${by - 12} L${bx} ${by - 22} L${bx + 11} ${by - 12} Z`} fill={C.signal} />
        <rect x={bx - 2.5} y={by - 7} width="5" height="7" fill={C.tinte} />
      </g>
      <TR x={bx} y={by + 14} textAnchor="middle" fontSize="11.5" fontWeight="800" fill={C.tinte} opacity={ein}>B(5 | 0)</TR>
      <line x1={dx} y1={A.Y(0)} x2={dx} y2={dy} stroke={C.hellgrau} strokeWidth="1" strokeDasharray="3 4" opacity={dro} />
      {grenze > 0.001 && (
        <g opacity={grenze}>
          <Ausschnitt id="gtan-a-hue" A={A}>
            <line x1={A.X(A.x0)} y1={A.Y(huegelTangente(A.x0))} x2={bx} y2={by} stroke={C.gold} strokeWidth="1.6" strokeDasharray="6 5" />
          </Ausschnitt>
          <Punkt x={A.X(H.u)} y={A.Y(H.f(H.u))} farbe={C.flaggold} />
          <TR x={A.X(H.u) + 9} y={A.Y(H.f(H.u)) - 8} fontSize="12" fontWeight="800" fill={C.gold}>(2 | 3)</TR>
        </g>
      )}
      {sicht > 0.001 && (hindernis ? (
        <g opacity={sicht}>
          <line x1={dx} y1={dy} x2={A.X(hindernis[0])} y2={A.Y(hindernis[1])} stroke={C.signal} strokeWidth="2" />
          <line x1={A.X(hindernis[0])} y1={A.Y(hindernis[1])} x2={bx} y2={by} stroke={C.signal} strokeWidth="1.2" strokeDasharray="3 4" opacity="0.5" />
          <path d={`M${A.X(hindernis[0]) - 5} ${A.Y(hindernis[1]) - 5} l10 10 m0 -10 l-10 10`} stroke={C.signal} strokeWidth="2.2" strokeLinecap="round" />
        </g>
      ) : (
        <line x1={dx} y1={dy} x2={bx} y2={by} stroke={tangente ? C.gold : C.smaragd} strokeWidth="2.2" opacity={sicht} />
      ))}
      <Drohne x={dx} y={dy} o={dro} />
      <TR x={dx + 18} y={dy + 4} fontSize="12" fontWeight="800" fill={C.seeTief} opacity={dro}>Höhe {dk(hz, 1)}</TR>
      <Pille x={A.R - 56} y={A.O + 22} o={sicht} breite={104} gross={12} voll
        text={hindernis ? "verdeckt" : tangente ? "gerade so" : "freie Sicht"} farbe={hindernis ? C.signal : tangente ? C.gold : C.smaragd} />
      <Zeile y={296} o={lauf(t, 18.2, 19.2)} text="u² − 10u + 16 = 0  ⇒  u = 2   ·   t(x) = −x + 5,  t(−4) = 9" gross={12.5} />
    </g>
  );
}

const TANGENTEN_ANIM = {
  aussen: { titel: () => "Tangenten von einem Punkt außerhalb", unter: () => "Die Berührstelle wandert – genau zweimal geht die Tangente durch P",
    szene: () => ({ dauer: AUS_DAUER, hoehe: 312, schritte: ausSchritte(), zeichne: ausZeichne,
      beschreibung: "Animation: Normalparabel und der Punkt P(1 | −3) darunter. Eine Gerade dreht sich um P und berührt die Parabel zweimal. Dann wandert die Berührstelle u; nur für u = −1 und u = 3 geht die Tangente durch P: t1(x) = −2x − 1 und t2(x) = 6x − 9." }) },
  beruehren: { titel: () => "Tangente und Normale", unter: () => "Aus der Sekante wird die Tangente, die Normale steht senkrecht darauf",
    szene: () => ({ dauer: BER_DAUER, hoehe: 336, schritte: berSchritte(), zeichne: berZeichne,
      beschreibung: "Animation: Normalparabel mit B(1 | 1). Sekanten durch B und Q werden zur Tangente t(x) = 2x − 1. Die Normale steht senkrecht darauf: n(x) = −0,5x + 1,5." }) },
  anzahl: { titel: () => "Zwei, eine oder keine Tangente", unter: () => "P wandert durch die Parabel – die Diskriminante entscheidet",
    szene: () => ({ dauer: ANZ_DAUER, hoehe: 312, schritte: anzSchritte(), zeichne: anzZeichne,
      beschreibung: "Animation: P(1 | b) wandert von unterhalb der Normalparabel nach oben. Unterhalb gibt es zwei Tangenten, auf der Parabel eine, oberhalb keine. Die Diskriminante D = 1 − b wechselt dabei von positiv über null zu negativ." }) },
  kubisch: { titel: () => "Bis zu drei Tangenten an x³ − 3x", unter: () => "Kurve und Wendetangente begrenzen das Gebiet mit drei Tangenten",
    szene: () => ({ dauer: KUB_DAUER, hoehe: 312, schritte: kubSchritte(), zeichne: kubZeichne,
      beschreibung: "Animation: Graph von f(x) = x³ − 3x mit Wendetangente w(x) = −3x. Von P(1 | −2,5) gehen drei Tangenten aus. Das Gebiet zwischen Kurve und Wendetangente ist gold gefärbt. P wandert nach oben (eine Tangente) und dann auf die Wendetangente (zwei Tangenten)." }) },
  huegel: { titel: () => "Anwendung: freie Sicht über den Hügel", unter: () => "Die Sichtgrenze ist die Tangente von der Hütte an den Hügel",
    szene: () => ({ dauer: HUE_DAUER, hoehe: 312, schritte: hueSchritte(), zeichne: hueZeichne,
      beschreibung: "Animation: Hügel f(x) = 4 − 0,25x², Hütte bei B(5 | 0), eine Drohne steigt über x = −4 auf. Bis zur Höhe 9 verdeckt der Hügel die Hütte. Die Grenze ist die Tangente t(x) = −x + 5, die den Hügel in (2 | 3) berührt." }) },
};

export function TangentenAnimation({ art, offen = false }) {
  return <AnimKarte szenen={TANGENTEN_ANIM} art={art} offen={offen} merkmal="data-tangenten-anim" />;
}

/* ======================================================================
   Statische Bilder der Herleitung
   ====================================================================== */

/* Gemeinsame Tangenten von f(x) = x² und g(x) = −x² + 2x − 5 */
function GemeinsamBild() {
  const A = abb({ x: [-2.7, 3.3], y: [-9.6, 6.2], L: 14, R: 346, O: 10, U: 250 });
  const f = (x) => x * x, g = (x) => -x * x + 2 * x - 5;
  return (
    <svg viewBox="0 0 360 262" style={{ width: "100%", maxWidth: 480, display: "block", margin: "6px auto 14px" }} role="img"
      aria-label="Die Parabeln f(x) = x² und g(x) = −x² + 2x − 5 mit ihren gemeinsamen Tangenten y = −2x − 1 und y = 4x − 4. Die erste berührt f bei x = −1 und g bei x = 2, die zweite f bei x = 2 und g bei x = −1.">
      <Achsen A={A} zx={[-2, -1, 1, 2, 3]} zy={[-8, -4, 4]} />
      <Ausschnitt id="gtan-s-gem" A={A}>
        <Gerade A={A} m={-2} c={-1} farbe={C.gold} breite={2} />
        <Gerade A={A} m={4} c={-4} farbe={C.smaragd} breite={2} />
        <path d={pfad(f, A)} fill="none" stroke={C.tinte} strokeWidth="2.2" />
        <path d={pfad(g, A)} fill="none" stroke={C.see} strokeWidth="2.2" />
      </Ausschnitt>
      {[[-1, f(-1), C.gold], [2, g(2), C.gold], [2, f(2), C.smaragd], [-1, g(-1), C.smaragd]].map(([x, y, farbe]) => (
        <Punkt key={`${x}|${y}`} x={A.X(x)} y={A.Y(y)} farbe={farbe} r={4.2} />
      ))}
      <TR x={A.X(-2.15)} y={A.Y(4.62) - 4} textAnchor="middle" fontSize="12" fontWeight="800" fill={C.tinte} grund={C.weiss}>f</TR>
      <TR x={A.X(0.15)} y={A.Y(g(0.15)) + 16} textAnchor="middle" fontSize="12" fontWeight="800" fill={C.see} grund={C.weiss}>g</TR>
      <TR x={A.X(-2.6)} y={A.Y(4.2) + 22} fontSize="11.5" fontWeight="800" fill={C.gold} grund={C.weiss}>y = −2x − 1</TR>
      <TR x={A.X(1.55)} y={A.Y(5.2)} textAnchor="end" fontSize="11.5" fontWeight="800" fill={C.smaragd} grund={C.weiss}>y = 4x − 4</TR>
    </svg>
  );
}

/* Fallunterscheidung bei der Normalparabel */
function FallTafel() {
  const kopf = { fontSize: 11, fontWeight: 700, color: C.grau, letterSpacing: "0.03em", textTransform: "uppercase", padding: "0 4px 8px" };
  const zelle = { fontSize: 13.5, color: C.tinte, padding: "9px 4px", borderTop: `1px solid ${C.linie}`, display: "flex", alignItems: "center" };
  const zeilen = [
    ["unterhalb", "b < a^2", "D > 0", "2"],
    ["auf", "b = a^2", "D = 0", "1"],
    ["oberhalb", "b > a^2", "D < 0", "0"],
  ];
  return (
    <div style={{ ...KARTE, padding: "14px 14px 10px", margin: "4px 0 18px" }} data-fall-tafel="">
      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr 0.9fr 0.95fr", alignItems: "stretch" }}>
        <span style={kopf}>P liegt</span><span style={kopf}>also</span><span style={kopf}>D</span><span style={kopf}>Tangenten</span>
        {zeilen.map(([lage, b, d, n]) => (
          <React.Fragment key={lage}>
            <span style={{ ...zelle, fontWeight: 700 }}>{lage}</span>
            <span style={zelle}><M t={b} /></span>
            <span style={zelle}><M t={d} /></span>
            <span style={{ ...zelle, fontWeight: 800, fontSize: 16, color: n === "0" ? C.see : C.gold }}>{n}</span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

/* ======================================================================
   Labor: Punkt P verschieben, Kurve wählen, alle Tangenten live
   ====================================================================== */
const LAB = {
  parabel: { A: abb({ x: [-4, 4], y: [-4.5, 8.5], L: 14, R: 346, O: 10, U: 290 }), a: [-3.5, 3.5], b: [-4, 8] },
  kubisch: { A: abb({ x: [-3.2, 3.2], y: [-6.5, 6.5], L: 14, R: 346, O: 10, U: 290 }), a: [-3, 3], b: [-6, 6] },
};
const klemm = (v, [lo, hi]) => Math.max(lo, Math.min(hi, v));
const zehntel = (v) => Math.round(v * 10) / 10;

function Stepper({ label, wert, setzen, achse }) {
  const knopf = (zeichen, d) => (
    <button type="button" onClick={() => setzen(d)} aria-label={`${achse} von P ${d > 0 ? "erhöhen" : "verringern"}`}
      style={{ width: 40, height: 40, borderRadius: 12, border: "none", background: d > 0 ? C.see : C.seeTief, color: C.weiss, fontSize: 20, fontWeight: 700,
        fontFamily: "inherit", cursor: "pointer", padding: 0, lineHeight: 1, touchAction: "manipulation" }}>{zeichen}</button>
  );
  return (
    <div className="flex items-center" style={{ gap: 8 }}>
      {knopf("−", -1)}
      <span style={{ minWidth: 70, textAlign: "center", fontSize: 15, fontWeight: 700, color: C.tinte }}>{label} = {dk(wert, 1)}</span>
      {knopf("+", 1)}
    </div>
  );
}

function lageText(id, a, b, n) {
  if (id === "parabel") return n === 2 ? "P liegt unterhalb der Parabel." : n === 1 ? "P liegt auf der Parabel." : "P liegt oberhalb der Parabel – keine Tangente erreicht P.";
  if (n === 3) return "P liegt zwischen Kurve und Wendetangente.";
  if (n === 2) return Math.abs(b - KURVEN.kubisch.f(a)) < 1e-9 ? "P liegt auf der Kurve." : "P liegt auf der Wendetangente.";
  if (Math.abs(a) < 1e-9) return Math.abs(b) < 1e-9 ? "P ist der Wendepunkt: nur die Wendetangente." : "P liegt senkrecht über oder unter dem Wendepunkt.";
  return "P liegt außerhalb des Gebiets zwischen Kurve und Wendetangente.";
}

function TangentenLabor() {
  const [id, setId] = useState("parabel");
  const [P, setP] = useState(KURVEN.parabel.start);
  const svg = useRef(null);
  const zieht = useRef(false);
  const L = LAB[id], A = L.A, K = KURVEN[id];
  const [a, b] = P;
  const n = anzahlTangenten(id, a, b);
  const stellen = beruehrstellen(id, a, b);
  const kurveSetzen = (k) => { setId(k); setP(KURVEN[k].start); };
  const schieben = (da, db) => setP(([x, y]) => [klemm(zehntel(x + da), LAB[id].a), klemm(zehntel(y + db), LAB[id].b)]);
  const ausZeiger = (e) => {
    const s = svg.current;
    if (!s || !s.getScreenCTM) return null;
    const pt = s.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const q = pt.matrixTransform(s.getScreenCTM().inverse());
    return [klemm(zehntel(A.xAus(q.x)), L.a), klemm(zehntel(A.yAus(q.y)), L.b)];
  };
  const greifen = (e) => {
    zieht.current = true;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (x) { /* ohne Einfangen */ }
    const neu = ausZeiger(e); if (neu) setP(neu);
  };
  /* Ziehen: am Griff immer, mit der Maus auch irgendwo im Bild (am Handy bleibt das Bild zum Scrollen frei) */
  const zeigerUnten = (e) => { if (e.pointerType === "mouse" || e.target.closest?.("[data-griff]")) greifen(e); };
  const zeigerZieht = (e) => { if (zieht.current) { const neu = ausZeiger(e); if (neu) setP(neu); } };
  const loslassen = () => { zieht.current = false; };
  const taste = (e) => {
    const d = { ArrowLeft: [-0.5, 0], ArrowRight: [0.5, 0], ArrowUp: [0, 0.5], ArrowDown: [0, -0.5] }[e.key];
    if (d) { e.preventDefault(); schieben(...d); }
  };
  const r = Math.sqrt(A.y1 + 1);
  const gebiet = id === "parabel"
    ? <path d={`${pfad(K.f, A, -r, r, 140)} Z`} fill={C.himmel} />
    : <path d={`${pfad(K.f, A, A.x0, A.x1, 160)} ${pfad(K.wende, A, A.x1, A.x0, 2).replace(/^M/, "L")} Z`} fill={C.flaggold} opacity="0.2" />;
  const koeff = laborKoeffizienten(id, a, b);
  const px = A.X(a), py = A.Y(b);
  const legende = id === "parabel"
    ? [[C.flaggold, 0.22, "2 Tangenten"], [C.tinte, 1, "1 – auf der Kurve"], [C.himmel, 1, "0 Tangenten"]]
    : [[C.flaggold, 0.35, "3 Tangenten"], [C.see, 1, "2 – auf Kurve oder Wendetangente"], [C.himmel, 1, "1 Tangente"]];
  return (
    <div data-tangenten-labor="" data-kurve={id} data-a={a} data-b={b} data-anzahl={n}>
      <div className="flex flex-wrap items-center" style={{ gap: 8, marginBottom: 12 }}>
        <Chip aktiv={id === "parabel"} onClick={() => kurveSetzen("parabel")}>Normalparabel</Chip>
        <Chip aktiv={id === "kubisch"} onClick={() => kurveSetzen("kubisch")}>x³ − 3x</Chip>
      </div>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <svg ref={svg} viewBox="0 0 360 300" style={{ width: "100%", display: "block", borderRadius: 12, background: C.sand, outline: "none", cursor: zieht.current ? "grabbing" : "crosshair" }}
          role="application" tabIndex={0} onKeyDown={taste} aria-label={`Koordinatensystem mit ${id === "parabel" ? "der Normalparabel" : "f(x) = x³ − 3x"} und dem Punkt P(${dk(a, 1)} | ${dk(b, 1)}); ${n} ${tangentenWort(n)} durch P. Pfeiltasten verschieben P.`}
          onPointerDown={zeigerUnten} onPointerMove={zeigerZieht} onPointerUp={loslassen} onPointerCancel={loslassen}>
          <rect x={A.L} y={A.O} width={A.R - A.L} height={A.U - A.O} fill={id === "parabel" ? C.flaggold : C.himmel} opacity={id === "parabel" ? 0.12 : 0.7} />
          <Ausschnitt id="gtan-l-f" A={A}>{gebiet}</Ausschnitt>
          <Achsen A={A} zx={id === "parabel" ? [-3, -2, -1, 1, 2, 3] : [-3, -2, -1, 1, 2, 3]} zy={id === "parabel" ? [-4, -2, 2, 4, 6, 8] : [-6, -4, -2, 2, 4, 6]} />
          <Ausschnitt id="gtan-l" A={A}>
            {id === "kubisch" && <Gerade A={A} m={-3} c={0} farbe={C.see} breite={1.6} strich="6 5" />}
            <path d={pfad(K.f, A)} fill="none" stroke={C.tinte} strokeWidth="2.2" />
            {stellen.map((u, i) => { const g = tangenteIn(id, u); return <Gerade key={i} A={A} m={g.m} c={g.c} farbe={TFARBEN[i]} breite={2.2} />; })}
            {stellen.map((u, i) => <Punkt key={`p${i}`} x={A.X(u)} y={A.Y(K.f(u))} farbe={TFARBEN[i]} r={4.2} />)}
          </Ausschnitt>
          <g data-griff="" style={{ cursor: "grab", touchAction: "none" }}>
            <circle cx={px} cy={py} r="18" fill={C.signal} opacity="0.12" />
            <Punkt x={px} y={py} r={6} />
          </g>
          <TR x={px + (a > 1.8 ? -12 : 12)} y={py + (b > L.b[1] - 1 || (K.f(a) > b && K.f(a) - b < 1.2) ? 20 : -10)} textAnchor={a > 1.8 ? "end" : "start"}
            fontSize="12.5" fontWeight="800" fill={C.signal}>P({dk(a, 1)} | {dk(b, 1)})</TR>
        </svg>
        <div className="flex flex-wrap" style={{ gap: "6px 14px", margin: "8px 2px 0" }} aria-hidden="true">
          {legende.map(([farbe, o, text]) => (
            <span key={text} className="flex items-center" style={{ gap: 6, fontSize: 12, color: C.grau }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: farbe, opacity: o, border: `1px solid ${C.linie}` }} />{text}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center" style={{ gap: "10px 18px", margin: "14px 0 6px" }}>
        <Stepper label="a" achse="x-Koordinate" wert={a} setzen={(d) => schieben(0.5 * d, 0)} />
        <Stepper label="b" achse="y-Koordinate" wert={b} setzen={(d) => schieben(0, 0.5 * d)} />
        <button type="button" onClick={() => setP(K.start)} style={LINK}>Zurücksetzen</button>
      </div>
      <p style={{ fontSize: 12.5, color: C.grau, fontWeight: 300, lineHeight: 1.6, marginBottom: 12 }}>
        Mit Plus und Minus springt P in halben Schritten. Am großen Bildschirm kannst du P auch ziehen oder ins Bild klicken; die Pfeiltasten gehen auch.
      </p>

      <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", background: C.sand, borderRadius: 14, padding: "12px 14px", marginBottom: 12 }}>
        <div aria-live="polite" style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span data-zahl="" style={{ fontSize: 46, fontWeight: 800, lineHeight: 1, color: n ? C.gold : C.see, fontVariantNumeric: "tabular-nums" }}>{n}</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.tinte }}>{tangentenWort(n)} durch P</span>
        </div>
        <p style={{ flex: "1 1 200px", fontSize: 13.5, color: C.grau, lineHeight: 1.55 }}>{lageText(id, a, b, n)}</p>
      </div>
      <div style={{ fontSize: 14, color: C.tinte, marginBottom: 8 }}>
        <span style={{ fontSize: 12.5, color: C.grau, marginRight: 6 }}>Gleichung für die Berührstelle:</span>
        <M t={`${polyDez(koeff)} = 0`} />
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }} data-tangenten-liste="">
        {stellen.map((u, i) => {
          const g = tangenteIn(id, u);
          const gt = geradeText(g.m, g.c);
          const draussen = g.y < A.y0 || g.y > A.y1 || u < A.x0 || u > A.x1;
          return (
            <li key={i} className="flex items-center flex-wrap" style={{ gap: "2px 10px", padding: "7px 0", borderTop: `1px solid ${C.linie}`, fontSize: 13.5, color: C.tinte }}>
              <span style={{ width: 10, height: 10, borderRadius: 999, background: TFARBEN[i], flexShrink: 0 }} />
              <span style={{ fontWeight: 700 }}>u {Math.abs(u - zehntel(u)) < 1e-9 ? "=" : "≈"} {dk(u, 2)}</span>
              <span style={{ color: C.grau }}>B({dk(u, 2)} | {dk(g.y, 2)})</span>
              <span style={{ fontWeight: 600, color: TFARBEN[i] }}>{gt.text}</span>
              {draussen && <span style={{ fontSize: 12, color: C.grau }}>(Berührpunkt außerhalb des Bildes)</span>}
            </li>
          );
        })}
        {!stellen.length && <li style={{ padding: "7px 0", borderTop: `1px solid ${C.linie}`, fontSize: 13.5, color: C.grau }}>Die Gleichung hat keine Lösung – D = a² − b = {dk(a * a - b, 2)} ist negativ.</li>}
      </ul>
    </div>
  );
}

/* ======================================================================
   Übungen
   ====================================================================== */
function Feld({ f, wert, setzen, stand, onEnter }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 16, fontWeight: 500, color: C.tinte, whiteSpace: "nowrap" }}>
      {f.vor && <M t={f.vor} />}
      <MatheFeld modus={f.modus} value={wert} onChange={(e) => setzen(f.k, e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") onEnter(); }}
        aria-label={f.aria} data-feld={f.k} placeholder="?" style={{ ...ZELLE(stand), width: f.modus === "ganzvz" ? 64 : 78 }} />
      {f.nach && <M t={f.nach} />}
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

const HINWEIS = "Brüche als 3/2 oder -1/4, Dezimalzahlen mit Komma.";
function TangentenTrainer() {
  const [art, setArt] = useState("tangente");
  const [stufe, setStufe] = useState(1);
  const [auf, setAufRoh] = useState(() => merk(aufgabe("tangente", 1)));
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
  const mc = !!auf.optionen;
  const schluessel = mc ? [] : Object.keys(auf.soll);
  const leer = mc ? wahl === null : schluessel.some((k) => !String(ein[k] ?? "").trim());
  const pruefen = () => {
    if (leer) return;
    const e = pruefe(auf, mc ? wahl : ein);
    setErg(e);
    setSerie((x) => ({ n: x.n + 1, ok: x.ok + (e.ok ? 1 : 0) }));
  };
  const weg = <Formeln zeilen={rechenweg(auf)} max={15} farbe={C.see} />;
  return (
    <div>
      <p style={{ ...FLIESS, lineHeight: 1.7, marginBottom: 18 }}>
        Vier Aufgabentypen mit immer neuen Zahlen: Tangente und Normale in einem Kurvenpunkt, Tangenten von einem Punkt außerhalb
        und – auf den Stufen 1 bis 3 – die Frage, wie viele Tangenten es gibt, ab Stufe 4 gemeinsame Tangenten zweier Parabeln.
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        {ARTEN.map((a) => <Chip key={a.id} aktiv={art === a.id} onClick={() => artSetzen(a.id)}>{a.name}</Chip>)}
      </div>
      <Stufen stufe={stufe} setzen={stufeSetzen} />
      <div style={KARTE} data-mm-karte="" data-tangententrainer="" data-art={auf.art} data-stufe={auf.stufe}>
        <Text s={auftrag(auf)} style={{ fontSize: 15, color: C.tinte, fontWeight: 400, lineHeight: 1.8, marginBottom: 12 }} />
        {mc ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8, marginBottom: 12 }}>
            {auf.optionen.map((o, i) => {
              const an = wahl === i, gut = an && erg && erg.ok, schlecht = an && erg && !erg.ok;
              return (
                <button key={o} type="button" onClick={() => { setWahl(i); setErg(null); }} aria-pressed={an} data-option={i}
                  style={{ padding: "10px 12px", borderRadius: 12, fontFamily: "inherit", cursor: "pointer", fontSize: 15, fontWeight: 600, textAlign: "center",
                    border: `1.5px solid ${gut ? C.see : schlecht ? C.signal : an ? C.see : C.linie}`, background: gut ? C.himmel : an ? "#F3F7FD" : C.weiss, color: C.tinte }}>
                  {o} {tangentenWort(o)}
                </button>
              );
            })}
          </div>
        ) : (
          <>
            <p style={{ fontSize: 12.5, color: C.grau, fontWeight: 300, marginBottom: 8 }}>{auf.art === "aussen" ? "Berührstellen als ganze Zahlen; Reihenfolge egal. " : ""}{HINWEIS}</p>
            <div className="flex flex-col" style={{ gap: 10, marginBottom: 12 }}>
              {auf.zeilen.map((zeile, zi) => (
                <div key={zi} className="flex flex-wrap items-center" style={{ gap: "8px 14px" }}>
                  {zeile.map((f) => <Feld key={f.k} f={f} wert={ein[f.k] ?? ""} setzen={setze} stand={erg ? erg.felder[f.k] : null} onEnter={pruefen} />)}
                </div>
              ))}
            </div>
          </>
        )}
        {erg && erg.ok && (
          <div style={{ borderLeft: `4px solid ${C.see}`, paddingLeft: 16, marginBottom: 14 }} data-ergebnis="richtig">
            <p style={{ fontSize: 16, fontWeight: 600, color: C.see, marginBottom: 2 }}>Stimmt!</p>
            {weg}
          </div>
        )}
        {erg && !erg.ok && (
          <div style={{ borderLeft: `4px solid ${C.signal}`, paddingLeft: 16, marginBottom: 14 }} data-ergebnis="falsch">
            <p style={{ fontSize: 15, fontWeight: 600, color: C.signal, marginBottom: 6 }}>Stimmt noch nicht.</p>
            <p data-grund="" style={{ fontSize: 14, color: C.tinte, fontWeight: 300, lineHeight: 1.75 }}>{erg.grund || tipp(auf)}</p>
            {erg.grund && <p style={{ fontSize: 13, color: C.grau, fontWeight: 300, lineHeight: 1.7, marginTop: 6 }}><b style={{ fontWeight: 600 }}>Tipp:</b> {tipp(auf)}</p>}
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
export function GfsTangentenSeite({ gehe }) {
  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 22 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 14 }}>
        Wie viele Tangenten gehen von einem Punkt an eine Kurve – und wo berühren sie?
      </h2>
      <Text s="Leg ein Lineal an einen Punkt unterhalb einer Parabel und dreh es langsam. Meistens schneidet es die Parabel zweimal oder gar nicht – aber in genau zwei Lagen berührt es sie. Liegt der Punkt über der Parabel, gelingt das nie. Woran liegt das, und wo genau berührt das Lineal?" style={FLIESS} />
      <Text s="Wir beginnen mit der Tangente in einem Kurvenpunkt. Dann drehen wir die Frage um: Der Punkt liegt außerhalb, die Berührstelle ist unbekannt. Die Zahl der Tangenten ist dann die Zahl der Lösungen einer Gleichung – bei der Parabel entscheidet die Diskriminante, bei einer kubischen Kurve ein Vorzeichenargument. Zum Schluss gemeinsame Tangenten zweier Kurven und eine Anwendung." style={FLIESS} />

      <TangentenAnimation art="aussen" offen />

      <Schritt nr="1" titel="Tangente und Normale in einem Kurvenpunkt" />
      <Text s={"Die Tangente an den Graphen von $f$ im Punkt $B(u \\mid f(u))$ ist die Gerade durch $B$, die dort dieselbe Steigung hat wie die Kurve: $f′(u)$. Die Punkt-Steigungs-Form liefert sofort ihre Gleichung."} style={FLIESS} />
      <Formeln titel="Tangente an der Stelle u" zeilen={[
        "t(x) = f′(u)(x − u) + f(u)",
      ]} max={18} />
      <Text s={"Beispiel: $f(x) = x^2$ an der Stelle $u = 1$. Es ist $f(1) = 1$ und $f′(x) = 2x$, also $f′(1) = 2$:"} style={FLIESS} />
      <Formeln zeilen={["t(x) = 2(x − 1) + 1 = 2x − 1"]} max={17} />
      <Text s={"Die Normale geht durch denselben Punkt $B$ und steht dort senkrecht auf der Tangente. Warum ihre Steigung $−\\frac{1}{m}$ ist: Das Steigungsdreieck der Tangente geht 1 nach rechts und $m$ nach oben. Dreht man es um 90°, geht es $m$ nach links und 1 nach oben – die Steigung ist $\\frac{1}{−m} = −\\frac{1}{m}$."} style={FLIESS} />
      <Formeln titel="Normale an der Stelle u (für f′(u) ≠ 0)" zeilen={[
        "n(x) = −\\frac{1}{f′(u)}(x − u) + f(u)",
        "\\text{Beispiel: } n(x) = −\\frac{1}{2}(x − 1) + 1 = −\\frac{1}{2}x + \\frac{3}{2}",
      ]} max={17} />
      <Text s={"Ist $f′(u) = 0$, ist die Tangente waagrecht und die Normale die senkrechte Gerade $x = u$."} style={FLIESS} />
      <TangentenAnimation art="beruehren" />

      <Schritt nr="2" titel="Tangente von einem Punkt außerhalb" />
      <Text s={"Jetzt liegt der Punkt $P(1 \\mid −3)$ nicht auf der Normalparabel – es ist $f(1) = 1 \\neq −3$. Die Tangente in $P$ gibt es also nicht. Gesucht sind Tangenten, die irgendwo berühren und durch $P$ gehen. Die Berührstelle $u$ ist die Unbekannte."} style={FLIESS} />
      <Formeln titel="Tangente an f(x) = x² in einer unbekannten Stelle u" zeilen={[
        "t_u(x) = 2u(x − u) + u^2 = 2ux − u^2",
        "P(1 \\mid −3) \\text{ einsetzen: } −3 = 2u − u^2",
        "u^2 − 2u − 3 = 0 \\;\\Rightarrow\\; (u + 1)(u − 3) = 0",
        "u_1 = −1, \\quad u_2 = 3",
      ]} max={17} />
      <Text s={"Jede Lösung ist eine Berührstelle. Eingesetzt in $t_u$ ergeben sich die beiden Tangenten – und die Probe zeigt, dass $P$ auf beiden liegt:"} style={FLIESS} />
      <Formeln zeilen={[
        "t_1(x) = −2x − 1, \\quad t_1(1) = −3",
        "t_2(x) = 6x − 9, \\quad t_2(1) = −3",
      ]} max={17} />
      <Kasten titel="Das Rezept">
        <ol style={{ margin: "8px 0 10px", paddingLeft: 20, listStyle: "decimal" }}>
          {[
            "Tangente an einer unbekannten Stelle u aufschreiben: t(x) = f′(u)(x − u) + f(u).",
            "Die Koordinaten von P für x und t(x) einsetzen.",
            "Die Gleichung nach u auflösen. Jede Lösung ist eine Berührstelle.",
            "Die Lösungen in t einsetzen – das sind die Tangenten durch P.",
          ].map((r) => <li key={r} style={{ fontSize: 14, color: C.tinte, fontWeight: 300, lineHeight: 1.7, marginBottom: 6 }}>{r}</li>)}
        </ol>
      </Kasten>

      <Schritt nr="3" titel="Normalparabel: zwei, eine oder keine Tangente" />
      <Text s={"Dieselbe Rechnung für einen beliebigen Punkt $P(a \\mid b)$: Einsetzen in $t_u(x) = 2ux − u^2$ ergibt $b = 2ua − u^2$, also eine quadratische Gleichung für $u$."} style={FLIESS} />
      <Formeln zeilen={[
        "u^2 − 2au + b = 0",
        "u_{1,2} = a \\pm \\sqrt{a^2 − b}, \\quad D = a^2 − b",
      ]} max={17} />
      <Text s={"Verschiedene Berührstellen liefern verschiedene Tangenten, denn ihre Steigungen $2u$ sind verschieden. Die Zahl der Tangenten ist also die Zahl der Lösungen – und die hängt nur am Vorzeichen von $D$. Da $f(a) = a^2$ ist, heißt $b < a^2$ genau: $P$ liegt unterhalb des Graphen."} style={FLIESS} />
      <FallTafel />
      <Text s={"Warum von oben keine Tangente kommt, sieht man auch direkt: Für jede Tangente gilt"} style={FLIESS} />
      <Formeln zeilen={["f(x) − t_u(x) = x^2 − 2ux + u^2 = (x − u)^2 \\ge 0"]} max={17} />
      <Text s={"Jede Tangente liegt also unterhalb der Parabel und berührt sie nur bei $u$. Ein Punkt oberhalb der Parabel liegt damit über jeder Tangente – keine geht durch ihn."} style={FLIESS} />
      <TangentenAnimation art="anzahl" />

      <Schritt nr="4" titel="Kubische Funktion: bis zu drei Tangenten" />
      <Text s={"Bei $f(x) = x^3 − 3x$ ist $f′(x) = 3x^2 − 3$. Die Tangente an der Stelle $u$ und die Bedingung, dass sie durch $P(a \\mid b)$ geht:"} style={FLIESS} />
      <Formeln zeilen={[
        "t_u(x) = (3u^2 − 3)(x − u) + u^3 − 3u",
        "t_u(x) = (3u^2 − 3)x − 2u^3",
        "b = (3u^2 − 3)a − 2u^3",
        "g(u) = 2u^3 − 3au^2 + 3a + b = 0",
      ]} max={17} />
      <Text s={"Verschiedene Berührstellen geben auch hier verschiedene Geraden: Gleiche Steigung $3u^2 − 3$ hätten nur $u$ und $−u$, doch dann unterscheiden sich die Achsenabschnitte $−2u^3$ und $2u^3$. Wir zählen also die Nullstellen von $g$. Dazu helfen die Extremstellen:"} style={FLIESS} />
      <Formeln zeilen={[
        "g′(u) = 6u^2 − 6au = 6u(u − a)",
        "g(0) = b + 3a = b − w(a)",
        "g(a) = b − (a^3 − 3a) = b − f(a)",
      ]} max={17} />
      <Text s={"Dabei ist $w(x) = −3x$ die Wendetangente: Der Wendepunkt ist $W(0 \\mid 0)$, und $f′(0) = −3$. Für $a \\neq 0$ ist $g$ auf den drei Abschnitten links von, zwischen und rechts von $0$ und $a$ streng monoton, hat also auf jedem höchstens eine Nullstelle. Weil $g$ von $−\\infty$ nach $+\\infty$ läuft, gibt es genau dann drei Nullstellen, wenn $g(0)$ und $g(a)$ verschiedene Vorzeichen haben – wenn also $b$ zwischen $w(a)$ und $f(a)$ liegt."} style={FLIESS} />
      <Kasten titel="Ergebnis für f(x) = x³ − 3x">
        <ul style={{ margin: "8px 0 10px", paddingLeft: 18, listStyle: "disc" }}>
          {[
            "Drei Tangenten, wenn P zwischen der Kurve und der Wendetangente liegt.",
            "Zwei Tangenten, wenn P auf der Kurve oder auf der Wendetangente liegt (aber nicht im Wendepunkt): Dann ist g(a) = 0 oder g(0) = 0, und g hat dort eine doppelte Nullstelle.",
            "Eine Tangente sonst – auch für a = 0, denn g(u) = 2u³ + b ist streng monoton.",
          ].map((r) => <li key={r} style={{ fontSize: 14, color: C.tinte, fontWeight: 300, lineHeight: 1.7, marginBottom: 6 }}>{r}</li>)}
        </ul>
      </Kasten>
      <Text s={"Beispiel $P(1 \\mid −2{,}5)$: $g(u) = 2u^3 − 3u^2 + \\frac{1}{2}$ mit $g(0) = \\frac{1}{2} > 0$ und $g(1) = −\\frac{1}{2} < 0$ – also drei Tangenten. Die Lösung $u = \\frac{1}{2}$ lässt sich erraten, die anderen liefert die Polynomdivision:"} style={FLIESS} />
      <Formeln zeilen={[
        "g(u) = (u − \\frac{1}{2})(2u^2 − 2u − 1)",
        "u_1 = \\frac{1 − \\sqrt{3}}{2}, \\quad u_2 = \\frac{1}{2}, \\quad u_3 = \\frac{1 + \\sqrt{3}}{2}",
      ]} max={17} />
      <Text s={"Der Grenzfall Wendetangente: Für $b = −3a$ wird $g(u) = 2u^3 − 3au^2 = u^2(2u − 3a)$. Die Lösung $u = 0$ ist doppelt – zwei der drei Berührstellen sind im Wendepunkt zusammengefallen. Übrig bleiben die Wendetangente selbst und die Tangente an der Stelle $u = \\frac{3}{2}a$."} style={FLIESS} />
      <TangentenAnimation art="kubisch" />

      <Schritt nr="5" titel="Gemeinsame Tangente zweier Parabeln" />
      <Text s={"Eine Gerade soll $f(x) = x^2$ und $g(x) = −x^2 + 2x − 5$ zugleich berühren. Wir schreiben die Tangente an $f$ in $u$ und die Tangente an $g$ in $v$ auf. Es soll dieselbe Gerade sein: gleiche Steigung und gleicher y-Achsenabschnitt."} style={FLIESS} />
      <Formeln zeilen={[
        "\\text{an } f \\text{ in } u\\text{: } y = 2ux − u^2",
        "\\text{an } g \\text{ in } v\\text{: } y = (2 − 2v)x + v^2 − 5",
        "2u = 2 − 2v \\;\\Rightarrow\\; v = 1 − u",
        "−u^2 = (1 − u)^2 − 5 \\;\\Rightarrow\\; 2u^2 − 2u − 4 = 0",
        "u^2 − u − 2 = 0 \\;\\Rightarrow\\; u_1 = −1, \\; u_2 = 2",
        "t_1(x) = −2x − 1, \\quad t_2(x) = 4x − 4",
      ]} max={17} />
      <GemeinsamBild />
      <Text s={"Die erste Tangente berührt $f$ bei $x = −1$ und $g$ bei $x = 2$, die zweite $f$ bei $x = 2$ und $g$ bei $x = −1$. Probe für die erste: $g(2) = −5 = t_1(2)$ und $g′(2) = −2$."} style={FLIESS} />

      <Schritt nr="6" titel="Anwendung: freie Sicht über einen Hügel" />
      <Text s={"Ein Hügel hat das Profil $f(x) = 4 − \\frac{1}{4}x^2$ für $−4 \\le x \\le 4$, dahinter steht eine Hütte bei $B(5 \\mid 0)$. Über $x = −4$ steigt eine Drohne senkrecht auf. Ab welcher Höhe sieht sie die Hütte? Die Grenze ist die Sichtlinie, die den Hügel gerade streift – die Tangente von $B$ an den Hügel."} style={FLIESS} />
      <Formeln zeilen={[
        "f′(x) = −\\frac{1}{2}x",
        "t_u(x) = −\\frac{1}{2}u(x − u) + 4 − \\frac{1}{4}u^2",
        "B(5 \\mid 0) \\text{ einsetzen: } 0 = \\frac{1}{4}u^2 − \\frac{5}{2}u + 4",
        "u^2 − 10u + 16 = 0 \\;\\Rightarrow\\; u_1 = 2, \\; u_2 = 8",
        "t(x) = −(x − 2) + 3 = −x + 5, \\quad t(−4) = 9",
      ]} max={17} />
      <Text s={"Die zweite Lösung $u = 8$ liegt nicht auf dem Hügel (er reicht nur bis $x = 4$) und fällt weg – Rechnen allein reicht nicht, jede Lösung muss zur Situation passen. Ergebnis: Oberhalb der Höhe 9 sieht die Drohne die Hütte, darunter verdeckt sie der Hügel. Das Modell setzt ein glattes Parabelprofil und eine gerade Sichtlinie voraus."} style={FLIESS} />
      <TangentenAnimation art="huegel" />
      <Kasten titel="Zum Mitnehmen">
        <Text s="Liegt P nicht auf der Kurve, ist die Berührstelle u die Unbekannte: P in die Tangente einsetzen, nach u auflösen – jede passende Lösung ist eine Tangente. Bei der Normalparabel entscheidet die Diskriminante (zwei, eine, keine), bei x³ − 3x die Lage zu Kurve und Wendetangente (drei, zwei, eine)." style={ERGEBNIS} />
      </Kasten>

      <div style={{ ...KARTE, margin: "22px 0" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 12 }}>Labor: Punkt P verschieben – alle Tangenten durch P</p>
        <TangentenLabor />
      </div>

      <Trenner />

      <Kicker>Jetzt selbst üben</Kicker>
      <H3>Tangente, Normale, Tangenten von außen</H3>
      <TangentenTrainer />

      {gehe && (
        <div style={{ ...KARTE, marginTop: 22, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: C.tinte, marginBottom: 4 }}>Woher kommt f′(u)?</p>
            <p style={{ fontSize: 13.5, color: C.grau, fontWeight: 300, lineHeight: 1.6 }}>Vom Differenzenquotienten zur Tangentensteigung – Schritt für Schritt selbst gerechnet.</p>
          </div>
          <button type="button" onClick={() => gehe({ ansicht: "diffq" })} className="px-5 py-3" style={KNOPF(true)}>Zum Differenzenquotienten</button>
        </div>
      )}

      <Trenner />

      <Kicker>Deine GFS</Kicker>
      <H3>Der rote Faden für den Vortrag</H3>
      <RoterFaden gliederung={GLIEDERUNG} tipps={TIPPS} hinweis="den Abschnitt „Mehr Tangenten und gemeinsame Tangenten“" />

      <div style={{ height: 8 }} />
      <Kicker>Kolloquium</Kicker>
      <H3>Die Fragen nach dem Vortrag trainieren</H3>
      <Kolloquium fragen={KOLLOQUIUM} speicher="mm-gfs-tangenten-kolloquium" />
    </div>
  );
}
