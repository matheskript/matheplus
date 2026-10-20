/* ============================================================
   Motive der Dokument-Karten (Seite „Dokumente“), Folienoptik wie die Kurs-Kacheln.
   viewBox 0 0 160 120. Die beiden Schulbuch-Motive (Tangente, Ebene) kommen aus
   funcKursMotive.jsx; hier stehen die übrigen. Jedes Motiv bekommt
   id (eindeutig je Vorkommen, für Verläufe), linie (Strichfarbe passend zum Lack)
   und tief (dunkle Füllfarbe des Lacks).
   ============================================================ */
import React from "react";
import { FOLIE } from "./kursFarben.js";
import { MotivTangente, MotivEbene } from "./funcKursMotive.jsx";

function Verlaeufe({ id, schein = "#F2C14E" }) {
  return (
    <defs>
      <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1">
        {FOLIE.gold.map((f, i) => <stop key={i} offset={`${(i / (FOLIE.gold.length - 1)) * 100}%`} stopColor={f} />)}
      </linearGradient>
      <linearGradient id={`${id}-silber`} x1="0" y1="0" x2="1" y2="1">
        {FOLIE.silber.map((f, i) => <stop key={i} offset={`${(i / (FOLIE.silber.length - 1)) * 100}%`} stopColor={f} />)}
      </linearGradient>
      <radialGradient id={`${id}-schein`} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={schein} stopOpacity="0.5" />
        <stop offset="100%" stopColor={schein} stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

/* Kurvendiskussion: Polynom 3. Grades mit Hoch- und Tiefpunkt (waagrechte Tangenten in Gold) */
function MotivExtrem({ id, klasse, linie }) {
  const g = `url(#${id}-gold)`;
  // f(x) = (x^3 - 3x) skaliert: Hochpunkt bei x = −1, Tiefpunkt bei x = 1
  const pkt = [];
  for (let i = 0; i <= 40; i++) {
    const x = -2.05 + (i / 40) * 4.1;
    const y = x * x * x - 3 * x;
    pkt.push(`${(80 + x * 32).toFixed(1)},${(62 - y * 15).toFixed(1)}`);
  }
  return (
    <svg className={klasse} viewBox="0 0 160 120" aria-hidden="true">
      <Verlaeufe id={id} />
      <circle cx="80" cy="62" r="54" fill={`url(#${id}-schein)`} />
      <path d="M12 62 H150 M80 8 V114" stroke={linie} strokeOpacity="0.22" strokeWidth="1.4" />
      <polyline points={pkt.join(" ")} fill="none" stroke={linie} strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="30" y1="32" x2="66" y2="32" stroke={g} strokeWidth="3.4" strokeLinecap="round" />
      <line x1="94" y1="92" x2="130" y2="92" stroke={g} strokeWidth="3.4" strokeLinecap="round" />
      <circle cx="48" cy="32" r="6.2" fill={g} stroke={linie} strokeWidth="2" />
      <circle cx="112" cy="92" r="6.2" fill={g} stroke={linie} strokeWidth="2" />
    </svg>
  );
}

/* Druckausgabe (Innenteil): gestapelte Seiten mit QR-Ecke */
function MotivDruck({ id, klasse, linie, tief }) {
  const g = `url(#${id}-gold)`;
  return (
    <svg className={klasse} viewBox="0 0 160 120" aria-hidden="true">
      <Verlaeufe id={id} />
      <circle cx="86" cy="60" r="54" fill={`url(#${id}-schein)`} />
      <rect x="56" y="10" width="72" height="96" rx="5" fill="#FFFFFF" fillOpacity="0.55" transform="rotate(8 92 58)" />
      <rect x="50" y="12" width="72" height="96" rx="5" fill="#FFFFFF" fillOpacity="0.75" transform="rotate(3 86 60)" />
      <rect x="44" y="14" width="72" height="96" rx="5" fill="#FFFFFF" stroke={g} strokeWidth="2.4" />
      <path d="M54 30 h40 M54 40 h52 M54 50 h46 M54 60 h50" stroke={tief} strokeOpacity="0.5" strokeWidth="3" strokeLinecap="round" />
      <path d="M56 86 C 66 70, 76 70, 82 80 S 96 92, 104 72" fill="none" stroke={linie === "#FFFFFF" ? tief : linie} strokeWidth="2.6" strokeLinecap="round" />
      <g transform="translate(92 86)">
        <rect width="18" height="18" rx="2" fill={tief} />
        <rect x="2.5" y="2.5" width="5" height="5" fill={g} /><rect x="10.5" y="2.5" width="5" height="5" fill={g} />
        <rect x="2.5" y="10.5" width="5" height="5" fill={g} /><rect x="11" y="11" width="3" height="3" fill={g} />
      </g>
    </svg>
  );
}

/* Umschlag: aufgeklapptes Cover – Rückseite, Rücken, Vorderseite */
function MotivUmschlag({ id, klasse, linie, tief }) {
  const g = `url(#${id}-gold)`;
  return (
    <svg className={klasse} viewBox="0 0 160 120" aria-hidden="true">
      <Verlaeufe id={id} />
      <circle cx="80" cy="62" r="56" fill={`url(#${id}-schein)`} />
      <rect x="10" y="22" width="66" height="84" rx="3" fill={tief} stroke={g} strokeWidth="2" />
      <rect x="76" y="22" width="8" height="84" fill={g} />
      <rect x="84" y="22" width="66" height="84" rx="3" fill={tief} stroke={g} strokeWidth="2" />
      <path d="M94 40 h44 M94 50 h30" stroke={g} strokeWidth="4" strokeLinecap="round" />
      <path d="M96 92 C 106 70, 118 66, 140 74" fill="none" stroke={`url(#${id}-silber)`} strokeWidth="3" strokeLinecap="round" />
      <path d="M20 40 h40 M20 50 h46 M20 60 h34" stroke={linie} strokeOpacity="0.45" strokeWidth="2.6" strokeLinecap="round" />
      <rect x="44" y="82" width="24" height="16" rx="1.5" fill="#FFFFFF" />
      <path d="M48 85 v10 M51 85 v10 M53 85 v10 M57 85 v10 M60 85 v10 M64 85 v10" stroke="#0B0C10" strokeWidth="1.2" />
    </svg>
  );
}

/* Businessplan: steigende Säulen mit Trendlinie und Pfeil */
function MotivDiagramm({ id, klasse, linie }) {
  const g = `url(#${id}-gold)`;
  return (
    <svg className={klasse} viewBox="0 0 160 120" aria-hidden="true">
      <Verlaeufe id={id} schein="#EDBB00" />
      <circle cx="96" cy="58" r="56" fill={`url(#${id}-schein)`} />
      <path d="M18 106 H150 M18 106 V14" stroke={linie} strokeOpacity="0.3" strokeWidth="1.6" />
      <rect x="34" y="78" width="20" height="28" rx="3" fill={`url(#${id}-silber)`} />
      <rect x="66" y="58" width="20" height="48" rx="3" fill={`url(#${id}-silber)`} />
      <rect x="98" y="34" width="20" height="72" rx="3" fill={g} />
      <path d="M30 72 L62 52 L94 30 L132 14" fill="none" stroke={g} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M134 13 l-11 -1 l5 9 z" fill={g} />
      <text x="126" y="98" fontSize="14" fontWeight="800" fill={g} fontFamily="Montserrat, sans-serif">€</text>
    </svg>
  );
}

/* Arbeitsheft: Blankoblatt mit Rechnung und Stift */
function MotivHeft({ id, klasse, tief }) {
  const g = `url(#${id}-gold)`;
  return (
    <svg className={klasse} viewBox="0 0 160 120" aria-hidden="true">
      <Verlaeufe id={id} schein="#EDBB00" />
      <circle cx="78" cy="62" r="54" fill={`url(#${id}-schein)`} />
      <rect x="30" y="12" width="80" height="100" rx="5" fill="#FFFFFF" stroke={`url(#${id}-silber)`} strokeWidth="2" transform="rotate(-6 70 62)" />
      <g transform="rotate(-6 70 62)" fontFamily="Montserrat, sans-serif" fontWeight="700" fill={tief}>
        <text x="42" y="40" fontSize="12">2x + 3 = 11</text>
        <text x="56" y="60" fontSize="12">2x = 8</text>
        <text x="60" y="80" fontSize="12">x = 4</text>
        <rect x="55" y="68" width="34" height="17" rx="3" fill="none" stroke={g} strokeWidth="2.2" />
      </g>
      <g transform="rotate(38 128 64)">
        <rect x="122" y="18" width="12" height="74" rx="3" fill={g} />
        <rect x="122" y="18" width="12" height="10" rx="3" fill={tief} />
        <path d="M122 92 L128 108 L134 92 Z" fill="#F4F6FA" />
        <path d="M126.4 103.5 L128 108 L129.6 103.5 Z" fill="#0B0C10" />
      </g>
    </svg>
  );
}

/* Grundlagendokument: aufgeschlagenes Buch mit Lichtstrahl */
function MotivBuch({ id, klasse, linie }) {
  const g = `url(#${id}-gold)`;
  return (
    <svg className={klasse} viewBox="0 0 160 120" aria-hidden="true">
      <Verlaeufe id={id} schein="#EDBB00" />
      <path d="M62 -6 L98 -6 L132 92 L28 92 Z" fill={`url(#${id}-schein)`} opacity="0.85" />
      <path d="M80 44 C 62 34, 36 34, 16 40 V 104 C 36 98, 62 98, 80 108 Z" fill="#FFFFFF" fillOpacity="0.92" stroke={g} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M80 44 C 98 34, 124 34, 144 40 V 104 C 124 98, 98 98, 80 108 Z" fill="#FFFFFF" fillOpacity="0.92" stroke={g} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M80 44 V108" stroke={g} strokeWidth="2.6" />
      <path d="M28 56 C 44 52, 58 52, 70 56 M28 68 C 44 64, 58 64, 70 68 M28 80 C 44 76, 58 76, 70 80" fill="none" stroke={linie === "#FFFFFF" ? "#5A4300" : linie} strokeOpacity="0.45" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M90 56 C 102 52, 116 52, 132 56 M90 68 C 102 64, 116 64, 132 68" fill="none" stroke="#5A4300" strokeOpacity="0.45" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M112 12 l2.6 7 l7 2.6 l-7 2.6 l-2.6 7 l-2.6 -7 l-7 -2.6 l7 -2.6z" fill={g} />
    </svg>
  );
}

const MOTIVE = {
  extrem: MotivExtrem,
  druck: MotivDruck,
  umschlag: MotivUmschlag,
  diagramm: MotivDiagramm,
  heft: MotivHeft,
  buch: MotivBuch,
};
export const MOTIV_NAMEN = ["tangente", "ebene", ...Object.keys(MOTIVE)];

export function DokumentMotiv({ name, id, klasse, linie, tief }) {
  if (name === "tangente") return <MotivTangente id={id} klasse={klasse} />;
  if (name === "ebene") return <MotivEbene id={id} klasse={klasse} />;
  const M = MOTIVE[name] || MotivBuch;
  return <M id={id} klasse={klasse} linie={linie} tief={tief} />;
}
