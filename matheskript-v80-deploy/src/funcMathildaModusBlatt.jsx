/* ======================================================================
   Mathilda-Modus – Schaubild „So geht's auf Papier“
   Zwei Tafeln nebeneinander:
     ① Schreib die Aufgabe auf – ein leeres DIN-A4-Blatt, die Aufgabe entsteht oben in Handschrift,
        unten auf dem Blatt steht der Hinweis in der Schrift der Seite.
     ② Rechne nach dem Schema – goldener Pfeil; Antippen schiebt ② links neben ①,
        dasselbe Blatt zeigt die Aufgabe sauber nach dem Schema gerechnet, die Muster
        (Blanko, „=“ untereinander, Rand, Kasten) sind in Gold markiert.
   Nur Darstellung. Keine base-Datei darf diese Datei importieren.
   ====================================================================== */
import React, { useState } from "react";
import { C } from "./base1.jsx";
import { zw } from "./ui2.jsx";

const GOLD = C.flaggold, NACHT = C.seeTief, TINTE = "#101827";
const goldVerlauf = `linear-gradient(135deg, #F8D23A 0%, ${GOLD} 55%, #D9A600 100%)`;
const HAND = "'Patrick Hand', 'Segoe Print', sans-serif";
const AUFGABE = "3(x − 4) + 5 = −4";

/* Zeilen: links, rechts, Rand (Umformung oder Nebenrechnung), Art */
const ZEILEN = [
  { l: "3(x − 4) + 5", r: "−4" },
  { l: "3x − 12 + 5", r: "−4", box: "3·4 = 12" },
  { l: "3x − 7", r: "−4", rand: "+ 7" },
  { l: "3x", r: "3", rand: ": 3" },
  { l: "x", r: "1", kasten: true },
];

const SCHEMA = () => [
  [zw("Blanko + schwarzer Stift", "Plain paper + black pen"), zw("weißes Papier ohne Karo", "white paper, no squares")],
  [zw("Ein Schritt pro Zeile", "One step per line"), zw("„=“ genau untereinander", "“=” exactly below each other")],
  [zw("Umformung an den Rand", "Operation at the margin"), zw("Nebenrechnung in eine Box", "side calculation in a box")],
  [zw("Ergebnis in den Kasten", "Result in a box"), zw("vollständig vereinfacht", "fully simplified")],
];

const CSS = `
@keyframes mmbSchreib { from { clip-path: inset(-8px 100% -8px -3px); } to { clip-path: inset(-8px -3px -8px -3px); } }
@keyframes mmbStift { from { left: 0; } to { left: 100%; } }
@keyframes mmbEin { from { opacity: 0; } to { opacity: 1; } }
@keyframes mmbZeile { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: none; } }
@keyframes mmbPop { 0% { opacity: 0; transform: scale(.3); } 70% { opacity: 1; transform: scale(1.18); } 100% { opacity: 1; transform: scale(1); } }
@keyframes mmbBand { from { background-color: rgba(237,187,0,0); } to { background-color: rgba(237,187,0,.32); } }
@keyframes mmbRand { from { border-left-color: rgba(217,166,0,0); } to { border-left-color: rgba(217,166,0,.95); } }
@keyframes mmbWink { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(4px); } }
.mmb-reihe { display: grid; gap: 8px; align-items: stretch; transition: grid-template-columns .6s cubic-bezier(.65,0,.25,1); }
.mmb-tafel { position: relative; overflow: hidden; border-radius: 16px; background: #fff; border: 1px solid ${C.linie}; min-width: 0; }
.mmb-inhalt { padding: 12px; min-width: 200px; animation: mmbEin .35s ease .3s both; }
.mmb-tab { position: absolute; inset: 0; width: 100%; display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 14px 4px; border: none; background: transparent; cursor: pointer; font-family: inherit; color: ${C.tinte}; }
.mmb-tab:focus-visible { outline: 3px solid ${C.see}; outline-offset: -3px; border-radius: 16px; }
.mmb-pfeil { width: 36px; height: 36px; border-radius: 999px; background: ${goldVerlauf}; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(237,187,0,.45); flex-shrink: 0; }
.mmb-pfeil svg { animation: mmbWink 1.3s ease-in-out infinite; }
.mmb-vert { writing-mode: vertical-rl; font-size: 13px; font-weight: 700; line-height: 1.2; letter-spacing: .01em; color: ${C.tinte}; }
.mmb-blatt { container-type: inline-size; }
.mmb-hand { font-family: ${HAND}; color: ${TINTE}; font-size: 16px; }
@supports (font-size: 1cqw) { .mmb-hand { font-size: 7.3cqw; } }
.mmb-schreib { display: inline-block; animation: mmbSchreib 1.7s cubic-bezier(.3,.1,.4,1) .5s both; }
.mmb-stift { position: absolute; bottom: .12em; width: 1.15em; height: 1.15em; margin-left: -.15em; animation: mmbStift 1.7s cubic-bezier(.3,.1,.4,1) .5s both; pointer-events: none; }
.mmb-raster { display: grid; grid-template-columns: auto auto auto minmax(0,1fr); column-gap: .3em; }
.mmb-raster > div { position: relative; line-height: 1.9; white-space: nowrap; animation: mmbZeile .5s ease var(--d, 0s) both; }
.mmb-l { text-align: right; }
.mmb-g { text-align: center; padding: 0 .2em; background-color: rgba(237,187,0,.32); }
.mmb-raster > .mmb-g { animation: mmbZeile .5s ease var(--d, 0s) both, mmbBand .7s ease 3.6s both; }
.mmb-m { font-size: .8em; padding-left: .55em; border-left: 2px dashed rgba(217,166,0,.95); display: flex; align-items: center; }
.mmb-raster > .mmb-m { animation: mmbZeile .5s ease var(--d, 0s) both, mmbRand .7s ease 3.6s both; }
.mmb-nb { display: inline-block; border: 1.6px solid ${TINTE}; border-radius: 6px; padding: 0 .35em; font-size: .9em; line-height: 1.35; }
.mmb-b { position: absolute; width: 18px; height: 18px; border-radius: 999px; background: ${goldVerlauf}; color: ${TINTE}; font-family: inherit; font-size: 11px; font-weight: 800; line-height: 18px; text-align: center; box-shadow: 0 1px 4px rgba(14,30,74,.35); z-index: 1; animation: mmbPop .45s ease var(--d, 3.6s) both; }
@media (prefers-reduced-motion: reduce) {
  .mmb-reihe { transition: none; }
  .mmb-inhalt, .mmb-schreib, .mmb-stift, .mmb-raster > div, .mmb-raster > .mmb-g, .mmb-raster > .mmb-m, .mmb-b, .mmb-pfeil svg { animation: none !important; }
  .mmb-stift { left: 100%; }
}
`;

const Pfeil = ({ links }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke={TINTE} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={links ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
  </svg>
);

const Nummer = ({ n }) => (
  <span aria-hidden="true" style={{ width: 28, height: 28, borderRadius: 999, background: NACHT, color: GOLD, fontWeight: 800, fontSize: 13.5, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{n}</span>
);

const IN = { position: "static", marginLeft: 8 };   /* Marke im Textfluss der Randspalte */
const Marke = ({ n, stil, d }) => <span className="mmb-b" aria-hidden="true" style={{ ...stil, "--d": d }}>{n}</span>;

/* Ein Blatt im DIN-A4-Format (210 : 297) */
function Blatt({ children, marke }) {
  return (
    <div className="mmb-blatt" data-mm-din-a4
      style={{ position: "relative", width: "100%", maxWidth: 320, margin: "0 auto", aspectRatio: "210 / 297", boxSizing: "border-box", padding: "7% 6%", display: "flex", flexDirection: "column",
        background: "#fff", border: `1px solid ${C.linie}`, borderRadius: 4, boxShadow: "0 12px 26px rgba(14,30,74,0.16), 0 2px 4px rgba(14,30,74,0.08)" }}>
      {marke}
      {children}
    </div>
  );
}

function Kopf({ nr, titel, text }) {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <Nummer n={nr} />
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: C.tinte, letterSpacing: "-0.01em", lineHeight: 1.25 }}>{titel}</h3>
      </div>
      <p style={{ margin: "0 0 10px", fontSize: 13, lineHeight: 1.5, color: C.grau }}>{text}</p>
    </>
  );
}

/* ① Leeres Blatt, Aufgabe entsteht oben in Handschrift, unten der Hinweis in der Schrift der Seite */
function BlattEins() {
  return (
    <>
      <Kopf nr={1} titel={zw("Schreib die Aufgabe auf", "Write down the task")}
        text={zw("Nimm ein leeres weißes Blatt und einen schwarzen Stift. Schreib die Aufgabe oben hin.", "Take a blank white sheet and a black pen. Write the task at the top.")} />
      <Blatt>
        <div className="mmb-hand" style={{ position: "relative", display: "inline-block", alignSelf: "flex-start", lineHeight: 1.5, whiteSpace: "nowrap" }} data-mm-handschrift>
          <span className="mmb-schreib">{AUFGABE}</span>
          <svg className="mmb-stift" viewBox="0 0 24 24" fill="none" stroke={TINTE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 20l4-1 11-11-3-3L5 16z" fill="#fff" /><path d="M14 6l3 3" /><path d="M4 20l1-4 3 3z" fill={TINTE} />
          </svg>
        </div>
        <p style={{ margin: "auto 0 0", fontSize: 12.5, lineHeight: 1.5, color: C.grau, fontFamily: "inherit" }} data-mm-blatt-hinweis>
          {zw("Einmal oben aufs Blatt – zum Beispiel die Gleichung oder die Funktion, die du ableiten sollst.", "Once at the top of the sheet – for example the equation, or the function you have to differentiate.")}
        </p>
      </Blatt>
    </>
  );
}

/* ② Dieselbe Aufgabe, sauber nach dem Schema gerechnet – Muster in Gold */
function BlattZwei() {
  const n = ZEILEN.length;
  const d = (i) => `${0.9 + i * 0.5}s`;
  return (
    <>
      <Kopf nr={2} titel={zw("Rechne nach dem Schema", "Calculate following the scheme")}
        text={zw("Dasselbe Blatt, mit sauberem Lösungsweg. Die goldenen Marken zeigen die Muster.", "The same sheet, with a clean working. The gold marks show the patterns.")} />
      <Blatt marke={<Marke n="1" stil={{ top: -9, left: -9 }} d="3.6s" />}>
        <div className="mmb-hand" style={{ lineHeight: 1.5, paddingBottom: ".12em", marginBottom: ".3em", borderBottom: "1.2px solid rgba(16,24,39,0.35)", whiteSpace: "nowrap" }}>{AUFGABE}</div>
        <div className="mmb-hand mmb-raster" data-mm-rechnung>
          {ZEILEN.map((z, i) => {
            const letzte = i === n - 1;
            const kasten = z.kasten ? `2px solid ${TINTE}` : undefined;
            return (
              <React.Fragment key={i}>
                <div className="mmb-l" style={{ "--d": d(i), ...(z.kasten ? { justifySelf: "end", padding: "0 .2em 0 .5em", borderTop: kasten, borderBottom: kasten, borderLeft: kasten, borderRadius: "7px 0 0 7px" } : {}) }}>{z.l}</div>
                <div className="mmb-g" style={{ "--d": d(i), ...(z.kasten ? { borderTop: kasten, borderBottom: kasten } : {}), borderRadius: i === 0 ? "7px 7px 0 0" : "0" }}>
                  =
                  {i === 0 && <Marke n="2" stil={{ top: -12, left: "50%", marginLeft: -9 }} d="3.8s" />}
                </div>
                <div style={{ "--d": d(i), ...(z.kasten ? { justifySelf: "start", padding: "0 .5em 0 .2em", borderTop: kasten, borderBottom: kasten, borderRight: kasten, borderRadius: "0 7px 7px 0" } : {}) }}>{z.r}</div>
                <div className="mmb-m" style={{ "--d": d(i) }}>
                  {z.rand}
                  {z.box && <span className="mmb-nb">{z.box}</span>}
                  {z.box && <Marke n="3" stil={IN} d="4.2s" />}
                  {z.rand === "+ 7" && <Marke n="3" stil={IN} d="4s" />}
                  {letzte && <Marke n="4" stil={IN} d="4.4s" />}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </Blatt>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 8, marginTop: 14 }} data-mm-schema>
        {SCHEMA().map(([t, u], i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", background: C.sand, border: `1px solid ${C.linie}`, borderRadius: 12, padding: "9px 10px" }}>
            <span aria-hidden="true" style={{ width: 18, height: 18, borderRadius: 999, background: goldVerlauf, color: TINTE, fontSize: 11, fontWeight: 800, lineHeight: "18px", textAlign: "center", flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
            <span style={{ minWidth: 0, overflowWrap: "anywhere", hyphens: "auto" }}>
              <span style={{ display: "block", fontSize: 12.5, fontWeight: 800, color: C.tinte, lineHeight: 1.3 }}>{t}</span>
              <span style={{ display: "block", marginTop: 2, fontSize: 12, color: C.grau, lineHeight: 1.4 }}>{u}</span>
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

function Tafel({ nr, aktiv, tabTitel, onTab, pfeilLinks, gold, children }) {
  return (
    <div className="mmb-tafel" data-mm-tafel={nr} data-aktiv={aktiv ? "1" : "0"} style={gold && !aktiv ? { borderColor: GOLD, borderWidth: 1.5 } : undefined}>
      {aktiv ? <div className="mmb-inhalt">{children}</div> : (
        <button type="button" className="mmb-tab" onClick={onTab} data-mm-blatt-tab={nr} aria-label={tabTitel}>
          <span className="mmb-pfeil"><Pfeil links={pfeilLinks} /></span>
          <Nummer n={nr} />
          <span className="mmb-vert">{tabTitel}</span>
        </button>
      )}
    </div>
  );
}

export function MathildaModusBlatt() {
  const [schritt, setSchritt] = useState(1);
  const eins = schritt === 1;
  return (
    <div data-mm-blatt={schritt}>
      <style>{CSS}</style>
      <div className="mmb-reihe" style={{ gridTemplateColumns: eins ? "minmax(0,1fr) 78px" : "78px minmax(0,1fr)" }}>
        <Tafel nr={1} aktiv={eins} tabTitel={zw("Aufgabe aufschreiben", "Write down the task")} onTab={() => setSchritt(1)} pfeilLinks>
          <BlattEins />
        </Tafel>
        <Tafel nr={2} aktiv={!eins} tabTitel={zw("Rechne nach dem Schema", "Calculate following the scheme")} onTab={() => setSchritt(2)} gold>
          <BlattZwei />
        </Tafel>
      </div>
    </div>
  );
}

export default MathildaModusBlatt;
