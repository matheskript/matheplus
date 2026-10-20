/* ======================================================================
   STARTSEITE B – „Nachtblatt“: dieselben Inhalte und Ziele wie die
   Startseite A (func2.jsx → Startseite), aber in einem eigenen Design.

   Idee: Die ganze Seite ist ein kariertes Blatt bei Nacht. Tiefes Nachtblau,
   das Raster von Rechenpapier über die ganze Fläche, Gold als einziges Licht.
   Oben zieht sich einmal eine Funktionskurve über das Blatt; darunter liegen
   die Inhalte als Glaskacheln. Alles, was selbst ein Werkzeug ist (Dein
   Training, Suche, Bereiche, Plan), liegt als weißes „Blatt“ auf dem Tisch.

   Umschalten A/B: src/startVariante.js (Links /start-a und /start-b, Pille
   unten links). Diese Datei verändert A nicht.
   ====================================================================== */
import React, { useEffect, useRef, useState } from "react";
import { C } from "./base1.jsx";
import { PenPaperBlatt } from "./func1.jsx";
import { MathildaName } from "./mathildaName.jsx";
import { MathildaPfade } from "./mathildaBild.jsx";
import { SchulKopf, UnterMenue, schulBereiche, blockEintraege, bereichInhalt, useStartStufe, MYTHEN, useFrei, PasswortFeld,
  SchlossZeichen, SchulkurseLogoKlein, ZEIGE_GESPERRTE, WeitermachenZeile, SchulmatheLogoKlein, ElternkursLogoKlein, MathildaLogoKlein } from "./func2.jsx";
import { HeadNumbersLogoKlein } from "./funcHeadNumbersLogo.jsx";
import { GleichKursLogoKlein } from "./funcGleichKursLogo.jsx";
import { EBB_SLOGAN, EbbinghausBadge, EbbinghausLogoKlein } from "./funcEbbinghaus.jsx";
import { EntdeckenLogoKlein } from "./funcEntdeckenLogo.jsx";
import { DeinPlanBlock, useLernpfad } from "./funcLernpfad.jsx";
import { StartOnboarding } from "./funcOnboarding.jsx";
import { Quickfinder } from "./funcQuickfinder.jsx";
import { AppAnleitung } from "./funcAnleitung.jsx";
import { SuchBox } from "./funcSuche.jsx";
import { MasterclassKachel, MatheCheckenKachel, MathCreatorKachel } from "./funcMasterclass.jsx";
import { DiffKursKachel } from "./funcDiffKursKachel.jsx";
import { VekKursKachel } from "./funcVekKursKachel.jsx";
import { GfsKursKachel } from "./funcGfsKursKachel.jsx";
import { ClaudeKursKachel } from "./funcClaudeKursKachel.jsx";
import { ElternabendKachel } from "./funcElternabend.jsx";
import { SpendenBereich } from "./funcSpendenBereich.jsx";
import { ANGEBOT } from "./angebot.js";
import { BEREICHE } from "./werkzeuge.js";
import { ENTDECKEN_MENUE } from "./startMenues.js";
import { istFrei } from "./seitenKonstanten.js";
import { EVENT_START_VARIANTE, startVariante, startVarianteGewaehlt, startVarianteSetzen } from "./startVariante.js";

/* ---------- Farben der Fassung B ---------- */
const NACHT = "#050B1F";
const NACHT_HELL = "#0B1838";
const GOLD = C.flaggold;
const GOLD_HELL = "#FFE58A";
const TEXT = "#EEF2FF";
const NEBEL = "#AEBCDD";
const LINIE = "rgba(255,255,255,0.11)";
const DESKTOP = "(min-width: 840px)";

const CSS = `
html[data-start-b] .app-wurzel { background: ${NACHT} !important; color: ${TEXT}; }
html[data-start-b] .fuss-paar button { color: ${TEXT} !important; background: rgba(255,255,255,0.06) !important; border-color: ${LINIE} !important; }
.sbb { position: relative; color: ${TEXT}; }
.sbb *, .sbb *::before, .sbb *::after { box-sizing: border-box; }
/* Das Rechenpapier und das Licht liegen hinter allem (negativer z-index: unter jedem Inhalt, über dem Seitenhintergrund) */
.sbb-raster { position: fixed; inset: 0; z-index: -1; pointer-events: none;
  background-image: linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
  background-size: 28px 28px; }
.sbb-licht { position: fixed; inset: 0; z-index: -1; pointer-events: none; overflow: hidden; }
.sbb-licht span { position: absolute; border-radius: 999px; filter: blur(60px); opacity: .55; }
.sbb-licht .l1 { width: 56vw; height: 56vw; max-width: 640px; max-height: 640px; top: -18vw; right: -14vw; background: radial-gradient(circle, rgba(237,187,0,0.45) 0%, rgba(237,187,0,0) 70%); }
.sbb-licht .l2 { width: 70vw; height: 70vw; max-width: 760px; max-height: 760px; top: 30vh; left: -30vw; background: radial-gradient(circle, rgba(0,77,152,0.55) 0%, rgba(0,77,152,0) 70%); }
.sbb-licht .l3 { width: 50vw; height: 50vw; max-width: 520px; max-height: 520px; bottom: -20vw; right: -10vw; background: radial-gradient(circle, rgba(36,87,197,0.45) 0%, rgba(36,87,197,0) 70%); }

/* ---------- Bühne oben ---------- */
.sbb-held { position: relative; overflow: hidden; padding: clamp(28px, 6vw, 56px) 0 0; }
.sbb-held-kurve { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.sbb-held-kurve .weg { stroke-dasharray: 1400; stroke-dashoffset: 1400; animation: sbbWeg 2.6s cubic-bezier(.4,0,.2,1) .2s forwards; }
.sbb-held-kurve .punkt { opacity: 0; animation: sbbPunkt .6s ease 2.4s forwards; }
@keyframes sbbWeg { to { stroke-dashoffset: 0; } }
@keyframes sbbPunkt { to { opacity: 1; } }
.sbb-held-text { position: relative; z-index: 1; }
.sbb-held h1 { margin: 0; font-weight: 900; letter-spacing: -0.045em; line-height: .92; font-size: clamp(42px, 10.6vw, 92px); color: #fff;
  text-shadow: 0 12px 50px rgba(0,0,0,.45); }
.sbb-held h1 .gold { display: block; background: linear-gradient(180deg, ${GOLD_HELL} 0%, ${GOLD} 55%, #C9931A 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
.sbb-held .unter { margin: 14px 0 0; font-weight: 300; font-size: clamp(20px, 4.6vw, 30px); line-height: 1.15; color: ${TEXT}; }
.sbb-held ul { list-style: none; margin: 26px 0 0; padding: 0; display: grid; gap: 10px; }
@media ${DESKTOP} { .sbb-held ul { grid-template-columns: 1fr 1fr; column-gap: 24px; } }
.sbb-held li { display: flex; align-items: center; gap: 12px; font-size: 15px; font-weight: 500; color: ${TEXT}; }
.sbb-haken { flex: none; width: 26px; height: 26px; border-radius: 50%; background: ${GOLD}; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 0 0 4px rgba(237,187,0,0.18), 0 6px 16px rgba(237,187,0,0.35); }
.sbb-haken svg { width: 56%; height: 56%; }
.sbb-start-knopf { margin-top: 28px; display: inline-flex; align-items: center; gap: 10px; padding: 15px 22px; border-radius: 999px; border: none; cursor: pointer; font-family: inherit;
  font-size: 15.5px; font-weight: 800; color: ${NACHT}; background: linear-gradient(180deg, ${GOLD_HELL} 0%, ${GOLD} 100%); box-shadow: 0 12px 34px rgba(237,187,0,0.35), inset 0 1px 0 rgba(255,255,255,.6); }
.sbb-start-knopf:focus-visible, .sbb button:focus-visible { outline: 3px solid ${GOLD}; outline-offset: 3px; }

/* Laufband mit den Bereichen – langsam, nur Deko mit Inhalt */
.sbb-band { margin-top: clamp(26px, 6vw, 44px); border-top: 1px solid ${LINIE}; border-bottom: 1px solid ${LINIE}; overflow: hidden; background: rgba(5,11,31,0.55); backdrop-filter: blur(6px); }
.sbb-band-spur { display: flex; width: max-content; animation: sbbBand 48s linear infinite; }
.sbb-band span { display: inline-flex; align-items: center; gap: 18px; padding: 11px 18px 11px 0; font-size: 13px; font-weight: 700; letter-spacing: .01em; color: ${NEBEL}; white-space: nowrap; }
.sbb-band span::after { content: ""; width: 6px; height: 6px; border-radius: 50%; background: ${GOLD}; }
@keyframes sbbBand { to { transform: translateX(-50%); } }

/* ---------- Spalte ---------- */
.sbb-spalte { width: 100%; max-width: 783px; margin: 0 auto; padding: 0 20px 70px; }
.sbb-spalte > * + * { }
.sbb-abschnitt { margin-top: 28px; }
.sbb-einleitung { margin: 26px 0 0; font-size: clamp(17px, 4.4vw, 22px); font-weight: 300; line-height: 1.5; color: ${NEBEL}; max-width: 640px; }
.sbb-einleitung b { color: #fff; font-weight: 700; }

/* Zonen: Heute · Lernen · Entdecken – ein Weg in drei Etappen, daher die großen Ziffern */
.sbb-zone { margin: 44px 0 14px; display: flex; align-items: flex-end; gap: 14px; }
.sbb-zone .nr { font-size: 60px; font-weight: 900; line-height: .8; letter-spacing: -0.04em; background: linear-gradient(180deg, ${GOLD_HELL} 0%, ${GOLD} 60%, #C9931A 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
.sbb-zone h2 { margin: 0; font-size: clamp(26px, 6.4vw, 34px); font-weight: 800; letter-spacing: -0.03em; line-height: 1; color: #fff; }
.sbb-zone p { margin: 6px 0 0; font-size: 14px; color: ${NEBEL}; line-height: 1.4; }

/* Glaskachel */
.sbb-karte { position: relative; width: 100%; border-radius: 22px; border: 1px solid ${LINIE};
  background: linear-gradient(160deg, rgba(255,255,255,0.085) 0%, rgba(255,255,255,0.035) 60%, rgba(255,255,255,0.02) 100%);
  box-shadow: 0 30px 60px -36px rgba(0,0,0,.9), inset 0 1px 0 rgba(255,255,255,0.08); color: ${TEXT}; }
.sbb-kachel { display: flex; flex-direction: column; padding: 0; overflow: hidden; cursor: pointer; font-family: inherit; text-align: left; transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease; }
@media (hover:hover) { .sbb-kachel:not(:disabled):hover { transform: translateY(-3px); border-color: rgba(237,187,0,0.55); box-shadow: 0 0 0 1px rgba(237,187,0,0.35), 0 30px 60px -30px rgba(237,187,0,0.35), 0 30px 60px -36px rgba(0,0,0,.9); } }
.sbb-kachel:not(:disabled):active { transform: scale(.985); }
.sbb-kachel-bild { position: relative; height: 128px; flex: none; display: flex; align-items: center; justify-content: center; padding: 10px 18px;
  background: radial-gradient(120% 140% at 50% 120%, rgba(0,77,152,0.55) 0%, rgba(0,77,152,0.08) 55%, rgba(0,0,0,0) 100%); border-bottom: 1px solid ${LINIE}; }
.sbb-kachel-bild > svg, .sbb-kachel-bild > span, .sbb-kachel-bild > div { max-height: 100%; }
.sbb-kachel-text { padding: 16px 18px 18px; display: flex; flex-direction: column; gap: 6px; flex: 1 1 auto; }
.sbb-kachel h2, .sbb-kachel h3 { margin: 0; font-size: 21px; font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; color: #fff; overflow-wrap: anywhere; hyphens: auto; }
.sbb-kachel p { margin: 0; font-size: 13.5px; font-weight: 400; line-height: 1.5; color: ${NEBEL}; }
.sbb-kachel .weiter { margin-top: auto; padding-top: 8px; font-size: 13px; font-weight: 700; color: ${GOLD}; display: inline-flex; align-items: center; gap: 8px; }
.sbb-kachel .weiter i { font-style: normal; display: inline-block; transition: transform .18s ease; }
@media (hover:hover) { .sbb-kachel:hover .weiter i { transform: translateX(4px); } }
.sbb-kachel.zu { cursor: not-allowed; }
.sbb-logo { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
.sbb-kachel.zu .sbb-logo { filter: grayscale(1); opacity: .32; }
.sbb-kachel.zu h2, .sbb-kachel.zu h3 { color: #C9D2E6; }
.sbb-schloss { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
.sbb-gold { border-color: rgba(237,187,0,0.75); box-shadow: 0 0 0 1px rgba(237,187,0,0.45), 0 30px 60px -30px rgba(237,187,0,0.45); }
.sbb-raster2 { display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; }
.sbb-raster2 > * { min-width: 0; }
@media ${DESKTOP} { .sbb-raster2 { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 18px; } .sbb-breit { grid-column: 1 / -1; } }

/* Hauptkacheln mit Aufklappen (Schulmathematik, Mathe entdecken): am Handy Bild oben, Text darunter, Plus rechts unten;
   ab 840 px Bild links, Text rechts, Plus rechts außen */
.sbb-haupt { position: relative; display: flex; flex-direction: column; align-items: stretch; gap: 0; width: 100%; padding: 0; cursor: pointer; font-family: inherit; text-align: left; overflow: hidden; transition: border-color .18s ease, box-shadow .18s ease; }
.sbb-haupt .bild { flex: none; height: 104px; display: flex; align-items: center; justify-content: center; padding: 8px 18px; border-bottom: 1px solid ${LINIE};
  background: radial-gradient(120% 140% at 50% 120%, rgba(0,77,152,0.55) 0%, rgba(0,77,152,0.08) 60%, rgba(0,0,0,0) 100%); }
.sbb-haupt .bild > svg { height: 100%; width: auto; max-width: 100%; }
.sbb-haupt .txt { flex: 1 1 auto; min-width: 0; padding: 16px 74px 16px 18px; display: flex; flex-direction: column; justify-content: center; gap: 5px; }
.sbb-haupt h2 { margin: 0; font-size: clamp(22px, 6vw, 28px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.05; color: #fff; }
.sbb-haupt p { margin: 0; font-size: 13.5px; line-height: 1.45; color: ${NEBEL}; }
.sbb-haupt .plus { position: absolute; right: 16px; bottom: 16px; width: 46px; height: 46px; border-radius: 999px; background: ${GOLD}; color: ${NACHT}; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 22px rgba(237,187,0,0.4); transition: transform .22s ease; }
@media ${DESKTOP} {
  .sbb-haupt { flex-direction: row; }
  .sbb-haupt .bild { height: auto; flex: 0 0 170px; padding: 10px; border-bottom: none; border-right: 1px solid ${LINIE};
    background: radial-gradient(120% 140% at 0% 50%, rgba(0,77,152,0.55) 0%, rgba(0,77,152,0.08) 60%, rgba(0,0,0,0) 100%); }
  .sbb-haupt .bild > svg { height: auto; width: 100%; }
  .sbb-haupt .txt { padding: 16px 80px 16px 16px; }
  .sbb-haupt .plus { right: 18px; bottom: auto; top: 50%; transform: translateY(-50%); }
  .sbb-haupt[aria-expanded="true"] .plus { transform: translateY(-50%) rotate(45deg); }
}
.sbb-haupt[aria-expanded="true"] .plus { transform: rotate(45deg); }
.sbb-haupt[aria-expanded="true"] { border-color: rgba(237,187,0,0.6); }
@media (hover:hover) { .sbb-haupt:hover { border-color: rgba(237,187,0,0.55); } }

/* Weißes Blatt für alles, was selbst ein Werkzeug ist */
.sbb-papier { margin-top: 10px; border-radius: 20px; background: ${C.weiss}; color: ${C.tinte}; padding: 14px 16px 16px; box-shadow: 0 30px 60px -30px rgba(0,0,0,.9), 0 0 0 1px rgba(255,255,255,0.08); }
.sbb-papier.eng { padding: 0; overflow: hidden; }
.sbb-papier [data-such-box] { margin: 0 !important; box-shadow: none !important; border: none !important; }
/* Wiederverwendete Kacheln (Kurse, Plan, Spenden …) laufen in A um 16 px über den Rand; hier füllen sie genau die Spalte */
.sbb-wieder > [style*="calc(100% + 32px)"], .sbb-wieder > div > [style*="calc(100% + 32px)"] { width: 100% !important; margin-left: 0 !important; margin-right: 0 !important; }
.sbb-wieder > * { margin-top: 14px !important; }

/* Bereiche der Schulmathematik auf dem Blatt */
.sbb-bereich { width: 100%; display: flex; align-items: center; gap: 12px; padding: 10px 10px 10px 8px; border: none; border-radius: 14px; background: transparent; cursor: pointer; font-family: inherit; text-align: left; color: ${C.tinte}; transition: background .15s ease; }
.sbb-bereich:hover { background: ${C.sand}; }
.sbb-bereich[aria-expanded="true"] { background: ${C.himmel}; }
.sbb-bereich .logo { flex: none; width: 64px; height: 50px; border-radius: 12px; overflow: hidden; background: linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%); display: flex; align-items: center; justify-content: center; padding: 4px; }
.sbb-bereich.gold .logo { box-shadow: 0 0 0 2px ${GOLD}; }
.sbb-bereich .t { flex: 1 1 auto; min-width: 0; }
.sbb-bereich .t b { display: block; font-size: 15.5px; font-weight: 800; letter-spacing: -0.02em; color: ${C.seeTief}; line-height: 1.15; overflow-wrap: anywhere; hyphens: auto; }
.sbb-bereich .t > span { display: block; font-size: 12.5px; color: ${C.grau}; line-height: 1.35; margin-top: 2px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.sbb-bereich .pf { flex: none; width: 30px; height: 30px; border-radius: 999px; background: ${GOLD}; display: flex; align-items: center; justify-content: center; transition: transform .2s ease; }
.sbb-bereich[aria-expanded="true"] .pf { transform: rotate(45deg); }
.sbb-bereich-inhalt { padding: 2px 4px 8px; border-bottom: 1px solid ${C.linie}; margin-bottom: 6px; }
/* Zusammenfassung je Bereich (bereichInhalt aus func2.jsx): kurz am Handy, lang ab 840 px – wie in A */
.sbb .bereich-lang { display: none; }
@media ${DESKTOP} { .sbb .bereich-kurz { display: none; } .sbb .bereich-lang { display: inline; } }

/* Das System: zwei Schritte, verbunden */
.sbb-system { display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; position: relative; margin-top: 20px; }
.sbb-system > * { min-width: 0; }
@media ${DESKTOP} { .sbb-system { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 24px; } }
.sbb-schritt { display: flex; flex-direction: column; padding: 20px 20px 18px; cursor: pointer; font-family: inherit; text-align: left; transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease; }
@media (hover:hover) { .sbb-schritt:hover { transform: translateY(-3px); border-color: rgba(237,187,0,0.55); } }
.sbb-schritt .nr { font-size: 12.5px; font-weight: 700; color: ${GOLD}; }
.sbb-schritt h3 { margin: 8px 0 0; font-size: 28px; font-weight: 800; letter-spacing: -0.035em; line-height: 1; color: #fff; }
.sbb-schritt p { margin: 10px 0 0; font-size: 14px; line-height: 1.5; color: ${NEBEL}; }
.sbb-schritt .bild { height: 110px; margin: 14px -6px 0; display: flex; align-items: center; justify-content: center; }
.sbb-schritt .knopf { margin-top: 16px; align-self: flex-start; padding: 10px 16px; border-radius: 999px; font-size: 13.5px; font-weight: 800; color: ${NACHT}; background: #fff; }
.sbb-schritt .knopf.gold { background: linear-gradient(180deg, ${GOLD_HELL} 0%, ${GOLD} 100%); }
.sbb-verbinder { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); z-index: 2; width: 40px; height: 40px; border-radius: 999px; background: ${GOLD}; color: ${NACHT}; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 0 5px ${NACHT}, 0 8px 20px rgba(237,187,0,0.45); }
.sbb-verbinder svg { transform: rotate(90deg); }
@media ${DESKTOP} { .sbb-verbinder svg { transform: none; } }

/* Abschnittsköpfe */
.sbb-kopf { margin-top: 48px; }
.sbb-kopf h2 { margin: 0; font-size: clamp(26px, 6.8vw, 40px); font-weight: 800; letter-spacing: -0.035em; line-height: 1.05; color: #fff; max-width: 680px; }
.sbb-kopf .strich { display: block; width: 72px; height: 4px; border-radius: 2px; margin: 16px 0 18px; background: linear-gradient(90deg, ${GOLD_HELL}, ${GOLD}); box-shadow: 0 0 18px rgba(237,187,0,0.5); }
.sbb-text { margin: 0 0 12px; font-size: 15.5px; font-weight: 300; line-height: 1.7; color: ${NEBEL}; max-width: 660px; }
.sbb-text b { color: #fff; font-weight: 600; }
.sbb-text.stark { color: ${TEXT}; font-weight: 500; }

/* Minikurs-Pille */
.sbb-pille { margin: 18px auto 0; display: flex; justify-content: center; }
.sbb-pille button { display: inline-flex; align-items: center; gap: 10px; padding: 10px 18px; border-radius: 999px; border: 1px solid rgba(237,187,0,0.5); background: rgba(237,187,0,0.08); color: ${GOLD_HELL}; font-size: 13.5px; font-weight: 700; font-family: inherit; cursor: pointer; }
.sbb-pille button i { width: 8px; height: 8px; border-radius: 999px; background: ${GOLD}; box-shadow: 0 0 10px ${GOLD}; display: inline-block; }

/* Mythen */
.sbb-mythen-kopf { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 18px 20px; cursor: pointer; font-family: inherit; text-align: left; color: #fff; }
.sbb-mythen-kopf b { display: block; font-size: 22px; font-weight: 800; letter-spacing: -0.03em; }
.sbb-mythen-kopf span { display: block; font-size: 13.5px; color: ${NEBEL}; margin-top: 4px; }
.sbb-mythos { border-top: 1px solid ${LINIE}; }
.sbb-mythos button { width: 100%; display: flex; align-items: center; gap: 14px; padding: 13px 18px; background: transparent; border: none; cursor: pointer; font-family: inherit; text-align: left; color: #fff; }
.sbb-mythos button[aria-expanded="true"] { background: rgba(237,187,0,0.07); }
.sbb-mythos .z { flex: none; width: 36px; height: 36px; border-radius: 10px; background: rgba(237,187,0,0.14); color: ${GOLD}; font-size: 17px; font-weight: 800; display: flex; align-items: center; justify-content: center; }
.sbb-mythos .n { color: ${NEBEL}; font-weight: 600; margin-right: 8px; }
.sbb-mythos b { flex: 1; font-size: 15px; font-weight: 700; line-height: 1.35; }
.sbb-mythos p { margin: 0; padding: 0 18px 16px 68px; font-size: 14px; line-height: 1.65; color: ${NEBEL}; background: rgba(237,187,0,0.07); }

/* Dein Training */
.sbb-training { position: relative; }
.sbb-training .kopfzeile { width: 100%; display: flex; align-items: center; gap: 14px; padding: 18px 70px 18px 20px; cursor: pointer; background: transparent; border: none; font-family: inherit; text-align: left; }
.sbb-training h2 { margin: 0; font-size: clamp(22px, 6vw, 30px); font-weight: 800; letter-spacing: -0.035em; line-height: 1.05; color: #fff; }
.sbb-training .zeile { margin: 6px 0 0; font-size: 13.5px; color: ${NEBEL}; }
.sbb-training .pfeil { position: absolute; top: 16px; right: 16px; width: 40px; height: 40px; border-radius: 999px; border: none; cursor: pointer; background: ${GOLD}; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 22px rgba(237,187,0,0.4); }
.sbb-training .pfeil svg { transition: transform .22s ease; }
.sbb-training.auf .pfeil svg { transform: rotate(180deg); }
.sbb-training .sbb-papier.offen { margin: 0; border-radius: 21px; padding: 0; overflow: hidden; }
.sbb-training.auf .qf-kopf { padding-right: 60px; }
.sbb-training.auf .pfeil { top: 14px; right: 14px; box-shadow: 0 4px 14px rgba(14,30,74,0.25); }

/* Umschalter A/B */
.sbb-schalter { position: fixed; left: 14px; bottom: 14px; z-index: 40; display: inline-flex; align-items: center; gap: 2px; padding: 3px; border-radius: 999px; background: rgba(5,11,31,0.86); border: 1px solid rgba(255,255,255,0.18); box-shadow: 0 10px 30px rgba(0,0,0,.45); backdrop-filter: blur(8px); font-family: Montserrat, system-ui, sans-serif; }
.sbb-schalter .lab { padding: 0 8px 0 10px; font-size: 11px; font-weight: 700; color: ${NEBEL}; }
.sbb-schalter button { min-width: 34px; height: 30px; padding: 0 10px; border-radius: 999px; border: none; cursor: pointer; font-family: inherit; font-size: 13px; font-weight: 800; color: ${NEBEL}; background: transparent; }
.sbb-schalter button[aria-pressed="true"] { background: ${GOLD}; color: ${NACHT}; }

@media (prefers-reduced-motion: reduce) {
  .sbb-held-kurve .weg { animation: none; stroke-dashoffset: 0; }
  .sbb-held-kurve .punkt { animation: none; opacity: 1; }
  .sbb-band-spur { animation: none; }
  .sbb-kachel, .sbb-schritt { transition: none; }
}
`;

/* ---------- kleine Bausteine ---------- */

function Haken() {
  return (
    <span className="sbb-haken" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke={NACHT} strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.8l4.4 4.4L19 7.4" /></svg>
    </span>
  );
}

function Plus() {
  return <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M9 2.5v13M2.5 9h13" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" /></svg>;
}

function PlusKlein() {
  return <svg width="13" height="13" viewBox="0 0 18 18" aria-hidden="true"><path d="M9 2.5v13M2.5 9h13" stroke={C.seeTief} strokeWidth="3" strokeLinecap="round" /></svg>;
}

/* Die Kurve über der Bühne: ein Funktionsgraph, der sich einmal über das Blatt zeichnet, dazu ein Punkt mit Tangente. */
function HeldKurve() {
  return (
    <svg className="sbb-held-kurve" viewBox="0 0 760 460" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="sbbGold" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={GOLD} stopOpacity="0.25" /><stop offset="0.55" stopColor={GOLD} /><stop offset="1" stopColor={GOLD_HELL} />
        </linearGradient>
        <filter id="sbbGlow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6" /></filter>
      </defs>
      {/* Glyphen auf dem Blatt */}
      <g fontFamily="Montserrat, system-ui, sans-serif" fontWeight="700" fill="#fff">
        <text x="560" y="86" fontSize="56" opacity="0.07" className="schweben">∫</text>
        <text x="650" y="300" fontSize="46" opacity="0.07" className="pulsieren">∑</text>
        <text x="470" y="420" fontSize="34" opacity="0.07">π</text>
        <text x="600" y="190" fontSize="26" opacity="0.08">f′(x)</text>
        <text x="700" y="420" fontSize="30" opacity="0.07">√</text>
        <text x="520" y="250" fontSize="22" opacity="0.07">lim</text>
      </g>
      {/* Leuchtspur der Kurve, darüber die Kurve selbst */}
      <path className="weg" d="M -20 400 C 120 400, 200 120, 330 160 C 440 195, 470 330, 560 300 C 650 270, 690 120, 800 60" fill="none" stroke={GOLD} strokeWidth="14" opacity="0.22" filter="url(#sbbGlow)" strokeLinecap="round" />
      <path className="weg" d="M -20 400 C 120 400, 200 120, 330 160 C 440 195, 470 330, 560 300 C 650 270, 690 120, 800 60" fill="none" stroke="url(#sbbGold)" strokeWidth="3.5" strokeLinecap="round" />
      <g className="punkt">
        <line x1="500" y1="334" x2="620" y2="276" stroke="#fff" strokeWidth="1.4" opacity="0.55" strokeDasharray="5 4" />
        <circle cx="560" cy="300" r="7" fill={GOLD_HELL} />
        <circle cx="560" cy="300" r="14" fill="none" stroke={GOLD} strokeWidth="1.2" opacity="0.6" className="pulsieren" />
      </g>
    </svg>
  );
}

/* Laufband: die Bereiche der Schulmathematik, zweimal hintereinander für die Endlosschleife */
function Band() {
  const namen = BEREICHE.map((b) => b.titel);
  const reihe = [...namen, "Kopfrechnen", "Mathe entdecken", "Pen & Paper", "Formelsammlung"];
  return (
    <div className="sbb-band" aria-hidden="true">
      <div className="sbb-band-spur">
        {[0, 1].map((k) => <React.Fragment key={k}>{reihe.map((n, i) => <span key={`${k}-${i}`}>{n}</span>)}</React.Fragment>)}
      </div>
    </div>
  );
}

function Zone({ nr, titel, zeile }) {
  return (
    <div className="sbb-zone">
      <span className="nr" aria-hidden="true">{nr}</span>
      <div>
        <h2>{titel}</h2>
        {zeile && <p>{zeile}</p>}
      </div>
    </div>
  );
}

function Kopf({ titel }) {
  return (
    <div className="sbb-kopf">
      <h2>{titel}</h2>
      <span className="strich" aria-hidden="true" />
    </div>
  );
}

/* Glaskachel: Bild oben, Text unten. gesperrt = ausgegraut mit Schloss. */
function Kachel({ titel, text, logo, extra, ziel, label, gesperrt, keinI18n, gold, gehe, breit, weiter = "Öffnen" }) {
  return (
    <button type="button" onClick={gesperrt ? undefined : () => gehe(ziel)} disabled={gesperrt} aria-disabled={gesperrt || undefined}
      aria-label={gesperrt ? `${typeof titel === "string" ? titel : label} – noch gesperrt` : label} title={gesperrt ? "Noch gesperrt" : undefined}
      className={["sbb-karte", "sbb-kachel", gesperrt ? "zu" : null, gold ? "sbb-gold" : null, breit ? "sbb-breit" : null].filter(Boolean).join(" ")}>
      <div className="sbb-kachel-bild">
        <div className="sbb-logo">{logo}</div>
        {extra}
        {gesperrt && <span className="sbb-schloss" aria-hidden="true"><SchlossZeichen groesse={40} /></span>}
      </div>
      <div className="sbb-kachel-text">
        <h2 data-kein-i18n={keinI18n || undefined}>{titel}</h2>
        <p>{text}</p>
        {!gesperrt && <span className="weiter">{weiter} <i aria-hidden="true">→</i></span>}
      </div>
    </button>
  );
}

/* Mathilda-Kachel: Bild mit Blatt im Sucher, rechts das Porträt */
function MathildaKachel({ gehe }) {
  return (
    <button type="button" onClick={() => gehe({ ansicht: "analyse", foto: "blatt" })} aria-label="Mathilda AI öffnen" className="sbb-karte sbb-kachel sbb-gold">
      <div className="sbb-kachel-bild" style={{ justifyContent: "space-between", padding: "8px 8px 0 14px", overflow: "hidden" }}>
        <div style={{ height: "100%", flex: "1 1 auto", minWidth: 0 }}><MathildaLogoKlein /></div>
        <svg viewBox="0 0 120 138" aria-hidden="true" style={{ height: "118%", width: "auto", flex: "none", marginTop: "auto", marginBottom: -20, filter: "drop-shadow(0 10px 24px rgba(0,0,0,.5))" }}><MathildaPfade /></svg>
      </div>
      <div className="sbb-kachel-text">
        <h2><MathildaName dunkel /></h2>
        <p>Foto vom Blatt – Mathilda prüft deinen Weg.</p>
        <span className="weiter">Mit KI lernen <i aria-hidden="true">→</i></span>
      </div>
    </button>
  );
}

/* Aufklappbare Hauptkachel (Schulmathematik, Mathe entdecken) */
function HauptKachel({ titel, text, logo, auf, onClick, label }) {
  return (
    <button type="button" onClick={onClick} aria-expanded={auf} aria-label={label} className="sbb-karte sbb-haupt">
      <span className="bild" aria-hidden="true">{logo}</span>
      <span className="txt"><h2>{titel}</h2><p>{text}</p></span>
      <span className="plus" aria-hidden="true"><Plus /></span>
    </button>
  );
}

/* Dein Training: Kopfzeile mit Pfeil, aufgeklappt der Quickfinder auf einem weißen Blatt (wie in A, gleicher Sitzungsschlüssel) */
function TrainingKachel({ gehe, setzeStufe }) {
  const [auf, setAuf] = useState(() => { try { return sessionStorage.getItem("matheplus-training-auf") === "1"; } catch { return false; } });
  const umschalten = () => setAuf((a) => { try { sessionStorage.setItem("matheplus-training-auf", a ? "0" : "1"); } catch { /* egal */ } return !a; });
  const titel = (
    <>
      <h2 style={{ margin: 0, fontSize: "clamp(19px, 5.2vw, 25px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.12, color: C.see }}>Dein Training startet hier.</h2>
      <span aria-hidden="true" style={{ display: "block", width: 40, height: 3, borderRadius: 2, marginTop: 9, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${GOLD} 100%)` }} />
    </>
  );
  return (
    <div className={auf ? "sbb-karte sbb-training sbb-gold auf" : "sbb-karte sbb-training sbb-gold"}>
      <button type="button" className="pfeil" onClick={umschalten} aria-expanded={auf} aria-label={auf ? "Dein Training zuklappen" : "Dein Training aufklappen"}>
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 6 L8 10.5 L12.5 6" stroke={NACHT} strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {auf ? (
        <div className="sbb-papier offen"><Quickfinder gehe={gehe} setzeStufe={setzeStufe} links={titel} /></div>
      ) : (
        <button type="button" className="kopfzeile" onClick={umschalten}>
          <span><h2>Dein Training startet hier.</h2><p className="zeile">Tagesplan, Fortschritt, Übungsmodi. Alles an einem Ort.</p></span>
        </button>
      )}
    </div>
  );
}

/* Die 7 Mathe-Mythen: wie in A (Passwort „skript“), hier als Glasliste */
function Mythen() {
  const frei = useFrei();
  const [auf, setAuf] = useState(false);
  const [offen, setOffen] = useState(null);
  const [fragen, setFragen] = useState(false);
  const zu = !frei;
  return (
    <div className="sbb-karte" style={{ marginTop: 20, overflow: "hidden" }}>
      <button type="button" className="sbb-mythen-kopf" onClick={() => { if (zu) { setFragen(!fragen); return; } setAuf(!auf); if (auf) setOffen(null); }} aria-expanded={zu ? fragen : auf}
        aria-label={zu ? "Die 7 Mathe-Mythen – noch gesperrt, Passwort nötig" : undefined}>
        <span><b>Die 7 Mathe-Mythen</b><span>Sieben Sätze, die dich bremsen – und warum sie nicht stimmen.</span></span>
        {zu ? <SchlossZeichen /> : <span className="plus" aria-hidden="true" style={{ width: 40, height: 40, borderRadius: 999, background: GOLD, color: NACHT, display: "flex", alignItems: "center", justifyContent: "center", transform: auf ? "rotate(45deg)" : "none", transition: "transform .22s ease", flex: "none" }}><Plus /></span>}
      </button>
      {zu && fragen && <div style={{ padding: "0 14px 14px" }}><PasswortFeld onFrei={() => { setFragen(false); setAuf(true); }} /></div>}
      {!zu && auf && MYTHEN.map(([zeichen, titel, text], i) => {
        const o = offen === i;
        return (
          <div key={titel} className="sbb-mythos">
            <button type="button" onClick={() => setOffen(o ? null : i)} aria-expanded={o}>
              <span className="z" aria-hidden="true">{zeichen}</span>
              <b><span className="n">{i + 1}</span>{titel}</b>
              <span aria-hidden="true" style={{ color: GOLD, fontSize: 22, lineHeight: 1, transform: o ? "rotate(45deg)" : "none", transition: "transform .2s ease" }}>+</span>
            </button>
            {o && <p>{text}</p>}
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Umschalter A/B (sichtbar nach bewusster Wahl oder mit dem Passwort „skript“) ---------- */
export function useStartVariante() {
  const [v, setV] = useState(startVariante);
  useEffect(() => {
    const h = () => setV(startVariante());
    window.addEventListener(EVENT_START_VARIANTE, h);
    return () => window.removeEventListener(EVENT_START_VARIANTE, h);
  }, []);
  return v;
}

export function StartVarianteSchalter() {
  const v = useStartVariante();
  const [zeigen, setZeigen] = useState(() => startVarianteGewaehlt() || istFrei());
  useEffect(() => { setZeigen(startVarianteGewaehlt() || istFrei()); }, [v]);
  if (!zeigen) return null;
  return (
    <div className="sbb-schalter" role="group" aria-label="Startseite: Fassung wählen" data-kein-i18n>
      <style>{CSS}</style>
      <span className="lab">Startseite</span>
      {["a", "b"].map((k) => (
        <button key={k} type="button" aria-pressed={v === k} onClick={() => startVarianteSetzen(k)} aria-label={`Fassung ${k.toUpperCase()}`}>{k.toUpperCase()}</button>
      ))}
    </div>
  );
}

/* ====================================================================== */


export function StartseiteB({ gehe }) {
  const lernpfad = useLernpfad();
  const frei = useFrei();
  const [schulAuf, setSchulAuf] = useState(false);
  const [entdAuf, setEntdAuf] = useState(false);
  const [bereichAuf, setBereichAuf] = useState(null);
  const [etikett, setEtikett] = useState(null);
  const { stufe, setzen: stufeWaehlen, klasse } = useStartStufe();   // folgt der angegebenen Klasse (Konto, Quickfinder, Onboarding)
  const stufeSetzen = (w) => { stufeWaehlen(w); setBereichAuf(null); };
  const wurzel = useRef(null);

  /* Die ganze App-Fläche wird Nacht: Hintergrund und Fußknöpfe (Regeln oben in CSS) */
  useEffect(() => {
    document.documentElement.setAttribute("data-start-b", "1");
    return () => document.documentElement.removeAttribute("data-start-b");
  }, []);

  const bereiche = schulBereiche(stufe);

  return (
    <div className="sbb" ref={wurzel}>
      <style>{CSS}</style>
      <div className="sbb-raster" aria-hidden="true" />
      <div className="sbb-licht" aria-hidden="true"><span className="l1" /><span className="l2" /><span className="l3" /></div>

      {/* ---------- Bühne ---------- */}
      <section className="sbb-held" aria-label="Mythos Mathe">
        <HeldKurve />
        <div className="sbb-spalte sbb-held-text" style={{ paddingBottom: 0 }}>
          <h1>Mathe kann<span className="gold">jeder verstehen</span></h1>
          <p className="unter">Hier lernst du wie!</p>
          <ul>
            {["Mathe interaktiv entdecken", "Gezielt Aufgaben trainieren", "Rechenwege Schritt für Schritt", "In deinem Tempo lernen"].map((p) => (
              <li key={p}><Haken /><span>{p}</span></li>
            ))}
          </ul>
          <button type="button" className="sbb-start-knopf" onClick={() => gehe({ ansicht: "ki", ziel: null })}>
            Jetzt eine Aufgabe rechnen <span aria-hidden="true">→</span>
          </button>
        </div>
        <Band />
      </section>

      <div className="sbb-spalte">
        {/* ---------- Dein Training + Suche ---------- */}
        <div className="sbb-abschnitt"><TrainingKachel gehe={gehe} setzeStufe={stufeSetzen} /></div>
        <div className="sbb-papier eng" style={{ marginTop: 14 }}><SuchBox gehe={gehe} einzeilig /></div>
        <p className="sbb-einleitung">
          Hier wird Oberstufenmathe <b>sichtbar</b>: Graphen live plotten, Ebenen im Raum drehen, Wahrscheinlichkeiten in Tafeln und Bäumen sehen.
          Dazu Videokurse mit Kurz-Checks und schnelle Kopfrechenrunden. Such dir einen Bereich aus und leg los.
        </p>

        {/* ---------- 1 Heute ---------- */}
        <Zone nr="1" titel="Heute" zeile="Dein nächster Schritt – sofort gefunden." />
        <div className="sbb-wieder">
          <StartOnboarding gehe={gehe} setzeStufe={stufeSetzen} planDa={!!lernpfad} />
          <WeitermachenZeile gehe={gehe} />
        </div>

        {/* ---------- 2 Lernen ---------- */}
        <Zone nr="2" titel="Lernen" zeile="Alle Werkzeuge nach Bereich und Stufe." />
        <div className="sbb-raster2">
          <div className="sbb-breit">
            <HauptKachel auf={schulAuf} onClick={() => { setSchulAuf(!schulAuf); setEntdAuf(false); setBereichAuf(null); setEtikett(null); }}
              label={schulAuf ? "Schulmathematik zuklappen" : "Schulmathematik aufklappen"} logo={<SchulmatheLogoKlein />} titel="Schulmathematik"
              text={schulAuf ? "Funktionen, Vektoren, Wahrscheinlichkeit, Geometrie und Werkzeuge." : "Unter-, Mittel- und Oberstufe bis zum Abi: Funktionen, Vektoren, Wahrscheinlichkeitsrechnung, Geometrie, Werkzeuge."} />
            {schulAuf && (
              <div className="sbb-papier" data-aufklapp-inhalt>
                <SchulKopf gehe={gehe} mitWeiter={false} stufe={stufe} setzeStufe={stufeSetzen} klasse={klasse} etikett={etikett} setzeEtikett={(e) => { setEtikett(e); setBereichAuf(null); }} />
                <div style={{ marginTop: 12 }}>
                  {etikett ? (
                    bereiche.map((b) => {
                      const ws = blockEintraege(b, stufe, etikett).filter((e) => !e.kopf);
                      if (!ws.length) return null;
                      return (
                        <div key={b.id} style={{ marginTop: 14 }}>
                          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "0 2px 2px" }}>
                            <span style={{ fontSize: 15, fontWeight: 800, color: C.seeTief }}>{b.titel}</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: C.grau }}>{ws.length === 1 ? "1 Werkzeug" : `${ws.length} Werkzeuge`}</span>
                          </div>
                          <UnterMenue eintraege={ws} gehe={gehe} />
                        </div>
                      );
                    })
                  ) : bereiche.map((b) => {
                    const eintraege = blockEintraege(b, stufe, null);
                    if (!eintraege.length || (!b.eintraege && !b.kiste && !eintraege.some((e) => !e.kopf))) return null;
                    const offen = bereichAuf === b.id;
                    const text = bereichInhalt(b.id, stufe) || b.text;
                    return (
                      <React.Fragment key={b.id}>
                        <button type="button" className={b.gold ? "sbb-bereich gold" : "sbb-bereich"} onClick={() => setBereichAuf(offen ? null : b.id)} aria-expanded={offen}
                          aria-label={offen ? `${b.titel} zuklappen` : `${b.titel} aufklappen`}>
                          <span className="logo" aria-hidden="true">{b.logo}</span>
                          <span className="t"><b>{b.vorTitel && <span style={{ display: "inline", color: C.gruenDunkel, marginRight: 6 }}>{b.vorTitel}</span>}{b.titel}</b><span>{text}</span></span>
                          <span className="pf" aria-hidden="true"><PlusKlein /></span>
                        </button>
                        {offen && (
                          <div className="sbb-bereich-inhalt">
                            <UnterMenue eintraege={eintraege} gehe={gehe} linie={b.linie} />
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <MathildaKachel gehe={gehe} />
          <Kachel gehe={gehe} titel="Kopfrechnen" label="Kopfrechnen öffnen" logo={<HeadNumbersLogoKlein />} ziel={{ ansicht: "headnumbers" }} weiter="Trainieren"
            text="Einmaleins, Quadrat- und Kubikzahlen, schriftliches Rechnen und Brüche – bis alles sitzt." />
          <Kachel gehe={gehe} titel="Gleichungen" label="Gleichungen öffnen" logo={<GleichKursLogoKlein />} ziel={{ ansicht: "gleichkurs" }} weiter="Üben"
            text="Eine Zahl finden, über die du etwas weißt – verstehen, Schritt für Schritt rechnen, trainieren." />
          <Kachel gehe={gehe} gesperrt keinI18n titel="Ebbinghaus" label="Ebbinghaus öffnen" logo={<EbbinghausLogoKlein />} extra={<EbbinghausBadge />} ziel={{ ansicht: "ebbinghaus" }}
            text={EBB_SLOGAN} />
        </div>

        {/* ---------- 3 Entdecken ---------- */}
        <Zone nr="3" titel="Entdecken" zeile="Herleiten, Kurse, Mathilda und Pen & Paper." />
        <HauptKachel auf={entdAuf} onClick={() => { setEntdAuf(!entdAuf); setSchulAuf(false); setBereichAuf(null); }}
          label={entdAuf ? "Mathe entdecken zuklappen" : "Mathe entdecken aufklappen"} logo={<EntdeckenLogoKlein />} titel="Mathe entdecken"
          text={entdAuf ? "Herleiten, entdecken, Wettbewerbe." : "Muster erkennen, Formeln selbst herleiten – und Mathe-Wettbewerbe."} />
        {entdAuf && <div className="sbb-papier" data-aufklapp-inhalt><UnterMenue eintraege={ENTDECKEN_MENUE} gehe={gehe} /></div>}

        {/* Das System */}
        <Kopf titel="Erst sauber schreiben lernen. Dann trainieren, bis es sitzt." />
        <p className="sbb-text">Die meisten Fehler in Klausuren entstehen nicht im Kopf, sondern auf dem Blatt.</p>
        <p className="sbb-text">Pen & Paper ist der Kurs dazu: ein Schritt pro Zeile, Gleichheitszeichen untereinander.</p>
        <p className="sbb-text"><MathildaName dunkel /> ist das Training dazu: Du fotografierst dein Blatt, Mathilda prüft die Rechnung und zeigt dir die Stelle, an der dein Weg bricht.</p>
        <p className="sbb-text stark">So entsteht ein Kreislauf: lernen, schreiben, prüfen lassen, verbessern. Aus einer Regel wird eine Gewohnheit – und aus der Gewohnheit Sicherheit in der Klausur.</p>
        <div className="sbb-system">
          <button type="button" className="sbb-karte sbb-schritt" onClick={() => gehe({ ansicht: "penpaperkurs" })} aria-label="Pen & Paper Kurs öffnen">
            <span className="nr">Schritt 1: Lernen</span>
            <h3>Pen & Paper</h3>
            <p>Klar aufschreiben, strukturiert arbeiten, sicher mit Fehlern umgehen.</p>
            <span className="bild" aria-hidden="true"><PenPaperBlatt /></span>
            <span className="knopf">Kurs öffnen</span>
          </button>
          <button type="button" className="sbb-karte sbb-schritt sbb-gold" onClick={() => gehe({ ansicht: "analyse", foto: "blatt" })} aria-label="Mathilda AI öffnen – mit KI lernen">
            <span className="nr">Schritt 2: Trainieren</span>
            <h3><MathildaName dunkel /></h3>
            <p>Foto vom Blatt – Mathilda prüft deinen Weg und zeigt dir den nächsten Hebel.</p>
            <span className="bild" aria-hidden="true"><MathildaLogoKlein /></span>
            <span className="knopf gold">Mit KI lernen</span>
          </button>
          <span className="sbb-verbinder" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 16 16"><path d="M3 8 H12.5 M8.5 4 L12.5 8 L8.5 12" stroke={NACHT} strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
        </div>

        {/* Elternabend (wie in A: ohne Angebot nur nach Passwort) */}
        {(ANGEBOT.elternabend || frei) && <div className="sbb-wieder"><ElternabendKachel gesperrt={!frei} onClick={() => gehe({ ansicht: "elternabend" })} /></div>}
        {ZEIGE_GESPERRTE && (
          <div className="sbb-wieder">
            <MatheCheckenKachel gesperrt onClick={() => gehe({ ansicht: "mathecheck" })} />
            <MasterclassKachel gesperrt onClick={() => gehe({ ansicht: "masterclass" })} />
            <MathCreatorKachel />
          </div>
        )}

        {/* Kurse */}
        <Kopf titel="Jeder Kurs ein Baustein, zusammen ein System" />
        <p className="sbb-text" style={{ marginBottom: 20 }}>
          {ANGEBOT.kurse
            ? "Hinter den sieben Mathe-Mythen steckt dieselbe Lücke: Es fehlt nicht an Begabung, sondern an einer Arbeitsweise. Die Kurse unten schließen sie Stück für Stück. Der Mathe-Mindset-Kurs räumt das Denken auf, Kopfrechnen macht Zahlen schnell und sicher, und Ebbinghaus sorgt dafür, dass Gelerntes im richtigen Abstand wiederkommt und bleibt. Die Videokurse und die Masterclass führen dich danach Schritt für Schritt durch den Stoff bis zum Abitur."
            : "Hinter den sieben Mathe-Mythen steckt dieselbe Lücke: Es fehlt nicht an Begabung, sondern an einer Arbeitsweise. Die Kurse unten schließen sie Stück für Stück. Der Mathe-Mindset-Kurs räumt das Denken auf, Kopfrechnen macht Zahlen schnell und sicher, und Ebbinghaus sorgt dafür, dass Gelerntes im richtigen Abstand wiederkommt und bleibt. Die Kurse zur Differentialrechnung sowie zu Vektoren, Geraden und Ebenen führen dich danach Schritt für Schritt durch den Stoff bis zum Abitur."}
        </p>
        <div className="sbb-raster2">
          <Kachel gehe={gehe} titel="Mathe-Mindset-Kurs" label="Mathe-Mindset-Kurs öffnen" logo={<ElternkursLogoKlein />} ziel={{ ansicht: "elternkurs" }} weiter="Kurs öffnen"
            text="6 TED-Talks und 2 Bücher, die inspirieren, wie Mathe auch funktionieren kann." />
          <Kachel gehe={gehe} gesperrt titel="Videokurse" label="Videokurse öffnen" logo={<SchulkurseLogoKlein />} ziel={{ ansicht: "kurse" }}
            text="Analysis 1–5, Vektoren und Stochastik – mit Videolektionen und Checks." />
        </div>
        <div className="sbb-wieder">
          <DiffKursKachel onClick={() => gehe({ ansicht: "diffkurs" })} />
          <VekKursKachel onClick={() => gehe({ ansicht: "vekkurs" })} />
          <GfsKursKachel onClick={() => gehe({ ansicht: "gfs" })} />
          <ClaudeKursKachel kurs="ki" onClick={() => gehe({ ansicht: "kiwahl" })} />
        </div>
        <div className="sbb-pille">
          <button type="button" data-start-efunktion onClick={() => gehe({ ansicht: "efunktion" })}>
            <i aria-hidden="true" />Minikurs: Die e-Funktion<span aria-hidden="true">→</span>
          </button>
        </div>
        {(ANGEBOT.kurse || frei) && <div className="sbb-wieder"><MasterclassKachel name="Mathe Masterclass" monate="3 MONATE" knopf="Zum Kursbereich" onClick={() => gehe({ ansicht: "mckurs" })} /></div>}

        {/* Mythen */}
        <Kopf titel="Mathetalent ist ein Mythos. Ein System kann man lernen." />
        <p className="sbb-text">Hinter guten Mathenoten steckt kein besonderes Gehirn, sondern eine Arbeitsweise. Die Kurse bauen sie Schritt für Schritt auf: wie du denkst, wie du rechnest, wie du schreibst und wie du Gelerntes behältst.</p>
        <p className="sbb-text">Jeder Kurs ist für sich nutzbar. Zusammen ergeben sie das System, mit dem Mythos Mathe Gymnasiasten von Klasse 8 bis zum Abitur begleitet.</p>
        <Mythen />

        {/* Dein Plan, Anleitung, Spenden – wie in A auf weißen Blättern bzw. in Blau */}
        <div className="sbb-wieder" style={{ marginTop: 22 }}><DeinPlanBlock gehe={gehe} /></div>
        <div className="sbb-wieder"><AppAnleitung /></div>
        <div className="sbb-wieder"><SpendenBereich gehe={gehe} /></div>
      </div>
    </div>
  );
}
