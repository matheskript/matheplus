/* ============================================================
   Modul Unterstufe – Motion-Animationen (Abspieler).
   <Motion szene="roemisch" p={{ zahl: 2026 }} titel="…" />
   · zeigt zuerst das Schlussbild; startet von vorn, sobald die Animation zu 60 % im Bild ist (einmal), pausiert außerhalb des Bildes
   · ein Knopf: Abspielen / Pause / Nochmal; die Leiste darunter lässt sich ziehen (vor- und zurückspulen)
   · Lesezeit (src/lesezeit.js): von vorn steht zuerst die Frage zum Lesen da, jeder Untertitel bleibt bis er gelesen ist
   · Untertitel je Abschnitt (aria-live), bei „Bewegung reduzieren“ sofort das Schlussbild
   Szenen: src/motion/szenen*.jsx (Vertrag in src/motion/kern.jsx), Zuordnung je Lerneinheit: src/unterstufeMedien.js.
   ============================================================ */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { B, F, NACHLAUF, zeitplan, fortschritt, untertitel } from "./motion/kern.jsx";
import { lesezeitMs } from "./lesezeit.js";
import { SZENEN_ZAHLEN } from "./motion/szenenZahlen.jsx";
import { SZENEN_GEOMETRIE } from "./motion/szenenGeometrie.jsx";
import { SZENEN_BRUECHE } from "./motion/szenenBrueche.jsx";
import { SZENEN_DATEN } from "./motion/szenenDaten.jsx";
import { SZENEN_EXTRA } from "./motion/szenenExtra.jsx";
import { SZENEN_ZWEIT_ZAHLEN } from "./motion/szenenZweitZahlen.jsx";
import { SZENEN_ZWEIT_GEOMETRIE } from "./motion/szenenZweitGeometrie.jsx";
import { SZENEN_ZWEIT_BRUECHE } from "./motion/szenenZweitBrueche.jsx";
import { SZENEN_ZWEIT_DATEN } from "./motion/szenenZweitDaten.jsx";
import { SZENEN_ZWEIT_RECHNEN } from "./motion/szenenZweitRechnen.jsx";
import { SZENEN_VEKTOREN } from "./motion/szenenVektoren.jsx";
import { SZENEN_GERADEN } from "./motion/szenenGeraden.jsx";

export const SZENEN = { ...SZENEN_ZAHLEN, ...SZENEN_GEOMETRIE, ...SZENEN_BRUECHE, ...SZENEN_DATEN, ...SZENEN_EXTRA,
  ...SZENEN_ZWEIT_ZAHLEN, ...SZENEN_ZWEIT_GEOMETRIE, ...SZENEN_ZWEIT_BRUECHE, ...SZENEN_ZWEIT_DATEN, ...SZENEN_ZWEIT_RECHNEN, ...SZENEN_VEKTOREN, ...SZENEN_GERADEN };

const STIL_ID = "us-motion-stil";
const STIL = `
  .usm{margin:4px 0 14px;border-radius:18px;background:linear-gradient(180deg,#FFFFFF 0%,#FBF7F9 100%);border:1px solid #F1E3EA;overflow:hidden}
  .usm svg{display:block;width:100%;height:auto}
  .usm-fuss{display:flex;align-items:center;gap:10px;padding:8px 12px 10px;border-top:1px solid #F1E3EA}
  .usm-knopf{flex:none;width:38px;height:38px;border-radius:999px;border:none;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;
    background:linear-gradient(150deg,#3A0019 0%,#7A0032 100%);color:#FFD66B;box-shadow:0 6px 14px -8px rgba(58,0,25,0.7)}
  .usm-knopf:focus-visible{outline:3px solid #EDBB00;outline-offset:2px}
  .usm-mitte{flex:1;min-width:0}
  .usm-titel{margin:0;font-size:11px;font-weight:800;letter-spacing:0.09em;text-transform:uppercase;color:#7A0032;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .usm-text{margin:2px 0 0;font-size:13.5px;line-height:1.45;font-weight:600;color:${F.tinte};min-height:1.45em}
  .usm-frage{color:#7A0032}
  .usm-frage::before{content:"?";display:inline-block;width:1.3em;height:1.3em;margin-right:6px;border-radius:999px;background:#7A0032;color:#FFD66B;font-size:11px;line-height:1.3em;text-align:center;font-weight:800;vertical-align:1px}
  .usm-kern{margin:8px 0 0;padding:8px 11px;border-radius:12px;background:#FFF1C7;border:1px solid #E2B53C;color:#3A0019;font-size:13.5px;line-height:1.45;font-weight:700;animation:usm-auf .35s ease}
  .usm-kern b{display:block;font-size:10.5px;letter-spacing:0.1em;text-transform:uppercase;color:#8A6400;margin:0 0 5px}
  .usm-kern .usm-vec,.usm-frage .usm-vec{margin-top:2px}
  @keyframes usm-auf{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
  @media (prefers-reduced-motion: reduce){.usm-kern{animation:none}}
  .usm-leiste{-webkit-appearance:none;appearance:none;width:100%;height:4px;margin:7px 0 0;border-radius:4px;cursor:pointer;
    background:linear-gradient(90deg,#E2B53C 0%,#E2B53C var(--usm-u,0%),#EADCE3 var(--usm-u,0%),#EADCE3 100%)}
  .usm-leiste::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:999px;background:#7A0032;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.3)}
  .usm-leiste::-moz-range-thumb{width:12px;height:12px;border-radius:999px;background:#7A0032;border:2px solid #fff}
  .usm-leiste:focus-visible{outline:2px solid #EDBB00;outline-offset:3px}
  .usm-auswahl{margin:14px 0 16px}
  .usm-kopf{display:flex;align-items:center;gap:10px;margin:0 0 8px}
  .usm-kopf b{font-size:11.5px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:#7A0032;white-space:nowrap}
  .usm-chips{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding:2px 0}
  .usm-chips::-webkit-scrollbar{display:none}
  .usm-chip{flex:none;padding:6px 12px;border-radius:999px;border:1.5px solid #EADCE3;background:#fff;color:#7A0032;font-family:inherit;font-size:12.5px;font-weight:700;cursor:pointer;white-space:nowrap}
  .usm-chip[aria-pressed="true"]{background:linear-gradient(150deg,#3A0019 0%,#7A0032 100%);border-color:transparent;color:#FFD66B}
  .usm-chip:focus-visible{outline:3px solid #EDBB00;outline-offset:2px}
  .usm-auswahl .usm{margin:0}
  .usm-vec{position:relative;display:inline-block;font-style:italic;padding:0 2px 0 1px;margin-right:1px}
  .usm-vec::before{content:"";position:absolute;left:0;right:1px;top:-0.08em;height:1.2px;background:currentColor}
  .usm-vec::after{content:"";position:absolute;right:1px;top:-0.08em;width:3.5px;height:3.5px;border-top:1.2px solid currentColor;border-right:1.2px solid currentColor;transform:translate(0,-50%) rotate(45deg)}
  .usm-kapitel{display:flex;flex-wrap:wrap;gap:5px;margin:8px 0 0}
  .usm-kap{padding:4px 10px;border-radius:999px;border:1px solid #EADCE3;background:#fff;color:#7A0032;font-family:inherit;font-size:11.5px;font-weight:700;cursor:pointer;white-space:nowrap;line-height:1.3}
  .usm-kap[aria-current="true"]{background:#7A0032;border-color:#7A0032;color:#FFD66B}
  .usm-kap:focus-visible{outline:3px solid #EDBB00;outline-offset:2px}
  /* Thema Vektoren (Oberstufe): Blau statt Granat */
  .usm-vektoren{background:linear-gradient(180deg,#FFFFFF 0%,#F6F8FC 100%);border-color:#E3E8F2}
  .usm-vektoren .usm-fuss{border-top-color:#E3E8F2}
  .usm-vektoren .usm-knopf{background:linear-gradient(150deg,#0B2A5C 0%,#004D98 100%);color:#FFD66B;box-shadow:0 6px 14px -8px rgba(0,77,152,0.7)}
  .usm-vektoren .usm-titel{color:#004D98}
  .usm-vektoren .usm-frage{color:#004D98}
  .usm-vektoren .usm-frage::before{background:#004D98}
  .usm-vektoren .usm-leiste{background:linear-gradient(90deg,#E2B53C 0%,#E2B53C var(--usm-u,0%),#E3E8F2 var(--usm-u,0%),#E3E8F2 100%)}
  .usm-vektoren .usm-leiste::-webkit-slider-thumb{background:#004D98}
  .usm-vektoren .usm-leiste::-moz-range-thumb{background:#004D98}
  .usm-vektoren .usm-kap{border-color:#E3E8F2;color:#004D98}
  .usm-vektoren .usm-kap[aria-current="true"]{background:#004D98;border-color:#004D98;color:#FFD66B}
`;
function stilSetzen() {
  if (typeof document === "undefined" || document.getElementById(STIL_ID)) return;
  const el = document.createElement("style"); el.id = STIL_ID; el.textContent = STIL; document.head.appendChild(el);
}
/* „n⃗“, „PX⃗“, „n⃗₀“ im Untertitel: der kombinierende Pfeil (U+20D7) fehlt in Montserrat → Buchstaben kursiv mit gezeichnetem Pfeil (CSS) */
export function mitPfeilen(text) {
  const teile = String(text).split(/([A-Za-z]{1,2}\u20D7)/);
  if (teile.length === 1) return text;
  return teile.map((t, i) => (i % 2 ? <span key={i} className="usm-vec">{t.slice(0, -1)}</span> : t));
}
const reduziert = () => typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const Icon = ({ art }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
    {art === "play" && <path d="M4 2.5 L13.5 8 L4 13.5 Z" fill="currentColor" />}
    {art === "pause" && <g fill="currentColor"><rect x="3.5" y="2.5" width="3.2" height="11" rx="1" /><rect x="9.3" y="2.5" width="3.2" height="11" rx="1" /></g>}
    {art === "nochmal" && <path d="M8 2.5a5.5 5.5 0 1 1-5.2 3.7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
    {art === "nochmal" && <path d="M1.4 2.2 L3.2 6.6 L7.3 4.8 Z" fill="currentColor" />}
  </svg>
);

/* thema: "vektoren" färbt den Abspieler blau (Oberstufe); kapitel: [{ k, name }] – Sprungmarken auf Abschnitte des Ablaufs;
   tempo: Abspielgeschwindigkeit (0,5 = halb so schnell, die Szene selbst bleibt unverändert)
   frage: die Frage, die die Animation beantwortet – steht vor dem ersten Abspielen unter dem Standbild
   kern:  der Kernsatz (die eine Einsicht) – erscheint in der Ruhe am Ende und bleibt im Standbild stehen */
export function Motion({ szene, p = {}, titel, thema, kapitel, tempo = 1, frage, kern }) {
  React.useInsertionEffect(stilSetzen, []);
  const S = SZENEN[szene];
  const plan = useMemo(() => (S ? zeitplan(S.ablauf(p)) : null), [S, p]);
  const dauer = plan ? plan.dauer : 1;
  /* Vor dem ersten Abspielen steht das Schlussbild da (wie ein Standbild); im Bild startet es von vorn */
  const [t, setTRoh] = useState(dauer);
  const tRef = useRef(t);
  const setT = (n) => { tRef.current = n; setTRoh(n); };
  const [laeuft, setLaeuftRoh] = useState(false);
  const [lief, setLief] = useState(false);
  const setLaeuft = (an) => { if (an) setLief(true); setLaeuftRoh(an); };
  const huelle = useRef(null), gestartet = useRef(false), sichtbar = useRef(false);
  /* Vorlauf: Startet die Animation von vorn, bleibt zuerst die Frage so lange stehen, wie man zum Lesen braucht */
  const vorlaufRest = useRef(0);
  const [imVorlauf, setImVorlauf] = useState(false);
  const vonVorn = () => { setT(0); if (frage && !reduziert()) { vorlaufRest.current = lesezeitMs(frage); setImVorlauf(true); } };

  /* Bildlauf: einmal von selbst starten, außerhalb des Bildes pausieren */
  useEffect(() => {
    const el = huelle.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(([e]) => {
      sichtbar.current = e.isIntersecting && e.intersectionRatio >= 0.6;
      if (sichtbar.current && !gestartet.current && !reduziert()) { gestartet.current = true; vonVorn(); setLaeuft(true); }
      if (!e.isIntersecting) setLaeuft(false);
    }, { threshold: [0, 0.6] });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!laeuft) return undefined;
    let id, vorher = null;
    const schritt = (jetzt) => {
      if (vorher != null && vorlaufRest.current > 0) {
        vorlaufRest.current -= Math.min(64, jetzt - vorher);
        if (vorlaufRest.current <= 0) { vorlaufRest.current = 0; setImVorlauf(false); }
      } else if (vorher != null) {
        const n = Math.min(dauer, tRef.current + Math.min(64, jetzt - vorher) * tempo);
        tRef.current = n; setT(n);
        if (n >= dauer) { setLaeuft(false); return; }
      }
      vorher = jetzt;
      id = requestAnimationFrame(schritt);
    };
    id = requestAnimationFrame(schritt);
    return () => cancelAnimationFrame(id);
  }, [laeuft, dauer, tempo]);

  if (!S || !plan) return null;
  const am_ende = lief && t >= dauer - 1;
  const knopf = () => {
    gestartet.current = true;
    if (laeuft) setLaeuft(false);
    else { if (t >= dauer - 1) vonVorn(); setLaeuft(true); }
  };
  const { Z, z } = fortschritt(plan, t);
  const text = untertitel(plan, t);
  /* Vor dem ersten Abspielen: die Frage; in der Ruhe am Ende (und im Standbild danach): der Kernsatz */
  const vorher = !lief && !gestartet.current;
  const schluss = t >= dauer - NACHLAUF - 1;
  const zeigeFrage = !!frage && (vorher || imVorlauf) && !reduziert();
  const zeigeKern = !!kern && ((schluss && !vorher) || reduziert());
  const proz = `${((t / dauer) * 100).toFixed(1)}%`;
  const springe = (k) => { const a = plan.abschnitte.find((x) => x.k === k); if (!a) return; gestartet.current = true; vorlaufRest.current = 0; setImVorlauf(false); setT(a.start); setLaeuft(true); };
  const aktuellesKapitel = kapitel && [...kapitel].reverse().find((kp) => { const a = plan.abschnitte.find((x) => x.k === kp.k); return a && a.start <= t + 1; });
  return (
    <figure className={`usm${thema ? ` usm-${thema}` : ""}`} ref={huelle} data-us-motion={szene} style={{ margin: "4px 0 14px" }}>
      <svg viewBox={`0 0 ${B} ${S.h}`} role="img" aria-label={S.label ? S.label(p) : titel}>
        {S.bild({ Z, z, p, t })}
      </svg>
      <figcaption className="usm-fuss">
        <button type="button" className="usm-knopf" onClick={knopf} aria-label={laeuft ? "Animation anhalten" : am_ende ? "Animation noch einmal abspielen" : "Animation abspielen"} data-usm-knopf="">
          <Icon art={laeuft ? "pause" : am_ende ? "nochmal" : "play"} />
        </button>
        <div className="usm-mitte">
          {titel && <p className="usm-titel">{titel}</p>}
          <p className={`usm-text${zeigeFrage ? " usm-frage" : ""}`} aria-live="polite" data-usm-text={zeigeFrage ? "frage" : "text"}>{mitPfeilen(zeigeFrage ? frage : text)}</p>
          {zeigeKern && <p className="usm-kern" data-usm-kern=""><b>Das Wichtigste</b>{mitPfeilen(kern)}</p>}
          <input type="range" className="usm-leiste" min="0" max={Math.round(dauer)} step="10" value={Math.round(t)} aria-label="Animation spulen"
            style={{ "--usm-u": proz }} onChange={(e) => { gestartet.current = true; vorlaufRest.current = 0; setImVorlauf(false); setLaeuft(false); setT(Number(e.target.value)); }} />
          {kapitel && kapitel.length > 0 && (
            <div className="usm-kapitel" role="group" aria-label="Zu einem Abschnitt springen">
              {kapitel.map((kp) => <button key={kp.k} type="button" className="usm-kap" aria-current={aktuellesKapitel && aktuellesKapitel.k === kp.k ? "true" : undefined} onClick={() => springe(kp.k)} data-usm-kap={kp.k}>{mitPfeilen(kp.name)}</button>)}
            </div>
          )}
        </div>
      </figcaption>
    </figure>
  );
}

/* Mehrere Animationen platzsparend: eine sichtbar, Wahl über eine Chip-Reihe („So geht's“).
   Genutzt von den Unterstufen-Werkzeugen (ZweiModi in geoUi.jsx, Prop animationen). */
export function MotionAuswahl({ liste, kopf = "So geht’s" }) {
  React.useInsertionEffect(stilSetzen, []);
  const [i, setI] = useState(0);
  if (!liste || !liste.length) return null;
  const a = liste[Math.min(i, liste.length - 1)];
  return (
    <section className="usm-auswahl" data-usm-auswahl={liste.length}>
      <div className="usm-kopf">
        <b>{kopf}</b>
        {liste.length > 1 && (
          <div className="usm-chips" role="group" aria-label="Animation wählen">
            {liste.map((m, k) => <button key={k} type="button" className="usm-chip" aria-pressed={k === i} onClick={() => setI(k)} data-usm-chip={k}>{m.titel}</button>)}
          </div>
        )}
      </div>
      <Motion key={i} {...a} />
    </section>
  );
}
