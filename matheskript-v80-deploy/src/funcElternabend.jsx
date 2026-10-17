import React, { useEffect, useState } from "react";
import { C } from "./base1.jsx";
import { sb } from "./konto.js";
import { SatzZeilen } from "./baseSatz.jsx";
import "@fontsource/caveat/600.css";

/* ======================================================================
   ELTERNABEND — Schwarz-Gold-Kachel für die Startseite und Infoseite.
   Foto: Datei public/elternabend/evelyns-cafe.jpg (wird als
   /elternabend/evelyns-cafe.jpg ausgeliefert). Fehlt sie, erscheint
   eine gezeichnete Café-Illustration in Gold.
   ====================================================================== */

export const ELTERNABEND = {
  datum: "Sonntag, 7. Februar 2027",
  datumKurz: "Sonntag, 7. Februar",
  uhrzeit: "18:30 Uhr",
  beginn: "2027-02-07T18:30:00+01:00",             // für Countdown und Kalenderdatei
  dauerMinuten: 150,                               // nur für den Kalendereintrag (Ende ca.)
  plaetze: 40,
  ort: "Evelyn's Café",
  strasse: "Thingoltstraße 9",
  plzOrt: "78465 Konstanz-Dingelsdorf",
  foto: "/elternabend/evelyns-cafe.jpg",
  karte: "https://www.google.com/maps/search/?api=1&query=Evelyn%27s%20Caf%C3%A9%20Thingoltstra%C3%9Fe%209%2078465%20Konstanz",
  preis: 27,                                       // Euro pro Ticket
  inklusive: ["Kursmaterialien: Block, Heft und Stift", "Zwei Getränke", "Ein Snack"],
  // Stripe-Zahlungslink (Karte + PayPal). Aktuell aus dem Stripe-Testmodus –
  // für echte Zahlungen den Live-Link aus dem Stripe-Dashboard hier eintragen.
  ticketLink: "https://book.stripe.com/test_7sY7sM3Ju3W28K46hLgbm01",
  // Übergangsphase ohne Stripe: false = Anmeldung nur mit Bonuscode (siehe Bonuscode & Anmeldung).
  zahlungAktiv: false,
};

const SCHWARZ = "radial-gradient(130% 150% at 90% 10%, #2A2210 0%, #0E0C08 50%, #050404 100%)";
const GOLD = "#EDBB00";
const GOLD_VERLAUF = "linear-gradient(180deg,#FFE58A 0%,#EDBB00 45%,#E2B53C 70%,#A67C00 100%)";
const goldText = { background: GOLD_VERLAUF, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" };

/* Relief von Evelyn's Café in Dingelsdorf (Schablonen-Stil in Silbertönen): breites Ziegeldach mit
   Fensterband, Fensterläden, Holztor mit Rundbogen, Fässer, Sonnenschirme und Tafel mit Kaffeetasse */
export function CafeRelief({ dunkel }) {
  return (
    <svg viewBox="0 0 200 160" preserveAspectRatio="xMidYMax slice" style={{ width: "100%", height: "100%", display: "block",
      background: dunkel ? "linear-gradient(180deg,#2A2F38 0%,#14171C 100%)" : "transparent" }} aria-hidden="true">

  {/* Bäume hinter dem Haus */}
  <ellipse cx="24" cy="96" rx="22" ry="34" fill="#B9C2CE"/><ellipse cx="178" cy="92" rx="24" ry="36" fill="#B9C2CE"/>
  {/* Boden */}
  <path d="M 0 146 H 200 V 160 H 0 Z" fill="#8C97A6"/>
  {/* Kamine und Ofenrohr */}
  <rect x="59" y="30" width="3" height="20" fill="#5E6878"/>
  <rect x="73" y="25" width="7" height="14" fill="#5E6878"/><rect x="72" y="24" width="9" height="2.5" fill="#3E4756"/>
  <rect x="126" y="23" width="7" height="15" fill="#5E6878"/><rect x="125" y="22" width="9" height="2.5" fill="#3E4756"/>
  {/* Breites Ziegeldach (Walmdach) */}
  <path d="M 38 85 L 66 35 H 134 L 162 85 Z" fill="#5E6878"/>
  <path d="M 134 35 L 162 85 H 146 Z" fill="#3E4756" opacity="0.45"/>
  <path d="M 63.2 40 H 136.8 M 59.8 46 H 140.2 M 54.2 66 H 145.8 M 50.8 72 H 149.2 M 47.5 78 H 152.5" stroke="#8C97A6" strokeWidth="0.8"/>
  <path d="M 36 84 H 164 V 87 H 36 Z" fill="#3E4756"/>
  {/* Lange Gaube mit Fensterband */}
  <path d="M 55 50 H 145 L 143 47 H 57 Z" fill="#3E4756"/>
  <rect x="57" y="50" width="86" height="13" fill="#DCE2EA"/>
  <g fill="#5E6878">
    <rect x="60" y="52.5" width="6.4" height="7.5"/><rect x="68.2" y="52.5" width="6.4" height="7.5"/><rect x="76.4" y="52.5" width="6.4" height="7.5"/>
    <rect x="84.6" y="52.5" width="6.4" height="7.5"/><rect x="92.8" y="52.5" width="6.4" height="7.5"/><rect x="101" y="52.5" width="6.4" height="7.5"/>
    <rect x="109.2" y="52.5" width="6.4" height="7.5"/><rect x="117.4" y="52.5" width="6.4" height="7.5"/><rect x="125.6" y="52.5" width="6.4" height="7.5"/>
    <rect x="133.8" y="52.5" width="6.4" height="7.5"/>
  </g>
  <path d="M 57 63 H 143" stroke="#8C97A6" strokeWidth="1.2"/>
  {/* Hausfassade */}
  <rect x="44" y="87" width="112" height="59" fill="#F4F6F9"/>
  <rect x="146" y="87" width="10" height="59" fill="#DCE2EA"/>
  <path d="M 153 87 V 146" stroke="#8C97A6" strokeWidth="1.2"/>
  {/* Obergeschoss: Fenster mit Fensterläden */}
  <g fill="#5E6878">
    <rect x="53" y="92" width="4.5" height="13"/><rect x="69.5" y="92" width="4.5" height="13"/>
    <rect x="98" y="92" width="4.5" height="13"/><rect x="114.5" y="92" width="4.5" height="13"/>
    <rect x="124" y="92" width="4.5" height="13"/><rect x="140.5" y="92" width="4.5" height="13"/>
  </g>
  <g fill="#8C97A6">
    <rect x="58.5" y="92.5" width="10" height="12"/><rect x="103.5" y="92.5" width="10" height="12"/><rect x="129.5" y="92.5" width="10" height="12"/>
  </g>
  <path d="M 63.5 92.5 V 104.5 M 58.5 97.5 H 68.5 M 108.5 92.5 V 104.5 M 103.5 97.5 H 113.5 M 134.5 92.5 V 104.5 M 129.5 97.5 H 139.5" stroke="#F4F6F9" strokeWidth="1"/>
  {/* Erdgeschoss: Fenster rechts mit Läden */}
  <rect x="124" y="114" width="4.5" height="13" fill="#5E6878"/><rect x="140.5" y="114" width="4.5" height="13" fill="#5E6878"/>
  <rect x="129.5" y="114.5" width="10" height="12" fill="#8C97A6"/>
  <path d="M 134.5 114.5 V 126.5 M 129.5 119.5 H 139.5" stroke="#F4F6F9" strokeWidth="1"/>
  {/* Holztor mit Rundbogen und Glastür */}
  <path d="M 74 146 V 118 Q 87 106 100 118 V 146 Z" fill="#3E4756"/>
  <path d="M 77 146 V 119 Q 87 110 97 119 V 146 Z" fill="#8C97A6"/>
  <path d="M 87 112 V 146 M 77 123 H 97" stroke="#3E4756" strokeWidth="1.3"/>
  <rect x="81" y="126" width="5" height="20" fill="#3E4756"/>
  {/* Kleine Seitentür */}
  <rect x="104" y="126" width="9" height="20" rx="1" fill="#5E6878"/>
  {/* Weinfässer */}
  <g fill="#B9C2CE" stroke="#5E6878" strokeWidth="0.9">
    <path d="M 63 135 Q 61.8 140.5 63 146 H 71 Q 72.2 140.5 71 135 Z"/>
    <path d="M 98.5 135 Q 97.3 140.5 98.5 146 H 106.5 Q 107.7 140.5 106.5 135 Z"/>
  </g>
  <path d="M 62.3 138.5 H 71.7 M 62.3 142.5 H 71.7 M 97.8 138.5 H 107.2 M 97.8 142.5 H 107.2" stroke="#5E6878" strokeWidth="0.8"/>
  {/* Sonnenschirme */}
  <path d="M 50 146 V 118" stroke="#5E6878" strokeWidth="1.6"/>
  <path d="M 36 121 Q 50 109 64 121 Z" fill="#5E6878"/>
  <path d="M 117 146 V 120" stroke="#5E6878" strokeWidth="1.6"/>
  <path d="M 104 123 Q 117 112 130 123 Z" fill="#5E6878"/>
  <path d="M 163 146 V 136" stroke="#5E6878" strokeWidth="1.4"/>
  <path d="M 160 137 L 163 112 L 166 137 Z" fill="#B9C2CE" stroke="#8C97A6" strokeWidth="0.8"/>
  {/* Lounge links */}
  <rect x="30" y="134" width="16" height="8" rx="1.5" fill="#3E4756"/><rect x="30" y="129" width="16" height="6" rx="1.5" fill="#5E6878"/>
  {/* Zaun rechts */}
  <g stroke="#8C97A6" strokeWidth="1.3">
    <path d="M 144 137 V 146 M 148 137 V 146 M 152 137 V 146 M 156 137 V 146 M 160 137 V 146 M 168 137 V 146 M 172 137 V 146 M 176 137 V 146 M 180 137 V 146 M 184 137 V 146 M 188 137 V 146 M 192 137 V 146 M 196 137 V 146"/>
    <path d="M 142 140 H 200 M 142 144 H 200"/>
  </g>
  {/* Tafel mit Kaffeetasse */}
  <path d="M 122 148 L 124 128 M 138 148 L 136 128" stroke="#5E6878" strokeWidth="1.4"/>
  <rect x="122.5" y="127" width="15" height="19" rx="1.2" fill="#3E4756" stroke="#8C97A6" strokeWidth="0.9"/>
  <path d="M 126.5 136 h 6 v 2.5 a 3 3 0 0 1 -6 0 z" fill="#F4F6F9"/>
  <path d="M 132.5 136.8 h 1.2 a 1.3 1.3 0 0 1 0 2.6 h -1.2" stroke="#F4F6F9" strokeWidth="0.8" fill="none"/>
  <path d="M 125 142.4 H 134" stroke="#F4F6F9" strokeWidth="0.9" strokeLinecap="round"/>
  <path d="M 128.5 134.5 q -1 -1.4 0 -2.8 M 130.7 134.5 q -1 -1.4 0 -2.8" stroke="#F4F6F9" strokeWidth="0.7" fill="none" strokeLinecap="round"/>

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
    <Tag {...kachelProps(gesperrt, onClick, "Nächster Elternabend", "ea-kachel")}
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
          {ELTERNABEND.uhrzeit} <span style={{ fontWeight: 400, color: "#3B4763" }}>· {ELTERNABEND.ort}</span>
        </p>
        <p style={{ fontSize: 12.5, fontWeight: 500, lineHeight: 1.4, marginTop: 4, marginBottom: 0, color: "#1B2A4F" }}>
          <SatzZeilen text="Die Infoveranstaltung mit Entertainment-Charakter und Aha-Momenten." />
        </p>
        {gesperrt ? baldVerfuegbar(NAVY) : (
        <span style={{ marginTop: "auto", paddingTop: 4, fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ background: NAVY, color: "#fff", borderRadius: 999, padding: "2px 9px", fontSize: 12, whiteSpace: "nowrap" }}>{ELTERNABEND.preis} €</span>
          <span style={{ whiteSpace: "nowrap" }}>Ticket buchen</span>
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

/* ---------- Ticket ---------- */
function PayPalMarke() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", height: 26, padding: "0 10px", borderRadius: 7, background: "#fff",
      fontSize: 13, fontWeight: 800, fontStyle: "italic", letterSpacing: "-0.01em", boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)" }}>
      <span style={{ color: "#003087" }}>Pay</span><span style={{ color: "#009CDE" }}>Pal</span>
    </span>
  );
}
function KarteMarke() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 26, padding: "0 10px", borderRadius: 7, background: "#fff",
      fontSize: 12.5, fontWeight: 700, color: "#1B2A4F", boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)" }}>
      <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true"><rect x="0.5" y="0.5" width="19" height="13" rx="2.5" fill="#1B2A4F" /><rect x="0.5" y="3.2" width="19" height="2.4" fill="#EDBB00" /><rect x="3" y="9" width="6" height="1.6" rx="0.8" fill="#fff" opacity="0.8" /></svg>
      Kreditkarte
    </span>
  );
}

/* ======================================================================
   INFOSEITE ELTERNABEND (Ansicht "elternabend")
   Ganzseitig, eigener Kopf (func10 zeigt keinen eigenen Kopf mehr davor).
   Alle Fakten kommen aus ELTERNABEND oben. Ablaufzeiten: nur Beginn fest,
   weitere Zeiten in ABLAUF (Feld zeit) eintragen, sobald sie feststehen.
   ====================================================================== */

const T = {
  nacht: "#0E1E4A", nachtTief: "#070F27", see: "#004D98", gold: "#EDBB00", goldHell: "#FFD95A", goldText: "#8A6500",
  papier: "#F8FAFD", creme: "#FBF7EC", tinte: "#0F1A33", grau: "#4B5675", still: "#6B7590", linie: "#E1E7F1",
  blauText: "#C9D6EE", himmel: "#E8EFF9", weiss: "#FFFFFF", rot: "#C8372D",
};

const CSS_SEITE = `
.eab { font-family: Montserrat, system-ui, sans-serif; color: ${T.tinte}; background: ${T.papier}; overflow-x: clip; }
.eab *, .eab *::before, .eab *::after { box-sizing: border-box; }
:where(.eab) :where(h1, h2, h3, p, ol, ul, dl, dd, figure) { margin: 0; }
.eab-innen { width: 100%; max-width: 1120px; margin: 0 auto; padding: 0 20px; }
.eab-schmal { max-width: 780px; }
.eab-sektion { padding: clamp(64px, 9vw, 112px) 0; }
.eab-kicker { font-size: 12px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: ${T.goldText}; }
.eab-dunkel .eab-kicker { color: ${T.gold}; }
.eab-h2 { font-size: clamp(29px, 4.4vw, 46px); font-weight: 800; letter-spacing: -0.035em; line-height: 1.07; margin-top: 12px; }
.eab-lead { font-size: clamp(17px, 2vw, 20px); line-height: 1.62; color: ${T.grau}; margin-top: 18px; max-width: 36em; }
.eab-dunkel { background: ${T.nacht}; color: ${T.weiss}; }
.eab-dunkel .eab-lead { color: ${T.blauText}; }
.eab-hand { font-family: Caveat, 'Bradley Hand', 'Segoe Print', cursive; font-weight: 600; }

/* Knöpfe */
.eab-knopf { display: inline-flex; align-items: center; justify-content: center; gap: 10px; min-height: 54px; padding: 0 26px; border-radius: 999px;
  font: 700 16px/1.1 Montserrat, system-ui, sans-serif; cursor: pointer; border: 2px solid transparent; text-decoration: none; white-space: nowrap;
  transition: transform .15s ease, background .15s ease, border-color .15s ease, box-shadow .15s ease; }
.eab-knopf:hover { transform: translateY(-1px); }
.eab a:focus-visible, .eab button:focus-visible, .eab summary:focus-visible { outline: 3px solid ${T.gold}; outline-offset: 3px; }
.eab-gold { background: linear-gradient(180deg, #FFE27A 0%, ${T.gold} 55%, #D9A800 100%); color: ${T.nachtTief};
  box-shadow: 0 8px 24px rgba(237,187,0,0.28), inset 0 1px 0 rgba(255,255,255,0.6); }
.eab-gold:hover { box-shadow: 0 10px 30px rgba(237,187,0,0.4), inset 0 1px 0 rgba(255,255,255,0.6); }
.eab-rand { background: transparent; color: ${T.weiss}; border-color: rgba(255,255,255,0.32); }
.eab-rand:hover { border-color: ${T.weiss}; }
.eab-rand-dunkel { background: ${T.weiss}; color: ${T.nacht}; border-color: rgba(14,30,74,0.18); }
.eab-rand-dunkel:hover { border-color: ${T.nacht}; }

/* Kopf */
.eab-kopf { position: relative; color: ${T.weiss}; overflow: hidden;
  background:
    radial-gradient(70% 55% at 50% 108%, rgba(237,170,40,0.30) 0%, rgba(237,170,40,0) 70%),
    radial-gradient(110% 80% at 85% 0%, #1B3778 0%, ${T.nacht} 45%, ${T.nachtTief} 100%);
  padding: 0 0 clamp(64px, 8vw, 104px); }
.eab-kette { display: block; width: 100%; height: 74px; }
.eab-birne { animation: eabFunkeln 4.2s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
@keyframes eabFunkeln { 0%,100% { opacity: 1 } 50% { opacity: .55 } }
@media (prefers-reduced-motion: reduce) { .eab-birne { animation: none } .eab-knopf:hover { transform: none } }
.eab-kopf-raster { display: grid; grid-template-columns: minmax(0, 1fr); gap: 44px; align-items: center; padding-top: clamp(8px, 3vw, 28px); }
@media (min-width: 920px) { .eab-kopf-raster { grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr); gap: 64px; } }
.eab-h1 { font-size: clamp(38px, 7vw, 74px); font-weight: 800; letter-spacing: -0.045em; line-height: 0.99; margin-top: 18px; }
.eab-h1 em { font-style: normal; background: linear-gradient(180deg, #FFE58A 0%, ${T.gold} 50%, #C99A00 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent; }
.eab-unter { font-size: clamp(25px, 4.6vw, 34px); color: ${T.goldHell}; margin-top: 18px; line-height: 1.15; transform: rotate(-1.5deg); transform-origin: left; }
.eab-kopf .eab-lead { color: ${T.blauText}; }
.eab-knopfreihe { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 32px; }
@media (max-width: 480px) { .eab-knopfreihe .eab-knopf { width: 100%; } }

/* Countdown */
.eab-uhr { display: flex; gap: 10px; margin-top: 30px; flex-wrap: wrap; align-items: stretch; }
.eab-uhr-feld { min-width: 76px; padding: 10px 12px 9px; border-radius: 14px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); text-align: center; }
.eab-uhr-zahl { display: block; font-size: 28px; font-weight: 800; letter-spacing: -0.03em; line-height: 1; font-variant-numeric: tabular-nums; }
.eab-uhr-wort { display: block; font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: ${T.blauText}; margin-top: 6px; }
.eab-uhr-text { align-self: center; flex: 1 1 120px; font-size: 13.5px; color: ${T.blauText}; line-height: 1.4; }

/* Ticket */
.eab-ticket { position: relative; background: linear-gradient(170deg, #FFFDF6 0%, ${T.creme} 100%); color: ${T.tinte}; border-radius: 22px;
  box-shadow: 0 30px 60px rgba(0,0,0,0.38), 0 0 0 1px rgba(237,187,0,0.35); max-width: 440px; width: 100%; justify-self: center; transform: rotate(1.2deg); }
@media (max-width: 919px) { .eab-ticket { transform: none; } }
.eab-ticket-oben { padding: 22px 22px 20px; }
.eab-ticket-marke { display: flex; justify-content: space-between; align-items: center; gap: 10px; font-size: 11px; font-weight: 700; letter-spacing: 0.16em; color: ${T.goldText}; }
.eab-datum { display: grid; grid-template-columns: auto 1fr; gap: 16px; align-items: center; margin-top: 16px; }
.eab-tag { font-size: 76px; font-weight: 800; letter-spacing: -0.06em; line-height: 0.8; color: ${T.nacht}; }
.eab-monat { font-size: 13px; font-weight: 700; letter-spacing: 0.14em; color: ${T.still}; }
.eab-zeit { font-size: 30px; font-weight: 800; letter-spacing: -0.03em; line-height: 1.05; color: ${T.nacht}; margin-top: 2px; }
.eab-perfo { position: relative; height: 0; border-top: 2px dashed rgba(14,30,74,0.18); margin: 0 18px; }
.eab-ticket-unten { padding: 18px 22px 22px; }
#eab-ticket-oben { scroll-margin-top: 96px; }
#eab-ticket-oben > .eab-ticket { min-width: 0; }
.eab-ticket input, .eab-ticket select { min-width: 0; }
.eab-zeile { display: flex; gap: 12px; align-items: flex-start; padding: 7px 0; font-size: 14.5px; line-height: 1.45; }
.eab-zeile b { display: block; font-weight: 700; }
.eab-zeile span span { color: ${T.still}; }
.eab-preis { display: flex; justify-content: space-between; align-items: flex-end; gap: 12px; margin: 14px 0 16px; }
.eab-preis-zahl { font-size: 38px; font-weight: 800; letter-spacing: -0.04em; line-height: 1; color: ${T.nacht}; }

/* Sätze */
.eab-saetze { display: grid; gap: 18px; grid-template-columns: minmax(0, 1fr); margin-top: 44px; }
@media (min-width: 760px) { .eab-saetze { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.eab-zettel { position: relative; background: #FFFDF5; border-radius: 6px; padding: 30px 22px 22px; box-shadow: 0 10px 28px rgba(15,26,51,0.09), 0 1px 0 rgba(15,26,51,0.04);
  background-image: linear-gradient(#E6ECF5 1px, transparent 1px); background-size: 100% 34px; background-position: 0 22px; }
.eab-zettel::before { content: ""; position: absolute; top: -9px; left: 50%; width: 74px; height: 20px; margin-left: -37px; background: rgba(237,187,0,0.45); transform: rotate(-3deg); border-radius: 2px; }
.eab-zettel p { font-size: clamp(25px, 3vw, 29px); line-height: 34px; color: #1C2A55; }
.eab-zettel small { display: block; margin-top: 14px; font-size: 13px; font-weight: 600; color: ${T.still}; letter-spacing: 0.02em; }
.eab-zettel:nth-child(1) { transform: rotate(-1.4deg); } .eab-zettel:nth-child(2) { transform: rotate(0.9deg); } .eab-zettel:nth-child(3) { transform: rotate(-0.5deg); }
.eab-antwort { margin-top: 48px; font-size: clamp(20px, 2.6vw, 26px); font-weight: 700; letter-spacing: -0.02em; line-height: 1.35; max-width: 30em; }
.eab-gleichung { margin-top: 22px; display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px 22px; font-size: clamp(32px, 5vw, 46px); color: #1C2A55; line-height: 1.1; }
.eab-gleichung s { text-decoration-color: ${T.rot}; text-decoration-thickness: 3px; color: ${T.still}; }
.eab-gleichung span { position: relative; }
.eab-gleichung span::after { content: ""; position: absolute; left: 0; right: 0; bottom: -6px; height: 7px;
  border-top: 2px solid ${T.gold}; border-bottom: 2px solid ${T.gold}; }

/* Themen */
.eab-themen { display: grid; gap: 14px; grid-template-columns: minmax(0, 1fr); margin-top: 44px; }
@media (min-width: 720px) { .eab-themen { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (min-width: 1040px) { .eab-themen { grid-template-columns: repeat(6, minmax(0, 1fr)); } .eab-thema { grid-column: span 2; } .eab-thema:nth-child(4) { grid-column: 2 / span 2; } }
.eab-thema { position: relative; border-radius: 20px; padding: 26px 22px 24px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); overflow: hidden; }
.eab-thema-nr { font-size: 54px; font-weight: 800; letter-spacing: -0.05em; line-height: 1; color: transparent; -webkit-text-stroke: 1.5px rgba(237,187,0,0.75); }
.eab-thema h3 { font-size: 19px; font-weight: 700; letter-spacing: -0.015em; line-height: 1.3; margin-top: 14px; }
.eab-thema p { font-size: 15px; line-height: 1.62; color: ${T.blauText}; margin-top: 8px; }

/* Ablauf */
.eab-ablauf { margin-top: 40px; position: relative; }
.eab-schritt { display: grid; grid-template-columns: 72px 28px minmax(0, 1fr); gap: 0 14px; position: relative; }
.eab-schritt-zeit { text-align: right; font-size: 15px; font-weight: 800; color: ${T.nacht}; padding-top: 18px; font-variant-numeric: tabular-nums; }
.eab-schritt-achse { position: relative; }
.eab-schritt-achse::before { content: ""; position: absolute; left: 13px; top: 0; bottom: 0; width: 2px; background: ${T.linie}; }
.eab-schritt:first-child .eab-schritt-achse::before { top: 24px; }
.eab-schritt:last-child .eab-schritt-achse::before { bottom: calc(100% - 24px); }
.eab-punkt { position: absolute; left: 5px; top: 17px; width: 18px; height: 18px; border-radius: 50%; background: ${T.weiss}; border: 3px solid ${T.gold}; }
.eab-schritt:first-child .eab-punkt { background: ${T.gold}; box-shadow: 0 0 0 6px rgba(237,187,0,0.18); }
.eab-schritt-text { padding: 14px 0 22px; }
.eab-schritt-text b { display: block; font-size: 17.5px; font-weight: 700; letter-spacing: -0.01em; }
.eab-schritt-text span { display: block; font-size: 15px; line-height: 1.58; color: ${T.grau}; margin-top: 4px; }
@media (max-width: 420px) { .eab-schritt { grid-template-columns: 50px 28px minmax(0, 1fr); gap: 0 10px; } .eab-schritt-zeit { font-size: 13.5px; } }

/* Willkommenspaket */
.eab-paket { display: grid; gap: 14px; grid-template-columns: repeat(2, minmax(0, 1fr)); margin-top: 40px; }
@media (min-width: 760px) { .eab-paket { grid-template-columns: repeat(5, minmax(0, 1fr)); } }
.eab-ding { background: ${T.weiss}; border-radius: 20px; padding: 22px 14px 18px; text-align: center; box-shadow: 0 2px 16px rgba(15,26,51,0.06); border: 1px solid ${T.linie}; }
.eab-ding svg { width: 64px; height: 64px; display: block; margin: 0 auto; }
.eab-ding b { display: block; font-size: 15.5px; font-weight: 700; margin-top: 12px; }
.eab-ding span { display: block; font-size: 13px; color: ${T.still}; margin-top: 3px; line-height: 1.4; }
.eab-paket .eab-ding:last-child { grid-column: 1 / -1; }
@media (min-width: 760px) { .eab-paket .eab-ding:last-child { grid-column: auto; } }

/* Gastgeber */
.eab-gast { display: grid; gap: 40px; grid-template-columns: minmax(0, 1fr); align-items: center; }
@media (min-width: 900px) { .eab-gast { grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr); gap: 72px; } }
.eab-portrait { position: relative; aspect-ratio: 4 / 5; max-width: 380px; width: 100%; justify-self: center; border-radius: 24px; overflow: hidden;
  background: radial-gradient(120% 90% at 30% 10%, #1B3778 0%, ${T.nacht} 60%, ${T.nachtTief} 100%); box-shadow: 0 24px 50px rgba(14,30,74,0.25); }
.eab-portrait img { width: 100%; height: 100%; object-fit: cover; display: block; }
.eab-monogramm { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 140px; font-weight: 800; letter-spacing: -0.06em; }
.eab-weg { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-top: 30px; }
.eab-weg div { border-radius: 16px; padding: 16px 12px 14px; background: ${T.weiss}; border: 1px solid ${T.linie}; text-align: center; }
.eab-weg b { display: block; font-size: clamp(26px, 4vw, 34px); font-weight: 800; letter-spacing: -0.04em; line-height: 1; color: ${T.nacht}; }
.eab-weg span { display: block; font-size: 12.5px; line-height: 1.4; color: ${T.still}; margin-top: 8px; }
.eab-weg div:last-child { background: ${T.nacht}; border-color: ${T.nacht}; }
.eab-weg div:last-child b { color: ${T.gold}; } .eab-weg div:last-child span { color: ${T.blauText}; }
.eab-text { font-size: 17px; line-height: 1.72; color: ${T.grau}; margin-top: 16px; }

/* Ort */
.eab-ort { display: grid; grid-template-columns: minmax(0, 1fr); border-radius: 26px; overflow: hidden; background: ${T.weiss}; box-shadow: 0 18px 50px rgba(15,26,51,0.12); margin-top: 40px; }
@media (min-width: 860px) { .eab-ort { grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr); } }
.eab-ort-bild { position: relative; min-height: 260px; background: linear-gradient(180deg,#2A2F38 0%,#14171C 100%); }
.eab-ort-text { padding: clamp(26px, 4vw, 44px); }
.eab-ort-text h3 { font-size: clamp(26px, 3.4vw, 34px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; }

/* Fragen */
.eab-fragen { margin-top: 36px; border-top: 1px solid ${T.linie}; }
.eab-fragen details { border-bottom: 1px solid ${T.linie}; }
.eab-fragen summary { list-style: none; cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 16px;
  padding: 20px 2px; font-size: 17px; font-weight: 700; letter-spacing: -0.01em; min-height: 56px; }
.eab-fragen summary::-webkit-details-marker { display: none; }
.eab-fragen details > summary::after, .eab-fragen details[open] > summary::after { content: none; display: none; }
.eab-fragen summary i { flex-shrink: 0; width: 30px; height: 30px; border-radius: 50%; background: ${T.himmel}; position: relative; transition: transform .2s ease, background .2s ease; }
.eab-fragen summary i::before, .eab-fragen summary i::after { content: ""; position: absolute; left: 9px; right: 9px; top: 14px; height: 2px; background: ${T.nacht}; border-radius: 1px; }
.eab-fragen summary i::after { transform: rotate(90deg); transition: transform .2s ease; }
.eab-fragen details[open] summary i { background: ${T.gold}; }
.eab-fragen details[open] summary i::after { transform: rotate(0deg); }
.eab-fragen details p { padding: 0 2px 22px; font-size: 16px; line-height: 1.7; color: ${T.grau}; max-width: 40em; }

/* Abschluss */
.eab-schluss { text-align: center; position: relative; overflow: hidden;
  background: radial-gradient(70% 70% at 50% 120%, rgba(237,170,40,0.32) 0%, rgba(237,170,40,0) 70%), radial-gradient(120% 90% at 50% 0%, #1B3778 0%, ${T.nacht} 50%, ${T.nachtTief} 100%); }
.eab-schluss .eab-knopfreihe { justify-content: center; }
.eab-zahlung { display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; margin-top: 18px; }

/* Leiste unten (Handy) */
.eab-leiste { position: fixed; left: 12px; right: 12px; bottom: 12px; z-index: 40; display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 10px 10px 10px 18px; border-radius: 999px; background: rgba(7,15,39,0.94); color: ${T.weiss}; box-shadow: 0 12px 30px rgba(0,0,0,0.35);
  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); transform: translateY(140%); transition: transform .3s ease; }
.eab-leiste.an { transform: translateY(0); }
.eab-leiste .eab-knopf { min-height: 44px; padding: 0 18px; font-size: 15px; }
.eab-leiste-text { font-size: 13px; line-height: 1.3; min-width: 0; }
.eab-leiste-text b { display: block; font-size: 14px; }
@media (min-width: 920px) { .eab-leiste { display: none; } }
@media (prefers-reduced-motion: reduce) { .eab-leiste { transition: none; } }
`;

const THEMEN = [
  ["Der Mythos vom Mathe-Gen", "Warum „Mein Kind ist halt kein Mathe-Typ“ nicht stimmt – und was die Lernforschung tatsächlich zeigt."],
  ["Wie Mathe im Kopf entsteht", "Was im Gehirn beim Lernen passiert und warum Verstehen, Struktur und Wiederholung mehr bringen als Auswendiglernen."],
  ["System + Freude = Erfolg", "Wie Pen & Paper, klare Routinen und das richtige Mindset zusammenwirken – und Mathe plötzlich Spaß macht."],
  ["Was Sie als Eltern tun können", "Wie Sie Ihr Kind unterstützen, ohne Druck aufzubauen – und welche Sätze am Küchentisch mehr helfen als Nachhilfe."],
  ["Die Programme von Mythos Mathe", "Mathe checken, die Mathe Abi Masterclass und die App – was dahintersteckt und für wen was passt."],
];

/* zeit: nur der Beginn steht fest. Weitere Uhrzeiten hier eintragen, sobald sie feststehen. */
const ABLAUF = [
  { zeit: "18:30", titel: "Ankommen", text: "Getränke, Snack und erstes Kennenlernen" },
  { zeit: "", titel: "Vortrag", text: "Der Mythos Mathe – und wie es wirklich funktioniert" },
  { zeit: "", titel: "Einblick", text: "Live gezeigt: Pen & Paper und die Mythos-Mathe-App" },
  { zeit: "", titel: "Die Programme", text: "Mathe checken und Mathe Abi Masterclass" },
  { zeit: "", titel: "Fragen & Gespräche", text: "Offene Runde und persönliche Gespräche" },
];

const SAETZE = [
  ["„Ich bin halt kein Mathe-Typ.“", "Ihr Kind, nach der dritten Fünf"],
  ["„Ich hab’s doch gelernt – und in der Arbeit war alles weg.“", "Ihr Kind, am Abend nach der Klausur"],
  ["„Mathe war bei mir auch nie so meins.“", "Vielleicht Sie selbst"],
];

const FRAGEN = [
  ["Darf ich mein Kind mitbringen?", "Gern. Viele Fragen klären sich am besten gemeinsam. Das Ticket gilt pro Person, buchen Sie also für Ihr Kind einfach ein Ticket mit."],
  ["Für welche Klassen ist der Abend gedacht?", "Für Eltern von Kindern an Gymnasium oder Gemeinschaftsschule, von Klasse 8 bis zur Kursstufe."],
  ELTERNABEND.zahlungAktiv
    ? ["Wie bezahle ich?", "Sicher über Stripe, mit Kreditkarte oder PayPal. Mehrere Tickets buchen Sie in einem Schritt, die Bestätigung kommt per E-Mail."]
    : ["Wie melde ich mich an?", "Die Online-Buchung startet in Kürze. Mit einem Bonuscode melden Sie sich schon jetzt im Ticket an: Code einlösen, Name und E-Mail eintragen, fertig. Bis zu vier Personen in einem Schritt."],
  ["Was ist im Ticket enthalten?", "Zwei Getränke, ein Snack und die Kursmaterialien: Block, Heft und Stift. Die Materialien nehmen Sie mit nach Hause."],
];

/* ---------- Hilfen ---------- */
function kalenderDatei() {
  const E = ELTERNABEND;
  const start = new Date(E.beginn);
  const ende = new Date(start.getTime() + E.dauerMinuten * 60000);
  const utc = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const esc = (s) => s.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;");
  const zeilen = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Mythos Mathe//Elternabend//DE", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:elternabend-${utc(start)}@mythosmathe.de`,
    `DTSTAMP:${utc(new Date())}`,
    `DTSTART:${utc(start)}`,
    `DTEND:${utc(ende)}`,
    `SUMMARY:${esc("Elternabend · Mythos Mathe")}`,
    `LOCATION:${esc(`${E.ort}, ${E.strasse}, ${E.plzOrt}`)}`,
    `DESCRIPTION:${esc("Warum Mathe-Talent ein Mythos ist – und wie Ihr Kind mit System und Freude stark wird.")}`,
    "BEGIN:VALARM", "TRIGGER:-PT3H", "ACTION:DISPLAY", `DESCRIPTION:${esc("Heute Abend: Elternabend in " + E.ort)}`, "END:VALARM",
    "END:VEVENT", "END:VCALENDAR",
  ];
  const blob = new Blob([zeilen.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "elternabend-mythos-mathe.ics";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function useRestzeit(zielIso) {
  const [jetzt, setJetzt] = useState(() => Date.now());
  useEffect(() => { const t = setInterval(() => setJetzt(Date.now()), 20000); return () => clearInterval(t); }, []);
  const ms = new Date(zielIso).getTime() - jetzt;
  if (!(ms > 0)) return null;
  const min = Math.floor(ms / 60000);
  return { tage: Math.floor(min / 1440), stunden: Math.floor((min % 1440) / 60), minuten: min % 60 };
}

/* ---------- Bausteine ---------- */
function Lichterkette() {
  const birnen = Array.from({ length: 15 }, (_, i) => {
    const x = 20 + i * 70;
    const y = 20 + 26 * Math.sin((Math.PI * ((i * 70) % 350)) / 350);
    return { x, y, verz: ((i * 37) % 23) / 10 };
  });
  return (
    <svg className="eab-kette" viewBox="0 0 1040 74" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <radialGradient id="eabGlut" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFE9A8" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#F5C24A" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#F5C24A" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d={"M 0 14 " + [0, 1, 2].map((k) => `Q ${175 + k * 350} 62 ${350 + k * 350} 14`).join(" ")} stroke="rgba(255,255,255,0.22)" strokeWidth="1.4" fill="none" />
      {birnen.map((b, i) => (
        <g key={i} className="eab-birne" style={{ animationDelay: `${b.verz}s` }}>
          <circle cx={b.x} cy={b.y + 9} r="16" fill="url(#eabGlut)" />
          <rect x={b.x - 2.2} y={b.y} width="4.4" height="4" rx="1" fill="rgba(255,255,255,0.35)" />
          <ellipse cx={b.x} cy={b.y + 9} rx="4.2" ry="5.4" fill="#FFE7A0" />
        </g>
      ))}
    </svg>
  );
}

function Symbol({ art }) {
  const s = { fill: "none", stroke: T.nacht, strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round" };
  if (art === "stift") return (
    <svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="#FFF6D6" />
      <path d="M 20 46 L 22 38 L 40 20 a 3 3 0 0 1 4.2 0 l 1.8 1.8 a 3 3 0 0 1 0 4.2 L 28 44 Z" fill={T.nacht} stroke={T.nacht} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M 37 23 L 43 29" stroke={T.gold} strokeWidth="2.4" /><path d="M 20 46 l 2 -8 l 6 6 z" fill="#F4E3B0" /></svg>);
  if (art === "heft") return (
    <svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="#FFF6D6" />
      <rect x="20" y="16" width="25" height="32" rx="3" fill={T.nacht} /><rect x="20" y="16" width="5" height="32" rx="2" fill={T.gold} />
      <rect x="29" y="23" width="11" height="6" rx="1" fill="#FFFFFF" /></svg>);
  if (art === "block") return (
    <svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="#FFF6D6" />
      <rect x="19" y="18" width="26" height="31" rx="2.5" fill="#FFFFFF" stroke={T.nacht} strokeWidth="2.2" />
      <path d="M 24 15 v 6 M 30 15 v 6 M 36 15 v 6 M 42 15 v 6" {...s} />
      <path d="M 24 29 h 16 M 24 35 h 16 M 24 41 h 10" stroke="#B7C4DA" strokeWidth="2" strokeLinecap="round" /></svg>);
  if (art === "getraenk") return (
    <svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="#FFF6D6" />
      <path d="M 18 28 h 22 v 8 a 11 11 0 0 1 -22 0 z" fill={T.nacht} />
      <path d="M 40 30 h 3 a 4 4 0 0 1 0 8 h -3" {...s} /><path d="M 14 48 h 30" {...s} />
      <path d="M 24 22 q -3 -4 0 -8 M 30 22 q -3 -4 0 -8" stroke={T.gold} strokeWidth="2.2" fill="none" strokeLinecap="round" /></svg>);
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="#FFF6D6" />
      <path d="M 16 40 a 16 16 0 0 1 32 0 z" fill={T.gold} /><path d="M 14 40 h 36 l -3 6 h -30 z" fill={T.nacht} />
      <circle cx="26" cy="33" r="1.6" fill={T.nacht} /><circle cx="33" cy="30" r="1.6" fill={T.nacht} /><circle cx="39" cy="35" r="1.6" fill={T.nacht} /></svg>);
}

function ZeileSymbol({ art }) {
  const s = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: T.goldText, strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0, marginTop: 1 }, "aria-hidden": true };
  if (art === "ort") return <svg {...s}><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>;
  if (art === "plaetze") return <svg {...s}><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0" /><circle cx="17" cy="9" r="2.6" /><path d="M15.5 14.2A4.6 4.6 0 0 1 21 19" /></svg>;
  return <svg {...s}><path d="M5 12h4l2-6 2 12 2-6h4" /></svg>;
}

function Zahlungsmarken() {
  return (
    <div className="eab-zahlung">
      <PayPalMarke /><KarteMarke />
    </div>
  );
}

/* ---------- Bonuscode & Anmeldung ----------
   Übergangsphase (zahlungAktiv: false): Online-Zahlung ist aus. Mit einem gültigen Bonuscode
   melden sich Eltern direkt an. Gespeichert wird über die Supabase-Funktion elternabend_anmelden
   (supabase/elternabend.sql) – sie prüft Code und freie Plätze selbst.
   Sobald Stripe läuft: zahlungAktiv: true, dann geht der Code als prefilled_promo_code an Stripe. */
const GRATIS_CODES = ["MATHE27"];
const bonusNorm = (s) => String(s || "").trim().toUpperCase().replace(/\s+/g, "");
export const bonusGratis = (code) => GRATIS_CODES.includes(bonusNorm(code));
export function ticketHref(code) {
  if (!ELTERNABEND.zahlungAktiv) return "#eab-ticket-oben";
  const c = bonusNorm(code);
  if (!c) return ELTERNABEND.ticketLink;
  const trenner = ELTERNABEND.ticketLink.includes("?") ? "&" : "?";
  return `${ELTERNABEND.ticketLink}${trenner}prefilled_promo_code=${encodeURIComponent(c)}`;
}
function zumTicket(e) {
  if (ELTERNABEND.zahlungAktiv) return;
  e.preventDefault();
  const ziel = document.getElementById("eab-ticket-oben");
  if (ziel) window.scrollTo({ top: ziel.getBoundingClientRect().top + window.scrollY - 96, behavior: "smooth" });
  setTimeout(() => { const f = ziel && ziel.querySelector("input"); if (f) f.focus({ preventScroll: true }); }, 450);
}
const knopfText = (code, mitPreis) => {
  if (bonusGratis(code)) return mitPreis ? "Platz sichern – kostenlos" : "Kostenlos";
  if (!ELTERNABEND.zahlungAktiv) return mitPreis ? "Platz sichern" : "Anmelden";
  return mitPreis ? `Platz sichern – ${ELTERNABEND.preis} €` : `${ELTERNABEND.preis} €`;
};

/* kleiner geteilter Speicher (sessionStorage), damit alle Knöpfe denselben Stand zeigen */
function speicher(schluessel) {
  const hoerer = new Set();
  let wert = (() => { try { return sessionStorage.getItem(schluessel) || ""; } catch { return ""; } })();
  const setzen = (v) => {
    wert = v;
    try { v ? sessionStorage.setItem(schluessel, v) : sessionStorage.removeItem(schluessel); } catch { /* egal */ }
    hoerer.forEach((f) => f(v));
  };
  const use = () => {
    const [w, setW] = useState(wert);
    useEffect(() => { hoerer.add(setW); return () => { hoerer.delete(setW); }; }, []);
    return w;
  };
  return { setzen, use };
}
const BONUS = speicher("mm-ea-bonus");
const ANGEMELDET = speicher("mm-ea-angemeldet");
const bonusSetzen = BONUS.setzen;
const useBonus = BONUS.use;

const feldStil = { width: "100%", boxSizing: "border-box", padding: "11px 12px", borderRadius: 10, border: `1.5px solid ${T.nacht}33`, fontSize: 15, fontFamily: "inherit", background: "#fff", color: T.nacht };
const linkKnopf = { background: "none", border: 0, padding: 0, color: T.see, textDecoration: "underline", fontSize: 13, cursor: "pointer", fontFamily: "inherit" };

function BonusFeld() {
  const bonus = useBonus();
  const [offen, setOffen] = useState(!!bonus || !ELTERNABEND.zahlungAktiv);
  const [eingabe, setEingabe] = useState(bonus);
  const [falsch, setFalsch] = useState(false);
  if (!offen) {
    return <button type="button" onClick={() => setOffen(true)} style={{ ...linkKnopf, padding: "2px 0 10px" }}>Bonuscode eingeben</button>;
  }
  const einloesen = (e) => {
    e.preventDefault();
    const c = bonusNorm(eingabe);
    // In der Übergangsphase gilt nur ein gültiger Code; mit Stripe prüft Stripe jeden Code selbst.
    if (!ELTERNABEND.zahlungAktiv && !bonusGratis(c)) { setFalsch(!!c); bonusSetzen(""); return; }
    setFalsch(false); bonusSetzen(c);
  };
  const angewendet = bonusNorm(bonus) && bonusNorm(bonus) === bonusNorm(eingabe);
  return (
    <div style={{ marginBottom: 12 }}>
      <form onSubmit={einloesen} style={{ display: "flex", gap: 8 }}>
        <input value={eingabe} onChange={(e) => { setEingabe(e.target.value); setFalsch(false); }} placeholder="Bonuscode" aria-label="Bonuscode" size={1}
          autoCapitalize="characters" autoComplete="off" spellCheck={false} style={{ ...feldStil, flex: 1, minWidth: 0, width: "auto", textTransform: "uppercase" }} />
        <button type="submit" className="eab-knopf eab-rand-dunkel" style={{ padding: "10px 14px", flexShrink: 0, minHeight: 0 }}>Einlösen</button>
      </form>
      {falsch && <p role="alert" style={{ margin: "6px 0 0", fontSize: 13, color: T.rot }}>Dieser Code ist leider nicht gültig.</p>}
      {angewendet && (
        <p style={{ margin: "6px 0 0", fontSize: 13, color: bonusGratis(bonus) ? "#1E7A46" : T.see }}>
          {bonusGratis(bonus) ? "✓ Bonuscode eingelöst – Ihr Ticket ist kostenlos." : "Der Code wird im nächsten Schritt bei Stripe geprüft."}
          {" "}<button type="button" onClick={() => { bonusSetzen(""); setEingabe(""); }} style={linkKnopf}>Entfernen</button>
        </p>
      )}
    </div>
  );
}

const FEHLER_TEXT = {
  code: "Dieser Bonuscode ist nicht gültig.",
  voll: "Leider sind nicht mehr genug Plätze frei.",
  daten: "Bitte Name und eine gültige E-Mail-Adresse angeben.",
};

function AnmeldeFormular({ bonus }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [personen, setPersonen] = useState("1");
  const [telefon, setTelefon] = useState("");
  const [laeuft, setLaeuft] = useState(false);
  const [fehler, setFehler] = useState("");
  const senden = async (e) => {
    e.preventDefault();
    if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setFehler(FEHLER_TEXT.daten); return; }
    if (!sb) { setFehler("Die Anmeldung ist gerade nicht erreichbar. Bitte versuchen Sie es später noch einmal."); return; }
    setLaeuft(true); setFehler("");
    const { error } = await sb.rpc("elternabend_anmelden", {
      p_name: name.trim(), p_email: email.trim(), p_personen: Number(personen), p_telefon: telefon.trim() || null, p_code: bonusNorm(bonus),
    });
    setLaeuft(false);
    if (error) {
      const m = String(error.message || "");
      const art = Object.keys(FEHLER_TEXT).find((k) => m.includes(`ea_${k}`));
      setFehler(art ? FEHLER_TEXT[art] : "Die Anmeldung hat nicht geklappt. Bitte versuchen Sie es später noch einmal.");
      return;
    }
    ANGEMELDET.setzen(JSON.stringify({ name: name.trim(), personen: Number(personen) }));
  };
  return (
    <form onSubmit={senden} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 8, marginBottom: 10 }} noValidate>
      <input style={feldStil} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ihr Name" aria-label="Ihr Name" size={1} autoComplete="name" />
      <input style={feldStil} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-Mail" aria-label="E-Mail" size={1} autoComplete="email" />
      <div style={{ display: "flex", gap: 8 }}>
        <select style={{ ...feldStil, width: "auto", flex: "0 0 auto" }} value={personen} onChange={(e) => setPersonen(e.target.value)} aria-label="Personen">
          {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n} {n === 1 ? "Person" : "Personen"}</option>)}
        </select>
        <input style={{ ...feldStil, flex: 1, minWidth: 0, width: "auto" }} type="tel" value={telefon} onChange={(e) => setTelefon(e.target.value)} placeholder="Telefon (optional)" aria-label="Telefon (optional)" size={1} autoComplete="tel" />
      </div>
      {fehler && <p role="alert" style={{ margin: 0, fontSize: 13, color: T.rot }}>{fehler}</p>}
      <button type="submit" className="eab-knopf eab-gold" disabled={laeuft} style={{ width: "100%", marginTop: 2 }}>
        {laeuft ? "Wird gesendet …" : "Kostenlos anmelden"}
      </button>
    </form>
  );
}

function AngemeldetHinweis({ daten }) {
  let d = {};
  try { d = JSON.parse(daten) || {}; } catch { /* egal */ }
  return (
    <div role="status" style={{ borderRadius: 14, padding: "12px 14px", marginBottom: 10, background: "#E6F6EF", border: "1px solid #9BD9B8", color: "#0F5C3A" }}>
      <p style={{ margin: 0, fontWeight: 800, fontSize: 15.5 }}>✓ Sie sind angemeldet{d.personen > 1 ? ` (${d.personen} Personen)` : ""}.</p>
      <p style={{ margin: "4px 0 0", fontSize: 13.5, lineHeight: 1.5 }}>Wir freuen uns auf Sie am {ELTERNABEND.datum} um {ELTERNABEND.uhrzeit} in {ELTERNABEND.ort}. Tragen Sie sich den Termin am besten gleich ein.</p>
    </div>
  );
}

function Ticket({ id }) {
  const E = ELTERNABEND;
  const bonus = useBonus();
  const angemeldet = ANGEMELDET.use();
  const tag = E.beginn.slice(8, 10);
  const gratis = bonusGratis(bonus);
  return (
    <aside className="eab-ticket" id={id} aria-label="Ticket Elternabend">
      <div className="eab-ticket-oben">
        <div className="eab-ticket-marke"><span>MYTHOS MATHE LIVE</span><span>ELTERNABEND</span></div>
        <div className="eab-datum">
          <span className="eab-tag">{tag}</span>
          <span>
            <span className="eab-monat" style={{ display: "block" }}>SONNTAG · FEBRUAR 2027</span>
            <span className="eab-zeit" style={{ display: "block" }}>{E.uhrzeit}</span>
          </span>
        </div>
      </div>
      <div className="eab-perfo" aria-hidden="true" />
      <div className="eab-ticket-unten">
        <div className="eab-zeile"><ZeileSymbol art="ort" /><span><b>{E.ort}</b><span>{E.strasse}, {E.plzOrt}</span></span></div>
        <div className="eab-zeile"><ZeileSymbol art="plaetze" /><span><b>Maximal {E.plaetze} Plätze</b><span>Zwei Getränke, Snack und Kursmaterialien inklusive</span></span></div>
        <div className="eab-preis">
          <span className="eab-monat">PRO PERSON</span>
          {gratis
            ? <span><s style={{ fontSize: 18, color: T.see, marginRight: 8 }}>{E.preis} €</s><span className="eab-preis-zahl">0 €</span></span>
            : <span className="eab-preis-zahl">{E.preis} €</span>}
        </div>
        {angemeldet ? <AngemeldetHinweis daten={angemeldet} /> : (
          <>
            {!E.zahlungAktiv && !gratis && (
              <p style={{ margin: "0 0 10px", fontSize: 13.5, lineHeight: 1.5, color: T.nacht }}>
                Die Online-Buchung startet in Kürze. <b>Mit Bonuscode</b> können Sie sich schon jetzt anmelden.
              </p>
            )}
            <BonusFeld />
            {E.zahlungAktiv ? (
              <a className="eab-knopf eab-gold" href={ticketHref(bonus)} rel="noopener" style={{ width: "100%" }}>
                {gratis ? "Kostenlos Platz sichern" : "Platz sichern"}
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8.5 4l4 4-4 4" stroke={T.nachtTief} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </a>
            ) : gratis && <AnmeldeFormular bonus={bonus} />}
          </>
        )}
        <button type="button" className="eab-knopf eab-rand-dunkel" onClick={kalenderDatei} style={{ width: "100%", marginTop: 10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.nacht} strokeWidth="2" strokeLinecap="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2.5" /><path d="M3.5 10h17M8 3v4M16 3v4" /></svg>
          In den Kalender
        </button>
      </div>
    </aside>
  );
}

function Countdown() {
  const r = useRestzeit(ELTERNABEND.beginn);
  if (!r) return null;
  const feld = (zahl, ein, mehr) => (
    <div className="eab-uhr-feld"><span className="eab-uhr-zahl">{zahl}</span><span className="eab-uhr-wort">{zahl === 1 ? ein : mehr}</span></div>
  );
  return (
    <div className="eab-uhr" role="timer" aria-label={`Noch ${r.tage} Tage, ${r.stunden} Stunden und ${r.minuten} Minuten bis zum Elternabend`}>
      {feld(r.tage, "Tag", "Tage")}{feld(r.stunden, "Stunde", "Stunden")}{feld(r.minuten, "Minute", "Minuten")}
      <span className="eab-uhr-text">bis wir uns<br />im Café sehen</span>
    </div>
  );
}

function Portrait() {
  const [da, setDa] = useState(true);
  return (
    <figure className="eab-portrait">
      {da ? <img src="/landingpage/basti.jpg" alt="Basti Blumenröther" loading="lazy" onError={() => setDa(false)} /> : (
        <span className="eab-monogramm" aria-label="Basti Blumenröther" role="img">
          <span style={{ background: "linear-gradient(180deg,#FFE58A 0%,#EDBB00 50%,#B88B00 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>B</span>
        </span>
      )}
    </figure>
  );
}

function Leiste() {
  const bonus = useBonus();
  const [an, setAn] = useState(false);
  useEffect(() => {
    const pruefen = () => {
      const oben = document.getElementById("eab-ticket-oben");
      const unten = document.getElementById("eab-ticket-unten");
      const obenWeg = oben ? oben.getBoundingClientRect().bottom < 0 : false;
      const untenDa = unten ? unten.getBoundingClientRect().top < window.innerHeight : false;
      setAn(obenWeg && !untenDa);
    };
    window.addEventListener("scroll", pruefen, { passive: true });
    window.addEventListener("resize", pruefen);
    pruefen();
    return () => { window.removeEventListener("scroll", pruefen); window.removeEventListener("resize", pruefen); };
  }, []);
  const E = ELTERNABEND;
  return (
    <div className={`eab-leiste${an ? " an" : ""}`} aria-hidden={!an}>
      <span className="eab-leiste-text"><b>{E.datumKurz.replace("Sonntag", "So")}</b>{E.uhrzeit} · {E.ort}</span>
      <a className="eab-knopf eab-gold" href={ticketHref(bonus)} onClick={zumTicket} rel="noopener" tabIndex={an ? 0 : -1}>{E.zahlungAktiv || bonusGratis(bonus) ? `${knopfText(bonus, false)} · Platz sichern` : "Platz sichern"}</a>
    </div>
  );
}

function DankeKarte() {
  return (
    <div role="status" style={{ borderRadius: 18, padding: "16px 18px", marginTop: 8, marginBottom: 8, background: "rgba(56,180,110,0.14)", border: "1px solid rgba(120,220,160,0.45)", color: "#E9FFF1" }}>
      <p style={{ fontSize: 17, fontWeight: 800 }}>Danke, Ihr Ticket ist gebucht!</p>
      <p style={{ fontSize: 14.5, lineHeight: 1.55, marginTop: 4, color: "#CFF5DD" }}>Die Bestätigung kommt per E-Mail. Wir freuen uns auf Sie am {ELTERNABEND.datum} um {ELTERNABEND.uhrzeit} in {ELTERNABEND.ort}.</p>
    </div>
  );
}

/* ---------- Seite ---------- */
export function ElternabendSeite({ gebucht }) {
  const E = ELTERNABEND;
  const bonus = useBonus();
  return (
    <div className="eab">
      <style>{CSS_SEITE}</style>

      {/* Kopf */}
      <header className="eab-kopf">
        <Lichterkette />
        <div className="eab-innen">
          {gebucht && <DankeKarte />}
          <div className="eab-kopf-raster">
            <div>
              <p className="eab-kicker" style={{ color: T.gold }}>Elternabend · {E.datumKurz.replace(/^Sonntag, /, "")} · {E.uhrzeit}</p>
              <h1 className="eab-h1">Ihr Kind braucht kein <em>Mathe-Gen.</em></h1>
              <p className="eab-hand eab-unter">Ein Abend bei Getränken, Snack und Aha‑Momenten.</p>
              <p className="eab-lead">
                In {E.ort} in Dingelsdorf zeige ich Ihnen, warum Mathe-Talent ein Mythos ist, wie Mathe im Kopf entsteht
                und was Ihr Kind mit System und Freude erreichen kann.
              </p>
              <div className="eab-knopfreihe">
                <a className="eab-knopf eab-gold" href={ticketHref(bonus)} onClick={zumTicket} rel="noopener">{knopfText(bonus, true)}</a>
                <a className="eab-knopf eab-rand" href="#eab-programm">Was Sie erwartet</a>
              </div>
              <Countdown />
            </div>
            <div id="eab-ticket-oben" style={{ display: "grid" }}><Ticket /></div>
          </div>
        </div>
      </header>

      {/* Sätze */}
      <section className="eab-sektion">
        <div className="eab-innen">
          <p className="eab-kicker">Kennen Sie das?</p>
          <h2 className="eab-h2">Drei Sätze vom Küchentisch.</h2>
          <div className="eab-saetze">
            {SAETZE.map(([satz, wer]) => (
              <figure key={satz} className="eab-zettel">
                <p className="eab-hand">{satz}</p>
                <small>{wer}</small>
              </figure>
            ))}
          </div>
          <p className="eab-antwort">Keiner dieser Sätze ist das Ende der Geschichte. Wie es weitergeht, erleben Sie an diesem Abend.</p>
          <p className="eab-hand eab-gleichung" aria-label="Nicht Mathe gleich Talent, sondern Mathe gleich System plus Freude.">
            <s>Mathe = Talent</s><span>Mathe = System + Freude</span>
          </p>
        </div>
      </section>

      {/* Themen */}
      <section className="eab-sektion eab-dunkel" id="eab-programm">
        <div className="eab-innen">
          <p className="eab-kicker">Worum es geht</p>
          <h2 className="eab-h2">Fünf Themen. Ein Abend.</h2>
          <p className="eab-lead">Kein trockener Vortrag, sondern eine Infoveranstaltung mit Entertainment-Charakter – und mit vielen Momenten, in denen es klick macht.</p>
          <div className="eab-themen">
            {THEMEN.map(([t, s], i) => (
              <article key={t} className="eab-thema">
                <span className="eab-thema-nr" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <h3>{t}</h3>
                <p>{s}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Ablauf + Paket */}
      <section className="eab-sektion">
        <div className="eab-innen eab-schmal">
          <p className="eab-kicker">Ablauf</p>
          <h2 className="eab-h2">So läuft der Abend.</h2>
          <div className="eab-ablauf">
            {ABLAUF.map((a) => (
              <div key={a.titel} className="eab-schritt">
                <span className="eab-schritt-zeit">{a.zeit}</span>
                <span className="eab-schritt-achse"><span className="eab-punkt" /></span>
                <span className="eab-schritt-text"><b>{a.titel}</b><span>{a.text}</span></span>
              </div>
            ))}
          </div>
        </div>
        <div className="eab-innen" style={{ marginTop: "clamp(56px, 8vw, 96px)" }}>
          <p className="eab-kicker">Im Ticket enthalten</p>
          <h2 className="eab-h2">Sie gehen nicht mit leeren Händen.</h2>
          <div className="eab-paket">
            {[
              ["stift", "Stift", "Für Pen & Paper"],
              ["heft", "Heft", "Zum Mitnehmen"],
              ["block", "Block", "Für Ihre Notizen"],
              ["getraenk", "Zwei Getränke", "Inklusive"],
              ["snack", "Ein Snack", "Für zwischendurch"],
            ].map(([art, t, s]) => (
              <div key={art} className="eab-ding"><Symbol art={art} /><b>{t}</b><span>{s}</span></div>
            ))}
          </div>
        </div>
      </section>

      {/* Gastgeber */}
      <section className="eab-sektion" style={{ background: "#EEF3FA" }}>
        <div className="eab-innen eab-gast">
          <Portrait />
          <div>
            <p className="eab-kicker">Ihr Gastgeber</p>
            <h2 className="eab-h2">Von der 2 zur 1,0.</h2>
            <p className="eab-text">
              Ich bin Basti. Ich studiere Mathematik an der Universität Konstanz, lebe in Dingelsdorf und begleite seit vielen Jahren
              Schüler durch Mathe – von der Mittelstufe bis zum Abitur.
            </p>
            <p className="eab-text">
              In den ersten drei Jahren am Gymnasium stand bei mir eine 2. Dann habe ich ab Klasse 8 einen anderen Weg eingeschlagen.
              Was ich dabei gelernt habe, erzähle ich Ihnen an diesem Abend.
            </p>
            <div className="eab-weg">
              <div><b>2</b><span>Klasse 5 bis 7</span></div>
              <div><b>↗</b><span>Ab Klasse 8 ein neuer Weg</span></div>
              <div><b>1,0</b><span>Ab Klasse 10</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Ort */}
      <section className="eab-sektion">
        <div className="eab-innen">
          <p className="eab-kicker">Der Ort</p>
          <h2 className="eab-h2">Im Café, nicht im Klassenzimmer.</h2>
          <div className="eab-ort">
            <div className="eab-ort-bild"><div style={{ position: "absolute", inset: 0 }}><CafeBild /></div></div>
            <div className="eab-ort-text">
              <h3>{E.ort}</h3>
              <p className="eab-text" style={{ marginTop: 10 }}>{E.strasse}<br />{E.plzOrt}</p>
              <p className="eab-text">Gemütlich, mitten in Dingelsdorf am Bodensee. Ein Ort, an dem man gern bleibt und Fragen stellt.</p>
              <div className="eab-knopfreihe" style={{ marginTop: 22 }}>
                <a className="eab-knopf eab-rand-dunkel" href={E.karte} target="_blank" rel="noopener noreferrer">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.nacht} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
                  Route planen
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fragen */}
      <section className="eab-sektion" style={{ paddingTop: 0 }}>
        <div className="eab-innen eab-schmal">
          <p className="eab-kicker">Gut zu wissen</p>
          <h2 className="eab-h2">Häufige Fragen.</h2>
          <div className="eab-fragen">
            {FRAGEN.map(([f, a]) => (
              <details key={f}><summary>{f}<i aria-hidden="true" /></summary><p>{a}</p></details>
            ))}
          </div>
        </div>
      </section>

      {/* Abschluss */}
      <section className="eab-sektion eab-schluss eab-dunkel" style={{ paddingBottom: "clamp(96px, 12vw, 128px)" }}>
        <div className="eab-innen eab-schmal" id="eab-ticket-unten">
          <p className="eab-kicker">{E.datum} · {E.uhrzeit}</p>
          <h2 className="eab-h2">Ein Abend, der Mathe zu Hause leichter macht.</h2>
          <p className="eab-lead" style={{ marginLeft: "auto", marginRight: "auto" }}>Die Plätze im Café sind auf {E.plaetze} begrenzt. Sichern Sie sich Ihr Ticket – wir freuen uns auf Sie.</p>
          <div className="eab-knopfreihe">
            <a className="eab-knopf eab-gold" href={ticketHref(bonus)} onClick={zumTicket} rel="noopener">{knopfText(bonus, true)}</a>
            <button type="button" className="eab-knopf eab-rand" onClick={kalenderDatei}>In den Kalender</button>
          </div>
          {E.zahlungAktiv ? (
            <>
              <Zahlungsmarken />
              <p style={{ marginTop: 12, fontSize: 13, color: T.blauText }}>Sichere Zahlung über Stripe. Die Bestätigung kommt per E-Mail.</p>
            </>
          ) : <p style={{ marginTop: 12, fontSize: 13, color: T.blauText }}>Die Online-Buchung startet in Kürze. Mit Bonuscode können Sie sich schon jetzt im Ticket oben anmelden.</p>}
        </div>
      </section>

      <Leiste />
    </div>
  );
}
