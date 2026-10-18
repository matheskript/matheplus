/* Mathilda AI – Kopfbereich, Modus-Wahl und illustrierte Foto-Anleitung.
   Reine Darstellung: die Foto-Logik (Kamera, Galerie, Analyse) bleibt in func10.jsx. */
import React from "react";
import { C } from "./base1.jsx";
import "@fontsource/caveat/600.css";
import { HAAR, HAUT, FEAT, HAAR_LINIEN } from "./mathildaPortraet.js";

const GOLD = C.flaggold;
const NACHT = C.seeTief;

/* Mathilda als Scherenschnitt, aus dem Foto abgeleitet (siehe mathildaPortraet.js):
   Haar in Logo-Gold, Haut weiß, Schatten als echte Aussparung (Maske), dazu Sonnenbrille,
   Ohrring und ein leichtes Grinsen. Sitzt auf jedem Hintergrund. */
export function MathildaBild({ groesse = 220, style, className }) {
  const id = "mm" + React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const glas = (cx, sx) => (
    <g key={cx} transform={`translate(${cx} 191) scale(${sx * 0.86} 0.92)`}>
      <path d="M-40 -27 C -20 -32, 16 -32, 38 -28 C 43 -27, 45 -23, 44.5 -18 L 41 7 C 38.5 22, 28 31, 13 31 H -9 C -26 31, -37 22, -40 7 L -44 -17 C -44.6 -23, -43 -26.4, -40 -27 Z"
        fill={`url(#${id}g)`} stroke={GOLD} strokeWidth="4" strokeLinejoin="round" />
      <path d="M-30 -17 L -10 -17 M-33 -8 L -24 -8" stroke="#FFFFFF" strokeOpacity=".7" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M15 13 L 28 0" stroke="#FFFFFF" strokeOpacity=".25" strokeWidth="3" strokeLinecap="round" />
    </g>
  );
  return (
    <svg viewBox="0 0 320 440" width={groesse} height={Math.round(groesse * 440 / 320)} className={className} style={style}
      aria-label="Mathilda" role="img">
      <defs>
        <linearGradient id={id + "g"} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0A1638" /><stop offset="0.65" stopColor="#13285A" /><stop offset="1" stopColor="#24427E" />
        </linearGradient>
        <mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width="320" height="440">
          <rect width="320" height="440" fill="#000" />
          <path fill="#fff" fillRule="evenodd" d={HAAR} />
          <path fill="#fff" fillRule="evenodd" d={HAUT} />
          <path fill="#000" fillRule="evenodd" d={FEAT} />
          {/* leichtes Grinsen */}
          <path fill="#000" d="M132 279 C 137 278, 142 283, 149 286.5 C 164 293, 191 293, 206 286 C 213 282.5, 218 277.5, 224 276.5 C 222 283, 216 291, 207 295.5 C 190 302.5, 163 302.5, 147 295.5 C 139 292, 134.5 286, 132 279 Z" />
          <path fill="none" stroke="#000" strokeWidth="2.6" strokeLinecap="round" d="M128 274 C 129 277, 131 280, 134 282 M228 271 C 227 274, 225 277, 222 279" />
          <path fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" d="M164 309 C 172 312, 184 312, 192 309" />
          {/* Kieferschatten und Halsschatten wie auf dem Foto */}
          <path fill="#000" d="M86 296 C 92 318, 108 338, 130 350 C 146 358, 160 361, 172 360 C 196 358, 222 346, 242 327 C 250 319, 255 309, 258 298 C 254 318, 238 340, 214 352 C 196 360, 182 363, 170 363 C 154 362, 134 356, 120 346 C 104 334, 92 316, 86 296 Z" />
          <path fill="#000" d="M138 366 C 154 376, 186 376, 206 364 C 198 382, 178 390, 170 390 C 158 388, 145 380, 138 366 Z" />
        </mask>
        <clipPath id={id + "h"}><path clipRule="evenodd" d={HAAR} /></clipPath>
      </defs>
      <g mask={`url(#${id})`}>
        <path fill={GOLD} fillRule="evenodd" d={HAAR} />
        <path fill="#FFFFFF" fillRule="evenodd" d={HAUT} />
      </g>
      <path fill="none" stroke="#12305F" strokeWidth="2" strokeLinecap="round" clipPath={`url(#${id}h)`} d={HAAR_LINIEN} />
      {/* Sonnenbrille */}
      <path d="M82 171 C 66 171, 48 175, 34 184" fill="none" stroke={GOLD} strokeWidth="4" strokeLinecap="round" />
      <path d="M253 171 C 264 171, 272 173, 278 178" fill="none" stroke={GOLD} strokeWidth="4" strokeLinecap="round" />
      {glas(119, 1)}{glas(216, -1)}
      <path d="M157 169 C 162 162, 173 162, 178 169" fill="none" stroke={GOLD} strokeWidth="4.4" strokeLinecap="round" />
      {/* Ohrring */}
      <circle cx="62" cy="268" r="5" fill={GOLD} stroke="#12305F" strokeWidth="1.6" />
      <path d="M70 280 C 82 286, 86 308, 76 320 C 65 313, 61 292, 70 280 Z" fill="#FFFFFF" stroke="#12305F" strokeWidth="2" />
    </svg>
  );
}

/* Kleines rundes Icon (Menü, Kacheln): Mathilda im Kreis */
export function MathildaIcon({ groesse = 40, hintergrund = NACHT, style }) {
  return (
    <span style={{ display: "inline-flex", width: groesse, height: groesse, borderRadius: 999, background: hintergrund, overflow: "hidden",
      alignItems: "flex-end", justifyContent: "center", flex: "none", ...style }}>
      <MathildaBild groesse={groesse * 0.92} style={{ display: "block", marginBottom: -groesse * 0.06 }} />
    </span>
  );
}

export const MODI = [
  { id: "blatt", name: "Blatt prüfen", kurz: "Dein Rechenweg, Zeile für Zeile" },
  { id: "weg", name: "Weg prüfen", kurz: "Vom Papier in den Editor" },
  { id: "aufgabe", name: "Aufgabe scannen", kurz: "Drei neue derselben Sorte" },
  { id: "chat", name: "Mathilda fragen", kurz: "Sie fragt zurück, bevor sie verrät" },
];

function ModusGlyph({ id, aktiv }) {
  const f = aktiv ? GOLD : "#8FA3CC";
  const s = { width: 26, height: 26, flex: "none" };
  if (id === "blatt") return (
    <svg viewBox="0 0 26 26" style={s} fill="none" stroke={f} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h10l4 4v16H6z"/><path d="M16 3v4h4"/><path d="M9 12h8M9 16h6"/><path d="M9 20l2 2 4-4"/>
    </svg>);
  if (id === "weg") return (
    <svg viewBox="0 0 26 26" style={s} fill="none" stroke={f} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h8M4 13h8M4 19h8"/><path d="M15 13h7"/><path d="M19 9l3 4-3 4"/>
    </svg>);
  if (id === "aufgabe") return (
    <svg viewBox="0 0 26 26" style={s} fill="none" stroke={f} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9V5h4M18 5h4v4M22 17v4h-4M8 21H4v-4"/><path d="M9 13h8"/><path d="M13 9v8"/>
    </svg>);
  return (
    <svg viewBox="0 0 26 26" style={s} fill="none" stroke={f} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h18v11H11l-5 4v-4H4z"/><path d="M9 11.5h.01M13 11.5h.01M17 11.5h.01"/>
    </svg>);
}

/* Kopfbereich: Titel dicht am Header, Zweizeiler, goldener Scan-Knopf, rechts Mathilda; darunter die vier Modi */
export function MathildaKopf({ modus, setModus, onScan, onText }) {
  return (
    <div className="mathilda-kopf" style={{ background: `radial-gradient(120% 90% at 85% 10%, #163A7A 0%, ${C.see} 35%, ${NACHT} 85%)`, position: "relative", overflow: "hidden" }}>
      <style>{`
        .mathilda-kopf .mk-innen { max-width: 760px; margin: 0 auto; padding: 14px 24px 0; display: grid; grid-template-columns: 1fr auto; gap: 0 18px; align-items: end; }
        .mathilda-kopf .mk-text { align-self: start; padding-top: 4px; padding-bottom: 22px; }
        .mathilda-kopf .mk-portraet { position: relative; align-self: end; animation: mk-auf 0.9s cubic-bezier(.2,.8,.2,1) both; margin-right: calc((min(760px, 100vw) - 78px) / 12); }
        .mathilda-kopf .mk-portraet svg { display: block; width: 196px; height: auto; position: relative; }
        .mathilda-kopf .mk-schein { position: absolute; inset: auto -10% 0 -10%; height: 70%; background: radial-gradient(60% 70% at 50% 100%, rgba(237,187,0,0.30), transparent 70%); pointer-events: none; }
        .mathilda-kopf .mk-scan { margin-top: 30px; display: inline-flex; align-items: center; gap: 12px; padding: 0 22px 0 8px; height: 58px; border: none; border-radius: 999px; cursor: pointer; font-family: inherit;
          color: ${NACHT}; font-size: 17px; font-weight: 800; letter-spacing: -0.01em; background: linear-gradient(135deg, #F8D23A 0%, ${GOLD} 55%, #D9A600 100%);
          box-shadow: 0 10px 30px rgba(237,187,0,0.40), inset 0 1px 0 rgba(255,255,255,0.55); transition: transform .15s ease, box-shadow .15s ease; -webkit-tap-highlight-color: transparent; animation: mk-auf 0.9s 0.1s cubic-bezier(.2,.8,.2,1) both; }
        .mathilda-kopf .mk-scan:hover { transform: translateY(-2px); box-shadow: 0 14px 36px rgba(237,187,0,0.5), inset 0 1px 0 rgba(255,255,255,0.55); }
        .mathilda-kopf .mk-scan:active { transform: translateY(0); }
        .mathilda-kopf .mk-scan .mk-kam { width: 42px; height: 42px; border-radius: 999px; background: ${NACHT}; display: flex; align-items: center; justify-content: center; flex: none; }
        .mathilda-kopf .mk-modi { max-width: 760px; margin: 0 auto; padding: 18px 24px 26px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; border-top: 1px solid rgba(255,255,255,0.08); }
        .mathilda-kopf .mk-modus { text-align: left; border: 1.5px solid rgba(255,255,255,0.14); background: rgba(255,255,255,0.06); color: #DCE5F6; border-radius: 16px; padding: 12px 12px 11px; font-family: inherit; cursor: pointer; display: flex; flex-direction: column; gap: 8px; transition: transform .15s ease, background .15s ease, border-color .15s ease; -webkit-tap-highlight-color: transparent; }
        .mathilda-kopf .mk-modus:hover { transform: translateY(-2px); background: rgba(255,255,255,0.1); }
        .mathilda-kopf .mk-modus[data-aktiv="1"] { background: #FFFFFF; color: ${NACHT}; border-color: #FFFFFF; box-shadow: 0 10px 26px rgba(5,12,40,0.35), inset 0 -4px 0 ${GOLD}; }
        .mathilda-kopf .mk-modus b { display: block; font-size: 14px; font-weight: 700; letter-spacing: -0.01em; line-height: 1.2; }
        .mathilda-kopf .mk-modus span { display: block; font-size: 12px; font-weight: 400; line-height: 1.4; opacity: .85; }
        .mathilda-kopf .mk-text-kachel { max-width: 760px; margin: 0 auto; padding: 0 24px 24px; }
        .mathilda-kopf .mk-text-kachel button { width: 100%; display: flex; align-items: center; gap: 12px; text-align: left; cursor: pointer; font-family: inherit; color: #FFFFFF; border-radius: 16px; padding: 12px 14px;
          border: 1.5px solid rgba(237,187,0,0.55); background: linear-gradient(135deg, rgba(237,187,0,0.16), rgba(255,255,255,0.04)); transition: transform .15s ease, background .15s ease; -webkit-tap-highlight-color: transparent; }
        .mathilda-kopf .mk-text-kachel button:hover { transform: translateY(-2px); background: linear-gradient(135deg, rgba(237,187,0,0.24), rgba(255,255,255,0.06)); }
        .mathilda-kopf .mk-text-kachel b { display: block; font-size: 14.5px; font-weight: 700; }
        .mathilda-kopf .mk-text-kachel span.mk-tk-z { display: block; font-size: 12.5px; font-weight: 300; color: #C9D6EE; line-height: 1.4; }
        .mathilda-kopf .mk-text-kachel .mk-tk-neu { font-size: 10px; font-weight: 800; letter-spacing: .12em; color: ${NACHT}; background: ${GOLD}; border-radius: 999px; padding: 3px 8px; flex: none; }
        .mathilda-kopf .mk-ober { color: ${GOLD}; font-size: 12px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; margin-bottom: 8px; }
        .mathilda-kopf .mk-titel { font-weight: 700; font-size: 44px; letter-spacing: -0.03em; line-height: .98; margin: 0; }
        .mathilda-kopf .mk-satz { color: #C9D6EE; font-size: 15.5px; font-weight: 300; line-height: 1.55; margin-top: 12px; max-width: 400px; }
        @keyframes mk-auf { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        @media (max-width: 560px) {
          .mathilda-kopf .mk-innen { grid-template-columns: 1fr 34vw; gap: 0 12px; padding-top: 20px; align-items: stretch; }
          .mathilda-kopf .mk-text { align-self: start; padding: 0 0 16px; }
          .mathilda-kopf .mk-portraet { margin-right: 0; align-self: stretch; position: relative; }
          .mathilda-kopf .mk-portraet svg { position: absolute; left: calc(50% + 6px); right: auto; translate: -50% 0; bottom: 16px; height: calc(100% - 16px); width: auto; max-width: none; margin: 0; }
          .mathilda-kopf .mk-schein { display: none; }
          .mathilda-kopf .mk-ober { font-size: 10px; letter-spacing: .12em; margin-bottom: 8px; }
          .mathilda-kopf .mk-titel { font-size: 30px; }
          .mathilda-kopf .mk-satz { font-size: 13px; line-height: 1.5; margin-top: 8px; }
          .mathilda-kopf .mk-scan { margin-top: 16px; width: calc((100vw - 58px) / 2); justify-content: flex-start; height: 44px; font-size: 13.5px; padding: 0 12px 0 5px; gap: 8px; box-shadow: 0 6px 18px rgba(237,187,0,0.35), inset 0 1px 0 rgba(255,255,255,0.55); }
          .mathilda-kopf .mk-scan .mk-kam { width: 34px; height: 34px; }
          .mathilda-kopf .mk-scan .mk-kam svg { width: 18px; height: 18px; }
          .mathilda-kopf .mk-modi { grid-template-columns: repeat(2, 1fr); padding-top: 16px; padding-bottom: 22px; }
        }
        @media (prefers-reduced-motion: reduce) { .mathilda-kopf .mk-portraet, .mathilda-kopf .mk-scan { animation: none; } }
      `}</style>
      <div className="mk-innen">
        <div className="mk-text">
          <p className="mk-ober">Deine Mathe-KI-Trainerin</p>
          <h1 className="titel-silber mk-titel">
            Mathilda<span style={{ color: GOLD }}>AI</span>
          </h1>
          <p className="mk-satz">
            Sie liest dein Blatt, nicht nur dein Ergebnis – und zeigt dir den einen nächsten Schritt.
          </p>
          <button type="button" className="mk-scan" onClick={onScan}>
            <span className="mk-kam" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" />
              </svg>
            </span>
            Scan dein Blatt
          </button>
        </div>
        <div className="mk-portraet">
          <div className="mk-schein" />
          <MathildaBild groesse={196} style={{ display: "block" }} />
        </div>
      </div>
      <div className="mk-modi" role="tablist" aria-label="Was Mathilda tun soll">
        {MODI.map((x) => (
          <button key={x.id} type="button" role="tab" aria-selected={modus === x.id} data-aktiv={modus === x.id ? "1" : "0"}
            className="mk-modus" onClick={() => setModus(x.id)}>
            <ModusGlyph id={x.id} aktiv={modus === x.id} />
            <div><b>{x.name}</b><span>{x.kurz}</span></div>
          </button>
        ))}
      </div>
      {onText && (
        <div className="mk-text-kachel">
          <button type="button" onClick={onText} data-mathilda-textaufgabe>
            <span className="mk-tk-neu">NEU</span>
            <span style={{ flex: 1, minWidth: 0 }}><b>Textaufgabe übersetzen</b><span className="mk-tk-z">Foto rein – Bedingungen raus. Jede Stelle mit Begründung.</span></span>
            <span aria-hidden="true" style={{ color: GOLD, fontSize: 20, fontWeight: 700 }}>→</span>
          </button>
        </div>
      )}
    </div>
  );
}

/* Illustration: Blatt auf dem Tisch, Handy flach darüber, goldener Suchrahmen – zeigt, wie das Foto entsteht */
export function FotoIllustration({ style }) {
  return (
    <svg viewBox="0 0 560 360" style={{ width: "100%", height: "auto", display: "block", ...style }} role="img" aria-label="So fotografierst du dein Blatt: Handy flach über dem Blatt">
      <style>{`
        .fi-handy { animation: fi-schweben 3.2s ease-in-out infinite; transform-origin: 280px 150px; }
        .fi-rahmen { animation: fi-puls 2.4s ease-in-out infinite; }
        .fi-blitz { animation: fi-blitz 3.2s ease-in-out infinite; }
        @keyframes fi-schweben { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes fi-puls { 0%,100% { opacity: .55; } 50% { opacity: 1; } }
        @keyframes fi-blitz { 0%,88%,100% { opacity: 0; } 92% { opacity: .9; } 96% { opacity: 0; } }
        @media (prefers-reduced-motion: reduce) { .fi-handy, .fi-rahmen, .fi-blitz { animation: none; } }
      `}</style>
      <defs>
        <linearGradient id="fi-tisch" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F3F6FB"/><stop offset="1" stopColor="#E8EFF9"/>
        </linearGradient>
        <filter id="fi-schatten" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="14" stdDeviation="12" floodColor="#0F1A33" floodOpacity="0.22"/>
        </filter>
        <filter id="fi-schatten-blatt" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#0F1A33" floodOpacity="0.14"/>
        </filter>
      </defs>
      {/* Tisch */}
      <rect width="560" height="360" rx="24" fill="url(#fi-tisch)"/>
      {/* Blatt (Blanko, leicht gedreht) */}
      <g transform="rotate(-4 280 230)">
        <rect x="150" y="110" width="260" height="240" rx="6" fill="#FFFFFF" filter="url(#fi-schatten-blatt)"/>
        {/* Rechenweg mit schwarzem Stift */}
        <g fill="#1B1F2A" fontFamily="Caveat, 'Segoe Print', 'Bradley Hand', cursive" fontSize="30" fontWeight="600">
          <text x="176" y="156">f(x) = x² − 4x</text>
          <text x="176" y="198">f′(x) = 2x − 4</text>
          <text x="176" y="240">2x − 4 = 0</text>
          <text x="176" y="282">x = 2</text>
          <rect x="172" y="258" width="78" height="34" rx="4" fill="none" stroke="#1B1F2A" strokeWidth="2.4"/>
        </g>
      </g>
      {/* Stift */}
      <g transform="rotate(28 450 240)">
        <rect x="440" y="120" width="14" height="190" rx="6" fill="#1B1F2A"/>
        <path d="M440 310 l 7 22 l 7 -22 z" fill="#C7CDD6"/>
        <rect x="440" y="124" width="14" height="10" rx="3" fill="#C7CDD6"/>
      </g>
      {/* Suchrahmen auf dem Blatt */}
      <g className="fi-rahmen" fill="none" stroke={GOLD} strokeWidth="4" strokeLinecap="round">
        <path d="M166 128 v -18 h 18 M394 110 h 18 v 18 M412 318 v 18 h -18 M184 336 h -18 v -18"/>
      </g>
      {/* Handy flach darüber (von unten gesehen: Rückseite mit Kamera) */}
      <g className="fi-handy">
        <rect x="200" y="22" width="160" height="92" rx="18" fill={NACHT} filter="url(#fi-schatten)"/>
        <rect x="206" y="28" width="148" height="80" rx="14" fill="#16305F"/>
        <circle cx="236" cy="58" r="13" fill="#0A1430"/><circle cx="236" cy="58" r="7" fill="#2E58A8"/><circle cx="233" cy="55" r="2.2" fill="#FFFFFF" opacity=".85"/>
        <circle cx="266" cy="58" r="13" fill="#0A1430"/><circle cx="266" cy="58" r="7" fill="#2E58A8"/><circle cx="263" cy="55" r="2.2" fill="#FFFFFF" opacity=".85"/>
        <circle cx="251" cy="86" r="5" fill="#FFF3C4"/>
        <rect x="286" y="48" width="56" height="4" rx="2" fill="#2A4A86"/><rect x="286" y="60" width="40" height="4" rx="2" fill="#2A4A86"/>
        {/* Lichtkegel */}
        <path d="M212 112 L 160 116 L 160 330 L 418 330 L 418 116 L 348 112 Z" fill="#FFFFFF" opacity="0.35"/>
        <ellipse className="fi-blitz" cx="251" cy="86" rx="60" ry="22" fill="#FFF3C4" opacity="0"/>
      </g>
      {/* Hinweis: gerade von oben */}
      <g fill="none" stroke={C.see} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M72 60 v 200"/><path d="M64 68 l 8 -8 l 8 8"/><path d="M64 252 l 8 8 l 8 -8"/>
      </g>
      <text x="72" y="178" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.see} transform="rotate(-90 72 178)" fontFamily="inherit" letterSpacing="0.1em">GERADE VON OBEN</text>
    </svg>
  );
}

function SchrittIcon({ art }) {
  const p = { width: 22, height: 22, fill: "none", stroke: C.see, strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round" };
  if (art === "papier") return <svg viewBox="0 0 24 24" {...p}><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v4h4"/></svg>;
  if (art === "stift") return <svg viewBox="0 0 24 24" {...p}><path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M13 7l3 3"/></svg>;
  if (art === "licht") return <svg viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg>;
  return <svg viewBox="0 0 24 24" {...p}><rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M11 18h2"/></svg>;
}

/* Die Karte, die zum Foto führt: Illustration, drei Bedingungen, großer Knopf */
export function FotoStart({ onKamera, onGalerie, titel = "Blatt fotografieren", untertitel = "Kamera geht direkt auf.", blankoWarum = false }) {
  /* Karo, Linien und jeder Stift sind beim Foto erlaubt. Den Tipp zu Blankopapier und schwarzem Stift gibt Mathilda erst in der Antwort. */
  const schritte = [
    ["handy", "Handy flach über dem Blatt", "Nicht schräg, nicht von der Seite"],
    ["licht", "Gutes Licht", "Fenster oder Lampe, kein Schatten"],
  ];
  return (
    <section style={{ background: C.weiss, borderRadius: 24, boxShadow: "0 10px 40px rgba(15,26,51,0.10)", overflow: "hidden" }}>
      <style>{`
        .fs-knopf { position: relative; width: 100%; display: flex; align-items: center; gap: 14px; padding: 12px 20px 12px 12px; border: none; border-radius: 18px; text-align: left; cursor: pointer; font-family: inherit;
          color: ${NACHT}; background: linear-gradient(135deg, #F6CB2E 0%, ${GOLD} 55%, #D9A600 100%); box-shadow: 0 10px 28px rgba(237,187,0,0.38), inset 0 1px 0 rgba(255,255,255,0.5); transition: transform .15s ease, box-shadow .15s ease; -webkit-tap-highlight-color: transparent; }
        .fs-knopf:hover { transform: translateY(-2px); box-shadow: 0 14px 34px rgba(237,187,0,0.45), inset 0 1px 0 rgba(255,255,255,0.5); }
        .fs-knopf:active { transform: translateY(0); }
        .fs-knopf .fs-kam { width: 64px; height: 64px; border-radius: 18px; background: ${NACHT}; display: flex; align-items: center; justify-content: center; flex: none; box-shadow: 0 4px 12px rgba(14,30,74,0.28); }
        .fs-knopf .fs-titel { display: block; font-size: 20px; font-weight: 800; letter-spacing: -0.015em; line-height: 1.15; white-space: nowrap; }
        .fs-knopf .fs-unter { display: block; font-size: 12.5px; font-weight: 500; line-height: 1.4; margin-top: 3px; opacity: 0.85; }
        .fs-schritte { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px 16px; }
        @media (max-width: 420px) { .fs-schritte { grid-template-columns: 1fr; } }
      `}</style>
      <FotoIllustration />
      <div style={{ padding: "22px 22px 24px" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.see, marginBottom: 12 }}>So klappt das Foto</p>
        <div className="fs-schritte">
          {schritte.map(([art, t, s]) => (
            <div key={art} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ width: 36, height: 36, borderRadius: 12, background: C.himmel, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}><SchrittIcon art={art} /></span>
              <div>
                <p style={{ fontSize: 14.5, fontWeight: 600, lineHeight: 1.3, color: C.tinte }}>{t}</p>
                <p style={{ fontSize: 12.5, color: C.grau, fontWeight: 300, lineHeight: 1.45, marginTop: 2 }}>{s}</p>
              </div>
            </div>
          ))}
        </div>
        <button type="button" className="fs-knopf" onClick={onKamera} style={{ marginTop: 22 }}>
          <span className="fs-kam" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke={GOLD} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>
            </svg>
          </span>
          <span style={{ minWidth: 0 }}>
            <span className="fs-titel">{titel}</span>
            <span className="fs-unter">{untertitel}</span>
          </span>
        </button>
        <button type="button" onClick={onGalerie}
          style={{ width: "100%", marginTop: 10, minHeight: 46, background: "transparent", border: `1.5px solid ${C.linie}`, borderRadius: 14, color: C.see, fontSize: 14, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
          Foto aus der Galerie wählen
        </button>
        {blankoWarum && <BlankoWarum />}
      </div>
    </section>
  );
}

/* Kleiner Input unter dem Scan-Knopf: warum Blankopapier und schwarzer Stift besser zum Arbeiten sind (Konzept Pen & Paper),
   dazu ein Motion-Film in drei Szenen (Karo + blauer Stift → Blanko + schwarzer Stift → Mathilda liest sicher).
   Rein CSS: ein Zyklus von 16 s, jede Szene blendet über denselben Zeitplan ein und aus. Bei „weniger Bewegung“ steht das Schlussbild. */
const BW_BLAU = "#2E4FA8";
export function BlankoWarum() {
  return (
    <section aria-labelledby="bw-titel" style={{ marginTop: 28, paddingTop: 24, borderTop: `1px solid ${C.linie}` }}>
      <style>{`
        .bw-film { position: relative; border-radius: 18px; overflow: hidden; background: linear-gradient(160deg, ${NACHT} 0%, #163A7A 100%); padding: 14px 14px 12px; box-shadow: 0 8px 26px rgba(14,30,74,0.22); }
        .bw-buehne { position: relative; height: 196px; }
        .bw-chip { opacity: 0; position: absolute; left: 0; top: 0; z-index: 3; font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: ${GOLD}; }
        .bw-blatt { position: absolute; left: 0; right: 0; top: 22px; bottom: 0; border-radius: 10px; overflow: hidden; opacity: 0; box-shadow: 0 10px 24px rgba(3,10,30,0.4); }
        .bw-karo { background-color: #F7FAFF; background-image: linear-gradient(#B9C9E4 1px, transparent 1px), linear-gradient(90deg, #B9C9E4 1px, transparent 1px); background-size: 24px 24px; background-position: 6px 4px; }
        .bw-blanko { background: #FFFFFF; }
        .bw-hand { z-index: 1; position: absolute; left: 18px; font-family: Caveat, 'Bradley Hand', cursive; font-weight: 600; white-space: nowrap; line-height: 1; }
        .bw-karo .bw-hand { color: ${BW_BLAU}; font-size: 30px; letter-spacing: 1.5px; }
        .bw-blanko .bw-hand { color: #0B0F1A; font-size: 31px; }
        .bw-z1 { top: 34px; } .bw-z2 { top: 108px; }
        .bw-bruch { display: inline-flex; flex-direction: column; align-items: center; vertical-align: middle; }
        .bw-bruch i { display: block; width: 100%; height: 2px; border-radius: 1px; background: currentColor; margin: 3px 0 2px; }
        .bw-karo .bw-bruch i { background: ${BW_BLAU}; height: 1.6px; }
        .bw-luft { display: inline-block; width: 22px; }
        .bw-eng { letter-spacing: -0.5px; }
        .bw-op { position: relative; display: inline-block; }
        .bw-op::before { content: ""; position: absolute; left: -9px; right: -9px; top: -5px; bottom: -3px; border-radius: 999px; background: rgba(237,187,0,.30); box-shadow: 0 0 0 1.5px rgba(237,187,0,.9); opacity: 0; z-index: -1; }
        .bw-scan { position: absolute; top: 0; bottom: 0; width: 3px; left: 0; z-index: 2; background: linear-gradient(${GOLD}, ${GOLD}); box-shadow: 0 0 14px 4px rgba(237,187,0,.55); opacity: 0; }
        .bw-mark { position: absolute; z-index: 2; width: 22px; height: 22px; border-radius: 999px; display: flex; align-items: center; justify-content: center; font-family: inherit; font-size: 13px; font-weight: 800; opacity: 0; }
        .bw-frage { background: #FFB020; color: #3A2500; box-shadow: 0 0 0 3px rgba(255,176,32,.28); }
        .bw-haken { background: #1F9D55; color: #fff; box-shadow: 0 0 0 3px rgba(31,157,85,.25); }
        .bw-unter { position: relative; height: 70px; margin-top: 12px; }
        .bw-unter p { position: absolute; inset: 0; margin: 0; color: #DCE5F6; font-size: 13.5px; font-weight: 400; line-height: 1.5; opacity: 0; }
        .bw-unter b { color: #fff; font-weight: 700; }
        .bw-punkte { display: flex; gap: 6px; justify-content: center; margin-top: 2px; }
        .bw-punkte i { width: 22px; height: 3px; border-radius: 2px; background: rgba(255,255,255,.2); position: relative; overflow: hidden; }
        .bw-punkte i::after { content: ""; position: absolute; inset: 0; background: ${GOLD}; transform: scaleX(0); transform-origin: left; }

        /* Zeitplan (16 s): A Karo 0–6 s · B Blanko 6–11 s · C Mathilda liest 11–16 s */
        .bw-film.laeuft .bw-A { animation: bwA 16s infinite both; }
        .bw-film.laeuft .bw-B { animation: bwB 16s infinite both; }
        .bw-film.laeuft .bw-schreib1 { animation: bwS1 16s infinite both; }
        .bw-film.laeuft .bw-schreib2 { animation: bwS2 16s infinite both; }
        .bw-film.laeuft .bw-schreibB1 { animation: bwSB1 16s infinite both; }
        .bw-film.laeuft .bw-schreibB2 { animation: bwSB2 16s infinite both; }
        .bw-film.laeuft .bw-op::before { animation: bwPille 16s infinite both; }
        .bw-film.laeuft .bw-scanA { animation: bwScanA 16s infinite both; }
        .bw-film.laeuft .bw-scanB { animation: bwScanB 16s infinite both; }
        .bw-film.laeuft .bw-frage { animation: bwFrage 16s infinite both; }
        .bw-film.laeuft .bw-haken { animation: bwHaken 16s infinite both; }
        .bw-film.laeuft .bw-c1 { animation: bwCap1 16s infinite both; }
        .bw-film.laeuft .bw-c2 { animation: bwCap2 16s infinite both; }
        .bw-film.laeuft .bw-c3 { animation: bwCap3 16s infinite both; }
        .bw-film.laeuft .bw-punkte i:nth-child(1)::after { animation: bwP1 16s infinite both; }
        .bw-film.laeuft .bw-punkte i:nth-child(2)::after { animation: bwP2 16s infinite both; }
        .bw-film.laeuft .bw-punkte i:nth-child(3)::after { animation: bwP3 16s infinite both; }
        @keyframes bwA { 0% { opacity: 0; transform: translateY(8px); } 3%, 36% { opacity: 1; transform: none; } 39%, 100% { opacity: 0; transform: translateY(-6px); } }
        @keyframes bwB { 0%, 37% { opacity: 0; transform: translateY(8px); } 41%, 96% { opacity: 1; transform: none; } 99%, 100% { opacity: 0; transform: translateY(-6px); } }
                @keyframes bwS1 { 0%, 4% { clip-path: inset(-20px 100% -20px -10px); } 14% { clip-path: inset(-20px -20px -20px -10px); } 100% { clip-path: inset(-20px -20px -20px -10px); } }
        @keyframes bwS2 { 0%, 14% { clip-path: inset(-20px 100% -20px -10px); } 24% { clip-path: inset(-20px -20px -20px -10px); } 100% { clip-path: inset(-20px -20px -20px -10px); } }
        @keyframes bwSB1 { 0%, 42% { clip-path: inset(-20px 100% -20px -10px); } 50% { clip-path: inset(-20px -20px -20px -10px); } 100% { clip-path: inset(-20px -20px -20px -10px); } }
        @keyframes bwSB2 { 0%, 50% { clip-path: inset(-20px 100% -20px -10px); } 58% { clip-path: inset(-20px -20px -20px -10px); } 100% { clip-path: inset(-20px -20px -20px -10px); } }
        @keyframes bwPille { 0%, 58% { opacity: 0; transform: scale(.6); } 62%, 100% { opacity: 1; transform: none; } }
        @keyframes bwScanA { 0%, 26% { opacity: 0; left: 0; } 27% { opacity: 1; left: 0; } 33% { opacity: 1; left: calc(100% - 3px); } 34%, 100% { opacity: 0; left: calc(100% - 3px); } }
        @keyframes bwScanB { 0%, 72% { opacity: 0; left: 0; } 73% { opacity: 1; left: 0; } 80% { opacity: 1; left: calc(100% - 3px); } 81%, 100% { opacity: 0; left: calc(100% - 3px); } }
        @keyframes bwFrage { 0%, 30% { opacity: 0; transform: scale(.3); } 33%, 100% { opacity: 1; transform: scale(1); } }
        @keyframes bwHaken { 0%, 77% { opacity: 0; transform: scale(.3); } 81%, 100% { opacity: 1; transform: scale(1); } }
        @keyframes bwCap1 { 0%, 3% { opacity: 0; } 6%, 35% { opacity: 1; } 38%, 100% { opacity: 0; } }
        @keyframes bwCap2 { 0%, 40% { opacity: 0; } 43%, 67% { opacity: 1; } 70%, 100% { opacity: 0; } }
        @keyframes bwCap3 { 0%, 72% { opacity: 0; } 75%, 96% { opacity: 1; } 99%, 100% { opacity: 0; } }
        @keyframes bwP1 { 0% { transform: scaleX(0); } 37% { transform: scaleX(1); } 38%, 100% { transform: scaleX(0); } }
        @keyframes bwP2 { 0%, 38% { transform: scaleX(0); } 69% { transform: scaleX(1); } 70%, 100% { transform: scaleX(0); } }
        @keyframes bwP3 { 0%, 70% { transform: scaleX(0); } 98% { transform: scaleX(1); } 100% { transform: scaleX(0); } }

        /* Weniger Bewegung: Schlussbild (Blanko, schwarzer Stift, sicher gelesen) steht still */
        .bw-film:not(.laeuft) .bw-B, .bw-film:not(.laeuft) .bw-c3 { opacity: 1; }
        .bw-film:not(.laeuft) .bw-op::before, .bw-film:not(.laeuft) .bw-haken, .bw-film:not(.laeuft) .bw-chip.bw-B { opacity: 1; }
        .bw-karten { display: grid; grid-template-columns: 1fr; gap: 12px; margin-top: 18px; }
        @media (min-width: 520px) { .bw-karten { grid-template-columns: 1fr 1fr; } }
        .bw-karte { border-radius: 16px; background: ${C.himmel}; padding: 16px 16px 15px; }
        .bw-karte h3 { margin: 10px 0 6px; font-size: 15.5px; font-weight: 700; letter-spacing: -0.01em; line-height: 1.3; color: ${C.tinte}; }
        .bw-karte p { margin: 0; font-size: 13.5px; font-weight: 300; line-height: 1.6; color: ${C.grau}; }
        .bw-karte p b { font-weight: 600; color: ${C.tinte}; }
      `}</style>
      <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.see, marginBottom: 8 }}>Tipp für dein nächstes Blatt</p>
      <h2 id="bw-titel" style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.25, marginBottom: 8, color: C.tinte }}>
        Warum Blankopapier und schwarzer Stift besser für dich sind
      </h2>
      <p style={{ color: C.grau, fontSize: 14.5, fontWeight: 300, lineHeight: 1.65, marginBottom: 16 }}>
        Dein Blatt ist der Arbeitsplatz deines Denkens. Je klarer es aussieht, desto leichter siehst du selbst, wo dein Weg bricht.
      </p>
      <BlankoFilm />
      <div className="bw-karten">
        <div className="bw-karte">
          <span aria-hidden="true" style={{ width: 34, height: 34, borderRadius: 11, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke={C.see} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3h10l4 4v14H5z" /><path d="M15 3v4h4" /></svg>
          </span>
          <h3>Blankopapier: du bestimmst den Abstand</h3>
          <p>Karo steckt jedes Zeichen in dieselbe Box. Beim Rechnen soll aber <b>Nähe zeigen, was zusammengehört</b>: eng im Term, Luft um Plus und Minus. Dazu ein Schritt pro Zeile, Gleichheitszeichen untereinander.</p>
        </div>
        <div className="bw-karte">
          <span aria-hidden="true" style={{ width: 34, height: 34, borderRadius: 11, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke={C.see} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20l4-1 11-11-3-3L5 16z" /><path d="M13 7l3 3" /></svg>
          </span>
          <h3>Schwarzer Stift: klar und ehrlich</h3>
          <p>Schwarz hat den stärksten Kontrast, auch im Foto. Ohne Radierer streichst du Fehler <b>sichtbar durch</b>, statt sie wegzuwischen. So kannst du deinen Weg morgen noch nachvollziehen.</p>
        </div>
      </div>
      <p style={{ color: C.grau, fontSize: 13.5, fontWeight: 300, lineHeight: 1.65, marginTop: 14 }}>
        Du musst nichts umstellen: Mathilda liest auch Karo und jeden Stift. Probier Blanko und Schwarz einfach beim nächsten Blatt aus.
      </p>
    </section>
  );
}

/* Der Film selbst: Bühne mit drei Szenen, Untertitel und Fortschrittsbalken */
function BlankoFilm() {
  const [laeuft, setLaeuft] = React.useState(true);
  React.useEffect(() => {
    let mq; try { mq = window.matchMedia("(prefers-reduced-motion: reduce)"); } catch { return undefined; }
    const f = () => setLaeuft(!mq.matches);
    f();
    mq.addEventListener ? mq.addEventListener("change", f) : mq.addListener(f);
    return () => (mq.removeEventListener ? mq.removeEventListener("change", f) : mq.removeListener(f));
  }, []);
  return (
    <div className={laeuft ? "bw-film laeuft" : "bw-film"} role="img"
      aria-label="Kurzfilm: Dieselbe Rechnung auf Karopapier mit blauem Stift und auf Blankopapier mit schwarzem Stift. Auf Karo kreuzen Linien die Zeichen, auf Blanko bekommen Plus und Minus Platz und Mathilda liest jede Zeile sicher.">
      <div className="bw-buehne" aria-hidden="true">
        {/* Szene A: Karo, blauer Stift */}
        <span className="bw-chip bw-A">Karo · blauer Stift</span>
        <div className="bw-blatt bw-karo bw-A">
          <div className="bw-hand bw-z1 bw-schreib1">3x² − 4x + 2</div>
          <div className="bw-hand bw-z2 bw-schreib2" style={{ top: 100 }}>
            <span className="bw-bruch"><span>x² − 4</span><i /><span>x − 2</span></span>
          </div>
          <span className="bw-scan bw-scanA" />
          <span className="bw-mark bw-frage" style={{ left: 106, top: 121 }}>?</span>
          <span className="bw-mark bw-frage" style={{ left: 63, top: 22 }}>?</span>
        </div>
        {/* Szene B und C: Blanko, schwarzer Stift – danach liest Mathilda sicher */}
        <span className="bw-chip bw-B">Blanko · schwarzer Stift</span>
        <div className="bw-blatt bw-blanko bw-B">
          <div className="bw-hand bw-z1 bw-schreibB1"><span className="bw-eng">3x²</span><span className="bw-luft" /><span className="bw-op">−</span><span className="bw-luft" /><span className="bw-eng">4x</span><span className="bw-luft" /><span className="bw-op">+</span><span className="bw-luft" />2</div>
          <div className="bw-hand bw-z2 bw-schreibB2" style={{ top: 100 }}>
            <span className="bw-bruch" style={{ padding: "0 6px" }}><span>x²<span className="bw-luft" style={{ width: 16 }} />−<span className="bw-luft" style={{ width: 16 }} />4</span><i /><span>x<span className="bw-luft" style={{ width: 16 }} />−<span className="bw-luft" style={{ width: 16 }} />2</span></span>
          </div>
          <span className="bw-scan bw-scanB" />
          <span className="bw-mark bw-haken" style={{ right: 14, top: 38 }}>✓</span>
          <span className="bw-mark bw-haken" style={{ right: 14, top: 122 }}>✓</span>
        </div>
      </div>
      <div className="bw-unter" aria-hidden="true">
        <p className="bw-c1"><b>Karo:</b> Linien laufen durch deine Zeichen, jedes bekommt gleich viel Platz. Strich oder Karo?</p>
        <p className="bw-c2"><b>Blanko:</b> Plus und Minus bekommen Platz, was zusammengehört, steht eng. So zeigt dein Blatt, wie du rechnest.</p>
        <p className="bw-c3"><b>Schwarz auf Weiß:</b> kräftiger Kontrast. So liest Mathilda jede Zeile sicher und kann dir genauer helfen.</p>
      </div>
      <div className="bw-punkte" aria-hidden="true"><i /><i /><i /></div>
    </div>
  );
}

/* Drei Schritte, wie Mathilda arbeitet – als kleine Zeitleiste */
export function SoArbeitetMathilda() {
  const schritte = [
    ["Du fotografierst", "Ein Foto von oben genügt. Schief, dunkel oder im falschen Format rechnet die App gerade."],
    ["Mathilda liest mit", "Zeile für Zeile. Sie zeigt dir zuerst, was sie gelesen hat, und erst danach, wo der Weg bricht."],
    ["Ein nächster Schritt", "Keine Notenliste, keine zwölf Vorschläge. Genau eine Sache, die du beim nächsten Blatt anders machst."],
  ];
  return (
    <div style={{ position: "relative", paddingLeft: 4 }}>
      {schritte.map(([t, s], i) => (
        <div key={i} style={{ display: "flex", gap: 16, paddingBottom: i < schritte.length - 1 ? 22 : 0, position: "relative" }}>
          {i < schritte.length - 1 && <span aria-hidden="true" style={{ position: "absolute", left: 15, top: 32, bottom: 0, width: 2, background: `linear-gradient(${GOLD}, ${C.linie})` }} />}
          <span style={{ width: 32, height: 32, borderRadius: 999, background: NACHT, color: GOLD, fontSize: 14, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flex: "none", position: "relative" }}>{i + 1}</span>
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 4, color: C.tinte }}>{t}</p>
            <p style={{ color: C.grau, fontSize: 14, fontWeight: 300, lineHeight: 1.65 }}>{s}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
