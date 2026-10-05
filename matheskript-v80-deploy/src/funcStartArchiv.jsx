import React, { useState, useRef } from "react";
import { BIBEL_URL, C, DEMO, KOEFF_FARBEN, KOEFF_HOCH } from "./base1.jsx";
import { vz } from "./base2.jsx";
import { LERN, hatEinheit, tagSchluessel } from "./base3.jsx";
import { Knopf, PenPaperBlatt, Satz, Schaubild, Sektion, TextLink, Titel, bruch, bruchLatex, bruchText } from "./func1.jsx";
import { M } from "./func3.jsx";
import { Kurvendiskussion } from "./func4.jsx";
import { Fortschritt, Kopfrechnen } from "./func5.jsx";
import { Einstufung, Lernlandkarte, naechsteKompetenz, wiederholListe } from "./func6.jsx";
import { Wiederholen } from "./func7.jsx";
import { EskalationsKarte, Wochenbericht, eskalationSignale, serieBerechnen, zeitraum } from "./func8.jsx";
import { TerminHinweis } from "./func9.jsx";
import { KopfrechnenLogoKlein } from "./func14.jsx";
import { VektorenLogoKlein } from "./func16.jsx";
import { StochastikLogoKlein } from "./func17.jsx";
import { GleichungenLogoKlein } from "./funcGleichungen.jsx";
import { LGSLogoKlein } from "./funcLGS.jsx";
import { MasterclassKachel, MatheCheckenKachel, MathCreatorKachel } from "./funcMasterclass.jsx";
import { ElternabendKachel } from "./funcElternabend.jsx";
import { NAV } from "./base4.jsx";

/* Große, ganz anklickbare Kachel für die Plotter auf der Startseite. */
/* Polynomplotter-Grafik im Hochformat für die Kachel. */
function PlotterLogoKlein() {
  const W = 230, H = 190, x0 = 115, y0 = 110, sx = 34, sy = 17;
  const f = (x) => 0.25 * x ** 4 - 1.6 * x ** 2 + 0.6;
  const fs = (x) => x ** 3 - 3.2 * x;
  const pfad = (g, skal = 1) => {
    let d = "", offen = false;
    for (let i = 0; i <= 160; i++) {
      const x = -3.2 + (6.4 * i) / 160, y = g(x) * skal;
      if (Math.abs(y) > 6.2) { offen = false; continue; }
      d += `${offen ? "L" : "M"}${(x0 + x * sx).toFixed(1)},${(y0 - y * sy).toFixed(1)}`;
      offen = true;
    }
    return d;
  };
  const ext = [-Math.sqrt(3.2), 0, Math.sqrt(3.2)];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "100%", display: "block" }} aria-hidden="true">
      {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((i) => <line key={`v${i}`} x1={x0 + i * sx} y1="0" x2={x0 + i * sx} y2={H} stroke="rgba(255,255,255,0.06)" />)}
      {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((i) => <line key={`h${i}`} x1="0" y1={y0 + i * sy} x2={W} y2={y0 + i * sy} stroke="rgba(255,255,255,0.06)" />)}
      <line x1="0" y1={y0} x2={W} y2={y0} stroke="rgba(255,255,255,0.3)" />
      <line x1={x0} y1="0" x2={x0} y2={H} stroke="rgba(255,255,255,0.3)" />
      <path d={pfad(fs, 0.5)} stroke={C.flaggold} strokeWidth="2" fill="none" opacity="0.9" />
      <path d={pfad(f)} stroke={C.weiss} strokeWidth="3" fill="none" strokeLinecap="round" />
      {ext.map((x) => <circle key={x} cx={x0 + x * sx} cy={y0 - f(x) * sy} r="4.5" fill={C.seeTief} stroke={C.weiss} strokeWidth="2.2" />)}
      <g fontSize="12" fontWeight="700" fontStyle="italic">
        <text x="12" y="22" fill={C.weiss}>f</text>
        <text x="24" y="22" fill={C.flaggold}>f′</text>
      </g>
    </svg>
  );
}

function PlotterKachel({ onClick, label, logo, titel, text, marke, kategorie = "Werkzeug", klein, extra, gesperrt, logoHell, portraet }) {
  return (
    <button onClick={gesperrt ? undefined : onClick} disabled={gesperrt} aria-disabled={gesperrt || undefined}
      aria-label={gesperrt ? `${titel} – noch gesperrt` : label} title={gesperrt ? "Noch gesperrt" : undefined}
      className={gesperrt ? "kachel-gesperrt" : "plotter-kachel"}
      style={{ display: "flex", width: klein ? "100%" : "calc(100% + 32px)", marginLeft: klein ? 0 : -16, marginRight: klein ? 0 : -16,
        height: "auto", marginTop: klein ? 8 : 12, padding: 0, border: "none", borderRadius: klein ? 14 : 18,
        overflow: "hidden", cursor: gesperrt ? "not-allowed" : "pointer", fontFamily: "inherit", textAlign: "left", position: "relative",
        background: gesperrt ? "linear-gradient(155deg, #B9C2CE 0%, #8C97A6 55%, #6E7989 100%)" : `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`,
        boxShadow: gesperrt ? "0 4px 14px rgba(40,50,70,0.18), inset 0 0 0 1px rgba(255,255,255,0.45)" : `0 6px 22px rgba(0,77,152,0.24), inset 0 0 0 1px ${C.silber}40` }}>
      <style>{`.plotter-kachel{transition:transform .15s ease, box-shadow .15s ease}
        .plotter-kachel:active{transform:scale(0.985)}
        @media (hover:hover){.plotter-kachel:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(0,77,152,0.32)}}
        .kachel-text{display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}
        .kachel-titel{background:linear-gradient(180deg,#FFFFFF 0%,${C.silberHell} 55%,${C.silber} 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
        @media (max-width:520px){.kachel-portraet{top:24px !important}}
        .kachel-gesperrt .kachel-titel{background:none;color:#FFFFFF;text-shadow:0 1px 2px rgba(30,40,60,0.25)}`}</style>
      {/* Links (60 %): Titel und Erklärtext von oben */}
      <div style={{ flex: klein ? "1 1 68%" : "1 1 60%", minWidth: 0, padding: klein ? "14px 8px 14px 14px" : "14px 10px 14px 16px", display: "flex", flexDirection: "column" }}>
        <h2 className="kachel-titel" style={{ fontSize: "clamp(15px, 4.1vw, 22px)", fontWeight: 700, letterSpacing: "-0.03em",
          lineHeight: 1.1, margin: 0, whiteSpace: "nowrap", ...(portraet
            // Titel darf über das Porträt hinauslaufen (das Porträt beginnt erst darunter)
            ? { overflow: "visible", position: "relative", zIndex: 2 }
            : { overflow: "hidden", textOverflow: "ellipsis" }) }}>
          {titel}
        </h2>
        <span aria-hidden="true" style={{ display: "block", width: 34, height: 2.5, borderRadius: 2, marginTop: 6,
          background: gesperrt ? "rgba(255,255,255,0.7)" : `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)` }} />
        <p className="kachel-text" style={{ color: gesperrt ? "rgba(255,255,255,0.92)" : C.weiss, fontSize: 12.5, fontWeight: 300, lineHeight: 1.4, marginTop: 6, marginBottom: 0,
          WebkitLineClamp: 3, height: "4.2em" }}>
          {text}
        </p>
      </div>
      {portraet && (
        <div aria-hidden="true" style={{ flex: "0 0 auto", width: "clamp(78px, 21vw, 108px)", position: "relative", marginLeft: -8, marginRight: 4 }}>
          <div className="kachel-portraet" style={{ position: "absolute", inset: "6px 0 0 0", display: "flex" }}>{portraet}</div>
        </div>
      )}
      {/* Rechts (40 %): nur die Grafik */}
      <div style={{ flex: klein ? "0 0 32%" : "0 0 40%", position: "relative", background: "rgba(255,255,255,0.04)",
        borderLeft: `1px solid ${gesperrt ? "rgba(255,255,255,0.35)" : `${C.silber}33`}`, display: "flex" }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", ...(gesperrt && !logoHell ? { filter: "grayscale(1) brightness(1.15)", opacity: 0.35 } : {}) }}>{logo}</div>
        {extra}
        {gesperrt && (
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", gap: 4, ...(logoHell ? { alignItems: "flex-end", justifyContent: "flex-end", padding: 8 } : { alignItems: "center", justifyContent: "center" }) }}>
            <span style={{ width: klein || logoHell ? 34 : 40, height: klein || logoHell ? 34 : 40, borderRadius: 999, background: "rgba(255,255,255,0.92)",
              boxShadow: "0 3px 10px rgba(30,40,60,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg viewBox="0 0 24 24" width={klein || logoHell ? 17 : 20} height={klein || logoHell ? 17 : 20} fill="none" stroke="#5E6878" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="11" width="14" height="10" rx="2.2" fill="#5E6878" />
                <path d="M 8 11 V 7.5 a 4 4 0 0 1 8 0 V 11" />
              </svg>
            </span>
          </div>
        )}
      </div>
    </button>
  );
}

/* Grafik für die Schulmathematik-Kachel: vier Mini-Motive (Kurve, Vektor, Säulen, Video). */
function SchulmatheLogoKlein() {
  const W = 230, H = 190;
  const feld = (x, y, inhalt) => (
    <g transform={`translate(${x} ${y})`}>
      <rect width="92" height="72" rx="10" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.22)" />
      {inhalt}
    </g>
  );
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "100%", display: "block" }} aria-hidden="true">
      {feld(18, 18, <path d="M 10 58 C 26 6, 42 6, 50 36 C 58 64, 72 60, 84 14" stroke={C.weiss} strokeWidth="2.6" fill="none" />)}
      {feld(120, 18, <><line x1="16" y1="58" x2="70" y2="18" stroke={C.flaggold} strokeWidth="3" /><path d="M 70 18 L 58 20 L 64 29 Z" fill={C.flaggold} /><line x1="16" y1="58" x2="80" y2="58" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" /></>)}
      {feld(18, 100, [10, 26, 42, 58, 74].map((x, i) => <rect key={x} x={x} y={62 - [14, 30, 44, 26, 12][i]} width="11" height={[14, 30, 44, 26, 12][i]} rx="2" fill={i === 2 ? C.flaggold : "rgba(255,255,255,0.45)"} />))}
      {feld(120, 100, <><circle cx="46" cy="36" r="17" fill={C.flaggold} /><path d="M 41 27 L 41 45 L 56 36 Z" fill={C.seeTief} /></>)}
    </svg>
  );
}

/* Grafik für die Formelsammlung-Kachel: aufgeschlagenes Heft mit Formeln. */
function FormelLogoKlein() {
  const W = 230, H = 190;
  const T = { fontFamily: "Montserrat, system-ui, sans-serif", fontWeight: 700, fill: C.seeTief };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "100%", display: "block" }} aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => <line key={`v${i}`} x1={i * 28} y1="0" x2={i * 28} y2={H} stroke="rgba(255,255,255,0.05)" />)}
      {Array.from({ length: 7 }, (_, i) => <line key={`h${i}`} x1="0" y1={i * 28} x2={W} y2={i * 28} stroke="rgba(255,255,255,0.05)" />)}
      <path d="M 115 40 L 20 30 L 20 160 L 115 170 Z" fill="#FFFFFF" />
      <path d="M 115 40 L 210 30 L 210 160 L 115 170 Z" fill="#F1F4F9" />
      <line x1="115" y1="40" x2="115" y2="170" stroke={C.silberDunkel} strokeWidth="1.5" />
      <text x="32" y="72" fontSize="17" {...T}>(xⁿ)′</text>
      <text x="32" y="100" fontSize="15" {...T}>= n·xⁿ⁻¹</text>
      <text x="32" y="138" fontSize="22" {...T} fill={C.gruen}>eˣ</text>
      <text x="126" y="78" fontSize="30" {...T} fill={C.flaggold}>∫</text>
      <text x="146" y="74" fontSize="15" {...T}>f dx</text>
      <text x="126" y="120" fontSize="17" {...T}>a² + b²</text>
      <text x="126" y="146" fontSize="17" {...T} fill={C.see}>sin α</text>
    </svg>
  );
}

/* Grafik für die Schulkurse-Kachel: Videoplayer mit Lektionsliste. */
function SchulkurseLogoKlein() {
  const W = 230, H = 190;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "100%", display: "block" }} aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => <line key={`v${i}`} x1={i * 28} y1="0" x2={i * 28} y2={H} stroke="rgba(255,255,255,0.05)" />)}
      {Array.from({ length: 7 }, (_, i) => <line key={`h${i}`} x1="0" y1={i * 28} x2={W} y2={i * 28} stroke="rgba(255,255,255,0.05)" />)}
      {/* Player */}
      <rect x="22" y="18" width="186" height="98" rx="12" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.28)" />
      <path d="M 36 96 C 70 40, 100 40, 118 70 C 136 100, 170 96, 194 40" stroke="rgba(255,255,255,0.35)" strokeWidth="2" fill="none" />
      <circle cx="115" cy="62" r="20" fill={C.flaggold} />
      <path d="M 109 52 L 109 72 L 126 62 Z" fill={C.seeTief} />
      <rect x="34" y="104" width="162" height="4" rx="2" fill="rgba(255,255,255,0.2)" />
      <rect x="34" y="104" width="68" height="4" rx="2" fill={C.granaHell} />
      {/* Lektionen */}
      {[0, 1, 2].map((k) => (
        <g key={k}>
          <circle cx="34" cy={138 + k * 20} r="7" fill={k < 2 ? C.smaragd : "rgba(255,255,255,0.15)"} />
          {k < 2 && <path d={`M30.5,${138 + k * 20} l2.5,2.5 l4.5,-5`} stroke={C.weiss} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
          <rect x="50" y={134 + k * 20} width={[120, 96, 136][k]} height="8" rx="4" fill={k < 2 ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.28)"} />
        </g>
      ))}
    </svg>
  );
}

/* Grafik für die „Frag Mathilda“-Kachel: Blatt mit handschriftlicher Rechnung im Kamera-Sucher, Häkchen. */
function MathildaLogoKlein() {
  const W = 230, H = 190;
  const ecke = (x, y, dx, dy) => <path d={`M ${x} ${y + dy * 18} L ${x} ${y} L ${x + dx * 18} ${y}`} stroke={C.flaggold} strokeWidth="4" fill="none" strokeLinecap="round" />;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "100%", display: "block" }} aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => <line key={`v${i}`} x1={i * 28} y1="0" x2={i * 28} y2={H} stroke="rgba(255,255,255,0.05)" />)}
      {Array.from({ length: 7 }, (_, i) => <line key={`h${i}`} x1="0" y1={i * 28} x2={W} y2={i * 28} stroke="rgba(255,255,255,0.05)" />)}
      <g transform="rotate(-4 115 95)">
        <rect x="42" y="34" width="146" height="122" rx="6" fill="#FFFFFF" />
        <path d="M 58 62 q 8 -8 16 0 t 16 0 M 98 60 l 10 0 M 116 62 q 8 -8 16 0" stroke={C.seeTief} strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <path d="M 58 92 q 8 -8 16 0 M 84 90 l 10 0 M 102 92 q 8 -8 16 0 t 16 0" stroke={C.seeTief} strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <path d="M 58 122 l 10 0 M 76 124 q 8 -8 16 0" stroke={C.seeTief} strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <line x1="56" y1="132" x2="100" y2="132" stroke={C.flaggold} strokeWidth="2" />
      </g>
      {ecke(26, 20, 1, 1)}{ecke(204, 20, -1, 1)}{ecke(26, 170, 1, -1)}{ecke(204, 170, -1, -1)}
      <circle cx="176" cy="138" r="20" fill={C.smaragd} stroke={C.weiss} strokeWidth="3" />
      <path d="M 166 138 l 7 7 l 13 -14" stroke={C.weiss} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* Mathilda als Schablonen-Porträt (Stencil, wie die bekannten Revolutions-Drucke):
   flache Flächen in den Silbertönen der gesperrten Kachel. */
function MathildaPortraet() {
  return (
    <svg viewBox="0 0 120 138" preserveAspectRatio="xMidYMin slice" style={{ width: "100%", height: "100%", display: "block" }} aria-hidden="true">
      <path d="M 24 60 C 18 18, 102 18, 96 60 C 100 90, 106 116, 102 138 L 18 138 C 14 116, 20 90, 24 60 Z" fill="#F4F6F9"/>
      <path d="M 4 138 C 8 120, 28 111, 47 109 L 73 109 C 92 111, 112 120, 116 138 Z" fill="#3E4756"/>
      <path d="M 49 94 L 49 111 Q 60 117 71 111 L 71 94 Z" fill="#DCE2EA"/>
      <path d="M 64 96 L 71 94 L 71 111 Q 67 113 64 113 Z" fill="#8C97A6"/>
      <path d="M 35 58 C 35 31, 85 31, 85 58 C 86 83, 75 100, 60 101 C 45 100, 34 83, 35 58 Z" fill="#E8ECF1"/>
      <path d="M 78 40 C 85 47, 86 54, 85 60 C 85 82, 76 98, 63 101 C 72 92, 79 80, 79 64 C 79 54, 79 46, 78 40 Z" fill="#8C97A6"/>
      <path d="M 60 22 C 41 22, 28 34, 29 62 C 33 46, 42 37, 58 34 Z" fill="#F4F6F9"/>
      <path d="M 60 22 C 79 22, 92 34, 91 62 C 87 46, 78 37, 62 34 Z" fill="#F4F6F9"/>
      <path d="M 59 22 L 61 22 L 61.5 35 L 58.5 35 Z" fill="#5E6878"/>
      <path d="M 45 27 C 36 34, 32 44, 31 56 C 34 46, 39 37, 47 31 Z" fill="#B9C2CE"/>
      <path d="M 75 27 C 84 34, 88 44, 89 56 C 86 46, 81 37, 73 31 Z" fill="#B9C2CE"/>
      <path d="M 30 70 C 27 90, 26 112, 28 134 C 23 112, 23 88, 30 70 Z" fill="#8C97A6"/>
      <path d="M 90 70 C 94 92, 96 114, 94 134 C 99 112, 98 88, 90 70 Z" fill="#5E6878"/>
      <path d="M 22 92 C 20 108, 20 122, 22 136 C 17 122, 17 106, 22 92 Z" fill="#B9C2CE"/>
      <path d="M 98 92 C 100 108, 100 122, 98 136 C 103 122, 103 106, 98 92 Z" fill="#B9C2CE"/>
      <path d="M 42 51 Q 48 46.5 55 49.5 L 55 52 Q 48 49.5 42 53.5 Z" fill="#3E4756"/>
      <path d="M 65 49.5 Q 72 46.5 78 51 L 78 53.5 Q 72 49.5 65 52 Z" fill="#3E4756"/>
      <path d="M 42.5 60 Q 49 54.5 55.5 59 Q 49 57.5 42.5 61.5 Z" fill="#3E4756"/>
      <path d="M 64.5 59 Q 71 54.5 77.5 60 Q 71 57.5 64.5 61 Z" fill="#3E4756"/>
      <circle cx="49.5" cy="61" r="2.7" fill="#3E4756"/><circle cx="71" cy="61" r="2.7" fill="#3E4756"/>
      <path d="M 61.5 62 C 63.5 69, 65 73, 64 76.5 C 62.5 77.5, 60.5 77.5, 58.5 76.5 C 61.5 75.5, 62.5 72, 61.5 62 Z" fill="#8C97A6"/>
      <path d="M 57 76 Q 58.5 74.8 60 76 Z" fill="#3E4756"/>
      <path d="M 50 85 Q 55 83.5 60 84.5 Q 66 83 71.5 82.5 Q 63 90.5 50 85 Z" fill="#3E4756"/>
      <path d="M 54 89 Q 60 92 66 88.5 Q 60 90 54 89 Z" fill="#8C97A6"/>
      <circle cx="33" cy="80" r="5" stroke="#3E4756" strokeWidth="2" fill="none"/>
      <circle cx="87" cy="80" r="5" stroke="#3E4756" strokeWidth="2" fill="none"/>
      <path d="M 49 111 Q 60 124 71 111" stroke="#F4F6F9" strokeWidth="1" fill="none"/>
      <path d="M 60 120.5 l -2 3 l 2 3 l 2 -3 z" fill="#F4F6F9"/>
    </svg>
  );
}

/* Eigenes Logo für die Polynomplotter-Kachel: Raster, Achsen, f (weiß), f′ (gold), f″ (grana gestrichelt). */
function PlotterLogo() {
  const W = 340, H = 170, x0 = W / 2, y0 = 92, sx = 34, sy = 22;
  const f = (x) => 0.25 * x ** 4 - 1.6 * x ** 2 + 0.6;
  const fs = (x) => x ** 3 - 3.2 * x;
  const fss = (x) => 3 * x ** 2 - 3.2;
  const pfad = (g, skal = 1) => {
    let d = "";
    for (let i = 0; i <= 160; i++) {
      const x = -4.6 + (9.2 * i) / 160;
      const y = Math.max(-6, Math.min(6, g(x) * skal));
      d += `${i ? "L" : "M"}${(x0 + x * sx).toFixed(1)},${(y0 - y * sy).toFixed(1)}`;
    }
    return d;
  };
  const extrema = [-Math.sqrt(3.2), 0, Math.sqrt(3.2)];
  return (
    <svg viewBox={`0 77 ${W} 64`} preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%", display: "block" }} aria-hidden="true">
      <defs>
        <clipPath id="plotterKachelClip"><rect x="0" y="0" width={W} height={H} /></clipPath>
      </defs>
      <g clipPath="url(#plotterKachelClip)">
        {Array.from({ length: 11 }, (_, i) => x0 + (i - 5) * sx).map((x) => (
          <line key={`v${x}`} x1={x} y1="0" x2={x} y2={H} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
        ))}
        {Array.from({ length: 9 }, (_, i) => y0 + (i - 4) * sy).map((y) => (
          <line key={`h${y}`} x1="0" y1={y} x2={W} y2={y} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
        ))}
        <line x1="0" y1={y0} x2={W} y2={y0} stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" />
        <line x1={x0} y1="0" x2={x0} y2={H} stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" />
        <path d={pfad(fss, 0.35)} stroke={C.granaHell} strokeWidth="2" fill="none" strokeDasharray="5 5" opacity="0.9" />
        <path d={pfad(fs, 0.55)} stroke={C.flaggold} strokeWidth="2.2" fill="none" opacity="0.95" />
        <path d={pfad(f)} stroke={C.weiss} strokeWidth="3.2" fill="none" strokeLinecap="round" />
        {extrema.map((x) => (
          <circle key={x} cx={x0 + x * sx} cy={y0 - f(x) * sy} r="5" fill={C.seeTief} stroke={C.weiss} strokeWidth="2.4" />
        ))}
      </g>
      <g fontSize="13" fontWeight="700" fontStyle="italic">
        <text x={W - 30} y="93" fill={C.weiss}>f</text>
        <text x={W - 30} y="109" fill={C.flaggold}>f′</text>
        <text x={W - 30} y="125" fill={C.granaHell}>f″</text>
      </g>
    </svg>
  );
}

export function StartseiteArchiv({ gehe }) {
  const [wieder, setWieder] = useState(false);
  const [hinweis, setHinweis] = useState("");
  const [schulAuf, setSchulAuf] = useState(false);   // Dropdown „Schulmathematik“

  /* --- Motive --- */

  const Auftaktbild = () => (
    <svg viewBox="0 0 340 150" style={{ width: "100%", height: 150, display: "block" }}>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <line key={`v${i}`} x1={i * 48 + 8} y1="0" x2={i * 48 + 8} y2="150" stroke={C.weiss} strokeWidth="1" opacity="0.08" />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <line key={`h${i}`} x1="0" y1={i * 42 + 14} x2="340" y2={i * 42 + 14} stroke={C.weiss} strokeWidth="1" opacity="0.08" />
      ))}
      <text x="26" y="44" fontSize="26" fill={C.gruen} opacity="0.35" className="schweben">∫</text>
      <text className="pulsieren" x="292" y="132" fontSize="24" fill={C.gruen} opacity="0.28">∑</text>
      <text x="252" y="40" fontSize="19" fill={C.weiss} opacity="0.22">π</text>
      <text x="60" y="132" fontSize="19" fill={C.weiss} opacity="0.22">√</text>
      <text x="168" y="26" fontSize="17" fill={C.weiss} opacity="0.18">f′(x)</text>
      <path className="zeichnen" d="M 10 126 C 70 26, 108 24, 152 76 C 196 128, 240 130, 330 34"
        stroke={C.gruen} strokeWidth="3" fill="none" strokeLinecap="round" />
      <line x1="112" y1="52" x2="192" y2="52" stroke={C.weiss} strokeWidth="1.6" opacity="0.5" strokeDasharray="5 4" />
      <circle cx="152" cy="76" r="4.5" fill={C.weiss} />
      <circle cx="152" cy="52" r="0" fill="none" />
    </svg>
  );

  const MotivMathilda = () => (
    <svg viewBox="0 0 80 80" style={{ width: "100%", height: "100%" }}>
      <rect x="14" y="8" width="46" height="60" rx="4" fill={C.weiss} opacity="0.95" />
      {[20, 29, 38, 47, 56].map((y, i) => (
        <line key={y} x1="21" y1={y} x2={i === 2 ? 44 : 53} y2={y} stroke={i === 2 ? C.gruen : C.hellgrau} strokeWidth={i === 2 ? 2.4 : 1.6} />
      ))}
      <circle className="pulsieren" cx="58" cy="56" r="14" fill="none" stroke={C.gruen} strokeWidth="3" />
      <line x1="68" y1="66" x2="76" y2="74" stroke={C.gruen} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );

  const MotivWissen = () => (
    <svg viewBox="0 0 80 80" style={{ width: "100%", height: "100%" }}>
      <path d="M12 20 H38 V66 H12 Z" fill={C.see} opacity="0.12" />
      <path d="M42 20 H68 V66 H42 Z" fill={C.see} opacity="0.2" />
      <line x1="40" y1="16" x2="40" y2="70" stroke={C.see} strokeWidth="2" />
      {[28, 36, 44, 52].map((y) => (
        <g key={y}>
          <line x1="17" y1={y} x2="34" y2={y} stroke={C.see} strokeWidth="1.5" opacity="0.5" />
          <line x1="47" y1={y} x2="64" y2={y} stroke={C.see} strokeWidth="1.5" opacity="0.5" />
        </g>
      ))}
      <text x="40" y="14" fontSize="15" fill={C.gruenDunkel} textAnchor="middle" fontWeight="700">∑</text>
    </svg>
  );

  const MotivUeben = () => (
    <svg viewBox="0 0 80 80" style={{ width: "100%", height: "100%" }}>
      {[["x²", 20, 26], ["√", 52, 26], ["π", 20, 52], ["∞", 52, 52]].map(([z, x, y], i) => (
        <text key={i} x={x} y={y} fontSize="17" fill={i % 2 ? C.gruenDunkel : C.see} textAnchor="middle" opacity="0.75">{z}</text>
      ))}
      <circle className="pulsieren" cx="40" cy="40" r="30" fill="none" stroke={C.see} strokeWidth="1.5" opacity="0.25" />
      <path d="M28 66 L36 74 L54 54" stroke={C.gruenDunkel} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const MotivKurse = () => (
    <svg viewBox="0 0 80 80" style={{ width: "100%", height: "100%" }}>
      <path d="M10 66 C26 66, 30 44, 42 36 C54 28, 60 22, 72 14" stroke={C.see} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {[[10, 66], [42, 36], [72, 14]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === 2 ? 6 : 4.5} fill={i === 2 ? C.gruenDunkel : C.see} opacity={i === 2 ? 1 : 0.55} />
      ))}
      <text x="66" y="66" fontSize="15" fill={C.gruenDunkel} opacity="0.8" fontWeight="700">∫</text>
    </svg>
  );

  const KACHELN = [
    { id: "mathilda", titel: "Frag Mathilda AI", dunkel: true, motiv: <MotivMathilda />,
      satz: "Fotografiere dein Blatt. Mathilda liest deinen Rechenweg, findet die Stelle, an der er bricht — und sagt dir, was bis dahin trägt.",
      meta: "Blatt prüfen · Weg prüfen · Aufgabe scannen",
      ziel: { ansicht: "analyse", foto: "blatt" } },
    { id: "wissen", titel: "Wissen", motiv: <MotivWissen />,
      satz: "Jede Regel wird hergeleitet, nicht behauptet. Von der Geraden bis zur vollständigen Kurvendiskussion, in acht aufeinander aufbauenden Bausteinen.",
      meta: "8 Bausteine · Herleitungen · Arbeitsheft als PDF",
      ziel: { ansicht: "training", ziel: "module" } },
    { id: "ueben", titel: "Üben", motiv: <MotivUeben />,
      satz: "So viele Aufgaben, wie du willst — in fünf Stufen. Geprüft wird nicht nur das Ergebnis, sondern der ganze Rechenweg.",
      meta: "Generator · Rechenweg · Klausur mit Uhr",
      ziel: { ansicht: "ki", ziel: null } },
    { id: "kurse", titel: "Schulkurse", motiv: <MotivKurse />,
      satz: "Ein klarer Plan für jedes Thema. Analysis in fünf Kursen, Vektoren, Stochastik und Pen & Paper — jeweils von Grund auf, mit Videokurs.",
      meta: "vier Kurse · je 100 €",
      ziel: { ansicht: "kurse" } },
  ];

  /* --- Abschnitte --- */

  const Auftakt = () => (
    <Sektion>
      <p style={{ fontSize: 11.5, letterSpacing: "1.8px", color: C.gruenDunkel, fontWeight: 600, marginTop: 24, marginBottom: 10 }}>
        WILLKOMMEN
      </p>
      <p style={{ fontSize: 16.5, fontWeight: 400, lineHeight: 1.75, color: C.tinte, marginBottom: 10 }}>
        Das hier ist kein weiterer Aufgabenrechner.
      </p>
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.8, marginBottom: 22 }}>
        Matheskript schaut sich an, <b style={{ color: C.tinte, fontWeight: 600 }}>wie</b> du arbeitest — welchen Weg
        du aufs Papier bringst, an welcher Stelle er abreißt und was bis dahin trägt. Denn wer in Klausuren
        scheitert, scheitert fast nie am Stoff, sondern an der Art zu arbeiten. Genau da fangen wir an.
      </p>

      <div className="auftauchen" style={{ background: `linear-gradient(165deg, ${C.see} 0%, ${C.seeTief} 100%)`, borderRadius: 22,
        padding: "26px 22px 8px", marginTop: 20, marginBottom: 26, overflow: "hidden" }}>
        <p style={{ fontSize: 11.5, letterSpacing: "1.8px", color: C.gruen, fontWeight: 600, marginBottom: 12 }}>
          MATHESKRIPT
        </p>
        <h1 className="titel-silber" style={{ fontSize: 31, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 10 }}>
          Mathe ist kein<br />Talenttest.
        </h1>
        <div style={{ width: 62, height: 4, borderRadius: 2, marginBottom: 14,
          background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)` }} />
        <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.75, marginBottom: 6 }}>
          Es ist eine Art zu denken — und die kann man lernen. Hier zählt nicht, ob dein Ergebnis stimmt,
          sondern ob dein Weg trägt.
        </p>
        <Auftaktbild />
      </div>

      <Knopf breit onClick={() => gehe({ ansicht: "ki", ziel: null })}>Jetzt eine Aufgabe rechnen</Knopf>
    </Sektion>
  );

  const Heute = () => {
    const L = LERN;
    const naechste = L.profil ? naechsteKompetenz(L.profil, L.stand) : null;
    const faellig = L.profil ? wiederholListe(L) : [];
    const signal = L.profil ? eskalationSignale(L)[0] : null;
    const heuteMin = L.profil ? Math.round(((L.aktivitaet || {})[tagSchluessel()]?.sekunden || 0) / 60) : 0;
    const serie = L.profil ? serieBerechnen(L) : 0;
    if (L.profil) return (
      <Sektion>
        {signal && <EskalationsKarte signal={signal} gehe={gehe} />}
        <TerminHinweis gehe={gehe} />
        <div className="auftauchen" style={{ background: C.weiss, borderRadius: 18, padding: 22, boxShadow: "0 3px 18px rgba(15,26,51,0.08)", borderTop: `4px solid ${C.gruenDunkel}` }}>
          {L.plan && (
            <div className="flex justify-between items-center" style={{ marginBottom: 14, paddingBottom: 12, borderBottom: `1px solid ${C.linie}` }}>
              <span style={{ fontSize: 13, color: C.grau }}>Heute {heuteMin} von {L.plan.minuten} min</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: serie > 0 ? C.gruenDunkel : C.hellgrau }}>
                {serie} {serie === 1 ? "Tag" : "Tage"} in Folge
              </span>
            </div>
          )}
          <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, marginBottom: 10 }}>
            {L.profil.name ? `${L.profil.name}, dein nächster Schritt` : "Dein nächster Schritt"}
          </p>
          {!L.einstufung ? (
            <>
              <p style={{ fontSize: 19, fontWeight: 600, lineHeight: 1.4, marginBottom: 8 }}>Zuerst die Einstufung.</p>
              <p style={{ color: C.grau, fontSize: 14.5, fontWeight: 300, lineHeight: 1.7, marginBottom: 18 }}>
                Zehn Minuten, danach weißt du, wo dein Weg wirklich beginnt.
              </p>
              <Knopf onClick={() => gehe({ ansicht: "einstufung" })}>Einstufung starten</Knopf>
            </>
          ) : faellig.length > 0 ? (
            <>
              <p style={{ fontSize: 19, fontWeight: 600, lineHeight: 1.4, marginBottom: 8 }}>
                Erst wiederholen: {faellig.length} Kompetenz{faellig.length > 1 ? "en" : ""} fällig.
              </p>
              <p style={{ color: C.grau, fontSize: 14.5, fontWeight: 300, lineHeight: 1.7, marginBottom: 18 }}>
                Keine fünf Minuten. {naechste ? `Danach geht es mit ${naechste.titel} weiter.` : ""}
              </p>
              <Knopf onClick={() => gehe({ ansicht: "wiederholen" })}>Wiederholen</Knopf>
            </>
          ) : naechste ? (
            <>
              <p style={{ fontSize: 19, fontWeight: 600, lineHeight: 1.4, marginBottom: 8 }}>{naechste.titel}</p>
              <p style={{ color: C.grau, fontSize: 14.5, fontWeight: 300, lineHeight: 1.7, marginBottom: 18 }}>{naechste.kann}</p>
              <div className="flex flex-wrap" style={{ gap: 10 }}>
                <Knopf onClick={() => gehe(hatEinheit(naechste.id) ? { ansicht: "einheit", kompetenz: naechste.id } : naechste.ziel || { ansicht: "karte" })}>
                  {hatEinheit(naechste.id) || naechste.ziel ? "Jetzt lernen" : "Auf der Karte ansehen"}
                </Knopf>
              </div>
            </>
          ) : (
            <p style={{ fontSize: 16, lineHeight: 1.7 }}>Auf deiner Stufe ist alles gesichert. Zeit für die Prüfung.</p>
          )}
          <div className="mt-4 flex flex-wrap" style={{ gap: 18 }}>
            <TextLink onClick={() => gehe({ ansicht: "karte" })}>Lernlandkarte öffnen</TextLink>
            <TextLink onClick={() => gehe({ ansicht: "plan" })}>{L.plan ? "Mein Plan" : "Plan anlegen"}</TextLink>
          </div>
        </div>
      </Sektion>
    );
    return (
    <Sektion>
      <div style={{ background: C.weiss, borderRadius: 18, padding: 22, boxShadow: "0 3px 18px rgba(15,26,51,0.08)" }}>
        {wieder ? (
          <>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, marginBottom: 10 }}>Dein Heute</p>
            <p style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.45, marginBottom: 6 }}>{DEMO.heute.titel}</p>
            <p style={{ color: C.grau, fontSize: 14, fontWeight: 300, lineHeight: 1.65, marginBottom: 18 }}>
              Diese Fehlerkarte ist heute wieder fällig. Danach: fünf Minuten Kopfrechnen und {DEMO.kurs.name}.
            </p>
            <Knopf onClick={() => gehe({ ansicht: "ki", ziel: null })}>{DEMO.heute.knopf}</Knopf>
          </>
        ) : (
          <>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, marginBottom: 10 }}>Dein Einstieg</p>
            <p style={{ fontSize: 19, fontWeight: 600, lineHeight: 1.4, marginBottom: 8 }}>
              Wo stehst du wirklich?
            </p>
            <p style={{ color: C.grau, fontSize: 14.5, fontWeight: 300, lineHeight: 1.7, marginBottom: 18 }}>
              Drei Angaben und eine kurze Einstufung — danach zeigt dir Matheskript genau die Stelle, an der dein Weg beginnt.
            </p>
            <Knopf onClick={() => gehe({ ansicht: "profil2" })}>Meinen Weg finden</Knopf>
          </>
        )}
      </div>
    </Sektion>
    );
  };

  const Kacheln = () => (
    <Sektion>
      <p style={{ fontSize: 11.5, letterSpacing: "1.8px", color: C.gruenDunkel, fontWeight: 600, marginBottom: 10 }}>
        VIER WEGE HINEIN
      </p>
      <Titel>Such dir aus, wo du anfängst</Titel>
      <Satz>
        Alles hängt zusammen: Was du im Wissensteil herleitest, übst du nebenan — und Mathilda schaut sich an,
        wie du es aufs Papier bringst.
      </Satz>

      <div style={{ marginTop: 22 }}>
        {KACHELN.map((k, ki) => (
          <button key={k.id} onClick={() => gehe(k.ziel)} className="kachel auftauchen w-full"
            data-verzug={ki}
            style={{ display: "block", textAlign: "left", cursor: "pointer", fontFamily: "inherit",
              width: "100%", padding: 20, marginBottom: 14, borderRadius: 20,
              border: k.dunkel ? "none" : `1px solid ${C.linie}`,
              background: k.dunkel ? `linear-gradient(150deg, ${C.see} 0%, ${C.seeTief} 100%)` : C.weiss,
              boxShadow: k.dunkel ? "0 6px 24px rgba(0,77,152,0.3)" : "0 3px 16px rgba(15,26,51,0.07)",
              animationDelay: `${ki * 90}ms` }}>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em",
                  color: k.dunkel ? C.weiss : C.tinte, marginBottom: 7 }}>{k.titel}</p>
                <p style={{ fontSize: 14, fontWeight: 300, lineHeight: 1.7,
                  color: k.dunkel ? "#C9D6EE" : C.grau, marginBottom: 10 }}>{k.satz}</p>
                <p style={{ fontSize: 12, fontWeight: 500, color: k.dunkel ? C.gruen : C.gruenDunkel }}>{k.meta}</p>
              </div>
              <div className="motivfeld" style={{ width: 64, height: 64, flexShrink: 0, borderRadius: 16, padding: 6,
                background: k.dunkel ? "rgba(255,255,255,0.1)" : C.himmel }}>
                {k.motiv}
              </div>
            </div>
          </button>
        ))}
      </div>

      <p style={{ color: C.hellgrau, fontSize: 12.5, fontWeight: 300, lineHeight: 1.7, marginTop: 4, marginBottom: 22 }}>
        Ohne Kurs kannst du Mathilda dreimal im Monat kostenlos nutzen.
      </p>

      <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, marginBottom: 10 }}>Werkzeuge</p>
      <div className="flex flex-wrap" style={{ gap: 8 }}>
        {[
          { name: "Differenzenquotient", ansicht: "diffq" },
          { name: "Formelsammlung", ansicht: "formeln" },
          { name: "Polynomplotter", ansicht: "plotter" },
          { name: "Kopfrechnen", ansicht: "kopf" },
          { name: "Rechenweg", ansicht: "training", ziel: "weg" },
          { name: "Probeabitur", ansicht: "abitur" },
          { name: "Klausur", ansicht: "training", ziel: "klausur" },
          { name: "Arbeitsblatt", ansicht: "ki", ziel: "blatt" },
          { name: "Fortschritt", ansicht: "profil" },
        ].map((w) => (
          <button key={w.name} onClick={() => gehe(w)} className="kachel px-4 py-2"
            style={{ background: C.weiss, border: `1px solid ${C.linie}`, borderRadius: 999,
              fontSize: 13, color: C.tinte, fontFamily: "inherit", cursor: "pointer" }}>
            {w.name}
          </button>
        ))}
      </div>
    </Sektion>
  );

  const System = () => (
    <Sektion>
      <Titel>Das System dahinter</Titel>
      <div style={{ marginTop: 20, marginBottom: 24 }}>
        {[
          ["Pen & Paper", "Dein Blatt muss dein Denken entlasten, nicht zusätzlich belasten."],
          ["Head & Numbers", "Sicherheit im Umgang mit Zahlen, damit der Kopf für das Eigentliche frei ist."],
          ["Mathe & Ich", "Nicht verstehen ist ein Zustand, kein Urteil über dich."],
        ].map(([t, s], i) => (
          <div key={i} style={{ paddingBottom: 16, marginBottom: 16, borderBottom: i < 2 ? `1px solid ${C.linie}` : "none" }}>
            <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{t}</p>
            <p style={{ color: C.grau, fontSize: 14, fontWeight: 300, lineHeight: 1.6 }}>{s}</p>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 4 }}>Die Matheskript-Bibel</p>
      <p style={{ color: C.grau, fontSize: 13.5, fontWeight: 300, lineHeight: 1.65, marginBottom: 12 }}>
        23 Seiten, das komplette System zum Nachlesen.
      </p>
      <TextLink onClick={() => (BIBEL_URL ? window.open(BIBEL_URL, "_blank") : setHinweis("bibel"))}>
        Kostenlos herunterladen
      </TextLink>
      {hinweis === "bibel" && (
        <p style={{ color: C.grau, fontSize: 13, fontWeight: 300, marginTop: 10, lineHeight: 1.6 }}>
          Der Link zur PDF wird im Code unter BIBEL_URL eingetragen.
        </p>
      )}
    </Sektion>
  );

  const Fortschritt2 = () => {
    const w = zeitraum(LERN, 7), g = zeitraum(LERN, 35);
    const frueher = { aufgaben: g.aufgaben - w.aufgaben, richtig: g.richtig - w.richtig };
    const jetzt = w.aufgaben >= 5 ? Math.round((w.richtig / w.aufgaben) * 100) : null;
    const vorher = frueher.aufgaben >= 5 ? Math.round((frueher.richtig / frueher.aufgaben) * 100) : null;
    return (
    <Sektion>
      <Titel>Dein Fortschritt</Titel>
      {jetzt !== null ? (
        <>
          <p style={{ fontSize: 46, fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1, marginTop: 18, marginBottom: 10 }}>
            {jetzt} %
          </p>
          <p style={{ color: C.grau, fontSize: 14.5, fontWeight: 300, lineHeight: 1.7, marginBottom: 18 }}>
            Diese Woche hast du {w.richtig} von {w.aufgaben} Aufgaben richtig gelöst
            {vorher !== null ? `. In den vier Wochen davor waren es ${vorher} %.` : "."}
          </p>
          <TextLink onClick={() => gehe({ ansicht: "profil" })}>Fehlerprofil ansehen</TextLink>
        </>
      ) : (
        <>
          <Satz>
            Hier steht bald, wie weit du ohne Hilfe kommst — und vor allem, welche Fehlerarten sich bei dir
            wiederholen. Das ist die einzige Zahl, die uns interessiert.
          </Satz>
          <div className="mt-5"><TextLink onClick={() => gehe({ ansicht: "profil" })}>Fortschritt öffnen</TextLink></div>
        </>
      )}
    </Sektion>
    );
  };

  const Eltern = () => (
    <Sektion>
      <div style={{ background: C.weiss, borderRadius: 18, padding: 22, boxShadow: "0 3px 18px rgba(15,26,51,0.07)" }}>
        <Titel>Für Eltern</Titel>
        <Satz>
          Jede Woche ein Bericht: wie eigenständig gearbeitet wurde, wie viel Zeit investiert wurde,
          welche Muster sich verändern. Keine Noten.
        </Satz>
        <div className="mt-5"><Knopf onClick={() => gehe({ ansicht: "bericht" })}>Wochenbericht ansehen</Knopf></div>
        {hinweis === "eltern" && (
          <p style={{ color: C.grau, fontSize: 13, fontWeight: 300, marginTop: 12, lineHeight: 1.6 }}>
            Der Elternzugang kommt mit den Nutzerkonten.
          </p>
        )}
      </div>
    </Sektion>
  );

  const Coaching = () => (
    <Sektion>
      <Titel>Wenn du jemanden brauchst, der draufschaut</Titel>
      <Satz>Persönliches Coaching mit Basti — für die Stellen, an denen eine App an ihre Grenze kommt.</Satz>
      <div className="mt-5"><Knopf onClick={() => setHinweis("coaching")}>Termin ansehen</Knopf></div>
      {hinweis === "coaching" && (
        <p style={{ color: C.grau, fontSize: 13, fontWeight: 300, marginTop: 12, lineHeight: 1.6 }}>
          Hier wird später der Buchungskalender verlinkt.
        </p>
      )}
    </Sektion>
  );

  const Fuss = () => (
    <div style={{ borderTop: `1px solid ${C.linie}`, paddingTop: 20 }}>
      <div className="flex flex-wrap" style={{ gap: 16 }}>
        {["Impressum", "Datenschutz", "Support", "Zugangscode einlösen", "Konto löschen"].map((t) => (
          <span key={t} style={{ fontSize: 12.5, color: C.hellgrau }}>{t}</span>
        ))}
      </div>
      <button onClick={() => { setWieder(!wieder); setHinweis(""); window.scrollTo(0, 0); }} className="mt-5"
        style={{ background: "none", border: `1px solid ${C.linie}`, borderRadius: 999, padding: "7px 14px",
          color: C.hellgrau, fontSize: 12, fontFamily: "inherit", cursor: "pointer" }}>
        {wieder ? "Ansicht: Wiederkehrer" : "Ansicht: Erstbesuch"}
      </button>
    </div>
  );

  return (
    <div className="mx-auto px-6 pb-14" style={{ maxWidth: 620 }}>
      {/* Willkommensbereich über der ersten Box */}
      <section style={{ paddingTop: 26, paddingBottom: 6 }}>
        <h1 style={{ fontSize: "clamp(24px, 6.6vw, 30px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.15, color: C.tinte, margin: 0 }}>
          Willkommen bei <span style={{ color: C.see, whiteSpace: "nowrap" }}>Mythos Mathe</span>.
        </h1>
        <span aria-hidden="true" style={{ display: "block", width: 54, height: 4, borderRadius: 2, marginTop: 12, marginBottom: 14,
          background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)` }} />
        <p style={{ fontSize: 16.5, fontWeight: 500, lineHeight: 1.6, color: C.tinte, marginBottom: 8 }}>
          Mathe verstehen, nicht auswendig lernen.
        </p>
        <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.8, margin: 0 }}>
          Hier wird Oberstufenmathe <b style={{ color: C.tinte, fontWeight: 600 }}>sichtbar</b>: Graphen live plotten,
          Ebenen im Raum drehen, Wahrscheinlichkeiten in Tafeln und Bäumen sehen. Dazu Videokurse mit Kurz-Checks
          und schnelle Kopfrechenrunden. Such dir unten einen Bereich aus und leg los.
        </p>
      </section>
      <ElternabendKachel gesperrt onClick={() => gehe({ ansicht: "elternabend" })} />
      <PlotterKachel onClick={() => setSchulAuf(!schulAuf)} label={schulAuf ? "Schulmathematik zuklappen" : "Schulmathematik aufklappen"}
        logo={<SchulmatheLogoKlein />} titel="Schulmathematik"
        text="Analysis, Vektoren, Stochastik und Formeln – live zum Ausprobieren."
        extra={
          <span aria-hidden="true" style={{ position: "absolute", right: 10, bottom: 10, width: 40, height: 40, borderRadius: 999,
            background: C.flaggold, color: C.seeTief, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700,
            lineHeight: 1, transform: schulAuf ? "rotate(45deg)" : "none", transition: "transform .2s ease", boxShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>+</span>
        } />
      {schulAuf && (
        <div style={{ margin: "4px 0 4px", padding: "2px 0 2px 12px", borderLeft: `3px solid ${C.flaggold}` }}>
      <PlotterKachel klein onClick={() => gehe({ ansicht: "analysis" })} label="Analysis öffnen" logo={<PlotterLogoKlein />}
        titel="Analysis"
        text="Polynomplotter, Advanced Plotter, Ableitungstrainer – Graphen live." />
      <PlotterKachel klein onClick={() => gehe({ ansicht: "vektoren" })} label="Vektoren öffnen" logo={<VektorenLogoKlein />}
        titel="Vektoren"
        text="Der Ebenen-Visualizer zeigt jede Ebene live im Raum – dazu der Videokurs." />
      <PlotterKachel klein onClick={() => gehe({ ansicht: "stochastik" })} label="Stochastik öffnen" logo={<StochastikLogoKlein />}
        titel="Stochastik"
        text="Bernoulli-Kette und Vier-Felder-Tafel: den Zufall live laufen lassen." />
      <PlotterKachel klein onClick={() => gehe({ ansicht: "formeln" })} label="Formelsammlung öffnen" logo={<FormelLogoKlein />}
        titel="Formelsammlung"
        text="Alle wichtigen Formeln der Oberstufe – sauber sortiert zum Nachschlagen." />
        </div>
      )}
      <PlotterKachel onClick={() => gehe({ ansicht: "gleichungen" })} label="Gleichungslöser öffnen" logo={<GleichungenLogoKlein />}
        titel="Gleichungslöser"
        text="Du tippst die Umformung, die App rechnet sie auf beiden Seiten aus." />
      <PlotterKachel onClick={() => gehe({ ansicht: "lgs" })} label="Gleichungssysteme öffnen" logo={<LGSLogoKlein />}
        titel="Gleichungssysteme"
        text="Kombiniere I, II und III, bis x, y und z dastehen – mit Musterlösung." />
      <PlotterKachel onClick={() => gehe({ ansicht: "kopf" })} label="Kopfrechnen öffnen" logo={<KopfrechnenLogoKlein />}
        titel="Kopfrechnen"
        text="Primfaktoren, Quadratzahlen, Einmaleins – schnelle Runden auf Zeit." />
      <MatheCheckenKachel gesperrt onClick={() => gehe({ ansicht: "mathecheck" })} />
      <MasterclassKachel gesperrt onClick={() => gehe({ ansicht: "masterclass" })} />
      <MathCreatorKachel />
      <PlotterKachel gesperrt portraet={<MathildaPortraet />} onClick={() => gehe({ ansicht: "analyse", foto: "blatt" })} label="Frag Mathilda AI öffnen" logo={<MathildaLogoKlein />}
        titel="Frag Mathilda AI"
        text="Foto vom Blatt – Mathilda prüft deinen Weg." />
      <PlotterKachel gesperrt onClick={() => gehe({ ansicht: "kurse", kurs: "penpaper" })} label="Pen & Paper öffnen" logo={<PenPaperBlatt />}
        titel="Pen & Paper"
        text="Klar aufschreiben, strukturiert arbeiten, sicher mit Fehlern umgehen." />
      <PlotterKachel gesperrt onClick={() => gehe({ ansicht: "kurse" })} label="Schulkurse öffnen" logo={<SchulkurseLogoKlein />}
        titel="Schulkurse"
        text="Analysis 1–5, Vektoren und Stochastik – mit Videolektionen und Checks." />

    </div>
  );
}

/* ----------------------------------------------------------------------
   ALTE STARTSEITE + ALLE WERKZEUGE
   Vierte passwortgeschützte Seite im Seiten-Menü (Kopfleiste). Oben die
   Startseite genau so, wie sie vor dem Umbau vom 3. Oktober 2026 aussah
   (Commit e22395b, Datei oben unverändert übernommen). Darunter das
   vollständige Verzeichnis aller Werkzeuge und Bereiche der App – auch
   die, die auf der aktuellen Hauptseite nicht direkt auftauchen.
   Die aktuelle Hauptseite bleibt davon unberührt.
   ---------------------------------------------------------------------- */
function WerkzeugVerzeichnis({ gehe }) {
  const [offen, setOffen] = useState(() => NAV.reduce((o, g) => ({ ...o, [g.id]: g.id === "werkzeuge" }), {}));
  const anzahl = NAV.reduce((n, g) => n + g.eintraege.length, 0);
  const alleAuf = NAV.every((g) => offen[g.id]);
  const setzeAlle = (v) => setOffen(NAV.reduce((o, g) => ({ ...o, [g.id]: v }), {}));
  return (
    <section id="alle-werkzeuge" style={{ marginTop: 34, paddingTop: 26, borderTop: `3px solid ${C.flaggold}` }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.14em", color: C.grau }}>ARCHIV · VOLLSTÄNDIGES VERZEICHNIS</div>
      <h2 style={{ fontSize: "clamp(24px, 6.6vw, 30px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.15, color: C.tinte, margin: "6px 0 0" }}>
        Alle Werkzeuge und Bereiche
      </h2>
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, margin: "10px 0 14px" }}>
        {anzahl} Einträge in {NAV.length} Gruppen – jeder Rechner, Trainer und Bereich der App, auch die, die auf der Hauptseite gerade nicht angezeigt werden.
      </p>
      <button type="button" onClick={() => setzeAlle(!alleAuf)}
        style={{ background: "none", border: `1px solid ${C.linie}`, borderRadius: 999, padding: "7px 14px", color: C.grau, fontSize: 12.5, fontFamily: "inherit", cursor: "pointer", marginBottom: 14 }}>
        {alleAuf ? "Alle Gruppen zuklappen" : "Alle Gruppen aufklappen"}
      </button>
      {NAV.map((g) => (
        <div key={g.id} style={{ background: C.weiss, borderRadius: 14, marginBottom: 10, boxShadow: "0 2px 12px rgba(15,26,51,0.06)", overflow: "hidden" }}>
          <button type="button" onClick={() => setOffen({ ...offen, [g.id]: !offen[g.id] })} aria-expanded={!!offen[g.id]}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
            <span style={{ flex: 1 }}>
              <span style={{ display: "block", fontSize: 16, fontWeight: 700, color: C.tinte }}>{g.name}</span>
              <span style={{ display: "block", fontSize: 12.5, fontWeight: 300, color: C.grau, marginTop: 2 }}>{g.kurz} · {g.eintraege.length}</span>
            </span>
            <span aria-hidden="true" style={{ width: 28, height: 28, borderRadius: 999, background: offen[g.id] ? C.flaggold : C.himmel, color: C.seeTief, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, lineHeight: 1 }}>
              {offen[g.id] ? "−" : "+"}
            </span>
          </button>
          {offen[g.id] && (
            <div style={{ padding: "0 8px 8px", borderTop: `1px solid ${C.linie}` }}>
              {g.eintraege.map((e, i) => (
                <button key={g.id + i} type="button" onClick={() => gehe(e)}
                  style={{ width: "100%", display: "block", padding: "10px 10px", background: "none", border: "none", borderBottom: i < g.eintraege.length - 1 ? `1px solid ${C.linie}` : "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
                  <span style={{ display: "block", fontSize: 14.5, fontWeight: 600, color: C.see }}>{e.name}</span>
                  {e.kurz && <span style={{ display: "block", fontSize: 12.5, fontWeight: 300, color: C.grau, marginTop: 1, lineHeight: 1.45 }}>{e.kurz}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </section>
  );
}

export function EntwurfWerkzeuge({ gehe }) {
  return (
    <div style={{ background: C.sand }}>
      <div className="mx-auto px-6" style={{ maxWidth: 620, paddingTop: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", borderRadius: 10, background: "rgba(237,187,0,0.16)", color: C.tinte, fontSize: 12.5, lineHeight: 1.45 }}>
          <span style={{ flex: 1 }}><b>Archiv:</b> die alte Startseite mit allen Werkzeugen. Die aktuelle Hauptseite bleibt unverändert.</span>
          <a href="#alle-werkzeuge" onClick={(e) => { e.preventDefault(); const z = document.getElementById("alle-werkzeuge"); if (z) z.scrollIntoView({ behavior: "smooth", block: "start" }); }}
            style={{ color: C.see, fontWeight: 700, whiteSpace: "nowrap", textDecoration: "underline" }}>Alle Werkzeuge ↓</a>
        </div>
      </div>
      <StartseiteArchiv gehe={gehe} />
      <div className="mx-auto px-6 pb-14" style={{ maxWidth: 620 }}>
        <WerkzeugVerzeichnis gehe={gehe} />
      </div>
    </div>
  );
}
