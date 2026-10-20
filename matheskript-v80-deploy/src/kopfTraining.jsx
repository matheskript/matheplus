/* ======================================================================
   KOPFTRAINING – gemeinsamer Rahmen für alle Kopfrechen-Trainer
   (Stand 20.10.2026)

   · Einstellungen (useKopfEinstellungen): Rundenlänge 10 oder 20 Aufgaben
     und der Turbo-Modus – geräteweit gespeichert, gelten in jedem Trainer.
     Turbo: Sobald die richtige Antwort im Feld steht, zählt sie sofort –
     ohne OK, ohne Häkchen-Pause – und die nächste Zahl erscheint.
   · TrainingsOptionen: die Leiste zum Umschalten (vor jeder Runde).
   · Vollbild: Während einer Runde füllt der Trainer den Bildschirm unter
     der Kopfleiste (Logo und Menü bleiben sichtbar), die Seite dahinter
     kann nicht mehr gescrollt werden (html[data-kr-voll] in index.css).
   · StartKnopf / ZweitKnopf: die goldene Pille im Mathilda-Stil.
   · Ergebnis: einheitliche Auswertung am Rundenende.

   Keine base-Datei darf diese Datei importieren.
   ====================================================================== */
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { C } from "./base1.jsx";
import { englisch } from "./i18n.js";
import { springe } from "./sprung.js";

const L = (de, en) => (englisch() ? en : de);
export const GOLD = C.flaggold;
export const NACHT = C.seeTief;
export const GOLD_PILLE = "linear-gradient(135deg, #F8D23A 0%, #EDBB00 55%, #D9A600 100%)";
export const NACHT_VERLAUF = `radial-gradient(120% 90% at 85% 10%, #163A7A 0%, ${C.see} 35%, ${NACHT} 85%)`;

/* ---------- Einstellungen ---------- */
const SCHLUESSEL = "kr-einstellungen";
const STANDARD = { runde: 10, turbo: false };
const hoerer = new Set();
let zustand = null;

export function leseEinstellungen() {
  if (zustand) return zustand;
  try {
    const roh = JSON.parse(localStorage.getItem(SCHLUESSEL) || "null");
    zustand = { ...STANDARD, ...(roh || {}) };
    if (zustand.runde !== 10 && zustand.runde !== 20) zustand.runde = 10;
    zustand.turbo = !!zustand.turbo;
  } catch { zustand = { ...STANDARD }; }
  return zustand;
}

export function setzeEinstellungen(aenderung) {
  zustand = { ...leseEinstellungen(), ...aenderung };
  try { localStorage.setItem(SCHLUESSEL, JSON.stringify(zustand)); } catch { /* optional */ }
  hoerer.forEach((f) => f(zustand));
}

/* [einstellungen, setzen] – alle Trainer teilen sich denselben Stand */
export function useKopfEinstellungen() {
  const [e, setE] = useState(leseEinstellungen);
  useEffect(() => { hoerer.add(setE); return () => hoerer.delete(setE); }, []);
  return [e, setzeEinstellungen];
}

/* ---------- Optionen-Leiste ---------- */
export function TrainingsOptionen({ style }) {
  const [e, setze] = useKopfEinstellungen();
  const pille = (an) => ({
    flex: 1, height: 40, borderRadius: 999, border: "none", fontFamily: "inherit", cursor: "pointer", fontSize: 14.5, fontWeight: 800,
    background: an ? GOLD_PILLE : "transparent", color: an ? NACHT : "#C9D6EE", transition: "background .15s, color .15s",
    boxShadow: an ? "0 4px 14px rgba(237,187,0,0.35), inset 0 1px 0 rgba(255,255,255,0.5)" : "none",
  });
  return (
    <div data-kr-optionen style={{ background: `linear-gradient(135deg, rgba(10,22,54,0.96), rgba(29,71,144,0.82))`, border: "1.5px solid rgba(255,255,255,0.14)",
      borderRadius: 20, padding: "14px 14px 12px", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 24px rgba(14,30,74,0.18)", color: C.weiss, ...style }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 180px", minWidth: 0 }}>
          <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: GOLD, marginBottom: 6 }}>{L("Aufgaben pro Runde", "Tasks per round")}</p>
          <div role="group" aria-label={L("Aufgaben pro Runde", "Tasks per round")} style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.08)", borderRadius: 999, padding: 3 }}>
            {[10, 20].map((n) => (
              <button key={n} type="button" aria-pressed={e.runde === n} onClick={() => setze({ runde: n })} style={pille(e.runde === n)}>{n}</button>
            ))}
          </div>
        </div>
        <button type="button" role="switch" aria-checked={e.turbo} onClick={() => setze({ turbo: !e.turbo })} data-kr-turbo
          style={{ flex: "1 1 180px", display: "flex", alignItems: "center", gap: 12, textAlign: "left", background: "rgba(255,255,255,0.06)", border: `1.5px solid ${e.turbo ? "rgba(237,187,0,0.55)" : "rgba(255,255,255,0.12)"}`,
            borderRadius: 16, padding: "9px 12px", cursor: "pointer", fontFamily: "inherit", color: C.weiss, transition: "border-color .15s" }}>
          <span aria-hidden="true" style={{ flex: "none", width: 46, height: 26, borderRadius: 999, position: "relative", background: e.turbo ? GOLD_PILLE : "rgba(255,255,255,0.18)", transition: "background .15s" }}>
            <span style={{ position: "absolute", top: 3, left: e.turbo ? 23 : 3, width: 20, height: 20, borderRadius: 999, background: e.turbo ? NACHT : C.weiss, transition: "left .15s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
          </span>
          <span style={{ minWidth: 0 }}>
            <span style={{ display: "block", fontSize: 14.5, fontWeight: 800, letterSpacing: "-0.01em" }}>⚡ Turbo</span>
            <span style={{ display: "block", fontSize: 11.5, color: "#C9D6EE", lineHeight: 1.3, marginTop: 1 }}>{L("Richtig getippt zählt sofort – ohne OK.", "A correct entry counts at once – no OK.")}</span>
          </span>
        </button>
      </div>
    </div>
  );
}

/* ---------- Knöpfe ---------- */
export function StartKnopf({ children, onClick, style, ...rest }) {
  return (
    <button type="button" onClick={onClick} className="kr-start" {...rest}
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", height: 58, border: "none", borderRadius: 999, cursor: "pointer", fontFamily: "inherit",
        color: NACHT, fontSize: 17, fontWeight: 800, letterSpacing: "-0.01em", background: GOLD_PILLE,
        boxShadow: "0 10px 30px rgba(237,187,0,0.40), inset 0 1px 0 rgba(255,255,255,0.55)", transition: "transform .15s ease, box-shadow .15s ease", WebkitTapHighlightColor: "transparent", ...style }}>
      <style>{`.kr-start:hover{transform:translateY(-2px);box-shadow:0 14px 36px rgba(237,187,0,0.5), inset 0 1px 0 rgba(255,255,255,0.55)!important}.kr-start:active{transform:translateY(0)}`}</style>
      {children}
    </button>
  );
}

export function ZweitKnopf({ children, onClick, hell = false, style }) {
  return (
    <button type="button" onClick={onClick}
      style={{ width: "100%", height: 50, borderRadius: 999, cursor: "pointer", fontFamily: "inherit", fontSize: 15, fontWeight: 700,
        border: `1.5px solid ${hell ? "rgba(255,255,255,0.3)" : C.linie}`, background: hell ? "rgba(255,255,255,0.08)" : C.weiss, color: hell ? C.weiss : C.see, ...style }}>
      {children}
    </button>
  );
}

/* Der Startblock vor jeder Runde: Optionen + goldener Startknopf */
export function RundenStart({ onStart, hinweis, kinder, text }) {
  const [e] = useKopfEinstellungen();
  return (
    <div data-kr-start>
      {kinder}
      <TrainingsOptionen style={{ marginBottom: 12 }} />
      <StartKnopf onClick={onStart} data-kr-start-knopf>
        <span aria-hidden="true" style={{ width: 34, height: 34, borderRadius: 999, background: NACHT, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill={GOLD} aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
        </span>
        {text || L(`Runde starten · ${e.runde} Aufgaben${e.turbo ? " · Turbo" : ""}`, `Start round · ${e.runde} tasks${e.turbo ? " · Turbo" : ""}`)}
      </StartKnopf>
      {hinweis && <p style={{ fontSize: 12.5, color: C.hellgrau, textAlign: "center", marginTop: 10, lineHeight: 1.5 }}>{hinweis}</p>}
    </div>
  );
}

/* ---------- Vollbild ---------- */
/* Höhe der Kopfleiste (Logo + Menü) messen – darunter beginnt das Trainingsfeld */
function useKopfleistenHoehe() {
  const [h, setH] = useState(56);
  useLayoutEffect(() => {
    const el = document.querySelector("[data-kopfleiste]");
    if (!el) { setH(0); return undefined; }
    const messen = () => setH(Math.round(el.getBoundingClientRect().height));
    messen();
    let ro = null;
    if (typeof ResizeObserver !== "undefined") { ro = new ResizeObserver(messen); ro.observe(el); }
    window.addEventListener("resize", messen);
    return () => { if (ro) ro.disconnect(); window.removeEventListener("resize", messen); };
  }, []);
  return h;
}

export function Vollbild({ titel, untertitel, nr, gesamt, serie = 0, onEnde, children, scrollbar = false }) {
  const oben = useKopfleistenHoehe();
  const [e] = useKopfEinstellungen();
  useEffect(() => {
    document.documentElement.setAttribute("data-kr-voll", "1");
    springe("kopf-vollbild", () => window.scrollTo(0, 0));
    return () => document.documentElement.removeAttribute("data-kr-voll");
  }, []);
  useEffect(() => {
    const taste = (ev) => { if (ev.key === "Escape") onEnde(); };
    window.addEventListener("keydown", taste);
    return () => window.removeEventListener("keydown", taste);
  }, [onEnde]);
  const hatFortschritt = typeof nr === "number" && typeof gesamt === "number";
  return (
    <div data-kr-vollbild role="dialog" aria-label={titel} className="kr-vollbild"
      style={{ position: "fixed", top: oben, left: 0, right: 0, bottom: 0, zIndex: 40, background: C.sand, display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "Montserrat, system-ui, sans-serif", color: C.tinte }}>
      <style>{`
        .kr-vollbild .kr-vb-kopf{flex:none;background:${NACHT_VERLAUF};color:#fff;position:relative}
        .kr-vollbild .kr-vb-zeile{max-width:620px;margin:0 auto;padding:10px 16px 10px 12px;display:flex;align-items:center;gap:10px}
        .kr-vollbild .kr-vb-ende{flex:none;width:40px;height:40px;border-radius:999px;border:1.5px solid rgba(255,255,255,0.22);background:rgba(255,255,255,0.08);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;font-family:inherit;-webkit-tap-highlight-color:transparent}
        .kr-vollbild .kr-vb-ende:hover{border-color:rgba(237,187,0,0.7)}
        .kr-vollbild .kr-vb-titel{flex:1;min-width:0}
        .kr-vollbild .kr-vb-titel b{display:block;font-size:15.5px;font-weight:800;letter-spacing:-0.01em;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .kr-vollbild .kr-vb-titel span{display:block;font-size:11.5px;color:#C9D6EE;font-weight:400;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .kr-vollbild .kr-vb-zahl{flex:none;font-size:13px;font-weight:800;color:${GOLD};font-variant-numeric:tabular-nums;white-space:nowrap}
        .kr-vollbild .kr-vb-balken{display:flex;gap:3px;max-width:620px;margin:0 auto;padding:0 16px 10px}
        .kr-vollbild .kr-vb-balken span{flex:1;height:5px;border-radius:3px;background:rgba(255,255,255,0.16);transition:background .2s}
        .kr-vollbild .kr-vb-balken span.ist{background:${GOLD}}
        .kr-vollbild .kr-vb-balken span.war{background:rgba(255,255,255,0.72)}
        .kr-vollbild .kr-vb-feld{flex:1;min-height:0;display:flex;flex-direction:column;overflow:${scrollbar ? "auto" : "hidden"};-webkit-overflow-scrolling:touch}
        .kr-vollbild .kr-vb-innen{width:100%;max-width:620px;margin:0 auto;padding:12px 14px 14px;flex:1;min-height:0;display:flex;flex-direction:column;box-sizing:border-box}
        .kr-vollbild .kr-vb-turbo{flex:none;font-size:10.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:${NACHT};background:${GOLD_PILLE};border-radius:999px;padding:3px 8px}
        @media (max-height:600px){.kr-vollbild .kr-vb-zeile{padding-top:6px;padding-bottom:6px}.kr-vollbild .kr-vb-innen{padding-top:8px}}
        .kr-vollbild .kr-gleichung{align-items:center}
        .kr-vollbild [data-kr-zahlenfeld]{width:100%;max-width:480px;margin:0 auto}
        @media (max-height:700px){.kr-vollbild .kr-aufgabe{min-height:70px;padding:10px 14px}.kr-vollbild .kr-bruchfeld{height:42px!important;font-size:26px!important}.kr-vollbild .kr-aufgabe > span{font-size:34px!important}.kr-vollbild .kr-eingabe{min-height:54px}.kr-vollbild .kr-vb-innen{padding-top:8px;padding-bottom:10px}.kr-vollbild .kr-taste{height:40px!important}.kr-vollbild [data-kr-zahlenfeld]{gap:6px}.kr-vollbild .kr-hinweis{display:none}.kr-vollbild .kr-hinweis-box{min-height:0!important;margin:6px 2px!important}.kr-vollbild .kr-eingabe{padding:6px 10px!important}}
        .kr-vollbild .kr-gleichung > .kr-eingabe{flex:0 1 240px}
        @media (min-width:561px){.kr-vollbild .kr-aufgabe{min-height:180px}}
        @media (max-width:560px){.kr-vollbild .kr-gleichung{align-items:stretch}.kr-vollbild .kr-gleichung > .kr-eingabe{flex:0 0 auto}}
      `}</style>
      <div className="kr-vb-kopf">
        <div className="kr-vb-zeile">
          <button type="button" className="kr-vb-ende" onClick={onEnde} aria-label={L("Training beenden", "End training")} title={L("Beenden (Esc)", "End (Esc)")} data-kr-ende>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
          <div className="kr-vb-titel"><b>{titel}</b>{untertitel && <span>{untertitel}</span>}</div>
          {e.turbo && <span className="kr-vb-turbo" aria-label="Turbo">⚡ Turbo</span>}
          {serie >= 3 && <span className="kr-vb-zahl" aria-label={L(`Serie ${serie}`, `Streak ${serie}`)}>🔥 {serie}</span>}
          {hatFortschritt && <span className="kr-vb-zahl" data-kr-nr>{Math.min(nr + 1, gesamt)} / {gesamt}</span>}
        </div>
        {hatFortschritt && (
          <div className="kr-vb-balken" aria-hidden="true">
            {Array.from({ length: gesamt }, (_, i) => <span key={i} className={i < nr ? "war" : i === nr ? "ist" : ""} />)}
          </div>
        )}
      </div>
      <div className="kr-vb-feld">
        <div className="kr-vb-innen">{children}</div>
      </div>
    </div>
  );
}

/* ---------- Ergebnis am Rundenende ---------- */
export function Ergebnis({ richtig, gesamt, sek = null, best = null, text, fehler = null, onNochmal, onEnde, kinder }) {
  const quote = Math.round((richtig / gesamt) * 100);
  const sekText = (s) => String(s).replace(".", ",");
  return (
    <div data-kr-ergebnis style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "auto" }}>
      <div style={{ background: NACHT_VERLAUF, borderRadius: 22, padding: "22px 20px 20px", color: C.weiss, textAlign: "center", boxShadow: "0 10px 30px rgba(14,30,74,0.25)", flex: "none" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: GOLD, marginBottom: 8 }}>{L("Runde geschafft", "Round complete")}</p>
        <p style={{ fontSize: 56, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.03em" }}>
          {richtig}<span style={{ fontSize: 22, color: "#C9D6EE", fontWeight: 600, marginLeft: 6 }}>/ {gesamt}</span>
        </p>
        <p style={{ fontSize: 14, color: "#C9D6EE", marginTop: 10 }}>
          {quote} %{sek !== null && ` · ${sekText(sek)} s`}
          {best && <span style={{ color: GOLD, marginLeft: 8 }}>· {L("Bestwert", "Best")} {best.richtig}/{best.gesamt || gesamt}{typeof best.sek === "number" ? ` in ${sekText(best.sek)} s` : ""}</span>}
        </p>
        <p style={{ fontSize: 16, fontWeight: 700, marginTop: 14, color: quote === 100 ? GOLD : C.weiss }}>
          {text || (quote === 100 ? L("Fehlerfrei! 🎉", "Flawless! 🎉") : quote >= 80 ? L("Stark — fast alles sitzt.", "Strong — almost everything is solid.") : quote >= 50 ? L("Gute Basis, weiter üben.", "Good basis, keep practising.") : L("Dranbleiben — Wiederholung macht schnell.", "Keep going — repetition makes you fast."))}
        </p>
      </div>
      {fehler && fehler.length > 0 && (
        <div style={{ marginTop: 12, background: C.weiss, border: `1px solid ${C.linie}`, borderRadius: 16, padding: "12px 14px", flex: "none" }}>
          <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.gruenDunkel, marginBottom: 6 }}>{L("Nochmal anschauen", "Look again")}</p>
          <div style={{ display: "grid", gap: 4 }}>{fehler}</div>
        </div>
      )}
      {kinder}
      <div style={{ marginTop: "auto", paddingTop: 14, display: "grid", gap: 10, flex: "none" }}>
        <StartKnopf onClick={onNochmal} data-kr-nochmal>{L("Neue Runde", "New round")}</StartKnopf>
        <ZweitKnopf onClick={onEnde}>{L("Zur Übersicht", "Back to overview")}</ZweitKnopf>
      </div>
    </div>
  );
}

/* Die blaue Aufgabenkarte: Aufgabe links, „=“ in Gold; wächst im Vollbild mit */
export function AufgabenKarte({ children, style }) {
  return (
    <div className="kr-aufgabe" style={{ background: NACHT_VERLAUF, borderRadius: 18, padding: "18px 16px", minHeight: 96, color: C.weiss, boxShadow: "0 8px 24px rgba(14,30,74,0.22)", ...style }}>
      {children}
    </div>
  );
}

/* Rundenrahmen ohne Vollbild (eingebettet): ein ruhiger weißer Kasten */
export const KARTE = { background: C.weiss, borderRadius: 18, padding: 16, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" };

/* Hilfsrefs für Timer */
export function useTimer() {
  const t = useRef(null);
  useEffect(() => () => clearTimeout(t.current), []);
  return t;
}
