/* ======================================================================
   „Mathe mit KI lernen“ – Wahlseite hinter der Startseiten-Kachel.
   Drei Wege nach Alter: Mathilda AI (für alle), Gemini (ab 16), Claude (ab 18),
   jeweils mit Voraussetzungen. Daten: WEGE in claudeKursDaten.js.
   Ansicht „kiwahl“, Direct Link /mathe-mit-ki-lernen.
   ====================================================================== */
import React, { useState } from "react";
import { C } from "./base1.jsx";
import { WEGE, ALTERSSTUFEN, wegeFuerAlter, KURSE } from "./claudeKursDaten.js";

const K = { nacht: "#06102A", navy: "#0B1E4A", gold: C.flaggold, goldText: "#8A6A00", weiss: C.weiss, tinte: C.tinte, grau: C.grau, linie: C.linie, sand: C.sand, gruen: C.smaragd };
const GOLD = "linear-gradient(150deg, #FFE9A0 0%, #F4CE4A 28%, #EDBB00 55%, #D9A520 78%, #B58612 100%)";
const NACHT = `linear-gradient(165deg, ${K.nacht} 0%, ${K.navy} 55%, #12306E 100%)`;

function Emblem({ groesse = 120 }) {
  return (
    <svg viewBox="0 0 120 120" width={groesse} height={groesse} aria-hidden="true" style={{ display: "block" }}>
      <path d="M22 28 h64 a12 12 0 0 1 12 12 v34 a12 12 0 0 1 -12 12 h-36 l-18 16 v-16 h-10 a12 12 0 0 1 -12 -12 v-34 a12 12 0 0 1 12 -12z" fill="none" stroke={K.gold} strokeWidth="4.5" strokeLinejoin="round" />
      <path d="M38 50 h44 M38 62 h30" stroke={K.gold} strokeWidth="4.5" strokeLinecap="round" />
      <path d="M96 10 l3.2 8.8 l8.8 3.2 l-8.8 3.2 l-3.2 8.8 l-3.2 -8.8 l-8.8 -3.2 l8.8 -3.2z" fill={K.gold} />
    </svg>
  );
}

/* Fortschritt der Kurse (Speicher wie in funcClaudeKurs.jsx) */
const erledigt = (kursId) => {
  const k = KURSE.find((x) => x.id === kursId);
  if (!k) return 0;
  try { return Object.values(JSON.parse(localStorage.getItem(k.speicher) || "{}").fertig || {}).filter(Boolean).length; } catch (e) { return 0; }
};

export function KiWahlSeite({ gehe }) {
  const [stufe, setStufe] = useState(null);
  const passend = wegeFuerAlter(stufe);
  return (
    <>
      <style>{`.kw-chip{transition:background .15s ease,color .15s ease}
        .kw-chip:focus-visible,.kw-knopf:focus-visible{outline:3px solid ${K.gold};outline-offset:2px}
        .kw-karte{transition:transform .15s ease, box-shadow .15s ease}
        @media (hover:hover){.kw-karte:hover{transform:translateY(-1px);box-shadow:0 10px 26px rgba(15,26,51,0.12)}}
        @media (max-width:520px){.kw-bild svg{width:84px !important;height:84px !important}.kw-bild{top:16px !important;opacity:.55 !important}}`}</style>
      <div style={{ background: NACHT, color: K.weiss, position: "relative", overflow: "hidden" }}>
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(90% 70% at 100% 0%, rgba(237,187,0,0.22) 0%, transparent 60%)" }} />
        <div aria-hidden="true" className="kw-bild" style={{ position: "absolute", right: 14, top: 22, opacity: 0.9 }}><Emblem groesse={140} /></div>
        <div className="held mx-auto px-6 pt-10 pb-5" style={{ maxWidth: 620, position: "relative" }}>
          <p style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: "0.16em", color: K.gold, margin: "0 0 6px" }}>DREI WEGE · EINE REGEL</p>
          <h1 data-kiwahl-titel style={{ fontWeight: 800, fontSize: "clamp(28px, 8vw, 40px)", letterSpacing: "-0.03em", lineHeight: 1.05, margin: 0,
            background: "linear-gradient(180deg, #FFF 0%, #E3E8EF 45%, #B9C2CE 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
            Mathe mit<br />KI lernen
          </h1>
          <div style={{ width: 54, height: 4, background: GOLD, borderRadius: 2, marginTop: 16, marginBottom: 14 }} />
          <p style={{ color: "#C9D6EE", fontSize: 15, fontWeight: 300, lineHeight: 1.6, margin: 0, maxWidth: 400 }}>
            Die KI erklärt, du rechnest: nicht „löse mir“, sondern „erklär mir“. Welcher Weg für dich offen ist, hängt vom Alter ab.
          </p>
        </div>
        <div style={{ height: 24, background: K.sand, borderRadius: "20px 20px 0 0", position: "relative" }} />
      </div>

      <div className="mx-auto px-6" style={{ maxWidth: 620, paddingBottom: 36 }}>
        <p style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: "0.16em", color: K.goldText, margin: "0 0 8px" }}>WIE ALT BIST DU?</p>
        <div role="group" aria-label="Alter wählen" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
          {ALTERSSTUFEN.map((s) => {
            const an = stufe === s.id;
            return (
              <button key={s.id} type="button" className="kw-chip" aria-pressed={an} data-kiwahl-alter={s.id} onClick={() => setStufe(an ? null : s.id)}
                style={{ minHeight: 44, padding: "0 18px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 14,
                  background: an ? K.navy : K.weiss, color: an ? K.weiss : K.navy, border: `1.5px solid ${an ? K.navy : K.linie}` }}>
                {s.name}
              </button>
            );
          })}
        </div>
        <p data-kiwahl-hinweis aria-live="polite" style={{ fontSize: 13.5, color: K.grau, lineHeight: 1.5, margin: "6px 2px 18px", minHeight: 20 }}>
          {stufe === "u16" && "Für dich: Mathilda AI – mit Zustimmung deiner Eltern."}
          {stufe === "16" && "Für dich: der Kurs mit Gemini oder Mathilda AI. Claude selbst ist erst ab 18."}
          {stufe === "18" && "Für dich sind alle drei Wege offen – der Claude-Kurs passt am besten zur Oberstufe."}
          {!stufe && "Tippe dein Alter an – dann siehst du, was für dich passt. Oder lies unten alle drei Wege."}
        </p>

        <div style={{ display: "grid", gap: 14 }}>
          {WEGE.map((w) => {
            const empfohlen = passend.includes(w.id);
            const gedimmt = stufe && !empfohlen;
            const zahl = w.id === "mathilda" ? null : erledigt(w.id);
            return (
              <section key={w.id} className="kw-karte" data-kiwahl-weg={w.id} data-kiwahl-passt={empfohlen ? "ja" : stufe ? "nein" : ""}
                style={{ background: K.weiss, borderRadius: 20, padding: "18px 16px 16px", position: "relative", opacity: gedimmt ? 0.62 : 1,
                  border: `${empfohlen ? 2 : 1}px solid ${empfohlen ? K.gold : K.linie}`, boxShadow: "0 2px 14px rgba(15,26,51,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ background: K.navy, color: K.gold, fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", padding: "5px 11px", borderRadius: 999 }}>{w.alter.toUpperCase()}</span>
                  <span style={{ fontSize: 12.5, color: K.grau, fontWeight: 600 }}>{w.altersZeile}</span>
                  {empfohlen && <span style={{ marginLeft: "auto", background: GOLD, color: K.navy, fontSize: 11.5, fontWeight: 800, padding: "4px 10px", borderRadius: 999 }}>Passt für dich</span>}
                </div>
                <h2 style={{ fontSize: 21, fontWeight: 800, color: K.navy, letterSpacing: "-0.02em", lineHeight: 1.2, margin: "10px 0 4px" }}>{w.titel}</h2>
                <p style={{ fontSize: 14.5, color: K.tinte, lineHeight: 1.5, margin: 0 }}>{w.zeile}</p>

                <p style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: "0.14em", color: K.goldText, margin: "14px 0 6px" }}>VORAUSSETZUNGEN</p>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 7 }}>
                  {w.voraussetzungen.map((v) => (
                    <li key={v} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, color: K.tinte, lineHeight: 1.5 }}>
                      <span aria-hidden="true" style={{ flex: "none", width: 20, height: 20, borderRadius: 10, background: K.navy, marginTop: 1, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="11" height="11" viewBox="0 0 12 12"><path d="M2.5 6.2l2.4 2.4 4.6-5" stroke={K.gold} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </span>
                      <span>{v}</span>
                    </li>
                  ))}
                </ul>
                <p style={{ fontSize: 13, color: K.grau, lineHeight: 1.55, margin: "12px 0 14px", padding: "10px 12px", borderRadius: 12, background: "#F4F6FB", borderLeft: `3px solid ${K.gold}` }}>{w.gutZuWissen}</p>

                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <button type="button" className="kw-knopf" data-kiwahl-oeffnen={w.id} onClick={() => gehe(w.ziel)}
                    style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 46, padding: "0 20px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit", fontWeight: 800, fontSize: 14.5,
                      background: empfohlen || !stufe ? GOLD : K.navy, color: empfohlen || !stufe ? K.navy : K.weiss, border: "none",
                      boxShadow: empfohlen || !stufe ? "0 6px 18px rgba(181,134,18,0.35)" : "none" }}>
                    {w.knopf} <span aria-hidden="true">→</span>
                  </button>
                  {zahl !== null && <span style={{ fontSize: 12.5, color: K.grau, fontWeight: 600 }}>{zahl === 0 ? "10 Lektionen" : `${zahl} von 10 Lektionen erledigt`}</span>}
                </div>
              </section>
            );
          })}
        </div>

        <p style={{ fontSize: 12.5, color: K.grau, lineHeight: 1.6, margin: "20px 4px 0", textAlign: "center" }}>
          Altersangaben nach den Bedingungen der Anbieter, Stand Oktober 2026. Sie können sich ändern – im Zweifel gilt, was Google und Anthropic selbst schreiben.
        </p>
      </div>
    </>
  );
}
