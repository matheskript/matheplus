import React, { useState } from "react";
import { C } from "./base1.jsx";

/* ======================================================================
   ELTERNABEND — Schwarz-Gold-Kachel für die Startseite und Infoseite.
   Foto: Datei public/elternabend/evelyns-cafe.jpg (wird als
   /elternabend/evelyns-cafe.jpg ausgeliefert). Fehlt sie, erscheint
   eine gezeichnete Café-Illustration in Gold.
   ====================================================================== */

export const ELTERNABEND = {
  datum: "Sonntag, 1. November 2026",
  datumKurz: "Sonntag, 1. November",
  uhrzeit: null,                                   // z. B. "18:30 Uhr" – noch offen
  ort: "Evelyn's Café",
  strasse: "Thingoltstraße 9",
  plzOrt: "78465 Konstanz-Dingelsdorf",
  foto: "/elternabend/evelyns-cafe.jpg",
  karte: "https://www.google.com/maps/search/?api=1&query=Evelyn%27s%20Caf%C3%A9%20Thingoltstra%C3%9Fe%209%2078465%20Konstanz",
};

const SCHWARZ = "radial-gradient(130% 150% at 90% 10%, #2A2210 0%, #0E0C08 50%, #050404 100%)";
const GOLD = "#EDBB00";
const GOLD_VERLAUF = "linear-gradient(180deg,#FFE58A 0%,#EDBB00 45%,#E2B53C 70%,#A67C00 100%)";
const goldText = { background: GOLD_VERLAUF, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" };

/* Gezeichnetes Café als Ersatz, solange kein Foto hinterlegt ist */
function CafeIllustration() {
  return (
    <svg viewBox="0 0 200 160" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%", display: "block", background: "#0E0C08" }} aria-hidden="true">
      <g stroke={GOLD} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Haus mit Markise */}
        <path d="M 30 150 V 70 L 100 30 L 170 70 V 150" opacity="0.9" />
        <path d="M 40 88 H 160 L 152 102 H 48 Z" fill="rgba(237,187,0,0.12)" />
        {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M ${48 + i * 18.7} 102 q 9.3 10 18.7 0`} />)}
        <rect x="55" y="112" width="30" height="38" rx="2" />
        <rect x="112" y="112" width="34" height="24" rx="2" fill="rgba(237,187,0,0.18)" />
        <path d="M 20 150 H 180" />
        {/* Tasse mit Dampf */}
        <path d="M 118 50 h 26 v 10 a 13 13 0 0 1 -26 0 z" fill="rgba(237,187,0,0.15)" />
        <path d="M 144 54 a 5 5 0 0 1 0 10" />
        <path d="M 124 44 q -4 -6 0 -12 M 131 44 q -4 -6 0 -12 M 138 44 q -4 -6 0 -12" opacity="0.7" />
      </g>
      {[[22, 30], [180, 24], [168, 120], [12, 110]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.6" fill={GOLD} opacity="0.6" />)}
    </svg>
  );
}

export function CafeBild({ style }) {
  const [fehlt, setFehlt] = useState(false);
  return fehlt ? <CafeIllustration /> : (
    <img src={ELTERNABEND.foto} alt="Evelyn's Café in Dingelsdorf" onError={() => setFehlt(true)}
      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", ...style }} />
  );
}

/* ---------- Startseiten-Kachel ---------- */
export function ElternabendKachel({ onClick }) {
  return (
    <button type="button" onClick={onClick} aria-label="Nächster Elternabend ansehen" className="ea-kachel"
      style={{ display: "flex", width: "calc(100% + 32px)", marginLeft: -16, marginRight: -16, marginTop: 12, padding: 0, border: "none",
        borderRadius: 20, overflow: "hidden", cursor: "pointer", fontFamily: "inherit", textAlign: "left", position: "relative",
        height: "calc(148px + 1.65 * clamp(15px, 4.1vw, 22px))", background: SCHWARZ, color: C.weiss,
        boxShadow: "0 10px 30px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(237,187,0,0.35)" }}>
      <style>{`.ea-kachel{transition:transform .15s ease, box-shadow .15s ease}
        .ea-kachel:active{transform:scale(0.985)}
        @media (hover:hover){.ea-kachel:hover{transform:translateY(-2px)}}
        .ea-glanz{position:absolute;inset:0;pointer-events:none;background:linear-gradient(115deg,transparent 35%,rgba(237,187,0,0.14) 48%,transparent 62%);
          background-size:260% 100%;animation:eaGlanz 6s ease-in-out infinite}
        @keyframes eaGlanz{0%,55%{background-position:120% 0}100%{background-position:-120% 0}}`}</style>
      <span className="ea-glanz" aria-hidden="true" />
      <div style={{ flex: "1 1 60%", minWidth: 0, padding: "12px 8px 12px 16px", display: "flex", flexDirection: "column", position: "relative" }}>
        <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.14em", color: GOLD }}>NÄCHSTER ELTERNABEND</span>
        <h2 style={{ fontSize: "clamp(21px, 6.2vw, 32px)", fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.02, margin: "6px 0 0", ...goldText }}>
          Sonntag,<br />1. November
        </h2>
        <span aria-hidden="true" style={{ display: "block", width: 44, height: 3, borderRadius: 2, marginTop: 7, background: GOLD_VERLAUF }} />
        <p style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4, marginTop: 6, marginBottom: 0, color: "rgba(255,255,255,0.88)" }}>
          {ELTERNABEND.ort}<br /><span style={{ fontWeight: 300, color: "rgba(255,255,255,0.65)" }}>Dingelsdorf</span>
        </p>
        <span style={{ marginTop: "auto", paddingTop: 6, fontSize: 13, fontWeight: 700, color: GOLD, display: "flex", alignItems: "center", gap: 6 }}>
          Mehr erfahren
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8.5 4l4 4-4 4" stroke={GOLD} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
      </div>
      <div style={{ flex: "0 0 40%", position: "relative", borderLeft: "1px solid rgba(237,187,0,0.25)" }}>
        <div style={{ position: "absolute", inset: 0 }}><CafeBild /></div>
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(14,12,8,0.55) 0%, rgba(14,12,8,0) 40%)" }} />
      </div>
    </button>
  );
}

/* ---------- Infoseite ---------- */
const karte = { background: C.weiss, borderRadius: 18, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" };
const Kicker = ({ children }) => <p style={{ fontSize: 13, fontWeight: 600, color: C.gruenDunkel, marginBottom: 8 }}>{children}</p>;
const H2 = ({ children }) => <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 12 }}>{children}</h2>;
const Absatz = ({ children }) => <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.8, marginBottom: 16 }}>{children}</p>;
const Trenner = () => <div style={{ height: 1, background: C.linie, margin: "30px 0 26px" }} />;

const THEMEN = [
  ["Der Mythos vom Mathe-Gen", "Warum „Mein Kind ist halt kein Mathe-Typ“ nicht stimmt – und was die Lernforschung tatsächlich zeigt."],
  ["Wie Mathe im Kopf entsteht", "Was im Gehirn beim Lernen passiert und warum Verstehen, Struktur und Wiederholung mehr bringen als Auswendiglernen."],
  ["System + Freude = Erfolg", "Wie Pen & Paper, klare Routinen und das richtige Mindset zusammenwirken – und Mathe plötzlich Spaß macht."],
  ["Was Sie als Eltern tun können", "Wie Sie Ihr Kind unterstützen, ohne Druck aufzubauen – und welche Sätze am Küchentisch mehr helfen als Nachhilfe."],
  ["Die Programme von Mythos Mathe", "Mathe checken, die Mathe Abi Masterclass und die App – was dahintersteckt und für wen was passt."],
];

const ABLAUF = [
  ["Ankommen", "Kaffee, Kuchen und erstes Kennenlernen"],
  ["Vortrag", "Der Mythos Mathe – und wie es wirklich funktioniert"],
  ["Einblick", "Live gezeigt: Pen & Paper und die Mythos-Mathe-App"],
  ["Die Programme", "Mathe checken und Mathe Abi Masterclass"],
  ["Fragen & Gespräche", "Offene Runde und persönliche Gespräche"],
];

export function ElternabendSeite() {
  const E = ELTERNABEND;
  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      {/* Termin-Karte */}
      <div style={{ borderRadius: 22, overflow: "hidden", background: SCHWARZ, color: C.weiss, boxShadow: "0 10px 30px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(237,187,0,0.35)" }}>
        <div style={{ height: 200, position: "relative" }}>
          <CafeBild />
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(14,12,8,0) 45%, rgba(14,12,8,0.9) 100%)" }} />
          <span style={{ position: "absolute", left: 18, bottom: 12, fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: GOLD }}>NÄCHSTER ELTERNABEND</span>
        </div>
        <div style={{ padding: "14px 18px 20px" }}>
          <p style={{ fontSize: "clamp(24px, 7vw, 32px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, ...goldText }}>{E.datum}</p>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", marginTop: 4 }}>{E.uhrzeit ? E.uhrzeit : "Uhrzeit folgt"}</p>
          <div style={{ height: 1, background: "rgba(237,187,0,0.3)", margin: "14px 0" }} />
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }} fill="none" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" />
            </svg>
            <span>
              <span style={{ display: "block", fontSize: 16, fontWeight: 700 }}>{E.ort}</span>
              <span style={{ display: "block", fontSize: 14, color: "rgba(255,255,255,0.7)", fontWeight: 300 }}>{E.strasse}, {E.plzOrt}</span>
              <a href={E.karte} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: 6, fontSize: 13.5, fontWeight: 600, color: GOLD }}>In Google Maps öffnen →</a>
            </span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 26 }}>
        <H2>Ein Abend für Eltern, die mehr wollen als Nachhilfe</H2>
        <Absatz>
          Viele Eltern erleben dasselbe: Das Kind sitzt stundenlang über Mathe, die Noten bleiben trotzdem schwach, und irgendwann
          fällt der Satz „Ich bin halt nicht gut in Mathe“. An diesem Abend zeige ich Ihnen, warum das ein Mythos ist – und wie
          Kinder mit System und Freude in Mathe wirklich stark werden.
        </Absatz>
        <Absatz>
          In entspannter Atmosphäre bei Kaffee und Kuchen in Evelyn's Café erfahren Sie, wie Mathe lernen funktioniert, was Sie
          zu Hause beitragen können und wie die Programme von Mythos Mathe aufgebaut sind. Und natürlich ist Zeit für all Ihre Fragen.
        </Absatz>
      </div>

      <Trenner />

      <Kicker>Worum es geht</Kicker>
      <H2>Fünf Themen des Abends</H2>
      <div style={{ ...karte, padding: "4px 16px" }}>
        {THEMEN.map(([t, s], i) => (
          <div key={t} style={{ display: "flex", gap: 12, padding: "13px 0", borderBottom: i < THEMEN.length - 1 ? `1px solid ${C.linie}` : "none" }}>
            <span style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 999, background: "#0E0C08", color: GOLD, fontSize: 13, fontWeight: 800,
              display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
            <span>
              <span style={{ display: "block", fontSize: 15.5, fontWeight: 700, color: C.tinte }}>{t}</span>
              <span style={{ display: "block", fontSize: 13.5, fontWeight: 300, color: C.grau, lineHeight: 1.55, marginTop: 2 }}>{s}</span>
            </span>
          </div>
        ))}
      </div>

      <Trenner />

      <Kicker>Ablauf</Kicker>
      <H2>So läuft der Abend</H2>
      <div style={{ ...karte, padding: "16px 18px" }}>
        {ABLAUF.map(([t, s], i) => (
          <div key={t} style={{ display: "flex", gap: 14, paddingBottom: i < ABLAUF.length - 1 ? 14 : 0 }}>
            <span style={{ position: "relative", width: 14, flexShrink: 0 }}>
              <span style={{ position: "absolute", top: 4, left: 1, width: 12, height: 12, borderRadius: 999, background: GOLD, border: "2px solid #0E0C08" }} />
              {i < ABLAUF.length - 1 && <span style={{ position: "absolute", top: 18, bottom: -4, left: 6, width: 2, background: C.linie }} />}
            </span>
            <span>
              <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: C.tinte }}>{t}</span>
              <span style={{ display: "block", fontSize: 13.5, fontWeight: 300, color: C.grau }}>{s}</span>
            </span>
          </div>
        ))}
      </div>

      <Trenner />

      <Kicker>Für wen</Kicker>
      <H2>Für Eltern von Klasse 8 bis zum Abi</H2>
      <div style={{ ...karte, padding: "4px 16px" }}>
        {[
          "Ihr Kind besucht ein Gymnasium oder eine Gemeinschaftsschule, von Klasse 8 bis zur Kursstufe.",
          "Sie möchten verstehen, warum es in Mathe hakt – und was wirklich hilft.",
          "Gern bringen Sie Ihr Kind mit: Viele Fragen klären sich am besten gemeinsam.",
        ].map((t, i) => (
          <div key={i} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: i < 2 ? `1px solid ${C.linie}` : "none" }}>
            <svg width="20" height="20" viewBox="0 0 20 20" style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true"><circle cx="10" cy="10" r="9" fill={GOLD} /><path d="M6 10.2l2.6 2.6L14.2 7" stroke="#0E0C08" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span style={{ fontSize: 14.5, color: C.tinte, lineHeight: 1.55 }}>{t}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 30, borderRadius: 22, padding: "24px 20px", background: SCHWARZ, color: C.weiss, textAlign: "center", boxShadow: "inset 0 0 0 1px rgba(237,187,0,0.35)" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", color: GOLD }}>{E.datum.toUpperCase()}</p>
        <p style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.3, margin: "8px 0 6px" }}>Wir freuen uns auf Sie.</p>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.72)", fontWeight: 300, lineHeight: 1.6 }}>
          Die Plätze im Café sind begrenzt. Alle Details zur Anmeldung folgen hier in Kürze.
        </p>
      </div>
    </div>
  );
}
