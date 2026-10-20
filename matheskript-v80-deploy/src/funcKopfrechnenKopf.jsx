/* ======================================================================
   KOPFRECHNEN – Kopfbereich im Mathilda-Look (Stand 20.10.2026)

   Tiefes Nachtblau mit radialem Licht, goldener Kicker, große Headline,
   leichter Untertitel – dieselbe Sprache wie der Mathilda-Kopf
   (funcMathildaSeite.jsx). Darunter sitzen die Glas-Karten der Trainer.
   Reine Darstellung; die Logik bleibt in func14 / funcHeadNumbers.
   Keine base-Datei darf diese Datei importieren.
   ====================================================================== */
import React from "react";
import { C } from "./base1.jsx";
import { GOLD, NACHT, NACHT_VERLAUF, GOLD_PILLE } from "./kopfTraining.jsx";

export const KOPF_CSS = `
  .kr-kopf{background:${NACHT_VERLAUF};color:#fff;position:relative;overflow:hidden}
  .kr-kopf .kr-k-innen{max-width:620px;margin:0 auto;padding:22px 24px 0}
  .kr-kopf .kr-k-zurueck{display:inline-flex;align-items:center;gap:6px;background:none;border:none;padding:0;margin:0 0 14px;color:#C9D6EE;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;-webkit-tap-highlight-color:transparent}
  .kr-kopf .kr-k-zurueck:hover{color:#fff}
  .kr-kopf .kr-k-ober{color:${GOLD};font-size:12.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;margin-bottom:8px}
  .kr-kopf .kr-k-titel{font-weight:800;font-size:clamp(34px, 9.5vw, 50px);letter-spacing:-0.03em;line-height:.98;margin:0}
  .kr-kopf .kr-k-titel .gold{background:linear-gradient(180deg,#FFE58A 0%,${GOLD} 55%,#C9931A 100%);-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent}
  .kr-kopf .kr-k-satz{color:#C9D6EE;font-size:clamp(14.5px, 4vw, 17.5px);font-weight:300;line-height:1.5;margin-top:12px;max-width:520px}
  .kr-kopf .kr-k-unten{max-width:620px;margin:0 auto;padding:18px 24px 26px}
  .kr-kopf .kr-k-modi{display:flex;gap:4px;background:rgba(255,255,255,0.08);border:1.5px solid rgba(255,255,255,0.14);border-radius:999px;padding:3px;margin:18px 0 0}
  .kr-kopf .kr-k-modus{flex:1;height:40px;border:none;border-radius:999px;font-family:inherit;font-size:14px;font-weight:700;cursor:pointer;color:#C9D6EE;background:transparent;transition:background .15s,color .15s;-webkit-tap-highlight-color:transparent;white-space:nowrap}
  .kr-kopf .kr-k-modus[aria-pressed="true"]{background:${GOLD_PILLE};color:${NACHT};box-shadow:0 4px 14px rgba(237,187,0,0.35), inset 0 1px 0 rgba(255,255,255,0.5)}
  .kr-kopf .kr-k-ende{height:22px;background:${C.sand};border-radius:20px 20px 0 0}
  @media (max-width:420px){.kr-kopf .kr-k-innen,.kr-kopf .kr-k-unten{padding-left:18px;padding-right:18px}.kr-kopf .kr-k-ober{font-size:11px;letter-spacing:.1em}.kr-kopf .kr-k-modus{font-size:13px}}

  /* Kompakt (Trainer- und Lernpfad-Seiten, Wunsch 21.10.): Kicker links + Zurück-Pille rechts in einer Zeile,
     darunter Badge + Titel in EINER Zeile, darunter ein beschreibender Satz in EINER Zeile. Schriftgröße
     passt sich per Containerbreite an (cqw), Ellipse nur als Sicherung. */
  .kr-kopf.kompakt .kr-k-innen{padding-top:16px;padding-bottom:18px;container-type:inline-size}
  .kr-kopf.kompakt .kr-k-zeile{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px;min-height:32px}
  .kr-kopf.kompakt .kr-k-ober{margin:0;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .kr-kopf.kompakt .kr-k-zurueck{flex:none;margin:0;height:32px;padding:0 13px 0 9px;border-radius:999px;background:rgba(255,255,255,0.08);border:1.5px solid rgba(255,255,255,0.18);color:#E3EAF7;font-size:12.5px;white-space:nowrap;transition:background .15s,border-color .15s,color .15s}
  .kr-kopf.kompakt .kr-k-zurueck:hover{background:rgba(255,255,255,0.14);border-color:rgba(237,187,0,0.6);color:#fff}
  .kr-kopf.kompakt .kr-k-zurueck:focus-visible{outline:3px solid ${GOLD};outline-offset:2px}
  .kr-kopf.kompakt .kr-k-titelzeile{display:flex;align-items:center;gap:12px;min-width:0}
  .kr-kopf.kompakt .kr-k-badge{flex:none;display:inline-flex;align-items:center;justify-content:center;height:36px;padding:0 10px;border-radius:11px;font-size:15px;font-weight:800;letter-spacing:-0.01em;white-space:nowrap;box-shadow:0 4px 12px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.35)}
  .kr-kopf.kompakt .kr-k-titel{flex:1;min-width:0;font-size:var(--kr-titel-gr);line-height:1.1;letter-spacing:-0.025em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .kr-kopf.kompakt .kr-k-satz{margin-top:7px;max-width:none;font-size:var(--kr-satz-gr);line-height:1.4;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
`;

/* Schriftgröße so wählen, dass ein Text der Länge n in eine Zeile passt (Breite = Container minus abzug px).
   faktor = mittlere Zeichenbreite in em für Montserrat im jeweiligen Schnitt. */
const passend = (text, grund, min, faktor, abzug = 0) => {
  const n = Math.max(1, String(text || "").length);
  return `max(${min}px, min(${grund}, calc((100cqw - ${abzug}px) / ${(n * faktor).toFixed(2)})))`;
};
/* Grundgrößen: auf allen Trainerseiten gleich groß; nur ein ungewöhnlich langer Text wird kleiner */
const TITEL_GRUND = "clamp(22px, 6.8cqw, 32px)";
const SATZ_GRUND = "clamp(13.5px, 4.2cqw, 16.5px)";

/* Der dunkle Kopf. kinder = Inhalt unter der Headline (Modus-Leiste, Karten …) */
export function KopfrechnenKopf({ kicker, titel, satz, zurueck, onZurueck, kinder, modi, modus, setModus, kompakt = false, badge = null }) {
  if (kompakt) {
    /* titel und satz sind hier reiner Text (für die Größenanpassung). badge = { zeichen, farbe, text } */
    const titelGr = passend(titel, TITEL_GRUND, 17, 0.6, badge ? 64 : 0);
    const satzGr = passend(satz, SATZ_GRUND, 12, 0.54);
    return (
      <div className="kr-kopf kompakt" data-kr-kopf data-kr-kompakt style={{ "--kr-titel-gr": titelGr, "--kr-satz-gr": satzGr }}>
        <style>{KOPF_CSS}</style>
        <div className="kr-k-innen">
          <div className="kr-k-zeile">
            <p className="kr-k-ober">{kicker}</p>
            {zurueck && (
              <button type="button" className="kr-k-zurueck" onClick={onZurueck} data-kr-zurueck>
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
                {zurueck}
              </button>
            )}
          </div>
          <div className="kr-k-titelzeile">
            {badge && <span className="kr-k-badge" aria-hidden="true" style={{ background: badge.farbe, color: badge.text || "#fff" }}>{badge.zeichen}</span>}
            <h1 className="kr-k-titel" title={titel}>{titel}</h1>
          </div>
          {satz && <p className="kr-k-satz" title={satz}>{satz}</p>}
        </div>
        <div className="kr-k-ende" style={{ height: 16, borderRadius: "16px 16px 0 0" }} />
      </div>
    );
  }
  return (
    <div className="kr-kopf" data-kr-kopf>
      <style>{KOPF_CSS}</style>
      <div className="kr-k-innen">
        {zurueck && (
          <button type="button" className="kr-k-zurueck" onClick={onZurueck} data-kr-zurueck>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
            {zurueck}
          </button>
        )}
        <p className="kr-k-ober">{kicker}</p>
        <h1 className="kr-k-titel">{titel}</h1>
        {satz && <p className="kr-k-satz">{satz}</p>}
        {modi && (
          <div className="kr-k-modi" role="group" aria-label="Modus">
            {modi.map(([id, name]) => (
              <button key={id} type="button" className="kr-k-modus" aria-pressed={modus === id} onClick={() => setModus(id)}>{name}</button>
            ))}
          </div>
        )}
      </div>
      {kinder ? <div className="kr-k-unten">{kinder}</div> : <div style={{ height: 22 }} />}
      <div className="kr-k-ende" />
    </div>
  );
}

/* Glas-Karte im Kopf (Trainer-Kachel): Symbol-Badge in der Trainerfarbe, Titel, Slogan */
export const KARTEN_CSS = `
  .kr-karten{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .kr-karte{position:relative;min-height:112px;display:flex;flex-direction:column;justify-content:flex-end;text-align:left;color:#fff;border-radius:18px;padding:14px 14px 13px;overflow:hidden;cursor:pointer;font-family:inherit;
    border:1.5px solid rgba(255,255,255,0.16);background:linear-gradient(135deg, rgba(10,22,54,0.85), rgba(29,71,144,0.55));box-shadow:inset 0 1px 0 rgba(255,255,255,0.08);
    transition:transform .15s ease, border-color .15s ease;-webkit-tap-highlight-color:transparent;container-type:inline-size}
  .kr-karte:hover{transform:translateY(-2px);border-color:rgba(237,187,0,0.6)}
  .kr-karte:active{transform:scale(0.98)}
  .kr-karte:focus-visible{outline:3px solid ${GOLD};outline-offset:-3px}
  .kr-karte .kr-badge{position:absolute;top:12px;right:12px;height:34px;padding:0 10px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;letter-spacing:-0.01em;white-space:nowrap;box-shadow:0 4px 12px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.35)}
  .kr-karte .kr-titel{display:block;font-size:clamp(12.5px, 8.6cqw, 18px);font-weight:800;letter-spacing:-0.02em;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-right:4px}
  .kr-karte .kr-slogan{display:block;margin-top:4px;font-size:11.5px;font-weight:300;color:#C9D6EE;line-height:1.35}
  .kr-karte.breit{min-height:96px;flex-direction:row;align-items:center;gap:14px;justify-content:flex-start}
  .kr-karte.breit .kr-badge{position:static;flex:none;height:44px;font-size:16px;border-radius:13px}
  .kr-karte.breit .kr-text{flex:1;min-width:0}
  @media (max-width:340px){.kr-karten{grid-template-columns:1fr}.kr-karte{flex-direction:row;align-items:center;gap:14px;justify-content:flex-start;min-height:88px}.kr-karte .kr-badge{position:static;flex:none}.kr-karte .kr-text{flex:1;min-width:0}}
`;

export function KopfKarte({ titel, slogan, zeichen, farbe, text = "#fff", breit = false, onClick, label }) {
  return (
    <button type="button" className={"kr-karte" + (breit ? " breit" : "")} onClick={onClick} aria-label={label || `${titel} öffnen`}>
      <span className="kr-badge" aria-hidden="true" style={{ background: farbe, color: text }}>{zeichen}</span>
      <span className="kr-text">
        <span className="kr-titel">{titel}</span>
        <span className="kr-slogan">{slogan}</span>
      </span>
    </button>
  );
}
