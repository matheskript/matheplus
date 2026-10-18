/* ======================================================================
   WILLKOMMEN NACH DEM PASSWORT
   Direkt nach dem Passwort (middleware.js setzt dafür das kurze Cookie
   „mm_willkommen“) liegt 9 Sekunden lang diese Seite über der App:
   der Text schreibt sich schlicht in 6 Sekunden (ohne Cursor und ohne
   weitere Effekte), danach steht alles 3 Sekunden ruhig. Dann blendet sie
   sich aus und die App darunter ist schon geladen. Ein Tipp auf den Knopf
   beendet die Seite sofort und öffnet die Feedback-Auswahl.
   Die Zeiten stehen in willkommen.js.
   ====================================================================== */
import React, { useEffect, useRef, useState } from "react";
import { C } from "./base1.jsx";
import { SprechblaseIcon } from "./funcFeedback.jsx";
import {
  COOKIE_WILLKOMMEN, SCHREIB_MS, GESAMT_MS, FEEDBACK_OEFFNEN,
  geschriebeneZeichen, zaehleZeichen, willkommenCookieGesetzt,
} from "./willkommen.js";

/* Text in Blöcken: [Text, Stil]. Stil: "fett", "gold" oder leer. */
const BLOECKE = [
  { tag: "h1", teile: [["Du gehörst zu den Ersten, die Mythos Mathe testen dürfen."]] },
  { tag: "p", teile: [["Trainiere dich in Mathe, hab Spaß und probier alles aus."]] },
  { tag: "p", teile: [["Sag uns, was dir gefällt und was dir noch fehlt."]] },
  { tag: "p", klasse: "mw-schluss", teile: [["Dein Feedback ist für uns ", "fett"], ["Gold", "gold"], [" wert.", "fett"], [" So wie es diese Seite für dich sein wird."]] },
];
const ALLE_TEXTE = BLOECKE.flatMap((b) => b.teile.map((t) => t[0]));
const ANZAHL = zaehleZeichen(ALLE_TEXTE);
const VORLESETEXT = BLOECKE.map((b) => b.teile.map((t) => t[0]).join("")).join(" ");

const CSS = `
  .mw-wrap{position:fixed;inset:0;z-index:500;display:flex;flex-direction:column;align-items:center;overflow-y:auto;overscroll-behavior:contain;
    background:linear-gradient(170deg,#0B1E4A 0%,#004D98 100%);color:#fff;
    font-family:Montserrat,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
    padding:calc(env(safe-area-inset-top,0px) + 22px) 24px calc(env(safe-area-inset-bottom,0px) + 22px);transition:opacity .5s ease}
  .mw-kopf{width:100%;max-width:480px}
  .mw-logo{font-size:20px;font-weight:800;letter-spacing:-.02em;text-transform:uppercase;margin:0}
  .mw-silber{background:linear-gradient(180deg,#fff 0%,#E3E8EF 35%,#B9C2CE 60%,#8E97A6 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
  .mw-logogold{background:linear-gradient(180deg,#FFE58A 0%,#EDBB00 45%,#E2B53C 70%,#A67C00 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
  .mw-innen{width:100%;max-width:480px;flex:1;display:flex;flex-direction:column;justify-content:center;gap:26px;padding:24px 0}
  .mw-text h1{margin:0;font-size:clamp(26px,7.4vw,34px);line-height:1.18;font-weight:800;letter-spacing:-.01em}
  .mw-text p{margin:14px 0 0;font-size:17px;line-height:1.6}
  .mw-text .mw-schluss{color:${C.goldText};font-size:16px}
  .mw-fett{font-weight:700;color:#fff}
  .mw-goldwort{font-weight:800;color:${C.flaggold}}
  .mw-wort{display:inline-block;white-space:nowrap}
  .mw-hinweis{display:flex;flex-direction:column;align-items:center;gap:4px;padding-top:12px}
  .mw-hinweis p{margin:0;max-width:260px;text-align:center;font-size:13px;font-weight:600;line-height:1.45;color:${C.goldText}}
  .mw-knopf{display:inline-flex;align-items:center;gap:10px;min-height:48px;padding:0 22px;border-radius:999px;cursor:pointer;
    font-family:inherit;font-size:14.5px;font-weight:700;color:${C.see};background:${C.weiss};border:1.5px solid ${C.see};
    box-shadow:0 0 0 4px rgba(237,187,0,.5),0 4px 14px rgba(0,0,0,.25)}
  .mw-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
  @media (prefers-reduced-motion:reduce){
    .mw-wrap{transition:none}
  }
  @media print{.mw-wrap{display:none}}
`;

export default function WillkommenOverlay() {
  const [phase, setPhase] = useState(() => {
    try { return willkommenCookieGesetzt(document.cookie) ? "zeigt" : "weg"; } catch (e) { return "weg"; }
  });
  const [anzahl, setAnzahl] = useState(0);
  const overflowAlt = useRef(null);

  /* Zeitablauf: 6 s schreiben, 3 s ruhig stehen, dann ausblenden, nach weiteren 0,5 s entfernen */
  useEffect(() => {
    if (phase === "weg") return undefined;
    try { document.cookie = `${COOKIE_WILLKOMMEN}=; Path=/; Max-Age=0; SameSite=Lax`; } catch (e) { /* egal */ }
    const ohneBewegung = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const t0 = performance.now();
    let raf = 0;
    if (ohneBewegung) {
      setAnzahl(ANZAHL);
    } else {
      const takt = (jetzt) => {
        const k = geschriebeneZeichen(jetzt - t0, ANZAHL, SCHREIB_MS);
        setAnzahl(k);
        if (k < ANZAHL) raf = requestAnimationFrame(takt);
      };
      raf = requestAnimationFrame(takt);
    }
    const t1 = setTimeout(() => setPhase((p) => (p === "zeigt" ? "blendet" : p)), GESAMT_MS);
    const t2 = setTimeout(() => setPhase("weg"), GESAMT_MS + 500);
    return () => { cancelAnimationFrame(raf); clearTimeout(t1); clearTimeout(t2); };
  }, []);

  /* Solange die Seite liegt, scrollt die App darunter nicht mit */
  useEffect(() => {
    if (phase === "zeigt" && overflowAlt.current === null) {
      overflowAlt.current = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    if (phase === "weg" && overflowAlt.current !== null) {
      document.body.style.overflow = overflowAlt.current;
      overflowAlt.current = null;
    }
  }, [phase]);
  useEffect(() => () => {
    if (overflowAlt.current !== null) document.body.style.overflow = overflowAlt.current;
  }, []);

  if (phase === "weg") return null;

  const zuFeedback = () => {
    setPhase("weg");
    window.dispatchEvent(new Event(FEEDBACK_OEFFNEN));
  };

  /* Zeichen für Zeichen sichtbar machen; Wörter bleiben zusammen, das Layout steht von Anfang an */
  let nr = 0;
  const zeichen = (text, stil, schluessel) => text.split(/(\s+)/).filter(Boolean).map((stueck, i) => {
    if (/^\s+$/.test(stueck)) return " ";
    const buchstaben = [...stueck].map((z) => {
      const index = nr++;
      return (
        <span key={index} style={{ opacity: index < anzahl ? 1 : 0 }}>{z}</span>
      );
    });
    return <span key={`${schluessel}-${i}`} className="mw-wort">{buchstaben}</span>;
  });
  const stilKlasse = (stil) => (stil === "fett" ? "mw-fett" : stil === "gold" ? "mw-goldwort" : undefined);

  return (
    <div data-kein-i18n className="mw-wrap" role="dialog" aria-label="Willkommen bei Mythos Mathe"
      style={{ opacity: phase === "blendet" ? 0 : 1, pointerEvents: phase === "blendet" ? "none" : "auto" }}>
      <style>{CSS}</style>

      <div className="mw-kopf">
        <p className="mw-logo"><span className="mw-silber">mythos</span><span className="mw-logogold">mathe</span><span className="mw-silber">.de</span></p>
      </div>

      <div className="mw-innen">
        <div className="mw-text" aria-hidden="true">
          {BLOECKE.map((b, bi) => {
            const Tag = b.tag;
            return (
              <Tag key={bi} className={b.klasse}>
                {b.teile.map(([text, stil], ti) => <span key={ti} className={stilKlasse(stil)}>{zeichen(text, stil, `${bi}-${ti}`)}</span>)}
              </Tag>
            );
          })}
        </div>
        <span className="mw-sr">{VORLESETEXT}</span>
      </div>

      <div className="mw-hinweis">
        <p>Diesen Button findest du unten auf jeder Seite.</p>
        <svg width="40" height="34" viewBox="0 0 40 34" fill="none" stroke={C.flaggold} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 3 V28" />
          <path d="M9 18 L20 29 L31 18" />
        </svg>
        <button type="button" className="mw-knopf" onClick={zuFeedback} aria-label="Feedback geben">
          <SprechblaseIcon groesse={18} farbe={C.flaggold} />
          <span>Feedback geben</span>
        </button>
      </div>
    </div>
  );
}
