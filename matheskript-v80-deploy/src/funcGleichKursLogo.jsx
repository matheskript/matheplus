import React from "react";
import { C } from "./base1.jsx";

const GOLD = C.flaggold;

/* Logo für die Startseiten-Kachel „Gleichungen“: 7 · x = 56 → x = 8 (eigene Datei, damit die Startseite nichts vom Bereich nachlädt) */
export function GleichKursLogoKlein() {
  const W = 230, H = 190;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "100%", display: "block" }} aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => <line key={`v${i}`} x1={i * 28} y1="0" x2={i * 28} y2={H} stroke="rgba(255,255,255,0.05)" />)}
      {Array.from({ length: 7 }, (_, i) => <line key={`h${i}`} x1="0" y1={i * 28} x2={W} y2={i * 28} stroke="rgba(255,255,255,0.05)" />)}
      <text x="115" y="68" textAnchor="middle" fill="rgba(255,255,255,0.92)" fontSize="30" fontWeight="800">7 · <tspan fill={GOLD}>x</tspan> = 56</text>
      <line x1="62" y1="88" x2="168" y2="88" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" strokeDasharray="4 5" />
      <rect x="62" y="104" width="106" height="52" rx="14" fill="rgba(237,187,0,0.14)" stroke={GOLD} strokeWidth="2" />
      <text x="115" y="140" textAnchor="middle" fill={GOLD} fontSize="28" fontWeight="800">x = 8</text>
    </svg>
  );
}

