import React, { useState } from "react";
import { C } from "./base1.jsx";
import { SatzZeilen } from "./baseSatz.jsx";
import { COACHING } from "./base3.jsx";

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


/* Schloss-Plakette für gesperrte Kacheln */
function SchlossPlakette({ farbe = "#0B1E4A" }) {
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
      <span style={{ width: 42, height: 42, borderRadius: 999, background: "rgba(255,255,255,0.94)", boxShadow: "0 3px 12px rgba(30,40,60,0.3)",
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke={farbe} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="11" width="14" height="10" rx="2.2" fill={farbe} />
          <path d="M 8 11 V 7.5 a 4 4 0 0 1 8 0 V 11" />
        </svg>
      </span>
    </div>
  );
}
const baldVerfuegbar = (farbe) => (
  <span style={{ marginTop: "auto", paddingTop: 6, fontSize: 12.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, opacity: 0.75 }}>
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke={farbe} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2.2" fill={farbe} /><path d="M 8 11 V 7.5 a 4 4 0 0 1 8 0 V 11" />
    </svg>
    Bald verfügbar
  </span>
);
/* Eigenschaften für eine gesperrte bzw. offene Kachel */
const kachelProps = (gesperrt, onClick, label, klasse) => (gesperrt
  ? { role: "button", "aria-disabled": "true", "aria-label": `${label} – noch gesperrt`, title: "Noch gesperrt", className: `${klasse} kachel-zu` }
  : { type: "button", onClick, "aria-label": label, className: klasse });

export function MasterclassKachel({ onClick, gesperrt, name = "Mathe Abi Masterclass", monate = "6 MONATE", knopf = "Programm ansehen" }) {
  const Tag = gesperrt ? "div" : "button";
  return (
    <Tag {...kachelProps(gesperrt, onClick, name, "mc-kachel")}
      style={{ userSelect: gesperrt ? "none" : undefined, display: "flex", width: "calc(100% + 32px)", marginLeft: -16, marginRight: -16, marginTop: 12, padding: 0, border: "none",
        borderRadius: 18, overflow: "hidden", cursor: gesperrt ? "not-allowed" : "pointer", fontFamily: "inherit", textAlign: "left", position: "relative",
        height: "calc(95px + 1.1 * clamp(15px, 4.1vw, 22px))", background: GOLD, color: NAVY,
        boxShadow: "0 10px 30px rgba(181,134,18,0.35), inset 0 0 0 1px rgba(255,255,255,0.55)" }}>
      <style>{`.mc-kachel{transition:transform .15s ease, box-shadow .15s ease}
        .mc-kachel:active{transform:scale(0.985)}
        @media (hover:hover){.mc-kachel:not(.kachel-zu):hover{transform:translateY(-2px);box-shadow:0 14px 36px rgba(181,134,18,0.45)}}
        .kachel-zu:active{transform:none}
        .mc-glanz{position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,0.35) 45%,transparent 60%);
          background-size:250% 100%;animation:mcGlanz 5.5s ease-in-out infinite;pointer-events:none}
        @keyframes mcGlanz{0%,60%{background-position:120% 0}100%{background-position:-120% 0}}`}</style>
      <span className="mc-glanz" aria-hidden="true" />
      <div style={{ flex: "1 1 63%", minWidth: 0, padding: "14px 10px 14px 16px", display: "flex", flexDirection: "column", position: "relative" }}>
        <h2 style={{ fontSize: "clamp(15px, 4.1vw, 22px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {name}
        </h2>
        <span aria-hidden="true" style={{ display: "block", width: 34, height: 2.5, borderRadius: 2, marginTop: 6, background: NAVY }} />
        <p style={{ fontSize: 12.5, fontWeight: 500, lineHeight: 1.4, marginTop: 6, marginBottom: 0, color: "#1B2A4F",
          display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", height: "4.2em" }}>
          <SatzZeilen text="Werde die beste Version von dir selbst. Für ein starkes Abi und Freude daran, endlich Mathe zu verstehen." />
        </p>
        {gesperrt ? null : (
        <span style={{ marginTop: "auto", paddingTop: 6, fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
          {knopf}
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8.5 4l4 4-4 4" stroke={NAVY} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
        )}
      </div>
      <div style={{ flex: "0 0 37%", position: "relative", borderLeft: "1px solid rgba(11,30,74,0.12)" }}>
        <span style={{ position: "absolute", top: 10, left: 10, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", background: NAVY, color: MIND,
          padding: "3px 7px", borderRadius: 999, zIndex: 1 }}>{monate}</span>
        <div style={{ position: "absolute", inset: "30px 6px 8px 2px", opacity: gesperrt ? 0.55 : 1 }}><MasterclassLogo /></div>
        {gesperrt && <SchlossPlakette farbe={NAVY} />}
      </div>
    </Tag>
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

export function MatheCheckenKachel({ onClick, gesperrt }) {
  const Tag = gesperrt ? "div" : "button";
  return (
    <Tag {...kachelProps(gesperrt, onClick, "Mathe checken", "mc-kachel mc-silber")}
      style={{ userSelect: gesperrt ? "none" : undefined, display: "flex", width: "calc(100% + 32px)", marginLeft: -16, marginRight: -16, marginTop: 12, padding: 0, border: "none",
        borderRadius: 18, overflow: "hidden", cursor: gesperrt ? "not-allowed" : "pointer", fontFamily: "inherit", textAlign: "left", position: "relative",
        height: "calc(95px + 1.1 * clamp(15px, 4.1vw, 22px))", background: SILBER, color: NAVY,
        boxShadow: "0 8px 24px rgba(60,72,92,0.28), inset 0 0 0 1px rgba(255,255,255,0.8)" }}>
      <style>{`.mc-kachel{transition:transform .15s ease, box-shadow .15s ease}
        .mc-kachel:active{transform:scale(0.985)}
        @media (hover:hover){.mc-kachel:not(.kachel-zu):hover{transform:translateY(-2px)}}
        .kachel-zu:active{transform:none}
        .mc-glanz{position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,0.55) 45%,transparent 60%);
          background-size:250% 100%;animation:mcGlanz 5.5s ease-in-out infinite;pointer-events:none}
        .mc-silber .mc-glanz{animation-delay:1.2s}
        @keyframes mcGlanz{0%,60%{background-position:120% 0}100%{background-position:-120% 0}}`}</style>
      <span className="mc-glanz" aria-hidden="true" />
      <div style={{ flex: "1 1 63%", minWidth: 0, padding: "10px 8px 10px 16px", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative" }}>
        <h2 style={{ fontSize: "clamp(21px, 6.2vw, 32px)", fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.02, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          Mathe checken
        </h2>
        <span aria-hidden="true" style={{ display: "block", width: 34, height: 2.5, borderRadius: 2, marginTop: 5, background: NAVY }} />
        <p style={{ fontSize: 12.5, fontWeight: 500, lineHeight: 1.4, marginTop: 5, marginBottom: 0, color: "#1B2A4F",
          display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", height: "4.2em" }}>
          <SatzZeilen text="In zwei Monaten Lücken schließen, Mathe verstehen und sicher werden." />
        </p>
      </div>
      <div style={{ flex: "0 0 37%", position: "relative", borderLeft: "1px solid rgba(11,30,74,0.12)" }}>
        <span style={{ position: "absolute", top: 10, left: 10, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", background: NAVY, color: "#E4E8EE",
          padding: "3px 7px", borderRadius: 999, zIndex: 1 }}>2 MONATE</span>
        <div style={{ position: "absolute", inset: "14px 8px 8px 8px", opacity: gesperrt ? 0.5 : 1 }}><CheckenLogo /></div>
        {gesperrt && <SchlossPlakette farbe={NAVY} />}
      </div>
    </Tag>
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

/* ---------- „Mathe Creator“: 3-Monats-Programm, schwarz und geheimnisvoll, noch gesperrt ---------- */

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
    <div role="button" aria-disabled="true" aria-label="Mathe Creator – noch gesperrt" title="Noch gesperrt" className="mcr-kachel"
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
      <div style={{ flex: "1 1 67%", minWidth: 0, padding: "10px 6px 10px 16px", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative" }}>
        <h2 style={{ fontSize: "clamp(21px, 6.2vw, 32px)", fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.02, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          background: "linear-gradient(180deg,#FFFFFF 0%,#D5D9E2 55%,#9AA3B3 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
          Mathe Creator
        </h2>
        <span aria-hidden="true" style={{ display: "block", width: 34, height: 2.5, borderRadius: 2, marginTop: 5, background: "linear-gradient(90deg,#6E5BD8 0%,#B7A9FF 100%)" }} />
        <p style={{ fontSize: 12.5, fontWeight: 300, lineHeight: 1.4, marginTop: 5, marginBottom: 0, color: "rgba(255,255,255,0.78)",
          overflow: "hidden", height: "4.2em" }}>
          <SatzZeilen text="Noch geheim. In drei Monaten erschaffst du Mathe." />
        </p>
      </div>
      <div style={{ flex: "0 0 33%", position: "relative", borderLeft: "1px solid rgba(255,255,255,0.08)" }}>
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

/* Bausteine der Seite „Mathe checken“ */
const H2 = ({ children }) => <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 12 }}>{children}</h2>;
const Absatz = ({ children, style }) => <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.8, marginBottom: 16, ...style }}>{children}</p>;
const karte = { background: C.weiss, borderRadius: 18, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" };

/* ======================================================================
   VERKAUFSSEITE „MATHE-ABI-MASTERCLASS“ (ansicht "masterclass", hinter ANGEBOT.kurse bzw. Passwort)

   Dramaturgie: Blockbuster-StorySkript (Alexander Christiani). Der Schüler ist der Held, Basti der Mentor.
     1. HELD      Identität · Wunsch · Einsatz                → Kopf (Goldlack) + Vertrauensleiste
     2. PROBLEM   äußeres · inneres · Gegenspieler (Mythos)  → „Kennst du das?“, durchgestrichenes „Mathetalent“
     3. MENTOR    Empathie · Autorität · Haltung              → Bastis Weg 2 → 1,0, Studium, System
     4. LÖSUNG    3-Schritte-Plan · Versprechen · Werkzeuge   → Plan, kostenlose Werkzeuge vs. Programm,
                                                                Monat für Monat, Intensivtag, Für wen, Vorher/Nachher
     5. REISE     Handlung · Erfolg · Scheitern               → Zwei Wege, So geht es los, Fragen, Abschluss
   Ein direkter Knopf („Platz vormerken“) im Kopf, nach der Lösung und am Schluss, auf dem Handy als feste
   Leiste; ein Übergangs-Knopf („Kostenlos starten“) führt in die freie Masterclass (/abi).
   Nur echte Fakten – keine Preise, keine erfundenen Stimmen, Zahlen oder Siegel. Kontakt: COACHING in base3.jsx.
   ====================================================================== */
const VK = {
  schwarz: "#0B0C10", nacht: "#14120A", gold: "#EDBB00", praeg: "#5A4300", tinte: "#1B1606", papier: "#FFFDF6", creme: "#FBF5E3",
  text: "#3A3010", still: "#6B5A26", linie: "rgba(90,67,0,0.16)", weiss: "#FFFFFF", hellText: "rgba(255,255,255,0.82)", rot: "#B3261E",
  lack: "linear-gradient(150deg, #FFE9A0 0%, #F4CE4A 26%, #EDBB00 55%, #C99A0C 84%, #9C7400 100%)",
};
const VK_CSS = `
.mcs{font-family:Montserrat,system-ui,sans-serif;color:${VK.tinte};background:${VK.creme};padding-bottom:40px}
.mcs *,.mcs *::before,.mcs *::after{box-sizing:border-box}
:where(.mcs) :where(h1,h2,h3,p,ul,ol,dl,dd){margin:0}
.mcs ul,.mcs ol{list-style:none;padding:0}
.mcs-innen{width:100%;max-width:1080px;margin:0 auto;padding:0 20px}
@media (min-width:840px){.mcs-innen{padding:0 32px}}
.mcs-schmal{max-width:780px}
.mcs-sektion{padding:clamp(56px,8vw,104px) 0}
.mcs-dunkel{background:linear-gradient(160deg,${VK.schwarz} 0%,${VK.nacht} 100%);color:${VK.weiss}}
.mcs-eyebrow{display:block;font-size:12px;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;color:#7A5C00;margin-bottom:12px}
.mcs-dunkel .mcs-eyebrow{color:${VK.gold}}
.mcs-h1{font-size:clamp(38px,7.4vw,74px);font-weight:900;letter-spacing:-0.045em;line-height:0.98;color:${VK.schwarz};text-wrap:balance;max-width:14ch}
.mcs-h2{font-size:clamp(28px,4.6vw,46px);font-weight:800;letter-spacing:-0.035em;line-height:1.06;text-wrap:balance;max-width:20ch}
.mcs-h3{font-size:19px;font-weight:800;letter-spacing:-0.02em;line-height:1.25}
.mcs-lead{font-size:clamp(16px,2.1vw,19px);line-height:1.6;color:${VK.text};max-width:56ch}
.mcs-dunkel .mcs-lead{color:${VK.hellText}}
.mcs-text{font-size:15.5px;line-height:1.7;color:${VK.text}}
.mcs-dunkel .mcs-text{color:${VK.hellText}}
.mcs-klein{font-size:13px;line-height:1.55;color:${VK.still}}
.mcs-dunkel .mcs-klein{color:rgba(255,255,255,0.6)}
.mcs-strich{display:block;width:48px;height:4px;border-radius:2px;background:linear-gradient(90deg,${VK.praeg},${VK.gold});margin:18px 0 22px}
.mcs-raster{display:grid;gap:16px}
@media (min-width:840px){.mcs-raster.zwei{grid-template-columns:1fr 1fr}.mcs-raster.drei{grid-template-columns:repeat(3,1fr)}}
.mcs-karte{border:1px solid transparent;border-radius:22px;padding:22px;background:${VK.papier} padding-box,linear-gradient(135deg,rgba(255,233,160,0.95),rgba(201,154,12,0.5) 50%,rgba(90,67,0,0.45)) border-box;
  box-shadow:0 20px 40px -28px rgba(90,67,0,0.55)}
.mcs-dunkel .mcs-karte{background:rgba(255,255,255,0.04) padding-box,linear-gradient(135deg,rgba(255,233,160,0.7),rgba(237,187,0,0.2) 55%,rgba(237,187,0,0.5)) border-box;box-shadow:none}
.mcs-karte.gold{background:${VK.lack} padding-box,linear-gradient(135deg,#FFFFFF,rgba(90,67,0,0.5)) border-box;color:${VK.schwarz}}
.mcs-karte.gold .mcs-text{color:#2A1F00}
.mcs-knopf{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:54px;padding:0 26px;border:none;border-radius:999px;font:inherit;font-size:16px;font-weight:800;
  letter-spacing:-0.01em;cursor:pointer;transition:transform .15s ease,filter .15s ease;text-align:center}
.mcs-knopf.schwarz{background:${VK.schwarz};color:${VK.gold};box-shadow:0 14px 30px -14px rgba(11,12,16,0.8)}
.mcs-knopf.gold{background:linear-gradient(150deg,#FFE9A0 0%,#F4CE4A 28%,#EDBB00 55%,#D9A520 78%,#B58612 100%);color:${VK.schwarz};box-shadow:0 14px 30px -14px rgba(237,187,0,0.9),inset 0 1px 0 rgba(255,255,255,0.6)}
.mcs-knopf.rand{background:transparent;color:inherit;box-shadow:inset 0 0 0 1.5px currentColor}
@media (hover:hover){.mcs-knopf:hover{transform:translateY(-1px);filter:brightness(1.06)}}
.mcs-knopf:focus-visible{outline:3px solid ${VK.schwarz};outline-offset:3px}
.mcs-dunkel .mcs-knopf:focus-visible{outline-color:${VK.gold}}
.mcs-unter{display:block;margin-top:8px;font-size:12.5px;font-weight:600;color:${VK.still}}
.mcs-dunkel .mcs-unter{color:rgba(255,255,255,0.6)}
.mcs-knoepfe{display:flex;flex-wrap:wrap;gap:12px 16px;align-items:flex-start}
/* Kopf */
.mcs-kopf{position:relative;overflow:hidden;isolation:isolate;background:${VK.lack}}
.mcs-kopf::before{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(118deg,rgba(255,255,255,0.55) 0%,transparent 40%),radial-gradient(60% 90% at 90% 110%,rgba(255,246,214,0.6),transparent 60%)}
.mcs-kopf-innen{padding-top:clamp(40px,7vw,88px);padding-bottom:clamp(44px,7vw,92px);display:grid;gap:28px;align-items:center}
@media (min-width:900px){.mcs-kopf-innen{grid-template-columns:minmax(0,1.35fr) minmax(0,0.65fr)}}
.mcs-held{display:flex;flex-wrap:wrap;gap:8px;margin:22px 0 26px}
.mcs-held span{display:inline-flex;align-items:center;min-height:34px;padding:0 14px;border-radius:999px;background:rgba(255,255,255,0.45);border:1px solid rgba(90,67,0,0.25);font-size:13.5px;font-weight:700;color:#2A1F00}
.mcs-siegel{width:min(72vw,320px);justify-self:center}
@media (max-width:899px){.mcs-siegel{display:none}}
.mcs-vertrauen{background:${VK.schwarz};color:${VK.weiss}}
.mcs-vertrauen ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px 24px;padding:24px 0}
@media (min-width:840px){.mcs-vertrauen ul{grid-template-columns:repeat(4,minmax(0,1fr))}}
.mcs-vertrauen b{display:block;font-size:15px;font-weight:800;color:${VK.gold}}
.mcs-vertrauen span{display:block;margin-top:3px;font-size:12.5px;line-height:1.45;color:rgba(255,255,255,0.7)}
/* Problem */
.mcs-ebene{display:grid;grid-template-columns:44px 1fr;gap:14px;align-items:start}
.mcs-ebene i{width:44px;height:44px;border-radius:999px;display:flex;align-items:center;justify-content:center;background:${VK.schwarz};color:${VK.gold};font-style:normal;font-weight:900;font-size:16px}
.mcs-mythos{position:relative;display:inline-block;color:${VK.schwarz}}
.mcs-mythos::after{content:"";position:absolute;left:-4%;right:-4%;top:52%;height:0.12em;border-radius:999px;background:${VK.rot};transform:rotate(-4deg);
  clip-path:inset(0 100% 0 0);animation:mcsStreich 0.9s 0.6s cubic-bezier(.6,.1,.3,1) forwards}
@keyframes mcsStreich{to{clip-path:inset(0 0 0 0)}}
@media (prefers-reduced-motion:reduce){.mcs-mythos::after{animation:none;clip-path:none}.mcs-knopf{transition:none}}
/* Mentor */
.mcs-zahl{display:flex;align-items:baseline;gap:14px;margin-top:10px}
.mcs-zahl b{font-size:clamp(46px,9vw,84px);font-weight:900;letter-spacing:-0.05em;line-height:1}
.mcs-zahl .von{color:rgba(255,255,255,0.35);text-decoration:line-through;text-decoration-thickness:4px;text-decoration-color:${VK.rot}}
.mcs-zahl .zu{color:${VK.gold}}
/* Plan */
.mcs-schritt{position:relative;padding-top:58px}
.mcs-schritt .nr{position:absolute;top:18px;left:22px;font-size:13px;font-weight:900;letter-spacing:0.12em;color:#7A5C00}
.mcs-schritt ul{margin-top:12px;display:grid;gap:8px}
.mcs-schritt li,.mcs-haken li{display:grid;grid-template-columns:20px 1fr;gap:10px;font-size:14.5px;line-height:1.5;color:${VK.text}}
.mcs-dunkel .mcs-haken li{color:${VK.hellText}}
.mcs-haken{display:grid;gap:10px}
/* Monate */
.mcs-monate{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px}
.mcs-monate button{min-height:56px;border-radius:14px;border:1.5px solid rgba(237,187,0,0.35);background:rgba(255,255,255,0.04);color:#fff;font:inherit;font-size:18px;font-weight:900;cursor:pointer;position:relative}
.mcs-monate button[aria-pressed="true"]{background:${VK.gold};color:${VK.schwarz};border-color:${VK.gold}}
.mcs-monate button i{position:absolute;top:6px;right:6px;width:8px;height:8px;transform:rotate(45deg);background:${VK.gold};border:1px solid ${VK.schwarz}}
/* Vorher/Nachher */
.mcs-vn{display:grid;grid-template-columns:1fr 1fr;border-radius:22px;overflow:hidden;border:1px solid ${VK.linie};background:${VK.papier}}
.mcs-vn p{padding:14px 16px;font-size:14.5px;line-height:1.5;border-top:1px solid ${VK.linie}}
.mcs-vn .k{border-top:none;font-size:12px;font-weight:800;letter-spacing:0.12em}
.mcs-vn .n{border-left:1px solid ${VK.linie};font-weight:700;color:${VK.schwarz}}
/* Wege */
.mcs-weg{border-radius:22px;padding:24px}
.mcs-weg.gut{background:${VK.lack};color:${VK.schwarz}}
.mcs-weg.schlecht{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.14)}
/* Fragen */
.mcs-frage{border-bottom:1px solid ${VK.linie}}
.mcs-frage summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;gap:16px;padding:18px 0;font-size:16.5px;font-weight:800;letter-spacing:-0.01em}
.mcs-frage summary::-webkit-details-marker{display:none}
.mcs-frage summary::after{content:"+";flex:none;width:30px;height:30px;border-radius:999px;background:${VK.schwarz};color:${VK.gold};display:flex;align-items:center;justify-content:center;font-weight:900}
.mcs-frage[open] summary::after{content:"−"}
.mcs-frage p{padding:0 0 18px;font-size:15px;line-height:1.7;color:${VK.text};max-width:64ch}
/* Leiste Handy */
.mcs-leiste{position:fixed;left:0;right:0;bottom:0;z-index:60;padding:10px 16px calc(10px + env(safe-area-inset-bottom));background:rgba(11,12,16,0.94);backdrop-filter:blur(8px);
  display:flex;gap:10px;align-items:center;transform:translateY(110%);transition:transform .25s ease}
.mcs-leiste.an{transform:none}
.mcs-leiste p{flex:1;min-width:0;font-size:13px;font-weight:700;color:#fff;line-height:1.3}
.mcs-leiste .mcs-knopf{min-height:44px;padding:0 18px;font-size:14.5px}
@media (min-width:840px){.mcs-leiste{display:none}}
.mcs-hinweis{margin-top:14px;padding:12px 14px;border-radius:14px;background:rgba(237,187,0,0.14);border:1px solid rgba(237,187,0,0.45);font-size:14px;line-height:1.55;max-width:60ch}
`;

const HakenIcon = ({ dunkel }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" style={{ marginTop: 1 }}><circle cx="10" cy="10" r="9" fill={VK.gold} /><path d="M6 10.2l2.6 2.6L14.2 7" stroke={dunkel ? VK.schwarz : VK.schwarz} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const KreuzIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" style={{ marginTop: 1 }}><circle cx="10" cy="10" r="9" fill="rgba(255,255,255,0.12)" /><path d="M7 7l6 6M13 7l-6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></svg>
);

/* Siegel wie auf der Kachel der Masterclass (Lorbeer, Bänder, ABI) – hier als große Prägung */
function SiegelGross() {
  const blatt = (seite) => [0, 1, 2, 3, 4, 5].map((i) => {
    const grad = seite < 0 ? 248 - i * 16 : 292 + i * 16;
    const w = (grad * Math.PI) / 180, x = 84 + Math.cos(w) * 44, y = 56 - Math.sin(w) * 44;
    return <ellipse key={`${seite}${i}`} cx={x.toFixed(1)} cy={y.toFixed(1)} rx="7.2" ry="3.2" transform={`rotate(${(-(grad + 90) + (seite < 0 ? -25 : 25)).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})`} fill="url(#mcs-p)" />;
  });
  return (
    <svg className="mcs-siegel" viewBox="20 0 128 122" aria-hidden="true">
      <defs><linearGradient id="mcs-p" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#2A1F00" /><stop offset="50%" stopColor="#8A6A00" /><stop offset="100%" stopColor="#2A1F00" /></linearGradient></defs>
      <path d="M70 88 L60 118 L70 111 L77 119 L82 92 Z M98 88 L108 118 L98 111 L91 119 L86 92 Z" fill="url(#mcs-p)" />
      {blatt(-1)}{blatt(1)}
      <circle cx="84" cy="56" r="36" fill="rgba(255,255,255,0.32)" stroke="url(#mcs-p)" strokeWidth="3.4" />
      <circle cx="84" cy="56" r="29" fill="none" stroke={VK.schwarz} strokeOpacity="0.55" strokeWidth="1.2" strokeDasharray="2 3" />
      <text x="84" y="57" textAnchor="middle" fontSize="21" fontWeight="900" fill={VK.schwarz} fontFamily="Montserrat, sans-serif">ABI</text>
      <path d="M66 70 C 74 70, 78 62, 84 64 S 94 72, 102 62" stroke="url(#mcs-p)" strokeWidth="2.6" fill="none" strokeLinecap="round" />
    </svg>
  );
}

const PLAN = [
  { nr: "Schritt 1", titel: "Standort und Plan", text: "Du sagst, wo du stehst und wann du schreibst. Daraus entsteht dein Weg bis zum Prüfungstag – rückwärts gerechnet, mit Probeabis und Generalprobe.",
    punkte: ["Abi-Profil: Bundesland, Kurs, Prüfungsform, Termin", "Rückwärtsplan mit Phasen und Probeabis", "Jeden Tag ein klarer nächster Schritt"] },
  { nr: "Schritt 2", titel: "Ein System, das trägt", text: "Pen & Paper als Fundament, die Themenblöcke Analysis, Geometrie und Stochastik – und durch alle Monate das Mindset-Training.",
    punkte: ["Sauber aufschreiben: ein Schritt pro Zeile", "Jedes Abi-Thema verstehen, nicht auswendig lernen", "Routinen gegen Stress und Blackout"] },
  { nr: "Schritt 3", titel: "Trainieren mit Feedback", text: "Aufgaben im Prüfungsformat, unter Zeit, mit Erwartungshorizont. Mia korrigiert dein Blatt nach BE – und sagt dir, wo die nächsten Punkte liegen.",
    punkte: ["Abi-Aufgaben und Teil-A-Probe wie im Leistungsfach", "Mia: Korrektur, Aufgaben entschlüsseln, mündliche Prüfung", "Live-Calls und drei Intensivtage"] },
];
const FRAGEN = [
  ["Was kostet die Masterclass?", "Preis und Starttermin stehen noch nicht fest. Vormerken ist unverbindlich – du erfährst als Erstes, wann es losgeht und was es kostet. Die Werkzeuge der Masterclass (Abi-Plan, Abi-Aufgaben, Teil-A-Probe, Mia, Lernpartner) kannst du schon jetzt kostenlos nutzen."],
  ["Für welchen Kurs ist das – LK, GK, Basisfach?", "Für alle, die Mathe im Abi haben. Im Leistungsfach trainierst du die schriftliche Prüfung mit Teil A und Teil B, im Basisfach die mündliche Prüfung: Vortrag und Prüfungsgespräch – Mia simuliert beides."],
  ["Gilt das auch außerhalb von Baden-Württemberg?", "Ausgearbeitet ist das Prüfungsformat für Baden-Württemberg. Die Aufgaben folgen dem IQB-Format, das alle Länder nutzen; deinen Termin und deinen Rechner trägst du selbst ein."],
  ["Wie viel Zeit brauche ich pro Woche?", "Der Rhythmus ist bewusst klein: ein Live-Call, eine Trainingssession und zweimal 20 Minuten Pen & Paper pro Woche, dazu dein Tagesschritt im Abi-Plan. Dreimal im Programm kommt ein Intensivtag am Samstag dazu."],
  ["Was macht Mia genau?", "Mia ist die Abi-Trainerin in der App. Sie korrigiert ein Foto deiner Lösung nach Erwartungshorizont (mit Folgefehlern und anderen Lösungswegen), zeigt bei einer fremden Aufgabe, was jeder Operator verlangt, und nimmt dich mündlich dran. Sie verrät Lösungen nur, wenn du ausdrücklich fragst."],
  ["Ich bin eher schlecht in Mathe. Ist das trotzdem etwas für mich?", "Gerade dann. Die Masterclass setzt nicht auf Talent, sondern auf ein System. Wichtig ist nur eines: dass du sechs Monate dranbleibst."],
];

export function MasterclassSeite({ gehe }) {
  const [monat, setMonat] = useState(0);
  const [hinweis, setHinweis] = useState(false);
  const [leiste, setLeiste] = useState(false);
  const kopfRef = React.useRef(null), endeRef = React.useRef(null);
  const M = MONATE[monat];
  const kontaktDa = !!(COACHING.termin || COACHING.mail);
  React.useInsertionEffect(() => {
    if (typeof document === "undefined" || document.getElementById("mcs-stil")) return;
    const el = document.createElement("style"); el.id = "mcs-stil"; el.textContent = VK_CSS; document.head.appendChild(el);
  }, []);
  React.useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return undefined;
    let kopf = true, ende = false;
    const io = new IntersectionObserver((es) => { es.forEach((e) => { if (e.target === kopfRef.current) kopf = e.isIntersecting; if (e.target === endeRef.current) ende = e.isIntersecting; }); setLeiste(!kopf && !ende); }, { threshold: 0.05 });
    if (kopfRef.current) io.observe(kopfRef.current); if (endeRef.current) io.observe(endeRef.current);
    return () => io.disconnect();
  }, []);
  const vormerken = () => {
    if (COACHING.termin) { window.open(COACHING.termin, "_blank", "noopener"); return; }
    if (COACHING.mail) {
      const betreff = encodeURIComponent("Mathe-Abi-Masterclass: Platz vormerken");
      const text = encodeURIComponent("Hallo Basti,\n\nich möchte mir einen Platz in der Mathe-Abi-Masterclass vormerken.\n\nKlasse / Abi-Jahr:\nKurs (LK, GK, Basisfach):\n\nViele Grüße");
      window.location.href = `mailto:${COACHING.mail}?subject=${betreff}&body=${text}`;
      return;
    }
    setHinweis(true);
  };
  const frei = () => gehe && gehe({ ansicht: "abi" });
  const Hinweis = () => (hinweis && !kontaktDa ? (
    <p role="status" className="mcs-hinweis">Die Anmeldung öffnet in Kürze. Bis dahin nutzt du die Werkzeuge der Masterclass kostenlos – Abi-Plan, Abi-Aufgaben, Teil-A-Probe und Mia.</p>
  ) : null);
  const Knoepfe = ({ dunkel }) => (
    <div>
      <div className="mcs-knoepfe">
        <span><button type="button" className={dunkel ? "mcs-knopf gold" : "mcs-knopf schwarz"} onClick={vormerken} data-mcs-vormerken>Platz vormerken</button><span className="mcs-unter">Unverbindlich · du erfährst als Erstes vom Start</span></span>
        <span><button type="button" className="mcs-knopf rand" onClick={frei} data-mcs-frei>Kostenlos starten</button><span className="mcs-unter">Abi-Plan, Aufgaben und Mia – sofort</span></span>
      </div>
      <Hinweis />
    </div>
  );

  return (
    <div className="mcs" data-masterclass-seite>
      {/* ---------- 1 HELD: Identität · Wunsch · Einsatz ---------- */}
      <header className="mcs-kopf" ref={kopfRef}>
        <div className="mcs-innen mcs-kopf-innen">
          <div>
            <span className="mcs-eyebrow" style={{ color: VK.praeg }}>Mathe-Abi-Masterclass · Oberstufe</span>
            <h1 className="mcs-h1">Ins Mathe-Abi mit einem Plan, der funktioniert.</h1>
            <p className="mcs-lead" style={{ marginTop: 20, color: "#2A1F00" }}>
              Du bist in der Oberstufe, das Abi rückt näher – und du willst nicht nur irgendwie bestehen. Du willst wissen, wie du an jede Aufgabe rangehst, und am Prüfungstag ruhig bleiben.
            </p>
            <div className="mcs-held" aria-label="Für wen">
              <span>Leistungsfach, Grundkurs, Basisfach</span><span>Schriftlich und mündlich</span><span>Sechs Monate bis zum Abi-Finale</span>
            </div>
            <Knoepfe />
          </div>
          <SiegelGross />
        </div>
      </header>
      <div className="mcs-vertrauen">
        <div className="mcs-innen"><ul>
          <li><b>Mathestudium</b><span>Universität Konstanz</span></li>
          <li><b>Jahre als Mathecoach</b><span>Einzeln und in Gruppen, bis zum Abitur</span></li>
          <li><b>Prüfungsformat 2027</b><span>Teil A und B, BE, Operatoren, Termine</span></li>
          <li><b>Werkzeuge kostenlos</b><span>Abi-Plan, Aufgaben, Mia – ohne Anmeldung testen</span></li>
        </ul></div>
      </div>

      {/* ---------- 2 PROBLEM: äußeres · inneres · Gegenspieler ---------- */}
      <section className="mcs-sektion">
        <div className="mcs-innen">
          <span className="mcs-eyebrow">Kennst du das?</span>
          <h2 className="mcs-h2">Drei Jahre Stoff, 300 Minuten Prüfung – und das Gefühl, dass es nicht reicht.</h2>
          <span className="mcs-strich" />
          <div className="mcs-raster drei">
            <div className="mcs-karte mcs-ebene"><i>1</i><div><h3 className="mcs-h3">Die Lücken</h3><p className="mcs-text" style={{ marginTop: 6 }}>Ableitung, Vektoren, Binomialverteilung – irgendwo fehlt immer ein Stück. Teil A ohne Rechner, und der Stoff von vor zwei Jahren ist weg.</p></div></div>
            <div className="mcs-karte mcs-ebene"><i>2</i><div><h3 className="mcs-h3">Das Gefühl</h3><p className="mcs-text" style={{ marginTop: 6 }}>„Ich bin halt kein Mathe-Typ.“ Vor jeder Klausur der gleiche Druck, in der Prüfung der Blackout – und zu Hause die Frage, warum es nicht klappt.</p></div></div>
            <div className="mcs-karte mcs-ebene"><i>3</i><div><h3 className="mcs-h3">Der Gegenspieler</h3><p className="mcs-text" style={{ marginTop: 6 }}>Nicht Mathe ist das Problem, sondern ein Satz, den fast jeder glaubt: dass man dafür ein Talent braucht.</p></div></div>
          </div>
          <p className="mcs-h2" style={{ marginTop: 44, maxWidth: "none" }}>
            <span className="mcs-mythos">Mathetalent</span> <span style={{ color: VK.praeg }}>ist ein Mythos.</span>
          </p>
          <p className="mcs-lead" style={{ marginTop: 12 }}>Wer Mathe kann, hat ein System: wie er aufschreibt, wie er übt, wie er mit Fehlern umgeht. Und ein System kann man lernen.</p>
        </div>
      </section>

      {/* ---------- 3 MENTOR: Empathie · Autorität · Haltung ---------- */}
      <section className="mcs-sektion mcs-dunkel">
        <div className="mcs-innen mcs-raster zwei" style={{ alignItems: "center", gap: 40 }}>
          <div>
            <span className="mcs-eyebrow">Dein Mentor</span>
            <h2 className="mcs-h2">Ich kenne das. Ich war selbst kein Überflieger.</h2>
            <span className="mcs-strich" />
            <p className="mcs-text">Ich bin Basti. In meinen ersten drei Jahren am Gymnasium stand in Mathe eine 2 – solide, aber nicht mehr. Ab Klasse 8 habe ich anders gelernt: sauber aufgeschrieben, mit System geübt, Fehler ernst genommen. Ab Klasse 10 stand da eine 1,0.</p>
            <p className="mcs-text" style={{ marginTop: 14 }}>Heute studiere ich Mathematik an der Universität Konstanz und begleite seit Jahren Schüler bis zum Abitur. Aus der Frage, an welchen Stellschrauben es wirklich hängt, ist das Trainingssystem von Mythos Mathe entstanden – und daraus die Masterclass.</p>
          </div>
          <div className="mcs-karte">
            <span className="mcs-eyebrow">Mathe am Gymnasium</span>
            <div className="mcs-zahl"><b className="von">2</b><b className="zu">1,0</b></div>
            <p className="mcs-text" style={{ marginTop: 16 }}>Kein Talent, das plötzlich aufgewacht ist – ein anderer Weg zu lernen.</p>
            <ul className="mcs-haken" style={{ marginTop: 18 }}>
              <li><HakenIcon /><span>Ich nehme dir das Rechnen nicht ab. Ich zeige dir, wie es geht.</span></li>
              <li><HakenIcon /><span>Keine Abkürzungen, keine Notenversprechen – ein System und jemand, der dranbleibt.</span></li>
              <li><HakenIcon /><span>Die Verantwortung bleibt bei dir. Das ist die gute Nachricht.</span></li>
            </ul>
          </div>
        </div>
      </section>

      {/* ---------- 4 LÖSUNG: Plan · Versprechen · Werkzeuge ---------- */}
      <section className="mcs-sektion">
        <div className="mcs-innen">
          <span className="mcs-eyebrow">Der Plan</span>
          <h2 className="mcs-h2">Drei Schritte bis zum Prüfungstag.</h2>
          <span className="mcs-strich" />
          <ol className="mcs-raster drei">
            {PLAN.map((s) => (
              <li key={s.nr} className="mcs-karte mcs-schritt">
                <span className="nr">{s.nr.toUpperCase()}</span>
                <h3 className="mcs-h3">{s.titel}</h3>
                <p className="mcs-text" style={{ marginTop: 8 }}>{s.text}</p>
                <ul>{s.punkte.map((x) => <li key={x}><HakenIcon /><span>{x}</span></li>)}</ul>
              </li>
            ))}
          </ol>
          <div className="mcs-karte" style={{ marginTop: 18 }}>
            <div style={{ overflowX: "auto" }}><KonzeptGrafik /></div>
            <Legende />
          </div>
        </div>
      </section>

      <section className="mcs-sektion" style={{ paddingTop: 0 }}>
        <div className="mcs-innen">
          <span className="mcs-eyebrow">Was du bekommst</span>
          <h2 className="mcs-h2">Kostenlos anfangen. Mit der Masterclass durchziehen.</h2>
          <span className="mcs-strich" />
          <div className="mcs-raster zwei">
            <div className="mcs-karte">
              <span className="mcs-eyebrow">Sofort · kostenlos</span>
              <h3 className="mcs-h3" style={{ fontSize: 22 }}>Die Werkzeuge der Masterclass</h3>
              <p className="mcs-klein" style={{ marginTop: 6 }}>Für alle, die erst einmal selbst loslegen wollen.</p>
              <ul className="mcs-haken" style={{ marginTop: 16 }}>
                {["Abi-Profil, Countdown und Rückwärtsplan bis zum Prüfungstag", "Abi-Aufgaben im Prüfungsformat mit Erwartungshorizont", "Teil-A-Probe: zehn Aufgaben, sechs bearbeiten, 110 Minuten", "Mia: Korrektur, Aufgaben entschlüsseln, mündliche Prüfung", "Lernpartner aus deiner Stadt finden"].map((x) => <li key={x}><HakenIcon /><span>{x}</span></li>)}
              </ul>
              <button type="button" className="mcs-knopf rand" style={{ marginTop: 20 }} onClick={frei}>Kostenlos starten</button>
            </div>
            <div className="mcs-karte gold">
              <span className="mcs-eyebrow" style={{ color: VK.praeg }}>Sechs Monate · begleitet</span>
              <h3 className="mcs-h3" style={{ fontSize: 22 }}>Das Masterclass-Programm</h3>
              <p className="mcs-text" style={{ marginTop: 6 }}>Für alle, die es nicht allein machen wollen – mit Gruppe, Coach und festen Terminen.</p>
              <ul className="mcs-raster" style={{ marginTop: 16, gap: 12 }}>
                {BAUSTEINE.map((b) => (
                  <li key={b.titel} style={{ display: "grid", gridTemplateColumns: "44px 1fr", gap: 12, alignItems: "start" }}>
                    <span style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(255,255,255,0.55)", display: "flex", alignItems: "center", justifyContent: "center" }}><BausteinIcon art={b.icon} /></span>
                    <span><b style={{ display: "block", fontSize: 15.5 }}>{b.titel}</b><span style={{ display: "block", fontSize: 13.5, lineHeight: 1.5, color: "#2A1F00", marginTop: 2 }}>{b.text}</span></span>
                  </li>
                ))}
                <li style={{ display: "grid", gridTemplateColumns: "44px 1fr", gap: 12, alignItems: "start" }}>
                  <span style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(255,255,255,0.55)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: VK.schwarz }}>M</span>
                  <span><b style={{ display: "block", fontSize: 15.5 }}>Alles aus der freien Masterclass</b><span style={{ display: "block", fontSize: 13.5, lineHeight: 1.5, color: "#2A1F00", marginTop: 2 }}>Abi-Plan, Abi-Aufgaben, Teil-A-Probe und Mia – plus Kursbereich mit Videolektionen und Aufträgen.</span></span>
                </li>
              </ul>
              <button type="button" className="mcs-knopf schwarz" style={{ marginTop: 20 }} onClick={vormerken}>Platz vormerken</button>
              <Hinweis />
            </div>
          </div>
          <p className="mcs-klein" style={{ marginTop: 14 }}>Das Versprechen: Du testest alles Kostenlose ohne Anmeldung, bevor du dich entscheidest. Vormerken ist unverbindlich. Was das Programm kostet und wann es startet, steht hier, sobald es feststeht.</p>
        </div>
      </section>

      <section className="mcs-sektion mcs-dunkel">
        <div className="mcs-innen">
          <span className="mcs-eyebrow">Monat für Monat</span>
          <h2 className="mcs-h2">Sechs Monate, drei Stränge, ein Ziel.</h2>
          <span className="mcs-strich" />
          <div className="mcs-monate" role="group" aria-label="Monat wählen">
            {MONATE.map((x, i) => <button key={x.m} type="button" aria-pressed={monat === i} onClick={() => setMonat(i)} aria-label={`Monat ${x.m}: ${x.titel}`}>{x.m}{x.intensiv && <i aria-hidden="true" />}</button>)}
          </div>
          <div className="mcs-karte" style={{ marginTop: 14 }} aria-live="polite">
            <span className="mcs-eyebrow">Monat {M.m}</span>
            <h3 className="mcs-h3" style={{ fontSize: 24, color: VK.gold }}>{M.titel}</h3>
            <dl style={{ display: "grid", gap: 12, marginTop: 14 }}>
              {[[M.pen ? "Fundament" : "Themenblock", M.thema], ["Pen & Paper", M.pen ? "Die Methode im Detail – ab jetzt in jeder Aufgabe" : "Jede Aufgabe nach der Methode – zweimal 20 Minuten pro Woche"], ["Mindset", M.mind]].map(([k, t]) => (
                <div key={k} style={{ display: "grid", gridTemplateColumns: "minmax(0, 120px) 1fr", gap: 12 }}>
                  <dt style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", paddingTop: 2 }}>{k}</dt>
                  <dd className="mcs-text">{t}</dd>
                </div>
              ))}
            </dl>
            {M.intensiv && <p style={{ marginTop: 16, padding: "10px 14px", borderRadius: 12, background: VK.lack, color: VK.schwarz, fontWeight: 800, fontSize: 14 }}>{M.intensiv} – zwei Samstage zur Wahl</p>}
          </div>
          <div className="mcs-raster zwei" style={{ marginTop: 18 }}>
            <div className="mcs-karte">
              <span className="mcs-eyebrow">Ein Intensivtag</span>
              <h3 className="mcs-h3">Samstag, 10 bis 16 Uhr</h3>
              <ol style={{ marginTop: 14, display: "grid", gap: 10 }}>
                {TAG.map((x) => (
                  <li key={x.z} style={{ display: "grid", gridTemplateColumns: "54px 1fr", gap: 10 }}>
                    <b style={{ color: VK.gold, fontVariantNumeric: "tabular-nums" }}>{x.z}</b>
                    <span><span style={{ display: "block", fontWeight: 700 }}>{x.t}</span><span className="mcs-klein">{x.s}</span></span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="mcs-karte">
              <span className="mcs-eyebrow">Mindset-Training</span>
              <h3 className="mcs-h3">Mathe beginnt im Kopf</h3>
              <ul style={{ marginTop: 14, display: "grid", gap: 12 }}>
                {MINDSET.map((x) => <li key={x.t}><b style={{ display: "block", fontSize: 15 }}>{x.t}</b><span className="mcs-klein">{x.s}</span></li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mcs-sektion">
        <div className="mcs-innen mcs-raster zwei" style={{ gap: 32 }}>
          <div>
            <span className="mcs-eyebrow">Für wen</span>
            <h2 className="mcs-h2" style={{ fontSize: "clamp(26px, 3.6vw, 36px)" }}>Passt zu dir, wenn …</h2>
            <span className="mcs-strich" />
            <ul className="mcs-haken">
              {["du in der Oberstufe bist und Mathe im Abi hast – egal ob Leistungsfach, Grundkurs oder Basisfach,", "du nicht nur bestehen, sondern zeigen willst, was in dir steckt,", "du bereit bist, sechs Monate dranzubleiben – mit einer Gruppe, die dich mitzieht."].map((x) => <li key={x}><HakenIcon /><span>{x}</span></li>)}
            </ul>
          </div>
          <div>
            <span className="mcs-eyebrow">Ehrlich gesagt</span>
            <h2 className="mcs-h2" style={{ fontSize: "clamp(26px, 3.6vw, 36px)" }}>Nichts für dich, wenn …</h2>
            <span className="mcs-strich" />
            <ul className="mcs-haken">
              {["du jemanden suchst, der deine Hausaufgaben löst,", "du eine Abkürzung ohne eigenes Üben erwartest,", "du in zwei Wochen von 4 auf 1 willst."].map((x) => <li key={x} style={{ gridTemplateColumns: "20px 1fr" }}><svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" style={{ marginTop: 1 }}><circle cx="10" cy="10" r="9" fill={VK.schwarz} /><path d="M7 7l6 6M13 7l-6 6" stroke={VK.gold} strokeWidth="2" strokeLinecap="round" /></svg><span>{x}</span></li>)}
            </ul>
          </div>
        </div>
        <div className="mcs-innen" style={{ marginTop: 48 }}>
          <span className="mcs-eyebrow">Deine Verwandlung</span>
          <h2 className="mcs-h2">Vorher und nachher.</h2>
          <span className="mcs-strich" />
          <div className="mcs-vn">
            <p className="k" style={{ background: "#F1ECDD", color: VK.still }}>VORHER</p>
            <p className="k n" style={{ background: VK.lack, color: VK.schwarz }}>NACHHER</p>
            {[["„Ich bin halt kein Mathe-Typ.“", "„Ich weiß, wie ich an jede Aufgabe rangehe.“"], ["Chaos auf dem Blatt, Fehler unauffindbar", "Saubere Rechenwege, Fehler sofort gefunden"], ["Lernen auf den letzten Drücker", "Ein Plan bis zum Prüfungstag, jeden Tag ein Schritt"], ["Teil A ohne Rechner macht Angst", "Die Pflichttypen sitzen – in drei Minuten je BE"], ["Blackout in der Prüfung", "Ruhe, Zeitplan und ein klarer Kopf"]].map(([a, b], i) => (
              <React.Fragment key={i}><p style={{ color: VK.still }}>{a}</p><p className="n">{b}</p></React.Fragment>
            ))}
          </div>
          <div style={{ marginTop: 32 }}><Knoepfe /></div>
        </div>
      </section>

      {/* ---------- 5 REISE: Handlung · Erfolg · Scheitern ---------- */}
      <section className="mcs-sektion mcs-dunkel">
        <div className="mcs-innen">
          <span className="mcs-eyebrow">Zwei Wege</span>
          <h2 className="mcs-h2">In sechs Monaten schreibst du Mathe-Abi. So oder so.</h2>
          <span className="mcs-strich" />
          <div className="mcs-raster zwei">
            <div className="mcs-weg schlecht">
              <h3 className="mcs-h3">Du machst weiter wie bisher</h3>
              <ul className="mcs-haken" style={{ marginTop: 14 }}>
                {["Die Lücken wachsen still mit jedem neuen Thema.", "Gelernt wird kurz vor der Klausur – und schnell wieder vergessen.", "Am Prüfungstag entscheidet das Gefühl, nicht der Plan."].map((x) => <li key={x}><KreuzIcon /><span>{x}</span></li>)}
              </ul>
            </div>
            <div className="mcs-weg gut">
              <h3 className="mcs-h3">Du gehst den Weg mit System</h3>
              <ul className="mcs-haken" style={{ marginTop: 14 }}>
                {["Du weißt jeden Tag, was dran ist – und warum.", "Jede Aufgabe steht sauber auf dem Blatt, Fehler findest du selbst.", "Du gehst in die Prüfung und denkst: Das kenne ich."].map((x) => <li key={x} style={{ color: VK.schwarz }}><HakenIcon /><span>{x}</span></li>)}
              </ul>
            </div>
          </div>
          <h3 className="mcs-h3" style={{ marginTop: 56, fontSize: 24 }}>So geht es los</h3>
          <ol className="mcs-raster drei" style={{ marginTop: 16 }}>
            {[["1", "Kostenlos starten", "Leg dein Abi-Profil an, rechne die erste Abi-Aufgabe, lass Mia drüberschauen."], ["2", "Platz vormerken", "Unverbindlich. Du erfährst als Erstes, wann das Programm startet und was es kostet."], ["3", "Gemeinsam loslegen", "Start mit der Standortbestimmung – danach jede Woche Live-Call, Training und dein Plan."]].map(([n, t, x]) => (
              <li key={n} className="mcs-karte"><b style={{ display: "block", fontSize: 34, fontWeight: 900, color: VK.gold, lineHeight: 1 }}>{n}</b><h4 className="mcs-h3" style={{ marginTop: 10 }}>{t}</h4><p className="mcs-text" style={{ marginTop: 6 }}>{x}</p></li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mcs-sektion">
        <div className="mcs-innen mcs-schmal">
          <span className="mcs-eyebrow">Fragen</span>
          <h2 className="mcs-h2">Was du wissen willst.</h2>
          <span className="mcs-strich" />
          <div>
            {FRAGEN.map(([f, a]) => <details key={f} className="mcs-frage"><summary>{f}</summary><p>{a}</p></details>)}
          </div>
        </div>
      </section>

      <section className="mcs-innen" ref={endeRef}>
        <div className="mcs-karte gold" style={{ padding: "clamp(28px, 5vw, 56px)", textAlign: "left" }} id="mcs-abschluss">
          <span className="mcs-eyebrow" style={{ color: VK.praeg }}>Mathe-Abi-Masterclass</span>
          <h2 className="mcs-h2">Mathetalent ist ein Mythos. Dein Abi ist es nicht.</h2>
          <p className="mcs-lead" style={{ marginTop: 14, color: "#2A1F00" }}>System + Freude = Erfolg. Fang heute an – mit dem ersten Schritt, nicht mit dem perfekten Plan.</p>
          <div style={{ marginTop: 24 }}><Knoepfe /></div>
        </div>
      </section>

      <div className={leiste ? "mcs-leiste an" : "mcs-leiste"} aria-hidden={!leiste}>
        <p>Mathe-Abi-Masterclass</p>
        <button type="button" className="mcs-knopf gold" onClick={vormerken} tabIndex={leiste ? 0 : -1}>Platz vormerken</button>
      </div>
    </div>
  );
}
