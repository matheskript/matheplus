/* Werkzeug-Karten des Kurses Dreiecksgeometrie – gleicher Aufbau wie funcVekKursKarten.jsx
   (Kopf · Text · Knopf · Skizze), in Amethyst (C.am…) mit warmem Gold.
   Die Texte sagen nur zu, was das Werkzeug wirklich kann (wie die „In der App“-Kästen im Buch).
   Skizzen mathematisch exakt: Lote, Thaleskreis, Umkreismittelpunkt und Parallelen sind gerechnet. */
import React from "react";
import { C } from "./base1.jsx";

const N = C.amNacht, T = C.amTief, L = C.amViolett, H = C.amHell, NB = C.amNebel, G = C.vkGold;
const SCHRIFT = "Montserrat, sans-serif";

export const KARTEN = {
  flaechen: { art: "Entdecken und Üben", text: "Rechteck, Dreieck, Parallelogramm, Trapez und Drachen: Maße mit Reglern verändern und sehen, woher die Formel kommt – unter „Üben“ rechnen, mit Skizze und in Schritten." },
  winkelsaetze: { art: "Entdecken und Üben", text: "Scheitel-, Neben-, Stufen- und Wechselwinkel an Parallelen markieren, die Winkelsumme im Dreieck und im n-Eck sehen – und unter „Üben“ Winkel benennen und berechnen." },
  kongruenz: { art: "Entdecken und Üben", text: "Die gegebenen Stücke mit Reglern einstellen und sehen, wie viele Dreiecke passen: keins, eins, zwei oder unendlich viele. Unter „Üben“ entscheidest du, welcher Satz gilt." },
  konstruktion: { art: "Entdecken", text: "Mittelsenkrechte, Winkelhalbierende, Höhe oder Seitenhalbierende wählen und die Ecke C verschieben: Die drei Linien treffen sich immer in einem Punkt." },
  thales: { art: "Entdecken und Üben", text: "C wandert auf dem Kreis, der Winkel bleibt 90°. Mit dem Regler „Abstand“ ziehst du C nach innen oder außen; unter „Üben“ gibt es auch Aufgaben zur Tangente." },
  pythagoras: { art: "Entdecken und Üben", text: "Das Dreieck verstellen und die Quadrate vergleichen. Unter „Üben“: Hypotenuse oder Kathete berechnen, Umkehrung prüfen, Leiter und Raumdiagonale – Schritt für Schritt." },
  kathetensatz: { art: "Entdecken und Üben", text: "Den Fußpunkt der Höhe verschieben: Quadrat und Rechteck bleiben gleich groß. Unter „Üben“ gibt es fünf Aufgabentypen, etwa die Höhe aus p und q." },
  strahlensaetze: { art: "Entdecken und Üben", text: "Am Regler für k ziehen: Alle Strecken ab dem Zentrum wachsen mit demselben Faktor. Unter „Üben“ V- und X-Figur, rückwärts und Schatten." },
  trigonometrie: { art: "Entdecken und Üben", text: "Vom Einheitskreis zum rechtwinkligen Dreieck: an α oder an der Hypotenuse ziehen, Seiten und Winkel berechnen, Steigungen und Höhen – mit Rechner in DEG und RAD." },
};

/* ---------- Kleine Helfer ---------- */
const r2 = (v) => Math.round(v * 100) / 100;
const pfad = (pkte, zu = true) => `M${pkte.map(([x, y]) => `${r2(x)} ${r2(y)}`).join(" L")}${zu ? " Z" : ""}`;
/* rechter Winkel bei S zwischen den Richtungen zu P und Q (Kantenlänge m) */
function RechterWinkel({ s, p, q, m = 7, f = N }) {
  const e = (z) => { const dx = z[0] - s[0], dy = z[1] - s[1], l = Math.hypot(dx, dy); return [dx / l, dy / l]; };
  const a = e(p), b = e(q);
  return <path d={pfad([[s[0] + m * a[0], s[1] + m * a[1]], [s[0] + m * (a[0] + b[0]), s[1] + m * (a[1] + b[1])], [s[0] + m * b[0], s[1] + m * b[1]]], false)} fill="none" stroke={f} strokeWidth="1.4" />;
}
/* Winkelbogen bei S von der Richtung zu P gegen den Uhrzeigersinn (im Bild) bis zur Richtung zu Q, als gefüllter Sektor */
function Winkel({ s, p, q, r = 13, f = G }) {
  const w = (z) => Math.atan2(z[1] - s[1], z[0] - s[0]);
  const a = w(p), b = w(q);
  const pa = [s[0] + r * Math.cos(a), s[1] + r * Math.sin(a)], pb = [s[0] + r * Math.cos(b), s[1] + r * Math.sin(b)];
  let d = b - a; while (d < 0) d += 2 * Math.PI;
  return <path d={`M${r2(s[0])} ${r2(s[1])} L${r2(pa[0])} ${r2(pa[1])} A${r} ${r} 0 ${d > Math.PI ? 1 : 0} 1 ${r2(pb[0])} ${r2(pb[1])} Z`} fill={f} fillOpacity="0.55" stroke={f} strokeWidth="1.4" />;
}
const Text = ({ x, y, t, f = T, g = 12, kursiv = true }) => <text x={x} y={y} fontSize={g} fontStyle={kursiv ? "italic" : "normal"} fontWeight="700" fill={f} fontFamily={SCHRIFT} textAnchor="middle">{t}</text>;

/* rechtwinkliges Dreieck 3-4-5: A(0|0), B(5|0), C(3,2|2,4) in Bildkoordinaten (Maßstab s, Ursprung ox|oy, y nach oben) */
const pyth = (s, ox, oy) => (x, y) => [ox + s * x, oy - s * y];

/* ---------- Skizzen (viewBox 0 0 128 104) ---------- */
const BILDER = {
  /* Dreieck als halbes Rechteck: Höhe h teilt es in zwei rechtwinklige Dreiecke */
  flaechen: () => {
    const A = [16, 82], B = [112, 82], Cp = [56, 22], F = [56, 82];
    return (<>
      <rect x="16" y="22" width="96" height="60" fill="none" stroke={L} strokeWidth="1.4" strokeDasharray="4 3" />
      <path d={pfad([A, B, Cp])} fill="rgba(116,68,190,0.2)" stroke={N} strokeWidth="2.4" strokeLinejoin="round" />
      <line x1={Cp[0]} y1={Cp[1]} x2={F[0]} y2={F[1]} stroke={G} strokeWidth="2.2" strokeDasharray="4 3" />
      <RechterWinkel s={F} p={B} q={Cp} />
      <Text x={86} y={96} t="g" /><Text x={63} y={56} t="h" f={N} />
    </>);
  },
  /* zwei Parallelen, eine Schnittgerade, gleich große Stufenwinkel */
  winkelsaetze: () => {
    const p = (y) => [30 + (68 * (96 - y)) / 88, y];   // Schnittgerade von (30|96) nach (98|8)
    const S1 = p(72), S2 = p(36);
    return (<>
      <line x1="8" y1="72" x2="120" y2="72" stroke={N} strokeWidth="2.4" strokeLinecap="round" />
      <line x1="8" y1="36" x2="120" y2="36" stroke={N} strokeWidth="2.4" strokeLinecap="round" />
      <line x1="30" y1="96" x2="98" y2="8" stroke={L} strokeWidth="2.4" strokeLinecap="round" />
      <Winkel s={S1} p={[98, 8]} q={[120, 72]} /><Winkel s={S2} p={[98, 8]} q={[120, 36]} />
      <Text x={S1[0] + 20} y={S1[1] - 4} t="α" g={11} /><Text x={S2[0] + 20} y={S2[1] - 4} t="α" g={11} />
    </>);
  },
  /* zwei kongruente Dreiecke, entsprechende Seiten gleich markiert */
  kongruenz: () => {
    const D = [[12, 84], [56, 84], [24, 30]];
    const zweites = D.map(([x, y]) => [x + 58, y]);
    const strich = (P, Q, n, dx = 0) => {
      const m = [(P[0] + Q[0]) / 2 + dx, (P[1] + Q[1]) / 2], l = Math.hypot(Q[0] - P[0], Q[1] - P[1]);
      const u = [(Q[0] - P[0]) / l, (Q[1] - P[1]) / l], nn = [-u[1], u[0]];
      return Array.from({ length: n }, (_, i) => {
        const v = (i - (n - 1) / 2) * 3.4, c = [m[0] + u[0] * v, m[1] + u[1] * v];
        return <line key={i} x1={r2(c[0] - nn[0] * 4)} y1={r2(c[1] - nn[1] * 4)} x2={r2(c[0] + nn[0] * 4)} y2={r2(c[1] + nn[1] * 4)} stroke={G} strokeWidth="2" strokeLinecap="round" />;
      });
    };
    return (<>
      {[D, zweites].map((d, i) => (
        <g key={i}>
          <path d={pfad(d)} fill={i ? "rgba(116,68,190,0.2)" : "rgba(205,185,242,0.35)"} stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
          {strich(d[0], d[1], 1)}{strich(d[1], d[2], 2)}{strich(d[2], d[0], 3)}
        </g>
      ))}
    </>);
  },
  /* Mittelsenkrechten schneiden sich im Umkreismittelpunkt U(64|62,37), Radius √1466,8 */
  konstruktion: () => {
    const A = [30, 80], B = [98, 80], Cp = [52, 26];
    const uy = 6736 / 108, U = [64, uy], R = Math.hypot(64 - 30, uy - 80);
    const lot = (P, Q) => {
      const m = [(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2], l = Math.hypot(Q[0] - P[0], Q[1] - P[1]);
      const n = [-(Q[1] - P[1]) / l, (Q[0] - P[0]) / l];
      const t = Math.hypot(U[0] - m[0], U[1] - m[1]) + 10;
      const s = (U[0] - m[0]) * n[0] + (U[1] - m[1]) * n[1] >= 0 ? 1 : -1;
      return <line x1={r2(m[0] - s * n[0] * 8)} y1={r2(m[1] - s * n[1] * 8)} x2={r2(m[0] + s * n[0] * t)} y2={r2(m[1] + s * n[1] * t)} stroke={L} strokeWidth="1.4" strokeDasharray="4 3" />;
    };
    return (<>
      <circle cx={U[0]} cy={r2(U[1])} r={r2(R)} fill="none" stroke={G} strokeWidth="2" />
      <path d={pfad([A, B, Cp])} fill="rgba(116,68,190,0.16)" stroke={N} strokeWidth="2.4" strokeLinejoin="round" />
      {lot(A, B)}{lot(B, Cp)}{lot(Cp, A)}
      <circle cx={U[0]} cy={r2(U[1])} r="4" fill={G} stroke="#fff" strokeWidth="1.4" />
      <Text x={U[0] - 11} y={U[1] + 13} t="U" g={11} />
    </>);
  },
  /* Thaleskreis über AB, C bei 60°: Winkel bei C = 90° */
  thales: () => {
    const M = [64, 82], r = 46, w = Math.PI / 3;
    const A = [M[0] - r, M[1]], B = [M[0] + r, M[1]], Cp = [M[0] + r * Math.cos(w), M[1] - r * Math.sin(w)];
    return (<>
      <path d={`M${A[0]} ${A[1]} A${r} ${r} 0 0 1 ${B[0]} ${B[1]}`} fill="rgba(205,185,242,0.25)" stroke={L} strokeWidth="1.6" />
      <path d={pfad([A, B, Cp])} fill="rgba(116,68,190,0.18)" stroke={N} strokeWidth="2.4" strokeLinejoin="round" />
      <RechterWinkel s={Cp} p={A} q={B} m={8} f={G} />
      <circle cx={M[0]} cy={M[1]} r="3" fill={N} />
      <circle cx={r2(Cp[0])} cy={r2(Cp[1])} r="4.5" fill={G} stroke="#fff" strokeWidth="1.4" />
    </>);
  },
  /* 3-4-5 mit den drei Quadraten */
  pythagoras: () => {
    const p = pyth(8.6, 64 - 2.5 * 8.6, 50);
    const A = p(0, 0), B = p(5, 0), Cp = p(3.2, 2.4);
    return (<>
      <path d={pfad([A, B, p(5, -5), p(0, -5)])} fill="rgba(242,193,78,0.3)" stroke={G} strokeWidth="1.8" />
      <path d={pfad([A, Cp, p(0.8, 5.6), p(-2.4, 3.2)])} fill="rgba(205,185,242,0.4)" stroke={L} strokeWidth="1.6" />
      <path d={pfad([Cp, B, p(7.4, 1.8), p(5.6, 4.2)])} fill="rgba(205,185,242,0.4)" stroke={L} strokeWidth="1.6" />
      <path d={pfad([A, B, Cp])} fill="#fff" stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
      <RechterWinkel s={Cp} p={A} q={B} m={5.5} />
      <Text x={p(2.5, -2.5)[0]} y={p(2.5, -2.5)[1] + 4} t="c²" g={13} /><Text x={p(5.3, 2.1)[0]} y={p(5.3, 2.1)[1] + 4} t="a²" g={10} /><Text x={p(0.4, 2.8)[0]} y={p(0.4, 2.8)[1] + 4} t="b²" g={10} />
    </>);
  },
  /* Kathetensatz a² = c · p: Quadrat über a und Rechteck aus c und p unter der Hypotenuse */
  kathetensatz: () => {
    const p = pyth(9.4, 30, 42);
    const A = p(0, 0), B = p(5, 0), Cp = p(3.2, 2.4), F = p(3.2, 0);
    return (<>
      <path d={pfad([A, B, p(5, -5), p(0, -5)])} fill="none" stroke={L} strokeWidth="1.2" strokeDasharray="3 3" />
      <path d={pfad([F, B, p(5, -5), p(3.2, -5)])} fill="rgba(242,193,78,0.4)" stroke={G} strokeWidth="1.8" />
      <path d={pfad([Cp, B, p(7.4, 1.8), p(5.6, 4.2)])} fill="rgba(242,193,78,0.4)" stroke={G} strokeWidth="1.8" />
      <path d={pfad([A, B, Cp])} fill="rgba(205,185,242,0.45)" stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
      <line x1={r2(Cp[0])} y1={r2(Cp[1])} x2={r2(F[0])} y2={r2(F[1])} stroke={N} strokeWidth="1.6" strokeDasharray="3 2" />
      <RechterWinkel s={F} p={B} q={Cp} m={5} />
      <Text x={p(4.1, -2.5)[0]} y={p(4.1, -2.5)[1] + 4} t="c·p" g={10} f={N} /><Text x={p(5.3, 2.1)[0]} y={p(5.3, 2.1)[1] + 4} t="a²" g={11} f={N} />
    </>);
  },
  /* V-Figur: Parallelen entstehen durch Streckung mit k₁ = 0,6 und k₂ = 1,4 von Z aus */
  strahlensaetze: () => {
    const Z = [14, 86], v1 = [60, -40], v2 = [70, 2];
    const auf = (v, k) => [Z[0] + k * v[0], Z[1] + k * v[1]];
    const P1 = auf(v1, 0.6), Q1 = auf(v2, 0.6), P2 = auf(v1, 1.4), Q2 = auf(v2, 1.4);
    return (<>
      <line x1={Z[0]} y1={Z[1]} x2={auf(v1, 1.6)[0]} y2={auf(v1, 1.6)[1]} stroke={N} strokeWidth="2.2" strokeLinecap="round" />
      <line x1={Z[0]} y1={Z[1]} x2={auf(v2, 1.58)[0]} y2={auf(v2, 1.58)[1]} stroke={N} strokeWidth="2.2" strokeLinecap="round" />
      <line x1={P1[0]} y1={P1[1]} x2={Q1[0]} y2={Q1[1]} stroke={L} strokeWidth="2.4" strokeLinecap="round" />
      <line x1={P2[0]} y1={P2[1]} x2={Q2[0]} y2={Q2[1]} stroke={G} strokeWidth="2.8" strokeLinecap="round" />
      <circle cx={Z[0]} cy={Z[1]} r="4" fill={N} />
      <Text x={Z[0]} y={Z[1] + 16} t="Z" g={11} />
    </>);
  },
  /* rechtwinkliges Dreieck mit α: Gegenkathete a in Gold, Hypotenuse c – sin α = a : c */
  trigonometrie: () => {
    const A = [16, 86], B = [108, 86], Cp = [108, 30];
    return (<>
      <path d={pfad([A, B, Cp])} fill="rgba(205,185,242,0.35)" stroke={N} strokeWidth="2.2" strokeLinejoin="round" />
      <line x1={B[0]} y1={B[1]} x2={Cp[0]} y2={Cp[1]} stroke={G} strokeWidth="3.4" strokeLinecap="round" />
      <Winkel s={A} p={Cp} q={B} r={20} f={L} />
      <RechterWinkel s={B} p={A} q={Cp} />
      <Text x={45} y={81} t="α" g={12} /><Text x={56} y={52} t="c" g={12} f={N} /><Text x={118} y={62} t="a" g={12} f={N} />
    </>);
  },
};

function KartenBild({ id, titel }) {
  const Bild = BILDER[id];
  return (
    <svg role="img" aria-label={titel} viewBox="0 0 128 104" preserveAspectRatio="xMidYMid meet" style={{ display: "block", width: "100%", height: "100%" }}>
      {Bild ? <Bild /> : <path d="M20 84 L108 84 L60 22 Z" fill="none" stroke={N} strokeWidth="2.4" />}
    </svg>
  );
}

/* ---------- Die Karte (Klassen gkk-, sonst wie vkk- im Vektorkurs) ---------- */
const CSS = `
.gkk{position:relative;display:grid;grid-template-columns:240px minmax(0,1fr) 172px;grid-template-rows:auto 1fr;grid-template-areas:"kopf text bild" "knopf text bild";
  column-gap:18px;row-gap:12px;min-height:140px;padding:16px;border-radius:22px;background:#fff;border:1.5px solid ${C.linie};box-shadow:0 4px 20px rgba(23,11,46,.07);
  cursor:pointer;transition:transform .18s ease, box-shadow .18s ease, border-color .18s ease;box-sizing:border-box}
@media (hover:hover){.gkk:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(53,23,95,.16);border-color:${L}}}
.gkk-kopf{grid-area:kopf;display:flex;align-items:flex-start;gap:12px;min-width:0}
.gkk-titel{font-size:15.5px;font-weight:800;letter-spacing:-0.01em;line-height:1.22;color:${N};margin:0;overflow-wrap:break-word}
.gkk-art{font-size:10px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:${T};margin:0 0 3px}
.gkk-text{grid-area:text;align-self:center;margin:0;font-size:13.5px;line-height:1.55;color:#2C2440}
.gkk-knopf-feld{grid-area:knopf;display:flex;align-items:flex-end}
.gkk-bild{grid-area:bild;align-self:stretch;min-height:108px;border-radius:16px;overflow:hidden;border:1.5px solid ${H};padding:6px;box-sizing:border-box;
  background:linear-gradient(150deg,#fff 0%,${NB} 100%)}
.gkk-knopf{position:relative;display:inline-flex;align-items:center;gap:12px;padding:6px 6px 6px 18px;border:0;border-radius:999px;cursor:pointer;font-family:inherit;font-weight:800;font-size:14px;letter-spacing:.01em;color:#fff;
  background:linear-gradient(135deg,${L} 0%,${T} 100%);box-shadow:0 8px 18px rgba(116,68,190,.42), inset 0 1px 0 rgba(255,255,255,.25);
  transition:transform .16s ease, box-shadow .16s ease, background .2s ease, color .2s ease}
.gkk-knopf .gkk-pfeil{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;background:${G};color:${N};transition:transform .2s ease, background .2s ease}
@media (hover:hover){.gkk-knopf:hover{transform:translateY(-2px);box-shadow:0 12px 24px rgba(116,68,190,.55), inset 0 1px 0 rgba(255,255,255,.3)}
  .gkk-knopf:hover .gkk-pfeil{transform:translateX(3px) rotate(-8deg)}}
.gkk-knopf:active{transform:scale(.96)}
.gkk-knopf:focus-visible{outline:3px solid ${G};outline-offset:3px}
.gkk-knopf[aria-expanded="true"]{background:${N};color:#fff;box-shadow:0 8px 18px rgba(23,11,46,.35)}
.gkk-knopf[aria-expanded="true"] .gkk-pfeil{background:${H};color:${N}}
@media (max-width:820px){
  .gkk{grid-template-columns:minmax(0,1fr) 150px;grid-template-rows:auto auto auto;grid-template-areas:"kopf bild" "text text" "knopf knopf";column-gap:14px}
  .gkk-bild{min-height:100px;height:100%}
  .gkk-text{margin:2px 0}
}
@media (max-width:560px){
  .gkk{grid-template-columns:minmax(0,1fr) 142px;grid-template-rows:auto 1fr auto;grid-template-areas:"kopf bild" "text bild" "text knopf";padding:14px;column-gap:12px;row-gap:10px}
  .gkk-zeichen{display:none}
  .gkk-text{align-self:start;margin:0;font-size:13px}
  .gkk-knopf-feld{align-self:end}
  .gkk-knopf{width:100%;justify-content:space-between;gap:6px;padding:5px 5px 5px 13px;font-size:12.5px;box-sizing:border-box;white-space:nowrap}
  .gkk-knopf .gkk-pfeil{width:28px;height:28px;flex:none}
}
@media (prefers-reduced-motion:reduce){.gkk,.gkk-knopf,.gkk-pfeil{transition:none !important}}
`;

export function WerkzeugKarte({ id, t, an, oeffnen, schliessen, Zeichen }) {
  const info = KARTEN[id] || {};
  const klick = () => (an ? schliessen() : oeffnen(id));
  return (
    <div className="gkk" role="group" aria-label={t.titel} data-geo-werkzeug={id} onClick={(e) => { if (!e.target.closest("button")) klick(); }}>
      <div className="gkk-kopf">
        <span className="gkk-zeichen"><Zeichen text={t.zeichen} /></span>
        <div style={{ minWidth: 0 }}>
          {info.art && <p className="gkk-art">{info.art}</p>}
          <p className="gkk-titel" style={t.titel.split(" ").some((wort) => wort.length > 17) ? { fontSize: 14 } : undefined}>{t.titel}</p>
        </div>
      </div>
      <p className="gkk-text">{info.text || t.zeile}</p>
      <div className="gkk-knopf-feld">
        <button type="button" className="gkk-knopf" onClick={(e) => { e.stopPropagation(); klick(); }} aria-haspopup="dialog" aria-expanded={an}>
          <span>{an ? "Schließen" : "Jetzt öffnen"}</span>
          <span className="gkk-pfeil" aria-hidden="true">
            {an
              ? <svg viewBox="0 0 24 24" width="16" height="16"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" /></svg>
              : <svg viewBox="0 0 24 24" width="16" height="16"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          </span>
        </button>
      </div>
      <div className="gkk-bild"><KartenBild id={id} titel={`Skizze zu ${t.titel}`} /></div>
    </div>
  );
}

export function KartenStil() { return <style>{CSS}</style>; }
