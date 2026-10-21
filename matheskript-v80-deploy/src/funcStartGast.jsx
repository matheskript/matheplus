/* ======================================================================
   STORY-STARTSEITE für Besucher ohne Konto (22.10.2026)

   Wer mythosmathe.de aufruft, ohne angemeldet zu sein, sieht nicht das
   Dashboard (Heute-Karte, Band, Klasse 12 mit „Noch 6 Runden“), sondern eine
   Seite, die erst das Problem fühlbar macht und dann die Lösung zeigt –
   nach dem Blockbuster-StorySkript (Alexander Christiani): der Schüler ist
   der Held, Basti der Mentor.

     1 HELD      Bühne: Headline, für wen, ein Goldknopf („Kostenlos starten“ → Start-Karte),
                 Vertrauensleiste mit vier Fakten
     2 PROBLEM   „Kennst du das?“ – auf dem Blatt · im Kopf · der Gegner (durchgestrichen: „Mathe ist Talent“)
     3 MENTOR    „Ich war die 2.“ – Empathie (2 → 1,0), Autorität (Studium, Wettbewerbe, Jahre mit Schülern), Haltung
     4 LÖSUNG    Drei Schritte (Verstehen · Aufschreiben · Trainieren), drei Zusagen,
                 dann ZEIGEN statt behaupten: die Start-Karte als Demo (id heute), Mathilda (id mathilda),
                 alle Werkzeuge mit Suche und Navigator (id lernen), Kurse (id kurse)
     5 REISE     Zwei Wege (nichts ändern / heute anfangen), Abschluss-Knopf, Blog-Anriss, Spenden

   Mit Konto zeigt StartseiteWahl das Dashboard aus funcStartseite.jsx. Der Testzugang
   („Testen“ in der Start-Karte, ☰) ist ein Konto – damit sieht man das Dashboard ohne Anmeldung.
   Browser-Tests, die das Dashboard als Besucher brauchen, setzen localStorage „mm-start-app“ = „1“
   (STARTAPP_SCHLUESSEL), ebenso das Arbeitsmenü. Browser: tests/ui/startgast.ui.py
   ====================================================================== */
import React, { useEffect, useRef, useState } from "react";
import "@fontsource/caveat/700.css";   // Notiz „Mythos!“ am durchgestrichenen Talent
import { C } from "./base1.jsx";
import { useKonto } from "./konto.js";
import { useStartStufe } from "./func2.jsx";
import { Startseite, START_CSS, useStartModus, ModusKontext, HeldKurve, Kopf, LernNavigator, MathildaBlock, KursRaster, BlogAnriss } from "./funcStartseite.jsx";
import { StartKarte } from "./funcStartKarte.jsx";
import { SuchBox } from "./funcSuche.jsx";
import { MathildaName } from "./mathildaName.jsx";
import { KURSE } from "./hauptmenue.js";
import { MYTHEN_SLUG } from "./blogDaten.js";
import { AUTOR } from "./seo/autor.js";
import { ANGEBOT } from "./angebot.js";
import { LANDING } from "./seitenKonstanten.js";
import { basisModus, editionVon, STARTAPP_SCHLUESSEL } from "./startModus.js";
import { springe } from "./sprung.js";

export { STARTAPP_SCHLUESSEL } from "./startModus.js";
export const appErzwungen = () => { try { return localStorage.getItem(STARTAPP_SCHLUESSEL) === "1"; } catch { return false; } };

/* Ohne Konto die Geschichte, mit Konto das Dashboard. Vor dem Laden des Kontos nichts (kein Flackern von Story → Dashboard). */
export function StartseiteWahl({ gehe }) {
  const konto = useKonto();
  if (!konto.geladen) return <div style={{ minHeight: "60vh" }} aria-busy="true" />;
  if (konto.nutzer || appErzwungen()) return <Startseite gehe={gehe} />;
  return <StartseiteGast gehe={gehe} />;
}

const NACHT = "#050B1F";
const GOLD = C.flaggold;
const GOLD_HELL = "#FFE58A";
const DESKTOP = "(min-width: 840px)";

const CSS = `
.sg-held .sbb-held-text { padding-bottom: 54px; }
.sg-fuer { margin: 18px 0 0; max-width: 520px; font-size: 16px; line-height: 1.55; font-weight: 400; color: var(--text); opacity: .92; }
.sg-knoepfe { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 14px; margin-top: 26px; }
.sg-knoepfe .sbb-los.held { margin-top: 0; }
.sg-knoepfe .sbb-los.leise { border-color: rgba(255,255,255,0.35); color: #FFFFFF; }
.sbb[data-modus="hell"] .sg-knoepfe .sbb-los.leise { border-color: ${C.see}; color: ${C.seeTief}; }
@media ${DESKTOP} { .sg-held h1 { font-size: clamp(58px, 6.2vw, 76px); } .sg-fuer { font-size: 17.5px; max-width: 560px; } }

/* Vertrauensleiste: vier Fakten, am Handy zweispaltig */
.sg-fakten { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin: -22px auto 0; width: 100%; max-width: 783px; padding: 0 20px; position: relative; z-index: 2; }
@media ${DESKTOP} { .sg-fakten { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; } }
@media (min-width: 1100px) { .sg-fakten { max-width: calc(var(--seite, 940px) + 40px); } }
.sg-fakt { padding: 14px 14px 13px; border-radius: 16px; background: #FFFFFF; border: 1.5px solid ${C.see}; box-shadow: 0 10px 28px -16px rgba(0,47,110,0.45); }
.sbb[data-modus="dunkel"] .sg-fakt { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.16); }
.sg-fakt b { display: block; font-size: 15px; font-weight: 800; letter-spacing: -0.02em; color: var(--titel); line-height: 1.15; }
.sg-fakt span { display: block; margin-top: 3px; font-size: 12px; line-height: 1.35; color: var(--nebel); }

/* Abschnitte */
.sg-teil { padding-top: 8px; }
.sg-kicker { margin: 0 0 8px; font-size: 12px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: ${GOLD}; }
.sbb[data-modus="hell"] .sg-kicker, .sbb[data-modus="mix"] .sbb-teil:not(.sbb-streifen) .sg-kicker { color: ${C.gruenDunkel}; }
.sg-teil .sbb-kopf { margin-top: 36px; }
@media ${DESKTOP} { .sg-teil .sbb-kopf { margin-top: 48px; } }
.sg-teil .sbb-kopf + .sbb-text, .sg-lead { max-width: 640px; }

/* Karten (weiß mit blauem Rand auf dem Blatt, Glas in den dunklen Streifen) */
.sg-raster { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; margin-top: 18px; }
@media ${DESKTOP} { .sg-raster { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; } .sg-raster.zwei { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.sg-karte { position: relative; padding: 16px 16px 15px; border-radius: 20px; border: 1px solid var(--linie); background: var(--karte); box-shadow: var(--karte-schatten); color: var(--text); }
.sbb[data-modus="mix"] .sbb-teil:not(.sbb-streifen) .sg-karte, .sbb[data-modus="hell"] .sg-karte { border: 1.5px solid ${C.see}; box-shadow: 0 6px 22px rgba(0,47,110,0.10); }
.sg-karte .wo { display: block; font-size: 11.5px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: var(--nebel); }
.sg-karte .zitat { display: block; margin-top: 8px; font-size: clamp(20px, 5.4vw, 24px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.12; color: var(--titel); }
.sg-karte p { margin: 10px 0 0; font-size: 14px; line-height: 1.55; color: var(--nebel); }
.sg-karte.gegner { border-color: ${GOLD}; box-shadow: 0 0 0 1px rgba(237,187,0,0.45), 0 14px 34px -18px rgba(237,187,0,0.5); }
.sg-karte.gegner .wo { color: ${GOLD}; }
.sbb[data-modus="hell"] .sg-karte.gegner .wo, .sbb[data-modus="mix"] .sbb-teil:not(.sbb-streifen) .sg-karte.gegner .wo { color: #8A6500; }
/* Durchgestrichener Mythos: der Strich zeichnet sich, sobald die Karte im Bild ist (clip-path, nicht Strichlänge) */
.sg-weg { position: relative; display: inline-block; }
.sg-weg svg { position: absolute; left: -3%; width: 106%; height: .5em; top: 50%; transform: translateY(-50%); overflow: visible; clip-path: inset(-50% 100% -50% 0); transition: clip-path .9s cubic-bezier(.6,0,.2,1) .3s; pointer-events: none; }
.sg-weg svg path { fill: none; stroke: ${GOLD}; stroke-width: 3.2; stroke-linecap: round; }
.sg-weg.da svg { clip-path: inset(-50% 0 -50% 0); }
.sg-weg .notiz { position: absolute; left: 100%; top: -0.55em; margin-left: 8px; font-family: Caveat, cursive; font-size: .72em; font-weight: 700; color: ${GOLD}; white-space: nowrap; transform: rotate(-8deg); opacity: 0; transition: opacity .5s ease 1.1s; }
.sg-weg.da .notiz { opacity: 1; }
.sg-link { margin-top: 14px; background: none; border: none; padding: 0; cursor: pointer; font-family: inherit; font-size: 13.5px; font-weight: 800; color: ${GOLD}; display: inline-flex; gap: 8px; align-items: center; }
.sg-link i { font-style: normal; }
.sbb[data-modus="hell"] .sg-link, .sbb[data-modus="mix"] .sbb-teil:not(.sbb-streifen) .sg-link { color: ${C.gruenDunkel}; }

/* Mentor: Text links, Notenkurve rechts (ab 840 px) */
.sg-mentor { display: grid; grid-template-columns: minmax(0, 1fr); gap: 22px; margin-top: 18px; }
@media ${DESKTOP} { .sg-mentor { grid-template-columns: minmax(0, 1.15fr) minmax(0, .85fr); gap: 36px; align-items: start; } }
.sg-noten { width: 100%; max-width: 360px; height: auto; display: block; margin: 0 auto; }
.sg-belege { list-style: none; margin: 18px 0 0; padding: 0; display: grid; gap: 10px; }
.sg-belege li { display: flex; gap: 12px; align-items: flex-start; font-size: 14px; line-height: 1.5; color: var(--nebel); }
.sg-belege li b { color: var(--titel); font-weight: 800; }
.sg-belege .haken { flex: none; width: 22px; height: 22px; margin-top: 1px; border-radius: 999px; background: ${GOLD}; display: grid; place-items: center; }
.sg-haltung { margin: 22px 0 0; padding: 16px 18px; border-left: 3px solid ${GOLD}; font-size: 16px; line-height: 1.55; font-weight: 600; color: var(--titel); background: rgba(237,187,0,0.06); border-radius: 0 14px 14px 0; }
.sg-unterschrift { margin: 16px 0 0; display: flex; align-items: center; gap: 12px; font-size: 13px; color: var(--nebel); }
.sg-unterschrift .mono { flex: none; width: 40px; height: 40px; border-radius: 999px; display: grid; place-items: center; font-weight: 900; font-size: 17px; color: ${NACHT}; background: linear-gradient(180deg, ${GOLD_HELL}, ${GOLD}); }
.sg-unterschrift b { display: block; font-size: 14px; color: var(--titel); font-weight: 800; }

/* Plan: drei Schritte mit Ziffer – am Handy Ziffer links, Text rechts (kurz); ab 840 px drei Karten nebeneinander */
.sg-schritt { display: grid; grid-template-columns: 34px minmax(0, 1fr); column-gap: 14px; align-items: start; padding: 14px 16px; }
.sg-schritt .nr { display: inline-grid; place-items: center; width: 34px; height: 34px; border-radius: 999px; background: ${GOLD}; color: ${NACHT}; font-weight: 900; font-size: 16px; grid-row: 1 / span 2; }
.sg-schritt b { display: block; margin-top: 5px; font-size: 19px; font-weight: 800; letter-spacing: -0.025em; line-height: 1.1; color: var(--titel); }
.sg-schritt p { margin-top: 6px; }
@media ${DESKTOP} { .sg-schritt { display: block; padding: 18px 18px 17px; } .sg-schritt b { margin-top: 12px; font-size: 20px; } .sg-schritt p { margin-top: 10px; } }
.sg-zusagen { display: flex; flex-wrap: wrap; gap: 8px 18px; margin: 18px 0 0; padding: 0; list-style: none; }
.sg-zusagen li { display: inline-flex; align-items: center; gap: 8px; font-size: 13.5px; font-weight: 600; color: var(--text); }
.sg-zusagen .punkt { width: 8px; height: 8px; border-radius: 999px; background: ${GOLD}; flex: none; }

/* Demo: die Start-Karte; ab 1100 px Text links, Karte rechts (wie in der breiten Bühne des Dashboards) */
.sg-demo { margin-top: 10px; }
.sg-demo .sk { margin-top: 0; }
@media (min-width: 1100px) { .sg-heute { display: grid; grid-template-columns: minmax(0, 1fr) clamp(420px, calc(var(--seite, 940px) * .46), 560px); column-gap: 48px; align-items: center; }
  .sg-heute .sg-demo { margin-top: 0; } .sg-heute .sbb-kopf { margin-top: 0; } .sg-heute { margin-top: 56px; } }
.sg-suche { margin: 16px 0 14px; max-width: 560px; }

/* Zwei Wege */
.sg-weg-karte .titel { display: block; font-size: 19px; font-weight: 800; letter-spacing: -0.025em; color: var(--titel); }
.sg-weg-karte ul { margin: 10px 0 0; padding: 0; list-style: none; display: grid; gap: 8px; }
.sg-weg-karte li { display: flex; gap: 10px; font-size: 14px; line-height: 1.5; color: var(--nebel); }
.sg-weg-karte li::before { content: "–"; flex: none; color: var(--nebel); }
.sg-weg-karte.gut { border-color: ${GOLD}; box-shadow: 0 0 0 1px rgba(237,187,0,0.45); }
.sg-weg-karte.gut li::before { content: "✓"; color: ${GOLD}; font-weight: 900; }
.sg-schluss { margin-top: 26px; display: flex; flex-wrap: wrap; align-items: center; gap: 10px 14px; }
.sg-schluss .sbb-los.leise { border-color: rgba(255,255,255,0.35); color: #FFFFFF; }
.sbb[data-modus="hell"] .sg-schluss .sbb-los.leise { border-color: ${C.see}; color: ${C.seeTief}; }

/* Feste Handy-Leiste: ein Knopf, solange die Start-Karte noch nicht erreicht ist */
.sg-leiste { position: fixed; left: 0; right: 0; bottom: 0; z-index: 40; padding: 10px 16px calc(10px + env(safe-area-inset-bottom)); display: flex; justify-content: center;
  background: rgba(255,255,255,0.92); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border-top: 1px solid ${C.linie}; box-shadow: 0 -10px 30px -22px rgba(0,0,0,.5);
  transform: translateY(110%); transition: transform .25s ease; }
.sbb[data-modus="dunkel"] .sg-leiste { background: rgba(5,11,31,0.9); border-top-color: rgba(255,255,255,0.12); }
.sg-leiste.da { transform: translateY(0); }
.sg-leiste .sbb-los { width: 100%; max-width: 420px; justify-content: center; min-height: 48px; }
@media ${DESKTOP} { .sg-leiste { display: none; } }
@media (prefers-reduced-motion: reduce) { .sg-weg svg, .sg-weg .notiz, .sg-leiste { transition: none !important; } }
`;

/* ---------------------------------------------------------------- Inhalte (nur belegte Fakten) */
const FAKTEN = [
  ["Gymnasium", "Klasse 5 bis Abitur"],
  ["Uni Konstanz", "Mathestudium, langjährige Arbeit mit Schülern"],
  ["Preisträger", "Bundes- und Landeswettbewerb Mathematik"],
  ["Kostenlos", "Alle Werkzeuge ohne Anmeldung"],
];

const EBENEN = [
  { wo: "Auf dem Blatt", zitat: "„Ich check’s einfach nicht.“",
    text: "Lücken aus dem letzten Jahr, eine Klausur ohne Plan, Stoff, der nach den Ferien wieder weg ist. Mehr Aufgaben bringen nicht mehr Note." },
  { wo: "Im Kopf", zitat: "„Ich bin halt kein Mathe-Typ.“",
    text: "Der Satz kommt vor jeder Aufgabe. Dazu die Angst vor der nächsten Arbeit – und zu Hause immer wieder dasselbe Thema." },
  { wo: "Der eigentliche Gegner", gegner: true,
    text: "Dieser Satz sagt dir, dass es an dir liegt. Dabei hat dir nur nie jemand gezeigt, wie man Mathe lernt. Und genau das ist lernbar." },
];

const BELEGE = [
  ["Mathematik an der Universität Konstanz", " – ich studiere das Fach selbst."],
  ["Preisträger im Bundes- und Landeswettbewerb Mathematik", " und Sieger des Einzelwettbewerbs am Tag der Mathematik der Uni Konstanz."],
  ["Langjährige Arbeit mit Schülern", " – von der Mittelstufe bis zum Abitur."],
];

const SCHRITTE = [
  ["Verstehen", "Sehen, was eine Formel bedeutet – mit Werkzeugen, die live rechnen und zeichnen, statt auswendig zu lernen."],
  ["Aufschreiben", "Ein Schritt pro Zeile, Gleichheitszeichen untereinander. Pen & Paper ist der erste Kurs – und kostenlos."],
  ["Trainieren", "Kurz und täglich statt lang vor der Klausur. Mathilda plant deinen Tag und prüft deinen Rechenweg."],
];

const ZUSAGEN = ["Kostenlos und ohne Anmeldung", "Bleibt auf deinem Gerät, bis du ein Konto willst", "Keine Abkürzung – aber ein Weg, der funktioniert"];

const WEG_NICHTS = ["Die Lücke wächst mit jedem neuen Kapitel.", "Die Klausur bleibt Glückssache.", "Der Satz bleibt: „Ich bin halt kein Mathe-Typ.“"];
const WEG_HEUTE = ["Ein Thema, ein Blatt, zehn Minuten.", "Fehler selbst finden – und beim nächsten Mal vermeiden.", "Vor der Klausur: ein Plan statt Panik."];

/* ---------------------------------------------------------------- Bausteine */
const Haken = () => (
  <span className="haken" aria-hidden="true">
    <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2.5 6.3l2.4 2.4L9.6 3.8" stroke={NACHT} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
  </span>
);

/* Durchgestrichenes Wort mit handschriftlicher Notiz; „da“ sobald im Bild */
function Weg({ children, notiz }) {
  const ref = useRef(null);
  const [da, setDa] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") { setDa(true); return undefined; }
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { setDa(true); io.disconnect(); } }, { threshold: .6 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <span ref={ref} className={da ? "sg-weg da" : "sg-weg"}>
      {children}
      <svg viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true"><path d="M1 6.5 C 25 3.5, 60 8, 99 4" /></svg>
      {notiz && <span className="notiz" aria-hidden="true">{notiz}</span>}
    </span>
  );
}

/* Notenverlauf 2 → 1,0 (Klasse 5 bis 10) */
function NotenKurve() {
  const x = (k) => 34 + (k - 5) * 60;
  const y = (n) => 34 + (n - 1) * 100;
  const weg = `M ${x(5)} ${y(2)} L ${x(7)} ${y(2)} C ${x(7.9)} ${y(2)}, ${x(8.4)} ${y(1.85)}, ${x(8.9)} ${y(1.45)} C ${x(9.35)} ${y(1.1)}, ${x(9.6)} ${y(1)}, ${x(10)} ${y(1)} L ${x(10.5)} ${y(1)}`;
  return (
    <svg className="sg-noten" viewBox="0 0 360 172" role="img" aria-label="Notenverlauf: Klasse 5 bis 7 Note 2, ab Klasse 8 ein anderer Weg, ab Klasse 10 die 1,0.">
      <line x1="26" y1={y(1)} x2="352" y2={y(1)} stroke="currentColor" strokeOpacity=".12" />
      <line x1="26" y1={y(2)} x2="352" y2={y(2)} stroke="currentColor" strokeOpacity=".12" />
      <text x="18" y={y(1) + 4} textAnchor="end" fontSize="12.5" fontWeight="800" fill={GOLD}>1,0</text>
      <text x="18" y={y(2) + 4} textAnchor="end" fontSize="12.5" fontWeight="800" fill="currentColor" opacity=".7">2</text>
      <line x1={x(8)} y1="12" x2={x(8)} y2="148" stroke={GOLD} strokeOpacity=".5" strokeDasharray="4 5" />
      <text x={x(8) + 6} y="16" fontSize="11.5" fontWeight="800" fill={GOLD} letterSpacing=".04em">ANDERER WEG</text>
      <path d={weg} fill="none" stroke={GOLD} strokeWidth="3.5" strokeLinecap="round" />
      {[5, 6, 7].map((k) => <circle key={k} cx={x(k)} cy={y(2)} r="4.5" fill="currentColor" opacity=".7" />)}
      <circle cx={x(10)} cy={y(1)} r="7" fill={GOLD_HELL} />
      <circle cx={x(10)} cy={y(1)} r="13" fill="none" stroke={GOLD} strokeOpacity=".6" />
      {[5, 6, 7, 8, 9, 10].map((k) => <text key={k} x={x(k)} y="168" textAnchor="middle" fontSize="12.5" fontWeight="700" fill="currentColor" opacity=".7">{k}</text>)}
    </svg>
  );
}

/* Zu einem Abschnitt springen (Sprung-Schalter „start-gast“); die klebende Kopfleiste bleibt frei */
function zuAbschnitt(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const kopf = document.querySelector(".kl[data-klebrig]");
  const h = kopf ? Math.round(kopf.getBoundingClientRect().height) : 56;
  const ziel = Math.max(0, el.getBoundingClientRect().top + window.scrollY - h - 14);
  springe("start-gast", () => window.scrollTo({ top: ziel, behavior: "smooth" }));
}

/* Feste Handy-Leiste: sichtbar, sobald die Bühne oben raus ist, bis die Start-Karte erreicht ist */
function HandyLeiste({ onClick, knopf }) {
  const [da, setDa] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    let tick = false;
    const lauf = () => {
      tick = false;
      const held = document.querySelector(".sg-held");
      const demo = document.getElementById("heute");
      if (!held || !demo) { setDa(false); return; }
      const heldWeg = held.getBoundingClientRect().bottom < 0;
      const demoDa = demo.getBoundingClientRect().top < window.innerHeight * .8;
      setDa(heldWeg && !demoDa);
    };
    const h = () => { if (!tick) { tick = true; window.requestAnimationFrame(lauf); } };
    lauf();
    window.addEventListener("scroll", h, { passive: true });
    window.addEventListener("resize", h);
    return () => { window.removeEventListener("scroll", h); window.removeEventListener("resize", h); };
  }, []);
  return (
    <div className={da ? "sg-leiste da" : "sg-leiste"} aria-hidden={!da} data-start-gast-leiste>
      <button type="button" className="sbb-los gold" tabIndex={da ? 0 : -1} onClick={onClick}>{knopf}</button>
    </div>
  );
}

/* ---------------------------------------------------------------- Die Seite */
export function StartseiteGast({ gehe }) {
  const modus = useStartModus();
  const { stufe, setzen: stufeSetzen, klasse } = useStartStufe();
  const startKnopf = "Kostenlos starten";
  const zurDemo = () => zuAbschnitt("heute");
  useEffect(() => {
    const d = document.documentElement;
    d.setAttribute("data-start-modus", basisModus(modus));
    return () => d.removeAttribute("data-start-modus");
  }, [modus]);

  return (
    <ModusKontext.Provider value={modus}>
    <div className="sbb sg" data-modus={basisModus(modus)} data-edition={editionVon(modus)} data-start-gast>
      <style>{START_CSS}</style>
      <style>{CSS}</style>
      <div className="sbb-licht" aria-hidden="true"><span className="l1" /><span className="l2" /><span className="l3" /></div>

      {/* ---------- 1 HELD: Bühne ---------- */}
      <section className="sbb-held sbb-insel sg-held" aria-label="Mythos Mathe">
        <HeldKurve />
        <div className="sbb-spalte sbb-held-text">
          <h1>Mathe kann<span className="gold">jeder verstehen</span></h1>
          <p className="unter">Hier lernst du wie!</p>
          <p className="sg-fuer">Für Schüler am Gymnasium, von Klasse 5 bis zum Abi, die nicht nur die nächste Arbeit überstehen wollen, sondern endlich verstehen, was sie da rechnen.</p>
          <div className="sg-knoepfe">
            <button type="button" className="sbb-los gold held" onClick={zurDemo} data-start-gast-los>{startKnopf}</button>
            <button type="button" className="sbb-los leise" onClick={() => zuAbschnitt("problem")} data-start-gast-wie>Wie das geht <i aria-hidden="true">↓</i></button>
          </div>
        </div>
      </section>
      <div className="sg-fakten" role="list" aria-label="Vier Fakten zu Mythos Mathe">
        {FAKTEN.map(([t, z]) => <div key={t} className="sg-fakt" role="listitem"><b>{t}</b><span>{z}</span></div>)}
      </div>

      {/* ---------- 2 PROBLEM ---------- */}
      <section className="sbb-teil sg-teil" id="problem" style={{ scrollMarginTop: 72 }}><div className="sbb-spalte">
        <Kopf titel="Kennst du das?" />
        <p className="sbb-text">Die meisten, die an Mathe verzweifeln, scheitern nicht am Kopf. Sie scheitern an drei Dingen, die ihnen nie jemand erklärt hat.</p>
        <div className="sg-raster" data-start-gast-problem>
          {EBENEN.map((e) => (
            <div key={e.wo} className={e.gegner ? "sg-karte gegner" : "sg-karte"}>
              <span className="wo">{e.wo}</span>
              <span className="zitat">{e.gegner ? <>„Mathe ist <Weg notiz="Mythos!">Talent</Weg>.“</> : e.zitat}</span>
              <p>{e.text}</p>
              {e.gegner && <button type="button" className="sg-link" onClick={() => gehe({ ansicht: "blog", seite: MYTHEN_SLUG })} data-start-gast-mythen>Die 7 Mathe-Mythen <i aria-hidden="true">→</i></button>}
            </div>
          ))}
        </div>
      </div></section>

      {/* ---------- 3 MENTOR: dunkler Streifen ---------- */}
      <section className="sbb-teil sbb-streifen sbb-insel sg-teil" id="mentor"><div className="sbb-spalte">
        <p className="sg-kicker" style={{ marginTop: 36 }}>Wer das hier schreibt</p>
        <Kopf titel="Ich war die 2." />
        <div className="sg-mentor">
          <div>
            <p className="sbb-text stark">In den ersten drei Jahren am Gymnasium hing ich bei der Note 2 fest. Ab Klasse 8 habe ich angefangen, anders zu lernen – ab Klasse 10 stand eine <b>1,0</b> im Zeugnis. Nicht durch Talent. Durch ein anderes System.</p>
            <ul className="sg-belege" aria-label="Belege">
              {BELEGE.map(([b, t]) => <li key={b}><Haken /><span><b>{b}</b>{t}</span></li>)}
            </ul>
            <p className="sg-haltung">Ich verspreche dir keine Abkürzung. Ich zeige dir ein System, das du jeden Tag anwenden kannst – und gebe dir die Werkzeuge dafür.</p>
            <p className="sg-unterschrift"><span className="mono" aria-hidden="true">B</span><span><b>{AUTOR.name}</b>{AUTOR.rolle}</span></p>
          </div>
          <div className="sg-karte" aria-hidden="true" style={{ color: "var(--text)" }}>
            <span className="wo">Mein Notenverlauf</span>
            <NotenKurve />
          </div>
        </div>
      </div></section>

      {/* ---------- 4 LÖSUNG: Plan, Zusagen – dann zeigen ---------- */}
      <section className="sbb-teil sg-teil" id="loesung" style={{ scrollMarginTop: 72 }}><div className="sbb-spalte">
        <Kopf titel="So lernst du Mathe. In drei Schritten." />
        <p className="sbb-text">Gute Noten sind kein Talent, sondern eine Arbeitsweise. Sie hat drei Teile, und jeden davon kannst du hier sofort üben.</p>
        <div className="sg-raster" data-start-gast-plan>
          {SCHRITTE.map(([t, z], i) => (
            <div key={t} className="sg-karte sg-schritt"><span className="nr" aria-hidden="true">{i + 1}</span><b>{t}</b><p>{z}</p></div>
          ))}
        </div>
        <ul className="sg-zusagen" aria-label="Drei Zusagen">
          {ZUSAGEN.map((z) => <li key={z}><span className="punkt" aria-hidden="true" />{z}</li>)}
        </ul>

        <div id="heute" className="sg-heute" style={{ scrollMarginTop: 80 }}>
          <div>
            <Kopf titel="Probier es jetzt." />
            <p className="sbb-text">Sag uns deine Klasse – und du siehst deinen ersten Trainingstag. Ohne Anmeldung, nur auf deinem Gerät.</p>
          </div>
          <div className="sg-demo" data-start-gast-demo>
            <StartKarte gehe={gehe} setzeStufe={stufeSetzen} klasse={klasse} />
          </div>
        </div>
      </div></section>

      {/* Mathilda – dunkler Streifen */}
      <section className="sbb-teil sbb-streifen sbb-insel sg-teil" id="mathilda" style={{ scrollMarginTop: 72 }}><div className="sbb-spalte">
        <p className="sg-kicker" style={{ marginTop: 36 }}>Schritt 2 und 3</p>
        <Kopf titel={<><MathildaName dunkel={basisModus(modus) !== "hell"} /> prüft deinen Weg, nicht nur dein Ergebnis.</>} />
        <MathildaBlock gehe={gehe} ohneZwei />
      </div></section>

      {/* Alle Werkzeuge: Suche + Navigator (Kopfleiste „Mathe lernen“ springt hierher) */}
      <section className="sbb-teil sg-teil" id="lernen" style={{ scrollMarginTop: 72 }}><div className="sbb-spalte">
        <Kopf titel="Alle Werkzeuge – von Klasse 5 bis zum Abi." />
        <p className="sbb-text">Plotter, Trainer und Generatoren zu jedem Thema. Such direkt – oder geh den Weg zum Abi Stufe für Stufe.</p>
        <div className="sg-suche"><SuchBox gehe={gehe} /></div>
        <LernNavigator gehe={gehe} stufe={stufe} stufeSetzen={stufeSetzen} klasse={klasse} zone={false} />
      </div></section>

      {/* Kurse */}
      <section className="sbb-teil sg-teil" id="kurse" style={{ scrollMarginTop: 72 }}><div className="sbb-spalte">
        <Kopf titel="Kurse. Jeder ein Baustein." />
        <KursRaster gehe={gehe} />
        <div className="sbb-mehr">
          <button type="button" onClick={() => gehe({ ansicht: "kursliste" })} data-start-alle-kurse>Alle {KURSE.length} Kurse und weitere Lernangebote <i aria-hidden="true">→</i></button>
        </div>
      </div></section>

      {/* ---------- 5 REISE: zwei Wege, Abschluss ---------- */}
      <section className="sbb-teil sbb-streifen sbb-insel sg-teil" id="reise"><div className="sbb-spalte">
        <p className="sg-kicker" style={{ marginTop: 36 }}>Deine Entscheidung</p>
        <Kopf titel="Zwei Wege." />
        <div className="sg-raster zwei" data-start-gast-wege>
          <div className="sg-karte sg-weg-karte"><span className="titel">Nichts ändern</span><ul>{WEG_NICHTS.map((t) => <li key={t}>{t}</li>)}</ul></div>
          <div className="sg-karte sg-weg-karte gut"><span className="titel">Heute anfangen</span><ul>{WEG_HEUTE.map((t) => <li key={t}>{t}</li>)}</ul></div>
        </div>
        <div className="sg-schluss">
          <button type="button" className="sbb-los gold" onClick={() => gehe({ ansicht: "penpaperkurs" })} data-start-gast-schluss>Pen & Paper starten <span className="frei">· kostenlos</span></button>
          {ANGEBOT.coaching
            ? <button type="button" className="sbb-los leise" onClick={() => gehe({ ansicht: LANDING })}>Erstgespräch anfragen</button>
            : <button type="button" className="sbb-los leise" onClick={() => gehe({ ansicht: "vision" })} data-start-vision>Die Vision lesen <i aria-hidden="true">→</i></button>}
        </div>
      </div></section>

      {/* Blog-Anriss zum Schluss; Spenden stehen auf dem Dashboard und auf /vision, nicht vor dem ersten Training */}
      <section className="sbb-teil ende"><div className="sbb-spalte">
        <BlogAnriss gehe={gehe} />
      </div></section>

      <HandyLeiste onClick={zurDemo} knopf={startKnopf} />
    </div>
    </ModusKontext.Provider>
  );
}
