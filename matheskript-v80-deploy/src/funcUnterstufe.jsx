/* ============================================================
   Modul Unterstufe – Klasse 5 und 6, der ganze Stoff als Kurs.
   Gestaltung „Lack und Goldfolie“ (Palette GRANAT, Motiv Geodreieck), Bausteine aus funcKursKopf.jsx.

   Übersicht:   Kopf · Klassenwahl (5 | 6) · Fortschrittskarte der Klasse · Kapitel mit Lerneinheiten
   Lerneinheit: Darum geht's · Verstehen (Text, Skizze) · Beispiel Schritt für Schritt · Merke · Typischer Fehler ·
                Probier es gleich (Aufgaben aus arbeitsblatt.js mit Lösung) · Üben (Werkzeuge mit Aufgabentyp,
                Kopfrechen-Trainer eingebettet, Seiten) · Kann ich das? (drei Haken = geschafft) · Weiter

   Daten: unterstufeDaten.js (+ 5/6). Speicher: localStorage mm_unterstufe
   { gelesen: {[id]: true}, haken: {[id]: [bool, bool, bool]}, zuletzt: id } – Stand für die Kachel in kursStand.js.
   Pfade: /unterstufe, /unterstufe/klasse-5, /unterstufe/<einheit> (seite/setSeite aus func10.jsx).
   ============================================================ */
import React, { useEffect, useMemo, useState } from "react";
import { C } from "./base1.jsx";
import { MS } from "./mathText.jsx";
import { WERKZEUGE } from "./werkzeuge.js";
import { springe } from "./sprung.js";
import { uebenWunschSetzen } from "./uebenWunsch.js";
import { aufgabeAus } from "./arbeitsblatt.js";
import { GRANAT, GOLD_VERLAUF } from "./kursFarben.js";
import { MotivGeodreieck } from "./funcKursMotive.jsx";
import { KursKopf, FortschrittKarte, ModulKarte, ModulListe, Hinweis, IconBuch, IconAufgabe, IconWerkzeug, kursVars } from "./funcKursKopf.jsx";
import { UnterBild } from "./funcUnterstufeBilder.jsx";
import { ExternSchutz } from "./funcExtern.jsx";
import {
  UNTERSTUFE_KLASSEN, UNTERSTUFE_EINHEITEN, UNTERSTUFE_INFO, UNTERSTUFE_ZAHLEN, einheitVon, klasseVon, naechsteEinheit, vorigeEinheit, einheitGeschafft, unterstufeStand,
} from "./unterstufeDaten.js";

const KopfTrainer = React.lazy(() => import("./func14.jsx").then((m) => ({ default: m.KopfTrainer })));
const TRAINER_NAME = { plusminus: "Plus und Minus", multiplizieren: "Multiplizieren", potenzen: "Quadrate und Wurzeln", primzahlen: "Primzahlen", primfaktoren: "Primfaktoren", division: "Schriftlich teilen", bruchrechnen: "Bruchrechnung" };
const TRAINER_ZEICHEN = { plusminus: "+ −", multiplizieren: "7·8", potenzen: "12²", primzahlen: "13", primfaktoren: "2·3·7", division: "÷", bruchrechnen: "¾" };

/* ---------- Speicher ---------- */
const SCHLUESSEL = "mm_unterstufe";
const lies = () => { try { return JSON.parse(localStorage.getItem(SCHLUESSEL) || "{}") || {}; } catch (e) { return {}; } };
const schreib = (s) => { try { localStorage.setItem(SCHLUESSEL, JSON.stringify(s)); } catch (e) { /* kein Speicher */ } };
const nachOben = () => springe("unterstufe-seite", () => window.scrollTo({ top: 0, behavior: "auto" }));

/* ---------- Stil ---------- */
const STIL_ID = "us-stil";
const STIL = `
  .us-tabs{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:0 0 18px}
  .us-tab{display:flex;flex-direction:column;align-items:flex-start;gap:1px;padding:9px 13px;border-radius:14px;border:1px solid ${C.linie};background:${C.weiss};cursor:pointer;font-family:inherit;text-align:left;min-width:0;
    box-shadow:0 1px 2px rgba(15,26,51,0.04);transition:transform .15s ease,box-shadow .15s ease}
  .us-tab b{font-size:15px;font-weight:800;letter-spacing:-0.02em;color:${C.tinte};white-space:nowrap}
  .us-tab span{font-size:11px;color:${C.grau};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
  .us-tab[aria-pressed="true"]{border-color:transparent;background:var(--ks-dunkel);box-shadow:0 1px 0 rgba(255,255,255,0.14) inset,0 14px 30px -16px rgba(58,0,25,0.7)}
  .us-tab[aria-pressed="true"] b{color:${C.weiss}}.us-tab[aria-pressed="true"] span{color:rgba(255,255,255,0.78)}
  .us-tab:focus-visible{outline:3px solid ${C.flaggold};outline-offset:3px}
  .us-karte{overflow-wrap:break-word;hyphens:auto;-webkit-hyphens:auto;background:${C.weiss};border:1px solid ${C.linie};border-radius:20px;padding:18px 18px 16px;margin:0 0 14px;box-shadow:0 1px 2px rgba(15,26,51,0.04),0 8px 22px -16px rgba(15,26,51,0.18)}
  .us-kicker{margin:0 0 10px;font-size:11.5px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:#7A0032}
  .us-text{margin:0 0 12px;font-size:15.5px;line-height:1.7;color:${C.tinte}}
  .us-text:last-child{margin-bottom:0}
  .us-text b{font-weight:700;color:#3A0019}
  .us-liste{margin:0 0 12px;padding-left:20px;font-size:15px;line-height:1.65;color:${C.tinte}}
  .us-liste li{margin-bottom:6px}
  .us-tabelle{width:100%;border-collapse:separate;border-spacing:0;margin:4px 0 14px;font-size:14px;line-height:1.5}
  .us-tabelle th,.us-tabelle td{padding:7px 10px;border-bottom:1px solid ${C.linie};text-align:left;vertical-align:top}
  .us-tabelle th{font-weight:800;color:#3A0019;background:#FFF5F8;border-bottom:2px solid #F2C14E}
  .us-tabelle tr:last-child td{border-bottom:none}
  .us-formel{margin:6px 0 14px;padding:12px 14px;border-radius:14px;background:${C.sand};font-size:17px;line-height:2;color:${C.tinte};overflow-x:auto}
  .us-bild{margin:4px 0 14px;padding:10px 8px 6px;border-radius:16px;background:${C.sand}}
  .us-ziel{margin:0;font-size:16px;line-height:1.6;font-weight:600;color:${C.tinte}}
  .us-schritt{display:flex;gap:12px;align-items:flex-start;padding:10px 0;border-top:1px dashed ${C.linie};font-size:15px;line-height:1.65;color:${C.tinte}}
  .us-schritt i{flex:none;display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:9px;font-style:normal;font-weight:800;font-size:12.5px;background:#5A0024;color:#FFD66B}
  .us-merke{border:none;background:linear-gradient(150deg,#3A0019 0%,#5A0024 100%);color:${C.weiss};padding:18px 18px 16px}
  .us-merke .us-kicker{color:#FFD66B}.us-merke .us-text{color:${C.weiss};font-weight:600}.us-merke .us-text b{color:#FFE9A0}
  .us-fehler{background:linear-gradient(160deg,#FFF9F6 0%,#FFEDE7 100%);border-color:#F4D3C8;border-left:5px solid #C2462E}
  .us-fehler .us-kicker{color:#A8361F}
  .us-knoepfe{display:flex;flex-wrap:wrap;gap:8px}
  .us-knopf{display:inline-flex;align-items:center;gap:8px;min-height:40px;padding:8px 14px 8px 12px;border-radius:999px;border:1.5px solid ${C.linie};background:${C.weiss};color:${C.tinte};
    font-family:inherit;font-size:13.5px;font-weight:700;cursor:pointer;text-align:left;transition:transform .15s ease,box-shadow .15s ease,border-color .15s ease}
  .us-knopf small{display:block;font-size:11px;font-weight:600;color:${C.grau}}
  .us-knopf em{flex:none;display:inline-flex;align-items:center;justify-content:center;min-width:30px;height:30px;padding:0 6px;border-radius:9px;font-style:normal;font-size:12px;font-weight:800;background:#FFF5F8;color:#7A0032}
  .us-knopf-gold{border-color:transparent;background:${GOLD_VERLAUF};color:#3A0019}.us-knopf-gold em{background:rgba(58,0,25,0.12);color:#3A0019}.us-knopf-gold small{color:rgba(58,0,25,0.7)}
  .us-knopf-dunkel{border-color:transparent;background:linear-gradient(150deg,#3A0019 0%,#7A0032 100%);color:${C.weiss}}.us-knopf-dunkel em{background:rgba(255,255,255,0.14);color:#FFD66B}.us-knopf-dunkel small{color:rgba(255,255,255,0.75)}
  @media (hover:hover){.us-knopf:hover,.us-tab:hover{transform:translateY(-1px);box-shadow:0 10px 22px -12px rgba(15,26,51,0.3)}}
  .us-knopf:focus-visible{outline:3px solid ${C.flaggold};outline-offset:3px}
  .us-haken{display:flex;align-items:flex-start;gap:12px;padding:10px 0;border-top:1px solid ${C.linie};cursor:pointer}
  .us-haken:first-of-type{border-top:none}
  .us-haken input{position:absolute;opacity:0;width:0;height:0}
  .us-haken i{flex:none;width:26px;height:26px;border-radius:9px;border:2px solid ${C.linie};display:inline-flex;align-items:center;justify-content:center;color:${C.weiss};transition:background .15s ease,border-color .15s ease}
  .us-haken[data-an="1"] i{background:${GOLD_VERLAUF};border-color:transparent;color:#3A0019}
  .us-haken span{font-size:15px;line-height:1.55;color:${C.tinte};padding-top:2px}
  .us-haken:has(input:focus-visible) i{outline:3px solid ${C.flaggold};outline-offset:2px}
  .us-geschafft{display:inline-flex;align-items:center;gap:8px;margin-top:12px;padding:8px 14px;border-radius:999px;background:#FFF5F8;color:#7A0032;font-size:13.5px;font-weight:800}
  .us-nav{display:flex;gap:10px;flex-wrap:wrap;justify-content:space-between;margin:6px 0 30px}
  .us-trainer{margin-top:12px;padding:6px 0 0;border-top:1px solid ${C.linie}}
  .us-zurueck{background:none;border:none;color:#7A0032;font-size:13.5px;font-weight:700;font-family:inherit;cursor:pointer;padding:0;margin:18px 0 14px;display:inline-flex;align-items:center;gap:6px}
  .us-aufgabe{font-size:16px;line-height:1.65;color:${C.tinte};margin:0 0 10px;font-weight:600}
  .us-weg{margin:10px 0 0;padding:12px 14px;border-radius:14px;background:${C.sand};font-size:15px;line-height:1.9;color:${C.tinte}}
  .us-weg p{margin:0}
  .us-ergebnis{margin-top:8px;font-weight:800;color:#7A0032}
  .us-kacheln{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:0 0 30px}
  .us-kachel{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:10px;min-height:118px;padding:13px 13px 12px;border-radius:18px;border:1px solid ${C.linie};background:${C.weiss};
    cursor:pointer;font-family:inherit;text-align:left;min-width:0;overflow:hidden;box-shadow:0 1px 2px rgba(15,26,51,0.04),0 8px 22px -14px rgba(15,26,51,0.2);transition:transform .15s ease,box-shadow .15s ease,border-color .15s ease}
  .us-kachel::after{content:"";position:absolute;right:-26px;top:-26px;width:76px;height:76px;border-radius:999px;background:radial-gradient(circle,rgba(242,193,78,0.22) 0%,rgba(242,193,78,0) 70%);pointer-events:none}
  .us-kachel-ok{border-color:#E7C77A;background:linear-gradient(160deg,#FFFDF6 0%,#FFF6DC 100%)}
  .us-kachel-icon{flex:none;display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:14px;background:linear-gradient(150deg,#3A0019 0%,#7A0032 100%);color:#FFD66B;box-shadow:0 8px 16px -10px rgba(58,0,25,0.7)}
  .us-kachel-ok .us-kachel-icon{background:${GOLD_VERLAUF};color:#3A0019}
  .us-kachel-icon svg{width:24px;height:24px}
  .us-kachel-marke{position:absolute;top:11px;right:12px;font-size:10.5px;font-weight:800;letter-spacing:0.08em;color:#7A0032;opacity:0.7}
  .us-kachel-text{display:flex;flex-direction:column;gap:3px;min-width:0;width:100%}
  .us-kachel-titel{font-size:14.5px;font-weight:800;letter-spacing:-0.015em;line-height:1.2;color:${C.tinte}}
  .us-kachel-zeile{font-size:11.5px;color:${C.grau};line-height:1.35}
  .us-kachel-stand{display:flex;gap:3px;margin-top:auto;padding-top:2px}
  .us-kachel-stand i{display:block;width:7px;height:7px;border-radius:999px;background:#F3D9E2}
  .us-kachel-stand i[data-ok="1"]{background:#D4A338}
  .us-kachel:focus-visible{outline:3px solid ${C.flaggold};outline-offset:3px}
  @media (hover:hover){.us-kachel:hover{transform:translateY(-2px);border-color:#E7C77A;box-shadow:0 1px 2px rgba(15,26,51,0.04),0 16px 30px -14px rgba(58,0,25,0.35)}}
  .us-schleier{position:fixed;inset:0;z-index:70;background:rgba(20,8,14,0.55);backdrop-filter:blur(3px);display:flex;align-items:flex-end;justify-content:center;padding:0}
  .us-fenster{width:100%;max-width:640px;max-height:88dvh;display:flex;flex-direction:column;background:${C.sand};border-radius:24px 24px 0 0;box-shadow:0 -10px 40px rgba(0,0,0,0.3);overflow:hidden;animation:us-hoch .22s ease}
  @keyframes us-hoch{from{transform:translateY(24px);opacity:0}to{transform:translateY(0);opacity:1}}
  .us-fenster-kopf{display:flex;align-items:center;gap:12px;padding:16px 16px 12px;background:linear-gradient(150deg,#3A0019 0%,#5A0024 100%);color:${C.weiss}}
  .us-fenster-kopf .us-kachel-icon{box-shadow:none;background:rgba(255,255,255,0.1)}
  .us-fenster-kopf b{display:block;font-size:17px;font-weight:800;letter-spacing:-0.02em;line-height:1.2}
  .us-fenster-kopf span{display:block;font-size:12px;color:rgba(255,255,255,0.78);margin-top:3px;line-height:1.35}
  .us-fenster-zu{flex:none;margin-left:auto;width:36px;height:36px;border-radius:999px;border:none;background:rgba(255,255,255,0.14);color:${C.weiss};font-size:20px;line-height:1;cursor:pointer;font-family:inherit}
  .us-fenster-zu:focus-visible{outline:3px solid ${C.flaggold};outline-offset:2px}
  .us-fenster-inhalt{overflow-y:auto;padding:14px 14px 20px}
  .us-fenster-inhalt .ks-liste{margin-bottom:0;grid-template-columns:minmax(0,1fr)}
  .us-fenster-inhalt .ks-modul{min-width:0}
  .us-fenster-inhalt .ks-modul-meta{flex-wrap:wrap;white-space:normal;gap:6px 12px;font-size:12px}
  .us-einheit{position:relative;z-index:1;margin-top:-20px}
  .us-video{margin:0 0 14px;border-radius:20px;overflow:hidden;border:1px solid rgba(255,233,160,0.22);background:linear-gradient(150deg,#24000F 0%,#4A001E 60%,#5A0024 100%);
    box-shadow:0 1px 0 rgba(255,255,255,0.08) inset,0 14px 30px -18px rgba(58,0,25,0.8)}
  .us-video-kopf{display:flex;align-items:center;gap:12px;width:100%;padding:12px 14px;border:none;background:none;cursor:pointer;font-family:inherit;text-align:left;color:${C.weiss}}
  .us-video-kopf em{flex:none;display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:999px;background:${GOLD_VERLAUF};color:#3A0019;font-style:normal;box-shadow:0 6px 14px -6px rgba(242,193,78,0.7)}
  .us-video-kopf em svg{margin-left:2px}
  .us-video-kopf b{display:block;font-size:14.5px;font-weight:800;letter-spacing:-0.01em;line-height:1.3}
  .us-video-kopf small{display:block;font-size:11.5px;color:rgba(255,255,255,0.68);margin-top:2px}
  .us-video-kopf svg.us-pfeil{flex:none;margin-left:auto;color:#FFD66B;transition:transform .18s ease}
  .us-video-kopf[aria-expanded="true"] svg.us-pfeil{transform:rotate(180deg)}
  .us-video-kopf:focus-visible{outline:3px solid ${C.flaggold};outline-offset:-3px}
  .us-video-buehne{position:relative;width:100%;padding-bottom:56.25%;height:0;background:#1a0a10}
  .us-video-play{position:absolute;inset:0;width:100%;height:100%;border:none;cursor:pointer;font-family:inherit;color:${C.weiss};padding:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;
    background:radial-gradient(ellipse at 30% 20%,rgba(122,0,50,0.9) 0%,#2A0012 60%,#160009 100%)}
  .us-video-play i{width:64px;height:64px;border-radius:999px;background:${GOLD_VERLAUF};display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(0,0,0,0.4);font-style:normal}
  .us-video-play b{font-size:14px;font-weight:800}
  .us-video-play small{font-size:11.5px;opacity:0.8;line-height:1.4;text-align:center;max-width:300px}
  .us-video-fuss{margin:0;padding:8px 14px 10px;font-size:11.5px;color:rgba(255,255,255,0.68);line-height:1.45}
  .us-karte.us-ton-rose{background:linear-gradient(160deg,#FFF8FA 0%,#FCEAF0 100%);border-color:#F2D3DE}
  .us-karte.us-ton-gold{background:linear-gradient(160deg,#FFFDF7 0%,#FFF2D6 100%);border-color:#F0DCA5}
  .us-karte.us-ton-gold .us-schritt{border-top-color:#EBD7A6}
  @media (min-width:600px){.us-kacheln{grid-template-columns:repeat(3,minmax(0,1fr))}.us-schleier{align-items:center;padding:20px}.us-fenster{border-radius:24px;max-height:84vh}}
  @media (min-width:840px){.us-tabs{max-width:360px}.us-kacheln{grid-template-columns:repeat(4,minmax(0,1fr))}.us-karte{padding:22px 24px 20px}.us-text{font-size:16px}}
  @media (prefers-reduced-motion:reduce){.us-knopf,.us-tab{transition:none}.us-knopf:hover,.us-tab:hover{transform:none}}
`;
function stilSetzen() {
  if (typeof document === "undefined" || document.getElementById(STIL_ID)) return;
  const el = document.createElement("style"); el.id = STIL_ID; el.textContent = STIL; document.head.appendChild(el);
}

/* ---------- Kapitel-Kacheln: kurzer Name und Icon je Kapitel (Datentitel bleiben für die Lerneinheit-Seite) ---------- */
const S = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
const ICONS = {
  zahlen: <svg viewBox="0 0 24 24" {...S}><path d="M4 18V8l-2 2M11 18h6M13 8a2 2 0 1 1 4 1.5L13 13v1h5M22 8h-3l-.6 4h.6a2 2 0 1 1 0 4" /></svg>,
  rechnen: <svg viewBox="0 0 24 24" {...S}><path d="M6 4v6M3 7h6M15 7h6M3 15l6 6M9 15l-6 6M15 18h6M18 15v.01M18 21v.01" /></svg>,
  teilbar: <svg viewBox="0 0 24 24" {...S}><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M9 3v18M15 3v18M3 9h18M3 15h18" /></svg>,
  lineal: <svg viewBox="0 0 24 24" {...S}><rect x="2" y="8" width="20" height="8" rx="2" /><path d="M6 8v3M10 8v4M14 8v3M18 8v4" /></svg>,
  spiegel: <svg viewBox="0 0 24 24" {...S}><path d="M12 3v18" strokeDasharray="2 3" /><path d="M9 7l-5 5 5 5V7zM15 7l5 5-5 5V7z" /></svg>,
  flaeche: <svg viewBox="0 0 24 24" {...S}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 12h18M12 5v14" opacity="0.5" /></svg>,
  wuerfel: <svg viewBox="0 0 24 24" {...S}><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3zM12 12l8-4.5M12 12L4 7.5M12 12v9" /></svg>,
  minus: <svg viewBox="0 0 24 24" {...S}><path d="M3 12h18M12 7v.01M6 12l2-2M6 12l2 2" /><circle cx="17" cy="12" r="2.2" /></svg>,
  bruch: <svg viewBox="0 0 24 24" {...S}><path d="M6 12h12M12 4v5M10 6.5l2-2M12 15v5M10 17.5l2-2" /></svg>,
  komma: <svg viewBox="0 0 24 24" {...S}><ellipse cx="6" cy="12" rx="3" ry="5" /><path d="M12 16v1c0 1.2-.5 2-1.3 2.5M21 7h-4l-.5 4.5h.5a2.5 2.5 0 1 1 0 5" /></svg>,
  plusminus: <svg viewBox="0 0 24 24" {...S}><path d="M7 4v8M3 8h8M3 17h8M14 20L20 4" /></svg>,
  malgeteilt: <svg viewBox="0 0 24 24" {...S}><path d="M4 5l6 6M10 5l-6 6M14 11h6M17 8v.01M17 14v.01M14 20L20 4" /></svg>,
  winkel: <svg viewBox="0 0 24 24" {...S}><path d="M4 20L20 8M4 20h16M11 20a7 7 0 0 0-1.5-4.3" /><circle cx="17" cy="4" r="2.5" /></svg>,
  x: <svg viewBox="0 0 24 24" {...S}><path d="M5 7l7 10M12 7l-7 10M16 10h5M16 14h5" /></svg>,
  daten: <svg viewBox="0 0 24 24" {...S}><path d="M4 20V11M9 20V5M14 20v-7" /><rect x="17" y="12" width="5" height="8" rx="1" /><path d="M19.5 15v.01" /></svg>,
  dreisatz: <svg viewBox="0 0 24 24" {...S}><path d="M4 6h6M4 12h6M4 18h6M14 6h6M14 12h6M14 18h6" /><path d="M11 8l1 1 1-1M11 14l1 1 1-1" opacity="0.7" /></svg>,
};
const KAPITEL_ANZEIGE = {
  "k5-natzahlen": { name: "Natürliche Zahlen", icon: "zahlen" },
  "k5-rechnen": { name: "Rechnen", icon: "rechnen" },
  "k5-teilbarkeit": { name: "Teilbarkeit", icon: "teilbar" },
  "k5-groessen": { name: "Größen", icon: "lineal" },
  "k5-symmetrie": { name: "Symmetrie", icon: "spiegel" },
  "k5-flaechen": { name: "Flächen", icon: "flaeche" },
  "k5-koerper": { name: "Körper", icon: "wuerfel" },
  "k5-ganze": { name: "Ganze Zahlen", icon: "minus" },
  "k6-brueche": { name: "Bruchrechnen", icon: "bruch" },
  "k6-dezimal": { name: "Dezimalzahlen", icon: "komma" },
  "k6-addsub": { name: "Addieren und Subtrahieren", icon: "plusminus" },
  "k6-multdiv": { name: "Multiplizieren und Dividieren", icon: "malgeteilt" },
  "k6-winkel": { name: "Geometrie", icon: "winkel" },
  "k6-terme": { name: "Terme und Gleichungen", icon: "x" },
  "k6-daten": { name: "Daten und Zufall", icon: "daten" },
  "k6-zuordnungen": { name: "Dreisatz", icon: "dreisatz" },
};
const kapitelAnzeige = (kap) => KAPITEL_ANZEIGE[kap.id] || { name: kap.titel, icon: "zahlen" };

/* Video je Lerneinheit: einheit.video (YouTube-Id) – sonst der Platzhalter (Michael Penn, Englisch), bis das eigene Video da ist. */
export const PLATZHALTER_VIDEO = "OkFMxhkAafw";

/* ---------- Text mit **fett** und $Formeln$ ---------- */
function Fett({ s }) {
  const teile = String(s).split("**");
  return <>{teile.map((t, i) => (i % 2 ? <b key={i}><MS s={t} /></b> : <MS key={i} s={t} />))}</>;
}
function Absatz({ a }) {
  if (typeof a === "string") return <p className="us-text"><Fett s={a} /></p>;
  if (a.kopf) return <p className="us-kicker" style={{ marginTop: 6 }}>{a.kopf}</p>;
  if (a.liste) return <ul className="us-liste">{a.liste.map((l, i) => <li key={i}><Fett s={l} /></li>)}</ul>;
  if (a.formel) return <div className="us-formel">{a.formel.map((f, i) => <div key={i}><MS s={`$${f}$`} /></div>)}</div>;
  if (a.tabelle) return (
    <div style={{ overflowX: "auto" }}>
      <table className="us-tabelle">
        <thead><tr>{a.tabelle.kopf.map((k, i) => <th key={i}><Fett s={k} /></th>)}</tr></thead>
        <tbody>{a.tabelle.zeilen.map((z, i) => <tr key={i}>{z.map((c, j) => <td key={j}><Fett s={c} /></td>)}</tr>)}</tbody>
      </table>
    </div>
  );
  return null;
}

function Karte({ kicker, className = "", children, kennung }) {
  return <section className={`us-karte ${className}`} {...kennung}>{kicker && <p className="us-kicker">{kicker}</p>}{children}</section>;
}

/* ---------- Beispiel: Schritt für Schritt ---------- */
function Beispiel({ beispiel }) {
  const [n, setN] = useState(0);
  const alle = beispiel.schritte.length;
  return (
    <Karte kicker="Beispiel" className="us-ton-gold" kennung={{ "data-us-beispiel": "" }}>
      <p className="us-aufgabe"><MS s={beispiel.aufgabe} /></p>
      {beispiel.schritte.slice(0, n).map((s, i) => <div key={i} className="us-schritt"><i>{i + 1}</i><span><MS s={s} /></span></div>)}
      <div className="us-knoepfe" style={{ marginTop: 10 }}>
        {n < alle && <button type="button" className="us-knopf us-knopf-dunkel" onClick={() => setN(n + 1)}>{n === 0 ? "Ersten Schritt zeigen" : "Nächsten Schritt zeigen"}</button>}
        {n < alle && alle > 1 && <button type="button" className="us-knopf" onClick={() => setN(alle)}>Alle Schritte</button>}
        {n > 0 && <button type="button" className="us-knopf" onClick={() => setN(0)}>Noch einmal</button>}
      </div>
    </Karte>
  );
}

/* ---------- Probier es gleich: Aufgabe aus arbeitsblatt.js ---------- */
function ProbierEs({ quellen }) {
  const [nr, setNr] = useState(0);
  const [offen, setOffen] = useState(false);
  const aufgabe = useMemo(() => {
    const q = quellen[nr % quellen.length];
    try { return aufgabeAus(`u:${q}`); } catch (e) { return null; }
  }, [quellen, nr]);
  if (!aufgabe) return null;
  const neu = () => { setNr(nr + 1); setOffen(false); };
  return (
    <Karte kicker="Probier es gleich" kennung={{ "data-us-aufgabe": "" }}>
      <p className="us-aufgabe"><MS s={aufgabe.text} /></p>
      {aufgabe.tabelle && (
        <table className="us-tabelle" style={{ width: "auto" }}>
          <thead><tr>{aufgabe.tabelle.kopf.map((k, i) => <th key={i}>{k}</th>)}</tr></thead>
          <tbody><tr>{aufgabe.tabelle.zeile.map((c, i) => <td key={i}><MS s={String(c)} /></td>)}</tr></tbody>
        </table>
      )}
      {aufgabe.optionen && <ul className="us-liste">{aufgabe.optionen.map((o, i) => <li key={i}>{String.fromCharCode(97 + i)}) <MS s={o} /></li>)}</ul>}
      <p style={{ margin: "0 0 10px", fontSize: 13.5, color: C.grau }}>Rechne erst selbst auf dem Blatt – ein Schritt pro Zeile. Dann vergleichen.</p>
      {offen && (
        <div className="us-weg">
          {(aufgabe.weg || []).map((w, i) => <p key={i}><MS s={w} /></p>)}
          <p className="us-ergebnis">Ergebnis: <MS s={String(aufgabe.ergebnis)} /></p>
        </div>
      )}
      <div className="us-knoepfe" style={{ marginTop: 10 }}>
        {!offen && <button type="button" className="us-knopf us-knopf-dunkel" onClick={() => setOffen(true)}>Lösung zeigen</button>}
        <button type="button" className="us-knopf" onClick={neu}>Neue Aufgabe</button>
      </div>
    </Karte>
  );
}

/* ---------- Üben: Werkzeuge, Trainer, Seiten ---------- */
function Ueben({ einheit, gehe }) {
  const [trainer, setTrainer] = useState(null);
  const zuWerkzeug = (u) => {
    const w = WERKZEUGE[u.wz];
    if (!w) return;
    uebenWunschSetzen(w.ziel.ansicht, { modus: u.modus || (u.art ? "ueben" : null), art: u.art || null });
    gehe({ ...w.ziel });
  };
  return (
    <Karte kicker="Üben" kennung={{ "data-us-ueben": "" }}>
      <p style={{ margin: "0 0 12px", fontSize: 14, color: C.grau, lineHeight: 1.55 }}>Jeder Knopf öffnet das passende Werkzeug der App – gleich mit dem richtigen Aufgabentyp. Die Kopfrechen-Trainer laufen direkt hier.</p>
      <div className="us-knoepfe">
        {einheit.ueben.map((u, i) => {
          if (u.wz) {
            const w = WERKZEUGE[u.wz];
            return (
              <button key={i} type="button" className={`us-knopf${u.modus === "entdecken" ? "" : " us-knopf-gold"}`} onClick={() => zuWerkzeug(u)} data-us-wz={u.wz}>
                <em>{w ? w.zeichen : "→"}</em><span>{u.text}<small>{u.modus === "entdecken" ? "Entdecken" : "Üben"} · {w ? w.kurz || w.name : u.wz}</small></span>
              </button>
            );
          }
          if (u.kopf) return (
            <button key={i} type="button" className={`us-knopf${trainer === u.kopf ? " us-knopf-dunkel" : ""}`} onClick={() => setTrainer(trainer === u.kopf ? null : u.kopf)} aria-expanded={trainer === u.kopf} data-us-kopf={u.kopf}>
              <em>{TRAINER_ZEICHEN[u.kopf]}</em><span>{u.text}<small>Kopfrechnen · {TRAINER_NAME[u.kopf]}</small></span>
            </button>
          );
          return (
            <button key={i} type="button" className="us-knopf" onClick={() => gehe(u.ziel)}>
              <em>→</em><span>{u.text}<small>Seite öffnen</small></span>
            </button>
          );
        })}
      </div>
      {trainer && (
        <div className="us-trainer" data-us-trainer={trainer}>
          <p className="us-kicker" style={{ marginTop: 8 }}>Kopfrechnen · {TRAINER_NAME[trainer]}</p>
          <React.Suspense fallback={<p style={{ color: C.grau, fontSize: 14 }}>Trainer wird geladen …</p>}>
            <KopfTrainer id={trainer} />
          </React.Suspense>
          <div className="us-knoepfe" style={{ marginTop: 10 }}>
            <button type="button" className="us-knopf" onClick={() => setTrainer(null)}>Trainer schließen</button>
            <button type="button" className="us-knopf" onClick={() => gehe({ ansicht: "kopf", trainer })}>Im Bereich Kopfrechnen öffnen</button>
          </div>
        </div>
      )}
    </Karte>
  );
}

/* Raster aus vier Kacheln – „zur Kursübersicht“ */
const IconRaster = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
    <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="2.2" /><rect x="13" y="3.5" width="7.5" height="7.5" rx="2.2" opacity="0.55" />
    <rect x="3.5" y="13" width="7.5" height="7.5" rx="2.2" opacity="0.55" /><rect x="13" y="13" width="7.5" height="7.5" rx="2.2" />
  </svg>
);

/* ---------- Video zur Lerneinheit: zum Ausklappen, Abspielen erst auf Klick (zwei Klicks, ExternSchutz) ---------- */
function VideoKlappe({ einheit }) {
  const [offen, setOffen] = useState(false);
  const [an, setAn] = useState(false);
  const id = einheit.video || PLATZHALTER_VIDEO;
  const platzhalter = !einheit.video;
  return (
    <section className="us-video" data-us-video={id}>
      <button type="button" className="us-video-kopf" onClick={() => setOffen(!offen)} aria-expanded={offen} aria-controls={`us-video-${einheit.id}`}>
        <em aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M8 5v14l11-7z" fill="currentColor" /></svg></em>
        <span><b>Video: {einheit.titel}</b><small>{platzhalter ? "Platzhalter · Michael Penn (YouTube, Englisch)" : "Erklärvideo zur Lerneinheit"} · {offen ? "einklappen" : "ausklappen"}</small></span>
        <svg className="us-pfeil" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {offen && (
        <div id={`us-video-${einheit.id}`}>
          <div className="us-video-buehne">
            {an ? (
              <ExternSchutz dienst="youtube"><iframe title={`Video: ${einheit.titel}`} src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                loading="lazy" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }} /></ExternSchutz>
            ) : (
              <button type="button" className="us-video-play" onClick={() => setAn(true)} aria-label="Video abspielen" data-us-play="">
                <i aria-hidden="true"><svg viewBox="0 0 24 24" width="28" height="28"><path d="M8 5v14l11-7z" fill="#3A0019" /></svg></i>
                <b>Video abspielen</b>
                <small>Beim Abspielen wird das Video von YouTube (youtube-nocookie.com) geladen.</small>
              </button>
            )}
          </div>
          {platzhalter && <p className="us-video-fuss">Bis unser deutsches Video zu „{einheit.titel}“ fertig ist, steht hier ein Video von Michael Penn als Platzhalter.</p>}
        </div>
      )}
    </section>
  );
}

/* ---------- Kapitel-Pop-up: die Lerneinheiten eines Kapitels ---------- */
function KapitelFenster({ kap, stand, zu, schliessen }) {
  const a = kapitelAnzeige(kap);
  useEffect(() => {
    const taste = (e) => { if (e.key === "Escape") schliessen(); };
    document.addEventListener("keydown", taste);
    const alt = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", taste); document.body.style.overflow = alt; };
  }, [schliessen]);
  return (
    <div className="us-schleier" onClick={schliessen} data-us-fenster={kap.id}>
      <div className="us-fenster" role="dialog" aria-modal="true" aria-label={`Kapitel ${kap.marke}: ${a.name}`} onClick={(e) => e.stopPropagation()} style={kursVars(GRANAT)}>
        <div className="us-fenster-kopf">
          <span className="us-kachel-icon" aria-hidden="true">{ICONS[a.icon]}</span>
          <span style={{ minWidth: 0 }}><b>{a.name}</b><span>Kapitel {kap.marke} · {kap.einheiten.length} Einheiten · {kap.zeile}</span></span>
          <button type="button" className="us-fenster-zu" onClick={schliessen} aria-label="Schließen">×</button>
        </div>
        <div className="us-fenster-inhalt">
          <ModulListe>
            {kap.einheiten.map((e, i) => {
              const voll = einheitVon(e.id);
              const wz = e.ueben.filter((u) => u.wz).length, kopf = e.ueben.filter((u) => u.kopf).length;
              const meta = [{ icon: <IconBuch />, text: "Lesen", label: "Erklärung und Beispiel" }];
              if (e.aufgaben.length) meta.push({ icon: <IconAufgabe />, text: `${e.aufgaben.length} Aufgaben${e.aufgaben.length > 1 ? "typen" : "typ"}`, label: "Aufgaben zum Probieren" });
              if (wz) meta.push({ icon: <IconWerkzeug />, text: `${wz} Werkzeug${wz > 1 ? "e" : ""}`, label: "Werkzeuge der App" });
              if (kopf) meta.push({ icon: <IconWerkzeug />, text: "Kopfrechnen", label: "Kopfrechen-Trainer" });
              return <ModulKarte key={e.id} farben={GRANAT} nr={i + 1} titel={e.titel} voll={e.ziel} meta={meta} ok={einheitGeschafft(voll, stand)} onClick={() => { schliessen(); zu(e.id); }} klasse="us-modul" kennung={{ "data-us-modul": e.id }} />;
            })}
          </ModulListe>
        </div>
      </div>
    </div>
  );
}

/* ---------- Lerneinheit ---------- */
function EinheitSeite({ einheit, stand, setze, zu, gehe }) {
  const haken = (stand.haken && stand.haken[einheit.id]) || [];
  const ok = einheitGeschafft(einheit, stand);
  const naechste = naechsteEinheit(einheit.id), vorige = vorigeEinheit(einheit.id);
  const klasse = klasseVon(einheit.klasse);
  useEffect(() => { setze((s) => ({ ...s, gelesen: { ...(s.gelesen || {}), [einheit.id]: true }, zuletzt: einheit.id })); }, [einheit.id]);   // eslint-disable-line react-hooks/exhaustive-deps
  const toggle = (i) => setze((s) => {
    const alt = (s.haken && s.haken[einheit.id]) || [];
    const neu = einheit.kann.map((_, k) => (k === i ? !alt[k] : !!alt[k]));
    return { ...s, haken: { ...(s.haken || {}), [einheit.id]: neu } };
  });
  const bildVor = einheit.bild && einheit.lesen.length > 1;
  return (
    <>
      <KursKopf farben={GRANAT} Motiv={MotivGeodreieck} id="ks-unter" kompakt buendig einzeilig titel={einheit.titel}
        zeile={`${klasse.titel} · ${einheit.marke} ${(KAPITEL_ANZEIGE[einheit.kapitel] || {}).name || einheit.kapitelTitel} · Einheit ${einheit.nr}/${einheit.anzahl}`}
        aktion={{ text: "Kurs", label: `Alle Einheiten der ${klasse.titel}`, icon: <IconRaster />, onClick: () => zu(`klasse-${einheit.klasse}`), kennung: { "data-us-zurueck": "" } }}
        kennung={{ "data-us-einheit": einheit.id }} />
      <div className="mx-auto px-4 pb-16 us-einheit" style={{ maxWidth: 760 }}>

        <VideoKlappe key={einheit.id} einheit={einheit} />

        <Karte kicker="Darum geht’s" className="us-ton-rose"><p className="us-ziel">{einheit.ziel}</p></Karte>

        <Karte kicker="Verstehen" kennung={{ "data-us-lesen": "" }}>
          <Absatz a={einheit.lesen[0]} />
          {bildVor && <div className="us-bild"><UnterBild bild={einheit.bild} /></div>}
          {einheit.lesen.slice(1).map((a, i) => <Absatz key={i} a={a} />)}
          {einheit.bild && !bildVor && <div className="us-bild"><UnterBild bild={einheit.bild} /></div>}
        </Karte>

        <Beispiel beispiel={einheit.beispiel} />

        <Karte kicker="Merke" className="us-merke"><p className="us-text"><Fett s={einheit.merke} /></p></Karte>
        {einheit.fehler && <Karte kicker="Typischer Fehler" className="us-fehler"><p className="us-text"><Fett s={einheit.fehler} /></p></Karte>}

        {einheit.aufgaben.length > 0 && <ProbierEs key={einheit.id} quellen={einheit.aufgaben} />}

        <Ueben einheit={einheit} gehe={gehe} />

        <Karte kicker="Kann ich das?" kennung={{ "data-us-kann": "" }}>
          <p style={{ margin: "0 0 8px", fontSize: 14, color: C.grau, lineHeight: 1.55 }}>Hake ehrlich ab. Mit drei Haken gilt die Lerneinheit als geschafft – und zählt auf der Kachel.</p>
          {einheit.kann.map((k, i) => (
            <label key={i} className="us-haken" data-an={haken[i] ? "1" : "0"}>
              <input type="checkbox" checked={!!haken[i]} onChange={() => toggle(i)} />
              <i aria-hidden="true">{haken[i] ? "✓" : ""}</i><span><MS s={k} /></span>
            </label>
          ))}
          {ok && <span className="us-geschafft" data-us-geschafft="">✓ Geschafft – weiter so!</span>}
        </Karte>

        <div className="us-nav">
          {vorige ? <button type="button" className="us-knopf" onClick={() => zu(vorige.id)}>← {vorige.titel}</button> : <span />}
          {naechste
            ? <button type="button" className="us-knopf us-knopf-gold" onClick={() => zu(naechste.id)} data-us-weiter="">Nächste Einheit: {naechste.titel} →</button>
            : <button type="button" className="us-knopf us-knopf-gold" onClick={() => zu(null)}>Zur Übersicht →</button>}
        </div>
      </div>
    </>
  );
}

/* ---------- Übersicht ---------- */
function Uebersicht({ klasseId, setKlasse, stand, zu }) {
  const klasse = klasseVon(klasseId) || UNTERSTUFE_KLASSEN[0];
  const st = unterstufeStand(stand);
  const je = st.jeKlasse[klasse.id];
  const inKlasse = UNTERSTUFE_EINHEITEN.filter((e) => e.klasse === klasse.id);
  const zuletzt = stand.zuletzt ? einheitVon(stand.zuletzt) : null;
  const weiter = (zuletzt && zuletzt.klasse === klasse.id && !einheitGeschafft(zuletzt, stand) ? zuletzt : null) || inKlasse.find((e) => !einheitGeschafft(e, stand)) || inKlasse[0];
  const [offenesKapitel, setOffenesKapitel] = useState(null);
  const schliessen = React.useCallback(() => setOffenesKapitel(null), []);
  const kapOffen = offenesKapitel ? klasse.kapitel.find((k) => k.id === offenesKapitel) : null;
  return (
    <div className="mx-auto px-4 pb-16" style={{ maxWidth: 760 }}>
      <FortschrittKarte farben={GRANAT} zahl={je.fertig} gesamt={je.gesamt} einheit="Einheiten" einheitDativ="Einheiten" onKnopf={() => zu(weiter.id)}
        knopf={je.fertig === 0 ? `${klasse.titel} starten` : "Weiter mit"} ziel={weiter.titel} kennung={{ "data-us-fortschritt": klasse.id }}
        zusatz={st.fertig > je.fertig ? `Insgesamt ${st.fertig} von ${st.gesamt} Einheiten in beiden Klassen` : undefined} />
      <div className="us-tabs" style={kursVars(GRANAT)} role="tablist" aria-label="Klasse wählen">
        {UNTERSTUFE_KLASSEN.map((k) => (
          <button key={k.id} type="button" role="tab" className="us-tab" aria-pressed={k.id === klasse.id} aria-selected={k.id === klasse.id} onClick={() => setKlasse(k.id)} data-us-klasse={k.id}>
            <b>{k.titel}</b><span>{k.kapitel.length} Kapitel · {UNTERSTUFE_ZAHLEN.jeKlasse[k.id]} Einheiten</span>
          </button>
        ))}
      </div>
      <Hinweis>
        Jede Einheit: lesen, ein Beispiel Schritt für Schritt, der Merksatz – dann gleich üben. Nach dem Bildungsplan Baden-Württemberg; die Reihenfolge ist je Schule etwas anders.
      </Hinweis>
      <div className="us-kacheln" style={kursVars(GRANAT)} data-us-kapitelliste={klasse.id}>
        {klasse.kapitel.map((kap) => {
          const a = kapitelAnzeige(kap);
          const fertig = kap.einheiten.filter((e) => einheitGeschafft(einheitVon(e.id), stand)).length;
          const alle = fertig === kap.einheiten.length;
          return (
            <button key={kap.id} type="button" className={`us-kachel${alle ? " us-kachel-ok" : ""}`} onClick={() => setOffenesKapitel(kap.id)} data-us-kapitel={kap.id}
              aria-haspopup="dialog" aria-label={`${a.name}: ${kap.einheiten.length} Einheiten, ${fertig} geschafft`}>
              <span className="us-kachel-icon" aria-hidden="true">{ICONS[a.icon]}</span>
              <span className="us-kachel-marke" aria-hidden="true">{kap.marke}</span>
              <span className="us-kachel-text">
                <span className="us-kachel-titel">{a.name}</span>
                <span className="us-kachel-zeile">{kap.einheiten.length} Einheiten{fertig ? ` · ${fertig} geschafft` : ""}</span>
              </span>
              <span className="us-kachel-stand" aria-hidden="true">{kap.einheiten.map((e, i) => <i key={e.id} data-ok={i < fertig ? "1" : "0"} />)}</span>
            </button>
          );
        })}
      </div>
      {kapOffen && <KapitelFenster kap={kapOffen} stand={stand} zu={zu} schliessen={schliessen} />}
    </div>
  );
}

/* ---------- Seite ---------- */
export function UnterstufeSeite({ gehe, seite = null, setSeite = () => {} }) {
  React.useInsertionEffect(stilSetzen, []);
  const [stand, setStand] = useState(lies);
  const setze = (f) => setStand((s) => { const n = typeof f === "function" ? f(s) : f; schreib(n); return n; });
  const [klasse, setKlasseRoh] = useState(() => {
    const m = /^klasse-(\d)$/.exec(seite || "");
    if (m) return m[1];
    const e = seite ? einheitVon(seite) : null;
    return e ? e.klasse : unterstufeStand(lies()).weiter.klasse;
  });
  const einheit = seite ? einheitVon(seite) : null;
  useEffect(() => { if (einheit) setKlasseRoh(einheit.klasse); }, [einheit && einheit.id]);   // eslint-disable-line react-hooks/exhaustive-deps
  const zu = (s) => { setSeite(s); nachOben(); };
  const setKlasse = (k) => { setKlasseRoh(k); setSeite(`klasse-${k}`); };

  if (einheit) return <EinheitSeite einheit={einheit} stand={stand} setze={setze} zu={zu} gehe={gehe} />;
  const st = unterstufeStand(stand);
  return (
    <>
      <KursKopf farben={GRANAT} Motiv={MotivGeodreieck} id="ks-unter" titel={UNTERSTUFE_INFO.titel} zeile={UNTERSTUFE_INFO.zeile} kennung={{ "data-us-kopf": "" }}
        chips={[
          { icon: <IconBuch />, text: `${UNTERSTUFE_ZAHLEN.kapitel} Kapitel` },
          { icon: <IconAufgabe />, text: `${UNTERSTUFE_ZAHLEN.einheiten} Einheiten` },
          { icon: <IconWerkzeug />, text: "Kopfrechnen inklusive" },
          ...(st.fertig ? [{ icon: <IconAufgabe />, text: `${st.fertig} geschafft` }] : []),
        ]} />
      <Uebersicht klasseId={klasse} setKlasse={setKlasse} stand={stand} zu={zu} />
    </>
  );
}
