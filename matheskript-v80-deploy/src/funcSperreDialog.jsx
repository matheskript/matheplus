/* Passwort-Fenster für gesperrte Bereiche (Mathilda AI). Gleiche Sperre wie die Entwürfe:
   Passwort „skript“, im Code nur als SHA-256 (seitenKonstanten.js), gilt für die Browser-Sitzung. */
import React, { useEffect, useRef, useState } from "react";
import { entsperren } from "./seitenKonstanten.js";
import { C } from "./base1.jsx";
import { mitMathildaAI } from "./mathildaName.jsx";

export function SperreDialog({ titel = "Mathilda AI", onFrei, onZu }) {
  const [pw, setPw] = useState("");
  const [fehler, setFehler] = useState(false);
  const feld = useRef(null);
  useEffect(() => {
    const t = setTimeout(() => { try { feld.current && feld.current.focus(); } catch (e) { /* ignorieren */ } }, 30);
    const taste = (e) => { if (e.key === "Escape") onZu(); };
    window.addEventListener("keydown", taste);
    return () => { clearTimeout(t); window.removeEventListener("keydown", taste); };
  }, [onZu]);
  const pruefen = async (e) => {
    e.preventDefault();
    if (await entsperren(pw)) onFrei(); else { setFehler(true); setPw(""); }
  };
  return (
    <div role="dialog" aria-modal="true" aria-label={`${titel} – Passwort`} data-sperre-dialog
      onClick={(e) => { if (e.target === e.currentTarget) onZu(); }}
      style={{ position: "fixed", inset: 0, zIndex: 9000, background: "rgba(8,23,59,0.72)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18,
        fontFamily: "Montserrat, system-ui, sans-serif" }}>
      <form onSubmit={pruefen} style={{ width: "100%", maxWidth: 380, background: C.seeTief, border: "1px solid rgba(255,255,255,0.16)", borderRadius: 18, padding: "28px 24px",
        textAlign: "center", color: "#fff", boxShadow: "0 18px 50px rgba(0,0,0,0.45)" }}>
        <span style={{ width: 54, height: 54, borderRadius: 999, border: `2px solid ${C.flaggold}`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke={C.flaggold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="5" y="11" width="14" height="10" rx="2.2" /><path d="M8 11V7.5a4 4 0 0 1 8 0V11" />
          </svg>
        </span>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "14px 0 0", letterSpacing: "-0.02em" }}>{mitMathildaAI(titel, true)}</h1>
        <p style={{ fontSize: 14, lineHeight: 1.5, color: "#DCE5F5", margin: "8px 0 18px" }}>Dieser Bereich ist noch nicht öffentlich. Bitte Passwort eingeben.</p>
        <input ref={feld} type="password" value={pw} autoComplete="off" aria-label="Passwort" placeholder="Passwort"
          onChange={(e) => { setPw(e.target.value); setFehler(false); }}
          style={{ width: "100%", boxSizing: "border-box", padding: "13px 14px", borderRadius: 10, fontSize: 16, fontFamily: "inherit", color: C.tinte,
            border: `2px solid ${fehler ? "#E5484D" : "transparent"}`, outline: "none", background: "#fff" }} />
        {fehler && <div role="alert" style={{ color: "#FFB4B4", fontSize: 13, marginTop: 8 }}>Das Passwort stimmt nicht.</div>}
        <button type="submit" style={{ marginTop: 14, width: "100%", padding: "13px 0", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "inherit",
          fontSize: 15.5, fontWeight: 800, color: C.seeTief, background: C.flaggold }}>Entsperren</button>
        <button type="button" onClick={onZu}
          style={{ marginTop: 12, background: "none", border: "none", color: "#C9D6EE", fontSize: 13.5, fontFamily: "inherit", cursor: "pointer", textDecoration: "underline" }}>
          Abbrechen
        </button>
      </form>
    </div>
  );
}
