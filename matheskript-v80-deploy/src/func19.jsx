/* ============================================================
   Vektoren-Bereich: „Ebene vs. Ebene“
   Zwei Ebenen in Koordinatenform einstellen (nebeneinander, + und −
   untereinander), beide im selben 3D-Schaubild sehen, dazu die
   Schnittgerade in Parameterform und den Schnittwinkel über die
   Kosinusformel – mit sauberen Brüchen übereinander.
   Desktop (ab 840 px): Ebenen-Karten und Ergebnis links, Schaubild rechts,
   Schnittwinkel darunter über die volle Breite. Das Schaubild rechnet in
   echten Pixeln – Beschriftungen bleiben auf jeder Breite gleich groß.
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useRef, useState } from "react";
import { uebergabeErledigt, uebergabeLesen } from "./uebergabe.js";
import { C } from "./base1.jsx";
import { DrehKnoepfe, FARBE_ACHSE, GRUND_AUS, GrundebenenGitter, GrundebenenSchalter, ebenenPolygon, ebenenText, kamera } from "./func16.jsx";
import { MatheFeld } from "./matheTastatur.jsx";
import { wAdd, wGanz, wIstNull, wIstRational, wLies, wMul, wNegativ, wNum, wSub, wText, wZ } from "./wzahl.js";
import { WurzelZeichen } from "./wurzelZeichen.jsx";
import { Arbeitsflaeche, BildKarte, ErgebnisReihe, Werkzeugleiste, chipStil, feinKarte, hinweisStil, titelStil, toenKarte, useBreite, useDesktop } from "./arbeitsflaeche.jsx";
import { BUEHNE, Bild, Ergebnis, FallWahl, ObjektBox, ObjektReihe, RSchritt, Rechenweg, Tafel, VekSeite } from "./vekUi.jsx";

const FARBE_E1 = C.see;
const FARBE_E2 = C.gruen;
const FARBE_G = C.smaragd;   /* Schnittgerade = Ergebnis (Gold gehört E₂) */

/* ---------- Zahlen ---------- */

export const ggT = (a, b) => (b ? ggT(b, a % b) : Math.abs(a));
export const minus = (x) => String(x).replace("-", "−");
// Bruch z/n gekürzt als { z, n } (n > 0)
export function kuerze(z, n) {
  const g = ggT(Math.abs(z), Math.abs(n)) || 1;
  let a = z / g, b = n / g;
  if (b < 0) { a = -a; b = -b; }
  return { z: a, n: b };
}
const dez = (v, st = 5) => {
  const F = 10 ** st;
  const r = Math.round(v * F) / F;
  const exakt = Math.abs(v * F - Math.round(v * F)) < 1e-7;
  return minus(String(r).replace(".", ",")) + (exakt ? "" : "…");
};
export const kreuz = (u, v) => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
export const skalar = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];

/* ---------- Darstellung: Bruch, Wurzel, Vektor ---------- */

export function Bruch({ oben, unten, gross }) {
  return (
    <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", verticalAlign: "middle", margin: "0 2px",
      fontSize: gross ? "1em" : "0.92em", lineHeight: 1.15 }}>
      <span style={{ padding: "0 3px 2px" }}>{oben}</span>
      <span style={{ borderTop: "1.6px solid currentColor", padding: "0.4em 3px 0", alignSelf: "stretch", textAlign: "center" }}>{unten}</span>
    </span>
  );
}

/* Wurzel: Haken und Überstrich als ein Linienzug (wurzelZeichen.jsx) */
export function Wurzel({ children, index }) {
  return <WurzelZeichen index={index}>{children}</WurzelZeichen>;
}

// Zahl oder Bruch als Eintrag
export function Zahl({ q }) {
  if (q.n === 1) return <span>{minus(q.z)}</span>;
  return (
    <span style={{ display: "inline-flex", alignItems: "center" }}>
      {q.z < 0 && <span>−</span>}
      <Bruch oben={Math.abs(q.z)} unten={q.n} />
    </span>
  );
}

// n⃗ mit Pfeil darüber
export function VecName({ t, idx, farbe }) {
  return (
    <span style={{ color: farbe, whiteSpace: "nowrap" }}>
      {/* Pfeil absolut über dem Buchstaben (Strich über die ganze Breite + Spitze) – der Buchstabe bleibt auf der Grundlinie */}
      {/* lineHeight 1: die Box ist genau 1 em hoch, der Pfeil sitzt damit unabhängig von der Zeilenhöhe knapp über dem Buchstaben */}
      <span style={{ position: "relative", display: "inline-block", lineHeight: 1 }}>
        <span aria-hidden="true" style={{ position: "absolute", left: "0.05em", right: "-0.04em", top: "-0.27em", height: "0.38em", minWidth: "0.55em" }}>
          <span style={{ position: "absolute", left: 0, right: "0.08em", top: "50%", height: "0.09em", marginTop: "-0.045em", background: "currentColor", borderRadius: "0.05em" }} />
          <svg viewBox="0 0 6 8" preserveAspectRatio="xMaxYMid meet" style={{ position: "absolute", right: 0, top: 0, height: "100%", width: "0.285em", overflow: "visible" }}>
            <path d="M1.1 1.1 L5 4 L1.1 6.9" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        {t}
      </span>
      {idx && <sub style={{ fontSize: "0.65em" }}>{idx}</sub>}
    </span>
  );
}

export function SpaltenVektor({ eintraege, farbe }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "stretch", verticalAlign: "middle", color: farbe }}>
      <span style={{ width: 7, borderLeft: "1.8px solid currentColor", borderTop: "1.8px solid currentColor", borderBottom: "1.8px solid currentColor", borderRadius: "8px 0 0 8px" }} />
      <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", justifyContent: "space-around", padding: "3px 4px", gap: 2, minWidth: 22 }}>
        {eintraege.map((e, i) => <span key={i} style={{ lineHeight: 1.15 }}>{e}</span>)}
      </span>
      <span style={{ width: 7, borderRight: "1.8px solid currentColor", borderTop: "1.8px solid currentColor", borderBottom: "1.8px solid currentColor", borderRadius: "0 8px 8px 0" }} />
    </span>
  );
}

/* ---------- Eingabe einer Ebene ---------- */

const BUCHSTABEN = ["a", "b", "c", "d"];
const KOEFF_FARBEN = [FARBE_ACHSE[0], FARBE_ACHSE[1], FARBE_ACHSE[2], C.smaragd];

/* Eine Reihe aus vier Reglern: „a = 3“ und darunter/darüber − und + nebeneinander */
function ReglerReihe({ name, k, setK, beschriftungOben }) {
  const aendern = (i, delta) => { const n = [...k]; n[i] = Math.max(-10, Math.min(10, n[i] + delta)); setK(n); };
  const knopf = (f) => ({
    flex: 1, minWidth: 0, maxWidth: 38, height: 30, borderRadius: 8, border: `1.5px solid ${f}66`, background: `${f}14`,
    color: f, fontSize: 17, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", padding: 0, lineHeight: 1,
    display: "flex", alignItems: "center", justifyContent: "center",
  });
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 6 }}>
      {k.map((v, i) => {
        const f = KOEFF_FARBEN[i];
        const beschriftung = (
          <span style={{ fontSize: "clamp(14px, 4.2vw, 17px)", fontWeight: 800, color: f, fontVariantNumeric: "tabular-nums", lineHeight: 1.1, whiteSpace: "nowrap" }}>
            {BUCHSTABEN[i]} = {minus(v)}
          </span>
        );
        return (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
            {beschriftungOben && beschriftung}
            <div style={{ display: "flex", gap: 4, width: "100%", justifyContent: "center" }}>
              <button aria-label={`${BUCHSTABEN[i]} von E${name} verringern`} style={knopf(f)} onClick={() => aendern(i, -1)}>−</button>
              <button aria-label={`${BUCHSTABEN[i]} von E${name} erhöhen`} style={knopf(f)} onClick={() => aendern(i, 1)}>+</button>
            </div>
            {!beschriftungOben && beschriftung}
          </div>
        );
      })}
    </div>
  );
}

/* „3x₁ + 2x₂ + x₃ = 6“ in einer Zeile (der Name steht im Kopf der Box) */
function GleichungsZeile({ k }) {
  return (
    <Einzeilig max={19} min={12}><span>{ebenenText(...k)}</span></Einzeilig>
  );
}

/* Beide Ebenen in eigenen Boxen: E₁ links (Blau), E₂ rechts (Gold); auf schmalen Bildschirmen untereinander */
function EbenenPaar({ k1, setK1, k2, setK2 }) {
  return (
    <ObjektReihe min={260}>
      {[["₁", FARBE_E1, k1, setK1], ["₂", FARBE_E2, k2, setK2]].map(([nr, farbe, k, setK]) => (
        <ObjektBox key={nr} farbe={farbe} name={`E${nr}`} art="Ebene" innen="8px 10px 12px">
          <div style={{ padding: "4px 0 10px" }}><GleichungsZeile k={k} /></div>
          <ReglerReihe name={nr} k={k} setK={setK} beschriftungOben />
        </ObjektBox>
      ))}
    </ObjektReihe>
  );
}

/* ---------- Desktop: eine Ebene als Karte ----------
   Oben die Gleichung, darunter je Koeffizient + / „a = 3“ / − untereinander. */
function EbenenKarte({ name, farbe, k, setK }) {
  const aendern = (i, delta) => { const n = [...k]; n[i] = Math.max(-10, Math.min(10, n[i] + delta)); setK(n); };
  const knopf = (f) => ({
    width: "100%", maxWidth: 66, height: 30, borderRadius: 9, border: `1.5px solid ${f}55`, background: `${f}12`,
    color: f, fontSize: 18, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", padding: 0, lineHeight: 1,
    display: "flex", alignItems: "center", justifyContent: "center", touchAction: "manipulation",
  });
  return (
    <div data-eve-karte={name} style={toenKarte(farbe)}>
      <Einzeilig max={19} min={12}>
        <span style={{ color: farbe, fontWeight: 800 }}>E{name}:</span>
        <span>{ebenenText(...k)}</span>
      </Einzeilig>
      <div style={{ height: 1, background: `${farbe}22`, margin: "12px 4px 12px" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 6 }}>
        {k.map((v, i) => {
          const f = KOEFF_FARBEN[i];
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <button className="eve-knopf" aria-label={`${BUCHSTABEN[i]} von E${name} erhöhen`} style={knopf(f)} onClick={() => aendern(i, 1)}>+</button>
              <span style={{ fontSize: minus(v).length >= 3 ? 14 : 15.5, fontWeight: 800, color: f, fontVariantNumeric: "tabular-nums", lineHeight: 1.2, whiteSpace: "nowrap" }}>
                {BUCHSTABEN[i]} = {minus(v)}
              </span>
              <button className="eve-knopf" aria-label={`${BUCHSTABEN[i]} von E${name} verringern`} style={knopf(f)} onClick={() => aendern(i, -1)}>−</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Lage der beiden Ebenen ---------- */

function lage(k1, k2) {
  const n1 = k1.slice(0, 3), n2 = k2.slice(0, 3), d1 = k1[3], d2 = k2[3];
  const leer1 = n1.every((v) => v === 0), leer2 = n2.every((v) => v === 0);
  if (leer1 || leer2) return { art: "keine" };
  const u = kreuz(n1, n2);
  if (u.every((v) => v === 0)) {
    // parallel: identisch, wenn (n1, d1) ein Vielfaches von (n2, d2) ist
    const i = n2.findIndex((v) => v !== 0);
    const identisch = d1 * n2[i] === d2 * n1[i];
    return { art: identisch ? "identisch" : "parallel", u };
  }
  // Richtungsvektor kürzen und Vorzeichen freundlich wählen
  const g = ggT(ggT(Math.abs(u[0]), Math.abs(u[1])), Math.abs(u[2])) || 1;
  let r = u.map((v) => v / g);
  if (r.filter((v) => v < 0).length >= 2) r = r.map((v) => -v);
  // Stützpunkt: eine Koordinate 0 setzen, das 2×2-System lösen (bevorzugt ganzzahlig)
  const kandidaten = [0, 1, 2].filter((k) => u[k] !== 0).map((k) => {
    const [i, j] = [0, 1, 2].filter((x) => x !== k);
    const det = n1[i] * n2[j] - n1[j] * n2[i];
    const p = [null, null, null];
    p[k] = { z: 0, n: 1 };
    p[i] = kuerze(d1 * n2[j] - d2 * n1[j], det);
    p[j] = kuerze(n1[i] * d2 - n2[i] * d1, det);
    const ganz = p.every((q) => q.n === 1);
    return { p, ganz, gewicht: Math.abs(u[k]) };
  });
  kandidaten.sort((a, b) => (b.ganz - a.ganz) || (b.gewicht - a.gewicht));
  return { art: "schnitt", u, r, p: kandidaten[0].p };
}

/* ---------- 3D-Schaubild mit beiden Ebenen und Schnittgerade ---------- */

export function strahlImWuerfel(p, r, L) {
  // Gerade p + t·r auf den Würfel [−L, L]³ zuschneiden
  let t0 = -Infinity, t1 = Infinity;
  for (let k = 0; k < 3; k++) {
    if (Math.abs(r[k]) < 1e-12) { if (Math.abs(p[k]) > L) return null; continue; }
    const a = (-L - p[k]) / r[k], b = (L - p[k]) / r[k];
    t0 = Math.max(t0, Math.min(a, b)); t1 = Math.min(t1, Math.max(a, b));
  }
  if (t0 > t1) return null;
  return [p.map((v, k) => v + t0 * r[k]), p.map((v, k) => v + t1 * r[k])];
}

function Raum2({ k1, k2, info, phi, theta, setPhi, setTheta, zoom, grund, W = 360, H = 320 }) {
  const abschnitte = [k1, k2].flatMap((k) => k.slice(0, 3).filter((v) => v !== 0).map((v) => Math.abs(k[3] / v)));
  const L = Math.min(12, Math.max(5, Math.ceil(Math.max(0, ...abschnitte) + 1)));
  const s = ((Math.min(W, H) / 2 - 18) / (L * 1.55)) * zoom;
  const cam = kamera(phi, theta);
  const P = (p) => { const q = cam.proj(p); return [W / 2 + s * q.u, H / 2 - s * q.v]; };
  const pfad = (pts) => pts.map((p, k) => `${k ? "L" : "M"}${P(p)[0].toFixed(1)},${P(p)[1].toFixed(1)}`).join(" ") + " Z";

  const ebenen = [[k1, FARBE_E1, "E₁"], [k2, FARBE_E2, "E₂"]].map(([k, farbe, name]) => {
    const n = k.slice(0, 3);
    const poly = n.some((v) => v !== 0) ? ebenenPolygon(n, k[3], L) : [];
    const tiefe = poly.length ? poly.reduce((sum, p) => sum + cam.proj(p).t, 0) / poly.length : 0;
    return { poly, farbe, name, tiefe };
  }).sort((a, b) => a.tiefe - b.tiefe);

  let gerade = null;
  if (info.art === "schnitt") {
    const p = info.p.map((q) => q.z / q.n);
    gerade = strahlImWuerfel(p, info.r, L);
  }

  const ziehen = useRef(null);
  const start = (e) => { ziehen.current = { x: e.clientX, y: e.clientY, phi, theta }; e.currentTarget.setPointerCapture?.(e.pointerId); };
  const bewege = (e) => {
    if (!ziehen.current) return;
    const dx = e.clientX - ziehen.current.x, dy = e.clientY - ziehen.current.y;
    setPhi(ziehen.current.phi - dx * 0.01);
    setTheta(Math.max(-1.35, Math.min(1.35, ziehen.current.theta + dy * 0.01)));
  };
  const ende = () => { ziehen.current = null; };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", touchAction: "none", cursor: "grab", background: C.weiss, borderRadius: 14 }}
      onPointerDown={start} onPointerMove={bewege} onPointerUp={ende} onPointerLeave={ende}>
      <defs>
        {[0, 1, 2].map((k) => (
          <marker key={k} id={`evp${k}`} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill={FARBE_ACHSE[k]} />
          </marker>
        ))}
      </defs>
      <GrundebenenGitter an={grund} P={P} L={L} />
      {/* Achsen */}
      {[0, 1, 2].map((k) => {
        const a = [0, 0, 0], b = [0, 0, 0], lab = [0, 0, 0];
        a[k] = -L; b[k] = L * 1.12; lab[k] = L * 1.24;
        const [x1, y1] = P(a), [x2, y2] = P(b), [lx, ly] = P(lab);
        return (
          <g key={k}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={FARBE_ACHSE[k]} strokeWidth="1.8" markerEnd={`url(#evp${k})`} />
            <text x={lx} y={ly + 4} textAnchor="middle" fontSize={W > 400 ? 14.5 : 13} fontWeight="700" fontStyle="italic" fill={FARBE_ACHSE[k]}>x{["₁", "₂", "₃"][k]}</text>
          </g>
        );
      })}
      {/* Ebenen (hintere zuerst) */}
      {ebenen.map((e) => e.poly.length >= 3 && (
        <path key={e.name} d={pfad(e.poly)} fill={e.farbe} fillOpacity="0.2" stroke={e.farbe} strokeOpacity="0.75" strokeWidth="1.4" strokeLinejoin="round" />
      ))}
      {/* Schnittgerade */}
      {gerade && (() => {
        const [x1, y1] = P(gerade[0]), [x2, y2] = P(gerade[1]);
        return (
          <g>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity="0.9" />
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={FARBE_G} strokeWidth="3.2" strokeLinecap="round" />
          </g>
        );
      })()}
      {/* Stützpunkt */}
      {info.art === "schnitt" && (() => {
        const p = info.p.map((q) => q.z / q.n);
        if (p.some((v) => Math.abs(v) > L)) return null;
        const [x, y] = P(p);
        return <circle cx={x} cy={y} r="4.5" fill={FARBE_G} stroke={C.weiss} strokeWidth="1.6" />;
      })()}
      {(() => { const [x, y] = P([0, 0, 0]); return <circle cx={x} cy={y} r="2.6" fill={C.tinte} />; })()}
      {/* Legende */}
      <g fontSize="12" fontWeight="700">
        <rect x="10" y="10" width="10" height="10" rx="2" fill={FARBE_E1} opacity="0.6" /><text x="25" y="19.5" fill={FARBE_E1}>E₁</text>
        <rect x="50" y="10" width="10" height="10" rx="2" fill={FARBE_E2} opacity="0.6" /><text x="65" y="19.5" fill={FARBE_E2}>E₂</text>
        {info.art === "schnitt" && <><rect x="90" y="13" width="14" height="4" rx="2" fill={FARBE_G} /><text x="109" y="19.5" fill={FARBE_G}>g</text></>}
      </g>
    </svg>
  );
}

/* ---------- Schnittgerade und Schnittwinkel ---------- */

function Schnittgerade({ info, ohneName = false }) {
  if (info.art !== "schnitt") return null;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: ohneName ? "center" : undefined, flexWrap: "wrap", gap: 6, fontSize: 17, fontWeight: 700, color: C.tinte, fontVariantNumeric: "tabular-nums" }}>
      {!ohneName && <span style={{ color: FARBE_G }}>g:</span>}
      <VecName t="x" idx="" farbe={C.tinte} />
      <span>=</span>
      <SpaltenVektor eintraege={info.p.map((q, i) => <Zahl key={i} q={q} />)} farbe={C.tinte} />
      <span>+ t ·</span>
      <SpaltenVektor eintraege={info.r.map((v, i) => <span key={i}>{minus(v)}</span>)} farbe={FARBE_G} />
    </div>
  );
}

function Winkelrechnung({ k1, k2 }) {
  const n1 = k1.slice(0, 3), n2 = k2.slice(0, 3);
  const q1 = skalar(n1, n1), q2 = skalar(n2, n2);
  if (!q1 || !q2) return null;
  const sp = skalar(n1, n2);
  const cosv = Math.abs(sp) / Math.sqrt(q1 * q2);
  const alpha = (Math.acos(Math.min(1, cosv)) * 180) / Math.PI;
  const kl = (v) => (v < 0 ? `(${minus(v)})` : `${v}`);
  const produkt = [0, 1, 2].map((i) => `${kl(n1[i])}·${kl(n2[i])}`).join(" + ");
  const quadrate = (n) => n.map((v) => `${kl(v)}²`).join("+");
  const wurzelWert = (q) => (Number.isInteger(Math.sqrt(q)) ? <span>{Math.sqrt(q)}</span> : <Wurzel>{q}</Wurzel>);
  const betrag = (inhalt) => <span style={{ whiteSpace: "nowrap" }}>|{inhalt}|</span>;
  const zeile = { display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", minHeight: 50, fontVariantNumeric: "tabular-nums" };
  return (
    <div style={{ overflowX: "auto", fontSize: 15.5, fontWeight: 700, color: C.tinte }}>
      {/* allgemeine Formel */}
      <div style={zeile}>
        <span>cos(α) =</span>
        <Bruch gross
          oben={betrag(<><VecName t="n" idx="1" farbe={FARBE_E1} /> · <VecName t="n" idx="2" farbe={FARBE_E2} /></>)}
          unten={<span>{betrag(<VecName t="n" idx="1" farbe={FARBE_E1} />)} · {betrag(<VecName t="n" idx="2" farbe={FARBE_E2} />)}</span>} />
      </div>
      {/* eingesetzt */}
      <div style={{ ...zeile, fontSize: "clamp(10.5px, 3.3vw, 15.5px)" }}>
        <span style={{ visibility: "hidden", fontSize: 15.5 }}>cos(α)</span><span style={{ fontSize: 15.5 }}>=</span>
        <Bruch gross
          oben={betrag(produkt)}
          unten={<span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Wurzel>{quadrate(n1)}</Wurzel> · <Wurzel>{quadrate(n2)}</Wurzel></span>} />
      </div>
      {/* ausgerechnet */}
      <div style={zeile}>
        <span style={{ visibility: "hidden" }}>cos(α)</span><span>=</span>
        <Bruch gross oben={Math.abs(sp)} unten={<span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>{wurzelWert(q1)} · {wurzelWert(q2)}</span>} />
        <span>=</span>
        <span>{dez(cosv)}</span>
      </div>
      <div style={{ ...zeile, minHeight: 36, marginTop: 4 }}>
        <span>α = arccos({dez(cosv)})</span>
        <span>≈</span>
        <span style={{ color: C.see, fontSize: 19 }}>{dez(alpha, 2).replace("…", "")}°</span>
      </div>
    </div>
  );
}

/* ---------- Seite ---------- */

const BEISPIELE = [
  { name: "Schneiden sich", k1: [3, 2, 1, 6], k2: [1, -1, 2, 2] },
  { name: "Senkrecht", k1: [1, 1, 0, 4], k2: [1, -1, 0, 0] },
  { name: "Parallel", k1: [1, 2, 2, 4], k2: [2, 4, 4, -4] },
  { name: "Identisch", k1: [1, -1, 1, 2], k2: [2, -2, 2, 4] },
  { name: "Mit x₁x₂-Ebene", k1: [2, 1, 3, 6], k2: [0, 0, 1, 0] },
];

export function EbeneVsEbene() {
  // Übergabe (z. B. aus dem Ebenen-Visualizer): { k: [a, b, c, d] } wird E₁
  const [k1, setK1] = useState(() => { const u = uebergabeLesen("ebenevsebene"); return u && Array.isArray(u.k) && u.k.length === 4 && u.k.every((v) => Number.isInteger(v) && Math.abs(v) <= 10) ? [...u.k] : [3, 2, 1, 6]; });
  React.useEffect(() => { uebergabeErledigt("ebenevsebene"); }, []);
  const [k2, setK2] = useState([1, -1, 2, 2]);
  const [phi, setPhi] = useState(0.62);
  const [theta, setTheta] = useState(0.42);
  const [zoom, setZoom] = useState(1);
  const [grund, setGrund] = useState(GRUND_AUS);
  const breit = useDesktop();
  const [plotRef, plotBreite] = useBreite();
  const info = lage(k1, k2);
  const karte = { background: C.weiss, borderRadius: 16, padding: 18, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" };
  const fein = feinKarte;
  const titel = titelStil;
  const hinweis = { ...hinweisStil, marginTop: 10 };

  const lageText = {
    schnitt: "Die Ebenen schneiden sich in einer Geraden g.",
    parallel: "Die Ebenen sind echt parallel – die Normalenvektoren sind Vielfache voneinander, die Ebenen haben keinen gemeinsamen Punkt.",
    identisch: "Die Ebenen sind identisch – beide Gleichungen beschreiben dieselbe Ebene.",
    keine: "Mindestens eine Gleichung ist keine Ebene: a, b und c dürfen nicht alle 0 sein.",
  }[info.art];

  // Schaubild: Handy wie bisher im Format 360 × 320, Desktop quadratisch – immer in echten Pixeln
  const W = plotBreite || 360;
  const H = breit ? W : Math.round((W * 320) / 360);
  const schaubild = (
    <div ref={plotRef} style={{ position: "relative" }}>
      <Raum2 k1={k1} k2={k2} info={info} phi={phi} theta={theta} setPhi={setPhi} setTheta={setTheta} zoom={zoom} grund={grund} W={W} H={H} />
      <DrehKnoepfe setPhi={setPhi} setTheta={setTheta} zuruecksetzen={() => { setPhi(0.62); setTheta(0.42); setZoom(1); }} />
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
  );

  const beispiele = (umbruch) => (
    <div style={{ display: "flex", gap: 6, ...(umbruch ? { flexWrap: "wrap", alignItems: "center" } : { overflowX: "auto", paddingTop: 14 }) }}>
      {BEISPIELE.map((x) => (
        <button key={x.name} onClick={() => { setK1(x.k1); setK2(x.k2); }}
          style={chipStil()}>{x.name}</button>
      ))}
    </div>
  );

  const lageInhalt = (
    <>
      <p style={titel}>Lage der Ebenen</p>
      <p style={{ fontSize: 14.5, color: C.tinte, lineHeight: 1.6, marginBottom: info.art === "schnitt" ? 14 : 0 }}>{lageText}</p>
      {info.art === "schnitt" && (
        <>
          <p style={{ ...titel, marginBottom: 8 }}>Schnittgerade</p>
          <Schnittgerade info={info} />
          <p style={hinweis}>
            Richtungsvektor: Kreuzprodukt der Normalenvektoren n₁ × n₂ (gekürzt). Stützpunkt: eine Koordinate 0 gesetzt
            und das verbleibende Gleichungssystem gelöst.
          </p>
        </>
      )}
    </>
  );

  const winkelHinweis = (
    <p style={{ ...hinweis, marginTop: breit ? 0 : 10 }}>
      Der Winkel zwischen zwei Ebenen ist der Winkel zwischen ihren Normalenvektoren – der Betrag im Zähler sorgt dafür,
      dass immer der spitze Winkel (0° bis 90°) herauskommt.
    </p>
  );

  /* ---------- Desktop: Arbeitsfläche in zwei Spalten ---------- */
  if (breit) {
    return (
      <div className="mx-auto px-6 pb-16" data-eve="breit" style={{ maxWidth: 620, paddingTop: 16 }}>
        <Arbeitsflaeche
          links={<>
            <EbenenKarte name="₁" farbe={FARBE_E1} k={k1} setK={setK1} />
            <EbenenKarte name="₂" farbe={FARBE_E2} k={k2} setK={setK2} />
            <div data-eve-lage style={fein}>{lageInhalt}</div>
          </>}
          rechts={<>
            <BildKarte>{schaubild}</BildKarte>
            <Werkzeugleiste gruppen={[
              { titel: "Grundebenen einblenden", inhalt: <GrundebenenSchalter an={grund} setAn={setGrund} ohneTitel /> },
              { titel: "Beispiele", inhalt: beispiele(true) },
            ]} />
          </>} />

        {info.art !== "keine" && (
          <div style={{ marginTop: 20 }}>
            <ErgebnisReihe spalten="minmax(0, 1fr)">
              <div data-eve-winkel style={{ ...fein, display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 240px)", columnGap: 32, alignItems: "center" }}>
                <div style={{ minWidth: 0 }}>
                  <p style={titel}>Schnittwinkel</p>
                  <Winkelrechnung k1={k1} k2={k2} />
                </div>
                <div style={{ borderLeft: `2px solid ${C.linie}`, paddingLeft: 18 }}>{winkelHinweis}</div>
              </div>
            </ErgebnisReihe>
          </div>
        )}
      </div>
    );
  }

  /* ---------- Handy und Tablet: eine Spalte im Design der Vektor-Werkzeuge (vekUi.jsx) ---------- */
  const beispielAn = BEISPIELE.find((x) => x.k1.join() === k1.join() && x.k2.join() === k2.join());
  const lageKurz = { schnitt: "Die Ebenen schneiden sich in einer Geraden g.", parallel: "Die Ebenen sind echt parallel.", identisch: "Die Ebenen sind identisch.", keine: "Mindestens eine Gleichung ist keine Ebene." }[info.art];
  const lageZusatz = {
    schnitt: "Die Normalenvektoren sind keine Vielfachen voneinander.",
    parallel: "Die Normalenvektoren sind Vielfache voneinander, die Gleichungen aber nicht – es gibt keinen gemeinsamen Punkt.",
    identisch: "Beide Gleichungen sind Vielfache voneinander und beschreiben dieselbe Ebene.",
    keine: "a, b und c dürfen nicht alle 0 sein.",
  }[info.art];
  const lageBild = { schnitt: "ee-schnitt", parallel: "ee-parallel", identisch: "ee-identisch" }[info.art];
  return (
    <VekSeite titel="Zwei Ebenen im Raum" text="Stell beide Ebenen ein und sieh sofort, ob sie sich schneiden, parallel oder identisch sind – mit Schnittgerade und Schnittwinkel.">
      <EbenenPaar k1={k1} setK1={setK1} k2={k2} setK2={setK2} />
      <div style={{ margin: "12px 0" }}>
        <FallWahl titel="Beispiele" wert={beispielAn ? beispielAn.name : null} setWert={(name) => { const x = BEISPIELE.find((y) => y.name === name); setK1(x.k1); setK2(x.k2); }}
          optionen={BEISPIELE.map((x) => [x.name, x.name])} />
      </div>
      <div style={{ ...BUEHNE, overflow: "hidden" }}>{schaubild}</div>
      <div style={{ marginTop: 8 }}><GrundebenenSchalter an={grund} setAn={setGrund} /></div>

      <Tafel titel="Lage der Ebenen">
        <Ergebnis art={info.art === "keine" ? "warn" : "gut"} titel="Lage" bild={lageBild ? <Bild art={lageBild} breite={44} farbe={FARBE_E1} farbe2={FARBE_E2} /> : null} zusatz={lageZusatz}>
          {lageKurz}
        </Ergebnis>
        {info.art === "schnitt" && (
          <div style={{ marginTop: 14 }}>
            <ObjektBox farbe={FARBE_G} name="g" art="Schnittgerade"
              fuss="Richtung: Kreuzprodukt der Normalenvektoren n₁ × n₂ (gekürzt). Stützpunkt: eine Koordinate 0 gesetzt und das übrige Gleichungssystem gelöst.">
              <Schnittgerade info={info} ohneName />
            </ObjektBox>
          </div>
        )}
      </Tafel>

      {info.art !== "keine" && (
        <Tafel titel="Schnittwinkel" text="Der Winkel zwischen zwei Ebenen ist der Winkel zwischen ihren Normalenvektoren. Der Betrag im Zähler sorgt für den spitzen Winkel (0° bis 90°).">
          <div style={{ background: "#F5F7FB", border: `1px solid ${C.linie}`, borderRadius: 12, padding: "6px 12px" }}>
            <Winkelrechnung k1={k1} k2={k2} />
          </div>
        </Tafel>
      )}
    </VekSeite>
  );
}

/* ============================================================
   Kreuzprodukt-Rechner: zwei Vektoren eingeben, daneben in einer
   Zeile die allgemeine Formel, die eingesetzte Formel und das Ergebnis.
   ============================================================ */

const lies = (t) => {
  const v = parseFloat(String(t).replace(",", ".").replace("−", "-"));
  return Number.isFinite(v) ? v : 0;
};
const zahlText = (v) => {
  const r = Math.round(v * 1e6) / 1e6;
  return minus(String(r).replace(".", ","));
};
const inKlammer = (v) => (v < 0 ? `(${zahlText(v)})` : zahlText(v));

/* ---------- Kreuzprodukt: exakte Zahlen (ganz, Bruch, Kommazahl, Wurzel) ---------- */
const KP_GRENZE = 100;                                                   // größter Betrag je Koordinate
const wKlammer = (z) => (z.length > 1 || wNegativ(z) ? `(${wText(z)})` : wText(z));
const wSkalar = (u, v) => u.reduce((s, x, i) => wAdd(s, wMul(x, v[i])), []);
const wKreuz = (u, v) => [wSub(wMul(u[1], v[2]), wMul(u[2], v[1])), wSub(wMul(u[2], v[0]), wMul(u[0], v[2])), wSub(wMul(u[0], v[1]), wMul(u[1], v[0]))];
const kpLies = (t) => t.map((s) => wLies(String(s).replace("−", "-")));

/* − und + wirken auf die nächste ganze Zahl: 3 → 4, ½ → 1 (oder 0), √5 ≈ 2,24 → 3 (oder 2) */
function naechsteGanze(wert, r) {
  const x = wNum(wert);
  let ziel = wGanz(wert) ? x + r : r > 0 ? Math.ceil(x) : Math.floor(x);
  ziel = Math.max(-KP_GRENZE, Math.min(KP_GRENZE, ziel)) + 0;
  return wZ(ziel);
}

/* Ein Eingabefeld für eine Koordinate. Schrift mindestens 16 px, sonst zoomt das iPhone beim Antippen die ganze Seite heran. */
function KpFeld({ name, nr, farbe, wert, setWert, meldeFehler }) {
  const text = wText(wert);
  const [entwurf, setEntwurf] = useState(null);       // null: das Feld zeigt den Wert
  const [fehler, setFehler] = useState(false);
  const [fokus, setFokus] = useState(false);
  const eigen = useRef(null);
  React.useEffect(() => {
    if (eigen.current === text) { eigen.current = null; return; }
    setEntwurf(null); setFehler(false); meldeFehler(false);
  }, [text]);
  const aendern = (e) => {
    const t = e.target.value;
    setEntwurf(t);
    if (t.trim() === "") { setFehler(false); meldeFehler(false); return; }
    const z = wLies(t);
    if (!z || Math.abs(wNum(z)) > KP_GRENZE) { setFehler(true); meldeFehler(true); return; }
    setFehler(false); meldeFehler(false); eigen.current = wText(z); setWert(z);
  };
  const verlassen = () => {
    setFokus(false); eigen.current = null;
    if (entwurf !== null && (entwurf.trim() === "" || !fehler)) { setEntwurf(null); setFehler(false); meldeFehler(false); }
  };
  return (
    <MatheFeld modus="wurzel" value={entwurf ?? text} onChange={aendern} onBlur={verlassen}
      onFocus={(e) => { setFokus(true); e.target.select(); }}
      onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
      aria-label={`${name}${nr}`} aria-invalid={fehler ? true : undefined}
      style={{ gridColumn: 3, width: "100%", minWidth: 0, height: 36, textAlign: "center", fontSize: 16, fontWeight: 800, fontFamily: "inherit", color: farbe,
        fontVariantNumeric: "tabular-nums", padding: "0 2px", borderRadius: 9, outline: "none",
        border: `1.5px solid ${fehler ? C.signal : fokus ? farbe : `${farbe}66`}`, background: fehler ? "#FCE8EE" : `${farbe}10`,
        boxShadow: fokus ? `0 0 0 3px ${farbe}26` : "none" }} />
  );
}

/* Ein Vektor: oben „a⃗ =“, darunter drei Zeilen aus − | Feld | + zwischen den Klammern */
function VektorEingabe({ name, farbe, werte, setWerte, ohneKopf = false }) {
  const [fehler, setFehler] = useState([false, false, false]);
  const knopf = (i, r, spalte) => (
    <button type="button" aria-label={`${name}${i + 1} ${r > 0 ? "+" : "−"}`} onClick={() => { const n = [...werte]; n[i] = naechsteGanze(werte[i], r); setWerte(n); }}
      style={{ gridColumn: spalte, gridRow: i + 1, width: "100%", height: 32, borderRadius: 9, border: `1.5px solid ${farbe}66`, background: `${farbe}14`, color: farbe,
        fontSize: 19, fontWeight: 800, fontFamily: "inherit", cursor: "pointer", padding: 0, lineHeight: 1, touchAction: "manipulation",
        display: "flex", alignItems: "center", justifyContent: "center" }}>{r > 0 ? "+" : "−"}</button>
  );
  const klammer = (links) => (
    <span aria-hidden="true" style={{ gridColumn: links ? 2 : 4, gridRow: "1 / 4", alignSelf: "stretch", color: farbe,
      [links ? "borderLeft" : "borderRight"]: "1.8px solid currentColor", borderTop: "1.8px solid currentColor", borderBottom: "1.8px solid currentColor",
      borderRadius: links ? "8px 0 0 8px" : "0 8px 8px 0" }} />
  );
  return (
    <div style={{ flex: 1, minWidth: 0, maxWidth: 210, margin: ohneKopf ? "0 auto" : undefined, width: ohneKopf ? "100%" : undefined }}>
      {!ohneKopf && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 8, fontSize: 18, fontWeight: 800, color: farbe }}>
          <VecName t={name} idx="" farbe={farbe} /><span>=</span>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 30px) 7px minmax(0, 1fr) 7px minmax(0, 30px)", gridTemplateRows: "repeat(3, 36px)", rowGap: 4, columnGap: 3, alignItems: "center" }}>
        {werte.map((w, i) => knopf(i, -1, 1))}
        {klammer(true)}
        {werte.map((w, i) => <KpFeld key={i} name={name} nr={i + 1} farbe={farbe} wert={w} meldeFehler={(f) => setFehler((alt) => (alt[i] === f ? alt : alt.map((x, k) => (k === i ? f : x))))}
          setWert={(z) => { const n = [...werte]; n[i] = z; setWerte(n); }} />)}
        {klammer(false)}
        {werte.map((w, i) => knopf(i, 1, 5))}
      </div>
      {fehler.some(Boolean) && <p role="alert" style={{ fontSize: 11.5, lineHeight: 1.35, color: C.signal, fontWeight: 600, margin: "6px 0 0", textAlign: "center" }}>Das kann ich so nicht lesen – probiere 2, 1/2, 0,5 oder √5 (bis 100).</p>}
    </div>
  );
}

// Passt die Schriftgröße so an, dass der Inhalt in eine Zeile passt
export function Einzeilig({ children, max = 17, min = 9 }) {
  const rahmen = useRef(null), innen = useRef(null);
  const [gr, setGr] = useState(max);
  React.useEffect(() => {
    const anpassen = () => {
      if (!rahmen.current || !innen.current) return;
      const platz = rahmen.current.clientWidth;
      const breite = innen.current.scrollWidth * (max / parseFloat(getComputedStyle(innen.current).fontSize));
      setGr(Math.max(min, Math.min(max, Math.floor((max * platz / breite) * 10) / 10)));
    };
    anpassen();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(anpassen) : null;
    if (ro && rahmen.current) ro.observe(rahmen.current);
    return () => { if (ro) ro.disconnect(); };
  });
  return (
    <div ref={rahmen} style={{ overflow: "hidden" }}>
      <div ref={innen} style={{ width: "max-content", margin: "0 auto", fontSize: gr, fontWeight: 700, color: C.tinte, whiteSpace: "nowrap",
        display: "flex", alignItems: "center", gap: "0.35em", fontVariantNumeric: "tabular-nums" }}>
        {children}
      </div>
    </div>
  );
}

const KP_BEISPIELE = [
  { name: "Einheitsvektoren", a: ["1", "0", "0"], b: ["0", "1", "0"] },
  { name: "Standard", a: ["2", "1", "3"], b: ["1", "−1", "2"] },
  { name: "Parallel", a: ["1", "2", "3"], b: ["2", "4", "6"] },
  { name: "Mit Kommazahlen", a: ["0,5", "2", "−1"], b: ["3", "−1,5", "4"] },
  { name: "Mit Wurzeln", a: ["√2", "1", "0"], b: ["√2", "−1", "2"] },
];

export function KreuzproduktRechner() {
  const [a, setA] = useState(() => kpLies(["2", "1", "3"]));
  const [b, setB] = useState(() => kpLies(["1", "−1", "2"]));
  const A = a, B = b;
  const k = wKreuz(A, B);
  const FA = C.see, FB = C.gruen, FE = "#8A6D00";
  const karte = { background: C.weiss, borderRadius: 16, padding: 18, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" };
  const titel = { fontSize: 13, fontWeight: 600, color: C.see, marginBottom: 10 };
  const va = (i) => <span style={{ color: FA }}>a<sub style={{ fontSize: "0.65em" }}>{i}</sub></span>;
  const vb = (i) => <span style={{ color: FB }}>b<sub style={{ fontSize: "0.65em" }}>{i}</sub></span>;
  const na = (i) => <span style={{ color: FA }}>{wKlammer(A[i])}</span>;
  const nb = (i) => <span style={{ color: FB }}>{wKlammer(B[i])}</span>;
  // Komponenten: (2,3), (3,1), (1,2)
  const paare = [[1, 2], [2, 0], [0, 1]];
  const allgemein = paare.map(([i, j], z) => <span key={z}>{va(i + 1)}{vb(j + 1)} − {va(j + 1)}{vb(i + 1)}</span>);
  const eingesetzt = paare.map(([i, j], z) => <span key={z}>{na(i)}·{nb(j)} − {na(j)}·{nb(i)}</span>);
  const ergebnis = k.map((v, z) => <span key={z} style={{ color: FE }}>{wText(v)}</span>);
  const laenge2 = wSkalar(k, k);
  const laenge = Math.sqrt(Math.max(0, wNum(laenge2)));
  const laengeGanz = wIstRational(laenge2) && Math.abs(laenge - Math.round(laenge)) < 1e-9;
  const parallel = k.every(wIstNull);
  const kreuzZeichen = <span style={{ whiteSpace: "nowrap" }}><VecName t="a" idx="" farbe={FA} /> × <VecName t="b" idx="" farbe={FB} /></span>;

  const beispiel = KP_BEISPIELE.find((x) => kpLies(x.a).map(wText).join() === A.map(wText).join() && kpLies(x.b).map(wText).join() === B.map(wText).join());
  const textFarbeB = "#8A6D00";

  return (
    <VekSeite titel="Kreuzprodukt auf einen Blick" text="Gib zwei Vektoren ein. Du siehst die Formel, die eingesetzten Zahlen und das Ergebnis – einen Vektor, der auf beiden senkrecht steht.">
      <ObjektReihe min={150}>
        <ObjektBox farbe={FA} name={<VecName t="a" idx="" farbe={C.weiss} />} art="Vektor">
          <VektorEingabe name="a" farbe={FA} werte={a} setWerte={setA} ohneKopf />
        </ObjektBox>
        <ObjektBox farbe={FB} name={<VecName t="b" idx="" farbe={C.weiss} />} art="Vektor">
          <VektorEingabe name="b" farbe={textFarbeB} werte={b} setWerte={setB} ohneKopf />
        </ObjektBox>
      </ObjektReihe>
      <p style={{ fontSize: 12.5, lineHeight: 1.5, color: C.grau, margin: "10px 2px 0" }}>
        − und + ändern die Zahl in ganzen Schritten. Tippe auf eine Zahl, um sie direkt einzugeben – auch als Bruch (1/2), Kommazahl (0,5) oder Wurzel (√5).
      </p>
      <div style={{ marginTop: 12 }}>
        <FallWahl titel="Beispiele" wert={beispiel ? beispiel.name : null} setWert={(name) => { const x = KP_BEISPIELE.find((y) => y.name === name); setA(kpLies(x.a)); setB(kpLies(x.b)); }}
          optionen={KP_BEISPIELE.map((x) => [x.name, x.name])} />
      </div>

      <Tafel titel="Rechnung">
        <Rechenweg>
          <RSchritt nr="1" titel="Formel">
            <Einzeilig max={16}>{kreuzZeichen}<span>=</span><SpaltenVektor farbe={C.tinte} eintraege={allgemein} /></Einzeilig>
          </RSchritt>
          <RSchritt nr="2" titel="Einsetzen und ausrechnen">
            <Einzeilig max={16}><span>=</span><SpaltenVektor farbe={C.tinte} eintraege={eingesetzt} /><span>=</span><SpaltenVektor farbe={FE} eintraege={ergebnis} /></Einzeilig>
          </RSchritt>
          <Ergebnis bild={<Bild art="kreuz" breite={44} />} art={parallel ? "warn" : "gut"}
            zusatz={parallel ? "Der Nullvektor: Die beiden Vektoren sind parallel (linear abhängig) und spannen keine Fläche auf." : null}>
            <Einzeilig max={17}>{kreuzZeichen}<span>=</span><SpaltenVektor farbe={C.smaragd} eintraege={k.map((v, z) => <span key={z}>{wText(v)}</span>)} /></Einzeilig>
          </Ergebnis>
        </Rechenweg>
      </Tafel>

      {!parallel && (
        <Tafel titel="Was das Ergebnis bedeutet">
          <div style={{ background: "#F5F7FB", border: `1px solid ${C.linie}`, borderRadius: 12, padding: "10px 10px" }}>
            <Einzeilig max={15.5}>
              <span>Probe:</span>
              <VecName t="a" idx="" farbe={FA} /><span>·</span><span>({kreuzZeichen})</span>
              <span>= {wText(wSkalar(A, k))}</span>
              <span style={{ margin: "0 0.4em", color: C.hellgrau }}>und</span>
              <VecName t="b" idx="" farbe={textFarbeB} /><span>·</span><span>({kreuzZeichen})</span>
              <span>= {wText(wSkalar(B, k))}</span>
            </Einzeilig>
          </div>
          <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, margin: "8px 0 14px" }}>
            Beide Skalarprodukte sind 0 – das Kreuzprodukt steht senkrecht auf <VecName t="a" idx="" farbe={FA} /> und auf <VecName t="b" idx="" farbe={textFarbeB} />. Deshalb liefert es zum Beispiel
            den Normalenvektor einer Ebene aus zwei Spannvektoren.
          </p>
          <div style={{ background: "#F5F7FB", border: `1px solid ${C.linie}`, borderRadius: 12, padding: "10px 10px" }}>
            <Einzeilig max={15.5}>
              <span>|{kreuzZeichen}|</span>
              <span>=</span>
              <Wurzel>{k.map((v) => `${wKlammer(v)}²`).join(" + ")}</Wurzel>
              <span>=</span>
              {laengeGanz ? <span>{Math.round(laenge)}</span> : <><Wurzel>{wText(laenge2)}</Wurzel><span>≈ {dez(laenge, 3)}</span></>}
            </Einzeilig>
          </div>
          <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, marginTop: 8 }}>
            Die Länge des Kreuzprodukts ist der Flächeninhalt des Parallelogramms, das <VecName t="a" idx="" farbe={FA} /> und <VecName t="b" idx="" farbe={textFarbeB} /> aufspannen – das Dreieck hat die Hälfte davon.
          </p>
        </Tafel>
      )}

      <Tafel titel="So merkst du dir die Formel">
        {[
          ["Zyklisch", "Die Indizes laufen im Kreis: Zeile 1 benutzt 2 und 3, Zeile 2 benutzt 3 und 1, Zeile 3 benutzt 1 und 2."],
          ["Über Kreuz", "Jede Zeile: „überkreuz multiplizieren, dann abziehen“ – erst von oben links nach unten rechts, dann umgekehrt."],
          ["Reihenfolge", <><VecName t="b" idx="" farbe={textFarbeB} /> × <VecName t="a" idx="" farbe={FA} /> = −(<VecName t="a" idx="" farbe={FA} /> × <VecName t="b" idx="" farbe={textFarbeB} />): Wer die Vektoren vertauscht, dreht das Ergebnis um.</>],
        ].map(([t, x]) => (
          <p key={t} style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, marginBottom: 6 }}>
            <b style={{ color: C.tinte }}>{t}:</b> {x}
          </p>
        ))}
      </Tafel>
    </VekSeite>
  );
}
