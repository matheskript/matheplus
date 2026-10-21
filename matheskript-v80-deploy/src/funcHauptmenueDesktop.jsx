/* ======================================================================
   DESKTOP-MENÜ (ab 900 px) – das ☰ öffnet hier kein schmales Fenster, sondern
   ein Menü über den ganzen Bildschirm: alles, was die App hat, auf einen Blick.
   Entwurf: Design-Artifact „Mythos Mathe – Desktop-Menü“ (20.10.2026).
   Handy (< 900 px): unverändert das ☰-Fenster aus funcHauptmenue.jsx.

   Aufbau
     Kopfzeile (klebt oben): Wortmarke · Suche („/“ oder ⌘K) · Konto bzw. Anmelden · ×
     Drei Spalten (ab 1280 px; darunter zwei: links Mathilda-Spalte, rechts B über C)
       A  Mathilda-Karte (Blatt scannen + Chat, Rechenweg, Textaufgabe, Klausur, Pen & Paper)
          · Weitermachen (zuletzt benutztes Werkzeug) · Dein Schulbuch (Klasse, Kapitel, Kurs dazu) · Formelsammlung
       B  Der Weg zum Abi (Stufe → Bereiche als Kacheln → Stationen → Werkzeuge)
          · Mein Training (8 Kacheln)
       C  Kurse (Lack-Karten mit echtem Stand aus kursStand.js + kleine Kurse) · Mathe entdecken
     Fußzeile: Konto-Punkte bzw. Test-Account · Darstellung Dunkel | Hell | Mix · Abmelden/Anmelden

   Nur echte Daten: Fortschritt steht nur dort, wo es ihn gibt (Kursstand, zuletzt benutztes Werkzeug).
   Folgt dem Modus der Startseite (startModus.js): dunkel/mix = Nachtblau bzw. Blau, hell = helle Karten;
   Mathilda-Karte und Mathe-Training bleiben in jedem Modus dunkel (wie im Handy-Menü).
   Kein Karoraster (Marke). Esc, × oder Klick auf ein Ziel schließt; Fokus bleibt im Menü.
   ====================================================================== */
import React, { useEffect, useRef, useState } from "react";
import { C } from "./base1.jsx";
import { englisch, tr } from "./i18n.js";
import { SuchBox } from "./funcSuche.jsx";
import { MathildaName } from "./mathildaName.jsx";
import { MathildaBild } from "./funcMathildaSeite.jsx";
import { MarkenLogo } from "./markenLogo.jsx";
import { ETIKETTEN } from "./werkzeuge.js";
import { basisModus, editionVon, EVENT_START_MODUS, START_MODI, startModus, startModusSetzen } from "./startModus.js";
import {
  LEISTE, KI_MENUE, TRAINING, KURSE, BALD_KURSE, WEITERE_ANGEBOTE, STUFEN, FORMELN, NACHSCHLAGEN,
  kontoArt, klasseLabel, klassenInhalt, trainingsBereiche, werkzeugAnzahl, entdeckenGruppen,
} from "./hauptmenue.js";
import {
  GOLD_VERLAUF, NACHT_VERLAUF, Ikon, TRAINING_IKON, KI_IKON, KONTO_IKON, Pfeil, zeichenGroesse, Bald, istAktuell,
  BereichBild, KURS_STIL, TRENNUNG, KlasseWaehlen, ETIKETT_FARBE, MODUS_NAME, MODUS_NAME_EN, ModusSymbol, anfangVon,
} from "./hauptmenueTeile.jsx";
import { diffStand, vekStand, geoStand, gfsStand, kiStand, unterStand } from "./kursStand.js";
import { SMARAGD, TIEFBLAU, AMETHYST, LACKSCHWARZ, NACHTBLAU, GRANAT } from "./kursFarben.js";
import { MotivTangente, MotivEbene, MotivBuehne, MotivDialog, MotivGeodreieck, MotivDreieck } from "./funcKursMotive.jsx";
import { UNTERSTUFE_ZAHLEN } from "./unterstufeDaten.js";

/* Ab dieser Breite gilt das Desktop-Menü (dieselbe Grenze wie bisher im ☰-Fenster) */
import { DESKTOP_MENUE_AB } from "./hauptmenue.js";
export { DESKTOP_MENUE_AB };

const CSS = `
.hmd{position:fixed;inset:0;z-index:90;overflow-y:auto;overscroll-behavior:contain;outline:none;
  font-family:Montserrat,system-ui,sans-serif;color:var(--t);-webkit-font-smoothing:antialiased;
  background:var(--grund);-webkit-backdrop-filter:blur(18px) saturate(1.15);backdrop-filter:blur(18px) saturate(1.15);
  animation:hmdBlende .22s ease both;scrollbar-width:thin;scrollbar-color:var(--rand) transparent;
  --t:#FFFFFF;--t2:#C6D0E6;--t3:#9DAAC8;--gold:${C.flaggold};--gold-hell:#FFE58A;
  --grund:rgba(4,9,26,0.9);--kopf:rgba(4,9,26,0.72);--licht1:rgba(237,187,0,0.20);--licht2:rgba(0,77,152,0.38);
  --karte:rgba(255,255,255,0.045);--rand:rgba(255,255,255,0.11);--schatten:0 24px 60px -30px rgba(0,0,0,0.9);
  --hover:rgba(255,255,255,0.07);--kachel:rgba(255,255,255,0.055);--kachel-rand:rgba(255,255,255,0.11);
  --held:${NACHT_VERLAUF};--held-rand:rgba(237,187,0,0.38)}
.hmd[data-modus="mix"]{--grund:rgba(9,40,98,0.9);--kopf:rgba(9,40,98,0.7);--t2:#D4DEF2;--t3:#AFC0E0;
  --licht1:rgba(255,229,138,0.22);--licht2:rgba(255,255,255,0.10);--karte:rgba(255,255,255,0.07);--rand:rgba(255,255,255,0.16);
  --kachel:rgba(5,11,31,0.22);--kachel-rand:rgba(255,255,255,0.16);--hover:rgba(5,11,31,0.3);
  --held:linear-gradient(155deg,#0B2560 0%,#081A46 60%,#06122F 100%)}
.hmd[data-edition="ger"]{--grund:rgba(8,8,8,0.94);--kopf:rgba(8,8,8,0.78);--t2:#D6D6D6;--t3:#A8A8A8;--licht1:rgba(255,206,0,0.18);--licht2:rgba(221,0,0,0.22);
  --karte:rgba(255,255,255,0.05);--rand:rgba(255,255,255,0.12);--kachel:rgba(255,255,255,0.05);--kachel-rand:rgba(255,255,255,0.12);--hover:rgba(255,255,255,0.08);
  --held:linear-gradient(155deg,#E00000 0%,#C00000 55%,#8E0000 100%);--held-rand:rgba(255,206,0,0.55)}
.hmd[data-edition="stadion"]{--grund:rgba(163,0,31,0.92);--kopf:rgba(163,0,31,0.75);--t2:#FFE0E6;--t3:#FFC2CD;--gold:#FFFFFF;--gold-hell:#FFFFFF;
  --licht1:rgba(255,255,255,0.18);--licht2:rgba(0,102,178,0.40);--kachel:rgba(0,68,122,0.28);--hover:rgba(0,68,122,0.38);
  --held:linear-gradient(155deg,#0A78C9 0%,#0066B2 55%,#00447A 100%);--held-rand:rgba(255,255,255,0.5)}
.hmd[data-modus="hell"]{--grund:rgba(241,244,250,0.95);--kopf:rgba(241,244,250,0.82);--t:${C.tinte};--t2:#46526F;--t3:${C.grau};--gold:#8A6A00;
  --licht1:rgba(237,187,0,0.16);--licht2:rgba(0,77,152,0.10);--karte:#FFFFFF;--rand:rgba(14,30,74,0.09);
  --schatten:0 1px 2px rgba(14,30,74,0.06),0 18px 40px -26px rgba(14,30,74,0.35);
  --hover:${C.himmel};--kachel:#F7F9FD;--kachel-rand:${C.linie}}
/* Dunkle Inseln (Mathilda, Mathe-Training): in jedem Modus dunkel */
.hmd .hmd-dunkel{--t:#FFFFFF;--t2:#C6D0E6;--t3:#9DAAC8;--gold:${C.flaggold};--hover:rgba(255,255,255,0.07);
  --kachel:rgba(255,255,255,0.06);--kachel-rand:rgba(255,255,255,0.12);--rand:rgba(255,255,255,0.12)}
/* Schulbuch: Elfenbein mit Gold, in jedem Modus hell */
.hmd .hmd-buch{--t:${C.seeTief};--t2:#4A4020;--t3:#6E5A1E;--gold:#7A5800;--hover:rgba(237,187,0,0.14);
  --kachel:rgba(255,255,255,0.7);--kachel-rand:rgba(237,187,0,0.35);--rand:rgba(237,187,0,0.4)}
.hmd *,.hmd *::before,.hmd *::after{box-sizing:border-box}
.hmd button{font-family:inherit;cursor:pointer}
.hmd button:focus-visible,.hmd a:focus-visible{outline:3px solid ${C.flaggold};outline-offset:2px}
.hmd-licht{position:fixed;inset:0;pointer-events:none;z-index:0;
  background:radial-gradient(42vw 38vw at 92% -8%,var(--licht1) 0%,transparent 70%),radial-gradient(36vw 34vw at -6% -12%,var(--licht2) 0%,transparent 70%)}
@keyframes hmdBlende{from{opacity:0}to{opacity:1}}
@keyframes hmdRein{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes hmdAuf{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.hmd,.hmd-sp,.hmd-auf{animation:none!important}.hmd *{transition:none!important}}

.hmd-innen{position:relative;z-index:1;max-width:1480px;margin:0 auto;padding:0 40px 28px;display:flex;flex-direction:column;gap:20px;min-height:100%}
@media (max-width:1099px){.hmd-innen{padding:0 24px 24px}}

/* Kopfzeile */
.hmd-kopf{position:sticky;top:0;z-index:5;display:flex;align-items:center;gap:16px;margin:0 -40px;padding:14px 40px;
  background:var(--kopf);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);border-bottom:1px solid transparent;transition:border-color .2s ease}
.hmd[data-gescrollt] .hmd-kopf{border-bottom-color:var(--rand)}
@media (max-width:1099px){.hmd-kopf{margin:0 -24px;padding:12px 24px}}
.hmd-marke{flex:none;border:none;background:none;padding:4px 0;color:inherit;display:flex;align-items:center}
.hmd-such-ort{position:relative;flex:1 1 auto;min-width:0;max-width:680px;margin:0 auto}
.hmd-such{display:flex;width:100%;align-items:center;gap:12px;height:50px;padding:0 10px 0 20px;border-radius:999px;
  border:1px solid var(--kachel-rand);background:var(--kachel);color:var(--t2);font-size:15px;font-weight:600;text-align:left;
  transition:border-color .15s ease,background .15s ease,box-shadow .15s ease}
.hmd-such:hover,.hmd-such[aria-expanded="true"]{border-color:var(--gold);box-shadow:0 0 0 4px rgba(237,187,0,0.12)}
.hmd-such .ik{color:var(--gold)}
.hmd-taste{flex:none;font-size:11px;font-weight:800;letter-spacing:.04em;padding:5px 9px;border-radius:8px;border:1px solid var(--kachel-rand);color:var(--t3);background:var(--karte)}
.hmd-such-lage{position:absolute;left:0;right:0;top:calc(100% + 10px);max-height:min(72vh,640px);overflow-y:auto;border-radius:20px;
  box-shadow:0 30px 70px -20px rgba(0,0,0,0.55);animation:hmdAuf .18s ease both}
.hmd-such-lage [data-such-box]{margin:0!important}
.hmd-konto{flex:none;display:flex;align-items:center;gap:10px;height:46px;padding:0 5px 0 16px;border-radius:999px;border:1px solid var(--kachel-rand);
  background:var(--kachel);color:var(--t);font-size:13.5px;font-weight:700;white-space:nowrap}
.hmd-konto:hover{border-color:var(--gold)}
.hmd-konto .art{color:var(--t3);font-weight:600}
.hmd-anfang{display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:999px;background:${C.seeTief};color:${C.flaggold};
  border:2px solid ${C.flaggold};font-size:15px;font-weight:800}
.hmd-anmelden{flex:none;height:46px;padding:0 22px;border-radius:999px;border:none;background:${GOLD_VERLAUF};color:${C.seeTief};font-size:14px;font-weight:800;
  box-shadow:0 10px 24px -12px rgba(237,187,0,0.9),inset 0 1px 0 rgba(255,255,255,0.6)}
.hmd-zu{flex:none;width:46px;height:46px;border-radius:999px;border:none;background:#FFFFFF;color:${C.seeTief};display:flex;align-items:center;justify-content:center;
  box-shadow:0 8px 20px -10px rgba(0,0,0,0.6);transition:transform .15s ease}
.hmd[data-modus="hell"] .hmd-zu{background:${C.seeTief};color:#FFFFFF}
.hmd-zu:hover{transform:rotate(90deg)}

/* Raster */
.hmd-raster{display:grid;gap:20px;align-items:start;grid-template-columns:minmax(0,350px) minmax(0,1fr);grid-template-areas:"a b" "a c"}
@media (min-width:1280px){.hmd-raster{grid-template-columns:minmax(0,370px) minmax(0,1.12fr) minmax(0,1fr);grid-template-areas:"a b c"}}
.hmd-sp{display:flex;flex-direction:column;gap:16px;min-width:0;animation:hmdRein .42s cubic-bezier(.2,.8,.25,1) both}
.hmd-sp.a{grid-area:a;animation-delay:.03s}.hmd-sp.b{grid-area:b;animation-delay:.08s}.hmd-sp.c{grid-area:c;animation-delay:.13s}

/* Karten */
.hmd-karte{position:relative;border-radius:24px;padding:20px;background:var(--karte);border:1px solid var(--rand);box-shadow:var(--schatten);color:var(--t)}
.hmd-held{background:var(--held);border-color:var(--held-rand);overflow:hidden;
  box-shadow:0 0 0 1px rgba(237,187,0,0.06),0 30px 70px -30px rgba(0,0,0,0.85),inset 0 1px 0 rgba(255,255,255,0.08)}
.hmd-buch{background:linear-gradient(180deg,#FFF9E2 0%,#FFF1C2 100%);border-color:rgba(237,187,0,0.55)}
.hmd-kicker{display:flex;align-items:center;gap:8px;margin:0;font-size:10.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--gold)}
.hmd-kicker .zahl{letter-spacing:0;font-size:10.5px;font-weight:800;padding:2px 7px;border-radius:999px;background:var(--gold);color:var(--grund-zahl,#0E1E4A)}
.hmd[data-modus="hell"] .hmd-kicker .zahl{color:#FFFFFF}
.hmd-buch .hmd-kicker .zahl{color:#FFFFFF}
.hmd-punkt{width:7px;height:7px;border-radius:999px;background:${C.flaggold};flex:none}
.hmd-kopf-zeile{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}
.hmd-link{display:inline-flex;align-items:center;gap:4px;border:none;background:none;padding:6px 2px;color:var(--gold);font-size:12.5px;font-weight:800;white-space:nowrap}
.hmd-link:hover{text-decoration:underline;text-underline-offset:3px}
.hmd-leise{margin:0;font-size:12.5px;font-weight:500;line-height:1.45;color:var(--t2)}

/* Mathilda */
.hmd-mathilda{padding:22px}
.hmd-kurve{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;opacity:.5}
.hmd-schein{position:absolute;top:-140px;right:-120px;width:340px;height:340px;border-radius:999px;pointer-events:none;
  background:radial-gradient(circle,rgba(237,187,0,0.30) 0%,rgba(237,187,0,0) 68%)}
.hmd-mathilda > :not(.hmd-kurve):not(.hmd-schein){position:relative}
.hmd-avatar{flex:none;position:relative;width:72px;height:72px;border-radius:999px;overflow:hidden;display:block;background:linear-gradient(160deg,#2A3C66 0%,#141F3C 100%);
  box-shadow:0 0 0 2.5px ${C.flaggold},0 0 0 7px rgba(237,187,0,0.16),0 10px 24px rgba(0,0,0,0.4)}
.hmd-online{position:absolute;left:56px;top:56px;width:15px;height:15px;border-radius:999px;background:#38C172;box-shadow:0 0 0 3px #0E1E4A}
.hmd-badge{font-size:9.5px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;color:${C.flaggold};border:1px solid rgba(237,187,0,0.6);border-radius:999px;padding:3px 8px;white-space:nowrap}
.hmd-gold-knopf{display:flex;width:100%;align-items:center;justify-content:center;gap:10px;height:56px;border:none;border-radius:16px;
  background:${GOLD_VERLAUF};color:${C.seeTief};font-size:17px;font-weight:800;letter-spacing:-0.01em;
  box-shadow:0 14px 30px -14px rgba(237,187,0,0.95),inset 0 1px 0 rgba(255,255,255,0.6),inset 0 -2px 0 rgba(122,88,0,0.25);transition:transform .12s ease,filter .12s ease}
.hmd-gold-knopf:hover{filter:brightness(1.05);transform:translateY(-1px)}
.hmd-gold-knopf:active{transform:scale(.98)}
.hmd-ki-raster{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:10px}
.hmd-ki{display:flex;align-items:center;gap:8px;height:50px;padding:0 12px;border-radius:14px;border:1px solid var(--kachel-rand);background:var(--kachel);
  color:var(--t);font-size:14px;font-weight:700;text-align:left;transition:background .15s ease,border-color .15s ease}
.hmd-ki:hover{background:rgba(255,255,255,0.11);border-color:rgba(237,187,0,0.5)}
.hmd-ki[aria-current="page"]{border-color:${C.flaggold};background:rgba(237,187,0,0.16)}
.hmd-pp{display:flex;width:100%;align-items:center;gap:12px;margin-top:16px;padding:14px 2px 0;border:none;border-top:1px solid var(--rand);background:none;color:var(--t);text-align:left}
.hmd-pp:hover .hmd-link{text-decoration:underline;text-underline-offset:3px}

/* Weitermachen */
.hmd-weiter{display:flex;width:100%;align-items:center;gap:14px;padding:14px 16px;border-radius:20px;text-align:left;color:var(--t);
  background:var(--karte);border:1px solid rgba(237,187,0,0.55);box-shadow:var(--schatten);transition:border-color .15s ease,transform .15s ease}
.hmd-weiter:hover{border-color:${C.flaggold};transform:translateY(-1px)}
.hmd-play{flex:none;width:46px;height:46px;border-radius:999px;background:${GOLD_VERLAUF};color:${C.seeTief};display:flex;align-items:center;justify-content:center;
  box-shadow:0 8px 18px -8px rgba(237,187,0,0.9)}
.hmd-wz-gross{flex:none;min-width:44px;height:44px;padding:0 6px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-weight:800;
  color:${C.flaggold};background:${C.seeTief};letter-spacing:-0.02em;white-space:nowrap}

/* Schulbuch */
.hmd-kapitel{display:flex;width:100%;align-items:center;gap:10px;padding:8px 10px;border-radius:12px;border:1px solid transparent;background:var(--kachel);
  color:var(--t);font-size:13.5px;font-weight:700;line-height:1.25;text-align:left;margin-top:6px;transition:border-color .15s ease}
.hmd-kapitel:hover,.hmd-kapitel[aria-expanded="true"]{border-color:var(--kachel-rand)}
.hmd-nr{flex:none;min-width:26px;height:26px;padding:0 6px;border-radius:999px;background:${C.seeTief};color:${C.flaggold};font-size:11px;font-weight:800;
  display:flex;align-items:center;justify-content:center}
.hmd-kapitel-auf{margin:6px 0 4px 18px;padding:2px 0 4px 14px;border-left:3px solid ${C.flaggold};animation:hmdAuf .18s ease both}
.hmd-kapitel-knoepfe{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:6px 0 8px}
.hmd-dunkel-knopf{display:flex;width:100%;align-items:center;justify-content:center;gap:7px;height:40px;border:none;border-radius:12px;background:${C.seeTief};
  color:${C.flaggold};font-size:13px;font-weight:800;white-space:nowrap}
.hmd-kapitel-seite{display:flex;width:100%;align-items:center;justify-content:center;gap:7px;height:40px;border-radius:12px;background:#FFFFFF;color:${C.seeTief};
  border:1.5px solid ${C.flaggold};font-size:13px;font-weight:800;white-space:nowrap}
.hmd-kapitel-seite:hover{background:#FFFBEA}
.hmd-dunkel-knopf:hover{background:#13285E}

/* Pillen und Chips */
.hmd-chips{display:flex;flex-wrap:wrap;gap:6px}
.hmd-chip{display:inline-flex;align-items:center;gap:6px;min-height:34px;padding:4px 12px;border-radius:999px;border:1px solid var(--kachel-rand);background:var(--kachel);
  color:var(--t);font-size:12.5px;font-weight:700;line-height:1.2;text-align:left;transition:border-color .15s ease,background .15s ease}
.hmd-chip:hover{border-color:var(--gold)}
.hmd-chip[aria-current="page"]{border-color:${C.flaggold};background:rgba(237,187,0,0.16)}
.hmd-chip[aria-disabled="true"]{cursor:default;opacity:.62}

/* Mathe-Training */
.hmd-zahlzeile{display:flex;align-items:baseline;gap:8px;margin:6px 0 0;white-space:nowrap;font-size:24px;font-weight:900;letter-spacing:-0.02em;line-height:1.1;color:#FFFFFF}
.hmd-zahlzeile .stufe{font-size:15px;font-weight:600;color:var(--t2);letter-spacing:0}
.hmd-stufen{display:flex;gap:3px;padding:4px;border-radius:999px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);flex:none}
.hmd-stufen button{display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:58px;height:40px;padding:0 10px;border-radius:999px;border:none;background:transparent;
  color:var(--t2);line-height:1.1;transition:background .15s ease,color .15s ease}
.hmd-stufen button:hover{color:#FFFFFF}
.hmd-stufen button[aria-pressed="true"]{background:${GOLD_VERLAUF};color:${C.seeTief}}
.hmd-stufen .k{font-size:12px;font-weight:800}.hmd-stufen .kl{font-size:9.5px;font-weight:700;opacity:.8}
.hmd-legende{display:flex;gap:16px;margin:12px 0 12px;font-size:11px;font-weight:700;color:var(--t3)}
.hmd-legende span{display:inline-flex;align-items:center;gap:6px}
.hmd-bereiche{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.hmd-bereich{display:flex;width:100%;align-items:center;gap:11px;min-height:64px;padding:10px 12px 10px 10px;border-radius:16px;border:1px solid var(--kachel-rand);
  background:var(--kachel);color:#FFFFFF;text-align:left;transition:border-color .15s ease,background .15s ease}
.hmd-bereich:hover{border-color:rgba(237,187,0,0.5);background:rgba(255,255,255,0.09)}
.hmd-bereich[aria-expanded="true"]{border-color:${C.flaggold};background:rgba(237,187,0,0.12)}
.hmd-bereich[data-gold]{border-color:rgba(237,187,0,0.45)}
.hmd-bereich-bild{flex:none;width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;
  background:linear-gradient(150deg,#1B62AE 0%,#0F4A8A 55%,#0A3A70 100%);box-shadow:inset 0 1px 0 rgba(255,255,255,0.2)}
.hmd-bereich[data-gold] .hmd-bereich-bild{background:linear-gradient(160deg,#2A3C66,${C.seeTief});box-shadow:inset 0 0 0 1.5px ${C.flaggold}}
.hmd-stationen{grid-column:1 / -1;padding:14px 14px 6px;border-radius:16px;background:rgba(0,0,0,0.18);border:1px solid rgba(237,187,0,0.35);animation:hmdAuf .2s ease both}
.hmd-station{display:flex;flex-direction:column;gap:9px;padding:0 0 12px;margin-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.08)}
.hmd-station:last-child{border-bottom:none;margin-bottom:0}
.hmd-station-kopf{display:flex;align-items:center;gap:9px;min-width:0}
.hmd-halt{flex:none;width:24px;height:24px;border-radius:999px;background:${C.flaggold};color:${C.seeTief};font-size:12px;font-weight:800;display:flex;align-items:center;justify-content:center}
.hmd-wz{display:inline-flex;align-items:center;gap:8px;min-height:38px;padding:3px 12px 3px 3px;border-radius:12px;border:1px solid rgba(255,255,255,0.13);
  background:linear-gradient(150deg,#1B62AE 0%,#0F4A8A 55%,#0A3A70 100%);color:#FFFFFF;font-size:12.5px;font-weight:700;line-height:1.2;text-align:left;
  box-shadow:inset 0 1px 0 rgba(255,255,255,0.18);transition:filter .12s ease,border-color .15s ease}
.hmd-wz:hover{filter:brightness(1.1);border-color:rgba(237,187,0,0.6)}
.hmd-wz[aria-current="page"]{border-color:${C.flaggold};box-shadow:0 0 0 1.5px ${C.flaggold}}
.hmd-wz-zeichen{flex:none;min-width:30px;height:30px;padding:0 4px;border-radius:9px;background:rgba(255,255,255,0.12);color:${C.flaggold};font-weight:800;
  display:flex;align-items:center;justify-content:center;white-space:nowrap;letter-spacing:-0.02em}

/* Kacheln (Mein Training, Formelsammlung) */
.hmd-kacheln{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.hmd-kachel{display:flex;align-items:center;gap:11px;min-height:54px;padding:8px 12px 8px 8px;border-radius:14px;min-width:0;
  border:1px solid var(--kachel-rand);background:var(--kachel);color:var(--t);text-align:left;transition:border-color .15s ease,transform .12s ease}
.hmd-kachel:hover{border-color:var(--gold);transform:translateY(-1px)}
.hmd-kachel[aria-current="page"]{border-color:${C.flaggold};background:rgba(237,187,0,0.14)}
.hmd-kachel-ik{flex:none;width:38px;height:38px;border-radius:11px;display:flex;align-items:center;justify-content:center;background:var(--karte);border:1px solid var(--kachel-rand);color:var(--gold)}
.hmd-kachel .name{min-width:0;font-size:13px;font-weight:800;line-height:1.22;-webkit-hyphens:auto;hyphens:auto;overflow-wrap:break-word}
.hmd-kachel[data-erst]{background:${NACHT_VERLAUF};border-color:rgba(237,187,0,0.55);color:#FFFFFF}
.hmd-kachel[data-erst] .hmd-kachel-ik{background:${GOLD_VERLAUF};border-color:transparent;color:${C.seeTief}}
.hmd-formeln{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}
.hmd-formel{display:flex;align-items:center;gap:8px;min-height:44px;padding:5px 8px 5px 5px;border-radius:12px;border:1px solid var(--kachel-rand);background:var(--kachel);
  color:var(--t);font-size:12px;font-weight:700;line-height:1.2;text-align:left;min-width:0}
.hmd-formel:hover{border-color:var(--gold)}
.hmd-glyph{flex:none;min-width:32px;height:32px;padding:0 4px;border-radius:9px;display:flex;align-items:center;justify-content:center;white-space:nowrap;
  font-weight:800;letter-spacing:-0.02em;background:${C.seeTief};color:${C.flaggold}}
.hmd[data-modus="hell"] .hmd-glyph{background:${C.himmel};color:${C.see}}
.hmd-zwei{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-width:0}
@media (max-width:1099px){.hmd-konto .art{display:none}}

/* Kurse */
.hmd-lacke{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.hmd-lack{position:relative;isolation:isolate;overflow:hidden;display:flex;flex-direction:column;justify-content:space-between;gap:6px;min-height:84px;
  padding:11px 12px 10px;border-radius:18px;border:1px solid transparent;text-align:left;color:var(--kk-text);
  background:var(--kk-lack) padding-box,var(--kk-rand) border-box;
  box-shadow:0 1px 0 var(--kk-kante) inset,0 18px 34px -20px var(--kk-schatten);transition:transform .18s ease,box-shadow .18s ease}
.hmd-lack::before{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:0;
  background:linear-gradient(118deg,var(--kk-glanz) 0%,transparent 42%),radial-gradient(70% 90% at 92% 100%,var(--kk-schein) 0%,transparent 62%)}
.hmd-lack > *{position:relative;z-index:1}
.hmd-lack:hover{transform:translateY(-2px);box-shadow:0 1px 0 var(--kk-kante) inset,0 24px 40px -18px var(--kk-schatten)}
.hmd-lack[aria-current="page"]{box-shadow:0 0 0 2.5px ${C.flaggold},0 18px 34px -20px var(--kk-schatten)}
.hmd-lack[data-gross]{grid-column:1 / -1;min-height:96px;padding:13px 14px 12px}
.hmd-lack .hmd-motiv{position:absolute;right:-4px;bottom:-6px;width:30%;max-width:78px;height:auto;z-index:0;overflow:visible}
.hmd-lack[data-gross] .hmd-motiv{width:30%;max-width:150px}
.hmd-lack-titel{display:block;max-width:100%;font-size:14px;font-weight:800;letter-spacing:-0.02em;line-height:1.15;color:var(--kk-titel);text-wrap:balance}
.hmd-lack[data-gross] .hmd-lack-titel{font-size:18px;max-width:68%}
.hmd-lack-meta{display:block;max-width:72%;font-size:11px;font-weight:700;line-height:1.3;color:var(--kk-akzent)}
.hmd-lack-balken{display:block;width:96px;max-width:100%;height:3px;margin-top:5px;border-radius:2px;background:var(--kk-spur);overflow:hidden}
.hmd-lack-balken i{display:block;height:100%;border-radius:2px;background:var(--kk-fuellung)}
.hmd-minis{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:10px}
.hmd-mini{display:flex;align-items:center;gap:10px;min-height:52px;padding:6px 10px 6px 6px;border-radius:14px;border:1px solid var(--kachel-rand);background:var(--kachel);
  color:var(--t);text-align:left;min-width:0;transition:border-color .15s ease}
.hmd-mini:hover{border-color:var(--gold)}
.hmd-mini[aria-current="page"]{border-color:${C.flaggold}}
.hmd-mini[aria-disabled="true"]{cursor:default;opacity:.62}
.hmd-mini-zeichen{flex:none;width:40px;height:40px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-weight:800;letter-spacing:-0.03em;line-height:1;
  box-shadow:inset 0 1px 0 rgba(255,255,255,0.25)}

/* Entdecken */
.hmd-entdecken{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px 8px}
.hmd-zeile{display:flex;width:100%;align-items:center;gap:10px;min-height:44px;padding:5px 8px 5px 5px;border-radius:12px;border:none;background:transparent;color:var(--t);
  font-size:13px;font-weight:700;line-height:1.2;text-align:left;min-width:0}
.hmd-zeile:hover{background:var(--hover)}
.hmd-zeile[aria-current="page"]{background:rgba(237,187,0,0.16)}

/* Fußzeile */
.hmd-fuss{display:flex;flex-wrap:wrap;align-items:center;gap:10px 12px;padding-top:18px;border-top:1px solid var(--rand)}
.hmd-fuss .rechts{margin-left:auto;display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.hmd-modi{display:flex;align-items:center;gap:3px;padding:3px;border-radius:999px;border:1px solid var(--kachel-rand);background:var(--kachel)}
.hmd-modi .lab{padding:0 8px 0 10px;font-size:12px;font-weight:700;color:var(--t3)}
.hmd-modi button{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 11px;border-radius:999px;border:none;background:transparent;color:var(--t2);font-size:12px;font-weight:700}
.hmd-modi button:hover{color:var(--t)}
.hmd-modi button[aria-pressed="true"]{background:${GOLD_VERLAUF};color:${C.seeTief}}
.hmd-modi svg{width:14px;height:14px;flex:none}
.hmd-ab{height:36px;padding:0 16px;border-radius:999px;border:1px solid var(--kachel-rand);background:transparent;color:var(--t2);font-size:12.5px;font-weight:700;
  display:inline-flex;align-items:center;gap:7px}
.hmd-ab:hover{border-color:${C.signal};color:var(--t)}
.hmd-claim{width:100%;margin:2px 0 0;text-align:center;font-size:11px;font-weight:600;letter-spacing:.03em;color:var(--t3)}
.hmd-claim b{color:${C.flaggold};font-weight:700}
`;

/* ---------- Modus der Startseite (dunkel | hell | mix) ---------- */
function useModus() {
  const [modus, setModus] = useState(startModus);
  useEffect(() => {
    const h = () => setModus(startModus());
    window.addEventListener(EVENT_START_MODUS, h);
    return () => window.removeEventListener(EVENT_START_MODUS, h);
  }, []);
  return modus;
}

/* ---------- Die großen Kurse: Lack und Goldfolie wie auf der Startseite, mit echtem Stand ---------- */
const sicher = (f) => { try { return f(); } catch (e) { return null; } };
/* Texte hier direkt zweisprachig (Zahlen stecken mitten im Satz – das Wörterbuch kennt diese Sätze nicht) */
const LACK = {
  unterstufe: { farben: GRANAT, Motiv: MotivGeodreieck, stand: unterStand, einheit: ["Lerneinheiten", "units"],
    meta: (s, en) => (en ? `${UNTERSTUFE_ZAHLEN.einheiten} learning units` : `${UNTERSTUFE_ZAHLEN.einheiten} Lerneinheiten`) },
  diffkurs: { farben: SMARAGD, Motiv: MotivTangente, stand: diffStand, einheit: ["Modulen", "modules"],
    meta: (s, en) => (en ? `${s ? s.gesamt : 21} modules in the textbook` : `${s ? s.gesamt : 21} Module im Schulbuch`) },
  vekkurs: { farben: TIEFBLAU, Motiv: MotivEbene, stand: vekStand, einheit: ["Modulen", "modules"],
    meta: (s, en) => (en ? `${s ? s.gesamt : 31} modules in the workbook` : `${s ? s.gesamt : 31} Module im Heft`) },
  geokurs: { farben: AMETHYST, Motiv: MotivDreieck, stand: geoStand, einheit: ["Modulen", "modules"],
    meta: (s, en) => (en ? `${s ? s.gesamt : 25} modules in the textbook` : `${s ? s.gesamt : 25} Module im Schulbuch`) },
  gfs: { farben: LACKSCHWARZ, Motiv: MotivBuehne, stand: gfsStand, einheit: ["Schritten", "steps"], meta: (s, en) => (en ? "7 steps to your talk" : "7 Schritte zur GFS") },
  kiwahl: { farben: NACHTBLAU, Motiv: MotivDialog, stand: kiStand, einheit: ["Lektionen", "lessons"], meta: (s, en) => (en ? "3 paths by age" : "3 Wege nach Alter") },
};
/* Welcher große Kurs passt zur Stufe? Er steht als breite Karte oben. */
const KURS_ZUR_STUFE = { unter: "unterstufe", mittel: "diffkurs", ober: "diffkurs", alle: "diffkurs" };

function LackKarte({ k, gehe, aktuell, gross }) {
  const l = LACK[k.id];
  const f = l.farben;
  const stand = sicher(l.stand);
  const begonnen = !!(stand && stand.fertig > 0);
  const anteil = begonnen ? Math.min(100, Math.round((stand.fertig / stand.gesamt) * 100)) : 0;
  const en = englisch();
  const vars = {
    "--kk-lack": f.lack, "--kk-rand": f.rand, "--kk-glanz": f.glanz, "--kk-schein": f.schein, "--kk-kante": f.kante, "--kk-schatten": f.schatten,
    "--kk-titel": f.titel, "--kk-text": f.text, "--kk-akzent": f.akzent, "--kk-spur": f.spur, "--kk-fuellung": f.fuellung,
  };
  const { Motiv } = l;
  return (
    <button type="button" className="hmd-lack" style={vars} data-kk-hell={f.hell ? "" : undefined} data-hmd-kurs={k.id} data-gross={gross ? "" : undefined} onClick={() => gehe(k.ziel)}
      aria-current={istAktuell(k.ziel, aktuell) ? "page" : undefined} title={begonnen && stand.weiter ? stand.weiter : k.zeile}>
      <span className="hmd-lack-titel">{k.name}</span>
      <span>
        <span className="hmd-lack-meta" data-kein-i18n>{begonnen
          ? (en ? `${stand.fertig} of ${stand.gesamt} ${l.einheit[1]} done` : `${stand.fertig} von ${stand.gesamt} ${l.einheit[0]} geschafft`)
          : l.meta(stand, en)}</span>
        {begonnen && <span className="hmd-lack-balken" role="progressbar" aria-valuemin={0} aria-valuemax={stand.gesamt} aria-valuenow={stand.fertig}><i style={{ width: `${anteil}%` }} /></span>}
        {gross && !begonnen && <span className="hmd-lack-meta" style={{ marginTop: 4, fontWeight: 500, color: "var(--kk-text)" }}>{k.zeile}</span>}
      </span>
      <Motiv id={`hmd-${k.id}`} klasse="hmd-motiv" />
    </button>
  );
}

function MiniKurs({ k, gehe, aktuell }) {
  const st = KURS_STIL[k.id] || { hg: "linear-gradient(155deg,#F1F4F9 0%,#E3E8F2 100%)", zeichen: "…", zFarbe: C.grau };
  return (
    <button type="button" className="hmd-mini" data-hmd-kurs={k.id} onClick={() => { if (!k.bald) gehe(k.ziel); }} aria-disabled={k.bald || undefined}
      aria-current={istAktuell(k.ziel, aktuell) ? "page" : undefined} title={k.zeile}>
      <span className="hmd-mini-zeichen" data-kein-i18n aria-hidden="true"
        data-kk-hell={st.hell ? "" : undefined} style={{ background: st.hg, color: st.zFarbe, fontSize: zeichenGroesse(st.zeichen, st.gross ? 22 : 16), ...(st.rand ? { boxShadow: `inset 0 0 0 1px ${C.linie}` } : null) }}>{st.zeichen}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span className="hmd-zwei" style={{ fontSize: 13, fontWeight: 800, lineHeight: 1.2 }}>{k.name}</span>
        <span className="hmd-zwei" style={{ fontSize: 11, fontWeight: 500, lineHeight: 1.3, color: "var(--t3)", WebkitLineClamp: 1, marginTop: 1 }}>{k.zeile}</span>
      </span>
      {k.bald && <Bald />}
    </button>
  );
}

/* ---------- Mathe-Training: Bereiche als Kacheln, der offene zeigt Stationen und Werkzeuge ---------- */
function MatheTrainingDesktop({ gehe, aktuell, stufe, setzeStufe, zuletzt, aktiv }) {
  const bereiche = trainingsBereiche(stufe);
  const mitWerkzeug = (pruef) => bereiche.find((b) => b.stationen.some((s) => s.werkzeuge.some(pruef)));
  const start = mitWerkzeug((w) => istAktuell(w.ziel, aktuell)) || (zuletzt ? mitWerkzeug((w) => w.ziel.ansicht === zuletzt.ziel.ansicht) : null);
  const [offen, setOffen] = useState(start ? start.id : null);
  const offenIndex = bereiche.findIndex((b) => b.id === offen);
  /* Das Fenster mit den Stationen steht direkt unter der Zeile der offenen Kachel (zwei Kacheln je Zeile) */
  const nachIndex = offenIndex < 0 ? -1 : Math.min(bereiche.length - 1, offenIndex - (offenIndex % 2) + 1);
  const offenerBereich = offenIndex >= 0 ? bereiche[offenIndex] : null;
  const stufeInfo = STUFEN.find((s) => s.id === stufe);
  return (
    <section className="hmd-karte hmd-held hmd-dunkel" data-hmd-abschnitt="schultraining" aria-label={tr("Der Weg zum Abi")}>
      <div className="hmd-kopf-zeile" style={{ alignItems: "flex-end", flexWrap: "wrap", marginBottom: 0 }}>
        <div style={{ minWidth: 0 }}>
          <p className="hmd-kicker">{LEISTE.find((p) => p.id === "schultraining").name}{aktiv && <span className="hmd-punkt" title="Hier bist du gerade" />}</p>
          <p className="hmd-zahlzeile"><span data-kein-i18n>{werkzeugAnzahl(stufe)}</span> <span>Werkzeuge</span><span className="hm-unsichtbar" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}> · {stufeInfo.name}</span></p>
        </div>
        <div role="group" aria-label="Schulstufe wählen" className="hmd-stufen">
          {STUFEN.map((s) => (
            <button key={s.id} type="button" aria-pressed={stufe === s.id} data-kein-scroll data-hmd-stufe={s.id} aria-label={`${s.name}, Klasse ${s.klassen}`}
              onClick={() => { setzeStufe(s.id); setOffen(null); }}>
              <span className="k">{s.kurz}</span><span className="kl" data-kein-i18n>{s.klassen}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="hmd-legende" aria-hidden="true">
        {Object.keys(ETIKETTEN).map((k) => (
          <span key={k} title={ETIKETTEN[k].text}><span style={{ width: 16, height: 4, borderRadius: 2, background: ETIKETT_FARBE[k] }} />{ETIKETTEN[k].name}</span>
        ))}
      </div>
      <div className="hmd-bereiche">
        {bereiche.map((b, i) => {
          const auf = offen === b.id;
          return (
            <React.Fragment key={b.id}>
              <button type="button" className="hmd-bereich" aria-expanded={auf} data-kein-scroll data-hmd-bereich={b.id} data-gold={b.gold ? "" : undefined}
                onClick={() => setOffen(auf ? null : b.id)}>
                <span className="hmd-bereich-bild" title={`${b.stationen.length} ${b.stationen.length === 1 ? "Station" : "Stationen"}`}><BereichBild id={b.id} /></span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span className="hmd-zwei" style={{ fontSize: 14, fontWeight: 800, lineHeight: 1.2, WebkitHyphens: "auto", hyphens: "auto", overflowWrap: "break-word" }}>{TRENNUNG[b.titel] || b.titel}</span>
                  <span style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "var(--t3)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {b.anzahl} <span>{b.anzahl === 1 ? "Werkzeug" : "Werkzeuge"}</span>
                  </span>
                </span>
              </button>
              {i === nachIndex && offenerBereich && (
                <div className="hmd-stationen" data-hmd-stationen={offenerBereich.id}>
                  {offenerBereich.stationen.map((st) => (
                    <div key={st.id} className="hmd-station">
                      {offenerBereich.stationen.length > 1 && (
                        <div className="hmd-station-kopf">
                          <span className="hmd-halt" aria-hidden="true">{st.nr}</span>
                          <span style={{ minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: 13, lineHeight: 1.3 }}>
                            <span style={{ fontWeight: 800 }}>{st.titel}</span>
                            {st.zeile && <span style={{ fontWeight: 500, fontSize: 11.5, color: "var(--t3)" }}> · {st.zeile}</span>}
                          </span>
                        </div>
                      )}
                      <div className="hmd-chips">
                        {st.werkzeuge.map((w) => (
                          <button key={w.id} type="button" className="hmd-wz" onClick={() => gehe(w.ziel)} title={w.zeile} data-hmd-werkzeug={w.ziel.ansicht}
                            aria-current={istAktuell(w.ziel, aktuell) ? "page" : undefined}>
                            <span className="hmd-wz-zeichen" data-kein-i18n aria-hidden="true"
                              style={{ fontSize: zeichenGroesse(w.zeichen, 14), boxShadow: `inset 0 -3px 0 ${ETIKETT_FARBE[w.etikett] || "transparent"}` }}>{w.zeichen}</span>
                            <span>{w.name}</span>
                            {w.etikett && <span className="hm-unsichtbar" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}> · {ETIKETTEN[w.etikett].name}</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
        <button type="button" className="hmd-link" onClick={() => gehe({ ansicht: "start" })}>Alles auf der Startseite <Ikon n="pfeil" g={14} dicke={2.4} /></button>
      </div>
    </section>
  );
}

/* ---------- Dein Schulbuch (Klasse) ---------- */
function Schulbuch({ klasse, ausProfil, waehlen, setWaehlen, klasseSetzen, gehe, aktuell }) {
  const [offen, setOffen] = useState(null);
  const inhalt = klassenInhalt(klasse);
  const zeigeWahl = !klasse || waehlen;
  return (
    <section className="hmd-karte hmd-buch" data-hmd-abschnitt="klasse" aria-label={tr("Dein Schulbuch")}>
      <div className="hmd-kopf-zeile" style={{ marginBottom: 8 }}>
        <div style={{ minWidth: 0 }}>
          <p className="hmd-kicker">{klasse ? <><span>Dein Schulbuch</span><span className="zahl" data-kein-i18n>{inhalt.kapitel.length}</span></> : "Dein Schulbuch"}</p>
          <p style={{ margin: "4px 0 0", fontSize: 19, fontWeight: 900, letterSpacing: "-0.01em", color: C.seeTief }} data-kein-i18n>{tr(klasseLabel(klasse))}</p>
        </div>
        {klasse && !waehlen && (
          <button type="button" className="hmd-link" data-kein-scroll onClick={ausProfil ? () => gehe({ ansicht: "konto" }) : () => setWaehlen(true)}>
            {ausProfil ? "Im Konto ändern" : "Andere Klasse"}
          </button>
        )}
      </div>
      {zeigeWahl ? (
        <KlasseWaehlen setze={klasseSetzen} schulartStart={klasse && klasse.schulart} />
      ) : (
        <>
          {inhalt.kapitel.length === 0 && <p className="hmd-leise">Für diese Klasse sind noch keine Kapitel hinterlegt.</p>}
          {inhalt.kapitel.map((k) => {
            const auf = offen === k.id;
            return (
              <div key={k.id}>
                <button type="button" className="hmd-kapitel" aria-expanded={auf} data-kein-scroll data-hmd-kapitel={k.id} onClick={() => setOffen(auf ? null : k.id)}>
                  <span className="hmd-nr" data-kein-i18n>{k.nr}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>{k.titel}</span>
                  <Pfeil auf={auf} farbe="#7A5800" />
                </button>
                {auf && (
                  <div className="hmd-kapitel-auf">
                    <div className="hmd-kapitel-knoepfe" data-hm-kapitel={k.id}>
                      <button type="button" className="hmd-kapitel-seite" onClick={() => gehe(k.seite)} data-hm-kapitelseite><Ikon n="buch" g={14} /> Kapitelseite</button>
                      <button type="button" className="hmd-dunkel-knopf" onClick={() => gehe(k.trainieren)} data-hm-trainieren><Ikon n="play" g={13} /> Trainieren</button>
                    </div>
                    <div className="hmd-chips">
                      {k.hilfen.map((h) => (
                        <button key={h.id} type="button" className="hmd-chip" onClick={() => { if (!h.bald) gehe(h.ziel); }} aria-disabled={h.bald || undefined}
                          aria-current={istAktuell(h.ziel, aktuell) ? "page" : undefined} title={h.zeile}>{h.name}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {inhalt.kurse.length > 0 && (
            <>
              <p className="hmd-kicker" style={{ margin: "16px 0 8px" }}>Unser Kurs dazu</p>
              <div className="hmd-chips">
                {inhalt.kurse.map((k) => (
                  <button key={k.id} type="button" className="hmd-chip" onClick={() => { if (!k.bald) gehe(k.ziel); }} aria-disabled={k.bald || undefined}
                    aria-current={istAktuell(k.ziel, aktuell) ? "page" : undefined} title={k.zeile}>{k.name}</button>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}

/* ---------- Darstellung: Dunkel | Hell | Mix | FCB | GER ---------- */
function Darstellung({ modus }) {
  const en = englisch();
  return (
    <div className="hmd-modi" role="group" aria-label={en ? "Appearance: dark, light or mix" : "Darstellung: dunkel, hell oder mix"} data-hmd-darstellung data-kein-i18n>
      <span className="lab">{en ? "Appearance" : "Darstellung"}</span>
      {START_MODI.map((m) => (
        <button key={m} type="button" aria-pressed={modus === m} onClick={() => startModusSetzen(m)} data-hmd-modus={m} data-kein-scroll>
          <ModusSymbol m={m} />{(en ? MODUS_NAME_EN : MODUS_NAME)[m]}
        </button>
      ))}
    </div>
  );
}

/* Feine Kurve hinter der Mathilda-Karte (wie in der Kopfleiste) – statt eines Rasters */
function Kurve() {
  return (
    <svg className="hmd-kurve" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true">
      <path d="M-10 296 C 80 286, 140 236, 220 244 S 330 200, 410 176" fill="none" stroke={C.flaggold} strokeWidth="1.4" strokeOpacity="0.32" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/* ---------- Das Desktop-Menü ---------- */
export function DesktopMenue({
  geh, schliessen, aktuell, aktiv, konto, angemeldet, kontoListe, zugang, klasse, ausProfil, waehlen, setWaehlen, klasseSetzen,
  stufe, stufeSetzen, zuletzt, abmeldenFragen, testkonto,
}) {
  const modus = useModus();
  const box = useRef(null);
  const suchOrt = useRef(null);
  const [suche, setSuche] = useState(false);
  const [gescrollt, setGescrollt] = useState(false);
  const en = englisch();
  const kurse = [...KURSE, ...BALD_KURSE];
  const gross = kurse.filter((k) => LACK[k.id]);
  /* Kurse ohne Lack-Kachel (Abi-Zentrum, Pen & Paper, „Bald“) als kleine Karten; darunter die weiteren Lernangebote */
  const klein = kurse.filter((k) => !LACK[k.id]);
  /* Der passende große Kurs steht als breite Karte oben – nur, wenn die Zahl ungerade ist (sonst geht das Raster glatt auf) */
  const breitId = gross.length % 2 === 1 ? (gross.find((k) => k.id === KURS_ZUR_STUFE[stufe]) || gross[0]).id : null;
  const grossSortiert = breitId ? [gross.find((k) => k.id === breitId), ...gross.filter((k) => k.id !== breitId)] : gross;
  const entdecken = entdeckenGruppen();
  const titelVon = (id) => LEISTE.find((p) => p.id === id).name;

  /* Seite dahinter festhalten, Fokus ins Menü – beim Schließen zurück auf den ☰-Knopf */
  useEffect(() => {
    const html = document.documentElement;
    const vorher = html.style.overflow;
    html.style.overflow = "hidden";
    if (box.current) box.current.focus({ preventScroll: true });
    const fokus = (e) => { if (box.current && !box.current.contains(e.target)) box.current.focus({ preventScroll: true }); };
    document.addEventListener("focusin", fokus);
    return () => {
      html.style.overflow = vorher;
      document.removeEventListener("focusin", fokus);
      const knopf = document.querySelector("[data-hm-menue]");
      if (knopf) try { knopf.focus({ preventScroll: true }); } catch (e) { /* egal */ }
    };
  }, []);

  /* Suche öffnen: Eingabefeld fokussieren */
  useEffect(() => {
    if (!suche || !suchOrt.current) return;
    const feld = suchOrt.current.querySelector("input[type=search]");
    if (feld) feld.focus();
  }, [suche]);

  const tasten = (e) => {
    if (e.key === "Escape" && suche) { e.stopPropagation(); setSuche(false); return; }
    const imFeld = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
    if ((e.key === "/" && !imFeld) || ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K"))) { e.preventDefault(); setSuche(true); }
  };

  return (
    <div ref={box} role="dialog" aria-modal="true" aria-label="Menü" tabIndex={-1} className="hmd" data-modus={basisModus(modus)} data-edition={editionVon(modus)} data-hauptmenue data-hm-desktop
      data-sprung="hauptmenue" data-scroll-box data-gescrollt={gescrollt ? "" : undefined} lang="de" onKeyDown={tasten}
      onScroll={(e) => { const g = e.currentTarget.scrollTop > 4; if (g !== gescrollt) setGescrollt(g); }}>
      <style>{CSS}</style>
      <div className="hmd-licht" aria-hidden="true" />
      <div className="hmd-innen">

        {/* Kopfzeile */}
        <div className="hmd-kopf">
          <button type="button" className="hmd-marke" onClick={() => geh({ ansicht: "start" })} aria-label={en ? "Home" : "Zur Startseite"} data-kein-i18n>
            <MarkenLogo groesse={26} grund={modus === "hell" ? "hell" : "dunkel"} />
          </button>
          <div className="hmd-such-ort" ref={suchOrt}>
            <button type="button" className="hmd-such" aria-expanded={suche} aria-haspopup="true" data-hmd-suche data-kein-scroll onClick={() => setSuche(!suche)}>
              <Ikon n="suche" g={20} dicke={2.3} style={{ color: "var(--gold)" }} />
              <span style={{ flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Was möchtest du lernen? Werkzeug, Kapitel, Thema …</span>
              <span className="hmd-taste" aria-hidden="true" data-kein-i18n>/</span>
            </button>
            {suche && (
              <div className="hmd-such-lage" data-hmd-suchfeld>
                <SuchBox gehe={geh} />
              </div>
            )}
          </div>
          {angemeldet ? (
            <button type="button" className="hmd-konto" onClick={() => geh({ ansicht: "konto" })} data-hmd-konto title="Mein Konto">
              <span data-kein-i18n>{(konto.profil && konto.profil.name) || "Mein Konto"}</span>
              <span className="art">· {kontoArt(konto.profil)}</span>
              <span className="hmd-anfang" aria-hidden="true" data-kein-i18n>{anfangVon(konto)}</span>
            </button>
          ) : (
            <button type="button" className="hmd-anmelden" onClick={() => geh(zugang.ziel)} data-hmd-anmelden>{zugang.name}</button>
          )}
          <button type="button" className="hmd-zu" onClick={schliessen} aria-label="Menü schließen" title="Menü schließen" data-hmd-zu data-kein-scroll>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        <div className="hmd-raster">

          {/* ===== A · Mathilda, Weitermachen, Schulbuch, Formelsammlung ===== */}
          <div className="hmd-sp a">
            <section className="hmd-karte hmd-held hmd-dunkel hmd-mathilda" data-hm-mathilda aria-label="Mathilda AI">
              <span className="hmd-schein" aria-hidden="true" />
              <Kurve />
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
                <span className="hmd-avatar"><MathildaBild groesse={124} style={{ display: "block", marginLeft: -28, marginTop: -39 }} /></span>
                <span className="hmd-online" aria-hidden="true" />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 25, fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1 }}><MathildaName dunkel /></span>
                    <span className="hmd-badge" data-gold-bleibt>Deine Tutorin</span>
                  </span>
                  <span style={{ display: "block", fontSize: 13, lineHeight: 1.45, color: "var(--t2)", marginTop: 6 }}>Foto vom Blatt – Mathilda prüft deinen Weg, nicht nur das Ergebnis.</span>
                </span>
              </div>
              <button type="button" className="hmd-gold-knopf" onClick={() => geh(KI_MENUE[0].ziel)} aria-current={istAktuell(KI_MENUE[0].ziel, aktuell) ? "page" : undefined} data-hmd-scannen>
                <Ikon n="kamera" g={22} dicke={2.1} /> {KI_MENUE[0].name}
              </button>
              <div className="hmd-ki-raster">
                {KI_MENUE.slice(1).map((e) => (
                  <button key={e.id} type="button" className="hmd-ki" onClick={() => geh(e.ziel)} title={e.zeile} aria-label={e.name}
                    aria-current={istAktuell(e.ziel, aktuell) ? "page" : undefined}>
                    <Ikon n={KI_IKON[e.id]} g={19} style={{ color: C.flaggold }} />
                    <span style={{ minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.kurz}</span>
                  </button>
                ))}
              </div>
              <button type="button" className="hmd-pp" onClick={() => geh({ ansicht: "penpaperkurs" })} data-hmd-penpaper>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span className="hmd-kicker" style={{ color: "var(--t3)" }}>Pen &amp; Paper · kostenlos</span>
                  <span style={{ display: "block", fontSize: 13.5, fontWeight: 700, marginTop: 3 }}>Sauber aufschreiben in neun Lektionen</span>
                </span>
                <span className="hmd-link">Zum Kurs <Ikon n="pfeil" g={14} dicke={2.4} /></span>
              </button>
            </section>

            {zuletzt && (
              <button type="button" className="hmd-weiter" data-hm-weiter onClick={() => geh(zuletzt.ziel)}>
                <span className="hmd-play" aria-hidden="true"><Ikon n="play" g={18} style={{ marginLeft: 3 }} /></span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span className="hmd-kicker"><span>Weitermachen</span> · <span>{zuletzt.wann}</span></span>
                  <span style={{ display: "block", fontSize: 16, fontWeight: 800, lineHeight: 1.25, marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{zuletzt.name}</span>
                  <span style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--t3)", marginTop: 1 }}>{zuletzt.bereich}</span>
                </span>
                {zuletzt.zeichen && <span className="hmd-wz-gross" aria-hidden="true" data-kein-i18n style={{ fontSize: zeichenGroesse(zuletzt.zeichen, 17) }}>{zuletzt.zeichen}</span>}
              </button>
            )}

            <Schulbuch klasse={klasse} ausProfil={ausProfil} waehlen={waehlen} setWaehlen={setWaehlen} klasseSetzen={klasseSetzen} gehe={geh} aktuell={aktuell} />

            <section className="hmd-karte" data-hmd-abschnitt="mathematik" aria-label={tr(titelVon("mathematik"))}>
              <div className="hmd-kopf-zeile">
                <p className="hmd-kicker">{titelVon("mathematik")}{aktiv === "mathematik" && <span className="hmd-punkt" title="Hier bist du gerade" />}</p>
                <span className="hmd-leise" style={{ fontSize: 12 }}>Bild, Beweis, Beispiel</span>
              </div>
              <div className="hmd-formeln">
                {FORMELN.map((e) => (
                  <button key={e.id} type="button" className="hmd-formel" onClick={() => geh(e.ziel)} title={e.zeile} aria-current={istAktuell(e.ziel, aktuell) ? "page" : undefined}>
                    <span className="hmd-glyph" data-kein-i18n aria-hidden="true" style={{ fontSize: zeichenGroesse(e.zeichen, 13) }}>{e.zeichen}</span>
                    <span className="hmd-zwei">{e.name}</span>
                  </button>
                ))}
              </div>
              <div className="hmd-chips" style={{ marginTop: 10 }}>
                {NACHSCHLAGEN.map((e) => (
                  <button key={e.id} type="button" className="hmd-chip" onClick={() => geh(e.ziel)} title={e.zeile} aria-current={istAktuell(e.ziel, aktuell) ? "page" : undefined}>{e.name}</button>
                ))}
              </div>
            </section>
          </div>

          {/* ===== B · Mathe-Training, Mein Training ===== */}
          <div className="hmd-sp b">
            <MatheTrainingDesktop gehe={geh} aktuell={aktuell} stufe={stufe} setzeStufe={stufeSetzen} zuletzt={zuletzt} aktiv={aktiv === "schultraining"} />

            <section className="hmd-karte" data-hmd-abschnitt="training" aria-label={tr(titelVon("training"))}>
              <div className="hmd-kopf-zeile">
                <p className="hmd-kicker">{titelVon("training")}{aktiv === "training" && <span className="hmd-punkt" title="Hier bist du gerade" />}</p>
                <span className="hmd-leise" style={{ fontSize: 12 }}>Tagesplan, Themen, Wiederholungen</span>
              </div>
              <div className="hmd-kacheln">
                {TRAINING.map((e, i) => (
                  <button key={e.id} type="button" className="hmd-kachel" data-erst={i === 0 ? "" : undefined} onClick={() => geh(e.ziel)} title={e.zeile}
                    aria-current={istAktuell(e.ziel, aktuell) ? "page" : undefined} data-hmd-training={e.id}>
                    <span className="hmd-kachel-ik" aria-hidden="true"><Ikon n={TRAINING_IKON[e.id] || "play"} g={20} /></span>
                    <span className="name">{e.name}<span className="hm-unsichtbar" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}> – {e.zeile}</span></span>
                  </button>
                ))}
              </div>
            </section>

          </div>

          {/* ===== C · Meine Kurse, Mathe entdecken ===== */}
          <div className="hmd-sp c">
            <section className="hmd-karte" data-hm-kurse aria-label={tr("Kurse")}>
              <div className="hmd-kopf-zeile">
                <p className="hmd-kicker"><span>Kurse</span><span className="zahl" data-kein-i18n>{KURSE.length}</span>{aktiv === "kurse" && <span className="hmd-punkt" title="Hier bist du gerade" />}</p>
              </div>
              <div className="hmd-lacke">
                {grossSortiert.map((k) => <LackKarte key={k.id} k={k} gehe={geh} aktuell={aktuell} gross={k.id === breitId} />)}
              </div>
              <div className="hmd-minis">
                {klein.map((k) => <MiniKurs key={k.id} k={k} gehe={geh} aktuell={aktuell} />)}
              </div>
              <div className="hmd-kopf-zeile" style={{ marginTop: 14 }}>
                <p className="hmd-kicker"><span>Weitere Lernangebote</span></p>
              </div>
              <div className="hmd-minis" data-hm-weitere style={{ marginTop: 6 }}>
                {WEITERE_ANGEBOTE.map((k) => <MiniKurs key={k.id} k={k} gehe={geh} aktuell={aktuell} />)}
              </div>
            </section>

            <section className="hmd-karte" data-hmd-abschnitt="entdecken" aria-label={tr(titelVon("entdecken"))}>
              {entdecken.map((g, i) => (
                <div key={g.id} style={i ? { marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--rand)" } : undefined}>
                  <div className="hmd-kopf-zeile" style={{ marginBottom: 8 }}>
                    <p className="hmd-kicker">{i === 0 ? titelVon("entdecken") : g.titel}{i === 0 && aktiv === "entdecken" && <span className="hmd-punkt" title="Hier bist du gerade" />}</p>
                    {i === 0 && <span className="hmd-leise" style={{ fontSize: 12 }}>{g.titel}</span>}
                  </div>
                  <div className="hmd-entdecken">
                    {g.eintraege.map((e) => (
                      <button key={e.id} type="button" className="hmd-zeile" onClick={() => geh(e.ziel)} title={e.zeile} aria-current={istAktuell(e.ziel, aktuell) ? "page" : undefined}>
                        <span className="hmd-glyph" data-kein-i18n aria-hidden="true" style={{ fontSize: zeichenGroesse(e.zeichen, 14) }}>{e.zeichen}</span>
                        <span className="hmd-zwei">{e.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          </div>
        </div>

        {/* Fußzeile: Konto, Darstellung, Abmelden/Anmelden */}
        <div className="hmd-fuss" data-hm-konto>
          {!angemeldet && (
            <button type="button" className="hmd-chip" data-hm-testkonto onClick={testkonto}
              style={{ borderColor: "rgba(237,187,0,0.6)", background: "rgba(237,187,0,0.12)" }} title="Ohne Login ausprobieren – Mein Mathe-Training mit Beispieldaten">
              <span aria-hidden="true" style={{ width: 22, height: 22, borderRadius: 999, background: GOLD_VERLAUF, color: C.seeTief, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800 }}>T</span>
              Test-Account
            </button>
          )}
          {kontoListe.map((e) => (
            <button key={e.id} type="button" className="hmd-chip" onClick={() => geh(e.ziel)} aria-current={istAktuell(e.ziel, aktuell) ? "page" : undefined}
              style={e.gold ? { background: GOLD_VERLAUF, borderColor: "transparent", color: C.seeTief } : undefined}>
              <Ikon n={KONTO_IKON[e.id] || "info"} g={15} style={{ color: e.gold ? C.seeTief : "var(--gold)" }} />{e.name}
            </button>
          ))}
          <div className="rechts">
            <Darstellung modus={modus} />
            {angemeldet ? (
              <button type="button" className="hmd-ab" data-hm-zugang onClick={abmeldenFragen}><Ikon n="raus" g={15} />{zugang.name}</button>
            ) : (
              <button type="button" className="hmd-anmelden" style={{ height: 38, fontSize: 13 }} data-hm-zugang onClick={() => geh(zugang.ziel)}>{zugang.name}</button>
            )}
          </div>
          <p className="hmd-claim" aria-hidden="true" data-kein-i18n>mythosmathe.de · System <b>+</b> Freude <b>=</b> Erfolg</p>
        </div>
      </div>
    </div>
  );
}
