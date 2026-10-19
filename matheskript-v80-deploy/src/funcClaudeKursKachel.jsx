/* Startseiten-Kacheln der Kurse „Mathe lernen mit Claude“ (ab 18) und
   „Mathe lernen mit Gemini“ (ab 16), unter dem Kurs GFS. Gleicher Aufbau wie
   funcGfsKursKachel.jsx, Nachtblau mit Gold. Eigene kleine Datei, damit die
   Startseite den Kurs selbst nicht mitladen muss. */
import React from "react";
import { C } from "./base1.jsx";
import { kachelMobilCss, kachelMobilVars } from "./kachelMobil.js";

const KACHEL = {
  ki: { ki: "KI", titel: "Mathe mit KI lernen", kicker: "DREI WEGE · EINE REGEL", alter: "3 WEGE", text: "Gemini ab 16, Claude ab 18, Mathilda AI für alle: Hier siehst du, was für dein Alter offen ist – und wie du die KI dazu bringst, dir Mathe zu erklären statt vorzurechnen.", textMob: "Gemini ab 16, Claude ab 18, Mathilda AI für alle – so erklärt dir die KI Mathe, statt sie vorzurechnen.", knopf: "Weg wählen" },
  claude: { ki: "Claude", alter: "AB 18", text: "Nicht „löse mir“, sondern „erklär mir“: die Prompts, mit denen Claude dich Mathe verstehen lässt – mit Beispielen aus dem Buch Ableitungen." },
  gemini: { ki: "Gemini", alter: "AB 16", text: "Derselbe Kurs für die Google-KI: so fragst du Gemini, dass du Mathe verstehst – mit Beispielen zu Parabeln, Gleichungen, Prozent und Pythagoras." },
};

export function ClaudeKursKachel({ onClick, kurs = "claude" }) {
  const k = KACHEL[kurs] || KACHEL.claude;
  return (
    <button type="button" onClick={onClick} className="clk-kachel" aria-label={k.titel ? `${k.titel} öffnen` : `Kurs Mathe lernen mit ${k.ki} öffnen`} data-claudekurs-kachel={kurs}
      style={{ ...kachelMobilVars({ kopf: "linear-gradient(150deg, #06102A 0%, #0B1E4A 60%, #12306E 100%)", kopfText: C.weiss, koerper: "#EEF3FC", text: "#06102A", rand: "#C29200" }), display: "flex", width: "calc(100% + 32px)", marginLeft: -16, marginRight: -16, marginTop: 12, padding: 0, border: "none", borderRadius: 18, overflow: "hidden",
        cursor: "pointer", fontFamily: "inherit", textAlign: "left", position: "relative", minHeight: "calc(104px + 1.1 * clamp(15px, 4.1vw, 22px))",
        background: "linear-gradient(150deg, #06102A 0%, #0B1E4A 55%, #12306E 100%)", color: C.weiss,
        boxShadow: "0 10px 30px rgba(6,16,42,0.4), inset 0 0 0 1px rgba(237,187,0,0.3)" }}>
      <style>{`.clk-kachel{transition:transform .15s ease, box-shadow .15s ease}
        .clk-kachel:active{transform:scale(0.985)}
        @media (hover:hover){.clk-kachel:hover{transform:translateY(-2px);box-shadow:0 14px 36px rgba(6,16,42,0.5)}}
        .clk-kachel:focus-visible{outline:3px solid ${C.flaggold};outline-offset:3px}${kachelMobilCss("clk-kachel")}`}</style>
      <div style={{ flex: "1 1 63%", minWidth: 0, padding: "14px 10px 14px 16px", display: "flex", flexDirection: "column" }}>
        <span className="kk-kicker" style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", color: C.flaggold }}>{k.kicker || `KURS ${k.alter} · 10 LEKTIONEN`}</span>
        <h2 style={{ fontSize: "clamp(15px, 4.1vw, 22px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, margin: "2px 0 0", textWrap: "balance" }}>
          {k.titel || `Mathe lernen mit ${k.ki}`}
        </h2>
        <span aria-hidden="true" className="kk-balken" style={{ display: "block", width: 34, height: 2.5, borderRadius: 2, marginTop: 6, background: C.flaggold }} />
        <p style={{ fontSize: 12.5, fontWeight: 500, lineHeight: 1.4, margin: "6px 0 0", color: "rgba(255,255,255,0.84)" }}>
          {k.textMob ? (<><span className="kk-desk">{k.text}</span><span className="kk-mob">{k.textMob}</span></>) : k.text}
        </p>
        <span className="kk-knopf" style={{ marginTop: "auto", paddingTop: 8, fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, color: C.weiss }}>
          {k.knopf || (<><span className="kk-desk">Kurs starten</span><span className="kk-mob">Kurs öffnen</span></>)}
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8.5 4l4 4-4 4" stroke={C.flaggold} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
      </div>
      <div style={{ flex: "0 0 37%", position: "relative", background: "#EEF3FC", borderLeft: "1px solid rgba(237,187,0,0.5)" }}>
        <span className="kk-modul" style={{ position: "absolute", top: 10, left: 10, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", background: "#06102A", color: C.weiss,
          padding: "3px 7px", borderRadius: 999, zIndex: 1 }}>{k.alter}</span>
        <svg aria-hidden="true" className="kk-grafik" viewBox="0 0 120 90" preserveAspectRatio="xMidYMid meet" style={{ position: "absolute", inset: "30px 8px 8px 6px", width: "calc(100% - 14px)", height: "calc(100% - 38px)" }}>
          {/* Zwei Sprechblasen: Frage in Gold, Antwort in Blau – und ein Funken */}
          <path d="M44 12 h66 a8 8 0 0 1 8 8 v22 a8 8 0 0 1 -8 8 h-50 l-12 10 v-10 h-4 a8 8 0 0 1 -8 -8 v-22 a8 8 0 0 1 8 -8z" fill={C.flaggold} />
          <path d="M52 26 h44 M52 36 h28" stroke="#06102A" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M10 52 h58 a8 8 0 0 1 8 8 v16 a8 8 0 0 1 -8 8 h-12 v10 l-12 -10 h-34 a8 8 0 0 1 -8 -8 v-16 a8 8 0 0 1 8 -8z" fill="#FFFFFF" stroke={C.see} strokeWidth="2" />
          <path d="M18 64 h40 M18 74 h26" stroke={C.see} strokeWidth="3.2" strokeLinecap="round" />
          <path d="M108 54 l2.6 7.2 l7.2 2.6 l-7.2 2.6 l-2.6 7.2 l-2.6 -7.2 l-7.2 -2.6 l7.2 -2.6z" fill={C.flaggold} />
        </svg>
      </div>
    </button>
  );
}
