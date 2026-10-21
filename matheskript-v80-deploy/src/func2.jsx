import { MathildaPfade } from "./mathildaBild.jsx";
import React, { useState, useEffect } from "react";
import { C, KOEFF_FARBEN, KOEFF_HOCH } from "./base1.jsx";
import { vz } from "./base2.jsx";
import { Knopf, Satz, Titel, bruch, bruchLatex, bruchText } from "./func1.jsx";
import { M } from "./func3.jsx";
import { Mathilda } from "./func10.jsx";
import { onboardingLesen, stufeAusKlasse } from "./onboarding.js";
import { quickfinderLesen } from "./quickfinder.js";
import { kontoZustand, useKonto } from "./konto.js";
import { klasseErmitteln, werkzeugMerken } from "./hauptmenue.js";
import { lazyLaden } from "./chunkSchutz.jsx";
/* Bereichslogos der Vektoren/Stochastik laden mit ihren Stationen (func16/func17 sind groß) */
const VektorenLogoKlein = lazyLaden(() => import("./func16.jsx").then((m) => ({ default: m.VektorenLogoKlein })));
const StochastikLogoKlein = lazyLaden(() => import("./func17.jsx").then((m) => ({ default: m.StochastikLogoKlein })));
import { klassenBoxen, stufeAusKlassenBox } from "./schulbuch.js";
import { BruchrechnenLogoKlein, DatenLogoKlein, GeometrieLogoKlein, ProzentLogoKlein, ZahlenLogoKlein } from "./funcEntdeckenLogo.jsx";
import { istFrei, entsperren, EVENT_FREI } from "./seitenKonstanten.js";
import { AufklappZeichen } from "./aufklappen.jsx";
import { WERKZEUGE, ansichtenVon, istWerkzeugAnsicht, passtStufe, startBloecke, wo } from "./werkzeuge.js";
import { EtikettPille, EtikettKnoepfe } from "./funcWerkzeuge.jsx";

import { ABI_MENUE, FORMEL_MENUE } from "./startMenues.js";   // gemeinsam mit dem ☰-Hauptmenü
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
      <line x1="0" y1={y0} x2={W} y2={y0} stroke="rgba(255,255,255,0.28)" />
      <line x1={x0} y1="0" x2={x0} y2={H} stroke="rgba(255,255,255,0.28)" />
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

/* Desktop-Breite (ab 840 px, wie das Desktop-Layout in func10.jsx) */
const DESKTOP_MQ = "(min-width: 840px)";

/* Sieben Mathe-Mythen: Aufklappmenü mit Mini-Icons, jeder Mythos klappt einzeln zum Erklärtext auf */
export const MYTHEN = [
  ["★", "„Mathe ist Talent“", "Es gibt kein Mathe-Gen. Gute Noten entstehen aus Methode, Wiederholung und Übung – genau wie beim Klavier oder beim Fußball. Wer früh Erfolg hatte, hat meist früher ein gutes System gefunden, kein besseres Gehirn."],
  ["?", "„Ich bin kein Mathe-Typ“", "Der Satz beschreibt einen Zustand, kein Urteil. „Ich verstehe das noch nicht“ stimmt – „ich kann das nicht“ nie. Sobald die Lücke gefunden ist, lässt sie sich schließen."],
  ["»", "„Gute Schüler rechnen schnell“", "Tempo ist ein Ergebnis von Sicherheit, nicht ihre Ursache. Wer sauber und in kleinen Schritten arbeitet, wird von allein schneller – wer hetzt, macht Flüchtigkeitsfehler."],
  ["×", "„Fehler zeigen, dass ich es nicht kann“", "Fehler sind Information. Sie zeigen genau die Stelle, an der der Weg bricht. Wer seine Fehlerarten kennt, hat den größten Teil der Arbeit schon getan."],
  ["✓", "„Wenn ich die Lösung verstehe, kann ich es“", "Eine Musterlösung nachzuvollziehen ist etwas anderes, als selbst auf die Idee zu kommen. Verstanden ist eine Aufgabe erst, wenn du sie ein paar Tage später ohne Hilfe löst."],
  ["↻", "„Viel auf einmal üben bringt am meisten“", "Das Gehirn vergisst schnell – und behält, was im richtigen Abstand wiederkommt. Kurz und regelmäßig schlägt den Marathon am Abend vor der Klausur."],
  ["✎", "„Im Kopf rechnen ist besser als aufschreiben“", "Der Kopf hat wenig Arbeitsspeicher. Ein klarer Rechenweg auf dem Papier entlastet ihn, macht Fehler sichtbar und ist zugleich dein Beweis in der Klausur."],
];

/* Passwort-Sperre „skript“: gilt für die ganze Browser-Sitzung (gemeinsam mit den Entwürfen) */
export function useFrei() {
  const [frei, setFrei] = useState(istFrei);
  useEffect(() => {
    const h = () => setFrei(istFrei());
    window.addEventListener(EVENT_FREI, h);
    return () => window.removeEventListener(EVENT_FREI, h);
  }, []);
  return frei;
}

export function SchlossZeichen({ groesse = 34 }) {
  return (
    <span aria-hidden="true" style={{ width: groesse, height: groesse, flexShrink: 0, borderRadius: 999, background: "rgba(255,255,255,0.92)", boxShadow: "0 3px 10px rgba(30,40,60,0.25)",
      display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg viewBox="0 0 24 24" width={Math.round(groesse * 0.5)} height={Math.round(groesse * 0.5)} fill="none" stroke="#5E6878" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="11" width="14" height="10" rx="2.2" fill="#5E6878" />
        <path d="M 8 11 V 7.5 a 4 4 0 0 1 8 0 V 11" />
      </svg>
    </span>
  );
}

export function PasswortFeld({ onFrei }) {
  const [pw, setPw] = useState("");
  const [fehler, setFehler] = useState(false);
  const pruefen = async (e) => {
    e.preventDefault();
    if (await entsperren(pw)) onFrei(); else { setFehler(true); setPw(""); }
  };
  return (
    <form onSubmit={pruefen} style={{ marginTop: 10, padding: "14px 16px", borderRadius: 16, background: C.weiss, border: `1px solid ${C.linie}`, boxShadow: "0 3px 16px rgba(15,26,51,0.07)" }}>
      <p style={{ margin: "0 0 10px", fontSize: 13.5, fontWeight: 300, color: C.grau, lineHeight: 1.5 }}>Dieser Bereich ist noch nicht öffentlich. Bitte Passwort eingeben.</p>
      <div style={{ display: "flex", gap: 8 }}>
        <input type="password" value={pw} autoFocus autoComplete="off" aria-label="Passwort" placeholder="Passwort"
          onChange={(e) => { setPw(e.target.value); setFehler(false); }}
          style={{ flex: 1, minWidth: 0, boxSizing: "border-box", padding: "11px 14px", borderRadius: 10, fontSize: 16, fontFamily: "inherit", color: C.tinte,
            border: `2px solid ${fehler ? "#E5484D" : C.linie}`, outline: "none", background: "#fff" }} />
        <button type="submit" style={{ padding: "0 18px", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 14.5, fontWeight: 700,
          color: C.seeTief, background: C.flaggold }}>Entsperren</button>
      </div>
      {fehler && <div role="alert" style={{ color: "#C8372D", fontSize: 13, marginTop: 8 }}>Das Passwort stimmt nicht.</div>}
    </form>
  );
}

/* Grafik für die Schulmathematik-Kachel: vier Mini-Motive (Kurve, Vektor, Säulen, Video). */
export function SchulmatheLogoKlein({ eng = false }) {
  const W = 230, H = 190;
  const feld = (x, y, inhalt) => (
    <g transform={`translate(${x} ${y})`}>
      <rect width="92" height="72" rx="10" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.22)" />
      {inhalt}
    </g>
  );
  return (
    <svg viewBox={eng ? "14 14 202 162" : `0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "100%", display: "block" }} aria-hidden="true">
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
export function SchulkurseLogoKlein() {
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

/* Gehirn (Lucide „brain“, ISC-Lizenz): zwei Hälften – links Silber für die Logik, rechts Gold für die Kreativität.
   Dahinter eine goldene Aura, die langsam atmet, und vier Funken. Bei „Bewegung reduzieren“ steht alles still. */
const HIRN_PFADE = [
  "M12 18V5",
  "M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4",
  "M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5",
  "M17.997 5.125a4 4 0 0 1 2.526 5.77",
  "M18 18a4 4 0 0 0 2-7.464",
  "M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517",
  "M6 18a4 4 0 0 1-2-7.464",
  "M6.003 5.125a4 4 0 0 0-2.526 5.77",
];
const HIRN_FUNKEN = [[30, 38, 6], [200, 30, 7], [210, 112, 5], [24, 128, 4.5]];
export function ElternkursLogoKlein() {
  const W = 230, H = 190;
  const G = C.flaggold, W_ = C.weiss, S = C.silberHell;
  const funke = ([x, y, r], i) => (
    <path key={`f${i}`} className="mk-funke" style={{ animationDelay: `${i * 0.7}s` }} fill={W_}
      d={`M ${x} ${y - r} Q ${x} ${y} ${x + r} ${y} Q ${x} ${y} ${x} ${y + r} Q ${x} ${y} ${x - r} ${y} Q ${x} ${y} ${x} ${y - r} Z`} />
  );
  const gehirn = (farbe, clip, extra = {}) => (
    <g clipPath={`url(#${clip})`} stroke={farbe} fill="none" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round"
      transform="translate(115 93) scale(6.4) translate(-12 -11.6)" {...extra}>
      {HIRN_PFADE.map((d, i) => <path key={i} d={d} />)}
    </g>
  );
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "100%", display: "block" }} aria-hidden="true">
      <defs>
        <filter id="mkGlow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4" /></filter>
        <radialGradient id="mkAura" cx="50%" cy="46%" r="52%">
          <stop offset="0" stopColor={G} stopOpacity="0.42" /><stop offset="0.55" stopColor={G} stopOpacity="0.10" /><stop offset="1" stopColor={G} stopOpacity="0" />
        </radialGradient>
        <clipPath id="mkLinks"><rect x="-1" y="-1" width="13" height="26" /></clipPath>
        <clipPath id="mkRechts"><rect x="12" y="-1" width="13" height="26" /></clipPath>
        <style>{`.mk-puls{animation:mkPuls 3.2s ease-in-out infinite}
          .mk-funke{animation:mkFunke 2.8s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
          @keyframes mkPuls{0%,100%{opacity:.55}50%{opacity:1}}
          @keyframes mkFunke{0%,100%{opacity:.25;transform:scale(.7) rotate(0deg)}50%{opacity:1;transform:scale(1.15) rotate(45deg)}}
          @media (prefers-reduced-motion:reduce){.mk-puls,.mk-funke{animation:none}}`}</style>
      </defs>
      {Array.from({ length: 9 }, (_, i) => <line key={`v${i}`} x1={i * 28} y1="0" x2={i * 28} y2={H} stroke="rgba(255,255,255,0.05)" />)}
      {Array.from({ length: 7 }, (_, i) => <line key={`h${i}`} x1="0" y1={i * 28} x2={W} y2={i * 28} stroke="rgba(255,255,255,0.05)" />)}
      <ellipse cx="115" cy="93" rx="104" ry="80" fill="url(#mkAura)" className="mk-puls" />
      <g className="mk-puls" opacity="0.55" filter="url(#mkGlow)">{gehirn(G, "mkRechts", { strokeWidth: 2.2 })}</g>
      {gehirn(S, "mkLinks")}
      {gehirn(G, "mkRechts")}
      {HIRN_FUNKEN.map(funke)}
    </svg>
  );
}

/* Grafik für die „Mathilda AI“-Kachel: Blatt mit handschriftlicher Rechnung im Kamera-Sucher, Häkchen. */
export function MathildaLogoKlein() {
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
export function MathildaPortraet() {
  return (
    /* Größe hängt nur an der Breite der Spalte (--pw), nicht an der Kachelhöhe. Die Oberkante des Haares (y = 22 von 120×138)
       liegt immer 16 px unter dem oberen Kachelinnenrand, also bündig mit der Oberkante des Titels. */
    <svg viewBox="0 0 120 138" style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", width: "calc(var(--pw) * 1.2)", height: "auto",
      top: "calc(16px - var(--pw) * 0.22)", display: "block", overflow: "visible" }} aria-hidden="true">
      <MathildaPfade />
    </svg>
  );
}

/* Eigenes Logo für die Polynomplotter-Kachel: Raster, Achsen, f (weiß), f′ (gold), f″ (dunkelgold gestrichelt). */
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
export const ZEIGE_GESPERRTE = false;

/* Schulmathematik → Bereiche → Stationen → Werkzeuge. Die Daten stehen in werkzeuge.js (eine Liste für
   Startseite, Werkzeug-Menü, Kopfleiste und Übersichtsseiten); hier kommen nur die Logos dazu. */
const BEREICH_LOGO = { fundament: <ZeichenLogo zeichen="a+0" platz />, analysis: <PlotterLogoKlein />, vektoren: <React.Suspense fallback={null}><VektorenLogoKlein /></React.Suspense>, stochastik: <React.Suspense fallback={null}><StochastikLogoKlein /></React.Suspense>, geometrie: <GeometrieLogoKlein />, bruchrechnen: <BruchrechnenLogoKlein />, zahlen: <ZahlenLogoKlein />, prozent: <ProzentLogoKlein />, daten: <DatenLogoKlein />, werkzeuge: <FormelLogoKlein />, abitur: <ZeichenLogo zeichen="Abi" platz /> };
/* Liniennetz: jeder Bereich ist eine „Linie“ mit eigenem Strich, die Stationen sind ihre Halte */
const LINIEN_MUSTER = { fundament: "4px solid", analysis: "4px solid", vektoren: "7px double", stochastik: "4px dashed", geometrie: "4px solid", bruchrechnen: "4px dashed", zahlen: "4px solid", prozent: "7px double", daten: "4px dashed", werkzeuge: "4px dotted" };

/* Zusammenfassung für die Bereichs-Kacheln der Schulmathematik: was im Bereich vorkommt, in zwei Zeilen.
   Je Eintrag [kurz, lang]: kurz fürs Handy (passt bei 360 px in zwei Zeilen, etwa 50 Zeichen),
   lang für den Desktop (ab 840 px, etwa 140 Zeichen).
   Je Stufe eigener Text (u = Unterstufe, m = Mittelstufe, o = Oberstufe, a = Alle); fehlt eine Stufe, gilt „a“. */
const BEREICH_INHALT = {
  fundament: {
    a: ["Rechengesetze, Zahlenräume ℕ bis ℝ, Mengen und Logik",
      "Axiome und Rechengesetze als Spielregeln jeder Rechnung, die Zahlenräume von ℕ über ℤ und ℚ bis ℝ, Mengen und Logik als Sprache der Mathematik"] },
  analysis: {
    m: ["Geraden, Parabeln, Funktionsklassen, Sinus, Wachstum",
      "Geraden und Parabeln von Normalform bis Scheitelform, Funktionsklassen im Überblick, Sinusfunktion, exponentielles Wachstum und Logarithmen"],
    o: ["Ableiten, Kurvendiskussion, Steckbrief, Integrale",
      "Funktionsklassen, Ableiten mit allen Regeln, Kurvendiskussion und Scharen, Steckbriefaufgaben, Optimierung, Integrale"],
    a: ["Geraden, Parabeln, Ableiten, Kurven, Integrale",
      "Geraden und Parabeln, Funktionsklassen, Ableiten, Kurvendiskussion und Scharen, Steckbriefaufgaben, Optimierung, Stammfunktionen und Integrale"] },
  vektoren: {
    a: ["Skalar- und Kreuzprodukt, Geraden, Ebenen, Abstände",
      "Rechnen mit Vektoren, Skalar- und Kreuzprodukt, Geraden und Ebenen aufstellen, Lage, Winkel, Abstände, Gleichungssysteme"] },
  stochastik: {
    m: ["Kombinatorik, Vier-Felder-Tafel, Erwartungswert",
      "Urnen und Kombinatorik, Baumdiagramm und Pfadregeln, Vier-Felder-Tafel und bedingte Wahrscheinlichkeit, Erwartungswert und faire Spiele"],
    a: ["Bäume, Binomialverteilung, Tests, Normalverteilung",
      "Kombinatorik, Bäume und Vier-Felder-Tafel, Erwartungswert und faire Spiele, Bernoulli-Kette und Binomialverteilung, Hypothesentests, Normalverteilung"] },
  geometrie: {
    u: ["Koordinaten, Symmetrie, Flächen, Quader, Winkel",
      "Koordinatensystem und Symmetrie, Umfang und Flächeninhalt von Rechteck bis Trapez, Quader und Würfel mit Netzen, Winkel und Winkelsummen"],
    m: ["Kongruenz, Pythagoras, Trigonometrie, Kreis, Körper",
      "Winkelsätze, Kongruenz und besondere Linien im Dreieck, Thales, Pythagoras, Höhen- und Kathetensatz, Strahlensätze, Trigonometrie, Kreis und Körper"],
    a: ["Flächen, Winkel, Pythagoras, Trigonometrie, Körper",
      "Flächen und Quader, Winkel, Kongruenz und besondere Linien, Thales und Pythagoras, Strahlensätze, Trigonometrie, Kreis und Körper"] },
  bruchrechnen: {
    a: ["Kürzen, Rechnen mit Brüchen, Dezimalzahlen und Komma",
      "Brüche kürzen und erweitern, die vier Grundrechenarten mit Brüchen, Dezimalzahlen, Komma verschieben, abbrechend oder periodisch"] },
  zahlen: {
    a: ["Stellenwert, ganze Zahlen, Primzahlen, Größen",
      "Stellenwert und Runden, ganze und rationale Zahlen, Primzahlen, ggT und kgV, Rechengesetze und Rechenvorteile, Größen und Einheiten umrechnen"] },
  prozent: {
    a: ["Dreisatz, Prozent, Rabatt, Zinsen und Zinseszins",
      "Proportionale und antiproportionale Zuordnungen, Dreisatz, Prozentwert, Grundwert und Prozentsatz, Rabatt und Mehrwertsteuer, Zinsen und Zinseszins"] },
  daten: {
    a: ["Diagramme, Mittelwert und Median, Wahrscheinlichkeit",
      "Umfragen auswerten, Säulen- und Kreisdiagramme, Mittelwert, Median und Spannweite, Würfel und Urnen, Gegenereignis und Pfadregel"] },
  werkzeuge: {
    u: ["Formelsammlung, Gleichungen lösen, Textaufgaben",
      "Die Formelsammlung zum Nachschlagen, Gleichungen Schritt für Schritt lösen, Textaufgaben in Gleichungen übersetzen – auch per Foto mit Mathilda"],
    m: ["Formeln, Terme, Gleichungen, Bruchterme, Textaufgaben",
      "Formelsammlung, Terme und Potenzgesetze, Gleichungen und Gleichungssysteme, Ungleichungen, Bruchterme, Textaufgaben"],
    o: ["Formeln, Gleichungen, Ungleichungen, Textaufgaben",
      "Die Formelsammlung zum Nachschlagen, Gleichungen lösen, Ungleichungen und Beträge, Textaufgaben übersetzen – auch per Foto mit Mathilda"],
    a: ["Formeln, Terme, Gleichungen, Bruchterme, Textaufgaben",
      "Formelsammlung, Terme und Potenzgesetze, Gleichungen, Ungleichungen und Beträge, Bruchterme, Textaufgaben übersetzen"] },
  abitur: {
    a: ["Abi-Ketten, zehn Abi-Sätze, Probeabitur mit Uhr",
      "Abi-Ketten: eine Aufgabe durch mehrere Werkzeuge, zehn komplette Abi-Sätze mit Teil A und B, Probeabitur mit Uhr und Notenpunkten"] },
};
const STUFE_KUERZEL = { unter: "u", mittel: "m", ober: "o", alle: "a" };
export function bereichInhalt(id, stufe) {
  const t = BEREICH_INHALT[id];
  const [kurz, lang] = t ? (t[STUFE_KUERZEL[stufe] || "a"] || t.a) : [];
  if (!kurz) return null;
  return <><span className="bereich-kurz">{kurz}</span><span className="bereich-lang">{lang}</span></>;
}

const ABI_BLOCK = { id: "abitur", titel: "Abi-Vorbereitung", text: "Abi-Ketten, Abi-Sätze und Probeabitur.", gold: true, eintraege: ABI_MENUE };

/* Die Blöcke der Schulmathematik-Liste für eine Stufe: Anordnung aus werkzeuge.js (START_BLOECKE), dazu Logos.
   Ganz unten, nach „Formelsammlung und Werkzeuge“, steht in der Oberstufe die goldene Abi-Vorbereitung. */
export function schulBereiche(stufe) {
  const liste = startBloecke(stufe).map((b) => ({
    id: b.id, titel: b.titel, vorTitel: b.vorTitel, text: b.text, logo: BEREICH_LOGO[b.id], video: b.video, linie: LINIEN_MUSTER[b.id], gold: b.fundament, kiste: b.kiste,
    stationen: b.stationen.map((st) => ({ ...st, werkzeuge: st.werkzeuge.map((id) => ({ id, ...WERKZEUGE[id] })) })),
  }));
  if (stufe === "ober" || stufe === "alle") liste.push({ ...ABI_BLOCK, logo: BEREICH_LOGO.abitur });
  return liste;
}

/* Flache Liste fürs Untermenü – je Station eine Kopfzeile, darunter ihre Werkzeuge –
   gefiltert nach Stufe (alle | mittel | ober) und Etikett (null = alle). Leere Stationen fallen weg. */
function bereichsEintraege(b, stufe, etikett, ab = 0) {
  const liste = [];
  let nr = ab;
  for (const st of b.stationen) {
    const ws = st.werkzeuge.filter((w) => passtStufe(w, stufe) && (!etikett || w.etikett === etikett));
    if (!ws.length) continue;
    nr += 1;
    liste.push({ kopf: true, name: `${b.id}-${st.id}`, nr, titel: st.titel, zeile: st.zeile });
    for (const w of ws) liste.push({ name: w.name, zeile: w.zeile, bild: w.bild, ziel: w.ziel, etikett: w.etikett });
  }
  return liste;
}

/* Einträge eines Blocks: Abi-Vorbereitung = feste Liste; „Formelsammlung und Werkzeuge“ beginnt mit der Formelsammlung
   (nur ohne Etikett-Filter), danach kommen die Werkzeug-Stationen; alle anderen Blöcke = ihre Stationen. */
export function blockEintraege(b, stufe, etikett) {
  if (b.eintraege) return etikett ? b.eintraege.filter((e) => e.etikett === etikett) : b.eintraege;
  if (!b.kiste || etikett) return bereichsEintraege(b, stufe, etikett);
  const formel = [{ kopf: true, name: "werkzeuge-formelsammlung", nr: 1, titel: "Formelsammlung", zeile: "Alle wichtigen Formeln zum Nachschlagen" }, ...FORMEL_MENUE];
  return [...formel, ...bereichsEintraege(b, stufe, etikett, 1)];
}



/* ======================================================================
   Menü in den Werkzeug-Seiten (Knopf oben rechts im blauen Kopfbereich)
   Gleicher Aufbau wie die Startseite, aber kompakt: alle Hauptthemen sind
   zugeklappt und lassen sich einzeln aufklappen (+ / −).
   ====================================================================== */
function toolKnoten(t) {
  if (t.kopf) return { kopf: true, nr: t.nr, titel: t.titel };
  return t.kinder
    ? { id: t.name, titel: t.name, kinder: t.kinder.map((k) => ({ titel: k.name, ziel: k.ziel })) }
    : { titel: t.name, ziel: t.ziel, etikett: t.etikett };
}
/* Hauptansicht eines Werkzeugs → alle seine Ansichten (z. B. plotter → plotter, advplotter) */
const WERKZEUG_ANSICHTEN = Object.fromEntries(Object.values(WERKZEUGE).map((w) => [w.ziel.ansicht, ansichtenVon(w)]));
function menueBaum() {
  return [
    ...schulBereiche("alle").map((b) => ({ id: b.id, titel: b.titel, kinder: blockEintraege(b, "alle", null).map(toolKnoten) })),
  ];
}

/* Alle Seiten, die über das Menü erreichbar sind – dort erscheint der Menü-Knopf im Kopfbereich */
export function istToolMenueSeite(ansicht) {
  const sammle = (liste) => liste.flatMap((k) => (k.kinder ? sammle(k.kinder) : k.ziel ? [k.ziel.ansicht] : []));
  return istWerkzeugAnsicht(ansicht) || sammle(menueBaum()).includes(ansicht);
}

export function ToolMenue({ gehe, schliessen, aktuell, eingebettet }) {
  const [offen, setOffen] = useState({});
  const baum = React.useMemo(menueBaum, []);
  useEffect(() => {
    if (eingebettet) return undefined;   // eingebettet (Arbeitsmenü in der Fußzeile): Esc schließt dort das ganze Fenster
    const taste = (e) => { if (e.key === "Escape") schliessen(); };
    window.addEventListener("keydown", taste);
    return () => window.removeEventListener("keydown", taste);
  }, []);
  const zeile = (k, pfad, tiefe) => {
    const id = pfad + "/" + (k.nr ? `${k.nr}-` : "") + k.titel;
    if (k.kopf) {
      return <p key={id} style={{ margin: "8px 2px 0", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.grau }}>{k.nr}{" "}<span>{k.titel}</span></p>;
    }
    if (!k.kinder) {
      const aktiv = (WERKZEUG_ANSICHTEN[k.ziel.ansicht] || [k.ziel.ansicht]).includes(aktuell);
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
  if (eingebettet) return <div>{baum.map((k) => zeile(k, "", 0))}</div>;
  return (
    <>
      {/* unsichtbare Fläche: Klick daneben schließt das Menü */}
      <div onClick={schliessen} aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 44 }} />
      <style>{`.tool-menue-panel{position:absolute;top:56px;right:24px;width:60vw;min-width:220px;max-width:340px;max-height:calc(100dvh - 130px);overflow-y:auto}
        @media (min-width:768px){.tool-menue-panel{top:84px;width:clamp(300px, 33.333vw, 420px);max-width:none}}`}</style>
      <div role="dialog" aria-label="Menü" data-scroll-box data-sprung="menue-alle-bereiche" className="tool-menue-panel"
        style={{ zIndex: 45, background: C.sand, borderRadius: 14, boxShadow: "0 14px 40px rgba(8,23,59,0.35)", border: `1px solid ${C.linie}`, padding: "2px 8px 8px", fontFamily: "Montserrat, system-ui, sans-serif" }}>
        {baum.map((k) => zeile(k, "", 0))}
      </div>
    </>
  );
}

/* Grafik für die kleinen Trainer-Kacheln: großes goldenes Zeichen (z. B. 12², ¾) */
function ZeichenLogo({ zeichen, platz }) {
  // platz: Zeichen nach links oben rücken, damit der große Plus-Knopf unten rechts es nicht verdeckt
  return (
    <span style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box", ...(platz ? { padding: "0 32px 28px 0" } : {}),
      color: C.flaggold, fontWeight: 800, fontSize: zeichen.length > 4 ? "clamp(17px, 4.6vw, 24px)" : "clamp(24px, 6.5vw, 32px)", letterSpacing: "-0.01em" }}>
      {zeichen}
    </span>
  );
}

/* Goldener Plus-/Minus-Knopf unten rechts in der Grafik eines aufklappbaren Bereichs */
export function AufklappPfeil({ auf, klein, gross }) {
  return <AufklappZeichen art="gold" auf={auf} groesse={gross ? 38 : klein ? 26 : 30} abstand={gross ? 10 : 8} />;
}

/* Kleine, dünn gezeichnete Motive für die Werkzeug-Knöpfe (viewBox 120 × 56) */
function MiniBild({ art }) {
  const w = "rgba(255,255,255,0.62)", g = C.flaggold;
  const linie = { fill: "none", stroke: w, strokeWidth: 1.3, strokeLinecap: "round", strokeLinejoin: "round" };
  const achsen = <><path d="M8 46 H112" {...linie} strokeWidth="0.9" opacity="0.6" /><path d="M20 52 V6" {...linie} strokeWidth="0.9" opacity="0.6" /></>;
  const txt = (x, y, s, f = w, gr = 11, anchor = "start") => <text x={x} y={y} textAnchor={anchor} style={{ fontSize: gr, fill: f, fontFamily: "inherit", fontWeight: 500 }}>{s}</text>;
  const m = {
    gerade: <>{achsen}<path d="M10 50 L112 8" {...linie} /><circle cx="38" cy="38.3" r="2.8" fill={g} /><circle cx="84" cy="19.4" r="2.8" fill="#fff" />{txt(70, 44, "y = mx + c", "#fff", 10.5)}</>,
    parabel: <>{achsen}<path d="M30 6 Q 62 90 94 6" {...linie} /><circle cx="62" cy="26" r="2.6" fill={g} /><circle cx="62" cy="14" r="2" fill="#fff" />{txt(68, 17, "F", "#fff", 9.5)}{txt(68, 36, "S", g, 9.5)}</>,
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
    hauptsatz: <>{txt(60, 24, "∫ₐᵇ f(x) dx", "#fff", 13, "middle")}{txt(60, 44, "= F(b) − F(a)", g, 12, "middle")}</>,
    integral: <>{achsen}<path d="M30 46 L30 30 C 44 14, 60 10, 76 20 L76 46 Z" fill="rgba(237,187,0,0.35)" /><path d="M10 40 C 26 34, 34 22, 48 15 S 80 14, 112 30" {...linie} />{txt(84, 18, "∫", g, 15)}</>,
    erwartung: <>{txt(60, 24, "E(X) = 0", "#fff", 14, "middle")}{txt(60, 44, "fair", g, 12, "middle")}<path d="M44 47 H76" stroke={g} strokeWidth="1" /></>,
    urne: <><path d="M34 10 Q30 50 60 50 Q90 50 86 10" {...linie} fill="rgba(255,255,255,0.06)" /><circle cx="50" cy="40" r="5" fill={g} /><circle cx="62" cy="42" r="5" fill="#fff" /><circle cx="72" cy="36" r="5" fill={g} /><circle cx="57" cy="31" r="5" fill="#fff" /></>,
    normal: <><path d="M10 46 C 34 46, 42 8, 60 8 S 86 46, 110 46" {...linie} /><path d="M44 46 C 48 28, 54 8, 60 8 S 72 28, 76 46 Z" fill="rgba(237,187,0,0.35)" /><path d="M60 8 V46" stroke={g} strokeWidth="1.2" strokeDasharray="3 3" />{txt(92, 18, "σ", g, 12)}</>,
    hypothese: <>{[4, 10, 20, 30, 34, 26, 14, 6, 2].map((h, i) => <rect key={i} x={18 + i * 10} y={48 - h} width="7" height={h} rx="1.5" fill={i >= 7 ? g : "rgba(255,255,255,0.5)"} />)}<path d="M88 6 V50" stroke={g} strokeWidth="1.2" strokeDasharray="3 3" />{txt(92, 14, "α", g, 12)}</>,
    wachstum: <>{achsen}<path d="M12 46 C 50 44, 80 34, 112 4" {...linie} /><path d="M12 10 C 40 30, 70 42, 112 46" {...linie} stroke={g} />{txt(70, 16, "aᵗ", "#fff", 13)}</>,
    scharen: <>{achsen}{[0.5, 1, 1.6].map((k, i) => <path key={i} d={`M12 ${46 - 4 * k} Q 60 ${46 - 40 * k} 108 ${46 - 4 * k}`} {...linie} stroke={i === 1 ? g : w} opacity={i === 1 ? 1 : 0.6} />)}{txt(92, 14, "a", g, 13)}</>,
    video: <><rect x="34" y="8" width="52" height="38" rx="7" {...linie} /><path d="M54 18 L70 27 L54 36 Z" fill={g} /></>,
    balken: <>{[6, 14, 26, 36, 30, 18, 9, 4].map((h, i) => <rect key={i} x={20 + i * 11} y={48 - h} width="7" height={h} rx="1.5" fill={i === 3 ? g : "rgba(255,255,255,0.5)"} />)}</>,
    tafel: <><rect x="30" y="8" width="60" height="40" rx="4" {...linie} /><path d="M60 8 V48 M30 28 H90" {...linie} /><rect x="31" y="9" width="28" height="18" fill="rgba(237,187,0,0.35)" /></>,
    gleichung: <>{txt(60, 22, "3x + 5 = 20", "#fff", 13, "middle")}{txt(60, 42, "x = 5", g, 13, "middle")}<path d="M42 47 H78" stroke={g} strokeWidth="1" /></>,
    kopf: <>{txt(60, 23, "17 · 11", "#fff", 14, "middle")}{txt(60, 44, "= 187", g, 13, "middle")}</>,
    strahlen: <><path d="M14 50 L108 8 M14 50 L110 44" {...linie} /><path d="M50 34 L50 46" stroke={g} strokeWidth="1.8" strokeLinecap="round" /><path d="M90 16 L90 45" stroke={g} strokeWidth="1.8" strokeLinecap="round" /><circle cx="14" cy="50" r="2.4" fill="#fff" />{txt(4, 44, "S", w, 9.5)}{txt(96, 30, "k", g, 12)}</>,
    trig: <><path d="M22 46 H94 V12 Z" {...linie} fill="rgba(255,255,255,0.06)" /><path d="M87 46 V39 H94" {...linie} strokeWidth="1" /><path d="M38 46 A16 16 0 0 0 36.5 39.2" stroke={g} strokeWidth="1.6" fill="none" />{txt(41, 43, "α", g, 10)}{txt(99, 32, "a", w, 10)}{txt(56, 25, "c", w, 10)}</>,
    terme: <>{txt(60, 23, "(a + b)²", "#fff", 14, "middle")}{txt(60, 43, "a² + 2ab + b²", g, 11, "middle")}</>,
    menge: <><circle cx="48" cy="28" r="18" {...linie} fill="rgba(255,255,255,0.06)" /><circle cx="72" cy="28" r="18" {...linie} fill="rgba(255,255,255,0.06)" /><path d="M60 14.6 A18 18 0 0 1 60 41.4 A18 18 0 0 1 60 14.6 Z" fill={g} opacity="0.8" />{txt(38, 32, "A", w, 10)}{txt(78, 32, "B", w, 10)}</>,
    ungleichung: <><path d="M10 40 H110" {...linie} /><path d="M28 40 H110" stroke={g} strokeWidth="4" opacity="0.85" /><circle cx="28" cy="40" r="3.6" fill="none" stroke={g} strokeWidth="1.8" />{[28, 52, 76, 100].map((x) => <path key={x} d={`M${x} 37 V43`} {...linie} />)}{txt(60, 22, "2x − 1 > 3", "#fff", 12.5, "middle")}</>,
    funktionen: <>{achsen}<path d="M20 46 L104 8" {...linie} strokeWidth="0.8" strokeDasharray="3 3" opacity="0.6" /><path d="M20 46 Q 42 44 58 10" {...linie} /><path d="M20 46 Q 54 42 104 24" {...linie} stroke={g} />{txt(92, 18, "f⁻¹", g, 11, "middle")}</>,
    textaufgaben: <><rect x="14" y="12" width="44" height="34" rx="4" {...linie} fill="rgba(255,255,255,0.06)" /><path d="M20 21 H50 M20 28 H44 M20 35 H48" stroke={w} strokeWidth="1.4" strokeLinecap="round" opacity="0.7" /><path d="M26 28 H40" stroke={g} strokeWidth="3" strokeLinecap="round" opacity="0.8" /><path d="M62 29 H72 M68 25 L72 29 L68 33" {...linie} />{txt(92, 25, "f′(6)", "#fff", 10, "middle")}{txt(92, 39, "= 0", g, 10, "middle")}</>,
    axiome: <>{txt(60, 22, "a + b = b + a", "#fff", 12, "middle")}<path d="M30 32 H90" {...linie} strokeWidth="0.9" opacity="0.6" />{txt(60, 47, "∎", g, 13, "middle")}</>,
    zahlenraeume: <>{[["R", 60, 30, 50, 22], ["Q", 52, 32, 36, 16], ["Z", 44, 34, 23, 11], ["N", 37, 35, 11, 6]].map(([k, cx, cy, rx, ry]) => <ellipse key={k} cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={k === "R" ? g : w} strokeWidth="1.1" opacity={k === "N" ? 1 : 0.75} />)}{txt(37, 38.5, "ℕ", "#fff", 8, "middle")}{txt(58, 30, "ℤ", "#fff", 8.5, "middle")}{txt(80, 30, "ℚ", "#fff", 9, "middle")}{txt(101, 30, "ℝ", g, 10, "middle")}</>,
    pascal: <>{[[60, 14, "1"], [50, 27, "1"], [70, 27, "1"], [40, 40, "1"], [60, 40, "2"], [80, 40, "1"], [30, 53, "1"], [50, 53, "3"], [70, 53, "3"], [90, 53, "1"]].map(([x, y, z], i) => <React.Fragment key={i}>{txt(x, y, z, z === "1" ? w : g, 11, "middle")}</React.Fragment>)}</>,
    pythagoras: <><path d="M44 44 H80 V20 Z" {...linie} fill="rgba(255,255,255,0.06)" /><rect x="44" y="44" width="36" height="10" fill={g} opacity="0.35" /><rect x="80" y="20" width="12" height="24" fill={g} opacity="0.6" /><path d="M74 44 V38 H80" {...linie} strokeWidth="1" />{txt(28, 24, "a²+b²=c²", "#fff", 10)}</>,
    prozent: <><rect x="14" y="20" width="92" height="16" rx="3" {...linie} /><rect x="14" y="20" width="23" height="16" rx="3" fill={g} opacity="0.75" />{txt(25, 50, "25 %", g, 10, "middle")}{txt(60, 14, "G = 100 %", "#fff", 9.5, "middle")}</>,
    zuordnungen: <>{achsen}<path d="M20 46 L104 10" {...linie} stroke={g} /><path d="M26 8 Q 40 40 108 42" {...linie} />{txt(98, 20, "y = kx", g, 9.5, "middle")}</>,
    flaechen: <><path d="M14 46 H70 L92 14 H36 Z" {...linie} fill="rgba(255,255,255,0.06)" /><path d="M36 14 V46" stroke={g} strokeWidth="1.4" strokeDasharray="3 2" />{txt(100, 36, "g · h", g, 11, "middle")}</>,
    groessen: <>{["mm", "cm", "dm", "m"].map((u, i) => <g key={u}><rect x={10 + i * 25} y={44 - i * 9} width="22" height={9 + i * 9} rx="2" fill="rgba(255,255,255,0.1)" stroke={w} />{txt(21 + i * 25, 52 - i * 0, u, "#fff", 8, "middle")}</g>)}{txt(12, 20, "·10", g, 10, "start")}</>,
    dezimal: <>{txt(60, 26, "3/4 = 0,75", "#fff", 13, "middle")}{txt(60, 44, "E , z h", g, 11, "middle")}</>,
    quader: <><path d="M20 22 H70 V50 H20 Z M20 22 L36 10 H86 L70 22 M86 10 V38 L70 50" {...linie} fill="rgba(255,255,255,0.06)" />{txt(100, 32, "a·b·c", g, 9.5, "middle")}</>,
    ganzezahlen: <><path d="M8 38 H112" {...linie} />{[-4, -2, 0, 2, 4].map((v) => <path key={v} d={`M${60 + v * 12} 34 V42`} stroke={w} strokeWidth="1.2" />)}<path d="M84 30 Q 60 4 36 30" stroke={g} strokeWidth="1.6" fill="none" />{txt(36, 52, "−2", "#fff", 9, "middle")}{txt(84, 52, "2", "#fff", 9, "middle")}</>,
    diagramme: <>{[22, 30, 14, 38, 26].map((h, i) => <rect key={i} x={14 + i * 14} y={50 - h} width="10" height={h} rx="1.5" fill={i === 3 ? g : "rgba(255,255,255,0.55)"} />)}<circle cx="100" cy="28" r="14" fill="rgba(255,255,255,0.15)" stroke={w} /><path d="M100 28 V14 A14 14 0 0 1 113 33 Z" fill={g} /></>,
    primzahlen: <>{txt(60, 22, "2 · 3 · 5 · 7", "#fff", 12.5, "middle")}{txt(60, 44, "ggT · kgV", g, 11, "middle")}</>,
    rechengesetze: <>{txt(60, 30, "3 + 4 · 5", "#fff", 13, "middle")}<rect x="54" y="18" width="34" height="16" rx="4" fill="none" stroke={g} />{txt(60, 50, "= 23", g, 12, "middle")}</>,
    koordinaten: <><path d="M60 4 V54 M8 30 H112" {...linie} strokeWidth="1" /><circle cx="84" cy="16" r="3" fill="#fff" /><circle cx="36" cy="16" r="3" fill={g} /><path d="M40 16 H80" stroke={g} strokeWidth="1" strokeDasharray="2 2" /></>,
    zufall: <><rect x="20" y="14" width="28" height="28" rx="6" fill="rgba(255,255,255,0.1)" stroke={w} />{[[28, 22], [40, 34], [34, 28]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.4" fill="#fff" />)}{txt(84, 34, "P = 1/6", g, 11, "middle")}</>,
    stellenwert: <>{["HT", "ZT", "T", "H", "Z", "E"].map((u, i) => <g key={u}>{txt(16 + i * 18, 18, u, w, 8, "middle")}{txt(16 + i * 18, 40, String([3, 4, 0, 7, 2, 5][i]), i === 2 ? g : "#fff", 14, "middle")}</g>)}</>,
    parallelwinkel: <><path d="M8 18 H112 M8 42 H112" {...linie} /><path d="M30 54 L88 4" {...linie} stroke={g} /><path d="M80.2 18 A8 8 0 0 0 76 11.4" stroke="#fff" strokeWidth="1.4" fill="none" /><path d="M52.2 42 A8 8 0 0 0 48 35.4" stroke="#fff" strokeWidth="1.4" fill="none" />{txt(98, 14, "α", "#fff", 10)}{txt(70, 38, "α", "#fff", 10)}</>,
    konstruktion: <><path d="M14 48 L104 48 L46 8 Z" {...linie} fill="rgba(255,255,255,0.06)" /><circle cx="57" cy="34" r="12" stroke={g} strokeWidth="1.3" fill="none" /><path d="M14 48 L75 28 M104 48 L30 28 M46 8 L59 48" stroke={g} strokeWidth="0.9" strokeDasharray="2 2" /><circle cx="54.7" cy="34.6" r="2.2" fill={g} /></>,
    kathetensatz: <><path d="M14 48 H106 L26 17 Z" {...linie} fill="rgba(255,255,255,0.06)" /><path d="M26 17 V48" stroke={g} strokeWidth="1.4" strokeDasharray="3 2" /><rect x="26" y="49" width="80" height="6" fill={g} opacity="0.45" />{txt(17, 44, "q", w, 9)}{txt(64, 44, "p", w, 9)}{txt(29, 36, "h", g, 10)}{txt(78, 24, "h² = pq", "#fff", 10, "middle")}</>,
    kreis: <><circle cx="44" cy="29" r="22" {...linie} fill="rgba(255,255,255,0.06)" /><path d="M44 29 L66 29 A22 22 0 0 0 33 10 Z" fill={g} opacity="0.5" stroke={g} strokeWidth="1.2" /><circle cx="44" cy="29" r="1.8" fill="#fff" />{txt(96, 24, "A = πr²", "#fff", 10, "middle")}{txt(96, 40, "u = 2πr", w, 10, "middle")}</>,
    koerper: <><ellipse cx="34" cy="46" rx="16" ry="5" {...linie} /><path d="M18 46 L34 8 L50 46" {...linie} fill="rgba(255,255,255,0.06)" /><path d="M34 8 V46" stroke={g} strokeWidth="1.2" strokeDasharray="3 2" /><ellipse cx="86" cy="14" rx="16" ry="5" {...linie} /><ellipse cx="86" cy="46" rx="16" ry="5" {...linie} /><path d="M70 14 V46 M102 14 V46" {...linie} />{txt(60, 33, "V", g, 12, "middle")}</>,
    thales: <><path d="M24 46 A36 36 0 0 1 96 46" {...linie} strokeDasharray="3 3" /><path d="M24 46 H96 L78 14.8 Z" {...linie} fill="rgba(255,255,255,0.06)" /><path d="M72.8 17.8 L75.8 23 L81 20" {...linie} stroke={g} strokeWidth="1.2" /><circle cx="60" cy="46" r="2" fill={g} />{txt(55, 55, "M", w, 8)}</>,
    kongruenz: <><path d="M12 48 L44 48 L22 14 Z" {...linie} fill="rgba(255,255,255,0.06)" /><path d="M76 48 L108 48 L86 14 Z" {...linie} stroke={g} fill="rgba(237,187,0,0.12)" />{txt(60, 38, "≅", "#fff", 16, "middle")}</>,
    bruch: <>{[[28, "3", "4"], [72, "1", "6"]].map(([x, z, n]) => <g key={x}>{txt(x, 22, z, "#fff", 13, "middle")}<path d={`M${x - 8} 27 H${x + 8}`} stroke="#fff" strokeWidth="1.3" />{txt(x, 41, n, "#fff", 13, "middle")}</g>)}{txt(50, 32, "+", w, 13, "middle")}{txt(92, 32, "=", g, 13, "middle")}{txt(108, 22, "11", g, 11, "middle")}<path d="M100 27 H116" stroke={g} strokeWidth="1.3" />{txt(108, 41, "12", g, 11, "middle")}</>,
    bruchterm: <>{txt(36, 22, "x² − 4", "#fff", 12, "middle")}<path d="M16 27 H56" stroke="#fff" strokeWidth="1.3" />{txt(36, 41, "x − 2", "#fff", 12, "middle")}{txt(84, 33, "= x + 2", g, 12, "middle")}{txt(84, 50, "x ≠ 2", w, 9, "middle")}</>,
    teiler: <>{txt(60, 23, "3 | 123", "#fff", 14, "middle")}{txt(60, 44, "1 + 2 + 3 = 6", g, 11, "middle")}</>,
    medaille: <><path d="M50 6 L58 24 M70 6 L62 24" stroke={w} strokeWidth="2.4" strokeLinecap="round" /><circle cx="60" cy="34" r="14" fill={g} /><circle cx="60" cy="34" r="9" fill="none" stroke="rgba(14,30,74,0.45)" strokeWidth="1.2" />{txt(60, 38.5, "1", "#0E1E4A", 12, "middle")}</>,
    landkarte: <><path d="M52 6 L66 8 L70 16 L76 18 L74 28 L80 36 L72 44 L74 52 L58 52 L48 46 L44 36 L48 26 L44 18 Z" {...linie} fill="rgba(255,255,255,0.06)" /><circle cx="56" cy="44" r="3.4" fill={g} /></>,
    lupe: <><circle cx="54" cy="25" r="14" {...linie} strokeWidth="2" /><path d="M64 35 L78 49" stroke={g} strokeWidth="3.2" strokeLinecap="round" />{txt(54, 29.5, "?", g, 12, "middle")}</>,
    abikette: <>{txt(60, 26, "a → d", "#fff", 16, "middle")}{txt(60, 44, "Aufgabe in Etappen", g, 10, "middle")}</>,
    abisatz: <>{txt(60, 26, "A | B", "#fff", 16, "middle")}{txt(60, 44, "60 VP · ohne Note", g, 10, "middle")}</>,
    probeabi: <><circle cx="60" cy="28" r="17" {...linie} /><path d="M60 28 V16 M60 28 L69 33" stroke={g} strokeWidth="1.8" fill="none" strokeLinecap="round" /><circle cx="60" cy="28" r="2" fill="#fff" /></>,
    lgs: <><path d="M20 8 C 14 8, 16 28, 11 28 C 16 28, 14 48, 20 48" {...linie} stroke={g} />{txt(26, 18, "x + y + z = 6", w, 10.5)}{txt(26, 32, "2x − y + z = 3", w, 10.5)}{txt(26, 46, "x + 2y − z = 2", w, 10.5)}</>,
  };
  return <svg viewBox="0 0 120 56" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden="true">{m[art]}</svg>;
}

/* Werkzeug-Knöpfe unter einem Bereich: helleres Blau als die Bereichs-Kachel, gleiche Breite,
   Titel + eine Zeile darunter, rechts ein kleines Motiv. Einträge mit „kinder“ klappen eine
   weitere Ebene auf (z. B. Kurvendiskussion → Polynome / Beliebige Funktionen). */
export function UnterMenue({ eintraege, gehe, tiefe = 0, linie }) {
  const [offen, setOffen] = useState(null);
  const mitLinie = !!linie && tiefe === 0 && eintraege.some((e) => e.kopf);
  // Dunkleres Blau für besseren Kontrast zur weißen Schrift; Ebene 2 etwas heller zur Unterscheidung
  const hg = tiefe === 0 ? "linear-gradient(160deg, #1B62AE 0%, #0F4A8A 55%, #0A3A70 100%)" : "linear-gradient(160deg, #2770BC 0%, #18589C 60%, #12487F 100%)";
  return (
    <div data-aufklapp-inhalt style={{ display: "flex", flexDirection: "column", gap: 6, margin: tiefe ? "0 0 4px 14px" : "6px 0 10px",
      ...(mitLinie ? { position: "relative", paddingLeft: 30 } : null) }}>
      {/* Liniennetz: goldene Linie links, die Stationsnummern sitzen als Halte darauf */}
      {mitLinie && <span aria-hidden="true" style={{ position: "absolute", left: linie.startsWith("7px") ? 8 : 9, top: 13, bottom: 18, borderLeft: `${linie} ${C.flaggold}` }} />}
      <style>{`.unter-knopf{transition:transform .12s ease, filter .12s ease}
        .unter-knopf:active{transform:translateY(2px) scale(0.99);box-shadow:0 2px 6px rgba(10,40,90,0.3), inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(0,0,0,0.25) !important}
        @media (hover:hover){.unter-knopf:hover{filter:brightness(1.07)}}
        .unter-zeile{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        @keyframes unterAuf{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}`}</style>
      {eintraege.map((e, i) => {
        const auf = offen === e.name;
        if (e.kopf) return (
          <div key={e.name} data-station-kopf data-station-titel={e.titel} style={{ display: "flex", alignItems: "center", gap: 9, margin: i ? "10px 2px 0" : "2px 2px 0",
            ...(mitLinie ? { marginLeft: -30, position: "relative" } : null) }}>
            <span aria-hidden="true" style={{ flexShrink: 0, width: 22, height: 22, borderRadius: 999, background: C.flaggold, color: C.seeTief, fontSize: 12, fontWeight: 800,
              display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: mitLinie ? `0 0 0 3px ${C.weiss}` : undefined }}>{e.nr}</span>
            <span style={{ minWidth: 0, lineHeight: 1.2 }}>
              <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: C.seeTief, letterSpacing: "-0.005em" }}>{e.titel}</span>
              <span className="unter-zeile" style={{ display: "block", fontSize: 11.5, fontWeight: 400, color: C.grau }}>{e.zeile}</span>
            </span>
          </div>
        );
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
                {e.etikett && <EtikettPille etikett={e.etikett} dunkel klein style={{ position: "absolute", top: 4, right: 4 }} />}
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

/* ---------- Schulmathe-Training: Bausteine ---------- */
/* Eigener Schlüssel (nicht "matheplus-stufe"): den benutzt die Formelsammlung mit anderen Werten (unter/mittel/ober).
   Vorher setzte „Mittelstufe“ in der Formelsammlung die Startseite still auf Mittelstufe → nur Station „Kennen“ sichtbar. */
export const STUFE_SCHLUESSEL = "matheplus-start-stufe";
/* Zu welcher Klasse die Stufe zuletzt gesetzt wurde (Stempel, z. B. "g9:11-12"). Ändert der Schüler seine Klasse,
   folgt der Stufen-Schalter wieder der Klasse; solange die Klasse gleich bleibt, gilt seine eigene Wahl. */
const STUFE_KLASSE_SCHLUESSEL = "matheplus-start-stufe-klasse";
const ZULETZT_SCHLUESSEL = "matheplus-zuletzt-werkzeug";
const lies = (k, d) => { try { return localStorage.getItem(k) ?? d; } catch { return d; } };

/* Die Klasse, die der Schüler angegeben hat: im Konto (Profil) > in „Dein Training startet hier“ (Quickfinder) >
   bei den Onboarding-Fragen am Handy. Liefert { id, stufe } (Stempel und Stufen-Schalter-Wert) oder null. */
function angegebeneKlasse(profil) {
  const k = klasseErmitteln(profil, quickfinderLesen());
  if (k) {
    const box = klassenBoxen(k.schulart).find((b) => b.id === k.box);
    return { id: `${k.schulart}:${k.box}`, stufe: stufeAusKlassenBox(box), label: box.label };
  }
  const o = onboardingLesen();
  if (o && o.rolle === "schueler" && Number.isInteger(o.klasse)) return { id: `onboarding:${o.klasse}`, stufe: stufeAusKlasse(o.klasse), label: String(o.klasse) };
  return null;
}
/* Stufe für den Schalter: Hat der Schüler eine Klasse angegeben und seit dieser Klasse nichts selbst gewählt,
   steht der Schalter auf ihrer Stufe. Sonst gilt die gemerkte Wahl, ohne beides „Alle“. */
function stufeErmitteln(profil) {
  const klasse = angegebeneKlasse(profil);
  const wahl = lies(STUFE_SCHLUESSEL, null);
  const wahlKlasse = lies(STUFE_KLASSE_SCHLUESSEL, "");
  if (klasse && wahlKlasse !== klasse.id) return klasse.stufe;
  return STUFEN_KEYS.includes(wahl) ? wahl : klasse ? klasse.stufe : "alle";
}
/* Stufen-Schalter der Startseite (Fassung A und B): { stufe, setzen, klasse }. stufe folgt der angegebenen Klasse,
   eine eigene Wahl bleibt (auch nach Neuladen), bis die Klasse wechselt; klasse für die Zeile „Vorgewählt nach …“. */
export function useStartStufe() {
  const konto = useKonto();
  const [wahl, setWahl] = useState(null);     // in dieser Sitzung selbst gewählt (sonst aus Klasse und Speicher)
  const stufe = STUFEN_KEYS.includes(wahl) ? wahl : stufeErmitteln(konto.profil);
  const setzen = (w) => {
    setWahl(w);
    const klasse = angegebeneKlasse(kontoZustand().profil);   // frisch lesen: der Quickfinder hat die Klasse gerade erst gespeichert
    try { localStorage.setItem(STUFE_SCHLUESSEL, w); localStorage.setItem(STUFE_KLASSE_SCHLUESSEL, klasse ? klasse.id : ""); } catch { /* egal */ }
  };
  return { stufe, setzen, klasse: angegebeneKlasse(konto.profil) };
}

export { werkzeugMerken };   // liegt seit 21.10. in hauptmenue.js
function zuletztWerkzeug() {
  try {
    const z = JSON.parse(localStorage.getItem(ZULETZT_SCHLUESSEL) || "null");
    const ort = z && wo(z.ansicht);
    if (!ort || !ort.werkzeug) return null;
    const tage = Math.floor((new Date().setHours(0, 0, 0, 0) - new Date(z.zeit).setHours(0, 0, 0, 0)) / 864e5);
    const wann = tage <= 0 ? "heute" : tage === 1 ? "gestern" : `vor ${tage} Tagen`;
    return { ...ort, ansicht: z.ansicht, wann };
  } catch { return null; }
}

/* lack: schlanke Zeile in der Optik der Heute-Karte (Startseite, Zone 1) – eine Zeile statt Kicker + Name + Bereich */
export function WeitermachenZeile({ gehe, neben = false, lack = false }) {
  const z = zuletztWerkzeug();
  if (!z) return null;
  if (lack) return (
    <button type="button" onClick={() => gehe({ ansicht: z.ansicht })} aria-label={`Weitermachen mit ${z.werkzeug.name}`} data-weitermachen
      style={{ width: "100%", marginTop: 10, display: "flex", alignItems: "center", gap: 12, minHeight: 52, padding: "7px 16px 7px 7px", borderRadius: 999, cursor: "pointer",
        fontFamily: "inherit", textAlign: "left", border: "1px solid transparent", color: C.weiss,
        background: "linear-gradient(150deg, #06102A 0%, #0B1E4A 60%, #12306E 100%) padding-box, linear-gradient(135deg, rgba(255,233,160,0.75), rgba(199,205,214,0.2) 55%, rgba(237,187,0,0.45)) border-box",
        boxShadow: "0 1px 0 rgba(255,255,255,0.18) inset, 0 12px 26px -16px rgba(6,16,42,0.8)" }}>
      <span aria-hidden="true" style={{ flexShrink: 0, width: 38, height: 38, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center",
        border: "1.5px solid rgba(237,187,0,0.75)", background: "rgba(237,187,0,0.1)" }}>
        <svg width="12" height="14" viewBox="0 0 14 16"><path d="M3 2 L12.5 8 L3 14 Z" fill={C.flaggold} /></svg>
      </span>
      <span style={{ flex: 1, minWidth: 0, fontSize: 14.5, lineHeight: 1.25, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        <span style={{ color: "rgba(255,255,255,0.65)", fontWeight: 600 }}>Weiter mit </span><b style={{ fontWeight: 800 }}>{z.werkzeug.name}</b>
      </span>
      <span style={{ flexShrink: 0, fontSize: 12.5, fontWeight: 700, color: "rgba(255,255,255,0.55)" }}>{z.wann}</span>
      <span aria-hidden="true" style={{ flexShrink: 0, fontSize: 20, lineHeight: 1, color: C.flaggold }}>›</span>
    </button>
  );
  return (
    <button type="button" onClick={() => gehe({ ansicht: z.ansicht })} aria-label={`Weitermachen mit ${z.werkzeug.name}`}
      style={{ width: "100%", marginTop: neben ? 0 : 12, height: neben ? "100%" : undefined, display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 14, cursor: "pointer",
        fontFamily: "inherit", textAlign: "left", border: `1.5px solid ${C.flaggold}`, background: "#FFFBEA" }}>
      <span aria-hidden="true" style={{ flexShrink: 0, width: 36, height: 36, borderRadius: 999, background: C.flaggold, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="13" height="15" viewBox="0 0 14 16"><path d="M2 1.5 L12.5 8 L2 14.5 Z" fill={C.seeTief} /></svg>
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 10.5, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#8A6A00" }}>Weitermachen</span>
        <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, color: C.tinte, lineHeight: 1.25 }}>{z.werkzeug.name}</span>
        <span style={{ display: "block", fontSize: 12, color: C.grau }}>{z.bereich.titel} · {z.wann}</span>
      </span>
      <span aria-hidden="true" style={{ fontSize: 22, color: "#8A6A00" }}>›</span>
    </button>
  );
}

const STUFEN = [["unter", "Unterstufe", "5–6"], ["mittel", "Mittelstufe", "7–10"], ["ober", "Oberstufe", "11–13"], ["alle", "Alle", "5–13"]];
export const STUFEN_KEYS = STUFEN.map((s) => s[0]);
function StufenSchalter({ wert, setze }) {
  return (
    <div role="group" aria-label="Schulstufe wählen" style={{ padding: 3, borderRadius: 13, background: "#EEF2F8",
      display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 3 }}>
      {STUFEN.map(([k, name, kl]) => (
        <button key={k} type="button" aria-pressed={wert === k} onClick={() => setze(k)} aria-label={`${name}, Klasse ${kl}`}
          style={{ minHeight: 40, padding: "3px 1px", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "inherit", lineHeight: 1.15,
            background: wert === k ? C.weiss : "transparent", color: wert === k ? C.seeTief : C.grau,
            boxShadow: wert === k ? "0 2px 6px rgba(14,30,74,0.15)" : "none", transition: "background .15s ease" }}>
          <span style={{ display: "block", fontSize: 11.5, fontWeight: 700, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>{name}</span>
          <span style={{ display: "block", fontSize: 10, fontWeight: 600, opacity: 0.75 }}>{kl}</span>
        </button>
      ))}
    </div>
  );
}

/* Kopf des aufgeklappten Bereichs: links „Weitermachen“ (nur Desktop), rechts Stufen und darunter die Etiketten –
   alles auf einer Höhe, danach kommen direkt die Themen. Schmal (oder ohne Weitermachen): untereinander, volle Breite. */
export function SchulKopf({ gehe, mitWeiter, stufe, setzeStufe, etikett, setzeEtikett, klasse }) {
  const weiter = mitWeiter && zuletztWerkzeug() ? <WeitermachenZeile gehe={gehe} neben /> : null;
  // Steht der Schalter auf der Stufe der angegebenen Klasse, sagt eine kleine Zeile, woher die Vorwahl kommt
  const vorwahl = klasse && klasse.stufe === stufe;
  return (
    <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", alignItems: "stretch", gap: 10 }}>
      {weiter && <div style={{ flex: "1 1 240px", minWidth: 0, display: "flex" }}>{weiter}</div>}
      <div style={{ flex: "1 1 280px", minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 8 }}>
        <div>
          <StufenSchalter wert={stufe} setze={setzeStufe} />
          {vorwahl && (
            <p style={{ margin: "5px 6px 0", fontSize: 11, fontWeight: 600, color: C.grau, textAlign: "right", lineHeight: 1.2 }}>
              Vorgewählt nach deiner Klasse <span data-kein-i18n>{klasse.label}</span>
            </p>
          )}
        </div>
        <EtikettKnoepfe wert={etikett} setze={setzeEtikett} />
      </div>
    </div>
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


/* Farbcode je Koeffizient im Polynomplotter: Blau, Gold, Türkis, Grün, Lila. */

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
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${zeile.length}, 1fr)`, gap: 6, flex: 1 }}>
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
   Brüche sein (z. B. e/5 bei x^5). terms: [{coef: {n,d}, potenz}].
   Ein Bruch-Koeffizient wird immer als echter, gestapelter Bruch gesetzt
   (\frac{3}{4}x^{4}), nie als Chat-Schreibweise „(3/4)x^4“. */

export function stammfunktionTex(terms) {
  let erster = true;
  const teile = [];
  terms.forEach(({ coef, potenz }) => {
    if (coef.n === 0) return;
    const negativ = coef.n < 0;
    const betrag = { n: Math.abs(coef.n), d: coef.d };
    const vor = erster ? (negativ ? "-" : "") : negativ ? " - " : " + ";
    erster = false;
    const eins = betrag.n === 1 && betrag.d === 1 && potenz > 0;
    const zahlTeil = eins ? "" : betrag.d === 1 ? String(betrag.n) : `\\frac{${betrag.n}}{${betrag.d}}`;
    const potTeil = potenz > 1 ? `x^{${potenz}}` : potenz === 1 ? "x" : "";
    teile.push(`${vor}${zahlTeil}${potTeil}`);
  });
  return teile.length ? teile.join("") : "0";
}

/* Reine Textfassung (ASCII) — nur noch für Stellen, an denen keine Formel gesetzt werden kann. */
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

/* Perfekte Potenz: liefert r mit r^k = n (n ≥ 0 ganz), sonst null. */
function ganzWurzel(n, k = 2) {
  const r = Math.round(Math.pow(n, 1 / k));
  return r >= 0 && r ** k === n ? r : null;
}

/* k-te Wurzel aus einem positiven Bruch {n, d}: exakt als Bruch, wenn Zähler und Nenner perfekte k-te Potenzen sind, sonst null. */
function bruchWurzel(b, k = 2) {
  const z = ganzWurzel(b.n, k), n = ganzWurzel(b.d, k);
  return z !== null && n !== null ? bruch(z, n) : null;
}

/* A·z² + B·z + C als Klartext (für die Gleichung nach der Substitution z = x²) */
function zPolyText(A, B, Cc) {
  const koef = (c, ersterTerm) => (Math.abs(c) === 1 ? (c < 0 && ersterTerm ? "-" : "") : String(c));
  let t = `${koef(A, true)}z^2`;
  if (B) t += ` ${B < 0 ? "-" : "+"} ${Math.abs(B) === 1 ? "" : Math.abs(B)}z`;
  if (Cc) t += ` ${Cc < 0 ? "-" : "+"} ${Math.abs(Cc)}`;
  return t;
}

/* Quadratische Gleichung A·v² + B·v + C = 0 (v = "x" oder "z") mit der Mitternachtsformel lösen.
   Schreibt die Rechenschritte in `schritte` und gibt die Lösungen in der Reihenfolge v1, v2 zurück:
   { art: "zwei" | "doppelt" | "keine", werte: [{ v: Zahl, b: Bruch oder null (null = gerundet), text }] } */
function loeseQuadratMNF(A, B, Cc, v, gleichung, schritte) {
  const negB = -B;
  const bQuad = B * B;
  const vierAC = 4 * A * Cc;
  const disk = bQuad - vierAC;
  const zweiA = 2 * A;
  schritte.push(`Quadratische Gleichung: ${gleichung} = 0`);
  schritte.push({ txt: v === "x" ? "Quadratische Gleichung lösen (MNF)" : `Quadratische Gleichung in ${v} lösen (MNF)`, fett: true });
  // Erst nur die Koeffizienten einsetzen, ohne etwas auszurechnen …
  schritte.push({ txt: `${v}_{1,2} = \\frac{-${potBasis(B)} \\pm \\sqrt{${potBasis(B)}^2 - 4 \\cdot ${potBasis(A)} \\cdot ${potBasis(Cc)}}}{2 \\cdot ${potBasis(A)}}`, formel: true });
  // … -b vereinfachen, b² und 4ac getrennt ausrechnen (noch nicht verrechnet) …
  schritte.push({ txt: `${v}_{1,2} = \\frac{${potBasis(negB)} \\pm \\sqrt{${bQuad} - ${potBasis(vierAC)}}}{${zweiA}}`, formel: true });
  // … dann die Diskriminante zusammenfassen …
  schritte.push({ txt: `${v}_{1,2} = \\frac{${potBasis(negB)} \\pm \\sqrt{${disk}}}{${zweiA}}`, formel: true });
  if (disk > 1e-9) {
    const wd = Math.sqrt(disk);
    if (Number.isInteger(Math.round(wd)) && Math.round(wd) ** 2 === disk) {
      // … die Wurzel zieht glatt auf, also die Wurzel auflösen …
      const wdG = Math.round(wd);
      schritte.push({ txt: `${v}_{1,2} = \\frac{${potBasis(negB)} \\pm ${wdG}}{${zweiA}}`, formel: true });
      // … und zuletzt v1 und v2 einzeln als konkrete Ergebnisse.
      const w1 = bruch(-B + wdG, 2 * A), w2 = bruch(-B - wdG, 2 * A);
      schritte.push({ txt: `${v}_1 = ${bruchLatex(w1)}`, fett: true, formel: true });
      schritte.push({ txt: `${v}_2 = ${bruchLatex(w2)}`, fett: true, formel: true });
      return { art: "zwei", werte: [
        { v: w1.n / w1.d, b: w1, text: `${v}1 = ${bruchText(w1)}` },
        { v: w2.n / w2.d, b: w2, text: `${v}2 = ${bruchText(w2)}` },
      ] };
    }
    // … die Wurzel ist irrational, also gerundet weiterrechnen …
    schritte.push({ txt: `${v}_{1,2} = \\frac{${potBasis(negB)} \\pm ${zahlCa(wd)}}{${zweiA}}`, formel: true });
    const w1 = (-B + wd) / (2 * A), w2 = (-B - wd) / (2 * A);
    schritte.push({ txt: `${v}1 = ${zahlCa(w1)}`, fett: true });
    schritte.push({ txt: `${v}2 = ${zahlCa(w2)}`, fett: true });
    return { art: "zwei", werte: [
      { v: w1, b: null, text: `${v}1 = ${zahlCa(w1)}` },
      { v: w2, b: null, text: `${v}2 = ${zahlCa(w2)}` },
    ] };
  }
  if (Math.abs(disk) <= 1e-9) {
    const w0 = bruch(-B, 2 * A);
    schritte.push({ txt: `${v}_{1,2} = \\frac{${potBasis(negB)} \\pm 0}{${zweiA}}`, formel: true });
    schritte.push({ txt: `\\text{doppelte Lösung } ${v} = ${bruchLatex(w0)}`, fett: true, formel: true });
    return { art: "doppelt", werte: [{ v: w0.n / w0.d, b: w0, text: `${v} = ${bruchText(w0)} (doppelt)` }] };
  }
  schritte.push({ txt: `D = ${disk} < 0  =>  keine reelle Lösung.`, fett: true });
  return { art: "keine", werte: [] };
}

/* Biquadratische Gleichung A·x⁴ + B·x² + C = 0 (Koeffizienten f = [A, 0, B, 0, C], C ≠ 0) per Substitution z = x²:
   A·z² + B·z + C = 0 lösen, dann zurücksubstituieren: aus jedem z > 0 werden x = +√z und x = −√z, z < 0 liefert nichts.
   So entstehen bis zu vier Lösungen. Ist B = 0, steht nur x⁴ = k da: vierte Wurzel ziehen. */
function loeseBiquadratisch(f, schritte, loesungen) {
  const A = f[0], B = f[2], Cc = f[4];

  if (B === 0) {
    schritte.push({ txt: `Die Gleichung ${polyTextPdf(f)} = 0 enthält nur x^4 und eine Zahl: nach x^4 auflösen und die vierte Wurzel ziehen.`, prosa: true });
    const k = bruch(-Cc, A);
    schritte.push({ txt: `x^4 = ${bruchLatex(k)}`, formel: true });
    if (k.n < 0) {
      schritte.push({ txt: "x^4 ist nie negativ  =>  keine reelle Lösung.", fett: true });
      return;
    }
    const r4 = bruchWurzel(k, 4);
    const w = Math.pow(k.n / k.d, 0.25);
    const wTex = r4 ? bruchLatex(r4) : zahlCa(w);
    const wText = r4 ? bruchText(r4) : zahlCa(w);
    schritte.push({ txt: `x_{1,2} = \\pm\\sqrt[4]{${bruchLatex(k)}} = \\pm ${wTex}`, fett: true, formel: true });
    loesungen.push({ x: -w, text: `x = -${wText}` }, { x: w, text: `x = ${wText}` });
    return;
  }

  schritte.push({ txt: `Biquadratische Gleichung: ${polyTextPdf(f)} = 0 enthält nur x^4, x^2 und eine Zahl. Das löst du mit einer Substitution: Setze z = x^2, dann ist x^4 = z^2.`, prosa: true });
  schritte.push({ txt: "Substitution: z = x^2", fett: true });
  const q = loeseQuadratMNF(A, B, Cc, "z", zPolyText(A, B, Cc), schritte);
  if (q.art === "keine") {
    schritte.push({ txt: "Für z gibt es keine reelle Lösung, also auch kein x: Die Gleichung hat keine reelle Lösung.", prosa: true });
    return;
  }
  schritte.push({ txt: "Rücksubstitution: Aus z = x^2 folgt x = +√z oder x = −√z – aber nur, wenn z nicht negativ ist, denn ein Quadrat ist nie negativ.", prosa: true });
  let positiv = 0;
  q.werte.forEach((w, i) => {
    const zn = q.art === "doppelt" ? "z" : `z_${i + 1}`;
    const znText = q.art === "doppelt" ? "z" : `z${i + 1}`;
    const zTex = w.b ? bruchLatex(w.b) : zahlCa(w.v);
    if (w.v > 1e-12) {
      positiv++;
      const xv = Math.sqrt(w.v);
      const r = w.b ? bruchWurzel(w.b) : null;
      const xTex = r ? bruchLatex(r) : zahlCa(xv);
      const xText = r ? bruchText(r) : zahlCa(xv);
      schritte.push({ txt: `${zn} = ${zTex} \\quad\\Rightarrow\\quad x = \\pm\\sqrt{${zTex}} = \\pm ${xTex}`, fett: true, formel: true });
      const zusatz = q.art === "doppelt" ? " (doppelt)" : "";
      loesungen.push({ x: -xv, text: `x = -${xText}${zusatz}` }, { x: xv, text: `x = ${xText}${zusatz}` });
    } else {
      schritte.push({ txt: `${zn} = ${zTex} < 0`, formel: true });
      schritte.push({ txt: `${znText} ist negativ, also keine reelle Lösung für x (ein Quadrat ist nie negativ).`, prosa: true });
    }
  });
  if (positiv === 0) schritte.push({ txt: "Beide z-Werte sind negativ: Die Gleichung hat keine reelle Lösung.", prosa: true });
  else schritte.push({ txt: `Aus jedem positiven z entstehen zwei Lösungen (+√z und −√z): Hier ${["keine", "zwei", "vier"][positiv]} Lösungen.`, prosa: true });
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
    const potx = ausklammern === 1 ? "x" : `x^${ausklammern}`;
    schritte.push(`${potx} ausklammern: ${potx} * (${polyTextPdf(f)}) = 0  =>  x = 0 ist eine ${ausklammern === 1 ? "" : ausklammern === 2 ? "doppelte " : "mehrfache "}Lösung.`);
  }

  // Ganzzahlige Nullstellen raten und per Polynomdivision reduzieren —
  // außer bei einer biquadratischen Gleichung (nur x⁴, x², Zahl): die löst die Substitution z = x² exakt.
  let biFertig = false;
  while (f.length - 1 > 2) {
    if (f.length === 5 && f[1] === 0 && f[3] === 0 && f[4] !== 0) {
      loeseBiquadratisch(f, schritte, loesungen);
      biFertig = true;
      break;
    }
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
  if (biFertig) {
    // schon vollständig gelöst (Substitution)
  } else if (restGrad === 1) {
    const br = bruch(-f[1], f[0]);
    schritte.push({ txt: `\\text{Lineare Gleichung: } ${polyTextPdf(f)} = 0 \\quad\\Rightarrow\\quad x = ${bruchLatex(br)}`, formel: true });
    loesungen.push({ x: br.n / br.d, text: `x = ${bruchText(br)}`});
  } else if (restGrad === 2) {
    const qr = loeseQuadratMNF(f[0], f[1], f[2], "x", polyTextPdf(f), schritte);
    qr.werte.forEach((w) => loesungen.push({ x: w.v, text: w.text }));
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
  return baueKurvendiskussionInhaltK([0, e, a, b, c, d]);
}

/* Ableitungen eines Polynoms als Koeffizientenlisten (höchste Potenz zuerst, Länge 6 → 5 → 4). */
export function polyAbleitungen(K6) {
  const D1 = K6.slice(0, 5).map((v, i) => v * (5 - i));
  const D2 = D1.slice(0, 4).map((v, i) => v * (4 - i));
  return { D1, D2 };
}

/* Allgemeine Fassung: k = Koeffizienten von x⁵ bis x⁰ (höchste Potenz zuerst; kürzere Listen werden links mit 0 aufgefüllt). */
export function baueKurvendiskussionInhaltK(k) {
  const K6 = k.length >= 6 ? k.slice(-6) : [...Array(6 - k.length).fill(0), ...k];
  const [p5, e, a, b, c, d] = K6;
  const { D1, D2 } = polyAbleitungen(K6);
  const f = (x) => horner(K6, x);
  const ersterIdx = K6.findIndex((v) => v !== 0);
  const grad = ersterIdx === -1 ? 0 : 5 - ersterIdx;

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
  const nurUngerade = p5 !== 0 ? (e === 0 && b === 0 && d === 0) : (e === 0 && b === 0 && d === 0 && (a !== 0 || c !== 0));
  const nurGerade = p5 === 0 && a === 0 && c === 0;
  if (nurUngerade) {
    zP(s2, p5 !== 0
      ? "f enthält nur ungerade Exponenten (x^5, x^3 und x). Es gilt f(-x) = -f(x), daher ist f punktsymmetrisch zum Ursprung."
      : "f enthält nur ungerade Exponenten (x^3 und x). Es gilt f(-x) = -f(x), daher ist f punktsymmetrisch zum Ursprung.");
  } else if (nurGerade) {
    zP(s2, "f enthält nur gerade Exponenten (x^4, x^2, x^0). Es gilt f(-x) = f(x), daher ist f achsensymmetrisch zur y-Achse.");
  } else {
    zP(s2, "f enthält sowohl gerade als auch ungerade Exponenten mit Koeffizient ungleich 0. Es gilt weder f(-x) = f(x) noch f(-x) = -f(x) - es liegt keine Symmetrie zur y-Achse oder zum Ursprung vor.");
  }

  const s3 = abschnitt("3. Verhalten im Unendlichen");
  const leit = ersterIdx === -1 ? d : K6[ersterIdx];
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
  const nsErg = loeseGanzrational(K6);
  nsErg.schritte.forEach((sc) => zSchritt(s4, sc));
  if (nsErg.loesungen.length === 0) zP(s4, "f besitzt keine reelle Nullstelle.");
  else {
    const txt = nsErg.loesungen.map((l, i) => `x${nsErg.loesungen.length > 1 ? "₁₂₃₄₅₆"[i] ?? i + 1 : ""} = ${zahl(l.x)}`).join(",  ");
    z(s4, `Nullstellen: ${txt}`, true);
    nsErg.loesungen.map((l) => l.x).sort((p, q) => p - q)
      .forEach((x) => punkte.push({ art: "Nullstelle", kurz: "N", x, y: 0 }));
  }

  const s5 = abschnitt("5. Erste und zweite Ableitung");
  z(s5, `f'(x)  = ${polyTextPdf(D1)}`);
  z(s5, `f''(x) = ${polyTextPdf(D2)}`);

  const s6 = abschnitt("6. Extrempunkte");
  if (grad <= 1) {
    zP(s6, "Da f höchstens linear ist (Grad kleiner/gleich 1), besitzt f keine Extrempunkte.");
  } else {
    z(s6, `Notw. Bed.: f'(x) = ${polyTextPdf(D1)} = 0`, true);
    const exErg = loeseGanzrational(D1);
    exErg.schritte.forEach((sc) => zSchritt(s6, sc));
    if (exErg.loesungen.length === 0) zP(s6, "f besitzt keine Extrempunkte.");
    else {
      z(s6, "Hinr. Bed.: Vorzeichen von f'' prüfen", true);
      exErg.loesungen.forEach((l) => {
        const fssx = horner(D2, l.x);
        let art;
        if (Math.abs(fssx) > 1e-6) art = fssx < 0 ? "Hochpunkt" : "Tiefpunkt";
        else {
          const l1 = horner(D1, l.x - 1e-3);
          const r1 = horner(D1, l.x + 1e-3);
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
    const fs = (x) => horner(D1, x);
    const monErg = loeseGanzrational(D1);
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
    z(s8, `Notw. Bed.: f''(x) = ${polyTextPdf(D2)} = 0`, true);
    const weErg = loeseGanzrational(D2);
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
    const fss = (x) => horner(D2, x);
    const kruErg = loeseGanzrational(D2);
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
    const Fp = bruch(p5, 6), Fe = bruch(e, 5), Fa = bruch(a, 4), Fb = bruch(b, 3), Fc = bruch(c, 2), Fd = bruch(d, 1);
    const stammTex = stammfunktionTex([
      { coef: Fp, potenz: 6 }, { coef: Fe, potenz: 5 }, { coef: Fa, potenz: 4 }, { coef: Fb, potenz: 3 },
      { coef: Fc, potenz: 2 }, { coef: Fd, potenz: 1 },
    ]);
    z(s11, `F(x) = ${stammTex}`, true, true);
    const Fx = (x) => (p5 / 6) * x ** 6 + (e / 5) * x ** 5 + (a / 4) * x ** 4 + (b / 3) * x ** 3 + (c / 2) * x ** 2 + d * x;
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

  return { funktionstext: `f(x) = ${polyTextPdf(K6)}`, abschnitte };
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

/* k = Koeffizienten von x⁵ bis x⁰ (Länge 6); fehlt k, werden e, a, b, c, d (x⁴ … x⁰) verwendet. */
export function polyReihen(K6) {
  const n = K6.findIndex((v) => v !== 0);
  const grad = n === -1 ? 0 : 5 - n;
  const buchst = "abcdef";
  const spalten = [];
  for (let pot = grad; pot >= 0; pot--) spalten.push({ pot, wert: K6[5 - pot], schluessel: buchst[grad - pot] });
  const zeileF = baueReihe(spalten.map((s) => ({ schluessel: s.schluessel, wert: s.wert, potenz: s.pot })));
  const zeileF1 = baueReihe(spalten.map((s) => ({ schluessel: s.schluessel, wert: s.pot * s.wert, potenz: Math.max(s.pot - 1, 0) })));
  const zeileF2 = baueReihe(spalten.map((s) => ({ schluessel: s.schluessel, wert: s.pot * (s.pot - 1) * s.wert, potenz: Math.max(s.pot - 2, 0) })));
  return { grad, spalten, zeileF, zeileF1, zeileF2 };
}

export function KurvendiskussionAnzeige({ k, e, a, b, c, d, fein = false }) {
  const K6 = k || [0, e, a, b, c, d];
  const schluessel = K6.join(",");
  const inhalt = React.useMemo(() => baueKurvendiskussionInhaltK(K6), [schluessel]);
  const { zeileF, zeileF1, zeileF2 } = polyReihen(K6);
  const alleLeer = zeileF.every((t) => !t);
  // fein: Desktop-Stil (feiner Rahmen statt Schatten, DESKTOP-STIL.md)
  const kartenStil = fein
    ? { background: C.weiss, borderRadius: 16, padding: "20px 24px", border: `1px solid ${C.linie}`, marginTop: 16 }
    : { background: C.weiss, borderRadius: 16, padding: 20, boxShadow: "0 2px 16px rgba(15,26,51,0.07)", marginTop: 18 };
  return (
    <div style={kartenStil}>
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
      <IntegralSchaubild k={K6} fein={fein} />
      <PdfKnopf k={K6} />
    </div>
  );
}

/* Lädt den PDF-Export erst beim Tippen (eigene Datei func11.jsx mit jsPDF). */
function PdfKnopf({ k }) {
  const [status, setStatus] = useState("bereit");
  const klick = async () => {
    if (status === "laeuft") return;
    setStatus("laeuft");
    try {
      const { kurvendiskussionPdf } = await import("./func11.jsx");
      await kurvendiskussionPdf({ k });
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

export function IntegralSchaubild({ k: kListe, e, a, b, c, d, fein = false }) {
  const K6 = kListe || [0, e, a, b, c, d];
  const f = (x) => horner(K6, x);
  const ersterIdx = K6.findIndex((v) => v !== 0);
  const grad = ersterIdx === -1 ? 0 : 5 - ersterIdx;

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
  const Fx = (x) => K6.reduce((summe, v, i) => summe + (v / (6 - i)) * x ** (6 - i), 0);

  // Dieselbe Farbfolge wie bei den Koeffizienten-Boxen — Blau, Gold, Türkis, Grün, Lila.
  const farben = [C.see, C.gruen, C.tuerkis, C.smaragd, C.lila];
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
    <div style={fein ? { background: C.weiss, borderRadius: 14, padding: "16px 18px", border: `1px solid ${C.linie}`, marginTop: 18 } : { background: C.weiss, borderRadius: 16, padding: 20, boxShadow: "0 2px 16px rgba(15,26,51,0.07)", marginTop: 18 }}>
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


