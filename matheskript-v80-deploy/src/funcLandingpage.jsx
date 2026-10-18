import React, { useEffect, useState } from "react";
import "@fontsource/caveat/600.css";
import "@fontsource/caveat/700.css";
import { COACHING } from "./base3.jsx";
import { M } from "./func3.jsx";
import { ELTERNABEND } from "./funcElternabend.jsx";
import { PerformanceLab } from "./funcPerformanceLab.jsx";
import { MathildaName } from "./mathildaName.jsx";
import { PenPaperBlatt } from "./func1.jsx";
import { ElternkursLogoKlein, MathildaLogoKlein, SchulmatheLogoKlein } from "./func2.jsx";
import { AdvancedLogoKlein } from "./func12.jsx";
import { VektorenLogoKlein } from "./func16.jsx";
import { StochastikLogoKlein } from "./func17.jsx";
import { EbbinghausLogoKlein } from "./funcEbbinghaus.jsx";
import { GleichungenLogoKlein } from "./funcGleichungen.jsx";
import { HeadNumbersLogoKlein } from "./funcHeadNumbersLogo.jsx";

import { springe } from "./sprung.js";
/* ======================================================================
   LANDINGPAGE  (Adresse: /landingpage, ältere Links #landingpage funktionieren weiter) – offen erreichbar, ohne Passwort.

   Dramaturgie: Blockbuster-StorySkript (Alexander Christiani). Der Schüler ist der Held,
   Basti ist der Mentor. Fünf Schritte, jeder mit drei Unterpunkten:

     1. HELD      Identität · Wunsch · Einsatz                → Kopf + Vertrauensleiste
     2. PROBLEM   äußeres · inneres · Gegenspieler (Mythos)  → „Kennst du das?“ in drei Ebenen
     3. MENTOR    Empathie · Autorität · Haltung              → Geschichte 2 → 1,0, Über mich
     4. LÖSUNG    3-Schritte-Plan · Versprechen · Werkzeuge   → Plan, sechs Stellschrauben, MathildaAI,
                                                                Angebote, Für wen, Stimmen, Vorher/Nachher
     5. REISE     Handlung · Erfolg · Scheitern               → Zwei Wege, Ablauf Erstgespräch, Fragen, Abschluss

   Layout nach Baulig-Vorbild: ein direkter Knopf (Erstgespräch) im Kopf, nach der Lösung und am Schluss,
   auf dem Handy zusätzlich als feste Leiste; ein Übergangs-Knopf (Werkzeuge kostenlos testen) für Unentschlossene.
   Das eine auffällige Element bleibt der durchgestrichene Mythos auf Karopapier.

   Kontakt: Terminlink oder Mail stehen in base3.jsx unter COACHING. Solange beides leer ist,
   erklären die Knöpfe ehrlich, dass die Buchung noch nicht freigeschaltet ist.
   Fakten nur aus vorhandenen Quellen – keine erfundenen Zahlen, Zitate, Siegel oder Bewertungen.
   ====================================================================== */

export { LANDING } from "./seitenKonstanten.js";

const F = {
  nacht: "#0E1E4A", nachtTief: "#091535", see: "#004D98", seeHell: "#5B8FD1",
  gold: "#EDBB00", goldText: "#8A6500", papier: "#F8FAFD", karo: "#D7E1F0",
  tinte: "#0F1A33", himmel: "#E8EFF9", grau: "#4B5675", still: "#6B7590", linie: "#E1E7F1", rot: "#C8372D", weiss: "#FFFFFF",
  blauText: "#C9D6EE", gruen: "#1F8A5B",
};

/* ---------------------------------------------------------------- Stile */
const CSS = `
.lp { font-family: Montserrat, system-ui, sans-serif; color: ${F.tinte}; background: ${F.papier}; }
.lp *, .lp *::before, .lp *::after { box-sizing: border-box; }
.lp-innen { width: 100%; max-width: 1120px; margin: 0 auto; padding: 0 24px; }
.lp-schmal { max-width: 768px; }
.lp-sektion { padding: clamp(64px, 9vw, 112px) 0; }
.lp-dunkel { background: ${F.nacht}; color: ${F.weiss}; }
:where(.lp) :where(h1, h2, h3, p, ol, ul, dl, dd) { margin: 0; }
.lp-h1 { font-size: clamp(40px, 6.8vw, 76px); font-weight: 800; letter-spacing: -0.045em; line-height: 0.98; }
.lp-h2 { font-size: clamp(30px, 4.4vw, 48px); font-weight: 800; letter-spacing: -0.035em; line-height: 1.06; }
.lp-h3 { font-size: 20px; font-weight: 700; letter-spacing: -0.015em; line-height: 1.3; }
.lp-lead { font-size: clamp(18px, 2vw, 21px); font-weight: 400; line-height: 1.6; }
.lp-text { font-size: 17px; font-weight: 400; line-height: 1.72; color: ${F.grau}; }
.lp-dunkel .lp-text { color: ${F.blauText}; }
.lp-klein { font-size: 14.5px; line-height: 1.6; color: ${F.still}; }
.lp-kicker { display: inline-block; font-size: 12.5px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: ${F.goldText}; margin-bottom: 16px; }
.lp-dunkel .lp-kicker { color: ${F.gold}; }
.lp-mark { background: linear-gradient(transparent 62%, rgba(237,187,0,0.55) 62%); padding: 0 0.08em; }
.lp-dunkel .lp-mark { color: ${F.gold}; background: none; }
.lp-raster-2 { display: grid; gap: clamp(40px, 5vw, 72px); grid-template-columns: minmax(0, 1fr); align-items: center; }
@media (min-width: 900px) { .lp-raster-2 { grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr); } }
.lp-mitte { text-align: center; margin-left: auto; margin-right: auto; }

/* Knöpfe */
.lp-knopf { display: inline-flex; align-items: center; justify-content: center; min-height: 54px; padding: 0 30px; border-radius: 999px;
  font: 700 16px/1.1 Montserrat, system-ui, sans-serif; cursor: pointer; border: 2px solid transparent; text-decoration: none;
  transition: transform .15s ease, background .15s ease, color .15s ease, border-color .15s ease, box-shadow .15s ease; }
.lp-knopf:hover { transform: translateY(-1px); }
.lp-knopf:focus-visible, .lp a:focus-visible, .lp button:focus-visible, .lp summary:focus-visible { outline: 3px solid ${F.gold}; outline-offset: 3px; }
.lp-gold { background: ${F.gold}; color: ${F.nacht}; box-shadow: 0 10px 28px rgba(237,187,0,0.28); }
.lp-gold:hover { background: #FFD02E; box-shadow: 0 14px 32px rgba(237,187,0,0.36); }
.lp-rand-hell { background: transparent; color: ${F.weiss}; border-color: rgba(255,255,255,0.4); }
.lp-rand-hell:hover { border-color: ${F.weiss}; }
.lp-rand-dunkel { background: transparent; color: ${F.nacht}; border-color: rgba(14,30,74,0.22); }
.lp-rand-dunkel:hover { border-color: ${F.nacht}; }
.lp-knopf-gross { min-height: 62px; padding: 0 38px; font-size: 17.5px; }
.lp-unter { display: block; margin-top: 12px; font-size: 13.5px; color: ${F.still}; }
.lp-dunkel .lp-unter { color: ${F.blauText}; }
.lp-link { background: none; border: none; padding: 0; cursor: pointer; text-align: left; font: 700 15px/1.4 Montserrat, system-ui, sans-serif; color: ${F.see};
  text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 4px; text-decoration-color: rgba(0,77,152,0.3); min-height: 32px; }
.lp-link:hover { text-decoration-color: ${F.see}; }
.lp-dunkel .lp-link { color: ${F.gold}; text-decoration-color: rgba(237,187,0,0.4); }
.lp-cta-reihe { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }

/* Kopf */
.lp-kopf { background: radial-gradient(120% 90% at 85% 0%, #17306E 0%, ${F.nacht} 48%, ${F.nachtTief} 100%); color: ${F.weiss};
  padding: clamp(44px, 7vw, 96px) 0 clamp(56px, 7vw, 88px); overflow: hidden; }
.lp-kopf .lp-lead { color: ${F.blauText}; max-width: 34em; margin-top: 26px; }
.lp-kopf .lp-kicker { color: ${F.gold}; }
.lp-autor { margin-top: 28px; font-size: 14.5px; color: ${F.blauText}; line-height: 1.6; max-width: 34em; }
.lp-autor b { color: ${F.weiss}; font-weight: 600; }

/* Vertrauensleiste */
.lp-vertrauen { background: ${F.nachtTief}; color: ${F.blauText}; border-top: 1px solid rgba(255,255,255,0.08); }
.lp-vertrauen .lp-innen { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px 24px; padding-top: 22px; padding-bottom: 22px; }
@media (min-width: 800px) { .lp-vertrauen .lp-innen { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.lp-vertrauen b { display: block; color: ${F.weiss}; font-size: 17px; font-weight: 800; letter-spacing: -0.01em; }
.lp-vertrauen span { display: block; font-size: 13px; margin-top: 3px; line-height: 1.45; }

/* Karoblatt mit Rechenweg */
.lp-blatt { position: relative; background-color: #FDFEFF; border-radius: 6px; padding: 44px 20px 44px 62px;
  background-image: linear-gradient(${F.karo} 1px, transparent 1px), linear-gradient(90deg, ${F.karo} 1px, transparent 1px);
  background-size: 26px 26px; background-position: -1px -1px;
  box-shadow: 0 30px 60px rgba(3,10,30,0.45); transform: rotate(-1.6deg); width: 100%; max-width: 500px; margin: 0 auto; }
.lp-blatt::before { content: ""; position: absolute; top: 0; bottom: 0; left: 44px; width: 2px; background: rgba(200,55,45,0.35); }
.lp-hand { font-family: Caveat, 'Bradley Hand', 'Segoe Print', cursive; color: #1C2A55; font-weight: 600; font-size: clamp(27px, 7.4vw, 44px); line-height: 1.15; }
@media (min-width: 900px) { .lp-hand { font-size: clamp(32px, 3.4vw, 48px); } }
.lp-zeile-block { display: block; }
.lp-zeile-block + .lp-zeile-block { margin-top: 20px; }
.lp-zeile { position: relative; display: inline-block; white-space: nowrap; }
.lp-strich { position: absolute; left: -6px; right: -10px; top: 50%; height: 0; }
.lp-strich svg { position: absolute; left: 0; top: -14px; width: 100%; height: 28px; overflow: visible; }
.lp-strich path { stroke: ${F.rot}; stroke-width: 4; fill: none; stroke-linecap: round; stroke-dasharray: 520; stroke-dashoffset: 520; animation: lpStrich .7s .9s cubic-bezier(.6,.1,.3,1) forwards; }
.lp-notiz { position: absolute; right: 16px; top: 2px; font-family: Caveat, cursive; color: ${F.rot}; font-size: clamp(21px, 5.6vw, 26px); font-weight: 700; transform: rotate(-6deg); opacity: 0; animation: lpAuf .4s 1.5s ease forwards; }
.lp-ergebnis svg { position: absolute; left: -4px; bottom: -16px; width: calc(100% + 8px); height: 16px; overflow: visible; }
.lp-ergebnis path { stroke: ${F.gold}; stroke-width: 3.5; fill: none; stroke-linecap: round; stroke-dasharray: 300; stroke-dashoffset: 300; animation: lpStrich .6s 2.9s ease-out forwards; }
.lp-z1 { animation: lpSchreib .7s .15s steps(14, end) both; }
.lp-z2 { animation: lpSchreib .9s 1.75s steps(22, end) both; }
.lp-z3 { animation: lpSchreib .5s 2.5s steps(9, end) both; }
@keyframes lpSchreib { from { clip-path: inset(-20px 100% -30px -80px); } to { clip-path: inset(-20px -20px -30px -80px); } }
@keyframes lpStrich { to { stroke-dashoffset: 0; } }
@keyframes lpAuf { to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) {
  .lp-z1, .lp-z2, .lp-z3, .lp-notiz { animation: none; opacity: 1; clip-path: none; }
  .lp-strich path, .lp-ergebnis path { animation: none; stroke-dashoffset: 0; }
  .lp-knopf { transition: none; }
}

/* Problem in drei Ebenen */
.lp-ebenen { display: grid; grid-template-columns: minmax(0, 1fr); gap: 16px; margin-top: 48px; }
@media (min-width: 900px) { .lp-ebenen { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; } }
.lp-ebene { background: ${F.weiss}; border: 1px solid ${F.linie}; border-radius: 22px; padding: 28px 26px 26px; display: flex; flex-direction: column; }
.lp-ebene-nr { font-size: 12.5px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: ${F.still}; }
.lp-ebene q { display: block; quotes: "„" "“"; font-size: clamp(21px, 2.4vw, 25px); font-weight: 700; letter-spacing: -0.02em; line-height: 1.25; color: ${F.tinte}; margin: 14px 0 14px; }
.lp-ebene-gegner { background: ${F.nacht}; color: ${F.weiss}; border-color: ${F.nacht}; }
.lp-ebene-gegner .lp-ebene-nr { color: ${F.gold}; }
.lp-ebene-gegner q { color: ${F.weiss}; }
.lp-ebene-gegner .lp-text { color: ${F.blauText}; }
.lp-fazit { margin-top: 40px; font-size: clamp(21px, 2.6vw, 27px); font-weight: 700; line-height: 1.4; letter-spacing: -0.015em; max-width: 30em; }

/* Zeitleiste */
.lp-zeit { list-style: none; padding: 0; margin-top: 56px; display: grid; grid-template-columns: 1fr; }
.lp-zeit li { position: relative; padding: 0 0 40px 44px; }
.lp-zeit li::before { content: ""; position: absolute; left: 9px; top: 14px; bottom: -6px; width: 2px; background: ${F.linie}; }
.lp-zeit li:last-child::before { display: none; }
.lp-punkt { position: absolute; left: 0; top: 4px; width: 20px; height: 20px; border-radius: 50%; background: ${F.weiss}; border: 3px solid ${F.still}; }
.lp-zeit li.lp-ziel .lp-punkt { border-color: ${F.gold}; background: ${F.gold}; }
.lp-note { font-size: clamp(56px, 7vw, 80px); font-weight: 800; letter-spacing: -0.05em; line-height: 1; }
.lp-wann { font-size: 14px; font-weight: 700; color: ${F.still}; margin-bottom: 10px; }
@media (min-width: 900px) {
  .lp-zeit { grid-template-columns: repeat(3, 1fr); gap: 40px; }
  .lp-zeit li { padding: 44px 0 0 0; }
  .lp-zeit li::before { left: 24px; right: -40px; top: 9px; bottom: auto; width: auto; height: 2px; }
  .lp-punkt { top: 0; }
}
.lp-anstieg { display: block; width: clamp(84px, 9vw, 112px); height: auto; margin: 2px 0 6px; }

/* Mentor-Belege */
.lp-belege { display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; margin-top: 40px; }
@media (min-width: 700px) { .lp-belege { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.lp-beleg { border-top: 3px solid ${F.gold}; padding-top: 16px; }
.lp-beleg b { display: block; font-size: 16.5px; font-weight: 800; letter-spacing: -0.01em; }
.lp-beleg span { display: block; font-size: 14.5px; line-height: 1.55; color: ${F.grau}; margin-top: 6px; }

/* 3-Schritte-Plan */
.lp-plan { list-style: none; padding: 0; margin-top: 48px; display: grid; grid-template-columns: minmax(0, 1fr); gap: 16px; counter-reset: p; }
@media (min-width: 900px) { .lp-plan { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; } }
.lp-plan li { counter-increment: p; position: relative; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12); border-radius: 22px; padding: 30px 26px 28px; }
.lp-plan li::before { content: counter(p); display: inline-flex; width: 48px; height: 48px; border-radius: 50%; background: ${F.gold}; color: ${F.nacht};
  align-items: center; justify-content: center; font-size: 20px; font-weight: 800; margin-bottom: 20px; }
.lp-plan h3 { color: ${F.weiss}; }
.lp-plan .lp-text { margin-top: 10px; font-size: 15.5px; line-height: 1.65; }
.lp-versprechen { margin-top: 40px; display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; }
@media (min-width: 700px) { .lp-versprechen { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.lp-versprechen div { display: flex; gap: 12px; align-items: flex-start; font-size: 15px; line-height: 1.55; color: ${F.blauText}; }
.lp-haken { flex-shrink: 0; width: 22px; height: 22px; border-radius: 50%; background: ${F.gold}; display: inline-flex; align-items: center; justify-content: center; margin-top: 1px; }

/* System: Kacheln mit den Logos der App */
.lp-methoden { display: grid; grid-template-columns: minmax(0, 1fr); gap: 16px; margin-top: 48px; }
@media (min-width: 700px) { .lp-methoden { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; } }
@media (min-width: 1040px) { .lp-methoden { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.lp-methode { display: flex; flex-direction: column; background: ${F.weiss}; border: 1px solid ${F.linie}; border-radius: 22px; overflow: hidden; }
.lp-methode-bild { position: relative; height: 168px; padding: 10px 18px; background: radial-gradient(120% 120% at 80% 0%, #17306E 0%, ${F.nacht} 60%, ${F.nachtTief} 100%); }
.lp-methode-text { padding: 22px 24px 24px; display: flex; flex-direction: column; flex: 1; }
.lp-methode-text .lp-link { margin-top: auto; padding-top: 14px; align-self: flex-start; }
@media (max-width: 699px) {
  .lp-wisch { display: flex; gap: 14px; overflow-x: auto; scroll-snap-type: x mandatory; margin-left: -24px; margin-right: -24px;
    padding: 0 24px 10px; scroll-padding-left: 24px; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
  .lp-wisch::-webkit-scrollbar { display: none; }
  .lp-wisch > * { flex: 0 0 82%; scroll-snap-align: start; }
  .lp-methode-bild { height: 150px; }
}
.lp-wisch-hinweis { display: none; }
@media (max-width: 699px) { .lp-wisch-hinweis { display: block; margin-top: 14px; font-size: 13.5px; color: ${F.still}; } }

/* MathildaAI */
.lp-schritte { list-style: none; counter-reset: s; padding: 0; margin-top: 32px; display: grid; gap: 18px; }
.lp-schritte li { counter-increment: s; display: grid; grid-template-columns: 34px minmax(0, 1fr); gap: 14px; align-items: start; }
.lp-schritte li::before { content: counter(s); width: 30px; height: 30px; border-radius: 50%; border: 2px solid ${F.gold}; color: ${F.gold};
  display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13.5px; margin-top: 1px; }
.lp-pruefung { background: #FDFEFF; color: ${F.tinte}; border-radius: 20px; padding: 26px 22px; box-shadow: 0 24px 50px rgba(0,0,0,0.35); }
.lp-pz { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 12px; font-size: 21px; overflow-x: auto; }
.lp-pz + .lp-pz { margin-top: 6px; }
.lp-pz-nr { font-size: 12px; font-weight: 700; color: ${F.still}; width: 16px; flex-shrink: 0; }
.lp-pz-fehler { background: #FCEDEB; box-shadow: inset 3px 0 0 ${F.rot}; }
.lp-pz-folge { opacity: 0.45; }

/* Angebote */
.lp-angebote { display: grid; grid-template-columns: minmax(0, 1fr); gap: 20px; margin-top: 48px; }
@media (min-width: 900px) { .lp-angebote { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.lp-angebot { position: relative; border-radius: 26px; padding: clamp(28px, 4vw, 40px); display: flex; flex-direction: column; }
.lp-angebot-kopf { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
.lp-dauer { display: inline-block; font-size: 12.5px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; padding: 7px 12px; border-radius: 999px; }
.lp-fuerwen { font-size: 14px; font-weight: 600; margin-top: 16px; }
.lp-angebot ul { list-style: none; padding: 0; margin: 22px 0 30px; display: grid; gap: 12px; }
.lp-angebot li { position: relative; padding-left: 32px; font-size: 15.5px; line-height: 1.55; }
.lp-angebot li::before { content: ""; position: absolute; left: 0; top: 2px; width: 20px; height: 20px; border-radius: 50%; background: currentColor; opacity: 0.12; }
.lp-angebot li::after { content: ""; position: absolute; left: 6px; top: 8px; width: 8px; height: 5px; border-left: 2px solid currentColor; border-bottom: 2px solid currentColor; transform: rotate(-45deg); }
.lp-empfehlung { position: absolute; top: -14px; right: 24px; background: ${F.gold}; color: ${F.nacht}; font-size: 12px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; padding: 7px 14px; border-radius: 999px; box-shadow: 0 8px 20px rgba(237,187,0,0.35); }
.lp-eltern-reihe { display: grid; grid-template-columns: minmax(0, 1fr); gap: 20px; margin-top: 20px; }
@media (min-width: 900px) { .lp-eltern-reihe { grid-template-columns: minmax(0, 1.25fr) minmax(0, 0.75fr); } }
.lp-eltern { background: radial-gradient(120% 140% at 85% 10%, #2A2210 0%, #0E0C08 55%, #050404 100%); color: ${F.weiss}; border-radius: 26px; padding: clamp(28px, 4vw, 40px); }
.lp-eltern .lp-text { color: #D8D2C2; }
.lp-eltern dl { margin: 24px 0 0; display: grid; gap: 14px; }
.lp-eltern dt { font-size: 12.5px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: ${F.gold}; }
.lp-eltern dd { margin: 4px 0 0; font-size: 15.5px; line-height: 1.5; }

/* Werkzeuge */
.lp-werkzeuge { display: grid; grid-template-columns: minmax(0, 1fr); gap: 40px; margin-top: 48px; }
@media (min-width: 640px) { .lp-werkzeuge { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (min-width: 1000px) { .lp-werkzeuge { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 32px; } }
.lp-bereich-bild { height: 124px; border-radius: 16px; padding: 8px 14px; margin-bottom: 18px; background: radial-gradient(120% 120% at 80% 0%, #17306E 0%, ${F.nacht} 60%, ${F.nachtTief} 100%); }
@media (max-width: 560px) { .lp-bereich-bild { height: 92px; padding: 6px 8px; margin-bottom: 12px; } }
.lp-bereich h3 { font-size: 15px; font-weight: 800; color: ${F.tinte}; padding-bottom: 12px; border-bottom: 2px solid ${F.nacht}; margin-bottom: 2px; }
.lp-werkzeug { display: block; width: 100%; text-align: left; background: none; border: none; border-bottom: 1px solid ${F.linie}; padding: 14px 0; cursor: pointer; font-family: inherit; }
.lp-werkzeug b { display: block; font-size: 15.5px; font-weight: 700; color: ${F.tinte}; }
.lp-werkzeug span { display: block; font-size: 13.5px; color: ${F.still}; margin-top: 3px; line-height: 1.45; }
.lp-werkzeug:hover b { color: ${F.see}; }

/* Für wen / nicht für wen */
.lp-passt { display: grid; grid-template-columns: minmax(0, 1fr); gap: 16px; margin-top: 44px; }
@media (min-width: 800px) { .lp-passt { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; } }
.lp-passt > div { background: ${F.weiss}; border: 1px solid ${F.linie}; border-radius: 22px; padding: 28px 26px; }
.lp-passt h3 { font-size: 17px; font-weight: 800; letter-spacing: -0.01em; }
.lp-passt ul { list-style: none; padding: 0; margin: 18px 0 0; display: grid; gap: 12px; }
.lp-passt li { display: flex; gap: 12px; align-items: flex-start; font-size: 15.5px; line-height: 1.55; color: ${F.grau}; }
.lp-passt li svg { flex-shrink: 0; margin-top: 2px; }

/* Stimmen */
.lp-stimmen { display: grid; grid-template-columns: minmax(0, 1fr); gap: 20px; margin-top: 40px; }
@media (min-width: 900px) { .lp-stimmen { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; } }
.lp-stimme { position: relative; display: flex; flex-direction: column; margin: 0; background: ${F.weiss}; border: 1px solid ${F.linie}; border-radius: 24px; padding: 32px 28px 28px; }
.lp-stimme blockquote { margin: 0; font-size: 18px; font-weight: 500; line-height: 1.6; letter-spacing: -0.005em; color: ${F.tinte}; }
.lp-stimme blockquote::before { content: "„"; display: block; font-size: 64px; font-weight: 800; line-height: 0.6; color: ${F.gold}; margin-bottom: 14px; }
.lp-stimme figcaption { display: flex; align-items: center; gap: 14px; margin-top: auto; padding-top: 24px; }
.lp-avatar { width: 52px; height: 52px; border-radius: 50%; flex-shrink: 0; object-fit: cover; background: ${F.himmel}; display: flex; align-items: center; justify-content: center; }
.lp-beispiel { position: absolute; top: 18px; right: 18px; font-size: 12px; font-weight: 700; color: ${F.goldText}; background: #FFF6D6; border: 1px dashed ${F.goldText}; border-radius: 999px; padding: 4px 10px; }

/* Vorher / Nachher */
.lp-wandel { margin-top: 44px; border: 1px solid ${F.linie}; border-radius: 22px; overflow: hidden; background: ${F.weiss}; }
.lp-wandel-kopf, .lp-wandel-zeile { display: grid; grid-template-columns: 1fr 1fr; }
.lp-wandel-kopf p { padding: 14px 20px; font-size: 12.5px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; }
.lp-wandel-zeile p { padding: 16px 20px; font-size: 15.5px; line-height: 1.5; border-top: 1px solid ${F.linie}; }
.lp-wandel-zeile p + p { border-left: 1px solid ${F.linie}; font-weight: 600; color: ${F.tinte}; }
.lp-wandel-zeile p:first-child { color: ${F.still}; }
@media (max-width: 560px) { .lp-wandel-zeile p, .lp-wandel-kopf p { padding-left: 14px; padding-right: 14px; font-size: 14px; } }

/* Zwei Wege */
.lp-wege { display: grid; grid-template-columns: minmax(0, 1fr); gap: 16px; margin-top: 48px; }
@media (min-width: 800px) { .lp-wege { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; } }
.lp-weg { border-radius: 24px; padding: clamp(26px, 4vw, 36px); }
.lp-weg-grau { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12); color: ${F.blauText}; }
.lp-weg-gold { background: ${F.gold}; color: ${F.nacht}; }
.lp-weg h3 { font-size: 22px; font-weight: 800; letter-spacing: -0.02em; }
.lp-weg ul { list-style: none; padding: 0; margin: 18px 0 0; display: grid; gap: 10px; }
.lp-weg li { position: relative; padding-left: 22px; font-size: 15.5px; line-height: 1.55; }
.lp-weg li::before { content: ""; position: absolute; left: 0; top: 11px; width: 10px; height: 2px; background: currentColor; opacity: 0.6; }
.lp-weg-gold li::before { background: ${F.nacht}; }
.lp-weg-grau h3 { color: ${F.weiss}; }

/* Ablauf Erstgespräch */
.lp-ablauf { list-style: none; counter-reset: a; padding: 0; margin-top: 40px; display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; }
@media (min-width: 800px) { .lp-ablauf { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; } }
.lp-ablauf li { counter-increment: a; display: grid; grid-template-columns: 40px minmax(0, 1fr); gap: 14px; background: ${F.weiss}; border: 1px solid ${F.linie}; border-radius: 20px; padding: 22px 22px 22px 20px; }
.lp-ablauf li::before { content: counter(a); width: 36px; height: 36px; border-radius: 50%; border: 2px solid ${F.nacht}; color: ${F.nacht}; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 15px; }
.lp-ablauf b { display: block; font-size: 16px; font-weight: 800; letter-spacing: -0.01em; }
.lp-ablauf span { display: block; font-size: 14.5px; line-height: 1.55; color: ${F.grau}; margin-top: 5px; }

/* Über mich mit Foto */
.lp-ueber { display: grid; gap: 40px; grid-template-columns: minmax(0, 1fr); align-items: center; }
@media (min-width: 900px) { .lp-ueber { grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr); gap: 72px; } }
.lp-foto { width: 100%; max-width: 420px; aspect-ratio: 4 / 5; object-fit: cover; border-radius: 24px; box-shadow: 0 24px 48px rgba(14,30,74,0.18); }

/* Fragen */
.lp-frage { border-bottom: 1px solid ${F.linie}; }
.lp-frage summary { list-style: none; cursor: pointer; padding: 22px 44px 22px 0; position: relative; font-size: 18px; font-weight: 700; letter-spacing: -0.01em; line-height: 1.4; }
.lp-frage summary::-webkit-details-marker { display: none; }
.lp-frage summary::before, .lp-frage summary::after { content: ""; position: absolute; right: 8px; top: 50%; width: 16px; height: 2px; background: ${F.see}; border-radius: 2px; transition: transform .2s ease; }
.lp-frage summary::after { transform: rotate(90deg); }
.lp-frage[open] summary::after { transform: rotate(0deg); }
.lp-frage p { padding: 0 0 24px; }

.lp-hinweis { margin-top: 18px; font-size: 14.5px; line-height: 1.6; max-width: 34em; }

/* Feste Leiste auf dem Handy (erscheint, sobald der Kopf aus dem Bild ist) */
.lp-leiste { position: fixed; left: 0; right: 0; bottom: 0; z-index: 40; padding: 10px 16px calc(10px + env(safe-area-inset-bottom)); background: rgba(9,21,53,0.94);
  backdrop-filter: blur(10px); border-top: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; gap: 12px;
  transform: translateY(110%); transition: transform .25s ease; }
.lp-leiste.lp-leiste-an { transform: translateY(0); }
.lp-leiste .lp-knopf { width: 100%; max-width: 420px; min-height: 50px; }
@media (min-width: 900px) { .lp-leiste { display: none; } }
.lp-leiste-platz { height: 0; }
@media (max-width: 899px) { .lp-leiste-platz { height: 72px; } }

/* Smartphone: Knöpfe volle Breite, Werkzeuge zweispaltig und knapper */
@media (max-width: 560px) {
  .lp-knopf { width: 100%; }
  .lp-werkzeuge { grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 18px; row-gap: 32px; }
  .lp-werkzeug span { display: none; }
  .lp-werkzeug b { font-size: 14.5px; line-height: 1.35; }
  .lp-werkzeug { padding: 12px 0; min-height: 48px; }
}
`;

/* ---------------------------------------------------------------- Inhalte */
const VERTRAUEN = [
  ["Klasse 8 bis Abitur", "Gymnasium, Schwerpunkt Oberstufe"],
  ["Uni Konstanz", "Mathestudium und seit Jahren Mathe-Coach"],
  ["Konstanz & online", "Vor Ort am Bodensee oder im Browser"],
  ["Kostenlos testen", "Alle Werkzeuge ohne Anmeldung"],
];

const EBENEN = [
  { nr: "Auf dem Blatt", zitat: "Ich check’s einfach nicht.",
    text: "Lücken aus dem letzten Jahr, Klausuren, die ohne Plan beginnen, und Stoff, der nach den Ferien wieder weg ist. Mehr Üben bringt nicht mehr Note." },
  { nr: "Im Kopf", zitat: "Ich bin halt kein Mathe-Typ.",
    text: "Der Satz kommt vor jeder Aufgabe. Dazu die Angst vor der nächsten Arbeit, die Scham beim Abfragen – und zu Hause immer wieder dasselbe Thema." },
  { nr: "Der eigentliche Gegner", zitat: "Mathe ist Talent.", gegner: true,
    text: "Das ist der Mythos, gegen den du eigentlich kämpfst. Er sagt, dass es an dir liegt. Dabei hat dir nur nie jemand gezeigt, wie man Mathe lernt – und genau das ist lernbar." },
];

const MYTHEN = [
  ["„Mathe ist Talent“", "Es gibt kein Mathe-Gen. Gute Noten entstehen aus Methode, Wiederholung und Übung – genau wie beim Klavier oder beim Fußball."],
  ["„Gute Schüler rechnen schnell“", "Tempo ist ein Ergebnis von Sicherheit, nicht ihre Ursache. Wer sauber in kleinen Schritten arbeitet, wird von allein schneller."],
  ["„Fehler zeigen, dass ich es nicht kann“", "Fehler sind Information. Sie zeigen genau die Stelle, an der der Weg bricht."],
  ["„Wenn ich die Lösung verstehe, kann ich es“", "Verstanden ist eine Aufgabe erst, wenn du sie ein paar Tage später ohne Hilfe löst."],
  ["„Viel auf einmal üben bringt am meisten“", "Das Gehirn behält, was im richtigen Abstand wiederkommt. Kurz und regelmäßig schlägt den Marathon vor der Klausur."],
  ["„Im Kopf rechnen ist besser als aufschreiben“", "Der Kopf hat wenig Arbeitsspeicher. Ein klarer Rechenweg auf dem Papier entlastet ihn und macht Fehler sichtbar."],
];

const BELEGE = [
  ["Ich kenne den Weg von innen", "Von der 2 auf die 1,0 – nicht durch Talent, sondern durch ein anderes System. Genau das gebe ich weiter."],
  ["Mathematik an der Uni Konstanz", "Ich studiere das Fach selbst und begleite seit vielen Jahren Schüler von der Mittelstufe bis zum Abitur."],
  ["Ein System, das man anfassen kann", "Jede Methode gibt es als Werkzeug in der App: Plotter, Trainer, Kopfrechnen, Wiederholung – und Mathilda, die deinen Rechenweg prüft."],
];

const PLAN = [
  ["Standort bestimmen", "Im kostenlosen Erstgespräch schauen wir, wo du stehst, wo genau es hakt und welche Lücken zuerst geschlossen werden müssen."],
  ["Dein System aufbauen", "Du lernst, wie man Mathe lernt: sauber aufschreiben, sicher kopfrechnen, im richtigen Abstand wiederholen – mit den Werkzeugen der App."],
  ["Mit Feedback trainieren", "Du rechnest, bekommst Rückmeldung zu deinem Rechenweg und bleibst dran – bis zur nächsten Klausur oder bis zum Abi."],
];

const VERSPRECHEN = [
  "Das Erstgespräch ist kostenlos und unverbindlich.",
  "Alle Werkzeuge kannst du sofort und ohne Anmeldung ausprobieren.",
  "Jedes Programm hat eine klare Laufzeit und ein klares Ziel.",
];

const METHODEN = [
  { logo: ElternkursLogoKlein, name: "Mathe-Mindset", text: "Der Satz „Ich bin kein Mathe-Typ“ ist der erste Mythos, der fällt. Sechs Vorträge und zwei Bücher zeigen, wie Lernen wirklich funktioniert.", ziel: { ansicht: "elternkurs" }, knopf: "Mindset-Kurs öffnen" },
  { logo: PenPaperBlatt, name: "Pen & Paper", text: "Sauber aufschreiben, strukturiert rechnen, Fehler selbst finden. Wer klar schreibt, denkt klarer – und verschenkt keine Punkte mehr an Kleinigkeiten.", ziel: { ansicht: "penpaperkurs" }, knopf: "Pen & Paper öffnen" },
  { logo: HeadNumbersLogoKlein, name: "Kopfrechnen", text: "Einmaleins, Quadrat- und Kubikzahlen, die sitzen. Sicheres Kopfrechnen macht jede Aufgabe schneller und den Kopf frei für das Wesentliche.", ziel: { ansicht: "headnumbers" }, knopf: "Kopfrechnen trainieren" },
  { logo: EbbinghausLogoKlein, name: "Ebbinghaus", text: "Wiederholen im richtigen Abstand. So ist das Thema vom letzten Jahr noch da, wenn es im Abi zurückkommt.", ziel: { ansicht: "ebbinghaus" }, knopf: "Wiederholen starten" },
  { logo: MathildaLogoKlein, name: "MathildaAI", text: "Fotografiere dein Blatt. Mathilda liest deinen Rechenweg und zeigt dir genau die Stelle, an der er bricht.", ziel: { ansicht: "analyse", foto: "blatt" }, knopf: "Blatt prüfen lassen" },
  { logo: SchulmatheLogoKlein, name: "Schulmathe-Training", text: "Interaktive Werkzeuge, Trainer und Formelsammlung für Analysis, Vektoren und Stochastik – von der Mittelstufe bis zum Abi.", ziel: { ansicht: "start" }, knopf: "Zum Training" },
];

const WERKZEUGE = [
  { bereich: "Analysis", logo: AdvancedLogoKlein, liste: [
    ["Polynome", "Kurvendiskussion bis Grad 4", { ansicht: "plotter" }],
    ["Beliebige Funktionen", "Mit sin, ln, eˣ und Brüchen", { ansicht: "advplotter" }],
    ["Steckbriefaufgaben", "Aus Eigenschaften die Funktion", { ansicht: "steckbrief" }],
    ["Ableitungstrainer", "f′, f″ und f‴ prüfen", { ansicht: "ableitungstrainer" }],
  ] },
  { bereich: "Vektoren", logo: VektorenLogoKlein, liste: [
    ["Ebenen-Visualizer", "Ebenen live im Raum drehen", { ansicht: "ebenen" }],
    ["Abstände", "Punkt, Gerade, Ebene", { ansicht: "abstaende" }],
    ["Kreuzprodukt", "Formel, eingesetzt, Ergebnis", { ansicht: "kreuzprodukt" }],
  ] },
  { bereich: "Stochastik", logo: StochastikLogoKlein, liste: [
    ["Bernoulli-Kette", "Binomialverteilung simulieren", { ansicht: "bernoulli" }],
    ["Vier-Felder-Tafel", "Mit Baumdiagramm", { ansicht: "vierfelder" }],
    ["Hypothesentests", "Fehler 1. und 2. Art", { ansicht: "hypothesentest" }],
  ] },
  { bereich: "Grundlagen", logo: GleichungenLogoKlein, liste: [
    ["Gleichungen lösen", "Du formst um, die App rechnet mit", { ansicht: "gleichungen" }],
    ["Terme und Potenzgesetze", "Vereinfachen, ausklammern, kürzen", { ansicht: "terme" }],
    ["Gleichungssysteme", "Mit drei Variablen", { ansicht: "lgs" }],
  ] },
];

const PASST = [
  "Du gehst aufs Gymnasium, Klasse 8 bis Abitur – Basis- oder Leistungsfach.",
  "Du willst nicht nur bestehen, sondern verstehen, was du da rechnest.",
  "Du bist bereit, regelmäßig kurz zu trainieren statt einmal lange vor der Klausur.",
  "Du akzeptierst, dass Fehler zum Weg gehören – und willst sie selbst finden lernen.",
];
const PASST_NICHT = [
  "Du suchst jemanden, der die Hausaufgaben für dich rechnet.",
  "Du willst nur den Stoff der nächsten Klausur durchgehen und danach alles vergessen.",
  "Du erwartest ein Wunder in einer Woche – ohne selbst etwas zu ändern.",
];

const WANDEL = [
  ["„Ich bin halt kein Mathe-Typ.“", "„Ich weiß, wie ich an jede Aufgabe rangehe.“"],
  ["Chaos auf dem Blatt, Fehler unauffindbar", "Saubere Rechenwege, Fehler sofort gefunden"],
  ["Lernen auf den letzten Drücker", "Feste Routinen, entspannt vor der Klausur"],
  ["Blackout in der Prüfung", "Ruhe, Plan und ein klarer Kopf"],
  ["Mathe als Pflicht", "Mathe als Fach, das Spaß macht"],
];

const ABLAUF = [
  ["Erstgespräch anfragen", "Ein Klick auf den Knopf – du sagst kurz, in welcher Klasse du bist und wo es hakt."],
  ["30 Minuten sprechen", "Wir schauen gemeinsam, wo du stehst und welcher Weg zu dir passt: Programm, Training mit den Werkzeugen oder erst einmal der Elternabend."],
  ["Mit einem Plan loslegen", "Du gehst mit den ersten konkreten Schritten raus – egal, ob wir danach zusammenarbeiten oder nicht."],
];

/* Über mich: hier ergänzen, sobald weitere Infos vorliegen. Das Foto erscheint automatisch,
   sobald die Datei public/landingpage/basti.jpg existiert (sonst bleibt der Bereich einspaltig). */
const UEBER_MICH = {
  foto: "/landingpage/basti.jpg",
  fotoAlt: "Basti Blumenröther, Gründer von Mythos Mathe",
  absaetze: [
    "Ich bin Basti. Ich studiere Mathematik an der Universität Konstanz, lebe in Dingelsdorf und begleite seit vielen Jahren Schüler durch Mathe – von der Mittelstufe bis zum Abitur.",
    "Mythos Mathe ist aus einer einfachen Beobachtung entstanden: Fast jeder, der an Mathe scheitert, scheitert nicht am Kopf, sondern an der Methode. Deshalb gibt es hier keine Abkürzungen, sondern ein System – und die Werkzeuge, um es jeden Tag anzuwenden.",
  ],
};

/* Stimmen: Echte Rückmeldungen hier eintragen (nur mit Einverständnis, bei Minderjährigen der Eltern).
   beispiel: true markiert Platzhalter sichtbar als „Beispiel“ – entfernen, sobald die Stimme echt ist. */
const STIMMEN = [
  { beispiel: true, rolle: "Schülerin, Klasse 11", thema: "Pen & Paper",
    text: "Ich dachte immer, ich bin einfach kein Mathe-Mensch. Seit ich jeden Schritt sauber aufschreibe, finde ich meine Fehler selbst – und vor der letzten Klausur hatte ich zum ersten Mal keine Angst." },
  { beispiel: true, rolle: "Schüler, Klasse 9", thema: "MathildaAI",
    text: "Mathilda hat mir gezeigt, dass ich fast immer am selben Vorzeichen hängen bleibe. Nach drei Trainingsrunden war das Thema für mich erledigt." },
  { beispiel: true, rolle: "Mutter eines Schülers, Klasse 12", thema: "Elternabend",
    text: "Bei uns gibt es keinen Streit mehr um Mathe. Unser Sohn lernt mit einem Plan, und er erzählt sogar freiwillig, was er gerade verstanden hat." },
];

const FRAGEN = [
  ["Für wen ist Mythos Mathe?", "Für Schüler am Gymnasium von Klasse 8 bis zum Abitur, mit Schwerpunkt auf der Oberstufe. Das Coaching findet in Konstanz und am Bodensee statt, die Werkzeuge funktionieren überall im Browser."],
  ["Brauche ich Talent für Mathe?", "Nein. Genau das ist der Mythos, um den es hier geht. Gute Mathenoten entstehen aus Methode, Wiederholung im richtigen Abstand und einer Haltung, die Fehler als Information sieht – nicht aus einer Begabung, die man hat oder nicht hat."],
  ["Ist das Nachhilfe?", "Nicht im klassischen Sinn. Nachhilfe erklärt den Stoff der nächsten Klausur. Mythos Mathe verändert, wie du lernst – damit du den Stoff danach selbst verstehst und behältst."],
  ["Was kostet das Erstgespräch?", "Nichts. Wir sprechen etwa 30 Minuten, und du gehst mit konkreten ersten Schritten raus – unabhängig davon, ob wir danach zusammenarbeiten."],
  ["Welches Programm passt zu mir?", "Mathe checken ist der kompakte Einstieg über zwei Monate, wenn Lücken geschlossen werden müssen. Die Mathe Abi Masterclass begleitet dich sechs Monate bis zum Abi. Was passt, klären wir im Erstgespräch."],
  ["Kann ich die Werkzeuge einfach ausprobieren?", "Ja. Plotter, Trainer und Generatoren öffnen sich direkt im Browser. Für die Foto-Auswertung mit MathildaAI wirst du vor dem ersten Foto um deine Einwilligung gebeten."],
  ["Was ist mit meinen Eltern?", "Für Eltern gibt es den Elternabend in Dingelsdorf und den Mindset-Kurs. Beides zeigt, wie Sie Ihr Kind wirksam begleiten – ohne selbst Mathe erklären zu müssen."],
];

/* ---------------------------------------------------------------- Bausteine */
function Rechenweg() {
  return (
    <div className="lp-blatt" role="img" aria-label="Rechenweg auf Karopapier: „Mathe gleich Talent“ ist rot durchgestrichen und als Mythos markiert. Darunter: Mathe gleich System plus Freude, daraus folgt Erfolg, doppelt unterstrichen.">
      <div className="lp-hand" aria-hidden="true">
        <div className="lp-zeile-block">
          <span className="lp-zeile lp-z1">
            Mathe = Talent
            <span className="lp-strich"><svg viewBox="0 0 300 28" preserveAspectRatio="none"><path d="M4 18 C 70 8, 150 22, 296 10" /></svg></span>
          </span>
        </div>
        <div className="lp-zeile-block"><span className="lp-zeile lp-z2">Mathe = System + Freude</span></div>
        <div className="lp-zeile-block">
          <span className="lp-zeile lp-z3 lp-ergebnis">
            ⇒ Erfolg
            <svg viewBox="0 0 160 16" preserveAspectRatio="none"><path d="M2 4 C 50 2, 110 6, 158 3 M4 12 C 60 10, 110 13, 156 11" /></svg>
          </span>
        </div>
      </div>
      <span className="lp-notiz" aria-hidden="true">Mythos!</span>
    </div>
  );
}

function Pruefung() {
  return (
    <div className="lp-pruefung" role="img" aria-label="Beispiel einer Prüfung durch MathildaAI: In Zeile 2 wurde das Minus vor der Klammer nicht auf die minus 5 angewendet.">
      <p style={{ fontSize: 13.5, fontWeight: 700, color: F.still, marginBottom: 14 }}>Beispiel: dein Rechenweg, von Mathilda geprüft</p>
      <div className="lp-pz"><span className="lp-pz-nr">1</span><M t="3x − (2x − 5)" /></div>
      <div className="lp-pz lp-pz-fehler"><span className="lp-pz-nr">2</span><M t="= 3x − 2x − 5" /></div>
      <div className="lp-pz lp-pz-folge"><span className="lp-pz-nr">3</span><M t="= x − 5" /></div>
      <div style={{ marginTop: 18, padding: "14px 16px", borderRadius: 12, background: F.papier, fontSize: 15, lineHeight: 1.65 }}>
        <b style={{ color: F.rot }}>Hier bricht der Weg.</b> Das Minus vor der Klammer wirkt auf beide Summanden: <M t="−(−5) = +5" />. Zeile 3 ist nur die Folge davon.
      </div>
    </div>
  );
}

const Haken = ({ farbe = F.nacht, hintergrund = F.gold }) => (
  <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><circle cx="11" cy="11" r="11" fill={hintergrund} /><path d="M6.5 11.3l3 3L15.5 8" stroke={farbe} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const Kreuz = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><circle cx="11" cy="11" r="11" fill="#F3D6D3" /><path d="M7.5 7.5l7 7M14.5 7.5l-7 7" stroke={F.rot} strokeWidth="2.2" strokeLinecap="round" /></svg>
);

/* ---------------------------------------------------------------- Seite */
export function Landingpage({ gehe }) {
  const [hinweis, setHinweis] = useState(false);
  const [labOffen, setLabOffen] = useState(false);
  const [fotoDa, setFotoDa] = useState(false);
  const [leisteAn, setLeisteAn] = useState(false);

  /* Foto nur zeigen, wenn es wirklich geladen werden kann – kein Springen des Layouts */
  useEffect(() => {
    const bild = new Image();
    bild.onload = () => { if (bild.naturalWidth > 0) setFotoDa(true); };
    bild.src = UEBER_MICH.foto;
    return () => { bild.onload = null; };
  }, []);

  /* Eigener Seitentitel für Browser-Tab und geteilte Links, beim Verlassen zurück */
  useEffect(() => {
    const alt = document.title;
    document.title = "Mythos Mathe – Mathetalent ist ein Mythos";
    return () => { document.title = alt; };
  }, []);

  /* Feste Knopf-Leiste auf dem Handy, sobald der Kopf aus dem Bild gescrollt ist */
  useEffect(() => {
    const kopf = document.getElementById("lp-kopf");
    const ende = document.getElementById("lp-abschluss");
    if (!kopf || !("IntersectionObserver" in window)) return;
    let kopfSichtbar = true, endeSichtbar = false;
    const setzen = () => setLeisteAn(!kopfSichtbar && !endeSichtbar);
    const io = new IntersectionObserver((eintraege) => {
      eintraege.forEach((e) => { if (e.target === kopf) kopfSichtbar = e.isIntersecting; if (e.target === ende) endeSichtbar = e.isIntersecting; });
      setzen();
    }, { threshold: 0.05 });
    io.observe(kopf); if (ende) io.observe(ende);
    return () => io.disconnect();
  }, []);

  const scrollen = (id) => { const el = document.getElementById(id); if (el) springe("anker", () => el.scrollIntoView({ behavior: "smooth", block: "start" })); };
  const kontaktDa = !!(COACHING.termin || COACHING.mail);
  const gespraech = () => {
    if (COACHING.termin) { window.open(COACHING.termin, "_blank", "noopener"); return; }
    if (COACHING.mail) {
      const betreff = encodeURIComponent("Erstgespräch Mythos Mathe");
      const text = encodeURIComponent("Hallo Basti,\n\nich würde gern ein erstes Gespräch mit dir führen.\n\nKlasse:\nWo es gerade hakt:\n\nViele Grüße");
      window.location.href = `mailto:${COACHING.mail}?subject=${betreff}&body=${text}`;
      return;
    }
    setHinweis(true);
    setTimeout(() => scrollen("lp-abschluss"), 60);
  };
  const hinweisText = hinweis && !kontaktDa ? (
    <p role="status" className="lp-hinweis" style={{ color: F.blauText }}>
      Die Online-Terminbuchung wird gerade eingerichtet. Bis dahin lernst du Mythos Mathe am besten beim{" "}
      <button type="button" className="lp-link" style={{ color: F.gold }} onClick={() => gehe({ ansicht: "elternabend" })}>Elternabend am {ELTERNABEND.datumKurz}</button> kennen.
    </p>
  ) : null;

  const KnopfGespraech = ({ gross, unter = true, dunkel = true }) => (
    <span style={{ display: "inline-block" }}>
      <button type="button" className={`lp-knopf lp-gold${gross ? " lp-knopf-gross" : ""}`} onClick={gespraech}>Kostenloses Erstgespräch anfragen</button>
      {unter && <span className="lp-unter" style={{ color: dunkel ? F.blauText : F.still }}>Kostenlos · unverbindlich · etwa 30 Minuten</span>}
    </span>
  );

  return (
    <div className="lp">
      <style>{CSS}</style>

      {/* ═══ 1 · HELD – Identität, Wunsch, Einsatz ═══ */}
      <header className="lp-kopf" id="lp-kopf">
        <div className="lp-innen lp-raster-2">
          <div>
            <span className="lp-kicker">Für Gymnasiasten von Klasse 8 bis zum Abitur</span>
            <h1 className="lp-h1">Mathetalent ist ein Mythos.</h1>
            <p className="lp-lead">
              Du willst gute Mathenoten – und endlich einen Plan, der funktioniert, Spaß macht und dir den Stress vor jeder Klausur nimmt.
              Genau dafür gibt es ein System. Es hat nichts mit Begabung zu tun, und jeder kann es lernen.
            </p>
            <div className="lp-cta-reihe" style={{ marginTop: 36 }}>
              <KnopfGespraech gross />
            </div>
            <div style={{ marginTop: 18 }}>
              <button type="button" className="lp-link" style={{ color: F.blauText, textDecorationColor: "rgba(201,214,238,0.4)" }} onClick={() => scrollen("lp-werkzeuge")}>Oder erst einmal die Werkzeuge kostenlos testen</button>
            </div>
            {hinweisText}
            <p className="lp-autor">Von <b>Basti Blumenröther</b>, Mathestudent an der Universität Konstanz und seit Jahren Mathe-Coach am Bodensee.</p>
          </div>
          <Rechenweg />
        </div>
      </header>
      <div className="lp-vertrauen">
        <div className="lp-innen">
          {VERTRAUEN.map(([t, s]) => <div key={t}><b>{t}</b><span>{s}</span></div>)}
        </div>
      </div>

      {/* ═══ 2 · PROBLEM – äußeres, inneres, Gegenspieler ═══ */}
      <section className="lp-sektion">
        <div className="lp-innen">
          <div style={{ maxWidth: 760 }}>
            <span className="lp-kicker">Kennst du das?</span>
            <h2 className="lp-h2">Manche scheinen es einfach zu kapieren. <span className="lp-mark">Du nicht.</span></h2>
            <p className="lp-text" style={{ marginTop: 24, maxWidth: "36em" }}>
              Du lernst kurz vor der Klausur unter Stress, es reicht gerade so – und ein Jahr später ist dasselbe Thema wieder da und fast alles ist weg.
              Das Problem hat drei Ebenen. Die dritte ist die wichtigste.
            </p>
          </div>
          <div className="lp-ebenen">
            {EBENEN.map((e) => (
              <div key={e.nr} className={`lp-ebene${e.gegner ? " lp-ebene-gegner" : ""}`}>
                <span className="lp-ebene-nr">{e.nr}</span>
                <q>{e.zitat}</q>
                <p className="lp-text" style={{ fontSize: 15.5, lineHeight: 1.65 }}>{e.text}</p>
              </div>
            ))}
          </div>
          <p className="lp-fazit">Das liegt nicht an dir. Es liegt daran, dass dir nie jemand gezeigt hat, <span className="lp-mark">wie man Mathe lernt.</span></p>
          <details style={{ marginTop: 32, maxWidth: 760 }}>
            <summary className="lp-link" style={{ listStyle: "none", display: "inline-block" }}>Die anderen Mathe-Mythen, die dich ausbremsen</summary>
            <dl style={{ margin: "20px 0 0", display: "grid", gap: 16 }}>
              {MYTHEN.map(([t, s]) => (
                <div key={t} style={{ borderLeft: `3px solid ${F.gold}`, paddingLeft: 16 }}>
                  <dt style={{ fontSize: 16, fontWeight: 700 }}>{t}</dt>
                  <dd style={{ margin: "4px 0 0", fontSize: 15, lineHeight: 1.6, color: F.grau }}>{s}</dd>
                </div>
              ))}
            </dl>
          </details>
        </div>
      </section>

      {/* ═══ 3 · MENTOR – Empathie, Autorität, Haltung ═══ */}
      <section className="lp-sektion" style={{ background: F.weiss, borderTop: `1px solid ${F.linie}`, borderBottom: `1px solid ${F.linie}` }}>
        <div className="lp-innen">
          <div style={{ maxWidth: 760 }}>
            <span className="lp-kicker">Ich war genau da, wo du jetzt bist</span>
            <h2 className="lp-h2">Ich war selbst kein Überflieger.</h2>
            <p className="lp-text" style={{ marginTop: 24 }}>
              In den ersten drei Jahren am Gymnasium hing ich bei der Note 2 fest. Vielleicht denkst du jetzt: „Eine 2 wäre für mich ein Traum.“
              Genau deshalb ist die Geschichte wichtig – denn der Sprung danach hatte nichts mit Talent zu tun.
            </p>
          </div>
          <ol className="lp-zeit">
            <li>
              <span className="lp-punkt" aria-hidden="true" />
              <p className="lp-wann">Klasse 5 bis 7</p>
              <p className="lp-note" style={{ color: F.still }}>2</p>
              <p className="lp-text" style={{ marginTop: 12 }}>Festgefahren. Mehr lernen brachte nicht mehr Erfolg.</p>
            </li>
            <li>
              <span className="lp-punkt" aria-hidden="true" style={{ borderColor: F.see }} />
              <p className="lp-wann">ab Klasse 8</p>
              <svg className="lp-anstieg" viewBox="0 0 120 64" role="img" aria-label="Kurve, die steil ansteigt">
                <path d="M4 58 C 40 56, 62 50, 78 34 S 104 8, 116 6" fill="none" stroke={F.see} strokeWidth="5" strokeLinecap="round" />
                <circle cx="116" cy="6" r="5" fill={F.see} />
              </svg>
              <p className="lp-text" style={{ marginTop: 12 }}>Ein komplett anderer Weg: andere Methoden, eine andere Haltung zu Fehlern, ein klares System.</p>
            </li>
            <li className="lp-ziel">
              <span className="lp-punkt" aria-hidden="true" />
              <p className="lp-wann">ab Klasse 10</p>
              <p className="lp-note" style={{ color: F.goldText }}>1,0</p>
              <p className="lp-text" style={{ marginTop: 12 }}>Und das Wichtigste: Mathe hat plötzlich Spaß gemacht.</p>
            </li>
          </ol>
          <p className="lp-text" style={{ maxWidth: 760, marginTop: 8 }}>
            In den letzten fünf Jahren habe ich genau untersucht, welche Stellschrauben diesen Weg möglich gemacht haben – und in welcher
            Kombination und Reihenfolge sie wirken. Daraus ist das Trainingssystem von Mythos Mathe entstanden. Es wirkt unabhängig davon,
            wo du gerade stehst.
          </p>
          <div className="lp-belege">
            {BELEGE.map(([t, s]) => <div key={t} className="lp-beleg"><b>{t}</b><span>{s}</span></div>)}
          </div>
        </div>
      </section>

      {/* ═══ 4 · LÖSUNG – 3-Schritte-Plan, Versprechen, Werkzeuge & Angebote ═══ */}
      <section className="lp-sektion lp-dunkel" style={{ background: `radial-gradient(110% 120% at 10% 0%, #17306E 0%, ${F.nacht} 55%)` }}>
        <div className="lp-innen">
          <div style={{ maxWidth: 760 }}>
            <span className="lp-kicker">Der Plan</span>
            <h2 className="lp-h2">In drei Schritten von „Ich check’s nicht“ zu <span className="lp-mark">„Ich weiß, wie es geht.“</span></h2>
            <p className="lp-text" style={{ marginTop: 22 }}>Kein Geheimnis, keine Abkürzung – ein Weg, den du vom ersten Tag an verstehst.</p>
          </div>
          <ol className="lp-plan">
            {PLAN.map(([t, s]) => <li key={t}><h3 className="lp-h3">{t}</h3><p className="lp-text">{s}</p></li>)}
          </ol>
          <div className="lp-versprechen">
            {VERSPRECHEN.map((v) => <div key={v}><span className="lp-haken"><svg width="12" height="10" viewBox="0 0 12 10" aria-hidden="true"><path d="M1.5 5.2l3 3L10.5 1.5" stroke={F.nacht} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg></span>{v}</div>)}
          </div>
          <div style={{ marginTop: 44 }}><KnopfGespraech /></div>
          {hinweisText}
        </div>
      </section>

      {/* 4b · Das System: sechs Stellschrauben */}
      <section className="lp-sektion">
        <div className="lp-innen">
          <div style={{ maxWidth: 760 }}>
            <span className="lp-kicker">Das System</span>
            <h2 className="lp-h2">Sechs Stellschrauben. Ein System.</h2>
            <p className="lp-text" style={{ marginTop: 20 }}>Jede einzelne bringt dich weiter. Zusammen verändern sie, wie du Mathe lernst – wie du denkst, wie du rechnest, wie du schreibst und wie du Gelerntes behältst. Alle kannst du hier sofort ausprobieren.</p>
          </div>
          <div className="lp-methoden lp-wisch">
            {METHODEN.map((m) => {
              const Logo = m.logo;
              return (
                <div key={m.name} className="lp-methode">
                  <div className="lp-methode-bild" aria-hidden="true"><Logo /></div>
                  <div className="lp-methode-text">
                    <h3 className="lp-h3">{m.name === "MathildaAI" ? <MathildaName /> : m.name}</h3>
                    <p className="lp-text" style={{ marginTop: 8, fontSize: 15.5, lineHeight: 1.65 }}>{m.text}</p>
                    <button type="button" className="lp-link" onClick={() => gehe(m.ziel)}>{m.knopf}</button>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="lp-wisch-hinweis" aria-hidden="true">Zur Seite wischen für alle sechs</p>
        </div>
      </section>

      {/* 4c · MathildaAI */}
      <section className="lp-sektion lp-dunkel" style={{ background: `radial-gradient(110% 120% at 90% 0%, #17306E 0%, ${F.nacht} 55%)` }}>
        <div className="lp-innen lp-raster-2">
          <div>
            <span className="lp-kicker">Dein Feedback, jederzeit</span>
            <h2 className="lp-h2"><MathildaName dunkel /> findet die Stelle, an der dein Weg bricht.</h2>
            <p className="lp-text" style={{ marginTop: 22 }}>
              Nicht nur „falsch“, sondern wo und warum. Und weil Mathilda sich deine Fehler über Wochen merkt, erkennt sie Muster –
              aus digitalen Übungen und aus deinen Blättern.
            </p>
            <ol className="lp-schritte">
              <li><p className="lp-text"><b style={{ color: F.weiss }}>Blatt fotografieren.</b> Mathilda überträgt deinen Rechenweg Zeile für Zeile.</p></li>
              <li><p className="lp-text"><b style={{ color: F.weiss }}>Exakt prüfen.</b> Der früheste falsche Schritt wird markiert, Folgefehler werden nicht doppelt gezählt.</p></li>
              <li><p className="lp-text"><b style={{ color: F.weiss }}>Muster erkennen.</b> Erst wenn sich ein Fehler wiederholt, wird daraus ein Muster – nie aus einem einzelnen Ausrutscher.</p></li>
              <li><p className="lp-text"><b style={{ color: F.weiss }}>Gezielt trainieren.</b> Drei Aufgaben pro Runde, genau zu deinem Fehlertyp – bis zum Skill-Badge.</p></li>
            </ol>
            <div className="lp-cta-reihe" style={{ marginTop: 36 }}>
              <button type="button" className="lp-knopf lp-gold" onClick={() => gehe({ ansicht: "analyse", foto: "blatt" })}>Blatt prüfen lassen</button>
              <button type="button" className="lp-knopf lp-rand-hell" aria-expanded={labOffen} aria-controls="performance-lab"
                onClick={() => { const neu = !labOffen; setLabOffen(neu); if (neu) setTimeout(() => scrollen("performance-lab"), 60); }}>
                {labOffen ? "Performance-Lab schließen" : "Performance-Lab ausprobieren"}
              </button>
            </div>
          </div>
          <Pruefung />
        </div>
      </section>
      {labOffen && <PerformanceLab />}

      {/* 4d · Angebote */}
      <section className="lp-sektion" id="lp-angebote" style={{ background: F.weiss, borderTop: `1px solid ${F.linie}`, scrollMarginTop: 64 }}>
        <div className="lp-innen">
          <div style={{ maxWidth: 760 }}>
            <span className="lp-kicker">Die Programme</span>
            <h2 className="lp-h2">Mit Begleitung schneller ans Ziel.</h2>
            <p className="lp-text" style={{ marginTop: 20 }}>Die Werkzeuge kannst du allein nutzen. In den Programmen arbeiten wir das System gemeinsam durch – mit festen Terminen, Feedback zu deinem Rechenweg und einer Gruppe, die mitzieht.</p>
          </div>
          <div className="lp-angebote">
            <div className="lp-angebot" style={{ background: F.papier, border: `1px solid ${F.linie}` }}>
              <div className="lp-angebot-kopf">
                <span className="lp-dauer" style={{ background: F.himmel, color: F.see }}>2 Monate · Einstieg</span>
              </div>
              <h3 className="lp-h2" style={{ fontSize: "clamp(28px, 3.4vw, 36px)", marginTop: 18 }}>Mathe checken</h3>
              <p className="lp-text" style={{ marginTop: 12 }}>In acht Wochen Lücken schließen, verstehen, was du rechnest, und ein Fundament bauen, auf dem du sicher weiterlernst.</p>
              <p className="lp-fuerwen" style={{ color: F.see }}>Für dich, wenn du das Gefühl hast, den Anschluss verloren zu haben.</p>
              <ul style={{ color: F.tinte }}>
                <li>Standortbestimmung: Wo genau hakt es – und warum?</li>
                <li>Jedes Thema von Grund auf, mit Bildern, Beispielen und den Werkzeugen der App</li>
                <li>Pen & Paper: sauber aufschreiben, strukturiert rechnen, Fehler selbst finden</li>
                <li>Regelmäßiges Training bis zur nächsten Klausur</li>
              </ul>
              <div style={{ marginTop: "auto" }}><button type="button" className="lp-knopf lp-rand-dunkel" onClick={() => gehe({ ansicht: "mathecheck" })}>Mathe checken ansehen</button></div>
            </div>
            <div className="lp-angebot" style={{ background: F.nacht, color: F.weiss }}>
              <span className="lp-empfehlung">Fürs Abi</span>
              <div className="lp-angebot-kopf">
                <span className="lp-dauer" style={{ background: "rgba(237,187,0,0.14)", color: F.gold }}>6 Monate · Oberstufe</span>
              </div>
              <h3 className="lp-h2" style={{ fontSize: "clamp(28px, 3.4vw, 36px)", marginTop: 18 }}>Mathe Abi Masterclass</h3>
              <p className="lp-text" style={{ marginTop: 12, color: F.blauText }}>Sechs Monate, die dein Mathe-Abi verändern: klares Können, eine saubere Arbeitsweise und eine Haltung, die dich auch in der Prüfung trägt.</p>
              <p className="lp-fuerwen" style={{ color: F.gold }}>Für dich, wenn du im Abi nicht nur bestehen, sondern zeigen willst, was in dir steckt.</p>
              <ul>
                <li>Wöchentlicher Zoom-Call mit der Gruppe: neues Thema, offene Fragen, Aha-Momente</li>
                <li>Videolektionen, Arbeitshefte mit Lösungswegen und alle Werkzeuge der App</li>
                <li>Wöchentliche Trainingssessions: Abi-Aufgaben unter Zeit, mit Feedback zu deinem Rechenweg</li>
                <li>Drei Intensivtage am Samstag – du wählst deinen Termin</li>
                <li>Mindset-Training in jedem Monat: vom Brief an dein Abi-Ich bis zur Prüfungssimulation</li>
              </ul>
              <div style={{ marginTop: "auto" }}><button type="button" className="lp-knopf lp-gold" onClick={() => gehe({ ansicht: "masterclass" })}>Masterclass ansehen</button></div>
            </div>
          </div>
          <p className="lp-klein" style={{ marginTop: 20 }}>Beide Programme starten in Kürze. Welches zu dir passt, klären wir im kostenlosen Erstgespräch.</p>

          {/* Für Eltern */}
          <div className="lp-eltern-reihe" style={{ marginTop: 48 }}>
            <div className="lp-eltern">
              <span className="lp-kicker" style={{ color: F.gold }}>Für Eltern</span>
              <h3 className="lp-h2" style={{ fontSize: "clamp(26px, 3.2vw, 34px)" }}>Elternabend am {ELTERNABEND.datumKurz.replace(/^[A-Za-zäöü]+, /, "").replace(". ", ". ")}</h3>
              <p className="lp-text" style={{ marginTop: 18 }}>
                In entspannter Atmosphäre in {ELTERNABEND.ort} erfahren Sie, wie Mathe lernen funktioniert, warum Talent dabei keine Rolle spielt
                und wie Sie Ihr Kind wirksam begleiten können – ohne selbst Mathe erklären zu müssen.
              </p>
              <dl>
                <div><dt>Wann</dt><dd>{ELTERNABEND.datum}{ELTERNABEND.uhrzeit ? `, ${ELTERNABEND.uhrzeit}` : " · Uhrzeit folgt"}</dd></div>
                <div><dt>Wo</dt><dd>{ELTERNABEND.ort}, {ELTERNABEND.strasse}, {ELTERNABEND.plzOrt}</dd></div>
                <div><dt>Inklusive</dt><dd>{ELTERNABEND.inklusive.join(" · ")}</dd></div>
              </dl>
              <div className="lp-cta-reihe" style={{ marginTop: 28 }}>
                <button type="button" className="lp-knopf lp-gold" onClick={() => gehe({ ansicht: "elternabend" })}>Zum Elternabend</button>
              </div>
            </div>
            <div className="lp-angebot" style={{ background: F.papier, border: `1px solid ${F.linie}` }}>
              <span className="lp-dauer" style={{ background: F.himmel, color: F.see, alignSelf: "flex-start" }}>Online · jederzeit</span>
              <h3 className="lp-h3" style={{ fontSize: 24, marginTop: 18 }}>Mathe-Mindset-Kurs für Eltern</h3>
              <p className="lp-text" style={{ marginTop: 12, fontSize: 15.5 }}>Sechs Vorträge und zwei Bücher darüber, wie Lernen wirklich funktioniert – und wie Sie zu Hause helfen, ohne Mathe erklären zu müssen.</p>
              <div style={{ marginTop: "auto", paddingTop: 24 }}><button type="button" className="lp-knopf lp-rand-dunkel" onClick={() => gehe({ ansicht: "elternkurs" })}>Mindset-Kurs öffnen</button></div>
            </div>
          </div>
        </div>
      </section>

      {/* 4e · Werkzeuge kostenlos */}
      <section className="lp-sektion" id="lp-werkzeuge" style={{ scrollMarginTop: 64 }}>
        <div className="lp-innen">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24, flexWrap: "wrap" }}>
            <div style={{ maxWidth: 680 }}>
              <span className="lp-kicker">Kostenlos · ohne Anmeldung</span>
              <h2 className="lp-h2">Probier das System selbst aus.</h2>
              <p className="lp-text" style={{ marginTop: 20 }}>Oberstufenmathe zum Anfassen: Graphen live plotten, Ebenen im Raum drehen, Wahrscheinlichkeiten simulieren. Direkt im Browser.</p>
            </div>
            <button type="button" className="lp-knopf lp-rand-dunkel" onClick={() => gehe({ ansicht: "start" })}>Alle Werkzeuge ansehen</button>
          </div>
          <div className="lp-werkzeuge">
            {WERKZEUGE.map((b) => (
              <div key={b.bereich} className="lp-bereich">
                <div className="lp-bereich-bild" aria-hidden="true"><b.logo /></div>
                <h3>{b.bereich}</h3>
                {b.liste.map(([n, z, ziel]) => (
                  <button key={n} type="button" className="lp-werkzeug" onClick={() => gehe(ziel)}><b>{n}</b><span>{z}</span></button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4f · Für wen / nicht für wen */}
      <section className="lp-sektion" style={{ paddingTop: 0 }}>
        <div className="lp-innen">
          <div style={{ maxWidth: 720 }}>
            <span className="lp-kicker">Ehrlich gesagt</span>
            <h2 className="lp-h2">Für wen das passt – und für wen nicht.</h2>
          </div>
          <div className="lp-passt">
            <div>
              <h3>Mythos Mathe passt zu dir, wenn …</h3>
              <ul>{PASST.map((t) => <li key={t}><Haken />{t}</li>)}</ul>
            </div>
            <div>
              <h3>Es passt nicht, wenn …</h3>
              <ul>{PASST_NICHT.map((t) => <li key={t}><Kreuz />{t}</li>)}</ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4g · Stimmen */}
      <section className="lp-sektion" style={{ paddingTop: 0 }}>
        <div className="lp-innen">
          <div style={{ maxWidth: 720 }}>
            <span className="lp-kicker">Stimmen</span>
            <h2 className="lp-h2">Was sich verändert</h2>
            <p className="lp-text" style={{ marginTop: 20 }}>Rückmeldungen von Schülern und Eltern, die mit dem System arbeiten.</p>
            {STIMMEN.some((x) => x.beispiel) && (
              <p className="lp-klein" style={{ marginTop: 12 }}>Die mit „Beispiel“ markierten Texte sind Platzhalter und werden durch echte Rückmeldungen ersetzt.</p>
            )}
          </div>
          <div className="lp-stimmen lp-wisch">
            {STIMMEN.map((x, i) => (
              <figure key={i} className="lp-stimme">
                {x.beispiel && <span className="lp-beispiel">Beispiel</span>}
                <blockquote>{x.text}</blockquote>
                <figcaption>
                  {x.foto
                    ? <img className="lp-avatar" src={x.foto} alt="" loading="lazy" />
                    : (
                      <span className="lp-avatar" aria-hidden="true">
                        <svg viewBox="0 0 52 52" width="52" height="52"><circle cx="26" cy="20" r="9" fill="#B9C8E2" /><path d="M9 46c2-10 9-15 17-15s15 5 17 15" fill="#B9C8E2" /></svg>
                      </span>
                    )}
                  <span>
                    <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: F.tinte }}>{x.name || x.rolle}</span>
                    <span style={{ display: "block", fontSize: 13.5, color: F.still, marginTop: 2 }}>{x.name ? `${x.rolle} · ` : ""}{x.thema}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>

          {/* Vorher / Nachher */}
          <div style={{ maxWidth: 720, marginTop: 72 }}>
            <span className="lp-kicker">Deine Verwandlung</span>
            <h2 className="lp-h2">Eine komplett andere Version von dir.</h2>
          </div>
          <div className="lp-wandel">
            <div className="lp-wandel-kopf">
              <p style={{ background: "#F4F6FA", color: F.still }}>Vorher</p>
              <p style={{ background: F.gold, color: F.nacht }}>Nachher</p>
            </div>
            {WANDEL.map(([a, b]) => <div key={a} className="lp-wandel-zeile"><p>{a}</p><p>{b}</p></div>)}
          </div>
        </div>
      </section>

      {/* ═══ 5 · REISE – Handlung, Erfolg, Scheitern ═══ */}
      <section className="lp-sektion lp-dunkel" style={{ background: `linear-gradient(170deg, ${F.nacht} 0%, ${F.nachtTief} 100%)` }}>
        <div className="lp-innen">
          <div style={{ maxWidth: 760 }}>
            <span className="lp-kicker">Zwei Wege</span>
            <h2 className="lp-h2">Das nächste Schuljahr kommt so oder so. <span className="lp-mark">Die Frage ist, wie.</span></h2>
          </div>
          <div className="lp-wege">
            <div className="lp-weg lp-weg-grau">
              <h3>Wenn alles bleibt, wie es ist</h3>
              <ul>
                <li>Die Lücke aus diesem Jahr wird die Lücke vom nächsten – nur größer.</li>
                <li>Vor jeder Klausur derselbe Stress, danach dieselbe Enttäuschung.</li>
                <li>Der Satz „Ich bin kein Mathe-Typ“ wird zur Wahrheit, weil niemand ihn widerlegt.</li>
                <li>Im Abi entscheidet Mathe über den Schnitt – und damit über Optionen.</li>
              </ul>
            </div>
            <div className="lp-weg lp-weg-gold">
              <h3>Wenn du jetzt losgehst</h3>
              <ul>
                <li>Du weißt in wenigen Wochen, wo genau es hakt – und was du dagegen tust.</li>
                <li>Du hast ein System, das in jeder Klausur und im Abi trägt.</li>
                <li>Fehler sind Information, kein Urteil. Du findest sie selbst.</li>
                <li>Mathe wird zu dem Fach, in dem du wächst – und das Spaß macht.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5b · Ablauf Erstgespräch */}
      <section className="lp-sektion" style={{ background: F.weiss, borderBottom: `1px solid ${F.linie}` }}>
        <div className="lp-innen">
          <div style={{ maxWidth: 760 }}>
            <span className="lp-kicker">So geht es los</span>
            <h2 className="lp-h2">Dein erster Schritt dauert 30 Minuten.</h2>
          </div>
          <ol className="lp-ablauf">
            {ABLAUF.map(([t, s]) => <li key={t}><div><b>{t}</b><span>{s}</span></div></li>)}
          </ol>
          <div style={{ marginTop: 40 }}><KnopfGespraech dunkel={false} /></div>
          {hinweisText && <div style={{ color: F.grau }}>{hinweisText}</div>}
        </div>
      </section>

      {/* Über mich */}
      <section className="lp-sektion">
        <div className={fotoDa ? "lp-innen lp-ueber" : "lp-innen lp-schmal"}>
          {fotoDa && <img className="lp-foto" src={UEBER_MICH.foto} alt={UEBER_MICH.fotoAlt} loading="lazy" onError={() => setFotoDa(false)} />}
          <div>
            <span className="lp-kicker">Dein Mentor</span>
            <h2 className="lp-h2">Wer hinter Mythos Mathe steht</h2>
            {UEBER_MICH.absaetze.map((a, i) => <p key={i} className="lp-text" style={{ marginTop: i ? 18 : 24 }}>{a}</p>)}
            <p style={{ marginTop: 32, fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", color: F.nacht }}>System + Freude = Erfolg</p>
          </div>
        </div>
      </section>

      {/* Fragen */}
      <section className="lp-sektion" style={{ paddingTop: 0 }}>
        <div className="lp-innen lp-schmal">
          <span className="lp-kicker">Noch Fragen?</span>
          <h2 className="lp-h2">Häufige Fragen</h2>
          <div style={{ marginTop: 32, borderTop: `1px solid ${F.linie}` }}>
            {FRAGEN.map(([f, a]) => (
              <details key={f} className="lp-frage">
                <summary>{f}</summary>
                <p className="lp-text">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Abschluss */}
      <section className="lp-sektion lp-dunkel" id="lp-abschluss" style={{ background: `radial-gradient(120% 90% at 50% 100%, #17306E 0%, ${F.nacht} 50%, ${F.nachtTief} 100%)`, scrollMarginTop: 64 }}>
        <div className="lp-innen lp-schmal" style={{ textAlign: "center" }}>
          <span className="lp-kicker">Deine Reise beginnt hier</span>
          <h2 className="lp-h2" style={{ fontSize: "clamp(34px, 5.2vw, 56px)" }}>Das muss nicht so bleiben.</h2>
          <p className="lp-lead" style={{ marginTop: 22, color: F.blauText }}>
            Mathetalent ist ein Mythos. Ein System kann man lernen – und du musst diesen Weg nicht allein gehen.
          </p>
          <div style={{ marginTop: 36 }}><KnopfGespraech gross /></div>
          <div style={{ marginTop: 18 }}>
            <button type="button" className="lp-link" style={{ color: F.blauText, textDecorationColor: "rgba(201,214,238,0.4)" }} onClick={() => scrollen("lp-werkzeuge")}>Oder erst einmal die Werkzeuge kostenlos testen</button>
          </div>
          {hinweisText && <div style={{ display: "flex", justifyContent: "center" }}>{hinweisText}</div>}
          <p style={{ marginTop: 48, fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", color: F.gold }}>System + Freude = Erfolg</p>
        </div>
      </section>
      <div className="lp-leiste-platz" aria-hidden="true" />

      {/* Feste Knopf-Leiste auf dem Handy */}
      <div className={`lp-leiste${leisteAn ? " lp-leiste-an" : ""}`} aria-hidden={!leisteAn}>
        <button type="button" className="lp-knopf lp-gold" tabIndex={leisteAn ? 0 : -1} onClick={gespraech}>Kostenloses Erstgespräch</button>
      </div>
    </div>
  );
}
