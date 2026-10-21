/* ======================================================================
   NORMALENFORM UND HESSESCHE NORMALENFORM (22.10.2026) – Ansicht „hesse“, Pfad /normalenform
   Themenseite nach dem Vorbild Differenzenquotient, aufgebaut wie die Hubs (linkes Menü, rechts der Inhalt):
     1 Normalenvektor      – senkrecht auf jedem Vektor der Ebene; aus der Koordinatenform ablesen
     2 Normalenform        – (x − a) · n = 0: warum genau die Punkte der Ebene die Gleichung erfüllen
     3 Hessesche Normalenform – n auf Länge 1: derselbe Wert ist jetzt der Abstand des Punktes
   Jeder Teil: Leitfrage, Herleitung, 3D-Bild zum Ziehen (dieselbe Beispiel-Ebene x₁ + 2x₂ + 2x₃ = 7),
   dann „Jetzt selbst üben“ mit Aufgaben aus hesseKern.js (reine Logik, getestet).
   Keine base-Datei darf diese Datei importieren.
   ====================================================================== */
import React, { useRef, useState } from "react";
import { C, HESSE_VIDEO_ID } from "./base1.jsx";
import { ErklaerVideo } from "./func1.jsx";
import { M, Text } from "./func3.jsx";
import { DrehKnoepfe, FARBE_ACHSE, ebenenPolygon, kamera } from "./func16.jsx";
import { Einzeilig, SpaltenVektor, VecName } from "./func19.jsx";
import { Knopf, Meldung } from "./func23.jsx";
import { MatheFeld } from "./matheTastatur.jsx";
import { BUEHNE, BUEHNE_SVG, FallWahl, HauptKnopf, Legende, ModusReiter, RSchritt, Rechenweg, ReglerSpalten, Tafel, VF, VekArbeit, VekSeite } from "./vekUi.jsx";
import { FeinKarte, useDesktop } from "./arbeitsflaeche.jsx";
import { springe } from "./sprung.js";
import { BEISPIEL, koordText, minus, neueAufgabe, normalenWert, pruefe, punktInEbene, punktNeben, skalar, diff } from "./hesseKern.js";

const FN = VF.drei;          // Normalenvektor: Smaragd (Ergebnisfarbe)
const FA = VF.eins;          // Punkt A, Ebene: Blau
const FX = VF.zweiText;      // Punkt X / P und der Verbindungsvektor: Gold
const fliess = { color: C.grau, fontSize: 15, fontWeight: 300, lineHeight: 1.8, margin: "0 0 14px" };
const leitfrage = { fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.25, color: C.tinte, margin: "0 0 14px" };
const kicker = { fontSize: 13, fontWeight: 600, color: C.gruenDunkel, margin: "0 0 8px" };

const Vek = ({ w, farbe = C.tinte }) => <SpaltenVektor farbe={farbe} eintraege={w.map((x, i) => <span key={i}>{typeof x === "number" ? minus(x) : x}</span>)} />;
const Name = ({ t, farbe = C.tinte }) => <VecName t={t} idx="" farbe={farbe} />;
const kl = (x) => (x < 0 ? `(${minus(x)})` : minus(x));
/* Linke Seite der Koordinatenform minus d als TeX-Zähler der HNF: „x_1 + 2x_2 − 2x_3 − 7“ */
function koordTex(n, d) {
  const teile = [];
  n.forEach((k, i) => {
    if (k === 0) return;
    const betrag = Math.abs(k) === 1 ? "" : String(Math.abs(k));
    teile.push(`${teile.length ? (k < 0 ? "− " : "+ ") : (k < 0 ? "−" : "")}${betrag}x_${i + 1}`);
  });
  if (d !== 0) teile.push(`${d < 0 ? "+ " : "− "}${Math.abs(d)}`);
  return teile.join(" ") || "0";
}

/* ---------- 3D-Bild: Ebene, Normalenvektor, Punkt X in der Ebene, Punkt P daneben ----------
   s, t: Lage von X in der Ebene (X = A + s·u + t·v); h: P = X + h·n (h = 0 → P = X in der Ebene).
   zeige: { verbindung, lot } */
function HesseBild({ s, t, h = 0, zeige = {}, legende }) {
  const B = BEISPIEL;
  const W = 360, H = 300;
  const [phi, setPhi] = useState(0.62);
  const [theta, setTheta] = useState(0.42);
  const X = punktInEbene(s, t), P = punktNeben(s, t, h);
  const A = B.A;
  /* Ausschnitt: mindestens ±4 (die Vektoren bei A bleiben groß), sonst so weit, dass P im Bild bleibt */
  const L = Math.max(4, ...P.map((x) => Math.abs(x) + 0.5));
  const sk = (Math.min(W, H) / 2 - 16) / (L * 1.2);
  const cam = kamera(phi, theta);
  const P2 = (p) => { const q = cam.proj(p); return [W / 2 + sk * q.u, H / 2 - sk * q.v]; };
  const pfad = (pts) => pts.map((p, i) => `${i ? "L" : "M"}${P2(p)[0].toFixed(1)},${P2(p)[1].toFixed(1)}`).join(" ") + " Z";
  const poly = ebenenPolygon(B.n, B.d, L);
  const ziehen = useRef(null);
  const start = (e) => { ziehen.current = { x: e.clientX, y: e.clientY, phi, theta }; e.currentTarget.setPointerCapture?.(e.pointerId); };
  const bewege = (e) => {
    if (!ziehen.current) return;
    setPhi(ziehen.current.phi - (e.clientX - ziehen.current.x) * 0.01);
    setTheta(Math.max(-1.35, Math.min(1.35, ziehen.current.theta + (e.clientY - ziehen.current.y) * 0.01)));
  };
  const ende = () => { ziehen.current = null; };
  const pfeil = (von, nach, farbe, id, breite = 3.2) => {
    const [x1, y1] = P2(von), [x2, y2] = P2(nach);
    return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={farbe} strokeWidth={breite} strokeLinecap="round" markerEnd={`url(#${id})`} />;
  };
  const punkt = (p, label, farbe) => {
    const [x, y] = P2(p);
    return (
      <g>
        <circle cx={x} cy={y} r="5.2" fill={farbe} stroke={C.weiss} strokeWidth="1.8" />
        <text x={x + 8} y={y - 7} fontSize="13" fontWeight="800" fill={farbe} stroke="#fff" strokeWidth="3" paintOrder="stroke">{label}</text>
      </g>
    );
  };
  const marker = (id, farbe) => (
    <marker id={id} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill={farbe} /></marker>
  );
  const verschieden = h !== 0;
  return (
    <div style={BUEHNE} data-hesse-bild="">
      <svg viewBox={`0 0 ${W} ${H}`} style={BUEHNE_SVG} onPointerDown={start} onPointerMove={bewege} onPointerUp={ende} onPointerLeave={ende}>
        <defs>
          {[0, 1, 2].map((i) => <marker key={i} id={`hs${i}`} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill={FARBE_ACHSE[i]} /></marker>)}
          {marker("hsN", FN)}{marker("hsW", FX)}
        </defs>
        {[0, 1, 2].map((i) => {
          const a = [0, 0, 0], b = [0, 0, 0], l = [0, 0, 0];
          a[i] = -L; b[i] = L * 1.12; l[i] = L * 1.24;
          const [x1, y1] = P2(a), [x2, y2] = P2(b), [lx, ly] = P2(l);
          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={FARBE_ACHSE[i]} strokeWidth="1.4" markerEnd={`url(#hs${i})`} opacity="0.7" />
              <text x={lx} y={ly + 4} textAnchor="middle" fontSize="12.5" fontWeight="700" fontStyle="italic" fill={FARBE_ACHSE[i]}>x{["₁", "₂", "₃"][i]}</text>
            </g>
          );
        })}
        {poly.length >= 3 && <path d={pfad(poly)} fill={FA} fillOpacity="0.14" stroke={FA} strokeOpacity="0.6" strokeWidth="1.3" strokeLinejoin="round" />}
        {(() => { const [x, y] = P2([0, 0, 0]); return <circle cx={x} cy={y} r="2.5" fill={C.tinte} />; })()}
        {/* Normalenvektor n an A */}
        {pfeil(A, A.map((a, i) => a + B.n[i]), FN, "hsN", 3.6)}
        {/* Verbindungsvektor A → X bzw. A → P */}
        {zeige.verbindung && pfeil(A, P, FX, "hsW")}
        {/* Lot von P auf die Ebene (Fußpunkt X) */}
        {zeige.lot && verschieden && (() => { const [x1, y1] = P2(P), [x2, y2] = P2(X);
          return <g><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={FN} strokeWidth="2.4" strokeDasharray="5 4" /><circle cx={x2} cy={y2} r="3.4" fill={C.weiss} stroke={FN} strokeWidth="2" /></g>; })()}
        {punkt(A, "A", FA)}
        {punkt(P, zeige.lot ? "P" : "X", FX)}
        {(() => { const [x, y] = P2(A.map((a, i) => a + B.n[i] * 1.18)); return <text x={x} y={y + 4} textAnchor="middle" fontSize="13.5" fontWeight="800" fontStyle="italic" fill={FN} stroke="#fff" strokeWidth="3" paintOrder="stroke">n</text>; })()}
      </svg>
      {legende && <Legende eintraege={legende} stil={{ position: "absolute", left: 10, top: 10, maxWidth: "calc(50% - 30px)", pointerEvents: "none" }} />}
      <DrehKnoepfe setPhi={setPhi} setTheta={setTheta} zuruecksetzen={() => { setPhi(0.62); setTheta(0.42); }} />
    </div>
  );
}

/* Regler für s, t (und h): + oben, Wert in der Mitte, − unten – wie überall in den Vektor-Werkzeugen */
function Regler({ s, setS, t, setT, h, setH }) {
  const spalte = (key, name, wert, setze, farbe, min, max) => ({
    key, farbe,
    plus: () => setze(Math.min(max, wert + 1)), minus: () => setze(Math.max(min, wert - 1)),
    plusLabel: `${name} erhöhen`, minusLabel: `${name} verringern`,
    mitte: <span style={{ fontSize: 15.5, fontWeight: 800, color: farbe, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{name} = {minus(wert)}</span>,
  });
  const spalten = [spalte("s", "s", s, setS, FX, -2, 2), spalte("t", "t", t, setT, FX, -2, 2)];
  if (setH) spalten.push(spalte("h", "h", h, setH, FN, -2, 2));
  return (
    <FeinKarte style={{ padding: "12px 12px 10px" }}>
      <div style={{ maxWidth: setH ? 300 : 200, margin: "0 auto" }}><ReglerSpalten spalten={spalten} /></div>
    </FeinKarte>
  );
}

/* Live-Rechnung unter dem Bild: (x − a) · n mit den aktuellen Zahlen */
function LiveRechnung({ P, hnf = false }) {
  const px = hnf ? "p" : "x";   // in Teil 3 heißt der Punkt P
  const B = BEISPIEL;
  const w = diff(B.A, P);
  const { wert, hnf: wertHnf, abstand } = normalenWert(P);
  const null_ = wert === 0;
  return (
    <div style={{ marginTop: 10 }}>
      <Einzeilig max={16}>
        <span>(</span><Name t={px} farbe={FX} /><span>−</span><Name t="a" farbe={FA} /><span>) ·</span><Name t="n" farbe={FN} /><span>=</span>
        <span>(</span><Vek w={P} farbe={FX} /><span>−</span><Vek w={B.A} farbe={FA} /><span>) ·</span><Vek w={B.n} farbe={FN} />
      </Einzeilig>
      <div style={{ height: 6 }} />
      <Einzeilig max={16}>
        <span>=</span><Vek w={w} farbe={FX} /><span>·</span><Vek w={B.n} farbe={FN} /><span>=</span>
        <span>{w.map((x, i) => `${kl(x)}·${B.n[i]}`).join(" + ")}</span><span>=</span>
        <span style={{ color: null_ ? FN : C.signal, fontSize: "1.15em" }}>{minus(wert)}</span>
      </Einzeilig>
      {hnf && (
        <>
          <div style={{ height: 6 }} />
          <Einzeilig max={16}>
            <span>(</span><Name t={px} farbe={FX} /><span>−</span><Name t="a" farbe={FA} /><span>) ·</span><Name t="n₀" farbe={FN} /><span>=</span>
            <span>{minus(wert)} : {B.L}</span><span>=</span><span style={{ color: null_ ? FN : C.signal, fontSize: "1.15em" }}>{minus(wertHnf)}</span>
          </Einzeilig>
        </>
      )}
      <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, margin: "10px 0 0" }}>
        {hnf
          ? (null_ ? <>P liegt in der Ebene: Der Wert ist 0, der Abstand auch.</>
            : <>Der Wert <b style={{ color: C.tinte }}>{minus(wertHnf)}</b> ist genau <b style={{ color: C.tinte }}>{abstand}</b> – die Länge des Lots. Das Vorzeichen sagt, auf welcher Seite der Ebene P liegt ({wertHnf > 0 ? "in Richtung von n" : "entgegen n"}).</>)
          : (null_ ? <>Das Skalarprodukt ist <b style={{ color: C.tinte }}>0</b>: Der Verbindungsvektor liegt in der Ebene und steht senkrecht auf n – X erfüllt die Gleichung.</>
            : <>Das Skalarprodukt ist <b style={{ color: C.tinte }}>{minus(wert)} ≠ 0</b>: Der Verbindungsvektor zeigt aus der Ebene heraus – X liegt nicht in E.</>)}
      </p>
    </div>
  );
}

/* ---------- Übungen ---------- */

const feldStil = (farbe = C.see, breite = 64) => ({ width: breite, height: 38, textAlign: "center", fontSize: 15, fontWeight: 800, fontFamily: "inherit", color: farbe,
  border: `1.5px solid ${farbe}55`, borderRadius: 9, background: `${farbe}0D`, outline: "none" });

const AUFGABEN = {
  ablesen: { name: "Normalenvektor ablesen", frage: (a) => <>Lies aus der Koordinatenform einen Normalenvektor ab: <b>E: {koordText(a.n, a.d)}</b></> },
  koordinatenform: { name: "d bestimmen", frage: (a) => <>E geht durch A({a.A.map(minus).join(" | ")}) mit Normalenvektor n = ({a.n.map(minus).join(" | ")}). Bestimme d in n · x = d, also die rechte Seite der Koordinatenform.</> },
  punktprobe: { name: "Punktprobe", frage: (a) => <>E: (x − a) · n = 0 mit A({a.A.map(minus).join(" | ")}) und n = ({a.n.map(minus).join(" | ")}). Berechne (p − a) · n für P({a.P.map(minus).join(" | ")}). Liegt P in E?</> },
  laenge: { name: "|n| berechnen", frage: (a) => <>Berechne die Länge des Normalenvektors n = ({a.n.map(minus).join(" | ")}).</> },
  abstand: { name: "Abstand mit der HNF", frage: (a) => <>E: {koordText(a.n, a.d)}. Berechne mit der Hesseschen Normalenform den Abstand von P({a.P.map(minus).join(" | ")}) zur Ebene.</> },
};

function Weg({ a }) {
  const S = ({ nr, titel, children }) => <RSchritt nr={nr} titel={titel}>{children}</RSchritt>;
  if (a.art === "ablesen") return (
    <Rechenweg>
      <S nr="1" titel="Koeffizienten vor x₁, x₂, x₃ – in dieser Reihenfolge, mit Vorzeichen">
        <Einzeilig max={16}><span>E: {koordText(a.n, a.d)}</span><span>⇒</span><Name t="n" farbe={FN} /><span>=</span><Vek w={a.n} farbe={FN} /></Einzeilig>
      </S>
      <S nr="2" titel="Jedes Vielfache ist auch ein Normalenvektor">
        <Einzeilig max={16}><span>z. B.</span><Vek w={a.n.map((x) => 2 * x)} farbe={FN} /><span>oder</span><Vek w={a.n.map((x) => -x)} farbe={FN} /></Einzeilig>
      </S>
    </Rechenweg>
  );
  if (a.art === "koordinatenform") return (
    <Rechenweg>
      <S nr="1" titel="d ist das Skalarprodukt a · n">
        <Einzeilig max={16}><span>d =</span><Vek w={a.A} farbe={FA} /><span>·</span><Vek w={a.n} farbe={FN} /><span>=</span><span>{a.A.map((x, i) => `${kl(x)}·${kl(a.n[i])}`).join(" + ")}</span></Einzeilig>
        <div style={{ height: 6 }} />
        <Einzeilig max={16}><span>=</span><span>{a.A.map((x, i) => kl(x * a.n[i])).join(" + ")}</span><span>=</span><span style={{ color: FN, fontSize: "1.15em" }}>{minus(a.d)}</span></Einzeilig>
      </S>
      <S nr="2" titel="Koordinatenform">
        <Einzeilig max={16}><span>E: {koordText(a.n, a.d)}</span></Einzeilig>
      </S>
    </Rechenweg>
  );
  if (a.art === "punktprobe") {
    const w = diff(a.A, a.P);
    return (
      <Rechenweg>
        <S nr="1" titel="Verbindungsvektor p − a">
          <Einzeilig max={16}><Vek w={a.P} farbe={FX} /><span>−</span><Vek w={a.A} farbe={FA} /><span>=</span><Vek w={w} farbe={FX} /></Einzeilig>
        </S>
        <S nr="2" titel="Skalarprodukt mit n">
          <Einzeilig max={16}><Vek w={w} farbe={FX} /><span>·</span><Vek w={a.n} farbe={FN} /><span>=</span><span>{w.map((x, i) => `${kl(x)}·${kl(a.n[i])}`).join(" + ")}</span><span>=</span><span style={{ color: a.liegt ? FN : C.signal, fontSize: "1.15em" }}>{minus(a.wert)}</span></Einzeilig>
        </S>
        <S nr="3" titel={a.liegt ? "0 – P liegt in E" : "≠ 0 – P liegt nicht in E"}>
          <p style={{ fontSize: 13.5, color: C.grau, lineHeight: 1.6, margin: 0 }}>{a.liegt ? "Der Verbindungsvektor steht senkrecht auf n, also liegt er in der Ebene." : "Der Verbindungsvektor hat einen Anteil in Richtung n – er zeigt aus der Ebene heraus."}</p>
        </S>
      </Rechenweg>
    );
  }
  if (a.art === "laenge") {
    const q = skalar(a.n, a.n);
    return (
      <Rechenweg>
        <S nr="1" titel="Komponenten quadrieren und addieren">
          <M t={`|n| = \\sqrt{${a.n.map((x) => `(${minus(x)})^2`).join(" + ")}} = \\sqrt{${a.n.map((x) => x * x).join(" + ")}} = \\sqrt{${q}}`} />
        </S>
        <S nr="2" titel="Wurzel ziehen">
          <M t={`|n| = \\sqrt{${q}} = ${a.loesung}`} />
        </S>
      </Rechenweg>
    );
  }
  if (a.art === "abstand") {
    const q = skalar(a.n, a.n);
    return (
      <Rechenweg>
        <S nr="1" titel="Länge des Normalenvektors">
          <M t={`|n| = \\sqrt{${a.n.map((x) => x * x).join(" + ")}} = \\sqrt{${q}} = ${a.L}`} />
        </S>
        <S nr="2" titel="Hessesche Normalenform: Koordinatenform durch |n| teilen">
          <M t={`\\frac{${koordTex(a.n, a.d)}}{${a.L}} = 0`} />
        </S>
        <S nr="3" titel="P einsetzen – der Wert ist der Abstand mit Vorzeichen">
          <Einzeilig max={16}><span>{a.n.map((x, i) => `${kl(x)}·${kl(a.P[i])}`).join(" + ")} − {kl(a.d)}</span><span>=</span><span>{minus(a.wert)}</span></Einzeilig>
          <div style={{ height: 6 }} />
          <M t={`d(P, E) = \\frac{|${minus(a.wert)}|}{${a.L}} = \\frac{${Math.abs(a.wert)}}{${a.L}} = ${a.loesung}`} />
        </S>
      </Rechenweg>
    );
  }
  return null;
}

/* Trainer: arten = Aufgabentypen dieses Teils (Chips), die Aufgabe kommt aus hesseKern.neueAufgabe */
function Trainer({ arten, titel }) {
  const [art, setArt] = useState(arten[0]);
  const [a, setA] = useState(() => neueAufgabe(arten[0]));
  const [eingabe, setEingabe] = useState(() => (arten[0] === "ablesen" ? ["", "", ""] : ""));
  const [erg, setErg] = useState(null);
  const [zaehler, setZaehler] = useState(1);
  const wechsle = (id) => { setArt(id); setA(neueAufgabe(id)); setEingabe(id === "ablesen" ? ["", "", ""] : ""); setErg(null); setZaehler(1); };
  const neu = () => { setA(neueAufgabe(art)); setEingabe(art === "ablesen" ? ["", "", ""] : ""); setErg(null); setZaehler((z) => z + 1); };
  const pruefen = () => setErg(pruefe(a, eingabe));
  const taste = (e) => { if (e.key === "Enter") { e.preventDefault(); pruefen(); } };
  return (
    <div data-hesse-trainer={art}>
      <p style={kicker}>Jetzt selbst üben</p>
      <h3 style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-0.015em", lineHeight: 1.25, color: C.tinte, margin: "0 0 12px" }}>{titel}</h3>
      {arten.length > 1 && (
        <div style={{ marginBottom: 12 }}>
          <FallWahl titel="Aufgabentyp" wert={art} setWert={wechsle} optionen={arten.map((id) => [id, AUFGABEN[id].name])} />
        </div>
      )}
      <Tafel titel={AUFGABEN[art].name} rechts={<span style={{ fontSize: 12.5, fontWeight: 600, color: C.grau, whiteSpace: "nowrap" }}>Aufgabe {zaehler}</span>} stil={{ marginTop: 0 }}>
        <p style={{ fontSize: 15, color: C.tinte, lineHeight: 1.65, margin: "0 0 14px" }}>{AUFGABEN[art].frage(a)}</p>
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {art === "ablesen" ? (
            <>
              <Name t="n" farbe={FN} /><span style={{ fontWeight: 800 }}>=</span>
              <span style={{ display: "inline-flex", alignItems: "stretch" }}>
                <span style={{ width: 7, borderLeft: `1.8px solid ${FN}`, borderTop: `1.8px solid ${FN}`, borderBottom: `1.8px solid ${FN}`, borderRadius: "8px 0 0 8px" }} />
                <span style={{ display: "inline-flex", flexDirection: "column", gap: 4, padding: "4px 4px" }}>
                  {[0, 1, 2].map((i) => (
                    <MatheFeld key={i} modus="ganzvz" value={eingabe[i]} aria-label={`n Komponente ${i + 1}`} onKeyDown={taste}
                      onChange={(e) => { const x = [...eingabe]; x[i] = e.target.value.replace(/[^0-9\-−]/g, "").slice(0, 3); setEingabe(x); setErg(null); }}
                      style={{ ...feldStil(FN, 52), height: 34 }} />
                  ))}
                </span>
                <span style={{ width: 7, borderRight: `1.8px solid ${FN}`, borderTop: `1.8px solid ${FN}`, borderBottom: `1.8px solid ${FN}`, borderRadius: "0 8px 8px 0" }} />
              </span>
            </>
          ) : (
            <>
              <span style={{ fontSize: 16, fontWeight: 800 }}>{art === "koordinatenform" ? "d =" : art === "punktprobe" ? "(p − a) · n =" : art === "laenge" ? "|n| =" : "d(P, E) ="}</span>
              <MatheFeld modus={art === "abstand" || art === "laenge" ? "zahl" : "ganzvz"} value={eingabe} aria-label="Ergebnis" placeholder={art === "abstand" ? "z. B. 3" : ""} onKeyDown={taste}
                onChange={(e) => { setEingabe(e.target.value.replace(/[^0-9,./\-−]/g, "").slice(0, 8)); setErg(null); }} style={feldStil(C.see, 96)} />
            </>
          )}
        </div>
        {erg && <Meldung art={erg.art}>{erg.text}</Meldung>}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <HauptKnopf onClick={pruefen}>Prüfen</HauptKnopf>
          <Knopf onClick={neu}>Neue Aufgabe</Knopf>
        </div>
        {erg && erg.art !== "warn" && (
          <details open={!erg.ok} style={{ marginTop: 14 }}>
            <summary style={{ cursor: "pointer", color: C.see, fontWeight: 600, fontSize: 14, padding: "6px 0" }}>Rechenweg</summary>
            <div style={{ marginTop: 10 }}><Weg a={a} /></div>
          </details>
        )}
      </Tafel>
    </div>
  );
}

/* ---------- Die drei Teile ---------- */

const Formel = ({ t }) => (
  <div style={{ fontSize: 17, lineHeight: 2.1, color: C.tinte, padding: "6px 4px", overflowX: "auto", margin: "4px 0 14px" }}><M t={t} /></div>
);

function TeilNormalenvektor() {
  const [s, setS] = useState(2), [t, setT] = useState(-1);
  const X = punktInEbene(s, t);
  const B = BEISPIEL;
  return (
    <div data-hesse-teil="normalenvektor">
      <h2 style={leitfrage}>Was macht einen Vektor zum Normalenvektor?</h2>
      <Text s="Ein Normalenvektor $n$ einer Ebene steht senkrecht auf der Ebene – und damit senkrecht auf jedem Vektor, der in der Ebene liegt. Senkrecht heißt in der Vektorrechnung: Das Skalarprodukt ist $0$. Das ist der ganze Trick, auf dem Normalenform und Hessesche Normalenform aufbauen." style={fliess} />
      <Text s="Im Bild ist $E$ die Ebene $x_1 + 2x_2 + 2x_3 = 7$ mit dem Normalenvektor $n = (1 \, | \, 2 \, | \, 2)$ im Punkt $A(1 \, | \, 1 \, | \, 2)$. Schieb den Punkt $X$ mit $s$ und $t$ durch die Ebene: Der Verbindungsvektor von $A$ nach $X$ liegt immer in $E$ – und sein Skalarprodukt mit $n$ ist immer $0$." style={fliess} />
      <div style={{ backgroundColor: C.weiss, borderRadius: 16, padding: 16, boxShadow: "0 2px 16px rgba(15,26,51,0.07)", margin: "18px 0" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.see, margin: "0 0 10px" }}>Schieb X durch die Ebene und dreh den Raum – das Skalarprodukt bleibt 0</p>
        <HesseBild s={s} t={t} zeige={{ verbindung: true }} legende={[{ text: "E", farbe: FA, art: "flaeche" }, { text: "n", farbe: FN }, { text: "A → X", farbe: FX }]} />
        <div style={{ marginTop: 10 }}><Regler s={s} setS={setS} t={t} setT={setT} /></div>
        <LiveRechnung P={X} />
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: C.tinte, margin: "22px 0 10px" }}>Den Normalenvektor ablesen</h3>
      <Text s="In der Koordinatenform $n_1 x_1 + n_2 x_2 + n_3 x_3 = d$ stehen die Komponenten von $n$ direkt vor $x_1$, $x_2$ und $x_3$. Für $E$: $n = (1 \, | \, 2 \, | \, 2)$. Die Zahl $d$ rechts gehört nicht zum Normalenvektor – sie verschiebt die Ebene nur." style={fliess} />
      <Text s="Ein Normalenvektor ist nie eindeutig: $2n$, $−n$ oder $\frac{1}{2} n$ stehen genauso senkrecht auf $E$. Erst bei der Hesseschen Normalenform wird die Länge wichtig – dort bringen wir $n$ auf Länge $1$." style={fliess} />
      <div style={{ height: 1, background: C.linie, margin: "26px 0 22px" }} />
      <Trainer arten={["ablesen"]} titel="Normalenvektor aus der Koordinatenform ablesen" />
    </div>
  );
}

function TeilNormalenform() {
  const [s, setS] = useState(2), [t, setT] = useState(-1), [h, setH] = useState(0);
  const P = punktNeben(s, t, h);
  return (
    <div data-hesse-teil="normalenform">
      <h2 style={leitfrage}>Warum beschreibt (x − a) · n = 0 genau die Ebene?</h2>
      <Text s="Nimm einen festen Punkt $A$ der Ebene und irgendeinen Punkt $X$. Der Verbindungsvektor $x − a$ zeigt von $A$ nach $X$. Liegt $X$ in der Ebene, liegt dieser Vektor in der Ebene – und steht senkrecht auf $n$: Skalarprodukt $0$. Liegt $X$ nicht in der Ebene, hat $x − a$ einen Anteil in Richtung $n$ – das Skalarprodukt ist dann nicht $0$." style={fliess} />
      <Text s="Die Gleichung $(x − a) \cdot n = 0$ wird also von genau den Punkten erfüllt, die in der Ebene liegen. Deshalb beschreibt sie die Ebene: Das ist die Normalenform. Sie braucht nur einen Punkt und eine Richtung – den Normalenvektor." style={fliess} />
      <Formel t="E: \ (\vec{x} − \vec{a}) \cdot \vec{n} = 0" />
      <div style={{ backgroundColor: C.weiss, borderRadius: 16, padding: 16, boxShadow: "0 2px 16px rgba(15,26,51,0.07)", margin: "18px 0" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.see, margin: "0 0 10px" }}>Heb X mit h aus der Ebene – sobald X nicht mehr in E liegt, ist das Skalarprodukt nicht mehr 0</p>
        <HesseBild s={s} t={t} h={h} zeige={{ verbindung: true, lot: false }} legende={[{ text: "E", farbe: FA, art: "flaeche" }, { text: "n", farbe: FN }, { text: "A → X", farbe: FX }]} />
        <div style={{ marginTop: 10 }}><Regler s={s} setS={setS} t={t} setT={setT} h={h} setH={setH} /></div>
        <LiveRechnung P={P} />
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: C.tinte, margin: "22px 0 10px" }}>Von der Normalenform zur Koordinatenform</h3>
      <Text s="Multipliziert man die Klammer aus, wird aus der Normalenform in einem Schritt die Koordinatenform. Die Zahl $d = a \cdot n$ ist fest, weil $A$ und $n$ fest sind:" style={fliess} />
      <Formel t="(\vec{x} − \vec{a}) \cdot \vec{n} = 0 \ \Leftrightarrow \ \vec{x} \cdot \vec{n} = \vec{a} \cdot \vec{n} \ \Leftrightarrow \ n_1 x_1 + n_2 x_2 + n_3 x_3 = d" />
      <Text s="Für unsere Ebene: $a \cdot n = 1 \cdot 1 + 1 \cdot 2 + 2 \cdot 2 = 7$, also $x_1 + 2x_2 + 2x_3 = 7$. Umgekehrt liest du aus jeder Koordinatenform sofort $n$ ab und brauchst nur noch einen Punkt, der die Gleichung erfüllt." style={fliess} />
      <div style={{ height: 1, background: C.linie, margin: "26px 0 22px" }} />
      <Trainer arten={["koordinatenform", "punktprobe"]} titel="Mit der Normalenform rechnen" />
    </div>
  );
}

function TeilHesse() {
  const [s, setS] = useState(2), [t, setT] = useState(-1), [h, setH] = useState(1);
  const P = punktNeben(s, t, h);
  return (
    <div data-hesse-teil="hnf">
      <h2 style={leitfrage}>Was passiert, wenn n die Länge 1 bekommt?</h2>
      <Text s="Teilt man die Normalenform durch $|n|$, ändert sich an der Ebene nichts: Die Punkte, die $0$ ergeben, bleiben dieselben. Aber der Wert, den die linke Seite für einen Punkt $P$ außerhalb liefert, bekommt jetzt eine Bedeutung. Mit $n_0 = \frac{n}{|n|}$ (Länge $1$) gilt:" style={fliess} />
      <Formel t="(\vec{p} − \vec{a}) \cdot \vec{n}_0 = |\vec{p} − \vec{a}| \cdot \cos\varphi" />
      <Text s="Das ist der Anteil des Verbindungsvektors in Richtung von $n$ – also genau die Länge des Lots von $P$ auf die Ebene, mit Vorzeichen. Die Gleichung mit dem Einheits-Normalenvektor heißt Hessesche Normalenform (HNF). Für unsere Ebene ist $|n| = \sqrt{1 + 4 + 4} = 3$:" style={fliess} />
      <Formel t="E: \ \frac{x_1 + 2x_2 + 2x_3 − 7}{3} = 0 \qquad d(P, E) = \frac{|p_1 + 2p_2 + 2p_3 − 7|}{3}" />
      <div style={{ backgroundColor: C.weiss, borderRadius: 16, padding: 16, boxShadow: "0 2px 16px rgba(15,26,51,0.07)", margin: "18px 0" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.see, margin: "0 0 10px" }}>Heb P mit h über die Ebene – der HNF-Wert ist die Länge des Lots (hier 3 · h, weil |n| = 3)</p>
        <HesseBild s={s} t={t} h={h} zeige={{ verbindung: true, lot: true }} legende={[{ text: "E", farbe: FA, art: "flaeche" }, { text: "n", farbe: FN }, { text: "A → P", farbe: FX }, { text: "Lot", farbe: FN }]} />
        <div style={{ marginTop: 10 }}><Regler s={s} setS={setS} t={t} setT={setT} h={h} setH={setH} /></div>
        <LiveRechnung P={P} hnf />
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: C.tinte, margin: "22px 0 10px" }}>So rechnest du den Abstand</h3>
      <Text s="Erstens $|n|$ berechnen, zweitens die Koordinatenform durch $|n|$ teilen, drittens $P$ einsetzen und den Betrag nehmen. Der Betrag ist der Abstand, das Vorzeichen davor sagt, auf welcher Seite der Ebene $P$ liegt." style={fliess} />
      <Formel t="d(P, E) = \frac{|n_1 p_1 + n_2 p_2 + n_3 p_3 − d|}{\sqrt{n_1^2 + n_2^2 + n_3^2}}" />
      <div style={{ height: 1, background: C.linie, margin: "26px 0 22px" }} />
      <Trainer arten={["laenge", "abstand"]} titel="Abstand eines Punktes mit der HNF" />
    </div>
  );
}

/* ---------- Seite ---------- */

const TEILE = [
  { id: "normalenvektor", name: "1 · Normalenvektor", kurz: "Normalen­vektor", bild: "normale", Teil: TeilNormalenvektor },
  { id: "normalenform", name: "2 · Normalenform", kurz: "Normalen­form", bild: "ebene", Teil: TeilNormalenform },
  { id: "hnf", name: "3 · Hessesche Normalenform", kurz: "Hesse (HNF)", bild: "abstand", Teil: TeilHesse },
];

export function HesseNormalenform({ gehe }) {
  const [teil, setTeil] = useState("normalenvektor");
  const desktop = useDesktop();
  const T = TEILE.find((x) => x.id === teil) || TEILE[0];
  const modi = TEILE.map((x) => ({ id: x.id, name: desktop ? x.name : x.kurz, bild: x.bild }));
  const seitenText = "Drei Schritte, ein Gedanke: Der Normalenvektor steht senkrecht auf der Ebene, deshalb ist (x − a) · n = 0 für jeden Punkt der Ebene – und mit |n| = 1 liefert dieselbe Rechnung den Abstand jedes anderen Punktes.";
  const weiter = (
    <FallWahl titel="Weiter" wert={null} setWert={(ziel) => gehe && gehe({ ansicht: ziel })}
      optionen={[["abstaende", "Alle Abstände", "lot"], ["ebenevsebene", "Zwei Ebenen", "ee-schnitt"], ["dreipunkte", "Ebenen", "dreipunkte"]]} />
  );
  const naechster = TEILE[TEILE.findIndex((x) => x.id === teil) + 1];
  const inhalt = (
    <div key={T.id}>
      {teil === "normalenvektor" && <div style={{ marginBottom: 20 }}><ErklaerVideo id={HESSE_VIDEO_ID} titel="Ebenen in drei Formen" /></div>}
      <T.Teil />
      {naechster && (
        <div style={{ marginTop: 22, display: "flex", justifyContent: "flex-end" }}>
          <Knopf gold onClick={() => { setTeil(naechster.id); springe("hesse-teil", () => window.scrollTo({ top: 0, behavior: "smooth" })); }}>{`Weiter: ${naechster.name.replace(/^\d · /, "")} ›`}</Knopf>
        </div>
      )}
    </div>
  );

  if (desktop) {
    return (
      <VekSeite titel="Normalenform und Hessesche Normalenform" text={seitenText}>
        <div data-hesse="breit">
          <VekArbeit
            links={<>
              <div data-hesse-menue=""><ModusReiter label="Teil wählen" wert={teil} setWert={setTeil} stapel modi={modi} /></div>
              <FeinKarte>{weiter}</FeinKarte>
            </>}
            rechts={inhalt} />
        </div>
      </VekSeite>
    );
  }
  return (
    <VekSeite titel="Normalenform und Hessesche Normalenform" text={seitenText}>
      <div data-hesse-menue=""><ModusReiter label="Teil wählen" wert={teil} setWert={setTeil} modi={modi} /></div>
      {inhalt}
      <div style={{ marginTop: 22 }}>{weiter}</div>
    </VekSeite>
  );
}
