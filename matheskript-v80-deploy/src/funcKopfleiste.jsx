/* ======================================================================
   KOPFLEISTE – die Zeile ganz oben auf jeder Seite (auch in den Trainings-
   werkzeuge: dort steht darunter das dünne WerkzeugBand).

   Sie folgt dem Modus der Startseite (src/startModus.js) und trägt dieselben
   Farben wie das Rechenblatt darunter:
     dunkel  Nachtblau, Goldlicht oben rechts, Goldkurve
     hell    Weiß, Wortmarke in Nachtblau, blaue Kurve
   Bewusst ohne Karoraster (passt nicht zur Marke). Die Kurve zeichnet sich
   einmal ein, wird danach leiser und läuft links weich aus.
     mix     lackiertes Blau mit Lichtsaum (die Farbe der dunklen Inseln im Mix)
   Alles hängt an CSS-Variablen (data-modus), die Kurve zeichnet sich einmal ein.

   Angemeldet:  Wortmarke + Slogan · „Weiter mit …“ (letztes Werkzeug, Desktop)
                · Konto-Chip · ☰
   Besucher:    Menü Vision · Mathe lernen · Mathilda AI · Blog · Anmelden · ☰.
                Unter 1000 px (seit 21.10.): große Wortmarke mit Slogan darunter wie
                angemeldet, die vier Punkte liegen hinter ☰ (Besuchermenü, ein
                kleines Fenster; von dort „Alle Bereiche“ ins große ☰-Menü).
                Ab 1000 px eine breite Zeile wie eine normale Website: Wortmarke
                in voller Größe (40 px), die vier Punkte fest daneben (nie zum
                Ausklappen), kein Slogan.
   Keinen Modus-Knopf in der Leiste: dunkel/hell/mix stellt man ganz unten im
   ☰-Menü um („Darstellung“) oder über die Pille unten links auf der Startseite.
   Auf Seiten, die kein Werkzeug sind, klebt die Leiste oben, zieht sich beim
   Scrollen zusammen und zeigt unten eine goldene Lese-Fortschrittslinie.
   ====================================================================== */
import React, { useEffect, useRef, useState } from "react";
import { C } from "./base1.jsx";
import { MarkenLogo } from "./markenLogo.jsx";
import { MathildaName } from "./mathildaName.jsx";
import { useKonto } from "./konto.js";
import { HauptMenue, KontoBereich } from "./funcHauptmenue.jsx";
import { zuletztAus, ZULETZT_SCHLUESSEL } from "./hauptmenue.js";
import { wo } from "./werkzeuge.js";
import { EVENT_START_MODUS, startModus, basisModus, editionVon } from "./startModus.js";
import { englisch } from "./i18n.js";
import { springeZuId } from "./sprung.js";
import { BESUCHER_MENUE, besucherAktiv } from "./kopfleiste.js";

const NACHT = "#050B1F";
const GOLD = C.flaggold;
const GOLD_HELL = "#FFE58A";
const DESKTOP = "(min-width: 840px)";
const HANDY = "(max-width: 699px)";
const ZWEIZEILIG = "(max-width: 999px)";   // Besucher: Menü in einer zweiten Zeile
const BREIT = "(min-width: 1000px)";       // Besucher: eine breite Zeile, Wortmarke voll, T über der Schlagzeile
/* Linke Kante der Schlagzeile auf der Startseite (Bühne in funcStartseite.jsx): 50 % − 371,5 px.
   Die Wortmarke beginnt 63 px davor – dann steht das T von MYTHOS über dem M von „Mathe“. */
const HELD_KANTE = "calc(50% - 434.5px)";
/* Breite des Inhalts von der Wortmarke bis zum ☰ (gemessen 930 px, mit Reserve). Seit 21.10. symmetrisch:
   links und rechts derselbe Rand (--kl-rand), höchstens bis zur Schlagzeilenkante – das Menü endet also so weit
   vom rechten Rand wie die Wortmarke vom linken. Passt beides nicht, rückt die Marke ein Stück vor die T-Kante. */
const BREIT_BEDARF = "940px";

const CSS = `
.kl { position: relative; z-index: 50; isolation: isolate; color: var(--kl-text); font-family: Montserrat, system-ui, sans-serif;
  --kl-hg: ${NACHT}; --kl-text: #EEF2FF; --kl-nebel: #AEBCDD; --kl-linie: rgba(255,255,255,0.11); --kl-kurve-ruhe: .24;
  --kl-kurve: ${GOLD}; --kl-ring: rgba(255,255,255,0.45); --kl-ring-hover: rgba(255,255,255,0.12); --kl-chip-hg: ${NACHT};
  --kl-pille-hg: rgba(255,255,255,0.07); --kl-pille-rand: rgba(255,255,255,0.14); --kl-pille-hover: rgba(255,255,255,0.13);
  --kl-licht1: rgba(237,187,0,0.42); --kl-licht2: rgba(0,77,152,0.55); --kl-schatten: 0 18px 40px -22px rgba(0,0,0,.85);
  --kl-nav: #FFFFFF; --kl-plus: ${GOLD}; }
.kl[data-modus="hell"] { --kl-hg: #FFFFFF; --kl-text: ${C.tinte}; --kl-nebel: ${C.grau}; --kl-linie: ${C.linie}; --kl-kurve-ruhe: .3;
  --kl-kurve: ${C.see}; --kl-ring: rgba(14,30,74,0.28); --kl-ring-hover: rgba(14,30,74,0.07); --kl-chip-hg: ${C.seeTief};
  --kl-pille-hg: #FFFFFF; --kl-pille-rand: ${C.linie}; --kl-pille-hover: ${C.himmel};
  --kl-licht1: rgba(237,187,0,0.22); --kl-licht2: rgba(0,77,152,0.16); --kl-schatten: 0 10px 30px -18px rgba(15,26,51,0.25);
  --kl-nav: ${C.seeTief}; --kl-plus: ${C.gruen}; }
.kl[data-modus="mix"] { --kl-hg: ${C.seeTief}; --kl-text: #FFFFFF; --kl-nebel: #C9D6EE; --kl-linie: rgba(255,255,255,0.16); --kl-kurve-ruhe: .3;
  --kl-kurve: ${GOLD_HELL}; --kl-ring: rgba(255,255,255,0.5); --kl-ring-hover: rgba(255,255,255,0.14); --kl-chip-hg: ${NACHT};
  --kl-pille-hg: rgba(5,11,31,0.28); --kl-pille-rand: rgba(255,255,255,0.18); --kl-pille-hover: rgba(5,11,31,0.45);
  --kl-licht1: rgba(255,229,138,0.32); --kl-licht2: rgba(255,255,255,0.12); --kl-schatten: 0 18px 40px -22px rgba(0,47,110,.8);
  --kl-nav: #FFFFFF; --kl-plus: ${GOLD}; }
.kl *, .kl *::before, .kl *::after { box-sizing: border-box; }
.kl button { font-family: inherit; }
.kl[data-klebrig] { position: sticky; top: 0; }
/* Hintergrund: Fläche, Licht, Kurve (kein Raster) */
.kl-hg { position: absolute; inset: 0; z-index: -1; overflow: hidden; background: var(--kl-hg); border-bottom: 1px solid var(--kl-linie);
  transition: box-shadow .3s ease; }
.kl[data-modus="mix"] .kl-hg { background: radial-gradient(120% 90% at 0% 0%, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 55%),
  linear-gradient(155deg, #0A5AB0 0%, ${C.see} 38%, ${C.seeTief} 100%); box-shadow: inset 0 1px 0 rgba(255,255,255,0.22); }
.kl-licht { position: absolute; border-radius: 999px; filter: blur(28px); pointer-events: none; }
.kl-licht.l1 { width: 46vw; max-width: 520px; height: 46vw; max-height: 520px; top: -30vw; right: -10vw; background: radial-gradient(circle, var(--kl-licht1) 0%, rgba(0,0,0,0) 70%); }
.kl-licht.l2 { width: 40vw; max-width: 420px; height: 40vw; max-height: 420px; top: -26vw; left: -16vw; background: radial-gradient(circle, var(--kl-licht2) 0%, rgba(0,0,0,0) 70%); }
/* Kurve: wird von links nach rechts aufgedeckt (Clip statt Strichlänge – unabhängig von der Breite).
   Links läuft sie weich aus (Maske), damit sie die Wortmarke nicht durchstreicht; eingezeichnet wird sie leiser (--kl-kurve-ruhe). */
.kl-kurve { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; clip-path: inset(0 100% 0 0); animation: klWeg 2.4s cubic-bezier(.4,0,.2,1) .3s forwards;
  -webkit-mask-image: linear-gradient(90deg, rgba(0,0,0,.18) 0%, rgba(0,0,0,.18) 6%, #000 42%); mask-image: linear-gradient(90deg, rgba(0,0,0,.18) 0%, rgba(0,0,0,.18) 6%, #000 42%); }
.kl-kurve path { fill: none; stroke: var(--kl-kurve); stroke-width: 1.6; stroke-linecap: round; vector-effect: non-scaling-stroke; opacity: .5;
  animation: klLeiser 1.6s ease 2.7s forwards; }
@keyframes klWeg { to { clip-path: inset(0 0 0 0); } }
@keyframes klLeiser { to { opacity: var(--kl-kurve-ruhe); } }
/* Der Punkt auf der Kurve (64 % / 56 % = Kurvenpunkt 640|56): rund, leuchtet einmal auf, wenn die Kurve ihn erreicht */
.kl-punkt { position: absolute; left: 64%; top: 56%; width: 6px; height: 6px; margin: -3px 0 0 -3px; border-radius: 999px; background: var(--kl-kurve); opacity: 0;
  animation: klPunkt 1.1s ease 1.75s forwards; }
/* nur dort, wo er frei steht: angemeldet am Desktop zwischen Wortmarke und Knöpfen (beim Besuchermenü säße er zwischen den Punkten) */
.kl-punkt { display: none; }
@media ${DESKTOP} { .kl:not([data-gast]) .kl-punkt { display: block; } }
@keyframes klPunkt { 0% { opacity: 0; transform: scale(.4); box-shadow: 0 0 0 0 var(--kl-kurve); } 45% { opacity: 1; transform: scale(1.5); box-shadow: 0 0 14px 4px var(--kl-kurve); }
  100% { opacity: .55; transform: none; box-shadow: 0 0 5px 0 var(--kl-kurve); } }
.kl[data-kompakt] .kl-hg { box-shadow: var(--kl-schatten); }
.kl[data-kompakt][data-modus="mix"] .kl-hg { box-shadow: var(--kl-schatten), inset 0 1px 0 rgba(255,255,255,0.22); }

/* Zeile */
.kl-zeile { display: flex; align-items: center; justify-content: space-between; gap: 10px; min-height: var(--kopf-h, 56px); padding: 0 12px 0 18px;
  transition: min-height .28s cubic-bezier(.2,.7,.3,1); }
.kl[data-kompakt] .kl-zeile { min-height: 56px; }
.kl-marke { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; background: none; border: none; padding: 0; margin: 0; cursor: pointer; text-align: center; color: inherit; }
.kl-marke:focus-visible, .kl button:focus-visible { outline: 3px solid ${GOLD}; outline-offset: 3px; border-radius: 6px; }
.kl-slogan { font-size: clamp(12.25px, 3.79vw, 23.33px); font-weight: 600; letter-spacing: .03em; white-space: nowrap; line-height: 1; margin-top: 0; color: var(--kl-text);
  transition: opacity .22s ease, max-height .28s ease, margin .28s ease; max-height: 30px; overflow: hidden; }
.kl-slogan b { font-weight: 600; color: var(--kl-plus); }
@media (min-width: 421px) { .kl-slogan { margin-top: 6px; } }
@media ${DESKTOP} { .kl-slogan { margin-top: 1px; } }
.kl[data-kompakt] .kl-slogan { opacity: 0; max-height: 0; margin-top: 0; }
/* Besucher: unter 1000 px wie angemeldet (Wortmarke + Slogan, mittig untereinander); ab 1000 px Marke links, ohne Slogan (siehe BREIT) */
@media (max-width: 420px) { .kl-zeile { padding-left: 14px; } }

/* Besuchermenü: feste Punkte */
.kl-nav { display: flex; align-items: center; gap: 24px; margin: 0 12px 0 auto; padding: 0; list-style: none; }
/* Größe der Wortmarke für Besucher: unter 1000 px so groß wie angemeldet (Platz bis zum ☰), darüber voll (siehe BREIT) */
.kl { --kl-logo-gast: min(40px, calc((100vw - 100px) / 10)); }
.kl-nav button { position: relative; background: none; border: none; padding: 8px 0; cursor: pointer; color: var(--kl-nav); font-size: 14.5px; font-weight: 700; letter-spacing: .005em; white-space: nowrap; line-height: 1; }
.kl-nav button::after { content: ""; position: absolute; left: 0; right: 0; bottom: 2px; height: 2px; border-radius: 2px; background: ${GOLD}; transform: scaleX(0); transform-origin: left; transition: transform .22s cubic-bezier(.2,.7,.3,1); }
.kl-nav button:hover::after, .kl-nav button[aria-current="page"]::after { transform: scaleX(1); }
.kl-nav button[aria-current="page"] { color: var(--kl-nav); }
/* „Mathilda AI“: die Marke schreibt beide Teile zusammen, im Menü steht ein schmaler Abstand davor (AI bleibt gold) */
.kl-nav [data-besucher-menue="mathilda"] > span > span + span { margin-left: .26em; }
/* Unter 1000 px (seit 21.10.): keine Menüzeile – die vier Punkte liegen hinter ☰ (Besuchermenü .kl-bm) */
@media ${ZWEIZEILIG} {
  .kl[data-gast] .kl-nav { display: none; }
  .kl[data-gast] .kl-rechts { margin-left: auto; }
}
@media ${BREIT} { .kl[data-gast] .kl-slogan { display: none; } .kl[data-gast] .kl-marke { align-items: flex-start; } }

/* Besuchermenü hinter ☰ (unter 1000 px): kleines Fenster rechts unter der Leiste, Schleier darunter */
.kl-bm-schleier { position: fixed; left: 0; right: 0; bottom: 0; z-index: 1; background: rgba(8,20,52,0.34); -webkit-backdrop-filter: blur(3px); backdrop-filter: blur(3px); animation: klBlende .2s ease both; }
.kl[data-bm-offen] .kl-zeile { position: relative; z-index: 3; }
.kl-bm { position: absolute; top: calc(100% + 8px); right: 12px; z-index: 4; width: min(340px, calc(100vw - 24px)); box-sizing: border-box; padding: 10px;
  background: #FFFFFF; color: ${C.seeTief}; border-radius: 22px; box-shadow: 0 24px 60px -18px rgba(5,11,31,0.55), 0 0 0 1px rgba(14,30,74,0.08);
  animation: klRein .22s cubic-bezier(.2,.7,.3,1) both; }
.kl-bm-liste { list-style: none; margin: 0; padding: 0; }
.kl-bm-liste button { position: relative; width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 15px 14px; border: none; border-radius: 14px;
  background: none; cursor: pointer; color: ${C.seeTief}; font-size: 18px; font-weight: 800; letter-spacing: -0.01em; line-height: 1.1; text-align: left; }
.kl-bm-liste li + li button { box-shadow: inset 0 1px 0 ${C.linie}; }
.kl-bm-liste li + li button:hover, .kl-bm-liste button:hover { background: #F2F5FB; box-shadow: none; }
.kl-bm-liste button::after { content: "→"; font-weight: 700; color: ${C.see}; transition: transform .18s ease; }
.kl-bm-liste button:hover::after { transform: translateX(3px); }
.kl-bm-liste button[aria-current="page"]::before { content: ""; position: absolute; left: 0; top: 12px; bottom: 12px; width: 3px; border-radius: 3px; background: ${GOLD}; }
.kl-bm-liste [data-besucher-menue="mathilda"] > span > span + span { margin-left: .26em; }
.kl-bm-fuss { display: grid; gap: 8px; margin-top: 8px; padding-top: 10px; border-top: 1px solid ${C.linie}; }
.kl-bm-anmelden { height: 46px; border-radius: 999px; border: none; cursor: pointer; font-size: 15px; font-weight: 800; color: ${NACHT};
  background: linear-gradient(180deg, ${GOLD_HELL} 0%, ${GOLD} 100%); box-shadow: 0 8px 20px -10px rgba(237,187,0,0.9), inset 0 1px 0 rgba(255,255,255,.6); }
.kl-bm-alles { height: 42px; border-radius: 999px; border: 1.5px solid ${C.linie}; background: #FFFFFF; cursor: pointer; font-size: 13.5px; font-weight: 700; color: ${C.see}; }
.kl-bm-alles:hover { border-color: ${C.see}; }
.kl-bm button { font-family: inherit; }
@keyframes klBlende { from { opacity: 0; } }
@keyframes klRein { from { opacity: 0; transform: translateY(-6px) scale(.98); } }
@media ${BREIT} { .kl-bm, .kl-bm-schleier { display: none; } }
/* Ab 1000 px: Besucher bekommen eine breite Zeile wie eine normale Website. Die Wortmarke (voll, 40 px) beginnt
   bündig mit der Schlagzeile; nur wenn rechts der Platz fehlt, rückt sie so weit wie nötig nach links.
   Rechts endet die Zeile genauso weit vor dem Rand wie die Wortmarke links beginnt (symmetrisch, --kl-rand). */
@media ${BREIT} {
  .kl { --kl-logo-gast: 40px; --kl-rand: max(32px, min(${HELD_KANTE}, calc((100% - ${BREIT_BEDARF}) / 2))); }
  .kl[data-gast] .mx-auto.kopf-zeile.kl-zeile { width: 100% !important; max-width: none !important; margin-left: 0 !important; margin-right: 0 !important;
    padding: 0 var(--kl-rand) !important; gap: 0; }
  .kl[data-gast] .kl-marke { margin-right: 28px; }
  .kl[data-gast] .kl-nav { gap: 22px; margin-right: 16px; }
  .kl[data-gast] .kl-nav button { font-size: 14px; }
  .kl[data-gast] .kl-rechts { margin-left: 0; }
}

/* Rechts: Weiter-Pille, Anmelden, Chip, ☰ (kein Modus-Knopf – der sitzt ganz unten im ☰-Menü) */
.kl-rechts { display: flex; align-items: center; gap: 6px; flex-shrink: 0; margin-left: 6px; }
.kl-pille { display: none; align-items: center; gap: 8px; height: 36px; padding: 0 14px 0 10px; border-radius: 999px; border: 1px solid var(--kl-pille-rand); background: var(--kl-pille-hg);
  color: var(--kl-text); font-size: 12.5px; font-weight: 700; cursor: pointer; white-space: nowrap; max-width: 260px; transition: background .15s ease, border-color .15s ease, transform .12s ease; }
.kl-pille:hover { background: var(--kl-pille-hover); border-color: ${GOLD}; }
.kl-pille:active { transform: scale(.97); }
.kl-pille .zeichen { flex: none; width: 22px; height: 22px; border-radius: 999px; background: ${GOLD}; color: ${NACHT}; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 900; }
.kl-pille .name { overflow: hidden; text-overflow: ellipsis; }
.kl-pille .wann { font-weight: 500; color: var(--kl-nebel); }
@media ${DESKTOP} { .kl-pille { display: inline-flex; } }
.kl-anmelden { display: none; align-items: center; height: 36px; padding: 0 16px; border-radius: 999px; border: none; cursor: pointer; font-size: 13.5px; font-weight: 800; color: ${NACHT};
  background: linear-gradient(180deg, ${GOLD_HELL} 0%, ${GOLD} 100%); box-shadow: 0 8px 20px -8px rgba(237,187,0,0.8), inset 0 1px 0 rgba(255,255,255,.6); white-space: nowrap; transition: transform .12s ease, filter .12s ease; }
.kl-anmelden:hover { filter: brightness(1.04); }
.kl-anmelden:active { transform: scale(.97); }
@media (min-width: 700px) { .kl-anmelden { display: inline-flex; } }
/* Konto-Chip und ☰ aus funcHauptmenue.jsx folgen dem Modus */
.kl .hm-menueknopf { border-color: var(--kl-ring); color: var(--kl-text); }
.kl .hm-menueknopf:hover, .kl .hm-menueknopf[aria-expanded="true"] { background: var(--kl-ring-hover); border-color: ${GOLD}; }
.kl .hm-chip { background: var(--kl-chip-hg); }
/* Handy (unter 840 px, angemeldet): kein Konto-Chip – das Konto ist über ☰ erreichbar (seit 21.10.).
   Der freie Platz geht an Wortmarke, Slogan und einen größeren ☰-Knopf; die Zeile ist dafür etwas höher (--kopf-h). */
@media (max-width: 839px) {
  .kl .hm-chip { display: none; }
  .kl .hm-menueknopf { width: 48px; height: 48px; border-width: 2px; }
  .kl .hm-menueknopf svg { width: 24px; height: 24px; }
  .kl .kl-slogan { font-size: clamp(13.5px, 4.25vw, 23.33px); }
}

/* Lese-Fortschritt (nur wenn die Leiste klebt) */
.kl-fortschritt { position: absolute; left: 0; right: 0; bottom: -1px; height: 2px; transform-origin: left; transform: scaleX(0); pointer-events: none;
  background: linear-gradient(90deg, ${GOLD} 0%, ${GOLD_HELL} 100%); box-shadow: 0 0 10px rgba(237,187,0,0.55); }
/* Stadion (Rot-Weiß-Blau): die ganze Leiste Blau (auch die Unterkante), Kurve und Akzente Weiß.
   Wortmarke: MYTHOS und .DE Rot, MATHE Weiß – ohne Feld dahinter. Ohne Vereinslogo. */
.kl[data-edition="stadion"] { --kl-hg: #0066B2; --kl-kurve: #FFFFFF; --kl-nebel: #CFE3F5; --kl-linie: rgba(255,255,255,0.14); --kl-licht1: rgba(255,255,255,0.20); --kl-licht2: rgba(255,255,255,0.10);
  --kl-pille-hg: rgba(0,40,80,0.30); --kl-pille-hover: rgba(0,40,80,0.5); --kl-chip-hg: #00447A; --kl-plus: #DC052D; --kl-schatten: 0 18px 40px -22px rgba(0,50,100,.8); }
.kl[data-edition="stadion"] .kl-hg { background: radial-gradient(120% 90% at 0% 0%, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 55%),
  linear-gradient(155deg, #0A78C9 0%, #0066B2 45%, #00447A 100%); box-shadow: inset 0 1px 0 rgba(255,255,255,0.22); }
.kl[data-edition="stadion"] .kl-fortschritt { background: #FFFFFF; box-shadow: none; }
.kl[data-edition="stadion"] .kl-marke:focus-visible, .kl[data-edition="stadion"] button:focus-visible { outline-color: #FFFFFF; }
.kl[data-edition="stadion"] .marke-mythos, .kl[data-edition="stadion"] .marke-de { color: #DC052D;
  text-shadow: 1px 0 0 #FFFFFF, -1px 0 0 #FFFFFF, 0 1px 0 #FFFFFF, 0 -1px 0 #FFFFFF, 0.7px 0.7px 0 #FFFFFF, -0.7px 0.7px 0 #FFFFFF, 0.7px -0.7px 0 #FFFFFF, -0.7px -0.7px 0 #FFFFFF; }
/* Slogan: + und = in Rot, kräftiger geschnitten (ein weißer Rand würde die kleinen Zeichen weiß wirken lassen) */
.kl[data-edition="stadion"] .kl-slogan b { font-weight: 900; color: #FF1F45; }
.kl[data-edition="stadion"] .marke-mathe { background-image: none !important; -webkit-background-clip: border-box !important; background-clip: border-box !important;
  color: #FFFFFF !important; -webkit-text-fill-color: #FFFFFF !important; }
@media (prefers-reduced-motion: reduce) { .kl-bm, .kl-bm-schleier { animation: none; } .kl-kurve, .kl-kurve path, .kl-punkt { animation: none !important; } .kl-kurve { clip-path: none; } .kl-kurve path { opacity: var(--kl-kurve-ruhe); } .kl-punkt { opacity: .55; } .kl-zeile, .kl-slogan { transition: none; } }
`;

/* ---------- Modus der Startseite als Hook (dieselbe Quelle wie die Pille unten links) ---------- */
export function useKopfModus() {
  const [v, setV] = useState(startModus);
  useEffect(() => {
    const h = () => setV(startModus());
    window.addEventListener(EVENT_START_MODUS, h);
    return () => window.removeEventListener(EVENT_START_MODUS, h);
  }, []);
  return v;
}

/* Die Funktionskurve im Hintergrund: einmal eingezeichnet, dann bleibt sie als feine Linie */
function KopfKurve() {
  return (
    <>
      <svg className="kl-kurve" viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true">
        <path d="M-10 78 C 120 78, 200 22, 320 40 S 500 96, 640 56 S 840 8, 1010 42" />
      </svg>
      {/* als eigenes Element, damit er auf jeder Breite rund bleibt (das SVG wird verzerrt) */}
      <span className="kl-punkt" />
    </>
  );
}

const lies = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };

/* Trifft eine Media-Query zu? (Besucher unter 1000 px: ☰ öffnet das Besuchermenü) */
function useMedia(abfrage) {
  const [an, setAn] = useState(() => typeof window !== "undefined" && !!window.matchMedia && window.matchMedia(abfrage).matches);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const mq = window.matchMedia(abfrage);
    const h = () => setAn(mq.matches);
    h();
    if (mq.addEventListener) mq.addEventListener("change", h); else mq.addListener(h);
    return () => { if (mq.removeEventListener) mq.removeEventListener("change", h); else mq.removeListener(h); };
  }, [abfrage]);
  return an;
}

export function Kopfleiste({ ansicht, gehe, zurStartseite, hmOffen, setHmOffen, fotoModus, wzSeite, children }) {
  const konto = useKonto();
  const modus = useKopfModus();
  const gast = konto.geladen && !konto.nutzer;
  const klebrig = !wo(ansicht);
  const en = englisch();
  const [kompakt, setKompakt] = useState(false);
  const fortschritt = useRef(null);
  const zuletzt = !gast && klebrig ? zuletztAus(lies(ZULETZT_SCHLUESSEL)) : null;
  const schmal = useMedia(ZWEIZEILIG);
  const bmOffen = gast && schmal && hmOffen === "besucher";
  const kopf = useRef(null);
  const [schleierOben, setSchleierOben] = useState(0);

  /* Zusammenziehen und Lese-Fortschritt beim Scrollen – nur wenn die Leiste klebt */
  useEffect(() => {
    if (!klebrig || typeof window === "undefined") { setKompakt(false); return undefined; }
    let tick = false;
    const lauf = () => {
      tick = false;
      const y = window.scrollY || 0;
      setKompakt((k) => (k ? y > 8 : y > 48));
      const el = fortschritt.current;
      if (el) {
        const h = (document.documentElement.scrollHeight || 0) - window.innerHeight;
        el.style.transform = `scaleX(${h > 80 ? Math.min(1, Math.max(0, y / h)) : 0})`;
      }
    };
    const h = () => { if (!tick) { tick = true; window.requestAnimationFrame(lauf); } };
    lauf();
    window.addEventListener("scroll", h, { passive: true });
    window.addEventListener("resize", h);
    return () => { window.removeEventListener("scroll", h); window.removeEventListener("resize", h); };
  }, [klebrig, ansicht]);
  /* Andere klebende Leisten (z. B. Trainingszentrum) rechnen mit --kopf-h: zusammengezogen sind es 56 px */
  useEffect(() => {
    try { document.documentElement.style.setProperty("--kopf-h", kompakt ? "56px" : ""); } catch (e) { /* ohne Dokument */ }
    return () => { try { document.documentElement.style.removeProperty("--kopf-h"); } catch (e) { /* egal */ } };
  }, [kompakt]);

  /* Besuchermenü: Schleier beginnt unter der Leiste, Escape schließt; ab 1000 px gibt es kein Besuchermenü */
  useEffect(() => {
    if (hmOffen === "besucher" && !(gast && schmal)) setHmOffen(null);
  }, [hmOffen, gast, schmal]);
  useEffect(() => {
    if (!bmOffen) return undefined;
    const miss = () => { const el = kopf.current; if (el) setSchleierOben(Math.max(0, el.getBoundingClientRect().bottom)); };
    miss();
    const t = (e) => { if (e.key === "Escape") setHmOffen(null); };
    window.addEventListener("keydown", t);
    window.addEventListener("resize", miss);
    window.addEventListener("scroll", miss, { passive: true });
    return () => { window.removeEventListener("keydown", t); window.removeEventListener("resize", miss); window.removeEventListener("scroll", miss); };
  }, [bmOffen, kompakt]);

  const aktiv = besucherAktiv(ansicht, fotoModus);
  const menueZu = (eintrag) => {
    setHmOffen(null);
    gehe(eintrag.ziel);
    if (eintrag.anker) springeZuId("kopfmenue-anker", eintrag.anker);
  };

  return (
    <header ref={kopf} data-kopfleiste className="kl" data-bm-offen={bmOffen ? "1" : undefined} data-modus={basisModus(modus)} data-edition={editionVon(modus)} data-gast={gast ? "1" : undefined} data-kompakt={kompakt ? "1" : undefined} data-klebrig={klebrig ? "1" : undefined}>
      <style>{CSS}</style>
      <style>{`
        :root{--kopf-h:68px}
        @media (min-width:421px){:root{--kopf-h:clamp(74px, calc(11.1vw + 26px), 90px)}}
        .titel-kurz{display:none}
        @media (max-width:520px){.held{padding-top:18px !important;padding-bottom:4px !important}.held h1{font-size:25px !important;line-height:1.1 !important}.held h1+div{margin-top:12px !important;margin-bottom:13px !important}.held-welle{height:12px !important}}
        .kopfblock{margin-bottom:-16px}
        .kopfblock .held{padding-bottom:30px !important}
        @media (max-width:520px){.kopfblock .held{padding-bottom:22px !important}}
        @media (max-width:480px){.titel-lang{display:none}.titel-kurz{display:inline}
          .sek-menue{flex-wrap:nowrap !important;gap:5px !important;overflow-x:auto;scrollbar-width:none;margin-right:-24px;padding-right:24px}
          .sek-menue::-webkit-scrollbar{display:none}
          .sek-chip{flex:1 1 auto;padding:6px 6px !important;font-size:12px !important;text-align:center}
          .intro-h2{font-size:clamp(20px,6.6vw,26px) !important;white-space:nowrap}
          .intro-p{display:-webkit-box !important;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}}
        @media (max-width:340px){.sek-chip{padding:6px 4px !important;font-size:11.5px !important}.sek-menue{gap:4px !important}}
        .titel-silber{background:linear-gradient(180deg,#FFFFFF 0%,${C.silberHell} 50%,${C.silber} 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
      `}</style>
      <div className="kl-hg" aria-hidden="true">
        <span className="kl-licht l1" /><span className="kl-licht l2" />
        <KopfKurve />
      </div>

      <div className="mx-auto kopf-zeile kl-zeile" style={{ maxWidth: 620 }}>
        <button type="button" className="kl-marke" data-kein-i18n aria-label={en ? "Home" : "Zur Startseite"} title={en ? "Home" : "Zur Startseite"} onClick={zurStartseite}>
          {/* Wortmarke in der Schrift der Startseiten-Headline (src/markenLogo.jsx): so groß, wie neben dem ☰ Platz ist
              (Breite ≈ 10 × Schriftgröße), höchstens 40 px; darunter der Slogan (Besucher ab 1000 px ohne Slogan) */}
          <MarkenLogo groesse={gast ? "var(--kl-logo-gast)" : "min(40px, calc((100vw - 100px) / 10))"} grund={modus === "hell" ? "hell" : "dunkel"} />
          <span className="kl-slogan">System <b>+</b> Freude <b>=</b> Erfolg</span>
        </button>

        {gast && !schmal && (
          <nav className="kl-nav" aria-label={en ? "Main menu" : "Hauptmenü"}>
            {BESUCHER_MENUE.map((e) => (
              <button key={e.id} type="button" onClick={() => menueZu(e)} aria-current={aktiv === e.id ? "page" : undefined} data-besucher-menue={e.id}>
                {e.id === "mathilda" ? <MathildaName dunkel={modus !== "hell"} /> : e.name}
              </button>
            ))}
          </nav>
        )}

        <div className="kl-rechts">
          {zuletzt && (
            <button type="button" className="kl-pille" onClick={() => { setHmOffen(null); gehe(zuletzt.ziel); }} title={`${zuletzt.name} · ${zuletzt.wann}`} data-kl-weiter>
              <span className="zeichen" aria-hidden="true">▶</span>
              <span className="name">{en ? "Continue: " : "Weiter: "}{zuletzt.name}</span>
            </button>
          )}
          {gast && (
            <button type="button" className="kl-anmelden" onClick={() => { setHmOffen(null); gehe({ ansicht: "konto" }); }} data-kl-anmelden>{en ? "Sign in" : "Anmelden"}</button>
          )}
          {/* Konto-Chip (angemeldet, nur ab 840 px) + Menü-Knopf ☰ – das alte Kopfmenü ist als „Arbeitsmenü“ in der Fußzeile */}
          <KontoBereich offen={hmOffen} setOffen={setHmOffen} gehe={gehe} ziel={gast && schmal ? "besucher" : "menue"} />
        </div>
      </div>

      {/* Besuchermenü hinter ☰ (Besucher unter 1000 px): die vier Punkte, Anmelden, „Alle Bereiche“ ins große ☰-Menü */}
      {bmOffen && (
        <>
          <div className="kl-bm-schleier" style={{ top: schleierOben }} onClick={() => setHmOffen(null)} aria-hidden="true" />
          <div className="kl-bm" role="dialog" aria-label={en ? "Menu" : "Menü"} data-besuchermenue>
            <ul className="kl-bm-liste">
              {BESUCHER_MENUE.map((e) => (
                <li key={e.id}>
                  <button type="button" onClick={() => menueZu(e)} aria-current={aktiv === e.id ? "page" : undefined} data-besucher-menue={e.id}>
                    {e.id === "mathilda" ? <MathildaName dunkel={false} /> : e.name}
                  </button>
                </li>
              ))}
            </ul>
            <div className="kl-bm-fuss">
              <button type="button" className="kl-bm-anmelden" onClick={() => { setHmOffen(null); gehe({ ansicht: "konto" }); }} data-kl-bm-anmelden>{en ? "Sign in" : "Anmelden"}</button>
              <button type="button" className="kl-bm-alles" onClick={() => setHmOffen("menue")} data-kl-bm-alles>{en ? "All areas and tools" : "Alle Bereiche und Werkzeuge"}</button>
            </div>
          </div>
        </>
      )}

      {/* ☰-Menü (Fenster): Suche · Mathilda · Meine Kurse · Klasse · Mein Training · Mathematik · Konto · Abmelden/Anmelden */}
      <div className="mx-auto kopf-zeile" style={{ maxWidth: 620, paddingLeft: 12, paddingRight: 12 }}>
        <HauptMenue gehe={gehe} ansicht={ansicht} foto={fotoModus} seite={wzSeite} offen={hmOffen} setOffen={setHmOffen} />
      </div>
      {children}
      {klebrig && <span className="kl-fortschritt" ref={fortschritt} aria-hidden="true" />}
    </header>
  );
}
