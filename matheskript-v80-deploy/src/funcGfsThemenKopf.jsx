/* ============================================================
   GFS-Training – Kopf der Themenseiten (Die optimale Dose, Pascal …)
   Kurz statt Textblock: Rückweg-Chip, Titel, drei Fakten-Chips und ein
   farbiges Bild zum Thema. Grund wie der Kurs (Lackschwarz mit Gold).
   Die Bilder sind mathematisch exakt:
     DosenBild   – fünf Dosen mit GLEICHEM Volumen (h = 2/r² bei V = 2π),
                   die mittlere ist die optimale (h = 2r, Profil = Quadrat)
     PascalBild  – Zeilen 0 bis 7, ungerade Zahlen gold (Sierpiński-Muster)
   ============================================================ */
import React from "react";
import { C } from "./base1.jsx";

const STIL = `
  .gtk{position:relative;overflow:hidden;color:${C.weiss};
    background:radial-gradient(90% 70% at 85% 30%,var(--gtk-schein,rgba(237,187,0,0.30)) 0%,transparent 62%),
      radial-gradient(70% 60% at 0% 100%,var(--gtk-schein2,rgba(0,77,152,0.38)) 0%,transparent 60%),
      linear-gradient(155deg,${C.nachtschwarz} 0%,#15130B 60%,#2A2109 100%)}
  .gtk::before{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(118deg,rgba(255,246,214,0.10) 0%,transparent 38%)}
  .gtk-innen{position:relative;padding-top:16px;padding-bottom:12px;display:grid;grid-template-columns:minmax(0,1fr);row-gap:0}
  .gtk-zurueck{justify-self:start;display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 12px 0 10px;border-radius:999px;cursor:pointer;font-family:inherit;
    font-size:12.5px;font-weight:700;color:rgba(255,255,255,0.88);background:rgba(255,255,255,0.08);border:1px solid rgba(237,187,0,0.32)}
  .gtk-zurueck:focus-visible{outline:3px solid ${C.flaggold};outline-offset:2px}
  .gtk-titel{margin:14px 0 0;font-size:clamp(30px,8.6vw,40px);font-weight:800;letter-spacing:-0.035em;line-height:1.04;text-wrap:balance;color:${C.weiss}}
  .gtk-chips{list-style:none;margin:12px 0 0;padding:0;display:flex;flex-wrap:wrap;gap:6px}
  .gtk-chips li{display:inline-flex;align-items:center;height:26px;padding:0 10px;border-radius:999px;font-size:12px;font-weight:700;white-space:nowrap;
    background:rgba(255,255,255,0.09);border:1px solid rgba(237,187,0,0.3);color:${C.weiss}}
  .gtk-chips li:first-child{background:linear-gradient(135deg,#FFE9A0 0%,${C.flaggold} 60%,${C.goldWarm} 100%);border:none;color:${C.nachtschwarz}}
  .gtk-bild{display:block;width:calc(100% + 16px);height:auto;margin:8px -8px 0;overflow:visible}
  .gtk-kurve{height:24px;background:${C.sand};border-radius:24px 24px 0 0;position:relative}
  .gtk-auf{animation:gtkAuf .6s cubic-bezier(.2,.8,.2,1) both}
  .gtk-glimmen{animation:gtkGlimmen 3.2s ease-in-out infinite}
  @keyframes gtkAuf{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
  @keyframes gtkGlimmen{0%,100%{opacity:.55}50%{opacity:1}}
  @media (min-width:760px){
    .gtk-innen{grid-template-columns:minmax(0,1fr) 48%;column-gap:24px;align-items:center;padding-top:22px;padding-bottom:14px}
    .gtk-text{grid-column:1}
    .gtk-bild{grid-column:2;grid-row:1;width:100%;margin:0}
  }
  @media (prefers-reduced-motion:reduce){.gtk-auf,.gtk-glimmen{animation:none}}
`;

/* chips = ["Kursstufe 1", "Kap. I", "6 Animationen"]; Bild = Komponente; farben = { schein, schein2 } */
export function GfsThemenKopf({ titel, chips = [], Bild, farben = {}, onZurueck }) {
  const vars = { ...(farben.schein ? { "--gtk-schein": farben.schein } : {}), ...(farben.schein2 ? { "--gtk-schein2": farben.schein2 } : {}) };
  return (
    <div className="gtk kopfblock" style={vars}>
      <style>{STIL}</style>
      {/* mx-auto px-6 + maxWidth 620: dieselbe Spalte wie der Seiteninhalt (func10 weitet sie am Desktop auf) */}
      <div className="mx-auto px-6 gtk-innen" style={{ maxWidth: 620 }}>
        <div className="gtk-text">
          {onZurueck && (
            <button type="button" className="gtk-zurueck" onClick={onZurueck} aria-label="Zurück zum GFS-Training">
              <svg width="13" height="13" viewBox="0 0 16 16" aria-hidden="true"><path d="M13 8H4M7.5 4l-4 4 4 4" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              GFS-Training
            </button>
          )}
          <h1 className="gtk-titel">{titel}</h1>
          {chips.length > 0 && <ul className="gtk-chips" aria-label="Thema auf einen Blick">{chips.map((c) => <li key={c}>{c}</li>)}</ul>}
        </div>
        {Bild && <Bild />}
      </div>
      <div className="gtk-kurve" />
    </div>
  );
}

/* ---------- Die optimale Dose: fünf Dosen, gleicher Inhalt ---------- */
const DOSEN = [   // r in Einheiten; h = 2 / r² (V = 2π für alle)
  { r: 1.6, hell: "#F0476F", mitte: "#D4145A", dunkel: "#7A0032", band: "#FFE3EA" },
  { r: 1.25, hell: "#4E9BEA", mitte: "#1E6BC0", dunkel: "#0B2F66", band: "#E2EEFB" },
  { r: 1, optimal: true, hell: "#FFE9A0", mitte: "#EDBB00", dunkel: "#8A6A00", band: "#0B0C10" },
  { r: 0.8, hell: "#4FD1A5", mitte: "#1E9C78", dunkel: "#0B5141", band: "#E0F7EF" },
  { r: 0.65, hell: "#FFFFFF", mitte: "#C9CED6", dunkel: "#6B7380", band: "#5B6270" },
];
export function DosenBild() {
  const U = 24, BODEN = 146, LUECKE = 13;
  const breiten = DOSEN.map((d) => 2 * d.r * U);
  const gesamt = breiten.reduce((a, b) => a + b, 0) + LUECKE * (DOSEN.length - 1);
  let x = (340 - gesamt) / 2;
  const dosen = DOSEN.map((d, i) => {
    const w = breiten[i], h = (2 / (d.r * d.r)) * U, ry = Math.max(3.5, d.r * U * 0.28);
    const pos = { ...d, x, w, h, ry, cx: x + w / 2, oben: BODEN - h, i };
    x += w + LUECKE;
    return pos;
  });
  const opt = dosen.find((d) => d.optimal);
  return (
    <svg className="gtk-bild" viewBox="0 16 340 160" role="img" aria-label="Fünf Dosen mit gleichem Inhalt – die mittlere mit h = 2r braucht am wenigsten Blech">
      <defs>
        {dosen.map((d) => (
          <linearGradient key={d.i} id={`gtk-dose-${d.i}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={d.dunkel} /><stop offset="28%" stopColor={d.mitte} /><stop offset="46%" stopColor={d.hell} />
            <stop offset="64%" stopColor={d.mitte} /><stop offset="100%" stopColor={d.dunkel} />
          </linearGradient>
        ))}
        <linearGradient id="gtk-deckel" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#FFFFFF" /><stop offset="55%" stopColor="#D5DAE2" /><stop offset="100%" stopColor="#8E96A3" /></linearGradient>
        <linearGradient id="gtk-deckel-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#FFF6D6" /><stop offset="55%" stopColor="#F2C94C" /><stop offset="100%" stopColor="#A67C00" /></linearGradient>
        <radialGradient id="gtk-glut" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#EDBB00" stopOpacity="0.75" /><stop offset="100%" stopColor="#EDBB00" stopOpacity="0" /></radialGradient>
        <linearGradient id="gtk-regal" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#EDBB00" stopOpacity="0" /><stop offset="50%" stopColor="#EDBB00" stopOpacity="0.7" /><stop offset="100%" stopColor="#EDBB00" stopOpacity="0" /></linearGradient>
      </defs>
      {/* Glut hinter der optimalen Dose */}
      <ellipse className="gtk-glimmen" cx={opt.cx} cy={BODEN - opt.h / 2} rx="58" ry="62" fill="url(#gtk-glut)" />
      {/* Regalkante */}
      <rect x="6" y={BODEN + 4} width="328" height="2" rx="1" fill="url(#gtk-regal)" />
      {dosen.map((d) => (
        <g key={d.i} className="gtk-auf" style={{ animationDelay: `${0.08 * d.i}s` }}>
          <ellipse cx={d.cx} cy={BODEN + 3} rx={d.w / 2 + 3} ry={d.ry * 0.7} fill="#000" opacity="0.45" />
          {/* Mantel */}
          <path d={`M${d.x} ${d.oben} V${BODEN} A${d.w / 2} ${d.ry} 0 0 0 ${d.x + d.w} ${BODEN} V${d.oben} Z`} fill={`url(#gtk-dose-${d.i})`} />
          {/* Etikettband */}
          {d.h > 22 && (
            <path d={`M${d.x} ${d.oben + d.h * 0.42} V${d.oben + d.h * 0.58} A${d.w / 2} ${d.ry} 0 0 0 ${d.x + d.w} ${d.oben + d.h * 0.58} V${d.oben + d.h * 0.42} A${d.w / 2} ${d.ry} 0 0 1 ${d.x} ${d.oben + d.h * 0.42} Z`}
              fill={d.band} opacity={d.optimal ? 0.9 : 0.55} />
          )}
          {/* Deckel */}
          <ellipse cx={d.cx} cy={d.oben} rx={d.w / 2} ry={d.ry} fill={d.optimal ? "url(#gtk-deckel-gold)" : "url(#gtk-deckel)"} />
          <ellipse cx={d.cx} cy={d.oben} rx={d.w / 2 - 2.6} ry={Math.max(1.5, d.ry - 1.8)} fill="none" stroke={d.optimal ? "#8A6A00" : "#7A828F"} strokeWidth="0.9" opacity="0.7" />
        </g>
      ))}
      {/* Optimum: Profil ist ein Quadrat (h = 2r) */}
      <rect x={opt.x - 4} y={opt.oben - 4} width={opt.w + 8} height={opt.h + 8} rx="3" fill="none" stroke="#FFE9A0" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.85" />
      <g className="gtk-auf" style={{ animationDelay: ".5s" }}>
        <rect x={opt.cx - 30} y={opt.oben - 36} width="60" height="22" rx="11" fill="#EDBB00" />
        <path d={`M${opt.cx - 5} ${opt.oben - 14.5} L${opt.cx} ${opt.oben - 9} L${opt.cx + 5} ${opt.oben - 14.5} Z`} fill="#EDBB00" />
        <text x={opt.cx} y={opt.oben - 21} textAnchor="middle" fontFamily="Montserrat, sans-serif" fontWeight="800" fontSize="11.5" fill="#0B0C10">h = 2r</text>
      </g>
      <text x="170" y="172" textAnchor="middle" fontFamily="Montserrat, sans-serif" fontWeight="600" fontSize="10" fill="rgba(255,255,255,0.62)" letterSpacing="0.02em">alle fünf Dosen: gleicher Inhalt</text>
    </svg>
  );
}

/* ---------- Pascal’sches Dreieck: Zeilen 0 bis 7 ---------- */
const binom = (n, k) => { let b = 1; for (let i = 1; i <= k; i += 1) b = (b * (n - k + i)) / i; return Math.round(b); };
export function PascalBild() {
  const ZEILEN = 8, DX = 38, DY = 20.5, R = 12.2, OBEN = 16;
  const zellen = [];
  for (let n = 0; n < ZEILEN; n += 1) {
    for (let k = 0; k <= n; k += 1) {
      const wert = binom(n, k);
      zellen.push({ n, k, wert, x: 170 + (k - n / 2) * DX, y: OBEN + n * DY, ungerade: wert % 2 === 1 });
    }
  }
  return (
    <svg className="gtk-bild" viewBox="0 0 340 176" role="img" aria-label="Pascal’sches Dreieck, Zeilen 0 bis 7 – ungerade Zahlen gold">
      <defs>
        <linearGradient id="gtk-p-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#FFE9A0" /><stop offset="60%" stopColor="#EDBB00" /><stop offset="100%" stopColor="#C9971A" /></linearGradient>
        <linearGradient id="gtk-p-blau" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#2F7BD0" /><stop offset="100%" stopColor="#0E1E4A" /></linearGradient>
        <radialGradient id="gtk-p-glut" cx="50%" cy="45%" r="50%"><stop offset="0%" stopColor="#EDBB00" stopOpacity="0.32" /><stop offset="55%" stopColor="#EDBB00" stopOpacity="0.1" /><stop offset="100%" stopColor="#EDBB00" stopOpacity="0" /></radialGradient>
      </defs>
      <ellipse className="gtk-glimmen" cx="170" cy="70" rx="150" ry="80" fill="url(#gtk-p-glut)" />
      {zellen.map((z) => (
        <g key={`${z.n}-${z.k}`} className="gtk-auf" style={{ animationDelay: `${0.06 * z.n}s` }}>
          <circle cx={z.x} cy={z.y} r={R} fill={z.ungerade ? "url(#gtk-p-gold)" : "url(#gtk-p-blau)"} stroke={z.ungerade ? "#FFF6D6" : "#4E9BEA"} strokeWidth="0.8" strokeOpacity="0.6" />
          <text x={z.x} y={z.y + 3.6} textAnchor="middle" fontFamily="Montserrat, sans-serif" fontWeight="800" fontSize={z.wert >= 10 ? 9.5 : 10.5}
            fill={z.ungerade ? "#0B0C10" : "#FFFFFF"}>{z.wert}</text>
        </g>
      ))}
    </svg>
  );
}
