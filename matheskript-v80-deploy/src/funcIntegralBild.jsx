/* ============================================================
   Integraltrainer – Schaubild
   Oben f mit der Fläche (grün zählt positiv, rot negativ), unten – wo es
   hilft – die Stammfunktion F: Der Höhenunterschied F(b) − F(a) ist genau
   die Fläche oben. „Fläche wachsen lassen“ schiebt die rechte Grenze t von
   a nach b; oben wächst die Fläche, unten wandert der Punkt auf F mit.
   Weitere Ansichten: Rechteck-Streifen (Mittelpunktsumme), Stammfunktions-
   schar mit parallelen Tangenten (F′ = f), Punkt P mit der passenden Kurve,
   zwei Graphen mit „g auf die x-Achse ziehen“ (Differenzfunktion).
   Echte Pixel (useBreite), Beschriftungen mit Brüchen als HTML über dem SVG.
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { useBreite } from "./arbeitsflaeche.jsx";

const GRUEN = C.smaragd, ROT = C.signal, F_FARBE = C.gruen, f_FARBE = C.see;
const endlich = (v) => typeof v === "number" && Number.isFinite(v);
const komma = (v, st = 2) => { const r = Math.round(v * 10 ** st) / 10 ** st; return String(Object.is(r, -0) ? 0 : r).replace(".", ",").replace("-", "−"); };
const kommaTex = (v, st = 2) => komma(v, st).replace(",", "{,}");
const gleich = (t) => (/^≈/.test(t) ? t : `= ${t}`);

/* ---------- Mathe-Helfer fürs Bild ---------- */

function schritt(span, ziel) {
  const roh = span / ziel, p = 10 ** Math.floor(Math.log10(roh)), m = roh / p;
  return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
}
const PI_TEX = (k) => {                                 // k · π/2
  if (k === 0) return "0";
  const g = k % 2 === 0, z = g ? k / 2 : k, vor = z < 0 ? "−" : "", a = Math.abs(z);
  if (g) return `${vor}${a === 1 ? "" : a}π`;
  return `${vor}${a === 1 ? "" : a}π/2`;
};
function wertebereich(fns, lo, hi, mitNull = true) {
  const w = [];
  for (const fn of fns) for (let i = 0; i <= 240; i++) { const y = fn(lo + ((hi - lo) * i) / 240); if (endlich(y)) w.push(y); }
  if (!w.length) return [-1, 1];
  w.sort((a, b) => a - b);
  let yMin = w[0], yMax = w[w.length - 1];
  if (yMax - yMin > 40) { yMin = w[Math.floor(w.length * 0.06)]; yMax = w[Math.floor(w.length * 0.94)]; }
  if (mitNull) { yMin = Math.min(yMin, 0); yMax = Math.max(yMax, 0); }
  if (yMax - yMin < 1e-9) { yMin -= 1; yMax += 1; }
  const p = (yMax - yMin) * 0.14;
  return [yMin - p, yMax + p];
}
/* Teilstücke von [u; v], auf denen h ein festes Vorzeichen hat */
function vorzeichenStuecke(h, u, v) {
  const N = 240, st = [];
  let von = u, s0 = 0;
  const vz = (x) => { const y = h(x); return endlich(y) ? Math.sign(Math.abs(y) < 1e-12 ? 0 : y) : 0; };
  for (let i = 1; i <= N; i++) {
    const x = u + ((v - u) * i) / N, s = vz(x);
    if (!s) continue;
    if (!s0) { s0 = s; continue; }
    if (s !== s0) {
      let l = u + ((v - u) * (i - 1)) / N, r = x;
      for (let k = 0; k < 40; k++) { const m = (l + r) / 2; if (vz(m) === s0) l = m; else r = m; }
      st.push({ von, bis: (l + r) / 2, s: s0 }); von = (l + r) / 2; s0 = s;
    }
  }
  st.push({ von, bis: v, s: s0 || 1 });
  return st;
}

/* ---------- Bausteine ---------- */

function Marke({ x, y, children, farbe = C.tinte, rand, klein, unter, w }) {
  const links = Math.max(8, Math.min(w - 8, x));
  return (
    <div className="ib-marke" style={{
      left: links, top: y, transform: `translate(${links < 60 ? "-15%" : links > w - 60 ? "-85%" : "-50%"}, ${unter ? "0" : "-50%"})`, color: farbe,
      borderColor: rand || "transparent", fontSize: klein ? 12 : 13.5, padding: klein ? "1px 6px" : "2px 8px",
    }}>{children}</div>
  );
}

/* Punkt nur zeichnen, wenn die Koordinaten endlich sind (Polstellen, Definitionslücken) */
const Kreis = ({ cx, cy, ...rest }) => (endlich(cx) && endlich(cy) ? <circle cx={cx} cy={cy} {...rest} /> : null);

/* Pfad einer Funktion, mit Lücken an Polstellen */
function kurvenPfad(fn, lo, hi, sx, sy, yLo, yHi, N = 320) {
  let d = "", offen = false, vorY = null;
  const span = yHi - yLo;
  for (let i = 0; i <= N; i++) {
    const x = lo + ((hi - lo) * i) / N, y = fn(x);
    if (!endlich(y) || y < yLo - 3 * span || y > yHi + 3 * span) { offen = false; vorY = null; continue; }
    const py = sy(Math.max(yLo - span, Math.min(yHi + span, y)));
    if (offen && vorY !== null && Math.abs(py - vorY) > 400) offen = false;
    d += `${offen ? "L" : "M"}${sx(x).toFixed(1)},${py.toFixed(1)}`;
    offen = true; vorY = py;
  }
  return d;
}
/* Fläche zwischen f und Basis (0 oder g) über [u; v] */
function flaechenPfad(fn, basis, u, v, sx, sy, yLo, yHi) {
  const N = Math.max(8, Math.round(Math.abs(v - u) * 60)), span = yHi - yLo;
  const k = (y) => sy(Math.max(yLo - span, Math.min(yHi + span, endlich(y) ? y : 0)));
  let d = `M${sx(u).toFixed(1)},${k(basis(u)).toFixed(1)}`;
  for (let i = 0; i <= N; i++) { const x = u + ((v - u) * i) / N; d += `L${sx(x).toFixed(1)},${k(fn(x)).toFixed(1)}`; }
  for (let i = N; i >= 0; i--) { const x = u + ((v - u) * i) / N; d += `L${sx(x).toFixed(1)},${k(basis(x)).toFixed(1)}`; }
  return `${d}Z`;
}

function Achsen({ W, H, sx, sy, xLo, xHi, yLo, yHi, piSkala, id }) {
  const xs = [], ys = [];
  if (piSkala) { for (let k = Math.ceil(xLo / (Math.PI / 2)); k * (Math.PI / 2) <= xHi; k++) xs.push({ v: k * (Math.PI / 2), t: PI_TEX(k) }); }
  else { const s = schritt(xHi - xLo, W < 420 ? 6 : 9); for (let v = Math.ceil(xLo / s) * s; v <= xHi + 1e-9; v += s) xs.push({ v, t: komma(v) }); }
  const sy0 = schritt(yHi - yLo, H < 180 ? 3 : 5);
  for (let v = Math.ceil(yLo / sy0) * sy0; v <= yHi + 1e-9; v += sy0) ys.push({ v, t: komma(v) });
  const ax = Math.max(4, Math.min(H - 4, sy(0))), ay = Math.max(4, Math.min(W - 4, sx(0)));
  const xZahlUnten = ax < H - 18;
  return (
    <g aria-hidden="true">
      {xs.map(({ v }) => <line key={`gx${v}`} x1={sx(v)} x2={sx(v)} y1={0} y2={H} stroke="#EEF2F8" strokeWidth="1" />)}
      {ys.map(({ v }) => <line key={`gy${v}`} x1={0} x2={W} y1={sy(v)} y2={sy(v)} stroke="#EEF2F8" strokeWidth="1" />)}
      <line x1={0} x2={W - 2} y1={ax} y2={ax} stroke={C.tinte} strokeWidth="1.2" markerEnd={`url(#${id}-pfeil)`} />
      <line x1={ay} x2={ay} y1={H} y2={2} stroke={C.tinte} strokeWidth="1.2" markerEnd={`url(#${id}-pfeil)`} />
      {xs.filter(({ v }) => Math.abs(v) > 1e-9 && sx(v) > 10 && sx(v) < W - 14).map(({ v }) => (
        <line key={`tx${v}`} x1={sx(v)} x2={sx(v)} y1={ax - 3} y2={ax + 3} stroke={C.tinte} strokeWidth="1" />
      ))}
      {ys.filter(({ v }) => Math.abs(v) > 1e-9 && sy(v) > 10 && sy(v) < H - 8).map(({ v }) => (
        <line key={`ty${v}`} x1={ay - 3} x2={ay + 3} y1={sy(v)} y2={sy(v)} stroke={C.tinte} strokeWidth="1" />
      ))}
    </g>
  );
}
/* Achsenzahlen zuletzt zeichnen – mit weißem Rand, damit Grenzlinien sie nicht verdecken */
function AchsenZahlen({ W, H, sx, sy, xLo, xHi, yLo, yHi, piSkala }) {
  const xs = [], ys = [];
  if (piSkala) { for (let k = Math.ceil(xLo / (Math.PI / 2)); k * (Math.PI / 2) <= xHi; k++) xs.push({ v: k * (Math.PI / 2), t: PI_TEX(k) }); }
  else { const s = schritt(xHi - xLo, W < 420 ? 6 : 9); for (let v = Math.ceil(xLo / s) * s; v <= xHi + 1e-9; v += s) xs.push({ v, t: komma(v) }); }
  const sy0 = schritt(yHi - yLo, H < 180 ? 3 : 5);
  for (let v = Math.ceil(yLo / sy0) * sy0; v <= yHi + 1e-9; v += sy0) ys.push({ v, t: komma(v) });
  const ax = Math.max(4, Math.min(H - 4, sy(0))), ay = Math.max(4, Math.min(W - 4, sx(0)));
  const unten = ax < H - 18;
  const halo = { paintOrder: "stroke", stroke: "#fff", strokeWidth: 3, strokeLinejoin: "round" };
  return (
    <g aria-hidden="true">
      {xs.filter(({ v }) => Math.abs(v) > 1e-9 && sx(v) > 10 && sx(v) < W - 14).map(({ v, t }) => (
        <text key={`zx${v}`} x={sx(v)} y={unten ? ax + 14 : ax - 7} fontSize="10.5" textAnchor="middle" fill={C.grau} style={halo}>{t}</text>
      ))}
      {ys.filter(({ v }) => Math.abs(v) > 1e-9 && sy(v) > 10 && sy(v) < H - 8).map(({ v, t }) => (
        <text key={`zy${v}`} x={ay > 34 ? ay - 6 : ay + 6} y={sy(v) + 3.5} fontSize="10.5" textAnchor={ay > 34 ? "end" : "start"} fill={C.grau} style={halo}>{t}</text>
      ))}
    </g>
  );
}

const pfeilDef = (id, farbe = C.tinte) => (
  <marker id={`${id}-pfeil`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" fill={farbe} />
  </marker>
);

/* ---------- Hauptbaustein ---------- */

/* sicht: was schon „entdeckt“ ist (Training: gelöste Schritte; Automatik: alles)
   { F, Fb, Fa, I, null, teile: [bool], A, d, schar, punkt, kurve } – fokus: Schritt, der gerade dran ist */
export function IntegralBild({ bild, sicht = {}, fokus, aufgabeId }) {
  const [ref, breite] = useBreite();
  const W = Math.max(280, breite || 360);
  const id = useMemo(() => `ib${Math.random().toString(36).slice(2, 8)}`, []);
  const art = bild.art;
  const mitUnten = art === "bestimmt" || art === "stamm" || art === "anfang";
  const H1 = Math.round(Math.max(200, Math.min(mitUnten ? 300 : 360, W * (mitUnten ? 0.6 : 0.74))));
  const H2 = mitUnten ? Math.round(Math.max(140, Math.min(220, W * 0.4))) : 0;
  const L = 8, R = 8, T = 10, B = 10;

  /* ---------- Fenster ---------- */
  const [xLo, xHi] = useMemo(() => {
    if (bild.fenster) return bild.fenster;
    const pkt = [bild.a, bild.b, 0, ...(bild.nullstellen || [])].filter(endlich);
    const lo = Math.min(...pkt), hi = Math.max(...pkt), span = hi - lo || 2, p = Math.max(0.6, span * 0.16);
    return [lo - p, hi + p];
  }, [bild]);
  const piSkala = [bild.a, bild.b].some((v) => endlich(v) && Math.abs(v) > 1 && Math.abs((v / Math.PI) * 2 - Math.round((v / Math.PI) * 2)) < 1e-9);

  /* ---------- Zustand: Rand t, Streifen, Stelle x₀, Verschiebung ---------- */
  const a = bild.a, b = bild.b;
  const [t, setT] = useState(null);                 // null = ganze Fläche
  const [laeuft, setLaeuft] = useState(false);
  const [streifen, setStreifen] = useState(0);
  const [x0, setX0] = useState(() => (art === "anfang" ? bild.x0 : 1));
  const [schieb, setSchieb] = useState(0);          // 0 … 1: g auf die x-Achse ziehen
  const anim = useRef(0);
  useEffect(() => { cancelAnimationFrame(anim.current); setLaeuft(false); setT(null); setStreifen(0); setSchieb(0); setX0(art === "anfang" ? bild.x0 : Math.min(xHi - 0.5, Math.max(xLo + 0.5, 1))); }, [aufgabeId]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => cancelAnimationFrame(anim.current), []);

  const wachsen = () => {
    if (!endlich(a) || !endlich(b)) return;
    cancelAnimationFrame(anim.current);
    let still = false;
    try { still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { /* egal */ }
    if (still) { setT(null); return; }
    const start = performance.now(), dauer = 2600;
    setLaeuft(true);
    const schrittA = (jetzt) => {
      const p = Math.min(1, (jetzt - start) / dauer), e = p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2;
      setT(a + (b - a) * e);
      if (p < 1) anim.current = requestAnimationFrame(schrittA);
      else { setLaeuft(false); setT(null); }
    };
    anim.current = requestAnimationFrame(schrittA);
  };
  // Sobald das Integral „entdeckt“ ist: einmal wachsen lassen
  const warI = useRef(false), letzteId = useRef(null);
  useEffect(() => {
    const neueAufgabe = letzteId.current !== aufgabeId;
    letzteId.current = aufgabeId;
    if (art !== "bestimmt") { warI.current = false; return; }
    if (sicht.I && (!warI.current || neueAufgabe)) wachsen();
    warI.current = !!sicht.I;
  }, [sicht.I, aufgabeId]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- Funktionen je Ansicht ---------- */
  const fn = bild.fn;
  const gn = art === "zwei" ? bild.gn : null;
  const fZ = art === "zwei" ? (x) => fn(x) - schieb * gn(x) : fn;          // oben gezeichnetes f
  const gZ = art === "zwei" ? (x) => (1 - schieb) * gn(x) : () => 0;        // Basis der Fläche

  const [yLo, yHi] = useMemo(() => {
    const fns = art === "zwei" ? [fn, gn, bild.dn] : [fn];
    const kern = endlich(a) && endlich(b) && art !== "stamm" && art !== "anfang" ? [Math.min(a, b), Math.max(a, b)] : [xLo, xHi];
    const [k0, k1] = wertebereich(fns, kern[0], kern[1]);
    const [g0, g1] = wertebereich(fns, xLo, xHi);
    const span = k1 - k0;
    return [Math.max(g0, k0 - span * 0.35), Math.min(g1, k1 + span * 0.35)];
  }, [bild, xLo, xHi]); // eslint-disable-line react-hooks/exhaustive-deps
  const sx = (x) => L + ((x - xLo) / (xHi - xLo)) * (W - L - R);
  const sy = (y) => T + ((yHi - y) / (yHi - yLo)) * (H1 - T - B);

  /* unten: F bzw. Schar */
  const Fn = bild.Fn;
  const scharS = useMemo(() => {
    if (!mitUnten || art === "bestimmt") return 0;
    const [u0, u1] = wertebereich([Fn], xLo, xHi, false);
    return schritt(Math.max(1, (u1 - u0) * 0.9), 4);
  }, [bild, xLo, xHi]); // eslint-disable-line react-hooks/exhaustive-deps
  const scharC = art === "stamm" ? [-2, -1, 0, 1, 2].map((k) => k * scharS)
    : art === "anfang" ? [-2, -1, 0, 1, 2].map((k) => bild.C + k * scharS) : [0];
  const [uLo, uHi] = useMemo(() => {
    if (!mitUnten) return [0, 1];
    const fns = scharC.map((c) => (x) => Fn(x) + c);
    const r = wertebereich(fns, xLo, xHi, art === "bestimmt");
    if (art === "anfang") return [Math.min(r[0], bild.y0 - 0.5), Math.max(r[1], bild.y0 + 0.5)];
    return r;
  }, [bild, xLo, xHi, scharS]); // eslint-disable-line react-hooks/exhaustive-deps
  const su = (y) => H1 + T + ((uHi - y) / (uHi - uLo)) * (H2 - T - B);

  /* ---------- Ziehen im Bild ---------- */
  const svgRef = useRef(null);
  const zieh = useRef(false);
  const xAusZeiger = (e) => {
    const r = svgRef.current.getBoundingClientRect();
    return xLo + ((e.clientX - r.left - L) / (r.width - L - R)) * (xHi - xLo);
  };
  const ziehbar = (art === "bestimmt" && sicht.I) || ((art === "stamm" || art === "anfang") && sicht.schar);
  const zeiger = (e) => {
    if (!ziehbar || !svgRef.current) return;
    const x = xAusZeiger(e);
    if (art === "bestimmt") { cancelAnimationFrame(anim.current); setLaeuft(false); setT(Math.max(Math.min(a, b), Math.min(Math.max(a, b), x))); }
    else setX0(Math.max(xLo + 0.2, Math.min(xHi - 0.2, x)));
  };

  /* ---------- oben: Flächen ---------- */
  const flaechen = [];
  const marken = [];
  const hell = (an) => (an ? 0.34 : 0.16);
  if (art === "bestimmt" && endlich(a) && endlich(b)) {
    const ende = t === null ? b : t;
    if (sicht.I || t !== null) {
      vorzeichenStuecke(fn, Math.min(a, ende), Math.max(a, ende)).forEach((st, i) => {
        if (Math.abs(st.bis - st.von) < 1e-9) return;
        flaechen.push(<path key={`b${i}`} d={flaechenPfad(fn, () => 0, st.von, st.bis, sx, sy, yLo, yHi)} fill={st.s > 0 ? GRUEN : ROT} fillOpacity={hell(fokus === "I")} className="ib-flaeche" />);
      });
    } else {
      // Noch offen: Intervall andeuten
      flaechen.push(<path key="offen" d={flaechenPfad(fn, () => 0, Math.min(a, b), Math.max(a, b), sx, sy, yLo, yHi)} fill={`url(#${id}-schraffur)`} stroke={C.hellgrau} strokeDasharray="3 4" strokeWidth="1" />);
      const xm = (a + b) / 2, ym = fn(xm) / 2;
      marken.push(<Marke key="frage" w={W} x={sx(xm)} y={sy(endlich(ym) ? ym : 0)} farbe={C.grau} rand={C.linie}><span style={{ fontWeight: 700 }}>?</span></Marke>);
    }
    if (sicht.I && t === null) {
      const xm = (a + b) / 2, ym = fn(xm) / 2;
      marken.push(<Marke key="iwert" w={W} x={sx(xm)} y={sy(endlich(ym) ? ym : 0)} farbe={bild.I >= 0 ? GRUEN : ROT} rand={bild.I >= 0 ? GRUEN : ROT}><M t={`\\int ${gleich(bild.ITex)}`} /></Marke>);
    }
  }
  if ((art === "flaeche" || art === "zwei") && bild.teile) {
    bild.teile.forEach((tl, i) => {
      const da = !!(sicht.teile && sicht.teile[i]) || sicht.A;
      const foc = fokus === `teil${i}` || fokus === "A";
      const s = Math.sign(tl.wert) || 1;
      flaechen.push(<path key={`t${i}`} d={flaechenPfad(fZ, gZ, tl.von, tl.bis, sx, sy, yLo, yHi)}
        fill={da ? (s > 0 ? GRUEN : ROT) : `url(#${id}-schraffur)`} fillOpacity={da ? hell(foc) : 1}
        stroke={da ? "none" : C.hellgrau} strokeDasharray="3 4" strokeWidth="1" className="ib-flaeche" />);
      const xm = (tl.von + tl.bis) / 2, ym = (fZ(xm) + gZ(xm)) / 2;
      marken.push(<Marke key={`tm${i}`} w={W} x={sx(xm)} y={sy(ym)} klein={!da} farbe={da ? (s > 0 ? GRUEN : ROT) : C.grau} rand={da ? (s > 0 ? GRUEN : ROT) : C.linie}>
        {da ? <M t={`${tl.name.replace("₁", "_{1}").replace("₂", "_{2}").replace("₃", "_{3}").replace("₄", "_{4}")} = ${tl.tex}`} /> : tl.name}
      </Marke>);
    });
  }

  /* Streifen (Mittelpunktsumme) */
  let streifenSumme = null;
  const streifenRects = [];
  if (streifen > 0 && endlich(a) && endlich(b)) {
    const n = streifen, w = (b - a) / n, basis = art === "zwei" ? gZ : () => 0;
    let summe = 0;
    for (let i = 0; i < n; i++) {
      const xm = a + (i + 0.5) * w, h = fZ(xm) - basis(xm);
      if (!endlich(h)) continue;
      summe += h * w;
      const y0 = sy(basis(xm)), y1 = sy(fZ(xm));
      streifenRects.push(<rect key={`s${i}`} x={sx(a + i * w)} width={Math.max(0.5, sx(a + (i + 1) * w) - sx(a + i * w))} y={Math.min(y0, y1)} height={Math.abs(y1 - y0)}
        fill={h >= 0 ? GRUEN : ROT} fillOpacity="0.16" stroke={h >= 0 ? GRUEN : ROT} strokeOpacity="0.7" strokeWidth="0.9" />);
    }
    streifenSumme = summe;
  }

  /* Grenzen, Nullstellen */
  const linien = [];
  if (endlich(a) && endlich(b) && (art === "bestimmt" || (art === "flaeche" && bild.grenzen))) {
    [[a, "a"], [b, "b"]].forEach(([x, n]) => {
      const foc = (n === "a" && fokus === "Fa") || (n === "b" && fokus === "Fb");
      linien.push(<line key={`g${n}`} x1={sx(x)} x2={sx(x)} y1={T} y2={H1 + H2 - B} stroke={C.goldWarm} strokeWidth={foc ? 2.2 : 1.4} strokeDasharray="5 4" />);
      const rechts = sx(x) < W - 24;
      linien.push(<text key={`gt${n}`} x={sx(x) + (rechts ? 5 : -5)} y={T + 11} fontSize="12.5" fontWeight="800" textAnchor={rechts ? "start" : "end"} fill={C.gruenDunkel}
        style={{ paintOrder: "stroke", stroke: "#fff", strokeWidth: 3 }}>{n}</text>);
    });
  }
  const punkte = [];
  if ((art === "flaeche" || art === "zwei") && bild.nullstellen && sicht.null) {
    bild.nullstellen.forEach((r, i) => {
      const y = art === "zwei" ? gZ(r) : 0;
      punkte.push(<Kreis key={`n${i}`} cx={sx(r)} cy={sy(y)} r={fokus === "null" ? 6 : 4.5} fill={art === "zwei" ? C.tinte : C.weiss} stroke={C.tinte} strokeWidth="1.8" className={fokus === "null" ? "ib-puls" : undefined} />);
    });
  }

  /* Rand t */
  const tAkt = t !== null && endlich(t);
  const tLinie = tAkt ? <line x1={sx(t)} x2={sx(t)} y1={T} y2={H1 + H2 - B} stroke={C.tinte} strokeWidth="1.4" strokeOpacity="0.55" /> : null;

  /* ---------- unten ---------- */
  const unten = [];
  const untenMarken = [];
  if (mitUnten) {
    const oben0 = H1;
    const zeigeF = art === "bestimmt" ? sicht.F : sicht.schar;
    if (!zeigeF) {
      untenMarken.push(<Marke key="uleer" w={W} x={W / 2} y={oben0 + H2 / 2} farbe={C.grau} klein>
        {art === "bestimmt" ? "Hier erscheint F, sobald du die Stammfunktion hast." : "Hier erscheinen die Stammfunktionen F."}
      </Marke>);
    } else {
      // Achse unten
      const ax = Math.max(oben0 + 4, Math.min(oben0 + H2 - 4, su(0))), ay = Math.max(4, Math.min(W - 4, sx(0)));
      unten.push(<line key="uax" x1={0} x2={W - 2} y1={ax} y2={ax} stroke={C.tinte} strokeWidth="1" strokeOpacity="0.7" markerEnd={`url(#${id}-pfeil)`} />);
      unten.push(<line key="uay" x1={ay} x2={ay} y1={oben0 + H2} y2={oben0 + 4} stroke={C.tinte} strokeWidth="1" strokeOpacity="0.7" markerEnd={`url(#${id}-pfeil)`} />);
      const ziel = art === "anfang" && sicht.kurve ? bild.C : art === "stamm" ? 0 : null;
      scharC.forEach((c, i) => {
        const haupt = art === "bestimmt" || (ziel !== null && Math.abs(c - ziel) < 1e-9);
        unten.push(<path key={`F${i}`} d={kurvenPfad((x) => Fn(x) + c, xLo, xHi, sx, su, uLo, uHi)} fill="none" stroke={F_FARBE}
          strokeWidth={haupt ? 2.6 : 1.6} strokeOpacity={art === "bestimmt" || haupt ? 1 : 0.45} strokeLinejoin="round" />);
      });
      // Tangenten an der Stelle x₀ (F′ = f)
      if (art === "stamm" || art === "anfang") {
        const m = fn(x0);
        if (endlich(m)) {
          const kx = (W - L - R) / (xHi - xLo), ky = (H2 - T - B) / (uHi - uLo);
          const dx = 30 / Math.sqrt(kx * kx + m * m * ky * ky);
          scharC.forEach((c, i) => {
            const y = Fn(x0) + c;
            if (!endlich(y)) return;
            unten.push(<line key={`tg${i}`} x1={sx(x0 - dx)} y1={su(y - m * dx)} x2={sx(x0 + dx)} y2={su(y + m * dx)} stroke={f_FARBE} strokeWidth="2" strokeLinecap="round" />);
            unten.push(<Kreis key={`tp${i}`} cx={sx(x0)} cy={su(y)} r="3" fill={f_FARBE} />);
          });
          untenMarken.push(<Marke key="steig" w={W} x={sx(x0)} y={oben0 + H2 - 14} farbe={f_FARBE} klein>alle Tangenten: Steigung {komma(m)}</Marke>);
        }
      }
      if (art === "anfang") {
        const py = su(bild.y0);
        unten.push(<Kreis key="P" cx={sx(bild.x0)} cy={py} r={fokus === "punkt" ? 7 : 5.5} fill={C.weiss} stroke={C.tinte} strokeWidth="2.2" className={fokus === "punkt" ? "ib-puls" : undefined} />);
        untenMarken.push(<Marke key="Pm" w={W} x={sx(bild.x0) + 14} y={py - 14} farbe={C.tinte}><b>P</b></Marke>);
      }
      if (art === "bestimmt" && endlich(a) && endlich(b)) {
        const Fa = Fn(a), Fb = Fn(b);
        const ende = tAkt ? t : b, Fe = Fn(ende);
        if (sicht.Fa || tAkt) unten.push(<Kreis key="pa" cx={sx(a)} cy={su(Fa)} r={fokus === "Fa" ? 6.5 : 5} fill={F_FARBE} stroke={C.weiss} strokeWidth="1.5" className={fokus === "Fa" ? "ib-puls" : undefined} />);
        if (sicht.Fb && !tAkt) unten.push(<Kreis key="pb" cx={sx(b)} cy={su(Fb)} r={fokus === "Fb" ? 6.5 : 5} fill={F_FARBE} stroke={C.weiss} strokeWidth="1.5" className={fokus === "Fb" ? "ib-puls" : undefined} />);
        if (sicht.Fa && !tAkt && !sicht.I) untenMarken.push(<Marke key="mFa" w={W} x={sx(a)} y={su(Fa) + (Fa > Fb ? -16 : 16)} farbe={F_FARBE} klein>F(a)</Marke>);
        if (sicht.Fb && !tAkt && !sicht.I) untenMarken.push(<Marke key="mFb" w={W} x={sx(b)} y={su(Fb) + (Fb > Fa ? -16 : 16)} farbe={F_FARBE} klein>F(b)</Marke>);
        if (sicht.I || tAkt) {
          const farbe = Fe - Fa >= 0 ? GRUEN : ROT;
          unten.push(<line key="hz" x1={sx(a)} x2={sx(ende)} y1={su(Fa)} y2={su(Fa)} stroke={C.hellgrau} strokeWidth="1.2" strokeDasharray="4 3" />);
          if (Math.abs(su(Fe) - su(Fa)) > 6) unten.push(<line key="pf" x1={sx(ende)} x2={sx(ende)} y1={su(Fa)} y2={su(Fe)} stroke={farbe} strokeWidth="3.5" markerEnd={`url(#${id}-pfeil-${Fe - Fa >= 0 ? "g" : "r"})`} />);
          unten.push(<Kreis key="pe" cx={sx(ende)} cy={su(Fe)} r="5" fill={F_FARBE} stroke={C.weiss} strokeWidth="1.5" />);
          const lx = sx(ende) + (sx(ende) > W - 120 ? -10 : 10);
          untenMarken.push(<Marke key="mdiff" w={W} x={lx + (sx(ende) > W - 120 ? -50 : 50)} y={(su(Fa) + su(Fe)) / 2} farbe={farbe} rand={farbe} klein>
            {tAkt ? <M t={`F(t) − F(a) ≈ ${kommaTex(Fe - Fa)}`} /> : <M t={`F(b) − F(a) ${gleich(bild.ITex)}`} />}
          </Marke>);
        }
      }
      untenMarken.push(<span key="uname" className="ib-name links" style={{ left: 10, top: oben0 + 6, color: F_FARBE }}>{art === "bestimmt" ? "F" : "F + C"}</span>);
    }
  }

  /* Stelle x₀ oben (stamm/anfang) */
  const obenX0 = [];
  if ((art === "stamm" || art === "anfang") && sicht.schar) {
    const y = fn(x0);
    if (endlich(y)) {
      obenX0.push(<line key="x0l" x1={sx(x0)} x2={sx(x0)} y1={T} y2={H1 + H2 - B} stroke={f_FARBE} strokeWidth="1.2" strokeDasharray="3 4" strokeOpacity="0.6" />);
      obenX0.push(<line key="x0h" x1={sx(x0)} x2={sx(x0)} y1={sy(0)} y2={sy(y)} stroke={f_FARBE} strokeWidth="3" strokeOpacity="0.35" />);
      obenX0.push(<Kreis key="x0p" cx={sx(x0)} cy={sy(y)} r="5.5" fill={f_FARBE} stroke={C.weiss} strokeWidth="1.5" />);
      marken.push(<Marke key="x0m" w={W} x={sx(x0) + (sx(x0) > W - 110 ? -48 : 48)} y={sy(y) - 4} farbe={f_FARBE} rand={f_FARBE} klein>f(x₀) = {komma(y)}</Marke>);
    }
  }

  /* Kurvennamen */
  const nameBei = (fun, farbe, n, links = false) => {
    if (!n) return null;
    const kandidaten = links ? [0.07, 0.15, 0.24] : [0.92, 0.84, 0.76, 0.66];
    for (const k of kandidaten) {
      const xs = xLo + (xHi - xLo) * k, y = fun(xs);
      if (!endlich(y) || y < yLo || y > yHi) continue;
      const py = sy(y) + (y > (yLo + yHi) / 2 ? 6 : -24);
      if (Math.abs(py + 10 - sy(0)) < 16 || py < 2 || py > H1 - 20) continue;
      return <span key={`nm${n}`} className="ib-name" style={{ left: sx(xs), top: py, color: farbe }}>{n}</span>;
    }
    return null;
  };

  const Hges = H1 + H2;
  const beschreibung = art === "bestimmt" ? `Schaubild von f mit der Fläche zwischen a und b${mitUnten ? ", darunter die Stammfunktion F" : ""}`
    : art === "flaeche" ? "Schaubild von f mit den Teilflächen zwischen Graph und x-Achse" : art === "zwei" ? "Schaubild von f und g mit der eingeschlossenen Fläche"
      : "Schaubild von f, darunter Stammfunktionen F mit Tangenten";

  return (
    <div className="ib-wrap">
      <style>{IB_CSS}</style>
      <div ref={ref} className="ib-buehne" style={{ height: Hges }}>
        <svg ref={svgRef} viewBox={`0 0 ${W} ${Hges}`} width={W} height={Hges} role="img" aria-label={beschreibung}
          style={{ display: "block", touchAction: ziehbar ? "none" : "auto", cursor: ziehbar ? "ew-resize" : "default" }}
          onPointerDown={(e) => { if (!ziehbar) return; zieh.current = true; e.currentTarget.setPointerCapture?.(e.pointerId); zeiger(e); }}
          onPointerMove={(e) => { if (zieh.current) zeiger(e); }}
          onPointerUp={() => { zieh.current = false; }} onPointerCancel={() => { zieh.current = false; }}>
          <defs>
            {pfeilDef(id)}
            <marker id={`${id}-pfeil-g`} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill={GRUEN} /></marker>
            <marker id={`${id}-pfeil-r`} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill={ROT} /></marker>
            <pattern id={`${id}-schraffur`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="7" stroke={C.hellgrau} strokeWidth="1.2" strokeOpacity="0.55" />
            </pattern>
            <clipPath id={`${id}-oben`}><rect x="0" y="0" width={W} height={H1} /></clipPath>
            <clipPath id={`${id}-unten`}><rect x="0" y={H1} width={W} height={H2} /></clipPath>
          </defs>
          <rect x="0" y="0" width={W} height={H1} fill={C.weiss} />
          <g clipPath={`url(#${id}-oben)`}>
            <Achsen W={W} H={H1} sx={sx} sy={sy} xLo={xLo} xHi={xHi} yLo={yLo} yHi={yHi} piSkala={piSkala} id={id} />
            {flaechen}
            {streifenRects}
            {art === "zwei" && (
              <>
                <path d={kurvenPfad(gZ, xLo, xHi, sx, sy, yLo, yHi)} fill="none" stroke={F_FARBE} strokeWidth="2.6" strokeLinejoin="round" />
                {sicht.d && schieb === 0 && <path d={kurvenPfad(bild.dn, xLo, xHi, sx, sy, yLo, yHi)} fill="none" stroke={C.smaragd} strokeWidth="1.6" strokeDasharray="6 5" strokeOpacity={fokus === "d" ? 0.9 : 0.5} />}
              </>
            )}
            <path d={kurvenPfad(fZ, xLo, xHi, sx, sy, yLo, yHi)} fill="none" stroke={f_FARBE} strokeWidth="2.6" strokeLinejoin="round" />
            {obenX0}
            {punkte}
          </g>
          {mitUnten && <><rect x={0} y={H1} width={W} height={H2} fill="#FBFCFE" /><line x1={0} x2={W} y1={H1} y2={H1} stroke={C.linie} strokeWidth="1" /></>}
          {linien}
          {mitUnten && <g clipPath={`url(#${id}-unten)`}>{unten}</g>}
          {tLinie}
          <g clipPath={`url(#${id}-oben)`}><AchsenZahlen W={W} H={H1} sx={sx} sy={sy} xLo={xLo} xHi={xHi} yLo={yLo} yHi={yHi} piSkala={piSkala} /></g>
        </svg>
        {marken}
        {untenMarken}
        {nameBei(fZ, f_FARBE, art === "zwei" && schieb > 0.5 ? "d" : "f")}
        {art === "zwei" && nameBei(gZ, F_FARBE, schieb > 0.98 ? "" : "g", true)}
        {art === "zwei" && sicht.d && schieb === 0 && nameBei(bild.dn, C.smaragd, "d", false)}
      </div>

      {/* Werkzeuge unter dem Bild */}
      <div className="ib-leiste">
        {art === "bestimmt" && sicht.I && (
          <button type="button" className="ib-knopf gold" onClick={wachsen} disabled={laeuft}>
            <span aria-hidden="true">▶</span> Fläche wachsen lassen
          </button>
        )}
        {(art === "bestimmt" || art === "flaeche" || art === "zwei") && endlich(a) && endlich(b) && (
          <div className="ib-gruppe" role="group" aria-label="Rechteck-Streifen">
            <span className="ib-kicker">Streifen</span>
            {[0, 4, 8, 16, 32].map((n) => (
              <button key={n} type="button" className="ib-chip" aria-pressed={streifen === n} onClick={() => setStreifen(n)}>{n === 0 ? "aus" : n}</button>
            ))}
          </div>
        )}
        {art === "zwei" && sicht.d && (
          <label className="ib-regler">
            <span className="ib-kicker">g auf die x-Achse ziehen</span>
            <input type="range" min="0" max="1" step="0.01" value={schieb} onChange={(e) => setSchieb(+e.target.value)} aria-label="g auf die x-Achse ziehen" />
          </label>
        )}
        {(art === "stamm" || art === "anfang") && sicht.schar && (
          <label className="ib-regler">
            <span className="ib-kicker">Stelle x₀ = {komma(x0)}</span>
            <input type="range" min={xLo + 0.2} max={xHi - 0.2} step="0.01" value={x0} onChange={(e) => setX0(+e.target.value)} aria-label="Stelle x₀ verschieben" />
          </label>
        )}
      </div>
      {streifenSumme !== null && (
        <p className="ib-info">
          Summe der {streifen} Rechtecke ≈ <b>{komma(streifenSumme, 3)}</b>
          {art === "bestimmt" && sicht.I ? <> · Integral ≈ <b>{komma(bild.I, 3)}</b> – je mehr Streifen, desto genauer.</> : " – je mehr Streifen, desto näher am Integral (Bilanz)."}
        </p>
      )}
      {art === "zwei" && schieb > 0.98 && <p className="ib-info">Jetzt ist g die x-Achse und f ist zu d = f − g geworden. Die Fläche ist gleich groß geblieben – deshalb rechnet man mit d.</p>}
      {art === "bestimmt" && sicht.I && (
        <p className="ib-info">Oben die Fläche, unten der Höhenunterschied von F: Beide sind gleich groß. {ziehbar ? "Zieh im Bild, um die rechte Grenze zu verschieben." : ""}</p>
      )}
    </div>
  );
}

const IB_CSS = `
.ib-wrap{min-width:0}
.ib-buehne{position:relative;width:100%;border:1px solid ${C.linie};border-radius:16px;overflow:hidden;background:#fff}
.ib-marke{position:absolute;pointer-events:none;white-space:nowrap;background:rgba(255,255,255,0.92);border:1.5px solid transparent;border-radius:999px;font-weight:700;line-height:1.35;box-shadow:0 1px 6px rgba(15,26,51,0.08)}
.ib-name{position:absolute;pointer-events:none;font-size:15px;font-weight:800;font-style:italic;transform:translateX(-50%)}
.ib-name.links{transform:none}
.ib-flaeche{transition:fill-opacity .35s ease}
.ib-puls{animation:ibPuls 1.4s ease-in-out infinite}
@keyframes ibPuls{0%,100%{stroke-width:1.8}50%{stroke-width:4}}
@media (prefers-reduced-motion:reduce){.ib-puls{animation:none}}
.ib-leiste{display:flex;flex-wrap:wrap;align-items:center;gap:10px 14px;margin-top:10px}
.ib-knopf{height:38px;padding:0 16px;border-radius:999px;border:none;font-family:inherit;font-size:14px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:8px}
.ib-knopf.gold{background:${C.flaggold};color:${C.seeTief};box-shadow:0 2px 8px rgba(15,26,51,0.14)}
.ib-knopf:disabled{opacity:.55;cursor:default}
.ib-gruppe{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.ib-kicker{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${C.grau};margin-right:2px}
.ib-chip{min-width:38px;height:32px;padding:0 10px;border-radius:999px;border:1px solid ${C.linie};background:#fff;color:${C.see};font-family:inherit;font-size:13px;font-weight:600;cursor:pointer}
.ib-chip[aria-pressed="true"]{background:${C.see};border-color:${C.see};color:#fff}
.ib-regler{display:flex;flex-direction:column;gap:4px;flex:1 1 220px;min-width:0}
.ib-regler input{width:100%;accent-color:${C.see}}
.ib-info{font-size:12.5px;color:${C.grau};line-height:1.55;margin:8px 2px 0}
`;
