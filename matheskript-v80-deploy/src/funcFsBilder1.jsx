/* ======================================================================
   FORMELSAMMLUNG · Illustrationen Teil 1: Analysis
   Jede Illustration ist interaktiv (Regler, Ziehen) und beschriftet.
   ====================================================================== */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { Achsen, Bogen, F, Griff, Hinweis, Messzeile, Pfeil, Punkt, Regler, Txt, Umschalter, faktor, klemm, koord, summe, svgStil, useZiehen, xMinus, z } from "./funcFsBasis.jsx";

/* Beispielfunktion mit Hoch- und Tiefpunkt: f(x) = 0,12x³ − 0,5x² + 0,3x + 2 */
const fB = (x) => 0.12 * x ** 3 - 0.5 * x ** 2 + 0.3 * x + 2;
const fB1 = (x) => 0.36 * x ** 2 - x + 0.3;

/* ---------- Sekante → Tangente ---------- */
function Sekante({ start = 1.6, grenz = false }) {
  const [x0, setX0] = useState(start);
  const [h, setH] = useState(1.8);
  const [lauf, setLauf] = useState(false);
  const k = koord({ x0: -1.5, x1: 4.5, y0: -0.4, y1: 4.06, w: 340, h: 260 });
  const hh = Math.abs(h) < 0.02 ? 0.02 : h;
  const P = [x0, fB(x0)], Q = [x0 + hh, fB(x0 + hh)];
  const m = (Q[1] - P[1]) / hh, mt = fB1(x0);
  const sek = (x) => P[1] + m * (x - P[0]);
  const tan = (x) => P[1] + mt * (x - P[0]);
  useEffect(() => {
    if (!lauf) return undefined;
    let id;
    const schritt = () => {
      setH((v) => { const n = v * 0.94; if (Math.abs(n) < 0.03) { setLauf(false); return 0.03 * Math.sign(v || 1); } return n; });
      id = requestAnimationFrame(schritt);
    };
    id = requestAnimationFrame(schritt);
    return () => cancelAnimationFrame(id);
  }, [lauf]);
  const welcher = useRef(null);
  const zieh = useZiehen(([sx, sy], neu) => {
    const x = k.ix(sx);
    if (neu) {
      const dP = Math.hypot(sx - k.px(P[0]), sy - k.py(P[1])), dQ = Math.hypot(sx - k.px(Q[0]), sy - k.py(Q[1]));
      if (Math.min(dP, dQ) > 34) return false;
      welcher.current = dQ < dP ? "Q" : "P";
    }
    if (welcher.current === "P") setX0(klemm(x, -1.2, 4.2 - Math.max(0, hh)));
    else setH(klemm(x - x0, -1.2 - x0, 4.3 - x0));
    setLauf(false);
    return true;
  });
  return (
    <div>
      <Hinweis>Ziehe P oder Q über den Graphen. Je näher Q an P rückt, desto mehr wird die Sekante zur Tangente.</Hinweis>
      <svg viewBox="0 0 340 260" style={svgStil} {...zieh} role="img" aria-label="Graph mit Sekante durch P und Q und Tangente in P">
        <Achsen k={k} />
        <path d={k.kurve(fB)} fill="none" stroke={F.see} strokeWidth="2.6" />
        {grenz && <path d={k.kurve(tan)} fill="none" stroke={F.gold3} strokeWidth="1.8" strokeDasharray="6 5" />}
        <path d={k.kurve(sek)} fill="none" stroke={F.rosaKraeftig} strokeWidth="2" />
        <path d={`M${k.px(P[0])} ${k.py(P[1])} H${k.px(Q[0])} V${k.py(Q[1])}`} fill="none" stroke={F.tinte} strokeWidth="1.3" strokeDasharray="4 3" />
        <Txt x={(k.px(P[0]) + k.px(Q[0])) / 2} y={k.py(P[1]) + (Q[1] > P[1] ? 15 : -7)} gr={11}>h</Txt>
        <Txt x={k.px(Q[0]) + (h > 0 ? 6 : -6)} y={(k.py(P[1]) + k.py(Q[1])) / 2 + 4} gr={11} anker={h > 0 ? "start" : "end"}>Δy</Txt>
        <Griff x={k.px(P[0])} y={k.py(P[1])} farbe={F.see} />
        <Griff x={k.px(Q[0])} y={k.py(Q[1])} farbe={F.rosaKraeftig} />
        <Txt x={k.px(P[0]) - 10} y={k.py(P[1]) - 12} farbe={F.see}>P</Txt>
        <Txt x={k.px(Q[0]) + 10} y={k.py(Q[1]) - 12} farbe={F.rosaKraeftig}>Q</Txt>
      </svg>
      <Regler label="h" wert={h} setze={(v) => { setH(v); setLauf(false); }} min={-1.5} max={2.5} anzeige={z(h)} />
      {grenz && (
        <button type="button" onClick={() => { if (Math.abs(h) < 0.1) setH(1.8); setLauf(true); }}
          style={{ marginTop: 6, width: "100%", minHeight: 40, borderRadius: 10, border: `1.5px solid ${C.see}`, background: C.weiss, color: C.see, fontFamily: "inherit", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          h → 0 abspielen
        </button>
      )}
      <Messzeile>
        <div><span style={{ color: F.rosaKraeftig, fontWeight: 700 }}>Sekante </span><M t={`m_s = \\frac{Δy}{h} = ${z(m)}`} /></div>
        {grenz && <div><span style={{ color: F.gold3, fontWeight: 700 }}>Tangente </span><M t={`f′(${z(x0)}) = ${z(mt)}`} /></div>}
      </Messzeile>
    </div>
  );
}

/* ---------- Tangente (und Normale) ---------- */
function Tangente({ normale = false }) {
  const [x0, setX0] = useState(3.1);
  const k = koord({ x0: -1.5, x1: 4.5, y0: -0.4, y1: 4.06, w: 340, h: 260 });
  const y0 = fB(x0), m = fB1(x0);
  const tan = (x) => y0 + m * (x - x0);
  const nor = (x) => y0 - (x - x0) / m;
  const zieh = useZiehen(([sx], neu) => { if (neu && Math.abs(sx - k.px(x0)) > 40) return false; setX0(klemm(k.ix(sx), -1.3, 4.3)); return true; });
  const ux = 1 / Math.hypot(1, m), uy = m / Math.hypot(1, m);
  const S = [k.px(x0), k.py(y0)];
  return (
    <div>
      <Hinweis>Ziehe den Berührpunkt. Die Tangente hat dort dieselbe Steigung wie der Graph{normale ? ", die Normale steht senkrecht darauf" : ""}.</Hinweis>
      <svg viewBox="0 0 340 260" style={svgStil} {...zieh} role="img" aria-label="Graph mit Tangente im Berührpunkt">
        <Achsen k={k} />
        <path d={k.kurve(fB)} fill="none" stroke={F.see} strokeWidth="2.6" />
        <path d={k.kurve(tan)} fill="none" stroke={F.gold3} strokeWidth="2.2" />
        {normale && Math.abs(m) > 0.03 && <path d={k.kurve(nor)} fill="none" stroke={F.rosaKraeftig} strokeWidth="2" />}
        {normale && Math.abs(m) > 0.03 && (
          <path d={`M${S[0] + ux * 11} ${S[1] - uy * 11} l${-uy * 11} ${-ux * 11} l${-ux * 11} ${uy * 11}`} fill="none" stroke={F.tinte} strokeWidth="1.3" />
        )}
        {!normale && (
          <g>
            <path d={`M${k.px(x0)} ${k.py(y0)} H${k.px(x0 + 1)} V${k.py(y0 + m)}`} fill="none" stroke={F.tinte} strokeWidth="1.3" strokeDasharray="4 3" />
            <Txt x={k.px(x0 + 0.5)} y={k.py(y0) + (m > 0 ? 14 : -7)} gr={11}>1</Txt>
            <Txt x={k.px(x0 + 1) + 6} y={k.py(y0 + m / 2) + 4} gr={11} anker="start">{z(m)}</Txt>
          </g>
        )}
        <Griff x={S[0]} y={S[1]} farbe={F.see} />
        <Txt x={S[0] - 8} y={S[1] - 13} farbe={F.see}>B</Txt>
      </svg>
      <Regler label="x₀" wert={x0} setze={setX0} min={-1.3} max={4.3} anzeige={z(x0)} />
      <Messzeile>
        <div><span style={{ color: F.gold3, fontWeight: 700 }}>t: </span><M t={`y = ${Math.abs(m) < 0.005 ? z(y0) : faktor(m, `(${xMinus(x0)})`) + (Math.abs(y0) < 0.005 ? "" : ` ${y0 < 0 ? "-" : "+"} ${z(Math.abs(y0))}`)}`} /></div>
        {normale && <div><span style={{ color: F.rosaKraeftig, fontWeight: 700 }}>n: </span>{Math.abs(m) > 0.03 ? <M t={`m_n = -\\frac{1}{${z(m)}} = ${z(-1 / m)}`} /> : <span>senkrecht: x = {z(x0)}</span>}</div>}
      </Messzeile>
    </div>
  );
}

/* ---------- Potenzfunktion und ihre Ableitung ---------- */
function Potenz({ n: start = 3, regler = false, ohneAbl = false }) {
  const [n, setN] = useState(start);
  const [x, setX] = useState(1.2);
  const ganz = Number.isInteger(n);
  const f = (t) => (ganz ? t ** n : t > 0 ? t ** n : NaN);
  const f1 = (t) => (n === 0 ? 0 : ganz ? n * t ** (n - 1) : t > 0 ? n * t ** (n - 1) : NaN);
  const k = koord({ x0: -2.5, x1: 2.5, y0: -3, y1: 3, w: 340, h: 250 });
  const xs = ganz || x > 0.05 ? x : 0.6;
  const y = f(xs), m = f1(xs);
  const zieh = useZiehen(([sx], neu) => { if (neu && Math.abs(sx - k.px(xs)) > 40) return false; setX(klemm(k.ix(sx), ganz ? -2.3 : 0.08, 2.3)); return true; });
  const tan = (t) => y + m * (t - xs);
  const nTex = n === 0.5 ? "\\frac{1}{2}" : n === -0.5 ? "-\\frac{1}{2}" : n === 1.5 ? "\\frac{3}{2}" : String(n).replace(".", "{,}");
  return (
    <div>
      <Hinweis>{ohneAbl ? "Verändere den Exponenten und vergleiche gerade und ungerade n." : "Ziehe den Punkt: Die Steigung der Tangente (gold) ist genau der Wert der Ableitung (gestrichelt)."}</Hinweis>
      <svg viewBox="0 0 340 250" style={svgStil} {...zieh} role="img" aria-label={`Graph von x hoch ${n} und seiner Ableitung`}>
        <Achsen k={k} />
        {!ohneAbl && <path d={k.kurve(f1)} fill="none" stroke={F.gold3} strokeWidth="2" strokeDasharray="6 4" />}
        <path d={k.kurve(f)} fill="none" stroke={F.see} strokeWidth="2.6" />
        {!ohneAbl && isFinite(m) && <path d={k.kurve(tan, xs - 1.2, xs + 1.2)} fill="none" stroke={F.gold3} strokeWidth="2" />}
        {!ohneAbl && isFinite(m) && <line x1={k.px(xs)} x2={k.px(xs)} y1={k.py(y)} y2={k.py(m)} stroke={F.achse} strokeDasharray="3 3" />}
        {!ohneAbl && isFinite(m) && Math.abs(m) < 3 && <Punkt x={k.px(xs)} y={k.py(m)} farbe={F.gold3} />}
        {isFinite(y) && Math.abs(y) < 3.2 && <Griff x={k.px(xs)} y={k.py(y)} />}
        <Txt x={k.px(2.25)} y={k.py(klemm(f(2.25) || 0, -2.7, 2.7)) - 8} farbe={F.see} anker="end">f</Txt>
        {!ohneAbl && n !== 0 && <Txt x={k.px(-2.2)} y={k.py(klemm(f1(-2.2) || 0.3, -2.7, 2.7)) + (f1(-2.2) > 0 ? -8 : 16)} farbe={F.gold3} anker="start">f′</Txt>}
      </svg>
      {regler && (
        <Umschalter label="Exponent n" wert={n} setze={setN}
          optionen={(ohneAbl ? [1, 2, 3, 4, 5] : [-2, -1, 0.5, 1, 2, 3, 4]).map((v) => [v, `n = ${v === 0.5 ? "½" : String(v).replace("-", "−")}`])} />
      )}
      {!ohneAbl && (
        <Messzeile>
          <M t={`f(x) = ${n === 0 ? "1" : n === 1 ? "x" : `x^{${nTex}}`} \\;\\Rightarrow\\; f′(x) = ${n === 0 ? "0" : n === 1 ? "1" : n === 2 ? "2x" : (n === -1 ? "-" : nTex + " ") + "x^{" + (n - 1 === 0.5 ? "\\frac{1}{2}" : n - 1 === -0.5 ? "-\\frac{1}{2}" : String(n - 1).replace(".", "{,}")) + "}"}`} />
          <div style={{ color: C.grau, fontSize: 13 }}>Steigung bei x = {z(xs)}: <b style={{ color: C.tinte }}>{z(m)}</b></div>
        </Messzeile>
      )}
    </div>
  );
}

/* ---------- Faktorregel: senkrechte Streckung ---------- */
function Streckung() {
  const [c, setC] = useState(2);
  const [x, setX] = useState(0.8);
  const f = (t) => Math.sin(t) * 0.9 + 0.2 * t;
  const f1 = (t) => Math.cos(t) * 0.9 + 0.2;
  const k = koord({ x0: -0.5, x1: 5.5, y0: -2.6, y1: 3.2, w: 340, h: 250 });
  const m = f1(x);
  const dreieck = (s, farbe) => (
    <g>
      <path d={`M${k.px(x)} ${k.py(s * f(x))} H${k.px(x + 1)} V${k.py(s * f(x) + s * m)}`} fill="none" stroke={farbe} strokeWidth="1.6" strokeDasharray="4 3" />
      <Txt x={k.px(x + 1) + 5} y={k.py(s * f(x) + (s * m) / 2) + 4} anker="start" gr={11} farbe={farbe}>{z(s * m)}</Txt>
    </g>
  );
  return (
    <div>
      <Hinweis>Streckt man den Graphen mit dem Faktor c, wird jedes Steigungsdreieck c-mal so hoch.</Hinweis>
      <svg viewBox="0 0 340 250" style={svgStil} role="img" aria-label="Graph von f und c mal f mit Steigungsdreiecken">
        <Achsen k={k} />
        <path d={k.kurve(f)} fill="none" stroke={F.see} strokeWidth="2.2" />
        <path d={k.kurve((t) => c * f(t))} fill="none" stroke={F.rosaKraeftig} strokeWidth="2.6" />
        {dreieck(1, F.see)}
        {dreieck(c, F.rosaKraeftig)}
        <Txt x={k.px(5.2)} y={k.py(f(5.2)) - 8} farbe={F.see}>f</Txt>
        <Txt x={k.px(5.2)} y={k.py(c * f(5.2)) + (c > 0 ? -8 : 16)} farbe={F.rosaKraeftig}>c · f</Txt>
      </svg>
      <Regler label="c" wert={c} setze={setC} min={-1.5} max={3} schritt={0.1} anzeige={z(c)} />
      <Regler label="x" wert={x} setze={setX} min={0} max={4.3} anzeige={z(x)} />
      <Messzeile><M t={`(c \\cdot f)′(${z(x)}) = ${z(c)} \\cdot ${z(m)} = ${z(c * m)}`} /></Messzeile>
    </div>
  );
}

/* ---------- Produktregel: wachsendes Rechteck ---------- */
function ProduktFlaeche() {
  const [h, setH] = useState(0.5);
  const u = 3, v = 2, du = 1.2 * h, dv = 0.9 * h;
  const s = 52, X = 40, Y = 22;
  const W = (u + du) * s, H = (v + dv) * s;
  return (
    <div>
      <Hinweis>Das Rechteck u · v wächst um drei Streifen. Lass h schrumpfen: Das kleine Eckstück verschwindet schneller als die beiden Streifen.</Hinweis>
      <svg viewBox="0 0 340 230" style={svgStil} role="img" aria-label="Rechteck mit den Seiten u und v, das um Streifen Δu und Δv wächst">
        <rect x={X} y={Y} width={u * s} height={v * s} fill={F.blau} stroke={F.see} strokeWidth="2" />
        <rect x={X + u * s} y={Y} width={du * s} height={v * s} fill={F.gold2} stroke={F.gold3} strokeWidth="1.5" />
        <rect x={X} y={Y + v * s} width={u * s} height={dv * s} fill={F.rosa} stroke={F.rosaKraeftig} strokeWidth="1.5" />
        <rect x={X + u * s} y={Y + v * s} width={du * s} height={dv * s} fill="#E4D6F0" stroke={F.lila} strokeWidth="1.5" />
        <Txt x={X + (u * s) / 2} y={Y + (v * s) / 2 + 5} gr={16} farbe={F.see}>u · v</Txt>
        {du * s > 26 && <Txt x={X + u * s + (du * s) / 2} y={Y + (v * s) / 2 + 4} gr={11} farbe={F.gold3}>Δu·v</Txt>}
        {dv * s > 14 && <Txt x={X + (u * s) / 2} y={Y + v * s + (dv * s) / 2 + 4} gr={11} farbe={F.rosaKraeftig}>u·Δv</Txt>}
        <Txt x={X + (u * s) / 2} y={Y - 6} gr={12}>u</Txt>
        {du * s > 10 && <Txt x={X + u * s + (du * s) / 2} y={Y - 6} gr={11} farbe={F.gold3}>Δu</Txt>}
        <Txt x={X - 10} y={Y + (v * s) / 2 + 4} gr={12}>v</Txt>
        {dv * s > 10 && <Txt x={X - 12} y={Y + v * s + (dv * s) / 2 + 4} gr={11} farbe={F.rosaKraeftig}>Δv</Txt>}
        <rect x={X} y={Y} width={W} height={H} fill="none" stroke={F.tinte} strokeWidth="1.2" strokeDasharray="5 4" />
      </svg>
      <Regler label="h" wert={h} setze={setH} min={0} max={1} anzeige={z(h)} />
      <Messzeile>
        <M t={`\\frac{Δ(uv)}{h} = \\frac{Δu}{h} v + u \\frac{Δv}{h} + \\frac{Δu \\cdot Δv}{h}`} />
        <div style={{ fontSize: 13, color: C.grau }}>Eckstück pro h: <b style={{ color: F.lila }}>{z((du * dv) / Math.max(h, 1e-9))}</b> → 0</div>
      </Messzeile>
    </div>
  );
}

/* ---------- Kettenregel: drei Zahlengeraden ---------- */
function Kette() {
  const [x, setX] = useState(0.9);
  const [h, setH] = useState(0.25);
  const v = (t) => t * t, u = Math.sin;
  const a = x, b = x + h, va = v(a), vb = v(b), ua = u(va), ub = u(vb);
  const L = 36, R = 320;
  const lin = (t, t0, t1) => L + ((t - t0) / (t1 - t0)) * (R - L);
  const zeile = (y, t0, t1, p, q, farbe, name, schritte) => (
    <g>
      <line x1={L} x2={R} y1={y} y2={y} stroke={F.achse} strokeWidth="1.3" />
      {schritte.map((s) => (
        <g key={s}><line x1={lin(s, t0, t1)} x2={lin(s, t0, t1)} y1={y - 4} y2={y + 4} stroke={F.achse} />
          <text x={lin(s, t0, t1)} y={y + 16} fontSize="9.5" textAnchor="middle" fill={F.achse}>{z(s)}</text></g>
      ))}
      <rect x={Math.min(lin(p, t0, t1), lin(q, t0, t1))} y={y - 7} width={Math.abs(lin(q, t0, t1) - lin(p, t0, t1))} height="14" rx="4" fill={farbe} opacity="0.35" />
      <line x1={lin(p, t0, t1)} x2={lin(q, t0, t1)} y1={y} y2={y} stroke={farbe} strokeWidth="4" strokeLinecap="round" />
      <Txt x={14} y={y + 4} gr={13} kursiv farbe={farbe}>{name}</Txt>
    </g>
  );
  const fv = (vb - va) / h, fu = (ub - ua) / (vb - va);
  return (
    <div>
      <Hinweis>Ein kleines Stück auf der x-Achse wird von v gestreckt und dann noch einmal von u. Die Streckfaktoren multiplizieren sich.</Hinweis>
      <svg viewBox="0 0 340 200" style={svgStil} role="img" aria-label="Drei Zahlengeraden für x, v und u mit den Bildern eines Intervalls">
        {zeile(30, 0, 2.2, a, b, F.see, "x", [0, 1, 2])}
        {zeile(100, 0, 4.8, va, vb, F.gold3, "v", [0, 1, 2, 3, 4])}
        {zeile(170, -1, 1, ua, ub, F.rosaKraeftig, "u", [-1, 0, 1])}
        <Pfeil x1={lin((a + b) / 2, 0, 2.2)} y1={40} x2={lin((va + vb) / 2, 0, 4.8)} y2={88} farbe={F.achse} breite={1.4} />
        <Pfeil x1={lin((va + vb) / 2, 0, 4.8)} y1={110} x2={lin((ua + ub) / 2, -1, 1)} y2={158} farbe={F.achse} breite={1.4} />
        <Txt x={R} y={66} anker="end" gr={11} farbe={F.gold3}>{`× ${z(fv)}  (≈ v′ = 2x)`}</Txt>
        <Txt x={R} y={136} anker="end" gr={11} farbe={F.rosaKraeftig}>{`× ${z(fu)}  (≈ u′ = cos v)`}</Txt>
      </svg>
      <Regler label="x" wert={x} setze={setX} min={0.1} max={1.9} anzeige={z(x)} />
      <Regler label="Δx" wert={h} setze={setH} min={0.02} max={0.3} anzeige={z(h)} />
      <Messzeile>
        <M t={`f(x) = \\sin(x^2): \\quad \\frac{Δu}{Δx} = ${z(fv)} \\cdot ${z(fu)} = ${z(fv * fu)}`} />
        <div style={{ fontSize: 13, color: C.grau }}>exakt: <M t={`\\cos(x^2) \\cdot 2x = ${z(Math.cos(x * x) * 2 * x)}`} /></div>
      </Messzeile>
    </div>
  );
}

/* ---------- e-Funktion: Steigung = Funktionswert ---------- */
function ExpTangente({ basis = false }) {
  const [x0, setX0] = useState(0.6);
  const [a, setA] = useState(2);
  const k = koord({ x0: -3, x1: 2.2, y0: -0.6, y1: 5.2, w: 340, h: 250 });
  const B = basis ? a : Math.E;
  const f = (x) => B ** x;
  const xs = basis ? 0 : x0;
  const y = f(xs), m = y * Math.log(B);
  const zieh = useZiehen(([sx], neu) => { if (basis) return false; if (neu && Math.abs(sx - k.px(x0)) > 40) return false; setX0(klemm(k.ix(sx), -2.6, 1.6)); return true; });
  return (
    <div>
      <Hinweis>{basis ? "Verändere die Basis a. Bei a ≈ 2,718 hat die Tangente in (0 | 1) genau die Steigung 1." : "Ziehe den Punkt: Die Steigung der Tangente (rechts) ist immer so groß wie der Funktionswert (links)."}</Hinweis>
      <svg viewBox="0 0 340 250" style={svgStil} {...zieh} role="img" aria-label="Graph der Exponentialfunktion mit Tangente">
        <Achsen k={k} />
        {basis && <path d={k.kurve((x) => Math.E ** x)} fill="none" stroke={F.achse} strokeWidth="1.4" strokeDasharray="4 4" />}
        <path d={k.kurve(f)} fill="none" stroke={F.see} strokeWidth="2.6" />
        <path d={k.kurve((x) => y + m * (x - xs))} fill="none" stroke={F.gold3} strokeWidth="2" />
        <line x1={k.px(xs)} x2={k.px(xs)} y1={k.py(0)} y2={k.py(y)} stroke={F.rosaKraeftig} strokeWidth="3" />
        <path d={`M${k.px(xs)} ${k.py(y)} H${k.px(xs + 1)} V${k.py(y + m)}`} fill="none" stroke={F.tinte} strokeWidth="1.3" strokeDasharray="4 3" />
        <line x1={k.px(xs + 1)} x2={k.px(xs + 1)} y1={k.py(y)} y2={k.py(y + m)} stroke={F.gold3} strokeWidth="3" />
        <Txt x={k.px(xs) - 6} y={k.py(y / 2) + 4} anker="end" gr={11} farbe={F.rosaKraeftig}>{z(y)}</Txt>
        <Txt x={k.px(xs + 1) + 6} y={k.py(y + m / 2) + 4} anker="start" gr={11} farbe={F.gold3}>{z(m)}</Txt>
        <Txt x={k.px(xs + 0.5)} y={k.py(y) + 14} gr={10}>1</Txt>
        {!basis && <Griff x={k.px(xs)} y={k.py(y)} />}
        {basis && <Punkt x={k.px(0)} y={k.py(1)} />}
      </svg>
      {basis ? <Regler label="a" wert={a} setze={setA} min={1.3} max={4} schritt={0.01} anzeige={z(a)} />
        : <Regler label="x" wert={x0} setze={setX0} min={-2.6} max={1.6} anzeige={z(x0)} />}
      <Messzeile>
        {basis ? <span>Steigung bei 0: <M t={`\\ln ${z(a)} = ${z(Math.log(a))}`} /></span> : <M t={`f(${z(x0)}) = ${z(y)}, \\quad f′(${z(x0)}) = ${z(m)}`} />}
      </Messzeile>
    </div>
  );
}

/* ---------- Spiegelung an y = x: e^x und ln x ---------- */
function LnSpiegel({ allgemein = false }) {
  const [t, setT] = useState(0.4);
  const k = koord({ x0: -2.5, x1: 4.5, y0: -2.5, y1: 4.5, w: 300, h: 300 });
  const P = [t, Math.exp(t)], Q = [Math.exp(t), t];
  const m = Math.exp(t);
  const zieh = useZiehen(([sx], neu) => { if (neu && Math.abs(sx - k.px(t)) > 40 && Math.abs(sx - k.px(Q[0])) > 40) return false; const x = k.ix(sx); setT(klemm(Math.abs(sx - k.px(t)) < Math.abs(sx - k.px(Q[0])) ? x : Math.log(Math.max(x, 0.05)), -2.3, 1.45)); return true; });
  const d = 0.6;
  return (
    <div>
      <Hinweis>Ziehe einen der beiden Punkte. Die Spiegelung an y = x vertauscht x und y – aus Steigung m wird 1/m.</Hinweis>
      <svg viewBox="0 0 300 300" style={{ ...svgStil, maxWidth: 380 }} {...zieh} role="img" aria-label="e-Funktion und Logarithmus, gespiegelt an der Winkelhalbierenden">
        <Achsen k={k} />
        <path d={k.kurve((x) => x)} fill="none" stroke={F.achse} strokeWidth="1.2" strokeDasharray="5 5" />
        <path d={k.kurve(Math.exp)} fill="none" stroke={F.see} strokeWidth="2.6" />
        <path d={k.kurve((x) => (x > 0 ? Math.log(x) : NaN), 0.01, 4.5, 400)} fill="none" stroke={F.gold3} strokeWidth="2.6" />
        <line x1={k.px(P[0])} y1={k.py(P[1])} x2={k.px(Q[0])} y2={k.py(Q[1])} stroke={F.rosaKraeftig} strokeWidth="1.3" strokeDasharray="3 3" />
        <path d={`M${k.px(P[0])} ${k.py(P[1])} h${(k.px(d) - k.px(0))} v${k.py(m * d) - k.py(0)}`} fill="none" stroke={F.see} strokeWidth="1.4" />
        <path d={`M${k.px(Q[0])} ${k.py(Q[1])} v${k.py(d) - k.py(0)} h${k.px(m * d) - k.px(0)}`} fill="none" stroke={F.gold3} strokeWidth="1.4" />
        <Griff x={k.px(P[0])} y={k.py(P[1])} farbe={F.see} />
        <Griff x={k.px(Q[0])} y={k.py(Q[1])} farbe={F.gold3} />
        <Txt x={k.px(-2.1)} y={k.py(Math.exp(-2.1)) - 8} anker="start" farbe={F.see}>{allgemein ? "f" : "eˣ"}</Txt>
        <Txt x={k.px(4.3)} y={k.py(Math.log(4.3)) - 8} anker="end" farbe={F.gold3}>{allgemein ? "f⁻¹" : "ln x"}</Txt>
        <Txt x={k.px(4.2)} y={k.py(4.2) + 14} anker="end" gr={10} farbe={F.achse}>y = x</Txt>
      </svg>
      <Messzeile>
        <div><M t={`m_{e^x} = ${z(m)}, \\quad m_{\\ln} = \\frac{1}{${z(m)}} = ${z(1 / m)}`} /></div><div style={{ fontSize: 13, color: C.grau }}>Das ist <M t={`\\frac{1}{x}`} /> an der Stelle <M t={`x = ${z(Q[0])}`} />.</div>
      </Messzeile>
    </div>
  );
}

/* ---------- Sinus ableiten: Einheitskreis und Graph ---------- */
function SinAbl({ cos = false }) {
  const [x, setX] = useState(0.9);
  const K = { cx: 62, cy: 120, r: 46 };
  const k = koord({ x0: -0.2, x1: 2 * Math.PI + 0.2, y0: -1.4, y1: 1.4, w: 340, h: 240, rand: 14 });
  const gx = (t) => 132 + ((t + 0.2) / (2 * Math.PI + 0.4)) * 196;
  const gy = (y) => 120 - y * 72;
  const f = cos ? Math.cos : Math.sin, f1 = cos ? (t) => -Math.sin(t) : Math.cos;
  const P = [K.cx + K.r * Math.cos(x), K.cy - K.r * Math.sin(x)];
  const v = [-Math.sin(x), -Math.cos(x)];
  const pfad = (fn) => { let d = ""; for (let i = 0; i <= 200; i++) { const t = -0.2 + (i / 200) * (2 * Math.PI + 0.4); d += `${i ? "L" : "M"}${gx(t).toFixed(1)} ${gy(fn(t)).toFixed(1)} `; } return d; };
  const y = f(x), m = f1(x);
  return (
    <div>
      <Hinweis>Der Punkt läuft mit Tempo 1 um den Kreis. Seine Geschwindigkeit nach oben ({cos ? "−sin x" : "cos x"}) ist die Steigung des Graphen.</Hinweis>
      <svg viewBox="0 0 340 240" style={svgStil} role="img" aria-label="Einheitskreis mit umlaufendem Punkt und Graph der Sinusfunktion mit Tangente">
        <circle cx={K.cx} cy={K.cy} r={K.r} fill="none" stroke={F.achse} strokeWidth="1.3" />
        <line x1={K.cx - 56} x2={K.cx + 56} y1={K.cy} y2={K.cy} stroke={F.achse} />
        <line x1={K.cx} x2={K.cx} y1={K.cy - 56} y2={K.cy + 56} stroke={F.achse} />
        <Bogen x={K.cx} y={K.cy} r={14} w1={0} w2={-x} farbe={F.gold3} />
        <line x1={K.cx} y1={K.cy} x2={P[0]} y2={P[1]} stroke={F.tinte} strokeWidth="1.4" />
        <line x1={P[0]} x2={P[0]} y1={K.cy} y2={P[1]} stroke={cos ? F.achse : F.see} strokeWidth={cos ? 1.2 : 3} />
        <line x1={K.cx} x2={P[0]} y1={K.cy} y2={K.cy} stroke={cos ? F.see : F.achse} strokeWidth={cos ? 3 : 1.2} />
        <Pfeil x1={P[0]} y1={P[1]} x2={P[0] + v[0] * 34} y2={P[1] + v[1] * 34} farbe={F.rosaKraeftig} breite={2} />
        <Punkt x={P[0]} y={P[1]} />
        <line x1={132} x2={330} y1={gy(0)} y2={gy(0)} stroke={F.achse} />
        <line x1={gx(0)} x2={gx(0)} y1={gy(1.35)} y2={gy(-1.35)} stroke={F.achse} />
        {[Math.PI / 2, Math.PI, 1.5 * Math.PI, 2 * Math.PI].map((t, i) => <text key={i} x={gx(t)} y={gy(0) + 13} fontSize="9" textAnchor="middle" fill={F.achse}>{["π/2", "π", "3π/2", "2π"][i]}</text>)}
        <path d={pfad(f1)} fill="none" stroke={F.rosaKraeftig} strokeWidth="1.8" strokeDasharray="5 4" />
        <path d={pfad(f)} fill="none" stroke={F.see} strokeWidth="2.4" />
        <line x1={gx(x - 0.55)} y1={gy(y - 0.55 * m)} x2={gx(x + 0.55)} y2={gy(y + 0.55 * m)} stroke={F.gold3} strokeWidth="2.2" />
        <line x1={gx(x)} x2={gx(x)} y1={gy(y)} y2={gy(m)} stroke={F.achse} strokeDasharray="3 3" />
        <Punkt x={gx(x)} y={gy(y)} />
        <Punkt x={gx(x)} y={gy(m)} farbe={F.rosaKraeftig} />
        <Txt x={326} y={gy(f(2 * Math.PI)) - 8} anker="end" gr={11} farbe={F.see}>{cos ? "cos" : "sin"}</Txt>
        <Txt x={326} y={gy(f1(2 * Math.PI)) + (f1(2 * Math.PI) > 0 ? -8 : 15)} anker="end" gr={11} farbe={F.rosaKraeftig}>{cos ? "−sin" : "cos"}</Txt>
      </svg>
      <Regler label="x" wert={x} setze={setX} min={0} max={6.28} anzeige={z(x)} />
      <Messzeile><M t={`${cos ? "\\cos" : "\\sin"}(${z(x)}) = ${z(y)}`} /> · Steigung <M t={`${z(m)} = ${cos ? "-\\sin" : "\\cos"}(${z(x)})`} /></Messzeile>
    </div>
  );
}

/* ---------- f, f′ und f″ untereinander ---------- */
const TRIO = {
  normal: { f: (x) => 0.25 * x ** 3 - 1.5 * x ** 2 + 2.25 * x + 0.5, f1: (x) => 0.75 * x ** 2 - 3 * x + 2.25, f2: (x) => 1.5 * x - 3, f3: () => 1.5 },
  null: { f: (x) => 0.25 * x ** 3 - 1.5 * x ** 2 + 2.25 * x - 0.25, f1: (x) => 0.75 * x ** 2 - 3 * x + 2.25, f2: (x) => 1.5 * x - 3, f3: () => 1.5 },
  sattel: { f: (x) => 0.25 * (x - 2) ** 3 + 1, f1: (x) => 0.75 * (x - 2) ** 2, f2: (x) => 1.5 * (x - 2), f3: () => 1.5 },
};
function nullstellenVon(fn, a, b) {
  const r = []; let xa = a, ya = fn(a);
  for (let i = 1; i <= 400; i++) { const xb = a + ((b - a) * i) / 400, yb = fn(xb); if (ya === 0) r.push(xa); else if (ya * yb < 0) { let l = xa, h = xb; for (let j = 0; j < 40; j++) { const m = (l + h) / 2; if (fn(l) * fn(m) <= 0) h = m; else l = m; } r.push((l + h) / 2); } xa = xb; ya = yb; }
  return r;
}
function KurvenTrio({ fokus = "extrem" }) {
  const T = fokus === "sattel" ? TRIO.sattel : fokus === "null" ? TRIO.null : TRIO.normal;
  const [x, setX] = useState(fokus === "sattel" ? 1.3 : 0.6);
  const W = 340;
  const p = [
    { fn: T.f, name: "f", y0: -0.9, y1: 2.6, top: 6, h: 130, farbe: F.see },
    { fn: T.f1, name: "f′", y0: -1.2, y1: 3.4, top: 146, h: 82, farbe: F.gold3 },
    { fn: T.f2, name: "f″", y0: -3.4, y1: 3.4, top: 238, h: 82, farbe: F.rosaKraeftig },
  ];
  const X0 = -0.4, X1 = 4.4;
  const px = (t) => 30 + ((t - X0) / (X1 - X0)) * (W - 44);
  const ix = (s) => X0 + ((s - 30) / (W - 44)) * (X1 - X0);
  const zieh = useZiehen(([sx]) => { setX(klemm(ix(sx), -0.3, 4.3)); return true; });
  const pyv = (q, y) => q.top + q.h - ((y - q.y0) / (q.y1 - q.y0)) * q.h;
  const pfad = (q) => { let d = ""; for (let i = 0; i <= 200; i++) { const t = X0 + ((X1 - X0) * i) / 200; d += `${i ? "L" : "M"}${px(t).toFixed(1)} ${pyv(q, klemm(q.fn(t), q.y0 - 1, q.y1 + 1)).toFixed(1)} `; } return d; };
  /* Färbung nach Vorzeichen (Monotonie bzw. Krümmung) */
  const abschnitte = (q, vz) => {
    const out = []; let start = X0, s = Math.sign(vz(X0));
    for (let i = 1; i <= 200; i++) { const t = X0 + ((X1 - X0) * i) / 200, s2 = Math.sign(vz(t)); if (s2 !== s || i === 200) { out.push([start, t, s]); start = t; s = s2; } }
    return out.map(([a, b, s], i) => {
      let d = ""; for (let j = 0; j <= 40; j++) { const t = a + ((b - a) * j) / 40; d += `${j ? "L" : "M"}${px(t).toFixed(1)} ${pyv(q, q.fn(t)).toFixed(1)} `; }
      return <path key={i} d={d} fill="none" stroke={s > 0 ? F.gruenKraeftig : F.rosaKraeftig} strokeWidth="4" strokeLinecap="round" />;
    });
  };
  const ext = nullstellenVon(T.f1, X0, X1).filter((t) => fokus !== "sattel" || true);
  const wen = nullstellenVon(T.f2, X0, X1);
  const nst = nullstellenVon(T.f, X0, X1);
  const vzText = (v) => (Math.abs(v) < 0.02 ? "= 0" : v > 0 ? "> 0" : "< 0");
  const v1 = T.f1(x), v2 = T.f2(x);
  return (
    <div>
      <Hinweis>Ziehe die Linie durch alle drei Graphen. Oben f, darunter seine Steigung f′ und deren Steigung f″.</Hinweis>
      <svg viewBox={`0 0 ${W} 328`} style={svgStil} {...zieh} role="img" aria-label="Graph von f mit den Graphen von f′ und f″ darunter">
        {p.map((q, i) => (
          <g key={i}>
            <rect x={28} y={q.top} width={W - 40} height={q.h} rx="8" fill={i === 0 ? "#FBFCFE" : "#F7F9FC"} />
            <line x1={30} x2={W - 14} y1={pyv(q, 0)} y2={pyv(q, 0)} stroke={F.achse} strokeWidth="1.1" />
            <path d={pfad(q)} fill="none" stroke={q.farbe} strokeWidth="2.3" />
            <Txt x={14} y={q.top + 16} farbe={q.farbe} gr={13}>{q.name}</Txt>
          </g>
        ))}
        {fokus === "mono" && abschnitte(p[0], T.f1)}
        {fokus === "kruemm" && abschnitte(p[0], T.f2)}
        {(fokus === "extrem" || fokus === "mono" || fokus === "sattel") && ext.map((t, i) => (
          <g key={"e" + i}>
            <line x1={px(t)} x2={px(t)} y1={pyv(p[0], T.f(t))} y2={pyv(p[1], 0)} stroke={F.gold3} strokeDasharray="3 3" />
            <Punkt x={px(t)} y={pyv(p[1], 0)} farbe={F.gold3} r={3.8} />
            <Punkt x={px(t)} y={pyv(p[0], T.f(t))} farbe={F.gold3} r={5} />
            {fokus !== "sattel" && <Txt x={px(t)} y={pyv(p[0], T.f(t)) + (T.f2(t) < 0 ? -10 : 18)} gr={11} farbe={F.gold3}>{T.f2(t) < 0 ? "H" : "T"}</Txt>}
          </g>
        ))}
        {(fokus === "wende" || fokus === "kruemm" || fokus === "sattel") && wen.map((t, i) => (
          <g key={"w" + i}>
            <line x1={px(t)} x2={px(t)} y1={pyv(p[0], T.f(t))} y2={pyv(p[2], 0)} stroke={F.rosaKraeftig} strokeDasharray="3 3" />
            <Punkt x={px(t)} y={pyv(p[2], 0)} farbe={F.rosaKraeftig} r={3.8} />
            <Punkt x={px(t)} y={pyv(p[1], T.f1(t))} farbe={F.rosaKraeftig} r={3.8} />
            <Punkt x={px(t)} y={pyv(p[0], T.f(t))} farbe={F.rosaKraeftig} r={5} />
            <Txt x={px(t) + 9} y={pyv(p[0], T.f(t)) - 8} gr={11} anker="start" farbe={F.rosaKraeftig}>{fokus === "sattel" ? "S" : "W"}</Txt>
          </g>
        ))}
        {fokus === "null" && nst.map((t, i) => <Punkt key={i} x={px(t)} y={pyv(p[0], 0)} farbe={F.rosaKraeftig} />)}
        <line x1={px(x)} x2={px(x)} y1={4} y2={322} stroke={F.tinte} strokeWidth="1.2" opacity="0.5" />
        {p.map((q, i) => <Punkt key={i} x={px(x)} y={pyv(q, klemm(q.fn(x), q.y0, q.y1))} farbe={q.farbe} r={4.2} />)}
      </svg>
      <Regler label="x" wert={x} setze={setX} min={-0.3} max={4.3} anzeige={z(x)} />
      <Messzeile>
        <div><M t={`f′(${z(x)}) ${vzText(v1)}`} /> <span style={{ color: C.grau, fontSize: 13 }}>· {Math.abs(v1) < 0.02 ? "waagerechte Tangente" : v1 > 0 ? "f steigt" : "f fällt"}</span></div>
        <div><M t={`f″(${z(x)}) ${vzText(v2)}`} /> <span style={{ color: C.grau, fontSize: 13 }}>· {Math.abs(v2) < 0.02 ? "Krümmungswechsel möglich" : v2 > 0 ? "linksgekrümmt" : "rechtsgekrümmt"}</span></div>
      </Messzeile>
    </div>
  );
}

/* ---------- Verhalten im Unendlichen ---------- */
function Leitterm() {
  const [zoom, setZoom] = useState(1);
  const f = (x) => -0.5 * x ** 3 + 2 * x ** 2 + x - 1, g = (x) => -0.5 * x ** 3;
  const R = 4 * zoom, Y = 6 * zoom ** 3;
  const k = koord({ x0: -R, x1: R, y0: -Y, y1: Y, w: 340, h: 240 });
  return (
    <div>
      <Hinweis>Zoome heraus: Je weiter du dich entfernst, desto weniger unterscheidet sich f vom Leitterm −0,5x³.</Hinweis>
      <svg viewBox="0 0 340 240" style={svgStil} role="img" aria-label="Polynom und sein Leitterm in verschiedenen Zoomstufen">
        <Achsen k={k} schritt={zoom < 2 ? 1 : zoom < 6 ? 5 : 20} ySchritt={Y / 3} beschriften={false} />
        <path d={k.kurve(g)} fill="none" stroke={F.gold3} strokeWidth="2.2" strokeDasharray="6 4" />
        <path d={k.kurve(f)} fill="none" stroke={F.see} strokeWidth="2.4" />
        <Txt x={k.px(-R * 0.6)} y={k.py(g(-R * 0.6)) + 4} anker="end" gr={11} farbe={F.gold3}>−0,5x³</Txt>
      </svg>
      <Regler label="Zoom" wert={zoom} setze={setZoom} min={1} max={25} schritt={0.1} anzeige={`×${z(zoom)}`} />
      <Messzeile>Verhältnis bei <M t={`x = ${z(R)}`} />: <M t={`\\frac{f(x)}{-0{,}5x^3} = ${z(f(R) / g(R))}`} /></Messzeile>
    </div>
  );
}

/* ---------- Asymptoten ---------- */
function Asymptote() {
  const [art, setArt] = useState("bruch");
  const k = koord({ x0: -4, x1: 6, y0: -4, y1: 7, w: 340, h: 250 });
  const f = art === "bruch" ? (x) => (Math.abs(x - 1) < 0.02 ? NaN : (2 * x + 1) / (x - 1)) : (x) => 3 - Math.exp(-x);
  return (
    <div>
      <Hinweis>Asymptoten sind Geraden, denen sich der Graph beliebig nähert, ohne sie zu erreichen.</Hinweis>
      <svg viewBox="0 0 340 250" style={svgStil} role="img" aria-label="Graph mit waagerechter und senkrechter Asymptote">
        <Achsen k={k} />
        <line x1={k.px(k.x0)} x2={k.px(k.x1)} y1={k.py(art === "bruch" ? 2 : 3)} y2={k.py(art === "bruch" ? 2 : 3)} stroke={F.rosaKraeftig} strokeWidth="1.6" strokeDasharray="6 4" />
        {art === "bruch" && <line x1={k.px(1)} x2={k.px(1)} y1={k.py(k.y0)} y2={k.py(k.y1)} stroke={F.gold3} strokeWidth="1.6" strokeDasharray="6 4" />}
        <path d={k.kurve(f, k.x0, k.x1, 600)} fill="none" stroke={F.see} strokeWidth="2.5" />
        <Txt x={k.px(5.8)} y={k.py(art === "bruch" ? 2 : 3) - 6} anker="end" gr={11} farbe={F.rosaKraeftig}>{art === "bruch" ? "y = 2" : "y = 3"}</Txt>
        {art === "bruch" && <Txt x={k.px(1) + 5} y={k.py(6.5)} anker="start" gr={11} farbe={F.gold3}>x = 1</Txt>}
      </svg>
      <Umschalter label="Beispiel" wert={art} setze={setArt} optionen={[["bruch", "(2x + 1) / (x − 1)"], ["exp", "3 − e⁻ˣ"]]} />
    </div>
  );
}

/* ---------- Schachtel: Extremwertaufgabe ---------- */
function Schachtel() {
  const [x, setX] = useState(3);
  const V = (t) => t * (20 - 2 * t) ** 2;
  const s = 6.2, X0 = 14, Y0 = 18;
  const k = koord({ x0: 0, x1: 10, y0: 0, y1: 650, w: 170, h: 150, rand: 12 });
  return (
    <div>
      <Hinweis>Schneide an den Ecken Quadrate der Seite x heraus und klappe hoch. Welches x gibt das größte Volumen?</Hinweis>
      <svg viewBox="0 0 340 170" style={svgStil} role="img" aria-label="Blatt mit ausgeschnittenen Ecken und Graph des Volumens">
        <rect x={X0} y={Y0} width={20 * s} height={20 * s} fill={F.blau} stroke={F.see} strokeWidth="1.6" />
        {[[0, 0], [20 - x, 0], [0, 20 - x], [20 - x, 20 - x]].map(([a, b], i) => (
          <rect key={i} x={X0 + a * s} y={Y0 + b * s} width={x * s} height={x * s} fill={C.weiss} stroke={F.rosaKraeftig} strokeWidth="1.4" strokeDasharray="3 2" />
        ))}
        <rect x={X0 + x * s} y={Y0 + x * s} width={(20 - 2 * x) * s} height={(20 - 2 * x) * s} fill="none" stroke={F.see} strokeWidth="1" strokeDasharray="4 3" />
        <Txt x={X0 + (x * s) / 2} y={Y0 + x * s + 13} gr={10} farbe={F.rosaKraeftig}>x</Txt>
        <Txt x={X0 + 10 * s} y={Y0 + 20 * s + 14} gr={11}>20</Txt>
        <g transform="translate(160 6)">
          <Achsen k={k} schritt={2} ySchritt={200} beschriften={false} xName="x" yName="V" />
          <path d={k.kurve(V)} fill="none" stroke={F.see} strokeWidth="2.3" />
          <line x1={k.px(10 / 3)} x2={k.px(10 / 3)} y1={k.py(0)} y2={k.py(V(10 / 3))} stroke={F.gold3} strokeDasharray="3 3" />
          <Punkt x={k.px(x)} y={k.py(V(x))} farbe={F.rosaKraeftig} />
          <Txt x={k.px(10 / 3)} y={k.py(V(10 / 3)) - 8} gr={10} farbe={F.gold3}>Max</Txt>
        </g>
      </svg>
      <Regler label="x" wert={x} setze={setX} min={0.2} max={9.8} schritt={0.05} anzeige={z(x)} />
      <Messzeile><M t={`V(${z(x)}) = ${z(x)} \\cdot (20 - 2 \\cdot ${z(x)})^2 = ${z(V(x))}`} /> <span style={{ color: C.grau, fontSize: 13 }}>· Maximum bei x = 10/3 ≈ 3,33</span></Messzeile>
    </div>
  );
}

/* ---------- Steckbrief: Eigenschaften werden Gleichungen ---------- */
function Steckbrief() {
  const T = TRIO.normal;
  const [b, setB] = useState(0);
  const k = koord({ x0: -0.5, x1: 4.2, y0: -0.4, y1: 2.4, w: 340, h: 220 });
  const bed = [
    { t: "P(0 | 0,5)", gl: "f(0) = 0{,}5", x: 0, art: "p" },
    { t: "Hochpunkt bei x = 1", gl: "f(1) = 1{,}5, \\; f′(1) = 0", x: 1, art: "h" },
    { t: "Wendestelle x = 2", gl: "f″(2) = 0", x: 2, art: "w" },
  ];
  const a = bed[b];
  return (
    <div>
      <Hinweis>Tippe auf eine Eigenschaft: Sie markiert eine Stelle am Graphen und wird zu einer Gleichung.</Hinweis>
      <svg viewBox="0 0 340 220" style={svgStil} role="img" aria-label="Graph einer kubischen Funktion mit markierten Eigenschaften">
        <Achsen k={k} />
        <path d={k.kurve(T.f)} fill="none" stroke={F.see} strokeWidth="2.5" />
        {a.art === "h" && <line x1={k.px(0.3)} x2={k.px(1.7)} y1={k.py(1.5)} y2={k.py(1.5)} stroke={F.gold3} strokeWidth="2.2" />}
        {a.art === "w" && <path d={k.kurve((x) => T.f(2) + T.f1(2) * (x - 2), 1.2, 2.8)} fill="none" stroke={F.rosaKraeftig} strokeWidth="2.2" />}
        <Punkt x={k.px(a.x)} y={k.py(T.f(a.x))} farbe={a.art === "w" ? F.rosaKraeftig : F.gold3} r={6} />
      </svg>
      <Umschalter label="Eigenschaft" wert={b} setze={setB} optionen={bed.map((x, i) => [i, x.t])} />
      <Messzeile><M t={a.gl} /></Messzeile>
    </div>
  );
}

/* ---------- Ortskurve einer Schar ---------- */
function Ortskurve() {
  const [a, setA] = useState(1);
  const k = koord({ x0: -3.2, x1: 3.2, y0: -5, y1: 3, w: 340, h: 250 });
  const fa = (A) => (x) => x * x - 2 * A * x;
  return (
    <div>
      <Hinweis>Verändere a: Der Tiefpunkt T(a | −a²) wandert auf der gestrichelten Ortskurve y = −x².</Hinweis>
      <svg viewBox="0 0 340 250" style={svgStil} role="img" aria-label="Funktionsschar mit Ortskurve der Tiefpunkte">
        <Achsen k={k} />
        {[-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2].map((A) => <path key={A} d={k.kurve(fa(A))} fill="none" stroke={F.blauMittel} strokeWidth="1" opacity="0.6" />)}
        <path d={k.kurve((x) => -x * x)} fill="none" stroke={F.gold3} strokeWidth="2.2" strokeDasharray="6 4" />
        <path d={k.kurve(fa(a))} fill="none" stroke={F.see} strokeWidth="2.6" />
        <Punkt x={k.px(a)} y={k.py(-a * a)} farbe={F.rosaKraeftig} r={5.5} />
        <Txt x={k.px(a)} y={k.py(-a * a) + 18} gr={11} farbe={F.rosaKraeftig}>T</Txt>
      </svg>
      <Regler label="a" wert={a} setze={setA} min={-2} max={2} anzeige={z(a)} />
      <Messzeile><M t={`f_{${z(a)}}(x) = ${summe([[1, "x^2"], [-2 * a, "x"]])}, \\quad T(${z(a)} | ${z(-a * a)})`} /></Messzeile>
    </div>
  );
}

/* ---------- Stammfunktionen: verschobene Kopien ---------- */
function StammSchar() {
  const [x, setX] = useState(1);
  const [c, setC] = useState(0);
  const k = koord({ x0: -2.5, x1: 2.5, y0: -2.5, y1: 4, w: 340, h: 250 });
  const F0 = (t) => 0.5 * t * t;
  return (
    <div>
      <Hinweis>Alle Stammfunktionen von f(x) = x sind senkrecht verschobene Kopien. An derselben Stelle haben sie alle dieselbe Steigung.</Hinweis>
      <svg viewBox="0 0 340 250" style={svgStil} role="img" aria-label="Schar von Stammfunktionen mit parallelen Tangenten">
        <Achsen k={k} />
        {[-2, -1, 0, 1, 2].map((C0) => (
          <g key={C0}>
            <path d={k.kurve((t) => F0(t) + C0)} fill="none" stroke={C0 === Math.round(c) ? F.see : F.blauMittel} strokeWidth={C0 === Math.round(c) ? 2.6 : 1.4} />
            <path d={k.kurve((t) => F0(x) + C0 + x * (t - x), x - 0.7, x + 0.7)} fill="none" stroke={F.gold3} strokeWidth="2" />
            <Punkt x={k.px(x)} y={k.py(F0(x) + C0)} farbe={F.gold3} r={3.5} />
          </g>
        ))}
      </svg>
      <Regler label="x" wert={x} setze={setX} min={-2} max={2} anzeige={z(x)} />
      <Regler label="C" wert={c} setze={setC} min={-2} max={2} schritt={1} anzeige={z(c)} />
      <Messzeile><M t={`F(x) = \\frac{1}{2}x^2${c === 0 ? "" : ` ${c < 0 ? "-" : "+"} ${z(Math.abs(c))}`}, \\quad F′(${z(x)}) = ${z(x)}`} /></Messzeile>
    </div>
  );
}

/* ---------- Flächenfunktion / Hauptsatz ---------- */
function IntegralFunktion({ kurve = false }) {
  const [x, setX] = useState(2.4);
  const f = (t) => 0.5 * Math.sin(1.3 * t) + 0.35 * t - 0.2;
  const I = (t) => { let s = 0; const n = 200; for (let i = 0; i < n; i++) { const a = (t * i) / n, b = (t * (i + 1)) / n; s += ((f(a) + f(b)) / 2) * (b - a); } return s; };
  const k = koord({ x0: -0.3, x1: 4.3, y0: -0.8, y1: 2, w: 340, h: kurve ? 150 : 220 });
  const k2 = koord({ x0: -0.3, x1: 4.3, y0: -0.3, y1: 3.4, w: 340, h: 130 });
  const hs = 0.3;
  return (
    <div>
      <Hinweis>Schiebe x nach rechts. Die Fläche wächst bei jedem kleinen Schritt um einen Streifen der Höhe f(x).</Hinweis>
      <svg viewBox={`0 0 340 ${kurve ? 290 : 220}`} style={svgStil} role="img" aria-label="Fläche unter dem Graphen von 0 bis x mit schmalem Zuwachsstreifen">
        <Achsen k={k} />
        <path d={k.flaeche((t) => Math.max(f(t), 0), 0, x)} fill={F.blau} />
        <path d={k.flaeche((t) => Math.min(f(t), 0), 0, x)} fill={F.rosa} />
        <rect x={k.px(x)} y={Math.min(k.py(f(x)), k.py(0))} width={k.px(x + hs) - k.px(x)} height={Math.abs(k.py(f(x)) - k.py(0))} fill={F.gold2} stroke={F.gold3} />
        <path d={k.kurve(f)} fill="none" stroke={F.see} strokeWidth="2.4" />
        <Txt x={k.px(x + hs / 2)} y={k.py(0) + 14} gr={10} farbe={F.gold3}>h</Txt>
        <Txt x={k.px(x + hs) + 4} y={k.py(f(x) / 2) + 4} gr={10} anker="start" farbe={F.gold3}>f(x)</Txt>
        <Txt x={k.px(0.15)} y={k.py(1.8)} anker="start" gr={12} farbe={F.see}>f</Txt>
        {kurve && (
          <g transform="translate(0 155)">
            <Achsen k={k2} beschriften={false} yName="I" />
            <path d={k2.kurve(I, 0, 4.3)} fill="none" stroke={F.blauMittel} strokeWidth="1.6" strokeDasharray="4 4" />
            <path d={k2.kurve(I, 0, x)} fill="none" stroke={F.gold3} strokeWidth="2.6" />
            <Punkt x={k2.px(x)} y={k2.py(I(x))} farbe={F.gold3} />
            <Txt x={k2.px(0.15)} y={k2.py(3.1)} anker="start" gr={12} farbe={F.gold3}>I₀(x)</Txt>
          </g>
        )}
      </svg>
      <Regler label="x" wert={x} setze={setX} min={0.05} max={3.9} anzeige={z(x)} />
      <Messzeile>
        <M t={`A(${z(x)}) = ${z(I(x))}, \\quad \\frac{A(x + h) - A(x)}{h} \\approx ${z((I(x + 0.01) - I(x)) / 0.01)} = f(${z(x)})`} />
      </Messzeile>
    </div>
  );
}

/* ---------- Ober-, Unter- und Mittelsumme ---------- */
function Riemann() {
  const [n, setN] = useState(6);
  const [art, setArt] = useState("unter");
  const f = (x) => 0.15 * x ** 2 + 0.3 * x + 0.4;
  const a = 0.5, b = 4;
  const k = koord({ x0: -0.2, x1: 4.4, y0: -0.3, y1: 4, w: 340, h: 230 });
  const dx = (b - a) / n;
  let summe = 0;
  const rechtecke = [];
  for (let i = 0; i < n; i++) {
    const l = a + i * dx, r = l + dx;
    const hgt = art === "unter" ? f(l) : art === "ober" ? f(r) : f((l + r) / 2);
    summe += hgt * dx;
    rechtecke.push(<rect key={i} x={k.px(l)} y={k.py(hgt)} width={k.px(r) - k.px(l)} height={k.py(0) - k.py(hgt)} fill={art === "ober" ? F.rosa : art === "unter" ? F.blau : F.gold} stroke={art === "ober" ? F.rosaKraeftig : art === "unter" ? F.see : F.gold3} strokeWidth="1" />);
  }
  const exakt = (x) => 0.05 * x ** 3 + 0.15 * x ** 2 + 0.4 * x;
  return (
    <div>
      <Hinweis>Mehr Streifen, kleinerer Fehler: Ober- und Untersumme laufen auf denselben Wert zu – das Integral.</Hinweis>
      <svg viewBox="0 0 340 230" style={svgStil} role="img" aria-label={`Fläche unter dem Graphen, angenähert durch ${n} Rechtecke`}>
        <Achsen k={k} />
        {rechtecke}
        <path d={k.kurve(f)} fill="none" stroke={F.tinte} strokeWidth="2.4" />
        <line x1={k.px(a)} x2={k.px(a)} y1={k.py(0)} y2={k.py(f(a))} stroke={F.tinte} strokeDasharray="3 2" />
        <line x1={k.px(b)} x2={k.px(b)} y1={k.py(0)} y2={k.py(f(b))} stroke={F.tinte} strokeDasharray="3 2" />
      </svg>
      <Umschalter label="Art der Summe" wert={art} setze={setArt} optionen={[["unter", "Untersumme"], ["mitte", "Mittelsumme"], ["ober", "Obersumme"]]} />
      <Regler label="n" wert={n} setze={setN} min={1} max={60} schritt={1} anzeige={n} />
      <Messzeile><M t={`S_{${n}} = ${z(summe)}, \\quad \\int_{0{,}5}^{4} f(x) \\, dx = ${z(exakt(b) - exakt(a))}`} /></Messzeile>
    </div>
  );
}

/* ---------- Orientierte Fläche ---------- */
function Orientiert() {
  const [b, setB] = useState(2 * Math.PI);
  const k = koord({ x0: -0.3, x1: 6.6, y0: -1.4, y1: 1.4, w: 340, h: 200 });
  const bil = 1 - Math.cos(b);
  const fl = b <= Math.PI ? 1 - Math.cos(b) : 2 + (1 + Math.cos(b));
  return (
    <div>
      <Hinweis>Oberhalb der x-Achse zählt die Fläche positiv, unterhalb negativ. Die Bilanz kann 0 sein, obwohl viel Fläche da ist.</Hinweis>
      <svg viewBox="0 0 340 200" style={svgStil} role="img" aria-label="Sinuskurve mit positiver und negativer Teilfläche">
        <Achsen k={k} schritt={Math.PI / 2} beschriften={false} ySchritt={1} />
        <path d={k.flaeche(Math.sin, 0, Math.min(b, Math.PI))} fill={F.blau} />
        {b > Math.PI && <path d={k.flaeche(Math.sin, Math.PI, b)} fill={F.rosa} />}
        <path d={k.kurve(Math.sin)} fill="none" stroke={F.see} strokeWidth="2.4" />
        <Txt x={k.px(Math.PI / 2)} y={k.py(0.35)} farbe={F.see}>+</Txt>
        {b > Math.PI + 0.5 && <Txt x={k.px((Math.PI + b) / 2)} y={k.py(-0.35)} farbe={F.rosaKraeftig}>−</Txt>}
        <line x1={k.px(b)} x2={k.px(b)} y1={k.py(-1.3)} y2={k.py(1.3)} stroke={F.tinte} strokeDasharray="3 3" />
      </svg>
      <Regler label="obere Grenze" wert={b} setze={setB} min={0.1} max={6.28} anzeige={z(b)} />
      <Messzeile>
        <div><M t={`\\int_0^{${z(b)}} \\sin x \\, dx = ${z(bil)}`} /> <span style={{ color: C.grau, fontSize: 13 }}>Bilanz</span></div>
        <div><M t={`A = ${z(fl)}`} /> <span style={{ color: C.grau, fontSize: 13 }}>Flächeninhalt</span></div>
      </Messzeile>
    </div>
  );
}

/* ---------- Fläche zwischen zwei Graphen ---------- */
function Zwischen() {
  const [c, setC] = useState(0);
  const f = (x) => -0.5 * x * x + 2 * x + 1;
  const g = (x) => 0.5 * x + c;
  const k = koord({ x0: -1.5, x1: 5.5, y0: -1.5, y1: 4.5, w: 340, h: 240 });
  const d = (x) => f(x) - g(x);
  const disk = 1.5 * 1.5 - 4 * 0.5 * (c - 1);
  let a = NaN, bb = NaN, A = 0;
  if (disk > 0) { a = (1.5 - Math.sqrt(disk)) / 1; bb = (1.5 + Math.sqrt(disk)) / 1; const P = (x) => -(x ** 3) / 6 + 0.75 * x * x + (1 - c) * x; A = P(bb) - P(a); }
  return (
    <div>
      <Hinweis>Verschiebe die Gerade. Die Fläche zwischen den Graphen ist das Integral der Differenz zwischen den Schnittstellen.</Hinweis>
      <svg viewBox="0 0 340 240" style={svgStil} role="img" aria-label="Parabel und Gerade mit eingeschlossener Fläche">
        <Achsen k={k} />
        {disk > 0 && <path d={k.flaeche(f, a, bb, g)} fill={F.gold} stroke="none" />}
        <path d={k.kurve(f)} fill="none" stroke={F.see} strokeWidth="2.5" />
        <path d={k.kurve(g)} fill="none" stroke={F.rosaKraeftig} strokeWidth="2.3" />
        {disk > 0 && [a, bb].map((t, i) => <Punkt key={i} x={k.px(t)} y={k.py(f(t))} farbe={F.gold3} />)}
        <Txt x={k.px(4.9)} y={k.py(f(4.9)) + 16} farbe={F.see}>f</Txt>
        <Txt x={k.px(5.2)} y={k.py(g(5.2)) - 8} farbe={F.rosaKraeftig}>g</Txt>
      </svg>
      <Regler label="Gerade verschieben" wert={c} setze={setC} min={-1} max={2.8} anzeige={z(c)} />
      <Messzeile>{disk > 0 ? <M t={`A = \\int_{${z(a)}}^{${z(bb)}} (f - g) \\, dx = ${z(A)}`} /> : <span>Kein Schnittpunkt – keine eingeschlossene Fläche.</span>}</Messzeile>
    </div>
  );
}

/* ---------- Bestand aus Änderungsrate ---------- */
function Bestand() {
  const [t, setT] = useState(2);
  const r = (s) => 6 - 2 * s;
  const B = (s) => 10 + 6 * s - s * s;
  const k1 = koord({ x0: -0.2, x1: 6.2, y0: -6.5, y1: 6.5, w: 340, h: 130 });
  const k2 = koord({ x0: -0.2, x1: 6.2, y0: -0.5, y1: 21, w: 340, h: 130 });
  return (
    <div>
      <Hinweis>Oben die Zuflussrate, unten der Bestand. Solange die Rate positiv ist, steigt der Bestand – am größten ist er, wo die Rate das Vorzeichen wechselt.</Hinweis>
      <svg viewBox="0 0 340 270" style={svgStil} role="img" aria-label="Änderungsrate und Bestand übereinander">
        <Achsen k={k1} beschriften={false} xName="t" yName="r" />
        <path d={k1.flaeche((s) => Math.max(r(s), 0), 0, t)} fill={F.blau} />
        <path d={k1.flaeche((s) => Math.min(r(s), 0), 0, t)} fill={F.rosa} />
        <path d={k1.kurve(r, 0, 6)} fill="none" stroke={F.see} strokeWidth="2.3" />
        <g transform="translate(0 138)">
          <Achsen k={k2} beschriften={false} xName="t" yName="B" />
          <line x1={k2.px(0)} x2={k2.px(6)} y1={k2.py(10)} y2={k2.py(10)} stroke={F.achse} strokeDasharray="3 3" />
          <path d={k2.kurve(B, 0, 6)} fill="none" stroke={F.blauMittel} strokeWidth="1.5" strokeDasharray="4 4" />
          <path d={k2.kurve(B, 0, t)} fill="none" stroke={F.gold3} strokeWidth="2.6" />
          <Punkt x={k2.px(t)} y={k2.py(B(t))} farbe={F.gold3} />
          <Txt x={k2.px(0) + 4} y={k2.py(10) - 5} anker="start" gr={10} farbe={F.grau}>B(0) = 10</Txt>
        </g>
      </svg>
      <Regler label="t" wert={t} setze={setT} min={0} max={6} anzeige={z(t)} />
      <Messzeile><M t={`B(${z(t)}) = 10 + \\int_0^{${z(t)}} (6 - 2s) \\, ds = 10 + ${z(B(t) - 10)} = ${z(B(t))}`} /></Messzeile>
    </div>
  );
}

/* ---------- Mittelwert: flächengleiches Rechteck ---------- */
function Mittelwert() {
  const f = (x) => 0.6 * Math.sin(x) + 0.25 * x + 0.8;
  const a = 0.5, b = 5.5;
  const P = (x) => -0.6 * Math.cos(x) + 0.125 * x * x + 0.8 * x;
  const m = (P(b) - P(a)) / (b - a);
  const [h, setH] = useState(1.1);
  const k = koord({ x0: -0.2, x1: 6, y0: -0.3, y1: 2.6, w: 340, h: 220 });
  const ueber = (() => { let s = 0; for (let i = 0; i < 400; i++) { const x = a + ((b - a) * (i + 0.5)) / 400; s += Math.max(f(x) - h, 0) * ((b - a) / 400); } return s; })();
  const unter = (() => { let s = 0; for (let i = 0; i < 400; i++) { const x = a + ((b - a) * (i + 0.5)) / 400; s += Math.max(h - f(x), 0) * ((b - a) / 400); } return s; })();
  const passt = Math.abs(ueber - unter) < 0.03;
  return (
    <div>
      <Hinweis>Schiebe die Höhe des Rechtecks, bis Überstand (gold) und Lücke (rosa) gleich groß sind. Dann ist die Höhe der Mittelwert.</Hinweis>
      <svg viewBox="0 0 340 220" style={svgStil} role="img" aria-label="Graph mit flächengleichem Rechteck">
        <Achsen k={k} />
        <path d={k.flaeche(f, a, b)} fill={F.blau} opacity="0.6" />
        <path d={k.flaeche((x) => Math.max(f(x), h), a, b, () => h)} fill={F.gold2} />
        <path d={k.flaeche(() => h, a, b, (x) => Math.min(f(x), h))} fill={F.rosa} />
        <rect x={k.px(a)} y={k.py(h)} width={k.px(b) - k.px(a)} height={k.py(0) - k.py(h)} fill="none" stroke={passt ? F.gruenKraeftig : F.tinte} strokeWidth={passt ? 2.4 : 1.4} strokeDasharray={passt ? undefined : "5 4"} />
        <path d={k.kurve(f)} fill="none" stroke={F.see} strokeWidth="2.4" />
      </svg>
      <Regler label="Höhe" wert={h} setze={setH} min={0.5} max={2.2} schritt={0.005} anzeige={z(h)} />
      <Messzeile>
        <div>Überstand {z(ueber)} · Lücke {z(unter)} {passt && <b style={{ color: F.gruenKraeftig }}>✓</b>}</div>
        <M t={`\\overline{m} = \\frac{1}{${z(b - a)}} \\int_{${z(a)}}^{${z(b)}} f(x) \\, dx = ${z(m)}`} />
      </Messzeile>
    </div>
  );
}

/* ---------- Rotationskörper ---------- */
function Rotation() {
  const [n, setN] = useState(8);
  const f = (x) => 0.9 * Math.sqrt(x) + 0.2;
  const a = 0.2, b = 4;
  const k = koord({ x0: -0.3, x1: 4.5, y0: -2.6, y1: 2.6, w: 340, h: 230 });
  const dx = (b - a) / n;
  const scheiben = [];
  for (let i = 0; i < n; i++) {
    const x = a + (i + 0.5) * dx, r = f(x);
    const X = k.px(a + i * dx), Wd = k.px(a + (i + 1) * dx) - X, R = k.py(0) - k.py(r);
    scheiben.push(
      <g key={i}>
        <rect x={X} y={k.py(r)} width={Wd} height={2 * R} fill={F.blau} stroke={F.see} strokeWidth="0.8" />
        <ellipse cx={X + Wd} cy={k.py(0)} rx={Math.max(3, R * 0.28)} ry={R} fill={F.blauMittel} stroke={F.see} strokeWidth="0.8" />
      </g>
    );
  }
  const exakt = Math.PI * (0.405 * (b * b - a * a) + 0.24 * (b ** 1.5 - a ** 1.5) + 0.04 * (b - a));
  let summe = 0; for (let i = 0; i < n; i++) summe += Math.PI * f(a + (i + 0.5) * dx) ** 2 * dx;
  return (
    <div>
      <Hinweis>Der Graph dreht sich um die x-Achse. Der Körper wird in n Scheiben zerlegt – jede ist ein flacher Zylinder.</Hinweis>
      <svg viewBox="0 0 340 230" style={svgStil} role="img" aria-label={`Rotationskörper aus ${n} zylindrischen Scheiben`}>
        <Achsen k={k} beschriften={false} />
        {scheiben}
        <path d={k.kurve(f, a, b)} fill="none" stroke={F.tinte} strokeWidth="2.2" />
        <path d={k.kurve((x) => -f(x), a, b)} fill="none" stroke={F.tinte} strokeWidth="1.4" strokeDasharray="4 3" />
        <Txt x={k.px(3.4)} y={k.py(f(3.4)) - 8} gr={11}>f</Txt>
      </svg>
      <Regler label="Scheiben" wert={n} setze={setN} min={2} max={40} schritt={1} anzeige={n} />
      <Messzeile><M t={`\\sum \\pi f(x_i)^2 Δx = ${z(summe)} \\;\\to\\; V = ${z(exakt)}`} /></Messzeile>
    </div>
  );
}

/* ---------- Uneigentliches Integral ---------- */
function Uneigentlich() {
  const [b, setB] = useState(4);
  const k = koord({ x0: -0.2, x1: 10.5, y0: -0.15, y1: 1.3, w: 340, h: 200 });
  const sicht = Math.min(b, 10.4);
  return (
    <div>
      <Hinweis>Schiebe die Grenze b weit nach rechts. Unter 1/x² wächst die Fläche nie über 1, unter 1/x wächst sie ohne Ende.</Hinweis>
      <svg viewBox="0 0 340 200" style={svgStil} role="img" aria-label="Flächen unter 1 durch x und 1 durch x Quadrat ab 1">
        <Achsen k={k} schritt={1} ySchritt={0.5} />
        <path d={k.flaeche((x) => 1 / x, 1, sicht)} fill={F.rosa} opacity="0.75" />
        <path d={k.flaeche((x) => 1 / (x * x), 1, sicht)} fill={F.blau} />
        <path d={k.kurve((x) => (x > 0.75 ? 1 / x : NaN))} fill="none" stroke={F.rosaKraeftig} strokeWidth="2.2" />
        <path d={k.kurve((x) => (x > 0.85 ? 1 / (x * x) : NaN))} fill="none" stroke={F.see} strokeWidth="2.4" />
        <Txt x={k.px(9.5)} y={k.py(1 / 9.5) - 8} farbe={F.rosaKraeftig} gr={11}>1/x</Txt>
        <Txt x={k.px(2.6)} y={k.py(1 / 6.76) - 6} farbe={F.see} gr={11} anker="start">1/x²</Txt>
      </svg>
      <Regler label="b" wert={b} setze={setB} min={1.5} max={200} schritt={0.5} anzeige={z(b)} />
      <Messzeile>
        <div><M t={`\\int_1^{${z(b)}} \\frac{1}{x^2} dx = 1 - \\frac{1}{${z(b)}} = ${z(1 - 1 / b)} \\;\\to\\; 1`} /></div>
        <div><M t={`\\int_1^{${z(b)}} \\frac{1}{x} dx = \\ln ${z(b)} = ${z(Math.log(b))} \\;\\to\\; \\infty`} /></div>
      </Messzeile>
    </div>
  );
}

export const BILDER_1 = {
  sekante: (p) => <Sekante {...p} />,
  tangente: (p) => <Tangente {...p} />,
  potenz: (p) => <Potenz {...p} />,
  streckung: (p) => <Streckung {...p} />,
  produktflaeche: (p) => <ProduktFlaeche {...p} />,
  kette: (p) => <Kette {...p} />,
  expTangente: (p) => <ExpTangente {...p} />,
  lnSpiegel: (p) => <LnSpiegel {...p} />,
  sinAbl: (p) => <SinAbl {...p} />,
  kurvenTrio: (p) => <KurvenTrio {...p} />,
  leitterm: (p) => <Leitterm {...p} />,
  asymptote: (p) => <Asymptote {...p} />,
  schachtel: (p) => <Schachtel {...p} />,
  steckbrief: (p) => <Steckbrief {...p} />,
  ortskurve: (p) => <Ortskurve {...p} />,
  stammSchar: (p) => <StammSchar {...p} />,
  integralfunktion: (p) => <IntegralFunktion {...p} />,
  riemann: (p) => <Riemann {...p} />,
  orientiert: (p) => <Orientiert {...p} />,
  zwischen: (p) => <Zwischen {...p} />,
  bestand: (p) => <Bestand {...p} />,
  mittelwert: (p) => <Mittelwert {...p} />,
  rotation: (p) => <Rotation {...p} />,
  uneigentlich: (p) => <Uneigentlich {...p} />,
};
