/* Mathilda AI – Kopfbereich, Modus-Wahl und illustrierte Foto-Anleitung.
   Reine Darstellung: die Foto-Logik (Kamera, Galerie, Analyse) bleibt in func10.jsx. */
import React from "react";
import { C } from "./base1.jsx";
import "@fontsource/caveat/600.css";

const GOLD = C.flaggold;
const NACHT = C.seeTief;

/* Mathilda als Scherenschnitt: Haar in Logo-Gold, Gesicht und Oberteil weiß,
   Augen, Mund und Sonnenbrille als Ausschnitte in der Hintergrundfarbe. */
export function MathildaBild({ groesse = 220, hintergrund = NACHT, style, className }) {
  return (
    <svg viewBox="0 0 320 380" width={groesse} height={Math.round(groesse * 380 / 320)} className={className} style={style}
      aria-label="Mathilda" role="img">
      <g>
        <path fill={GOLD} d="M160 40 C 104 40, 72 84, 74 142 C 75 186, 62 232, 46 276 C 36 302, 40 326, 54 346 L 100 346 C 94 300, 104 258, 106 220 C 106 194, 102 166, 108 136 Z"/>
        <path fill={GOLD} d="M160 40 C 216 40, 248 84, 246 142 C 245 186, 258 232, 274 276 C 284 302, 280 326, 266 346 L 220 346 C 226 300, 216 258, 214 220 C 214 194, 218 166, 212 136 Z"/>
        <path fill="#FFFFFF" d="M136 246 L 184 246 L 188 276 C 228 284, 258 306, 266 346 L 54 346 C 62 306, 92 284, 132 276 Z"/>
        <path fill={GOLD} d="M106 214 C 96 246, 90 290, 94 346 L 122 346 C 118 300, 118 262, 112 230 Z"/>
        <g fill={GOLD}>
          <circle cx="82" cy="330" r="3"/><circle cx="104" cy="318" r="3"/><circle cx="126" cy="334" r="3"/>
          <circle cx="146" cy="316" r="3"/><circle cx="166" cy="332" r="3"/><circle cx="186" cy="316" r="3"/>
          <circle cx="208" cy="334" r="3"/><circle cx="228" cy="320" r="3"/><circle cx="246" cy="336" r="3"/>
          <circle cx="160" cy="296" r="3"/><circle cx="130" cy="298" r="3"/><circle cx="190" cy="298" r="3"/>
        </g>
        <path fill="#FFFFFF" d="M160 68 C 202 68, 220 102, 220 146 C 220 192, 202 230, 176 246 C 166 252, 154 252, 144 246 C 118 230, 100 192, 100 146 C 100 102, 118 68, 160 68 Z"/>
        <path fill={GOLD} d="M160 36 C 110 36, 82 70, 88 122 C 98 102, 112 90, 134 88 C 146 86, 152 90, 150 96 C 164 86, 190 86, 210 100 C 222 106, 228 114, 232 122 C 238 70, 210 36, 160 36 Z"/>
        <path fill={GOLD} d="M92 110 C 84 140, 90 180, 100 212 C 104 196, 104 162, 106 134 Z"/>
        <path fill={GOLD} d="M228 110 C 236 140, 230 180, 220 212 C 216 196, 216 162, 214 134 Z"/>
        <g fill={hintergrund}>
          <path d="M126 54 C 136 44, 154 44, 160 50 C 166 44, 184 44, 194 54 C 192 56, 190 57, 188 57 C 182 50, 170 50, 165 56 C 162 60, 158 60, 155 56 C 150 50, 138 50, 132 57 C 130 57, 128 56, 126 54 Z"/>
          <path d="M128 58 C 136 52, 150 52, 156 58 C 156 68, 150 76, 142 76 C 134 76, 128 68, 128 58 Z"/>
          <path d="M192 58 C 184 52, 170 52, 164 58 C 164 68, 170 76, 178 76 C 186 76, 192 68, 192 58 Z"/>
          <path d="M126 56 C 112 58, 104 70, 100 88 L 104 90 C 108 76, 116 66, 128 60 Z"/>
          <path d="M194 56 C 208 58, 216 70, 220 88 L 216 90 C 212 76, 204 66, 192 60 Z"/>
          <path d="M114 132 C 124 120, 142 120, 152 128 C 150 130, 148 131, 146 130 C 136 126, 126 128, 118 136 C 116 136, 114 134, 114 132 Z"/>
          <path d="M206 132 C 196 120, 178 120, 168 128 C 170 130, 172 131, 174 130 C 184 126, 194 128, 202 136 C 204 136, 206 134, 206 132 Z"/>
          <path d="M116 154 C 124 140, 144 140, 152 154 C 150 156, 148 156, 146 154 C 140 146, 128 146, 122 154 C 120 156, 118 156, 116 154 Z"/>
          <path d="M204 154 C 196 140, 176 140, 168 154 C 170 156, 172 156, 174 154 C 180 146, 192 146, 198 154 C 200 156, 202 156, 204 154 Z"/>
          <path d="M110 150 C 112 146, 114 146, 116 148 L 112 154 Z"/>
          <path d="M210 150 C 208 146, 206 146, 204 148 L 208 154 Z"/>
          <path d="M158 170 C 153 178, 150 186, 155 190 C 158 192, 162 192, 165 190 L 164 187 C 160 189, 156 188, 156 184 C 156 180, 159 176, 161 172 Z"/>
          <path d="M128 204 C 138 200, 150 202, 160 204 C 170 202, 182 200, 192 204 C 188 220, 176 230, 160 230 C 144 230, 132 220, 128 204 Z"/>
        </g>
        <path fill="#FFFFFF" d="M135 208 C 144 207, 152 208, 160 208 C 168 208, 176 207, 185 208 C 181 214, 170 218, 160 218 C 150 218, 139 214, 135 208 Z"/>
        <g fill="none" stroke={hintergrund} strokeWidth="2.2" strokeLinecap="round" opacity="0.9">
          <path d="M84 150 C 82 200, 70 250, 60 300"/>
          <path d="M96 128 C 96 190, 84 250, 76 320"/>
          <path d="M236 150 C 238 200, 250 250, 260 300"/>
          <path d="M224 128 C 224 190, 236 250, 244 320"/>
          <path d="M112 258 C 108 290, 106 316, 108 344"/>
          <path d="M118 60 C 112 70, 106 84, 104 100"/>
          <path d="M202 60 C 208 70, 214 84, 216 100"/>
        </g>
        <circle cx="100" cy="196" r="10" fill="none" stroke={GOLD} strokeWidth="3.5"/>
        <circle cx="220" cy="196" r="10" fill="none" stroke={GOLD} strokeWidth="3.5"/>
      </g>
    </svg>
  );
}

/* Kleines rundes Icon (Menü, Kacheln): Mathilda im Kreis */
export function MathildaIcon({ groesse = 40, hintergrund = NACHT, style }) {
  return (
    <span style={{ display: "inline-flex", width: groesse, height: groesse, borderRadius: 999, background: hintergrund, overflow: "hidden",
      alignItems: "flex-end", justifyContent: "center", flex: "none", ...style }}>
      <MathildaBild groesse={groesse * 0.82} hintergrund={hintergrund} style={{ display: "block", marginBottom: -groesse * 0.04 }} />
    </span>
  );
}

export const MODI = [
  { id: "blatt", name: "Blatt prüfen", kurz: "Dein Rechenweg, Zeile für Zeile",
    sprech: "Zeig mir dein Blatt. Ich lese mit und sag dir genau, wo der Weg bricht." },
  { id: "weg", name: "Weg prüfen", kurz: "Vom Papier in den Editor",
    sprech: "Fotografiere deinen Rechenweg. Ich übertrage ihn in Zeilen und prüfe jede einzelne." },
  { id: "aufgabe", name: "Aufgabe scannen", kurz: "Drei neue derselben Sorte",
    sprech: "Zeig mir eine Aufgabe aus dem Buch. Ich erkenne den Typ und bau dir drei neue zum Üben." },
  { id: "chat", name: "Mathilda fragen", kurz: "Sie fragt zurück, bevor sie verrät",
    sprech: "Frag mich, was du willst. Ich kenne deinen Stand und frage zurück, bevor ich etwas verrate." },
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

/* Kopfbereich: Titel, Sprechblase, Porträt und die vier Modi als Kacheln */
export function MathildaKopf({ modus, setModus }) {
  const m = MODI.find((x) => x.id === modus) || MODI[0];
  return (
    <div className="mathilda-kopf" style={{ background: `radial-gradient(120% 90% at 85% 10%, #163A7A 0%, ${C.see} 35%, ${NACHT} 85%)`, position: "relative", overflow: "hidden" }}>
      <style>{`
        .mathilda-kopf .mk-innen { max-width: 760px; margin: 0 auto; padding: 36px 24px 8px; display: grid; grid-template-columns: 1fr auto; gap: 8px 18px; align-items: end; }
        .mathilda-kopf .mk-portraet { position: relative; align-self: end; margin-bottom: -8px; animation: mk-auf 0.9s cubic-bezier(.2,.8,.2,1) both; }
        .mathilda-kopf .mk-schein { position: absolute; inset: auto 0 0 0; height: 60%; background: radial-gradient(60% 70% at 50% 100%, rgba(237,187,0,0.28), transparent 70%); pointer-events: none; }
        .mathilda-kopf .mk-blase { position: relative; background: #FFFFFF; color: ${NACHT}; border-radius: 4px 18px 18px 18px; padding: 14px 16px; font-size: 15px; line-height: 1.55; font-weight: 500; box-shadow: 0 8px 28px rgba(5,12,40,0.35); margin-top: 18px; animation: mk-auf 0.9s 0.15s cubic-bezier(.2,.8,.2,1) both; }
        .mathilda-kopf .mk-blase::after { content: ""; position: absolute; right: 60px; top: -9px; width: 18px; height: 18px; background: #FFFFFF; clip-path: polygon(0 100%, 50% 0, 100% 100%); }
        .mathilda-kopf .mk-modi { max-width: 760px; margin: 0 auto; padding: 18px 24px 26px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        .mathilda-kopf .mk-modus { text-align: left; border: 1.5px solid rgba(255,255,255,0.14); background: rgba(255,255,255,0.06); color: #DCE5F6; border-radius: 16px; padding: 12px 12px 11px; font-family: inherit; cursor: pointer; display: flex; flex-direction: column; gap: 8px; transition: transform .15s ease, background .15s ease, border-color .15s ease; -webkit-tap-highlight-color: transparent; }
        .mathilda-kopf .mk-modus:hover { transform: translateY(-2px); background: rgba(255,255,255,0.1); }
        .mathilda-kopf .mk-modus[data-aktiv="1"] { background: #FFFFFF; color: ${NACHT}; border-color: #FFFFFF; box-shadow: 0 10px 26px rgba(5,12,40,0.35), inset 0 -4px 0 ${GOLD}; }
        .mathilda-kopf .mk-modus b { display: block; font-size: 14px; font-weight: 700; letter-spacing: -0.01em; line-height: 1.2; }
        .mathilda-kopf .mk-modus span { display: block; font-size: 12px; font-weight: 400; line-height: 1.4; opacity: .85; }
        @keyframes mk-auf { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        .mathilda-kopf .mk-portraet svg { display: block; width: 196px; height: auto; position: relative; }
        @media (max-width: 560px) {
          .mathilda-kopf .mk-innen { grid-template-columns: 1fr 132px; gap: 6px 10px; padding-top: 28px; }
          .mathilda-kopf .mk-portraet svg { width: 132px; }
          .mathilda-kopf .mk-blase { margin-top: 4px; }
          .mathilda-kopf .mk-blase::after { right: 50px; }
          .mathilda-kopf .mk-modi { grid-template-columns: repeat(2, 1fr); padding-bottom: 22px; }
        }
        @media (prefers-reduced-motion: reduce) { .mathilda-kopf .mk-portraet, .mathilda-kopf .mk-blase { animation: none; } }
      `}</style>
      <div className="mk-innen">
        <div style={{ paddingBottom: 10 }}>
          <p style={{ color: GOLD, fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>Deine Mathe-Begleiterin</p>
          <h1 className="titel-silber" style={{ fontWeight: 700, fontSize: 44, letterSpacing: "-0.03em", lineHeight: 0.98, margin: 0 }}>
            Mathilda<span style={{ color: GOLD }}>AI</span>
          </h1>
          <p style={{ color: "#C9D6EE", fontSize: 15.5, fontWeight: 300, lineHeight: 1.6, marginTop: 14, maxWidth: 420 }}>
            Sie liest dein Blatt, nicht nur dein Ergebnis. Und sie sagt dir immer nur den einen nächsten Schritt.
          </p>
        </div>
        <div className="mk-portraet">
          <div className="mk-schein" />
          <MathildaBild groesse={196} hintergrund="#12305F" style={{ display: "block", position: "relative" }} />
        </div>
        <div className="mk-blase" key={m.id} style={{ gridColumn: "1 / -1", marginTop: 10 }}>{m.sprech}</div>
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
export function FotoStart({ onKamera, onGalerie, titel = "Blatt fotografieren", untertitel = "Kamera geht direkt auf. Ein Foto von oben genügt." }) {
  const schritte = [
    ["papier", "Weißes Blankopapier", "Kein Karo, keine Linien"],
    ["stift", "Schwarzer Stift", "Kein Blau, kein Bleistift"],
    ["handy", "Handy flach über dem Blatt", "Nicht schräg, nicht von der Seite"],
    ["licht", "Gutes Licht", "Fenster oder Lampe, kein Schatten"],
  ];
  return (
    <section style={{ background: C.weiss, borderRadius: 24, boxShadow: "0 10px 40px rgba(15,26,51,0.10)", overflow: "hidden" }}>
      <style>{`
        .fs-knopf { position: relative; width: 100%; display: flex; align-items: center; gap: 16px; padding: 20px 22px; border: none; border-radius: 18px; text-align: left; cursor: pointer; font-family: inherit;
          color: ${NACHT}; background: linear-gradient(135deg, #F6CB2E 0%, ${GOLD} 55%, #D9A600 100%); box-shadow: 0 10px 28px rgba(237,187,0,0.38), inset 0 1px 0 rgba(255,255,255,0.5); transition: transform .15s ease, box-shadow .15s ease; -webkit-tap-highlight-color: transparent; }
        .fs-knopf:hover { transform: translateY(-2px); box-shadow: 0 14px 34px rgba(237,187,0,0.45), inset 0 1px 0 rgba(255,255,255,0.5); }
        .fs-knopf:active { transform: translateY(0); }
        .fs-knopf .fs-pfeil { margin-left: auto; width: 40px; height: 40px; border-radius: 999px; background: ${NACHT}; color: ${GOLD}; display: flex; align-items: center; justify-content: center; flex: none; }
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
          <span style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(14,30,74,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke={NACHT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>
            </svg>
          </span>
          <span>
            <span style={{ display: "block", fontSize: 18, fontWeight: 800, letterSpacing: "-0.01em", lineHeight: 1.15 }}>{titel}</span>
            <span style={{ display: "block", fontSize: 13, fontWeight: 500, lineHeight: 1.45, marginTop: 3, opacity: 0.85 }}>{untertitel}</span>
          </span>
          <span className="fs-pfeil" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </span>
        </button>
        <button type="button" onClick={onGalerie}
          style={{ width: "100%", marginTop: 10, minHeight: 46, background: "transparent", border: `1.5px solid ${C.linie}`, borderRadius: 14, color: C.see, fontSize: 14, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
          Foto aus der Galerie wählen
        </button>
      </div>
    </section>
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
