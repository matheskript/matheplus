/* ============================================================
   Regel-Werkstatt im Ableitungstrainer
   · Produkt-, Quotienten-, Reziproken-, lineare Kettenregel, Kettenregel
     und die „15-Punkte-Kombo“ (Produkt- und Kettenregel verschachtelt)
   · Links die Bausteine u und v, rechts daneben u′ und v′, darunter die
     Rechnung mit der Regel: Einsetzen (farbig) → Ergebnis → ausgeklammert
   · Automatikmodus: alles steht als Musterlösung da, u und v sind frei
     editierbar. Trainingsmodus: u′, v′ und f′ selbst eintippen.
   · Jede Regel hat eine aufklappbare Herleitung.
   Mathe-Kern: regelwerkKern.js. Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { buchen } from "./buchung.jsx";
import { C } from "./base1.jsx";
import { Formel, M, Text } from "./func3.jsx";
import { LiveFormel, Tastenfeld, ableitung, hatX } from "./func12.jsx";
import { AufklappZeichen } from "./aufklappen.jsx";
import { MatheFeld } from "./matheTastatur.jsx";
import { ErklaerAnimation } from "./funcErklaeranimation.jsx";
import {
  REGELN, baueF, diagnose, einsetzen as baumEinsetzen, fakTex, fehlerbilder, gleichwertig, lies, musterloesung, neueAufgabe, regelFuer, schoen, summanden, tex,
} from "./regelwerkKern.js";

/* ---------- gemeinsame Bausteine (auch für Stammfunktion & Integral) ---------- */

export const POP_CSS = `
.wk-pop{position:relative;display:inline-block}
.wk-pop-knopf{height:44px;padding:0 14px 0 16px;border-radius:999px;border:1.5px solid ${C.linie};background:#fff;color:${C.see};font-family:inherit;font-size:15px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap}
.wk-pop-knopf[aria-expanded="true"]{border-color:${C.see}}
.wk-pop-knopf svg{flex-shrink:0;transition:transform .2s}
.wk-pop-knopf[aria-expanded="true"] svg{transform:rotate(180deg)}
.wk-pop-liste{position:absolute;z-index:40;top:calc(100% + 6px);left:0;min-width:100%;background:#fff;border:1px solid ${C.linie};border-radius:16px;box-shadow:0 12px 32px rgba(15,26,51,0.18);padding:6px;max-height:min(340px,60vh);overflow-y:auto}
.wk-pop.rechts .wk-pop-liste{left:auto;right:0}
.wk-pop-liste button{width:100%;display:flex;align-items:center;justify-content:space-between;gap:14px;min-height:44px;padding:0 14px;border:none;border-radius:11px;background:transparent;font-family:inherit;font-size:15px;font-weight:600;color:${C.tinte};cursor:pointer;text-align:left;white-space:nowrap}
.wk-pop-liste button[aria-selected="true"]{background:#EEF2F8;color:${C.see}}
.wk-pop-liste button:hover{background:#F4F7FC}
`;

/* Pop-up-Auswahl: Knopf mit Pfeil, darunter klappt die Liste auf. Schließt bei Klick daneben und mit Esc. */
export function PopupWahl({ wert, optionen, onWaehle, label, kopf, className = "", knopfClass = "", rechts = false, stopp = false, onOeffne }) {
  const [auf, setAuf] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!auf) return undefined;
    const aussen = (e) => { if (ref.current && !ref.current.contains(e.target)) setAuf(false); };
    const taste = (e) => { if (e.key === "Escape") setAuf(false); };
    document.addEventListener("pointerdown", aussen);
    document.addEventListener("keydown", taste);
    return () => { document.removeEventListener("pointerdown", aussen); document.removeEventListener("keydown", taste); };
  }, [auf]);
  const aktuell = optionen.find((o) => o.id === wert);
  return (
    <div className={`wk-pop${rechts ? " rechts" : ""} ${className}`} ref={ref} onClick={stopp ? (e) => e.stopPropagation() : undefined}>
      <button type="button" className={`wk-pop-knopf ${knopfClass}`} aria-haspopup="listbox" aria-expanded={auf} aria-label={label}
        onClick={() => { if (onOeffne) onOeffne(); setAuf(!auf); }}>
        <span>{kopf ? kopf(aktuell) : aktuell ? aktuell.name : ""}</span>
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M2.5 5l4.5 4.5L11.5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {auf && (
        <div className="wk-pop-liste" role="listbox" aria-label={label}>
          {optionen.map((o) => (
            <button key={o.id} type="button" role="option" aria-selected={o.id === wert}
              onClick={() => { setAuf(false); onWaehle(o.id); }}>
              <span>{o.name}</span>{o.id === wert && <span aria-hidden="true">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export const WERK_CSS = `
${POP_CSS}
.wk-chipwrap{position:relative;margin:0 -16px 10px}
.wk-chips{display:flex;gap:8px;overflow-x:auto;padding:2px 16px 4px;scrollbar-width:none;-webkit-overflow-scrolling:touch;scroll-snap-type:x proximity;scroll-padding-left:16px}
.wk-chips::-webkit-scrollbar{display:none}
.wk-chipwrap::after{content:"";position:absolute;right:0;top:0;bottom:4px;width:34px;pointer-events:none;background:linear-gradient(90deg,rgba(255,255,255,0),#fff)}
.wk-chip{flex:0 0 auto;scroll-snap-align:start;height:44px;padding:0 16px;border-radius:999px;font-family:inherit;font-size:14.5px;font-weight:600;cursor:pointer;white-space:nowrap;border:1.5px solid ${C.linie};background:#fff;color:${C.see}}
.wk-chip[aria-pressed="true"]{background:${C.see};border-color:${C.see};color:#fff}
.wk-chip.gold[aria-pressed="true"]{background:linear-gradient(155deg,${C.goldWarm},${C.flaggold});border-color:${C.flaggold};color:${C.seeTief}}
.wk-stufe{width:44px;height:44px;padding:0;border-radius:999px;font-family:inherit;font-size:16px;font-weight:700;cursor:pointer;border:1.5px solid ${C.linie};background:#fff;color:${C.see}}
.wk-stufe[aria-pressed="true"]{background:${C.see};border-color:${C.see};color:#fff}
.wk-wuerfel{width:44px;height:44px;padding:0;border-radius:999px;border:none;cursor:pointer;background:${C.flaggold};font-size:22px;line-height:1;display:inline-flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(15,26,51,0.14);flex-shrink:0}
.wk-seg{display:inline-flex;padding:3px;border-radius:999px;background:#EEF2F8;gap:2px}
.wk-seg button{height:38px;padding:0 14px;border-radius:999px;border:none;font-family:inherit;font-size:13.5px;font-weight:700;cursor:pointer;background:transparent;color:${C.grau};white-space:nowrap}
.wk-seg button[aria-pressed="true"]{background:#fff;color:${C.see};box-shadow:0 1px 6px rgba(15,26,51,0.12)}
.wk-karte{background:transparent}
@media (max-width:380px){.wk-kopfzeile{gap:6px!important}.wk-kopfzeile .wk-pop-knopf{padding:0 10px 0 12px;font-size:14px;gap:6px}.wk-kopfzeile .wk-seg button{padding:0 9px;font-size:13px}}
.wk-grid{display:grid;grid-template-columns:minmax(0,1fr) 22px minmax(0,1fr);gap:8px 4px;align-items:center}
.wk-feld{border:1.5px solid ${C.linie};border-radius:14px;padding:8px 12px;min-height:60px;background:#fff;display:flex;align-items:center;gap:8px;overflow-x:auto;cursor:pointer;transition:box-shadow .2s,border-color .2s}
.wk-feld[data-aktiv="true"]{border-color:${C.see};box-shadow:0 4px 16px rgba(0,77,152,0.14)}
.wk-feld[data-status="richtig"]{border-color:${C.smaragd};background:#EEF8F2}
.wk-feld[data-status="falsch"]{border-color:${C.signal}}
.wk-feld[data-status="gezeigt"]{border-color:${C.linie};background:#F7F8FB}
.wk-feld[data-still="true"]{cursor:default;background:#F7F8FB}
.wk-feld .wk-label{font-size:15px;font-weight:700;color:${C.tinte};white-space:nowrap;flex-shrink:0}
.wk-feld .wk-inhalt{flex:1;font-size:18px;line-height:1.8;white-space:nowrap;min-width:0}
.wk-pfeil{color:${C.hellgrau};font-size:16px;text-align:center;align-self:center}
.wk-feld.mit-kopf{flex-direction:column;align-items:stretch;justify-content:center;gap:2px;padding:6px 10px 8px}
.wk-feld .wk-kopf{font-size:11.5px;font-weight:600;color:${C.grau};line-height:1.25}
.wk-feld .wk-zeile1{display:flex;align-items:center;gap:6px;flex-wrap:wrap;min-width:0}
.wk-feld.gestapelt .wk-zeile1{flex-direction:column;align-items:flex-start;gap:0;flex-wrap:nowrap}
.wk-grid.kette{grid-template-columns:minmax(0,1fr) 14px minmax(0,1fr) 14px minmax(0,1fr);gap:8px 2px;align-items:stretch}
.wk-grid.kette .wk-feld{padding:6px 8px 8px}
.wk-grid.kette .wk-feld .wk-label{font-size:13.5px}
.wk-grid.kette .wk-feld .wk-inhalt{font-size:16px;flex:1 1 auto}
.wk-grid.kette .wk-feld .wk-kopf{font-size:11px}
@media (min-width:601px){.wk-grid.kette .wk-feld .wk-inhalt{font-size:18px}.wk-grid.kette .wk-feld .wk-label{font-size:15px}.wk-grid.kette .wk-feld .wk-kopf{font-size:12px}}
.wk-rechnung{background:${C.sand};border-radius:16px;padding:12px 14px;margin-top:14px}
.wk-popup{margin-top:12px;animation:wkPopIn .22s ease-out}
@keyframes wkPopIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.wk-popup{animation:none}}
.wk-zeile{display:flex;align-items:center;gap:10px;font-size:18px;line-height:1.9;color:${C.tinte};overflow-x:auto;white-space:nowrap;padding:3px 0}
.wk-zeile .wk-gleich{flex-shrink:0;font-weight:700;min-width:62px;text-align:right}
.wk-zeile>span{flex:0 0 auto;flex-wrap:nowrap!important}
.wk-feld .wk-inhalt>span{flex-wrap:nowrap!important}
.wk-her{border:1px solid ${C.linie};border-radius:16px;overflow:hidden;margin-top:12px;background:#fff}
.wk-her>button{width:100%;display:flex;align-items:center;gap:12px;padding:12px 14px;border:none;background:#fff;cursor:pointer;font-family:inherit;text-align:left;color:${C.tinte}}
.wk-her-koerper{display:grid;grid-template-rows:0fr;transition:grid-template-rows .32s cubic-bezier(.2,.7,.3,1)}
.wk-her-koerper.auf{grid-template-rows:1fr}
.wk-her-koerper>div{overflow:hidden}
@media (min-width:601px){
  .wk-chipwrap{margin:0 0 12px}
  .wk-chipwrap::after{display:none}
  .wk-chips{flex-wrap:wrap;overflow:visible;padding:0}
  .wk-karte{background:#fff;border-radius:16px;padding:18px;box-shadow:0 2px 16px rgba(15,26,51,0.07)}
  .wk-feld .wk-inhalt{font-size:20px}
  .wk-zeile{font-size:20px}
}`;

export const FARBE = { u: C.see, v: C.gruen };

/* Ein Eingabe-/Anzeigefeld: Label „u(x) =“, Formel, Status */
export function Feld({ label, labelFarbe, text, tex: fertigTex, aktiv, status, still, platzhalter = "hier eingeben …", onClick, extra, kopf, gestapelt }) {
  const zeile = (
    <>
      <span className="wk-label" style={labelFarbe ? { color: labelFarbe } : undefined}>{label}</span>
      <span className="wk-inhalt">
        {fertigTex !== undefined ? (fertigTex ? <M t={fertigTex} /> : <span style={{ color: C.hellgrau, fontSize: 14, fontWeight: 300 }}>…</span>)
          : text ? <LiveFormel text={text} />
            : <span style={{ color: C.hellgrau, fontSize: 14, fontWeight: 300 }}>{aktiv ? platzhalter : ""}</span>}
      </span>
      {status === "richtig" && <span style={{ fontSize: 22, color: C.smaragd, fontWeight: 700 }}>✓</span>}
      {status === "falsch" && <span style={{ fontSize: 22, color: C.signal, fontWeight: 700 }}>✗</span>}
      {status === "gezeigt" && <span style={{ fontSize: 11.5, color: C.grau, fontWeight: 600 }}>Lösung</span>}
      {extra}
    </>
  );
  return (
    <div className={`wk-feld${kopf ? " mit-kopf" : ""}${gestapelt ? " gestapelt" : ""}`} data-aktiv={!!aktiv} data-status={status || undefined} data-still={!!still} onClick={still ? undefined : onClick}
      role={still ? undefined : "button"} tabIndex={still ? undefined : 0} aria-pressed={still ? undefined : !!aktiv}
      onKeyDown={(e) => { if (!still && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onClick && onClick(); } }}>
      {kopf ? <><span className="wk-kopf">{kopf}</span><div className="wk-zeile1">{zeile}</div></> : zeile}
    </div>
  );
}

/* Faktor mit kleiner Beschriftung darüber (u(x) über u, v(x) über v) */
function FaktorSpalte({ label, children }) {
  return (
    <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", flex: "0 0 auto" }}>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: C.goldText, lineHeight: 1.2, minHeight: 15, whiteSpace: "nowrap" }}>
        {label ? <M t={label} /> : "\u00A0"}
      </span>
      <span style={{ color: C.weiss, fontSize: 22, fontWeight: 700, whiteSpace: "nowrap", lineHeight: 1.6 }}>{children}</span>
    </span>
  );
}

/* Pop-up-Rahmen für die Eingabe: klappt direkt unter dem angetippten Feld auf und scrollt bei Bedarf ins Bild */
export function EingabePopup({ children, style }) {
  const ref = useRef(null);
  useEffect(() => {
    try { if (ref.current && ref.current.scrollIntoView) ref.current.scrollIntoView({ block: "nearest", behavior: "smooth" }); } catch (e) { /* ältere Browser */ }
  }, []);
  return (
    <div className="wk-popup" ref={ref} style={style}>
      <style>{`.wk-popup{margin-top:12px;animation:wkPopIn .22s ease-out}
@keyframes wkPopIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.wk-popup{animation:none}}`}</style>
      {children}
    </div>
  );
}

/* Tastenfeld oder Textfeld für das aktive Feld */
export function Eingabe({ text, setText, pos, setPos, onEnter, platzhalter }) {
  const [tippen, setTippen] = useState(false);
  return (
    <div style={{ marginTop: 12 }}>
      {tippen ? (
        <MatheFeld modus="formel" value={text} onChange={(e) => { setText(e.target.value); setPos(e.target.value.length); }}
          onKeyDown={(e) => { if (e.key === "Enter" && onEnter) onEnter(); }}
          placeholder={platzhalter || "z. B. 2x*cos(x) oder e^(2x)"} autoCapitalize="off" autoCorrect="off" spellCheck="false"
          style={{ width: "100%", boxSizing: "border-box", height: 54, borderRadius: 14, border: `1.5px solid ${C.linie}`,
            padding: "0 14px", fontSize: 17, fontFamily: "ui-monospace, Menlo, monospace" }} />
      ) : (
        <Tastenfeld wert={text} setWert={setText} pos={pos} setPos={setPos} onOk={onEnter} />
      )}
      {tippen && onEnter && (
        <button type="button" onClick={onEnter}
          style={{ width: "100%", height: 50, marginTop: 10, borderRadius: 14, border: "none", cursor: "pointer", fontFamily: "inherit",
            fontSize: 18, fontWeight: 800, color: C.weiss, background: C.smaragd, letterSpacing: "0.04em", boxShadow: "0 4px 14px rgba(47,143,91,0.35)" }}>
          OK
        </button>
      )}
      <button type="button" onClick={() => setTippen(!tippen)}
        style={{ background: "none", border: "none", color: C.see, fontSize: 14, fontFamily: "inherit", cursor: "pointer", padding: "10px 0 0" }}>
        {tippen ? "Tastenfeld benutzen" : "Lieber selbst tippen"}
      </button>
    </div>
  );
}

/* Segment-Schalter Automatik | Training */
export function ModusSchalter({ modus, setModus }) {
  return (
    <div className="wk-seg" role="group" aria-label="Modus">
      {[["auto", "Automatik"], ["training", "Training"]].map(([id, name]) => (
        <button key={id} type="button" aria-pressed={modus === id} onClick={() => setModus(id)}>{name}</button>
      ))}
    </div>
  );
}

/* Aufklappbare Herleitung */
export function Herleitung({ titel, untertitel, children, startOffen = false }) {
  const [auf, setAuf] = useState(startOffen);
  return (
    <div className="wk-her" style={auf ? { borderColor: "rgba(0,77,152,0.22)" } : undefined}>
      <button type="button" onClick={() => setAuf(!auf)} aria-expanded={auf}>
        <span aria-hidden="true" style={{ flexShrink: 0, width: 36, height: 36, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center",
          background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`, color: C.flaggold, fontWeight: 800, fontSize: 17, fontStyle: "italic" }}>∂</span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 15, fontWeight: 700 }}>{titel}</span>
          {untertitel && <span style={{ display: "block", fontSize: 12.5, fontWeight: 300, color: C.grau, marginTop: 1 }}>{untertitel}</span>}
        </span>
        <AufklappZeichen art="badge" auf={auf} />
      </button>
      <div className={`wk-her-koerper${auf ? " auf" : ""}`} aria-hidden={!auf}>
        <div><div style={{ padding: "6px 16px 18px", borderTop: `1px solid ${C.linie}` }}>{auf && children}</div></div>
      </div>
    </div>
  );
}

export const Absatz = ({ children, style }) => <p style={{ fontSize: 14.5, fontWeight: 300, color: C.grau, lineHeight: 1.8, margin: "12px 0 0", ...style }}>{children}</p>;
export const Merke = ({ kopf, s }) => (
  <div style={{ background: C.sand, borderLeft: `3px solid ${C.flaggold}`, borderRadius: 12, padding: "10px 14px", margin: "14px 0 4px", fontSize: 14.5, lineHeight: 1.7, color: C.tinte }}>
    {kopf && <b style={{ display: "block", marginBottom: 2 }}>{kopf}</b>}
    <Text s={s} style={{ margin: 0 }} />
  </div>
);
const T = ({ s }) => <Text s={s} style={{ fontSize: 14.5, fontWeight: 300, color: C.grau, lineHeight: 1.8, margin: "12px 0 0" }} />;
const F = ({ z }) => <Formel zeilen={z} />;

/* ---------- Herleitungen ---------- */

function HerleitungText({ regel }) {
  if (regel === "produkt") return (
    <>
      <T s="Sei $f(x) = u(x) \cdot v(x)$. Wir bilden den Differenzenquotienten und lassen $h \to 0$ gehen. Der Trick: Wir addieren im Zähler eine Null, nämlich $-u(x) \cdot v(x+h) + u(x) \cdot v(x+h)$, damit sich der Term in zwei Teile zerlegen lässt." />
      <F z={[
        "f′(x) = \\lim_{h \\to 0} \\frac{u(x+h) \\, v(x+h) - u(x) \\, v(x)}{h}",
        "= \\lim_{h \\to 0} \\frac{u(x+h) \\, v(x+h) - u(x) \\, v(x+h) + u(x) \\, v(x+h) - u(x) \\, v(x)}{h}",
        "= \\lim_{h \\to 0} \\left( \\frac{u(x+h) - u(x)}{h} \\cdot v(x+h) + u(x) \\cdot \\frac{v(x+h) - v(x)}{h} \\right)",
      ]} />
      <T s="Der erste Bruch geht gegen $u′(x)$, der zweite gegen $v′(x)$. Weil $v$ differenzierbar und damit stetig ist, geht $v(x+h)$ gegen $v(x)$. Zusammen:" />
      <F z={["f′(x) = u′(x) \\cdot v(x) + u(x) \\cdot v′(x)"]} />
      <Merke kopf="„Erste abgeleitet mal zweite, plus erste mal zweite abgeleitet.“" s="Niemals gliedweise ableiten – $(u \cdot v)′ \neq u′ \cdot v′$. Beispiel: $(x \cdot x)′ = 2x$, aber $1 \cdot 1 = 1$." />
    </>
  );
  if (regel === "quotient") return (
    <>
      <T s="Ein Quotient ist ein Produkt mit dem Kehrwert: $\frac{u}{v} = u \cdot \frac{1}{v}$. Mit der Reziprokenregel $\left(\frac{1}{v}\right)′ = -\frac{v′}{v^{2}}$ und der Produktregel folgt:" />
      <F z={[
        "\\left( u \\cdot \\frac{1}{v} \\right)′ = u′ \\cdot \\frac{1}{v} + u \\cdot \\left( -\\frac{v′}{v^{2}} \\right)",
        "= \\frac{u′ \\, v}{v^{2}} - \\frac{u \\, v′}{v^{2}} = \\frac{u′ \\, v - u \\, v′}{v^{2}}",
      ]} />
      <T s="Im ersten Schritt wurde $\frac{u′}{v}$ mit $v$ erweitert, damit beide Brüche den Nenner $v^{2}$ haben." />
      <Merke kopf="„NAZ minus ZAN durch N²“" s="Nenner mal Ableitung Zähler, minus Zähler mal Ableitung Nenner, geteilt durch Nenner im Quadrat. Die Reihenfolge im Zähler ist entscheidend: Vertauschen dreht das Vorzeichen." />
    </>
  );
  if (regel === "reziprok") return (
    <>
      <T s="Sei $f(x) = \frac{1}{v(x)}$ mit $v(x) \neq 0$. Im Differenzenquotienten bringen wir die beiden Brüche auf einen Nenner:" />
      <F z={[
        "f′(x) = \\lim_{h \\to 0} \\frac{1}{h} \\left( \\frac{1}{v(x+h)} - \\frac{1}{v(x)} \\right) = \\lim_{h \\to 0} \\frac{1}{h} \\cdot \\frac{v(x) - v(x+h)}{v(x+h) \\, v(x)}",
        "= \\lim_{h \\to 0} \\left( - \\frac{v(x+h) - v(x)}{h} \\cdot \\frac{1}{v(x+h) \\, v(x)} \\right) = -v′(x) \\cdot \\frac{1}{(v(x))^{2}}",
      ]} />
      <T s="Der Differenzenquotient von $v$ wird zu $v′(x)$, und $v(x+h) \to v(x)$, weil $v$ stetig ist. Das Minus kommt daher, dass im Zähler $v(x) - v(x+h)$ steht – also die „falsche“ Reihenfolge." />
      <F z={["\\left( \\frac{1}{v(x)} \\right)′ = -\\frac{v′(x)}{(v(x))^{2}}"]} />
      <Merke kopf="" s="Die Reziprokenregel ist die Quotientenregel mit $u = 1$ (also $u′ = 0$) – und zugleich die Kettenregel für die äußere Funktion $\frac{1}{x} = x^{-1}$: $(v^{-1})′ = -v^{-2} \cdot v′$. Beispiel: $\left(\frac{1}{x^{2}+1}\right)′ = -\frac{2x}{(x^{2}+1)^{2}}$." />
    </>
  );
  if (regel === "linkette") return (
    <>
      <T s="Die innere Funktion ist hier eine Gerade: $f(x) = u(mx + c)$. Setzen wir $z = mx + c$, dann ist $z(x+h) - z(x) = mh$: Ein Schritt $h$ in $x$ ist ein Schritt $mh$ in $z$." />
      <F z={[
        "f′(x) = \\lim_{h \\to 0} \\frac{u(m(x+h) + c) - u(mx + c)}{h} = \\lim_{h \\to 0} \\frac{u(z + mh) - u(z)}{h}",
        "= \\lim_{h \\to 0} \\frac{u(z + mh) - u(z)}{mh} \\cdot m = u′(z) \\cdot m = m \\cdot u′(mx + c)",
      ]} />
      <T s="Im zweiten Schritt wurde mit $m$ erweitert: Der Bruch $\frac{u(z + mh) - u(z)}{mh}$ ist genau der Differenzenquotient von $u$ an der Stelle $z$ mit der Schrittweite $mh$, und die geht mit $h$ gegen null." />
      <Merke kopf="Äußere Ableitung an der Stelle mx + c, mal Steigung m der inneren Geraden." s="Die Verschiebung $c$ spielt für die Ableitung keine Rolle. Beispiel: $(\sin(3x + 1))′ = 3\cos(3x + 1)$, $(e^{2 - 5x})′ = -5e^{2 - 5x}$." />
    </>
  );
  if (regel === "kette") return (
    <>
      <T s="Sei $f(x) = u(v(x))$. Im Differenzenquotienten erweitern wir mit $v(x+h) - v(x)$ – der Änderung der inneren Funktion:" />
      <F z={[
        "\\frac{u(v(x+h)) - u(v(x))}{h} = \\frac{u(v(x+h)) - u(v(x))}{v(x+h) - v(x)} \\cdot \\frac{v(x+h) - v(x)}{h}",
      ]} />
      <T s="Der rechte Faktor ist der Differenzenquotient von $v$ und geht gegen $v′(x)$. Im linken Faktor setzen wir $z = v(x)$ und $k = v(x+h) - v(x)$. Mit $h \to 0$ geht auch $k \to 0$ (weil $v$ stetig ist), und der Faktor wird zu $\frac{u(z + k) - u(z)}{k} \to u′(z) = u′(v(x))$. Zusammen:" />
      <F z={["f′(x) = u′(v(x)) \\cdot v′(x)"]} />
      <T s="Hinweis für Genaue: Falls $v(x+h) - v(x) = 0$ wird, darf man nicht dadurch teilen. Der saubere Beweis umgeht das mit einer Hilfsfunktion, kommt aber zu demselben Ergebnis." />
      <Merke kopf="„Äußere Ableitung an der inneren Stelle, mal innere Ableitung.“" s="Erst außen ableiten und das Innere unverändert stehen lassen, dann „nachdifferenzieren“. Beispiel: $(e^{x^{2}})′ = e^{x^{2}} \cdot 2x$. Die lineare Kettenregel ist der Spezialfall $v′(x) = m$." />
    </>
  );
  return (
    <>
      <T s="Bei den Kombinationen stecken mehrere Regeln ineinander. Die Reihenfolge ergibt sich von außen nach innen: Zuerst fragst du, was der Term als Ganzes ist – ein Produkt, ein Quotient oder eine Verkettung. Diese Regel wird zuerst angewendet. Jeder Baustein ($u$, $v$) bekommt dann in einer Nebenrechnung seine eigene Regel." />
      <F z={[
        "f(x) = x \\cdot e^{-x^{2}} \\quad \\Rightarrow \\quad \\text{Produkt mit } u = x, \\; v = e^{-x^{2}}",
        "v′ \\text{ per Kettenregel: } v′(x) = e^{-x^{2}} \\cdot (-2x)",
        "f′(x) = 1 \\cdot e^{-x^{2}} + x \\cdot e^{-x^{2}} \\cdot (-2x) = (1 - 2x^{2}) \\, e^{-x^{2}}",
      ]} />
      <T s="Am Ende lohnt sich das Ausklammern des gemeinsamen Faktors (hier $e^{-x^{2}}$): So sieht man Nullstellen der Ableitung sofort – genau das braucht man später für Extrempunkte." />
      <Merke kopf="Vorgehen in drei Schritten" s="1. Hauptregel erkennen (Produkt, Quotient oder Kette). 2. Bausteine ableiten – mit Nebenrechnung, wenn ein Baustein selbst verkettet ist. 3. Einsetzen, ausklammern, zusammenfassen." />
    </>
  );
}

const HER_TITEL = {
  produkt: ["Herleitung der Produktregel", "Mit dem Differenzenquotienten und einem Null-Trick"],
  quotient: ["Herleitung der Quotientenregel", "Aus Produkt- und Reziprokenregel"],
  reziprok: ["Herleitung der Reziprokenregel", "Zwei Brüche auf einen Nenner"],
  linkette: ["Herleitung der linearen Kettenregel", "Warum der Faktor m vorne steht"],
  kette: ["Herleitung der Kettenregel", "Mit der Änderung der inneren Funktion erweitern"],
  kombo: ["So gehst du Kombinationen an", "Hauptregel zuerst, Bausteine in Nebenrechnungen"],
};

/* ---------- Werkstatt ---------- */

export const REGEL_CHIPS = [
  ["produkt", "Produktregel"], ["quotient", "Quotientenregel"], ["reziprok", "Reziprokenregel"],
  ["linkette", "Lineare Kettenregel"], ["kette", "Kettenregel"], ["kombo", "15-Punkte-Kombo"],
];
const leer = () => ({ text: "", status: null, hinweis: "", versuche: 0, pos: 0 });
const leereFelder = () => ({ u1: leer(), uv: leer(), v1: leer(), f1: leer() });

const LABEL = (regel, teil) => teil;
/* Kleine Beschriftung über f(x) im Kopf: die Form der Regel */
const F_KOPF = { quotient: "u(x) : v(x)", reziprok: "1 : v(x)", kette: "u(v(x))", linkette: "u(mx + c)" };
const ROLLEN = {
  kette: "u ist die äußere Funktion (in x geschrieben), v die innere: f(x) = u(v(x)).",
  linkette: "u ist die äußere Funktion, v = mx + c die innere Gerade: f(x) = u(mx + c).",
  quotient: "u ist der Zähler, v der Nenner.",
  reziprok: "v ist der Nenner; der Zähler ist 1.",
  produkt: "u und v sind die beiden Faktoren.",
};

/* Nebenrechnung für einen Baustein, der selbst eine Regel braucht */
function Nebenrechnung({ teil, baum, farbe }) {
  const r = regelFuer(baum);
  if (!r || ["grund", "konst", "summe"].includes(r.art)) return null;
  const ml = r.art === "reziprok" ? musterloesung("reziprok", null, r.v) : musterloesung(r.art, r.u, r.v);
  const name = REGELN[r.art].name;
  const teile = r.art === "reziprok" ? [["v", r.v]] : r.art === "kette" || r.art === "linkette" ? [["außen", r.u], ["innen", r.v]] : [["u", r.u], ["v", r.v]];
  return (
    <div style={{ gridColumn: "1 / -1", background: "#F4F7FC", borderRadius: 12, padding: "8px 12px", fontSize: 13.5, color: C.grau, lineHeight: 1.7 }}>
      <span style={{ fontWeight: 700, color: farbe }}>Nebenrechnung {teil}′</span> · {name}:{" "}
      <span style={{ whiteSpace: "nowrap" }}>{teile.map(([n, b], i) => <span key={n}>{i ? ", " : ""}{n} = <M t={tex(b)} /></span>)}</span>
      <div style={{ overflowX: "auto", whiteSpace: "nowrap", fontSize: 16, color: C.tinte, marginTop: 2 }}>
        <span style={{ fontWeight: 700 }}>{teil}′(x) =</span> <M t={ml.einsetzen} /> <span style={{ color: C.hellgrau }}>=</span> <M t={tex(ml.ergebnis)} />
      </div>
    </div>
  );
}

/* Zellen für Regel (oben) und Rechnung (unten): gleiche Spalten, damit u′ unter u′, v unter v, + unter + steht */
function ausrichtZellen(art, ml) {
  const F = (teil, n) => `\\farbe{${teil}}{${fakTex(n)}}`;
  if (art === "produkt") {
    return {
      kopf: ["f′(x)", "=", "u′(x)", "\\cdot", "v(x)", "+", "u(x)", "\\cdot", "v′(x)"],
      unten: ml ? ["f′(x)", "=", F("u", ml.u1), "\\cdot", F("v", ml.v), "+", F("u", ml.u), "\\cdot", F("v", ml.v1)] : null,
    };
  }
  if (art === "linkette") {
    return {
      kopf: ["f′(x)", "=", "m", "\\cdot", "u′(mx + c)"],
      unten: ml ? ["f′(x)", "=", F("v", ml.v1), "\\cdot", F("u", ml.uv)] : null,
    };
  }
  return {
    kopf: ["f′(x)", "=", "u′(v(x))", "\\cdot", "v′(x)"],
    unten: ml ? ["f′(x)", "=", F("u", ml.uv), "\\cdot", F("v", ml.v1)] : null,
  };
}

/* Pen & Paper: Nähe zeigt die Rangfolge. Um + und = steht viel Luft (Hauptebene), um ·  nur sehr wenig (Faktoren gehören zusammen). */
const ZELLE = { justifySelf: "center", whiteSpace: "nowrap", textAlign: "center" };
const lueckeVon = (t) => (t === "+" || t === "−" || t === "=" ? "0 10px" : t === "\\cdot" ? "0 3px" : "0");
/* Faktoren hängen am Malpunkt: der Faktor davor schließt rechts an, der danach links (in beiden Zeilen gleich) */
const ausrichtung = (kopf, i) => (kopf[i + 1] === "\\cdot" ? "end" : kopf[i - 1] === "\\cdot" ? "start" : "center");

/* Ergebnis a ± b in zwei Teile zerlegen, damit das Vorzeichen unter dem + der Regel steht */
function ergebnisTeile(n) {
  try {
    const l = summanden(n);
    if (l.length !== 2) return null;
    const z = l[1];
    const negativ = z.k === "neg" || (z.k === "num" && z.v < 0);
    const betrag = z.k === "neg" ? z.a : z.k === "num" && z.v < 0 ? { k: "num", v: -z.v } : z;
    return { a: tex(l[0]), vz: negativ ? "−" : "+", b: tex(betrag) };
  } catch (e) { return null; }
}

/* Regel und Rechnung als zwei Boxen mit gemeinsamen Spalten (CSS-Subgrid). Der Platz bleibt am rechten Rand frei,
   damit die Abstände überall gleich eng bleiben. Die Ergebniszeilen setzen ihr „=“ in Spalte 2 und das Vorzeichen in die „+“-Spalte. */
function AusrichtBlock({ kopf, unten, ergebnis, teile }) {
  const n = kopf.length;
  const box = { gridColumn: `1 / ${n + 2}`, display: "grid", gridTemplateColumns: "subgrid", alignItems: "center", padding: "12px 10px", borderRadius: 16 };
  const plus = kopf.indexOf("+") + 1;                          // Spalte des „+“ (0 = keins)
  const geteilt = teile && plus > 0 && n === 9;
  const gleich = (hell) => <span style={{ ...ZELLE, gridColumn: 2, padding: lueckeVon("="), color: hell ? C.hellgrau : undefined, fontWeight: hell ? 400 : 700 }}><M t="=" /></span>;
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${n}, max-content) 1fr`, columnGap: 0, rowGap: 10, marginTop: 14, overflowX: "auto" }}>
      <div style={{ ...box, background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`, color: C.weiss, fontSize: 16, fontWeight: 700, lineHeight: 1.9 }}>
        {kopf.map((t, i) => <span key={i} style={{ ...ZELLE, justifySelf: ausrichtung(kopf, i), padding: lueckeVon(t) }}><M t={t} /></span>)}
      </div>
      {unten && (
        <div className="wk-rechnung" style={{ ...box, margin: 0, fontSize: 16, color: C.tinte, lineHeight: 1.9, rowGap: 2 }}>
          {unten.map((t, i) => <span key={i} style={{ ...ZELLE, justifySelf: ausrichtung(kopf, i), padding: lueckeVon(t), fontWeight: i < 2 ? 700 : 400 }}><M t={t} /></span>)}
          {ergebnis && ergebnis.map((t, j) => t && (
            <React.Fragment key={`e${j}`}>
              {gleich(true)}
              {j === 0 && geteilt ? (
                <>
                  <span style={{ gridColumn: "3 / 6", justifySelf: "end", whiteSpace: "nowrap" }}><M t={teile.a} /></span>
                  <span style={{ ...ZELLE, gridColumn: plus, padding: lueckeVon("+") }}><M t={teile.vz} /></span>
                  <span style={{ gridColumn: `${plus + 1} / ${n + 1}`, justifySelf: "start", whiteSpace: "nowrap" }}><M t={teile.b} /></span>
                </>
              ) : (
                <span style={{ gridColumn: `3 / ${n + 1}`, whiteSpace: "nowrap", justifySelf: "start" }}>
                  <M t={t} />{j === 1 && <span style={{ fontSize: 12, color: C.grau, marginLeft: 8 }}>ausgeklammert</span>}
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

export function RegelWerkstatt({ regel: regelProp, stufe: stufeProp, modus: modusProp, wurf, ohneKopf = false }) {
  // Die Regel wählt das Menü in der Kopfleiste (Ableitenstrainer); allein genutzt, hält die Werkstatt sie selbst.
  const [regelIntern] = useState("produkt");
  const regel = regelProp || regelIntern;
  // Stufe, Modus und Würfel kann der Ableitungstrainer in seiner Kopfzeile steuern (Props); allein genutzt, hält die Werkstatt sie selbst.
  const [stufe, setStufe] = useState(stufeProp || 1);
  const [modus, setModus] = useState(modusProp || "auto");
  const [auf, setAuf] = useState(() => neueAufgabe(regel, stufeProp || 1));
  const [uText, setUText] = useState(auf.uText);
  const [vText, setVText] = useState(auf.vText);
  const [posUV, setPosUV] = useState({ u: auf.uText.length, v: auf.vText.length });
  const [felder, setFelder] = useState(leereFelder);
  const [aktiv, setAktiv] = useState(null);                // null = Eingabe zu; sie öffnet erst beim Antippen eines Feldes
  const [bilanz, setBilanz] = useState({ richtig: 0, gesamt: 0 });
  const kopf = useRef(null);

  const art = auf.regel;                         // wirksame Regel (bei Kombo: produkt oder kette)
  // Alle Regeln: f(x) oben, Regel unter den Bausteinen (Layout der Produktregel).
  // Bei allen Regeln öffnet die Eingabe als Pop-up direkt unter dem angetippten Feld.
  const popRef = useRef(null);
  const R = REGELN[art];
  const mitU = art !== "reziprok";
  // Ketten: dritte Box u′(v(x)) neben u′(x), Beschriftungen äußere/innere Funktion und Ableitung
  const kette = art === "kette" || art === "linkette";

  const u = useMemo(() => (mitU ? lies(uText) : null), [uText, mitU]);
  const v = useMemo(() => lies(vText), [vText]);
  const gueltig = v && hatX(v) && (!mitU || (u && hatX(u)));
  const ml = useMemo(() => (gueltig ? musterloesung(art, u, v) : null), [art, u, v, gueltig]);

  const starte = (neu, r = regel, st = stufe) => {
    const a = neu || neueAufgabe(r, st);
    setAuf(a); setUText(a.uText); setVText(a.vText);
    setPosUV({ u: a.uText.length, v: a.vText.length });
    setFelder(leereFelder());
    setAktiv(null);
  };
  const letzteRegel = useRef(regel);
  useEffect(() => {
    if (letzteRegel.current !== regel) { letzteRegel.current = regel; starte(null, regel, stufe); }
  }, [regel]); // eslint-disable-line react-hooks/exhaustive-deps
  const waehleStufe = (st) => { setStufe(st); starte(null, regel, st); };
  const waehleModus = (m) => {
    setModus(m);
    setFelder(leereFelder());
    setAktiv(null);
  };
  const erstesMal = useRef(true);
  useEffect(() => {
    if (erstesMal.current) return;
    if (stufeProp && stufeProp !== stufe) waehleStufe(stufeProp);
  }, [stufeProp]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (erstesMal.current) return;
    if (modusProp && modusProp !== modus) waehleModus(modusProp);
  }, [modusProp]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (erstesMal.current) return;
    if (wurf !== undefined) starte();
  }, [wurf]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { erstesMal.current = false; }, []);
  useEffect(() => {
    // Automatik: ändert der Schüler u oder v, wird die Aufgabe daraus
    if (modus === "auto" && gueltig) setAuf((a) => ({ ...a, u, v, uText, vText, f: baueF(art, u, v) }));
  }, [u, v]); // eslint-disable-line react-hooks/exhaustive-deps

  const training = modus === "training";
  const setFeld = (id, patch) => setFelder((f) => ({ ...f, [id]: { ...f[id], ...patch } }));
  const reihenfolge = ["u1", "uv", "v1", "f1"].filter((id) => (id !== "u1" || mitU) && (id !== "uv" || kette));
  const offen = reihenfolge.filter((id) => !["richtig", "gezeigt"].includes(felder[id].status));
  const fertig = training && offen.length === 0 && gueltig;

  const soll = (id) => (id === "u1" ? ableitung(u) : id === "v1" ? ableitung(v) : id === "uv" ? baumEinsetzen(ableitung(u), v) : ml.soll);
  // Rückmeldung für ein einzelnes Feld; liefert true/false (richtig) oder null (Term unvollständig)
  const pruefeFeld = (id) => {
    const e = felder[id];
    const b = lies(e.text);
    if (!b) return null;
    const s = soll(id);
    const ok = gleichwertig(b, s);
    buchen({ richtig: ok, gruppe: `werkstatt-${art}`, stufe });
    if (ok) {
      setFeld(id, { status: "richtig", hinweis: "" });
    } else {
      let hinweis;
      if (id === "f1") hinweis = diagnose(b, s, fehlerbilder(art, u, v));
      else if (id === "uv") {
        hinweis = gleichwertig(b, ableitung(u)) ? "Das ist u′(x) – setze noch die innere Funktion v(x) für x ein."
          : gleichwertig(b, baumEinsetzen(u, v)) ? "Das ist u(v(x)) – du musst u noch ableiten und dann v(x) einsetzen." : diagnose(b, s);
      } else {
        const basis = id === "u1" ? u : v;
        hinweis = gleichwertig(b, basis) ? `Das ist ${id[0]} selbst – du hast noch nicht abgeleitet.` : diagnose(b, s);
        const r = regelFuer(basis);
        if (!["grund", "konst", "summe"].includes(r.art) && !gleichwertig(b, basis)) hinweis += ` Tipp: ${id[0]} braucht selbst die ${REGELN[r.art].name}.`;
      }
      setFeld(id, { status: "falsch", hinweis, versuche: e.versuche + 1 });
    }
    return ok;
  };
  const UNVOLLSTAENDIG = "Der Term ist noch nicht vollständig – fülle alle Platzhalter ▯ und schließe die Klammern.";
  const pruefen = () => {
    if (!training || !ml || !felder[aktiv]) return;
    // Das aktive Feld ist unvollständig: Eingabe bleibt offen, nichts wird gewertet
    if (!lies(felder[aktiv].text)) { setFeld(aktiv, { status: "falsch", hinweis: UNVOLLSTAENDIG }); return; }
    // OK bewertet das aktive Feld und alle anderen beschriebenen, noch ungeprüften Felder
    const ids = reihenfolge.filter((id) => id === aktiv || (felder[id].status === null && felder[id].text.trim() !== ""));
    let richtig = 0, gesamt = 0;
    ids.forEach((id) => {
      const r = pruefeFeld(id);
      if (r === null) setFeld(id, { status: "falsch", hinweis: UNVOLLSTAENDIG });
      else { gesamt += 1; if (r) richtig += 1; }
    });
    setBilanz((bz) => ({ richtig: bz.richtig + richtig, gesamt: bz.gesamt + gesamt }));
    // Nach OK verschwindet die Eingabe; Antippen eines Feldes öffnet sie wieder.
    setAktiv(null);
  };
  const loesungZeigen = () => {
    if (!ml || !aktiv) return;
    setFeld(aktiv, { status: "gezeigt", hinweis: "", zeig: tex(aktiv === "f1" ? ml.ergebnis : schoen(soll(aktiv))) });
    setAktiv(null);
  };

  // Tippen auf das aktive Feld schließt das Pop-up
  const waehleFeld = (id) => setAktiv(aktiv === id ? null : id);
  useEffect(() => {
    if (aktiv && popRef.current && popRef.current.scrollIntoView) {
      try { popRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" }); } catch (e) { /* ältere Browser */ }
    }
  }, [aktiv]);

  // Anzeige der Ableitungsfelder
  const ablTex = (id) => {
    if (!ml) return "";
    if (id === "u1") return tex(ml.u1);
    if (id === "v1") return tex(ml.v1);
    if (id === "uv") return tex(ml.uv);
    return "";
  };
  const ablFeld = (id, teil, kopf, label = `${teil}′(x) =`, gestapelt = false) => {
    const e = felder[id];
    if (!training) return <Feld kopf={kopf} gestapelt={gestapelt} label={label} labelFarbe={FARBE[teil]} tex={gueltig ? ablTex(id) : ""} still />;
    if (e.status === "gezeigt") return <Feld kopf={kopf} gestapelt={gestapelt} label={label} labelFarbe={FARBE[teil]} tex={e.zeig} status="gezeigt" still />;
    return <Feld kopf={kopf} gestapelt={gestapelt} label={label} labelFarbe={FARBE[teil]} text={e.text} aktiv={aktiv === id} status={e.status} onClick={() => waehleFeld(id)} />;
  };
  const uvFeld = (teil, text, setText, kopf) => (
    <Feld kopf={kopf} label={`${LABEL(art, teil)}(x) =`} labelFarbe={FARBE[teil]} text={text} aktiv={!training && aktiv === teil} still={training}
      onClick={() => waehleFeld(teil)} platzhalter="u eingeben …" />
  );

  const eingabeText = training ? (felder[aktiv] ? felder[aktiv].text : "") : aktiv === "u" ? uText : vText;
  const eingabePos = training ? (felder[aktiv] ? felders(felder, aktiv) : 0) : posUV[aktiv] || 0;
  const setEingabeText = (t) => {
    if (training) setFeld(aktiv, { text: t, status: null, hinweis: "" });
    else if (aktiv === "u") setUText(t); else setVText(t);
  };
  const setEingabePos = (p) => {
    if (training) setFeld(aktiv, { pos: p });
    else setPosUV((q) => ({ ...q, [aktiv]: p }));
  };

  const fTex = gueltig ? tex(schoen(auf.f)) : "";
  const nebenU = mitU && gueltig && !["grund", "konst", "summe"].includes(regelFuer(u).art);
  const nebenV = gueltig && !["grund", "konst", "summe"].includes(regelFuer(v).art);
  const zeigeNeben = !training || fertig;

  const eingabeInhalt = () => (training ? (
    <>
      {felder[aktiv] && felder[aktiv].versuche > 0 && (
        <button type="button" onClick={loesungZeigen}
          style={{ width: "100%", height: 46, borderRadius: 14, border: `1.5px solid ${C.linie}`, cursor: "pointer", fontFamily: "inherit", fontSize: 14.5, fontWeight: 600, color: C.see, background: C.weiss }}>
          Lösung zeigen
        </button>
      )}
      <Eingabe text={eingabeText} setText={setEingabeText} pos={eingabePos} setPos={setEingabePos} onEnter={pruefen} />
    </>
  ) : (
    <>
      <p style={{ fontSize: 12.5, color: C.grau, margin: "0 4px" }}>
        Du bearbeitest <b style={{ color: FARBE[aktiv] || C.tinte }}>{LABEL(art, aktiv)}(x)</b> – tippe auf das andere Feld, um es zu ändern.
      </p>
      <Eingabe text={eingabeText} setText={setEingabeText} pos={eingabePos} setPos={setEingabePos} onEnter={() => setAktiv(null)} platzhalter="z. B. x^2 oder sin(3x)" />
    </>
  ));
  const popup = () => <div className="wk-popup" ref={popRef}>{eingabeInhalt()}</div>;
  const gridPopup = !!aktiv && ["u", "v", "u1", "uv", "v1"].includes(aktiv) && !(training && fertig);
  const f1Popup = training && !fertig && aktiv === "f1";

  const rechnungZeigen = !!(gueltig && ml && (!training || fertig));
  const eingabeZeigen = !!(gueltig && ml && training && !fertig);
  const ausricht = art === "produkt" || kette;
  const zellen = ausricht ? ausrichtZellen(art, ml) : null;
  const f1Block = (
    <div style={{ marginTop: 10 }}>
      {felder.f1.status === "gezeigt"
        ? <Feld label="f′(x) =" tex={felder.f1.zeig} status="gezeigt" still />
        : <Feld label="f′(x) =" text={felder.f1.text} aktiv={aktiv === "f1"} status={felder.f1.status} onClick={() => waehleFeld("f1")}
          platzhalter="Regel anwenden und eintippen …" />}
      {felder.f1.hinweis && <p style={{ fontSize: 13.5, color: C.signal, lineHeight: 1.6, margin: "8px 4px 0" }}>{felder.f1.hinweis}</p>}
      {f1Popup && popup()}
    </div>
  );

  return (
    <div ref={kopf}>
      <style>{WERK_CSS}</style>
      {/* Stufe als Pop-up, daneben Automatik | Training und der Würfel für ein neues Beispiel */}
      {!ohneKopf && <div className="wk-kopfzeile" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <PopupWahl wert={stufe} label="Stufe wählen" optionen={[1, 2, 3].map((st) => ({ id: st, name: `Stufe ${st}` }))}
          kopf={(o) => (o ? o.name : "Stufe")} onWaehle={waehleStufe} />
        <ModusSchalter modus={modus} setModus={waehleModus} />
        <button type="button" onClick={() => starte()} className="wk-wuerfel"
          aria-label={training ? "Neue Aufgabe würfeln" : "Neues Beispiel würfeln"} title={training ? "Neue Aufgabe" : "Neues Beispiel"}>
          <span aria-hidden="true">🎲</span>
        </button>
      </div>}

      <div className="wk-karte">
        {bilanz.gesamt > 0 && (
          <p style={{ fontSize: 12.5, color: C.grau, lineHeight: 1.35, margin: "0 2px 10px" }}>{bilanz.richtig} von {bilanz.gesamt} richtig</p>
        )}

        {/* Oben: die Funktion f(x); Produktregel mit u(x) und v(x) über den Faktoren, sonst mit der Form der Regel als kleine Beschriftung */}
        <div style={{ background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`, borderRadius: 16, padding: "10px 16px 6px", marginBottom: 12, overflowX: "auto" }}>
          {gueltig ? (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 12, whiteSpace: "nowrap" }}>
              <FaktorSpalte><M t="f(x) =" /></FaktorSpalte>
              {art === "produkt" ? (
                <>
                  <FaktorSpalte label="u(x)"><M t={fakTex(schoen(u))} /></FaktorSpalte>
                  <FaktorSpalte><span aria-hidden="true">·</span></FaktorSpalte>
                  <FaktorSpalte label="v(x)"><M t={fakTex(schoen(v))} /></FaktorSpalte>
                </>
              ) : (
                <FaktorSpalte label={F_KOPF[art]}><M t={fTex} /></FaktorSpalte>
              )}
            </div>
          ) : (
            <span style={{ display: "block", fontSize: 14, fontWeight: 400, color: C.goldText, lineHeight: 1.9, paddingBottom: 4 }}>Gib {mitU ? "u und v" : "v"} ein – f ergibt sich daraus.</span>
          )}
        </div>

        {/* Bausteine; bei Ketten steht u′(v(x)) als dritte Box in der ersten Zeile */}
        <p style={{ fontSize: 12.5, color: C.grau, margin: "0 2px 8px", lineHeight: 1.5 }}>{ROLLEN[art]}</p>
        {/* Ketten: erste Zeile mit drei Boxen, die zweite Zeile (innere Funktion/Ableitung) über die volle Breite */}
        <div className={`wk-grid${kette ? " kette" : ""}`}>
          {mitU && <>
            {uvFeld("u", uText, setUText, kette ? "äußere FKT" : undefined)}
            <span className="wk-pfeil" aria-hidden="true">→</span>
            {ablFeld("u1", "u", kette ? "äußere ABL" : undefined)}
            {kette && <><span className="wk-pfeil" aria-hidden="true">→</span>{ablFeld("uv", "u", "u′ an der Stelle v(x)", "u′(v(x)) =", true)}</>}
          </>}
          {!kette && mitU && zeigeNeben && nebenU && <Nebenrechnung teil="u" baum={u} farbe={FARBE.u} />}
          {!kette && <>
            {uvFeld("v", vText, setVText)}
            <span className="wk-pfeil" aria-hidden="true">→</span>
            {ablFeld("v1", "v")}
            {zeigeNeben && nebenV && <Nebenrechnung teil="v" baum={v} farbe={FARBE.v} />}
          </>}
        </div>
        {kette && (
          <>
            {zeigeNeben && nebenU && <div className="wk-grid" style={{ marginTop: 8 }}><Nebenrechnung teil="u" baum={u} farbe={FARBE.u} /></div>}
            <div className="wk-grid" style={{ marginTop: 8 }}>
              {uvFeld("v", vText, setVText, "innere Funktion")}
              <span className="wk-pfeil" aria-hidden="true">→</span>
              {ablFeld("v1", "v", "innere Ableitung")}
              {zeigeNeben && nebenV && <Nebenrechnung teil="v" baum={v} farbe={FARBE.v} />}
            </div>
          </>
        )}
        {training && ["u1", "uv", "v1"].map((id) => felder[id].hinweis && (
          <p key={id} style={{ fontSize: 13.5, color: C.signal, lineHeight: 1.6, margin: "8px 4px 0" }}>{id === "uv" ? "u′(v(x))" : `${id[0]}′`}: {felder[id].hinweis}</p>
        ))}
        {gridPopup && popup()}

        {/* Die Regel unter den Bausteinen, darunter die Rechnung bzw. das f′-Feld. Produkt- und Kettenregeln: Regel und Rechnung
            stehen spaltengenau untereinander (u′ unter u′, v unter v, + unter +). */}
        {ausricht ? (
          <>
            <AusrichtBlock kopf={zellen.kopf} unten={rechnungZeigen ? zellen.unten : null}
              ergebnis={rechnungZeigen ? [tex(ml.ergebnis), ml.ausgeklammert ? tex(ml.ausgeklammert) : null] : null}
              teile={rechnungZeigen && art === "produkt" ? ergebnisTeile(ml.ergebnis) : null} />
            {eingabeZeigen && f1Block}
          </>
        ) : (
          <>
            <div style={{ background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`, borderRadius: 16, padding: "12px 16px", margin: "14px 0 0", overflowX: "auto" }}>
              <span style={{ color: C.weiss, fontSize: 18, fontWeight: 700, whiteSpace: "nowrap", lineHeight: 1.9 }}><M t={R.formel} /></span>
            </div>
            {rechnungZeigen && (
              <div className="wk-rechnung" style={{ marginTop: 10 }}>
                <div className="wk-zeile"><span className="wk-gleich">f′(x) =</span><M t={ml.einsetzen} /></div>
                <div className="wk-zeile"><span className="wk-gleich" style={{ color: C.hellgrau }}>=</span><M t={tex(ml.ergebnis)} /></div>
                {ml.ausgeklammert && (
                  <div className="wk-zeile"><span className="wk-gleich" style={{ color: C.hellgrau }}>=</span><M t={tex(ml.ausgeklammert)} />
                    <span style={{ fontSize: 12, color: C.grau, marginLeft: 6 }}>ausgeklammert</span></div>
                )}
              </div>
            )}
            {eingabeZeigen && f1Block}
          </>
        )}

        {/* Eingabe: öffnet als Pop-up unter dem angetippten Feld (siehe oben) */}
        {training && (
          fertig ? (
            <div style={{ textAlign: "center", padding: "16px 0 4px" }}>
              <p style={{ fontSize: 19, fontWeight: 700, color: C.smaragd, marginBottom: 4 }}>
                {reihenfolge.every((id) => felder[id].status === "richtig") ? "Alles richtig! 🎉" : "Geschafft – die Rechnung steht."}
              </p>
              <p style={{ fontSize: 14, color: C.grau, marginBottom: 14 }}>Oben siehst du die vollständige Musterlösung.</p>
              <button type="button" onClick={() => starte()}
                style={{ width: "100%", height: 54, borderRadius: 14, border: "none", cursor: "pointer", fontFamily: "inherit",
                  fontSize: 17, fontWeight: 700, color: C.weiss, background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)` }}>
                Neue Aufgabe
              </button>
            </div>
          ) : null
        )}

        {/* Produkt- und Kettenregel: kleine Erkläranimation, aufklappbar, direkt über der Herleitung */}
        {(art === "produkt" || art === "kette") && <div style={{ marginTop: 14 }}><ErklaerAnimation key={art} art={art} kompakt /></div>}

        <Herleitung titel={HER_TITEL[regel][0]} untertitel={HER_TITEL[regel][1]}>
          <HerleitungText regel={regel} />
        </Herleitung>
      </div>
    </div>
  );
}

const felders = (felder, id) => (felder[id] ? felder[id].pos || 0 : 0);
