/* ============================================================
   WurzelZeichen — das eine Wurzelzeichen der ganzen App.

   Regel: Haken, Aufstrich und Überstrich sind EIN Linienzug.
   Der Überstrich wächst ohne Versatz direkt aus der Spitze des
   Aufstrichs heraus und läuft in genau derselben Höhe über den
   ganzen Radikanden. Das Zeichen wird deshalb nicht aus dem
   Schriftzeichen „√“ plus border-top zusammengesetzt (die Höhe
   des Glyphen-Endes hängt von Schrift, Größe und Zeilenhöhe ab),
   sondern nach dem Messen des Radikanden als SVG gezeichnet.

   Verwendung:
     <WurzelZeichen>x</WurzelZeichen>
     <WurzelZeichen index="3">…</WurzelZeichen>      // dritte Wurzel
   Der Formel-Renderer M (func3.jsx) nutzt es für \sqrt{…} und
   \sqrt[n]{…}, ebenso Wurzel (func19.jsx) und der Gleichungs-Trainer.
   ============================================================ */

import React, { useLayoutEffect, useRef, useState } from "react";

const HAKEN = 0.54;    // Breite von Haken + Aufstrich in em
const LUFT = 0.07;     // Abstand zwischen Aufstrich und Radikand in em
const ABSTAND = 0.1;   // Luft über dem Überstrich in em (trennt ihn z. B. vom Bruchstrich darüber)
const OBEN = 0.13;     // Abstand zwischen Überstrich und Radikand in em
const TIEF = 0.1;      // so weit bleibt die Hakenspitze über der Unterkante der Box (em)
const FREI = 0.14;     // Mindestluft zwischen Überstrich und Hochzahl in em
const RECHTS = 0.08;   // Überstand des Überstrichs rechts in em
const INDEX = 0.2;     // zusätzlicher Platz links für den Wurzelexponenten in em

/* Strichstärke wächst mit Schriftgröße und Schriftstärke */
const strichStaerke = (fs, fett, staerke = 1) => Math.max(1.1, fs * (fett ? 0.085 : 0.058)) * staerke;

export function WurzelZeichen({ children, index = null, staerke = 1, style }) {
  const box = useRef(null);
  const [m, setM] = useState(null);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return undefined;
    const mess = () => {
      const w = el.offsetWidth, h = el.offsetHeight;
      const cs = getComputedStyle(el);
      const fs = parseFloat(cs.fontSize) || 16;
      const fett = (parseInt(cs.fontWeight, 10) || 400) >= 600;
      const r = el.getBoundingClientRect();
      const mass = r.height > 0 && h > 0 ? r.height / h : 1;              // falls die Box gerade skaliert wird
      // Hochzahlen (sup, gl-hoch) haben Zeilenhöhe 0 und ragen über die Zeile. Sie bekommen mindestens
      // FREI em Luft unter dem Überstrich; dafür wandert der Überstrich samt Box nach oben.
      let hoch = Infinity;
      el.querySelectorAll(".m-wurzel-inhalt sup, .m-wurzel-inhalt .gl-hoch").forEach((k) => {
        const kr = k.getBoundingClientRect();
        if (kr.height > 0 && kr.top < hoch) hoch = kr.top;
      });
      let ueber = 0;
      if (hoch !== Infinity) {
        const jetzt = parseFloat(el.dataset.ueber || "0");
        const strich = ABSTAND * fs + strichStaerke(fs, fett, staerke);          // Unterkante des Überstrichs
        const luft = (hoch - r.top) / mass - jetzt - strich;                   // Luft ohne Zusatz
        ueber = Math.max(0, Math.round(FREI * fs - luft));
      }
      setM((a) => (a && a.w === w && a.h === h && a.fs === fs && a.fett === fett && a.ueber === ueber ? a : { w, h, fs, fett, ueber }));
    };
    mess();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(mess) : null;
    if (ro) ro.observe(el);
    return () => { if (ro) ro.disconnect(); };
  }, []);

  const ix = index != null && index !== "" ? INDEX : 0;
  let pfad = null;
  if (m && m.w > 0 && m.h > 0) {
    const { w, h, fs } = m;
    const s = strichStaerke(fs, m.fett, staerke);
    const y0 = ABSTAND * fs + s / 2;                     // Mitte des Überstrichs
    const ox = ix * fs;
    const unten = h - TIEF * fs;                         // Spitze unten
    const tick = h - Math.min(0.46 * h, 0.56 * fs);      // Höhe des kleinen Anstrichs
    const xa = ox + 0.03 * fs, xb = ox + 0.14 * fs, xc = ox + 0.29 * fs, xd = ox + HAKEN * fs;
    // ein einziger Linienzug: Anstrich → Abstrich → Aufstrich → Überstrich bis zum rechten Rand
    const zug = `M${xa} ${tick + 0.06 * fs} L${xb} ${tick} L${xc} ${unten} L${xd} ${y0} L${w} ${y0}`;
    const abstrich = `M${xb} ${tick} L${xc} ${unten}`;
    pfad = (
      <svg aria-hidden="true" width={w} height={h} viewBox={`0 0 ${w} ${h}`}
        style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
        <path d={zug} fill="none" stroke="currentColor" strokeWidth={s} strokeLinejoin="round" strokeLinecap="butt" />
        <path d={abstrich} fill="none" stroke="currentColor" strokeWidth={s * 1.75} strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <span ref={box} className="m-wurzel" data-ueber={m ? m.ueber : 0}
      style={{ position: "relative", display: "inline-block", whiteSpace: "nowrap", lineHeight: 1.2,
        padding: `calc(${ABSTAND + OBEN}em + ${m ? m.ueber : 0}px) ${RECHTS}em 0 ${HAKEN + LUFT + ix}em`, ...style }}>
      {ix > 0 && (
        <span style={{ position: "absolute", left: 0, bottom: "1.12em", fontSize: "0.56em", lineHeight: 1 }}>{index}</span>
      )}
      {pfad}
      <span className="m-wurzel-inhalt">{children}</span>
    </span>
  );
}
