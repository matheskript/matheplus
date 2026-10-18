/* ======================================================================
   WURZELZEICHEN – die einzige Art, in der App eine Wurzel zu zeichnen.

   Haken und Überstrich sind EIN SVG-Linienzug (siehe wurzelGeometrie.js).
   Die Komponente misst den Radikanden (auch nach Schrift-Nachladen und
   Größenänderungen) und zeichnet den Pfad passend dazu:
     - Strich wird mit der Schrift dicker, bei fetter Schrift kräftiger,
     - Hochzahlen im Radikanden bekommen automatisch Platz unter dem Überstrich,
     - n-te Wurzeln bekommen einen kleinen Index über dem Anstrich.

   Verwendung:
     <WurzelZeichen>2</WurzelZeichen>            √2
     <WurzelZeichen index="3">8</WurzelZeichen>  ³√8
     <MitWurzeln text="c = √(a² + b²)" />        Klartext mit „√“ sauber setzen
     \sqrt{…} / \sqrt[n]{…} in M / MS / Text     (func3.jsx nutzt diese Komponente)

   Diese Datei importiert nur React und reine Logik – darf also von base*.jsx
   und func*.jsx gleichermaßen benutzt werden.
   ====================================================================== */
import React, { useLayoutEffect, useRef, useState } from "react";
import { WURZEL_MASS, klartextWurzeln, wurzelPfad, wurzelStrich } from "./wurzelGeometrie.js";

const RO = typeof ResizeObserver !== "undefined" ? ResizeObserver : null;

export function WurzelZeichen({ children, index, style }) {
  const aussen = useRef(null);
  const innen = useRef(null);
  const [m, setM] = useState(null);

  useLayoutEffect(() => {
    const el = aussen.current, rad = innen.current;
    if (!el || !rad) return undefined;
    let aus = false;
    const messen = () => {
      if (aus) return;
      const cs = getComputedStyle(el);
      const f = parseFloat(cs.fontSize) || 16;
      const gw = parseInt(cs.fontWeight, 10) || 400;
      // Ragt etwas (Hochzahl, Bruch) über die Oberkante des Radikanden hinaus?
      const r0 = rad.getBoundingClientRect();
      let hoch = 0;
      rad.querySelectorAll("*").forEach((k) => {
        if (k.closest(".m-wurzel") !== el) return;   // eigene innere Wurzeln messen sich selbst
        const r = k.getBoundingClientRect();
        if (r.height > 0) hoch = Math.max(hoch, r0.top - r.top);
      });
      const neu = { w: el.offsetWidth, h: el.offsetHeight, f, gw, hoch: Math.round(Math.max(0, hoch) * 2) / 2 };
      setM((alt) => (alt && alt.w === neu.w && alt.h === neu.h && alt.f === neu.f && alt.gw === neu.gw && alt.hoch === neu.hoch ? alt : neu));
    };
    messen();
    const ro = RO ? new RO(messen) : null;
    if (ro) { ro.observe(el); ro.observe(rad); }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(messen).catch(() => {});
    return () => { aus = true; if (ro) ro.disconnect(); };
  }, []);

  const f = m ? m.f : 16;
  const s = m ? wurzelStrich(m.f, m.gw) : 1;
  const obenPx = (m ? m.hoch : 0) + s;          // Platz für Strich + überstehende Hochzahlen
  const luft = `calc(${WURZEL_MASS.luft}em + ${obenPx}px)`;
  return (
    <span ref={aussen} className="m-wurzel" data-wurzel=""
      style={{
        position: "relative", display: "inline-block", whiteSpace: "nowrap", lineHeight: 1.15,
        paddingTop: luft, paddingLeft: `${WURZEL_MASS.haken}em`, paddingRight: `${WURZEL_MASS.rechts}em`,
        // Gleich viel Raum unten: in zentrierten Flex-Zeilen bleibt die Grundlinie so auf Höhe des Nachbartexts
        marginBottom: `calc(${WURZEL_MASS.luft * 0.6}em)`,
        marginLeft: index ? "0.28em" : "0.04em", marginRight: "0.04em",
        ...style,
      }}>
      {m && (
        <svg aria-hidden="true" width={m.w} height={m.h}
          style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
          <path d={wurzelPfad({ w: m.w, h: m.h, f, s })} fill="none" stroke="currentColor" strokeWidth={s}
            strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      )}
      {index != null && index !== "" && (
        <span aria-hidden="true" style={{ position: "absolute", left: "-0.4em", bottom: "1.02em", fontSize: "0.55em",
          lineHeight: 1, fontWeight: 600 }}>{index}</span>
      )}
      <span ref={innen} className="m-radikand" style={{ display: "inline-block" }}>{children}</span>
    </span>
  );
}

/* Klartext mit „√“ (z. B. „c = √(a² + b²)“) sauber setzen. Die Klammer direkt
   nach „√“ entfällt, der Überstrich übernimmt ihre Aufgabe. */
export function MitWurzeln({ text }) {
  if (typeof text !== "string" || !/[√∛∜]/.test(text)) return text ?? null;
  const zeichne = (teile) => teile.map((p, i) => (typeof p === "string" ? <React.Fragment key={i}>{p}</React.Fragment>
    : <WurzelZeichen key={i} index={p.index}>{zeichne(p.wurzel)}</WurzelZeichen>));
  return <>{zeichne(klartextWurzeln(text))}</>;
}

/* Für Stellen, die beliebige Kinder bekommen: Strings darin mit MitWurzeln setzen. */
export function wurzelnIn(kind) {
  if (typeof kind === "string") return /[√∛∜]/.test(kind) ? <MitWurzeln text={kind} /> : kind;
  if (Array.isArray(kind)) return kind.map((k, i) => (typeof k === "string" ? <MitWurzeln key={i} text={k} /> : k));
  return kind;
}
