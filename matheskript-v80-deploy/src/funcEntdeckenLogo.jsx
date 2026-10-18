import React from "react";
import { C } from "./base1.jsx";

/* Logo für die Startkachel: Lupe über einem Pascalschen Dreieck, daneben die Potenzregel-Idee */
export function EntdeckenLogoKlein() {
  const W = 230, H = 190;
  const reihen = [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1]];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "100%", display: "block" }} aria-hidden="true">
      {reihen.map((r, i) => r.map((z, j) => {
        const x = 115 + (j - (r.length - 1) / 2) * 34, y = 32 + i * 28;
        const markiert = i === 3 && (j === 1 || j === 2);
        return (
          <g key={`${i}-${j}`}>
            <circle cx={x} cy={y} r="13" fill={markiert ? C.flaggold : "rgba(255,255,255,0.1)"} stroke={markiert ? C.flaggold : "rgba(255,255,255,0.35)"} strokeWidth="1.5" />
            <text x={x} y={y + 4.5} textAnchor="middle" fontSize="13" fontWeight="700" fontFamily="Montserrat, system-ui, sans-serif" fill={markiert ? C.seeTief : C.weiss}>{z}</text>
          </g>
        );
      }))}
      <g transform="translate(146 126)">
        <circle cx="22" cy="22" r="17" fill="rgba(255,255,255,0.08)" stroke={C.flaggold} strokeWidth="4" />
        <line x1="34" y1="34" x2="52" y2="52" stroke={C.flaggold} strokeWidth="6" strokeLinecap="round" />
      </g>
      <text x="34" y="170" fontSize="20" fontWeight="700" fontFamily="Montserrat, system-ui, sans-serif" fill={C.weiss} opacity="0.85">xⁿ</text>
    </svg>
  );
}

/* Grafik für die Startseiten-Kachel: Heftzeilen mit Gleichheitszeichen untereinander und Randnotiz. */
export function GleichungenLogoKlein() {
  const W = 230, H = 190;
  const T = { fontFamily: "Montserrat, system-ui, sans-serif", fontWeight: 700 };
  const zeilen = [
    { y: 54, l: "3x + 5", r: "20", op: "−5" },
    { y: 94, l: "3x", r: "15", op: ":3" },
    { y: 134, l: "x", r: "5", op: null },
  ];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "100%", display: "block" }} aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => <line key={`v${i}`} x1={i * 28} y1="0" x2={i * 28} y2={H} stroke="rgba(255,255,255,0.05)" />)}
      {Array.from({ length: 7 }, (_, i) => <line key={`h${i}`} x1="0" y1={i * 28} x2={W} y2={i * 28} stroke="rgba(255,255,255,0.05)" />)}
      {zeilen.map((z, i) => (
        <g key={i} {...T} fontSize="21">
          <text x="100" y={z.y} textAnchor="end" fill={i === 2 ? C.flaggold : C.weiss}>{z.l}</text>
          <text x="112" y={z.y} textAnchor="middle" fill="rgba(255,255,255,0.55)" fontWeight="500">=</text>
          <text x="124" y={z.y} fill={i === 2 ? C.flaggold : C.weiss}>{z.r}</text>
          {z.op && <>
            <line x1="165" y1={z.y - 17} x2="165" y2={z.y + 4} stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
            <text x="174" y={z.y} fill={C.flaggold} fontSize="18">{z.op}</text>
          </>}
        </g>
      ))}
      <line x1="84" y1="143" x2="144" y2="143" stroke={C.flaggold} strokeWidth="2" />
      <line x1="84" y1="148" x2="144" y2="148" stroke={C.flaggold} strokeWidth="2" />
      {["+", "−", "·", ":"].map((k, i) => (
        <g key={k} transform={`translate(${34 + i * 42} 160)`}>
          <rect width="34" height="24" rx="7" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.25)" />
          <text x="17" y="17.5" textAnchor="middle" fill={C.weiss} fontSize="15" {...T} fontWeight="600">{k}</text>
        </g>
      ))}
    </svg>
  );
}

/* Grafik für die Geometrie-Kachel: V-Figur mit zwei Parallelen und ein rechtwinkliges Dreieck mit Winkel α */
export function GeometrieLogoKlein() {
  const W = 230, H = 190;
  const T = { fontFamily: "Montserrat, system-ui, sans-serif", fontWeight: 700 };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "100%", display: "block" }} aria-hidden="true">
      <path d="M22 160 L206 40 M22 160 L210 150" stroke="rgba(255,255,255,0.55)" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M92 114 L96 156" stroke={C.flaggold} strokeWidth="4" strokeLinecap="round" />
      <path d="M160 70 L168 152" stroke={C.flaggold} strokeWidth="4" strokeLinecap="round" />
      <circle cx="22" cy="160" r="6" fill={C.weiss} />
      <text x="18" y="146" textAnchor="end" fill={C.weiss} fontSize="16" {...T}>S</text>
      <path d="M150 20 L206 20 L206 58 Z" fill="rgba(255,255,255,0.1)" stroke={C.weiss} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M198 20 L198 28 L206 28" fill="none" stroke={C.weiss} strokeWidth="1.8" />
      <text x="40" y="60" fill={C.flaggold} fontSize="26" {...T}>sin α</text>
    </svg>
  );
}

/* Bereich Bruchrechnen: Bruchkreis mit drei Vierteln und eine Bruchrechnung */
export function BruchrechnenLogoKlein() {
  const W = 230, H = 190;
  const T = { fontFamily: "Montserrat, system-ui, sans-serif", fontWeight: 700 };
  const cx = 60, cy = 84, r = 46;
  const stueck = (a0, a1) => {
    const p = (a) => [cx + r * Math.cos((a - 90) * Math.PI / 180), cy + r * Math.sin((a - 90) * Math.PI / 180)];
    const [x0, y0] = p(a0), [x1, y1] = p(a1);
    return `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1} Z`;
  };
  const bruch = (x, z, n, farbe, gr = 22) => (
    <g {...T} fontSize={gr} fill={farbe} textAnchor="middle">
      <text x={x} y={66}>{z}</text>
      <line x1={x - 12} y1={74} x2={x + 12} y2={74} stroke={farbe} strokeWidth="2.4" />
      <text x={x} y={99}>{n}</text>
    </g>
  );
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "100%", display: "block" }} aria-hidden="true">
      {[0, 90, 180].map((a) => <path key={a} d={stueck(a, a + 90)} fill={C.flaggold} opacity={0.9} stroke={C.seeTief} strokeWidth="2" />)}
      <path d={stueck(270, 360)} fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.55)" strokeWidth="2" />
      {bruch(140, 1, 3, C.weiss)}
      <text x="161" y="88" fill="rgba(255,255,255,0.6)" fontSize="20" {...T} textAnchor="middle">+</text>
      {bruch(182, 1, 4, C.weiss)}
      <text x="146" y="138" fill={C.flaggold} fontSize="20" {...T} textAnchor="middle">=</text>
      <g {...T} fontSize="18" fill={C.flaggold} textAnchor="middle">
        <text x="176" y="124">7</text>
        <line x1="163" y1="131" x2="189" y2="131" stroke={C.flaggold} strokeWidth="2.2" />
        <text x="176" y="151">12</text>
      </g>
    </svg>
  );
}

/* Bereichs-Logos Unterstufe: Zahlen und Größen, Zuordnungen und Prozent, Daten und Zufall */
const LOGO_T = { fontFamily: "Montserrat, system-ui, sans-serif", fontWeight: 700 };
function LogoRahmen({ children }) {
  return <svg viewBox="0 0 230 190" preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "100%", display: "block" }} aria-hidden="true">{children}</svg>;
}
export function ZahlenLogoKlein() {
  const st = ["M", "HT", "ZT", "T", "H", "Z", "E"], z = [3, 4, 0, 7, 2, 5, 0];
  return (
    <LogoRahmen>
      {st.map((s, i) => (
        <g key={s}>
          <rect x={14 + i * 29} y="44" width="26" height="62" rx="6" fill={i === 3 ? `${C.flaggold}55` : "rgba(255,255,255,0.08)"} stroke="rgba(255,255,255,0.3)" />
          <text x={27 + i * 29} y="62" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="11" {...LOGO_T}>{s}</text>
          <text x={27 + i * 29} y="96" textAnchor="middle" fill={i === 3 ? C.flaggold : C.weiss} fontSize="24" {...LOGO_T}>{z[i]}</text>
        </g>
      ))}
      <text x="115" y="150" textAnchor="middle" fill={C.weiss} fontSize="20" {...LOGO_T}>1 km = 1000 m</text>
    </LogoRahmen>
  );
}
export function ProzentLogoKlein() {
  return (
    <LogoRahmen>
      <rect x="20" y="40" width="190" height="34" rx="8" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.55)" strokeWidth="2" />
      <rect x="20" y="40" width="57" height="34" rx="8" fill={C.flaggold} opacity="0.85" />
      <text x="48" y="63" textAnchor="middle" fill={C.seeTief} fontSize="15" {...LOGO_T}>30 %</text>
      <text x="200" y="30" textAnchor="end" fill="rgba(255,255,255,0.7)" fontSize="13" {...LOGO_T}>100 %</text>
      <line x1="30" y1="160" x2="110" y2="104" stroke={C.weiss} strokeWidth="3" strokeLinecap="round" />
      <circle cx="30" cy="160" r="4" fill={C.weiss} />
      <text x="128" y="138" fill={C.flaggold} fontSize="22" {...LOGO_T}>y = k · x</text>
    </LogoRahmen>
  );
}
export function DatenLogoKlein() {
  const h = [50, 78, 36, 96, 62];
  return (
    <LogoRahmen>
      {h.map((v, i) => <rect key={i} x={20 + i * 24} y={150 - v} width="18" height={v} rx="3" fill={i === 3 ? C.flaggold : "rgba(255,255,255,0.6)"} />)}
      <line x1="14" y1="150" x2="140" y2="150" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
      <rect x="160" y="40" width="50" height="50" rx="10" fill="rgba(255,255,255,0.1)" stroke={C.weiss} strokeWidth="2" />
      {[[173, 53], [197, 77], [185, 65]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="5" fill={C.weiss} />)}
      <text x="185" y="128" textAnchor="middle" fill={C.flaggold} fontSize="20" {...LOGO_T}>P = 1/6</text>
    </LogoRahmen>
  );
}
