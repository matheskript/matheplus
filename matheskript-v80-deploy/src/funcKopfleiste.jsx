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
                in voller Größe (40 px; ab ~1306 px wächst sie mit der Seitenbreite
                --seite aus index.css bis 56 px bei 1920 px, Zeile und Menüschrift
                mit), die vier Punkte fest daneben (nie zum Ausklappen), kein Slogan.
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
const BREIT = "(min-width: 1000px)";       // Alle: eine breite Zeile (symmetrischer Rand), Wortmarke voll – angemeldet mit Slogan links darunter
/* Linke Kante der Schlagzeile auf der Startseite (Bühne in funcStartseite.jsx): 50 % − 371,5 px.
   Die Wortmarke beginnt 63 px davor – dann steht das T von MYTHOS über dem M von „Mathe“. */
const HELD_KANTE = "calc(50% - 434.5px)";
/* Breite des Inhalts von der Wortmarke bis zum ☰: die Seitenbreite --seite (index.css; 940 px, ab ~1516 px wachsend
   bis 1200 px – gemessen braucht die Zeile bei 40-px-Wortmarke 930 px). Seit 21.10. symmetrisch: links und rechts
   derselbe Rand (--kl-rand), höchstens bis zur Schlagzeilenkante – das Menü endet also so weit vom rechten Rand wie
   die Wortmarke vom linken. Passt beides nicht, rückt die Marke ein Stück vor die T-Kante. */
const BREIT_BEDARF = "var(--seite, 940px)";

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
.kl-slogan { font-size: clamp(12.25px, 3.79vw, 23.33px); font-weight: 600; letter-spacing: .03em; white-space: nowrap; line-height: 1.25; margin-top: 0; color: var(--kl-text);
  padding-bottom: .14em; margin-bottom: -.14em;
  transition: opacity .22s ease, max-height .28s ease, margin .28s ease, padding .28s ease, font-size .28s ease; max-height: 40px; overflow: hidden; }
/* Das g von „Erfolg“: Montserrat ragt 0,25 em unter die Grundlinie, die Unterlänge des g 0,21 em. Mit line-height 1
   + overflow hidden war es abgeschnitten (Fehler bis 21.10.). Deshalb Zeilenhöhe 1,25 UND ein Innenabstand unten
   (.14 em, per negativem Außenabstand aus der Zeilenhöhe herausgerechnet): der Clip-Kasten reicht sicher unter die
   Unterlängen, egal wie die Schriftgröße rundet. */
.kl-slogan b { font-weight: 600; color: var(--kl-plus); }
@media (min-width: 421px) { .kl-slogan { margin-top: 3px; } }
@media ${DESKTOP} { .kl-slogan { margin-top: 0; } }
.kl[data-kompakt] .kl-slogan { opacity: 0; max-height: 0; margin-top: 0; padding-bottom: 0; margin-bottom: 0; }
/* Besucher: unter 1000 px wie angemeldet (Wortmarke + Slogan, mittig untereinander); ab 1000 px Marke links, ohne Slogan (siehe BREIT) */
@media (max-width: 420px) { .kl-zeile { padding-left: 14px; } }

/* Besuchermenü: feste Punkte */
.kl-nav { display: flex; align-items: center; gap: 24px; margin: 0 12px 0 auto; padding: 0; list-style: none; }
/* Größe der Wortmarke für Besucher: unter 1000 px so groß wie angemeldet (Platz bis zum ☰), darüber voll (siehe BREIT) */
.kl { --kl-logo-gast: min(40px, calc((100vw - 100px) / 10)); --kl-logo: min(40px, calc((100vw - 100px) / 10)); }
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
  background-color: #0B2763; background-image: radial-gradient(120% 60% at 100% 0%, rgba(255,229,138,0.16) 0%, rgba(255,229,138,0) 60%), linear-gradient(165deg, #0A3A80 0%, #0B2763 55%, ${NACHT} 100%);
  color: #FFFFFF; border-radius: 22px; box-shadow: 0 24px 60px -18px rgba(5,11,31,0.75), 0 0 0 1px rgba(237,187,0,0.28), inset 0 1px 0 rgba(255,255,255,0.12);
  animation: klRein .22s cubic-bezier(.2,.7,.3,1) both; }
.kl-bm-liste { list-style: none; margin: 0; padding: 0; }
.kl-bm-liste button { position: relative; width: 100%; display: flex; align-items: center; gap: 13px; padding: 12px 12px; border: none; border-radius: 14px;
  background: none; cursor: pointer; color: #FFFFFF; text-align: left; }
.kl-bm-liste li + li button { box-shadow: inset 0 1px 0 rgba(255,255,255,0.09); }
.kl-bm-liste li + li button:hover, .kl-bm-liste button:hover { background: rgba(255,255,255,0.07); box-shadow: none; }
.kl-bm-zeichen { flex: 0 0 auto; width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; color: ${GOLD};
  background: linear-gradient(160deg, rgba(255,255,255,0.12), rgba(255,255,255,0.03)); box-shadow: inset 0 0 0 1px rgba(237,187,0,0.35); }
.kl-bm-text { flex: 1 1 auto; min-width: 0; display: grid; gap: 3px; }
.kl-bm-name { font-size: 17px; font-weight: 800; letter-spacing: -0.01em; line-height: 1.1; }
.kl-bm-kurz { font-size: 12.5px; font-weight: 500; line-height: 1.3; color: rgba(255,255,255,0.68); }
.kl-bm-liste button::after { content: "›"; flex: 0 0 auto; font-size: 22px; font-weight: 700; line-height: 1; color: ${GOLD}; transition: transform .18s ease; }
.kl-bm-liste button:hover::after { transform: translateX(3px); }
.kl-bm-liste button[aria-current="page"]::before { content: ""; position: absolute; left: 0; top: 14px; bottom: 14px; width: 3px; border-radius: 3px; background: ${GOLD}; }
.kl-bm-liste [data-besucher-menue="mathilda"] .kl-bm-name > span > span + span { margin-left: .26em; }
.kl-bm-fuss { display: grid; gap: 8px; margin-top: 8px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.12); }
.kl-bm-anmelden { height: 46px; border-radius: 999px; border: none; cursor: pointer; font-size: 15px; font-weight: 800; color: ${NACHT};
  background: linear-gradient(180deg, ${GOLD_HELL} 0%, ${GOLD} 100%); box-shadow: 0 8px 20px -10px rgba(237,187,0,0.9), inset 0 1px 0 rgba(255,255,255,.6); }
.kl-bm-alles { height: 42px; border-radius: 999px; border: 1.5px solid rgba(255,255,255,0.28); background: rgba(255,255,255,0.06); cursor: pointer; font-size: 13.5px; font-weight: 700; color: #FFFFFF; }
.kl-bm-alles:hover { border-color: ${GOLD}; }
.kl-bm button { font-family: inherit; }
@keyframes klBlende { from { opacity: 0; } }
@keyframes klRein { from { opacity: 0; transform: translateY(-6px) scale(.98); } }
@media ${BREIT} { .kl-bm, .kl-bm-schleier { display: none; } }
/* Ab 1000 px (seit 21.10. abends für ALLE, vorher nur Besucher): eine breite Zeile wie eine normale Website.
   Die Wortmarke beginnt bündig mit der Schlagzeile; nur wenn rechts der Platz fehlt, rückt sie so weit wie nötig
   nach links. Rechts endet die Zeile genauso weit vor dem Rand wie die Wortmarke links beginnt (symmetrisch, --kl-rand).
   Größe (seit 21.10. nachts): Wortmarke, Zeilenhöhe und Menüschrift hängen an der Seitenbreite --seite (index.css) –
   940 px → 40 px Wortmarke, 1440 px → 44 px, 1680 px → 51 px, 1920 px → 56 px; zusammengezogen (beim Scrollen) immer 40 px in 56 px.
   Angemeldet: Slogan linksbündig unter der Wortmarke, seine Größe folgt der Wortmarke (halbe Höhe); Pille, Chip und ☰ rechts. */
@media ${BREIT} {
  .kl { --kl-logo-gast: clamp(40px, calc(var(--seite, 940px) * .042), 56px); --kl-logo: clamp(40px, calc(var(--seite, 940px) * .042), 56px);
    --kl-rand: max(32px, min(${HELD_KANTE}, calc((100% - ${BREIT_BEDARF}) / 2))); }
  .kl[data-kompakt] { --kl-logo-gast: 40px; --kl-logo: 40px; }
  .kl .kl-marke > span { transition: font-size .28s cubic-bezier(.2,.7,.3,1); }
  .kl .mx-auto.kopf-zeile.kl-zeile { width: 100% !important; max-width: none !important; margin-left: 0 !important; margin-right: 0 !important;
    padding: 0 var(--kl-rand) !important; gap: 0; }
  .kl .kl-marke { align-items: flex-start; text-align: left; margin-right: 28px; }
  .kl:not([data-gast]) .kl-slogan { font-size: calc(var(--kl-logo) * .5); margin-top: 2px; max-height: 44px; }
  /* gleiche Spezifität wie die Zeile darüber, deshalb hier noch einmal: zusammengezogen verschwindet der Slogan */
  .kl[data-kompakt]:not([data-gast]) .kl-slogan { max-height: 0; margin-top: 0; padding-bottom: 0; margin-bottom: 0; }
  .kl[data-gast] .kl-nav { gap: clamp(22px, calc(var(--seite, 940px) * .028), 34px); margin-right: 16px; }
  .kl[data-gast] .kl-nav button { font-size: clamp(14px, calc(var(--seite, 940px) * .0135), 17px); }
  .kl .kl-rechts { margin-left: auto; gap: 8px; }
  .kl[data-gast] .kl-rechts { margin-left: 0; }
  .kl .kl-pille { height: 38px; font-size: 13px; max-width: 320px; }
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
/* Stadion (Rot-Weiß-Blau, Stand 21.10. mittags): die ganze Leiste Rot, Schrift Weiß, Kurve Weiß.
   Wortmarke: MYTHOS und .DE Blau mit weißem Rand, MATHE Weiß (Regeln für Kopfleiste und Fußzeile in stadionGold.js).
   + und = im Slogan Blau. Ohne Vereinslogo. */
.kl[data-edition="stadion"] { --kl-hg: #DC052D; --kl-kurve: #FFFFFF; --kl-nebel: #FFE0E6; --kl-linie: rgba(255,255,255,0.16); --kl-licht1: rgba(255,255,255,0.20); --kl-licht2: rgba(255,255,255,0.10);
  --kl-pille-hg: rgba(90,0,18,0.25); --kl-pille-hover: rgba(90,0,18,0.42); --kl-chip-hg: #00447A; --kl-plus: #00447A; --kl-schatten: 0 18px 40px -22px rgba(120,0,25,.8); }
.kl[data-edition="stadion"] .kl-hg { background: radial-gradient(120% 90% at 0% 0%, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 55%),
  linear-gradient(155deg, #F0284A 0%, #DC052D 45%, #A3001F 100%); box-shadow: inset 0 1px 0 rgba(255,255,255,0.22); }
.kl[data-edition="stadion"] .kl-fortschritt { background: #FFFFFF; box-shadow: none; }
.kl[data-edition="stadion"] .kl-marke:focus-visible, .kl[data-edition="stadion"] button:focus-visible { outline-color: #FFFFFF; }
.kl[data-edition="stadion"] .kl-slogan b { font-weight: 900; color: #00447A; }
/* GER (Schwarz-Rot-Gold + Weiß): Leiste Schwarz, unten ein Rot-Gold-Saum; Wortmarke wie im Original (Weiß + Gold),
   + und = im Slogan Rot. Die Fußzeile (funcRecht.jsx, .seiten-fuss) sieht genauso aus – Regeln hier, weil die Kopfleiste auf jeder Seite steht. */
.kl[data-edition="ger"] { --kl-hg: #0A0A0A; --kl-text: #FFFFFF; --kl-nebel: #D6D6D6; --kl-linie: rgba(255,255,255,0.12); --kl-kurve: #FFCE00; --kl-licht1: rgba(255,206,0,0.22); --kl-licht2: rgba(221,0,0,0.22);
  --kl-pille-hg: rgba(255,255,255,0.08); --kl-pille-hover: rgba(255,255,255,0.15); --kl-chip-hg: #DD0000; --kl-plus: #FF2B2B; --kl-schatten: 0 18px 40px -22px rgba(0,0,0,.9); }
.kl[data-edition="ger"] .kl-hg { background: radial-gradient(120% 90% at 0% 0%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 55%), linear-gradient(155deg, #262626 0%, #0A0A0A 50%, #000000 100%);
  border-bottom: 0; box-shadow: inset 0 -3px 0 #FFCE00, inset 0 -6px 0 #DD0000; }
.kl[data-edition="ger"] .kl-slogan b { font-weight: 900; }
.kl[data-edition="ger"] .kl-fortschritt { background: linear-gradient(90deg, #DD0000 0%, #FFCE00 100%); box-shadow: none; }
html[data-start-edition="ger"] .seiten-fuss { background: radial-gradient(120% 90% at 0% 0%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 55%), linear-gradient(155deg, #262626 0%, #0A0A0A 50%, #000000 100%) !important;
  box-shadow: inset 0 3px 0 #DD0000, inset 0 6px 0 #FFCE00; }
html[data-start-edition="ger"] .seiten-fuss button { color: #D6D6D6 !important; }
html[data-start-edition="ger"] .seiten-fuss .fuss-zeichen { color: #FF2B2B !important; font-weight: 900; }
@media (prefers-reduced-motion: reduce) { .kl-bm, .kl-bm-schleier { animation: none; } .kl-kurve, .kl-kurve path, .kl-punkt { animation: none !important; } .kl-kurve { clip-path: none; } .kl-kurve path { opacity: var(--kl-kurve-ruhe); } .kl-punkt { opacity: .55; } .kl-zeile, .kl-slogan { transition: none; } }
`;

/* ---------- Modus der Startseite als Hook (dieselbe Quelle wie die Pille unten links) ---------- */
/* Zeichen im Besuchermenü (Gold auf Dunkelblau, 22 px) */
function BesucherZeichen({ id }) {
  const g = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round" };
  if (id === "vision") return <svg {...g}><path d="M3 18 L9 9 L13 14 L16 10 L21 18 Z" /><circle cx="17" cy="5.5" r="2" fill="currentColor" stroke="none" /></svg>;
  if (id === "lernen") return <svg {...g}><path d="M3 20 C7 20 9 7 13 7 S19 12 21 4" /><path d="M3 4 V20 H21" opacity=".55" /></svg>;
  if (id === "mathilda") return <svg {...g}><rect x="4" y="3" width="13" height="18" rx="2" /><path d="M7.5 8h6M7.5 11.5h6M7.5 15h3" /><path d="M14.5 16.5 l2 2 l4 -4.5" /></svg>;
  return <svg {...g}><path d="M5 4 h10 l4 4 v12 H5 Z" /><path d="M8.5 11h7M8.5 14.5h7M8.5 18h4" /></svg>;
}

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
        @media (min-width:1000px){:root{--kopf-h:clamp(90px, calc(var(--seite, 940px) * .0935), 120px)}}
        .titel-kurz{display:none}
        @media (max-width:520px){div.held{padding-top:18px !important;padding-bottom:4px !important}.held h1{font-size:25px !important;line-height:1.1 !important}.held h1+div{margin-top:12px !important;margin-bottom:13px !important}.held-welle{height:12px !important}}
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
          {/* Wortmarke in der Schrift der Startseiten-Headline (src/markenLogo.jsx): unter 1000 px so groß, wie neben dem ☰
              Platz ist (Breite ≈ 10 × Schriftgröße, höchstens 40 px), ab 1000 px 40–46 px (--kl-logo / --kl-logo-gast);
              darunter der Slogan (Besucher ab 1000 px ohne Slogan) */}
          <MarkenLogo groesse={gast ? "var(--kl-logo-gast)" : "var(--kl-logo)"} grund={modus === "hell" ? "hell" : "dunkel"} />
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
                    <span className="kl-bm-zeichen" aria-hidden="true"><BesucherZeichen id={e.id} /></span>
                    <span className="kl-bm-text">
                      <span className="kl-bm-name">{e.id === "mathilda" ? <MathildaName dunkel /> : e.name}</span>
                      <span className="kl-bm-kurz" data-kein-i18n>{en ? e.kurzEn : e.kurz}</span>
                    </span>
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
