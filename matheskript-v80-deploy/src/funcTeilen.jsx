/* ======================================================================
   „Dieses Tool teilen“ – Knopf unten auf jeder Tool- und Trainingsseite.
   Ein Tipp klappt zwei Möglichkeiten auf: Link kopieren (der Direct Link
   aus pfade.js) oder per WhatsApp mit fertigem Text senden.
   Texte: teilen.js (TOOL_SAETZE / SEITEN_SAETZE).
   ====================================================================== */
import React, { useState, useEffect, useRef } from "react";
import { C } from "./base1.jsx";
import { englisch } from "./i18n.js";
import { teilenInfo, teilenText, whatsappUrl } from "./teilen.js";

const L = (de, en) => (englisch() ? en : de);

function TeilenIcon({ groesse = 18, farbe = "currentColor" }) {
  return (
    <svg width={groesse} height={groesse} viewBox="0 0 24 24" fill="none" stroke={farbe} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
      <path d="M8.6 10.5l6.8-4M8.6 13.5l6.8 4" />
    </svg>
  );
}
function WhatsAppIcon({ groesse = 18 }) {
  return (
    <svg width={groesse} height={groesse} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91A9.82 9.82 0 0 0 19 4.9 9.82 9.82 0 0 0 12.04 2zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.22-8.23 8.22zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07s.89 2.4 1.01 2.56c.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.23-.16-.48-.29z" />
    </svg>
  );
}

/* Zwischenablage mit Rückfall für ältere Browser */
async function kopieren(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return true; }
  } catch (e) { /* Rückfall */ }
  try {
    const t = document.createElement("textarea");
    t.value = text; t.setAttribute("readonly", ""); t.style.cssText = "position:fixed;top:0;left:0;opacity:0";
    document.body.appendChild(t); t.select(); t.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(t);
    return ok;
  } catch (e) { return false; }
}

/* ansicht: aktuelle Ansicht, pfad: Direct Link-Pfad dieser Seite (z. B. "/ableitungstrainer") */
export function TeilenKnopf({ ansicht, pfad }) {
  const info = teilenInfo(ansicht);
  const [offen, setOffen] = useState(false);
  const [kopiert, setKopiert] = useState(null);   // null | true | false
  const timer = useRef(null);
  useEffect(() => { setOffen(false); setKopiert(null); }, [ansicht, pfad]);
  useEffect(() => () => clearTimeout(timer.current), []);
  if (!info) return null;

  const link = window.location.origin + (pfad || window.location.pathname);
  const text = teilenText(info, link, englisch() ? "en" : "de");

  const linkKopieren = async () => {
    const ok = await kopieren(link);
    setKopiert(ok);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setKopiert(null), 2500);
  };

  return (
    <>
      <style>{`
        .tl-knopf{display:inline-flex;align-items:center;gap:10px;min-height:48px;padding:0 22px;border-radius:999px;cursor:pointer;
          font-family:inherit;font-size:14.5px;font-weight:700;color:#fff;background:${C.see};border:1.5px solid ${C.see};
          box-shadow:0 4px 14px rgba(0,77,152,.22);transition:background .15s ease,color .15s ease}
        .tl-knopf:hover,.tl-knopf:focus-visible{background:${C.seeTief};border-color:${C.seeTief}}
        .tl-panel{width:100%;max-width:440px;margin-top:12px;padding:16px;border-radius:18px;background:#fff;border:1px solid ${C.linie};
          box-shadow:0 6px 22px rgba(14,30,74,.10);box-sizing:border-box}
        .tl-reihe{display:flex;flex-wrap:wrap;gap:10px}
        .tl-aktion{flex:1 1 180px;display:inline-flex;align-items:center;justify-content:center;gap:9px;min-height:46px;padding:0 14px;border-radius:12px;
          cursor:pointer;font-family:inherit;font-size:14px;font-weight:700;text-decoration:none;box-sizing:border-box;
          color:${C.see};background:#fff;border:1.5px solid ${C.see}}
        .tl-aktion:hover,.tl-aktion:focus-visible{background:#EEF3FA}
        .tl-wa{color:#fff;background:#1FA855;border-color:#1FA855}
        .tl-wa:hover,.tl-wa:focus-visible{background:#168A44;border-color:#168A44}
        .tl-ok{margin:10px 2px 0;font-size:13px;font-weight:700;color:#168A44}
        .tl-fehler{margin:10px 2px 0;font-size:13px;font-weight:600;color:#B3261E}
        /* Teilen- und Feedback-Knopf nebeneinander, gleich breit (Wrapper .fuss-paar.zwei in func10.jsx); das Panel steht darunter über die ganze Breite */
        .fuss-paar.zwei{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;padding:28px 16px 4px;max-width:460px;margin:0 auto;box-sizing:border-box}
        .fuss-paar.zwei .fb-fuss{display:contents}
        .fuss-paar.zwei .tl-knopf,.fuss-paar.zwei .fb-knopf{flex:1 1 0;min-width:0;justify-content:center;gap:8px;padding:0 12px;font-size:14px;white-space:nowrap;box-sizing:border-box}
        .fuss-paar.zwei .tl-knopf{order:1}
        .fuss-paar.zwei .fb-knopf{order:2}
        .fuss-paar.zwei .tl-panel{order:3;flex:0 0 100%;max-width:none;margin-top:2px}
        /* Handy: etwas kleinere Schrift, damit „Feedback geben“ samt Symbol in die halbe Breite passt (darunter die Feedback-Seite, funcFeedback.jsx) */
        @media (max-width:439px){.fuss-paar.zwei .tl-knopf,.fuss-paar.zwei .fb-knopf{font-size:13px;gap:7px;padding:0 10px}}
        @media (max-width:349px){.fuss-paar.zwei .tl-knopf svg,.fuss-paar.zwei .fb-knopf svg{display:none}}
      `}</style>
      <button type="button" className="tl-knopf" onClick={() => setOffen((o) => !o)} aria-expanded={offen} aria-label={L("Dieses Tool teilen", "Share this tool")}>
        <TeilenIcon />
        <span>{L("Tool teilen", "Share tool")}</span>
      </button>
      {offen && (
        <div className="tl-panel" role="group" aria-label={L("Tool teilen", "Share tool")}>
          <div className="tl-reihe">
            <button type="button" className="tl-aktion" onClick={linkKopieren}>
              <span aria-hidden="true">🔗</span><span>{L("Link kopieren", "Copy link")}</span>
            </button>
            <a className="tl-aktion tl-wa" href={whatsappUrl(text)} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon /><span>{L("Per WhatsApp senden", "Share via WhatsApp")}</span>
            </a>
          </div>
          {kopiert === true && <p className="tl-ok" role="status">{L("✓ Link kopiert", "✓ Link copied")}</p>}
          {kopiert === false && <p className="tl-fehler" role="status">{L("Kopieren hat nicht geklappt – markiere den Link unten und kopiere ihn von Hand.", "Copying did not work – select the link below and copy it by hand.")}</p>}
        </div>
      )}
    </>
  );
}
