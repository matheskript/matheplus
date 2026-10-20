/* ============================================================
   Die vier Kurs-Motive in Folienoptik (viewBox 0 0 160 120): Tangente
   (Differentialrechnung), Ebene (Vektoren), Bühne (GFS), Dialog (KI).
   Gemeinsam genutzt von den Startseiten-Kacheln und den Köpfen der Kursseiten.
   id muss je Vorkommen eindeutig sein (SVG-Verläufe und -Filter hängen daran).
   ============================================================ */
import React from "react";
import { C } from "./base1.jsx";
import { FOLIE } from "./kursFarben.js";

function Defs({ id, folie, schein }) {
  return (
    <defs>
      <linearGradient id={`${id}-folie`} x1="0" y1="0" x2="1" y2="1">
        {folie.map((f, i) => <stop key={i} offset={`${(i / (folie.length - 1)) * 100}%`} stopColor={f} />)}
      </linearGradient>
      <radialGradient id={`${id}-schein`} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={schein} stopOpacity="0.55" />
        <stop offset="100%" stopColor={schein} stopOpacity="0" />
      </radialGradient>
      <filter id={`${id}-weich`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.2" /></filter>
    </defs>
  );
}

/* ---------- Die vier Motive (viewBox 0 0 160 120) ---------- */
/* Differentialrechnung: Kurve, Tangente als dunkle Prägung, Berührpunkt */
export function MotivTangente({ id, klasse = "kk-motiv" }) {
  const f = `url(#${id}-folie)`;
  return (
    <svg className={klasse} viewBox="0 0 160 120" aria-hidden="true">
      <Defs id={id} folie={FOLIE.praegung} schein="#FFFFFF" />
      <circle cx="84" cy="62" r="56" fill={`url(#${id}-schein)`} />
      <path d="M14 104 H150 M30 12 V108" stroke={C.nachtschwarz} strokeOpacity="0.18" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M10 98 C 40 98, 52 26, 82 30 S 122 86, 152 20" stroke={C.nachtschwarz} strokeWidth="4.4" fill="none" strokeLinecap="round" />
      <line x1="30" y1="100" x2="98" y2="18" stroke={f} strokeWidth="3.6" strokeLinecap="round" />
      <circle cx="58" cy="66.2" r="7" fill={f} stroke={C.weiss} strokeWidth="2.4" />
      <text x="126" y="108" fontSize="17" fontStyle="italic" fontWeight="700" fill={C.babyblauTief} fontFamily="Montserrat, sans-serif">f′</text>
    </svg>
  );
}

/* Vektoren, Geraden und Ebenen: Ebene, durchstoßende Gerade, Normalenvektor in Gold */
export function MotivEbene({ id, klasse = "kk-motiv" }) {
  const f = `url(#${id}-folie)`;
  return (
    <svg className={klasse} viewBox="0 0 160 120" aria-hidden="true">
      <Defs id={id} folie={FOLIE.gold} schein="#2457C5" />
      <circle cx="86" cy="64" r="58" fill={`url(#${id}-schein)`} />
      <path d="M44 106 V22 M44 106 H152 M44 106 L12 120" stroke={C.vkHell} strokeOpacity="0.45" strokeWidth="1.4" />
      <path d="M18 96 L104 84 L148 28 L62 40 Z" fill={C.vkHell} fillOpacity="0.16" stroke={C.vkHell} strokeOpacity="0.85" strokeWidth="1.8" strokeLinejoin="round" />
      <line x1="8" y1="26" x2="154" y2="110" stroke={C.weiss} strokeWidth="4" strokeLinecap="round" />
      <line x1="82" y1="68.6" x2="98" y2="14" stroke={f} strokeWidth="3.6" strokeLinecap="round" />
      <path d="M98 14 l-9.5 6.4 l8.4 4.6 z" fill={f} />
      <circle cx="82" cy="68.6" r="6.5" fill={f} stroke={C.vkNacht} strokeWidth="2.2" />
      <text x="124" y="56" fontSize="17" fontStyle="italic" fontWeight="700" fill={f} fontFamily="Montserrat, sans-serif">E</text>
    </svg>
  );
}

/* GFS: die Bühne – Spot von oben, Tafel mit dem Pascalschen Dreieck, Rednerpult */
export function MotivBuehne({ id, klasse = "kk-motiv" }) {
  const f = `url(#${id}-folie)`;
  return (
    <svg className={klasse} viewBox="0 0 160 120" aria-hidden="true">
      <Defs id={id} folie={FOLIE.gold} schein="#EDBB00" />
      <path d="M62 -4 L98 -4 L150 112 L10 112 Z" fill={`url(#${id}-schein)`} opacity="0.75" />
      <rect x="22" y="14" width="116" height="66" rx="6" fill="#141005" stroke={f} strokeWidth="2.2" />
      <g fill={f} fontFamily="Montserrat, sans-serif" fontWeight="700" fontSize="11" textAnchor="middle">
        <text x="80" y="32">1</text>
        <text x="70" y="46">1</text><text x="90" y="46">1</text>
        <text x="60" y="60">1</text><text x="80" y="60">2</text><text x="100" y="60">1</text>
        <text x="50" y="74">1</text><text x="70" y="74">3</text><text x="90" y="74">3</text><text x="110" y="74">1</text>
      </g>
      <ellipse cx="80" cy="108" rx="46" ry="5" fill={f} opacity="0.35" filter={`url(#${id}-weich)`} />
      <path d="M58 108 L66 88 H94 L102 108 Z" fill="#141005" stroke={f} strokeWidth="2" strokeLinejoin="round" />
      <rect x="62" y="84" width="36" height="7" rx="2.5" fill={f} />
    </svg>
  );
}

/* Mathe mit KI lernen: Frage in Gold, Antwort in Silber, ein Funken */
export function MotivDialog({ id, klasse = "kk-motiv" }) {
  const gold = `url(#${id}-folie)`, silber = `url(#${id}-silber)`;
  return (
    <svg className={klasse} viewBox="0 0 160 120" aria-hidden="true">
      <Defs id={id} folie={FOLIE.gold} schein="#EDBB00" />
      <defs>
        <linearGradient id={`${id}-silber`} x1="0" y1="0" x2="1" y2="1">
          {FOLIE.silber.map((f, i) => <stop key={i} offset={`${(i / (FOLIE.silber.length - 1)) * 100}%`} stopColor={f} />)}
        </linearGradient>
      </defs>
      <circle cx="104" cy="40" r="46" fill={`url(#${id}-schein)`} />
      <path d="M58 14 h78 a10 10 0 0 1 10 10 v28 a10 10 0 0 1 -10 10 h-58 l-16 13 v-13 h-4 a10 10 0 0 1 -10 -10 v-28 a10 10 0 0 1 10 -10z" fill={gold} />
      <path d="M70 32 h52 M70 46 h32" stroke="#06102A" strokeWidth="4" strokeLinecap="round" />
      <path d="M14 62 h74 a10 10 0 0 1 10 10 v24 a10 10 0 0 1 -10 10 h-16 v13 l-16 -13 h-42 a10 10 0 0 1 -10 -10 v-24 a10 10 0 0 1 10 -10z" fill="#0B1E4A" stroke={silber} strokeWidth="2.4" />
      <path d="M26 78 h50 M26 92 h32" stroke={silber} strokeWidth="4" strokeLinecap="round" />
      <path d="M140 72 l3.4 9.4 l9.4 3.4 l-9.4 3.4 l-3.4 9.4 l-3.4 -9.4 l-9.4 -3.4 l9.4 -3.4z" fill={gold} />
    </svg>
  );
}

/* Unterstufe: das Geodreieck – Skala, Gradbogen, rechter Winkel – mit einem Würfel und einem Bruchkreis daneben */
export function MotivGeodreieck({ id, klasse = "kk-motiv" }) {
  const f = `url(#${id}-folie)`;
  const ticks = [];
  for (let i = 0; i <= 20; i++) { const x = 22 + i * 5.8; ticks.push(<line key={i} x1={x} y1="100" x2={x} y2={i % 5 ? 95.5 : 91} stroke="#3A0019" strokeOpacity="0.55" strokeWidth={i % 5 ? 1 : 1.5} />); }
  return (
    <svg className={klasse} viewBox="0 0 160 120" aria-hidden="true">
      <Defs id={id} folie={FOLIE.gold} schein="#F2C14E" />
      <circle cx="80" cy="66" r="58" fill={`url(#${id}-schein)`} />
      {/* Geodreieck: Hypotenuse unten als Lineal, Spitze oben */}
      <path d="M16 104 L80 24 L144 104 Z" fill={C.weiss} fillOpacity="0.92" stroke={f} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M80 24 L80 104" stroke="#3A0019" strokeOpacity="0.35" strokeWidth="1.2" strokeDasharray="3 3" />
      <path d="M40 104 A40 40 0 0 1 120 104" fill="none" stroke="#3A0019" strokeOpacity="0.45" strokeWidth="1.3" />
      <path d="M52 104 A28 28 0 0 1 108 104" fill="none" stroke="#3A0019" strokeOpacity="0.3" strokeWidth="1" />
      {ticks}
      <path d="M80 104 L116 68" stroke={f} strokeWidth="3.4" strokeLinecap="round" />
      <path d="M92 104 A12 12 0 0 0 88.5 95.5" fill="none" stroke={f} strokeWidth="2.4" />
      <circle cx="80" cy="104" r="4.2" fill={f} />
      {/* Würfel unten links */}
      <g transform="translate(6 70)">
        <path d="M0 10 L14 4 L28 10 L14 16 Z" fill={f} />
        <path d="M0 10 L0 26 L14 32 L14 16 Z" fill="#5A0024" />
        <path d="M14 16 L14 32 L28 26 L28 10 Z" fill="#7A0032" />
      </g>
      {/* Bruchkreis oben rechts: drei Viertel in Gold */}
      <g transform="translate(130 30)">
        <circle cx="0" cy="0" r="15" fill={C.weiss} fillOpacity="0.9" />
        <path d="M0 0 L0 -15 A15 15 0 1 1 -15 0 Z" fill={f} />
        <path d="M0 -15 V15 M-15 0 H15" stroke="#3A0019" strokeOpacity="0.45" strokeWidth="1.2" />
      </g>
    </svg>
  );
}
