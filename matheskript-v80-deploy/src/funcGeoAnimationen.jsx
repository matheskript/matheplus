/* ======================================================================
   GEOMETRIE (Mittelstufe) – vier Erkläranimationen („Motion-Videos“)
   Gleicher Player wie alle Erkläranimationen (funcErklaeranimation.jsx).
     kreis      – u = π · d (Umfang abgewickelt) und A = πr² (Tortenstücke
                  werden zu einem Rechteck πr × r umgelegt)
     koerper    – gerade Körper V = G · h (Schichten), Pyramide und Kegel
                  füllen ein Drittel (dreimal umgießen), Kugel = ⅔ des Zylinders
     kongruenz  – SSS, SWS, WSW mit Zirkel und Geodreieck: genau ein Dreieck;
                  SsW mit kleinerer Gegenseite: zwei Dreiecke
     strahlen   – zentrische Streckung mit Faktor k, 1. und 2. Strahlensatz,
                  Falle AA′ : SA ≠ k
   Keine base-Datei darf diese Datei importieren.
   ====================================================================== */
import React from "react";
import { C } from "./base1.jsx";
import { lauf } from "./funcErklaeranimation.jsx";
import { zw } from "./ui2.jsx";
import { AnimKarte } from "./funcAnimKarte.jsx";

const T = (props) => <text fontFamily="inherit" {...props} />;
const fenster = (t, a, b, c, d) => lauf(t, a, b) * (1 - lauf(t, c, d));
const mix = (a, b, p) => a + (b - a) * p;
const GRAD = Math.PI / 180;
const pt = (p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;

function Pille({ x = 180, y, text, o = 1, farbe = C.see, breite }) {
  if (o <= 0.001) return null;
  const w = breite || Math.max(70, String(text).length * 7.4 + 24);
  return (
    <g opacity={o}>
      <rect x={x - w / 2} y={y - 17} width={w} height={26} rx="13" fill={C.weiss} stroke={farbe} strokeWidth="1.4" />
      <T x={x} y={y + 1} textAnchor="middle" fontSize="13" fontWeight="800" fill={farbe}>{text}</T>
    </g>
  );
}
/* Kreisbogen um m mit Radius r von Winkel a1 bis a2 (Grad, SVG-Richtung), gezeichnet bis Anteil p */
function Bogen({ m, r, a1, a2, p = 1, farbe = C.hellgrau, b = 1.6, strich }) {
  if (p <= 0.001) return null;
  const e = a1 + (a2 - a1) * p;
  const P1 = [m[0] + r * Math.cos(a1 * GRAD), m[1] + r * Math.sin(a1 * GRAD)], P2 = [m[0] + r * Math.cos(e * GRAD), m[1] + r * Math.sin(e * GRAD)];
  const gross = Math.abs(e - a1) > 180 ? 1 : 0, dir = e > a1 ? 1 : 0;
  return <path d={`M${pt(P1)} A${r} ${r} 0 ${gross} ${dir} ${pt(P2)}`} fill="none" stroke={farbe} strokeWidth={b} strokeDasharray={strich} />;
}
function Linie({ p, q, o = 1, farbe = C.tinte, b = 2, anteil = 1, strich }) {
  if (o <= 0.001 || anteil <= 0.001) return null;
  const e = [mix(p[0], q[0], anteil), mix(p[1], q[1], anteil)];
  return <line x1={p[0]} y1={p[1]} x2={e[0]} y2={e[1]} stroke={farbe} strokeWidth={b} strokeLinecap="round" opacity={o} strokeDasharray={strich} />;
}
function Punkt({ p, name, dx = 0, dy = -10, o = 1, farbe = C.tinte }) {
  if (o <= 0.001) return null;
  return (
    <g opacity={o}>
      <circle cx={p[0]} cy={p[1]} r="3.6" fill={farbe} />
      {name && <T x={p[0] + dx} y={p[1] + dy} textAnchor="middle" fontSize="13" fontWeight="800" fill={farbe}>{name}</T>}
    </g>
  );
}
const mitte = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];

/* ======================================================================
   SZENE 1 · Kreis: u = π · d und A = πr²
   ====================================================================== */
const K_DAUER = 26;
const R = 48, KM = [180, 96];
const kSchritte = () => [
  { von: 0, text: zw("Jeder Kreis ist eine Vergrößerung jedes anderen. Darum ist das Verhältnis Umfang : Durchmesser bei allen Kreisen gleich – diese Zahl heißt π.", "Every circle is an enlargement of every other. So the ratio circumference : diameter is the same for all circles – this number is called π.") },
  { von: 4, text: zw("Wir wickeln den Umfang ab. Der Durchmesser passt gut dreimal hinein – genauer 3,14159…-mal. Also u = π · d = 2πr.", "We unroll the circumference. The diameter fits into it a little more than three times – more precisely 3.14159… times. So u = π · d = 2πr.") },
  { von: 10, text: zw("Für die Fläche schneiden wir den Kreis in 12 gleiche Tortenstücke.", "For the area we cut the circle into 12 equal slices.") },
  { von: 13.5, text: zw("Abwechselnd mit der Spitze nach oben und nach unten gelegt, entsteht fast ein Rechteck. Je feiner die Stücke, desto genauer.", "Laid alternately with the tip up and down, they almost form a rectangle. The finer the slices, the more exact.") },
  { von: 19, text: zw("Oben und unten liegt je der halbe Umfang: Die Breite ist π · r. Die Höhe ist der Radius r. Also A = π · r · r = πr².", "Half the circumference lies along the top and along the bottom: the width is π · r. The height is the radius r. So A = π · r · r = πr².") },
];
function sektorPfad(r) {
  const a = 15 * GRAD;
  return `M0,0 L${(r * Math.cos(-a)).toFixed(2)},${(r * Math.sin(-a)).toFixed(2)} A${r} ${r} 0 0 1 ${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)} Z`;
}
const SEKTOR = sektorPfad(R);
/* 12 Stücke: obere Hälfte (Spitze nach oben im Rechteck) und untere Hälfte (Spitze nach unten) */
const STUECKE = Array.from({ length: 12 }, (_, i) => {
  const oben = i < 6;
  const j = oben ? i : 11 - i;                        // Reihenfolge von links nach rechts
  const start = oben ? -165 + i * 30 : 15 + (i - 6) * 30;
  const bb = (Math.PI * R) / 6;                        // Bogenbreite eines Stücks
  const x0 = 180 - (Math.PI * R) / 2 + bb / 4, yb = 214;
  const ziel = oben ? { p: [x0 + j * bb, yb], w: -90 } : { p: [x0 + (j + 0.5) * bb, yb - R], w: 90 };
  return { i, oben, start, ziel };
});
function kZeichne(t) {
  const kreisO = 1 - lauf(t, 10.2, 10.8);
  const ab = lauf(t, 4.4, 8.6);
  const L = Math.PI * 2 * R;
  const x0 = 180 - L / 2, y = 206;
  const stuecke = lauf(t, 10.2, 11);
  const leg = lauf(t, 14, 18);
  const mass = lauf(t, 19.4, 20.4);
  return (
    <g>
      {/* Kreis mit Radius und Durchmesser */}
      <g opacity={kreisO}>
        <circle cx={KM[0]} cy={KM[1]} r={R} fill={`${C.see}10`} stroke={C.see} strokeWidth="2.4" pathLength="1" strokeDasharray="1" strokeDashoffset={ab > 0 ? ab : 1 - lauf(t, 0.2, 1.6)} />
        <Linie p={KM} q={[KM[0] + R, KM[1]]} anteil={lauf(t, 1.6, 2.4)} farbe={C.tinte} />
        <T x={KM[0] + R / 2} y={KM[1] - 6} textAnchor="middle" fontSize="13" fontWeight="800" fill={C.tinte} opacity={lauf(t, 2.2, 2.6)}>r</T>
        <Linie p={[KM[0] - R, KM[1]]} q={[KM[0] + R, KM[1]]} anteil={lauf(t, 2.6, 3.4)} farbe={C.gruen} strich="5 4" b={1.8} />
        <T x={KM[0] - R / 2} y={KM[1] + 16} textAnchor="middle" fontSize="13" fontWeight="800" fill={C.gruenDunkel} opacity={lauf(t, 3.2, 3.6)}>d</T>
      </g>
      {/* abgewickelter Umfang */}
      <g opacity={fenster(t, 4.2, 4.6, 9.8, 10.4)}>
        <line x1={x0} y1={y} x2={x0 + L * ab} y2={y} stroke={C.see} strokeWidth="3" strokeLinecap="round" />
        {[0, 1, 2].map((k) => (
          <g key={k} opacity={lauf(t, 6.6 + k * 0.5, 7 + k * 0.5)}>
            <line x1={x0 + 2 * R * k} y1={y + 10} x2={x0 + 2 * R * (k + 1)} y2={y + 10} stroke={C.gruen} strokeWidth="2" />
            <line x1={x0 + 2 * R * (k + 1)} y1={y + 5} x2={x0 + 2 * R * (k + 1)} y2={y + 15} stroke={C.gruen} strokeWidth="2" />
            <T x={x0 + 2 * R * (k + 0.5)} y={y + 28} textAnchor="middle" fontSize="12" fontWeight="800" fill={C.gruenDunkel}>d</T>
          </g>
        ))}
        <T x={x0 + 6 * R + (L - 6 * R) / 2} y={y + 28} textAnchor="middle" fontSize="11" fontWeight="800" fill={C.signal} opacity={lauf(t, 8.2, 8.6)}>0,14 d</T>
      </g>
      <Pille y={30} text={zw("u = π · d = 2πr", "u = π · d = 2πr")} o={fenster(t, 8.4, 9, 9.8, 10.2)} farbe={C.see} />
      {/* Tortenstücke */}
      {stuecke > 0.001 && STUECKE.map((s) => {
        const p = [mix(KM[0], s.ziel.p[0], leg), mix(KM[1], s.ziel.p[1], leg)];
        const w = mix(s.start, s.ziel.w, leg);
        return <path key={s.i} d={SEKTOR} transform={`translate(${p[0].toFixed(1)} ${p[1].toFixed(1)}) rotate(${w.toFixed(1)})`} opacity={stuecke}
          fill={s.oben ? `${C.flaggold}AA` : `${C.see}55`} stroke={C.weiss} strokeWidth="1" />;
      })}
      {/* Maße am Rechteck */}
      <g opacity={mass}>
        <line x1={180 - (Math.PI * R) / 2} y1={214 - R - 12} x2={180 + (Math.PI * R) / 2} y2={214 - R - 12} stroke={C.gruenDunkel} strokeWidth="1.6" />
        <T x="180" y={214 - R - 18} textAnchor="middle" fontSize="13" fontWeight="800" fill={C.gruenDunkel}>{zw("π · r (halber Umfang)", "π · r (half the circumference)")}</T>
        <line x1={180 + (Math.PI * R) / 2 + 22} y1={214} x2={180 + (Math.PI * R) / 2 + 22} y2={214 - R} stroke={C.tinte} strokeWidth="1.6" />
        <T x={180 + (Math.PI * R) / 2 + 32} y={214 - R / 2 + 4} fontSize="13" fontWeight="800" fill={C.tinte}>r</T>
      </g>
      <Pille y={36} text="A = π · r · r = πr²" o={lauf(t, 21, 21.8)} farbe={C.see} />
    </g>
  );
}

/* ======================================================================
   SZENE 2 · Körper: V = G · h, ⅓ bei Spitzkörpern, Kugel
   ====================================================================== */
const Kp_DAUER = 28;
const DX = 30, DY = -20;
const kpSchritte = () => [
  { von: 0, text: zw("Gerade Körper wie Prisma und Quader: Die Grundfläche G wird Schicht für Schicht bis zur Höhe h gestapelt. Darum gilt V = G · h.", "Straight solids like prisms and cuboids: the base area G is stacked layer by layer up to the height h. That is why V = G · h.") },
  { von: 5.5, text: zw("Beim Zylinder genauso – nur ist die Grundfläche ein Kreis: G = πr², also V = πr² · h.", "Same for the cylinder – only the base is a circle: G = πr², so V = πr² · h.") },
  { von: 10, text: zw("Spitze Körper: Eine Pyramide mit derselben Grundfläche und Höhe wird mit Wasser gefüllt und ins Prisma gegossen. Es passt genau dreimal hinein – die Pyramide hat ein Drittel des Volumens: V = ⅓ · G · h.", "Pointed solids: a pyramid with the same base and height is filled with water and poured into the prism. It fits in exactly three times – the pyramid has a third of the volume: V = ⅓ · G · h.") },
  { von: 17.5, text: zw("Beim Kegel im Zylinder genauso: V = ⅓ · πr² · h.", "Same for the cone in the cylinder: V = ⅓ · πr² · h.") },
  { von: 21.5, text: zw("Und die Kugel? Archimedes fand: Sie füllt genau zwei Drittel des Zylinders, der sie umschließt (Höhe 2r). V = ⅔ · πr² · 2r = 4/3 · πr³.", "And the sphere? Archimedes found: it fills exactly two thirds of the cylinder around it (height 2r). V = ⅔ · πr² · 2r = 4/3 · πr³.") },
];
/* Quader/Prisma in Schrägbild: vorn unten links bei (x, y), Breite w, Höhe h */
function Prisma({ x, y, w, h, o = 1, fuell = 0, schichten = 0 }) {
  if (o <= 0.001) return null;
  const V = [[x, y], [x + w, y], [x + w, y - h], [x, y - h]], H = V.map((p) => [p[0] + DX, p[1] + DY]);
  const lv = y - h * fuell;
  return (
    <g opacity={o}>
      <polygon points={[V[0], V[1], H[1], H[0]].map(pt).join(" ")} fill={`${C.see}18`} stroke="none" />
      {fuell > 0.001 && <g>
        <polygon points={[[x, y], [x + w, y], [x + w + DX, y + DY], [x + w + DX, lv + DY], [x + w, lv], [x, lv]].map(pt).join(" ")} fill={`${C.flaggold}80`} />
        <polygon points={[[x, lv], [x + w, lv], [x + w + DX, lv + DY], [x + DX, lv + DY]].map(pt).join(" ")} fill={`${C.flaggold}CC`} stroke={C.gruen} strokeWidth="1" />
      </g>}
      {Array.from({ length: 6 }, (_, i) => i).filter((i) => i < schichten * 6).map((i) => {
        const yy = y - (h * (i + 1)) / 6;
        return <polygon key={i} points={[[x, yy], [x + w, yy], [x + w + DX, yy + DY], [x + DX, yy + DY]].map(pt).join(" ")} fill={`${C.flaggold}44`} stroke={C.gruen} strokeWidth="1" />;
      })}
      <line x1={H[0][0]} y1={H[0][1]} x2={H[1][0]} y2={H[1][1]} stroke={C.hellgrau} strokeDasharray="4 3" />
      <line x1={H[0][0]} y1={H[0][1]} x2={H[3][0]} y2={H[3][1]} stroke={C.hellgrau} strokeDasharray="4 3" />
      <line x1={V[0][0]} y1={V[0][1]} x2={H[0][0]} y2={H[0][1]} stroke={C.hellgrau} strokeDasharray="4 3" />
      <polygon points={V.map(pt).join(" ")} fill="none" stroke={C.see} strokeWidth="2" />
      <polyline points={[V[1], H[1], H[2], H[3], V[3]].map(pt).join(" ")} fill="none" stroke={C.see} strokeWidth="2" />
      <line x1={V[2][0]} y1={V[2][1]} x2={H[2][0]} y2={H[2][1]} stroke={C.see} strokeWidth="2" />
    </g>
  );
}
function Pyramide({ x, y, w, h, o = 1, fuell = 0 }) {
  if (o <= 0.001) return null;
  const A = [x, y], B = [x + w, y], Cc = [x + w + DX, y + DY], D = [x + DX, y + DY];
  const S = [x + w / 2 + DX / 2, y + DY / 2 - h];
  return (
    <g opacity={o}>
      <polygon points={[A, B, S].map(pt).join(" ")} fill={fuell > 0.001 ? `${C.flaggold}${Math.round(0x30 + fuell * 0x70).toString(16)}` : `${C.see}12`} />
      <polygon points={[B, Cc, S].map(pt).join(" ")} fill={fuell > 0.001 ? `${C.flaggold}${Math.round(0x20 + fuell * 0x50).toString(16)}` : `${C.see}0C`} />
      <line x1={A[0]} y1={A[1]} x2={D[0]} y2={D[1]} stroke={C.hellgrau} strokeDasharray="4 3" />
      <line x1={D[0]} y1={D[1]} x2={Cc[0]} y2={Cc[1]} stroke={C.hellgrau} strokeDasharray="4 3" />
      <line x1={D[0]} y1={D[1]} x2={S[0]} y2={S[1]} stroke={C.hellgrau} strokeDasharray="4 3" />
      <polyline points={[A, B, Cc].map(pt).join(" ")} fill="none" stroke={C.see} strokeWidth="2" />
      {[A, B, Cc].map((p, i) => <line key={i} x1={p[0]} y1={p[1]} x2={S[0]} y2={S[1]} stroke={C.see} strokeWidth="2" />)}
    </g>
  );
}
/* Zylinder: Mitte der Grundfläche bei (cx, y), Radius rx (Ellipse rx × ry), Höhe h */
function Zylinder({ cx, y, rx, h, o = 1, fuell = 0, schichten = 0 }) {
  if (o <= 0.001) return null;
  const ry = rx * 0.3, lv = y - h * fuell;
  return (
    <g opacity={o}>
      <path d={`M${cx - rx},${y} L${cx - rx},${y - h} A${rx} ${ry} 0 0 0 ${cx + rx},${y - h} L${cx + rx},${y} A${rx} ${ry} 0 0 1 ${cx - rx},${y} Z`} fill={`${C.see}12`} />
      {fuell > 0.001 && <g>
        <path d={`M${cx - rx},${y} L${cx - rx},${lv} A${rx} ${ry} 0 0 0 ${cx + rx},${lv} L${cx + rx},${y} A${rx} ${ry} 0 0 1 ${cx - rx},${y} Z`} fill={`${C.flaggold}80`} />
        <ellipse cx={cx} cy={lv} rx={rx} ry={ry} fill={`${C.flaggold}CC`} stroke={C.gruen} strokeWidth="1" />
      </g>}
      {Array.from({ length: 6 }, (_, i) => i).filter((i) => i < schichten * 6).map((i) => <ellipse key={i} cx={cx} cy={y - (h * (i + 1)) / 6} rx={rx} ry={ry} fill={`${C.flaggold}40`} stroke={C.gruen} strokeWidth="1" />)}
      <path d={`M${cx - rx},${y} A${rx} ${ry} 0 0 1 ${cx + rx},${y}`} fill="none" stroke={C.hellgrau} strokeDasharray="4 3" />
      <path d={`M${cx - rx},${y} A${rx} ${ry} 0 0 0 ${cx + rx},${y}`} fill="none" stroke={C.see} strokeWidth="2" />
      <line x1={cx - rx} y1={y} x2={cx - rx} y2={y - h} stroke={C.see} strokeWidth="2" />
      <line x1={cx + rx} y1={y} x2={cx + rx} y2={y - h} stroke={C.see} strokeWidth="2" />
      <ellipse cx={cx} cy={y - h} rx={rx} ry={ry} fill="none" stroke={C.see} strokeWidth="2" />
    </g>
  );
}
function Kegel({ cx, y, rx, h, o = 1, fuell = 0 }) {
  if (o <= 0.001) return null;
  const ry = rx * 0.3;
  return (
    <g opacity={o}>
      <path d={`M${cx - rx},${y} L${cx},${y - h} L${cx + rx},${y} A${rx} ${ry} 0 0 1 ${cx - rx},${y} Z`} fill={fuell > 0.001 ? `${C.flaggold}${Math.round(0x30 + fuell * 0x70).toString(16)}` : `${C.see}12`} />
      <path d={`M${cx - rx},${y} A${rx} ${ry} 0 0 1 ${cx + rx},${y}`} fill="none" stroke={C.hellgrau} strokeDasharray="4 3" />
      <path d={`M${cx - rx},${y} A${rx} ${ry} 0 0 0 ${cx + rx},${y}`} fill="none" stroke={C.see} strokeWidth="2" />
      <polyline points={`${cx - rx},${y} ${cx},${y - h} ${cx + rx},${y}`} fill="none" stroke={C.see} strokeWidth="2" />
    </g>
  );
}
/* Dreimal umgießen zwischen a und b: Füllstand des Zielkörpers und der Quelle */
function umgiessen(t, a, b) {
  const d = (b - a) / 3;
  let ziel = 0, quelle = 1;
  for (let i = 0; i < 3; i++) {
    const s = a + i * d, f = lauf(t, s + d * 0.25, s + d * 0.85);
    if (t >= s) { ziel = (i + f) / 3; quelle = 1 - f; }
    if (t >= s + d * 0.9 && i < 2) quelle = lauf(t, s + d * 0.9, s + d);
  }
  if (t >= b) { ziel = 1; quelle = 0; }
  return { ziel, quelle };
}
function kpZeichne(t) {
  const prisma1 = fenster(t, 0.2, 0.8, 5.2, 5.8), zyl1 = fenster(t, 5.6, 6.2, 9.6, 10.2);
  const paar1 = fenster(t, 10, 10.6, 17.2, 17.8), paar2 = fenster(t, 17.6, 18.2, 21.2, 21.8), kugel = lauf(t, 21.6, 22.4);
  const g1 = umgiessen(t, 11, 17), g2 = umgiessen(t, 18.2, 21);
  const R2 = 52;
  return (
    <g>
      <Prisma x={110} y={210} w={110} h={130} o={prisma1} schichten={lauf(t, 0.8, 4.2)} />
      <Pille y={28} text="V = G · h" o={fenster(t, 3.4, 4, 5.2, 5.6)} />
      <Zylinder cx={180} y={210} rx={60} h={130} o={zyl1} schichten={lauf(t, 6.2, 8.8)} />
      <Pille y={28} text="V = πr² · h" o={fenster(t, 8, 8.6, 9.6, 10)} />
      <g opacity={paar1}>
        <Pyramide x={24} y={212} w={100} h={120} fuell={g1.quelle} />
        <Prisma x={196} y={212} w={100} h={120} fuell={g1.ziel} />
        {[1, 2].map((k) => <line key={k} x1={192} x2={300 + DX} y1={212 - (120 * k) / 3} y2={212 - (120 * k) / 3 + DY / 2} stroke={C.gruenDunkel} strokeWidth="0.8" strokeDasharray="2 3" />)}
      </g>
      <Pille y={28} text="V = ⅓ · G · h" o={fenster(t, 16.4, 17, 17.2, 17.6)} />
      <g opacity={paar2}>
        <Kegel cx={86} y={212} rx={52} h={130} fuell={g2.quelle} />
        <Zylinder cx={258} y={212} rx={52} h={130} fuell={g2.ziel} />
      </g>
      <Pille y={28} text="V = ⅓ · πr² · h" o={fenster(t, 20.4, 20.9, 21.2, 21.6)} />
      <g opacity={kugel}>
        <Zylinder cx={180} y={214} rx={R2} h={2 * R2} fuell={lauf(t, 23, 25) * (2 / 3)} />
        <circle cx={180} cy={214 - R2} r={R2} fill={`${C.see}22`} stroke={C.see} strokeWidth="2" />
        <ellipse cx={180} cy={214 - R2} rx={R2} ry={R2 * 0.3} fill="none" stroke={C.see} strokeWidth="1.2" strokeDasharray="4 3" />
        <line x1={180} y1={214 - R2} x2={180 + R2} y2={214 - R2} stroke={C.tinte} strokeWidth="1.6" />
        <T x={180 + R2 / 2} y={214 - R2 - 5} textAnchor="middle" fontSize="12" fontWeight="800" fill={C.tinte}>r</T>
        <T x={180 + R2 + 22} y={214 - R2 + 4} fontSize="12" fontWeight="800" fill={C.tinte}>2r</T>
      </g>
      <Pille y={28} text="V = ⅔ · πr² · 2r = 4/3 · πr³" o={lauf(t, 24.6, 25.4)} breite={250} />
    </g>
  );
}

/* ======================================================================
   SZENE 3 · Kongruenz: genau ein Dreieck?
   ====================================================================== */
const KG_DAUER = 27;
const KA = [70, 205], KB = [220, 205];               // c = 5 cm (30 px pro cm)
const kgSchritte = () => [
  { von: 0, text: zw("SSS: c = 5 cm, b = 4 cm, a = 3,5 cm. Um A schlagen wir einen Kreis mit Radius b, um B einen mit Radius a. Oberhalb von AB schneiden sie sich in genau einem Punkt C – das Dreieck ist eindeutig.", "SSS: c = 5 cm, b = 4 cm, a = 3.5 cm. Around A we draw a circle with radius b, around B one with radius a. Above AB they meet in exactly one point C – the triangle is unique.") },
  { von: 6.5, text: zw("SWS: c = 5 cm, α = 55° und b = 4 cm. Der Winkel liegt zwischen den beiden Seiten. Auf dem freien Schenkel tragen wir b ab – C liegt fest.", "SAS: c = 5 cm, α = 55° and b = 4 cm. The angle lies between the two sides. We mark b on the free arm – C is fixed.") },
  { von: 11.5, text: zw("WSW: c = 5 cm, α = 50° und β = 60°. Die beiden freien Schenkel schneiden sich in genau einem Punkt C.", "ASA: c = 5 cm, α = 50° and β = 60°. The two free arms meet in exactly one point C.") },
  { von: 16.5, text: zw("SsW: c = 5 cm, α = 40° und a = 6 cm. Der Kreis um B mit Radius a trifft den Schenkel nur einmal – weil a die größere Seite ist, die dem Winkel gegenüberliegt.", "SsA: c = 5 cm, α = 40° and a = 6 cm. The circle around B with radius a meets the arm only once – because a is the larger side opposite the angle.") },
  { von: 21.5, text: zw("Ist die Gegenseite kleiner (a = 3,5 cm), schneidet der Kreis den Schenkel zweimal: Zwei verschiedene Dreiecke passen. Ohne „größere Seite“ ist das Dreieck nicht eindeutig.", "If the opposite side is smaller (a = 3.5 cm), the circle meets the arm twice: two different triangles fit. Without the “larger side” the triangle is not unique.") },
];
const strahl = (P, w, l) => [P[0] + l * Math.cos(w * GRAD), P[1] - l * Math.sin(w * GRAD)];
function Dreieck({ C3, o, farbe = C.see, fuell = true }) {
  if (o <= 0.001) return null;
  return <polygon points={[KA, KB, C3].map(pt).join(" ")} fill={fuell ? `${farbe}22` : "none"} stroke={farbe} strokeWidth="2.4" strokeLinejoin="round" opacity={o} />;
}
function WinkelBogen({ P, von, bis, r = 24, o, text, farbe = C.gruen }) {
  if (o <= 0.001) return null;
  const a = (w) => [P[0] + r * Math.cos(w * GRAD), P[1] - r * Math.sin(w * GRAD)];
  const m = (von + bis) / 2, tp = [P[0] + (r + 14) * Math.cos(m * GRAD), P[1] - (r + 14) * Math.sin(m * GRAD) + 4];
  return (
    <g opacity={o}>
      <path d={`M${pt(P)} L${pt(a(von))} A${r} ${r} 0 0 0 ${pt(a(bis))} Z`} fill={`${farbe}33`} stroke={farbe} strokeWidth="1.4" />
      {text && <T x={tp[0]} y={tp[1]} textAnchor="middle" fontSize="11.5" fontWeight="800" fill={C.gruenDunkel}>{text}</T>}
    </g>
  );
}
function kgZeichne(t) {
  /* SSS */
  const sss = fenster(t, 0, 0.4, 6, 6.6);
  const Csss = [156.25, 121.6];
  const wA = Math.atan2(Csss[1] - KA[1], Csss[0] - KA[0]) / GRAD, wB = Math.atan2(Csss[1] - KB[1], Csss[0] - KB[0]) / GRAD;
  /* SWS */
  const sws = fenster(t, 6.6, 7, 11, 11.6), Csws = strahl(KA, 55, 120);
  /* WSW */
  const wsw = fenster(t, 11.6, 12, 16, 16.6), Cwsw = [158.8, 99.1];
  /* SsW groß / klein */
  const ssw = lauf(t, 16.6, 17), groß = 1 - lauf(t, 21.4, 21.9), klein = lauf(t, 21.8, 22.3);
  const C1 = [274.4, 33.4], Ck1 = [126.2, 157.9], Ck2 = [189.9, 104.4];
  return (
    <g>
      <Linie p={KA} q={KB} b={2.6} farbe={C.tinte} />
      <Punkt p={KA} name="A" dx={-10} dy={16} />
      <Punkt p={KB} name="B" dx={10} dy={16} />
      <T x={(KA[0] + KB[0]) / 2} y={KA[1] + 18} textAnchor="middle" fontSize="12" fontWeight="700" fill={C.grau}>c = 5 cm</T>
      {/* SSS */}
      <g opacity={sss}>
        <Bogen m={KA} r={120} a1={wA + 25} a2={wA - 25} p={lauf(t, 0.8, 2.2)} farbe={C.gruen} strich="5 4" />
        <Bogen m={KB} r={105} a1={wB - 25} a2={wB + 25} p={lauf(t, 2.2, 3.6)} farbe={C.see} strich="5 4" />
        <Dreieck C3={Csss} o={lauf(t, 4, 4.8)} />
        <Punkt p={Csss} name="C" o={lauf(t, 3.6, 4)} />
        <T x={(KA[0] + Csss[0]) / 2 - 16} y={(KA[1] + Csss[1]) / 2} fontSize="12" fontWeight="800" fill={C.gruenDunkel} opacity={lauf(t, 1.4, 1.8)}>b</T>
        <T x={(KB[0] + Csss[0]) / 2 + 10} y={(KB[1] + Csss[1]) / 2} fontSize="12" fontWeight="800" fill={C.see} opacity={lauf(t, 2.8, 3.2)}>a</T>
      </g>
      <Pille y={30} text={zw("SSS: eindeutig", "SSS: unique")} o={fenster(t, 4.6, 5.2, 6, 6.4)} />
      {/* SWS */}
      <g opacity={sws}>
        <WinkelBogen P={KA} von={0} bis={55} o={lauf(t, 7, 7.6)} text="55°" />
        <Linie p={KA} q={strahl(KA, 55, 180)} anteil={lauf(t, 7.4, 8.4)} farbe={C.hellgrau} b={1.6} />
        <Linie p={KA} q={Csws} anteil={lauf(t, 8.4, 9.2)} farbe={C.gruen} b={3} />
        <Dreieck C3={Csws} o={lauf(t, 9.4, 10)} />
        <Punkt p={Csws} name="C" o={lauf(t, 9.2, 9.6)} />
      </g>
      <Pille y={30} text={zw("SWS: eindeutig", "SAS: unique")} o={fenster(t, 9.8, 10.4, 11, 11.4)} />
      {/* WSW */}
      <g opacity={wsw}>
        <WinkelBogen P={KA} von={0} bis={50} o={lauf(t, 12, 12.6)} text="50°" />
        <WinkelBogen P={KB} von={120} bis={180} o={lauf(t, 12.4, 13)} text="60°" farbe={C.see} />
        <Linie p={KA} q={strahl(KA, 50, 190)} anteil={lauf(t, 12.8, 13.8)} farbe={C.hellgrau} b={1.6} />
        <Linie p={KB} q={strahl(KB, 120, 170)} anteil={lauf(t, 13.2, 14.2)} farbe={C.hellgrau} b={1.6} />
        <Dreieck C3={Cwsw} o={lauf(t, 14.4, 15)} />
        <Punkt p={Cwsw} name="C" o={lauf(t, 14.2, 14.6)} />
      </g>
      <Pille y={30} text={zw("WSW: eindeutig", "ASA: unique")} o={fenster(t, 14.8, 15.4, 16, 16.4)} />
      {/* SsW */}
      <g opacity={ssw}>
        <WinkelBogen P={KA} von={0} bis={40} o={1} text="40°" />
        <Linie p={KA} q={strahl(KA, 40, 290)} anteil={lauf(t, 17, 18)} farbe={C.hellgrau} b={1.6} />
        <g opacity={groß}>
          <Bogen m={KB} r={180} a1={-160} a2={-50} p={lauf(t, 18, 19.4)} farbe={C.see} strich="5 4" />
          <Dreieck C3={C1} o={lauf(t, 19.6, 20.2)} />
          <Punkt p={C1} name="C" dx={12} dy={4} o={lauf(t, 19.4, 19.8)} />
        </g>
        <g opacity={klein}>
          <Bogen m={KB} r={105} a1={-175} a2={-80} p={lauf(t, 22.2, 23.4)} farbe={C.signal} strich="5 4" />
          <Dreieck C3={Ck1} o={lauf(t, 23.6, 24.2)} farbe={C.signal} />
          <Dreieck C3={Ck2} o={lauf(t, 24.2, 24.8)} farbe={C.see} fuell={false} />
          <Punkt p={Ck1} name="C₁" dx={-12} dy={-6} o={lauf(t, 23.4, 23.8)} farbe={C.signal} />
          <Punkt p={Ck2} name="C₂" dy={-10} o={lauf(t, 23.4, 23.8)} />
        </g>
      </g>
      <Pille y={30} text={zw("SsW: eindeutig", "SsA: unique")} o={fenster(t, 20, 20.6, 21.2, 21.6)} />
      <Pille y={30} text={zw("zwei Dreiecke – nicht eindeutig", "two triangles – not unique")} o={lauf(t, 24.8, 25.4)} farbe={C.signal} breite={250} />
    </g>
  );
}

/* ======================================================================
   SZENE 4 · Strahlensätze
   ====================================================================== */
const S_DAUER = 25;
const S = [36, 206], W1 = 34, W2 = 9, SA0 = 90, SB0 = 108;   // SA = 3, SB = 3,6 (Einheit 30 px)
const sSchritte = () => [
  { von: 0, text: zw("Zwei Strahlen mit gemeinsamem Anfangspunkt S. Auf ihnen liegen A und B.", "Two rays with a common starting point S. On them lie A and B.") },
  { von: 3.5, text: zw("Zentrische Streckung mit Faktor k = 2: Jeder Punkt wandert auf seinem Strahl doppelt so weit weg von S. Aus A wird A′, aus B wird B′ – und A′B′ ist parallel zu AB.", "Central dilation with factor k = 2: every point moves along its ray twice as far from S. A becomes A′, B becomes B′ – and A′B′ is parallel to AB.") },
  { von: 9, text: zw("1. Strahlensatz: Auf beiden Strahlen ist das Verhältnis gleich, nämlich k: SA′ : SA = SB′ : SB = 2.", "1st intercept theorem: on both rays the ratio is the same, namely k: SA′ : SA = SB′ : SB = 2.") },
  { von: 14, text: zw("2. Strahlensatz: Auch die Parallelen werden mit k gestreckt: A′B′ : AB = SA′ : SA = 2. Die äußere Parallele ist doppelt so lang wie die innere.", "2nd intercept theorem: the parallels are stretched by k as well: A′B′ : AB = SA′ : SA = 2. The outer parallel is twice as long as the inner one.") },
  { von: 19, text: zw("Die Falle: Beim 2. Strahlensatz zählen nur Strecken ab S. Das Stück AA′ = 3 gehört nicht dazu: A′B′ : AB = 2, aber AA′ : SA = 1.", "The trap: in the 2nd theorem only segments from S count. The piece AA′ = 3 does not: A′B′ : AB = 2, but AA′ : SA = 1.") },
];
function sZeichne(t) {
  const k = 1 + lauf(t, 4.2, 7.6);
  const A = strahl(S, W1, SA0), B = strahl(S, W2, SB0), A2 = strahl(S, W1, SA0 * k), B2 = strahl(S, W2, SB0 * k);
  const ab = Math.round((Math.hypot(A[0] - B[0], A[1] - B[1]) / 30) * 10) / 10;   /* auf eine Stelle, A′B′ = 2 · AB exakt */
  const zeigeS = lauf(t, 9.2, 10), zeigeP = lauf(t, 14.2, 15), falle = lauf(t, 19.2, 20);
  return (
    <g>
      <Linie p={S} q={strahl(S, W1, 300)} anteil={lauf(t, 0.2, 1.4)} farbe={C.hellgrau} b={1.6} />
      <Linie p={S} q={strahl(S, W2, 318)} anteil={lauf(t, 0.4, 1.6)} farbe={C.hellgrau} b={1.6} />
      <Punkt p={S} name="S" dx={-10} dy={4} />
      {/* SA, SB auf den Strahlen hervorgehoben */}
      <Linie p={S} q={A2} farbe={C.gruen} b={4} o={0.55 * zeigeS * (1 - falle)} />
      <Linie p={S} q={B2} farbe={C.see} b={4} o={0.45 * zeigeS * (1 - falle)} />
      <Linie p={A} q={A2} farbe={C.signal} b={4.5} o={0.7 * falle} />
      <Linie p={A} q={B} farbe={C.tinte} b={2.4} o={lauf(t, 1.6, 2.4)} />
      <Linie p={A2} q={B2} farbe={C.see} b={2.6} o={lauf(t, 4.6, 5.4)} />
      <Punkt p={A} name="A" dx={-8} dy={-8} o={lauf(t, 1.2, 1.6)} />
      <Punkt p={B} name="B" dx={4} dy={16} o={lauf(t, 1.2, 1.6)} />
      <Punkt p={A2} name="A′" dx={-10} dy={-8} o={lauf(t, 4.6, 5)} farbe={C.see} />
      <Punkt p={B2} name="B′" dx={6} dy={16} o={lauf(t, 4.6, 5)} farbe={C.see} />
      <Pille y={30} x={70} text={`k = ${String(Math.round(k * 10) / 10).replace(".", ",")}`} o={fenster(t, 4, 4.4, 8.6, 9)} farbe={C.see} />
      <g opacity={zeigeS * (1 - falle)}>
        <T x="14" y="30" textAnchor="start" fontSize="13" fontWeight="800" fill={C.gruenDunkel}>SA′ : SA = 6 : 3 = 2</T>
        <T x="14" y="50" textAnchor="start" fontSize="13" fontWeight="800" fill={C.see}>SB′ : SB = 7,2 : 3,6 = 2</T>
      </g>
      <g opacity={zeigeP * (1 - falle)}>
        <T x={mitte(A, B)[0] + 14} y={mitte(A, B)[1] + 2} fontSize="12" fontWeight="800" fill={C.tinte}>{String(ab).replace(".", ",")}</T>
        <T x={mitte(A2, B2)[0] + 14} y={mitte(A2, B2)[1] + 2} fontSize="12" fontWeight="800" fill={C.see}>{String(Math.round(ab * 20) / 10).replace(".", ",")}</T>
        <T x="14" y="72" textAnchor="start" fontSize="13" fontWeight="800" fill={C.tinte}>{`A′B′ : AB = ${String(Math.round(ab * 20) / 10).replace(".", ",")} : ${String(ab).replace(".", ",")} = 2`}</T>
      </g>
      <g opacity={falle}>
        <T x={mitte(A, A2)[0] - 14} y={mitte(A, A2)[1] - 6} textAnchor="end" fontSize="12" fontWeight="800" fill={C.signal}>AA′ = 3</T>
        <T x="14" y="30" textAnchor="start" fontSize="13" fontWeight="800" fill={C.signal}>{zw("AA′ : SA = 3 : 3 = 1 ≠ 2", "AA′ : SA = 3 : 3 = 1 ≠ 2")}</T>
        <T x="14" y="50" textAnchor="start" fontSize="12.5" fontWeight="700" fill={C.grau}>{zw("2. Strahlensatz: immer ab S messen", "2nd theorem: always measure from S")}</T>
      </g>
    </g>
  );
}

export const GEO_ANIM = {
  kreis: { titel: () => zw("Warum u = 2πr und A = πr²?", "Why u = 2πr and A = πr²?"), unter: () => zw("Umfang abwickeln, Tortenstücke zum Rechteck legen", "Unroll the circumference, rearrange slices into a rectangle"),
    szene: () => ({ dauer: K_DAUER, hoehe: 250, schritte: kSchritte(), zeichne: kZeichne,
      beschreibung: zw("Animation: Der Kreisumfang wird abgewickelt und ist gut dreimal so lang wie der Durchmesser (π · d). Zwölf Tortenstücke werden abwechselnd zu einem Rechteck der Breite πr und Höhe r gelegt: A = πr².", "Animation: the circumference is unrolled and is a little more than three times the diameter (π · d). Twelve slices are laid alternately into a rectangle of width πr and height r: A = πr².") }) },
  koerper: { titel: () => zw("Volumen: stapeln, umgießen, Archimedes", "Volume: stacking, pouring, Archimedes"), unter: () => zw("V = G · h, der Faktor ⅓ und die Kugel", "V = G · h, the factor ⅓ and the sphere"),
    szene: () => ({ dauer: Kp_DAUER, hoehe: 240, schritte: kpSchritte(), zeichne: kpZeichne,
      beschreibung: zw("Animation: Grundflächen werden zu Prisma und Zylinder gestapelt (V = G · h). Eine Pyramide bzw. ein Kegel wird dreimal in Prisma bzw. Zylinder umgegossen (⅓). Die Kugel füllt zwei Drittel des umschließenden Zylinders: V = 4/3 πr³.", "Animation: base areas are stacked into a prism and a cylinder (V = G · h). A pyramid and a cone are poured three times into the prism and cylinder (⅓). The sphere fills two thirds of the surrounding cylinder: V = 4/3 πr³.") }) },
  kongruenz: { titel: () => zw("Drei Stücke – ein Dreieck?", "Three parts – one triangle?"), unter: () => zw("SSS, SWS, WSW, SsW mit Zirkel und Winkel", "SSS, SAS, ASA, SsA with compass and angle"),
    szene: () => ({ dauer: KG_DAUER, hoehe: 240, schritte: kgSchritte(), zeichne: kgZeichne,
      beschreibung: zw("Animation: Konstruktion von Dreiecken aus drei Stücken. Bei SSS, SWS, WSW und SsW (Winkel gegenüber der größeren Seite) entsteht genau ein Dreieck, bei kleinerer Gegenseite zwei.", "Animation: constructing triangles from three parts. SSS, SAS, ASA and SsA (angle opposite the larger side) give exactly one triangle; with a smaller opposite side, two.") }) },
  strahlen: { titel: () => zw("Zentrische Streckung und Strahlensätze", "Central dilation and intercept theorems"), unter: () => zw("Faktor k, 1. und 2. Strahlensatz, die AA′-Falle", "Factor k, 1st and 2nd theorem, the AA′ trap"),
    szene: () => ({ dauer: S_DAUER, hoehe: 240, schritte: sSchritte(), zeichne: sZeichne,
      beschreibung: zw("Animation: A und B werden von S aus mit k = 2 gestreckt. SA′ : SA = SB′ : SB = 2 und A′B′ : AB = 2, aber AA′ : SA = 1.", "Animation: A and B are dilated from S with k = 2. SA′ : SA = SB′ : SB = 2 and A′B′ : AB = 2, but AA′ : SA = 1.") }) },
};

export function GeoAnimation({ art, offen = false }) {
  return <AnimKarte szenen={GEO_ANIM} art={art} offen={offen} merkmal="data-geo-anim" />;
}
