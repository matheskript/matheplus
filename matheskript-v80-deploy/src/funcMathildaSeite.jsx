/* Mathilda AI – Kopfbereich, Modus-Wahl und illustrierte Foto-Anleitung.
   Reine Darstellung: die Foto-Logik (Kamera, Galerie, Analyse) bleibt in func10.jsx. */
import React from "react";
import { C } from "./base1.jsx";
import "@fontsource/caveat/600.css";

const GOLD = C.flaggold;
const NACHT = C.seeTief;

/* Mathilda als flache Vektorillustration (nach Fotovorlage gezeichnet, Einverständnis der
   abgebildeten Person einholen): glattes Haar eng am Kopf in Logo-Gold, Kopf leicht geneigt,
   Haut weiß, Züge in Nachtblau, Sonnenbrille mit Goldrahmen, sanftes Lächeln. Sitzt auf jedem Hintergrund. */
export function MathildaBild({ groesse = 220, style, className }) {
  return (
    <svg viewBox="0 0 320 440" width={groesse} height={Math.round(groesse * 440 / 320)} className={className} style={style}
      aria-label="Mathilda" role="img">
  {/* Kopf, leicht geneigt wie auf dem Foto */}
  <g transform="rotate(7 165 330)">
    {/* Haar hinten: eng am Kopf, nach unten nur wenig breiter */}
    <path fill={GOLD} d="M165 86 C 215 86, 248 128, 250 190 C 252 250, 250 330, 262 480 L 68 480 C 80 330, 78 250, 80 190 C 82 128, 115 86, 165 86 Z"/>
    {/* Hals */}
    <path fill="#FFFFFF" d="M144 278 L 188 278 L 188 346 C 176 356, 156 356, 144 346 Z"/>
    <path fill={NACHT} fillOpacity=".12" d="M144 278 L 188 278 C 186 300, 176 312, 166 314 C 156 312, 146 300, 144 278 Z"/>
    {/* Ohr (Haar dahinter geklemmt) */}
    <path fill="#FFFFFF" d="M104 208 C 94 206, 88 218, 90 234 C 92 250, 98 258, 108 258 Z"/>
    <path fill="none" stroke={NACHT} strokeOpacity=".35" strokeWidth="1.6" strokeLinecap="round" d="M98 222 C 95 230, 96 242, 102 248"/>
    {/* Gesicht */}
    <path fill="#FFFFFF" d="M165 102 C 220 102, 236 152, 234 204 C 232 254, 206 300, 165 300 C 124 300, 98 254, 96 204 C 94 152, 110 102, 165 102 Z"/>
    {/* Haar: Kappe über der Stirn (Scheitel etwas links der Mitte) */}
    <path fill={GOLD} d="M80 190 C 82 128, 115 86, 165 86 C 215 86, 248 128, 250 190 L 232 190 C 226 140, 200 108, 172 108 C 164 107, 155 109, 148 112 C 126 116, 108 140, 102 190 Z"/>
    {/* linke Strähne (Betrachter), hinter der Schulter */}
    <path fill={GOLD} d="M102 172 C 94 200, 90 240, 92 280 C 94 320, 86 400, 80 480 L 62 480 C 68 400, 74 300, 76 250 C 76 210, 84 182, 102 172 Z"/>
  </g>
  {/* Schultern + Oberteil */}
  <path fill="#FFFFFF" d="M10 440 C 16 392, 50 362, 100 348 C 124 342, 140 336, 150 330 L 180 330 C 190 336, 206 342, 230 348 C 280 362, 314 392, 320 440 Z"/>
  <path fill={NACHT} d="M58 440 L 62 418 C 110 404, 220 404, 268 418 L 272 440 Z"/>
  <path fill="none" stroke={NACHT} strokeWidth="3" strokeLinecap="round" d="M240 410 L 248 386"/>
  <g transform="rotate(7 165 330)">
    {/* rechte Strähne (Betrachter), fällt über die Schulter */}
    <path fill={GOLD} d="M172 108 C 200 108, 226 140, 232 190 C 236 230, 230 280, 214 340 C 206 380, 204 430, 204 480 L 262 480 C 254 400, 250 330, 252 250 C 252 220, 251 200, 250 190 C 248 128, 215 86, 172 108 Z"/>
    {/* Scheitel und Strähnen */}
    <path fill="none" stroke="#C99D00" strokeWidth="2" strokeLinecap="round" strokeOpacity=".7" d="M150 112 C 152 104, 156 96, 160 90
      M126 122 C 110 142, 100 170, 96 200
      M190 112 C 216 126, 234 160, 240 200 C 246 260, 240 340, 248 420
      M224 300 C 224 340, 220 400, 228 460
      M84 230 C 82 270, 80 320, 76 380"/>
    {/* Augenbrauen: fein, hell */}
    <path fill="none" stroke={NACHT} strokeOpacity=".8" strokeWidth="2.4" strokeLinecap="round" d="M114 158 C 124 151, 144 150, 156 154 M176 154 C 188 150, 208 151, 218 158"/>
    {/* Sonnenbrille */}
    <path d="M104 172 C 126 166, 150 167, 160 172 L 156 206 C 152 220, 140 227, 127 227 C 114 227, 104 220, 102 206 Z" fill={NACHT} stroke={GOLD} strokeWidth="4" strokeLinejoin="round"/>
    <path d="M172 172 C 182 167, 206 166, 228 172 L 230 206 C 228 220, 218 227, 205 227 C 192 227, 180 220, 176 206 Z" fill={NACHT} stroke={GOLD} strokeWidth="4" strokeLinejoin="round"/>
    <path d="M160 177 C 164 171, 168 171, 172 177" fill="none" stroke={GOLD} strokeWidth="4" strokeLinecap="round"/>
    <path d="M104 175 C 98 175, 94 177, 90 182 M228 175 C 234 175, 238 177, 242 182" fill="none" stroke={GOLD} strokeWidth="4" strokeLinecap="round"/>
    <path d="M114 183 L 132 181 M112 191 L 121 190 M186 183 L 204 181 M184 191 L 193 190" stroke="#FFFFFF" strokeOpacity=".7" strokeWidth="2.8" strokeLinecap="round"/>
    {/* Nase: gerade, klein */}
    <path fill="none" stroke={NACHT} strokeWidth="2.4" strokeLinecap="round" d="M166 212 C 165 222, 162 232, 161 238 C 161 242, 165 243, 169 242 C 173 241, 174 238, 172 234"/>
    {/* Mund: geschlossen, sanft */}
    <path fill="none" stroke={NACHT} strokeWidth="3" strokeLinecap="round" d="M146 259 C 155 266, 176 266, 186 258"/>
    <path fill="none" stroke={NACHT} strokeOpacity=".45" strokeWidth="1.6" strokeLinecap="round" d="M152 258 C 160 255, 172 255, 180 257 M154 266 C 162 270, 170 270, 178 266"/>
  </g>
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

/* Briefkasten mit Brief – Symbol der Box „Klausurbriefkasten“ */
function BriefkastenMini() {
  return (
    <svg viewBox="0 0 64 64" width="56" height="56" aria-hidden="true" style={{ display: "block", flex: "none" }}>
      <defs><linearGradient id="mk-bk-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F8D23A" /><stop offset="0.55" stopColor={GOLD} /><stop offset="1" stopColor="#D9A600" /></linearGradient></defs>
      <rect x="29" y="40" width="6" height="20" rx="2" fill="#0A1636" />
      <path d="M12 26c0-9 7-15 16-15h14c8 0 12 6 12 14v18H12z" fill="url(#mk-bk-gold)" />
      <rect x="21" y="27" width="22" height="4" rx="2" fill={NACHT} />
      <path d="M24 6l12-2 2 13-12 2z" fill="#FFFFFF" />
      <path d="M26.5 9.5l8-1.3M27 13l8-1.3" stroke="#004D98" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M50 17v-8h7v5h-7" fill="#004D98" />
      <rect x="49" y="9" width="2" height="18" rx="1" fill="#0A1636" />
    </svg>
  );
}

/* Kopfbereich: Titel dicht am Header, Zweizeiler, goldener Scan-Knopf, rechts Mathilda; darunter die vier Modi */
export function MathildaKopf({ modus, setModus, onScan, onText, onBriefkasten }) {
  return (
    <div className="mathilda-kopf" style={{ background: `radial-gradient(120% 90% at 85% 10%, #163A7A 0%, ${C.see} 35%, ${NACHT} 85%)`, position: "relative", overflow: "hidden" }}>
      <style>{`
        .mathilda-kopf .mk-innen { max-width: 760px; margin: 0 auto; padding: 14px 24px 0; display: grid; grid-template-columns: 1fr auto; gap: 0 18px; align-items: end; }
        .mathilda-kopf .mk-text { align-self: end; padding-top: 26px; padding-bottom: 0; }
        .mathilda-kopf .mk-portraet { position: relative; align-self: end; animation: mk-auf 0.9s cubic-bezier(.2,.8,.2,1) both; margin-right: calc((min(760px, 100vw) - 78px) / 12); }
        .mathilda-kopf .mk-portraet svg { display: block; width: 196px; height: auto; position: relative; }
        .mathilda-kopf .mk-schein { position: absolute; inset: auto -10% 0 -10%; height: 70%; background: radial-gradient(60% 70% at 50% 100%, rgba(237,187,0,0.30), transparent 70%); pointer-events: none; }
        .mathilda-kopf .mk-scan { margin-top: 26px; vertical-align: bottom; display: inline-flex; align-items: center; gap: 12px; padding: 0 22px 0 8px; height: 58px; border: none; border-radius: 999px; cursor: pointer; font-family: inherit;
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
        .mathilda-kopf .mk-bk { max-width: 760px; margin: 0 auto; padding: 0 24px 26px; }
        .mathilda-kopf .mk-bk button { width: 100%; display: flex; align-items: center; gap: 14px; text-align: left; cursor: pointer; font-family: inherit; color: #FFFFFF; border-radius: 18px; padding: 14px 16px;
          border: 1.5px solid rgba(255,255,255,0.16); background: linear-gradient(135deg, rgba(10,22,54,0.85), rgba(29,71,144,0.55)); box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);
          transition: transform .15s ease, border-color .15s ease; -webkit-tap-highlight-color: transparent; }
        .mathilda-kopf .mk-bk button:hover { transform: translateY(-2px); border-color: rgba(237,187,0,0.6); }
        .mathilda-kopf .mk-bk .mk-bk-ober { display: block; font-size: 10.5px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: ${GOLD}; }
        .mathilda-kopf .mk-bk b { display: block; font-size: 16px; font-weight: 700; letter-spacing: -0.01em; margin-top: 1px; }
        .mathilda-kopf .mk-bk .mk-bk-z { display: block; font-size: 12.5px; font-weight: 300; color: #C9D6EE; line-height: 1.45; margin-top: 2px; }
        .mathilda-kopf .mk-bk .mk-bk-schloss { display: inline-flex; align-items: center; gap: 5px; margin-top: 6px; font-size: 11px; font-weight: 600; color: #E6EDF8; background: rgba(255,255,255,0.08); border-radius: 999px; padding: 3px 9px; }
        .mathilda-kopf .mk-ober { color: ${GOLD}; font-size: 14.4px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; margin-bottom: 8px; }
        .mathilda-kopf .mk-titel { font-weight: 700; font-size: 53px; letter-spacing: -0.03em; line-height: .98; margin: 0; }
        .mathilda-kopf .mk-satz { color: #C9D6EE; font-size: 18.6px; font-weight: 300; line-height: 1.5; margin-top: 14px; white-space: nowrap; }
        @keyframes mk-auf { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        @media (max-width: 560px) {
          .mathilda-kopf .mk-innen { grid-template-columns: 1fr 34vw; gap: 0 12px; padding-top: 20px; align-items: stretch; }
          .mathilda-kopf .mk-text { align-self: end; padding: 0; }
          .mathilda-kopf .mk-portraet { margin-right: 0; align-self: stretch; position: relative; }
          .mathilda-kopf .mk-portraet svg { position: absolute; left: calc(50% + 6px); right: auto; translate: -50% 0; bottom: 16px; height: calc(100% - 16px); width: auto; max-width: none; margin: 0; }
          .mathilda-kopf .mk-schein { display: none; }
          .mathilda-kopf .mk-ober { font-size: 11px; letter-spacing: .1em; margin-bottom: 8px; white-space: nowrap; }
          .mathilda-kopf .mk-titel { font-size: 36px; }
          .mathilda-kopf .mk-satz { font-size: 15.6px; line-height: 1.45; margin-top: 8px; white-space: normal; }
          .mathilda-kopf .mk-satz br { display: none; }
          .mathilda-kopf .mk-scan { margin-top: 16px; width: auto; max-width: 100%; white-space: nowrap; justify-content: flex-start; height: 44px; font-size: 13.5px; padding: 0 12px 0 5px; gap: 8px; box-shadow: 0 6px 18px rgba(237,187,0,0.35), inset 0 1px 0 rgba(255,255,255,0.55); }
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
            Sie liest dein Blatt, nicht nur dein Ergebnis –<br />
            {" "}und zeigt dir den einen nächsten Schritt.
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
      {onBriefkasten && (
        <div className="mk-bk">
          <button type="button" onClick={onBriefkasten} data-mathilda-briefkasten>
            <BriefkastenMini />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span className="mk-bk-ober">Mathilda<span style={{ color: "#FFFFFF" }}>AI</span></span>
              <b>Klausurbriefkasten</b>
              <span className="mk-bk-z">Wirf deine zurückgegebene Klassenarbeit ein – Mathilda lernt daraus, bessere Testklausuren für deine Klasse zu bauen.</span>
              <span className="mk-bk-schloss"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke={GOLD} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>Foto wird nicht gespeichert</span>
            </span>
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
