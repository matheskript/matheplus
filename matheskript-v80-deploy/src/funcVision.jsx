/* ======================================================================
   VISION – eigene Seite (Adresse /vision, Menüpunkt „Vision“ im Besuchermenü
   der Kopfleiste). Eigener Chunk (lazy in func10.jsx).

   Dramaturgie: Blockbuster-StorySkript (Alexander Christiani). Der Schüler ist
   der Held, Basti der Mentor, die Vision ist die Welt, in die der Held
   aufbricht. Die Angebote kommen erst am Ende – aus der Vision heraus.

     1. HELD      Identität · Wunsch · Einsatz      → Bühne „Eine Generation, die Mathe versteht“ + Einsatz in 01
     2. PROBLEM   außen · innen · Gegenspieler      → 01 Der Gegner (drei Ebenen, der durchgestrichene Mythos)
     3. MENTOR    Empathie · Autorität · Haltung    → 02 Woher die Vision kommt (2 → 1,0, Studium, Versprechen)
     4. LÖSUNG    Plan · Versprechen · Werkzeuge    → 03 Der Plan (Verstehen · Aufschreiben · Trainieren),
                                                     04 Die Haltung, 05 Der Ort, 07 Angebote (Pen & Paper zuerst)
     5. REISE     Handlung · Erfolg · Scheitern     → 06 Zwei Wege, 07 Dein erster Schritt, Abschluss

   Direkter Knopf: „Pen & Paper starten“ (kostenlos) – in der Bühne, bei den Angeboten, am Schluss und auf dem
   Handy als feste Leiste. Übergangs-Knopf: „Die Vision lesen“ bzw. „Alle Werkzeuge ansehen“.
   Kommerzielles (Masterclass) nur hinter ANGEBOT.kurse oder dem Passwort, wie überall.

   Grafiken sind mathematisch exakt: Die Tangente in „Verstehen“ wird aus f′(x₀) berechnet und berührt den Graphen,
   die Vergessenskurve ist ein beschriftetes Modell (Exponentialabfall, nach jeder Wiederholung langsamer).
   Keine Karos (passen nicht zur Marke), keine erfundenen Zahlen, Zitate oder Stimmen.
   Sprünge (Kapitel-Leiste, „Die Vision lesen“) nur über springeZuId("vision-kapitel", …).
   ====================================================================== */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { C } from "./base1.jsx";
import { MathildaName } from "./mathildaName.jsx";
import { MathildaPfade } from "./mathildaBild.jsx";
import { springeZuId } from "./sprung.js";
import { ANGEBOT } from "./angebot.js";
import { useFrei } from "./func2.jsx";
import { DiffKursKachel, VekKursKachel, UnterstufeKachel } from "./funcKursKachel.jsx";
import { MasterclassKachel } from "./funcMasterclass.jsx";
import { VISION_KAPITEL, VISION_ZIELE, TANGENTE, tangente, zahlDe, VERGESSEN, behalten } from "./vision.js";

const NACHT = "#050B1F";
const NACHT2 = "#0B1A44";
const GOLD = C.flaggold;
const GOLD_HELL = "#FFE58A";
const TEXT = "#EEF2FF";
const NEBEL = "#AEBCDD";

/* ---------------------------------------------------------------- Stil */
const CSS = `
html[data-vision-seite] .app-wurzel { background: ${NACHT} !important; }
html[data-vision-seite] .fuss-paar button { color: ${TEXT} !important; background: rgba(255,255,255,0.06) !important; border-color: rgba(255,255,255,0.11) !important; }
.vi { position: relative; font-family: Montserrat, system-ui, sans-serif; color: ${TEXT}; background: ${NACHT}; overflow-x: clip; }
.vi *, .vi *::before, .vi *::after { box-sizing: border-box; }
.vi :where(h1, h2, h3, p, ul, ol, figure, blockquote) { margin: 0; }
.vi button { font-family: inherit; }
.vi button:focus-visible, .vi a:focus-visible { outline: 3px solid ${GOLD}; outline-offset: 3px; }
.vi-innen { width: 100%; max-width: 1120px; margin: 0 auto; padding: 0 20px; }
@media (min-width: 840px) { .vi-innen { padding: 0 40px; } }
.vi-schmal { max-width: 760px; }

/* Abschnitte */
.vi-teil { position: relative; padding: clamp(64px, 9vw, 112px) 0; scroll-margin-top: 56px; }
.vi-dunkel { background: ${NACHT}; color: ${TEXT}; }
.vi-tief { background: radial-gradient(90% 70% at 100% 0%, rgba(0,77,152,0.38) 0%, rgba(0,77,152,0) 60%), linear-gradient(175deg, ${NACHT2} 0%, ${NACHT} 100%); color: ${TEXT}; }
.vi-hell { background: #FFFFFF; color: ${C.tinte}; }
.vi-sand { background: ${C.sand}; color: ${C.tinte}; }
.vi-blattkante { border-radius: 36px 36px 0 0; margin-top: -36px; z-index: 1; box-shadow: 0 -30px 60px -30px rgba(0,0,0,.6); }
.vi-blattkante + .vi-teil { border-radius: 36px 36px 0 0; margin-top: -36px; z-index: 2; }

.vi-kicker { display: flex; align-items: center; gap: 12px; font-size: 12px; font-weight: 800; letter-spacing: .18em; text-transform: uppercase; color: ${GOLD}; }
.vi-kicker::before { content: ""; flex: none; width: 28px; height: 2px; border-radius: 2px; background: currentColor; }
.vi-hell .vi-kicker, .vi-sand .vi-kicker { color: ${C.gruenDunkel}; }
.vi-h2 { margin-top: 18px; font-size: clamp(32px, 7.2vw, 62px); font-weight: 900; letter-spacing: -0.04em; line-height: 1.02; color: #FFFFFF; text-wrap: balance; }
.vi-hell .vi-h2, .vi-sand .vi-h2 { color: ${C.seeTief}; }
.vi-h3 { margin-top: 16px; font-size: clamp(27px, 5.4vw, 44px); font-weight: 900; letter-spacing: -0.035em; line-height: 1.05; color: #FFFFFF; text-wrap: balance; }
.vi-hell .vi-h3, .vi-sand .vi-h3 { color: ${C.seeTief}; }
.vi-gold { background: linear-gradient(180deg, ${GOLD_HELL} 0%, ${GOLD} 55%, #C9931A 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
.vi-hell .vi-gold, .vi-sand .vi-gold { background: linear-gradient(180deg, #D9A400 0%, #B98A00 100%); -webkit-background-clip: text; background-clip: text; }
.vi-text { margin-top: 20px; font-size: clamp(16px, 2.1vw, 18px); font-weight: 300; line-height: 1.72; color: ${NEBEL}; max-width: 62ch; text-wrap: pretty; }
.vi-text b { font-weight: 700; color: #FFFFFF; }
.vi-hell .vi-text, .vi-sand .vi-text { color: ${C.grau}; }
.vi-hell .vi-text b, .vi-sand .vi-text b { color: ${C.seeTief}; }
.vi-klein { font-size: 13px; line-height: 1.55; color: ${NEBEL}; }
.vi-hell .vi-klein, .vi-sand .vi-klein { color: ${C.grau}; }

/* Knöpfe */
.vi-knoepfe { margin-top: 34px; display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
.vi-knopf { display: inline-flex; align-items: center; justify-content: center; gap: 10px; min-height: 54px; padding: 0 22px; border-radius: 999px; border: 2px solid transparent; cursor: pointer;
  font-size: 15.5px; font-weight: 800; letter-spacing: -0.005em; text-decoration: none; transition: transform .16s ease, box-shadow .16s ease, background .16s ease, border-color .16s ease; }
.vi-knopf i { font-style: normal; transition: transform .18s ease; }
@media (hover:hover) { .vi-knopf:hover { transform: translateY(-2px); } .vi-knopf:hover i { transform: translateX(4px); } }
.vi-knopf.gold { color: ${NACHT}; background: linear-gradient(180deg, ${GOLD_HELL} 0%, ${GOLD} 100%); box-shadow: 0 14px 36px -10px rgba(237,187,0,0.55), inset 0 1px 0 rgba(255,255,255,.6); }
.vi-knopf.rand { color: #FFFFFF; background: rgba(5,11,31,0.6); border-color: rgba(255,255,255,0.28); backdrop-filter: blur(4px); }
.vi-hell .vi-knopf.rand, .vi-sand .vi-knopf.rand { color: ${C.seeTief}; background: transparent; border-color: ${C.seeTief}; }
.vi-knopf.navy { color: #FFFFFF; background: ${C.seeTief}; box-shadow: 0 14px 30px -14px rgba(14,30,74,0.7); }
.vi-link { display: inline-flex; align-items: center; gap: 8px; margin-top: 22px; padding: 0; background: none; border: none; cursor: pointer; font-size: 14.5px; font-weight: 800; color: ${GOLD}; }
.vi-hell .vi-link, .vi-sand .vi-link { color: ${C.gruenDunkel}; }
.vi-link i { font-style: normal; transition: transform .18s ease; }
@media (hover:hover) { .vi-link:hover i { transform: translateX(4px); } }
@media (max-width: 520px) { .vi-knoepfe .vi-knopf { width: 100%; } }
@media (max-width: 380px) { .vi-knopf { padding: 0 16px; gap: 8px; font-size: 14.5px; } }

/* Einblenden beim Scrollen (nur mit JS; ohne JS ist alles sichtbar) */
.vi-js .vi-auf { opacity: 0; transform: translateY(22px); transition: opacity .8s ease, transform .8s cubic-bezier(.2,.7,.3,1); }
.vi-js .vi-auf.da { opacity: 1; transform: none; }
.vi:not(.vi-js) .vi-weg svg { clip-path: none; }
.vi:not(.vi-js) .vi-noten .kurve, .vi:not(.vi-js) .vi-noten .leuchten, .vi:not(.vi-js) .vi-ebb .mit { stroke-dashoffset: 0; }
.vi-js .vi-auf.v1 { transition-delay: .08s; } .vi-js .vi-auf.v2 { transition-delay: .16s; } .vi-js .vi-auf.v3 { transition-delay: .24s; }

/* ---------- Bühne ---------- */
.vi-held { position: relative; overflow: hidden; padding: clamp(44px, 8vw, 100px) 0 clamp(64px, 10vw, 128px); background: ${NACHT}; }
.vi-licht { position: absolute; border-radius: 999px; filter: blur(70px); pointer-events: none; }
.vi-licht.a { width: 62vw; height: 62vw; max-width: 720px; max-height: 720px; top: -24vw; right: -18vw; background: radial-gradient(circle, rgba(237,187,0,0.36) 0%, rgba(237,187,0,0) 70%); }
.vi-licht.b { width: 70vw; height: 70vw; max-width: 800px; max-height: 800px; top: 8%; left: -38vw; background: radial-gradient(circle, rgba(0,77,152,0.5) 0%, rgba(0,77,152,0) 70%); }
.vi-held-kurve { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; opacity: .5; }
.vi-held-kurve path { stroke-dasharray: 1; stroke-dashoffset: 1; animation: viStrich 3.2s cubic-bezier(.4,0,.2,1) .2s forwards; }
.vi-held-kopf { position: relative; z-index: 1; }
.vi-held-raster { position: relative; z-index: 1; margin-top: clamp(22px, 3vw, 34px); display: grid; grid-template-columns: minmax(0, 1fr); gap: 44px; align-items: center; }
@media (min-width: 980px) { .vi-held-raster { grid-template-columns: minmax(0, 1.12fr) minmax(0, 0.88fr); gap: 56px; } }
.vi-held h1 { margin-top: 20px; font-size: clamp(34px, 8.6vw, 92px); font-weight: 900; letter-spacing: -0.05em; line-height: .96; color: #FFFFFF; text-shadow: 0 14px 50px rgba(0,0,0,.45); }
@media (min-width: 980px) { .vi-held h1 { font-size: clamp(64px, 7.4vw, 92px); } }
.vi-held h1 .vi-gold { display: block; padding-bottom: .06em; }
.vi-lead { font-size: clamp(19px, 4.6vw, 25px); font-weight: 300; line-height: 1.4; color: ${TEXT}; max-width: 30ch; text-wrap: pretty; }
.vi-lead b { font-weight: 700; color: #FFFFFF; }
.vi-unter { margin-top: 16px; font-size: 15.5px; line-height: 1.6; color: ${NEBEL}; max-width: 46ch; }

/* Das Blatt mit der Rechnung (Gleichheitszeichen untereinander) */
.vi-blatt { position: relative; container-type: inline-size; border-radius: 26px; padding: clamp(22px, 5vw, 36px) clamp(18px, 4.6vw, 34px);
  background: linear-gradient(160deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.035) 60%, rgba(255,255,255,0.02) 100%);
  border: 1px solid rgba(255,255,255,0.12); box-shadow: 0 50px 90px -50px rgba(0,0,0,.95), inset 0 1px 0 rgba(255,255,255,0.12); backdrop-filter: blur(6px); }
.vi-blatt-titel { font-size: 11.5px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; color: ${NEBEL}; }
.vi-gl { margin-top: 18px; display: grid; grid-template-columns: max-content max-content max-content; column-gap: .42em; row-gap: .42em; align-items: baseline;
  font-size: clamp(17px, 6.9cqw, 46px); font-weight: 800; letter-spacing: -0.02em; line-height: 1.15; color: #FFFFFF; }
.vi-gl .l { text-align: right; }
.vi-gl .m { text-align: center; font-weight: 500; color: ${NEBEL}; }
.vi-gl .r { white-space: nowrap; }
.vi-gl .z1 { animation: viEin .7s ease .35s both; }
.vi-gl .z2 { animation: viEin .7s ease 2.1s both; }
.vi-gl .z3 { animation: viEin .7s ease 2.8s both; }
.vi-weg { position: relative; display: inline-block; color: rgba(255,255,255,0.62); }
.vi-weg svg { position: absolute; left: -8%; top: 50%; width: 116%; height: .62em; transform: translateY(-46%); overflow: visible; }
.vi-weg path { fill: none; stroke: ${GOLD}; stroke-width: 3.2; stroke-linecap: round; vector-effect: non-scaling-stroke; }
.vi-weg svg, .vi-erfolg svg { clip-path: inset(-50% 100% -50% 0); }
.vi-held .vi-weg svg { animation: viAufdecken .75s cubic-bezier(.6,0,.2,1) 1.15s forwards; }
.vi-notiz { position: absolute; left: 100%; top: -.95em; margin-left: .15em; font-size: .42em; font-weight: 800; letter-spacing: .02em; color: ${GOLD}; transform: rotate(-8deg); white-space: nowrap; }
.vi-held .vi-notiz { animation: viEin .5s ease 1.75s both; }
.vi-erfolg { position: relative; display: inline-block; }
.vi-erfolg svg { position: absolute; left: -2%; bottom: -.32em; width: 104%; height: .34em; overflow: visible; }
.vi-erfolg path { fill: none; stroke: ${GOLD}; stroke-width: 2.6; stroke-linecap: round; vector-effect: non-scaling-stroke; }
.vi-erfolg svg { animation: viAufdecken .6s ease 3.4s forwards; }
.vi-blatt-fuss { margin-top: 22px; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 13px; line-height: 1.55; color: ${NEBEL}; }
.vi-blatt-fuss b { color: #FFFFFF; font-weight: 700; }
@keyframes viEin { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
@keyframes viStrich { to { stroke-dashoffset: 0; } }
@keyframes viAufdecken { to { clip-path: inset(-50% 0 -50% 0); } }

/* Kapitelübersicht unter der Bühne */
.vi-kapitel { position: relative; z-index: 1; margin-top: clamp(48px, 7vw, 76px); display: flex; flex-wrap: wrap; gap: 8px; }
.vi-kapitel button { display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px 8px 10px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.14); background: rgba(255,255,255,0.04); color: ${NEBEL}; font-size: 13px; font-weight: 700; cursor: pointer; transition: border-color .15s ease, color .15s ease; }
.vi-kapitel button b { font-size: 11px; font-weight: 900; color: ${GOLD}; letter-spacing: .04em; }
@media (hover:hover) { .vi-kapitel button:hover { border-color: rgba(237,187,0,0.6); color: #FFFFFF; } }

/* Kapitel-Leiste links (nur breite Bildschirme) */
.vi-leiste-l { display: none; }
@media (min-width: 1360px) {
  .vi-leiste-l { display: flex; position: fixed; left: 26px; top: 50%; transform: translateY(-50%); z-index: 30; flex-direction: column; gap: 4px; opacity: 0; pointer-events: none; transition: opacity .3s ease; }
  .vi-leiste-l.sichtbar { opacity: 1; pointer-events: auto; }
  .vi-leiste-l button { display: flex; align-items: center; gap: 10px; padding: 5px 0; background: none; border: none; cursor: pointer; color: rgba(174,188,221,0.55); font-size: 11.5px; font-weight: 800; letter-spacing: .06em; text-align: left; }
  .vi-leiste-l button i { flex: none; width: 18px; height: 2px; border-radius: 2px; background: currentColor; transition: width .25s ease; }
  .vi-leiste-l button span { opacity: 0; transform: translateX(-4px); transition: opacity .2s ease, transform .2s ease; white-space: nowrap; }
  .vi-leiste-l:hover button span, .vi-leiste-l button[aria-current="true"] span { opacity: 1; transform: none; }
  .vi-leiste-l button[aria-current="true"] { color: ${GOLD}; }
  .vi-leiste-l button[aria-current="true"] i { width: 34px; }
  .vi-leiste-l.hell button { color: rgba(90,101,130,0.6); }
  .vi-leiste-l.hell button[aria-current="true"] { color: ${C.gruenDunkel}; }
}

/* Handy: feste Leiste mit dem direkten Knopf */
.vi-leiste-u { position: fixed; left: 0; right: 0; bottom: 0; z-index: 40; padding: 10px 16px calc(10px + env(safe-area-inset-bottom)); background: rgba(5,11,31,0.9); backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: center; transform: translateY(110%); transition: transform .3s ease; }
.vi-leiste-u.sichtbar { transform: none; }
.vi-leiste-u .vi-knopf { width: 100%; max-width: 440px; min-height: 50px; }
@media (min-width: 900px) { .vi-leiste-u { display: none; } }

/* ---------- 01 Der Gegner ---------- */
.vi-ebenen { margin-top: clamp(40px, 6vw, 64px); display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; }
@media (min-width: 900px) { .vi-ebenen { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; } }
.vi-ebene { position: relative; border-radius: 22px; padding: 22px 22px 24px; border: 1px solid rgba(255,255,255,0.1);
  background: linear-gradient(160deg, rgba(255,255,255,0.075) 0%, rgba(255,255,255,0.025) 100%); }
.vi-ebene .wo { font-size: 11.5px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; color: ${NEBEL}; }
.vi-ebene blockquote { margin-top: 14px; font-size: clamp(21px, 4.8vw, 25px); font-weight: 800; letter-spacing: -0.025em; line-height: 1.15; color: #FFFFFF; }
.vi-ebene p { margin-top: 12px; font-size: 15px; line-height: 1.62; color: ${NEBEL}; }
.vi-ebene.gegner { border-color: rgba(237,187,0,0.6); background: radial-gradient(120% 90% at 100% 0%, rgba(237,187,0,0.16) 0%, rgba(237,187,0,0) 60%), linear-gradient(160deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%); }
.vi-ebene.gegner .wo { color: ${GOLD}; }
.vi-mythos { margin-top: clamp(64px, 10vw, 120px); text-align: center; }
.vi-mythos .gross { font-size: clamp(48px, 12.4vw, 112px); font-weight: 900; letter-spacing: -0.055em; line-height: 1; color: #FFFFFF; text-wrap: balance; }
.vi-mythos .vi-weg { color: rgba(255,255,255,0.42); }
.vi-mythos .vi-weg svg { height: .5em; transition: clip-path .9s cubic-bezier(.6,0,.2,1) .35s; }
.vi-mythos .vi-weg path { stroke-width: 5; }
.vi-mythos.da .vi-weg svg { clip-path: inset(-50% 0 -50% 0); }
.vi-mythos .antwort { margin: clamp(26px, 4vw, 40px) auto 0; font-size: clamp(25px, 5.4vw, 46px); font-weight: 900; letter-spacing: -0.035em; line-height: 1.1; max-width: 20ch; color: #FFFFFF; text-wrap: balance; }
.vi-einsatz { margin: clamp(36px, 5vw, 52px) auto 0; max-width: 56ch; font-size: clamp(16px, 2.1vw, 18px); font-weight: 300; line-height: 1.7; color: ${NEBEL}; text-align: center; text-wrap: pretty; }
.vi-einsatz b { color: #FFFFFF; font-weight: 700; }

/* ---------- 02 Woher die Vision kommt ---------- */
.vi-zwei { display: grid; grid-template-columns: minmax(0, 1fr); gap: 44px; align-items: center; }
@media (min-width: 980px) { .vi-zwei { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 64px; } .vi-zwei.umgekehrt > :first-child { order: 2; } }
.vi-karte { border-radius: 26px; border: 1px solid rgba(255,255,255,0.12); background: linear-gradient(160deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.025) 100%);
  box-shadow: 0 40px 80px -50px rgba(0,0,0,.9), inset 0 1px 0 rgba(255,255,255,0.08); padding: clamp(18px, 4vw, 28px); }
.vi-karte-titel { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; font-size: 11.5px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; color: ${NEBEL}; }
.vi-karte-titel span:last-child { letter-spacing: .04em; text-transform: none; font-weight: 600; }
.vi-noten { display: block; width: 100%; height: auto; margin-top: 14px; overflow: visible; }
.vi-noten .kurve { fill: none; stroke: ${GOLD}; stroke-width: 3.4; stroke-linecap: round; stroke-dasharray: 1; stroke-dashoffset: 1; transition: stroke-dashoffset 1.6s cubic-bezier(.4,0,.2,1) .2s; }
.vi-noten .leuchten { fill: none; stroke: ${GOLD}; stroke-width: 14; opacity: .2; filter: blur(5px); stroke-dasharray: 1; stroke-dashoffset: 1; transition: stroke-dashoffset 1.6s cubic-bezier(.4,0,.2,1) .2s; }
.da .vi-noten .kurve, .da .vi-noten .leuchten { stroke-dashoffset: 0; }
.vi-stationen { margin-top: 16px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.vi-station { border-radius: 14px; padding: 10px 10px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); }
.vi-station .k { font-size: 11px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: ${NEBEL}; }
.vi-station .n { margin-top: 4px; font-size: clamp(20px, 5vw, 28px); font-weight: 900; letter-spacing: -0.03em; color: #FFFFFF; line-height: 1; }
.vi-station .t { margin-top: 6px; font-size: 12px; line-height: 1.4; color: ${NEBEL}; }
.vi-station.ziel { border-color: rgba(237,187,0,0.6); background: rgba(237,187,0,0.08); }
.vi-station.ziel .n { color: ${GOLD}; }
.vi-zitat { margin-top: 34px; padding: 4px 0 4px 22px; border-left: 3px solid ${GOLD}; }
.vi-zitat p { font-size: clamp(20px, 3.6vw, 26px); font-weight: 700; letter-spacing: -0.02em; line-height: 1.32; color: #FFFFFF; text-wrap: pretty; }
.vi-zitat footer { margin-top: 14px; font-size: 13.5px; color: ${NEBEL}; }
.vi-zitat footer b { color: #FFFFFF; font-weight: 700; }
.vi-fakten { margin-top: 26px; display: flex; flex-wrap: wrap; gap: 8px; }
.vi-fakten span { display: inline-flex; align-items: center; gap: 8px; padding: 8px 13px; border-radius: 999px; font-size: 13px; font-weight: 700; color: ${TEXT}; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); }
.vi-fakten span::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: ${GOLD}; }

/* ---------- 03 Der Plan ---------- */
.vi-schritte { position: relative; margin-top: clamp(40px, 6vw, 64px); display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; counter-reset: schritt; }
@media (min-width: 900px) { .vi-schritte { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; } }
.vi-schritt { position: relative; display: flex; flex-direction: column; align-items: flex-start; justify-content: flex-start; text-align: left; cursor: pointer; border-radius: 24px; padding: 24px 22px 22px; border: 1px solid rgba(255,255,255,0.12); color: inherit;
  background: linear-gradient(160deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.025) 100%); transition: transform .18s ease, border-color .18s ease; }
@media (hover:hover) { .vi-schritt:hover { transform: translateY(-3px); border-color: rgba(237,187,0,0.6); } }
.vi-schritt .nr { display: inline-flex; align-items: center; justify-content: center; width: 46px; height: 46px; border-radius: 14px; font-size: 22px; font-weight: 900; color: ${NACHT};
  background: linear-gradient(180deg, ${GOLD_HELL} 0%, ${GOLD} 100%); box-shadow: 0 10px 26px -8px rgba(237,187,0,0.6); }
.vi-schritt h3 { margin-top: 18px; font-size: 26px; font-weight: 900; letter-spacing: -0.03em; color: #FFFFFF; }
.vi-schritt p { margin-top: 8px; font-size: 15px; line-height: 1.6; color: ${NEBEL}; }
.vi-schritt .mehr { margin-top: 16px; display: inline-flex; gap: 8px; font-size: 13.5px; font-weight: 800; color: ${GOLD}; }
.vi-formel { margin: clamp(40px, 6vw, 60px) auto 0; display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center; }
.vi-formel .zeile { display: inline-flex; flex-wrap: wrap; justify-content: center; align-items: baseline; gap: .38em; font-size: clamp(26px, 6vw, 46px); font-weight: 900; letter-spacing: -0.03em; color: #FFFFFF; }
.vi-formel .zeile .op { font-weight: 500; color: ${NEBEL}; }
.vi-formel p { max-width: 52ch; font-size: 15.5px; line-height: 1.65; color: ${NEBEL}; }

/* Schritt-Abschnitte */
.vi-schritt-kopf { display: flex; align-items: center; gap: 14px; }
.vi-schritt-kopf .nr { flex: none; display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 12px; font-size: 19px; font-weight: 900; color: ${NACHT};
  background: linear-gradient(180deg, ${GOLD_HELL} 0%, ${GOLD} 100%); }
.vi-hell .vi-schritt-kopf .nr { color: #FFFFFF; background: ${C.seeTief}; }
.vi-schritt-kopf .vi-kicker::before { display: none; }
.vi-liste { list-style: none; padding: 0; margin-top: 26px; display: grid; gap: 12px; }
.vi-liste li { display: grid; grid-template-columns: 22px minmax(0, 1fr); gap: 12px; align-items: start; font-size: 15.5px; line-height: 1.55; color: ${TEXT}; }
.vi-hell .vi-liste li, .vi-sand .vi-liste li { color: ${C.tinte}; }
.vi-liste li svg { margin-top: 1px; }

/* Verstehen: Tangente live */
.vi-plot { position: relative; }
.vi-plot svg { display: block; width: 100%; height: auto; touch-action: pan-y; cursor: ew-resize; user-select: none; -webkit-user-select: none; }
.vi-plot-kopf { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: baseline; gap: 6px 14px; }
.vi-plot-kopf .f { font-size: 15px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.01em; }
.vi-plot-kopf .w { font-size: 13.5px; font-weight: 700; color: ${NEBEL}; font-variant-numeric: tabular-nums; }
.vi-plot-kopf .w b { color: ${GOLD}; font-weight: 800; }
.vi-plot-status { min-height: 1.6em; margin-top: 10px; font-size: 13.5px; font-weight: 700; color: ${NEBEL}; }
.vi-plot-status.null { color: ${GOLD}; }

/* Aufschreiben: Vorher / Nachher */
.vi-vn { margin-top: clamp(36px, 5vw, 56px); display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; }
@media (min-width: 900px) { .vi-vn { grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr); gap: 22px; align-items: start; } }
.vi-vn-karte { border-radius: 22px; padding: 20px 20px 22px; border: 1px solid ${C.linie}; background: #FFFFFF; box-shadow: 0 20px 44px -30px rgba(14,30,74,0.35); }
.vi-vn-karte .et { font-size: 11.5px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; color: ${C.hellgrau}; }
.vi-vn-karte.nachher { border-color: rgba(237,187,0,0.7); box-shadow: 0 0 0 1px rgba(237,187,0,0.35), 0 26px 50px -30px rgba(14,30,74,0.4); }
.vi-vn-karte.nachher .et { color: ${C.gruenDunkel}; }
.vi-quetsch { margin-top: 18px; overflow-x: auto; font-size: clamp(17px, 4.6vw, 21px); font-weight: 600; letter-spacing: -0.06em; color: #4A5470; white-space: nowrap; transform: rotate(-1.2deg); transform-origin: left center; padding: 6px 2px 10px; }
.vi-vn-karte .frage { margin-top: 12px; font-size: 14px; line-height: 1.55; color: ${C.grau}; }
.vi-rechnung { margin-top: 18px; display: grid; grid-template-columns: max-content max-content max-content; column-gap: .5em; row-gap: .55em; align-items: baseline;
  font-size: clamp(19px, 5vw, 26px); font-weight: 600; color: ${C.seeTief}; overflow-x: auto; }
.vi-rechnung .l { text-align: right; } .vi-rechnung .m { text-align: center; }
.vi-zaun { padding: 0 .42em; }
.vi-kasten { display: inline-block; padding: .08em .38em; border: 2px solid ${C.seeTief}; border-radius: 6px; }
.vi-regeln { list-style: none; padding: 0; margin-top: 20px; display: grid; gap: 10px; }
.vi-regeln li { display: grid; grid-template-columns: 26px minmax(0, 1fr); gap: 10px; font-size: 14px; line-height: 1.5; color: ${C.grau}; }
.vi-regeln li b { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 999px; font-size: 12px; font-weight: 900; color: ${NACHT}; background: ${GOLD}; }
.vi-regeln li strong { color: ${C.seeTief}; font-weight: 700; }
.vi-gesetze { margin-top: clamp(40px, 6vw, 64px); display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; }
@media (min-width: 900px) { .vi-gesetze { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 22px; } }
.vi-gesetz { border-radius: 22px; padding: 22px; background: ${C.sand}; border: 1px solid ${C.linie}; }
.vi-gesetz .et { font-size: 11.5px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; color: ${C.gruenDunkel}; }
.vi-gesetz p { margin-top: 10px; font-size: clamp(19px, 3.4vw, 23px); font-weight: 800; letter-spacing: -0.02em; line-height: 1.3; color: ${C.seeTief}; text-wrap: pretty; }
.vi-blanko { margin-top: 22px; display: grid; grid-template-columns: 54px minmax(0, 1fr); gap: 16px; align-items: center; padding: 18px; border-radius: 20px; border: 1px dashed ${C.hellgrau}; }
.vi-blanko p { font-size: 15px; line-height: 1.6; color: ${C.grau}; }
.vi-blanko p b { color: ${C.seeTief}; }

/* Trainieren: Mathilda + Vergessenskurve */
.vi-pruef { border-radius: 26px; overflow: hidden; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.04); box-shadow: 0 40px 80px -50px rgba(0,0,0,.95); }
.vi-pruef-kopf { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,0.1); }
.vi-avatar { flex: none; width: 42px; height: 42px; border-radius: 999px; overflow: hidden; background: linear-gradient(155deg, #0A5AB0 0%, ${C.see} 45%, ${C.seeTief} 100%); box-shadow: 0 0 0 2px ${GOLD}; }
.vi-avatar svg { display: block; width: 100%; height: 100%; }
.vi-pruef-kopf .name { display: block; font-size: 15px; font-weight: 800; color: #FFFFFF; }
.vi-pruef-kopf .unter { display: block; font-size: 12.5px; color: ${NEBEL}; }
.vi-pruef-blatt { margin: 16px; border-radius: 16px; background: #FFFFFF; color: ${C.seeTief}; padding: 14px 12px; }
.vi-pz { display: grid; grid-template-columns: 26px max-content max-content max-content; column-gap: .45em; align-items: baseline; padding: 7px 8px; border-radius: 10px; font-size: clamp(16px, 4.3vw, 19px); font-weight: 600; }
.vi-pz .nr { font-size: 12px; font-weight: 800; color: ${C.hellgrau}; }
.vi-pz .l { text-align: right; }
.vi-pz.fehler { background: rgba(184,92,46,0.1); box-shadow: inset 3px 0 0 ${C.signal}; }
.vi-pz.fehler .nr { color: ${C.signal}; }
.vi-pz.folge { opacity: .55; }
.vi-blase { margin: 0 16px 16px; padding: 16px; border-radius: 4px 18px 18px 18px; background: linear-gradient(160deg, ${NACHT2} 0%, #0A1538 100%); border: 1px solid rgba(255,255,255,0.1); font-size: 14.5px; line-height: 1.62; color: ${TEXT}; }
.vi-blase b { color: #FFFFFF; }
.vi-blase .hebel { margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1); }
.vi-blase .hebel b { color: ${GOLD}; }
.vi-m { white-space: nowrap; font-weight: 700; color: #FFFFFF; }
.vi-ebb { margin-top: clamp(56px, 8vw, 96px); }
.vi-ebb svg { display: block; width: 100%; height: auto; overflow: visible; }
.vi-ebb .mit { fill: none; stroke: ${GOLD}; stroke-width: 3; stroke-linejoin: round; stroke-dasharray: 1; stroke-dashoffset: 1; transition: stroke-dashoffset 2.2s cubic-bezier(.4,0,.2,1) .2s; }
.da .vi-ebb .mit, .vi-ebb.da .mit { stroke-dashoffset: 0; }
.vi-legende { margin-top: 12px; display: flex; flex-wrap: wrap; gap: 8px 18px; font-size: 12.5px; color: ${NEBEL}; }
.vi-legende span { display: inline-flex; align-items: center; gap: 8px; }
.vi-legende i { display: inline-block; width: 22px; height: 0; border-top: 3px solid ${GOLD}; }
.vi-legende i.ohne { border-top: 2px dashed rgba(174,188,221,0.6); }

/* ---------- 04 Die Haltung ---------- */
.vi-manifest { list-style: none; padding: 0; margin-top: clamp(36px, 5vw, 56px); display: grid; gap: clamp(20px, 3vw, 28px); counter-reset: m; }
.vi-manifest li { display: grid; grid-template-columns: 44px minmax(0, 1fr); gap: 10px; align-items: baseline; }
.vi-manifest li::before { counter-increment: m; content: counter(m, decimal-leading-zero); font-size: 13px; font-weight: 900; letter-spacing: .06em; color: ${GOLD}; }
.vi-manifest li p { font-size: clamp(21px, 4.4vw, 34px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.18; color: #FFFFFF; text-wrap: pretty; }
.vi-manifest li p span { color: ${NEBEL}; font-weight: 600; }
.vi-schluss-satz { margin-top: clamp(48px, 7vw, 80px); padding-top: clamp(32px, 5vw, 48px); border-top: 1px solid rgba(255,255,255,0.12); font-size: clamp(26px, 5.6vw, 50px); font-weight: 900; letter-spacing: -0.04em; line-height: 1.08; color: #FFFFFF; text-wrap: balance; }
.vi-fragen { margin-top: clamp(40px, 6vw, 60px); }
.vi-fragen ol { margin-top: 14px; padding: 0; list-style: none; display: grid; gap: 8px; counter-reset: f; }
@media (min-width: 900px) { .vi-fragen ol { grid-template-columns: repeat(5, minmax(0, 1fr)); } }
.vi-fragen li { counter-increment: f; display: flex; gap: 10px; align-items: baseline; padding: 12px 14px; border-radius: 14px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); font-size: 14.5px; font-weight: 700; line-height: 1.35; color: #FFFFFF; }
@media (min-width: 900px) { .vi-fragen li { flex-direction: column; gap: 8px; } }
.vi-fragen li::before { content: counter(f); flex: none; font-size: 12px; font-weight: 900; color: ${GOLD}; }

/* ---------- 05 Der Ort ---------- */
.vi-rollen { margin-top: clamp(36px, 5vw, 56px); display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; }
@media (min-width: 900px) { .vi-rollen { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; } }
.vi-rolle { display: flex; flex-direction: column; align-items: flex-start; justify-content: flex-start; text-align: left; border-radius: 22px; padding: 22px; background: #FFFFFF; border: 1px solid ${C.linie}; box-shadow: 0 18px 40px -30px rgba(14,30,74,0.35); color: inherit; }
button.vi-rolle { cursor: pointer; transition: transform .18s ease, border-color .18s ease; }
@media (hover:hover) { button.vi-rolle:hover { transform: translateY(-3px); border-color: ${GOLD}; } }
.vi-rolle .zeichen { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; background: ${C.himmel}; color: ${C.seeTief}; }
.vi-rolle h3 { margin-top: 16px; font-size: 22px; font-weight: 900; letter-spacing: -0.03em; color: ${C.seeTief}; }
.vi-rolle p { margin-top: 8px; font-size: 15px; line-height: 1.6; color: ${C.grau}; }
.vi-rolle .weiter { margin-top: auto; padding-top: 16px; font-size: 13.5px; font-weight: 800; color: ${C.gruenDunkel}; }
.vi-saeulen { margin-top: 14px; display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; }
@media (min-width: 900px) { .vi-saeulen { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; margin-top: 18px; } }
.vi-saeule { border-radius: 22px; padding: 22px; background: ${C.seeTief}; color: ${TEXT}; position: relative; overflow: hidden; }
.vi-saeule::after { content: ""; position: absolute; width: 220px; height: 220px; right: -80px; top: -90px; border-radius: 999px; background: radial-gradient(circle, rgba(237,187,0,0.3) 0%, rgba(237,187,0,0) 70%); pointer-events: none; }
.vi-saeule > * { position: relative; z-index: 1; }
.vi-saeule .et { font-size: 11.5px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; color: ${GOLD}; }
.vi-saeule h3 { margin-top: 10px; font-size: 22px; font-weight: 900; letter-spacing: -0.03em; color: #FFFFFF; }
.vi-saeule p { margin-top: 8px; font-size: 15px; line-height: 1.6; color: ${NEBEL}; }
.vi-ziel { margin-top: clamp(56px, 8vw, 96px); text-align: center; }
.vi-ziel .et { font-size: 12px; font-weight: 800; letter-spacing: .18em; text-transform: uppercase; color: ${C.gruenDunkel}; }
.vi-ziel p.gross { margin: 16px auto 0; max-width: 22ch; font-size: clamp(28px, 6.4vw, 56px); font-weight: 900; letter-spacing: -0.04em; line-height: 1.06; color: ${C.seeTief}; text-wrap: balance; }
.vi-ziel p.klein { margin: 18px auto 0; max-width: 54ch; font-size: clamp(16px, 2.1vw, 18px); line-height: 1.7; font-weight: 300; color: ${C.grau}; }

/* ---------- 06 Zwei Wege ---------- */
.vi-wege { margin-top: clamp(36px, 5vw, 56px); display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; }
@media (min-width: 900px) { .vi-wege { grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr); gap: 18px; align-items: start; } }
.vi-weg-karte { border-radius: 24px; padding: 24px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.03); }
.vi-weg-karte .et { font-size: 11.5px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; color: ${NEBEL}; }
.vi-weg-karte h3 { margin-top: 12px; font-size: clamp(22px, 4.4vw, 28px); font-weight: 900; letter-spacing: -0.03em; line-height: 1.12; color: #FFFFFF; }
.vi-weg-karte p { margin-top: 12px; font-size: 15px; line-height: 1.65; color: ${NEBEL}; }
.vi-weg-karte.stehen h3 { color: rgba(255,255,255,0.72); }
.vi-weg-karte.gehen { border-color: rgba(237,187,0,0.6); background: radial-gradient(120% 80% at 100% 0%, rgba(237,187,0,0.14) 0%, rgba(237,187,0,0) 60%), rgba(255,255,255,0.04); }
.vi-weg-karte.gehen .et { color: ${GOLD}; }
.vi-wandel { list-style: none; padding: 0; margin-top: 16px; display: grid; gap: 10px; }
.vi-wandel li { display: grid; grid-template-columns: minmax(0, 1fr) 22px minmax(0, 1fr); gap: 10px; align-items: center; padding: 10px 12px; border-radius: 14px; background: rgba(255,255,255,0.04); font-size: 14px; line-height: 1.4; }
.vi-wandel .vor { color: rgba(174,188,221,0.75); text-decoration: line-through; text-decoration-color: rgba(174,188,221,0.45); }
.vi-wandel .nach { color: #FFFFFF; font-weight: 700; }
.vi-wandel .pf { color: ${GOLD}; font-weight: 900; text-align: center; }

/* ---------- 07 Dein erster Schritt (Angebote) ---------- */
.vi-pp { margin-top: clamp(36px, 5vw, 56px); display: grid; grid-template-columns: minmax(0, 1fr); border-radius: 30px; overflow: hidden; background: #FFFFFF; color: ${C.tinte};
  box-shadow: 0 0 0 1px rgba(237,187,0,0.6), 0 50px 100px -50px rgba(0,0,0,1); }
@media (min-width: 900px) { .vi-pp { grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr); } }
.vi-pp-text { padding: clamp(24px, 5vw, 44px); }
.vi-pp-marke { display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 800; letter-spacing: .04em; color: ${C.gruenDunkel}; background: #FFF6D1; }
.vi-pp h3 { margin-top: 16px; font-size: clamp(34px, 7vw, 54px); font-weight: 900; letter-spacing: -0.045em; line-height: 1; color: ${C.seeTief}; }
.vi-pp .zeile { margin-top: 12px; font-size: clamp(16px, 2.2vw, 18px); line-height: 1.6; color: ${C.grau}; max-width: 46ch; }
.vi-stufen { margin-top: 20px; display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.vi-stufen span { padding: 6px 10px; border-radius: 10px; font-size: 12.5px; font-weight: 800; color: ${C.seeTief}; background: ${C.himmel}; }
.vi-stufen em { font-style: normal; color: ${C.hellgrau}; font-weight: 800; }
.vi-pp .vi-liste li { font-size: 15px; color: ${C.tinte}; }
.vi-pp-bild { position: relative; display: flex; align-items: center; justify-content: center; padding: clamp(24px, 5vw, 40px); background: radial-gradient(120% 90% at 0% 0%, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 55%), linear-gradient(155deg, #0A5AB0 0%, ${C.see} 40%, ${C.seeTief} 100%); }
.vi-mini { width: 100%; max-width: 330px; border-radius: 18px; background: #FFFFFF; padding: 22px 20px 26px; transform: rotate(-2deg); box-shadow: 0 30px 60px -24px rgba(5,11,31,0.75); }
.vi-mini .et { font-size: 11px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: ${C.hellgrau}; }
.vi-mini .vi-rechnung { grid-template-columns: max-content max-content max-content max-content; margin-top: 14px; font-size: clamp(19px, 5vw, 24px); }
.vi-mini .k { font-size: .7em; font-weight: 600; color: ${C.gruen}; padding-left: .7em; }
.vi-weiter-titel { margin-top: clamp(52px, 7vw, 80px); font-size: 12px; font-weight: 800; letter-spacing: .18em; text-transform: uppercase; color: ${NEBEL}; }
.vi-angebote { margin-top: 16px; display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; }
@media (min-width: 900px) { .vi-angebote { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; } }
.vi-angebot { display: flex; flex-direction: column; align-items: flex-start; justify-content: flex-start; text-align: left; cursor: pointer; border-radius: 22px; padding: 22px; color: inherit;
  border: 1px solid rgba(255,255,255,0.12); background: linear-gradient(160deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.025) 100%); transition: transform .18s ease, border-color .18s ease; }
@media (hover:hover) { .vi-angebot:hover { transform: translateY(-3px); border-color: rgba(237,187,0,0.6); } }
.vi-angebot.gold { border-color: rgba(237,187,0,0.6); background: radial-gradient(120% 90% at 100% 0%, rgba(237,187,0,0.16) 0%, rgba(237,187,0,0) 60%), linear-gradient(160deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%); }
.vi-angebot .et { font-size: 11.5px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: ${NEBEL}; }
.vi-angebot h3 { margin-top: 10px; font-size: 23px; font-weight: 900; letter-spacing: -0.03em; color: #FFFFFF; }
.vi-angebot p { margin-top: 8px; font-size: 14.5px; line-height: 1.6; color: ${NEBEL}; }
.vi-angebot .weiter { margin-top: auto; padding-top: 18px; display: inline-flex; gap: 8px; font-size: 13.5px; font-weight: 800; color: ${GOLD}; }
.vi-angebot-kopf { display: flex; align-items: center; gap: 12px; }
.vi-kurse { margin-top: 18px; display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; }
.vi-wieder > [style*="calc(100% + 32px)"] { width: 100% !important; margin-left: 0 !important; margin-right: 0 !important; }
.vi-spende { margin-top: clamp(40px, 6vw, 64px); display: grid; grid-template-columns: minmax(0, 1fr); gap: 18px; align-items: center; border-radius: 24px; padding: 24px; border: 1px dashed rgba(237,187,0,0.55); background: rgba(237,187,0,0.05); }
@media (min-width: 900px) { .vi-spende { grid-template-columns: minmax(0, 1fr) auto; padding: 28px 32px; } }
.vi-spende h3 { font-size: 22px; font-weight: 900; letter-spacing: -0.03em; color: #FFFFFF; }
.vi-spende p { margin-top: 8px; font-size: 15px; line-height: 1.6; color: ${NEBEL}; max-width: 60ch; }

/* ---------- Abschluss ---------- */
.vi-ende { position: relative; overflow: hidden; text-align: center; padding: clamp(72px, 10vw, 128px) 0 clamp(80px, 11vw, 136px);
  background: radial-gradient(46% 40% at 50% 100%, rgba(237,187,0,0.16) 0%, rgba(237,187,0,0) 100%), linear-gradient(180deg, ${NACHT} 0%, ${NACHT2} 100%); }
.vi-ende .vi-formel .zeile { font-size: clamp(32px, 8vw, 76px); }
.vi-ende .text { margin: 26px auto 0; max-width: 40ch; font-size: clamp(18px, 3vw, 22px); font-weight: 300; line-height: 1.55; color: ${TEXT}; }
.vi-ende .vi-knoepfe { justify-content: center; }
.vi-leiste-platz { height: 0; }
@media (max-width: 899px) { .vi-leiste-platz { height: 76px; } }

@media (prefers-reduced-motion: reduce) {
  .vi-js .vi-auf { opacity: 1; transform: none; transition: none; }
  .vi-weg svg, .vi-erfolg svg { animation: none !important; transition: none !important; clip-path: none !important; }
  .vi-held-kurve path, .vi-noten .kurve, .vi-noten .leuchten, .vi-ebb .mit { animation: none !important; transition: none !important; stroke-dashoffset: 0 !important; }
  .vi-gl .z1, .vi-gl .z2, .vi-gl .z3, .vi-held .vi-notiz { animation: none !important; }
  .vi-knopf, .vi-schritt, .vi-angebot, .vi-rolle { transition: none; }
}
`;

/* ---------------------------------------------------------------- Inhalte */
const EBENEN = [
  { wo: "Auf dem Blatt", zitat: "„Ich check’s einfach nicht.“",
    text: "Lücken aus dem letzten Jahr, Klausuren, die ohne Plan beginnen, Stoff, der nach den Ferien wieder weg ist. Mehr Aufgaben bringen nicht mehr Note." },
  { wo: "Im Kopf", zitat: "„Ich bin halt kein Mathe-Typ.“",
    text: "Der Satz kommt vor jeder Aufgabe. Dazu die Angst vor der nächsten Arbeit, die Scham beim Abfragen – und zu Hause immer wieder dasselbe Thema." },
  { wo: "Der eigentliche Gegner", zitat: "„Mathe ist Talent.“", gegner: true,
    text: "Dieser Satz sagt dir, dass es an dir liegt. Dabei hat dir nur nie jemand gezeigt, wie man Mathe lernt. Und genau das ist lernbar." },
];

const SCHRITTE = [
  { nr: 1, titel: "Verstehen", text: "Sehen, was eine Formel bedeutet. Herleiten, statt auswendig zu lernen.", ziel: "schritt-verstehen" },
  { nr: 2, titel: "Aufschreiben", text: "Ein Schritt pro Zeile, Gleichheitszeichen untereinander. Dein Blatt denkt mit.", ziel: "schritt-aufschreiben" },
  { nr: 3, titel: "Trainieren", text: "Feedback auf deinen Weg, nicht nur auf das Ergebnis. Wiederholen im richtigen Abstand.", ziel: "schritt-trainieren" },
];

const MANIFEST = [
  ["Ich erwarte nicht, alles sofort zu verstehen.", " Ich erwarte von mir, präzise herauszufinden, was ich noch nicht verstehe."],
  ["Ein Fehler ist kein Urteil über mich.", " Er zeigt mir die Stelle, an der mein Weg bricht."],
  ["Ich konsumiere keine Lösungen.", " Ich rekonstruiere sie, bis ich sie selbst kann."],
  ["Fortschritt heißt nicht, dass Mathe sich leicht anfühlt.", " Fortschritt heißt, dass ich immer weniger Hilfe brauche."],
];

const FRAGEN = ["Was weiß ich sicher?", "Was verstehe ich nicht genau?", "Was ist das kleinste Teilproblem?", "Welche Darstellung hilft mir?", "Was kann ich testen?"];

const WANDEL = [
  ["„Ich bin halt kein Mathe-Typ.“", "„Ich weiß, wie ich an jede Aufgabe rangehe.“"],
  ["Chaos auf dem Blatt", "Saubere Rechenwege, Fehler selbst gefunden"],
  ["Lernen auf den letzten Drücker", "Kurze, feste Routinen"],
  ["Blackout in der Klausur", "Ruhe und ein Plan"],
  ["Mathe als Pflicht", "Mathe, das Spaß macht"],
];

/* ---------------------------------------------------------------- kleine Bausteine */
const Haken = ({ hell }) => (
  <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
    <circle cx="11" cy="11" r="11" fill={hell ? C.seeTief : GOLD} />
    <path d="M6.5 11.3l3 3L15.5 8" stroke={hell ? "#FFFFFF" : NACHT} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* Durchgestrichenes Wort: Strich als Pfad, der sich zeichnet (Länge 1 über pathLength) */
function Weg({ children, notiz }) {
  return (
    <span className="vi-weg">
      {children}
      <svg viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M2 13 C 26 6, 58 16, 98 7" /></svg>
      {notiz && <span className="vi-notiz" aria-hidden="true">{notiz}</span>}
    </span>
  );
}

function Kicker({ nr, children }) {
  return <p className="vi-kicker">{nr ? `${nr} · ` : ""}{children}</p>;
}

function Avatar() {
  return <span className="vi-avatar" aria-hidden="true"><svg viewBox="0 0 120 138"><MathildaPfade /></svg></span>;
}

/* Hintergrundkurve der Bühne: eine Lernkurve, die sich einmal über die Fläche zieht */
function HeldKurve() {
  return (
    <svg className="vi-held-kurve" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="viKurveGold" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={GOLD} stopOpacity="0" /><stop offset=".45" stopColor={GOLD} stopOpacity=".55" /><stop offset="1" stopColor={GOLD_HELL} />
        </linearGradient>
      </defs>
      <path pathLength="1" d="M -40 640 C 260 640, 420 600, 560 470 C 700 340, 760 180, 1240 120" fill="none" stroke="url(#viKurveGold)" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

/* Die Rechnung hinter Mythos Mathe – Gleichheitszeichen untereinander */
function HeldGleichung() {
  return (
    <figure className="vi-blatt" aria-label="Rechnung: Mathe gleich Talent ist durchgestrichen und als Mythos markiert. Darunter: Mathe gleich System plus Freude, daraus folgt Erfolg.">
      <p className="vi-blatt-titel" aria-hidden="true">Die Rechnung hinter Mythos Mathe</p>
      <div className="vi-gl" aria-hidden="true">
        <span className="l z1">Mathe</span><span className="m z1">=</span><span className="r z1"><Weg notiz="Mythos!">Talent</Weg></span>
        <span className="l z2">Mathe</span><span className="m z2">=</span><span className="r z2">System + Freude</span>
        <span className="l z3" /><span className="m z3" style={{ color: GOLD }}>⇒</span>
        <span className="r z3"><span className="vi-erfolg vi-gold">Erfolg<svg viewBox="0 0 100 12" preserveAspectRatio="none"><path pathLength="1" d="M2 3 C 30 1, 70 5, 98 2 M4 10 C 34 8, 70 11, 96 9" /></svg></span></span>
      </div>
      <figcaption className="vi-blatt-fuss">Gleichheitszeichen untereinander, ein Schritt pro Zeile – <b>so sieht bei uns jede Rechnung aus.</b></figcaption>
    </figure>
  );
}

/* Notenkurve: Klasse 5–7 Note 2, ab Klasse 8 ein anderer Weg, ab Klasse 10 die 1,0.
   Bewusst nur die belegten Punkte als Werte; der Abschnitt dazwischen ist als Weg gezeichnet, nicht als Notenreihe. */
function NotenKurve() {
  const x = (k) => 34 + (k - 5) * 60;          // Klasse 5 … 10 → 34 … 334
  const y = (n) => 34 + (n - 1) * 100;         // Note 1 oben, Note 2 unten
  const weg = `M ${x(5)} ${y(2)} L ${x(7)} ${y(2)} C ${x(7.9)} ${y(2)}, ${x(8.4)} ${y(1.85)}, ${x(8.9)} ${y(1.45)} C ${x(9.35)} ${y(1.1)}, ${x(9.6)} ${y(1)}, ${x(10)} ${y(1)} L ${x(10.5)} ${y(1)}`;
  return (
    <svg className="vi-noten" viewBox="0 0 360 172" role="img" aria-label="Notenverlauf: Klasse 5 bis 7 Note 2, ab Klasse 8 ein anderer Weg, ab Klasse 10 die 1,0.">
      <line x1="26" y1={y(1)} x2="352" y2={y(1)} stroke="rgba(255,255,255,0.08)" />
      <line x1="26" y1={y(2)} x2="352" y2={y(2)} stroke="rgba(255,255,255,0.08)" />
      <text x="18" y={y(1) + 4} textAnchor="end" fontSize="12.5" fontWeight="800" fill={GOLD}>1,0</text>
      <text x="18" y={y(2) + 4} textAnchor="end" fontSize="12.5" fontWeight="800" fill={NEBEL}>2</text>
      <line x1={x(8)} y1="12" x2={x(8)} y2="148" stroke={GOLD} strokeOpacity=".5" strokeDasharray="4 5" />
      <text x={x(8) + 6} y="16" fontSize="11.5" fontWeight="800" fill={GOLD} letterSpacing=".04em">ANDERER WEG</text>
      <path className="leuchten" pathLength="1" d={weg} />
      <path className="kurve" pathLength="1" d={weg} />
      {[5, 6, 7].map((k) => <circle key={k} cx={x(k)} cy={y(2)} r="4.5" fill={NEBEL} />)}
      <circle cx={x(10)} cy={y(1)} r="7" fill={GOLD_HELL} />
      <circle cx={x(10)} cy={y(1)} r="13" fill="none" stroke={GOLD} strokeOpacity=".6" />
      {[5, 6, 7, 8, 9, 10].map((k) => <text key={k} x={x(k)} y="168" textAnchor="middle" fontSize="12.5" fontWeight="700" fill={NEBEL}>{k}</text>)}
    </svg>
  );
}

/* ---------------------------------------------------------------- Tangente live (Schritt 1) */
/* Funktion, Ableitung und Bildausschnitt: TANGENTE in vision.js */

function TangenteLive() {
  const T = TANGENTE;
  const sx = (T.W - 2 * T.rand) / (T.xMax - T.xMin);
  const sy = (T.H - 2 * T.rand) / (T.yMax - T.yMin);
  const px = (x) => T.rand + (x - T.xMin) * sx;
  const py = (y) => T.rand + (T.yMax - y) * sy;
  const bahn = useMemo(() => {
    const p = [];
    for (let i = 0; i <= 160; i++) { const x = -3.25 + (6.5 * i) / 160; p.push(`${i ? "L" : "M"} ${px(x).toFixed(2)} ${py(T.f(x)).toFixed(2)}`); }
    return p.join(" ");
  }, []);   // eslint-disable-line react-hooks/exhaustive-deps
  const ruhig = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [x0, setX0] = useState(ruhig ? 2.2 : -2.6);
  const svgRef = useRef(null);
  const zustand = useRef({ phase: -Math.PI / 2, pause: 0, ziehen: false, sichtbar: false });

  useEffect(() => {
    if (ruhig) return undefined;
    const el = svgRef.current;
    let rahmen = 0, zuletzt = 0;
    const io = typeof IntersectionObserver !== "undefined" ? new IntersectionObserver(([e]) => { zustand.current.sichtbar = e.isIntersecting; }, { threshold: 0.1 }) : null;
    if (io && el) io.observe(el); else zustand.current.sichtbar = true;
    const lauf = (t) => {
      const z = zustand.current;
      const dt = zuletzt ? Math.min(0.05, (t - zuletzt) / 1000) : 0;
      zuletzt = t;
      if (z.sichtbar && !z.ziehen && t > z.pause) {
        z.phase += dt * 0.42;
        setX0(2.7 * Math.sin(z.phase));
      }
      rahmen = window.requestAnimationFrame(lauf);
    };
    rahmen = window.requestAnimationFrame(lauf);
    return () => { window.cancelAnimationFrame(rahmen); if (io) io.disconnect(); };
  }, [ruhig]);

  const ausZeiger = (e) => {
    const el = svgRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const vx = ((e.clientX - r.left) / r.width) * T.W;
    const x = Math.max(-3, Math.min(3, T.xMin + (vx - T.rand) / sx));
    setX0(x);
    const z = zustand.current;
    z.phase = Math.asin(Math.max(-1, Math.min(1, x / 2.7)));
    z.pause = (typeof performance !== "undefined" ? performance.now() : 0) + 5000;
  };

  const y0 = T.f(x0);
  const m = T.fs(x0);
  /* Tangente: auf dem Bildschirm immer gleich lang (halbe Länge 96 Einheiten) */
  const k = sy / sx;
  const d = 96 / Math.sqrt(1 + (m * k) ** 2) / sx;
  const tx1 = x0 - d, tx2 = x0 + d;
  const waagrecht = Math.abs(m) < 0.09;
  const art = waagrecht ? (x0 < 0 ? "Hochpunkt" : "Tiefpunkt") : null;
  const r2 = Math.SQRT2;
  const achsenFarbe = "rgba(174,188,221,0.35)";

  return (
    <div className="vi-plot vi-karte">
      <div className="vi-plot-kopf">
        <span className="f">f(x) = 0,25x³ − 1,5x</span>
        <span className="w" aria-live="off">x₀ = {zahlDe(x0)} · f′(x₀) = <b>{zahlDe(m)}</b></span>
      </div>
      <svg ref={svgRef} viewBox={`0 0 ${T.W} ${T.H}`} role="img" data-vision-tangente
        aria-label="Graph von f mit einer Tangente, die am Graphen entlangwandert. Wo die Tangente waagrecht liegt, hat f einen Hoch- oder Tiefpunkt."
        onPointerDown={(e) => { zustand.current.ziehen = true; try { e.currentTarget.setPointerCapture(e.pointerId); } catch (er) { /* egal */ } ausZeiger(e); }}
        onPointerMove={(e) => { if (zustand.current.ziehen) ausZeiger(e); }}
        onPointerUp={() => { zustand.current.ziehen = false; }}
        onPointerCancel={() => { zustand.current.ziehen = false; }}>
        <defs>
          <clipPath id="viPlotFlaeche"><rect x={T.rand} y={T.rand} width={T.W - 2 * T.rand} height={T.H - 2 * T.rand} /></clipPath>
        </defs>
        {/* Achsen */}
        <line x1={T.rand} y1={py(0)} x2={T.W - T.rand} y2={py(0)} stroke={achsenFarbe} />
        <line x1={px(0)} y1={T.rand} x2={px(0)} y2={T.H - T.rand} stroke={achsenFarbe} />
        {[-3, -2, -1, 1, 2, 3].map((t) => <line key={`x${t}`} x1={px(t)} y1={py(0) - 4} x2={px(t)} y2={py(0) + 4} stroke={achsenFarbe} />)}
        {[-3, -2, -1, 1, 2, 3].map((t) => <line key={`y${t}`} x1={px(0) - 4} y1={py(t)} x2={px(0) + 4} y2={py(t)} stroke={achsenFarbe} />)}
        <text x={T.W - T.rand} y={py(0) - 8} textAnchor="end" fontSize="12" fontWeight="700" fill={NEBEL}>x</text>
        <text x={px(0) + 8} y={T.rand + 10} fontSize="12" fontWeight="700" fill={NEBEL}>y</text>
        <g clipPath="url(#viPlotFlaeche)">
          <path d={bahn} fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" />
          {/* Hoch- und Tiefpunkt */}
          <circle cx={px(-r2)} cy={py(T.f(-r2))} r="4" fill={NEBEL} />
          <circle cx={px(r2)} cy={py(T.f(r2))} r="4" fill={NEBEL} />
          <text x={px(-r2)} y={py(T.f(-r2)) - 12} textAnchor="middle" fontSize="12" fontWeight="800" fill={NEBEL}>H</text>
          <text x={px(r2)} y={py(T.f(r2)) + 22} textAnchor="middle" fontSize="12" fontWeight="800" fill={NEBEL}>T</text>
          {/* Tangente */}
          <line x1={px(tx1)} y1={py(tangente(x0, tx1))} x2={px(tx2)} y2={py(tangente(x0, tx2))} stroke={waagrecht ? GOLD_HELL : GOLD} strokeWidth={waagrecht ? 3.4 : 2.4} strokeLinecap="round" />
          <circle cx={px(x0)} cy={py(y0)} r="7" fill={GOLD_HELL} />
          <circle cx={px(x0)} cy={py(y0)} r="14" fill="none" stroke={GOLD} strokeOpacity=".55" />
        </g>
      </svg>
      <p className={art ? "vi-plot-status null" : "vi-plot-status"}>
        {art ? `f′(x₀) = 0: Die Tangente liegt waagrecht – ein ${art}.` : "Zieh über den Graphen – die Tangente folgt deinem Finger."}
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------- Vergessenskurve (Schritt 3) */
/* Modell und Werte: VERGESSEN, behalten() in vision.js */

function Vergessenskurve() {
  const v = VERGESSEN;
  const W = 360, H = 210, l = 44, r = 10, o = 14, u = 34;
  const px = (t) => l + (t / v.tage) * (W - l - r);
  const py = (R) => o + (1 - R) * (H - o - u);
  const pfad = (mit) => {
    const p = [];
    let schritt = 0;
    for (let i = 0; i <= 600; i++) {
      const t = (v.tage * i) / 600;
      const w = v.wiederholungen.find((w) => w > (v.tage * (i - 1)) / 600 && w <= t);
      if (mit && w !== undefined && i > 0) {
        p.push(`L ${px(w).toFixed(2)} ${py(behalten(w - 1e-9, true)).toFixed(2)}`);
        p.push(`L ${px(w).toFixed(2)} ${py(1).toFixed(2)}`);
      }
      p.push(`${schritt++ ? "L" : "M"} ${px(t).toFixed(2)} ${py(behalten(t, mit)).toFixed(2)}`);
    }
    return p.join(" ");
  };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Vergessenskurve: Ohne Wiederholung fällt das Behaltene schnell gegen null. Mit Wiederholungen nach 2, 5, 11 und 22 Tagen springt es jedes Mal zurück und fällt danach langsamer.">
      <line x1={l} y1={py(0)} x2={W - r} y2={py(0)} stroke="rgba(174,188,221,0.35)" />
      <line x1={l} y1={o - 4} x2={l} y2={py(0)} stroke="rgba(174,188,221,0.35)" />
      <text x={l - 8} y={py(1) + 4} textAnchor="end" fontSize="12" fontWeight="700" fill={NEBEL}>alles</text>
      <text x={l - 8} y={py(0) + 4} textAnchor="end" fontSize="12" fontWeight="700" fill={NEBEL}>nichts</text>
      {[7, 14, 21, 28].map((t, i) => (
        <g key={t}>
          <line x1={px(t)} y1={py(0)} x2={px(t)} y2={py(0) + 5} stroke="rgba(174,188,221,0.5)" />
          <text x={px(t)} y={py(0) + 20} textAnchor="middle" fontSize="11.5" fontWeight="700" fill={NEBEL}>{i + 1} {i ? "Wochen" : "Woche"}</text>
        </g>
      ))}
      <path d={pfad(false)} fill="none" stroke="rgba(174,188,221,0.6)" strokeWidth="2" strokeDasharray="5 5" />
      <path className="mit" pathLength="1" d={pfad(true)} />
      {v.wiederholungen.map((w) => <circle key={w} cx={px(w)} cy={py(1)} r="5" fill={GOLD_HELL} />)}
    </svg>
  );
}

/* ---------------------------------------------------------------- Seite */
export function VisionSeite({ gehe }) {
  const frei = useFrei();
  const wurzel = useRef(null);
  const [js, setJs] = useState(false);
  const [aktiv, setAktiv] = useState(null);
  const [leisteL, setLeisteL] = useState(false);
  const [leisteU, setLeisteU] = useState(false);

  const springZu = (id) => springeZuId("vision-kapitel", id);
  const penPaper = () => gehe(VISION_ZIELE.penpaper);
  const mathilda = () => gehe(VISION_ZIELE.mathilda);
  const werkzeuge = () => { gehe({ ansicht: "start" }); springeZuId("kopfmenue-anker", "lernen"); };

  /* Titel, App-Hintergrund (Nacht hinter der Seite und der Fußzeile) */
  useEffect(() => {
    const alt = document.title;
    document.title = "Vision · Mythos Mathe";
    document.documentElement.setAttribute("data-vision-seite", "");
    return () => { document.title = alt; document.documentElement.removeAttribute("data-vision-seite"); };
  }, []);

  /* Einblenden beim Scrollen */
  useEffect(() => {
    const el = wurzel.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    setJs(true);
    const io = new IntersectionObserver((eintraege) => {
      eintraege.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("da"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    el.querySelectorAll(".vi-auf").forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  /* Kapitel-Leiste (Desktop) und feste Knopfleiste (Handy) */
  useEffect(() => {
    let tick = false;
    const lauf = () => {
      tick = false;
      const h = window.innerHeight;
      const held = document.getElementById("vision-start");
      const start = document.getElementById("kapitel-start");
      const heldUnten = held ? held.getBoundingClientRect().bottom : 0;
      const startOben = start ? start.getBoundingClientRect().top : Infinity;
      setLeisteU(heldUnten < 0 && startOben > h);
      setLeisteL(heldUnten < h * 0.3);
      let neu = null;
      for (const k of VISION_KAPITEL) {
        const e = document.getElementById(k.id);
        if (e && e.getBoundingClientRect().top < h * 0.42) neu = k.id;
      }
      setAktiv(neu);
    };
    const h = () => { if (!tick) { tick = true; window.requestAnimationFrame(lauf); } };
    lauf();
    window.addEventListener("scroll", h, { passive: true });
    window.addEventListener("resize", h);
    return () => { window.removeEventListener("scroll", h); window.removeEventListener("resize", h); };
  }, []);

  const aktivHell = aktiv && (VISION_KAPITEL.find((k) => k.id === aktiv) || {}).hell;

  return (
    <div className={js ? "vi vi-js" : "vi"} ref={wurzel} data-vision>
      <style>{CSS}</style>

      {/* Kapitel-Leiste links (ab 1360 px) */}
      <nav className={["vi-leiste-l", leisteL ? "sichtbar" : null, aktivHell ? "hell" : null].filter(Boolean).join(" ")} aria-label="Kapitel der Vision">
        {VISION_KAPITEL.map((k) => (
          <button key={k.id} type="button" onClick={() => springZu(k.id)} aria-current={aktiv === k.id ? "true" : undefined}>
            <i aria-hidden="true" />{k.nr}<span>{k.titel}</span>
          </button>
        ))}
      </nav>

      {/* ================= Bühne (Held · Wunsch) ================= */}
      <section className="vi-held" id="vision-start" aria-labelledby="vi-titel">
        <span className="vi-licht a" aria-hidden="true" /><span className="vi-licht b" aria-hidden="true" />
        <HeldKurve />
        <div className="vi-innen">
          <div className="vi-held-kopf">
            <Kicker>Die Vision von Mythos Mathe</Kicker>
            <h1 id="vi-titel">Eine Generation,<span className="vi-gold">die Mathe versteht.</span></h1>
          </div>
          <div className="vi-held-raster">
            <div>
              <p className="vi-lead">Nicht, weil sie begabter ist als die davor. <b>Sondern weil ihr endlich jemand zeigt, wie man Mathe lernt.</b></p>
              <p className="vi-unter">Für jeden Schüler am Gymnasium – von der ersten Bruchrechnung in Klasse 5 bis zur letzten Aufgabe im Abitur.</p>
              <div className="vi-knoepfe">
                <button type="button" className="vi-knopf gold" onClick={penPaper} data-vision-direkt>Pen & Paper starten · kostenlos <i aria-hidden="true">→</i></button>
                <button type="button" className="vi-knopf rand" onClick={() => springZu("kapitel-gegner")}>Die Vision lesen <i aria-hidden="true">↓</i></button>
              </div>
            </div>
            <HeldGleichung />
          </div>
          <nav className="vi-kapitel" aria-label="Kapitel">
            {VISION_KAPITEL.map((k) => <button key={k.id} type="button" onClick={() => springZu(k.id)}><b>{k.nr}</b>{k.titel}</button>)}
          </nav>
        </div>
      </section>

      {/* ================= 01 Der Gegner (Problem in drei Ebenen) ================= */}
      <section className="vi-teil vi-dunkel" id="kapitel-gegner" aria-labelledby="vi-gegner">
        <div className="vi-innen">
          <div className="vi-schmal vi-auf">
            <Kicker nr="01">Der Gegner</Kicker>
            <h2 className="vi-h2" id="vi-gegner">Dein Gegner ist nicht Mathe.</h2>
            <p className="vi-text">Es ist ein Satz, den fast jeder schon einmal gehört hat – von anderen oder von sich selbst. Er wirkt auf drei Ebenen.</p>
          </div>
          <div className="vi-ebenen">
            {EBENEN.map((e, i) => (
              <div key={e.wo} className={["vi-ebene", e.gegner ? "gegner" : null, "vi-auf", `v${i + 1}`].filter(Boolean).join(" ")}>
                <p className="wo">{e.wo}</p>
                <blockquote>{e.zitat}</blockquote>
                <p>{e.text}</p>
              </div>
            ))}
          </div>
          <div className="vi-mythos vi-auf">
            <p className="gross">Mathe ist <Weg>Talent.</Weg></p>
            <p className="antwort">Mathe ist eine Art zu denken. <span className="vi-gold">Und die kann jeder lernen.</span></p>
          </div>
          <p className="vi-einsatz vi-auf">Es geht um mehr als eine Note. Es geht um dein Abi, um die Wahl deines Studiums – und um die Frage, <b>ob du dir etwas zutraust.</b></p>
        </div>
      </section>

      {/* ================= 02 Woher die Vision kommt (Mentor) ================= */}
      <section className="vi-teil vi-tief" id="kapitel-weg" aria-labelledby="vi-weg">
        <div className="vi-innen">
          <div className="vi-zwei">
            <div className="vi-auf">
              <Kicker nr="02">Woher die Vision kommt</Kicker>
              <h2 className="vi-h2" id="vi-weg">Ich war genau da, wo du jetzt bist.</h2>
              <p className="vi-text">In den ersten drei Jahren am Gymnasium hing ich bei der Note 2 fest. Ab Klasse 8 habe ich angefangen, anders zu lernen – ab Klasse 10 stand eine <b>1,0</b> im Zeugnis. Nicht durch Talent. Durch ein anderes System.</p>
              <p className="vi-text">Heute studiere ich Mathematik an der Universität Konstanz und begleite seit Jahren Schüler bis zum Abitur. Fünf Jahre lang habe ich untersucht, welche Stellschrauben diesen Weg möglich machen. Daraus ist ein System entstanden – und diese Seite, auf der du es jeden Tag anwenden kannst.</p>
              <div className="vi-fakten">
                <span>Mathestudium Uni Konstanz</span><span>Seit Jahren Mathe-Coach</span><span>Am Bodensee und online</span>
              </div>
            </div>
            <div className="vi-auf v1">
              <div className="vi-karte">
                <div className="vi-karte-titel"><span>Mein Weg in Mathe</span><span>Klasse 5–10</span></div>
                <NotenKurve />
                <div className="vi-stationen">
                  <div className="vi-station"><p className="k">Kl. 5–7</p><p className="n">2</p><p className="t">Festgefahren</p></div>
                  <div className="vi-station"><p className="k">Kl. 8</p><p className="n">→</p><p className="t">Anders lernen</p></div>
                  <div className="vi-station ziel"><p className="k">ab Kl. 10</p><p className="n">1,0</p><p className="t">Neues System</p></div>
                </div>
              </div>
              <blockquote className="vi-zitat">
                <p>„Ich verspreche dir keine Abkürzung. Ich zeige dir den Weg. Gehen musst du ihn selbst – aber nicht allein.“</p>
                <footer><b>Basti Blumenröther</b> · Gründer von Mythos Mathe</footer>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 03 Der Plan ================= */}
      <section className="vi-teil vi-dunkel" id="kapitel-plan" aria-labelledby="vi-plan">
        <div className="vi-innen">
          <div className="vi-schmal vi-auf">
            <Kicker nr="03">Der Plan</Kicker>
            <h2 className="vi-h2" id="vi-plan">Drei Schritte. <span className="vi-gold">Ein System.</span></h2>
            <p className="vi-text">Gute Mathenoten entstehen nicht aus einem besonderen Gehirn, sondern aus einer Arbeitsweise. Sie hat drei Schritte – und für jeden gibt es hier ein Werkzeug.</p>
          </div>
          <div className="vi-schritte">
            {SCHRITTE.map((s, i) => (
              <button key={s.nr} type="button" className={`vi-schritt vi-auf v${i + 1}`} onClick={() => springZu(s.ziel)}>
                <span className="nr" aria-hidden="true">{s.nr}</span>
                <h3>{s.titel}</h3>
                <p>{s.text}</p>
                <span className="mehr">Mehr dazu <span aria-hidden="true">↓</span></span>
              </button>
            ))}
          </div>
          <div className="vi-formel vi-auf">
            <p className="zeile" aria-label="System plus Freude gleich Erfolg"><span>System</span><span className="op">+</span><span>Freude</span><span className="op">=</span><span className="vi-gold">Erfolg</span></p>
            <p>Das System sind die drei Schritte. Die Freude kommt in dem Moment, in dem du merkst: Ich habe das selbst herausgefunden.</p>
          </div>
        </div>
      </section>

      {/* ---------- Schritt 1: Verstehen ---------- */}
      <section className="vi-teil vi-dunkel" id="schritt-verstehen" style={{ paddingTop: 0 }} aria-labelledby="vi-verstehen">
        <div className="vi-innen">
          <div className="vi-zwei">
            <div className="vi-auf">
              <div className="vi-schritt-kopf"><span className="nr" aria-hidden="true">1</span><Kicker>Verstehen</Kicker></div>
              <h3 className="vi-h3" id="vi-verstehen">Was man sieht, versteht man.</h3>
              <p className="vi-text">Oft steht eine Formel an der Tafel, bevor klar ist, wofür sie gut ist. Hier ist es umgekehrt: Du ziehst an einem Regler und siehst, wie sich der Graph verändert. Du drehst eine Ebene im Raum. Du findest eine Regel selbst, bevor du sie liest.</p>
              <ul className="vi-liste">
                <li><Haken /><span>Interaktive Werkzeuge für Analysis, Vektoren, Stochastik und Geometrie</span></li>
                <li><Haken /><span>Mathe entdecken: Formeln selbst herleiten – zum Beispiel die Potenzregel aus dem Pascal’schen Dreieck</span></li>
                <li><Haken /><span>Eigene Schulbücher mit Kursen in der App – jedes Kapitel lesen und direkt darunter trainieren</span></li>
              </ul>
              <button type="button" className="vi-link" onClick={() => gehe({ ansicht: "entdecken" })}>Mathe entdecken <i aria-hidden="true">→</i></button>
            </div>
            <div className="vi-auf v1"><TangenteLive /></div>
          </div>
        </div>
      </section>

      {/* ---------- Schritt 2: Aufschreiben (das weiße Blatt) ---------- */}
      <section className="vi-teil vi-hell vi-blattkante" id="schritt-aufschreiben" aria-labelledby="vi-aufschreiben">
        <div className="vi-innen">
          <div className="vi-schmal vi-auf">
            <div className="vi-schritt-kopf"><span className="nr" aria-hidden="true">2</span><Kicker>Aufschreiben</Kicker></div>
            <h3 className="vi-h3" id="vi-aufschreiben">Die meisten Fehler entstehen nicht im Kopf. <span className="vi-gold">Sondern auf dem Blatt.</span></h3>
            <p className="vi-text">Dein Blatt ist kein Ort für Ergebnisse. Es ist der Arbeitsplatz deines Denkens. Wer klar schreibt, entlastet den Kopf – und findet seine Fehler, bevor sie Punkte kosten.</p>
          </div>
          <div className="vi-vn">
            <div className="vi-vn-karte vi-auf">
              <p className="et">Vorher · alles in einer Zeile</p>
              <p className="vi-quetsch" aria-label="3x minus Klammer 2x minus 5 gleich 3x minus 2x minus 5 gleich x minus 5">3x−(2x−5)=3x−2x−5=x−5</p>
              <p className="frage">Zwei Schritte im Kopf, alles aneinandergeklebt. Irgendwo steckt ein Vorzeichenfehler – aber wo?</p>
            </div>
            <div className="vi-vn-karte nachher vi-auf v1">
              <p className="et">Nachher · Pen & Paper</p>
              <div className="vi-rechnung" role="img" aria-label="3x minus Klammer 2x minus 5 gleich 3x minus 2x plus 5, darunter gleich x plus 5, eingerahmt.">
                <span className="l">3x<span className="vi-zaun">−</span>(2x − 5)</span><span className="m">=</span><span className="r">3x<span className="vi-zaun">−</span>2x<span className="vi-zaun">+</span>5</span>
                <span className="l" /><span className="m">=</span><span className="r"><span className="vi-kasten">x<span className="vi-zaun">+</span>5</span></span>
              </div>
              <ol className="vi-regeln">
                <li><b>1</b><span><strong>Luft an den Gartenzäunen:</strong> Plus und Minus auf der obersten Ebene bekommen Abstand, im Haus steht alles eng.</span></li>
                <li><b>2</b><span><strong>Ein Schritt pro Zeile,</strong> die Gleichheitszeichen untereinander. So fällt das Minus vor der Klammer sofort auf.</span></li>
                <li><b>3</b><span><strong>Ergebnis im Kasten.</strong> Fertig ist erst, was abgeschlossen ist.</span></li>
              </ol>
            </div>
          </div>
          <div className="vi-gesetze">
            <div className="vi-gesetz vi-auf"><p className="et">Gesetz 1</p><p>Dein Blatt muss dein Denken entlasten – nicht zusätzlich belasten.</p></div>
            <div className="vi-gesetz vi-auf v1"><p className="et">Gesetz 2</p><p>Jeder relevante Schritt muss für dein späteres Ich rekonstruierbar sein.</p></div>
          </div>
          <div className="vi-blanko vi-auf">
            <svg width="54" height="54" viewBox="0 0 54 54" aria-hidden="true">
              <rect x="9" y="5" width="36" height="44" rx="5" fill="#FFFFFF" stroke={C.seeTief} strokeWidth="2" />
              <path d="M16 19 h12 M16 27 h20 M16 35 h9" stroke={C.seeTief} strokeWidth="2.4" strokeLinecap="round" />
              <circle cx="40" cy="41" r="9" fill={GOLD} /><path d="M36 41.2l2.6 2.6 5-5" stroke={NACHT} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p><b>Blanko statt Karo, schwarz statt bunt.</b> Karos zwingen jedes Zeichen in ein Kästchen – und mit ihnen verschwinden die Abstände, die die Struktur einer Rechnung zeigen.</p>
          </div>
        </div>
      </section>

      {/* ---------- Schritt 3: Trainieren ---------- */}
      <section className="vi-teil vi-dunkel" id="schritt-trainieren" aria-labelledby="vi-trainieren">
        <div className="vi-innen">
          <div className="vi-zwei umgekehrt">
            <div className="vi-auf">
              <div className="vi-schritt-kopf"><span className="nr" aria-hidden="true">3</span><Kicker>Trainieren</Kicker></div>
              <h3 className="vi-h3" id="vi-trainieren">Feedback auf deinen Weg. <span className="vi-gold">Nicht nur auf das Ergebnis.</span></h3>
              <p className="vi-text">Du fotografierst dein Blatt. <MathildaName dunkel /> liest deinen Rechenweg, findet die Zeile, in der er bricht, und gibt dir genau einen Hebel für das nächste Mal. Kein Rotstift unter dem Ergebnis, sondern ein Blick auf deinen Weg.</p>
              <ul className="vi-liste">
                <li><Haken /><span>Prüft Rechnung und Schreibweise nach den Pen-&-Paper-Regeln</span></li>
                <li><Haken /><span>Erkennt Muster: Wo bleibst du immer wieder hängen?</span></li>
                <li><Haken /><span>Kopfrechnen und Training, bis Zahlen und Verfahren sitzen</span></li>
              </ul>
              <button type="button" className="vi-link" onClick={mathilda}>Blatt prüfen lassen <i aria-hidden="true">→</i></button>
            </div>
            <div className="vi-auf v1">
              <div className="vi-pruef">
                <div className="vi-pruef-kopf"><Avatar /><div><b className="name"><MathildaName dunkel /></b><span className="unter">hat dein Blatt geprüft · Beispiel</span></div></div>
                <div className="vi-pruef-blatt" role="img" aria-label="Rechenweg: f von x gleich Klammer 2x plus 1 hoch 2. Zeile 2: f Strich von x gleich 2 mal Klammer 2x plus 1 – hier fehlt die innere Ableitung. Zeile 3: gleich 4x plus 2, nur die Folge davon.">
                  <div className="vi-pz"><span className="nr">1</span><span className="l">f(x)</span><span className="m">=</span><span>(2x + 1)²</span></div>
                  <div className="vi-pz fehler"><span className="nr">2</span><span className="l">f′(x)</span><span className="m">=</span><span>2(2x + 1)</span></div>
                  <div className="vi-pz folge"><span className="nr">3</span><span className="l" /><span className="m">=</span><span>4x<span className="vi-zaun">+</span>2</span></div>
                </div>
                <div className="vi-blase">
                  <b>Zeile 2 – hier bricht der Weg.</b> Bei der Kettenregel fehlt die innere Ableitung <span className="vi-m">(2x + 1)′ = 2</span>. Richtig ist <span className="vi-m">f′(x) = 2(2x + 1) · 2 = 4(2x + 1)</span>. Zeile 3 ist nur die Folge davon.
                  <p className="hebel"><b>Dein Hebel:</b> Schreib bei jeder Verkettung die innere Ableitung als eigenen Faktor hin – bevor du zusammenfasst.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="vi-zwei vi-ebb-zeile">
            <div className="vi-auf">
              <h3 className="vi-h3" style={{ marginTop: "clamp(56px, 8vw, 96px)" }}>Wissen, das bleibt.</h3>
              <p className="vi-text">Was du heute verstehst, verblasst – außer es kommt im richtigen Abstand zurück. Darum holt dein Training Themen wieder hervor, kurz bevor sie weg sind. So ist die Analysis aus Klasse 10 noch da, wenn sie im Abi zurückkommt.</p>
              <p className="vi-text">Und weil Mathe aufeinander aufbaut, ordnen wir den Stoff nicht nach Schuljahren, sondern nach dem, was zusammengehört: Was du in Klasse 9 lernst, trägt dich bis zum Abitur.</p>
            </div>
            <div className="vi-ebb vi-karte vi-auf v1">
              <div className="vi-karte-titel"><span>Vergessenskurve nach Ebbinghaus</span><span>Modell</span></div>
              <Vergessenskurve />
              <div className="vi-legende"><span><i />mit Wiederholung im richtigen Abstand</span><span><i className="ohne" />ohne Wiederholung</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 04 Die Haltung ================= */}
      <section className="vi-teil vi-tief" id="kapitel-haltung" aria-labelledby="vi-haltung">
        <div className="vi-innen">
          <div className="vi-schmal vi-auf">
            <Kicker nr="04">Die Haltung</Kicker>
            <h2 className="vi-h2" id="vi-haltung">Das Manifest.</h2>
            <p className="vi-text">Das System funktioniert nur mit der richtigen Haltung. Sie passt in vier Sätze.</p>
          </div>
          <ol className="vi-manifest vi-schmal">
            {MANIFEST.map(([a, b], i) => <li key={a} className={`vi-auf v${(i % 3) + 1}`}><p>{a}<span>{b}</span></p></li>)}
          </ol>
          <div className="vi-fragen vi-auf">
            <p className="vi-kicker">Wenn du feststeckst, frag dich</p>
            <ol>{FRAGEN.map((f) => <li key={f}>{f}</li>)}</ol>
          </div>
          <p className="vi-schluss-satz vi-auf">Das Ziel ist nicht, weniger denken zu müssen. <span className="vi-gold">Das Ziel ist, besser denken zu können.</span></p>
        </div>
      </section>

      {/* ================= 05 Der Ort ================= */}
      <section className="vi-teil vi-sand vi-blattkante" id="kapitel-ort" aria-labelledby="vi-ort">
        <div className="vi-innen">
          <div className="vi-schmal vi-auf">
            <Kicker nr="05">Der Ort</Kicker>
            <h2 className="vi-h2" id="vi-ort">Ein Ort, an dem alle am selben Ziel arbeiten.</h2>
            <p className="vi-text">Mathe lernt man nicht allein. Schüler, Eltern und Lehrer sehen hier dasselbe System – jeder aus seinem Blickwinkel.</p>
          </div>
          <div className="vi-rollen">
            <button type="button" className="vi-rolle vi-auf" onClick={werkzeuge}>
              <span className="zeichen" aria-hidden="true"><svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9.5 13 4l11 5.5L13 15 2 9.5Z" /><path d="M6.5 12v5.2c0 1.8 3 3.3 6.5 3.3s6.5-1.5 6.5-3.3V12" /><path d="M24 9.5v6" /></svg></span>
              <h3>Für Schüler</h3>
              <p>Verstehen, aufschreiben, trainieren – in deinem Tempo, von Klasse 5 bis zum Abi. Die Werkzeuge kannst du sofort und ohne Konto nutzen.</p>
              <span className="weiter">Werkzeuge ansehen →</span>
            </button>
            <button type="button" className="vi-rolle vi-auf v1" onClick={() => gehe({ ansicht: "elternkurs" })}>
              <span className="zeichen" aria-hidden="true"><svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7.5" r="3.5" /><circle cx="18.5" cy="10" r="2.8" /><path d="M2.5 22c0-4 3-6.5 6.5-6.5s6.5 2.5 6.5 6.5" /><path d="M14.5 17.2c1-.9 2.4-1.4 4-1.4 3 0 5 2 5 5.2" /></svg></span>
              <h3>Für Eltern</h3>
              <p>Begleiten, ohne selbst Mathe erklären zu müssen: mit dem Konto des Kindes verbunden und mit dem Mindset-Kurs, der zeigt, wie Lernen wirklich funktioniert.</p>
              <span className="weiter">Mindset-Kurs öffnen →</span>
            </button>
            <button type="button" className="vi-rolle vi-auf v2" onClick={() => gehe({ ansicht: "lehrkraefte" })}>
              <span className="zeichen" aria-hidden="true"><svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="20" height="13" rx="2" /><path d="M8 21l5-4 5 4" /><path d="M7.5 9.5h6M7.5 12.5h10" /></svg></span>
              <h3>Für Lehrer</h3>
              <p>Arbeitsblätter mit Lösungsblatt aus denselben Aufgabengeneratoren – kostenlos. Dazu Klassen, in denen Schüler gemeinsam trainieren.</p>
              <span className="weiter">Für Lehrkräfte →</span>
            </button>
          </div>
          <div className="vi-saeulen">
            <div className="vi-saeule vi-auf">
              <p className="et">Frei zugänglich</p>
              <h3>Gutes Lernen darf keine Frage des Geldbeutels sein.</h3>
              <p>Die Werkzeuge und der Pen-&-Paper-Kurs sind kostenlos. Mythos Mathe wird von freiwilligen Spenden getragen.</p>
            </div>
            <div className="vi-saeule vi-auf v1">
              <p className="et">Gemeinsam besser</p>
              <h3>Jede Klausur macht das Training für alle besser.</h3>
              <p>Über den Klausurbriefkasten schicken Schüler ihre zurückgegebenen Klausuren ein. Daraus entstehen Testklausuren, die zeigen, was wirklich drankommt.</p>
            </div>
          </div>
          <div className="vi-ziel vi-auf">
            <p className="et">Das große Ziel</p>
            <p className="gross">Mathe hier besser lernen als irgendwo sonst.</p>
            <p className="klein">Nicht gegen die Schule – sondern mit allem, wofür im Unterricht keine Zeit bleibt: sehen, selbst herausfinden, sauber aufschreiben, Feedback bekommen und im richtigen Abstand wiederholen.</p>
          </div>
        </div>
      </section>

      {/* ================= 06 Zwei Wege (Scheitern · Erfolg) ================= */}
      <section className="vi-teil vi-dunkel vi-blattkante" id="kapitel-wege" aria-labelledby="vi-wege">
        <div className="vi-innen">
          <div className="vi-schmal vi-auf">
            <Kicker nr="06">Zwei Wege</Kicker>
            <h2 className="vi-h2" id="vi-wege">Ab hier gibt es zwei Wege.</h2>
          </div>
          <div className="vi-wege">
            <div className="vi-weg-karte stehen vi-auf">
              <p className="et">Wenn alles bleibt, wie es ist</p>
              <h3>Die Lücke wächst mit jedem Jahr.</h3>
              <p>Mathe baut aufeinander auf. Was in Klasse 8 fehlt, fehlt in Klasse 10 doppelt. Gelernt wird auf den letzten Drücker und nach der Klausur vergessen.</p>
              <p>Und der Satz „Ich bin kein Mathe-Typ“ klingt mit jeder Note ein bisschen wahrer – obwohl er es nie war.</p>
            </div>
            <div className="vi-weg-karte gehen vi-auf v1">
              <p className="et">Wenn du das System lernst</p>
              <h3>Aus einer Regel wird eine Gewohnheit. Aus der Gewohnheit wird Sicherheit.</h3>
              <ul className="vi-wandel">
                {WANDEL.map(([vor, nach]) => (
                  <li key={vor}><span className="vor">{vor}</span><span className="pf" aria-hidden="true">→</span><span className="nach">{nach}</span></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 07 Dein erster Schritt (Angebote) ================= */}
      <section className="vi-teil vi-tief" id="kapitel-start" aria-labelledby="vi-start">
        <div className="vi-innen">
          <div className="vi-schmal vi-auf">
            <Kicker nr="07">Dein erster Schritt</Kicker>
            <h2 className="vi-h2" id="vi-start">Die Vision beginnt <span className="vi-gold">auf deinem Blatt.</span></h2>
            <p className="vi-text">Darum fängt alles mit Pen & Paper an – dem Kurs, der dir zeigt, wie man Mathe aufschreibt. Er ist der Einstieg ins System und komplett kostenlos.</p>
          </div>

          <div className="vi-pp vi-auf" data-vision-penpaper>
            <div className="vi-pp-text">
              <span className="vi-pp-marke">Kostenlos · Der Einstieg ins System</span>
              <h3>Pen & Paper</h3>
              <p className="zeile">Neun Lektionen in fünf Stufen – vom ersten Hinsehen bis zur Gewohnheit, die in der Klausur von allein läuft.</p>
              <div className="vi-stufen" aria-label="Stufen: Sehen, Abschreiben, Umschreiben, Selbst rechnen, Automatisieren">
                {["Sehen", "Abschreiben", "Umschreiben", "Selbst rechnen", "Automatisieren"].map((s, i) => (
                  <React.Fragment key={s}>{i > 0 && <em aria-hidden="true">→</em>}<span>{s}</span></React.Fragment>
                ))}
              </div>
              <ul className="vi-liste">
                <li><Haken hell /><span>Häuser, Gartenzäune und der Super-Operator: das Grundmodell jeder Zeile</span></li>
                <li><Haken hell /><span>Ein Schritt pro Zeile, Bruchstrich auf Zaunhöhe, Ergebnis im Kasten</span></li>
                <li><Haken hell /><span>Dein 7-Tage-Plan und das tägliche Blatt-Training mit <MathildaName /></span></li>
              </ul>
              <div className="vi-knoepfe">
                <button type="button" className="vi-knopf navy" onClick={penPaper} data-vision-angebot="penpaper">Kurs starten <i aria-hidden="true">→</i></button>
              </div>
            </div>
            <div className="vi-pp-bild" aria-hidden="true">
              <div className="vi-mini">
                <p className="et">Blanko · ein Schritt pro Zeile</p>
                <div className="vi-rechnung">
                  <span className="l">3x<span className="vi-zaun">+</span>5</span><span className="m">=</span><span className="r">20</span><span className="k">| − 5</span>
                  <span className="l">3x</span><span className="m">=</span><span className="r">15</span><span className="k">| : 3</span>
                  <span className="l">x</span><span className="m">=</span><span className="r"><span className="vi-kasten">5</span></span><span className="k" />
                </div>
              </div>
            </div>
          </div>

          <p className="vi-weiter-titel">Und so geht es weiter</p>
          <div className="vi-angebote">
            <button type="button" className="vi-angebot gold vi-auf" onClick={mathilda} data-vision-angebot="mathilda">
              <span className="vi-angebot-kopf"><Avatar /><span className="et">Schritt 3 · Trainieren</span></span>
              <h3><MathildaName dunkel /></h3>
              <p>Foto vom Blatt – Mathilda prüft deinen Weg, zeigt dir die Stelle, an der er bricht, und gibt dir einen Hebel.</p>
              <span className="weiter">Blatt prüfen lassen <span aria-hidden="true">→</span></span>
            </button>
            <button type="button" className="vi-angebot vi-auf v1" onClick={() => gehe(VISION_ZIELE.kopfrechnen)} data-vision-angebot="kopfrechnen">
              <span className="et">Zahlen, die sitzen</span>
              <h3>Kopfrechnen</h3>
              <p>Einmaleins, Quadrat- und Kubikzahlen, Brüche – trainieren, bis alles sitzt. Sicheres Kopfrechnen macht den Kopf frei für das Wesentliche.</p>
              <span className="weiter">Trainieren <span aria-hidden="true">→</span></span>
            </button>
            <button type="button" className="vi-angebot vi-auf v2" onClick={() => gehe(VISION_ZIELE.mindset)} data-vision-angebot="mindset">
              <span className="et">Die Haltung</span>
              <h3>Mathe-Mindset</h3>
              <p>Sechs Vorträge und zwei Bücher, die zeigen, wie Lernen wirklich funktioniert – für Schüler und Eltern.</p>
              <span className="weiter">Kurs öffnen <span aria-hidden="true">→</span></span>
            </button>
          </div>

          <p className="vi-weiter-titel">Kurse durch den Stoff</p>
          <div className="vi-kurse vi-wieder">
            <UnterstufeKachel onClick={() => gehe({ ansicht: "unterstufe" })} />
            <DiffKursKachel onClick={() => gehe({ ansicht: "diffkurs" })} />
            <VekKursKachel onClick={() => gehe({ ansicht: "vekkurs" })} />
          </div>
          {(ANGEBOT.kurse || frei) && (
            <div className="vi-wieder"><MasterclassKachel name="Mathe Masterclass" monate="3 MONATE" knopf="Zum Kursbereich" onClick={() => gehe({ ansicht: "mckurs" })} /></div>
          )}

          <div className="vi-spende vi-auf">
            <div>
              <h3>Werde Teil der Vision.</h3>
              <p>Mythos Mathe ist frei zugänglich. Wenn du die Idee unterstützen willst: Jede Spende fließt in die KI-Kosten von <MathildaName dunkel /> und in neue Werkzeuge.</p>
            </div>
            <button type="button" className="vi-knopf rand" onClick={() => gehe(VISION_ZIELE.spenden)} data-vision-angebot="spenden">Unterstützen <i aria-hidden="true">→</i></button>
          </div>
        </div>
      </section>

      {/* ================= Abschluss ================= */}
      <section className="vi-ende" aria-label="Abschluss">
        <div className="vi-innen">
          <div className="vi-formel vi-auf">
            <p className="zeile" aria-label="System plus Freude gleich Erfolg"><span>System</span><span className="op">+</span><span>Freude</span><span className="op">=</span><span className="vi-gold">Erfolg</span></p>
          </div>
          <p className="text vi-auf">Mathe kann jeder verstehen. Fang heute mit einem einzigen Blatt an.</p>
          <div className="vi-knoepfe vi-auf">
            <button type="button" className="vi-knopf gold" onClick={penPaper}>Pen & Paper starten · kostenlos <i aria-hidden="true">→</i></button>
            <button type="button" className="vi-knopf rand" onClick={werkzeuge}>Alle Werkzeuge ansehen <i aria-hidden="true">→</i></button>
          </div>
        </div>
      </section>
      <div className="vi-leiste-platz" aria-hidden="true" />

      {/* Handy: fester direkter Knopf, sobald die Bühne vorbei ist (bis zu den Angeboten) */}
      <div className={leisteU ? "vi-leiste-u sichtbar" : "vi-leiste-u"} aria-hidden={!leisteU} data-vision-leiste>
        <button type="button" className="vi-knopf gold" onClick={penPaper} tabIndex={leisteU ? 0 : -1}>Pen & Paper starten · kostenlos <i aria-hidden="true">→</i></button>
      </div>
    </div>
  );
}
