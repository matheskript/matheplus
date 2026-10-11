import React, { useRef } from "react";
import { M } from "./func3.jsx";
import { anzeige } from "./perfAufgaben.js";

/* ======================================================================
   perfUi.jsx – gemeinsame Bausteine des Performance-Labs
   Dunkles Marineblau, Blau/Türkis für aktive Zustände, Orange/Violett für
   Herausforderungen und Erfolge, abgerundete Karten, Fortschrittsringe.
   Schrift: Montserrat (erbt von der App).
   Keine base-Datei darf diese Datei importieren.
   ====================================================================== */

export const L = {
  bg: "#0A1330", bg2: "#0F1B40", karte: "#14224D", karteHoch: "#1A2B5E", linie: "rgba(255,255,255,0.10)", linieStark: "rgba(255,255,255,0.18)",
  text: "#EEF3FF", ged: "#A9B7DA", still: "#7E8DB5",
  blau: "#3D8BFF", tuerkis: "#27D3C3", orange: "#FF9F43", violett: "#9B7BFF", gruen: "#3DDC97", rot: "#FF7A7A", gold: "#EDBB00",
};

/* Status eines Fehlermusters → Farbe und kurzer Text */
export const MUSTER_FARBE = { einzeln: L.still, moeglich: L.blau, wiederkehrend: L.orange, gestuetzt: L.violett };
export const KANAL_FARBE = { digital: L.blau, scan: L.tuerkis, manuell: L.violett };
export const STATUS_FARBE = { erkannt: L.blau, bestaetigt: L.gruen, unsicher: L.orange, verworfen: L.still };

export const datum = (ts) => new Date(ts).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
export const datumKurz = (ts) => new Date(ts).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
export const prozent = (v) => `${Math.round(v * 100)} %`;

export const karteStil = { background: L.karte, border: `1px solid ${L.linie}`, borderRadius: 20, padding: 20 };

export function Karte({ children, style, hoch, ...rest }) {
  return <div {...rest} style={{ ...karteStil, ...(hoch ? { background: L.karteHoch } : null), ...style }}>{children}</div>;
}

export function Kicker({ children, farbe = L.tuerkis, style }) {
  return <p style={{ margin: "0 0 8px", fontSize: 11.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: farbe, ...style }}>{children}</p>;
}

export function Titel({ children, klein, style }) {
  return <h3 style={{ margin: "0 0 8px", fontSize: klein ? 17 : "clamp(20px, 5vw, 24px)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.25, color: L.text, ...style }}>{children}</h3>;
}

export function Absatz({ children, style }) {
  return <p style={{ margin: "0 0 12px", fontSize: 14.5, fontWeight: 400, lineHeight: 1.7, color: L.ged, ...style }}>{children}</p>;
}

export function Chip({ children, farbe = L.blau, voll, style, title }) {
  return (
    <span title={title} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600, lineHeight: 1.3,
      color: voll ? L.bg : farbe, background: voll ? farbe : `${farbe}22`, border: `1px solid ${voll ? farbe : `${farbe}55`}`, whiteSpace: "nowrap", ...style }}>{children}</span>
  );
}

const KNOPF = {
  primaer: { background: `linear-gradient(135deg, ${L.blau} 0%, ${L.tuerkis} 100%)`, color: L.bg, border: "none" },
  orange: { background: `linear-gradient(135deg, ${L.orange} 0%, ${L.gold} 100%)`, color: L.bg, border: "none" },
  violett: { background: `linear-gradient(135deg, ${L.violett} 0%, ${L.blau} 100%)`, color: "#fff", border: "none" },
  sekundaer: { background: "rgba(255,255,255,0.07)", color: L.text, border: `1px solid ${L.linieStark}` },
  geist: { background: "transparent", color: L.tuerkis, border: `1px solid ${L.tuerkis}66` },
  gefahr: { background: "transparent", color: L.rot, border: `1px solid ${L.rot}66` },
};
export function Knopf({ children, onClick, art = "primaer", disabled, klein, style, type = "button", ...rest }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className="perf-knopf" {...rest}
      style={{ fontFamily: "inherit", cursor: disabled ? "default" : "pointer", fontWeight: 700, fontSize: klein ? 13 : 14.5, lineHeight: 1.2, minHeight: klein ? 38 : 46,
        padding: klein ? "8px 14px" : "12px 22px", borderRadius: 999, opacity: disabled ? 0.45 : 1, ...KNOPF[art], ...style }}>{children}</button>
  );
}

/* Fortschrittsring (SVG). wert/max → Anteil. */
export function Ring({ wert, max, groesse = 96, dicke = 9, farbe = L.tuerkis, farbe2 = L.blau, children, label }) {
  const r = (groesse - dicke) / 2, u = 2 * Math.PI * r, a = max > 0 ? Math.min(1, wert / max) : 0;
  const id = `ring-${farbe.slice(1)}-${farbe2.slice(1)}`;
  return (
    <div role="img" aria-label={label || `${wert} von ${max}`} style={{ position: "relative", width: groesse, height: groesse, flexShrink: 0 }}>
      <svg width={groesse} height={groesse} viewBox={`0 0 ${groesse} ${groesse}`} aria-hidden="true">
        <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={farbe} /><stop offset="100%" stopColor={farbe2} /></linearGradient></defs>
        <circle cx={groesse / 2} cy={groesse / 2} r={r} fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth={dicke} />
        <circle cx={groesse / 2} cy={groesse / 2} r={r} fill="none" stroke={`url(#${id})`} strokeWidth={dicke} strokeLinecap="round"
          strokeDasharray={`${u * a} ${u}`} transform={`rotate(-90 ${groesse / 2} ${groesse / 2})`} style={{ transition: "stroke-dasharray 0.7s cubic-bezier(.2,.8,.2,1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", textAlign: "center", color: L.text }}>{children}</div>
    </div>
  );
}

/* Maschinenschreibweise → Formelanzeige der App (M). Nicht lesbare Eingaben erscheinen unverändert. */
export function formelText(s) { try { return anzeige(s); } catch (e) { return String(s ?? ""); } }
export function Formel({ t, roh, gross, farbe = L.text, style }) {
  return (
    <span style={{ color: farbe, fontSize: gross ? "clamp(24px, 6.4vw, 32px)" : 17, fontWeight: 500, ...style }}>
      <M t={roh ? t : formelText(t)} />
    </span>
  );
}
/* Text mit $…$-Formeln (aus perfAufgaben.js) */
export function MText({ s, style }) {
  const teile = String(s ?? "").split("$");
  return <span style={style}>{teile.map((t, i) => (i % 2 ? <M key={i} t={t} /> : <span key={i}>{t}</span>))}</span>;
}

/* Formeleingabe mit Tastenleiste (mobil) und Live-Vorschau */
const TASTEN = [["x", "x"], ["x²", "x^2"], ["^", "^"], ["(", "("], [")", ")"], ["+", "+"], ["−", "-"], ["·", "*"], ["=", "="]];
export function Formeleingabe({ wert, setWert, onEnter, placeholder, label = "Deine Eingabe", autoFokus, disabled, vorschau = true }) {
  const ref = useRef(null);
  const einfuegen = (z) => {
    const el = ref.current;
    if (!el) { setWert(wert + z); return; }
    const a = el.selectionStart ?? wert.length, b = el.selectionEnd ?? wert.length;
    const neu = wert.slice(0, a) + z + wert.slice(b);
    setWert(neu);
    requestAnimationFrame(() => { try { el.focus(); el.setSelectionRange(a + z.length, a + z.length); } catch (e) { /* egal */ } });
  };
  const loeschen = () => {
    const el = ref.current;
    const a = el?.selectionStart ?? wert.length, b = el?.selectionEnd ?? wert.length;
    if (a !== b) { setWert(wert.slice(0, a) + wert.slice(b)); return; }
    if (a === 0) return;
    setWert(wert.slice(0, a - 1) + wert.slice(a));
    requestAnimationFrame(() => { try { el.focus(); el.setSelectionRange(a - 1, a - 1); } catch (e) { /* egal */ } });
  };
  return (
    <div>
      <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: L.ged, marginBottom: 6 }}>{label}</label>
      <input ref={ref} value={wert} onChange={(e) => setWert(e.target.value)} disabled={disabled} autoFocus={autoFokus}
        onKeyDown={(e) => { if (e.key === "Enter" && onEnter) onEnter(); }}
        placeholder={placeholder} inputMode="text" autoCapitalize="off" autoCorrect="off" spellCheck={false} aria-label={label}
        style={{ width: "100%", boxSizing: "border-box", fontFamily: "inherit", fontSize: 19, fontWeight: 500, letterSpacing: "0.01em", color: L.text, background: L.bg, caretColor: L.tuerkis,
          border: `1.5px solid ${L.linieStark}`, borderRadius: 14, padding: "14px 16px", outline: "none" }} className="perf-feld" />
      <div role="group" aria-label="Zeichen einfügen" style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
        {TASTEN.map(([anz, z]) => (
          <button key={anz} type="button" onClick={() => einfuegen(z)} disabled={disabled} aria-label={`Zeichen ${anz}`} className="perf-taste"
            style={{ fontFamily: "inherit", minWidth: 44, minHeight: 44, padding: "0 12px", borderRadius: 12, border: `1px solid ${L.linie}`, background: "rgba(255,255,255,0.06)", color: L.text, fontSize: 17, fontWeight: 600, cursor: "pointer" }}>{anz}</button>
        ))}
        <button type="button" onClick={loeschen} disabled={disabled} aria-label="Ein Zeichen löschen" className="perf-taste"
          style={{ fontFamily: "inherit", minWidth: 52, minHeight: 44, padding: "0 12px", borderRadius: 12, border: `1px solid ${L.linie}`, background: "rgba(255,255,255,0.06)", color: L.ged, fontSize: 16, cursor: "pointer" }}>⌫</button>
      </div>
      {vorschau && wert.trim() && (
        <div aria-label="Vorschau" style={{ marginTop: 10, padding: "10px 14px", borderRadius: 12, background: "rgba(39,211,195,0.07)", border: `1px dashed ${L.tuerkis}55`, overflowX: "auto" }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: L.tuerkis, marginRight: 10 }}>Vorschau</span>
          <Formel t={wert} gross />
        </div>
      )}
    </div>
  );
}

/* Kleine Balkengrafik (Wochenverlauf) */
export function Balken({ daten, farbe = L.blau, hoehe = 74, markiere }) {
  const max = Math.max(1, ...daten.map((d) => d.n));
  const w = 100 / daten.length;
  return (
    <svg viewBox={`0 0 100 ${hoehe / 2}`} preserveAspectRatio="none" role="img" aria-label={`Wochenverlauf: ${daten.map((d) => d.n).join(", ")}`} style={{ width: "100%", height: hoehe, display: "block" }}>
      {daten.map((d, i) => {
        const h = d.n ? Math.max(3, (d.n / max) * (hoehe / 2 - 4)) : 1.2;
        const trainiert = markiere && markiere.includes(d.woche);
        return <rect key={i} x={i * w + w * 0.14} y={hoehe / 2 - h} width={w * 0.72} height={h} rx={1.2} fill={d.n ? farbe : "rgba(255,255,255,0.14)"} opacity={trainiert ? 1 : 0.95}
          stroke={trainiert ? L.orange : "none"} strokeWidth={trainiert ? 0.8 : 0} vectorEffect="non-scaling-stroke" />;
      })}
    </svg>
  );
}

/* Globale Stile des Labs (Fokus, Animationen, reduzierte Bewegung) */
export function PerfStyles() {
  return (
    <style>{`
      .perf-lab *:focus-visible { outline: 2px solid ${L.tuerkis}; outline-offset: 2px; }
      .perf-feld:focus { border-color: ${L.tuerkis} !important; box-shadow: 0 0 0 3px ${L.tuerkis}33; }
      .perf-knopf:not(:disabled):hover { filter: brightness(1.08); transform: translateY(-1px); }
      .perf-knopf, .perf-taste { transition: transform .15s ease, filter .15s ease, background .15s ease; }
      .perf-taste:not(:disabled):active { transform: scale(0.94); background: rgba(39,211,195,0.2) !important; }
      .perf-tabs { scrollbar-width: none; -webkit-overflow-scrolling: touch; }
      .perf-tabs::-webkit-scrollbar { display: none; }
      .perf-raster { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); }
      .perf-erfolg { animation: perfPop .6s cubic-bezier(.2,1.4,.4,1) both; }
      .perf-glanz { animation: perfGlanz 2.4s ease-in-out infinite; }
      .perf-rein { animation: perfRein .35s ease both; }
      .perf-konfetti { position: absolute; width: 8px; height: 14px; border-radius: 2px; opacity: 0; animation: perfKonfetti 1.8s ease-out forwards; }
      @keyframes perfPop { 0% { transform: scale(.6); opacity: 0; } 60% { transform: scale(1.08); opacity: 1; } 100% { transform: scale(1); } }
      @keyframes perfGlanz { 0%,100% { box-shadow: 0 0 0 0 rgba(155,123,255,.0), 0 0 24px rgba(155,123,255,.35); } 50% { box-shadow: 0 0 0 10px rgba(155,123,255,.0), 0 0 46px rgba(255,159,67,.55); } }
      @keyframes perfRein { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
      @keyframes perfKonfetti { 0% { opacity: 1; transform: translateY(0) rotate(0); } 100% { opacity: 0; transform: translateY(190px) translateX(var(--dx)) rotate(540deg); } }
      @media (prefers-reduced-motion: reduce) {
        .perf-erfolg, .perf-glanz, .perf-rein, .perf-konfetti { animation: none !important; opacity: 1; }
        .perf-knopf, .perf-taste { transition: none; }
      }
    `}</style>
  );
}

/* Dezentes Konfetti für Erfolge (wird bei reduzierter Bewegung ausgeblendet) */
export function Konfetti() {
  const farben = [L.orange, L.violett, L.tuerkis, L.blau, L.gold];
  return (
    <div aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, top: 0, height: 0, pointerEvents: "none" }}>
      {Array.from({ length: 22 }, (_, i) => (
        <span key={i} className="perf-konfetti" style={{ left: `${(i * 37) % 100}%`, background: farben[i % farben.length], animationDelay: `${(i % 7) * 0.07}s`, "--dx": `${((i % 5) - 2) * 18}px` }} />
      ))}
    </div>
  );
}
