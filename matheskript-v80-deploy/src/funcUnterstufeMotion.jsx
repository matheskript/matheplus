/* ============================================================
   Modul Unterstufe – Motion-Animationen (Abspieler).
   <Motion szene="roemisch" p={{ zahl: 2026 }} titel="…" />
   · zeigt zuerst das Schlussbild; startet von vorn, sobald die Animation zu 60 % im Bild ist (einmal), pausiert außerhalb des Bildes
   · ein Knopf: Abspielen / Pause / Nochmal; die Leiste darunter lässt sich ziehen (vor- und zurückspulen)
   · Untertitel je Abschnitt (aria-live), bei „Bewegung reduzieren“ sofort das Schlussbild
   Szenen: src/motion/szenen*.jsx (Vertrag in src/motion/kern.jsx), Zuordnung je Lerneinheit: src/unterstufeMedien.js.
   ============================================================ */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { B, F, zeitplan, fortschritt, untertitel } from "./motion/kern.jsx";
import { SZENEN_ZAHLEN } from "./motion/szenenZahlen.jsx";
import { SZENEN_GEOMETRIE } from "./motion/szenenGeometrie.jsx";
import { SZENEN_BRUECHE } from "./motion/szenenBrueche.jsx";
import { SZENEN_DATEN } from "./motion/szenenDaten.jsx";

export const SZENEN = { ...SZENEN_ZAHLEN, ...SZENEN_GEOMETRIE, ...SZENEN_BRUECHE, ...SZENEN_DATEN };

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
  .usm-leiste{-webkit-appearance:none;appearance:none;width:100%;height:4px;margin:7px 0 0;border-radius:4px;cursor:pointer;
    background:linear-gradient(90deg,#E2B53C 0%,#E2B53C var(--usm-u,0%),#EADCE3 var(--usm-u,0%),#EADCE3 100%)}
  .usm-leiste::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:999px;background:#7A0032;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.3)}
  .usm-leiste::-moz-range-thumb{width:12px;height:12px;border-radius:999px;background:#7A0032;border:2px solid #fff}
  .usm-leiste:focus-visible{outline:2px solid #EDBB00;outline-offset:3px}
`;
function stilSetzen() {
  if (typeof document === "undefined" || document.getElementById(STIL_ID)) return;
  const el = document.createElement("style"); el.id = STIL_ID; el.textContent = STIL; document.head.appendChild(el);
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

export function Motion({ szene, p = {}, titel }) {
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

  /* Bildlauf: einmal von selbst starten, außerhalb des Bildes pausieren */
  useEffect(() => {
    const el = huelle.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(([e]) => {
      sichtbar.current = e.isIntersecting && e.intersectionRatio >= 0.6;
      if (sichtbar.current && !gestartet.current && !reduziert()) { gestartet.current = true; setT(0); setLaeuft(true); }
      if (!e.isIntersecting) setLaeuft(false);
    }, { threshold: [0, 0.6] });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!laeuft) return undefined;
    let id, vorher = null;
    const schritt = (jetzt) => {
      if (vorher != null) {
        const n = Math.min(dauer, tRef.current + Math.min(64, jetzt - vorher));
        tRef.current = n; setT(n);
        if (n >= dauer) { setLaeuft(false); return; }
      }
      vorher = jetzt;
      id = requestAnimationFrame(schritt);
    };
    id = requestAnimationFrame(schritt);
    return () => cancelAnimationFrame(id);
  }, [laeuft, dauer]);

  if (!S || !plan) return null;
  const am_ende = lief && t >= dauer - 1;
  const knopf = () => {
    gestartet.current = true;
    if (laeuft) setLaeuft(false);
    else { if (t >= dauer - 1) setT(0); setLaeuft(true); }
  };
  const { Z, z } = fortschritt(plan, t);
  const text = untertitel(plan, t);
  const proz = `${((t / dauer) * 100).toFixed(1)}%`;
  return (
    <figure className="usm" ref={huelle} data-us-motion={szene} style={{ margin: "4px 0 14px" }}>
      <svg viewBox={`0 0 ${B} ${S.h}`} role="img" aria-label={S.label ? S.label(p) : titel}>
        {S.bild({ Z, z, p, t })}
      </svg>
      <figcaption className="usm-fuss">
        <button type="button" className="usm-knopf" onClick={knopf} aria-label={laeuft ? "Animation anhalten" : am_ende ? "Animation noch einmal abspielen" : "Animation abspielen"} data-usm-knopf="">
          <Icon art={laeuft ? "pause" : am_ende ? "nochmal" : "play"} />
        </button>
        <div className="usm-mitte">
          {titel && <p className="usm-titel">{titel}</p>}
          <p className="usm-text" aria-live="polite">{text}</p>
          <input type="range" className="usm-leiste" min="0" max={Math.round(dauer)} step="10" value={Math.round(t)} aria-label="Animation spulen"
            style={{ "--usm-u": proz }} onChange={(e) => { gestartet.current = true; setLaeuft(false); setT(Number(e.target.value)); }} />
        </div>
      </figcaption>
    </figure>
  );
}
