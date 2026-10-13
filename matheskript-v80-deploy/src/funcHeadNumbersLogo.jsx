import React from "react";
import { C } from "./base1.jsx";


/* Logo für die Startseiten-Kachel: Karten mit Aufgabe und Ergebnis */
export function HeadNumbersLogoKlein() {
  const W = 230, H = 190;
  const karten = [
    { x: 16, y: 22, w: 96, t: "7 · 8", e: "56", f: C.weiss, r: -6 },
    { x: 124, y: 14, w: 92, t: "17²", e: "289", f: C.flaggold, r: 5 },
    { x: 30, y: 104, w: 84, t: "5³", e: "125", f: C.granaHell, r: 4 },
    { x: 130, y: 108, w: 84, t: "∛512", e: "8", f: C.weiss, r: -4 },
  ];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "100%", display: "block" }} aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => <line key={`v${i}`} x1={i * 28} y1="0" x2={i * 28} y2={H} stroke="rgba(255,255,255,0.05)" />)}
      {Array.from({ length: 7 }, (_, i) => <line key={`h${i}`} x1="0" y1={i * 28} x2={W} y2={i * 28} stroke="rgba(255,255,255,0.05)" />)}
      {karten.map((k, i) => (
        <g key={i} transform={`rotate(${k.r} ${k.x + k.w / 2} ${k.y + 30})`}>
          <rect x={k.x} y={k.y} width={k.w} height={60} rx="12" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.22)" />
          <text x={k.x + k.w / 2} y={k.y + 27} textAnchor="middle" fill={k.f} fontSize="18" fontWeight="800">{k.t}</text>
          <text x={k.x + k.w / 2} y={k.y + 48} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="13" fontWeight="600">= {k.e}</text>
        </g>
      ))}
    </svg>
  );
}
