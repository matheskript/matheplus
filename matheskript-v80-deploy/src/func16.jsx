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
import { C } from "./base1.jsx";

/* ---------- Zahlen und Brüche ---------- */

const ggT = (a, b) => (b ? ggT(b, a % b) : Math.abs(a));
function bruch(z, n) {
  if (n === 0) return null;
  const g = ggT(z, n) || 1;
  let a = z / g, b = n / g;
  if (b < 0) { a = -a; b = -b; }
  return b === 1 ? `${a}`.replace("-", "−") : `${a < 0 ? "−" : ""}${Math.abs(a)}/${b}`;
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

function kamera(phi, theta) {
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
function ebenenPolygon(n, d, L) {
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

const FARBE_ACHSE = { 0: "#C99A00", 1: "#A50044", 2: "#004D98" };

function Raum({ a, b, c, d, phi, theta, setPhi, setTheta, zeigen, zoom = 1 }) {
  const n = [a, b, c];
  const nLen = Math.hypot(a, b, c);
  // Würfelgröße: alle Spurpunkte sollen sichtbar sein
  const abschnitte = [a, b, c].filter((k) => k !== 0).map((k) => Math.abs(d / k));
  const L = Math.min(12, Math.max(5, Math.ceil(Math.max(0, ...abschnitte) + 1)));
  const W = 360, H = 320, s = ((Math.min(W, H) / 2 - 18) / (L * 1.55)) * zoom;
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
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", touchAction: "none", cursor: "grab", background: C.weiss, borderRadius: 14 }}
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
            <text x={lx} y={ly + 4} textAnchor="middle" fontSize="13" fontWeight="700" fontStyle="italic" fill={FARBE_ACHSE[a0.k]}>
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
            {Math.abs(t) % (schritt * 2) === 0 && <text x={x + 5} y={y - 4} fontSize="8.5" fill={C.hellgrau}>{t}</text>}
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
            <text x={x2 + 6} y={y2 - 4} fontSize="12" fontWeight="700" fontStyle="italic" fill={C.smaragd}>n</text>
          </g>
        ); })()}

      {/* Spurpunkte */}
      {spurpunkte.map(({ k, p }) => { const [x, y] = P(p);
        return (
          <g key={`S${k}`}>
            <circle cx={x} cy={y} r="5" fill={C.gruen} stroke={C.weiss} strokeWidth="1.8" />
            <text x={x + 8} y={y + 14} fontSize="11.5" fontWeight="700" fill={C.gruen}>S{["₁", "₂", "₃"][k]}</text>
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
    zeilen.push(["Achsenabschnittsform", `x₁/${bruch(d, a)} + x₂/${bruch(d, b)} + x₃/${bruch(d, c)} = 1`.replace(/\/(−[^ ]+)/g, "/($1)")]);
  }
  const abst = Math.abs(d) / nLen;
  const q = a * a + b * b + c * c;
  const wurzel = Number.isInteger(Math.sqrt(q)) ? `${Math.sqrt(q)}` : `√${q}`;
  zeilen.push(["Abstand zum Ursprung", `|d| / |n| = ${Math.abs(d)} / ${wurzel} ≈ ${dez(abst)}`]);
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
            {Array.isArray(w) ? w.map((z) => <span key={z} style={{ display: "block" }}>{z}</span>) : w}
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

/* Drehknöpfe rund um das Schaubild; Gedrückthalten dreht weiter. */
function DrehKnoepfe({ setPhi, setTheta, zuruecksetzen }) {
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
  const knopf = (inhalt, stil, dp, dt, titel) => (
    <button aria-label={titel} title={titel}
      onPointerDown={start(dp, dt)} onPointerUp={stopp} onPointerLeave={stopp} onPointerCancel={stopp}
      style={{ position: "absolute", width: 34, height: 34, borderRadius: 999, border: `1px solid ${C.linie}`,
        background: "rgba(255,255,255,0.92)", color: C.see, fontSize: 15, fontWeight: 700, cursor: "pointer", padding: 0,
        display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(15,26,51,0.14)",
        touchAction: "none", userSelect: "none", ...stil }}>
      {inhalt}
    </button>
  );
  return (
    <>
      {knopf("◀", { left: 6, top: "50%", transform: "translateY(-50%)" }, SCHRITT, 0, "Nach links drehen")}
      {knopf("▶", { right: 6, top: "50%", transform: "translateY(-50%)" }, -SCHRITT, 0, "Nach rechts drehen")}
      {knopf("▲", { top: 6, left: "50%", transform: "translateX(-50%)" }, 0, SCHRITT, "Nach oben kippen")}
      {knopf("▼", { bottom: 6, left: "50%", transform: "translateX(-50%)" }, 0, -SCHRITT, "Nach unten kippen")}
      <button aria-label="Ansicht zurücksetzen" title="Ansicht zurücksetzen" onClick={zuruecksetzen}
        style={{ position: "absolute", left: 6, bottom: 6, height: 30, padding: "0 10px", borderRadius: 999,
          border: `1px solid ${C.linie}`, background: "rgba(255,255,255,0.92)", color: C.see, fontSize: 12.5, fontWeight: 600,
          fontFamily: "inherit", cursor: "pointer", boxShadow: "0 2px 8px rgba(15,26,51,0.14)" }}>
        ↺ Zurück
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
  const [a, setA] = useState(3);
  const [b, setB] = useState(2);
  const [c, setC] = useState(1);
  const [d, setD] = useState(6);
  const [phi, setPhi] = useState(0.62);
  const [theta, setTheta] = useState(0.42);
  const [zoom, setZoom] = useState(1);
  const [zeigen, setZeigen] = useState({ spur: true, normale: true, box: false });
  const setze = ([x, y, z, w]) => { setA(x); setB(y); setC(z); setD(w); };
  const zufall = () => {
    const r = () => Math.floor(Math.random() * 11) - 5;
    let k = [r(), r(), r()];
    while (k.every((v) => v === 0)) k = [r(), r(), r()];
    setze([...k, Math.floor(Math.random() * 21) - 10]);
  };
  const karte = { background: C.weiss, borderRadius: 16, padding: 18, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" };
  const schalter = (schl, label, farbe) => (
    <button key={schl} onClick={() => setZeigen({ ...zeigen, [schl]: !zeigen[schl] })}
      style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 999,
        border: `1px solid ${zeigen[schl] ? farbe : C.linie}`, background: zeigen[schl] ? C.himmel : C.weiss,
        color: C.tinte, fontSize: 12.5, fontFamily: "inherit", cursor: "pointer" }}>
      <span style={{ width: 14, height: 3, borderRadius: 2, background: farbe, opacity: zeigen[schl] ? 1 : 0.35 }} />{label}
    </button>
  );
  const ansicht = (name, p, t) => (
    <button key={name} onClick={() => { setPhi(p); setTheta(t); }}
      style={{ padding: "5px 10px", borderRadius: 999, border: `1px solid ${C.linie}`, background: C.weiss, color: C.see,
        fontSize: 12, fontFamily: "inherit", cursor: "pointer" }}>{name}</button>
  );

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 10 }}>
        Sieh, was die Koeffizienten mit der Ebene tun
      </h2>
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, marginBottom: 22 }}>
        Stell a, b, c und d ein und beobachte, wie sich die Ebene im Raum dreht und verschiebt. Der Normalenvektor
        n = (a | b | c) steht immer senkrecht auf ihr, d verschiebt sie parallel. Mit dem Finger oder der Maus
        drehst du das Koordinatensystem.
      </p>

      <div style={karte}>
        <GleichungMitReglern a={a} b={b} c={c} d={d} setA={setA} setB={setB} setC={setC} setD={setD} />

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {schalter("spur", "Spurgeraden", C.flaggold)}
          {schalter("normale", "Normalenvektor", C.smaragd)}
          {schalter("box", "Würfel", C.hellgrau)}
        </div>

        <div style={{ position: "relative" }}>
          <Raum a={a} b={b} c={c} d={d} phi={phi} theta={theta} setPhi={setPhi} setTheta={setTheta} zeigen={zeigen} zoom={zoom} />
          <DrehKnoepfe setPhi={setPhi} setTheta={setTheta} zuruecksetzen={() => { setPhi(0.62); setTheta(0.42); setZoom(1); }} />
          {/* Zoom unten rechts */}
          <div style={{ position: "absolute", right: 6, bottom: 6, display: "flex", flexDirection: "column", borderRadius: 10,
            overflow: "hidden", border: `1px solid ${C.linie}`, boxShadow: "0 2px 8px rgba(15,26,51,0.14)" }}>
            {[["+", 1.25, "Hineinzoomen"], ["−", 1 / 1.25, "Herauszoomen"]].map(([z, f, t], i) => (
              <button key={z} aria-label={t} title={t} onClick={() => setZoom((v) => Math.min(4, Math.max(0.4, v * f)))}
                style={{ width: 34, height: 32, border: "none", borderTop: i ? `1px solid ${C.linie}` : "none",
                  background: "rgba(255,255,255,0.95)", color: C.see, fontSize: 19, fontWeight: 700, fontFamily: "inherit",
                  cursor: "pointer", padding: 0 }}>{z}</button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
          <span style={{ fontSize: 12.5, color: C.grau, marginRight: 2 }}>Ansicht</span>
          {ansicht("Schräg", 0.62, 0.42)}
          {ansicht("Von vorn", 0.0001, 0.0001)}
          {ansicht("Von oben", 0.62, 1.34)}
          {ansicht("Von der Seite", 1.5707, 0.0001)}
        </div>


        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingTop: 14 }}>
          <button onClick={zufall}
            style={{ flexShrink: 0, padding: "7px 12px", borderRadius: 999, border: "none", background: C.flaggold, color: C.seeTief,
              fontSize: 12.5, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>🎲 Zufall</button>
          {BEISPIELE.map((x) => (
            <button key={x.name} onClick={() => setze(x.k)}
              style={{ flexShrink: 0, padding: "7px 12px", borderRadius: 999, border: `1px solid ${C.linie}`, background: C.weiss,
                color: C.see, fontSize: 12.5, fontFamily: "inherit", cursor: "pointer", whiteSpace: "nowrap" }}>{x.name}</button>
          ))}
        </div>
      </div>

      <div style={{ ...karte, marginTop: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 6 }}>Eigenschaften der Ebene</p>
        <Eigenschaften a={a} b={b} c={c} d={d} />
      </div>

      <div style={{ ...karte, marginTop: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 10 }}>So liest du die Koordinatenform</p>
        {[
          ["a, b, c", "bilden den Normalenvektor n = (a | b | c). Er legt fest, wie die Ebene im Raum geneigt ist."],
          ["d", "verschiebt die Ebene parallel. Bei d = 0 geht sie durch den Ursprung."],
          ["Spurpunkte", "entstehen, wenn man zwei Koordinaten null setzt: S₁(d/a | 0 | 0), S₂(0 | d/b | 0), S₃(0 | 0 | d/c)."],
          ["Ein Koeffizient 0", "die Ebene ist parallel zur zugehörigen Achse – zwei Koeffizienten 0: parallel zu einer Koordinatenebene."],
        ].map(([t, s]) => (
          <p key={t} style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, marginBottom: 6 }}>
            <b style={{ color: C.tinte }}>{t}:</b> {s}
          </p>
        ))}
      </div>
    </div>
  );
}

/* ---------- Vektoren-Übersicht ---------- */

const VEKTOREN = [
  { ziel: { ansicht: "ebenen" }, titel: "Ebenen-Visualizer", kurz: "Ebenen in Koordinatenform live im 3D-Koordinatensystem sehen – mit Spurpunkten und Normalenvektor.", zeichen: "E" },
  { ziel: { ansicht: "kurse", kurs: "vektoren" }, titel: "Videokurs Vektoren", kurz: "Fünf Lektionen von den Grundlagen bis zu Ebenen – mit Merksätzen und Kurz-Checks.", zeichen: "▶" },
];

export function VektorenZentrum({ gehe }) {
  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 10 }}>
        Geometrie im Raum sehen
      </h2>
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, marginBottom: 22 }}>
        Analytische Geometrie scheitert selten am Rechnen, sondern an der Vorstellung. Hier siehst du, was die
        Gleichungen im Raum bedeuten.
      </p>
      {VEKTOREN.map((x) => (
        <button key={x.titel} onClick={() => gehe(x.ziel)} className="w-full px-5 py-5 mb-3"
          style={{ display: "flex", alignItems: "center", gap: 14, background: C.weiss, border: `1px solid ${C.linie}`, borderRadius: 16,
            textAlign: "left", cursor: "pointer", fontFamily: "inherit", color: C.tinte, boxShadow: "0 2px 14px rgba(15,26,51,0.06)" }}>
          <span aria-hidden="true" style={{ flexShrink: 0, width: 58, height: 58, borderRadius: 14,
            background: `linear-gradient(155deg, ${C.see} 0%, ${C.seeTief} 100%)`, color: C.flaggold,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, fontStyle: "italic" }}>
            {x.zeichen}
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontSize: 17.5, fontWeight: 600, marginBottom: 4 }}>{x.titel}</span>
            <span style={{ display: "block", color: C.grau, fontSize: 13.5, fontWeight: 300, lineHeight: 1.6 }}>{x.kurz}</span>
          </span>
        </button>
      ))}
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
      {Array.from({ length: 9 }, (_, i) => <line key={`v${i}`} x1={i * 28} y1="0" x2={i * 28} y2={H} stroke="rgba(255,255,255,0.05)" />)}
      {Array.from({ length: 7 }, (_, i) => <line key={`h${i}`} x1="0" y1={i * 28} x2={W} y2={i * 28} stroke="rgba(255,255,255,0.05)" />)}
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
