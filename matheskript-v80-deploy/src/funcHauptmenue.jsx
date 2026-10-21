/* ======================================================================
   HAUPTMENÜ in der Kopfleiste (Oberfläche). Daten und Logik: hauptmenue.js.

   EINE Kopfzeile: Logo · Konto-Chip (Anfangsbuchstabe, nur angemeldet) · Menü-Knopf ☰.
   Das ☰-Fenster zeigt alles, was die App hat – kompakt, in Karten auf hellem Grund:
     Suche (Pille)
     Mathilda-Karte (dunkelblau, immer offen): Blatt scannen + Chat, Rechenweg, Textaufgabe, Klausur
     Weitermachen (zuletzt benutztes Werkzeug)
     Klasse 13 (G9) ▾        – Schulbuch-Kapitel und unsere Kurse dazu
     Mathe-Training ▾         – alle Werkzeuge wie auf der Startseite: Stufe → Bereich → Station → Werkzeug
     Meine Kurse              – Karten-Leiste zum Wischen (oder „Alle“ als Raster)
     Mein Training ▾ · Mathe entdecken ▾ · Formelsammlung ▾
     Konto-Karte, Abmelden (mit Bestätigung) bzw. Anmelden und ganz unten „Darstellung“:
     Dunkel | Hell | Mix (dieselbe Wahl wie die Pille auf der Startseite, src/startModus.js).
     Die Kopfleiste selbst hat keinen Modus-Knopf mehr.
   Immer nur ein Abschnitt offen; Klick daneben oder Esc schließt. Das Fenster liegt fest (position: fixed)
   unter dem ☰-Knopf und scrollt in sich.
   ====================================================================== */
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { C } from "./base1.jsx";
import { englisch, tr } from "./i18n.js";
import { useKonto, abmelden, testkontoStarten } from "./konto.js";
import { SuchBox } from "./funcSuche.jsx";
import { SCHULARTEN, klassenBoxen } from "./schulbuch.js";
import { MathildaName } from "./mathildaName.jsx";
import { MathildaBild } from "./funcMathildaSeite.jsx";
import { ETIKETTEN } from "./werkzeuge.js";
import { EVENT_START_MODUS, START_MODI, startModus, startModusSetzen } from "./startModus.js";
import {
  LEISTE, KI_MENUE, TRAINING, KURSE, BALD_KURSE, STUFEN, STUFE_SCHLUESSEL, istStufe, FORMELN, NACHSCHLAGEN,
  kontoEintraege, kontoArt, zugangEintrag, klasseErmitteln, klasseLabel, klassenInhalt, trainingsBereiche, werkzeugAnzahl,
  entdeckenGruppen, zuletztAus, ZULETZT_SCHLUESSEL, aktiverPunkt,
} from "./hauptmenue.js";

const QF = "matheplus-quickfinder";
const lies = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const qfLesen = () => { try { return JSON.parse(lies(QF) || "null"); } catch (e) { return null; } };
const qfSchreiben = (teil) => {
  try { localStorage.setItem(QF, JSON.stringify({ ...(qfLesen() || {}), ...teil, kapitel: null, teil: null })); } catch (e) { /* privat */ }
};

const GOLD_VERLAUF = "linear-gradient(165deg,#FFE58A 0%,#F3C93A 50%,#E2B53C 100%)";
const BLAU_VERLAUF = "linear-gradient(150deg,#1B62AE 0%,#0F4A8A 55%,#0A3A70 100%)";
const NACHT_VERLAUF = `linear-gradient(155deg,#12306E 0%,${C.seeTief} 62%,#091433 100%)`;

const CSS = `
.hm-schleier{position:fixed;inset:0;z-index:80;background:rgba(8,20,52,0.34);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);animation:hmBlende .2s ease both}
.hm-fenster{position:fixed;z-index:81;box-sizing:border-box;background:#F2F5FB;color:${C.tinte};border-radius:22px;padding:10px;
  box-shadow:0 30px 70px -12px rgba(6,16,44,0.55),0 0 0 1px rgba(255,255,255,0.6) inset;overflow-y:auto;overscroll-behavior:contain;
  font-family:Montserrat,system-ui,sans-serif;display:flex;flex-direction:column;gap:8px;transform-origin:calc(100% + 10px) 30px;
  animation:hmAuf .26s cubic-bezier(.2,.85,.25,1) both;scrollbar-width:thin}
@keyframes hmAuf{from{opacity:0;transform:translateY(-6px) scale(.965)}to{opacity:1;transform:none}}
@keyframes hmBlende{from{opacity:0}to{opacity:1}}
@keyframes hmRein{from{opacity:0;transform:translateY(-3px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.hm-fenster,.hm-schleier,.hm-ak-inhalt,.hm-rein{animation:none!important}}
.hm-fenster button{font-family:inherit}
.hm-fenster > *{flex-shrink:0}
.hm-karte{background:${C.weiss};border-radius:16px;box-shadow:0 1px 2px rgba(14,30,74,0.06),0 0 0 1px rgba(14,30,74,0.05)}
.hm-kicker{font-size:10.5px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;color:${C.grau};padding:10px 6px 6px;margin:0}
.hm-rein{animation:hmRein .2s ease both}

/* Kopfzeile: Chip + ☰ */
.hm-menueknopf{width:40px;height:40px;border-radius:999px;border:1.5px solid rgba(255,255,255,0.45);background:transparent;color:#fff;cursor:pointer;
  display:inline-flex;align-items:center;justify-content:center;padding:0;position:relative;z-index:82;transition:background .15s ease,border-color .15s ease}
.hm-menueknopf:hover,.hm-menueknopf[aria-expanded="true"]{background:rgba(255,255,255,0.12);border-color:${C.flaggold}}
.hm-chip{width:40px;height:40px;border-radius:999px;border:2px solid ${C.flaggold};background:${C.seeTief};color:${C.flaggold};cursor:pointer;
  display:inline-flex;align-items:center;justify-content:center;padding:0;font-family:inherit;font-size:17px;font-weight:800;line-height:1;position:relative;z-index:82}
.hm-chip:hover{background:rgba(237,187,0,0.16)}

/* Darstellung: Dunkel | Hell | Mix – ganz unten im Menü */
.hm-darstellung{display:flex;align-items:center;gap:10px;padding:8px 8px 8px 14px}
.hm-darstellung .lab{flex:1;min-width:0;font-size:13.5px;font-weight:700;color:${C.tinte}}
.hm-modi{display:flex;gap:3px;padding:3px;border-radius:999px;background:#E8EEF8}
.hm-modi button{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 11px;border-radius:999px;border:none;background:transparent;cursor:pointer;
  font-size:12.5px;font-weight:700;color:${C.grau};transition:background .15s ease,color .15s ease}
.hm-modi button:hover{color:${C.seeTief}}
.hm-modi button[aria-pressed="true"]{background:${C.seeTief};color:#FFFFFF;box-shadow:0 4px 10px -4px rgba(14,30,74,0.5)}
.hm-modi button[aria-pressed="true"] svg{color:${C.flaggold}}
.hm-modi svg{width:14px;height:14px;flex:none}
@media (max-width:360px){.hm-modi button{padding:0 8px;gap:4px}.hm-darstellung{padding-left:12px}}

/* Suche */
.hm-such{display:flex;width:100%;align-items:center;gap:10px;height:46px;padding:0 14px;border-radius:14px;border:1.5px solid ${C.linie};background:${C.weiss};
  cursor:pointer;color:${C.grau};font-size:14.5px;font-weight:600;text-align:left;transition:border-color .15s ease,box-shadow .15s ease}
.hm-such:hover,.hm-such[aria-expanded="true"]{border-color:${C.seeHell};box-shadow:0 0 0 4px rgba(91,143,209,0.14)}

/* Aufklapp-Abschnitte */
.hm-ak{display:flex;width:100%;align-items:center;gap:12px;text-align:left;padding:10px 12px 10px 10px;border-radius:16px;border:none;background:transparent;
  font-size:15px;font-weight:700;color:${C.tinte};cursor:pointer;min-height:60px}
.hm-ak:hover{background:rgba(232,239,249,0.55)}
.hm-ak[aria-expanded="true"]{border-radius:16px 16px 0 0}
.hm-ak-inhalt{padding:2px 10px 12px;animation:hmRein .2s ease both}
.hm-klasse-karte{background:linear-gradient(180deg,#FFF9E2 0%,#FFF4CC 100%);box-shadow:0 0 0 1.5px rgba(237,187,0,0.62)}
.hm-klasse-karte .hm-ak:hover{background:rgba(237,187,0,0.10)}
.hm-blau-karte{background:${NACHT_VERLAUF};box-shadow:0 10px 24px -10px rgba(8,30,80,0.6);color:#fff;overflow:hidden;position:relative}
.hm-blau-karte .hm-ak{color:#fff}
.hm-blau-karte .hm-ak:hover{background:rgba(255,255,255,0.05)}
.hm-blau-karte .hm-ak-inhalt{background:${C.weiss};color:${C.tinte};padding-top:12px}
.hm-zahl{flex-shrink:0;min-width:24px;height:22px;padding:0 7px;border-radius:999px;background:#EEF2F8;color:${C.grau};font-size:11.5px;font-weight:800;
  display:inline-flex;align-items:center;justify-content:center}
.hm-ikon{flex-shrink:0;width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center}

/* Zeilen */
.hm-eintrag{display:flex;width:100%;align-items:center;gap:11px;text-align:left;padding:9px 10px;border-radius:12px;border:none;background:transparent;
  cursor:pointer;color:${C.tinte}}
.hm-eintrag:hover{background:${C.himmel}}
.hm-eintrag[aria-current="page"]{background:rgba(237,187,0,0.16)}
.hm-zeile{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hm-unsichtbar{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}

/* Mathilda */
.hm-mathilda{position:relative;overflow:hidden;border-radius:20px;padding:14px;color:#fff;
  background:radial-gradient(120% 90% at 100% 0%,rgba(237,187,0,0.28) 0%,rgba(237,187,0,0) 55%),${NACHT_VERLAUF};
  box-shadow:0 14px 30px -12px rgba(8,26,72,0.7),inset 0 0 0 1px rgba(255,255,255,0.08)}
.hm-mathilda::before{content:"";position:absolute;inset:0;pointer-events:none;opacity:.5;
  background-image:linear-gradient(rgba(255,255,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.05) 1px,transparent 1px);background-size:22px 22px;
  -webkit-mask-image:linear-gradient(180deg,#000 0%,transparent 85%);mask-image:linear-gradient(180deg,#000 0%,transparent 85%)}
.hm-mathilda > *{position:relative}
.hm-avatar{flex-shrink:0;width:56px;height:56px;border-radius:999px;background:linear-gradient(160deg,#2A3C66 0%,#141F3C 100%);
  box-shadow:0 0 0 2px ${C.flaggold},0 0 0 5px rgba(237,187,0,0.18),0 8px 18px rgba(0,0,0,0.35);overflow:hidden;display:block}
.hm-online{position:absolute;left:44px;top:44px;width:12px;height:12px;border-radius:999px;background:#38C172;box-shadow:0 0 0 2.5px #0F2150}
.hm-gold-knopf{display:flex;width:100%;align-items:center;justify-content:center;gap:9px;height:46px;border:none;border-radius:14px;cursor:pointer;
  background:${GOLD_VERLAUF};color:${C.seeTief};font-size:15px;font-weight:800;letter-spacing:-0.005em;
  box-shadow:0 8px 18px -8px rgba(237,187,0,0.8),inset 0 1px 0 rgba(255,255,255,0.6),inset 0 -2px 0 rgba(122,88,0,0.25);transition:transform .12s ease,filter .12s ease}
.hm-gold-knopf:hover{filter:brightness(1.04)}
.hm-gold-knopf:active,.hm-ki:active,.hm-kurs:active,.hm-wz:active,.hm-kachel:active{transform:scale(.975)}
.hm-ki{display:flex;align-items:center;gap:9px;min-height:44px;padding:6px 10px;border-radius:12px;cursor:pointer;text-align:left;min-width:0;
  border:1px solid rgba(255,255,255,0.14);background:rgba(255,255,255,0.07);color:#fff;font-size:13px;font-weight:700;transition:background .15s ease,transform .12s ease}
.hm-ki:hover{background:rgba(255,255,255,0.13)}
.hm-ki[aria-current="page"]{border-color:${C.flaggold};background:rgba(237,187,0,0.16)}

/* Kurse */
.hm-kurse{display:flex;gap:8px;overflow-x:auto;scroll-snap-type:x mandatory;padding:2px 10px 12px;margin:0 -10px;scrollbar-width:none;
  -webkit-mask-image:linear-gradient(90deg,transparent 0,#000 10px,#000 calc(100% - 22px),transparent 100%);mask-image:linear-gradient(90deg,transparent 0,#000 10px,#000 calc(100% - 22px),transparent 100%)}
.hm-kurse::-webkit-scrollbar{display:none}
.hm-kurse-raster{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:2px 0 12px}
.hm-kurs{position:relative;flex:0 0 136px;scroll-snap-align:start;display:flex;flex-direction:column;justify-content:space-between;gap:10px;min-height:124px;padding:12px;
  border-radius:16px;border:none;cursor:pointer;text-align:left;overflow:hidden;transition:transform .12s ease,box-shadow .15s ease;
  box-shadow:0 8px 16px -10px rgba(8,26,72,0.55),inset 0 1px 0 rgba(255,255,255,0.22),inset 0 0 0 1px rgba(255,255,255,0.06)}
.hm-kurs:hover{transform:translateY(-1px)}
.hm-kurs[aria-current="page"]{box-shadow:0 0 0 2.5px ${C.flaggold},0 8px 16px -10px rgba(8,26,72,0.55)}
.hm-kurse-raster .hm-kurs{min-height:112px}
.hm-kurs-zeichen{font-size:22px;font-weight:800;letter-spacing:-0.03em;line-height:1}
.hm-zwei{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;-webkit-hyphens:auto;hyphens:auto;overflow-wrap:break-word}
.hm-kopf-link{border:none;background:none;cursor:pointer;color:${C.see};font-size:12.5px;font-weight:700;padding:6px 4px}

/* Mathe-Training */
.hm-stufen{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:3px;padding:3px;border-radius:13px;background:#EEF2F8;margin-bottom:10px}
.hm-stufen button{min-height:40px;padding:3px 1px;border-radius:10px;border:none;cursor:pointer;background:transparent;color:${C.grau};line-height:1.15;transition:background .15s ease}
.hm-stufen button[aria-pressed="true"]{background:${C.weiss};color:${C.seeTief};box-shadow:0 2px 6px rgba(14,30,74,0.15)}
.hm-bereich{display:flex;width:100%;align-items:center;gap:11px;padding:8px 8px 8px 6px;border-radius:14px;border:none;background:transparent;cursor:pointer;text-align:left;color:${C.tinte}}
.hm-bereich:hover{background:${C.himmel}}
.hm-bereich[aria-expanded="true"]{background:${C.himmel}}
.hm-netz{position:relative;margin:4px 0 8px 4px;padding-left:28px}
.hm-netz::before{content:"";position:absolute;left:10px;top:12px;bottom:14px;border-left:3px solid ${C.flaggold};border-radius:2px}
.hm-station{display:flex;align-items:center;gap:9px;margin:10px 0 6px -28px;position:relative}
.hm-station:first-child{margin-top:4px}
.hm-halt{flex-shrink:0;width:23px;height:23px;border-radius:999px;background:${C.flaggold};color:${C.seeTief};font-size:12px;font-weight:800;
  display:inline-flex;align-items:center;justify-content:center;box-shadow:0 0 0 3px ${C.weiss}}
.hm-wz{display:flex;width:100%;align-items:center;gap:10px;margin-top:5px;padding:7px 8px 7px 7px;border-radius:12px;border:none;cursor:pointer;text-align:left;
  background:${BLAU_VERLAUF};color:#fff;transition:transform .12s ease,filter .12s ease;
  box-shadow:0 6px 12px -6px rgba(8,34,78,0.5),inset 0 1px 0 rgba(255,255,255,0.22),inset 0 -2px 0 rgba(0,0,0,0.2)}
.hm-wz:hover{filter:brightness(1.08)}
.hm-wz[aria-current="page"]{box-shadow:0 0 0 2.5px ${C.flaggold},0 6px 12px -6px rgba(8,34,78,0.5)}
.hm-wz-zeichen{flex-shrink:0;min-width:34px;height:34px;padding:0 4px;box-sizing:border-box;border-radius:9px;background:rgba(255,255,255,0.11);
  box-shadow:inset 0 0 0 1px rgba(255,255,255,0.14);color:${C.flaggold};font-weight:800;display:flex;align-items:center;justify-content:center;white-space:nowrap;letter-spacing:-0.02em}

/* Mein Training, Entdecken, Formeln */
.hm-raster{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.hm-kachel{display:flex;flex-direction:column;align-items:flex-start;gap:7px;padding:10px;border-radius:13px;border:1px solid ${C.linie};background:#FAFBFE;
  cursor:pointer;text-align:left;color:${C.tinte};transition:border-color .15s ease,background .15s ease,transform .12s ease;min-width:0}
.hm-kachel:hover{border-color:${C.seeHell};background:${C.weiss}}
.hm-kachel[aria-current="page"]{border-color:${C.flaggold};background:#FFFBEA}
.hm-mini-ikon{width:30px;height:30px;border-radius:9px;background:${C.himmel};color:${C.see};display:flex;align-items:center;justify-content:center;flex-shrink:0}
.hm-glyph{flex-shrink:0;min-width:34px;height:34px;padding:0 4px;box-sizing:border-box;border-radius:10px;background:${C.himmel};color:${C.see};font-weight:800;
  display:flex;align-items:center;justify-content:center;white-space:nowrap;letter-spacing:-0.02em}

/* Konto */
.hm-konto-kopf{display:flex;width:100%;align-items:center;gap:12px;padding:12px;border:none;background:transparent;border-radius:16px;cursor:pointer;text-align:left;color:${C.tinte}}
.hm-konto-kopf:hover{background:rgba(232,239,249,0.55)}
.hm-pillen{display:flex;flex-wrap:wrap;gap:6px;padding:0 12px 12px}
.hm-pille{display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 12px 0 10px;border-radius:999px;border:1px solid ${C.linie};background:#FAFBFE;
  color:${C.tinte};font-size:12.5px;font-weight:700;cursor:pointer;white-space:nowrap}
.hm-pille:hover{border-color:${C.seeHell};background:${C.weiss}}
.hm-pille[aria-current="page"]{border-color:${C.flaggold};background:#FFFBEA}
.hm-zugang{justify-content:center;font-weight:700;color:${C.grau};padding:12px}
.hm-zugang:hover{background:rgba(184,92,46,0.08);color:${C.signal}}
.hm-zugang-an{background:${C.seeTief};color:#fff;justify-content:center;height:46px;font-weight:800}
.hm-zugang-an:hover{background:${C.see}}
`;

/* ---------- Ikonen (Strich, 24er Raster) ---------- */
const IKON = {
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
function Ikon({ n, g = 20, dicke = 1.9, style }) {
  return (
    <svg viewBox="0 0 24 24" width={g} height={g} fill="none" stroke="currentColor" strokeWidth={dicke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, display: "block", ...style }}>
      {IKON[n]}
    </svg>
  );
}
const TRAINING_IKON = { meintraining: "play", warmup: "blitz", fehler: "fehler", plan: "kalender", lernpfad: "pfad", wiederholen: "wiederholen", vorbereiten: "vorbereiten", nachbereiten: "nachbereiten", pruefung: "uhr" };
const KI_IKON = { blatt: "kamera", chat: "chat", weg: "weg", text: "text", briefkasten: "klausur" };
const KONTO_IKON = { konto: "konto", fortschritt: "fortschritt", bericht: "bericht", datenschutz: "schild", kinder: "kinder", klassen: "kinder", schueler: "kinder",
  arbeitsblatt: "blatt", spenden: "herz", impressum: "info", pro: "stern", plan: "stern" };

function Pfeil({ auf, farbe = "currentColor", g = 12 }) {
  return (
    <svg viewBox="0 0 12 12" width={g} height={g} aria-hidden="true" style={{ flexShrink: 0, transition: "transform .2s ease", transform: auf ? "rotate(180deg)" : "none" }}>
      <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke={farbe} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
/* Plus/Minus im goldenen Kreis – wie die Kacheln auf der Startseite */
function GoldPlus({ auf }) {
  return (
    <span aria-hidden="true" style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 999, background: C.flaggold, display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 4px 10px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.5)" }}>
      <svg width="14" height="14" viewBox="0 0 14 14"><path d="M2.8 7h8.4" stroke={C.seeTief} strokeWidth="2.4" strokeLinecap="round" />
        <path d="M7 2.8v8.4" stroke={C.seeTief} strokeWidth="2.4" strokeLinecap="round" style={{ transformBox: "fill-box", transformOrigin: "center", transform: auf ? "scaleY(0)" : "none", transition: "transform .2s ease" }} /></svg>
    </span>
  );
}
/* Kurzsymbol eines Werkzeugs (f′, ×, P(A) …): Schrift wird mit der Länge kleiner */
const zeichenGroesse = (t, gross = 15) => { const n = [...String(t || "")].length; return n <= 2 ? gross : n <= 4 ? gross - 3 : gross - 5; };
function Bald() {
  return <span style={{ flexShrink: 0, fontSize: 9.5, fontWeight: 800, letterSpacing: "0.1em", padding: "3px 7px", borderRadius: 999, background: "rgba(255,255,255,0.85)", color: C.grau }}>BALD</span>;
}

const istAktuell = (ziel, a) => !!(a && ziel && ziel.ansicht === a.ansicht && (!ziel.foto || ziel.foto === a.foto) && (!ziel.seite || ziel.seite === a.seite)
  && (!ziel.bereich || !a.bereich || ziel.bereich === a.bereich));

/* Allgemeine Zeile (Schulbuch-Hilfen, Kurse dazu, Nachschlagen) */
function Eintrag({ e, gehe, aktuell, glyph }) {
  const an = istAktuell(e.ziel, aktuell);
  return (
    <button type="button" className="hm-eintrag" onClick={() => { if (!e.bald) gehe(e.ziel); }} aria-disabled={e.bald || undefined} aria-current={an ? "page" : undefined}
      style={e.bald ? { cursor: "default", opacity: 0.62 } : undefined}>
      {glyph}
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 14, fontWeight: 700, lineHeight: 1.25 }}>{e.name}</span>
        {e.zeile && <span className="hm-zeile" style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.35, color: C.grau, marginTop: 1 }}>{e.zeile}</span>}
      </span>
      {e.bald && <Bald />}
    </button>
  );
}
const Kicker = ({ children, style }) => <p className="hm-kicker" style={style}>{children}</p>;

/* ---------- Bilder für die Bereiche des Mathe-Trainings (weiß/gold auf Dunkelblau) ---------- */
function BereichBild({ id }) {
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
const KURS_STIL = {
  mckurs: { hg: GOLD_VERLAUF, farbe: C.seeTief, zeichen: "Abi", zFarbe: C.seeTief },
  unterstufe: { hg: `linear-gradient(155deg,#C4406A 0%,${C.gruen} 55%,#5A0024 100%)`, farbe: "#fff", zeichen: "5·6", zFarbe: "#FFE58A" },
  diffkurs: { hg: `linear-gradient(155deg,${C.babyblauHell} 0%,${C.babyblau} 55%,${C.babyblauTief} 100%)`, farbe: C.nachtschwarz, zeichen: "f′(x)", zFarbe: C.golddunkel },
  vekkurs: { hg: `linear-gradient(155deg,${C.vkBlau} 0%,${C.vkTief} 60%,${C.vkNacht} 100%)`, farbe: "#fff", zeichen: "ℝ³", zFarbe: C.flaggold },
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
const TRENNUNG = { "Differentialrechnung": "Differential\u00ADrechnung", "Prüfungsmodus": "Prüfungs\u00ADmodus", "Trainingsplan": "Trainings\u00ADplan" };
function KursKarte({ k, gehe, aktuell }) {
  const st = KURS_STIL[k.id] || { hg: "linear-gradient(155deg,#F1F4F9 0%,#E3E8F2 100%)", farbe: C.grau, zeichen: "…", zFarbe: C.hellgrau };
  const an = istAktuell(k.ziel, aktuell);
  return (
    <button type="button" className="hm-kurs" data-hm-kurs={k.id} onClick={() => { if (!k.bald) gehe(k.ziel); }} aria-disabled={k.bald || undefined} aria-current={an ? "page" : undefined}
      aria-label={k.name} style={{ background: st.hg, color: st.farbe, ...(st.rand ? { boxShadow: `inset 0 0 0 1px ${C.linie}, 0 8px 16px -12px rgba(8,26,72,0.4)` } : null), ...(k.bald ? { cursor: "default", opacity: 0.7 } : null) }}>
      <span style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6 }}>
        <span className="hm-kurs-zeichen" data-kein-i18n style={{ color: st.zFarbe, ...(st.gross ? { fontSize: 28 } : null) }}>{st.zeichen}</span>
        {k.bald && <Bald />}
      </span>
      <span style={{ display: "block" }}>
        <span className="hm-zwei" style={{ fontSize: 13.5, fontWeight: 800, lineHeight: 1.2, letterSpacing: "-0.01em" }}>{TRENNUNG[k.name] || k.name}</span>
        <span className="hm-zwei" style={{ fontSize: 11, fontWeight: 500, lineHeight: 1.3, marginTop: 3, opacity: 0.82 }}>{k.zeile}</span>
      </span>
    </button>
  );
}

/* ---------- Klasse: Auswahl, falls noch keine gewählt ist ---------- */
function KlasseWaehlen({ setze, schulartStart }) {
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

/* ---------- Klasse: Schulbuch-Kapitel + unsere Kurse ---------- */
function KlassenFenster({ klasse, ausProfil, gehe, aendern, aktuell }) {
  const [offen, setOffen] = useState(null);
  const inhalt = klassenInhalt(klasse);
  return (
    <>
      <Kicker style={{ paddingTop: 4 }}>Dein Schulbuch</Kicker>
      {inhalt.kapitel.length === 0 && <p style={{ margin: "2px 6px 8px", fontSize: 13, color: C.grau }}>Für diese Klasse sind noch keine Kapitel hinterlegt.</p>}
      {inhalt.kapitel.map((k) => {
        const auf = offen === k.id;
        return (
          <div key={k.id}>
            <button type="button" className="hm-eintrag" onClick={() => setOffen(auf ? null : k.id)} aria-expanded={auf} data-kein-scroll>
              <span className="hm-glyph" data-kein-i18n style={{ fontSize: 12, background: auf ? C.flaggold : "rgba(237,187,0,0.16)", color: C.seeTief }}>{k.nr}</span>
              <span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 700, lineHeight: 1.25 }}>{k.titel}</span>
              <Pfeil auf={auf} farbe={C.see} />
            </button>
            {auf && (
              <div className="hm-rein" style={{ margin: "0 2px 6px 22px", paddingLeft: 8, borderLeft: `3px solid ${C.flaggold}` }}>
                <button type="button" className="hm-gold-knopf" style={{ height: 40, fontSize: 13.5, margin: "4px 0 4px" }} onClick={() => gehe(k.trainieren)}>
                  <Ikon n="play" g={14} /> Dieses Kapitel trainieren
                </button>
                {k.hilfen.map((h) => <Eintrag key={h.id} e={h} gehe={gehe} aktuell={aktuell} />)}
              </div>
            )}
          </div>
        );
      })}
      {(inhalt.kurse.length > 0 || inhalt.bald.length > 0) && <Kicker>Unser Kurs dazu</Kicker>}
      {inhalt.kurse.map((k) => <Eintrag key={k.id} e={k} gehe={gehe} aktuell={aktuell} />)}
      {inhalt.bald.map((k) => <Eintrag key={k.id} e={k} gehe={gehe} />)}
      <div style={{ height: 1, background: "rgba(237,187,0,0.35)", margin: "8px 4px" }} />
      <button type="button" className="hm-eintrag" onClick={ausProfil ? () => gehe({ ansicht: "konto" }) : aendern}>
        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: C.grau }}>{ausProfil ? "Klasse im Konto ändern" : "Andere Klasse wählen"}</span>
      </button>
    </>
  );
}

/* ---------- Mathe-Training: Stufe → Bereich → Station → Werkzeug ---------- */
/* Etikett als farbige Unterkante am Symbol (auf Blau) und in der Legende (auf Weiß) – Farben wie EtikettPille */
const ETIKETT_FARBE = { entdecken: "#FFE58A", rechnen: "#BFD6F5", trainieren: "#FF9EC2" };
const ETIKETT_FARBE_HELL = { entdecken: C.flaggold, rechnen: C.seeHell, trainieren: "#D14D85" };
function MatheTraining({ gehe, aktuell, stufe, setzeStufe }) {
  const bereiche = trainingsBereiche(stufe);
  const aktuellerBereich = bereiche.find((b) => b.stationen.some((s) => s.werkzeuge.some((w) => istAktuell(w.ziel, aktuell))));
  const [offen, setOffen] = useState(aktuellerBereich ? aktuellerBereich.id : null);
  return (
    <>
      <div role="group" aria-label="Schulstufe wählen" className="hm-stufen">
        {STUFEN.map((s) => (
          <button key={s.id} type="button" aria-pressed={stufe === s.id} onClick={() => { setzeStufe(s.id); setOffen(null); }} aria-label={`${s.name}, Klasse ${s.klassen}`}>
            <span style={{ display: "block", fontSize: 12, fontWeight: 800 }}>{s.kurz}</span>
            <span style={{ display: "block", fontSize: 10, fontWeight: 600, opacity: 0.75 }} data-kein-i18n>{s.klassen}</span>
          </button>
        ))}
      </div>
      <div aria-hidden="true" style={{ display: "flex", justifyContent: "center", gap: 14, margin: "-2px 0 8px", fontSize: 11, fontWeight: 700, color: C.grau }}>
        {Object.keys(ETIKETTEN).map((k) => (
          <span key={k} title={ETIKETTEN[k].text} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 14, height: 4, borderRadius: 2, background: ETIKETT_FARBE_HELL[k] }} />{ETIKETTEN[k].name}
          </span>
        ))}
      </div>
      {bereiche.map((b) => {
        const auf = offen === b.id;
        return (
          <div key={b.id} data-hm-bereich={b.id}>
            <button type="button" className="hm-bereich" aria-expanded={auf} data-kein-scroll onClick={() => setOffen(auf ? null : b.id)}>
              <span className="hm-ikon" style={{ width: 42, height: 42, background: b.gold ? `linear-gradient(160deg,#2A3C66,${C.seeTief})` : BLAU_VERLAUF,
                boxShadow: b.gold ? `inset 0 0 0 1.5px ${C.flaggold}` : "inset 0 1px 0 rgba(255,255,255,0.2)" }}><BereichBild id={b.id} /></span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 14.5, fontWeight: 800, lineHeight: 1.2, color: C.seeTief }}>{b.titel}</span>
                <span className="hm-zeile" style={{ fontSize: 11.5, fontWeight: 600, color: C.grau, marginTop: 2 }}>
                  {b.stationen.length} <span>{b.stationen.length === 1 ? "Station" : "Stationen"}</span> · {b.anzahl} <span>{b.anzahl === 1 ? "Werkzeug" : "Werkzeuge"}</span>
                </span>
              </span>
              <Pfeil auf={auf} farbe={C.see} />
            </button>
            {auf && (
              <div className="hm-netz hm-rein">
                {b.stationen.map((st) => (
                  <div key={st.id}>
                    {b.stationen.length > 1 && (
                      <div className="hm-station">
                        <span className="hm-halt" aria-hidden="true">{st.nr}</span>
                        <span style={{ minWidth: 0, lineHeight: 1.2 }}>
                          <span style={{ display: "block", fontSize: 13, fontWeight: 800, color: C.seeTief }}>{st.titel}</span>
                          <span className="hm-zeile" style={{ fontSize: 11, color: C.grau }}>{st.zeile}</span>
                        </span>
                      </div>
                    )}
                    {st.werkzeuge.map((w) => {
                      const an = istAktuell(w.ziel, aktuell);
                      return (
                        <button key={w.id} type="button" className="hm-wz" onClick={() => gehe(w.ziel)} aria-current={an ? "page" : undefined}>
                          <span className="hm-wz-zeichen" data-kein-i18n title={w.etikett ? ETIKETTEN[w.etikett].name : undefined}
                            style={{ fontSize: zeichenGroesse(w.zeichen, 15), boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.14), inset 0 -3px 0 ${ETIKETT_FARBE[w.etikett] || "transparent"}` }}>{w.zeichen}</span>
                          <span style={{ flex: 1, minWidth: 0 }}>
                            <span className="hm-zeile" style={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.25 }}>{w.name}</span>
                            <span className="hm-zeile" style={{ fontSize: 11, fontWeight: 500, lineHeight: 1.3, color: "rgba(255,255,255,0.8)" }}>{w.zeile}</span>
                            {w.etikett && <span className="hm-unsichtbar"> · {ETIKETTEN[w.etikett].name}</span>}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
      <button type="button" className="hm-eintrag" style={{ marginTop: 6, justifyContent: "center", color: C.see }} onClick={() => gehe({ ansicht: "start" })}>
        <span style={{ fontSize: 12.5, fontWeight: 700 }}>Alles auf der Startseite</span><Ikon n="pfeil" g={14} dicke={2.2} />
      </button>
    </>
  );
}

/* ---------- Kopf eines aufklappbaren Abschnitts ---------- */
function Abschnitt({ id, titel, zeile, ikon, zahl, offen, setze, aktiv, art, titelFest, children, ...rest }) {
  const auf = offen === id;
  const blau = art === "blau";
  const karte = art === "gold" ? "hm-karte hm-klasse-karte" : blau ? "hm-karte hm-blau-karte" : "hm-karte";
  return (
    <div className={karte} data-hm-abschnitt={id}>
      {blau && (
        /* Mini-Plotter rechts im Kopf: Raster, f weiß, f′ gold – wie die Schulmathematik-Kachel */
        <svg viewBox="0 0 160 70" preserveAspectRatio="xMaxYMid slice" aria-hidden="true" style={{ position: "absolute", right: 0, top: 0, width: 190, height: 70, opacity: 0.75, pointerEvents: "none",
          WebkitMaskImage: "linear-gradient(90deg, transparent 0%, transparent 30%, #000 85%)", maskImage: "linear-gradient(90deg, transparent 0%, transparent 30%, #000 85%)" }}>
          {Array.from({ length: 9 }, (_, i) => <line key={`v${i}`} x1={i * 20} y1="0" x2={i * 20} y2="70" stroke="rgba(255,255,255,0.06)" />)}
          {Array.from({ length: 4 }, (_, i) => <line key={`h${i}`} x1="0" y1={i * 20 + 5} x2="160" y2={i * 20 + 5} stroke="rgba(255,255,255,0.06)" />)}
          <path d="M20 66 C 45 -14, 70 70, 96 34 S 135 6, 160 4" stroke="rgba(237,187,0,0.75)" strokeWidth="1.8" fill="none" strokeDasharray="4 4" />
          <path d="M14 58 C 40 6, 62 62, 90 40 S 130 10, 160 14" stroke="rgba(255,255,255,0.9)" strokeWidth="2.6" fill="none" strokeLinecap="round" />
          <circle cx="45.5" cy="31" r="3.6" fill={C.seeTief} stroke="#fff" strokeWidth="1.8" />
          <circle cx="73" cy="45" r="3.6" fill={C.seeTief} stroke="#fff" strokeWidth="1.8" />
        </svg>
      )}
      <button type="button" className="hm-ak" data-hm={id} data-kein-scroll aria-expanded={auf} aria-haspopup="true"
        data-aktiv={aktiv ? "" : undefined} onClick={() => setze(auf ? null : id)} style={{ position: "relative" }} {...rest}>
        {ikon}
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: blau ? 16.5 : 15, fontWeight: 800, lineHeight: 1.2, letterSpacing: "-0.01em",
            color: blau ? "#fff" : art === "gold" ? C.seeTief : C.tinte }}>
            {titelFest ? <span data-kein-i18n>{titel}</span> : titel}
            {aktiv && <span aria-hidden="true" title="Hier bist du gerade" style={{ width: 7, height: 7, borderRadius: 999, background: C.flaggold, flexShrink: 0 }} />}
          </span>
          {zeile && <span className="hm-zeile" style={{ fontSize: 12, fontWeight: 500, marginTop: 2, color: blau ? "rgba(255,255,255,0.78)" : art === "gold" ? "#7A5800" : C.grau }}>{zeile}</span>}
        </span>
        {zahl != null && !blau && <span className="hm-zahl" data-kein-i18n style={art === "gold" ? { background: "rgba(237,187,0,0.22)", color: "#7A5800" } : undefined}>{zahl}</span>}
        {blau ? <GoldPlus auf={auf} /> : <Pfeil auf={auf} farbe={art === "gold" ? "#7A5800" : C.see} />}
      </button>
      {auf && <div className="hm-ak-inhalt">{children}</div>}
    </div>
  );
}
const HellIkon = ({ n, gold }) => (
  <span className="hm-ikon" style={gold ? { background: GOLD_VERLAUF, color: C.seeTief, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)" } : { background: C.himmel, color: C.see }}>
    <Ikon n={n} g={21} />
  </span>
);

/* ---------- Darstellung: Dunkel | Hell | Mix (dieselbe Wahl wie die Pille auf der Startseite) ---------- */
/* Der Block ist data-kein-i18n (die Knöpfe sollen beim Umschalten nicht flackern) – deshalb Englisch direkt hier */
const MODUS_NAME = { dunkel: "Dunkel", hell: "Hell", mix: "Mix" };
const MODUS_NAME_EN = { dunkel: "Dark", hell: "Light", mix: "Mix" };
function ModusSymbol({ m }) {
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
function DarstellungWahl() {
  const [modus, setModus] = useState(startModus);
  useEffect(() => {
    const h = () => setModus(startModus());
    window.addEventListener(EVENT_START_MODUS, h);
    return () => window.removeEventListener(EVENT_START_MODUS, h);
  }, []);
  return (
    <div className="hm-karte hm-darstellung" data-hm-darstellung data-kein-i18n>
      <span className="lab">{englisch() ? "Appearance" : "Darstellung"}</span>
      <div className="hm-modi" role="group" aria-label={englisch() ? "Appearance: dark, light or mix" : "Darstellung: dunkel, hell oder mix"}>
        {START_MODI.map((m) => (
          <button key={m} type="button" aria-pressed={modus === m} onClick={() => startModusSetzen(m)} data-hm-modus={m} data-kein-scroll>
            <ModusSymbol m={m} />{(englisch() ? MODUS_NAME_EN : MODUS_NAME)[m]}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- Abmelden mit Bestätigung ---------- */
function AbmeldenFrage({ ja, nein, laeuft }) {
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

/* ---------- Kopfzeile: Konto-Chip (nur angemeldet) + Menü-Knopf ☰ ---------- */
const anfangVon = (konto) => {
  const quelle = (konto.profil && konto.profil.name) || (konto.nutzer && konto.nutzer.email) || "";
  return (String(quelle).trim().charAt(0) || "·").toLocaleUpperCase("de-DE");
};
export function KontoBereich({ offen, setOffen, gehe }) {
  const konto = useKonto();
  const auf = offen === "menue";
  return (
    <>
      <style>{CSS}</style>
      {konto.nutzer && (
        <button type="button" className="hm-chip" style={auf && typeof window !== "undefined" && window.innerWidth >= 900 ? { visibility: "hidden" } : undefined} onClick={() => { setOffen(null); gehe && gehe({ ansicht: "konto" }); }}
          aria-label="Mein Konto" title="Mein Konto" data-kein-scroll data-kein-i18n data-hm-chip>{anfangVon(konto)}</button>
      )}
      <button type="button" className="hm-menueknopf" onClick={() => setOffen(auf ? null : "menue")} aria-expanded={auf} aria-haspopup="true"
        aria-label="Menü" title="Menü" data-kein-scroll data-hm-menue>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          {auf ? <><path d="M6 6l12 12" /><path d="M18 6L6 18" /></> : <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>}
        </svg>
      </button>
    </>
  );
}

/* ---------- Lage des Fensters: fest unter dem ☰, rechtsbündig, nie breiter als der Bildschirm ---------- */
function useLage(anker, istOffen) {
  const [lage, setLage] = useState(null);
  useLayoutEffect(() => {
    if (!istOffen) { setLage(null); return undefined; }
    const rechne = () => {
      const a = anker.current;
      if (!a) return;
      const r = a.getBoundingClientRect();
      const vw = document.documentElement.clientWidth || window.innerWidth;
      const vh = window.innerHeight;
      const breite = Math.min(vw >= 900 ? 470 : 410, vw - 24);
      /* Desktop: das Fenster beginnt ganz oben und sitzt links neben dem ×-Knopf (überdeckt den Konto-Chip) – mehr Platz nach unten.
         Handy: wie bisher unter dem Knopf, rechtsbündig. */
      const knopf = vw >= 900 ? document.querySelector("[data-hm-menue]") : null;
      if (knopf) {
        const k = knopf.getBoundingClientRect();
        const rechts = Math.max(12, vw - k.left + 10);
        setLage({ top: 10, right: rechts, width: Math.min(breite, vw - rechts - 12), maxHeight: vh - 20 });
        return;
      }
      const top = Math.max(8, Math.min(r.top + 4, vh - 260));
      let rechts = vw - r.right + 12;
      rechts = Math.max(12, Math.min(rechts, vw - breite - 12));
      setLage({ top, right: rechts, width: breite, maxHeight: vh - top - 12 });
    };
    rechne();
    window.addEventListener("resize", rechne);
    return () => window.removeEventListener("resize", rechne);
  }, [istOffen]);
  return lage;
}

/* ---------- Das Menü (Fenster hinter ☰) ---------- */
export function HauptMenue({ gehe, ansicht, foto, seite, offen, setOffen }) {
  const konto = useKonto();
  const anker = useRef(null);
  const [qf, setQf] = useState(qfLesen);
  const [abschnitt, setAbschnitt] = useState(null);
  const [waehlen, setWaehlen] = useState(false);
  const [frage, setFrage] = useState(false);
  const [laeuft, setLaeuft] = useState(false);
  const [alleKurse, setAlleKurse] = useState(false);
  const ausProfil = !!(konto.profil && konto.profil.schulform && konto.profil.klasse);
  const klasse = klasseErmitteln(konto.profil, qf);
  const klassenStufe = klasse ? klassenInhalt(klasse).stufe : null;
  const [stufeWahl, setStufeWahl] = useState(null);
  const gespeichert = lies(STUFE_SCHLUESSEL);
  const stufe = stufeWahl || klassenStufe || (istStufe(gespeichert) ? gespeichert : "alle");
  const aktiv = aktiverPunkt(ansicht, seite || foto);
  const istOffen = offen === "menue";
  const lage = useLage(anker, istOffen);
  const zuletzt = istOffen ? zuletztAus(lies(ZULETZT_SCHLUESSEL)) : null;

  useEffect(() => {
    if (!istOffen) { setAbschnitt(null); setWaehlen(false); setAlleKurse(false); setStufeWahl(null); return undefined; }
    setQf(qfLesen());   // Quickfinder auf der Startseite könnte die Klasse inzwischen geändert haben
    const t = (e) => { if (e.key === "Escape") setOffen(null); };
    window.addEventListener("keydown", t);
    return () => window.removeEventListener("keydown", t);
  }, [istOffen]);

  const geh = (ziel) => { setOffen(null); gehe(ziel); };
  const raus = async () => {
    setLaeuft(true);
    try { await abmelden(); } catch (e) { /* trotzdem schließen */ }
    setLaeuft(false); setFrage(false); setOffen(null);
    gehe({ ansicht: "start" });
  };
  const aktuell = { ansicht, foto, seite };
  const klasseSetzen = (schulart, box) => { qfSchreiben({ schulart, klasse: box }); setQf(qfLesen()); setWaehlen(false); setStufeWahl(null); };
  const stufeSetzen = (s) => { setStufeWahl(s); try { localStorage.setItem(STUFE_SCHLUESSEL, s); } catch (e) { /* privat */ } };
  const angemeldet = !!konto.nutzer;
  const kontoListe = kontoEintraege(konto.profil, angemeldet);
  const zugang = zugangEintrag(angemeldet);
  const kurse = [...KURSE, ...BALD_KURSE];
  const entdecken = entdeckenGruppen();
  const titelVon = (id) => LEISTE.find((p) => p.id === id).name;

  return (
    <div ref={anker} style={{ position: "relative", height: 0 }}>
      <style>{CSS}</style>
      {istOffen && lage && (
        <>
          <div className="hm-schleier" onClick={() => setOffen(null)} aria-hidden="true" />
          <div role="dialog" aria-label="Menü" data-sprung="hauptmenue" data-scroll-box className="hm-fenster hm-menue" data-hauptmenue lang="de"
            style={{ top: lage.top, right: lage.right, width: lage.width, maxHeight: lage.maxHeight }}>

            {/* 1 · Suche */}
            <div>
              <button type="button" className="hm-such" data-hm="suche" data-kein-scroll aria-expanded={abschnitt === "suche"} aria-haspopup="true"
                onClick={() => setAbschnitt(abschnitt === "suche" ? null : "suche")}>
                <Ikon n="suche" g={18} dicke={2.2} style={{ color: C.see }} />
                <span style={{ flex: 1, minWidth: 0 }}>Was möchtest du lernen?</span>
                <Pfeil auf={abschnitt === "suche"} farbe={C.see} />
              </button>
              {abschnitt === "suche" && <div className="hm-ak-inhalt hm-karte" style={{ marginTop: 6, padding: 8 }}><SuchBox gehe={geh} /></div>}
            </div>

            {/* 2 · Mathilda */}
            <section className="hm-mathilda" data-hm-mathilda aria-label="Mathilda AI">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, position: "relative" }}>
                <span className="hm-avatar"><MathildaBild groesse={96} style={{ display: "block", marginLeft: -22, marginTop: -30 }} /></span>
                <span className="hm-online" aria-hidden="true" />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1 }}><MathildaName dunkel /></span>
                    <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: C.flaggold, border: "1px solid rgba(237,187,0,0.55)", borderRadius: 999, padding: "2px 7px" }}>Deine Tutorin</span>
                  </span>
                  <span style={{ display: "block", fontSize: 12.5, lineHeight: 1.4, color: "rgba(255,255,255,0.8)", marginTop: 4 }}>Foto vom Blatt – Mathilda prüft deinen Weg, nicht nur das Ergebnis.</span>
                </span>
              </div>
              <button type="button" className="hm-gold-knopf" onClick={() => geh(KI_MENUE[0].ziel)} aria-current={istAktuell(KI_MENUE[0].ziel, aktuell) ? "page" : undefined}>
                <Ikon n="kamera" g={19} dicke={2.1} /> {KI_MENUE[0].name}
              </button>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 6, marginTop: 8 }}>
                {KI_MENUE.slice(1).map((e) => (
                  <button key={e.id} type="button" className="hm-ki" onClick={() => geh(e.ziel)} title={e.zeile} aria-label={e.name}
                    aria-current={istAktuell(e.ziel, aktuell) ? "page" : undefined}>
                    <Ikon n={KI_IKON[e.id]} g={19} style={{ color: C.flaggold }} />
                    <span className="hm-zeile" style={{ minWidth: 0 }}>{e.kurz}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* 3 · Weitermachen */}
            {zuletzt && (
              <button type="button" className="hm-karte hm-eintrag" data-hm-weiter onClick={() => geh(zuletzt.ziel)} style={{ padding: "10px 12px", boxShadow: `0 0 0 1.5px ${C.flaggold}`, background: "#FFFCF0" }}>
                <span aria-hidden="true" style={{ flexShrink: 0, width: 38, height: 38, borderRadius: 999, background: GOLD_VERLAUF, color: C.seeTief, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Ikon n="play" g={16} style={{ marginLeft: 2 }} />
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8A6A00" }}>Weitermachen</span>
                  <span className="hm-zeile" style={{ fontSize: 14.5, fontWeight: 800, lineHeight: 1.25 }}>{zuletzt.name}</span>
                  <span className="hm-zeile" style={{ fontSize: 11.5, color: C.grau }}><span>{zuletzt.bereich}</span> · <span>{zuletzt.wann}</span></span>
                </span>
                <Ikon n="pfeil" g={18} dicke={2.2} style={{ color: "#8A6A00" }} />
              </button>
            )}

            {/* 4 · Klasse */}
            <Abschnitt id="klasse" art="gold" titel={tr(klasseLabel(klasse))} zeile={klasse ? <><span>Dein Schulbuch</span> · {klassenInhalt(klasse).kapitel.length} <span>Kapitel</span></> : "Klasse wählen – dann passt alles"}
              ikon={<HellIkon n="buch" gold />}
              offen={abschnitt} setze={setAbschnitt} titelFest>
              {(!klasse || waehlen)
                ? <KlasseWaehlen setze={klasseSetzen} schulartStart={klasse && klasse.schulart} />
                : <KlassenFenster klasse={klasse} ausProfil={ausProfil} gehe={geh} aendern={() => setWaehlen(true)} aktuell={aktuell} />}
            </Abschnitt>

            {/* 5 · Mathe-Training */}
            <Abschnitt id="schultraining" art="blau" titel={titelVon("schultraining")} aktiv={aktiv === "schultraining"}
              zeile={<>{werkzeugAnzahl(stufe)} <span>Werkzeuge</span> · <span>{STUFEN.find((s) => s.id === stufe).name}</span></>}
              ikon={<span className="hm-ikon" style={{ background: "rgba(255,255,255,0.1)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.16)" }}><BereichBild id="analysis" /></span>}
              offen={abschnitt} setze={setAbschnitt}>
              <MatheTraining gehe={geh} aktuell={aktuell} stufe={stufe} setzeStufe={stufeSetzen} />
            </Abschnitt>

            {/* 6 · Meine Kurse (Karten-Leiste) */}
            <div className="hm-karte" data-hm-kurse style={{ padding: "2px 10px 0" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Kicker style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  Meine Kurse <span className="hm-zahl" data-kein-i18n style={{ letterSpacing: 0 }}>{KURSE.length}</span>
                  {aktiv === "kurse" && <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: 999, background: C.flaggold }} />}
                </Kicker>
                <button type="button" className="hm-kopf-link" onClick={() => setAlleKurse(!alleKurse)} aria-pressed={alleKurse} data-hm-kurse-alle>
                  {alleKurse ? "Als Leiste" : "Alle zeigen"}
                </button>
              </div>
              <div className={alleKurse ? "hm-kurse-raster" : "hm-kurse"}>
                {kurse.map((k) => <KursKarte key={k.id} k={k} gehe={geh} aktuell={aktuell} />)}
              </div>
            </div>

            {/* 7 · Mein Training */}
            <Abschnitt id="training" titel={titelVon("training")} zeile="Tagesplan, Themen, Wiederholungen" ikon={<HellIkon n="ziel" />} zahl={TRAINING.length}
              offen={abschnitt} setze={setAbschnitt} aktiv={aktiv === "training"}>
              <button type="button" className="hm-eintrag" onClick={() => geh(TRAINING[0].ziel)} aria-current={istAktuell(TRAINING[0].ziel, aktuell) ? "page" : undefined}
                style={{ background: C.seeTief, color: "#fff", padding: "11px 12px", marginBottom: 6 }}>
                <span aria-hidden="true" style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 999, background: GOLD_VERLAUF, color: C.seeTief, display: "flex", alignItems: "center", justifyContent: "center" }}><Ikon n="play" g={14} style={{ marginLeft: 2 }} /></span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 14.5, fontWeight: 800 }}>{TRAINING[0].name}</span>
                  <span className="hm-zeile" style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>{TRAINING[0].zeile}</span>
                </span>
                <Ikon n="pfeil" g={16} dicke={2.2} style={{ color: C.flaggold }} />
              </button>
              <div className="hm-raster">
                {TRAINING.slice(1).map((e) => (
                  <button key={e.id} type="button" className="hm-kachel" onClick={() => geh(e.ziel)} aria-current={istAktuell(e.ziel, aktuell) ? "page" : undefined}
                    title={e.zeile} style={{ flexDirection: "row", alignItems: "center", gap: 8, padding: "8px 9px", minHeight: 50 }}>
                    <Ikon n={TRAINING_IKON[e.id]} g={18} style={{ color: C.see }} />
                    <span className="hm-zwei" style={{ fontSize: 12.5, fontWeight: 800, lineHeight: 1.2, overflowWrap: "normal" }}>{TRENNUNG[e.name] || e.name}<span className="hm-unsichtbar"> – {e.zeile}</span></span>
                  </button>
                ))}
              </div>
            </Abschnitt>

            {/* 8 · Mathe entdecken */}
            <Abschnitt id="entdecken" titel={titelVon("entdecken")} zeile="Herleiten und Wettbewerbe" ikon={<HellIkon n="kompass" />}
              zahl={entdecken.reduce((n, g) => n + g.eintraege.length, 0)} offen={abschnitt} setze={setAbschnitt} aktiv={aktiv === "entdecken"}>
              {entdecken.map((g, i) => (
                <div key={g.id}>
                  <Kicker style={{ display: "flex", alignItems: "center", gap: 7, paddingTop: i ? 12 : 4 }}>
                    <span className="hm-halt" aria-hidden="true" style={{ width: 19, height: 19, fontSize: 10.5, boxShadow: "none" }}>{i + 1}</span>{g.titel}
                  </Kicker>
                  {g.eintraege.map((e) => (
                    <Eintrag key={e.id} e={e} gehe={geh} aktuell={aktuell}
                      glyph={<span className="hm-glyph" data-kein-i18n style={{ fontSize: zeichenGroesse(e.zeichen, 14) }}>{e.zeichen}</span>} />
                  ))}
                </div>
              ))}
            </Abschnitt>

            {/* 9 · Formelsammlung */}
            <Abschnitt id="mathematik" titel={titelVon("mathematik")} zeile="Bild, Beweis, Beispiel"
              ikon={<span className="hm-ikon" data-kein-i18n style={{ background: C.himmel, color: C.see, fontSize: 21, fontWeight: 800 }}>π</span>}
              zahl={FORMELN.length} offen={abschnitt} setze={setAbschnitt} aktiv={aktiv === "mathematik"}>
              <div className="hm-raster">
                {FORMELN.map((e) => (
                  <button key={e.id} type="button" className="hm-kachel" style={{ flexDirection: "row", alignItems: "center", gap: 9, padding: "8px 9px" }}
                    onClick={() => geh(e.ziel)} title={e.zeile}>
                    <span className="hm-glyph" data-kein-i18n style={{ minWidth: 30, height: 30, borderRadius: 9, fontSize: zeichenGroesse(e.zeichen, 13) }}>{e.zeichen}</span>
                    <span className="hm-zwei" style={{ fontSize: 12.5, fontWeight: 700, lineHeight: 1.2 }}>{e.name}</span>
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 6 }}>
                {NACHSCHLAGEN.map((e) => <Eintrag key={e.id} e={e} gehe={geh} aktuell={aktuell} />)}
              </div>
            </Abschnitt>

            {/* 10 · Konto */}
            <div className="hm-karte" data-hm-konto>
              {angemeldet ? (
                <button type="button" className="hm-konto-kopf" onClick={() => geh({ ansicht: "konto" })}>
                  <span aria-hidden="true" data-kein-i18n style={{ flexShrink: 0, width: 42, height: 42, borderRadius: 999, background: C.seeTief, color: C.flaggold, border: `2px solid ${C.flaggold}`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800 }}>{anfangVon(konto)}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span className="hm-zeile" data-kein-i18n style={{ fontSize: 15, fontWeight: 800 }}>{(konto.profil && konto.profil.name) || (konto.nutzer && konto.nutzer.email) || "Mein Konto"}</span>
                    <span className="hm-zeile" style={{ fontSize: 12, color: C.grau }}>{kontoArt(konto.profil)}</span>
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.see, display: "flex", alignItems: "center", gap: 2 }}>Mein Konto<Ikon n="pfeil" g={14} dicke={2.2} /></span>
                </button>
              ) : (
                <>
                  <Kicker style={{ padding: "12px 12px 8px" }}>Konto</Kicker>
                  {/* Test-Account: ein Klick, kein Login – Schülerprofil nur in diesem Browser, mit Beispiel-Lernstand für Mein Mathe-Training */}
                  <button type="button" className="hm-eintrag" data-hm-testkonto onClick={() => { testkontoStarten(); import("./funcMeinTraining.jsx").then((m) => m.testdatenEinspielen()).catch(() => {}); geh({ ansicht: "meintraining" }); }}
                    style={{ margin: "0 10px 8px", width: "calc(100% - 20px)", padding: "10px 12px", background: "#FFFBEA", boxShadow: `0 0 0 1.5px ${C.flaggold}` }}>
                    <span aria-hidden="true" style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 999, background: GOLD_VERLAUF, color: C.seeTief, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800 }}>T</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", fontSize: 14.5, fontWeight: 800 }}>Test-Account</span>
                      <span className="hm-zeile" style={{ fontSize: 12, color: C.grau }}>Ohne Login ausprobieren – Mein Mathe-Training mit Beispieldaten</span>
                    </span>
                    <Ikon n="pfeil" g={16} dicke={2.2} style={{ color: "#8A6A00" }} />
                  </button>
                </>
              )}
              <div className="hm-pillen">
                {kontoListe.filter((e) => e.id !== "konto").map((e) => (
                  <button key={e.id} type="button" className="hm-pille" onClick={() => geh(e.ziel)} aria-current={istAktuell(e.ziel, aktuell) ? "page" : undefined}
                    style={e.gold ? { background: GOLD_VERLAUF, borderColor: "transparent", color: C.seeTief } : undefined}>
                    <Ikon n={KONTO_IKON[e.id] || "info"} g={15} style={{ color: e.gold ? C.seeTief : C.see }} />{e.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 11 · Ganz unten: Abmelden bzw. Anmelden */}
            <button type="button" className={"hm-eintrag hm-karte " + (angemeldet ? "hm-zugang" : "hm-zugang-an")} data-hm-zugang
              onClick={() => { if (zugang.aktion === "abmelden") { setOffen(null); setFrage(true); } else geh(zugang.ziel); }}>
              <Ikon n={angemeldet ? "raus" : "rein"} g={18} />{zugang.name}
            </button>
            {/* 12 · Ganz unten: Darstellung dunkel | hell | mix (statt eines Knopfs in der Kopfleiste) */}
            <DarstellungWahl />
            <p aria-hidden="true" data-kein-i18n style={{ margin: "2px 0 4px", textAlign: "center", fontSize: 11, fontWeight: 600, color: C.hellgrau, letterSpacing: "0.03em" }}>
              mythosmathe.de · System <span style={{ color: C.flaggold }}>+</span> Freude <span style={{ color: C.flaggold }}>=</span> Erfolg
            </p>
          </div>
        </>
      )}
      {frage && <AbmeldenFrage ja={raus} nein={() => setFrage(false)} laeuft={laeuft} />}
    </div>
  );
}
