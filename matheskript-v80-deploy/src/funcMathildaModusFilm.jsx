/* ======================================================================
   Motion-Video zum Mathilda-Modus: Blanko statt Karo, schwarzer Stift,
   Aufgabe oben aufs Blatt, nach dem Schema rechnen (ein Schritt pro Zeile,
   „=“ untereinander), Ergebnis in den Kasten, nur diese Aufgabe
   fotografieren, ab an Mathilda.
   Nutzt den Player aus funcErklaeranimation.jsx (szene = { dauer, hoehe,
   schritte, zeichne(t), beschreibung }). Keine base-Datei importiert das.
   ====================================================================== */
import React from "react";
import { C } from "./base1.jsx";
import { Player, lauf, T } from "./funcErklaeranimation.jsx";
import { zw } from "./ui2.jsx";

const TINTE = "#101827";
const ROT = "#C8372D";          // Rotstift – nur zum Durchstreichen
const HAND = "'Patrick Hand', 'Segoe Print', sans-serif";

/* Beispiel: 2(x + 3) − 4 = 10  →  x = 4 (jede Zeile vollständig vereinfacht, A5) */
const ZEILEN = [
  { l: "2(x + 3) − 4", r: "10", y: 66, von: 5.2, bis: 7.6 },
  { l: "2x + 6 − 4", r: "10", y: 102, von: 9.0, bis: 10.4 },
  { l: "2x + 2", r: "10", op: "| − 2", y: 138, von: 10.8, bis: 12.0 },
  { l: "2x", r: "8", op: "| : 2", y: 174, von: 12.4, bis: 13.4 },
  { l: "x", r: "4", y: 210, von: 13.8, bis: 14.6 },
];
const GL_X = 196;                 // alle Gleichheitszeichen auf dieser Linie
const SCHREIB_X0 = 70, SCHREIB_B = 250;

const schritte = () => [
  { von: 0, text: zw("Nimm ein weißes Blankoblatt und einen schwarzen Stift. Auf Karo verschwimmen die Abstände – auf Blanko siehst du sofort, was zusammengehört.", "Take a plain white sheet and a black pen. On squared paper the spacing gets lost – on plain paper you see at once what belongs together.") },
  { von: 4.6, text: zw("Schreib die Aufgabe einmal oben aufs Blatt – genau so, wie sie in der App steht: die Gleichung, die Funktion, die du ableiten sollst …", "Write the task once at the top of the sheet – exactly as it appears in the app: the equation, the function to differentiate …") },
  { von: 8.6, text: zw("Jetzt rechnest du nach dem Schema: ein Schritt pro Zeile, die Gleichheitszeichen genau untereinander, die Umformung rechts am Rand.", "Now calculate following the scheme: one step per line, the equals signs exactly below each other, the operation at the right margin.") },
  { von: 15, text: zw("Das Ergebnis kommt in einen Kasten – vollständig vereinfacht. So sieht jeder sofort, wo deine Rechnung endet.", "The result goes in a box – fully simplified. Then anyone sees at once where your work ends.") },
  { von: 17.6, text: zw("Fotografiere nur diese eine Aufgabe: gerade von oben, bei gutem Licht, nichts anderes im Bild.", "Photograph only this one task: straight from above, in good light, nothing else in the frame.") },
  { von: 22.2, text: zw("Ab an Mathilda. Sie prüft Ergebnis und Weg – verrät dir aber nicht die Lösung, sondern zeigt dir höchstens zwei Dinge, die dein Blatt noch klarer machen.", "Off to Mathilda. She checks your result and your work – without giving away the answer – and shows you at most two things that make your sheet even clearer.") },
];

function Stift({ x, y, o = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(38)`} opacity={o}>
      <path d="M-4.2 -13 L4.2 -13 L0 0 Z" fill={TINTE} />
      <rect x="-5.2" y="-74" width="10.4" height="62" rx="3" fill={TINTE} />
      <rect x="-5.2" y="-36" width="10.4" height="5" fill={C.flaggold} />
      <rect x="-1.4" y="-72" width="2.8" height="22" rx="1.4" fill="#3A4256" />
    </g>
  );
}

function zeichne(t) {
  /* Szene 1: Karo durchgestrichen, Blanko gewinnt */
  const s1 = 1 - lauf(t, 4.2, 4.9);
  const karo = lauf(t, 0.2, 1.0) * s1, strich = lauf(t, 1.6, 2.6), blanko = lauf(t, 2.4, 3.4);
  /* Szene 2+: großes Blatt */
  const blatt = lauf(t, 4.4, 5.2);
  const kasten = lauf(t, 15.2, 16.4);
  const telefon = lauf(t, 17.8, 18.8) * (1 - lauf(t, 21.4, 22.0));
  const blitz = Math.max(0, 1 - Math.abs(t - 20.2) / 0.35);
  const flug = lauf(t, 22.0, 23.6);
  const blase = lauf(t, 23.8, 24.8), blase2 = lauf(t, 25.0, 26.0);

  /* aktive Schreibzeile → Stiftspitze */
  let stift = null;
  ZEILEN.forEach((z) => {
    if (t >= z.von && t <= z.bis + 0.15) stift = { x: SCHREIB_X0 + SCHREIB_B * lauf(t, z.von, z.bis), y: z.y + 2 };
  });
  if (t >= 15.2 && t <= 16.5) {
    const p = lauf(t, 15.2, 16.4);
    stift = { x: GL_X - 34 + 92 * p, y: 222 - 4 * Math.sin(p * Math.PI) };
  }
  const stiftZu = blatt * (1 - lauf(t, 16.6, 17.2));

  /* Blatt fliegt zu Mathilda: Mittelpunkt (180|140) → (58|292), kleiner */
  const cx = 180 + (58 - 180) * flug, cy = 140 + (292 - 140) * flug, sk = 1 - 0.86 * flug;
  const blattTransform = `translate(${cx} ${cy}) scale(${sk}) translate(-180 -140)`;

  return (
    <g>
      <defs>
        {ZEILEN.map((z, i) => (
          <clipPath key={i} id={`mmf-clip-${i}`}>
            <rect x={SCHREIB_X0 - 10} y={z.y - 26} width={(SCHREIB_B + 30) * lauf(t, z.von, z.bis)} height="36" />
          </clipPath>
        ))}
      </defs>

      {/* ---------- Szene 1 ---------- */}
      {s1 > 0.01 && (
        <g opacity={s1}>
          <g opacity={karo}>
            <rect x="26" y="40" width="138" height="178" rx="6" fill="#fff" stroke={C.linie} />
            {Array.from({ length: 13 }, (_, i) => <path key={`h${i}`} d={`M26 ${48 + i * 13.5} H164`} stroke="#C9D7EA" strokeWidth="1" />)}
            {Array.from({ length: 10 }, (_, i) => <path key={`v${i}`} d={`M${34 + i * 13.5} 40 V218`} stroke="#C9D7EA" strokeWidth="1" />)}
            <T x="95" y="242" textAnchor="middle" fontSize="13" fontWeight="700" fill={C.grau}>{zw("Karo", "Squared")}</T>
            <path d={`M34 210 L${34 + 122 * strich} ${210 - 162 * strich}`} stroke={ROT} strokeWidth="4" strokeLinecap="round" />
          </g>
          <g opacity={blanko} transform={`translate(0 ${8 * (1 - blanko)})`}>
            <rect x="196" y="40" width="138" height="178" rx="6" fill="#fff" stroke={C.linie} />
            <T x="265" y="242" textAnchor="middle" fontSize="13" fontWeight="800" fill={C.see}>{zw("Blanko", "Plain")} ✓</T>
            <Stift x={286} y={170} />
          </g>
        </g>
      )}

      {/* ---------- Blatt mit Rechnung ---------- */}
      {blatt > 0.01 && (
        <g opacity={blatt * (1 - 0.15 * flug)} transform={blattTransform}>
          <rect x="34" y="22" width="292" height="232" rx="8" fill="#fff" stroke={C.linie} strokeWidth="1.2"
            style={{ filter: "drop-shadow(0 4px 10px rgba(15,26,51,0.10))" }} />
          {ZEILEN.map((z, i) => (
            <g key={i} clipPath={`url(#mmf-clip-${i})`} style={{ fontFamily: HAND }}>
              <T x={GL_X - 10} y={z.y} textAnchor="end" fontSize="22" fill={TINTE} style={{ fontFamily: HAND }}>{z.l}</T>
              <T x={GL_X} y={z.y} textAnchor="middle" fontSize="22" fill={TINTE} style={{ fontFamily: HAND }}>=</T>
              <T x={GL_X + 12} y={z.y} fontSize="22" fill={TINTE} style={{ fontFamily: HAND }}>{z.r}</T>
              {z.op && <T x="262" y={z.y} fontSize="17" fill="#4A5570" style={{ fontFamily: HAND }}>{z.op}</T>}
            </g>
          ))}
          {/* Trennlinie unter der Aufgabe */}
          <path d={`M60 80 H${60 + 240 * lauf(t, 7.8, 8.6)}`} stroke={TINTE} strokeWidth="1.2" strokeLinecap="round" opacity="0.55" />
          {/* Ergebniskasten */}
          <rect x={GL_X - 34} y="188" width="78" height="32" rx="5" fill="none" stroke={TINTE} strokeWidth="2"
            strokeDasharray="230" strokeDashoffset={230 * (1 - kasten)} opacity={kasten > 0 ? 1 : 0} />
          {/* Hilfslinie „= untereinander“ */}
          <path d={`M${GL_X} 84 V218`} stroke={C.flaggold} strokeWidth="2" strokeDasharray="4 5" opacity={lauf(t, 14.8, 15.2) * (1 - lauf(t, 16.8, 17.4)) * 0.9} />
          {stift && <Stift x={stift.x} y={stift.y} o={stiftZu} />}
        </g>
      )}

      {/* ---------- Handy rahmt nur diese Aufgabe ---------- */}
      {telefon > 0.01 && (
        <g opacity={telefon} transform={`translate(180 140) scale(${0.9 + 0.1 * telefon}) translate(-180 -140)`}>
          <rect x="18" y="4" width="324" height="270" rx="26" fill="none" stroke={C.seeTief} strokeWidth="9" />
          <rect x="150" y="8" width="60" height="7" rx="3.5" fill={C.seeTief} />
          {[[44, 30, 1, 1], [316, 30, -1, 1], [44, 248, 1, -1], [316, 248, -1, -1]].map(([x, y, dx, dy], i) => (
            <path key={i} d={`M${x} ${y + 18 * dy} V${y} H${x + 18 * dx}`} fill="none" stroke={C.flaggold} strokeWidth="3.5" strokeLinecap="round" />
          ))}
          <T x="180" y="300" textAnchor="middle" fontSize="13.5" fontWeight="700" fill={C.see}>{zw("Nur diese Aufgabe · gerade von oben", "Only this task · straight from above")}</T>
        </g>
      )}
      {blitz > 0 && <rect x="0" y="0" width="360" height="330" fill="#fff" opacity={blitz * 0.85} />}

      {/* ---------- Mathilda ---------- */}
      {flug > 0.01 && (
        <g>
          <circle cx="58" cy="292" r={24 + 3 * blase} fill={C.seeTief} stroke={C.flaggold} strokeWidth="2" opacity={lauf(t, 21.6, 22.2)} />
          <T x="58" y="299" textAnchor="middle" fontSize="20" fontWeight="800" fill={C.flaggold} opacity={lauf(t, 21.6, 22.2)}>M</T>
          <g opacity={blase} transform={`translate(0 ${6 * (1 - blase)})`}>
            <rect x="94" y="262" width="250" height="60" rx="14" fill="#fff" stroke={C.linie} />
            <path d="M94 286 L84 292 L94 298 Z" fill="#fff" stroke={C.linie} />
            <T x="108" y="284" fontSize="13.5" fontWeight="800" fill={C.smaragd}>✓ {zw("Ergebnis stimmt", "Result is correct")}</T>
            <T x="108" y="306" fontSize="12.5" fontWeight="600" fill={C.grau} opacity={blase2}>{zw("Ein Hebel: Umformung an den Rand", "One lever: operation to the margin")}</T>
          </g>
        </g>
      )}
    </g>
  );
}

export const modusSzene = () => ({
  dauer: 27,
  hoehe: 330,
  schritte: schritte(),
  zeichne,
  beschreibung: zw("Animation: Eine Gleichung wird mit schwarzem Stift auf weißem Blankopapier Schritt für Schritt gelöst, das Ergebnis eingerahmt, nur diese Aufgabe fotografiert und an Mathilda geschickt.",
    "Animation: an equation is solved step by step with a black pen on plain white paper, the result boxed, only this task photographed and sent to Mathilda."),
});

export function MathildaModusFilm() {
  return <Player szene={modusSzene()} />;
}
