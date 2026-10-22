/* ======================================================================
   FEEDBACK-SEITE – eigene Seite (Adresse /feedback), eigener Chunk (lazy in func10.jsx).
   Daten und Logik: src/feedback.js. Technik der Sprachaufnahme und der Ablage:
   funcFeedback.jsx (derselbe Hook, derselbe Speicher wie der Knopf unten auf jeder Seite).

   Die Seite sagt ehrlich: mythosmathe.de ist eine Baustelle, und die Tester entscheiden mit,
   wie sie wird. Aufbau wie die Vision-Seite (Nacht, Gold, eine Lesespalte, Kapitel):

     Bühne          „Diese Seite ist eine Baustelle.“ + Feedback-Schleife (Ausprobieren → Sagen → Umbauen → Online)
     01 Baustelle   Was gerade entsteht; „Diese Seite ist perfekt“ – durchgestrichen, „noch nicht“
     02 Vier Fragen Gut · Unklar · Zu kompliziert · Wunsch – je mit Beispiel, Karte öffnet das Formular vorgewählt
     03 Für Eltern  gesiezt, vier Punkte
     04 Genau       Wo · Was · Warum, Vorher/Nachher (hell)
     05 Senden      ein Formular: Wer → Worum → Wo → Text oder Voice → Einwilligung → Senden
     06 Danach      was mit dem Feedback passiert, Abschluss

   Direkter Knopf überall: „Feedback geben“ (springt zum Formular; am Handy als feste Leiste).
   Sprünge nur über springeZuId("feedback-kapitel", …). Keine Karos, keine erfundenen Zahlen.
   ====================================================================== */
import React, { useEffect, useRef, useState } from "react";
import { C } from "./base1.jsx";
import { springeZuId } from "./sprung.js";
import { sb } from "./konto.js";
import { basisModus, editionVon, EVENT_START_MODUS, startModus } from "./startModus.js";
import { useSprachaufnahme, audioHochladen, geraetDaten, MikroIcon, TextIcon, MAX_SEKUNDEN } from "./funcFeedback.jsx";
import { ROLLEN, ARTEN, SCHUELER_FRAGEN, ELTERN_PUNKTE, GENAU, VORHER_NACHHER, DANACH, FEEDBACK_KAPITEL,
  MAX_ZEICHEN, MAX_ORT, KLASSEN, feedbackPruefen, feedbackZeile, gesiezt } from "./feedback.js";

const NACHT = "#050B1F";
const NACHT2 = "#0B1A44";
const GOLD = C.flaggold;
const GOLD_HELL = "#FFE58A";
const TEXT = "#EEF2FF";
const NEBEL = "#AEBCDD";

/* ---------------------------------------------------------------- Stil */
const CSS = `
html[data-feedback-seite] .app-wurzel { background: ${NACHT} !important; }
html[data-feedback-seite] .fuss-paar button { color: ${TEXT} !important; background: rgba(255,255,255,0.06) !important; border-color: rgba(255,255,255,0.11) !important; }
html[data-feedback-seite] .fb-fuss { display: none; }
.fs { position: relative; font-family: Montserrat, system-ui, sans-serif; color: ${TEXT}; background: ${NACHT}; overflow-x: clip; }
.fs *, .fs *::before, .fs *::after { box-sizing: border-box; }
.fs :where(h1, h2, h3, p, ul, ol, figure, blockquote) { margin: 0; }
.fs button, .fs input, .fs textarea { font-family: inherit; }
.fs button:focus-visible, .fs a:focus-visible, .fs input:focus-visible, .fs textarea:focus-visible { outline: 3px solid ${GOLD}; outline-offset: 3px; }
.fs-innen { width: 100%; max-width: 1120px; margin: 0 auto; padding: 0 20px; }
@media (min-width: 840px) { .fs-innen { padding: 0 40px; } }
.fs-schmal { max-width: 760px; }

.fs-teil { position: relative; padding: clamp(64px, 9vw, 112px) 0; scroll-margin-top: 56px; }
.fs-dunkel { background: ${NACHT}; color: ${TEXT}; }
.fs-tief { background: radial-gradient(90% 70% at 100% 0%, rgba(0,77,152,0.38) 0%, rgba(0,77,152,0) 60%), linear-gradient(175deg, ${NACHT2} 0%, ${NACHT} 100%); color: ${TEXT}; }
.fs-hell { background: #FFFFFF; color: ${C.tinte}; }
.fs-blattkante { border-radius: 36px 36px 0 0; margin-top: -36px; z-index: 1; box-shadow: 0 -30px 60px -30px rgba(0,0,0,.6); }
.fs-blattkante + .fs-teil { border-radius: 36px 36px 0 0; margin-top: -36px; z-index: 2; }

.fs-kicker { display: flex; align-items: center; gap: 12px; font-size: 12px; font-weight: 800; letter-spacing: .18em; text-transform: uppercase; color: ${GOLD}; }
.fs-kicker::before { content: ""; flex: none; width: 28px; height: 2px; border-radius: 2px; background: currentColor; }
.fs-hell .fs-kicker { color: ${C.gruenDunkel}; }
.fs-h2 { margin-top: 18px; font-size: clamp(32px, 7.2vw, 62px); font-weight: 900; letter-spacing: -0.04em; line-height: 1.02; color: #FFFFFF; text-wrap: balance; }
.fs-hell .fs-h2 { color: ${C.seeTief}; }
.fs-gold { background: linear-gradient(180deg, ${GOLD_HELL} 0%, ${GOLD} 55%, #C9931A 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
.fs-hell .fs-gold { background: linear-gradient(180deg, #D9A400 0%, #B98A00 100%); -webkit-background-clip: text; background-clip: text; }
.fs-text { margin-top: 20px; font-size: clamp(16px, 2.1vw, 18px); font-weight: 300; line-height: 1.72; color: ${NEBEL}; max-width: 62ch; text-wrap: pretty; }
.fs-text b { font-weight: 700; color: #FFFFFF; }
.fs-hell .fs-text { color: ${C.grau}; }
.fs-hell .fs-text b { color: ${C.seeTief}; }

/* Knöpfe */
.fs-knoepfe { margin-top: 34px; display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
.fs-knopf { display: inline-flex; align-items: center; justify-content: center; gap: 10px; min-height: 54px; padding: 0 22px; border-radius: 999px; border: 2px solid transparent; cursor: pointer;
  font-size: 15.5px; font-weight: 800; letter-spacing: -0.005em; text-decoration: none; transition: transform .16s ease, box-shadow .16s ease, background .16s ease, border-color .16s ease, opacity .16s ease; }
.fs-knopf i { font-style: normal; transition: transform .18s ease; }
@media (hover:hover) { .fs-knopf:hover { transform: translateY(-2px); } .fs-knopf:hover i { transform: translateX(4px); } }
.fs-knopf.gold { color: ${NACHT}; background: linear-gradient(180deg, ${GOLD_HELL} 0%, ${GOLD} 100%); box-shadow: 0 14px 36px -10px rgba(237,187,0,0.55), inset 0 1px 0 rgba(255,255,255,.6); }
.fs-knopf.rand { color: #FFFFFF; background: rgba(5,11,31,0.6); border-color: rgba(255,255,255,0.28); backdrop-filter: blur(4px); }
.fs-hell .fs-knopf.rand { color: ${C.seeTief}; background: transparent; border-color: ${C.seeTief}; }
.fs-knopf:disabled { opacity: .55; cursor: default; transform: none; }
.fs-link { display: inline-flex; align-items: center; gap: 8px; margin-top: 22px; padding: 0; background: none; border: none; cursor: pointer; font-size: 14.5px; font-weight: 800; color: ${GOLD}; }
.fs-link i { font-style: normal; transition: transform .18s ease; }
@media (hover:hover) { .fs-link:hover i { transform: translateX(4px); } }
@media (max-width: 520px) { .fs-knoepfe .fs-knopf { width: 100%; } }

/* Einblenden beim Scrollen */
.fs-js .fs-auf { opacity: 0; transform: translateY(22px); transition: opacity .8s ease, transform .8s cubic-bezier(.2,.7,.3,1); }
.fs-js .fs-auf.da { opacity: 1; transform: none; }
.fs-js .fs-auf.v1 { transition-delay: .08s; } .fs-js .fs-auf.v2 { transition-delay: .16s; } .fs-js .fs-auf.v3 { transition-delay: .24s; }
.fs:not(.fs-js) .fs-weg svg { clip-path: none; }

/* ---------- Bühne ---------- */
.fs-held { position: relative; overflow: hidden; padding: clamp(44px, 8vw, 100px) 0 clamp(64px, 10vw, 128px); background: ${NACHT}; }
.fs[data-modus="mix"] .fs-held, .fs[data-modus="hell"] .fs-held { background-color: ${NACHT};
  background-image: radial-gradient(110% 60% at 0% 0%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 60%),
    linear-gradient(176deg, #0656A7 0%, ${C.see} 16%, #0A3A80 42%, #0B2A63 66%, ${NACHT} 100%); }
.fs[data-modus="mix"] .fs-licht.b, .fs[data-modus="hell"] .fs-licht.b { display: none; }
.fs[data-modus="mix"] .fs-licht.a, .fs[data-modus="hell"] .fs-licht.a { background: radial-gradient(circle, rgba(255,229,138,0.26) 0%, rgba(255,229,138,0) 70%); }
.fs-licht { position: absolute; border-radius: 999px; filter: blur(70px); pointer-events: none; }
.fs-licht.a { width: 62vw; height: 62vw; max-width: 720px; max-height: 720px; top: -24vw; right: -18vw; background: radial-gradient(circle, rgba(237,187,0,0.36) 0%, rgba(237,187,0,0) 70%); }
.fs-licht.b { width: 70vw; height: 70vw; max-width: 800px; max-height: 800px; top: 8%; left: -38vw; background: radial-gradient(circle, rgba(0,77,152,0.5) 0%, rgba(0,77,152,0) 70%); }
.fs-held-kopf { position: relative; z-index: 1; }
.fs-held-raster { position: relative; z-index: 1; margin-top: clamp(22px, 3vw, 34px); display: grid; grid-template-columns: minmax(0, 1fr); gap: 44px; align-items: center; }
@media (min-width: 980px) { .fs-held-raster { grid-template-columns: minmax(0, 1.12fr) minmax(0, 0.88fr); gap: 56px; } }
.fs-held h1 { margin-top: 20px; font-size: clamp(34px, 8.6vw, 92px); font-weight: 900; letter-spacing: -0.05em; line-height: .96; color: #FFFFFF; text-shadow: 0 14px 50px rgba(0,0,0,.45); }
@media (min-width: 980px) { .fs-held h1 { font-size: clamp(64px, 7.4vw, 92px); } }
.fs-held h1 .fs-gold { display: block; padding-bottom: .06em; }
.fs-lead { font-size: clamp(19px, 4.6vw, 25px); font-weight: 300; line-height: 1.4; color: ${TEXT}; max-width: 30ch; text-wrap: pretty; }
.fs-lead b { font-weight: 700; color: #FFFFFF; }
.fs-unter { margin-top: 16px; font-size: 15.5px; line-height: 1.6; color: ${NEBEL}; max-width: 46ch; }
.fs-schild { display: inline-flex; align-items: center; gap: 10px; margin-top: 4px; padding: 7px 14px 7px 9px; border-radius: 999px; font-size: 12.5px; font-weight: 800; letter-spacing: .04em; color: ${NACHT};
  background: linear-gradient(180deg, ${GOLD_HELL} 0%, ${GOLD} 100%); box-shadow: 0 8px 24px -8px rgba(237,187,0,.6); }
.fs-schild i { display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${NACHT}; animation: fsPuls 1.6s ease-in-out infinite; }
@keyframes fsPuls { 0%, 100% { transform: scale(.7); opacity: .6; } 50% { transform: scale(1); opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .fs-schild i { animation: none; } }

/* Die Schleife (Ausprobieren → Sagen → Umbauen → Online) */
.fs-karte { position: relative; border-radius: 26px; border: 1px solid rgba(255,255,255,0.12); background: linear-gradient(160deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.025) 100%);
  box-shadow: 0 40px 80px -50px rgba(0,0,0,.9), inset 0 1px 0 rgba(255,255,255,0.08); padding: clamp(18px, 4vw, 28px); }
.fs-karte-titel { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; font-size: 11.5px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; color: ${NEBEL}; }
.fs-karte-titel span:last-child { letter-spacing: .04em; text-transform: none; font-weight: 600; }
.fs-schleife { display: block; width: 100%; height: auto; margin-top: 14px; overflow: visible; }
.fs-schleife .bahn { fill: none; stroke: rgba(255,255,255,0.14); stroke-width: 2.5; }
.fs-schleife .lauf { fill: none; stroke: ${GOLD}; stroke-width: 3; stroke-linecap: round; stroke-dasharray: 60 540; animation: fsLauf 6s linear infinite; }
@keyframes fsLauf { to { stroke-dashoffset: -600; } }
@media (prefers-reduced-motion: reduce) { .fs-schleife .lauf { animation: none; stroke-dasharray: none; } }
.fs-schleife .knoten { fill: ${NACHT}; stroke: rgba(255,255,255,0.3); stroke-width: 1.5; }
.fs-schleife .knoten.du { stroke: ${GOLD}; }
.fs-schleife text { font-family: Montserrat, system-ui, sans-serif; fill: #FFFFFF; font-weight: 800; }
.fs-schleife .wer { fill: ${NEBEL}; font-weight: 700; letter-spacing: .08em; }
.fs-karte-fuss { margin-top: 18px; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 13px; line-height: 1.55; color: ${NEBEL}; }
.fs-karte-fuss b { color: #FFFFFF; font-weight: 700; }

/* Kapitelübersicht unter der Bühne */
.fs-kapitel { position: relative; z-index: 1; margin-top: clamp(48px, 7vw, 76px); display: flex; flex-wrap: wrap; gap: 8px; }
.fs-kapitel button { display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px 8px 10px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.14); background: rgba(255,255,255,0.04); color: ${NEBEL}; font-size: 13px; font-weight: 700; cursor: pointer; transition: border-color .15s ease, color .15s ease; }
.fs-kapitel button b { font-size: 11px; font-weight: 900; color: ${GOLD}; letter-spacing: .04em; }
@media (hover:hover) { .fs-kapitel button:hover { border-color: rgba(237,187,0,0.6); color: #FFFFFF; } }

/* Handy: feste Leiste mit dem direkten Knopf */
.fs-leiste-u { position: fixed; left: 0; right: 0; bottom: 0; z-index: 40; padding: 10px 16px calc(10px + env(safe-area-inset-bottom)); background: rgba(5,11,31,0.9); backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: center; transform: translateY(110%); transition: transform .3s ease; }
.fs-leiste-u.sichtbar { transform: none; }
.fs-leiste-u .fs-knopf { width: 100%; max-width: 440px; min-height: 50px; }
@media (min-width: 900px) { .fs-leiste-u { display: none; } }

/* ---------- 01 Die Baustelle ---------- */
.fs-bau { margin-top: clamp(40px, 6vw, 64px); display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; }
@media (min-width: 900px) { .fs-bau { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; } }
.fs-bau-karte { position: relative; border-radius: 22px; padding: 22px 22px 24px; border: 1px solid rgba(255,255,255,0.1); background: linear-gradient(160deg, rgba(255,255,255,0.075) 0%, rgba(255,255,255,0.025) 100%); }
.fs-bau-karte .status { display: inline-flex; align-items: center; gap: 7px; font-size: 11px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: ${GOLD}; }
.fs-bau-karte .status::before { content: ""; width: 7px; height: 7px; border-radius: 50%; background: currentColor; }
.fs-bau-karte h3 { margin-top: 14px; font-size: clamp(21px, 4.8vw, 25px); font-weight: 800; letter-spacing: -0.025em; line-height: 1.15; color: #FFFFFF; }
.fs-bau-karte p { margin-top: 12px; font-size: 15px; line-height: 1.62; color: ${NEBEL}; }
.fs-perfekt { margin-top: clamp(64px, 10vw, 120px); text-align: center; }
.fs-perfekt .gross { font-size: clamp(40px, 11vw, 104px); font-weight: 900; letter-spacing: -0.055em; line-height: 1; color: #FFFFFF; text-wrap: balance; }
.fs-weg { position: relative; display: inline-block; color: rgba(255,255,255,0.42); }
.fs-weg svg { position: absolute; left: -8%; top: 50%; width: 116%; height: .5em; transform: translateY(-46%); overflow: visible; clip-path: inset(-50% 100% -50% 0); transition: clip-path .9s cubic-bezier(.6,0,.2,1) .35s; }
.fs-weg path { fill: none; stroke: ${GOLD}; stroke-width: 5; stroke-linecap: round; vector-effect: non-scaling-stroke; }
.fs-perfekt.da .fs-weg svg { clip-path: inset(-50% 0 -50% 0); }
.fs-notiz { position: absolute; left: 100%; top: -.9em; margin-left: .12em; font-size: .36em; font-weight: 800; letter-spacing: .02em; color: ${GOLD}; transform: rotate(-8deg); white-space: nowrap; opacity: 0; transition: opacity .4s ease 1.1s; }
.fs-perfekt.da .fs-notiz { opacity: 1; }
.fs-perfekt .antwort { margin: clamp(26px, 4vw, 40px) auto 0; font-size: clamp(23px, 5vw, 42px); font-weight: 900; letter-spacing: -0.035em; line-height: 1.1; max-width: 22ch; color: #FFFFFF; text-wrap: balance; }
@media (max-width: 600px) { .fs-perfekt .gross { padding-right: 2.2em; } }

/* ---------- 02 Vier Fragen ---------- */
.fs-fragen { margin-top: clamp(40px, 6vw, 64px); display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; }
@media (min-width: 760px) { .fs-fragen { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; } }
.fs-frage { position: relative; display: flex; flex-direction: column; align-items: flex-start; text-align: left; cursor: pointer; border-radius: 24px; padding: 24px 22px 22px; border: 1px solid rgba(255,255,255,0.12); color: inherit;
  background: linear-gradient(160deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.025) 100%); transition: transform .18s ease, border-color .18s ease; }
@media (hover:hover) { .fs-frage:hover { transform: translateY(-3px); border-color: rgba(237,187,0,0.6); } }
.fs-frage .zeichen { display: inline-flex; align-items: center; justify-content: center; width: 46px; height: 46px; border-radius: 14px; font-size: 24px; font-weight: 900; color: ${NACHT};
  background: linear-gradient(180deg, ${GOLD_HELL} 0%, ${GOLD} 100%); box-shadow: 0 10px 26px -8px rgba(237,187,0,0.6); }
.fs-frage h3 { margin-top: 18px; font-size: clamp(22px, 4.6vw, 26px); font-weight: 900; letter-spacing: -0.03em; line-height: 1.1; color: #FFFFFF; }
.fs-frage p { margin-top: 10px; font-size: 15px; line-height: 1.6; color: ${NEBEL}; }
.fs-frage .bsp { margin-top: 14px; padding: 12px 14px; border-radius: 14px; border-left: 3px solid ${GOLD}; background: rgba(255,255,255,0.05); font-size: 14px; font-style: italic; line-height: 1.55; color: ${TEXT}; }
.fs-frage .mehr { margin-top: 16px; display: inline-flex; gap: 8px; font-size: 13.5px; font-weight: 800; color: ${GOLD}; }

/* ---------- 03 Für Eltern ---------- */
.fs-zwei { display: grid; grid-template-columns: minmax(0, 1fr); gap: 44px; align-items: start; }
@media (min-width: 980px) { .fs-zwei { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 64px; } }
.fs-punkte { display: grid; gap: 12px; }
.fs-punkt { border-radius: 18px; padding: 18px 20px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); }
.fs-punkt h3 { font-size: 17px; font-weight: 800; letter-spacing: -0.015em; color: #FFFFFF; }
.fs-punkt p { margin-top: 6px; font-size: 14.5px; line-height: 1.6; color: ${NEBEL}; }

/* ---------- 04 So genau wie möglich (hell) ---------- */
.fs-genau { margin-top: 30px; list-style: none; padding: 0; display: grid; gap: 14px; }
@media (min-width: 760px) { .fs-genau { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.fs-genau li { border-radius: 18px; padding: 18px 20px; background: ${C.sand}; border: 1px solid ${C.linie}; }
.fs-genau b { display: block; font-size: 24px; font-weight: 900; letter-spacing: -0.03em; color: ${C.seeTief}; }
.fs-genau span { display: block; margin-top: 6px; font-size: 14.5px; line-height: 1.6; color: ${C.grau}; }
.fs-vn { margin-top: clamp(32px, 5vw, 48px); display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; }
@media (min-width: 860px) { .fs-vn { grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr); gap: 18px; } }
.fs-vn-karte { border-radius: 22px; padding: 22px; border: 1px solid ${C.linie}; background: ${C.sand}; }
.fs-vn-karte.nachher { background: #FFFFFF; border-color: rgba(237,187,0,0.7); box-shadow: 0 24px 50px -30px rgba(14,30,74,.35); }
.fs-vn-karte .et { font-size: 11.5px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; color: ${C.grau}; }
.fs-vn-karte.nachher .et { color: ${C.gruenDunkel}; }
.fs-vn-karte .z { margin-top: 12px; font-size: clamp(17px, 2.4vw, 21px); font-weight: 700; letter-spacing: -0.015em; line-height: 1.4; color: ${C.seeTief}; }
.fs-vn-karte .frage { margin-top: 12px; font-size: 14px; line-height: 1.6; color: ${C.grau}; }

/* ---------- 05 Senden ---------- */
.fs-form { margin-top: clamp(32px, 5vw, 48px); border-radius: 28px; padding: clamp(20px, 4vw, 34px); border: 1px solid rgba(255,255,255,0.14);
  background: linear-gradient(160deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.03) 100%); box-shadow: 0 40px 80px -50px rgba(0,0,0,.9), inset 0 1px 0 rgba(255,255,255,0.08); }
.fs-schritt { padding: 22px 0; border-top: 1px solid rgba(255,255,255,0.1); }
.fs-schritt:first-child { padding-top: 0; border-top: none; }
.fs-schritt-kopf { display: flex; align-items: center; gap: 12px; }
.fs-schritt-kopf .nr { flex: none; display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 10px; font-size: 15px; font-weight: 900; color: ${NACHT}; background: linear-gradient(180deg, ${GOLD_HELL} 0%, ${GOLD} 100%); }
.fs-schritt-kopf h3 { font-size: 18px; font-weight: 800; letter-spacing: -0.02em; color: #FFFFFF; }
.fs-schritt-kopf small { font-size: 13px; font-weight: 500; color: ${NEBEL}; }
.fs-chips { margin-top: 14px; display: flex; flex-wrap: wrap; gap: 8px; }
.fs-chip { display: inline-flex; align-items: center; gap: 8px; min-height: 42px; padding: 0 15px; border-radius: 999px; border: 1.5px solid rgba(255,255,255,0.18); background: rgba(255,255,255,0.04); color: ${TEXT}; font-size: 14px; font-weight: 700; cursor: pointer; transition: border-color .15s ease, background .15s ease, color .15s ease; }
.fs-chip small { font-weight: 500; color: ${NEBEL}; }
.fs-chip b { font-weight: 900; color: ${GOLD}; }
@media (hover:hover) { .fs-chip:hover { border-color: rgba(237,187,0,0.6); } }
.fs-chip[aria-pressed="true"] { border-color: ${GOLD}; background: rgba(237,187,0,0.14); color: #FFFFFF; }
.fs-chip.klein { min-height: 38px; padding: 0 13px; }
.fs-feld { display: block; width: 100%; margin-top: 14px; padding: 13px 15px; border-radius: 14px; border: 1.5px solid rgba(255,255,255,0.18); background: rgba(5,11,31,0.55); color: #FFFFFF; font-size: 16px; line-height: 1.5; }
.fs-feld::placeholder { color: rgba(174,188,221,0.7); }
.fs-feld:focus { border-color: ${GOLD}; outline: none; }
textarea.fs-feld { min-height: 150px; resize: vertical; }
.fs-zaehler { margin-top: 6px; text-align: right; font-size: 12px; color: ${NEBEL}; font-variant-numeric: tabular-nums; }
.fs-weg-wahl { margin-top: 14px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.fs-weg-wahl button { display: flex; align-items: center; justify-content: center; gap: 10px; min-height: 52px; border-radius: 14px; border: 1.5px solid rgba(255,255,255,0.18); background: rgba(255,255,255,0.04); color: ${TEXT}; font-size: 15px; font-weight: 800; cursor: pointer; }
.fs-weg-wahl button[aria-pressed="true"] { border-color: ${GOLD}; background: rgba(237,187,0,0.14); color: #FFFFFF; }
.fs-aufnahme { margin-top: 16px; display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 22px 16px; border-radius: 18px; border: 1px dashed rgba(255,255,255,0.2); }
.fs-mikro { width: 84px; height: 84px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #FFFFFF; background: ${C.see}; box-shadow: 0 18px 40px -16px rgba(0,77,152,.9); }
.fs-mikro.lauft { background: #C62828; animation: fsRec 1.4s ease-in-out infinite; }
@keyframes fsRec { 0%, 100% { box-shadow: 0 0 0 0 rgba(198,40,40,.55); } 50% { box-shadow: 0 0 0 14px rgba(198,40,40,0); } }
@media (prefers-reduced-motion: reduce) { .fs-mikro.lauft { animation: none; } }
.fs-aufnahme .stand { font-size: 13.5px; font-weight: 700; color: ${NEBEL}; font-variant-numeric: tabular-nums; text-align: center; }
.fs-aufnahme audio { width: 100%; max-width: 420px; height: 40px; }
.fs-aufnahme .neu { background: none; border: 1.5px solid rgba(255,255,255,0.25); color: #FFFFFF; border-radius: 999px; min-height: 40px; padding: 0 16px; font-size: 13.5px; font-weight: 800; cursor: pointer; }
.fs-einw { display: flex; align-items: flex-start; gap: 11px; margin-top: 4px; font-size: 13px; line-height: 1.55; color: ${NEBEL}; cursor: pointer; }
.fs-einw input { margin-top: 3px; width: 20px; height: 20px; flex: none; accent-color: ${GOLD}; }
.fs-einw a { color: #FFFFFF; }
.fs-senden { margin-top: 20px; display: flex; flex-wrap: wrap; align-items: center; gap: 14px; }
.fs-meldung { font-size: 14px; font-weight: 700; line-height: 1.5; color: ${GOLD_HELL}; }
.fs-danke { text-align: center; padding: clamp(20px, 4vw, 40px) 0 8px; }
.fs-danke .haken { display: inline-flex; align-items: center; justify-content: center; width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(180deg, ${GOLD_HELL} 0%, ${GOLD} 100%); box-shadow: 0 18px 40px -14px rgba(237,187,0,.7); }
.fs-danke h3 { margin-top: 20px; font-size: clamp(28px, 6vw, 44px); font-weight: 900; letter-spacing: -0.035em; color: #FFFFFF; }
.fs-danke p { margin: 12px auto 0; max-width: 46ch; font-size: 16px; line-height: 1.65; color: ${NEBEL}; }

/* ---------- 06 Danach / Abschluss ---------- */
.fs-danach { margin-top: clamp(40px, 6vw, 64px); display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; }
@media (min-width: 900px) { .fs-danach { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; } }
.fs-danach-karte { border-radius: 22px; padding: 22px; border: 1px solid rgba(255,255,255,0.1); background: linear-gradient(160deg, rgba(255,255,255,0.075) 0%, rgba(255,255,255,0.025) 100%); }
.fs-danach-karte h3 { font-size: 20px; font-weight: 800; letter-spacing: -0.02em; color: #FFFFFF; }
.fs-danach-karte p { margin-top: 10px; font-size: 15px; line-height: 1.62; color: ${NEBEL}; }
.fs-zitat { margin-top: clamp(48px, 7vw, 72px); padding: 4px 0 4px 22px; border-left: 3px solid ${GOLD}; max-width: 720px; }
.fs-zitat p { font-size: clamp(20px, 3.6vw, 26px); font-weight: 700; letter-spacing: -0.02em; line-height: 1.32; color: #FFFFFF; text-wrap: pretty; }
.fs-zitat footer { margin-top: 14px; font-size: 13.5px; color: ${NEBEL}; }
.fs-zitat footer b { color: #FFFFFF; font-weight: 700; }
`;

/* ---------------------------------------------------------------- Bausteine */
function Kicker({ nr, children }) {
  return <p className="fs-kicker">{nr ? <><b>{nr}</b> {children}</> : children}</p>;
}

/* Durchgestrichenes Wort mit Notiz – aufgedeckt per clip-path (nicht per Strichlänge) */
function Weg({ children, notiz }) {
  return (
    <span className="fs-weg">
      {children}
      <svg viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true"><path d="M1 6.2 C 25 3.6, 55 7.4, 99 4.4" /></svg>
      {notiz && <span className="fs-notiz" aria-hidden="true">{notiz}</span>}
    </span>
  );
}

/* Die Feedback-Schleife: vier Stationen im Kreis, ein Lichtpunkt läuft herum */
function Schleife() {
  const W = 360, H = 312, cx = 180, cy = 150, r = 100;
  const pos = (grad) => [cx + r * Math.cos((grad * Math.PI) / 180), cy + r * Math.sin((grad * Math.PI) / 180)];
  const stationen = [
    { grad: -90, wer: "DU", text: "probierst aus", du: true },
    { grad: 0, wer: "DU", text: "sagst, was hakt", du: true },
    { grad: 90, wer: "ICH", text: "baue um" },
    { grad: 180, wer: "ICH", text: "stelle es online" },
  ];
  const kreis = `M ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy}`;
  return (
    <svg className="fs-schleife" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Die Feedback-Schleife: Du probierst aus, du sagst, was hakt, ich baue um, ich stelle es online – und von vorn.">
      <path className="bahn" d={kreis} />
      <path className="lauf" d={kreis} />
      {[45, 135, 225, 315].map((g) => {
        const [x, y] = pos(g);
        const t = ((g + 90) * Math.PI) / 180;   // Tangentenrichtung (im Uhrzeigersinn)
        const dx = Math.cos(t) * 7, dy = Math.sin(t) * 7;
        const nx = -dy / 7 * 4.5, ny = dx / 7 * 4.5;
        return <path key={g} d={`M ${x - dx + nx} ${y - dy + ny} L ${x + dx} ${y + dy} L ${x - dx - nx} ${y - dy - ny}`} fill="none" stroke={GOLD} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />;
      })}
      {stationen.map((s) => {
        const [x, y] = pos(s.grad);
        const oben = s.grad === -90;
        /* Beschriftung mittig unter dem Knoten (oben: darüber) – so bleibt sie auch auf 360 px im Bild */
        const ty = oben ? y - 30 : y + 44;
        return (
          <g key={s.grad}>
            <circle className={s.du ? "knoten du" : "knoten"} cx={x} cy={y} r="13" />
            <circle cx={x} cy={y} r="4.5" fill={s.du ? GOLD : "#FFFFFF"} />
            <text className="wer" x={x} y={ty - 15} textAnchor="middle" fontSize="10.5">{s.wer}</text>
            <text x={x} y={ty} textAnchor="middle" fontSize="14">{s.text}</text>
          </g>
        );
      })}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="12" className="wer">JEDE</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="17" fill={GOLD} style={{ fill: GOLD }}>Woche</text>
    </svg>
  );
}

function HakenGross() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={NACHT} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

const zeit = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/* ---------------------------------------------------------------- Die Seite */
export function FeedbackSeite({ gehe }) {
  const wurzel = useRef(null);
  const [js, setJs] = useState(false);
  const [leisteU, setLeisteU] = useState(false);
  const [modus, setModus] = useState(startModus);
  useEffect(() => {
    const h = () => setModus(startModus());
    window.addEventListener(EVENT_START_MODUS, h);
    return () => window.removeEventListener(EVENT_START_MODUS, h);
  }, []);

  /* Formular */
  const [rolle, setRolle] = useState("");
  const [klasse, setKlasse] = useState(null);
  const [art, setArt] = useState("");
  const [ort, setOrt] = useState("");
  const [weg, setWeg] = useState("text");
  const [text, setText] = useState("");
  const [zustimmung, setZustimmung] = useState(false);
  const [meldung, setMeldung] = useState("");
  const [sendet, setSendet] = useState(false);
  const [gesendet, setGesendet] = useState(0);
  const aufnahme = useSprachaufnahme();

  const springZu = (id) => springeZuId("feedback-kapitel", id);
  const zumFormular = (vorgabe) => {
    if (vorgabe && vorgabe.art) setArt(vorgabe.art);
    if (vorgabe && vorgabe.rolle) setRolle(vorgabe.rolle);
    springZu("fb-senden");
  };

  /* Titel, App-Hintergrund */
  useEffect(() => {
    const alt = document.title;
    document.title = "Feedback · Mythos Mathe";
    document.documentElement.setAttribute("data-feedback-seite", "");
    return () => { document.title = alt; document.documentElement.removeAttribute("data-feedback-seite"); };
  }, []);

  /* Einblenden beim Scrollen */
  useEffect(() => {
    const el = wurzel.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    setJs(true);
    const io = new IntersectionObserver((eintraege) => {
      eintraege.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("da"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    el.querySelectorAll(".fs-auf").forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  /* Feste Knopfleiste am Handy: nach der Bühne bis zum Formular */
  useEffect(() => {
    let tick = false;
    const lauf = () => {
      tick = false;
      const h = window.innerHeight;
      const held = document.getElementById("feedback-start");
      const form = document.getElementById("fb-senden");
      const heldUnten = held ? held.getBoundingClientRect().bottom : 0;
      const formOben = form ? form.getBoundingClientRect().top : Infinity;
      setLeisteU(heldUnten < 0 && formOben > h);
    };
    const h = () => { if (!tick) { tick = true; window.requestAnimationFrame(lauf); } };
    lauf();
    window.addEventListener("scroll", h, { passive: true });
    window.addEventListener("resize", h);
    return () => { window.removeEventListener("scroll", h); window.removeEventListener("resize", h); };
  }, []);

  const senden = async (e) => {
    if (e) e.preventDefault();
    const dauer = aufnahme.sek;
    const hinweis = feedbackPruefen({ rolle, art, text, dauer, zustimmung, weg });
    if (hinweis) { setMeldung(hinweis); return; }
    if (!sb) { setMeldung("Senden ist in dieser Vorschau noch nicht eingerichtet (Demo-Modus)."); return; }
    setMeldung(""); setSendet(true);
    try {
      let audioPfad = null;
      if (weg === "voice") {
        const blob = aufnahme.blob();
        if (!blob) throw new Error("keine Aufnahme");
        audioPfad = await audioHochladen(blob);
      }
      const zeile = feedbackZeile({ rolle, klasse, art, ort, text, audioPfad, dauer, ueberschrift: "Diese Seite ist eine Baustelle." });
      const eintrag = await sb.from("feedback").insert({ ...zeile, ...geraetDaten() });
      if (eintrag.error) throw eintrag.error;
      if (weg === "voice") aufnahme.gesendet();
      setText(""); setOrt(""); setZustimmung(false);
      setGesendet((n) => n + 1);
      springZu("fb-senden");
    } catch (err) {
      setMeldung("Das Senden hat nicht geklappt. Bitte versuche es gleich noch einmal.");
    } finally { setSendet(false); }
  };

  const nochEins = () => { setGesendet(0); setArt(""); setMeldung(""); aufnahme.zuruecksetzen(); setZustimmung(false); springZu("fb-senden"); };

  const sie = gesiezt(rolle);
  const artObj = ARTEN.find((a) => a.id === art);
  const { phase, sek, audioUrl } = aufnahme;

  return (
    <div className={js ? "fs fs-js" : "fs"} ref={wurzel} data-feedback-seite-wurzel data-modus={basisModus(modus)} data-edition={editionVon(modus)}>
      <style>{CSS}</style>

      {/* ================= Bühne ================= */}
      <section className="fs-held" id="feedback-start" aria-labelledby="fs-titel">
        <span className="fs-licht a" aria-hidden="true" /><span className="fs-licht b" aria-hidden="true" />
        <div className="fs-innen">
          <div className="fs-held-kopf">
            <span className="fs-schild"><i aria-hidden="true" />Testphase · Die Seite wird gerade gebaut</span>
            <h1 id="fs-titel">Diese Seite ist<span className="fs-gold">eine Baustelle.</span></h1>
          </div>
          <div className="fs-held-raster">
            <div>
              <p className="fs-lead">Du gehörst zu den Ersten, die sie betreten. <b>Nichts hier ist fertig – und genau deshalb zählt jetzt, was du sagst.</b></p>
              <p className="fs-unter">Jedes Werkzeug, jede Erklärung, jede Übung auf mythosmathe.de ist in Arbeit und verändert sich von Woche zu Woche. Was gut ist, was unklar ist, was dir zu kompliziert ist, welche Übungen dir fehlen: Sag es mir – als Text oder als Sprachnachricht, so genau du kannst.</p>
              <div className="fs-knoepfe">
                <button type="button" className="fs-knopf gold" onClick={() => zumFormular()} data-feedback-direkt>Feedback geben <i aria-hidden="true">→</i></button>
                <button type="button" className="fs-knopf rand" onClick={() => springZu("fb-fragen")}>Was ich wissen will <i aria-hidden="true">↓</i></button>
              </div>
            </div>
            <div className="fs-karte fs-auf v1">
              <div className="fs-karte-titel"><span>So entsteht die Seite</span><span>Testphase</span></div>
              <Schleife />
              <div className="fs-karte-fuss"><b>Zwei der vier Stationen gehören dir.</b> Ohne dein Ausprobieren und dein Feedback dreht sich die Schleife nicht.</div>
            </div>
          </div>
          <nav className="fs-kapitel" aria-label="Kapitel">
            {FEEDBACK_KAPITEL.map((k) => <button key={k.id} type="button" onClick={() => springZu(k.id)}><b>{k.nr}</b>{k.titel}</button>)}
          </nav>
        </div>
      </section>

      {/* ================= 01 Die Baustelle ================= */}
      <section className="fs-teil fs-dunkel" id="fb-baustelle" aria-labelledby="fs-bau">
        <div className="fs-innen">
          <div className="fs-schmal fs-auf">
            <Kicker nr="01">Die Baustelle</Kicker>
            <h2 className="fs-h2" id="fs-bau">Was hier gerade entsteht.</h2>
            <p className="fs-text">Eine Lernseite für die ganze Schulmathematik am Gymnasium – von Klasse 5 bis zum Abitur. Vieles ist schon benutzbar, nichts ist abgeschlossen. Drei Baustellen laufen parallel.</p>
          </div>
          <div className="fs-bau">
            <div className="fs-bau-karte fs-auf">
              <p className="status">Im Bau</p>
              <h3>Werkzeuge und Trainer</h3>
              <p>Ableitungen, Integrale, Vektoren, Stochastik, Geometrie, Gleichungen – jedes Werkzeug soll erklären, zeigen und abfragen. Viele stehen in der ersten Fassung: Da hakt noch ein Knopf, da fehlt eine Stufe, da ist ein Text zu lang.</p>
            </div>
            <div className="fs-bau-karte fs-auf v1">
              <p className="status">Wächst wöchentlich</p>
              <h3>Kurse und Schulbücher</h3>
              <p>Unterstufe, Dreiecksgeometrie, Differentialrechnung, Vektoren, GFS, Abi-Zentrum. Kapitel kommen dazu, Reihenfolgen ändern sich, Aufgaben werden ausgetauscht. Wenn dir ein Thema aus deinem Unterricht fehlt, ist das die wichtigste Nachricht, die du mir schicken kannst.</p>
            </div>
            <div className="fs-bau-karte fs-auf v2">
              <p className="status">Wird getestet</p>
              <h3>Mathilda AI</h3>
              <p>Sie liest dein fotografiertes Blatt und prüft deinen Rechenweg. Sie ist gut – und sie irrt sich. Wenn sie etwas übersieht oder falsch bewertet, will ich das Blatt und ihre Antwort sehen.</p>
            </div>
          </div>
          <div className="fs-perfekt fs-auf">
            <p className="gross">Diese Seite ist <Weg notiz="noch nicht">perfekt.</Weg></p>
            <p className="antwort">Mit jedem Feedback wird sie es <span className="fs-gold">ein Stück mehr.</span></p>
          </div>
        </div>
      </section>

      {/* ================= 02 Vier Fragen ================= */}
      <section className="fs-teil fs-tief" id="fb-fragen" aria-labelledby="fs-fragen">
        <div className="fs-innen">
          <div className="fs-schmal fs-auf">
            <Kicker nr="02">Vier Fragen</Kicker>
            <h2 className="fs-h2" id="fs-fragen">Das will ich von dir wissen.</h2>
            <p className="fs-text">Vier Fragen, nach jeder Sitzung. Du musst nicht alle beantworten – <b>eine genaue Antwort ist mehr wert als vier ungefähre.</b> Tipp auf eine Karte, dann steht sie unten im Formular schon drin.</p>
          </div>
          <div className="fs-fragen">
            {SCHUELER_FRAGEN.map((id, i) => {
              const a = ARTEN.find((x) => x.id === id);
              return (
                <button key={id} type="button" className={`fs-frage fs-auf v${i % 2}`} onClick={() => zumFormular({ art: id })} data-fs-frage={id}>
                  <span className="zeichen" aria-hidden="true">{a.zeichen}</span>
                  <h3>{a.frage}</h3>
                  <p>{a.hilfe}</p>
                  <span className="bsp">{a.beispiel}</span>
                  <span className="mehr">Das sagen <span aria-hidden="true">→</span></span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= 03 Für Eltern ================= */}
      <section className="fs-teil fs-dunkel" id="fb-eltern" aria-labelledby="fs-eltern">
        <div className="fs-innen">
          <div className="fs-zwei">
            <div className="fs-auf">
              <Kicker nr="03">Für Eltern</Kicker>
              <h2 className="fs-h2" id="fs-eltern">Sie sehen, was Ihr Kind mir nicht sagt.</h2>
              <p className="fs-text">Schüler schreiben „passt“, wenn etwas halb verstanden ist. Sie sehen, ob Ihr Kind allein mit einer Seite zurechtkommt, wo es abbricht und ob die Übung vor der Klassenarbeit etwas gebracht hat. <b>Genau das brauche ich – so konkret wie möglich, gern mit Klasse und Thema.</b></p>
              <button type="button" className="fs-link" onClick={() => zumFormular({ rolle: "eltern" })} data-fs-eltern>Als Elternteil Feedback geben <i aria-hidden="true">→</i></button>
            </div>
            <div className="fs-punkte fs-auf v1">
              {ELTERN_PUNKTE.map((p) => (
                <div key={p.titel} className="fs-punkt"><h3>{p.titel}</h3><p>{p.text}</p></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= 04 So genau wie möglich (hell) ================= */}
      <section className="fs-teil fs-hell fs-blattkante" id="fb-genau" aria-labelledby="fs-genau">
        <div className="fs-innen">
          <div className="fs-schmal fs-auf">
            <Kicker nr="04">So genau wie möglich</Kicker>
            <h2 className="fs-h2" id="fs-genau">Je genauer, <span className="fs-gold">desto schneller gebaut.</span></h2>
            <p className="fs-text">Ein ungefähres Feedback kostet mich Stunden Suche. Ein genaues zeigt mir die Stelle – und ich kann sie am selben Tag ändern. Drei Dinge machen den Unterschied.</p>
          </div>
          <ul className="fs-genau fs-auf">
            {GENAU.map((g) => <li key={g.punkt}><b>{g.punkt}</b><span>{g.text}</span></li>)}
          </ul>
          <div className="fs-vn">
            <div className="fs-vn-karte fs-auf">
              <p className="et">Vorher · ungefähr</p>
              <p className="z">{VORHER_NACHHER.vorher}</p>
              <p className="frage">Welche Seite? Welche Aufgabe? Welcher Schritt? Ich weiß nicht, wo ich anfangen soll.</p>
            </div>
            <div className="fs-vn-karte nachher fs-auf v1">
              <p className="et">Nachher · genau</p>
              <p className="z">{VORHER_NACHHER.nachher}</p>
              <p className="frage">Ort, Schritt, Erwartung – damit kann ich die Erklärung an genau dieser Stelle umbauen.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 05 Senden ================= */}
      <section className="fs-teil fs-tief" id="fb-senden" aria-labelledby="fs-senden">
        <div className="fs-innen">
          <div className="fs-schmal fs-auf">
            <Kicker nr="05">Feedback senden</Kicker>
            <h2 className="fs-h2" id="fs-senden">Als Text <span className="fs-gold">oder als Sprachnachricht.</span></h2>
            <p className="fs-text">Fünf kurze Schritte. Sprechen geht oft schneller als Tippen – bis zu zwei Minuten am Stück.</p>
          </div>

          <form className="fs-form" noValidate onSubmit={senden} aria-label="Feedback-Formular" data-fs-form>
            {gesendet > 0 ? (
              <div className="fs-danke" role="status" data-fs-danke>
                <span className="haken" aria-hidden="true"><HakenGross /></span>
                <h3>{sie ? "Vielen Dank!" : "Danke dir!"}</h3>
                <p>{sie ? "Ihre Nachricht ist angekommen und fließt in den nächsten Umbau ein." : "Deine Nachricht ist angekommen und fließt in den nächsten Umbau ein."}</p>
                <div className="fs-knoepfe" style={{ justifyContent: "center" }}>
                  <button type="button" className="fs-knopf gold" onClick={nochEins}>Noch ein Feedback <i aria-hidden="true">→</i></button>
                  <button type="button" className="fs-knopf rand" onClick={() => gehe({ ansicht: "start" })}>Weiter üben</button>
                </div>
              </div>
            ) : (
              <>
                {/* 1 Wer */}
                <div className="fs-schritt">
                  <div className="fs-schritt-kopf"><span className="nr" aria-hidden="true">1</span><h3>Wer bist du?</h3></div>
                  <div className="fs-chips" role="group" aria-label="Rolle">
                    {ROLLEN.map((r) => (
                      <button key={r.id} type="button" className="fs-chip" aria-pressed={rolle === r.id} onClick={() => setRolle(r.id)} data-fs-rolle={r.id}>
                        {r.name}<small>· {r.kurz}</small>
                      </button>
                    ))}
                  </div>
                  {rolle === "schueler" && (
                    <div className="fs-chips" role="group" aria-label="Klasse" style={{ marginTop: 12 }}>
                      {KLASSEN.map((k) => (
                        <button key={k} type="button" className="fs-chip klein" aria-pressed={klasse === k} onClick={() => setKlasse(klasse === k ? null : k)} data-fs-klasse={k}>Klasse {k}</button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2 Worum */}
                <div className="fs-schritt">
                  <div className="fs-schritt-kopf"><span className="nr" aria-hidden="true">2</span><h3>Worum geht es?</h3></div>
                  <div className="fs-chips" role="group" aria-label="Art des Feedbacks">
                    {ARTEN.map((a) => (
                      <button key={a.id} type="button" className="fs-chip" aria-pressed={art === a.id} onClick={() => setArt(a.id)} data-fs-art={a.id}>
                        <b aria-hidden="true">{a.zeichen}</b>{a.name}
                      </button>
                    ))}
                  </div>
                  {artObj && <p className="fs-text" style={{ marginTop: 12, fontSize: 14.5 }}>{artObj.hilfe}</p>}
                </div>

                {/* 3 Wo */}
                <div className="fs-schritt">
                  <div className="fs-schritt-kopf"><span className="nr" aria-hidden="true">3</span><h3>Wo genau? <small>optional</small></h3></div>
                  <input className="fs-feld" type="text" value={ort} maxLength={MAX_ORT} onChange={(e) => setOrt(e.target.value)} data-fs-ort
                    placeholder="Seite oder Werkzeug, z. B. Integrale" aria-label="Wo genau" />
                </div>

                {/* 4 Text oder Voice */}
                <div className="fs-schritt">
                  <div className="fs-schritt-kopf"><span className="nr" aria-hidden="true">4</span><h3>{sie ? "Ihre Nachricht" : "Deine Nachricht"}</h3></div>
                  <div className="fs-weg-wahl" role="group" aria-label="Text oder Sprachnachricht">
                    <button type="button" aria-pressed={weg === "text"} onClick={() => setWeg("text")} data-fs-weg="text"><TextIcon groesse={18} farbe="currentColor" />Text</button>
                    <button type="button" aria-pressed={weg === "voice"} onClick={() => setWeg("voice")} data-fs-weg="voice"><MikroIcon groesse={18} farbe="currentColor" />Voice</button>
                  </div>
                  {weg === "text" ? (
                    <>
                      <textarea className="fs-feld" value={text} maxLength={MAX_ZEICHEN} onChange={(e) => setText(e.target.value)} data-fs-text aria-label="Dein Feedback als Text"
                        placeholder={artObj ? artObj.beispiel.replace(/^„|“$/g, "") : (sie ? "Was ist gut, was unklar, was fehlt? Je genauer, desto besser." : "Was ist gut? Was verstehst du nicht? Was ist zu kompliziert? Welche Übung fehlt dir?")} />
                      <p className="fs-zaehler">{text.length} / {MAX_ZEICHEN}</p>
                    </>
                  ) : (
                    <div className="fs-aufnahme" data-fs-aufnahme>
                      {phase === "ruhe" && (
                        <button type="button" className="fs-mikro" onClick={aufnahme.aufnehmen} aria-label="Aufnahme starten" data-fs-mikro><MikroIcon groesse={34} farbe="#fff" /></button>
                      )}
                      {phase === "aufnahme" && (
                        <button type="button" className="fs-mikro lauft" onClick={aufnahme.stoppen} aria-label="Aufnahme beenden" data-fs-stopp>
                          <span aria-hidden="true" style={{ width: 28, height: 28, borderRadius: 6, background: "#fff", display: "block" }} />
                        </button>
                      )}
                      {(phase === "fertig" || phase === "sendet") && audioUrl && <audio controls src={audioUrl} />}
                      <p className="stand" aria-live="polite">
                        {phase === "ruhe" && "Tippe zum Aufnehmen – sprich einfach drauflos."}
                        {phase === "aufnahme" && `Aufnahme läuft · ${zeit(sek)} / ${zeit(MAX_SEKUNDEN)} · tippe zum Beenden`}
                        {phase === "fertig" && `Aufnahme · ${zeit(sek)} · anhören und senden`}
                        {phase === "sendet" && "Wird gesendet …"}
                      </p>
                      {phase === "fertig" && <button type="button" className="neu" onClick={aufnahme.zuruecksetzen}>Neu aufnehmen</button>}
                      {aufnahme.meldung && <p className="fs-meldung" role="alert">{aufnahme.meldung}</p>}
                    </div>
                  )}
                </div>

                {/* 5 Einwilligung und Senden */}
                <div className="fs-schritt">
                  <div className="fs-schritt-kopf" style={{ marginBottom: 14 }}><span className="nr" aria-hidden="true">5</span><h3>Senden</h3></div>
                  <label className="fs-einw">
                    <input type="checkbox" checked={zustimmung} onChange={(e) => setZustimmung(e.target.checked)} disabled={sendet} data-fs-einw />
                    <span>Ich bin einverstanden, dass meine Nachricht gespeichert und von Mythos Mathe gelesen bzw. angehört wird, um die Seite zu verbessern. Löschung spätestens nach zwölf Monaten, Details in der <a href="/datenschutz" target="_blank" rel="noopener noreferrer">Datenschutzerklärung</a>.</span>
                  </label>
                  <div className="fs-senden">
                    <button type="submit" className="fs-knopf gold" disabled={sendet} data-fs-senden>{sendet ? "Wird gesendet …" : "Feedback senden"} <i aria-hidden="true">→</i></button>
                    {meldung && <p className="fs-meldung" role="alert" data-fs-meldung>{meldung}</p>}
                  </div>
                </div>
              </>
            )}
          </form>
        </div>
      </section>

      {/* ================= 06 Was danach passiert ================= */}
      <section className="fs-teil fs-dunkel" id="fb-danach" aria-labelledby="fs-danach">
        <div className="fs-innen">
          <div className="fs-schmal fs-auf">
            <Kicker nr="06">Was danach passiert</Kicker>
            <h2 className="fs-h2" id="fs-danach">Dein Feedback <span className="fs-gold">wird gebaut.</span></h2>
            <p className="fs-text">Keine Umfrage, die in einer Tabelle verschwindet. Was du schreibst oder sprichst, landet direkt auf meinem Tisch – und von dort in die Seite.</p>
          </div>
          <div className="fs-danach">
            {DANACH.map((d, i) => (
              <div key={d.titel} className={`fs-danach-karte fs-auf v${i}`}><h3>{d.titel}</h3><p>{d.text}</p></div>
            ))}
          </div>
          <blockquote className="fs-zitat fs-auf">
            <p>„Ich kann nicht in jedem Klassenzimmer sitzen. Aber ich kann jeden Satz lesen, den du mir schickst – und die Seite danach umbauen.“</p>
            <footer><b>Basti Blumenröther</b> · Gründer von Mythos Mathe</footer>
          </blockquote>
          <div className="fs-knoepfe fs-auf">
            <button type="button" className="fs-knopf gold" onClick={() => zumFormular()}>Feedback geben <i aria-hidden="true">→</i></button>
            <button type="button" className="fs-knopf rand" onClick={() => gehe({ ansicht: "start" })}>Weiter üben</button>
          </div>
        </div>
      </section>

      {/* Handy: feste Leiste */}
      <div className={leisteU ? "fs-leiste-u sichtbar" : "fs-leiste-u"} aria-hidden={!leisteU}>
        <button type="button" className="fs-knopf gold" tabIndex={leisteU ? 0 : -1} onClick={() => zumFormular()} data-feedback-leiste>Feedback geben <i aria-hidden="true">→</i></button>
      </div>
    </div>
  );
}
