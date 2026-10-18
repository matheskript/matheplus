/* Startseiten-Kachel des Kurses Differentialrechnung (über der Mathe Masterclass).
   Babyblau, Schwarz, Weiß und sehr dunkles Gold. Bewusst eigene kleine Datei,
   damit die Startseite den Kurs selbst nicht mitladen muss. */
import React from "react";
import { C } from "./base1.jsx";

/* module = Zahl der Module in KURS_MODULE (funcDiffKurs.jsx) */
export function DiffKursKachel({ onClick, module = 15 }) {
  return (
    <button type="button" onClick={onClick} className="dk-kachel" aria-label="Kurs Differentialrechnung öffnen"
      style={{ display: "flex", width: "calc(100% + 32px)", marginLeft: -16, marginRight: -16, marginTop: 12, padding: 0, border: "none", borderRadius: 18, overflow: "hidden",
        cursor: "pointer", fontFamily: "inherit", textAlign: "left", position: "relative", minHeight: "calc(104px + 1.1 * clamp(15px, 4.1vw, 22px))",
        background: `linear-gradient(150deg, ${C.babyblauHell} 0%, ${C.babyblau} 55%, ${C.babyblauTief} 100%)`, color: C.nachtschwarz,
        boxShadow: "0 10px 30px rgba(60,130,190,0.28), inset 0 0 0 1px rgba(255,255,255,0.7)" }}>
      <style>{`.dk-kachel{transition:transform .15s ease, box-shadow .15s ease}
        .dk-kachel:active{transform:scale(0.985)}
        @media (hover:hover){.dk-kachel:hover{transform:translateY(-2px);box-shadow:0 14px 36px rgba(60,130,190,0.38)}}
        .dk-kachel:focus-visible{outline:3px solid ${C.golddunkel};outline-offset:3px}`}</style>
      <div style={{ flex: "1 1 63%", minWidth: 0, padding: "14px 10px 14px 16px", display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", color: C.golddunkel }}>KURS</span>
        <h2 style={{ fontSize: "clamp(15px, 4.1vw, 22px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, margin: "2px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          Differentialrechnung
        </h2>
        <span aria-hidden="true" style={{ display: "block", width: 34, height: 2.5, borderRadius: 2, marginTop: 6, background: C.golddunkel }} />
        <p style={{ fontSize: 12.5, fontWeight: 500, lineHeight: 1.4, margin: "6px 0 0", color: "#1A2230" }}>
          Jedes Kapitel aus unserem Schulbuch lesen – und direkt darunter trainieren.
        </p>
        <span style={{ marginTop: "auto", paddingTop: 8, fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, color: C.nachtschwarz }}>
          Kurs starten
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8.5 4l4 4-4 4" stroke={C.golddunkel} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
      </div>
      <div style={{ flex: "0 0 37%", position: "relative", background: C.weiss, borderLeft: `1px solid rgba(11,12,16,0.08)` }}>
        <span style={{ position: "absolute", top: 10, left: 10, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", background: C.nachtschwarz, color: C.weiss,
          padding: "3px 7px", borderRadius: 999, zIndex: 1 }}>{module} MODULE</span>
        <svg aria-hidden="true" viewBox="0 0 120 90" preserveAspectRatio="xMidYMid meet" style={{ position: "absolute", inset: "30px 8px 8px 6px", width: "calc(100% - 14px)", height: "calc(100% - 38px)" }}>
          <path d="M6 22 H114 M6 44 H114 M6 66 H114 M30 6 V84 M60 6 V84 M90 6 V84" stroke={C.babyblauHell} strokeWidth="1.2" />
          <path d="M8 80 C 30 80, 40 20, 62 22 S 92 70, 114 12" stroke={C.nachtschwarz} strokeWidth="3.2" fill="none" strokeLinecap="round" />
          <line x1="19" y1="79.8" x2="51" y2="20.8" stroke={C.golddunkel} strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="35" cy="50.3" r="4.2" fill={C.golddunkel} stroke={C.weiss} strokeWidth="1.5" />
          <text x="98" y="84" fontSize="13" fontStyle="italic" fontWeight="700" fill={C.babyblauTief} fontFamily="Montserrat, sans-serif">f′</text>
        </svg>
      </div>
    </button>
  );
}
