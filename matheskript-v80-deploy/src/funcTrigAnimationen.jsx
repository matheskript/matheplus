/* ======================================================================
   funcTrigAnimationen.jsx – Erklärvideos (Motion) der Mittelstufen-Trigonometrie
   Gleicher Player wie die Erkläranimationen (Abspielen/Pause, Schritt-Knöpfe,
   Zeitleiste, Beschriftung je Schritt, „Bewegung reduzieren“ startet nichts):
     einheitskreis – Definition von sin α und cos α, Umlauf mit Sinuskurve
     bogenmass     – der Radius wird auf den Kreis gelegt: 1 rad, π, 2π
     dreieck       – Einheitskreis-Dreieck mit dem Faktor c strecken
     tangens       – Tangente bei (1|0), tan α = sin α / cos α, Steigung
     sinussatz     – Höhe h zweimal ausdrücken
     kosinussatz   – Höhe teilt c in p und c − p, zweimal Pythagoras
   Farben wie im ganzen Werkzeug: Sinus/Gegenkathete gold, Kosinus/Ankathete
   smaragd, Radius/Hypotenuse blau, Tangens lila.
   Keine base-Datei darf diese Datei importieren.
   ====================================================================== */
import React, { useEffect, useRef, useState } from "react";
import { C } from "./base1.jsx";
import { Player } from "./funcErklaeranimation.jsx";
import { zw } from "./ui2.jsx";

export const SIN = C.gruen, COS = C.smaragd, HYP = C.see, TAN = C.lila;

const klemm = (x, a, b) => Math.min(b, Math.max(a, x));
const weich = (p) => p * p * (3 - 2 * p);
const lauf = (t, a, b) => weich(klemm((t - a) / (b - a), 0, 1));
const lin = (t, a, b) => klemm((t - a) / (b - a), 0, 1);
const RAD = Math.PI / 180;
const komma = (v, st = 2) => {
  const r = Math.round(v * 10 ** st) / 10 ** st;
  return (Object.is(r, -0) ? "0" : String(r)).replace(".", ",").replace("-", "−");
};
const FONT = "Montserrat, system-ui, sans-serif";
const Tx = ({ children, ...p }) => <text fontFamily={FONT} fontWeight={700} {...p}>{children}</text>;

/* gestapelter Bruch in der Grafik: Mitte x, Bruchstrich auf Höhe y */
function Bruch({ x, y, oben, unten, farbe = C.tinte, gr = 13, opacity = 1 }) {
  const w = Math.max(String(oben).length, String(unten).length) * gr * 0.6 + 6;
  return (
    <g opacity={opacity}>
      <Tx x={x} y={y - 5} textAnchor="middle" fontSize={gr} fill={farbe}>{oben}</Tx>
      <line x1={x - w / 2} x2={x + w / 2} y1={y} y2={y} stroke={farbe} strokeWidth="1.3" />
      <Tx x={x} y={y + gr + 2} textAnchor="middle" fontSize={gr} fill={farbe}>{unten}</Tx>
    </g>
  );
}
const breite = (s, gr = 13) => String(s).length * gr * 0.6 + 6;

/* Kreisbogen um (cx, cy) von Winkel a bis b (Grad, gegen den Uhrzeigersinn, SVG-y nach unten) */
function bogenPfad(cx, cy, r, a, b) {
  const d = b - a;
  if (Math.abs(d) < 0.01) return "";
  if (Math.abs(d) >= 359.99) return `M${cx + r} ${cy} A${r} ${r} 0 1 0 ${cx - r} ${cy} A${r} ${r} 0 1 0 ${cx + r} ${cy}`;
  const p = (w) => [cx + r * Math.cos(w * RAD), cy - r * Math.sin(w * RAD)];
  const [x1, y1] = p(a), [x2, y2] = p(b);
  return `M${x1} ${y1} A${r} ${r} 0 ${Math.abs(d) > 180 ? 1 : 0} ${d > 0 ? 0 : 1} ${x2} ${y2}`;
}

/* Achsenkreuz mit Pfeilspitzen */
function Achsen({ ox, oy, x0, x1, y0, y1, opacity = 1 }) {
  return (
    <g opacity={opacity} stroke={C.hellgrau} strokeWidth="1.2">
      <line x1={x0} y1={oy} x2={x1} y2={oy} />
      <line x1={ox} y1={y1} x2={ox} y2={y0} />
      <path d={`M${x1} ${oy} l-6 -3.5 v7z`} fill={C.hellgrau} stroke="none" />
      <path d={`M${ox} ${y0} l-3.5 6 h7z`} fill={C.hellgrau} stroke="none" />
    </g>
  );
}

function rechterWinkel(x, y, dx, dy, g = 10, farbe = C.tinte) {
  /* Ecke bei (x, y), Schenkel in Richtung (dx, 0) und (0, dy) – dx, dy = ±1 */
  return <path d={`M${x + dx * g} ${y} L${x + dx * g} ${y + dy * g} L${x} ${y + dy * g}`} fill="none" stroke={farbe} strokeWidth="1.3" />;
}

/* ======================================================================
   1 · EINHEITSKREIS
   ====================================================================== */
const ek = () => [
  { von: 0, text: zw("Der Einheitskreis ist ein Kreis mit Radius 1 um den Ursprung. Ein Punkt P wandert auf ihm gegen den Uhrzeigersinn. α ist der Winkel zwischen der positiven x-Achse und dem Radius zu P.",
    "The unit circle is a circle of radius 1 around the origin. A point P moves around it anticlockwise. α is the angle between the positive x-axis and the radius to P.") },
  { von: 4.5, text: zw("Fällt man von P das Lot auf die x-Achse, entsteht ein rechtwinkliges Dreieck mit der Hypotenuse 1. Seine waagerechte Seite heißt cos α, seine senkrechte Seite sin α.",
    "Drop a perpendicular from P to the x-axis and you get a right triangle with hypotenuse 1. Its horizontal side is called cos α, its vertical side sin α.") },
  { von: 7.5, text: zw("Das ist die Definition: P hat die Koordinaten (cos α | sin α). Der Kosinus ist die x-Koordinate, der Sinus die y-Koordinate von P.",
    "That is the definition: P has the coordinates (cos α | sin α). Cosine is the x-coordinate, sine the y-coordinate of P.") },
  { von: 10, text: zw("Läuft P einmal ganz herum, gilt die Definition weiter. Links der y-Achse wird cos α negativ, unterhalb der x-Achse sin α. Rechts entsteht dabei die Sinuskurve: die Höhe von P, aufgetragen über α.",
    "As P goes all the way round, the definition still holds. Left of the y-axis cos α becomes negative, below the x-axis sin α does. On the right the sine curve appears: the height of P plotted against α.") },
  { von: 21, text: zw("Die Hypotenuse ist immer 1. Pythagoras liefert also sin²α + cos²α = 1. Und weil P den Kreis nie verlässt, liegen sin α und cos α immer zwischen −1 und 1.",
    "The hypotenuse is always 1, so Pythagoras gives sin²α + cos²α = 1. And since P never leaves the circle, sin α and cos α always lie between −1 and 1.") },
];

function ekZeichne(t) {
  const ox = 98, oy = 150, R = 76;
  const gx0 = 196, gw = 150;
  const kreis = lauf(t, 0, 1.6);
  /* Winkel über die Zeit */
  let a = 40 * lauf(t, 2.4, 4);
  if (t > 9.4) a = 40 * (1 - lauf(t, 9.4, 10.2));
  if (t > 10.4) a = 360 * lin(t, 10.4, 20);
  if (t > 20.3) a = 360 + 40 * lauf(t, 20.4, 21.4);
  const am = a >= 360 ? a - 360 : a;
  const P = [ox + R * Math.cos(am * RAD), oy - R * Math.sin(am * RAD)];
  const pAuf = lauf(t, 1.4, 2.3);
  const cosAuf = lauf(t, 4.6, 5.6), sinAuf = lauf(t, 5.4, 6.4), lab = lauf(t, 6, 7);
  const koord = lauf(t, 7.6, 8.6) * (1 - lauf(t, 9.4, 10));
  const graph = lauf(t, 9.8, 10.8);
  const lauft = t > 10.4 && t < 20.4;
  const pyth = lauf(t, 21.6, 22.6), grenze = lauf(t, 23.6, 24.6);
  const umfang = 2 * Math.PI * R;
  /* Sinuskurve bis zum aktuellen Winkel */
  const bis = t >= 20.3 ? 360 : t > 10.4 ? a : 0;
  const pts = [];
  for (let w = 0; w <= bis + 0.01; w += 3) pts.push(`${gx0 + (w / 360) * gw},${oy - R * Math.sin(w * RAD)}`);
  if (bis > 0) pts.push(`${gx0 + (bis / 360) * gw},${oy - R * Math.sin(bis * RAD)}`);
  const cosW = Math.cos(am * RAD), sinW = Math.sin(am * RAD);
  const fx = P[0];
  return (
    <g>
      <Achsen ox={ox} oy={oy} x0={ox - R - 14} x1={ox + R + 18} y0={oy - R - 18} y1={oy + R + 14} opacity={kreis} />
      <Tx x={ox + R + 14} y={oy + 16} fontSize="11" fill={C.hellgrau} opacity={kreis * (1 - graph)}>x</Tx>
      <Tx x={ox - 12} y={oy - R - 8} fontSize="11" fill={C.hellgrau} opacity={kreis}>y</Tx>
      <circle cx={ox} cy={oy} r={R} fill="none" stroke={HYP} strokeWidth="1.8" strokeDasharray={umfang} strokeDashoffset={umfang * (1 - kreis)} opacity="0.75" />
      <Tx x={ox + R + 3} y={oy + 14} fontSize="10.5" fill={C.grau} opacity={kreis * (1 - graph)}>1</Tx>
      <Tx x={ox + 4} y={oy - R - 4} fontSize="10.5" fill={C.grau} opacity={kreis * (1 - graph)}>1</Tx>

      {/* Sinuskurve rechts */}
      <g opacity={graph}>
        <line x1={gx0} y1={oy} x2={gx0 + gw + 8} y2={oy} stroke={C.hellgrau} strokeWidth="1" />
        <line x1={gx0} y1={oy - R - 8} x2={gx0} y2={oy + R + 8} stroke={C.hellgrau} strokeWidth="1" />
        {[90, 180, 270, 360].map((w) => (
          <g key={w}>
            <line x1={gx0 + (w / 360) * gw} x2={gx0 + (w / 360) * gw} y1={oy - 3} y2={oy + 3} stroke={C.hellgrau} />
            <Tx x={gx0 + (w / 360) * gw} y={oy + 15} textAnchor="middle" fontSize="9.5" fill={C.grau}>{w}°</Tx>
          </g>
        ))}
        <line x1={gx0 - 3} x2={gx0 + 3} y1={oy - R} y2={oy - R} stroke={C.hellgrau} />
        <line x1={gx0 - 3} x2={gx0 + 3} y1={oy + R} y2={oy + R} stroke={C.hellgrau} />
        <Tx x={gx0 - 6} y={oy - R + 4} textAnchor="end" fontSize="9.5" fill={C.grau}>1</Tx>
        <Tx x={gx0 - 6} y={oy + R + 4} textAnchor="end" fontSize="9.5" fill={C.grau}>−1</Tx>
        {pts.length > 1 && <polyline points={pts.join(" ")} fill="none" stroke={SIN} strokeWidth="2.6" strokeLinejoin="round" />}
        {lauft && <line x1={P[0]} y1={P[1]} x2={gx0 + (a / 360) * gw} y2={P[1]} stroke={SIN} strokeWidth="1" strokeDasharray="3 4" />}
        {lauft && <circle cx={gx0 + (a / 360) * gw} cy={P[1]} r="4" fill={SIN} />}
      </g>

      {/* Winkelbogen */}
      {am > 0.5 && pAuf > 0 && <path d={bogenPfad(ox, oy, 20, 0, am)} fill="none" stroke={C.tinte} strokeWidth="1.4" opacity={pAuf} />}
      {am > 12 && <Tx x={ox + 30 * Math.cos((am / 2) * RAD) + 2} y={oy - 30 * Math.sin((am / 2) * RAD) + 4} fontSize="12" fill={C.tinte} opacity={pAuf}>α</Tx>}

      {/* Dreieck: cos waagerecht, sin senkrecht */}
      <line x1={ox} y1={oy} x2={ox + (fx - ox) * cosAuf} y2={oy} stroke={COS} strokeWidth="4" strokeLinecap="round" opacity={cosAuf > 0 ? 1 : 0} />
      <line x1={fx} y1={oy} x2={fx} y2={oy + (P[1] - oy) * sinAuf} stroke={SIN} strokeWidth="4" strokeLinecap="round" opacity={sinAuf > 0 ? 1 : 0} />
      <line x1={ox} y1={oy} x2={P[0]} y2={P[1]} stroke={HYP} strokeWidth="2.4" strokeLinecap="round" opacity={pAuf} />
      {Math.abs(sinW) > 0.15 && Math.abs(cosW) > 0.15 && <g opacity={sinAuf}>{rechterWinkel(fx, oy, cosW > 0 ? -1 : 1, sinW > 0 ? -1 : 1, 8, C.tinte)}</g>}
      <g opacity={lab}>
        {Math.abs(cosW) > 0.25 && <Tx x={(ox + fx) / 2} y={sinW >= 0 ? oy + 16 : oy - 8} textAnchor="middle" fontSize="12" fill={COS}>cos α</Tx>}
        {Math.abs(sinW) > 0.25 && <Tx x={fx + (cosW >= 0 ? 6 : -6)} y={(oy + P[1]) / 2 + 4} textAnchor={cosW >= 0 ? "start" : "end"} fontSize="12" fill={SIN}>sin α</Tx>}
        {t < 10 && <Tx x={(ox + P[0]) / 2 - 8} y={(oy + P[1]) / 2 - 4} textAnchor="end" fontSize="12" fill={HYP}>1</Tx>}
      </g>
      <circle cx={P[0]} cy={P[1]} r="5" fill={C.seeTief} opacity={pAuf} />
      <Tx x={P[0] + (cosW >= 0 ? 8 : -8)} y={P[1] - 8} textAnchor={cosW >= 0 ? "start" : "end"} fontSize="13" fill={C.seeTief} opacity={pAuf}>P</Tx>
      <Tx x={P[0] + 8} y={P[1] - 24} fontSize="12" fill={C.seeTief} opacity={koord}>P(cos α | sin α)</Tx>

      {/* Werte während des Umlaufs */}
      <g opacity={graph}>
        <Tx x={14} y={20} fontSize="12" fill={C.tinte}>α = {Math.round(am)}°</Tx>
        <Tx x={96} y={20} fontSize="12" fill={COS}>cos α = {komma(cosW)}</Tx>
        <Tx x={218} y={20} fontSize="12" fill={SIN}>sin α = {komma(sinW)}</Tx>
      </g>

      <g opacity={pyth}>
        <rect x={60} y={252} width={240} height={28} rx="14" fill={C.weiss} stroke={C.linie} />
        <Tx x={180} y={271} textAnchor="middle" fontSize="14" fill={C.tinte}>sin²α + cos²α = 1</Tx>
      </g>
      <g opacity={grenze}>
        <line x1={gx0} x2={gx0 + gw} y1={oy - R} y2={oy - R} stroke={SIN} strokeDasharray="2 4" />
        <line x1={gx0} x2={gx0 + gw} y1={oy + R} y2={oy + R} stroke={SIN} strokeDasharray="2 4" />
        <Tx x={180} y={300} textAnchor="middle" fontSize="12.5" fill={C.grau}>−1 ≤ sin α ≤ 1  ·  −1 ≤ cos α ≤ 1</Tx>
      </g>
    </g>
  );
}

/* ======================================================================
   2 · GRAD- UND BOGENMASS
   ====================================================================== */
const bm = () => [
  { von: 0, text: zw("Ein Winkel misst, wie weit gedreht wurde. Im Gradmaß teilt man eine volle Drehung in 360 gleiche Teile – eine alte, ziemlich willkürliche Festlegung der Babylonier.",
    "An angle measures how far something has turned. In degrees a full turn is split into 360 equal parts – an old, rather arbitrary choice made by the Babylonians.") },
  { von: 5, text: zw("Das Bogenmaß misst dieselbe Drehung mit einer Länge: mit dem Bogen auf dem Einheitskreis. Dazu legen wir den Radius – Länge 1 – auf den Kreis.",
    "Radians measure the same turn by a length: the arc on the unit circle. So we lay the radius – length 1 – onto the circle.") },
  { von: 10, text: zw("Zum Bogen der Länge 1 gehört ein Winkel von etwa 57,3°. Er heißt 1 Radiant; im Bogenmaß schreibt man einfach x = 1.",
    "An arc of length 1 belongs to an angle of about 57.3°. It is called 1 radian; in radians you simply write x = 1.") },
  { von: 14, text: zw("Wie oft passt der Radius ganz herum? Der Umfang ist 2π · 1 ≈ 6,28. Also entsprechen 360° genau 2π und 180° genau π.",
    "How many radii fit all the way round? The circumference is 2π · 1 ≈ 6.28. So 360° is exactly 2π, and 180° is exactly π.") },
  { von: 20, text: zw("Daraus folgt x = α · π : 180°. Grad und Bogenmaß sind nur zwei Namen für dieselbe Drehung – P landet an derselben Stelle. Darum ist sin 30° = sin(π/6) = 0,5. Nur der Taschenrechner muss wissen, welche Sprache du sprichst: DEG oder RAD.",
    "Hence x = α · π / 180°. Degrees and radians are just two names for the same turn – P ends up in the same place. That's why sin 30° = sin(π/6) = 0.5. Only your calculator needs to know which language you speak: DEG or RAD.") },
];

function bmZeichne(t) {
  const ox = 120, oy = 158, R = 70;
  const kreis = lauf(t, 0, 1.4), ticks = lauf(t, 0.6, 2.2), voll = lauf(t, 2.2, 3.2) * (1 - lauf(t, 5, 5.6));
  const P = (w, r = R) => [ox + r * Math.cos(w), oy - r * Math.sin(w)];      // w im Bogenmaß
  const radiusAuf = lauf(t, 5.2, 6);
  const kipp = lauf(t, 6.2, 7.2);
  const wickel = lauf(t, 7.4, 9.6);
  const einRad = lauf(t, 10.2, 11.2) * (1 - lauf(t, 19.8, 20.6));
  const K = t < 14.3 ? 1 : 1 + (2 * Math.PI - 1) * lauf(t, 14.3, 18.6);
  const piLab = lauf(t, 18.4, 19.4);
  const schluss = lauf(t, 20.4, 21.6);
  const blass = 1 - 0.65 * schluss;
  /* gold: das Stück Radius, das gerade aufgewickelt wird */
  let gold = null;
  if (t >= 5.2 && t < 10.2) {
    if (wickel <= 0) {
      /* liegt zuerst auf dem Radius O→(1|0), kippt dann um (1|0) senkrecht nach oben */
      const phi = Math.PI - kipp * (Math.PI / 2);            // Richtung ab (1|0)
      const s = [ox + R, oy], e = [ox + R + R * Math.cos(phi), oy - R * Math.sin(phi)];
      gold = <line x1={s[0]} y1={s[1]} x2={e[0]} y2={e[1]} stroke={C.flaggold} strokeWidth="4.5" strokeLinecap="round" opacity={radiusAuf} />;
    } else {
      const u = wickel;                                       // aufgewickelte Länge
      const E = P(u), d = [-Math.sin(u), Math.cos(u)];
      const rest = 1 - u;
      gold = (
        <g>
          <path d={bogenPfad(ox, oy, R, 0, u / RAD)} fill="none" stroke={C.flaggold} strokeWidth="4.5" strokeLinecap="round" />
          {rest > 0.005 && <line x1={E[0]} y1={E[1]} x2={E[0] + d[0] * rest * R} y2={E[1] - d[1] * rest * R} stroke={C.flaggold} strokeWidth="4.5" strokeLinecap="round" />}
        </g>
      );
    }
  }
  /* Stücke 1 … K auf dem Kreis (ab Schritt 3 dauerhaft) */
  const stuecke = [];
  if (t >= 10.2) {
    for (let i = 0; i < Math.ceil(K - 1e-9); i++) {
      const von = i, bis = Math.min(i + 1, K);
      stuecke.push(<path key={i} d={bogenPfad(ox, oy, R, (von / RAD), (bis / RAD))} fill="none" stroke={i % 2 ? C.goldWarm : C.flaggold} strokeWidth="4.5" opacity={blass} />);
      if (bis - von > 0.999 && i + 1 <= 6) {
        const [lx, ly] = P(i + 1, R + 15);
        const [t1, t2] = [P(i + 1, R - 5), P(i + 1, R + 5)];
        stuecke.push(<g key={`m${i}`} opacity={blass}><line x1={t1[0]} y1={t1[1]} x2={t2[0]} y2={t2[1]} stroke={C.seeTief} strokeWidth="1.6" /><Tx x={lx} y={ly + 4} textAnchor="middle" fontSize="11" fill={C.seeTief}>{i + 1}</Tx></g>);
      }
    }
  }
  const W30 = Math.PI / 6;
  const P30 = P(W30);
  return (
    <g>
      <Achsen ox={ox} oy={oy} x0={ox - R - 22} x1={ox + R + 26} y0={oy - R - 26} y1={oy + R + 22} opacity={kreis * 0.8} />
      <circle cx={ox} cy={oy} r={R} fill="none" stroke={HYP} strokeWidth="1.6" opacity={kreis * 0.7} />
      {Array.from({ length: 12 }, (_, i) => {
        const w = (i * 30) * RAD;
        const [a1, b1] = P(w, R - 6), [a2, b2] = P(w, R);
        return <line key={i} x1={a1} y1={b1} x2={a2} y2={b2} stroke={C.grau} strokeWidth="1.2" opacity={ticks * (1 - lauf(t, 9.6, 10.4))} />;
      })}
      <g opacity={voll}>
        <path d={bogenPfad(ox, oy, 18, 0, 359.9)} fill="none" stroke={C.tinte} strokeWidth="1.3" />
        <Tx x={ox + 26} y={oy - 26} fontSize="13" fill={C.tinte}>360°</Tx>
        <Tx x={250} y={70} fontSize="12" fill={C.grau}>{zw("volle Drehung", "full turn")}</Tx>
        <Tx x={250} y={88} fontSize="12" fill={C.grau}>= 360 · 1°</Tx>
      </g>
      {/* Radius als Lineal */}
      <line x1={ox} y1={oy} x2={ox + R} y2={oy} stroke={HYP} strokeWidth="2.2" opacity={radiusAuf * (1 - schluss)} />
      <Tx x={ox + R / 2} y={oy + 16} textAnchor="middle" fontSize="11.5" fill={HYP} opacity={radiusAuf * (1 - lauf(t, 9.6, 10.2))}>r = 1</Tx>
      {gold}
      {stuecke}
      <g opacity={einRad}>
        <line x1={ox} y1={oy} x2={P(1)[0]} y2={P(1)[1]} stroke={HYP} strokeWidth="2.2" />
        <path d={bogenPfad(ox, oy, 22, 0, 57.2958)} fill="none" stroke={C.tinte} strokeWidth="1.4" />
        <Tx x={ox + 28} y={oy - 12} fontSize="11.5" fill={C.tinte}>1 rad</Tx>
        <Tx x={232} y={56} fontSize="13" fill={C.seeTief}>x = 1</Tx>
        <Tx x={232} y={76} fontSize="13" fill={C.seeTief}>≈ 57,3°</Tx>
        <Tx x={232} y={100} fontSize="11.5" fill={C.grau}>{zw("Bogen = Radius", "arc = radius")}</Tx>
      </g>
      <g opacity={piLab * (1 - schluss)}>
        <Tx x={ox - R + 10} y={oy - 8} fontSize="14" fill={C.seeTief}>π</Tx>
        <Tx x={ox + R - 24} y={oy + 18} fontSize="14" fill={C.seeTief}>2π</Tx>
        <Tx x={226} y={150} fontSize="13" fill={C.seeTief}>180° = π ≈ 3,14</Tx>
        <Tx x={226} y={172} fontSize="13" fill={C.seeTief}>360° = 2π ≈ 6,28</Tx>
      </g>
      <g opacity={schluss}>
        <line x1={ox} y1={oy} x2={P30[0]} y2={P30[1]} stroke={HYP} strokeWidth="2.4" />
        <line x1={P30[0]} y1={oy} x2={P30[0]} y2={P30[1]} stroke={SIN} strokeWidth="4" />
        <path d={bogenPfad(ox, oy, 26, 0, 30)} fill="none" stroke={C.tinte} strokeWidth="1.4" />
        <circle cx={P30[0]} cy={P30[1]} r="5" fill={C.seeTief} />
        <Tx x={P30[0] + 8} y={P30[1] - 6} fontSize="12" fill={C.seeTief}>P</Tx>
        <Tx x={P30[0] + 6} y={(oy + P30[1]) / 2 + 8} fontSize="11.5" fill={SIN}>0,5</Tx>
        <Tx x={232} y={56} fontSize="13" fill={C.tinte}>30° = </Tx>
        <Bruch x={290} y={52} oben="π" unten="6" farbe={C.tinte} />
        <Tx x={232} y={100} fontSize="12.5" fill={SIN}>sin 30° = 0,5</Tx>
        <Tx x={232} y={120} fontSize="12.5" fill={SIN}>sin(π/6) = 0,5</Tx>
        <rect x={56} y={256} width={248} height={36} rx="14" fill={C.weiss} stroke={C.linie} />
        <Tx x={104} y={279} textAnchor="middle" fontSize="14" fill={C.tinte}>x = α ·</Tx>
        <Bruch x={168} y={275} oben="π" unten="180°" farbe={C.tinte} gr={12} />
        <Tx x={250} y={279} textAnchor="middle" fontSize="12" fill={C.grau}>{zw("Umrechnung", "conversion")}</Tx>
      </g>
    </g>
  );
}

/* ======================================================================
   3 · VOM EINHEITSKREIS ZUM RECHTWINKLIGEN DREIECK
   ====================================================================== */
const dr = () => [
  { von: 0, text: zw("Im Einheitskreis gehört zu α ein rechtwinkliges Dreieck: Hypotenuse 1, waagerechte Kathete cos α, senkrechte Kathete sin α.",
    "In the unit circle, α comes with a right triangle: hypotenuse 1, horizontal leg cos α, vertical leg sin α.") },
  { von: 4.5, text: zw("Jetzt strecken wir das Dreieck mit dem Faktor c. Alle Seiten werden c-mal so lang – die Winkel bleiben gleich. So sieht jedes rechtwinklige Dreieck mit dem Winkel α aus.",
    "Now we stretch the triangle by the factor c. Every side becomes c times as long – the angles stay the same. Every right triangle with angle α looks like this.") },
  { von: 10, text: zw("Teilt man eine Kathete durch die Hypotenuse, kürzt sich c weg – übrig bleibt der Wert aus dem Einheitskreis. Das Verhältnis hängt also nur vom Winkel ab, nicht von der Größe des Dreiecks.",
    "Divide a leg by the hypotenuse and c cancels – what remains is the value from the unit circle. So the ratio depends only on the angle, not on the size of the triangle.") },
  { von: 15.5, text: zw("Darum gilt in jedem rechtwinkligen Dreieck: sin α = Gegenkathete : Hypotenuse, cos α = Ankathete : Hypotenuse. Gegenkathete heißt die Seite gegenüber von α, Ankathete die Kathete, die an α anliegt.",
    "Hence in every right triangle: sin α = opposite : hypotenuse, cos α = adjacent : hypotenuse. The opposite side lies across from α, the adjacent leg touches α.") },
];

function drZeichne(t) {
  const ox = 30, oy = 236, u = 74, a = 35 * RAD, cEnd = 2.9;
  const k = 1 + (cEnd - 1) * lauf(t, 4.8, 8.6);
  const L = k * u;
  const F = [ox + L * Math.cos(a), oy], P = [F[0], oy - L * Math.sin(a)];
  const auf = lauf(t, 0, 1.4), kreisSicht = lauf(t, 0, 1) * (1 - lauf(t, 4.8, 6.2));
  const labEins = lauf(t, 1.4, 2.4) * (1 - lauf(t, 4.8, 5.6));
  const labC = lauf(t, 8.6, 9.6) * (1 - lauf(t, 15.4, 16.2));
  const formel1 = lauf(t, 10.4, 11.4), formel2 = lauf(t, 12, 13);
  const woerter = lauf(t, 16, 17);
  const flaeche = lauf(t, 0.6, 1.6);
  const faktor = lauf(t, 4.8, 5.4) * (1 - lauf(t, 9.4, 10.2));
  return (
    <g>
      <line x1={ox - 6} y1={oy} x2={350} y2={oy} stroke={C.hellgrau} strokeWidth="1" opacity={auf * 0.6} />
      <path d={bogenPfad(ox, oy, u, 0, 90)} fill="none" stroke={HYP} strokeWidth="1.4" strokeDasharray="3 4" opacity={kreisSicht} />
      <path d={`M${ox} ${oy} L${F[0]} ${F[1]} L${P[0]} ${P[1]} Z`} fill={`${C.see}0F`} opacity={flaeche} />
      <line x1={ox} y1={oy} x2={F[0]} y2={oy} stroke={COS} strokeWidth="4" strokeLinecap="round" opacity={auf} />
      <line x1={F[0]} y1={oy} x2={P[0]} y2={P[1]} stroke={SIN} strokeWidth="4" strokeLinecap="round" opacity={auf} />
      <line x1={ox} y1={oy} x2={P[0]} y2={P[1]} stroke={HYP} strokeWidth="3" strokeLinecap="round" opacity={auf} />
      {rechterWinkel(F[0], oy, -1, -1, 10)}
      <path d={bogenPfad(ox, oy, 26, 0, 35)} fill="none" stroke={C.tinte} strokeWidth="1.4" opacity={auf} />
      <Tx x={ox + 32} y={oy - 6} fontSize="12" fill={C.tinte} opacity={auf}>α</Tx>
      <g opacity={labEins}>
        <Tx x={(ox + P[0]) / 2 - 6} y={(oy + P[1]) / 2 - 6} textAnchor="end" fontSize="12" fill={HYP}>1</Tx>
        <Tx x={(ox + F[0]) / 2} y={oy + 17} textAnchor="middle" fontSize="12" fill={COS}>cos α</Tx>
        <Tx x={F[0] + 6} y={(oy + P[1]) / 2 + 4} fontSize="12" fill={SIN}>sin α</Tx>
      </g>
      <g opacity={labC}>
        <Tx x={(ox + P[0]) / 2 - 8} y={(oy + P[1]) / 2 - 8} textAnchor="end" fontSize="13" fill={HYP}>c</Tx>
        <Tx x={(ox + F[0]) / 2} y={oy + 18} textAnchor="middle" fontSize="13" fill={COS}>c · cos α</Tx>
        <Tx x={F[0] + 8} y={(oy + P[1]) / 2 + 4} fontSize="13" fill={SIN}>c · sin α</Tx>
      </g>
      <g opacity={woerter}>
        <Tx x={(ox + P[0]) / 2 - 8} y={(oy + P[1]) / 2 - 8} textAnchor="end" fontSize="12.5" fill={HYP}>{zw("Hypotenuse", "hypotenuse")}</Tx>
        <Tx x={(ox + F[0]) / 2} y={oy + 18} textAnchor="middle" fontSize="12.5" fill={COS}>{zw("Ankathete von α", "adjacent to α")}</Tx>
        <Tx x={F[0] + 8} y={(oy + P[1]) / 2 - 4} fontSize="12.5" fill={SIN}>{zw("Gegen-", "opposite")}</Tx>
        <Tx x={F[0] + 8} y={(oy + P[1]) / 2 + 12} fontSize="12.5" fill={SIN}>{zw("kathete", "")}</Tx>
      </g>
      <g opacity={faktor}>
        <rect x={14} y={24} width={150} height={34} rx="14" fill={C.weiss} stroke={C.linie} />
        <Tx x={89} y={46} textAnchor="middle" fontSize="13.5" fill={C.seeTief}>{zw("Faktor", "factor")} c = {komma(k, 1)}</Tx>
      </g>
      {/* Formeln oben */}
      <g opacity={formel1}>
        <Tx x={10} y={38} fontSize="13" fill={C.tinte}>sin α =</Tx>
        <Bruch x={104} y={34} oben="c · sin α" unten="c" farbe={SIN} />
        <Tx x={146} y={38} fontSize="13" fill={C.tinte}>=</Tx>
        {woerter < 0.5
          ? <Tx x={162} y={38} fontSize="13" fill={SIN} opacity={1 - woerter * 2}>sin α</Tx>
          : <Bruch x={212} y={34} oben={zw("Gegenkathete", "opposite")} unten={zw("Hypotenuse", "hypotenuse")} farbe={SIN} gr={12} opacity={(woerter - 0.5) * 2} />}
      </g>
      <g opacity={formel2}>
        <Tx x={10} y={88} fontSize="13" fill={C.tinte}>cos α =</Tx>
        <Bruch x={106} y={84} oben="c · cos α" unten="c" farbe={COS} />
        <Tx x={148} y={88} fontSize="13" fill={C.tinte}>=</Tx>
        {woerter < 0.5
          ? <Tx x={164} y={88} fontSize="13" fill={COS} opacity={1 - woerter * 2}>cos α</Tx>
          : <Bruch x={212} y={84} oben={zw("Ankathete", "adjacent")} unten={zw("Hypotenuse", "hypotenuse")} farbe={COS} gr={12} opacity={(woerter - 0.5) * 2} />}
      </g>
    </g>
  );
}

/* ======================================================================
   4 · TANGENS IM EINHEITSKREIS
   ====================================================================== */
const ta = () => [
  { von: 0, text: zw("Zeichne an den Einheitskreis die Tangente im Punkt (1|0): eine senkrechte Gerade, die den Kreis dort nur berührt.",
    "Draw the tangent to the unit circle at the point (1|0): a vertical line that just touches the circle there.") },
  { von: 4, text: zw("Verlängere den Radius durch P, bis er die Tangente im Punkt T trifft. Die Strecke vom Berührpunkt bis T heißt tan α – sie liegt auf der Tangente, daher der Name.",
    "Extend the radius through P until it meets the tangent at T. The segment from the touching point to T is called tan α – it lies on the tangent, hence the name.") },
  { von: 9, text: zw("Zwei ähnliche Dreiecke: das kleine mit den Katheten cos α und sin α, das große mit 1 und tan α. Nach dem Strahlensatz gilt tan α : 1 = sin α : cos α, also tan α = sin α / cos α.",
    "Two similar triangles: the small one with legs cos α and sin α, the large one with 1 and tan α. By the intercept theorem tan α : 1 = sin α : cos α, so tan α = sin α / cos α.") },
  { von: 14, text: zw("Wird α größer, wandert T immer weiter nach oben. Bei 90° läuft der Strahl parallel zur Tangente – es gibt keinen Schnittpunkt: tan 90° ist nicht definiert (cos 90° = 0, durch 0 teilt man nicht).",
    "As α grows, T moves further and further up. At 90° the ray runs parallel to the tangent – there is no intersection: tan 90° is undefined (cos 90° = 0, and you can't divide by 0).") },
  { von: 19.5, text: zw("Gleichzeitig ist tan α die Steigung der Geraden durch O und P: 1 nach rechts, tan α nach oben. Im rechtwinkligen Dreieck heißt das tan α = Gegenkathete : Ankathete – die Hypotenuse kommt gar nicht vor. Deshalb nimmt man den Tangens für Steigungen, Rampen und Höhen aus einer Entfernung.",
    "At the same time tan α is the slope of the line through O and P: 1 to the right, tan α up. In a right triangle that means tan α = opposite : adjacent – the hypotenuse doesn't appear. That's why tangent is used for slopes, ramps and heights from a distance.") },
];

function taZeichne(t) {
  const ox = 100, oy = 188, R = 86;
  const tx = ox + R;
  let a = 35;
  if (t > 14) a = 35 + 52 * lauf(t, 14.2, 17.6);
  if (t > 19) a = 87 - 52 * lauf(t, 19, 20.2);
  const ar = a * RAD;
  const P = [ox + R * Math.cos(ar), oy - R * Math.sin(ar)];
  const tanW = Math.tan(ar);
  const Ty = oy - R * tanW;
  const sichtTy = Math.max(Ty, 6);
  const kreis = lauf(t, 0, 1), tang = lauf(t, 1, 3), beruehr = lauf(t, 2.6, 3.4);
  const strahl = lauf(t, 4.4, 6), tanSeg = lauf(t, 6.4, 7.6);
  const dreiecke = lauf(t, 9.2, 10.4) * (1 - lauf(t, 13.6, 14.2)) + lauf(t, 20.4, 21.4);
  const formel = lauf(t, 11, 12) * (1 - lauf(t, 13.8, 14.4));
  const weg = lauf(t, 17, 18) * (1 - lauf(t, 19, 19.6));
  const steig = lauf(t, 20.4, 21.6);
  /* Strahl O → T (bzw. weit nach oben, wenn T außerhalb) */
  const ende = Ty >= 6 ? [tx, Ty] : [ox + (oy - 6) / Math.tan(ar), 6];
  const F = [P[0], oy];
  return (
    <g>
      <Achsen ox={ox} oy={oy} x0={ox - R - 18} x1={ox + R + 70} y0={10} y1={oy + R + 12} opacity={kreis * 0.8} />
      <circle cx={ox} cy={oy} r={R} fill="none" stroke={HYP} strokeWidth="1.6" opacity={kreis * 0.7} />
      <line x1={tx} y1={oy + R + 8} x2={tx} y2={oy + R + 8 - (oy + R + 2) * tang} stroke={TAN} strokeWidth="1.6" opacity="0.8" />
      <Tx x={tx + 6} y={18} fontSize="11" fill={TAN} opacity={tang * (Ty > 44 ? 1 : 0)}>{zw("Tangente", "tangent")}</Tx>
      <circle cx={tx} cy={oy} r="4" fill={TAN} opacity={beruehr} />
      <Tx x={tx + 7} y={oy + 15} fontSize="11.5" fill={C.tinte} opacity={beruehr * (1 - steig)}>(1|0)</Tx>

      {/* Dreiecke */}
      <g opacity={dreiecke}>
        <path d={`M${ox} ${oy} L${tx} ${oy} L${tx} ${sichtTy} Z`} fill={`${TAN}22`} />
        <path d={`M${ox} ${oy} L${F[0]} ${oy} L${P[0]} ${P[1]} Z`} fill={`${C.smaragd}2A`} />
      </g>
      <line x1={ox} y1={oy} x2={ox + (ende[0] - ox) * strahl} y2={oy + (ende[1] - oy) * strahl} stroke={HYP} strokeWidth="1.6" strokeDasharray="5 4" />
      <line x1={ox} y1={oy} x2={P[0]} y2={P[1]} stroke={HYP} strokeWidth="2.6" opacity={kreis} />
      <line x1={F[0]} y1={oy} x2={P[0]} y2={P[1]} stroke={SIN} strokeWidth="3" opacity={dreiecke} />
      <line x1={ox} y1={oy} x2={F[0]} y2={oy} stroke={COS} strokeWidth="3" opacity={dreiecke} />
      {Ty >= 6 && <line x1={tx} y1={oy} x2={tx} y2={oy + (Ty - oy) * tanSeg} stroke={TAN} strokeWidth="4.5" strokeLinecap="round" />}
      {Ty < 6 && <line x1={tx} y1={oy} x2={tx} y2={6} stroke={TAN} strokeWidth="4.5" strokeLinecap="round" />}
      <path d={bogenPfad(ox, oy, 20, 0, a)} fill="none" stroke={C.tinte} strokeWidth="1.4" opacity={kreis} />
      <Tx x={ox + 26} y={oy - 8} fontSize="11.5" fill={C.tinte} opacity={kreis}>α</Tx>
      <circle cx={P[0]} cy={P[1]} r="4.5" fill={C.seeTief} opacity={kreis} />
      <Tx x={P[0] - 8} y={P[1] - 6} textAnchor="end" fontSize="12" fill={C.seeTief} opacity={kreis}>P</Tx>
      {Ty >= 6 && <circle cx={tx} cy={Ty} r="4.5" fill={TAN} opacity={strahl} />}
      {Ty >= 6 && <Tx x={tx + 8} y={Ty + 4} fontSize="12.5" fill={TAN} opacity={strahl}>T</Tx>}
      <Tx x={tx + 8} y={Math.max(20, (oy + sichtTy) / 2) + 4} fontSize="12.5" fill={TAN} opacity={tanSeg * (1 - steig)}>tan α {t > 14 && t < 19.4 ? `≈ ${komma(tanW, 1)}` : ""}</Tx>
      <g opacity={dreiecke * (1 - steig)}>
        <Tx x={(ox + F[0]) / 2} y={oy + 15} textAnchor="middle" fontSize="11" fill={COS}>cos α</Tx>
        <Tx x={F[0] - 4} y={(oy + P[1]) / 2 + 2} textAnchor="end" fontSize="11" fill={SIN}>sin α</Tx>
      </g>
      <Tx x={(ox + tx) / 2} y={oy + 30} textAnchor="middle" fontSize="11.5" fill={C.tinte} opacity={dreiecke * (1 - steig)}>1</Tx>
      <g opacity={formel}>
        <rect x={206} y={210} width={146} height={66} rx="14" fill={C.weiss} stroke={C.linie} />
        <Bruch x={238} y={238} oben="tan α" unten="1" farbe={TAN} />
        <Tx x={266} y={242} fontSize="14" fill={C.tinte}>=</Tx>
        <Bruch x={308} y={238} oben="sin α" unten="cos α" farbe={C.tinte} />
        <Tx x={279} y={268} textAnchor="middle" fontSize="10.5" fill={C.grau}>{zw("Strahlensatz", "intercept theorem")}</Tx>
      </g>
      <g opacity={weg}>
        <Tx x={290} y={160} textAnchor="middle" fontSize="12" fill={TAN}>↑ T</Tx>
        <Tx x={290} y={178} textAnchor="middle" fontSize="11.5" fill={C.grau}>{zw("läuft weg", "runs away")}</Tx>
        <Tx x={290} y={202} textAnchor="middle" fontSize="11.5" fill={C.tinte}>tan 90°</Tx>
        <Tx x={290} y={218} textAnchor="middle" fontSize="11.5" fill={C.tinte}>{zw("gibt es nicht", "doesn't exist")}</Tx>
      </g>
      <g opacity={steig}>
        <Tx x={(ox + tx) / 2} y={oy + 17} textAnchor="middle" fontSize="11" fill={C.tinte}>{zw("1 nach rechts", "1 right")}</Tx>
        <Tx x={tx + 8} y={(oy + Ty) / 2} fontSize="11.5" fill={TAN}>tan α</Tx>
        <Tx x={tx + 8} y={(oy + Ty) / 2 + 15} fontSize="11.5" fill={TAN}>{zw("nach oben", "up")}</Tx>
        <rect x={200} y={226} width={152} height={50} rx="14" fill={C.weiss} stroke={C.linie} />
        <Tx x={276} y={246} textAnchor="middle" fontSize="12.5" fill={C.tinte}>{zw("Steigung", "slope")} m = tan α</Tx>
        <Tx x={276} y={266} textAnchor="middle" fontSize="11.5" fill={C.grau}>tan 35° ≈ 0,70</Tx>
      </g>
    </g>
  );
}

/* ======================================================================
   5 · SINUSSATZ  ·  6 · KOSINUSSATZ  (gemeinsames Dreieck)
   ====================================================================== */
const A0 = [30, 222], B0 = [330, 222], C0 = [205, 64];

function Dreieck({ A, B, Cp, D, zeig = 1, hoehe = 0, links = 0, rechts = 0, beschr = {} }) {
  const len = (p, q) => Math.hypot(q[0] - p[0], q[1] - p[1]);
  const umf = len(A, B) + len(B, Cp) + len(Cp, A);
  const mitte = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  const wA = Math.atan2(A[1] - Cp[1], Cp[0] - A[0]) / RAD;          // Richtung A→C
  const wB = 180 - Math.atan2(B[1] - Cp[1], B[0] - Cp[0]) / RAD;     // Richtung B→C (mathematisch, y nach oben)
  const mAC = mitte(A, Cp), mBC = mitte(B, Cp);
  return (
    <g>
      <path d={`M${A[0]} ${A[1]} L${D[0]} ${D[1]} L${Cp[0]} ${Cp[1]} Z`} fill={`${C.gruen}30`} opacity={links} />
      <path d={`M${D[0]} ${D[1]} L${B[0]} ${B[1]} L${Cp[0]} ${Cp[1]} Z`} fill={`${C.smaragd}2C`} opacity={rechts} />
      <path d={`M${A[0]} ${A[1]} L${B[0]} ${B[1]} L${Cp[0]} ${Cp[1]} Z`} fill="none" stroke={C.tinte} strokeWidth="2.2" strokeLinejoin="round"
        strokeDasharray={umf} strokeDashoffset={umf * (1 - zeig)} />
      <g opacity={hoehe}>
        <line x1={Cp[0]} y1={Cp[1]} x2={D[0]} y2={D[1]} stroke={HYP} strokeWidth="1.8" strokeDasharray="5 4" />
        {Math.abs(D[0] - A[0]) > 12 && rechterWinkel(D[0], D[1], 1, -1, 9, HYP)}
        <Tx x={D[0] + 6} y={(D[1] + Cp[1]) / 2 + 4} fontSize="13" fill={HYP}>h</Tx>
      </g>
      <g opacity={zeig}>
        <path d={bogenPfad(A[0], A[1], 24, 0, wA)} fill="none" stroke={C.tinte} strokeWidth="1.3" />
        <Tx x={A[0] + 30} y={A[1] - 7} fontSize="12" fill={C.tinte}>α</Tx>
        <path d={bogenPfad(B[0], B[1], 24, wB, 180)} fill="none" stroke={C.tinte} strokeWidth="1.3" />
        <Tx x={B[0] - 38} y={B[1] - 7} fontSize="12" fill={C.tinte}>β</Tx>
        <Tx x={A[0] - 4} y={A[1] + 16} textAnchor="middle" fontSize="13" fill={C.tinte}>A</Tx>
        <Tx x={B[0] + 4} y={B[1] + 16} textAnchor="middle" fontSize="13" fill={C.tinte}>B</Tx>
        <Tx x={Cp[0]} y={Cp[1] - 9} textAnchor="middle" fontSize="13" fill={C.tinte}>C</Tx>
        <Tx x={mAC[0] - 10} y={mAC[1] - 4} textAnchor="end" fontSize="13" fill={beschr.bFarbe || C.tinte}>b</Tx>
        <Tx x={mBC[0] + 10} y={mBC[1] - 4} fontSize="13" fill={beschr.aFarbe || C.tinte}>a</Tx>
        {beschr.c !== false && <Tx x={(A[0] + B[0]) / 2 + (beschr.cVersatz || 0)} y={A[1] + 18} textAnchor="middle" fontSize="13" fill={C.tinte}>c</Tx>}
      </g>
    </g>
  );
}

const ss = () => [
  { von: 0, text: zw("Ein Dreieck ohne rechten Winkel. Der Trick: Zeichne die Höhe h von C auf die Seite c. Schon zerfällt das Dreieck in zwei rechtwinklige Dreiecke – und dort kennen wir den Sinus.",
    "A triangle without a right angle. The trick: draw the height h from C onto side c. Now the triangle splits into two right triangles – where we know the sine.") },
  { von: 5, text: zw("Links: h liegt α gegenüber, b ist die Hypotenuse. Also sin α = h : b, das heißt h = b · sin α.",
    "Left: h is opposite α, b is the hypotenuse. So sin α = h : b, which means h = b · sin α.") },
  { von: 10, text: zw("Rechts: h liegt β gegenüber, a ist die Hypotenuse. Also sin β = h : a, das heißt h = a · sin β.",
    "Right: h is opposite β, a is the hypotenuse. So sin β = h : a, which means h = a · sin β.") },
  { von: 15, text: zw("Beide Male ist es dieselbe Höhe: b · sin α = a · sin β. Teilt man durch sin α · sin β, steht da a : sin α = b : sin β. Mit der Höhe auf eine andere Seite kommt c : sin γ dazu – das ist der Sinussatz.",
    "Both times it's the same height: b · sin α = a · sin β. Divide by sin α · sin β: a : sin α = b : sin β. Using the height onto another side adds c : sin γ – that's the law of sines.") },
];
function ssZeichne(t) {
  const D = [C0[0], A0[1]];
  const zeig = lauf(t, 0, 1.8), hoehe = lauf(t, 2.2, 3.4);
  const links = lauf(t, 5.2, 6.2) * (1 - lauf(t, 9.6, 10.2)), rechts = lauf(t, 10.2, 11.2) * (1 - lauf(t, 14.6, 15.2));
  const f1 = lauf(t, 6.4, 7.4) * (1 - lauf(t, 15, 15.6)), f2 = lauf(t, 11.4, 12.4) * (1 - lauf(t, 15, 15.6));
  const g1 = lauf(t, 15.6, 16.6), g2 = lauf(t, 17.4, 18.6);
  return (
    <g>
      <Dreieck A={A0} B={B0} Cp={C0} D={D} zeig={zeig} hoehe={hoehe} links={links} rechts={rechts} beschr={{ bFarbe: links > 0.3 ? C.gruenDunkel : C.tinte, aFarbe: rechts > 0.3 ? C.smaragd : C.tinte, cVersatz: -40 }} />
      <g opacity={f1}><Tx x={20} y={270} fontSize="14" fill={C.gruenDunkel}>{zw("links:", "left:")}  h = b · sin α</Tx></g>
      <g opacity={f2}><Tx x={20} y={296} fontSize="14" fill={C.smaragd}>{zw("rechts:", "right:")}  h = a · sin β</Tx></g>
      <g opacity={g1}><Tx x={180} y={268} textAnchor="middle" fontSize="14" fill={C.tinte}>b · sin α = a · sin β</Tx></g>
      <g opacity={g2}>
        <rect x={38} y={280} width={284} height={44} rx="14" fill={C.weiss} stroke={C.linie} />
        <Bruch x={86} y={302} oben="a" unten="sin α" />
        <Tx x={120} y={306} fontSize="14" fill={C.tinte}>=</Tx>
        <Bruch x={156} y={302} oben="b" unten="sin β" />
        <Tx x={190} y={306} fontSize="14" fill={C.tinte}>=</Tx>
        <Bruch x={226} y={302} oben="c" unten="sin γ" />
        <Tx x={260} y={306} fontSize="11" fill={C.grau}>{zw("Sinussatz", "law of sines")}</Tx>
      </g>
    </g>
  );
}

const ks = () => [
  { von: 0, text: zw("Gesucht ist a. Bekannt sind b, c und der Winkel α dazwischen – kein Paar aus Seite und Gegenwinkel, der Sinussatz hilft also nicht. Wieder zeichnen wir die Höhe h. Ihr Fußpunkt teilt c in p = b · cos α und c − p.",
    "We want a. We know b, c and the angle α between them – no pair of side and opposite angle, so the law of sines won't help. Again we draw the height h. Its foot splits c into p = b · cos α and c − p.") },
  { von: 5.5, text: zw("Pythagoras im rechten Dreieck: a² = h² + (c − p)².", "Pythagoras in the right-hand triangle: a² = h² + (c − p)².") },
  { von: 9.5, text: zw("Pythagoras im linken Dreieck: h² = b² − p². Eingesetzt und die Klammer ausmultipliziert: a² = b² − p² + c² − 2cp + p².",
    "Pythagoras in the left-hand triangle: h² = b² − p². Substitute and expand: a² = b² − p² + c² − 2cp + p².") },
  { von: 14.5, text: zw("Die p² heben sich weg, und mit p = b · cos α bleibt der Kosinussatz: a² = b² + c² − 2bc · cos α.",
    "The p² cancel, and with p = b · cos α we get the law of cosines: a² = b² + c² − 2bc · cos α.") },
  { von: 19.5, text: zw("Wird α ein rechter Winkel, ist cos 90° = 0 – der Korrekturterm verschwindet, und es bleibt Pythagoras: a² = b² + c². Der Kosinussatz ist also Pythagoras für alle Dreiecke.",
    "If α becomes a right angle, cos 90° = 0 – the correction term vanishes, leaving Pythagoras: a² = b² + c². So the law of cosines is Pythagoras for every triangle.") },
];
function ksZeichne(t) {
  const m = lauf(t, 20, 22.6);
  const Cp = [C0[0] + (A0[0] - C0[0]) * m, C0[1] + (70 - C0[1]) * m];
  const D = [Cp[0], A0[1]];
  const zeig = lauf(t, 0, 1.6), hoehe = lauf(t, 1.8, 2.8), teile = lauf(t, 3, 4.2) * (1 - m);
  const rechts = lauf(t, 5.7, 6.6) * (1 - lauf(t, 9.4, 10)), links = lauf(t, 9.7, 10.6) * (1 - lauf(t, 14.2, 14.8));
  const z1 = lauf(t, 6, 7) * (1 - lauf(t, 14.4, 15)), z2 = lauf(t, 10, 11) * (1 - lauf(t, 14.4, 15)), z3 = lauf(t, 11.8, 12.8) * (1 - lauf(t, 14.4, 15));
  const end = lauf(t, 15, 16.2) * (1 - lauf(t, 19.6, 20.2)), streich = lauf(t, 15.6, 16.4);
  const pyth = lauf(t, 22.4, 23.4);
  const mittel = (D[0] + B0[0]) / 2;
  return (
    <g>
      <Dreieck A={A0} B={B0} Cp={Cp} D={D} zeig={zeig} hoehe={hoehe * (1 - m)} links={links} rechts={rechts} beschr={{ c: false }} />
      <g opacity={teile}>
        <line x1={A0[0]} y1={A0[1] + 6} x2={D[0]} y2={D[1] + 6} stroke={C.gruen} strokeWidth="3.5" strokeLinecap="round" />
        <line x1={D[0]} y1={D[1] + 6} x2={B0[0]} y2={B0[1] + 6} stroke={C.smaragd} strokeWidth="3.5" strokeLinecap="round" />
        <Tx x={(A0[0] + D[0]) / 2} y={A0[1] + 24} textAnchor="middle" fontSize="12" fill={C.gruenDunkel}>p = b · cos α</Tx>
        <Tx x={mittel} y={A0[1] + 24} textAnchor="middle" fontSize="12" fill={C.smaragd}>c − p</Tx>
      </g>
      <Tx x={(A0[0] + B0[0]) / 2} y={A0[1] + 24} textAnchor="middle" fontSize="13" fill={C.tinte} opacity={zeig * (1 - teile)}>c</Tx>
      <Tx x={24} y={276} fontSize="14" fill={C.smaragd} opacity={z1}>a² = h² + (c − p)²</Tx>
      <Tx x={24} y={300} fontSize="14" fill={C.gruenDunkel} opacity={z2}>h² = b² − p²</Tx>
      <Tx x={24} y={324} fontSize="13.5" fill={C.tinte} opacity={z3}>a² = b² − p² + c² − 2cp + p²</Tx>
      <g opacity={end}>
        <Tx x={24} y={276} fontSize="13.5" fill={C.tinte}>a² = b² <tspan fill={C.signal} opacity={1 - streich * 0.8} textDecoration="line-through">− p²</tspan> + c² − 2cp <tspan fill={C.signal} opacity={1 - streich * 0.8} textDecoration="line-through">+ p²</tspan></Tx>
        <rect x={20} y={290} width={320} height={40} rx="14" fill={C.weiss} stroke={C.see} strokeWidth="1.4" />
        <Tx x={180} y={316} textAnchor="middle" fontSize="15" fill={C.seeTief}>a² = b² + c² − 2bc · cos α</Tx>
      </g>
      <g opacity={pyth}>{rechterWinkel(A0[0], A0[1], 1, -1, 12)}</g>
      <g opacity={pyth}>
        <Tx x={180} y={282} textAnchor="middle" fontSize="13" fill={C.grau}>α = 90°:  cos 90° = 0</Tx>
        <rect x={70} y={292} width={220} height={38} rx="14" fill={C.weiss} stroke={C.linie} />
        <Tx x={180} y={317} textAnchor="middle" fontSize="15" fill={C.seeTief}>a² = b² + c²</Tx>
      </g>
    </g>
  );
}

/* ======================================================================
   Szenen-Tabelle und Karte
   ====================================================================== */
export const TRIG_FILME = {
  einheitskreis: { dauer: 26, hoehe: 306, schritte: ek, zeichne: ekZeichne, titel: () => zw("Was sin α und cos α wirklich sind", "What sin α and cos α really are"),
    beschreibung: () => zw("Animation: Ein Punkt P läuft auf dem Einheitskreis. Seine x-Koordinate ist cos α, seine y-Koordinate sin α. Rechts entsteht die Sinuskurve.", "Animation: a point P runs around the unit circle. Its x-coordinate is cos α, its y-coordinate sin α. The sine curve appears on the right.") },
  bogenmass: { dauer: 27, hoehe: 300, schritte: bm, zeichne: bmZeichne, titel: () => zw("Grad und Bogenmaß: zwei Namen für dieselbe Drehung", "Degrees and radians: two names for one turn"),
    beschreibung: () => zw("Animation: Der Radius wird auf den Einheitskreis gelegt. Ein Radius Bogenlänge ergibt 1 rad ≈ 57,3°, eine ganze Runde 2π.", "Animation: the radius is laid onto the unit circle. One radius of arc gives 1 rad ≈ 57.3°, a full turn 2π.") },
  dreieck: { dauer: 21, hoehe: 266, schritte: dr, zeichne: drZeichne, titel: () => zw("Vom Einheitskreis zum rechtwinkligen Dreieck", "From the unit circle to the right triangle"),
    beschreibung: () => zw("Animation: Das Dreieck aus dem Einheitskreis wird mit dem Faktor c gestreckt. Daraus folgen sin α = Gegenkathete durch Hypotenuse und cos α = Ankathete durch Hypotenuse.", "Animation: the unit-circle triangle is stretched by the factor c, which gives sin α = opposite over hypotenuse and cos α = adjacent over hypotenuse.") },
  tangens: { dauer: 26, hoehe: 292, schritte: ta, zeichne: taZeichne, titel: () => zw("Der Tangens liegt auf der Tangente", "The tangent lies on the tangent line"),
    beschreibung: () => zw("Animation: Tangente an den Einheitskreis bei (1|0); der verlängerte Radius trifft sie in T. Die Strecke bis T ist tan α = sin α / cos α, zugleich die Steigung.", "Animation: tangent to the unit circle at (1|0); the extended radius meets it at T. The segment up to T is tan α = sin α / cos α, which is also the slope.") },
  sinussatz: { dauer: 21, hoehe: 330, schritte: ss, zeichne: ssZeichne, titel: () => zw("Herleitung des Sinussatzes", "Deriving the law of sines"),
    beschreibung: () => zw("Animation: Die Höhe h wird einmal als b · sin α und einmal als a · sin β geschrieben. Gleichsetzen ergibt den Sinussatz.", "Animation: the height h is written once as b · sin α and once as a · sin β. Setting them equal gives the law of sines.") },
  kosinussatz: { dauer: 25, hoehe: 336, schritte: ks, zeichne: ksZeichne, titel: () => zw("Herleitung des Kosinussatzes", "Deriving the law of cosines"),
    beschreibung: () => zw("Animation: Die Höhe teilt c in p und c − p. Zweimal Pythagoras und p = b · cos α ergeben a² = b² + c² − 2bc · cos α; bei α = 90° bleibt Pythagoras.", "Animation: the height splits c into p and c − p. Pythagoras twice and p = b · cos α give a² = b² + c² − 2bc · cos α; at α = 90° Pythagoras remains.") },
};

/* Karte „Erklärvideo“ – offen, mit Titel; der Player startet von selbst (außer bei reduzierter Bewegung) */
export function TrigFilm({ art }) {
  const f = TRIG_FILME[art];
  /* Der Film startet erst, wenn er ins Bild kommt – sonst liefen mehrere Filme gleichzeitig unbemerkt ab */
  const [sicht, setSicht] = useState(typeof IntersectionObserver === "undefined");
  const huelle = useRef(null);
  useEffect(() => {
    if (sicht || !huelle.current) return undefined;
    const io = new IntersectionObserver((e) => { if (e.some((x) => x.isIntersecting)) { setSicht(true); io.disconnect(); } }, { threshold: 0.35 });
    io.observe(huelle.current);
    return () => io.disconnect();
  }, [sicht]);
  if (!f) return null;
  return (
    <div ref={huelle} data-trig-film={art} style={{ background: C.weiss, border: `1px solid ${C.linie}`, borderRadius: 16, boxShadow: "0 2px 16px rgba(15,26,51,0.07)", padding: "14px 16px 18px", marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
        <span aria-hidden="true" style={{ width: 36, height: 36, borderRadius: 999, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
          background: "radial-gradient(130% 150% at 90% 10%, #2A2210 0%, #0E0C08 55%, #050404 100%)", border: `1px solid ${C.flaggold}` }}>
          <svg width="13" height="13" viewBox="0 0 18 18"><path d="M5 2.5v13l11-6.5z" fill={C.flaggold} /></svg>
        </span>
        <span style={{ minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.gruenDunkel }}>{zw("Erklärvideo", "Explainer")}</span>
          <span style={{ display: "block", fontSize: 15.5, fontWeight: 700, color: C.tinte, lineHeight: 1.3 }}>{f.titel()}</span>
        </span>
      </div>
      {sicht
        ? <Player szene={{ dauer: f.dauer, hoehe: f.hoehe, schritte: f.schritte(), zeichne: f.zeichne, beschreibung: f.beschreibung() }} />
        : <div style={{ background: C.sand, borderRadius: 14, border: `1px solid ${C.linie}`, maxWidth: 480, margin: "0 auto", aspectRatio: `360 / ${f.hoehe + 14}` }} />}
    </div>
  );
}
