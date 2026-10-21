/* ============================================================
   ARBEITSFLÄCHE – Desktop-Stil aller Werkzeugseiten (Vorbild „Ebene vs. Ebene“, func19.jsx)
   Regeln in DESKTOP-STIL.md (App-Ordner). Kurz:
     • ab 840 px (DESKTOP): Einstellungen links (≈ 290 px), Bild rechts daneben,
       Werkzeugleiste (Kicker + Chips) unter dem Bild, Ergebnisse/Rechenweg darunter über die volle Breite
     • Karten mit feinem Rahmen statt Schatten, Rundung 16; Kicker in Versalien
     • Grafiken rechnen in echten Pixeln (useBreite) – Beschriftungen wachsen nicht mit
     • Handy bleibt, wie es ist: Desktop ist ein eigener Zweig (if (desktop) …)
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */
import React, { useState } from "react";
import { C } from "./base1.jsx";

/* Ab hier ist die Inhaltsspalte 783 px breit (func10.jsx) und die Desktop-Regeln in index.css greifen */
export const DESKTOP = "(min-width: 840px)";

export function useMedien(q) {
  const lies = () => { try { return typeof window !== "undefined" && !!window.matchMedia && window.matchMedia(q).matches; } catch { return false; } };
  const [an, setAn] = useState(lies);
  React.useEffect(() => {
    let m; try { m = window.matchMedia(q); } catch { return undefined; }
    const f = () => setAn(m.matches);
    f();
    if (m.addEventListener) m.addEventListener("change", f); else m.addListener(f);
    return () => { if (m.removeEventListener) m.removeEventListener("change", f); else m.removeListener(f); };
  }, [q]);
  return an;
}

/* Schmal-Kontext (seit 22.10.): Ein Werkzeug, das rechts neben einem linken Menü steht (Hubs „Geraden“ und „Ebenen“,
   funcVekHub.jsx), bekommt nur ≈ 580 px. Innerhalb von <SchmalKontext.Provider value={true}> liefert useDesktop() false –
   das Werkzeug zeigt dann seinen Handy-Zweig (für 360–620 px gebaut), ohne dass es sich selbst umbauen muss. */
export const SchmalKontext = React.createContext(false);
export const useSchmal = () => React.useContext(SchmalKontext);
export const useDesktop = () => { const breit = useMedien(DESKTOP); const schmal = React.useContext(SchmalKontext); return breit && !schmal; };

/* Breite eines Elements in Pixeln. Callback-Ref: auch ein neu gemountetes Element wird gemessen.
   const [ref, breite] = useBreite();  <div ref={ref}>…</div>  (breite = 0 vor der ersten Messung) */
export function useBreite() {
  const [el, setEl] = useState(null);
  const [b, setB] = useState(0);
  React.useEffect(() => {
    if (!el) return undefined;
    const f = () => setB(Math.round(el.clientWidth));
    f();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(f) : null;
    if (ro) ro.observe(el);
    return () => { if (ro) ro.disconnect(); };
  }, [el]);
  return [setEl, b];
}

/* ---------- Stile ---------- */
export const LINKS_BREITE = 290;
export const feinKarte = { background: C.weiss, borderRadius: 16, padding: "18px 20px", border: `1px solid ${C.linie}` };
export const kickerStil = { fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.grau, marginBottom: 8 };
export const titelStil = { fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 10 };
export const hinweisStil = { fontSize: 12.5, color: C.grau, lineHeight: 1.55 };
/* Getönte Karte für eine Eingabegruppe in einer Farbe (wie E₁/E₂) */
export const toenKarte = (farbe) => ({ border: `1.5px solid ${farbe}33`, background: `${farbe}08`, borderRadius: 16, padding: "14px 12px" });

/* ---------- Bausteine ---------- */
export function Kicker({ children, style }) {
  return <p style={{ ...kickerStil, ...style }}>{children}</p>;
}

export function FeinKarte({ children, style, ...rest }) {
  return <div {...rest} style={{ ...feinKarte, ...style }}>{children}</div>;
}

/* Rahmen für Schaubild/Grafik: weiß, feiner Rand, Inhalt randlos */
export function BildKarte({ children, style, ...rest }) {
  return <div {...rest} style={{ border: `1px solid ${C.linie}`, borderRadius: 16, overflow: "hidden", background: C.weiss, position: "relative", ...style }}>{children}</div>;
}

/* Zwei Spalten: links Einstellungen, rechts Bild. Nur im Desktop-Zweig verwenden. */
export function Arbeitsflaeche({ links, rechts, linksBreite = LINKS_BREITE, gap = 20, style }) {
  return (
    <div data-arbeitsflaeche style={{ display: "grid", gridTemplateColumns: `minmax(0, ${linksBreite}px) minmax(0, 1fr)`, gap, alignItems: "start", ...style }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>{links}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>{rechts}</div>
    </div>
  );
}

/* Werkzeugleiste unter dem Bild: Gruppen aus Kicker + Inhalt (Chips, Schalter) */
export function Werkzeugleiste({ gruppen }) {
  const g = gruppen.filter(Boolean);
  if (!g.length) return null;
  return (
    <div style={{ display: "grid", gap: 14, padding: "2px 2px 0" }}>
      {g.map((x, i) => (
        <div key={i}>
          {x.titel && <Kicker>{x.titel}</Kicker>}
          {x.inhalt}
        </div>
      ))}
    </div>
  );
}

/* Chip im Stil der Beispiele-Knöpfe */
export const chipStil = (an = false, farbe = C.see) => ({
  flexShrink: 0, padding: "6px 12px", minHeight: 32, borderRadius: 999, border: `1px solid ${an ? farbe : C.linie}`,
  background: an ? farbe : C.weiss, color: an ? C.weiss : farbe, fontSize: 12.5, fontFamily: "inherit", cursor: "pointer", whiteSpace: "nowrap",
});

/* Ergebniszeile: mehrere Karten nebeneinander (Spaltenverhältnis per spalten, z. B. "5fr 7fr") */
export function ErgebnisReihe({ children, spalten, gap = 16, style }) {
  const n = React.Children.toArray(children).filter(Boolean).length;
  const cols = spalten || `repeat(${Math.max(1, n)}, minmax(0, 1fr))`;
  return <div style={{ display: "grid", gridTemplateColumns: cols, gap, alignItems: "start", ...style }}>{children}</div>;
}
