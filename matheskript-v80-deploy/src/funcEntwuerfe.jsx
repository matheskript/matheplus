import React, { useState } from "react";
import bildBerg from "./assets/entwurf/berg.jpg";
import bildHeft from "./assets/entwurf/heft.jpg";
import bildMuenzen from "./assets/entwurf/muenzen.jpg";
import bildStift from "./assets/entwurf/stift.jpg";
import bildGipfel from "./assets/entwurf/gipfel.jpg";
import { AufklappZeichen } from "./aufklappen.jsx";

/* ======================================================================
   WEBSEITEN-ENTWÜRFE
   Drei parallele Seiten nach den Design-Entwürfen (Oktober 2026):
     entwurf-start    – neue Startseite „Weniger Mathe-Stress“
     entwurf-checken  – Kursseite „Mathe-Checken“ (2 Monate)
     entwurf-pakete   – Tool-Pakete „Dein Training“ (Kostenlos/Plus/Maximum)
   Die bestehende App bleibt unverändert; umgeschaltet wird über den
   Seiten-Knopf in der Kopfleiste (func10.jsx).
   ====================================================================== */

export const ENTWUERFE = [
  { ansicht: "entwurf-start", name: "Neue Startseite", kurz: "Weniger Mathe-Stress – Einstieg & Überblick" },
  { ansicht: "entwurf-checken", name: "Mathe-Checken", kurz: "Kursseite – 2-Monats-Konzept" },
  { ansicht: "entwurf-pakete", name: "Tool-Pakete", kurz: "Kostenlos, Plus & Maximum" },
];
export const istEntwurf = (a) => typeof a === "string" && a.startsWith("entwurf-");

/* ---------------------------------------------------------------- Passwort-Sperre
   Die drei Entwürfe sind intern: Zugang nur mit Passwort (klein geschrieben).
   Im Code steht nur der SHA-256-Wert, nicht das Passwort selbst. Einmal
   entsperrt, bleibt der Zugang für diese Browser-Sitzung offen.
   Hinweis: Das ist eine Sperre im Browser, kein Server-Schutz. */
const PW_HASH = "744ac4c7a298e917d88972fbbf5a9440cc04c24e24b63c62d292b1771ab69d7b";
const FREI_KEY = "mm-entwurf-frei";
const istFrei = () => { try { return sessionStorage.getItem(FREI_KEY) === PW_HASH; } catch (e) { return false; } };
async function sha256(t) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t));
  return Array.from(new Uint8Array(b)).map((x) => x.toString(16).padStart(2, "0")).join("");
}
export function EntwurfTor({ children, gehe }) {
  const [frei, setFrei] = useState(istFrei);
  const [pw, setPw] = useState("");
  const [fehler, setFehler] = useState(false);
  if (frei) return children;
  const pruefen = async (e) => {
    e.preventDefault();
    let ok = false;
    try { ok = (await sha256(pw.trim().toLowerCase())) === PW_HASH; } catch (err) { ok = false; }
    if (ok) { try { sessionStorage.setItem(FREI_KEY, PW_HASH); } catch (err) { /* privat */ } setFrei(true); window.scrollTo(0, 0); }
    else { setFehler(true); setPw(""); }
  };
  return (
    <div style={{ minHeight: "calc(100vh - 56px)", background: `radial-gradient(120% 90% at 80% 0%, #17306B 0%, ${N} 50%, ${N2} 100%)`, color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 18px", fontFamily: "Montserrat, system-ui, sans-serif" }}>
      <form onSubmit={pruefen} style={{ width: "100%", maxWidth: 380, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.16)",
        borderRadius: 18, padding: "30px 24px", textAlign: "center" }}>
        <span style={{ width: 58, height: 58, borderRadius: 999, border: `2px solid ${GOLD}`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="5" y="11" width="14" height="10" rx="2.2" /><path d="M8 11V7.5a4 4 0 0 1 8 0V11" /></svg>
        </span>
        <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.16em", color: GOLD, marginTop: 16 }}>INTERNER ENTWURF</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: "8px 0 0", letterSpacing: "-0.02em" }}>Bitte Passwort eingeben</h1>
        <p style={{ fontSize: 14, lineHeight: 1.5, color: "#DCE5F5", margin: "8px 0 20px" }}>Diese Seite ist noch nicht öffentlich.</p>
        <input type="password" value={pw} autoFocus autoComplete="off" aria-label="Passwort"
          onChange={(e) => { setPw(e.target.value); setFehler(false); }} placeholder="Passwort"
          style={{ width: "100%", boxSizing: "border-box", padding: "13px 14px", borderRadius: 10, fontSize: 16, fontFamily: "inherit", color: TXT,
            border: `2px solid ${fehler ? "#E5484D" : "transparent"}`, outline: "none", background: "#fff" }} />
        {fehler && <div role="alert" style={{ color: "#FFB4B4", fontSize: 13, marginTop: 8 }}>Das Passwort stimmt nicht.</div>}
        <Knopf typ="submit" breit style={{ marginTop: 14 }}><MitPfeil t="Entsperren" /></Knopf>
        <button type="button" onClick={() => gehe({ ansicht: "start" })}
          style={{ marginTop: 14, background: "none", border: "none", color: "#C9D6EE", fontSize: 13.5, fontFamily: "inherit", cursor: "pointer", textDecoration: "underline" }}>
          Zur Startseite
        </button>
      </form>
    </div>
  );
}

const N = "#0B1E4A";        // Navy (Flächen, Überschriften)
const N2 = "#08173B";       // Navy tief
const GOLD = "#F5B820";
const GOLD_TXT = "#F5B820";
const TXT = "#1A2747";
const GRAU = "#5A6582";
const HELL = "#F2F6FC";      // helle Sektion
const KARTE = "#EEF3FA";     // Karten auf Weiß
const BLAU_TXT = "#C9D6EE";

/* ---------------------------------------------------------------- Icons */
const I = {
  play: <><rect x="3" y="5" width="18" height="13" rx="2.5" /><path d="M10 9.2v5.6l4.8-2.8z" fill="currentColor" stroke="none" /><path d="M8 21h8" /></>,
  playKreis: <><circle cx="12" cy="12" r="9.5" /><path d="M10 8.5v7l6-3.5z" fill="currentColor" stroke="none" /></>,
  dok: <><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4M9.5 12h6M9.5 15h6M9.5 18h4" /></>,
  stiftblatt: <><path d="M5 4h10v16H5z" /><path d="M8 8h4M8 11h4M8 14h2" /><path d="M19.5 6.5l-6 6-1 3 3-1 6-6z" /></>,
  sprech: <><path d="M4 5h16v11H9l-5 4z" /><circle cx="9" cy="10.5" r="0.9" fill="currentColor" /><circle cx="12" cy="10.5" r="0.9" fill="currentColor" /><circle cx="15" cy="10.5" r="0.9" fill="currentColor" /></>,
  hut: <><path d="M2 9l10-5 10 5-10 5z" /><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5M22 9v6" /></>,
  balken: <><path d="M5 20v-5M10 20v-9M15 20v-12M20 20V4" strokeWidth="3" /></>,
  geschenk: <><rect x="3.5" y="9" width="17" height="11" rx="1.5" /><path d="M2.5 9h19v-3h-19zM12 6v14M12 6c-1.5-3-5-3.5-5-1.2C7 6 10 6 12 6zm0 0c1.5-3 5-3.5 5-1.2C17 6 14 6 12 6z" /></>,
  stern: <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />,
  krone: <><path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 10H5z" /><path d="M5 21h14" /></>,
  birne: <><path d="M9 18h6M10 21h4M8.5 14.5C6.8 13.2 6 11.5 6 9.6 6 6.4 8.7 4 12 4s6 2.4 6 5.6c0 1.9-.8 3.6-2.5 4.9-.6.5-1 1.2-1 2v.5h-5v-.5c0-.8-.4-1.5-1-2z" /></>,
  wagen: <><path d="M2.5 4h2.5l2.4 11h11l2.1-8H6.3" /><circle cx="9" cy="19" r="1.5" /><circle cx="17" cy="19" r="1.5" /></>,
  zahnrad: <><circle cx="12" cy="12" r="3" /><path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4L5.3 5.3" /><circle cx="12" cy="12" r="6.5" /></>,
  rechnung: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4M9 13h6M9 16.5h6" /></>,
  person: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" /></>,
  gruppe: <><circle cx="8.5" cy="8.5" r="3.2" /><circle cx="16.5" cy="9" r="2.7" /><path d="M2.5 20c0-3.6 2.7-6 6-6s6 2.4 6 6M14.5 14.3c.6-.2 1.3-.3 2-.3 2.9 0 5 2 5 5.3" /></>,
  frage: <><path d="M9 9.2a3 3 0 1 1 4.3 2.7c-.8.4-1.3 1.1-1.3 2V15" /><circle cx="12" cy="18.5" r="0.6" fill="currentColor" /></>,
  schild: <><path d="M12 3l8 3v6c0 4.6-3.4 8.2-8 9-4.6-.8-8-4.4-8-9V6z" /><path d="M12 16.5l-3.2-3.1a2 2 0 0 1 3.2-2.4 2 2 0 0 1 3.2 2.4z" fill="currentColor" /></>,
  ziel: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" /><path d="M14 10l6-6M17 4h3v3" /></>,
  hirn: <><path d="M9 4.5a3 3 0 0 0-3 3 3 3 0 0 0-2 5.3A3 3 0 0 0 6.5 18 3 3 0 0 0 12 19V5.5A3 3 0 0 0 9 4.5z" /><path d="M15 4.5a3 3 0 0 1 3 3 3 3 0 0 1 2 5.3 3 3 0 0 1-2.5 5.2A3 3 0 0 1 12 19" /><path d="M8 10h2M14 10h2M8 14.5h2M14 14.5h2" /></>,
  etikett: <><path d="M3 12V4h8l10 10-8 8z" /><circle cx="7.5" cy="8" r="1.4" fill="currentColor" /></>,
  karte: <><rect x="2.5" y="5.5" width="19" height="13" rx="2" /><path d="M2.5 10h19M6 15h4" /></>,
  zitat: <path d="M5 17c0-4 1-7.5 4.5-9.5l1 1.5C8.5 10.5 8 12 8 13h3v5H5zm8 0c0-4 1-7.5 4.5-9.5l1 1.5c-2 1.5-2.5 3-2.5 4h3v5h-6z" fill="currentColor" stroke="none" />,
  haken: <path d="M7 12.5l3.2 3.2L17 9" />,
  pfeil: <path d="M5 12h13M13 7l5 5-5 5" />,
  rechts: <path d="M9 6l6 6-6 6" />,
  runter: <path d="M6 9l6 6 6-6" />,
  rauf: <path d="M6 15l6-6 6 6" />,
};
function Ic({ n, s = 24, w = 1.8, farbe = "currentColor", style }) {
  return (
    <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke={farbe} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, display: "block", color: farbe, ...style }} aria-hidden="true">{I[n]}</svg>
  );
}
/* Rundes Icon-Medaillon */
function Medaille({ n, s = 52, voll, rand, dunkel }) {
  return (
    <span style={{ width: s, height: s, borderRadius: 999, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
      background: voll ? `linear-gradient(160deg,#FFD45A,${GOLD})` : dunkel ? "transparent" : "#FDF0CC",
      border: rand ? `2px solid ${GOLD}` : "none", color: voll ? N : dunkel ? "#fff" : N }}>
      <Ic n={n} s={Math.round(s * 0.46)} farbe={voll ? N : dunkel ? "#FFFFFF" : N} />
    </span>
  );
}

/* ---------------------------------------------------------------- Bausteine */
function Knopf({ children, onClick, rand, klein, dunkel, breit, style, typ = "button" }) {
  return (
    <button type={typ} onClick={onClick} className="ew-knopf"
      style={{ fontFamily: "inherit", cursor: "pointer", fontWeight: 700, borderRadius: 10, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
        padding: klein ? "10px 18px" : "14px 26px", fontSize: klein ? 14 : 15.5, width: breit ? "100%" : undefined, lineHeight: 1.2,
        ...(rand
          ? { background: dunkel ? "transparent" : "#FFFFFF", color: dunkel ? "#FFFFFF" : N, border: `2px solid ${GOLD}` }
          : { background: "linear-gradient(180deg,#FFD24D 0%,#F5B820 100%)", color: N, border: "none", boxShadow: "0 6px 18px rgba(245,184,32,0.28)" }),
        ...style }}>
      {children}
    </button>
  );
}
const MitPfeil = ({ t }) => <>{t}<Ic n="pfeil" s={18} w={2.3} /></>;

function Bereich({ children, dunkel, hell, id, style, innen }) {
  return (
    <section id={id} style={{ background: dunkel ? `linear-gradient(180deg,${N} 0%,${N2} 100%)` : hell ? HELL : "#FFFFFF", color: dunkel ? "#FFFFFF" : TXT, ...style }}>
      <div className="ew-innen" style={{ maxWidth: 1040, margin: "0 auto", padding: "48px 24px", ...innen }}>{children}</div>
    </section>
  );
}
const H2 = ({ children, style }) => <h2 className="ew-h2" style={{ fontSize: "clamp(25px,4.2vw,36px)", fontWeight: 800, letterSpacing: "-0.025em", lineHeight: 1.12, margin: 0, ...style }}>{children}</h2>;
const Unter = ({ children, dunkel, style }) => <p style={{ fontSize: 16.5, lineHeight: 1.55, margin: "10px 0 0", color: dunkel ? "#DCE5F5" : TXT, ...style }}>{children}</p>;
const Gold = ({ children }) => <span style={{ color: GOLD_TXT }}>{children}</span>;
const Hinweis = ({ children, dunkel, style }) => (
  <div style={{ marginTop: 26, padding: "9px 14px", borderRadius: 8, textAlign: "center", fontSize: 12.5,
    background: dunkel ? "rgba(255,255,255,0.08)" : KARTE, color: dunkel ? "#DCE5F5" : GRAU, ...style }}>{children}</div>
);
const Plakette = ({ children, style }) => (
  <span style={{ display: "inline-block", padding: "4px 10px", borderRadius: 6, background: KARTE, color: GRAU, fontSize: 11.5, fontWeight: 500, whiteSpace: "nowrap", ...style }}>{children}</span>
);

/* Held-Bereich mit Bild rechts, das nach links in Navy ausläuft */
function Held({ bild, bildBreite = "52%", children, hoch = 430 }) {
  return (
    <section className="ew-held" style={{ position: "relative", overflow: "hidden", background: `radial-gradient(120% 130% at 85% 20%, #17306B 0%, ${N} 45%, ${N2} 100%)`, color: "#FFFFFF" }}>
      <img src={bild} alt="" aria-hidden="true" className="ew-held-bild"
        style={{ position: "absolute", top: 0, right: 0, height: "100%", width: bildBreite, objectFit: "cover", objectPosition: "center",
          WebkitMaskImage: "linear-gradient(90deg,transparent 0%,#000 32%)", maskImage: "linear-gradient(90deg,transparent 0%,#000 32%)" }} />
      <div className="ew-innen" style={{ position: "relative", maxWidth: 1040, margin: "0 auto", padding: "56px 24px 52px", minHeight: hoch, display: "flex", alignItems: "center" }}>
        <div className="ew-held-text" style={{ maxWidth: 640 }}>{children}</div>
      </div>
    </section>
  );
}
const H1 = ({ children }) => <h1 style={{ fontSize: "clamp(32px,6vw,54px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.06, margin: 0 }}>{children}</h1>;

/* Wirrwarr → Weg → Fahne */
function Knaeuel({ breite = 270 }) {
  return (
    <svg viewBox="0 0 300 190" width="100%" style={{ maxWidth: breite, display: "block" }} aria-hidden="true">
      <circle cx="120" cy="105" r="70" fill="#EAF0FA" />
      <g fill="none" stroke={N} strokeWidth="2.2" strokeLinecap="round">
        <path d="M30 110c-8-30 30-52 52-34 20 16-6 52-28 40-24-13 4-58 34-50 34 9 20 60-8 62-30 2-32-40-6-52 30-14 58 14 46 38-12 22-48 18-50-6-2-22 30-36 50-20" />
        <path d="M40 92c10-22 48-24 58 0 10 26-24 46-44 30-18-14 0-44 24-40" />
        <path d="M58 132c20 18 52 8 56-14" />
      </g>
      <path d="M112 128c26 22 40 20 62 6s38-30 66-40" fill="none" stroke={N} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M150 140c22-4 36-20 56-34s30-14 44-18" fill="none" stroke={GOLD} strokeWidth="3" strokeLinecap="round" />
      <path d="M240 92V48" stroke={N} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M240 50h30l-8 9 8 9h-30z" fill={GOLD} stroke={N} strokeWidth="1.6" strokeLinejoin="round" />
      <g stroke={GOLD} strokeWidth="2.4" strokeLinecap="round">
        <path d="M222 36l-8-10M240 30V16M258 34l8-11M276 50l13-4M276 70l12 4M212 54l-12-3" />
      </g>
    </svg>
  );
}

/* Platzhalter-Portrait mit Play-Knopf */
function Portrait({ titel }) {
  return (
    <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.35)",
      background: "radial-gradient(90% 90% at 50% 25%, #2D63C8 0%, #123A86 45%, #0A1F52 100%)", aspectRatio: "16 / 10.5", width: "100%" }}>
      <svg viewBox="0 0 320 210" width="100%" height="100%" preserveAspectRatio="xMidYMax slice" style={{ position: "absolute", inset: 0 }} aria-hidden="true">
        <defs><linearGradient id="ew-silh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0B1430" /><stop offset="1" stopColor="#050A1C" /></linearGradient></defs>
        <path d="M160 34c-24 0-38 18-38 42 0 18 8 34 20 42v12c-34 6-64 22-74 48l-4 32h192l-4-32c-10-26-40-42-74-48v-12c12-8 20-24 20-42 0-24-14-42-38-42z" fill="url(#ew-silh)" />
      </svg>
      <span style={{ position: "absolute", left: "50%", top: "44%", transform: "translate(-50%,-50%)", width: 58, height: 58, borderRadius: 999, border: "2.5px solid #fff",
        background: "rgba(10,20,50,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg viewBox="0 0 24 24" width="24" height="24"><path d="M9 6.5v11l9-5.5z" fill="#fff" /></svg>
      </span>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 14, textAlign: "center" }}>
        <div style={{ fontWeight: 700, fontSize: 15 }}>{titel}</div>
        <div style={{ fontSize: 10, letterSpacing: "0.1em", marginTop: 5, opacity: 0.85 }}>PLATZHALTER – KEINE ECHTE PERSON</div>
      </div>
    </div>
  );
}

/* Gründer-Abschnitt (beide Entwürfe nutzen ihn, Texte leicht verschieden) */
function Gruender({ titel, text, zusatz, videoTitel }) {
  return (
    <Bereich dunkel>
      <div className="ew-zwei" style={{ alignItems: "center" }}>
        <Portrait titel={videoTitel} />
        <div>
          <div style={{ color: GOLD, fontSize: 12.5, fontWeight: 700, letterSpacing: "0.12em" }}>BASTIAN BLUMENRÖTHER</div>
          <h3 style={{ fontSize: "clamp(22px,3.4vw,28px)", fontWeight: 800, lineHeight: 1.15, margin: "10px 0 0", letterSpacing: "-0.02em" }}>{titel}</h3>
          <p style={{ fontSize: 16, lineHeight: 1.55, color: "#E3EAF7", margin: "14px 0 0" }}>{text}</p>
          <div style={{ width: 34, height: 3, background: GOLD, borderRadius: 2, margin: "18px 0 12px" }} />
          <p style={{ fontSize: 14.5, lineHeight: 1.55, color: "#DCE5F5", margin: 0 }}>{zusatz}</p>
        </div>
      </div>
    </Bereich>
  );
}

/* Nummerierte Schritte mit Verbindungslinie */
function Schritte({ liste, gross }) {
  const d = gross ? 46 : 36;
  return (
    <div style={{ marginTop: 26 }}>
      {liste.map(([t, b], i) => (
        <div key={t} style={{ display: "flex", gap: 18, position: "relative", paddingBottom: i < liste.length - 1 ? (gross ? 22 : 16) : 0 }}>
          {i < liste.length - 1 && <span aria-hidden="true" style={{ position: "absolute", left: d / 2 - 1.5, top: d, bottom: 0, width: 3, background: "#FBD678" }} />}
          <span style={{ width: d, height: d, borderRadius: 999, background: `linear-gradient(160deg,#FFD45A,${GOLD})`, color: "#FFFFFF", fontWeight: 800,
            fontSize: gross ? 15 : 13.5, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}>{String(i + 1).padStart(2, "0")}</span>
          <div style={{ paddingTop: gross ? 4 : 1 }}>
            <div style={{ fontWeight: 700, fontSize: gross ? 16.5 : 16 }}>{t}</div>
            <div style={{ fontSize: 14.5, lineHeight: 1.5, color: TXT, marginTop: 3 }}>{b}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* Aufklapp-Fragen */
function Fragen({ liste, offen0 = -1, zweispaltig, titel }) {
  const [offen, setOffen] = useState(offen0);
  return (
    <div>
      {titel}
      <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
        {liste.map(([f, a], i) => {
          const auf = offen === i;
          return (
            <div key={f} style={{ background: KARTE, borderRadius: 10 }}>
              <button type="button" onClick={() => setOffen(auf ? -1 : i)} aria-expanded={auf}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "13px 16px", background: "none", border: "none", cursor: "pointer",
                  fontFamily: "inherit", textAlign: "left", color: TXT }}>
                <span className={zweispaltig ? "ew-frage-zwei" : undefined} style={{ flex: 1, display: zweispaltig ? "grid" : "block", gap: 12 }}>
                  <span style={{ fontWeight: 700, fontSize: 14.5 }}>{f}</span>
                  {zweispaltig && !auf && <span className="ew-frage-vorschau" style={{ fontSize: 13.5, color: GRAU }}>{a}</span>}
                </span>
                <AufklappZeichen auf={auf} groesse={20} />
              </button>
              {auf && <div data-aufklapp-inhalt style={{ padding: "0 16px 14px", fontSize: 14, lineHeight: 1.55, color: GRAU }}>{a}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* Berg-Silhouette für Abschluss-Bänder */
function Berge() {
  return (
    <svg viewBox="0 0 1200 200" preserveAspectRatio="none" width="100%" height="100%" style={{ position: "absolute", inset: 0 }} aria-hidden="true">
      <path d="M0 200V120l90-50 70 40 110-80 90 70 80-40 120 90 100-110 90 60 120-70 110 80 110-50 110 60v100z" fill="#13295E" opacity="0.7" />
      <path d="M0 200v-40l120-40 100 30 140-60 120 50 110-30 140 60 120-50 130 40 100-30 120 40v30z" fill="#0A1A44" opacity="0.9" />
    </svg>
  );
}

function Fuss({ gehe }) {
  const l = (ansicht, t) => (
    <button type="button" onClick={() => gehe({ ansicht })} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit", fontSize: 13, color: TXT }}>{t}</button>
  );
  return (
    <footer style={{ background: "#FFFFFF", borderTop: "1px solid #E3E8F2" }}>
      <div className="ew-innen ew-fuss" style={{ maxWidth: 1040, margin: "0 auto", padding: "26px 24px" }}>
        <div data-kein-i18n>
          <div style={{ fontWeight: 800, fontSize: 19, letterSpacing: "-0.01em", color: N }}>MYTHOS<span style={{ color: GOLD }}>MATHE</span>.DE</div>
          <div style={{ fontSize: 12.5, color: N, marginTop: 2 }}>System <span style={{ color: GOLD }}>+</span> Freude <span style={{ color: GOLD }}>=</span> Erfolg.</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", alignItems: "center", color: GRAU }}>
            {l("impressum", "Kontakt")}<span>|</span>{l("impressum", "Impressum")}<span>|</span>{l("impressum", "Datenschutz")}
          </div>
          <div style={{ fontSize: 11.5, color: GRAU, marginTop: 6 }}>Designentwurf · Geplante Funktionen und Angebote.</div>
        </div>
      </div>
    </footer>
  );
}

const STIL = `
.ew-seite{font-family:Montserrat,system-ui,sans-serif;color:${TXT};background:#fff}
.ew-seite h1,.ew-seite h2,.ew-seite h3,.ew-seite p{font-family:inherit}
.ew-knopf{transition:transform .15s ease,filter .15s ease}
.ew-knopf:hover{filter:brightness(1.05);transform:translateY(-1px)}
.ew-knopf:active{transform:scale(.98)}
.ew-zwei{display:grid;grid-template-columns:1fr 1fr;gap:40px}
.ew-vier{display:grid;grid-template-columns:repeat(4,1fr);gap:22px}
.ew-drei{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.ew-fuss{display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap}
.ew-frage-zwei{grid-template-columns:minmax(150px,34%) 1fr}
.ew-band{display:flex;align-items:center;gap:24px}
.ew-tabzeile{display:grid;grid-template-columns:44px 1fr 1.2fr 2fr;align-items:center;gap:12px}
.ew-tarif{display:grid;grid-template-columns:1fr 210px;gap:20px;align-items:center}
@media (max-width:760px){
  .ew-zwei{grid-template-columns:1fr;gap:26px}
  .ew-vier{grid-template-columns:1fr 1fr;gap:26px 16px}
  .ew-drei{grid-template-columns:1fr}
  .ew-band{flex-direction:column;align-items:flex-start}
  .ew-tabzeile{grid-template-columns:40px 1fr 1fr}
  .ew-tabzeile .ew-tab-info{grid-column:2 / 4;margin-top:-6px}
  .ew-frage-zwei{grid-template-columns:1fr}
  .ew-frage-vorschau{display:none}
  .ew-tarif{grid-template-columns:1fr}
  .ew-tarif-preis{border-left:none !important;padding-left:0 !important;border-top:1px solid #E3E8F2;padding-top:14px}
  .ew-held-bild{width:78% !important;opacity:.55}
  .ew-held{min-height:0}
  .ew-innen{padding-left:18px !important;padding-right:18px !important}
}
@media (max-width:420px){.ew-vier{grid-template-columns:1fr 1fr}}
`;

/* ======================================================================
   ENTWURF 1 · NEUE STARTSEITE
   ====================================================================== */
export function EntwurfStart({ gehe }) {
  return (
    <div className="ew-seite">
      <style>{STIL}</style>
      <Held bild={bildBerg} bildBreite="56%">
        <H1>Weniger Mathe-Stress.<br /><Gold>Mehr</Gold> Vertrauen in dich.</H1>
        <p style={{ fontSize: 17.5, lineHeight: 1.5, margin: "18px 0 26px", color: "#EEF2FA" }}>
          Du willst bessere Noten — und endlich verstehen, was du da tust. Dein nächster Schritt beginnt hier.
        </p>
        <Knopf onClick={() => gehe({ ansicht: "start" })}><MitPfeil t="Jetzt kostenlos ausprobieren" /></Knopf>
      </Held>

      <Bereich>
        <div className="ew-zwei" style={{ alignItems: "center" }}>
          <div>
            <H2>Du gibst dir Mühe.<br />Aber dein Weg funktioniert nicht?</H2>
            <Unter>Du lernst und übst. Trotzdem fehlen der Durchblick und das Gefühl, selbst weiterzukommen. Das muss nicht deine Geschichte bleiben.</Unter>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}><Knaeuel /></div>
        </div>
      </Bereich>

      <Gruender videoTitel="Dein Portrait & Vorstellungsvideo" titel={<>Gründer. Mathe-Coach.<br />Kopf hinter Mythos Mathe.</>}
        text="Ich habe meinen eigenen Weg gefunden — vom Mathelernen zu wiederholten Wettbewerbserfolgen. Heute entschlüssele ich diesen Weg, damit Schüler ihr eigenes Potenzial entfalten können."
        zusatz="Aus persönlichem Coaching mit vielen Schülern entsteht ein System für selbstständigeres Lernen." />

      <Bereich>
        <H2>Dein Weg: verstehen, trainieren, weiterkommen.</H2>
        <Schritte liste={[
          ["Standort erkennen", "Wir finden gemeinsam heraus, wo du gerade stehst und was du wirklich brauchst."],
          ["Grundlagen & Mindset aufbauen", "Du schließt Lücken, verstehst Zusammenhänge und stärkst dein Vertrauen."],
          ["Techniken trainieren", "Du lernst effektive Methoden und übst mit passenden Aufgaben."],
          ["Selbstständig anwenden", "Du gehst sicherer an neue Aufgaben heran und entwickelst deinen eigenen Weg weiter."],
        ]} />
      </Bereich>

      <Bereich hell>
        <div className="ew-zwei" style={{ alignItems: "center" }}>
          <div>
            <H2>Probier aus, wie sich Klarheit anfühlt.</H2>
            <Unter>Unsere Tools unterstützen dich dabei, Mathe wirklich zu verstehen — Schritt für Schritt.</Unter>
            <div style={{ marginTop: 20, background: "#FFFFFF", borderRadius: 14, padding: "8px 18px", boxShadow: "0 4px 22px rgba(15,26,51,0.06)" }}>
              {[["hut", "Frag Mathilda AI", <>Erklärungen statt nur Lösungen.<br />Stelle deine Frage und erhalte einen hilfreichen Hinweis.</>, true],
                ["play", "Trainingsbereich", "Erklärvideos, Übungen und strukturierte Lernpfade."],
                ["dok", "Aufgabengenerator", "Individuelle Aufgaben zu deinem Thema."]].map(([ic, t, b, voll]) => (
                <div key={t} style={{ display: "flex", gap: 16, alignItems: "center", padding: "12px 0" }}>
                  <Medaille n={ic} voll={voll} s={50} />
                  <div><div style={{ fontWeight: 700, fontSize: 15.5 }}>{t}</div><div style={{ fontSize: 14, lineHeight: 1.45, marginTop: 2 }}>{b}</div></div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: "#FFFFFF", borderRadius: 14, overflow: "hidden", boxShadow: "0 10px 32px rgba(15,26,51,0.12)" }}>
            <div style={{ background: N, color: "#fff", padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <Ic n="sprech" s={20} farbe="#fff" /><span style={{ fontWeight: 700, flex: 1 }}>Frag Mathilda AI</span><span style={{ letterSpacing: 2, fontWeight: 800 }}>•••</span>
            </div>
            <div style={{ padding: 16, display: "grid", gap: 12 }}>
              <div style={{ marginLeft: "14%", background: "#E7EEF9", borderRadius: 10, padding: "12px 14px", fontSize: 13.5, lineHeight: 1.5 }}>
                Welche Zahl könntest du zuerst auf beiden Seiten abziehen?<div style={{ fontSize: 15, marginTop: 6 }}>2x + 5 = 17</div>
              </div>
              <div style={{ display: "flex", gap: 10, background: "#FFF6DD", borderRadius: 10, padding: "12px 14px" }}>
                <span style={{ width: 30, height: 30, borderRadius: 999, background: "#FDE7A8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Ic n="birne" s={17} farbe="#B88600" /></span>
                <div style={{ fontSize: 13.5, lineHeight: 1.5 }}><div style={{ fontWeight: 600 }}>Hinweis von Mathilda:</div>Du kannst auf beiden Seiten 5 abziehen, um den Term zu vereinfachen. Was ergibt das?</div>
              </div>
              <div style={{ textAlign: "center", fontWeight: 800, fontSize: 16.5, marginTop: 6 }}>Jedes Tool 3 × pro Tag kostenlos.</div>
              <Knopf breit klein onClick={() => gehe({ ansicht: "start" })}><MitPfeil t="Jetzt gratis testen" /></Knopf>
            </div>
          </div>
        </div>
      </Bereich>

      <section style={{ position: "relative", overflow: "hidden", background: "linear-gradient(90deg,#F4F6FA 0%,#E9EDF3 100%)" }}>
        <img src={bildStift} alt="" aria-hidden="true" className="ew-stift"
          style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", height: "100%", maxWidth: "62%", objectFit: "cover",
            WebkitMaskImage: "linear-gradient(90deg,transparent 0%,#000 18%)", maskImage: "linear-gradient(90deg,transparent 0%,#000 18%)" }} />
        <div className="ew-innen" style={{ position: "relative", maxWidth: 1040, margin: "0 auto", padding: "44px 24px", minHeight: 170 }}>
          <H2>Klar denken.<br />Klar aufs Papier.</H2>
          <Unter style={{ maxWidth: 330 }}>Pen & Paper verbindet digitale Hilfe mit deinem eigenen Denken.</Unter>
        </div>
      </section>

      <Bereich>
        <H2>Hier werden echte Erfahrungen sichtbar.</H2>
        <div className="ew-zwei" style={{ gap: 18, marginTop: 22 }}>
          {[["Schülerstimme:", "Ausgangssituation · Lernweg · persönliche Veränderung"], ["Elternstimme:", "Alltag · Unterstützung · Erfahrung"]].map(([t, b]) => (
            <div key={t} style={{ background: KARTE, borderRadius: 12, padding: 20, display: "flex", gap: 16, alignItems: "flex-start" }}>
              <span style={{ width: 46, height: 46, borderRadius: 999, background: "#A8B3C7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg viewBox="0 0 24 24" width="20" height="20"><path d="M9 6.5v11l9-5.5z" fill={N} /></svg></span>
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", color: GRAU }}>PLATZHALTER — KEINE ECHTE REFERENZ</div>
                <div style={{ fontWeight: 700, fontSize: 16, marginTop: 6 }}>{t}</div>
                <div style={{ fontSize: 14, lineHeight: 1.5, marginTop: 2 }}>{b}</div>
              </div>
            </div>
          ))}
        </div>
      </Bereich>

      <Bereich dunkel>
        <H2>Du musst deinen Weg nicht allein gehen.</H2>
        <div style={{ display: "grid", gap: 14, marginTop: 22 }}>
          {[["hut", "Mathe-Checken", "2 Monate", "Grundlagen, Rechentechniken und Mindset.", "Kurs entdecken", "entwurf-checken"],
            ["balken", "Abi-Mathe-Masterclass", "6 Monate", "Basiswissen festigen, Prüfungsaufgaben bearbeiten, Lernstrategie entwickeln.", "Masterclass entdecken", "masterclass"]].map(([ic, t, d, b, k, z]) => (
            <div key={t} className="ew-band" style={{ border: "1.5px solid rgba(245,184,32,0.55)", borderRadius: 14, padding: "18px 20px" }}>
              <span style={{ width: 70, height: 70, borderRadius: 999, border: `2px solid ${GOLD}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Ic n={ic} s={32} farbe="#fff" /></span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 20 }}>{t}</div>
                <div style={{ color: GOLD, fontWeight: 700, fontSize: 16, marginTop: 2 }}>{d}</div>
                <div style={{ fontSize: 14.5, color: "#DCE5F5", marginTop: 3, lineHeight: 1.45 }}>{b}</div>
              </div>
              <Knopf klein onClick={() => gehe({ ansicht: z })} style={{ minWidth: 200 }}><MitPfeil t={k} /></Knopf>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "right", fontSize: 11.5, color: "#C9D6EE", marginTop: 8 }}>Laufzeiten als Konzeptzuordnung.</div>
      </Bereich>

      <Bereich>
        <H2>Unsere Tools – flexibel für deinen Weg.</H2>
        <div style={{ display: "grid", gap: 8, marginTop: 20 }}>
          {[["geschenk", "Kostenlos", "0 €", "3 Nutzungen je Tool und Tag."], ["stern", "Plus", "10 € pro Monat", "Mehr Nutzungen, Kontingent folgt."],
            ["krone", "Maximum", "20 € pro Monat", "Größeres Kontingent, Details folgen."]].map(([ic, t, p, b]) => (
            <div key={t} className="ew-tabzeile" style={{ background: KARTE, borderRadius: 10, padding: "8px 16px" }}>
              <Medaille n={ic} s={38} />
              <span style={{ fontWeight: 700, fontSize: 15 }}>{t}</span>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{p}</span>
              <span className="ew-tab-info" style={{ fontSize: 14, color: TXT }}>{b}</span>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 18 }}>
          <Knopf onClick={() => gehe({ ansicht: "entwurf-pakete" })} style={{ minWidth: "min(100%,340px)" }}><MitPfeil t="Tool-Pakete vergleichen" /></Knopf>
        </div>
      </Bereich>

      <Bereich dunkel innen={{ paddingTop: 34, paddingBottom: 34 }}>
        <div className="ew-band">
          <Ic n="schild" s={56} farbe={GOLD} w={1.6} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: "clamp(19px,2.8vw,23px)", lineHeight: 1.2 }}>Für Eltern:<br />Orientierung statt zusätzlichem Druck.</div>
            <p style={{ fontSize: 14.5, lineHeight: 1.55, color: "#DCE5F5", margin: "8px 0 0" }}>Lernen Sie die Lernidee von Bastian kennen, erfahren Sie, wie die KI unterstützt, wo ihre Grenzen liegen und welche Angebote sinnvoll sein können.</p>
          </div>
          <div style={{ display: "grid", gap: 8, minWidth: 230 }}>
            <Knopf klein onClick={() => gehe({ ansicht: "elternabend" })}>Zum Elternabend</Knopf>
            <Knopf klein rand dunkel onClick={() => gehe({ ansicht: "elternabend" })}>Informationen für Eltern</Knopf>
            <div style={{ fontSize: 11.5, color: "#C9D6EE", textAlign: "center" }}>Termine folgen.</div>
          </div>
        </div>
      </Bereich>

      <Bereich>
        <div className="ew-band" style={{ justifyContent: "space-between" }}>
          <div>
            <H2 style={{ fontSize: "clamp(22px,3.4vw,30px)" }}>Dies ist erst der Anfang. Ihr gestaltet mit.</H2>
            <Unter style={{ fontSize: 15.5 }}>Eure Fragen, Ideen und Erfahrungen helfen uns, Inhalte und Werkzeuge weiterzuentwickeln – für noch mehr Klarheit, Motivation und selbstständiges Lernen.</Unter>
          </div>
          <svg viewBox="0 0 120 100" width="120" style={{ flexShrink: 0 }} aria-hidden="true">
            <g fill="none" stroke={N} strokeWidth="2.6" strokeLinecap="round">
              <circle cx="34" cy="56" r="11" /><path d="M14 96c0-14 9-22 20-22s20 8 20 22" />
              <circle cx="86" cy="56" r="11" /><path d="M66 96c0-14 9-22 20-22s20 8 20 22" />
              <path d="M44 12h34v20H62l-8 8v-8H44z" stroke={N} />
            </g>
            <text x="61" y="27" fontSize="12" fontWeight="700" fill={GOLD} textAnchor="middle" fontFamily="Montserrat">?!</text>
            <g stroke={GOLD} strokeWidth="2.6" strokeLinecap="round"><path d="M88 8l-4 9M98 16l-8 6M100 30h-9" /></g>
          </svg>
        </div>
      </Bereich>

      <section style={{ position: "relative", overflow: "hidden", background: `linear-gradient(180deg,#0E2560 0%,${N2} 100%)`, color: "#fff" }}>
        <Berge />
        <div style={{ position: "relative", maxWidth: 700, margin: "0 auto", padding: "48px 24px", textAlign: "center" }}>
          <H2>Aus „Ich kann kein Mathe“<br />kann <Gold>ein neuer Weg werden.</Gold></H2>
          <Unter dunkel style={{ marginBottom: 22 }}>Mach den ersten Schritt – ganz ohne Risiko.</Unter>
          <Knopf onClick={() => gehe({ ansicht: "start" })} style={{ minWidth: "min(100%,320px)" }}><MitPfeil t="Kostenlos ausprobieren" /></Knopf>
        </div>
      </section>

      <Bereich innen={{ paddingTop: 36, paddingBottom: 36 }}>
        <Fragen titel={<H2 style={{ fontSize: 22 }}>Häufige Fragen.</H2>} liste={[
          ["Was kostet Mythos Mathe?", "Jedes Tool kannst du dreimal täglich kostenlos nutzen. Für mehr Training gibt es Plus (10 € pro Monat) und Maximum (20 € pro Monat). Kurse werden separat angeboten."],
          ["Für welche Klassen ist das gedacht?", "Für Schülerinnen und Schüler am Gymnasium von Klasse 8 bis zum Abitur."],
          ["Wie funktioniert die KI?", "Mathilda gibt dir Hinweise und Erklärungen statt fertiger Lösungen. Gerechnet wird auf Papier – du denkst selbst, die KI begleitet dich."],
        ]} />
      </Bereich>
      <Fuss gehe={gehe} />
    </div>
  );
}

/* ======================================================================
   ENTWURF 2 · MATHE-CHECKEN
   ====================================================================== */
export function EntwurfChecken({ gehe }) {
  const zuReise = () => { const el = document.getElementById("ew-reise"); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 64, behavior: "smooth" }); };
  return (
    <div className="ew-seite">
      <style>{STIL}</style>
      <Held bild={bildHeft} bildBreite="50%" hoch={450}>
        <span style={{ display: "inline-block", border: `1.5px solid ${GOLD}`, color: GOLD, borderRadius: 8, padding: "4px 12px", fontSize: 13, fontWeight: 700, marginBottom: 16 }}>2 Monate - Konzept</span>
        <H1>Mathe-Checken.<br /><Gold>Finde deinen Einstieg.</Gold><br />Baue dein Fundament.</H1>
        <p style={{ fontSize: 17, lineHeight: 1.5, margin: "18px 0 26px", color: "#EEF2FA" }}>
          Wenn du nicht weißt, wie du das Ruder herumreißen sollst: Entwickle einen klaren Weg durch Grundlagen, Rechentechniken und dein Mathe-Mindset.
        </p>
        <Knopf onClick={zuReise} style={{ minWidth: "min(100%,300px)" }}><MitPfeil t="Kurs kennenlernen" /></Knopf>
      </Held>

      <Bereich>
        <div className="ew-zwei" style={{ alignItems: "center" }}>
          <div>
            <H2>Du brauchst mehr<br />als die nächste<br />Musterlösung.</H2>
            <Unter>Es geht nicht nur um das richtige Ergebnis, sondern um echtes Verstehen, einen klaren Lernweg und das Vertrauen, auch schwierige Aufgaben selbst anzugehen.</Unter>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}><Knaeuel breite={300} /></div>
        </div>
      </Bereich>

      <Gruender videoTitel="Hier dein echtes Portrait" titel="Gründer & Mathe-Coach."
        text="Mein eigener Lernweg führte mich zu wiederholten Wettbewerbserfolgen. In persönlichem Coaching habe ich diesen Weg für Schüler weiterentwickelt."
        zusatz="Ein System, das Grundlagen, Übung und Mindset verbindet – für mehr Klarheit und selbstständiges Lernen." />

      <Bereich id="ew-reise">
        <H2>Deine Reise über zwei Monate.</H2>
        <Unter>In vier Schritten legst du ein stabiles Fundament und entwickelst deinen eigenen Weg.</Unter>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <Schritte gross liste={[
            ["Standort & Lern-Mindset", "Wir finden gemeinsam heraus, wo du gerade stehst, klären deine Ziele und stärken dein Vertrauen in die eigenen Fähigkeiten."],
            ["Basiswissen & Verständnis", "Du wiederholst und vertiefst die wichtigsten Grundlagen und verstehst die Zusammenhänge wirklich."],
            ["Pen & Paper & Rechentechniken", "Du lernst effektive Methoden und übst mit passenden Aufgaben, klaren Strategien und strukturierten Lösungswegen."],
            ["Training & Transfer in den Schulalltag", "Du wendest das Gelernte an, trainierst mit zunehmender Sicherheit und entwickelst Routinen für deinen Alltag."],
          ]} />
        </div>
        <Hinweis>Vorgeschlagener Kursaufbau – Details und Inhalte werden noch finalisiert.</Hinweis>
      </Bereich>

      <Bereich dunkel>
        <H2>So könnte deine Lernwoche aussehen.</H2>
        <Unter dunkel>Ein möglicher Rhythmus, der Verstehen, Üben und Anwenden sinnvoll verbindet.</Unter>
        <div className="ew-vier" style={{ marginTop: 30, textAlign: "center" }}>
          {[["play", "Live gemeinsam verstehen", "Neue Themen werden erklärt und deine Fragen beantwortet."],
            ["dok", "Mit Tools gezielt üben", "Aufgaben, Erklärvideos und strukturierte Lernpfade unterstützen dich beim Üben."],
            ["stiftblatt", "Auf Papier selbst anwenden", "Du trainierst eigenständig mit passenden Aufgaben und entwickelst Sicherheit im Lösen."],
            ["sprech", "Fragen klären und weiterplanen", "Offene Fragen werden besprochen und der weitere Weg gemeinsam geplant."]].map(([ic, t, b]) => (
            <div key={t} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ width: 62, height: 62, borderRadius: 999, background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.75)",
                display: "flex", alignItems: "center", justifyContent: "center" }}><Ic n={ic} s={28} farbe="#fff" /></span>
              <div style={{ fontWeight: 700, fontSize: 15, marginTop: 14, lineHeight: 1.3 }}>{t}</div>
              <div style={{ fontSize: 13.5, lineHeight: 1.5, color: "#DCE5F5", marginTop: 8 }}>{b}</div>
            </div>
          ))}
        </div>
        <Hinweis dunkel>Betreuungsumfang, Formate und Frequenz werden noch festgelegt.</Hinweis>
      </Bereich>

      <Bereich>
        <H2>Was du mitnehmen sollst.</H2>
        <Unter>Kein schneller Trick, sondern ein solides Fundament für langfristigen Fortschritt.</Unter>
        <div className="ew-drei" style={{ marginTop: 22 }}>
          {[["hirn", "Klare Schritte erkennen", "Du kannst einschätzen, was du schon gut kannst und was als Nächstes dran ist."],
            ["ziel", "Fehler sinnvoll nutzen", "Du reflektierst deine Fehler, verstehst die Ursachen und lernst daraus."],
            ["balken", "Nachhaltige Lerngewohnheiten", "Du entwickelst Routinen, die dir auch über den Kurs hinaus weiterhelfen."]].map(([ic, t, b]) => (
            <div key={t} style={{ background: KARTE, borderRadius: 12, padding: 18, display: "flex", gap: 14 }}>
              <Ic n={ic} s={40} farbe={GOLD} w={1.7} />
              <div><div style={{ fontWeight: 700, fontSize: 15 }}>{t}</div><div style={{ fontSize: 13.5, lineHeight: 1.5, marginTop: 4 }}>{b}</div></div>
            </div>
          ))}
        </div>
        <div className="ew-zwei" style={{ marginTop: 16, background: KARTE, borderRadius: 14, padding: 24, gap: 20, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 18 }}>
            <span style={{ width: 48, height: 48, borderRadius: 999, background: "#CBD4E3", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: N }}>
              <Ic n="zitat" s={24} farbe={N} /></span>
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", color: GRAU }}>PLATZHALTER – KEINE ECHTE REFERENZ</div>
              <div style={{ fontWeight: 800, fontSize: 22, lineHeight: 1.2, marginTop: 6 }}>Hier erzählt ein Schüler seinen Lernweg.</div>
              <div style={{ fontSize: 14, lineHeight: 1.5, marginTop: 10 }}>Dieser Platz ist für eine echte Erfahrung reserviert. Hier wird später ein authentisches Zitat ergänzt.</div>
            </div>
          </div>
          <div aria-hidden="true" style={{ background: "#FFFFFF", borderRadius: 12, padding: "22px 24px", position: "relative", maxWidth: 300, justifySelf: "center", width: "100%" }}>
            {[100, 88, 62].map((w) => <div key={w} style={{ height: 7, borderRadius: 4, background: "#E3E8F2", width: `${w}%`, marginBottom: 12 }} />)}
            <span style={{ position: "absolute", left: 18, bottom: -10, width: 0, height: 0, borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderTop: "12px solid #fff" }} />
          </div>
        </div>
      </Bereich>

      <Bereich dunkel innen={{ paddingTop: 34, paddingBottom: 34 }}>
        <div className="ew-band">
          <span style={{ width: 84, height: 84, borderRadius: 999, border: `2px solid ${GOLD}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Ic n="gruppe" s={40} farbe={GOLD} w={2} /></span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: "clamp(20px,3vw,25px)", lineHeight: 1.2 }}>Ein klarer Rahmen.<br />Ein gemeinsames Ziel.</div>
            <p style={{ fontSize: 14.5, lineHeight: 1.55, color: "#DCE5F5", margin: "8px 0 0" }}>Beim Elternabend lernen Sie Bastian, die Lernidee und die geplante Begleitung kennen.</p>
          </div>
          <Knopf klein onClick={() => gehe({ ansicht: "elternabend" })} style={{ minWidth: 220 }}><MitPfeil t="Zum Elternabend" /></Knopf>
        </div>
      </Bereich>

      <Bereich>
        <div className="ew-zwei" style={{ gridTemplateColumns: undefined, alignItems: "center" }}>
          <div className="ew-band" style={{ alignItems: "flex-start" }}>
            <svg viewBox="0 0 150 140" width="130" style={{ flexShrink: 0 }} aria-hidden="true">
              <g fill="none" stroke={N} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round">
                <path d="M30 80l45 18 45-18v46l-45 12-45-12z" /><path d="M75 98v40M30 80l-12 16 45 16 12-14M120 80l12 16-45 16-12-14" />
                <path d="M34 40h22v18H34zM45 40v18" /><circle cx="75" cy="30" r="12" /><path d="M75 22v16M67 30h16" />
                <rect x="94" y="40" width="22" height="16" rx="3" /><path d="M102 44v8l7-4z" fill={N} />
                <circle cx="75" cy="68" r="9" />
              </g>
              <g stroke={GOLD} strokeWidth="2.4" strokeLinecap="round"><path d="M20 30l8 6M75 4v8M128 30l-8 6M14 60h9M136 60h-9" /></g>
            </svg>
            <div>
              <div style={{ fontWeight: 800, fontSize: 22 }}>Mathe-Checken · 2 Monate</div>
              <div style={{ fontSize: 15, marginTop: 4 }}>Grundlagen. Techniken. Mindset. Tools.</div>
              <div style={{ display: "grid", gap: 8, marginTop: 14 }}>
                {["Geführter Lernweg durch die wichtigsten Grundlagen", "Effektive Rechentechniken und Strategien", "Stärkung deines Mathe-Mindsets", "Unterstützung durch passende Tools"].map((t) => (
                  <div key={t} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 14 }}>
                    <span style={{ width: 20, height: 20, borderRadius: 999, background: GOLD, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Ic n="haken" s={14} w={3} farbe="#fff" /></span>{t}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ background: KARTE, borderRadius: 14, padding: 20, maxWidth: 360, justifySelf: "end", width: "100%" }}>
            <div style={{ display: "flex", gap: 12 }}>
              <Ic n="etikett" s={34} farbe={GOLD} />
              <div><div style={{ fontWeight: 800, fontSize: 18 }}>Kurspreis folgt</div>
                <div style={{ fontSize: 13, lineHeight: 1.5, marginTop: 4, color: GRAU }}>Inhalte, Termine, Preise und Betreuungsumfang werden noch finalisiert.</div></div>
            </div>
            <Knopf breit klein onClick={() => gehe({ ansicht: "konto" })} style={{ marginTop: 16 }}><MitPfeil t="Interesse anmelden" /></Knopf>
            <div style={{ fontSize: 12, textAlign: "center", marginTop: 8, color: GRAU }}>Live-Kurs separat vom Tool-Abo.</div>
          </div>
        </div>
      </Bereich>

      <Bereich innen={{ paddingTop: 10 }}>
        <Fragen zweispaltig titel={<H2 style={{ fontSize: 24 }}>Häufige Fragen.</H2>} liste={[
          ["Für wen ist der Kurs?", "Der Kurs ist für Schüler, die ihr Mathe-Verständnis stärken möchten."],
          ["Was kostet der Kurs?", "Preise und Zahlungsoptionen folgen."],
          ["Wie viel Begleitung ist enthalten?", "Betreuungsumfang, Formate und Termine werden noch festgelegt."],
        ]} />
      </Bereich>

      <section style={{ position: "relative", overflow: "hidden", background: `linear-gradient(90deg,${N2} 0%,#0F2763 100%)`, color: "#fff" }}>
        <img src={bildGipfel} alt="" aria-hidden="true" style={{ position: "absolute", right: 0, top: 0, height: "100%", width: "30%", objectFit: "cover",
          WebkitMaskImage: "linear-gradient(90deg,transparent 0%,#000 40%)", maskImage: "linear-gradient(90deg,transparent 0%,#000 40%)" }} />
        <div className="ew-innen ew-band" style={{ position: "relative", maxWidth: 1040, margin: "0 auto", padding: "34px 24px" }}>
          <div style={{ flex: 1, maxWidth: 440 }}>
            <div style={{ fontWeight: 800, fontSize: 24 }}>Mach den ersten Schritt.</div>
            <p style={{ fontSize: 14.5, lineHeight: 1.5, color: "#DCE5F5", margin: "6px 0 0" }}>Entdecke unsere kostenlosen Tools und verschaffe dir einen ersten Eindruck von MythosMathe.</p>
          </div>
          <Knopf klein onClick={() => gehe({ ansicht: "start" })} style={{ minWidth: 220, marginRight: "18%" }}><MitPfeil t="Kostenlos Tools testen" /></Knopf>
        </div>
      </section>
      <Fuss gehe={gehe} />
    </div>
  );
}

/* ======================================================================
   ENTWURF 3 · TOOL-PAKETE
   ====================================================================== */
const TARIFE = [
  { id: "kostenlos", ic: "hut", name: "Kostenlos", zeile: "Zum Kennenlernen.", preis: "0 €", per: "für dich", knopf: "Kostenlos bleiben",
    punkte: ["3 Nutzungen je Tool und Tag", "Zugang zu allen Tools", "Ideal zum Ausprobieren"] },
  { id: "plus", ic: "stern", name: "Plus", zeile: "Mehr Möglichkeiten.", preis: "10 €", per: "pro Monat", knopf: "Plus wählen",
    punkte: ["Mehr Nutzungen je Tool", "Zugang zu allen Tools", "Konkretes Kontingent folgt"] },
  { id: "maximum", ic: "krone", name: "Maximum", zeile: "Für alle, die mehr wollen.", preis: "20 €", per: "pro Monat", knopf: "Maximum wählen",
    punkte: ["Größeres Nutzungskontingent", "Zugang zu allen Tools", "Konkretes Kontingent folgt"] },
];

function Radio({ an, onClick, children, kasten }) {
  return (
    <button type="button" role="radio" aria-checked={an} onClick={onClick}
      style={{ display: "flex", alignItems: "center", gap: 10, background: kasten ? "#fff" : "none", fontFamily: "inherit", cursor: "pointer", color: TXT, textAlign: "left",
        border: kasten ? `1.5px solid ${an ? N : "#D5DCE8"}` : "none", borderRadius: 10, padding: kasten ? "12px 14px" : "4px 0", fontSize: 14, flex: kasten ? 1 : undefined }}>
      <span style={{ width: 18, height: 18, borderRadius: 999, border: `2px solid ${an ? "#1E5BD8" : "#9AA6BC"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {an && <span style={{ width: 9, height: 9, borderRadius: 999, background: "#1E5BD8" }} />}
      </span>
      {children}
    </button>
  );
}

export function EntwurfPakete({ gehe }) {
  const [wahl, setWahl] = useState("plus");
  const [konto, setKonto] = useState("eltern");
  const [zahlung, setZahlung] = useState("karte");
  const [bestellt, setBestellt] = useState(false);
  const tarif = TARIFE.find((t) => t.id === wahl);
  const waehle = (id) => {
    setWahl(id); setBestellt(false);
    if (id === "kostenlos") return;
    const el = document.getElementById("ew-auswahl");
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 64, behavior: "smooth" });
  };
  return (
    <div className="ew-seite">
      <style>{STIL}</style>
      <Held bild={bildMuenzen} bildBreite="44%" hoch={380}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.22em", marginBottom: 12 }}>DEIN TRAINING</div>
        <H1>Dein Training.<br /><Gold>Dein passendes Paket.</Gold></H1>
        <p style={{ fontSize: 17.5, lineHeight: 1.45, margin: "16px 0 24px", color: "#EEF2FA" }}>
          Jedes Tool kannst du dreimal täglich kostenlos nutzen. Für mehr Training wählst du Plus oder Maximum.
        </p>
        <Knopf onClick={() => gehe({ ansicht: "start" })} style={{ minWidth: "min(100%,310px)" }}><MitPfeil t="Jetzt kostenlos ausprobieren" /></Knopf>
      </Held>

      <Bereich innen={{ paddingTop: 34 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
          <div><H2 style={{ fontSize: "clamp(23px,3.6vw,30px)" }}>Deine <Gold>heutigen Nutzungen.</Gold></H2>
            <Unter style={{ fontSize: 15 }}>Hier siehst du, wie oft du jedes Tool heute schon genutzt hast.</Unter></div>
          <Plakette>Beispielansicht</Plakette>
        </div>
        <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
          {[["sprech", "Frag Mathilda AI", 1], ["play", "Trainingsbereich", 0], ["rechnung", "Aufgabengenerator", 2]].map(([ic, t, n]) => (
            <button key={t} type="button" onClick={() => gehe({ ansicht: "start" })}
              style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 16px", background: "#fff", border: "1px solid #E3E8F2", borderRadius: 12,
                fontFamily: "inherit", cursor: "pointer", textAlign: "left", color: TXT, flexWrap: "wrap" }}>
              <Medaille n={ic} s={48} />
              <div style={{ minWidth: 150 }}><div style={{ fontWeight: 700, fontSize: 16 }}>{t}</div><div style={{ fontSize: 14, marginTop: 2 }}>{n} von 3 genutzt</div></div>
              <div style={{ flex: "1 1 160px", display: "flex", gap: 8, maxWidth: 240 }}>
                {[0, 1, 2].map((k) => <span key={k} style={{ flex: 1, height: 9, borderRadius: 5, background: k < n ? GOLD : "#E3E8F2" }} />)}
              </div>
              <Ic n="rechts" s={18} w={2.2} style={{ marginLeft: "auto" }} />
            </button>
          ))}
        </div>
        <div style={{ textAlign: "center", fontSize: 12.5, color: GRAU, marginTop: 10 }}>Das Gratis-Kontingent gilt für jedes einzelne Tool.</div>
      </Bereich>

      <Bereich dunkel>
        <H2>Wähle deinen <Gold>Trainingsraum.</Gold></H2>
        <Unter dunkel>Mehr Training. Mehr Möglichkeiten. Das passende Paket für deinen Weg.</Unter>
        <div style={{ display: "grid", gap: 14, marginTop: 24 }}>
          {TARIFE.map((t) => {
            const an = t.id === wahl;
            return (
              <div key={t.id} className="ew-tarif" style={{ background: an ? "#FFF9E8" : "#fff", color: TXT, borderRadius: 12, padding: "18px 20px",
                border: an ? `2px solid ${GOLD}` : "2px solid transparent", boxShadow: an ? "0 8px 26px rgba(245,184,32,0.25)" : "none" }}>
                <div style={{ display: "flex", gap: 16 }}>
                  <Medaille n={t.ic} s={54} />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 22 }}>{t.name}</div>
                    <div style={{ fontSize: 15, marginTop: 1 }}>{t.zeile}</div>
                    <div style={{ display: "grid", gap: 4, marginTop: 10 }}>
                      {t.punkte.map((p) => (
                        <div key={p} style={{ display: "flex", gap: 9, alignItems: "center", fontSize: 14 }}>
                          <span style={{ width: 18, height: 18, borderRadius: 999, background: GOLD, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Ic n="haken" s={13} w={3} farbe="#fff" /></span>{p}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="ew-tarif-preis" style={{ textAlign: "center", borderLeft: "1px solid #E3E8F2", paddingLeft: 20 }}>
                  <div style={{ fontWeight: 800, fontSize: 30 }}>{t.preis}</div>
                  <div style={{ fontSize: 14, marginBottom: 12 }}>{t.per}</div>
                  <Knopf breit klein rand={!an} onClick={() => waehle(t.id)}>{t.knopf}</Knopf>
                </div>
              </div>
            );
          })}
        </div>
      </Bereich>

      <Bereich innen={{ paddingTop: 30, paddingBottom: 30 }}>
        <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
          <Medaille n="birne" s={54} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <H2 style={{ fontSize: "clamp(22px,3.4vw,28px)" }}>Was zählt <Gold>als Nutzung?</Gold></H2>
              <Plakette>Nutzungskonzept — noch festzulegen</Plakette>
            </div>
            <p style={{ fontSize: 14.5, lineHeight: 1.6, color: GRAU, margin: "8px 0 0" }}>Ein Aufruf eines Tools. Die genaue Zählweise und Kontingente werden vor dem Kauf erklärt.
              Hier planen wir Tageskontingente und monatliche Tarife — keine separat erfundenen Credit-Pakete.</p>
          </div>
        </div>
      </Bereich>

      <Bereich hell id="ew-auswahl">
        <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
          <Medaille n="wagen" s={54} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <H2 style={{ fontSize: "clamp(22px,3.4vw,28px)" }}>Deine Auswahl: <Gold>{tarif.name}</Gold></H2>
              <Plakette>Buchungsansicht — Konzept</Plakette>
            </div>
            <p style={{ fontSize: 15, margin: "6px 0 0" }}>Hier ist eine Beispielansicht des Bestellprozesses.</p>
          </div>
        </div>
        <div className="ew-zwei" style={{ background: "#fff", borderRadius: 14, padding: 24, marginTop: 20, gap: 28 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 22 }}>{tarif.name}</div>
            <div style={{ fontWeight: 700, fontSize: 18, marginTop: 2 }}>{tarif.preis} {tarif.per}</div>
            <div style={{ display: "grid", gap: 7, marginTop: 14 }}>
              {tarif.punkte.map((p) => (
                <div key={p} style={{ display: "flex", gap: 9, alignItems: "center", fontSize: 14, color: GRAU }}>
                  <span style={{ width: 18, height: 18, borderRadius: 999, background: GOLD, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Ic n="haken" s={13} w={3} farbe="#fff" /></span>{p}
                </div>
              ))}
            </div>
          </div>
          <div role="radiogroup">
            <div style={{ fontWeight: 700, fontSize: 14 }}>Konto für</div>
            <div style={{ display: "grid", gap: 2, marginTop: 6 }}>
              <Radio an={konto === "eltern"} onClick={() => setKonto("eltern")}>Eltern (für minderjährige Schüler)</Radio>
              <Radio an={konto === "selbst"} onClick={() => setKonto("selbst")}>Volljährige Lernende (ab 18 Jahren)</Radio>
            </div>
            <div style={{ fontWeight: 700, fontSize: 14, marginTop: 14 }}>Zahlungsart</div>
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <Radio kasten an={zahlung === "karte"} onClick={() => setZahlung("karte")}><Ic n="karte" s={20} />Karte</Radio>
              <Radio kasten an={zahlung === "paypal"} onClick={() => setZahlung("paypal")}><span style={{ fontWeight: 800, color: "#1E3A8A", fontStyle: "italic" }}>P</span>PayPal</Radio>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <Knopf breit onClick={() => setBestellt(true)}>{wahl === "kostenlos" ? "Kostenlos starten" : "Zahlungspflichtig bestellen"}</Knopf>
          <div style={{ textAlign: "center", fontSize: 12.5, color: GRAU, marginTop: 8 }}>
            {bestellt ? "Konzeptansicht – Buchungen sind noch nicht möglich." : "Vor Kauf: Gesamtpreis, Leistungsumfang, Laufzeit und Kündigung vollständig anzeigen."}
          </div>
        </div>
      </Bereich>

      <Bereich dunkel>
        <H2>Alles im <Gold>Blick.</Gold></H2>
        <Unter dunkel>Verwalte dein Abo und deine Daten jederzeit in deinem Konto.</Unter>
        <div style={{ background: "#fff", borderRadius: 12, marginTop: 20, overflow: "hidden" }}>
          {[["zahnrad", "Tarif verwalten", "Paket wechseln, nächste Abrechnung einsehen."], ["rechnung", "Rechnungen", "Alle Rechnungen als PDF herunterladen."],
            ["person", "Kündigung", "Abo zum Laufzeitende kündigen."]].map(([ic, t, b], i) => (
            <button key={t} type="button" onClick={() => gehe({ ansicht: "konto" })}
              style={{ width: "100%", display: "flex", gap: 16, alignItems: "center", padding: "14px 18px", background: "none", border: "none",
                borderTop: i ? "1px solid #E3E8F2" : "none", fontFamily: "inherit", cursor: "pointer", textAlign: "left", color: TXT }}>
              <Ic n={ic} s={26} farbe={N} />
              <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 15 }}>{t}</div><div style={{ fontSize: 13, color: GRAU, marginTop: 1 }}>{b}</div></div>
              <Ic n="rechts" s={18} w={2.2} />
            </button>
          ))}
        </div>
      </Bereich>

      <Bereich hell innen={{ paddingTop: 30, paddingBottom: 30 }}>
        <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
          <Medaille n="gruppe" s={54} />
          <div>
            <div style={{ fontWeight: 800, fontSize: "clamp(19px,2.8vw,23px)" }}>Für minderjährige Schüler: <Gold>Buchung durch die Eltern.</Gold></div>
            <p style={{ fontSize: 14.5, lineHeight: 1.55, color: GRAU, margin: "6px 0 0" }}>Die Buchung und Verwaltung des Abos erfolgt durch die Eltern oder Erziehungsberechtigten. So bleibt die Nutzung altersgerecht und sicher.</p>
          </div>
        </div>
      </Bereich>

      <Bereich>
        <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
          <Medaille n="frage" s={54} />
          <div style={{ flex: 1 }}>
            <Fragen offen0={1} titel={<H2 style={{ fontSize: "clamp(22px,3.4vw,28px)" }}>Häufige <Gold>Fragen.</Gold></H2>} liste={[
              ["Werden Gratis-Nutzungen je Tool gezählt?", "Ja. Jedes Tool hat sein eigenes Tageskontingent von drei kostenlosen Nutzungen."],
              ["Wie viele Nutzungen enthalten Plus und Maximum?", "Die Kontingente werden noch festgelegt und vor Buchung veröffentlicht."],
              ["Wie verwalte ich mein Abo?", "In deinem Konto unter „Tarif verwalten“: Paket wechseln, Rechnungen herunterladen oder zum Laufzeitende kündigen."],
            ]} />
          </div>
        </div>
      </Bereich>

      <section style={{ position: "relative", overflow: "hidden", background: `radial-gradient(90% 140% at 50% 0%, #17306B 0%, ${N} 55%, ${N2} 100%)`, color: "#fff" }}>
        <div style={{ position: "relative", maxWidth: 700, margin: "0 auto", padding: "44px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.22em", marginBottom: 8 }}>DEIN NÄCHSTER SCHRITT</div>
          <H2>Jetzt <Gold>kostenlos ausprobieren.</Gold></H2>
          <Unter dunkel style={{ marginBottom: 20 }}>Lerne die Tools kennen und finde heraus, welches Paket zu dir passt.</Unter>
          <Knopf onClick={() => gehe({ ansicht: "start" })} style={{ minWidth: "min(100%,320px)" }}><MitPfeil t="Jetzt kostenlos ausprobieren" /></Knopf>
        </div>
      </section>
      <Fuss gehe={gehe} />
    </div>
  );
}
