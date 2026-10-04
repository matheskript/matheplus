/* ======================================================================
   ui2.jsx – gemeinsame Oberflächenbausteine der Etappe-2-Werkzeuge:
   Sprachhelfer, Karten-Stile, Eingabefelder, Auswahl-Knöpfe, Schaubild.
   Keine base-Datei darf diese Datei importieren.
   ====================================================================== */
import React, { useId } from "react";
import { C } from "./base1.jsx";
import { englisch } from "./i18n.js";
import { M } from "./func3.jsx";
import { pNum, qTex } from "./rechnen2.js";

const EN = englisch();
export const zw = (de, en) => (EN ? en : de);

export const karte = { background: C.weiss, borderRadius: 16, padding: 18, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" };
export const kicker = { fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.gruenDunkel, marginBottom: 8 };
export const hinweis = { fontSize: 13.5, color: C.grau, lineHeight: 1.6, marginBottom: 12 };
export const zeileStil = { display: "flex", alignItems: "center", gap: 6, fontSize: 18, lineHeight: 2, whiteSpace: "nowrap", color: C.tinte, overflowX: "auto" };

/* Eingabefeld für ganze Zahlen, Brüche (7/3) und Dezimalzahlen (2,5) */
export function ZahlFeld({ wert, setWert, label, breite = 92, platzhalter = "", onEnter, farbe = C.see }) {
  return (
    <input value={wert} aria-label={label} placeholder={platzhalter} inputMode="text" autoCapitalize="off" autoCorrect="off" spellCheck="false"
      onChange={(e) => setWert(e.target.value.replace(/[^0-9\-−,./ ]/g, "").slice(0, 14))}
      onFocus={(e) => e.target.select()}
      onKeyDown={(e) => { if (e.key === "Enter" && onEnter) onEnter(); }}
      style={{ width: breite, height: 42, textAlign: "center", fontSize: 16, fontWeight: 700, fontFamily: "inherit", color: farbe, boxSizing: "border-box",
        border: `1.5px solid ${farbe}66`, borderRadius: 11, background: `${farbe}0D`, outline: "none" }} />
  );
}

/* Freies Textfeld (Listen, Terme) */
export function TextFeld({ wert, setWert, label, platzhalter = "", breite = "100%", onEnter }) {
  return (
    <input value={wert} aria-label={label} placeholder={platzhalter} autoCapitalize="off" autoCorrect="off" spellCheck="false"
      onChange={(e) => setWert(e.target.value.slice(0, 80))}
      onKeyDown={(e) => { if (e.key === "Enter" && onEnter) onEnter(); }}
      style={{ width: breite, height: 44, boxSizing: "border-box", padding: "0 12px", fontSize: 16, fontFamily: "ui-monospace, Menlo, monospace", color: C.tinte,
        border: `1.5px solid ${C.linie}`, borderRadius: 11, background: C.weiss, outline: "none" }} />
  );
}

/* Auswahl aus wenigen Möglichkeiten (Knopfreihe) */
export function Auswahl({ optionen, wert, setWert, label, status }) {
  return (
    <div role="group" aria-label={label} style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {optionen.map(([id, text]) => {
        const an = wert === id;
        const farbe = status && an ? (status === "gut" ? C.smaragd : status === "schlecht" ? C.signal : C.see) : C.see;
        return (
          <button key={id} type="button" aria-pressed={an} onClick={() => setWert(id)}
            style={{ minHeight: 44, padding: "8px 14px", borderRadius: 999, fontFamily: "inherit", cursor: "pointer", fontSize: 14, fontWeight: 700,
              border: `1.5px solid ${an ? farbe : C.linie}`, background: an ? farbe : C.weiss, color: an ? C.weiss : C.see }}>
            {text}
          </button>
        );
      })}
    </div>
  );
}

/* Plus-/Minus-Knöpfe für einen ganzzahligen Wert */
export function Stufe({ wert, setWert, min, max, label, text }) {
  const knopf = (d, z) => (
    <button type="button" aria-label={`${label} ${d > 0 ? "+1" : "−1"}`} onClick={() => setWert(Math.max(min, Math.min(max, wert + d)))}
      disabled={(d < 0 && wert <= min) || (d > 0 && wert >= max)}
      style={{ width: 38, height: 38, borderRadius: 11, border: `1.5px solid ${C.linie}`, background: C.weiss, color: C.see, fontSize: 20, fontWeight: 700,
        fontFamily: "inherit", cursor: "pointer", opacity: (d < 0 && wert <= min) || (d > 0 && wert >= max) ? 0.35 : 1 }}>{z}</button>
  );
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 15, fontWeight: 700, color: C.tinte, minWidth: 14 }}>{text}</span>
      {knopf(-1, "−")}
      <span style={{ minWidth: 30, textAlign: "center", fontSize: 18, fontWeight: 800, color: C.see }}>{String(wert).replace("-", "−")}</span>
      {knopf(1, "+")}
    </div>
  );
}

/* Rückmeldung unter einer Eingabe */
export function Rueck({ art, children }) {
  if (!children) return null;
  const f = { gut: ["#E6F6EF", "#0F7A4D"], schlecht: ["#FCE8EE", C.gruenDunkel], info: [C.himmel, C.see], warn: ["#FFF4D6", "#7A5A00"] }[art || "info"];
  return (
    <div role={art === "schlecht" || art === "warn" ? "alert" : "status"}
      style={{ background: f[0], color: f[1], borderRadius: 12, padding: "9px 12px", fontSize: 13.5, lineHeight: 1.55, fontWeight: 500, marginTop: 8 }}>{children}</div>
  );
}

export function GrosserKnopf({ children, onClick, gold, ghost, disabled }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      style={{ width: "100%", minHeight: 48, borderRadius: 12, fontFamily: "inherit", cursor: disabled ? "default" : "pointer", fontSize: 15.5, fontWeight: 800, marginTop: 12,
        border: ghost ? `1.5px solid ${C.linie}` : "none", opacity: disabled ? 0.45 : 1,
        background: ghost ? C.weiss : gold ? C.flaggold : C.smaragd, color: ghost ? C.see : gold ? C.seeTief : C.weiss,
        boxShadow: ghost ? "none" : gold ? "0 4px 14px rgba(237,187,0,0.3)" : "0 4px 14px rgba(47,143,91,0.3)" }}>{children}</button>
  );
}

export function KleinerLink({ children, onClick }) {
  return <button type="button" onClick={onClick} style={{ background: "none", border: "none", color: C.see, fontSize: 13, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", padding: "6px 0" }}>{children}</button>;
}

/* ---------- Schaubild für Polynome ---------- */
const nice = (lo, hi) => {
  const rng = hi - lo || 1;
  const roh = rng / 6, mag = 10 ** Math.floor(Math.log10(roh));
  const s = [1, 2, 5, 10].map((m) => m * mag).find((x) => x >= roh) || mag * 10;
  const t = [];
  for (let v = Math.ceil(lo / s) * s; v <= hi + 1e-9; v += s) t.push(Math.round(v / s) * s);
  return t;
};

/* kurven: [{ p, farbe, name }]  flaechen: [{ f, g?, a, b, farbe }]  balken: [{ x0, x1, h }]  punkte: [{ x, y, farbe, name }] */
export function Schaubild({ kurven = [], flaechen = [], balken = [], punkte = [], senkrechte = [], x0 = -4, x1 = 4, hoehe = 220, yMin, yMax, einheitX = "", einheitY = "", yBereichX }) {
  const W = 360, H = hoehe, L = 34, R = 10, T = 12, B = 22;
  const N = 140;
  let lo = Infinity, hi = -Infinity;
  [...kurven.map((k) => k.p), ...flaechen.flatMap((f) => [f.f, f.g].filter(Boolean))].forEach((p) => {
    const [xa, xb] = yBereichX || [x0, x1];
    for (let i = 0; i <= N; i++) { const y = pNum(p, xa + ((xb - xa) * i) / N); if (isFinite(y)) { lo = Math.min(lo, y); hi = Math.max(hi, y); } }
  });
  punkte.forEach((p) => { lo = Math.min(lo, p.y); hi = Math.max(hi, p.y); });
  if (!isFinite(lo)) { lo = -1; hi = 1; }
  lo = Math.min(lo, 0); hi = Math.max(hi, 0);
  const pad = (hi - lo || 2) * 0.12; lo -= pad; hi += pad;
  if (yMin !== undefined) lo = yMin;
  if (yMax !== undefined) hi = yMax;
  const klemme = (y) => Math.max(lo - (hi - lo), Math.min(hi + (hi - lo), y));
  const sx = (x) => L + ((x - x0) / (x1 - x0)) * (W - L - R);
  const sy = (y) => T + ((hi - y) / (hi - lo)) * (H - T - B);
  const pfad = (p, a = x0, b = x1) => {
    let d = "";
    for (let i = 0; i <= N; i++) { const x = a + ((b - a) * i) / N; d += `${i ? "L" : "M"}${sx(x).toFixed(1)},${sy(klemme(pNum(p, x))).toFixed(1)}`; }
    return d;
  };
  const flaechenPfad = (f) => {
    const g = f.g || [{ z: 0, n: 1 }];
    let d = "";
    for (let i = 0; i <= N; i++) { const x = f.a + ((f.b - f.a) * i) / N; d += `${i ? "L" : "M"}${sx(x).toFixed(1)},${sy(pNum(f.f, x)).toFixed(1)}`; }
    for (let i = N; i >= 0; i--) { const x = f.a + ((f.b - f.a) * i) / N; d += `L${sx(x).toFixed(1)},${sy(pNum(g, x)).toFixed(1)}`; }
    return d + "Z";
  };
  const xt = nice(x0, x1), yt = nice(lo, hi);
  const klipp = useId().replace(/:/g, "k");
  const nullY = sy(0), nullX = sx(0);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Schaubild" style={{ width: "100%", display: "block", background: C.weiss, borderRadius: 14, border: `1px solid ${C.linie}` }}>
      <defs><clipPath id={klipp}><rect x={L} y={T} width={W - L - R} height={H - T - B} /></clipPath></defs>
      {xt.map((v) => <line key={`gx${v}`} x1={sx(v)} x2={sx(v)} y1={T} y2={H - B} stroke="#E6EAF2" strokeWidth="1" />)}
      {yt.map((v) => <line key={`gy${v}`} y1={sy(v)} y2={sy(v)} x1={L} x2={W - R} stroke="#E6EAF2" strokeWidth="1" />)}
      {flaechen.map((f, i) => <path key={`f${i}`} d={flaechenPfad(f)} fill={f.farbe} fillOpacity="0.38" stroke="none" />)}
      {balken.map((b, i) => {
        const ya = sy(0), yb = sy(b.h);
        return <rect key={`b${i}`} x={sx(b.x0)} y={Math.min(ya, yb)} width={Math.max(0, sx(b.x1) - sx(b.x0))} height={Math.abs(ya - yb)} fill={C.flaggold} fillOpacity="0.35" stroke={C.goldWarm || C.flaggold} strokeWidth="1" />;
      })}
      <line x1={L} x2={W - R} y1={nullY} y2={nullY} stroke={C.tinte} strokeWidth="1.4" />
      <line x1={nullX} x2={nullX} y1={T} y2={H - B} stroke={C.tinte} strokeWidth="1.4" />
      {xt.map((v) => v !== 0 && <text key={`tx${v}`} x={sx(v)} y={Math.min(H - B + 14, nullY + 14)} fontSize="10.5" textAnchor="middle" fill={C.grau}>{String(v).replace("-", "−")}</text>)}
      {yt.map((v) => v !== 0 && <text key={`ty${v}`} x={L - 5} y={sy(v) + 3.5} fontSize="10.5" textAnchor="end" fill={C.grau}>{String(v).replace("-", "−")}</text>)}
      {einheitX && <text x={W - R} y={H - 4} fontSize="10.5" textAnchor="end" fill={C.grau}>{einheitX}</text>}
      {einheitY && <text x={L + 4} y={T + 8} fontSize="10.5" fill={C.grau}>{einheitY}</text>}
      {senkrechte.map((s, i) => <line key={`s${i}`} x1={sx(s.x)} x2={sx(s.x)} y1={T} y2={H - B} stroke={s.farbe || C.tinte} strokeWidth="1.6" strokeDasharray="4 3" />)}
      <g clipPath={`url(#${klipp})`}>
        {kurven.map((k, i) => <path key={`k${i}`} d={pfad(k.p)} fill="none" stroke={k.farbe || C.see} strokeWidth="2.4" strokeLinejoin="round" />)}
      </g>
      {punkte.map((p, i) => (
        <g key={`p${i}`}>
          <circle cx={sx(p.x)} cy={sy(p.y)} r="4.5" fill={p.farbe || C.tinte} stroke="#fff" strokeWidth="1.5" />
          {p.name && <text x={sx(p.x) + 7} y={sy(p.y) - 6} fontSize="11.5" fontWeight="700" fill={p.farbe || C.tinte}>{p.name}</text>}
        </g>
      ))}
      {kurven.map((k, i) => k.name && <text key={`n${i}`} x={W - R - 4} y={T + 12 + i * 14} fontSize="12" fontWeight="700" textAnchor="end" fill={k.farbe || C.see}>{k.name}</text>)}
    </svg>
  );
}

/* Kontext für das gemeinsame Hilfepanel „Ich hänge fest“ (funcHilfe.jsx) */
export function hilfeKontext({ id, aufgabe, verstehen, ansatz, regel, pruefen, regeln = [], grundlage = null, loesung = null }) {
  return { id, aufgabe, hilfen: { verstehen, ansatz, regel, pruefen }, regeln, grundlage, loesung };
}

/* Integralzeichen mit Grenzen (wie in der Integrale-Seite) */
export function IntZ({ a, b, gross }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 1, verticalAlign: "middle" }}>
      <span style={{ fontSize: gross ? "2.1em" : "1.7em", fontWeight: 300, lineHeight: 1, transform: "translateY(-0.04em)" }}>∫</span>
      <span style={{ display: "inline-flex", flexDirection: "column", justifyContent: "space-between", fontSize: "0.62em", lineHeight: 1.05, alignSelf: "stretch", padding: "0.1em 0" }}>
        <span>{b}</span><span>{a}</span>
      </span>
    </span>
  );
}
const grenze = (x) => <M t={typeof x === "object" ? qTex(x) : String(x).replace("-", "−")} />;
/* ∫ₐᵇ inner dx rechts – a und b als Bruch oder Zahl */
export function IZ({ a, b, inner = "f(x)", dx = "dx", rechts = "" }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      <IntZ a={grenze(a)} b={grenze(b)} />
      <M t={`${inner}\\,${dx} ${rechts}`} />
    </span>
  );
}
