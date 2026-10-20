/* ======================================================================
   ARBEITSMENÜ in der Fußzeile (neben AGB): das frühere Kopfmenü mit
   Startseite, Landingpage, Sprachwechsel und den passwortgeschützten Entwürfen.
   Öffnet sich nach oben; Klick daneben oder Esc schließt es.
   ====================================================================== */
import React, { useEffect, useState } from "react";
import { C } from "./base1.jsx";
import { englisch } from "./i18n.js";
import { ENTWUERFE, WEITERE_SEITEN, LANDING, istFrei, entsperren, EVENT_FREI } from "./seitenKonstanten.js";
import { ANGEBOT } from "./angebot.js";
import { ToolMenue } from "./func2.jsx";
import { AufklappZeichen } from "./aufklappen.jsx";
import { EVENT_START_MODUS, naechsterModus, startModus, startModusSetzen } from "./startModus.js";

export function Arbeitsmenue({ gehe, ansicht, sprachKnopf, stil }) {
  const [offen, setOffen] = useState(false);
  const [baumAuf, setBaumAuf] = useState(false);
  const [frei, setFrei] = useState(istFrei);
  const [modus, setModus] = useState(startModus);   // Startseite dunkel / hell (startModus.js)
  useEffect(() => {
    const h = () => setModus(startModus());
    window.addEventListener(EVENT_START_MODUS, h);
    return () => window.removeEventListener(EVENT_START_MODUS, h);
  }, []);
  const [pwZiel, setPwZiel] = useState(null);   // Seite, die nach dem Passwort geöffnet wird
  const [pw, setPw] = useState("");
  const [pwFehler, setPwFehler] = useState(false);
  useEffect(() => {
    const h = () => setFrei(istFrei());
    window.addEventListener(EVENT_FREI, h);
    return () => window.removeEventListener(EVENT_FREI, h);
  }, []);
  useEffect(() => {
    if (!offen) { setBaumAuf(false); setPwZiel(null); setPw(""); setPwFehler(false); return; }
    const t = (e) => { if (e.key === "Escape") setOffen(false); };
    window.addEventListener("keydown", t);
    return () => window.removeEventListener("keydown", t);
  }, [offen]);
  const geh = (z) => { setOffen(false); gehe(z); };
  /* Geschützte Seite: mit Passwort (Sitzung) direkt öffnen, sonst erst das Passwortfeld zeigen */
  const gesperrt = (ansichtZiel) => {
    if (frei || ANGEBOT.landingpage && ansichtZiel === LANDING) { geh({ ansicht: ansichtZiel }); return; }
    setPwZiel(ansichtZiel); setPw(""); setPwFehler(false);
  };
  const pruefen = async (e) => {
    e.preventDefault();
    const ok = await entsperren(pw);
    if (ok) { const z = pwZiel; setFrei(true); geh({ ansicht: z }); }
    else { setPwFehler(true); setPw(""); }
  };
  const schloss = (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={C.grau} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label={frei ? "Entsperrt" : "Passwortgeschützt"} role="img" style={{ flexShrink: 0 }}>
      <rect x="5" y="11" width="14" height="9.5" rx="2" />{frei ? <path d="M8 11V8a4 4 0 0 1 7.5-1.9" /> : <path d="M8 11V8a4 4 0 0 1 8 0v3" />}
    </svg>
  );
  const geschuetzt = (a, name, nr, eingerueckt) => {
    const an = ansicht === a;
    return (
      <button key={a} type="button" onClick={() => gesperrt(a)} aria-current={an ? "page" : undefined} data-arbeitsmenue-seite={a}
        style={{ ...zeile, ...(eingerueckt ? { width: "calc(100% - 16px)", marginLeft: 16, marginTop: 4 } : null), background: an ? "rgba(237,187,0,0.18)" : eingerueckt ? "#EEF1F6" : "transparent" }}>
        <span style={kreis(an)}>{nr}</span>
        <span style={{ flex: 1, fontSize: 14.5, fontWeight: 700 }}>{name}</span>
        {(!ANGEBOT.landingpage || a !== LANDING) && schloss}
      </button>
    );
  };
  const zeile = { width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left", color: C.tinte };
  const kreis = (an) => ({ width: 28, height: 28, borderRadius: 999, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12.5, fontWeight: 700, background: an ? C.flaggold : C.himmel, color: an ? C.seeTief : C.grau });
  const landAn = ansicht === LANDING;
  const startAn = ansicht === "start";
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
            {geschuetzt(LANDING, "Landingpage", "B")}
            <button type="button" onClick={() => { setOffen(false); sprachKnopf(); }} data-kein-i18n style={{ ...zeile, background: "transparent" }}>
              <span style={kreis(false)}>{englisch() ? "DE" : "EN"}</span>
              <span style={{ flex: 1, fontSize: 14.5, fontWeight: 700 }}>{englisch() ? "Auf Deutsch wechseln" : "Switch to English"}</span>
            </button>
            {/* Startseite dunkel / hell / mix – reihum, wie die Sprachwahl; die Wahl gilt je Browser (startModus.js) */}
            <button type="button" onClick={() => { startModusSetzen(naechsterModus(modus)); geh({ ansicht: "start" }); }} data-arbeitsmenue-modus style={{ ...zeile, background: "transparent" }}>
              <span style={kreis(false)} aria-hidden="true">{{ dunkel: "☀", hell: "◐", mix: "☾" }[modus] || "☀"}</span>
              <span style={{ flex: 1, fontSize: 14.5, fontWeight: 700 }}>{{ dunkel: "Startseite hell", hell: "Startseite mix", mix: "Startseite dunkel" }[modus] || "Startseite hell"}</span>
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
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: C.grau, padding: "12px 12px 2px" }}>ENTWÜRFE</div>
            {ENTWUERFE.map((e, i) => geschuetzt(e.ansicht, e.name, i + 1, true))}
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: C.grau, padding: "12px 12px 2px" }}>WEITERE SEITEN</div>
            {WEITERE_SEITEN.map((e, i) => geschuetzt(e.ansicht, e.name, String.fromCharCode(68 + i), true))}
            {pwZiel && (
              <form onSubmit={pruefen} data-arbeitsmenue-passwort style={{ margin: "10px 4px 4px", padding: 12, borderRadius: 12, background: "#EEF1F6" }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Passwort für diese Seite</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input type="password" value={pw} autoFocus autoComplete="off" aria-label="Passwort" placeholder="Passwort"
                    onChange={(e) => { setPw(e.target.value); setPwFehler(false); }}
                    style={{ flex: 1, minWidth: 0, boxSizing: "border-box", padding: "10px 12px", borderRadius: 10, fontSize: 16, fontFamily: "inherit", color: C.tinte, border: `2px solid ${pwFehler ? "#E5484D" : "transparent"}`, outline: "none", background: "#fff" }} />
                  <button type="submit" style={{ padding: "0 16px", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 14, background: C.flaggold, color: C.seeTief }}>Öffnen</button>
                </div>
                {pwFehler && <div role="alert" style={{ color: "#B3261E", fontSize: 13, marginTop: 6 }}>Das Passwort stimmt nicht.</div>}
              </form>
            )}
          </div>
        </>
      )}
    </span>
  );
}
