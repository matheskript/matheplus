/* ======================================================================
   geoUi.jsx – gemeinsame Bausteine der Mittelstufen-Geometrie
   (Satz des Pythagoras, Satz des Thales, Kongruenzsätze, Bruchrechnen):
   · Regler      – Schieberegler mit +/− im Stil der Strahlensätze
   · Zeichenblatt – SVG, das eine Liste von Punkten (Mathe-Koordinaten,
                    y nach oben) automatisch einpasst und Hilfsfunktionen
                    für Linien, Punkte, Maße, Winkelbögen und rechte
                    Winkel bereitstellt
   Keine base-Datei darf diese Datei importieren.
   ====================================================================== */

import React from "react";
import { C } from "./base1.jsx";
import { zt } from "./ui3.jsx";

export const SCHRIFT = "Montserrat, system-ui, sans-serif";

/* ---------- Regler ---------- */
export function Regler({ name, wert, setWert, min, max, schritt, farbe = C.see, format = (v) => zt(v, 1), breiteName = 44 }) {
  const setze = (v) => setWert(Math.round(Math.max(min, Math.min(max, v)) * 1000) / 1000);
  const knopf = (d, z) => {
    const aus = (d < 0 && wert <= min + 1e-9) || (d > 0 && wert >= max - 1e-9);
    return (
      <button type="button" aria-label={`${name} ${d > 0 ? "+" : "−"}`} onClick={() => setze(wert + d * schritt)} disabled={aus}
        style={{ width: 38, height: 30, borderRadius: 9, border: `1.5px solid ${farbe}66`, background: `${farbe}14`, color: farbe, fontSize: 18, fontWeight: 800,
          fontFamily: "inherit", cursor: "pointer", padding: 0, lineHeight: 1, touchAction: "manipulation", opacity: aus ? 0.35 : 1 }}>{z}</button>
    );
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: 14, fontWeight: 800, color: farbe, minWidth: breiteName }}>{name}</span>
      <input type="range" min={min} max={max} step={schritt} value={wert} onChange={(e) => setze(Number(e.target.value))} aria-label={name}
        style={{ flex: 1, minWidth: 0, accentColor: farbe }} />
      <span style={{ fontSize: 15, fontWeight: 800, color: C.tinte, minWidth: 46, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{format(wert)}</span>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>{knopf(1, "+")}{knopf(-1, "−")}</div>
    </div>
  );
}

/* ---------- Geometrie-Helfer ---------- */
export const sub = (p, q) => [p[0] - q[0], p[1] - q[1]];
export const add = (p, q) => [p[0] + q[0], p[1] + q[1]];
export const mal = (p, k) => [p[0] * k, p[1] * k];
export const laenge = (p) => Math.hypot(p[0], p[1]);
export const einheit = (p) => mal(p, 1 / (laenge(p) || 1));
export const mitte = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
export const polar = (r, grad) => [r * Math.cos((grad * Math.PI) / 180), r * Math.sin((grad * Math.PI) / 180)];
/* Winkel (Grad) zwischen den Strahlen S→P und S→Q */
export function winkelAn(S, P, Q) {
  const u = sub(P, S), v = sub(Q, S);
  const c = (u[0] * v[0] + u[1] * v[1]) / ((laenge(u) * laenge(v)) || 1);
  return (Math.acos(Math.max(-1, Math.min(1, c))) * 180) / Math.PI;
}

/* ---------- Zeichenblatt ----------
   punkte: alle Punkte, die sichtbar sein müssen (Mathe-Koordinaten).
   kinder(z): Funktion, die mit dem Zeichen-Werkzeug z die SVG-Elemente liefert. */
export function Zeichenblatt({ punkte, breite = 340, hoehe = 240, rand = 34, label, kinder }) {
  const xs = punkte.map((p) => p[0]), ys = punkte.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const s = Math.min((breite - 2 * rand) / Math.max(x1 - x0, 0.01), (hoehe - 2 * rand) / Math.max(y1 - y0, 0.01));
  const ox = rand + ((breite - 2 * rand) - (x1 - x0) * s) / 2 - x0 * s;
  const oy = rand + ((hoehe - 2 * rand) - (y1 - y0) * s) / 2 + y1 * s;
  const P = (p) => [ox + p[0] * s, oy - p[1] * s];
  const z = {
    s, P,
    linie: (p, q, farbe = C.tinte, b = 2, strich, key) => {
      const [a, c] = [P(p), P(q)];
      return <line key={key} x1={a[0]} y1={a[1]} x2={c[0]} y2={c[1]} stroke={farbe} strokeWidth={b} strokeLinecap="round" strokeDasharray={strich} />;
    },
    vieleck: (pts, fill, stroke = "none", b = 1.5, key) => (
      <polygon key={key} points={pts.map((p) => P(p).join(",")).join(" ")} fill={fill} stroke={stroke} strokeWidth={b} strokeLinejoin="round" />
    ),
    kreis: (m, r, stroke = C.see, b = 1.6, fill = "none", strich, key) => {
      const [a, c] = P(m);
      return <circle key={key} cx={a} cy={c} r={r * s} stroke={stroke} strokeWidth={b} fill={fill} strokeDasharray={strich} />;
    },
    punkt: (p, name, dx = 0, dy = -10, farbe = C.tinte, r = 3.6, key) => {
      const [a, c] = P(p);
      return (
        <g key={key}>
          <circle cx={a} cy={c} r={r} fill={farbe} />
          {name && <text x={a + dx} y={c + dy} textAnchor="middle" style={{ fontSize: 13, fontWeight: 700, fill: farbe, fontFamily: SCHRIFT }}>{name}</text>}
        </g>
      );
    },
    text: (p, t, farbe = C.tinte, groesse = 12.5, anker = "middle", gewicht = 700, key) => {
      const [a, c] = P(p);
      return <text key={key} x={a} y={c} textAnchor={anker} dominantBaseline="middle" style={{ fontSize: groesse, fontWeight: gewicht, fill: farbe, fontFamily: SCHRIFT }}>{t}</text>;
    },
    /* Beschriftung einer Strecke als Pille; seite = ±1 bestimmt die Seite, gesucht = gold */
    mass: (p, q, t, seite = 1, farbe = C.see, abstand = 14, key) => {
      if (t == null) return null;
      const [a, c] = [P(p), P(q)];
      const mx = (a[0] + c[0]) / 2, my = (a[1] + c[1]) / 2;
      const len = Math.hypot(c[0] - a[0], c[1] - a[1]) || 1;
      const nx = (-(c[1] - a[1]) / len) * seite * abstand, ny = ((c[0] - a[0]) / len) * seite * abstand;
      const gs = t === "?";
      const w = gs ? 22 : String(t).length * 7.4 + 12;
      return (
        <g key={key}>
          <rect x={mx + nx - w / 2} y={my + ny - 10} width={w} height="19" rx="9.5" fill={gs ? C.flaggold : C.weiss} stroke={gs ? C.flaggold : `${farbe}66`} />
          <text x={mx + nx} y={my + ny + 4.5} textAnchor="middle" style={{ fontSize: 12, fontWeight: 800, fill: gs ? C.seeTief : farbe, fontFamily: SCHRIFT }}>{t}</text>
        </g>
      );
    },
    /* Winkelbogen bei S zwischen S→P und S→Q (kleiner Winkel), mit Beschriftung */
    bogen: (S, p, q, t, farbe = C.flaggold, r = 22, key) => {
      const [sx, sy] = P(S);
      const u = einheit(sub(P(p), [sx, sy])), v = einheit(sub(P(q), [sx, sy]));
      const a1 = Math.atan2(u[1], u[0]), a2 = Math.atan2(v[1], v[0]);
      let d = a2 - a1; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
      const e1 = [sx + r * Math.cos(a1), sy + r * Math.sin(a1)], e2 = [sx + r * Math.cos(a1 + d), sy + r * Math.sin(a1 + d)];
      const am = a1 + d / 2, rt = r + 13;
      return (
        <g key={key}>
          <path d={`M ${sx} ${sy} L ${e1[0]} ${e1[1]} A ${r} ${r} 0 0 ${d > 0 ? 1 : 0} ${e2[0]} ${e2[1]} Z`} fill={`${farbe}2E`} stroke={farbe} strokeWidth="1.4" />
          {t && <text x={sx + rt * Math.cos(am)} y={sy + rt * Math.sin(am) + 4} textAnchor="middle" style={{ fontSize: 11.5, fontWeight: 800, fill: farbe === C.flaggold ? "#8A6A00" : farbe, fontFamily: SCHRIFT }}>{t}</text>}
        </g>
      );
    },
    /* Rechter Winkel bei S (Quadrat mit Punkt) */
    rechter: (S, p, q, farbe = C.tinte, g = 12, key) => {
      const [sx, sy] = P(S);
      const u = einheit(sub(P(p), [sx, sy])), v = einheit(sub(P(q), [sx, sy]));
      const a = [sx + u[0] * g, sy + u[1] * g], b = [sx + (u[0] + v[0]) * g, sy + (u[1] + v[1]) * g], c = [sx + v[0] * g, sy + v[1] * g];
      const m = [sx + (u[0] + v[0]) * g * 0.5, sy + (u[1] + v[1]) * g * 0.5];
      return (
        <g key={key}>
          <path d={`M ${a[0]} ${a[1]} L ${b[0]} ${b[1]} L ${c[0]} ${c[1]}`} fill="none" stroke={farbe} strokeWidth="1.3" />
          <circle cx={m[0]} cy={m[1]} r="1.6" fill={farbe} />
        </g>
      );
    },
  };
  return (
    <svg viewBox={`0 0 ${breite} ${hoehe}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label={label}>
      {kinder(z)}
    </svg>
  );
}

/* Kleine Kennzahl-Zeile: links Text/Formel, rechts Wert */
export function WertZeile({ links, rechts, farbe = C.see, blass = false }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "7px 0", borderBottom: `1px solid ${C.linie}` }}>
      <span style={{ fontSize: 14.5, color: blass ? C.hellgrau : C.tinte }}>{links}</span>
      <span style={{ fontSize: 15, fontWeight: 800, color: blass ? C.hellgrau : farbe, fontVariantNumeric: "tabular-nums", textAlign: "right" }}>{rechts}</span>
    </div>
  );
}

/* Auffälliger Merksatz unter einer Grafik */
export function Merke({ children, farbe = C.see }) {
  return (
    <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 12, background: `${farbe}10`, borderLeft: `4px solid ${farbe}`, fontSize: 13.5, lineHeight: 1.6, color: C.tinte }}>
      {children}
    </div>
  );
}
