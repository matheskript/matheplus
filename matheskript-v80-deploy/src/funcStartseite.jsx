/* ======================================================================
   STARTSEITE (Dashboard, angemeldet) – „Rechenblatt“ in drei Modi: dunkel (Nachtblau), hell (weiß)
   und mix (weißer Grund mit dunklen Inseln). Bewusst ohne Karos.
   Seit 22.10. sehen Besucher ohne Konto stattdessen die Story-Startseite (funcStartGast.jsx, StartseiteWahl);
   der LernNavigator (Block 3) und MathildaBlock/KursRaster/BlogAnriss sind exportiert und dort wiederverwendet.

   Sieben Blöcke (seit 21.10. abends, Projekt-Dokument claude/startseite-struktur.md):
     0 Band unter der Kopfleiste (StartBand: Heute · Lernen · Mathilda · Kurse · Entdecken, klebt mit)
     1 Bühne: Headline, Unterzeile, Goldknopf „Pen & Paper starten · kostenlos“ (nur ohne Klasse), Suche
     2 Heute: die eine Start-Karte (funcStartKarte.jsx); Masterclass-Kachel nur für die Oberstufe
     3 Lernen: nur der Navigator „Der Weg zum Abi“ (Stufe → Bereich → Werkzeug)
     4 Mathilda AI: eine Karte wie im ☰ (Blatt scannen + Chips) und der Zweischritt Pen & Paper → Mathilda
     5 Kurse: dieselbe Liste wie ☰ „Kurse“ (KURSE), sechs kompakte Karten, „Alle Kurse“ → /kurse
     6 Mathe entdecken (aufklappbar) + der neueste Blog-Beitrag
     7 Vision-Anriss (ein Satz, „Die Vision lesen“, „Die 7 Mathe-Mythen“ im Blog), Anleitung, Spenden
   Zwei Regeln: jeder Block hat genau einen ☰-Abschnitt mit demselben Namen; Gesperrtes steht nie auf der
   Startseite (Ebbinghaus, Videokurse, Mathe checken … nur hinter ZEIGE_GESPERRTE).

   Mix: die Seite ist hell, dunkel bleiben die Bühne, die Inseln (Start-Karte, Navigator, Mathe entdecken)
   und zwei Streifen über die volle Breite (Mathilda, Vision). Technisch: jede Insel trägt die Klasse
   sbb-insel und bekommt dort den dunklen Satz der Variablen zurück; Streifen (sbb-streifen) malen ihre Nacht selbst.
   Modus: src/startModus.js (☰-Menü ganz unten, Arbeitsmenü, Links /start-hell, /start-dunkel, /start-mix) –
   die Pille StartModusSchalter steht nicht mehr auf der Startseite. Die Startseite vom 20.10. liegt
   eingefroren im Archiv „Biro-Edition (20.10.)“ (public/archiv/2026-10-20).
   ====================================================================== */
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { C } from "./base1.jsx";
import { PenPaperBlatt } from "./func1.jsx";
import { MathildaName } from "./mathildaName.jsx";
import { MathildaPfade } from "./mathildaBild.jsx";
import { UnterMenue, schulBereiche, blockEintraege, bereichInhalt, useStartStufe, useFrei,
  SchlossZeichen, SchulkurseLogoKlein, ZEIGE_GESPERRTE, SchulmatheLogoKlein } from "./func2.jsx";
import { EtikettKnoepfe } from "./funcWerkzeuge.jsx";
import { EBB_KURZ, EbbinghausBadge, EbbinghausLogoKlein } from "./funcEbbinghaus.jsx";
import { EntdeckenLogoKlein } from "./funcEntdeckenLogo.jsx";
import { StartKarte } from "./funcStartKarte.jsx";
import { Quickfinder } from "./funcQuickfinder.jsx";
import { AppAnleitung } from "./funcAnleitung.jsx";
import { SuchBox } from "./funcSuche.jsx";
import { MasterclassKachel, MatheCheckenKachel, MathCreatorKachel } from "./funcMasterclass.jsx";
import { AbiZentrumKachel } from "./funcKursKachel.jsx";
import { KURSE, WEITERE_ANGEBOTE, KI_MENUE } from "./hauptmenue.js";
import { KURS_STIL, TRENNUNG } from "./hauptmenueTeile.jsx";
import { diffStand, vekStand, gfsStand, kiStand, unterStand } from "./kursStand.js";
import { BLOG, MYTHEN_SLUG, datumKurz } from "./blogDaten.js";
import { englisch } from "./i18n.js";
import { springe } from "./sprung.js";
import { ElternabendKachel } from "./funcElternabend.jsx";
import { SpendenBereich } from "./funcSpendenBereich.jsx";
import { ANGEBOT } from "./angebot.js";
import { ENTDECKEN_MENUE, START_ANKER } from "./startMenues.js";
import { EVENT_START_MODUS, startModus, startModusSetzen, basisModus, editionVon } from "./startModus.js";

/* ---------- Farben ---------- */
const NACHT = "#050B1F";
const GOLD = C.flaggold;
const GOLD_HELL = "#FFE58A";
const DESKTOP = "(min-width: 840px)";
/* Stadion-Ansicht (Rot-Weiß-Blau): nur die Farben, kein Vereinslogo, kein Vereinsname */
const ROT = "#DC052D", ROT_TIEF = "#A3001F", ROT_HELL = "#F0284A", BLAU = "#0066B2", BLAU_TIEF = "#00447A";
/* GER-Ansicht (Schwarz-Rot-Gold + Weiß) */
const SCHWARZ = "#0A0A0A", D_ROT = "#DD0000", D_ROT_TIEF = "#A50000", D_GOLD = "#FFCE00";

/* Alle Farben hängen an Variablen; „hell“ und „mix“ setzen sie unten um (gleiche Fläche, weißer Grund).
   Im Mix bekommen die Inseln (sbb-insel) den dunklen Satz zurück. */
export const START_CSS = `
.sbb, .sbb-schalter, .sbb[data-modus="mix"] .sbb-insel {
  --hg: ${NACHT}; --text: #EEF2FF; --nebel: #AEBCDD; --titel: #FFFFFF; --linie: rgba(255,255,255,0.11);
  --karte: linear-gradient(160deg, rgba(255,255,255,0.085) 0%, rgba(255,255,255,0.035) 60%, rgba(255,255,255,0.02) 100%);
  --karte-schatten: 0 30px 60px -36px rgba(0,0,0,.9), inset 0 1px 0 rgba(255,255,255,0.08);
  --bild: radial-gradient(120% 140% at 50% 120%, rgba(0,77,152,0.55) 0%, rgba(0,77,152,0.08) 55%, rgba(0,0,0,0) 100%);
  --bild-rechts: radial-gradient(140% 120% at 100% 50%, rgba(0,77,152,0.55) 0%, rgba(0,77,152,0.08) 60%, rgba(0,0,0,0) 100%);
  --akzent-text: ${NACHT}; --band: rgba(5,11,31,0.55);
  --papier-schatten: 0 30px 60px -30px rgba(0,0,0,.9), 0 0 0 1px rgba(255,255,255,0.08);
  --zu-titel: #C9D2E6; --knopf-hg: #FFFFFF; --knopf-text: ${NACHT}; --pille-hg: rgba(237,187,0,0.08); --pille-text: ${GOLD_HELL};
  --mythos-hg: rgba(237,187,0,0.07); --schalter-hg: rgba(5,11,31,0.86); --schalter-rand: rgba(255,255,255,0.18);
  --h1-schatten: 0 12px 50px rgba(0,0,0,.45); --glyph: #FFFFFF; --licht: .55;
  --stufe-hg: rgba(255,255,255,0.07); --stufe-rand: rgba(255,255,255,0.16); --stufe-zeile: #AEBCDD;
  --such-hg: rgba(255,255,255,0.12); --such-rand: rgba(255,255,255,0.30); --such-text: #FFFFFF; --such-platz: rgba(255,255,255,0.78);
}
.sbb[data-modus="hell"], .sbb-schalter[data-modus="hell"], .sbb[data-modus="mix"], .sbb-schalter[data-modus="mix"] {
  --hg: #FFFFFF; --text: ${C.tinte}; --nebel: ${C.grau}; --titel: ${C.seeTief}; --linie: ${C.linie};
  --karte: #FFFFFF; --karte-schatten: 0 3px 16px rgba(15,26,51,0.07);
  --bild: linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%); --bild-rechts: linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%);
  --akzent-text: ${C.seeTief}; --band: rgba(255,255,255,0.85);
  --papier-schatten: 0 3px 16px rgba(15,26,51,0.08), 0 0 0 1px ${C.linie};
  --zu-titel: ${C.hellgrau}; --knopf-hg: ${C.seeTief}; --knopf-text: #FFFFFF; --pille-hg: #FFFBEA; --pille-text: ${C.gruenDunkel};
  --mythos-hg: #FFF7D6; --schalter-hg: rgba(255,255,255,0.94); --schalter-rand: ${C.linie};
  --h1-schatten: none; --glyph: ${C.see}; --licht: .28;
  --stufe-hg: #F3F6FB; --stufe-rand: ${C.linie}; --stufe-zeile: ${C.grau};
  --such-hg: #FFFFFF; --such-rand: ${C.linie}; --such-text: ${C.tinte}; --such-platz: ${C.grau};
}
html[data-start-modus="dunkel"] .app-wurzel { background: ${NACHT} !important; }
html[data-start-modus="hell"] .app-wurzel, html[data-start-modus="mix"] .app-wurzel { background: #FFFFFF !important; }
/* Mix: Streifen malen ihre Nacht selbst (ohne Karos – passt nicht zur Marke).
   Die Bühne ist dagegen lackiertes Blau (21.10.): Sie schließt direkt an die Kopfleiste an, die im Mix
   ebenfalls blau ist (155°-Verlauf #0A5AB0 → see → seeTief). Oben hell wie deren Unterkante, nach unten
   tiefer, aber klar blau – Gold und Weiß behalten ihren Kontrast. */
.sbb[data-modus="mix"] .sbb-streifen { background-color: ${NACHT}; }
.sbb[data-modus="mix"] .sbb-held { background-color: ${C.seeTief};
  background-image: radial-gradient(110% 70% at 0% 0%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 60%),
    linear-gradient(155deg, #0656A7 0%, ${C.see} 22%, #0A3A80 58%, #0B2A63 100%); }
/* Auf Blau wirkt halbdurchsichtiges Gold oliv – die Kurve tritt im Mix daher nur bis 0,62 zurück */
.sbb[data-modus="mix"] .sbb-held-kurve .kurve { animation-name: sbbVerblassenMix; }
@keyframes sbbVerblassenMix { to { opacity: .62; } }
.sbb[data-modus="mix"] .sbb-held::before { content: ""; position: absolute; width: 60vw; max-width: 640px; height: 60vw; max-height: 640px; top: -22vw; right: -18vw; border-radius: 999px; pointer-events: none;
  background: radial-gradient(circle, rgba(255,229,138,0.30) 0%, rgba(255,229,138,0) 70%); filter: blur(50px); }
.sbb[data-modus="mix"] .sbb-streifen { margin-top: 48px; padding: 4px 0 46px; }
.sbb[data-modus="mix"] .sbb-streifen .sbb-kopf { margin-top: 36px; }
.sbb[data-modus="mix"] .sbb-streifen + .sbb-teil .sbb-kopf { margin-top: 40px; }
/* Mix: Inseln als Kacheln – lackiertes Blau mit Lichtsaum oben, damit sie auf dem weißen Blatt hervorstehen */
.sbb[data-modus="mix"] .sbb-karte.sbb-insel { background: radial-gradient(120% 90% at 0% 0%, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0) 55%), linear-gradient(155deg, #0A5AB0 0%, ${C.see} 38%, ${C.seeTief} 100%);
  border-color: rgba(255,255,255,0.16); box-shadow: 0 10px 28px rgba(0,47,110,0.28), inset 0 1px 0 rgba(255,255,255,0.22); }
.sbb[data-modus="mix"] .sbb-karte.sbb-insel.sbb-gold { border-color: rgba(237,187,0,0.8); box-shadow: 0 0 0 1px rgba(237,187,0,0.45), 0 14px 34px rgba(0,47,110,0.3); }
/* Mix (21.10.): weiße Kacheln (Kopfrechnen, Gleichungen, Ebbinghaus, Mindset, Videokurse …) stehen sonst
   weiß auf weiß – daher blauer Rand und der Öffnen-Knopf als Pille mit blauem Rand. Gesperrte halb so kräftig. */
.sbb[data-modus="mix"] .sbb-kachel:not(.sbb-insel) { border: 1.5px solid ${C.see}; box-shadow: 0 6px 22px rgba(0,47,110,0.10); }
.sbb[data-modus="mix"] .sbb-kachel:not(.sbb-insel) .sbb-kachel-bild { border-left-color: ${C.see}; }
.sbb[data-modus="mix"] .sbb-kachel.zu:not(.sbb-insel), .sbb[data-modus="mix"] .sbb-kachel.zu:not(.sbb-insel) .sbb-kachel-bild { border-color: rgba(0,77,152,0.42); }
.sbb[data-modus="mix"] .sbb-kachel:not(.sbb-insel) .weiter { align-self: flex-start; margin-top: 4px; padding: 6px 14px; border-radius: 999px; border: 1.5px solid ${C.see};
  background: #EEF4FB; color: ${C.seeTief}; line-height: 1.2; transition: background .18s ease, color .18s ease; }
.sbb[data-modus="mix"] .sbb-kachel:not(.sbb-insel) .weiter.pille { margin-top: 0; }
.sbb[data-modus="mix"] .sbb-kachel:not(.sbb-insel) .weiter.pille.zu { border-style: dashed; border-color: rgba(0,77,152,0.42); background: transparent; color: var(--zu-titel); }
@media (hover:hover) { .sbb[data-modus="mix"] .sbb-kachel:not(.sbb-insel):not(:disabled):hover { border-color: ${C.see}; box-shadow: 0 0 0 1px ${C.see}, 0 16px 36px rgba(0,47,110,0.18); }
  .sbb[data-modus="mix"] .sbb-kachel:not(.sbb-insel):not(:disabled):hover .weiter { background: ${C.see}; color: #FFFFFF; } }
html[data-start-modus="dunkel"] .fuss-paar :is(button, .fb-seite) { color: #EEF2FF !important; background: rgba(255,255,255,0.06) !important; border-color: rgba(255,255,255,0.11) !important; }
/* ---------- Stadion (Rot-Weiß-Blau) ----------
   Baut auf dem Mix auf (data-modus="mix") und färbt über data-edition="stadion" um:
   Bühne und Hauptkacheln Rot, die zwei Streifen Blau, das Blatt Weiß. Gold wird zu Weiß (auf Farbe)
   bzw. Rot (auf Weiß). Kein Vereinslogo, kein Vereinsname. */
.sbb[data-edition="stadion"] { --titel: ${BLAU_TIEF}; --glyph: ${ROT}; --knopf-hg: ${ROT}; --pille-hg: #FDECEF; --pille-text: ${ROT_TIEF}; --mythos-hg: #FDECEF;
  --st-akzent: ${ROT}; --st-akzent-text: #FFFFFF; }
.sbb[data-edition="stadion"] .sbb-insel { --akzent-text: ${ROT}; --st-akzent: #FFFFFF; --st-akzent-text: ${ROT}; --nebel: #FFD9E0; }
.sbb[data-edition="stadion"] .sbb-streifen { --st-akzent: #FFFFFF; --st-akzent-text: ${BLAU}; --nebel: #CFE3F5; --akzent-text: ${BLAU}; }
html[data-start-edition="stadion"] .app-wurzel { background: #FFFFFF !important; }
.sbb[data-edition="stadion"] .sbb-held { background-color: ${ROT};
  background-image: radial-gradient(110% 70% at 0% 0%, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 60%),
    linear-gradient(155deg, ${ROT_HELL} 0%, ${ROT} 30%, #C10328 62%, ${ROT_TIEF} 100%); }
.sbb[data-edition="stadion"] .sbb-held::before { background: radial-gradient(circle, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 70%); }
.sbb[data-edition="stadion"] .sbb-streifen { background-color: ${BLAU};
  background-image: radial-gradient(110% 80% at 0% 0%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 60%), linear-gradient(155deg, #0A78C9 0%, ${BLAU} 45%, ${BLAU_TIEF} 100%); }
.sbb[data-edition="stadion"] .sbb-karte.sbb-insel { background: radial-gradient(120% 90% at 0% 0%, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 55%), linear-gradient(155deg, ${ROT_HELL} 0%, ${ROT} 40%, ${ROT_TIEF} 100%);
  border-color: rgba(255,255,255,0.22); box-shadow: 0 10px 28px rgba(163,0,31,0.26), inset 0 1px 0 rgba(255,255,255,0.25); }
.sbb[data-edition="stadion"] .sbb-karte.sbb-insel.sbb-gold { border-color: ${BLAU}; box-shadow: 0 0 0 2px ${BLAU}, 0 14px 34px rgba(163,0,31,0.3); }
.sbb[data-edition="stadion"] .sbb-gold { border-color: ${ROT}; box-shadow: 0 0 0 1px rgba(220,5,45,0.35), 0 18px 40px -24px rgba(220,5,45,0.45); }
.sbb[data-edition="stadion"] .sbb-held h1 .gold, .sbb[data-edition="stadion"] .sbb-zone .nr { background-image: none !important; color: #FFFFFF; -webkit-text-fill-color: currentColor; }
.sbb[data-edition="stadion"] .sbb-zone .nr { color: ${ROT}; }
.sbb[data-edition="stadion"] .sbb-schul h2 .gold { color: #FFFFFF; }
.sbb[data-edition="stadion"] .sbb-kachel .weiter { color: var(--st-akzent); }
.sbb[data-edition="stadion"] .sbb-kachel:not(.sbb-insel) .weiter { color: ${ROT}; }
.sbb[data-edition="stadion"] .sbb-haupt .plus,
.sbb[data-edition="stadion"] .sbb-bereich .pf, .sbb[data-edition="stadion"] .sbb-training .pfeil,
.sbb[data-edition="stadion"] .sbb-stufe .p, .sbb[data-edition="stadion"] .sbb-los.gold, .sbb[data-edition="stadion"] .sbb-zwei-schritt .nr, .sbb[data-edition="stadion"] .sbb-navi button[aria-current] {
  background: var(--st-akzent); color: var(--st-akzent-text); box-shadow: 0 8px 22px rgba(0,0,0,0.18); }
.sbb[data-edition="stadion"] .sbb-stufe.abi { background: ${BLAU}; border-color: ${BLAU}; color: #FFFFFF; box-shadow: 0 8px 22px -6px rgba(0,102,178,0.5); }
.sbb[data-edition="stadion"] .sbb-stufe.abi .p { background: #FFFFFF; color: ${BLAU}; }
.sbb[data-edition="stadion"] .sbb-stufe[aria-expanded="true"] { background: #FFFFFF; border-color: #FFFFFF; color: ${ROT}; }
.sbb[data-edition="stadion"] .sbb-stufe[aria-expanded="true"] .p { background: ${ROT}; color: #FFFFFF; }
.sbb[data-edition="stadion"] .sbb-bereich.gold .logo { box-shadow: 0 0 0 2px ${ROT}; }
.sbb[data-edition="stadion"] .sbb-kopf .strich { background: linear-gradient(90deg, ${ROT} 0%, ${ROT} 50%, ${BLAU} 50%, ${BLAU} 100%); box-shadow: none; }
.sbb[data-edition="stadion"] .sbb-streifen .sbb-kopf .strich { background: linear-gradient(90deg, ${ROT} 0%, ${ROT} 50%, #FFFFFF 50%, #FFFFFF 100%); }
.sbb[data-edition="stadion"] .sbb-held-kurve [stroke] { stroke: ${ROT}; }
.sbb[data-edition="stadion"] .sbb-held-kurve stop { stop-color: ${ROT}; }
.sbb[data-edition="stadion"] .sbb-held-kurve circle[fill]:not([fill="none"]) { fill: ${ROT}; }
.sbb[data-edition="stadion"] .sbb-licht .l1 { background: radial-gradient(circle, rgba(220,5,45,0.30) 0%, rgba(220,5,45,0) 70%); }
.sbb[data-edition="stadion"] .sbb-licht .l2, .sbb[data-edition="stadion"] .sbb-licht .l3 { background: radial-gradient(circle, rgba(0,102,178,0.35) 0%, rgba(0,102,178,0) 70%); }
.sbb[data-edition="stadion"] button:focus-visible { outline-color: ${BLAU}; }
.sbb-schalter[data-edition="stadion"] button[aria-pressed="true"] { background: ${ROT}; color: #FFFFFF; }
.sbb-schalter button.st[aria-pressed="false"] svg .rot { fill: ${ROT}; }
.sbb-schalter button.st[aria-pressed="false"] svg .blau { fill: ${BLAU}; }
/* Stadion, Stand 21.10. mittags: Bühne WEISS mit dunkelblauer Schrift und roten Zeichen (Haken, Kurve);
   der Mythen-Streifen unten ROT statt Blau („Das System“ bleibt Blau). Steht am Ende, damit es die Insel-Regeln schlägt. */
.sbb[data-edition="stadion"] .sbb-held { background: #FFFFFF; background-image: none;
  --text: ${BLAU_TIEF}; --titel: ${BLAU_TIEF}; --nebel: #46557A; --glyph: ${ROT}; --linie: rgba(0,68,122,0.14); --h1-schatten: none;
  --st-akzent: ${ROT}; --st-akzent-text: #FFFFFF; --akzent-text: #FFFFFF;
  --such-hg: #FFFFFF; --such-rand: rgba(0,68,122,0.28); --such-text: ${BLAU_TIEF}; --such-platz: #6B7A99; }
.sbb[data-edition="stadion"] .sbb-held::before { background: radial-gradient(circle, rgba(220,5,45,0.10) 0%, rgba(220,5,45,0) 70%); }
.sbb[data-edition="stadion"] .sbb-held h1 .gold { color: ${BLAU_TIEF}; }
.sbb[data-edition="stadion"] .sbb-held-suche .such-buehne-feld { box-shadow: 0 3px 16px rgba(0,68,122,0.10); }
.sbb[data-edition="stadion"] .sbb-held-suche .such-buehne-feld:focus-within { border-color: ${ROT}; box-shadow: 0 0 0 3px rgba(220,5,45,0.18); }
.sbb[data-edition="stadion"] .sbb-held-kurve .glyph { opacity: .06; }
.sbb[data-edition="stadion"] .sbb-held-kurve .kurve { animation-name: sbbVerblassenStadion; }
@keyframes sbbVerblassenStadion { to { opacity: .45; } }
.sbb[data-edition="stadion"] .sbb-mythen-streifen { background-color: ${ROT};
  background-image: radial-gradient(110% 80% at 0% 0%, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 60%), linear-gradient(155deg, ${ROT_HELL} 0%, ${ROT} 40%, ${ROT_TIEF} 100%);
  --st-akzent: #FFFFFF; --st-akzent-text: ${ROT}; --akzent-text: ${ROT}; --nebel: #FFE0E6; }
.sbb[data-edition="stadion"] .sbb-mythen-streifen .sbb-kopf .strich { background: linear-gradient(90deg, #FFFFFF 0%, #FFFFFF 50%, ${BLAU} 50%, ${BLAU} 100%); }
/* ---------- GER (Schwarz-Rot-Gold + Weiß, 21.10.) ----------
   Mix-Basis (data-modus="mix") + data-edition="ger": Bühne Weiß mit schwarzer Schrift und roter Akzentzeile,
   Haken und Kurve Gold, Laufband Schwarz; Hauptkacheln schwarzer Lack mit Gold (das Gold des Mix bleibt);
   Streifen „Das System“ Rot, Mythen Schwarz; weiße Kacheln schwarz umrandet. */
.sbb[data-edition="ger"] { --titel: ${SCHWARZ}; --glyph: ${D_ROT}; --knopf-hg: ${SCHWARZ}; --pille-hg: #FFF6CC; --pille-text: #6B5600; --mythos-hg: #FFF6CC; }
html[data-start-edition="ger"] .app-wurzel { background: #FFFFFF !important; }
.sbb[data-edition="ger"], .sbb[data-edition="ger"] .sbb-insel { --bild: linear-gradient(155deg, #2A2A2A 0%, #0A0A0A 100%); --bild-rechts: linear-gradient(155deg, #2A2A2A 0%, #0A0A0A 100%); }
.sbb[data-edition="ger"] .sbb-held { background: #FFFFFF; background-image: none;
  --text: ${SCHWARZ}; --titel: ${SCHWARZ}; --nebel: #4A4A4A; --glyph: ${D_ROT}; --linie: rgba(0,0,0,0.12); --h1-schatten: none; --akzent-text: ${SCHWARZ};
  --such-hg: #FFFFFF; --such-rand: rgba(0,0,0,0.25); --such-text: ${SCHWARZ}; --such-platz: #6B6B6B; }
.sbb[data-edition="ger"] .sbb-held::before { background: radial-gradient(circle, rgba(255,206,0,0.22) 0%, rgba(255,206,0,0) 70%); }
.sbb[data-edition="ger"] .sbb-held h1 .gold { background-image: none !important; color: ${D_ROT}; -webkit-text-fill-color: currentColor; }
.sbb[data-edition="ger"] .sbb-held-suche .such-buehne-feld { box-shadow: 0 3px 16px rgba(0,0,0,0.08); }
.sbb[data-edition="ger"] .sbb-held-suche .such-buehne-feld:focus-within { border-color: ${D_GOLD}; box-shadow: 0 0 0 3px rgba(255,206,0,0.35); }
.sbb[data-edition="ger"] .sbb-los.gold, .sbb[data-edition="ger"] .sbb-navi button[aria-current] { background: ${D_GOLD}; color: ${SCHWARZ}; }
.sbb[data-edition="ger"] .sbb-held-kurve .kurve { animation-name: sbbVerblassenGer; }
@keyframes sbbVerblassenGer { to { opacity: .7; } }
.sbb[data-edition="ger"] .sbb-held-kurve .glyph { opacity: .06; }
.sbb[data-edition="ger"] .sbb-karte.sbb-insel { background: radial-gradient(120% 90% at 0% 0%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 55%), linear-gradient(155deg, #2A2A2A 0%, #141414 45%, #000000 100%);
  border-color: rgba(255,206,0,0.28); box-shadow: 0 10px 28px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.12); }
.sbb[data-edition="ger"] .sbb-karte.sbb-insel.sbb-gold { border-color: ${D_GOLD}; box-shadow: 0 0 0 1px rgba(255,206,0,0.55), 0 14px 34px rgba(0,0,0,0.32); }
.sbb[data-edition="ger"] .sbb-streifen { background-color: ${SCHWARZ};
  background-image: radial-gradient(110% 80% at 0% 0%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 60%), linear-gradient(155deg, #1E1E1E 0%, ${SCHWARZ} 60%, #000000 100%); }
.sbb[data-edition="ger"] .sbb-streifen#system { background-color: ${D_ROT};
  background-image: radial-gradient(110% 80% at 0% 0%, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 60%), linear-gradient(155deg, #F01A1A 0%, ${D_ROT} 45%, ${D_ROT_TIEF} 100%); --nebel: #FFE0E0; }
.sbb[data-edition="ger"] .sbb-kopf .strich { background: linear-gradient(90deg, ${SCHWARZ} 0 33.3%, ${D_ROT} 33.3% 66.6%, ${D_GOLD} 66.6%); box-shadow: none; }
.sbb[data-edition="ger"] .sbb-streifen .sbb-kopf .strich { background: linear-gradient(90deg, #FFFFFF 0 33.3%, ${D_ROT} 33.3% 66.6%, ${D_GOLD} 66.6%); }
.sbb[data-edition="ger"] .sbb-streifen#system .sbb-kopf .strich { background: linear-gradient(90deg, ${SCHWARZ} 0 33.3%, #FFFFFF 33.3% 66.6%, ${D_GOLD} 66.6%); }
.sbb[data-edition="ger"] .sbb-zone .nr { background-image: none; color: ${D_ROT}; -webkit-text-fill-color: currentColor; }
.sbb[data-edition="ger"] .sbb-kachel:not(.sbb-insel) { border-color: ${SCHWARZ}; box-shadow: 0 6px 22px rgba(0,0,0,0.08); }
.sbb[data-edition="ger"] .sbb-kachel:not(.sbb-insel) .sbb-kachel-bild { border-left-color: ${SCHWARZ}; }
.sbb[data-edition="ger"] .sbb-kachel.zu:not(.sbb-insel), .sbb[data-edition="ger"] .sbb-kachel.zu:not(.sbb-insel) .sbb-kachel-bild { border-color: rgba(0,0,0,0.3); }
.sbb[data-edition="ger"] .sbb-kachel:not(.sbb-insel) .weiter { border-color: ${SCHWARZ}; background: #FFF6CC; color: ${SCHWARZ}; }
.sbb[data-edition="ger"] .sbb-kachel:not(.sbb-insel) .weiter.pille.zu { border-color: rgba(0,0,0,0.3); background: transparent; }
@media (hover:hover) { .sbb[data-edition="ger"] .sbb-kachel:not(.sbb-insel):not(:disabled):hover { border-color: ${SCHWARZ}; box-shadow: 0 0 0 1px ${SCHWARZ}, 0 16px 36px rgba(0,0,0,0.16); }
  .sbb[data-edition="ger"] .sbb-kachel:not(.sbb-insel):not(:disabled):hover .weiter { background: ${SCHWARZ}; color: ${D_GOLD}; } }
.sbb[data-edition="ger"] button:focus-visible { outline-color: ${D_ROT}; }
.sbb-schalter[data-edition="ger"] button[aria-pressed="true"] { background: ${SCHWARZ}; color: ${D_GOLD}; }
.sbb { position: relative; color: var(--text); }
.sbb *, .sbb *::before, .sbb *::after { box-sizing: border-box; }
/* Das Licht liegt hinter allem (negativer z-index: unter jedem Inhalt, über dem Seitenhintergrund).
   Das frühere Karo-Raster (Rechenpapier) ist raus: passt nicht zur Marke. */
.sbb-licht { position: fixed; inset: 0; z-index: -1; pointer-events: none; overflow: hidden; }
.sbb-licht span { position: absolute; border-radius: 999px; filter: blur(60px); opacity: var(--licht); }
.sbb-licht .l1 { width: 56vw; height: 56vw; max-width: 640px; max-height: 640px; top: -18vw; right: -14vw; background: radial-gradient(circle, rgba(237,187,0,0.45) 0%, rgba(237,187,0,0) 70%); }
.sbb-licht .l2 { width: 70vw; height: 70vw; max-width: 760px; max-height: 760px; top: 30vh; left: -30vw; background: radial-gradient(circle, rgba(0,77,152,0.55) 0%, rgba(0,77,152,0) 70%); }
.sbb-licht .l3 { width: 50vw; height: 50vw; max-width: 520px; max-height: 520px; bottom: -20vw; right: -10vw; background: radial-gradient(circle, rgba(36,87,197,0.45) 0%, rgba(36,87,197,0) 70%); }

/* ---------- Bühne oben ---------- */
.sbb-held { position: relative; overflow: hidden; padding: clamp(28px, 6vw, 56px) 0 0; }
.sbb-held-kurve { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
/* Breites Blatt (zweispaltige Bühne): Kasten mindestens 1,617 × --seite breit (940 px → 1520 px), mittig – so liegen
   Scheitel, Punkt und Zeichen relativ zu Schlagzeile und Karte immer an derselben Stelle, auch wenn die Seite ab
   ~1516 px mitwächst; der Maßstab folgt sonst nur der Höhe */
.sbb-held-kurve.breit { left: 50%; right: auto; width: max(100%, calc(var(--seite, 940px) * 1.617)); transform: translateX(-50%); }
.sbb-held-kurve.breit .weg { stroke-dasharray: 2600; stroke-dashoffset: 2600; }
.sbb-held-kurve .glyph { fill: var(--glyph); opacity: .07; }
.sbb-held-kurve .weg { stroke-dasharray: 1400; stroke-dashoffset: 1400; animation: sbbWeg 2.6s cubic-bezier(.4,0,.2,1) .2s forwards; }
.sbb-held-kurve .punkt { opacity: 0; animation: sbbPunkt .6s ease 2.4s forwards; }
/* Nach dem Einzeichnen tritt die Kurve zurück und geht ins Blatt über (Text bleibt vorne) */
.sbb-held-kurve .kurve { animation: sbbVerblassen 1.8s ease 2.9s forwards; }
.sbb[data-modus="hell"] .sbb-held-kurve .kurve { animation-name: sbbVerblassenHell; }
@keyframes sbbWeg { to { stroke-dashoffset: 0; } }
@keyframes sbbPunkt { to { opacity: 1; } }
@keyframes sbbVerblassen { to { opacity: .36; } }
@keyframes sbbVerblassenHell { to { opacity: .5; } }
.sbb-held-text { position: relative; z-index: 1; }
.sbb-held h1 { margin: 0; font-weight: 900; letter-spacing: -0.045em; line-height: .92; font-size: clamp(34px, 8.2vw, 68px); color: var(--titel); text-shadow: var(--h1-schatten); }
.sbb-held h1 .gold { display: block; background: linear-gradient(180deg, ${GOLD_HELL} 0%, ${GOLD} 55%, #C9931A 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
.sbb[data-modus="hell"] .sbb-held h1 .gold { background: linear-gradient(180deg, ${GOLD} 0%, #D9A400 60%, #B8860B 100%); -webkit-background-clip: text; background-clip: text; }
.sbb-held .unter { margin: 14px 0 0; font-weight: 300; font-size: clamp(20px, 4.6vw, 30px); line-height: 1.15; color: var(--text); }
/* Suche als Pille in der Bühne (seit 21.10. statt des Knopfs „Jetzt eine Aufgabe rechnen“ und der eigenen Suchbox darunter) */
.sbb-held-suche { margin-top: 26px; max-width: 520px; }
/* Wiederkehrer (Klasse bekannt) am Handy: kompakte Bühne ohne Haken */
.sbb-held.kompakt .sbb-held-suche { margin-top: 20px; }
/* Breite Bühne (ab 1100 px): Text links, Start-Karte rechts – so breit wie die Kopfleiste (--seite, index.css).
   Wächst die Seite (ab ~1306 px), wachsen Karte (420 → 540 px), Spaltenabstand und Schlagzeile (58 → 76 px) mit. */
.sbb-held-raster { position: relative; z-index: 1; display: grid; grid-template-columns: minmax(0, 1fr) clamp(420px, calc(var(--seite, 940px) * .4), 540px);
  column-gap: clamp(40px, calc(var(--seite, 940px) * .0425), 60px); align-items: start;
  width: 100%; max-width: var(--seite, 940px); margin: 0 auto; padding: 0 0 36px; }
.sbb-held-raster > .sbb-spalte { max-width: none; margin: 0; padding: 18px 0 0; }
.sbb-held-karte { position: relative; z-index: 2; }
.sbb-held-karte .sk { margin-top: 0; }
.sbb-held-karte [data-heute-karte] { margin-top: 0; background-color: #0A1838; }
.sbb-held-karte .sk-konto { background: rgba(5,11,31,0.72); border-color: rgba(255,255,255,0.18); color: #FFFFFF; box-shadow: none; }
.sbb-held-karte .sk-konto p { color: rgba(255,255,255,0.86); }
.sbb-held-karte .sk-konto .k.hell { color: #FFFFFF; border-color: rgba(255,255,255,0.55); }
.sbb-held.breit h1 { font-size: clamp(58px, calc(var(--seite, 940px) * .0575), 76px); }
.sbb-held.breit .unter { font-size: clamp(30px, calc(var(--seite, 940px) * .0285), 38px); }
.sbb-held.breit .sbb-held-suche { max-width: clamp(520px, calc(var(--seite, 940px) * .5), 660px); }
.sbb-held-zone { margin: 0 0 10px; display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text); }
.sbb-held-zone .nr { width: 26px; height: 26px; border-radius: 999px; display: inline-grid; place-items: center; font-size: 13px; letter-spacing: 0; color: ${NACHT}; background: ${GOLD}; }
.sbb[data-modus="hell"] .sbb-held-suche .such-buehne-feld { box-shadow: 0 3px 16px rgba(15,26,51,0.07); }
.sbb button:focus-visible { outline: 3px solid ${GOLD}; outline-offset: 3px; }


/* Goldknopf: die eine Handlung eines Blocks (Bühne: Pen & Paper; Mathilda: Blatt scannen; Vision: Die Vision lesen) */
.sbb-los { display: inline-flex; align-items: center; gap: 9px; min-height: 46px; padding: 0 20px; border-radius: 999px; border: 1.5px solid transparent; cursor: pointer; font-family: inherit; font-size: 15px; font-weight: 800; letter-spacing: -0.01em; white-space: nowrap; transition: transform .15s ease, box-shadow .15s ease; }
.sbb-los.gold { background: linear-gradient(180deg, ${GOLD_HELL} 0%, ${GOLD} 100%); color: ${NACHT}; box-shadow: 0 10px 26px -8px rgba(237,187,0,0.55), 0 1px 0 rgba(255,255,255,0.35) inset; }
.sbb-los.gold .frei { font-weight: 600; opacity: .75; }
.sbb-los.held { margin-top: 24px; }
.sbb-los.leise { background: transparent; color: var(--text); border-color: var(--linie); }
.sbb-los i { font-style: normal; display: inline-block; transition: transform .18s ease; }
@media (hover:hover) { .sbb-los:hover { transform: translateY(-2px); } .sbb-los:hover i { transform: translateX(3px); } }
.sbb-los:active { transform: scale(.98); }

/* Band unter der Kopfleiste: fünf Chips, klebt mit (top wird gemessen), aktiver Chip gold */
.sbb-navi { position: sticky; top: 56px; z-index: 30; margin: 0; padding: 8px 0; background: var(--hg); border-bottom: 1px solid var(--linie); box-shadow: 0 10px 30px -22px rgba(0,0,0,.6); }
.sbb[data-modus="mix"] .sbb-navi, .sbb[data-modus="hell"] .sbb-navi { background: rgba(255,255,255,0.92); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
.sbb[data-modus="dunkel"] .sbb-navi { background: rgba(5,11,31,0.88); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
.sbb-navi-spur { display: flex; gap: 6px; max-width: var(--seite, 940px); margin: 0 auto; padding: 0 16px; overflow-x: auto; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
.sbb-navi-spur::-webkit-scrollbar { display: none; }
.sbb-navi button { flex: none; min-height: 32px; padding: 0 13px; border-radius: 999px; border: 1px solid var(--linie); background: transparent; color: var(--text); font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer; white-space: nowrap; transition: background .15s ease, color .15s ease; }
.sbb-navi button[aria-current] { background: ${GOLD}; border-color: ${GOLD}; color: ${NACHT}; }
@media (hover:hover) { .sbb-navi button:not([aria-current]):hover { border-color: rgba(237,187,0,0.6); } }
@media ${DESKTOP} { .sbb-navi-spur { justify-content: center; gap: 8px; } .sbb-navi button { padding: 0 18px; font-size: 13.5px; } }

/* Block Mathilda: eine Karte (Text links, Porträt rechts unten angeschnitten), darunter der Zweischritt */
.sbb-ma-karte { display: flex; flex-direction: row; align-items: stretch; overflow: hidden; }
.sbb-ma-text { flex: 1 1 auto; min-width: 0; padding: 20px 8px 20px 20px; display: flex; flex-direction: column; gap: 10px; }
.sbb-ma-text h2 { margin: 0; font-size: clamp(26px, 7vw, 34px); font-weight: 800; letter-spacing: -0.035em; line-height: 1; color: var(--titel); }
.sbb-ma-text p { margin: 0; font-size: 14px; line-height: 1.5; color: var(--nebel); max-width: 42ch; }
.sbb-ma-text .sbb-los { align-self: flex-start; margin-top: 4px; }
.sbb-ma-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 2px; }
.sbb-ma-chips button { min-height: 30px; padding: 0 12px; border-radius: 999px; border: 1px solid var(--linie); background: rgba(255,255,255,0.06); color: var(--text); font-family: inherit; font-size: 12.5px; font-weight: 700; cursor: pointer; }
@media (hover:hover) { .sbb-ma-chips button:hover { border-color: rgba(237,187,0,0.6); } }
.sbb-ma-bild { position: relative; flex: none; width: 118px; overflow: hidden; }
.sbb-ma-bild > svg { position: absolute; left: 50%; transform: translateX(-50%); bottom: -14px; width: 132px; height: auto; filter: drop-shadow(0 10px 24px rgba(0,0,0,.4)); }
@media ${DESKTOP} { .sbb-ma-text { padding: 26px 16px 26px 26px; } .sbb-ma-bild { width: 190px; } .sbb-ma-bild > svg { width: 196px; bottom: -22px; } }
.sbb-zwei { position: relative; margin-top: 12px; display: grid; grid-template-columns: minmax(0, 1fr); gap: 10px; }
@media ${DESKTOP} { .sbb-zwei { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 16px; } }
.sbb-zwei-schritt { display: flex; align-items: center; gap: 12px; padding: 12px 14px; cursor: pointer; font-family: inherit; text-align: left; transition: border-color .18s ease, transform .18s ease; }
@media (hover:hover) { .sbb-zwei-schritt:hover { border-color: rgba(237,187,0,0.55); transform: translateY(-2px); } }
.sbb-zwei-schritt .nr { flex: none; width: 30px; height: 30px; border-radius: 999px; background: ${GOLD}; color: ${NACHT}; font-size: 14px; font-weight: 900; display: inline-flex; align-items: center; justify-content: center; }
.sbb-zwei-schritt .t { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.sbb-zwei-schritt .t b { font-size: 16px; font-weight: 800; letter-spacing: -0.02em; color: var(--titel); }
.sbb-zwei-schritt .t span { font-size: 12.5px; color: var(--nebel); line-height: 1.35; }
.sbb-zwei-schritt .bild { flex: none; width: 56px; height: 44px; display: flex; align-items: center; justify-content: center; }
.sbb-zwei-schritt .bild > svg { height: 100%; width: auto; }
.sbb-zwei-pfeil { display: none; }
@media ${DESKTOP} { .sbb-zwei-pfeil { display: flex; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); z-index: 2; width: 30px; height: 30px; border-radius: 999px; background: ${GOLD}; color: ${NACHT}; align-items: center; justify-content: center; font-weight: 900; box-shadow: 0 0 0 5px var(--hg); } }

/* Block Kurse: kompakte Lack-Karten in zwei Spalten (ab 840 px drei), dieselben Farben und Zeichen wie im ☰ (KURS_STIL) */
.sbb-kursraster { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 10px; }
@media ${DESKTOP} { .sbb-kursraster { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; } }
.sbb-kk { position: relative; display: flex; flex-direction: column; justify-content: space-between; gap: 12px; min-height: 124px; padding: 13px 13px 12px; border-radius: 18px; border: none; cursor: pointer; text-align: left; font-family: inherit; overflow: hidden;
  box-shadow: 0 10px 22px -12px rgba(8,26,72,0.55), inset 0 1px 0 rgba(255,255,255,0.22), inset 0 0 0 1px rgba(255,255,255,0.06); transition: transform .15s ease, box-shadow .15s ease; }
@media (hover:hover) { .sbb-kk:hover { transform: translateY(-2px); } }
.sbb-kk:active { transform: scale(.985); }
.sbb-kk .z { font-size: 24px; font-weight: 800; letter-spacing: -0.03em; line-height: 1; }
.sbb-kk .t { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.sbb-kk .t b { font-size: 14.5px; font-weight: 800; line-height: 1.2; letter-spacing: -0.01em; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; hyphens: auto; }
.sbb-kk .t > span { font-size: 11.5px; font-weight: 500; line-height: 1.3; opacity: .85; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.sbb-kk .balken { display: block; height: 3px; border-radius: 2px; background: rgba(255,255,255,0.22); overflow: hidden; }
.sbb-kk .balken i { display: block; height: 100%; border-radius: 2px; background: ${GOLD}; }
.sbb-kk:focus-visible { outline: 3px solid ${GOLD}; outline-offset: 3px; }
@media ${DESKTOP} { .sbb-kk { min-height: 140px; padding: 16px; } .sbb-kk .z { font-size: 28px; } .sbb-kk .t b { font-size: 16px; } .sbb-kk .t > span { font-size: 12.5px; } }
.sbb-mehr { margin-top: 14px; display: flex; justify-content: center; }
.sbb-mehr button { display: inline-flex; align-items: center; gap: 8px; min-height: 40px; padding: 0 18px; border-radius: 999px; border: 1.5px solid var(--linie); background: transparent; color: var(--titel); font-family: inherit; font-size: 14px; font-weight: 800; cursor: pointer; }
.sbb-mehr button i { font-style: normal; }
@media (hover:hover) { .sbb-mehr button:hover { border-color: rgba(237,187,0,0.6); } }
.sbb[data-modus="mix"] .sbb-mehr button, .sbb[data-modus="hell"] .sbb-mehr button { border-color: ${C.see}; color: ${C.seeTief}; }

/* Blog-Anriss (neuester Beitrag) */
.sbb-blog { display: flex; flex-direction: column; gap: 6px; margin-top: 14px; padding: 16px 18px; cursor: pointer; font-family: inherit; text-align: left; transition: border-color .18s ease, transform .18s ease; }
@media (hover:hover) { .sbb-blog:hover { border-color: rgba(237,187,0,0.55); transform: translateY(-2px); } }
.sbb-blog .kicker { font-size: 11px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: ${GOLD}; }
.sbb[data-modus="hell"] .sbb-blog .kicker, .sbb[data-modus="mix"] .sbb-blog .kicker { color: ${C.gruenDunkel}; }
.sbb-blog b { font-size: 18px; font-weight: 800; letter-spacing: -0.025em; line-height: 1.2; color: var(--titel); }
.sbb-blog .kurz { font-size: 13.5px; line-height: 1.45; color: var(--nebel); }
.sbb-blog .weiter { margin-top: 4px; font-size: 13px; font-weight: 700; color: ${GOLD}; display: inline-flex; gap: 8px; }
.sbb[data-modus="hell"] .sbb-blog .weiter, .sbb[data-modus="mix"] .sbb-blog .weiter { color: ${C.gruenDunkel}; }
.sbb-blog .weiter i { font-style: normal; }
.sbb[data-modus="mix"] .sbb-blog { border: 1.5px solid ${C.see}; }

/* Vision-Anriss: zwei Knöpfe */
.sbb-vision-knoepfe { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 6px; }

/* ---------- Spalte ---------- */
/* Lesespalte 783 px (Handy/Tablet). In der breiten Bühne (ab 1100 px) so breit wie Kopfleiste und Bühne (--seite):
   Karten, Navigator und Kursraster stehen dann auf derselben linken Kante wie Wortmarke und Schlagzeile, statt als
   schmalerer, eingerückter Streifen darunter (Fließtexte behalten ihre Lesebreite über eigene max-width). */
.sbb-spalte { width: 100%; max-width: 783px; margin: 0 auto; padding: 0 20px; }
@media (min-width: 1100px) { .sbb-spalte { max-width: calc(var(--seite, 940px) + 40px); } }
.sbb-teil.ende .sbb-spalte { padding-bottom: 70px; }
.sbb-abschnitt { margin-top: 28px; }

/* Zonen: Heute · Lernen · Entdecken – ein Weg in drei Etappen, daher die großen Ziffern */
.sbb-zone { margin: 44px 0 14px; display: flex; align-items: flex-end; gap: 14px; }
.sbb-zone .nr { font-size: 60px; font-weight: 900; line-height: .8; letter-spacing: -0.04em; background: linear-gradient(180deg, ${GOLD_HELL} 0%, ${GOLD} 60%, #C9931A 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
.sbb-zone h2 { margin: 0; font-size: clamp(26px, 6.4vw, 34px); font-weight: 800; letter-spacing: -0.03em; line-height: .78; color: var(--titel); }
.sbb-zone p { margin: 2px 0 0; font-size: 14px; color: var(--nebel); line-height: 1.4; text-wrap: pretty; }
@media (max-width: 340px) { .sbb-zone h2 { font-size: 22px; } }

/* Kachel (dunkel: Glas, hell: weiß mit Rand): Text links, rechts eine schmale Bildspalte über die ganze Höhe */
.sbb-karte { position: relative; width: 100%; border-radius: 22px; border: 1px solid var(--linie); background: var(--karte); box-shadow: var(--karte-schatten); color: var(--text); }
.sbb-kachel { display: flex; flex-direction: row; align-items: stretch; padding: 0; overflow: hidden; cursor: pointer; font-family: inherit; text-align: left; transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease; }
@media (hover:hover) { .sbb-kachel:not(:disabled):hover { transform: translateY(-3px); border-color: rgba(237,187,0,0.55); box-shadow: 0 0 0 1px rgba(237,187,0,0.35), 0 30px 60px -30px rgba(237,187,0,0.35), var(--karte-schatten); } }
.sbb-kachel:not(:disabled):active { transform: scale(.985); }
.sbb-kachel-bild { position: relative; flex: none; width: 112px; display: flex; align-items: center; justify-content: center; padding: 12px 8px; background: var(--bild-rechts); border-left: 1px solid var(--linie); }
.sbb-kachel-bild > svg, .sbb-kachel-bild > span, .sbb-kachel-bild > div { max-height: 100%; max-width: 100%; }
.sbb-kachel-text { flex: 1 1 auto; min-width: 0; padding: 14px 10px 14px 16px; display: flex; flex-direction: column; justify-content: flex-start; gap: 6px; }
.sbb-kachel h2, .sbb-kachel h3 { margin: 0; font-size: 21px; font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; color: var(--titel); overflow-wrap: anywhere; hyphens: auto; }
.sbb-kachel p { margin: 0; font-size: 13.5px; font-weight: 400; line-height: 1.45; color: var(--nebel); overflow-wrap: anywhere; hyphens: auto; }
/* Lernen-Kacheln: Überschrift, genau drei Zeilen Text, darunter der Knopf als Pille */
.sbb-kachel p.drei { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; height: calc(3 * 1.45em); }
.sbb-kachel p.drei.zwei { -webkit-line-clamp: 2; height: calc(2 * 1.45em); }
.sbb-kachel .weiter { margin-top: 2px; padding-top: 6px; font-size: 13px; font-weight: 700; color: ${GOLD}; display: inline-flex; align-items: center; gap: 8px; }
.sbb-kachel .weiter.pille { align-self: flex-start; margin-top: 0; padding: 6px 14px; border-radius: 999px; border: 1.5px solid currentColor; background: rgba(237,187,0,0.08); line-height: 1.2; }
.sbb-kachel .weiter.pille.zu { color: var(--zu-titel); background: transparent; border-style: dashed; }
.sbb[data-modus="hell"] .sbb-kachel .weiter { color: ${C.gruenDunkel}; }
.sbb-kachel .weiter i { font-style: normal; display: inline-block; transition: transform .18s ease; }
@media (hover:hover) { .sbb-kachel:hover .weiter i { transform: translateX(4px); } }
.sbb-kachel.zu { cursor: not-allowed; }
.sbb-logo { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
.sbb-kachel.zu .sbb-logo { filter: grayscale(1); opacity: .32; }
.sbb-kachel.zu h2, .sbb-kachel.zu h3 { color: var(--zu-titel); }
.sbb-schloss { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
.sbb-gold { border-color: rgba(237,187,0,0.75); box-shadow: 0 0 0 1px rgba(237,187,0,0.45), 0 30px 60px -30px rgba(237,187,0,0.45); }
.sbb-raster2 { display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; }
.sbb-raster2 > * { min-width: 0; }
@media ${DESKTOP} { .sbb-raster2 { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 18px; } .sbb-breit { grid-column: 1 / -1; } }

/* Mathilda-Porträt (vereinfachtes Schablonen-Gesicht): keine Trennlinie, Haaroberkante bündig mit dem Titel, unten angeschnitten */
.sbb-mathilda-bild { border-left: none; padding: 0; overflow: hidden; display: block; }
.sbb-mathilda-bild > svg { position: absolute; left: 50%; transform: translateX(-50%); top: -8px; width: 124px; height: auto; max-width: none; max-height: none; filter: drop-shadow(0 10px 24px rgba(0,0,0,.4)); }
@media ${DESKTOP} { .sbb-mathilda-bild > svg { width: 136px; top: -10px; } }

/* „Der Weg zum Abi“ (Schulmathematik): oben Titel + zwei Zeilen Text, rechts daneben die Grafik klein;
   darunter die vier Stufen-Knöpfe über die volle Breite (Handy 2 × 2, ab 840 px in einer Reihe) – Name groß, Klassen klein, Plus rechts */
.sbb-schul { padding: 18px 16px 16px; background-image: radial-gradient(120% 90% at 100% 0%, rgba(237,187,0,0.10) 0%, rgba(237,187,0,0) 55%); }
.sbb-schul-kopf { display: grid; grid-template-columns: minmax(0, 1fr) auto; grid-template-areas: "titel bild" "text text"; column-gap: 14px; row-gap: 8px; align-items: center; }
.sbb-schul h2 { grid-area: titel; margin: 0; font-size: clamp(27px, 8vw, 40px); font-weight: 900; letter-spacing: -0.04em; line-height: 1; color: var(--titel); }
.sbb-schul h2 .gold { color: ${GOLD}; }
.sbb[data-modus="hell"] .sbb-schul h2 .gold { color: #B07F00; }
.sbb-schul-kopf p { grid-area: text; margin: 0; font-size: 14px; line-height: 1.5; color: var(--nebel); text-wrap: pretty; }
.sbb-schul-bild { grid-area: bild; flex: none; width: 76px; height: 62px; border-radius: 12px; background: var(--bild-rechts); display: flex; align-items: center; justify-content: center; padding: 3px; overflow: hidden; }
.sbb-schul-bild > svg { width: 100%; height: 100%; }
.sbb-stufen { margin-top: 16px; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 8px; }
.sbb-stufe { min-width: 0; min-height: 60px; display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 10px 10px 10px 14px; border-radius: 14px;
  border: 1px solid var(--stufe-rand); background: var(--stufe-hg); cursor: pointer; font-family: inherit; text-align: left; color: var(--titel);
  transition: background .15s ease, border-color .15s ease, box-shadow .15s ease, transform .15s ease; }
.sbb-stufe .t { min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.sbb-stufe .n { display: block; font-size: clamp(14.5px, 4vw, 16px); font-weight: 800; letter-spacing: -0.02em; line-height: 1.1; white-space: nowrap; }
.sbb-stufe .k { display: block; font-size: 12px; font-weight: 600; line-height: 1.2; color: var(--stufe-zeile); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sbb-stufe .p { flex: none; width: 24px; height: 24px; border-radius: 999px; background: ${GOLD}; color: ${NACHT}; display: flex; align-items: center; justify-content: center; transition: transform .2s ease; }
.sbb-stufe .p svg { width: 12px; height: 12px; }
.sbb-stufe.abi { background: linear-gradient(135deg, #F6D24A 0%, ${GOLD} 55%, #D9A300 100%); border-color: ${GOLD}; color: ${NACHT}; box-shadow: 0 8px 22px -6px rgba(237,187,0,0.5); }
.sbb-stufe.abi .n { font-weight: 900; color: ${NACHT}; }
.sbb-stufe.abi .k { color: rgba(10,22,58,0.72); }
.sbb-stufe.abi .p { background: ${NACHT}; color: ${GOLD}; }
.sbb-stufe[aria-expanded="true"] { background: ${GOLD}; border-color: ${GOLD}; color: ${NACHT}; }
.sbb-stufe[aria-expanded="true"] .n { color: ${NACHT}; }
.sbb-stufe[aria-expanded="true"] .k { color: rgba(10,22,58,0.72); }
.sbb-stufe[aria-expanded="true"] .p { background: ${NACHT}; color: ${GOLD}; transform: rotate(45deg); }
.sbb-stufe.abi[aria-expanded="true"] { box-shadow: 0 0 0 2px var(--titel); }
@media (hover:hover) { .sbb-stufe:not([aria-expanded="true"]):not(.abi):hover { border-color: rgba(237,187,0,0.6); transform: translateY(-1px); } .sbb-stufe.abi:hover { filter: brightness(1.06); transform: translateY(-1px); } }
@media ${DESKTOP} {
  .sbb-schul { padding: 24px 24px 22px; }
  .sbb-schul-kopf { grid-template-areas: "titel bild" "text bild"; column-gap: 24px; row-gap: 10px; }
  .sbb-schul-kopf p { font-size: 15px; max-width: 46ch; }
  .sbb-schul-bild { width: 132px; height: 104px; border-radius: 16px; }
  .sbb-stufen { margin-top: 20px; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
  .sbb-stufe { min-height: 68px; padding: 12px 12px 12px 18px; }
  .sbb-stufe .n { font-size: 17px; }
  .sbb-stufe .k { font-size: 12.5px; }
}
.sbb-schul-panel-kopf { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; padding: 2px 4px 0; }
.sbb-schul-panel-kopf b { font-size: 16px; font-weight: 800; letter-spacing: -0.02em; color: ${C.seeTief}; }
.sbb-schul-panel-kopf span { font-size: 12px; font-weight: 600; color: ${C.grau}; }

/* Hauptkacheln mit Aufklappen (Schulmathematik, Mathe entdecken): Text links, rechts eine Spalte mit dem Bild und
   darunter dem Plus – auf allen Breiten gleich, ab 840 px nur breiter */
.sbb-haupt { position: relative; display: flex; flex-direction: row; align-items: stretch; gap: 0; width: 100%; padding: 0; cursor: pointer; font-family: inherit; text-align: left; overflow: hidden; transition: border-color .18s ease, box-shadow .18s ease; }
.sbb-haupt .bild { flex: none; display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 10px; padding: 10px 12px 10px 8px; background: var(--bild-rechts); }
.sbb-haupt .bild .logo { flex: none; width: 70px; height: 64px; display: flex; align-items: center; justify-content: center; }
.sbb-haupt .bild .logo > svg { width: 100%; height: 100%; max-height: 100%; }
.sbb-haupt .txt { flex: 1 1 auto; min-width: 0; padding: 12px 10px 12px 16px; display: flex; flex-direction: column; justify-content: center; gap: 5px; }
.sbb-haupt h2 { margin: 0; font-size: clamp(18px, 5.2vw, 28px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.05; color: var(--titel); overflow-wrap: anywhere; hyphens: auto; }
.sbb-haupt p { margin: 0; font-size: 13.5px; line-height: 1.45; color: var(--nebel); overflow-wrap: anywhere; hyphens: auto; }
.sbb-haupt .plus { flex: none; width: 42px; height: 42px; border-radius: 999px; background: ${GOLD}; color: var(--akzent-text); display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 22px rgba(237,187,0,0.4); transition: transform .22s ease; }
@media ${DESKTOP} {
  .sbb-haupt .bild { gap: 14px; padding: 12px 20px 12px 12px; }
  .sbb-haupt .bild .logo { width: 96px; height: 72px; }
  .sbb-haupt .txt { padding: 14px 20px 14px 22px; }
  .sbb-kachel-bild { width: 124px; }
}
.sbb-haupt[aria-expanded="true"] .plus { transform: rotate(45deg); }
.sbb-haupt[aria-expanded="true"] { border-color: rgba(237,187,0,0.6); }
@media (hover:hover) { .sbb-haupt:hover { border-color: rgba(237,187,0,0.55); } }

/* Weißes Blatt für alles, was selbst ein Werkzeug ist */
.sbb-papier { margin-top: 10px; border-radius: 20px; background: ${C.weiss}; color: ${C.tinte}; padding: 14px 16px 16px; box-shadow: var(--papier-schatten); }
.sbb-papier.eng { padding: 0; overflow: hidden; }
.sbb-papier [data-such-box] { margin: 0 !important; box-shadow: none !important; border: none !important; }
/* Wiederverwendete Kacheln (Kurse, Plan, Spenden …) laufen in ihrer eigenen Datei um 16 px über den Rand; hier füllen sie genau die Spalte */
.sbb-wieder > [style*="calc(100% + 32px)"], .sbb-wieder > div > [style*="calc(100% + 32px)"] { width: 100% !important; margin-left: 0 !important; margin-right: 0 !important; }
.sbb-wieder > * { margin-top: 14px !important; }
@media (max-width: 839px) {
  .sbb-kurse-leiste { display: flex; gap: 12px; overflow-x: auto; scroll-snap-type: x mandatory; padding: 4px 16px 14px; margin: 0 -16px; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
  .sbb-kurse-leiste::-webkit-scrollbar { display: none; }
  .sbb-kurse-leiste > * { flex: 0 0 min(82vw, 320px); scroll-snap-align: start; margin-top: 0 !important; }
}

/* Bereiche der Schulmathematik auf dem Blatt */
.sbb-bereich { width: 100%; display: flex; align-items: center; gap: 12px; padding: 10px 10px 10px 8px; border: none; border-radius: 14px; background: transparent; cursor: pointer; font-family: inherit; text-align: left; color: ${C.tinte}; transition: background .15s ease; }
@media (hover:hover) { .sbb-bereich:not([aria-expanded="true"]):hover { background: ${C.sand}; } }
.sbb-bereich[aria-expanded="true"] { background: ${C.himmel}; }
.sbb-bereich .logo { flex: none; width: 64px; height: 50px; border-radius: 12px; overflow: hidden; background: linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%); display: flex; align-items: center; justify-content: center; padding: 4px; }
.sbb-bereich.gold .logo { box-shadow: 0 0 0 2px ${GOLD}; }
.sbb-bereich .t { flex: 1 1 auto; min-width: 0; }
.sbb-bereich .t .vor { display: block; font-size: 10.5px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: ${C.gruenDunkel}; line-height: 1.2; margin-bottom: 3px; }
.sbb-bereich .t b { display: block; font-size: 15.5px; font-weight: 800; letter-spacing: -0.02em; color: ${C.seeTief}; line-height: 1.15; overflow-wrap: normal; word-break: normal; -webkit-hyphens: manual; hyphens: manual; }
.sbb-bereich .t > span:not(.vor) { display: block; font-size: 12.5px; color: ${C.grau}; line-height: 1.35; margin-top: 2px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.sbb-bereich .pf { flex: none; width: 30px; height: 30px; border-radius: 999px; background: ${GOLD}; display: flex; align-items: center; justify-content: center; transition: transform .2s ease; }
.sbb-bereich[aria-expanded="true"] .pf { transform: rotate(45deg); }
.sbb-bereich-inhalt { padding: 2px 4px 8px; border-bottom: 1px solid ${C.linie}; margin-bottom: 6px; }
/* Zusammenfassung je Bereich (bereichInhalt aus func2.jsx): kurz am Handy, lang ab 840 px */
.sbb .bereich-lang { display: none; }
@media ${DESKTOP} { .sbb .bereich-kurz { display: none; } .sbb .bereich-lang { display: inline; } }

/* Abschnittsköpfe */
.sbb-kopf { margin-top: 48px; }
.sbb-kopf h2 { margin: 0; font-size: clamp(26px, 6.8vw, 40px); font-weight: 800; letter-spacing: -0.035em; line-height: 1.05; color: var(--titel); max-width: 680px; }
.sbb-kopf .strich { display: block; width: 72px; height: 4px; border-radius: 2px; margin: 16px 0 18px; background: linear-gradient(90deg, ${GOLD_HELL}, ${GOLD}); box-shadow: 0 0 18px rgba(237,187,0,0.5); }
.sbb-text { margin: 0 0 12px; font-size: 15.5px; font-weight: 300; line-height: 1.7; color: var(--nebel); max-width: 660px; }
.sbb-text b { color: var(--titel); font-weight: 600; }
.sbb-text.stark { color: var(--text); font-weight: 500; }

/* Dein Training */
.sbb-training { position: relative; }
.sbb-training .kopfzeile { width: 100%; display: flex; align-items: center; gap: 14px; padding: 18px 70px 18px 20px; cursor: pointer; background: transparent; border: none; font-family: inherit; text-align: left; }
.sbb-training h2 { margin: 0; font-size: clamp(22px, 6vw, 30px); font-weight: 800; letter-spacing: -0.035em; line-height: 1.05; color: var(--titel); }
.sbb-training .zeile { margin: 6px 0 0; font-size: 13.5px; color: var(--nebel); }
.sbb-training .pfeil { position: absolute; top: 16px; right: 16px; width: 40px; height: 40px; border-radius: 999px; border: none; cursor: pointer; background: ${GOLD}; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 22px rgba(237,187,0,0.4); }
.sbb-training .pfeil svg { transition: transform .22s ease; }
.sbb-training.auf .pfeil svg { transform: rotate(180deg); }
.sbb-training .sbb-papier.offen { margin: 0; border-radius: 21px; padding: 0; overflow: hidden; }
.sbb-training.auf .qf-kopf { padding-right: 60px; }
.sbb-training.auf .pfeil { top: 14px; right: 14px; box-shadow: 0 4px 14px rgba(14,30,74,0.25); }

/* Umschalter Dunkel / Hell (unten links, wie die Sprachwahl im Arbeitsmenü) */
.sbb-schalter { position: fixed; left: 14px; bottom: 14px; z-index: 40; display: inline-flex; align-items: center; gap: 2px; padding: 3px; border-radius: 999px; background: var(--schalter-hg); border: 1px solid var(--schalter-rand); box-shadow: 0 10px 30px rgba(0,0,0,.25); backdrop-filter: blur(8px); font-family: Montserrat, system-ui, sans-serif; }
.sbb-schalter button { height: 30px; padding: 0 9px; border-radius: 999px; border: none; cursor: pointer; font-family: inherit; font-size: 12.5px; font-weight: 800; color: var(--nebel); background: transparent; display: inline-flex; align-items: center; gap: 6px; }
.sbb-schalter button[aria-pressed="true"] { background: ${GOLD}; color: ${NACHT}; }
.sbb-schalter button:focus-visible { outline: 3px solid ${GOLD}; outline-offset: 2px; }
/* Bis 1449 px (21.10.): die Pille schwebt nicht mehr über dem Inhalt (Handy und Laptop), sondern steht am Ende der Startseite */
@media (max-width: 1449px) {
  .sbb-schalter { position: static; display: flex; width: max-content; max-width: calc(100vw - 24px); margin: 6px auto 22px; box-shadow: none; backdrop-filter: none; }
  .sbb-schalter button { padding: 0 8px; }
}

@media (prefers-reduced-motion: reduce) {
  .sbb-held-kurve .weg { animation: none; stroke-dashoffset: 0; }
  .sbb-held-kurve .punkt { animation: none; opacity: 1; }
  .sbb-held-kurve .kurve { animation: none; opacity: .36; }
  .sbb[data-modus="hell"] .sbb-held-kurve .kurve { opacity: .5; }
  .sbb[data-modus="mix"] .sbb-held-kurve .kurve { opacity: .62; }
  .sbb-kachel { transition: none; }
}
`;

/* ---------- kleine Bausteine ---------- */

function Plus() {
  return <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M9 2.5v13M2.5 9h13" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" /></svg>;
}

function PlusKlein({ farbe = C.seeTief }) {
  return <svg width="13" height="13" viewBox="0 0 18 18" aria-hidden="true"><path d="M9 2.5v13M2.5 9h13" stroke={farbe} strokeWidth="3" strokeLinecap="round" /></svg>;
}

/* Die Kurve über der Bühne: ein Funktionsgraph, der sich einmal über das Blatt zeichnet, dazu ein Punkt mit Tangente.
   Handy/Tablet: Blatt 760 × 460, füllt die Bühne („slice“). Breite Bühne (ab 1100 px, zweispaltig): eigenes Blatt
   1520 × 460 in einem Kasten von mindestens 1520 px Breite, mittig – so hängt der Maßstab nur noch von der Höhe der
   Bühne ab (≈ 1,2) und nicht von der Bildschirmbreite. Vorher wurde das Handy-Blatt auf 1920 px um das 2,5-Fache
   vergrößert: Σ so groß wie die Heute-Karte, die Kurve als dicker Balken quer durch die Karte.
   Auf dem breiten Blatt bogt die Kurve über die Schlagzeile (Scheitel bei 600|40, über „Mathe kann“), läuft hinter der
   Karte durch und hat Punkt und Tangente rechts neben der Karte (Karte endet bei Blattmitte + 470 = x 1230, in jeder
   Seitenbreite, weil der Kasten mit --seite skaliert; Punkt bei 1300|296); die Zeichen stehen links der Schlagzeile
   und rechts der Karte, nie im Text. */
export function HeldKurve({ breit }) {
  if (breit) {
    return (
      <svg className="sbb-held-kurve breit" viewBox="0 0 1520 460" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="sbbGoldB" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor={GOLD} stopOpacity="0.25" /><stop offset="0.55" stopColor={GOLD} /><stop offset="1" stopColor={GOLD_HELL} />
          </linearGradient>
          <filter id="sbbGlowB" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6" /></filter>
        </defs>
        <g fontFamily="Montserrat, system-ui, sans-serif" fontWeight="700">
          <text x="1290" y="118" fontSize="56" className="glyph schweben">∫</text>
          <text x="1270" y="210" fontSize="26" className="glyph">f′(x)</text>
          <text x="1330" y="372" fontSize="46" className="glyph pulsieren">∑</text>
          <text x="1440" y="440" fontSize="30" className="glyph">√</text>
          <text x="150" y="400" fontSize="34" className="glyph">π</text>
          <text x="110" y="250" fontSize="22" className="glyph">lim</text>
        </g>
        <g className="kurve">
        <path className="weg" d="M -60 420 C 150 420, 300 20, 600 40 C 860 58, 1000 330, 1300 296 C 1420 282, 1480 140, 1600 50" fill="none" stroke={GOLD} strokeWidth="14" opacity="0.22" filter="url(#sbbGlowB)" strokeLinecap="round" />
        <path className="weg" d="M -60 420 C 150 420, 300 20, 600 40 C 860 58, 1000 330, 1300 296 C 1420 282, 1480 140, 1600 50" fill="none" stroke="url(#sbbGoldB)" strokeWidth="3.5" strokeLinecap="round" />
        <g className="punkt">
          <line x1="1180" y1="310" x2="1420" y2="283" stroke="#fff" strokeWidth="1.4" opacity="0.55" strokeDasharray="5 4" />
          <circle cx="1300" cy="296" r="7" fill={GOLD_HELL} />
          <circle cx="1300" cy="296" r="14" fill="none" stroke={GOLD} strokeWidth="1.2" opacity="0.6" className="pulsieren" />
        </g>
        </g>
      </svg>
    );
  }
  return (
    <svg className="sbb-held-kurve" viewBox="0 0 760 460" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="sbbGold" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={GOLD} stopOpacity="0.25" /><stop offset="0.55" stopColor={GOLD} /><stop offset="1" stopColor={GOLD_HELL} />
        </linearGradient>
        <filter id="sbbGlow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6" /></filter>
      </defs>
      {/* Glyphen auf dem Blatt */}
      <g fontFamily="Montserrat, system-ui, sans-serif" fontWeight="700">
        <text x="560" y="86" fontSize="56" className="glyph schweben">∫</text>
        <text x="650" y="300" fontSize="46" className="glyph pulsieren">∑</text>
        <text x="470" y="420" fontSize="34" className="glyph">π</text>
        <text x="600" y="190" fontSize="26" className="glyph">f′(x)</text>
        <text x="700" y="420" fontSize="30" className="glyph">√</text>
        <text x="520" y="250" fontSize="22" className="glyph">lim</text>
      </g>
      {/* Leuchtspur der Kurve, darüber die Kurve selbst – als Gruppe, damit sie nach dem Einzeichnen gemeinsam zurücktritt */}
      <g className="kurve">
      <path className="weg" d="M -20 400 C 120 400, 200 120, 330 160 C 440 195, 470 330, 560 300 C 650 270, 690 120, 800 60" fill="none" stroke={GOLD} strokeWidth="14" opacity="0.22" filter="url(#sbbGlow)" strokeLinecap="round" />
      <path className="weg" d="M -20 400 C 120 400, 200 120, 330 160 C 440 195, 470 330, 560 300 C 650 270, 690 120, 800 60" fill="none" stroke="url(#sbbGold)" strokeWidth="3.5" strokeLinecap="round" />
      <g className="punkt">
        <line x1="500" y1="334" x2="620" y2="276" stroke="#fff" strokeWidth="1.4" opacity="0.55" strokeDasharray="5 4" />
        <circle cx="560" cy="300" r="7" fill={GOLD_HELL} />
        <circle cx="560" cy="300" r="14" fill="none" stroke={GOLD} strokeWidth="1.2" opacity="0.6" className="pulsieren" />
      </g>
      </g>
    </svg>
  );
}

/* ---------- Band unter der Kopfleiste: ein Chip je Block (Heute · Lernen · Mathilda · Kurse · Entdecken) ----------
   Klebt unter der Kopfleiste (deren Höhe wird gemessen, weil sie sich beim Scrollen zusammenzieht) und markiert den
   Block, der gerade im Bild ist. Ersetzt das frühere Laufband, das aussah wie Navigation, aber keine war. */
/* Zum Abschnitt springen: Ziel 12 px unter dem Band. Die Kopfleiste zieht sich beim Scrollen auf 56 px zusammen (funcKopfleiste.jsx),
   also wird mit 56 gerechnet und nach dem weichen Scrollen einmal nachjustiert (gleicher Schlüssel, gleicher Sprung). */
const KOPF_KOMPAKT = 56;
function zumAnker(id, band) {
  const el = document.getElementById(id);
  if (!el) return;
  const bandH = band ? band.getBoundingClientRect().height : 0;
  const ziel = () => Math.max(0, el.getBoundingClientRect().top + window.scrollY - KOPF_KOMPAKT - bandH - 12);
  springe("start-anker", () => window.scrollTo({ top: ziel(), behavior: "smooth" }));
  setTimeout(() => springe("start-anker", () => { if (Math.abs(window.scrollY - ziel()) > 4) window.scrollTo({ top: ziel(), behavior: "auto" }); }), 900);
}

function StartBand({ oben = false }) {
  const [aktiv, setAktiv] = useState(START_ANKER[0].id);
  const navi = useRef(null);
  const en = englisch();
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    let tick = false;
    const lauf = () => {
      tick = false;
      const kopf = document.querySelector(".kl[data-klebrig]");
      const h = kopf ? Math.round(kopf.getBoundingClientRect().height) : 0;
      if (navi.current) navi.current.style.top = `${h}px`;
      const grenze = h + 70;
      let akt = START_ANKER[0].id;
      for (const a of START_ANKER) {
        const el = document.getElementById(a.id);
        if (el && el.getBoundingClientRect().top <= grenze) akt = a.id;
      }
      setAktiv(akt);
    };
    const h = () => { if (!tick) { tick = true; window.requestAnimationFrame(lauf); } };
    lauf();
    window.addEventListener("scroll", h, { passive: true });
    window.addEventListener("resize", h);
    return () => { window.removeEventListener("scroll", h); window.removeEventListener("resize", h); };
  }, []);
  return (
    <nav ref={navi} className={oben ? "sbb-navi oben" : "sbb-navi"} aria-label="Abschnitte der Startseite" data-start-band>
      <div className="sbb-navi-spur">
        {START_ANKER.map((a) => (
          <button type="button" key={a.id} data-start-chip={a.id} aria-current={aktiv === a.id ? "true" : undefined}
            onClick={() => zumAnker(a.id, navi.current)}>{en ? a.en : a.name}</button>
        ))}
      </div>
    </nav>
  );
}

export function Zone({ nr, titel, zeile, id }) {
  return (
    <div className="sbb-zone" id={id} style={id ? { scrollMarginTop: 110 } : undefined}>
      <span className="nr" aria-hidden="true">{nr}</span>
      <div>
        <h2>{titel}</h2>
        {zeile && <p>{zeile}</p>}
      </div>
    </div>
  );
}

export function Kopf({ titel }) {
  return (
    <div className="sbb-kopf">
      <h2>{titel}</h2>
      <span className="strich" aria-hidden="true" />
    </div>
  );
}

/* Lange zusammengesetzte Wörter bekommen weiche Trennstellen (U+00AD), damit sie am Handy an der Wortfuge brechen
   und nicht mitten im Wort („Wahrschei nlichkeitsrechnung“). Nur Anzeige – Daten in werkzeuge.js bleiben ohne Trennzeichen. */
/* Weiche Trennstellen für Kartentitel (hyphens: manual – der Browser trennt nur hier, nie willkürlich).
   Hauptstelle ist die Wortfuge; die Silbengrenzen davor greifen nur, wenn das Stück bis zur Fuge nicht in die
   Spalte passt (Wahrscheinlichkeits- ist unter ~380 px breiter als die Titelspalte, Wahrscheinlich- unter ~340 px). */
const WEICH = { Wahrscheinlichkeitsrechnung: "Wahr\u00ADschein\u00ADlich\u00ADkeits\u00ADrechnung", Formelsammlung: "Formel\u00ADsammlung", Gleichungssysteme: "Gleichungs\u00ADsysteme",
  Dezimalzahlen: "Dezimal\u00ADzahlen", Mathematisches: "Mathe\u00ADmatisches" };
export const weichTrennen = (t) => (typeof t === "string" ? t.replace(/[A-Za-zÄÖÜäöüß]+/g, (w) => WEICH[w] || w) : t);
/* Kartentitel: weiche Trennstellen setzen und Satzzeichen fest an ihr Wort binden („Vektoren,“ bricht nie vor dem Komma) */
export function TitelText({ titel }) {
  if (typeof titel !== "string") return titel;
  return weichTrennen(titel).split(/(\s+)/).map((w, i) => {
    if (!/[,;:.]$/.test(w)) return w;
    const k = w.lastIndexOf("\u00AD") + 1;   // nur das letzte Stück fest binden, frühere Trennstellen bleiben nutzbar
    return <React.Fragment key={i}>{w.slice(0, k)}<span style={{ whiteSpace: "nowrap" }}>{w.slice(k)}</span></React.Fragment>;
  });
}

/* Glaskachel: Text links, Bild rechts. gesperrt = ausgegraut mit Schloss. Nur noch hinter ZEIGE_GESPERRTE (Ebbinghaus, Videokurse). */
function Kachel({ titel, text, logo, extra, ziel, label, gesperrt, keinI18n, gold, gehe, breit, weiter = "Öffnen", drei, zwei }) {
  return (
    <button type="button" onClick={gesperrt ? undefined : () => gehe(ziel)} disabled={gesperrt} aria-disabled={gesperrt || undefined}
      aria-label={gesperrt ? `${typeof titel === "string" ? titel : label} – noch gesperrt` : label} title={gesperrt ? "Noch gesperrt" : undefined}
      className={["sbb-karte", "sbb-kachel", gesperrt ? "zu" : null, gold ? "sbb-gold" : null, breit ? "sbb-breit" : null].filter(Boolean).join(" ")}>
      <div className="sbb-kachel-text">
        <h2 data-kein-i18n={keinI18n || undefined}>{titel}</h2>
        <p className={drei ? (zwei ? "drei zwei" : "drei") : undefined}>{text}</p>
        {drei ? (gesperrt ? <span className="weiter pille zu">Noch gesperrt</span> : <span className="weiter pille">{weiter} <i aria-hidden="true">→</i></span>)
          : !gesperrt && <span className="weiter">{weiter} <i aria-hidden="true">→</i></span>}
      </div>
      <div className="sbb-kachel-bild">
        <div className="sbb-logo">{logo}</div>
        {extra}
        {gesperrt && <span className="sbb-schloss" aria-hidden="true"><SchlossZeichen groesse={40} /></span>}
      </div>
    </button>
  );
}

/* ---------- Block Mathilda AI: EINE Karte wie im ☰-Menü (Goldknopf „Blatt scannen“, vier Chips), darunter der Zweischritt ----------
   Der Streifen „Das System“ mit vier Absätzen ist darin aufgegangen – ein Satz bleibt. */
export function MathildaBlock({ gehe, ohneZwei = false }) {
  const hell = useHell();
  const en = englisch();
  const [blatt, ...chips] = KI_MENUE;
  return (
    <div className="sbb-ma" data-start-mathilda>
      <div className="sbb-karte sbb-ma-karte sbb-insel sbb-gold">
        <div className="sbb-ma-text">
          <h2><MathildaName dunkel={!hell} /></h2>
          <p>Die meisten Fehler entstehen auf dem Blatt, nicht im Kopf. Mathilda prüft deinen Weg, nicht nur das Ergebnis.</p>
          <button type="button" className="sbb-los gold" onClick={() => gehe(blatt.ziel)} aria-label={blatt.name} data-start-mathilda-los>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.2" /></svg>
            {blatt.name}
          </button>
          <div className="sbb-ma-chips" role="group" aria-label="Weitere Wege mit Mathilda">
            {chips.map((k) => <button type="button" key={k.id} onClick={() => gehe(k.ziel)} aria-label={k.name} title={k.zeile}>{k.kurz}</button>)}
          </div>
        </div>
        <div className="sbb-ma-bild" aria-hidden="true"><svg viewBox="0 0 120 138"><MathildaPfade /></svg></div>
      </div>
      {!ohneZwei && <div className="sbb-zwei" role="group" aria-label="Zwei Schritte: Pen & Paper, dann Mathilda">
        <button type="button" className="sbb-karte sbb-zwei-schritt" onClick={() => gehe({ ansicht: "penpaperkurs" })} aria-label="Pen & Paper Kurs öffnen – Schritt 1">
          <span className="nr">1</span>
          <span className="t"><b>Pen & Paper</b><span>Sauber aufschreiben lernen · Kurs, kostenlos</span></span>
          <span className="bild"><PenPaperBlatt /></span>
        </button>
        <span className="sbb-zwei-pfeil" aria-hidden="true">→</span>
        <button type="button" className="sbb-karte sbb-zwei-schritt" onClick={() => gehe(blatt.ziel)} aria-label="Mathilda AI öffnen – Schritt 2">
          <span className="nr">2</span>
          <span className="t"><b><MathildaName dunkel={!hell} /></b><span>Blatt fotografieren, prüfen lassen, verbessern</span></span>
        </button>
      </div>}
    </div>
  );
}

/* ---------- Block Kurse: dieselbe Liste wie ☰ „Kurse“ (KURSE in hauptmenue.js), kompakte Lack-Karten ---------- */
const STAND = { unterstufe: unterStand, diffkurs: diffStand, vekkurs: vekStand, gfs: gfsStand, kiwahl: kiStand };
const sicher = (f) => { try { return f(); } catch (e) { return null; } };
export function KursKarteKlein({ k, gehe, daten }) {
  const st = KURS_STIL[k.id] || { hg: "linear-gradient(155deg,#F1F4F9 0%,#E3E8F2 100%)", farbe: C.grau, zeichen: "…", zFarbe: C.hellgrau };
  const stand = STAND[k.id] ? sicher(STAND[k.id]) : null;
  const begonnen = stand && stand.fertig > 0;
  return (
    <button type="button" className="sbb-kk" data-start-kurs={k.id} onClick={() => gehe(k.ziel)} aria-label={k.name} {...daten}
      style={{ background: st.hg, color: st.farbe, ...(st.rand ? { boxShadow: `inset 0 0 0 1px ${C.linie}, 0 8px 16px -12px rgba(8,26,72,0.4)` } : null) }}>
      <span className="z" data-kein-i18n style={{ color: st.zFarbe, ...(st.gross ? { fontSize: 30 } : null) }}>{st.zeichen}</span>
      <span className="t">
        <b>{TRENNUNG[k.name] || k.name}</b>
        <span>{begonnen ? `${stand.fertig} von ${stand.gesamt} geschafft` : k.zeile}</span>
      </span>
      {begonnen && <span className="balken" aria-hidden="true"><i style={{ width: `${Math.min(100, Math.round((stand.fertig / stand.gesamt) * 100))}%` }} /></span>}
    </button>
  );
}

/* Auf der Startseite die ersten sechs Kurse, der Rest über „Alle Kurse“ (/kurse: alle Kurse und die weiteren Lernangebote);
   daten-Attribute für Browser-Tests (e-Funktion) */
export const START_KURSE_ANZAHL = 6;
export function KursRaster({ gehe, alle = false }) {
  const liste = alle ? [...KURSE, ...WEITERE_ANGEBOTE] : KURSE.slice(0, START_KURSE_ANZAHL);
  return (
    <div className="sbb-kursraster">
      {liste.map((k) => <KursKarteKlein key={k.id} k={k} gehe={gehe} daten={k.id === "efunktion" ? { "data-start-efunktion": "" } : undefined} />)}
    </div>
  );
}

/* ---------- Block Entdecken: Mathe entdecken (aufklappbar) + der neueste Blog-Beitrag ---------- */
export function BlogAnriss({ gehe }) {
  const b = BLOG[0];
  if (!b) return null;
  return (
    <button type="button" className="sbb-karte sbb-blog" onClick={() => gehe({ ansicht: "blog", seite: b.slug })} aria-label={`Blog: ${b.titel}`} data-start-blog>
      <span className="kicker">Aus dem Blog · <span data-kein-i18n>{datumKurz(b.datum).text}</span></span>
      <b>{b.titel}</b>
      <span className="kurz">{b.kurz}</span>
      <span className="weiter">Lesen <i aria-hidden="true">→</i></span>
    </button>
  );
}

/* Aufklappbare Hauptkachel (Mathe entdecken): Text links, rechts Bild und Plus */
function HauptKachel({ titel, text, logo, auf, onClick, label }) {
  return (
    <button type="button" onClick={onClick} aria-expanded={auf} aria-label={label} className="sbb-karte sbb-haupt sbb-insel">
      <span className="txt"><h2>{titel}</h2><p>{text}</p></span>
      <span className="bild" aria-hidden="true">
        <span className="plus"><Plus /></span>
        <span className="logo">{logo}</span>
      </span>
    </button>
  );
}

/* Schulmathematik: großer Titel über die volle Breite; links je Stufe ein Knopf mit Plus (Abi als Quadrat neben Oberstufe),
   rechts die Grafik. Ein Knopf klappt darunter das Menü genau dieser Stufe auf, ein zweiter Tipp klappt es wieder zu.
   Die Stufe der angegebenen Klasse trägt „Deine Stufe“ (wird nicht von selbst aufgeklappt). */
export const SCHUL_STUFEN = [
  { id: "unter", name: "Unterstufe", kl: "Klasse 5–6" },
  { id: "mittel", name: "Mittelstufe", kl: "Klasse 7–10" },
  { id: "ober", name: "Oberstufe", kl: "Klasse 11–13" },
  { id: "abi", name: "Abi", kl: "Abitur-Vorbereitung", knopf: "Prüfung üben" },
];
function StufenKnopf({ s, wahl, waehle, abi, deine }) {
  const auf = wahl === s.id;
  return (
    <button type="button" className={abi ? "sbb-stufe abi" : "sbb-stufe"} aria-expanded={auf} onClick={() => waehle(auf ? null : s.id)} data-deine-stufe={deine ? "" : undefined}
      aria-label={`${abi ? "Abitur" : s.name} ${auf ? "zuklappen" : "aufklappen"}${deine ? " – deine Stufe" : ""}`}>
      <span className="t"><span className="n">{s.name}</span><span className="k">{deine ? "Deine Stufe" : (s.knopf || s.kl)}</span></span>
      <span className="p" aria-hidden="true"><PlusKlein farbe="currentColor" /></span>
    </button>
  );
}
function SchulKachel({ wahl, waehle, deine }) {
  return (
    <div className="sbb-karte sbb-schul sbb-insel">
      <div className="sbb-schul-kopf">
        <h2>Der Weg <span style={{ whiteSpace: "nowrap" }}>zum <span className="gold">Abi</span></span></h2>
        <p>Jedes Thema von Klasse 5 bis zum Abitur – sichtbar gemacht, erklärt und trainiert. Wähl deine Stufe und leg los.</p>
        <div className="sbb-schul-bild" aria-hidden="true"><SchulmatheLogoKlein eng /></div>
      </div>
      <div className="sbb-stufen" role="group" aria-label="Der Weg zum Abi nach Stufe">
        {SCHUL_STUFEN.map((s) => <StufenKnopf key={s.id} s={s} wahl={wahl} waehle={waehle} abi={s.id === "abi"} deine={deine === s.id} />)}
      </div>
    </div>
  );
}

/* Schublade der Start-Karte: Kopfzeile „Deine Klasse“ (Thema · Plan · Tools · Videos) mit Pfeil, aufgeklappt der Quickfinder auf einem weißen Blatt */
function TrainingKachel({ gehe, setzeStufe }) {
  const [auf, setAuf] = useState(() => { try { return sessionStorage.getItem("matheplus-training-auf") === "1"; } catch { return false; } });
  const umschalten = () => setAuf((a) => { try { sessionStorage.setItem("matheplus-training-auf", a ? "0" : "1"); } catch { /* egal */ } return !a; });
  const titel = (
    <>
      <h2 style={{ margin: 0, fontSize: "clamp(19px, 5.2vw, 25px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.12, color: C.see }}>Deine Klasse</h2>
      <span aria-hidden="true" style={{ display: "block", width: 40, height: 3, borderRadius: 2, marginTop: 9, background: `linear-gradient(90deg, ${C.goldWarm} 0%, ${GOLD} 100%)` }} />
    </>
  );
  return (
    <div className={auf ? "sbb-karte sbb-training sbb-gold sbb-insel auf" : "sbb-karte sbb-training sbb-gold sbb-insel"}>
      <button type="button" className="pfeil" onClick={umschalten} aria-expanded={auf} aria-label={auf ? "Deine Klasse zuklappen" : "Deine Klasse aufklappen"}>
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 6 L8 10.5 L12.5 6" stroke={NACHT} strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {auf ? (
        <div className="sbb-papier offen"><Quickfinder gehe={gehe} setzeStufe={setzeStufe} links={titel} /></div>
      ) : (
        <button type="button" className="kopfzeile" onClick={umschalten}>
          <span><h2>Deine Klasse</h2><p className="zeile">Thema · Plan · Werkzeuge · Videos</p></span>
        </button>
      )}
    </div>
  );
}

/* ---------- Modus dunkel / hell ---------- */
/* Zeichen der Stadion-Ansicht: ein Kreis, oben Rot, unten Blau, dazwischen ein weißer Streifen (eigenes Motiv, kein Vereinswappen) */
export function GerZeichen({ g = 13 }) {
  return (
    <svg width={g} height={g} viewBox="0 0 24 24" aria-hidden="true">
      <clipPath id="gerKreis"><circle cx="12" cy="12" r="9" /></clipPath>
      <g clipPath="url(#gerKreis)"><rect x="0" y="3" width="24" height="6" fill="#000000" /><rect x="0" y="9" width="24" height="6" fill="#DD0000" /><rect x="0" y="15" width="24" height="6" fill="#FFCE00" /></g>
    </svg>
  );
}
export function StadionZeichen({ g = 13 }) {
  return (
    <svg width={g} height={g} viewBox="0 0 24 24" aria-hidden="true">
      <path className="rot" d="M3 12a9 9 0 0 1 18 0z" fill="currentColor" />
      <path className="blau" d="M3 12a9 9 0 0 0 18 0z" fill="currentColor" opacity=".55" />
      <path d="M2.5 12h19" stroke="#FFFFFF" strokeWidth="2.6" />
    </svg>
  );
}
export const ModusKontext = createContext("mix");
const useHell = () => useContext(ModusKontext) === "hell";

export function useStartModus() {
  const [v, setV] = useState(startModus);
  useEffect(() => {
    const h = () => setV(startModus());
    window.addEventListener(EVENT_START_MODUS, h);
    return () => window.removeEventListener(EVENT_START_MODUS, h);
  }, []);
  return v;
}

/* Pille Dunkel | Hell | Mix | FCB | GER. Seit 21.10. (abends) nicht mehr auf der Startseite – die Wahl steht im ☰-Menü unter
   „Darstellung“ und im Arbeitsmenü; die Pille bleibt als Baustein für das Arbeitsmenü/Entwürfe erhalten. */
export function StartModusSchalter() {
  const v = useStartModus();
  return (
    <div className="sbb-schalter" data-modus={basisModus(v)} data-edition={editionVon(v)} role="group" aria-label="Startseite: dunkel, hell, mix, FCB oder GER">
      <style>{START_CSS}</style>
      <button type="button" aria-pressed={v === "dunkel"} onClick={() => startModusSetzen("dunkel")} aria-label="Dunkler Modus">
        <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" fill="currentColor" /></svg>Dunkel
      </button>
      <button type="button" aria-pressed={v === "hell"} onClick={() => startModusSetzen("hell")} aria-label="Heller Modus">
        <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><circle cx="12" cy="12" r="4" fill="currentColor" /><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" /></svg>Hell
      </button>
      <button type="button" aria-pressed={v === "mix"} onClick={() => startModusSetzen("mix")} aria-label="Mix: hell mit dunklen Inseln">
        <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.4" /><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" /></svg>Mix
      </button>
      <button type="button" className="st" aria-pressed={v === "stadion"} onClick={() => startModusSetzen("stadion")} aria-label="FCB: Rot, Weiß und Blau">
        <StadionZeichen />FCB
      </button>
      <button type="button" className="ger" aria-pressed={v === "ger"} onClick={() => startModusSetzen("ger")} aria-label="GER: Schwarz, Rot, Gold">
        <GerZeichen />GER
      </button>
    </div>
  );
}

/* ====================================================================== */
/* Block 3 „Lernen“: der Navigator „Der Weg zum Abi“ (Stufe → Bereich → Werkzeug). Eigenständig, damit ihn auch die
   Story-Startseite für Besucher (funcStartGast.jsx) unter derselben Id „lernen“ zeigt – Kopfleiste „Mathe lernen“ springt dorthin. */
export function LernNavigator({ gehe, stufe, stufeSetzen, klasse, zone = true }) {
  const [schulWahl, setSchulWahl] = useState(null);   // null | unter | mittel | ober | abi
  const schulAuf = schulWahl !== null;
  const [bereichAuf, setBereichAuf] = useState(null);
  const [etikett, setEtikett] = useState(null);
  const bereiche = schulBereiche(stufe);
  /* Stufe auf der Kachel wählen: Abi zeigt die Abi-Vorbereitung der Oberstufe, die anderen setzen den Stufen-Filter */
  const schulWaehlen = (w) => {
    setSchulWahl(w); setBereichAuf(null); setEtikett(null);
    if (w) stufeSetzen(w === "abi" ? "ober" : w);
  };
  const schulStufe = SCHUL_STUFEN.find((s) => s.id === schulWahl);
  const abiBlock = schulWahl === "abi" ? bereiche.find((b) => b.id === "abitur") : null;
  return (
    <>
        {zone && <Zone nr="2" titel="Lernen" zeile="Alle Werkzeuge nach Stufe und Bereich." id="lernen" />}
        <SchulKachel wahl={schulWahl} waehle={schulWaehlen} deine={klasse ? stufe : null} />
        {schulAuf && (
          <div className="sbb-papier" data-aufklapp-inhalt data-sprung="start-schulmathe">
            <div className="sbb-schul-panel-kopf"><b>{schulStufe.id === "abi" ? "Abitur-Vorbereitung" : schulStufe.name}</b><span>{schulStufe.id === "abi" ? "Oberstufe" : schulStufe.kl}</span></div>
            {schulWahl !== "abi" && <div style={{ marginTop: 10 }}><EtikettKnoepfe wert={etikett} setze={(e) => { setEtikett(e); setBereichAuf(null); }} /></div>}
            <div style={{ marginTop: 12 }}>
              {abiBlock ? (
                <>
                  <button type="button" className="sbb-bereich gold" onClick={() => gehe({ ansicht: "abi" })} aria-label="Mathe-Abi-Masterclass öffnen" data-start-abizentrum>
                    <span className="logo" aria-hidden="true" style={{ fontWeight: 900, fontSize: 13, letterSpacing: "-0.02em" }}>ABI</span>
                    <span className="t"><b>Mathe-Abi-Masterclass</b><span>Dein Plan, Prüfungsaufgaben, Mia als Trainerin, Lernpartner in deiner Stadt.</span></span>
                    <span className="pf" aria-hidden="true">→</span>
                  </button>
                  <UnterMenue eintraege={blockEintraege(abiBlock, "ober", null)} gehe={gehe} linie={abiBlock.linie} />
                </>
              ) : etikett ? (
                bereiche.map((b) => {
                  const ws = blockEintraege(b, stufe, etikett).filter((e) => !e.kopf);
                  if (!ws.length) return null;
                  return (
                    <div key={b.id} style={{ marginTop: 14 }}>
                      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "0 2px 2px" }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: C.seeTief, minWidth: 0, lineHeight: 1.25, hyphens: "manual", WebkitHyphens: "manual" }}><TitelText titel={b.titel} /></span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: C.grau, flex: "none", marginLeft: 10 }}>{ws.length === 1 ? "1 Werkzeug" : `${ws.length} Werkzeuge`}</span>
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
                      <span className="t">{b.vorTitel && <span className="vor">{b.vorTitel}</span>}<b><TitelText titel={b.titel} /></b><span>{text}</span></span>
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
    </>
  );
}

/* Breite Bühne (ab 1100 px): Start-Karte rechts in der Bühne, alles ohne Scrollen sichtbar */
const BUEHNE_BREIT = "(min-width: 1100px)";
function useBreiteBuehne() {
  const lies = () => typeof window !== "undefined" && !!window.matchMedia && window.matchMedia(BUEHNE_BREIT).matches;
  const [breit, setBreit] = useState(lies);
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const m = window.matchMedia(BUEHNE_BREIT);
    const h = () => setBreit(m.matches);
    m.addEventListener ? m.addEventListener("change", h) : m.addListener(h);
    return () => (m.removeEventListener ? m.removeEventListener("change", h) : m.removeListener(h));
  }, []);
  return breit;
}

/* ====================================================================== */
/* Sieben Blöcke (21.10. abends): 0 Band · 1 Bühne · 2 Heute · 3 Lernen · 4 Mathilda · 5 Kurse · 6 Entdecken · 7 Vision-Anriss + Fuß.
   Zwei Regeln: Jeder Block hat genau einen ☰-Abschnitt mit demselben Namen; Gesperrtes steht nie auf der Startseite. */
export function Startseite({ gehe }) {
  const modus = useStartModus();
  const frei = useFrei();
  const [entdAuf, setEntdAuf] = useState(false);
  const { stufe, setzen: stufeWaehlen, klasse } = useStartStufe();   // folgt der angegebenen Klasse (Konto, Quickfinder, Onboarding)
  const stufeSetzen = (w) => stufeWaehlen(w);
  const breit = useBreiteBuehne();
  const schublade = <div className="sbb-abschnitt" style={{ marginTop: 0 }}><TrainingKachel gehe={gehe} setzeStufe={stufeSetzen} /></div>;
  /* Die ganze App-Fläche folgt dem Modus: Hintergrund und Fußknöpfe (Regeln oben in CSS) */
  useEffect(() => {
    const d = document.documentElement;
    d.setAttribute("data-start-modus", basisModus(modus));   /* data-start-edition setzt startModus.js app-weit */
    return () => d.removeAttribute("data-start-modus");
  }, [modus]);

  const oberstufe = !!klasse && stufe === "ober";

  return (
    <ModusKontext.Provider value={modus}>
    <div className="sbb" data-modus={basisModus(modus)} data-edition={editionVon(modus)}>
      <style>{START_CSS}</style>
      <div className="sbb-licht" aria-hidden="true"><span className="l1" /><span className="l2" /><span className="l3" /></div>

      {/* ---------- 1 Bühne: Headline, Unterzeile, EINE Handlung (Pen & Paper, kostenlos), Suche ---------- */}
      <section className={["sbb-held", "sbb-insel", klasse && !breit ? "kompakt" : null, breit ? "breit" : null].filter(Boolean).join(" ")} aria-label="Mythos Mathe" id={breit ? "heute" : undefined}>
        <HeldKurve breit={breit} />
        <div className={breit ? "sbb-held-raster" : undefined}>
        <div className="sbb-spalte sbb-held-text" style={{ paddingBottom: 0 }}>
          <h1>Mathe kann<span className="gold">jeder verstehen</span></h1>
          <p className="unter">Hier lernst du wie!</p>
          {/* Neuer Besucher: der erste Schritt der Marke (wie auf /vision). Mit bekannter Klasse ist der Goldknopf der Heute-Karte die Handlung – kein zweiter daneben. */}
          {!klasse && (
            <button type="button" className="sbb-los gold held" onClick={() => gehe({ ansicht: "penpaperkurs" })} aria-label="Pen & Paper starten – kostenlos" data-start-los>
              Pen & Paper starten <span className="frei">· kostenlos</span>
            </button>
          )}
          <div className="sbb-held-suche"><SuchBox gehe={gehe} buehne /></div>
        </div>
        {breit && (
          <div className="sbb-held-karte">
            <p className="sbb-held-zone"><span className="nr">1</span>Heute trainierst du&nbsp;…</p>
            <StartKarte gehe={gehe} setzeStufe={stufeSetzen} klasse={klasse} />
          </div>
        )}
        </div>
      </section>
      <StartBand />

      <section className="sbb-teil"><div className="sbb-spalte">
        {/* ---------- 2 Heute: EINE Start-Karte (Klasse fragen → Heute-Karte + Weitermachen + Konto-Zeile + Schublade „Deine Klasse“) ---------- */}
        {breit ? (klasse ? <div className="sbb-abschnitt" style={{ marginTop: 18 }}>{schublade}</div> : null) : (
          <>
            <Zone nr="1" titel={"Heute trainierst du …"} id="heute" />
            <StartKarte gehe={gehe} setzeStufe={stufeSetzen} klasse={klasse} schublade={schublade} />
          </>
        )}
        {/* Die Masterclass nur für die Oberstufe (Klasse bekannt) – sonst nur als Stufenknopf „Abi“ und in den Kursen */}
        {oberstufe && <div className="sbb-wieder"><AbiZentrumKachel onClick={() => gehe({ ansicht: "abi" })} /></div>}

        <LernNavigator gehe={gehe} stufe={stufe} stufeSetzen={stufeSetzen} klasse={klasse} />
        {ZEIGE_GESPERRTE && (
          <div className="sbb-raster2" style={{ marginTop: 14 }}>
            <Kachel gehe={gehe} gesperrt keinI18n titel="Ebbinghaus" label="Ebbinghaus öffnen" logo={<EbbinghausLogoKlein />} extra={<EbbinghausBadge />} ziel={{ ansicht: "ebbinghaus" }} drei zwei text={EBB_KURZ} />
            <Kachel gehe={gehe} gesperrt titel="Videokurse" label="Videokurse öffnen" logo={<SchulkurseLogoKlein />} ziel={{ ansicht: "kurse" }} text="Analysis 1–5, Vektoren und Stochastik – mit Videolektionen und Checks." />
          </div>
        )}
      </div></section>

      {/* ---------- 4 Mathilda AI – im Mix der erste dunkle Streifen ---------- */}
      <section className="sbb-teil sbb-streifen sbb-insel" id="mathilda" style={{ scrollMarginTop: 96 }}><div className="sbb-spalte">
        <Zone nr="3" titel="Mathilda AI" zeile="Deine KI-Tutorin prüft den Rechenweg." />
        <MathildaBlock gehe={gehe} />
      </div></section>

      {/* ---------- 5 Kurse: dieselbe Liste wie im ☰ ---------- */}
      <section className="sbb-teil"><div className="sbb-spalte">
        <Zone nr="4" titel="Kurse" zeile="Jeder Kurs ein Baustein." id="kurse" />
        <KursRaster gehe={gehe} />
        <div className="sbb-mehr">
          <button type="button" onClick={() => gehe({ ansicht: "kursliste" })} data-start-alle-kurse>Alle {KURSE.length} Kurse und weitere Lernangebote <i aria-hidden="true">→</i></button>
        </div>
        {/* Elternabend: ohne Angebot nur nach Passwort */}
        {(ANGEBOT.elternabend || frei) && <div className="sbb-wieder"><ElternabendKachel gesperrt={!frei} onClick={() => gehe({ ansicht: "elternabend" })} /></div>}
        {ZEIGE_GESPERRTE && (
          <div className="sbb-wieder">
            <MatheCheckenKachel gesperrt onClick={() => gehe({ ansicht: "mathecheck" })} />
            <MasterclassKachel gesperrt onClick={() => gehe({ ansicht: "masterclass" })} />
            <MathCreatorKachel />
          </div>
        )}

        {/* ---------- 6 Entdecken: Herleiten, Wettbewerbe – und der Blog ---------- */}
        <Zone nr="5" titel="Mathe entdecken" zeile="Herleiten, Wettbewerbe und der Blog." id="entdecken" />
        <HauptKachel auf={entdAuf} onClick={() => setEntdAuf(!entdAuf)}
          label={entdAuf ? "Mathe entdecken zuklappen" : "Mathe entdecken aufklappen"} logo={<EntdeckenLogoKlein />} titel="Mathe entdecken"
          text={entdAuf ? "Herleiten, entdecken, Wettbewerbe." : "Muster erkennen, Formeln selbst herleiten – und Mathe-Wettbewerbe."} />
        {entdAuf && <div className="sbb-papier" data-aufklapp-inhalt><UnterMenue eintraege={ENTDECKEN_MENUE} gehe={gehe} /></div>}
        <BlogAnriss gehe={gehe} />
      </div></section>

      {/* ---------- 7 Vision-Anriss – im Mix der zweite dunkle Streifen (die Geschichte steht auf /vision, die 7 Mythen im Blog) ---------- */}
      <section className="sbb-teil sbb-streifen sbb-insel sbb-mythen-streifen" id="system" style={{ scrollMarginTop: 56 }}><div className="sbb-spalte">
        <Kopf titel="Mathetalent ist ein Mythos. Ein System kann man lernen." />
        <p className="sbb-text">Hinter guten Mathenoten steckt kein besonderes Gehirn, sondern eine Arbeitsweise – wie du denkst, rechnest, schreibst und Gelerntes behältst.</p>
        <div className="sbb-vision-knoepfe">
          <button type="button" className="sbb-los gold" onClick={() => gehe({ ansicht: "vision" })} aria-label="Die Vision lesen" data-start-vision>Die Vision lesen <i aria-hidden="true">→</i></button>
          <button type="button" className="sbb-los leise" onClick={() => gehe({ ansicht: "blog", seite: MYTHEN_SLUG })} aria-label="Die 7 Mathe-Mythen im Blog" data-start-mythen>Die 7 Mathe-Mythen</button>
        </div>
      </div></section>

      {/* Anleitung, Spenden */}
      <section className="sbb-teil ende"><div className="sbb-spalte">
        <div className="sbb-wieder" style={{ marginTop: 22 }}><AppAnleitung /></div>
        <div className="sbb-wieder"><SpendenBereich gehe={gehe} /></div>
      </div></section>
    </div>
    </ModusKontext.Provider>
  );
}
