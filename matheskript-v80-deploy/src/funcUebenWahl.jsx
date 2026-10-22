/* ============================================================
   Modus „Üben“ – gemeinsame Oberfläche für alle Rechen-Werkzeuge
   (Differenzenquotient, Ableitungstrainer, Integrale, Geraden, Gleichungen,
   Kopfrechnen …). Logik in uebenKern.js.

   <UebenWahl>  Frage des Schritts („Schritt 3 von 7 · Fasse … zusammen.“) und
                2–4 Antwortkarten in Gold, A–D. Kurze Antworten: 2 × 2,
                lange: drei untereinander und etwas flacher (uebenLayout,
                gemessen an den echten Breiten). Falsch gewählt → Karte rot,
                darunter der Grund; erst die richtige wird übernommen.
   <UebenFertig> Abschluss: „x von n Schritten auf Anhieb“, Ergebnis,
                „Jetzt selbst rechnen“ (→ Lernen) und „Neue Aufgabe“.
   .uw-ziel     Klasse für das Feld, in das die Wahl eingesetzt wird
                (goldener Rand, leiser Puls).
   UEBEN_CSS einmal je Werkzeug einbinden: <style>{UEBEN_CSS}</style>.
   ============================================================ */
import React, { useLayoutEffect, useRef, useState } from "react";
import { C } from "./base1.jsx";
import { MitWurzeln } from "./wurzelZeichen.jsx";
import { BUCHSTABEN, sichtbareOptionen, uebenLayout } from "./uebenKern.js";

const GOLD = C.flaggold, GOLD_HELL = "#FFE58A", NACHT = C.seeTief;
/* Rand + Innenabstand + Buchstabe einer Karte (muss zu den Werten unten passen) */
const RAHMEN = { raster: 58, stapel: 66 };

export const UEBEN_CSS = `
.uw{position:relative;margin:6px 0 14px}
.uw-frage{font-size:14.5px;font-weight:600;color:${C.tinte};line-height:1.5;margin:0 4px 10px}
.uw-frage span{display:block;font-size:10.5px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:${C.gruenDunkel};margin-bottom:1px}
.uw-raster{display:grid;grid-template-columns:minmax(0,1fr);gap:10px}
.uw-raster[data-spalten="2"]{grid-template-columns:repeat(2,minmax(0,1fr))}
.uw-raster[data-spalten="3"]{grid-template-columns:repeat(3,minmax(0,1fr))}
.uw-option{position:relative;display:flex;align-items:center;gap:10px;min-width:0;min-height:62px;padding:8px 12px;border-radius:16px;
  border:2px solid ${GOLD};background:linear-gradient(180deg,#FFFAE6 0%,#FFFFFF 78%);color:${C.tinte};font-family:inherit;font-size:19px;line-height:1.45;
  text-align:left;cursor:pointer;overflow:hidden;
  box-shadow:0 0 0 1px rgba(237,187,0,0.30),0 12px 26px -14px rgba(237,187,0,0.80);
  transition:transform .15s ease,box-shadow .15s ease,border-color .15s ease;
  animation:uw-rein .34s cubic-bezier(.2,.8,.2,1) both;animation-delay:calc(var(--i,0) * 70ms)}
.uw-raster[data-spalten="2"] .uw-option,.uw-raster[data-spalten="3"] .uw-option{justify-content:center;padding:8px 10px}
.uw-raster[data-kompakt="true"] .uw-option{min-height:52px;padding:5px 12px}
/* einmaliger Glanz über die Karte, wenn der Schritt erscheint */
.uw-option::after{content:"";position:absolute;top:0;bottom:0;left:0;width:38%;pointer-events:none;
  background:linear-gradient(90deg,rgba(255,255,255,0) 0%,rgba(255,255,255,0.85) 50%,rgba(255,255,255,0) 100%);
  transform:translateX(-140%) skewX(-18deg);animation:uw-glanz 1.15s ease-out both;animation-delay:calc(.25s + var(--i,0) * 90ms)}
@media (hover:hover){.uw-option:not([data-status="falsch"]):hover{transform:translateY(-2px);box-shadow:0 0 0 2px rgba(237,187,0,0.45),0 16px 30px -14px rgba(237,187,0,0.95)}}
.uw-option:not([data-status="falsch"]):active{transform:scale(.985)}
.uw-option:focus-visible{outline:3px solid ${C.see};outline-offset:2px}
.uw-b{flex-shrink:0;width:26px;height:26px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;
  font-size:12.5px;font-weight:800;color:${NACHT};background:linear-gradient(180deg,${GOLD_HELL} 0%,${GOLD} 100%);box-shadow:0 1px 0 rgba(255,255,255,0.5) inset}
.uw-inhalt{display:inline-flex;align-items:center;min-width:0;max-width:100%;overflow-x:auto;overflow-y:hidden;white-space:nowrap;scrollbar-width:none}
.uw-inhalt::-webkit-scrollbar{display:none}
.uw-inhalt span,.uw-mass span{flex-wrap:nowrap !important;white-space:nowrap}
.uw-raster[data-kompakt="true"] .uw-inhalt{font-size:17.5px}
.uw-option[data-status="falsch"]{border-color:${C.signal};background:#FFF6F1;box-shadow:none;cursor:default;animation:none}
.uw-option[data-status="falsch"]::after{display:none}
.uw-option[data-status="falsch"] .uw-b{background:${C.signal};color:#fff;box-shadow:none}
.uw-option[data-status="falsch"] .uw-inhalt{opacity:.7}
.uw-hinweis{font-size:14px;color:${C.signal};line-height:1.55;margin:10px 6px 0}
.uw-hinweis b{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:999px;background:${C.signal};color:#fff;font-size:11px;margin-right:6px;vertical-align:1px}
/* Messen der natürlichen Breiten (unsichtbar, ohne Einfluss auf das Layout) */
.uw-mass{position:absolute;left:0;top:0;width:0;height:0;overflow:hidden;visibility:hidden;pointer-events:none}
.uw-mass>span{display:flex;align-items:center;width:max-content;white-space:nowrap;font-size:19px;line-height:1.45}
/* Das Feld, in das eingesetzt wird */
.uw-ziel,.uw-ziel[data-aktiv="true"]{border:2px solid ${GOLD} !important;border-style:solid !important;background:#FFFAE6 !important;color:${C.gruenDunkel};
  box-shadow:0 0 0 0 rgba(237,187,0,0.55) !important;animation:uw-puls 2.2s ease-in-out infinite}
.uw-ziel .dq-platz,.uw-ziel .uw-platz{color:${C.gruenDunkel} !important;font-weight:700}
/* Abschluss */
.uw-fertig{text-align:center;padding:14px 0 4px}
.uw-fertig h4{font-size:20px;font-weight:700;color:${C.smaragd};margin:0 0 6px;line-height:1.35}
.uw-fertig .uw-erg{font-size:17px;color:${C.tinte};margin:0 0 10px}
.uw-fertig p.leise{font-size:13.5px;color:${C.grau};margin:0 auto 14px;max-width:440px;line-height:1.6}
.uw-knoepfe{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
.uw-knoepfe button{flex:1 1 180px;height:54px;border-radius:14px;cursor:pointer;font-family:inherit;font-size:16px;font-weight:700}
.uw-knoepfe .haupt{border:none;color:#fff;background:linear-gradient(155deg,${C.see} 0%,${NACHT} 100%)}
.uw-knoepfe .neben{border:1.5px solid ${C.see};color:${C.see};background:#fff}
@keyframes uw-rein{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes uw-glanz{from{transform:translateX(-140%) skewX(-18deg)}to{transform:translateX(320%) skewX(-18deg)}}
@keyframes uw-puls{0%,100%{box-shadow:0 0 0 0 rgba(237,187,0,0.50)}50%{box-shadow:0 0 0 6px rgba(237,187,0,0)}}
@media (prefers-reduced-motion:reduce){.uw-option,.uw-ziel{animation:none !important}.uw-option::after{display:none}}
`;

/* Frage + Antwortkarten eines Schritts.
   schritt   – aus uebenSchritt() (optionen[0] richtig, Ränge fest)
   falsch    – Schlüssel der in diesem Schritt falsch gewählten Karten
   onWahl(o) – o.richtig → übernehmen, sonst als falsch merken
   inhalt(wert) – zeichnet den Inhalt einer Karte (Formel, Bruch, Zahl …) */
export function UebenWahl({ schritt, nr, gesamt, frage, falsch = [], onWahl, inhalt }) {
  const huelle = useRef(null), mass = useRef(null);
  const kandidaten = schritt.optionen.slice(0, 4);
  const start = () => ({ anzahl: Math.min(3, kandidaten.length), spalten: 1, kompakt: kandidaten.length >= 3 });
  const [lay, setLay] = useState(start);
  const gewaehlt = useRef(falsch.length);
  gewaehlt.current = falsch.length;
  // Neu gemessen wird nur, wenn sich die Optionen wirklich ändern (nicht bei jedem neuen schritt-Objekt des Werkzeugs)
  const signatur = schritt.optionen.map((o) => o.key).join("\u0001");

  useLayoutEffect(() => {
    const messen = () => {
      const h = huelle.current, m = mass.current;
      if (!h || !m) return;
      if (gewaehlt.current > 0) return;   // nach einem Fehlklick bleibt die Auswahl, wie sie ist
      const breite = h.getBoundingClientRect().width;
      const breiten = [...m.children].map((el) => el.getBoundingClientRect().width);
      const neu = uebenLayout({ breite, breiten, rahmen: RAHMEN });
      setLay((alt) => (alt.anzahl === neu.anzahl && alt.spalten === neu.spalten && alt.kompakt === neu.kompakt ? alt : neu));
    };
    setLay(start());
    messen();
    if (typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(() => messen());
    if (huelle.current) ro.observe(huelle.current);
    if (mass.current) [...mass.current.children].forEach((el) => ro.observe(el));
    return () => ro.disconnect();
  }, [signatur]);   // eslint-disable-line react-hooks/exhaustive-deps

  const sichtbar = sichtbareOptionen(schritt, lay.anzahl);
  const buchstabe = (key) => BUCHSTABEN[Math.max(0, sichtbar.findIndex((o) => o.key === key))];
  const falscheGewaehlt = falsch.map((k) => schritt.optionen.find((o) => o.key === k)).filter(Boolean);

  return (
    <div ref={huelle} className="uw" data-ueben-wahl data-ueben-anzahl={sichtbar.length} data-ueben-spalten={lay.spalten}>
      <p className="uw-frage"><span>Schritt {nr} von {gesamt}</span>{frage}</p>
      <div className="uw-raster" data-spalten={lay.spalten} data-kompakt={lay.kompakt || undefined} role="group" aria-label="Wähle die richtige Zeile">
        {sichtbar.map((o, i) => {
          const f = falsch.includes(o.key);
          return (
            <button key={o.key} type="button" className="uw-option" style={{ "--i": i }} data-status={f ? "falsch" : undefined}
              data-ueben-option={o.richtig ? "richtig" : "falsch"} aria-disabled={f || undefined} onClick={() => { if (!f) onWahl(o); }}>
              <span className="uw-b" aria-hidden="true">{f ? "✗" : BUCHSTABEN[i]}</span>
              <span className="uw-inhalt">{inhalt(o.wert)}</span>
            </button>
          );
        })}
      </div>
      {falscheGewaehlt.map((o) => (
        <p key={o.key} className="uw-hinweis" data-ueben-hinweis><b>{buchstabe(o.key)}</b><MitWurzeln text={o.hinweis} /></p>
      ))}
      <div ref={mass} className="uw-mass" aria-hidden="true">
        {kandidaten.map((o) => <span key={o.key}>{inhalt(o.wert)}</span>)}
      </div>
    </div>
  );
}

/* Abschluss nach dem letzten Schritt */
export function UebenFertig({ anhieb, gesamt, children, onLernen, onNeu, neuText = "Neue Aufgabe", lernenText = "Jetzt selbst rechnen",
  leise = "Nächste Stufe: Rechne dieselbe Aufgabe in „Lernen“ – jede Zeile selbst, ohne Auswahl." }) {
  return (
    <div className="uw-fertig" data-ueben-fertig>
      <h4>{anhieb === gesamt ? `Alle ${gesamt} Schritte auf Anhieb – stark! 🎉` : `Geschafft – ${anhieb} von ${gesamt} Schritten auf Anhieb.`}</h4>
      {children && <div className="uw-erg">{children}</div>}
      {onLernen && <p className="leise">{leise}</p>}
      <div className="uw-knoepfe">
        {onLernen && <button type="button" className="haupt" onClick={onLernen}>{lernenText}</button>}
        {onNeu && <button type="button" className="neben" onClick={onNeu}>{neuText}</button>}
      </div>
    </div>
  );
}
