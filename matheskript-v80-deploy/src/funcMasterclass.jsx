import React, { useState } from "react";
import { C } from "./base1.jsx";

/* ======================================================================
   MATHE ABI MASTERCLASS
   Goldene Doppelkachel für die Startseite und die ausführliche
   Programmseite (ansicht "masterclass"). Inhalte sind ein erster Entwurf
   des Kurskonzepts — Details (Preise, Termine) folgen.
   ====================================================================== */

const GOLD = "linear-gradient(150deg, #FFE9A0 0%, #F4CE4A 28%, #EDBB00 55%, #D9A520 78%, #B58612 100%)";
const NAVY = "#0B1E4A";
const PEN = "#8E97A6";      // Pen & Paper: Silber
const THEMA = "#004D98";    // Themenblöcke: Blau
const MIND = "#EDBB00";     // Mindset: Gold

/* ---------- Startseiten-Kachel (so hoch wie zwei normale Kacheln) ---------- */

function MasterclassLogo() {
  // Treppe aus sechs Stufen (Monate), drei goldene Rauten (Intensivtage), oben ein Stern
  const stufen = [0, 1, 2, 3, 4, 5];
  return (
    <svg viewBox="0 0 200 220" preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "100%", display: "block" }} aria-hidden="true">
      {stufen.map((i) => (
        <rect key={i} x={18 + i * 28} y={190 - (i + 1) * 26} width="28" height={(i + 1) * 26} rx="3"
          fill={NAVY} opacity={0.12 + i * 0.1} />
      ))}
      <path d={`M 18 190 ${stufen.map((i) => `L ${18 + i * 28} ${190 - (i + 1) * 26} L ${46 + i * 28} ${190 - (i + 1) * 26}`).join(" ")}`}
        stroke={NAVY} strokeWidth="3" fill="none" strokeLinejoin="round" />
      {[1, 3, 5].map((i) => (
        <path key={i} d={`M ${32 + i * 28} ${172 - (i + 1) * 26} l 8 8 l -8 8 l -8 -8 z`} fill="#FFFFFF" stroke={NAVY} strokeWidth="2" />
      ))}
      <path d="M 172 14 l 5.6 11.4 l 12.6 1.8 l -9.1 8.9 l 2.1 12.5 l -11.2 -5.9 l -11.2 5.9 l 2.1 -12.5 l -9.1 -8.9 l 12.6 -1.8 z"
        fill="#FFFFFF" stroke={NAVY} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export function MasterclassKachel({ onClick }) {
  return (
    <button type="button" onClick={onClick} aria-label="Mathe Abi Masterclass ansehen" className="mc-kachel"
      style={{ display: "flex", width: "calc(100% + 32px)", marginLeft: -16, marginRight: -16, marginTop: 12, padding: 0, border: "none",
        borderRadius: 20, overflow: "hidden", cursor: "pointer", fontFamily: "inherit", textAlign: "left", position: "relative",
        height: "calc(202px + 2.2 * clamp(15px, 4.1vw, 22px))", background: GOLD, color: NAVY,
        boxShadow: "0 10px 30px rgba(181,134,18,0.35), inset 0 0 0 1px rgba(255,255,255,0.55)" }}>
      <style>{`.mc-kachel{transition:transform .15s ease, box-shadow .15s ease}
        .mc-kachel:active{transform:scale(0.985)}
        @media (hover:hover){.mc-kachel:hover{transform:translateY(-2px);box-shadow:0 14px 36px rgba(181,134,18,0.45)}}
        .mc-glanz{position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,0.35) 45%,transparent 60%);
          background-size:250% 100%;animation:mcGlanz 5.5s ease-in-out infinite;pointer-events:none}
        @keyframes mcGlanz{0%,60%{background-position:120% 0}100%{background-position:-120% 0}}`}</style>
      <span className="mc-glanz" aria-hidden="true" />
      <div style={{ flex: "1 1 62%", minWidth: 0, padding: "16px 10px 14px 18px", display: "flex", flexDirection: "column", position: "relative" }}>
        <span style={{ alignSelf: "flex-start", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em", background: NAVY, color: MIND,
          padding: "4px 9px", borderRadius: 999 }}>6-MONATS-PROGRAMM</span>
        <h2 style={{ fontSize: "clamp(21px, 6.2vw, 32px)", fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.02, margin: "11px 0 0" }}>
          Mathe Abi<br />Masterclass
        </h2>
        <span aria-hidden="true" style={{ display: "block", width: 44, height: 3, borderRadius: 2, marginTop: 9, background: NAVY }} />
        <p style={{ fontSize: 12.5, fontWeight: 500, lineHeight: 1.4, marginTop: 8, marginBottom: 0, color: "#1B2A4F" }}>
          Werde die beste Version von dir – für ein starkes Mathe-Abi und echte Freude am Fach.
        </p>
        <span style={{ marginTop: "auto", paddingTop: 10, fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
          Programm ansehen
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8.5 4l4 4-4 4" stroke={NAVY} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
      </div>
      <div style={{ flex: "0 0 38%", position: "relative", borderLeft: "1px solid rgba(11,30,74,0.12)" }}>
        <div style={{ position: "absolute", inset: "10px 6px 10px 2px" }}><MasterclassLogo /></div>
      </div>
    </button>
  );
}

/* ---------- „Mathe checken“: 2-Monats-Programm, silberne Kachel in Normalgröße ---------- */

const SILBER = "linear-gradient(150deg, #FFFFFF 0%, #E4E8EE 20%, #BCC5D1 46%, #F1F3F7 60%, #A7B1BF 84%, #D3D9E1 100%)";

function CheckenLogo() {
  // Zwei Ringsegmente (zwei Monate), in der Mitte ein Haken
  return (
    <svg viewBox="0 0 120 120" preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "100%", display: "block" }} aria-hidden="true">
      <circle cx="60" cy="60" r="40" fill="none" stroke="rgba(11,30,74,0.12)" strokeWidth="10" />
      <path d="M 60 20 A 40 40 0 0 1 60 100" fill="none" stroke={NAVY} strokeWidth="10" strokeLinecap="round" />
      <path d="M 54 99.5 A 40 40 0 0 1 54 20.5" fill="none" stroke="#5E6878" strokeWidth="10" strokeLinecap="round" />
      <path d="M 42 61 l 12 12 l 25 -27" fill="none" stroke={NAVY} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MatheCheckenKachel({ onClick }) {
  return (
    <button type="button" onClick={onClick} aria-label="Mathe checken ansehen" className="mc-kachel mc-silber"
      style={{ display: "flex", width: "calc(100% + 32px)", marginLeft: -16, marginRight: -16, marginTop: 12, padding: 0, border: "none",
        borderRadius: 18, overflow: "hidden", cursor: "pointer", fontFamily: "inherit", textAlign: "left", position: "relative",
        height: "calc(95px + 1.1 * clamp(15px, 4.1vw, 22px))", background: SILBER, color: NAVY,
        boxShadow: "0 8px 24px rgba(60,72,92,0.28), inset 0 0 0 1px rgba(255,255,255,0.8)" }}>
      <style>{`.mc-kachel{transition:transform .15s ease, box-shadow .15s ease}
        .mc-kachel:active{transform:scale(0.985)}
        @media (hover:hover){.mc-kachel:hover{transform:translateY(-2px)}}
        .mc-glanz{position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,0.55) 45%,transparent 60%);
          background-size:250% 100%;animation:mcGlanz 5.5s ease-in-out infinite;pointer-events:none}
        .mc-silber .mc-glanz{animation-delay:1.2s}
        @keyframes mcGlanz{0%,60%{background-position:120% 0}100%{background-position:-120% 0}}`}</style>
      <span className="mc-glanz" aria-hidden="true" />
      <div style={{ flex: "1 1 60%", minWidth: 0, padding: "14px 10px 14px 16px", display: "flex", flexDirection: "column", position: "relative" }}>
        <h2 style={{ fontSize: "clamp(15px, 4.1vw, 22px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          Mathe checken
        </h2>
        <span aria-hidden="true" style={{ display: "block", width: 34, height: 2.5, borderRadius: 2, marginTop: 6, background: NAVY }} />
        <p style={{ fontSize: 12.5, fontWeight: 500, lineHeight: 1.4, marginTop: 6, marginBottom: 0, color: "#1B2A4F",
          display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", height: "4.2em" }}>
          In zwei Monaten Lücken schließen, Mathe verstehen und sicher werden.
        </p>
      </div>
      <div style={{ flex: "0 0 40%", position: "relative", borderLeft: "1px solid rgba(11,30,74,0.12)" }}>
        <span style={{ position: "absolute", top: 10, left: 10, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", background: NAVY, color: "#E4E8EE",
          padding: "3px 7px", borderRadius: 999, zIndex: 1 }}>2 MONATE</span>
        <div style={{ position: "absolute", inset: "14px 8px 8px 8px" }}><CheckenLogo /></div>
      </div>
    </button>
  );
}

export function MatheCheckenSeite() {
  const punkte = [
    ["Lücken finden", "Zu Beginn eine Standortbestimmung: Wo genau hakt es – und warum?"],
    ["Verstehen statt auswendig lernen", "Jedes Thema von Grund auf, mit Bildern, Beispielen und den Werkzeugen der App."],
    ["Pen & Paper", "Sauber aufschreiben, strukturiert rechnen, Fehler selbst finden."],
    ["Sicher werden", "Regelmäßiges Training, bis die nächste Klausur kein Grund mehr zur Sorge ist."],
  ];
  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <H2>In zwei Monaten Mathe checken</H2>
      <Absatz>
        Mathe checken ist das kompakte Programm für alle, die das Gefühl haben, den Anschluss verloren zu haben – oder die
        endlich verstehen wollen, was sie da eigentlich rechnen. In acht Wochen schließt du deine Lücken und baust ein
        Fundament, auf dem du sicher weiterlernen kannst.
      </Absatz>
      <div style={{ ...karte, padding: "6px 16px" }}>
        {punkte.map(([t, s], i) => (
          <div key={t} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: i < punkte.length - 1 ? `1px solid ${C.linie}` : "none" }}>
            <span style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 999, background: SILBER, border: `1px solid ${C.linie}`, color: NAVY, fontSize: 13, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
            <span>
              <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: C.tinte }}>{t}</span>
              <span style={{ display: "block", fontSize: 13.5, fontWeight: 300, color: C.grau, lineHeight: 1.55, marginTop: 2 }}>{s}</span>
            </span>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 13.5, color: C.grau, fontWeight: 300, lineHeight: 1.7, marginTop: 18 }}>
        Ablauf, Termine und alle Details folgen in Kürze. Wer danach weitergehen will, steigt in die{" "}
        <b style={{ color: NAVY, fontWeight: 700 }}>Mathe Abi Masterclass</b> ein.
      </p>
    </div>
  );
}

/* ---------- „Math Creator“: 3-Monats-Programm, schwarz und geheimnisvoll, noch gesperrt ---------- */

function CreatorLogo() {
  const fragen = [
    { x: 30, y: 52, g: 30, o: 0.9, r: -12 }, { x: 78, y: 40, g: 44, o: 1, r: 8 }, { x: 58, y: 92, g: 22, o: 0.55, r: -4 },
    { x: 104, y: 86, g: 26, o: 0.7, r: 14 }, { x: 22, y: 104, g: 18, o: 0.4, r: 6 }, { x: 110, y: 30, g: 16, o: 0.45, r: -18 },
  ];
  return (
    <svg viewBox="0 0 130 120" preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "100%", display: "block" }} aria-hidden="true">
      <defs>
        <radialGradient id="mcr-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#6E5BD8" stopOpacity="0.55" />
          <stop offset="1" stopColor="#6E5BD8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="mcr-silber" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" /><stop offset="0.5" stopColor="#C9CFDA" /><stop offset="1" stopColor="#7E8798" />
        </linearGradient>
      </defs>
      <circle cx="65" cy="62" r="56" fill="url(#mcr-glow)" />
      {[[14, 18], [120, 60], [40, 14], [96, 112], [8, 78], [124, 100]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 2 ? 1 : 1.5} fill="#FFFFFF" opacity="0.6" />
      ))}
      {fragen.map((f, i) => (
        <text key={i} x={f.x} y={f.y} fontSize={f.g} fontWeight="800" fill="url(#mcr-silber)" opacity={f.o} textAnchor="middle"
          transform={`rotate(${f.r} ${f.x} ${f.y})`} fontFamily="Montserrat, system-ui, sans-serif">?</text>
      ))}
    </svg>
  );
}

export function MathCreatorKachel() {
  return (
    <div role="button" aria-disabled="true" aria-label="Math Creator – noch gesperrt" title="Noch gesperrt" className="mcr-kachel"
      style={{ display: "flex", width: "calc(100% + 32px)", marginLeft: -16, marginRight: -16, marginTop: 12, borderRadius: 18, overflow: "hidden",
        cursor: "not-allowed", position: "relative", userSelect: "none",
        height: "calc(95px + 1.1 * clamp(15px, 4.1vw, 22px))",
        background: "radial-gradient(120% 140% at 85% 20%, #241C3D 0%, #0D0B14 55%, #050407 100%)", color: "#FFFFFF",
        boxShadow: "0 8px 26px rgba(10,6,25,0.45), inset 0 0 0 1px rgba(255,255,255,0.08)" }}>
      <style>{`.mcr-kachel .mcr-schimmer{position:absolute;inset:0;pointer-events:none;
          background:linear-gradient(115deg,transparent 35%,rgba(160,140,255,0.16) 48%,transparent 62%);background-size:260% 100%;
          animation:mcrSchimmer 7s ease-in-out infinite}
        @keyframes mcrSchimmer{0%,55%{background-position:120% 0}100%{background-position:-120% 0}}`}</style>
      <span className="mcr-schimmer" aria-hidden="true" />
      <div style={{ flex: "1 1 60%", minWidth: 0, padding: "14px 10px 14px 16px", display: "flex", flexDirection: "column", position: "relative" }}>
        <h2 style={{ fontSize: "clamp(15px, 4.1vw, 22px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          background: "linear-gradient(180deg,#FFFFFF 0%,#D5D9E2 55%,#9AA3B3 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
          Math Creator
        </h2>
        <span aria-hidden="true" style={{ display: "block", width: 34, height: 2.5, borderRadius: 2, marginTop: 6, background: "linear-gradient(90deg,#6E5BD8 0%,#B7A9FF 100%)" }} />
        <p style={{ fontSize: 12.5, fontWeight: 300, lineHeight: 1.4, marginTop: 6, marginBottom: 0, color: "rgba(255,255,255,0.78)",
          display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", height: "4.2em" }}>
          Noch geheim. Nur so viel: Nach drei Monaten erschaffst du Mathe.
        </p>
      </div>
      <div style={{ flex: "0 0 40%", position: "relative", borderLeft: "1px solid rgba(255,255,255,0.08)" }}>
        <span style={{ position: "absolute", top: 10, left: 10, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.2)", color: "#D5D9E2", padding: "3px 7px", borderRadius: 999, zIndex: 1 }}>3 MONATE</span>
        <div style={{ position: "absolute", inset: "12px 6px 6px 6px", opacity: 0.9 }}><CreatorLogo /></div>
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ width: 40, height: 40, borderRadius: 999, background: "rgba(255,255,255,0.92)", boxShadow: "0 3px 14px rgba(110,91,216,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#14111F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="11" width="14" height="10" rx="2.2" fill="#14111F" />
              <path d="M 8 11 V 7.5 a 4 4 0 0 1 8 0 V 11" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------- Programmseite ---------- */

const BAUSTEINE = [
  { titel: "Wöchentlicher Zoom-Call", kurz: "Live · jede Woche", text: "Gemeinsam mit der ganzen Gruppe: neues Thema, offene Fragen, Aha-Momente. Du bist nie allein mit einem Problem.", icon: "zoom" },
  { titel: "Umfangreiches Kursmaterial", kurz: "Videos · Hefte · Tools", text: "Videolektionen, Arbeitshefte mit Lösungswegen und alle Werkzeuge der App – Plotter, Generatoren, Trainer.", icon: "material" },
  { titel: "Wöchentliche Trainingssessions", kurz: "Üben mit System", text: "Abi-Aufgaben unter Zeit, sauber nach Pen & Paper aufgeschrieben – mit Feedback zu deinem Rechenweg.", icon: "training" },
  { titel: "3 Intensivtage", kurz: "6 Stunden · Samstag", text: "Ein ganzer Tag Mathe mit Fokus. Jeder Intensivtag wird an zwei Samstagen angeboten – du wählst deinen Termin.", icon: "intensiv" },
];

const MONATE = [
  { m: 1, titel: "Fundament", thema: "Pen & Paper: sauber aufschreiben, strukturiert denken, Fehler finden", mind: "Standortbestimmung & Zielbild: Brief an dein Abi-Ich", pen: true },
  { m: 2, titel: "Analysis I", thema: "Funktionen, Ableitung, Kurvendiskussion – vom Verstehen zum Können", mind: "Fehler sind Daten: das Fehler-Logbuch", intensiv: "Intensivtag 1 · Analysis" },
  { m: 3, titel: "Analysis II", thema: "Integrale, Flächen, Anwendungsaufgaben und Abi-Aufgaben", mind: "Fokus-Routinen: 25 Minuten, die wirklich zählen" },
  { m: 4, titel: "Vektoren", thema: "Geraden, Ebenen, Abstände – Geometrie im Raum sehen", mind: "Dranbleiben, wenn es schwer wird", intensiv: "Intensivtag 2 · Geometrie" },
  { m: 5, titel: "Stochastik", thema: "Binomialverteilung, Vierfeldertafel, Hypothesen", mind: "Selbstvertrauen: Erfolge sichtbar machen" },
  { m: 6, titel: "Abi-Finale", thema: "Probeabitur unter echten Bedingungen, gezielte Lückenarbeit", mind: "Prüfungsruhe: Atmung, Zeitplan, Startritual", intensiv: "Intensivtag 3 · Probeabitur" },
];

const MINDSET = [
  { t: "Brief an dein Abi-Ich", s: "Du schreibst auf, wer du in Mathe am Tag der Prüfung sein willst – und liest ihn jeden Monat neu." },
  { t: "Fehler-Logbuch", s: "Jeder Fehler bekommt eine Ursache und eine Regel. Aus „Ich bin schlecht“ wird „Das passiert mir nicht mehr“." },
  { t: "3-Minuten-Startritual", s: "Atmen, Ziel für die Einheit, erster Strich aufs Papier. So kommst du in Sekunden in den Fokus." },
  { t: "Innere Stimme umschreiben", s: "„Ich kann das nicht“ wird zu „Ich kann das noch nicht – und weiß, was der nächste Schritt ist“." },
  { t: "Erfolgs-Tagebuch", s: "Drei Dinge pro Woche, die besser geklappt haben. Fortschritt wird sichtbar – und motiviert." },
  { t: "Prüfungssimulation", s: "Echte Zeit, echter Druck, echte Ruhe: Du trainierst nicht nur Mathe, sondern auch den Ernstfall." },
];

const TAG = [
  { z: "10:00", t: "Ankommen & Zielbild", s: "Was nehme ich mir heute vor?" },
  { z: "10:30", t: "Themenblock", s: "Der Monatsstoff kompakt – mit Pen & Paper" },
  { z: "12:30", t: "Mittagspause", s: "Kopf frei, Energie auftanken" },
  { z: "13:15", t: "Abi-Aufgaben unter Zeit", s: "Einzeln und im Team, mit Besprechung" },
  { z: "15:00", t: "Mindset-Workshop", s: "Routinen, Selbstvertrauen, Prüfungsruhe" },
  { z: "15:45", t: "Abschluss", s: "Was nehme ich mit? Plan für die nächsten Wochen" },
];

const WOCHE = [
  { tag: "Mo", t: "Zoom-Call", farbe: THEMA },
  { tag: "Di", t: "Pen & Paper · 20 min", farbe: PEN },
  { tag: "Mi", t: "Trainingssession", farbe: THEMA },
  { tag: "Do", t: "Pen & Paper · 20 min", farbe: PEN },
  { tag: "Fr", t: "Kursmaterial", farbe: THEMA },
  { tag: "Sa", t: "frei – oder Intensivtag", farbe: MIND },
  { tag: "So", t: "Wochenreflexion", farbe: MIND },
];

function BausteinIcon({ art }) {
  const s = { stroke: NAVY, strokeWidth: 2, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" };
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
      {art === "zoom" && <><rect x="2.5" y="6" width="13" height="12" rx="2.5" {...s} /><path d="M15.5 10.5l6-3.5v10l-6-3.5" {...s} /></>}
      {art === "material" && <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" {...s} /><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" {...s} /><path d="M9 8h7M9 11.5h5" {...s} /></>}
      {art === "training" && <><path d="M4 20l5-5M14 4l6 6-9 9-6-6z" {...s} /><path d="M12 6l6 6" {...s} /></>}
      {art === "intensiv" && <><rect x="3" y="4.5" width="18" height="16.5" rx="2.5" {...s} /><path d="M3 9.5h18M8 2.5v4M16 2.5v4" {...s} /><path d="M12 12.5l1.5 3 3.2.4-2.4 2.2.7 3.1-3-1.7-3 1.7.7-3.1-2.4-2.2 3.2-.4z" {...s} /></>}
    </svg>
  );
}

/* Illustration des Kurskonzepts: drei Stränge über sechs Monate —
   Pen & Paper (Silber) als Fundament, Themenblöcke (Blau), Mindset (Gold) —
   die zum Ziel „Abi“ zusammenlaufen. Goldene Rauten markieren die Intensivtage. */
function KonzeptGrafik() {
  const W = 640, H = 300, x0 = 40, x1 = 560, dx = (x1 - x0) / 6;
  const welle = (y, amp, phase) => {
    let d = "";
    for (let i = 0; i <= 120; i++) {
      const t = i / 120;
      const x = x0 + t * (x1 - x0);
      const zusammen = Math.max(0, (t - 0.72) / 0.28);
      const yy = y + (150 - y) * zusammen ** 1.6 + Math.sin(t * Math.PI * 4 + phase) * amp * (1 - zusammen);
      d += `${i ? "L" : "M"}${x.toFixed(1)},${yy.toFixed(1)}`;
    }
    return d;
  };
  const themen = ["Basis", "Analysis", "Analysis", "Vektoren", "Stochas.", "Finale"];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }} role="img" aria-label="Kurskonzept: Pen & Paper, Themenblöcke und Mindset laufen über sechs Monate zum Abi zusammen">
      {themen.map((t, i) => (
        <g key={t}>
          <rect x={x0 + i * dx + 3} y="34" width={dx - 6} height="232" rx="12" fill={i % 2 ? "#F4F6FA" : "#EEF2F8"} />
          <text x={x0 + i * dx + dx / 2} y="64" textAnchor="middle" fontSize="24" fontWeight="800" fill={NAVY} fontFamily="Montserrat, system-ui, sans-serif">{i + 1}</text>
          <text x={x0 + i * dx + dx / 2} y="88" textAnchor="middle" fontSize="15" fontWeight="600" fill="#5E6878" fontFamily="Montserrat, system-ui, sans-serif">{t}</text>
        </g>
      ))}
      <path d={welle(110, 10, 0)} stroke={MIND} strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d={welle(160, 12, 1.4)} stroke={THEMA} strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d={welle(212, 8, 2.6)} stroke={PEN} strokeWidth="7" fill="none" strokeLinecap="round" />
      {[1, 3, 5].map((i) => {
        const cx = x0 + i * dx + dx / 2, cy = 246;
        return <path key={i} d={`M ${cx} ${cy - 11} l 11 11 l -11 11 l -11 -11 z`} fill={MIND} stroke={NAVY} strokeWidth="2" />;
      })}
      <circle cx="596" cy="150" r="34" fill={NAVY} />
      <circle cx="596" cy="150" r="34" fill="none" stroke={MIND} strokeWidth="3" />
      <text x="596" y="157" textAnchor="middle" fontSize="20" fontWeight="800" fill={MIND} fontFamily="Montserrat, system-ui, sans-serif">Abi</text>
    </svg>
  );
}

function Legende() {
  const e = (farbe, t, raute) => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, color: C.grau, whiteSpace: "nowrap" }}>
      {raute ? <svg width="14" height="14" viewBox="0 0 14 14"><path d="M7 1l6 6-6 6-6-6z" fill={MIND} stroke={NAVY} strokeWidth="1.4" /></svg>
        : <span style={{ width: 22, height: 6, borderRadius: 3, background: farbe }} />}
      {t}
    </span>
  );
  return (
    <div className="flex flex-wrap" style={{ gap: "8px 16px", marginTop: 10 }}>
      {e(MIND, "Mindset")}{e(THEMA, "Themenblöcke")}{e(PEN, "Pen & Paper")}{e(null, "Intensivtag", true)}
    </div>
  );
}

const Kicker = ({ children }) => <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, marginBottom: 8 }}>{children}</p>;
const H2 = ({ children }) => <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 12 }}>{children}</h2>;
const Absatz = ({ children, style }) => <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.8, marginBottom: 16, ...style }}>{children}</p>;
const karte = { background: C.weiss, borderRadius: 18, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" };
const Trenner = () => <div style={{ height: 1, background: C.linie, margin: "34px 0 28px" }} />;

export function MasterclassSeite() {
  const [monat, setMonat] = useState(0);
  const [hinweis, setHinweis] = useState(false);
  const M = MONATE[monat];

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      {/* Versprechen */}
      <H2>Sechs Monate, die dein Mathe-Abi verändern</H2>
      <Absatz>
        Die Mathe Abi Masterclass ist kein Nachhilfekurs. Sie ist ein Programm, in dem du lernst, in Mathe die beste Version
        von dir zu werden: mit klarem Können, einer sauberen Arbeitsweise und einer Haltung, die dich auch in der Prüfung trägt.
        Und das Beste daran – es macht richtig Freude.
      </Absatz>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8, margin: "4px 0 6px" }}>
        {[["Können", "Jedes Abi-Thema verstehen und sicher rechnen", THEMA], ["Klarheit", "Pen & Paper: sauber, strukturiert, fehlerfest", PEN], ["Haltung", "Mindset, Fokus und Freude am Fach", MIND]].map(([t, s, f]) => (
          <div key={t} style={{ ...karte, padding: "14px 12px", borderTop: `4px solid ${f}` }}>
            <p style={{ fontSize: 15.5, fontWeight: 700, color: NAVY, marginBottom: 4 }}>{t}</p>
            <p style={{ fontSize: 12.5, color: C.grau, fontWeight: 300, lineHeight: 1.45 }}>{s}</p>
          </div>
        ))}
      </div>

      <Trenner />

      {/* Bausteine */}
      <Kicker>Was dich erwartet</Kicker>
      <H2>Vier Bausteine, ein Ziel</H2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
        {BAUSTEINE.map((b) => (
          <div key={b.titel} style={{ ...karte, padding: 16, display: "flex", gap: 12 }}>
            <span style={{ flexShrink: 0, width: 46, height: 46, borderRadius: 14, background: GOLD, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BausteinIcon art={b.icon} />
            </span>
            <span style={{ minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 15.5, fontWeight: 700, color: C.tinte, lineHeight: 1.25 }}>{b.titel}</span>
              <span style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#A67C00", marginTop: 2 }}>{b.kurz}</span>
              <span style={{ display: "block", fontSize: 13.5, fontWeight: 300, color: C.grau, lineHeight: 1.55, marginTop: 6 }}>{b.text}</span>
            </span>
          </div>
        ))}
      </div>

      <Trenner />

      {/* Kurskonzept */}
      <Kicker>Das Kurskonzept</Kicker>
      <H2>Drei Stränge, die zusammenlaufen</H2>
      <Absatz>
        Pen & Paper ist das Fundament: Von Anfang an schreibst du jede Aufgabe so auf, dass du sie selbst verstehst und
        Fehler sofort findest. Darauf bauen die Themenblöcke auf – Analysis, Vektoren, Stochastik. Und durch alle Monate zieht
        sich das Mindset-Training. Am Ende laufen alle drei Stränge zusammen: in deinem Abi.
      </Absatz>
      <div style={{ ...karte, padding: "16px 14px 14px" }}>
        <div className="mc-scroll" style={{ overflowX: "auto" }}>
          <KonzeptGrafik />
        </div>
        <Legende />
      </div>

      {/* Monat für Monat */}
      <p style={{ fontSize: 13, fontWeight: 600, color: C.see, margin: "22px 0 10px" }}>Monat für Monat – tippe einen Monat an</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 6 }}>
        {MONATE.map((x, i) => (
          <button key={x.m} type="button" onClick={() => setMonat(i)}
            style={{ height: 52, borderRadius: 12, cursor: "pointer", fontFamily: "inherit", padding: 0, position: "relative",
              border: `1.5px solid ${monat === i ? NAVY : C.linie}`, background: monat === i ? NAVY : C.weiss,
              color: monat === i ? MIND : C.tinte, fontSize: 17, fontWeight: 800 }}>
            {x.m}
            {x.intensiv && <span aria-hidden="true" style={{ position: "absolute", top: 5, right: 5, width: 8, height: 8, background: MIND, transform: "rotate(45deg)", border: `1px solid ${NAVY}` }} />}
          </button>
        ))}
      </div>
      <div key={monat} className="mc-neu" style={{ ...karte, padding: 18, marginTop: 10 }}>
        <style>{`.mc-neu{animation:mcNeu .35s cubic-bezier(.2,.7,.3,1) both}@keyframes mcNeu{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}`}</style>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: C.hellgrau }}>MONAT {M.m}</p>
        <p style={{ fontSize: 21, fontWeight: 700, color: NAVY, marginBottom: 12 }}>{M.titel}</p>
        {[
          [M.pen ? "Fundament" : "Themenblock", M.thema, M.pen ? PEN : THEMA],
          ["Pen & Paper", M.pen ? "Die Methode im Detail – ab jetzt in jeder Aufgabe angewendet" : "Jede Aufgabe nach der Methode – 20-Minuten-Routinen zweimal pro Woche", PEN],
          ["Mindset", M.mind, MIND],
        ].map(([k, t, f]) => (
          <div key={k} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10 }}>
            <span style={{ flexShrink: 0, width: 6, alignSelf: "stretch", borderRadius: 3, background: f }} />
            <span>
              <span style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.hellgrau, letterSpacing: "0.04em" }}>{k.toUpperCase()}</span>
              <span style={{ display: "block", fontSize: 14.5, color: C.tinte, lineHeight: 1.55 }}>{t}</span>
            </span>
          </div>
        ))}
        {M.intensiv && (
          <div style={{ marginTop: 6, padding: "10px 12px", borderRadius: 12, background: GOLD, color: NAVY, fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
            <BausteinIcon art="intensiv" /> {M.intensiv} – zwei Samstage zur Wahl
          </div>
        )}
      </div>

      <Trenner />

      {/* Wochenrhythmus */}
      <Kicker>Dein Wochenrhythmus</Kicker>
      <H2>Klein, regelmäßig, wirksam</H2>
      <Absatz>Große Veränderung entsteht aus kleinen Routinen. So könnte eine typische Woche aussehen:</Absatz>
      <div style={{ ...karte, padding: "8px 16px" }}>
        {WOCHE.map((w, i) => (
          <div key={w.tag} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0", borderBottom: i < WOCHE.length - 1 ? `1px solid ${C.linie}` : "none" }}>
            <span style={{ width: 30, fontSize: 14, fontWeight: 800, color: NAVY }}>{w.tag}</span>
            <span style={{ width: 10, height: 10, borderRadius: 999, background: w.farbe, flexShrink: 0 }} />
            <span style={{ fontSize: 14.5, color: C.tinte }}>{w.t}</span>
          </div>
        ))}
      </div>

      <Trenner />

      {/* Intensivtage */}
      <Kicker>Die Intensivtage</Kicker>
      <H2>Sechs Stunden, die alles zusammenbringen</H2>
      <Absatz>
        Drei Mal im Programm kommt ihr einen ganzen Samstag zusammen. Jeder Intensivtag wird an zwei Terminen angeboten,
        damit jeder dabei sein kann – du entscheidest, welcher Samstag besser passt.
      </Absatz>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8, marginBottom: 12 }}>
        {["Termin A", "Termin B"].map((t, i) => (
          <div key={t} style={{ ...karte, padding: "12px 14px", border: `1.5px solid ${i === 0 ? MIND : C.linie}` }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: C.hellgrau, letterSpacing: "0.06em" }}>{t.toUpperCase()}</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: NAVY }}>Samstag</p>
            <p style={{ fontSize: 13, color: C.grau, fontWeight: 300 }}>10:00 – 16:00 Uhr</p>
          </div>
        ))}
      </div>
      <div style={{ ...karte, padding: "14px 16px" }}>
        {TAG.map((x, i) => (
          <div key={x.z} style={{ display: "flex", gap: 14, position: "relative", paddingBottom: i < TAG.length - 1 ? 14 : 0 }}>
            <span style={{ width: 46, flexShrink: 0, fontSize: 13.5, fontWeight: 700, color: NAVY, fontVariantNumeric: "tabular-nums" }}>{x.z}</span>
            <span style={{ position: "relative", width: 12, flexShrink: 0 }}>
              <span style={{ position: "absolute", top: 4, left: 1, width: 10, height: 10, borderRadius: 999, background: i === 2 ? C.linie : MIND, border: `2px solid ${NAVY}` }} />
              {i < TAG.length - 1 && <span style={{ position: "absolute", top: 16, bottom: -4, left: 5, width: 2, background: C.linie }} />}
            </span>
            <span>
              <span style={{ display: "block", fontSize: 14.5, fontWeight: 600, color: C.tinte }}>{x.t}</span>
              <span style={{ display: "block", fontSize: 13, fontWeight: 300, color: C.grau }}>{x.s}</span>
            </span>
          </div>
        ))}
      </div>

      <Trenner />

      {/* Mindset */}
      <Kicker>Mindset-Training</Kicker>
      <H2>Mathe beginnt im Kopf</H2>
      <Absatz>
        Die meisten Schüler scheitern nicht an der Mathematik, sondern an Sätzen wie „Ich bin halt kein Mathe-Typ“.
        Deshalb trainieren wir Haltung genauso konsequent wie Rechnen – mit kurzen, wirksamen Übungen.
      </Absatz>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 8 }}>
        {MINDSET.map((x, i) => (
          <div key={x.t} style={{ ...karte, padding: "14px 16px", display: "flex", gap: 12 }}>
            <span style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 999, background: NAVY, color: MIND, fontSize: 13, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
            <span>
              <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: C.tinte }}>{x.t}</span>
              <span style={{ display: "block", fontSize: 13.5, fontWeight: 300, color: C.grau, lineHeight: 1.55, marginTop: 3 }}>{x.s}</span>
            </span>
          </div>
        ))}
      </div>

      <Trenner />

      {/* Vorher / Nachher */}
      <Kicker>Deine Verwandlung</Kicker>
      <H2>Eine komplett andere Version von dir</H2>
      <div style={{ ...karte, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          <p style={{ padding: "10px 14px", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: C.hellgrau, background: "#F4F6FA" }}>VORHER</p>
          <p style={{ padding: "10px 14px", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: NAVY, background: GOLD }}>NACHHER</p>
          {[
            ["„Ich bin halt kein Mathe-Typ.“", "„Ich weiß, wie ich an jede Aufgabe rangehe.“"],
            ["Chaos auf dem Blatt, Fehler unauffindbar", "Saubere Rechenwege, Fehler sofort gefunden"],
            ["Lernen auf den letzten Drücker", "Feste Routinen, entspannt vor der Klausur"],
            ["Blackout in der Prüfung", "Ruhe, Plan und ein klarer Kopf"],
            ["Mathe als Pflicht", "Mathe als Fach, das Spaß macht"],
          ].map(([a, b], i) => (
            <React.Fragment key={i}>
              <p style={{ padding: "12px 14px", fontSize: 13.5, color: C.grau, fontWeight: 300, lineHeight: 1.5, borderTop: `1px solid ${C.linie}` }}>{a}</p>
              <p style={{ padding: "12px 14px", fontSize: 13.5, color: C.tinte, fontWeight: 600, lineHeight: 1.5, borderTop: `1px solid ${C.linie}`, borderLeft: `1px solid ${C.linie}` }}>{b}</p>
            </React.Fragment>
          ))}
        </div>
      </div>

      <Trenner />

      {/* Für wen */}
      <Kicker>Für wen</Kicker>
      <H2>Für alle, die mehr wollen</H2>
      <div style={{ ...karte, padding: "6px 16px" }}>
        {[
          "Du bist in der Oberstufe und hast Mathe im Abi – egal ob Basis- oder Leistungsfach.",
          "Du willst nicht nur bestehen, sondern zeigen, was in dir steckt.",
          "Du bist bereit, sechs Monate dranzubleiben – mit einer Gruppe, die dich mitzieht.",
        ].map((t, i) => (
          <div key={i} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: i < 2 ? `1px solid ${C.linie}` : "none" }}>
            <svg width="20" height="20" viewBox="0 0 20 20" style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true"><circle cx="10" cy="10" r="9" fill={MIND} /><path d="M6 10.2l2.6 2.6L14.2 7" stroke={NAVY} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span style={{ fontSize: 14.5, color: C.tinte, lineHeight: 1.55 }}>{t}</span>
          </div>
        ))}
      </div>

      {/* Abschluss */}
      <div style={{ marginTop: 30, borderRadius: 22, padding: "24px 20px", background: `linear-gradient(155deg, ${C.see} 0%, ${NAVY} 100%)`, color: C.weiss, textAlign: "center" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", color: MIND }}>MATHE ABI MASTERCLASS</p>
        <p style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.3, margin: "8px 0 6px" }}>Bereit für deine beste Version?</p>
        <p style={{ fontSize: 14, color: "#C9D6EE", fontWeight: 300, lineHeight: 1.6, marginBottom: 16 }}>
          Die Plätze sind begrenzt, damit jeder persönlich betreut wird. Merk dich jetzt vor – du erfährst als Erstes, wann es losgeht.
        </p>
        <button type="button" onClick={() => setHinweis(true)} className="mc-kachel"
          style={{ background: GOLD, color: NAVY, border: "none", borderRadius: 999, padding: "13px 26px", fontSize: 15.5, fontWeight: 800, fontFamily: "inherit", cursor: "pointer",
            boxShadow: "0 6px 20px rgba(237,187,0,0.35)" }}>
          Platz vormerken
        </button>
        {hinweis && (
          <p style={{ fontSize: 13.5, color: MIND, marginTop: 12, lineHeight: 1.5 }}>
            Die Anmeldung öffnet in Kürze – Termine und alle Details folgen hier.
          </p>
        )}
      </div>
    </div>
  );
}
