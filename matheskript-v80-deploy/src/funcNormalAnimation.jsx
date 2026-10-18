/* ======================================================================
   NORMALVERTEILUNG – vier Erkläranimationen („Motion-Videos“)
   Gleicher Player wie alle Erkläranimationen (funcErklaeranimation.jsx).
     glocke    – Binomial-Histogramme werden mit wachsendem n zur Glocke;
                 stetige Zufallsgröße: Wahrscheinlichkeit = Fläche, P(X = a) = 0
     parameter – die Dichte φ_μ,σ: μ verschiebt, σ streckt, Fläche bleibt 1,
                 Wendestellen bei μ ± σ
     flaeche   – P(X ≤ x) als Fläche, Standardisieren z = (x − μ) : σ,
                 Gegenwahrscheinlichkeit und Intervall
     sigma     – Sigma-Regeln 68,3 % / 95,4 % / 99,7 % und μ ± 1,96σ
   Keine base-Datei darf diese Datei importieren.
   ====================================================================== */
import React from "react";
import { C } from "./base1.jsx";
import { lauf } from "./funcErklaeranimation.jsx";
import { MS } from "./mathText.jsx";
import { zw } from "./ui2.jsx";
import { AnimKarte } from "./funcAnimKarte.jsx";
import { Phi, phi } from "./normal.js";

const T = (props) => <text fontFamily="inherit" {...props} />;
const fenster = (t, a, b, c, d) => lauf(t, a, b) * (1 - lauf(t, c, d));
const mix = (a, b, p) => a + (b - a) * p;
const kz = (v, st = 4) => String(Math.round(v * 10 ** st) / 10 ** st).replace(".", ",").replace(/-/g, "−");

/* Koordinaten: z ∈ [−3,6; 3,6] → 180 ± 46 px; Grundlinie bei y = Y */
const sx = (z) => 180 + z * 46;
const Y = 196;
function kurve(mu, s, h = 360, von = -3.7, bis = 3.7) {
  const pts = [];
  for (let i = 0; i <= 160; i++) { const x = von + ((bis - von) * i) / 160; pts.push(`${sx(x).toFixed(1)},${(Y - (phi((x - mu) / s) / s) * h).toFixed(1)}`); }
  return `M${pts.join(" L")}`;
}
function flaeche(mu, s, a, b, h = 360) {
  if (b - a < 0.004) return "";
  const pts = [];
  for (let i = 0; i <= 90; i++) { const x = a + ((b - a) * i) / 90; pts.push(`${sx(x).toFixed(1)},${(Y - (phi((x - mu) / s) / s) * h).toFixed(1)}`); }
  return `M${sx(a).toFixed(1)},${Y} L${pts.join(" L")} L${sx(b).toFixed(1)},${Y} Z`;
}
function Achse({ o = 1, ticks = [-3, -2, -1, 0, 1, 2, 3], labels, farbe = C.grau, y = Y }) {
  return (
    <g opacity={o}>
      <line x1={sx(-3.75)} y1={y} x2={sx(3.75)} y2={y} stroke={C.hellgrau} strokeWidth="1.4" />
      <path d={`M${sx(3.75)} ${y} l-7 -4 M${sx(3.75)} ${y} l-7 4`} stroke={C.hellgrau} strokeWidth="1.4" />
      {ticks.map((v, i) => (
        <g key={v}>
          <line x1={sx(v)} y1={y - 4} x2={sx(v)} y2={y + 4} stroke={C.hellgrau} strokeWidth="1.2" />
          <T x={sx(v)} y={y + 17} textAnchor="middle" fontSize="11" fontWeight="600" fill={farbe}>{labels ? labels[i] : kz(v)}</T>
        </g>
      ))}
    </g>
  );
}
function Pille({ x = 180, y, text, o = 1, farbe = C.see, breite }) {
  if (o <= 0.001) return null;
  const w = breite || Math.max(70, String(text).length * 7.6 + 24);
  return (
    <g opacity={o}>
      <rect x={x - w / 2} y={y - 17} width={w} height={26} rx="13" fill={C.weiss} stroke={farbe} strokeWidth="1.4" />
      <T x={x} y={y + 1} textAnchor="middle" fontSize="13" fontWeight="800" fill={farbe}>{text}</T>
    </g>
  );
}
/* Formel mit Brüchen und Wurzeln: als HTML im SVG (MS zeichnet Wurzeln als einen Linienzug) */
function Formel({ x = 20, y, w = 320, h = 44, s, o = 1, groesse = 15 }) {
  if (o <= 0.001) return null;
  return (
    <foreignObject x={x} y={y} width={w} height={h} opacity={o}>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", fontSize: groesse, fontWeight: 600, color: C.tinte, whiteSpace: "nowrap" }}><MS s={s} /></div>
    </foreignObject>
  );
}

/* ======================================================================
   SZENE 1 · Vom Histogramm zur Glocke
   ====================================================================== */
const binom = (n, p) => {
  const t = []; let ln = 0;
  for (let k = 0; k <= n; k++) { if (k > 0) ln += Math.log(n - k + 1) - Math.log(k); t.push(Math.exp(ln + k * Math.log(p) + (n - k) * Math.log(1 - p))); }
  return t;
};
const HISTO = [10, 30, 100].map((n) => ({ n, t: binom(n, 0.5), mu: n / 2, s: Math.sqrt(n / 4) }));
function Histogramm({ h, o }) {
  if (o <= 0.001) return null;
  const w = 46 / h.s;
  return (
    <g opacity={o}>
      {h.t.map((pk, k) => {
        const z = (k - h.mu) / h.s;
        if (Math.abs(z) > 3.7) return null;
        const hh = pk * h.s * 360;
        return <rect key={k} x={sx(z) - w / 2 + 0.4} y={Y - hh} width={Math.max(0.6, w - 0.8)} height={hh} fill={`${C.see}33`} stroke={C.see} strokeWidth="0.8" />;
      })}
    </g>
  );
}
const G_DAUER = 27;
const gSchritte = () => [
  { von: 0, text: zw("Bei einer Binomialverteilung nimmt X nur ganze Werte an. Jeder Balken hat die Breite 1 – seine Fläche ist die Wahrscheinlichkeit P(X = k). Hier: n = 10 Würfe einer Münze.", "In a binomial distribution X only takes whole values. Every bar has width 1 – its area is the probability P(X = k). Here: n = 10 coin tosses.") },
  { von: 5, text: zw("Mehr Versuche: n = 30, dann n = 100. Wir rücken die Mitte μ auf 0 und messen in Vielfachen von σ. Die Balken werden schmaler – aber der Umriss bleibt derselbe.", "More trials: n = 30, then n = 100. We move the centre μ to 0 and measure in multiples of σ. The bars get narrower – but the outline stays the same.") },
  { von: 11, text: zw("Je größer n, desto genauer liegen die Balken auf einer festen Kurve: der Gaußschen Glockenkurve φ. Das ist der Satz von de Moivre und Laplace.", "The larger n, the more exactly the bars lie on one fixed curve: Gauss's bell curve φ. This is the de Moivre–Laplace theorem.") },
  { von: 16, text: zw("Bei Größen wie Körpergröße oder Füllmenge gibt es keine Balken mehr – jeder Wert ist möglich. X heißt dann stetig. Wahrscheinlichkeiten sind Flächen unter der Kurve.", "For quantities like height or filling amount there are no bars any more – every value is possible. X is then called continuous. Probabilities are areas under the curve.") },
  { von: 21.5, text: zw("Ein einzelner Wert ist ein Streifen der Breite 0 – also mit Fläche 0: P(X = a) = 0. Darum ist es bei stetigen Zufallsgrößen egal, ob du < oder ≤ schreibst.", "A single value is a strip of width 0 – so its area is 0: P(X = a) = 0. That is why it does not matter for continuous random variables whether you write < or ≤.") },
];
function gZeichne(t) {
  const o10 = fenster(t, 0.2, 1.2, 5.6, 6.4), o30 = fenster(t, 5.8, 6.6, 8.4, 9.2), o100 = lauf(t, 8.6, 9.4) * (1 - 0.65 * lauf(t, 12.5, 13.5)) * (1 - lauf(t, 15.6, 16.6));
  const zeich = lauf(t, 11.2, 13.4);
  const a = -0.6, bVoll = 1.1;
  const flo = lauf(t, 16.6, 17.6);
  const schrumpf = lauf(t, 22, 24.6);
  const aa = mix(a, 0.6, schrumpf), bb = mix(bVoll, 0.6, schrumpf);
  const nTxt = t < 6.2 ? 10 : t < 9 ? 30 : 100;
  return (
    <g>
      <Achse ticks={[-3, -2, -1, 0, 1, 2, 3]} labels={["−3σ", "−2σ", "−σ", "μ", "σ", "2σ", "3σ"]} />
      <Histogramm h={HISTO[0]} o={o10} />
      <Histogramm h={HISTO[1]} o={o30} />
      <Histogramm h={HISTO[2]} o={o100} />
      <path d={kurve(0, 1)} fill="none" stroke={C.gruen} strokeWidth="3" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - zeich} />
      <T x="180" y="30" textAnchor="middle" fontSize="17" fontWeight="800" fill={C.see} opacity={fenster(t, 0.6, 1.4, 10.6, 11.2)}>{`B(${nTxt}; 0,5)`}</T>
      <T x="180" y="30" textAnchor="middle" fontSize="17" fontWeight="800" fill={C.gruenDunkel} opacity={fenster(t, 12.6, 13.4, 15.8, 16.4)}>{zw("Gaußsche Glockenkurve φ", "Gaussian bell curve φ")}</T>
      {flo > 0.001 && <path d={flaeche(0, 1, aa, bb)} fill={`${C.flaggold}66`} stroke={C.flaggold} strokeWidth="1.2" opacity={flo} />}
      {schrumpf > 0.95 && <line x1={sx(0.6)} y1={Y} x2={sx(0.6)} y2={Y - phi(0.6) * 360} stroke={C.signal} strokeWidth="2.4" />}
      <T x="180" y="30" textAnchor="middle" fontSize="16" fontWeight="800" fill={C.tinte} opacity={fenster(t, 17.2, 18, 21.4, 21.9)}>{zw("P(a ≤ X ≤ b) = Fläche", "P(a ≤ X ≤ b) = area")}</T>
      <T x={sx(-0.6)} y={Y + 32} textAnchor="middle" fontSize="12" fontWeight="800" fill={C.gruenDunkel} opacity={fenster(t, 17.4, 18, 21.6, 22)}>a</T>
      <T x={sx(1.1)} y={Y + 32} textAnchor="middle" fontSize="12" fontWeight="800" fill={C.gruenDunkel} opacity={fenster(t, 17.4, 18, 21.6, 22)}>b</T>
      <Pille y={36} text="P(X = a) = 0" farbe={C.signal} o={lauf(t, 24.4, 25.2)} />
      <T x={sx(0.6)} y={Y + 32} textAnchor="middle" fontSize="12" fontWeight="800" fill={C.signal} opacity={lauf(t, 24.6, 25.2)}>a</T>
    </g>
  );
}

/* ======================================================================
   SZENE 2 · μ und σ
   ====================================================================== */
const P_DAUER = 25;
const H2 = 290;
const pSchritte = () => [
  { von: 0, text: zw("Die Dichte der Normalverteilung mit Erwartungswert μ und Standardabweichung σ. Der Kern ist e hoch minus x² – das ergibt die Glockenform.", "The density of the normal distribution with mean μ and standard deviation σ. Its core is e to the minus x² – that gives the bell shape.") },
  { von: 4, text: zw("Das Maximum liegt bei x = μ: Dort ist der Exponent 0. Die Kurve ist symmetrisch zu x = μ – Abweichungen nach links und rechts sind gleich wahrscheinlich.", "The maximum is at x = μ: there the exponent is 0. The curve is symmetric about x = μ – deviations to the left and right are equally likely.") },
  { von: 8, text: zw("Ändert sich μ, wandert die ganze Glocke nach links oder rechts. Ihre Form bleibt gleich.", "If μ changes, the whole bell moves left or right. Its shape stays the same.") },
  { von: 12, text: zw("σ bestimmt die Breite. Großes σ: breit und flach. Kleines σ: schmal und hoch. Die Fläche unter der Kurve ist immer genau 1 – dafür sorgt der Vorfaktor 1/(σ√(2π)).", "σ sets the width. Large σ: wide and flat. Small σ: narrow and tall. The area under the curve is always exactly 1 – the factor 1/(σ√(2π)) takes care of that.") },
  { von: 18, text: zw("Die Wendestellen liegen genau bei μ − σ und μ + σ. So liest du σ am Graphen ab: Abstand vom Hochpunkt bis zur Stelle, an der die Kurve von „rechtsgekrümmt“ zu „linksgekrümmt“ wechselt.", "The inflection points are exactly at μ − σ and μ + σ. That is how you read σ off the graph: the distance from the peak to where the curve changes from concave to convex.") },
];
function pParam(t) {
  let mu = 0;
  if (t >= 8.4 && t < 10) mu = mix(0, 1.4, lauf(t, 8.4, 9.8));
  else if (t >= 10 && t < 11.4) mu = mix(1.4, -1.2, lauf(t, 10, 11.4));
  else if (t >= 11.4 && t < 12.2) mu = mix(-1.2, 0, lauf(t, 11.4, 12));
  let s = 1;
  if (t >= 12.4 && t < 14.2) s = mix(1, 1.8, lauf(t, 12.4, 13.8));
  else if (t >= 14.2 && t < 16.2) s = mix(1.8, 0.7, lauf(t, 14.2, 15.8));
  else if (t >= 16.2 && t < 17.6) s = mix(0.7, 1, lauf(t, 16.2, 17.4));
  return { mu, s };
}
function pZeichne(t) {
  const { mu, s } = pParam(t);
  const kv = lauf(t, 2.6, 3.6);
  const yMax = Y - (phi(0) / s) * H2;
  const wp = lauf(t, 18.4, 19.6);
  const yW = Y - (phi(1) / s) * H2;
  return (
    <g>
      <Formel y={4} h={50} s={"$\\varphi_{\\mu,\\sigma}(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} \\cdot e^{-\\frac{1}{2}\\left(\\frac{x - \\mu}{\\sigma}\\right)^2}$"} o={lauf(t, 0.2, 1.2) * (1 - 0.75 * lauf(t, 3.4, 4))} groesse={16} />
      <Achse o={kv} />
      {kv > 0.01 && <path d={flaeche(mu, s, -3.7, 3.7, H2)} fill={`${C.see}12`} opacity={kv} />}
      <path d={kurve(mu, s, H2)} fill="none" stroke={C.see} strokeWidth="3" strokeLinecap="round" opacity={kv} />
      {/* Hochpunkt */}
      <g opacity={lauf(t, 4.4, 5.2)}>
        <line x1={sx(mu)} y1={yMax} x2={sx(mu)} y2={Y} stroke={C.gruen} strokeWidth="1.6" strokeDasharray="4 3" />
        <circle cx={sx(mu)} cy={yMax} r="5" fill={C.gruen} />
        <T x={sx(mu)} y={Y + 32} textAnchor="middle" fontSize="13" fontWeight="800" fill={C.gruenDunkel}>μ</T>
      </g>
      <Pille y={74} text={`μ = ${kz(mu, 1)}`} o={fenster(t, 8.2, 8.7, 11.9, 12.3)} farbe={C.gruenDunkel} />
      <Pille y={74} text={`σ = ${kz(s, 1)}`} o={fenster(t, 12.3, 12.8, 17.6, 18.1)} farbe={C.see} />
      <T x="300" y={Y - 14} textAnchor="middle" fontSize="12" fontWeight="800" fill={C.see} opacity={fenster(t, 13, 13.6, 17.6, 18)}>{zw("Fläche = 1", "Area = 1")}</T>
      {/* Wendepunkte */}
      <g opacity={wp}>
        {[-1, 1].map((d) => (
          <g key={d}>
            <line x1={sx(mu + d * s)} y1={yW} x2={sx(mu + d * s)} y2={Y} stroke={C.signal} strokeWidth="1.4" strokeDasharray="4 3" />
            <circle cx={sx(mu + d * s)} cy={yW} r="4.6" fill={C.weiss} stroke={C.signal} strokeWidth="2" />
          </g>
        ))}
        <line x1={sx(mu)} y1={yW + 26} x2={sx(mu + s)} y2={yW + 26} stroke={C.tinte} strokeWidth="1.6" opacity={lauf(t, 20, 20.8)} />
        <T x={sx(mu + s / 2)} y={yW + 21} textAnchor="middle" fontSize="13" fontWeight="800" fill={C.tinte} opacity={lauf(t, 20, 20.8)}>σ</T>
        <T x={sx(mu - s)} y={Y + 32} textAnchor="middle" fontSize="12" fontWeight="800" fill={C.signal}>μ − σ</T>
        <T x={sx(mu + s)} y={Y + 32} textAnchor="middle" fontSize="12" fontWeight="800" fill={C.signal}>μ + σ</T>
      </g>
      <Pille y={74} text={zw("Wendestellen: μ ± σ", "Inflection points: μ ± σ")} o={lauf(t, 21.4, 22.2)} farbe={C.signal} />
    </g>
  );
}

/* ======================================================================
   SZENE 3 · Wahrscheinlichkeit als Fläche, Standardisieren
   ====================================================================== */
const F_DAUER = 29;
const fSchritte = () => [
  { von: 0, text: zw("Die Körpergröße X von 16-jährigen Jungen ist ungefähr normalverteilt mit μ = 176 cm und σ = 7 cm. Wie wahrscheinlich ist es, dass ein Junge höchstens 183 cm groß ist?", "The height X of 16-year-old boys is approximately normally distributed with μ = 176 cm and σ = 7 cm. How likely is it that a boy is at most 183 cm tall?") },
  { von: 4, text: zw("P(X ≤ 183) ist die Fläche unter der Kurve links von 183.", "P(X ≤ 183) is the area under the curve to the left of 183.") },
  { von: 8, text: zw("Standardisieren: z = (x − μ) : σ zählt, wie viele σ der Wert von μ entfernt ist. 183 liegt genau ein σ über μ, also z = (183 − 176) : 7 = 1. Jede Normalverteilung wird so zur Standardnormalverteilung mit μ = 0 und σ = 1.", "Standardising: z = (x − μ) : σ counts how many σ the value is away from μ. 183 is exactly one σ above μ, so z = (183 − 176) : 7 = 1. Every normal distribution becomes the standard normal distribution with μ = 0 and σ = 1.") },
  { von: 13, text: zw("Für die Standardnormalverteilung gibt es die Funktion Φ (Tabelle oder Taschenrechner): P(X ≤ 183) = Φ(1) ≈ 0,8413. Rund 84 % der Jungen sind höchstens 183 cm groß.", "For the standard normal distribution there is the function Φ (table or calculator): P(X ≤ 183) = Φ(1) ≈ 0.8413. About 84 % of the boys are at most 183 cm tall.") },
  { von: 17.5, text: zw("Größer als 183 cm ist die restliche Fläche: P(X > 183) = 1 − Φ(1) ≈ 0,1587. Die Gesamtfläche ist ja 1.", "Taller than 183 cm is the remaining area: P(X > 183) = 1 − Φ(1) ≈ 0.1587. The total area is 1, after all.") },
  { von: 22.5, text: zw("Zwischen zwei Werten: große Fläche minus kleine Fläche. P(169 ≤ X ≤ 183) = Φ(1) − Φ(−1) ≈ 0,6827.", "Between two values: big area minus small area. P(169 ≤ X ≤ 183) = Φ(1) − Φ(−1) ≈ 0.6827.") },
];
function fZeichne(t) {
  const links = lauf(t, 4.4, 6.6), aus1 = lauf(t, 17.6, 18.2);
  const rechts = lauf(t, 18.2, 19.4) * (1 - lauf(t, 22.6, 23.2));
  const mitte = lauf(t, 23.2, 24.6);
  const zLab = lauf(t, 9.4, 10.6);
  const bLinks = mix(-3.7, 1, links);
  return (
    <g>
      <Achse ticks={[-2, -1, 0, 1, 2]} labels={["162", "169", "176", "183", "190"]} farbe={C.see} />
      <g opacity={zLab}>
        {[-2, -1, 0, 1, 2].map((v) => <T key={v} x={sx(v)} y={Y + 33} textAnchor="middle" fontSize="11" fontWeight="800" fill={C.gruenDunkel}>{kz(v)}</T>)}
        <T x={sx(3.4)} y={Y + 33} textAnchor="middle" fontSize="11" fontWeight="800" fill={C.gruenDunkel}>z</T>
        <T x={sx(3.4)} y={Y + 17} textAnchor="middle" fontSize="11" fontWeight="800" fill={C.see}>cm</T>
      </g>
      {links > 0.001 && aus1 < 0.999 && <path d={flaeche(0, 1, -3.7, bLinks)} fill={`${C.flaggold}66`} stroke={C.flaggold} strokeWidth="1" opacity={1 - aus1} />}
      {rechts > 0.001 && <path d={flaeche(0, 1, 1, 3.7)} fill={`${C.see}40`} stroke={C.see} strokeWidth="1" opacity={rechts} />}
      {mitte > 0.001 && <path d={flaeche(0, 1, -1, 1)} fill={`${C.smaragd}44`} stroke={C.smaragd} strokeWidth="1" opacity={mitte} />}
      <path d={kurve(0, 1)} fill="none" stroke={C.see} strokeWidth="3" strokeLinecap="round" opacity={lauf(t, 0.2, 1.4)} />
      <T x="180" y="26" textAnchor="middle" fontSize="13.5" fontWeight="700" fill={C.grau} opacity={fenster(t, 0.6, 1.4, 4, 4.5)}>{zw("μ = 176 cm, σ = 7 cm", "μ = 176 cm, σ = 7 cm")}</T>
      <Pille y={32} text="P(X ≤ 183)" o={fenster(t, 5, 5.8, 8.2, 8.6)} farbe={C.gruenDunkel} />
      <Formel y={10} h={46} s={"$z = \\frac{183 - 176}{7} = 1$"} o={fenster(t, 8.6, 9.4, 12.8, 13.3)} groesse={17} />
      <Pille y={32} text="P(X ≤ 183) = Φ(1) ≈ 0,8413" o={fenster(t, 13.4, 14.2, 17.4, 17.8)} farbe={C.gruenDunkel} />
      <Pille y={32} text="P(X > 183) = 1 − Φ(1) ≈ 0,1587" o={fenster(t, 19, 19.8, 22.4, 22.8)} farbe={C.see} />
      <Pille y={32} text="Φ(1) − Φ(−1) ≈ 0,6827" o={lauf(t, 24.4, 25.2)} farbe={C.smaragd} />
    </g>
  );
}

/* ======================================================================
   SZENE 4 · Sigma-Regeln
   ====================================================================== */
const S_DAUER = 25;
const sSchritte = () => [
  { von: 0, text: zw("Wie viel Fläche liegt in der Nähe von μ? Wir messen den Abstand in Vielfachen von σ – das gilt für jede Normalverteilung gleich.", "How much area lies near μ? We measure the distance in multiples of σ – this works the same for every normal distribution.") },
  { von: 3, text: zw("Im Intervall [μ − σ; μ + σ] liegen etwa 68,3 % der Werte – gut zwei Drittel.", "About 68.3 % of the values lie in the interval [μ − σ; μ + σ] – a good two thirds.") },
  { von: 8, text: zw("Im Intervall [μ − 2σ; μ + 2σ] liegen etwa 95,4 %.", "About 95.4 % lie in the interval [μ − 2σ; μ + 2σ].") },
  { von: 13, text: zw("Im Intervall [μ − 3σ; μ + 3σ] liegen etwa 99,7 % – Werte außerhalb sind sehr selten.", "About 99.7 % lie in the interval [μ − 3σ; μ + 3σ] – values outside are very rare.") },
  { von: 18, text: zw("Für runde Prozentsätze: Genau 95 % liegen in μ ± 1,96σ, je 2,5 % in den beiden Rändern. Diese Werte brauchst du für Prognose- und Vertrauensintervalle.", "For round percentages: exactly 95 % lie within μ ± 1.96σ, 2.5 % in each tail. You need these values for prediction and confidence intervals.") },
];
function sZeichne(t) {
  const k1 = fenster(t, 3.4, 4.4, 8, 8.4), k2 = fenster(t, 8.4, 9.4, 13, 13.4), k3 = fenster(t, 13.4, 14.4, 18, 18.4), k96 = lauf(t, 18.6, 19.6);
  const breite = (k) => (lauf(t, k === 1 ? 3.4 : k === 2 ? 8.4 : 13.4, k === 1 ? 5 : k === 2 ? 10 : 15));
  const band = (k, o, farbe) => o > 0.001 && <path d={flaeche(0, 1, -k * breite(k), k * breite(k))} fill={`${farbe}55`} stroke={farbe} strokeWidth="1" opacity={o} />;
  return (
    <g>
      <Achse ticks={[-3, -2, -1, 0, 1, 2, 3]} labels={["μ−3σ", "μ−2σ", "μ−σ", "μ", "μ+σ", "μ+2σ", "μ+3σ"]} />
      {band(1, k1, C.flaggold)}
      {band(2, k2, C.smaragd)}
      {band(3, k3, C.see)}
      {k96 > 0.001 && <path d={flaeche(0, 1, -1.96, 1.96)} fill={`${C.flaggold}55`} stroke={C.flaggold} strokeWidth="1" opacity={k96} />}
      {k96 > 0.001 && <path d={flaeche(0, 1, 1.96, 3.7)} fill={`${C.signal}55`} opacity={k96} />}
      {k96 > 0.001 && <path d={flaeche(0, 1, -3.7, -1.96)} fill={`${C.signal}55`} opacity={k96} />}
      <path d={kurve(0, 1)} fill="none" stroke={C.see} strokeWidth="3" strokeLinecap="round" opacity={lauf(t, 0.2, 1.2)} />
      <Pille y={32} text="≈ 68,3 %" o={lauf(t, 4.6, 5.2) * k1} farbe={C.gruenDunkel} />
      <Pille y={32} text="≈ 95,4 %" o={lauf(t, 9.6, 10.2) * k2} farbe={C.smaragd} />
      <Pille y={32} text="≈ 99,7 %" o={lauf(t, 14.6, 15.2) * k3} farbe={C.see} />
      <Pille y={32} text={zw("μ ± 1,96σ: 95 %", "μ ± 1.96σ: 95 %")} o={lauf(t, 19.4, 20.2)} farbe={C.gruenDunkel} />
      <T x={sx(2.75)} y={Y - 26} textAnchor="middle" fontSize="12" fontWeight="800" fill={C.signal} opacity={lauf(t, 20.6, 21.4)}>2,5 %</T>
      <T x={sx(-2.75)} y={Y - 26} textAnchor="middle" fontSize="12" fontWeight="800" fill={C.signal} opacity={lauf(t, 20.6, 21.4)}>2,5 %</T>
    </g>
  );
}

export const NV_ANIM = {
  glocke: { titel: () => zw("Vom Histogramm zur Glockenkurve", "From histogram to bell curve"), unter: () => zw("Binomialverteilung mit wachsendem n, stetige Zufallsgrößen", "Binomial distribution with growing n, continuous random variables"),
    szene: () => ({ dauer: G_DAUER, hoehe: 240, schritte: gSchritte(), zeichne: gZeichne,
      beschreibung: zw("Animation: Histogramme von B(10; 0,5), B(30; 0,5) und B(100; 0,5) liegen standardisiert immer genauer auf der Glockenkurve. Wahrscheinlichkeiten sind Flächen; ein einzelner Wert hat Fläche 0.", "Animation: standardised histograms of B(10; 0.5), B(30; 0.5) and B(100; 0.5) lie ever closer to the bell curve. Probabilities are areas; a single value has area 0.") }) },
  parameter: { titel: () => zw("Was μ und σ mit der Glocke machen", "What μ and σ do to the bell"), unter: () => zw("Verschieben, strecken, Wendestellen bei μ ± σ", "Shifting, stretching, inflection points at μ ± σ"),
    szene: () => ({ dauer: P_DAUER, hoehe: 240, schritte: pSchritte(), zeichne: pZeichne,
      beschreibung: zw("Animation: Die Dichtefunktion der Normalverteilung. μ verschiebt die Kurve, σ macht sie breiter oder schmaler, die Fläche bleibt 1. Die Wendestellen liegen bei μ − σ und μ + σ.", "Animation: the density of the normal distribution. μ shifts the curve, σ makes it wider or narrower, the area stays 1. The inflection points are at μ − σ and μ + σ.") }) },
  flaeche: { titel: () => zw("Wahrscheinlichkeit = Fläche", "Probability = area"), unter: () => zw("Standardisieren und Φ ablesen", "Standardise and read off Φ"),
    szene: () => ({ dauer: F_DAUER, hoehe: 240, schritte: fSchritte(), zeichne: fZeichne,
      beschreibung: zw("Animation: P(X ≤ 183) bei μ = 176 und σ = 7 als Fläche, Standardisieren zu z = 1, Φ(1) ≈ 0,8413, Gegenwahrscheinlichkeit 0,1587 und Intervall Φ(1) − Φ(−1) ≈ 0,6827.", "Animation: P(X ≤ 183) with μ = 176 and σ = 7 as an area, standardising to z = 1, Φ(1) ≈ 0.8413, complement 0.1587 and interval Φ(1) − Φ(−1) ≈ 0.6827.") }) },
  sigma: { titel: () => zw("Die Sigma-Regeln", "The sigma rules"), unter: () => zw("68,3 %, 95,4 %, 99,7 % – und μ ± 1,96σ", "68.3 %, 95.4 %, 99.7 % – and μ ± 1.96σ"),
    szene: () => ({ dauer: S_DAUER, hoehe: 240, schritte: sSchritte(), zeichne: sZeichne,
      beschreibung: zw("Animation: Die Flächen über [μ − kσ; μ + kσ] für k = 1, 2, 3 betragen etwa 68,3 %, 95,4 % und 99,7 %. 95 % liegen in μ ± 1,96σ.", "Animation: the areas over [μ − kσ; μ + kσ] for k = 1, 2, 3 are about 68.3 %, 95.4 % and 99.7 %. 95 % lie within μ ± 1.96σ.") }) },
};

export function NormalAnimation({ art, offen = false }) {
  return <AnimKarte szenen={NV_ANIM} art={art} offen={offen} merkmal="data-nv-anim" />;
}
export { Phi };
