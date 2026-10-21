/* ============================================================
   Vektoren-Bereich: Rechnen mit Vektoren (früher „Vektor-Generator“)
   Zufällige Beispielrechnungen (Koeffizienten zwischen −7 und +7)
   zum Anschauen – jede Rechnung mit vollständigem Rechenweg:
   Addition/Subtraktion, Skalarmultiplikation, Linearkombination,
   Skalarprodukt, Kreuzprodukt und Abstände (mit 3D-Schaubild).
   „Zwei Punkte – eine Gerade“ und „Drei Punkte – eine Ebene“ sind
   eigenständige Trainingstools in func23.jsx.
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useRef, useState } from "react";
import { C } from "./base1.jsx";
import { DrehKnoepfe, FARBE_ACHSE, GRUND_AUS, GrundebenenGitter, GrundebenenSchalter, ebenenPolygon, kamera } from "./func16.jsx";
import { Bruch, Einzeilig, SpaltenVektor, VecName, Wurzel, ggT, kreuz, minus, skalar, strahlImWuerfel } from "./func19.jsx";

import { springe } from "./sprung.js";
import { BUEHNE, BUEHNE_SVG, FallWahl, Fusszeile, Legende, ModusReiter, RSchritt, Tafel, VF, VekArbeit, VekBild, VekSeite } from "./vekUi.jsx";
import { FeinKarte, Werkzeugleiste, useDesktop } from "./arbeitsflaeche.jsx";
export const FA = C.see, FB = C.gruen, FE = "#8A6D00", FS = C.smaragd;

/* ---------- Zufall ---------- */

const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const rndOhne0 = (a, b) => { let x = 0; while (x === 0) x = rnd(a, b); return x; };
const vektor = (r = 7) => {
  let v = [0, 0, 0];
  while (v.filter((x) => x === 0).length > 1) v = [rnd(-r, r), rnd(-r, r), rnd(-r, r)];
  return v;
};
const gleich = (u, v) => u.every((x, i) => x === v[i]);
const wahlAus = (l) => l[Math.floor(Math.random() * l.length)];
// Vektoren mit ganzzahliger Länge (pythagoreische Quadrupel), zufällig permutiert und mit Vorzeichen
const QUADRUPEL = [[1, 2, 2], [2, 3, 6], [1, 4, 8], [4, 4, 7], [2, 6, 9], [0, 3, 4], [2, 1, 2], [0, 4, 3], [3, 0, 4], [1, 2, 2]];
function mitLaenge() {
  const q = [...wahlAus(QUADRUPEL)];
  for (let i = 2; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [q[i], q[j]] = [q[j], q[i]]; }
  return q.map((x) => (Math.random() < 0.5 ? -x : x));
}

/* ---------- Darstellung ---------- */

export const n = (x) => minus(String(x));
export const k = (x) => (x < 0 ? `(${n(x)})` : n(x));
export const Vek = ({ w, farbe = C.tinte }) => <SpaltenVektor farbe={farbe} eintraege={w.map((x, i) => <span key={i}>{x}</span>)} />;
export const Name = ({ t, farbe = C.tinte }) => <VecName t={t} idx="" farbe={farbe} />;
export const Gl = () => <span>=</span>;

/* Ein Rechenschritt: mit Nummer als Zeitleiste (vekUi RSchritt), ohne Nummer als ruhige Fläche */
export function Schritt({ nr, titel, children }) {
  if (nr) return <RSchritt nr={nr} titel={titel}>{children}</RSchritt>;
  return (
    <div style={{ marginBottom: 14 }}>
      {titel && <p style={{ fontSize: 14, fontWeight: 700, color: C.tinte, margin: "0 0 8px" }}>{titel}</p>}
      <div style={{ background: VF.flaeche, border: `1px solid ${C.linie}`, borderRadius: 12, padding: "10px 8px" }}>{children}</div>
    </div>
  );
}

/* ---------- Aufgaben erzeugen ---------- */

export function neueAufgabe(art) {
  switch (art) {
    case "addsub": {
      const a = vektor(), b = vektor();
      return { art, op: Math.random() < 0.5 ? "+" : "−", a, b };
    }
    case "skalar": { let r = rndOhne0(-5, 5); if (r === 1) r = 2; return { art, r, a: vektor() }; }
    case "linear": {
      let r = rndOhne0(-4, 4), s = rndOhne0(-4, 4);
      if (r === 1) r = 2;
      return { art, r, s, a: vektor(), b: vektor() };
    }
    case "skalarprodukt": {
      const a = vektor();
      let b = vektor();
      if (Math.random() < 0.45) {
        // orthogonales Beispiel konstruieren
        for (let t = 0; t < 400; t++) {
          const i = [0, 1, 2].find((j) => a[j] !== 0);
          const c = vektor();
          const rest = [0, 1, 2].filter((j) => j !== i).reduce((sum, j) => sum + a[j] * c[j], 0);
          if (rest % a[i] === 0) {
            c[i] = -rest / a[i];
            if (Math.abs(c[i]) <= 7 && c.some((x) => x !== 0)) { b = c; break; }
          }
        }
      }
      return { art, a, b };
    }
    case "kreuzprodukt": {
      const a = vektor(5); let b = vektor(5);
      while (kreuz(a, b).every((x) => x === 0)) b = vektor(5);
      return { art, a, b };
    }
    case "abstandPE": {
      // Normalenvektor mit ganzzahliger Länge, P = F + t·n → Abstand |t|·|n| ganzzahlig
      for (;;) {
        const nv = mitLaenge();
        const L = Math.round(Math.sqrt(skalar(nv, nv)));
        const t = L <= 3 ? wahlAus([-2, -1, 1, 2]) : wahlAus([-1, 1]);
        const F = vektor(3);
        const P = F.map((x, i) => x + t * nv[i]);
        if (P.some((x) => Math.abs(x) > 9)) continue;
        return { art, n: nv, d: skalar(nv, F), P };
      }
    }
    case "abstandPG": {
      // Lotfußpunkt ganzzahlig: F = A + t0·u, P = F + w mit w ⟂ u und |w| ganzzahlig
      for (;;) {
        const A = vektor(4), u = vektor(3);
        const t0 = rnd(-2, 2);
        const w = [rnd(-6, 6), rnd(-6, 6), rnd(-6, 6)];
        const q = skalar(w, w);
        if (!q || skalar(w, u) !== 0 || Math.round(Math.sqrt(q)) ** 2 !== q) continue;
        const F = A.map((x, i) => x + t0 * u[i]);
        const P = F.map((x, i) => x + w[i]);
        if ([...P, ...F].some((x) => Math.abs(x) > 9)) continue;
        return { art, A, u, P, t0, F };
      }
    }
    case "abstandGG": {
      // Gemeinsamer Normalenvektor mit ganzzahliger Länge, B = A + t·n + s0·u → Abstand |t|·|n|
      for (let versuch = 0; ; versuch++) {
        const nv = mitLaenge();
        const L = Math.round(Math.sqrt(skalar(nv, nv)));
        const senkrecht = () => {
          for (let i = 0; i < 400; i++) { const x = [rnd(-5, 5), rnd(-5, 5), rnd(-5, 5)]; if (x.some((y) => y) && skalar(x, nv) === 0) return x; }
          return null;
        };
        const u = senkrecht(), v = senkrecht();
        if (!u || !v || kreuz(u, v).every((x) => x === 0)) continue;
        const A = vektor(5), t = L <= 3 ? wahlAus([-3, -2, 2, 3]) : L <= 5 ? wahlAus([-2, -1, 1, 2]) : wahlAus([-1, 1]), s0 = rnd(-1, 1);
        const B = A.map((x, i) => x + t * nv[i] + s0 * u[i]);
        if (B.some((x) => Math.abs(x) > 12)) continue;
        return { art, A, u, B, v };
      }
    }
    default: return null;
  }
}

/* ---------- 3D-Schaubild (Punkte, Gerade, Ebene) ----------
   gerade/gerade2: { p, r, farbe?, ohnePfeil? } · ebene/ebene2: { n, d, farbe? }
   legende: [{ text, farbe, art }] erscheint oben links im Bild (vekUi Legende). */

/* Desktop (ab 840 px) mit arbeitsflaeche: Bild rechts in einer BildKarte (VekBild), quadratisch und in echten Pixeln,
   darunter die Werkzeugleiste (Grundebenen + gruppen). Handy und ohne arbeitsflaeche: unverändert 360 × 300. */
export function Raum3(props) {
  const desktop = useDesktop();
  if (props.arbeitsflaeche && desktop) return <Raum3Breit {...props} />;
  return <Raum3Bild {...props} />;
}

function Raum3Breit(props) {
  const [grund, setGrund] = useState(GRUND_AUS);
  return (
    <div data-vek-raum="" data-raum3="breit" style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
      <VekBild>{(breite) => <Raum3Bild {...props} grundAussen={grund} W={breite} H={breite} />}</VekBild>
      <Werkzeugleiste gruppen={[{ titel: "Grundebenen einblenden", inhalt: <GrundebenenSchalter an={grund} setAn={setGrund} ohneTitel /> }, ...(props.gruppen || [])]} />
    </div>
  );
}

function Raum3Bild({ punkte, gerade, gerade2, lot, ebene, ebene2, lot2, legende, grundAussen, W = 360, H = 300 }) {
  const [grundInnen, setGrund] = useState(GRUND_AUS);
  const grund = grundAussen || grundInnen;
  const breit = !!grundAussen;                       // Desktop-Bild: ohne eigenen Rahmen und Schalter (stehen in VekBild/Werkzeugleiste)
  const gross = W > 400;
  const [phi, setPhi] = useState(0.62);
  const [theta, setTheta] = useState(0.42);
  const maxK = Math.max(4, ...punkte.flatMap((p) => p.p.map(Math.abs)));
  const L = Math.min(10, Math.ceil(maxK) + 1);
  const s = (Math.min(W, H) / 2 - 16) / (L * 1.5);
  const cam = kamera(phi, theta);
  const P = (p) => { const q = cam.proj(p); return [W / 2 + s * q.u, H / 2 - s * q.v]; };
  const pfad = (pts) => pts.map((p, i) => `${i ? "L" : "M"}${P(p)[0].toFixed(1)},${P(p)[1].toFixed(1)}`).join(" ") + " Z";
  const poly = ebene ? ebenenPolygon(ebene.n, ebene.d, L) : [];
  const poly2 = ebene2 ? ebenenPolygon(ebene2.n, ebene2.d, L) : [];
  const strecke = gerade ? strahlImWuerfel(gerade.p, gerade.r, L) : null;
  const strecke2 = gerade2 ? strahlImWuerfel(gerade2.p, gerade2.r, L) : null;
  const fG1 = (gerade && gerade.farbe) || FE, fG2 = (gerade2 && gerade2.farbe) || C.see;
  const fE1 = (ebene && ebene.farbe) || C.see, fE2 = (ebene2 && ebene2.farbe) || C.gruen;
  // Richtungspfeil: früher immer Gold – mit eigener Geradenfarbe in derselben Farbe
  const fPfeil = gerade && gerade.farbe ? gerade.farbe : FB;
  const pfeilId = `vgp${fPfeil.replace("#", "")}`;

  const ziehen = useRef(null);
  const start = (e) => { ziehen.current = { x: e.clientX, y: e.clientY, phi, theta }; e.currentTarget.setPointerCapture?.(e.pointerId); };
  const bewege = (e) => {
    if (!ziehen.current) return;
    setPhi(ziehen.current.phi - (e.clientX - ziehen.current.x) * 0.01);
    setTheta(Math.max(-1.35, Math.min(1.35, ziehen.current.theta + (e.clientY - ziehen.current.y) * 0.01)));
  };
  const ende = () => { ziehen.current = null; };
  const linie = (st, farbe, breite = 2.8) => {
    if (!st) return null;
    const [x1, y1] = P(st[0]), [x2, y2] = P(st[1]);
    return (
      <g>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff" strokeWidth={breite + 3} strokeLinecap="round" opacity="0.9" />
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={farbe} strokeWidth={breite} strokeLinecap="round" />
      </g>
    );
  };

  return (
    <div data-vek-raum={breit ? undefined : ""}>
    <div style={breit ? { position: "relative" } : BUEHNE}>
      <svg viewBox={`0 0 ${W} ${H}`} style={breit ? { ...BUEHNE_SVG, maxWidth: "none" } : BUEHNE_SVG}
        onPointerDown={start} onPointerMove={bewege} onPointerUp={ende} onPointerLeave={ende}>
        <defs>
          {[0, 1, 2].map((i) => (
            <marker key={i} id={`vg${i}`} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill={FARBE_ACHSE[i]} />
            </marker>
          ))}
          <marker id={pfeilId} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill={fPfeil} />
          </marker>
        </defs>
        <GrundebenenGitter an={grund} P={P} L={L} />
        {[0, 1, 2].map((i) => {
          const a = [0, 0, 0], b = [0, 0, 0], l = [0, 0, 0];
          a[i] = -L; b[i] = L * 1.12; l[i] = L * 1.24;
          const [x1, y1] = P(a), [x2, y2] = P(b), [lx, ly] = P(l);
          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={FARBE_ACHSE[i]} strokeWidth="1.4" markerEnd={`url(#vg${i})`} opacity="0.7" />
              <text x={lx} y={ly + 4} textAnchor="middle" fontSize={gross ? 14 : 12.5} fontWeight="700" fontStyle="italic" fill={FARBE_ACHSE[i]}>x{["₁", "₂", "₃"][i]}</text>
            </g>
          );
        })}
        {poly.length >= 3 && <path d={pfad(poly)} fill={fE1} fillOpacity="0.15" stroke={fE1} strokeOpacity="0.6" strokeWidth="1.3" strokeLinejoin="round" />}
        {poly2.length >= 3 && <path d={pfad(poly2)} fill={fE2} fillOpacity="0.14" stroke={fE2} strokeOpacity="0.6" strokeWidth="1.3" strokeLinejoin="round" />}
        {ebene && punkte.length === 3 && <path d={pfad(punkte.map((x) => x.p))} fill={C.flaggold} fillOpacity="0.25" stroke={FE} strokeWidth="1.4" />}
        {linie(strecke, fG1)}
        {linie(strecke2, fG2)}
        {[lot, lot2].filter(Boolean).map((l, i) => { const [x1, y1] = P(l[0]), [x2, y2] = P(l[1]);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={VF.drei} strokeWidth="2.4" strokeDasharray="5 4" />; })}
        {gerade && !gerade.ohnePfeil && (() => { const [x1, y1] = P(gerade.p), [x2, y2] = P(gerade.p.map((v, i) => v + gerade.r[i]));
          return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={fPfeil} strokeWidth="3.4" strokeLinecap="round" markerEnd={`url(#${pfeilId})`} />; })()}
        {(() => { const [x, y] = P([0, 0, 0]); return <circle cx={x} cy={y} r="2.5" fill={C.tinte} />; })()}
        {punkte.map((pt) => {
          const [x, y] = P(pt.p);
          // Lotlinien zur Orientierung
          const [fx, fy] = P([pt.p[0], pt.p[1], 0]);
          return (
            <g key={pt.label}>
              <line x1={x} y1={y} x2={fx} y2={fy} stroke={C.hellgrau} strokeWidth="1" strokeDasharray="3 3" />
              <circle cx={x} cy={y} r="5.2" fill={pt.farbe} stroke={C.weiss} strokeWidth="1.8" />
              <text x={x + 8} y={y - 7} fontSize="13" fontWeight="800" fill={pt.farbe} stroke="#fff" strokeWidth="3" paintOrder="stroke">{pt.label}</text>
            </g>
          );
        })}
      </svg>
      {legende && <Legende eintraege={legende} stil={{ position: "absolute", left: 10, top: 10, maxWidth: "calc(50% - 30px)", pointerEvents: "none" }} />}
      <DrehKnoepfe setPhi={setPhi} setTheta={setTheta} zuruecksetzen={() => { setPhi(0.62); setTheta(0.42); }} />
    </div>
      {!breit && <div style={{ marginTop: 8 }}><GrundebenenSchalter an={grund} setAn={setGrund} /></div>}
    </div>
  );
}

/* ---------- Die einzelnen Rechnungen ---------- */

function AddSub({ a, b, op }) {
  const f = op === "+" ? (x, y) => x + y : (x, y) => x - y;
  const e = a.map((x, i) => f(x, b[i]));
  return (
    <Schritt>
      <Einzeilig max={16}>
        <Name t="a" farbe={FA} /><span>{op}</span><Name t="b" farbe={FB} /><Gl />
        <Vek w={a.map(n)} farbe={FA} /><span>{op}</span><Vek w={b.map(n)} farbe={FB} /><Gl />
        <Vek w={a.map((x, i) => `${n(x)} ${op} ${k(b[i])}`)} /><Gl />
        <Vek w={e.map(n)} farbe={FE} />
      </Einzeilig>
    </Schritt>
  );
}

function SkalarMult({ r, a }) {
  return (
    <Schritt>
      <Einzeilig max={16}>
        <span style={{ color: FS }}>{n(r)}</span><span>·</span><Name t="a" farbe={FA} /><Gl />
        <span style={{ color: FS }}>{n(r)}</span><span>·</span><Vek w={a.map(n)} farbe={FA} /><Gl />
        <Vek w={a.map((x) => `${n(r)} · ${k(x)}`)} /><Gl />
        <Vek w={a.map((x) => n(r * x))} farbe={FE} />
      </Einzeilig>
    </Schritt>
  );
}

function Linear({ r, s, a, b }) {
  const ra = a.map((x) => r * x), sb = b.map((x) => s * x), e = ra.map((x, i) => x + sb[i]);
  const sOp = s < 0 ? "−" : "+", sAbs = Math.abs(s);
  return (
    <>
      <Schritt nr="1" titel="Einsetzen">
        <Einzeilig max={16}>
          <span style={{ color: FS }}>{n(r)}</span><span>·</span><Name t="a" farbe={FA} /><span>{sOp}</span>
          <span style={{ color: FS }}>{sAbs}</span><span>·</span><Name t="b" farbe={FB} /><Gl />
          <span style={{ color: FS }}>{n(r)}</span><span>·</span><Vek w={a.map(n)} farbe={FA} /><span>{sOp}</span>
          <span style={{ color: FS }}>{sAbs}</span><span>·</span><Vek w={b.map(n)} farbe={FB} />
        </Einzeilig>
      </Schritt>
      <Schritt nr="2" titel="Skalare hineinmultiplizieren">
        <Einzeilig max={16}>
          <Gl /><Vek w={a.map((x) => `${n(r)} · ${k(x)}`)} /><span>{sOp}</span><Vek w={b.map((x) => `${sAbs} · ${k(x)}`)} /><Gl />
          <Vek w={ra.map(n)} farbe={FA} /><span>{sOp}</span><Vek w={b.map((x) => n(sAbs * x))} farbe={FB} />
        </Einzeilig>
      </Schritt>
      <Schritt nr="3" titel="Komponentenweise zusammenfassen">
        <Einzeilig max={16}>
          <Gl /><Vek w={ra.map((x, i) => `${n(x)} ${sOp} ${k(sAbs * b[i])}`)} /><Gl />
          <Vek w={e.map(n)} farbe={FE} />
        </Einzeilig>
      </Schritt>
    </>
  );
}

function SkalarProd({ a, b }) {
  const p = skalar(a, b);
  return (
    <>
      <Schritt>
        <Einzeilig max={16}>
          <Name t="a" farbe={FA} /><span>·</span><Name t="b" farbe={FB} /><Gl />
          <Vek w={a.map(n)} farbe={FA} /><span>·</span><Vek w={b.map(n)} farbe={FB} />
        </Einzeilig>
        <div style={{ height: 8 }} />
        <Einzeilig max={16}>
          <Gl /><span>{a.map((x, i) => `${k(x)}·${k(b[i])}`).join(" + ")}</span>
        </Einzeilig>
        <div style={{ height: 6 }} />
        <Einzeilig max={16}>
          <span>{a.map((x, i) => k(x * b[i])).join(" + ")}</span><Gl />
          <span style={{ color: FE, fontSize: "1.15em" }}>{n(p)}</span>
        </Einzeilig>
      </Schritt>
      <div style={{ borderLeft: `4px solid ${p === 0 ? C.smaragd : C.flaggold}`, background: p === 0 ? "#EAF7F0" : "#FFF9E5",
        borderRadius: "0 12px 12px 0", padding: "10px 14px", fontSize: 14, color: C.tinte, lineHeight: 1.55 }}>
        {p === 0
          ? <>Das Skalarprodukt ist <b>0</b> – die Vektoren stehen <b>senkrecht</b> (orthogonal) aufeinander.</>
          : <>Das Skalarprodukt ist <b>{n(p)} ≠ 0</b> – die Vektoren stehen <b>nicht</b> senkrecht aufeinander.
            {p > 0 ? " Positiv: Der Winkel zwischen ihnen ist spitz (unter 90°)." : " Negativ: Der Winkel zwischen ihnen ist stumpf (über 90°)."}</>}
      </div>
    </>
  );
}

function KreuzProd({ a, b }) {
  const paare = [[1, 2], [2, 0], [0, 1]];
  const e = kreuz(a, b);
  const idx = ["₁", "₂", "₃"];
  return (
    <>
      <Schritt nr="1" titel="Formel">
        <Einzeilig max={15}>
          <Name t="a" farbe={FA} /><span>×</span><Name t="b" farbe={FB} /><Gl />
          <Vek w={paare.map(([i, j]) => <span key={i}><span style={{ color: FA }}>a{idx[i]}</span><span style={{ color: FB }}>b{idx[j]}</span> − <span style={{ color: FA }}>a{idx[j]}</span><span style={{ color: FB }}>b{idx[i]}</span></span>)} />
        </Einzeilig>
      </Schritt>
      <Schritt nr="2" titel="Einsetzen und ausrechnen">
        <Einzeilig max={15}>
          <Vek w={a.map(n)} farbe={FA} /><span>×</span><Vek w={b.map(n)} farbe={FB} /><Gl />
          <Vek w={paare.map(([i, j]) => `${k(a[i])}·${k(b[j])} − ${k(a[j])}·${k(b[i])}`)} />
        </Einzeilig>
        <div style={{ height: 8 }} />
        <Einzeilig max={15}>
          <Gl /><Vek w={paare.map(([i, j]) => `${k(a[i] * b[j])} − ${k(a[j] * b[i])}`)} /><Gl />
          <Vek w={e.map(n)} farbe={FE} />
        </Einzeilig>
      </Schritt>
      <p style={{ fontSize: 13, color: C.grau, lineHeight: 1.55 }}>
        Probe: <Name t="a" farbe={FA} /> · (<Name t="a" farbe={FA} /> × <Name t="b" farbe={FB} />) = {n(skalar(a, e))} und{" "}
        <Name t="b" farbe={FB} /> · (<Name t="a" farbe={FA} /> × <Name t="b" farbe={FB} />) = {n(skalar(b, e))} – das Ergebnis steht auf beiden senkrecht.
      </p>
    </>
  );
}

/* ---------- Abstände ---------- */

// |z| / √q schön darstellen: gekürzt, wenn q eine Quadratzahl ist, sonst mit Wurzel und Näherung
export function AbstandErgebnis({ z, q }) {
  const w = Math.round(Math.sqrt(q));
  const dez = (x) => String(Math.round(x * 1000) / 1000).replace(".", ",");
  const az = Math.abs(z);
  if (w * w === q) {
    const g = ggT(az, w) || 1;
    const zz = az / g, nn = w / g;
    return <span style={{ color: FE }}>{nn === 1 ? zz : <Bruch oben={zz} unten={nn} />}{nn !== 1 && <span style={{ color: C.tinte }}> ≈ {dez(az / w)}</span>} LE</span>;
  }
  return <span style={{ color: FE, display: "inline-flex", alignItems: "center", gap: "0.25em" }}><Bruch oben={az} unten={<Wurzel>{q}</Wurzel>} /><span style={{ color: C.tinte }}>≈ {dez(az / Math.sqrt(q))} LE</span></span>;
}

export function koordText(nv, d) {
  const teile = [];
  ["x₁", "x₂", "x₃"].forEach((x, i) => {
    const c = nv[i]; if (!c) return;
    const b = Math.abs(c) === 1 ? "" : Math.abs(c);
    teile.push(teile.length ? `${c < 0 ? "−" : "+"} ${b}${x}` : `${c < 0 ? "−" : ""}${b}${x}`);
  });
  return `${teile.join(" ")} = ${n(d)}`;
}

function AbstandPE({ n: nv, d, P }) {
  const z = skalar(nv, P) - d, q = skalar(nv, nv);
  const lambda = -z / q;
  const F = P.map((x, i) => x + lambda * nv[i]);
  return (
    <>
      <p style={{ fontSize: 15, fontWeight: 700, textAlign: "center", marginBottom: 12, lineHeight: 1.7 }}>
        <span style={{ color: FB, whiteSpace: "nowrap" }}>P({P.map(n).join(" | ")})</span>
        <span style={{ margin: "0 10px", color: C.hellgrau }}>und</span>
        <span style={{ color: FA, display: "inline-block" }}>E: {koordText(nv, d)}</span>
      </p>
      <Schritt nr="1" titel="Formel (Hessesche Normalform)">
        <Einzeilig max={17}>
          <span>d(P; E) =</span>
          <Bruch oben={<span>|n₁p₁ + n₂p₂ + n₃p₃ − d|</span>} unten={<Wurzel>n₁² + n₂² + n₃²</Wurzel>} />
        </Einzeilig>
      </Schritt>
      <Schritt nr="2" titel="Einsetzen">
        <Einzeilig max={17}>
          <span>d(P; E) =</span>
          <Bruch oben={<span>|{nv.map((x, i) => `${k(x)}·${k(P[i])}`).join(" + ")} − {k(d)}|</span>} unten={<Wurzel>{nv.map((x) => `${k(x)}²`).join(" + ")}</Wurzel>} />
        </Einzeilig>
      </Schritt>
      <Schritt nr="3" titel="Ausrechnen">
        <Einzeilig max={18}>
          <span>d(P; E) =</span>
          <Bruch oben={<span>|{n(z)}|</span>} unten={<Wurzel>{q}</Wurzel>} /><Gl />
          <AbstandErgebnis z={z} q={q} />
        </Einzeilig>
      </Schritt>
      <p style={{ fontSize: 13, color: C.grau, lineHeight: 1.55, marginBottom: 12 }}>
        {z === 0 ? "Der Zähler ist 0 – P liegt in der Ebene." : "Der Betrag im Zähler sorgt dafür, dass der Abstand nie negativ ist. Das Vorzeichen innen verrät nur, auf welcher Seite der Ebene P liegt."}
      </p>
      <Raum3 punkte={[{ p: P, label: "P", farbe: FB }, { p: F, label: "F", farbe: C.gruen }]} ebene={{ n: nv, d }} lot={[P, F]} />
    </>
  );
}

function AbstandPG({ A, u, P, t0, F }) {
  const AP = A.map((x, i) => x - P[i]);           // Vektor von P zu A
  const kA = skalar(AP, u), kU = skalar(u, u);
  const PF = F.map((x, i) => x - P[i]);
  const q = skalar(PF, PF);
  const lin = (c, t) => `${n(c)} ${t < 0 ? "−" : "+"} ${Math.abs(t) === 1 ? "" : Math.abs(t)}t`;
  return (
    <>
      <p style={{ fontSize: 15, fontWeight: 700, textAlign: "center", marginBottom: 12, lineHeight: 1.7 }}>
        <span style={{ color: FB, whiteSpace: "nowrap" }}>P({P.map(n).join(" | ")})</span>
        <span style={{ margin: "0 10px", color: C.hellgrau }}>und</span>
      </p>
      <div style={{ marginBottom: 12 }}>
        <Einzeilig max={17}>
          <span style={{ color: FA }}>g:</span><Name t="x" farbe={FA} /><Gl /><Vek w={A.map(n)} farbe={FA} /><span>+ t ·</span><Vek w={u.map(n)} farbe={FA} />
        </Einzeilig>
      </div>
      <Schritt nr="1" titel="Allgemeiner Punkt auf g und Verbindungsvektor von P">
        <Einzeilig max={16}>
          <Name t="PFₜ" farbe={FE} /><Gl /><Vek w={A.map((x, i) => lin(x - P[i], u[i]))} />
        </Einzeilig>
      </Schritt>
      <Schritt nr="2" titel="Lotbedingung: Verbindungsvektor senkrecht zum Richtungsvektor">
        <Einzeilig max={16}>
          <Name t="PFₜ" farbe={FE} /><span>·</span><Vek w={u.map(n)} farbe={FA} /><span>= 0</span>
        </Einzeilig>
        <div style={{ height: 6 }} />
        <Einzeilig max={16}>
          <span>{u.map((c, i) => `${k(c)}·(${lin(AP[i], u[i])})`).join(" + ")} = 0</span>
        </Einzeilig>
        <div style={{ height: 6 }} />
        <Einzeilig max={16}>
          <span>{n(kA)} {kU >= 0 ? "+" : "−"} {Math.abs(kU)}t = 0</span><span style={{ margin: "0 0.4em", color: C.hellgrau }}>⇔</span>
          <span style={{ color: FE }}>t = {n(t0)}</span>
        </Einzeilig>
      </Schritt>
      <Schritt nr="3" titel="Lotfußpunkt und Abstand">
        <Einzeilig max={16}>
          <span>F({F.map(n).join(" | ")})</span><span style={{ margin: "0 0.4em", color: C.hellgrau }}>⇒</span>
          <Name t="PF" farbe={FE} /><Gl /><Vek w={PF.map(n)} farbe={FE} />
        </Einzeilig>
        <div style={{ height: 6 }} />
        <Einzeilig max={17}>
          <span>d(P; g) = |</span><Name t="PF" farbe={FE} /><span>| =</span>
          <Wurzel>{PF.map((x) => `${k(x)}²`).join(" + ")}</Wurzel><Gl />
          {Math.round(Math.sqrt(q)) ** 2 === q
            ? <span style={{ color: FE }}>{Math.round(Math.sqrt(q))} LE</span>
            : <><span style={{ color: FE }}><Wurzel>{q}</Wurzel></span><span>≈ {String(Math.round(Math.sqrt(q) * 1000) / 1000).replace(".", ",")} LE</span></>}
        </Einzeilig>
      </Schritt>
      <Raum3 punkte={[{ p: P, label: "P", farbe: FB }, { p: F, label: "F", farbe: C.gruen }, { p: A, label: "A", farbe: FA }]}
        gerade={{ p: A, r: u }} lot={[P, F]} />
    </>
  );
}

function AbstandGG({ A, u, B, v }) {
  const nv = kreuz(u, v);
  const AB = B.map((x, i) => x - A[i]);
  const z = skalar(AB, nv), q = skalar(nv, nv);
  const paare = [[1, 2], [2, 0], [0, 1]];
  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
        <Einzeilig max={17}>
          <span style={{ color: FA }}>g:</span><Name t="x" farbe={FA} /><Gl /><Vek w={A.map(n)} farbe={FA} /><span>+ r ·</span><Vek w={u.map(n)} farbe={FA} />
        </Einzeilig>
        <Einzeilig max={17}>
          <span style={{ color: C.see }}>h:</span><Name t="x" farbe={C.see} /><Gl /><Vek w={B.map(n)} farbe={C.see} /><span>+ s ·</span><Vek w={v.map(n)} farbe={C.see} />
        </Einzeilig>
      </div>
      <Schritt nr="1" titel="Gemeinsamer Normalenvektor: Kreuzprodukt der Richtungsvektoren">
        <Einzeilig max={15}>
          <Name t="n" farbe={FE} /><Gl /><Vek w={u.map(n)} farbe={FA} /><span>×</span><Vek w={v.map(n)} farbe={C.see} />
        </Einzeilig>
        <div style={{ height: 6 }} />
        <Einzeilig max={15}>
          <Gl /><Vek w={paare.map(([i, j]) => `${k(u[i])}·${k(v[j])} − ${k(u[j])}·${k(v[i])}`)} /><Gl /><Vek w={nv.map(n)} farbe={FE} />
        </Einzeilig>
      </Schritt>
      <Schritt nr="2" titel="Verbindungsvektor der Stützpunkte">
        <Einzeilig max={16}>
          <Name t="AB" farbe={FE} /><Gl /><Vek w={B.map(n)} /><span>−</span><Vek w={A.map(n)} /><Gl /><Vek w={AB.map(n)} farbe={FE} />
        </Einzeilig>
      </Schritt>
      <Schritt nr="3" titel="Abstand: Projektion auf den Normalenvektor">
        <Einzeilig max={17}>
          <span>d(g; h) =</span>
          <Bruch oben={<span>|<Name t="AB" farbe={FE} /> · <Name t="n" farbe={FE} />|</span>} unten={<span>|<Name t="n" farbe={FE} />|</span>} /><Gl />
          <Bruch oben={<span>|{AB.map((x, i) => `${k(x)}·${k(nv[i])}`).join(" + ")}|</span>} unten={<Wurzel>{nv.map((x) => `${k(x)}²`).join(" + ")}</Wurzel>} />
        </Einzeilig>
        <div style={{ height: 6 }} />
        <Einzeilig max={18}>
          <Gl /><Bruch oben={<span>|{n(z)}|</span>} unten={<Wurzel>{q}</Wurzel>} /><Gl />
          <AbstandErgebnis z={z} q={q} />
        </Einzeilig>
      </Schritt>
      <p style={{ fontSize: 13, color: C.grau, lineHeight: 1.55, marginBottom: 12 }}>
        {z === 0
          ? "Der Abstand ist 0 – die Geraden schneiden sich."
          : "Der Abstand ist nicht 0 und die Richtungsvektoren sind nicht parallel – die Geraden sind windschief."}
        {" "}Bei parallelen Geraden funktioniert dieser Weg nicht (der Normalenvektor wäre der Nullvektor) – dort rechnet man den Abstand Punkt–Gerade.
      </p>
      <Raum3 punkte={[{ p: A, label: "A", farbe: FA }, { p: B, label: "B", farbe: C.see }]}
        gerade={{ p: A, r: u, ohnePfeil: true }} gerade2={{ p: B, r: v }} />
    </>
  );
}

/* ---------- Seite ---------- */

/* Formeln auf den drei Hauptknöpfen: kleine Buchstaben mit Pfeil darüber (a⃗, b⃗) */
const va = <VecName t="a" />, vb = <VecName t="b" />;
const ARTEN = [
  { id: "addsub", name: "Vektoraddition", kurz: "Addition", bild: "summe", formel: <>{va} ± {vb}</>, haupt: true, info: "Komponentenweise addieren oder subtrahieren – oben mit oben, Mitte mit Mitte, unten mit unten." },
  { id: "skalar", name: "Skalarmultiplikation", kurz: "Skalar\u00ADmulti\u00ADplikation", bild: "vielfaches", formel: <>k · {va}</>, titel: "Skalarmultiplikation", haupt: true, info: "Die Zahl vor dem Vektor wird mit jeder Komponente multipliziert. Der Vektor wird gestreckt, gestaucht oder umgedreht." },
  { id: "linear", name: "Linearkombination", kurz: "Linear\u00ADkombination", bild: "linear", formel: <>k · {va} + j · {vb}</>, titel: "Linearkombination", haupt: true, info: "Erst jeden Vektor mit seinem Skalar multiplizieren, dann komponentenweise zusammenfassen." },
  /* Seit 22.10. stehen Skalar- und Kreuzprodukt als eigene Rechenarten im Menü (das Band hat dafür keinen eigenen Reiter mehr) */
  { id: "skalarprodukt", name: "Skalarprodukt", kurz: "Skalar\u00ADprodukt", bild: "skalar", formel: <>{va} · {vb}</>, titel: "Skalarprodukt", haupt: true, info: "Komponenten paarweise multiplizieren und alles addieren – das Ergebnis ist eine Zahl. Ist sie 0, stehen die Vektoren senkrecht." },
  { id: "kreuzprodukt", name: "Kreuzprodukt", kurz: "Kreuz\u00ADprodukt", bild: "kreuz", formel: <>{va} × {vb}</>, titel: "Kreuzprodukt", haupt: true, info: "Das Kreuzprodukt ist ein Vektor, der auf beiden Vektoren senkrecht steht – über Kreuz multiplizieren, Zeile für Zeile." },
  /* Eigene Vektoren eingeben (Kreuzprodukt-Rechner) und Abstände: eigene Werkzeuge, hier als Verweis */
  { id: "kreuzrechner", name: "Kreuzprodukt-Rechner", link: "kreuzprodukt" },
  { id: "abstaende", name: "Abstände", link: "abstaende" },
];

export function VektorGenerator({ gehe }) {
  const [art, setArt] = useState("addsub");
  const [aufgabe, setAufgabe] = useState(() => neueAufgabe("addsub"));
  const [zaehler, setZaehler] = useState(1);
  const wechsle = (id) => { setArt(id); setAufgabe(neueAufgabe(id)); setZaehler(1); };
  const neu = () => { setAufgabe(neueAufgabe(art)); setZaehler((z) => z + 1); };
  // Auswahl unten bei „Weitere Beispiele“: danach zur Rechnung hochscrollen
  const karteRef = useRef(null);
  const wechsleUnten = (id) => { wechsle(id); requestAnimationFrame(() => karteRef.current && springe("bruch-beispiele", () => karteRef.current.scrollIntoView({ behavior: "smooth", block: "start" }))); };
  const info = ARTEN.find((x) => x.id === art);
  const titel = art === "addsub" ? (aufgabe.op === "+" ? "Vektoraddition" : "Vektorsubtraktion") : info.titel || info.name;
  const desktop = useDesktop();

  const reiter = (stapel) => (
    <ModusReiter label="Rechenart" wert={ARTEN.find((x) => x.id === art && x.haupt) ? art : null} setWert={wechsle} stapel={stapel} spalten="auto"
      modi={ARTEN.filter((x) => x.haupt).map((x) => ({ id: x.id, name: stapel ? x.name : x.kurz, bild: x.bild }))} />
  );
  const rechnungTafel = (stil) => (
    <Tafel stil={{ marginTop: 0, ...stil }} titel={titel} rechts={<span style={{ fontSize: 12.5, fontWeight: 600, color: C.grau, whiteSpace: "nowrap" }}>Beispiel {zaehler}</span>}>
      <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.55, margin: "0 0 14px" }}>{info.info}</p>
      <div key={zaehler + art}>
        {art === "addsub" && <AddSub {...aufgabe} />}
        {art === "skalar" && <SkalarMult {...aufgabe} />}
        {art === "linear" && <Linear {...aufgabe} />}
        {art === "skalarprodukt" && <SkalarProd {...aufgabe} />}
        {art === "kreuzprodukt" && <KreuzProd {...aufgabe} />}
        {art === "abstandPG" && <AbstandPG {...aufgabe} />}
        {art === "abstandPE" && <AbstandPE {...aufgabe} />}
        {art === "abstandGG" && <AbstandGG {...aufgabe} />}
      </div>
      <Fusszeile neu={neu} neuText="Neues Beispiel" stil={{ marginTop: 8 }} />
    </Tafel>
  );
  /* Weitere Beispiele – Kreuzprodukt und Abstände führen in ihre eigenen Werkzeuge */
  const weitere = (
    <FallWahl titel="Weiter" wert={ARTEN.find((x) => x.id === art && !x.haupt) ? art : null}
      setWert={(id) => { const x = ARTEN.find((y) => y.id === id); if (x.link) { if (gehe) gehe({ ansicht: x.link }); } else wechsleUnten(id); }}
      optionen={ARTEN.filter((x) => !x.haupt).map((x) => [x.id, x.id === "kreuzrechner" ? "Eigene Vektoren: Kreuzprodukt-Rechner" : "Zu den Abständen", x.id === "kreuzrechner" ? "kreuz" : "lot"])} />
  );
  const seitenText = "Wähle eine Rechenart und lass dir so viele Beispiele zeigen, wie du willst – jedes mit vollständigem Rechenweg. Alle Koordinaten liegen zwischen −7 und 7.";

  /* ---------- Desktop: Rechenarten links untereinander, Rechnung rechts (kein Bild – die Rechnung ist das Bild) ---------- */
  if (desktop) {
    return (
      <VekSeite titel="Rechnen mit Vektoren" text={seitenText}>
        <div data-vg="breit" ref={karteRef} style={{ scrollMarginTop: 80 }}>
          <VekArbeit
            links={<>
              <div data-vg-arten="">{reiter(true)}</div>
              <FeinKarte>{weitere}</FeinKarte>
            </>}
            rechts={rechnungTafel({ boxShadow: "none" })} />
        </div>
      </VekSeite>
    );
  }

  return (
    <VekSeite titel="Rechnen mit Vektoren" text={seitenText}>
      {reiter(false)}

      <div ref={karteRef} style={{ scrollMarginTop: 80 }}>
        {rechnungTafel()}
      </div>

      <div style={{ marginTop: 22 }}>
        {weitere}
      </div>
    </VekSeite>
  );
}
