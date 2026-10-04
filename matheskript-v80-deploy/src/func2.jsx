import React, { useState, useRef, useEffect } from "react";
import StartBanner from "./funcStartBanner.jsx";
import { createPortal } from "react-dom";
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
import { Mathilda } from "./func10.jsx";
import { KopfKacheln, KopfrechnenLogoKlein, TRAINER } from "./func14.jsx";
import { MeinTrainingZeile } from "./funcTraining.jsx";
import { AppAnleitung } from "./funcAnleitung.jsx";
import { VektorenLogoKlein } from "./func16.jsx";
import { StochastikLogoKlein } from "./func17.jsx";
import { GleichungenLogoKlein } from "./funcGleichungen.jsx";
import { MedaillenschrankLogo, BwmLogo, KarteLogo } from "./funcWettbewerbe.jsx";
import { MasterclassKachel, MatheCheckenKachel, MathCreatorKachel } from "./funcMasterclass.jsx";
import { ElternabendKachel } from "./funcElternabend.jsx";
import { SatzZeilen, saetze } from "./baseSatz.jsx";
import { AufklappZeichen } from "./aufklappen.jsx";

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

function PlotterKachel({ onClick, label, logo, titel, text, marke, kategorie = "Werkzeug", klein, halb, extra, gesperrt, logoHell, portraet, titelUmbruch, keinI18nTitel, auf, haupt, breit }) {
  if (halb) klein = true;   // halbe Höhe: nur Titel und eine Textzeile
  const mehrereSaetze = saetze(text).length > 1;
  return (
    <button onClick={gesperrt ? undefined : onClick} disabled={gesperrt} aria-disabled={gesperrt || undefined} aria-expanded={auf} data-aufklapp-haupt={haupt ? "" : undefined}
      aria-label={gesperrt ? `${titel} – noch gesperrt` : label} title={gesperrt ? "Noch gesperrt" : undefined}
      className={gesperrt ? "kachel-gesperrt" : "plotter-kachel"}
      style={{ display: "flex", width: klein && !breit ? "100%" : "calc(100% + 32px)", marginLeft: klein && !breit ? 0 : -16, marginRight: klein && !breit ? 0 : -16,
        height: "auto", marginTop: klein && !breit ? 8 : 12, padding: 0, border: "none", borderRadius: klein ? 14 : 18,
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
      <div style={{ flex: klein ? "1 1 68%" : "1 1 60%", minWidth: 0, padding: halb ? "8px 8px 8px 14px" : klein ? "14px 8px 14px 14px" : "14px 10px 14px 16px", display: "flex", flexDirection: "column", justifyContent: halb ? "center" : undefined }}>
        <h2 className="kachel-titel" data-kein-i18n={keinI18nTitel || undefined} style={{ fontSize: halb ? "clamp(14px, 3.8vw, 18px)" : "clamp(15px, 4.1vw, 22px)", fontWeight: 700, letterSpacing: "-0.03em",
          lineHeight: 1.1, margin: 0, whiteSpace: titelUmbruch ? "normal" : "nowrap", ...(titelUmbruch ? {} : portraet
            // Titel darf über das Porträt hinauslaufen (das Porträt beginnt erst darunter)
            ? { overflow: "visible", position: "relative", zIndex: 2 }
            : { overflow: "hidden", textOverflow: "ellipsis" }) }}>
          {titel}
        </h2>
        {!halb && <span aria-hidden="true" style={{ display: "block", width: 34, height: 2.5, borderRadius: 2, marginTop: 6,
          background: gesperrt ? "rgba(255,255,255,0.7)" : `linear-gradient(90deg, ${C.goldWarm} 0%, ${C.flaggold} 100%)` }} />}
        {halb ? (
          <p style={{ color: gesperrt ? "rgba(255,255,255,0.92)" : C.weiss, fontSize: 12, fontWeight: 300, lineHeight: 1.35, marginTop: 3, marginBottom: 0,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {text}
          </p>
        ) : (
          <p className={mehrereSaetze ? undefined : "kachel-text"} style={{ color: gesperrt ? "rgba(255,255,255,0.92)" : C.weiss, fontSize: 12.5, fontWeight: 300, lineHeight: 1.4, marginTop: 6, marginBottom: 0,
            WebkitLineClamp: 3, height: "4.2em", overflow: "hidden" }}>
            <SatzZeilen text={text} />
          </p>
        )}
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
            <span style={{ width: halb ? 26 : klein || logoHell ? 34 : 40, height: halb ? 26 : klein || logoHell ? 34 : 40, borderRadius: 999, background: "rgba(255,255,255,0.92)",
              boxShadow: "0 3px 10px rgba(30,40,60,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg viewBox="0 0 24 24" width={halb ? 13 : klein || logoHell ? 17 : 20} height={halb ? 13 : klein || logoHell ? 17 : 20} fill="none" stroke="#5E6878" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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

const ZEIGE_WETTBEWERBE = true;
/* Gesperrte Kurse/Angebote (Schloss) vorerst nicht auf der Startseite zeigen. Auf true setzen, um sie wieder einzublenden. */
const ZEIGE_GESPERRTE = false;

/* Schulmathematik → Bereiche → Werkzeuge (zweistufiges Aufklappmenü) */
const SCHUL_BEREICHE = [
  { id: "analysis", titel: "Analysis", text: "Kurvendiskussion, Steckbriefe, Sinus und Ableitungen – live.", logo: <PlotterLogoKlein />,
    tools: [
      { name: "Kurvendiskussion", zeile: "Graph, Ableitungen und PDF auf Knopfdruck", bild: "kurve",
        kinder: [
          { name: "Polynome", zeile: "Ganzrationale Funktionen bis Grad 4", bild: "poly", ziel: { ansicht: "plotter" } },
          { name: "Beliebige Funktionen", zeile: "Mit sin, ln, eˣ, Wurzeln und Brüchen", bild: "beliebig", ziel: { ansicht: "advplotter" } },
        ] },
      { name: "Sinusfunktion", zeile: "f(x) = a · sin(b · (x − c)) + d", bild: "sinus", ziel: { ansicht: "sinus" } },
      { name: "Steckbriefaufgaben", zeile: "Aus Eigenschaften die Funktion bestimmen", bild: "steckbrief", ziel: { ansicht: "steckbrief" } },
      { name: "Ableitungstrainer", zeile: "f′, f″ und f‴ eingeben und prüfen", bild: "ableitung", ziel: { ansicht: "ableitungstrainer" } },
      { name: "Integrale", zeile: "Stammfunktionen und bestimmte Integrale", bild: "integral", ziel: { ansicht: "integrale" } },
      { name: "Optimierungswerkstatt", zeile: "Schachtel, Fläche, eigener Ansatz", bild: "optimierung", ziel: { ansicht: "optimierung" } },
      { name: "Wachstum und Logarithmen", zeile: "Messwerte, Halbwertszeit, Zielwert", bild: "wachstum", ziel: { ansicht: "wachstum" } },
      { name: "Funktionsscharen", zeile: "Parameter, Ortskurven, Sonderfälle", bild: "scharen", ziel: { ansicht: "scharen" } },
    ], video: { name: "Videokurse Analysis", zeile: "Analysis 1–5 mit Videolektionen und Checks" } },
  { id: "vektoren", titel: "Vektoren", text: "Der Ebenen-Visualizer zeigt jede Ebene live im Raum – dazu der Videokurs.", logo: <VektorenLogoKlein />,
    tools: [
      { name: "Ebenen-Visualizer", zeile: "Ebenen live im Raum drehen", bild: "ebene", ziel: { ansicht: "ebenen" } },
      { name: "Ebene vs. Ebene", zeile: "Schnittgerade und Schnittwinkel", bild: "ebenen2", ziel: { ansicht: "ebenevsebene" } },
      { name: "Rechnen mit Vektoren", zeile: "A ± B, k · A, k · A + j · B mit Rechenweg", bild: "wuerfel", ziel: { ansicht: "vektorgenerator" } },
      { name: "Kreuzprodukt", zeile: "a × b – Formel, eingesetzt, Ergebnis", bild: "kreuz", ziel: { ansicht: "kreuzprodukt" } },
      { name: "Zwei Punkte – eine Gerade", zeile: "Geradengleichung auf zwei Wegen", bild: "gerade2p", ziel: { ansicht: "zweipunkte" } },
      { name: "Drei Punkte – eine Ebene", zeile: "Drei Wege, mit Koordinatenform", bild: "ebene3p", ziel: { ansicht: "dreipunkte" } },
      { name: "Abstände", zeile: "Punkt, Gerade, Ebene – alle Kombinationen", bild: "abstand", ziel: { ansicht: "abstaende" } },
      { name: "Geraden im Raum", zeile: "Punktprobe, Lage von Gerade und Ebene", bild: "geraden", ziel: { ansicht: "geraden" } },
      { name: "Winkel und Skalarprodukt", zeile: "Skalarprodukt, Vektorwinkel, Gerade-Ebene", bild: "winkel", ziel: { ansicht: "winkel" } },
    ], video: { name: "Videokurs Vektoren", zeile: "Fünf Lektionen mit Kurz-Checks" } },
  { id: "stochastik", titel: "Stochastik", text: "Bernoulli-Kette und Vier-Felder-Tafel: den Zufall live laufen lassen.", logo: <StochastikLogoKlein />,
    tools: [
      { name: "Bernoulli-Kette", zeile: "Binomialverteilung live simulieren", bild: "balken", ziel: { ansicht: "bernoulli" } },
      { name: "Vier-Felder-Tafel", zeile: "Mit Baumdiagramm und bedingter WKT", bild: "tafel", ziel: { ansicht: "vierfelder" } },
      { name: "Erwartungswert und faire Spiele", zeile: "Gewinnverteilung, fairer Einsatz, Simulation", bild: "erwartung", ziel: { ansicht: "erwartungswert" } },
      { name: "Urnen und Kombinatorik", zeile: "Ziehen, Zählmethoden, Baumdiagramme", bild: "urne", ziel: { ansicht: "kombinatorik" } },
      { name: "Hypothesentests", zeile: "H₀, Ablehnungsbereich, Fehler 1. und 2. Art", bild: "hypothese", ziel: { ansicht: "hypothesentest" } },
    ], video: { name: "Videokurs Stochastik", zeile: "Vom Baumdiagramm zum Hypothesentest" } },
  { id: "gleichungen", titel: "Gleichungen", text: "Gleichungen umformen und Gleichungssysteme lösen – mit Musterlösung.", logo: <GleichungenLogoKlein />,
    tools: [
      { name: "Gleichungen lösen", zeile: "Du formst um, die App rechnet mit", bild: "gleichung", ziel: { ansicht: "gleichungen" } },
      { name: "Terme und Potenzgesetze", zeile: "Vereinfachen, ausklammern, kürzen", bild: "termkarte", ziel: { ansicht: "terme" } },
      { name: "Gleichungen verstehen", zeile: "Umformen, Methode, Fehler, Lösungsmenge", bild: "gleichverstehen", ziel: { ansicht: "gleichverstehen" } },
      { name: "Gleichungssysteme", zeile: "Mit drei Variablen", bild: "lgs", ziel: { ansicht: "lgs" } },
    ], video: { name: "Videokurs Gleichungen", zeile: "Umformen, Gleichungssysteme, Musterlösungen" } },
];

/* Formelsammlung → Bereiche (Untermenü wie bei Analysis) */
const FORMEL_MENUE = [
  { name: "Analysis", zeile: "Ableiten, Integrieren, Kurvendiskussion", bild: "kurve", ziel: { ansicht: "formeln", bereich: "analysis" } },
  { name: "Vektoren", zeile: "Skalarprodukt, Ebenen, Abstände", bild: "kreuz", ziel: { ansicht: "formeln", bereich: "vektoren" } },
  { name: "Stochastik", zeile: "Bayes, Erwartungswert, Binomialverteilung", bild: "balken", ziel: { ansicht: "formeln", bereich: "stochastik" } },
  { name: "Kopfrechnen", zeile: "Rechentricks, Teilbarkeit, Brüche", bild: "kopf", ziel: { ansicht: "formeln", bereich: "kopfrechnen" } },
  { name: "Trigonometrie", zeile: "Sinussatz, Kosinussatz, Bogenmaß", bild: "trig", ziel: { ansicht: "formeln", bereich: "trigonometrie" } },
  { name: "Terme und Gleichungen", zeile: "Binomische Formeln, pq-Formel, Logarithmen", bild: "terme", ziel: { ansicht: "formeln", bereich: "terme" } },
  { name: "Mengenlehre und Logik", zeile: "Mengen, Junktoren, Beweisverfahren", bild: "menge", ziel: { ansicht: "formeln", bereich: "logik" } },
];

/* ======================================================================
   Menü in den Werkzeug-Seiten (Knopf oben rechts im blauen Kopfbereich)
   Gleicher Aufbau wie die Startseite, aber kompakt: alle Hauptthemen sind
   zugeklappt und lassen sich einzeln aufklappen (+ / −).
   ====================================================================== */
function toolKnoten(t) {
  return t.kinder
    ? { id: t.name, titel: t.name, kinder: t.kinder.map((k) => ({ titel: k.name, ziel: k.ziel })) }
    : { titel: t.name, ziel: t.ziel };
}
function menueBaum() {
  return [
    { id: "mathe", titel: "Mathematik", kinder: [
      ...SCHUL_BEREICHE.map((b) => ({ id: b.id, titel: b.titel, kinder: b.tools.map(toolKnoten) })),
      { id: "formel", titel: "Formelsammlung", kinder: FORMEL_MENUE.map((f) => ({ titel: f.name, ziel: f.ziel })) },
    ] },
  ];
}

/* Alle Seiten, die über das Menü erreichbar sind – dort erscheint der Menü-Knopf im Kopfbereich */
export function istToolMenueSeite(ansicht) {
  const sammle = (liste) => liste.flatMap((k) => (k.kinder ? sammle(k.kinder) : k.ziel ? [k.ziel.ansicht] : []));
  return sammle(menueBaum()).includes(ansicht);
}

export function ToolMenue({ gehe, schliessen, aktuell }) {
  const [offen, setOffen] = useState({});
  const baum = React.useMemo(menueBaum, []);
  useEffect(() => {
    const taste = (e) => { if (e.key === "Escape") schliessen(); };
    window.addEventListener("keydown", taste);
    return () => window.removeEventListener("keydown", taste);
  }, []);
  const zeile = (k, pfad, tiefe) => {
    const id = pfad + "/" + k.titel;
    if (!k.kinder) {
      const aktiv = k.ziel.ansicht === aktuell;
      return (
        <button key={id} type="button" onClick={() => gehe(k.ziel)} aria-current={aktiv ? "page" : undefined}
          style={{ display: "block", width: "100%", textAlign: "left", fontFamily: "inherit", cursor: "pointer", minHeight: 30, padding: "5px 9px", marginTop: 3,
            borderRadius: 8, border: `1px solid ${aktiv ? C.flaggold : C.linie}`, background: aktiv ? "rgba(237,187,0,0.14)" : C.weiss,
            fontSize: 12.5, fontWeight: aktiv ? 700 : 500, color: C.tinte, lineHeight: 1.2 }}>{k.titel}</button>
      );
    }
    const auf = !!offen[id];
    return (
      <div key={id} style={{ marginTop: tiefe === 0 ? 5 : 3 }}>
        <button type="button" onClick={() => setOffen({ ...offen, [id]: !auf })} aria-expanded={auf} data-aufklapp-haupt={tiefe === 0 ? "" : undefined}
          style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between", gap: 8, textAlign: "left", fontFamily: "inherit", cursor: "pointer",
            minHeight: tiefe === 0 ? 36 : 30, padding: "4px 9px", borderRadius: tiefe === 0 ? 10 : 8, border: `1px solid ${auf ? C.see : C.linie}`,
            background: auf ? C.himmel : C.weiss, fontSize: tiefe === 0 ? 13.5 : 12.5, fontWeight: 700, color: C.see, lineHeight: 1.2 }}>
          <span>{k.titel}</span><AufklappZeichen auf={auf} groesse={15} />
        </button>
        {auf && (
          <div data-aufklapp-inhalt style={{ margin: "0 0 3px 5px", paddingLeft: 6, borderLeft: `2px solid ${C.flaggold}` }}>
            {k.kinder.map((x) => zeile(x, id, tiefe + 1))}
          </div>
        )}
      </div>
    );
  };
  return createPortal(
    <>
      <div onClick={schliessen} aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(8,23,59,0.45)" }} />
      <style>{`.tool-menue-panel{position:fixed;top:64px;right:8px;width:60vw;min-width:220px;max-height:calc(100dvh - 76px);overflow-y:auto}
        @media (min-width:768px){.tool-menue-panel{width:33.333vw;min-width:320px}}`}</style>
      <div role="dialog" aria-label="Menü" data-scroll-box className="tool-menue-panel"
        style={{ zIndex: 45, background: C.sand, borderRadius: 14, boxShadow: "0 18px 48px rgba(8,23,59,0.4)", padding: "6px 8px 10px", fontFamily: "Montserrat, system-ui, sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 2px 2px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: C.grau }}>ALLE BEREICHE</span>
          <button type="button" onClick={schliessen} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 12.5, fontWeight: 700, color: C.see, padding: "6px 4px" }}>Schließen</button>
        </div>
        {baum.map((k) => zeile(k, "", 0))}
      </div>
    </>,
    document.body
  );
}

/* Goldener Videokurs-Knopf am Ende jeder Sektion — vorerst gesperrt (Schloss) */
function VideokursGesperrt({ name, zeile }) {
  const [hinweis, setHinweis] = useState(false);
  return (
    <div style={{ margin: "2px 0 14px" }}>
      <style>{`.video-gold{transition:transform .12s ease}
        .video-gold:active{transform:translateY(2px) scale(0.99)}
        @keyframes videoGlanz{0%{transform:translateX(-120%) skewX(-18deg)}60%,100%{transform:translateX(320%) skewX(-18deg)}}`}</style>
      <button type="button" className="video-gold" aria-disabled="true" onClick={() => setHinweis(true)}
        aria-label={`${name} – noch gesperrt`}
        style={{ width: "100%", display: "flex", alignItems: "stretch", padding: 0, border: "none", borderRadius: 13, overflow: "hidden",
          cursor: "not-allowed", fontFamily: "inherit", textAlign: "left", position: "relative", color: C.seeTief,
          background: "linear-gradient(165deg, #FFE7A0 0%, #F3C93A 32%, #E2B53C 62%, #B88A12 100%)",
          boxShadow: "0 8px 18px -5px rgba(120,85,0,0.55), 0 2px 4px rgba(90,60,0,0.25), inset 0 1px 0 rgba(255,255,255,0.75), inset 0 -3px 0 rgba(120,82,0,0.45), inset 0 0 0 1px rgba(255,255,255,0.25)" }}>
        {/* Glanzstreifen */}
        <span aria-hidden="true" style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: "30%", pointerEvents: "none",
          background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0) 100%)",
          animation: "videoGlanz 4.5s ease-in-out 0.6s infinite" }} />
        <span style={{ flex: "1 1 auto", minWidth: 0, padding: "11px 8px 11px 14px", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative" }}>
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.2 }}>{name}</span>
          <span className="unter-zeile" style={{ fontSize: "clamp(11px, 3.1vw, 12.5px)", fontWeight: 500, color: "rgba(14,30,74,0.78)", marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {hinweis ? "Noch gesperrt – bald verfügbar" : zeile}
          </span>
        </span>
        <span style={{ flex: "0 0 clamp(78px, 26%, 150px)", position: "relative", borderLeft: "1px solid rgba(120,82,0,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg viewBox="0 0 120 56" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden="true" style={{ position: "absolute", inset: 0, opacity: 0.4 }}>
            <rect x="34" y="8" width="52" height="38" rx="7" fill="none" stroke={C.seeTief} strokeWidth="1.3" />
            <path d="M54 18 L70 27 L54 36 Z" fill={C.seeTief} />
          </svg>
          <span style={{ position: "relative", width: 36, height: 36, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center",
            background: `linear-gradient(160deg, #1B3A78 0%, ${C.seeTief} 100%)`, boxShadow: "0 3px 8px rgba(14,30,74,0.45), inset 0 1px 0 rgba(255,255,255,0.18)" }}>
            <svg width="16" height="18" viewBox="0 0 16 18" aria-hidden="true">
              <path d="M4 8V5.5a4 4 0 0 1 8 0V8" stroke={C.flaggold} strokeWidth="2" fill="none" strokeLinecap="round" />
              <rect x="1.5" y="8" width="13" height="9" rx="2.2" fill={C.flaggold} />
              <circle cx="8" cy="12.5" r="1.4" fill={C.seeTief} />
            </svg>
          </span>
        </span>
      </button>
    </div>
  );
}

/* Goldener Plus-/Minus-Knopf einer aufklappbaren Hauptkachel */
function PlusKnopf({ auf, klein }) {
  return <AufklappZeichen art="gold" auf={auf} groesse={klein ? 28 : 40} abstand={klein ? 6 : 10} />;
}

/* Grafik für die kleinen Trainer-Kacheln: großes goldenes Zeichen (z. B. 12², ¾) */
function ZeichenLogo({ zeichen }) {
  return (
    <span style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
      color: C.flaggold, fontWeight: 800, fontSize: zeichen.length > 4 ? "clamp(17px, 4.6vw, 24px)" : "clamp(24px, 6.5vw, 32px)", letterSpacing: "-0.01em" }}>
      {zeichen}
    </span>
  );
}

/* Goldener Plus-/Minus-Knopf unten rechts in der Grafik eines aufklappbaren Bereichs */
function AufklappPfeil({ auf, klein }) {
  return <AufklappZeichen art="gold" auf={auf} groesse={klein ? 26 : 30} abstand={8} />;
}

/* Kleine, dünn gezeichnete Motive für die Werkzeug-Knöpfe (viewBox 120 × 56) */
function MiniBild({ art }) {
  const w = "rgba(255,255,255,0.62)", g = C.flaggold;
  const linie = { fill: "none", stroke: w, strokeWidth: 1.3, strokeLinecap: "round", strokeLinejoin: "round" };
  const achsen = <><path d="M8 46 H112" {...linie} strokeWidth="0.9" opacity="0.6" /><path d="M20 52 V6" {...linie} strokeWidth="0.9" opacity="0.6" /></>;
  const txt = (x, y, s, f = w, gr = 11, anchor = "start") => <text x={x} y={y} textAnchor={anchor} style={{ fontSize: gr, fill: f, fontFamily: "inherit", fontWeight: 500 }}>{s}</text>;
  const m = {
    kurve: <>{achsen}<path d="M10 44 C 30 -8, 52 54, 72 22 S 104 6, 112 4" {...linie} stroke={w} /><circle cx="33" cy="17" r="2.6" fill={g} /><circle cx="61" cy="34" r="2.6" fill={g} /><circle cx="48" cy="26" r="2" fill="#fff" /></>,
    poly: <>{achsen}<path d="M12 50 C 30 -10, 60 60, 78 18 S 104 2, 112 0" {...linie} /><circle cx="36" cy="16" r="2.4" fill={g} /><circle cx="64" cy="36" r="2.4" fill={g} /></>,
    beliebig: <>{achsen}<path d="M10 30 Q 20 10 30 30 T 50 30 T 70 30" {...linie} /><path d="M66 44 C 84 42, 98 30, 112 6" {...linie} stroke={g} /></>,
    sinus: <>{achsen}<path d="M8 30 Q 20 4 32 30 T 56 30 T 80 30 T 104 30" {...linie} /><path d="M8 30 H112" stroke={g} strokeWidth="0.9" strokeDasharray="3 3" opacity="0.8" /></>,
    steckbrief: <>{achsen}<path d="M10 48 C 26 -6, 44 -2, 60 28 S 92 58, 110 6" {...linie} /><circle cx="32" cy="12" r="2.8" fill={g} /><circle cx="84" cy="43" r="2.8" fill={g} />{txt(38, 12, "H", g, 9.5)}{txt(90, 46, "T", g, 9.5)}{txt(70, 14, "f(x) = ?", "#fff", 10.5)}</>,
    ableitung: <>{txt(60, 25, "f′(x) = …", "#fff", 15, "middle")}{txt(60, 44, "f″(x) = …", w, 11, "middle")}</>,
    ebene: <><path d="M18 40 L52 12 L104 18 L70 46 Z" {...linie} fill="rgba(255,255,255,0.08)" /><path d="M61 29 V4" stroke={g} strokeWidth="1.6" /><path d="M57 9 L61 3 L65 9" stroke={g} strokeWidth="1.4" fill="none" /></>,
    ebenen2: <><path d="M14 38 L48 14 L100 20 L66 44 Z" {...linie} fill="rgba(255,255,255,0.06)" /><path d="M40 6 L84 8 L82 50 L38 48 Z" {...linie} fill="rgba(255,255,255,0.06)" /><path d="M39 26 L83 30" stroke={g} strokeWidth="1.8" /></>,
    wuerfel: <><path d="M40 16 L60 8 L80 16 L60 24 Z" {...linie} /><path d="M40 16 V38 L60 48 V24" {...linie} /><path d="M80 16 V38 L60 48" {...linie} /><circle cx="60" cy="16" r="2" fill={g} /><circle cx="50" cy="30" r="1.8" fill="#fff" /><circle cx="70" cy="28" r="1.8" fill="#fff" /><circle cx="70" cy="38" r="1.8" fill="#fff" /></>,
    kreuz: <><path d="M30 44 L84 44" {...linie} /><path d="M30 44 L58 22" {...linie} /><path d="M30 44 L30 6" stroke={g} strokeWidth="1.7" /><path d="M26 11 L30 5 L34 11" stroke={g} strokeWidth="1.4" fill="none" />{txt(88, 47, "a", w, 10)}{txt(60, 22, "b", w, 10)}{txt(36, 12, "a×b", g, 10)}</>,
    gerade2p: <><path d="M10 46 L110 8" {...linie} /><circle cx="36" cy="36.1" r="3.2" fill={g} /><circle cx="84" cy="17.9" r="3.2" fill="#fff" />{txt(30, 50, "A", g, 10)}{txt(86, 32, "B", w, 10)}</>,
    ebene3p: <><path d="M14 40 L48 12 L106 18 L72 46 Z" {...linie} fill="rgba(255,255,255,0.06)" /><path d="M38 34 L62 18 L84 32 Z" stroke={g} strokeWidth="1.4" fill="rgba(237,187,0,0.22)" /><circle cx="38" cy="34" r="2.6" fill={g} /><circle cx="62" cy="18" r="2.6" fill="#fff" /><circle cx="84" cy="32" r="2.6" fill="#fff" /></>,
    abstand: <><path d="M12 42 L46 18 L108 22 L74 48 Z" {...linie} fill="rgba(255,255,255,0.06)" /><path d="M60 33 V6" stroke={g} strokeWidth="1.4" strokeDasharray="3 3" /><circle cx="60" cy="6" r="3" fill={g} /><circle cx="60" cy="33" r="2.2" fill="#fff" />{txt(66, 22, "d", g, 11)}</>,
    geraden: <><path d="M10 42 L110 12" {...linie} /><path d="M20 10 L100 46" stroke={g} strokeWidth="1.6" fill="none" strokeLinecap="round" /><circle cx="58" cy="28" r="3" fill="#fff" /></>,
    winkel: <><path d="M16 44 L106 44" {...linie} /><path d="M16 44 L84 12" stroke={g} strokeWidth="1.6" fill="none" strokeLinecap="round" /><path d="M44 44 A28 28 0 0 0 38 31" stroke="#fff" strokeWidth="1.2" fill="none" />{txt(50, 38, "φ", g, 11)}</>,
    optimierung: <>{achsen}<path d="M12 44 C 30 40, 40 8, 60 8 S 92 40, 112 44" {...linie} /><circle cx="60" cy="8" r="3.2" fill={g} /><path d="M60 8 V46" stroke={g} strokeWidth="1.2" strokeDasharray="3 3" /></>,
    gleichverstehen: <>{txt(12, 24, "2x + 3 = 11", "#fff", 12)}{txt(12, 40, "x = 4", g, 13)}<path d="M84 44 C 92 30, 100 30, 108 14" {...linie} /></>,
    termkarte: <>{txt(14, 34, "a(b+c)", "#fff", 13)}{txt(14, 50, "= ab + ac", g, 11)}{txt(86, 20, "xⁿ", g, 15)}</>,
    integral: <>{achsen}<path d="M30 46 L30 30 C 44 14, 60 10, 76 20 L76 46 Z" fill="rgba(237,187,0,0.35)" /><path d="M10 40 C 26 34, 34 22, 48 15 S 80 14, 112 30" {...linie} />{txt(84, 18, "∫", g, 15)}</>,
    erwartung: <>{txt(60, 24, "E(X) = 0", "#fff", 14, "middle")}{txt(60, 44, "fair", g, 12, "middle")}<path d="M44 47 H76" stroke={g} strokeWidth="1" /></>,
    urne: <><path d="M34 10 Q30 50 60 50 Q90 50 86 10" {...linie} fill="rgba(255,255,255,0.06)" /><circle cx="50" cy="40" r="5" fill={g} /><circle cx="62" cy="42" r="5" fill="#fff" /><circle cx="72" cy="36" r="5" fill={g} /><circle cx="57" cy="31" r="5" fill="#fff" /></>,
    hypothese: <>{[4, 10, 20, 30, 34, 26, 14, 6, 2].map((h, i) => <rect key={i} x={18 + i * 10} y={48 - h} width="7" height={h} rx="1.5" fill={i >= 7 ? g : "rgba(255,255,255,0.5)"} />)}<path d="M88 6 V50" stroke={g} strokeWidth="1.2" strokeDasharray="3 3" />{txt(92, 14, "α", g, 12)}</>,
    wachstum: <>{achsen}<path d="M12 46 C 50 44, 80 34, 112 4" {...linie} /><path d="M12 10 C 40 30, 70 42, 112 46" {...linie} stroke={g} />{txt(70, 16, "aᵗ", "#fff", 13)}</>,
    scharen: <>{achsen}{[0.5, 1, 1.6].map((k, i) => <path key={i} d={`M12 ${46 - 4 * k} Q 60 ${46 - 40 * k} 108 ${46 - 4 * k}`} {...linie} stroke={i === 1 ? g : w} opacity={i === 1 ? 1 : 0.6} />)}{txt(92, 14, "a", g, 13)}</>,
    video: <><rect x="34" y="8" width="52" height="38" rx="7" {...linie} /><path d="M54 18 L70 27 L54 36 Z" fill={g} /></>,
    balken: <>{[6, 14, 26, 36, 30, 18, 9, 4].map((h, i) => <rect key={i} x={20 + i * 11} y={48 - h} width="7" height={h} rx="1.5" fill={i === 3 ? g : "rgba(255,255,255,0.5)"} />)}</>,
    tafel: <><rect x="30" y="8" width="60" height="40" rx="4" {...linie} /><path d="M60 8 V48 M30 28 H90" {...linie} /><rect x="31" y="9" width="28" height="18" fill="rgba(237,187,0,0.35)" /></>,
    gleichung: <>{txt(60, 22, "3x + 5 = 20", "#fff", 13, "middle")}{txt(60, 42, "x = 5", g, 13, "middle")}<path d="M42 47 H78" stroke={g} strokeWidth="1" /></>,
    kopf: <>{txt(60, 23, "17 · 11", "#fff", 14, "middle")}{txt(60, 44, "= 187", g, 13, "middle")}</>,
    trig: <><path d="M22 46 H94 V12 Z" {...linie} fill="rgba(255,255,255,0.06)" /><path d="M87 46 V39 H94" {...linie} strokeWidth="1" /><path d="M38 46 A16 16 0 0 0 36.5 39.2" stroke={g} strokeWidth="1.6" fill="none" />{txt(41, 43, "α", g, 10)}{txt(99, 32, "a", w, 10)}{txt(56, 25, "c", w, 10)}</>,
    terme: <>{txt(60, 23, "(a + b)²", "#fff", 14, "middle")}{txt(60, 43, "a² + 2ab + b²", g, 11, "middle")}</>,
    menge: <><circle cx="48" cy="28" r="18" {...linie} fill="rgba(255,255,255,0.06)" /><circle cx="72" cy="28" r="18" {...linie} fill="rgba(255,255,255,0.06)" /><path d="M60 14.6 A18 18 0 0 1 60 41.4 A18 18 0 0 1 60 14.6 Z" fill={g} opacity="0.8" />{txt(38, 32, "A", w, 10)}{txt(78, 32, "B", w, 10)}</>,
    lgs: <><path d="M20 8 C 14 8, 16 28, 11 28 C 16 28, 14 48, 20 48" {...linie} stroke={g} />{txt(26, 18, "x + y + z = 6", w, 10.5)}{txt(26, 32, "2x − y + z = 3", w, 10.5)}{txt(26, 46, "x + 2y − z = 2", w, 10.5)}</>,
  };
  return <svg viewBox="0 0 120 56" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden="true">{m[art]}</svg>;
}

/* Werkzeug-Knöpfe unter einem Bereich: helleres Blau als die Bereichs-Kachel, gleiche Breite,
   Titel + eine Zeile darunter, rechts ein kleines Motiv. Einträge mit „kinder“ klappen eine
   weitere Ebene auf (z. B. Kurvendiskussion → Polynome / Beliebige Funktionen). */
function UnterMenue({ eintraege, gehe, tiefe = 0 }) {
  const [offen, setOffen] = useState(null);
  // Dunkleres Blau für besseren Kontrast zur weißen Schrift; Ebene 2 etwas heller zur Unterscheidung
  const hg = tiefe === 0 ? "linear-gradient(160deg, #1B62AE 0%, #0F4A8A 55%, #0A3A70 100%)" : "linear-gradient(160deg, #2770BC 0%, #18589C 60%, #12487F 100%)";
  return (
    <div data-aufklapp-inhalt style={{ display: "flex", flexDirection: "column", gap: 6, margin: tiefe ? "0 0 4px 14px" : "6px 0 10px" }}>
      <style>{`.unter-knopf{transition:transform .12s ease, filter .12s ease}
        .unter-knopf:active{transform:translateY(2px) scale(0.99);box-shadow:0 2px 6px rgba(10,40,90,0.3), inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(0,0,0,0.25) !important}
        @media (hover:hover){.unter-knopf:hover{filter:brightness(1.07)}}
        .unter-zeile{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        @keyframes unterAuf{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}`}</style>
      {eintraege.map((e, i) => {
        const auf = offen === e.name;
        return (
          <React.Fragment key={e.name}>
            <button className="unter-knopf" onClick={() => (e.kinder ? setOffen(auf ? null : e.name) : gehe(e.ziel))}
              aria-expanded={e.kinder ? auf : undefined}
              style={{ width: "100%", display: "flex", alignItems: "stretch", padding: 0, border: "none", borderRadius: 13, overflow: "hidden",
                cursor: "pointer", fontFamily: "inherit", textAlign: "left", background: hg, color: C.weiss, position: "relative",
                boxShadow: "0 7px 16px -4px rgba(8,34,78,0.45), 0 2px 4px rgba(8,34,78,0.18), inset 0 1px 0 rgba(255,255,255,0.28), inset 0 -3px 0 rgba(0,0,0,0.22), inset 0 0 0 1px rgba(255,255,255,0.10)",
                animation: `unterAuf .18s ease ${i * 0.03}s both` }}>
              <span style={{ flex: "1 1 auto", minWidth: 0, padding: "11px 8px 11px 14px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.2 }}>{e.name}</span>
                <span className="unter-zeile" style={{ fontSize: "clamp(11px, 3.1vw, 12.5px)", fontWeight: 400, color: "rgba(255,255,255,0.86)", marginTop: 3 }}>{e.zeile}</span>
              </span>
              <span style={{ flex: "0 0 clamp(78px, 26%, 150px)", position: "relative", borderLeft: "1px solid rgba(255,255,255,0.14)", padding: "6px 6px",
                display: "flex", alignItems: "center" }}>
                <MiniBild art={e.bild} />
                {e.kinder && <AufklappPfeil auf={auf} klein />}
              </span>
            </button>
            {e.kinder && auf && <UnterMenue eintraege={e.kinder} gehe={gehe} tiefe={tiefe + 1} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export function Startseite({ gehe }) {
  const [wieder, setWieder] = useState(false);
  const [hinweis, setHinweis] = useState("");
  const [schulAuf, setSchulAuf] = useState(false);     // Dropdown „Mathe-Training“
  const [abiAuf, setAbiAuf] = useState(false);          // Unterbereich „Abi-Training“
  const [bereichAuf, setBereichAuf] = useState(null);   // aufgeklappter Unterbereich (analysis, vektoren, …)
  const [kopfAuf, setKopfAuf] = useState(false);        // Dropdown „Kopfrechnen“
  const [wettAuf, setWettAuf] = useState(false);        // Dropdown „Mathe-Wettbewerbe“
  const [formelAuf, setFormelAuf] = useState(false);    // Untermenü „Formelsammlung“

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
    <>
    {/* Banner ganz oben, bündig unter dem Header und über die volle Breite */}
    <StartBanner />
    <div className="mx-auto px-6 pb-14" style={{ maxWidth: 620 }}>
      <section style={{ paddingTop: 24, paddingBottom: 6 }}>
        <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.8, margin: 0 }}>
          Hier wird Oberstufenmathe <b style={{ color: C.tinte, fontWeight: 600 }}>sichtbar</b>: Graphen live plotten,
          Ebenen im Raum drehen, Wahrscheinlichkeiten in Tafeln und Bäumen sehen. Dazu Videokurse mit Kurz-Checks
          und schnelle Kopfrechenrunden. Such dir unten einen Bereich aus und leg los.
        </p>
      </section>
      <AppAnleitung />
      {/* Oberbutton „Mathe-Training“: darunter Abi-Training, Mathematik, Kopfrechnen und Mathe-Wettbewerbe.
          Aufgeklappt wird der Button halb so hoch. */}
      <PlotterKachel breit halb={schulAuf} onClick={() => { setSchulAuf(!schulAuf); setBereichAuf(null); setAbiAuf(false); }} auf={schulAuf}
        label={schulAuf ? "Mathe-Training zuklappen" : "Mathe-Training aufklappen"}
        logo={<SchulmatheLogoKlein />} titel="Mathe-Training"
        text={schulAuf ? "Mathematik, Kopfrechnen und Wettbewerbe." : "Mathematik mit Formelsammlung, Kopfrechnen und Wettbewerbe – alles zum Üben und Nachschlagen."}
        extra={<PlusKnopf auf={schulAuf} klein={schulAuf} />} />
      {schulAuf && (
        <div data-aufklapp-inhalt style={{ margin: "0 0 4px" }}>
          {/* Mathematik (früher „Abi-Training“): Analysis, Vektoren, Stochastik, Gleichungen, Mein Training und Formelsammlung */}
          <PlotterKachel klein breit haupt onClick={() => { setAbiAuf(!abiAuf); setBereichAuf(null); }} auf={abiAuf}
            label={abiAuf ? "Mathematik zuklappen" : "Mathematik aufklappen"}
            logo={<FormelLogoKlein />} titel="Mathematik"
            text="Analysis, Vektoren, Stochastik, Gleichungen und Formelsammlung."
            extra={<AufklappPfeil auf={abiAuf} />} />
          {abiAuf && (
            <div data-aufklapp-inhalt style={{ margin: "4px 0 4px", padding: "2px 0 2px 12px", borderLeft: `3px solid ${C.flaggold}` }}>
              {SCHUL_BEREICHE.map((b) => (
                <React.Fragment key={b.id}>
                  <PlotterKachel klein haupt onClick={() => setBereichAuf(bereichAuf === b.id ? null : b.id)}
                    auf={bereichAuf === b.id} label={bereichAuf === b.id ? `${b.titel} zuklappen` : `${b.titel} aufklappen`}
                    logo={b.logo} titel={b.titel} text={b.text}
                    extra={<AufklappPfeil auf={bereichAuf === b.id} />} />
                  {bereichAuf === b.id && <UnterMenue eintraege={b.tools} gehe={gehe} />}
                  {ZEIGE_GESPERRTE && bereichAuf === b.id && b.video && <VideokursGesperrt name={b.video.name} zeile={b.video.zeile} />}
                </React.Fragment>
              ))}
              <MeinTrainingZeile gehe={gehe} />
              <PlotterKachel klein onClick={() => setFormelAuf(!formelAuf)} auf={formelAuf} label={formelAuf ? "Formelsammlung zuklappen" : "Formelsammlung aufklappen"} logo={<FormelLogoKlein />}
                titel="Formelsammlung"
                text="Alle wichtigen Formeln der Oberstufe – sauber sortiert zum Nachschlagen."
                extra={<AufklappPfeil auf={formelAuf} />} />
              {formelAuf && <UnterMenue eintraege={FORMEL_MENUE} gehe={gehe} />}
              {ZEIGE_GESPERRTE && (<>
              <PlotterKachel halb gesperrt logo={<ZeichenLogo zeichen="≔" />}
                titel="Definitionen"
                text="Alle wichtigen Begriffe der Oberstufe – präzise definiert." />
              <PlotterKachel halb gesperrt logo={<ZeichenLogo zeichen="∴" />}
                titel="Sätze"
                text="Die zentralen Sätze der Oberstufe – klar formuliert." />
              </>)}
            </div>
          )}

          <PlotterKachel klein breit haupt onClick={() => setKopfAuf(!kopfAuf)} auf={kopfAuf} label={kopfAuf ? "Kopfrechnen zuklappen" : "Kopfrechnen aufklappen"} logo={<KopfrechnenLogoKlein />}
            titel="Kopfrechnen"
            text="Primfaktoren, Quadratzahlen, Brüche, Einmaleins – auf Zeit."
            extra={<AufklappPfeil auf={kopfAuf} />} />
          {kopfAuf && (
            <div data-aufklapp-inhalt style={{ margin: "4px 0 4px", padding: "2px 0 2px 12px", borderLeft: `3px solid ${C.flaggold}` }}>
              <div style={{ paddingTop: 8, paddingBottom: 4 }}>
                <KopfKacheln onWaehle={(id) => gehe({ ansicht: "kopf", trainer: id })} />
              </div>
            </div>
          )}

          {ZEIGE_WETTBEWERBE && (<>
            <PlotterKachel klein breit haupt onClick={() => setWettAuf(!wettAuf)} auf={wettAuf} label={wettAuf ? "Mathe-Wettbewerbe zuklappen" : "Mathe-Wettbewerbe aufklappen"}
              logo={<MedaillenschrankLogo />} titel="Mathe-Wettbewerbe"
              text="Bundeswettbewerb Mathematik und Landeswettbewerbe."
              extra={<AufklappPfeil auf={wettAuf} />} />
            {wettAuf && (
              <div data-aufklapp-inhalt style={{ margin: "4px 0 4px", padding: "2px 0 2px 12px", borderLeft: `3px solid ${C.flaggold}` }}>
                <PlotterKachel klein onClick={() => gehe({ ansicht: "bwm" })} label="Bundeswettbewerb Mathematik öffnen" logo={<BwmLogo />} titelUmbruch keinI18nTitel
                  titel="Bundeswettbewerb Mathematik"
                  text="Die nächste 1. Runde und die Aufgaben mit Lösungen vom letzten Jahr." />
                <PlotterKachel klein onClick={() => gehe({ ansicht: "landeswettbewerbe" })} label="Landeswettbewerbe öffnen" logo={<KarteLogo />}
                  titel="Landeswettbewerbe"
                  text="Deutschlandkarte: Tippe auf dein Bundesland." />
              </div>
            )}
          </>)}
        </div>
      )}
      {ZEIGE_GESPERRTE && (<>
      <MatheCheckenKachel gesperrt onClick={() => gehe({ ansicht: "mathecheck" })} />
      <MasterclassKachel gesperrt onClick={() => gehe({ ansicht: "masterclass" })} />
      <MathCreatorKachel />
      <ElternabendKachel gesperrt onClick={() => gehe({ ansicht: "elternabend" })} />
      </>)}
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
    </>
  );
}

/* ---------- Polynomplotter ---------- */


export function hoch(p) {
  return p === 3 ? "³" : p === 2 ? "²" : "";
}


export function termText(a, b, c, d) {
  const teile = [];
  const glied = (k, pot) => {
    if (k === 0) return;
    const vor = teile.length === 0 ? (k < 0 ? "−" : "") : k < 0 ? " − " : " + ";
    const betrag = Math.abs(k);
    const zahl = betrag === 1 && pot > 0 ? "" : String(betrag);
    teile.push(`${vor}${zahl}${pot > 0 ? "x" + hoch(pot) : ""}`);
  };
  glied(a, 3); glied(b, 2); glied(c, 1); glied(d, 0);
  return teile.length ? teile.join("") : "0";
}


export function nullstellen(a, b, c, d, von, bis) {
  const f = (x) => a * x ** 3 + b * x ** 2 + c * x + d;
  const gefunden = [];
  const schritt = 0.002;
  let vorher = f(von);
  for (let x = von + schritt; x <= bis; x += schritt) {
    const jetzt = f(x);
    if (vorher === 0) gefunden.push(x - schritt);
    else if (vorher * jetzt < 0) {
      let lo = x - schritt, hi = x;
      for (let i = 0; i < 60; i++) {
        const mid = (lo + hi) / 2;
        if (f(lo) * f(mid) <= 0) hi = mid; else lo = mid;
      }
      gefunden.push((lo + hi) / 2);
    }
    vorher = jetzt;
  }
  return gefunden
    .map((x) => (Math.abs(x - Math.round(x)) < 1e-4 ? Math.round(x) : Math.round(x * 1000) / 1000))
    .filter((x, i, arr) => i === 0 || Math.abs(x - arr[i - 1]) > 1e-3);
}


export function markantePunkte(a, b, c, d) {
  const f = (x) => a * x ** 3 + b * x ** 2 + c * x + d;
  const f2 = (x) => 6 * a * x + 2 * b;
  const liste = [];

  // Extrempunkte aus f'(x) = 3a x² + 2b x + c
  if (a !== 0) {
    const disk = 4 * b * b - 12 * a * c;
    if (disk > 1e-9) {
      const w = Math.sqrt(disk);
      [(-2 * b + w) / (6 * a), (-2 * b - w) / (6 * a)].forEach((x) => {
        const kr = f2(x);
        liste.push({ x, y: f(x), art: kr < 0 ? "Hochpunkt" : "Tiefpunkt" });
      });
    } else if (Math.abs(disk) <= 1e-9) {
      const x = -2 * b / (6 * a);
      liste.push({ x, y: f(x), art: "Sattelpunkt" });
    }
  } else if (b !== 0) {
    const x = -c / (2 * b);
    liste.push({ x, y: f(x), art: b > 0 ? "Tiefpunkt" : "Hochpunkt" });
  }

  // Wendepunkt aus f''(x) = 6a x + 2b
  if (a !== 0) {
    const x = -b / (3 * a);
    if (!liste.some((p) => p.art === "Sattelpunkt" && Math.abs(p.x - x) < 1e-9)) {
      liste.push({ x, y: f(x), art: "Wendepunkt" });
    }
  }

  return liste
    .map((p) => ({ ...p, x: Math.abs(p.x - Math.round(p.x)) < 1e-9 ? Math.round(p.x) : p.x }))
    .sort((p, q) => p.x - q.x);
}


export function zahl(v) {
  const g = Math.round(v * 100) / 100;
  return Number.isInteger(g) ? String(g) : g.toFixed(2).replace(".", ",");
}

/* Formatiert einen gerundeten (nicht exakten) Wert: immer drei Nachkommastellen
   und drei Punkte als Kennzeichen dafür, dass gerundet wurde. */

export function zahlCa(v) {
  return v.toFixed(3).replace(".", ",") + "...";
}

/* Setzt eine Zahl bei einer Potenzierung in Klammern, wenn sie negativ ist —
   sonst wäre z. B. "-4^2" als Rechenschritt mehrdeutig. */

export function potBasis(n) {
  return n < 0 ? `(${n})` : String(n);
}

/* Nullstellen einer beliebigen Funktion: Vorzeichenwechsel per Bisektion,
   dazu Berührstellen (doppelte Nullstellen), die kein Vorzeichen wechseln. */

export function nullstellenAllg(g, vonSoll, bisSoll) {
  // Etwas über den Rand hinaus suchen, damit Stellen genau auf dem Rand nicht verloren gehen
  const von = vonSoll - 0.01, bis = bisSoll + 0.01;
  const schritt = 0.002, roh = [];
  let xa = von, ga = g(xa);
  for (let x = von + schritt; x <= bis + 1e-12; x += schritt) {
    const gb = g(x);
    if (ga === 0) roh.push(xa);
    else if (ga * gb < 0) {
      let lo = xa, hi = x;
      for (let k = 0; k < 60; k++) { const m = (lo + hi) / 2; if (g(lo) * g(m) <= 0) hi = m; else lo = m; }
      roh.push((lo + hi) / 2);
    }
    xa = x; ga = gb;
  }
  for (let x = von + schritt; x < bis - schritt; x += schritt) {
    const l = Math.abs(g(x - schritt)), m = Math.abs(g(x)), r = Math.abs(g(x + schritt));
    if (m <= l && m <= r && m < 1e-2) {
      let lo = x - schritt, hi = x + schritt;
      for (let k = 0; k < 90; k++) {
        const m1 = lo + (hi - lo) / 3, m2 = hi - (hi - lo) / 3;
        if (Math.abs(g(m1)) < Math.abs(g(m2))) hi = m2; else lo = m1;
      }
      const xm = (lo + hi) / 2;
      if (Math.abs(g(xm)) < 1e-8) roh.push(xm);
    }
  }
  roh.sort((p, q) => p - q);
  // Volle Genauigkeit behalten — gerundet wird erst in der Anzeige.
  return roh
    .map((x) => (Math.abs(x - Math.round(x)) < 1e-7 ? Math.round(x) : x))
    .filter((x) => x >= vonSoll - 1e-9 && x <= bisSoll + 1e-9)
    .filter((x, i, arr) => i === 0 || Math.abs(x - arr[i - 1]) > 1e-3);
}

/* Extrem-, Sattel- und Wendepunkte aus f, f′ und f″ — unabhängig vom Grad. */

export function markanteAllg(f, fs, fss, grad, von, bis) {
  const liste = [], d = 1e-3;
  if (grad >= 2) {
    nullstellenAllg(fs, von, bis).forEach((x) => {
      const k = fss(x);
      let art;
      if (Math.abs(k) > 1e-5) art = k < 0 ? "Hochpunkt" : "Tiefpunkt";
      else {
        const l = fs(x - d), r = fs(x + d);
        art = l > 0 && r < 0 ? "Hochpunkt" : l < 0 && r > 0 ? "Tiefpunkt" : "Sattelpunkt";
      }
      liste.push({ x, y: f(x), art });
    });
  }
  if (grad >= 3) {
    nullstellenAllg(fss, von, bis).forEach((x) => {
      if (fss(x - d) * fss(x + d) < 0 && !liste.some((p) => p.art === "Sattelpunkt" && Math.abs(p.x - x) < 1e-3))
        liste.push({ x, y: f(x), art: "Wendepunkt" });
    });
  }
  return liste.sort((p, q) => p.x - q.x);
}


/* Farbcode je Koeffizient im Polynomplotter: Blau, Rot, Gold, Grün, Lila. */

export function baueReihe(eintraege) {
  let erster = true;
  return eintraege.map(({ schluessel, wert, potenz }) => {
    if (!wert) return null;
    const vor = erster ? (wert < 0 ? "−" : "") : wert < 0 ? "−" : "+";
    erster = false;
    const betrag = Math.abs(wert);
    const zahl = betrag === 1 && potenz > 0 ? "" : String(betrag);
    return { vor, text: `${zahl}${potenz > 0 ? "x" + (KOEFF_HOCH[potenz] || "") : ""}`, farbe: KOEFF_FARBEN[schluessel] };
  });
}

/* Eine Zeile aus f, f′ oder f″ — feste Beschriftungsspalte links, dahinter das
   5-Spalten-Raster, damit alle drei Zeilen exakt aufeinander ausgerichtet sind. */

export function FormelReihe({ label, zeile, fontSize, gewicht, labelFarbe, zeichenFarbe }) {
  return (
    <div className="flex items-center" style={{ marginBottom: 3 }}>
      <span style={{ width: 82, flexShrink: 0, fontSize, fontWeight: gewicht, color: labelFarbe, textAlign: "right", paddingRight: 8, whiteSpace: "nowrap" }}>{label}</span>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, flex: 1 }}>
        {zeile.map((t, i) => (
          <span key={i} style={{ textAlign: "center", fontSize, fontWeight: gewicht, whiteSpace: "nowrap" }}>
            {t && (
              <>
                <span style={{ color: zeichenFarbe }}>{t.vor}</span>{" "}
                <span style={{ color: t.farbe }}>{t.text}</span>
              </>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

/* Sucht eine „schöne" Rasterschrittweite (0.5 / 1 / 2 / 2.5 / 5 / 10 / 20 / 25 / 50 ...)
   für eine gegebene Halbspannweite, damit das Gitter nicht zu dicht oder zu grob wird. */

export function schoenerSchritt(R) {
  const ziel = (2 * R) / 7;
  const kandidaten = [0.5, 1, 2, 2.5, 5, 10, 20, 25, 50, 100, 200];
  for (const k of kandidaten) if (k >= ziel) return k;
  return 200;
}

/* Koeffizienten-Steller des Plotters — nur noch Plus/Minus, jeder in seiner
   eigenen farbigen Box, kompakt für eine gemeinsame Reihe. Bewusst außerhalb
   von Plotter definiert. */

export function teiler(n) {
  n = Math.abs(Math.round(n));
  if (n === 0) return [];
  const t = [];
  for (let i = 1; i <= n; i++) if (n % i === 0) t.push(i);
  return t;
}

/* Horner-Schema — wertet ein Polynom (Koeffizienten höchster bis niedrigster Grad) an x aus. */

export function horner(f, x) {
  return f.reduce((akk, k) => akk * x + k, 0);
}

/* Ganzzahlige Polynomdivision durch (x − nullstelle); nur aufrufen, wenn horner(f, nullstelle) === 0. */

export function syntheticDivInt(f, nullstelle) {
  const q = [f[0]];
  for (let i = 1; i < f.length - 1; i++) q.push(f[i] + nullstelle * q[i - 1]);
  return q;
}

/* Reintext-Darstellung eines Polynoms als reines ASCII (kein ⁴, ′, −, √) —
   die Grundform der Kurvendiskussion-Rechenschritte; für die Anzeige in der
   App macht schoenText() daraus die hübsche Unicode-Notation. */

export function polyTextPdf(fRoh) {
  let f = fRoh.slice();
  while (f.length > 1 && f[0] === 0) f.shift();
  const grad = f.length - 1;
  const teile = [];
  f.forEach((k, i) => {
    if (k === 0) return;
    const pot = grad - i;
    const vor = teile.length === 0 ? (k < 0 ? "-" : "") : k < 0 ? " - " : " + ";
    const betrag = Math.abs(k);
    const zahlTeil = betrag === 1 && pot > 0 ? "" : String(betrag);
    const potTeil = pot > 1 ? `x^${pot}` : pot === 1 ? "x" : "";
    teile.push(`${vor}${zahlTeil}${potTeil}`);
  });
  return teile.length ? teile.join("") : "0";
}

/* Wie polyTextPdf, aber für frei wählbare (Koeffizient, Exponent)-Paare statt
   für ein durchgehendes Koeffizienten-Array — wird für die einzelnen Zeilen
   der schriftlichen Polynomdivision gebraucht, wo pro Schritt nur zwei
   Terme mit unterschiedlichem, nicht direkt benachbartem Exponenten stehen. */

export function paareText(paare) {
  const teile = [];
  paare.forEach(([k, pot]) => {
    if (k === 0) return;
    const vor = teile.length === 0 ? (k < 0 ? "-" : "") : k < 0 ? " - " : " + ";
    const betrag = Math.abs(k);
    const zahlTeil = betrag === 1 && pot > 0 ? "" : String(betrag);
    const potTeil = pot > 1 ? `x^${pot}` : pot === 1 ? "x" : "";
    teile.push(`${vor}${zahlTeil}${potTeil}`);
  });
  return teile.length ? teile.join("") : "0";
}

/* Baut den vollständigen, schriftlichen Rechenweg der Polynomdivision f : (x - r)
   auf — ein Schritt pro Zeile, mit dem Term, der jeweils abgezogen wird, und dem
   Ergebnis danach, exakt nach dem Pen-&-Paper-Prinzip "jeder Schritt sichtbar,
   nichts im Kopf". Zum Schluss steht eine Probe, die die Division bestätigt. */

export function polynomdivisionSchritte(fRoh, r) {
  let f = fRoh.slice();
  while (f.length > 1 && f[0] === 0) f.shift();
  const n = f.length - 1;
  const q = syntheticDivInt(f, r);
  const rTerm = r < 0 ? `x + ${-r}` : `x - ${r}`;
  const zeilen = [];
  zeilen.push({ txt: `${polyTextPdf(f)} : (${rTerm}) = ${polyTextPdf(q)}`, fett: true });
  for (let i = 0; i < n; i++) {
    const powHigh = n - i;
    const powLow = n - i - 1;
    const qi = q[i];
    const naechster = f[i + 1];
    zeilen.push({ txt: `   ${paareText([[qi, powHigh], [naechster, powLow]])}` });
    zeilen.push({ txt: `  -(${paareText([[qi, powHigh], [-qi * r, powLow]])})` });
    zeilen.push({ txt: "   ──────────" });
    const rest = naechster + qi * r;
    if (i < n - 1) {
      zeilen.push({ txt: `   = ${paareText([[rest, powLow]])}`, notiz: "(nächster Term)" });
    } else {
      zeilen.push({ txt: `   = ${rest}`, fett: true });
      zeilen.push({ txt: "Rest = 0  ⇒  die Division geht ohne Rest auf.", fett: true, prosa: true });
    }
  }
  zeilen.push({ txt: `Probe: (${rTerm}) * (${polyTextPdf(q)}) = ${polyTextPdf(f)}`, fett: true, prosa: true });
  return zeilen;
}

/* Wie polyTextPdf, aber für eine Stammfunktion: Koeffizienten dürfen echte
   Brüche sein (z. B. e/5 bei x^5). Ein Bruch-Koeffizient steht dafür in
   Klammern, ein ganzzahliger wie gewohnt ohne. terms: [{coef: {n,d}, potenz}]. */

export function stammfunktionText(terms) {
  let erster = true;
  const teile = [];
  terms.forEach(({ coef, potenz }) => {
    if (coef.n === 0) return;
    const negativ = coef.n < 0;
    const betrag = { n: Math.abs(coef.n), d: coef.d };
    const vor = erster ? (negativ ? "-" : "") : negativ ? " - " : " + ";
    erster = false;
    const eins = betrag.n === 1 && betrag.d === 1 && potenz > 0;
    const zahlTeil = eins ? "" : betrag.d === 1 ? String(betrag.n) : `(${betrag.n}/${betrag.d})`;
    const potTeil = potenz > 1 ? `x^${potenz}` : potenz === 1 ? "x" : "";
    teile.push(`${vor}${zahlTeil}${potTeil}`);
  });
  return teile.length ? teile.join("") : "0";
}

/* Löst eine ganzrationale Gleichung (Koeffizienten höchster bis niedrigster Grad,
   stets ganzzahlig) vollständig und dokumentiert dabei jeden Schritt: zuerst x = 0
   abspalten, dann ganzzahlige Nullstellen raten und per Polynomdivision reduzieren,
   zuletzt den verbleibenden linearen oder quadratischen Rest exakt lösen (pq-/abc-
   Formel). Bleibt ein Faktor vom Grad 3 oder 4 ohne ganzzahlige Nullstelle übrig,
   wird numerisch (Bisektionsverfahren) angenähert. */

export function loeseGanzrational(koeffsRoh) {
  let f = koeffsRoh.slice();
  while (f.length > 1 && f[0] === 0) f.shift();
  const schritte = [];
  const loesungen = [];

  if (f.length === 1) {
    if (f[0] === 0) schritte.push("Diese Gleichung ist für jedes x erfüllt.");
    else schritte.push("Diese Gleichung hat keine Lösung.");
    return { schritte, loesungen };
  }

  // x = 0 abspalten
  let ausklammern = 0;
  while (f.length > 1 && f[f.length - 1] === 0) { ausklammern++; f = f.slice(0, -1); }
  if (ausklammern > 0) {
    loesungen.push({ x: 0, text: "x = 0" });
    schritte.push(`x ausklammern: x * (${polyTextPdf(f)}) = 0  =>  x = 0 ist eine Lösung.`);
  }

  // Ganzzahlige Nullstellen raten und per Polynomdivision reduzieren
  while (f.length - 1 > 2) {
    const c0 = f[f.length - 1];
    if (c0 === 0) { loesungen.push({ x: 0, text: "x = 0" }); f = f.slice(0, -1); continue; }
    const kandidaten = teiler(c0);
    let treffer = null;
    aussen: for (const t of kandidaten) {
      for (const vz of [1, -1]) {
        const kand = vz * t;
        if (horner(f, kand) === 0) { treffer = kand; break aussen; }
      }
    }
    if (treffer === null) break;
    schritte.push(`Ausprobieren: f(${treffer}) = 0 - x = ${treffer} ist eine Nullstelle.`);
    loesungen.push({ x: treffer, text: `x = ${treffer}` });
    // Als ein Block: Anfang (Divisionsaufgabe mit Ergebnis) und Ende (Rest, Probe)
    // sind immer sichtbar, die eigentliche Rechnung dazwischen ist aufklappbar.
    const pdZeilen = polynomdivisionSchritte(f, treffer);
    schritte.push({ pd: true, anfang: pdZeilen[0], mitte: pdZeilen.slice(1, -2), ende: pdZeilen.slice(-2) });
    f = syntheticDivInt(f, treffer);
  }

  const restGrad = f.length - 1;
  if (restGrad === 1) {
    const br = bruch(-f[1], f[0]);
    schritte.push(`Lineare Gleichung: ${polyTextPdf(f)} = 0  =>  x = ${bruchText(br)}`);
    loesungen.push({ x: br.n / br.d, text: `x = ${bruchText(br)}` });
  } else if (restGrad === 2) {
    const A = f[0], B = f[1], Cc = f[2];
    const negB = -B;
    const bQuad = B * B;
    const vierAC = 4 * A * Cc;
    const disk = bQuad - vierAC;
    const zweiA = 2 * A;
    schritte.push(`Quadratische Gleichung: ${polyTextPdf(f)} = 0`);
    schritte.push({ txt: "Quadratische Gleichung lösen (MNF)", fett: true });
    // Erst nur die Koeffizienten einsetzen, ohne etwas auszurechnen …
    schritte.push({ txt: `x_{1,2} = \\frac{-${potBasis(B)} \\pm \\sqrt{${potBasis(B)}^2 - 4 \\cdot ${potBasis(A)} \\cdot ${potBasis(Cc)}}}{2 \\cdot ${potBasis(A)}}`, formel: true });
    // … -b vereinfachen, b² und 4ac getrennt ausrechnen (noch nicht verrechnet) …
    schritte.push({ txt: `x_{1,2} = \\frac{${potBasis(negB)} \\pm \\sqrt{${bQuad} - ${potBasis(vierAC)}}}{${zweiA}}`, formel: true });
    // … dann die Diskriminante zusammenfassen …
    schritte.push({ txt: `x_{1,2} = \\frac{${potBasis(negB)} \\pm \\sqrt{${disk}}}{${zweiA}}`, formel: true });
    if (disk > 1e-9) {
      const wd = Math.sqrt(disk);
      if (Number.isInteger(Math.round(wd)) && Math.round(wd) ** 2 === disk) {
        // … die Wurzel zieht glatt auf, also die Wurzel auflösen …
        const wdG = Math.round(wd);
        schritte.push({ txt: `x_{1,2} = \\frac{${potBasis(negB)} \\pm ${wdG}}{${zweiA}}`, formel: true });
        // … und zuletzt x1 und x2 einzeln als konkrete Ergebnisse.
        const x1 = bruch(-B + wdG, 2 * A), x2 = bruch(-B - wdG, 2 * A);
        schritte.push({ txt: `x_1 = ${bruchLatex(x1)}`, fett: true, formel: true });
        schritte.push({ txt: `x_2 = ${bruchLatex(x2)}`, fett: true, formel: true });
        loesungen.push({ x: x1.n / x1.d, text: `x1 = ${bruchText(x1)}` });
        loesungen.push({ x: x2.n / x2.d, text: `x2 = ${bruchText(x2)}` });
      } else {
        // … die Wurzel ist irrational, also gerundet weiterrechnen …
        schritte.push({ txt: `x_{1,2} = \\frac{${potBasis(negB)} \\pm ${zahlCa(wd)}}{${zweiA}}`, formel: true });
        const x1 = (-B + wd) / (2 * A), x2 = (-B - wd) / (2 * A);
        schritte.push({ txt: `x1 = ${zahlCa(x1)}`, fett: true });
        schritte.push({ txt: `x2 = ${zahlCa(x2)}`, fett: true });
        loesungen.push({ x: x1, text: `x1 = ${zahlCa(x1)}` });
        loesungen.push({ x: x2, text: `x2 = ${zahlCa(x2)}` });
      }
    } else if (Math.abs(disk) <= 1e-9) {
      const x0 = bruch(-B, 2 * A);
      schritte.push({ txt: `x_{1,2} = \\frac{${potBasis(negB)} \\pm 0}{${zweiA}}`, formel: true });
      schritte.push({ txt: `doppelte Lösung x = ${bruchText(x0)}`, fett: true });
      loesungen.push({ x: x0.n / x0.d, text: `x = ${bruchText(x0)} (doppelt)` });
    } else {
      schritte.push({ txt: `D = ${disk} < 0  =>  keine reelle Lösung.`, fett: true });
    }
  } else if (restGrad >= 3) {
    schritte.push({ txt: `Für den verbleibenden Faktor vom Grad ${restGrad} gibt es keine ganzzahlige Nullstelle - die weiteren Lösungen werden numerisch angenähert (Bisektionsverfahren).`, prosa: true });
    const restFn = (x) => horner(f, x);
    const numW = nullstellenAllg(restFn, -40, 40);
    if (numW.length === 0) schritte.push("Keine weiteren reellen Lösungen gefunden.");
    numW.forEach((x) => { schritte.push(`Numerisch: x = ${zahlCa(x)}`); loesungen.push({ x, text: `x = ${zahlCa(x)}` }); });
  }

  loesungen.sort((p, q) => p.x - q.x);
  // Mehrfache Nullstellen (z. B. Grad-2-Rest hat noch einmal dieselbe bereits
  // geratene Nullstelle) zu einem Eintrag zusammenfassen.
  const eindeutig = [];
  loesungen.forEach((l) => {
    const vorhanden = eindeutig.find((v) => Math.abs(v.x - l.x) < 1e-6);
    if (vorhanden) vorhanden.mehrfach = true;
    else eindeutig.push({ ...l });
  });
  const bereinigt = eindeutig.map((l) => (l.mehrfach && !/doppelt/.test(l.text) ? { ...l, text: `${l.text} (doppelte Lösung)` } : l));
  return { schritte, loesungen: bereinigt };
}

/* Baut den kompletten Inhalt der Kurvendiskussion einmal auf — als reine Daten
   (Abschnitte aus Textzeilen), damit die Anzeige in der App überall denselben
   Text und dieselben Rechnungen verwendet. */

export function baueKurvendiskussionInhalt(e, a, b, c, d) {
  const f = (x) => e * x ** 4 + a * x ** 3 + b * x ** 2 + c * x + d;
  const grad = e !== 0 ? 4 : a !== 0 ? 3 : b !== 0 ? 2 : c !== 0 ? 1 : 0;

  const abschnitte = [];
  const abschnitt = (titel) => { const s = { titel, zeilen: [] }; abschnitte.push(s); return s; };
  // formel: true zeichnet die Zeile als echte Formel (mit <M>) statt als
  // reinen Text — für die Mitternachtsformel-Schritte mit richtigem Bruch.
  const z = (sek, txt, fett, formel) => sek.zeilen.push({ txt, fett: !!fett, formel: !!formel });
  // Für ganze, erklärende Sätze (im Unterschied zu Rechenschritten): die dürfen
  // umbrechen und sollen nicht wie eine Formel zum Seitwärtsscrollen zwingen.
  const zP = (sek, txt) => sek.zeilen.push({ txt, prosa: true });
  // Ein aus loeseGanzrational() übernommener Rechenschritt — entweder ein
  // reiner Text (Standardfall) oder ein Objekt mit eigenem fett-/prosa-/formel-Flag.
  const zSchritt = (sek, sc) => {
    if (typeof sc === "string") z(sek, sc);
    else if (sc.pd) sek.zeilen.push(sc);
    else if (sc.prosa) zP(sek, sc.txt);
    else z(sek, sc.txt, sc.fett, sc.formel);
  };

  const s1 = abschnitt("1. Definitionsbereich");
  zP(s1, "D(f) = R (alle reellen Zahlen), da f eine ganzrationale Funktion (ein Polynom) ist.");

  const s2 = abschnitt("2. Symmetrie");
  const nurUngerade = e === 0 && b === 0 && d === 0 && (a !== 0 || c !== 0);
  const nurGerade = a === 0 && c === 0;
  if (nurUngerade) {
    zP(s2, "f enthält nur ungerade Exponenten (x^3 und x^1). Es gilt f(-x) = -f(x), daher ist f punktsymmetrisch zum Ursprung.");
  } else if (nurGerade) {
    zP(s2, "f enthält nur gerade Exponenten (x^4, x^2, x^0). Es gilt f(-x) = f(x), daher ist f achsensymmetrisch zur y-Achse.");
  } else {
    zP(s2, "f enthält sowohl gerade als auch ungerade Exponenten mit Koeffizient ungleich 0. Es gilt weder f(-x) = f(x) noch f(-x) = -f(x) - es liegt keine Symmetrie zur y-Achse oder zum Ursprung vor.");
  }

  const s3 = abschnitt("3. Verhalten im Unendlichen");
  const leit = grad === 4 ? e : grad === 3 ? a : grad === 2 ? b : grad === 1 ? c : d;
  if (grad === 0) {
    zP(s3, `f ist konstant: f(x) = ${d} für alle x.`);
  } else if (grad % 2 === 0) {
    const richtung = leit > 0 ? "plus unendlich" : "minus unendlich";
    zP(s3, `Grad n = ${grad} (gerade), Leitkoeffizient ${leit} (${leit > 0 ? "positiv" : "negativ"}).`);
    zP(s3, `Damit gilt: f(x) strebt für x -> plus unendlich UND für x -> minus unendlich gegen ${richtung}.`);
  } else {
    const rP = leit > 0 ? "plus unendlich" : "minus unendlich", rM = leit > 0 ? "minus unendlich" : "plus unendlich";
    zP(s3, `Grad n = ${grad} (ungerade), Leitkoeffizient ${leit} (${leit > 0 ? "positiv" : "negativ"}).`);
    zP(s3, `Damit gilt: f(x) strebt für x -> plus unendlich gegen ${rP}, und für x -> minus unendlich gegen ${rM}.`);
  }

  // Sammelt alle markanten Punkte für die Übersicht in Abschnitt 10.
  const punkte = [];

  const s4 = abschnitt("4. Nullstellen");
  z(s4, "Ansatz: f(x) = 0", true);
  const nsErg = loeseGanzrational([e, a, b, c, d]);
  nsErg.schritte.forEach((sc) => zSchritt(s4, sc));
  if (nsErg.loesungen.length === 0) zP(s4, "f besitzt keine reelle Nullstelle.");
  else {
    const txt = nsErg.loesungen.map((l, i) => `x${nsErg.loesungen.length > 1 ? "₁₂₃₄₅₆"[i] ?? i + 1 : ""} = ${zahl(l.x)}`).join(",  ");
    z(s4, `Nullstellen: ${txt}`, true);
    nsErg.loesungen.map((l) => l.x).sort((p, q) => p - q)
      .forEach((x) => punkte.push({ art: "Nullstelle", kurz: "N", x, y: 0 }));
  }

  const s5 = abschnitt("5. Erste und zweite Ableitung");
  z(s5, `f'(x)  = ${polyTextPdf([4 * e, 3 * a, 2 * b, c])}`);
  z(s5, `f''(x) = ${polyTextPdf([12 * e, 6 * a, 2 * b])}`);

  const s6 = abschnitt("6. Extrempunkte");
  if (grad <= 1) {
    zP(s6, "Da f höchstens linear ist (Grad kleiner/gleich 1), besitzt f keine Extrempunkte.");
  } else {
    z(s6, `Notw. Bed.: f'(x) = ${polyTextPdf([4 * e, 3 * a, 2 * b, c])} = 0`, true);
    const exErg = loeseGanzrational([4 * e, 3 * a, 2 * b, c]);
    exErg.schritte.forEach((sc) => zSchritt(s6, sc));
    if (exErg.loesungen.length === 0) zP(s6, "f besitzt keine Extrempunkte.");
    else {
      z(s6, "Hinr. Bed.: Vorzeichen von f'' prüfen", true);
      exErg.loesungen.forEach((l) => {
        const fssx = 12 * e * l.x ** 2 + 6 * a * l.x + 2 * b;
        let art;
        if (Math.abs(fssx) > 1e-6) art = fssx < 0 ? "Hochpunkt" : "Tiefpunkt";
        else {
          const l1 = 4 * e * (l.x - 1e-3) ** 3 + 3 * a * (l.x - 1e-3) ** 2 + 2 * b * (l.x - 1e-3) + c;
          const r1 = 4 * e * (l.x + 1e-3) ** 3 + 3 * a * (l.x + 1e-3) ** 2 + 2 * b * (l.x + 1e-3) + c;
          art = l1 > 0 && r1 < 0 ? "Hochpunkt" : l1 < 0 && r1 > 0 ? "Tiefpunkt" : "Sattelpunkt";
        }
        const yWert = f(l.x);
        const kurz = art === "Hochpunkt" ? "H" : art === "Tiefpunkt" ? "T" : "S";
        z(s6, `f''(${zahl(l.x)}) = ${zahl(fssx)} ${fssx < 0 ? "< 0 => Hochpunkt" : fssx > 0 ? "> 0 => Tiefpunkt" : "= 0 => Sattelpunkt"}`);
        z(s6, `${art} ${kurz}(${zahl(l.x)} | ${zahl(yWert)})`, true);
        punkte.push({ art, kurz, x: l.x, y: yWert });
      });
    }
  }

  // Grenze eines Intervalls hübsch beschriften — -∞ / ∞ statt der JS-Werte.
  const grenzeText = (v) => (v === -Infinity ? "-∞" : v === Infinity ? "∞" : zahl(v));

  const s7 = abschnitt("7. Monotonieverhalten");
  {
    const fs = (x) => 4 * e * x ** 3 + 3 * a * x ** 2 + 2 * b * x + c;
    const monErg = loeseGanzrational([4 * e, 3 * a, 2 * b, c]);
    const stellen = monErg.loesungen.map((l) => l.x).sort((p, q) => p - q);
    const grenzen = [-Infinity, ...stellen, Infinity];
    const roh = [];
    for (let i = 0; i < grenzen.length - 1; i++) {
      const li = grenzen[i], re = grenzen[i + 1];
      const testX = !isFinite(li) && !isFinite(re) ? 0 : !isFinite(li) ? re - 1 : !isFinite(re) ? li + 1 : (li + re) / 2;
      const wert = fs(testX);
      const vz = Math.abs(wert) < 1e-9 ? 0 : wert > 0 ? 1 : -1;
      roh.push({ li, re, vz });
    }
    const intervalle = [];
    roh.forEach((iv) => {
      const letzte = intervalle[intervalle.length - 1];
      if (letzte && letzte.vz === iv.vz) letzte.re = iv.re;
      else intervalle.push({ ...iv });
    });
    if (intervalle.length === 1 && intervalle[0].vz === 0) {
      zP(s7, "f'(x) ist auf ganz R gleich 0 — f ist konstant, weder monoton steigend noch fallend.");
    } else {
      intervalle.forEach((iv) => {
        const richtung = iv.vz > 0 ? "streng monoton steigend" : iv.vz < 0 ? "streng monoton fallend" : "konstant";
        z(s7, `(${grenzeText(iv.li)}; ${grenzeText(iv.re)}):  f'(x) ${iv.vz > 0 ? ">" : iv.vz < 0 ? "<" : "="} 0  =>  ${richtung}`, true);
      });
    }
  }

  const s8 = abschnitt("8. Wendepunkte");
  if (grad <= 2) {
    zP(s8, "Da f höchstens quadratisch ist (Grad kleiner/gleich 2), besitzt f keine Wendepunkte.");
  } else {
    z(s8, `Notw. Bed.: f''(x) = ${polyTextPdf([12 * e, 6 * a, 2 * b])} = 0`, true);
    const weErg = loeseGanzrational([12 * e, 6 * a, 2 * b]);
    weErg.schritte.forEach((sc) => zSchritt(s8, sc));
    if (weErg.loesungen.length === 0) zP(s8, "f besitzt keine Wendepunkte.");
    else {
      weErg.loesungen.forEach((l) => {
        const yWert = f(l.x);
        z(s8, `Wendepunkt W(${zahl(l.x)} | ${zahl(yWert)})`, true);
        punkte.push({ art: "Wendepunkt", kurz: "W", x: l.x, y: yWert });
      });
    }
  }

  const s9 = abschnitt("9. Krümmungsverhalten");
  {
    const fss = (x) => 12 * e * x ** 2 + 6 * a * x + 2 * b;
    const kruErg = loeseGanzrational([12 * e, 6 * a, 2 * b]);
    const stellen = kruErg.loesungen.map((l) => l.x).sort((p, q) => p - q);
    const grenzen = [-Infinity, ...stellen, Infinity];
    const roh = [];
    for (let i = 0; i < grenzen.length - 1; i++) {
      const li = grenzen[i], re = grenzen[i + 1];
      const testX = !isFinite(li) && !isFinite(re) ? 0 : !isFinite(li) ? re - 1 : !isFinite(re) ? li + 1 : (li + re) / 2;
      const wert = fss(testX);
      const vz = Math.abs(wert) < 1e-9 ? 0 : wert > 0 ? 1 : -1;
      roh.push({ li, re, vz });
    }
    const intervalle = [];
    roh.forEach((iv) => {
      const letzte = intervalle[intervalle.length - 1];
      if (letzte && letzte.vz === iv.vz) letzte.re = iv.re;
      else intervalle.push({ ...iv });
    });
    if (intervalle.length === 1 && intervalle[0].vz === 0) {
      zP(s9, "f''(x) ist auf ganz R gleich 0 — f hat keine Krümmung (f ist eine Gerade oder konstant).");
    } else {
      intervalle.forEach((iv) => {
        const art = iv.vz > 0 ? "Linkskurve (konvex)" : iv.vz < 0 ? "Rechtskurve (konkav)" : "kein Krümmungsverhalten";
        z(s9, `(${grenzeText(iv.li)}; ${grenzeText(iv.re)}):  f''(x) ${iv.vz > 0 ? ">" : iv.vz < 0 ? "<" : "="} 0  =>  ${art}`, true);
      });
    }
  }

  const s10 = abschnitt("10. Alle markanten Punkte");
  punkte.push({ art: "y-Achsenabschnitt", kurz: "Sᵧ", x: 0, y: d, ohneIndex: true });
  {
    // Gleiche Punktarten durchnummerieren (N₁, N₂, …), sobald es mehr als einen gibt.
    const anzahl = {};
    punkte.forEach((p) => { anzahl[p.kurz] = (anzahl[p.kurz] || 0) + 1; });
    const zaehler = {};
    const gruppen = [
      ["Nullstellen", ["N"]], ["Extrempunkte", ["H", "T", "S"]], ["Wendepunkte", ["W"]], ["y-Achsenabschnitt", ["Sᵧ"]],
    ];
    const nummeriert = punkte.map((p) => {
      zaehler[p.kurz] = (zaehler[p.kurz] || 0) + 1;
      const idx = !p.ohneIndex && anzahl[p.kurz] > 1 ? tiefZiffer(zaehler[p.kurz]) : "";
      return { ...p, name: `${p.kurz}${idx}(${zahl(p.x)} | ${zahl(p.y)})` };
    });
    gruppen.forEach(([titel, kuerzel]) => {
      const liste = nummeriert.filter((p) => kuerzel.includes(p.kurz));
      if (!liste.length) return;
      z(s10, `${titel}:`, true);
      liste.forEach((p) => z(s10, `   ${p.name}${p.kurz === "S" ? "   (Sattelpunkt)" : ""}${p.kurz === "Sᵧ" ? "   da f(0) = " + zahl(p.y) : ""}`));
    });
  }

  const s11 = abschnitt("11. Integrale zwischen den Nullstellen");
  if (nsErg.loesungen.length < 2) {
    zP(s11, "Es gibt weniger als zwei Nullstellen — dadurch lässt sich kein Intervall zwischen Nullstellen bilden.");
  } else {
    const Fe = bruch(e, 5), Fa = bruch(a, 4), Fb = bruch(b, 3), Fc = bruch(c, 2), Fd = bruch(d, 1);
    const stammText = stammfunktionText([
      { coef: Fe, potenz: 5 }, { coef: Fa, potenz: 4 }, { coef: Fb, potenz: 3 },
      { coef: Fc, potenz: 2 }, { coef: Fd, potenz: 1 },
    ]);
    z(s11, `Stammfunktion: F(x) = ${stammText}`, true);
    const Fx = (x) => (e / 5) * x ** 5 + (a / 4) * x ** 4 + (b / 3) * x ** 3 + (c / 2) * x ** 2 + d * x;
    const stellenSortiert = nsErg.loesungen.map((l) => l.x).sort((p, q) => p - q);
    for (let i = 0; i < stellenSortiert.length - 1; i++) {
      const x1 = stellenSortiert[i], x2 = stellenSortiert[i + 1];
      const F1 = Fx(x1), F2 = Fx(x2);
      const wert = F2 - F1;
      z(s11, `I${tiefZiffer(i + 1)}:  Intervall [${zahl(x1)}; ${zahl(x2)}]`, true);
      z(s11, `I${tiefZiffer(i + 1)} = F(${zahl(x2)}) - F(${zahl(x1)})`);
      z(s11, `I${tiefZiffer(i + 1)} = ${zahl(F2)} - ${F1 < 0 ? `(${zahl(F1)})` : zahl(F1)}`);
      z(s11, `I${tiefZiffer(i + 1)} = ${zahl(wert)}`, true);
    }
  }

  return { funktionstext: `f(x) = ${polyTextPdf([e, a, b, c, d])}`, abschnitte };
}

/* Wandelt eine Ziffernfolge (Exponent) in Unicode-Hochstellung um. */

export function hochZiffer(exp) {
  const KARTE = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
  return String(exp).split("").map((z) => KARTE[z] || z).join("");
}

/* Wandelt eine Ziffernfolge (Index) in Unicode-Tiefstellung um. */

export function tiefZiffer(n) {
  const KARTE = { "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄", "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉" };
  return String(n).split("").map((z) => KARTE[z] || z).join("");
}

/* Macht einen in reinem ASCII gehaltenen Rechenschritt für die Anzeige hübsch:
   echte Hoch-Zeichen statt "^2", ein echter Implikationspfeil statt "=>", ein
   echtes Wurzelzeichen statt "sqrt(...)" und das Doppelstrich-R für die
   reellen Zahlen. */

export function schoenText(txt) {
  return txt
    .replace(/\^(\d+)/g, (m, exp) => hochZiffer(exp))
    .replace(/\+\/-/g, "±")
    .replace(/=>/g, "⇒")
    .replace(/sqrt\(/g, "√(")
    .replace("D(f) = R (alle reellen Zahlen)", "D(f) = ℝ (alle reellen Zahlen)");
}

/* Zeigt dieselbe Kurvendiskussion direkt in der App an — gleiche Rechnungen,
   nur hübscher formatiert (echte Hoch-Zeichen, Pfeil, Wurzelzeichen), jede
   Zeile bewusst ohne Umbruch (mit Scrollmöglichkeit bei sehr langen
   Zeilen), damit jede Rechnung sauber in einer Zeile steht. Oben stehen f, f′
   und f″ automatisch farbig untereinander, genau wie über dem Polynomplotter. */

/* Polynomdivision in der Kurvendiskussion: Anfang und Ende stehen immer da,
   die Rechnung dazwischen klappt erst auf Tippen auf. */
function PdZeile({ zl }) {
  return zl.prosa ? (
    <p style={{ fontSize: 12.5, fontWeight: zl.fett ? 700 : 400, color: zl.fett ? C.tinte : C.grau,
      lineHeight: 1.7, whiteSpace: "normal", marginBottom: 4 }}>
      {schoenText(zl.txt)}
    </p>
  ) : (
    <div style={{ overflowX: "auto" }}>
      <p style={{ fontSize: 12.5, fontWeight: zl.fett ? 700 : 400, color: zl.fett ? C.tinte : C.grau,
        lineHeight: 1.7, whiteSpace: "pre", marginBottom: 3 }}>
        {schoenText(zl.txt)}
        {zl.notiz && <span style={{ marginLeft: 44, fontWeight: 300, color: C.hellgrau }}>{zl.notiz}</span>}
      </p>
    </div>
  );
}

function PolynomdivisionBlock({ block }) {
  const [offen, setOffen] = useState(false);
  return (
    <div style={{ borderLeft: `3px solid ${C.see}`, background: C.himmel, borderRadius: 10,
      padding: "10px 12px", margin: "6px 0 10px" }}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
        color: C.see, marginBottom: 6 }}>Polynomdivision</p>
      <PdZeile zl={block.anfang} />
      {block.mitte.length > 0 && (
        <>
          <button onClick={() => setOffen(!offen)} aria-expanded={offen}
            style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", margin: "6px 0",
              padding: "8px 12px", background: C.weiss, border: `1px solid ${C.linie}`, borderRadius: 8,
              cursor: "pointer", fontFamily: "inherit", fontSize: 12.5, fontWeight: 600, color: C.see, textAlign: "left" }}>
            <AufklappZeichen auf={offen} groesse={16} />
            {offen ? "Rechnung ausblenden" : "Rechnung Schritt für Schritt anzeigen"}
          </button>
          {offen && (
            <div data-aufklapp-inhalt style={{ background: C.weiss, borderRadius: 8, padding: "8px 10px", marginBottom: 6 }}>
              {block.mitte.map((zl, i) => <PdZeile key={i} zl={zl} />)}
            </div>
          )}
        </>
      )}
      {block.ende.map((zl, i) => <PdZeile key={i} zl={zl} />)}
    </div>
  );
}

export function KurvendiskussionAnzeige({ e, a, b, c, d }) {
  const inhalt = React.useMemo(() => baueKurvendiskussionInhalt(e, a, b, c, d), [e, a, b, c, d]);
  const zeileF = baueReihe([
    { schluessel: "e", wert: e, potenz: 4 }, { schluessel: "a", wert: a, potenz: 3 },
    { schluessel: "b", wert: b, potenz: 2 }, { schluessel: "c", wert: c, potenz: 1 },
    { schluessel: "d", wert: d, potenz: 0 },
  ]);
  const zeileF1 = baueReihe([
    { schluessel: "e", wert: 4 * e, potenz: 3 }, { schluessel: "a", wert: 3 * a, potenz: 2 },
    { schluessel: "b", wert: 2 * b, potenz: 1 }, { schluessel: "c", wert: c, potenz: 0 },
    { schluessel: "d", wert: 0, potenz: 0 },
  ]);
  const zeileF2 = baueReihe([
    { schluessel: "e", wert: 12 * e, potenz: 2 }, { schluessel: "a", wert: 6 * a, potenz: 1 },
    { schluessel: "b", wert: 2 * b, potenz: 0 }, { schluessel: "c", wert: 0, potenz: 0 },
    { schluessel: "d", wert: 0, potenz: 0 },
  ]);
  const alleLeer = zeileF.every((t) => !t);
  return (
    <div style={{ background: C.weiss, borderRadius: 16, padding: 20, boxShadow: "0 2px 16px rgba(15,26,51,0.07)", marginTop: 18 }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, marginBottom: 6 }}>Kurvendiskussion</p>
      <div style={{ marginBottom: 16 }}>
        {alleLeer ? (
          <p style={{ fontSize: 19, fontWeight: 700, letterSpacing: "-0.01em" }}>f(x) = 0</p>
        ) : (
          <>
            <FormelReihe label="f(x) =" zeile={zeileF} fontSize={19} gewicht={700} labelFarbe={C.tinte} zeichenFarbe={C.tinte} />
            <FormelReihe label="f′(x) =" zeile={zeileF1} fontSize={13} gewicht={600} labelFarbe={C.grau} zeichenFarbe={C.grau} />
            <FormelReihe label="f″(x) =" zeile={zeileF2} fontSize={13} gewicht={600} labelFarbe={C.grau} zeichenFarbe={C.grau} />
          </>
        )}
      </div>
      {inhalt.abschnitte.map((sek, i) => (
        <div key={i} style={{ marginBottom: 18 }}>
          <p style={{ fontSize: 13.5, fontWeight: 700, color: C.see, marginBottom: 8, paddingBottom: 6, borderBottom: `1px solid ${C.linie}` }}>
            {sek.titel}
          </p>
          {sek.zeilen.map((zl, j) =>
            zl.pd ? (
              <PolynomdivisionBlock key={j} block={zl} />
            ) : zl.formel ? (
              <div key={j} style={{ overflowX: "auto" }}>
                <p style={{
                  fontSize: 14, fontWeight: zl.fett ? 700 : 400, color: zl.fett ? C.tinte : C.grau,
                  marginBottom: 6, whiteSpace: "nowrap",
                }}>
                  <M t={zl.txt} />
                </p>
              </div>
            ) : zl.prosa ? (
              <p key={j} style={{
                fontSize: 12.5, fontWeight: zl.fett ? 700 : 400, color: zl.fett ? C.tinte : C.grau,
                lineHeight: 1.7, whiteSpace: "normal", marginBottom: 6,
              }}>
                {schoenText(zl.txt)}
              </p>
            ) : (
              <div key={j} style={{ overflowX: "auto" }}>
                <p style={{
                  fontSize: 12.5, fontWeight: zl.fett ? 700 : 400, color: zl.fett ? C.tinte : C.grau,
                  lineHeight: 1.7, whiteSpace: "pre", marginBottom: 3,
                }}>
                  {schoenText(zl.txt)}
                </p>
              </div>
            )
          )}
        </div>
      ))}
      <IntegralSchaubild e={e} a={a} b={b} c={c} d={d} />
      <PdfKnopf e={e} a={a} b={b} c={c} d={d} />
    </div>
  );
}

/* Lädt den PDF-Export erst beim Tippen (eigene Datei func11.jsx mit jsPDF). */
function PdfKnopf({ e, a, b, c, d }) {
  const [status, setStatus] = useState("bereit");
  const klick = async () => {
    if (status === "laeuft") return;
    setStatus("laeuft");
    try {
      const { kurvendiskussionPdf } = await import("./func11.jsx");
      await kurvendiskussionPdf({ e, a, b, c, d });
      setStatus("bereit");
    } catch (err) {
      console.error(err);
      setStatus("fehler");
    }
  };
  return (
    <div style={{ marginTop: 22 }}>
      <button onClick={klick} disabled={status === "laeuft"}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          padding: "15px 18px", border: "none", borderRadius: 14, cursor: status === "laeuft" ? "wait" : "pointer",
          fontFamily: "inherit", fontSize: 15.5, fontWeight: 700, color: C.weiss,
          background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`,
          boxShadow: "0 6px 20px rgba(0,77,152,0.25)", opacity: status === "laeuft" ? 0.75 : 1 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.flaggold} strokeWidth="2.4"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3v12" /><path d="M7 10l5 5 5-5" /><path d="M5 20h14" />
        </svg>
        {status === "laeuft" ? "PDF wird erstellt …" : "Kurvendiskussion als PDF herunterladen"}
      </button>
      {status === "fehler" && (
        <p style={{ fontSize: 12.5, color: C.signal, marginTop: 8, textAlign: "center" }}>
          Das PDF konnte nicht erstellt werden. Bitte noch einmal versuchen.
        </p>
      )}
    </div>
  );
}

/* Zeigt den Graphen von f — ohne f′ und f″ —, so nah herangezoomt, dass die
   erste Nullstelle ganz links und die letzte ganz rechts im Bild liegt. Die
   Flächen zwischen den Nullstellen sind farbig markiert und mit I₁, I₂, …
   beschriftet, passend zum Abschnitt "Integrale zwischen den Nullstellen". */

export function IntegralSchaubild({ e, a, b, c, d }) {
  const f = (x) => e * x ** 4 + a * x ** 3 + b * x ** 2 + c * x + d;
  const grad = e !== 0 ? 4 : a !== 0 ? 3 : b !== 0 ? 2 : c !== 0 ? 1 : 0;

  const suchR = 40;
  const ns = grad >= 1 ? nullstellenAllg(f, -suchR, suchR) : [];
  if (ns.length < 2) return null;

  const stellen = ns.slice().sort((p, q) => p - q);
  const xMin = stellen[0], xMax = stellen[stellen.length - 1];

  // Eng um die Nullstellen herum zoomen: nur ein kleiner Rand links/rechts,
  // damit die erste und letzte Nullstelle fast am Bildrand liegen.
  const randX = Math.max((xMax - xMin) * 0.08, 0.25);
  const ansichtXMin = xMin - randX, ansichtXMax = xMax + randX;
  const mitteX = (ansichtXMin + ansichtXMax) / 2;
  const halbBreiteX = (ansichtXMax - ansichtXMin) / 2;

  // Benötigte Höhe: der höchste/tiefste Punkt der Kurve genau in diesem Ausschnitt.
  let yMin = 0, yMax = 0;
  const NPROBE = 240;
  for (let i = 0; i <= NPROBE; i++) {
    const x = ansichtXMin + (i * (ansichtXMax - ansichtXMin)) / NPROBE;
    const y = f(x);
    if (isFinite(y)) { yMin = Math.min(yMin, y); yMax = Math.max(yMax, y); }
  }
  const randY = Math.max((yMax - yMin) * 0.16, 0.3);
  const ansichtYMin = yMin - randY, ansichtYMax = yMax + randY;
  const mitteY = (ansichtYMin + ansichtYMax) / 2;
  const halbHoeheY = (ansichtYMax - ansichtYMin) / 2;

  const Sx = 320, Sy = 224, rand = 14;
  const pxX = Sx / 2 - rand, pxY = Sy / 2 - rand;
  const k = Math.min(pxX / halbBreiteX, pxY / halbHoeheY);
  const px = (x) => Sx / 2 + (x - mitteX) * k;
  const py = (y) => Sy / 2 - (y - mitteY) * k;

  const pfadFuer = (fn) => {
    let d = "", offen = false;
    for (let i = 0; i <= 600; i++) {
      const x = ansichtXMin + (i * (ansichtXMax - ansichtXMin)) / 600;
      const y = fn(x);
      if (!isFinite(y)) { offen = false; continue; }
      d += `${offen ? "L" : "M"} ${px(x).toFixed(2)} ${py(y).toFixed(2)} `;
      offen = true;
    }
    return d;
  };
  const pfad = pfadFuer(f);

  const schrittX = schoenerSchritt(halbBreiteX);
  const ersteX = Math.ceil(ansichtXMin / schrittX) * schrittX;
  const linienX = []; for (let v = ersteX; v <= ansichtXMax + 1e-9; v += schrittX) linienX.push(Math.round(v * 1000) / 1000);

  const schrittY = schoenerSchritt(halbHoeheY);
  const ersteY = Math.ceil(ansichtYMin / schrittY) * schrittY;
  const linienY = []; for (let v = ersteY; v <= ansichtYMax + 1e-9; v += schrittY) linienY.push(Math.round(v * 1000) / 1000);

  // Stammfunktion, um jedes Integral mit Vorzeichen konkret auszurechnen.
  const Fx = (x) => (e / 5) * x ** 5 + (a / 4) * x ** 4 + (b / 3) * x ** 3 + (c / 2) * x ** 2 + d * x;

  // Dieselbe Farbfolge wie bei den Koeffizienten-Boxen — Blau, Rot, Gold, Grün, Lila.
  const farben = [C.see, C.gruen, C.gold, C.smaragd, C.lila];
  const intervalle = stellen.slice(0, -1).map((x1, i) => {
    const x2 = stellen[i + 1];
    return { x1, x2, wert: Fx(x2) - Fx(x1), farbe: farben[i % farben.length], label: `I${tiefZiffer(i + 1)}` };
  });

  /* Fläche zwischen Kurve und x-Achse für ein Intervall, als geschlossener Pfad. */
  const flaechenPfad = (x1, x2) => {
    const N = 80;
    let d = `M ${px(x1).toFixed(2)} ${py(0).toFixed(2)} `;
    for (let i = 0; i <= N; i++) {
      const x = x1 + (i * (x2 - x1)) / N;
      d += `L ${px(x).toFixed(2)} ${py(f(x)).toFixed(2)} `;
    }
    d += `L ${px(x2).toFixed(2)} ${py(0).toFixed(2)} Z`;
    return d;
  };

  /* Beschriftung: passt „I₁ = 1,11“ sauber in die Fläche, steht sie innen;
     sonst daneben (außerhalb der Wölbung) mit einer feinen Hinweislinie. */
  const textBreite = (t) => t.length * 7.1 + 2;
  const belegt = [];
  const ueberlappt = (bx) => belegt.some((o) => Math.abs(o.x - bx.x) < (o.breite + bx.breite) / 2 + 4 && Math.abs(o.y - bx.y) < 15);
  const beschriftungen = intervalle.map((iv) => {
    const text = `${iv.label} = ${zahl(iv.wert)}`;
    const breite = textBreite(text);
    // Höchste Auslenkung im Intervall suchen
    const N = 120;
    let xs = iv.x1, ys = 0;
    for (let i = 1; i < N; i++) {
      const x = iv.x1 + (i * (iv.x2 - iv.x1)) / N;
      if (Math.abs(f(x)) > Math.abs(ys)) { xs = x; ys = f(x); }
    }
    const hoehePx = Math.abs(ys) * k;
    const oben = ys >= 0;
    // Mitte des Labels auf halber Höhe der Wölbung, in Pixeln
    const yMitte = py(ys / 2);
    // Zusammenhängende Breite der Fläche um xs herum, auf der Höhe, wo die
    // Oberkante eines Labels mit halber Höhe halbH (Pixel) läge.
    const spanne = (halbH) => {
      const noetig = Math.abs(py(0) - yMitte) + halbH + 2;
      let li = xs, re = xs;
      const schritt = (iv.x2 - iv.x1) / 400;
      while (li - schritt > iv.x1 && Math.abs(f(li - schritt)) * k >= noetig) li -= schritt;
      while (re + schritt < iv.x2 && Math.abs(f(re + schritt)) * k >= noetig) re += schritt;
      return { px: (re - li) * k, mitte: px((li + re) / 2) };
    };
    // 1) einzeilig „I₁ = 2,67“
    const s1 = spanne(7);
    if (hoehePx >= 26 && s1.px >= breite + 8) {
      const bx = { text, breite, farbe: iv.farbe, innen: true, x: s1.mitte, y: yMitte + 4 };
      belegt.push(bx);
      return bx;
    }
    // 2) zweizeilig „I₁“ über „2,67“
    const zeile2 = zahl(iv.wert);
    const breite2 = Math.max(textBreite(iv.label), textBreite(zeile2));
    const s2 = spanne(14);
    if (hoehePx >= 40 && s2.px >= breite2 + 6) {
      const bx = { text, zeilen: [iv.label, zeile2], breite: breite2, farbe: iv.farbe, innen: true, x: s2.mitte, y: yMitte };
      belegt.push(bx);
      return bx;
    }
    // Außen: jenseits der Wölbung, am Rand des Bildes geklemmt, bei Kollision versetzt
    let x = Math.min(Math.max(px(xs), breite / 2 + 5), Sx - breite / 2 - 5);
    let y = oben ? py(ys) - 10 : py(ys) + 20;
    if (y < 14) y = oben ? py(ys) + 20 : 14;
    if (y > Sy - 5) y = Sy - 5;
    const bx = { text, breite, farbe: iv.farbe, innen: false, oben: y < py(ys), x, y,
      ankerX: px(xs), ankerY: py(ys / 2) };
    let versuche = 0;
    while (ueberlappt(bx) && versuche < 6) { bx.y += bx.oben ? -15 : 15; versuche++; }
    belegt.push(bx);
    return bx;
  });

  return (
    <div style={{ background: C.weiss, borderRadius: 16, padding: 20, boxShadow: "0 2px 16px rgba(15,26,51,0.07)", marginTop: 18 }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 14 }}>Nullstellenintegrale</p>
      <svg viewBox={`0 0 ${Sx} ${Sy}`} style={{ width: "100%", maxWidth: 360, display: "block", margin: "0 auto" }}>
        <defs><clipPath id="integralfeld"><rect x="0" y="0" width={Sx} height={Sy} /></clipPath></defs>
        {linienX.map((v) => (
          <line key={`vx${v}`} x1={px(v)} y1={0} x2={px(v)} y2={Sy} stroke={C.linie} strokeWidth="1" />
        ))}
        {linienY.map((v) => (
          <line key={`vy${v}`} x1={0} y1={py(v)} x2={Sx} y2={py(v)} stroke={C.linie} strokeWidth="1" />
        ))}
        <g clipPath="url(#integralfeld)">
          {intervalle.map((iv, i) => (
            <path key={i} d={flaechenPfad(iv.x1, iv.x2)} fill={iv.farbe} opacity="0.28" stroke="none" />
          ))}
        </g>
        <line x1={0} y1={py(0)} x2={Sx} y2={py(0)} stroke={C.hellgrau} strokeWidth="1.5" />
        {ansichtXMin <= 0 && ansichtXMax >= 0 && (
          <line x1={px(0)} y1={0} x2={px(0)} y2={Sy} stroke={C.hellgrau} strokeWidth="1.5" />
        )}
        {linienX.map((v) => (
          <text key={`lx${v}`} x={px(v)} y={py(0) + 13} fontSize="9" fill={C.hellgrau} textAnchor="middle">{zahl(v)}</text>
        ))}
        {linienY.map((v) => (
          <text key={`ly${v}`} x={px(ansichtXMin) + 4} y={py(v) - 3} fontSize="9" fill={C.hellgrau} textAnchor="start">{zahl(v)}</text>
        ))}
        <g clipPath="url(#integralfeld)">
          <path d={pfad} stroke={C.see} strokeWidth="2.5" fill="none" strokeLinejoin="round" />
          {stellen.map((x, i) => (
            <circle key={`n${i}`} cx={px(x)} cy={py(0)} r="4.5" fill={C.weiss} stroke={C.see} strokeWidth="2.5" />
          ))}
        </g>
        {beschriftungen.map((bs, i) => (
          <g key={`beschr${i}`}>
            {!bs.innen && (
              <line x1={bs.ankerX} y1={bs.ankerY} x2={bs.x} y2={bs.y + (bs.oben ? 3 : -11)}
                stroke={bs.farbe} strokeWidth="1" opacity="0.7" />
            )}
            {!bs.innen && (
              <rect x={bs.x - bs.breite / 2 - 3} y={bs.y - 11} width={bs.breite + 6} height={15} rx="3"
                fill={C.weiss} opacity="0.9" />
            )}
            {bs.zeilen ? (
              <text x={bs.x} y={bs.y - 2} fontSize="12" fontWeight="700" fill={bs.farbe} textAnchor="middle">
                <tspan x={bs.x} dy="0">{bs.zeilen[0]}</tspan>
                <tspan x={bs.x} dy="13">{bs.zeilen[1]}</tspan>
              </text>
            ) : (
              <text x={bs.x} y={bs.y} fontSize="12" fontWeight="700" fill={bs.farbe} textAnchor="middle">{bs.text}</text>
            )}
          </g>
        ))}
      </svg>
      <div style={{ marginTop: 14 }}>
        {intervalle.map((iv, i) => (
          <div key={i} className="flex items-center" style={{ gap: 9, marginBottom: 8 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: iv.farbe, flexShrink: 0 }} />
            <span style={{ fontSize: 13.5, fontWeight: 600, color: C.tinte }}>{iv.label} = {zahl(iv.wert)}</span>
            <span style={{ fontSize: 13, color: C.grau, fontWeight: 300 }}>[{zahl(iv.x1)}; {zahl(iv.x2)}]</span>
          </div>
        ))}
      </div>
    </div>
  );
}


