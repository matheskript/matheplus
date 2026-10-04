import React, { useLayoutEffect, useRef, useState } from "react";

/* Kacheltexte: Besteht ein Text aus mehreren Sätzen, steht jeder Satz in einer
   eigenen Zeile – ohne Umbruch mitten im Satz. Passt ein Satz nicht in die
   Breite, wird die Schrift der Zeilen verkleinert (bis „min“). Erst darunter
   darf ausnahmsweise doch umbrochen werden. Ein einzelner Satz fließt normal. */

const SATZ_GRENZE = /(?<=[A-Za-zÄÖÜäöüß)]{2}[.!?…])\s+(?=[A-ZÄÖÜ„"])/;

export function saetze(text) {
  return typeof text === "string" ? text.split(SATZ_GRENZE).filter(Boolean) : [text];
}

export function SatzZeilen({ text, max = 12.5, min = 9.5 }) {
  const teile = saetze(text);
  const kasten = useRef(null);
  const [groesse, setGroesse] = useState(max);
  const mehrere = teile.length > 1;

  useLayoutEffect(() => {
    if (!mehrere || !kasten.current) return undefined;
    const el = kasten.current;
    const messen = () => {
      const breite = el.clientWidth;
      if (!breite) return;
      const zeilen = [...el.querySelectorAll("[data-satz]")];
      // Breite jeder Zeile bei Maximalgröße hochrechnen
      setGroesse((g) => {
        const breiteste = Math.max(...zeilen.map((z) => z.scrollWidth * (max / g)));
        const neu = Math.max(min - 0.01, Math.min(max, Math.floor((max * breite * 0.985 / breiteste) * 10) / 10));
        return Math.abs(neu - g) < 0.1 ? g : neu;
      });
    };
    messen();
    const ro = new ResizeObserver(messen);
    ro.observe(el);
    el.querySelectorAll("[data-satz]").forEach((z) => ro.observe(z));
    // Übersetzung tauscht den Text im DOM aus – dann neu messen
    const mo = new MutationObserver(messen);
    mo.observe(el, { subtree: true, characterData: true, childList: true });
    return () => { ro.disconnect(); mo.disconnect(); };
  }, [text, max, min, mehrere]);

  if (!mehrere) return <>{text}</>;
  const umbrechen = groesse < min;
  return (
    <span ref={kasten} style={{ display: "block", width: "100%" }}>
      {teile.map((s, i) => (
        <span key={i} style={{ display: "block", whiteSpace: umbrechen ? "normal" : "nowrap" }}>
          <span data-satz style={{ display: "inline-block", fontSize: umbrechen ? min : groesse, whiteSpace: "inherit" }}>{s}</span>
        </span>
      ))}
    </span>
  );
}
