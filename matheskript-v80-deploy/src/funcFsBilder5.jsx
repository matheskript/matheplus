/* ======================================================================
   FORMELSAMMLUNG · Illustrationen Teil 5: Analysis (Ergänzungen)
   Ableitungsregeln im Zahlenbeispiel, Potenzschreibweisen, Stammfunktionen,
   Substitution, Integralregeln, Umkehrregel, Symmetrie bei Integralen.
   Jede Illustration ist interaktiv und rechnet mit den gezeigten Zahlen.
   ====================================================================== */
import React, { useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { Achsen, F, Griff, Hinweis, Messzeile, Punkt, Regler, Txt, Umschalter, klemm, koord, svgStil, useZiehen, z } from "./funcFsBasis.jsx";

const ableit = (f, x, h = 1e-5) => (f(x + h) - f(x - h)) / (2 * h);
/* Zahl in Klammern, wenn negativ (für Faktoren und Subtrahenden) */
const kl = (v) => (v < -1e-9 ? `(${z(v)})` : z(v));
/* Integral per Trapezregel (fein genug für die Anzeige) */
const integ = (f, a, b, n = 600) => { let s = 0; const h = (b - a) / n; for (let i = 0; i <= n; i++) s += (i === 0 || i === n ? 0.5 : 1) * f(a + i * h); return s * h; };
/* Tangentenstück um x */
const stueck = (k, f, m, x, br = 1) => `M${k.px(x - br)} ${k.py(f(x) - m * br)} L${k.px(x + br)} ${k.py(f(x) + m * br)}`;

/* ---------- Summen-, Differenz- und Quotientenregel im Zahlenbeispiel ---------- */
const uF = (x) => 0.3 * x * x - 0.8 * x + 2, uD = (x) => 0.6 * x - 0.8;
const vF = (x) => 1.2 + 0.5 * Math.sin(0.8 * x), vD = (x) => 0.4 * Math.cos(0.8 * x);

function RegelProbe({ art = "summe" }) {
  const [x, setX] = useState(2.2);
  const R = art === "summe" ? (t) => uF(t) + vF(t) : art === "differenz" ? (t) => uF(t) - vF(t) : (t) => uF(t) / vF(t);
  const Rd = art === "summe" ? (t) => uD(t) + vD(t) : art === "differenz" ? (t) => uD(t) - vD(t)
    : (t) => (uD(t) * vF(t) - uF(t) * vD(t)) / vF(t) ** 2;
  const k = koord({ x0: -1, x1: 5, y0: -1.2, y1: 7, w: 340, h: 250 });
  const zieh = useZiehen(([sx]) => { setX(klemm(k.ix(sx), -0.6, 4.6)); return true; });
  const a = uD(x), b = vD(x), U = uF(x), V = vF(x), res = Rd(x), num = ableit(R, x);
  const name = art === "summe" ? "u + v" : art === "differenz" ? "u − v" : "u : v";
  return (
    <div>
      <Hinweis>Ziehe die senkrechte Linie. Die Steigung der goldenen Tangente an »{name}« lässt sich aus den Steigungen von u und v ausrechnen – ohne den Graphen anzusehen.</Hinweis>
      <svg viewBox="0 0 340 250" style={svgStil} {...zieh} role="img" aria-label={`Graphen von u, v und ${name} mit Tangente`}>
        <Achsen k={k} />
        <path d={k.kurve(uF)} fill="none" stroke={F.see} strokeWidth="2" />
        <path d={k.kurve(vF)} fill="none" stroke={F.rosaKraeftig} strokeWidth="2" />
        <path d={k.kurve(R)} fill="none" stroke={F.tinte} strokeWidth="2.8" />
        <line x1={k.px(x)} x2={k.px(x)} y1={k.py(-1.2)} y2={k.py(7)} stroke={F.achse} strokeDasharray="4 4" />
        <path d={stueck(k, R, res, x, 1.1)} fill="none" stroke={F.gold3} strokeWidth="3" strokeLinecap="round" />
        <Punkt x={k.px(x)} y={k.py(R(x))} farbe={F.tinte} />
        <Punkt x={k.px(x)} y={k.py(U)} farbe={F.see} r={3.6} />
        <Punkt x={k.px(x)} y={k.py(V)} farbe={F.rosaKraeftig} r={3.6} />
        <Txt x={k.px(4.8)} y={k.py(uF(4.8)) + 14} farbe={F.see} anker="end">u</Txt>
        <Txt x={k.px(4.8)} y={k.py(vF(4.8)) - 8} farbe={F.rosaKraeftig} anker="end">v</Txt>
        <Txt x={k.px(-0.8)} y={k.py(R(-0.8)) - 8} farbe={F.tinte} anker="start">{name}</Txt>
        <Griff x={k.px(x)} y={k.py(R(x))} farbe={F.gold3} />
      </svg>
      <Regler label="x" wert={x} setze={setX} min={-0.6} max={4.6} schritt={0.05} anzeige={z(x)} />
      <Messzeile>
        {art === "summe" && <>
          <div><span style={{ color: F.see, fontWeight: 700 }}>u′ </span><M t={`= ${z(a)}`} /> <span style={{ color: F.rosaKraeftig, fontWeight: 700, marginLeft: 10 }}>v′ </span><M t={`= ${z(b)}`} /></div>
          <div><M t={`(u + v)′ = u′ + v′ = ${z(a)} ${b < 0 ? "-" : "+"} ${z(Math.abs(b))} = ${z(res)}`} /></div>
        </>}
        {art === "differenz" && <>
          <div><span style={{ color: F.see, fontWeight: 700 }}>u′ </span><M t={`= ${z(a)}`} /> <span style={{ color: F.rosaKraeftig, fontWeight: 700, marginLeft: 10 }}>v′ </span><M t={`= ${z(b)}`} /></div>
          <div><M t={`(u - v)′ = u′ - v′ = ${z(a)} - ${kl(b)} = ${z(res)}`} /></div>
        </>}
        {art === "quotient" && <>
          <div><M t={`u = ${z(U)}, \\; v = ${z(V)}, \\; u′ = ${z(a)}, \\; v′ = ${z(b)}`} /></div>
          <div><M t={`\\left(\\frac{u}{v}\\right)′ = \\frac{u′v - uv′}{v^2} = \\frac{${kl(a)} \\cdot ${z(V)} - ${z(U)} \\cdot ${kl(b)}}{${z(V)}^2} = ${z(res)}`} /></div>
        </>}
        <div style={{ color: C.grau, fontSize: 13, marginTop: 4 }}>Kontrolle mit einem winzigen h: Steigung ≈ <b style={{ color: C.tinte }}>{z(num)}</b> ✓</div>
      </Messzeile>
    </div>
  );
}

/* ---------- Bruch und Wurzel als Potenz: zwei Schreibweisen, ein Graph ---------- */
function GleichGraph({ art = "bruch" }) {
  const [n, setN] = useState(2);
  const [w, setW] = useState(0);
  const [x, setX] = useState(1.6);
  if (art === "bruch") {
    const k = koord({ x0: -3.5, x1: 3.5, y0: -3, y1: 6, w: 340, h: 250 });
    const A = (t) => 1 / t ** n, B = (t) => t ** -n;
    return (
      <div>
        <Hinweis>Der Graph von 1/xⁿ (blau) liegt exakt auf dem Graph von x⁻ⁿ (gold). Es sind zwei Namen für dieselbe Funktion.</Hinweis>
        <svg viewBox="0 0 340 250" style={svgStil} role="img" aria-label={`Graphen von 1 durch x hoch ${n} und x hoch minus ${n}`}>
          <Achsen k={k} />
          <path d={k.kurve(B)} fill="none" stroke={F.gold2} strokeWidth="6" strokeLinecap="round" />
          <path d={k.kurve(A)} fill="none" stroke={F.see} strokeWidth="2.2" />
          <line x1={k.px(x)} x2={k.px(x)} y1={k.py(0)} y2={k.py(A(x))} stroke={F.achse} strokeDasharray="3 3" />
          <Punkt x={k.px(x)} y={k.py(A(x))} farbe={F.tinte} />
        </svg>
        <Umschalter label="Exponent n" wert={n} setze={setN} optionen={[1, 2, 3, 4].map((v) => [v, `n = ${v}`])} />
        <Regler label="x" wert={x} setze={setX} min={0.4} max={3} schritt={0.05} anzeige={z(x)} />
        <Messzeile>
          <div><M t={`\\frac{1}{${z(x)}^{${n}}} = ${z(A(x))}`} /></div>
          <div><M t={`${z(x)}^{-${n}} = ${z(B(x))}`} /></div>
        </Messzeile>
      </div>
    );
  }
  const k = koord({ x0: -0.3, x1: 6, y0: -0.4, y1: 4, w: 340, h: 240 });
  const A = w === 0 ? (t) => Math.sqrt(t) : (t) => 1 / Math.sqrt(t);
  const B = w === 0 ? (t) => t ** 0.5 : (t) => t ** -0.5;
  const xs = Math.max(x, 0.3);
  return (
    <div>
      <Hinweis>Soll das Potenzgesetz auch für Brüche gelten, muss (x^½)² wieder x ergeben. Genau das tut die Wurzel – beide Graphen liegen aufeinander.</Hinweis>
      <svg viewBox="0 0 340 240" style={svgStil} role="img" aria-label="Graph der Wurzelfunktion und ihrer Potenzschreibweise">
        <Achsen k={k} />
        <path d={k.kurve(B, 0.02, 6)} fill="none" stroke={F.gold2} strokeWidth="6" strokeLinecap="round" />
        <path d={k.kurve(A, 0.02, 6)} fill="none" stroke={F.see} strokeWidth="2.2" />
        <line x1={k.px(xs)} x2={k.px(xs)} y1={k.py(0)} y2={k.py(A(xs))} stroke={F.achse} strokeDasharray="3 3" />
        <Punkt x={k.px(xs)} y={k.py(A(xs))} farbe={F.tinte} />
      </svg>
      <Umschalter label="Welche Wurzel" wert={w} setze={setW} optionen={[[0, "√x = x^½"], [1, "1/√x = x^−½"]]} />
      <Regler label="x" wert={xs} setze={setX} min={0.3} max={5.8} schritt={0.05} anzeige={z(xs)} />
      <Messzeile>
        {w === 0
          ? <><div><M t={`\\sqrt{${z(xs)}} = ${z(Math.sqrt(xs))} = ${z(xs)}^{\\frac{1}{2}}`} /></div><div><M t={`\\left(${z(xs)}^{\\frac{1}{2}}\\right)^2 = ${z(xs)}`} /></div></>
          : <><div><M t={`\\frac{1}{\\sqrt{${z(xs)}}} = ${z(1 / Math.sqrt(xs))} = ${z(xs)}^{-\\frac{1}{2}}`} /></div></>}
      </Messzeile>
    </div>
  );
}

/* ---------- Stammfunktionen: die Tangente an F hat die Steigung f(x) ---------- */
function exTex(n) { return n === 0 ? "x" : `\\frac{1}{${n + 1}} x^{${n + 1}}`; }
function StammTafel({ start = "pot" }) {
  const [modus, setModus] = useState(start);
  const [n, setN] = useState(2);
  const [x, setX] = useState(1);
  const D = {
    pot: { f: (t) => t ** n, F: (t) => t ** (n + 1) / (n + 1), r: [-2.6, 2.6, -3.2, 3.2], xr: [-2.2, 2.2], ft: `x^{${n}}`, Ft: exTex(n), a: -2.6, b: 2.6 },
    exp: { f: Math.exp, F: Math.exp, r: [-3, 2.4, -1, 5], xr: [-2.5, 1.5], ft: "e^x", Ft: "e^x", a: -3, b: 2.4 },
    kehr: { f: (t) => 1 / t, F: Math.log, r: [-0.4, 5.2, -2.6, 3], xr: [0.4, 4.6], ft: "\\frac{1}{x}", Ft: "\\ln x", a: 0.04, b: 5.2 },
    sin: { f: Math.sin, F: (t) => -Math.cos(t), r: [-0.8, 7, -2.2, 2.2], xr: [-0.4, 6.4], ft: "\\sin x", Ft: "-\\cos x", a: -0.8, b: 7 },
    cos: { f: Math.cos, F: Math.sin, r: [-0.8, 7, -2.2, 2.2], xr: [-0.4, 6.4], ft: "\\cos x", Ft: "\\sin x", a: -0.8, b: 7 },
  }[modus];
  const k = koord({ x0: D.r[0], x1: D.r[1], y0: D.r[2], y1: D.r[3], w: 340, h: 250 });
  const xs = klemm(x, D.xr[0], D.xr[1]);
  const fx = D.f(xs), Fx = D.F(xs), mF = ableit(D.F, xs);
  const zieh = useZiehen(([sx]) => { setX(klemm(k.ix(sx), D.xr[0], D.xr[1])); return true; });
  const br = (D.r[1] - D.r[0]) / 9;
  const wechsel = (m) => { setModus(m); const xr = { pot: [-2.2, 2.2], exp: [-2.5, 1.5], kehr: [0.4, 4.6], sin: [-0.4, 6.4], cos: [-0.4, 6.4] }[m]; setX(klemm(m === "kehr" ? 1.5 : m === "pot" || m === "exp" ? 1 : 1.2, xr[0], xr[1])); };
  return (
    <div>
      <Hinweis>Ziehe den Punkt auf F (blau). Die Steigung der Tangente an F ist genau die Höhe der Funktion f (gold gestrichelt) an derselben Stelle – so ist eine Stammfunktion definiert.</Hinweis>
      <svg viewBox="0 0 340 250" style={svgStil} {...zieh} role="img" aria-label="Funktion f, Stammfunktion F und Tangente an F">
        <Achsen k={k} />
        <path d={k.kurve(D.f, D.a, D.b)} fill="none" stroke={F.gold3} strokeWidth="2" strokeDasharray="6 4" />
        <path d={k.kurve(D.F, D.a, D.b)} fill="none" stroke={F.see} strokeWidth="2.8" />
        <path d={`M${k.px(xs - br)} ${k.py(Fx - mF * br)} L${k.px(xs + br)} ${k.py(Fx + mF * br)}`} fill="none" stroke={F.rosaKraeftig} strokeWidth="2.4" strokeLinecap="round" />
        {Math.abs(fx) < D.r[3] && <>
          <line x1={k.px(xs)} x2={k.px(xs)} y1={k.py(Fx)} y2={k.py(fx)} stroke={F.achse} strokeDasharray="3 3" />
          <Punkt x={k.px(xs)} y={k.py(fx)} farbe={F.gold3} />
        </>}
        <Griff x={k.px(xs)} y={k.py(Fx)} farbe={F.see} />
        <Txt x={k.px(D.r[0]) + 8} y={14} farbe={F.see} anker="start">F</Txt>
        <Txt x={k.px(D.r[0]) + 26} y={14} farbe={F.gold3} anker="start">f</Txt>
      </svg>
      <Umschalter label="Funktion" wert={modus} setze={wechsel} optionen={[["pot", "xⁿ"], ["exp", "eˣ"], ["kehr", "1/x"], ["sin", "sin"], ["cos", "cos"]]} />
      {modus === "pot" && <Umschalter label="Exponent" wert={n} setze={setN} optionen={[0, 1, 2, 3].map((v) => [v, `n = ${v}`])} />}
      <Regler label="x" wert={xs} setze={setX} min={D.xr[0]} max={D.xr[1]} schritt={0.05} anzeige={z(xs)} />
      <Messzeile>
        <div><M t={`f(x) = ${D.ft}, \\quad F(x) = ${D.Ft}`} /></div>
        <div><M t={`F′(${z(xs)}) \\approx ${z(mF)} = f(${z(xs)}) = ${z(fx)}`} /></div>
      </Messzeile>
    </div>
  );
}

/* ---------- Lineare Substitution: Stauchen in x-Richtung ---------- */
const hump = (t) => 4 * t - t * t;
function LinSubst() {
  const [a, setA] = useState(2);
  const [b, setB] = useState(0);
  const k = koord({ x0: -5, x1: 10, y0: -1, y1: 5, w: 340, h: 230 });
  const g = (t) => hump(a * t + b);
  const p = -b / a, q = (4 - b) / a;
  const rest = 32 / 3;
  return (
    <div>
      <Hinweis>g(x) = f(ax + b) ist f, in x-Richtung um den Faktor a gestaucht und verschoben. Die Fläche schrumpft mit – deshalb der Faktor 1/a in der Stammfunktion.</Hinweis>
      <svg viewBox="0 0 340 230" style={svgStil} role="img" aria-label="Graph von f und von f(ax+b) mit Flächen">
        <Achsen k={k} schritt={1} beschriften={false} />
        <path d={k.flaeche(hump, 0, 4)} fill={F.blau} opacity="0.7" />
        <path d={k.flaeche(g, p, q)} fill={F.gold2} opacity="0.75" />
        <path d={k.kurve(hump, -0.5, 4.5)} fill="none" stroke={F.see} strokeWidth="2.4" />
        <path d={k.kurve(g, p - 0.5, q + 0.5)} fill="none" stroke={F.gold3} strokeWidth="2.6" />
        <Txt x={k.px(2)} y={k.py(4) - 8} farbe={F.see}>f</Txt>
        <Txt x={k.px((p + q) / 2)} y={k.py(4) - 8} farbe={F.gold3}>g</Txt>
      </svg>
      <Regler label="a" wert={a} setze={setA} min={0.5} max={3} schritt={0.1} anzeige={z(a)} />
      <Regler label="b" wert={b} setze={setB} min={-1} max={2} schritt={0.1} anzeige={z(b)} />
      <Messzeile>
        <div><M t={`\\int f = \\frac{32}{3} \\approx ${z(rest)}`} /> <span style={{ color: C.grau, fontSize: 13 }}>(blau)</span></div>
        <div><M t={`\\int g = \\frac{1}{${z(a)}} \\cdot \\frac{32}{3} \\approx ${z(rest / a)}`} /> <span style={{ color: C.grau, fontSize: 13 }}>(gold, Breite {z(4 / a)} statt 4)</span></div>
      </Messzeile>
    </div>
  );
}

/* ---------- Faktor- und Summenregel beim Integrieren: Flächen stapeln ---------- */
const iF = (t) => 0.15 * t * t + 0.3, iG = (t) => 0.8 + 0.5 * Math.sin(1.1 * t);
function IntegralRegeln() {
  const [c, setC] = useState(1.5);
  const k = koord({ x0: -0.5, x1: 4.5, y0: -0.5, y1: 8.6, w: 340, h: 250 });
  const cf = (t) => c * iF(t), cfg = (t) => c * iF(t) + iG(t);
  const A = integ(iF, 0, 4), B = integ(iG, 0, 4), T = integ(cfg, 0, 4);
  return (
    <div>
      <Hinweis>Zuerst die Fläche unter c·f (rosa), darauf die Fläche von g (blau). Die Gesamtfläche ist die Summe – und c·f ist c-mal so groß wie f.</Hinweis>
      <svg viewBox="0 0 340 250" style={svgStil} role="img" aria-label="Gestapelte Flächen unter c mal f und g">
        <Achsen k={k} schritt={1} ySchritt={2} />
        <path d={k.flaeche(cf, 0, 4)} fill={F.rosa} opacity="0.9" />
        <path d={k.flaeche(cfg, 0, 4, cf)} fill={F.blauMittel} opacity="0.7" />
        <path d={k.kurve(cf, 0, 4)} fill="none" stroke={F.rosaKraeftig} strokeWidth="2.2" />
        <path d={k.kurve(cfg, 0, 4)} fill="none" stroke={F.see} strokeWidth="2.4" />
        <Txt x={k.px(2)} y={k.py(cf(2) / 2)} farbe={F.rosaKraeftig}>c · f</Txt>
        <Txt x={k.px(1)} y={k.py(cfg(1)) - 8} farbe={F.see}>c · f + g</Txt>
      </svg>
      <Regler label="c" wert={c} setze={setC} min={0.5} max={2.5} schritt={0.1} anzeige={z(c)} />
      <Messzeile>
        <div><M t={`\\int_0^4 f = ${z(A)}, \\quad \\int_0^4 g = ${z(B)}`} /></div>
        <div><M t={`\\int_0^4 (c f + g) = ${z(c)} \\cdot ${z(A)} + ${z(B)} = ${z(T)}`} /></div>
      </Messzeile>
    </div>
  );
}

/* ---------- Umkehrregel: Spiegeln an y = x macht aus m den Kehrwert ---------- */
const UK = {
  quad: { f: (t) => t * t, d: (t) => 2 * t, inv: Math.sqrt, a: 0, b: 2.05, ia: 0, ib: 4.3, x: [0.35, 1.9], t: "x^2", it: "\\sqrt{x}" },
  exp: { f: Math.exp, d: Math.exp, inv: Math.log, a: -1.6, b: 1.45, ia: 0.05, ib: 4.3, x: [-1, 1.35], t: "e^x", it: "\\ln x" },
  kub: { f: (t) => t ** 3, d: (t) => 3 * t * t, inv: Math.cbrt, a: -1.6, b: 1.62, ia: -1.6, ib: 4.3, x: [0.35, 1.55], t: "x^3", it: "\\sqrt[3]{x}" },
};
function Umkehr() {
  const [w, setW] = useState("quad");
  const [x, setX] = useState(1);
  const D = UK[w];
  const k = koord({ x0: -1.6, x1: 4.3, y0: -1.6, y1: 4.3, w: 300, h: 300, rand: 12 });
  const xs = klemm(x, D.x[0], D.x[1]);
  const y = D.f(xs), m = D.d(xs);
  const zieh = useZiehen(([sx]) => { setX(klemm(k.ix(sx), D.x[0], D.x[1])); return true; });
  const kurz = (t, mm, px, py, br) => `M${k.px(px - br)} ${k.py(py - mm * br)} L${k.px(px + br)} ${k.py(py + mm * br)}`;
  return (
    <div>
      <Hinweis>Der Graph der Umkehrfunktion entsteht durch Spiegeln an der Winkelhalbierenden. Dabei vertauschen sich x und y – aus der Steigung m wird 1/m.</Hinweis>
      <svg viewBox="0 0 300 300" style={{ ...svgStil, maxWidth: 360 }} {...zieh} role="img" aria-label="Funktion, Umkehrfunktion und beide Tangenten">
        <Achsen k={k} beschriften={false} />
        <path d={`M${k.px(-1.6)} ${k.py(-1.6)} L${k.px(4.3)} ${k.py(4.3)}`} stroke={F.achse} strokeWidth="1.3" strokeDasharray="5 4" />
        <path d={k.kurve(D.f, D.a, D.b)} fill="none" stroke={F.see} strokeWidth="2.6" />
        <path d={k.kurve(D.inv, D.ia, D.ib)} fill="none" stroke={F.gold3} strokeWidth="2.6" />
        <line x1={k.px(xs)} y1={k.py(y)} x2={k.px(y)} y2={k.py(xs)} stroke={F.achse} strokeDasharray="3 3" />
        <path d={kurz(0, m, xs, y, 0.7)} fill="none" stroke={F.see} strokeWidth="2" opacity="0.75" />
        <path d={kurz(0, 1 / m, y, xs, 0.7)} fill="none" stroke={F.gold3} strokeWidth="2" opacity="0.85" />
        <Punkt x={k.px(y)} y={k.py(xs)} farbe={F.gold3} />
        <Griff x={k.px(xs)} y={k.py(y)} farbe={F.see} />
        <Txt x={k.px(4.2)} y={k.py(4.3) + 30} farbe={F.tinte} anker="end" fett={false} kursiv>y = x</Txt>
      </svg>
      <Umschalter label="Funktion" wert={w} setze={(v) => { setW(v); setX(1); }} optionen={[["quad", "x²"], ["exp", "eˣ"], ["kub", "x³"]]} />
      <Regler label="x" wert={xs} setze={setX} min={D.x[0]} max={D.x[1]} schritt={0.05} anzeige={z(xs)} />
      <Messzeile>
        <div><M t={`f(x) = ${D.t}: \\; f′(${z(xs)}) = ${z(m)}`} /></div>
        <div><M t={`f^{-1}(x) = ${D.it}: \\; (f^{-1})′(${z(y)}) = \\frac{1}{${z(m)}} = ${z(1 / m)}`} /></div>
      </Messzeile>
    </div>
  );
}

/* ---------- Integral über symmetrische Grenzen ---------- */
function IntegralSym() {
  const [modus, setModus] = useState("ungerade");
  const [a, setA] = useState(1.8);
  const ung = modus === "ungerade";
  const f = ung ? (t) => 0.25 * t ** 3 : (t) => 0.5 * t * t;
  const k = koord({ x0: -3, x1: 3, y0: -4.5, y1: 4.5, w: 340, h: 230 });
  const rechts = ung ? a ** 4 / 16 : a ** 3 / 6;
  return (
    <div>
      <Hinweis>{ung ? "Bei einem ungeraden f (punktsymmetrisch) hebt sich die Fläche links der y-Achse gegen die rechts auf." : "Bei einem geraden f (achsensymmetrisch) ist die Fläche links genauso groß wie rechts – man rechnet nur eine Seite und verdoppelt."}</Hinweis>
      <svg viewBox="0 0 340 230" style={svgStil} role="img" aria-label="Fläche über symmetrischen Grenzen">
        <Achsen k={k} schritt={1} ySchritt={2} />
        <path d={k.flaeche(f, 0, a)} fill={F.blauMittel} opacity="0.65" />
        <path d={k.flaeche(f, -a, 0)} fill={ung ? F.rosa : F.blauMittel} opacity="0.8" />
        <path d={k.kurve(f)} fill="none" stroke={F.see} strokeWidth="2.6" />
        <Txt x={k.px(-a / 2)} y={k.py(ung ? -1.4 : 1.2)} farbe={ung ? F.rosaKraeftig : F.see}>{ung ? "−" : "+"}</Txt>
        <Txt x={k.px(a / 2)} y={k.py(ung ? 1.2 : 1.2)} farbe={F.see}>+</Txt>
      </svg>
      <Umschalter label="Symmetrie" wert={modus} setze={setModus} optionen={[["ungerade", "ungerade: f(−x) = −f(x)"], ["gerade", "gerade: f(−x) = f(x)"]]} />
      <Regler label="a" wert={a} setze={setA} min={0.3} max={2.8} schritt={0.1} anzeige={z(a)} />
      <Messzeile>
        {ung
          ? <div><M t={`\\int_{-${z(a)}}^{${z(a)}} f \\, dx = -${z(rechts)} + ${z(rechts)} = 0`} /></div>
          : <div><M t={`\\int_{-${z(a)}}^{${z(a)}} f \\, dx = 2 \\cdot ${z(rechts)} = ${z(2 * rechts)}`} /></div>}
      </Messzeile>
    </div>
  );
}

/* ---------- Mittelwertsatz: irgendwo ist die Tangente parallel zur Sekante ---------- */
const fM = (x) => 0.12 * x ** 3 - 0.5 * x ** 2 + 0.3 * x + 2, fM1 = (x) => 0.36 * x * x - x + 0.3;
function Mittelwertsatz() {
  const [a, setA] = useState(0.3);
  const [b, setB] = useState(3.9);
  const k = koord({ x0: -1.5, x1: 4.5, y0: -0.4, y1: 4.06, w: 340, h: 260 });
  const m = (fM(b) - fM(a)) / (b - a);
  /* Stellen ξ mit f′(ξ) = m: Vorzeichenwechsel von f′ − m suchen, dann verfeinern */
  const xis = [];
  const N = 800;
  for (let i = 0; i < N; i++) {
    const x1 = a + ((b - a) * i) / N, x2 = a + ((b - a) * (i + 1)) / N;
    const g1 = fM1(x1) - m, g2 = fM1(x2) - m;
    if (g1 === 0 || g1 * g2 < 0) {
      let lo = x1, hi = x2;
      for (let j = 0; j < 40; j++) { const mid = (lo + hi) / 2; if ((fM1(lo) - m) * (fM1(mid) - m) <= 0) hi = mid; else lo = mid; }
      xis.push((lo + hi) / 2);
    }
  }
  const welcher = React.useRef(null);
  const zieh = useZiehen(([sx], neu) => {
    const x = k.ix(sx);
    if (neu) {
      const dA = Math.abs(sx - k.px(a)), dB = Math.abs(sx - k.px(b));
      if (Math.min(dA, dB) > 40) return false;
      welcher.current = dA < dB ? "a" : "b";
    }
    if (welcher.current === "a") setA(klemm(x, -1.2, b - 0.6)); else setB(klemm(x, a + 0.6, 4.3));
    return true;
  });
  const sek = (t) => fM(a) + m * (t - a);
  return (
    <div>
      <Hinweis>Ziehe A und B. Zwischen beiden gibt es immer mindestens eine Stelle ξ, an der die Tangente (gold) genau so steil ist wie die Sekante (rosa).</Hinweis>
      <svg viewBox="0 0 340 260" style={svgStil} {...zieh} role="img" aria-label="Graph mit Sekante und parallelen Tangenten">
        <Achsen k={k} />
        <path d={k.kurve(fM)} fill="none" stroke={F.see} strokeWidth="2.6" />
        <path d={k.kurve(sek, a - 1, b + 1)} fill="none" stroke={F.rosaKraeftig} strokeWidth="2.2" />
        {xis.map((xi, i) => (
          <g key={i}>
            <path d={`M${k.px(xi - 1.1)} ${k.py(fM(xi) - m * 1.1)} L${k.px(xi + 1.1)} ${k.py(fM(xi) + m * 1.1)}`} fill="none" stroke={F.gold3} strokeWidth="2.4" strokeLinecap="round" />
            <Punkt x={k.px(xi)} y={k.py(fM(xi))} farbe={F.gold3} />
            <Txt x={k.px(xi)} y={k.py(fM(xi)) + 18} farbe={F.gold3}>ξ</Txt>
          </g>
        ))}
        <Griff x={k.px(a)} y={k.py(fM(a))} farbe={F.rosaKraeftig} />
        <Griff x={k.px(b)} y={k.py(fM(b))} farbe={F.rosaKraeftig} />
        <Txt x={k.px(a) - 8} y={k.py(fM(a)) - 12} farbe={F.rosaKraeftig}>A</Txt>
        <Txt x={k.px(b) + 8} y={k.py(fM(b)) - 12} farbe={F.rosaKraeftig}>B</Txt>
      </svg>
      <Regler label="a" wert={a} setze={(v) => setA(Math.min(v, b - 0.6))} min={-1.2} max={3.6} schritt={0.05} anzeige={z(a)} />
      <Regler label="b" wert={b} setze={(v) => setB(Math.max(v, a + 0.6))} min={-0.6} max={4.3} schritt={0.05} anzeige={z(b)} />
      <Messzeile>
        <div><M t={`\\frac{f(${z(b)}) - f(${z(a)})}{${z(b)} - ${kl(a)}} = ${z(m)}`} /></div>
        <div><M t={`f′(\\xi) = ${z(m)} \\quad \\text{bei} \\quad \\xi \\approx ${xis.map((x) => z(x)).join(" und ") || "-"}`} /></div>
      </Messzeile>
    </div>
  );
}

export const BILDER_5 = {
  mws: (p) => <Mittelwertsatz {...p} />,
  regelProbe: (p) => <RegelProbe {...p} />,
  gleichGraph: (p) => <GleichGraph {...p} />,
  stammTafel: (p) => <StammTafel {...p} />,
  linSubst: (p) => <LinSubst {...p} />,
  integralRegeln: (p) => <IntegralRegeln {...p} />,
  umkehr: (p) => <Umkehr {...p} />,
  integralSym: (p) => <IntegralSym {...p} />,
};
