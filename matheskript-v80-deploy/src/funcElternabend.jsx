import React, { useEffect, useState } from "react";
import { C } from "./base1.jsx";
import { DEMO, eventStand, eventBuchen } from "./konto.js";

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
  event: "elternabend_2026_11_01",                 // Schlüssel in api/_kasse.js (EVENTS) und Stripe-Lookup-Key
  preis: 27,                                       // € je Platz, Endpreis
  plaetze: 40,
  maxProBuchung: 4,
  inklusive: ["Zwei Getränke", "Ein Snack", "Kursunterlagen mit Stift, Heft und Block"],
  karte: "https://www.google.com/maps/search/?api=1&query=Evelyn%27s%20Caf%C3%A9%20Thingoltstra%C3%9Fe%209%2078465%20Konstanz",
};

const SCHWARZ = "radial-gradient(130% 150% at 90% 10%, #2A2210 0%, #0E0C08 50%, #050404 100%)";
const GOLD = "#EDBB00";
const GOLD_VERLAUF = "linear-gradient(180deg,#FFE58A 0%,#EDBB00 45%,#E2B53C 70%,#A67C00 100%)";
const goldText = { background: GOLD_VERLAUF, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" };

/* Relief des Cafés in Dingelsdorf (Schablonen-Stil in Silbertönen) – Ersatz, solange kein Foto hinterlegt ist */
export function CafeRelief({ dunkel }) {
  return (
    <svg viewBox="0 0 200 160" preserveAspectRatio="xMidYMax slice" style={{ width: "100%", height: "100%", display: "block",
      background: dunkel ? "linear-gradient(180deg,#2A2F38 0%,#14171C 100%)" : "transparent" }} aria-hidden="true">

  {/* Boden */}
  <path d="M 0 146 H 200 V 160 H 0 Z" fill="#8C97A6"/>
  {/* Baum links */}
  <path d="M 22 146 V 104" stroke="#5E6878" strokeWidth="4"/>
  <ellipse cx="22" cy="92" rx="18" ry="22" fill="#8C97A6"/>
  <path d="M 12 84 q 10 -10 20 0" stroke="#B9C2CE" strokeWidth="3" fill="none"/>
  {/* Haus: Giebel, Schattenseite rechts */}
  <path d="M 48 146 V 72 L 104 34 L 160 72 V 146 Z" fill="#F4F6F9"/>
  <path d="M 104 34 L 160 72 V 146 H 136 V 80 Z" fill="#DCE2EA"/>
  {/* Dach */}
  <path d="M 40 76 L 104 30 L 168 76 L 160 80 L 104 40 L 48 80 Z" fill="#3E4756"/>
  <path d="M 104 30 L 168 76 L 160 80 L 104 40 Z" fill="#5E6878"/>
  {/* Fachwerk-Andeutung / Giebelfenster */}
  <rect x="96" y="52" width="16" height="16" rx="2" fill="#5E6878"/>
  <path d="M 104 52 V 68 M 96 60 H 112" stroke="#DCE2EA" strokeWidth="1.5"/>
  {/* Obergeschoss-Fenster */}
  <rect x="62" y="84" width="18" height="16" rx="2" fill="#5E6878"/><rect x="128" y="84" width="18" height="16" rx="2" fill="#5E6878"/>
  <path d="M 71 84 V 100 M 137 84 V 100" stroke="#DCE2EA" strokeWidth="1.5"/>
  {/* Markise gestreift */}
  <path d="M 52 108 H 156 L 150 120 H 58 Z" fill="#3E4756"/>
  <g fill="#B9C2CE">
    <path d="M 62 108 h 8 l -2 12 h -8 z"/><path d="M 82 108 h 8 l -1 12 h -8 z"/><path d="M 102 108 h 8 v 12 h -8 z"/><path d="M 122 108 h 8 l 1 12 h -8 z"/><path d="M 142 108 h 8 l 2 12 h -8 z"/>
  </g>
  <path d="M 58 120 q 5 5 10 0 q 5 5 10 0 q 5 5 10 0 q 5 5 10 0 q 5 5 10 0 q 5 5 10 0 q 5 5 10 0 q 5 5 10 0 q 5 5 12 0" fill="#3E4756"/>
  {/* Erdgeschoss: Tür und großes Fenster */}
  <rect x="66" y="126" width="18" height="20" rx="2" fill="#3E4756"/>
  <rect x="98" y="126" width="44" height="16" rx="2" fill="#5E6878"/>
  <path d="M 120 126 V 142" stroke="#DCE2EA" strokeWidth="1.5"/>
  {/* Schild */}
  <rect x="86" y="99" width="36" height="7" rx="2" fill="#F4F6F9" stroke="#5E6878" strokeWidth="1"/>
  <text x="104" y="104.6" fontSize="5" textAnchor="middle" fill="#3E4756" fontFamily="Montserrat, system-ui, sans-serif" fontWeight="700">CAFÉ</text>
  {/* Tisch mit Schirm rechts */}
  <path d="M 176 146 V 118" stroke="#5E6878" strokeWidth="2"/>
  <path d="M 162 120 Q 176 106 190 120 Z" fill="#5E6878"/>
  <rect x="168" y="136" width="16" height="3" fill="#3E4756"/><path d="M 172 139 V 146 M 180 139 V 146" stroke="#3E4756" strokeWidth="2"/>
  {/* Tasse mit Dampf */}
  <path d="M 172 132 h 7 v 3 a 3.5 3.5 0 0 1 -7 0 z" fill="#F4F6F9"/>

    </svg>
  );
}

export function CafeBild({ style }) {
  const [fehlt, setFehlt] = useState(false);
  return fehlt ? <CafeRelief dunkel /> : (
    <img src={ELTERNABEND.foto} alt="Evelyn's Café in Dingelsdorf" onError={() => setFehlt(true)}
      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", ...style }} />
  );
}

/* ---------- Startseiten-Kachel (silbern, glänzend) ---------- */
const SILBER = "linear-gradient(150deg, #FFFFFF 0%, #E4E8EE 20%, #BCC5D1 46%, #F1F3F7 60%, #A7B1BF 84%, #D3D9E1 100%)";
const NAVY = "#0B1E4A";


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

export function ElternabendKachel({ onClick, gesperrt }) {
  const Tag = gesperrt ? "div" : "button";
  return (
    <Tag {...kachelProps(gesperrt, onClick, gesperrt ? "Nächster Elternabend" : `Nächster Elternabend am ${ELTERNABEND.datumKurz} – Platz sichern für ${ELTERNABEND.preis} €`, "ea-kachel")}
      style={{ userSelect: gesperrt ? "none" : undefined, display: "flex", width: "calc(100% + 32px)", marginLeft: -16, marginRight: -16, marginTop: 12, padding: 0, border: "none",
        borderRadius: 20, overflow: "hidden", cursor: gesperrt ? "not-allowed" : "pointer", fontFamily: "inherit", textAlign: "left", position: "relative",
        height: "calc(148px + 1.65 * clamp(15px, 4.1vw, 22px))", background: SILBER, color: NAVY,
        boxShadow: "0 8px 24px rgba(60,72,92,0.28), inset 0 0 0 1px rgba(255,255,255,0.8)" }}>
      <style>{`.ea-kachel{transition:transform .15s ease, box-shadow .15s ease}
        .ea-kachel:active{transform:scale(0.985)}
        @media (hover:hover){.ea-kachel:not(.kachel-zu):hover{transform:translateY(-2px)}}
        .kachel-zu:active{transform:none}
        .ea-glanz{position:absolute;inset:0;pointer-events:none;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,0.6) 45%,transparent 60%);
          background-size:250% 100%;animation:eaGlanz 5.5s ease-in-out infinite;animation-delay:.6s}
        @keyframes eaGlanz{0%,60%{background-position:120% 0}100%{background-position:-120% 0}}`}</style>
      <span className="ea-glanz" aria-hidden="true" />
      <div style={{ flex: "1 1 66%", minWidth: 0, padding: "12px 6px 12px 14px", display: "flex", flexDirection: "column", position: "relative" }}>
        <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.14em", color: "#5E6878" }}>NÄCHSTER ELTERNABEND</span>
        <h2 style={{ fontSize: "clamp(15px, 4.35vw, 30px)", fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.1, margin: "5px 0 0", whiteSpace: "nowrap" }}>
          {ELTERNABEND.datumKurz}
        </h2>
        <span aria-hidden="true" style={{ display: "block", width: 44, height: 3, borderRadius: 2, marginTop: 6, background: NAVY }} />
        <p style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.35, marginTop: 6, marginBottom: 0 }}>
          {ELTERNABEND.ort} <span style={{ fontWeight: 400, color: "#3B4763" }}>· Dingelsdorf</span>
        </p>
        <p style={{ fontSize: 12.5, fontWeight: 500, lineHeight: 1.4, marginTop: 4, marginBottom: 0, color: "#1B2A4F" }}>
          Die Infoveranstaltung mit Entertainment-Charakter und Aha-Momenten.
        </p>
        {gesperrt ? baldVerfuegbar(NAVY) : (
        <span style={{ marginTop: "auto", paddingTop: 4, fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
          Platz sichern · {ELTERNABEND.preis} €
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8.5 4l4 4-4 4" stroke={NAVY} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
        )}
      </div>
      <div style={{ flex: "0 0 34%", position: "relative", borderLeft: "1px solid rgba(11,30,74,0.12)" }}>
        <div style={{ position: "absolute", inset: "8px 0 0 0", opacity: gesperrt ? 0.55 : 1 }}><CafeRelief /></div>
        {gesperrt && <SchlossPlakette farbe={NAVY} />}
      </div>
    </Tag>
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
  ["Ankommen", "Getränk, Snack und erstes Kennenlernen"],
  ["Vortrag", "Der Mythos Mathe – und wie es wirklich funktioniert"],
  ["Einblick", "Live gezeigt: Pen & Paper und die Mythos-Mathe-App"],
  ["Die Programme", "Mathe checken und Mathe Abi Masterclass"],
  ["Fragen & Gespräche", "Offene Runde und persönliche Gespräche"],
];

export function ElternabendSeite({ gehe }) {
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

      <BuchungsRueckmeldung />
      <Buchung gehe={gehe} kompakt />

      <div style={{ marginTop: 26 }}>
        <H2>Ein Abend für Eltern, die mehr wollen als Nachhilfe</H2>
        <Absatz>
          Viele Eltern erleben dasselbe: Das Kind sitzt stundenlang über Mathe, die Noten bleiben trotzdem schwach, und irgendwann
          fällt der Satz „Ich bin halt nicht gut in Mathe“. An diesem Abend zeige ich Ihnen, warum das ein Mythos ist – und wie
          Kinder mit System und Freude in Mathe wirklich stark werden.
        </Absatz>
        <Absatz>
          In entspannter Atmosphäre bei einem Getränk und einem Snack in Evelyn's Café erfahren Sie, wie Mathe lernen funktioniert, was Sie
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
          Die Plätze im Café sind auf {E.plaetze} begrenzt – sichern Sie sich Ihren Platz.
        </p>
      </div>
      <div id="platz-sichern" style={{ marginTop: 16 }}><Buchung gehe={gehe} /></div>
    </div>
  );
}


/* ---------- Buchung: 27 € je Platz, max. 40 Plätze, Bezahlung über Stripe ---------- */
const euro = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

function BuchungsRueckmeldung() {
  const [info, setInfo] = useState(() => {
    try {
      const u = new URL(window.location.href);
      const b = u.searchParams.get("buchung");
      if (b) { u.searchParams.delete("buchung"); u.searchParams.delete("elternabend"); window.history.replaceState({}, "", u.pathname + u.search + u.hash); }
      return b;
    } catch (e) { return null; }
  });
  if (!info) return null;
  const ok = info === "erfolg";
  return (
    <div style={{ marginTop: 16, borderRadius: 16, padding: "14px 42px 14px 16px", position: "relative",
      background: ok ? "#EEF8F2" : C.weiss, border: `1px solid ${ok ? C.smaragd : C.linie}55` }}>
      <p style={{ fontSize: 15, fontWeight: 700, color: ok ? C.smaragd : C.tinte, marginBottom: 2 }}>{ok ? "Ihr Platz ist gebucht." : "Die Bezahlung wurde abgebrochen."}</p>
      <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.55 }}>{ok ? "Bestätigung und Rechnung kommen per E-Mail. Wir freuen uns auf Sie!" : "Es wurde nichts berechnet. Ihre Reservierung verfällt automatisch."}</p>
      <button type="button" onClick={() => setInfo(null)} aria-label="Hinweis schließen"
        style={{ position: "absolute", top: 8, right: 8, width: 30, height: 30, border: "none", background: "none", fontSize: 18, color: C.grau, cursor: "pointer" }}>×</button>
    </div>
  );
}

function Buchung({ gehe, kompakt }) {
  const E = ELTERNABEND;
  const [stand, setStand] = useState(null);
  const [fehlerStand, setFehlerStand] = useState("");
  const [n, setN] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [volljaehrig, setVolljaehrig] = useState(false);
  const [sofort, setSofort] = useState(false);
  const [laeuft, setLaeuft] = useState(false);
  const [fehler, setFehler] = useState("");
  const [demoFertig, setDemoFertig] = useState(false);

  const laden = () => eventStand(E.event).then((s) => { setStand(s); setFehlerStand(""); }).catch((e) => setFehlerStand(e.message));
  useEffect(() => {   // beide Anzeigen (oben und unten) aktuell halten
    laden();
    window.addEventListener("mm-plaetze", laden);
    return () => window.removeEventListener("mm-plaetze", laden);
  }, []);
  const alleNeuLaden = () => window.dispatchEvent(new Event("mm-plaetze"));

  const frei = stand ? stand.frei : null;
  const maxWahl = Math.max(1, Math.min(E.maxProBuchung, frei ?? E.maxProBuchung));
  const gueltig = name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && volljaehrig && n <= maxWahl;
  const ausgebucht = stand && !stand.buchbar;

  const buchen = async () => {
    setFehler(""); setLaeuft(true);
    try {
      const r = await eventBuchen(E.event, { plaetze: n, name: name.trim(), email: email.trim(), volljaehrig, sofortBeginn: sofort });
      if (r.demo) { setDemoFertig(true); setLaeuft(false); alleNeuLaden(); }
    } catch (e) { setFehler(e.message); setLaeuft(false); alleNeuLaden(); }
  };

  const Zaehler = () => (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: 13.5, color: "rgba(255,255,255,0.75)" }}>
          {stand ? (ausgebucht ? "Ausgebucht" : <>Noch <b style={{ color: GOLD }}>{frei}</b> von {stand.gesamt} Plätzen frei</>) : fehlerStand || "Plätze werden geladen …"}
        </span>
        <span style={{ fontSize: 13.5, fontWeight: 700, ...goldText }}>{E.preis},00 € p. P.</span>
      </div>
      <div style={{ height: 5, borderRadius: 3, background: "rgba(255,255,255,0.14)" }}>
        {stand && <div style={{ height: 5, borderRadius: 3, width: `${((stand.gesamt - frei) / stand.gesamt) * 100}%`, background: GOLD_VERLAUF, transition: "width .4s" }} />}
      </div>
    </div>
  );

  if (kompakt) {
    return (
      <div style={{ marginTop: 16, borderRadius: 20, padding: "16px 18px", background: SCHWARZ, color: C.weiss, boxShadow: "inset 0 0 0 1px rgba(237,187,0,0.35)" }}>
        <Zaehler />
        <button type="button" disabled={ausgebucht}
          onClick={() => document.getElementById("platz-sichern")?.scrollIntoView({ behavior: "smooth", block: "start" })}
          style={{ width: "100%", height: 50, marginTop: 14, borderRadius: 999, border: "none", fontFamily: "inherit", fontSize: 16, fontWeight: 800,
            cursor: ausgebucht ? "not-allowed" : "pointer", color: "#0E0C08", background: ausgebucht ? "#8E97A6" : GOLD_VERLAUF }}>
          {ausgebucht ? "Leider ausgebucht" : `Platz sichern · ${E.preis} €`}
        </button>
        <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.65)", textAlign: "center", marginTop: 8 }}>Inklusive {E.inklusive.join(", ").replace(/, ([^,]*)$/, " und $1")}.</p>
      </div>
    );
  }

  const feld = { width: "100%", height: 48, borderRadius: 12, border: "1.5px solid rgba(237,187,0,0.35)", padding: "0 14px", fontSize: 15.5,
    fontFamily: "inherit", color: "#0E0C08", background: "rgba(255,255,255,0.96)", marginBottom: 12, outline: "none" };
  const Haken = ({ an, setze, children, pflicht }) => (
    <label style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer", marginBottom: 12 }}>
      <input type="checkbox" checked={an} onChange={() => setze(!an)} style={{ width: 20, height: 20, marginTop: 2, flexShrink: 0, accentColor: GOLD, cursor: "pointer" }} />
      <span style={{ fontSize: 13, lineHeight: 1.55, color: "rgba(255,255,255,0.85)" }}>{children}{pflicht && <span style={{ color: GOLD, fontWeight: 700 }}> *</span>}</span>
    </label>
  );
  const Link = ({ ziel, children }) => (
    <button type="button" onClick={() => gehe && gehe({ ansicht: ziel })} style={{ background: "none", border: "none", padding: 0, color: GOLD, textDecoration: "underline", fontFamily: "inherit", fontSize: "inherit", cursor: "pointer" }}>{children}</button>
  );

  return (
    <div style={{ borderRadius: 22, padding: "22px 20px", background: SCHWARZ, color: C.weiss, boxShadow: "0 10px 30px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(237,187,0,0.35)" }}>
      <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", color: GOLD, marginBottom: 6 }}>PLATZ SICHERN</p>
      <p style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 14 }}>{E.preis} € pro Person – alles inklusive</p>
      {E.inklusive.map((t) => (
        <div key={t} style={{ display: "flex", gap: 10, marginBottom: 7 }}>
          <svg width="18" height="18" viewBox="0 0 20 20" style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true"><circle cx="10" cy="10" r="9" fill={GOLD} /><path d="M6 10.2l2.6 2.6L14.2 7" stroke="#0E0C08" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <span style={{ fontSize: 14.5 }}>{t}</span>
        </div>
      ))}
      <div style={{ height: 1, background: "rgba(237,187,0,0.3)", margin: "16px 0" }} />
      <Zaehler />

      {demoFertig ? (
        <div style={{ marginTop: 18, borderRadius: 14, background: "rgba(255,255,255,0.08)", padding: 16, textAlign: "center" }}>
          <p style={{ fontSize: 17, fontWeight: 700, color: GOLD, marginBottom: 4 }}>Gebucht ✓</p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.55 }}>Vorschau-Modus: Die Buchung wurde nur in diesem Browser simuliert, es wurde nichts bezahlt.</p>
        </div>
      ) : ausgebucht ? (
        <p style={{ marginTop: 16, fontSize: 14.5, color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>Dieser Abend ist leider ausgebucht. Schreiben Sie uns gern über das Impressum – wir melden uns, sobald es einen neuen Termin gibt.</p>
      ) : (
        <div style={{ marginTop: 18 }}>
          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "rgba(255,255,255,0.85)" }}>Anzahl Plätze</p>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            {[["−", -1], ["+", 1]].map(([z, d], i) => {
              const aus = d < 0 ? n <= 1 : n >= maxWahl;
              const knopf = (
                <button key={z} type="button" aria-label={d < 0 ? "Einen Platz weniger" : "Einen Platz mehr"} disabled={aus} onClick={() => setN(n + d)}
                  style={{ width: 44, height: 44, borderRadius: 999, border: "1.5px solid rgba(237,187,0,0.5)", background: "transparent", color: aus ? "rgba(255,255,255,0.3)" : GOLD,
                    fontSize: 22, fontWeight: 700, fontFamily: "inherit", cursor: aus ? "not-allowed" : "pointer" }}>{z}</button>
              );
              return i === 0 ? knopf : <React.Fragment key={z}><span style={{ fontSize: 24, fontWeight: 800, minWidth: 24, textAlign: "center" }}>{n}</span>{knopf}</React.Fragment>;
            })}
            <span style={{ marginLeft: "auto", fontSize: 18, fontWeight: 800, ...goldText }}>{euro(n * E.preis)}</span>
          </div>
          <input style={feld} placeholder="Ihr Name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" aria-label="Name" />
          <input style={feld} type="email" placeholder="E-Mail für Bestätigung und Rechnung" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" aria-label="E-Mail" />
          <div style={{ height: 4 }} />
          <Haken an={volljaehrig} setze={setVolljaehrig} pflicht>
            Ich bin volljährig und buche verbindlich. Es gelten die <Link ziel="agb">AGB</Link>; die <Link ziel="widerruf">Widerrufsbelehrung</Link> habe ich zur Kenntnis genommen.
          </Haken>
          <Haken an={sofort} setze={setSofort}>
            Freiwillig: Ich verlange ausdrücklich, dass die Veranstaltung auch dann stattfindet, wenn sie vor Ablauf meiner 14-tägigen Widerrufsfrist liegt. Mir ist bekannt, dass mein Widerrufsrecht mit vollständiger Erbringung erlischt und ich bei einem Widerruf vorher anteiligen Wertersatz schulde.
          </Haken>
          {fehler && <p style={{ fontSize: 13.5, color: "#FF9DA8", marginBottom: 10, lineHeight: 1.5 }}>{fehler}</p>}
          <button type="button" onClick={buchen} disabled={!gueltig || laeuft}
            style={{ width: "100%", height: 54, borderRadius: 999, border: "none", fontFamily: "inherit", fontSize: 16, fontWeight: 800,
              cursor: gueltig && !laeuft ? "pointer" : "not-allowed", color: "#0E0C08", background: gueltig ? GOLD_VERLAUF : "#8E97A6" }}>
            {laeuft ? "Einen Moment …" : `Zahlungspflichtig buchen · ${euro(n * E.preis)}`}
          </button>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", textAlign: "center", lineHeight: 1.55, marginTop: 10 }}>
            Weiter zur sicheren Bezahlung bei Stripe – mit <b>Kreditkarte</b> oder <b>PayPal</b>. Ihre Plätze sind währenddessen 30 Minuten reserviert.
          </p>
          {DEMO && <p style={{ fontSize: 12, color: "#6B5310", background: "#FDF8EA", borderRadius: 10, padding: "8px 12px", marginTop: 10, textAlign: "center" }}>Vorschau-Modus: Es wird nichts bezahlt, die Buchung wird nur simuliert.</p>}
        </div>
      )}
    </div>
  );
}
