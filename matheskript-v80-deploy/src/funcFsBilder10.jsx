/* ======================================================================
   FORMELSAMMLUNG · Illustrationen Teil 10
   Geometrie der Unterstufe (Koordinaten, Geraden, Winkel, Dreieckslinien,
   Kongruenz, Spiegelungen, Flächen- und Körpermodelle) sowie neue Bilder
   der Mittel- und Oberstufe (Funktionsgraphen, Wurzeln, Streckung,
   Kathetensatz, Haus der Vierecke, Raumdiagonale, Normalverteilung).
   ====================================================================== */
import React, { useRef, useState } from "react";
import { C } from "./base1.jsx";
import { M } from "./func3.jsx";
import { Achsen, Bogen, F, Griff, Hinweis, Messzeile, Pfeil, Punkt, RechterWinkel, Regler, Txt, Umschalter, klemm, koord, svgStil, useZiehen, z } from "./funcFsBasis.jsx";

/* ---------- kleine Geometrie-Helfer (SVG-Koordinaten) ---------- */
const pts = (arr) => arr.map((p) => p.map((v) => v.toFixed(2)).join(",")).join(" ");
const rad = (g) => (g * Math.PI) / 180;
const grad = (w) => (w * 180) / Math.PI;
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const mal = (a, k) => [a[0] * k, a[1] * k];
const laenge = (a) => Math.hypot(a[0], a[1]);
const abst = (a, b) => laenge(sub(a, b));
const einheit = (a) => { const l = laenge(a) || 1; return [a[0] / l, a[1] / l]; };
const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
const mitte = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
const senk = (a) => [-a[1], a[0]];
/* Innenwinkel bei P zwischen Q und R in Grad */
const winkelBei = (P, Q, R) => grad(Math.acos(klemm(dot(sub(Q, P), sub(R, P)) / (abst(Q, P) * abst(R, P) || 1), -1, 1)));
/* Winkelbogen bei P von Richtung Q nach Richtung R (immer der kleinere Bogen) */
function WBogen({ P, Q, R, r = 22, farbe = F.gold3 }) {
  const w1 = Math.atan2(Q[1] - P[1], Q[0] - P[0]), w2 = Math.atan2(R[1] - P[1], R[0] - P[0]);
  let d = w2 - w1;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d <= -Math.PI) d += 2 * Math.PI;
  return <Bogen x={P[0]} y={P[1]} r={r} w1={w1} w2={w1 + d} farbe={farbe} />;
}
/* Beschriftung in der Winkelmitte */
const winkelLabelPos = (P, Q, R, r = 34) => add(P, mal(einheit(add(einheit(sub(Q, P)), einheit(sub(R, P)))), r));
/* Lange Linie durch Punkt P mit Richtung d */
const Linie = ({ P, d, farbe = F.see, breite = 1.6, gestrichelt, l = 600 }) => {
  const u = einheit(d);
  return <line x1={P[0] - u[0] * l} y1={P[1] - u[1] * l} x2={P[0] + u[0] * l} y2={P[1] + u[1] * l} stroke={farbe} strokeWidth={breite} strokeDasharray={gestrichelt ? "5 4" : undefined} />;
};
const Strecke = ({ A, B, farbe = F.see, breite = 2, gestrichelt }) => (
  <line x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} stroke={farbe} strokeWidth={breite} strokeLinecap="round" strokeDasharray={gestrichelt ? "5 4" : undefined} />
);
/* Lotfußpunkt von P auf Gerade durch A, B */
const lotfuss = (P, A, B) => { const d = sub(B, A); const t = dot(sub(P, A), d) / dot(d, d); return add(A, mal(d, t)); };
const g0 = (v) => `${Math.round(v)}°`;
/* Ziehen mehrerer Punkte: wählt den nächsten Punkt im Umkreis */
function useMehrfachZiehen(punkte, setzePunkt, begrenze = (p) => p) {
  const aktiv = useRef(-1);
  return useZiehen((p, start) => {
    if (start) {
      let best = -1, bd = 34;
      punkte.forEach((q, i) => { const d = abst(p, q); if (d < bd) { bd = d; best = i; } });
      aktiv.current = best;
      if (best < 0) return false;
    }
    if (aktiv.current >= 0) setzePunkt(aktiv.current, begrenze(p, aktiv.current));
    return true;
  });
}
/* "1x" vermeiden: Koeffizient vor Variable */
const kx = (k, v = "x") => (k === 1 ? v : k === -1 ? `-${v}` : `${k}${v}`);

/* ======================= Koordinatensystem ======================= */
function KoordinatenPunkt() {
  const k = koord({ x0: -5, x1: 5, y0: -4, y1: 4, w: 340, h: 260 });
  const [P, setP] = useState([3, 2]);
  const zieh = useZiehen((p) => { setP([klemm(Math.round(k.ix(p[0])), -5, 5), klemm(Math.round(k.iy(p[1])), -4, 4)]); });
  const [x, y] = P;
  const quadrant = x === 0 || y === 0 ? "auf einer Achse" : x > 0 ? (y > 0 ? "I. Quadrant" : "IV. Quadrant") : (y > 0 ? "II. Quadrant" : "III. Quadrant");
  return (
    <div>
      <Hinweis>Zieh den Punkt: Erst nach rechts oder links (x), dann nach oben oder unten (y).</Hinweis>
      <svg viewBox="0 0 340 260" style={svgStil} role="img" aria-label={`Koordinatensystem mit Punkt P(${x} | ${y})`} {...zieh}>
        <Achsen k={k} schritt={1} />
        <Txt x={k.px(3.5)} y={k.py(3.4)} gr={10} farbe={F.achse} fett={false}>I</Txt>
        <Txt x={k.px(-3.5)} y={k.py(3.4)} gr={10} farbe={F.achse} fett={false}>II</Txt>
        <Txt x={k.px(-3.5)} y={k.py(-3.6)} gr={10} farbe={F.achse} fett={false}>III</Txt>
        <Txt x={k.px(3.5)} y={k.py(-3.6)} gr={10} farbe={F.achse} fett={false}>IV</Txt>
        <line x1={k.px(0)} x2={k.px(x)} y1={k.py(0)} y2={k.py(0)} stroke={F.see} strokeWidth="3.5" strokeLinecap="round" />
        <line x1={k.px(x)} x2={k.px(x)} y1={k.py(0)} y2={k.py(y)} stroke={F.gold3} strokeWidth="3.5" strokeLinecap="round" />
        <line x1={k.px(0)} x2={k.px(x)} y1={k.py(y)} y2={k.py(y)} stroke={F.achse} strokeDasharray="4 3" />
        <Griff x={k.px(x)} y={k.py(y)} farbe={F.rosaKraeftig} />
        <Txt x={k.px(x) + (x >= 0 ? 12 : -12)} y={k.py(y) - 12} anker={x >= 0 ? "start" : "end"} farbe={F.rosaKraeftig}>{`P(${z(x)} | ${z(y)})`}</Txt>
      </svg>
      <Regler label="x" wert={x} setze={(v) => setP([v, y])} min={-5} max={5} schritt={1} anzeige={z(x)} />
      <Regler label="y" wert={y} setze={(v) => setP([x, v])} min={-4} max={4} schritt={1} anzeige={z(y)} />
      <Messzeile><M t={`P(${z(x)} \\,|\\, ${z(y)})`} /> · <span style={{ color: C.grau, fontSize: 13 }}>{quadrant}</span></Messzeile>
    </div>
  );
}

/* ======================= Zwei Geraden ======================= */
function GeradenPaar({ art = "parallel" }) {
  const [w, setW] = useState(20);
  const [abstand, setAbstand] = useState(60);
  const [P, setP] = useState([200, 50]);
  const zieh = useZiehen((p) => { if (art === "abstand") setP([klemm(p[0], 20, 320), klemm(p[1], 15, 205)]); });
  const d = [Math.cos(rad(-w)), Math.sin(rad(-w))];
  const O = [170, 115];
  if (art === "parallel") {
    const n = senk(d);
    const O2 = add(O, mal(n, abstand));
    const O1 = add(O, mal(n, -abstand / 2)), O3 = add(O1, mal(n, abstand));
    const fA = add(O1, mal(d, -70)), fB = add(O1, mal(d, 70));
    return (
      <div>
        <Hinweis>Parallele Geraden haben überall denselben Abstand – sie schneiden sich nie.</Hinweis>
        <svg viewBox="0 0 340 230" style={svgStil} role="img" aria-label="Zwei parallele Geraden mit gleichem Abstand">
          <Linie P={O1} d={d} farbe={F.see} breite={2.4} />
          <Linie P={O3} d={d} farbe={F.gold3} breite={2.4} />
          {[fA, O1, fB].map((Q, i) => { const R = add(Q, mal(n, abstand)); return <g key={i}><Strecke A={Q} B={R} farbe={F.rosaKraeftig} breite={1.6} gestrichelt /><RechterWinkel x={Q[0]} y={Q[1]} u={d} v={n} g={8} /></g>; })}
          <Txt x={O1[0] + d[0] * 140 - n[0] * 14} y={O1[1] + d[1] * 140 - n[1] * 14} farbe={F.see}>g</Txt>
          <Txt x={O3[0] + d[0] * 140 + n[0] * 14} y={O3[1] + d[1] * 140 + n[1] * 14} farbe={F.gold3}>h</Txt>
        </svg>
        <Regler label="Richtung" wert={w} setze={setW} min={-60} max={60} schritt={1} anzeige={`${w}°`} />
        <Regler label="Abstand" wert={abstand} setze={setAbstand} min={20} max={110} schritt={1} anzeige={z(abstand / 20)} />
        <Messzeile><M t={`g \\parallel h, \\quad d = ${z(abstand / 20)}\\,\\text{cm} \\text{ an jeder Stelle}`} /></Messzeile>
        {void O2}
      </div>
    );
  }
  if (art === "senkrecht") {
    const n = senk(d);
    return (
      <div>
        <Hinweis>Zwei Geraden sind senkrecht zueinander, wenn sie einen rechten Winkel (90°) bilden. Dreh die Geraden – der Winkel bleibt 90°.</Hinweis>
        <svg viewBox="0 0 340 230" style={svgStil} role="img" aria-label="Zwei senkrechte Geraden">
          <Linie P={O} d={d} farbe={F.see} breite={2.4} />
          <Linie P={O} d={n} farbe={F.gold3} breite={2.4} />
          <RechterWinkel x={O[0]} y={O[1]} u={d} v={mal(n, -1)} g={14} farbe={F.rosaKraeftig} />
          <Punkt x={O[0]} y={O[1]} farbe={F.tinte} r={3.5} />
          <Txt x={O[0] + d[0] * 130} y={O[1] + d[1] * 130 - 10} farbe={F.see}>g</Txt>
          <Txt x={O[0] - n[0] * 95 + 12} y={O[1] - n[1] * 95} farbe={F.gold3}>h</Txt>
        </svg>
        <Regler label="Drehung" wert={w} setze={setW} min={-80} max={80} schritt={1} anzeige={`${w}°`} />
        <Messzeile><M t={"g \\perp h \\quad (\\text{Schnittwinkel } 90°)"} /></Messzeile>
      </div>
    );
  }
  /* Abstand Punkt–Gerade */
  const A = add(O, mal(d, -150)), B = add(O, mal(d, 150));
  const L = lotfuss(P, A, B);
  const dist = abst(P, L);
  const zweiter = add(L, mal(d, 55));
  return (
    <div>
      <Hinweis>Der Abstand ist die kürzeste Verbindung: das Lot. Zieh P – die gestrichelte Schrägstrecke ist immer länger.</Hinweis>
      <svg viewBox="0 0 340 230" style={svgStil} role="img" aria-label="Abstand eines Punktes von einer Geraden" {...zieh}>
        <Linie P={O} d={d} farbe={F.see} breite={2.4} />
        <Strecke A={P} B={zweiter} farbe={F.achse} breite={1.4} gestrichelt />
        <Strecke A={P} B={L} farbe={F.rosaKraeftig} breite={2.6} />
        <RechterWinkel x={L[0]} y={L[1]} u={d} v={einheit(sub(P, L))} g={9} />
        <Punkt x={L[0]} y={L[1]} farbe={F.rosaKraeftig} r={3.5} />
        <Griff x={P[0]} y={P[1]} farbe={F.rosaKraeftig} />
        <Txt x={P[0] + 12} y={P[1] - 8} anker="start" farbe={F.rosaKraeftig}>P</Txt>
        <Txt x={L[0] + 10} y={L[1] + 16} anker="start" gr={11}>L</Txt>
        <Txt x={O[0] + d[0] * 140} y={O[1] + d[1] * 140 - 10} farbe={F.see}>g</Txt>
      </svg>
      <Regler label="Richtung von g" wert={w} setze={setW} min={-45} max={45} schritt={1} anzeige={`${w}°`} />
      <Messzeile><M t={`d(P, g) = |PL| \\approx ${z(dist / 20)}\\,\\text{cm} < ${z(abst(P, zweiter) / 20)}\\,\\text{cm}`} /></Messzeile>
    </div>
  );
}

/* ======================= Winkelarten ======================= */
function WinkelArten() {
  const [a, setA] = useState(50);
  const S = [150, 130], r = 100;
  const name = a === 0 ? "Nullwinkel" : a < 90 ? "spitzer Winkel" : a === 90 ? "rechter Winkel" : a < 180 ? "stumpfer Winkel" : a === 180 ? "gestreckter Winkel" : a < 360 ? "überstumpfer Winkel" : "Vollwinkel";
  const E = [S[0] + r * Math.cos(rad(-a)), S[1] + r * Math.sin(rad(-a))];
  const voll = a >= 360;
  return (
    <div>
      <Hinweis>Dreh den zweiten Schenkel. Der Name des Winkels wechselt bei 90°, 180° und 360°.</Hinweis>
      <svg viewBox="0 0 340 250" style={svgStil} role="img" aria-label={`Winkel von ${a} Grad: ${name}`}>
        {voll ? <circle cx={S[0]} cy={S[1]} r={30} fill={F.gold} fillOpacity="0.6" stroke={F.gold3} strokeWidth="1.5" />
          : a === 90 ? <RechterWinkel x={S[0]} y={S[1]} u={[1, 0]} v={[0, -1]} g={22} farbe={F.gold3} />
          : a > 0 && <Bogen x={S[0]} y={S[1]} r={30} w1={0} w2={-rad(a)} farbe={F.gold3} />}
        <Strecke A={S} B={[S[0] + r + 40, S[1]]} farbe={F.see} breite={2.6} />
        <Strecke A={S} B={E} farbe={F.rosaKraeftig} breite={2.6} />
        <Punkt x={S[0]} y={S[1]} farbe={F.tinte} r={4} />
        <Txt x={S[0] - 10} y={S[1] + 18} gr={11}>S</Txt>
        <Txt x={S[0] + 50 * Math.cos(rad(-a / 2)) + (voll ? 30 : 0)} y={S[1] + 50 * Math.sin(rad(-a / 2)) + 4} farbe={F.gold3}>α</Txt>
        {[90, 180, 270].map((m) => <circle key={m} cx={S[0] + (r + 12) * Math.cos(rad(-m))} cy={S[1] + (r + 12) * Math.sin(rad(-m))} r={2.4} fill={F.achse} />)}
      </svg>
      <Regler label="α" wert={a} setze={setA} min={0} max={360} schritt={1} anzeige={`${a}°`} />
      <Messzeile><M t={`\\alpha = ${a}°`} /> · <b style={{ color: C.see }}>{name}</b></Messzeile>
    </div>
  );
}

/* ======================= Scheitel-, Neben-, Stufen-, Wechselwinkel ======================= */
function WinkelPaar({ art = "scheitel" }) {
  const [a, setA] = useState(60);
  const [zeig, setZeig] = useState("stufen");
  if (art === "scheitel") {
    const S = [170, 115], d1 = [1, 0], d2 = [Math.cos(rad(-a)), Math.sin(rad(-a))];
    const p = (v, l = 150) => add(S, mal(v, l));
    return (
      <div>
        <Hinweis>Zwei Geraden schneiden sich. Gegenüberliegende Winkel (Scheitelwinkel) sind gleich, benachbarte (Nebenwinkel) ergeben 180°.</Hinweis>
        <svg viewBox="0 0 340 230" style={svgStil} role="img" aria-label="Scheitelwinkel und Nebenwinkel an zwei sich schneidenden Geraden">
          <WBogen P={S} Q={p(d1)} R={p(d2)} r={30} farbe={F.gold3} />
          <WBogen P={S} Q={p(mal(d1, -1))} R={p(mal(d2, -1))} r={30} farbe={F.gold3} />
          <WBogen P={S} Q={p(d2)} R={p(mal(d1, -1))} r={24} farbe={F.see} />
          <WBogen P={S} Q={p(mal(d2, -1))} R={p(d1)} r={24} farbe={F.see} />
          <Linie P={S} d={d1} farbe={F.tinte} breite={2} />
          <Linie P={S} d={d2} farbe={F.tinte} breite={2} />
          {[["α", d1, d2, F.gold3], ["β", d2, mal(d1, -1), F.see], ["γ", mal(d1, -1), mal(d2, -1), F.gold3], ["δ", mal(d2, -1), d1, F.see]].map(([t, u, v, f]) => {
            const q = winkelLabelPos(S, p(u), p(v), 46);
            return <Txt key={t} x={q[0]} y={q[1] + 4} farbe={f}>{t}</Txt>;
          })}
        </svg>
        <Regler label="α" wert={a} setze={setA} min={15} max={165} schritt={1} anzeige={`${a}°`} />
        <Messzeile><M t={`\\alpha = \\gamma = ${a}°, \\quad \\beta = \\delta = 180° - ${a}° = ${180 - a}°`} /></Messzeile>
      </div>
    );
  }
  /* Stufen- und Wechselwinkel an Parallelen */
  const y1 = 70, y2 = 160, d = [Math.cos(rad(-a)), Math.sin(rad(-a))];
  const S1 = [170 + (115 - y1) / Math.tan(rad(a)), y1], S2 = [170 + (115 - y2) / Math.tan(rad(a)), y2];
  const re = [1, 0], li = [-1, 0], hoch = d, runter = mal(d, -1);
  const p = (S, v) => add(S, mal(v, 60));
  return (
    <div>
      <Hinweis>{zeig === "stufen" ? "Stufenwinkel liegen an beiden Parallelen auf derselben Seite – wie Stufen einer Treppe. Sie sind gleich groß." : "Wechselwinkel liegen auf verschiedenen Seiten der schneidenden Geraden (Z-Form). Auch sie sind gleich groß."}</Hinweis>
      <svg viewBox="0 0 340 230" style={svgStil} role="img" aria-label="Stufen- und Wechselwinkel an zwei Parallelen">
        <WBogen P={S1} Q={p(S1, re)} R={p(S1, hoch)} r={26} farbe={F.gold3} />
        {zeig === "stufen"
          ? <WBogen P={S2} Q={p(S2, re)} R={p(S2, hoch)} r={26} farbe={F.gold3} />
          : <WBogen P={S2} Q={p(S2, li)} R={p(S2, runter)} r={26} farbe={F.gold3} />}
        <line x1={0} x2={340} y1={y1} y2={y1} stroke={F.see} strokeWidth="2.2" />
        <line x1={0} x2={340} y1={y2} y2={y2} stroke={F.see} strokeWidth="2.2" />
        <Linie P={S1} d={d} farbe={F.tinte} breite={2} />
        {(() => { const q = winkelLabelPos(S1, p(S1, re), p(S1, hoch), 40); return <Txt x={q[0]} y={q[1] + 4} farbe={F.gold3}>α</Txt>; })()}
        {(() => { const q = zeig === "stufen" ? winkelLabelPos(S2, p(S2, re), p(S2, hoch), 40) : winkelLabelPos(S2, p(S2, li), p(S2, runter), 40); return <Txt x={q[0]} y={q[1] + 4} farbe={F.gold3}>{zeig === "stufen" ? "α′" : "α″"}</Txt>; })()}
        <Txt x={18} y={y1 - 8} farbe={F.see} anker="start">g</Txt>
        <Txt x={18} y={y2 - 8} farbe={F.see} anker="start">h</Txt>
        <Txt x={300} y={y1 + (y2 - y1) / 2 + 4} gr={11} farbe={F.see}>g ∥ h</Txt>
      </svg>
      <Umschalter label="Winkelpaar" wert={zeig} setze={setZeig} optionen={[["stufen", "Stufenwinkel"], ["wechsel", "Wechselwinkel"]]} />
      <Regler label="α" wert={a} setze={setA} min={30} max={150} schritt={1} anzeige={`${a}°`} />
      <Messzeile><M t={zeig === "stufen" ? `\\alpha = \\alpha′ = ${a}°` : `\\alpha = \\alpha″ = ${a}°`} /></Messzeile>
    </div>
  );
}

/* ======================= Winkelsumme im n-Eck ======================= */
function VieleckWinkel() {
  const [n, setN] = useState(4);
  const cx = 170, cy = 112, r = 92;
  const ecken = Array.from({ length: n }, (_, i) => {
    const w = -Math.PI / 2 + (2 * Math.PI * i) / n + 0.2;
    const s = 1 + 0.12 * Math.sin(i * 2.3);
    return [cx + r * s * Math.cos(w), cy + r * s * Math.sin(w)];
  });
  const farben = [F.blau, F.gold, F.gruen, F.rosa, F.blauMittel, F.gold2];
  return (
    <div>
      <Hinweis>Von einer Ecke aus zerfällt jedes n-Eck in n − 2 Dreiecke. Jedes trägt 180° bei.</Hinweis>
      <svg viewBox="0 0 340 225" style={svgStil} role="img" aria-label={`${n}-Eck in ${n - 2} Dreiecke zerlegt`}>
        {Array.from({ length: n - 2 }, (_, i) => (
          <polygon key={i} points={pts([ecken[0], ecken[i + 1], ecken[i + 2]])} fill={farben[i % farben.length]} stroke={C.weiss} strokeWidth="1" />
        ))}
        <polygon points={pts(ecken)} fill="none" stroke={F.see} strokeWidth="2.4" strokeLinejoin="round" />
        {ecken.slice(2, n - 1).map((q, i) => <Strecke key={i} A={ecken[0]} B={q} farbe={F.see} breite={1.2} gestrichelt />)}
        {Array.from({ length: n - 2 }, (_, i) => {
          const m = [(ecken[0][0] + ecken[i + 1][0] + ecken[i + 2][0]) / 3, (ecken[0][1] + ecken[i + 1][1] + ecken[i + 2][1]) / 3];
          return <Txt key={i} x={m[0]} y={m[1] + 4} gr={10} farbe={F.tinte}>180°</Txt>;
        })}
        <Punkt x={ecken[0][0]} y={ecken[0][1]} farbe={F.rosaKraeftig} r={4.5} />
      </svg>
      <Regler label="Ecken n" wert={n} setze={setN} min={3} max={8} schritt={1} anzeige={n} />
      <Messzeile><M t={`(${n} - 2) \\cdot 180° = ${(n - 2) * 180}°`} /></Messzeile>
    </div>
  );
}

/* ======================= Linien im Dreieck ======================= */
function umkreis(A, B, Cc) {
  const d = 2 * (A[0] * (B[1] - Cc[1]) + B[0] * (Cc[1] - A[1]) + Cc[0] * (A[1] - B[1]));
  const a2 = dot(A, A), b2 = dot(B, B), c2 = dot(Cc, Cc);
  return [(a2 * (B[1] - Cc[1]) + b2 * (Cc[1] - A[1]) + c2 * (A[1] - B[1])) / d, (a2 * (Cc[0] - B[0]) + b2 * (A[0] - Cc[0]) + c2 * (B[0] - A[0])) / d];
}
function DreieckLinien({ art = "mittelsenkrechte" }) {
  const [E, setE] = useState([[70, 180], [270, 180], [150, 50]]);
  const [h, setH] = useState(110);
  const [s, setS] = useState(150);
  const [la, setLa] = useState(5);
  const [lb, setLb] = useState(4);
  const [lc, setLc] = useState(7);
  const begrenze = (p) => [klemm(p[0], 20, 320), klemm(p[1], 20, 215)];
  const zieh = useMehrfachZiehen(art === "aussenwinkel" ? [E[2]] : E, (i, p) => setE((alt) => alt.map((q, j) => (j === (art === "aussenwinkel" ? 2 : i) ? p : q))), begrenze);
  const ecke = (P, t, f = F.tinte, dx = 0, dy = 0) => <Txt x={P[0] + dx} y={P[1] + dy} farbe={f}>{t}</Txt>;

  if (art === "gleichschenklig" || art === "gleichseitig") {
    const gs = art === "gleichseitig";
    const A = gs ? [170 - s / 2, 190] : [80, 190], B = gs ? [170 + s / 2, 190] : [260, 190];
    const Cc = gs ? [170, 190 - (s * Math.sqrt(3)) / 2] : [170, 190 - h];
    const al = winkelBei(A, B, Cc), be = winkelBei(B, A, Cc), ga = winkelBei(Cc, A, B);
    const strich = (P, Q, n) => { const m = mitte(P, Q), u = einheit(sub(Q, P)), v = senk(u); return Array.from({ length: n }, (_, i) => { const o = add(m, mal(u, (i - (n - 1) / 2) * 4)); return <Strecke key={i} A={add(o, mal(v, -5))} B={add(o, mal(v, 5))} farbe={F.rosaKraeftig} breite={1.6} />; }); };
    return (
      <div>
        <Hinweis>{gs ? "Alle drei Seiten gleich lang – dann sind auch alle drei Winkel gleich: je 60°." : "Zwei gleich lange Schenkel – dann sind die beiden Basiswinkel gleich groß. Die Symmetrieachse halbiert die Basis."}</Hinweis>
        <svg viewBox="0 0 340 220" style={svgStil} role="img" aria-label={gs ? "Gleichseitiges Dreieck" : "Gleichschenkliges Dreieck mit Symmetrieachse"}>
          <polygon points={pts([A, B, Cc])} fill={F.blau} stroke={F.see} strokeWidth="2" strokeLinejoin="round" />
          {!gs && <Strecke A={Cc} B={[170, 205]} farbe={F.gruenKraeftig} breite={1.4} gestrichelt />}
          <WBogen P={A} Q={B} R={Cc} farbe={F.gold3} />
          <WBogen P={B} Q={A} R={Cc} farbe={F.gold3} />
          {gs && <WBogen P={Cc} Q={A} R={B} farbe={F.gold3} />}
          {strich(A, Cc, 1)}{strich(B, Cc, 1)}{gs && strich(A, B, 1)}
          {ecke(A, "A", F.tinte, -10, 14)}{ecke(B, "B", F.tinte, 10, 14)}{ecke(Cc, "C", F.tinte, 0, -10)}
        </svg>
        {gs ? <Regler label="Seite a" wert={s} setze={setS} min={80} max={220} schritt={1} anzeige={z(s / 30)} />
          : <Regler label="Höhe" wert={h} setze={setH} min={30} max={170} schritt={1} anzeige={z(h / 30)} />}
        <Messzeile>{gs ? <M t={`a = b = c, \\quad \\alpha = \\beta = \\gamma = ${Math.round(ga)}°`} />
          : <M t={`a = b \\;\\Rightarrow\\; \\alpha = \\beta = ${Math.round(al)}°, \\quad \\gamma = ${Math.round(ga)}°`} />}</Messzeile>
        {void be}
      </div>
    );
  }

  if (art === "ungleichung") {
    const u = 24, A = [170 - (lc * u) / 2, 180], B = [170 + (lc * u) / 2, 180];
    const ok = la + lb > lc && la + lc > lb && lb + lc > la;
    let Cc = null;
    if (ok) { const x = (lb * lb - la * la + lc * lc) / (2 * lc), y = Math.sqrt(Math.max(0, lb * lb - x * x)); Cc = [A[0] + x * u, A[1] - y * u]; }
    return (
      <div>
        <Hinweis>Nur wenn je zwei Seiten zusammen länger sind als die dritte, treffen sich die Seiten zu einem Dreieck.</Hinweis>
        <svg viewBox="0 0 340 215" style={svgStil} role="img" aria-label={ok ? "Dreieck aus drei Seiten" : "Drei Seiten, die kein Dreieck bilden"}>
          <Strecke A={A} B={B} farbe={F.see} breite={3} />
          {ok ? (
            <>
              <polygon points={pts([A, B, Cc])} fill={F.blau} fillOpacity="0.6" stroke="none" />
              <Strecke A={A} B={Cc} farbe={F.gold3} breite={3} />
              <Strecke A={B} B={Cc} farbe={F.rosaKraeftig} breite={3} />
              {ecke(Cc, "C", F.tinte, 0, -10)}
            </>
          ) : (
            <>
              <circle cx={A[0]} cy={A[1]} r={lb * u} fill="none" stroke={F.gold3} strokeDasharray="3 4" />
              <circle cx={B[0]} cy={B[1]} r={la * u} fill="none" stroke={F.rosaKraeftig} strokeDasharray="3 4" />
              <Strecke A={A} B={add(A, mal(einheit([1, -0.6]), lb * u))} farbe={F.gold3} breite={3} />
              <Strecke A={B} B={add(B, mal(einheit([-1, -0.6]), la * u))} farbe={F.rosaKraeftig} breite={3} />
            </>
          )}
          {ecke(A, "A", F.tinte, -10, 16)}{ecke(B, "B", F.tinte, 10, 16)}
          <Txt x={170} y={198} gr={11} farbe={F.see}>c</Txt>
        </svg>
        <Regler label="a" wert={la} setze={setLa} min={1} max={10} schritt={0.5} anzeige={z(la)} />
        <Regler label="b" wert={lb} setze={setLb} min={1} max={10} schritt={0.5} anzeige={z(lb)} />
        <Regler label="c" wert={lc} setze={setLc} min={1} max={12} schritt={0.5} anzeige={z(lc)} />
        <Messzeile><M t={`a + b = ${z(la + lb)} ${la + lb > lc ? ">" : "\\le"} ${z(lc)} = c`} /> · <b style={{ color: ok ? F.gruenKraeftig : F.rosaKraeftig }}>{ok ? "Dreieck möglich" : "kein Dreieck"}</b></Messzeile>
      </div>
    );
  }

  const [A, B, Cc] = E;
  const al = winkelBei(A, B, Cc), be = winkelBei(B, A, Cc), ga = winkelBei(Cc, A, B);
  const dreieck = <polygon points={pts([A, B, Cc])} fill={F.blau} fillOpacity="0.55" stroke={F.see} strokeWidth="2" strokeLinejoin="round" />;
  const namen = (
    <>
      {[[A, "A"], [B, "B"], [Cc, "C"]].map(([P, t]) => {
        const m = [(A[0] + B[0] + Cc[0]) / 3, (A[1] + B[1] + Cc[1]) / 3], o = add(P, mal(einheit(sub(P, m)), 16));
        return <Txt key={t} x={o[0]} y={o[1] + 4}>{t}</Txt>;
      })}
    </>
  );
  const griffe = (art === "aussenwinkel" ? [Cc] : E).map((P, i) => <Griff key={i} x={P[0]} y={P[1]} farbe={F.see} />);

  if (art === "aussenwinkel") {
    const V = add(Cc, mal(einheit(sub(Cc, A)), 70));
    return (
      <div>
        <Hinweis>Verlängert man AC über C hinaus, entsteht der Außenwinkel δ. Er ist so groß wie die beiden anderen Innenwinkel zusammen. Zieh C.</Hinweis>
        <svg viewBox="0 0 340 225" style={svgStil} role="img" aria-label="Außenwinkel am Dreieck" {...zieh}>
          {dreieck}
          <Strecke A={Cc} B={V} farbe={F.see} breite={1.6} gestrichelt />
          <WBogen P={A} Q={B} R={Cc} farbe={F.gold3} />
          <WBogen P={B} Q={Cc} R={A} farbe={F.gruenKraeftig} />
          <WBogen P={Cc} Q={B} R={V} r={26} farbe={F.rosaKraeftig} />
          {(() => { const q = winkelLabelPos(Cc, B, V, 40); return <Txt x={q[0]} y={q[1] + 4} farbe={F.rosaKraeftig}>δ</Txt>; })()}
          {(() => { const q = winkelLabelPos(A, B, Cc, 36); return <Txt x={q[0]} y={q[1] + 4} farbe={F.gold3}>α</Txt>; })()}
          {(() => { const q = winkelLabelPos(B, A, Cc, 36); return <Txt x={q[0]} y={q[1] + 4} farbe={F.gruenKraeftig}>β</Txt>; })()}
          {namen}{griffe}
        </svg>
        <Messzeile><M t={`\\delta = ${Math.round(180 - ga)}° = ${Math.round(al)}° + ${Math.round(be)}° = \\alpha + \\beta`} /></Messzeile>
      </div>
    );
  }

  if (art === "mittelsenkrechte") {
    const U = umkreis(A, B, Cc), R = abst(U, A);
    const seiten = [[A, B], [B, Cc], [Cc, A]];
    return (
      <div>
        <Hinweis>Jeder Punkt der Mittelsenkrechten ist von beiden Endpunkten gleich weit entfernt. Alle drei schneiden sich im Umkreismittelpunkt U. Zieh an den Ecken.</Hinweis>
        <svg viewBox="0 0 340 225" style={svgStil} role="img" aria-label="Mittelsenkrechten und Umkreis eines Dreiecks" {...zieh}>
          <circle cx={U[0]} cy={U[1]} r={R} fill="none" stroke={F.gold3} strokeWidth="1.8" />
          {dreieck}
          {seiten.map(([P, Q], i) => { const m = mitte(P, Q), d = senk(sub(Q, P)); return <g key={i}><Linie P={m} d={d} farbe={F.rosaKraeftig} breite={1.3} gestrichelt /><RechterWinkel x={m[0]} y={m[1]} u={einheit(sub(Q, P))} v={einheit(d)} g={7} farbe={F.rosaKraeftig} /></g>; })}
          <Strecke A={U} B={A} farbe={F.gold3} breite={1.2} />
          <Punkt x={U[0]} y={U[1]} farbe={F.gold3} r={4.5} />
          <Txt x={U[0] + 10} y={U[1] - 8} anker="start" farbe={F.gold3}>U</Txt>
          {namen}{griffe}
        </svg>
        <Messzeile><M t={`|UA| = |UB| = |UC| = r \\approx ${z(R / 30)}`} /></Messzeile>
      </div>
    );
  }

  if (art === "winkelhalbierende") {
    const a = abst(B, Cc), b = abst(A, Cc), c = abst(A, B);
    const I = mal(add(add(mal(A, a), mal(B, b)), mal(Cc, c)), 1 / (a + b + c));
    const s2 = (a + b + c) / 2, flaeche = Math.sqrt(Math.max(0, s2 * (s2 - a) * (s2 - b) * (s2 - c))), r = flaeche / s2;
    const fuesse = [lotfuss(I, A, B), lotfuss(I, B, Cc), lotfuss(I, Cc, A)];
    return (
      <div>
        <Hinweis>Jeder Punkt der Winkelhalbierenden hat zu beiden Schenkeln denselben Abstand. Alle drei treffen sich im Inkreismittelpunkt I.</Hinweis>
        <svg viewBox="0 0 340 225" style={svgStil} role="img" aria-label="Winkelhalbierende und Inkreis eines Dreiecks" {...zieh}>
          {dreieck}
          <circle cx={I[0]} cy={I[1]} r={r} fill={F.gold} fillOpacity="0.5" stroke={F.gold3} strokeWidth="1.8" />
          {[A, B, Cc].map((P, i) => <Strecke key={i} A={P} B={add(P, mal(einheit(sub(I, P)), abst(I, P) + 30))} farbe={F.rosaKraeftig} breite={1.3} gestrichelt />)}
          {fuesse.map((Q, i) => <Strecke key={i} A={I} B={Q} farbe={F.gold3} breite={1.2} />)}
          <Punkt x={I[0]} y={I[1]} farbe={F.gold3} r={4.5} />
          <Txt x={I[0] + 9} y={I[1] - 7} anker="start" farbe={F.gold3}>I</Txt>
          {namen}{griffe}
        </svg>
        <Messzeile><M t={`\\text{Abstand von I zu allen drei Seiten: } \\rho \\approx ${z(r / 30)}`} /></Messzeile>
      </div>
    );
  }

  /* Höhen */
  const U = umkreis(A, B, Cc), H = sub(add(add(A, B), Cc), mal(U, 2));
  const hoehen = [[Cc, A, B, "h_c"], [A, B, Cc, "h_a"], [B, Cc, A, "h_b"]];
  return (
    <div>
      <Hinweis>Eine Höhe ist das Lot von einer Ecke auf die gegenüberliegende Seite (oder ihre Verlängerung). Alle drei Höhen schneiden sich in einem Punkt H.</Hinweis>
      <svg viewBox="0 0 340 225" style={svgStil} role="img" aria-label="Die drei Höhen eines Dreiecks" {...zieh}>
        {dreieck}
        {hoehen.map(([P, Q, R], i) => {
          const L = lotfuss(P, Q, R);
          const tq = dot(sub(L, Q), sub(R, Q)) / dot(sub(R, Q), sub(R, Q));
          const aussen = tq < 0 || tq > 1;
          return (
            <g key={i}>
              {aussen && <Strecke A={tq < 0 ? Q : R} B={L} farbe={F.achse} breite={1.2} gestrichelt />}
              <Strecke A={P} B={L} farbe={i === 0 ? F.rosaKraeftig : F.gold3} breite={i === 0 ? 2.2 : 1.4} />
              {abst(P, L) > 12 && <RechterWinkel x={L[0]} y={L[1]} u={einheit(sub(R, Q))} v={einheit(sub(P, L))} g={7} />}
            </g>
          );
        })}
        <Strecke A={H} B={Cc} farbe={F.achse} breite={1} gestrichelt />
        <Punkt x={H[0]} y={H[1]} farbe={F.tinte} r={3.5} />
        <Txt x={H[0] + 9} y={H[1] + 4} anker="start" gr={11}>H</Txt>
        {namen}{griffe}
      </svg>
      <Messzeile><M t={`h_c \\perp c, \\quad h_c \\approx ${z(abst(Cc, lotfuss(Cc, A, B)) / 30)}, \\quad A_{\\triangle} = \\frac{1}{2} \\cdot c \\cdot h_c \\approx ${z((abst(A, B) * abst(Cc, lotfuss(Cc, A, B))) / 2 / 900)}`} /></Messzeile>
    </div>
  );
}

/* ======================= Kongruenzsätze ======================= */
function KongruenzBild({ satz: start = "SSS" }) {
  const [satz, setSatz] = useState(start);
  const [dreh, setDreh] = useState(140);
  const T = [[25, 165], [145, 165], [65, 85]];
  const sp = [(T[0][0] + T[1][0] + T[2][0]) / 3, (T[0][1] + T[1][1] + T[2][1]) / 3];
  const T2 = T.map((P) => { const v = sub(P, sp), w = rad(dreh); return add([245, 120], [v[0] * Math.cos(w) - v[1] * Math.sin(w), v[0] * Math.sin(w) + v[1] * Math.cos(w)]); });
  /* gegeben: Seiten c=AB, a=BC, b=CA; Winkel α(A), β(B), γ(C) */
  const geg = { SSS: { s: ["c", "a", "b"], w: [] }, SWS: { s: ["c", "b"], w: ["α"] }, WSW: { s: ["c"], w: ["α", "β"] }, SsW: { s: ["c", "a"], w: ["γ"] } }[satz];
  const text = { SSS: "Stimmen alle drei Seiten überein, sind die Dreiecke deckungsgleich.", SWS: "Zwei Seiten und der Winkel dazwischen legen das Dreieck fest.", WSW: "Eine Seite und die beiden anliegenden Winkel legen das Dreieck fest.", SsW: "Zwei Seiten und der Winkel gegenüber der längeren Seite legen das Dreieck fest." }[satz];
  const zeichne = (D, k) => {
    const [A, B, Cc] = D;
    const seiten = { c: [A, B], a: [B, Cc], b: [Cc, A] };
    const winkel = { α: [A, B, Cc], β: [B, Cc, A], γ: [Cc, A, B] };
    const farbS = { c: F.see, a: F.rosaKraeftig, b: F.gruenKraeftig };
    return (
      <g key={k}>
        <polygon points={pts(D)} fill={k ? F.gold : F.blau} fillOpacity="0.55" stroke={F.achse} strokeWidth="1.2" />
        {geg.w.map((w) => { const [P, Q, R] = winkel[w]; return <WBogen key={w} P={P} Q={Q} R={R} r={20} farbe={F.gold3} />; })}
        {geg.s.map((s) => <Strecke key={s} A={seiten[s][0]} B={seiten[s][1]} farbe={farbS[s]} breite={3.2} />)}
        {geg.w.map((w) => { const [P, Q, R] = winkel[w]; const q = winkelLabelPos(P, Q, R, 32); return <Txt key={w} x={q[0]} y={q[1] + 4} gr={11} farbe={F.gold3}>{w}</Txt>; })}
      </g>
    );
  };
  return (
    <div>
      <Hinweis>{text} Dreh das zweite Dreieck – es passt genau auf das erste.</Hinweis>
      <svg viewBox="0 0 340 215" style={svgStil} role="img" aria-label={`Kongruenzsatz ${satz}: zwei deckungsgleiche Dreiecke`}>
        {zeichne(T, 0)}{zeichne(T2, 1)}
        <Txt x={85} y={200} gr={11} farbe={F.grau}>Dreieck 1</Txt>
        <Txt x={245} y={205} gr={11} farbe={F.grau}>Dreieck 2</Txt>
      </svg>
      <Umschalter label="Kongruenzsatz" wert={satz} setze={setSatz} optionen={[["SSS", "SSS"], ["SWS", "SWS"], ["WSW", "WSW"], ["SsW", "SsW"]]} />
      <Regler label="Drehung" wert={dreh} setze={setDreh} min={0} max={360} schritt={1} anzeige={`${dreh}°`} />
      <Messzeile><M t={`\\triangle_1 \\cong \\triangle_2 \\quad (${satz})`} /></Messzeile>
    </div>
  );
}

/* ======================= Achsen- und Punktspiegelung ======================= */
function Spiegelung({ art = "achse" }) {
  const [P, setP] = useState([95, 70]);
  const [phi, setPhi] = useState(0);
  const zieh = useZiehen((p) => setP([klemm(p[0], 15, 325), klemm(p[1], 15, 210)]));
  const O = [170, 115];
  const figur = [P, [P[0] + 30, P[1] + 55], [P[0] - 25, P[1] + 45]];
  if (art === "achse") {
    const u = [Math.sin(rad(phi)), -Math.cos(rad(phi))];
    const spieg = (Q) => { const f = add(O, mal(u, dot(sub(Q, O), u))); return sub(mal(f, 2), Q); };
    const bild = figur.map(spieg);
    const L = add(O, mal(u, dot(sub(P, O), u)));
    return (
      <div>
        <Hinweis>Die Achse ist die Mittelsenkrechte von PP′: PP′ steht senkrecht auf ihr und wird von ihr halbiert. Zieh P.</Hinweis>
        <svg viewBox="0 0 340 225" style={svgStil} role="img" aria-label="Achsenspiegelung eines Dreiecks" {...zieh}>
          <Linie P={O} d={u} farbe={F.gruenKraeftig} breite={2} gestrichelt />
          <polygon points={pts(figur)} fill={F.blau} stroke={F.see} strokeWidth="1.8" />
          <polygon points={pts(bild)} fill={F.gold} stroke={F.gold3} strokeWidth="1.8" />
          <Strecke A={P} B={bild[0]} farbe={F.rosaKraeftig} breite={1.4} gestrichelt />
          {abst(P, L) > 10 && <RechterWinkel x={L[0]} y={L[1]} u={u} v={einheit(sub(P, L))} g={8} farbe={F.rosaKraeftig} />}
          <Griff x={P[0]} y={P[1]} farbe={F.see} />
          <Txt x={P[0] - 10} y={P[1] - 12} farbe={F.see}>P</Txt>
          <Txt x={bild[0][0] + 10} y={bild[0][1] - 12} farbe={F.gold3}>P′</Txt>
        </svg>
        <Regler label="Achse kippen" wert={phi} setze={setPhi} min={-50} max={50} schritt={1} anzeige={`${phi}°`} />
        <Messzeile><M t={`|PL| = |LP′| = ${z(abst(P, L) / 30)}, \\quad PP′ \\perp a`} /></Messzeile>
      </div>
    );
  }
  const bild = figur.map((Q) => sub(mal(O, 2), Q));
  return (
    <div>
      <Hinweis>Bei der Punktspiegelung ist Z der Mittelpunkt jeder Strecke PP′ – das Bild ist um 180° gedreht. Zieh P.</Hinweis>
      <svg viewBox="0 0 340 225" style={svgStil} role="img" aria-label="Punktspiegelung eines Dreiecks am Zentrum Z" {...zieh}>
        <polygon points={pts(figur)} fill={F.blau} stroke={F.see} strokeWidth="1.8" />
        <polygon points={pts(bild)} fill={F.gold} stroke={F.gold3} strokeWidth="1.8" />
        {figur.map((Q, i) => <Strecke key={i} A={Q} B={bild[i]} farbe={i ? F.achse : F.rosaKraeftig} breite={i ? 1 : 1.5} gestrichelt />)}
        <Punkt x={O[0]} y={O[1]} farbe={F.tinte} r={4.5} />
        <Txt x={O[0] + 10} y={O[1] - 8} anker="start">Z</Txt>
        <Griff x={P[0]} y={P[1]} farbe={F.see} />
        <Txt x={P[0] - 10} y={P[1] - 12} farbe={F.see}>P</Txt>
        <Txt x={bild[0][0] + 12} y={bild[0][1] + 4} anker="start" farbe={F.gold3}>P′</Txt>
      </svg>
      <Messzeile><M t={`|PZ| = |ZP′| = ${z(abst(P, O) / 30)}`} /></Messzeile>
    </div>
  );
}

/* ======================= Flächenmodell für Terme ======================= */
function FlaechenModell({ modus = "ausmultiplizieren" }) {
  const [a, setA] = useState(3);
  const [b, setB] = useState(2);
  const [c, setC] = useState(4);
  const [d, setD] = useState(3);
  const [weg, setWeg] = useState(1);
  const u = 22;
  if (modus === "zusammenfassen") {
    const X = 2.6 * u;
    const reihe = (n, y, fill, stroke, startX = 20) => Array.from({ length: n }, (_, i) => (
      <g key={i}><rect x={startX + i * (X + 4)} y={y} width={X} height={u} rx="4" fill={fill} stroke={stroke} strokeWidth="1.3" /><Txt x={startX + i * (X + 4) + X / 2} y={y + u / 2 + 4} gr={11} farbe={stroke}>x</Txt></g>
    ));
    const rest = a + b - weg;
    return (
      <div>
        <Hinweis>Jeder Streifen hat die Länge x. Gleichartige Terme sind Streifen derselben Sorte – man zählt sie einfach.</Hinweis>
        <svg viewBox="0 0 340 170" style={svgStil} role="img" aria-label="Streifen der Länge x zusammenzählen">
          {reihe(a, 15, F.blau, F.see)}
          {reihe(b, 15 + u + 10, F.gold, F.gold3)}
          {Array.from({ length: weg }, (_, i) => { const x0 = 20 + i * (X + 4); return <g key={i}><rect x={x0} y={15 + 2 * (u + 10)} width={X} height={u} rx="4" fill={F.rosa} stroke={F.rosaKraeftig} strokeWidth="1.3" strokeDasharray="4 3" /><Txt x={x0 + X / 2} y={15 + 2 * (u + 10) + u / 2 + 4} gr={11} farbe={F.rosaKraeftig}>−x</Txt></g>; })}
          <line x1={15} x2={325} y1={118} y2={118} stroke={F.achse} />
          {reihe(rest, 128, F.gruen, F.gruenKraeftig)}
        </svg>
        <Regler label="blau" wert={a} setze={setA} min={1} max={5} schritt={1} anzeige={a} />
        <Regler label="gold" wert={b} setze={setB} min={0} max={4} schritt={1} anzeige={b} />
        <Regler label="weg" wert={weg} setze={(v) => setWeg(Math.min(v, a + b))} min={0} max={3} schritt={1} anzeige={weg} />
        <Messzeile><M t={`${kx(a)}${b ? ` + ${kx(b)}` : ""}${weg ? ` - ${kx(weg)}` : ""} = ${rest === 0 ? "0" : kx(rest)}`} /></Messzeile>
      </div>
    );
  }
  if (modus === "klammer") {
    const sx = 40, sy = 20, W = (c + d) * u, H = (a + b) * u;
    const felder = [[0, 0, c, a, F.blau, F.see, `${a * c}`, "ac"], [c, 0, d, a, F.gold, F.gold3, `${a * d}`, "ad"], [0, a, c, b, F.gruen, F.gruenKraeftig, `${b * c}`, "bc"], [c, a, d, b, F.rosa, F.rosaKraeftig, `${b * d}`, "bd"]];
    return (
      <div>
        <Hinweis>Ein Rechteck mit den Seiten (a + b) und (c + d) zerfällt in vier Teilrechtecke: Jeder Summand wird mit jedem multipliziert.</Hinweis>
        <svg viewBox={`0 0 340 ${Math.max(200, H + 50)}`} style={svgStil} role="img" aria-label="Rechteck aus vier Teilrechtecken">
          {felder.map(([x, y, w, h, f, s, t, n], i) => (
            <g key={i}>
              <rect x={sx + x * u} y={sy + y * u} width={w * u} height={h * u} fill={f} stroke={s} strokeWidth="1.6" />
              <Txt x={sx + (x + w / 2) * u} y={sy + (y + h / 2) * u + 4} gr={11} farbe={s}>{`${n} = ${t}`}</Txt>
            </g>
          ))}
          <Txt x={sx + (c * u) / 2} y={sy - 6} gr={11}>{`c = ${c}`}</Txt>
          <Txt x={sx + c * u + (d * u) / 2} y={sy - 6} gr={11}>{`d = ${d}`}</Txt>
          <Txt x={sx - 6} y={sy + (a * u) / 2 + 4} gr={11} anker="end">{`a=${a}`}</Txt>
          <Txt x={sx - 6} y={sy + a * u + (b * u) / 2 + 4} gr={11} anker="end">{`b=${b}`}</Txt>
          {void W}
        </svg>
        <Regler label="a" wert={a} setze={setA} min={1} max={4} schritt={1} anzeige={a} />
        <Regler label="b" wert={b} setze={setB} min={1} max={3} schritt={1} anzeige={b} />
        <Regler label="c" wert={c} setze={setC} min={1} max={5} schritt={1} anzeige={c} />
        <Regler label="d" wert={d} setze={setD} min={1} max={4} schritt={1} anzeige={d} />
        <Messzeile><M t={`(${a} + ${b})(${c} + ${d}) = ${a * c} + ${a * d} + ${b * c} + ${b * d} = ${(a + b) * (c + d)}`} /></Messzeile>
      </div>
    );
  }
  /* ausmultiplizieren / ausklammern: a · (x + c) */
  const X = 3.4 * u, sx = 40, sy = 30, H = a * u;
  const aus = modus === "ausklammern";
  return (
    <div>
      <Hinweis>{aus ? "Beide Rechtecke haben die Höhe a gemeinsam. Diesen gemeinsamen Faktor zieht man vor die Klammer." : "Ein Rechteck der Höhe a und der Breite x + c ist so groß wie zwei Rechtecke zusammen: a · x und a · c."}</Hinweis>
      <svg viewBox="0 0 340 170" style={svgStil} role="img" aria-label="Rechteck aus zwei Teilrechtecken">
        <rect x={sx} y={sy} width={X} height={H} fill={F.blau} stroke={F.see} strokeWidth="1.6" />
        <rect x={sx + X} y={sy} width={c * u} height={H} fill={F.gold} stroke={F.gold3} strokeWidth="1.6" />
        <Txt x={sx + X / 2} y={sy + H / 2 + 4} farbe={F.see} gr={12}>{kx(a)}</Txt>
        <Txt x={sx + X + (c * u) / 2} y={sy + H / 2 + 4} farbe={F.gold3} gr={12}>{`${a * c}`}</Txt>
        <Txt x={sx + X / 2} y={sy - 8} gr={12} kursiv>x</Txt>
        <Txt x={sx + X + (c * u) / 2} y={sy - 8} gr={12}>{c}</Txt>
        <line x1={sx - 10} x2={sx - 10} y1={sy} y2={sy + H} stroke={aus ? F.rosaKraeftig : F.tinte} strokeWidth={aus ? 4 : 1.4} strokeLinecap="round" />
        <Txt x={sx - 16} y={sy + H / 2 + 4} anker="end" farbe={aus ? F.rosaKraeftig : F.tinte}>{a}</Txt>
      </svg>
      <Regler label="a" wert={a} setze={setA} min={1} max={5} schritt={1} anzeige={a} />
      <Regler label="c" wert={c} setze={setC} min={1} max={6} schritt={1} anzeige={c} />
      <Messzeile><M t={aus ? `${kx(a)} + ${a * c} = ${a === 1 ? "" : `${a} \\cdot `}(x + ${c})` : `${a === 1 ? "" : `${a} \\cdot `}(x + ${c}) = ${kx(a)} + ${a * c}`} /></Messzeile>
    </div>
  );
}

/* ======================= Zusammengesetzte Fläche (L-Form) ======================= */
function Zusammengesetzt() {
  const [W, setW] = useState(9);
  const [H, setH] = useState(6);
  const [w, setw] = useState(4);
  const [h, seth] = useState(3);
  const [weg, setWeg] = useState("zerlegen");
  const u = Math.min(28, 260 / W, 160 / H), sx = 40, sy = 20;
  const ww = Math.min(w, W - 1), hh = Math.min(h, H - 1);
  const L = [[0, 0], [W - ww, 0], [W - ww, hh], [W, hh], [W, H], [0, H]].map(([x, y]) => [sx + x * u, sy + y * u]);
  return (
    <div>
      <Hinweis>{weg === "zerlegen" ? "Zerlegen: Die Figur in zwei Rechtecke teilen und die Flächen addieren." : "Ergänzen: Zum großen Rechteck ergänzen und das fehlende Stück abziehen."}</Hinweis>
      <svg viewBox="0 0 340 210" style={svgStil} role="img" aria-label="Zusammengesetzte L-förmige Fläche">
        {weg === "zerlegen" ? (
          <>
            <rect x={sx} y={sy} width={(W - ww) * u} height={H * u} fill={F.blau} stroke={F.see} strokeWidth="1.4" />
            <rect x={sx + (W - ww) * u} y={sy + hh * u} width={ww * u} height={(H - hh) * u} fill={F.gold} stroke={F.gold3} strokeWidth="1.4" />
            <Txt x={sx + ((W - ww) * u) / 2} y={sy + (H * u) / 2 + 4} farbe={F.see} gr={11}>{`${W - ww} · ${H}`}</Txt>
            <Txt x={sx + (W - ww) * u + (ww * u) / 2} y={sy + hh * u + ((H - hh) * u) / 2 + 4} farbe={F.gold3} gr={11}>{`${ww} · ${H - hh}`}</Txt>
          </>
        ) : (
          <>
            <rect x={sx} y={sy} width={W * u} height={H * u} fill={F.blau} stroke={F.see} strokeWidth="1.4" />
            <rect x={sx + (W - ww) * u} y={sy} width={ww * u} height={hh * u} fill={F.rosa} stroke={F.rosaKraeftig} strokeWidth="1.4" strokeDasharray="5 3" />
            <Txt x={sx + (W - ww) * u + (ww * u) / 2} y={sy + (hh * u) / 2 + 4} farbe={F.rosaKraeftig} gr={11}>{`− ${ww} · ${hh}`}</Txt>
            <Txt x={sx + ((W - ww) * u) / 2} y={sy + (H * u) / 2 + 4} farbe={F.see} gr={11}>{`${W} · ${H}`}</Txt>
          </>
        )}
        <polygon points={pts(L)} fill="none" stroke={F.tinte} strokeWidth="2.4" strokeLinejoin="round" />
        <Txt x={sx + (W * u) / 2} y={sy + H * u + 16} gr={11}>{W}</Txt>
        <Txt x={sx - 8} y={sy + (H * u) / 2 + 4} gr={11} anker="end">{H}</Txt>
      </svg>
      <Umschalter label="Weg" wert={weg} setze={setWeg} optionen={[["zerlegen", "Zerlegen"], ["ergaenzen", "Ergänzen"]]} />
      <Regler label="Breite" wert={W} setze={setW} min={4} max={10} schritt={1} anzeige={W} />
      <Regler label="Höhe" wert={H} setze={setH} min={3} max={6} schritt={1} anzeige={H} />
      <Regler label="Ecke breit" wert={w} setze={setw} min={1} max={6} schritt={1} anzeige={ww} />
      <Regler label="Ecke hoch" wert={h} setze={seth} min={1} max={5} schritt={1} anzeige={hh} />
      <Messzeile>{weg === "zerlegen"
        ? <M t={`A = ${W - ww} \\cdot ${H} + ${ww} \\cdot ${H - hh} = ${(W - ww) * H} + ${ww * (H - hh)} = ${W * H - ww * hh}`} />
        : <M t={`A = ${W} \\cdot ${H} - ${ww} \\cdot ${hh} = ${W * H} - ${ww * hh} = ${W * H - ww * hh}`} />}</Messzeile>
    </div>
  );
}

/* ======================= Quadernetz ======================= */
function QuaderNetz({ art = "quader" }) {
  const [a0, setA] = useState(art === "wuerfel" ? 3 : 4);
  const [b0, setB] = useState(2);
  const [c0, setC] = useState(3);
  const w = art === "wuerfel";
  const a = a0, b = w ? a0 : b0, c = w ? a0 : c0;
  const u = Math.min(22, 320 / (2 * a + 2 * b), 200 / (c + 2 * b));
  const sx = (340 - (2 * a + 2 * b) * u) / 2, sy = 8 + b * u;
  const f = [[F.blau, F.see], [F.gold, F.gold3], [F.gruen, F.gruenKraeftig]];
  const r = (x, y, ww, hh, [fi, st], t) => (
    <g key={`${x}-${y}`}>
      <rect x={sx + x * u} y={sy + y * u} width={ww * u} height={hh * u} fill={fi} stroke={st} strokeWidth="1.5" />
      <Txt x={sx + (x + ww / 2) * u} y={sy + (y + hh / 2) * u + 4} gr={10} farbe={st}>{t}</Txt>
    </g>
  );
  return (
    <div>
      <Hinweis>Das Netz besteht aus drei Paaren gleicher Rechtecke (gleiche Farbe = gegenüberliegende Flächen).</Hinweis>
      <svg viewBox={`0 0 340 ${Math.ceil(sy + (c + b) * u + 10)}`} style={svgStil} role="img" aria-label={w ? "Würfelnetz aus sechs Quadraten" : "Quadernetz aus sechs Rechtecken"}>
        {r(0, 0, a, c, f[0], w ? "a²" : "a·c")}
        {r(a, 0, b, c, f[1], w ? "a²" : "b·c")}
        {r(a + b, 0, a, c, f[0], w ? "a²" : "a·c")}
        {r(a + 2 * b - b, 0, b, c, f[1], w ? "a²" : "b·c")}
        {r(0, -b, a, b, f[2], w ? "a²" : "a·b")}
        {r(0, c, a, b, f[2], w ? "a²" : "a·b")}
      </svg>
      <Regler label="a" wert={a0} setze={setA} min={1} max={6} schritt={1} anzeige={a0} />
      {!w && <Regler label="b" wert={b0} setze={setB} min={1} max={5} schritt={1} anzeige={b0} />}
      {!w && <Regler label="c" wert={c0} setze={setC} min={1} max={6} schritt={1} anzeige={c0} />}
      <Messzeile>{w
        ? <><div><M t={`O = 6a^2 = 6 \\cdot ${a * a} = ${6 * a * a}`} /></div><div><M t={`V = a^3 = ${a * a * a}`} /></div></>
        : <><div><M t={`O = 2 \\cdot (${a * b} + ${b * c} + ${a * c}) = ${2 * (a * b + b * c + a * c)}`} /></div><div><M t={`V = ${a} \\cdot ${b} \\cdot ${c} = ${a * b * c}`} /></div></>}</Messzeile>
    </div>
  );
}
/* Hinweis: Die vier Seitenflächen liegen nebeneinander (a·c, b·c, a·c, b·c), Deckel und Boden (a·b) oben und unten an der ersten. */

/* ======================= Funktionsgraphen (Wurzel, Betrag, proportional) ======================= */
function FunktionsGraph({ art = "wurzel" }) {
  const [x, setX] = useState(art === "betrag" ? -3 : art === "proportional" ? 2 : 4);
  const [m, setM] = useState(1.5);
  if (art === "wurzel") {
    const k = koord({ x0: -1, x1: 10, y0: -1, y1: 6, w: 340, h: 230 });
    const y = Math.sqrt(x);
    return (
      <div>
        <Hinweis>Die Wurzelfunktion ist die Umkehrung von x² für x ≥ 0: an der Winkelhalbierenden y = x gespiegelt.</Hinweis>
        <svg viewBox="0 0 340 230" style={svgStil} role="img" aria-label="Graph der Wurzelfunktion">
          <Achsen k={k} schritt={1} />
          <path d={k.kurve((t) => t, -1, 6)} fill="none" stroke={F.achse} strokeWidth="1" strokeDasharray="3 4" />
          <path d={k.kurve((t) => t * t, 0, Math.sqrt(6))} fill="none" stroke={F.blauMittel} strokeWidth="1.8" strokeDasharray="6 4" />
          <path d={k.kurve((t) => Math.sqrt(t), 0, 10)} fill="none" stroke={F.see} strokeWidth="2.6" />
          <line x1={k.px(x)} x2={k.px(x)} y1={k.py(0)} y2={k.py(y)} stroke={F.gold3} strokeDasharray="4 3" />
          <line x1={k.px(0)} x2={k.px(x)} y1={k.py(y)} y2={k.py(y)} stroke={F.gold3} strokeDasharray="4 3" />
          <Punkt x={k.px(x)} y={k.py(y)} farbe={F.rosaKraeftig} />
          <Punkt x={k.px(0)} y={k.py(0)} farbe={F.see} r={3.5} />
          <Txt x={k.px(8.6)} y={k.py(Math.sqrt(8.6)) - 10} farbe={F.see}>√x</Txt>
          <Txt x={k.px(2.2)} y={k.py(4.9)} farbe={F.blauMittel} gr={11}>x²</Txt>
        </svg>
        <Regler label="x" wert={x} setze={setX} min={0} max={10} schritt={0.25} anzeige={z(x)} />
        <Messzeile><M t={`f(${z(x)}) = \\sqrt{${z(x)}} \\approx ${z(y)}, \\quad D = [0; \\infty)`} /></Messzeile>
      </div>
    );
  }
  if (art === "betrag") {
    const k = koord({ x0: -5, x1: 5, y0: -1, y1: 5, w: 340, h: 210 });
    return (
      <div>
        <Hinweis>|x| ist der Abstand von x zur 0 – deshalb nie negativ. Der Graph ist ein V mit Knick im Ursprung.</Hinweis>
        <svg viewBox="0 0 340 210" style={svgStil} role="img" aria-label="Graph der Betragsfunktion">
          <Achsen k={k} schritt={1} />
          <path d={k.kurve((t) => Math.abs(t))} fill="none" stroke={F.see} strokeWidth="2.6" />
          <line x1={k.px(0)} x2={k.px(x)} y1={k.py(0)} y2={k.py(0)} stroke={F.rosaKraeftig} strokeWidth="4" strokeLinecap="round" />
          <line x1={k.px(x)} x2={k.px(x)} y1={k.py(0)} y2={k.py(Math.abs(x))} stroke={F.gold3} strokeDasharray="4 3" />
          <Punkt x={k.px(x)} y={k.py(Math.abs(x))} farbe={F.rosaKraeftig} />
          <Txt x={k.px(4)} y={k.py(4) - 10} farbe={F.see}>|x|</Txt>
        </svg>
        <Regler label="x" wert={x} setze={setX} min={-5} max={5} schritt={0.5} anzeige={z(x)} />
        <Messzeile><M t={`|${z(x)}| = ${z(Math.abs(x))}`} /> · <span style={{ color: C.grau, fontSize: 13 }}>{x < 0 ? "für x < 0 gilt |x| = −x" : "für x ≥ 0 gilt |x| = x"}</span></Messzeile>
      </div>
    );
  }
  /* proportional */
  const k = koord({ x0: -0.5, x1: 5, y0: -0.5, y1: 8, w: 340, h: 230 });
  return (
    <div>
      <Hinweis>Bei einer proportionalen Zuordnung liegen alle Punkte auf einer Geraden durch den Ursprung. Der Quotient y : x ist immer gleich.</Hinweis>
      <svg viewBox="0 0 340 230" style={svgStil} role="img" aria-label="Proportionale Zuordnung als Ursprungsgerade">
        <Achsen k={k} schritt={1} />
        <path d={k.kurve((t) => m * t, 0, 5)} fill="none" stroke={F.see} strokeWidth="2.4" />
        {[1, 2, 3, 4].map((t) => <Punkt key={t} x={k.px(t)} y={k.py(m * t)} farbe={t === x ? F.rosaKraeftig : F.see} r={t === x ? 5 : 3.5} />)}
        <line x1={k.px(0)} x2={k.px(1)} y1={k.py(0)} y2={k.py(0)} stroke={F.gold3} strokeWidth="2.4" />
        <line x1={k.px(1)} x2={k.px(1)} y1={k.py(0)} y2={k.py(m)} stroke={F.gold3} strokeWidth="2.4" />
        <Txt x={k.px(1) + 6} y={k.py(m / 2) + 4} anker="start" gr={11} farbe={F.gold3}>{z(m)}</Txt>
      </svg>
      <Regler label="k" wert={m} setze={setM} min={0.25} max={2} schritt={0.25} anzeige={z(m)} />
      <Regler label="x" wert={x} setze={setX} min={1} max={4} schritt={1} anzeige={x} />
      <Messzeile><M t={`y = ${z(m)} \\cdot ${x} = ${z(m * x)}, \\quad \\frac{y}{x} = \\frac{${z(m * x)}}{${x}} = ${z(m)}`} /></Messzeile>
    </div>
  );
}

/* ======================= Wurzeln am Quadrat ======================= */
const ZERLEGT = [[8, 2, 2], [12, 2, 3], [18, 3, 2], [20, 2, 5], [27, 3, 3], [32, 4, 2], [45, 3, 5], [50, 5, 2], [72, 6, 2], [75, 5, 3]];
function WurzelQuadrat({ modus = "def" }) {
  const [a, setA] = useState(9);
  const [b, setB] = useState(4);
  const [i, setI] = useState(7);
  if (modus === "def") {
    const s = Math.sqrt(a), u = 160 / 5;
    const ganz = Number.isInteger(s);
    return (
      <div>
        <Hinweis>√a ist die Seitenlänge des Quadrats mit dem Flächeninhalt a.</Hinweis>
        <svg viewBox="0 0 340 200" style={svgStil} role="img" aria-label={`Quadrat mit Fläche ${a} und Seite Wurzel ${a}`}>
          {Array.from({ length: Math.ceil(s) ** 2 }, (_, j) => { const x = j % Math.ceil(s), y = Math.floor(j / Math.ceil(s)); return x < s && y < s ? <rect key={j} x={40 + x * u} y={20 + y * u} width={Math.min(u, (s - x) * u)} height={Math.min(u, (s - y) * u)} fill={F.blau} stroke={F.blauMittel} strokeWidth="0.6" /> : null; })}
          <rect x={40} y={20} width={s * u} height={s * u} fill="none" stroke={F.see} strokeWidth="2.4" />
          <Txt x={40 + (s * u) / 2} y={20 + s * u + 16} farbe={F.rosaKraeftig}>{`√${a}${ganz ? ` = ${s}` : ` ≈ ${z(s)}`}`}</Txt>
          <Txt x={40 + (s * u) / 2} y={20 + (s * u) / 2 + 5} farbe={F.see} gr={13}>{`A = ${a}`}</Txt>
        </svg>
        <Regler label="a" wert={a} setze={setA} min={1} max={25} schritt={1} anzeige={a} />
        <Messzeile><M t={`\\sqrt{${a}} ${ganz ? "=" : "\\approx"} ${z(ganz ? s : Math.round(s * 1000) / 1000)}, \\quad (\\sqrt{${a}})^2 = ${a}`} /></Messzeile>
      </div>
    );
  }
  if (modus === "produkt") {
    const u = 13, s = Math.sqrt(a * b);
    return (
      <div>
        <Hinweis>Das Rechteck a · b und das Quadrat mit der Seite √a · √b haben denselben Flächeninhalt. Also ist √a · √b = √(a · b).</Hinweis>
        <svg viewBox="0 0 340 200" style={svgStil} role="img" aria-label="Rechteck und flächengleiches Quadrat">
          <rect x={20} y={20} width={a * u} height={b * u} fill={F.gold} stroke={F.gold3} strokeWidth="1.8" />
          <Txt x={20 + (a * u) / 2} y={20 + (b * u) / 2 + 4} farbe={F.gold3} gr={11}>{`${a} · ${b}`}</Txt>
          <rect x={200} y={20} width={s * u} height={s * u} fill={F.blau} stroke={F.see} strokeWidth="1.8" />
          <Txt x={200 + (s * u) / 2} y={20 + s * u + 15} farbe={F.see} gr={11}>{`√${a} · √${b}`}</Txt>
        </svg>
        <Regler label="a" wert={a} setze={setA} min={1} max={9} schritt={1} anzeige={a} />
        <Regler label="b" wert={b} setze={setB} min={1} max={9} schritt={1} anzeige={b} />
        <Messzeile><M t={`\\sqrt{${a}} \\cdot \\sqrt{${b}} = \\sqrt{${a * b}} ${Number.isInteger(s) ? "=" : "\\approx"} ${z(Math.round(s * 1000) / 1000)}`} /></Messzeile>
      </div>
    );
  }
  /* teilweise */
  const [n, k, m] = ZERLEGT[i];
  const u = Math.min(150 / (k * Math.sqrt(m)), 40), s = Math.sqrt(m) * u;
  return (
    <div>
      <Hinweis>{`${n} = ${k * k} · ${m}: Das große Quadrat besteht aus ${k} · ${k} kleinen Quadraten mit Fläche ${m}. Seite: ${k} · √${m}.`}</Hinweis>
      <svg viewBox="0 0 340 200" style={svgStil} role="img" aria-label={`Wurzel ${n} gleich ${k} mal Wurzel ${m}`}>
        {Array.from({ length: k * k }, (_, j) => <rect key={j} x={80 + (j % k) * s} y={15 + Math.floor(j / k) * s} width={s} height={s} fill={(j + Math.floor(j / k)) % 2 ? F.blau : F.gold} stroke={F.see} strokeWidth="1" />)}
        <rect x={80} y={15} width={k * s} height={k * s} fill="none" stroke={F.see} strokeWidth="2.4" />
        {Array.from({ length: k }, (_, j) => <Txt key={j} x={80 + (j + 0.5) * s} y={15 + k * s + 14} gr={10} farbe={F.rosaKraeftig}>{`√${m}`}</Txt>)}
      </svg>
      <Regler label="Zahl" wert={i} setze={setI} min={0} max={ZERLEGT.length - 1} schritt={1} anzeige={n} />
      <Messzeile><M t={`\\sqrt{${n}} = \\sqrt{${k * k} \\cdot ${m}} = \\sqrt{${k * k}} \\cdot \\sqrt{${m}} = ${k}\\sqrt{${m}}`} /></Messzeile>
    </div>
  );
}

/* ======================= Zentrische Streckung ======================= */
function Streckung() {
  const [k, setK] = useState(2);
  const Z = [120, 140];
  const T = [[30, -5], [60, 10], [40, -35]].map((v) => add(Z, v));
  const bild = T.map((P) => add(Z, mal(sub(P, Z), k)));
  const ab = abst(T[0], T[1]);
  return (
    <div>
      <Hinweis>Jeder Punkt wird vom Zentrum Z aus mit dem Faktor k gestreckt. Längen werden k-mal so lang, Flächen k²-mal so groß. Bei k &lt; 0 liegt das Bild auf der anderen Seite von Z.</Hinweis>
      <svg viewBox="0 0 340 220" style={svgStil} role="img" aria-label="Zentrische Streckung eines Dreiecks">
        {T.map((P, i) => <Strecke key={i} A={add(Z, mal(sub(P, Z), Math.min(k, -0.2) < 0 ? -2.6 : 0))} B={add(Z, mal(sub(P, Z), Math.max(k, 1) + 0.3))} farbe={F.achse} breite={1} gestrichelt />)}
        <polygon points={pts(bild)} fill={F.gold} fillOpacity="0.7" stroke={F.gold3} strokeWidth="1.8" />
        <polygon points={pts(T)} fill={F.blau} stroke={F.see} strokeWidth="1.8" />
        <Punkt x={Z[0]} y={Z[1]} farbe={F.tinte} r={4.5} />
        <Txt x={Z[0] - 10} y={Z[1] + 16}>Z</Txt>
        <Txt x={T[0][0]} y={T[0][1] + 14} gr={10} farbe={F.see}>A</Txt>
        <Txt x={bild[0][0]} y={bild[0][1] + 15} gr={10} farbe={F.gold3}>A′</Txt>
      </svg>
      <Regler label="k" wert={k} setze={setK} min={-1.5} max={2.5} schritt={0.25} anzeige={z(k)} />
      <Messzeile>
        <div><M t={`|ZA′| = |k| \\cdot |ZA|, \\quad |A′B′| = ${z(Math.abs(k))} \\cdot ${z(ab / 20)} = ${z((Math.abs(k) * ab) / 20)}`} /></div>
        <div><M t={`A_{Bild} = k^2 \\cdot A = ${z(k * k)} \\cdot A`} /></div>
      </Messzeile>
    </div>
  );
}

/* ======================= Kathetensatz ======================= */
function Kathetensatz() {
  const [t, setT] = useState(55);
  const A = [100, 120], B = [240, 120], c = 140, Mm = mitte(A, B), r = c / 2;
  const Cc = [Mm[0] + r * Math.cos(rad(-t)), Mm[1] + r * Math.sin(rad(-t))];
  const D = [Cc[0], A[1]];
  const a = abst(B, Cc), p = abst(D, B);
  const n = einheit(senk(sub(Cc, B)));
  const nn = dot(n, sub(A, B)) > 0 ? mal(n, -1) : n;
  const Q = [B, Cc, add(Cc, mal(nn, a)), add(B, mal(nn, a))];
  const einh = c / 5;
  return (
    <div>
      <Hinweis>Das Quadrat über der Kathete a ist so groß wie das Rechteck aus der Hypotenuse c und dem anliegenden Abschnitt p. Verschiebe C auf dem Thaleskreis.</Hinweis>
      <svg viewBox="0 0 380 270" style={svgStil} role="img" aria-label="Kathetensatz: Quadrat über a und Rechteck c mal p">
        <path d={`M${A[0]} ${A[1]} A${r} ${r} 0 0 1 ${B[0]} ${B[1]}`} fill="none" stroke={F.achse} strokeDasharray="3 4" />
        <polygon points={pts(Q)} fill={F.gold} stroke={F.gold3} strokeWidth="1.6" />
        <rect x={D[0]} y={A[1]} width={p} height={c} fill={F.gold} stroke={F.gold3} strokeWidth="1.6" />
        <rect x={A[0]} y={A[1]} width={c - p} height={c} fill="#F4F6FA" stroke={F.achse} strokeWidth="1" />
        <polygon points={pts([A, B, Cc])} fill={F.blau} stroke={F.see} strokeWidth="2" strokeLinejoin="round" />
        <Strecke A={Cc} B={D} farbe={F.rosaKraeftig} breite={1.4} gestrichelt />
        <RechterWinkel x={Cc[0]} y={Cc[1]} u={einheit(sub(A, Cc))} v={einheit(sub(B, Cc))} g={9} />
        <Txt x={A[0] - 10} y={A[1] - 4}>A</Txt><Txt x={B[0] + 4} y={B[1] + 14} anker="start">B</Txt><Txt x={Cc[0]} y={Cc[1] - 10}>C</Txt>
        <Txt x={D[0] + p / 2} y={A[1] + c / 2 + 4} farbe={F.gold3} gr={11}>c · p</Txt>
        <Txt x={(Q[0][0] + Q[2][0]) / 2} y={(Q[0][1] + Q[2][1]) / 2 + 4} farbe={F.gold3} gr={11}>a²</Txt>
        <Txt x={D[0] + p / 2} y={A[1] - 5} gr={10} farbe={F.rosaKraeftig}>p</Txt>
      </svg>
      <Regler label="C verschieben" wert={t} setze={setT} min={42} max={140} schritt={1} anzeige={`${t}°`} />
      <Messzeile><M t={`a^2 = ${z((a / einh) ** 2)}, \\quad c \\cdot p = 5 \\cdot ${z(p / einh)} = ${z((5 * p) / einh)}`} /></Messzeile>
    </div>
  );
}

/* ======================= Haus der Vierecke ======================= */
const VIERECKE = {
  viereck: { n: "Viereck", p: [170, 20], f: [[-34, 18], [30, 22], [38, -16], [-20, -22]], e: "vier Ecken, Winkelsumme 360°" },
  trapez: { n: "Trapez", p: [95, 68], f: [[-38, 18], [38, 18], [20, -18], [-24, -18]], e: "ein Paar paralleler Seiten" },
  drachen: { n: "Drachen", p: [255, 68], f: [[0, -26], [22, -4], [0, 26], [-22, -4]], e: "Diagonalen senkrecht, eine Diagonale ist Symmetrieachse; zwei Paare gleich langer Nachbarseiten" },
  gltrapez: { n: "gleichschenkliges Trapez", k: "gl. Trapez", p: [45, 118], f: [[-38, 18], [38, 18], [22, -18], [-22, -18]], e: "Trapez mit gleich langen Schenkeln, achsensymmetrisch" },
  parallelogramm: { n: "Parallelogramm", p: [165, 118], f: [[-38, 18], [22, 18], [38, -18], [-22, -18]], e: "zwei Paare paralleler Seiten; Gegenseiten und Gegenwinkel gleich; Diagonalen halbieren sich" },
  rechteck: { n: "Rechteck", p: [95, 168], f: [[-34, 18], [34, 18], [34, -18], [-34, -18]], e: "vier rechte Winkel; Diagonalen gleich lang" },
  raute: { n: "Raute", p: [245, 168], f: [[0, -24], [32, 0], [0, 24], [-32, 0]], e: "vier gleich lange Seiten; Diagonalen senkrecht und halbieren sich" },
  quadrat: { n: "Quadrat", p: [170, 218], f: [[-22, 22], [22, 22], [22, -22], [-22, -22]], e: "vier gleich lange Seiten und vier rechte Winkel – Rechteck und Raute zugleich" },
};
const VIER_KANTEN = [["viereck", "trapez"], ["viereck", "drachen"], ["trapez", "gltrapez"], ["trapez", "parallelogramm"], ["gltrapez", "rechteck"], ["parallelogramm", "rechteck"], ["parallelogramm", "raute"], ["drachen", "raute"], ["rechteck", "quadrat"], ["raute", "quadrat"]];
function Vierecke() {
  const [w, setW] = useState("parallelogramm");
  const oben = (id, acc = new Set()) => { VIER_KANTEN.filter(([, u]) => u === id).forEach(([o]) => { acc.add(o); oben(o, acc); }); return acc; };
  const vorfahren = oben(w);
  const v = VIERECKE[w];
  return (
    <div>
      <Hinweis>Tippe ein Viereck an. Jedes Viereck ist ein Sonderfall aller Vierecke darüber (verbunden durch Linien) und hat deren Eigenschaften.</Hinweis>
      <svg viewBox="0 0 340 240" style={svgStil} role="img" aria-label="Haus der Vierecke">
        {VIER_KANTEN.map(([a, b]) => { const p = VIERECKE[a].p, q = VIERECKE[b].p; const hell = (a === w || vorfahren.has(a)) && (b === w || vorfahren.has(b)); return <line key={a + b} x1={p[0]} y1={p[1] + 8} x2={q[0]} y2={q[1] - 8} stroke={hell ? F.see : F.linie || C.linie} strokeWidth={hell ? 2.2 : 1.2} />; })}
        {Object.entries(VIERECKE).map(([id, x]) => {
          const an = id === w, vor = vorfahren.has(id);
          return (
            <g key={id} onClick={() => setW(id)} style={{ cursor: "pointer" }} role="button" aria-label={x.n} aria-pressed={an}>
              <rect x={x.p[0] - 46} y={x.p[1] - 11} width={92} height={22} rx={11} fill={an ? C.see : vor ? F.blau : C.weiss} stroke={an || vor ? C.see : C.linie} strokeWidth="1.2" />
              <text x={x.p[0]} y={x.p[1] + 4} textAnchor="middle" fontSize="10.5" fontWeight="700" fill={an ? C.weiss : C.tinte}>{x.k || x.n}</text>
            </g>
          );
        })}
      </svg>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 6 }}>
        <svg viewBox="-45 -32 90 64" width="90" height="64" aria-hidden="true" style={{ flexShrink: 0 }}>
          <polygon points={pts(v.f)} fill={F.gold} stroke={F.gold3} strokeWidth="2" strokeLinejoin="round" />
        </svg>
        <Messzeile><b style={{ color: C.see }}>{v.n}:</b> <span style={{ fontSize: 13.5 }}>{v.e}</span></Messzeile>
      </div>
    </div>
  );
}

/* ======================= Raumdiagonale ======================= */
function Raumdiagonale() {
  const [a, setA] = useState(5);
  const [b, setB] = useState(3);
  const [c, setC] = useState(4);
  const u = 24, t = [0.5 * Math.cos(rad(35)), -0.5 * Math.sin(rad(35))];
  const P = (x, y, zz) => [50 + x * u + y * u * t[0] * 2, 200 - zz * u + y * u * t[1] * 2];
  const ecken = { A: P(0, 0, 0), B: P(a, 0, 0), C: P(a, b, 0), D: P(0, b, 0), E: P(0, 0, c), F: P(a, 0, c), G: P(a, b, c), H: P(0, b, c) };
  const kante = (p, q, verdeckt) => <Strecke key={p + q} A={ecken[p]} B={ecken[q]} farbe={F.see} breite={verdeckt ? 1 : 1.8} gestrichelt={verdeckt} />;
  const e = Math.sqrt(a * a + b * b), d = Math.sqrt(a * a + b * b + c * c);
  return (
    <div>
      <Hinweis>Zweimal Pythagoras: erst die Bodendiagonale e, dann mit e und der Höhe c die Raumdiagonale d.</Hinweis>
      <svg viewBox="0 0 340 215" style={svgStil} role="img" aria-label="Quader mit Boden- und Raumdiagonale">
        <polygon points={pts([ecken.A, ecken.C, ecken.G])} fill={F.gold} fillOpacity="0.55" stroke="none" />
        {[["A", "B"], ["B", "F"], ["F", "E"], ["E", "A"], ["B", "C"], ["C", "G"], ["G", "F"], ["G", "H"], ["H", "E"]].map(([p, q]) => kante(p, q))}
        {[["A", "D"], ["D", "C"], ["D", "H"]].map(([p, q]) => kante(p, q, true))}
        <Strecke A={ecken.A} B={ecken.C} farbe={F.gruenKraeftig} breite={2.4} />
        <Strecke A={ecken.A} B={ecken.G} farbe={F.rosaKraeftig} breite={2.8} />
        <RechterWinkel x={ecken.C[0]} y={ecken.C[1]} u={einheit(sub(ecken.A, ecken.C))} v={einheit(sub(ecken.G, ecken.C))} g={8} />
        <Txt x={(ecken.A[0] + ecken.C[0]) / 2 + 8} y={(ecken.A[1] + ecken.C[1]) / 2 + 14} farbe={F.gruenKraeftig}>e</Txt>
        <Txt x={(ecken.A[0] + ecken.G[0]) / 2 - 8} y={(ecken.A[1] + ecken.G[1]) / 2 - 6} farbe={F.rosaKraeftig}>d</Txt>
        <Txt x={(ecken.A[0] + ecken.B[0]) / 2} y={ecken.A[1] + 15} gr={11}>a</Txt>
        <Txt x={(ecken.B[0] + ecken.C[0]) / 2 + 10} y={(ecken.B[1] + ecken.C[1]) / 2 + 10} gr={11}>b</Txt>
        <Txt x={ecken.C[0] + 10} y={(ecken.C[1] + ecken.G[1]) / 2} gr={11} anker="start">c</Txt>
      </svg>
      <Regler label="a" wert={a} setze={setA} min={1} max={7} schritt={1} anzeige={a} />
      <Regler label="b" wert={b} setze={setB} min={1} max={5} schritt={1} anzeige={b} />
      <Regler label="c" wert={c} setze={setC} min={1} max={5} schritt={1} anzeige={c} />
      <Messzeile>
        <div><M t={`e = \\sqrt{${a * a} + ${b * b}} \\approx ${z(e)}`} /></div>
        <div><M t={`d = \\sqrt{${a * a} + ${b * b} + ${c * c}} = \\sqrt{${a * a + b * b + c * c}} \\approx ${z(d)}`} /></div>
      </Messzeile>
    </div>
  );
}

/* ======================= Normalverteilung ======================= */
const dichte = (x, mu, s) => Math.exp(-0.5 * ((x - mu) / s) ** 2) / (s * Math.sqrt(2 * Math.PI));
function erf(x) {
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return x >= 0 ? y : -y;
}
const Phi = (zz) => 0.5 * (1 + erf(zz / Math.SQRT2));
function NormalKurve({ modus = "dichte" }) {
  const [mu, setMu] = useState(0);
  const [s, setS] = useState(1);
  const [kk, setKk] = useState(1);
  const [x, setX] = useState(1);
  const [n, setN] = useState(40);
  const [p, setP] = useState(0.4);
  if (modus === "naeherung") {
    const mw = n * p, sg = Math.sqrt(n * p * (1 - p));
    const lo = Math.max(0, Math.floor(mw - 4.5 * sg)), hi = Math.min(n, Math.ceil(mw + 4.5 * sg));
    const pmf = [];
    let q = Math.pow(1 - p, n);
    for (let k2 = 0; k2 <= n; k2++) { pmf.push(q); q = (q * (n - k2) * p) / ((k2 + 1) * (1 - p)); }
    const ymax = Math.max(...pmf.slice(lo, hi + 1), dichte(mw, mw, sg)) * 1.15;
    const k = koord({ x0: lo - 0.5, x1: hi + 0.5, y0: 0, y1: ymax, w: 340, h: 210 });
    const bw = Math.max(1, k.px(1) - k.px(0) - 1);
    return (
      <div>
        <Hinweis>Für große Streuung (σ &gt; 3) schmiegt sich die Glockenkurve mit μ = n · p und σ = √(n · p · (1 − p)) an das Histogramm der Binomialverteilung an.</Hinweis>
        <svg viewBox="0 0 340 210" style={svgStil} role="img" aria-label="Binomialverteilung mit Näherung durch die Normalverteilung">
          <Achsen k={k} schritt={Math.max(1, Math.round((hi - lo) / 8))} ySchritt={ymax / 4} beschriften={true} ohneGitter />
          {pmf.slice(lo, hi + 1).map((v, i) => <rect key={i} x={k.px(lo + i) - bw / 2} y={k.py(v)} width={bw} height={k.py(0) - k.py(v)} fill={F.blau} stroke={F.blauMittel} strokeWidth="0.6" />)}
          <path d={k.kurve((t) => dichte(t, mw, sg), lo - 0.5, hi + 0.5)} fill="none" stroke={F.rosaKraeftig} strokeWidth="2.4" />
        </svg>
        <Regler label="n" wert={n} setze={setN} min={5} max={100} schritt={1} anzeige={n} />
        <Regler label="p" wert={p} setze={setP} min={0.05} max={0.95} schritt={0.05} anzeige={z(p)} />
        <Messzeile><M t={`\\mu = ${z(mw)}, \\quad \\sigma = ${z(sg)}`} /> · <b style={{ color: sg > 3 ? F.gruenKraeftig : F.rosaKraeftig }}>{sg > 3 ? "σ > 3: Näherung gut" : "σ ≤ 3: Näherung noch grob"}</b></Messzeile>
      </div>
    );
  }
  const st = modus === "standard";
  const m0 = st ? 0 : mu, s0 = st ? 1 : s;
  const k = koord({ x0: m0 - 4 * s0, x1: m0 + 4 * s0, y0: 0, y1: dichte(m0, m0, s0) * 1.2, w: 340, h: 210 });
  const kurve = <path d={k.kurve((t) => dichte(t, m0, s0))} fill="none" stroke={F.see} strokeWidth="2.6" />;
  if (modus === "sigma") {
    const anteil = [0.683, 0.954, 0.997][kk - 1];
    return (
      <div>
        <Hinweis>Innerhalb von μ ± σ, μ ± 2σ und μ ± 3σ liegen immer dieselben Anteile – egal wie μ und σ gewählt sind.</Hinweis>
        <svg viewBox="0 0 340 210" style={svgStil} role="img" aria-label="Sigma-Umgebungen der Normalverteilung">
          <Achsen k={k} schritt={s0} beschriften={false} ohneGitter />
          <path d={k.flaeche((t) => dichte(t, m0, s0), m0 - kk * s0, m0 + kk * s0)} fill={F.gold} stroke="none" />
          {kurve}
          {[-3, -2, -1, 0, 1, 2, 3].map((j) => <Txt key={j} x={k.px(m0 + j * s0)} y={k.py(0) + 14} gr={9.5} farbe={F.grau} fett={false}>{j === 0 ? "μ" : `μ${j > 0 ? "+" : "−"}${Math.abs(j) === 1 ? "" : Math.abs(j)}σ`}</Txt>)}
          <Txt x={k.px(m0)} y={k.py(dichte(m0, m0, s0) * 0.45)} farbe={F.gold3}>{`${z(anteil * 100)} %`}</Txt>
        </svg>
        <Umschalter label="Umgebung" wert={kk} setze={setKk} optionen={[[1, "μ ± σ"], [2, "μ ± 2σ"], [3, "μ ± 3σ"]]} />
        <Regler label="μ" wert={mu} setze={setMu} min={-3} max={3} schritt={0.5} anzeige={z(mu)} />
        <Regler label="σ" wert={s} setze={setS} min={0.5} max={3} schritt={0.25} anzeige={z(s)} />
        <Messzeile><M t={`P(\\mu - ${kk === 1 ? "" : kk}\\sigma \\le X \\le \\mu + ${kk === 1 ? "" : kk}\\sigma) \\approx ${z(anteil * 100)} \\%`.replace("\\%", "%")} /></Messzeile>
      </div>
    );
  }
  if (st) {
    const xx = mu + x * s;
    return (
      <div>
        <Hinweis>Standardisieren: z = (x − μ) / σ zählt, wie viele σ der Wert x von μ entfernt ist. Die Fläche links von z ist Φ(z).</Hinweis>
        <svg viewBox="0 0 340 210" style={svgStil} role="img" aria-label="Standardnormalverteilung mit Fläche links von z">
          <Achsen k={k} schritt={1} ohneGitter xName="z" yName="φ" />
          <path d={k.flaeche((t) => dichte(t, 0, 1), -4, x)} fill={F.gold} stroke="none" />
          {kurve}
          <line x1={k.px(x)} x2={k.px(x)} y1={k.py(0)} y2={k.py(dichte(x, 0, 1))} stroke={F.rosaKraeftig} strokeWidth="2" />
          <Txt x={k.px(x)} y={k.py(dichte(x, 0, 1)) - 8} farbe={F.rosaKraeftig}>z</Txt>
        </svg>
        <Regler label="μ" wert={mu} setze={setMu} min={-10} max={10} schritt={1} anzeige={z(mu)} />
        <Regler label="σ" wert={s} setze={setS} min={0.5} max={5} schritt={0.5} anzeige={z(s)} />
        <Regler label="z" wert={x} setze={setX} min={-3} max={3} schritt={0.1} anzeige={z(x)} />
        <Messzeile>
          <div><M t={`x = ${z(xx)}: \\quad z = \\frac{${z(xx)} - ${z(mu)}}{${z(s)}} = ${z(x)}`} /></div>
          <div><M t={`P(X \\le ${z(xx)}) = \\Phi(${z(x)}) \\approx ${z(Math.round(Phi(x) * 10000) / 10000)}`} /></div>
        </Messzeile>
      </div>
    );
  }
  /* Dichte */
  const k2 = koord({ x0: -8, x1: 8, y0: 0, y1: 0.85, w: 340, h: 210 });
  return (
    <div>
      <Hinweis>μ verschiebt die Glocke, σ macht sie breiter und flacher. Die Fläche darunter bleibt immer 1.</Hinweis>
      <svg viewBox="0 0 340 210" style={svgStil} role="img" aria-label="Dichtefunktion der Normalverteilung">
        <Achsen k={k2} schritt={2} ySchritt={0.2} ohneGitter />
        <path d={k2.flaeche((t) => dichte(t, mu, s), -8, 8)} fill={F.blau} fillOpacity="0.6" stroke="none" />
        <path d={k2.kurve((t) => dichte(t, mu, s))} fill="none" stroke={F.see} strokeWidth="2.6" />
        <line x1={k2.px(mu)} x2={k2.px(mu)} y1={k2.py(0)} y2={k2.py(dichte(mu, mu, s))} stroke={F.rosaKraeftig} strokeDasharray="4 3" />
        <line x1={k2.px(mu - s)} x2={k2.px(mu + s)} y1={k2.py(dichte(mu + s, mu, s))} y2={k2.py(dichte(mu + s, mu, s))} stroke={F.gold3} strokeWidth="2" />
        <Txt x={k2.px(mu)} y={k2.py(dichte(mu, mu, s)) - 8} farbe={F.rosaKraeftig}>μ</Txt>
        <Txt x={k2.px(mu + s) + 6} y={k2.py(dichte(mu + s, mu, s)) + 4} anker="start" farbe={F.gold3} gr={11}>σ</Txt>
      </svg>
      <Regler label="μ" wert={mu} setze={setMu} min={-4} max={4} schritt={0.5} anzeige={z(mu)} />
      <Regler label="σ" wert={s} setze={setS} min={0.5} max={3} schritt={0.25} anzeige={z(s)} />
      <Messzeile><M t={`\\varphi(x) = \\frac{1}{${z(s)} \\sqrt{2\\pi}} \\cdot e^{-\\frac{1}{2}\\left(\\frac{x - ${z(mu)}}{${z(s)}}\\right)^2}, \\quad \\varphi(\\mu) \\approx ${z(Math.round(dichte(mu, mu, s) * 1000) / 1000)}`} /></Messzeile>
    </div>
  );
}

export const BILDER_10 = {
  koordinatenPunkt: (p) => <KoordinatenPunkt {...p} />,
  geradenPaar: (p) => <GeradenPaar {...p} />,
  winkelArten: (p) => <WinkelArten {...p} />,
  winkelPaar: (p) => <WinkelPaar {...p} />,
  vieleckWinkel: (p) => <VieleckWinkel {...p} />,
  dreieckLinien: (p) => <DreieckLinien {...p} />,
  kongruenzBild: (p) => <KongruenzBild {...p} />,
  spiegelung: (p) => <Spiegelung {...p} />,
  flaechenModell: (p) => <FlaechenModell {...p} />,
  zusammengesetzt: (p) => <Zusammengesetzt {...p} />,
  quaderNetz: (p) => <QuaderNetz {...p} />,
  funktionsGraph: (p) => <FunktionsGraph {...p} />,
  wurzelQuadrat: (p) => <WurzelQuadrat {...p} />,
  streckung: (p) => <Streckung {...p} />,
  kathetensatz: (p) => <Kathetensatz {...p} />,
  vierecke: (p) => <Vierecke {...p} />,
  raumdiagonale: (p) => <Raumdiagonale {...p} />,
  normalKurve: (p) => <NormalKurve {...p} />,
};
