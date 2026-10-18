/* Mathilda AI – der Lern-Zyklus unter dem Kopf: geschwungener Pfad in fünf Schritten.
   1 Mathe mit Pen and Paper → 2 „Scan dein Blatt“ (der Knopf im Kopf, bleibt an seinem Platz)
   → 3 MathildaAI arbeitet → 4 Feedback → 5 Erkenntnis; von 4 zurück zu 1.
   Der Pfad wird aus den echten Positionen berechnet (Knopf und Knoten), damit er auf jedem Bildschirm sitzt. */
import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import { C } from "./base1.jsx";
import { mitMathildaAI } from "./mathildaName.jsx";

const GOLD = C.flaggold;
const NACHT = C.seeTief;

/* Position eines Elements relativ zur Kopf-Fläche, ohne Transformationen (Animationen verfälschen nichts) */
function lage(el, wurzel) {
  let x = 0, y = 0, e = el;
  while (e && e !== wurzel) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight, mx: x + el.offsetWidth / 2, my: y + el.offsetHeight / 2 };
}

/* Weißes Blatt, Handschrift, schlanker schwarzer Kugelschreiber mit Metallspitze */
function PenPaperBild() {
  return (
    <svg viewBox="0 0 100 100" width="88" height="88" aria-hidden="true" style={{ display: "block", overflow: "visible" }}>
      <ellipse cx="38" cy="90" rx="30" ry="4" fill="rgba(5,12,40,0.35)" />
      <g transform="rotate(-5 36 48)">
        <rect x="6" y="8" width="62" height="78" rx="3" fill="#FFFFFF" />
        <path d="M54 8h11a3 3 0 0 1 3 3v11z" fill="#DDE5F4" />
        <text x="13" y="40" fontFamily="Caveat, cursive" fontWeight="600" fontSize="19" fill="#1B2A55">3a + 4a</text>
        <text x="13" y="62" fontFamily="Caveat, cursive" fontWeight="600" fontSize="19" fill="#1B2A55">= 7a</text>
        <rect x="11" y="47" width="42" height="21" rx="4" fill="none" stroke="#1B2A55" strokeWidth="1.4" />
      </g>
      <g transform="translate(50 76) rotate(-50)">
        <polygon points="0,0 11,-2.7 11,2.7" fill="#C3CBDA" />
        <circle cx="0.6" cy="0" r="1.3" fill="#6B7487" />
        <rect x="11" y="-3.3" width="7" height="6.6" fill="#D8DEEC" />
        <rect x="18" y="-3.2" width="16" height="6.4" fill="#2A2D36" />
        <rect x="34" y="-3.2" width="30" height="6.4" rx="3.2" fill="#14161B" />
        <rect x="38" y="-2.3" width="22" height="1" rx="0.5" fill="rgba(255,255,255,0.28)" />
        <rect x="44" y="-5" width="22" height="2" rx="1" fill="#AEB6C6" />
        <rect x="60" y="-3.2" width="9" height="6.4" rx="3.2" fill="#14161B" />
      </g>
    </svg>
  );
}

function FeedbackBild() {
  return (
    <svg viewBox="0 0 34 34" width="34" height="34" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 7h24v16H14l-6 5v-5H5z" />
      <path d="M11 15l4 4 8-8" stroke={GOLD} strokeWidth="2.8" />
    </svg>
  );
}

function AhaBild() {
  return (
    <svg viewBox="0 0 34 34" width="36" height="36" fill="none" stroke={NACHT} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 24c0-3-4-4.5-4-9a9 9 0 0 1 18 0c0 4.5-4 6-4 9z" />
      <path d="M13 28h8M14.5 31h5" />
      <path d="M17 2.5v2M5 6.5l1.5 1.5M29 6.5L27.5 8M1.5 15h2M30.5 15h2" />
    </svg>
  );
}

function Beschriftung({ titel, text, links }) {
  return (
    <span className={`mz-text${links ? " mz-text-l" : ""}`}>
      <b>{mitMathildaAI(titel, true)}</b>
      <span>{text}</span>
    </span>
  );
}

export function MathildaZyklus({ scanRef, modus, setModus, weitere }) {
  const zRef = useRef(null);
  const r1 = useRef(null), r3 = useRef(null), r4 = useRef(null), r5 = useRef(null);
  const [geo, setGeo] = useState(null);

  const rechne = useCallback(() => {
    const scan = scanRef.current, z = zRef.current;
    const wurzel = z && z.closest(".mathilda-kopf");
    if (!scan || !wurzel || !r1.current || !r3.current || !r4.current || !r5.current) return;
    const kam = scan.querySelector(".mk-kam") || scan;
    const b = lage(kam, wurzel), s = lage(scan, wurzel);
    const k1 = lage(r1.current, wurzel), k3 = lage(r3.current, wurzel), k4 = lage(r4.current, wurzel), k5 = lage(r5.current, wurzel);
    const J = { x: b.mx, y: s.y + s.h + 30 };
    const f = (n) => Math.round(n * 10) / 10;

    /* A: 1 → 2 (hoch zum Knopf) */
    const ax = k1.mx, ay = k1.y - 6;
    const A = `M${f(ax)} ${f(ay)} C${f(ax)} ${f(ay - 44)} ${f(J.x)} ${f(J.y + 14 + 44)} ${f(J.x)} ${f(J.y + 15)}`;
    /* B: 2 → 3 (nach rechts, Welle nach unten) */
    const bsx = J.x + 15, bsy = J.y, bex = k3.x - 9, bey = k3.my;
    const bd = Math.max(40, (bex - bsx) * 0.5);
    const B = `M${f(bsx)} ${f(bsy)} C${f(bsx + bd)} ${f(bsy)} ${f(bex - bd)} ${f(bey)} ${f(bex)} ${f(bey)}`;
    /* C: 3 → 4 (Schwung nach unten) */
    const csx = k3.mx, csy = k3.y + k3.h + 6, cex = k4.mx, cey = k4.y - 9;
    const cd = (cey - csy) * 0.4;
    const Cc = `M${f(csx)} ${f(csy)} C${f(csx + 30)} ${f(csy + cd)} ${f(cex - 30)} ${f(cey - cd)} ${f(cex)} ${f(cey)}`;
    /* D: 4 → 5 (nach rechts) */
    const dsx = k4.x + k4.w + 7, dsy = k4.my, dex = k5.x - 9, dey = k5.my;
    const dd = (dex - dsx) * 0.4;
    const D = `M${f(dsx)} ${f(dsy)} C${f(dsx + dd)} ${f(dsy - 17)} ${f(dex - dd)} ${f(dey + 17)} ${f(dex)} ${f(dey)}`;
    /* E: 4 → 1 (zurück nach links, Zyklus) */
    const esx = k4.x - 7, esy = k4.my, eex = k1.x + k1.w + 7, eey = k1.my;
    const ed = (esx - eex) * 0.4;
    const E = `M${f(esx)} ${f(esy)} C${f(esx - ed)} ${f(esy + 17)} ${f(eex + ed)} ${f(eey - 17)} ${f(eex)} ${f(eey)}`;

    const neu = { w: wurzel.offsetWidth, h: wurzel.offsetHeight, J, stumpf: [f(b.mx), f(s.y + s.h), f(J.x), f(J.y - 13)], pfade: [A, B, Cc, D, E] };
    setGeo((alt) => (alt && alt.w === neu.w && alt.h === neu.h && alt.pfade.join("|") === neu.pfade.join("|") && alt.J.x === J.x && alt.J.y === J.y ? alt : neu));
  }, [scanRef]);

  useLayoutEffect(() => {
    rechne();
    const wurzel = zRef.current && zRef.current.closest(".mathilda-kopf");
    let ro = null;
    if (wurzel && typeof ResizeObserver !== "undefined") { ro = new ResizeObserver(rechne); ro.observe(wurzel); }
    window.addEventListener("resize", rechne);
    window.addEventListener("load", rechne);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(rechne).catch(() => {});
    const t = setTimeout(rechne, 400);
    return () => { if (ro) ro.disconnect(); window.removeEventListener("resize", rechne); window.removeEventListener("load", rechne); clearTimeout(t); };
  }, [rechne]);

  return (
    <>
      <style>{`
        .mz { max-width: 760px; margin: 0 auto; padding: 44px 24px 24px; border-top: 1px solid rgba(255,255,255,0.08); position: static; }
        .mz-raster { display: grid; grid-template-columns: repeat(3, 1fr); column-gap: 0; row-gap: 30px; align-items: start; }
        .mz-knoten { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; background: none; border: none; padding: 0; margin: 0; font-family: inherit; color: #FFFFFF; text-align: center; animation: mz-ein .7s cubic-bezier(.2,.8,.2,1) both; }
        button.mz-knoten { cursor: pointer; -webkit-tap-highlight-color: transparent; }
        button.mz-knoten:focus-visible { outline: 2px solid ${GOLD}; outline-offset: 4px; border-radius: 16px; }
        .mz-feld { height: 88px; display: flex; align-items: center; justify-content: center; }
        .mz-form { position: relative; display: flex; align-items: center; justify-content: center; flex: none; }
        .mz-kreis { width: 70px; height: 70px; border-radius: 999px; }
        .mz-nr { position: absolute; top: -6px; left: -6px; width: 22px; height: 22px; border-radius: 999px; background: ${GOLD}; color: ${NACHT}; font-size: 12px; font-weight: 800; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(5,12,40,0.45); }
        .mz-papier .mz-nr { left: -2px; top: 0; }
        .mz-feedback { background: rgba(255,255,255,0.09); border: 2px solid rgba(255,255,255,0.55); box-shadow: inset 0 1px 0 rgba(255,255,255,0.18); }
        .mz-aha { background: linear-gradient(135deg, #F8D23A 0%, ${GOLD} 55%, #D9A600 100%); box-shadow: 0 0 0 5px rgba(237,187,0,0.18), 0 10px 30px rgba(237,187,0,0.45), inset 0 1px 0 rgba(255,255,255,0.55); }
        .mz-mai { background: ${NACHT}; border: 2px solid ${GOLD}; box-shadow: 0 8px 24px rgba(5,12,40,0.5), 0 0 22px rgba(237,187,0,0.28); }
        .mz-mai-t { font-weight: 800; font-size: 22px; letter-spacing: -0.03em; line-height: 1; }
        .mz-mai-ring { position: absolute; inset: -9px; border-radius: 999px; border: 2px dashed rgba(237,187,0,0.7); animation: mz-dreh 14s linear infinite; }
        .mz-text { display: block; margin-top: 4px; max-width: 118px; }
        .mz-text b { display: block; font-size: 13px; font-weight: 700; letter-spacing: -0.01em; line-height: 1.22; }
        .mz-text > span { display: block; font-size: 11.5px; font-weight: 300; line-height: 1.38; color: #C9D6EE; margin-top: 3px; }
        .mz-text-l { text-align: left; margin: 0 0 0 14px; max-width: none; }
        .mz-drei { grid-column: 2 / span 2; grid-row: 1; flex-direction: row; justify-content: flex-start; align-items: center; padding-left: calc(25% - 35px); text-align: left; }
        .mz-drei .mz-text { margin-top: 0; }
        .mz-eins { grid-column: 1; grid-row: 2; }
        .mz-vier { grid-column: 2; grid-row: 2; }
        .mz-fuenf { grid-column: 3; grid-row: 2; }
        .mz-eins:hover .mz-papier, .mz-eins:focus-visible .mz-papier { transform: rotate(-3deg) translateY(-2px); }
        .mz-papier { transition: transform .2s ease; }
        .mz-svg { position: absolute; left: 0; top: 0; z-index: 1; pointer-events: none; overflow: visible; }
        .mz-pfad-spur { fill: none; stroke: rgba(237,187,0,0.22); stroke-width: 7; stroke-linecap: round; }
        .mz-pfad { fill: none; stroke: ${GOLD}; stroke-width: 3.2; stroke-linecap: round; stroke-dasharray: 0.1 9; animation: mz-fluss 1.6s linear infinite; }
        .mz-pfad-zurueck { stroke: rgba(255,255,255,0.78); stroke-dasharray: 0.1 8; animation-direction: normal; }
        .mz-pfad-zurueck.mz-spur { stroke: rgba(255,255,255,0.12); }
        .mz-stumpf { stroke: ${GOLD}; stroke-width: 2.4; stroke-linecap: round; stroke-dasharray: 0.1 6; fill: none; }
        .mz-zwei { position: absolute; z-index: 2; width: 26px; height: 26px; border-radius: 999px; background: ${GOLD}; color: ${NACHT}; font-size: 13.5px; font-weight: 800; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 0 4px rgba(237,187,0,0.2), 0 4px 12px rgba(5,12,40,0.5); }
        .mz-mehr { position: relative; z-index: 2; margin-top: 22px; display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 8px; }
        .mz-mehr-l { font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #9FB2D6; margin-right: 4px; }
        .mz-chip { font-family: inherit; cursor: pointer; font-size: 12.5px; font-weight: 600; color: #DCE5F6; background: rgba(255,255,255,0.06); border: 1.5px solid rgba(255,255,255,0.18); border-radius: 999px; padding: 7px 13px; transition: background .15s ease, transform .15s ease; -webkit-tap-highlight-color: transparent; }
        .mz-chip:hover { background: rgba(255,255,255,0.12); transform: translateY(-1px); }
        .mz-chip[data-aktiv="1"] { background: #FFFFFF; color: ${NACHT}; border-color: #FFFFFF; box-shadow: inset 0 -3px 0 ${GOLD}; }
        @keyframes mz-fluss { to { stroke-dashoffset: -9.1; } }
        @keyframes mz-dreh { to { transform: rotate(360deg); } }
        @keyframes mz-ein { from { opacity: 0; } to { opacity: 1; } }
        @media (max-width: 560px) {
          .mz { padding-left: 10px; padding-right: 10px; }
          .mz-kreis { width: 66px; height: 66px; }
          .mz-papier svg { width: 80px; height: 80px; }
          .mz-drei { padding-left: calc(25% - 33px); }
          .mz-eins { left: -8px; }
          .mz-fuenf { left: 6px; }
        }
        @media (min-width: 561px) {
          .mz { padding-top: 56px; }
          .mz-raster { row-gap: 38px; }
          .mz-kreis { width: 78px; height: 78px; }
          .mz-feld { height: 98px; }
          .mz-nr { width: 24px; height: 24px; font-size: 13px; }
          .mz-mai-t { font-size: 24px; }
          .mz-drei { padding-left: calc(25% - 39px); }
          .mz-text { max-width: 190px; }
          .mz-text b { font-size: 15px; }
          .mz-text > span { font-size: 12.5px; }
          .mz-text-l { margin-left: 18px; }
          .mz-papier svg { width: 100px; height: 100px; }
        }
        @media (prefers-reduced-motion: reduce) { .mz-pfad, .mz-mai-ring, .mz-knoten { animation: none; } }
      `}</style>

      <div className="mz" ref={zRef} role="group" aria-label="So lernst du mit Mathilda: ein Kreislauf in fünf Schritten">
        <div className="mz-raster">
          <button type="button" className="mz-knoten mz-eins" onClick={() => setModus && setModus("blatt")} style={{ animationDelay: "0.05s" }}>
            <span className="mz-feld">
              <span className="mz-form mz-papier" ref={r1}><PenPaperBild /><span className="mz-nr">1</span></span>
            </span>
            <Beschriftung titel="Mathe mit Pen and Paper" text="Weißes Blatt, schwarzer Stift" />
          </button>

          <div className="mz-knoten mz-drei" style={{ animationDelay: "0.2s" }}>
            <span className="mz-feld" style={{ height: 88 }}>
              <span className="mz-form mz-kreis mz-mai" ref={r3}>
                <span className="mz-mai-ring" aria-hidden="true" />
                <span className="mz-mai-t"><span style={{ color: "#FFFFFF" }}>M</span><span style={{ color: GOLD }}>AI</span></span>
                <span className="mz-nr">3</span>
              </span>
            </span>
            <Beschriftung titel="MathildaAI arbeitet" text="Sie liest dein Blatt Zeile für Zeile" links />
          </div>

          <div className="mz-knoten mz-vier" style={{ animationDelay: "0.35s" }}>
            <span className="mz-feld">
              <span className="mz-form mz-kreis mz-feedback" ref={r4}><FeedbackBild /><span className="mz-nr">4</span></span>
            </span>
            <Beschriftung titel="Du kriegst Feedback" text="Erst das Gelungene, dann ein Hebel" />
          </div>

          <div className="mz-knoten mz-fuenf" style={{ animationDelay: "0.5s" }}>
            <span className="mz-feld">
              <span className="mz-form mz-kreis mz-aha" ref={r5}><AhaBild /><span className="mz-nr" style={{ background: NACHT, color: GOLD }}>5</span></span>
            </span>
            <Beschriftung titel="Deine Erkenntnis" text="Der Aha-Moment" />
          </div>
        </div>

        {weitere && weitere.length > 0 && (
          <div className="mz-mehr">
            <span className="mz-mehr-l">Weitere Wege</span>
            {weitere.map((x) => (
              <button key={x.id} type="button" className="mz-chip" data-aktiv={modus === x.id ? "1" : "0"} onClick={() => setModus(x.id)}>{x.name}</button>
            ))}
          </div>
        )}
      </div>

      {geo && (
        <>
          <svg className="mz-svg" width={geo.w} height={geo.h} viewBox={`0 0 ${geo.w} ${geo.h}`} aria-hidden="true">
            <defs>
              <marker id="mz-pfeil" viewBox="0 0 12 12" refX="9" refY="6" markerWidth="13" markerHeight="13" markerUnits="userSpaceOnUse" orient="auto">
                <path d="M2 2L9.5 6L2 10" fill="none" stroke={GOLD} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </marker>
              <marker id="mz-pfeil-w" viewBox="0 0 12 12" refX="9" refY="6" markerWidth="13" markerHeight="13" markerUnits="userSpaceOnUse" orient="auto">
                <path d="M2 2L9.5 6L2 10" fill="none" stroke="#FFFFFF" strokeOpacity="0.85" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </marker>
            </defs>
            {geo.pfade.map((d, i) => (
              <g key={i}>
                <path d={d} className={i === 4 ? "mz-pfad-spur mz-pfad-zurueck mz-spur" : "mz-pfad-spur"} />
                <path d={d} className={i === 4 ? "mz-pfad mz-pfad-zurueck" : "mz-pfad"} markerEnd={i === 4 ? "url(#mz-pfeil-w)" : "url(#mz-pfeil)"} />
              </g>
            ))}
            <line className="mz-stumpf" x1={geo.stumpf[0]} y1={geo.stumpf[1]} x2={geo.stumpf[2]} y2={geo.stumpf[3]} />
          </svg>
          <span className="mz-zwei" style={{ left: geo.J.x - 13, top: geo.J.y - 13 }} aria-hidden="true">2</span>
        </>
      )}
    </>
  );
}
