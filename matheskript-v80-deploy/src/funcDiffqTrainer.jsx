/* ============================================================
   Werkzeug „Differenzenquotient“ (ansicht "diffq", Pfad /differenzenquotient)
   Gebaut wie der Ableitungstrainer (func13.jsx): links die Einstellungen
   (Auto | Üben | Lernen, Ableitungsfunktion | An einer Stelle, Stufe, Würfel,
   Funktionsart), rechts die Aufgabe.
     Auto   – die App rechnet den Musterweg vor (früher „Rechnen“)
     Üben   – der Schüler geht jeden Schritt selbst, wählt aber aus zwei fertigen
              Zeilen (eine richtig, eine mit typischem Fehler; diffqUeben.js)
     Lernen – der Schüler tippt jede Zeile selbst (früher „Trainieren“) Der Schüler baut den Differenzenquotienten
   Zeile für Zeile selbst auf – der Bruch ist interaktiv, unten steht immer h:

     f′(x) = lim  f(x+h) − f(x)       Vorlage
             h→0 ─────────────
                      h
           = lim  [ A ] − [ B ]       1. Einsetzen: A = f(x+h), B = f(x)
             h→0 ─────────────
                      h
           = lim  [ Zähler ]          2. Zähler umformen – so viele Zeilen wie nötig
             h→0 ──────────             (jede neue Zeile übernimmt die Zeile darüber zum Bearbeiten)
                     h
           = lim  [ Term ]            3. h kürzen: kein Bruch mehr
             h→0
     f′(x) =  [ Term ]                4. Grenzwert h → 0

   Jede Zeile wird numerisch geprüft (x und h frei, diffqKern.js), jede gleich-
   wertige Schreibweise zählt. Tastenfeld = das des Ableitungstrainers mit h.
   Auto zeigt den Musterweg. Nur Deutsch. Keine base-Datei importiert diese Datei.
   ============================================================ */
import React, { useMemo, useState } from "react";
import { buchen } from "./buchung.jsx";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { EingabeFormel, LiveFormel, Tastenfeld, parse, hatBox } from "./func12.jsx";
import { Eingabe, EingabePopup, POP_CSS, PopupWahl } from "./funcRegelwerk.jsx";
import { MitWurzeln } from "./wurzelZeichen.jsx";
import {
  ARTEN, aufgabeAus, fxhWeg, musterweg, naechsterText, neueAufgabe, pruefeEinsetzen, pruefeFxh, pruefeZeile, stelleOk, stelleZu, texVon, zahlText,
} from "./diffqKern.js";
import { uebenWeg } from "./diffqUeben.js";

/* ---------- Zeilen-Zustand ---------- */
const leerEinsetzen = (a = "") => ({ art: "einsetzen", a, b: "", sa: null, sb: null, ha: "", hb: "", versuche: 0 });
/* Vorbereitung vor dem Bruch: f(x+h) konkret ausrechnen (x → x+h, x² → (x+h)² = x² + 2xh + h²) */
const leerFxh = () => ({ art: "fxh", text: "", status: null, hinweis: "", versuche: 0 });
const START = () => [leerFxh()];
const leerZeile = (art, text = "") => ({ art, text, status: null, hinweis: "", versuche: 0 });
const erledigt = (s) => s === "richtig" || s === "gezeigt";
const zeileFertig = (z) => (z.art === "einsetzen" ? erledigt(z.sa) && erledigt(z.sb) : erledigt(z.status));

/* Welche Zeile darf auf diese folgen? */
const WEITER = {
  fxh: [],   // nach richtigem f(x+h) folgt der Bruch von selbst (erstes Feld vorbelegt)
  einsetzen: [{ art: "bruch", name: "Zähler umformen", zeile: "ausmultiplizieren, zusammenfassen" }, { art: "frei", name: "h kürzen", zeile: "der Bruch verschwindet" }],
  bruch: [{ art: "bruch", name: "Weiter umformen", zeile: "noch eine Zeile über h" }, { art: "frei", name: "h kürzen", zeile: "der Bruch verschwindet" }],
  frei: [{ art: "frei", name: "Weiter umformen", zeile: "noch eine Zeile mit h" }, { art: "limes", name: "Grenzwert h → 0", zeile: "h = 0 einsetzen" }],
  limes: [],
};

const CSS = `
.dq-seite{background:#fff}[data-trainings-session] .dq-seite{min-height:calc(100dvh - 61px)}
.dq-seite,.dq-seite *{overflow-anchor:none}
.dq-innen{max-width:620px;margin:0 auto;padding:14px 16px 40px}
.dq-chipwrap{position:relative;margin:0 -16px 10px}
.dq-chips{display:flex;gap:8px;overflow-x:auto;padding:2px 16px 4px;scrollbar-width:none;-webkit-overflow-scrolling:touch;scroll-snap-type:x proximity;scroll-padding-left:16px}
.dq-chips::-webkit-scrollbar{display:none}
.dq-chipwrap::after{content:"";position:absolute;right:0;top:0;bottom:4px;width:34px;pointer-events:none;background:linear-gradient(90deg,rgba(255,255,255,0),#fff)}
.dq-chip{flex:0 0 auto;scroll-snap-align:start;height:46px;padding:0 18px;border-radius:999px;font-family:inherit;font-size:15.5px;font-weight:600;cursor:pointer;white-space:nowrap;border:1.5px solid ${C.linie};background:#fff;color:${C.see}}
.dq-chip[aria-pressed="true"]{background:${C.see};border-color:${C.see};color:#fff}
.dq-karte{background:transparent}
.dq-kopf{display:grid;grid-template-columns:1fr;gap:8px;align-items:stretch;margin-bottom:14px}
.dq-links{display:flex;flex-direction:column;gap:8px;min-width:0}
.dq-reihe{display:flex;gap:8px;align-items:stretch;flex:1;min-height:42px}
.dq-seg{display:flex;padding:3px;border-radius:999px;background:#EEF2F8;gap:2px;flex:1;min-height:42px}
.dq-seg button{flex:1;min-width:0;border-radius:999px;border:none;font-family:inherit;font-size:13.5px;font-weight:700;cursor:pointer;background:transparent;color:${C.grau};white-space:nowrap;padding:0 6px}
.dq-seg.eng button{font-size:12.5px;padding:0 4px}
.dq-seg button[aria-pressed="true"]{background:#fff;color:${C.see};box-shadow:0 1px 6px rgba(15,26,51,0.12)}
.dq-stufe,.dq-reihe .wk-pop.dq-stufe{flex:1;min-width:0;display:flex}
.dq-stufe .wk-pop-knopf{flex:1;min-width:0;height:auto;min-height:42px;justify-content:space-between;padding:0 12px 0 14px;font-size:14.5px}
.dq-stufe.aus{opacity:.4;pointer-events:none}
.dq-wuerfel{width:46px;flex-shrink:0;padding:0;border-radius:999px;border:none;cursor:pointer;background:${C.flaggold};font-size:22px;line-height:1;display:inline-flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(15,26,51,0.14)}
.dq-x0{display:flex;align-items:center;gap:8px;min-height:42px;padding:0 4px 0 12px;border-radius:999px;border:1.5px solid ${C.linie};background:#fff;font-size:14.5px;font-weight:700;color:${C.see}}
.dq-x0 button{width:34px;height:34px;border-radius:999px;border:1px solid ${C.linie};background:#fff;color:${C.see};font-size:18px;font-family:inherit;cursor:pointer;padding:0}
.dq-x0 b{min-width:26px;text-align:center;color:${C.tinte};font-size:16px}
/* Die Rechnung */
.dq-rechnung{display:flex;flex-direction:column;gap:6px}
.dq-zeile{display:flex;align-items:center;gap:8px;min-height:62px;padding:8px 12px;border-radius:16px;border:2px solid transparent;overflow-x:auto;overflow-y:hidden;white-space:nowrap;font-size:20px;line-height:1.5;background:#fff}
.dq-zeile[data-aktiv="true"]{border-color:${C.see};box-shadow:0 4px 16px rgba(0,77,152,0.12);cursor:pointer}
.dq-zeile[data-fertig="true"]{background:#EEF8F2;border-color:#CFE9DB}
.dq-zeile[data-fertig="true"][data-gezeigt="true"]{background:#F3F5F9;border-color:${C.linie}}
.dq-zeile[data-vorlage="true"]{background:${C.sand};color:${C.grau};border-color:transparent}
.dq-label{font-weight:700;color:${C.tinte};min-width:62px;text-align:right;flex-shrink:0;font-size:19px}
@media (max-width:600px){.dq-zeile:not([data-vorlage="true"]):not([data-art="fxh"]) .dq-label{min-width:18px}}
.dq-zeile[data-vorlage="true"] .dq-label{color:${C.grau}}
.dq-rechts{display:inline-flex;align-items:center;gap:8px;flex:1 0 auto;min-width:0}
.dq-feld>span,.dq-feld>span>span{flex-wrap:nowrap !important;white-space:nowrap}
.dq-lim{display:inline-flex;flex-direction:column;align-items:center;line-height:1.15;margin-right:4px;flex-shrink:0}
.dq-lim span:last-child{font-size:12.5px;font-weight:600;letter-spacing:0.02em}
.dq-bruch{display:inline-flex;flex-direction:column;align-items:center;margin:0 4px}
.dq-z{display:inline-flex;align-items:center;gap:8px;padding:2px 6px 5px;border-bottom:2.2px solid ${C.tinte};min-width:48px;justify-content:center}
.dq-zeile[data-vorlage="true"] .dq-z{border-bottom-color:${C.grau}}
.dq-n{font-style:italic;padding-top:3px;font-size:20px}
.dq-feld{display:inline-flex;align-items:center;min-width:58px;min-height:40px;padding:0 10px;border-radius:11px;border:1.5px dashed ${C.linie};background:#fff;cursor:text;color:${C.tinte}}
.dq-feld[data-aktiv="true"]{border-style:solid;border-color:${C.see};box-shadow:inset 0 0 0 1px ${C.see},0 2px 10px rgba(0,77,152,0.12)}
.dq-feld[data-status="richtig"]{border-style:solid;border-color:${C.smaragd};background:#F4FBF7}
.dq-feld[data-status="gezeigt"]{border-style:solid;border-color:${C.linie};background:#F3F5F9}
.dq-feld[data-status="falsch"]{border-style:solid;border-color:${C.signal};background:#FFF6F1}
.dq-feld[data-leer="true"]{border-style:dashed}
.dq-feld .dq-platz{color:${C.hellgrau};font-size:14px;font-weight:400;font-style:normal}
.dq-status{flex-shrink:0;font-size:22px;font-weight:700;min-width:26px;text-align:center}
.dq-hinweis{font-size:14px;color:${C.signal};line-height:1.55;margin:-2px 12px 6px}
.dq-weiter{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:6px 0 10px 0}
.dq-weiter>span{font-size:12.5px;font-weight:600;color:${C.grau};margin-right:2px}
.dq-weiter button{height:44px;padding:0 16px;border-radius:999px;border:1.5px solid ${C.see};background:#fff;color:${C.see};font-family:inherit;font-size:14.5px;font-weight:700;cursor:pointer;white-space:nowrap}
.dq-weiter button.haupt{background:${C.flaggold};border-color:${C.flaggold};color:${C.seeTief}}
.dq-schritt{font-size:12px;font-weight:700;letter-spacing:0.02em;color:${C.gruenDunkel};flex-shrink:0;margin-left:auto;padding-left:10px}
.dq-schritt.oben{display:none;position:absolute;left:14px;top:6px;margin:0;padding:0;letter-spacing:0.04em;font-size:10.5px}
.dq-zeile:has(.dq-schritt.oben){position:relative}
@media (max-width:600px){.dq-schritt.rechts{display:none}.dq-schritt.oben{display:block}.dq-zeile:has(.dq-schritt.oben){padding-top:22px}}
.dq-nebenknopf{background:none;border:none;color:${C.see};font-size:13.5px;font-family:inherit;cursor:pointer;padding:6px 0;text-decoration:underline}
@media (min-width:601px){
  .dq-seite{background:transparent}
  .dq-chipwrap{margin:0 0 12px}
  .dq-chipwrap::after{display:none}
  .dq-chips{flex-wrap:wrap;overflow:visible;padding:0}
  .dq-karte{background:#fff;border-radius:16px;padding:18px;box-shadow:0 2px 16px rgba(15,26,51,0.07)}
  .dq-zeile{background:${C.sand}}
  .dq-zeile[data-aktiv="true"]{background:#fff}
}
.dq-nur-desk{display:none}
@media (min-width:840px){
  .dq-innen{max-width:none;width:var(--tr-breite);padding:24px 0 56px}
  .dq-raster{display:grid;grid-template-columns:minmax(0,316px) minmax(0,1fr);gap:24px;align-items:start}
  .dq-spalte-l{position:sticky;top:56px;background:#fff;border:1px solid ${C.linie};border-radius:16px;padding:16px}
  .dq-spalte-r{min-width:0}
  .dq-nur-desk{display:block}
  .dq-kopf{grid-template-columns:1fr;gap:10px;margin-bottom:16px !important}
  .dq-chipwrap{margin:0}
  .dq-chips{flex-direction:column;flex-wrap:nowrap;gap:6px}
  .dq-chip{width:100%;height:40px;text-align:left;font-size:14px;padding:0 14px;border-radius:12px}
  .dq-karte{border:1px solid ${C.linie};box-shadow:none;padding:20px 22px}
}
/* Modus-Beschreibung unter dem Schalter */
.dq-modus-text{font-size:12.5px;color:${C.grau};line-height:1.45;margin:-2px 6px 2px}
/* Üben: zwei Zeilen zur Wahl unter der offenen Zeile */
.dq-ueben{display:flex;flex-direction:column;gap:8px;margin:4px 0 12px}
.dq-frage{font-size:14.5px;font-weight:600;color:${C.tinte};line-height:1.5;margin:2px 4px 0}
.dq-frage span{display:block;font-size:10.5px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${C.grau};margin-bottom:1px}
.dq-option{display:flex;align-items:center;gap:12px;width:100%;min-height:64px;padding:8px 14px;border-radius:16px;border:1.5px solid ${C.linie};background:#fff;font-family:inherit;font-size:20px;line-height:1.5;color:${C.tinte};cursor:pointer;text-align:left;overflow-x:auto;overflow-y:hidden;white-space:nowrap;box-shadow:0 1px 6px rgba(15,26,51,0.05);transition:border-color .15s,box-shadow .15s}
@media (hover:hover){.dq-option:not([data-status="falsch"]):hover{border-color:${C.see};box-shadow:0 4px 14px rgba(0,77,152,0.12)}}
.dq-option:focus-visible{outline:2px solid ${C.see};outline-offset:2px}
.dq-option[data-status="falsch"]{border-color:${C.signal};background:#FFF6F1;cursor:default}
.dq-option[data-status="falsch"] .dq-opt-inhalt{opacity:.75}
.dq-opt-b{flex-shrink:0;width:30px;height:30px;border-radius:999px;background:#EEF2F8;color:${C.see};font-size:13px;font-weight:700;display:inline-flex;align-items:center;justify-content:center}
.dq-option[data-status="falsch"] .dq-opt-b{background:${C.signal};color:#fff}
.dq-opt-inhalt{flex:1 0 auto;display:inline-flex;align-items:center}
.dq-mini{display:inline-flex;align-items:center;min-height:36px;padding:0 9px;border-radius:10px;border:1.5px solid ${C.linie};background:#fff}
.dq-ueben .dq-hinweis{margin:-2px 6px 2px}
.dq-ergebnis-zeile{font-size:17px;color:${C.tinte};margin-bottom:12px}
/* Im Pop-up eines Kursmoduls (kein Band): Breite der Vorlage statt der Kopfleiste */
.dk-fenster .dq-innen{width:calc(100% - 32px);max-width:none}
`;

/* ---------- Bausteine ---------- */
const Lim = () => <span className="dq-lim" aria-label="Limes h gegen 0"><span>lim</span><span>h → 0</span></span>;

function Bruch({ children, nenner = "h" }) {
  return (
    <span className="dq-bruch">
      <span className="dq-z">{children}</span>
      <span className="dq-n">{nenner}</span>
    </span>
  );
}

/* Ein Feld im Bruch: Anzeige mit Schreibmarke (aktiv), gesetzte Formel oder Platzhalter */
function Feld({ text, aktiv, status, platz, onClick, pos, setPos }) {
  const leer = !text;
  return (
    <span className="dq-feld" data-aktiv={!!aktiv} data-status={status || undefined} data-leer={leer && !aktiv} onClick={onClick} role="button" tabIndex={0}
      onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && onClick) { e.preventDefault(); onClick(e); } }}>
      {aktiv && setPos ? <EingabeFormel text={text || ""} pos={pos} setPos={setPos} hinweis={<span className="dq-platz">{platz}</span>} />
        : text ? <LiveFormel text={text} /> : <span className="dq-platz">{platz}</span>}
    </span>
  );
}

function Status({ s }) {
  if (s === "richtig") return <span className="dq-status" style={{ color: C.smaragd }}>✓</span>;
  if (s === "falsch") return <span className="dq-status" style={{ color: C.signal }}>✗</span>;
  if (s === "gezeigt") return <span className="dq-status" style={{ fontSize: 12, color: C.grau }}>Lösung</span>;
  return <span className="dq-status" />;
}

/* Üben: Inhalt einer Antwortkarte – genau das, was in die offene Zeile eingesetzt wird */
function OptionInhalt({ art, o }) {
  if (art === "einsetzen") {
    return (
      <Bruch>
        <span className="dq-mini"><LiveFormel text={o.a} /></span>
        <span>−</span>
        <span className="dq-mini"><LiveFormel text={o.b} /></span>
      </Bruch>
    );
  }
  if (art === "bruch") return <Bruch><LiveFormel text={o.text} /></Bruch>;
  return <LiveFormel text={o.text} />;
}

const MODI = [
  { id: "auto", name: "Auto", text: "Die App rechnet dir den Weg vor." },
  { id: "ueben", name: "Üben", text: "Du gehst jeden Schritt – und wählst die richtige von zwei Zeilen." },
  { id: "lernen", name: "Lernen", text: "Du rechnest jede Zeile selbst." },
];

const labelF = (x0) => (x0 === null ? "f′(x) =" : `f′(${zahlText(x0)}) =`);
const labelFxh = (x0) => (x0 === null ? "f(x+h) =" : `f(${zahlText(x0)}+h) =`);

/* Vorlage-Zeile (steht fest) */
function Vorlage({ x0 }) {
  const xs = x0 === null ? "x" : zahlText(x0);
  return (
    <div className="dq-zeile" data-vorlage="true">
      <span className="dq-label">{labelF(x0)}</span>
      <span className="dq-rechts">
        <M t={`\\lim_{h \\to 0} \\frac{f(${xs}+h) - f(${xs})}{h}`} />
      </span>
    </div>
  );
}

/* Vorbereitung im Musterweg: f(x+h) eingesetzt, bei Polynomen darunter ausmultipliziert */
function VorWeg({ zeilen, x0 }) {
  return zeilen.map((t, i) => (
    <Zeile key={`v${i}`} z={{ ...leerFxh(), text: t, status: "richtig" }} x0={x0} aktiv={false} feld="" setFeld={() => {}} pos={0} setPos={() => {}} onKlick={() => {}}
      label={i === 0 ? labelFxh(x0) : "="} schritt={i === 0 ? "Einsetzen" : "Ausmultiplizieren"} />
  ));
}

/* Eine Rechenzeile. aktiv = letzte, noch offene Zeile; feld = welches Feld die Marke hat */
function Zeile({ z, x0, aktiv, offen = false, feld, setFeld, pos, setPos, onKlick, label, schritt, platzhalter }) {
  const fertig = zeileFertig(z);
  const gezeigt = z.art === "einsetzen" ? z.sa === "gezeigt" || z.sb === "gezeigt" : z.status === "gezeigt";
  const xs = x0 === null ? "x" : zahlText(x0);
  const feldKlick = (name) => (e) => { e.stopPropagation(); if (!aktiv) return; setFeld(name); onKlick(name); };
  const status = z.art === "einsetzen" ? (fertig ? (gezeigt ? "gezeigt" : "richtig") : z.sa === "falsch" || z.sb === "falsch" ? "falsch" : null) : z.status;
  const inhalt = z.art === "einsetzen" ? (
    <Bruch>
      <Feld text={z.a} aktiv={aktiv && feld === "a"} status={z.sa} platz={platzhalter || `f(${xs}+h)`} onClick={feldKlick("a")} pos={pos} setPos={aktiv && offen && feld === "a" ? setPos : undefined} />
      <span>−</span>
      <Feld text={z.b} aktiv={aktiv && feld === "b"} status={z.sb} platz={platzhalter || `f(${xs})`} onClick={feldKlick("b")} pos={pos} setPos={aktiv && offen && feld === "b" ? setPos : undefined} />
    </Bruch>
  ) : z.art === "bruch" ? (
    <Bruch><Feld text={z.text} aktiv={aktiv} status={z.status} platz={platzhalter || "Zähler"} onClick={feldKlick("text")} pos={pos} setPos={aktiv && offen ? setPos : undefined} /></Bruch>
  ) : z.art === "fxh" ? (
    <Feld text={z.text} aktiv={aktiv} status={z.status} platz={platzhalter || (x0 === null ? "jedes x durch (x+h) ersetzen" : `(${xs}+h) für x einsetzen`)} onClick={feldKlick("text")} pos={pos} setPos={aktiv && offen ? setPos : undefined} />
  ) : (
    <Feld text={z.text} aktiv={aktiv} status={z.status} platz={platzhalter || (z.art === "limes" ? (x0 === null ? "f′(x)" : "Zahl") : "Term mit h")} onClick={feldKlick("text")} pos={pos} setPos={aktiv && offen ? setPos : undefined} />
  );
  return (
    <div className="dq-zeile" data-aktiv={aktiv} data-fertig={fertig} data-gezeigt={gezeigt} data-art={z.art} onClick={aktiv ? () => onKlick() : undefined}>
      {schritt && <span className="dq-schritt oben"><MitWurzeln text={schritt} /></span>}
      <span className="dq-label">{label}</span>
      <span className="dq-rechts">
        {z.art !== "limes" && z.art !== "fxh" && <Lim />}
        {inhalt}
      </span>
      {schritt ? <span className="dq-schritt rechts"><MitWurzeln text={schritt} /></span> : <Status s={status} />}
    </div>
  );
}

/* ---------- Das Werkzeug ---------- */
export function DifferenzenquotientTrainer({ ohneKopf = false }) {
  const [modus, setModus] = useState("lernen");            // auto (Musterweg) | ueben (zwei Zeilen zur Wahl) | lernen (selbst tippen)
  const [form, setForm] = useState("funktion");            // funktion | stelle
  const [quelle, setQuelle] = useState("typ");             // typ | zufall | eigen
  const [typ, setTyp] = useState(ARTEN[1]);
  const [stufe, setStufe] = useState(1);
  const [auf, setAuf] = useState(() => neueAufgabe("quadratisch", 1));
  const [x0, setX0] = useState(() => 2);
  const [eigenText, setEigenText] = useState("");
  const [eigenPos, setEigenPos] = useState(0);
  const [eigenOffen, setEigenOffen] = useState(false);
  const [eigenFehler, setEigenFehler] = useState("");
  const [zeilen, setZeilen] = useState(START);
  const [feld, setFeld] = useState("text");
  const [pos, setPos] = useState(0);
  const [offen, setOffen] = useState(false);
  const [bilanz, setBilanz] = useState({ richtig: 0, gesamt: 0 });
  const [musterAuf, setMusterAuf] = useState(false);
  // Üben: Runde (neue Fehlerwahl), erreichter Schritt, je Schritt die falsch gewählte Karte
  const [uebenRunde, setUebenRunde] = useState(0);
  const [uebenStand, setUebenStand] = useState(0);
  const [uebenFalsch, setUebenFalsch] = useState({});

  const stelle = form === "stelle" ? x0 : null;
  const weg = useMemo(() => musterweg(auf, stelle), [auf, stelle]);
  const vorWeg = useMemo(() => fxhWeg(auf, stelle), [auf, stelle]);
  // Musterweg nach der Vorbereitung: ins erste Feld kommt das fertig ausgerechnete f(x+h), das Ausmultiplizieren im Bruch entfällt
  const uebenSchritte = useMemo(() => uebenWeg(auf, stelle), [auf, stelle, uebenRunde]);   // eslint-disable-line react-hooks/exhaustive-deps
  const musterZeilen = useMemo(() => weg.map((m, i) => (i === 0 ? { ...m, a: vorWeg[vorWeg.length - 1] } : m)).filter((m) => m.label !== "Ausmultiplizieren"), [weg, vorWeg]);

  // Auswahlfelder lassen die Seitenposition, wie sie ist (wie im Ableitungstrainer)
  const festhalten = (fn) => {
    const y = window.scrollY;
    fn();
    const zurueck = () => window.scrollTo(0, y);   // sprung-frei: hält die Position fest (wie im Ableitungstrainer)
    requestAnimationFrame(() => { zurueck(); requestAnimationFrame(zurueck); });
    setTimeout(zurueck, 80);
  };

  const uebenNeu = () => { setUebenRunde((r) => r + 1); setUebenStand(0); setUebenFalsch({}); };
  const neustart = (a, x) => {
    setAuf(a);
    if (x !== undefined) setX0(x);
    setZeilen(START()); setFeld("text"); setPos(0); setOffen(false); setMusterAuf(false); uebenNeu();
  };
  const neueFunktion = (t = typ, st = stufe, q = quelle) => {
    const a = q === "zufall" ? neueAufgabe(null, st) : q === "eigen" ? auf : neueAufgabe(t.id, st);
    neustart(a, stelleOk(a, x0) ? undefined : stelleZu(a));
  };
  const waehleTyp = (t) => { setQuelle("typ"); setTyp(t); setEigenOffen(false); neueFunktion(t, stufe, "typ"); };
  const waehleZufall = () => { setQuelle("zufall"); setEigenOffen(false); neueFunktion(typ, stufe, "zufall"); };
  const waehleEigen = () => { setQuelle("eigen"); setEigenOffen(true); setEigenFehler(""); };
  const uebernehmen = () => {
    const b = parse(eigenText);
    if (!b || hatBox(b)) { setEigenFehler("Der Term ist noch nicht vollständig."); return; }
    const a = aufgabeAus(eigenText);
    if (!a) { setEigenFehler("Im Term darf nur x als Variable vorkommen."); return; }
    setEigenFehler("");
    neustart({ ...a, art: "eigen" }, stelleOk(a, x0) ? undefined : stelleZu(a));
    setEigenOffen(false);
  };
  const formSetzen = (f) => { setForm(f); setZeilen(START()); setFeld("text"); setPos(0); setOffen(false); setMusterAuf(false); uebenNeu(); };
  const x0Setzen = (delta) => {
    let v = x0 + delta, schutz = 0;
    while (!stelleOk(auf, v) && schutz++ < 12) v += delta || 1;
    setX0(v); setZeilen(START()); setFeld("text"); setPos(0); setOffen(false); setMusterAuf(false); uebenNeu();
  };

  const aktiv = zeilen.length - 1;
  const letzte = zeilen[aktiv];
  const fertig = letzte.art === "limes" && zeileFertig(letzte);
  const letzteFertig = zeileFertig(letzte);

  const textVon = (z, f) => (z.art === "einsetzen" ? (f === "a" ? z.a : z.b) : z.text);
  const aktText = textVon(letzte, feld);
  const setAktText = (t) => setZeilen(zeilen.map((z, i) => {
    if (i !== aktiv) return z;
    if (z.art === "einsetzen") return feld === "a" ? { ...z, a: t, sa: null, ha: "" } : { ...z, b: t, sb: null, hb: "" };
    return { ...z, text: t, status: null, hinweis: "" };
  }));

  const oeffnen = (name) => {
    const f = name || (letzte.art === "einsetzen" ? feld : "text");
    if (!offen || (name && name !== feld)) { setPos(textVon(letzte, f).length); setOffen(true); } else if (!name) setOffen(false);
  };

  /* Nach der Vorbereitung öffnet sich der Bruch: erstes Feld = das ausgerechnete f(x+h), zweites Feld wartet */
  const bruchOeffnen = (basis, fxhText) => {
    setZeilen([...basis, leerEinsetzen(fxhText)]);
    setFeld("b"); setPos(0); setOffen(true);
  };

  const pruefen = () => {
    if (letzteFertig) return;
    if (letzte.art === "fxh") {
      const r = pruefeFxh(auf, stelle, letzte.text);
      const neu = zeilen.map((z, i) => (i === aktiv ? { ...z, status: r.ok ? "richtig" : "falsch", hinweis: r.hinweis, versuche: z.versuche + 1 } : z));
      buchen({ richtig: !!r.ok, gruppe: "diffq-fxh", stufe, art: auf.art });
      if (r.ok) bruchOeffnen(neu, letzte.text); else setZeilen(neu);
      return;
    }
    if (letzte.art === "einsetzen") {
      const r = pruefeEinsetzen(auf, stelle, letzte.a, letzte.b);
      const neu = { ...letzte, sa: r.a.ok ? "richtig" : "falsch", sb: r.b.ok ? "richtig" : "falsch", ha: r.a.hinweis, hb: r.b.hinweis, versuche: letzte.versuche + 1 };
      setZeilen(zeilen.map((z, i) => (i === aktiv ? neu : z)));
      if (r.a.ok && r.b.ok) setOffen(false);
      else { const f = r.a.ok ? "b" : "a"; setFeld(f); setPos(textVon(neu, f).length); }
      buchen({ richtig: r.a.ok && r.b.ok, gruppe: "diffq-einsetzen", stufe, art: auf.art });
      return;
    }
    const r = pruefeZeile(auf, stelle, letzte.art, letzte.text);
    setZeilen(zeilen.map((z, i) => (i === aktiv ? { ...z, status: r.ok ? "richtig" : "falsch", hinweis: r.hinweis, versuche: z.versuche + 1 } : z)));
    if (letzte.art === "limes") {
      setBilanz((b) => ({ richtig: b.richtig + (r.ok ? 1 : 0), gesamt: b.gesamt + 1 }));
      buchen({ richtig: !!r.ok, gruppe: "diffq-grenzwert", stufe, art: auf.art });
    }
    if (r.ok) setOffen(false);
  };

  const naechste = (artNeu) => {
    const t = naechsterText(letzte);
    setZeilen([...zeilen, leerZeile(artNeu, t)]);
    setFeld("text"); setPos(t.length); setOffen(true);
  };
  const zeileEntfernen = () => {
    if (zeilen.length < 3) return;   // Vorbereitung und Bruch bleiben
    setZeilen(zeilen.slice(0, -1)); setOffen(false);
  };
  const loesungZeigen = () => {
    const mw = weg;
    if (letzte.art === "fxh") {
      const text = vorWeg[vorWeg.length - 1];
      bruchOeffnen(zeilen.map((z, i) => (i === aktiv ? { ...z, text, status: "gezeigt", hinweis: "" } : z)), text);
      return;
    }
    if (letzte.art === "einsetzen") {
      const m = mw[0];
      setZeilen(zeilen.map((z, i) => (i === aktiv ? { ...z, a: m.a, b: m.b, sa: "gezeigt", sb: "gezeigt", ha: "", hb: "" } : z)));
      setOffen(false);
      return;
    }
    const kandidaten = mw.filter((m) => m.art === letzte.art);
    let text = kandidaten.length ? kandidaten[kandidaten.length - 1].text : null;
    if (text === null && letzte.art === "bruch") text = naechsterText(mw[0]);
    if (text === null) {
      setZeilen(zeilen.map((z, i) => (i === aktiv ? { ...z, hinweis: "Für diese Funktion kennt die App nur das Einsetzen und das Ergebnis – diesen Schritt musst du selbst finden." } : z)));
      return;
    }
    setZeilen(zeilen.map((z, i) => (i === aktiv ? { ...z, text, status: "gezeigt", hinweis: "" } : z)));
    setOffen(false);
  };

  /* ---------- Üben: je Schritt zwei Zeilen zur Wahl ---------- */
  const nUeben = uebenSchritte.length;
  const nVor = uebenSchritte.filter((u) => u.art === "fxh").length;
  const uebenFertig = uebenStand >= nUeben;
  const uebenAnhieb = uebenSchritte.slice(0, uebenStand).filter((_, i) => uebenFalsch[i] === undefined).length;
  const uebenWaehle = (k) => {
    const sch = uebenSchritte[uebenStand];
    if (!sch || uebenFalsch[uebenStand] === k) return;
    if (k !== sch.richtigIndex) { setUebenFalsch({ ...uebenFalsch, [uebenStand]: k }); return; }
    const neu = uebenStand + 1;
    setUebenStand(neu);
    if (neu === nUeben) {
      const anhieb = uebenAnhieb + (uebenFalsch[uebenStand] === undefined ? 1 : 0);
      buchen({ richtig: anhieb === nUeben, gruppe: "diffq-ueben", stufe, art: auf.art });
    }
  };
  // Nach dem Üben dieselbe Funktion in Lernen selbst rechnen
  const zuLernen = () => festhalten(() => { setZeilen(START()); setFeld("text"); setPos(0); setOffen(false); setMusterAuf(false); setModus("lernen"); });

  const arten = [
    ...ARTEN.map((t) => ({ id: t.id, name: t.name, an: quelle === "typ" && typ.id === t.id, los: () => waehleTyp(t) })),
    { id: "zufall", name: "🎲 Zufall", an: quelle === "zufall", los: waehleZufall },
    { id: "eigen", name: "Eigene Funktion", an: quelle === "eigen", los: waehleEigen },
  ];
  const regelText = quelle === "typ" ? typ.regel : quelle === "zufall" ? "Zufallsfunktion" : "Eigene Funktion";
  const schritte = letzteFertig && !fertig ? WEITER[letzte.art] : [];
  const platzhalter = letzte.art === "fxh" ? (stelle === null ? "f(x+h): jedes x durch (x+h) ersetzen" : `(${zahlText(stelle)}+h) für x einsetzen`) : letzte.art === "einsetzen" ? (feld === "a" ? `f(${stelle === null ? "x" : zahlText(stelle)}+h) eingeben` : `f(${stelle === null ? "x" : zahlText(stelle)}) eingeben`)
    : letzte.art === "limes" ? "h = 0 einsetzen und vereinfachen" : "Term mit x und h";

  return (
    <div className="dq-seite">
      <style>{POP_CSS}</style>
      <style>{CSS}</style>
      <div className="dq-innen">
       <div className="dq-raster">
        <div className="dq-spalte-l">
          <div className="dq-kopf">
            <div className="dq-links">
              <div className="dq-seg" role="group" aria-label="Modus">
                {MODI.map((m) => (
                  <button key={m.id} type="button" aria-pressed={modus === m.id} title={m.text} onClick={() => festhalten(() => setModus(m.id))}>{m.name}</button>
                ))}
              </div>
              <p className="dq-modus-text" data-diffq-modus-text>{MODI.find((m) => m.id === modus).text}</p>
              <div className="dq-seg eng" role="group" aria-label="Ableitungsfunktion oder an einer Stelle">
                {[["funktion", "Ableitungsfunktion"], ["stelle", "An einer Stelle"]].map(([id, name]) => (
                  <button key={id} type="button" aria-pressed={form === id} onClick={() => festhalten(() => formSetzen(id))}>{name}</button>
                ))}
              </div>
              {form === "stelle" && (
                <div className="dq-x0" role="group" aria-label="Stelle x₀">
                  <span>Stelle x₀ =</span>
                  <button type="button" onClick={() => festhalten(() => x0Setzen(-1))} aria-label="x₀ kleiner">−</button>
                  <b>{zahlText(x0)}</b>
                  <button type="button" onClick={() => festhalten(() => x0Setzen(1))} aria-label="x₀ größer">+</button>
                </div>
              )}
              <div className="dq-reihe">
                <PopupWahl className={`dq-stufe${quelle === "eigen" ? " aus" : ""}`} wert={stufe} label="Stufe wählen" optionen={[1, 2, 3].map((st) => ({ id: st, name: `Stufe ${st}` }))}
                  kopf={(o) => (o ? o.name : "Stufe")} onWaehle={(st) => festhalten(() => { setStufe(st); neueFunktion(typ, st); })} />
                <button type="button" className="dq-wuerfel" onClick={() => festhalten(() => (quelle === "eigen" ? setEigenOffen(true) : neueFunktion()))}
                  aria-label="Neue Aufgabe würfeln" title="Neue Aufgabe"><span aria-hidden="true">🎲</span></button>
              </div>
            </div>
          </div>
          <p className="dq-nur-desk" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.grau, margin: "0 2px 8px" }}>Funktionsart</p>
          <div className="dq-chipwrap">
            <div className="dq-chips" role="group" aria-label="Welche Funktionen möchtest du ableiten?">
              {arten.map((a) => (
                <button key={a.id} type="button" className="dq-chip" aria-pressed={a.an} onClick={() => festhalten(a.los)}>{a.name}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="dq-spalte-r">
          {quelle === "eigen" && eigenOffen && (
            <div className="dq-karte" style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 14, color: C.grau, marginBottom: 8 }}>Gib deine Funktion ein und tippe auf „Übernehmen“ – zum Beispiel x^3 oder 1/(x+2).</p>
              <div style={{ border: `1.5px solid ${C.linie}`, borderRadius: 14, padding: "8px 14px", minHeight: 56, display: "flex", alignItems: "center", gap: 8, overflowX: "auto", marginBottom: 10 }}>
                <span style={{ fontWeight: 700, fontSize: 20 }}>f(x) =</span>
                <span style={{ fontSize: 22, lineHeight: 1.9 }}>
                  <LiveFormel text={eigenText} pos={eigenPos} setPos={setEigenPos} hinweis={<span style={{ color: C.hellgrau, fontSize: 15 }}>…</span>} />
                </span>
              </div>
              <Tastenfeld wert={eigenText} setWert={setEigenText} pos={eigenPos} setPos={setEigenPos} onOk={uebernehmen} />
              {eigenFehler && <p style={{ fontSize: 14, color: C.signal, margin: "10px 2px 0" }}>{eigenFehler}</p>}
              <button onClick={uebernehmen}
                style={{ width: "100%", height: 56, marginTop: 12, borderRadius: 14, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 17, fontWeight: 700, color: C.seeTief, background: C.flaggold }}>
                Übernehmen
              </button>
            </div>
          )}

          {!(quelle === "eigen" && eigenOffen) && (
            <div className="dq-karte" data-diffq-aufgabe={auf.f}>
              {!ohneKopf && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 16, fontWeight: 700, color: C.tinte, lineHeight: 1.25 }}>{form === "stelle" ? "Steigung an einer Stelle" : "Ableitungsfunktion bilden"}</p>
                    <p style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.35 }}>{regelText}{bilanz.gesamt ? ` · ${bilanz.richtig} von ${bilanz.gesamt} richtig` : ""}</p>
                  </div>
                  <button type="button" onClick={() => (quelle === "eigen" ? setEigenOffen(true) : neueFunktion())}
                    style={{ flexShrink: 0, height: 46, padding: "0 18px", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 15, fontWeight: 700, color: C.seeTief, background: C.flaggold, display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <span aria-hidden="true" style={{ fontSize: 18, lineHeight: 1 }}>↻</span>{quelle === "eigen" ? "Funktion ändern" : "Neue Funktion"}
                  </button>
                </div>
              )}
              <div style={{ background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`, borderRadius: 16, padding: "14px 18px", marginBottom: 14, overflowX: "auto", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <span style={{ color: C.weiss, fontSize: 24, fontWeight: 700, whiteSpace: "nowrap", lineHeight: 1.9 }}>
                  <M t={`f(x) = ${auf.tex}`} />
                </span>
                {form === "stelle" && (
                  <span style={{ color: C.goldText, fontSize: 14, fontWeight: 600, whiteSpace: "nowrap" }}>Gesucht: f′({zahlText(x0)}) – die Steigung an der Stelle x₀ = {zahlText(x0)}</span>
                )}
              </div>

              {modus === "auto" ? (
                <div className="dq-rechnung" data-diffq-muster>
                  <VorWeg zeilen={vorWeg} x0={stelle} />
                  <Vorlage x0={stelle} />
                  {musterZeilen.map((m, i) => (
                    <Zeile key={i} z={m.art === "einsetzen" ? { ...leerEinsetzen(), a: m.a, b: m.b, sa: "richtig", sb: "richtig" } : { ...leerZeile(m.art, m.text), status: "richtig" }}
                      x0={stelle} aktiv={false} feld="" setFeld={() => {}} pos={0} setPos={() => {}} onKlick={() => {}} label="=" schritt={m.label} />
                  ))}
                  {musterZeilen.length <= 2 && <p style={{ fontSize: 13.5, color: C.grau, margin: "6px 12px 0", lineHeight: 1.6 }}>Für diese Funktion zeigt die App nur das Einsetzen und das Ergebnis – die Umformung dazwischen ist dein Teil.</p>}
                </div>
              ) : modus === "ueben" ? (
                <div className="dq-rechnung" data-diffq-ueben-weg>
                  {uebenSchritte.slice(0, Math.min(uebenStand + 1, nUeben)).map((u, i) => {
                    const fertigZ = i < uebenStand;
                    const z = u.art === "fxh" ? { ...leerFxh(), text: fertigZ ? u.richtig.text : "", status: fertigZ ? "richtig" : null }
                      : u.art === "einsetzen" ? { ...leerEinsetzen(u.richtig.a), b: fertigZ ? u.richtig.b : "", sa: "richtig", sb: fertigZ ? "richtig" : null }
                        : { ...leerZeile(u.art, fertigZ ? u.richtig.text : ""), status: fertigZ ? "richtig" : null };
                    return (
                      <div key={`${uebenRunde}-${i}`}>
                        <Zeile z={z} x0={stelle} aktiv={!fertigZ} feld={u.art === "einsetzen" ? "b" : "text"} setFeld={() => {}} pos={0} setPos={() => {}} onKlick={() => {}}
                          label={u.art === "fxh" && i === 0 ? labelFxh(stelle) : "="} schritt={u.label} platzhalter="?" />
                        {!fertigZ && (
                          <div className="dq-ueben" data-diffq-ueben>
                            <p className="dq-frage"><span>Schritt {i + 1} von {nUeben}</span>{u.frage}</p>
                            {u.optionen.map((o, k) => {
                              const falsch = uebenFalsch[i] === k;
                              return (
                                <React.Fragment key={k}>
                                  <button type="button" className="dq-option" data-status={falsch ? "falsch" : undefined} data-diffq-option={k === u.richtigIndex ? "richtig" : "falsch"}
                                    aria-disabled={falsch || undefined} aria-label={`Zeile ${k === 0 ? "A" : "B"} einsetzen`} onClick={() => uebenWaehle(k)}>
                                    <span className="dq-opt-b" aria-hidden="true">{falsch ? "✗" : k === 0 ? "A" : "B"}</span>
                                    <span className="dq-opt-inhalt"><OptionInhalt art={u.art} o={o} /></span>
                                  </button>
                                  {falsch && <p className="dq-hinweis" data-diffq-ueben-hinweis><MitWurzeln text={u.falschHinweis} /></p>}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        )}
                        {/* Die Vorlage steht unter der Vorbereitung – sichtbar ab dem ersten Schritt */}
                        {i === Math.min(uebenStand, nVor - 1) && <Vorlage x0={stelle} />}
                      </div>
                    );
                  })}
                  {uebenFertig && (
                    <div style={{ textAlign: "center", padding: "12px 0 4px" }} data-diffq-ueben-fertig>
                      <p style={{ fontSize: 20, fontWeight: 700, color: C.smaragd, marginBottom: 4 }}>
                        {uebenAnhieb === nUeben ? `Alle ${nUeben} Schritte auf Anhieb – stark! 🎉` : `Geschafft – ${uebenAnhieb} von ${nUeben} Schritten auf Anhieb.`}
                      </p>
                      <p className="dq-ergebnis-zeile">{labelF(stelle)} <M t={texVon(uebenSchritte[nUeben - 1].richtig.text)} /></p>
                      <p style={{ fontSize: 13.5, color: C.grau, margin: "0 auto 14px", maxWidth: 420, lineHeight: 1.6 }}>Nächste Stufe: Rechne dieselbe Funktion in „Lernen“ – jede Zeile selbst, ohne Auswahl.</p>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                        <button type="button" onClick={zuLernen}
                          style={{ flex: "1 1 200px", height: 54, borderRadius: 14, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 16.5, fontWeight: 700, color: C.weiss, background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)` }}>
                          Jetzt selbst rechnen
                        </button>
                        <button type="button" onClick={() => (quelle === "eigen" ? neustart(auf) : neueFunktion())}
                          style={{ flex: "1 1 160px", height: 54, borderRadius: 14, border: `1.5px solid ${C.see}`, cursor: "pointer", fontFamily: "inherit", fontSize: 16, fontWeight: 700, color: C.see, background: C.weiss }}>
                          {quelle === "eigen" ? "Nochmal üben" : "Neue Funktion"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="dq-rechnung" data-diffq-rechnung>
                  {zeilen.map((z, i) => (
                    <div key={i}>
                      {/* Die Vorbereitung (f(x+h) ausrechnen) steht über der Vorlage, der Bruch darunter */}
                      {i === 1 && <Vorlage x0={stelle} />}
                      <Zeile z={z} x0={stelle} aktiv={i === aktiv && !letzteFertig} offen={offen} feld={feld} setFeld={setFeld} pos={pos} setPos={setPos}
                        onKlick={(name) => oeffnen(name)} label={z.art === "fxh" ? labelFxh(stelle) : "="} />
                      {z.art === "einsetzen" && z.ha && <p className="dq-hinweis">1. Feld: {z.ha}</p>}
                      {z.art === "einsetzen" && z.hb && <p className="dq-hinweis">2. Feld: {z.hb}</p>}
                      {z.art !== "einsetzen" && z.hinweis && <p className="dq-hinweis">{z.hinweis}</p>}
                      {i === aktiv && !letzteFertig && offen && (
                        <EingabePopup style={{ marginTop: 2, marginBottom: 10 }}>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: letzte.versuche > 0 || i > 0 ? 6 : 0 }}>
                            {letzte.versuche > 0 && (
                              <button type="button" onClick={loesungZeigen}
                                style={{ flex: 1, height: 44, borderRadius: 14, border: `1.5px solid ${C.linie}`, cursor: "pointer", fontFamily: "inherit", fontSize: 14.5, fontWeight: 600, color: C.see, background: C.weiss }}>
                                Lösung zeigen
                              </button>
                            )}
                            {i > 1 && <button type="button" className="dq-nebenknopf" onClick={zeileEntfernen}>Zeile entfernen</button>}
                          </div>
                          <Eingabe text={aktText} setText={setAktText} pos={pos} setPos={setPos} onEnter={pruefen} platzhalter={platzhalter} variablen={["h"]} />
                        </EingabePopup>
                      )}
                      {i === 0 && zeilen.length === 1 && <Vorlage x0={stelle} />}
                      {i === aktiv && schritte.length > 0 && (
                        <div className="dq-weiter" data-diffq-weiter>
                          <span>Nächste Zeile:</span>
                          {schritte.map((s, k) => (
                            <button key={s.art + k} type="button" className={k === schritte.length - 1 ? "haupt" : ""} onClick={() => naechste(s.art)} title={s.zeile}>{s.name}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {fertig && (
                    <div style={{ textAlign: "center", padding: "12px 0 4px" }} data-diffq-fertig>
                      <p style={{ fontSize: 20, fontWeight: 700, color: C.smaragd, marginBottom: 4 }}>
                        {zeilen.every(zeileFertig) && !zeilen.some((z) => (z.art === "einsetzen" ? z.sa === "gezeigt" || z.sb === "gezeigt" : z.status === "gezeigt")) ? "Von Hand hergeleitet – stark! 🎉" : "Geschafft – der Grenzwert steht."}
                      </p>
                      <p style={{ fontSize: 17, color: C.tinte, marginBottom: 12 }}>
                        {labelF(stelle)} <M t={texVon(letzte.text)} />
                      </p>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                        <button onClick={() => (quelle === "eigen" ? neustart(auf) : neueFunktion())}
                          style={{ flex: "1 1 200px", height: 54, borderRadius: 14, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 16.5, fontWeight: 700, color: C.weiss, background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)` }}>
                          {quelle === "eigen" ? "Nochmal von vorn" : "Neue Funktion"}
                        </button>
                        <button type="button" className="dq-nebenknopf" onClick={() => setMusterAuf(!musterAuf)}>{musterAuf ? "Musterweg ausblenden" : "Musterweg ansehen"}</button>
                      </div>
                      {musterAuf && (
                        <div className="dq-rechnung" style={{ marginTop: 14, textAlign: "left" }}>
                          <VorWeg zeilen={vorWeg} x0={stelle} />
                          <Vorlage x0={stelle} />
                          {musterZeilen.map((m, i) => (
                            <Zeile key={i} z={m.art === "einsetzen" ? { ...leerEinsetzen(), a: m.a, b: m.b, sa: "richtig", sb: "richtig" } : { ...leerZeile(m.art, m.text), status: "richtig" }}
                              x0={stelle} aktiv={false} feld="" setFeld={() => {}} pos={0} setPos={() => {}} onKlick={() => {}} label="=" schritt={m.label} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {!fertig && !letzteFertig && !offen && (
                    <p style={{ fontSize: 13, color: C.grau, margin: "4px 12px 0", lineHeight: 1.6 }}>
                      {letzte.art === "fxh" ? "Erst die Vorbereitung: Rechne f(x+h) aus – tipp auf das Feld. Danach baust du den Bruch." : letzte.art === "einsetzen" ? "Tipp auf ein Feld im Bruch und setze ein. OK prüft beide Felder." : letzte.art === "limes" ? "Setz h = 0 ein und vereinfache – OK prüft." : "Bearbeite die Zeile – OK prüft, ob sie zur Zeile darüber gleichwertig ist."}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
       </div>
      </div>
    </div>
  );
}
