/* ======================================================================
   FORMELSAMMLUNG · Illustrationen Teil 6: Terme, Potenzen, Logarithmen, Gleichungen
   Jede Illustration ist interaktiv und rechnet mit den gezeigten Zahlen.
   ====================================================================== */
import React, { useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { Achsen, F, Griff, Hinweis, Messzeile, Punkt, Regler, Txt, Umschalter, klemm, koord, summe, svgStil, useZiehen, z } from "./funcFsBasis.jsx";

/* ---------- (aᵐ)ⁿ: n Gruppen mit je m Faktoren ---------- */
function PotenzGruppen() {
  const [m, setM] = useState(3), [n, setN] = useState(2);
  const r = 7, dx = 20, gap = 14;
  const breite = n * (m * dx + gap);
  return (
    <div>
      <Hinweis>(aᵐ)ⁿ bedeutet: n Gruppen, in jeder Gruppe m Faktoren a. Zähle alle a – das sind m · n Stück.</Hinweis>
      <svg viewBox="0 0 340 130" style={svgStil} role="img" aria-label={`${n} Gruppen mit je ${m} Faktoren`}>
        <g transform={`translate(${Math.max(8, (340 - breite) / 2)} 0)`}>
          {Array.from({ length: n }, (_, g) => (
            <g key={g} transform={`translate(${g * (m * dx + gap)} 0)`}>
              <rect x={-4} y={24} width={m * dx + 2} height={50} rx={10} fill={F.seeHell} stroke={F.see} strokeWidth="1.6" />
              {Array.from({ length: m }, (_, i) => <circle key={i} cx={i * dx + dx / 2 - 4} cy={49} r={r} fill={F.gold3} stroke={F.tinte} strokeWidth="1" />)}
              <Txt x={(m * dx) / 2 - 4} y={92} farbe={F.see} gr={12}>{`a${["⁰", "¹", "²", "³", "⁴", "⁵"][m] || m}`}</Txt>
            </g>
          ))}
        </g>
        <Txt x={170} y={118} gr={13}>{`${n} × ${m} = ${m * n} Faktoren a`}</Txt>
      </svg>
      <Regler label="m (Faktoren pro Gruppe)" wert={m} setze={setM} min={1} max={5} schritt={1} anzeige={m} />
      <Regler label="n (Gruppen)" wert={n} setze={setN} min={1} max={4} schritt={1} anzeige={n} />
      <Messzeile>
        <M t={`(2^{${m}})^{${n}} = 2^{${m} \\cdot ${n}} = 2^{${m * n}} = ${2 ** (m * n)}`} />
      </Messzeile>
    </div>
  );
}

/* ---------- Wurzel als Potenz: a^(1/n) ---------- */
function WurzelPotenz() {
  const [n, setN] = useState(2), [a, setA] = useState(4);
  const k = koord({ x0: 0, x1: 9, y0: 0, y1: 4, w: 340, h: 220 });
  const w = Math.pow(a, 1 / n);
  const zieh = useZiehen(([sx]) => { setA(klemm(Math.round(k.ix(sx) * 10) / 10, 0.5, 8.5)); return true; });
  return (
    <div>
      <Hinweis>Ziehe a. Die n-te Wurzel ist die Zahl, die n-mal mit sich multipliziert wieder a ergibt – und das ist genau a hoch 1/n.</Hinweis>
      <svg viewBox="0 0 340 220" style={svgStil} {...zieh} role="img" aria-label="Wurzelfunktion als Potenz">
        <Achsen k={k} />
        <path d={k.kurve((x) => Math.pow(x, 1 / n))} fill="none" stroke={F.see} strokeWidth="2.6" />
        <line x1={k.px(a)} x2={k.px(a)} y1={k.py(0)} y2={k.py(w)} stroke={F.gold3} strokeWidth="2" strokeDasharray="4 3" />
        <line x1={k.px(0)} x2={k.px(a)} y1={k.py(w)} y2={k.py(w)} stroke={F.gold3} strokeWidth="2" strokeDasharray="4 3" />
        <Punkt x={k.px(a)} y={k.py(w)} farbe={F.gold3} />
        <Griff x={k.px(a)} y={k.py(0)} farbe={F.gold3} />
        <Txt x={k.px(a)} y={k.py(0) - 8} farbe={F.gold3} gr={11}>a</Txt>
      </svg>
      <Umschalter label="Wurzelexponent" wert={n} setze={setN} optionen={[[2, "Quadratwurzel"], [3, "dritte Wurzel"], [4, "vierte Wurzel"]]} />
      <Regler label="a" wert={a} setze={setA} min={0.5} max={8.5} schritt={0.1} anzeige={z(a)} />
      <Messzeile>
        <div><M t={`a^{\\frac{1}{${n}}} = ${z(w)}`} /></div>
        <div><M t={`${z(w)}^{${n}} = ${z(Math.pow(w, n))} = a`} /></div>
      </Messzeile>
    </div>
  );
}

/* ---------- log(aᵏ) = k · log a: k gleiche Strecken ---------- */
function LogPotenz() {
  const [a, setA] = useState(3), [kk, setK] = useState(3);
  const L = Math.log2(a), tot = kk * L;
  const sk = 300 / 14;
  return (
    <div>
      <Hinweis>Der Logarithmus misst Strecken. aᵏ ist k-mal mit a multipliziert – also liegen k gleich lange Strecken (log a) hintereinander.</Hinweis>
      <svg viewBox="0 0 340 120" style={svgStil} role="img" aria-label="k Strecken der Länge log a">
        {Array.from({ length: kk }, (_, i) => (
          <g key={i}>
            <rect x={20 + i * L * sk} y={30} width={L * sk - 2} height={30} rx={5} fill={i % 2 ? F.rosaKraeftig : F.see} opacity="0.85" />
            <Txt x={20 + (i + 0.5) * L * sk} y={50} farbe={C.weiss} gr={11}>log a</Txt>
          </g>
        ))}
        <line x1={20} x2={20 + tot * sk} y1={78} y2={78} stroke={F.gold3} strokeWidth="3" />
        <Txt x={20 + (tot * sk) / 2} y={98} farbe={F.gold3} gr={12}>{`log(a${["⁰", "¹", "²", "³", "⁴", "⁵"][kk]}) = ${z(tot)}`}</Txt>
      </svg>
      <Regler label="a" wert={a} setze={setA} min={2} max={8} schritt={1} anzeige={a} />
      <Regler label="k" wert={kk} setze={setK} min={1} max={5} schritt={1} anzeige={kk} />
      <Messzeile>
        <div><M t={`\\log_2 (${a}^{${kk}}) = \\log_2 ${a ** kk} \\approx ${z(tot)}`} /></div>
        <div><M t={`${kk} \\cdot \\log_2 ${a} \\approx ${kk} \\cdot ${z(L)} = ${z(tot)}`} /></div>
      </Messzeile>
    </div>
  );
}

/* ---------- Basiswechsel: Wie oft passt log b in log x? ---------- */
function Basiswechsel() {
  const [x, setX] = useState(50), [b, setB] = useState(2);
  const lx = Math.log(x), lb = Math.log(b), anz = lx / lb;
  const sk = 300 / Math.log(200);
  const voll = Math.floor(anz + 1e-9);
  return (
    <div>
      <Hinweis>log_b x fragt: Wie oft passt die Strecke ln b in die Strecke ln x? Das ist der Quotient der beiden Längen.</Hinweis>
      <svg viewBox="0 0 340 120" style={svgStil} role="img" aria-label="ln x gemessen in Schritten der Länge ln b">
        <rect x={20} y={18} width={lx * sk} height={26} rx={5} fill={F.see} opacity="0.9" />
        <Txt x={20 + (lx * sk) / 2} y={36} farbe={C.weiss} gr={12}>ln x</Txt>
        {Array.from({ length: voll }, (_, i) => (
          <rect key={i} x={20 + i * lb * sk} y={56} width={Math.max(2, lb * sk - 2)} height={26} rx={5} fill={i % 2 ? F.rosaKraeftig : F.gold3} opacity="0.9" />
        ))}
        {anz - voll > 1e-6 && <rect x={20 + voll * lb * sk} y={56} width={(anz - voll) * lb * sk} height={26} rx={5} fill={F.achse} opacity="0.7" />}
        <Txt x={170} y={106} gr={12}>{`ln b passt ${z(anz)}-mal hinein`}</Txt>
      </svg>
      <Regler label="x" wert={x} setze={setX} min={2} max={200} schritt={1} anzeige={x} />
      <Regler label="Basis b" wert={b} setze={setB} min={2} max={10} schritt={1} anzeige={b} />
      <Messzeile>
        <M t={`\\log_{${b}} ${x} = \\frac{\\ln ${x}}{\\ln ${b}} = \\frac{${z(lx)}}{${z(lb)}} = ${z(anz)}`} />
      </Messzeile>
    </div>
  );
}

/* ---------- Vieta: Summe und Produkt der Nullstellen ---------- */
function VietaBild() {
  const [x1, setX1] = useState(-1), [x2, setX2] = useState(3);
  const k = koord({ x0: -6, x1: 6, y0: -7, y1: 9, w: 340, h: 230 });
  const p = -(x1 + x2), q = x1 * x2;
  const f = (x) => (x - x1) * (x - x2);
  const aktiv = React.useRef(0);
  const zieh = useZiehen(([sx], start) => {
    const v = klemm(Math.round(k.ix(sx) * 2) / 2, -5.5, 5.5);
    if (start) aktiv.current = Math.abs(v - x1) <= Math.abs(v - x2) ? 1 : 2;
    if (aktiv.current === 1) setX1(v); else setX2(v);
    return true;
  });
  return (
    <div>
      <Hinweis>Ziehe die beiden Nullstellen. Summe und Produkt tauchen direkt als p und q in der Gleichung auf.</Hinweis>
      <svg viewBox="0 0 340 230" style={svgStil} {...zieh} role="img" aria-label="Parabel mit zwei Nullstellen">
        <Achsen k={k} />
        <path d={k.kurve(f)} fill="none" stroke={F.see} strokeWidth="2.6" />
        <Griff x={k.px(x1)} y={k.py(0)} farbe={F.gold3} />
        <Griff x={k.px(x2)} y={k.py(0)} farbe={F.rosaKraeftig} />
        <Punkt x={k.px(0)} y={k.py(q)} farbe={F.tinte} r={3.6} />
      </svg>
      <Messzeile>
        <div><M t={`x_1 = ${z(x1)}, \\quad x_2 = ${z(x2)}`} /></div>
        <div><M t={`x_1 + x_2 = ${z(x1 + x2)} = -p \\;\\Rightarrow\\; p = ${z(p)}`} /></div>
        <div><M t={`x_1 \\cdot x_2 = ${z(q)} = q`} /></div>
        <div><M t={`x^2 ${summe([[p, "x"], [q]])} = 0`} /></div>
      </Messzeile>
    </div>
  );
}

/* ---------- Nullprodukt: zwei Faktoren und ihr Produkt ---------- */
function NullProdukt() {
  const [a, setA] = useState(-1.5), [b, setB] = useState(2);
  const k = koord({ x0: -5, x1: 5, y0: -6, y1: 8, w: 340, h: 230 });
  const g1 = (x) => x - a, g2 = (x) => x - b, pr = (x) => (x - a) * (x - b);
  const aktiv = React.useRef(0);
  const zieh = useZiehen(([sx], start) => {
    const v = klemm(Math.round(k.ix(sx) * 2) / 2, -4.5, 4.5);
    if (start) aktiv.current = Math.abs(v - a) <= Math.abs(v - b) ? 1 : 2;
    if (aktiv.current === 1) setA(v); else setB(v);
    return true;
  });
  return (
    <div>
      <Hinweis>Zwei Geraden (Faktoren) und ihr Produkt. Das Produkt ist genau dort null, wo ein Faktor null ist.</Hinweis>
      <svg viewBox="0 0 340 230" style={svgStil} {...zieh} role="img" aria-label="Faktoren und Produkt">
        <Achsen k={k} />
        <path d={k.kurve(g1)} fill="none" stroke={F.gold3} strokeWidth="2" />
        <path d={k.kurve(g2)} fill="none" stroke={F.rosaKraeftig} strokeWidth="2" />
        <path d={k.kurve(pr)} fill="none" stroke={F.see} strokeWidth="2.8" />
        <Griff x={k.px(a)} y={k.py(0)} farbe={F.gold3} />
        <Griff x={k.px(b)} y={k.py(0)} farbe={F.rosaKraeftig} />
      </svg>
      <Messzeile>
        <div><M t={`(${z(a) === "0" ? "x" : `x ${a < 0 ? "+" : "-"} ${z(Math.abs(a))}`}) \\cdot (${z(b) === "0" ? "x" : `x ${b < 0 ? "+" : "-"} ${z(Math.abs(b))}`}) = 0`} /></div>
        <div><M t={`x = ${z(a)} \\;\\text{oder}\\; x = ${z(b)}`} /></div>
      </Messzeile>
    </div>
  );
}

/* ---------- Substitution z = x² ---------- */
function SubstBild() {
  const [p, setP] = useState(-5), [q, setQ] = useState(4);
  const k = koord({ x0: -3.5, x1: 3.5, y0: -5, y1: 10, w: 340, h: 230 });
  const D = p * p - 4 * q;
  const zs = D >= 0 ? [(-p - Math.sqrt(D)) / 2, (-p + Math.sqrt(D)) / 2] : [];
  const xs = [];
  zs.forEach((zz) => { if (zz > 1e-9) xs.push(-Math.sqrt(zz), Math.sqrt(zz)); else if (Math.abs(zz) < 1e-9) xs.push(0); });
  const f = (x) => x ** 4 + p * x * x + q;
  return (
    <div>
      <Hinweis>x⁴ + p·x² + q = 0 sieht schwer aus. Mit z = x² wird daraus eine einfache quadratische Gleichung.</Hinweis>
      <svg viewBox="0 0 340 230" style={svgStil} role="img" aria-label="Graph von x hoch vier plus p x quadrat plus q">
        <Achsen k={k} />
        <path d={k.kurve(f)} fill="none" stroke={F.see} strokeWidth="2.6" />
        {xs.map((x, i) => <Punkt key={i} x={k.px(x)} y={k.py(0)} farbe={F.gold3} />)}
      </svg>
      <Regler label="p" wert={p} setze={setP} min={-8} max={4} schritt={1} anzeige={z(p)} />
      <Regler label="q" wert={q} setze={setQ} min={-4} max={8} schritt={1} anzeige={z(q)} />
      <Messzeile>
        <div><M t={`x^4 ${summe([[p, "x^2"], [q]])} = 0`} /></div>
        <div><M t={`z^2 ${summe([[p, "z"], [q]])} = 0 \\;\\Rightarrow\\; ${zs.length ? `z = ${zs.map(z).join("\\;\\text{oder}\\;z = ")}` : "\\text{keine Lösung}"}`} /></div>
        <div>{xs.length ? <M t={`x = ${xs.map(z).join(",\\; ")}`} /> : <span>keine reelle Lösung für x</span>}</div>
      </Messzeile>
    </div>
  );
}

/* ---------- Exponentialgleichung aˣ = c ---------- */
function ExpGleichung() {
  const [b, setB] = useState(2), [c, setC] = useState(6);
  const k = koord({ x0: -1, x1: 5, y0: -1, y1: 12, w: 340, h: 230 });
  const x = Math.log(c) / Math.log(b);
  const zieh = useZiehen(([, sy]) => { setC(klemm(Math.round(k.iy(sy) * 2) / 2, 0.5, 11)); return true; });
  return (
    <div>
      <Hinweis>Ziehe die waagerechte Linie c. Wo sie den Graphen von bˣ trifft, liegt die Lösung – der Logarithmus rechnet sie aus.</Hinweis>
      <svg viewBox="0 0 340 230" style={svgStil} {...zieh} role="img" aria-label="Exponentialfunktion und waagerechte Gerade">
        <Achsen k={k} />
        <path d={k.kurve((t) => Math.pow(b, t))} fill="none" stroke={F.see} strokeWidth="2.6" />
        <line x1={k.px(-1)} x2={k.px(5)} y1={k.py(c)} y2={k.py(c)} stroke={F.rosaKraeftig} strokeWidth="2" />
        <line x1={k.px(x)} x2={k.px(x)} y1={k.py(c)} y2={k.py(0)} stroke={F.gold3} strokeWidth="2" strokeDasharray="4 3" />
        <Punkt x={k.px(x)} y={k.py(c)} farbe={F.gold3} />
        <Griff x={k.px(4.4)} y={k.py(c)} farbe={F.rosaKraeftig} />
      </svg>
      <Umschalter label="Basis" wert={b} setze={setB} optionen={[[1.5, "b = 1,5"], [2, "b = 2"], [3, "b = 3"]]} />
      <Messzeile>
        <div><M t={`${z(b)}^x = ${z(c)}`} /></div>
        <div><M t={`x = \\frac{\\ln ${z(c)}}{\\ln ${z(b)}} = ${z(x)}`} /></div>
      </Messzeile>
    </div>
  );
}

/* ---------- Ungleichung: Zahlenstrahl und Umdrehen bei negativem Faktor ---------- */
function UngleichungBild() {
  const [a, setA] = useState(-2), [c, setC] = useState(4);
  const k = koord({ x0: -6, x1: 6, y0: -9, y1: 9, w: 340, h: 220 });
  const x0 = c / a;
  const gr = a > 0; /* ax < c  →  x < c/a (a>0) bzw. x > c/a (a<0) */
  const f = (x) => a * x;
  return (
    <div>
      <Hinweis>Löse a·x &lt; c. Teilst du durch eine negative Zahl, dreht sich das Zeichen um – der Graph zeigt warum.</Hinweis>
      <svg viewBox="0 0 340 220" style={svgStil} role="img" aria-label="Gerade und Schranke c">
        <Achsen k={k} />
        {gr ? <rect x={k.px(-6)} y={k.py(9)} width={k.px(x0) - k.px(-6)} height={k.py(-9) - k.py(9)} fill={F.gold3} opacity="0.18" />
          : <rect x={k.px(x0)} y={k.py(9)} width={k.px(6) - k.px(x0)} height={k.py(-9) - k.py(9)} fill={F.gold3} opacity="0.18" />}
        <path d={k.kurve(f)} fill="none" stroke={F.see} strokeWidth="2.6" />
        <line x1={k.px(-6)} x2={k.px(6)} y1={k.py(c)} y2={k.py(c)} stroke={F.rosaKraeftig} strokeWidth="2" />
        <Punkt x={k.px(x0)} y={k.py(c)} farbe={F.tinte} ring />
      </svg>
      <Umschalter label="Vorzeichen von a" wert={a} setze={setA} optionen={[[2, "a = 2"], [-2, "a = −2"], [-0.5, "a = −0,5"]]} />
      <Regler label="c" wert={c} setze={setC} min={-6} max={6} schritt={1} anzeige={z(c)} />
      <Messzeile>
        <div><M t={`${z(a)} \\cdot x < ${z(c)}`} /></div>
        <div><M t={`x ${a > 0 ? "<" : ">"} ${z(x0)}`} /> {a < 0 && <span style={{ color: F.rosaKraeftig, fontWeight: 700 }}> ← Zeichen gedreht</span>}</div>
      </Messzeile>
    </div>
  );
}

/* ---------- Polynomdivision / Horner ---------- */
function PolyDivBild() {
  const [r, setR] = useState(2);
  const co = [1, -6, 11, -6]; /* x³ − 6x² + 11x − 6 = (x−1)(x−2)(x−3) */
  const reihe = [co[0]];
  for (let i = 1; i < co.length; i++) reihe.push(co[i] + r * reihe[i - 1]);
  const rest = reihe[3];
  const k = koord({ x0: -0.5, x1: 4.5, y0: -4, y1: 6, w: 340, h: 210 });
  const f = (x) => ((x - 6) * x + 11) * x - 6;
  return (
    <div>
      <Hinweis>Probiere eine Zahl r. Das Horner-Schema rechnet f(r) aus. Ist der Rest 0, geht die Division auf – r ist eine Nullstelle.</Hinweis>
      <svg viewBox="0 0 340 210" style={svgStil} role="img" aria-label="Kubische Funktion mit Probierpunkt">
        <Achsen k={k} />
        <path d={k.kurve(f)} fill="none" stroke={F.see} strokeWidth="2.6" />
        <Punkt x={k.px(r)} y={k.py(f(r))} farbe={Math.abs(rest) < 1e-9 ? F.gold3 : F.rosaKraeftig} r={6} />
      </svg>
      <Umschalter label="r" wert={r} setze={setR} optionen={[[0, "r = 0"], [1, "r = 1"], [2, "r = 2"], [3, "r = 3"], [4, "r = 4"]]} />
      <Messzeile>
        <div><M t={`f(x) = x^3 - 6x^2 + 11x - 6`} /></div>
        <div style={{ fontVariantNumeric: "tabular-nums" }}>{`Horner: ${co.map(z).join("  ")}  →  ${reihe.map(z).join("  ")}`}</div>
        <div>{Math.abs(rest) < 1e-9
          ? <M t={`\\text{Rest } 0 \\;\\Rightarrow\\; f(x) = (x ${r === 0 ? "" : `- ${r}`}) (x^2 ${summe([[reihe[1], "x"], [reihe[2]]])})`} />
          : <M t={`f(${r}) = ${z(rest)} \\neq 0`} />}</div>
      </Messzeile>
    </div>
  );
}

/* ---------- Lineares Gleichungssystem: drei mögliche Lagen ---------- */
function LGSLage() {
  const [fall, setFall] = useState("eins");
  const [m2, setM2] = useState(-1);
  const k = koord({ x0: -4, x1: 6, y0: -3, y1: 7, w: 340, h: 230 });
  const g1 = (x) => 0.5 * x + 1;
  const m = fall === "eins" ? m2 : 0.5;
  const t = fall === "keine" ? -1 : fall === "viele" ? 1 : 3;
  const g2 = (x) => m * x + t;
  const eindeutig = Math.abs(m - 0.5) > 1e-9;
  const xs = eindeutig ? (1 - t) / (m - 0.5) : 0;
  return (
    <div>
      <Hinweis>Zwei Gleichungen, zwei Geraden: Sie schneiden sich in einem Punkt, sind parallel oder fallen zusammen.</Hinweis>
      <svg viewBox="0 0 340 230" style={svgStil} role="img" aria-label="Zwei Geraden">
        <Achsen k={k} />
        <path d={k.kurve(g1)} fill="none" stroke={F.see} strokeWidth="3" />
        <path d={k.kurve(g2)} fill="none" stroke={F.rosaKraeftig} strokeWidth="2.4" strokeDasharray={fall === "viele" ? "7 6" : undefined} />
        {eindeutig && <Punkt x={k.px(xs)} y={k.py(g1(xs))} farbe={F.gold3} r={6} />}
      </svg>
      <Umschalter label="Lage" wert={fall} setze={setFall} optionen={[["eins", "ein Schnittpunkt"], ["keine", "parallel"], ["viele", "identisch"]]} />
      {fall === "eins" && <Regler label="Steigung der 2. Geraden" wert={m2} setze={(v) => setM2(Math.abs(v - 0.5) < 0.05 ? 0.6 : v)} min={-2} max={2} schritt={0.1} anzeige={z(m2)} />}
      <Messzeile>
        <div>{fall === "eins" && <M t={`\\text{genau eine Lösung: } S(${z(xs)} | ${z(g1(xs))})`} />}
          {fall === "keine" && <span>Gleiche Steigung, verschiedene Höhe: Widerspruch (z. B. 0 = 2) – <b>keine Lösung</b>.</span>}
          {fall === "viele" && <span>Gleiche Gerade: Aus der Rechnung wird 0 = 0 – <b>unendlich viele Lösungen</b>.</span>}</div>
      </Messzeile>
    </div>
  );
}

export const BILDER_6 = {
  potenzGruppen: (p) => <PotenzGruppen {...p} />,
  wurzelPotenz: (p) => <WurzelPotenz {...p} />,
  logPotenz: (p) => <LogPotenz {...p} />,
  basiswechsel: (p) => <Basiswechsel {...p} />,
  vietaBild: (p) => <VietaBild {...p} />,
  nullProdukt: (p) => <NullProdukt {...p} />,
  substBild: (p) => <SubstBild {...p} />,
  expGleichung: (p) => <ExpGleichung {...p} />,
  ungleichungBild: (p) => <UngleichungBild {...p} />,
  polyDivBild: (p) => <PolyDivBild {...p} />,
  lgsLage: (p) => <LGSLage {...p} />,
};
