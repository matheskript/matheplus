/* ======================================================================
   FORMELSAMMLUNG · Illustrationen Teil 8: Kreis und Kugel, Summen, Linearkombination,
   Erwartungswert-Transformation, Mindestens-n-Versuche, Schnittwinkel, Betrag, Mal 9
   ====================================================================== */
import React, { useRef, useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { Achsen, F, Griff, Hinweis, Messzeile, Pfeil, Punkt, Regler, Txt, Umschalter, klemm, koord, summe, svgStil, useZiehen, z } from "./funcFsBasis.jsx";

const WTxt = ({ x, y, children, gr = 12, anker = "middle" }) => (
  <text x={x} y={y} textAnchor={anker} fontSize={gr} fontWeight={700} fill="#fff">{children}</text>
);
const minus = (c, v) => (c < 0 ? `${v} + ${z(-c)}` : c === 0 ? v : `${v} - ${z(c)}`);

/* ---------- Kreisgleichung ---------- */
function KreisGleichung() {
  const [m1, setM1] = useState(1), [m2, setM2] = useState(1), [r, setR] = useState(2);
  const [w, setW] = useState(40);
  const k = koord({ x0: -5, x1: 6, y0: -2.5, y1: 5.3, w: 340, h: 250 });
  const px = m1 + r * Math.cos((w * Math.PI) / 180), py = m2 + r * Math.sin((w * Math.PI) / 180);
  const zieh = useZiehen(([sx, sy]) => {
    const x = k.ix(sx), y = k.iy(sy);
    setW(Math.round(((Math.atan2(y - m2, x - m1) * 180) / Math.PI + 360) % 360));
    return true;
  });
  return (
    <div>
      <Hinweis>Ziehe den Punkt P am Kreis entlang. Das Dreieck aus P und dem Mittelpunkt M hat immer die Hypotenuse r – Pythagoras liefert die Kreisgleichung.</Hinweis>
      <svg viewBox="0 0 340 250" style={svgStil} {...zieh} role="img" aria-label="Kreis mit Mittelpunkt und Punkt P">
        <Achsen k={k} />
        <circle cx={k.px(m1)} cy={k.py(m2)} r={(r * (340 - 28)) / 11} fill={F.blau} opacity="0.35" stroke={F.see} strokeWidth="2.4" />
        <line x1={k.px(m1)} y1={k.py(m2)} x2={k.px(px)} y2={k.py(m2)} stroke={F.gold3} strokeWidth="2.4" />
        <line x1={k.px(px)} y1={k.py(m2)} x2={k.px(px)} y2={k.py(py)} stroke={F.rosaKraeftig} strokeWidth="2.4" />
        <line x1={k.px(m1)} y1={k.py(m2)} x2={k.px(px)} y2={k.py(py)} stroke={F.tinte} strokeWidth="2" />
        <Punkt x={k.px(m1)} y={k.py(m2)} farbe={F.tinte} r={4} />
        <Griff x={k.px(px)} y={k.py(py)} farbe={F.see} />
        <Txt x={k.px(m1)} y={k.py(m2) + 15} gr={11}>M</Txt>
      </svg>
      <Regler label="Mittelpunkt x" wert={m1} setze={setM1} min={-2} max={3} schritt={0.5} anzeige={z(m1)} />
      <Regler label="Mittelpunkt y" wert={m2} setze={setM2} min={0} max={2} schritt={0.5} anzeige={z(m2)} />
      <Regler label="Radius r" wert={r} setze={setR} min={1} max={2.5} schritt={0.5} anzeige={z(r)} />
      <Messzeile>
        <div><M t={`(x ${m1 === 0 ? "" : m1 < 0 ? "+ " + z(-m1) : "- " + z(m1)})^2 + (y ${m2 === 0 ? "" : m2 < 0 ? "+ " + z(-m2) : "- " + z(m2)})^2 = ${z(r * r)}`} /></div>
        <div><M t={`P(${z(px)} | ${z(py)}): \\; (${z(px - m1)})^2 + (${z(py - m2)})^2 = ${z((px - m1) ** 2 + (py - m2) ** 2)}`} /></div>
      </Messzeile>
    </div>
  );
}

/* ---------- Kugel: Schnittkreis in der Höhe z ---------- */
function KugelSchnitt() {
  const [h, setH] = useState(1);
  const r = 3;
  const rs = Math.sqrt(Math.max(0, r * r - h * h));
  return (
    <div>
      <Hinweis>Schneide die Kugel in der Höhe z. Der Schnitt ist ein Kreis mit Radius √(r² − z²) – so entsteht die Kugelgleichung aus der Kreisgleichung.</Hinweis>
      <svg viewBox="0 0 340 220" style={svgStil} role="img" aria-label="Kugel mit Schnittebene">
        <circle cx={170} cy={110} r={90} fill={F.blau} opacity="0.4" stroke={F.see} strokeWidth="2.4" />
        <line x1={50} x2={290} y1={110 - h * 30} y2={110 - h * 30} stroke={F.rosaKraeftig} strokeWidth="2.6" />
        <line x1={170} x2={170} y1={110} y2={110 - h * 30} stroke={F.gold3} strokeWidth="2.4" />
        <line x1={170} x2={170 + rs * 30} y1={110 - h * 30} y2={110 - h * 30} stroke={F.tinte} strokeWidth="2.4" />
        <line x1={170} y1={110} x2={170 + rs * 30} y2={110 - h * 30} stroke={F.see} strokeWidth="2" strokeDasharray="5 3" />
        <Punkt x={170} y={110} farbe={F.tinte} r={3.5} />
        <Txt x={158} y={110 - h * 15} gr={11} farbe={F.gold3} anker="end">z</Txt>
        <Txt x={170 + (rs * 30) / 2} y={110 - h * 30 - 6} gr={11}>{`ρ = ${z(rs)}`}</Txt>
        <Txt x={196} y={112} gr={11} farbe={F.see} anker="start">r = 3</Txt>
      </svg>
      <Regler label="Höhe z" wert={h} setze={setH} min={-2.8} max={2.8} schritt={0.1} anzeige={z(h)} />
      <Messzeile>
        <div><M t={`x^2 + y^2 + z^2 = r^2 \\;\\Rightarrow\\; x^2 + y^2 = 9 - ${z(h * h)} = ${z(rs * rs)}`} /></div>
        <div>Schnittkreis-Radius ρ = √{z(rs * rs)} = {z(rs)}</div>
      </Messzeile>
    </div>
  );
}

/* ---------- Geometrische Summe ---------- */
function GeomSumme() {
  const [q, setQ] = useState(2), [n, setN] = useState(5);
  const terme = Array.from({ length: n + 1 }, (_, i) => Math.pow(q, i));
  const s = terme.reduce((a, b) => a + b, 0);
  const formel = (Math.pow(q, n + 1) - 1) / (q - 1);
  const max = Math.max(...terme);
  const bw = 300 / (n + 1);
  return (
    <div>
      <Hinweis>Jeder Balken ist q mal so hoch wie der vorige. Die Summe aller Balken folgt der Formel (qⁿ⁺¹ − 1) : (q − 1).</Hinweis>
      <svg viewBox="0 0 340 170" style={svgStil} role="img" aria-label="Balken einer geometrischen Folge">
        {terme.map((t, i) => (
          <g key={i}>
            <rect x={20 + i * bw + 2} y={140 - (t / max) * 120} width={bw - 4} height={(t / max) * 120} rx={3} fill={i % 2 ? F.rosaKraeftig : F.see} opacity="0.85" />
            <Txt x={20 + i * bw + bw / 2} y={158} gr={Math.min(11, bw / 3.2 + 4)}>{z(t)}</Txt>
          </g>
        ))}
      </svg>
      <Regler label="q" wert={q} setze={setQ} min={0.5} max={3} schritt={0.5} anzeige={z(q)} />
      <Regler label="n" wert={n} setze={setN} min={1} max={9} schritt={1} anzeige={n} />
      <Messzeile>
        <div style={{ fontSize: 13 }}>Summe: {terme.map(z).join(" + ")} = <b>{z(s)}</b></div>
        {q !== 1 && <div><M t={`\\frac{q^{${n + 1}} - 1}{q - 1} = \\frac{${z(Math.pow(q, n + 1))} - 1}{${z(q - 1)}} = ${z(formel)}`} /></div>}
      </Messzeile>
    </div>
  );
}

/* ---------- Linearkombination ---------- */
function LinKomb() {
  const [r, setR] = useState(1.5), [s, setS] = useState(1);
  const k = koord({ x0: -2, x1: 8, y0: -2, y1: 7, w: 340, h: 250 });
  const a = [2, 1], b = [-0.5, 1.5];
  const ziel = [r * a[0] + s * b[0], r * a[1] + s * b[1]];
  const U = (v) => [k.px(v[0]), k.py(v[1])];
  const o = U([0, 0]), pa = U([r * a[0], r * a[1]]), pz = U(ziel);
  return (
    <div>
      <Hinweis>Die Vektoren a und b sind fest. Mit r und s erreichst du jeden Punkt der Ebene – r Schritte in a-Richtung, dann s Schritte in b-Richtung.</Hinweis>
      <svg viewBox="0 0 340 250" style={svgStil} role="img" aria-label="Linearkombination zweier Vektoren">
        <Achsen k={k} />
        <Pfeil x1={o[0]} y1={o[1]} x2={pa[0]} y2={pa[1]} farbe={F.see} />
        <Pfeil x1={pa[0]} y1={pa[1]} x2={pz[0]} y2={pz[1]} farbe={F.rosaKraeftig} />
        <Pfeil x1={o[0]} y1={o[1]} x2={pz[0]} y2={pz[1]} farbe={F.tinte} breite={2.8} />
        <Txt x={(o[0] + pa[0]) / 2} y={(o[1] + pa[1]) / 2 - 8} farbe={F.see} gr={11}>r · a</Txt>
        <Txt x={(pa[0] + pz[0]) / 2 + 14} y={(pa[1] + pz[1]) / 2 - 4} farbe={F.rosaKraeftig} gr={11}>s · b</Txt>
        <Punkt x={pz[0]} y={pz[1]} farbe={F.tinte} />
      </svg>
      <Regler label="r" wert={r} setze={setR} min={-1} max={3} schritt={0.5} anzeige={z(r)} />
      <Regler label="s" wert={s} setze={setS} min={-1} max={3} schritt={0.5} anzeige={z(s)} />
      <Messzeile>
        <div><M t={`${z(r)} \\cdot \\spalte{2}{1} + ${s < 0 ? "(" + z(s) + ")" : z(s)} \\cdot \\spalte{-0,5}{1,5} = \\spalte{${z(ziel[0])}}{${z(ziel[1])}}`} /></div>
      </Messzeile>
    </div>
  );
}

/* ---------- E(aX + b) und V(aX + b) ---------- */
function EwAb() {
  const [a, setA] = useState(2), [b, setB] = useState(1);
  const xs = [0, 1, 2, 3], ps = [0.1, 0.4, 0.4, 0.1];
  const E = xs.reduce((t, x, i) => t + x * ps[i], 0);
  const V = xs.reduce((t, x, i) => t + (x - E) ** 2 * ps[i], 0);
  const ys = xs.map((x) => a * x + b);
  const E2 = a * E + b, V2 = a * a * V;
  const lo = Math.min(...ys, 0) - 1, hi = Math.max(...ys, 3) + 1;
  const sx = (v) => 20 + ((v - lo) / (hi - lo)) * 300;
  return (
    <div>
      <Hinweis>Oben X, unten Y = a·X + b. Der Erwartungswert wandert genauso mit (a·E + b). Die Streuung wird mit a gestreckt – die Varianz mit a², das Verschieben um b ändert sie nicht.</Hinweis>
      <svg viewBox="0 0 340 170" style={svgStil} role="img" aria-label="Verteilung von X und Y">
        <line x1={20} x2={320} y1={70} y2={70} stroke={F.achse} />
        <line x1={20} x2={320} y1={150} y2={150} stroke={F.achse} />
        {xs.map((x, i) => <rect key={i} x={sx(x) - 8} y={70 - ps[i] * 120} width={16} height={ps[i] * 120} fill={F.see} opacity="0.85" />)}
        {ys.map((y, i) => <rect key={i} x={sx(y) - 8} y={150 - ps[i] * 120} width={16} height={ps[i] * 120} fill={F.rosaKraeftig} opacity="0.85" />)}
        <line x1={sx(E)} x2={sx(E)} y1={14} y2={70} stroke={F.gold3} strokeWidth="2" strokeDasharray="4 3" />
        <line x1={sx(E2)} x2={sx(E2)} y1={94} y2={150} stroke={F.gold3} strokeWidth="2" strokeDasharray="4 3" />
        <Txt x={24} y={12} gr={11} anker="start" farbe={F.see}>X</Txt>
        <Txt x={24} y={92} gr={11} anker="start" farbe={F.rosaKraeftig}>Y = aX + b</Txt>
      </svg>
      <Regler label="a" wert={a} setze={setA} min={-2} max={3} schritt={1} anzeige={a} />
      <Regler label="b" wert={b} setze={setB} min={-2} max={3} schritt={1} anzeige={b} />
      <Messzeile>
        <div><M t={`E(X) = ${z(E)}, \\; V(X) = ${z(V)}`} /></div>
        <div><M t={`E(Y) = ${z(a)} \\cdot ${z(E)} ${b < 0 ? "- " + z(-b) : "+ " + z(b)} = ${z(E2)}`} /></div>
        <div><M t={`V(Y) = ${z(a)}^2 \\cdot ${z(V)} = ${z(V2)}`} /></div>
      </Messzeile>
    </div>
  );
}

/* ---------- Mindestens n Versuche ---------- */
function MindestensN() {
  const [p, setP] = useState(0.2), [ziel, setZiel] = useState(0.9);
  const k = koord({ x0: 0, x1: 30, y0: 0, y1: 1.05, w: 340, h: 220 });
  const f = (n) => 1 - Math.pow(1 - p, n);
  const nMin = Math.ceil(Math.log(1 - ziel) / Math.log(1 - p) - 1e-9);
  return (
    <div>
      <Hinweis>Die Kurve zeigt P(mindestens ein Treffer) nach n Versuchen. Wo sie die Zielhöhe erreicht, liegt das kleinste n – der Logarithmus findet es direkt.</Hinweis>
      <svg viewBox="0 0 340 220" style={svgStil} role="img" aria-label="Wahrscheinlichkeit für mindestens einen Treffer in Abhängigkeit von n">
        <Achsen k={k} schritt={5} ySchritt={0.25} />
        <path d={k.kurve(f)} fill="none" stroke={F.see} strokeWidth="2.6" />
        <line x1={k.px(0)} x2={k.px(30)} y1={k.py(ziel)} y2={k.py(ziel)} stroke={F.rosaKraeftig} strokeWidth="2" />
        {nMin <= 30 && <>
          <line x1={k.px(nMin)} x2={k.px(nMin)} y1={k.py(0)} y2={k.py(f(nMin))} stroke={F.gold3} strokeWidth="2" strokeDasharray="4 3" />
          <Punkt x={k.px(nMin)} y={k.py(f(nMin))} farbe={F.gold3} r={5} />
        </>}
      </svg>
      <Regler label="Trefferchance p" wert={p} setze={setP} min={0.05} max={0.5} schritt={0.05} anzeige={z(p)} />
      <Regler label="Ziel (Sicherheit)" wert={ziel} setze={setZiel} min={0.5} max={0.99} schritt={0.01} anzeige={z(ziel)} />
      <Messzeile>
        <div><M t={`1 - ${z(1 - p)}^n \\geq ${z(ziel)} \\;\\Rightarrow\\; n \\geq \\frac{\\ln ${z(1 - ziel)}}{\\ln ${z(1 - p)}} = ${z(Math.log(1 - ziel) / Math.log(1 - p))}`} /></div>
        <div>Mindestens <b>{nMin}</b> Versuche: P = {z(f(nMin))}</div>
      </Messzeile>
    </div>
  );
}

/* ---------- Schnittwinkel zweier Geraden / Graphen ---------- */
function Schnittwinkel() {
  const [m1, setM1] = useState(0.5), [m2, setM2] = useState(-1.5);
  const k = koord({ x0: -4, x1: 4, y0: -4, y1: 4, w: 340, h: 250 });
  const a1 = (Math.atan(m1) * 180) / Math.PI, a2 = (Math.atan(m2) * 180) / Math.PI;
  const diff = Math.abs(a2 - a1);
  const sp = diff > 90 ? 180 - diff : diff;
  const tanFormel = Math.abs(1 + m1 * m2) < 1e-9 ? Infinity : Math.abs((m2 - m1) / (1 + m1 * m2));
  return (
    <div>
      <Hinweis>Zwei Geraden (oder die Tangenten zweier Graphen) durch denselben Punkt. Der Schnittwinkel ist der Unterschied ihrer Steigungswinkel.</Hinweis>
      <svg viewBox="0 0 340 250" style={svgStil} role="img" aria-label="Zwei Geraden durch den Ursprung">
        <Achsen k={k} />
        <path d={k.kurve((x) => m1 * x)} fill="none" stroke={F.see} strokeWidth="2.6" />
        <path d={k.kurve((x) => m2 * x)} fill="none" stroke={F.rosaKraeftig} strokeWidth="2.6" />
        <Punkt x={k.px(0)} y={k.py(0)} farbe={F.tinte} />
        <Txt x={k.px(0) + 80} y={k.py(0) - 40} gr={13} farbe={F.gold3}>{`${z(sp)}°`}</Txt>
      </svg>
      <Regler label="Steigung m₁" wert={m1} setze={setM1} min={-3} max={3} schritt={0.1} anzeige={z(m1)} />
      <Regler label="Steigung m₂" wert={m2} setze={setM2} min={-3} max={3} schritt={0.1} anzeige={z(m2)} />
      <Messzeile>
        <div><M t={`\\alpha_1 = \\tan^{-1}(${z(m1)}) = ${z(a1)}°, \\quad \\alpha_2 = \\tan^{-1}(${z(m2)}) = ${z(a2)}°`} /></div>
        <div><M t={`\\tan\\delta = \\left|\\frac{m_2 - m_1}{1 + m_1 m_2}\\right| = ${isFinite(tanFormel) ? z(tanFormel) : "\\text{nicht definiert (90°)}"}, \\quad \\delta = ${z(sp)}°`} /></div>
      </Messzeile>
    </div>
  );
}

/* ---------- Betrag und Abstand ---------- */
function BetragFall() {
  const [a, setA] = useState(1), [b, setB] = useState(2.5), [x, setX] = useState(2);
  const k = koord({ x0: -6, x1: 8, y0: -1, y1: 6, w: 340, h: 150 });
  const zieh = useZiehen(([sx]) => { setX(klemm(Math.round(k.ix(sx) * 10) / 10, -5.5, 7.5)); return true; });
  const d = Math.abs(x - a);
  return (
    <div>
      <Hinweis>|x − a| ist der Abstand von x zu a auf dem Zahlenstrahl. »|x − a| &lt; b« heißt: x liegt weniger als b von a entfernt – ein Intervall um a.</Hinweis>
      <svg viewBox="0 0 340 150" style={svgStil} {...zieh} role="img" aria-label="Zahlenstrahl mit Abstand">
        <line x1={k.px(-6)} x2={k.px(8)} y1={90} y2={90} stroke={F.achse} strokeWidth="2" />
        <rect x={k.px(a - b)} y={74} width={k.px(a + b) - k.px(a - b)} height={32} fill={F.gold3} opacity="0.25" rx={6} />
        {[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7].map((t) => <g key={t}><line x1={k.px(t)} x2={k.px(t)} y1={86} y2={94} stroke={F.achse} /><Txt x={k.px(t)} y={110} gr={9} fett={false}>{String(t).replace("-", "−")}</Txt></g>)}
        <line x1={k.px(a)} x2={k.px(x)} y1={60} y2={60} stroke={d < b ? F.gold3 : F.rosaKraeftig} strokeWidth="3" />
        <Punkt x={k.px(a)} y={90} farbe={F.see} />
        <Griff x={k.px(x)} y={90} farbe={d < b ? F.gold3 : F.rosaKraeftig} />
        <Txt x={k.px(a)} y={134} gr={11} farbe={F.see}>a</Txt>
        <Txt x={(k.px(a) + k.px(x)) / 2} y={52} gr={11}>{`|x − a| = ${z(d)}`}</Txt>
      </svg>
      <Regler label="a" wert={a} setze={setA} min={-3} max={4} schritt={1} anzeige={z(a)} />
      <Regler label="b" wert={b} setze={setB} min={0.5} max={4} schritt={0.5} anzeige={z(b)} />
      <Messzeile>
        <div><M t={`|x ${a === 0 ? "" : a < 0 ? "+ " + z(-a) : "- " + z(a)}| < ${z(b)} \\;\\Leftrightarrow\\; ${z(a - b)} < x < ${z(a + b)}`} /></div>
        <div>x = {z(x)}: Abstand {z(d)} – {d < b ? "innerhalb" : "außerhalb"} des Intervalls</div>
      </Messzeile>
    </div>
  );
}

/* ---------- Mal 9, 99, 999 ---------- */
function MalNahe() {
  const [n, setN] = useState(47), [st, setSt] = useState(1);
  const g = Math.pow(10, st);
  const gross = n * g, ergebnis = n * (g - 1);
  const stk = 300 / Math.max(gross, 1);
  return (
    <div>
      <Hinweis>9 ist 10 − 1, 99 ist 100 − 1. Erst mal die runde Zahl, dann einmal die Zahl abziehen.</Hinweis>
      <svg viewBox="0 0 340 100" style={svgStil} role="img" aria-label="Balken minus ein Stück">
        <rect x={20} y={16} width={300} height={26} rx={6} fill={F.see} opacity="0.85" />
        <WTxt x={170} y={34} gr={12}>{`${n} · ${g} = ${gross}`}</WTxt>
        <rect x={20} y={56} width={300 - n * stk} height={26} rx={6} fill={F.gold3} />
        <rect x={20 + 300 - n * stk} y={56} width={Math.max(n * stk, 2)} height={26} rx={6} fill={F.rosaKraeftig} opacity="0.8" />
        <Txt x={20 + (300 - n * stk) / 2} y={74} gr={12}>{String(ergebnis)}</Txt>
        <Txt x={170} y={96} gr={11}>{`− ${n} (einmal die Zahl)`}</Txt>
      </svg>
      <Regler label="Zahl" wert={n} setze={setN} min={11} max={99} schritt={1} anzeige={n} />
      <Umschalter label="Faktor" wert={st} setze={setSt} optionen={[[1, "mal 9"], [2, "mal 99"]]} />
      <Messzeile><M t={`${n} \\cdot ${g - 1} = ${n} \\cdot ${g} - ${n} = ${gross} - ${n} = ${ergebnis}`} /></Messzeile>
    </div>
  );
}

export const BILDER_8 = {
  kreisGleichung: (p) => <KreisGleichung {...p} />,
  kugelSchnitt: (p) => <KugelSchnitt {...p} />,
  geomSumme: (p) => <GeomSumme {...p} />,
  linKomb: (p) => <LinKomb {...p} />,
  ewAb: (p) => <EwAb {...p} />,
  mindestensN: (p) => <MindestensN {...p} />,
  schnittwinkel: (p) => <Schnittwinkel {...p} />,
  betragFall: (p) => <BetragFall {...p} />,
  malNahe: (p) => <MalNahe {...p} />,
};
