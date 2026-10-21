/* ======================================================================
   HAUPTMENÜ – gemeinsame Bausteine für das ☰-Fenster (Handy, funcHauptmenue.jsx)
   und das Desktop-Menü (funcHauptmenueDesktop.jsx): Ikonen, Bereichsbilder,
   Kurs-Farben, Klassenwahl, Abmelde-Frage, Darstellungs-Symbole.
   Reine Oberflächen-Bausteine; Daten und Logik stehen in hauptmenue.js.
   ====================================================================== */
import React, { useEffect, useState } from "react";
import { C } from "./base1.jsx";
import { SCHULARTEN, klassenBoxen } from "./schulbuch.js";

export const GOLD_VERLAUF = "linear-gradient(165deg,#FFE58A 0%,#F3C93A 50%,#E2B53C 100%)";
export const BLAU_VERLAUF = "linear-gradient(150deg,#1B62AE 0%,#0F4A8A 55%,#0A3A70 100%)";
export const NACHT_VERLAUF = `linear-gradient(155deg,#12306E 0%,${C.seeTief} 62%,#091433 100%)`;

/* ---------- Ikonen (Strich, 24er Raster) ---------- */
export const IKON = {
  suche: <><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></>,
  kamera: <><path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1.5-2h6L16.5 7h2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z" /><circle cx="12" cy="12.8" r="3.4" /></>,
  chat: <><path d="M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5h-7l-4.5 3.5v-3.5H5A1.5 1.5 0 0 1 3.5 15V7A1.5 1.5 0 0 1 5 5.5z" /><path d="M8 10h8M8 13h5" /></>,
  weg: <><path d="M5 19c3-1 3-5 7-6s4-5 7-6" /><circle cx="5" cy="19" r="1.6" /><circle cx="19" cy="7" r="1.6" /><path d="M14.5 15.5l3 3M17.5 15.5l-3 3" /></>,
  text: <><path d="M7 3.5h7l4 4v12A1.5 1.5 0 0 1 16.5 21h-9.5A1.5 1.5 0 0 1 5.5 19.5V5A1.5 1.5 0 0 1 7 3.5z" /><path d="M13.5 3.5V8h4.5M8.5 12h7M8.5 15.5h5" /></>,
  klausur: <><path d="M3.5 13.5l2.6-7A1.5 1.5 0 0 1 7.5 5.5h9a1.5 1.5 0 0 1 1.4 1l2.6 7v4.5A1.5 1.5 0 0 1 19 19.5H5A1.5 1.5 0 0 1 3.5 18z" /><path d="M3.5 13.5h4.5l1.5 2.5h5l1.5-2.5h4.5" /></>,
  play: <path d="M8 5.5v13l10-6.5z" fill="currentColor" stroke="none" />,
  ziel: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1.2" fill="currentColor" /></>,
  blitz: <path d="M13 3L5.5 13.5H11L10 21l8-11h-5.5z" />,
  fehler: <><circle cx="12" cy="12" r="8" /><path d="M12 7.5v5.5M12 16.2v.3" /></>,
  kalender: <><rect x="4" y="5.5" width="16" height="14.5" rx="2" /><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" /><path d="M9 14.5l2 2 4-4" /></>,
  pfad: <><circle cx="6" cy="18" r="2" /><circle cx="18" cy="6" r="2" /><path d="M8 18h5.5a3.5 3.5 0 0 0 0-7h-3a3.5 3.5 0 0 1 0-7H16" /></>,
  wiederholen: <><path d="M19.5 12A7.5 7.5 0 1 1 17 6.4" /><path d="M19.5 4v4.5H15" /></>,
  vorbereiten: <><path d="M5 20V5.5A1.5 1.5 0 0 1 6.5 4h11A1.5 1.5 0 0 1 19 5.5V20l-3-2-2 2-2-2-2 2-2-2z" /><path d="M9 9.5l2 2 4-4" /></>,
  nachbereiten: <><path d="M5 20V5.5A1.5 1.5 0 0 1 6.5 4h11A1.5 1.5 0 0 1 19 5.5V20l-3-2-2 2-2-2-2 2-2-2z" /><path d="M9 9h6M9 12.5h4" /></>,
  uhr: <><circle cx="12" cy="13" r="7.5" /><path d="M12 9v4l2.5 2M10 2.5h4" /></>,
  buch: <><path d="M4 5.5C6.5 4.3 9.5 4.3 12 6c2.5-1.7 5.5-1.7 8-.5v13c-2.5-1.2-5.5-1.2-8 .5-2.5-1.7-5.5-1.7-8-.5z" /><path d="M12 6v13" /></>,
  kompass: <><circle cx="12" cy="12" r="8.5" /><path d="M15.5 8.5l-2 5-5 2 2-5z" /></>,
  konto: <><circle cx="12" cy="8.5" r="3.8" /><path d="M4.5 20c1-3.6 4-5.5 7.5-5.5s6.5 1.9 7.5 5.5" /></>,
  fortschritt: <><path d="M4 20h16" /><path d="M6.5 16.5v-4M11 16.5V9M15.5 16.5v-6M20 16.5V5.5" /></>,
  bericht: <><path d="M7 3.5h7l4 4v12A1.5 1.5 0 0 1 16.5 21h-9.5A1.5 1.5 0 0 1 5.5 19.5V5A1.5 1.5 0 0 1 7 3.5z" /><path d="M9 17v-3M12 17v-5M15 17v-2" /></>,
  schild: <><path d="M12 3.5l7 2.8v5.2c0 4.3-3 7.6-7 9-4-1.4-7-4.7-7-9V6.3z" /><path d="M9 12l2 2 4-4" /></>,
  kinder: <><circle cx="9" cy="9" r="3.2" /><circle cx="16.5" cy="10" r="2.5" /><path d="M3.5 19.5c.8-3 3-4.5 5.5-4.5s4.7 1.5 5.5 4.5M14.5 15c2.4-.4 4.6.8 5.5 3.8" /></>,
  blatt: <><path d="M7 3.5h10A1.5 1.5 0 0 1 18.5 5v14.5A1.5 1.5 0 0 1 17 21H7a1.5 1.5 0 0 1-1.5-1.5V5A1.5 1.5 0 0 1 7 3.5z" /><path d="M9 8h6M9 11.5h6M9 15h3.5" /></>,
  herz: <path d="M12 19.5s-7.5-4.4-7.5-9.7A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6c0 5.3-7.5 9.7-7.5 9.7z" />,
  info: <><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5.5M12 7.8v.3" /></>,
  stern: <path d="M12 3.8l2.5 5.2 5.7.8-4.1 4 1 5.6L12 16.7l-5.1 2.7 1-5.6-4.1-4 5.7-.8z" />,
  raus: <><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" /><path d="M10 17l-5-5 5-5" /><path d="M5 12h11" /></>,
  rein: <><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" /><path d="M10 7l5 5-5 5" /><path d="M15 12H4" /></>,
  pfeil: <path d="M9.5 6l6 6-6 6" />,
};
export function Ikon({ n, g = 20, dicke = 1.9, style }) {
  return (
    <svg viewBox="0 0 24 24" width={g} height={g} fill="none" stroke="currentColor" strokeWidth={dicke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, display: "block", ...style }}>
      {IKON[n]}
    </svg>
  );
}
export const TRAINING_IKON = { heute: "play", themen: "pfad", pruefung: "uhr", standort: "ziel", meintraining: "play", warmup: "blitz", fehler: "fehler", plan: "kalender", lernpfad: "pfad", wiederholen: "wiederholen", vorbereiten: "vorbereiten", nachbereiten: "nachbereiten" };
export const KI_IKON = { blatt: "kamera", chat: "chat", weg: "weg", text: "text", briefkasten: "klausur" };
export const KONTO_IKON = { konto: "konto", fortschritt: "fortschritt", bericht: "bericht", datenschutz: "schild", kinder: "kinder", klassen: "kinder", schueler: "kinder",
  arbeitsblatt: "blatt", spenden: "herz", impressum: "info", pro: "stern", plan: "stern" };

export function Pfeil({ auf, farbe = "currentColor", g = 12 }) {
  return (
    <svg viewBox="0 0 12 12" width={g} height={g} aria-hidden="true" style={{ flexShrink: 0, transition: "transform .2s ease", transform: auf ? "rotate(180deg)" : "none" }}>
      <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke={farbe} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
/* Plus/Minus im goldenen Kreis – wie die Kacheln auf der Startseite */
export function GoldPlus({ auf }) {
  return (
    <span aria-hidden="true" style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 999, background: C.flaggold, display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 4px 10px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.5)" }}>
      <svg width="14" height="14" viewBox="0 0 14 14"><path d="M2.8 7h8.4" stroke={C.seeTief} strokeWidth="2.4" strokeLinecap="round" />
        <path d="M7 2.8v8.4" stroke={C.seeTief} strokeWidth="2.4" strokeLinecap="round" style={{ transformBox: "fill-box", transformOrigin: "center", transform: auf ? "scaleY(0)" : "none", transition: "transform .2s ease" }} /></svg>
    </span>
  );
}
/* Kurzsymbol eines Werkzeugs (f′, ×, P(A) …): Schrift wird mit der Länge kleiner */
export const zeichenGroesse = (t, gross = 15) => { const n = [...String(t || "")].length; return n <= 2 ? gross : n <= 4 ? gross - 3 : gross - 5; };
export function Bald() {
  return <span style={{ flexShrink: 0, fontSize: 9.5, fontWeight: 800, letterSpacing: "0.1em", padding: "3px 7px", borderRadius: 999, background: "rgba(255,255,255,0.85)", color: C.grau }}>BALD</span>;
}

export const istAktuell = (ziel, a) => !!(a && ziel && ziel.ansicht === a.ansicht && (!ziel.foto || ziel.foto === a.foto) && (!ziel.seite || ziel.seite === a.seite)
  && (!ziel.bereich || !a.bereich || ziel.bereich === a.bereich));

/* ---------- Bilder für die Bereiche des Mathe-Trainings (weiß/gold auf Dunkelblau) ---------- */
export function BereichBild({ id }) {
  const w = "rgba(255,255,255,0.92)", g = C.flaggold;
  const s = { fill: "none", strokeLinecap: "round", strokeLinejoin: "round" };
  const glyph = (t, gr = 14) => <span data-kein-i18n style={{ color: g, fontSize: gr, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}>{t}</span>;
  const svg = (inhalt) => <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">{inhalt}</svg>;
  const achsen = <path d="M7 31h27M10 34V7" stroke="rgba(255,255,255,0.32)" strokeWidth="1.2" {...s} />;
  const bilder = {
    fundament: glyph("a+0", 13),
    analysis: svg(<>{achsen}<path d="M8 30C13 4 19 30 24 18s6-9 9-11" stroke={w} strokeWidth="2.2" {...s} /><circle cx="14.2" cy="14.5" r="2.2" fill={g} /><circle cx="22.4" cy="22" r="2.2" fill={g} /></>),
    vektoren: svg(<><path d="M12 29V9M12 29l17 0M12 29l-5 5" stroke="rgba(255,255,255,0.35)" strokeWidth="1.3" {...s} /><path d="M12 29L27 13" stroke={g} strokeWidth="2.4" {...s} /><path d="M21.5 13H27v5.5" stroke={g} strokeWidth="2.4" {...s} /><path d="M12 29l9 3" stroke={w} strokeWidth="2" {...s} /></>),
    stochastik: svg(<>{achsen}<rect x="13" y="22" width="4" height="9" rx="1" fill={w} /><rect x="19" y="13" width="4" height="18" rx="1" fill={g} /><rect x="25" y="18" width="4" height="13" rx="1" fill={w} /></>),
    geometrie: svg(<><path d="M9 30L20 9l11 21z" stroke={w} strokeWidth="2" {...s} /><path d="M20 30V9" stroke={g} strokeWidth="1.6" strokeDasharray="2.5 2.5" {...s} /><path d="M20 26.5h3.5V30" stroke={g} strokeWidth="1.4" {...s} /></>),
    bruchrechnen: glyph("½", 20),
    zahlen: glyph("ℕ", 20),
    prozent: glyph("%", 19),
    daten: svg(<><path d="M8 30h25" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" {...s} /><path d="M10 26l7-7 5 4 9-11" stroke={g} strokeWidth="2.2" {...s} /><circle cx="17" cy="19" r="1.8" fill={w} /><circle cx="22" cy="23" r="1.8" fill={w} /></>),
    werkzeuge: svg(<><rect x="8" y="15" width="24" height="15" rx="2.5" stroke={w} strokeWidth="2" {...s} /><path d="M15 15v-3h10v3M8 21h24" stroke={w} strokeWidth="2" {...s} /><rect x="17.5" y="19" width="5" height="4" rx="1" fill={g} /></>),
    abitur: glyph("Abi", 13),
  };
  return bilder[id] || glyph("∑", 18);
}

/* ---------- Farben und Zeichen der Kurs-Karten ---------- */
export const KURS_STIL = {
  abizentrum: { hg: "linear-gradient(150deg,#FFE9A0 0%,#F4CE4A 26%,#EDBB00 55%,#C99A0C 84%,#9C7400 100%)", farbe: C.nachtschwarz, zeichen: "ABI", zFarbe: C.nachtschwarz },
  mckurs: { hg: GOLD_VERLAUF, farbe: C.seeTief, zeichen: "Abi", zFarbe: C.seeTief },
  unterstufe: { hg: `linear-gradient(155deg,#C4406A 0%,${C.gruen} 55%,#5A0024 100%)`, farbe: "#fff", zeichen: "5·6", zFarbe: "#FFE58A" },
  diffkurs: { hg: `linear-gradient(155deg,#11684F 0%,${C.smTief} 55%,${C.smNacht} 100%)`, farbe: "#fff", zeichen: "f′(x)", zFarbe: C.vkGold },
  vekkurs: { hg: `linear-gradient(155deg,${C.vkBlau} 0%,${C.vkTief} 60%,${C.vkNacht} 100%)`, farbe: "#fff", zeichen: "ℝ³", zFarbe: C.flaggold },
  geokurs: { hg: `linear-gradient(155deg,${C.amViolett} 0%,${C.amTief} 60%,${C.amNacht} 100%)`, farbe: "#fff", zeichen: "△", zFarbe: C.flaggold },
  gfs: { hg: `linear-gradient(155deg,#17A2B4 0%,${C.tuerkis} 50%,#08606C 100%)`, farbe: "#fff", zeichen: "GFS", zFarbe: "#FFE58A" },
  kiwahl: { hg: `radial-gradient(90% 80% at 100% 0%,rgba(237,187,0,0.35),transparent 60%),${NACHT_VERLAUF}`, farbe: "#fff", zeichen: "AI", zFarbe: C.flaggold },
  penpaper: { hg: `repeating-linear-gradient(180deg,#FFFFFF 0 17px,#DCE6F5 17px 18px)`, farbe: C.seeTief, zeichen: "✎", zFarbe: C.see, rand: true, gross: true },
  gleichkurs: { hg: `linear-gradient(155deg,#9A6CC2 0%,${C.lila} 55%,#5A3478 100%)`, farbe: "#fff", zeichen: "x = ?", zFarbe: "#FFE58A" },
  headnumbers: { hg: `linear-gradient(155deg,#D9783F 0%,${C.signal} 55%,#8A3F1A 100%)`, farbe: "#fff", zeichen: "7·8", zFarbe: "#FFE58A" },
  textaufgaben: { hg: `linear-gradient(155deg,#43AE74 0%,${C.smaragd} 55%,#1D6640 100%)`, farbe: "#fff", zeichen: "T→f", zFarbe: "#FFE58A" },
  efunktion: { hg: `linear-gradient(155deg,#2B2F3A 0%,#14161D 100%)`, farbe: "#fff", zeichen: "eˣ", zFarbe: C.flaggold },
  mindset: { hg: `linear-gradient(155deg,${C.silberHell} 0%,${C.silber} 60%,${C.silberDunkel} 100%)`, farbe: C.seeTief, zeichen: "∞", zFarbe: C.see },
};
/* Weiche Trennstellen für lange Wörter auf den schmalen Karten */
export const TRENNUNG = { "Differentialrechnung": "Differential\u00ADrechnung", "Dreiecksgeometrie": "Dreiecks\u00ADgeometrie", "Prüfungsmodus": "Prüfungs\u00ADmodus", "Trainingsplan": "Trainings\u00ADplan",
  "Wahrscheinlichkeitsrechnung": "Wahr\u00ADschein\u00ADlich\u00ADkeits\u00ADrechnung", "Trainingszentrum": "Trainings\u00ADzentrum" };

/* ---------- Klasse: Auswahl, falls noch keine gewählt ist ---------- */
export function KlasseWaehlen({ setze, schulartStart }) {
  const [sa, setSa] = useState(schulartStart || "g9");
  return (
    <div style={{ padding: "2px 0 4px" }}>
      <p style={{ margin: "4px 2px 10px", fontSize: 13.5, fontWeight: 600, color: C.tinte, lineHeight: 1.45 }}>In welche Klasse gehst du? Dann zeige ich dir hier dein Schulbuch.</p>
      <div role="group" aria-label="Schulart" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4, padding: 4, borderRadius: 12, background: C.see }}>
        {SCHULARTEN.map((s) => (
          <button key={s.id} type="button" aria-pressed={s.id === sa} onClick={() => setSa(s.id)} title={s.zeile} data-kein-i18n
            style={{ height: 32, borderRadius: 8, fontSize: 14, fontWeight: 800, cursor: "pointer", color: C.weiss,
              border: `2px solid ${s.id === sa ? C.weiss : "transparent"}`, background: s.id === sa ? "rgba(255,255,255,0.14)" : "transparent" }}>{s.name}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginTop: 8 }}>
        {klassenBoxen(sa).map((b) => (
          <button key={b.id} type="button" onClick={() => setze(sa, b.id)} data-kein-i18n
            style={{ height: 40, borderRadius: 10, fontSize: 15, fontWeight: 800, cursor: "pointer",
              border: `1.5px solid ${b.gold ? C.flaggold : C.linie}`, background: b.gold ? "rgba(237,187,0,0.12)" : C.weiss, color: C.seeTief }}>{b.label}</button>
        ))}
      </div>
    </div>
  );
}

export const ETIKETT_FARBE = { entdecken: "#FFE58A", rechnen: "#BFD6F5", trainieren: "#FF9EC2" };
export const ETIKETT_FARBE_HELL = { entdecken: C.flaggold, rechnen: C.seeHell, trainieren: "#D14D85" };

export const MODUS_NAME = { dunkel: "Dunkel", hell: "Hell", mix: "Mix", stadion: "FCB", ger: "GER" };
export const MODUS_NAME_EN = { dunkel: "Dark", hell: "Light", mix: "Mix", stadion: "FCB", ger: "GER" };
export function ModusSymbol({ m }) {
  /* GER: Kreis in drei Streifen Schwarz, Rot, Gold */
  if (m === "ger") return (
    <svg viewBox="0 0 24 24" aria-hidden="true"><clipPath id="msGer"><circle cx="12" cy="12" r="8.5" /></clipPath>
      <g clipPath="url(#msGer)"><rect x="0" y="3.5" width="24" height="5.7" fill="#000000" /><rect x="0" y="9.2" width="24" height="5.7" fill="#DD0000" /><rect x="0" y="14.9" width="24" height="5.7" fill="#FFCE00" /></g>
      <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeOpacity=".25" strokeWidth="1" /></svg>
  );
  /* Stadion (FCB): Kreis oben Rot, unten Blau, weißer Streifen dazwischen (eigenes Motiv, kein Wappen) */
  if (m === "stadion") return (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 12a8.5 8.5 0 0 1 17 0z" fill="#DC052D" /><path d="M3.5 12a8.5 8.5 0 0 0 17 0z" fill="#0066B2" /><path d="M3 12h18" stroke="#FFFFFF" strokeWidth="2.6" /></svg>
  );
  if (m === "hell") return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" /><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" />
    </svg>
  );
  if (m === "mix") return (
    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="2.4" /><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor" /></svg>
  );
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" fill="currentColor" /></svg>;
}

/* ---------- Abmelden mit Bestätigung ---------- */
export function AbmeldenFrage({ ja, nein, laeuft }) {
  useEffect(() => {
    const t = (e) => { if (e.key === "Escape") nein(); };
    window.addEventListener("keydown", t);
    return () => window.removeEventListener("keydown", t);
  }, []);
  return (
    <div role="alertdialog" aria-modal="true" aria-labelledby="hm-ab-titel" onClick={nein}
      style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(8,23,59,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "min(380px, 100%)", background: C.weiss, borderRadius: 18, padding: "22px 20px 18px", boxShadow: "0 24px 60px rgba(8,23,59,0.4)", color: C.tinte, fontFamily: "Montserrat, system-ui, sans-serif" }}>
        <p id="hm-ab-titel" style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Wirklich abmelden?</p>
        <p style={{ margin: "8px 0 18px", fontSize: 14, lineHeight: 1.5, color: C.grau }}>Dein Lernstand bleibt im Konto gespeichert. Zum Weitermachen meldest du dich einfach wieder an.</p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button type="button" onClick={nein} autoFocus style={{ height: 42, padding: "0 16px", borderRadius: 12, border: `1.5px solid ${C.linie}`, background: C.weiss, fontFamily: "inherit", fontSize: 14, fontWeight: 700, color: C.tinte, cursor: "pointer" }}>Abbrechen</button>
          <button type="button" onClick={ja} disabled={laeuft} data-hm-abmelden-ja style={{ height: 42, padding: "0 16px", borderRadius: 12, border: "none", background: C.seeTief, fontFamily: "inherit", fontSize: 14, fontWeight: 700, color: C.weiss, cursor: "pointer", opacity: laeuft ? 0.6 : 1 }}>
            {laeuft ? "Einen Moment …" : "Abmelden"}
          </button>
        </div>
      </div>
    </div>
  );
}

export const anfangVon = (konto) => {
  const quelle = (konto.profil && konto.profil.name) || (konto.nutzer && konto.nutzer.email) || "";
  return (String(quelle).trim().charAt(0) || "·").toLocaleUpperCase("de-DE");
};
