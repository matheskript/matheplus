/* ======================================================================
   Mathilda-Modus · der goldene Knopf (leicht, wird überall geladen)
   Das Fenster selbst (funcMathildaModus.jsx) lädt erst beim ersten Tippen.
   · <MathildaModusKnopf a={aufgabe} />        große Variante mit „oder auf Papier“
   · <MathildaModusKnopf kompakt />            goldene Pille, z. B. neben „Ich hänge fest“
   Ohne a übernimmt das Fenster die Aufgabe aus der Karte, in der der Knopf steht
   (weiße, abgerundete Karte oder nächster Vorfahre mit data-mm-karte).
   Keine base-Datei darf diese Datei importieren.
   ====================================================================== */
import React, { Suspense, lazy, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { C } from "./base1.jsx";
import { zw } from "./ui2.jsx";
import { modusMoeglich } from "./mathildaModus.js";

const MathildaModusFenster = lazy(() => import("./funcMathildaModus.jsx"));

const GOLD = C.flaggold, NACHT = C.seeTief;
const goldVerlauf = `linear-gradient(135deg, #F8D23A 0%, ${GOLD} 55%, #D9A600 100%)`;
const KNOPF_STIL = `
@keyframes mmmGlanz { 0% { transform: translateX(-120%) skewX(-18deg); } 55%, 100% { transform: translateX(260%) skewX(-18deg); } }
.mmm-knopf { position: relative; overflow: hidden; transition: transform .15s ease, box-shadow .15s ease; }
.mmm-knopf:hover { transform: translateY(-1px); box-shadow: 0 10px 26px rgba(237,187,0,0.45), inset 0 1px 0 rgba(255,255,255,0.6); }
.mmm-knopf:active { transform: translateY(1px) scale(.99); }
.mmm-knopf::after { content: ""; position: absolute; top: 0; bottom: 0; left: 0; width: 34%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent); animation: mmmGlanz 4.2s ease-in-out 1.2s infinite; pointer-events: none; }
.mmm-knopf:focus-visible { outline: 3px solid ${C.see}; outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) { .mmm-knopf::after { animation: none; } }
`;

function istKarte(el) {
  try {
    const st = getComputedStyle(el);
    const r = parseFloat(st.borderTopLeftRadius) || 0;
    const weiss = /rgb\(255, 255, 255\)/.test(st.backgroundColor);
    return weiss && r >= 10 && el.getBoundingClientRect().height > 90;
  } catch (e) { return false; }
}
export function aufgabenKarte(start) {
  let el = start && start.parentElement;
  for (let i = 0; el && i < 14; i++, el = el.parentElement) {
    if (el.hasAttribute && el.hasAttribute("data-mm-karte")) return el;
    if (istKarte(el)) return el;
  }
  return null;
}
function Laden() {
  return (
    <div role="status" style={{ position: "fixed", inset: 0, zIndex: 950, background: "rgba(6,12,32,0.62)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ width: 44, height: 44, borderRadius: 999, background: NACHT, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 0 2px ${GOLD}` }}>
        <span style={{ width: 12, height: 12, borderRadius: 999, background: GOLD }} />
      </span>
    </div>
  );
}

/* ---------- Der goldene Knopf ----------
   a: Aufgabe aus einem Generator (trainingDaten) – dann Aufgabe, ähnliche Aufgabe und Lösung von der App.
   Ohne a: Die Aufgabe wird beim Öffnen aus der Karte übernommen, in der der Knopf steht
   (oder aus dem nächsten Vorfahren mit data-mm-karte); die Musterlösung schreibt Mathilda.
   kompakt: kleine goldene Pille (neben „Ich hänge fest“), sonst der große Knopf mit „oder auf Papier“. */
export function MathildaModusKnopf({ a, aehnliche, onErgebnis, kompakt = false }) {
  const [auf, setAuf] = useState(null);   // null | { karte }
  const ref = useRef(null);
  if (a && !modusMoeglich(a)) return null;
  const oeffnen = () => setAuf({ karte: a ? null : aufgabenKarte(ref.current) });
  const fenster = auf && createPortal(
    <Suspense fallback={<Laden />}>
      <MathildaModusFenster a={a || null} karte={auf.karte} aehnliche={a ? aehnliche : null} onSchliessen={() => setAuf(null)} onErgebnis={onErgebnis} />
    </Suspense>, document.body);
  if (kompakt) {
    return (
      <>
        <style>{KNOPF_STIL}</style>
        <button ref={ref} type="button" className="mmm-knopf mm-weg" onClick={oeffnen} data-mathilda-modus="kompakt" aria-haspopup="dialog"
          title={zw("Auf Papier rechnen und das Foto an Mathilda schicken", "Work on paper and send the photo to Mathilda")}
          style={{ display: "inline-flex", alignItems: "center", gap: 7, height: 34, padding: "0 13px 0 5px", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "inherit",
            fontSize: 13, fontWeight: 800, color: NACHT, background: goldVerlauf, boxShadow: "0 4px 12px rgba(237,187,0,0.35), inset 0 1px 0 rgba(255,255,255,0.55)", whiteSpace: "nowrap", flexShrink: 0, alignSelf: "center" }}>
          <span aria-hidden="true" style={{ width: 25, height: 25, borderRadius: 999, background: NACHT, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke={GOLD} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20l4-1 11-11-3-3L5 16z" /><path d="M14 6l3 3" /></svg>
          </span>
          {zw("Mathilda-Modus", "Mathilda mode")}
        </button>
        {fenster}
      </>
    );
  }
  return (
    <>
      <style>{KNOPF_STIL}</style>
      <div aria-hidden="true" className="mm-weg" style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0 10px", color: C.hellgrau, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
        <span style={{ flex: 1, height: 1, background: C.linie }} />{zw("oder auf Papier", "or on paper")}<span style={{ flex: 1, height: 1, background: C.linie }} />
      </div>
      <button ref={ref} type="button" className="mmm-knopf mm-weg" onClick={oeffnen} data-mathilda-modus aria-haspopup="dialog"
        style={{ width: "100%", minHeight: 56, borderRadius: 16, border: "none", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 12, padding: "8px 14px 8px 10px", textAlign: "left",
          color: NACHT, background: goldVerlauf, boxShadow: "0 8px 22px rgba(237,187,0,0.38), inset 0 1px 0 rgba(255,255,255,0.55)" }}>
        <span aria-hidden="true" style={{ width: 40, height: 40, borderRadius: 12, background: NACHT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 20l4-1 11-11-3-3L5 16z" /><path d="M14 6l3 3" /></svg></span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 16, fontWeight: 800, lineHeight: 1.2 }}>{zw("Mathilda-Modus", "Mathilda mode")}</span>
          <span style={{ display: "block", fontSize: 12.5, fontWeight: 600, lineHeight: 1.3, opacity: 0.8 }}>{zw("Auf Papier rechnen · Foto an Mathilda", "Work on paper · photo to Mathilda")}</span>
        </span>
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={NACHT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg>
      </button>
      {fenster}
    </>
  );
}
