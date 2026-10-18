/* Startseiten-Kachel des Kurses Vektoren, Geraden und Ebenen (direkt unter der
   Kachel Differentialrechnung, über der Mathe Masterclass). Gleicher Aufbau wie
   funcDiffKursKachel.jsx, in coolem Lila mit warmem Gold. Eigene kleine Datei,
   damit die Startseite den Kurs selbst nicht mitladen muss. */
import React from "react";
import { C } from "./base1.jsx";

/* module = Zahl der Module in KURS_MODULE (funcVekKurs.jsx) */
export function VekKursKachel({ onClick, module = 31 }) {
  return (
    <button type="button" onClick={onClick} className="vk-kachel" aria-label="Kurs Vektoren, Geraden und Ebenen öffnen"
      style={{ display: "flex", width: "calc(100% + 32px)", marginLeft: -16, marginRight: -16, marginTop: 12, padding: 0, border: "none", borderRadius: 18, overflow: "hidden",
        cursor: "pointer", fontFamily: "inherit", textAlign: "left", position: "relative", minHeight: "calc(104px + 1.1 * clamp(15px, 4.1vw, 22px))",
        background: `linear-gradient(150deg, ${C.violettNacht} 0%, ${C.violettTief} 58%, ${C.violett} 100%)`, color: C.weiss,
        boxShadow: "0 10px 30px rgba(61,26,158,0.38), inset 0 0 0 1px rgba(199,179,255,0.35)" }}>
      <style>{`.vk-kachel{transition:transform .15s ease, box-shadow .15s ease}
        .vk-kachel:active{transform:scale(0.985)}
        @media (hover:hover){.vk-kachel:hover{transform:translateY(-2px);box-shadow:0 14px 36px rgba(124,77,255,0.5)}}
        .vk-kachel:focus-visible{outline:3px solid ${C.violettGold};outline-offset:3px}`}</style>
      <div style={{ flex: "1 1 63%", minWidth: 0, padding: "14px 10px 14px 16px", display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", color: C.violettGold }}>KURS</span>
        <h2 style={{ fontSize: "clamp(15px, 4.1vw, 22px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, margin: "2px 0 0", textWrap: "balance" }}>
          Vektoren, Geraden und Ebenen
        </h2>
        <span aria-hidden="true" style={{ display: "block", width: 34, height: 2.5, borderRadius: 2, marginTop: 6, background: C.violettGold }} />
        <p style={{ fontSize: 12.5, fontWeight: 500, lineHeight: 1.4, margin: "6px 0 0", color: "rgba(255,255,255,0.84)" }}>
          Jedes Kapitel aus unserem Heft lesen – und direkt darunter trainieren.
        </p>
        <span style={{ marginTop: "auto", paddingTop: 8, fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, color: C.weiss }}>
          Kurs starten
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8.5 4l4 4-4 4" stroke={C.violettGold} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
      </div>
      <div style={{ flex: "0 0 37%", position: "relative", background: C.violettNebel, borderLeft: "1px solid rgba(199,179,255,0.5)" }}>
        <span style={{ position: "absolute", top: 10, left: 10, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", background: C.violettNacht, color: C.weiss,
          padding: "3px 7px", borderRadius: 999, zIndex: 1 }}>{module} MODULE</span>
        <svg aria-hidden="true" viewBox="0 0 120 90" preserveAspectRatio="xMidYMid meet" style={{ position: "absolute", inset: "30px 8px 8px 6px", width: "calc(100% - 14px)", height: "calc(100% - 38px)" }}>
          <path d="M34 80 V14 M34 80 H116 M34 80 L8 90" stroke={C.violettHell} strokeWidth="1.3" fill="none" />
          <path d="M14 74 L76 64 L110 22 L48 32 Z" fill="rgba(124,77,255,0.18)" stroke={C.violett} strokeWidth="1.6" />
          <line x1="6" y1="20" x2="116" y2="82" stroke={C.violettNacht} strokeWidth="3" strokeLinecap="round" />
          <line x1="62" y1="51.6" x2="74" y2="12" stroke={C.violettGold} strokeWidth="2.6" strokeLinecap="round" />
          <path d="M74 12 l-6.5 5 l6 3.2 z" fill={C.violettGold} />
          <circle cx="62" cy="51.6" r="4.2" fill={C.violettGold} stroke={C.weiss} strokeWidth="1.5" />
          <text x="94" y="40" fontSize="13" fontStyle="italic" fontWeight="700" fill={C.violettTief} fontFamily="Montserrat, sans-serif">E</text>
        </svg>
      </div>
    </button>
  );
}
