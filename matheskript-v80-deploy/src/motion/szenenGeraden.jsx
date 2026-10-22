/* ============================================================
   Szenen der Geraden (Mittelstufe), Präfix g_. Vertrag siehe kern.jsx, Norm siehe NORM.md.
   g_zweipunkte – Gerade durch zwei Punkte: Steigungsdreieck → m, ein Schritt zurück bis x = 0 → c, Gleichung.
   Dasselbe Beispiel wie der Geradentrainer beim Öffnen („Zwei Punkte“): P(1 | 3), Q(3 | 7) → y = 2x + 1.
   Farben wie im Werkzeug: P Blau, Q Gold; das Steigungsdreieck ist der Kern-Moment (Gold), die Gerade das Ergebnis (Grün).
   Texte (frage, kern) in medienGeraden.js.
   ============================================================ */
import React from "react";
import { F, Tx, Strich, Puls, SvgBruch, de, mix, teil } from "./kern.jsx";

const P = [1, 3], Q = [3, 7];
const DX = Q[0] - P[0], DY = Q[1] - P[1];            // 2 und 4
const M = DY / DX;                                      // 2
const C0 = P[1] - M * P[0];                             // 1
const E = 22, OX = 36, OY = 214;                        // Einheit in px, Lage des Ursprungs
const X = (x) => OX + E * x, Y = (y) => OY - E * y;
const XMIN = -1, XMAX = 4.6, YMIN = -1, YMAX = 8.3;
const g = (x) => M * x + C0;

const g_zweipunkte = {
  h: 250,
  label: () => "Gerade durch P(1 | 3) und Q(3 | 7): Das Steigungsdreieck zeigt 2 nach rechts und 4 nach oben, also m = 2. Ein Schritt von P zurück bis x = 0 führt 2 nach unten zu c = 1. Die Gerade ist y = 2x + 1.",
  ablauf: () => [
    { k: "punkte", ms: 1800, text: "Zwei Punkte P(1 | 3) und Q(3 | 7) – genau eine Gerade geht durch beide." },
    { k: "dreieck", ms: 2400, text: "Von P nach Q: 2 nach rechts und 4 nach oben – das Steigungsdreieck." },
    { k: "steigung", ms: 2000, text: "m = Δy durch Δx = 4 durch 2 = 2 – pro Schritt nach rechts 2 nach oben." },
    { k: "zurueck", ms: 2400, text: "Von P einen Schritt nach links heißt 2 nach unten: bei x = 0 ist c = 1." },
    { k: "gerade", ms: 2200, text: "Die Gerade y = 2x + 1 – Probe mit Q: 2 · 3 + 1 = 7." },
  ],
  bild: ({ Z, z }) => {
    const uP = Z("punkte"), uD = z("dreieck"), uS = Z("steigung"), uZ = z("zurueck"), uG = Z("gerade");
    const [px, py] = [X(P[0]), Y(P[1])], [qx, qy] = [X(Q[0]), Y(Q[1])], [rx, ry] = [X(Q[0]), Y(P[1])];
    const [sx, sy] = [X(P[0]), Y(C0)], [cx, cy] = [X(0), Y(C0)];   // zurück: erst m nach unten (bei x von P), dann 1 nach links
    /* Steigungsdreieck: erst nach rechts (Δx), dann nach oben (Δy) */
    const d1 = teil(uD, 0.05, 0.45), d2 = teil(uD, 0.5, 0.9);
    /* Schritt zurück: m nach unten, dann 1 nach links bis zur y-Achse (so liegen beide Wege neben der Achse, nicht auf ihr) */
    const z1 = teil(uZ, 0.05, 0.4), z2 = teil(uZ, 0.45, 0.8);
    const cAn = teil(uZ, 0.8, 1);
    const xVon = -0.5, xBis = 3.6;
    const xEnde = mix(xVon, xBis, uG);
    const raster = [];
    for (let x = Math.ceil(XMIN); x <= Math.floor(XMAX); x++) raster.push(<line key={"x" + x} x1={X(x)} y1={Y(YMIN)} x2={X(x)} y2={Y(YMAX)} stroke={F.linie} strokeWidth="1" />);
    for (let y = Math.ceil(YMIN); y <= Math.floor(YMAX); y++) raster.push(<line key={"y" + y} x1={X(XMIN)} y1={Y(y)} x2={X(XMAX)} y2={Y(y)} stroke={F.linie} strokeWidth="1" />);
    const R = 168;                                       // linker Rand der Rechenspalte
    return (
      <>
        {/* Koordinatensystem mit Karos (Thema Koordinaten) */}
        <g opacity={teil(uP, 0, 0.5) * 0.6 + 0.4}>
          {raster}
          <line x1={X(XMIN)} y1={OY} x2={X(XMAX) + 4} y2={OY} stroke={F.tinte} strokeWidth="1.5" />
          <line x1={OX} y1={Y(YMIN)} x2={OX} y2={Y(YMAX) - 4} stroke={F.tinte} strokeWidth="1.5" />
          <path d={`M${X(XMAX) + 4} ${OY} l-7 -4 v8 Z`} fill={F.tinte} />
          <path d={`M${OX} ${Y(YMAX) - 4} l-4 7 h8 Z`} fill={F.tinte} />
          <Tx x={X(XMAX) + 2} y={OY + 15} g={11} f={F.grau} w={700} fontStyle="italic">x</Tx>
          <Tx x={OX + 9} y={Y(YMAX) + 6} g={11} f={F.grau} w={700} fontStyle="italic">y</Tx>
          {[1, 2, 3, 4].map((v) => <Tx key={"tx" + v} x={X(v)} y={OY + 13} g={9.5} f={F.grau} w={600}>{v}</Tx>)}
          {[2, 4, 6, 8].map((v) => <Tx key={"ty" + v} x={OX - 8} y={Y(v) + 3.5} g={9.5} f={F.grau} w={600} a="end">{v}</Tx>)}
        </g>

        {/* Ergebnis-Gerade (Grün), läuft am Ende einmal durch */}
        {uG > 0 && <line x1={X(xVon)} y1={Y(g(xVon))} x2={X(xEnde)} y2={Y(g(xEnde))} stroke={F.gruen} strokeWidth="3" strokeLinecap="round" />}

        {/* Steigungsdreieck (Kern-Moment, Gold) */}
        {d2 > 0 && <polygon points={`${px},${py} ${rx},${ry} ${qx},${mix(ry, qy, d2)}`} fill={F.gold} fillOpacity="0.2" />}
        <Strich x1={px} y1={py} x2={rx} y2={ry} u={d1} f={F.goldDunkel} b={2.4} strokeDasharray="5 4" />
        <Strich x1={rx} y1={ry} x2={qx} y2={qy} u={d2} f={F.goldDunkel} b={2.4} strokeDasharray="5 4" />
        <Tx x={(px + rx) / 2 + 4} y={ry - 6} g={11.5} f={F.goldDunkel} w={800} o={teil(d1, 0.6, 1)}>Δx = 2</Tx>
        <Tx x={rx + 6} y={(ry + qy) / 2 + 4} g={11.5} f={F.goldDunkel} w={800} a="start" o={teil(d2, 0.6, 1)}>Δy = 4</Tx>
        <Puls x={(px + qx) / 2} y={(ry + qy) / 2 + 12} u={teil(uS, 0.1, 0.9)} r={22} f={F.gold} />

        {/* Schritt zurück bis zur y-Achse: 2 nach unten, dann 1 nach links */}
        <Strich x1={px} y1={py} x2={sx} y2={sy} u={z1} f={F.blau} b={2.2} strokeDasharray="4 3" />
        <Strich x1={sx} y1={sy} x2={cx} y2={cy} u={z2} f={F.blau} b={2.2} strokeDasharray="4 3" />
        <Tx x={sx + 6} y={(py + sy) / 2 + 4} g={10.5} f={F.blau} w={800} a="start" o={teil(z1, 0.6, 1)}>−2</Tx>
        <Tx x={(sx + cx) / 2} y={sy + 15} g={10.5} f={F.blau} w={800} o={teil(z2, 0.6, 1)}>−1</Tx>
        {cAn > 0 && <circle cx={cx} cy={cy} r="5.5" fill={F.gruen} stroke={F.weiss} strokeWidth="2" opacity={cAn} />}
        <Tx x={cx - 9} y={cy + 4} g={11.5} f={F.gruen} w={800} a="end" o={cAn}>c</Tx>

        {/* Punkte */}
        <g opacity={teil(uP, 0.1, 0.6)}>
          <circle cx={px} cy={py} r="6" fill={F.blau} stroke={F.weiss} strokeWidth="2" />
          <Tx x={px - 10} y={py - 7} g={13} f={F.blau} w={800} a="end" fontStyle="italic">P</Tx>
        </g>
        <g opacity={teil(uP, 0.4, 0.9)}>
          <circle cx={qx} cy={qy} r="6" fill={F.gold} stroke={F.weiss} strokeWidth="2" />
          <Tx x={qx - 10} y={qy - 4} g={13} f={F.goldDunkel} w={800} a="end" fontStyle="italic">Q</Tx>
        </g>

        {/* Rechenspalte: Vorher (Punkte) bleibt stehen, darunter m, c und die Gleichung */}
        <Tx x={R} y={36} g={14} f={F.blau} w={800} a="start" o={teil(uP, 0.1, 0.6)}>P(1 | 3)</Tx>
        <Tx x={R + 92} y={36} g={14} f={F.goldDunkel} w={800} a="start" o={teil(uP, 0.4, 0.9)}>Q(3 | 7)</Tx>
        <g opacity={teil(uS, 0, 0.4)}>
          <Tx x={R} y={90} g={15} f={F.tinte} w={800} a="start">m =</Tx>
          <SvgBruch x={R + 66} y={86} z="7 − 3" n="3 − 1" g={14} f={F.tinte} />
          <Tx x={R + 104} y={90} g={15} f={F.tinte} w={700}>=</Tx>
          <SvgBruch x={R + 122} y={86} z="4" n="2" g={14} f={F.goldDunkel} />
          <Tx x={R + 140} y={90} g={15} f={F.tinte} w={700} a="start">=</Tx>
          <Tx x={R + 156} y={90} g={17} f={F.goldDunkel} w={900} a="start">{de(M)}</Tx>
        </g>
        <g opacity={teil(uZ, 0.75, 1)}>
          <Tx x={R} y={148} g={15} f={F.tinte} w={800} a="start">c = 3 − 2 · 1 =</Tx>
          <Tx x={R + 128} y={148} g={17} f={F.gruen} w={900} a="start">{de(C0)}</Tx>
          <Tx x={R} y={166} g={10.5} f={F.grau} w={600} a="start">y von P minus m mal x von P</Tx>
        </g>
        <g opacity={teil(uG, 0.15, 0.6)}>
          <rect x={R - 6} y={186} width={186} height={38} rx={12} fill={F.gruenHell} stroke={F.gruen} strokeWidth="1.4" />
          <Tx x={R + 87} y={212} g={21} f={F.gruen} w={900}>y = 2x + 1</Tx>
        </g>
        <Tx x={R + 87} y={242} g={11} f={F.grau} w={700} o={teil(uG, 0.6, 1)}>Probe Q: 2 · 3 + 1 = 7 ✓</Tx>
      </>
    );
  },
};

export const SZENEN_GERADEN = { g_zweipunkte };
