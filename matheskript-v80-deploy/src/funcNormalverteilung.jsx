/* ============================================================
   Stochastik: Normalverteilung (Bereich Stochastik, Station „Normalverteilung“)
   · Entdecken – fünf Stationen:
       1 Stetig        – vom Histogramm zur Glocke (Animation + Labor B(n; p) mit Glocke)
       2 Die Glocke    – Dichte φ_μ,σ herleiten (Animation + Labor μ, σ, Wendestellen)
       3 Fläche        – P als Fläche, Standardisieren, Φ (Animation + Labor a, b)
       4 Sigma-Regeln  – 68,3 / 95,4 / 99,7 % (Animation + Labor k)
       5 Anwenden      – rückwärts rechnen (Quantile), Binomial ≈ Normal, Taschenrechner
   · Üben – zehn Aufgabentypen mit Schritten, Denkfehler-Rückmeldung,
     „Ich hänge fest“ (Ablesen, Standardisieren, P(X ≤ x), P(X ≥ x),
     Intervall, Sigma-Regeln, Quantil, σ bestimmen, Binomial ≈ Normal, stetig).
   Mathematik in normal.js (getestet: tests/normal.test.mjs).
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */
import React, { useMemo, useState } from "react";
import { C } from "./base1.jsx";
import { GrosserKnopf, MS, hilfeKontext, karte, kicker, zw } from "./ui2.jsx";
import { Merke, Regler, UebenRahmen, WertZeile, ZweiModi, misch, ws, zs } from "./geoUi.jsx";
import { zt } from "./ui3.jsx";
import { NormalAnimation } from "./funcNormalAnimation.jsx";
import {
  KONTEXTE, NV_ARTEN, Phi, SIGMA_REGELN, TOL_P, TOL_Z, binomNaeherung, binomSigma, dichte, dz, maxHoehe, nvAufgabe, phi, quantil, vert, zwischen,
} from "./normal.js";

const z4 = (v) => zt(v, 4);
const z2 = (v) => zt(v, 2);
const pr = (v) => `${zt(v * 100, 1)} %`;
const P = ({ children }) => <p style={{ fontSize: 15, fontWeight: 300, color: C.grau, lineHeight: 1.75, margin: "12px 0 0" }}><MS s={children} /></p>;
const einheitVon = (k) => (typeof k.einheit === "string" ? k.einheit : zw(k.einheit.de, k.einheit.en));

/* ======================================================================
   Grafik: Glockenkurve in echten Einheiten
   flaechen: [{ a, b, farbe }], marken: [{ x, text, farbe }], ticks: [{ x, text }]
   ====================================================================== */
export function GlockenBild({ mu, s, flaechen = [], marken = [], ticks, wende = false, hoch = false, hoehe = 200, label, ymax }) {
  const W = 340, L = 12, R = 12, B = hoehe - 34, TOP = 16;
  const x0 = mu - 3.8 * s, x1 = mu + 3.8 * s;
  const X = (v) => L + ((v - x0) / (x1 - x0)) * (W - L - R);
  const ym = ymax ?? maxHoehe(s);
  const Yp = (d) => B - (d / ym) * (B - TOP);
  const pfad = (a, b) => {
    const pts = [];
    for (let i = 0; i <= 120; i++) { const v = a + ((b - a) * i) / 120; pts.push(`${X(v).toFixed(1)},${Yp(dichte(v, mu, s)).toFixed(1)}`); }
    return pts;
  };
  const kurve = `M${pfad(x0, x1).join(" L")}`;
  const tk = ticks || [-3, -2, -1, 0, 1, 2, 3].map((k) => ({ x: mu + k * s, text: dz(mu + k * s) }));
  return (
    <svg viewBox={`0 0 ${W} ${hoehe}`} role="img" aria-label={label || zw("Glockenkurve", "Bell curve")} style={{ width: "100%", display: "block" }}>
      {flaechen.map((f, i) => {
        const a = Math.max(x0, f.a), b = Math.min(x1, f.b);
        if (b - a <= 1e-9) return null;
        return <path key={i} d={`M${X(a)},${B} L${pfad(a, b).join(" L")} L${X(b)},${B} Z`} fill={`${f.farbe || C.flaggold}55`} stroke={f.farbe || C.flaggold} strokeWidth="1.2" />;
      })}
      <line x1={L} y1={B} x2={W - R} y2={B} stroke={C.hellgrau} strokeWidth="1.4" />
      <path d={kurve} fill="none" stroke={C.see} strokeWidth="2.8" strokeLinecap="round" />
      {tk.map((t, i) => (
        <g key={i}>
          <line x1={X(t.x)} y1={B - 4} x2={X(t.x)} y2={B + 4} stroke={C.hellgrau} strokeWidth="1.2" />
          <text x={X(t.x)} y={B + 17} textAnchor="middle" style={{ fontSize: 10.5, fontWeight: 600, fill: C.grau, fontFamily: "inherit" }}>{t.text}</text>
        </g>
      ))}
      {hoch && (
        <g>
          <line x1={X(mu)} y1={Yp(maxHoehe(s))} x2={X(mu)} y2={B} stroke={C.gruen} strokeWidth="1.4" strokeDasharray="4 3" />
          <circle cx={X(mu)} cy={Yp(maxHoehe(s))} r="4.6" fill={C.gruen} />
        </g>
      )}
      {wende && [-1, 1].map((d) => (
        <g key={d}>
          <line x1={X(mu + d * s)} y1={Yp(dichte(mu + d * s, mu, s))} x2={X(mu + d * s)} y2={B} stroke={C.signal} strokeWidth="1.2" strokeDasharray="4 3" />
          <circle cx={X(mu + d * s)} cy={Yp(dichte(mu + d * s, mu, s))} r="4.4" fill={C.weiss} stroke={C.signal} strokeWidth="2" />
        </g>
      ))}
      {marken.map((m, i) => (
        <g key={`m${i}`}>
          <line x1={X(m.x)} y1={TOP} x2={X(m.x)} y2={B} stroke={m.farbe || C.tinte} strokeWidth="1.4" strokeDasharray="3 3" />
          {m.text && <text x={X(m.x)} y={B + 30} textAnchor="middle" style={{ fontSize: 11, fontWeight: 800, fill: m.farbe || C.tinte, fontFamily: "inherit" }}>{m.text}</text>}
        </g>
      ))}
    </svg>
  );
}

/* ======================================================================
   ENTDECKEN
   ====================================================================== */
const STATIONEN = [
  { id: "stetig", zeichen: "▥", titel: () => zw("Vom Histogramm zur Glocke", "From histogram to bell") },
  { id: "glocke", zeichen: "φ", titel: () => zw("Die Gaußsche Glockenkurve", "The Gaussian bell curve") },
  { id: "flaeche", zeichen: "Φ", titel: () => zw("Wahrscheinlichkeit = Fläche", "Probability = area") },
  { id: "sigma", zeichen: "σ", titel: () => zw("Die Sigma-Regeln", "The sigma rules") },
  { id: "anwenden", zeichen: "↺", titel: () => zw("Rückwärts rechnen und annähern", "Working backwards and approximating") },
];

function StationKopf({ nr, zeichen, titel, leitfrage }) {
  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span aria-hidden="true" style={{ flexShrink: 0, width: 54, height: 54, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 800, color: C.weiss,
          background: `linear-gradient(135deg, ${C.seeTief}, ${C.see})`, boxShadow: `inset 0 0 0 1.5px ${C.flaggold}` }}>{zeichen}</span>
        <div style={{ minWidth: 0 }}>
          <p style={{ ...kicker, marginBottom: 2 }}>{zw("Station", "Station")} {nr} {zw("von", "of")} 5</p>
          <p style={{ fontSize: 19, fontWeight: 700, color: C.tinte, margin: 0, lineHeight: 1.25 }}>{titel}</p>
        </div>
      </div>
      <h3 style={{ fontSize: 21, fontWeight: 700, color: C.see, lineHeight: 1.3, margin: "16px 0 0", letterSpacing: "-0.01em" }}>{leitfrage}</h3>
    </div>
  );
}

/* Labor 1: Binomialverteilung mit passender Glocke */
function LaborHistogramm() {
  const [n, setN] = useState(20);
  const [p, setP] = useState(0.3);
  const mu = n * p, s = binomSigma(n, p);
  const t = useMemo(() => {
    const out = []; let ln = 0;
    for (let k = 0; k <= n; k++) { if (k > 0) ln += Math.log(n - k + 1) - Math.log(k); out.push(Math.exp(ln + k * Math.log(p) + (n - k) * Math.log(1 - p))); }
    return out;
  }, [n, p]);
  const von = Math.max(0, Math.floor(mu - 4.2 * s)), bis = Math.min(n, Math.ceil(mu + 4.2 * s));
  const W = 340, H = 200, L = 12, R = 12, B = 168, TOP = 14;
  const xa = von - 0.5, xb = bis + 0.5;
  const X = (v) => L + ((v - xa) / (xb - xa)) * (W - L - R);
  const ym = Math.max(...t.slice(von, bis + 1), dichte(mu, mu, s)) * 1.05;
  const Yp = (d) => B - (d / ym) * (B - TOP);
  const pts = [];
  for (let i = 0; i <= 140; i++) { const v = xa + ((xb - xa) * i) / 140; pts.push(`${X(v).toFixed(1)},${Yp(dichte(v, mu, s)).toFixed(1)}`); }
  const schritt = Math.max(1, Math.ceil((bis - von) / 8));
  const ok = s > 3;
  return (
    <div style={{ ...karte, marginTop: 14 }} data-labor="histogramm">
      <p style={{ fontSize: 13, fontWeight: 600, color: C.see, margin: "0 0 10px" }}>{zw("Zieh an n und p und beobachte, wie gut die Glocke auf die Balken passt.", "Drag n and p and watch how well the bell fits the bars.")}</p>
      <div style={{ display: "grid", gap: 8 }}>
        <Regler name="n" wert={n} setWert={setN} min={5} max={200} schritt={5} format={(v) => zt(v, 0)} />
        <Regler name="p" wert={p} setWert={setP} min={0.05} max={0.95} schritt={0.05} farbe={C.gruen} format={(v) => zt(v, 2)} />
      </div>
      <div style={{ marginTop: 12, background: C.sand, borderRadius: 14, padding: 6 }}>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={zw(`Histogramm von B(${n}; ${zt(p, 2)}) mit Glockenkurve`, `Histogram of B(${n}; ${zt(p, 2)}) with bell curve`)} style={{ width: "100%", display: "block" }}>
          {t.slice(von, bis + 1).map((pk, i) => {
            const k = von + i, w = X(k + 0.5) - X(k - 0.5);
            return <rect key={k} x={X(k - 0.5) + 0.4} y={Yp(pk)} width={Math.max(0.5, w - 0.8)} height={B - Yp(pk)} fill={`${C.see}30`} stroke={C.see} strokeWidth="0.7" />;
          })}
          <line x1={L} y1={B} x2={W - R} y2={B} stroke={C.hellgrau} strokeWidth="1.4" />
          <path d={`M${pts.join(" L")}`} fill="none" stroke={C.gruen} strokeWidth="2.6" />
          {Array.from({ length: bis - von + 1 }, (_, i) => von + i).filter((k) => (k - von) % schritt === 0).map((k) => (
            <text key={k} x={X(k)} y={B + 16} textAnchor="middle" style={{ fontSize: 10.5, fontWeight: 600, fill: C.grau, fontFamily: "inherit" }}>{k}</text>
          ))}
        </svg>
      </div>
      <WertZeile links={zw("Erwartungswert μ = n · p", "Mean μ = n · p")} rechts={zt(mu, 2)} />
      <WertZeile links={<MS s={zw("Standardabweichung $\\sigma = \\sqrt{n \\cdot p \\cdot (1 - p)}$", "Standard deviation $\\sigma = \\sqrt{n \\cdot p \\cdot (1 - p)}$")} />} rechts={z2(s)} />
      <WertZeile links={zw("Laplace-Bedingung σ > 3", "Laplace condition σ > 3")} rechts={ok ? zw("erfüllt ✓", "met ✓") : zw("nicht erfüllt", "not met")} farbe={ok ? C.smaragd : C.signal} />
      <Merke farbe={ok ? C.smaragd : C.signal}>{ok
        ? zw("Die Glocke liegt fast genau auf den Balken. Ab σ > 3 darf man die Binomialverteilung durch die Normalverteilung mit demselben μ und σ ersetzen.", "The bell lies almost exactly on the bars. From σ > 3 on you may replace the binomial distribution by the normal distribution with the same μ and σ.")
        : zw("Noch zu schief oder zu schmal: Bei σ ≤ 3 weicht die Glocke sichtbar von den Balken ab. Erhöhe n oder bring p näher an 0,5.", "Still too skewed or too narrow: with σ ≤ 3 the bell visibly deviates from the bars. Increase n or bring p closer to 0.5.")}</Merke>
    </div>
  );
}

/* Labor 2: μ und σ */
function LaborParameter() {
  const [mu, setMu] = useState(0);
  const [s, setS] = useState(1);
  return (
    <div style={{ ...karte, marginTop: 14 }} data-labor="parameter">
      <p style={{ fontSize: 13, fontWeight: 600, color: C.see, margin: "0 0 10px" }}>{zw("Verändere μ und σ. Achte auf Hochpunkt, Wendepunkte und Höhe.", "Change μ and σ. Watch the peak, the inflection points and the height.")}</p>
      <div style={{ display: "grid", gap: 8 }}>
        <Regler name="μ" wert={mu} setWert={setMu} min={-3} max={3} schritt={0.5} farbe={C.gruen} />
        <Regler name="σ" wert={s} setWert={setS} min={0.5} max={2.5} schritt={0.1} />
      </div>
      <div style={{ marginTop: 12, background: C.sand, borderRadius: 14, padding: 6 }}>
        <ParamBild mu={mu} s={s} />
      </div>
      <WertZeile links={zw("Hochpunkt bei x = μ", "Peak at x = μ")} rechts={zt(mu, 1)} farbe={C.gruenDunkel} />
      <WertZeile links={<MS s={zw("Höhe $\\frac{1}{\\sigma\\sqrt{2\\pi}}$", "Height $\\frac{1}{\\sigma\\sqrt{2\\pi}}$")} />} rechts={zt(maxHoehe(s), 3)} />
      <WertZeile links={zw("Wendestellen μ − σ und μ + σ", "Inflection points μ − σ and μ + σ")} rechts={`${zt(mu - s, 1)} | ${zt(mu + s, 1)}`} farbe={C.signal} />
      <WertZeile links={zw("Fläche unter der Kurve", "Area under the curve")} rechts="1" farbe={C.smaragd} />
    </div>
  );
}
/* Fester Ausschnitt −6 … 6, damit Verschieben und Strecken sichtbar werden */
function ParamBild({ mu, s }) {
  const W = 340, H = 210, L = 12, R = 12, B = 176, TOP = 12, x0 = -6, x1 = 6;
  const X = (v) => L + ((v - x0) / (x1 - x0)) * (W - L - R);
  const ym = maxHoehe(0.5) * 1.02;
  const Yp = (d) => B - (d / ym) * (B - TOP);
  const pts = [];
  for (let i = 0; i <= 200; i++) { const v = x0 + ((x1 - x0) * i) / 200; pts.push(`${X(v).toFixed(1)},${Yp(dichte(v, mu, s)).toFixed(1)}`); }
  const yw = Yp(dichte(mu + s, mu, s));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={zw(`Glockenkurve mit μ = ${zt(mu, 1)} und σ = ${zt(s, 1)}`, `Bell curve with μ = ${zt(mu, 1)} and σ = ${zt(s, 1)}`)} style={{ width: "100%", display: "block" }}>
      <path d={`M${X(x0)},${B} L${pts.join(" L")} L${X(x1)},${B} Z`} fill={`${C.see}12`} />
      <line x1={L} y1={B} x2={W - R} y2={B} stroke={C.hellgrau} strokeWidth="1.4" />
      {[-6, -4, -2, 0, 2, 4, 6].map((v) => (
        <g key={v}><line x1={X(v)} y1={B - 4} x2={X(v)} y2={B + 4} stroke={C.hellgrau} /><text x={X(v)} y={B + 17} textAnchor="middle" style={{ fontSize: 10.5, fill: C.grau, fontWeight: 600, fontFamily: "inherit" }}>{zt(v, 0)}</text></g>
      ))}
      <path d={`M${pts.join(" L")}`} fill="none" stroke={C.see} strokeWidth="2.8" />
      <line x1={X(mu)} y1={Yp(maxHoehe(s))} x2={X(mu)} y2={B} stroke={C.gruen} strokeWidth="1.4" strokeDasharray="4 3" />
      <circle cx={X(mu)} cy={Yp(maxHoehe(s))} r="4.6" fill={C.gruen} />
      {[-1, 1].map((d) => <circle key={d} cx={X(mu + d * s)} cy={yw} r="4.4" fill={C.weiss} stroke={C.signal} strokeWidth="2" />)}
      <line x1={X(mu)} y1={yw + 16} x2={X(mu + s)} y2={yw + 16} stroke={C.tinte} strokeWidth="1.4" />
      <text x={(X(mu) + X(mu + s)) / 2} y={yw + 12} textAnchor="middle" style={{ fontSize: 12, fontWeight: 800, fill: C.tinte, fontFamily: "inherit" }}>σ</text>
    </svg>
  );
}

/* Labor 3: P(a ≤ X ≤ b) am Beispiel Körpergröße */
function LaborFlaeche() {
  const mu = 176, s = 7;
  const [a, setA] = useState(169);
  const [b, setB] = useState(183);
  const lo = Math.min(a, b), hi = Math.max(a, b);
  const za = (lo - mu) / s, zb = (hi - mu) / s;
  return (
    <div style={{ ...karte, marginTop: 14 }} data-labor="flaeche">
      <p style={{ fontSize: 13, fontWeight: 600, color: C.see, margin: "0 0 10px" }}>{zw("Körpergröße X mit μ = 176 cm und σ = 7 cm. Verschiebe die Grenzen a und b.", "Height X with μ = 176 cm and σ = 7 cm. Move the bounds a and b.")}</p>
      <div style={{ display: "grid", gap: 8 }}>
        <Regler name="a" wert={a} setWert={setA} min={150} max={202} schritt={1} format={(v) => `${zt(v, 0)} cm`} breiteName={20} />
        <Regler name="b" wert={b} setWert={setB} min={150} max={202} schritt={1} farbe={C.gruen} format={(v) => `${zt(v, 0)} cm`} breiteName={20} />
      </div>
      <div style={{ marginTop: 12, background: C.sand, borderRadius: 14, padding: 6 }}>
        <GlockenBild mu={mu} s={s} flaechen={[{ a: lo, b: hi, farbe: C.flaggold }]} marken={[{ x: lo, text: "a", farbe: C.see }, { x: hi, text: "b", farbe: C.gruenDunkel }]} hoehe={216} />
      </div>
      <WertZeile links={<MS s={zw(`$z_a = \\frac{${lo} - 176}{7}$`, `$z_a = \\frac{${lo} - 176}{7}$`)} />} rechts={z2(za)} />
      <WertZeile links={<MS s={`$z_b = \\frac{${hi} - 176}{7}$`} />} rechts={z2(zb)} />
      <WertZeile links={<MS s={"$\\Phi(z_b) - \\Phi(z_a)$"} />} rechts={`${z4(Phi(zb))} − ${z4(Phi(za))}`} blass />
      <WertZeile links={`P(${lo} ≤ X ≤ ${hi})`} rechts={`≈ ${z4(zwischen(lo, hi, mu, s))}`} farbe={C.gruenDunkel} />
    </div>
  );
}

/* Labor 4: P(μ − kσ ≤ X ≤ μ + kσ) */
function LaborSigma() {
  const [k, setK] = useState(1);
  const p = zwischen(-k, k);
  return (
    <div style={{ ...karte, marginTop: 14 }} data-labor="sigma">
      <p style={{ fontSize: 13, fontWeight: 600, color: C.see, margin: "0 0 10px" }}>{zw("Wie viel Prozent liegen höchstens k Standardabweichungen von μ entfernt?", "What percentage lies at most k standard deviations from μ?")}</p>
      <Regler name="k" wert={k} setWert={setK} min={0.25} max={3.5} schritt={0.25} format={(v) => zt(v, 2)} breiteName={20} />
      <div style={{ marginTop: 12, background: C.sand, borderRadius: 14, padding: 6 }}>
        <GlockenBild mu={0} s={1} flaechen={[{ a: -k, b: k, farbe: C.smaragd }]} ticks={[-3, -2, -1, 0, 1, 2, 3].map((v) => ({ x: v, text: v === 0 ? "μ" : `${v > 0 ? "μ+" : "μ−"}${Math.abs(v) === 1 ? "" : Math.abs(v)}σ` }))} />
      </div>
      <WertZeile links={`P(μ − ${zt(k, 2)}σ ≤ X ≤ μ + ${zt(k, 2)}σ)`} rechts={pr(p)} farbe={C.smaragd} />
      <WertZeile links={zw("außerhalb (beide Ränder)", "outside (both tails)")} rechts={pr(1 - p)} farbe={C.signal} />
    </div>
  );
}

/* Labor 5: Quantil – welcher Wert wird mit Wahrscheinlichkeit p unterschritten? */
function LaborQuantil() {
  const [p, setP] = useState(0.9);
  const mu = 500, s = 4, zp = quantil(p);
  return (
    <div style={{ ...karte, marginTop: 14 }} data-labor="quantil">
      <p style={{ fontSize: 13, fontWeight: 600, color: C.see, margin: "0 0 10px" }}>{zw("Füllmenge X mit μ = 500 ml und σ = 4 ml. Welche Menge wird mit Wahrscheinlichkeit p nicht überschritten?", "Filling amount X with μ = 500 ml and σ = 4 ml. Which amount is not exceeded with probability p?")}</p>
      <Regler name="p" wert={p} setWert={setP} min={0.05} max={0.99} schritt={0.01} format={(v) => zt(v, 2)} breiteName={20} />
      <div style={{ marginTop: 12, background: C.sand, borderRadius: 14, padding: 6 }}>
        <GlockenBild mu={mu} s={s} flaechen={[{ a: mu - 4 * s, b: mu + zp * s, farbe: C.flaggold }]} marken={[{ x: mu + zp * s, text: `x ≈ ${zt(mu + zp * s, 1)}`, farbe: C.gruenDunkel }]} hoehe={216} />
      </div>
      <WertZeile links={<MS s={zw("$z$ mit $\\Phi(z) = p$ (Umkehrung von Φ)", "$z$ with $\\Phi(z) = p$ (inverse of Φ)")} />} rechts={z2(zp)} />
      <WertZeile links={<MS s={"$x = \\mu + z \\cdot \\sigma$"} />} rechts={`${zt(mu + zp * s, 2)} ml`} farbe={C.gruenDunkel} />
    </div>
  );
}

function Entdecken({ gehe }) {
  const [st, setSt] = useState(0);
  const s = STATIONEN[st];
  const weiter = (
    <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
      {st > 0 && <div style={{ flex: "0 0 36%" }}><GrosserKnopf ghost onClick={() => { setSt(st - 1); window.scrollTo(0, 0); }}>← {STATIONEN[st - 1].zeichen}</GrosserKnopf></div>}
      {st < 4 && <div style={{ flex: 1 }}><GrosserKnopf onClick={() => { setSt(st + 1); window.scrollTo(0, 0); }}>{zw("Weiter:", "Next:")} {STATIONEN[st + 1].titel()} →</GrosserKnopf></div>}
    </div>
  );
  return (
    <div>
      <div role="tablist" aria-label={zw("Stationen", "Stations")} style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 6, marginTop: 16 }}>
        {STATIONEN.map((x, i) => {
          const an = i === st;
          return (
            <button key={x.id} type="button" role="tab" aria-selected={an} aria-label={x.titel()} onClick={() => setSt(i)}
              style={{ height: 48, borderRadius: 12, fontFamily: "inherit", fontSize: 20, fontWeight: 800, cursor: "pointer",
                border: `1.5px solid ${an ? C.see : C.linie}`, background: an ? C.see : C.weiss, color: an ? C.weiss : C.see }}>{x.zeichen}</button>
          );
        })}
      </div>

      {s.id === "stetig" && (
        <>
          <StationKopf nr={1} zeichen={s.zeichen} titel={s.titel()} leitfrage={zw("Was passiert mit der Binomialverteilung, wenn n groß wird?", "What happens to the binomial distribution as n grows?")} />
          <NormalAnimation art="glocke" offen />
          <P>{zw("Bei der Binomialverteilung zählt man Treffer: X nimmt nur die Werte 0, 1, …, n an, und jede Wahrscheinlichkeit ist die Fläche eines Balkens der Breite 1. Wird n größer, wandert die Verteilung nach rechts (μ = n · p) und wird breiter (σ = √(n · p · (1 − p))). Rückt man die Mitte auf 0 und misst in Vielfachen von σ, landen alle Histogramme auf derselben Kurve.", "In a binomial distribution you count hits: X only takes the values 0, 1, …, n, and every probability is the area of a bar of width 1. As n grows, the distribution moves to the right (μ = n · p) and gets wider (σ = √(n · p · (1 − p))). If you move the centre to 0 and measure in multiples of σ, all histograms land on the same curve.")}</P>
          <P>{zw("Viele Größen in der Natur und in der Technik verhalten sich genauso: Körpergröße, Messfehler, Füllmengen. Sie entstehen aus vielen kleinen, unabhängigen Einflüssen – wie die Summe vieler Münzwürfe. Solche Zufallsgrößen können jeden Wert in einem Intervall annehmen. Man nennt sie stetig.", "Many quantities in nature and technology behave the same way: height, measurement errors, filling amounts. They arise from many small, independent influences – like the sum of many coin tosses. Such random variables can take any value in an interval. They are called continuous.")}</P>
          <LaborHistogramm />
          <Merke>{zw("Stetige Zufallsgröße: Wahrscheinlichkeiten sind Flächen unter der Dichtekurve. Ein einzelner Wert hat die Wahrscheinlichkeit 0, deshalb gilt P(X < a) = P(X ≤ a).", "Continuous random variable: probabilities are areas under the density curve. A single value has probability 0, so P(X < a) = P(X ≤ a).")}</Merke>
        </>
      )}

      {s.id === "glocke" && (
        <>
          <StationKopf nr={2} zeichen={s.zeichen} titel={s.titel()} leitfrage={zw("Welche Funktion beschreibt die Glocke?", "Which function describes the bell?")} />
          <NormalAnimation art="parameter" offen />
          <P>{zw("Wir brauchen eine Kurve, die bei μ am höchsten ist, symmetrisch abfällt und nach außen schnell gegen 0 geht. Genau das leistet $e^{-x^2}$: Für $x = 0$ ist der Wert 1, für große $|x|$ wird er winzig – schneller als jede Potenz von $x$.", "We need a curve that is highest at μ, falls symmetrically and quickly approaches 0 towards the outside. That is exactly what $e^{-x^2}$ does: for $x = 0$ the value is 1, for large $|x|$ it becomes tiny – faster than any power of $x$.")}</P>
          <P>{zw("Ersetzen wir $x$ durch $\\frac{x - \\mu}{\\sigma}$, wird die Glocke um μ verschoben und um den Faktor σ in die Breite gestreckt. Der Faktor $\\frac{1}{2}$ im Exponenten sorgt dafür, dass die Wendestellen genau bei $\\mu \\pm \\sigma$ liegen.", "Replacing $x$ by $\\frac{x - \\mu}{\\sigma}$ shifts the bell by μ and stretches it by the factor σ. The factor $\\frac{1}{2}$ in the exponent makes the inflection points lie exactly at $\\mu \\pm \\sigma$.")}</P>
          <P>{zw("Die Gesamtfläche muss 1 sein – sie ist ja die Wahrscheinlichkeit, dass überhaupt irgendein Wert herauskommt. Gauß hat gezeigt: $\\int e^{-\\frac{1}{2}x^2}\\,dx = \\sqrt{2\\pi}$ über ganz ℝ. Deshalb teilt man durch $\\sigma\\sqrt{2\\pi}$.", "The total area must be 1 – it is the probability that any value at all comes out. Gauss showed: $\\int e^{-\\frac{1}{2}x^2}\\,dx = \\sqrt{2\\pi}$ over all of ℝ. That is why we divide by $\\sigma\\sqrt{2\\pi}$.")}</P>
          <div style={{ ...karte, marginTop: 14, textAlign: "center", fontSize: 18 }}>
            <MS s={"$\\varphi_{\\mu,\\sigma}(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} \\cdot e^{-\\frac{1}{2}\\left(\\frac{x - \\mu}{\\sigma}\\right)^2}$"} />
          </div>
          <LaborParameter />
          <Merke>{zw("μ: Lage des Hochpunkts (Erwartungswert). σ: Abstand vom Hochpunkt zu den Wendestellen (Standardabweichung). Je größer σ, desto breiter und flacher die Glocke – die Fläche bleibt 1.", "μ: position of the peak (mean). σ: distance from the peak to the inflection points (standard deviation). The larger σ, the wider and flatter the bell – the area stays 1.")}</Merke>
        </>
      )}

      {s.id === "flaeche" && (
        <>
          <StationKopf nr={3} zeichen={s.zeichen} titel={s.titel()} leitfrage={zw("Wie berechnet man eine Fläche, deren Stammfunktion niemand hinschreiben kann?", "How do you compute an area whose antiderivative nobody can write down?")} />
          <NormalAnimation art="flaeche" offen />
          <P>{zw("$P(a \\le X \\le b) = \\int_a^b \\varphi_{\\mu,\\sigma}(x)\\,dx$. Diese Stammfunktion lässt sich nicht mit bekannten Funktionen schreiben. Man rechnet deshalb alles auf eine einzige Verteilung um: die Standardnormalverteilung mit $\\mu = 0$ und $\\sigma = 1$. Ihre Verteilungsfunktion heißt Φ und steht in jeder Tabelle und jedem Taschenrechner.", "$P(a \\le X \\le b) = \\int_a^b \\varphi_{\\mu,\\sigma}(x)\\,dx$. This antiderivative cannot be written with known functions. So everything is converted to one single distribution: the standard normal distribution with $\\mu = 0$ and $\\sigma = 1$. Its distribution function is called Φ and is in every table and every calculator.")}</P>
          <div style={{ ...karte, marginTop: 14 }}>
            <p style={kicker}>{zw("Die drei Grundformeln", "The three basic formulas")}</p>
            <div style={{ display: "grid", gap: 8, fontSize: 15.5, color: C.tinte }}>
              <MS s={"$z = \\frac{x - \\mu}{\\sigma}$"} />
              <MS s={zw("$P(X \\le x) = \\Phi(z)$, $\\quad P(X \\ge x) = 1 - \\Phi(z)$", "$P(X \\le x) = \\Phi(z)$, $\\quad P(X \\ge x) = 1 - \\Phi(z)$")} />
              <MS s={"$P(a \\le X \\le b) = \\Phi(z_b) - \\Phi(z_a)$"} />
            </div>
          </div>
          <LaborFlaeche />
          <Merke>{zw("Mit dem Taschenrechner geht es ohne Standardisieren: normalcdf(a, b, μ, σ). Für „höchstens x“ setzt man a sehr klein (z. B. −10⁹⁹), für „mindestens x“ b sehr groß. Wegen der Symmetrie gilt Φ(−z) = 1 − Φ(z).", "With a calculator you can skip standardising: normalcdf(a, b, μ, σ). For “at most x” set a very small (e.g. −10⁹⁹), for “at least x” set b very large. By symmetry Φ(−z) = 1 − Φ(z).")}</Merke>
        </>
      )}

      {s.id === "sigma" && (
        <>
          <StationKopf nr={4} zeichen={s.zeichen} titel={s.titel()} leitfrage={zw("Welche Werte sind „normal“, welche ungewöhnlich?", "Which values are “normal”, which are unusual?")} />
          <NormalAnimation art="sigma" offen />
          <P>{zw("Weil jede Normalverteilung durch Standardisieren zur selben Kurve wird, hängt der Anteil im Intervall $[\\mu - k\\sigma;\\, \\mu + k\\sigma]$ nur von k ab: $P = \\Phi(k) - \\Phi(-k) = 2\\Phi(k) - 1$. Drei Werte sollte man auswendig kennen.", "Because every normal distribution becomes the same curve after standardising, the share in the interval $[\\mu - k\\sigma;\\, \\mu + k\\sigma]$ depends only on k: $P = \\Phi(k) - \\Phi(-k) = 2\\Phi(k) - 1$. You should know three values by heart.")}</P>
          <div style={{ ...karte, marginTop: 14, padding: 0, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, color: C.tinte }}>
              <thead><tr style={{ background: C.sand }}>{[zw("Intervall", "Interval"), zw("Anteil", "Share")].map((h) => <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 12, color: C.grau }}>{h}</th>)}</tr></thead>
              <tbody>
                {[...SIGMA_REGELN.map((r) => [`μ ± ${r.k === 1 ? "" : r.k}σ`, zw(r.prozent, r.prozent.replace(",", "."))]), ["μ ± 1,64σ", "90 %"], ["μ ± 1,96σ", "95 %"], ["μ ± 2,58σ", "99 %"]].map(([a, b]) => (
                  <tr key={a} style={{ borderTop: `1px solid ${C.linie}` }}><td style={{ padding: "9px 12px", fontWeight: 700 }}>{zw(a, a.replace(",", "."))}</td><td style={{ padding: "9px 12px", fontWeight: 800, color: C.smaragd }}>{b}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <LaborSigma />
          <Merke>{zw("Faustregel: Ein Wert außerhalb von μ ± 2σ kommt nur in etwa 5 % der Fälle vor – er ist auffällig. Genau diese Idee steckt im Hypothesentest.", "Rule of thumb: a value outside μ ± 2σ occurs in only about 5 % of cases – it is conspicuous. Exactly this idea is behind the hypothesis test.")}</Merke>
        </>
      )}

      {s.id === "anwenden" && (
        <>
          <StationKopf nr={5} zeichen={s.zeichen} titel={s.titel()} leitfrage={zw("Gegeben ist die Wahrscheinlichkeit – gesucht der Wert. Wie geht es rückwärts?", "The probability is given – the value is wanted. How do you go backwards?")} />
          <P>{zw("Oft ist die Frage umgekehrt: Welche Füllmenge wird nur von 10 % der Flaschen unterschritten? Wie groß darf σ sein, damit höchstens 5 % der Schrauben zu lang sind? Dann sucht man zuerst das z mit $\\Phi(z) = p$ (Taschenrechner: invNorm) und rechnet zurück: $x = \\mu + z \\cdot \\sigma$ bzw. $\\sigma = \\frac{x - \\mu}{z}$.", "Often the question is reversed: which filling amount is undercut by only 10 % of the bottles? How large may σ be so that at most 5 % of the screws are too long? Then you first look for the z with $\\Phi(z) = p$ (calculator: invNorm) and calculate back: $x = \\mu + z \\cdot \\sigma$ or $\\sigma = \\frac{x - \\mu}{z}$.")}</P>
          <LaborQuantil />
          <div style={{ ...karte, marginTop: 14 }}>
            <p style={kicker}>{zw("Binomialverteilung annähern", "Approximating the binomial distribution")}</p>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: C.tinte }}><MS s={zw("Ist X binomialverteilt mit $\\sigma = \\sqrt{n p (1 - p)} > 3$, gilt näherungsweise $P(X \\le k) \\approx \\Phi\\left(\\frac{k + 0{,}5 - \\mu}{\\sigma}\\right)$. Die $+0{,}5$ ist die Stetigkeitskorrektur: Der Balken über k reicht von $k - 0{,}5$ bis $k + 0{,}5$, und er soll ganz mitgezählt werden.", "If X is binomially distributed with $\\sigma = \\sqrt{n p (1 - p)} > 3$, approximately $P(X \\le k) \\approx \\Phi\\left(\\frac{k + 0.5 - \\mu}{\\sigma}\\right)$. The $+0.5$ is the continuity correction: the bar above k reaches from $k - 0.5$ to $k + 0.5$, and it should be counted completely.")} /></p>
            <WertZeile links={zw("Beispiel: n = 200, p = 0,3, P(X ≤ 65)", "Example: n = 200, p = 0.3, P(X ≤ 65)")} rechts={`≈ ${z4(binomNaeherung(200, 0.3, 65))}`} farbe={C.gruenDunkel} />
          </div>
          <div style={{ ...karte, marginTop: 14, borderLeft: `4px solid ${C.flaggold}` }}>
            <p style={kicker}>{zw("Weiter in der Stochastik", "Continue in stochastics")}</p>
            <p style={{ margin: "0 0 4px", fontSize: 14, lineHeight: 1.65, color: C.tinte }}>{zw("Die Glocke steckt in der Binomialverteilung und im Hypothesentest: Der Ablehnungsbereich liegt dort, wo die Glocke fast keine Fläche mehr hat.", "The bell is inside the binomial distribution and the hypothesis test: the rejection region lies where the bell has almost no area left.")}</p>
            <GrosserKnopf ghost onClick={() => gehe && gehe({ ansicht: "bernoulli" })}>{zw("Binomialverteilung ansehen", "Look at the binomial distribution")}</GrosserKnopf>
            <GrosserKnopf ghost onClick={() => gehe && gehe({ ansicht: "hypothesentest" })}>{zw("Zu den Hypothesentests", "To hypothesis tests")}</GrosserKnopf>
          </div>
        </>
      )}
      {weiter}
    </div>
  );
}

/* ======================================================================
   ÜBEN
   ====================================================================== */
let zaehler = 0;
const neue = (art) => ({ id: ++zaehler, ...nvAufgabe(art) });
const TITEL = {
  ablesen: ["μ und σ ablesen", "Read off μ and σ"], standard: ["Standardisieren", "Standardise"], kleiner: ["Höchstens x", "At most x"], groesser: ["Mindestens x", "At least x"],
  zwischen: ["Zwischen a und b", "Between a and b"], sigma: ["Sigma-Regeln", "Sigma rules"], quantil: ["Wert zur Wahrscheinlichkeit", "Value for a probability"],
  sigmaRueck: ["σ bestimmen", "Find σ"], binom: ["Binomial ≈ Normal", "Binomial ≈ normal"], stetig: ["Stetig verstehen", "Understanding continuity"],
};
const kontext = (au) => KONTEXTE.find((k) => k.id === au.kontext) || KONTEXTE[0];
const RUND4 = zw("Runde auf vier Nachkommastellen.", "Round to four decimal places.");
const RUND2 = zw("Runde auf zwei Nachkommastellen.", "Round to two decimal places.");

/* z-Schritt mit typischen Fehlern */
function zSchritt(id, titel, x, mu, s, name = "z") {
  const w = (x - mu) / s;
  return zs(id, titel, `$${name} =$`, w, zw(`Standardisiere $x = ${dz(x)}$: Wie viele σ liegt der Wert von μ entfernt?`, `Standardise $x = ${dz(x)}$: how many σ is the value away from μ?`), {
    tol: TOL_Z, wertText: z2(w), rundung: RUND2,
    fehler: [
      { wert: (mu - x) / s, toleranz: TOL_Z, text: zw("Vorzeichen vertauscht: Es heißt $x - \\mu$, nicht $\\mu - x$. Liegt x über μ, ist z positiv.", "Sign swapped: it is $x - \\mu$, not $\\mu - x$. If x is above μ, z is positive.") },
      { wert: (x - mu) / (s * s), toleranz: TOL_Z, text: zw("Geteilt wird durch σ, nicht durch σ² (die Varianz).", "Divide by σ, not by σ² (the variance).") },
      { wert: x - mu, toleranz: TOL_Z, text: zw("Das ist der Abstand in der Einheit der Größe. Teile noch durch σ.", "That is the distance in the unit of the quantity. Still divide by σ.") },
    ],
    hinweis: `$z = \\frac{${dz(x)} - ${dz(mu)}}{${dz(s)}}$`,
    erkl: `$${name} = \\frac{${dz(x)} - ${dz(mu)}}{${dz(s)}} ≈ ${dz(Math.round(w * 100) / 100)}$`,
  });
}
const phiFehler = (z) => ({ wert: phi(z), toleranz: TOL_P, text: zw("Das ist die Höhe der Dichtekurve φ(z), keine Wahrscheinlichkeit. Gesucht ist die Fläche Φ(z).", "That is the height of the density curve φ(z), not a probability. You need the area Φ(z).") });

function schritte(au) {
  const k = kontext(au), e = au.kontext === "binom" ? "" : einheitVon(k);
  switch (au.art) {
    case "ablesen":
      return [
        zs("nv-ab-mu", zw("Erwartungswert", "Mean"), "$\\mu =$", au.mu, zw("An welcher Stelle liegt der Hochpunkt?", "Where is the peak?"), { einheit: e, hinweis: zw("Die Glocke ist symmetrisch, ihr Maximum liegt bei μ.", "The bell is symmetric, its maximum is at μ."), erkl: zw(`Hochpunkt bei ${dz(au.mu)}, also $\\mu = ${dz(au.mu)}$.`, `Peak at ${dz(au.mu)}, so $\\mu = ${dz(au.mu)}$.`) }),
        zs("nv-ab-s", zw("Standardabweichung", "Standard deviation"), "$\\sigma =$", au.s, zw("Die markierten Punkte sind die Wendepunkte. Wie groß ist σ?", "The marked points are the inflection points. What is σ?"), {
          einheit: e, tol: 1e-6,
          fehler: [{ wert: 2 * au.s, text: zw("Das ist der Abstand zwischen den beiden Wendestellen. σ ist der Abstand vom Hochpunkt zu einer Wendestelle.", "That is the distance between the two inflection points. σ is the distance from the peak to one inflection point.") },
                   { wert: au.mu + au.s, text: zw("Das ist die Lage der rechten Wendestelle. σ ist ihr Abstand zu μ.", "That is the position of the right inflection point. σ is its distance from μ.") }],
          hinweis: zw("Wendestellen liegen bei μ − σ und μ + σ.", "Inflection points are at μ − σ and μ + σ."), erkl: zw(`Wendestelle bei ${dz(au.mu + au.s)}: $\\sigma = ${dz(au.mu + au.s)} - ${dz(au.mu)} = ${dz(au.s)}$`, `Inflection point at ${dz(au.mu + au.s)}: $\\sigma = ${dz(au.mu + au.s)} - ${dz(au.mu)} = ${dz(au.s)}$`),
        }),
      ];
    case "standard": {
      const w = au.zWert;
      return [
        zSchritt("nv-st-z", zw("Standardisieren", "Standardise"), au.x, au.mu, au.s),
        ws("nv-st-d", zw("Deuten", "Interpret"), zw("Was bedeutet der z-Wert?", "What does the z value mean?"),
          misch([["r", zw(`${dz(au.x)} liegt ${dz(Math.abs(w))} Standardabweichungen ${w > 0 ? "über" : "unter"} μ.`, `${dz(au.x)} lies ${dz(Math.abs(w))} standard deviations ${w > 0 ? "above" : "below"} μ.`)],
            ["f1", zw(`${dz(au.x)} liegt ${dz(Math.abs(w))} ${e} ${w > 0 ? "über" : "unter"} μ.`, `${dz(au.x)} lies ${dz(Math.abs(w))} ${e} ${w > 0 ? "above" : "below"} μ.`)],
            ["f2", zw(`Die Wahrscheinlichkeit für ${dz(au.x)} ist ${dz(Math.abs(w))}.`, `The probability of ${dz(au.x)} is ${dz(Math.abs(w))}.`)]], au.id), "r",
          { fehler: [{ wahl: "f1", text: zw("z hat keine Einheit – es zählt Standardabweichungen.", "z has no unit – it counts standard deviations.") }, { wahl: "f2", text: zw("z ist keine Wahrscheinlichkeit. Erst Φ(z) ist eine.", "z is not a probability. Only Φ(z) is.") }],
            erkl: zw("z misst den Abstand zu μ in Vielfachen von σ.", "z measures the distance to μ in multiples of σ.") }),
      ];
    }
    case "kleiner":
      return [
        zSchritt("nv-kl-z", zw("Standardisieren", "Standardise"), au.x, au.mu, au.s),
        zs("nv-kl-p", zw("Wahrscheinlichkeit", "Probability"), `$P(X \\le ${dz(au.x)}) =$`, au.wert, zw("Lies Φ(z) ab (Tabelle oder Taschenrechner).", "Read off Φ(z) (table or calculator)."), {
          tol: TOL_P, wertText: z4(au.wert), rundung: RUND4,
          fehler: [{ wert: 1 - au.wert, toleranz: TOL_P, text: zw("Das ist die Fläche rechts von x. „Höchstens“ heißt: die Fläche links, also Φ(z).", "That is the area to the right of x. “At most” means the area to the left, i.e. Φ(z).") }, phiFehler(au.zWert)],
          hinweis: zw(`$\\Phi(${dz(Math.round(au.zWert * 100) / 100)})$`, `$\\Phi(${dz(Math.round(au.zWert * 100) / 100)})$`),
          erkl: `$P(X \\le ${dz(au.x)}) = \\Phi(${dz(Math.round(au.zWert * 100) / 100)}) ≈ ${dz(Math.round(au.wert * 10000) / 10000)}$`,
        }),
      ];
    case "groesser":
      return [
        zSchritt("nv-gr-z", zw("Standardisieren", "Standardise"), au.x, au.mu, au.s),
        zs("nv-gr-phi", zw("Fläche links", "Area to the left"), `$\\Phi(z) =$`, au.PhiZ, zw("Φ gibt immer die Fläche links von z an. Wie groß ist sie?", "Φ always gives the area to the left of z. How large is it?"), {
          tol: TOL_P, wertText: z4(au.PhiZ), rundung: RUND4, fehler: [phiFehler(au.zWert)], hinweis: zw("Tabelle oder Taschenrechner.", "Table or calculator."), erkl: `$\\Phi(${dz(Math.round(au.zWert * 100) / 100)}) ≈ ${dz(Math.round(au.PhiZ * 10000) / 10000)}$`,
        }),
        zs("nv-gr-p", zw("Gegenwahrscheinlichkeit", "Complement"), `$P(X \\ge ${dz(au.x)}) =$`, au.wert, zw("Gefragt ist die Fläche rechts.", "The area to the right is wanted."), {
          tol: TOL_P, wertText: z4(au.wert), rundung: RUND4,
          fehler: [{ wert: au.PhiZ, toleranz: TOL_P, text: zw("Das ist die Fläche links. Für „mindestens“ bzw. „mehr als“ rechnest du 1 − Φ(z).", "That is the area to the left. For “at least” or “more than” calculate 1 − Φ(z).") }],
          hinweis: "$1 - \\Phi(z)$", erkl: `$P(X \\ge ${dz(au.x)}) = 1 - ${dz(Math.round(au.PhiZ * 10000) / 10000)} ≈ ${dz(Math.round(au.wert * 10000) / 10000)}$`,
        }),
      ];
    case "zwischen":
      return [
        zSchritt("nv-zw-a", zw("Untere Grenze standardisieren", "Standardise the lower bound"), au.a, au.mu, au.s, "z_a"),
        zSchritt("nv-zw-b", zw("Obere Grenze standardisieren", "Standardise the upper bound"), au.b, au.mu, au.s, "z_b"),
        zs("nv-zw-p", zw("Wahrscheinlichkeit", "Probability"), `$P(${dz(au.a)} \\le X \\le ${dz(au.b)}) =$`, au.wert, zw("Große Fläche minus kleine Fläche.", "Big area minus small area."), {
          tol: TOL_P, wertText: z4(au.wert), rundung: RUND4,
          fehler: [{ wert: au.Pb + au.Pa, toleranz: TOL_P, text: zw("Die Flächen werden subtrahiert: Φ(z_b) − Φ(z_a).", "The areas are subtracted: Φ(z_b) − Φ(z_a).") },
                   { wert: 1 - au.wert, toleranz: TOL_P, text: zw("Das ist die Fläche außerhalb des Intervalls.", "That is the area outside the interval.") },
                   { wert: au.Pb, toleranz: TOL_P, text: zw("Das ist alles links von b. Zieh noch die Fläche links von a ab.", "That is everything to the left of b. Still subtract the area to the left of a.") }],
          hinweis: "$\\Phi(z_b) - \\Phi(z_a)$",
          erkl: `$\\Phi(${dz(Math.round(au.zb * 100) / 100)}) - \\Phi(${dz(Math.round(au.za * 100) / 100)}) ≈ ${dz(Math.round(au.Pb * 10000) / 10000)} - ${dz(Math.round(au.Pa * 10000) / 10000)} ≈ ${dz(Math.round(au.wert * 10000) / 10000)}$`,
        }),
      ];
    case "sigma": {
      const kk = au.k, ks = kk === 1 ? "" : kk;
      return [
        zs("nv-si-u", zw("Untere Grenze", "Lower bound"), `$\\mu - ${ks}\\sigma =$`, au.unten, zw(`Berechne die untere Grenze des ${kk}σ-Intervalls.`, `Calculate the lower bound of the ${kk}σ interval.`), {
          einheit: e, tol: 1e-6,
          fehler: kk > 1 ? [{ wert: au.mu - au.s, text: zw(`Hier ist das ${kk}-Fache von σ gefragt.`, `Here ${kk} times σ is wanted.`) }] : [],
          hinweis: `$${dz(au.mu)} - ${kk === 1 ? "" : `${kk} \\cdot `}${dz(au.s)}$`, erkl: `$${dz(au.mu)} - ${kk === 1 ? "" : `${kk} \\cdot `}${dz(au.s)} = ${dz(au.unten)}$`,
        }),
        zs("nv-si-o", zw("Obere Grenze", "Upper bound"), `$\\mu + ${ks}\\sigma =$`, au.oben, zw("Und die obere Grenze?", "And the upper bound?"), {
          einheit: e, tol: 1e-6, hinweis: `$${dz(au.mu)} + ${kk === 1 ? "" : `${kk} \\cdot `}${dz(au.s)}$`, erkl: `$${dz(au.mu)} + ${kk === 1 ? "" : `${kk} \\cdot `}${dz(au.s)} = ${dz(au.oben)}$`,
        }),
        ws("nv-si-p", zw("Anteil", "Share"), zw(`Wie viel Prozent der Werte liegen etwa in [${dz(au.unten)}; ${dz(au.oben)}]?`, `About what percentage of the values lie in [${dz(au.unten)}; ${dz(au.oben)}]?`),
          misch([["68", "68,3 %"], ["95", "95,4 %"], ["99", "99,7 %"], ["50", "50 %"]], au.id), kk === 1 ? "68" : kk === 2 ? "95" : "99",
          { fehler: [{ wahl: "50", text: zw("50 % liegen links bzw. rechts von μ – nicht in einem Intervall um μ.", "50 % lie to the left or right of μ – not in an interval around μ.") }],
            hinweis: zw("1σ: gut zwei Drittel, 2σ: gut 95 %, 3σ: fast alles.", "1σ: a good two thirds, 2σ: a good 95 %, 3σ: almost everything."), erkl: zw(`${kk}σ-Regel: etwa ${au.prozent}.`, `${kk}σ rule: about ${au.prozent.replace(",", ".")}.`) }),
      ];
    }
    case "quantil": {
      const tolX = Math.max(0.011, 0.012 * au.s);
      return [
        zs("nv-qu-z", zw("z-Wert", "z value"), "$z =$", au.zp, zw(`Für welches z gilt $\\Phi(z) = ${dz(au.p)}$?`, `For which z is $\\Phi(z) = ${dz(au.p)}$?`), {
          tol: 0.011, wertText: z2(au.zp), rundung: RUND2,
          fehler: [{ wert: -au.zp, toleranz: 0.011, text: zw(`Vorzeichen prüfen: Ist p ${au.p > 0.5 ? "größer" : "kleiner"} als 0,5, liegt z ${au.p > 0.5 ? "rechts" : "links"} von 0.`, `Check the sign: if p is ${au.p > 0.5 ? "greater" : "less"} than 0.5, z lies to the ${au.p > 0.5 ? "right" : "left"} of 0.`) }],
          hinweis: zw(`Taschenrechner: invNorm(${dz(au.p)}) – oder in der Φ-Tabelle rückwärts suchen.`, `Calculator: invNorm(${dz(au.p)}) – or search the Φ table backwards.`),
          erkl: `$z ≈ ${dz(Math.round(au.zp * 100) / 100)}$`,
        }),
        zs("nv-qu-x", zw("Wert", "Value"), "$x =$", au.wert, zw("Rechne zurück: $x = \\mu + z \\cdot \\sigma$.", "Calculate back: $x = \\mu + z \\cdot \\sigma$."), {
          einheit: e, tol: tolX, wertText: z2(au.wert), rundung: RUND2,
          fehler: [{ wert: au.mu - au.zp * au.s, toleranz: tolX, text: zw("Plus statt minus: $x = \\mu + z \\cdot \\sigma$.", "Plus, not minus: $x = \\mu + z \\cdot \\sigma$.") },
                   { wert: au.zp * au.s, toleranz: tolX, text: zw("μ fehlt: z · σ ist nur der Abstand zu μ.", "μ is missing: z · σ is only the distance to μ.") }],
          hinweis: `$${dz(au.mu)} + ${dz(Math.round(au.zp * 100) / 100)} \\cdot ${dz(au.s)}$`,
          erkl: `$x = ${dz(au.mu)} + (${dz(Math.round(au.zp * 100) / 100)}) \\cdot ${dz(au.s)} ≈ ${dz(Math.round(au.wert * 100) / 100)}$`,
        }),
      ];
    }
    case "sigmaRueck": {
      const tolS = Math.max(0.011, 0.012 * au.wert);
      return [
        zs("nv-sr-z", zw("z-Wert", "z value"), "$z =$", au.zp, zw(`Für welches z gilt $\\Phi(z) = ${dz(au.p)}$?`, `For which z is $\\Phi(z) = ${dz(au.p)}$?`), {
          tol: 0.011, wertText: z2(au.zp), rundung: RUND2,
          fehler: [{ wert: -au.zp, toleranz: 0.011, text: zw("Vorzeichen prüfen: z liegt auf derselben Seite von 0 wie c von μ.", "Check the sign: z is on the same side of 0 as c is of μ.") }],
          hinweis: zw(`invNorm(${dz(au.p)})`, `invNorm(${dz(au.p)})`), erkl: `$z ≈ ${dz(Math.round(au.zp * 100) / 100)}$`,
        }),
        zs("nv-sr-s", zw("Standardabweichung", "Standard deviation"), "$\\sigma =$", au.wert, zw(`Aus $\\frac{${dz(au.c)} - ${dz(au.mu)}}{\\sigma} = z$ folgt σ.`, `From $\\frac{${dz(au.c)} - ${dz(au.mu)}}{\\sigma} = z$ follows σ.`), {
          einheit: e, tol: tolS, wertText: z2(au.wert), rundung: RUND2,
          fehler: [{ wert: (au.c - au.mu) * au.zp, toleranz: tolS, text: zw("Nach σ umstellen heißt: durch z teilen, nicht mit z malnehmen.", "Solving for σ means dividing by z, not multiplying by z.") },
                   { wert: Math.abs(au.c - au.mu), toleranz: tolS, text: zw("Das ist nur der Abstand c − μ. Teile noch durch z.", "That is only the distance c − μ. Still divide by z.") }],
          hinweis: "$\\sigma = \\frac{c - \\mu}{z}$",
          erkl: `$\\sigma = \\frac{${dz(au.c)} - ${dz(au.mu)}}{${dz(Math.round(au.zp * 100) / 100)}} ≈ ${dz(Math.round(au.wert * 100) / 100)}$`,
        }),
      ];
    }
    case "binom": {
      const m = au.muB, sg = au.sB, tolS = 0.011;
      return [
        zs("nv-bi-mu", zw("Erwartungswert", "Mean"), "$\\mu =$", m, zw("Berechne $\\mu = n \\cdot p$.", "Calculate $\\mu = n \\cdot p$."), { hinweis: `$${au.n} \\cdot ${dz(au.p)}$`, erkl: `$\\mu = ${au.n} \\cdot ${dz(au.p)} = ${dz(m)}$` }),
        zs("nv-bi-s", zw("Standardabweichung", "Standard deviation"), "$\\sigma =$", sg, zw("Berechne $\\sigma = \\sqrt{n \\cdot p \\cdot (1 - p)}$.", "Calculate $\\sigma = \\sqrt{n \\cdot p \\cdot (1 - p)}$."), {
          tol: tolS, wertText: z2(sg), rundung: RUND2,
          fehler: [{ wert: sg * sg, toleranz: tolS, text: zw("Das ist die Varianz. Zieh noch die Wurzel.", "That is the variance. Still take the square root.") }],
          hinweis: `$\\sqrt{${au.n} \\cdot ${dz(au.p)} \\cdot ${dz(1 - au.p)}}$`, erkl: `$\\sigma = \\sqrt{${dz(sg * sg)}} ≈ ${dz(Math.round(sg * 100) / 100)}$`,
        }),
        ws("nv-bi-l", zw("Darf man nähern?", "May you approximate?"), zw("Ist die Laplace-Bedingung σ > 3 erfüllt?", "Is the Laplace condition σ > 3 met?"), [["ja", zw("Ja", "Yes")], ["nein", zw("Nein", "No")]], "ja",
          { erkl: zw(`$\\sigma ≈ ${dz(Math.round(sg * 100) / 100)} > 3$ – die Normalverteilung passt gut.`, `$\\sigma ≈ ${dz(Math.round(sg * 100) / 100)} > 3$ – the normal distribution fits well.`) }),
        zs("nv-bi-p", zw("Näherung", "Approximation"), `$P(X \\le ${au.k}) \\approx$`, au.wert, zw("Mit Stetigkeitskorrektur: $\\Phi\\left(\\frac{k + 0{,}5 - \\mu}{\\sigma}\\right)$.", "With continuity correction: $\\Phi\\left(\\frac{k + 0.5 - \\mu}{\\sigma}\\right)$."), {
          tol: TOL_P, wertText: z4(au.wert), rundung: RUND4,
          fehler: [{ wert: au.ohneKorrektur, toleranz: TOL_P, text: zw("Ohne Stetigkeitskorrektur zählt der Balken über k nur halb. Rechne mit k + 0,5.", "Without the continuity correction the bar above k only counts half. Use k + 0.5.") },
                   { wert: Phi((au.k - 0.5 - m) / sg), toleranz: TOL_P, text: zw("Für „höchstens k“ wird der Balken über k mitgenommen: k + 0,5, nicht k − 0,5.", "For “at most k” the bar above k is included: k + 0.5, not k − 0.5.") }],
          hinweis: `$\\Phi\\left(\\frac{${au.k} + 0{,}5 - ${dz(m)}}{${dz(Math.round(sg * 100) / 100)}}\\right)$`,
          erkl: `$\\Phi\\left(\\frac{${dz(au.k + 0.5)} - ${dz(m)}}{${dz(Math.round(sg * 100) / 100)}}\\right) ≈ ${dz(Math.round(au.wert * 10000) / 10000)}$`,
        }),
      ];
    }
    default: {
      const f = au.frage;
      if (f === "punkt") return [ws("nv-ste", zw("Ein einzelner Wert", "A single value"), zw(`Wie groß ist $P(X = ${dz(au.mu)})$ genau?`, `What exactly is $P(X = ${dz(au.mu)})$?`),
        misch([["r", "0"], ["f1", `$\\varphi(${dz(au.mu)}) ≈ ${dz(Math.round(maxHoehe(au.s) * 10000) / 10000)}$`], ["f2", "0,5"]], au.id), "r",
        { fehler: [{ wahl: "f1", text: zw("Das ist die Höhe der Kurve, keine Wahrscheinlichkeit. Ein einzelner Wert hat Breite 0, also Fläche 0.", "That is the height of the curve, not a probability. A single value has width 0, so area 0.") },
                   { wahl: "f2", text: zw("0,5 ist P(X ≤ μ) – die halbe Fläche. Ein einzelner Punkt hat keine Fläche.", "0.5 is P(X ≤ μ) – half the area. A single point has no area.") }],
          erkl: zw("Bei stetigen Zufallsgrößen gilt P(X = a) = 0 für jeden Wert a.", "For continuous random variables P(X = a) = 0 for every value a.") })];
      if (f === "hoehe") return [ws("nv-ste", zw("Die Dichte", "The density"), zw("Was gibt der Funktionswert φ(x) der Dichte an?", "What does the value φ(x) of the density tell you?"),
        misch([["r", zw("Die Höhe der Kurve – erst Flächen darunter sind Wahrscheinlichkeiten", "The height of the curve – only areas below it are probabilities")], ["f1", zw("Die Wahrscheinlichkeit P(X = x)", "The probability P(X = x)")], ["f2", zw("Die Wahrscheinlichkeit P(X ≤ x)", "The probability P(X ≤ x)")]], au.id), "r",
        { fehler: [{ wahl: "f1", text: zw("P(X = x) ist immer 0. φ(x) kann sogar größer als 1 sein (bei kleinem σ).", "P(X = x) is always 0. φ(x) can even exceed 1 (for small σ).") }, { wahl: "f2", text: zw("Das ist Φ, die Fläche links von x.", "That is Φ, the area to the left of x.") }],
          erkl: zw("φ ist eine Dichte: Wahrscheinlichkeit = Fläche unter φ.", "φ is a density: probability = area under φ.") })];
      if (f === "flaeche") return [ws("nv-ste", zw("Gesamtfläche", "Total area"), zw(`Wie groß ist die gesamte Fläche unter der Dichtekurve mit $\\mu = ${dz(au.mu)}$ und $\\sigma = ${dz(au.s)}$?`, `How large is the total area under the density curve with $\\mu = ${dz(au.mu)}$ and $\\sigma = ${dz(au.s)}$?`),
        misch([["r", "1"], ["f1", `${dz(au.s)}`], ["f2", zw("Das hängt von μ ab.", "It depends on μ.")]], au.id), "r",
        { fehler: [{ wahl: "f1", text: zw("σ ändert nur die Form – breiter und flacher, die Fläche bleibt 1.", "σ only changes the shape – wider and flatter, the area stays 1.") }, { wahl: "f2", text: zw("μ verschiebt die Kurve nur, die Fläche ändert sich nicht.", "μ only shifts the curve, the area does not change.") }],
          erkl: zw("Die Gesamtfläche ist die Wahrscheinlichkeit, dass irgendein Wert herauskommt: 1.", "The total area is the probability that any value comes out: 1.") })];
      return [ws("nv-ste", zw("Breite und Höhe", "Width and height"), zw("Zwei Normalverteilungen haben dasselbe μ, aber $\\sigma_1 < \\sigma_2$. Welche Glocke ist höher?", "Two normal distributions have the same μ, but $\\sigma_1 < \\sigma_2$. Which bell is taller?"),
        misch([["r", zw("Die mit σ₁ – sie ist schmaler und deshalb höher", "The one with σ₁ – it is narrower and therefore taller")], ["f1", zw("Die mit σ₂", "The one with σ₂")], ["f2", zw("Beide gleich hoch", "Both equally tall")]], au.id), "r",
        { fehler: [{ wahl: "f1", text: zw("Größeres σ heißt breiter. Bei gleicher Fläche 1 muss die Kurve dann flacher sein.", "Larger σ means wider. With the same area 1 the curve must then be flatter.") }, { wahl: "f2", text: zw("Die Höhe ist $\\frac{1}{\\sigma\\sqrt{2\\pi}}$ – sie hängt von σ ab.", "The height is $\\frac{1}{\\sigma\\sqrt{2\\pi}}$ – it depends on σ.") }],
          erkl: zw("Höhe $\\frac{1}{\\sigma\\sqrt{2\\pi}}$: kleines σ, hohe Glocke.", "Height $\\frac{1}{\\sigma\\sqrt{2\\pi}}$: small σ, tall bell.") })];
    }
  }
}

function text(au) {
  const k = kontext(au), e = au.kontext === "binom" ? "" : einheitVon(k);
  const ktx = au.kontext === "binom" ? "" : zw(k.de(au.mu, au.s), k.en(au.mu, au.s));
  const was = zw(k.wasDe, k.wasEn);
  switch (au.art) {
    case "ablesen": return zw(`Der Graph zeigt die Dichte einer normalverteilten Zufallsgröße X (Einheit ${e}). Die hohlen Punkte sind die Wendepunkte. Bestimme μ und σ.`, `The graph shows the density of a normally distributed random variable X (unit ${e}). The hollow points are the inflection points. Find μ and σ.`);
    case "standard": return `${ktx} ${zw(`Standardisiere den Wert $x = ${dz(au.x)}$ ${e}.`, `Standardise the value $x = ${dz(au.x)}$ ${e}.`)}`;
    case "kleiner": return `${ktx} ${zw(`Mit welcher Wahrscheinlichkeit ist der Wert für ${was} höchstens ${dz(au.x)} ${e}?`, `With what probability is the value for ${was} at most ${dz(au.x)} ${e}?`)}`;
    case "groesser": return `${ktx} ${zw(`Mit welcher Wahrscheinlichkeit ist der Wert für ${was} mindestens ${dz(au.x)} ${e}?`, `With what probability is the value for ${was} at least ${dz(au.x)} ${e}?`)}`;
    case "zwischen": return `${ktx} ${zw(`Mit welcher Wahrscheinlichkeit liegt der Wert für ${was} zwischen ${dz(au.a)} und ${dz(au.b)} ${e}?`, `With what probability does the value for ${was} lie between ${dz(au.a)} and ${dz(au.b)} ${e}?`)}`;
    case "sigma": return `${ktx} ${zw(`Bestimme das ${au.k}σ-Intervall um μ und gib an, wie viel Prozent der Werte etwa darin liegen.`, `Find the ${au.k}σ interval around μ and state about what percentage of the values lies in it.`)}`;
    case "quantil": return `${ktx} ${zw(`Bestimme den Wert x mit $P(X \\le x) = ${dz(au.p)}$: ${zt(au.p * 100, 1)} % liegen darunter.`, `Find the value x with $P(X \\le x) = ${dz(au.p)}$: ${zt(au.p * 100, 1)} % lie below it.`)}`;
    case "sigmaRueck": return zw(`Eine Größe X ist normalverteilt mit $\\mu = ${dz(au.mu)}$ ${e}. Bekannt ist: Mit Wahrscheinlichkeit ${dz(au.p)} gilt $X \\le ${dz(au.c)}$ ${e}. Bestimme σ.`, `A quantity X is normally distributed with $\\mu = ${dz(au.mu)}$ ${e}. It is known that with probability ${dz(au.p)}, $X \\le ${dz(au.c)}$ ${e}. Find σ.`);
    case "binom": return zw(`X ist binomialverteilt mit $n = ${au.n}$ und $p = ${dz(au.p)}$. Berechne $P(X \\le ${au.k})$ näherungsweise mit der Normalverteilung.`, `X is binomially distributed with $n = ${au.n}$ and $p = ${dz(au.p)}$. Approximate $P(X \\le ${au.k})$ with the normal distribution.`);
    default: return au.frage === "breite" || au.frage === "hoehe" ? zw("Entscheide.", "Decide.") : `${ktx}`;
  }
}

function skizze(au) {
  if (au.art === "ablesen") return <GlockenBild mu={au.mu} s={au.s} wende hoch hoehe={196} />;
  if (au.art === "zwischen") return <GlockenBild mu={au.mu} s={au.s} flaechen={[{ a: au.a, b: au.b }]} marken={[{ x: au.a, text: dz(au.a), farbe: C.see }, { x: au.b, text: dz(au.b), farbe: C.gruenDunkel }]} ticks={[{ x: au.mu, text: dz(au.mu) }]} hoehe={210} />;
  if (au.art === "kleiner") return <GlockenBild mu={au.mu} s={au.s} flaechen={[{ a: au.mu - 4 * au.s, b: au.x }]} marken={[{ x: au.x, text: dz(au.x), farbe: C.gruenDunkel }]} ticks={[{ x: au.mu, text: dz(au.mu) }]} hoehe={210} />;
  if (au.art === "groesser") return <GlockenBild mu={au.mu} s={au.s} flaechen={[{ a: au.x, b: au.mu + 4 * au.s, farbe: C.see }]} marken={[{ x: au.x, text: dz(au.x), farbe: C.see }]} ticks={[{ x: au.mu, text: dz(au.mu) }]} hoehe={210} />;
  return null;
}

const hilfe = (au) => hilfeKontext({
  id: `normal-${au.art}`, aufgabe: "Normalverteilung Glockenkurve Erwartungswert Standardabweichung standardisieren Phi Sigma-Regeln Stetigkeitskorrektur",
  verstehen: [zw("Was ist gegeben (μ, σ, Grenzen), was ist gesucht – eine Fläche (Wahrscheinlichkeit) oder ein Wert?", "What is given (μ, σ, bounds), what is wanted – an area (probability) or a value?"), zw("Skizziere die Glocke und schraffiere die gesuchte Fläche.", "Sketch the bell and shade the area you need.")],
  ansatz: [zw("Standardisieren: z = (x − μ) : σ. Dann Φ(z) (Fläche links).", "Standardise: z = (x − μ) : σ. Then Φ(z) (area to the left).")],
  regel: [zw("P(X ≤ x) = Φ(z), P(X ≥ x) = 1 − Φ(z), P(a ≤ X ≤ b) = Φ(z_b) − Φ(z_a); rückwärts: x = μ + z · σ", "P(X ≤ x) = Φ(z), P(X ≥ x) = 1 − Φ(z), P(a ≤ X ≤ b) = Φ(z_b) − Φ(z_a); backwards: x = μ + z · σ")],
  pruefen: [zw("Passt das Ergebnis zur Skizze? Liegt x rechts von μ, ist Φ(z) größer als 0,5.", "Does the result match the sketch? If x is right of μ, Φ(z) is greater than 0.5.")],
});

export function Normalverteilung({ gehe }) {
  return (
    <ZweiModi titel={zw("Normalverteilung", "Normal distribution")}
      text={zw("Die Glockenkurve von Gauß: woher sie kommt, was μ und σ bedeuten und wie man mit ihr Wahrscheinlichkeiten als Flächen berechnet – vorwärts, rückwärts und als Näherung der Binomialverteilung.", "Gauss's bell curve: where it comes from, what μ and σ mean and how to use it to compute probabilities as areas – forwards, backwards and as an approximation of the binomial distribution.")}
      kurz={(
        <div style={{ display: "grid", gap: 6 }}>
          <MS s={"$\\varphi_{\\mu,\\sigma}(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{1}{2}\\left(\\frac{x - \\mu}{\\sigma}\\right)^2}$"} />
          <MS s={zw("$z = \\frac{x - \\mu}{\\sigma}$, $P(X \\le x) = \\Phi(z)$, $P(a \\le X \\le b) = \\Phi(z_b) - \\Phi(z_a)$", "$z = \\frac{x - \\mu}{\\sigma}$, $P(X \\le x) = \\Phi(z)$, $P(a \\le X \\le b) = \\Phi(z_b) - \\Phi(z_a)$")} />
          <span>{zw("σ-Regeln: 68,3 % · 95,4 % · 99,7 %. Wendestellen bei μ ± σ. Stetig: P(X = a) = 0.", "σ rules: 68.3 % · 95.4 % · 99.7 %. Inflection points at μ ± σ. Continuous: P(X = a) = 0.")}</span>
        </div>
      )}
      entdecken={<Entdecken gehe={gehe} />}
      ueben={<UebenRahmen titel={TITEL} arten={NV_ARTEN} neue={neue} schritte={schritte} text={text} skizze={skizze} hilfe={hilfe} />} />
  );
}

/* Für automatische Prüfungen */
export const _nvIntern = { schritte, text, vert };
