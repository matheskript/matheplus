/* ======================================================================
   FORMELSAMMLUNG · Bausteine für die Illustrationen
   Koordinatensystem, Graphen, Regler, Umschalter, Ziehen mit Finger/Maus.
   Alle Bilder sind SVG, skalieren auf die Kartenbreite und funktionieren
   ohne Ziehen auch über die Regler (Tastatur, Screenreader).
   ====================================================================== */
import React, { useCallback, useRef } from "react";
import { C } from "./base1.jsx";

export const F = {
  blau: "#D6E4F7", blauMittel: "#A9C4EC", gold: "#FFF1BF", gold2: "#FBE08A", rosa: "#F7D3E0",
  rosaKraeftig: "#C2557A", gruen: "#DDF0E4", gruenKraeftig: "#2F8F5B", gitter: "#EEF2F8", achse: "#A3ACC2",
  see: C.see, gold3: C.gruen, tinte: C.tinte, grau: C.grau, lila: "#7B4FA0", orange: C.signal,
};

export const svgStil = { width: "100%", maxWidth: 440, display: "block", margin: "0 auto", touchAction: "none", userSelect: "none" };

const zahl = (v) => (Math.abs(v) < 1e-9 ? "0" : String(Math.round(v * 100) / 100).replace(".", ",").replace("-", "−"));
export const z = zahl;

/* Koordinaten: Umrechnung Mathe ↔ SVG */
export function koord({ x0, x1, y0, y1, w = 340, h = 230, rand = 14 }) {
  const px = (x) => rand + ((x - x0) / (x1 - x0)) * (w - 2 * rand);
  const py = (y) => h - rand - ((y - y0) / (y1 - y0)) * (h - 2 * rand);
  const ix = (sx) => x0 + ((sx - rand) / (w - 2 * rand)) * (x1 - x0);
  const iy = (sy) => y0 + ((h - rand - sy) / (h - 2 * rand)) * (y1 - y0);
  /* Graph als Pfad; Sprünge und Werte weit außerhalb unterbrechen die Linie */
  const kurve = (fn, a = x0, b = x1, n = 260) => {
    let d = "", offen = false;
    const grenze = (y1 - y0) * 3;
    for (let i = 0; i <= n; i++) {
      const x = a + ((b - a) * i) / n, y = fn(x);
      if (!isFinite(y) || y > y1 + grenze || y < y0 - grenze) { offen = false; continue; }
      d += `${offen ? "L" : "M"}${px(x).toFixed(1)} ${py(Math.max(y0 - grenze, Math.min(y1 + grenze, y))).toFixed(1)} `;
      offen = true;
    }
    return d;
  };
  /* Fläche zwischen fn und gn (Standard: x-Achse) */
  const flaeche = (fn, a, b, gn = () => 0, n = 160) => {
    let d = "";
    for (let i = 0; i <= n; i++) { const x = a + ((b - a) * i) / n; d += `${i ? "L" : "M"}${px(x).toFixed(1)} ${py(fn(x)).toFixed(1)} `; }
    for (let i = n; i >= 0; i--) { const x = a + ((b - a) * i) / n; d += `L${px(x).toFixed(1)} ${py(gn(x)).toFixed(1)} `; }
    return d + "Z";
  };
  return { x0, x1, y0, y1, w, h, rand, px, py, ix, iy, kurve, flaeche };
}

/* Gitter, Achsen, Striche */
export function Achsen({ k, schritt = 1, ySchritt, beschriften = true, xName = "x", yName = "y", ohneGitter = false }) {
  const ys = ySchritt || schritt;
  const linien = [];
  const xs = [], yv = [];
  for (let x = Math.ceil(k.x0 / schritt) * schritt; x <= k.x1 + 1e-9; x += schritt) xs.push(Math.round(x * 1e6) / 1e6);
  for (let y = Math.ceil(k.y0 / ys) * ys; y <= k.y1 + 1e-9; y += ys) yv.push(Math.round(y * 1e6) / 1e6);
  if (!ohneGitter) {
    xs.forEach((x) => linien.push(<line key={"gx" + x} x1={k.px(x)} x2={k.px(x)} y1={k.py(k.y0)} y2={k.py(k.y1)} stroke={F.gitter} strokeWidth="1" />));
    yv.forEach((y) => linien.push(<line key={"gy" + y} x1={k.px(k.x0)} x2={k.px(k.x1)} y1={k.py(y)} y2={k.py(y)} stroke={F.gitter} strokeWidth="1" />));
  }
  const ax = k.y0 <= 0 && k.y1 >= 0 ? k.py(0) : k.py(k.y0);
  const ay = k.x0 <= 0 && k.x1 >= 0 ? k.px(0) : k.px(k.x0);
  return (
    <g aria-hidden="true">
      {linien}
      <line x1={k.px(k.x0) - 4} x2={k.px(k.x1) + 6} y1={ax} y2={ax} stroke={F.achse} strokeWidth="1.3" />
      <line x1={ay} x2={ay} y1={k.py(k.y0) + 4} y2={k.py(k.y1) - 6} stroke={F.achse} strokeWidth="1.3" />
      <path d={`M${k.px(k.x1) + 6} ${ax} l-6 -3.5 v7 z`} fill={F.achse} />
      <path d={`M${ay} ${k.py(k.y1) - 6} l-3.5 6 h7 z`} fill={F.achse} />
      {beschriften && xs.filter((x) => x !== 0 && Math.abs(k.px(x) - k.px(k.x1)) > 10).map((x) => (
        <text key={"tx" + x} x={k.px(x)} y={ax + 13} textAnchor="middle" fontSize="9.5" fill={F.achse}>{zahl(x)}</text>
      ))}
      {beschriften && yv.filter((y) => y !== 0 && Math.abs(k.py(y) - k.py(k.y1)) > 10).map((y) => (
        <text key={"ty" + y} x={ay - 5} y={k.py(y) + 3.5} textAnchor="end" fontSize="9.5" fill={F.achse}>{zahl(y)}</text>
      ))}
      <text x={k.px(k.x1) + 4} y={ax - 7} textAnchor="end" fontSize="11" fontStyle="italic" fill={F.grau}>{xName}</text>
      <text x={ay + 7} y={k.py(k.y1) + 2} fontSize="11" fontStyle="italic" fill={F.grau}>{yName}</text>
    </g>
  );
}

export const Punkt = ({ x, y, farbe = F.see, r = 4.5, ring = false }) => (
  <circle cx={x} cy={y} r={r} fill={ring ? C.weiss : farbe} stroke={ring ? farbe : C.weiss} strokeWidth={ring ? 2.2 : 1.6} />
);

/* Ziehpunkt: großer unsichtbarer Griff für Finger */
export const Griff = ({ x, y, farbe = F.see, aktiv }) => (
  <g style={{ cursor: "grab" }}>
    <circle cx={x} cy={y} r="18" fill={farbe} opacity={aktiv ? 0.16 : 0.08} />
    <circle cx={x} cy={y} r="6.5" fill={farbe} stroke={C.weiss} strokeWidth="2" />
  </g>
);

export const Txt = ({ x, y, children, farbe = F.tinte, gr = 12, anker = "middle", fett = true, kursiv = false }) => (
  <text x={x} y={y} textAnchor={anker} fontSize={gr} fontWeight={fett ? 700 : 500} fontStyle={kursiv ? "italic" : "normal"} fill={farbe}
    style={{ paintOrder: "stroke", stroke: "rgba(255,255,255,0.85)", strokeWidth: 3, strokeLinejoin: "round" }}>{children}</text>
);

export const Pfeil = ({ x1, y1, x2, y2, farbe = F.see, breite = 2.4, spitze = 9, gestrichelt }) => {
  const w = Math.atan2(y2 - y1, x2 - x1), l = Math.hypot(x2 - x1, y2 - y1);
  const s = Math.min(spitze, l * 0.45);
  const bx = x2 - Math.cos(w) * s * 0.8, by = y2 - Math.sin(w) * s * 0.8;
  const p1 = [x2 - Math.cos(w - 0.42) * s, y2 - Math.sin(w - 0.42) * s], p2 = [x2 - Math.cos(w + 0.42) * s, y2 - Math.sin(w + 0.42) * s];
  return (
    <g>
      <line x1={x1} y1={y1} x2={bx} y2={by} stroke={farbe} strokeWidth={breite} strokeLinecap="round" strokeDasharray={gestrichelt ? "5 4" : undefined} />
      {l > 2 && <path d={`M${x2} ${y2} L${p1[0]} ${p1[1]} L${p2[0]} ${p2[1]} Z`} fill={farbe} />}
    </g>
  );
};

/* Rechter-Winkel-Markierung an Ecke (x,y) zwischen den Richtungen u und v (Einheitsvektoren in SVG) */
export const RechterWinkel = ({ x, y, u, v, g = 10, farbe = F.tinte }) => (
  <path d={`M${x + u[0] * g} ${y + u[1] * g} L${x + u[0] * g + v[0] * g} ${y + u[1] * g + v[1] * g} L${x + v[0] * g} ${y + v[1] * g}`}
    fill="none" stroke={farbe} strokeWidth="1.3" />
);

/* Winkelbogen um (x,y) von Richtung w1 bis w2 (Bogenmaß, SVG-Orientierung) */
export function Bogen({ x, y, r = 22, w1, w2, farbe = F.gold3, fuellen = true }) {
  let d = w2 - w1;
  const gross = Math.abs(d) > Math.PI ? 1 : 0;
  const a = [x + r * Math.cos(w1), y + r * Math.sin(w1)], b = [x + r * Math.cos(w2), y + r * Math.sin(w2)];
  return (
    <path d={`M${x} ${y} L${a[0]} ${a[1]} A${r} ${r} 0 ${gross} ${d > 0 ? 1 : 0} ${b[0]} ${b[1]} Z`}
      fill={fuellen ? farbe : "none"} fillOpacity={fuellen ? 0.22 : 1} stroke={farbe} strokeWidth="1.5" />
  );
}

/* Ziehen auf einem SVG: liefert Handler, die SVG-Koordinaten melden */
export function useZiehen(onZiehen) {
  const ref = useRef(null);
  const aktiv = useRef(false);
  const punkt = (ev) => {
    const svg = ref.current;
    if (!svg) return null;
    const r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal;
    return [((ev.clientX - r.left) / r.width) * vb.width, ((ev.clientY - r.top) / r.height) * vb.height];
  };
  const runter = useCallback((ev) => {
    const p = punkt(ev); if (!p) return;
    const ok = onZiehen(p, true);
    if (ok === false) return;
    aktiv.current = true;
    try { ev.currentTarget.setPointerCapture(ev.pointerId); } catch (e) { /* egal */ }
  }, [onZiehen]);
  const bewegen = useCallback((ev) => { if (!aktiv.current) return; const p = punkt(ev); if (p) onZiehen(p, false); }, [onZiehen]);
  const hoch = useCallback(() => { aktiv.current = false; }, []);
  return { ref, onPointerDown: runter, onPointerMove: bewegen, onPointerUp: hoch, onPointerCancel: hoch };
}

/* ---------- Bedienelemente ---------- */

export function Regler({ label, wert, setze, min, max, schritt = 0.01, anzeige }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6, fontSize: 13, fontWeight: 600, color: C.grau }}>
      <span style={{ minWidth: 0, flex: "0 1 auto", whiteSpace: "nowrap" }}>{label}</span>
      <input type="range" min={min} max={max} step={schritt} value={wert} onChange={(e) => setze(Number(e.target.value))} aria-label={label}
        style={{ flex: 1, minWidth: 60, accentColor: C.see, height: 34 }} />
      {anzeige !== undefined && <b data-kein-i18n style={{ color: C.tinte, minWidth: 44, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{anzeige}</b>}
    </label>
  );
}

export function Umschalter({ optionen, wert, setze, label }) {
  return (
    <div role="group" aria-label={label} style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
      {optionen.map(([w, text]) => {
        const an = w === wert;
        return (
          <button key={String(w)} type="button" aria-pressed={an} onClick={() => setze(w)}
            style={{ flex: "1 1 auto", minHeight: 36, padding: "6px 12px", borderRadius: 10, fontFamily: "inherit", fontSize: 12.5, fontWeight: 700, cursor: "pointer",
              border: `1.5px solid ${an ? C.see : C.linie}`, background: an ? C.see : C.weiss, color: an ? C.weiss : C.see }}>{text}</button>
        );
      })}
    </div>
  );
}

/* Kleine Infozeile unter dem Bild (Formel mit eingesetzten Werten) */
export function Messzeile({ children }) {
  return (
    <div style={{ background: C.sand, borderRadius: 12, padding: "9px 13px", marginTop: 10, fontSize: 14, lineHeight: 1.75, color: C.tinte, overflowX: "auto" }}>
      {children}
    </div>
  );
}

export const Hinweis = ({ children }) => (
  <p style={{ fontSize: 12.5, fontWeight: 600, color: C.see, margin: "0 0 8px", lineHeight: 1.5 }}>{children}</p>
);

/* Zahl im Bereich halten */
export const klemm = (v, a, b) => Math.max(a, Math.min(b, v));

/* Regel A5 – nichts Unvereinfachtes anzeigen: Summe aus [Koeffizient, Variablenteil].
   Nullen fallen weg, Koeffizient 1 wird nicht geschrieben, Vorzeichen korrekt. */
export function summe(terme) {
  let s = "";
  for (const [k, v = ""] of terme) {
    if (Math.abs(k) < 1e-9) continue;
    const b = Math.abs(k);
    const kt = v && Math.abs(b - 1) < 1e-9 ? "" : z(b);
    const t = `${kt}${v}`;
    s = s ? `${s} ${k < 0 ? "-" : "+"} ${t}` : `${k < 0 ? "-" : ""}${t}`;
  }
  return s || "0";
}
/* Faktor vor einem Ausdruck: 1 → "", −1 → "-", sonst Zahl mit Malpunkt */
export const faktor = (k, rest) => (Math.abs(k - 1) < 1e-9 ? rest : Math.abs(k + 1) < 1e-9 ? `-${rest}` : `${z(k)} \\cdot ${rest}`);
/* (x − c) mit richtigem Vorzeichen, c = 0 → x */
export const xMinus = (c, x = "x") => (Math.abs(c) < 1e-9 ? x : `${x} ${c < 0 ? "+" : "-"} ${z(Math.abs(c))}`);
