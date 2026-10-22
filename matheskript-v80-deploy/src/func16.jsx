/* ============================================================
   Vektoren-Bereich
   - EbenenVisualizer: Ebene E: a·x₁ + b·x₂ + c·x₃ = d live im
     3D-Koordinatensystem (drehbar), Koeffizienten per Plus/Minus
     von −10 bis +10 – das Pendant zum Polynomplotter.
   - VektorenZentrum: Übersichtsseite (wie Analysis)
   - VektorenLogoKlein: Grafik für die Startseiten-Kachel
   Eigene 3D-Projektion in SVG (orthografisch), keine Bibliothek.
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useMemo, useRef, useState } from "react";
import { uebergabeErledigt, uebergabeLesen } from "./uebergabe.js";
import { WeiterKnopf, WeiterMit, ZentrumListe } from "./funcWerkzeuge.jsx";
import { C } from "./base1.jsx";
import { GesperrteKurse } from "./func1.jsx";
import { M } from "./func3.jsx";
import { BUEHNE, BUEHNE_SVG, BuehneKlappe, FallWahl, ObjektBox, ReglerSpalten, Tafel, VekArbeit, VekBild, VekSeite, farbSatz } from "./vekUi.jsx";
import { FeinKarte, Werkzeugleiste, useDesktop } from "./arbeitsflaeche.jsx";

/* ---------- Zahlen und Brüche ---------- */

const ggT = (a, b) => (b ? ggT(b, a % b) : Math.abs(a));
/* gekürzter Bruch als Formel: echter Bruch (\\frac), nie „3/2“ */
function bruch(z, n) {
  if (n === 0) return null;
  const g = ggT(z, n) || 1;
  let a = z / g, b = n / g;
  if (b < 0) { a = -a; b = -b; }
  return b === 1 ? `${a}`.replace("-", "−") : `${a < 0 ? "−" : ""}\\frac{${Math.abs(a)}}{${b}}`;
}
const dez = (v) => (Math.round(v * 100) / 100).toString().replace(".", ",").replace("-", "−");

/* „3x₁ − 2x₂ + x₃ = 6“ */
export function ebenenText(a, b, c, d) {
  const teile = [];
  [[a, "x₁"], [b, "x₂"], [c, "x₃"]].forEach(([k, x]) => {
    if (k === 0) return;
    const betrag = Math.abs(k) === 1 ? "" : Math.abs(k);
    if (!teile.length) teile.push(`${k < 0 ? "−" : ""}${betrag}${x}`);
    else teile.push(`${k < 0 ? "−" : "+"} ${betrag}${x}`);
  });
  return `${teile.length ? teile.join(" ") : "0"} = ${String(d).replace("-", "−")}`;
}

/* ---------- 3D-Projektion ---------- */

export function kamera(phi, theta) {
  const cp = Math.cos(phi), sp = Math.sin(phi), ct = Math.cos(theta), st = Math.sin(theta);
  return {
    // Bildschirm: u nach rechts, v nach oben; t = Tiefe zum Betrachter
    proj: ([x1, x2, x3]) => {
      const u = -x1 * sp + x2 * cp;
      const w = x1 * cp + x2 * sp;
      return { u, v: x3 * ct - w * st, t: w * ct + x3 * st };
    },
    blick: [cp * ct, sp * ct, st], // Richtung zum Betrachter (Weltkoordinaten)
  };
}

/* Schnittpolygon der Ebene mit dem Würfel [−L, L]³ */
export function ebenenPolygon(n, d, L) {
  const ecken = [];
  for (const x of [-L, L]) for (const y of [-L, L]) for (const z of [-L, L]) ecken.push([x, y, z]);
  const kanten = [];
  for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) {
    const diff = ecken[i].filter((v, k) => v !== ecken[j][k]).length;
    if (diff === 1) kanten.push([ecken[i], ecken[j]]);
  }
  const f = (p) => n[0] * p[0] + n[1] * p[1] + n[2] * p[2] - d;
  const pts = [];
  kanten.forEach(([p, q]) => {
    const fp = f(p), fq = f(q);
    if (Math.abs(fp) < 1e-9) pts.push(p);
    if (fp * fq < 0) {
      const t = fp / (fp - fq);
      pts.push(p.map((v, k) => v + t * (q[k] - v)));
    }
  });
  // Doppelte entfernen
  const uniq = [];
  pts.forEach((p) => { if (!uniq.some((q) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]) < 1e-7)) uniq.push(p); });
  if (uniq.length < 3) return [];
  // Nach Winkel in der Ebene sortieren
  const m = [0, 1, 2].map((k) => uniq.reduce((s, p) => s + p[k], 0) / uniq.length);
  const nl = Math.hypot(...n);
  const nn = n.map((v) => v / nl);
  const hilf = Math.abs(nn[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
  const e1 = [nn[1] * hilf[2] - nn[2] * hilf[1], nn[2] * hilf[0] - nn[0] * hilf[2], nn[0] * hilf[1] - nn[1] * hilf[0]];
  const l1 = Math.hypot(...e1); e1.forEach((_, k) => (e1[k] /= l1));
  const e2 = [nn[1] * e1[2] - nn[2] * e1[1], nn[2] * e1[0] - nn[0] * e1[2], nn[0] * e1[1] - nn[1] * e1[0]];
  return uniq.map((p) => {
    const r = p.map((v, k) => v - m[k]);
    return { p, w: Math.atan2(r[0] * e2[0] + r[1] * e2[1] + r[2] * e2[2], r[0] * e1[0] + r[1] * e1[1] + r[2] * e1[2]) };
  }).sort((x, y) => x.w - y.w).map((x) => x.p);
}

/* Strecke der Ebene innerhalb einer Koordinatenebene (Spurgerade) im Würfel */
function spurStrecke(n, d, achse, L) {
  // Koordinatenebene: x_achse = 0 → Restgleichung in den anderen beiden Koordinaten
  const [i, j] = [0, 1, 2].filter((k) => k !== achse);
  const a = n[i], b = n[j];
  if (Math.abs(a) < 1e-12 && Math.abs(b) < 1e-12) return null;
  const pts = [];
  const mach = (vi, vj) => { const p = [0, 0, 0]; p[i] = vi; p[j] = vj; return p; };
  if (Math.abs(b) > 1e-12) for (const vi of [-L, L]) { const vj = (d - a * vi) / b; if (Math.abs(vj) <= L + 1e-9) pts.push(mach(vi, vj)); }
  if (Math.abs(a) > 1e-12) for (const vj of [-L, L]) { const vi = (d - b * vj) / a; if (Math.abs(vi) <= L + 1e-9) pts.push(mach(vi, vj)); }
  const uniq = [];
  pts.forEach((p) => { if (!uniq.some((q) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]) < 1e-7)) uniq.push(p); });
  return uniq.length >= 2 ? [uniq[0], uniq[1]] : null;
}

/* ---------- 3D-Ansicht ---------- */

export const FARBE_ACHSE = { 0: "#C99A00", 1: "#B98A00", 2: "#004D98" };

/* ---------- Grundebenen (x₁-x₂, x₂-x₃, x₁-x₃) als Gitter ----------
   Drei unabhängige Schalter; jede Grundebene wird als Gitter aus ihren beiden Koordinatenachsen gezeichnet.
   Farbe = Farbe der Achse, die senkrecht auf der Grundebene steht (x₁-x₂-Ebene ⟂ x₃ → blau). */
export const GRUNDEBENEN = [
  { id: "x12", name: "x₁-x₂-Ebene", achsen: [0, 1], senkrecht: 2 },
  { id: "x23", name: "x₂-x₃-Ebene", achsen: [1, 2], senkrecht: 0 },
  { id: "x13", name: "x₁-x₃-Ebene", achsen: [0, 2], senkrecht: 1 },
];
export const GRUND_AUS = { x12: false, x23: false, x13: false };

export function GrundebenenGitter({ an, P, L }) {
  if (!an || !GRUNDEBENEN.some((g) => an[g.id])) return null;
  const schritt = L > 8 ? 2 : 1;
  const werte = [];
  for (let t = -L + (L % schritt); t <= L + 1e-9; t += schritt) werte.push(t);
  return (
    <g pointerEvents="none">
      {GRUNDEBENEN.filter((g) => an[g.id]).map((g) => {
        const [i, j] = g.achsen, farbe = FARBE_ACHSE[g.senkrecht];
        const pt = (a, b) => { const p = [0, 0, 0]; p[i] = a; p[j] = b; return P(p); };
        const ecken = [pt(-L, -L), pt(L, -L), pt(L, L), pt(-L, L)];
        const [lx, ly] = pt(L * 0.92, L * 0.92);
        return (
          <g key={g.id}>
            <path d={ecken.map(([x, y], k) => `${k ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ") + " Z"} fill={farbe} fillOpacity="0.06" stroke={farbe} strokeOpacity="0.45" strokeWidth="1" />
            {werte.map((t) => {
              const [a1, b1] = pt(t, -L), [a2, b2] = pt(t, L), [c1, d1] = pt(-L, t), [c2, d2] = pt(L, t);
              return (
                <g key={t}>
                  <line x1={a1} y1={b1} x2={a2} y2={b2} stroke={farbe} strokeOpacity={t === 0 ? 0 : 0.22} strokeWidth="0.8" />
                  <line x1={c1} y1={d1} x2={c2} y2={d2} stroke={farbe} strokeOpacity={t === 0 ? 0 : 0.22} strokeWidth="0.8" />
                </g>
              );
            })}
            <text x={lx} y={ly} textAnchor="middle" fontSize="10.5" fontWeight="700" fill={farbe} fillOpacity="0.85">{g.name.replace("-Ebene", "")}</text>
          </g>
        );
      })}
    </g>
  );
}

/* Kompakte Schalter unter dem 3D-Bild: „Grundebenen  x₁x₂  x₂x₃  x₁x₃“ (eine Zeile, auch bei 360 px);
   ohneTitel: Beschriftung steht schon als Kicker darüber (Desktop-Werkzeugleiste) */
export function GrundebenenSchalter({ an, setAn, ohneTitel = false }) {
  return (
    <div role="group" aria-label="Grundebenen anzeigen" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
      {!ohneTitel && <span style={{ fontSize: 12.5, fontWeight: 600, color: C.grau, marginRight: 2 }}>Grundebenen</span>}
      {GRUNDEBENEN.map((g) => {
        const aktiv = !!an[g.id], farbe = FARBE_ACHSE[g.senkrecht];
        return (
          <button key={g.id} type="button" aria-pressed={aktiv} aria-label={g.name} title={g.name} onClick={() => setAn({ ...an, [g.id]: !aktiv })}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 10px", height: 30, borderRadius: 999,
              border: `1.5px solid ${aktiv ? farbe : C.linie}`, background: aktiv ? `${farbe}14` : C.weiss,
              color: aktiv ? C.tinte : C.grau, fontSize: 12.5, fontWeight: aktiv ? 700 : 600, fontFamily: "inherit", cursor: "pointer", whiteSpace: "nowrap" }}>
            <span aria-hidden="true" style={{ width: 11, height: 9, borderRadius: 2, border: `1.5px solid ${farbe}`, transform: "skewX(-24deg)",
              background: aktiv ? `${farbe}66` : "transparent" }} />{g.name.replace("-Ebene", "").replace("-", "")}
          </button>
        );
      })}
    </div>
  );
}

/* W, H: Handy wie bisher 360 × 320; Desktop in echten Pixeln (gemessene Breite, quadratisch) */
function Raum({ a, b, c, d, phi, theta, setPhi, setTheta, zeigen, zoom = 1, grund, W = 360, H = 320 }) {
  const gross = W > 400;
  const n = [a, b, c];
  const nLen = Math.hypot(a, b, c);
  // Würfelgröße: alle Spurpunkte sollen sichtbar sein
  const abschnitte = [a, b, c].filter((k) => k !== 0).map((k) => Math.abs(d / k));
  const L = Math.min(12, Math.max(5, Math.ceil(Math.max(0, ...abschnitte) + 1)));
  const s = ((Math.min(W, H) / 2 - 18) / (L * 1.55)) * zoom;
  const cam = kamera(phi, theta);
  const P = (p) => { const q = cam.proj(p); return [W / 2 + s * q.u, H / 2 - s * q.v]; };
  const pfad = (pts) => pts.map((p, k) => `${k ? "L" : "M"}${P(p)[0].toFixed(1)},${P(p)[1].toFixed(1)}`).join(" ") + " Z";

  const poly = nLen > 0 ? ebenenPolygon(n, d, L) : [];
  const betrachterSeite = Math.sign(a * cam.blick[0] + b * cam.blick[1] + c * cam.blick[2]);
  const vorn = (p) => nLen > 0 && Math.sign(a * p[0] + b * p[1] + c * p[2] - d) === betrachterSeite;

  // Achsen in Teilstücke vor / hinter der Ebene zerlegen
  const achsen = [0, 1, 2].map((k) => {
    const e = (t) => { const p = [0, 0, 0]; p[k] = t; return p; };
    const grenzen = [-L, L * 1.12];
    if (n[k] !== 0) { const t0 = d / n[k]; if (t0 > -L && t0 < L * 1.12) grenzen.splice(1, 0, t0); }
    const stuecke = [];
    for (let z = 0; z < grenzen.length - 1; z++) {
      const t1 = grenzen[z], t2 = grenzen[z + 1];
      stuecke.push({ von: e(t1), bis: e(t2), vorn: vorn(e((t1 + t2) / 2)) });
    }
    return { k, stuecke, spitze: e(L * 1.12), label: e(L * 1.24) };
  });

  // Würfelkanten
  const kanten = [];
  if (zeigen.box) {
    const ecken = [];
    for (const x of [-L, L]) for (const y of [-L, L]) for (const z of [-L, L]) ecken.push([x, y, z]);
    for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++)
      if (ecken[i].filter((v, k) => v !== ecken[j][k]).length === 1) kanten.push([ecken[i], ecken[j]]);
  }

  // Spurpunkte
  const spurpunkte = [0, 1, 2].filter((k) => n[k] !== 0 && Math.abs(d / n[k]) <= L).map((k) => {
    const p = [0, 0, 0]; p[k] = d / n[k]; return { k, p };
  });
  const spurgeraden = zeigen.spur && nLen > 0 ? [0, 1, 2].map((k) => spurStrecke(n, d, k, L)).filter(Boolean) : [];

  // Normalenvektor ab dem Lotfußpunkt
  let normale = null;
  if (zeigen.normale && nLen > 0) {
    const fuss = n.map((v) => (d * v) / (nLen * nLen));
    const len = L * 0.45;
    const spitze = fuss.map((v, k) => v + (n[k] / nLen) * len * betrachterSeite);
    if (fuss.every((v) => Math.abs(v) <= L)) normale = { fuss, spitze };
  }

  // Ticks
  const ticks = [];
  const schritt = L > 8 ? 2 : 1;
  for (let k = 0; k < 3; k++) for (let t = -L + (L % schritt); t <= L; t += schritt) {
    if (t === 0) continue;
    const p = [0, 0, 0]; p[k] = t; ticks.push({ k, t, p });
  }

  // Maus / Finger: Drehen
  const ziehen = useRef(null);
  const start = (e) => { ziehen.current = { x: e.clientX, y: e.clientY, phi, theta }; e.currentTarget.setPointerCapture?.(e.pointerId); };
  const bewege = (e) => {
    if (!ziehen.current) return;
    const dx = e.clientX - ziehen.current.x, dy = e.clientY - ziehen.current.y;
    setPhi(ziehen.current.phi - dx * 0.01);
    setTheta(Math.max(-1.35, Math.min(1.35, ziehen.current.theta + dy * 0.01)));
  };
  const ende = () => { ziehen.current = null; };

  const achsLinie = (st, i, k) => {
    const [x1, y1] = P(st.von), [x2, y2] = P(st.bis);
    return <line key={`${k}-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={FARBE_ACHSE[k]} strokeWidth="2" strokeLinecap="round" />;
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={gross ? { ...BUEHNE_SVG, maxWidth: "none" } : BUEHNE_SVG}
      onPointerDown={start} onPointerMove={bewege} onPointerUp={ende} onPointerLeave={ende}>
      <defs>
        {[0, 1, 2].map((k) => (
          <marker key={k} id={`pfeil${k}`} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill={FARBE_ACHSE[k]} />
          </marker>
        ))}
        <marker id="pfeilN" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={C.smaragd} />
        </marker>
      </defs>
      <GrundebenenGitter an={grund} P={P} L={L} />

      {/* Würfel */}
      {kanten.map(([p, q], i) => { const [x1, y1] = P(p), [x2, y2] = P(q);
        return <line key={`b${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.linie} strokeWidth="1" strokeDasharray="3 4" />; })}

      {/* Achsen hinter der Ebene */}
      {achsen.map((a0) => a0.stuecke.filter((st) => !st.vorn).map((st, i) => achsLinie(st, i, a0.k)))}

      {/* Ebene */}
      {poly.length >= 3 && (
        <path d={pfad(poly)} fill={C.see} fillOpacity="0.16" stroke={C.see} strokeOpacity="0.6" strokeWidth="1.3" strokeLinejoin="round" />
      )}

      {/* Spurdreieck (wenn alle drei Spurpunkte existieren) */}
      {spurpunkte.length === 3 && d !== 0 && (
        <path d={pfad(spurpunkte.map((x) => x.p))} fill={C.see} fillOpacity="0.32" stroke={C.seeTief} strokeWidth="1.8" strokeLinejoin="round" />
      )}

      {/* Achsen vor der Ebene (verdecken die Ebene) */}
      {achsen.map((a0) => a0.stuecke.filter((st) => st.vorn).map((st, i) => achsLinie(st, i, a0.k)))}
      {achsen.map((a0) => {
        const [x1, y1] = P(a0.stuecke[a0.stuecke.length - 1].von), [x2, y2] = P(a0.spitze), [lx, ly] = P(a0.label);
        return (
          <g key={`s${a0.k}`}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={FARBE_ACHSE[a0.k]} strokeWidth="2" markerEnd={`url(#pfeil${a0.k})`} />
            <text x={lx} y={ly + 4} textAnchor="middle" fontSize={gross ? 14.5 : 13} fontWeight="700" fontStyle="italic" fill={FARBE_ACHSE[a0.k]}>
              x{["₁", "₂", "₃"][a0.k]}
            </text>
          </g>
        );
      })}
      {ticks.map(({ k, t, p }, i) => {
        const [x, y] = P(p);
        return (
          <g key={`t${i}`}>
            <circle cx={x} cy={y} r="1.6" fill={FARBE_ACHSE[k]} opacity="0.7" />
            {Math.abs(t) % (schritt * 2) === 0 && <text x={x + 5} y={y - 4} fontSize={gross ? 9.5 : 8.5} fill={C.hellgrau}>{t}</text>}
          </g>
        );
      })}

      {/* Spurgeraden */}
      {spurgeraden.map(([p, q], i) => { const [x1, y1] = P(p), [x2, y2] = P(q);
        return <line key={`sp${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.flaggold} strokeWidth="2.2" strokeLinecap="round" />; })}

      {/* Normalenvektor */}
      {normale && (() => { const [x1, y1] = P(normale.fuss), [x2, y2] = P(normale.spitze);
        return (
          <g>
            <circle cx={x1} cy={y1} r="3" fill={C.smaragd} />
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.smaragd} strokeWidth="2.6" markerEnd="url(#pfeilN)" />
            <text x={x2 + 6} y={y2 - 4} fontSize={gross ? 13.5 : 12} fontWeight="700" fontStyle="italic" fill={C.smaragd}>n</text>
          </g>
        ); })()}

      {/* Spurpunkte */}
      {spurpunkte.map(({ k, p }) => { const [x, y] = P(p);
        return (
          <g key={`S${k}`}>
            <circle cx={x} cy={y} r="5" fill={C.gruen} stroke={C.weiss} strokeWidth="1.8" />
            <text x={x + 8} y={y + 14} fontSize={gross ? 13 : 11.5} fontWeight="700" fill={C.gruen}>S{["₁", "₂", "₃"][k]}</text>
          </g>
        ); })}

      {/* Ursprung */}
      {(() => { const [x, y] = P([0, 0, 0]); return <circle cx={x} cy={y} r="2.6" fill={C.tinte} />; })()}
    </svg>
  );
}

/* ---------- Eigenschaften ---------- */

function Eigenschaften({ a, b, c, d }) {
  const n = [a, b, c], nLen = Math.hypot(a, b, c);
  const idx = ["₁", "₂", "₃"];
  if (nLen === 0) {
    return (
      <p style={{ fontSize: 14, color: C.signal, lineHeight: 1.6 }}>
        {d === 0 ? "0 = 0 gilt für jeden Punkt – das ist keine Ebene, sondern der ganze Raum." : `0 = ${d} ist nie erfüllt – es gibt keine Ebene. Mindestens ein Koeffizient a, b oder c muss ungleich 0 sein.`}
      </p>
    );
  }
  const zeilen = [];
  zeilen.push(["Normalenvektor", `n = (${a} | ${b} | ${c})`.replace(/-/g, "−")]);
  const sp = [0, 1, 2].map((k) => {
    if (n[k] !== 0) { const p = ["0", "0", "0"]; p[k] = bruch(d, n[k]); return `S${idx[k]}(${p.join(" | ")})`; }
    return d === 0 ? `x${idx[k]}-Achse liegt in E` : `kein S${idx[k]} – E ∥ x${idx[k]}-Achse`;
  });
  zeilen.push(["Spurpunkte", sp]);
  if (a && b && c && d) {
    zeilen.push(["Achsenabschnittsform", `\\frac{x₁}{${bruch(d, a)}} + \\frac{x₂}{${bruch(d, b)}} + \\frac{x₃}{${bruch(d, c)}} = 1`]);
  }
  const abst = Math.abs(d) / nLen;
  const q = a * a + b * b + c * c;
  const wurzel = Number.isInteger(Math.sqrt(q)) ? `${Math.sqrt(q)}` : `\\sqrt{${q}}`;
  zeilen.push(["Abstand zum Ursprung", `\\frac{|d|}{|n|} = \\frac{${Math.abs(d)}}{${wurzel}} ≈ ${dez(abst)}`]);
  const winkel = (Math.acos(Math.abs(c) / nLen) * 180) / Math.PI;
  zeilen.push(["Winkel zur x₁x₂-Ebene", `≈ ${dez(winkel)}°`]);

  // Besondere Lage
  const null0 = [0, 1, 2].filter((k) => n[k] === 0);
  const lage = [];
  if (d === 0) lage.push("E geht durch den Ursprung.");
  if (null0.length === 2) {
    const k = [0, 1, 2].find((x) => n[x] !== 0);
    const andere = [0, 1, 2].filter((x) => x !== k).map((x) => `x${idx[x]}`).join("");
    lage.push(d === 0 ? `E ist die ${andere}-Ebene selbst.` : `E ist parallel zur ${andere}-Ebene (senkrecht zur x${idx[k]}-Achse).`);
  } else if (null0.length === 1) {
    lage.push(d === 0 ? `E enthält die x${idx[null0[0]]}-Achse.` : `E ist parallel zur x${idx[null0[0]]}-Achse.`);
  } else if (d !== 0) lage.push("E schneidet alle drei Achsen – das Spurdreieck ist sichtbar.");

  return (
    <div>
      {zeilen.map(([t, w]) => (
        <div key={t} style={{ display: "flex", flexWrap: "wrap", gap: "2px 10px", padding: "9px 0", borderBottom: `1px solid ${C.linie}` }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: C.grau, minWidth: 150 }}>{t}</span>
          <span style={{ fontSize: 14.5, fontWeight: 600, color: C.tinte, fontVariantNumeric: "tabular-nums" }}>
            {Array.isArray(w) ? w.map((z) => <span key={z} style={{ display: "block" }}><M t={z} /></span>) : <M t={w} />}
          </span>
        </div>
      ))}
      {lage.length > 0 && (
        <div style={{ marginTop: 12, borderLeft: `4px solid ${C.flaggold}`, background: "#FFF9E5", borderRadius: "0 12px 12px 0", padding: "10px 14px" }}>
          <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#8A6D00", marginBottom: 4 }}>Besondere Lage</p>
          {lage.map((l) => <p key={l} style={{ fontSize: 14, color: C.tinte, lineHeight: 1.55 }}>{l}</p>)}
        </div>
      )}
    </div>
  );
}

/* ---------- Bedienelemente ---------- */

/* Ebenengleichung groß über die ganze Breite; jeder Koeffizient in seiner Farbe,
   direkt darunter + und − übereinander in derselben Farbe. */
function GleichungMitReglern({ a, b, c, d, setA, setB, setC, setD }) {
  const minus = "−";
  const term = (k, x, erster) => {
    const betrag = Math.abs(k);
    const zahl = betrag === 1 ? "" : betrag;
    if (erster) return `${k < 0 ? minus : ""}${zahl}${x}`;
    return `${zahl}${x}`;
  };
  const op = (k) => (k < 0 ? minus : "+");
  const spalten = [
    { art: "text", inhalt: "E:" },
    { art: "term", inhalt: term(a, "x₁", true), wert: a, setzen: setA, farbe: FARBE_ACHSE[0], name: "a" },
    { art: "op", inhalt: op(b) },
    { art: "term", inhalt: term(b, "x₂", false), wert: b, setzen: setB, farbe: FARBE_ACHSE[1], name: "b" },
    { art: "op", inhalt: op(c) },
    { art: "term", inhalt: term(c, "x₃", false), wert: c, setzen: setC, farbe: FARBE_ACHSE[2], name: "c" },
    { art: "op", inhalt: "=" },
    { art: "term", inhalt: String(d).replace("-", minus), wert: d, setzen: setD, farbe: C.smaragd, name: "d" },
  ];
  const knopf = (farbe) => ({
    width: "100%", maxWidth: 52, height: 30, borderRadius: 9, border: `1.5px solid ${farbe}66`, background: `${farbe}14`,
    color: farbe, fontSize: 19, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", padding: 0, lineHeight: 1,
    display: "flex", alignItems: "center", justifyContent: "center",
  });
  return (
    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto 1fr auto 1fr auto 1fr", columnGap: 4, rowGap: 8,
      alignItems: "center", justifyItems: "center", marginBottom: 14 }}>
      {spalten.map((sp, i) => (
        <span key={`g${i}`} style={{ fontSize: "clamp(22px, 6.6vw, 44px)", fontWeight: 800, letterSpacing: "-0.02em",
          whiteSpace: "nowrap", lineHeight: 1.1, fontVariantNumeric: "tabular-nums",
          color: sp.art === "term" ? (sp.wert === 0 ? `${sp.farbe}66` : sp.farbe) : C.tinte }}>
          {sp.art === "term" && sp.wert === 0 && sp.name !== "d" ? `0${sp.inhalt}` : sp.inhalt}
        </span>
      ))}
      {spalten.map((sp, i) => sp.art === "term" ? (
        <div key={`r${i}`} style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%", alignItems: "center" }}>
          <button aria-label={`${sp.name} erhöhen`} style={knopf(sp.farbe)} onClick={() => sp.setzen(Math.min(10, sp.wert + 1))}>+</button>
          <button aria-label={`${sp.name} verringern`} style={knopf(sp.farbe)} onClick={() => sp.setzen(Math.max(-10, sp.wert - 1))}>−</button>
        </div>
      ) : <span key={`r${i}`} />)}
    </div>
  );
}

/* Desktop: die Ebene als Box wie in „Ebene vs. Ebene“ – oben die Gleichung, darunter je Koeffizient
   + / Wert / − untereinander (ReglerSpalten aus vekUi). Gleiche aria-labels wie GleichungMitReglern. */
function EbeneBoxBreit({ a, b, c, d, setA, setB, setC, setD }) {
  const spalten = [
    { name: "a", wert: a, setzen: setA, farbe: FARBE_ACHSE[0] },
    { name: "b", wert: b, setzen: setB, farbe: FARBE_ACHSE[1] },
    { name: "c", wert: c, setzen: setC, farbe: FARBE_ACHSE[2] },
    { name: "d", wert: d, setzen: setD, farbe: C.smaragd },
  ];
  const text = ebenenText(a, b, c, d);
  const gr = Math.max(13, Math.min(20, Math.floor((330 / (text.length + 3)) * 10) / 10));
  return (
    <ObjektBox farbe={C.see} name="E" art="Ebene in Koordinatenform" innen="12px 12px 14px">
      <p data-ebene-gleichung="" style={{ fontSize: gr, fontWeight: 800, color: C.tinte, textAlign: "center", whiteSpace: "nowrap", lineHeight: 1.3, margin: "2px 0 0", fontVariantNumeric: "tabular-nums" }}>{text}</p>
      <div style={{ height: 1, background: farbSatz(C.see).rand, margin: "12px 2px" }} />
      <ReglerSpalten spalten={spalten.map((sp) => ({
        key: sp.name, farbe: sp.farbe,
        plus: () => sp.setzen(Math.min(10, sp.wert + 1)), minus: () => sp.setzen(Math.max(-10, sp.wert - 1)),
        plusLabel: `${sp.name} erhöhen`, minusLabel: `${sp.name} verringern`,
        mitte: <span style={{ fontSize: String(sp.wert).length >= 3 ? 14 : 15.5, fontWeight: 800, color: sp.farbe, fontVariantNumeric: "tabular-nums", lineHeight: 1.2, whiteSpace: "nowrap" }}>{sp.name} = {String(sp.wert).replace("-", "−")}</span>,
      }))} />
    </ObjektBox>
  );
}

/* Drehknöpfe rund um das Schaubild; Gedrückthalten dreht weiter. */
export function DrehKnoepfe({ setPhi, setTheta, zuruecksetzen }) {
  const timer = React.useRef(null);
  const SCHRITT = Math.PI / 24; // 7,5°
  const drehe = (dp, dt) => {
    setPhi((p) => p + dp);
    setTheta((t) => Math.max(-1.35, Math.min(1.35, t + dt)));
  };
  const start = (dp, dt) => (e) => {
    e.preventDefault(); e.stopPropagation();
    drehe(dp, dt);
    clearInterval(timer.current);
    timer.current = setInterval(() => drehe(dp / 2, dt / 2), 60);
  };
  const stopp = () => clearInterval(timer.current);
  React.useEffect(() => () => clearInterval(timer.current), []);
  const knopf = (richtung, stil, dp, dt, titel) => (
    <button aria-label={titel} title={titel}
      onPointerDown={start(dp, dt)} onPointerUp={stopp} onPointerLeave={stopp} onPointerCancel={stopp}
      style={{ position: "absolute", width: 32, height: 32, borderRadius: 999, border: `1px solid ${C.linie}`,
        background: "rgba(255,255,255,0.9)", color: C.see, cursor: "pointer", padding: 0,
        display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(15,26,51,0.12)",
        touchAction: "none", userSelect: "none", ...stil }}>
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" style={{ transform: `rotate(${richtung}deg)` }}>
        <path d="M6 3.5 L10.5 8 L6 12.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
  return (
    <>
      {knopf(180, { left: 6, top: "50%", transform: "translateY(-50%)" }, SCHRITT, 0, "Nach links drehen")}
      {knopf(0, { right: 6, top: "50%", transform: "translateY(-50%)" }, -SCHRITT, 0, "Nach rechts drehen")}
      {knopf(-90, { top: 6, left: "50%", transform: "translateX(-50%)" }, 0, SCHRITT, "Nach oben kippen")}
      {knopf(90, { bottom: 6, left: "50%", transform: "translateX(-50%)" }, 0, -SCHRITT, "Nach unten kippen")}
      <button aria-label="Ansicht zurücksetzen" title="Ansicht zurücksetzen" onClick={zuruecksetzen}
        style={{ position: "absolute", left: 6, bottom: 6, height: 30, padding: "0 10px 0 8px", borderRadius: 999, display: "flex", alignItems: "center", gap: 5,
          border: `1px solid ${C.linie}`, background: "rgba(255,255,255,0.9)", color: C.see, fontSize: 12, fontWeight: 700,
          fontFamily: "inherit", cursor: "pointer", boxShadow: "0 2px 8px rgba(15,26,51,0.12)" }}>
        <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><path d="M3.2 8a4.8 4.8 0 1 0 1.5-3.5M3 2.4v2.8h2.8" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>
        Zurück
      </button>
    </>
  );
}

/* ---------- Ebenen-Visualizer ---------- */

const BEISPIELE = [
  { name: "Spurdreieck", k: [3, 2, 1, 6] },
  { name: "Durch den Ursprung", k: [1, -1, 2, 0] },
  { name: "∥ x₁x₂-Ebene", k: [0, 0, 1, 3] },
  { name: "∥ x₃-Achse", k: [1, 1, 0, 4] },
  { name: "Steil", k: [5, 1, 1, 5] },
];

export function EbenenVisualizer() {
  // Übergabe (z. B. aus „Drei Punkte – eine Ebene“): { k: [a, b, c, d] }
  const [mit] = useState(() => { const u = uebergabeLesen("ebenen"); return u && Array.isArray(u.k) && u.k.length === 4 && u.k.every((v) => Number.isInteger(v) && Math.abs(v) <= 10) ? u.k : null; });
  React.useEffect(() => { uebergabeErledigt("ebenen"); }, []);
  const [a, setA] = useState(mit ? mit[0] : 3);
  const [b, setB] = useState(mit ? mit[1] : 2);
  const [c, setC] = useState(mit ? mit[2] : 1);
  const [d, setD] = useState(mit ? mit[3] : 6);
  const [phi, setPhi] = useState(0.62);
  const [theta, setTheta] = useState(0.42);
  const [zoom, setZoom] = useState(1);
  const [zeigen, setZeigen] = useState({ spur: true, normale: true, box: false });
  const [grund, setGrund] = useState(GRUND_AUS);
  const setze = ([x, y, z, w]) => { setA(x); setB(y); setC(z); setD(w); };
  const zufall = () => {
    const r = () => Math.floor(Math.random() * 11) - 5;
    let k = [r(), r(), r()];
    while (k.every((v) => v === 0)) k = [r(), r(), r()];
    setze([...k, Math.floor(Math.random() * 21) - 10]);
  };
  const chip = (an, randFarbe) => ({ display: "flex", alignItems: "center", gap: 6, height: 30, padding: "0 10px", borderRadius: 999, whiteSpace: "nowrap",
    border: `1.5px solid ${an ? randFarbe : C.linie}`, background: an ? `${randFarbe}14` : C.weiss, color: an ? C.tinte : C.grau,
    fontSize: 12.5, fontWeight: an ? 700 : 600, fontFamily: "inherit", cursor: "pointer" });
  const schalter = (schl, label, farbe) => (
    <button key={schl} type="button" aria-pressed={!!zeigen[schl]} onClick={() => setZeigen({ ...zeigen, [schl]: !zeigen[schl] })} style={chip(zeigen[schl], farbe)}>
      <span style={{ width: 14, height: 3, borderRadius: 2, background: farbe, opacity: zeigen[schl] ? 1 : 0.35 }} />{label}
    </button>
  );
  const ANSICHTEN = [["Schräg", 0.62, 0.42], ["Von vorn", 0.0001, 0.0001], ["Von oben", 0.62, 1.34], ["Von der Seite", 1.5707, 0.0001]];
  const ansichtAn = ANSICHTEN.find(([, p, t]) => Math.abs(p - phi) < 1e-3 && Math.abs(t - theta) < 1e-3);
  const beispiel = BEISPIELE.find((x) => x.k.join() === [a, b, c, d].join());
  const zeileTitel = { fontSize: 12.5, fontWeight: 600, color: C.grau, marginRight: 2 };
  const desktop = useDesktop();

  const zoomKnoepfe = (
    <div style={{ position: "absolute", right: 6, bottom: 6, display: "flex", flexDirection: "column", borderRadius: 10,
      overflow: "hidden", border: `1px solid ${C.linie}`, boxShadow: "0 2px 8px rgba(15,26,51,0.12)" }}>
      {[["+", 1.25, "Hineinzoomen"], ["−", 1 / 1.25, "Herauszoomen"]].map(([z, f, t], i) => (
        <button key={z} aria-label={t} title={t} onClick={() => setZoom((v) => Math.min(4, Math.max(0.4, v * f)))}
          style={{ width: 32, height: 30, border: "none", borderTop: i ? `1px solid ${C.linie}` : "none",
            background: "rgba(255,255,255,0.95)", color: C.see, fontSize: 18, fontWeight: 700, fontFamily: "inherit",
            cursor: "pointer", padding: 0 }}>{z}</button>
      ))}
    </div>
  );
  const bild = (W, H) => (
    <>
      <Raum a={a} b={b} c={c} d={d} phi={phi} theta={theta} setPhi={setPhi} setTheta={setTheta} zeigen={zeigen} zoom={zoom} grund={grund} W={W} H={H} />
      <DrehKnoepfe setPhi={setPhi} setTheta={setTheta} zuruecksetzen={() => { setPhi(0.62); setTheta(0.42); setZoom(1); }} />
      {zoomKnoepfe}
    </>
  );
  const beispielWahl = (titel) => (
    <FallWahl titel={titel} wert={beispiel ? beispiel.name : null}
      setWert={(name) => (name === "zufall" ? zufall() : setze(BEISPIELE.find((x) => x.name === name).k))}
      optionen={[["zufall", "Zufall", "zufall"], ...BEISPIELE.map((x) => [x.name, x.name])]} />
  );
  const anzeigen = (mitTitel) => (
    <div role="group" aria-label="Im Bild anzeigen" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
      {mitTitel && <span style={zeileTitel}>Anzeigen</span>}
      {schalter("spur", "Spurgeraden", C.flaggold)}
      {schalter("normale", "Normalenvektor", C.smaragd)}
      {schalter("box", "Würfel", C.hellgrau)}
    </div>
  );
  const ansichten = (mitTitel) => (
    <div role="group" aria-label="Blickrichtung" style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
      {mitTitel && <span style={zeileTitel}>Ansicht</span>}
      {ANSICHTEN.map(([name, p, t]) => (
        <button key={name} type="button" aria-pressed={ansichtAn ? ansichtAn[0] === name : false} onClick={() => { setPhi(p); setTheta(t); }}
          style={chip(ansichtAn && ansichtAn[0] === name, C.see)}>{name}</button>
      ))}
    </div>
  );
  const weiter = (a !== 0 || b !== 0 || c !== 0) && (
    <WeiterMit titel="Weiter mit dieser Ebene">
      <WeiterKnopf ziel="ebenevsebene" von="Ebenen im Raum" daten={{ k: [a, b, c, d] }} zeile="Als E₁ mit einer zweiten Ebene schneiden – Schnittgerade und Schnittwinkel" />
      <WeiterKnopf ziel="abstaende" von="Ebenen im Raum" daten={{ ebene: [a, b, c, d] }} zeile="Abstand eines Punktes zu genau dieser Ebene berechnen" />
    </WeiterMit>
  );
  const lesehilfe = [
    ["a, b, c", "bilden den Normalenvektor n = (a | b | c). Er legt fest, wie die Ebene im Raum geneigt ist."],
    ["d", "verschiebt die Ebene parallel. Bei d = 0 geht sie durch den Ursprung."],
    ["Spurpunkte", "entstehen, wenn man zwei Koordinaten null setzt: S₁(d/a | 0 | 0), S₂(0 | d/b | 0), S₃(0 | 0 | d/c)."],
    ["Ein Koeffizient 0", "die Ebene ist parallel zur zugehörigen Achse – zwei Koeffizienten 0: parallel zu einer Koordinatenebene."],
  ].map(([t, x]) => (
    <p key={t} style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, marginBottom: 6 }}>
      <b style={{ color: C.tinte }}>{t}:</b> {x}
    </p>
  ));
  const seitenTitel = "Ebenen im Raum";
  const seitenText = "Stell a, b, c und d ein: a, b und c kippen die Ebene (Normalenvektor), d schiebt sie parallel. Mit Finger oder Maus drehst du den Raum.";

  /* ---------- Desktop: Ebene + Eigenschaften links, 3D-Bild rechts (wie „Ebene vs. Ebene“) ---------- */
  if (desktop) {
    return (
      <VekSeite titel={seitenTitel} text={seitenText}>
        <div data-ebenen="breit">
          <VekArbeit
            links={<>
              <EbeneBoxBreit a={a} b={b} c={c} d={d} setA={setA} setB={setB} setC={setC} setD={setD} />
              <FeinKarte data-ebenen-eigenschaften>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: C.tinte, margin: "0 0 4px" }}>Eigenschaften der Ebene</h3>
                <Eigenschaften a={a} b={b} c={c} d={d} />
              </FeinKarte>
              {weiter && <div style={{ marginTop: -18 }}>{weiter}</div>}
            </>}
            rechts={<>
              <VekBild>{(br) => bild(br, br)}</VekBild>
              <Werkzeugleiste gruppen={[
                { titel: "Beispiele", inhalt: beispielWahl(null) },
                { titel: "Anzeigen", inhalt: anzeigen(false) },
                { titel: "Grundebenen einblenden", inhalt: <GrundebenenSchalter an={grund} setAn={setGrund} ohneTitel /> },
                { titel: "Ansicht", inhalt: ansichten(false) },
              ]} />
            </>} />
        </div>
        <div style={{ marginTop: 20 }}>
          <FeinKarte>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: C.tinte, margin: "0 0 10px" }}>So liest du die Koordinatenform</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", columnGap: 32 }}>
              <div>{lesehilfe.slice(0, 2)}</div>
              <div>{lesehilfe.slice(2)}</div>
            </div>
          </FeinKarte>
        </div>
      </VekSeite>
    );
  }

  return (
    <VekSeite titel={seitenTitel} text={seitenText}>
      <ObjektBox farbe={C.see} name="E" art="Ebene in Koordinatenform" innen="14px 10px 4px">
        <GleichungMitReglern a={a} b={b} c={c} d={d} setA={setA} setB={setB} setC={setC} setD={setD} />
      </ObjektBox>
      <div style={{ margin: "12px 0" }}>{beispielWahl("Beispiele")}</div>

      <BuehneKlappe darunter={
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
          {anzeigen(true)}
          <GrundebenenSchalter an={grund} setAn={setGrund} />
          {ansichten(true)}
        </div>
      }>{bild(360, 320)}</BuehneKlappe>

      <Tafel titel="Eigenschaften der Ebene">
        <Eigenschaften a={a} b={b} c={c} d={d} />
      </Tafel>

      {weiter}

      <Tafel titel="So liest du die Koordinatenform">{lesehilfe}</Tafel>
    </VekSeite>
  );
}

/* ---------- Vektoren-Übersicht ---------- */

/* Die Werkzeuge stehen jetzt in werkzeuge.js (Stationen) */

export function VektorenZentrum({ gehe }) {
  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <h2 className="intro-h2" style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 10 }}>
        <span className="titel-lang">Geometrie im Raum sehen</span><span className="titel-kurz">Ab in den Raum!</span>
      </h2>
      <p className="intro-p" style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, marginBottom: 22 }}>
        <span className="titel-lang">Analytische Geometrie scheitert selten am Rechnen, sondern an der Vorstellung. Hier siehst du, was die
        Gleichungen im Raum bedeuten.</span>
        <span className="titel-kurz">Dreh Ebenen mit dem Finger, lass sie sich schneiden und knack jede Raumgeometrie-Aufgabe im Abi.</span>
      </p>
      <ZentrumListe bereichId="vektoren" gehe={gehe} />
      <GesperrteKurse ids={["vektoren"]} ueberschrift="Der Vektoren-Kurs" />
    </div>
  );
}

/* Grafik für die Startseiten-Kachel: 3D-Achsen mit Spurdreieck. */
export function VektorenLogoKlein() {
  const W = 230, H = 190;
  const cam = kamera(0.62, 0.42);
  const s = 19, cx = 104, cy = 122;
  const P = (p) => { const q = cam.proj(p); return [cx + s * q.u, cy - s * q.v]; };
  const pfad = (pts) => pts.map((p, k) => `${k ? "L" : "M"}${P(p)[0].toFixed(1)},${P(p)[1].toFixed(1)}`).join(" ") + " Z";
  const achse = (k, farbe) => { const e = [0, 0, 0]; e[k] = 6.5; const [x, y] = P(e), [ox, oy] = P([0, 0, 0]);
    return <line key={k} x1={ox} y1={oy} x2={x} y2={y} stroke={farbe} strokeWidth="2.2" strokeLinecap="round" />; };
  const S = [[4, 0, 0], [0, 5, 0], [0, 0, 5.5]];
  const fuss = [0.9, 0.72, 0.65].map((v) => v * 1.55);
  const [fx, fy] = P(fuss), [nx, ny] = P(fuss.map((v, k) => v + [0.52, 0.42, 0.38][k] * 3.6));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "100%", display: "block" }} aria-hidden="true">
      {achse(0, C.flaggold)}{achse(1, C.granaHell)}{achse(2, "rgba(255,255,255,0.8)")}
      <path d={pfad(S)} fill="rgba(255,255,255,0.18)" stroke={C.weiss} strokeWidth="2" strokeLinejoin="round" />
      {S.map((p, i) => { const [x, y] = P(p); return <circle key={i} cx={x} cy={y} r="4.5" fill={C.gruen} stroke={C.weiss} strokeWidth="1.5" />; })}
      <line x1={fx} y1={fy} x2={nx} y2={ny} stroke="#35C27A" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx={nx} cy={ny} r="3.2" fill="#35C27A" />
      <g fontSize="12" fontWeight="700" fontStyle="italic">
        <text x="12" y="20" fill={C.weiss}>E</text>
        <text x="24" y="20" fill="#35C27A">n</text>
      </g>
    </svg>
  );
}
