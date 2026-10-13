import React, { useEffect, useState } from "react";
import "@fontsource/caveat/600.css";
import "@fontsource/caveat/700.css";
import { COACHING } from "./base3.jsx";
import { M } from "./func3.jsx";
import { ELTERNABEND } from "./funcElternabend.jsx";
import { PerformanceLab } from "./funcPerformanceLab.jsx";

/* ======================================================================
   LANDINGPAGE  (Adresse: #landingpage) – offen erreichbar, ohne Passwort.

   Leitidee: Der Slogan „System + Freude = Erfolg“ ist eine Gleichung. Der Seitenkopf zeigt sie
   als Rechenweg auf Karopapier: „Mathe = Talent“ wird mit Rotstift durchgestrichen (der Mythos),
   darunter steht die richtige Zeile, doppelt unterstrichen wie bei Pen & Paper. Das ist das eine
   auffällige Element der Seite – alles andere bleibt ruhig.

   Aufbau
     1. Kopf          – Versprechen, Rechenweg, zwei Handlungen
     2. Problem       – „Kennst du das?“
     3. Geschichte    – Note 2 → anderer Weg ab Klasse 8 → 1,0 ab Klasse 10 (echte Zeitleiste)
     4. System        – die Stellschrauben = die Methoden der App, jeweils direkt verlinkt
     5. MathildaAI    – Rechenweg prüfen, Fehlermuster, Performance-Lab (aufklappbar)
     6. Werkzeuge     – kompaktes Inhaltsverzeichnis, verlinkt in die App
     6b. Stimmen      – Rückmeldungen (STIMMEN); Platzhalter sichtbar als „Beispiel“ markiert
     7. Programme     – Mathe checken, Mathe Masterclass (Texte wie auf deren Seiten)
     8. Für Eltern    – Elternabend (Daten aus ELTERNABEND, funcElternabend.jsx)
     9. Über mich
    10. Fragen
    11. Abschluss

   Kontakt: Terminlink oder Mail stehen in base3.jsx unter COACHING. Solange beides leer ist,
   erklären die Knöpfe ehrlich, dass die Buchung noch nicht freigeschaltet ist.
   Fakten nur aus vorhandenen Quellen – keine erfundenen Zahlen, Zitate oder Bewertungen.
   ====================================================================== */

export const LANDING = "landingpage";

const F = {
  nacht: "#0E1E4A", nachtTief: "#091535", see: "#004D98", seeHell: "#5B8FD1",
  gold: "#EDBB00", goldText: "#8A6500", papier: "#F8FAFD", karo: "#D7E1F0",
  tinte: "#0F1A33", himmel: "#E8EFF9", grau: "#4B5675", still: "#6B7590", linie: "#E1E7F1", rot: "#C8372D", weiss: "#FFFFFF",
  blauText: "#C9D6EE",
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
.lp-h1 { font-size: clamp(42px, 7.2vw, 80px); font-weight: 800; letter-spacing: -0.045em; line-height: 0.98; }
.lp-h2 { font-size: clamp(30px, 4.4vw, 48px); font-weight: 800; letter-spacing: -0.035em; line-height: 1.06; }
.lp-h3 { font-size: 20px; font-weight: 700; letter-spacing: -0.015em; line-height: 1.3; }
.lp-lead { font-size: clamp(18px, 2vw, 21px); font-weight: 400; line-height: 1.6; }
.lp-text { font-size: 17px; font-weight: 400; line-height: 1.72; color: ${F.grau}; }
.lp-dunkel .lp-text { color: ${F.blauText}; }
.lp-klein { font-size: 14.5px; line-height: 1.6; color: ${F.still}; }
.lp-raster-2 { display: grid; gap: clamp(40px, 5vw, 72px); grid-template-columns: minmax(0, 1fr); align-items: center; }
@media (min-width: 900px) { .lp-raster-2 { grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr); } }

/* Knöpfe */
.lp-knopf { display: inline-flex; align-items: center; justify-content: center; min-height: 52px; padding: 0 28px; border-radius: 999px;
  font: 700 16px/1.1 Montserrat, system-ui, sans-serif; cursor: pointer; border: 2px solid transparent; text-decoration: none;
  transition: transform .15s ease, background .15s ease, color .15s ease, border-color .15s ease; }
.lp-knopf:hover { transform: translateY(-1px); }
.lp-knopf:focus-visible, .lp a:focus-visible, .lp button:focus-visible, .lp summary:focus-visible { outline: 3px solid ${F.gold}; outline-offset: 3px; }
.lp-gold { background: ${F.gold}; color: ${F.nacht}; }
.lp-gold:hover { background: #FFD02E; }
.lp-rand-hell { background: transparent; color: ${F.weiss}; border-color: rgba(255,255,255,0.4); }
.lp-rand-hell:hover { border-color: ${F.weiss}; }
.lp-rand-dunkel { background: transparent; color: ${F.nacht}; border-color: rgba(14,30,74,0.22); }
.lp-rand-dunkel:hover { border-color: ${F.nacht}; }
.lp-link { background: none; border: none; padding: 0; cursor: pointer; font: 700 15px/1.4 Montserrat, system-ui, sans-serif; color: ${F.see};
  text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 4px; text-decoration-color: rgba(0,77,152,0.3); min-height: 32px; }
.lp-link:hover { text-decoration-color: ${F.see}; }
.lp-dunkel .lp-link { color: ${F.gold}; text-decoration-color: rgba(237,187,0,0.4); }

/* Kopf */
.lp-kopf { background: radial-gradient(120% 90% at 85% 0%, #17306E 0%, ${F.nacht} 48%, ${F.nachtTief} 100%); color: ${F.weiss};
  padding: clamp(48px, 8vw, 104px) 0 clamp(72px, 9vw, 120px); overflow: hidden; }
.lp-kopf .lp-lead { color: ${F.blauText}; max-width: 34em; margin-top: 28px; }
.lp-autor { margin-top: 32px; font-size: 14.5px; color: ${F.blauText}; line-height: 1.6; max-width: 34em; }
.lp-autor b { color: ${F.weiss}; font-weight: 600; }

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

/* Problem */
.lp-gedanken { display: grid; gap: 14px; }
.lp-gedanke { font-size: clamp(22px, 3vw, 30px); font-weight: 600; letter-spacing: -0.02em; line-height: 1.25; color: ${F.still}; }

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

/* System */
.lp-methoden { display: grid; grid-template-columns: minmax(0, 1fr); border-top: 1px solid ${F.linie}; margin-top: 48px; }
@media (min-width: 900px) { .lp-methoden { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); column-gap: 64px; } }
.lp-methode { display: grid; grid-template-columns: 60px minmax(0, 1fr); gap: 20px; padding: 30px 0; border-bottom: 1px solid ${F.linie}; align-items: start; }
.lp-zeichen { width: 60px; height: 60px; border-radius: 16px; background: ${F.weiss}; border: 1px solid ${F.linie}; display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 20px; color: ${F.see}; letter-spacing: -0.03em; }

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

/* Werkzeuge */
.lp-werkzeuge { display: grid; grid-template-columns: minmax(0, 1fr); gap: 40px; margin-top: 48px; }
@media (min-width: 640px) { .lp-werkzeuge { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (min-width: 1000px) { .lp-werkzeuge { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 32px; } }
.lp-bereich h3 { font-size: 15px; font-weight: 800; color: ${F.tinte}; padding-bottom: 12px; border-bottom: 2px solid ${F.nacht}; margin-bottom: 2px; }
.lp-werkzeug { display: block; width: 100%; text-align: left; background: none; border: none; border-bottom: 1px solid ${F.linie}; padding: 14px 0; cursor: pointer; font-family: inherit; }
.lp-werkzeug b { display: block; font-size: 15.5px; font-weight: 700; color: ${F.tinte}; }
.lp-werkzeug span { display: block; font-size: 13.5px; color: ${F.still}; margin-top: 3px; line-height: 1.45; }
.lp-werkzeug:hover b { color: ${F.see}; }

/* Programme */
.lp-programme { display: grid; grid-template-columns: minmax(0, 1fr); gap: 20px; margin-top: 48px; }
@media (min-width: 900px) { .lp-programme { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.lp-programm { border-radius: 24px; padding: clamp(28px, 4vw, 40px); display: flex; flex-direction: column; }
.lp-programm ul { list-style: none; padding: 0; margin: 24px 0 32px; display: grid; gap: 12px; }
.lp-programm li { position: relative; padding-left: 26px; font-size: 15.5px; line-height: 1.55; }
.lp-programm li::before { content: ""; position: absolute; left: 0; top: 11px; width: 12px; height: 2px; background: currentColor; opacity: 0.55; }
.lp-dauer { font-size: 14px; font-weight: 700; }

/* Eltern */
.lp-eltern { background: radial-gradient(120% 140% at 85% 10%, #2A2210 0%, #0E0C08 55%, #050404 100%); color: ${F.weiss}; border-radius: 28px; padding: clamp(32px, 5vw, 56px); }
.lp-eltern .lp-text { color: #D8D2C2; }

/* Zeitleiste: gezeichneter Anstieg statt Note */
.lp-anstieg { display: block; width: clamp(84px, 9vw, 112px); height: auto; margin: 2px 0 6px; }

/* Über mich mit Foto */
.lp-ueber { display: grid; gap: 40px; grid-template-columns: minmax(0, 1fr); align-items: center; }
@media (min-width: 900px) { .lp-ueber { grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr); gap: 72px; } }
.lp-foto { width: 100%; max-width: 420px; aspect-ratio: 4 / 5; object-fit: cover; border-radius: 24px; box-shadow: 0 24px 48px rgba(14,30,74,0.18); }

/* Smartphone: Knöpfe volle Breite, Werkzeuge zweispaltig und knapper */
@media (max-width: 560px) {
  .lp-knopf { width: 100%; }
  .lp-werkzeuge { grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 18px; row-gap: 32px; }
  .lp-werkzeug span { display: none; }
  .lp-werkzeug b { font-size: 14.5px; line-height: 1.35; }
  .lp-werkzeug { padding: 12px 0; min-height: 48px; }
}

/* Stimmen */
.lp-stimmen { display: grid; grid-template-columns: minmax(0, 1fr); gap: 20px; margin-top: 48px; }
@media (min-width: 900px) { .lp-stimmen { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; } }
.lp-stimme { position: relative; display: flex; flex-direction: column; margin: 0; background: ${F.weiss}; border: 1px solid ${F.linie}; border-radius: 24px; padding: 32px 28px 28px; }
.lp-stimme blockquote { margin: 0; font-size: 18px; font-weight: 500; line-height: 1.6; letter-spacing: -0.005em; color: ${F.tinte}; }
.lp-stimme blockquote::before { content: "„"; display: block; font-size: 64px; font-weight: 800; line-height: 0.6; color: ${F.gold}; margin-bottom: 14px; }
.lp-stimme figcaption { display: flex; align-items: center; gap: 14px; margin-top: auto; padding-top: 24px; }
.lp-avatar { width: 52px; height: 52px; border-radius: 50%; flex-shrink: 0; object-fit: cover; background: ${F.himmel}; display: flex; align-items: center; justify-content: center; }
.lp-beispiel { position: absolute; top: 18px; right: 18px; font-size: 12px; font-weight: 700; color: ${F.goldText}; background: #FFF6D6; border: 1px dashed ${F.goldText}; border-radius: 999px; padding: 4px 10px; }

/* Fragen */
.lp-frage { border-bottom: 1px solid ${F.linie}; }
.lp-frage summary { list-style: none; cursor: pointer; padding: 22px 44px 22px 0; position: relative; font-size: 18px; font-weight: 700; letter-spacing: -0.01em; line-height: 1.4; }
.lp-frage summary::-webkit-details-marker { display: none; }
.lp-frage summary::before, .lp-frage summary::after { content: ""; position: absolute; right: 8px; top: 50%; width: 16px; height: 2px; background: ${F.see}; border-radius: 2px; transition: transform .2s ease; }
.lp-frage summary::after { transform: rotate(90deg); }
.lp-frage[open] summary::after { transform: rotate(0deg); }
.lp-frage p { padding: 0 0 24px; }

.lp-hinweis { margin-top: 18px; font-size: 14.5px; line-height: 1.6; max-width: 34em; }
`;

/* ---------------------------------------------------------------- Inhalte */
const METHODEN = [
  { zeichen: "Ich", name: "Mathe-Mindset", text: "Der Satz „Ich bin einfach nicht der Mathe-Typ“ ist der erste Mythos, der fällt. Sechs Vorträge und ein Buch zeigen, wie Lernen wirklich funktioniert.", ziel: { ansicht: "elternkurs" }, knopf: "Mindset-Kurs öffnen" },
  { zeichen: "✎", name: "Pen & Paper", text: "Sauber aufschreiben, strukturiert rechnen, Fehler selbst finden. Wer ordentlich arbeitet, verliert keine Punkte mehr an Kleinigkeiten.", ziel: { ansicht: "penpaperkurs" }, knopf: "Pen & Paper öffnen" },
  { zeichen: "7·8", name: "Head & Numbers", text: "Einmaleins, Quadrat- und Kubikzahlen, die sitzen. Sicheres Kopfrechnen macht jede Aufgabe schneller und entspannter.", ziel: { ansicht: "headnumbers" }, knopf: "Kopfrechnen trainieren" },
  { zeichen: "∿", name: "Ebbinghaus", text: "Wiederholen im richtigen Abstand, damit das Thema vom letzten Jahr nicht wieder weg ist, wenn es im Abi zurückkommt.", ziel: { ansicht: "ebbinghaus" }, knopf: "Wiederholen starten" },
  { zeichen: "AI", name: "MathildaAI", text: "Fotografiere dein Blatt. Mathilda liest deinen Rechenweg und zeigt dir die Stelle, an der er bricht.", ziel: { ansicht: "analyse", foto: "blatt" }, knopf: "Blatt prüfen lassen" },
  { zeichen: "f′", name: "Mathe-Training", text: "Formelsammlung, interaktive Werkzeuge und Trainer für Analysis, Vektoren und Stochastik – zum Üben und Nachschlagen.", ziel: { ansicht: "start" }, knopf: "Zu den Werkzeugen" },
];

const WERKZEUGE = [
  { bereich: "Analysis", liste: [
    ["Polynome", "Kurvendiskussion bis Grad 4", { ansicht: "plotter" }],
    ["Beliebige Funktionen", "Mit sin, ln, eˣ und Brüchen", { ansicht: "advplotter" }],
    ["Steckbriefaufgaben", "Aus Eigenschaften die Funktion", { ansicht: "steckbrief" }],
    ["Ableitungstrainer", "f′, f″ und f‴ prüfen", { ansicht: "ableitungstrainer" }],
  ] },
  { bereich: "Vektoren", liste: [
    ["Ebenen-Visualizer", "Ebenen live im Raum drehen", { ansicht: "ebenen" }],
    ["Abstände", "Punkt, Gerade, Ebene", { ansicht: "abstaende" }],
    ["Kreuzprodukt", "Formel, eingesetzt, Ergebnis", { ansicht: "kreuzprodukt" }],
  ] },
  { bereich: "Stochastik", liste: [
    ["Bernoulli-Kette", "Binomialverteilung simulieren", { ansicht: "bernoulli" }],
    ["Vier-Felder-Tafel", "Mit Baumdiagramm", { ansicht: "vierfelder" }],
    ["Hypothesentests", "Fehler 1. und 2. Art", { ansicht: "hypothesentest" }],
  ] },
  { bereich: "Grundlagen", liste: [
    ["Gleichungen lösen", "Du formst um, die App rechnet mit", { ansicht: "gleichungen" }],
    ["Terme und Potenzgesetze", "Vereinfachen, ausklammern, kürzen", { ansicht: "terme" }],
    ["Gleichungssysteme", "Mit drei Variablen", { ansicht: "lgs" }],
  ] },
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
   beispiel: true markiert Platzhalter sichtbar als „Beispiel“ – entfernen, sobald die Stimme echt ist.
   foto: optionaler Pfad unter public/, z. B. "/landingpage/stimme-1.jpg"; ohne Foto erscheint ein neutrales Zeichen. */
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
  ["Kann ich die Werkzeuge einfach ausprobieren?", "Ja. Plotter, Trainer und Generatoren öffnen sich direkt im Browser. Für die Foto-Auswertung mit MathildaAI wirst du vor dem ersten Foto um deine Einwilligung gebeten."],
  ["Was passiert im ersten Gespräch?", "Wir schauen gemeinsam, wo du gerade stehst, wo es hakt und welcher Weg zu dir passt – ein Programm, gezieltes Training mit den Werkzeugen oder für deine Eltern erst einmal der Elternabend."],
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

/* ---------------------------------------------------------------- Seite */
export function Landingpage({ gehe }) {
  const [hinweis, setHinweis] = useState(false);
  const [labOffen, setLabOffen] = useState(false);
  const [fotoDa, setFotoDa] = useState(false);

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

  const scrollen = (id) => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); };
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
  };
  const hinweisText = hinweis && !kontaktDa ? (
    <p role="status" className="lp-hinweis" style={{ color: F.blauText }}>
      Die Online-Terminbuchung wird gerade eingerichtet. Bis dahin lernst du Mythos Mathe am besten beim{" "}
      <button type="button" className="lp-link" style={{ color: F.gold }} onClick={() => gehe({ ansicht: "elternabend" })}>Elternabend am {ELTERNABEND.datumKurz}</button> kennen.
    </p>
  ) : null;

  return (
    <div className="lp">
      <style>{CSS}</style>

      {/* 1 · Kopf */}
      <header className="lp-kopf">
        <div className="lp-innen lp-raster-2">
          <div>
            <h1 className="lp-h1">Mathetalent ist ein Mythos.</h1>
            <p className="lp-lead">
              Gute Noten in Mathe entstehen aus einem System, das man lernen kann. Ich zeige Gymnasiasten von Klasse 8 bis zum Abitur,
              wie es geht – mit Methode, mit den richtigen Werkzeugen und mit Freude am Fach.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 36 }}>
              <button type="button" className="lp-knopf lp-gold" onClick={gespraech}>Erstgespräch anfragen</button>
              <button type="button" className="lp-knopf lp-rand-hell" onClick={() => scrollen("lp-werkzeuge")}>Werkzeuge ausprobieren</button>
            </div>
            {hinweisText}
            <p className="lp-autor">Von <b>Basti Blumenröther</b>, Mathestudent an der Universität Konstanz und seit Jahren Mathe-Coach am Bodensee.</p>
          </div>
          <Rechenweg />
        </div>
      </header>

      {/* 2 · Problem */}
      <section className="lp-sektion">
        <div className="lp-innen lp-raster-2" style={{ alignItems: "start" }}>
          <div>
            <h2 className="lp-h2">Kennst du das?</h2>
            <p className="lp-text" style={{ marginTop: 24, maxWidth: "34em" }}>
              Manche scheinen es einfach zu kapieren. Du hängst hinterher, lernst kurz vor der Klausur unter Stress – und ein Jahr später
              ist dasselbe Thema wieder da, und fast alles ist vergessen.
            </p>
          </div>
          <div>
            <div className="lp-gedanken">
              <p className="lp-gedanke">„Ich check’s einfach nicht.“</p>
              <p className="lp-gedanke">„Mathe ist zu schwer für mich.“</p>
              <p className="lp-gedanke">„Ich bin halt kein Mathe-Typ.“</p>
            </div>
            <p style={{ marginTop: 32, fontSize: 20, fontWeight: 700, lineHeight: 1.45, letterSpacing: "-0.01em", maxWidth: "28em" }}>
              Das liegt nicht an dir. Es liegt daran, dass dir niemand gezeigt hat, wie man Mathe lernt.
            </p>
          </div>
        </div>
      </section>

      {/* 3 · Geschichte */}
      <section className="lp-sektion" style={{ background: F.weiss, borderTop: `1px solid ${F.linie}`, borderBottom: `1px solid ${F.linie}` }}>
        <div className="lp-innen">
          <div style={{ maxWidth: 760 }}>
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
              <p className="lp-text" style={{ marginTop: 12 }}>Festgefahren. Mehr Lernen brachte nicht mehr Erfolg.</p>
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
        </div>
      </section>

      {/* 4 · System */}
      <section className="lp-sektion">
        <div className="lp-innen">
          <div style={{ maxWidth: 760 }}>
            <h2 className="lp-h2">Die Stellschrauben</h2>
            <p className="lp-text" style={{ marginTop: 20 }}>Jede davon kannst du hier direkt ausprobieren. Zusammen ergeben sie das System.</p>
          </div>
          <div className="lp-methoden">
            {METHODEN.map((m) => (
              <div key={m.name} className="lp-methode">
                <span className="lp-zeichen" aria-hidden="true">{m.zeichen}</span>
                <div>
                  <h3 className="lp-h3">{m.name}</h3>
                  <p className="lp-text" style={{ marginTop: 6, fontSize: 16 }}>{m.text}</p>
                  <button type="button" className="lp-link" style={{ marginTop: 10 }} onClick={() => gehe(m.ziel)}>{m.knopf}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5 · MathildaAI */}
      <section className="lp-sektion lp-dunkel" style={{ background: `radial-gradient(110% 120% at 10% 0%, #17306E 0%, ${F.nacht} 55%)` }}>
        <div className="lp-innen lp-raster-2">
          <div>
            <h2 className="lp-h2">MathildaAI findet die Stelle, an der dein Weg bricht.</h2>
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
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 36 }}>
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

      {/* 6 · Werkzeuge */}
      <section className="lp-sektion" id="lp-werkzeuge" style={{ scrollMarginTop: 64 }}>
        <div className="lp-innen">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24, flexWrap: "wrap" }}>
            <div style={{ maxWidth: 680 }}>
              <h2 className="lp-h2">Probier es selbst aus.</h2>
              <p className="lp-text" style={{ marginTop: 20 }}>Oberstufenmathe zum Anfassen: Graphen live plotten, Ebenen im Raum drehen, Wahrscheinlichkeiten simulieren. Direkt im Browser, ohne Anmeldung.</p>
            </div>
            <button type="button" className="lp-knopf lp-rand-dunkel" onClick={() => gehe({ ansicht: "start" })}>Alle Werkzeuge ansehen</button>
          </div>
          <div className="lp-werkzeuge">
            {WERKZEUGE.map((b) => (
              <div key={b.bereich} className="lp-bereich">
                <h3>{b.bereich}</h3>
                {b.liste.map(([n, z, ziel]) => (
                  <button key={n} type="button" className="lp-werkzeug" onClick={() => gehe(ziel)}><b>{n}</b><span>{z}</span></button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6b · Stimmen */}
      <section className="lp-sektion" style={{ paddingTop: 0 }}>
        <div className="lp-innen">
          <div style={{ maxWidth: 720 }}>
            <h2 className="lp-h2">Was sich verändert</h2>
            <p className="lp-text" style={{ marginTop: 20 }}>Stimmen von Schülern und Eltern, die mit dem System arbeiten.</p>
            {STIMMEN.some((x) => x.beispiel) && (
              <p className="lp-klein" style={{ marginTop: 12 }}>Die mit „Beispiel“ markierten Texte sind Platzhalter und werden durch echte Rückmeldungen ersetzt.</p>
            )}
          </div>
          <div className="lp-stimmen">
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
        </div>
      </section>

      {/* 7 · Programme */}
      <section className="lp-sektion" style={{ background: F.weiss, borderTop: `1px solid ${F.linie}` }}>
        <div className="lp-innen">
          <div style={{ maxWidth: 720 }}>
            <h2 className="lp-h2">Mit Begleitung schneller ans Ziel</h2>
            <p className="lp-text" style={{ marginTop: 20 }}>Die Werkzeuge kannst du allein nutzen. In den Programmen arbeiten wir das System gemeinsam durch – mit festen Terminen, Feedback und einer Gruppe, die mitzieht.</p>
          </div>
          <div className="lp-programme">
            <div className="lp-programm" style={{ background: F.papier, border: `1px solid ${F.linie}` }}>
              <p className="lp-dauer" style={{ color: F.see }}>2 Monate</p>
              <h3 className="lp-h2" style={{ fontSize: "clamp(28px, 3.4vw, 36px)", marginTop: 8 }}>Mathe checken</h3>
              <p className="lp-text" style={{ marginTop: 12 }}>In zwei Monaten Lücken schließen, Mathe verstehen und sicher werden.</p>
              <ul style={{ color: F.tinte }}>
                <li>Standortbestimmung: Wo genau hakt es – und warum?</li>
                <li>Jedes Thema von Grund auf, mit Bildern, Beispielen und den Werkzeugen der App</li>
                <li>Sauber aufschreiben, strukturiert rechnen, Fehler selbst finden</li>
                <li>Regelmäßiges Training bis zur nächsten Klausur</li>
              </ul>
              <div style={{ marginTop: "auto" }}><button type="button" className="lp-knopf lp-rand-dunkel" onClick={() => gehe({ ansicht: "mathecheck" })}>Mathe checken ansehen</button></div>
            </div>
            <div className="lp-programm" style={{ background: F.nacht, color: F.weiss }}>
              <p className="lp-dauer" style={{ color: F.gold }}>3 Monate</p>
              <h3 className="lp-h2" style={{ fontSize: "clamp(28px, 3.4vw, 36px)", marginTop: 8 }}>Mathe Masterclass</h3>
              <p className="lp-text" style={{ marginTop: 12, color: F.blauText }}>Werde die beste Version von dir selbst – für ein starkes Abi und Freude daran, endlich Mathe zu verstehen.</p>
              <ul>
                <li>Gemeinsame Calls mit der Gruppe: neues Thema, offene Fragen, Aha-Momente</li>
                <li>Videolektionen, Arbeitshefte mit Lösungswegen und alle Werkzeuge der App</li>
                <li>Abi-Aufgaben unter Zeit, mit Feedback zu deinem Rechenweg</li>
                <li>Intensivtage am Samstag – du wählst deinen Termin</li>
              </ul>
              <div style={{ marginTop: "auto" }}><button type="button" className="lp-knopf lp-gold" onClick={() => gehe({ ansicht: "masterclass" })}>Masterclass ansehen</button></div>
            </div>
          </div>
          <p className="lp-klein" style={{ marginTop: 20 }}>Beide Programme starten in Kürze. Welches zu dir passt, klären wir im Erstgespräch.</p>
        </div>
      </section>

      {/* 8 · Für Eltern */}
      <section className="lp-sektion">
        <div className="lp-innen">
          <div className="lp-eltern lp-raster-2">
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: F.gold }}>Für Eltern</p>
              <h2 className="lp-h2" style={{ marginTop: 12 }}>Elternabend am {ELTERNABEND.datumKurz.replace(/^[A-Za-zäöü]+, /, "").replace(". ", ".\u00A0")}</h2>
              <p className="lp-text" style={{ marginTop: 20 }}>
                In entspannter Atmosphäre in {ELTERNABEND.ort} erfahren Sie, wie Mathe lernen funktioniert, warum Talent dabei keine Rolle spielt
                und wie Sie Ihr Kind wirksam begleiten können – ohne selbst Mathe erklären zu müssen.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 32 }}>
                <button type="button" className="lp-knopf lp-gold" onClick={() => gehe({ ansicht: "elternabend" })}>Zum Elternabend</button>
                <button type="button" className="lp-knopf lp-rand-hell" onClick={() => gehe({ ansicht: "elternkurs" })}>Mindset-Kurs für Eltern</button>
              </div>
            </div>
            <dl style={{ margin: 0, display: "grid", gap: 22 }}>
              {[
                ["Wann", [ELTERNABEND.datum, ELTERNABEND.uhrzeit || "Uhrzeit folgt"]],
                ["Wo", [ELTERNABEND.ort, ELTERNABEND.strasse, ELTERNABEND.plzOrt]],
                ["Inklusive", ELTERNABEND.inklusive],
              ].map(([k, zeilen]) => (
                <div key={k} style={{ borderTop: "1px solid rgba(237,187,0,0.3)", paddingTop: 14 }}>
                  <dt style={{ fontSize: 13.5, fontWeight: 700, color: F.gold }}>{k}</dt>
                  <dd style={{ margin: "6px 0 0", fontSize: 17, lineHeight: 1.55, color: F.weiss }}>{zeilen.map((z) => <span key={z} style={{ display: "block" }}>{z}</span>)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* 9 · Über mich */}
      <section className="lp-sektion" style={{ background: F.weiss, borderTop: `1px solid ${F.linie}`, borderBottom: `1px solid ${F.linie}` }}>
        <div className={fotoDa ? "lp-innen lp-ueber" : "lp-innen lp-schmal"}>
          {fotoDa && <img className="lp-foto" src={UEBER_MICH.foto} alt={UEBER_MICH.fotoAlt} loading="lazy" onError={() => setFotoDa(false)} />}
          <div>
            <h2 className="lp-h2">Wer hinter Mythos Mathe steht</h2>
            {UEBER_MICH.absaetze.map((a, i) => <p key={i} className="lp-text" style={{ marginTop: i ? 18 : 24 }}>{a}</p>)}
            <p style={{ marginTop: 32, fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", color: F.nacht }}>System + Freude = Erfolg</p>
          </div>
        </div>
      </section>

      {/* 10 · Fragen */}
      <section className="lp-sektion">
        <div className="lp-innen lp-schmal">
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

      {/* 11 · Abschluss */}
      <section className="lp-sektion lp-dunkel" style={{ background: `linear-gradient(170deg, ${F.nacht} 0%, ${F.nachtTief} 100%)` }}>
        <div className="lp-innen lp-schmal" style={{ textAlign: "center" }}>
          <h2 className="lp-h2" style={{ fontSize: "clamp(34px, 5.2vw, 56px)" }}>Das muss nicht so bleiben.</h2>
          <p className="lp-lead" style={{ marginTop: 22, color: F.blauText }}>
            Ohne neuen Weg wird die Lücke größer und der Stress vor jeder Klausur stärker. Mit dem richtigen System wird Mathe
            zu dem Fach, in dem du wächst. Du musst diesen Weg nicht allein gehen.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginTop: 36 }}>
            <button type="button" className="lp-knopf lp-gold" onClick={gespraech}>Erstgespräch anfragen</button>
            <button type="button" className="lp-knopf lp-rand-hell" onClick={() => scrollen("lp-werkzeuge")}>Werkzeuge ausprobieren</button>
          </div>
          {hinweisText && <div style={{ display: "flex", justifyContent: "center" }}>{hinweisText}</div>}
        </div>
      </section>
    </div>
  );
}
