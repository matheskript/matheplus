/* ======================================================================
   FORMELSAMMLUNG · Illustrationen Teil 4: Geometrie, Trigonometrie, Terme
   ====================================================================== */
import React, { useMemo, useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { beweisZwei, dreieckBeiT, quadrateUeber, schraegesQuadrat, umlegePlan } from "./pythagoras.js";
import { Bogen, F, Griff, Hinweis, Messzeile, Pfeil, Punkt, RechterWinkel, Regler, Txt, Umschalter, klemm, svgStil, useZiehen, z } from "./funcFsBasis.jsx";

const pts = (arr) => arr.map((p) => p.map((v) => v.toFixed(2)).join(",")).join(" ");
const grad = (w) => (w * 180) / Math.PI;
const rad = (g) => (g * Math.PI) / 180;

/* ======================= Flächen ======================= */
function Flaechen({ art = "rechteck" }) {
  const [a, setA] = useState(5);
  const [b, setB] = useState(3);
  const [t, setT] = useState(0);
  const [s, setS] = useState(0.35);
  const u = 34, X = 40, Y = 20;
  if (art === "rechteck" || art === "drehen") {
    const dreh = art === "drehen" && t > 0.5;
    const w = dreh ? b : a, h = dreh ? a : b, uu = Math.min(u, 250 / Math.max(w, 1), 160 / Math.max(h, 1));
    return (
      <div>
        <Hinweis>{art === "drehen" ? "Dasselbe Rechteck, um 90° gedreht: aus a Reihen zu b werden b Reihen zu a – es sind dieselben Kästchen." : "Ein Rechteck aus a mal b Einheitsquadraten."}</Hinweis>
        <svg viewBox="0 0 340 200" style={svgStil} role="img" aria-label="Rechteck aus Einheitsquadraten">
          {Array.from({ length: w * h }, (_, i) => <rect key={i} x={X + (i % w) * uu} y={Y + Math.floor(i / w) * uu} width={uu - 2} height={uu - 2} rx="3" fill={F.blau} stroke={F.see} strokeWidth="0.8" />)}
          <Txt x={X + (w * uu) / 2} y={Y + h * uu + 16} gr={12}>{dreh ? "b" : "a"}</Txt>
          <Txt x={X - 12} y={Y + (h * uu) / 2 + 4} gr={12}>{dreh ? "a" : "b"}</Txt>
        </svg>
        <Regler label="a" wert={a} setze={setA} min={1} max={7} schritt={1} anzeige={a} />
        <Regler label="b" wert={b} setze={setB} min={1} max={5} schritt={1} anzeige={b} />
        {art === "drehen" && <Umschalter label="Lage" wert={t > 0.5} setze={(v) => setT(v ? 1 : 0)} optionen={[[false, "a · b"], [true, "b · a"]]} />}
        <Messzeile><M t={`${a} \\cdot ${b} = ${b} \\cdot ${a} = ${a * b}`} /></Messzeile>
      </div>
    );
  }
  if (art === "distributiv") {
    const c = 4, uu = 22;
    return (
      <div>
        <Hinweis>Ein Rechteck der Breite b + c zerfällt in zwei Rechtecke – die Fläche ändert sich nicht.</Hinweis>
        <svg viewBox="0 0 340 170" style={svgStil} role="img" aria-label="Rechteck in zwei Teilrechtecke zerlegt">
          <rect x={30} y={30} width={a * uu} height={b * uu} fill={F.blau} stroke={F.see} strokeWidth="1.6" />
          <rect x={30 + a * uu} y={30} width={c * uu} height={b * uu} fill={F.gold} stroke={F.gold3} strokeWidth="1.6" />
          <Txt x={30 + (a * uu) / 2} y={30 + (b * uu) / 2 + 5} farbe={F.see}>{`${b} · ${a}`}</Txt>
          <Txt x={30 + a * uu + (c * uu) / 2} y={30 + (b * uu) / 2 + 5} farbe={F.gold3}>{`${b} · ${c}`}</Txt>
          <Txt x={30 + (a * uu) / 2} y={22} gr={11}>{a}</Txt><Txt x={30 + a * uu + (c * uu) / 2} y={22} gr={11}>{c}</Txt>
          <Txt x={18} y={30 + (b * uu) / 2 + 4} gr={11}>{b}</Txt>
        </svg>
        <Regler label="b" wert={a} setze={setA} min={1} max={8} schritt={1} anzeige={a} />
        <Regler label="a" wert={b} setze={setB} min={1} max={5} schritt={1} anzeige={b} />
        <Messzeile><M t={`${b} \\cdot (${a} + ${c}) = ${b} \\cdot ${a} + ${b} \\cdot ${c} = ${b * (a + c)}`} /></Messzeile>
      </div>
    );
  }
  if (art === "dreieck") {
    const G = 240, H = 140, sx = X + s * G;
    return (
      <div>
        <Hinweis>Verschiebe die Spitze: Die Höhe teilt das Dreieck in zwei Hälften zweier Rechtecke. Die Fläche bleibt g · h / 2.</Hinweis>
        <svg viewBox="0 0 340 190" style={svgStil} role="img" aria-label="Dreieck in einem Rechteck">
          <rect x={X} y={Y} width={G} height={H} fill="#F4F6FA" stroke={F.achse} strokeDasharray="4 3" />
          <polygon points={pts([[X, Y + H], [sx, Y + H], [sx, Y]])} fill={F.blau} stroke={F.see} strokeWidth="1.6" />
          <polygon points={pts([[sx, Y + H], [X + G, Y + H], [sx, Y]])} fill={F.gold} stroke={F.gold3} strokeWidth="1.6" />
          <line x1={sx} x2={sx} y1={Y} y2={Y + H} stroke={F.rosaKraeftig} strokeWidth="2" strokeDasharray="5 3" />
          <Txt x={X + G / 2} y={Y + H + 16} gr={12}>g</Txt>
          <Txt x={sx + 8} y={Y + H / 2} gr={12} anker="start" farbe={F.rosaKraeftig}>h</Txt>
        </svg>
        <Regler label="Spitze" wert={s} setze={setS} min={0} max={1} />
        <Messzeile><M t={"A = \\frac{1}{2} \\, g \\cdot h"} /> · <span style={{ color: C.grau, fontSize: 13 }}>blau und gold sind je die Hälfte ihres Rechtecks</span></Messzeile>
      </div>
    );
  }
  if (art === "parallelogramm") {
    const G = 200, H = 120, v = 70;
    const dx = t * G;
    return (
      <div>
        <Hinweis>Schiebe das abgeschnittene Dreieck auf die andere Seite: Aus dem Parallelogramm wird ein Rechteck mit derselben Fläche.</Hinweis>
        <svg viewBox="0 0 340 170" style={svgStil} role="img" aria-label="Parallelogramm wird zum Rechteck">
          <polygon points={pts([[X + v, Y], [X + v + G, Y], [X + G, Y + H], [X + v, Y + H]])} fill={F.blau} stroke={F.see} strokeWidth="1.6" />
          <polygon points={pts([[X + v + dx, Y], [X + v + dx, Y + H], [X + dx, Y + H]])} fill={F.gold} stroke={F.gold3} strokeWidth="1.6" />
          <line x1={X + v} x2={X + v} y1={Y} y2={Y + H} stroke={F.rosaKraeftig} strokeDasharray="5 3" strokeWidth="1.6" />
          <Txt x={X + v + G / 2} y={Y + H + 16} gr={12}>g</Txt>
          <Txt x={X + v - 8} y={Y + H / 2} anker="end" gr={12} farbe={F.rosaKraeftig}>h</Txt>
        </svg>
        <Regler label="Dreieck verschieben" wert={t} setze={setT} min={0} max={1} />
      </div>
    );
  }
  /* Trapez */
  const A0 = 150, C0 = 80, H = 90;
  const off = 30;
  const tr1 = [[X, Y + H], [X + A0, Y + H], [X + off + C0, Y], [X + off, Y]];
  const Mx = (X + A0 + X + off + C0) / 2, My = Y + H / 2;
  const tr2 = tr1.map(([x, y]) => [2 * Mx - x, 2 * My - y]);
  const shift = (1 - t) * 50;
  return (
    <div>
      <Hinweis>Ein zweites, um 180° gedrehtes Trapez passt genau an das erste. Zusammen ergeben sie ein Parallelogramm mit der Grundseite a + c.</Hinweis>
      <svg viewBox="0 0 360 150" style={svgStil} role="img" aria-label="Zwei Trapeze ergeben ein Parallelogramm">
        <polygon points={pts(tr1)} fill={F.blau} stroke={F.see} strokeWidth="1.6" />
        <polygon points={pts(tr2.map(([x, y]) => [x + shift, y - shift * 0.4]))} fill={F.gold} stroke={F.gold3} strokeWidth="1.6" opacity={0.4 + 0.6 * t} />
        <Txt x={X + A0 / 2} y={Y + H + 16} gr={12} farbe={F.see}>a</Txt>
        <Txt x={X + off + C0 / 2} y={Y - 5} gr={12} farbe={F.see}>c</Txt>
      </svg>
      <Regler label="zusammenschieben" wert={t} setze={setT} min={0} max={1} />
      <Messzeile><M t={"2A = (a + c) \\cdot h"} /></Messzeile>
    </div>
  );
}

/* ======================= Kreis ======================= */
function Kreis({ modus = "flaeche" }) {
  const [n, setN] = useState(12);
  const [t, setT] = useState(0);
  const [r, setR] = useState(1);
  const [alpha, setAlpha] = useState(120);
  if (modus === "umfang") {
    const R = 30 * r, cx = 60, cy = 80;
    const U = 2 * Math.PI * R;
    return (
      <div>
        <Hinweis>Rollt man den Kreis einmal ab, ist die Strecke gut dreimal so lang wie der Durchmesser – genau π-mal.</Hinweis>
        <svg viewBox="0 0 340 176" style={svgStil} role="img" aria-label="Abgerollter Kreisumfang im Vergleich zum Durchmesser">
          <circle cx={cx} cy={cy} r={R} fill={F.blau} stroke={F.see} strokeWidth="2" />
          <line x1={cx - R} x2={cx + R} y1={cy} y2={cy} stroke={F.rosaKraeftig} strokeWidth="2.4" />
          <Txt x={cx} y={cy - 6} gr={11} farbe={F.rosaKraeftig}>d</Txt>
          <line x1={20} x2={20 + Math.min(U, 310)} y1={140} y2={140} stroke={F.see} strokeWidth="4" />
          {[0, 1, 2, 3].map((i) => 20 + i * 2 * R < 330 && <line key={i} x1={20 + i * 2 * R + 1} x2={20 + (i + 1) * 2 * R - 1} y1={150} y2={150} stroke={F.rosaKraeftig} strokeWidth="2.4" opacity={i === 3 ? 0.35 : 1} />)}
          <Txt x={20 + Math.min(U, 310) + 4} y={144} anker="start" gr={11} farbe={F.see}>U</Txt>
          <Txt x={20 + R} y={164} gr={10} farbe={F.rosaKraeftig}>d</Txt>
        </svg>
        <Regler label="r" wert={r} setze={setR} min={0.5} max={1.6} anzeige={z(r)} />
        <Messzeile><M t={`\\frac{U}{d} = \\pi \\approx 3{,}14159`} /></Messzeile>
      </div>
    );
  }
  if (modus === "sektor") {
    const R = 80, cx = 120, cy = 100, w = rad(alpha);
    const b = [cx + R * Math.cos(-w), cy + R * Math.sin(-w)];
    return (
      <div>
        <Hinweis>Ein Sektor ist der Anteil α/360° des ganzen Kreises – beim Bogen wie bei der Fläche.</Hinweis>
        <svg viewBox="0 0 340 200" style={svgStil} role="img" aria-label="Kreissektor mit Bogen">
          <circle cx={cx} cy={cy} r={R} fill="#F4F6FA" stroke={F.achse} />
          <path d={`M${cx} ${cy} L${cx + R} ${cy} A${R} ${R} 0 ${alpha > 180 ? 1 : 0} 0 ${b[0]} ${b[1]} Z`} fill={F.gold} stroke={F.gold3} strokeWidth="1.6" />
          <path d={`M${cx + R} ${cy} A${R} ${R} 0 ${alpha > 180 ? 1 : 0} 0 ${b[0]} ${b[1]}`} fill="none" stroke={F.rosaKraeftig} strokeWidth="4" />
          <Bogen x={cx} y={cy} r={18} w1={0} w2={-w} farbe={F.see} />
          <Txt x={cx + 30} y={cy - 8} gr={11} anker="start" farbe={F.see}>α</Txt>
          <Txt x={cx + R / 2} y={cy + 14} gr={11}>r</Txt>
        </svg>
        <Regler label="α" wert={alpha} setze={setAlpha} min={5} max={355} schritt={1} anzeige={`${alpha}°`} />
        <Messzeile><div><M t={`\\frac{${alpha}°}{360°} = ${z(alpha / 360)}`} /></div><div><M t={`b = ${z(alpha / 360)} \\cdot 2\\pi r, \\quad A = ${z(alpha / 360)} \\cdot \\pi r^2`} /></div></Messzeile>
      </div>
    );
  }
  /* Fläche: Tortenstücke umlegen */
  const R = 62, d = (2 * Math.PI) / n;
  const cx = 170, cy = 92;
  const breite = Math.PI * R;
  const xs = (340 - breite) / 2;
  const rd = R * d;
  const stueck = (i) => {
    const th = i * d + d / 2;
    const j = Math.floor(i / 2);
    const ziel = i % 2 === 0 ? { x: xs + j * rd + rd / 2, y: 30, w: Math.PI / 2 } : { x: xs + j * rd + rd, y: 30 + R, w: -Math.PI / 2 };
    const start = { x: cx, y: cy, w: -th };
    let dw = ziel.w - start.w;
    while (dw > Math.PI) dw -= 2 * Math.PI;
    while (dw < -Math.PI) dw += 2 * Math.PI;
    const x = start.x + (ziel.x - start.x) * t, y = start.y + (ziel.y - start.y) * t, w = start.w + dw * t;
    const a1 = [Math.cos(-d / 2) * R, Math.sin(-d / 2) * R], a2 = [Math.cos(d / 2) * R, Math.sin(d / 2) * R];
    return (
      <path key={i} transform={`translate(${x} ${y}) rotate(${grad(w)})`} d={`M0 0 L${a1[0]} ${a1[1]} A${R} ${R} 0 0 1 ${a2[0]} ${a2[1]} Z`}
        fill={i % 2 ? F.gold : F.blau} stroke={i % 2 ? F.gold3 : F.see} strokeWidth="1" />
    );
  };
  return (
    <div>
      <Hinweis>Zerlege den Kreis in Tortenstücke und lege sie abwechselnd nebeneinander. Mit mehr Stücken wird daraus fast ein Rechteck: Höhe r, Breite πr.</Hinweis>
      <svg viewBox="0 0 340 170" style={svgStil} role="img" aria-label="Kreis in Sektoren zerlegt und zu einem fast-Rechteck umgelegt">
        {Array.from({ length: n }, (_, i) => stueck(i))}
        {t > 0.95 && <>
          <Txt x={170} y={30 + R + 18} gr={12} farbe={F.see}>π r</Txt>
          <Txt x={xs - 10} y={30 + R / 2 + 4} gr={12} anker="end" farbe={F.see}>r</Txt>
        </>}
      </svg>
      <Regler label="Stücke" wert={n} setze={(v) => setN(Math.round(v / 2) * 2)} min={4} max={48} schritt={2} anzeige={n} />
      <Regler label="umlegen" wert={t} setze={setT} min={0} max={1} />
      <Messzeile><M t={"A = \\pi r \\cdot r = \\pi r^2"} /></Messzeile>
    </div>
  );
}

/* ======================= Körper (Schrägbild) ======================= */
function Koerper({ art = "zylinder" }) {
  const [hz, setHz] = useState(0.5);
  const [teil, setTeil] = useState(0);
  const s = 46, X0 = 90, Y0 = 170, k = 0.5, wk = rad(35);
  const P = ([x, y, zz]) => [X0 + x * s + y * s * k * Math.cos(wk), Y0 - zz * s - y * s * k * Math.sin(wk)];
  const linie = (a, b, farbe = F.see, gestr = false, br = 1.6) => { const p = P(a), q = P(b); return <line x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke={farbe} strokeWidth={br} strokeDasharray={gestr ? "4 3" : undefined} />; };
  if (art === "quader" || art === "pyramide") {
    const a = 2.4, b = 2, c = art === "pyramide" ? 2.4 : 1.6;
    const E = [[0, 0, 0], [a, 0, 0], [a, b, 0], [0, b, 0], [0, 0, c], [a, 0, c], [a, b, c], [0, b, c]];
    const kanten = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
    const hinten = (i, j) => [i, j].includes(3);
    if (art === "quader") {
      return (
        <div>
          <Hinweis>Grundfläche a · b, darüber c gleiche Schichten.</Hinweis>
          <svg viewBox="0 0 340 220" style={svgStil} role="img" aria-label="Quader im Schrägbild">
            <polygon points={pts([E[0], E[1], E[5], E[4]].map(P))} fill={F.blau} opacity="0.6" />
            <polygon points={pts([E[1], E[2], E[6], E[5]].map(P))} fill={F.blauMittel} opacity="0.5" />
            <polygon points={pts([E[4], E[5], E[6], E[7]].map(P))} fill={F.gold} opacity="0.7" />
            {kanten.map(([i, j], n) => <g key={n}>{linie(E[i], E[j], F.see, hinten(i, j))}</g>)}
            <Txt x={P([a / 2, 0, 0])[0]} y={P([a / 2, 0, 0])[1] + 16} gr={12}>a</Txt>
            <Txt x={P([a, b / 2, 0])[0] + 12} y={P([a, b / 2, 0])[1] + 6} gr={12}>b</Txt>
            <Txt x={P([0, 0, c / 2])[0] - 10} y={P([0, 0, c / 2])[1]} gr={12}>c</Txt>
          </svg>
          <Messzeile><M t={"V = a \\cdot b \\cdot c"} /></Messzeile>
        </div>
      );
    }
    /* Würfel aus drei Pyramiden mit gemeinsamer Spitze E[7] */
    const W = [[0, 0, 0], [a, 0, 0], [a, a, 0], [0, a, 0], [0, 0, a], [a, 0, a], [a, a, a], [0, a, a]];
    const spitze = W[7];
    const basen = [[W[0], W[1], W[2], W[3]], [W[0], W[1], W[5], W[4]], [W[1], W[2], W[6], W[5]]];
    const farben = [F.blau, F.gold2, F.rosa];
    const kanten2 = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
    return (
      <div>
        <Hinweis>Drei gleich große Pyramiden mit gemeinsamer Spitze füllen einen Würfel. Jede hat eine Würfelseite als Grundfläche – also ein Drittel des Volumens.</Hinweis>
        <svg viewBox="0 0 340 230" style={svgStil} role="img" aria-label="Würfel, zerlegt in drei Pyramiden">
          {kanten2.map(([i, j], n) => <g key={n}>{linie(W[i], W[j], F.achse, [i, j].includes(3), 1.2)}</g>)}
          {basen.map((bs, i) => (i === teil || teil === 3) && (
            <g key={i}>
              <polygon points={pts(bs.map(P))} fill={farben[i]} opacity="0.75" stroke={F.see} />
              {bs.map((p, j) => <g key={j}>{linie(p, spitze, F.see)}</g>)}
            </g>
          ))}
          <Punkt x={P(spitze)[0]} y={P(spitze)[1]} farbe={F.rosaKraeftig} />
        </svg>
        <Umschalter label="Pyramide" wert={teil} setze={setTeil} optionen={[[0, "1"], [1, "2"], [2, "3"], [3, "alle"]]} />
        <Messzeile><M t={"3 \\cdot V_{\\text{Pyramide}} = a^3 \\;\\Rightarrow\\; V = \\frac{1}{3} a^2 \\cdot a"} /></Messzeile>
      </div>
    );
  }
  const ell = (cx, cy, rx, ry, farbe, oben = true, voll = true) => (
    <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={voll ? farbe : "none"} stroke={F.see} strokeWidth="1.4" strokeDasharray={oben ? undefined : "4 3"} />
  );
  const cx = 120, R = 60, ry = 18, H = 120, yb = 190;
  if (art === "zylinder" || art === "kegel") {
    return (
      <div>
        <Hinweis>{art === "zylinder" ? "Gleiche Kreisscheiben übereinander gestapelt: Grundfläche mal Höhe. Der Mantel abgerollt ist ein Rechteck." : "Ein Kegel ist eine Pyramide mit Kreis als Grundfläche: ein Drittel des Zylinders."}</Hinweis>
        <svg viewBox="0 0 340 220" style={svgStil} role="img" aria-label={art === "zylinder" ? "Zylinder und abgerollter Mantel" : "Kegel im Zylinder"}>
          {art === "kegel" && <>
            <path d={`M${cx - R} ${yb} L${cx - R} ${yb - H} M${cx + R} ${yb} L${cx + R} ${yb - H}`} stroke={F.achse} strokeDasharray="4 3" />
            {ell(cx, yb - H, R, ry, "none", true, false)}
          </>}
          {ell(cx, yb, R, ry, F.blau, false)}
          {art === "zylinder" ? (
            <>
              <path d={`M${cx - R} ${yb} L${cx - R} ${yb - H} M${cx + R} ${yb} L${cx + R} ${yb - H}`} stroke={F.see} strokeWidth="1.6" />
              <rect x={cx - R} y={yb - H} width={2 * R} height={H} fill={F.blau} opacity="0.35" />
              {ell(cx, yb - H, R, ry, F.gold)}
              {ell(cx, yb - H * hz, R, ry, F.gold2, true, true)}
              <rect x={232} y={yb - H} width={98} height={H} fill={F.blauMittel} opacity="0.5" stroke={F.see} />
              <Txt x={281} y={yb + 14} gr={11}>2πr</Txt>
              <Txt x={226} y={yb - H / 2} gr={11} anker="end">h</Txt>
            </>
          ) : (
            <>
              <path d={`M${cx - R} ${yb} L${cx} ${yb - H} L${cx + R} ${yb}`} fill={F.gold} opacity="0.7" stroke={F.see} strokeWidth="1.6" />
              <line x1={cx} x2={cx} y1={yb} y2={yb - H} stroke={F.rosaKraeftig} strokeDasharray="4 3" />
              <line x1={cx} x2={cx + R} y1={yb} y2={yb} stroke={F.rosaKraeftig} />
              <Txt x={cx + 6} y={yb - H / 2} anker="start" gr={11} farbe={F.rosaKraeftig}>h</Txt>
              <Txt x={cx + R / 2} y={yb - 4} gr={11} farbe={F.rosaKraeftig}>r</Txt>
              <Txt x={cx + R / 2 + 10} y={yb - H / 2} anker="start" gr={11} farbe={F.see}>s</Txt>
            </>
          )}
        </svg>
        {art === "zylinder" && <Regler label="Schicht" wert={hz} setze={setHz} min={0} max={1} />}
        <Messzeile>{art === "zylinder" ? <M t={"V = \\pi r^2 \\cdot h, \\quad M = 2\\pi r \\cdot h"} /> : <M t={"V = \\frac{1}{3} \\pi r^2 h, \\quad s = \\sqrt{r^2 + h^2}"} />}</Messzeile>
      </div>
    );
  }
  /* Kugel: Archimedes – Halbkugel = Zylinder − Kegel in jeder Höhe */
  const Rr = 70, base = 190, links = 20, abst = 160;
  const zz = hz * Rr;
  const rKugel = Math.sqrt(Rr * Rr - zz * zz), rKegel = zz;
  return (
    <div>
      <Hinweis>In jeder Höhe z ist der Querschnitt der Halbkugel (links) genauso groß wie der Ring zwischen Zylinder und Kegel (rechts): π(r² − z²).</Hinweis>
      <svg viewBox="0 0 340 220" style={svgStil} role="img" aria-label="Halbkugel und Zylinder mit Kegel, gleiche Querschnitte">
        <path d={`M${links} ${base} A${Rr} ${Rr} 0 0 1 ${links + 2 * Rr} ${base}`} fill={F.blau} stroke={F.see} strokeWidth="1.6" />
        <line x1={links} x2={links + 2 * Rr} y1={base} y2={base} stroke={F.see} strokeWidth="1.6" />
        <rect x={links + abst} y={base - Rr} width={2 * Rr} height={Rr} fill={F.gold} stroke={F.gold3} strokeWidth="1.4" />
        <path d={`M${links + abst} ${base - Rr} L${links + abst + Rr} ${base} L${links + abst + 2 * Rr} ${base - Rr} Z`} fill={C.weiss} stroke={F.gold3} strokeWidth="1.4" />
        <line x1={links + Rr - rKugel} x2={links + Rr + rKugel} y1={base - zz} y2={base - zz} stroke={F.rosaKraeftig} strokeWidth="3.2" />
        <line x1={links + abst} x2={links + abst + Rr - rKegel} y1={base - zz} y2={base - zz} stroke={F.rosaKraeftig} strokeWidth="3.2" />
        <line x1={links + abst + Rr + rKegel} x2={links + abst + 2 * Rr} y1={base - zz} y2={base - zz} stroke={F.rosaKraeftig} strokeWidth="3.2" />
        <Txt x={links + Rr} y={base + 16} gr={11}>Halbkugel</Txt>
        <Txt x={links + abst + Rr} y={base + 16} gr={11}>Zylinder − Kegel</Txt>
        <Txt x={links - 4} y={base - zz + 4} anker="end" gr={11} farbe={F.rosaKraeftig}>z</Txt>
      </svg>
      <Regler label="Höhe z" wert={hz} setze={setHz} min={0} max={0.99} />
      <Messzeile>
        <div><M t={`\\pi(r^2 - z^2) = \\pi r^2 - \\pi z^2 \\quad (z = ${z(hz)} r)`} /></div>
        <div><M t={"V = \\frac{4}{3}\\pi r^3, \\quad O = 4\\pi r^2"} /></div>
      </Messzeile>
    </div>
  );
}

/* ======================= Allgemeines Dreieck ======================= */
function DreieckAllg({ modus = "kosinussatz" }) {
  const [Cp, setCp] = useState([140, 50]);
  const A = [50, 180], B = [290, 180];
  const zieh = useZiehen(([sx, sy], neu) => { if (neu && Math.hypot(sx - Cp[0], sy - Cp[1]) > 40) return false; setCp([klemm(sx, 30, 310), klemm(sy, 30, 160)]); return true; });
  const d = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]) / 40;
  const a = d(B, Cp), b = d(A, Cp), c = d(A, B);
  const wi = (P, Q, R) => Math.acos(((Q[0] - P[0]) * (R[0] - P[0]) + (Q[1] - P[1]) * (R[1] - P[1])) / (Math.hypot(Q[0] - P[0], Q[1] - P[1]) * Math.hypot(R[0] - P[0], R[1] - P[1])));
  const al = wi(A, B, Cp), be = wi(B, A, Cp), ga = wi(Cp, A, B);
  const wA = (P, Q) => Math.atan2(Q[1] - P[1], Q[0] - P[0]);
  const fuss = [Cp[0], 180];
  /* Lot von A auf die Gerade CB */
  const u = [(B[0] - Cp[0]) / (a * 40), (B[1] - Cp[1]) / (a * 40)];
  const tA = (A[0] - Cp[0]) * u[0] + (A[1] - Cp[1]) * u[1];
  const fussA = [Cp[0] + tA * u[0], Cp[1] + tA * u[1]];
  return (
    <div>
      <Hinweis>Ziehe den Punkt C.</Hinweis>
      <svg viewBox="0 0 340 210" style={svgStil} {...zieh} role="img" aria-label="Dreieck ABC mit verschiebbarer Ecke C">
        <polygon points={pts([A, B, Cp])} fill={F.blau} stroke={F.see} strokeWidth="2" strokeLinejoin="round" />
        {modus === "winkelsumme" && <>
          <line x1={10} x2={330} y1={Cp[1]} y2={Cp[1]} stroke={F.achse} strokeDasharray="5 4" />
          <Bogen x={Cp[0]} y={Cp[1]} r={20} w1={Math.PI} w2={Math.PI + al} farbe={F.gold3} />
          <Bogen x={Cp[0]} y={Cp[1]} r={20} w1={-be} w2={0} farbe={F.rosaKraeftig} />
        </>}
        {(modus === "sinussatz" || modus === "kosinussatz") && <>
          <line x1={Cp[0]} x2={fuss[0]} y1={Cp[1]} y2={180} stroke={F.rosaKraeftig} strokeWidth="1.8" strokeDasharray="5 3" />
          <RechterWinkel x={fuss[0]} y={180} u={[Cp[0] < B[0] ? 1 : -1, 0]} v={[0, -1]} g={9} />
          <Txt x={fuss[0] + 6} y={(Cp[1] + 180) / 2} anker="start" gr={11} farbe={F.rosaKraeftig}>h</Txt>
        </>}
        {modus === "flaeche" && <>
          <line x1={A[0]} y1={A[1]} x2={fussA[0]} y2={fussA[1]} stroke={F.rosaKraeftig} strokeWidth="1.8" strokeDasharray="5 3" />
          <line x1={Cp[0]} y1={Cp[1]} x2={fussA[0]} y2={fussA[1]} stroke={F.rosaKraeftig} strokeWidth="1" strokeDasharray="2 3" />
          <Txt x={(A[0] + fussA[0]) / 2 - 6} y={(A[1] + fussA[1]) / 2} anker="end" gr={11} farbe={F.rosaKraeftig}>h = b · sin γ</Txt>
        </>}
        <Bogen x={A[0]} y={A[1]} r={18} w1={wA(A, Cp)} w2={0} farbe={F.gold3} />
        <Bogen x={B[0]} y={B[1]} r={18} w1={Math.PI} w2={wA(B, Cp) + (wA(B, Cp) < 0 ? 2 * Math.PI : 0)} farbe={F.rosaKraeftig} />
        <Bogen x={Cp[0]} y={Cp[1]} r={18} w1={wA(Cp, A)} w2={wA(Cp, B)} farbe={F.see} />
        <Txt x={A[0] - 10} y={A[1] + 14}>A</Txt><Txt x={B[0] + 10} y={B[1] + 14}>B</Txt>
        <Txt x={(A[0] + B[0]) / 2} y={196} gr={12}>c</Txt>
        <Txt x={(B[0] + Cp[0]) / 2 + 10} y={(B[1] + Cp[1]) / 2 - 4} gr={12} anker="start">a</Txt>
        <Txt x={(A[0] + Cp[0]) / 2 - 10} y={(A[1] + Cp[1]) / 2 - 4} gr={12} anker="end">b</Txt>
        <Griff x={Cp[0]} y={Cp[1]} farbe={F.see} />
        <Txt x={Cp[0]} y={Cp[1] - 16}>C</Txt>
      </svg>
      <Messzeile>
        <div data-kein-i18n style={{ fontSize: 13, color: C.grau }}>α = {z(grad(al))}°, β = {z(grad(be))}°, γ = {z(grad(ga))}° · a = {z(a)}, b = {z(b)}, c = {z(c)}</div>
        {modus === "winkelsumme" && <M t={`α + β + γ = ${z(grad(al + be + ga))}°`} />}
        {modus === "sinussatz" && <M t={`\\frac{a}{\\sin α} = ${z(a / Math.sin(al))}, \\; \\frac{b}{\\sin β} = ${z(b / Math.sin(be))}, \\; \\frac{c}{\\sin γ} = ${z(c / Math.sin(ga))}`} />}
        {modus === "kosinussatz" && <M t={`a^2 + b^2 - 2ab \\cos γ = ${z(a * a + b * b - 2 * a * b * Math.cos(ga))} = c^2 = ${z(c * c)}`} />}
        {modus === "flaeche" && <M t={`A = \\frac{1}{2} \\cdot ${z(a)} \\cdot ${z(b)} \\cdot \\sin ${z(grad(ga))}° = ${z(0.5 * a * b * Math.sin(ga))}`} />}
      </Messzeile>
    </div>
  );
}

/* ======================= Strahlensatz ======================= */
function Strahlensatz() {
  const [k, setK] = useState(1.8);
  const Z = [30, 170], u = [1, -0.55], v = [1, 0.02];
  const a1 = 100, P1 = [Z[0] + u[0] * a1, Z[1] + u[1] * a1], Q1 = [Z[0] + v[0] * a1, Z[1] + v[1] * a1];
  const P2 = [Z[0] + u[0] * a1 * k, Z[1] + u[1] * a1 * k], Q2 = [Z[0] + v[0] * a1 * k, Z[1] + v[1] * a1 * k];
  return (
    <div>
      <Hinweis>Vergrößere mit dem Faktor k: Alle Längen werden k-mal so groß, die Fläche k²-mal.</Hinweis>
      <svg viewBox="0 0 340 190" style={svgStil} role="img" aria-label="Strahlensatzfigur mit zwei ähnlichen Dreiecken">
        <polygon points={pts([Z, P2, Q2])} fill={F.gold} stroke={F.gold3} strokeWidth="1.4" />
        <polygon points={pts([Z, P1, Q1])} fill={F.blau} stroke={F.see} strokeWidth="1.6" />
        <line x1={Z[0]} y1={Z[1]} x2={Z[0] + u[0] * 300} y2={Z[1] + u[1] * 300} stroke={F.achse} />
        <line x1={Z[0]} y1={Z[1]} x2={Z[0] + v[0] * 300} y2={Z[1] + v[1] * 300} stroke={F.achse} />
        <Punkt x={Z[0]} y={Z[1]} farbe={F.tinte} r={3.5} />
        <Txt x={(P1[0] + Q1[0]) / 2 + 8} y={(P1[1] + Q1[1]) / 2} anker="start" gr={11} farbe={F.see}>a</Txt>
        <Txt x={(P2[0] + Q2[0]) / 2 + 8} y={(P2[1] + Q2[1]) / 2} anker="start" gr={11} farbe={F.gold3}>k · a</Txt>
      </svg>
      <Regler label="k" wert={k} setze={setK} min={1} max={2.8} schritt={0.05} anzeige={z(k)} />
      <Messzeile>Längen <M t={`\\times ${z(k)}`} /> · Fläche <M t={`\\times ${z(k * k)}`} /></Messzeile>
    </div>
  );
}

/* ======================= Thales ======================= */
function Thales() {
  const [w, setW] = useState(2.1);
  const Mx = 170, My = 170, R = 130;
  const A = [Mx - R, My], B = [Mx + R, My], Cp = [Mx + R * Math.cos(w), My - R * Math.sin(w)];
  const zieh = useZiehen(([sx, sy]) => { setW(klemm(Math.atan2(My - sy, sx - Mx), 0.12, Math.PI - 0.12)); return true; });
  const wA = (P, Q) => Math.atan2(Q[1] - P[1], Q[0] - P[0]);
  return (
    <div>
      <Hinweis>Ziehe C über den Halbkreis: Der Winkel bei C bleibt immer 90°. Die beiden Dreiecke mit M sind gleichschenklig.</Hinweis>
      <svg viewBox="0 0 340 190" style={svgStil} {...zieh} role="img" aria-label="Halbkreis mit rechtem Winkel bei C">
        <path d={`M${A[0]} ${A[1]} A${R} ${R} 0 0 1 ${B[0]} ${B[1]}`} fill="none" stroke={F.achse} strokeWidth="1.4" />
        <polygon points={pts([A, [Mx, My], Cp])} fill={F.blau} stroke={F.see} strokeWidth="1.5" />
        <polygon points={pts([[Mx, My], B, Cp])} fill={F.gold} stroke={F.gold3} strokeWidth="1.5" />
        <Bogen x={A[0]} y={A[1]} r={20} w1={wA(A, Cp)} w2={0} farbe={F.see} />
        <Bogen x={Cp[0]} y={Cp[1]} r={20} w1={wA(Cp, A)} w2={wA(Cp, [Mx, My])} farbe={F.see} />
        <Bogen x={B[0]} y={B[1]} r={20} w1={Math.PI} w2={wA(B, Cp) + 2 * Math.PI * (wA(B, Cp) < 0 ? 1 : 0)} farbe={F.gold3} />
        <Bogen x={Cp[0]} y={Cp[1]} r={26} w1={wA(Cp, [Mx, My])} w2={wA(Cp, B)} farbe={F.gold3} />
        <Punkt x={Mx} y={My} farbe={F.tinte} r={3.5} />
        <Txt x={A[0] - 4} y={A[1] + 15}>A</Txt><Txt x={B[0] + 4} y={B[1] + 15}>B</Txt><Txt x={Mx} y={My + 15}>M</Txt>
        <Griff x={Cp[0]} y={Cp[1]} />
        <Txt x={Cp[0]} y={Cp[1] - 16}>C</Txt>
      </svg>
      <Messzeile><M t={"γ = α + β, \\quad α + β + γ = 180° \\;\\Rightarrow\\; γ = 90°"} /></Messzeile>
    </div>
  );
}

/* ======================= Pythagoras ======================= */
const BLAU = "#D6E4F7", GOLD = "#FFF1BF", GOLD2 = "#FBE08A", GRANA = "#F7D3E0", DREIECK = "#A9C4EC";
function Pythagoras() {
  const [ansicht, setAnsicht] = useState("quadrate");
  const [a, setA] = useState(3);
  const [b, setB] = useState(4);
  const [t, setT] = useState(0);
  const c2 = a * a + b * b;
  let bild;
  if (ansicht === "quadrate") {
    const q = quadrateUeber(a, b), kk = q.kasten;
    const bw = kk.x1 - kk.x0, bh = kk.y1 - kk.y0, sc = Math.min(296 / bw, 262 / bh), X0 = (320 - bw * sc) / 2, Y0 = 12;
    const P = ([x, y]) => [X0 + (x - kk.x0) * sc, Y0 + (kk.y1 - y) * sc];
    const mitte = (arr) => P([(arr[0][0] + arr[2][0]) / 2, (arr[0][1] + arr[2][1]) / 2]);
    bild = (
      <svg viewBox="0 0 320 286" style={svgStil} role="img" aria-label="Quadrate über den Seiten eines rechtwinkligen Dreiecks">
        <polygon points={pts(q.quadratA.map(P))} fill={BLAU} stroke={F.see} strokeWidth="1.8" />
        <polygon points={pts(q.quadratB.map(P))} fill={GRANA} stroke={F.rosaKraeftig} strokeWidth="1.8" />
        <polygon points={pts(q.quadratC.map(P))} fill={GOLD} stroke="#B8920A" strokeWidth="1.8" />
        <polygon points={pts(q.dreieck.map(P))} fill="#E4E8F0" stroke={F.tinte} strokeWidth="2" />
        <Txt x={mitte(q.quadratA)[0]} y={mitte(q.quadratA)[1] + 5} farbe={F.see} gr={14}>{`a² = ${a * a}`}</Txt>
        <Txt x={mitte(q.quadratB)[0]} y={mitte(q.quadratB)[1] + 5} farbe={F.rosaKraeftig} gr={14}>{`b² = ${b * b}`}</Txt>
        <Txt x={mitte(q.quadratC)[0]} y={mitte(q.quadratC)[1] + 5} gr={15}>{`c² = ${c2}`}</Txt>
      </svg>
    );
  } else if (ansicht === "umlegen") {
    const s = a + b, D = 270, sc = D / s, X0 = 25, Y0 = 20;
    const P = ([x, y]) => [X0 + x * sc, Y0 + (s - y) * sc];
    const plan = umlegePlan(a, b);
    const tri = plan.map((pl) => dreieckBeiT(pl, t));
    const [ax, ay] = P([0, a]), [bx, by] = P([a, s]);
    bild = (
      <svg viewBox="0 0 320 314" style={svgStil} role="img" aria-label="Vier Dreiecke im Quadrat der Seite a plus b werden umgelegt">
        <rect x={X0} y={Y0} width={D} height={D} fill="#FFF6D6" stroke={F.tinte} strokeWidth="1.6" />
        <polygon points={pts(schraegesQuadrat(a, b).map(P))} fill={GOLD2} fillOpacity={1 - t} />
        <rect x={ax} y={ay} width={a * sc} height={a * sc} fill={BLAU} fillOpacity={t} />
        <rect x={bx} y={by} width={b * sc} height={b * sc} fill={GRANA} fillOpacity={t} />
        <defs><clipPath id="fs-pyth-rahmen"><rect x={X0} y={Y0} width={D} height={D} /></clipPath></defs>
        <g clipPath="url(#fs-pyth-rahmen)">{tri.map((d, i) => <polygon key={i} points={pts(d.map(P))} fill={DREIECK} stroke={F.see} strokeWidth="1.6" strokeLinejoin="round" />)}</g>
        {t < 0.05 && <Txt x={P([s / 2, s / 2])[0]} y={P([s / 2, s / 2])[1] + 6} gr={19}>c²</Txt>}
        {t > 0.95 && <><Txt x={P([a / 2, a / 2])[0]} y={P([a / 2, a / 2])[1] + 6} gr={19} farbe={F.see}>a²</Txt><Txt x={P([a + b / 2, a + b / 2])[0]} y={P([a + b / 2, a + b / 2])[1] + 6} gr={19} farbe={F.rosaKraeftig}>b²</Txt></>}
        <Txt x={X0 + (a * sc) / 2} y={Y0 + D + 18} farbe={F.see}>a</Txt>
        <Txt x={X0 + a * sc + (b * sc) / 2} y={Y0 + D + 18} farbe={F.rosaKraeftig}>b</Txt>
      </svg>
    );
  } else if (ansicht === "mitte") {
    const { c, V, innen, dreiecke } = beweisZwei(a, b);
    const D = 258, sc = D / c, X0 = (320 - D) / 2, Y0 = 18;
    const P = ([x, y]) => [X0 + x * sc, Y0 + (c - y) * sc];
    bild = (
      <svg viewBox="0 0 320 296" style={svgStil} role="img" aria-label="Quadrat der Seite c mit vier Dreiecken und kleinem Quadrat in der Mitte">
        <rect x={X0} y={Y0} width={D} height={D} fill={GOLD} />
        <polygon points={pts(innen.map(P))} fill={GOLD2} />
        {dreiecke.map((d, i) => <polygon key={i} points={pts(d.map(P))} fill={DREIECK} stroke={F.see} strokeWidth="1.6" strokeLinejoin="round" />)}
        <polygon points={pts(V.map(P))} fill="none" stroke={F.tinte} strokeWidth="1.8" />
        {Math.abs(b - a) * sc > 34 && <Txt x={P([c / 2, c / 2])[0]} y={P([c / 2, c / 2])[1] + 5} gr={12}>{b > a ? "(b − a)²" : "(a − b)²"}</Txt>}
        <Txt x={X0 + D / 2} y={Y0 + D + 18}>c</Txt>
      </svg>
    );
  } else {
    /* Ähnlichkeit: Höhe auf c */
    const cc = Math.sqrt(c2), p = (a * a) / cc, q = (b * b) / cc, h = (a * b) / cc;
    const sc = 270 / cc, X0 = 25, Yb = 210;
    const Ap = [X0, Yb], Bp = [X0 + cc * sc, Yb], Cp = [X0 + q * sc, Yb - h * sc], Fp = [X0 + q * sc, Yb];
    bild = (
      <svg viewBox="0 0 320 240" style={svgStil} role="img" aria-label="Rechtwinkliges Dreieck mit Höhe auf die Hypotenuse">
        <polygon points={pts([Ap, Fp, Cp])} fill={GRANA} stroke={F.rosaKraeftig} strokeWidth="1.6" />
        <polygon points={pts([Fp, Bp, Cp])} fill={BLAU} stroke={F.see} strokeWidth="1.6" />
        <line x1={Cp[0]} y1={Cp[1]} x2={Fp[0]} y2={Fp[1]} stroke={F.tinte} strokeDasharray="4 3" />
        <Txt x={(Ap[0] + Fp[0]) / 2} y={Yb + 16} farbe={F.rosaKraeftig}>q</Txt>
        <Txt x={(Fp[0] + Bp[0]) / 2} y={Yb + 16} farbe={F.see}>p</Txt>
        <Txt x={(Ap[0] + Cp[0]) / 2 - 8} y={(Ap[1] + Cp[1]) / 2} anker="end" farbe={F.rosaKraeftig}>b</Txt>
        <Txt x={(Bp[0] + Cp[0]) / 2 + 8} y={(Bp[1] + Cp[1]) / 2} anker="start" farbe={F.see}>a</Txt>
        <Txt x={Cp[0] + 6} y={(Cp[1] + Yb) / 2} anker="start">h</Txt>
      </svg>
    );
  }
  return (
    <div>
      <Hinweis>{ansicht === "quadrate" ? "Verändere a und b: Die beiden kleinen Quadrate zusammen sind immer so groß wie das große."
        : ansicht === "umlegen" ? "Schiebe den Regler: Dieselben vier Dreiecke, dasselbe große Quadrat – also bleibt auch der freie Platz gleich: c² = a² + b²."
          : ansicht === "mitte" ? "Vier Dreiecke im Quadrat über c, in der Mitte ein kleines Quadrat der Seite b − a."
            : "Die Höhe teilt das Dreieck in zwei kleinere, die dem großen ähnlich sind. Daraus folgen a² = c · p und b² = c · q."}</Hinweis>
      <Umschalter label="Ansicht" wert={ansicht} setze={setAnsicht} optionen={[["quadrate", "Quadrate"], ["umlegen", "Beweis 1"], ["mitte", "Beweis 3"], ["aehnlich", "Beweis 4"]]} />
      <div style={{ marginTop: 10 }}>{bild}</div>
      {ansicht === "umlegen" && <Regler label="Dreiecke umlegen" wert={t} setze={setT} min={0} max={1} />}
      <Regler label="a" wert={a} setze={setA} min={1} max={6} schritt={1} anzeige={a} />
      <Regler label="b" wert={b} setze={setB} min={1} max={6} schritt={1} anzeige={b} />
      <Messzeile><M t={`a^2 + b^2 = ${a * a} + ${b * b} = ${c2} = c^2, \\quad c = ${Number.isInteger(Math.sqrt(c2)) ? Math.sqrt(c2) : z(Math.sqrt(c2))}`} /></Messzeile>
    </div>
  );
}

/* ======================= Höhen- und Kathetensatz ======================= */
function Rechtwinklig() {
  const [p, setP] = useState(2);
  const c = 6, q = c - p, h = Math.sqrt(p * q);
  const sc = 30, X0 = 60, Yb = 108;
  const A = [X0, Yb], B = [X0 + c * sc, Yb], Fp = [X0 + q * sc, Yb], Cp = [X0 + q * sc, Yb - h * sc];
  return (
    <div>
      <Hinweis>Verschiebe den Höhenfußpunkt. Das Quadrat über h (gold) hat immer dieselbe Fläche wie das Rechteck aus p und q (blau).</Hinweis>
      <svg viewBox="0 0 340 290" style={svgStil} role="img" aria-label="Höhensatz: Quadrat über h und Rechteck aus p und q">
        <rect x={Fp[0] - h * sc} y={Cp[1]} width={h * sc} height={h * sc} fill={F.gold} opacity="0.7" stroke={F.gold3} />
        <rect x={Fp[0]} y={Yb} width={p * sc} height={q * sc} fill={F.blau} opacity="0.8" stroke={F.see} />
        <polygon points={pts([A, B, Cp])} fill="#F4F6FA" fillOpacity="0.85" stroke={F.tinte} strokeWidth="1.8" />
        <line x1={Cp[0]} y1={Cp[1]} x2={Fp[0]} y2={Fp[1]} stroke={F.rosaKraeftig} strokeWidth="2" />
        <Txt x={(A[0] + Fp[0]) / 2} y={Yb + 14} gr={11} farbe={F.rosaKraeftig}>q</Txt>
        <Txt x={(Fp[0] + B[0]) / 2} y={Yb - 5} gr={11} farbe={F.see}>p</Txt>
        <Txt x={Fp[0] + 5} y={(Cp[1] + Yb) / 2} anker="start" gr={11} farbe={F.rosaKraeftig}>h</Txt>
        <Txt x={Fp[0] - (h * sc) / 2} y={Cp[1] + (h * sc) / 2 + 4} gr={12} farbe={F.gold3}>h²</Txt>
        <Txt x={Fp[0] + (p * sc) / 2} y={Yb + (q * sc) / 2 + 4} gr={12} farbe={F.see}>p · q</Txt>
      </svg>
      <Regler label="p" wert={p} setze={setP} min={0.5} max={5.5} schritt={0.1} anzeige={z(p)} />
      <Messzeile>
        <div><M t={`h^2 = p \\cdot q = ${z(p)} \\cdot ${z(q)} = ${z(h * h)}`} /></div>
        <div><M t={`a^2 = c \\cdot p = ${z(c * p)}, \\quad b^2 = c \\cdot q = ${z(c * q)}`} /></div>
      </Messzeile>
    </div>
  );
}

/* ======================= Sinus, Kosinus, Tangens im Dreieck ======================= */
function TrigDreieck({ fokus = "sin" }) {
  const [w, setW] = useState(35);
  const [g, setG] = useState(1);
  const al = rad(w);
  const H = 4 * g, AK = H * Math.cos(al), GK = H * Math.sin(al);
  const s = 52, X0 = 30, Yb = 190;
  const A = [X0, Yb], Bp = [X0 + AK * s, Yb], Cp = [X0 + AK * s, Yb - GK * s];
  const farbeGK = fokus === "sin" || fokus === "tan" ? F.rosaKraeftig : fokus === "komplement" ? F.rosaKraeftig : F.achse;
  const farbeAK = fokus === "cos" || fokus === "tan" ? F.see : fokus === "komplement" ? F.see : F.achse;
  const farbeH = fokus === "sin" || fokus === "cos" ? F.gold3 : F.achse;
  const wert = fokus === "sin" ? [GK, H, Math.sin(al), "\\sin"] : fokus === "cos" ? [AK, H, Math.cos(al), "\\cos"] : [GK, AK, Math.tan(al), "\\tan"];
  return (
    <div>
      <Hinweis>{fokus === "komplement" ? "Für den Winkel β oben ist die Ankathete von α die Gegenkathete – die Rollen tauschen." : "Verändere die Größe des Dreiecks: Das Verhältnis bleibt gleich, solange α gleich bleibt."}</Hinweis>
      <svg viewBox="0 0 340 210" style={svgStil} role="img" aria-label="Rechtwinkliges Dreieck mit Winkel α">
        <polygon points={pts([A, Bp, Cp])} fill={F.blau} fillOpacity="0.5" stroke="none" />
        <line x1={A[0]} y1={A[1]} x2={Bp[0]} y2={Bp[1]} stroke={farbeAK} strokeWidth="3.2" />
        <line x1={Bp[0]} y1={Bp[1]} x2={Cp[0]} y2={Cp[1]} stroke={farbeGK} strokeWidth="3.2" />
        <line x1={A[0]} y1={A[1]} x2={Cp[0]} y2={Cp[1]} stroke={farbeH} strokeWidth="3.2" />
        <RechterWinkel x={Bp[0]} y={Bp[1]} u={[-1, 0]} v={[0, -1]} g={11} />
        <Bogen x={A[0]} y={A[1]} r={30} w1={-al} w2={0} farbe={F.gold3} />
        <Txt x={A[0] + 42} y={A[1] - 6} gr={12} anker="start" farbe={F.gold3}>α</Txt>
        {fokus === "komplement" && <><Bogen x={Cp[0]} y={Cp[1]} r={26} w1={Math.PI / 2} w2={Math.PI / 2 + (Math.PI / 2 - al)} farbe={F.lila} /><Txt x={Cp[0] - 10} y={Cp[1] + 40} gr={12} anker="end" farbe={F.lila}>β</Txt></>}
        <Txt x={(A[0] + Bp[0]) / 2} y={Yb + 16} gr={11} farbe={farbeAK}>{fokus === "komplement" ? "AK von α = GK von β" : "Ankathete"}</Txt>
        <Txt x={Bp[0] + 6} y={(Bp[1] + Cp[1]) / 2} gr={11} anker="start" farbe={farbeGK}>{fokus === "komplement" ? "GK von α" : "Gegenkathete"}</Txt>
        <Txt x={(A[0] + Cp[0]) / 2 - 6} y={(A[1] + Cp[1]) / 2 - 6} gr={11} anker="end" farbe={farbeH}>Hypotenuse</Txt>
      </svg>
      <Regler label="α" wert={w} setze={setW} min={5} max={70} schritt={1} anzeige={`${w}°`} />
      {fokus !== "komplement" && <Regler label="Größe" wert={g} setze={setG} min={0.4} max={1.15} anzeige={null} />}
      <Messzeile>
        {fokus === "komplement" ? <M t={`\\cos ${w}° = ${z(Math.cos(al))} = \\sin ${90 - w}°`} />
          : <M t={`\\frac{${z(wert[0])}}{${z(wert[1])}} = ${z(wert[2])} = ${wert[3]} ${w}°`} />}
      </Messzeile>
    </div>
  );
}

/* ======================= Einheitskreis ======================= */
const WERTE = [[0, "0", "1"], [30, "\\frac{1}{2}", "\\frac{\\sqrt{3}}{2}"], [45, "\\frac{\\sqrt{2}}{2}", "\\frac{\\sqrt{2}}{2}"], [60, "\\frac{\\sqrt{3}}{2}", "\\frac{1}{2}"], [90, "1", "0"]];
function Einheitskreis({ modus }) {
  const [w, setW] = useState(modus === "periode" ? 400 : 40);
  const cx = 150, cy = 120, R = 92;
  const a = rad(w);
  const P = [cx + R * Math.cos(a), cy - R * Math.sin(a)];
  const zieh = useZiehen(([sx, sy]) => { let g = grad(Math.atan2(cy - sy, sx - cx)); if (g < 0) g += 360; setW(modus === "periode" ? Math.floor(w / 360) * 360 + Math.round(g) : Math.round(g)); return true; });
  const Q = [cx + R * Math.cos(-a), cy - R * Math.sin(-a)];
  const runden = Math.floor(w / 360);
  return (
    <div>
      <Hinweis>{modus === "bogen" ? "Der Winkel im Bogenmaß ist die Länge des rosa Bogens auf dem Kreis mit Radius 1."
        : modus === "symmetrie" ? "Der Winkel −α zeigt auf den gespiegelten Punkt: gleicher Kosinus, Sinus mit umgekehrtem Vorzeichen."
          : modus === "periode" ? "Nach jeder vollen Umdrehung (360° = 2π) landet der Zeiger wieder an derselben Stelle."
            : modus === "werte" ? "Tippe auf einen Standardwinkel."
              : "Ziehe den Punkt um den Kreis. Seine Koordinaten sind (cos α | sin α)."}</Hinweis>
      <svg viewBox="0 0 300 240" style={{ ...svgStil, maxWidth: 380 }} {...zieh} role="img" aria-label="Einheitskreis mit Zeiger">
        <line x1={cx - R - 20} x2={cx + R + 20} y1={cy} y2={cy} stroke={F.achse} />
        <line x1={cx} x2={cx} y1={cy - R - 20} y2={cy + R + 20} stroke={F.achse} />
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={F.achse} strokeWidth="1.4" />
        <text x={cx + R + 4} y={cy + 14} fontSize="10" fill={F.achse}>1</text>
        {modus === "werte" && WERTE.map(([g]) => { const b = rad(g); return <circle key={g} cx={cx + R * Math.cos(b)} cy={cy - R * Math.sin(b)} r="7" fill={g === w ? F.gold2 : C.weiss} stroke={F.gold3} onClick={() => setW(g)} style={{ cursor: "pointer" }} />; })}
        {modus === "bogen" && <path d={`M${cx + R} ${cy} A${R} ${R} 0 ${w % 360 > 180 ? 1 : 0} 0 ${P[0]} ${P[1]}`} fill="none" stroke={F.rosaKraeftig} strokeWidth="5" />}
        {modus !== "bogen" && <Bogen x={cx} y={cy} r={24} w1={0} w2={-(a % (2 * Math.PI))} farbe={F.gold3} />}
        {modus === "symmetrie" && <>
          <line x1={cx} y1={cy} x2={Q[0]} y2={Q[1]} stroke={F.rosaKraeftig} strokeWidth="1.6" />
          <line x1={Q[0]} x2={Q[0]} y1={cy} y2={Q[1]} stroke={F.rosaKraeftig} strokeWidth="3" />
          <Punkt x={Q[0]} y={Q[1]} farbe={F.rosaKraeftig} />
          <Txt x={Q[0] + 8} y={Q[1] + 14} anker="start" gr={11} farbe={F.rosaKraeftig}>−α</Txt>
        </>}
        <line x1={cx} y1={cy} x2={P[0]} y2={P[1]} stroke={F.tinte} strokeWidth="1.8" />
        <line x1={P[0]} x2={P[0]} y1={cy} y2={P[1]} stroke={F.see} strokeWidth="3.4" />
        <line x1={cx} x2={P[0]} y1={cy} y2={cy} stroke={F.gold3} strokeWidth="3.4" />
        {modus === "pythagoras" && <>
          <Txt x={(cx + P[0]) / 2} y={cy + (Math.sin(a) >= 0 ? 15 : -7)} gr={11} farbe={F.gold3}>cos α</Txt>
          <Txt x={P[0] + (Math.cos(a) >= 0 ? 6 : -6)} y={(cy + P[1]) / 2 + 4} anker={Math.cos(a) >= 0 ? "start" : "end"} gr={11} farbe={F.see}>sin α</Txt>
          <Txt x={(cx + P[0]) / 2 - 8} y={(cy + P[1]) / 2 - 6} gr={11} anker="end">1</Txt>
        </>}
        <Griff x={P[0]} y={P[1]} />
        {modus === "periode" && <Txt x={30} y={24} anker="start" gr={12} farbe={F.rosaKraeftig}>{`${runden} volle Umdrehung${runden === 1 ? "" : "en"}`}</Txt>}
      </svg>
      <Regler label="α" wert={w} setze={setW} min={modus === "periode" ? 0 : modus === "symmetrie" ? 0 : 0} max={modus === "periode" ? 1080 : 360} schritt={1} anzeige={`${w}°`} />
      <Messzeile>
        {modus === "werte" && WERTE.some(([g]) => g === w) ? (() => { const e = WERTE.find(([g]) => g === w); return <M t={`\\sin ${w}° = ${e[1]}, \\quad \\cos ${w}° = ${e[2]}`} />; })()
          : modus === "bogen" ? <M t={`${w}°  ≙  \\frac{${w}}{180} \\pi = ${z(a)}`} />
            : modus === "pythagoras" ? <M t={`${z(Math.cos(a))}^2 + ${z(Math.sin(a))}^2 = ${z(Math.cos(a) ** 2 + Math.sin(a) ** 2)}`} />
              : modus === "symmetrie" ? <M t={`\\sin(-${w}°) = ${z(-Math.sin(a))}, \\quad \\cos(-${w}°) = ${z(Math.cos(a))}`} />
                : modus === "periode" ? <M t={`\\sin ${w}° = \\sin ${w % 360}° = ${z(Math.sin(a))}`} />
                  : <M t={`P(\\cos ${w}° | \\sin ${w}°) = (${z(Math.cos(a))} | ${z(Math.sin(a))})`} />}
      </Messzeile>
    </div>
  );
}

/* ======================= Additionstheorem ======================= */
function Additionstheorem() {
  const [al, setAl] = useState(40);
  const [be, setBe] = useState(30);
  const cx = 150, cy = 120, R = 92;
  const A = [Math.cos(rad(al)), Math.sin(rad(al))], B = [Math.cos(rad(be)), -Math.sin(rad(be))];
  const P = (v) => [cx + R * v[0], cy - R * v[1]];
  const links = Math.cos(rad(al + be)), rechts = Math.cos(rad(al)) * Math.cos(rad(be)) - Math.sin(rad(al)) * Math.sin(rad(be));
  return (
    <div>
      <Hinweis>Die Zeiger zu α und −β schließen den Winkel α + β ein. Ihr Skalarprodukt ist cos(α + β).</Hinweis>
      <svg viewBox="0 0 300 240" style={{ ...svgStil, maxWidth: 380 }} role="img" aria-label="Einheitskreis mit Zeigern zu alpha und minus beta">
        <line x1={cx - R - 20} x2={cx + R + 20} y1={cy} y2={cy} stroke={F.achse} />
        <line x1={cx} x2={cx} y1={cy - R - 20} y2={cy + R + 20} stroke={F.achse} />
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={F.achse} strokeWidth="1.4" />
        <Bogen x={cx} y={cy} r={34} w1={rad(be)} w2={-rad(al)} farbe={F.lila} />
        <Pfeil x1={cx} y1={cy} x2={P(A)[0]} y2={P(A)[1]} farbe={F.see} />
        <Pfeil x1={cx} y1={cy} x2={P(B)[0]} y2={P(B)[1]} farbe={F.rosaKraeftig} />
        <Txt x={P(A)[0] + 6} y={P(A)[1] - 6} anker="start" gr={11} farbe={F.see}>α</Txt>
        <Txt x={P(B)[0] + 6} y={P(B)[1] + 14} anker="start" gr={11} farbe={F.rosaKraeftig}>−β</Txt>
        <Txt x={cx + 46} y={cy + 4} anker="start" gr={11} farbe={F.lila}>α + β</Txt>
      </svg>
      <Regler label="α" wert={al} setze={setAl} min={0} max={90} schritt={1} anzeige={`${al}°`} />
      <Regler label="β" wert={be} setze={setBe} min={0} max={90} schritt={1} anzeige={`${be}°`} />
      <Messzeile>
        <div><M t={`\\cos(${al}° + ${be}°) = ${z(links)}`} /></div>
        <div><M t={`\\cos ${al}° \\cos ${be}° - \\sin ${al}° \\sin ${be}° = ${z(rechts)}`} /></div>
      </Messzeile>
    </div>
  );
}

/* ======================= Binomische Formeln als Flächen ======================= */
function BinomQuadrat({ modus = "plus" }) {
  const [a, setA] = useState(modus === "fuenf" ? 6 : 5);
  const [b, setB] = useState(2);
  const [t, setT] = useState(0);
  const u = Math.min(26, 240 / (modus === "plus" || modus === "ergaenzung" ? a + b : a));
  const X = 40, Y = 16;
  if (modus === "fuenf") {
    const n = a * 10 + 5;
    return (
      <div>
        <Hinweis>(10a + 5)² zerfällt in ein Quadrat (10a)², zwei Streifen 10a · 5 und ein Eck 25. Die beiden Streifen sind zusammen 100a.</Hinweis>
        <svg viewBox="0 0 340 220" style={svgStil} role="img" aria-label="Quadrat einer Zahl mit Endziffer 5 als Fläche">
          {(() => { const s = 180 / (a * 10 + 5), A = a * 10 * s, B = 5 * s; return <g>
            <rect x={X} y={Y} width={A} height={A} fill={F.blau} stroke={F.see} />
            <rect x={X + A} y={Y} width={B} height={A} fill={F.gold} stroke={F.gold3} />
            <rect x={X} y={Y + A} width={A} height={B} fill={F.gold} stroke={F.gold3} />
            <rect x={X + A} y={Y + A} width={B} height={B} fill={F.rosa} stroke={F.rosaKraeftig} />
            <Txt x={X + A / 2} y={Y + A / 2 + 5} farbe={F.see}>{`${a * 10}² = ${a * a * 100}`}</Txt>
            <Txt x={X + A + B + 8} y={Y + A / 2} anker="start" gr={11} farbe={F.gold3}>{`2 · ${a * 10} · 5 = ${a * 100}`}</Txt>
            <Txt x={X + A + B + 8} y={Y + A + B / 2 + 4} anker="start" gr={11} farbe={F.rosaKraeftig}>25</Txt>
          </g>; })()}
        </svg>
        <Regler label="a" wert={a} setze={setA} min={1} max={9} schritt={1} anzeige={a} />
        <Messzeile><M t={`${n}^2 = ${a} \\cdot ${a + 1} \\cdot 100 + 25 = ${n * n}`} /></Messzeile>
      </div>
    );
  }
  if (modus === "plus") {
    return (
      <div>
        <Hinweis>Ein Quadrat der Seite a + b: zwei Quadrate und zwei gleiche Rechtecke.</Hinweis>
        <svg viewBox="0 0 340 220" style={svgStil} role="img" aria-label="Quadrat der Seite a plus b in vier Teile zerlegt">
          <rect x={X} y={Y} width={a * u} height={a * u} fill={F.blau} stroke={F.see} strokeWidth="1.5" />
          <rect x={X + a * u} y={Y} width={b * u} height={a * u} fill={F.gold} stroke={F.gold3} strokeWidth="1.5" />
          <rect x={X} y={Y + a * u} width={a * u} height={b * u} fill={F.gold} stroke={F.gold3} strokeWidth="1.5" />
          <rect x={X + a * u} y={Y + a * u} width={b * u} height={b * u} fill={F.rosa} stroke={F.rosaKraeftig} strokeWidth="1.5" />
          <Txt x={X + (a * u) / 2} y={Y + (a * u) / 2 + 5} farbe={F.see} gr={15}>a²</Txt>
          <Txt x={X + a * u + (b * u) / 2} y={Y + (a * u) / 2 + 5} farbe={F.gold3} gr={12}>ab</Txt>
          <Txt x={X + (a * u) / 2} y={Y + a * u + (b * u) / 2 + 5} farbe={F.gold3} gr={12}>ab</Txt>
          <Txt x={X + a * u + (b * u) / 2} y={Y + a * u + (b * u) / 2 + 5} farbe={F.rosaKraeftig} gr={12}>b²</Txt>
          <Txt x={X + (a * u) / 2} y={Y - 3} gr={11}>a</Txt><Txt x={X + a * u + (b * u) / 2} y={Y - 3} gr={11}>b</Txt>
        </svg>
        <Regler label="a" wert={a} setze={setA} min={1} max={6} schritt={1} anzeige={a} />
        <Regler label="b" wert={b} setze={setB} min={1} max={4} schritt={1} anzeige={b} />
        <Messzeile><M t={`(${a} + ${b})^2 = ${a * a} + 2 \\cdot ${a * b} + ${b * b} = ${(a + b) ** 2}`} /></Messzeile>
      </div>
    );
  }
  if (modus === "minus") {
    const bb = Math.min(b, a - 1);
    return (
      <div>
        <Hinweis>Vom Quadrat a² werden zwei Streifen a · b abgezogen. Das rosa Eck wurde dabei doppelt abgezogen – einmal muss es wieder dazu.</Hinweis>
        <svg viewBox="0 0 340 200" style={svgStil} role="img" aria-label="Zweite binomische Formel als Fläche">
          <rect x={X} y={Y} width={a * u} height={a * u} fill={F.blau} stroke={F.see} strokeWidth="1.5" />
          <rect x={X + (a - bb) * u} y={Y} width={bb * u} height={a * u} fill={F.gold} opacity="0.85" stroke={F.gold3} />
          <rect x={X} y={Y + (a - bb) * u} width={a * u} height={bb * u} fill={F.gold} opacity="0.85" stroke={F.gold3} />
          <rect x={X + (a - bb) * u} y={Y + (a - bb) * u} width={bb * u} height={bb * u} fill={F.rosa} stroke={F.rosaKraeftig} strokeWidth="1.6" />
          <Txt x={X + ((a - bb) * u) / 2} y={Y + ((a - bb) * u) / 2 + 5} farbe={F.see} gr={13}>(a − b)²</Txt>
          <Txt x={X + a * u + 10} y={Y + (a * u) / 2} anker="start" gr={11} farbe={F.gold3}>− 2ab</Txt>
          <Txt x={X + a * u + 10} y={Y + (a - bb / 2) * u + 4} anker="start" gr={11} farbe={F.rosaKraeftig}>+ b²</Txt>
        </svg>
        <Regler label="a" wert={a} setze={setA} min={2} max={7} schritt={1} anzeige={a} />
        <Regler label="b" wert={bb} setze={setB} min={1} max={a - 1} schritt={1} anzeige={bb} />
        <Messzeile><M t={`(${a} - ${bb})^2 = ${a * a} - ${2 * a * bb} + ${bb * bb} = ${(a - bb) ** 2}`} /></Messzeile>
      </div>
    );
  }
  if (modus === "drei") {
    const bb = Math.min(b, a - 1);
    const s = u;
    const streifen = (1 - t);
    return (
      <div>
        <Hinweis>Vom Quadrat a² fehlt das Eck b². Klappt man den unteren Streifen nach rechts, entsteht ein Rechteck (a + b) mal (a − b).</Hinweis>
        <svg viewBox="0 0 340 210" style={svgStil} role="img" aria-label="Dritte binomische Formel: Umklappen eines Streifens">
          <rect x={X} y={Y} width={a * s} height={(a - bb) * s} fill={F.blau} stroke={F.see} strokeWidth="1.5" />
          {(() => {
            const x0 = X, y0 = Y + (a - bb) * s;
            const zx = X + a * s, zy = Y;
            const w0 = (a - bb) * s, h0 = bb * s;
            const x = x0 + (zx - x0) * t, y = y0 + (zy - y0) * t;
            const rot = 90 * t;
            return <g transform={`translate(${x} ${y}) rotate(${rot} 0 0) translate(0 ${-h0 * t})`}><rect x={0} y={0} width={w0} height={h0} fill={F.gold} stroke={F.gold3} strokeWidth="1.5" /></g>;
          })()}
          {streifen > 0.02 && <rect x={X + (a - bb) * s} y={Y + (a - bb) * s} width={bb * s} height={bb * s} fill="none" stroke={F.rosaKraeftig} strokeDasharray="4 3" />}
          {t < 0.1 && <Txt x={X + (a - bb / 2) * s} y={Y + (a - bb / 2) * s + 4} gr={11} farbe={F.rosaKraeftig}>b²</Txt>}
        </svg>
        <Regler label="umklappen" wert={t} setze={setT} min={0} max={1} />
        <Regler label="a" wert={a} setze={setA} min={2} max={7} schritt={1} anzeige={a} />
        <Regler label="b" wert={bb} setze={setB} min={1} max={a - 1} schritt={1} anzeige={bb} />
        <Messzeile><M t={`${a}^2 - ${bb}^2 = ${a * a - bb * bb} = (${a} + ${bb})(${a} - ${bb})`} /></Messzeile>
      </div>
    );
  }
  /* Quadratische Ergänzung */
  const p = b * 2;
  return (
    <div>
      <Hinweis>x² + px: Den Streifen p · x teilt man in zwei Hälften und legt sie an zwei Seiten. Zum vollen Quadrat fehlt nur das Eck (p/2)².</Hinweis>
      <svg viewBox="0 0 340 220" style={svgStil} role="img" aria-label="Quadratische Ergänzung als Fläche">
        <rect x={X} y={Y} width={a * u} height={a * u} fill={F.blau} stroke={F.see} strokeWidth="1.5" />
        <rect x={X + a * u} y={Y} width={b * u} height={a * u} fill={F.gold} stroke={F.gold3} strokeWidth="1.5" />
        <rect x={X} y={Y + a * u} width={a * u} height={b * u} fill={F.gold} stroke={F.gold3} strokeWidth="1.5" />
        <rect x={X + a * u} y={Y + a * u} width={b * u} height={b * u} fill={t > 0.5 ? F.rosa : "none"} stroke={F.rosaKraeftig} strokeWidth="1.6" strokeDasharray={t > 0.5 ? undefined : "5 3"} />
        <Txt x={X + (a * u) / 2} y={Y + (a * u) / 2 + 5} farbe={F.see} gr={15}>x²</Txt>
        <Txt x={X + a * u + (b * u) / 2} y={Y + (a * u) / 2 + 5} farbe={F.gold3} gr={11}>p/2 · x</Txt>
        <Txt x={X + a * u + (b * u) / 2} y={Y + a * u + (b * u) / 2 + 4} farbe={F.rosaKraeftig} gr={10}>(p/2)²</Txt>
      </svg>
      <Umschalter label="Eck" wert={t > 0.5} setze={(v) => setT(v ? 1 : 0)} optionen={[[false, "fehlt noch"], [true, "ergänzt"]]} />
      <Regler label="p" wert={b} setze={setB} min={1} max={4} schritt={0.5} anzeige={z(p)} />
      <Messzeile><M t={`x^2 + ${z(p)}x = (x + ${z(b)})^2 - ${z(b * b)}`} /></Messzeile>
    </div>
  );
}

/* ======================= Potenzen: Faktoren zählen ======================= */
function PotenzKetten({ negativ = false }) {
  const [m, setM] = useState(3);
  const [n, setN] = useState(2);
  if (negativ) {
    const reihe = [3, 2, 1, 0, -1, -2];
    return (
      <div>
        <Hinweis>Jeder Schritt nach rechts ist »durch 2«. So setzt sich das Muster über 2⁰ hinaus fort.</Hinweis>
        <svg viewBox="0 0 340 120" style={svgStil} role="img" aria-label="Zweierpotenzen von 2 hoch 3 bis 2 hoch minus 2">
          {reihe.map((e, i) => (
            <g key={e}>
              <rect x={10 + i * 55} y={30} width="48" height="46" rx="10" fill={e === 0 ? F.gold2 : e < 0 ? F.rosa : F.blau} stroke={e === 0 ? F.gold3 : e < 0 ? F.rosaKraeftig : F.see} />
              <Txt x={34 + i * 55} y={50} gr={12}>{"2" + String(e).replace("-", "⁻").replace(/\d/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d])}</Txt>
              <Txt x={34 + i * 55} y={68} gr={12} farbe={F.see}>{e >= 0 ? String(2 ** e) : `1/${2 ** -e}`}</Txt>
              {i < reihe.length - 1 && <Txt x={61 + i * 55} y={98} gr={10} farbe={F.grau}>: 2</Txt>}
            </g>
          ))}
        </svg>
      </div>
    );
  }
  const kaesten = (anz, x0, farbe, rand) => Array.from({ length: anz }, (_, i) => (
    <g key={i}><rect x={x0 + i * 30} y={40} width="26" height="34" rx="7" fill={farbe} stroke={rand} /><Txt x={x0 + i * 30 + 13} y={62} gr={14} farbe={rand}>a</Txt></g>
  ));
  return (
    <div>
      <Hinweis>aᵐ sind m Faktoren a. Mal aⁿ kommen n weitere dazu – zusammen m + n.</Hinweis>
      <svg viewBox="0 0 340 110" style={svgStil} role="img" aria-label="Faktoren a nebeneinander gezählt">
        {kaesten(m, 10, F.blau, F.see)}
        {kaesten(n, 10 + m * 30 + 14, F.gold, F.gold3)}
        <Txt x={10 + m * 30 + 4} y={62} gr={14}>·</Txt>
        <line x1={10} x2={10 + (m + n) * 30 + 10} y1={88} y2={88} stroke={F.rosaKraeftig} strokeWidth="2" />
        <Txt x={10 + ((m + n) * 30 + 10) / 2} y={104} gr={11} farbe={F.rosaKraeftig}>{`${m + n} Faktoren`}</Txt>
      </svg>
      <Regler label="m" wert={m} setze={setM} min={1} max={5} schritt={1} anzeige={m} />
      <Regler label="n" wert={n} setze={setN} min={1} max={4} schritt={1} anzeige={n} />
      <Messzeile><M t={`a^{${m}} \\cdot a^{${n}} = a^{${m + n}}`} /></Messzeile>
    </div>
  );
}

/* ======================= Logarithmus: Leiter ======================= */
function LogLeiter({ modus }) {
  const [u, setU] = useState(4);
  const [v, setV] = useState(8);
  const s = 36, X = 20;
  const px = (x) => X + Math.log2(x) * s;
  const marken = [1, 2, 4, 8, 16, 32, 64, 128, 256];
  return (
    <div>
      <Hinweis>{modus === "produkt" ? "Auf einer logarithmischen Skala werden aus Multiplikationen Additionen von Strecken – das Prinzip des Rechenschiebers."
        : "Oben die Zahlen, unten ihre Exponenten zur Basis 2. Der Logarithmus übersetzt von oben nach unten."}</Hinweis>
      <svg viewBox="0 0 340 130" style={svgStil} role="img" aria-label="Logarithmische Skala">
        <line x1={X} x2={X + 8.4 * s} y1={50} y2={50} stroke={F.tinte} strokeWidth="1.5" />
        {marken.map((m, i) => <g key={m}><line x1={px(m)} x2={px(m)} y1={44} y2={56} stroke={F.tinte} /><text x={px(m)} y={38} fontSize="10" textAnchor="middle" fill={F.tinte}>{m}</text><text x={px(m)} y={72} fontSize="10" textAnchor="middle" fill={F.gold3}>{i}</text></g>)}
        {modus === "produkt" && <>
          <line x1={px(1)} x2={px(u)} y1={90} y2={90} stroke={F.see} strokeWidth="5" />
          <line x1={px(u)} x2={px(u * v)} y1={90} y2={90} stroke={F.rosaKraeftig} strokeWidth="5" />
          <Txt x={(px(1) + px(u)) / 2} y={110} gr={11} farbe={F.see}>{`log ${u}`}</Txt>
          <Txt x={(px(u) + px(u * v)) / 2} y={110} gr={11} farbe={F.rosaKraeftig}>{`log ${v}`}</Txt>
          <Punkt x={px(u * v)} y={50} farbe={F.rosaKraeftig} />
        </>}
        {!modus && <Punkt x={px(u)} y={50} farbe={F.see} />}
      </svg>
      <Umschalter label="u" wert={u} setze={setU} optionen={[[2, "2"], [4, "4"], [8, "8"], [16, "16"]]} />
      {modus === "produkt" && <Umschalter label="v" wert={v} setze={setV} optionen={[[2, "2"], [4, "4"], [8, "8"], [16, "16"]]} />}
      <Messzeile>
        {modus === "produkt" ? <M t={`\\log_2(${u} \\cdot ${v}) = \\log_2 ${u} + \\log_2 ${v} = ${Math.log2(u)} + ${Math.log2(v)} = ${Math.log2(u * v)}`} />
          : <M t={`2^{${Math.log2(u)}} = ${u} \\;\\Leftrightarrow\\; \\log_2 ${u} = ${Math.log2(u)}`} />}
      </Messzeile>
    </div>
  );
}

/* ======================= Brüche als Streifen ======================= */
function BruchStreifen({ modus = "kuerzen" }) {
  const [k, setK] = useState(2);
  const [p, setP] = useState(19);
  const W = 300, X = 20;
  const streifen = (y, nenner, zaehler, farbe, rand, h = 34) => Array.from({ length: nenner }, (_, i) => (
    <rect key={`${y}-${i}`} x={X + (i * W) / nenner} y={y} width={W / nenner - 2} height={h} rx="4" fill={i < zaehler ? farbe : "#F4F6FA"} stroke={i < zaehler ? rand : F.achse} strokeWidth="0.8" />
  ));
  if (modus === "prozent") {
    return (
      <div>
        <Hinweis>Prozent heißt »von hundert«: p % sind p von 100 gleichen Teilen.</Hinweis>
        <svg viewBox="0 0 340 230" style={svgStil} role="img" aria-label="Hunderterfeld mit markierten Prozent">
          {Array.from({ length: 100 }, (_, i) => <rect key={i} x={70 + (i % 10) * 20} y={14 + Math.floor(i / 10) * 20} width="18" height="18" rx="3" fill={i < p ? F.gold2 : "#F4F6FA"} stroke={i < p ? F.gold3 : F.achse} strokeWidth="0.6" />)}
        </svg>
        <Regler label="p" wert={p} setze={setP} min={0} max={100} schritt={1} anzeige={`${p} %`} />
        <Messzeile>{p} % von 250: <M t={`250 \\cdot \\frac{${p}}{100} = ${z(2.5 * p)}`} /></Messzeile>
      </div>
    );
  }
  if (modus === "mal") {
    return (
      <div>
        <Hinweis>⅔ von ⅘: Waagerecht in 5 Spalten, senkrecht in 3 Zeilen. In beiden Anteilen liegen 8 von 15 Feldern.</Hinweis>
        <svg viewBox="0 0 340 170" style={svgStil} role="img" aria-label="Rechteck mit Bruchteilen in beide Richtungen">
          {Array.from({ length: 15 }, (_, i) => { const sp = i % 5, ze = Math.floor(i / 5); const inA = sp < 4, inB = ze < 2; return <rect key={i} x={X + 40 + sp * 46} y={14 + ze * 46} width="44" height="44" rx="5" fill={inA && inB ? F.gold2 : inA ? F.blau : "#F4F6FA"} stroke={inA && inB ? F.gold3 : F.achse} strokeWidth="0.8" />; })}
        </svg>
        <Messzeile><M t={"\\frac{2}{3} \\cdot \\frac{4}{5} = \\frac{2 \\cdot 4}{3 \\cdot 5} = \\frac{8}{15}"} /></Messzeile>
      </div>
    );
  }
  if (modus === "addieren") {
    return (
      <div>
        <Hinweis>Viertel und Sechstel lassen sich nicht direkt zusammenzählen. In Zwölftel geschnitten schon.</Hinweis>
        <svg viewBox="0 0 340 200" style={svgStil} role="img" aria-label="Brüche mit gemeinsamem Nenner">
          {streifen(14, 4, 1, F.blau, F.see)}
          {streifen(56, 6, 1, F.gold, F.gold3)}
          {streifen(110, 12, 3, F.blau, F.see)}
          {Array.from({ length: 2 }, (_, i) => <rect key={i} x={X + ((3 + i) * W) / 12} y={110} width={W / 12 - 2} height={34} rx="4" fill={F.gold} stroke={F.gold3} strokeWidth="0.8" />)}
          <Txt x={X + W + 2} y={36} anker="end" gr={11}>¼</Txt>
          <Txt x={X + W + 2} y={78} anker="end" gr={11}>⅙</Txt>
          <Txt x={X + W / 2} y={170} gr={12}>3/12 + 2/12 = 5/12</Txt>
        </svg>
        <Messzeile><M t={"\\frac{1}{4} + \\frac{1}{6} = \\frac{3}{12} + \\frac{2}{12} = \\frac{5}{12}"} /></Messzeile>
      </div>
    );
  }
  return (
    <div>
      <Hinweis>Schneidet man jedes Stück in k Teile, ändert sich die Menge nicht: ⅔ = 4/6 = 6/9 …</Hinweis>
      <svg viewBox="0 0 340 110" style={svgStil} role="img" aria-label="Zwei gleich große Bruchteile mit verschiedenen Nennern">
        {streifen(14, 3, 2, F.blau, F.see)}
        {streifen(60, 3 * k, 2 * k, F.gold, F.gold3)}
      </svg>
      <Regler label="k" wert={k} setze={setK} min={1} max={6} schritt={1} anzeige={k} />
      <Messzeile><M t={`\\frac{2}{3} = \\frac{2 \\cdot ${k}}{3 \\cdot ${k}} = \\frac{${2 * k}}{${3 * k}}`} /></Messzeile>
    </div>
  );
}

export const BILDER_4 = {
  flaechen: (p) => <Flaechen {...p} />,
  kreis: (p) => <Kreis {...p} />,
  koerper: (p) => <Koerper {...p} />,
  dreieckAllg: (p) => <DreieckAllg {...p} />,
  strahlensatz: (p) => <Strahlensatz {...p} />,
  thales: (p) => <Thales {...p} />,
  pythagoras: (p) => <Pythagoras {...p} />,
  rechtwinklig: (p) => <Rechtwinklig {...p} />,
  trigDreieck: (p) => <TrigDreieck {...p} />,
  einheitskreis: (p) => <Einheitskreis {...p} />,
  additionstheorem: (p) => <Additionstheorem {...p} />,
  binomQuadrat: (p) => <BinomQuadrat {...p} />,
  potenzKetten: (p) => <PotenzKetten {...p} />,
  logleiter: (p) => <LogLeiter {...p} />,
  bruchStreifen: (p) => <BruchStreifen {...p} />,
};
