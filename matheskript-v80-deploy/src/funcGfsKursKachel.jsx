/* Startseiten-Kachel des Kurses GFS (unter dem Kurs Vektoren, Geraden und Ebenen).
   Gleicher Aufbau wie funcVekKursKachel.jsx, in Nachtschwarz mit Gold –
   die Bühne, auf der die GFS stattfindet. Eigene kleine Datei, damit die
   Startseite den Kurs selbst nicht mitladen muss. */
import React from "react";
import { C } from "./base1.jsx";
import { kachelMobilCss, kachelMobilVars } from "./kachelMobil.js";

export function GfsKursKachel({ onClick, themen = 1 }) {
  return (
    <button type="button" onClick={onClick} className="gfs-kachel" aria-label="Kurs GFS öffnen"
      style={{ ...kachelMobilVars({ kopf: `linear-gradient(150deg, ${C.nachtschwarz} 0%, #1E1A0E 70%, #2E2408 100%)`, kopfText: C.weiss, koerper: "#FFF6D6", text: C.nachtschwarz, rand: C.golddunkel }), display: "flex", width: "calc(100% + 32px)", marginLeft: -16, marginRight: -16, marginTop: 12, padding: 0, border: "none", borderRadius: 18, overflow: "hidden",
        cursor: "pointer", fontFamily: "inherit", textAlign: "left", position: "relative", minHeight: "calc(104px + 1.1 * clamp(15px, 4.1vw, 22px))",
        background: `linear-gradient(150deg, ${C.nachtschwarz} 0%, #1E1A0E 55%, ${C.golddunkel} 100%)`, color: C.weiss,
        boxShadow: "0 10px 30px rgba(11,12,16,0.4), inset 0 0 0 1px rgba(237,187,0,0.3)" }}>
      <style>{`.gfs-kachel{transition:transform .15s ease, box-shadow .15s ease}
        .gfs-kachel:active{transform:scale(0.985)}
        @media (hover:hover){.gfs-kachel:hover{transform:translateY(-2px);box-shadow:0 14px 36px rgba(90,67,0,0.5)}}
        .gfs-kachel:focus-visible{outline:3px solid ${C.flaggold};outline-offset:3px}${kachelMobilCss("gfs-kachel")}`}</style>
      <div style={{ flex: "1 1 63%", minWidth: 0, padding: "14px 10px 14px 16px", display: "flex", flexDirection: "column" }}>
        <span className="kk-kicker" style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", color: C.flaggold }}>KURS</span>
        <h2 style={{ fontSize: "clamp(15px, 4.1vw, 22px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, margin: "2px 0 0", textWrap: "balance" }}>
          GFS in Mathe
        </h2>
        <span aria-hidden="true" className="kk-balken" style={{ display: "block", width: 34, height: 2.5, borderRadius: 2, marginTop: 6, background: C.flaggold }} />
        <p style={{ fontSize: 12.5, fontWeight: 500, lineHeight: 1.4, margin: "6px 0 0", color: "rgba(255,255,255,0.84)" }}>
          <span className="kk-desk">Klassenstufe wählen, dein Thema aus dem Lambacher Schweizer finden – verstehen, vortragen, Fragen meistern.</span>
          <span className="kk-mob">Dein Thema aus dem Lambacher Schweizer finden – verstehen, vortragen, Fragen meistern.</span>
        </p>
        <span className="kk-knopf" style={{ marginTop: "auto", paddingTop: 8, fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, color: C.weiss }}>
          <span className="kk-desk">Kurs starten</span><span className="kk-mob">Kurs öffnen</span>
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8.5 4l4 4-4 4" stroke={C.flaggold} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
      </div>
      <div style={{ flex: "0 0 37%", position: "relative", background: "#FFF6D6", borderLeft: "1px solid rgba(237,187,0,0.5)" }}>
        <span className="kk-modul" style={{ position: "absolute", top: 10, left: 10, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", background: C.nachtschwarz, color: C.weiss,
          padding: "3px 7px", borderRadius: 999, zIndex: 1 }}>7 SCHRITTE</span>
        <svg aria-hidden="true" className="kk-grafik" viewBox="0 0 120 90" preserveAspectRatio="xMidYMid meet" style={{ position: "absolute", inset: "30px 8px 8px 6px", width: "calc(100% - 14px)", height: "calc(100% - 38px)" }}>
          {/* Tafel mit Pascal-Zahlen und ein Rednerpult */}
          <rect x="12" y="6" width="96" height="54" rx="4" fill={C.golddunkel} stroke={C.nachtschwarz} strokeWidth="1.6" />
          <g fill="#FFF6D6" fontFamily="Montserrat, sans-serif" fontWeight="700" fontSize="9" textAnchor="middle">
            <text x="60" y="20">1</text><text x="52" y="31">1</text><text x="68" y="31">1</text>
            <text x="44" y="42">1</text><text x="60" y="42">2</text><text x="76" y="42">1</text>
            <text x="36" y="53">1</text><text x="52" y="53">3</text><text x="68" y="53">3</text><text x="84" y="53">1</text>
          </g>
          <path d="M40 88 L48 66 H72 L80 88 Z" fill={C.nachtschwarz} />
          <rect x="44" y="62" width="32" height="6" rx="2" fill={C.flaggold} />
        </svg>
      </div>
    </button>
  );
}
