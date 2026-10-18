/* ======================================================================
   AnimKarte – aufklappbare Karte für eine Erkläranimation („Motion-Video“)
   im Stil der übrigen Erkläranimationen (Zahlenräume, Trigonometrie).
   szenen: { [art]: { titel(), unter(), szene() } } – szene() liefert das
   Objekt für den Player aus funcErklaeranimation.jsx.
   Keine base-Datei darf diese Datei importieren.
   ====================================================================== */
import React, { useId, useState } from "react";
import { C } from "./base1.jsx";
import { Player } from "./funcErklaeranimation.jsx";
import { zw } from "./ui2.jsx";

export function AnimKarte({ szenen, art, offen: start = false, merkmal = "data-anim" }) {
  const [offen, setOffen] = useState(start);
  const id = useId();
  const a = szenen[art];
  if (!a) return null;
  return (
    <div {...{ [merkmal]: art }} style={{ background: C.weiss, border: `1px solid ${C.linie}`, borderRadius: 16, boxShadow: "0 2px 16px rgba(15,26,51,0.07)", margin: "16px 0", overflow: "hidden" }}>
      <button type="button" aria-expanded={offen} aria-controls={id} onClick={() => setOffen((o) => !o)} className="erk-knopf"
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
        <span aria-hidden="true" style={{ width: 42, height: 42, borderRadius: 999, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
          background: "radial-gradient(130% 150% at 90% 10%, #2A2210 0%, #0E0C08 55%, #050404 100%)", border: `1px solid ${C.flaggold}` }}>
          <svg width="16" height="16" viewBox="0 0 18 18"><path d="M5 2.5v13l11-6.5z" fill={C.flaggold} /></svg>
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.gruenDunkel, marginBottom: 2 }}>{zw("Erkläranimation", "Explainer animation")}</span>
          <span style={{ display: "block", fontSize: 15.5, fontWeight: 700, color: C.tinte, lineHeight: 1.3 }}>{a.titel()}</span>
          <span style={{ display: "block", fontSize: 12.5, fontWeight: 400, color: C.grau, lineHeight: 1.45, marginTop: 2 }}>{a.unter()}</span>
        </span>
        <span aria-hidden="true" style={{ width: 34, height: 34, borderRadius: 999, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: offen ? C.see : "#EEF2F8" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={offen ? C.weiss : C.see} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: offen ? "rotate(180deg)" : "none", transition: "transform .2s ease" }}><path d="M6 9l6 6 6-6" /></svg>
        </span>
      </button>
      {offen && <div id={id} data-aufklapp-inhalt="" style={{ padding: "2px 16px 18px" }}><Player szene={a.szene()} /></div>}
    </div>
  );
}
