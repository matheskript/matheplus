/* ============================================================
   Vektoren-Bereich: Vektor-Generator
   Zufällige Beispielrechnungen (Koeffizienten zwischen −7 und +7)
   zum Anschauen – jede Rechnung mit vollständigem Rechenweg:
   Addition/Subtraktion, Skalarmultiplikation, Linearkombination,
   Skalarprodukt, Kreuzprodukt, Gerade durch zwei Punkte (mit 3D-
   Schaubild) und Ebene durch drei Punkte (drei Parameterformen,
   mit 3D-Schaubild).
   Keine base-Datei darf diese Datei importieren.
   ============================================================ */

import React, { useRef, useState } from "react";
import { C } from "./base1.jsx";
import { DrehKnoepfe, FARBE_ACHSE, ebenenPolygon, kamera } from "./func16.jsx";
import { Einzeilig, SpaltenVektor, VecName, kreuz, minus, skalar, strahlImWuerfel } from "./func19.jsx";

const FA = C.see, FB = C.gruen, FE = "#8A6D00", FS = C.smaragd;

/* ---------- Zufall ---------- */

const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const rndOhne0 = (a, b) => { let x = 0; while (x === 0) x = rnd(a, b); return x; };
const vektor = (r = 7) => {
  let v = [0, 0, 0];
  while (v.filter((x) => x === 0).length > 1) v = [rnd(-r, r), rnd(-r, r), rnd(-r, r)];
  return v;
};
const gleich = (u, v) => u.every((x, i) => x === v[i]);

/* ---------- Darstellung ---------- */

const n = (x) => minus(String(x));
const k = (x) => (x < 0 ? `(${n(x)})` : n(x));
const Vek = ({ w, farbe = C.tinte }) => <SpaltenVektor farbe={farbe} eintraege={w.map((x, i) => <span key={i}>{x}</span>)} />;
const Name = ({ t, farbe = C.tinte }) => <VecName t={t} idx="" farbe={farbe} />;
const Gl = () => <span>=</span>;

function Schritt({ nr, titel, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {titel && (
        <p style={{ fontSize: 12.5, fontWeight: 700, color: C.grau, marginBottom: 6 }}>
          {nr && <span style={{ display: "inline-flex", width: 20, height: 20, borderRadius: 999, background: C.himmel, color: C.see,
            alignItems: "center", justifyContent: "center", fontSize: 11.5, marginRight: 6 }}>{nr}</span>}
          {titel}
        </p>
      )}
      <div style={{ background: C.sand, borderRadius: 12, padding: "10px 8px" }}>{children}</div>
    </div>
  );
}

/* ---------- Aufgaben erzeugen ---------- */

function neueAufgabe(art) {
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
    case "gerade": {
      const A = vektor(5); let B = vektor(5);
      while (gleich(A, B)) B = vektor(5);
      return { art, A, B };
    }
    case "ebene": {
      const A = vektor(4); let B = vektor(4), P = vektor(4);
      while (gleich(A, B)) B = vektor(4);
      const ab = B.map((x, i) => x - A[i]);
      let ac = P.map((x, i) => x - A[i]);
      while (kreuz(ab, ac).every((x) => x === 0)) { P = vektor(4); ac = P.map((x, i) => x - A[i]); }
      return { art, A, B, C: P };
    }
    default: return null;
  }
}

/* ---------- 3D-Schaubild (Punkte, Gerade, Ebene) ---------- */

function Raum3({ punkte, gerade, ebene }) {
  const [phi, setPhi] = useState(0.62);
  const [theta, setTheta] = useState(0.42);
  const maxK = Math.max(4, ...punkte.flatMap((p) => p.p.map(Math.abs)));
  const L = Math.min(10, Math.ceil(maxK) + 1);
  const W = 360, H = 300, s = (Math.min(W, H) / 2 - 16) / (L * 1.5);
  const cam = kamera(phi, theta);
  const P = (p) => { const q = cam.proj(p); return [W / 2 + s * q.u, H / 2 - s * q.v]; };
  const pfad = (pts) => pts.map((p, i) => `${i ? "L" : "M"}${P(p)[0].toFixed(1)},${P(p)[1].toFixed(1)}`).join(" ") + " Z";
  const poly = ebene ? ebenenPolygon(ebene.n, ebene.d, L) : [];
  const strecke = gerade ? strahlImWuerfel(gerade.p, gerade.r, L) : null;

  const ziehen = useRef(null);
  const start = (e) => { ziehen.current = { x: e.clientX, y: e.clientY, phi, theta }; e.currentTarget.setPointerCapture?.(e.pointerId); };
  const bewege = (e) => {
    if (!ziehen.current) return;
    setPhi(ziehen.current.phi - (e.clientX - ziehen.current.x) * 0.01);
    setTheta(Math.max(-1.35, Math.min(1.35, ziehen.current.theta + (e.clientY - ziehen.current.y) * 0.01)));
  };
  const ende = () => { ziehen.current = null; };

  return (
    <div style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", touchAction: "none", cursor: "grab", background: C.weiss,
        borderRadius: 14, border: `1px solid ${C.linie}` }}
        onPointerDown={start} onPointerMove={bewege} onPointerUp={ende} onPointerLeave={ende}>
        <defs>
          {[0, 1, 2].map((i) => (
            <marker key={i} id={`vg${i}`} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill={FARBE_ACHSE[i]} />
            </marker>
          ))}
        </defs>
        {[0, 1, 2].map((i) => {
          const a = [0, 0, 0], b = [0, 0, 0], l = [0, 0, 0];
          a[i] = -L; b[i] = L * 1.12; l[i] = L * 1.24;
          const [x1, y1] = P(a), [x2, y2] = P(b), [lx, ly] = P(l);
          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={FARBE_ACHSE[i]} strokeWidth="1.6" markerEnd={`url(#vg${i})`} opacity="0.85" />
              <text x={lx} y={ly + 4} textAnchor="middle" fontSize="12.5" fontWeight="700" fontStyle="italic" fill={FARBE_ACHSE[i]}>x{["₁", "₂", "₃"][i]}</text>
            </g>
          );
        })}
        {poly.length >= 3 && <path d={pfad(poly)} fill={C.see} fillOpacity="0.16" stroke={C.see} strokeOpacity="0.6" strokeWidth="1.3" />}
        {ebene && punkte.length === 3 && <path d={pfad(punkte.map((x) => x.p))} fill={C.flaggold} fillOpacity="0.25" stroke={FE} strokeWidth="1.4" />}
        {strecke && (() => { const [x1, y1] = P(strecke[0]), [x2, y2] = P(strecke[1]);
          return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={FE} strokeWidth="2.6" strokeLinecap="round" />; })()}
        {gerade && (() => { const [x1, y1] = P(gerade.p), [x2, y2] = P(gerade.p.map((v, i) => v + gerade.r[i]));
          return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={FB} strokeWidth="3" markerEnd="url(#vg1)" />; })()}
        {(() => { const [x, y] = P([0, 0, 0]); return <circle cx={x} cy={y} r="2.5" fill={C.tinte} />; })()}
        {punkte.map((pt) => {
          const [x, y] = P(pt.p);
          // Lotlinien zur Orientierung
          const [fx, fy] = P([pt.p[0], pt.p[1], 0]);
          return (
            <g key={pt.label}>
              <line x1={x} y1={y} x2={fx} y2={fy} stroke={C.hellgrau} strokeWidth="1" strokeDasharray="3 3" />
              <circle cx={x} cy={y} r="5" fill={pt.farbe} stroke={C.weiss} strokeWidth="1.6" />
              <text x={x + 8} y={y - 7} fontSize="12.5" fontWeight="800" fill={pt.farbe}>{pt.label}</text>
            </g>
          );
        })}
      </svg>
      <DrehKnoepfe setPhi={setPhi} setTheta={setTheta} zuruecksetzen={() => { setPhi(0.62); setTheta(0.42); }} />
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

function Gerade({ A, B }) {
  const d = B.map((x, i) => x - A[i]);
  return (
    <>
      <p style={{ fontSize: 15, fontWeight: 700, color: C.tinte, textAlign: "center", marginBottom: 12 }}>
        <span style={{ color: FA }}>A({A.map(n).join(" | ")})</span>
        <span style={{ margin: "0 12px", color: C.hellgrau }}>und</span>
        <span style={{ color: FB }}>B({B.map(n).join(" | ")})</span>
      </p>
      <Schritt nr="1" titel="Stützvektor: Ortsvektor von A">
        <Einzeilig max={16}><Name t="OA" farbe={FA} /><Gl /><Vek w={A.map(n)} farbe={FA} /></Einzeilig>
      </Schritt>
      <Schritt nr="2" titel="Richtungsvektor: von A nach B">
        <Einzeilig max={16}>
          <Name t="AB" farbe={FE} /><Gl /><Name t="OB" farbe={FB} /><span>−</span><Name t="OA" farbe={FA} /><Gl />
          <Vek w={B.map(n)} farbe={FB} /><span>−</span><Vek w={A.map(n)} farbe={FA} /><Gl />
          <Vek w={B.map((x, i) => `${n(x)} − ${k(A[i])}`)} /><Gl />
          <Vek w={d.map(n)} farbe={FE} />
        </Einzeilig>
      </Schritt>
      <Schritt nr="3" titel="Geradengleichung in Parameterform">
        <Einzeilig max={17}>
          <span>g:</span><Name t="x" /><Gl /><Vek w={A.map(n)} farbe={FA} /><span>+ t ·</span><Vek w={d.map(n)} farbe={FE} />
        </Einzeilig>
      </Schritt>
      <p style={{ fontSize: 13, color: C.grau, lineHeight: 1.55, marginBottom: 12 }}>
        Probe: Für t = 0 landest du bei A, für t = 1 bei B. Jeder andere Wert von t liefert einen weiteren Punkt der Geraden.
      </p>
      <Raum3 punkte={[{ p: A, label: "A", farbe: FA }, { p: B, label: "B", farbe: FB }]} gerade={{ p: A, r: d }} />
    </>
  );
}

function Ebene({ A, B, C: Cp }) {
  const diff = (P, Q) => Q.map((x, i) => x - P[i]); // P→Q
  const pkt = { A, B, C: Cp };
  const farbe = { A: FA, B: FB, C: FS };
  const varianten = [["A", "B", "C"], ["B", "A", "C"], ["C", "A", "B"]];
  const nv = kreuz(diff(A, B), diff(A, Cp));
  const zeigeRV = (P, Q) => {
    const d = diff(pkt[P], pkt[Q]);
    return (
      <Einzeilig max={15}>
        <Name t={P + Q} farbe={FE} /><Gl /><Vek w={pkt[Q].map(n)} farbe={farbe[Q]} /><span>−</span><Vek w={pkt[P].map(n)} farbe={farbe[P]} /><Gl />
        <Vek w={pkt[Q].map((x, i) => `${n(x)} − ${k(pkt[P][i])}`)} /><Gl /><Vek w={d.map(n)} farbe={FE} />
      </Einzeilig>
    );
  };
  return (
    <>
      <p style={{ fontSize: 15, fontWeight: 700, textAlign: "center", marginBottom: 12, lineHeight: 1.7 }}>
        {["A", "B", "C"].map((P) => (
          <span key={P} style={{ color: farbe[P], margin: "0 8px", whiteSpace: "nowrap" }}>{P}({pkt[P].map(n).join(" | ")})</span>
        ))}
      </p>
      <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, marginBottom: 12 }}>
        Rezept: Ein Punkt wird zum Stützpunkt, die Verbindungsvektoren zu den beiden anderen Punkten werden die Spannvektoren.
        Welcher Punkt der Stützpunkt ist, darfst du frei wählen – so entstehen drei gleichwertige Parameterformen derselben Ebene.
      </p>
      {varianten.map(([S, P, Q], i) => (
        <div key={S} style={{ border: `1px solid ${C.linie}`, borderRadius: 14, padding: "12px 10px 2px", marginBottom: 12 }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: C.tinte, marginBottom: 8 }}>
            Weg {i + 1}: Stützpunkt <span style={{ color: farbe[S] }}>{S}</span>
          </p>
          <Schritt titel="Spannvektoren">{zeigeRV(S, P)}<div style={{ height: 6 }} />{zeigeRV(S, Q)}</Schritt>
          <Schritt titel="Parameterform">
            <Einzeilig max={16}>
              <span>E:</span><Name t="x" /><Gl /><Vek w={pkt[S].map(n)} farbe={farbe[S]} />
              <span>+ r ·</span><Vek w={diff(pkt[S], pkt[P]).map(n)} farbe={FE} />
              <span>+ s ·</span><Vek w={diff(pkt[S], pkt[Q]).map(n)} farbe={FE} />
            </Einzeilig>
          </Schritt>
        </div>
      ))}
      <p style={{ fontSize: 13, color: C.grau, lineHeight: 1.55, marginBottom: 12 }}>
        Alle drei Gleichungen beschreiben dieselbe Ebene. Ein Normalenvektor ist <Name t="AB" farbe={FE} /> × <Name t="AC" farbe={FE} /> = ({nv.map(n).join(" | ")}).
      </p>
      <Raum3 punkte={[{ p: A, label: "A", farbe: FA }, { p: B, label: "B", farbe: FB }, { p: Cp, label: "C", farbe: FS }]}
        ebene={{ n: nv, d: skalar(nv, A) }} />
    </>
  );
}

/* ---------- Seite ---------- */

const ARTEN = [
  { id: "addsub", name: "Addition / Subtraktion", info: "Komponentenweise addieren oder subtrahieren – oben mit oben, Mitte mit Mitte, unten mit unten." },
  { id: "skalar", name: "Skalarmultiplikation", info: "Die Zahl vor dem Vektor wird mit jeder Komponente multipliziert. Der Vektor wird gestreckt, gestaucht oder umgedreht." },
  { id: "linear", name: "Linearkombination", info: "Erst jeden Vektor mit seinem Skalar multiplizieren, dann komponentenweise zusammenfassen." },
  { id: "skalarprodukt", name: "Skalarprodukt", info: "Komponenten paarweise multiplizieren und alles addieren – das Ergebnis ist eine Zahl. Ist sie 0, stehen die Vektoren senkrecht." },
  { id: "kreuzprodukt", name: "Kreuzprodukt", info: "Liefert einen Vektor, der auf beiden Vektoren senkrecht steht – zum Beispiel den Normalenvektor einer Ebene." },
  { id: "gerade", name: "2 Punkte → Gerade", info: "Stützvektor ist der Ortsvektor eines Punktes, Richtungsvektor der Verbindungsvektor zum anderen Punkt." },
  { id: "ebene", name: "3 Punkte → Ebene", info: "Ein Punkt als Stützpunkt, zwei Verbindungsvektoren als Spannvektoren – drei gleichwertige Wege." },
];

export function VektorGenerator() {
  const [art, setArt] = useState("addsub");
  const [aufgabe, setAufgabe] = useState(() => neueAufgabe("addsub"));
  const [zaehler, setZaehler] = useState(1);
  const wechsle = (id) => { setArt(id); setAufgabe(neueAufgabe(id)); setZaehler(1); };
  const neu = () => { setAufgabe(neueAufgabe(art)); setZaehler((z) => z + 1); };
  const karte = { background: C.weiss, borderRadius: 16, padding: 18, boxShadow: "0 2px 16px rgba(15,26,51,0.07)" };
  const info = ARTEN.find((x) => x.id === art);
  const titel = art === "addsub" ? (aufgabe.op === "+" ? "Vektoraddition" : "Vektorsubtraktion") : info.name;

  return (
    <div className="mx-auto px-6 pb-16" style={{ maxWidth: 620, paddingTop: 30 }}>
      <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 10 }}>
        Beispiele ohne Ende
      </h2>
      <p style={{ color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.7, marginBottom: 18 }}>
        Wähle eine Rechenart und lass dir so viele Beispiele zeigen, wie du willst – jedes mit vollständigem Rechenweg.
        Alle Koordinaten liegen zwischen −7 und 7.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
        {ARTEN.map((x) => (
          <button key={x.id} onClick={() => wechsle(x.id)}
            style={{ padding: "7px 12px", borderRadius: 999, fontSize: 12.5, fontFamily: "inherit", cursor: "pointer", whiteSpace: "nowrap",
              border: `1px solid ${art === x.id ? C.see : C.linie}`, background: art === x.id ? C.see : C.weiss,
              color: art === x.id ? C.weiss : C.see, fontWeight: art === x.id ? 700 : 500 }}>{x.name}</button>
        ))}
      </div>

      <div style={karte}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
          <p style={{ fontSize: 18, fontWeight: 800, color: C.tinte }}>{titel}</p>
          <span style={{ fontSize: 12, color: C.hellgrau, whiteSpace: "nowrap" }}>Beispiel {zaehler}</span>
        </div>
        <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.55, marginBottom: 14 }}>{info.info}</p>

        <div key={zaehler + art}>
          {art === "addsub" && <AddSub {...aufgabe} />}
          {art === "skalar" && <SkalarMult {...aufgabe} />}
          {art === "linear" && <Linear {...aufgabe} />}
          {art === "skalarprodukt" && <SkalarProd {...aufgabe} />}
          {art === "kreuzprodukt" && <KreuzProd {...aufgabe} />}
          {art === "gerade" && <Gerade {...aufgabe} />}
          {art === "ebene" && <Ebene {...aufgabe} />}
        </div>

        <button onClick={neu}
          style={{ width: "100%", marginTop: 14, height: 48, borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "inherit",
            background: C.flaggold, color: C.seeTief, fontSize: 16, fontWeight: 800, boxShadow: "0 4px 14px rgba(237,187,0,0.35)" }}>
          🎲 Neues Beispiel
        </button>
      </div>
    </div>
  );
}
