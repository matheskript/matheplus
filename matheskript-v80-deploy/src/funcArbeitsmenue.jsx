/* ======================================================================
   ARBEITSMENÜ in der Fußzeile (neben AGB): das frühere Kopfmenü mit
   Startseite, Landingpage, Sprachwechsel und den passwortgeschützten Entwürfen.
   Öffnet sich nach oben; Klick daneben oder Esc schließt es.
   ====================================================================== */
import React, { useEffect, useState } from "react";
import { C } from "./base1.jsx";
import { englisch } from "./i18n.js";
import { ENTWUERFE, LANDING, istFrei } from "./seitenKonstanten.js";
import { ANGEBOT } from "./angebot.js";
import { ToolMenue } from "./func2.jsx";
import { AufklappZeichen } from "./aufklappen.jsx";

export function Arbeitsmenue({ gehe, ansicht, sprachKnopf, stil }) {
  const [offen, setOffen] = useState(false);
  const [baumAuf, setBaumAuf] = useState(false);
  useEffect(() => {
    if (!offen) { setBaumAuf(false); return; }
    const t = (e) => { if (e.key === "Escape") setOffen(false); };
    window.addEventListener("keydown", t);
    return () => window.removeEventListener("keydown", t);
  }, [offen]);
  const geh = (z) => { setOffen(false); gehe(z); };
  const zeile = { width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left", color: C.tinte };
  const kreis = (an) => ({ width: 28, height: 28, borderRadius: 999, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12.5, fontWeight: 700, background: an ? C.flaggold : C.himmel, color: an ? C.seeTief : C.grau });
  const landAn = ansicht === LANDING;
  const startAn = ansicht === "start";
  /* Landingpage und passwortgeschützte Entwürfe erscheinen öffentlich erst mit dem Angebot „Landingpage“ (angebot.js); mit dem Passwort immer */
  const intern = ANGEBOT.landingpage || istFrei();
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <button type="button" onClick={() => setOffen(!offen)} aria-expanded={offen} data-kein-scroll data-arbeitsmenue style={stil}>
        Arbeitsmenü
      </button>
      {offen && (
        <>
          <div onClick={() => setOffen(false)} aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 60 }} />
          <div role="dialog" aria-label="Arbeitsmenü" style={{ position: "fixed", bottom: 16, left: "50%", transform: "translateX(-50%)", zIndex: 61, maxHeight: "calc(100dvh - 32px)", overflowY: "auto",
            width: "min(320px, calc(100vw - 24px))", background: C.weiss, borderRadius: 14, boxShadow: "0 14px 40px rgba(8,23,59,0.4)", padding: 8, color: C.tinte, textAlign: "left" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: C.grau, padding: "8px 12px 6px" }}>ARBEITSMENÜ · SEITE WECHSELN</div>
            <button type="button" onClick={() => geh({ ansicht: "start" })} aria-current={startAn ? "page" : undefined} style={{ ...zeile, background: startAn ? "rgba(237,187,0,0.14)" : "transparent" }}>
              <span style={kreis(startAn)}>A</span><span style={{ flex: 1, fontSize: 14.5, fontWeight: 700 }}>Startseite</span>
            </button>
            {intern && <button type="button" onClick={() => geh({ ansicht: LANDING })} aria-current={landAn ? "page" : undefined} style={{ ...zeile, background: landAn ? "rgba(237,187,0,0.14)" : "transparent" }}>
              <span style={kreis(landAn)}>B</span><span style={{ flex: 1, fontSize: 14.5, fontWeight: 700 }}>Landingpage</span>
            </button>}
            <button type="button" onClick={() => { setOffen(false); sprachKnopf(); }} data-kein-i18n style={{ ...zeile, background: "transparent" }}>
              <span style={kreis(false)}>{englisch() ? "DE" : "EN"}</span>
              <span style={{ flex: 1, fontSize: 14.5, fontWeight: 700 }}>{englisch() ? "Auf Deutsch wechseln" : "Switch to English"}</span>
            </button>
            {/* Das frühere ☰-Menü „Menü mit allen Bereichen“ der Werkzeugseiten: alle Bereiche mit allen Werkzeugen */}
            <button type="button" onClick={() => setBaumAuf(!baumAuf)} aria-expanded={baumAuf} data-kein-scroll data-arbeitsmenue-bereiche
              style={{ ...zeile, justifyContent: "space-between", background: baumAuf ? "rgba(237,187,0,0.14)" : "transparent" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={kreis(baumAuf)}>C</span>
                <span style={{ fontSize: 14.5, fontWeight: 700 }}>Alle Bereiche</span>
              </span>
              <AufklappZeichen auf={baumAuf} groesse={16} />
            </button>
            {baumAuf && (
              <div data-aufklapp-inhalt data-scroll-box data-sprung="menue-alle-bereiche" style={{ margin: "2px 4px 6px 8px", padding: "0 4px 4px" }}>
                <ToolMenue eingebettet gehe={geh} schliessen={() => setOffen(false)} aktuell={ansicht} />
              </div>
            )}
            {intern && ENTWUERFE.map((e, i) => {
              const an = ansicht === e.ansicht;
              return (
                <button key={e.ansicht} type="button" onClick={() => geh({ ansicht: e.ansicht })} aria-current={an ? "page" : undefined}
                  style={{ ...zeile, width: "calc(100% - 16px)", marginLeft: 16, marginTop: i === 0 ? 6 : 4, background: an ? "rgba(237,187,0,0.18)" : "#EEF1F6" }}>
                  <span style={kreis(an)}>{i + 1}</span>
                  <span style={{ flex: 1, fontSize: 14.5, fontWeight: 700 }}>{e.name}</span>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={C.grau} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Passwortgeschützt" role="img" style={{ flexShrink: 0 }}>
                    <rect x="5" y="11" width="14" height="9.5" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" />
                  </svg>
                </button>
              );
            })}
          </div>
        </>
      )}
    </span>
  );
}
