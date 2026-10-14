/* ======================================================================
   FORMELSAMMLUNG · Illustrationen Teil 2: Funktionen und Vektoren
   Enthält ein kleines 3D-Schrägbild (drehbar mit Finger oder Maus).
   ====================================================================== */
import React, { useMemo, useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { Achsen, Bogen, F, Griff, Hinweis, Messzeile, Pfeil, Punkt, RechterWinkel, Regler, Txt, Umschalter, faktor, klemm, koord, summe, svgStil, useZiehen, xMinus, z } from "./funcFsBasis.jsx";

/* ======================= Geraden ======================= */
function Gerade({ dreieck = false, punkt = false, winkel = false, ortho = false, zwei = false, abstand = false }) {
  const [A, setA] = useState([-1, -0.5]);
  const [B, setB] = useState([2.5, 2]);
  const k = koord({ x0: -3, x1: 4, y0: -2.5, y1: 3.5, w: 340, h: 291 });
  const m = Math.abs(B[0] - A[0]) < 1e-6 ? NaN : (B[1] - A[1]) / (B[0] - A[0]);
  const b = A[1] - m * A[0];
  const welcher = React.useRef("B");
  const zieh = useZiehen(([sx, sy], neu) => {
    const p = [klemm(Math.round(k.ix(sx) * 2) / 2, -2.5, 3.5), klemm(Math.round(k.iy(sy) * 2) / 2, -2, 3)];
    if (neu) {
      const dA = Math.hypot(sx - k.px(A[0]), sy - k.py(A[1])), dB = Math.hypot(sx - k.px(B[0]), sy - k.py(B[1]));
      if (Math.min(dA, dB) > 36) return false;
      welcher.current = dA < dB ? "A" : "B";
    }
    if (welcher.current === "A") { if (p[0] !== B[0] || p[1] !== B[1]) setA(p); } else if (p[0] !== A[0] || p[1] !== A[1]) setB(p);
    return true;
  });
  const g = (x) => m * x + b;
  const h2 = (x) => -0.6 * x + 1.8;
  const mh = isFinite(m) && Math.abs(m) > 1e-6 ? -1 / m : NaN;
  const ortS = A, hOrtho = (x) => ortS[1] + mh * (x - ortS[0]);
  const xs = zwei && isFinite(m) && Math.abs(m + 0.6) > 1e-6 ? (1.8 - b) / (m + 0.6) : NaN;
  const wink = isFinite(m) ? (Math.atan(m) * 180) / Math.PI : 90;
  const x0 = isFinite(m) && Math.abs(m) > 1e-6 ? -b / m : NaN;
  const titel = abstand ? "Ziehe A oder B. Der Abstand ist die Hypotenuse im Steigungsdreieck." : "Ziehe die Punkte A und B (sie rasten auf halben Einheiten ein).";
  return (
    <div>
      <Hinweis>{titel}</Hinweis>
      <svg viewBox="0 0 340 291" style={svgStil} {...zieh} role="img" aria-label="Gerade durch zwei Punkte mit Steigungsdreieck">
        <Achsen k={k} />
        {isFinite(m) && <path d={k.kurve(g)} fill="none" stroke={F.see} strokeWidth="2.5" />}
        {!isFinite(m) && <line x1={k.px(A[0])} x2={k.px(A[0])} y1={k.py(-2.5)} y2={k.py(3.5)} stroke={F.see} strokeWidth="2.5" />}
        {zwei && <path d={k.kurve(h2)} fill="none" stroke={F.rosaKraeftig} strokeWidth="2.3" />}
        {zwei && isFinite(xs) && <Punkt x={k.px(xs)} y={k.py(h2(xs))} farbe={F.gold3} r={6} />}
        {ortho && isFinite(mh) && <path d={k.kurve(hOrtho)} fill="none" stroke={F.rosaKraeftig} strokeWidth="2.3" />}
        {ortho && isFinite(mh) && (() => {
          const u = [1 / Math.hypot(1, m), -m / Math.hypot(1, m)], v = [1 / Math.hypot(1, mh) * Math.sign(1), -mh / Math.hypot(1, mh)];
          return <RechterWinkel x={k.px(A[0])} y={k.py(A[1])} u={u} v={v} g={11} />;
        })()}
        {(dreieck || abstand || punkt) && isFinite(m) && (
          <g>
            <path d={`M${k.px(A[0])} ${k.py(A[1])} H${k.px(B[0])} V${k.py(B[1])}`} fill={abstand ? F.gold : "none"} fillOpacity="0.6" stroke={F.tinte} strokeWidth="1.4" strokeDasharray="4 3" />
            <Txt x={(k.px(A[0]) + k.px(B[0])) / 2} y={k.py(A[1]) + (B[1] > A[1] ? 15 : -7)} gr={11}>{`Δx = ${z(B[0] - A[0])}`}</Txt>
            <Txt x={k.px(B[0]) + (B[0] > A[0] ? 6 : -6)} y={(k.py(A[1]) + k.py(B[1])) / 2 + 4} gr={11} anker={B[0] > A[0] ? "start" : "end"}>{`Δy = ${z(B[1] - A[1])}`}</Txt>
          </g>
        )}
        {abstand && <line x1={k.px(A[0])} y1={k.py(A[1])} x2={k.px(B[0])} y2={k.py(B[1])} stroke={F.rosaKraeftig} strokeWidth="3.4" />}
        {winkel && isFinite(x0) && (
          <g>
            <Bogen x={k.px(x0)} y={k.py(0)} r={26} w1={m > 0 ? 0 : 0} w2={-Math.atan(m * ((k.py(0) - k.py(1)) / (k.px(1) - k.px(0))))} farbe={F.gold3} />
            <Txt x={k.px(x0) + 34} y={k.py(0) - (m > 0 ? 8 : -16)} gr={11} anker="start" farbe={F.gold3}>α</Txt>
          </g>
        )}
        {(punkt) && <Txt x={k.px(A[0]) - 8} y={k.py(A[1]) + 18} gr={11} farbe={F.see}>(x₁ | y₁)</Txt>}
        <Griff x={k.px(A[0])} y={k.py(A[1])} farbe={F.see} />
        <Griff x={k.px(B[0])} y={k.py(B[1])} farbe={F.see} />
        <Txt x={k.px(A[0]) - 10} y={k.py(A[1]) - 12} farbe={F.see}>A</Txt>
        <Txt x={k.px(B[0]) + 10} y={k.py(B[1]) - 12} farbe={F.see}>B</Txt>
      </svg>
      <Messzeile>
        {isFinite(m) ? (
          <>
            <div><M t={`m = \\frac{${z(B[1])} - (${z(A[1])})}{${z(B[0])} - (${z(A[0])})} = ${z(m)}`} /></div>
            {!abstand && <div><M t={`y = ${summe([[m, "x"], [b, ""]])}`} />{winkel && <> · <M t={`α = ${z(wink)}°`} /></>}</div>}
            {ortho && isFinite(mh) && <div><M t={`m_⊥ = -\\frac{1}{${z(m)}} = ${z(mh)}, \\quad m \\cdot m_⊥ = -1`} /></div>}
            {zwei && isFinite(xs) && <div><M t={`S(${z(xs)} | ${z(h2(xs))})`} /></div>}
          </>
        ) : <div>Senkrechte Gerade: keine Steigung</div>}
        {abstand && <div><M t={`d = \\sqrt{${z(B[0] - A[0])}^2 + ${z(B[1] - A[1])}^2} = ${z(Math.hypot(B[0] - A[0], B[1] - A[1]))}`} /></div>}
      </Messzeile>
    </div>
  );
}

/* ======================= Parabeln ======================= */
function Parabel({ form = "scheitel", mitte = false, nullstellen = false }) {
  const [a, setA] = useState(form === "brenn" ? 0.25 : 1);
  const [d, setD] = useState(form === "brenn" ? 0 : 1);
  const [e, setE] = useState(form === "brenn" ? 0 : form === "diskriminante" ? -1 : -2);
  const [lauf, setLauf] = useState(0.4);
  const k = koord({ x0: -4, x1: 5, y0: -4, y1: 5, w: 340, h: 340 });
  const f = (x) => a * (x - d) ** 2 + e;
  const bb = -2 * a * d, cc = a * d * d + e;
  const D = bb * bb - 4 * a * cc;
  const ns = D > 1e-9 ? [(-bb - Math.sqrt(D)) / (2 * a), (-bb + Math.sqrt(D)) / (2 * a)].sort((u, v) => u - v) : Math.abs(D) <= 1e-9 ? [d] : [];
  const p = 1 / (4 * a);
  const zeigeNull = nullstellen || form === "null" || form === "diskriminante" || mitte;
  const Fp = [d, e + p];
  const strahlen = form === "brenn" ? [-2.4, -1.4, -0.6, 0.7, 1.6, 2.5].map((dx) => d + dx) : [];
  return (
    <div>
      <Hinweis>{form === "brenn" ? "Senkrecht einfallende Strahlen werden so reflektiert, dass sie alle durch den Brennpunkt F gehen." : "Verändere die Regler und beobachte Scheitel und Nullstellen."}</Hinweis>
      <svg viewBox="0 0 340 340" style={{ ...svgStil, maxWidth: 400 }} role="img" aria-label="Parabel mit Scheitelpunkt und Nullstellen">
        <Achsen k={k} />
        {form === "brenn" && strahlen.map((x, i) => {
          const y = f(x);
          return (
            <g key={i}>
              <line x1={k.px(x)} y1={k.py(5)} x2={k.px(x)} y2={k.py(y)} stroke={F.gold3} strokeWidth="1.3" opacity="0.8" />
              <line x1={k.px(x)} y1={k.py(y)} x2={k.px(Fp[0])} y2={k.py(Fp[1])} stroke={F.gold3} strokeWidth="1.3" opacity="0.8" />
            </g>
          );
        })}
        {form === "brenn" && <line x1={k.px(-4)} x2={k.px(5)} y1={k.py(e - p)} y2={k.py(e - p)} stroke={F.rosaKraeftig} strokeWidth="1.4" strokeDasharray="5 4" />}
        {form === "brenn" && (() => { const x = d + lauf * 4 - 2, y = f(x); return (
          <g>
            <line x1={k.px(x)} y1={k.py(y)} x2={k.px(Fp[0])} y2={k.py(Fp[1])} stroke={F.rosaKraeftig} strokeWidth="2" />
            <line x1={k.px(x)} y1={k.py(y)} x2={k.px(x)} y2={k.py(e - p)} stroke={F.rosaKraeftig} strokeWidth="2" />
            <Punkt x={k.px(x)} y={k.py(y)} farbe={F.rosaKraeftig} />
          </g>); })()}
        <path d={k.kurve(f)} fill="none" stroke={F.see} strokeWidth="2.7" />
        {(form === "scheitel" || form === "normal" || mitte) && <Punkt x={k.px(d)} y={k.py(e)} farbe={F.gold3} r={6} />}
        {mitte && <line x1={k.px(d)} x2={k.px(d)} y1={k.py(-4)} y2={k.py(5)} stroke={F.gold3} strokeDasharray="5 4" />}
        {zeigeNull && ns.map((x, i) => <Punkt key={i} x={k.px(x)} y={k.py(0)} farbe={F.rosaKraeftig} r={5.5} />)}
        {form === "normal" && <Punkt x={k.px(0)} y={k.py(cc)} farbe={F.see} ring />}
        {form === "brenn" && <Punkt x={k.px(Fp[0])} y={k.py(Fp[1])} farbe={F.rosaKraeftig} r={5.5} />}
        {form === "brenn" && <Txt x={k.px(Fp[0]) + 10} y={k.py(Fp[1]) + 4} anker="start" farbe={F.rosaKraeftig}>F</Txt>}
        {(form === "scheitel" || mitte) && <Txt x={k.px(d)} y={k.py(e) + (a > 0 ? 20 : -12)} farbe={F.gold3}>S</Txt>}
      </svg>
      <Regler label="a" wert={a} setze={(v) => setA(Math.abs(v) < 0.05 ? (v < 0 ? -0.05 : 0.05) : v)} min={-2} max={2} schritt={0.05} anzeige={z(a)} />
      {form !== "brenn" && <Regler label="d" wert={d} setze={setD} min={-3} max={3} schritt={0.1} anzeige={z(d)} />}
      {form !== "brenn" && <Regler label="e" wert={e} setze={setE} min={-3} max={3} schritt={0.1} anzeige={z(e)} />}
      {form === "brenn" && <Regler label="Punkt auf der Parabel" wert={lauf} setze={setLauf} min={0} max={1} />}
      <Messzeile>
        {form === "normal" || form === "diskriminante" || nullstellen ? <div><M t={`f(x) = ${summe([[a, "x^2"], [bb, "x"], [cc, ""]])}`} /></div>
          : form === "null" ? <div>{ns.length === 2 ? <M t={`f(x) = ${Math.abs(a - 1) < 1e-9 ? "" : Math.abs(a + 1) < 1e-9 ? "-" : z(a)}(${xMinus(ns[0])})(${xMinus(ns[1])})`} /> : <span>keine zwei reellen Nullstellen</span>}</div>
          : form === "brenn" ? <div><M t={`f(x) = ${summe([[a, "x^2"]])}, \\quad F(0 | ${z(p)})`} /></div>
          : <div><M t={`f(x) = ${Math.abs(a - 1) < 1e-9 ? "" : Math.abs(a + 1) < 1e-9 ? "-" : z(a)}${Math.abs(d) < 1e-9 ? "x^2" : `(${xMinus(d)})^2`}${Math.abs(e) < 1e-9 ? "" : ` ${e < 0 ? "-" : "+"} ${z(Math.abs(e))}`}, \\quad S(${z(d)} | ${z(e)})`} /></div>}
        {form === "diskriminante" && <div><M t={`D = b^2 - 4ac = ${z(D)}`} /> · <b>{D > 1e-9 ? "zwei Nullstellen" : Math.abs(D) <= 1e-9 ? "eine Nullstelle" : "keine Nullstelle"}</b></div>}
        {mitte && <div><M t={`x_S = -\\frac{b}{2a} = -\\frac{${z(bb)}}{${z(2 * a)}} = ${z(d)}`} /></div>}
      </Messzeile>
    </div>
  );
}

/* ======================= Symmetrie ======================= */
function Symmetrie() {
  const [art, setArt] = useState("achse");
  const [x, setX] = useState(1.3);
  const f = art === "achse" ? (t) => 0.25 * t ** 4 - 1.2 * t ** 2 + 0.5 : (t) => 0.3 * t ** 3 - 1.2 * t;
  const k = koord({ x0: -3, x1: 3, y0: -2.5, y1: 2.5, w: 340, h: 260 });
  const P = [x, f(x)], Q = [-x, f(-x)];
  return (
    <div>
      <Hinweis>Bewege x: Bei Achsensymmetrie hat −x denselben Funktionswert, bei Punktsymmetrie den entgegengesetzten.</Hinweis>
      <svg viewBox="0 0 340 260" style={svgStil} role="img" aria-label="Achsen- oder punktsymmetrischer Graph mit gespiegeltem Punktpaar">
        <Achsen k={k} />
        <path d={k.kurve(f)} fill="none" stroke={F.see} strokeWidth="2.5" />
        <line x1={k.px(P[0])} y1={k.py(P[1])} x2={k.px(Q[0])} y2={k.py(Q[1])} stroke={F.rosaKraeftig} strokeWidth="1.4" strokeDasharray="4 3" />
        <Punkt x={k.px(P[0])} y={k.py(P[1])} farbe={F.gold3} r={5.5} />
        <Punkt x={k.px(Q[0])} y={k.py(Q[1])} farbe={F.rosaKraeftig} r={5.5} />
        {art === "punkt" && <Punkt x={k.px(0)} y={k.py(0)} farbe={F.tinte} r={3.5} />}
        <Txt x={k.px(P[0])} y={k.py(P[1]) - 12} gr={11} farbe={F.gold3}>x</Txt>
        <Txt x={k.px(Q[0])} y={k.py(Q[1]) - 12} gr={11} farbe={F.rosaKraeftig}>−x</Txt>
      </svg>
      <Umschalter label="Art" wert={art} setze={setArt} optionen={[["achse", "achsensymmetrisch"], ["punkt", "punktsymmetrisch"]]} />
      <Regler label="x" wert={x} setze={setX} min={0} max={2.8} anzeige={z(x)} />
      <Messzeile><M t={`f(${z(x)}) = ${z(P[1])}, \\quad f(${z(-x)}) = ${z(Q[1])}`} /></Messzeile>
    </div>
  );
}

/* ======================= Verschieben und Strecken ======================= */
function Transform({ basis = "parabel", cosVergleich = false }) {
  const sinus = basis === "sin";
  const [a, setA] = useState(sinus ? 1.5 : 1);
  const [b, setB] = useState(1);
  const [c, setC] = useState(cosVergleich ? -Math.PI / 2 : sinus ? 0.5 : 1);
  const [d, setD] = useState(sinus ? 0.5 : -1);
  const g0 = sinus ? Math.sin : (t) => 0.5 * t * t;
  const g = (x) => a * g0(b * (x - c)) + d;
  const k = sinus ? koord({ x0: -3.5, x1: 7, y0: -3, y1: 3.5, w: 340, h: 230 }) : koord({ x0: -4, x1: 4, y0: -3, y1: 4, w: 340, h: 260 });
  const per = (2 * Math.PI) / Math.abs(b);
  return (
    <div>
      <Hinweis>{cosVergleich ? "Bei c = −π/2 liegt der verschobene Sinus genau auf dem Kosinus (gestrichelt)." : "Grau ist die Ausgangsfunktion, blau die veränderte. a und d wirken senkrecht, b und c waagerecht."}</Hinweis>
      <svg viewBox={`0 0 340 ${sinus ? 230 : 260}`} style={svgStil} role="img" aria-label="Ausgangsfunktion und verschobene, gestreckte Funktion">
        <Achsen k={k} schritt={sinus ? Math.PI / 2 : 1} beschriften={!sinus} />
        {sinus && [Math.PI / 2, Math.PI, 1.5 * Math.PI, 2 * Math.PI, -Math.PI / 2, -Math.PI].map((t, i) => <text key={i} x={k.px(t)} y={k.py(0) + 13} fontSize="9" textAnchor="middle" fill={F.achse}>{["π/2", "π", "3π/2", "2π", "−π/2", "−π"][i]}</text>)}
        <path d={k.kurve(g0)} fill="none" stroke={F.achse} strokeWidth="1.6" />
        {cosVergleich && <path d={k.kurve(Math.cos)} fill="none" stroke={F.gold3} strokeWidth="2.2" strokeDasharray="6 5" />}
        {sinus && <line x1={k.px(k.x0)} x2={k.px(k.x1)} y1={k.py(d)} y2={k.py(d)} stroke={F.rosaKraeftig} strokeWidth="1.2" strokeDasharray="4 4" />}
        {sinus && !cosVergleich && (
          <g>
            <line x1={k.px(c)} x2={k.px(c + per)} y1={k.py(d - Math.abs(a) - 0.25)} y2={k.py(d - Math.abs(a) - 0.25)} stroke={F.gold3} strokeWidth="2" />
            <Txt x={k.px(c + per / 2)} y={k.py(d - Math.abs(a) - 0.25) + 14} gr={10} farbe={F.gold3}>{`Periode ${z(per)}`}</Txt>
            <line x1={k.px(c + per / (4 * Math.sign(b || 1)))} x2={k.px(c + per / (4 * Math.sign(b || 1)))} y1={k.py(d)} y2={k.py(d + a)} stroke={F.rosaKraeftig} strokeWidth="2" />
          </g>
        )}
        <path d={k.kurve(g)} fill="none" stroke={F.see} strokeWidth="2.7" />
      </svg>
      <Regler label="a" wert={a} setze={setA} min={-2.5} max={2.5} schritt={0.1} anzeige={z(a)} />
      <Regler label="b" wert={b} setze={(v) => setB(Math.abs(v) < 0.2 ? 0.2 : v)} min={0.2} max={3} schritt={0.1} anzeige={z(b)} />
      <Regler label="c" wert={c} setze={setC} min={-3.2} max={3.2} schritt={0.05} anzeige={z(c)} />
      <Regler label="d" wert={d} setze={setD} min={-2} max={2} schritt={0.1} anzeige={z(d)} />
      <Messzeile><M t={`g(x) = ${faktor(a, `${sinus ? "\\sin" : "f"}(${Math.abs(b - 1) < 1e-9 ? xMinus(c) : Math.abs(c) < 1e-9 ? z(b) + "x" : `${z(b)}(${xMinus(c)})`})`)}${Math.abs(d) < 1e-9 ? "" : ` ${d < 0 ? "-" : "+"} ${z(Math.abs(d))}`}`} /></Messzeile>
    </div>
  );
}

/* ======================= Wachstum ======================= */
function Wachstum({ modus = "basis" }) {
  const [a, setA] = useState(modus === "zins" ? 5 : modus === "halb" ? 0.7 : 1.5);
  const [N0, setN0] = useState(modus === "begrenzt" ? 1 : 1);
  const kz = modus === "halb" ? Math.log(a) : modus === "e" ? a - 1 : Math.log(a);
  const k = koord({ x0: -0.5, x1: 10.5, y0: modus === "halb" ? -0.1 : -0.6, y1: modus === "zins" ? 2.8 : modus === "halb" ? 1.15 : 8.5, w: 340, h: 240 });
  const fExp = modus === "zins" ? (t) => N0 * (1 + a / 100) ** (t * 2) : (t) => N0 * Math.exp(kz * t);
  const fLin = (t) => N0 + 0.7 * t;
  const S = 7, kb = 0.35;
  const fBeg = (t) => S - (S - N0) * Math.exp(-kb * t);
  const T2 = Math.log(2) / Math.abs(kz);
  const marken = [];
  if (modus === "halb" || modus === "basis" || modus === "e") {
    for (let i = 0; i < 6; i++) { const t = i * T2; if (t > 10.4) break; marken.push(t); }
  }
  return (
    <div>
      <Hinweis>{modus === "vergleich" ? "Linear kommt immer derselbe Betrag dazu, exponentiell immer derselbe Faktor. Früher oder später gewinnt exponentiell."
        : modus === "begrenzt" ? "Der Abstand zur Schranke S schrumpft exponentiell – der Bestand nähert sich S."
          : modus === "halb" ? "In jeder Halbwertszeit halbiert sich der Bestand – egal, wo man anfängt."
            : modus === "zins" ? "Jedes Jahr wird mit demselben Faktor multipliziert – auch die Zinsen der Vorjahre."
              : "Bei gleich großen Schritten nach rechts wird immer mit demselben Faktor multipliziert."}</Hinweis>
      <svg viewBox="0 0 340 240" style={svgStil} role="img" aria-label="Wachstumskurve">
        <Achsen k={k} schritt={1} ySchritt={modus === "zins" ? 0.5 : modus === "halb" ? 0.25 : 1} xName="t" yName="N" beschriften={modus !== "zins"} />
        {modus === "begrenzt" && <line x1={k.px(k.x0)} x2={k.px(k.x1)} y1={k.py(S)} y2={k.py(S)} stroke={F.rosaKraeftig} strokeWidth="1.6" strokeDasharray="6 4" />}
        {modus === "begrenzt" && <Txt x={k.px(10.2)} y={k.py(S) - 6} anker="end" gr={11} farbe={F.rosaKraeftig}>S</Txt>}
        {modus === "vergleich" && <path d={k.kurve(fLin)} fill="none" stroke={F.gold3} strokeWidth="2.4" />}
        {modus === "begrenzt" ? <path d={k.kurve(fBeg)} fill="none" stroke={F.see} strokeWidth="2.6" /> : <path d={k.kurve(fExp)} fill="none" stroke={F.see} strokeWidth="2.6" />}
        {marken.map((t, i) => (
          <g key={i}>
            <line x1={k.px(t)} x2={k.px(t)} y1={k.py(0)} y2={k.py(fExp(t))} stroke={F.gold3} strokeDasharray="3 3" />
            <Punkt x={k.px(t)} y={k.py(fExp(t))} farbe={F.gold3} r={3.8} />
          </g>
        ))}
        {modus === "vergleich" && [0, 2, 4, 6, 8].map((t) => <g key={t}><Punkt x={k.px(t)} y={k.py(fLin(t))} farbe={F.gold3} r={3.2} /><Punkt x={k.px(t)} y={k.py(fExp(t))} farbe={F.see} r={3.2} /></g>)}
        {modus === "begrenzt" && [2, 5, 8].map((t) => <line key={t} x1={k.px(t)} x2={k.px(t)} y1={k.py(fBeg(t))} y2={k.py(S)} stroke={F.rosaKraeftig} strokeWidth="2" />)}
      </svg>
      {modus === "zins" ? <Regler label="Zinssatz p %" wert={a} setze={setA} min={0.5} max={12} schritt={0.5} anzeige={`${z(a)} %`} />
        : modus === "begrenzt" ? <Regler label="N₀" wert={N0} setze={setN0} min={0} max={6.5} schritt={0.1} anzeige={z(N0)} />
          : <Regler label={modus === "e" ? "k + 1" : "Faktor a"} wert={a} setze={setA} min={modus === "halb" ? 0.3 : 1.05} max={modus === "halb" ? 0.95 : 2} schritt={0.01} anzeige={z(a)} />}
      <Messzeile>
        {modus === "zins" ? <span><M t={`K_n = K_0 \\cdot ${z(1 + a / 100)}^n`} /> · nach 10 Jahren <M t={`\\times ${z((1 + a / 100) ** 10)}`} /></span>
          : modus === "begrenzt" ? <M t={`N(t) = ${N0 >= 6.99 ? "7" : `7 - ${z(7 - N0)} e^{-0{,}35t}`}`} />
            : modus === "vergleich" ? <span>linear <M t={"+0{,}7"} /> pro Schritt · exponentiell <M t={`\\times ${z(a)}`} /> pro Schritt</span>
              : <M t={`N(t) = e^{${z(kz)}t}, \\quad T_{${modus === "halb" ? "\\frac{1}{2}" : "2"}} = \\frac{\\ln 2}{${z(Math.abs(kz))}} = ${z(T2)}`} />}
      </Messzeile>
    </div>
  );
}

/* ======================= Vektoren in der Ebene ======================= */
function Vek2d({ modus = "verbindung" }) {
  const [A, setA] = useState([1, 2]);
  const [B, setB] = useState([4, 1]);
  const [r, setR] = useState(1.5);
  const k = koord({ x0: -1.5, x1: 5.5, y0: -1.5, y1: 4.5, w: 340, h: 291 });
  const welcher = React.useRef("B");
  const zieh = useZiehen(([sx, sy], neu) => {
    const p = [klemm(Math.round(k.ix(sx) * 2) / 2, -1, 5), klemm(Math.round(k.iy(sy) * 2) / 2, -1, 4)];
    const Bpos = modus === "addition" ? [A[0] + B[0], A[1] + B[1]] : B;
    if (neu) {
      const dA = Math.hypot(sx - k.px(A[0]), sy - k.py(A[1])), dB = Math.hypot(sx - k.px(Bpos[0]), sy - k.py(Bpos[1]));
      if (Math.min(dA, dB) > 36) return false;
      welcher.current = dA < dB ? "A" : "B";
    }
    if (welcher.current === "A") setA(p);
    else setB(modus === "addition" ? [p[0] - A[0], p[1] - A[1]] : p);
    return true;
  });
  const O = [k.px(0), k.py(0)], P = (v) => [k.px(v[0]), k.py(v[1])];
  const pf = (von, nach, farbe, gestr) => <Pfeil x1={P(von)[0]} y1={P(von)[1]} x2={P(nach)[0]} y2={P(nach)[1]} farbe={farbe} gestrichelt={gestr} />;
  const la = Math.hypot(A[0], A[1]);
  const Mm = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
  const AB = [B[0] - A[0], B[1] - A[1]];
  return (
    <div>
      <Hinweis>{modus === "einheit" ? "Ziehe die Spitze von a. Der Einheitsvektor zeigt in dieselbe Richtung, endet aber immer auf dem Kreis mit Radius 1."
        : modus === "kollinear" ? "r · a liegt immer auf derselben Geraden wie a – für negatives r zeigt er in die Gegenrichtung."
          : "Ziehe die Punkte (sie rasten auf halben Einheiten ein)."}</Hinweis>
      <svg viewBox="0 0 340 291" style={svgStil} {...zieh} role="img" aria-label="Vektoren im Koordinatensystem">
        <Achsen k={k} />
        {modus === "verbindung" && <>{pf([0, 0], A, F.see)}{pf([0, 0], B, F.gold3)}{pf(A, B, F.rosaKraeftig)}
          <Txt x={(O[0] + P(A)[0]) / 2 - 10} y={(O[1] + P(A)[1]) / 2} farbe={F.see}>a</Txt>
          <Txt x={(O[0] + P(B)[0]) / 2 + 4} y={(O[1] + P(B)[1]) / 2 + 16} farbe={F.gold3}>b</Txt>
          <Txt x={(P(A)[0] + P(B)[0]) / 2 + 6} y={(P(A)[1] + P(B)[1]) / 2 - 8} farbe={F.rosaKraeftig}>AB</Txt></>}
        {modus === "addition" && (() => { const S = [A[0] + B[0], A[1] + B[1]]; return <>
          <path d={`M${O[0]} ${O[1]} L${P(A)[0]} ${P(A)[1]} L${P(S)[0]} ${P(S)[1]} L${P(B)[0]} ${P(B)[1]} Z`} fill={F.blau} opacity="0.5" />
          {pf([0, 0], A, F.see)}{pf(A, S, F.gold3)}{pf([0, 0], B, F.gold3, true)}{pf(B, S, F.see, true)}{pf([0, 0], S, F.rosaKraeftig)}
          <Txt x={P(S)[0] + 8} y={P(S)[1] - 6} farbe={F.rosaKraeftig} anker="start">a + b</Txt></>; })()}
        {modus === "mittelpunkt" && <>{pf([0, 0], A, F.see)}{pf([0, 0], B, F.gold3)}<line x1={P(A)[0]} y1={P(A)[1]} x2={P(B)[0]} y2={P(B)[1]} stroke={F.achse} strokeWidth="1.5" />{pf([0, 0], Mm, F.rosaKraeftig)}<Punkt x={P(Mm)[0]} y={P(Mm)[1]} farbe={F.rosaKraeftig} /><Txt x={P(Mm)[0] + 8} y={P(Mm)[1] - 8} anker="start" farbe={F.rosaKraeftig}>M</Txt></>}
        {modus === "einheit" && <>
          <circle cx={O[0]} cy={O[1]} r={k.px(1) - k.px(0)} fill="none" stroke={F.achse} strokeDasharray="4 3" />
          {pf([0, 0], A, F.see)}{la > 0 && pf([0, 0], [A[0] / la, A[1] / la], F.rosaKraeftig)}</>}
        {modus === "kollinear" && <>
          <path d={k.kurve((x) => (A[0] ? (A[1] / A[0]) * x : NaN))} fill="none" stroke={F.achse} strokeDasharray="4 4" />
          {pf([0, 0], [r * A[0], r * A[1]], F.rosaKraeftig)}{pf([0, 0], A, F.see)}
          <Txt x={P([r * A[0], r * A[1]])[0] + 8} y={P([r * A[0], r * A[1]])[1] + 14} anker="start" farbe={F.rosaKraeftig}>{`${z(r)} · a`}</Txt></>}
        <Griff x={P(A)[0]} y={P(A)[1]} farbe={F.see} />
        {modus !== "einheit" && modus !== "kollinear" && <Griff x={P(modus === "addition" ? [A[0] + B[0], A[1] + B[1]] : B)[0]} y={P(modus === "addition" ? [A[0] + B[0], A[1] + B[1]] : B)[1]} farbe={F.gold3} />}
        {(modus === "verbindung" || modus === "mittelpunkt") && <><Txt x={P(A)[0] - 10} y={P(A)[1] - 12} farbe={F.see}>A</Txt><Txt x={P(B)[0] + 10} y={P(B)[1] - 12} farbe={F.gold3}>B</Txt></>}
      </svg>
      {modus === "kollinear" && <Regler label="r" wert={r} setze={setR} min={-1.5} max={2} schritt={0.1} anzeige={z(r)} />}
      <Messzeile>
        {modus === "verbindung" && <M t={`\\vec{AB} = \\binom{${z(B[0])}}{${z(B[1])}} - \\binom{${z(A[0])}}{${z(A[1])}} = \\binom{${z(AB[0])}}{${z(AB[1])}}`} />}
        {modus === "addition" && <M t={`\\binom{${z(A[0])}}{${z(A[1])}} + \\binom{${z(B[0])}}{${z(B[1])}} = \\binom{${z(A[0] + B[0])}}{${z(A[1] + B[1])}}`} />}
        {modus === "mittelpunkt" && <M t={`M = \\frac{1}{2}\\left(\\binom{${z(A[0])}}{${z(A[1])}} + \\binom{${z(B[0])}}{${z(B[1])}}\\right) = \\binom{${z(Mm[0])}}{${z(Mm[1])}}`} />}
        {modus === "einheit" && la > 0 && <M t={`|\\vec{a}| = ${z(la)}, \\quad \\vec{a}_0 = \\binom{${z(A[0] / la)}}{${z(A[1] / la)}}`} />}
        {modus === "kollinear" && <M t={`${z(r)} \\cdot \\binom{${z(A[0])}}{${z(A[1])}} = \\binom{${z(r * A[0])}}{${z(r * A[1])}}`} />}
      </Messzeile>
    </div>
  );
}

/* ======================= Skalarprodukt: Schatten ======================= */
function Skalar({ start = 50 }) {
  const [phi, setPhi] = useState(start);
  const [lb, setLb] = useState(2.4);
  const la = 3.2;
  const w = (phi * Math.PI) / 180;
  const k = koord({ x0: -3.2, x1: 4, y0: -0.8, y1: 3.2, w: 340, h: 189 });
  const A = [la, 0], B = [lb * Math.cos(w), lb * Math.sin(w)];
  const pr = lb * Math.cos(w);
  const sp = la * pr;
  const P = (v) => [k.px(v[0]), k.py(v[1])];
  const zieh = useZiehen(([sx, sy]) => {
    const x = k.ix(sx), y = Math.max(0.0, k.iy(sy));
    setPhi(klemm(Math.round((Math.atan2(y, x) * 180) / Math.PI), 0, 180));
    setLb(klemm(Math.hypot(x, y), 0.8, 3));
    return true;
  });
  const farbe = Math.abs(sp) < 0.05 ? F.gruenKraeftig : sp > 0 ? F.see : F.rosaKraeftig;
  return (
    <div>
      <Hinweis>Ziehe die Spitze von b. Das Skalarprodukt ist |a| mal die Länge des Schattens von b auf a – negativ, wenn der Schatten nach hinten fällt.</Hinweis>
      <svg viewBox="0 0 340 189" style={svgStil} {...zieh} role="img" aria-label="Zwei Vektoren mit dem Schatten von b auf a">
        <line x1={k.px(-3.2)} x2={k.px(4)} y1={k.py(0)} y2={k.py(0)} stroke={F.achse} strokeDasharray="4 4" />
        <line x1={P(B)[0]} y1={P(B)[1]} x2={k.px(pr)} y2={k.py(0)} stroke={F.achse} strokeWidth="1.3" strokeDasharray="3 3" />
        <line x1={k.px(0)} x2={k.px(pr)} y1={k.py(0) + 6} y2={k.py(0) + 6} stroke={farbe} strokeWidth="5" strokeLinecap="round" opacity="0.8" />
        <Bogen x={k.px(0)} y={k.py(0)} r={24} w1={0} w2={-w} farbe={F.gold3} />
        <Pfeil x1={k.px(0)} y1={k.py(0)} x2={P(A)[0]} y2={P(A)[1]} farbe={F.see} breite={2.8} />
        <Pfeil x1={k.px(0)} y1={k.py(0)} x2={P(B)[0]} y2={P(B)[1]} farbe={F.gold3} breite={2.8} />
        {phi === 90 && <RechterWinkel x={k.px(0)} y={k.py(0)} u={[1, 0]} v={[0, -1]} g={12} />}
        <Griff x={P(B)[0]} y={P(B)[1]} farbe={F.gold3} />
        <Txt x={P(A)[0] - 4} y={P(A)[1] + 16} farbe={F.see}>a</Txt>
        <Txt x={P(B)[0] + 10} y={P(B)[1] - 8} farbe={F.gold3}>b</Txt>
        <Txt x={k.px(0) + 30 * Math.cos(w / 2) + 6} y={k.py(0) - 30 * Math.sin(w / 2)} gr={11} anker="start" farbe={F.gold3}>φ</Txt>
      </svg>
      <Regler label="φ" wert={phi} setze={setPhi} min={0} max={180} schritt={1} anzeige={`${phi}°`} />
      <Messzeile>
        <div><M t={"\\vec{a} \\cdot \\vec{b} = |\\vec{a}| \\cdot |\\vec{b}| \\cdot \\cos φ"} /></div>
        <div><M t={`= ${z(la)} \\cdot ${z(lb)} \\cdot ${z(Math.cos(w))} = ${z(sp)}`} /></div>
        <div style={{ color: farbe, fontWeight: 700, fontSize: 13 }}>{Math.abs(sp) < 0.05 ? "senkrecht: Skalarprodukt 0" : sp > 0 ? "spitzer Winkel: positiv" : "stumpfer Winkel: negativ"}</div>
      </Messzeile>
    </div>
  );
}

/* ======================= 3D-Schrägbild ======================= */
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (s, a) => [s * a[0], s * a[1], s * a[2]];
const kreuz = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a) => Math.hypot(a[0], a[1], a[2]);
const norm = (a) => mul(1 / (len(a) || 1), a);

function useKamera(start = [0.62, 0.38]) {
  const [w, setW] = useState(start);
  const proj = useMemo(() => {
    const [phi, th] = w;
    const r = [-Math.sin(phi), Math.cos(phi), 0];
    const u = [-Math.cos(phi) * Math.sin(th), -Math.sin(phi) * Math.sin(th), Math.cos(th)];
    const v = [Math.cos(phi) * Math.cos(th), Math.sin(phi) * Math.cos(th), Math.sin(th)];
    return { r, u, v };
  }, [w]);
  return [proj, w, setW];
}

function Raum3D({ objekte, skala = 30, mitte = [170, 150], hoehe = 280, kamera, setKamera, achsenLaenge = 4.5, label }) {
  const [proj, w] = kamera;
  const S = (p) => [mitte[0] + dot(p, proj.r) * skala, mitte[1] - dot(p, proj.u) * skala];
  const tiefe = (p) => dot(p, proj.v);
  const startW = React.useRef(null);
  const zieh = useZiehen(([sx, sy], neu) => {
    if (neu) startW.current = { sx, sy, w };
    const s = startW.current;
    setKamera([s.w[0] - (sx - s.sx) * 0.012, klemm(s.w[1] + (sy - s.sy) * 0.01, -0.2, 1.35)]);
    return true;
  });
  const achsen = [[1, 0, 0], [0, 1, 0], [0, 0, 1]].map((e, i) => {
    const a = S(mul(-achsenLaenge * 0.35, e)), b = S(mul(achsenLaenge, e));
    return (
      <g key={i} aria-hidden="true">
        <Pfeil x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} farbe={F.achse} breite={1.2} spitze={7} />
        <text x={b[0] + 4} y={b[1] - 4} fontSize="11" fontStyle="italic" fill={F.grau}>{["x₁", "x₂", "x₃"][i]}</text>
      </g>
    );
  });
  const sortiert = objekte.map((o, i) => {
    let t = 0;
    if (o.typ === "flaeche") t = o.ecken.reduce((s, p) => s + tiefe(p), 0) / o.ecken.length;
    else if (o.typ === "punkt") t = tiefe(o.p) + 0.5;
    else if (o.typ === "pfeil" || o.typ === "linie") t = (tiefe(o.von) + tiefe(o.nach)) / 2 + 0.3;
    return { o, i, t: o.vorne ? 99 : o.hinten ? -99 : t };
  }).sort((a, b) => a.t - b.t);
  return (
    <svg viewBox={`0 0 340 ${hoehe}`} style={svgStil} {...zieh} role="img" aria-label={label || "Räumliches Schrägbild, mit dem Finger drehbar"}>
      {achsen}
      {sortiert.map(({ o, i }) => {
        if (o.typ === "flaeche") {
          const pts = o.ecken.map(S).map((p) => p.join(",")).join(" ");
          return <polygon key={i} points={pts} fill={o.farbe || F.blau} fillOpacity={o.deckung ?? 0.55} stroke={o.rand || F.see} strokeWidth={o.randBreite ?? 1} strokeLinejoin="round" />;
        }
        if (o.typ === "linie") {
          const a = S(o.von), b = S(o.nach);
          return <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={o.farbe || F.see} strokeWidth={o.breite || 2} strokeDasharray={o.gestrichelt ? "5 4" : undefined} strokeLinecap="round" />;
        }
        if (o.typ === "pfeil") {
          const a = S(o.von), b = S(o.nach);
          return <Pfeil key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} farbe={o.farbe || F.see} breite={o.breite || 2.6} gestrichelt={o.gestrichelt} />;
        }
        if (o.typ === "punkt") {
          const a = S(o.p);
          return <g key={i}><Punkt x={a[0]} y={a[1]} farbe={o.farbe || F.tinte} r={o.r || 4.5} />{o.name && <Txt x={a[0] + (o.dx ?? 9)} y={a[1] + (o.dy ?? -8)} anker="start" gr={12} farbe={o.farbe || F.tinte}>{o.name}</Txt>}</g>;
        }
        if (o.typ === "text") { const a = S(o.p); return <Txt key={i} x={a[0]} y={a[1]} gr={o.gr || 12} farbe={o.farbe || F.tinte}>{o.text}</Txt>; }
        return null;
      })}
    </svg>
  );
}

/* Ebenenstück um einen Punkt q mit Normale n */
function ebenenStueck(n, q, g = 2.6, farbe = F.blau, rand = F.see, deckung = 0.5) {
  const a = norm(Math.abs(n[2]) < 0.9 ? kreuz(n, [0, 0, 1]) : kreuz(n, [1, 0, 0]));
  const b = norm(kreuz(n, a));
  const e = [add(add(q, mul(g, a)), mul(g, b)), add(add(q, mul(-g, a)), mul(g, b)), add(add(q, mul(-g, a)), mul(-g, b)), add(add(q, mul(g, a)), mul(-g, b))];
  return { typ: "flaeche", ecken: e, farbe, rand, deckung };
}

function Raum({ modus = "gerade" }) {
  const kamera = useKamera();
  const [, , setKamera] = kamera;
  const [t, setT] = useState(modus === "abstand" || modus === "spiegel" ? 1.6 : 0.8);
  const [s2, setS2] = useState(0.5);
  const [fall, setFall] = useState("schneidend");
  const [an, setAn] = useState(true);
  let obj = [], messe = null, hinweis = "Drehe das Bild mit dem Finger.", regler = null;
  const p = [2, -1, 1], u = [-1, 2, 1];
  if (modus === "gerade" || modus === "punktprobe") {
    const X = add(p, mul(t, u));
    obj = [
      { typ: "linie", von: add(p, mul(-2.2, u)), nach: add(p, mul(2.2, u)), farbe: F.see, breite: 2.4 },
      { typ: "pfeil", von: [0, 0, 0], nach: p, farbe: F.gold3 },
      { typ: "pfeil", von: p, nach: add(p, u), farbe: F.rosaKraeftig },
      { typ: "punkt", p, name: "P", farbe: F.gold3 },
    ];
    if (modus === "gerade") { obj.push({ typ: "punkt", p: X, name: `t = ${z(t)}`, farbe: F.see }); regler = <Regler label="t" wert={t} setze={setT} min={-2} max={2} anzeige={z(t)} />; messe = <M t={`\\vec{x} = \\spalte{2}{-1}{1} + ${z(t)} \\cdot \\spalte{-1}{2}{1} = \\spalte{${z(X[0])}}{${z(X[1])}}{${z(X[2])}}`} />; hinweis = "Verändere t: Jeder Wert liefert einen Punkt der Geraden."; }
    else {
      const Q = an ? add(p, mul(1.5, u)) : [1, 3, 0];
      obj.push({ typ: "punkt", p: Q, name: "Q", farbe: an ? F.gruenKraeftig : F.rosaKraeftig, r: 5.5 });
      hinweis = "Liegt Q auf der Geraden? Dann passt ein einziges t in allen drei Zeilen.";
      regler = <Umschalter label="Punkt" wert={an} setze={setAn} optionen={[[true, "Q = (0,5 | 2 | 2,5)"], [false, "Q = (1 | 3 | 0)"]]} />;
      messe = an ? <span><M t={"0{,}5 = 2 - t, \\; 2 = -1 + 2t, \\; 2{,}5 = 1 + t"} /> → überall <M t="t = 1{,}5" /> ✓</span>
        : <span><M t={"1 = 2 - t \\Rightarrow t = 1"} />, aber <M t={"3 = -1 + 2t \\Rightarrow t = 2"} /> – Widerspruch</span>;
    }
  } else if (modus === "lage") {
    const g1 = { p: [0, -2, 1], u: [1, 1, 0.5] };
    const g2 = fall === "identisch" ? { p: add(g1.p, mul(1.5, g1.u)), u: mul(-1, g1.u) } : fall === "parallel" ? { p: [0, 0, 2.6], u: g1.u } : fall === "schneidend" ? { p: [3, -1, 3], u: [-1, 1, -1] } : { p: [0, 2, 3], u: [1, -1, 0] };
    obj = [
      { typ: "linie", von: add(g1.p, mul(-2, g1.u)), nach: add(g1.p, mul(4, g1.u)), farbe: F.see, breite: 2.6 },
      { typ: "linie", von: add(g2.p, mul(-2.5, g2.u)), nach: add(g2.p, mul(2.5, g2.u)), farbe: fall === "identisch" ? F.gold3 : F.rosaKraeftig, breite: fall === "identisch" ? 1.8 : 2.6, gestrichelt: fall === "identisch" },
    ];
    if (fall === "schneidend") obj.push({ typ: "punkt", p: add(g1.p, mul(2, g1.u)), name: "S", farbe: F.gold3 });
    if (fall === "windschief") {
      /* kürzeste Verbindung */
      const n = kreuz(g1.u, g2.u), w0 = sub(g1.p, g2.p);
      const A11 = dot(g1.u, g1.u), A12 = -dot(g1.u, g2.u), A22 = dot(g2.u, g2.u), b1 = -dot(w0, g1.u), b2 = dot(w0, g2.u);
      const det = A11 * A22 - A12 * A12, s = (b1 * A22 - A12 * b2) / det, r = (A11 * b2 - A12 * b1) / det;
      const P1 = add(g1.p, mul(s, g1.u)), P2 = add(g2.p, mul(r, g2.u));
      obj.push({ typ: "linie", von: P1, nach: P2, farbe: F.gold3, gestrichelt: true, breite: 1.8 });
      void n;
    }
    hinweis = "Drehe das Bild: Windschiefe Geraden sehen von vorn oft so aus, als würden sie sich schneiden.";
    regler = <Umschalter label="Lage" wert={fall} setze={setFall} optionen={[["identisch", "identisch"], ["parallel", "parallel"], ["schneidend", "schneidend"], ["windschief", "windschief"]]} />;
  } else if (modus === "ebeneParam") {
    const P0 = [2, 0, 0], U = [-1.2, 1.4, 0.2], V = [-0.8, -0.2, 1.6];
    const X = add(add(P0, mul(t, U)), mul(s2, V));
    obj = [];
    for (let i = -1; i <= 2; i++) obj.push({ typ: "linie", von: add(add(P0, mul(i, U)), mul(-1, V)), nach: add(add(P0, mul(i, U)), mul(2, V)), farbe: F.blauMittel, breite: 1 });
    for (let j = -1; j <= 2; j++) obj.push({ typ: "linie", von: add(add(P0, mul(-1, U)), mul(j, V)), nach: add(add(P0, mul(2, U)), mul(j, V)), farbe: F.blauMittel, breite: 1 });
    obj.push({ typ: "flaeche", ecken: [add(add(P0, mul(-1, U)), mul(-1, V)), add(add(P0, mul(2, U)), mul(-1, V)), add(add(P0, mul(2, U)), mul(2, V)), add(add(P0, mul(-1, U)), mul(2, V))], farbe: F.blau, rand: F.see, deckung: 0.35, hinten: true });
    obj.push({ typ: "pfeil", von: P0, nach: add(P0, U), farbe: F.gold3 }, { typ: "pfeil", von: P0, nach: add(P0, V), farbe: F.rosaKraeftig }, { typ: "punkt", p: P0, name: "P", farbe: F.tinte },
      { typ: "linie", von: P0, nach: add(P0, mul(t, U)), farbe: F.gold3, gestrichelt: true }, { typ: "linie", von: add(P0, mul(t, U)), nach: X, farbe: F.rosaKraeftig, gestrichelt: true },
      { typ: "punkt", p: X, name: "X", farbe: F.see, vorne: true });
    hinweis = "r Schritte in Richtung u, s Schritte in Richtung v – so erreichst du jeden Punkt der Ebene.";
    regler = <><Regler label="r" wert={t} setze={setT} min={-1} max={2} anzeige={z(t)} /><Regler label="s" wert={s2} setze={setS2} min={-1} max={2} anzeige={z(s2)} /></>;
  } else if (modus === "ebeneNormal") {
    const n = [1, 1, 2], P0 = [1, 1, 1];
    const a = norm(kreuz(n, [0, 0, 1])), b = norm(kreuz(n, a));
    const X = add(add(P0, mul(1.8 * Math.cos(t * 3), a)), mul(1.8 * Math.sin(t * 3), b));
    obj = [ebenenStueck(n, P0, 2.6), { typ: "pfeil", von: P0, nach: add(P0, mul(0.9, n)), farbe: F.rosaKraeftig, vorne: true },
      { typ: "pfeil", von: P0, nach: X, farbe: F.gold3, vorne: true }, { typ: "punkt", p: P0, name: "P", farbe: F.tinte, vorne: true }, { typ: "punkt", p: X, name: "X", farbe: F.gold3, vorne: true },
      { typ: "text", p: add(P0, mul(1.05, n)), text: "n", farbe: F.rosaKraeftig }];
    hinweis = "Wo X auch liegt: Der Vektor PX steht immer senkrecht auf n. Drehe das Bild zur Kontrolle.";
    regler = <Regler label="X bewegen" wert={t} setze={setT} min={0} max={2.1} anzeige={null} />;
    messe = <M t={`(\\vec{x} - \\vec{p}) \\cdot \\vec{n} = ${z(dot(sub(X, P0), n))}, \\quad E: x_1 + x_2 + 2x_3 = 4`} />;
  } else if (modus === "spur") {
    const S1 = [3, 0, 0], S2 = [0, 2, 0], S3 = [0, 0, 1];
    obj = [{ typ: "flaeche", ecken: [S1, S2, S3], farbe: F.gold, rand: F.gold3, deckung: 0.75, randBreite: 2 },
      { typ: "punkt", p: S1, name: "S₁", farbe: F.rosaKraeftig }, { typ: "punkt", p: S2, name: "S₂", farbe: F.rosaKraeftig }, { typ: "punkt", p: S3, name: "S₃", farbe: F.rosaKraeftig }];
    hinweis = "Die drei Spurpunkte verbunden ergeben das Spurdreieck – das sichtbare Stück der Ebene.";
    messe = <M t={"2x_1 + 3x_2 + 6x_3 = 6: \\; S_1(3|0|0), \\; S_2(0|2|0), \\; S_3(0|0|1)"} />;
  } else if (modus === "durchstoss") {
    const n = [0, 0, 1], P0 = [0, 0, 1];
    const g0 = [3, -1, 3.5], gu = [-1, 1, -1.5];
    const ts = (1 - g0[2]) / gu[2], S = add(g0, mul(ts, gu));
    obj = [ebenenStueck(n, [1, 1, 1], 2.6), { typ: "linie", von: g0, nach: S, farbe: F.rosaKraeftig, breite: 2.6, vorne: true }, { typ: "linie", von: S, nach: add(g0, mul(ts + 1.2, gu)), farbe: F.rosaKraeftig, breite: 2, gestrichelt: true, hinten: true },
      { typ: "punkt", p: S, name: "S", farbe: F.gold3, vorne: true }];
    void P0;
    hinweis = "Die Gerade stößt durch die Ebene. Eingesetzt in die Ebenengleichung bleibt eine Gleichung für t.";
    messe = <M t={"x_3 = 3{,}5 - 1{,}5t = 1 \\Rightarrow t = \\frac{5}{3}, \\quad S\\left(\\frac{4}{3} | \\frac{2}{3} | 1\\right)"} />;
  } else if (modus === "zweiEbenen") {
    const n1 = [0, 0, 1], n2 = [1, 0, 1.2];
    const d = norm(kreuz(n1, n2));
    obj = [ebenenStueck(n1, [0, 0, 1], 2.6, F.blau, F.see, 0.45), ebenenStueck(n2, [0, 0, 1], 2.6, F.rosa, F.rosaKraeftig, 0.45),
      { typ: "linie", von: add([0, 0, 1], mul(-3, d)), nach: add([0, 0, 1], mul(3, d)), farbe: F.gold3, breite: 3, vorne: true },
      { typ: "pfeil", von: [0, 0, 1], nach: add([0, 0, 1], n1), farbe: F.see, vorne: true }, { typ: "pfeil", von: [0, 0, 1], nach: add([0, 0, 1], norm(n2)), farbe: F.rosaKraeftig, vorne: true }];
    const wink = (Math.acos(Math.abs(dot(n1, n2)) / (len(n1) * len(n2))) * 180) / Math.PI;
    hinweis = "Die Schnittgerade (gold) steht senkrecht auf beiden Normalenvektoren. Der Winkel der Normalen ist der Winkel der Ebenen.";
    messe = <M t={`\\cos α = \\frac{|\\vec{n}_1 \\cdot \\vec{n}_2|}{|\\vec{n}_1| |\\vec{n}_2|} \\Rightarrow α = ${z(wink)}°`} />;
  } else if (modus === "abstand" || modus === "spiegel") {
    const n = [2, 1, 2], d = 2, nl = len(n);
    const base = [0.2, 0.6, (d - 0.4 - 0.6) / 2];
    const Q = add(base, mul(0.4 + t, norm(n)));
    const abst = (dot(n, Q) - d) / nl;
    const Fp = sub(Q, mul(abst, norm(n)));
    obj = [ebenenStueck(n, base, 2.4), { typ: "linie", von: Q, nach: Fp, farbe: F.rosaKraeftig, breite: 2.6, vorne: true }, { typ: "punkt", p: Q, name: "Q", farbe: F.rosaKraeftig, vorne: true }, { typ: "punkt", p: Fp, name: "F", farbe: F.gold3, vorne: true }];
    if (modus === "spiegel") { const Q2 = sub(Q, mul(2 * abst, norm(n))); obj.push({ typ: "linie", von: Fp, nach: Q2, farbe: F.rosaKraeftig, breite: 2, gestrichelt: true, hinten: true }, { typ: "punkt", p: Q2, name: "Q′", farbe: F.lila }); }
    hinweis = modus === "spiegel" ? "Von Q zum Lotfußpunkt F – und noch einmal genauso weit: Q′." : "Der kürzeste Weg von Q zur Ebene steht senkrecht auf ihr – entlang des Normalenvektors.";
    regler = <Regler label="Q verschieben" wert={t} setze={setT} min={0} max={2.5} anzeige={null} />;
    messe = <M t={`d = \\frac{|2q_1 + q_2 + 2q_3 - 2|}{3} = ${z(Math.abs(abst))}`} />;
  } else if (modus === "lotGerade") {
    const Q = [3, 2.5, 0.2];
    const lf = dot(sub(Q, p), u) / dot(u, u), Fp = add(p, mul(lf, u));
    obj = [{ typ: "linie", von: add(p, mul(-1.5, u)), nach: add(p, mul(2.2, u)), farbe: F.see, breite: 2.6 }, { typ: "linie", von: Q, nach: Fp, farbe: F.rosaKraeftig, breite: 2.4 },
      { typ: "punkt", p: Q, name: "Q", farbe: F.rosaKraeftig }, { typ: "punkt", p: Fp, name: "F", farbe: F.gold3 }];
    hinweis = "Der Lotfußpunkt F ist der Punkt der Geraden, an dem QF senkrecht auf dem Richtungsvektor steht.";
    messe = <M t={`d = |\\vec{QF}| = ${z(len(sub(Q, Fp)))}`} />;
  } else if (modus === "windschief") {
    const g1 = { p: [0, -2, 0.5], u: [1, 1, 0.3] }, g2 = { p: [0, 2, 2.5], u: [1, -1, 0] };
    const w0 = sub(g1.p, g2.p);
    const A11 = dot(g1.u, g1.u), A12 = -dot(g1.u, g2.u), A22 = dot(g2.u, g2.u), b1 = -dot(w0, g1.u), b2 = dot(w0, g2.u);
    const det = A11 * A22 - A12 * A12, s = (b1 * A22 - A12 * b2) / det, r = (A11 * b2 - A12 * b1) / det;
    const P1 = add(g1.p, mul(s, g1.u)), P2 = add(g2.p, mul(r, g2.u));
    obj = [{ typ: "linie", von: add(g1.p, mul(-1, g1.u)), nach: add(g1.p, mul(4, g1.u)), farbe: F.see, breite: 2.6 }, { typ: "linie", von: add(g2.p, mul(-1, g2.u)), nach: add(g2.p, mul(4, g2.u)), farbe: F.rosaKraeftig, breite: 2.6 },
      { typ: "linie", von: P1, nach: P2, farbe: F.gold3, breite: 2.4 }, { typ: "punkt", p: P1, farbe: F.gold3 }, { typ: "punkt", p: P2, farbe: F.gold3 }];
    hinweis = "Die kürzeste Verbindung (gold) steht auf beiden Geraden senkrecht – ihre Richtung ist u × v.";
    messe = <M t={`d = ${z(len(sub(P1, P2)))}`} />;
  } else if (modus === "winkelGE") {
    const n = [0, 0, 1], S = [1, 1, 0.5];
    const ug = norm([1, 0.4, 1.1]);
    const alpha = (Math.asin(Math.abs(dot(ug, n))) * 180) / Math.PI;
    obj = [ebenenStueck(n, [1, 1, 0.5], 2.5), { typ: "linie", von: sub(S, mul(2, ug)), nach: add(S, mul(2.6, ug)), farbe: F.rosaKraeftig, breite: 2.6, vorne: true },
      { typ: "pfeil", von: S, nach: add(S, mul(1.6, n)), farbe: F.see, vorne: true }, { typ: "linie", von: S, nach: add(S, mul(2.4, norm([ug[0], ug[1], 0]))), farbe: F.gold3, gestrichelt: true, vorne: true },
      { typ: "punkt", p: S, farbe: F.tinte, vorne: true }, { typ: "text", p: add(S, mul(1.85, n)), text: "n", farbe: F.see }];
    hinweis = "Gold ist der Schatten der Geraden in der Ebene. Der Winkel zur Ebene α und der Winkel zur Normalen β ergänzen sich zu 90°.";
    messe = <M t={`α = ${z(alpha)}°, \\quad β = 90° - α = ${z(90 - alpha)}°`} />;
  }
  return (
    <div>
      <Hinweis>{hinweis}</Hinweis>
      <Raum3D objekte={obj} kamera={kamera} setKamera={setKamera} />
      {regler}
      {messe && <Messzeile>{messe}</Messzeile>}
    </div>
  );
}

/* ======================= Kreuzprodukt ======================= */
function Kreuz3d({ ebene = false, flaeche = false, dreieck = false, spat = false }) {
  const kamera = useKamera([0.75, 0.42]);
  const [, , setKamera] = kamera;
  const [w, setW] = useState(70);
  const [h, setH] = useState(1.6);
  const wr = (w * Math.PI) / 180;
  const a = [2.4, 0, 0], b = [2.2 * Math.cos(wr), 2.2 * Math.sin(wr), 0];
  const n = kreuz(a, b);
  const c = [0.4, 0.5, h];
  const nAnz = mul(0.42, n);
  const obj = [];
  if (spat) {
    const o = [0, 0, 0];
    const ecken = [o, a, add(a, b), b];
    obj.push({ typ: "flaeche", ecken, farbe: F.blau, deckung: 0.5 });
    obj.push({ typ: "flaeche", ecken: ecken.map((p) => add(p, c)), farbe: F.blau, deckung: 0.35 });
    [[o, a], [a, add(a, b)], [add(a, b), b], [b, o]].forEach(([p, q]) => obj.push({ typ: "flaeche", ecken: [p, q, add(q, c), add(p, c)], farbe: F.gold, deckung: 0.22, rand: F.gold3 }));
    obj.push({ typ: "pfeil", von: o, nach: c, farbe: F.gruenKraeftig });
  } else {
    obj.push({ typ: "flaeche", ecken: dreieck ? [[0, 0, 0], a, b] : [[0, 0, 0], a, add(a, b), b], farbe: flaeche ? F.gold : F.blau, rand: flaeche ? F.gold3 : F.see, deckung: 0.6 });
    if (dreieck) obj.push({ typ: "flaeche", ecken: [a, add(a, b), b], farbe: "#FFFFFF", rand: F.gold3, deckung: 0.1 });
  }
  if (ebene) obj.push(ebenenStueck(n, [0.8, 0.8, 0.1], 2.8, F.blau, F.blauMittel, 0.2));
  obj.push({ typ: "pfeil", von: [0, 0, 0], nach: a, farbe: F.see }, { typ: "pfeil", von: [0, 0, 0], nach: b, farbe: F.gold3 });
  if (!spat) obj.push({ typ: "pfeil", von: [0, 0, 0], nach: nAnz, farbe: F.rosaKraeftig, vorne: true }, { typ: "text", p: add(nAnz, [0, 0, 0.35]), text: "a × b", farbe: F.rosaKraeftig });
  obj.push({ typ: "text", p: add(a, [0.2, 0, -0.3]), text: "a", farbe: F.see }, { typ: "text", p: add(b, [0, 0.2, -0.3]), text: "b", farbe: F.gold3 });
  if (spat) obj.push({ typ: "text", p: add(c, [0, 0.25, 0.2]), text: "c", farbe: F.gruenKraeftig });
  const A = len(n);
  return (
    <div>
      <Hinweis>{spat ? "Grundfläche |a × b| mal Höhe – das Volumen des Spats." : "Das Kreuzprodukt steht senkrecht auf a und b. Seine Länge ist die Fläche des Parallelogramms. Drehe das Bild."}</Hinweis>
      <Raum3D objekte={obj} kamera={kamera} setKamera={setKamera} skala={34} mitte={[160, 175]} />
      <Regler label="Winkel zwischen a und b" wert={w} setze={setW} min={10} max={170} schritt={1} anzeige={`${w}°`} />
      {spat && <Regler label="Höhe von c" wert={h} setze={setH} min={0.4} max={2.6} anzeige={z(h)} />}
      <Messzeile>
        {spat ? <M t={`V = |(\\vec{a} \\times \\vec{b}) \\cdot \\vec{c}| = ${z(Math.abs(dot(n, c)))}`} />
          : <M t={`|\\vec{a} \\times \\vec{b}| = ${z(A)} = |\\vec{a}||\\vec{b}| \\sin ${w}°${dreieck ? `, \\quad A_△ = ${z(A / 2)}` : ""}`} />}
      </Messzeile>
    </div>
  );
}

/* ======================= Quader: Raumdiagonale ======================= */
function Quader() {
  const kamera = useKamera([0.55, 0.36]);
  const [, , setKamera] = kamera;
  const [a1, setA1] = useState(2);
  const [a2, setA2] = useState(3);
  const [a3, setA3] = useState(2);
  const E = (x, y, zz) => [x, y, zz];
  const ecken = [E(0, 0, 0), E(a1, 0, 0), E(a1, a2, 0), E(0, a2, 0)];
  const obj = [
    { typ: "flaeche", ecken, farbe: F.blau, deckung: 0.5, hinten: true },
    ...[[0, 1], [1, 2], [2, 3], [3, 0]].map(([i, j]) => ({ typ: "flaeche", ecken: [ecken[i], ecken[j], add(ecken[j], [0, 0, a3]), add(ecken[i], [0, 0, a3])], farbe: "#F4F7FB", deckung: 0.25, rand: F.blauMittel })),
    { typ: "linie", von: E(0, 0, 0), nach: E(a1, a2, 0), farbe: F.gold3, breite: 2.4 },
    { typ: "linie", von: E(a1, a2, 0), nach: E(a1, a2, a3), farbe: F.gruenKraeftig, breite: 2.4 },
    { typ: "pfeil", von: E(0, 0, 0), nach: E(a1, a2, a3), farbe: F.rosaKraeftig, vorne: true },
    { typ: "text", p: E(a1 / 2 + 0.4, a2 / 2, -0.15), text: "d", farbe: F.gold3 },
  ];
  const d = Math.hypot(a1, a2), D = Math.hypot(a1, a2, a3);
  return (
    <div>
      <Hinweis>Erst die Diagonale d der Grundfläche (gold), dann mit der Höhe zur Raumdiagonale (rosa) – zweimal Pythagoras.</Hinweis>
      <Raum3D objekte={obj} kamera={kamera} setKamera={setKamera} skala={30} mitte={[150, 190]} />
      <Regler label="a₁" wert={a1} setze={setA1} min={1} max={3.5} schritt={0.5} anzeige={z(a1)} />
      <Regler label="a₂" wert={a2} setze={setA2} min={1} max={3.5} schritt={0.5} anzeige={z(a2)} />
      <Regler label="a₃" wert={a3} setze={setA3} min={1} max={3.5} schritt={0.5} anzeige={z(a3)} />
      <Messzeile>
        <div><M t={`d = \\sqrt{${z(a1)}^2 + ${z(a2)}^2} = ${z(d)}`} /></div>
        <div><M t={`|\\vec{a}| = \\sqrt{d^2 + ${z(a3)}^2} = \\sqrt{${z(a1 * a1 + a2 * a2 + a3 * a3)}} = ${z(D)}`} /></div>
      </Messzeile>
    </div>
  );
}

export const BILDER_2 = {
  gerade: (p) => <Gerade {...p} />,
  parabel: (p) => <Parabel {...p} />,
  symmetrie: (p) => <Symmetrie {...p} />,
  transform: (p) => <Transform {...p} />,
  wachstum: (p) => <Wachstum {...p} />,
  vek2d: (p) => <Vek2d {...p} />,
  skalar: (p) => <Skalar {...p} />,
  raum: (p) => <Raum {...p} />,
  kreuz3d: (p) => <Kreuz3d {...p} />,
  quader: (p) => <Quader {...p} />,
};
